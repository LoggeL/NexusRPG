// Falke in Akt 2, Akt 3 und im Nachspiel (world.md §5.3–5.5; act23.json npcSchedules: nachts quantum-campus
// scheinwerfer-turm in act2, vorangestellt). Akt 2: nach dem Bruch auf den Campus-Turm versetzt (Brückenrolle:
// Vega hat seine Scheinwerfer ausgeschossen), Partynacht auf dem Turm, Nachspiel arbeitslos mit Wohnwagen am Meer
// (Wochenende tags), Master-Modus. Wird von falke.ts in NpcDef.talk/schedule eingehängt.
import type { ContentPart } from '../../part';
import type { ScheduleEntry, TalkDef } from '../../../modules/contracts';
import { dialog, erz, herz, knoten, ort, rede, sammle, sprecher } from './_welt';
import {
  A2_PARTY, AKT2, ENDE_3B, ENDE_MEER, ENDE_NEXUS, EPILOG, MASTER, NACHSPIEL, NUR_AKT2, PARTYNACHT, einmal, folge, gesehen,
  kurz,
} from './akt23-phasen';

const ID = 'falke';
const F = sprecher(ID);
const ALT = 'falke-tag-standard';
const BRUECKE = { flag: 'bruch_rolle_bruecke' } as const;
const NACHT = { time: 'nacht' } as const;
const ADLERAUGE_DONE = { quest: 'pers-vega-adlerauge', state: 'done' } as const;

const a2 = folge('falke-a2', [
  erz('Falke liegt auf dem Kranausleger, aber das Gewehr liegt neben ihm, nicht im Anschlag. Er isst Nudeln aus einer Dose. Mit den Fingern.'),
  F('Du. Tagschicht am Hafen, Nachtschicht auf dem Campus-Turm. Seit dem Einbruch. Ich schlafe zwischen zwei und vier. Im Bus. Im Stehen.'),
], F('Noch was? Ich muss gleich wieder bedrohlich gucken. Das kostet Kraft.'), [
  { id: 'bruecke', text: '„Warst du in der Nacht auf dem Campus?“', when: BRUECKE, zeilen: [
    F('Auf dem Scheinwerferturm. Ich hab euch gesehen. Auf der Brücke. Durchs Zielfernrohr. Ich hab gezählt: vier Scheinwerfer, vier Schüsse, vier Treffer. In drei Sekunden.'),
    F('Das war Vega. Ich weiß es. Niemand sonst schießt so. Ich hätte zurückschießen können. Ich hab nicht. Ich hab geklatscht. Leise. Mit Handschuhen.', 'trauer'),
  ] },
  { id: 'quantum', text: '„Warum arbeitest du noch für Quantum?“', zeilen: [
    F('Weil sie zahlen. Weil ich nichts anderes kann außer liegen und gucken. Und weil der Wohnwagen abbezahlt werden will.'),
    F('Sie wollen, dass ich einen Chip nehme. Chrome 10 für Sicherheitskräfte. „Bessere Reaktion.“ Ich hab gesagt, ich hab eine Allergie. Gegen Chips. Und gegen Befehle, die nach Kühlschrank klingen.'),
  ] },
  { id: 'vega', text: '„Was soll ich Vega ausrichten?“', when: ADLERAUGE_DONE, zeilen: [
    F('Dass sie immer noch Erste ist. Und dass ich nicht mehr so tue, als wär’s mir egal.'),
    F('… Nein. Sag ihr, ich hab eine Möwe auf vierhundert Meter getroffen. Mit Brot. Aus der Hand. Sie wird wissen, dass das gelogen ist. Sie wird lachen.', 'verlegen'),
  ] },
  { id: 'party', text: '„Wo stehst du bei der Releaseparty?“', when: A2_PARTY, zeilen: [
    F('Auf dem Turm. Mit Blick auf den Himmelsgarten. Ich soll „verdächtige Bewegungen“ melden. Alle Bewegungen da oben sind verdächtig. Das sind reiche Leute, die tanzen.'),
    F('Ich werd nicht treffen. Ich treffe eh fast nie. Fast ist bei mir eine Maßeinheit. Merk dir das. Für den Fall, dass du mal in meinem Fadenkreuz stehst.', 'signatur'),
  ] },
], ALT, 'Ziel verfehlt. Ich geh.');

const turm = dialog('falke-a2-turm', [
  knoten('start', [
    erz('Oben auf dem Scheinwerferturm, über dem Quantum-Campus. Der Scheinwerfer ist neu, die Halterung noch mit Klebeband geflickt. Falke sitzt daneben, eingewickelt in eine Decke mit Enten.'),
    F('Du hier oben? Das ist Sperrgebiet. Ich müsste dich melden.'),
    F('… Ich hab kein Funkgerät dabei. Ich hab es „vergessen“. Jede Nacht. Ich bin sehr vergesslich geworden.'),
  ], {
    choices: [
      { text: '„Was siehst du von hier?“', next: 'sehen' },
      { text: '„Danke, dass du nichts gesehen hast.“', next: 'danke' },
      { text: '(Wieder runterklettern.)' },
    ],
  }),
  knoten('sehen', [
    F('Den Turm. Jedes Fenster. Im achtundachtzigsten Stock brennt immer Licht. Da sitzt einer und starrt in die Stadt wie ich. Nur, dass er nicht Möwen zählt.'),
    F('Und die Unterstadt. Von hier oben sieht sie aus wie ein Haufen Glühwürmchen in einem Mülleimer. Schön. Ich sag das nur hier oben.'),
  ]),
  knoten('danke', [F('Nichts gesehen. Ich sehe alles. Das ist mein einziges Talent. Aber ich muss es ja nicht jedem erzählen.', 'signatur')], { effects: [herz(ID, 15)] }),
]);

const partynacht = kurz('falke-partynacht', [
  erz('Auf dem Scheinwerferturm. Unten im Himmelsgarten glitzert die Releaseparty wie eine umgekippte Schmuckschatulle. Falke liegt im Anschlag. Sein Finger ist nicht am Abzug. Er ist an einer Nudel.'),
  F('Ich hab hier oben schon drei Kellner, zwei Gäste und einen Hubschrauber im Visier gehabt. Ich hab sie alle verfehlt. Absichtlich. Das ist schwerer als treffen.'),
  F('Mach schnell da drin. Ich kann nicht die ganze Nacht schlecht schießen. Irgendwann fällt das auf.'),
]);

const nachspiel = dialog('falke-nachspiel', [
  knoten('start', [
    erz('Falke sitzt auf einem Klappstuhl, keine Uniform mehr, nur Bademantel mit Enten und Sonnenbrille. Das Gewehr ist weg. Auf seinem Schoß liegt ein Fernglas und ein Heft voller Strichlisten.'),
    F('Gekündigt. Also: Quantum hat mich gekündigt. Also: Es gibt kein Quantum mehr, das mich bezahlen könnte. Ich bin frei. Ich weiß nicht, was man damit macht.'),
  ], {
    effects: [gesehen('falke-nachspiel'), herz(ID, 20)],
    choices: [
      { text: '„Fahr ans Meer. Mit dem Wohnwagen.“', when: ENDE_MEER, next: 'meer' },
      { text: '„Nexus sucht doch Leute, oder?“', when: ENDE_NEXUS, next: 'nexus' },
      { text: '„Ich war eine Weile dein Chef, oder?“', when: ENDE_3B, next: 'dreib' },
      { text: '„Und Vega?“', next: 'vega' },
    ],
  }),
  knoten('meer', [
    F('Hab ich schon. Am Wochenende steh ich am Wagenplatz hinter den Dünen. Da gibt es Möwen. Tausende. Ich zähle sie. Ich komme nie zu Ende.', 'freude'),
    F('Das ist das Beste, was mir je passiert ist. Eine Aufgabe ohne Ende. Und keiner, der sagt, ich soll schießen.'),
  ], { next: 'vega' }),
  knoten('nexus', [
    F('Sie hat mir einen Job angeboten. Über eine Drohne. „Vogelzählung, Hafen und Küste, wissenschaftlich.“ Möwen zählen. Mit Bezahlung.', 'ueberrascht'),
    F('Ich hab Ja gesagt, bevor die Drohne fertig war. Sie hat gesagt: „Das ist eine ausgezeichnete Entscheidung.“ Dann: „Entschuldigung. Alte Gewohnheit.“ Ich mag sie. Ein bisschen.'),
  ], { next: 'vega' }),
  knoten('dreib', [
    F('Eine Woche lang. Du hast mir befohlen, auf dem Turm zu bleiben. Ich bin auf dem Turm geblieben. Ich hab die ganze Woche nichts getroffen. Mit Absicht.', 'wut'),
    F('Jetzt bist du wieder du. Ich hab gekündigt, bevor du zurückgekommen bist. Das war das erste Mal, dass ich vor jemandem Erster war. Danke dafür. Glaub ich.'),
  ], { next: 'vega', effects: [herz(ID, 40)] }),
  knoten('vega', [
    F('Vega hat mir eine Postkarte geschrieben. Vom Meer. Darauf eine Möwe. Daneben: „Vierhundert Meter? Lügner.“', 'freude'),
    F('Ich hab sie an den Spiegel geklebt. Sie ist das Erste, was ich morgens sehe. Ich bin immer noch Zweiter. Aber jetzt in einer Postkarte.'),
  ]),
]);

const nachspielTag = folge('falke-nachspiel-tag', [
  F('Du. Dreitausendzweihundertelf. Möwen. Seit Montag. Eine hinkt. Es ist dieselbe wie früher. Sie ist mir gefolgt.'),
], F('Noch was? Leise. Die Möwen merken sich Stimmen.'), [
  { id: 'schiessen', text: '„Vermisst du das Schießen?“', zeilen: [
    F('Nein. Ich hab nie gern geschossen. Ich hab gern gezielt. Das ist was anderes. Zielen heißt hinsehen. Ich seh jetzt den ganzen Tag hin. Ohne Abzug.'),
  ] },
], ALT, 'Ziel verfehlt. Ich geh.');

const master = kurz('falke-master', [
  erz('Falke steht unten am Kran, einen Seesack über der Schulter, die Uniformjacke zusammengefaltet auf einem Poller. Er sieht dich an. Dann wieder weg. Auf eine Möwe.'),
  F('Du bist jetzt mein Chef. Ich hab gekündigt. Heute Morgen. Per Fax.', 'wut'),
  F('Zum ersten Mal in meinem Leben bin ich Erster. Im Weggehen. Ich hätte nicht gedacht, dass das so gut tut.'),
]);

const dialogues = sammle(a2, turm, partynacht, nachspiel, nachspielTag, master);

/** Talk-Einträge vor dem alten Tagesgespräch (nach Rivale und Erstbegegnung). */
export const TALK_23: TalkDef[] = [
  rede('falke-master', MASTER),
  rede('falke-nachspiel', einmal('falke-nachspiel', NACHSPIEL)),
  rede('falke-nachspiel-tag', NACHSPIEL),
  rede('falke-partynacht', PARTYNACHT),
  rede('falke-a2-turm', { all: [NUR_AKT2, NACHT] }),
  rede('falke-a2', NUR_AKT2),
];

/** Vor dem alten Tagesablauf: Akt 2 nachts auf dem Campus-Turm (act23.json), Nachspiel am Wochenende am Meer. */
export const SCHEDULE_23: ScheduleEntry[] = [
  ort('N', 'quantum-campus', 'scheinwerfer-turm', { when: { all: [AKT2, { not: EPILOG }] } }),
  ort('T', 'das-meer', 'wagenplatz', { days: ['sa', 'so'], when: NACHSPIEL }),
];

export const part: ContentPart = { dialogues };
