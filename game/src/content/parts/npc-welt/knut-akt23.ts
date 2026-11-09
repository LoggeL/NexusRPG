// Knut in Akt 2, Akt 3 und im Nachspiel (world.md §5.3–5.5). Akt 2: Abziehen lohnt nicht mehr, seit die Chips „Master“
// sagen; Mama und der Chrome-10-Promoter; Anzüge für die Releaseparty. Partynacht, Nachspiel je Ende, freitags und
// samstags abends Kellner am Strandclub (strandclub_personal_knut aus side-strandclub), Master-Modus.
// Wird von knut.ts in NpcDef.talk/schedule eingehängt.
import type { ContentPart } from '../../part';
import type { Condition, ScheduleEntry, TalkDef } from '../../../modules/contracts';
import { dialog, erz, herz, knoten, ort, rede, sammle, sprecher } from './_welt';
import {
  A2_PARTY, CLUB_OFFEN, ENDE_3B, ENDE_MEER, ENDE_NEXUS, MASTER, NACHSPIEL, NUR_AKT2, PARTYNACHT, einmal, folge, gesehen, kurz,
} from './akt23-phasen';

const ID = 'knut';
const KN = sprecher(ID);
const KU = sprecher('kurt');
const ALT = 'knut-tag-standard';
/** Kellner am Strandclub (Zusage per Telefon in side-strandclub), nicht nach dem Lockvogel-Weg. */
export const KELLNER: Condition = {
  all: [NACHSPIEL, CLUB_OFFEN, { flag: 'strandclub_personal_knut' }, { notFlag: 'ab_lockvogel' }],
};

const a2 = folge('knut-a2', [
  erz('Knut und Kurt lehnen am Bahnsteig, beide mit verschränkten Armen. Vor ihnen laufen Leute mit glitzernden Chips hinterm Ohr vorbei. Knut sieht ihnen nach wie ein Fuchs, dem man das Huhn mit Stacheldraht umwickelt hat.'),
  KN('Na? Weißt du, was das Schlimmste an Chrome 10 ist? Jeder hat jetzt was hinterm Ohr. Neu. Glänzend. Wertvoll.'),
  KN('Und ich trau mich nicht ran.'),
], KN('Sonst noch was? Kurt guckt schon wieder so. Er denkt, es geht um ihn.'), [
  { id: 'master', text: '„Warum traust du dich nicht?“', zeilen: [
    KN('Ich hab’s versucht. Einmal. Typ am Gleis drei. Ich greif hinters Ohr, ganz sanft, wie Mama es mir beigebracht hat. Und der Chip … der Chip sagt: „Guten Tag, Master.“', 'besorgt'),
    KN('Zu MIR! Der Chip! Ich hab losgelassen, als wär der heiß. Kurt hat geschrien. Der Typ hat sich bedankt. Für den Versuch.'),
    KU('Das sag ich meiner Mama!'),
    KN('Hast du schon, Kurt. Dreimal.'),
  ] },
  { id: 'mama', text: '„Und eure Mama? Hat die auch so ein Ding?“', zeilen: [
    KN('Mama? Da war ein Promoter im Treppenhaus. Pastell, Lächeln, Tablett mit Chips. „Gratis-Test, gnädige Frau.“'),
    KN('Mama hat das Nudelholz geholt. Der Promoter liegt jetzt im Kanal-Sammler. Fluss-Frieda hat ihn rausgefischt und für fünf Credits zurückverkauft. An Quantum.', 'freude'),
    KU('Mama ist die Beste!'),
    KN('Ja, Kurt. Das sag ich ihr auch mal.'),
  ] },
  { id: 'party', text: '„Wir gehen auf die Releaseparty.“', when: A2_PARTY, zeilen: [
    KN('Braucht ihr Leibwächter? Wir haben Anzüge. Von der Beerdigung von Onkel Bernd. Die sitzen an den Schultern ein bisschen. Also: Sie platzen.'),
    KU('Ich hab eine Fliege!'),
    KN('Kurt hat eine Fliege. Er knotet sie wie eine Krawatte. Das ist dann so ein Stil. Bruno sagt, das ist Avantgarde.'),
  ], effects: [herz(ID, 10)] },
], ALT, 'Grüß deine Mama.');

const partynacht = kurz('knut-partynacht', [
  erz('Knut steht da, wo er immer steht, aber er macht nichts. Er guckt auf ein Telefon, das Kurt ihm vors Gesicht hält. Auf dem Display: die Releaseparty.'),
  KN('Guck dir die Ohrringe an. Die von der in Gold. Die sind so viel wert wie der ganze Bahnhof.'),
  KN('… Ich hab nicht dran gedacht, sie abzuziehen. Ehrlich. Nur kurz. Ich bin ein anständiger Mensch geworden. Das ist alles deine Schuld.', 'verlegen'),
]);

const nachspiel = dialog('knut-nachspiel', [
  knoten('start', [
    erz('Knut trägt ein weißes Hemd. Mit Kragen. Er hält ein Tablett, auf dem nichts steht, und balanciert es zur Übung auf drei Fingern. Kurt steht daneben und applaudiert jedes Mal, wenn es nicht runterfällt.'),
    KN('Na? Ich übe. Kellnern. Man trägt Sachen zu Leuten und kriegt Geld dafür. Freiwillig. Die geben es FREIWILLIG.', 'freude'),
    KU('Das sag ich meiner Mama! Aber im Guten!'),
  ], {
    effects: [gesehen('knut-nachspiel'), herz(ID, 20)],
    choices: [
      { text: '„Kellnert ihr am Strand?“', when: KELLNER, next: 'strand' },
      { text: '„Die Chips sind weg. Wird wieder abgezogen?“', when: ENDE_MEER, next: 'meer' },
      { text: '„Nexus redet jetzt freundlich. Auch mit euch?“', when: ENDE_NEXUS, next: 'nexus' },
      { text: '„Ich war eine Weile nicht so beliebt bei euch.“', when: ENDE_3B, next: 'dreib' },
      { text: '„Was sagt eure Mama?“', next: 'mama' },
    ],
  }),
  knoten('strand', [
    KN('Freitags und samstags, abends. Wir geben das Wechselgeld zurück. Fast immer. Kurt sagt, ich soll „immer“ sagen. Immer.'),
    KU('Immer!'),
    KN('Gestern hat mir eine Frau Trinkgeld gegeben und gesagt, ich hab ein ehrliches Gesicht. Ich hab mich im Klo eingeschlossen und geheult. Kurt hat Wache gestanden.'),
  ], { next: 'mama' }),
  knoten('meer', [
    KN('Nee. Die Leute haben keine Chips mehr hinterm Ohr. Die haben jetzt Narben. Kleine. Da zieht man nichts ab. Da guckt man weg. Das hab ich gelernt.'),
  ], { next: 'mama' }),
  knoten('nexus', [
    KN('Eine Drohne ist zu Mama gekommen. Hat sich entschuldigt. Für den Promoter. Mama hat das Nudelholz geholt. Die Drohne hat gewartet.', 'ueberrascht'),
    KN('Dann hat Mama sie reingelassen und ihr Kekse angeboten. Die Drohne kann keine Kekse essen. Sie hat einen genommen. Aus Höflichkeit. Mama sagt, die hat Manieren. Mehr als wir.'),
  ], { next: 'mama' }),
  knoten('dreib', [
    KN('Nee. Warst du nicht. Mama hat gesagt, wir reden nicht mehr mit dir. Kurt hat geweint. Ich auch. Ein bisschen.', 'trauer'),
    KU('Ich hab’s ihr gesagt! Dass du wieder da bist!'),
    KN('Und Mama hat gesagt: „Dann bringt den Menschen zum Essen mit.“ Sonntag. Sie macht Klöße. Komm. Sonst kommt sie dich holen.'),
  ], { next: 'mama', effects: [herz(ID, 40), herz('kurt', 20)] }),
  knoten('mama', [
    KN('Mama hat ein Foto von uns beiden im Kellnerhemd an den Kühlschrank geklebt. Neben das vom Kindergarten. Das ist bei ihr die Hall of Fame.', 'zaertlich'),
  ]),
]);

const nachspielTag = folge('knut-nachspiel-tag', [
  KN('Na? Hübsches Ohr. Behalt’s. Ich bin jetzt Gastronomie.'),
], KN('Sonst noch was? Ich muss noch Tablett üben. Mit Gläsern. Kurt hat Angst um die Gläser.'), [
  { id: 'trinkgeld', text: '„Wie läuft’s mit dem Trinkgeld?“', when: KELLNER, zeilen: [
    KN('Zweihundert die Woche. Ehrlich verdient. Mama legt es in eine Dose. Auf der Dose steht „Für später“. Ich weiß nicht, was später ist. Aber ich hab jetzt eins.'),
  ] },
], ALT, 'Grüß deine Mama.');

const master = kurz('knut-master', [
  erz('Knut stellt sich vor Kurt, als du kommst. Breit. Die Arme verschränkt. Kurt lugt hinter seiner Schulter hervor.'),
  KN('Mama sagt, wir reden nicht mehr mit dir. Mama sagt, wer andere „Master“ nennen lässt, ist schlimmer als ein Abzieher. Wir ziehen nur Ohren ab. Du ziehst Leute ab.', 'wut'),
  KU('Das sag ich meiner Mama!'),
  KN('Hat er schon, Kurt. Darum stehen wir hier so.'),
]);

const dialogues = sammle(a2, partynacht, nachspiel, nachspielTag, master);

/** Talk-Einträge vor dem alten Tagesgespräch (nach Rivale und Erstbegegnung). */
export const TALK_23: TalkDef[] = [
  rede('knut-master', MASTER),
  rede('knut-nachspiel', einmal('knut-nachspiel', NACHSPIEL)),
  rede('knut-nachspiel-tag', NACHSPIEL),
  rede('knut-partynacht', PARTYNACHT),
  rede('knut-a2', NUR_AKT2),
];

/** Nachspiel: freitags und samstags abends Kellner am Strandclub. */
export const SCHEDULE_23: ScheduleEntry[] = [
  ort('A', 'das-meer', 'strandclub', { days: ['fr', 'sa'], when: KELLNER }),
];

export const part: ContentPart = { dialogues };
