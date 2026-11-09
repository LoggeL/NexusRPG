// Innenraum Rippers Praxis (world.md §3.5/§3.6, Plan design/plan/act1.json maps.ripper-praxis, Paket pkg-schrottmarkt).
// Enge Hinterhofklinik: Behandlungsstuhl in der Mitte, Auslage oben links, Hinterzimmer-Vorhang oben rechts,
// Wartebank unten links, Glastür unten. Geometrie am Bild game/public/assets/bg/ripper-praxis.webp (1024×768).
// Herz-Ereignisse (he-ripper-2/4) und Quests (pers-freya-fairer-lohn, side-container-77) setzen eigene Hotspots über
// mapAdditions an die Spots; hier stehen Händler, Blicke und Spots.
import type { Condition, DialogueLine, MapDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const n = (text: string): DialogueLine => ({ speaker: 'narrator', text });
const ripper = (text: string, expr?: DialogueLine['expr']): DialogueLine => ({ speaker: 'ripper', text, ...(expr ? { expr } : {}) });

/** Hinterzimmer-Sortiment (wie RIPPER_HINTERZIMMER in system/shops.ts). */
const HINTERZIMMER: Condition = { any: [{ flag: 'ripper_kennt_dich' }, { rep: 'unterstadt', min: 20 }] };
const FAIRER_LOHN: Condition = { quest: 'pers-freya-fairer-lohn', state: 'done' };

const ripperPraxis: MapDef = {
  id: 'ripper-praxis',
  name: 'Rippers Praxis',
  subtitle: 'Schrottmarkt',
  size: [1024, 768],
  district: 'unterstadt',
  lighting: 'indoor',
  bg: 'bg-ripper-praxis',
  walk: [
    [[12, 288], [270, 288], [276, 274], [1012, 274], [1012, 690], [606, 690], [606, 712], [426, 712], [426, 690], [12, 690]],
  ],
  block: [
    // Instrumentenwagen, Behandlungsstuhl mit Teppich, Monitor und Gasflaschen
    [[330, 300], [730, 300], [730, 452], [612, 452], [612, 496], [438, 496], [438, 458], [330, 458]],
    // Wartebank mit Pflanze und Beistelltisch
    [[0, 500], [46, 500], [46, 560], [320, 560], [320, 692], [0, 692]],
    // Türpfosten der Glastür
    [[395, 645], [428, 645], [428, 712], [395, 712]],
    [[604, 645], [636, 645], [636, 712], [604, 712]],
    // Kisten rechts unten
    [[920, 556], [1024, 556], [1024, 700], [920, 700]],
  ],
  exits: [
    { id: 'nach-schrottmarkt', rect: [430, 676, 172, 36], to: 'schrottmarkt', entry: 'von-ripper-praxis', label: 'Zurück auf den Markt', interact: true, minutes: 2 },
  ],
  entries: {
    'von-schrottmarkt': { at: [516, 654], facing: 'n' },
  },
  spots: {
    behandlungsstuhl: { at: [392, 494], facing: 's' },
    auslage: { at: [150, 318], facing: 'n' },
    'hinterzimmer-vorhang': { at: [920, 300], facing: 'n' },
    wartebank: { at: [346, 602], facing: 'w' },
    preistafel: { at: [806, 300], facing: 'n' },
  },
  hotspots: [
    {
      id: 'ripper-praxis', at: [470, 506], radius: 64, label: 'Rippers Praxis (Handel und Einbau)', kind: 'shop', shop: 'ripper-praxis',
      when: { time: ['tag', 'abend'] },
    },
    {
      id: 'ripper-hinterzimmer', at: [920, 282], radius: 62, label: 'Hinterzimmer', kind: 'shop', shop: 'ripper-praxis', when: HINTERZIMMER,
      lines: [
        n('Ripper zieht den roten Vorhang einen Spalt auf. Dahinter: Regale mit Teilen, die keine Seriennummern mehr haben. Oder zu viele.'),
        ripper('Für Stammkunden. Was du hier siehst, hast du nie gesehen. Und wenn doch: Da ist ein Virus drauf.', 'signatur'),
      ],
    },
    {
      id: 'vorhang', at: [920, 282], radius: 62, label: 'Roter Vorhang', kind: 'look', hideWhen: HINTERZIMMER,
      lines: [
        n('Ein schwerer roter Vorhang. Dahinter flüstert jemand Zahlen, die verdammt hoch klingen.'),
        ripper('Finger weg, Frischfleisch. Hinterzimmer ist für Leute, die ich kenne. Dich kenn ich noch nicht. Und ehrlich? Ich hab’s nicht eilig.'),
        n('(Hinterzimmer: wenn Ripper dich kennt oder ab Ruf Unterstadt 20.)'),
      ],
    },
    {
      id: 'auslage', at: [150, 300], radius: 72, label: 'Auslage ansehen', kind: 'look',
      lines: [
        n('Hinter Glas, auf rotem Samt: Augen, Fingergelenke, ein Unterarm mit Gänsehaut-Sensor und ein Chip, der „ORIGINAL“ draufgeklebt hat. Mit Tesafilm.'),
        n('Jedes Teil hat ein Schildchen mit einem Preis und einem Sternchen. Das Sternchen erklärt nirgends, was es bedeutet. Das ist das Sternchen.'),
      ],
    },
    {
      id: 'preistafel', at: [806, 284], radius: 54, label: 'Preistafel', kind: 'look', hideWhen: FAIRER_LOHN,
      lines: [n('Eine Tafel mit Ankaufspreisen: „Auge, Kind: 10 Cr. Finger, Kind: 2 Cr. Gute Laune: unbezahlbar.“ Darunter hat jemand mit Kreide „ARSCHLOCH“ geschrieben. In Kinderschrift. Ripper hat es nicht weggewischt.')],
    },
    {
      id: 'preistafel-fair', at: [806, 284], radius: 54, label: 'Preistafel', kind: 'look', when: FAIRER_LOHN,
      lines: [n('Die Tafel ist neu beschrieben: „Ankauf von Kindern: fairer Preis. Fragt Freya.“ Ripper hat das „fair“ dreimal nachgezogen, als müsste er sich selbst überzeugen. Darunter, in Kreide: ein kleines Herz.')],
    },
    {
      id: 'glaeser', at: [380, 286], radius: 54, label: 'Regal mit Einmachgläsern', kind: 'look',
      lines: [n('Einmachgläser voller Augen, die dich alle gleichzeitig ansehen. Eines zwinkert. Du hoffst, es war ein Wackelkontakt.')],
    },
    {
      id: 'kuehlschrank', at: [730, 280], radius: 50, label: 'Kühlschrank', kind: 'look',
      lines: [
        n('Im Kühlschrank: Nervengel, Synth-Blut, ein Glas Gurken und ein Joghurt mit dem Etikett „NICHT ESSEN – PROBE“.'),
        n('Der Joghurt ist halb leer.'),
      ],
    },
    {
      id: 'anatomie-tafel', at: [576, 284], radius: 54, label: 'Anatomie-Tafel', kind: 'look',
      lines: [n('Eine vergilbte Tafel: Auge, Hand, Wirbelsäule, alles aus Chrom. Jemand hat dem Skelett mit Kugelschreiber einen Schnurrbart und ein Monokel gemalt. Es sieht jetzt aus wie ein reicher Onkel aus der Oberstadt.')],
    },
    {
      id: 'wartebank-comics', at: [190, 566], radius: 58, label: 'Comics auf der Wartebank', kind: 'look',
      lines: [n('Zerlesene Comics: „Captain Chrom gegen die Schrottkönigin“, Heft 12 bis 14. In Heft 13 hat ein Kind alle Bösewichte durchgestrichen und „RIPPER“ danebengeschrieben.')],
    },
  ],
  lights: [
    { at: [524, 250], radius: 230, color: '#9fffd8', intensity: 0.7 },
    { at: [788, 80], radius: 120, color: '#39ff7a', intensity: 0.9 },
    { at: [150, 140], radius: 160, color: '#ff3fa4', intensity: 0.7 },
    { at: [520, 640], radius: 140, color: '#39ff7a', intensity: 0.6 },
    { at: [270, 590], radius: 70, color: '#ffcc66', intensity: 0.7 },
  ],
  ambience: 'innen',
  onEnter: [
    {
      id: 'ripper-praxis-erstbesuch', once: true, dialogue: 'ripper-praxis-ankunft', effects: [{ markSeen: 'ripper-praxis-betreten' }],
    },
  ],
};

export const part: ContentPart = {
  maps: { [ripperPraxis.id]: ripperPraxis },
  dialogues: {
    'ripper-praxis-ankunft': {
      id: 'ripper-praxis-ankunft',
      start: 'a',
      nodes: [
        {
          id: 'a',
          lines: [
            n('Die Glastür bimmelt. Drinnen: kaltes Grünlicht, Desinfektionsmittel, darunter etwas Süßliches, über das man nicht nachdenken will. In der Mitte ein Behandlungsstuhl mit Lederriemen, die schon einiges gehalten haben.'),
            n('Aus den Einmachgläsern an der Wand schauen dich ein Dutzend Augen an. Keins davon blinzelt. Fast keins.'),
          ],
          choices: [
            { text: '„Gemütlich. Wo ist der Folterkeller? Ach, das hier ist er.“' },
            { text: '(Die Hände in den Taschen behalten. Alle zehn Finger zählen.)' },
          ],
        },
      ],
    },
  },
};
