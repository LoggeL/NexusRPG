// Dantes Reparaturliste (world.md §6.6, ab Dante ♥2; Tafel-Hotspot in maps/dantes-werkstatt.ts).
// Dante hat repariert, du lieferst aus. Bezahlung vor allem in Herzen: jede Lieferung Dante ♥ +15.
// Am Ziel: einfach abgeben (ohne Check) oder `[Technik 4]` vor Ort nachjustieren (Dante ♥ +10 extra, Kunde zahlt Trinkgeld).
// Der Cyberware-Rabatt aus world.md ist nicht abbildbar (Lücke).
import type { DialogueDef, ItemDef, JobTemplateDef } from '../../../modules/contracts';
import type { JobBoardDef } from '../../../modules/jobs';
import type { ContentPart } from '../../part';
import { type Ziel, fertig, vorlage, zielSpot, zusatz } from './_auftrag';
import { L, N, all, byId, c, chk, cr, dlg, hearts, item, job, node, rel, take } from './_lib';

const DA = 'dante';
const KISTE = 'pj-reparaturkiste';

const liste: JobBoardDef = { name: 'Dantes Reparaturliste', slots: 2, expiresAfterDays: 2, failRep: 0 };

interface Kunde extends Ziel { key: string; geraet: string; bild: string; dank: string; npc?: string }
const KUNDEN: Kunde[] = [
  { key: 'volt', map: 'neon-gasse', spot: 'kiosk', label: 'Oma Volts Kiosk', geraet: 'Kühlschrank-Kompressor', npc: 'oma-volt',
    bild: 'Oma Volts Kühlschrank brummt wie ein Bär mit Bauchweh. Die Blitzbrause ist lauwarm. Die Kundschaft auch.',
    dank: 'Endlich wieder kalt! Sag Dante, er kriegt eine Kiste Blitzbrause. Und einen Kuss. Den Kuss bring ich selbst.' },
  { key: 'gurrmann', map: 'loetgassen', spot: 'taubenschlag', label: 'Opa Gurrmanns Taubenschlag', geraet: 'Rotor für Taubendrohne Hilde', npc: 'opa-gurrmann',
    bild: 'Hilde, die älteste Taubendrohne, sitzt traurig auf der Stange. Ihr linker Rotor ist ein Gummiband.',
    dank: 'Hilde! Sie fliegt! Gurr! Entschuldigung. Gurr.' },
  { key: 'pumpe', map: 'rohrsiedlung', spot: 'hof-mitte', label: 'Rohrsiedlung, Wasserpumpe', geraet: 'Pumpenventil',
    bild: 'Die Gemeinschaftspumpe im Hof hustet braunes Wasser. Zehn Leute stehen mit Eimern davor und gucken dich an wie einen Klempner-Messias.',
    dank: 'Das Wasser läuft klar. Eine alte Frau segnet dich. Ein Kind segnet dich auch, aber mit einer Wasserpistole.' },
  { key: 'stand', map: 'schrottmarkt', spot: 'elektronikstand', label: 'Schrottmarkt, Elektronikstand', geraet: 'Lötstation',
    bild: 'Am Elektronikstand liegt eine Lötstation in Einzelteilen. Der Händler hat versucht, sie selbst zu reparieren. Man sieht es.',
    dank: 'Der Händler gibt dir die Hand. Dann gibt er dir eine Visitenkarte. Darauf steht „Ich schulde Dante was“.' },
];

const kiste: ItemDef = {
  id: KISTE, name: 'Dantes Reparaturkiste', category: 'quest', icon: 'kurierpaket', price: 0, sellable: false,
  description: 'Eine Keksdose voller reparierter Teile, jedes mit einem Zettel in Dantes Schrift: „Vorsicht, heiß“, „Vorsicht, empfindlich“, „Vorsicht, Kuschel hat drauf geschlafen“.',
};

const T: JobTemplateDef[] = KUNDEN.map((k) => vorlage({
  id: `job-reparatur-${k.key}`, kind: 'kurier', title: `Reparatur: ${k.geraet}`,
  text: `Dante hat das ${k.geraet} fertig. Bring es zu {ziel} und bau es ein. Er zahlt in Keksen und Dankbarkeit, der Kunde in {credits} Cr.`,
  boards: ['dantes-reparaturliste'], when: hearts(DA, 2), targets: [{ map: k.map, label: k.label }], item: KISTE,
  reward: { credits: [20, 40], xp: 30 },
}));

const lieferung = (k: Kunde, i: number): DialogueDef => {
  const J = `job-reparatur-${k.key}`;
  const basis = [take(KISTE), fertig(J), rel(DA, 15)];
  return dlg(`pj-reparatur-${k.key}`, [
    node('start', [N(k.bild)], {
      choices: [
        c(`Das ${k.geraet} einbauen und vor Ort noch mal sauber justieren.`, 'gut', { check: chk(`reparatur-${k.key}`, 'technik', 4, ['reparieren']), effects: [...basis, rel(DA, 10), cr(10)] }),
        c(`Das ${k.geraet} einbauen, wie Dante es auf den Zettel geschrieben hat.`, 'ok', { effects: basis }),
        c('Später.'),
      ],
    }),
    node('gut', [N('Es läuft besser als neu. Der Kunde drückt dir ein Trinkgeld in die Hand.'), k.npc ? L(k.npc, k.dank, 'freude') : N(k.dank)], { next: 'dante' }),
    node('ok', [N('Es läuft. Es klappert ein bisschen, aber es läuft.'), k.npc ? L(k.npc, k.dank, 'freude') : N(k.dank)], { next: 'dante' }),
    node('dante', [N(`Auf deinem Kommunikator eine Nachricht von Dante: „Hab’s gehört! Du bist die Beste. Oder der Beste. Keks liegt bereit.“`)]),
  ]);
};

export const part: ContentPart = {
  items: byId(kiste),
  jobs: byId(...T),
  jobBoards: { 'dantes-reparaturliste': liste },
  dialogues: byId(...KUNDEN.map(lieferung)),
  mapAdditions: zusatz(KUNDEN.map((k) => zielSpot(`pj-reparatur-${k.key}`, k, `Reparatur: ${k.geraet}`, `pj-reparatur-${k.key}`,
    all(job(`job-reparatur-${k.key}`), item(KISTE)), -40, 30))),
};
