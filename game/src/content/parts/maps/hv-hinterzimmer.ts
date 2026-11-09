// Innenraum Hinterzimmer des High Voltage (world.md §3.5/§3.6, Plan design/plan/act1.json maps.hv-hinterzimmer,
// Paket pkg-neon-gasse). Hunters Büro: Auftragstafel, Planungstisch, Sofa, Jimmys Kiste, Fotowand der alten Crew.
// Koordinaten am fertigen Bild game/public/assets/bg/hv-hinterzimmer.webp (1024×768) nachgezogen.
import type { Condition, DialogueLine, MapDef, Polygon, Rect } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const box = ([x, y, w, h]: Rect): Polygon => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const n = (text: string): DialogueLine => ({ speaker: 'narrator', text });
const ich = (text: string): DialogueLine => ({ speaker: 'player', text });

const V: Condition = { playerIs: 'vex' };
const PROBEZEIT_DONE: Condition = { quest: 'main-1-probezeit', state: 'done' };
const PLAN_LAEUFT: Condition = { quest: 'main-1-der-plan', state: ['active', 'done'] };

const hinterzimmer: MapDef = {
  id: 'hv-hinterzimmer',
  name: 'Hinterzimmer',
  subtitle: 'High Voltage',
  size: [1024, 768],
  district: 'unterstadt',
  lighting: 'indoor',
  bg: 'bg-hv-hinterzimmer',
  walk: [box([8, 250, 1008, 512])],
  block: [
    box([372, 236, 300, 26]), // Schreibtisch (Unterkante)
    box([0, 428, 238, 146]), // Sofa
    box([248, 480, 56, 90]), // Beistelltisch
    [[568, 318], [900, 318], [900, 536], [730, 536], [726, 582], [648, 582], [648, 536], [522, 522], [516, 394], [568, 390]], // Planungstisch mit Stühlen
    box([902, 398, 118, 86]), // Whiteboard-Füße
    box([850, 566, 172, 136]), // Jimmys Kiste
    box([70, 612, 34, 130]), // Türrahmen links
    box([190, 612, 30, 130]), // Türrahmen rechts
  ],
  exits: [
    { id: 'nach-high-voltage', rect: [104, 640, 86, 110], to: 'high-voltage', entry: 'von-hv-hinterzimmer', label: 'Zurück in den Club', interact: true },
  ],
  entries: {
    'von-high-voltage': { at: [250, 650], facing: 'n' },
  },
  spots: {
    schreibtisch: { at: [520, 228], facing: 's' },
    planungstisch: { at: [470, 452], facing: 'e' },
    sofa: { at: [150, 600], facing: 'n' },
    'jimmys-kiste': { at: [815, 640], facing: 'e' },
    fotowand: { at: [865, 268], facing: 'n' },
    tresor: { at: [715, 272], facing: 'n' },
  },
  hotspots: [
    {
      id: 'auftragstafel', at: [210, 262], radius: 70, label: 'Auftragstafel', kind: 'board', board: 'auftragstafel',
      when: PROBEZEIT_DONE,
    },
    {
      id: 'auftragstafel-gesperrt', at: [210, 262], radius: 70, label: 'Korkwand ansehen', kind: 'look',
      when: { not: PROBEZEIT_DONE },
      lines: [
        n('Fotos, Stadtplan, Zettel mit Namen, die jemandem Geld schulden. Einer davon ist dick rot umkringelt und hat ein Herzchen dran. Das Herzchen ist das Bedrohlichste an der ganzen Wand.'),
        { speaker: 'hunter', text: 'Finger weg. Die Tafel ist für Leute, die schon bewiesen haben, dass sie nicht heulen, wenn einer zurückschlägt.' },
      ],
    },
    {
      id: 'planungstafel', at: [880, 520], radius: 80, label: 'Planungstafel', kind: 'board', board: 'planungstafel',
      when: PLAN_LAEUFT,
    },
    {
      id: 'planungstisch', at: [470, 452], radius: 64, label: 'Stadtplan ansehen', kind: 'look',
      when: { not: PLAN_LAEUFT },
      lines: [
        n('Ein Stadtplan, festgepinnt mit Kaffeetassen. Rote Nadeln stecken auf dem Quantum-Tower, eine einzelne auf einer Pommesbude am Bahnhof.'),
        ich('Strategisch wichtig, die Pommesbude?'),
        n('Auf einem Zettel daneben steht in Vegas Handschrift: „Hunter, hör auf, hier Snacks zu planen.“'),
      ],
    },
    {
      id: 'fotowand', at: [865, 262], radius: 70, label: 'Fotowand ansehen', kind: 'look',
      lines: [
        n('Alte Crew-Fotos in schiefen Rahmen. Hunter mit mehr Haaren, Hunter mit weniger Haaren, Hunter mit Hut, der nie wieder erwähnt wird.'),
        n('Auf dem größten Bild steht ein Mann mit Sonnenbrille im Neonlicht und grinst, als hätte er die Stadt schon gekauft. Jemand hat sein Gesicht mit einem Kronkorken beklebt. Sehr sorgfältig. Mit Sekundenkleber.'),
        { speaker: 'hunter', text: 'Das ist Blade. War mal einer von uns. Jetzt ist er einer von denen. Frag nicht weiter, sonst muss ich trinken, und es ist zu früh zum Trinken. Es ist immer zu früh.' },
      ],
    },
    {
      id: 'jimmys-kiste', at: [830, 600], radius: 70, label: 'Jimmys Kiste ansehen', kind: 'look',
      lines: [
        n('Eine Holzkiste voller Kabel, ein Hemd mit Fettflecken, ein Kaffeebecher mit der Aufschrift … nein, ohne Aufschrift, nur ein Sprung. Das hier war mal Jimmys Ecke.'),
        n('Ganz unten ein zerknitterter Zettel: „Bin gleich zurück. – J.“ Der Zettel ist älter als die meisten Pflanzen hier.'),
      ],
    },
    {
      id: 'tresor', at: [715, 270], radius: 56, label: 'Tresor ansehen', kind: 'look',
      lines: [
        n('Ein Tresor, älter als die Unterstadt und doppelt so stur. Auf der Tür klebt ein Zettel: „Code ist NICHT der Geburtstag vom Barkeeper.“'),
        ich('Wann hat der Barkeeper Geburtstag?'),
        n('Niemand weiß es. Das ist ja der Witz.'),
      ],
    },
    {
      id: 'sofa', at: [150, 590], radius: 64, label: 'Sofa ansehen', kind: 'look',
      lines: [
        n('Ein Ledersofa mit mehr Rissen als ein Stadtplan. Die Delle links hat exakt Arias Hintern-Form, die rechte Vegas. In der Mitte sitzt keiner. Die Mitte ist für Leute, die gern zwischen den Fronten sterben.'),
      ],
    },
  ],
  foreground: [
    { rect: [372, 145, 300, 112], baseY: 256 },
    { rect: [848, 560, 176, 140], baseY: 700 },
  ],
  lights: [
    { at: [430, 168], radius: 110, color: '#7dff6a', intensity: 0.6 },
    { at: [230, 60], radius: 220, color: '#ffbf6b', intensity: 0.7 },
    { at: [890, 40], radius: 200, color: '#ffbf6b', intensity: 0.6 },
    { at: [835, 345], radius: 150, color: '#ffd38a', intensity: 0.7 },
    { at: [150, 700], radius: 140, color: '#ff3fd0', intensity: 0.8 },
    { at: [690, 22], radius: 160, color: '#ff3fa4', intensity: 0.5 },
  ],
  ambience: 'innen',
  music: 'high-voltage',
  musicMuffled: true,
  onEnter: [
    {
      id: 'hinterzimmer-erstbesuch', once: true,
      effects: [
        { markSeen: 'hv-hinterzimmer-betreten' },
        { message: 'Das Hinterzimmer riecht nach Leder, kaltem Kaffee und Entscheidungen, die man nachts trifft.' },
      ],
    },
    {
      id: 'hinterzimmer-vex', once: true, when: V,
      effects: [{ message: 'Vex scannt den Raum: zwei Ausgänge, wenn man das Fenster mitzählt. Man zählt das Fenster immer mit.' }],
    },
  ],
  fastTravel: { to: 'neon-gasse', entry: 'von-high-voltage' },
};

export const part: ContentPart = { maps: { 'hv-hinterzimmer': hinterzimmer } };
