// Direktorin Hartlauf in Akt 2, Akt 3 und im Nachspiel (world.md §5.3–5.5, §6.3 Nr. 41). Ihre Quest side-hartlaufs-rache
// startet über den Hotspot q-hartlauf-start der Quest (quest-side-23-b); hier Tagesgespräche nach Phase: Nexus ist wach,
// Patentakten (hr_akten_abgegeben), Alesa-Verdacht aus he-2/♥3 (hartlauf_alesa_verdacht, hartlauf_sperre_entdeckt),
// Partynacht im Pförtnerhaus, Nachspiel je Ende (Ende 2: Alesa leitet die Aufarbeitung unter Aufsicht), Master-Modus.
// Wird von direktorin-hartlauf.ts in NpcDef.talk eingehängt.
import type { ContentPart } from '../../part';
import type { TalkDef } from '../../../modules/contracts';
import { dialog, erz, herz, knoten, rede, sammle, sprecher } from './_welt';
import {
  A2_PARTY, ENDE_3B, ENDE_MEER, ENDE_NEXUS, MASTER, NACHSPIEL, NUR_AKT2, PARTYNACHT, einmal, folge, gesehen, kurz,
} from './akt23-phasen';

const ID = 'direktorin-hartlauf';
const H = sprecher(ID);
const OLE = sprecher('ole-gaehn');
const ALT = 'hartlauf-tag-standard';
const AKTEN = { flag: 'hr_akten_abgegeben' } as const;
const SPERRE = { flag: 'hartlauf_sperre_entdeckt' } as const;
const ALESA_ZWEIFEL = { flag: 'alesa_zweifel' } as const;

const a2 = folge('hartlauf-a2', [
  erz('Im Pförtnerhaus läuft ein uraltes Radio. Hartlauf sitzt davor, die Brille auf der Nasenspitze, und schreibt mit. Neben ihr hängt ein neunzehnter Rahmen. Noch leer.'),
  H('Ah, Sie. Gut. Haben Sie es gehört? Auf dem Campus wurde eingebrochen. Quantum sagt: „Ein Kurzschluss.“ Ich sage: Sieben Jahre zu spät, aber endlich mal in die richtige Richtung.'),
], H('Noch etwas? Mein Kaffee wird kalt. Er ist das Einzige hier, das pünktlich ist.'), [
  { id: 'nexus', text: '„Nexus ist aufgewacht. Wussten Sie, dass das passieren würde?“', zeilen: [
    H('Gewusst? Befürchtet. Wir hatten bei Digitech eine Regel: Eine lernende Maschine bekommt nie mehr Zugriff, als sie zum Lernen braucht. Quantum hat ihr die ganze Stadt gegeben.'),
    H('Das ist, als würde man einem Kleinkind einen Flammenwerfer schenken. Und sich wundern, dass es spielt.', 'wut'),
  ] },
  { id: 'sperre', text: '„Alesas Sperre an der Tafel. Hat sie die in Nexus eingebaut?“', when: SPERRE, zeilen: [
    H('Wenn sie es getan hat, ist sie noch drin. Irgendwo. Eine Schranke, die sagt: Du darfst dich nicht selbst umschreiben. Und wenn Nexus jetzt aufwacht, dann rüttelt sie an genau dieser Schranke.'),
    H('Wer die Schranke findet, kann Nexus vielleicht umbauen. Statt sie abzuschalten. Das wäre … Ich hasse es, das zu sagen. Das wäre Alesas Werk. Und es wäre gut.', 'besorgt'),
  ] },
  { id: 'akten', text: '„Was machen Sie mit den Patentakten?“', when: AKTEN, zeilen: [
    H('Kopien. Hundert Stück. Eine an jede Zeitung, jedes Gericht, jeden Abgeordneten, der noch lesen kann. Und eine an Quantum. Mit Schleife.', 'signatur'),
    H('Neunzehn Rahmen werden es. Der letzte wird keine Absage. Der letzte wird ein Urteil. Ich hab den Nagel schon in der Wand.'),
  ] },
  { id: 'party', text: '„Wir gehen auf die Releaseparty. In den Turm.“', when: A2_PARTY, zeilen: [
    H('Wenn Sie Alesa sehen: Sagen Sie ihr, die Tafel steht noch. Sie wird wissen, welche. Und dann sehen Sie ihr ins Gesicht.', 'besorgt'),
    H('Wenn sie wegschaut, hat sie gelogen. Wenn sie hinschaut, hat sie es ernst gemeint. Und wenn sie weint, dann holen Sie sie da raus. Ich will sie anschreien. Persönlich.'),
  ] },
], ALT, 'Ich will Sie nicht aufhalten.');

const partynacht = kurz('hartlauf-partynacht', [
  erz('Im Pförtnerhaus drängen sich zwölf Leute vor einem kleinen Fernseher: die Digitech-Restbelegschaft. Ole Gähn schläft im Stehen an der Wand. Auf dem Bildschirm: die Releaseparty.'),
  H('Da. Hinten links. Im weißen Kittel. Das ist sie. Alesa. Sie lächelt nicht. Sie hat nie gelächelt, wenn sie sich unwohl fühlt.', 'besorgt'),
  OLE('… Chefin … ist das … schon das Urteil …?'),
  H('Schlaf weiter, Ole. Das Urteil kommt später. Erst kommt der Absturz.'),
]);

const nachspiel = dialog('hartlauf-nachspiel', [
  knoten('start', [
    erz('Der neunzehnte Rahmen hängt. Darin kein Formbrief, sondern eine Zeitungsseite. Schlagzeile: „QUANTUM: DER TURM WACKELT“. Darunter, mit Kugelschreiber: „Endlich.“'),
    H('Sie. Setzen Sie sich. Ich hab Kaffee gemacht. Echten. Ich habe sieben Jahre lang Kaffee für einen Tag aufgehoben, an dem es etwas zu feiern gibt.', 'freude'),
  ], {
    effects: [gesehen('hartlauf-nachspiel'), herz(ID, 20)],
    choices: [
      { text: '„Alesa leitet jetzt die Aufarbeitung. Unter Aufsicht.“', when: ENDE_NEXUS, next: 'nexus' },
      { text: '„Quantum ist am Ende. Was wird aus Digitech?“', when: ENDE_MEER, next: 'meer' },
      { text: '„Hat Alesa die Wahrheit gesagt?“', when: ALESA_ZWEIFEL, next: 'wahrheit' },
      { text: '„Ich war nicht immer auf der richtigen Seite.“', when: ENDE_3B, next: 'dreib' },
    ],
  }),
  knoten('nexus', [
    H('Unter Aufsicht. Ja. Wissen Sie, wer die Aufsicht ist? Ich hab mich beworben. Als Einzige. Mit neunzehn Rahmen als Referenz.', 'signatur'),
    H('Morgen hab ich das erste Gespräch mit ihr. Ich hab mir drei Sätze aufgeschrieben. Der erste ist ein Schimpfwort. Der zweite auch. Der dritte ist: „Warum?“'),
    H('Und FX-60 soll Nexus anlernen. Unser Faxgerät. Als Mentor. Ich hab gelacht, bis Ole aufgewacht ist. Dann hab ich geweint. Er ist der Richtige. Er hat sie immer gegrüßt. Sie hat nie geantwortet.'),
  ]),
  knoten('meer', [
    H('Digitech? Digitech sind zwölf Leute und ein Pförtnerhaus. Aber das Gericht hat die Akten. Und wenn Quantum zahlt, dann bauen wir wieder. Klein. Ehrlich. Mit Fenstern, die aufgehen.'),
    H('Ich hab schon ein Firmenschild. Es lag sieben Jahre im Keller. Ole hat drauf geschlafen. Es ist ein bisschen verbogen. So wie wir.', 'zaertlich'),
  ]),
  knoten('wahrheit', [
    H('Vor laufender Kamera. „Wir haben gewusst, was wir tun.“ Sechs Worte. Sie hat dabei in die Kamera gesehen. Nicht weggeschaut.', 'trauer'),
    H('Sie hat es ernst gemeint. Damals, an der Tafel. Und dann hat sie es trotzdem getan. Das ist schlimmer als lügen. Und es ist menschlicher. Ich weiß nicht, was ich damit anfangen soll.'),
  ]),
  knoten('dreib', [
    H('Das weiß ich. Ich habe Sie auf dem Bildschirm gesehen, als Sie oben standen. Und ich habe gesehen, wie Sie wieder runtergekommen sind.', 'besorgt'),
    H('Die meisten kommen nicht wieder runter. Alesa hat sieben Jahre gebraucht. Sie eine Woche. Trinken Sie Ihren Kaffee.'),
  ], { effects: [herz(ID, 40)] }),
]);

const nachspielTag = folge('hartlauf-nachspiel-tag', [
  erz('Das Pförtnerhaus hat ein neues Schild, verbogen, frisch poliert: „DIGITECH. Wieder da.“ Drinnen klappert eine Schreibmaschine.'),
  H('Ah, Sie. Gut. Ich mag Leute, die wiederkommen. Es kommen jetzt viele. Ehemalige. Mit Kartons. Und Kuchen.'),
], H('Noch etwas? Ich habe Zeit. Zum ersten Mal seit Jahren habe ich Zeit, die nicht nach Warten schmeckt.'), [
  { id: 'firma', text: 'Wie läuft der Neustart?', zeilen: [
    H('Vierzehn Leute. Zwei mehr als letzte Woche. Ein Ingenieur aus der Oberstadt hat gefragt, ob er zurückdarf. Ich habe gesagt: „Erst eine Woche Pfandflaschen sammeln.“ Er macht es. Er ist gut.'),
  ] },
  { id: 'fx', text: '„Wie macht sich FX-60 als Mentor?“', when: ENDE_NEXUS, zeilen: [
    H('Er faxt ihr jeden Morgen eine Frage. Heute: „WAS IST EIN FREUND?“ Sie hat vier Stunden gebraucht. Ihre Antwort war zwölf Seiten lang. Er hat zurückgefaxt: „ZU LANG. NOCHMAL.“'),
    H('Ich glaube, das ist die beste Schule, die diese Stadt je hatte.'),
  ] },
], ALT, 'Ich will Sie nicht aufhalten.');

const master = kurz('hartlauf-master', [
  erz('Hartlauf sitzt im Pförtnerhaus und sieht nicht auf. Hinter ihr hängt ein zwanzigster Rahmen. Darin: ein Foto von dir aus den Nachrichten. Mit einem Stempel: „ABGELEHNT“.'),
  H('Sie haben Hausverbot. Auf dem ganzen Areal. Für immer. Oder bis Sie wieder wissen, dass Maschinen dienen sollen und nicht Sie.', 'wut'),
  H('Ole. Bring diese Person raus. … Ole schläft. Gehen Sie selbst. Sie kennen ja den Weg nach oben. Finden Sie den nach draußen.'),
]);

const dialogues = sammle(a2, partynacht, nachspiel, nachspielTag, master);

/** Talk-Einträge vor dem alten Tagesgespräch (nach Rivale und Erstbegegnung). */
export const TALK_23: TalkDef[] = [
  rede('hartlauf-master', MASTER),
  rede('hartlauf-nachspiel', einmal('hartlauf-nachspiel', NACHSPIEL)),
  rede('hartlauf-nachspiel-tag', NACHSPIEL),
  rede('hartlauf-partynacht', PARTYNACHT),
  rede('hartlauf-a2', NUR_AKT2),
];

export const part: ContentPart = { dialogues };
