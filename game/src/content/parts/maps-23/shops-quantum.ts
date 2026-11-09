// Händler des Pakets pkg-quantum-campus (design/plan/act23.json „shops“): der Kantinen-Automat im Foyer.
// world.md §3.5 quantum-campus: „Händler: keine (Kantinen-Automat im Foyer, act3)“; im Nachspiel bleibt er stehen.
import type { ShopDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

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
};

export const part: ContentPart = { shops };
