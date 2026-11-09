// Innenraum Netzcafé Datenkrümel (world.md §3.5/§3.6, Plan maps.netzcafe-datenkruemel, Paket pkg-bahnhof-mitte).
// Bild 1152×768 (Rohbild 1536×1024 ohne Beschnitt verkleinert, damit Kaffee-Neon und Nyras Ecke ganz drauf sind).
import type { MapDef, Polygon, Rect } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const box = ([x, y, w, h]: Rect): Polygon => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const n = (text: string) => ({ speaker: 'narrator' as const, text });

const RECHNER_KEY = 'netzcafe-rechner';

const netzcafe: MapDef = {
  id: 'netzcafe-datenkruemel',
  name: 'Netzcafé Datenkrümel',
  subtitle: 'Bahnhof Mitte',
  size: [1152, 768],
  district: 'unterstadt',
  lighting: 'indoor',
  bg: 'bg-netzcafe-datenkruemel',
  ambience: 'innen',
  walk: [box([58, 215, 1032, 538])],
  block: [
    box([83, 0, 308, 205]), // Uralt-Rechner in der Nische
    box([281, 128, 71, 100]), // Bürostuhl
    box([818, 140, 255, 92]), // Theke mit Kaffeeautomat
    box([113, 248, 578, 146]), // Terminalreihe oben
    box([113, 416, 578, 128]), // Terminalreihe unten
    box([855, 300, 236, 143]), // Nyras Ecke (Sitzsack, Tisch)
    box([941, 574, 147, 176]), // Kabelkiste
    box([499, 593, 150, 131]), // Glastür-Windfang
  ],
  foreground: [
    { rect: [113, 246, 578, 150], baseY: 394 },
    { rect: [113, 414, 578, 132], baseY: 544 },
  ],
  exits: [
    { id: 'nach-bahnhof-mitte', rect: [505, 578, 140, 142], to: 'bahnhof-mitte', entry: 'von-netzcafe-datenkruemel', label: 'Zurück in die Halle', interact: true },
  ],
  entries: {
    'von-bahnhof-mitte': { at: [574, 572], facing: 'n' },
  },
  spots: {
    'nyras-platz': { at: [900, 458], facing: 'n' },
    terminals: { at: [300, 562], facing: 'n' },
    'theke-netzcafe': { at: [915, 252], facing: 'n' },
    'hinterer-rechner': { at: [300, 236], facing: 'n' },
  },
  hotspots: [
    {
      id: 'terminal-hack', at: [228, 224], radius: 64, label: 'Uralt-Rechner hacken', kind: 'use',
      hideWhen: { wonMinigame: RECHNER_KEY },
      lines: [n('Ein beiger Turm, so alt, dass er noch Lüfter hat. Auf dem grünen Bildschirm blinkt: „PASSWORT?“ Darunter jemand mit Edding: „nicht 1234“.')],
      effects: [{
        minigame: 'akt-hacken', level: 1, key: RECHNER_KEY, label: 'Uralt-Rechner',
        win: [{ xp: 10 }, { message: 'Das Laufwerk springt mit einem Ächzen auf. Darin steckt etwas Würfelförmiges.' }],
        lose: [{ message: 'Der Rechner piept beleidigt und zeigt ein Strichmännchen, das dir den Mittelfinger zeigt. Nochmal.' }],
      }],
    },
    {
      id: 'datenwuerfel-05', at: [150, 228], label: 'Laufwerk ausräumen', kind: 'loot', once: true,
      when: { wonMinigame: RECHNER_KEY },
      effects: [{ give: 'datenwuerfel-05' }, { message: 'Ein Datenwürfel aus dem Laufwerk. Etikett: „Netzcafé-Log. NICHT LÖSCHEN. – N.“' }],
    },
    {
      id: 'schwarzes-brett', at: [581, 222], radius: 70, label: 'Schwarzes Brett lesen', kind: 'look',
      lines: [
        n('„Suche Bassistin mit Schläger. Ohne Schläger auch okay. Mit lieber.“'),
        n('„Wer hat meinen Datenwürfel? Belohnung: ein Keks. Angebissen. – D.“'),
        n('„Oma mit Turbobeinen hat mir am Bahnsteig die Handtasche zurückgebracht. Bevor ich gemerkt hab, dass sie weg war. Wer IST die?“'),
        n('„Container 77 im Hafen. Jeden Dienstag. Nachts. Fragt nicht. Fragt WIRKLICH nicht.“'),
        n('„Ratten im Kanal haben jetzt einen König. Kein Witz. Er hat eine Krone aus Kronkorken.“'),
      ],
    },
    { id: 'theke', at: [950, 244], radius: 50, label: 'Theke (Netzcafé)', kind: 'shop', shop: 'netzcafe-datenkruemel' },
    {
      id: 'kaffeeautomat', at: [836, 244], radius: 46, label: 'Automatenkaffee ziehen (2 Cr)', kind: 'use',
      effects: [
        { credits: -2 }, { heal: 10 },
        { message: 'Der Automat spuckt etwas Braunes in den Becher. Schmeckt nach Kabelbrand mit Milch. Du bist trotzdem wacher.' },
      ],
    },
    { id: 'terminals', at: [300, 556], radius: 70, label: 'Netzterminal (Nachrichten)', kind: 'screen' },
    {
      id: 'terminal-zwei', at: [560, 404], radius: 40, label: 'Monitor ansehen', kind: 'look',
      lines: [n('Auf dem Bildschirm läuft ein Spiel namens „Drohnenjagd“. Der letzte Spieler hat aufgegeben, der Highscore heißt „FICK DICH NYRA“. Darunter: „selber – N.“')],
    },
    {
      id: 'nyras-ecke', at: [900, 456], label: 'Ecktisch ansehen', kind: 'look', when: { not: { time: 'morgen' } },
      lines: [
        n('Ein Sitzsack mit Kuhle, ein Tisch, eine Lampe. Ein Zettel klebt drauf: „RESERVIERT. Für immer. Morgens. – Nyra“'),
        n('Daneben ein Kaffeebecher mit einer gemalten Welle drauf. Sie ist größer als der Becher.'),
      ],
    },
    {
      id: 'kabelkiste', at: [1010, 560], label: 'Kabelkiste', kind: 'look',
      lines: [n('Eine Kiste voller Kabel, die sich gegenseitig gefressen haben. Obendrauf ein Router mit fünf Antennen, der aussieht, als würde er gleich abheben.')],
    },
  ],
  lights: [
    { at: [265, 95], radius: 130, color: '#5bff8a', intensity: 0.55 },
    { at: [570, 30], radius: 220, color: '#bff8ff', intensity: 0.4 },
    { at: [350, 290], radius: 200, color: '#3e8cff', intensity: 0.45 },
    { at: [350, 455], radius: 200, color: '#3eff9a', intensity: 0.4 },
    { at: [950, 110], radius: 150, color: '#ff3fd0', intensity: 0.7 },
    { at: [1050, 260], radius: 170, color: '#ff9fe8', intensity: 0.5 },
    { at: [574, 650], radius: 150, color: '#3ef2ff', intensity: 0.55 },
  ],
  ambient: {
    count: 2,
    bySlot: { morgen: 1, tag: 3, abend: 2, nacht: 1 },
    sprites: ['passant-punk-walk', 'passant-tourist-walk', 'passant-kurier-walk'],
    routes: [[[150, 570], [460, 570], [460, 230]], [[720, 300], [720, 560], [840, 560]]],
    barks: [
      { text: 'Noch fünf Minuten. Dann geh ich. Seit drei Stunden.' },
      { text: 'Wer hat die Tastatur mit Senf gegessen?' },
      { text: 'Ich hack nicht, ich surf nur mit Nachdruck.' },
      { text: 'Psst. Das WLAN-Passwort ist „Pass auf“. Echt jetzt.' },
      { text: 'Der Kaffee hier ist ein Verbrechen. Ich nehm noch einen.', when: { time: 'morgen' } },
    ],
  },
  onEnter: [
    {
      id: 'netzcafe-erstbesuch', once: true,
      effects: [{ markSeen: 'zone:netzcafe-datenkruemel' }, { message: 'Netzcafé Datenkrümel: Es riecht nach heißen Lüftern, Instantnudeln und schlechten Entscheidungen.' }],
    },
  ],
};

export const part: ContentPart = {
  maps: { [netzcafe.id]: netzcafe },
};
