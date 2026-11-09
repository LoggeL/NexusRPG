// Frau Klingel in Akt 2, Akt 3 und im Nachspiel (world.md §5.3–5.5, §6.3 Nr. 34). Beta-Chip-Trägerin aus
// side-ki-fluestern (Flag ki_fluestern_klingel_frei): gechippt spielt ihr Ohr nur noch Chrome 10. Danach Radio Rost als
// Nachrichtenquelle (ohne klingel_kalibriert), ein Taschenglöckchen für die Party, Partynacht im Ohr, Nachspiel je Ende
// (Kurts Glocke läutet, wenn klingel_sonntag_laeuten), Master-Modus. Wird von frau-klingel.ts in NpcDef.talk eingehängt.
import type { ContentPart } from '../../part';
import type { Condition, TalkDef } from '../../../modules/contracts';
import { dialog, erz, herz, ich, knoten, rede, sammle, sprecher } from './_welt';
import {
  A2_PARTY, ARIA_GECHIPPT, BLADE_GEFASST, ENDE_3B, ENDE_MEER, ENDE_NEXUS, MASTER, NACHSPIEL, NUR_AKT2, PARTYNACHT, chipFrei,
  chipWahlen, einmal, folge, gechippt, gesehen, kurz, masterChip,
} from './akt23-phasen';

const ID = 'frau-klingel';
const K = sprecher(ID);
const RADIO = sprecher('narrator');
const KEY = 'klingel';
const FREI = chipFrei(KEY);
const KALIBRIERT: Condition = { flag: 'klingel_kalibriert' };
const RADIO_AN: Condition = { not: KALIBRIERT };
const GELAEUTET: Condition = { flag: 'klingel_sonntag_laeuten' };
const ALT = 'klingel-tag-standard';

// ------------------------------------------------------------------------------------------- Akt 2: gechippt

const gechipptDlg = dialog('klingel-a2-gechippt', [
  knoten('start', [
    erz('Am Glockenstand ist es still. Die Glocken hängen ordentlich nach Größe sortiert, poliert, keine schwingt. Frau Klingel steht davor und lächelt. Hinterm Ohr, neben dem alten Hörimplantat, blinkt ein neuer Chip.'),
    K('Willkommen, Master. Heute im Angebot: Ruhe. Ruhe ist eine ausgezeichnete Entscheidung.'),
    RADIO('Aus ihrem Ohr, leise und glatt: „… Chrome 10. Weil Sie es sich verdient haben. Chrome 10. Weil Sie es sich verdient haben. Chrome 10 …“'),
  ], {
    choices: [
      { text: '„WAS LÄUFT IN IHREM OHR, FRAU KLINGEL?“', next: 'radio' },
      ...chipWahlen(KEY),
      { text: '(Leise gehen. Es fühlt sich falsch an, hier laut zu sein.)' },
    ],
  }),
  knoten('radio', [
    K('Sie müssen nicht schreien, Master. Ich höre ausgezeichnet. Ich höre nur noch, was wichtig ist. Kein Wetter mehr. Keine Schlager. Nur noch das Angebot.'),
    erz('Ihre Hand wandert zu einer kleinen Kuhglocke, bleibt in der Luft hängen, als hätte sie vergessen, was Hände mit Glocken machen.'),
  ], { choices: [...chipWahlen(KEY), { text: '(Gehen.)' }] }),
  knoten('hinweis', [
    K('Ein netter Stand in den Glasarkaden. Kostenloser Hörtest. Ich wollte nur, dass das Radio leiser wird, Master. Jetzt ist es leise. Ausgezeichnet.'),
    erz('Am Nachbarstand beugt sich ein Händler zu dir rüber: „Die alte Volt aus der Neon-Gasse fragt rum, wer noch so komisch geworden ist. Geh mal hin. Mir ist das unheimlich.“'),
  ]),
]);

// ------------------------------------------------------------------------------------------- Akt 2: frei

const zurueck = dialog('klingel-a2-frei', [
  knoten('start', [
    erz('BONG. BONG. BONG. Frau Klingel schlägt jede Glocke an ihrem Stand an, eine nach der anderen, von klein nach groß. Der halbe Markt hält sich die Ohren zu. Die andere Hälfte klatscht.'),
    K('HUNDERTZWÖLF! Alle noch da! Alle noch laut! ICH AUCH!', 'freude'),
  ], {
    effects: [gesehen('klingel-a2-frei'), herz(ID, 30)],
    choices: [
      { text: '„Ist das Radio wieder da?“', when: RADIO_AN, next: 'radio' },
      { text: '„Hören Sie wieder die Tauben?“', when: KALIBRIERT, next: 'tauben' },
      { text: '„Wie geht es Ihnen?“', next: 'wie' },
    ],
  }),
  knoten('radio', [
    RADIO('Aus ihrem Ohr, blechern und herrlich falsch: „… Radio Rost, Opa Funk am Pult. Quantum-Drohnen über der Hafenkante, wer eine sieht, bitte mit Kartoffeln bewerfen. Jetzt: Schlager.“'),
    K('Radio Rost! Ich hab nie gedacht, dass ich mich mal über Opa Funk freue. Er klingt wie ein Toaster mit Bronchitis. Ich liebe ihn.', 'freude'),
  ], { next: 'ende' }),
  knoten('tauben', [
    K('Die Tauben! Und meine Schritte! Und das Schlurfen! Ich schlurfe immer noch. Ich hab’s vermisst.', 'freude'),
  ], { next: 'ende' }),
  knoten('wie', [
    K('WÜTEND! Und ein bisschen beschämt. Ich hab drei Wochen lang Leuten Ruhe verkauft. Ruhe! An einem Glockenstand! Kurt würde sich im Grab umdrehen. Mit Gebimmel.', 'wut'),
  ], { next: 'ende' }),
  knoten('ende', [
    K('Wenn ich den finde, der mir das Ding verpasst hat, kriegt er die Schiffsglocke. Die nasse. Auf den Kopf.', 'wut'),
  ]),
]);

const a2 = folge('klingel-a2', [
  erz('Über dem Schrottmarkt kreisen Quantum-Drohnen. Jedes Mal, wenn eine über ihren Stand fliegt, schlägt Frau Klingel eine Glocke an. Die Drohnen drehen ab. Niemand weiß, warum. Sie auch nicht. Aber es funktioniert.'),
  K('HALLO! Kommen Sie, schnell, bevor die nächste kommt! Ich hab’s raus: Die mögen kein Bimmeln! Kein Mensch mag Bimmeln! Außer mir!'),
], K('WAS NOCH? Ich höre Sie! Halbwegs!'), [
  { id: 'radio', text: 'Was meldet Radio Rost?', when: RADIO_AN, zeilen: [
    RADIO('Aus ihrem Ohr: „… Razzia im Eisenhof, Dr. Winkel lässt ausrichten: Er hat nichts gesagt. Linie 3 fährt pünktlich, wir bitten um Verständnis. Und: Chrome 10 ist gratis. Darum ist es teuer. Denken Sie mal drüber nach.“'),
    K('Opa Funk wird politisch. Das ist gut. Er war immer zu nett für einen Sender.'),
  ] },
  { id: 'aria', text: '„Haben Sie im Radio was von einer Gefangenen gehört?“', when: ARIA_GECHIPPT, zeilen: [
    K('Nicht im Radio. Auf dem Markt. Babette sagt, in der Nacht vom Campus-Einbruch hat jemand eine junge Frau mit einem Schläger rausgetragen. Oder reingetragen. Die Leute erzählen das in beide Richtungen.', 'besorgt'),
    K('Wenn das eine von Ihren ist: Ich läute für sie. Jeden Abend. Damit sie weiß, dass jemand wartet.'),
  ] },
  { id: 'gloeckchen', text: '„Wir gehen auf die Releaseparty. Haben Sie was für mich?“', when: A2_PARTY, once: true, zeilen: [
    K('Auf die Party von denen? Mit den Chips? Dann nehmen Sie das hier.'),
    erz('Sie drückt dir ein winziges Silberglöckchen in die Hand. Es hat einen Riss und klingt trotzdem klar.'),
    K('Kurts Taschenglöckchen. Wenn Sie nicht weiterwissen, klingeln Sie einmal. Dann gucken alle hin. Und wer guckt, der redet nicht. Dann reden Sie.', 'zaertlich'),
  ], effects: [herz(ID, 15), { checkBuff: { id: 'buff-klingel-gloeckchen', label: 'Kurts Taschenglöckchen', value: 1, attribute: 'ausstrahlung', consumes: true } }] },
], ALT, 'AUF WIEDERSEHEN!');

// ------------------------------------------------------------------------------------------- Akt 3

const partynacht = kurz('klingel-partynacht', [
  erz('Der Schrottmarkt ist leer bis auf Frau Klingel. Sie sitzt auf einem Hocker zwischen ihren Glocken, den Kopf schief, und lauscht ihrem eigenen Ohr.'),
  K('Radio Rost überträgt die Party. Opa Funk liest vor, was er auf Collins Sendung sieht. Er beschreibt die Kleider. Er hat keine Ahnung von Kleidern. Er sagt, Sybella sieht aus wie ein Pokal.', 'freude'),
  K('Wenn Sie da oben fertig sind: Ich läute. Die große. Die ganze Stadt soll es hören.'),
]);

// ------------------------------------------------------------------------------------------- Nachspiel

const nachspiel = dialog('klingel-nachspiel', [
  knoten('start', [
    erz('Kurts grüne Bronzeglocke hängt nicht mehr am Stand. Sie hängt an einem Gerüst aus Schrott, mitten auf dem Markt, drei Meter hoch. Darunter steht Frau Klingel mit dem Klöppel in beiden Händen.'),
    K('Da sind Sie! Sie kommen gerade richtig. Ich hab auf Sie gewartet. Ich läute nicht ohne Sie.', 'freude'),
  ], {
    effects: [gesehen('klingel-nachspiel'), herz(ID, 20)],
    choices: [
      { text: 'Den Klöppel gemeinsam schwingen.', when: GELAEUTET, next: 'gemeinsam' },
      { text: '„Läuten Sie. Für alle.“', when: { not: GELAEUTET }, next: 'alle' },
      { text: '„Ich hab nicht verdient, dass Sie auf mich warten.“', when: ENDE_3B, next: 'dreib' },
    ],
  }),
  knoten('gemeinsam', [
    erz('Wie damals am Sonntag. Ihre Hände auf dem Klöppel, deine darüber. BONNNNG. Der Ton rollt durch die Lötgassen, über die Hafenkante, bis an die Flutmauer. Henk am Leuchtturm hebt den Hut.'),
    K('Damit sie wissen, dass Sonntag ist. Hat Kurt gesagt. Heute ist kein Sonntag. Heute läuten wir, damit sie wissen, dass es vorbei ist.', 'zaertlich'),
  ], { next: 'ende', effects: [herz(ID, 20)] }),
  knoten('alle', [
    erz('Sie holt aus, mit aller Kraft, die achtzig Jahre noch hergeben. BONNG. Leiser als früher, sagt sie. Aber der ganze Markt hört auf zu feilschen.'),
    K('Für alle. Für Paul, für Gerda, für den verrückten Prediger, für die Perle. Für mich. Wir waren alle mal still. Jetzt nicht mehr.'),
  ], { next: 'ende' }),
  knoten('dreib', [
    K('Verdient? Ich hab achtzig Jahre lang Glocken verkauft an Leute, die sie nicht verdient haben. Das macht man so. Man gibt Leuten was, damit sie besser werden.', 'zaertlich'),
    K('Und Sie sind besser geworden. Spät. Aber hörbar.'),
  ], { next: 'ende', effects: [herz(ID, 40)] }),
  knoten('ende', [
    K('So. Und jetzt erzählen Sie mir, was los war. Laut. Mein Ohr ist alt.'),
  ], {
    choices: [
      { text: '„Die Bildschirme sind aus. Alle.“', when: ENDE_MEER, next: 'meer' },
      { text: '„Nexus schaltet die Chips ab. Sicher. Sie hilft jetzt.“', when: ENDE_NEXUS, next: 'nexus' },
      { text: '„Blade sitzt.“', when: BLADE_GEFASST, next: 'blade' },
      { text: '„Ein andermal. Läuten Sie weiter.“' },
    ],
  }),
  knoten('meer', [
    K('Aus? Ach DARUM ist Radio Rost so laut. Opa Funk hat keine Konkurrenz mehr. Er sendet jetzt rund um die Uhr. Er schläft nie. Ich glaub, er ist glücklich.'),
  ]),
  knoten('nexus', [
    K('Die hat mich gefragt! Per Drohne! „Frau Klingel, darf ich Ihr Implantat neu einstellen? Sie dürfen Nein sagen.“ Ich hab Nein gesagt. Nur, um zu sehen, ob sie es ernst meint.', 'ueberrascht'),
    K('Sie meint es ernst. Sie ist weggeflogen. Am nächsten Tag hab ich Ja gesagt. Man muss Maschinen erziehen. Wie Männer.', 'signatur'),
  ]),
  knoten('blade', [
    ich('Blade sitzt. Im Zellentrakt.'),
    K('Gut. Ich schick ihm eine Glocke. Eine kleine. Die schlägt jede Stunde. Er soll wissen, wie lang so eine Nacht ist.', 'wut'),
  ]),
]);

const nachspielTag = folge('klingel-nachspiel-tag', [
  erz('Kurts Glocke hängt auf ihrem Gerüst über dem Markt. Kinder klettern dran hoch und werden von Frau Klingel mit einem Taschenglöckchen wieder runtergebimmelt.'),
  K('HALLO! Sonntag läut ich wieder! Kommen Sie! Bringen Sie Ohrstöpsel! Oder auch nicht!'),
], K('WAS NOCH? Ich höre Sie! Besser als früher!'), [
  { id: 'radio', text: 'Was läuft im Ohr?', when: RADIO_AN, zeilen: [
    RADIO('„… Radio Rost. Das Wetter: Rostregen mit Aussicht auf Meer. Werbung gibt es nicht mehr. Wir senden stattdessen dreißig Sekunden Möwen.“'),
    K('Dreißig Sekunden Möwen. Ich hab geweint. Ich weiß nicht, warum. Möwen sind Arschlöcher.'),
  ] },
  { id: 'kurt', text: '„Was würde Ihr Kurt sagen?“', zeilen: [
    K('„Gisela, du läutest zu oft.“ Das hat er immer gesagt. Und dann hat er selber noch einmal geläutet. Heimlich. Damit es das letzte Wort hat.', 'zaertlich'),
  ] },
], ALT, 'AUF WIEDERSEHEN!');

// ------------------------------------------------------------------------------------------- Master-Modus

const masterChipDlg = kurz('klingel-master-chip', [
  erz('Kein Ton am Glockenstand. Frau Klingel verneigt sich, als du vorbeigehst. Hinter ihrem Ohr blinkt es im Takt deines Herzschlags.'),
  K('Master. Heute im Angebot: Ruhe. Für immer. Eine ausgezeichnete Entscheidung.'),
  RADIO('Aus ihrem Ohr, ganz leise, unter der Werbung: ein einzelner Glockenschlag. Dann nichts mehr.'),
]);

const master = kurz('klingel-master', [
  erz('Frau Klingel sieht dich kommen. Sie dreht dir den Rücken zu und schlägt die nasse Schiffsglocke an. Einmal. Lang. Tief. Ein Totengeläut.'),
  K('WAS? Ich höre Sie nicht. Und ich will Sie nicht hören. Für Sie läut ich nicht. Nicht mal die kleinste.', 'wut'),
  K('Wenn Sie je wieder einer von uns sind, dann läut ich. Vorher nicht.'),
]);

const dialogues = sammle(gechipptDlg, zurueck, a2, partynacht, nachspiel, nachspielTag, masterChipDlg, master);

/** Talk-Einträge vor dem alten Tagesgespräch (nach Rivale und Erstbegegnung). */
export const TALK_23: TalkDef[] = [
  rede('klingel-master-chip', masterChip(KEY)),
  rede('klingel-master', MASTER),
  rede('klingel-nachspiel', einmal('klingel-nachspiel', NACHSPIEL)),
  rede('klingel-nachspiel-tag', NACHSPIEL),
  rede('klingel-a2-gechippt', gechippt(KEY)),
  rede('klingel-partynacht', PARTYNACHT),
  rede('klingel-a2-frei', einmal('klingel-a2-frei', { all: [NUR_AKT2, FREI] })),
  rede('klingel-a2', NUR_AKT2),
];

export const part: ContentPart = { dialogues };
