// Zufallsbegegnungen der Akt-2/3-Zonen und des Nachspiels (world.md §8.7). Gleiches Schema wie parts/combat/random.ts:
// Chance je Tageszeit (M/T/A/N) × Gewicht des Eintrags; je Eintrag und Tageszeit eine Begegnung
// `enc-zufall-<zone>-<eintrag>[-<tageszeit>]`. Höchstens eine je Kartenbesuch, sichtbar und umgehbar regelt die Engine.
// parts/combat/random.ts führt dieselben Zonen mit `later: true` (erzeugt dort nichts) – die Begegnungen entstehen hier.
// `das-meer` hat 0 % (nur `enc-strand-staubfalken`, fest in encounters-nachspiel.ts).
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
  slots?: readonly TimeSlot[];
  arena?: string;
  /** Feste Chance rund um die Uhr statt Gewichtsanteil. */
  chance?: number;
}

interface Zone {
  map: string;
  arena: string;
  chance: readonly [number, number, number, number];
  entries: Entry[];
}

const fahndung = (stufe: 1 | 2 | 3): Condition => ({ flag: `fahndung_${stufe}` });
const act3: Condition = { act: 3 };
// Nachspiel: Flag `epilog` (gesetzt mit dem Ende, design.md §3.8 Passantensprüche nutzen dasselbe Flag).
const epilog: Condition = { flag: 'epilog' };
// Staubfalken lassen dich in Ruhe nach dem Frieden oder mit Krähes freiem Geleit.
const falkenFeindlich: Condition = {
  all: [
    { not: { quest: 'side-oednis-frieden', state: 'done' } },
    { not: { quest: 'side-kraehes-ehre', state: 'done' } },
  ],
};

const ZONES: Zone[] = [
  {
    map: 'chrome-boulevard', arena: 'arena-strasse', chance: [0, 0, 0, 0.05],
    entries: [
      { key: 'ordnungshueter', name: 'Ordnungshüter am Boulevard', weight: 0, chance: 0.3, when: fahndung(1),
        enemies: [{ enemy: 'ordnungshueter', count: 2 }],
        intro: '„In der Oberstadt rennt man nicht. Man wird gefahren. Ins Revier.“ Zwei Ordnungshüter ziehen die Handschuhe straff.' },
      { key: 'blech-schwestern', name: 'Die Blech-Schwestern', weight: 1, slots: ['nacht'], when: { job: 'job-kopfgeld' },
        enemies: [{ enemy: 'blech-schwester-blau' }, { enemy: 'blech-schwester-rot' }],
        intro: 'Zwei Damen in gebürsteter Alufolie hängen kopfüber vor einem Juwelierfenster. „Kein Wort, Schätzchen. Wir sind die ECHTEN Chrome-Schwestern.“' },
    ],
  },
  {
    map: 'quantum-campus', arena: 'arena-labor-quantum', chance: [0.25, 0.25, 0.25, 0.25],
    entries: [
      { key: 'patrouille', name: 'Campus-Patrouille', weight: 3, enemies: [{ enemy: 'quantum-wachmann', count: 2 }, { enemy: 'spaeherdrohne' }],
        intro: 'Eine Patrouille im Gleichschritt. Die Drohne vorneweg piept fröhlich: „Unbekanntes Gesicht. Unbekanntes Gesicht wird bekannt gemacht.“' },
      { key: 'schild', name: 'Schild und Schraubenzieher', weight: 2, enemies: [{ enemy: 'quantum-schildtraeger' }, { enemy: 'quantum-techniker' }],
        intro: 'Ein Schildträger und eine Technikerin. Er hält, sie repariert. Zusammen nennen sie das „Teambuilding“.' },
      { key: 'scharfschuetze', name: 'Scharfschütze auf dem Turm', weight: 1, enemies: [{ enemy: 'quantum-scharfschuetze' }, { enemy: 'spaeherdrohne' }],
        intro: 'Ein roter Punkt wandert über deine Brust. Er kommt von sehr weit oben und hat sehr schlechte Absichten.' },
      { key: 'garde', name: 'Venom-Garde', weight: 2, when: act3, enemies: [{ enemy: 'venom-garde' }, { enemy: 'gechippte-wache', count: 2 }],
        intro: 'Xions Garde, flankiert von Wachen mit leeren Augen. „Master lässt fragen, ob Sie eingeladen sind.“' },
    ],
  },
  {
    map: 'himmelsgarten', arena: 'arena-partysaal', chance: [0.3, 0.3, 0.3, 0.3],
    entries: [
      { key: 'gaeste', name: 'Gechippte Gäste', weight: 3, enemies: [{ enemy: 'gechippter-partygast', count: 3 }],
        intro: 'Drei Gäste in Abendgarderobe drehen sich gleichzeitig um, Sektgläser im exakt gleichen Winkel. „Master lässt grüßen.“' },
      { key: 'wachen', name: 'Gechippte Wachen mit Sanitätsdrohne', weight: 2, enemies: [{ enemy: 'gechippte-wache', count: 2 }, { enemy: 'sanidrohne' }],
        intro: 'Zwei Wachen, eine Sanitätsdrohne, null Mitgefühl. Die Drohne hat schon mal Pflaster für dich rausgelegt.' },
    ],
  },
  {
    map: 'pumpwerk-sieben', arena: 'arena-rohre', chance: [0.25, 0.25, 0.25, 0.25],
    entries: [
      { key: 'molch', name: 'Kabelmolch mit Ratten', weight: 3, enemies: [{ enemy: 'kabelmolch' }, { enemy: 'kanalratte', count: 2 }],
        intro: 'Ein Molch, der Funken frisst, und zwei Ratten, die ihm die Reste klauen. Alle drei finden dich lecker.' },
      { key: 'kriecher', name: 'Zwei Rohrkriecher', weight: 2, enemies: [{ enemy: 'rohrkriecher', count: 2 }],
        intro: 'Zwei Putzroboter. Doppelt sauber, doppelt gemein. Du bist für sie ein Fleck.' },
      { key: 'aussenstelle', name: 'Quantum-Außenstelle', weight: 1, enemies: [{ enemy: 'quantum-techniker' }, { enemy: 'geschuetzdrohne' }],
        intro: 'Eine Technikerin schraubt an einer Geschützdrohne. Die Drohne ist fertig. Mit dir gleich auch.' },
    ],
  },
  {
    map: 'datentunnel', arena: 'arena-rohre-datentunnel', chance: [0.25, 0.25, 0.25, 0.25],
    entries: [
      { key: 'programme', name: 'Sicherheitsprogramme', weight: 3, enemies: [{ enemy: 'sicherheitsprogramm', count: 2 }],
        intro: 'Zwei Lichtgestalten aus Code. Sie fragen nach deinem Passwort. Mit Stichwaffen. Nur Hacks und Smart-Waffen tun ihnen weh.' },
      { key: 'drohnen', name: 'Späher und Störsender', weight: 2, enemies: [{ enemy: 'spaeherdrohne', count: 2 }, { enemy: 'stoerdrohne' }],
        intro: 'Rauschen im Ohr, Lichter im Tunnel. Die Störsender-Drohne frisst dir die Bandbreite weg.' },
      { key: 'splitter', name: 'Nexus-Splitter', weight: 1, when: epilog, enemies: [{ enemy: 'nexus-splitter' }],
        intro: 'Ein Gesicht flackert über die Serverschränke, zerrissen und wütend. „Ihr Menschen seid ineffizient.“' },
    ],
  },
  {
    map: 'staubstrasse', arena: 'arena-duenen', chance: [0, 0.15, 0.15, 0.25],
    entries: [
      { key: 'falken', name: 'Staubfalken', weight: 3, when: falkenFeindlich, enemies: [{ enemy: 'staubfalke', count: 3 }],
        intro: 'Drei Motorräder aus Staub und Rost. „Wegzoll. Oder eine gute Geschichte. Oder deine Schuhe.“' },
      { key: 'kraehen', name: 'Schrottkrähen am Straßenrand', weight: 1, enemies: [{ enemy: 'schrottkraehe', count: 2 }],
        intro: 'Zwei Schrottkrähen haben ein Wrack ausgeweidet und suchen Nachschub. Du siehst nach Nachschub aus.' },
    ],
  },
  {
    map: 'aussiedlerhof', arena: 'arena-duenen', chance: [0, 0, 0, 0.2],
    entries: [
      { key: 'skorpione', name: 'Glasskorpione am Zaun', weight: 3, enemies: [{ enemy: 'glasskorpion', count: 2 }],
        intro: 'Am Zaun klirrt es. Zwei Glasskorpione funkeln im Mondlicht und wollen an die Hühner. Oder an dich.' },
    ],
  },
  {
    map: 'funkturm-ruine', arena: 'arena-duenen', chance: [0, 0.15, 0.15, 0.1],
    entries: [
      { key: 'windraeder', name: 'Windrad-Drohnen', weight: 3, enemies: [{ enemy: 'windrad-drohne', count: 2 }],
        intro: 'Zwei Windrad-Drohnen kreisen um den Turm wie wütende Ventilatoren auf Speed.' },
      { key: 'gemischt', name: 'Windrad und Krähen', weight: 1, enemies: [{ enemy: 'windrad-drohne' }, { enemy: 'schrottkraehe', count: 2 }],
        intro: 'Zwei Schrottkrähen reiten auf den Böen einer Windrad-Drohne. Sie haben Spaß. Du gleich nicht.' },
    ],
  },
  {
    map: 'glasduenen', arena: 'arena-duenen', chance: [0, 0.2, 0.2, 0.3],
    entries: [
      { key: 'skorpione', name: 'Zwei Glasskorpione', weight: 3, enemies: [{ enemy: 'glasskorpion', count: 2 }],
        intro: 'Die Düne klirrt. Zwei Skorpione aus Glas stehen auf und brechen das Licht in hässliche Farben.' },
      { key: 'nest', name: 'Glasskorpion-Nest', weight: 1, enemies: [{ enemy: 'glasskorpion', count: 3 }],
        intro: 'Drei. Es sind drei. Und einer davon ist sehr wütend über deinen Schatten.' },
      { key: 'falken', name: 'Staubfalken in den Dünen', weight: 1, when: falkenFeindlich, enemies: [{ enemy: 'staubfalke', count: 2 }],
        intro: 'Zwei Staubfalken tauchen über dem Kamm auf, Bolzenschleudern gespannt. „Die Dünen kosten extra.“' },
    ],
  },
];

const SLOT_NAME: Record<TimeSlot, string> = { morgen: 'morgens', tag: 'tagsüber', abend: 'abends', nacht: 'nachts' };
const round3 = (x: number) => Math.round(x * 1000) / 1000;

function build(): Record<string, EncounterDef> {
  const out: Record<string, EncounterDef> = {};
  for (const zone of ZONES) {
    const total = zone.entries.reduce((sum, e) => sum + e.weight, 0);
    for (const entry of zone.entries) {
      const base = (): Omit<EncounterDef, 'id' | 'random'> => ({
        name: entry.name,
        arena: entry.arena ?? zone.arena,
        enemies: entry.enemies,
        intro: [{ speaker: 'narrator', text: entry.intro }],
        ...(entry.when ? { when: entry.when } : {}),
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

export const RANDOM_ENCOUNTERS_23 = build();

export const part: ContentPart = { encounters: RANDOM_ENCOUNTERS_23 };
