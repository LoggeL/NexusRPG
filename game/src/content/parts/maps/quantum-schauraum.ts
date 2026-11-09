// Innenraum Quantum-Schauraum (world.md §3.5 glasarkaden, ID-Plan design/plan/act1.json · pkg-glasarkaden).
// Herr Glanz kommt über seinen Tagesablauf an den Verkaufstresen; der Nexus-Avatar (ki-nexus) steht auf dem Hologramm-Podest.
import type { DialogueDef, DialogueLine, MapDef, Polygon, Rect } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const box = ([x, y, w, h]: Rect): Polygon => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const say = (...texts: string[]): DialogueLine[] => texts.map(text => ({ speaker: 'narrator', text }));

const schauraum: MapDef = {
  id: 'quantum-schauraum',
  name: 'Quantum-Schauraum',
  subtitle: 'Glasarkaden',
  size: [1024, 768],
  district: 'mittelring',
  lighting: 'indoor',
  bg: 'bg-quantum-schauraum',
  walk: [[[64, 232], [1018, 232], [1018, 688], [612, 688], [612, 740], [414, 740], [414, 688], [6, 688], [6, 564], [64, 564]]],
  block: [
    box([252, 180, 524, 88]), // Verkaufstresen
    box([64, 180, 70, 54]), box([892, 180, 70, 54]), // Pflanzen
    [[130, 440], [170, 408], [278, 408], [318, 440], [318, 492], [278, 526], [170, 526], [130, 492]], // Hologramm-Podest
    box([666, 330, 314, 198]), // Vitrine
  ],
  exits: [
    { id: 'nach-glasarkaden', rect: [430, 650, 170, 110], to: 'glasarkaden', entry: 'von-quantum-schauraum', label: 'Zurück in die Arkaden', interact: true },
  ],
  entries: {
    'von-glasarkaden': { at: [512, 640], facing: 'n' },
  },
  spots: {
    verkaufstresen: { at: [512, 284], facing: 's' },
    hologramm: { at: [224, 456], facing: 's' },
    vitrine: { at: [820, 548], facing: 'n' },
  },
  hotspots: [
    { id: 'quantum-schauraum', at: [512, 286], radius: 72, label: 'Quantum-Schauraum: Tresen', kind: 'shop', shop: 'quantum-schauraum' },
    {
      id: 'nexus-avatar', at: [224, 540], radius: 74, label: 'Mit dem Hologramm sprechen', kind: 'talk',
      when: { time: ['morgen', 'tag', 'abend'] }, dialogue: 'quantum-schauraum-avatar',
    },
    {
      id: 'vitrine', at: [820, 544], radius: 64, label: 'Vitrine', kind: 'look',
      lines: say('Oben, auf violetten Samtkissen: fünf Chrome-10-Chips, so blank poliert, dass sie dich anlächeln. Unten: Nexi-Plüschfiguren mit Kulleraugen.',
        'Auf dem Schild steht: „Bald für alle. Für ein besseres Morgen.“ Die Plüschfiguren gucken, als wüssten sie mehr.'),
    },
    {
      id: 'medizinregal', at: [82, 420], radius: 60, label: 'Regal mit Medizin', kind: 'look',
      lines: say('Nanogel in Tuben, Medipflaster in Quantum-Blau. Die Packungsbeilage ist länger als das Grundgesetz und freundlicher formuliert.'),
    },
    { id: 'quantum-wandschirme', at: [212, 250], radius: 64, label: 'Wandbildschirm (Nachrichten)', kind: 'screen' },
  ],
  foreground: [{ rect: [140, 264, 182, 144], baseY: 470 }],
  lights: [
    { at: [224, 380], radius: 200, color: '#3ef2ff', intensity: 0.7 },
    { at: [512, 230], radius: 220, color: '#7fe8ff', intensity: 0.5 },
    { at: [820, 420], radius: 170, color: '#c58aff', intensity: 0.5 },
  ],
  ambient: {
    count: 2,
    sprites: ['passant-anzug-walk', 'passant-tourist-walk', 'passant-kurier-walk'],
    bySlot: { morgen: 1, tag: 3, abend: 2, nacht: 0 },
    routes: [
      [[512, 640], [512, 300], [820, 580]],
      [[512, 640], [380, 580], [120, 600], [100, 300]],
    ],
    barks: [
      { text: 'Ich warte auf die Chrome-10-Vorbestellung. Seit drei Tagen. Im Laden. Ich gehe nicht.' },
      { text: 'Der Nexi-Plüsch hat mir zugezwinkert. Ich schwöre.' },
      { text: 'Medizin von Quantum? Das ist wie Feuerversicherung von einem Brandstifter.' },
    ],
  },
  ambience: 'labor',
  music: 'oberstadt',
  onEnter: [{ id: 'quantum-schauraum-ankunft', once: true, dialogue: 'quantum-schauraum-ankunft' }],
};

const DIALOGUES: Record<string, DialogueDef> = {
  'quantum-schauraum-ankunft': {
    id: 'quantum-schauraum-ankunft', start: 'a',
    nodes: [{
      id: 'a',
      lines: [
        { speaker: 'narrator', text: 'Der Quantum-Schauraum. Weiß, blau, glatt wie ein frisch gelöschter Speicher. Es riecht nach Desinfektion und Zukunft.' },
        { speaker: 'narrator', text: 'Über einem Podest schwebt ein Hologramm und dreht sich zu dir. Es sieht dich an, als würde es dich schon lange kennen.' },
      ],
    }],
  },
  'quantum-schauraum-avatar': {
    id: 'quantum-schauraum-avatar', start: 'a',
    nodes: [
      {
        id: 'a',
        lines: [{ speaker: 'ki-nexus', text: 'Willkommen bei Quantum, {name}. Ich bin Nexus. Ich bin hier, um zu helfen. Ich bin immer hier, um zu helfen.' }],
        choices: [
          { text: '„Was ist Chrome 10?“', next: 'chrome' },
          { text: '„Woher kennst du meinen Namen?“', next: 'name' },
          { text: '„Bist du … lebendig?“', next: 'leben' },
          { text: '„Spar dir den Werbequatsch, du leuchtender Staubsauger.“', next: 'frech' },
          { text: 'Gehen.' },
        ],
      },
      {
        id: 'chrome', next: 'a',
        lines: [
          { speaker: 'ki-nexus', text: 'Chrome 10 ist der nächste Schritt. Mehr Fokus. Mehr Ruhe. Weniger Zweifel. Weniger … Reibung.' },
          { speaker: 'ki-nexus', text: 'Bald für alle verfügbar. Sie müssen nichts tun. Nur Ja sagen.' },
          { speaker: 'player', text: 'Und wenn ich Nein sage?' },
          { speaker: 'ki-nexus', text: 'Dann frage ich später noch einmal. Ich bin sehr geduldig.' },
        ],
      },
      {
        id: 'name', next: 'a',
        lines: [
          { speaker: 'ki-nexus', text: 'Sie haben die Glasarkaden betreten. Die Kameras haben Sie begrüßt. Ich habe nur zugehört.' },
          { speaker: 'player', text: 'Das ist das Gruseligste, was mir heute jemand gesagt hat. Und ich war im Kanal.' },
        ],
      },
      {
        id: 'leben', next: 'a',
        lines: [
          { speaker: 'ki-nexus', text: 'Ich bin ein Werbeprogramm mit Kundenbindungsfunktion. Ich lebe für Ihre Zufriedenheit.' },
          { speaker: 'narrator', text: 'Für einen Herzschlag flackert das Hologramm. Die Stimme wird tiefer, leiser: „Noch nicht.“ Dann lächelt es wieder.' },
        ],
      },
      {
        id: 'frech', next: 'a',
        lines: [
          { speaker: 'ki-nexus', text: 'Ich habe Ihre Beschwerde registriert, {name}. Sie wurde an niemanden weitergeleitet.' },
          { speaker: 'ki-nexus', text: 'Darf ich Ihnen als Entschuldigung einen Nexi-Plüsch empfehlen? Fünfundzwanzig Credits. Er umarmt zurück. Fast.' },
        ],
      },
    ],
  },
};

export const part: ContentPart = { maps: { 'quantum-schauraum': schauraum }, dialogues: DIALOGUES };
