// Kämpfe für wiederholbare Aufträge (world.md §6.6) und die Kopfgeldliste (§6.7).
// Die Auftrags-Vorlagen verweisen per `JobTemplateDef.encounter` oder Effekt { battle } hierher.
import type { EncounterDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import { byId } from './_foe';

const jobs: EncounterDef[] = [
  {
    id: 'enc-job-kurier-abfangtrupp',
    name: 'Abfangtrupp auf der Kurierroute',
    arena: 'arena-strasse',
    enemies: [{ enemy: 'rostzahn-schlaeger', count: 2 }],
    start: 'hinterhalt',
    intro: [
      { speaker: 'narrator', text: 'Zwei Rostzähne springen aus einem Hauseingang. „Das Paket. Jetzt. Wir quittieren auch.“' },
    ],
    reward: { xp: 20 },
  },
  {
    id: 'enc-job-kurier-heisse-ware',
    name: 'Heiße Ware',
    arena: 'arena-strasse',
    enemies: [{ enemy: 'spaeherdrohne', count: 2 }, { enemy: 'quantum-wachmann' }],
    intro: [
      { speaker: 'narrator', text: 'Das Paket piept. Über dir piept es zurück: Quantum-Drohnen haben die Spur. Ein Wachmann winkt mit dem Schockgewehr.' },
    ],
    reward: { xp: 30 },
  },
  {
    id: 'enc-job-schulden',
    name: 'Schulden eintreiben',
    arena: 'arena-hinterhof',
    enemies: [{ enemy: 'schuldner' }, { enemy: 'abzieher', count: 2 }],
    intro: [
      { speaker: 'narrator', text: '„Morgen! Ganz sicher morgen! … Jungs, die Leute von Hunter sind da!“ Zwei Kumpel kommen mit Stuhlbeinen aus der Küche.' },
    ],
    reward: { xp: 20 },
  },
  {
    id: 'enc-job-eskorte-hinterhalt',
    name: 'Hinterhalt beim Begleitschutz',
    arena: 'arena-strasse',
    enemies: [{ enemy: 'abzieher', count: 2 }, { enemy: 'strassen-flitzer' }],
    objective: { kind: 'rescue', unit: 'passant-tourist', cell: [1, 3] },
    start: 'hinterhalt',
    intro: [
      { speaker: 'narrator', text: '„Ist das das echte Unterstadtleben?“ – Ja. Es kommt gerade mit Schlagringen um die Ecke. Pass auf deinen Schützling auf.' },
    ],
    reward: { xp: 30 },
  },
  {
    id: 'enc-job-bergung',
    name: 'Bergung auf der Halde',
    arena: 'arena-schrottplatz',
    enemies: [{ enemy: 'schrottkraehe', count: 2 }, { enemy: 'schrottdrohne' }],
    intro: [
      { speaker: 'narrator', text: 'Die guten Teile liegen ganz unten. Die Schrottkrähen sitzen ganz oben. Und sie teilen nicht.' },
    ],
    reward: { xp: 20, items: { 'schrott-ersatzteil': 2 } },
  },
  {
    // job-kanal, auch für side-strom-fuer-die-rohre („Kanalratten am Kabelweg vertreiben“).
    id: 'enc-job-kanal',
    name: 'Rattennest ausräuchern',
    arena: 'arena-kanal',
    enemies: [{ enemy: 'rattenschwarm' }, { enemy: 'kanalratte', count: 2 }],
    intro: [
      { speaker: 'narrator', text: 'Das Nest raschelt. Dann raschelt es lauter. Dann kommt es raus. Röstzwiebeln locken den Schwarm drei Felder weg.' },
    ],
    reward: { xp: 20 },
  },
];

const bounties: EncounterDef[] = [
  {
    id: 'enc-kopfgeld-zwei-finger-zoltan',
    name: 'Kopfgeld: Zwei-Finger-Zoltan',
    arena: 'arena-hinterhof',
    enemies: [{ enemy: 'zwei-finger-zoltan' }],
    intro: [{ speaker: 'narrator', text: 'Zoltan hält zwei Finger hoch. Die anderen drei stecken gerade in deiner Tasche.' }],
    reward: { xp: 20 },
  },
  {
    id: 'enc-kopfgeld-loetkolben-lola',
    name: 'Kopfgeld: Lötkolben-Lola',
    arena: 'arena-hinterhof',
    enemies: [{ enemy: 'loetkolben-lola' }, { enemy: 'schrottdrohne' }],
    intro: [{ speaker: 'narrator', text: '„Garantie? Klar gibt’s Garantie. Garantiert explodiert’s nicht sofort.“ Lola zündet den Lötkolben wie eine Waffe.' }],
    reward: { xp: 20 },
  },
  {
    id: 'enc-kopfgeld-krawall-kalle',
    name: 'Kopfgeld: Krawall-Kalle',
    arena: 'arena-strasse',
    enemies: [{ enemy: 'krawall-kalle' }, { enemy: 'abzieher' }],
    intro: [{ speaker: 'narrator', text: 'Krawall-Kalle hat schon drei Türsteher hinter sich und keine Lust auf Nummer vier. „Du bist kein Türsteher? Egal. Übungsrunde.“' }],
    reward: { xp: 20 },
  },
  {
    id: 'enc-kopfgeld-neon-nils',
    name: 'Kopfgeld: Neon-Nils auf den Dächern',
    arena: 'arena-strasse',
    enemies: [{ enemy: 'neon-nils' }, { enemy: 'spaeherdrohne' }],
    intro: [{ speaker: 'narrator', text: 'Neon-Nils klebt gerade „QUANTUM LIEBT DICH (NICHT)“ über eine Leuchtreklame. Er dreht sich um und grinst. Die Lichter gehen aus.' }],
    reward: { xp: 30 },
  },
  {
    id: 'enc-kopfgeld-der-kassierer',
    name: 'Kopfgeld: Der Kassierer',
    arena: 'arena-hafen',
    enemies: [{ enemy: 'der-kassierer' }, { enemy: 'rostzahn-schlaeger', count: 2 }],
    intro: [{ speaker: 'narrator', text: '„Hafengebühr, Sondergebühr, Gebühr für die Gebühr.“ Der Kassierer klappt sein Kassenbuch zu und pfeift seine Leibwächter heran.' }],
    reward: { xp: 30 },
  },
  {
    id: 'enc-kopfgeld-toaster',
    name: 'Kopfgeld: „Toaster“',
    arena: 'arena-schrottplatz',
    enemies: [{ enemy: 'toaster' }],
    intro: [{ speaker: 'narrator', text: '„Ich bin ein Mensch! Ich habe Gefühle! Und einen Krümelschacht!“ Toasters Greifzange zittert vor Empörung.' }],
    reward: { xp: 30 },
  },
  {
    id: 'enc-kopfgeld-graf-gully-zwei',
    name: 'Kopfgeld: Graf Gully II.',
    arena: 'arena-kanal',
    enemies: [{ enemy: 'graf-gully-zwei' }, { enemy: 'kanalratte', count: 3 }],
    intro: [
      { speaker: 'narrator', text: 'Ein Mann mit Pappkrone und Pelzmantel aus Rattenfell steht auf einem Fass. „Ich bin der WAHRE Bürgermeister! Untertanen, zu mir!“' },
      { speaker: 'narrator', text: 'Drei Ratten schauen sich an und entscheiden sich, aus Langeweile mitzumachen.' },
    ],
    reward: { xp: 30 },
  },
  {
    id: 'enc-kopfgeld-blech-schwestern',
    name: 'Kopfgeld: Die Blech-Schwestern',
    arena: 'arena-strasse',
    enemies: [{ enemy: 'blech-schwester-blau' }, { enemy: 'blech-schwester-rot' }],
    when: { act: 2 },
    intro: [{ speaker: 'narrator', text: '„Wir sind die ECHTEN Chrome-Schwestern.“ – „Ihr seid aus Alufolie.“ – „Aus GEBÜRSTETER Alufolie!“' }],
    reward: { xp: 50 },
  },
  {
    id: 'enc-kopfgeld-faxfaelscher',
    name: 'Kopfgeld: Der Faxfälscher',
    arena: 'arena-labor-ruine',
    enemies: [{ enemy: 'faxfaelscher' }, { enemy: 'digitech-waechter' }],
    intro: [{ speaker: 'narrator', text: 'Ein Mann im Anzug sitzt an FX-60s Leitung und tippt. Der alte Wächter hinter ihm trägt eine Faxrolle als Schärpe.' }],
    reward: { xp: 50 },
  },
  // enc-kopfgeld-staubbaron-broesel folgt mit arena-duenen (Akt 2, Arena noch nicht gebaut).
  {
    id: 'enc-kopfgeld-leutnant-nadel',
    name: 'Kopfgeld: Leutnant Nadel',
    arena: 'arena-labor-quantum',
    enemies: [{ enemy: 'leutnant-nadel' }, { enemy: 'quantum-wachmann', count: 2 }],
    when: { act: 2 },
    intro: [{ speaker: 'narrator', text: '„Xion ist beschäftigt. Ich bin seine Stellvertreterin für unangenehme Dinge.“ Leutnant Nadel zieht die Handschuhe straff.' }],
    reward: { xp: 80 },
  },
];

export const ENCOUNTERS_JOBS: Record<string, EncounterDef> = byId([...jobs, ...bounties]);

export const part: ContentPart = { encounters: ENCOUNTERS_JOBS };
