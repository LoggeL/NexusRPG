// Cyberware-Teile (world.md §2.6, §9.2) als CyberwareDef samt ihren Kampffähigkeiten. Gegenstand und Teil tragen
// dieselbe ID (items-cyberware.ts). Einbaugebühr kommt von der Werkstatt (`ShopDef.ripperdoc.fee`: Dante 50, ab
// Dante ♥2 gratis; Ripper 100; Mira Lötzinn 80). Stichwörter nach dem Vokabular in system/checks.ts.
// Regeln ohne Engine-Stütze laufen als `traits` (Abfrage über hasTrait) und stehen in design/plan/gaps/system.md.
import type { AbilityDef, CyberwareDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const cy = (def: Omit<CyberwareDef, 'item'>): CyberwareDef => ({ item: def.id, ...def });

const list: CyberwareDef[] = [
  // --- Kopf ------------------------------------------------------------------------------------------------
  cy({
    id: 'kopf-merkchip-alt', name: 'Merkchip (alt)', slot: 'kopf',
    description: 'Gehörte Gerüchte bleiben auf der Karte markiert. +1 Straße bei Gerüchte-Checks.',
    checkBonus: [{ attribute: 'strasse', tags: ['geruecht'], value: 1, label: 'Merkchip' }], traits: ['geruechte-markieren'],
  }),
  cy({
    id: 'kopf-strassenfunk', name: 'Straßenfunk', slot: 'kopf',
    description: 'Begleiter kommen per Telefon sofort. Im Kampf +1 Initiative.',
    callMinutes: 0, combat: { initiative: 1 }, traits: ['party-initiative-1'],
  }),
  cy({
    id: 'kopf-ruhepol', name: 'Ruhepol', slot: 'kopf',
    description: 'Immun gegen „Verunsichert“. Fähigkeit „Durchatmen“: einmal pro Kampf tief Luft holen und eine Runde „Geschützt“ stehen.',
    ability: 'cyber-durchatmen', traits: ['immun-verunsichert', 'betaeubt-abschuetteln-1'],
  }),
  cy({
    id: 'kopf-fx-60', name: 'FX-60-Modul', slot: 'kopf',
    description: '+1 Technik bei Hacks, +1 Bandbreite. Fähigkeit „Papierstau“: Ziel „Gehackt“.',
    checkBonus: [{ attribute: 'technik', tags: ['hacken'], value: 1, label: 'FX-60' }], combat: { bandwidth: 1 }, ability: 'cyber-papierstau',
  }),
  cy({
    id: 'kopf-neuro-uplink', name: 'Neuro-Uplink', slot: 'kopf',
    description: '+2 Bandbreite. Fähigkeit „Drohnenflüstern“: eine Drohne hängt zwei Runden in deiner Schleife.',
    combat: { bandwidth: 2 }, ability: 'cyber-drohnenfluestern',
  }),
  cy({
    id: 'kopf-nexus-splitter', name: 'Nexus-Splitter', slot: 'kopf',
    description: '+1 auf alle Technik-Checks. Der stärkste Gegner ist zu Kampfbeginn „Markiert“.',
    checkBonus: [{ attribute: 'technik', value: 1, label: 'Nexus-Splitter' }], traits: ['kampfbeginn-staerksten-markieren'],
  }),

  // --- Augen -----------------------------------------------------------------------------------------------
  cy({
    id: 'augen-preisscanner', name: 'Preisscanner', slot: 'augen',
    description: 'Händler −5 %. Nach dem ersten Geschenk an eine Figur siehst du ihre Vorlieben.',
    shopDiscount: 5, traits: ['geschenk-vorliebe-zeigen'],
  }),
  cy({
    id: 'augen-restlicht', name: 'Restlicht-Linsen', slot: 'augen',
    description: 'Licht unter Tage. Gegnerische Sichtkegel nachts sichtbar. +1 bei Beobachten-Checks.',
    checkBonus: [{ tags: ['beobachten'], value: 1, label: 'Restlicht-Linsen' }], traits: ['licht-unter-tage', 'sichtkegel-nachts'],
  }),
  cy({
    id: 'augen-adlerblick', name: 'Adlerblick', slot: 'augen',
    description: '+1 Reflexe im Fernkampf (+5 Treffer). Fähigkeit „Zielen“: das Ziel ist „Markiert“, der nächste Schuss trifft besser.',
    checkBonus: [{ attribute: 'reflexe', tags: ['fernkampf'], value: 1, label: 'Adlerblick' }], combat: { hit: 5 }, ability: 'cyber-zielen',
  }),

  // --- Arme ------------------------------------------------------------------------------------------------
  cy({
    id: 'arme-datenbuchse', name: 'Datenbuchse', slot: 'arme',
    description: '+1 Technik bei Terminal-Checks. Konsolen im Kampf kosten 0 AP, beim Leitungs-Hack +1 Zug.',
    checkBonus: [{ attribute: 'technik', tags: ['terminal'], value: 1, label: 'Datenbuchse' }], traits: ['konsole-0ap', 'hacken-plus-1-zug'],
  }),
  cy({
    id: 'arme-greifhaken', name: 'Greifhaken', slot: 'arme',
    description: 'Lücken überwinden, +1 Körper bei Welt-Checks. Fähigkeit „Heranziehen“: Ziel aus der Deckung reißen.',
    checkBonus: [{ attribute: 'koerper', tags: ['welt'], value: 1, label: 'Greifhaken' }], traits: ['luecken-ueberwinden'], ability: 'cyber-heranziehen',
  }),
  cy({
    id: 'arme-zerberster-3000', name: 'Zerberster 3000', slot: 'arme',
    description: '+2 Schaden im Nahkampf. Fähigkeit „Zerbersten“: 10–14 Schaden, zerstört Deckung. Nur Aria trägt ihn.',
    combat: { damage: 2 }, ability: 'aria-zerbersten',
  }),
  cy({
    id: 'arme-zerberster-attrappe', name: '„Zerberster“ (Toaster)', slot: 'arme',
    description: 'Kein Passivbonus. Fähigkeit „Toast“: +5 LP, der Duft lenkt Ratten ab.',
    ability: 'cyber-toast',
  }),
  cy({
    id: 'arme-venomkralle', name: 'Venomkralle', slot: 'arme',
    description: '+1 Nahkampfschaden. Fähigkeit „Giftkralle“: Treffer lässt Funken sprühen („Angeschlagen“).',
    combat: { damage: 1 }, ability: 'cyber-giftkralle',
  }),
  cy({
    id: 'arme-zuendholz-kern', name: 'Zündholz-Kern', slot: 'arme',
    description: 'Nahkampftreffer setzen in Brand. Fähigkeit „Funkenhand“: Flammenkegel über drei Felder, „Brennt“.',
    ability: 'cyber-funkenhand', traits: ['nahkampf-brennt'],
  }),

  // --- Beine -----------------------------------------------------------------------------------------------
  cy({
    id: 'beine-laeuferservos', name: 'Läuferservos', slot: 'beine',
    description: '+2 Initiative, +10 % Lauftempo. Fähigkeit „Sprint“: einmal pro Kampf losrennen, schwer zu treffen.',
    combat: { initiative: 2 }, ability: 'cyber-sprint', traits: ['lauftempo-10'],
  }),
  cy({
    id: 'beine-sprungfedern', name: 'Sprungfedern', slot: 'beine',
    description: '+1 Bewegung, Lücken überwinden. +1 bei Sprung- und Kletter-Checks.',
    combat: { move: 1 }, checkBonus: [{ tags: ['springen', 'klettern'], value: 1, label: 'Sprungfedern' }], traits: ['luecken-ueberwinden', 'satz-erhoeht'],
  }),

  // --- Nervensystem ----------------------------------------------------------------------------------------
  cy({
    id: 'nerven-reflexbooster', name: 'Reflexbooster', slot: 'nervensystem',
    description: '+1 Reflexe. Einmal pro Kampf +1 AP.',
    attributes: { reflexe: 1 }, traits: ['kampf-extra-ap-1'],
  }),
  cy({
    id: 'nerven-ueberspannungsschutz', name: 'Überspannungsschutz', slot: 'nervensystem',
    description: 'Immun gegen „Kurzschluss“, Stromschaden −50 %. +1 Firewall.',
    combat: { firewall: 1 }, traits: ['immun-kurzschluss', 'stromschaden-halb'],
  }),
  cy({
    id: 'nerven-zeitlupe', name: 'Zeitlupe', slot: 'nervensystem',
    description: 'Minispiel-Zeit +50 %. Einmal pro Kampf Überwachungsfeuer ignorieren.',
    traits: ['minispiel-zeit-50', 'ueberwachung-ignorieren-1'],
  }),

  // --- Haut ------------------------------------------------------------------------------------------------
  cy({
    id: 'haut-panzerplatten', name: 'Unterhautplatten', slot: 'haut',
    description: '+2 Panzerung.',
    combat: { armor: 2 },
  }),
  cy({
    id: 'haut-filtermembran', name: 'Filtermembran', slot: 'haut',
    description: 'Giftschutz: Gift-Checks bis Schwelle 7 bestehst du automatisch. Immun gegen „Kanalmief“.',
    autoPass: [{ tags: ['gift'], maxThreshold: 7 }], traits: ['giftschutz', 'immun-kanalmief'],
  }),
  cy({
    id: 'haut-tarnlack', name: 'Tarnlack', slot: 'haut',
    description: 'Sichtkegel beim Schleichen 20 % kürzer (nachts doppelt), +1 bei Schleichen-Checks. Fähigkeit „Tarnen“: einmal pro Kampf eine Runde kaum zu treffen.',
    checkBonus: [{ tags: ['schleichen'], value: 1, label: 'Tarnlack' }], ability: 'cyber-tarnen', traits: ['sichtkegel-20'],
  }),
  cy({
    id: 'haut-neonnaehte', name: 'Neonnähte', slot: 'haut',
    description: '+1 Ausstrahlung in der Unterstadt, Club-Eintritt gratis.',
    checkBonus: [{ attribute: 'ausstrahlung', value: 1, districts: ['unterstadt'], label: 'Neonnähte' }], traits: ['club-gratis'],
  }),
  cy({
    id: 'haut-spiegelhaut', name: 'Spiegelhaut', slot: 'haut',
    description: '+1 Panzerung. Fähigkeit „Blenden“: angrenzende Gegner stehen geblendet da.',
    combat: { armor: 1 }, ability: 'cyber-blenden',
  }),
];

const abilities: Record<string, AbilityDef> = {
  'cyber-durchatmen': {
    id: 'cyber-durchatmen', name: 'Durchatmen', kind: 'support', ap: 1, target: 'self', range: 0, uses: 1,
    status: { id: 'geschuetzt', turns: 1 },
    description: 'Ruhepol: einmal tief Luft holen. Eine Runde „Geschützt“.',
  },
  'cyber-papierstau': {
    id: 'cyber-papierstau', name: 'Papierstau', kind: 'hack', ap: 1, target: 'enemy', range: 6, damage: 0, attribute: 'technik', cooldown: 2,
    status: { id: 'gehackt', turns: 1 },
    description: 'FX-60 schickt ein Endlosfax ins System des Ziels: „Gehackt“.',
  },
  'cyber-drohnenfluestern': {
    id: 'cyber-drohnenfluestern', name: 'Drohnenflüstern', kind: 'hack', ap: 2, target: 'enemy', range: 6, damage: 0, attribute: 'technik', uses: 1,
    status: { id: 'gehackt', turns: 2 },
    description: 'Der Uplink flüstert einer Drohne ein Schlaflied. Zwei Runden „Gehackt“.',
  },
  'cyber-zielen': {
    id: 'cyber-zielen', name: 'Zielen', kind: 'trick', ap: 1, target: 'enemy', range: 8, damage: 0, cooldown: 2,
    status: { id: 'markiert', turns: 1 },
    description: 'Adlerblick legt ein Fadenkreuz aufs Ziel: „Markiert“ (+20 Treffer für alle).',
  },
  'cyber-heranziehen': {
    id: 'cyber-heranziehen', name: 'Heranziehen', kind: 'trick', ap: 1, target: 'enemy', range: 3, damage: 1, cooldown: 2,
    status: { id: 'markiert', turns: 1, chance: 0.7 },
    description: 'Der Greifhaken schnappt zu und reißt das Ziel aus der Deckung („Markiert“).',
  },
  'cyber-toast': {
    id: 'cyber-toast', name: 'Toast', kind: 'support', ap: 1, target: 'self', range: 0, heal: 5, uses: 2,
    description: 'Klack. Eine Scheibe Toast, goldbraun. +5 LP, und alle Ratten drehen sich nach dir um.',
  },
  'cyber-giftkralle': {
    id: 'cyber-giftkralle', name: 'Giftkralle', kind: 'nahkampf', ap: 1, target: 'enemy', range: 1, damage: 1, cooldown: 2,
    status: { id: 'blutet', turns: 2, chance: 0.7 },
    description: 'Drei grüne Klingen. Das Ziel ist „Angeschlagen“.',
  },
  'cyber-funkenhand': {
    id: 'cyber-funkenhand', name: 'Funkenhand', kind: 'trick', ap: 2, target: 'area', range: 3, radius: 1, damage: 3, cooldown: 3,
    status: { id: 'brennt', turns: 2, chance: 0.8 },
    description: 'Eine Flammenzunge aus dem Handteller über drei mal drei Felder. „Brennt“.',
  },
  'cyber-sprint': {
    id: 'cyber-sprint', name: 'Sprint', kind: 'support', ap: 1, target: 'self', range: 0, uses: 1,
    status: { id: 'geschuetzt', turns: 1 },
    description: 'Die Servos heulen auf. Du bist so schnell, dass dich eine Runde kaum jemand trifft („Geschützt“).',
  },
  'cyber-tarnen': {
    id: 'cyber-tarnen', name: 'Tarnen', kind: 'support', ap: 1, target: 'self', range: 0, uses: 1,
    status: { id: 'geschuetzt', turns: 2 },
    description: 'Der Lack bricht das Licht. Zwei Runden bist du schwer zu sehen („Geschützt“).',
  },
  'cyber-blenden': {
    id: 'cyber-blenden', name: 'Blenden', kind: 'trick', ap: 1, target: 'area', range: 0, radius: 1, damage: 0, cooldown: 3,
    status: { id: 'betaeubt', turns: 1, chance: 0.4 },
    description: 'Die Spiegelhaut blitzt auf. Angrenzende Gegner sehen Sterne – manche setzen eine Runde aus.',
  },
};

const cyberware: Record<string, CyberwareDef> = Object.fromEntries(list.map((def) => [def.id, def]));

export const part: ContentPart = { cyberware, abilities };
