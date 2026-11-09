// Händler des Pakets pkg-oednis-hof (design/plan/act23.json „shops“; world.md §3.5 aussiedlerhof/glasduenen, §9).
// hofladen: Aussiedlerhof, M/T, Fraktion aussiedler (Ruf senkt Preise über die Rufstufen). Bei Rivalität mit Marla zu.
// glaswerkstatt: Glasdünen, T/A, die Glasbläserin. Glasperlen (Ablenkung in side-glasherz), Glasherz erst nach der Quest.
import type { Condition, ItemDef, ShopDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

/** Hofladen: Morgen und Tag (world.md §3.8 „Läden: Hofladen“ morgens), nicht bei Marla-Rivalität (§4 „Hofladen geschlossen“). */
export const HOFLADEN_OFFEN: Condition = { all: [{ time: ['morgen', 'tag'] }, { not: { rival: 'marla-sand' } }] };
/** Glaswerkstatt: Tag und Abend. */
export const GLASWERKSTATT_OFFEN: Condition = { time: ['tag', 'abend'] };

const glasherzFertig: Condition = { quest: 'side-glasherz', state: 'done' };

const shops: Record<string, ShopDef> = {
  hofladen: {
    id: 'hofladen', name: 'Hofladen am Aussiedlerhof', faction: 'aussiedler', open: HOFLADEN_OFFEN,
    stock: [
      { item: 'hofhonig', qty: 4 },
      { item: 'frisches-gemuese', qty: 6 },
      { item: 'echtobst-apfel', qty: 4 },
      { item: 'kaktusfrucht', qty: 5 },
      { item: 'samenbombe', qty: 6 },
      { item: 'blumensamen', qty: 3 },
      { item: 'wasserfilter', qty: 2 },
      { item: 'bolzer', qty: 1 },
      { item: 'staubmaske', qty: 2 },
      // Nachspiel: Serenitys Garten liefert mit.
      { item: 'blumensamen', qty: 3, price: 10, when: { flag: 'epilog' } },
    ],
  },
  glaswerkstatt: {
    id: 'glaswerkstatt', name: 'Glaswerkstatt', owner: 'glasblaeserin', faction: 'aussiedler', open: GLASWERKSTATT_OFFEN,
    stock: [
      { item: 'muschel-glas', qty: 2 },
      { item: 'glasperlen', qty: 5 },
      { item: 'sandflasche', qty: 3 },
      { item: 'wuestenrose', qty: 1 },
      { item: 'glasherz', qty: 1, price: 220, when: glasherzFertig },
    ],
  },
};

/** world.md nennt „Glasperlen“ nur als Ware (§3.5) und Ablenkung (side-glasherz); kein eigener Eintrag in §9. */
const items: Record<string, ItemDef> = {
  glasperlen: {
    id: 'glasperlen', name: 'Glasperlen', category: 'geschenk', icon: 'glasperlen', price: 25,
    giftTags: ['kunst', 'schmuck', 'kitsch', 'oednis'],
    description: 'Eine Handvoll bunter Glasperlen aus dem Ofen der Glasbläserin. Funkeln wie ein Clubboden. Glasskorpione werden bei so was schwach, Elstern auch.',
  },
};

export const part: ContentPart = { shops, items };
