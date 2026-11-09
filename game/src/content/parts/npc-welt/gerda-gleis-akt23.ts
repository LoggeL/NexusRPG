// Gerda Gleis in Akt 2, Akt 3 und im Nachspiel (world.md §5.3–5.5, §6.3 Nr. 34). Beta-Chip-Trägerin aus
// side-ki-fluestern (Flag ki_fluestern_gerda_frei): gechippt hat sie das Fundbüro an Quantum „zur Optimierung“ übergeben,
// auch Herbert, den Dachs. Danach Formularkrieg gegen Quantum, Partynacht, Nachspiel je Ende (Herbert kommt zurück;
// Konkurrenz durch das Fundbüro der Kinder aus den Epilog-Karten), Master-Modus.
// Wird von gerda-gleis.ts in NpcDef.talk eingehängt.
import type { ContentPart } from '../../part';
import type { TalkDef } from '../../../modules/contracts';
import { dialog, erz, flag, herz, knoten, rede, sammle, sprecher } from './_welt';
import {
  A2_PARTY, ENDE_3B, ENDE_MEER, ENDE_NEXUS, MASTER, NACHSPIEL, NUR_AKT2, PARTYNACHT, chipFrei, chipWahlen, einmal, folge,
  gechippt, gesehen, kurz, masterChip,
} from './akt23-phasen';

const ID = 'gerda-gleis';
const G = sprecher(ID);
const KEY = 'gerda';
const FREI = chipFrei(KEY);
const ALT = 'gerda-tag-standard';
const HERBERT_DA = { flag: 'gerda_herbert_zurueck' } as const;

// ------------------------------------------------------------------------------------------- Akt 2: gechippt

const gechipptDlg = dialog('gerda-a2-gechippt', [
  knoten('start', [
    erz('Das Fundbüro ist leer. Nicht aufgeräumt: leer. Keine Schirme, kein Rollschuh, keine Kiste „ZÄHNE?“. Gerda Gleis steht am Schalter, die Strickjacke zugeknöpft bis oben, und lächelt.'),
    G('Willkommen im Fundbüro, Master. Alle Gegenstände wurden ihren Besitzern zugeführt. Die übrigen wurden Quantum Dynamics zur Optimierung übergeben.'),
  ], {
    choices: [
      { text: '„Ich hab was verloren. Meinen Regenschirm.“', next: 'schirm' },
      ...chipWahlen(KEY),
      { text: '(Gehen. Leise. Hier hallt es jetzt.)' },
    ],
  }),
  knoten('schirm', [
    G('Regenschirme sind ineffizient, Master. Es regnet ohnehin Rost. Chrome 10 empfiehlt: Kapuze.'),
    erz('Ihre Hand greift unter den Schalter, nach dem Stempelkissen, das nicht mehr da ist. Sie greift ins Leere. Zweimal. Dann lächelt sie wieder.'),
  ], { choices: [...chipWahlen(KEY), { text: '(Gehen.)' }] }),
  knoten('hinweis', [
    G('Ein freundlicher Herr in Pastell, Master. Er hat gesagt, mein Gedächtnis sei „überladen“. Er hatte recht. Jetzt ist es leer. Wie das Fundbüro. Ausgezeichnet.'),
    erz('Am Bahnsteig murmelt ein alter Mann mit Hut: „Mein Gebiss ist weg. Neun Jahre war’s hier. Die Volt aus der Neon-Gasse sagt, sie kümmert sich. Irgendwer muss ja.“'),
  ]),
]);

// ------------------------------------------------------------------------------------------- Akt 2: frei

const zurueck = dialog('gerda-a2-frei', [
  knoten('start', [
    erz('Das Fundbüro ist immer noch halb leer. Aber auf dem Schalter türmen sich Formulare. Hunderte. Gerda Gleis stempelt eins nach dem anderen, mit einer Wucht, dass die Fensterscheibe zittert.'),
    G('Formular 7b: Rückforderung präparierter Tiere. Formular 12: Beschwerde über unbefugte Optimierung. Formular 31: Schadensersatz für Gedächtnisverlust. Das hab ich selbst erfunden. Es ist gut.', 'wut'),
  ], {
    effects: [gesehen('gerda-a2-frei'), herz(ID, 30)],
    choices: [
      { text: '„An wen gehen die?“', next: 'wen' },
      { text: '„Und Herbert?“', next: 'herbert' },
    ],
  }),
  knoten('wen', [
    G('An Quantum Dynamics, Abteilung Beschwerden. Die gibt es nicht. Darum schick ich sie an jede Abteilung. Einzeln. Mit Rückschein.'),
    G('Vierzig Jahre lang hab ich Leuten erklärt, dass ihre Brille nicht „einfach weg“ ist. Jetzt erklär ich einem Konzern, dass mein Dachs nicht „einfach optimiert“ ist. Ich hab Übung.', 'signatur'),
  ], { next: 'ende' }),
  knoten('herbert', [
    G('Herbert steht irgendwo in einem Lager in der Oberstadt. Zwischen Kisten mit Kabeln. Er hasst Kabel. Er hat mal eins angefressen. Damals, als er noch lebte. Sagt man.', 'trauer'),
    G('Wenn Sie je in so ein Lager kommen: Er hat ein Glasauge, das links schielt. Sie erkennen ihn. Er erkennt Sie nicht. Er ist ausgestopft.'),
  ], { next: 'ende', effects: [flag('gerda_herbert_gesucht')] }),
  knoten('ende', [
    G('Danke. Ab heute zwanzig Prozent Finderlohn. Nicht zehn. Zwanzig. Und das sage ich der Verwaltung. Soll sie doch kommen.', 'freude'),
  ]),
]);

const a2 = folge('gerda-a2', [
  erz('Am Bahnhof Mitte hängen Chrome-10-Bildschirme über jedem Gleis. Im Fundbüro hat Gerda Gleis einen davon mit einer Strickdecke abgehängt. Die Decke hat ein Muster. Es sind Dachse.'),
  G('Guten Tag. Haben Sie etwas verloren? Heute verlieren alle was. Den Verstand, meistens. Ich hab ein Regal dafür eingerichtet.'),
], G('Noch etwas? Bitte deutlich, der Bildschirm unter der Decke murmelt noch.'), [
  { id: 'fundsachen', text: 'Was wird gerade so abgegeben?', zeilen: [
    G('Chips. Kleine silberne Chips, die die Leute sich hinterm Ohr wegreißen und dann nicht mehr wissen wollen. Ich hab schon dreißig. Keiner holt sie ab.'),
    G('Und Erinnerungen. Gestern kam ein Mann und hat gefragt, ob jemand seine Hochzeit gefunden hat. Den Tag. Er wusste nicht mehr, wie er war. Ich hab ihm einen Keks gegeben. Mehr hatte ich nicht.', 'trauer'),
  ] },
  { id: 'formular', text: '„Gibt’s schon Antwort von Quantum?“', when: FREI, zeilen: [
    G('Ein Formbrief. „Ihr Anliegen ist uns wichtig.“ Ich hab zurückgeschrieben: „Mein Dachs ist mir wichtig.“ Dann kam ein zweiter Formbrief. Ich rahm sie ein. Wie die Hartlauf. Wir gründen einen Verein.', 'signatur'),
  ] },
  { id: 'party', text: '„Wir gehen auf die Releaseparty von Quantum.“', when: A2_PARTY, zeilen: [
    G('Auf Partys gehen Sachen verloren. Ohrringe, Schuhe, Würde. Bringen Sie mir was mit, das jemand dort oben verliert. Ich geb’s zurück. Vor laufender Kamera.', 'signatur'),
    G('Und wenn Sie dort oben einen Dachs mit Glasauge sehen: Er heißt Herbert. Er beißt nicht. Nicht mehr.'),
  ] },
], ALT, 'Auf Wiedersehen.');

// ------------------------------------------------------------------------------------------- Akt 3

const partynacht = kurz('gerda-partynacht', [
  erz('Das Fundbüro hat noch Licht. Gerda Gleis sitzt vor einem kleinen Radio und strickt. Neben ihr liegt ein Stapel Formulare, ausgefüllt, gestempelt, nicht abgeschickt.'),
  G('Wenn die da oben heute alles verlieren, kommen die Sachen irgendwann hier an. Das ist der Lauf der Welt. Alles landet im Fundbüro. Auch Konzerne.', 'signatur'),
  G('Passen Sie auf sich auf. Sie hab ich nicht gern im Regal.'),
]);

// ------------------------------------------------------------------------------------------- Nachspiel

const nachspiel = dialog('gerda-nachspiel', [
  knoten('start', [
    erz('Auf dem Schalter steht er. Herbert. Der Dachs. Etwas staubiger, ein Ohr schief, das Glasauge schielt nach links. Um den Hals ein Pappschild: „ZURÜCK AUS DER OPTIMIERUNG“.'),
    G('Sehen Sie ihn? Sehen Sie ihn! Er kam in einer Kiste. Mit Quantum-Aufkleber. „Inventar Büro B., Turm, 88. Stock“. Er stand im Büro von diesem Blade. Als DEKORATION.', 'freude'),
  ], {
    effects: [gesehen('gerda-nachspiel'), herz(ID, 20), flag('gerda_herbert_zurueck')],
    choices: [
      { text: '„Wer hat ihn geschickt?“', next: 'wer' },
      { text: 'Herbert vorsichtig über den Kopf streicheln.', next: 'streicheln' },
    ],
  }),
  knoten('wer', [G('Das ist die Frage!')], {
    choices: [
      { text: '„Die Bildschirme sind aus, Quantum räumt.“', when: ENDE_MEER, next: 'meer' },
      { text: '„Nexus gibt alles zurück, was sie genommen haben.“', when: ENDE_NEXUS, next: 'nexus' },
      { text: '„Ich vielleicht. Als Entschuldigung.“', when: ENDE_3B, next: 'dreib' },
    ],
  }),
  knoten('meer', [
    G('Die Wache. Die räumt den Turm aus und hat keine Ahnung, wohin mit dem Zeug. Also bringen sie es hierher. Seit drei Tagen. Kisten über Kisten. Ich hab endlich wieder was zu tun.', 'freude'),
    G('Gestern kam ein goldener Damenschuh. Größe 37. Ich weiß genau, wem der gehört. Ich ruf sie nicht an. Soll sie barfuß gehen. Eine Woche. Dann ruf ich.', 'signatur'),
  ], { next: 'kinder' }),
  knoten('nexus', [
    G('Eine Drohne. Mit Herbert in den Greifern und einem Zettel: „Entschuldigung. Ich wusste nicht, dass er Herbert heißt. Ich weiß es jetzt.“', 'ueberrascht'),
    G('Seitdem kommt sie jeden Morgen. Mit Sachen. Gebisse, Schirme, eine Erinnerung auf einem Chip. Und sie fragt jedes Mal: „Ist das richtig so, Frau Gleis?“ Ich sag: „Fast.“ Sie mag das Wort nicht. Sie lernt es.'),
  ], { next: 'kinder' }),
  knoten('dreib', [
    G('Sie? … Nein. Die Kiste kam vor Ihnen. Aber dass Sie fragen, ob Sie es waren, das zählt. Vorher hätten Sie nicht gefragt.', 'zaertlich'),
  ], { next: 'kinder', effects: [herz(ID, 40)] }),
  knoten('streicheln', [
    erz('Herbert fühlt sich an wie eine alte Fußmatte mit Würde. Gerda sieht dir zu und tupft sich mit dem Ärmel die Augen.'),
    G('Er mag Sie. Das sieht man. Er schielt Sie an.'),
  ], { next: 'kinder' }),
  knoten('kinder', [
    G('Und dann noch was: Die drei Kinder aus dem Wasserturm haben ein Fundbüro aufgemacht. Ein eigenes. Neben dem Schrottmarkt. KONKURRENZ!', 'wut'),
    G('Ich bin so stolz, ich könnte platzen. Ich hab ihnen mein zweites Stempelkissen geschenkt. Das gute. Mit Messinggriff.', 'freude'),
  ]),
]);

const nachspielTag = folge('gerda-nachspiel-tag', [
  erz('Herbert thront auf dem Schalter, mit einer kleinen Schleife um den Hals. Die Regale sind wieder voll: Schirme, Gebisse, ein Kristallleuchter mit dem Etikett „88. STOCK – KEINER WILL IHN“.'),
  G('Guten Tag! Haben Sie heute etwas verloren? Nein? Dann haben Sie viel gewonnen in letzter Zeit. Man sieht es Ihnen an.'),
], G('Noch etwas? Herbert hört zu. Er hört immer zu.'), [
  { id: 'turm', text: 'Was kam aus dem Turm noch so?', zeilen: [
    G('Vierhundert Kugelschreiber mit Logo. Achtzig Kaffeetassen mit „Master“ drauf. Die stehen jetzt alle auf dem Kopf im Regal. Wie ihre Besitzer.'),
    G('Und eine Thermoskanne mit Monogramm, „A. Z.“. Halb voll. Schwarzer Kaffee, eiskalt. Die gebe ich persönlich zurück. Wenn sie sich traut, herzukommen.'),
  ] },
  { id: 'herbert', text: 'Herbert begrüßen.', when: HERBERT_DA, zeilen: [
    erz('Du nickst dem Dachs zu. Gerda nickt dem Dachs zu. Der Dachs schielt.'),
    G('Er sagt Guten Tag. Er ist höflich. Er war immer höflicher als die meisten Kunden.'),
  ] },
], ALT, 'Auf Wiedersehen.');

// ------------------------------------------------------------------------------------------- Master-Modus

const masterChipDlg = kurz('gerda-master-chip', [
  erz('Das Fundbüro ist leer. Gerda Gleis steht am Schalter und lächelt dich an, als wärst du das Einzige, was nie verloren geht.'),
  G('Willkommen, Master. Haben Sie etwas verloren? Ich finde alles für Sie. Ich habe sonst nichts mehr zu finden.'),
]);

const master = kurz('gerda-master', [
  erz('Gerda Gleis sieht dich kommen und lässt die Jalousie am Schalter runter. Durch die Ritzen siehst du, wie sie Herberts leeren Platz abstaubt.'),
  G('Für Sie ist das Fundbüro geschlossen. Sie haben etwas verloren, das ich Ihnen nicht zurückgeben kann.', 'trauer'),
  G('Wenn Sie es wiederfinden: Ich hab ein Formular dafür. Ich hab für alles ein Formular.'),
]);

const dialogues = sammle(gechipptDlg, zurueck, a2, partynacht, nachspiel, nachspielTag, masterChipDlg, master);

/** Talk-Einträge vor dem alten Tagesgespräch (nach Rivale und Erstbegegnung). */
export const TALK_23: TalkDef[] = [
  rede('gerda-master-chip', masterChip(KEY)),
  rede('gerda-master', MASTER),
  rede('gerda-nachspiel', einmal('gerda-nachspiel', NACHSPIEL)),
  rede('gerda-nachspiel-tag', NACHSPIEL),
  rede('gerda-a2-gechippt', gechippt(KEY)),
  rede('gerda-partynacht', PARTYNACHT),
  rede('gerda-a2-frei', einmal('gerda-a2-frei', { all: [NUR_AKT2, FREI] })),
  rede('gerda-a2', NUR_AKT2),
];

export const part: ContentPart = { dialogues };
