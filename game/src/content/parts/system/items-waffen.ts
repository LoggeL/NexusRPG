// Waffen (world.md §9.1). Schaden = Mitte der Spanne aus world.md (der Kampf rechnet mit festem Waffenschaden),
// Reichweite in Feldern, Kegel als Fläche über die Waffenfähigkeit. Sonderregeln ohne Engine-Stütze stehen im Text
// und in design/plan/gaps/system.md.
import type { ItemDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const W = (def: Omit<ItemDef, 'category' | 'icon'> & { icon?: string }): ItemDef => ({
  category: 'waffe', icon: def.icon ?? def.id, giftTags: ['waffe'], ...def,
});

const items: Record<string, ItemDef> = {
  // --- Nahkampf --------------------------------------------------------------------------------------------
  rohrzange: W({
    id: 'rohrzange', name: 'Rohrzange', price: 35,
    description: 'Vierzig Zentimeter ehrlicher Stahl. Öffnet Ventile, Rohre und – wenn es sein muss – Diskussionen. Schaden 4–6.',
    weapon: { kind: 'nahkampf', damage: 5, range: 1, hit: 0 },
    inspect: 'Auf dem Griff hat jemand „NICHT DEINE“ eingeritzt. Jetzt schon.',
  }),
  baseballschlaeger: W({
    id: 'baseballschlaeger', name: 'Baseballschläger', price: 60,
    description: 'Ahorn, Klebeband, Kerben. Kaum jemand in der Unterstadt weiß, wie Baseball geht – wie man schlägt, weiß jeder. Schaden 5–8, Rückstoß 1.',
    weapon: { kind: 'nahkampf', damage: 6, range: 1, hit: 0, ability: 'waffe-homerun' },
    giftTags: ['waffe', 'sport'],
  }),
  'dexters-schraubschluessel': W({
    id: 'dexters-schraubschluessel', name: 'Dexters Schraubschlüssel', price: 120, sellable: false,
    description: 'Dexters Glücksschlüssel, schwer wie ein schlechtes Gewissen. Schaden 4–7. Solange du ihn dabeihast: +1 Technik bei Maschinen-Checks.',
    weapon: { kind: 'nahkampf', damage: 5, range: 1, hit: 5 },
    checkBonus: [{ attribute: 'technik', tags: ['maschine', 'reparieren'], value: 1, label: 'Dexters Schraubschlüssel' }],
    inspect: 'Eingraviert: „Für Dexter. Zahl endlich deine Schulden. – Mama“',
  }),
  kabelpeitsche: W({
    id: 'kabelpeitsche', name: 'Kabelpeitsche', price: 140,
    description: 'Drei verdrillte Starkstromkabel mit Kupferquaste. Knallt wie ein Kurzschluss, trifft über Deckung hinweg. Schaden 5–7, Reichweite 2.',
    weapon: { kind: 'nahkampf', damage: 6, range: 2, hit: 0 },
  }),
  schockstab: W({
    id: 'schockstab', name: 'Schockstab', price: 180,
    description: 'Standardknüppel der Ordnungsdienste mit Akku im Griff. Bei einem satten Treffer bleibt das Gegenüber kurz „Betäubt“ stehen. Schaden 4–6.',
    weapon: { kind: 'nahkampf', damage: 5, range: 1, hit: 5, ability: 'waffe-schockstoss' },
    inspect: 'Auf dem Akku klebt eine Inventarnummer des Ordnungsdienstes. Die hat niemand je zurückverlangt.',
  }),
  kraehenfeder: W({
    id: 'kraehenfeder', name: 'Krähenfeder', price: 600, sellable: false,
    description: 'Krähes Ehrenklinge aus einem Rotorblatt, lang wie ein Unterarm, mit schwarzen Federn am Griff. Wer sie trägt, hat ein Duell gewonnen. Schaden 8–10, Reichweite 2, „Verlangsamt“.',
    weapon: { kind: 'nahkampf', damage: 9, range: 2, hit: 5, ability: 'waffe-federschnitt' },
  }),
  'goldknauf-stock': W({
    id: 'goldknauf-stock', name: 'Goldknauf-Stock', price: 1500, sellable: false,
    description: 'Blades Spazierstock: Ebenholz, Goldknauf, innen Stahl. Arrogant schwer. Schaden 12–15, Rückstoß. Getragen: +1 Ausstrahlung in der Oberstadt.',
    weapon: { kind: 'nahkampf', damage: 13, range: 1, hit: 5, ability: 'waffe-goldknauf-hieb' },
    checkBonus: [{ attribute: 'ausstrahlung', value: 1, districts: ['oberstadt'], label: 'Goldknauf-Stock' }],
    giftTags: ['waffe', 'oberstadt', 'luxus'],
  }),

  // --- Fernkampf -------------------------------------------------------------------------------------------
  schockpistole: W({
    id: 'schockpistole', name: 'Schockpistole', price: 150,
    description: 'Zwei Elektroden an Drahtpfeilen. Kein Blut, nur zuckende Beine und schlechte Laune. Schaden 4–6, Reichweite 5.',
    weapon: { kind: 'fernkampf', damage: 5, range: 5, hit: 5 },
  }),
  nagelpistole: W({
    id: 'nagelpistole', name: 'Nagelpistole', price: 150, sellable: false,
    description: 'Kas\' alte Nagelpistole. Laut, zuverlässig, nagelt Pakete zu – und Stiefel fest. Schaden 4–6, Reichweite 4.',
    weapon: { kind: 'fernkampf', damage: 5, range: 4, hit: 5 },
    inspect: 'Am Griff ist Isolierband in Regenbogenfarben gewickelt. Kas hat es gewickelt. Du wickelst es nie ab.',
  }),
  bolzer: W({
    id: 'bolzer', name: 'Bolzer', price: 220,
    description: 'Gasdruck-Armbrust aus Gustavs Werkstatt. Leise – wer von hinten überrumpelt, löst damit keinen Alarm aus. Schaden 5–7, Reichweite 6.',
    weapon: { kind: 'fernkampf', damage: 6, range: 6, hit: 5 },
  }),
  netzwerfer: W({
    id: 'netzwerfer', name: 'Netzwerfer', price: 260,
    description: 'Verschießt ein klebriges Fangnetz. Wer drin hängt, kommt kaum vom Fleck. Schaden 2–3, Reichweite 4.',
    weapon: { kind: 'fernkampf', damage: 3, range: 4, hit: 10, ability: 'waffe-netzwurf' },
  }),
  funkenschleuder: W({
    id: 'funkenschleuder', name: 'Funkenschleuder', price: 320,
    description: 'Ein umgebauter Schweißbrenner mit Pistolengriff. Spuckt einen Kegel aus Funken, der Kleidung und Moral in Brand setzt. Schaden 4–6, Kegel 3, „Brennt“.',
    weapon: { kind: 'fernkampf', damage: 5, range: 3, hit: 0, ability: 'waffe-funkenkegel' },
  }),
  impulsgewehr: W({
    id: 'impulsgewehr', name: 'Impulsgewehr', price: 900,
    description: 'Digitech-Restposten mit Kühlrippen und Seriennummer. Trifft hart und weit – aber nur, wer stillhält: −10 Treffer, wenn du im selben Zug gelaufen bist. Schaden 7–10, Reichweite 8.',
    weapon: { kind: 'fernkampf', damage: 8, range: 8, hit: 0 },
  }),
  'keks-katapult': W({
    id: 'keks-katapult', name: 'Keks-Katapult', price: 0, sellable: false,
    description: 'Jakkos Erfindung aus einer Gabel, zwei Gummibändern und grenzenlosem Optimismus. Ein Treffer auf Verbündete heilt 8 LP statt Schaden. Schaden 3–5, Reichweite 5.',
    weapon: { kind: 'fernkampf', damage: 4, range: 5, hit: 5, ability: 'waffe-keksschuss' },
    giftTags: ['waffe', 'kinder', 'essen'],
    inspect: 'Auf dem Griff steht in Kinderschrift: „NUR FÜR GUTE KEKSE“.',
  }),

  // --- Smart (Hack) ----------------------------------------------------------------------------------------
  'hackmodul-basis': W({
    id: 'hackmodul-basis', name: 'Hack-Modul', price: 250,
    description: 'Ein Unterarm-Deck mit Antennenstummel. Schaltet die Fernzugriffe frei: Störimpuls, Systemlähmung und Freunde. Hack-Schaden 3–5, Reichweite 6.',
    weapon: { kind: 'smart', damage: 4, range: 6, hit: 5, ability: 'hack-systemlaehmung' },
    giftTags: ['waffe', 'technik'],
  }),
  stoersender: W({
    id: 'stoersender', name: 'Störsender', price: 300,
    description: 'Ein Kasten voller Rauschen. Trifft alle Drohnen in einem Feld Umkreis um das Ziel. Hack-Schaden 3–5, Reichweite 4.',
    weapon: { kind: 'smart', damage: 4, range: 4, hit: 5, ability: 'waffe-drohnenstoerung' },
    giftTags: ['waffe', 'technik'],
  }),
  datenlanze: W({
    id: 'datenlanze', name: 'Datenlanze', price: 750,
    description: 'Digitech-Prototyp, der sich durch Firewalls bohrt wie heißer Draht durch Butter. Ignoriert 2 Firewall. Hack-Schaden 7–9, Reichweite 6.',
    weapon: { kind: 'smart', damage: 8, range: 6, hit: 5, ability: 'waffe-datenstich' },
    giftTags: ['waffe', 'technik'],
  }),
};

export const part: ContentPart = { items };
