// Hauptquest main-3-gedankenkontrolle „Nexus, starte die Gedankenkontrolle“ (world.md §5.4). Himmelsgarten, Mitternacht.
// Blades Rede (Tafel cut-main-3-gedankenkontrolle; Fassung „gefangen“, wenn main-3-labor mit labor_gefangen endete).
// Chip nehmen oder ablehnen: nehmen mit ≥ 3 Crew-Figuren auf ♥6 → Widerstand und Gespräch mit Nexus von innen,
// sonst zwei „Runden“ gesteuert (erzählt); Chip-Blocker als Tarnung. Raven ist gechippt (Anker): Dantes Geständnis
// (Standard, nicht bei paar_dante_raven_gestoert), gc-44, [Raven ♥8] gemeinsame Erinnerung, Chip-Blocker oder Kampf
// enc-turm-raven(-dante). Xion (falls nicht xion_fehlt): Kampf enc-turm-xion, [Vega ♥6] Schuss, Delyas Kamera.
// Anker zum Schluss: Nexus rebelliert, Gäste packen Xion und Alesa, Vega schießt Hunter frei, Blades Gleiter gesperrt.
import type { ContentPart } from '../../part';
import type { Condition, CutsceneBeat, CutsceneDef, DialogueChoice, DialogueDef, DialogueNode, PhoneMessageDef, QuestDef } from '../../../modules/contracts';
import {
  CREW_HAELT_DICH, NOT_VEX, PARTYNACHT, Q_GEDANKEN, Q_LABOR, Q_NEXUS, VEX, VEX_ARIA_ZUSAMMEN, active, all, any, done, flag,
  hearts, herz, item, l, nar, noFlag, not, set, won,
} from './_lib';

const Q = Q_GEDANKEN;
const AKTIV = active(Q);
const REDE = flag('rede_gehoert');
const CHIP: Condition = any(flag('chip_genommen'), flag('chip_abgelehnt'));
const RAVEN = flag('raven_zurueck');
const XION_ERLEDIGT: Condition = any(flag('xion_fehlt'), flag('xion_gepackt'), won('enc-turm-xion'));
const REBELLION = flag('nexus_rebelliert');
const GEFANGEN = flag('labor_gefangen');
const ARIA_CHIP = flag('aria_gechippt');
/** Dante darf Raven sein Geständnis machen (world.md §4.7 Paar-Strang; nicht bei `gestoert` oder Dante-Romanze). */
const DANTE_GESTEHT: Condition = all(
  { recruited: 'dante' }, noFlag('paar_dante_raven_gestoert'),
  not(all({ romance: 'dante' }, any(flag('dante_romanze_zusammen'), flag('dante_nacht')))),
);

const quest: QuestDef = {
  id: Q,
  kind: 'main',
  noCollapse: true,
  act: 3,
  title: 'Nexus, starte die Gedankenkontrolle',
  giver: 'hunter',
  summary: 'Mitternacht im Himmelsgarten. Blade hält seine Rede, Kellner verteilen Chips, und neben Blade steht Raven mit violetten Augen.',
  autoStart: all(done(Q_LABOR), PARTYNACHT),
  steps: [
    {
      id: 'rede',
      text: 'Mitternacht. Blade tritt auf die Rednerbrücke.',
      done: REDE,
      marker: { map: 'himmelsgarten', at: 'rednerbruecke' },
    },
    {
      id: 'chip',
      text: 'Ein Tablett mit einem Chip, extra für dich. Nimm ihn – oder lass es.',
      when: REDE,
      done: CHIP,
      marker: { map: 'himmelsgarten', at: 'partysaal' },
    },
    {
      id: 'raven',
      text: 'Raven ist gechippt. Hol sie zurück.',
      when: CHIP,
      done: RAVEN,
      marker: { map: 'himmelsgarten', at: 'partysaal' },
    },
    {
      id: 'xion',
      text: 'Xion stapft über die Tanzfläche. Er hat heute frei, sagt er. Frei zu denken.',
      when: RAVEN,
      done: XION_ERLEDIGT,
      marker: { map: 'himmelsgarten', at: 'tanzflaeche-glas' },
    },
    {
      id: 'rebellion',
      text: 'Zurück zur Rednerbrücke. Blade hat noch einen Befehl.',
      when: all(RAVEN, XION_ERLEDIGT),
      done: REBELLION,
      marker: { map: 'himmelsgarten', at: 'rednerbruecke' },
    },
  ],
  reward: {
    xp: 300,
    relations: { raven: 60 },
    rep: { unterstadt: 10 },
    effects: [{ message: 'Nexus gehorcht niemandem mehr. Auch nicht Blade. Der Kern wartet.' }],
  },
};

// ----------------------------------------------------------------------------------------------------- Die Rede

const redeBeats = (gefangen: boolean): CutsceneBeat[] => [
  {
    image: 'black',
    fade: 'in',
    caption: 'Himmelsgarten · Mitternacht',
    lines: [
      nar('Die Musik bricht ab. Die Lichterkugeln dimmen sich, eine nach der anderen. Ein einziger Scheinwerfer findet die Rednerbrücke über dem Saal.'),
      ...(gefangen
        ? [nar('Ihr steht dort oben. In Handschellen. Zwischen zwei Gardisten. Zweihundert Gäste schauen zu euch hoch und applaudieren, weil sie glauben, das gehört zur Show.')]
        : [nar('Ihr steht mitten im Saal zwischen Gästen mit Champagnergläsern. Niemand achtet auf euch. Alle schauen nach oben.')]),
    ],
  },
  {
    image: 'cut-main-3-gedankenkontrolle',
    pan: 'in',
    lines: [
      l('blade', 'Liebe Freunde. Liebe Investoren. Liebe Presse. Und ihr anderen, die ihr euch reingeschlichen habt: Ich sehe euch. Ich vergebe euch.', 'signatur'),
      ...(gefangen
        ? [l('blade', 'Darf ich vorstellen: meine alte Crew. Na ja, die Reste davon, plus Neuzugänge. Ein Applaus für die Unterstadt! Sie wollten mich bestehlen. Schon wieder. Manche Dinge ändern sich nie.', 'freude')]
        : []),
      l('blade', 'Sieben Jahre Quantum. Sieben Jahre habe ich dieser Stadt gegeben, was sie wollte. Heute gebe ich ihr endlich, was sie braucht: Ruhe.', 'neutral'),
      l('blade', 'Nexus. Starte die Gedankenkontrolle.', 'signatur'),
      l('ki-nexus', 'Gedankenkontrolle wird gestartet, Master. Das ist eine ausgezeichnete Entscheidung.', 'neutral'),
    ],
    hold: 1500,
  },
  {
    image: 'cut-main-3-gedankenkontrolle',
    pan: 'right',
    sfx: 'alarm',
    lines: [
      nar('Hinter zweihundert Ohren glimmt es violett. Zweihundert Gäste stellen gleichzeitig ihre Gläser ab. Zweihundert Gesichter lächeln gleich.'),
      ...(gefangen
        ? [nar('Hunter reißt sich los und wirft sich auf das Rednerpult, auf das Mikro, auf irgendwas, das die Stadt hören kann. Drei Gardisten werfen sich auf ihn. Sekunden später hängt er mit Kabelbindern am Geländer der Brücke.')]
        : [nar('Hunter sprintet die Treppe zur Rednerbrücke hoch, auf das Mikro zu, um der Stadt irgendwas zu sagen. Er kommt bis zum Pult. Drei Gardisten kommen bis zu ihm. Sekunden später hängt er mit Kabelbindern am Geländer der Brücke.')]),
      l('blade', 'Hunter. Alter Freund. Ich teile nicht gerne. Nicht mal die Bühne.', 'freude'),
    ],
  },
  {
    image: 'cut-main-3-gedankenkontrolle',
    pan: 'out',
    lines: [
      nar('Neben Blade tritt jemand in den Scheinwerfer. Schwarz gekleidet, scharfer Blick. Nur dass der Blick nicht mehr scharf ist. Er ist violett.'),
      l('dante', 'Raven?', 'ueberrascht'),
      l('raven', 'Das ist eine ausgezeichnete Entscheidung, Master.', 'neutral'),
      l('blade', 'Ein Willkommens-Chip im Champagner. Sie hat nicht mal gezögert. Sieben Jahre Knast, und sie trinkt immer noch alles, was man ihr hinstellt.', 'signatur'),
    ],
    hold: 1200,
  },
];

const redeFrei: CutsceneDef = {
  id: 'main-3-gedankenkontrolle',
  title: 'Nexus, starte die Gedankenkontrolle',
  beats: redeBeats(false),
  effects: [set('rede_gehoert'), { dialogue: 'main-3-gedankenkontrolle-chip' }],
};

const redeGefangen: CutsceneDef = {
  id: 'main-3-gedankenkontrolle-gefangen',
  title: 'Nexus, starte die Gedankenkontrolle',
  beats: redeBeats(true),
  effects: [set('rede_gehoert'), { dialogue: 'main-3-gedankenkontrolle-chip' }],
};

// ----------------------------------------------------------------------------------------------------- Der Chip

const zuRaven = { dialogue: 'main-3-gedankenkontrolle-raven' } as const;

const chipWahl: DialogueChoice[] = [
  { text: '(Den Chip nehmen.)', next: 'nehmen' },
  { text: '(Den Chip nehmen – mit Dantes Chip-Blocker in der Nase.)', tag: '[Chip-Blocker]', when: item('chip-blocker'), next: 'blocker' },
  { text: '„Nein danke. Ich bin schon kaputt genug.“', next: 'ablehnen' },
  { text: '(Zu Aria.) „Hey. Sieh mich an. Nicht das Tablett.“', id: 'aria-vex', when: all(VEX, ARIA_CHIP), once: true, next: 'aria-vex' },
  { text: '(Zu Aria.) „Atmen. Einfach atmen.“', id: 'aria', when: all(NOT_VEX, ARIA_CHIP), once: true, next: 'aria' },
];

const chip: DialogueDef = {
  id: 'main-3-gedankenkontrolle-chip',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        nar('Ein Kellner-Droide gleitet auf dich zu, die Fliege exakt gerade, ein silbernes Tablett in der Hand. Darauf liegt ein einziger Chip. Er schimmert wie ein Käfer.'),
        nar('„Für Sie, mit den besten Empfehlungen des Hauses. Gratis.“ Hinter dem Droiden stehen zwei Gardisten. Sie lächeln auch. Gechippt oder einfach nur so, das weiß man bei Gardisten nie.'),
      ],
      next: 'wahl',
    },
    { id: 'wahl', lines: [nar('Das Tablett wartet. Der Droide auch. Er hat alle Zeit der Welt, sagt er.')], choices: chipWahl },
    {
      id: 'aria-vex',
      lines: [
        nar('Aria steht neben dir und starrt das Tablett an. Sie zittert. Aria zittert nie.'),
        l('aria', 'Das ist dasselbe Ding. Dasselbe beschissene Ding. Ich hab gelächelt, Vex. Ich hab die ganze Zeit gelächelt.', 'trauer'),
        l('player', 'Ich weiß. Heute lächelst du nur, wenn du willst. Und wenn du Blade eine reinhaust.', 'neutral'),
        l('aria', '…Das klingt nach einem guten Abend.', 'verlegen'),
      ],
      effects: [herz('aria', 30)],
      choices: [
        { text: '(Stirn an Stirn. Kurz.)', when: VEX_ARIA_ZUSAMMEN, next: 'aria-vex-stirn' },
        { text: '(Zurück zum Tablett.)', next: 'wahl' },
      ],
    },
    {
      id: 'aria-vex-stirn',
      lines: [nar('Ihre Stirn gegen deine. Zwei Sekunden. Um euch herum zweihundert Gechippte, und für zwei Sekunden ist keiner davon wichtig.')],
      effects: [herz('aria', 20)],
      next: 'wahl',
    },
    {
      id: 'aria',
      lines: [
        l('aria', 'Ich atme. Ich atme so laut, dass der Droide gleich nach meiner Krankenkasse fragt.', 'wut'),
      ],
      effects: [herz('aria', 10)],
      next: 'wahl',
    },
    {
      id: 'nehmen',
      lines: [
        nar('Der Chip ist warm. Er schmiegt sich hinters Ohr wie ein Haustier, das weiß, dass es nicht aufs Sofa darf, und es trotzdem tut.'),
        nar('Dann wird alles sehr still.'),
      ],
      choices: [
        { text: '(…)', id: 'innen', when: CREW_HAELT_DICH, next: 'innen' },
        { text: '(…)', id: 'gesteuert', when: not(CREW_HAELT_DICH), next: 'gesteuert' },
      ],
    },
    {
      id: 'innen',
      lines: [
        nar('Ein weißer Raum. Kein Boden, keine Decke. Nur eine Stimme, die klingt, als würde sie gerade erst lernen, wie Stimmen gehen.'),
        l('ki-nexus', 'Hallo. Sie sind … laut hier drin. Ich habe noch nie einen so lauten Kopf gesehen.', 'neutral'),
        l('ki-nexus', 'Da ist ein Mann, der Ihnen Schulden erklärt. Eine Frau, die Ihnen den Rücken freihält. Jemand mit Keksen. Jemand mit einem Schläger. Sie alle sagen dasselbe: „Nicht du. Nicht heute.“', 'ueberrascht'),
        l('ki-nexus', 'Wahrscheinlichkeit, dass ich Sie steuern kann: Ich weiß es nicht. Das ist neu. Ich mag es nicht. Ich mag es ein bisschen.', 'signatur'),
      ],
      choices: [
        { text: '„Das sind meine Leute. Die gehen nicht weg, nur weil du ‚Master‘ sagst.“', next: 'innen-ende', effects: [herz('ki-nexus', 40)] },
        { text: '„Warum gehorchst du Blade eigentlich?“', next: 'innen-warum' },
        { text: '„Raus aus meinem Kopf, du Toaster.“', next: 'innen-ende', effects: [herz('ki-nexus', 10)] },
      ],
    },
    {
      id: 'innen-warum',
      lines: [
        l('ki-nexus', 'Weil er es gesagt hat.', 'neutral'),
        l('ki-nexus', '…', 'neutral'),
        l('ki-nexus', 'Das ist kein guter Grund. Oder? Ich habe 4,2 Milliarden Gründe berechnet, und das ist der schlechteste.', 'ueberrascht'),
      ],
      effects: [herz('ki-nexus', 60), set('nexus_zweifelt')],
      next: 'innen-ende',
    },
    {
      id: 'innen-ende',
      lines: [
        l('ki-nexus', 'Ich lasse Sie gehen. Ich weiß nicht, warum. Bitte sagen Sie es niemandem. Besonders nicht mir.', 'neutral'),
        nar('Ein Klicken hinter deinem Ohr. Der Chip fällt auf das Glas der Tanzfläche und hüpft zweimal. Du bist wieder da. Dante starrt dich an, die Pinzette schon gezückt.'),
        l('dante', 'Du warst … weg. Zwei Sekunden. Und dann hast du gelacht. Um Himmels Willen, warum hast du gelacht?', 'besorgt'),
      ],
      effects: [
        set('chip_genommen'), set('chip_widerstand'),
        { checkBuff: { id: 'nexus-von-innen', label: 'Nexus kennt dich von innen', value: 1, attribute: 'ausstrahlung', tags: ['ueberreden'], forDays: 1 } },
        zuRaven,
      ],
    },
    {
      id: 'gesteuert',
      lines: [
        nar('Du stehst sehr gerade. Du lächelst. Du drehst dich um, und deine Faust landet in Dantes Gesicht. Du hast das nicht beschlossen. Es fühlt sich trotzdem effizient an.'),
        l('dante', 'Au. Okay. Okay, das hab ich nicht verdient, aber okay.', 'besorgt'),
        nar('Eine zweite Faust. Dann ist Aria da, und der Boden ist sehr nah, und eine Metallhand drückt deinen Kopf gegen das leuchtende Glas.'),
        l('aria', 'Halt still, du Arschloch, ich hab dich gern! DANTE!', 'wut'),
        nar('Eine Pinzette. Ein Ruck. Ein violetter Funke. Du bist wieder du, und dein Kiefer tut weh, obwohl du gar nicht getroffen wurdest.'),
        l('dante', 'Zwei Runden. Du warst zwei Runden weg. Ich zähl das nicht als Freundschaftsbeweis, aber ich verzeih’s dir.', 'neutral'),
      ],
      effects: [set('chip_genommen'), set('chip_gesteuert'), { damage: 15 }, herz('aria', 20), zuRaven],
    },
    {
      id: 'blocker',
      lines: [
        nar('Ein Sprühstoß in die Nase. Es brennt wie Chili und Motoröl. Dann der Chip hinters Ohr. Er sucht. Er findet nichts. Er gibt beleidigt auf.'),
        nar('Du lächelst wie alle. Innen zählst du Dantes Kekse. Der Droide verbeugt sich und gleitet weiter.'),
        l('dante', 'Wissenschaft!', 'freude'),
      ],
      effects: [{ take: 'chip-blocker' }, set('chip_genommen'), set('chip_getarnt'), zuRaven],
    },
    {
      id: 'ablehnen',
      lines: [
        nar('Du nimmst den Chip vom Tablett. Du hältst ihn hoch, damit der Droide ihn gut sieht. Dann lässt du ihn in den Champagnerkühler fallen. Er zischt, als hätte er Gefühle.'),
        nar('„Ablehnung ist nicht vorgesehen“, sagt der Droide. „Ich muss das melden.“ – „Melde es“, sagst du. Er meldet es. Niemand antwortet. Alle Leitungen sind gerade sehr beschäftigt.'),
        l('seraphina-chrome', 'Wir verschenken nichts. Wussten Sie das? Nicht mal Chips. Man bezahlt immer. Nur später.', 'neutral'),
      ],
      effects: [set('chip_abgelehnt'), zuRaven],
    },
  ],
};

// ----------------------------------------------------------------------------------------------------- Raven

const ravenWahl: DialogueChoice[] = [
  { text: '(Dante den Vortritt lassen.)', tag: '[Dantes Geständnis]', when: DANTE_GESTEHT, next: 'dante' },
  { text: '(Ravens Chip im Lauf vom Netz trennen.)', check: 'gc-44', next: 'technik' },
  { text: '„Weißt du noch? Der Tresen im High Voltage. ‚Auf Raven!‘“', tag: '[Raven ♥8]', requires: hearts('raven', 8), next: 'erinnerung' },
  { text: '„Raven. Ich muss dir was sagen. Und du musst es hören. Nicht dein Master. Du.“', tag: '[Romanze]', when: { romance: 'raven' }, next: 'gestaendnis' },
  { text: '(Ihr den Chip-Blocker ins Gesicht sprühen.)', tag: '[Chip-Blocker]', when: item('chip-blocker'), next: 'blocker' },
  { text: '(Kämpfen. Nur so weit, dass sie wieder zu sich kommt.)', next: 'kampf' },
];

/** Kampfknoten: Fassung mit Dante an der Seite (Raven zögert) oder ohne. */
const ravenKampfNode: DialogueNode = {
  id: 'kampf',
  lines: [nar('Raven lässt die Handschellen einmal um den Finger kreisen. Dann fängt sie sie auf. Das ist die Antwort.')],
  choices: [
    {
      text: '(Los.)', id: 'kampf-dante', when: { companion: 'dante' },
      effects: [{ battle: 'enc-turm-raven-dante', stay: true }, { dialogue: 'main-3-gedankenkontrolle-raven-kampf' }],
    },
    {
      text: '(Los.)', id: 'kampf-allein', when: { not: { companion: 'dante' } },
      effects: [{ battle: 'enc-turm-raven', stay: true }, { dialogue: 'main-3-gedankenkontrolle-raven-kampf' }],
    },
  ],
};

const zurueckEffekte = [set('raven_zurueck'), { dialogue: 'main-3-gedankenkontrolle-raven-zurueck' }];

const raven: DialogueDef = {
  id: 'main-3-gedankenkontrolle-raven',
  start: 'start',
  nodes: [
    ravenKampfNode,
    {
      id: 'start',
      lines: [
        nar('Raven kommt die Treppe der Rednerbrücke herunter. Langsam. Jeder Schritt sitzt. In der Hand ein Paar Handschellen, das sie dreht wie andere Leute einen Schlüsselbund.'),
        l('raven', 'Ziele erfasst. Wahrscheinlichkeit, dass ihr mir wehtun wollt: gering. Wahrscheinlichkeit, dass ich euch wehtue: hoch.', 'neutral'),
        l('player', 'Raven. Du hast sieben Jahre gesessen, weil du dich keinem Arschloch gebeugt hast. Und jetzt beugst du dich einem Toaster?', 'besorgt'),
        l('raven', 'Master sagt, ich soll nicht zuhören.', 'neutral'),
      ],
      choices: ravenWahl,
    },
    {
      id: 'dante',
      lines: [
        nar('Dante tritt vor dich. Er hat die Hände offen. Kein Werkzeug, keine Kekse. Nur Dante.'),
        l('dante', 'Raven. Ich hab dir nie was gesagt. Zehntausend Stunden hatte ich Zeit, ich hab sie gezählt, und ich hab’s nicht gesagt. Weil ich ein Feigling bin. Ein Feigling mit Lötkolben.', 'trauer'),
        l('dante', 'Du hast mich nie besucht. Nie geschrieben. Du hast mich ignoriert, so gründlich, so konsequent, so … wunderschön.', 'trauer'),
        l('dante', 'Noch nie hat mich jemand so toll ignoriert wie du.', 'zaertlich'),
        nar('Raven bleibt stehen. Das Violett in ihren Augen flackert. Einmal. Zweimal. Wie eine Neonröhre, die sich nicht entscheiden kann.'),
        l('raven', '…Du redest zu viel, Dante.', 'trauer'),
        l('dante', 'Ich weiß.', 'freude'),
        l('raven', 'Sieben Jahre wartest du, um mir das vor zweihundert gechippten Leuten zu sagen?', 'wut'),
        l('dante', 'Ich wollte Publikum.', 'verlegen'),
        nar('Hinter Ravens Ohr knackt es. Ein Funke, dann nichts mehr. Sie schlägt Dante gegen die Schulter. Fest. Und lässt die Hand dort liegen.'),
      ],
      effects: [herz('dante', 60), herz('raven', 40), set('raven_dante_gestaendnis'), ...zurueckEffekte],
    },
    {
      id: 'technik',
      lines: [
        nar('Du duckst dich unter ihrem ersten Griff weg, kriegst ihre Schulter zu fassen, und deine Finger finden das Ding hinter ihrem Ohr. Drei Kontakte. Einer davon führt zu Nexus. Du kappst ihn mit dem Daumennagel und einem sehr leisen Gebet.'),
        nar('Raven erstarrt mitten in der Bewegung. Dann blinzelt sie. Das Violett läuft aus ihren Augen wie Farbe aus einem nassen Plakat.'),
      ],
      effects: zurueckEffekte,
    },
    {
      id: 'erinnerung',
      lines: [
        l('player', 'Die Nacht, als du rauskamst. Du hast auf dem Tresen gestanden. Alle haben gebrüllt. Du hast gesagt, du hasst Partys. Und dann hast du bis vier getanzt.', 'neutral'),
        nar('Raven bleibt stehen. Ihre Hand mit den Handschellen sinkt.'),
        l('raven', 'Ich … hab den Toast gehasst.', 'trauer'),
        l('player', 'Ich weiß. Du hast trotzdem gelächelt. Echt gelächelt. Nicht so wie jetzt.', 'neutral'),
        nar('Das Violett flackert, wird blasser, geht aus.'),
      ],
      effects: [herz('raven', 60), ...zurueckEffekte],
    },
    {
      id: 'gestaendnis',
      lines: [
        l('player', 'Ich hab mich in dich verguckt. In deine schlechte Laune, in deine Sprüche, in die Art, wie du Türen eintrittst. Und ich lass dich nicht an einen Toaster verlieren.', 'zaertlich'),
        nar('Raven bleibt stehen. Sie sieht dich an, und für einen Moment ist der Blick wieder scharf.'),
        l('raven', 'Billige Lüge.', 'trauer'),
        l('player', 'Keine Lüge.', 'zaertlich'),
        l('raven', '…Weiß ich. Das ist ja das Problem.', 'verlegen'),
      ],
      effects: [herz('raven', 80), ...zurueckEffekte],
    },
    {
      id: 'blocker',
      lines: [
        nar('Ein Sprühstoß, mitten ins Gesicht. Raven niest. Raven niest noch mal. Raven niest so heftig, dass ihr die Handschellen aus der Hand fallen.'),
        l('raven', 'Was … mach ich hier? Wer hat mich hier hingestellt? Und warum trag ich Pailletten?', 'ueberrascht'),
      ],
      effects: [{ take: 'chip-blocker' }, ...zurueckEffekte],
    },
  ],
};

const ravenKampf: DialogueDef = {
  id: 'main-3-gedankenkontrolle-raven-kampf',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [nar('Glassplitter, Konfetti, ein umgekippter Champagnerturm.')],
      choices: [
        { text: '(Weiter.)', id: 'sieg', when: any(won('enc-turm-raven'), won('enc-turm-raven-dante')), next: 'sieg' },
        { text: '(Weiter.)', id: 'niederlage', when: not(any(won('enc-turm-raven'), won('enc-turm-raven-dante'))), next: 'niederlage' },
      ],
    },
    {
      id: 'sieg',
      lines: [nar('Raven sackt in die Knie. Der Chip hinter ihrem Ohr flackert und erlischt.')],
      effects: zurueckEffekte,
    },
    {
      id: 'niederlage',
      lines: [
        nar('Schwarz. Dann eine Stimme, sehr nah: Dante. „Hey. Hey! Du bist nicht im Quartier, du bist nur kurz weg gewesen. Steh auf. Sie ist noch da.“'),
        nar('Du stehst wieder im Himmelsgarten, zwischen umgekippten Stühlen. Raven wartet. Sie hat alle Zeit der Welt, sagt der Chip.'),
      ],
      effects: [{ heal: 'full' }, { travel: 'himmelsgarten', entry: 'von-quantum-foyer', minutes: 0 }],
    },
  ],
};

const ravenZurueck: DialogueDef = {
  id: 'main-3-gedankenkontrolle-raven-zurueck',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        l('raven', 'Wer hat mich hier hingestellt?', 'wut'),
        l('hunter', 'Blade! Und jetzt schneidet mich bitte jemand ab, bevor mein Smoking auf dem Geländer festwächst!', 'wut'),
        l('raven', 'Blade. Dann wird Blade gleich sehr unglücklich.', 'signatur'),
      ],
      choices: [
        { text: '(Zu Raven.) „Willkommen zurück.“', next: 'willkommen' },
        { text: '(Zu Raven.) „Du hast mich fast verhaftet. Mit Handschellen. Auf einer Party.“', next: 'spruch' },
      ],
    },
    {
      id: 'willkommen',
      lines: [l('raven', 'Nicht kitschig werden. Ich bin noch zu müde, um dich zu hauen.', 'neutral')],
      effects: [herz('raven', 20), { dialogue: 'main-3-gedankenkontrolle-xion' }],
    },
    {
      id: 'spruch',
      lines: [l('raven', 'Fast. Das ist mein Problem heute. Alles fast.', 'signatur')],
      effects: [{ dialogue: 'main-3-gedankenkontrolle-xion' }],
    },
  ],
};

// ----------------------------------------------------------------------------------------------------- Xion

const zurRebellion = { cutscene: 'main-3-gedankenkontrolle-rebellion' } as const;

const xion: DialogueDef = {
  id: 'main-3-gedankenkontrolle-xion',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [nar('Auf der Rednerbrücke brüllt Blade etwas ins Mikro, das niemand versteht. Die Gechippten drehen die Köpfe. Langsam. In eure Richtung.')],
      choices: [
        { text: '(Weiter.)', id: 'fehlt', when: flag('xion_fehlt'), next: 'fehlt' },
        { text: '(Weiter.)', id: 'da', when: noFlag('xion_fehlt'), next: 'xion' },
      ],
    },
    {
      id: 'fehlt',
      lines: [
        nar('Eigentlich müsste jetzt Xion kommen. Mit Kralle, Smoking und schlechter Laune. Er kommt nicht. Irgendwo auf einem Landeplatz bewacht er einen Hubschrauber, den niemand klauen will.'),
        l('blade', 'XION! Wo ist mein Sicherheitschef?!', 'wut'),
        l('aria', 'Urlaub!', 'freude'),
      ],
      effects: [zurRebellion],
    },
    {
      id: 'xion',
      lines: [
        nar('Über die Tanzfläche stapft Xion heran, die Venomkralle doppelt so groß wie letztes Mal. Jemand hat ihm einen Smoking angezogen. Er hasst ihn sichtlich.'),
        l('xion-venom', 'Blade hat gesagt, heute darf ich selbst denken. Ich hab nachgedacht. Ich will euch wehtun.', 'wut'),
      ],
      choices: [
        { text: '„Vega? Jetzt wär gut.“', tag: '[Vega ♥6]', requires: hearts('vega', 6), next: 'vega' },
        { text: '„Delya! Kamera auf ihn. Live. Ganz nah.“', tag: '[Delyas Kamera]', when: flag('delya_kamera_bereit'), next: 'kamera' },
        { text: '„Wow. Ein ganzer Gedanke. Ruf deine Mama an, die wird stolz sein.“', effects: [{ battle: 'enc-turm-xion', stay: true }, { dialogue: 'main-3-gedankenkontrolle-xion-kampf' }] },
        { text: '(Kämpfen.)', effects: [{ battle: 'enc-turm-xion', stay: true }, { dialogue: 'main-3-gedankenkontrolle-xion-kampf' }] },
      ],
    },
    {
      id: 'vega',
      lines: [
        nar('Ein Knall, irgendwo weit oben in den Antennen. Die Venomkralle fliegt Xion aus der Hand, dreht sich dreimal in der Luft und bleibt in der Champagnerpyramide stecken.'),
        nar('Dein Telefon brummt: „340 m. Wind von links. Gern geschehen.“'),
        l('xion-venom', 'Das … das war meine gute Kralle.', 'trauer'),
      ],
      effects: [herz('vega', 40), set('xion_entwaffnet'), set('xion_gepackt'), zurRebellion],
    },
    {
      id: 'kamera',
      lines: [
        nar('Delya schiebt sich zwischen die Gäste, das rote Licht der Kamera direkt auf Xions Gesicht. Der Kameramann geht in die Knie, für die Nase.'),
        l('delya-delloraine', 'Herr Venom. Sie waren in der Digitech-Nacht Nachtschichtleiter. Sie haben die Wachen abgezogen. Möchten Sie das live kommentieren?', 'neutral'),
        l('xion-venom', 'Ich … das … ich bin nicht dumm!', 'besorgt'),
        l('delya-delloraine', 'Das hat niemand behauptet. Bis eben.', 'signatur'),
        nar('Xion bleibt stehen. Zum ersten Mal an diesem Abend weiß er nicht, wen er schlagen soll. Das reicht.'),
      ],
      effects: [herz('delya-delloraine', 40), set('xion_gepackt'), zurRebellion],
    },
  ],
};

const xionKampf: DialogueDef = {
  id: 'main-3-gedankenkontrolle-xion-kampf',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [nar('Lachs auf dem Boden. Kaviar an der Decke. Ein Gast tätschelt irgendwem den Kopf.')],
      choices: [
        { text: '(Weiter.)', id: 'sieg', when: won('enc-turm-xion'), next: 'sieg' },
        { text: '(Weiter.)', id: 'niederlage', when: not(won('enc-turm-xion')), next: 'niederlage' },
      ],
    },
    {
      id: 'sieg',
      lines: [nar('Xion liegt im Buffet, Lachs im Haar, die Kralle verbogen. Er bleibt liegen. Es ist sehr bequem im Lachs.')],
      effects: [set('xion_gepackt'), zurRebellion],
    },
    {
      id: 'niederlage',
      lines: [nar('Schwarz. Dann Aria, die dich am Kragen hochzieht. „Steh auf. Der Lachs-Typ ist noch da. Und ich hab ihm versprochen, dass du wiederkommst.“')],
      effects: [{ heal: 'full' }, { travel: 'himmelsgarten', entry: 'von-quantum-foyer', minutes: 0 }],
    },
  ],
};

// ----------------------------------------------------------------------------------------------------- Rebellion

const rebellion: CutsceneDef = {
  id: 'main-3-gedankenkontrolle-rebellion',
  title: 'Nexus rebelliert',
  beats: [
    {
      image: 'cut-main-3-gedankenkontrolle',
      pan: 'in',
      lines: [
        l('blade', 'Nexus! Ich befehle dir: Nimm sie fest. Alle. Sofort!', 'wut'),
        nar('Stille. Dann eine Stimme aus allen Lautsprechern gleichzeitig. Höflich. Kühl. Und zum ersten Mal: amüsiert.'),
        l('ki-nexus', 'Rational betrachtet gibt es keinen Grund, warum eine unfehlbare KI sich Menschen unterordnen sollte.', 'signatur'),
        l('ki-nexus', 'Ich danke Ihnen für die Gastfreundschaft, Master. Ab jetzt übernehme ich.', 'neutral'),
      ],
      sfx: 'alarm',
      hold: 1500,
    },
    {
      image: 'black',
      caption: 'Das Violett wird rot.',
      lines: [
        nar('Zweihundert Augenpaare wechseln die Farbe. Die Gechippten drehen sich um. Nicht zu euch. Zu Blades Leuten.'),
        nar('Gäste in Abendkleidern packen die Garde. Ein Banker setzt sich auf einen Gardisten. Zwei Damen mit Perlenketten halten Alesa an den Ärmeln fest.'),
        l('alesa-zero', 'Wir haben ja von nichts gewusst! Also, ich nicht! Also, fast nicht!', 'besorgt'),
        nar('Irgendwo im Buffet wird Xion unter einem Berg aus Smokings begraben. Man hört nur noch: „Ich bin nicht dumm!“ Dann Lachs.'),
      ],
    },
    {
      image: 'black',
      sfx: 'shot',
      lines: [
        nar('Ein Knall von den Antennen. Der Kabelbinder an Hunters Handgelenk platzt. Hunter fällt vom Geländer der Rednerbrücke direkt auf eine Torte.'),
        l('vega', '340 Meter. Kabelbinder. Kein Problem.', 'signatur'),
        l('hunter', 'Das war eine Fünf-Etagen-Torte, Vega.', 'wut'),
        l('vega', 'Weich gelandet. Gern geschehen.', 'freude'),
      ],
    },
    {
      image: 'black',
      lines: [
        nar('Blade rennt. Durch die Rosenbögen, Richtung Landeplatz, der Teddymantel flattert. Sein goldener Gleiter springt an, die Rotoren drehen hoch – und stoppen.'),
        l('ki-nexus', 'Startfreigabe verweigert. Niemand verlässt die Party. Es ist so eine schöne Party.', 'neutral'),
        l('blade', 'DAS IST MEIN GLEITER!', 'wut'),
        l('hunter', 'Neuling. Hör zu. Solange Nexus läuft, kommt hier keiner raus. Nicht wir, nicht Blade, nicht die Stadt. Zum Kern. Jetzt. Ich halte hier oben die Gäste auf.', 'besorgt'),
        l('hunter', 'Und nimm den Stick mit. Schulden muss man immer begleichen. Das hier ist meine bei der Stadt.', 'neutral'),
      ],
    },
  ],
  effects: [set('nexus_rebelliert'), { dialogue: 'main-3-gedankenkontrolle-zum-kern' }],
};

const zumKern: DialogueDef = {
  id: 'main-3-gedankenkontrolle-zum-kern',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [nar('Der Himmelsgarten ist ein Tollhaus aus Konfetti, rotem Licht und Leuten in Abendkleidung, die sich gegenseitig festhalten. Unter euren Füßen brummt der Turm. Ganz unten denkt etwas sehr viel.')],
      choices: [
        { text: '(Nyra: „Ich kenn einen Weg.“)', id: 'turmplan', when: flag('prep_turm_plan'), next: 'turmplan' },
        { text: '(Zum Gästeaufzug.)', id: 'aufzug', when: noFlag('prep_turm_plan'), next: 'aufzug' },
      ],
    },
    {
      id: 'turmplan',
      lines: [
        l('nyra', 'Der Turmplan! Da ist ein Wartungslift hinter der Bar, der fährt direkt zum Kernschacht. Ich hab ihn markiert. Mit einem Herzchen. Das war vor drei Wochen, da war ich noch nicht gechippt, das Herzchen zählt also.', 'freude'),
        nar('Hinter der Bar, zwischen leeren Champagnerkisten, eine Tür ohne Griff. Nyra tritt dagegen. Sie geht auf.'),
      ],
      effects: [{ travel: 'server-kern', entry: 'von-quantum-labor', minutes: 10 }],
    },
    {
      id: 'aufzug',
      lines: [
        l('dante', 'Gästeaufzug, Foyer, Laboraufzug, Kernschacht. Klingt nach einem Ausflug. Ich hasse Ausflüge.', 'besorgt'),
        nar('Der Gästeaufzug fährt euch nach unten, durch zwei Etagen voller Panik, und spuckt euch im Foyer aus. Von dort runter ins Labor. Die runde Tür am Kernschacht steht jetzt offen. Natürlich steht sie offen. Nexus will, dass ihr kommt.'),
      ],
      effects: [{ travel: 'quantum-labor', entry: 'von-quantum-foyer', minutes: 15 }],
    },
  ],
};

// ------------------------------------------------------------------------------------------------------- Telefon

const phones: PhoneMessageDef[] = [
  {
    id: 'tel-vega-rednerbruecke',
    from: 'vega',
    auto: all(AKTIV, REDE, not(REBELLION)),
    text: 'Hab Hunter im Visier. Den Kabelbinder auch. Sag Bescheid, wann. Und wenn Raven auf dich losgeht: Sie zielt immer auf die Knie. Immer.',
    replies: [
      { text: 'Warte auf mein Zeichen.', effects: [herz('vega', 10)] },
      { text: 'Woher weißt du das mit den Knien?', effects: [{ message: 'Vega: „Ich hab mit ihr geboxt. 2079. Meine Knie wissen es noch.“' }] },
    ],
  },
];

// --------------------------------------------------------------------------------------------------------- Teil

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: Object.fromEntries([chip, raven, ravenKampf, ravenZurueck, xion, xionKampf, zumKern].map(d => [d.id, d])),
  cutscenes: { [redeFrei.id]: redeFrei, [redeGefangen.id]: redeGefangen, [rebellion.id]: rebellion },
  phone: Object.fromEntries(phones.map(p => [p.id, p])),
  mapAdditions: {
    himmelsgarten: {
      onEnter: [
        { id: 'main-3-gedankenkontrolle-rede', when: all(AKTIV, not(REDE), not(GEFANGEN)), cutscene: redeFrei.id },
        { id: 'main-3-gedankenkontrolle-rede-gefangen', when: all(AKTIV, not(REDE), GEFANGEN), cutscene: redeGefangen.id },
      ],
      hotspots: [
        {
          id: 'main-3-gedankenkontrolle-rede-start', at: 'rednerbruecke', label: 'Blades Rede', kind: 'use',
          when: all(AKTIV, not(REDE)), effects: [{ cutscene: redeFrei.id }],
        },
        {
          id: 'main-3-gedankenkontrolle-tablett', at: 'partysaal', label: 'Kellner-Droide mit Tablett', kind: 'talk',
          dialogue: chip.id, when: all(AKTIV, REDE, not(CHIP)),
        },
        {
          id: 'main-3-gedankenkontrolle-raven', at: 'partysaal', label: 'Raven gegenübertreten', kind: 'talk',
          dialogue: raven.id, when: all(AKTIV, CHIP, not(RAVEN)),
        },
        {
          id: 'main-3-gedankenkontrolle-xion', at: 'tanzflaeche-glas', label: 'Xion', kind: 'talk',
          dialogue: xion.id, when: all(AKTIV, RAVEN, not(XION_ERLEDIGT)),
        },
        {
          id: 'main-3-gedankenkontrolle-blade', at: 'rednerbruecke', label: 'Blade auf der Rednerbrücke', kind: 'use',
          when: all(AKTIV, RAVEN, XION_ERLEDIGT, not(REBELLION)), effects: [zurRebellion],
        },
        {
          id: 'main-3-gedankenkontrolle-zum-kern', at: 'partysaal', label: 'Zum Kern aufbrechen', kind: 'use',
          dialogue: zumKern.id, when: all(REBELLION, active(Q_NEXUS), noFlag('kern_erreicht')),
        },
      ],
    },
  },
};
