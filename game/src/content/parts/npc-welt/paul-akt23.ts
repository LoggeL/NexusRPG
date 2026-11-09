// Paul in Akt 2, Akt 3 und im Nachspiel (world.md §4.5: ab act2 Beta-Chip-Träger, §6.3 Nr. 34 side-ki-fluestern).
// Kein eigener Inhaltsteil: paul.ts holt Phasen, Tagesablauf-Vorsatz und die Sperre der Herz-Ereignisse von hier.
// Gechippt bis side-ki-fluestern ihn befreit (Flag ki_fluestern_paul_frei); die Befreiung selbst läuft über den
// Hotspot der Quest (quest-side-23-a), hier nur das Davor und Danach.
import type { Condition, DialogueChoice, ScheduleEntry } from '../../../modules/contracts';
import { type Menue, erz, flag, herz, knoten, ort, sprecher } from './_welt';
import {
  type Akt23, AKT2_NUR, AKT3_NACHT, ARIA_GECHIPPT, ENDE_3B, ENDE_MEER, ENDE_NEXUS, EPILOG_FREI, MASTER, PARTY_VORB,
  alle, erweitere, nicht, phasen, thema,
} from './_lz-akt23';

const ID = 'paul';
const P = sprecher(ID);
const O = sprecher('oma-volt');
const Q = 'side-ki-fluestern';

const FREI: Condition = { flag: 'ki_fluestern_paul_frei' };
/** Ab Akt 2 trägt Paul den Beta-Chip – bis die Quest ihn befreit oder das Nachspiel die Chips abschaltet. */
export const GECHIPPT: Condition = alle({ act: 2 }, nicht(FREI), { notFlag: 'epilog' });
const NIE_BEFREIT: Condition = alle(EPILOG_FREI, nicht(FREI));
const JOB: Condition = { seen: 'he-paul-4' };

// ---------------------------------------------------------------------------------------------- Gechippt

const ZG: DialogueChoice[] = [{ text: 'Noch was, Paul.', next: 'menue' }, { text: 'Lass gut sein.' }];

const chipWahlen: DialogueChoice[] = [
  { text: '„Paul. Ich bin’s.“', next: 'c-ich' },
  { text: '„Was macht die Bewerbung?“', next: 'c-bewerbung' },
  { text: '„Ich hab dich gewarnt, Paul. Vor dem Werbestand.“', when: { flag: 'paul_gewarnt' }, next: 'c-gewarnt' },
  { text: '„Was ist das hinter deinem Ohr?“', next: 'c-ohr' },
  { text: '„Ich hol dich da raus.“', when: { quest: Q, state: 'inactive' }, next: 'c-raus' },
  { text: 'Lass gut sein.' },
];

const chipNodes = [
  knoten('menue', [P('Haben Sie weitere Wünsche, Master? Ich habe sehr viele Antworten. Alle sind ausgezeichnet.')], { choices: chipWahlen }),
  knoten('c-ich', [
    P('Selbstverständlich sind Sie Sie, Master. Ich bin auch ich. Ich bin Paul. Paul ist zufrieden. Paul ist ein zufriedener Kunde.'),
    erz('Er lächelt. Das Lächeln sitzt eine Spur zu weit oben, als hätte es jemand nach Augenmaß angeklebt.'),
  ], { choices: ZG }),
  knoten('c-bewerbung', [
    P('Ich habe mich bei Quantum Dynamics beworben, Master. Ich wurde sofort angenommen. Als Kunde. Kunde ist ein sehr sicherer Beruf.'),
    P('Bewerbung dreiundvierzig war an Sie. Sie haben nicht geantwortet. Das ist eine ausgezeichnete Entscheidung.'),
  ], { choices: ZG }),
  knoten('c-gewarnt', [
    P('Ihre Warnung wurde gespeichert, Master. Und optimiert. Sie lautet jetzt: „Lass die Finger von Gratis-Chips, außer von diesem.“'),
    erz('Für einen Herzschlag rutscht sein Blick weg, zu den Namensschildern in seiner Jacke. „PAUL – bei Verlust bitte bei Oma Volt abgeben“.'),
    P('Ich hab gewartet. Ehrlich. Drei Wochen. Dann gab’s … Snacks. Es gab Snacks, Master.', 'besorgt'),
    P('Entschuldigung. Das war ein Fehler in der Ausgabe. Möchten Sie gefegt werden?'),
  ], { choices: ZG, effects: [herz(ID, 5)] }),
  knoten('c-ohr', [
    erz('Hinter seinem linken Ohr sitzt ein Chip, klein wie ein Hustenbonbon. Er blinkt. Im Takt von irgendwas, das nicht Pauls Herz ist.'),
    P('Das ist Chrome 10 Beta, Master. Er sagt mir, wann ich glücklich bin. Ich bin jetzt sehr oft glücklich. Es ist anstrengend.'),
  ], { choices: ZG }),
  knoten('c-raus', [
    P('Raus? Es gibt kein Raus, Master. Es gibt nur Upgrades.'),
    P('Tante Volt sagt das auch. Also das mit dem Raus. Sie schreit dabei. Sie hat mir eine Kelle gegen den Chip gehauen. Der Chip hat sich bedankt.'),
    erz('Wenn jemand Paul da rausholt, dann mit Oma Volt im Rücken. Ihr Kiosk ist gleich um die Ecke.'),
  ], { choices: ZG }),
];

// ---------------------------------------------------------------------------------------------- Menü (frei)

const extra = (M: Menue): Menue => erweitere(M, [
  thema(ID, 'ohr', '„Wie geht’s dem Ohr?“', 'p23-ohr', alle({ act: 2 }, FREI)),
  thema(ID, 'werbestand', '„Hast du den Werbestand noch mal gesehen?“', 'p23-werbestand', alle(AKT2_NUR, FREI)),
], [
  knoten('p23-ohr', [
    P('Juckt. Tante Volt hat ein Pflaster draufgeklebt. Mit Namensschild. „OHR – gehört Paul“. Falls es abfällt.', 'verlegen'),
    P('Manchmal wach ich nachts auf und sag „Master“. Dann sag ich ganz schnell „Scheiße“ hinterher. Damit es sich ausgleicht.'),
  ], { choices: [{ text: 'Noch was, Paul.', next: 'menue' }, { text: 'Mach’s gut.' }] }),
  knoten('p23-werbestand', [
    P('Ich geh da jeden Tag vorbei und sag laut „Nein“. Einfach so. Die Frau am Stand guckt jetzt schon weg, wenn sie mich sieht.', 'wut'),
    P('Fünfzig Credits und Reiswaffeln. Für mein Gehirn. Mein Gehirn ist mehr wert. Mindestens sechzig.'),
  ], { choices: [{ text: 'Noch was, Paul.', next: 'menue' }, { text: 'Mach’s gut.' }] }),
]);

// ---------------------------------------------------------------------------------------------- Phasen

export function akt23(M0: Menue): Akt23 & { schedule: ScheduleEntry[] } {
  const M = extra(M0);
  const chip = { choices: chipWahlen, nodes: chipNodes };
  const p = phasen(ID, 'paul-23', M, [
    {
      id: 'master-chip', when: alle(MASTER, nicht(FREI)), wahlen: chip,
      gruss: [
        erz('Paul steht stramm, als du in die Gasse kommst. Den Besen hält er wie ein Gewehr. Die Tauben auf dem Dach stehen auch stramm. Das ist neu.'),
        P('Master. Willkommen zurück, Master. Ich habe die Gasse gefegt. Zweimal. Für Sie. Darf ich Sie fegen?'),
      ],
    },
    {
      id: 'master', when: MASTER, ohneMenue: true,
      gruss: [
        erz('Paul sieht dich und greift sich ans Ohr. An die Stelle, wo der Chip war. Er tritt einen Schritt zurück, und Oma Volt tritt einen Schritt vor.'),
        O('Du hast ihn mir zurückgebracht. Und dann hast du dich selbst auf den Thron gesetzt, von dem aus sie ihn mir weggenommen haben. Verpiss dich aus meiner Gasse.', 'wut'),
        P('Mein Ohr juckt, wenn du da bist. Das hat es vorher nie gemacht. Tschüss … Master. Nein. Tschüss.', 'besorgt'),
      ],
    },
    {
      id: 'aufgewacht', when: NIE_BEFREIT, einmal: true, effects: [herz(ID, 20), flag('paul_chip_ab_nachspiel')],
      gruss: [
        erz('Paul sitzt auf dem Bordstein vor dem Kiosk, ein Pflaster hinterm Ohr, einen Teller Nudeln mit Ketchup auf den Knien. Oma Volt steht hinter ihm wie eine Leibwache.'),
        P('Ich bin aufgewacht. Mit einem Besen in der Hand. Vor dem Kiosk. Um vier Uhr morgens. Der Chip hat einfach … aufgehört. Hat „Danke für Ihre Geduld“ gesagt und ist aus.', 'ueberrascht'),
        P('Tante Volt hat geweint. Dann hat sie mich gehauen. Dann hat sie Nudeln gemacht. In der Reihenfolge.'),
        O('In der richtigen Reihenfolge, Kindchen.', 'zaertlich'),
      ],
    },
    {
      id: 'ende-3b', when: alle(ENDE_3B, FREI), einmal: true,
      gruss: [
        P('Du bist wieder du! Tante Volt sagt, du warst eine Weile … so wie ich. Nur mit Büro.', 'freude'),
        P('Ich weiß, wie das ist. Man wacht auf und schämt sich für Sachen, die man nicht mal selbst gemacht hat. Hier. Nudeln. Hilft.'),
      ],
    },
    {
      id: 'ende-nexus', when: alle(ENDE_NEXUS, FREI), einmal: true,
      gruss: [
        P('Die neue KI hat mir eine Nachricht geschickt. Aufs Telefon. „Lieber Paul, es tut mir leid. Mit freundlichen Grüßen, Ihre Kollegin.“', 'ueberrascht'),
        P('Ich hab zurückgeschrieben: „Schon gut. Aber nie wieder Reiswaffeln.“ Sie hat „Verstanden“ geschrieben. Das hat noch nie einer zu mir geschrieben.'),
      ],
    },
    {
      id: 'ende-meer', when: alle(ENDE_MEER, FREI), einmal: true,
      gruss: [
        P('Ich hab’s im Stadt-TV gesehen! Wie sie den Anzugtypen abgeführt haben! Tante Volt hat so laut gejubelt, dass Opa Blech in Alarmbereitschaft gegangen ist.', 'freude'),
        P('Und ihr fahrt ans Meer. Echt ans Meer. Nehmt ihr Bewerbungen an? Ich kann Nudeln. Ohne Feuer.'),
      ],
    },
    {
      id: 'epilog-job', when: alle(EPILOG_FREI, JOB, { time: 'tag' }, { weekday: ['mo', 'mi', 'fr'] }), taeglich: true,
      gruss: [
        erz('Paul steht hinter der Theke vom Imbiss „Lötkolben“, Papiermütze schief, die Schürze mit Namensschild. Hinter ihm brutzelt die Fritteuse. Er darf sie inzwischen anfassen.'),
        P('Willkommen im Lötkolben! Was darf’s sein? Sag nicht „das Übliche“. Ich hab noch kein Übliches. Ich bin erst seit drei Wochen fest!', 'freude'),
      ],
      plausch: [P('Mein Chef sagt, ich bin der höflichste Mitarbeiter, den er je hatte. Ich hab gesagt: „Ich arbeite dran.“ Ich will nie wieder zu höflich sein.', 'verlegen')],
    },
    {
      id: 'epilog', when: EPILOG_FREI, taeglich: true,
      gruss: [P('Hi! Ich steh hier. Wie immer. Aber jetzt, weil ich will. Das ist ein Riesenunterschied. Von außen sieht man ihn nicht.', 'freude')],
      plausch: [P('Bewerbung Nummer fünfzig ist raus. Ans Hafenamt. Ich hab reingeschrieben: „Stärken: unbestechlich. Seit Neuestem.“')],
    },
    {
      id: 'akt3-chip', when: alle(AKT3_NACHT, nicht(FREI)), wahlen: chip,
      gruss: [
        erz('Paul steht mitten in der Neon-Gasse und starrt nach oben, zur Oberstadt, wo die Releaseparty glitzert. Sein Chip blinkt jetzt schneller. Viel schneller.'),
        P('Heute ist Release, Master. Ich freue mich so sehr. Mir tut das Gesicht weh vor Freude. Ist das normal?'),
      ],
    },
    {
      id: 'akt3', when: AKT3_NACHT,
      gruss: [
        erz('Paul hockt mit Oma Volt vor dem kleinen Fernseher im Kiosk. Live aus dem Himmelsgarten: Champagner, Chrom, Lächeln. Paul hält sich die Hand hinters Ohr, als müsste er es festhalten.'),
        P('Die verteilen da oben Chips. An alle. Live. Und alle klatschen.', 'besorgt'),
        P('Mach sie kaputt. Bitte. Die da oben haben auch Tanten.'),
      ],
    },
    {
      id: 'aria', when: alle(ARIA_GECHIPPT, FREI), einmal: true,
      gruss: [
        P('Tante Volt hat gesagt, die mit dem Baseballschläger hat jetzt auch so ein Ding. Aria. Nur schlimmer. Richtig drin.', 'trauer'),
        P('Wenn du sie zurückholst: Sag ihr nicht, dass sie gefegt hat. Falls sie gefegt hat. Das ist das Schlimmste. Glaub mir.'),
      ],
    },
    {
      id: 'party', when: alle(PARTY_VORB, FREI), taeglich: true,
      gruss: [P('Ihr geht auf die Party? Die Chip-Party? Freiwillig? … Okay. Nehmt Kekse von Dante mit. Die wirken. Ich weiß nicht, wie. Wissenschaft.', 'besorgt')],
    },
    {
      id: 'frei', when: alle(AKT2_NUR, FREI), einmal: true, effects: [herz(ID, 20)],
      gruss: [
        erz('Paul steht an seiner Ecke. Ohne Besen. Er hält die Hände in den Jackentaschen, als hätte er Angst, dass sie wieder anfangen zu fegen.'),
        P('Hi. Ich bin’s. Paul. Der echte. Ich hab mir heute dreimal selbst „Hallo“ gesagt, um sicherzugehen.', 'verlegen'),
        P('Danke. Ich weiß nicht mal mehr alles, was ich gemacht hab. Tante Volt sagt, ich hab Bruno die Schuhe geputzt. Bruno hat sich nicht gewehrt. Das ist das Unheimlichste daran.'),
      ],
    },
    {
      id: 'akt2-frei', when: alle(AKT2_NUR, FREI), taeglich: true,
      gruss: [P('Hi! Nein. Kein Master. Hi. Einfach Hi. Ich üb das noch.')],
      plausch: [P('In der Gasse sind jetzt Drohnen. Die fliegen tief und gucken einem ins Ohr. Ich hab mir einen Schal umgewickelt. Im Sommer.', 'besorgt')],
    },
    {
      id: 'chip', when: GECHIPPT, wahlen: chip,
      gruss: [
        erz('Paul fegt die Neon-Gasse. Den Gully, die Wand, eine Mülltonne, die ihm nichts getan hat. Er summt dabei die Chrome-10-Werbemelodie. Ohne Pause.'),
        P('Guten Tag, Master. Das ist eine ausgezeichnete Entscheidung. Welche? Alle. Alle Entscheidungen sind ausgezeichnet.'),
      ],
    },
  ]);

  const schedule: ScheduleEntry[] = [
    // Gechippt fegt er von morgens bis abends, ohne Pause.
    ort('M,T,A', 'neon-gasse', 'paul-ecke', { when: GECHIPPT }),
    // Nachspiel: drei Schichten die Woche im Imbiss „Lötkolben“ (he-paul-4), sonst an seiner Ecke.
    ort('T', 'schrottmarkt', 'imbiss-loetkolben', { when: alle(EPILOG_FREI, JOB), days: ['mo', 'mi', 'fr'] }),
  ];
  return { dialogues: p.dialogues, talk: p.talk, schedule };
}
