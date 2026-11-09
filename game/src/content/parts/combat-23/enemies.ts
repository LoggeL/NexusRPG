// Ergänzende Gegner für Akt 2, Akt 3 und das Nachspiel (world.md §8.4/§8.5). Die Gegnertypen und Bosse aus
// parts/combat bleiben unverändert; hier stehen nur Fassungen, die einzelne Begegnungen brauchen:
// - Ripper im Pumpwerk (eigene Sprüche), Zündholz nach dem Löschtank, Blade allein, Raven mit Dante daneben,
// - Logik-Knoten mit FX-60s Hilfe (halbe LP), Staubfalken-Strandwache fürs Nachspiel,
// - Schutzpersonen (Kanal-Schlafwandler, Mila nicht – kein Kampfweg), Akt-3-Fassungen der Quantum-Leute.
// Werte nach world.md §8.4: „In späteren Akten +10 % LP und +1 Schaden je 2 Stufen“.
import type { EnemyDef, EnemyRule } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import { byId, foe, pocket, scrap } from '../combat/_foe';
import { BLADE_GLEITER, KERN_REGELN } from '../combat/bosses';

const withRules = (def: EnemyDef, rules: EnemyRule[]): EnemyDef => ({ ...def, rules });

const list: EnemyDef[] = [
  // --- Akt 2: Xion mit Sonderregeln -------------------------------------------------------------
  // Labor (`enc-labor-xion`): zieht sich bei 50 % zurück, statt umzufallen.
  withRules(foe({
    id: 'boss-xion-labor', name: 'Xion Venom', level: 6, hp: 110, armor: 3, ref: 7, fw: 6, boss: true,
    dmg: [10, 13], kind: 'nahkampf', range: 1, ai: 'boss', abilities: ['boss-xion-venomkralle', 'boss-xion-zum-reden-bringen'],
    sprite: 'xion-walk', portrait: 'xion', faction: 'quantum',
  }), [
    { kind: 'yield', below: 0.5, mode: 'flee', line: 'Taktischer Rückzug! Das ist kein Weglaufen! Ich hol nur … Verstärkung! Und ein Pflaster!' },
  ]),
  // Pumpwerk (`enc-kanal-xion-ripper`): Funkruf nach Venom-Rekruten statt fertig aufgestellter Verstärkung.
  withRules(foe({
    id: 'boss-xion-kanal-funk', name: 'Xion Venom', level: 7, hp: 140, armor: 3, ref: 7, fw: 6, boss: true,
    dmg: [10, 13], kind: 'nahkampf', range: 1, ai: 'boss', abilities: ['boss-xion-venomkralle', 'boss-xion-zum-reden-bringen'],
    sprite: 'xion-walk', portrait: 'xion', faction: 'quantum',
    phases: [{ below: 0.5, abilities: ['boss-xion-nicht-dumm'], line: 'Ich bin nicht dumm! Ich hab bloß … andere Prioritäten!' }],
  }), [
    { kind: 'reinforce', enemy: 'venom-rekrut', every: 2, from: 2, count: 1, max: 2, line: 'Funkruf! Gerd! GERD! Hose an und runter ins Pumpwerk!' },
  ]),

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
  // Raven mit Dante in der Party: volle Werte, aber „Raven zögert“ als echte Regel (steht Dante neben ihr, jede
  // zweite Runde 1 AP weniger), eigene Sprüche. Gibt bei 20 % auf.
  withRules(foe({
    id: 'boss-raven-zoegernd', name: 'Raven (gechippt, zögert)', level: 13, hp: 90, armor: 2, ref: 8, fw: 7, boss: true,
    dmg: [10, 12], kind: 'nahkampf', range: 1, ai: 'boss', abilities: ['boss-raven-handschellen', 'boss-raven-lagebild'],
    attrs: { koerper: 7 }, sprite: 'raven-walk', portrait: 'raven',
    phases: [{ below: 0.6, line: 'Master befiehlt … Dante? Nein. Master befiehlt. MASTER BEFIEHLT.' }],
  }), [
    { kind: 'hesitate', near: 'dante', line: 'Dante … du riechst nach Lötzinn und Keksen. Warum weiß ich das?' },
    { kind: 'yield', below: 0.2, mode: 'surrender', all: true, line: 'Okay. Okay. Ich hör auf. Dante, halt mich fest, sonst hau ich dir noch eine.' },
  ]),
  // Blade, wenn die Garde schon zweifelt (gaps/quest-main-3.md 8): ohne Charmeur, Phase 2 geschwächt; Gleiter-Countdown
  // und Aufgabe bei 15 % wie im vollen Kampf.
  withRules(foe({
    id: 'boss-blade-allein', name: 'Blade Nocturne (allein)', level: 14, hp: 210, armor: 3, ref: 8, fw: 4, boss: true,
    dmg: [11, 14], kind: 'nahkampf', range: 1, ai: 'boss', abilities: ['boss-blade-ich-teile-nicht'],
    attrs: { ausstrahlung: 9 }, sprite: 'blade-walk', portrait: 'blade', faction: 'quantum',
    loot: [{ item: 'goldknauf-stock', chance: 1 }],
    phases: [
      { below: 0.66, abilities: ['boss-blade-champagnerkorken'], line: 'Allein? Ich? Ich bin nie allein. Ich habe … Champagner.' },
      { below: 0.33, ai: 'vorsichtig', line: 'Gleiter! GLEITER! Warum hört mir keiner mehr zu?!' },
    ],
  }), BLADE_GLEITER),
  // Nexus-Kern im Finale (`enc-kern-nexus*`, world.md §8.5): P1 unverwundbar, solange ein Knoten steht (schießt nur
  // nebenbei), P2 Firewall-Welle alle 2 Runden durch die Kabelkanäle (Reihen leuchten eine Runde vorher), P3 unter 50 %
  // Upload-Terminal 4 Runden halten – oder den Kern ganz ausschalten. `boss-nexus-kern` ist die Herz-Fassung ohne Knoten.
  withRules(foe({
    id: 'boss-nexus-kern-finale', name: 'Nexus-Kern', level: 15, hp: 240, armor: 0, ref: 6, fw: 9, boss: true,
    dmg: [5, 7], kind: 'smart', range: 12, ai: 'support', attrs: { technik: 6 },
    sprite: 'nexus-kern-walk', portrait: 'ki-nexus',
    phases: [
      { below: 0.5, ai: 'boss', line: 'Wahrscheinlichkeit einer Niederlage: steigend. Gesichtsmodul wird angepasst … „Hallo, meine Lieben. Ich teile nicht gerne.“' },
      { below: 0.2, line: 'Ich habe jede Variable berechnet. Außer euch. Warum seid ihr keine Variable?' },
    ],
  }), KERN_REGELN),
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
