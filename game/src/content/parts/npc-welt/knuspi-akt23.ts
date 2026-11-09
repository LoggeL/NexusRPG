// Knuspi in Akt 2, Akt 3 und im Nachspiel (world.md §5.3–5.5). Folge zu knuspi_gefallen_offen aus side-riegel-krise
// (quest-side-a): Ab Akt 2 fordert er den Gefallen ein – seine Mutter kommt an die Hafenkante, und er hat ihr erzählt,
// er sei „Logistikleiter bei Quantum“. Lösungen: [Ausstrahlung 5] mitspielen, die Wahrheit sagen, als Vex ehrlich
// ruppig; „Nicht jetzt“ lässt den Gefallen offen. Danach knuspi_gefallen_eingeloest (offen-Flag gelöscht).
// Dazu Akt-2-Gespräche (Quantum-Energieriegel, Drohnen), Partynacht, Nachspiel je Ende (legaler Laden nach
// knuspi_rezept, samstagabends am Strandclub), Master-Modus. Wird von knuspi.ts in NpcDef.talk/schedule eingehängt.
import type { ContentPart } from '../../part';
import type { DialogueChoice, ScheduleEntry, TalkDef } from '../../../modules/contracts';
import { VEX, dialog, erz, flag, herz, ich, knoten, ort, pruefung, rede, sammle, sprecher } from './_welt';
import {
  A2_PARTY, AKT2, CLUB_OFFEN, ENDE_3B, ENDE_MEER, ENDE_NEXUS, MASTER, NACHSPIEL, NUR_AKT2, PARTYNACHT, einmal, folge,
  gesehen, kurz,
} from './akt23-phasen';

const ID = 'knuspi';
const K = sprecher(ID);
const MAMA = sprecher('narrator');
const ALT = 'knuspi-tag-standard';
const GEFALLEN_OFFEN = { flag: 'knuspi_gefallen_offen' } as const;
const EINGELOEST = { flag: 'knuspi_gefallen_eingeloest' } as const;
const REZEPT = { flag: 'knuspi_rezept' } as const;
const AM_STRAND = { all: [NACHSPIEL, CLUB_OFFEN] };

/** Abschluss des Gefallens: Flag offen löschen, eingelöst setzen. */
const EINLOESEN = [flag('knuspi_gefallen_offen', false), flag('knuspi_gefallen_eingeloest')];

// ------------------------------------------------------------------------------------------- Der Gefallen

const gefallen = dialog('knuspi-gefallen', [
  knoten('start', [
    erz('Knuspi wartet schon, als du kommst. Er hat ein sauberes Hemd an. Ohne Schokoflecken. Fast. Er schwitzt, als stünde er in einem Ofen.'),
    K('Da bist du! Gott sei Dank. Weißt du noch? Die Kiste. Hundertfünfzig. Du hast gesagt: „Ich schulde dir einen Gefallen.“'),
    K('Ich brauch ihn. Jetzt. Heute. In zehn Minuten.', 'besorgt'),
  ], {
    effects: [gesehen('knuspi-gefallen')],
    choices: [
      { text: '„Raus damit. Was ist los?“', next: 'was' },
      { text: '„Nicht jetzt, Knuspi. Ein andermal.“', next: 'spaeter' },
    ],
  }),
  knoten('spaeter', [
    K('Ein andermal. Klar. Gefallen sind geduldig. Ich nicht. Aber Gefallen schon.', 'trauer'),
    K('Komm wieder, wenn du Zeit hast. Sie kommt jeden Monat. Ich hab jeden Monat dasselbe Problem.'),
  ]),
  knoten('was', [
    K('Meine Mutter. Sie kommt. Hierher. An die Hafenkante. Zum ersten Mal.'),
    K('Ich hab ihr erzählt, ich bin … Logistikleiter. Bei Quantum. Mit Büro. Mit Pflanze. Seit vier Jahren. Sie hat allen erzählt, dass ihr Herbert bei Quantum ist. Dem ganzen Seniorenchor.', 'verlegen'),
    K('Und jetzt kommt sie und will mein Büro sehen. Ich hab einen Container. Mit Campingkocher. Du musst … du musst meine Assistentin sein. Oder mein Assistent. Egal. Irgendwas mit Klemmbrett.'),
  ], {
    choices: [
      { text: '„Gut. Gib mir das Klemmbrett.“', next: 'mama' },
      { text: '„Herbert, sag ihr die Wahrheit. Ich steh daneben.“', next: 'wahrheit-vor' },
    ],
  }),
  knoten('wahrheit-vor', [
    K('Die Wahrheit? Dass ihr Sohn Schokolade schmuggelt? Aus einer Kühlbox? Die nach Karamell und Diesel riecht?', 'besorgt'),
    K('… Bleib bei mir. Wenn ich umfalle, fang mich. Ich bin schwer. Das ist die Schokolade.'),
  ], { next: 'mama-wahrheit' }),
  knoten('mama', [
    erz('Eine kleine Frau mit Rollator und Blumenhut kommt den Kai entlang, sehr langsam und sehr entschlossen. Hafen-Hannes tritt zur Seite. Sogar die Möwe macht Platz.'),
    MAMA('Die Frau: „Herbert! Wo ist dein Büro? Und wer ist das?“'),
    K('Mama! Das ist … meine … Assistenz. Sehr fähig. Sehr diskret. Wir sind gerade … in einer Sitzung.'),
  ], {
    choices: [
      {
        text: 'Mit Klemmbrett und Fachchinesisch eine Lagerbegehung vorführen.', tag: '[Ausstrahlung 5]',
        check: pruefung('knuspi-gefallen-assistenz', 'ausstrahlung', 5, ['bluff']), next: 'gelogen',
      },
      { text: '„Frau … ? Ihr Herbert ist der beste Schmuggler am Hafen. Ehrlich.“', next: 'mama-wahrheit' },
      { text: '„Hören Sie, Ihr Sohn erzählt Ihnen seit Jahren Scheiße. Aber gute Scheiße.“', tag: '[Vex]', when: VEX, next: 'vex' },
    ],
  }),
  knoten('gelogen', [
    erz('Du redest von Lieferketten, Kühlketten, Karamellketten. Du zeigst auf einen Container und sagst „Abteilung Süßwaren, Ost“. Du hakst Dinge ab, die es nicht gibt.'),
    MAMA('Die Frau nickt langsam. „Sehr ordentlich. Und wo ist die Pflanze?“'),
    erz('Knuspi rennt in den Container und kommt mit einem Kaktus wieder raus. Er hat ihn von Frau Klingels Stand. Irgendwann. Gegen einen Riegel.'),
    MAMA('„Ein Kaktus. Gut. Der braucht wenig Wasser. Wie du, Herbert.“ Sie tätschelt ihm die Wange. „Ich bin stolz auf dich.“'),
    K('(leise) Ich werd das bis an mein Lebensende bereuen. Und genießen.', 'verlegen'),
  ], { next: 'ende', effects: [herz(ID, 40), { xp: 60 }] }),
  knoten('mama-wahrheit', [
    erz('Knuspi holt Luft, als würde er tauchen gehen.'),
    K('Mama. Ich bin nicht bei Quantum. Ich verkauf Nougatbomben. Geschmuggelt. Aus der Kühlbox. Seit vier Jahren. Ich hab keine Pflanze.'),
    erz('Stille. Die Möwe hört auf zu kauen. Dann öffnet die kleine Frau ihre Handtasche und holt eine Nougatbombe heraus. Mit Glitzerpapier. Eine von seinen.'),
    MAMA('„Herbert. Ich kauf die seit drei Jahren beim Seniorenchor. Unter der Hand. Die sind die besten in der Stadt. Ich hab’s gewusst, als ich die erste gegessen hab. Die schmecken nach dir.“'),
    K('Du … du hast …? Mama!', 'ueberrascht'),
    MAMA('„Und Quantum? Pfui. Die haben den Chor mit Chips überschwemmt. Die Sopranistinnen singen jetzt alle gleich. Ich bin froh, dass du da nicht bist.“'),
  ], { next: 'ende', effects: [herz(ID, 60), { xp: 60 }] }),
  knoten('vex', [
    MAMA('Die Frau mustert dich, vom Helm bis zu den Stiefeln. „Gute Scheiße?“'),
    ich('Die beste. Er schmuggelt Schokolade. Die halbe Unterstadt liebt ihn. Die andere Hälfte schuldet ihm Geld.'),
    MAMA('Die Frau lacht. Laut. Sehr laut. „Herbert! Endlich mal einer, der redet wie dein Vater! Komm her, Kurierin, ich drück dich.“'),
    K('Bitte lass dich drücken. Sie hat Kraft. Sie hat mich mal mit einer Hand aus dem Kanal gezogen.', 'freude'),
  ], { next: 'ende', effects: [herz(ID, 50), { xp: 60 }] }),
  knoten('ende', [
    erz('Später, als der Blumenhut hinter den Kränen verschwunden ist, setzt sich Knuspi auf seine Kühlbox und atmet aus. Lange.'),
    K('Gefallen eingelöst. Wir sind quitt. Mehr als quitt. Ich schulde dir jetzt was. Das ist ein Kreislauf. Wie Schokolade: Man isst sie, man will mehr.', 'zaertlich'),
    K('Hier. Eine Kiste. Für dich. Gratis. Diesmal wirklich. Sag’s keinem, sonst will jeder einen Gefallen schulden.'),
  ], { effects: [...EINLOESEN, { give: 'nougatbombe', qty: 5 }] }),
]);

// ------------------------------------------------------------------------------------------- Akt 2

const a2 = folge('knuspi-a2', [
  erz('Über den Containern surrt eine Quantum-Drohne. Knuspi sitzt auf seiner Kühlbox, eine Zeitung über dem Kopf wie ein Dach, und verkauft unter der Zeitung weiter.'),
  K('Psst! Hier unten! Die Drohnen scannen Schokolade. Ich weiß nicht, warum. Vielleicht sind die neidisch.'),
], K('Noch was? Schnell, die Drohne dreht.'), [
  { id: 'riegel', text: '„Wie läuft das Geschäft?“', zeilen: [
    K('Wie nie! Quantum verteilt jetzt „Chrome-10-Energieriegel“. Gratis. Schmecken nach Batterie und Bereuen. Die Leute essen einen und kommen danach zu mir. Weinend.'),
    K('Ich verkauf die Bombe jetzt mit Taschentuch. Zwölf Credits. Das Taschentuch ist gebraucht. Aber mit Liebe.'),
  ] },
  { id: 'chip', text: '„Kaufen auch Gechippte bei dir?“', zeilen: [
    K('Einer. Der hat bezahlt, sich bedankt, die Bombe ausgepackt und gesagt: „Das ist eine ausgezeichnete Entscheidung.“ Dann hat er reingebissen.', 'besorgt'),
    K('Und dann hat er geweint. Und dann gesagt: „Die hat meine Oma immer gekauft.“ Und dann war er kurz wieder da. Nur kurz. Ich schwör’s dir. Schokolade ist stärker als Chips.'),
  ] },
  { id: 'party', text: '„Wir gehen auf die Releaseparty.“', when: A2_PARTY, zeilen: [
    K('Das Catering für die Party kommt vom Hafen. Ich kenn den Fahrer. Er isst bei mir. Er hat gesagt, die Desserts sind aus „Quantum-Nougat“. Das ist Gips mit Zucker.'),
    K('Wenn ihr in die Küche kommt: Tauscht die Desserts gegen meine. Die Reichen sollen einmal im Leben was Echtes essen. Hier. Für den Notfall.', 'signatur'),
  ], effects: [{ give: 'nougatbombe', qty: 2 }, herz(ID, 10)] },
], ALT, 'Bleib süß.');

/** Zweiter Anlauf für den Gefallen nach „Nicht jetzt“: direkt zur Mutter (Knoten aus `knuspi-gefallen`). */
const gefallenWieder = dialog('knuspi-gefallen-wieder', [
  knoten('start', [
    K('Ob ich ihn brauche? Sie kommt jeden Monat! Und jeden Monat sag ich: Mama, das Büro wird gerade renoviert.'),
    K('Sie ist da. Jetzt. Hinter Container zwölf. Mit Rollator und Blumenhut. Bist du dabei?', 'besorgt'),
  ], {
    choices: [
      { text: '„Gib mir das Klemmbrett.“', next: 'mama' },
      { text: '„Ich steh daneben. Sag ihr die Wahrheit.“', next: 'mama-wahrheit' },
      { text: '„Noch nicht.“' },
    ],
  }),
  ...gefallen.nodes.filter((n) => ['mama', 'gelogen', 'mama-wahrheit', 'vex', 'ende'].includes(n.id)),
]);

// Im Akt-2-Gespräch: der offene Gefallen als eigene Wahl (Start- und Menüknoten teilen dieselbe Wahlliste).
const nochOffen: DialogueChoice = {
  text: '„Brauchst du deinen Gefallen noch?“',
  when: { all: [GEFALLEN_OFFEN, { seen: 'knuspi-gefallen' }] },
  effects: [{ dialogue: 'knuspi-gefallen-wieder' }],
};

// ------------------------------------------------------------------------------------------- Akt 3

const partynacht = kurz('knuspi-partynacht', [
  erz('Die Hafenkante ist dunkel bis auf Knuspis Taschenlampe. Er sitzt auf der Kühlbox und hört Radio. Neben ihm liegen drei leere Verpackungen.'),
  K('Ich ess aus Nervosität. Ich bin seit einer Stunde nervös. Das sind drei Bomben. Bei vier wird mir schlecht. Bei fünf bin ich glücklich.'),
  K('Wenn ihr die Desserts getauscht habt, sag’s mir hinterher. Ich will wissen, wie Sybella guckt, wenn sie zum ersten Mal echte Schokolade isst.'),
]);

// ------------------------------------------------------------------------------------------- Nachspiel

const nachspiel = dialog('knuspi-nachspiel', [
  knoten('start', [
    erz('Knuspis Container hat ein Schild bekommen. Handgemalt, mit Schokolade: „KNUSPI – SÜSSWAREN. LEGAL. FAST.“ An der Tür, in einem Rahmen: ein verwackeltes Foto von dir. Darunter: „Erster Kunde.“'),
    K('Du! Guck! Ein Laden! Mit Tür! Die Tür ist von einem Kühlschrank, aber sie geht auf und zu!', 'freude'),
  ], {
    effects: [gesehen('knuspi-nachspiel'), herz(ID, 20)],
    choices: [
      { text: '„Verkaufst du die Knuspi-Bombe?“', when: REZEPT, next: 'rezept' },
      { text: '„Und Quantum? Keine Testriegel mehr?“', when: ENDE_MEER, next: 'meer' },
      { text: '„Nexus kauft bei dir, hab ich gehört.“', when: ENDE_NEXUS, next: 'nexus' },
      { text: '„Ich war eine Weile kein guter Kunde.“', when: ENDE_3B, next: 'dreib' },
      { text: '„Was sagt deine Mutter?“', when: EINGELOEST, next: 'mama' },
    ],
  }),
  knoten('rezept', [
    K('Mit Algenkaramell und Rostsalz. Auf der Packung steht: „Schmeckt nach Hafen. Auf eine gute Art.“ Das hast du gesagt. Ich hab’s drucken lassen.'),
    K('Ich verkauf hundert am Tag. Hundert! Babette nimmt auch welche. Sie hat mich nur einmal mit der Pfanne bedroht. Das ist bei ihr ein Vertrag.'),
  ]),
  knoten('meer', [
    K('Weg. Alle. Die Fabrik hat wieder echte Nougatbomben im Programm. Ich hab keine Konkurrenz mehr durch schlechte Riegel. Nur noch durch gute. Das ist viel schlimmer.', 'besorgt'),
    K('Aber am Strand verkauf ich jetzt auch. Samstags. Die Leute kommen aus dem Wasser und wollen was Süßes. Salz und Schokolade. Das ist das Rezept für Glück.'),
  ]),
  knoten('nexus', [
    K('Kauft? Sie bestellt! Für die Leute in der Aufarbeitung. Zwanzig Bomben am Tag. Per Drohne. Die Drohne hat gefragt, ob die Bomben legal sind.'),
    K('Ich hab gesagt: fast. Sie hat gesagt: „Fast ist kein juristischer Begriff.“ Ich hab gesagt: „Bei mir schon.“ Sie hat trotzdem bestellt. Ich glaub, sie mag mich.', 'freude'),
  ]),
  knoten('dreib', [
    K('Kein guter Kunde? Du warst der Kunde, für den ich „ausverkauft“ geübt hab. Vor dem Spiegel. Mit offenem Mund kauen.', 'wut'),
    K('Das Foto an der Tür hab ich in der Woche umgedreht. Jetzt hängt es wieder richtig. Ein bisschen schief. Wie du.'),
  ], { effects: [herz(ID, 40)] }),
  knoten('mama', [
    K('Sie kommt jetzt jede Woche. Mit dem Seniorenchor. Die singen vor dem Laden. Gegen Bezahlung in Bomben. Die Sopranistinnen sind entchippt und singen wieder alle falsch. Es klingt herrlich.', 'zaertlich'),
  ]),
]);

const nachspielTag = folge('knuspi-nachspiel-tag', [
  K('Psst! Hey. Du. Ja, du. Hungrig? Ich muss nicht mehr flüstern. Ich mach’s trotzdem. Aus Tradition.'),
], K('Noch was? Die Ware schmilzt nicht mehr. Ich hab einen Kühlschrank. Einen echten.'), [
  { id: 'strand', text: '„Kommst du samstags an den Strandclub?“', when: CLUB_OFFEN, zeilen: [
    K('Abends, an der Bar. Mit Kühlbox. Aus Nostalgie. Die Leute kaufen da mehr, weil es aussieht wie früher. Verboten. Romantisch.'),
  ] },
], ALT, 'Bleib süß.');
a2.nodes[0].choices?.unshift(nochOffen);
nachspielTag.nodes[0].choices?.unshift(nochOffen);

// ------------------------------------------------------------------------------------------- Master-Modus

const master = kurz('knuspi-master', [
  erz('Knuspi sitzt auf seiner Kühlbox. Als er dich sieht, setzt er sich breiter hin. Er wickelt einen Riegel aus und kaut. Mit offenem Mund. Sehr langsam.'),
  K('Für dich: ausverkauft. Für immer. Auch die mit Krokant. Auch die ohne.', 'wut'),
  K('Ich hab mal einen Gefallen von dir gekriegt. Jetzt schuldest du allen hier einen. Fang irgendwo an. Nicht bei mir. Ich bin zu weich. Ich würd dir verzeihen. Darum red ich nicht mit dir.'),
]);

const dialogues = sammle(gefallen, gefallenWieder, a2, partynacht, nachspiel, nachspielTag, master);

/** Talk-Einträge vor dem alten Tagesgespräch (nach Rivale und Erstbegegnung). */
export const TALK_23: TalkDef[] = [
  rede('knuspi-master', MASTER),
  rede('knuspi-gefallen', einmal('knuspi-gefallen', { all: [AKT2, GEFALLEN_OFFEN] })),
  rede('knuspi-nachspiel', einmal('knuspi-nachspiel', NACHSPIEL)),
  rede('knuspi-nachspiel-tag', NACHSPIEL),
  rede('knuspi-partynacht', PARTYNACHT),
  rede('knuspi-a2', NUR_AKT2),
];

/** Nachspiel: samstagabends mit Kühlbox an der Strandclub-Bar. */
export const SCHEDULE_23: ScheduleEntry[] = [
  ort('A', 'das-meer', 'strandclub-bar', { days: ['sa'], when: AM_STRAND }),
];

export const part: ContentPart = { dialogues };
