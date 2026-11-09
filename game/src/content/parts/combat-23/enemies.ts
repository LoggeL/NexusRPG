// Ergänzende Gegner für Akt 2, Akt 3 und das Nachspiel (world.md §8.4/§8.5). Die Gegnertypen und Bosse aus
// parts/combat bleiben unverändert; hier stehen nur Fassungen, die einzelne Begegnungen brauchen:
// - Ripper im Pumpwerk (eigene Sprüche), Zündholz nach dem Löschtank, Blade allein, Raven mit Dante daneben,
// - Logik-Knoten mit FX-60s Hilfe (halbe LP), Staubfalken-Strandwache fürs Nachspiel,
// - Schutzpersonen (Kanal-Schlafwandler, Mila nicht – kein Kampfweg), Akt-3-Fassungen der Quantum-Leute.
// Werte nach world.md §8.4: „In späteren Akten +10 % LP und +1 Schaden je 2 Stufen“.
import type { EnemyDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import { byId, foe, pocket, scrap } from '../combat/_foe';

const list: EnemyDef[] = [
  // --- Akt 2: Pumpwerk Sieben (`enc-kanal-xion-ripper`) --------------------------------------
  foe({
    id: 'boss-ripper-kanal', name: 'Ripper', level: 7, hp: 90, armor: 2, ref: 6, fw: 5, morale: 100, boss: true,
    dmg: [8, 10], kind: 'fernkampf', range: 5, ai: 'boss', abilities: ['boss-ripper-ausschlachten', 'boss-ripper-rauchbombe'],
    attrs: { technik: 7, koerper: 5, ausstrahlung: 5, strasse: 8 }, sprite: 'ripper-walk', portrait: 'ripper', faction: 'zerleger',
    credits: [150, 250], loot: [{ item: 'nanogel', chance: 1 }, scrap(1, 3)],
    phases: [
      { below: 0.6, line: 'Was haben wir denn da? Lauter hübsche Ersatzteile auf zwei Beinen. Ich mach euch ’nen Mengenrabatt.' },
      { below: 0.3, ai: 'vorsichtig', line: 'Das ist mir zu heiß! Xion, Schätzchen, die Ware gehört dir – Garantie ausgeschlossen!' },
    ],
  }),
  // Xions Leute im Kanal (Verstärkung, die mit `prep-fluchtweg` ausbleibt).
  foe({
    id: 'venom-rekrut', name: 'Venom-Rekrut', level: 6, hp: 44, armor: 3, ref: 6, fw: 5, morale: 75,
    dmg: [9, 11], kind: 'nahkampf', range: 1, ai: 'aggressiv', abilities: ['venom-garde-sprungangriff'],
    sprite: 'quantum-wachmann-walk', faction: 'quantum', credits: pocket(6), loot: [{ item: 'medipflaster', chance: 0.4 }],
  }),

  // --- Akt 2: Altlager (`side-alesas-zuendholz`) ---------------------------------------------
  // Nach dem Löschwassertank: „Nass“, Panzerung −3, der Flammenarm stottert.
  foe({
    id: 'boss-zuendholz-nass', name: 'Projekt Zündholz (durchnässt)', level: 9, hp: 160, armor: 2, ref: 3, fw: 6, boss: true,
    dmg: [7, 9], kind: 'nahkampf', range: 1, ai: 'boss', abilities: ['boss-zuendholz-flammenarm'],
    sprite: 'boss-zuendholz-walk', faction: 'quantum', loot: [scrap(1, 5)],
    phases: [
      { below: 0.5, line: '*zisch* FLAMMENARM … BITTE WARTEN. *pfff* BITTE WARTEN.' },
      { below: 0.25, ai: 'vorsichtig', line: 'Alesa über Lautsprecher: „Ihr habt ihn GEDUSCHT? Der war nicht wasserdicht, ihr Banausen!“' },
    ],
  }),

  // --- Akt 2: Ödnis ---------------------------------------------------------------------------
  // Krähe im Ehrenduell (ohne ihre Falken, `enc-wrackburg-kraehe-duell`): etwas weniger LP, gleiche Kralle.
  foe({
    id: 'boss-kraehe-duell', name: 'Krähe', level: 8, hp: 80, armor: 3, ref: 7, fw: 4, morale: 80, boss: true,
    dmg: [11, 13], kind: 'nahkampf', range: 2, ai: 'boss', abilities: ['boss-kraehe-sturmruf', 'staubfalke-sandwirbel'],
    sprite: 'kraehe-walk', portrait: 'kraehe', faction: 'staubfalken', credits: [80, 160], loot: [{ item: 'staubmaske', chance: 1 }],
    phases: [{ below: 0.5, line: 'Hah! Gut! Endlich mal jemand, über den es sich lohnt, am Feuer zu lügen.' }],
  }),

  // --- Akt 2: Kanal, Schutzperson (`pers-delya-quelle`) ---------------------------------------
  foe({
    id: 'kanal-schlafwandler', name: 'Kanal-Schlafwandler', level: 4, hp: 30, armor: 0, ref: 3, fw: 4,
    dmg: [3, 4], kind: 'nahkampf', range: 1, ai: 'vorsichtig', sprite: 'passant-kanalvolk-walk', xp: 0,
  }),

  // --- Akt 3: Releaseparty ---------------------------------------------------------------------
  // Raven mit Dante neben ihr: „Raven zögert“ – weniger Reflexe, ohne Lagebild für die Gechippten.
  foe({
    id: 'boss-raven-zoegernd', name: 'Raven (gechippt, zögert)', level: 13, hp: 90, armor: 2, ref: 6, fw: 7, boss: true,
    dmg: [9, 11], kind: 'nahkampf', range: 1, ai: 'boss', abilities: ['boss-raven-handschellen'],
    attrs: { koerper: 7 }, sprite: 'raven-walk', portrait: 'raven',
    phases: [
      { below: 0.6, line: 'Master befiehlt … Dante? Nein. Master befiehlt. MASTER BEFIEHLT.' },
      { below: 0.2, ai: 'vorsichtig', line: 'Dante … du riechst nach Lötzinn und Keksen. Warum weiß ich das?' },
    ],
  }),
  // Blade, nachdem `gc-48` saß („Darum stehst du jetzt allein hier oben.“): ohne Charmeur, Phase 2 geschwächt.
  foe({
    id: 'boss-blade-allein', name: 'Blade Nocturne (allein)', level: 14, hp: 210, armor: 3, ref: 8, fw: 4, boss: true,
    dmg: [11, 14], kind: 'nahkampf', range: 1, ai: 'boss', abilities: ['boss-blade-ich-teile-nicht'],
    attrs: { ausstrahlung: 9 }, sprite: 'blade-walk', portrait: 'blade', faction: 'quantum',
    loot: [{ item: 'goldknauf-stock', chance: 1 }],
    phases: [
      { below: 0.66, abilities: ['boss-blade-champagnerkorken'], line: 'Allein? Ich? Ich bin nie allein. Ich habe … Champagner.' },
      { below: 0.33, ai: 'vorsichtig', line: 'Gleiter! GLEITER! Warum hört mir keiner mehr zu?!' },
      { below: 0.15, line: 'Das war doch alles nur … ein Geschäftsmodell? Ich bin dann mal uns … weg?' },
    ],
  }),
  // Nexus-Kern im Finale (`enc-kern-nexus*`): Phase 1 versteckt er sich hinter den Knoten und schießt nur nebenbei
  // (world.md §8.5: „Kern unverwundbar, solange ein Knoten steht“ – die Engine kann das nicht, darum leise statt
  // unverwundbar). Unter 50 % Firewall-Welle und Blades Gesicht (Phase 2/3). `boss-nexus-kern` (volle Härte von Beginn)
  // bleibt für `enc-kern-nexus-herz`, wo die Knoten schon aus sind.
  foe({
    id: 'boss-nexus-kern-finale', name: 'Nexus-Kern', level: 15, hp: 240, armor: 0, ref: 6, fw: 9, boss: true,
    dmg: [5, 7], kind: 'smart', range: 12, ai: 'support', attrs: { technik: 6 },
    sprite: 'nexus-kern-walk', portrait: 'ki-nexus',
    phases: [
      { below: 0.5, ai: 'boss', abilities: ['boss-nexus-kern-firewall-welle'], line: 'Wahrscheinlichkeit einer Niederlage: steigend. Gesichtsmodul wird angepasst … „Hallo, meine Lieben. Ich teile nicht gerne.“' },
      { below: 0.2, line: 'Ich habe jede Variable berechnet. Außer euch. Warum seid ihr keine Variable?' },
    ],
  }),
  // Logik-Knoten, den FX-60 vorher per Fax zerlegt hat („LOGIK IST AUCH NUR EIN GERÜCHT.“): halbe LP.
  foe({
    id: 'nexus-knoten-logik-fx60', name: 'Logik-Knoten (zerfaxt)', level: 15, hp: 35, armor: 0, ref: 6, fw: 8, xp: 100,
    dmg: [6, 8], kind: 'smart', range: 8, ai: 'support', abilities: ['nexus-knoten-logik-wahrscheinlichkeit'],
    sprite: 'nexus-knoten-walk', portrait: 'ki-nexus',
  }),
  // Quantum-Wachen der Party-Nacht (Einlass, Campus in Akt 3): Akt-3-Fassung des Wachmanns.
  foe({
    id: 'quantum-eventschutz', name: 'Quantum-Eventschutz', level: 10, hp: 48, armor: 3, ref: 6, fw: 6, morale: 80,
    dmg: [11, 13], kind: 'fernkampf', range: 6, ai: 'vorsichtig', abilities: ['quantum-wachmann-schockstufe'],
    sprite: 'quantum-wachmann-walk', faction: 'quantum', credits: pocket(10),
    loot: [{ item: 'medipflaster', chance: 0.4 }, { item: 'stoergranate', chance: 0.15 }],
  }),

  // --- Nachspiel: Strand (`enc-strand-staubfalken`) ------------------------------------------
  foe({
    id: 'staubfalke-strandwache', name: 'Staubfalken-Strandwache', level: 12, hp: 58, armor: 3, ref: 7, fw: 4, morale: 70,
    dmg: [12, 14], kind: 'fernkampf', range: 6, ai: 'aggressiv', abilities: ['staubfalke-sandwirbel'],
    sprite: 'staubfalke-walk', faction: 'staubfalken', credits: pocket(12), loot: [{ item: 'staubmaske', chance: 0.2 }],
  }),
  foe({
    id: 'staubfalke-strandvogt', name: 'Strandvogt Kies', level: 13, hp: 80, armor: 4, ref: 7, fw: 4, morale: 85,
    dmg: [13, 15], kind: 'nahkampf', range: 2, ai: 'aggressiv', abilities: ['boss-kraehe-sturmruf', 'staubfalke-sandwirbel'],
    sprite: 'staubfalke-walk', faction: 'staubfalken', credits: [120, 220], loot: [{ item: 'nanogel', chance: 0.5 }],
  }),

  // --- Nachspiel: Xion als Türsteher-Lehrling (`pers-xion-umschulung`) -------------------------
  foe({
    id: 'hv-rempler', name: 'Rempler', level: 8, hp: 44, armor: 2, ref: 5, fw: 2, morale: 55,
    dmg: [9, 11], kind: 'nahkampf', range: 1, ai: 'aggressiv', abilities: ['ordnungshueter-platz-da'],
    sprite: 'rostzahn-schlaeger-walk', attrs: { koerper: 7 }, credits: pocket(8),
  }),
];

export const COMBAT23_ENEMIES: Record<string, EnemyDef> = byId(list);

export const part: ContentPart = { enemies: COMBAT23_ENEMIES };
