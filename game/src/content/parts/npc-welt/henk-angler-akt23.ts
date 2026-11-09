// Henk Angler in Akt 2, Akt 3 und im Nachspiel (world.md §5.3–5.5). Akt 2: Quantum-Drohnen über der Flutmauer, der
// Weg zum Meer, ein Versprechen für die Partynacht (die Lampe auf volle Kraft). Nachspiel je Ende, samstags an der
// Wasserlinie am echten Meer, Master-Modus (die Lampe bleibt für dich dunkel).
// Wird von henk-angler.ts in NpcDef.talk/schedule eingehängt.
import type { ContentPart } from '../../part';
import type { ScheduleEntry, TalkDef } from '../../../modules/contracts';
import { dialog, erz, herz, knoten, ort, rede, sammle, sprecher } from './_welt';
import {
  A2_PARTY, ENDE_3B, ENDE_MEER, ENDE_NEXUS, MASTER, NACHSPIEL, NUR_AKT2, PARTYNACHT, einmal, folge, gesehen, kurz,
} from './akt23-phasen';

const ID = 'henk-angler';
const H = sprecher(ID);
const ALT = 'henk-tag-standard';
const WEG_ZUM_MEER = { quest: 'side-weg-zum-meer', state: ['active', 'done'] } as const;

const a2 = folge('henk-a2', [
  erz('Über der Flutmauer surren Drohnen. Lila Lichter, in Reihe, wie Perlen an einer Schnur. Henk sitzt auf seinem Eimer und hat eine vierte Angel ausgeworfen. Senkrecht nach oben.'),
  H('Ich angle Drohnen. Bisher nichts gebissen. Aber die erste kommt runter. Die sind neugierig. Wie Barsche. Nur dümmer.'),
], H('Noch was? Leise. Die Drohnen hören mit. Die Fische auch.'), [
  { id: 'drohnen', text: '„Was wollen die hier draußen?“', zeilen: [
    H('Die fliegen nachts aufs Meer raus. Hinter die Mauer. Und kommen zurück. Ich weiß nicht, was die da zählen. Wellen vielleicht. Oder ob noch einer guckt.'),
    H('Ich guck. Ich hab die Lampe heller gestellt. Wenn die mich blenden wollen, blend ich zurück. Ich hab mehr Watt.', 'signatur'),
  ] },
  { id: 'meer', text: '„Wie kommt man hinter die Mauer? Ans Meer?“', zeilen: [
    H('Nicht hier. Die Mauer ist dicht, seit 2071. Aber draußen in der Ödnis, hinter den Glasdünen, da läuft der Sand runter bis ans Wasser. Hab ich gehört. Von Leuten, die keiner geglaubt hat.'),
    H('Wenn du hinwillst, nimm eine Angel mit. Und schick mir eine Postkarte. Ich hab das Meer nur von oben gesehen. Durch Glas. Mit einer Lampe dazwischen.'),
  ] },
  { id: 'weg', text: '„Wir suchen den Weg zum Meer. Wirklich.“', when: WEG_ZUM_MEER, zeilen: [
    H('Dann hört auf den Wind. Der Wind vom Meer riecht nach Salz und nach Rost. Der aus der Ödnis nach Staub und Rost. Folgt dem mit mehr Salz.'),
    H('Und wenn ihr da seid, guckt nicht gleich ins Wasser. Guckt erst zurück. Auf die Mauer. Damit ihr wisst, wo ihr herkommt. Dann ins Wasser.'),
  ] },
  { id: 'party', text: '„Wir gehen auf die Releaseparty. Ganz oben im Turm.“', when: A2_PARTY, zeilen: [
    H('Ganz oben. Von da sieht man die Flutmauer. Und meinen Leuchtturm.'),
    H('Wenn ihr’s geschafft habt, egal was, dann mach ich die Lampe an. Volle Kraft. Hab ich seit der „Morgenrot“ nicht mehr gemacht. Dann wisst ihr, dass einer zugeguckt hat.', 'zaertlich'),
  ], effects: [herz(ID, 10)] },
], ALT, 'Petri Heil.');

const partynacht = kurz('henk-partynacht', [
  erz('Ganz oben im Leuchtturm. Henk sitzt im Kreis der Lampe, ein kleines Radio auf dem Schoß. Er dreht die Lampe nicht. Er hält die Hand am Hebel.'),
  H('Ich warte. Ich kann das. Ich hab fünfzehn Jahre auf Schiffe gewartet.'),
  H('Wenn ich es im Radio höre, dann leg ich um. Die ganze Stadt wird es sehen. Auch die da oben. Vor allem die.'),
]);

const nachspiel = dialog('henk-nachspiel', [
  knoten('start', [
    erz('Die Lampe des Leuchtturms brennt, obwohl es Tag ist. Volle Kraft. Henk sitzt auf seinem Eimer, aber er angelt nicht. Er schaut einfach. Auf die Mauer. Und lächelt.'),
    H('Ich hab sie angemacht. Volle Kraft. Seitdem lass ich sie an. Die Stadt soll wissen, dass hier einer wach ist.'),
  ], {
    effects: [gesehen('henk-nachspiel'), herz(ID, 20)],
    choices: [
      { text: '„Ich war am Meer, Henk. Am echten.“', when: ENDE_MEER, next: 'meer' },
      { text: '„Nexus schickt bald wieder Schiffe, hab ich gehört.“', when: ENDE_NEXUS, next: 'nexus' },
      { text: '„Ich hab deine Lampe gesehen. Von oben. Ich war auf der falschen Seite.“', when: ENDE_3B, next: 'dreib' },
    ],
  }),
  knoten('meer', [
    H('Und? Wie ist es? Erzähl. Nein. Erzähl nicht. Ich will es selber sehen.', 'freude'),
    H('Samstags fahr ich jetzt raus. Mit dem Shuttle oder mit wem auch immer. Ich stell mich an die Wasserlinie und werf aus. Zum ersten Mal ohne Mauer dazwischen. Wenn was beißt, ess ich es nicht. Ich lass es frei. Aus Dankbarkeit.'),
  ]),
  knoten('nexus', [
    H('Die KI hat gefragt, ob sie den Leuchtturm übernehmen darf. Automatisch. Ich hab Nein gesagt. Sie hat gefragt, warum.'),
    H('Ich hab gesagt: Weil ein Leuchtturm einen braucht, der wartet. Eine Maschine wartet nicht. Die ist einfach da. Sie hat drei Tage nachgedacht. Dann hat sie gesagt: „Ich möchte lernen zu warten.“ Jetzt sitzt manchmal eine Drohne neben mir. Wir angeln. Sie ist schlecht.', 'zaertlich'),
  ]),
  knoten('dreib', [
    H('Falsche Seite. Ich weiß. Ich hab die Lampe trotzdem angemacht. Für die anderen. Und ein bisschen für dich. Eine Lampe ist nicht wählerisch. Die leuchtet für jeden, der sich verfahren hat.', 'besorgt'),
    H('Du hast zurückgefunden. Das ist das Einzige, wofür eine Lampe gut ist.'),
  ], { effects: [herz(ID, 40)] }),
]);

const nachspielTag = folge('henk-nachspiel-tag', [
  H('Na. Was gebissen heute. Gestern auch. Morgen bestimmt. Sag ich seit letzter Woche. Es stimmt sogar.'),
], H('Noch was? Leise. Die Fische hören mit. Die Möwen auch.'), [
  { id: 'meer', text: '„Wie ist das echte Meer zum Angeln?“', when: ENDE_MEER, zeilen: [
    H('Laut. Unordentlich. Die Fische sind dumm und ehrlich. Die beißen einfach. Hinter der Mauer haben sie dreimal überlegt. Ich glaub, die hatten Angst vor der Stadt.'),
  ] },
], ALT, 'Petri Heil.');

const master = kurz('henk-master', [
  erz('Henk sitzt auf seinem Eimer. Der Leuchtturm hinter ihm ist dunkel. Nicht kaputt. Aus. Als du näher kommst, holt er alle drei Angeln ein und dreht dir den Rücken zu.'),
  H('Du verscheuchst die Fische. Und mich.', 'wut'),
  H('Die Lampe bleibt aus, solange du in der Stadt das Sagen hast. Wer sich verfahren will, soll es im Dunkeln tun. Wenn du zurückfindest, mach ich sie an. Für dich. Nicht vorher.'),
]);

const dialogues = sammle(a2, partynacht, nachspiel, nachspielTag, master);

/** Talk-Einträge vor dem alten Tagesgespräch (nach Rivale und Erstbegegnung). */
export const TALK_23: TalkDef[] = [
  rede('henk-master', MASTER),
  rede('henk-nachspiel', einmal('henk-nachspiel', NACHSPIEL)),
  rede('henk-nachspiel-tag', NACHSPIEL),
  rede('henk-partynacht', PARTYNACHT),
  rede('henk-a2', NUR_AKT2),
];

/** Nachspiel nach Ende 1/3b: samstags morgens und tags an der Wasserlinie am echten Meer. */
export const SCHEDULE_23: ScheduleEntry[] = [
  ort('M,T', 'das-meer', 'wasserlinie', { days: ['sa'], when: { all: [NACHSPIEL, ENDE_MEER] } }),
];

export const part: ContentPart = { dialogues };
