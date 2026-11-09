// Innenraum „Gerichtssaal“ (world.md §3.5 Eisenhof, ID-Plan design/plan/act1.json · pkg-eisenhof).
// Bagatellgericht mittwochs 10–14 Uhr, Kopfgeld-Schalter, Zuschauerbänke. Tür zum Hof nur tagsüber offen (Eisenhof-Seite).
// Koordinaten in Kartenpixeln (1024×768), am fertigen Bild bg-gerichtssaal nachgezogen.
import type { Condition, DialogueDef, MapDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const N = 'narrator' as const;
const R = 'richter' as const;

/** Bagatellgericht: Mittwoch 10–14 Uhr (world.md §10.6). */
const bagatellZeit: Condition = { all: [{ weekday: 'mi' }, { clockBetween: [600, 840] }] };

const map: MapDef = {
  id: 'gerichtssaal',
  name: 'Gerichtssaal',
  subtitle: 'Eisenhof · Bagatellgericht',
  size: [1024, 768],
  district: 'mittelring',
  lighting: 'indoor',
  bg: 'bg-gerichtssaal',
  music: 'gefaengnis',
  ambience: 'innen',
  walk: [
    [[15, 312], [285, 312], [285, 272], [739, 272], [739, 312], [1010, 312], [1010, 634], [15, 634]],
  ],
  block: [
    [[337, 176], [686, 176], [686, 272], [337, 272]], // Richterbank
    [[30, 356], [382, 356], [382, 578], [30, 578]], // Bänke links
    [[641, 356], [1000, 356], [1000, 578], [641, 578]], // Bänke rechts
    [[992, 296], [1024, 296], [1024, 336], [992, 336]], // Wischeimer
  ],
  exits: [
    { id: 'nach-eisenhof', rect: [496, 616, 80, 30], to: 'eisenhof', entry: 'von-gerichtssaal', label: 'Raus in den Hof' },
  ],
  entries: {
    'von-eisenhof': { at: [536, 596], facing: 'n' },
  },
  spots: {
    richterbank: { at: [512, 238], facing: 's' },
    zeugenstand: { at: [187, 300], facing: 's' },
    zuschauerbaenke: { at: [356, 430], facing: 'e' }, // Bankende am Mittelgang (ansprechbar)
    'zuschauerbaenke-rechts': { at: [668, 430], facing: 'w' },
    saalwache: { at: [640, 600], facing: 'w' },
    'kopfgeld-abgabe': { at: [870, 330], facing: 'n' },
  },
  hotspots: [
    {
      id: 'bagatellgericht', at: [512, 300], label: 'Bagatellgericht (Mi 10–14 Uhr)', kind: 'use', radius: 64,
      when: bagatellZeit, dialogue: 'gerichtssaal-bagatellgericht',
    },
    {
      id: 'richterbank-ansehen', at: [512, 300], label: 'Richterbank', kind: 'look', radius: 64, when: { not: bagatellZeit },
      lines: [
        { speaker: N, text: 'Die Richterbank. Ein Hammer, ein Aktenstapel und eine Gurkenpflanze im Topf, die besser gepflegt ist als jeder Angeklagte.' },
        { speaker: N, text: 'Ein Zettel am Pult: „Bagatellgericht mittwochs 10 bis 14 Uhr. Zuschauer willkommen. Zwischenrufer verurteilt.“' },
      ],
    },
    { id: 'kopfgeld-abgabe', at: [870, 312], label: 'Kopfgeld-Schalter', kind: 'use', dialogue: 'gerichtssaal-kopfgeld' },
    {
      id: 'zeugenstand-ansehen', at: [200, 318], label: 'Zeugenstand', kind: 'look',
      lines: [{ speaker: N, text: 'Der Zeugenstand. Das Mikro riecht nach Angstschweiß und Pfefferminz. Wer hier lügt, lügt laut.' }],
    },
    {
      id: 'zuschauerbaenke-ansehen', at: [440, 470], label: 'Zuschauerbank', kind: 'look',
      lines: [{ speaker: N, text: 'In die Bank geritzt: ein Herz, ein Totenkopf und „Richter = Lauch“. Darunter, frisch und ordentlich: „Schuldig!“' }],
    },
    {
      id: 'wasserspender', at: [60, 318], label: 'Wasserspender', kind: 'look',
      lines: [{ speaker: N, text: 'Ein Schluck Gerichtswasser. Schmeckt nach Chlor und Paragraphen. Die Pflanze daneben hat aufgegeben, aber würdevoll.' }],
    },
    {
      id: 'garderobe', at: [300, 625], label: 'Garderobe', kind: 'look',
      lines: [{ speaker: N, text: 'An der Garderobe hängt ein Hut von 2061 mit einem Zettel: „Fundsache – wartet auf Besitzer oder Urteil“.' }],
    },
  ],
  foreground: [
    { rect: [330, 176, 362, 96], baseY: 272 }, // Richterbank verdeckt den Richter bis zur Hüfte
  ],
  lights: [
    { at: [510, 70], radius: 160, color: '#7fd8ff', intensity: 0.6 }, // Rundfenster mit Waage
    { at: [384, 186], radius: 90, color: '#9dff6a', intensity: 0.6 }, // grüne Bankerlampe
    { at: [870, 170], radius: 110, color: '#ffd27a', intensity: 0.5 },
    { at: [360, 620], radius: 80, color: '#ffc46b', intensity: 0.5 },
    { at: [650, 620], radius: 80, color: '#ffc46b', intensity: 0.5 },
  ],
  ambient: {
    count: 2,
    sprites: ['passant-anzug-walk', 'passant-oma-walk', 'passant-arbeiterin-walk'],
    routes: [
      [[536, 600], [520, 450], [520, 330], [300, 330]],
      [[536, 600], [800, 610], [880, 330]],
    ],
    bySlot: { morgen: 1, tag: 3, abend: 0, nacht: 0 },
    barks: [
      { text: 'Ich bin nur wegen der Klimaanlage hier.' },
      { text: 'Psst! Der Richter guckt. Der guckt immer.' },
      { text: 'Der Toaster war’s nicht. Ich kenn den. Der ist ganz lieb.', when: { weekday: 'mi' } },
      { text: 'Mein Anwalt kommt gleich. Er steckt im Drehkreuz fest.' },
    ],
  },
  onEnter: [
    {
      id: 'gerichtssaal-ankunft', once: true,
      effects: [
        { message: 'Der Gerichtssaal: Holz, Hall und Bohnerwachs. Hier wird über Toaster, Tauben und Taschendiebe gerichtet. Mittwochs öffentlich.' },
        { markSeen: 'gerichtssaal-ankunft' },
      ],
    },
  ],
};

const bagatell: DialogueDef = {
  id: 'gerichtssaal-bagatellgericht',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        { speaker: R, text: 'Ruhe im Saal! Bagatellgericht, Sitzung eröffnet. Wer hustet, zahlt fünf Credits.' },
        { speaker: N, text: 'Auf der Anklagebank: eine Oma mit Einkaufswagen, ein Typ, der behauptet, sein Schatten sei schuld, und ein Toaster.' },
      ],
      choices: [
        { text: 'Fall 1: Die Oma und der Einkaufswagen.', next: 'oma', once: true, id: 'fall-oma' },
        { text: 'Fall 2: Der Mann und sein Schatten.', next: 'schatten', once: true, id: 'fall-schatten' },
        { text: 'Nur zuschauen und an Popcorn denken.', next: 'zuschauen' },
        { text: 'Raus hier, bevor ich noch als Zeuge geladen werde.' },
      ],
    },
    {
      id: 'oma',
      lines: [
        { speaker: R, text: 'Frau Kowalski. Ihnen wird vorgeworfen, mit einem Einkaufswagen eine Quantum-Werbedrohne vom Himmel geholt zu haben.' },
        { speaker: N, text: 'Die Oma zeigt mit dem Krückstock direkt auf dich. Du warst gestern am Bahnhof. Das weiß jetzt auch der Richter.' },
        { speaker: R, text: 'Sie da! Zeuge! Was haben Sie gesehen? Und denken Sie dran: Ich rieche Meineid drei Meilen gegen den Wind.' },
      ],
      choices: [
        { text: 'Die Wahrheit: Die Drohne hat zuerst geschubst.', next: 'oma-wahr' },
        {
          text: 'Eine flammende Rede über die Würde des Einkaufswagens.', next: 'oma-rede',
          check: { id: 'gerichtssaal-zeuge-oma', attribute: 'ausstrahlung', threshold: 5, tags: ['ueberreden', 'buehne'] },
        },
        { text: 'Lügen: Die Oma hat gezielt. Wie ein Profi.', next: 'oma-luege' },
      ],
    },
    {
      id: 'oma-wahr',
      lines: [
        { speaker: R, text: 'Notwehr gegen fliegende Werbung. Freispruch! Die Drohne trägt die Kosten. Wer auch immer ihr Geld verwaltet.' },
        { speaker: N, text: 'Die Oma zwinkert dir zu und fährt mit dem Einkaufswagen über den Fuß des Staatsanwalts. Absichtlich.' },
      ],
      effects: [{ relation: 'richter', delta: 15 }, { rep: 'ordnungsdienst', delta: 2 }, { xp: 20 }],
      next: 'start',
    },
    {
      id: 'oma-rede',
      lines: [
        { speaker: 'player', text: 'Euer Ehren, dieser Wagen hat mehr Treue bewiesen als jeder Mann in dieser Stadt. Vier Räder, keine Lügen. Und als der Himmel ihr Werbung ins Gesicht spuckte, hat er zurückgespuckt!' },
        { speaker: R, text: '… Ich bin gerührt. Das passiert mir sonst nur bei Schlagern. Freispruch! Und jemand bringe dem Wagen ein Öltuch.' },
      ],
      effects: [{ relation: 'richter', delta: 25 }, { rep: 'unterstadt', delta: 2 }, { xp: 30 }],
      next: 'start',
    },
    {
      id: 'oma-luege',
      lines: [
        { speaker: R, text: 'Meineid. Ich wusste es. Zehn Credits Ordnungsgeld, Sie halbgare Witzfigur.' },
        { speaker: N, text: 'Die Oma schaut dich an, als hätte sie gerade dein Gesicht für später gespeichert. Hat sie.' },
      ],
      effects: [{ relation: 'richter', delta: -10 }, { credits: -10 }],
      next: 'start',
    },
    {
      id: 'schatten',
      lines: [
        { speaker: R, text: 'Herr Lumpke. Sie haben einen Gartenzwerg entführt. Sie behaupten, Ihr Schatten habe Sie angestiftet.' },
        { speaker: N, text: 'Lumpke, verzweifelt: „Er ist immer hinter mir, Euer Ehren! Immer!“ Der Richter sieht dich an. Irgendwer muss ja aussagen.' },
      ],
      choices: [
        {
          text: '„Den Zwerg hab ich gestern bei Wett-Willi gesehen. Als Wetteinsatz.“', next: 'schatten-strasse',
          check: { id: 'gerichtssaal-zeuge-schatten', attribute: 'strasse', threshold: 4, tags: ['geruecht'] },
        },
        { text: '„Ich kenne den Schatten. Der war schon immer ein dunkler Typ.“', next: 'schatten-witz' },
        { text: 'Mit den Schultern zucken und schweigen.', next: 'schatten-schweigen' },
      ],
    },
    {
      id: 'schatten-strasse',
      lines: [
        { speaker: R, text: 'Ein Hehlerring für Gartenzwerge! Ich hab es immer gewusst. Lumpke, Sie sind frei. Wett-Willi kriegt Post.' },
        { speaker: N, text: 'Lumpke umarmt dich. Sein Schatten auch, gefühlt.' },
      ],
      effects: [{ relation: 'richter', delta: 20 }, { rep: 'ordnungsdienst', delta: 3 }, { xp: 25 }],
      next: 'start',
    },
    {
      id: 'schatten-witz',
      lines: [
        { speaker: N, text: 'Im Saal kichert jemand. Der Richter haut mit dem Hammer auf die Bank. Dann lacht er auch. Kurz. Ein Geräusch wie ein rostiges Scharnier.' },
        { speaker: R, text: 'Schuldig. Beide. Der Schatten kriegt Bewährung.' },
      ],
      effects: [{ relation: 'richter', delta: 5 }],
      next: 'start',
    },
    {
      id: 'schatten-schweigen',
      lines: [{ speaker: R, text: 'Schuldig! Fünf Stunden Gartenarbeit. Bei mir. Und bringen Sie den Zwerg mit, der kriegt ein Beet.' }],
      next: 'start',
    },
    {
      id: 'zuschauen',
      lines: [
        { speaker: N, text: 'Der Toaster wird freigesprochen: Niemand kann beweisen, dass er die Wohnung mit Absicht abgefackelt hat.' },
        { speaker: N, text: 'Zur Feier toastet er eine Scheibe. Der Saal applaudiert. Der Richter isst sie. Rechtsstaat.' },
      ],
    },
  ],
};

const kopfgeld: DialogueDef = {
  id: 'gerichtssaal-kopfgeld',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [{ speaker: N, text: 'Am Schalter: ein Kopfgeld-Terminal, eine Messingklingel und ein Piktogramm aus Handschellen und Daumen hoch. Abliefern, abkassieren, abhauen.' }],
      choices: [
        {
          text: 'Kopfgeld abliefern.', next: 'abgeliefert',
          when: { all: [{ job: 'job-kopfgeld' }, { flag: 'kopfgeld_gestellt' }] },
          effects: [{ completeJob: 'job-kopfgeld' }, { setFlag: 'kopfgeld_gestellt', value: false }],
        },
        { text: 'Kopfgeld abliefern.', next: 'leer', when: { all: [{ job: 'job-kopfgeld' }, { notFlag: 'kopfgeld_gestellt' }] } },
        { text: 'Klingel drücken.', next: 'klingel' },
        { text: 'Gehen.' },
      ],
    },
    {
      id: 'abgeliefert',
      lines: [{ speaker: N, text: 'Stempel, Unterschrift, Klingel. Das Terminal spuckt einen Beleg aus: „Die Gesellschaft dankt. Die Gesellschaft zahlt. Die Gesellschaft will nichts davon wissen.“' }],
    },
    {
      id: 'leer',
      lines: [{ speaker: N, text: 'Das Terminal scannt dich. „Kein Gefangener erkannt. Bitte Ziel stellen und mitbringen. Leere Hände werden nicht ausgezahlt, Arschloch.“ Das letzte Wort war vermutlich nicht offiziell.' }],
    },
    {
      id: 'klingel',
      lines: [
        { speaker: N, text: 'Ding. Nichts. Ding. Ding. Ding.' },
        { speaker: N, text: 'Aus dem Hinterzimmer: „JA, VERDAMMT, ICH KOMM JA!“ Es kommt niemand.' },
      ],
    },
  ],
};

export const part: ContentPart = {
  maps: { gerichtssaal: map },
  dialogues: { [bagatell.id]: bagatell, [kopfgeld.id]: kopfgeld },
};
