// Frau Takt in Akt 2, Akt 3 und im Nachspiel (world.md §5.3–5.5, Epilog-Karte „U-Bahn zum ersten Mal seit 2071
// pünktlich“). Akt 2: Nexus fährt die U-Bahn unheimlich pünktlich, Chrome-10-Ansagen; Partynacht mit Stoppuhr;
// Nachspiel je Ende, samstagmorgens am Strand-Shuttle, wenn sie den Schichtplan für side-strandclub gemacht hat
// (strandclub_personal_frau-takt); Master-Modus. Wird von frau-takt.ts in NpcDef.talk/schedule eingehängt.
import type { ContentPart } from '../../part';
import type { ScheduleEntry, TalkDef } from '../../../modules/contracts';
import { dialog, erz, herz, knoten, ort, rede, sammle, sprecher } from './_welt';
import {
  A2_PARTY, CLUB_OFFEN, ENDE_3B, ENDE_MEER, ENDE_NEXUS, MASTER, NACHSPIEL, NUR_AKT2, PARTYNACHT, einmal, folge, gesehen,
  kurz,
} from './akt23-phasen';

const ID = 'frau-takt';
const T_ = sprecher(ID);
const ALT = 'takt-tag-standard';
const SCHICHTPLAN = { all: [NACHSPIEL, CLUB_OFFEN, { flag: 'strandclub_personal_frau-takt' }] };

const a2 = folge('takt-a2', [
  erz('Im Stellwerk ticken vierzehn Stoppuhren. Frau Takt starrt auf die Anzeigetafel. Linie 1: pünktlich. Linie 2: pünktlich. Linie 3: pünktlich. Vorwärts. Sie sieht aus, als hätte sie ein Gespenst gesehen.'),
  T_('Sie sind um 9:14 Uhr angekommen. Auf die Sekunde. Wie alle. Seit Montag ist jeder Zug pünktlich. Jeder. Wissen Sie, wer das macht? Nicht ich.', 'besorgt'),
], T_('Weiter. Sie haben noch vierzig Sekunden. Die Bahn auch. Genau vierzig. Es ist widerlich.'), [
  { id: 'nexus', text: '„Wer macht das dann?“', zeilen: [
    T_('Das System. Quantum hat die Steuerung übernommen. „Optimierung durch Nexus.“ Ich hab nichts mehr zu tun. Ich drücke meine Uhren und sie stimmen alle. Alle vierzehn.'),
    T_('Sogar die eine, die absichtlich drei Sekunden nachgeht. Die geht jetzt richtig. Ich hab sie nicht gestellt. Jemand war in meiner Uhr.', 'wut'),
  ] },
  { id: 'ansage', text: '„Was ist mit den Durchsagen?“', zeilen: [
    erz('Aus dem Lautsprecher über dem Bahnsteig, eine glatte Stimme: „Bitte beachten Sie: Chrome 10 macht Ihre Fahrt angenehmer. Steigen Sie ein. Das ist eine ausgezeichnete Entscheidung.“'),
    T_('Früher hat die Kollegin von der Ansage gesagt: „Linie 3 fährt heute rückwärts, wir bitten um Verständnis.“ Mit Seufzer. Jetzt sagt das Ding das. Ohne Seufzer. Ich vermisse den Seufzer.'),
  ] },
  { id: 'party', text: '„Wir gehen auf die Releaseparty.“', when: A2_PARTY, zeilen: [
    T_('Einlass einundzwanzig Uhr. Sie kommen um einundzwanzig Uhr vier. Vier Minuten zu spät ist bei den Reichen „stilvoll“. Fünf ist „unhöflich“. Drei ist „gierig“.'),
    T_('Ich hab das ausgerechnet. Ich hab sonst nichts mehr auszurechnen.', 'signatur'),
  ] },
], ALT, 'Ich will Sie nicht aufhalten.');

const partynacht = kurz('takt-partynacht', [
  erz('Das Stellwerk ist dunkel bis auf einen kleinen Bildschirm. Frau Takt sitzt davor, eine Stoppuhr in jeder Hand. Auf dem Bildschirm: die Releaseparty.'),
  T_('Die Rede von diesem Blade läuft seit elf Minuten und zweiundvierzig Sekunden. Die Gäste klatschen alle vierzig Sekunden. Exakt. Das ist kein Applaus. Das ist ein Fahrplan.', 'besorgt'),
  T_('Machen Sie da oben was Unpünktliches. Bitte. Ich halte das nicht mehr aus.'),
]);

const nachspiel = dialog('takt-nachspiel', [
  knoten('start', [
    erz('Die Anzeigetafel flackert. Linie 1: zwei Minuten zu spät. Linie 3: fährt, aber rückwärts. Frau Takt steht davor und lächelt. Dann weint sie ein bisschen. Dann drückt sie eine Stoppuhr.'),
    T_('Sie sind um 16:31 Uhr angekommen. Ihr Zug war für 16:28 Uhr angesetzt. Das ist WUNDERBAR.', 'freude'),
  ], {
    effects: [gesehen('takt-nachspiel'), herz(ID, 20)],
    choices: [
      { text: '„Die Bahn ist wieder unpünktlich. Zufrieden?“', when: ENDE_MEER, next: 'meer' },
      { text: '„Nexus fährt die Bahn jetzt freundlich, oder?“', when: ENDE_NEXUS, next: 'nexus' },
      { text: '„Ich war eine Verspätung. Eine lange.“', when: ENDE_3B, next: 'dreib' },
    ],
  }),
  knoten('meer', [
    T_('Zufrieden? Ich bin glücklich. Die Fahrgäste sind verstört. Sie stehen am Bahnsteig und wissen nicht, was sie tun sollen, wenn der Zug nicht kommt.'),
    T_('Ich hab ihnen gezeigt, wie man wartet. Mit Zeitung. Mit Nachbarn reden. Mit Fluchen. Die Linie 3 hat geweint. Das war die Bremse. Aber es klang wie Weinen.'),
  ]),
  knoten('nexus', [
    T_('Freundlich, ja. Sie hat mich gefragt. Per Durchsage, mitten im Berufsverkehr: „Frau Takt, wie wollen Sie es haben?“ Alle haben mich angeguckt.', 'verlegen'),
    T_('Ich hab gesagt: Pünktlich. Aber mit Seufzer. Jetzt seufzt die Durchsage, bevor sie die Verspätung ansagt. Es sind nur noch dreißig Sekunden. Die Fahrgäste sind verstört. Zum ersten Mal seit 2071.'),
    T_('Und sie hat sich entschuldigt. Für meinen Mann. Linie 3, 7:14 Uhr. Sie war damals nicht mal gebaut. Sie hat sich trotzdem entschuldigt. Ich weiß nicht, was ich davon halten soll.', 'trauer'),
  ]),
  knoten('dreib', [
    T_('Eine lange. Sieben Tage, vierzehn Stunden, zwölf Minuten. Ich hab mitgestoppt. Ich hab die Uhr nicht angehalten, als es schlimm war.', 'besorgt'),
    T_('Jetzt halte ich sie an. So. Klick. Willkommen zurück. Sie sind zu spät. Aber Sie sind da.'),
  ], { effects: [herz(ID, 40)] }),
]);

const nachspielTag = folge('takt-nachspiel-tag', [
  T_('Sie haben fünfzig Sekunden. Ab jetzt. Neunundvierzig. Nehmen Sie sich ruhig mehr. Ich hab gelernt, großzügig zu sein. Mit Ihnen.'),
], T_('Weiter. Die Linie 1 ist zwei Minuten zu spät. Herrlich.'), [
  { id: 'shuttle', text: '„Wie läuft der Shuttle zum Strand?“', when: CLUB_OFFEN, zeilen: [
    T_('Abfahrt, wenn voll. Oder wenn Hannes Feierabend hat. Das ist kein Fahrplan, das ist Anarchie. Ich habe einen Schichtplan danebengehängt. Laminiert.'),
    T_('Samstagmorgens stehe ich selbst am Halt. Mit Stoppuhr. Am Meer. Der Wind nimmt mir die Zeit weg. Ich lass ihn.', 'zaertlich'),
  ] },
], ALT, 'Ich will Sie nicht aufhalten.');

const master = kurz('takt-master', [
  erz('Frau Takt drückt eine Stoppuhr, als du hereinkommst. Dann legt sie sie weg. Mit dem Ziffernblatt nach unten.'),
  T_('Sie sind eine Verspätung auf zwei Beinen. Für immer. Ich messe Sie nicht mehr. Sie sind es nicht wert, dass ich eine Uhr für Sie verschwende.', 'wut'),
  T_('Gehen Sie. Zügig. Ohne Halt. Und wenn Sie je wieder ankommen wollen: Der Fahrplan hängt draußen. Er gilt auch für Master.'),
]);

const dialogues = sammle(a2, partynacht, nachspiel, nachspielTag, master);

/** Talk-Einträge vor dem alten Tagesgespräch (nach Rivale und Erstbegegnung). */
export const TALK_23: TalkDef[] = [
  rede('takt-master', MASTER),
  rede('takt-nachspiel', einmal('takt-nachspiel', NACHSPIEL)),
  rede('takt-nachspiel-tag', NACHSPIEL),
  rede('takt-partynacht', PARTYNACHT),
  rede('takt-a2', NUR_AKT2),
];

/** Nachspiel: samstagmorgens am Strand-Shuttle (nach ihrem Schichtplan für side-strandclub). */
export const SCHEDULE_23: ScheduleEntry[] = [
  ort('M', 'das-meer', 'shuttle-halt', { days: ['sa'], when: SCHICHTPLAN }),
];

export const part: ContentPart = { dialogues };
