// Händler des Pakets pkg-quantum-campus (design/plan/act23.json „shops“): der Kantinen-Automat im Foyer.
// world.md §3.5 quantum-campus: „Händler: keine (Kantinen-Automat im Foyer, act3)“; im Nachspiel bleibt er stehen.
// Dazu die Offene Werkstatt auf der Campuswiese (Belohnung aus side-offene-werkstatt, Flag `cyberware_oberstadt_gratis`):
// der einzige Schrauber der Oberstadt, Einbau für alle gratis („Fragt Alesa.“). Der Laden-Hotspot hängt per
// mapAdditions an der Campuswiese, neben dem Blick-Hotspot `ow-werkstatt-offen` der Quest.
import type { Condition, ShopDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

/** Werkstatt eröffnet (side-offene-werkstatt erledigt). */
const WERKSTATT_OFFEN: Condition = { flag: 'cyberware_oberstadt_gratis' };
/** Master-Modus: Die Werkstatt hat zu (wie npc-kinder-alte/_dsl.ts `MASTER`). */
const MASTER: Condition = { all: [{ flag: 'master_modus' }, { notFlag: 'ende_doch_noch_meer' }] };

const shops: Record<string, ShopDef> = {
  'quantum-kantine': {
    id: 'quantum-kantine',
    name: 'Kantinen-Automat „QuantumSnack 3000“',
    faction: 'quantum',
    open: { any: [{ act: 3 }, { flag: 'epilog' }] },
    // Ein Automat kauft nichts an. Leere Liste = nimmt nichts.
    buys: [],
    stock: [
      { item: 'synth-kaffee', qty: 12, price: 6 },
      { item: 'algen-chips', qty: 8, price: 7 },
      { item: 'medipflaster', qty: 6, price: 30 },
      { item: 'volt-limo', qty: 6 },
      { item: 'chips-tuete', qty: 6 },
      { item: 'nanogel', qty: 2, when: { flag: 'epilog' } },
      { item: 'nexi-pluesch', qty: 1, when: { flag: 'epilog' } },
    ],
  },
  'offene-werkstatt': {
    id: 'offene-werkstatt',
    name: 'Offene Werkstatt auf der Campuswiese',
    owner: 'alesa-zero',
    open: { all: [WERKSTATT_OFFEN, { time: ['morgen', 'tag', 'abend'] }] },
    // Einbau gratis, für alle: Das ist Alesas Teil (side-offene-werkstatt).
    ripperdoc: { fee: 0, freeWhen: WERKSTATT_OFFEN },
    priceRules: [
      { when: MASTER, refuse: 'Die Stände auf der Campuswiese sind abgedeckt. Auf einer Plane steht mit Lötzinn geschrieben: „Nicht für dich.“' },
      { when: WERKSTATT_OFFEN, note: 'Cyberware-Einbau gratis. Für alle. Fragt Alesa.' },
    ],
    // Werkstattpreise: Opa Gustav, Mira Lötzinn und Pim Pinzette verkaufen zum Selbstkostenpreis.
    stock: [
      { item: 'reparaturset', qty: 4, price: 25 },
      { item: 'schrott-ersatzteil', qty: 15, price: 6 },
      { item: 'nanogel', qty: 3 },
      { item: 'kopf-strassenfunk', qty: 1, price: 520 },
      { item: 'augen-restlicht', qty: 1, price: 480 },
      { item: 'arme-datenbuchse', qty: 1, price: 560 },
      { item: 'nerven-ueberspannungsschutz', qty: 1, price: 640 },
    ],
  },
};

export const part: ContentPart = {
  shops,
  mapAdditions: {
    'quantum-campus': {
      hotspots: [
        { id: 'offene-werkstatt-laden', at: 'campus-wiese', radius: 60, label: 'Offene Werkstatt: Einbau gratis', kind: 'shop', shop: 'offene-werkstatt', when: WERKSTATT_OFFEN },
      ],
    },
  },
};
