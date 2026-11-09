// Zufallsbegegnungen je Zone (world.md §8.7): Chance je Tageszeit (M/T/A/N) × Gewicht des Eintrags.
// `EncounterDef.random` kennt nur eine Chance je Begegnung, deshalb entsteht pro Eintrag und Tageszeit eine
// eigene Begegnung `enc-zufall-<zone>-<eintrag>-<tageszeit>` (bei gleicher Chance rund um die Uhr ohne Suffix).
// Die Chance ist schon anteilig: Zonenchance × Gewicht / Summe der Gewichte. Höchstens eine je Zonenbesuch und die
// Darstellung als sichtbare Gruppe auf der Karte regelt die Engine (gaps/combat.md).
//
// Fahndung (world.md §10.3) hat noch keine eigene Bedingung: `{ flag: 'fahndung_2' }` heißt „Fahndung ≥ 2“
// (Konvention, bis das System steht; siehe gaps/combat.md).
// Zonen mit `later` (Akt 2–3, Karten und Arenen fehlen noch) erzeugen noch nichts; die Tabelle steht trotzdem hier.
import type { Condition, EncounterDef, TimeSlot } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const SLOTS: readonly TimeSlot[] = ['morgen', 'tag', 'abend', 'nacht'];

interface Entry {
  key: string;
  name: string;
  intro: string;
  enemies: EncounterDef['enemies'];
  weight: number;
  when?: Condition;
  /** Nur zu diesen Tageszeiten (sonst alle mit Zonenchance > 0). */
  slots?: readonly TimeSlot[];
  arena?: string;
  /** Feste Chance rund um die Uhr statt Gewichtsanteil („bei Fahndung ≥ 2 immer“). */
  chance?: number;
}

interface Zone {
  map: string;
  arena: string;
  /** Chance je Betreten für Morgen, Tag, Abend, Nacht (0..1). */
  chance: readonly [number, number, number, number];
  entries: Entry[];
  later?: boolean;
}

const fahndung = (stufe: 1 | 2 | 3): Condition => ({ flag: `fahndung_${stufe}` });
const act2: Condition = { act: 2 };
const act3: Condition = { act: 3 };
// Rostzähne lösen sich mit side-rostzaehne-ende auf (Flag `rostzaehne_aufgeloest`): danach keine Rostzahn-Gruppen mehr.
const ROSTZAEHNE_DA: Condition = { notFlag: 'rostzaehne_aufgeloest' };
const istRostzahn = (enemies: EncounterDef['enemies']) => enemies.some((e) => e.enemy.startsWith('rostzahn'));
const entryWhen = (entry: Entry): Condition | undefined => {
  if (!istRostzahn(entry.enemies)) return entry.when;
  return entry.when ? { all: [entry.when, ROSTZAEHNE_DA] } : ROSTZAEHNE_DA;
};

const ZONES: Zone[] = [
  {
    map: 'neon-gasse', arena: 'arena-strasse', chance: [0, 0, 0.1, 0.25],
    entries: [
      { key: 'abzieher', name: 'Abzieher in der Gasse', weight: 3, enemies: [{ enemy: 'abzieher', count: 2 }],
        intro: 'Zwei Kapuzen lösen sich aus dem Neonschatten. „Hübsche Jacke. Wär schade drum.“' },
      { key: 'rostzaehne', name: 'Rostzähne auf Streife', weight: 2, enemies: [{ enemy: 'rostzahn-schlaeger', count: 2 }],
        intro: 'Leuchtketten klirren. Zwei Rostzähne finden, dass du in ihrem Licht stehst.' },
      { key: 'kalle', name: 'Krawall-Kalle', weight: 1, slots: ['nacht'], when: { job: 'job-kopfgeld' },
        enemies: [{ enemy: 'krawall-kalle' }, { enemy: 'abzieher' }],
        intro: 'Krawall-Kalle kommt aus dem Club geflogen. Ohne Tür. Er sucht jemanden, der ihn wieder reinschlägt.' },
      { key: 'quantum', name: 'Quantum-Streife', weight: 2, when: act2,
        enemies: [{ enemy: 'quantum-wachmann' }, { enemy: 'spaeherdrohne' }],
        intro: 'Eine weiße Rüstung im Neonregen. Die Drohne über ihr scannt Gesichter. Deins gefällt ihr nicht.' },
    ],
  },
  {
    map: 'schrottmarkt', arena: 'arena-hinterhof', chance: [0, 0.05, 0.1, 0.2],
    entries: [
      { key: 'flitzer', name: 'Taschendieb', weight: 3, enemies: [{ enemy: 'strassen-flitzer' }],
        intro: 'Eine Hand in deiner Tasche. Dann ein Grinsen. Dann ein Klappmesserchen.' },
      { key: 'zerleger', name: 'Zerleger auf Teilesuche', weight: 2, enemies: [{ enemy: 'zerleger', count: 2 }],
        intro: 'Zwei Zerleger mustern deine Cyberware wie einen Einkaufszettel.' },
      { key: 'kraehen', name: 'Schrottkrähen auf der Halde', weight: 2, arena: 'arena-schrottplatz',
        enemies: [{ enemy: 'schrottkraehe', count: 2 }],
        intro: 'Auf dem Kran hocken zwei Schrottkrähen. Unten liegt, was sie wollen. Du stehst dazwischen.' },
      { key: 'drohnen', name: 'Schrottdrohnen nachts', weight: 1, slots: ['nacht'], arena: 'arena-schrottplatz',
        enemies: [{ enemy: 'schrottdrohne', count: 2 }],
        intro: 'Dexters Nachtschicht surrt über die Halde. Der Begrüßungsmodus ist aus.' },
    ],
  },
  {
    map: 'loetgassen', arena: 'arena-hinterhof', chance: [0, 0, 0.05, 0.15],
    entries: [
      { key: 'flitzer', name: 'Taschendieb in den Lötgassen', weight: 2, enemies: [{ enemy: 'strassen-flitzer' }],
        intro: 'Zwischen zwei Lötständen huscht jemand an dir vorbei. Leichter als vorher fühlst du dich auch.' },
      { key: 'rostzaehne', name: 'Rostzähne vor dem Imbiss', weight: 1, enemies: [{ enemy: 'rostzahn-schlaeger', count: 2 }],
        intro: '„Der Lötkolben-Imbiss gehört jetzt uns. Du auch, wenn du blöd guckst.“' },
    ],
  },
  {
    map: 'rohrsiedlung', arena: 'arena-hinterhof', chance: [0, 0, 0, 0.1],
    entries: [
      { key: 'ratten', name: 'Ratten am Schacht', weight: 3, enemies: [{ enemy: 'kanalratte', count: 2 }],
        intro: 'Aus dem Gullydeckel quellen zwei Ratten so groß wie Dackel. Sie haben Hunger und schlechte Laune.' },
      { key: 'quantum', name: 'Quantum-Kontrolle', weight: 2, when: act2,
        enemies: [{ enemy: 'quantum-wachmann' }, { enemy: 'spaeherdrohne' }],
        intro: '„Routinekontrolle. Bitte lächeln Sie in die Drohne.“' },
    ],
  },
  {
    map: 'bahnhof-mitte', arena: 'arena-gleise', chance: [0, 0.05, 0.1, 0.25],
    entries: [
      { key: 'abzieher', name: 'Abzieher am Bahnsteig', weight: 3, enemies: [{ enemy: 'abzieher', count: 2 }],
        intro: '„Bahnsteiggebühr.“ – „Gibt’s nicht.“ – „Jetzt schon.“' },
      { key: 'flitzer', name: 'Taschendieb im Gedränge', weight: 2, enemies: [{ enemy: 'strassen-flitzer' }],
        intro: 'Die U-Bahn ist zu spät, die Menge zu dicht. Perfekt für flinke Finger.' },
      { key: 'ratten', name: 'Ratten auf den Gleisen', weight: 1, enemies: [{ enemy: 'kanalratte', count: 3 }],
        intro: 'Im Gleisgraben bewegt sich was. Drei Paar rote Augen. Kein Zug in Sicht.' },
    ],
  },
  {
    map: 'hafenkante', arena: 'arena-hafen', chance: [0, 0.05, 0.15, 0.3],
    entries: [
      { key: 'rostzaehne', name: 'Rostzähne am Kai', weight: 3, enemies: [{ enemy: 'rostzahn-schlaeger', count: 3 }],
        intro: 'Drei Rostzähne, drei Leuchtketten, eine Meinung: Der Hafen gehört ihnen.' },
      { key: 'rostzaehne-zerleger', name: 'Rostzähne mit Zerleger', weight: 2,
        enemies: [{ enemy: 'rostzahn-schlaeger', count: 2 }, { enemy: 'zerleger' }],
        intro: 'Zwei Rostzähne und ein Zerleger teilen gerade eine Kiste auf. Du bist der Rest.' },
      { key: 'depot', name: 'Depotwache', weight: 1, slots: ['nacht'],
        enemies: [{ enemy: 'quantum-wachmann', count: 2 }],
        intro: 'Flutlicht am Quantum-Lieferdepot. „Stehen bleiben! Sie betreten Firmengelände!“' },
      { key: 'drohnen', name: 'Schrottdrohnen am Kran', weight: 1, enemies: [{ enemy: 'schrottdrohne', count: 2 }],
        intro: 'Zwei Schrottdrohnen aus Dexters alter Serie haben sich am Kran eingenistet. Sie werfen mit Schrauben.' },
    ],
  },
  {
    map: 'stufenplatz', arena: 'arena-strasse', chance: [0, 0, 0, 0.1],
    entries: [
      { key: 'ordnungshueter', name: 'Ordnungshüter auf Streife', weight: 0, chance: 1, when: fahndung(2),
        enemies: [{ enemy: 'ordnungshueter' }],
        intro: '„Ausweis. Und dann die Hände so, dass ich sie sehe.“ Ein Ordnungshüter mit sehr viel Vorschrift im Blick.' },
      { key: 'quantum', name: 'Quantum-Doppelstreife', weight: 2, when: act2,
        enemies: [{ enemy: 'quantum-wachmann', count: 2 }],
        intro: 'Zwei Quantum-Wachleute vor der Treppe. Einer tippt auf seinen Scanner. „Treffer.“' },
    ],
  },
  {
    map: 'glasarkaden', arena: 'arena-strasse', chance: [0, 0, 0, 0],
    entries: [
      { key: 'ordnungshueter', name: 'Ordnungshüter in den Arkaden', weight: 0, chance: 0.5, when: fahndung(2),
        enemies: [{ enemy: 'ordnungshueter', count: 2 }],
        intro: 'Zwischen Boutiquen und Glas: zwei Ordnungshüter, die dein Gesicht von einem Fahndungsbild kennen.' },
    ],
  },
  {
    map: 'eisenhof', arena: 'arena-hinterhof', chance: [0, 0, 0, 0.05],
    entries: [
      { key: 'ordnungshueter', name: 'Ordnungshüter am Gericht', weight: 0, chance: 0.25, when: fahndung(2),
        enemies: [{ enemy: 'ordnungshueter' }],
        intro: '„Na, wen haben wir denn da? Steht da nicht was über dich in meinem Tablet?“' },
    ],
  },
  {
    map: 'digitech-areal', arena: 'arena-schrottplatz', chance: [0, 0.1, 0.15, 0.2],
    entries: [
      { key: 'pluenderer', name: 'Plünderer mit Späher', weight: 3,
        enemies: [{ enemy: 'schrottkraehe', count: 2 }, { enemy: 'spaeherdrohne' }],
        intro: 'Zwei Schrottkrähen und eine geklaute Späherdrohne. Die Ruine ist ihr Supermarkt.' },
      { key: 'waechter', name: 'Wächter im Keller', weight: 2, arena: 'arena-labor-ruine',
        enemies: [{ enemy: 'digitech-waechter', count: 2 }],
        intro: '„ZUTRITT NUR FÜR MITARBEITER.“ Zwei uralte Wächter klappern aus dem Dunkel.' },
    ],
  },
  {
    map: 'kanal-sammler', arena: 'arena-kanal', chance: [0.2, 0.2, 0.2, 0.2],
    entries: [
      { key: 'ratten', name: 'Rattenrudel', weight: 3, enemies: [{ enemy: 'kanalratte', count: 3 }],
        intro: 'Drei Kanalratten XL blockieren den Steg. Eine trägt einen Kronkorken wie ein Abzeichen.' },
      { key: 'schwarm', name: 'Rattenschwarm', weight: 2, enemies: [{ enemy: 'rattenschwarm' }],
        intro: 'Das Rascheln wird zum Rauschen. Das Rauschen hat Zähne.' },
      { key: 'mutant', name: 'Ratten-Mutant', weight: 1, enemies: [{ enemy: 'ratten-mutant' }, { enemy: 'kanalratte', count: 2 }],
        intro: 'Zwei Ratten und etwas, das mal eine war. Der Geruch kommt vor dem Kampf.' },
      { key: 'rohrkriecher', name: 'Rohrkriecher', weight: 1, enemies: [{ enemy: 'rohrkriecher' }],
        intro: 'Ein Putzroboter so groß wie ein Kleinwagen schrubbt den Steg. Du bist Schmutz.' },
    ],
  },
  {
    map: 'flutmauer', arena: 'arena-hafen', chance: [0.05, 0.05, 0.05, 0.2],
    entries: [
      { key: 'hunde', name: 'Robohunde im Schlick', weight: 3,
        when: { not: { quest: 'side-hunde-der-brackbucht', state: 'done' } },
        enemies: [{ enemy: 'robohund', count: 2 }],
        intro: 'Leuchtende Augen im Schlick. Zwei ausgemusterte Quantum-Hunde wedeln. Nicht freundlich.' },
      { key: 'rostzaehne', name: 'Rostzähne an der Mauer', weight: 2, enemies: [{ enemy: 'rostzahn-schlaeger', count: 2 }],
        intro: 'Zwei Rostzähne sprühen ihr Zeichen an die Wand der Freiheit. Sie mögen keine Zeugen.' },
      { key: 'ratten', name: 'Ratten aus dem Schlick', weight: 1, enemies: [{ enemy: 'kanalratte', count: 3 }],
        intro: 'Der Schlick blubbert. Drei Ratten tauchen auf, nass und beleidigt.' },
    ],
  },

  // --- Akt 2–3 (Karten und Arenen folgen) ---------------------------------
  {
    map: 'chrome-boulevard', arena: 'arena-strasse', chance: [0, 0, 0, 0.05], later: true,
    entries: [
      { key: 'ordnungshueter', name: 'Ordnungshüter am Boulevard', weight: 1, when: fahndung(1),
        enemies: [{ enemy: 'ordnungshueter', count: 2 }], intro: '„In der Oberstadt rennt man nicht. Man wird gefahren. Ins Revier.“' },
    ],
  },
  {
    map: 'quantum-campus', arena: 'arena-labor-quantum', chance: [0.25, 0.25, 0.25, 0.25], later: true,
    entries: [
      { key: 'patrouille', name: 'Campus-Patrouille', weight: 3, enemies: [{ enemy: 'quantum-wachmann', count: 2 }, { enemy: 'spaeherdrohne' }],
        intro: 'Eine Patrouille im Gleichschritt. Die Drohne vorneweg piept fröhlich.' },
      { key: 'schild', name: 'Schild und Schraubenzieher', weight: 2, enemies: [{ enemy: 'quantum-schildtraeger' }, { enemy: 'quantum-techniker' }],
        intro: 'Ein Schildträger und eine Technikerin. Einer hält, die andere repariert.' },
      { key: 'scharfschuetze', name: 'Scharfschütze auf dem Turm', weight: 1, enemies: [{ enemy: 'quantum-scharfschuetze' }],
        intro: 'Ein roter Punkt auf deiner Brust. Er kommt von sehr weit oben.' },
      { key: 'garde', name: 'Venom-Garde', weight: 2, when: act3, enemies: [{ enemy: 'venom-garde' }, { enemy: 'gechippte-wache', count: 2 }],
        intro: 'Xions Garde, flankiert von Wachen mit leeren Augen.' },
    ],
  },
  {
    map: 'himmelsgarten', arena: 'arena-partysaal', chance: [0.3, 0.3, 0.3, 0.3], later: true,
    entries: [
      { key: 'gaeste', name: 'Gechippte Gäste', weight: 3, enemies: [{ enemy: 'gechippter-partygast', count: 3 }],
        intro: 'Drei Gäste drehen sich gleichzeitig um. „Master lässt grüßen.“' },
      { key: 'wachen', name: 'Gechippte Wachen mit Sanitätsdrohne', weight: 2, enemies: [{ enemy: 'gechippte-wache', count: 2 }, { enemy: 'sanidrohne' }],
        intro: 'Zwei Wachen, eine Drohne, null Mitgefühl.' },
    ],
  },
  {
    map: 'pumpwerk-sieben', arena: 'arena-rohre', chance: [0.25, 0.25, 0.25, 0.25], later: true,
    entries: [
      { key: 'molch', name: 'Kabelmolch mit Ratten', weight: 3, enemies: [{ enemy: 'kabelmolch' }, { enemy: 'kanalratte', count: 2 }],
        intro: 'Ein Molch, der Funken frisst, und zwei Ratten, die ihm die Reste klauen.' },
      { key: 'kriecher', name: 'Zwei Rohrkriecher', weight: 2, enemies: [{ enemy: 'rohrkriecher', count: 2 }],
        intro: 'Zwei Putzroboter. Doppelt sauber, doppelt gemein.' },
      { key: 'aussenstelle', name: 'Quantum-Außenstelle', weight: 1, enemies: [{ enemy: 'quantum-techniker' }, { enemy: 'geschuetzdrohne' }],
        intro: 'Eine Technikerin repariert eine Geschützdrohne. Die Drohne ist fertig. Mit dir gleich auch.' },
    ],
  },
  {
    map: 'datentunnel', arena: 'arena-rohre', chance: [0.25, 0.25, 0.25, 0.25], later: true,
    entries: [
      { key: 'programme', name: 'Sicherheitsprogramme', weight: 3, enemies: [{ enemy: 'sicherheitsprogramm', count: 2 }],
        intro: 'Zwei Lichtgestalten aus Code. Sie fragen nach deinem Passwort. Mit Stichwaffen.' },
      { key: 'drohnen', name: 'Späher und Störsender', weight: 2, enemies: [{ enemy: 'spaeherdrohne', count: 2 }, { enemy: 'stoerdrohne' }],
        intro: 'Rauschen im Ohr, Lichter im Tunnel.' },
    ],
  },
  {
    map: 'staubstrasse', arena: 'arena-duenen', chance: [0, 0.15, 0.15, 0.25], later: true,
    entries: [
      { key: 'falken', name: 'Staubfalken', weight: 3, when: { not: { quest: 'side-oednis-frieden', state: 'done' } },
        enemies: [{ enemy: 'staubfalke', count: 3 }], intro: 'Drei Motorräder aus Staub. „Wegzoll. Oder eine gute Geschichte.“' },
      { key: 'kraehen', name: 'Schrottkrähen am Straßenrand', weight: 1, enemies: [{ enemy: 'schrottkraehe', count: 2 }],
        intro: 'Zwei Schrottkrähen haben ein Wrack ausgeweidet und suchen Nachschub.' },
    ],
  },
  {
    map: 'aussiedlerhof', arena: 'arena-duenen', chance: [0, 0, 0, 0.2], later: true,
    entries: [
      { key: 'skorpione', name: 'Glasskorpione am Zaun', weight: 3, enemies: [{ enemy: 'glasskorpion', count: 2 }],
        intro: 'Am Zaun funkelt es. Zwei Skorpione aus Glas, schön wie Kronleuchter, tödlich wie Rechnungen.' },
    ],
  },
  {
    map: 'funkturm-ruine', arena: 'arena-duenen', chance: [0, 0.15, 0.15, 0.1], later: true,
    entries: [
      { key: 'windraeder', name: 'Windrad-Drohnen', weight: 3, enemies: [{ enemy: 'windrad-drohne', count: 2 }],
        intro: 'Zwei Windrad-Drohnen kreisen um den Turm wie wütende Ventilatoren.' },
      { key: 'gemischt', name: 'Windrad und Krähen', weight: 1, enemies: [{ enemy: 'windrad-drohne' }, { enemy: 'schrottkraehe', count: 2 }],
        intro: 'Krähen reiten auf den Böen einer Windrad-Drohne.' },
    ],
  },
  {
    map: 'glasduenen', arena: 'arena-duenen', chance: [0, 0.2, 0.2, 0.3], later: true,
    entries: [
      { key: 'skorpione', name: 'Zwei Glasskorpione', weight: 3, enemies: [{ enemy: 'glasskorpion', count: 2 }],
        intro: 'Die Dünen klirren. Zwei Skorpione stehen auf.' },
      { key: 'nest', name: 'Glasskorpion-Nest', weight: 1, enemies: [{ enemy: 'glasskorpion', count: 3 }],
        intro: 'Drei. Es sind drei. Und eins davon ist sehr wütend über deinen Schatten.' },
      { key: 'falken', name: 'Staubfalken in den Dünen', weight: 1, enemies: [{ enemy: 'staubfalke', count: 2 }],
        intro: 'Zwei Staubfalken tauchen über dem Kamm auf.' },
    ],
  },
];

const SLOT_NAME: Record<TimeSlot, string> = { morgen: 'morgens', tag: 'tagsüber', abend: 'abends', nacht: 'nachts' };
const round3 = (x: number) => Math.round(x * 1000) / 1000;

function build(): Record<string, EncounterDef> {
  const out: Record<string, EncounterDef> = {};
  for (const zone of ZONES) {
    if (zone.later) continue;
    const total = zone.entries.reduce((sum, e) => sum + e.weight, 0);
    for (const entry of zone.entries) {
      const base = (): Omit<EncounterDef, 'id' | 'random'> => ({
        name: entry.name,
        arena: entry.arena ?? zone.arena,
        enemies: entry.enemies,
        intro: [{ speaker: 'narrator', text: entry.intro }],
        ...(entryWhen(entry) ? { when: entryWhen(entry) } : {}),
      });
      const prefix = `enc-zufall-${zone.map}-${entry.key}`;
      if (entry.chance !== undefined) {
        out[prefix] = { id: prefix, ...base(), random: { maps: [zone.map], chance: entry.chance } };
        continue;
      }
      const slots = SLOTS.filter((slot, i) => zone.chance[i] > 0 && (!entry.slots || entry.slots.includes(slot)));
      if (!slots.length || !total) continue;
      const chances = slots.map((slot) => round3((zone.chance[SLOTS.indexOf(slot)] * entry.weight) / total));
      if (slots.length === SLOTS.length && chances.every((c) => c === chances[0])) {
        out[prefix] = { id: prefix, ...base(), random: { maps: [zone.map], chance: chances[0] } };
        continue;
      }
      slots.forEach((slot, i) => {
        const id = `${prefix}-${slot}`;
        out[id] = { id, ...base(), name: `${entry.name} (${SLOT_NAME[slot]})`, random: { maps: [zone.map], time: [slot], chance: chances[i] } };
      });
    }
  }
  return out;
}

export const RANDOM_ENCOUNTERS = build();

export const part: ContentPart = { encounters: RANDOM_ENCOUNTERS };
