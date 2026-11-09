// Innenraum Crew-Quartier über dem High Voltage (world.md §3.5–§3.8, Plan design/plan/act1.json maps.crew-quartier,
// Paket pkg-neon-gasse). Bett (Tagesende, Aufwachpunkt), Truhe, Ausbau Stufen 0–3 (§3.7), Pinnwand, Plattenspieler,
// Werkbank, Hundekorb. Koordinaten am fertigen Bild game/public/assets/bg/crew-quartier.webp (1024×768).
//
// Ausbau-Stufen als Flags (die Engine kennt noch keinen Quartier-Ausbau, siehe design/plan/gaps/maps-neon-gasse.md):
//   quartier_stufe_1 Pinnwand (150 Cr) · quartier_stufe_2 Plattenspieler (side-schallplatten erledigt)
//   quartier_stufe_3 Werkbank (400 Cr + 5 schrott-ersatzteil). Stufen 4–6 kommen ab Akt 2.
import type { Condition, DialogueDef, DialogueLine, MapDef, Polygon, Rect } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const box = ([x, y, w, h]: Rect): Polygon => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const n = (text: string): DialogueLine => ({ speaker: 'narrator', text });
const ich = (text: string): DialogueLine => ({ speaker: 'player', text });

const V: Condition = { playerIs: 'vex' };
const ARIA_ZUSAMMEN: Condition = { flag: 'aria_romanze_zusammen' };
const STUFE_1: Condition = { flag: 'quartier_stufe_1' };
const STUFE_2: Condition = { flag: 'quartier_stufe_2' };
const STUFE_3: Condition = { flag: 'quartier_stufe_3' };
const TRUHE_ARIA: Condition = { all: [{ seen: 'rom-aria-albtraum' }, { time: 'morgen' }] };
const BOLZEN_DA: Condition = { quest: 'side-hunde-der-brackbucht', state: 'done' };

// ---------------------------------------------------------------------------------------------------- Dialoge

const ausbau: DialogueDef = {
  id: 'cq-ausbau',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        n('Ein Container mit Bett, Truhe und Ambitionen. Captain Kuschel hat einen Zettel an die Wand geklebt: „Ausbau? Geld her. Ich hab Werkzeug und keine Geduld. – C. K.“'),
      ],
      choices: [
        {
          text: 'Pinnwand anbringen (150 Cr) – Planungstafel und Gerüchte direkt am Bett.',
          when: { not: STUFE_1 }, requires: { credits: 150 },
          effects: [{ credits: -150 }, { setFlag: 'quartier_stufe_1' }, { xp: 20 }, { sfx: 'coin' }],
          next: 'pinnwand-fertig',
        },
        {
          text: 'Plattenspieler aufbauen – braucht drei Platten (Nebenquest „Schallplatten“).',
          when: { all: [STUFE_1, { not: STUFE_2 }] }, requires: { quest: 'side-schallplatten', state: 'done' },
          effects: [{ setFlag: 'quartier_stufe_2' }, { xp: 30 }],
          next: 'platten-fertig',
        },
        {
          text: 'Werkbank zusammenschrauben (400 Cr + 5 Ersatzteile).',
          when: { all: [STUFE_2, { not: STUFE_3 }] },
          requires: { all: [{ credits: 400 }, { item: 'schrott-ersatzteil', min: 5 }] },
          effects: [{ credits: -400 }, { take: 'schrott-ersatzteil', qty: 5 }, { setFlag: 'quartier_stufe_3' }, { xp: 40 }, { sfx: 'success' }],
          next: 'werkbank-fertig',
        },
        {
          text: 'Mehr geht hier gerade nicht.',
          when: { all: [STUFE_3, { not: { act: 2 } }] }, next: 'ende-voll',
        },
        {
          // Stufen 4–6 baut world-23/quartier-23.ts über den Hotspot „Großer Ausbau“ (ab Akt 2).
          text: '„Phase zwei“? Captain Kuschels zweiter Zettel. (Großer Ausbau: Couch, Dachgarten, Aussicht.)',
          when: { all: [STUFE_3, { act: 2 }] }, next: 'phase-zwei',
        },
        { text: 'Später. Geld ist gerade emotional gebunden.' },
      ],
    },
    {
      id: 'pinnwand-fertig',
      lines: [
        n('Kork, vier Reißzwecken, ein schiefes Lineal. Die Pinnwand hängt. Leicht schräg, aber mit Haltung.'),
        n('In der Ecke steckt schon der erste Zettel: „Hält. Wenn du nichts dranhängst. – C. K.“'),
      ],
    },
    {
      id: 'platten-fertig',
      lines: [
        n('Der Plattenspieler knackt, rauscht, dann setzt Musik ein, warm und kratzig wie eine Wolldecke mit Vorstrafen.'),
        ich('Okay. Jetzt ist es ein Zuhause.'),
      ],
    },
    {
      id: 'werkbank-fertig',
      lines: [
        n('Schraubstock, Lötkolben, eine Lampe, die nur flackert, wenn man sie ansieht. Die Werkbank steht.'),
        n('Unter den Schraubstock geklemmt: „Wenn du dir einen Finger absägst: Der linke ist billiger. – C. K.“'),
      ],
    },
    {
      id: 'ende-voll',
      lines: [
        n('Der Container ist voll. Noch eine Verbesserung, und du musst im Flur schlafen.'),
        n('Auf der Matratze liegt ein Zettel: „Für mehr brauchen wir mehr Stadt. Und mehr Geld. Warte, bis es draußen ungemütlich wird. Dann wird es hier drin gemütlich. – C. K.“'),
      ],
    },
    {
      id: 'phase-zwei',
      lines: [
        n('Neben dem ersten Zettel klebt ein zweiter, größer und ungeduldiger: „PHASE ZWEI. Couch. Garten. Aussicht. Geld her. – C. K.“ Ein Pfeil zeigt auf die Ecke mit dem Werkzeugkasten.'),
        n('Darunter, kleiner und mit Ohren-Kritzelei: „Maß genommen. Mit den Ohren. Beide hoch heißt: passt. – C. K.“'),
      ],
    },
  ],
};

const plattenspieler: DialogueDef = {
  id: 'cq-plattenspieler',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [n('Drei Platten, eine Nadel, null Ahnung, was der Nachbar davon hält. Welche Stimmung?')],
      choices: [
        {
          text: 'Was Lautes. Morgens wach werden. (+1 Ausstrahlung für den nächsten Check)',
          when: { all: [{ time: 'morgen' }, { notFlag: 'heute_morgenplatte' }] },
          effects: [{ checkBuff: { id: 'quartier-platte', label: 'Morgenplatte', value: 1, attribute: 'ausstrahlung', forDays: 0 } }, { setFlag: 'heute_morgenplatte' }, { sfx: 'switch' }],
          next: 'laut',
        },
        { text: 'Was Langsames. Einfach kurz sitzen.', next: 'leise' },
        { text: 'Kabelbrand. Natürlich Kabelbrand.', when: ARIA_ZUSAMMEN, next: 'kabelbrand' },
        { text: 'Lieber Ruhe.' },
      ],
    },
    { id: 'laut', lines: [n('Bass durch die Containerwand. Unten im Club klopft jemand mit dem Besen an die Decke. Im Takt.')] },
    { id: 'leise', lines: [n('Die Nadel knistert. Draußen tropft die Gasse. Für drei Minuten ist die Stadt nicht dein Problem.')] },
    {
      id: 'kabelbrand',
      lines: [
        n('Das erste Riff, und irgendwo in deinem Kopf singt Aria mit, viel zu laut und haarscharf am Ton vorbei.'),
        ich('Wenn sie jetzt hier wäre, würde sie mich auf die Matratze schubsen und mir erzählen, dass ich falsch mitsinge.'),
        n('Würde sie. Und du würdest dich schubsen lassen.'),
      ],
    },
  ],
};

// ---------------------------------------------------------------------------------------------------- Karte

const quartier: MapDef = {
  id: 'crew-quartier',
  name: 'Crew-Quartier',
  subtitle: 'Über dem High Voltage',
  size: [1024, 768],
  district: 'unterstadt',
  lighting: 'indoor',
  bg: 'bg-crew-quartier',
  // Ausbau §3.7 Stufen 4–6 (world-23/quartier-23.ts): Gästecouch, Leiter zum Dachgarten, Meer am Bullauge.
  // Die Stufen sind unabhängig, deshalb je Kombination ein Bild (scripts/art/cq_ausbau.py), die größte zuerst.
  bgVariants: ([['4', '5', '6'], ['4', '5'], ['4', '6'], ['5', '6'], ['4'], ['5'], ['6']] as const).map((s) => ({
    when: { all: s.map((st): Condition => ({ flag: `quartier_stufe_${st}` })) },
    bg: `bg-crew-quartier-s${s.join('')}`,
  })),
  walk: [[[12, 302], [200, 302], [204, 270], [876, 270], [876, 468], [936, 468], [936, 526], [1012, 526], [1012, 672], [12, 672]]],
  block: [
    box([54, 248, 142, 90]), // Truhe
    box([0, 330, 118, 300]), // Couch
    box([0, 560, 56, 120]), // Pflanze
    box([122, 522, 98, 78]), // Hundekorb
    box([424, 534, 180, 146]), // Treppenschacht
    box([866, 536, 154, 144]), // Luke
  ],
  exits: [
    { id: 'nach-neon-gasse', rect: [432, 520, 164, 56], to: 'neon-gasse', entry: 'von-crew-quartier', label: 'Hintertreppe zur Gasse', interact: true },
    { id: 'nach-high-voltage', rect: [872, 520, 144, 56], to: 'high-voltage', entry: 'von-crew-quartier', label: 'Personaltreppe in den Club', interact: true },
  ],
  entries: {
    'von-neon-gasse': { at: [512, 496], facing: 'n' },
    'von-high-voltage': { at: [840, 498], facing: 'w' },
    aufwachen: { at: [236, 318], facing: 's' },
  },
  spots: {
    bett: { at: [236, 312], facing: 'w' },
    truhe: { at: [150, 356], facing: 'n' },
    pinnwand: { at: [545, 284], facing: 'n' },
    plattenspieler: { at: [790, 290], facing: 'n' },
    werkbank: { at: [850, 400], facing: 'e' },
    couch: { at: [150, 452], facing: 'w' },
    'tuer-innen': { at: [640, 510], facing: 'e' },
    hundekorb: { at: [250, 566], facing: 'w' },
    fenster: { at: [700, 282], facing: 'n' },
    kueche: { at: [400, 284], facing: 'n' },
  },
  bed: { at: [214, 296], label: 'Schlafen (Tag beenden)' },
  hotspots: [
    {
      id: 'truhe', at: [125, 345], radius: 64, label: 'Truhe öffnen', kind: 'look',
      when: { not: TRUHE_ARIA },
      lines: [
        n('Die Truhe quietscht wie ein beleidigter Kater. Drin: alles, was du nicht mit dir rumschleppen willst, und ein Socken, der niemandem gehört.'),
        n('(Die Truhe ist dein Lager. Bis der Lagerschrank fertig ist, trägst du alles am Körper – Captain Kuschel „arbeitet dran“.)'),
      ],
    },
    {
      id: 'truhe-aria', at: [125, 345], radius: 64, label: 'Aria auf der Truhe', kind: 'look',
      when: TRUHE_ARIA,
      lines: [
        n('Zwei Kaffeebecher stehen auf der Truhe, einer halb leer, einer randvoll. Aria hat den halbleeren. Sie hat immer den halbleeren.'),
        { speaker: 'aria', text: 'Bild dir nix ein. Ich war nur zufällig wach. Um vier. Mit zwei Bechern. Zufällig.' },
      ],
    },
    {
      id: 'ausbau', at: [400, 290], radius: 70, label: 'Quartier ausbauen', kind: 'use', dialogue: 'cq-ausbau',
    },
    // Klickbar an der Pinnwand sind nur die Ergänzungen 'planungstafel-quartier' (quest-main-b, ab plan_gefasst bis Akt 2)
    // und 'm2p-pinnwand' (quest-main-2, Akt 2 mit releaseparty_geplant). Diese beiden Blicke füllen nur die Lücken dazwischen.
    {
      id: 'pinnwand', at: [545, 278], radius: 70, label: 'Pinnwand ansehen', kind: 'look',
      when: { all: [{ flag: 'plan_gefasst' }, { act: 2 }, { not: { all: [{ flag: 'releaseparty_geplant' }, { not: { act: 3 } }] } }] },
      lines: [
        n('Die alten Fotos hängen noch, die roten Fäden sind ausgeleiert. Halb Plan, halb Tatortfoto. Für das, was jetzt kommt, steht noch nichts drauf.'),
        n('Unten rechts ein Zettel mit zwei gezeichneten Hasenohren, eines geknickt: „Neuer Plan? Ich warte. – C. K.“'),
      ],
    },
    {
      id: 'pinnwand-leer', at: [545, 278], radius: 70, label: 'Pinnwand ansehen', kind: 'look',
      when: { notFlag: 'plan_gefasst' },
      lines: [
        n('Leerer Kork. Noch. Sobald es Pläne gibt, hängen hier Fotos mit roten Fäden, wie bei richtigen Verschwörern.'),
      ],
    },
    {
      id: 'plattenspieler', at: [790, 284], radius: 64, label: 'Musik auflegen', kind: 'use', dialogue: 'cq-plattenspieler',
      when: STUFE_2,
    },
    {
      id: 'plattenspieler-kaputt', at: [790, 284], radius: 64, label: 'Plattenspieler ansehen', kind: 'look',
      when: { not: STUFE_2 },
      lines: [n('Ein Plattenspieler ohne Platten ist nur ein sehr langsamer Teller. Drei Scheiben fehlen.')],
    },
    {
      id: 'werkbank', at: [860, 390], radius: 64, label: 'An der Werkbank basteln', kind: 'use',
      when: STUFE_3,
      effects: [{ minigame: 'akt-werkbank', level: 2, key: 'akt-werkbank-quartier', label: 'Basteln', win: [{ give: 'reparaturset' }, { xp: 15 }], lose: [{ message: 'Funken, Rauch, ein leises „Ups“. Das Material ist hin.' }] }],
    },
    {
      id: 'kochen', at: [400, 290], radius: 56, label: 'Auf dem Campingkocher kochen', kind: 'use',
      when: STUFE_3,
      effects: [{ minigame: 'akt-kochen', level: 1, key: 'akt-kochen-quartier', label: 'Kochen', win: [{ heal: 20 }, { xp: 10 }], lose: [{ message: 'Angebrannt. Riecht trotzdem besser als die Gasse.' }] }],
    },
    {
      id: 'werkbank-plane', at: [860, 390], radius: 64, label: 'Werkbank ansehen', kind: 'look',
      when: { not: STUFE_3 },
      lines: [n('Unter der Plane steht eine halbe Werkbank. Die andere Hälfte existiert nur als Idee in Captain Kuschels Kopf und als Rechnung über 400 Credits.')],
    },
    {
      id: 'kuschel-zettel', at: [236, 300], radius: 48, label: 'Zettel am Kopfkissen', kind: 'look',
      lines: [
        n('Ein Stapel Zettel, alle in derselben Krakelschrift: „Licht aus, wenn du gehst. – C. K.“ · „Wer meinen Joghurt isst, isst ihn zum letzten Mal. – C. K.“ · „Schlaf ist auch ein Plan. – C. K.“'),
      ],
    },
    {
      id: 'kabelbrand-poster', at: [180, 300], radius: 48, label: 'Kabelbrand-Poster', kind: 'look',
      lines: [
        n('Ein Totenkopf zwischen zwei Blitzen: das Kabelbrand-Banner. Jemand hat es mit Kaugummi an die Wand geklebt, und der Kaugummi hält besser als jede Schraube hier.'),
      ],
    },
    {
      id: 'schlaeger', at: [632, 560], radius: 48, label: 'Schläger an der Tür', kind: 'look',
      when: { not: ARIA_ZUSAMMEN },
      lines: [n('Ein Baseballschläger lehnt an der Tür. Zersplittert am Griff, mit Kerben am Kopf. Er hat mehr Geschichten erlebt, als du hören willst.')],
    },
    {
      id: 'schlaeger-aria', at: [632, 560], radius: 48, label: 'Arias Schläger', kind: 'look',
      when: ARIA_ZUSAMMEN,
      lines: [
        n('Arias alter Schläger lehnt jetzt bei dir an der Tür, als würde er hier wohnen. Tut er auch. Genau wie die Jacke über dem Stuhl, die definitiv nicht deine ist und definitiv nach ihr riecht.'),
        { speaker: 'aria', text: 'Der bleibt da. Falls einer reinkommt, den ich nicht leiden kann. Oder falls du mal wieder vergisst, wem du gehörst.', expr: 'signatur' },
      ],
    },
    {
      id: 'fenster', at: [730, 278], radius: 56, label: 'Aus dem Bullauge sehen', kind: 'look',
      lines: [n('Pinkes Neon, Dampf aus dem Gitter, ein Kerl, der im Regen mit einer Mülltonne streitet und verliert. Die Gasse sieht von oben fast romantisch aus. Fast.')],
    },
    {
      id: 'hundekorb', at: [178, 586], radius: 60, label: 'Hundekorb', kind: 'look',
      when: { not: BOLZEN_DA },
      lines: [n('Ein leerer Korb mit Kissen. Captain Kuschel nennt ihn „Option“. Was auch immer das heißen soll.')],
    },
    {
      id: 'hundekorb-bolzen', at: [178, 586], radius: 60, label: 'Bolzens Korb', kind: 'look',
      when: BOLZEN_DA,
      lines: [
        n('Bolzens Korb. Darin, sorgfältig drapiert: eine Schraube, ein Schuh (nicht deiner), eine halbe Brezel und ein Stromkabel, das noch irgendwo angeschlossen ist.'),
        { speaker: 'bolzen', text: 'Wuff. (Das heißt: Geschenk. Nicht anfassen. Doch, anfassen. Loben.)' },
      ],
    },
  ],
  lights: [
    { at: [500, 30], radius: 260, color: '#ffcf7a', intensity: 0.5 },
    { at: [730, 100], radius: 120, color: '#ff3fd0', intensity: 0.7 },
    { at: [930, 180], radius: 140, color: '#ffd38a', intensity: 0.7 },
    { at: [312, 100], radius: 90, color: '#ffbf6b', intensity: 0.6 },
    { at: [512, 620], radius: 120, color: '#a64bff', intensity: 0.6 },
    { at: [940, 620], radius: 110, color: '#ff3fd0', intensity: 0.6 },
  ],
  ambience: 'innen',
  music: null,
  onEnter: [
    {
      id: 'quartier-erstbesuch', once: true,
      effects: [
        { markSeen: 'crew-quartier-betreten' },
        { message: 'Ein Container, ein Bett, ein Fenster mit Neonblick. Zum ersten Mal seit Langem ein Ort, an dem dich keiner rauswirft.' },
      ],
    },
    {
      id: 'quartier-vex', once: true, when: V,
      effects: [{ message: 'Vex wirft die Tasche aufs Bett und testet die Matratze mit der Faust. Weicher als das Rolltor der Kurierbude. Verdächtig weich.' }],
    },
  ],
};

export const part: ContentPart = {
  maps: { 'crew-quartier': quartier },
  dialogues: { 'cq-ausbau': ausbau, 'cq-plattenspieler': plattenspieler },
};
