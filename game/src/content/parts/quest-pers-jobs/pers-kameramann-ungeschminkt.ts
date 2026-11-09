// pers-kameramann-ungeschminkt · Acht Fotos echter Momente (world.md §6.5; Start bei he-kameramann-4: heimliche Aufnahmen).
// Wege: Motive selbst fotografieren (einige mit Tageszeit), das schwer erreichbare Kran-Motiv mit `[Reflexe 5]`, Kikis Taxi
// oder Gustavs Kranfahrt (ohne Check), zwei Motive am Sonntags-Flohmarkt eintauschen `[Straße 4]`.
import type { Condition, DialogueDef, QuestDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import type { Hotspot } from './_lib';
import {
  type Beitrag, L, N, P, active, all, any, beitrag, bye, byId, c, chk, cr, dlg, flag, give, hearts, item, node, noFlag, nochWas,
  rel, seen, set, schritt, spotUse, take, time, zeit,
} from './_lib';

const Q = 'pers-kameramann-ungeschminkt';
const AKTIV = active(Q);
const KM = 'kameramann';
const KAMERA = 'kamera-kameramann';

interface Motiv { key: string; titel: string; map: string; at: string; bild: string; wann?: Condition }
const MOTIVE: Motiv[] = [
  { key: 'nudeln', titel: 'Babette steckt Kindern heimlich Dampfnudeln zu', map: 'schrottmarkt', at: 'garkueche-bank', wann: time('morgen', 'tag'),
    bild: 'Babette schaut nach links, nach rechts, und schiebt einem Jungen mit Rotznase zwei Dampfnudeln in die Jacke. Sie sieht dabei aus wie eine Schmugglerin. Die liebste Schmugglerin der Welt.' },
  { key: 'dach', titel: 'Sonnenaufgang über der Neon-Gasse', map: 'neon-gasse', at: 'dachterrasse', wann: time('morgen'),
    bild: 'Die Leuchtreklamen gehen aus, eine nach der anderen. Dahinter wird der Smog rosa. Für zwei Minuten sieht Noxius aus wie eine Stadt, in der man bleiben will.' },
  { key: 'bruecke', titel: 'Oma mit Suppentopf auf der Hängebrücke', map: 'rohrsiedlung', at: 'haengebruecke', wann: time('morgen', 'tag', 'abend'),
    bild: 'Eine alte Frau balanciert einen dampfenden Topf über die Hängebrücke, ohne Geländer, ohne Hast. Unten winken Kinder. Sie winkt mit dem Ellbogen zurück.' },
  { key: 'waesche', titel: 'Overalls im Wind', map: 'loetgassen', at: 'waeschehof',
    bild: 'Hundert Overalls flattern zwischen den Häusern, ölverschmiert und frisch gewaschen zugleich. Ein Kurier rast darunter durch und nimmt einen mit. Aus Versehen. Wahrscheinlich.' },
  { key: 'garten', titel: 'Der Garten im Kanal', map: 'kanal-sammler', at: 'kanalvolk-garten',
    bild: 'Unter einer Lampe aus Flaschen wachsen Tomaten, die nie die Sonne gesehen haben. Ein Mann mit Stirnlampe gießt sie mit einer Teekanne. Er summt dabei.' },
  { key: 'pendler', titel: 'Schlafende Pendler am Bahnsteig', map: 'bahnhof-mitte', at: 'bahnsteig-ende', wann: time('morgen'),
    bild: 'Fünf Leute schlafen im Stehen, aneinandergelehnt wie Dominosteine, die sich weigern zu fallen. Der Zug ist zwölf Minuten zu spät. Frau Takt notiert es mit Tränen in den Augen.' },
  { key: 'fernrohr', titel: 'Ein Kind am Münzfernrohr', map: 'flutmauer', at: 'muenzfernrohr', wann: time('tag', 'abend'),
    bild: 'Ein kleines Mädchen steht auf Zehenspitzen am Münzfernrohr. Sie hat keine Münze. Sie schaut trotzdem durch. „Da ist das Meer“, sagt sie. Da ist nur Nebel. Sie glaubt es trotzdem.' },
  { key: 'kran', titel: 'Der Schrottmarkt von oben', map: 'schrottmarkt', at: 'kran-kabine',
    bild: 'Von ganz oben ist der Schrottmarkt ein Teppich aus Planen, Lichtern und Rauch. Mittendrin ein Punkt aus Dampf: die Garküche. Wie ein Herz, das schlägt.' },
];
const fl = (m: Motiv) => `ku_${m.key}`;
const ALLE = all(...MOTIVE.map((m) => flag(fl(m))));
const FLOHMARKT = ['garten', 'bruecke'];

const quest: QuestDef = {
  id: Q, kind: 'personal', act: 1, giver: KM,
  title: 'Ungeschminkt',
  summary: 'Der Kameramann filmt heimlich die echte Unterstadt – nicht das, was NX-1 sendet. Für seinen Film fehlen acht Fotos. Echte Momente. Keine Pose.',
  autoStart: any(seen('he-kameramann-4'), hearts(KM, 5)),
  steps: [
    schritt('kamera', 'Hol dir die Kamera beim Kameramann (Schrottmarkt, abends am Filmposten).', 'ku_start', { marker: { map: 'schrottmarkt' } }),
    ...MOTIVE.map((m) => schritt(m.key, `Foto: ${m.titel}.`, fl(m), { when: flag('ku_start'), marker: { map: m.map } })),
    schritt('abgabe', 'Bring dem Kameramann die Kamera mit acht Bildern.', 'ku_fertig', { when: all(flag('ku_start'), ALLE), marker: { map: 'schrottmarkt' } }),
  ],
  reward: { xp: 200, relations: { kameramann: 100 }, rep: { unterstadt: 10 } },
};

// ------------------------------------------------------------------------------------------- Kameramann
const start = beitrag(KM, all(AKTIV, noFlag('ku_start')), 'Auf die heimlichen Aufnahmen zeigen. „Du filmst, was keiner senden will.“', [
  node('ku-k-start', [
    L(KM, '[ PSST ]'),
    N('Er zieht eine kleine, alte Kamera aus der Weste. Mit Kurbel. Das Visier zeigt: „[8 BILDER]“, dann „[ECHT]“, dann „[KEINE POSE]“.'),
    L(KM, '[ DU ]'),
  ], { choices: [c('„Ich mach’s. Acht Bilder, keine Pose.“', 'ku-k-ja', { effects: [give(KAMERA), set('ku_start')] })] }),
  node('ku-k-ja', [L(KM, '[ : ) ]'), N('Das Visier zeigt eine Liste. Sie ist sehr ordentlich. Neben einem Punkt steht „[KRAN = HOCH]“, neben einem anderen „[MORGENS!!]“.')], {
    choices: [nochWas(), bye()],
  }),
]);

const abgabe = beitrag(KM, all(AKTIV, flag('ku_start'), ALLE, noFlag('ku_fertig')), 'Die Kamera zurückgeben. Acht Bilder.', [
  node('ku-a-start', [
    N('Er kurbelt den Film zurück, hält die Kamera ans Ohr, als könnte er die Bilder hören. Dann zeigt das Visier eine Weile gar nichts.'),
    L(KM, '[ DANKE ]'),
    L(KM, '[ PREMIERE ]'),
    N('Eine Woche später hängen deine Fotos im Schaukasten am Filmposten. Darunter steht: „Noxius, ungeschminkt. Fotos: {name}.“ Leute bleiben stehen. Manche finden sich selbst. Eine Oma mit Suppentopf lacht so laut, dass sie fast den Topf fallen lässt.'),
  ], { effects: [take(KAMERA), set('ku_fertig'), set('ungeschminkt_ausstellung')] }),
]);

export const beitraege: Beitrag[] = [start, abgabe];

// ------------------------------------------------------------------------------------------- Motive
const foto = (m: Motiv): DialogueDef => {
  if (m.key === 'kran') {
    return dlg('pj-ku-kran', [
      node('start', [N('Die Kabine von Gustavs Kran hängt hoch über dem Markt. Von da oben wäre das Bild perfekt. Nur muss man erst mal da hoch.')], {
        choices: [
          c('Den Ausleger hochklettern.', 'oben', { check: chk('ku-kran', 'reflexe', 5, ['klettern']) }),
          c('Kiki anfunken: „Flieg mich mal kurz über den Markt.“ (20 Cr)', 'kiki', { tag: '[Kiki ♥2]', requires: all(hearts('kiki-karbon', 2), { credits: 20 }), effects: [cr(-20)] }),
          c('Gustav fragen, ob er dich mit dem Kran hochzieht.', 'gustav'),
          bye('Später.'),
        ],
      }),
      node('kiki', [N('Kikis Taxi hält über dem Markt in der Luft, die Tür offen. „Mach schnell, Süße, ich parke im Halteverbot!“')], { next: 'oben' }),
      node('gustav', [N('Gustav setzt dich in die Kabine, erzählt drei Geschichten von früher und fährt den Ausleger ganz nach oben. Es dauert. Es lohnt sich.')], {
        effects: [zeit(60), rel('opa-gustav', 10)], next: 'oben',
      }),
      node('oben', [N(m.bild), P('Klick.', 'freude')], { effects: [set(fl(m))] }),
    ]);
  }
  return dlg(`pj-ku-${m.key}`, [
    node('start', [N(m.bild)], {
      choices: [c('Abdrücken. Ohne Blitz, ohne Ansage.', 'klick'), bye('Den Moment lieber nur ansehen.')],
    }),
    node('klick', [N('Klick. Die Kurbel ratscht. Niemand hat dich bemerkt. Genau so soll es sein.')], { effects: [set(fl(m))] }),
  ]);
};
const FOTOS = MOTIVE.map(foto);

// Flohmarkt: zwei Motive als alte Fotos eintauschen (Sonntag tagsüber).
const flohmarkt = dlg('pj-ku-flohmarkt', [
  node('start', [N('Auf dem Sonntags-Flohmarkt: eine Kiste mit alten Fotos, zwei Credits das Stück. Zwischen Hochzeitsbildern und Hunden liegen zwei, die genau passen: der Garten im Kanal und eine Oma auf der Hängebrücke.')], {
    choices: [
      c('Den Händler runterhandeln und beide gegen eine Runde Klatsch tauschen.', 'tausch', { check: chk('ku-flohmarkt', 'strasse', 4, ['feilschen']) }),
      bye('Ich mach die Bilder lieber selbst.'),
    ],
  }),
  node('tausch', [N('Du erzählst ihm, wer in der Neon-Gasse mit wem was hat. Er gibt dir beide Fotos und einen Keks. Der Kameramann wird sie abfotografieren. Echt ist echt.')], {
    effects: FLOHMARKT.map((k) => set(`ku_${k}`)),
  }),
]);

const hotspots = (map: string): Hotspot[] => {
  const list: Hotspot[] = MOTIVE.filter((m) => m.map === map).map((m) => spotUse(
    `pj-ku-${m.key}`, m.at, `Foto: ${m.titel}`, `pj-ku-${m.key}`,
    all(AKTIV, item(KAMERA), noFlag(fl(m)), ...(m.wann ? [m.wann] : [])),
  ));
  if (map === 'schrottmarkt') {
    list.push(spotUse('pj-ku-flohmarkt', 'flohmarkt', 'Alte Fotos durchsehen', flohmarkt.id,
      all(AKTIV, item(KAMERA), { weekday: 'so' }, time('morgen', 'tag'), any(...FLOHMARKT.map((k) => noFlag(`ku_${k}`))))));
  }
  return list;
};

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: byId(...FOTOS, flohmarkt),
  mapAdditions: Object.fromEntries([...new Set(MOTIVE.map((m) => m.map))].map((map) => [map, { hotspots: hotspots(map) }])),
};
