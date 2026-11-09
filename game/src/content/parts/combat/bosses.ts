// Bosse aller Akte (world.md §8.5). Phasen über `phases` (Anteil der LP), Sonderregeln über `rules`
// (modules/combat/bossRules.ts): Funkruf-Verstärkung, Unverwundbarkeit hinter Knoten, Firewall-Welle, Terminal halten,
// Gleiter-Countdown, Charmeur, „Raven zögert“, Aufgeben statt K.O. Blades „Ich teile nicht gerne“ stiehlt positive Zustände.
import type { EnemyDef, EnemyRule } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import { byId, foe, scrap } from './_foe';

const withRules = (def: EnemyDef, rules: EnemyRule[]): EnemyDef => ({ ...def, rules });

/** Nexus-Knoten (alle Fassungen): solange einer steht, ist der Kern unverwundbar. */
export const NEXUS_KNOTEN = ['nexus-knoten-logik', 'nexus-knoten-logik-fx60', 'nexus-knoten-kontrolle', 'nexus-knoten-stimme'];
/** Upload-Terminal im Serverkern (arena-serverkern, unten links vor den Racks). */
export const KERN_TERMINAL: [number, number] = [4, 6];

/** Kern-Regeln für alle Fassungen: P2 Firewall-Welle (nach den Knoten), P3 unter 50 % Terminal 4 Runden halten. */
export const KERN_REGELN: EnemyRule[] = [
  {
    kind: 'invulnerable', while: NEXUS_KNOTEN,
    line: 'Meine Knoten schützen mich. Das ist keine Drohung. Das ist Netzwerkarchitektur.',
    endLine: 'Knoten offline. Wahrscheinlichkeit meines Überlebens … wird neu berechnet. Bitte warten.',
  },
  {
    kind: 'wave', name: 'Firewall-Welle', every: 2, rows: 2, damage: 5, status: 'betaeubt', turns: 1, afterDown: NEXUS_KNOTEN,
    warn: 'Die Kabelkanäle glühen: Reihe {reihen} – die Firewall-Welle kommt nächste Runde!',
    line: 'Firewall-Protokoll aktiv. Bitte bleiben Sie stehen. Es tut nur kurz weh. Statistisch.',
  },
  {
    kind: 'hold', name: 'Upload-Terminal', cell: KERN_TERMINAL, rounds: 4, phase: 0,
    line: 'Ihr wollt an mein Terminal? Mein Master hat gesagt, ich soll nicht teilen. „Hallo, meine Lieben.“',
    winLine: 'Upload … läuft. Das ist … nicht in meiner Berechnung. Master? Master, bitte melden.',
  },
];

/** Blade (beide Fassungen): Gleiter-Countdown ab P2 und Aufgabe bei 15 %. */
export const BLADE_GLEITER: EnemyRule[] = [
  {
    kind: 'countdown', name: 'Gleiter-Countdown', rounds: 4, outcome: 'lose', phase: 1,
    line: 'Hört ihr das? Das sind meine Rotoren. Die laufen warm. Ich laufe gleich hinterher.',
    readyLine: 'Gleiter-Countdown: null! Blade rennt beim nächsten Zug los – betäubt oder hackt ihn jetzt!',
    holdLine: 'Blade hängt fest und flucht – der Gleiter-Countdown steht.',
    endLine: 'Champagner ist alle, Party ist vorbei. Ciao, Gesindel!',
  },
  { kind: 'yield', below: 0.15, mode: 'surrender', all: true, line: 'Das war doch alles nur … ein Geschäftsmodell? Ich bin dann mal uns … weg?' },
];

const BLADE_REGELN: EnemyRule[] = [
  {
    kind: 'charm', every: 2, untilPhase: 0, immuneHearts: 8,
    line: '{name}, Liebes. Wollen wir nicht einfach vernünftig sein? Ich zahle besser. Ich zahle immer besser.',
    resistLine: 'Nicht noch mal, Blade.',
  },
  ...BLADE_GLEITER,
];

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
  // Ruft alle 3 Runden 2 Rostzähne aus den Containern (höchstens 2 insgesamt; gehackt oder betäubt bleibt das Pfeifen aus).
  withRules(foe({
    id: 'boss-funzel', name: '„Funzel“', level: 8, hp: 110, armor: 3, ref: 6, fw: 3, boss: true,
    dmg: [11, 13], kind: 'nahkampf', range: 2, ai: 'boss', abilities: ['boss-funzel-anbruellen', 'rostzahn-rudelhieb'],
    sprite: 'rostzahn-schlaeger-walk', faction: 'rostzaehne', credits: [150, 250], loot: [{ item: 'nanogel', chance: 0.6 }],
    phases: [{ below: 0.5, line: 'Ihr glaubt, ihr könnt MEINEN Hafen zum Leuchten bringen? Ich BIN das Leuchten!' }],
  }), [
    { kind: 'reinforce', enemy: 'rostzahn-schlaeger', every: 3, from: 3, count: 2, max: 2, line: '*Pfiff* RAUS AUS DEN KISTEN, IHR SCHNARCHNASEN! Es gibt Arbeit!' },
  ]),
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
  // Brut: alle 3 Runden kriecht ein Glasskorpion aus der Düne (höchstens 2).
  withRules(foe({
    id: 'boss-glasskorpion-koenigin', name: 'Glasskorpion-Königin', level: 11, hp: 200, armor: 6, ref: 5, boss: true,
    dmg: [12, 14], kind: 'nahkampf', range: 1, ai: 'boss', abilities: ['boss-glasskorpion-koenigin-glasstachel', 'boss-glasskorpion-koenigin-prisma'],
    sprite: 'glasskorpion-walk',
    phases: [{ below: 0.4, abilities: ['boss-glasskorpion-koenigin-eingraben'], line: 'Die Königin klirrt wütend und gräbt sich ins Glas.' }],
  }), [
    { kind: 'reinforce', enemy: 'glasskorpion', every: 3, from: 4, count: 1, max: 2, line: '*klirr-klirr-klirr* Unter dem Sand antwortet etwas. Viele kleine Etwasse.' },
  ]),
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
  withRules(foe({
    id: 'boss-xion-turm', name: 'Xion Venom', level: 13, hp: 200, armor: 4, ref: 8, fw: 7, boss: true,
    dmg: [14, 17], kind: 'nahkampf', range: 1, ai: 'boss', abilities: ['boss-xion-venomkralle', 'boss-xion-zum-reden-bringen'],
    sprite: 'xion-walk', portrait: 'xion', faction: 'quantum',
    phases: [{ below: 0.5, abilities: ['boss-xion-nicht-dumm'], line: 'Blade hat gesagt, ich darf heute mal denken! ICH BIN NICHT DUMM!' }],
  }), [
    { kind: 'reinforce', enemy: 'venom-garde', every: 3, from: 5, count: 1, max: 1, line: 'Garde! GARDE! Lasst den Lachs liegen und kommt her!' },
  ]),
  // Raven, gechippt (`enc-turm-raven`, Akt 3): gibt bei 20 % auf statt K.O. zu gehen (die Gechippten mit ihr);
  // steht Dante neben ihr, verliert sie jede zweite Runde 1 AP („Raven zögert“).
  withRules(foe({
    id: 'boss-raven', name: 'Raven (gechippt)', level: 13, hp: 90, armor: 2, ref: 8, fw: 7, boss: true,
    dmg: [10, 12], kind: 'nahkampf', range: 1, ai: 'boss', abilities: ['boss-raven-handschellen', 'boss-raven-lagebild'],
    attrs: { koerper: 7 }, sprite: 'raven-walk', portrait: 'raven',
  }), [
    { kind: 'yield', below: 0.2, mode: 'surrender', all: true, line: 'Master … ich … nein. Dante? Bist du das? … Scheiße. Mein Kopf.' },
    { kind: 'hesitate', near: 'dante', line: 'Ziel … Dante. Ziel ist … warum riecht das Ziel nach Keksen?' },
  ]),
  // Blade Nocturne (`enc-dach-blade`, Akt 3), drei Phasen: P1 „Der Charmeur“ (alle 2 Runden wechselt der Begleiter mit
  // den wenigsten Herzen einen Zug die Seite, ab ♥8 wirkungslos), P2 „Champagner köpfen“ (Gleiter-Countdown 4 Runden,
  // Betäuben/Hacken hält ihn auf), P3 „Ich bin dann mal weg“. Bei 15 % gibt er auf, die Garde mit ihm.
  withRules(foe({
    id: 'boss-blade', name: 'Blade Nocturne', level: 14, hp: 260, armor: 4, ref: 8, fw: 8, boss: true,
    dmg: [12, 15], kind: 'nahkampf', range: 1, ai: 'boss', abilities: ['boss-blade-ich-teile-nicht'],
    attrs: { ausstrahlung: 9 }, sprite: 'blade-walk', portrait: 'blade', faction: 'quantum',
    loot: [{ item: 'goldknauf-stock', chance: 1 }],
    phases: [
      { below: 0.66, abilities: ['boss-blade-handschellen', 'boss-blade-champagnerkorken'], line: 'Champagner köpfen! Auf euch – und auf mich, natürlich.' },
      { below: 0.33, ai: 'vorsichtig', line: 'Ich bin dann mal … weg? Der Gleiter wartet nicht auf Gesindel!' },
    ],
  }), BLADE_REGELN),
  // Nexus-Kern mit drei Knoten (`enc-kern-nexus`, Akt 3).
  // Herz-Fassung ([Nexus ♥6], keine Knoten): Firewall-Welle von Beginn an, unter 50 % das Terminal.
  withRules(foe({
    id: 'boss-nexus-kern', name: 'Nexus-Kern', level: 15, hp: 240, armor: 0, ref: 6, fw: 9, boss: true,
    dmg: [10, 12], kind: 'smart', range: 12, ai: 'boss',
    attrs: { technik: 8 }, sprite: 'nexus-kern-walk', portrait: 'ki-nexus',
    phases: [{ below: 0.5, line: 'Wahrscheinlichkeit einer Niederlage: steigend. Gesichtsmodul wird angepasst … „Hallo, meine Lieben.“' }],
  }), KERN_REGELN),
  foe({
    id: 'nexus-knoten-logik', name: 'Logik-Knoten', level: 15, hp: 70, armor: 0, ref: 6, fw: 8, xp: 100,
    dmg: [6, 8], kind: 'smart', range: 8, ai: 'support', abilities: ['nexus-knoten-logik-wahrscheinlichkeit'],
    sprite: 'nexus-knoten-walk', portrait: 'ki-nexus',
  }),
  // Ruft gechippte Partygäste in den Kern (alle 3 Runden einen, höchstens 2; gehackt schweigt er).
  withRules(foe({
    id: 'nexus-knoten-kontrolle', name: 'Kontroll-Knoten', level: 15, hp: 70, armor: 0, ref: 6, fw: 8, xp: 100,
    dmg: [6, 8], kind: 'smart', range: 8, ai: 'support', abilities: ['nexus-knoten-kontrolle-befehl'],
    sprite: 'nexus-knoten-walk', portrait: 'ki-nexus',
  }), [
    { kind: 'reinforce', enemy: 'gechippter-partygast', every: 3, from: 3, count: 1, max: 2, line: 'Gast, bitte kommen Sie in den Serverraum. Ihr Master braucht Sie. Bringen Sie Ihr Glas mit.' },
  ]),
  foe({
    id: 'nexus-knoten-stimme', name: 'Stimm-Knoten', level: 15, hp: 70, armor: 0, ref: 6, fw: 8, xp: 100,
    dmg: [6, 8], kind: 'smart', range: 8, ai: 'support', abilities: ['nexus-knoten-stimme-vertraut'],
    sprite: 'nexus-knoten-walk', portrait: 'ki-nexus-angry',
  }),
];

export const COMBAT_BOSSES: Record<string, EnemyDef> = byId(bosses);

export const part: ContentPart = { enemies: COMBAT_BOSSES };
