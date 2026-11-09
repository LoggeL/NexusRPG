// Akt 2/3 und Nachspiel: verstärkte Begleiter-Fähigkeiten für Vega, Nyra und Jimmy (über `abilityRules`/`duo` in den
// Figurendateien) und der Talisman „Große Ohren“ aus he-captain-kuschel-10 (world.md §4.2; kein Eintrag in §9).
// Die Engine skaliert Begleiterwerte nicht mit der Stufe (Lücke notiert in design/plan/gaps/npc-crew-b.md); die
// Steigerung läuft deshalb über Fähigkeiten, die an Herz-Ereignisse und den Akt-Fortschritt gebunden sind.
import type { ContentPart } from '../../part';
import type { AbilityDef, ItemDef } from '../../../modules/contracts';

const abilities: AbilityDef[] = [
  {
    id: 'duo-die-wachhunde-plus', name: 'Die Wachhunde (Doppelschuss)',
    description: 'Seit dem Dachgarten: Vega schießt zweimal, Aria schlägt einmal. Das Ziel geht für zwei Runden zu Boden (Betäubt).',
    kind: 'fernkampf', ap: 2, target: 'enemy', range: 6, damage: 5, hit: 20, status: { id: 'betaeubt', turns: 2 }, cooldown: 3,
  },
  {
    id: 'nyra-zentrator-umkehr-plus', name: 'Zentrator-Umkehr (von innen)',
    description: 'Nyra kennt Quantums Steuerlogik jetzt von innen. Sie dreht einer Drohne und allem daneben den Zentrator um (Gehackt, 2 Runden).',
    kind: 'hack', ap: 2, target: 'area', range: 6, radius: 1, attribute: 'technik', status: { id: 'gehackt', turns: 2, chance: 0.85 }, cooldown: 3,
  },
  {
    id: 'jimmy-ersatzmann-plus', name: 'Ersatzmann (Stammspieler)',
    description: '„Ich übernehm! Und zwar richtig!“ Jimmy wirft sich vor einen Verbündeten in drei Feldern (Geschützt, 2 Runden).',
    kind: 'support', ap: 1, target: 'ally', range: 3, status: { id: 'geschuetzt', turns: 2 }, cooldown: 2,
  },
];

const talisman: ItemDef = {
  id: 'talisman-grosse-ohren', name: 'Talisman „Große Ohren“', category: 'geschenk', icon: 'talisman-grosse-ohren',
  price: 0, sellable: false, giftTags: ['andenken'],
  description: 'Ein winziger Anhänger aus Plüschstoff in Form zweier sehr großer Ohren, geknotet aus dem Faden von Captain Kuschels alter Naht. +1 Ausstrahlung, wenn jemand traurig ist; +1 beim Entdecken von Verstecktem.',
  checkBonus: [
    { attribute: 'ausstrahlung', tags: ['trost'], value: 1, label: 'Große Ohren' },
    { tags: ['beobachten', 'verstecke'], value: 1, label: 'Große Ohren' },
  ],
  inspect: 'Auf der Rückseite, mit Kugelschreiber, sehr klein: „– C. K.“',
};

export const part: ContentPart = {
  abilities: Object.fromEntries(abilities.map((a) => [a.id, a])),
  items: { [talisman.id]: talisman },
};
