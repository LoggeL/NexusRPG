// Passantensprüche Akt 2, Akt 3, Nachspiel und Master-Modus (world.md §10.4) auf den Straßenkarten der Unterstadt und
// des Mittelrings. Hängt an `ambient.barks` der fremden Karten (MapAddition.barks); Karten ohne Passanten bleiben still.
import type { AmbientDef, Condition } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import { FREI, MASTER, NUR_AKT2, NUR_AKT3 } from './_w23';

type Bark = NonNullable<AmbientDef['barks']>[number];
const b = (when: Condition, ...texts: string[]): Bark[] => texts.map((text) => ({ text, when }));

const FAHNDUNG: Condition = { all: [NUR_AKT2, { flag: 'fahndung_2' }] };

/** Unterstadt: Drohnen, Gratis-Chips, Weißhelme – und später die Ruhe danach. */
const UNTERSTADT: Bark[] = [
  ...b(NUR_AKT2,
    'Die Drohne da oben hat mir zugezwinkert. Drohnen zwinkern nicht.',
    'Gratis-Chip? Meine Oma sagt, gratis gibt’s nur Ärger und Schnupfen.',
    'Seit dem Einbruch beim Campus stehen hier dauernd Weißhelme rum. Ich hab Hunter gesehen. Er hat gegrinst.',
    'Mein Nachbar trägt jetzt Chrome 10. Er grüßt mich jeden Morgen. Mit Namen. Den ich ihm nie gesagt hab.',
    'Wenn noch eine Quantum-Drohne über meinen Balkon brummt, hol ich sie mit dem Besen runter. Scheiß auf die Garantie.'),
  ...b(FAHNDUNG, 'Psst. Du siehst aus wie die Kartoffel aus den Nachrichten.', 'Bist du nicht die Fresse vom Phantombild? Keine Sorge. Ich hab nix gesehen. Ich seh nie was.'),
  ...b(NUR_AKT3, 'Heute Nacht feiern die da oben ihre Party. Wir hier unten feiern, dass das Licht noch geht.'),
  ...b(FREI,
    'Ich hab heute „Nein“ gesagt. Einfach so. Zum Bäcker.',
    'Der Bus ans Meer hupt jeden Morgen um sechs. Ich steh jetzt freiwillig auf.',
    'Kein Werbebildschirm mehr. Ich weiß gar nicht, wohin ich jetzt gucken soll. Vielleicht zu dir?'),
  ...b(MASTER, 'Guten Tag, Master.', 'Alles ist gut, Master.', 'Wir lächeln, Master. Sehen Sie? Wir lächeln.'),
];

/** Mittelring: Pendler, Brunnen-Chips, Ordnung. */
const MITTELRING: Bark[] = [
  ...b(NUR_AKT2,
    'Dienstag und Donnerstag gibt’s Chips am Brunnen. Ich hab drei. Ich weiß nicht mehr, wofür.',
    'Seit ich den Chip hab, komm ich nie mehr zu spät. Ich weiß nur nicht mehr, wohin ich eigentlich wollte.'),
  ...b(FAHNDUNG, 'Die Ordnungshüter suchen jemanden mit genau deiner Frisur. Mutige Frisur übrigens.'),
  ...b(FREI, 'Meine Chefin hat heute gefragt, wie es mir geht. Und dann zugehört. Unheimlich.'),
  ...b(MASTER, 'Der Master sieht alles. Der Master ist gut. Bitte gehen Sie weiter, Master.'),
];

const UNTERSTADT_KARTEN = ['neon-gasse', 'schrottmarkt', 'rohrsiedlung', 'loetgassen', 'hafenkante', 'bahnhof-mitte'];
const MITTELRING_KARTEN = ['stufenplatz', 'glasarkaden', 'eisenhof'];

export const part: ContentPart = {
  mapAdditions: Object.fromEntries([
    ...UNTERSTADT_KARTEN.map((map) => [map, { barks: UNTERSTADT }] as const),
    ...MITTELRING_KARTEN.map((map) => [map, { barks: MITTELRING }] as const),
  ]),
};
