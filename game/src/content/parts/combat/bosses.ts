// Bosse aller Akte (world.md §8.5). Phasen über `phases` (Anteil der LP); Beschwörungen, Diebstähle und
// Unverwundbarkeit kann die Engine noch nicht – Verstärkungen stehen deshalb von Anfang an in den Begegnungen,
// Details in design/plan/gaps/combat.md.
import type { EnemyDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import { byId, foe, scrap } from './_foe';

const bosses: EnemyDef[] = [
  // Ripper, Akt 1 (`enc-hv-ripper-tisch`): halbe LP, haut nach zwei Runden ab. Moral nur, damit er bei
  // wenig LP wirklich flieht („Das ist mir zu heiß!“) – einschüchtern lässt er sich kaum.
  foe({
    id: 'boss-ripper', name: 'Ripper', level: 3, hp: 45, armor: 2, ref: 6, fw: 5, morale: 100, boss: true,
    dmg: [8, 10], kind: 'fernkampf', range: 5, ai: 'boss', abilities: ['boss-ripper-ausschlachten', 'boss-ripper-rauchbombe'],
    attrs: { technik: 6, koerper: 4, ausstrahlung: 5, strasse: 7 }, sprite: 'ripper-walk', portrait: 'ripper', faction: 'zerleger',
    credits: [40, 80], loot: [{ item: 'medipflaster', chance: 1, qty: 2 }],
    phases: [{ below: 0.3, ai: 'vorsichtig', line: 'Das ist mir zu heiß! Wir sprechen uns, Schätzchen.' }],
  }),
  // Ripper in seiner Praxis (Aria-Strang, `pers-aria-zerberster`, Akt 2): volle Stufe 7, 90 LP.
  foe({
    id: 'boss-ripper-praxis', name: 'Ripper', level: 7, hp: 90, armor: 2, ref: 6, fw: 5, morale: 100, boss: true,
    dmg: [8, 10], kind: 'fernkampf', range: 5, ai: 'boss', abilities: ['boss-ripper-ausschlachten', 'boss-ripper-rauchbombe'],
    attrs: { technik: 7, koerper: 5, ausstrahlung: 5, strasse: 8 }, sprite: 'ripper-walk', portrait: 'ripper', faction: 'zerleger',
    credits: [120, 200], loot: [{ item: 'nanogel', chance: 1 }, scrap(1, 3)],
    phases: [
      { below: 0.6, line: 'Was haben wir denn da? Hübsches Teil. Das nehm ich in Zahlung.' },
      { below: 0.3, ai: 'vorsichtig', line: 'Das ist mir zu heiß! Der Code liegt in der Schublade, verdammt!' },
    ],
  }),
  // Jimmy im Chipfieber (`enc-hafen-jimmy`, nicht-tödlich: bei 0 LP schläft er und schnarcht Jingles).
  foe({
    id: 'boss-jimmy', name: 'Jimmy (Chipfieber)', level: 3, hp: 70, armor: 1, ref: 7, fw: 3, boss: true,
    dmg: [6, 8], kind: 'fernkampf', range: 4, ai: 'boss',
    abilities: ['boss-jimmy-werbepause', 'boss-jimmy-faesserturm', 'boss-jimmy-kundenservice'],
    attrs: { koerper: 5, technik: 5 }, portrait: 'jimmy', xp: 90,
    phases: [{ below: 0.5, line: 'Willkommen! Wie kann ich Ihre Zukunft optimieren? Bitte bewerten Sie diesen Schlag mit fünf Sternen!' }],
  }),
  // Nagbert der Rohrkönig (`enc-kanal-nagbert`).
  foe({
    id: 'boss-nagbert', name: 'Nagbert der Rohrkönig', level: 4, hp: 120, armor: 2, ref: 4, boss: true,
    dmg: [8, 10], kind: 'nahkampf', range: 1, ai: 'boss', abilities: ['boss-nagbert-schwanzpeitsche', 'boss-nagbert-koeniglicher-befehl'],
    attrs: { koerper: 6 }, sprite: 'kanalratte-walk', credits: [60, 120], loot: [{ item: 'kaeseecke', chance: 1, qty: 3 }, scrap(1, 4)],
    phases: [{ below: 0.5, abilities: ['boss-nagbert-kronenwurf'], line: '*PLATSCH* Nagbert hechtet in die Rinne. Die Krone blitzt, die Rinne spritzt.' }],
  }),
  // Rostzahn-Chef „Funzel“ (`enc-hafen-funzel`, Akt 2).
  foe({
    id: 'boss-funzel', name: '„Funzel“', level: 8, hp: 110, armor: 3, ref: 6, fw: 3, boss: true,
    dmg: [11, 13], kind: 'nahkampf', range: 2, ai: 'boss', abilities: ['boss-funzel-anbruellen', 'rostzahn-rudelhieb'],
    sprite: 'rostzahn-schlaeger-walk', faction: 'rostzaehne', credits: [150, 250], loot: [{ item: 'nanogel', chance: 0.6 }],
    phases: [{ below: 0.5, line: 'Ihr glaubt, ihr könnt MEINEN Hafen zum Leuchten bringen? Ich BIN das Leuchten!' }],
  }),
  // Wachkoloss (`enc-ruine-wachkoloss`, Akt 2).
  foe({
    id: 'boss-wachkoloss', name: 'Wachkoloss', level: 10, hp: 180, armor: 6, ref: 2, fw: 6, boss: true,
    dmg: [10, 12], kind: 'nahkampf', range: 1, ai: 'boss', abilities: ['boss-wachkoloss-stampfen', 'boss-wachkoloss-greifarm'],
    sprite: 'digitech-waechter-walk', faction: 'digitech', loot: [scrap(1, 6), { item: 'reparaturset', chance: 1, qty: 2 }],
    phases: [{ below: 0.5, line: 'WARNUNG. KERNTEMPERATUR KRITISCH. EINDRINGLINGE WERDEN … UMARMT.' }],
  }),
  // Projekt Zündholz (`enc-altlager-zuendholz`, Akt 2).
  foe({
    id: 'boss-zuendholz', name: 'Projekt Zündholz', level: 9, hp: 160, armor: 5, ref: 3, fw: 6, boss: true,
    dmg: [9, 11], kind: 'nahkampf', range: 1, ai: 'boss', abilities: ['boss-zuendholz-flammenarm'],
    faction: 'quantum', loot: [scrap(1, 5)],
    phases: [
      { below: 0.5, line: 'Alesa über Lautsprecher: „Bitte nicht den linken Arm, der war teuer!“' },
      { below: 0.25, ai: 'vorsichtig', line: 'GEBÄUDE EVAKUIEREN. GEBÄUDE EVAKUIEREN. ICH AUCH.' },
    ],
  }),
  // Krähe (`enc-wrackburg-kraehe`, Akt 2). Moral, damit „eine neue Geschichte“ den Kampf beenden kann.
  foe({
    id: 'boss-kraehe', name: 'Krähe', level: 8, hp: 90, armor: 3, ref: 7, fw: 4, morale: 80, boss: true,
    dmg: [11, 13], kind: 'nahkampf', range: 2, ai: 'boss', abilities: ['boss-kraehe-sturmruf', 'staubfalke-sandwirbel'],
    faction: 'staubfalken', credits: [100, 200], loot: [{ item: 'staubmaske', chance: 1 }],
    phases: [{ below: 0.5, line: 'Gut. Endlich mal jemand, über den man eine Geschichte erzählen kann.' }],
  }),
  // Glasskorpion-Königin (`enc-duenen-koenigin`, Akt 2).
  foe({
    id: 'boss-glasskorpion-koenigin', name: 'Glasskorpion-Königin', level: 11, hp: 200, armor: 6, ref: 5, boss: true,
    dmg: [12, 14], kind: 'nahkampf', range: 1, ai: 'boss', abilities: ['boss-glasskorpion-koenigin-glasstachel', 'boss-glasskorpion-koenigin-prisma'],
    sprite: 'glasskorpion-walk',
    phases: [{ below: 0.4, abilities: ['boss-glasskorpion-koenigin-eingraben'], line: 'Die Königin klirrt wütend und gräbt sich ins Glas.' }],
  }),
  // Xion Venom in vier Fassungen (Labor, Kanal, Ring, Turm).
  foe({
    id: 'boss-xion', name: 'Xion Venom', level: 6, hp: 110, armor: 3, ref: 7, fw: 6, boss: true,
    dmg: [10, 13], kind: 'nahkampf', range: 1, ai: 'boss', abilities: ['boss-xion-venomkralle', 'boss-xion-zum-reden-bringen'],
    sprite: 'xion-walk', portrait: 'xion', faction: 'quantum',
    phases: [{ below: 0.5, abilities: ['boss-xion-nicht-dumm'], line: 'Ich bin nicht dumm! ICH BIN NICHT DUMM!' }],
  }),
  foe({
    id: 'boss-xion-kanal', name: 'Xion Venom', level: 7, hp: 140, armor: 3, ref: 7, fw: 6, boss: true,
    dmg: [10, 13], kind: 'nahkampf', range: 1, ai: 'boss', abilities: ['boss-xion-venomkralle', 'boss-xion-zum-reden-bringen'],
    sprite: 'xion-walk', portrait: 'xion', faction: 'quantum',
    phases: [{ below: 0.5, abilities: ['boss-xion-nicht-dumm'], line: 'Ich bin nicht dumm! Ich hab bloß … andere Prioritäten!' }],
  }),
  foe({
    id: 'boss-xion-ring', name: 'Xion Venom', level: 8, hp: 120, armor: 2, ref: 8, fw: 7, boss: true,
    dmg: [10, 13], kind: 'nahkampf', range: 1, ai: 'boss', abilities: ['boss-xion-venomkralle', 'boss-xion-zum-reden-bringen'],
    sprite: 'xion-walk', portrait: 'xion', faction: 'quantum',
    phases: [{ below: 0.5, abilities: ['boss-xion-nicht-dumm'], line: 'Das Publikum liebt mich! … Warum buht ihr?!' }],
  }),
  foe({
    id: 'boss-xion-turm', name: 'Xion Venom', level: 13, hp: 200, armor: 4, ref: 8, fw: 7, boss: true,
    dmg: [14, 17], kind: 'nahkampf', range: 1, ai: 'boss', abilities: ['boss-xion-venomkralle', 'boss-xion-zum-reden-bringen'],
    sprite: 'xion-walk', portrait: 'xion', faction: 'quantum',
    phases: [{ below: 0.5, abilities: ['boss-xion-nicht-dumm'], line: 'Blade hat gesagt, ich darf heute mal denken! ICH BIN NICHT DUMM!' }],
  }),
  // Raven, gechippt (`enc-turm-raven`, Akt 3): ergibt sich bei 20 %.
  foe({
    id: 'boss-raven', name: 'Raven (gechippt)', level: 13, hp: 90, armor: 2, ref: 8, fw: 7, boss: true,
    dmg: [10, 12], kind: 'nahkampf', range: 1, ai: 'boss', abilities: ['boss-raven-handschellen', 'boss-raven-lagebild'],
    attrs: { koerper: 7 }, sprite: 'raven-walk', portrait: 'raven',
    phases: [{ below: 0.2, ai: 'vorsichtig', line: 'Master … ich … nein. Dante? Bist du das?' }],
  }),
  // Blade Nocturne (`enc-dach-blade`, Akt 3), drei Phasen.
  foe({
    id: 'boss-blade', name: 'Blade Nocturne', level: 14, hp: 260, armor: 4, ref: 8, fw: 8, boss: true,
    dmg: [12, 15], kind: 'nahkampf', range: 1, ai: 'boss', abilities: ['boss-blade-charmeur', 'boss-blade-ich-teile-nicht'],
    attrs: { ausstrahlung: 9 }, sprite: 'blade-walk', portrait: 'blade', faction: 'quantum',
    loot: [{ item: 'goldknauf-stock', chance: 1 }],
    phases: [
      { below: 0.66, abilities: ['boss-blade-handschellen', 'boss-blade-champagnerkorken'], line: 'Champagner köpfen! Auf euch – und auf mich, natürlich.' },
      { below: 0.33, ai: 'vorsichtig', line: 'Ich bin dann mal … weg? Der Gleiter wartet nicht auf Gesindel!' },
      { below: 0.15, line: 'Das war doch alles nur … ein Geschäftsmodell?' },
    ],
  }),
  // Nexus-Kern mit drei Knoten (`enc-kern-nexus`, Akt 3).
  foe({
    id: 'boss-nexus-kern', name: 'Nexus-Kern', level: 15, hp: 240, armor: 0, ref: 6, fw: 9, boss: true,
    dmg: [10, 12], kind: 'smart', range: 12, ai: 'boss', abilities: ['boss-nexus-kern-firewall-welle'],
    attrs: { technik: 8 }, sprite: 'nexus-kern-walk', portrait: 'ki-nexus',
    phases: [{ below: 0.5, line: 'Wahrscheinlichkeit einer Niederlage: steigend. Gesichtsmodul wird angepasst … „Hallo, meine Lieben.“' }],
  }),
  foe({
    id: 'nexus-knoten-logik', name: 'Logik-Knoten', level: 15, hp: 70, armor: 0, ref: 6, fw: 8, xp: 100,
    dmg: [6, 8], kind: 'smart', range: 8, ai: 'support', abilities: ['nexus-knoten-logik-wahrscheinlichkeit'],
    sprite: 'nexus-knoten-walk', portrait: 'ki-nexus',
  }),
  foe({
    id: 'nexus-knoten-kontrolle', name: 'Kontroll-Knoten', level: 15, hp: 70, armor: 0, ref: 6, fw: 8, xp: 100,
    dmg: [6, 8], kind: 'smart', range: 8, ai: 'support', abilities: ['nexus-knoten-kontrolle-befehl'],
    sprite: 'nexus-knoten-walk', portrait: 'ki-nexus',
  }),
  foe({
    id: 'nexus-knoten-stimme', name: 'Stimm-Knoten', level: 15, hp: 70, armor: 0, ref: 6, fw: 8, xp: 100,
    dmg: [6, 8], kind: 'smart', range: 8, ai: 'support', abilities: ['nexus-knoten-stimme-vertraut'],
    sprite: 'nexus-knoten-walk', portrait: 'ki-nexus-angry',
  }),
];

export const COMBAT_BOSSES: Record<string, EnemyDef> = byId(bosses);

export const part: ContentPart = { enemies: COMBAT_BOSSES };
