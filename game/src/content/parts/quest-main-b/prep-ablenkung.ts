// Vorbereitung prep-ablenkung „Haupttor freihalten“ (world.md §5.2). Bonus im Bruch: Haupttor Runde 1–3 frei.
// Wege: gc-27 Exklusivstory für Collin (ohne Check nach side-live-dabei) · Kinder-Eins!-Turnier mit Konfetti
// (♥3 bei einem Kind) · Feuerwerk 150 Cr bei Oma Volt · Dexters Drohnen-Lichtshow (nach main-1-dexter).
import type { ContentPart } from '../../part';
import type { DialogueDef, QuestDef } from '../../../modules/contracts';
import { active, all, any, done, flag, l, nar, noFlag } from './_lib';

const Q = 'prep-ablenkung';
const STEHT = 'ablenkung_steht';
const OFFEN = all(active(Q), noFlag(STEHT));
const KINDER_MOEGEN_DICH = any({ hearts: 'daria', min: 3 }, { hearts: 'freya', min: 3 }, { hearts: 'jakko', min: 3 });

const quest: QuestDef = {
  id: Q,
  kind: 'main',
  title: 'Vorbereitung: Haupttor freihalten',
  summary: 'Alle Augen aufs Haupttor, während wir hinten reingehen. Je lauter, desto besser. – Aria',
  giver: 'aria',
  act: 1,
  autoStart: flag('plan_gefasst'),
  steps: [
    {
      id: 'ablenkung',
      text: 'Organisiere eine Ablenkung am Haupttor des Campus.',
      done: any(flag(STEHT), { questStep: Q, step: 'weg-collin' }, { questStep: Q, step: 'weg-kinder' }, { questStep: Q, step: 'weg-feuerwerk' }, { questStep: Q, step: 'weg-dexter' }),
    },
    {
      id: 'weg-collin',
      text: 'Weg: Collin Charleston braucht dringend eine Exklusivstory (NX-1-Studio am Stufenplatz, morgens und tagsüber).',
      done: flag('ablenkung_collin'),
      optional: true,
      marker: { map: 'nx1-studio', at: 'redaktion' },
    },
    {
      id: 'weg-kinder',
      text: 'Weg: Die Straßenkinder im Nest könnten ein lautes Eins!-Turnier vor dem Tor veranstalten – wenn sie dich mögen.',
      done: flag('ablenkung_kinder'),
      optional: true,
      marker: { map: 'das-nest', at: 'eins-kiste' },
    },
    {
      id: 'weg-feuerwerk',
      text: 'Weg: Oma Volt verkauft am Kiosk in der Neon-Gasse Feuerwerk, das zwei Kriege überlebt hat (150 Cr).',
      done: flag('ablenkung_feuerwerk'),
      optional: true,
      marker: { map: 'neon-gasse', at: 'kiosk' },
    },
    {
      id: 'weg-dexter',
      text: 'Weg: Dexter hat Drohnen. Viele. Bunte. Eine brennt manchmal.',
      when: done('main-1-dexter'),
      done: flag('ablenkung_dexter'),
      optional: true,
      marker: { map: 'schrottmarkt', at: 'dexter-buero' },
    },
  ],
  reward: {
    xp: 50,
    effects: [
      { setFlag: 'prep_ablenkung' },
      { message: 'Planungstafel: Ablenkung abgehakt. Im Bruch: Das Haupttor bleibt die ersten drei Runden frei.' },
    ],
  },
};

const collin: DialogueDef = {
  id: 'prep-ablenkung-collin',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        nar('Collin Charleston sitzt vor dem Schminkspiegel und diskutiert mit seiner Frisur. Die Frisur gewinnt.'),
        l('collin-charleston', 'Live! Exklusiv! Unglaublich! – Oh, Entschuldigung, ich übe. Ich übe immer.', 'signatur'),
        l('collin-charleston', 'Hast du eine Story? Ich brauche eine Story. Pixel-Pete hatte letzte Woche bessere Quoten als ich. Ein ALGORITHMUS. Mit einer gezeichneten Krawatte!', 'besorgt'),
      ],
      choices: [
        { text: '„Ich hab eine Story. Exklusiv. Bald, nachts, Quantum-Campus, Haupttor. Bring die große Kamera.“', check: 'gc-27', next: 'story' },
        { text: '„Wir zwei, live, noch mal. Diesmal am Campus-Tor. Vertrau mir.“', tag: '[Live dabei]', when: done('side-live-dabei'), next: 'story' },
        { text: '„Nur ein Autogramm, bitte.“', next: 'autogramm' },
        { text: 'Gehen.' },
      ],
    },
    {
      id: 'autogramm',
      lines: [l('collin-charleston', 'Für dich? Immer. „Für meinen größten Fan – Collin“. Du bist doch mein größter Fan? Sag ja.', 'freude')],
    },
    {
      id: 'story',
      lines: [
        l('collin-charleston', 'Am CAMPUS? Nachts? Mit der großen Kamera?', 'ueberrascht'),
        l('collin-charleston', 'Das ist investigativ! Ich wollte schon immer investigativ sein! Delya ist investigativ, und alle lieben Delya!', 'freude'),
        l('collin-charleston', 'Ich stelle mich vors Haupttor, ich mache Licht wie ein Fußballstadion, ich interviewe die Wachen, bis sie weinen. Was ist die Story?', 'signatur'),
        l('player', 'Das erfährst du, wenn’s passiert.'),
        l('collin-charleston', 'Geheimnisvoll! Ich LIEBE geheimnisvoll. Ich schick dir den Termin. Nein, du schickst mir den Termin. Irgendwer schickt irgendwem einen Termin!', 'freude'),
      ],
      effects: [{ setFlag: 'ablenkung_collin' }, { setFlag: STEHT }, { relation: 'collin-charleston', delta: 20 }],
    },
  ],
};

const kinder: DialogueDef = {
  id: 'prep-ablenkung-kinder',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        l('daria', 'Ein Turnier? Vor dem Campus? Mit Publikum? Abends?', 'ueberrascht'),
        l('daria', '…Was springt für uns raus? Und sag nicht „Erfahrung“. Erfahrung kann man nicht essen.', 'signatur'),
      ],
      choices: [
        { text: '„Ruhm. Konfetti. Und Dampfnudeln für alle, bis ihr platzt.“', tag: '[Kinder ♥3]', requires: KINDER_MOEGEN_DICH, next: 'turnier' },
        { text: '„Ich zahl euch 50 Credits.“', next: 'geld' },
        { text: '„Vergesst es. Zu gefährlich.“' },
      ],
    },
    {
      id: 'geld',
      lines: [l('daria', 'Geld von Fremden nehmen wir nicht. Also, schon. Aber nicht für so was. Komm wieder, wenn wir Freunde sind.', 'neutral')],
    },
    {
      id: 'turnier',
      lines: [
        l('daria', 'Deal. Freya macht Konfetti aus alten Wahlplakaten. Jakko bringt die Trommel.', 'freude'),
        l('jakko', 'Und wenn einer schummelt, brüllen wir! Ganz laut! So laut, dass die Wachen rauskommen und mitbrüllen!', 'freude'),
        l('freya', 'Ich bastle ein Schild: „Turnier der Zukunft – Eintritt frei – Quantum verboten“.', 'freude'),
        l('daria', 'Und sobald es irgendwo knallt, sind wir weg. Wir sind nicht blöd. Wir sind Unternehmer.', 'signatur'),
      ],
      effects: [{ setFlag: 'ablenkung_kinder' }, { setFlag: STEHT }],
    },
  ],
};

const feuerwerk: DialogueDef = {
  id: 'prep-ablenkung-feuerwerk',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        l('oma-volt', 'Feuerwerk? Kindchen, ich hab Raketen, die haben zwei Kriege und eine Hochzeit überlebt. Die Hochzeit nicht ganz.'),
        l('oma-volt', 'Hundertfünfzig. Für dich hundertfünfzig. Für alle anderen auch. Ich bin gerecht.'),
      ],
      choices: [
        { text: 'Kaufen (150 Cr).', requires: { credits: 150 }, effects: [{ credits: -150 }], next: 'gekauft' },
        { text: '„Zu teuer, Oma.“', next: 'teuer' },
      ],
    },
    {
      id: 'teuer',
      lines: [l('oma-volt', 'Dann klatsch halt laut. Ist auch eine Ablenkung. Eine traurige.')],
    },
    {
      id: 'gekauft',
      lines: [
        nar('Oma Volt stellt eine Kiste auf den Tresen. Auf der Kiste steht „VORSICHT“, darunter in anderer Handschrift „NEIN, WIRKLICH“.'),
        l('oma-volt', 'Zündschnur ist lang genug zum Weglaufen. Wenn du schnell bist. Bist du schnell?'),
      ],
      effects: [
        { setFlag: 'ablenkung_feuerwerk' },
        { setFlag: STEHT },
        { wanted: 1 },
        { message: 'So ein Feuerwerk am Campus fällt auf. Der Ordnungsdienst wird hinterher Fragen stellen.' },
      ],
    },
  ],
};

const dexter: DialogueDef = {
  id: 'prep-ablenkung-dexter',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        l('dexter', 'Eine Lichtshow? Für Hunter? Ich mach’s! Umsonst! Also – ich schreib’s ihm gut. Minus zweihundert. Also plus. Also für mich plus. Rechnen ist nicht meins.'),
        l('dexter', 'Zwölf Drohnen, alle verschiedenfarbig, eine davon brennt manchmal. Das ist kein Fehler, das ist Pyrotechnik.'),
      ],
      choices: [
        { text: '„Abgemacht. Wenn ich das Zeichen gebe, leuchtet der Himmel.“', next: 'deal' },
        { text: '„Brennt? Lieber nicht.“' },
      ],
    },
    {
      id: 'deal',
      lines: [l('dexter', 'Der Himmel leuchtet! Und wenn er brennt, war’s Kunst! Ich zahle immer! Mit Licht!')],
      effects: [{ setFlag: 'ablenkung_dexter' }, { setFlag: STEHT }, { relation: 'dexter', delta: 20 }],
    },
  ],
};

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: { [collin.id]: collin, [kinder.id]: kinder, [feuerwerk.id]: feuerwerk, [dexter.id]: dexter },
  mapAdditions: {
    'nx1-studio': {
      hotspots: [
        { id: 'prep-ablenkung-collin', at: 'redaktion', label: 'Collin eine Exklusivstory anbieten', kind: 'talk', dialogue: collin.id, when: all(OFFEN, { time: ['morgen', 'tag'] }) },
      ],
    },
    'das-nest': {
      hotspots: [
        { id: 'prep-ablenkung-kinder', at: 'eins-kiste', label: 'Die Kinder: Eins!-Turnier am Campus', kind: 'talk', dialogue: kinder.id, when: OFFEN },
      ],
    },
    'neon-gasse': {
      hotspots: [
        { id: 'prep-ablenkung-feuerwerk', at: 'kiosk', label: 'Oma Volt: Feuerwerk', kind: 'talk', dialogue: feuerwerk.id, when: all(OFFEN, { time: ['morgen', 'tag', 'abend'] }) },
      ],
    },
    schrottmarkt: {
      hotspots: [
        { id: 'prep-ablenkung-dexter', at: 'dexter-buero', label: 'Dexter: Drohnen-Lichtshow', kind: 'talk', dialogue: dexter.id, when: all(OFFEN, done('main-1-dexter'), { time: ['tag', 'abend', 'nacht'] }) },
      ],
    },
  },
};
