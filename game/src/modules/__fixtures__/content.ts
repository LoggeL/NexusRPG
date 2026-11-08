// Kleine, eigenständige Testinhalte für die Modultests (unabhängig von content/).
import type { GameContent, MapDef, Polygon, SaveStoragePort } from '../contracts';

const rect = (x: number, y: number, w: number, h: number): Polygon => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];

function map(id: string, extra: Partial<MapDef> = {}): MapDef {
  return {
    id,
    name: id,
    size: [1536, 1024],
    district: 'unterstadt',
    lighting: 'outdoor',
    bg: `bg-${id}`,
    walk: [rect(40, 40, 1456, 944)],
    exits: [],
    entries: { start: { at: [200, 500], facing: 'e' }, tor: { at: [1400, 500], facing: 'w' } },
    spots: { bar: { at: [700, 400], facing: 's' } },
    hotspots: [],
    ambience: 'unterstadt',
    ...extra,
  };
}

const stats = (hp: number) => ({
  hp, armor: 1, attributes: { technik: 3, koerper: 4, reflexe: 5, ausstrahlung: 3, strasse: 4 },
  weapon: { kind: 'nahkampf' as const, damage: 4, range: 1 }, abilities: ['klingenwirbel'],
});

export function fixtureContent(): GameContent {
  return {
    meta: { id: 'fixture', title: 'Modultest', test: true },
    maps: {
      gasse: map('gasse', { station: 'linie-gasse', exits: [{ id: 'tor', rect: [1480, 400, 56, 200], to: 'bar', entry: 'start', label: 'Zur Bar' }] }),
      bar: map('bar', { size: [1024, 768], lighting: 'indoor', walk: [rect(40, 40, 944, 688)], entries: { start: { at: [100, 400], facing: 'e' } }, bed: { at: [500, 500] } }),
    },
    districts: { unterstadt: { id: 'unterstadt', name: 'Unterstadt' } },
    stations: {
      'linie-gasse': { id: 'linie-gasse', name: 'Gasse', map: 'gasse', entry: 'start', cityPos: [0.3, 0.6] },
      'linie-bar': { id: 'linie-bar', name: 'Bar', map: 'bar', entry: 'start', cityPos: [0.5, 0.5] },
    },
    dialogues: {
      raven: {
        id: 'raven', start: 'a', nodes: [
          {
            id: 'a',
            lines: [{ speaker: 'raven', text: 'Komm zum Punkt, {name}.' }, { speaker: 'player', text: 'Gleich.' }],
            effects: [{ give: 'kaffee' }],
            choices: [
              { text: 'Ich sehe mir den Chip an.', check: 'chip', next: 'chip', effects: [{ setFlag: 'chip-gesehen' }] },
              { text: 'Geheim', check: 'geheim', next: 'chip' },
              { text: 'Du hasst Handschellen.', requires: { hearts: 'raven', min: 6 }, tag: '[Raven ♥6]', next: 'chip' },
              { text: 'Wie heißt du?', next: 'name', once: true },
              { text: 'Tschüss.', effects: [{ sfx: 'door' }] },
            ],
          },
          { id: 'name', lines: [{ speaker: 'raven', portrait: 'angry', text: 'Raven.' }], effects: [{ setFlag: 'raven-known' }], next: 'a' },
          { id: 'chip', lines: [{ speaker: 'narrator', text: 'Der Chip glimmt.' }] },
        ],
      },
      'raven-tag': { id: 'raven-tag', start: 'a', nodes: [{ id: 'a', lines: [{ speaker: 'raven', text: 'Hm.' }] }] },
      'raven-nah': { id: 'raven-nah', start: 'a', nodes: [{ id: 'a', lines: [{ speaker: 'raven', text: 'Schön, dich zu sehen.' }] }] },
      schleife: { id: 'schleife', start: 'x', nodes: [{ id: 'x', lines: [], next: 'y' }, { id: 'y', lines: [], next: 'x' }] },
    },
    cutscenes: {
      intro: { id: 'intro', beats: [{ image: 'cut-intro', pan: 'in', caption: 'Noxius, 2086.' }] },
      schwarz: { id: 'schwarz', beats: [{ image: 'black', caption: 'Stille.' }] },
    },
    items: {
      kaffee: { id: 'kaffee', name: 'Synth-Kaffee', description: 'Heiß.', category: 'verbrauch', icon: 'kaffee', price: 10, giftTags: ['essen'], use: { label: 'Trinken', heal: 10 } },
      messer: { id: 'messer', name: 'Wurfmesser', description: 'Poliert.', category: 'waffe', icon: 'messer', price: 120, weapon: { kind: 'nahkampf', damage: 5, range: 1 } },
      jacke: { id: 'jacke', name: 'Lederjacke', description: 'Warm.', category: 'kleidung', icon: 'jacke', price: 200, wear: { attributes: { koerper: 1 } } },
      dietrich: { id: 'dietrich', name: 'Dietrich-Set', description: 'Klick.', category: 'sammeln', icon: 'dietrich', price: 50, checkBonus: [{ tags: ['schloss'], value: 2 }] },
      chip: { id: 'chip', name: 'Chip', description: 'Wichtig.', category: 'quest', icon: 'chip', price: 0 },
      handschellen: { id: 'handschellen', name: 'Handschellen', description: 'Kalt.', category: 'geschenk', icon: 'handschellen', price: 30 },
      'optik-teil': { id: 'optik-teil', name: 'Optik-Implantat', description: 'Scharf.', category: 'cyberware', icon: 'optik', price: 300, cyberware: 'optik' },
    },
    npcs: {
      raven: {
        id: 'raven', name: 'Raven', unknownName: 'Frau in Schwarz', knownFlag: 'raven-known', portrait: 'raven', portraits: { wut: 'raven-wut' },
        sprite: 'raven-walk', faction: 'crew', romanceable: true,
        gifts: { loves: ['messer'], likes: ['#essen'], hates: ['handschellen'] },
        giftVariants: [{ when: { flag: 'raven-kaffee-satt' }, gifts: { dislikes: ['kaffee'] } }],
        schedule: [
          { slot: 'abend', days: ['do'], place: { map: 'bar', at: [300, 300] } },
          { slot: ['morgen', 'tag'], place: { map: 'gasse', at: 'bar', facing: 'w' } },
          { slot: 'abend', place: { map: 'bar', at: [600, 400] } },
          { place: 'away' },
        ],
        heartEvents: [{ id: 'he-raven-2', hearts: 2, map: 'gasse', time: 'tag', dialogue: 'raven-nah', effects: [{ setFlag: 'he-raven-2-done' }] }],
        companion: { stats: stats(30) },
        talk: [{ dialogue: 'raven-nah', minHearts: 4 }, { dialogue: 'raven-tag' }],
      },
      dante: {
        id: 'dante', name: 'Dante', portrait: 'dante', sprite: 'dante-walk', faction: 'crew',
        companion: { recruit: { flag: 'dante-frei' }, stats: stats(28) },
        schedule: [{ place: { map: 'bar', at: 'nirgends' } }],
      },
      daria: { id: 'daria', name: 'Daria', portrait: 'daria', sprite: 'daria-walk', child: true, schedule: [{ slot: 'nacht', place: 'away' }, { place: { map: 'gasse', at: [900, 600] } }] },
      ripper: { id: 'ripper', name: 'Ripper', portrait: 'ripper', sprite: 'ripper-walk', companion: { stats: stats(20) } },
    },
    checks: {
      chip: { id: 'chip', attribute: 'technik', threshold: 6, tags: ['hacken'] },
      schloss: { id: 'schloss', attribute: 'reflexe', threshold: 6, tags: ['schloss'], bonuses: [{ when: { hearts: 'raven', min: 4 }, value: 1, label: 'Ravens Griff' }] },
      geheim: { id: 'geheim', attribute: 'strasse', threshold: 9, hiddenIfFailed: true },
    },
    perks: {
      bastler: { id: 'bastler', name: 'Bastler', description: '+1 auf Hacken.', attribute: 'technik', min: 4, checkBonus: [{ tags: ['hacken'], value: 1 }], shopDiscount: 10 },
      charmant: { id: 'charmant', name: 'Charmant', description: 'Geschenke wirken stärker.', attribute: 'ausstrahlung', min: 6, giftBonus: 50 },
    },
    cyberware: {
      optik: { id: 'optik', name: 'Optik-Implantat', slot: 'augen', description: '+1 Reflexe.', attributes: { reflexe: 1 }, item: 'optik-teil' },
      reflexbooster: { id: 'reflexbooster', name: 'Reflexbooster', slot: 'augen', description: '+2 Reflexe.', attributes: { reflexe: 2 } },
    },
    origins: {
      gosse: { id: 'gosse', name: 'Gossenkind', description: 'Unterstadt.', bonus: 'strasse', tag: '[Gosse]', items: { kaffee: 2 }, credits: 50, rep: { unterstadt: 10 } },
      knast: { id: 'knast', name: 'Knastvogel', description: 'Frisch raus.', bonus: 'koerper', tag: '[Knast]', relations: { raven: 200 } },
    },
    looks: { a: { id: 'a', name: 'Aussehen A', sprite: 'player-a-walk', portrait: 'player-a' } },
    factions: { crew: { id: 'crew', name: 'Crew' }, unterstadt: { id: 'unterstadt', name: 'Unterstadt' } },
    quests: {
      ankunft: {
        id: 'ankunft', kind: 'main', title: 'Neu in Noxius', act: 1, autoStart: { flag: 'angekommen' },
        steps: [
          { id: 'bar', text: 'Geh in die Bar.', done: { visited: 'bar' }, marker: { map: 'bar' } },
          { id: 'raven', text: 'Sprich mit Raven.', done: { met: 'raven' } },
          { id: 'extra', text: 'Trink einen Kaffee (optional).', done: { flag: 'kaffee-getrunken' }, optional: true },
        ],
        reward: { xp: 100, credits: 25, relations: { raven: 30 } },
      },
      chip: {
        id: 'chip', kind: 'side', title: 'Der Chip', fail: { flag: 'chip-verloren' },
        steps: [{ id: 'finden', text: 'Finde den Chip.', done: { any: [{ item: 'chip' }, { flag: 'chip-gesehen' }] } }],
        reward: { items: { messer: 1 } },
      },
    },
    jobs: {
      kurier: {
        id: 'kurier', kind: 'kurier', title: 'Paket nach {ziel}', text: '{credits} Credits.', boards: ['tafel'],
        targets: [{ map: 'bar', label: 'Bar' }, { map: 'gasse', label: 'Gasse' }], item: 'chip', reward: { credits: [40, 80], xp: 20, rep: { unterstadt: 2 } },
      },
      kopfgeld: {
        id: 'kopfgeld', kind: 'kopfgeld', title: 'Kopfgeld: {ziel}', text: 'Erledigen.', boards: ['tafel'],
        targets: [{ map: 'gasse', label: 'Schläger' }], reward: { credits: [100, 100], xp: 40 },
      },
      kanal: { id: 'kanal', kind: 'datenraub', title: 'Kanal', text: '', boards: ['andere'], targets: [{ map: 'gasse', label: 'x' }], reward: { credits: [1, 2], xp: 1 } },
    },
    shops: {
      kiosk: {
        id: 'kiosk', name: 'Kiosk', faction: 'unterstadt', open: { time: ['morgen', 'tag'] },
        stock: [{ item: 'kaffee', qty: 3 }, { item: 'messer', price: 100 }, { item: 'jacke', when: { act: 2 } }],
      },
    },
    encounters: {
      schlaeger: {
        id: 'schlaeger', name: 'Schläger', arena: 'strasse', enemies: [{ enemy: 'schlaeger', count: 2 }],
        reward: { xp: 50, credits: 30 }, onWin: [{ setFlag: 'schlaeger-besiegt' }], onLose: [{ setFlag: 'schlaeger-verloren' }],
      },
    },
    arenas: {
      strasse: {
        id: 'strasse', name: 'Straße', bg: 'arena-strasse',
        layout: ['P..........E', 'P...h......E', '....#.......', '....H...~...', '............', '..h.........', '............', '............'],
      },
    },
    enemies: {
      schlaeger: { id: 'schlaeger', name: 'Schläger', level: 1, stats: stats(14), ai: 'aggressiv', xp: 10, credits: [5, 10], loot: [{ item: 'kaffee', chance: 0.5 }] },
    },
    abilities: {
      klingenwirbel: { id: 'klingenwirbel', name: 'Klingenwirbel', description: 'Trifft alle angrenzenden Gegner.', kind: 'nahkampf', ap: 2, target: 'area', range: 1, radius: 1, damage: 3, attribute: 'koerper' },
    },
    news: {
      morgen: { id: 'morgen', anchor: 'raven', headline: 'Guten Morgen', lines: [{ speaker: 'raven', text: 'Wetter: Smog.' }] },
      eilmeldung: { id: 'eilmeldung', anchor: 'raven', headline: 'Eilmeldung', lines: [{ speaker: 'raven', text: 'Einbruch!' }], when: { flag: 'einbruch' }, priority: 5 },
    },
    phone: {
      hallo: { id: 'hallo', from: 'raven', text: 'Wo bleibst du?', auto: { hearts: 'raven', min: 2 }, effects: [{ relation: 'raven', delta: 5 }], replies: [{ text: 'Komme!', effects: [{ setFlag: 'antwort' }] }] },
      manuell: { id: 'manuell', from: 'dante', text: 'Kekse?' },
    },
    romance: new Set<string>(),
    actStarts: {
      2: { map: 'bar', entry: 'start', flags: ['dante-frei'], items: { messer: 1 }, recruited: ['raven', 'dante'], party: ['raven'], quests: { ankunft: 'done' }, stations: ['linie-bar'], level: 3, credits: 200 },
    },
    start: { map: 'gasse', entry: 'start', credits: 100, minutes: 480, items: { kaffee: 1 } },
    home: { map: 'bar', entry: 'start', collapseNotes: ['Jemand hat dich heimgetragen. – C. K.'] },
    ending: { cutscenes: ['intro'], epilogue: [{ text: 'Noxius schläft.' }, { when: { flag: 'chip-gesehen' }, text: 'Der Chip bleibt geheim.' }] },
  };
}

/** Speicher im Arbeitsspeicher für Autosave-Tests. */
export function memoryStorage(initial: string | null = null): SaveStoragePort & { raw: string | null; writes: number } {
  const store = {
    raw: initial,
    writes: 0,
    read: () => store.raw,
    write: (raw: string) => { store.raw = raw; store.writes += 1; },
    clear: () => { store.raw = null; },
  };
  return store;
}
