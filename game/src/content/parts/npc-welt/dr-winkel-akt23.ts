// Dr. Winkel in Akt 2, Akt 3 und im Nachspiel (world.md §5.3–5.5, §10.3). Akt 2: Fahndungs-Hochkonjunktur nach dem
// Bruch, Drohnen, Razzia im Eisenhof; das Senken der Fahndung bleibt im alten Menü (Weiterleitung). Nachspiel je Ende
// (Ende 1: Blades Prozess, Ende 2: Nexus löscht die Akten), Master-Modus (er vertritt keine Master).
// Wird von dr-winkel.ts in NpcDef.talk eingehängt.
import type { ContentPart } from '../../part';
import type { TalkDef } from '../../../modules/contracts';
import { dialog, erz, herz, knoten, rede, sammle, sprecher } from './_welt';
import {
  A2_PARTY, BLADE_GEFASST, ENDE_3B, ENDE_MEER, ENDE_NEXUS, GESUCHT, MASTER, NACHSPIEL, NUR_AKT2, PARTYNACHT, einmal, folge,
  gesehen, kurz,
} from './akt23-phasen';

const ID = 'dr-winkel';
const W = sprecher(ID);
const ALT = 'winkel-tag-standard';

const a2 = folge('winkel-a2', [
  erz('Dr. Winkels Praxis ist voll. Auf jedem Stuhl sitzt jemand mit Kapuze. An der Wand hängt ein Fahndungsplakat. Dein Gesicht. Er hat es gerahmt.'),
  W('Mein Lieblingsmandant! Seit dem Einbruch auf dem Campus sind Sie mein bester Umsatz. Ich habe Sie über den Schreibtisch gehängt. Als Motivation.'),
], W('Weiter. Im Wartezimmer sitzt ein Mann, der seinen eigenen Namen nicht mehr weiß. Er zahlt pro Stunde.'), [
  { id: 'lage', text: '„Wie schlimm ist es da draußen?“', zeilen: [
    W('Drohnen über jedem Platz. Die Wache hat neue Kameras, die Gesichter erkennen. Ich habe meinen Mandanten Schnurrbärte empfohlen. Falsche. Die Kameras sind verwirrt. Die Mandanten auch.'),
    W('Und Quantum hat einen eigenen Rechtsdienst. Er heißt „Kundenbetreuung“. Er betreut Kunden in Zellen.'),
  ] },
  { id: 'gechippt', text: '„Kommen auch Gechippte zu Ihnen?“', zeilen: [
    W('Einer. Er wollte sich selbst anzeigen. Wegen „unzureichender Zufriedenheit“. Ich habe abgelehnt. Er hat sich bedankt. Siebenmal.'),
    W('Das ist das Unheimlichste, was mir in dreißig Jahren Unrecht passiert ist. Und ich hab im Knast mit einem Mann gewohnt, der mit seinem Löffel verheiratet war.'),
  ] },
  { id: 'gesucht', text: '„Was kostet es, mich ganz von der Liste zu kriegen?“', when: GESUCHT, zeilen: [
    W('Ganz? Nach dem Campus? Da müsste ich Ihre Akte nicht verlieren, sondern verbrennen. Und die Asche in drei Kanäle streuen. Und die Kanäle bestechen.'),
    W('Stufe für Stufe. Hundertfünfzig. Wie immer. Ich bin korrupt, aber verlässlich.', 'signatur'),
  ] },
  { id: 'party', text: '„Wir gehen auf die Releaseparty. Rechtlicher Rat?“', when: A2_PARTY, zeilen: [
    W('Ja. Gehen Sie nicht. … Sie gehen trotzdem. Gut. Dann: Fassen Sie nichts an, was Ihnen nicht gehört, außer Sie nehmen es mit. Wer es mitnimmt, hat Beweise. Wer es nur anfasst, hat Fingerabdrücke.'),
    W('Und wenn man Sie erwischt: Sie haben sich verlaufen. Sie suchen die Toilette. Sie sind Tanzpädagoge. Das letzte hilft nie. Aber es verwirrt.'),
  ] },
], ALT, 'Ich hab nichts gesagt.');

const partynacht = kurz('winkel-partynacht', [
  erz('Die Praxis ist abgeschlossen. Durch den Briefschlitz sieht man Dr. Winkel im Dunkeln vor einem Fernseher sitzen, eine Tasse Synth-Kaffee in der Hand und einen Block auf den Knien.'),
  W('(durch den Schlitz) Ich notiere mir alle Straftaten, die ich heute Nacht live sehe. Für später. Für Mandate. Es sind schon zweiundvierzig. Die meisten sind von Ihnen.'),
]);

const nachspiel = dialog('winkel-nachspiel', [
  knoten('start', [
    erz('Auf Dr. Winkels Schreibtisch liegt kein Fahndungsplakat mehr. Dafür ein Zeitungsausschnitt mit deinem Bild unter der Überschrift „Die Stadt sagt Danke“. Er hat es nicht gerahmt. Er hat es laminiert.'),
    W('Sie. Ich habe ein Problem. Sie sind nicht mehr gesucht. Sie sind GEFEIERT. Das ist für mein Geschäftsmodell eine Katastrophe.'),
  ], {
    effects: [gesehen('winkel-nachspiel'), herz(ID, 20)],
    choices: [
      { text: '„Übernehmen Sie Blades Verteidigung?“', when: BLADE_GEFASST, next: 'blade' },
      { text: '„Nexus hat die Fahndungsakten gelöscht, oder?“', when: ENDE_NEXUS, next: 'nexus' },
      { text: '„Die Bildschirme sind aus. Und die Kameras?“', when: ENDE_MEER, next: 'meer' },
      { text: '„Ich war eine Weile auf der anderen Seite.“', when: ENDE_3B, next: 'dreib' },
    ],
  }),
  knoten('blade', [
    W('Ich habe mich beworben. Als Pflichtverteidiger. Er hat abgelehnt. Er sagt, ich habe keinen Stil.', 'wut'),
    W('Keinen Stil! Ich trage eine Fliege! Er trägt Handschellen! Wer von uns beiden hat hier keinen Stil?'),
  ]),
  knoten('nexus', [
    W('Gelöscht! Alle! Mit einer Nachricht an jeden Betroffenen: „Ihre Daten wurden unrechtmäßig erhoben. Wir bitten um Entschuldigung.“', 'ueberrascht'),
    W('Eine KI entschuldigt sich bei Kriminellen. Wissen Sie, was das mit dem Rechtsstaat macht? Ich auch nicht. Aber meinen Umsatz hat es halbiert.'),
    W('Ich mache jetzt Scheidungen. Die Leute haben wieder Zeit füreinander. Das endet oft schlecht. Für mich gut.'),
  ]),
  knoten('meer', [
    W('Die Kameras laufen noch. Aber keiner guckt mehr hin. Der Wachtmeister im Zentralraum strickt. Ich hab ihn besucht. Er strickt einen Pullover für seine Katze. Die Katze hat einen Pullover verdient. Sie war die einzige, die nie gesucht wurde.'),
  ]),
  knoten('dreib', [
    W('Auf der anderen Seite. Juristisch: Ja. Moralisch: Ja. Praktisch: Sie haben sich selbst angezeigt, indem Sie zurückgekommen sind. Das wertet das Gericht strafmildernd.', 'signatur'),
    W('Ich bin das Gericht. In diesem Raum. Freispruch. Mit Auflagen: Kommen Sie wieder, wenn Sie was angestellt haben. Nur was Kleines.'),
  ], { effects: [herz(ID, 40)] }),
]);

const nachspielTag = folge('winkel-nachspiel-tag', [
  W('Mein Lieblingsmandant. Sauber. Gefeiert. Langweilig. Kommen Sie wieder, wenn Sie etwas angestellt haben. Ich bitte Sie. Ich flehe.'),
], W('Weiter. Meine Zeit kostet. Aktuell nicht viel.'), [
  { id: 'geschaeft', text: 'Wie läuft das Geschäft?', zeilen: [
    W('Schlecht. Wunderbar schlecht. Gestern kam ein Mann, der eine Taube angefahren hat. Mit dem Fahrrad. Ich habe ihn vertreten wie ein Löwe. Die Taube hat verloren.'),
  ] },
], ALT, 'Ich hab nichts gesagt.');

const master = kurz('winkel-master', [
  erz('Dr. Winkel sieht dich, setzt die Hornbrille ab und klappt einen leeren Aktenordner zu. Langsam. Wie einen Sargdeckel.'),
  W('Ich vertrete Sie nicht. Ich habe Mörder vertreten, Diebe, einen Mann, der eine Brücke verkauft hat, die es nicht gibt.', 'wut'),
  W('Aber Leute, die sich zum Master machen, vertrete ich nicht. Das ist kein Mandat. Das ist ein Anschlag auf die Gebührenordnung. Raus.'),
]);

const dialogues = sammle(a2, partynacht, nachspiel, nachspielTag, master);

/** Talk-Einträge vor dem alten Tagesgespräch (nach Rivale und Erstbegegnung). */
export const TALK_23: TalkDef[] = [
  rede('winkel-master', MASTER),
  rede('winkel-nachspiel', einmal('winkel-nachspiel', NACHSPIEL)),
  rede('winkel-nachspiel-tag', NACHSPIEL),
  rede('winkel-partynacht', PARTYNACHT),
  rede('winkel-a2', NUR_AKT2),
];

export const part: ContentPart = { dialogues };
