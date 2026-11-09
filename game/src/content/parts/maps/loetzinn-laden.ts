// Innenraum Lötzinns Laden (world.md §3.5 Lötgassen, Plan design/plan/act1.json maps.loetzinn-laden).
// Neu-Cyberware, Medizin, Hack-Module, Störgranaten; Kabelrolle (side-strom-fuer-die-rohre), Analog-Prüfer (Akt 2).
// Bild: output/imagegen/raw/maps/loetzinn-laden.png (Variante a, oben/unten auf 4:3 aufgefüllt).
import type { DialogueDef, DialogueLine, MapDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const n = (text: string): DialogueLine => ({ speaker: 'narrator', text });

const ankunft: DialogueDef = {
  id: 'dlg-loetzinn-laden-ankunft',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        n('Sauber. Verdächtig sauber. Nach der Gasse draußen fühlt sich der Boden an wie ein OP-Tisch, und die Luft riecht nach Desinfektion und neuem Plastik.'),
        n('In der Vitrine starren dich sechs Augen an, alle neu, alle teuer. An der Wand ein Schild: „Nur Neuware. Wer nach Gebrauchtem fragt, wird gebraucht.“'),
      ],
    },
  ],
};

const laden: MapDef = {
  id: 'loetzinn-laden',
  name: 'Lötzinns Laden',
  subtitle: 'Lötgassen',
  size: [1024, 768],
  district: 'unterstadt',
  lighting: 'indoor',
  bg: 'bg-loetzinn-laden',
  walk: [[[55, 210], [972, 210], [972, 716], [55, 716]]],
  block: [
    // Theke mit Vitrine
    [[237, 186], [748, 186], [748, 312], [237, 312]],
    // Miras Werkbank
    [[768, 80], [972, 80], [972, 286], [768, 286]],
    // Kabelrolle
    [[75, 282], [202, 282], [202, 435], [75, 435]],
    // Ersatzteilregal links, Messgeräte-Regal rechts
    [[68, 455], [170, 455], [170, 676], [68, 676]],
    [[846, 335], [972, 335], [972, 676], [846, 676]],
    // Auslagetisch mit Prothesen
    [[392, 348], [642, 348], [642, 520], [392, 520]],
    // Glastür (Ausgang davor)
    [[428, 640], [596, 640], [596, 730], [428, 730]],
  ],
  exits: [
    { id: 'nach-loetgassen', rect: [440, 606, 145, 36], to: 'loetgassen', entry: 'von-loetzinn-laden', label: 'Raus in die Lötgassen', interact: true },
  ],
  entries: {
    'von-loetgassen': { at: [512, 580], facing: 'n' },
  },
  spots: {
    theke: { at: [215, 255], facing: 'e' },
    'werkbank-mira': { at: [870, 305], facing: 'n' },
    kabelrolle: { at: [235, 365], facing: 'w' },
  },
  hotspots: [
    { id: 'loetzinn-laden', at: [495, 330], radius: 72, label: 'Lötzinns Laden', kind: 'shop', shop: 'loetzinn-laden' },
    {
      id: 'vitrine-augen', at: [300, 330], radius: 44, label: 'Vitrine', kind: 'look',
      lines: [n('Augen in Pink, Violett, Gold und Eisblau. Eins zwinkert, wenn man vorbeigeht. Das Preisschild darunter zwinkert nicht zurück: 600 Credits.')],
    },
    {
      id: 'auslage-prothesen', at: [515, 540], radius: 56, label: 'Auslage', kind: 'look',
      lines: [n('Zwei Arme, zwei Beine, glänzend wie frisch gewachst. An einem Bein klebt ein Zettel: „Probelaufen nur mit Erlaubnis. Wir meinen dich, Kalle.“')],
    },
    {
      id: 'kabelrolle-ansehen', at: [228, 395], radius: 48, label: 'Kabelrolle', kind: 'look',
      lines: [n('Eine Kabeltrommel, so groß wie ein Kleinwagen, gewickelt mit orangem Starkstromkabel. Reicht vermutlich bis in den Kanal. Und zurück. Und noch mal hin.')],
    },
    {
      id: 'werkbank-mira-ansehen', at: [870, 305], radius: 50, label: 'Miras Werkbank', kind: 'look',
      lines: [n('Ein Roboterarm hält ein künstliches Auge unter die Lupe, als würde er es verhören. Schraubendreher hängen nach Größe sortiert an der Wand. Wer hier etwas verlegt, fliegt raus.')],
    },
    {
      id: 'analog-pruefer', at: [815, 495], radius: 48, label: 'Analog-Prüfer im Regal', kind: 'look',
      when: { not: { all: [{ playerIs: 'vex' }, { act: 2 }] } },
      lines: [
        n('Zwischen den Messgeräten steht ein klobiger Kasten mit zwei Zeigerinstrumenten und Drehknöpfen. Kein Display, kein Netz, kein Chip. Ein Analog-Prüfer. Mira hat ihn mit „Unverkäuflich (fast)“ beschriftet.'),
      ],
    },
    {
      id: 'analog-pruefer-vex', at: [815, 495], radius: 48, label: 'Analog-Prüfer', kind: 'look',
      when: { all: [{ playerIs: 'vex' }, { act: 2 }] },
      lines: [{ speaker: 'player', expr: 'neutral', text: 'Zehn Minuten, übers Dach. Wenn Zöpfe den Code braucht, hol ich ihr das Ding. Und wenn Mira „fast“ sagt, heißt das: Preis verhandelbar.' }],
    },
  ],
  lights: [
    { at: [495, 250], radius: 200, color: '#3ef2ff', intensity: 0.7 },
    { at: [500, 60], radius: 220, color: '#c04bff', intensity: 0.5 },
    { at: [830, 120], radius: 110, color: '#ffffff', intensity: 0.5 },
    { at: [90, 100], radius: 70, color: '#ffc861', intensity: 0.6 },
    { at: [57, 450], radius: 60, color: '#ffc861', intensity: 0.5 },
    { at: [967, 335], radius: 60, color: '#ffc861', intensity: 0.5 },
    { at: [512, 660], radius: 90, color: '#3ef2ff', intensity: 0.5 },
  ],
  ambience: 'innen',
  onEnter: [
    { id: 'loetzinn-laden-erstbesuch', once: true, dialogue: 'dlg-loetzinn-laden-ankunft', effects: [{ markSeen: 'loetzinn-laden-erstbesuch' }] },
  ],
};

export const part: ContentPart = {
  maps: { 'loetzinn-laden': laden },
  dialogues: { [ankunft.id]: ankunft },
};
