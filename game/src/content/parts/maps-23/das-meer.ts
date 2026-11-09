// Das Meer (world.md §3.5 `das-meer`, §3.8 Notschlafplätze, §3.9 akt-strandlauf/akt-angeln, §5.5 Enden, §6.4
// side-strandclub, §10.4/§10.7 Küste; Plan design/plan/act23.json maps.das-meer, Paket pkg-rennhalle-meer).
// Zone 1536×1024, Nachspiel: heller Strand mit Dünen, Strandclub-Baustelle (oben links), Bühne, Lagerfeuer, Karls Stein,
// Holzsteg mit T-Kopf (Strand-Shuttle, Angeln). Wagenpiste oben rechts zurück in die Glasdünen.
// Einstiege: ankunft (Enden), aufwachen (Lagerfeuer), shuttle (Steg), taxi, von-glasduenen.
// Geometrie am fertigen Bild game/public/assets/bg/das-meer.webp nachgezogen (scripts/map_tool.mjs).
// Nicht hier: Krabbe Karl, Crew-Tagesabläufe (NpcDef.schedule), side-strandclub (Quest + enc-strand-staubfalken per
// { battle }), rom-aria-meer, rom-vexaria-konzert, Kiki-Taxi – die Pakete zeigen per Spot-Name hierher.
import type { Condition, DialogueDef, MapDef, Point, Polygon, Rect } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const box = ([x, y, w, h]: Rect): Polygon => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];

/** Benannte Punkte (Plan-IDs aus act23.json) – Hotspots, Tagesabläufe und Quests sitzen daran. */
const S = {
  wagenplatz: [1330, 262],
  duenengras: [1010, 245],
  strand: [700, 600],
  wasserlinie: [600, 735],
  steg: [1070, 770],
  strandclub: [450, 470],
  'strandclub-bar': [285, 452],
  'strandclub-buehne': [680, 360],
  lagerfeuer: [862, 548],
  'krabbe-karl': [1000, 640],
  'karls-stein': [1385, 700],
  'grundstueck-pflock': [150, 545],
  'shuttle-halt': [1110, 870],
  'hunter-liegestuhl': [220, 712],
  'nyra-muschelplatz': [420, 700],
  'auftrag-a': [580, 500],
} satisfies Record<string, Point>;

const at = (id: keyof typeof S): Point => S[id];
const off = (id: keyof typeof S, dx: number, dy: number): Point => [S[id][0] + dx, S[id][1] + dy];

const VEX: Condition = { playerIs: 'vex' };
const ABENDS_NACHTS: Condition = { time: ['abend', 'nacht'] };
const CLUB_OFFEN: Condition = { quest: 'side-strandclub', state: 'done' };
const CLUB_BAU: Condition = { quest: 'side-strandclub', state: 'active' };
const CLUB_NIX: Condition = { not: { any: [CLUB_OFFEN, CLUB_BAU] } };
/** Rückfahrt mit dem Strand-Shuttle: side-strandclub setzt `strandclub_shuttle` auf der Stufe „Shuttle“ (gaps/maps-23.md). */
const SHUTTLE: Condition = { any: [{ flag: 'strandclub_shuttle' }, CLUB_OFFEN] };
/** Aria läuft mit: in der Party oder abends am Wochenende sowieso an der Wasserlinie (Tagesablauf). */
const ARIA_DA: Condition = { any: [{ companion: 'aria' }, { all: [{ time: 'abend' }, { weekday: ['fr', 'sa', 'so'] }] }] };

const meer: MapDef = {
  id: 'das-meer',
  name: 'Das Meer',
  subtitle: 'Küste · hinter den Glasdünen',
  size: [1536, 1024],
  district: 'kueste',
  lighting: 'outdoor',
  bg: 'bg-das-meer',
  bgVariants: [{ when: CLUB_OFFEN, bg: 'bg-das-meer-strandclub' }],
  walk: [
    // Strand: unter den Dünen von links bis zum Felsen, oben rechts der Wagenplatz, unten bis in den Schaum.
    [
      [0, 448], [180, 444], [180, 408], [395, 404], [400, 300], [505, 300], [505, 330], [630, 330], [630, 322],
      [725, 322], [725, 306], [840, 306], [850, 250], [905, 222], [1110, 226], [1170, 214], [1250, 262], [1300, 170],
      [1350, 80], [1378, 0], [1478, 0], [1462, 78], [1428, 190], [1410, 280], [1440, 330], [1500, 440], [1530, 520],
      [1536, 600], [1536, 722], [1300, 735], [1125, 748], [1015, 742], [800, 750], [600, 762], [400, 782], [150, 792], [0, 795],
    ],
    // Holzsteg mit T-Kopf (Angeln, Shuttle-Halt)
    [[1024, 700], [1116, 700], [1116, 836], [1258, 836], [1258, 902], [898, 902], [898, 836], [1024, 836]],
  ],
  block: [
    [[0, 80], [480, 80], [480, 250], [398, 250], [394, 396], [178, 400], [174, 440], [0, 440]], // Strandbar-Baustelle
    box([396, 338, 104, 96]), // Sägebock und Farbeimer
    box([470, 298, 70, 96]), // Bretterstapel
    [[510, 88], [832, 88], [832, 298], [722, 298], [722, 318], [632, 318], [632, 298], [510, 298]], // Bühne
    box([808, 410, 124, 70]), // Feuerstelle
    [[728, 402], [790, 392], [802, 452], [748, 470]], // Stamm links
    [[940, 392], [998, 402], [1000, 468], [952, 470]], // Stamm rechts
    box([782, 484, 162, 32]), // Stamm unten
    [[1280, 560], [1330, 520], [1462, 520], [1496, 580], [1490, 664], [1292, 676], [1270, 620]], // Karls Stein
    box([72, 636, 40, 46]), // Pflock der Staubfalken
    box([148, 600, 108, 82]), // Liegestuhl
    box([262, 612, 42, 46]), // Eimer
    [[0, 580], [62, 598], [72, 690], [0, 700]], // Dünengras unten links
    [[1440, 330], [1536, 300], [1536, 470], [1500, 440]], // Dünengras rechts
  ],
  exits: [
    {
      id: 'wagenpiste', rect: [1378, 0, 100, 24], to: 'glasduenen', entry: 'von-das-meer', label: 'Wagenpiste zurück in die Ödnis', minutes: 60,
    },
  ],
  entries: {
    'von-glasduenen': { at: [1420, 48], facing: 's' },
    ankunft: { at: [1320, 262], facing: 's' },
    aufwachen: { at: [700, 452], facing: 'e' },
    shuttle: { at: [1080, 860], facing: 'n' },
    taxi: { at: [1160, 330], facing: 's' },
  },
  spots: Object.fromEntries(Object.entries(S).map(([id, p]) => [id, { at: p }])),
  hotspots: [
    // ---------------------------------------------------------------- Abspann (act23.json notes: nur mit Rückfrage)
    {
      id: 'abspann', at: off('wagenplatz', -70, -40), radius: 56, label: 'Abspann ansehen', kind: 'use', dialogue: 'das-meer-abspann',
      when: { all: [{ flag: 'epilog' }, { flag: 'meer_offen' }] },
    },
    // ---------------------------------------------------------------- Aktivitäten (world.md §3.9)
    {
      id: 'strandlauf', at: at('wasserlinie'), radius: 60, label: '„Wer zuerst am Wasser ist!“', kind: 'use', daily: true,
      when: { all: [{ flag: 'epilog' }, ARIA_DA, { not: { flag: 'aria_weg' } }] },
      lines: [
        { speaker: 'aria', expr: 'signatur', text: 'Du da. Ich da. Das Wasser da. Wer verliert, trägt die Kühlbox. Drei, zwei – ich lauf schon!' },
      ],
      effects: [{
        minigame: 'akt-strandlauf', level: 2, key: 'strandlauf-meer', label: '„Wer zuerst am Wasser ist!“',
        win: [
          { relation: 'aria', delta: 20 }, { xp: 20 },
          { message: 'Du klatschst als Erste ins Wasser. Aria flucht, lacht, schmeißt dich trotzdem rein. Kühlbox: ihre.' },
        ],
        lose: [
          { relation: 'aria', delta: 10 },
          { message: 'Aria steht schon knietief im Schaum und jubelt wie ein Stadion. „Kühlbox, Lahmarsch! Und ein Eis!“' },
        ],
      }],
    },
    {
      id: 'angeln-steg', at: off('steg', 0, 30), radius: 50, label: 'Vom Steg angeln', kind: 'use',
      lines: [{ speaker: 'narrator', text: 'Das Wasser unter dem Steg ist so klar, dass du die Fische siehst, die dich auslachen. Echte Fische. Ohne drittes Auge.' }],
      effects: [{
        minigame: 'akt-angeln', level: 2, key: 'angeln-meer', label: 'Angeln am Meer',
        win: [{ give: 'muschel-frisch' }, { give: 'treibholz' }, { message: 'Ein silbriger Fisch, der zurück ins Meer darf, eine Muschel am Haken und ein Stück Treibholz. Bester Fang deines Lebens.' }],
        lose: [{ message: 'Der Köder ist weg, der Fisch auch. Eine Möwe auf dem Pfosten guckt dich an, als hätte sie Wetten laufen.' }],
      }],
    },
    {
      id: 'muscheln', at: [340, 652], radius: 46, label: 'Muscheln sammeln', kind: 'loot', daily: true,
      lines: [{ speaker: 'narrator', text: 'Die Flut hat über Nacht ein paar Muscheln in den Sand gelegt. Ordentlich, nebeneinander. Fast, als hätte jemand aufgeräumt.' }],
      effects: [{ give: 'muschel-frisch' }],
    },
    {
      id: 'lagerfeuer', at: off('lagerfeuer', 0, -40), radius: 64, label: 'Am Lagerfeuer schlafen', kind: 'sleep',
      lines: [
        { speaker: 'narrator', text: 'Die Glut knackt. Das Meer rauscht, als würde es extra leise machen. Du rollst dich in eine Decke, die nach Rauch und Sonnencreme riecht.' },
        { speaker: 'narrator', text: 'Über dir: Sterne. Echte. Keine Werbung dazwischen. Du schläfst ein, bevor du sie zählen kannst.' },
      ],
    },
    // ---------------------------------------------------------------- Händler
    { id: 'strandclub-bar', at: at('strandclub-bar'), radius: 56, label: 'Strandclub-Bar', kind: 'shop', shop: 'strandclub-bar', when: CLUB_OFFEN },
    // ---------------------------------------------------------------- Strand-Shuttle
    {
      id: 'shuttle-zurueck', at: at('shuttle-halt'), radius: 54, label: 'Strand-Shuttle zur Hafenkante', kind: 'use', when: SHUTTLE,
      lines: [{ speaker: 'narrator', text: 'Das Shuttle schaukelt am Steg, frisch gestrichen, mit Rettungsringen und einer Glocke, die keiner läuten darf außer dem Kapitän. Und Nyra.' }],
      effects: [{ travel: 'hafenkante', entry: 'von-hausboot-nebelhorn', minutes: 60 }],
    },
    {
      id: 'shuttle-halt-leer', at: at('shuttle-halt'), radius: 54, label: 'Stegkopf ansehen', kind: 'look', when: { not: SHUTTLE },
      lines: [
        { speaker: 'narrator', text: 'Der Steg endet in einer breiten Plattform mit Poller und Rettungsring. Kein Boot. Nur Wasser bis zum Horizont, und der Horizont ist diesmal echt.' },
        { speaker: 'narrator', text: 'Ein Boot, das hier anlegt und bis zur Hafenkante fährt? Wäre schön. Müsste halt jemand organisieren.' },
      ],
    },
    // ---------------------------------------------------------------- Orte zum Ansehen
    {
      id: 'strandclub-nix', at: at('strandclub'), radius: 60, label: 'Bretterbude ansehen', kind: 'look', when: CLUB_NIX,
      lines: [
        { speaker: 'narrator', text: 'Eine Bude aus Treibholz, Bootsplanken und Wellblech, halb Bar, halb Schuppen, ganz Wunschtraum. Lichterketten hängen schon. Das Dach noch nicht.' },
        { speaker: 'narrator', text: 'Ein Surfbrett lehnt als Tresen da. Irgendwer hat mit Kreide eine Palme drauf gemalt und daneben: „Hier kommt was hin.“' },
      ],
    },
    {
      id: 'strandclub-bau', at: at('strandclub'), radius: 60, label: 'Strandclub-Baustelle', kind: 'look', when: CLUB_BAU,
      lines: [
        { speaker: 'narrator', text: 'Hunters Baustelle. Säge, Farbe, Bretter, ein Bauplan auf einer Serviette, Kaffeefleck in der Mitte, wo „Tanzfläche“ steht.' },
        { speaker: 'narrator', text: 'An einem Pfosten ein Zettel in Hunters Schönschrift: „Nicht anfassen, das trägt. Glaube ich. Okay, fasst es lieber nicht an.“' },
      ],
    },
    {
      id: 'strandclub-fertig', at: at('strandclub'), radius: 60, label: 'Strandclub ansehen', kind: 'look', when: CLUB_OFFEN,
      lines: [
        { speaker: 'narrator', text: 'Der Strandclub. Dach drauf, Lampen an, Sand in jedem Glas. Hinter dem Tresen hängt eine gerahmte Serviette mit Kaffeefleck: der Bauplan.' },
        { speaker: 'narrator', text: 'Daneben, kleiner gerahmt, Hunters erste Abrechnung. Ganz unten, unterstrichen: „Gewinn: ja. Wirklich. Kein Witz.“' },
      ],
    },
    {
      id: 'buehne', at: at('strandclub-buehne'), radius: 56, label: 'Bühne ansehen', kind: 'look', when: { not: CLUB_OFFEN },
      lines: [
        { speaker: 'narrator', text: 'Paletten, ein Treibholz-Rahmen mit Lichterkette, zwei Boxen, die schon bessere Bands gesehen haben. Oder schlechtere. Lauter jedenfalls.' },
      ],
    },
    {
      id: 'buehne-offen', at: at('strandclub-buehne'), radius: 56, label: 'Bühne ansehen', kind: 'look', when: CLUB_OFFEN,
      lines: [
        { speaker: 'narrator', text: 'Die Bühne steht. Jemand hat die Schellen der Lichterkette doppelt gesichert und mit Edding „GEPRÜFT“ draufgeschrieben. Dreimal unterstrichen.' },
      ],
    },
    {
      id: 'buehne-vex', at: off('strandclub-buehne', 80, 0), radius: 40, label: 'Die Schellen prüfen', kind: 'use',
      when: { all: [VEX, { flag: 'vexaria_konzert' }] },
      lines: [
        { speaker: 'player', text: 'Fest. Alle fest. Ich hab sie trotzdem nochmal angezogen.' },
        { speaker: 'narrator', text: 'Erste Reihe. Arias Hand in deiner, so fest, dass dein Metallarm piepte. Die letzte Strophe von „Nicht anhalten“. Diesmal bis zum Ende.' },
      ],
    },
    {
      id: 'lagerfeuer-ansehen', at: off('lagerfeuer', -110, -10), radius: 40, label: 'Treibholzbank', kind: 'look',
      lines: [
        { speaker: 'narrator', text: 'In den Stamm sind Initialen geritzt. D + R, ziemlich groß. H, mit Sonnenbrille. Ein Krakel, der eine Welle sein soll, daneben „NYRA WAR HIER ZUERST“.' },
      ],
    },
    {
      id: 'wasser', at: off('wasserlinie', -250, 20), radius: 60, label: 'Ins Wasser schauen', kind: 'look',
      lines: [
        { speaker: 'narrator', text: 'Türkis. Nicht Hafengrün, nicht Kanalbraun, nicht Neon. Türkis. Das Wasser leckt dir an den Schuhen und zieht sich höflich wieder zurück.' },
        { speaker: 'narrator', text: 'Irgendwo da draußen, sagt Nebelhorn, liegt die Bojeninsel. Von hier aus sieht man nur Himmel, der ins Wasser fällt.' },
      ],
    },
    {
      id: 'wasser-vex', at: off('wasserlinie', -250, 20), radius: 30, label: 'Schuhe ausziehen', kind: 'use', when: VEX,
      lines: [
        { speaker: 'player', text: 'Kas hat immer gesagt, er bringt mich ans Meer. Mit dem Fahrrad. Über die Ödnis. Bescheuerter Plan.' },
        { speaker: 'narrator', text: 'Die Welle kommt, kalt bis zu den Knöcheln. Du stehst still. Zum ersten Mal seit Jahren hat niemand einen Liefertermin für dich.' },
        { speaker: 'player', text: 'Ich bin da, Bruder. Ohne Fahrrad.' },
      ],
    },
    {
      id: 'duenengras', at: at('duenengras'), radius: 56, label: 'Dünengras', kind: 'look',
      lines: [
        { speaker: 'narrator', text: 'Hartes, goldgrünes Gras, das sich im Wind verbeugt. Es pikst. Es riecht nach Salz und Sonne und nach gar keinem Lötzinn.' },
        { speaker: 'narrator', text: 'Ein Schild, halb im Sand: „Dünen nicht betreten.“ Darunter, frischer: „Vega, das gilt auch für dich und dein Stativ.“' },
      ],
    },
    {
      id: 'wagenplatz', at: off('wagenplatz', 60, 30), radius: 56, label: 'Wagenplatz', kind: 'look',
      lines: [
        { speaker: 'narrator', text: 'Reifenspuren im Sand, ein Wegweiser aus Treibholz mit zwei Pfeilen: einer zeigt aufs Meer, einer in die Ödnis. Auf dem zum Meer steht in Kreide „HIER“. Auf dem anderen „NÖ“.' },
        { speaker: 'narrator', text: 'Hier parkt die Rostlaube, wenn sie nicht gerade schmollt. Die Piste zurück schlängelt sich durch die Dünen, sechzig Minuten Staub bis zu den Glasdünen.' },
      ],
    },
    {
      id: 'karls-stein', at: off('karls-stein', -20, -30), radius: 60, label: 'Großer Stein', kind: 'look',
      lines: [
        { speaker: 'narrator', text: 'Ein runder Felsen, oben flach wie ein Thron. Darauf, ordentlich in Reihen sortiert: Muscheln, Seeglas, ein Kronkorken, eine einzelne Schraube. Nach Farbe. Und nach Größe.' },
        { speaker: 'narrator', text: 'Neben der Sammlung ein Kratzer im Stein, der aussieht wie eine kleine Krabbe. Signiert, sozusagen.' },
      ],
    },
    {
      id: 'pflock', at: at('grundstueck-pflock'), radius: 50, label: 'Pflock mit Federn', kind: 'look', when: { not: { flag: 'kraehe_teilhaberin' } },
      lines: [
        { speaker: 'narrator', text: 'Ein Pflock, mit Draht umwickelt, oben Falkenfedern und ein Wimpel aus alten Autositzbezügen. Das Zeichen der Staubfalken: Hier gehört was uns.' },
        { speaker: 'narrator', text: 'Eingeritzt: „PACHT: VERHANDELBAR. FAUSTREGEL: NICHT VERHANDELBAR.“' },
      ],
    },
    {
      id: 'pflock-kraehe', at: at('grundstueck-pflock'), radius: 50, label: 'Pflock mit Federn', kind: 'look', when: { flag: 'kraehe_teilhaberin' },
      lines: [
        { speaker: 'narrator', text: 'Der Falkenpflock steht noch, frisch gestrichen. Am Wimpel hängt jetzt ein Cocktailschirmchen. Krähe nennt das „Partnerschaft“. Hunter nennt es „Erpressung mit Deko“.' },
      ],
    },
    {
      id: 'liegestuhl', at: off('hunter-liegestuhl', -10, -40), radius: 50, label: 'Liegestuhl', kind: 'look',
      lines: [
        { speaker: 'narrator', text: 'Ein rot-weiß gestreifter Liegestuhl, perfekt auf den Sonnenuntergang ausgerichtet. Mit Wasserwaage. Auf der Lehne klebt ein Zettel: „Reserviert. Für immer. – H.“' },
      ],
    },
    {
      id: 'muschelplatz', at: off('nyra-muschelplatz', 0, -10), radius: 46, label: 'Muschelkreis', kind: 'look', when: { flag: 'epilog' },
      lines: [
        { speaker: 'narrator', text: 'Ein Kreis aus Muscheln im Sand, in der Mitte eine kleine Burg mit Fahne aus einem Kaugummipapier. Daneben Fußspuren, die vor Freude im Zickzack gelaufen sind.' },
        { speaker: 'narrator', text: 'In den Sand gemalt: eine Welle, so groß wie du. Darunter: „NYRAS. NICHT KAPUTTMACHEN. AUSSER WELLEN, DIE DÜRFEN.“' },
      ],
    },
    {
      id: 'steg-ansehen', at: off('steg', 0, -50), radius: 44, label: 'Holzsteg', kind: 'look',
      lines: [
        { speaker: 'narrator', text: 'Ein Steg aus verwitterten Planken, die bei jedem Schritt knarzen wie ein alter Mann, der sich freut. Zwischen den Brettern blitzt das Wasser.' },
      ],
    },
    {
      id: 'steg-nebelhorn', at: off('steg', 0, -50), radius: 30, label: 'Die Kerbe im Pfosten', kind: 'look',
      when: { seen: 'he-kaeptn-nebelhorn-10' },
      lines: [
        { speaker: 'narrator', text: 'In den ersten Pfosten hat jemand mit einem Taschenmesser eine Kerbe geschnitzt, sauber, seemännisch. Daneben: „N. – angekommen.“' },
      ],
    },
  ],
  lights: [
    // Lichterketten Strandbar und Bühne
    { at: [130, 170], radius: 120, color: '#ffcf7a', intensity: 0.7, slots: ['abend', 'nacht'] },
    { at: [300, 170], radius: 140, color: '#ffcf7a', intensity: 0.7, slots: ['abend', 'nacht'] },
    { at: [440, 140], radius: 110, color: '#ffcf7a', intensity: 0.6, slots: ['abend', 'nacht'] },
    { at: [285, 320], radius: 150, color: '#ffb35a', intensity: 0.6, slots: ['abend', 'nacht'] },
    { at: [580, 150], radius: 120, color: '#ffd89a', intensity: 0.6, slots: ['abend', 'nacht'] },
    { at: [740, 150], radius: 120, color: '#ffd89a', intensity: 0.6, slots: ['abend', 'nacht'] },
    { at: [672, 240], radius: 160, color: '#ff3fa4', intensity: 0.35, slots: ['nacht'] },
    // Lagerfeuer
    { at: [870, 440], radius: 220, color: '#ff8a2a', intensity: 0.85, slots: ['abend', 'nacht'] },
    // Sonnenuntergang über dem Wasser, Mondschein nachts
    { at: [300, 900], radius: 420, color: '#ffb36b', intensity: 0.35, slots: ['abend'] },
    { at: [900, 920], radius: 460, color: '#9fd8ff', intensity: 0.3, slots: ['nacht'] },
    { at: [1230, 850], radius: 70, color: '#ffcf7a', intensity: 0.5, slots: ['nacht'] },
  ],
  shelter: {
    entry: 'aufwachen',
    notes: [
      'Die Glut ist aus, die Decke voller Sand. Jemand hat dir eine Muschel aufs Brustbein gelegt. Sehr ordentlich. Karl war da.',
      'Möwen. Viele. Eine sitzt auf deinem Schuh und hält das offenbar für einen Mietvertrag.',
      'Das Meer weckt dich, indem es dir die Zehen leckt. Flut. Du liegst jetzt näher am Wasser als gestern Abend. Respekt, Meer.',
    ],
  },
  ambience: 'meer',
  music: 'meer',
  ambient: {
    count: 4,
    bySlot: { morgen: 2, tag: 5, abend: 4, nacht: 1 },
    sprites: ['passant-tourist-walk', 'passant-oma-walk', 'passant-punk-walk', 'passant-arbeiterin-walk', 'passant-kurier-walk'],
    routes: [
      [[1320, 262], [1000, 330], [600, 520], [300, 560]],
      [[100, 740], [600, 730], [980, 700], [1220, 720]],
      [[560, 470], [860, 600], [1180, 470], [1360, 300]],
      [[300, 520], [420, 690], [700, 640], [980, 560]],
    ],
    barks: [
      { text: 'Ich hab eine Muschel gefunden. Sie hat „Hallo“ gesagt. Oder das war Karl.' },
      { text: 'Der Konvoi fährt jetzt jeden Tag ans Meer. Mit Sonnencreme!' },
      { text: 'Das Meer gibt es wirklich? Dann will ich mein Geld zurück für die Postkarte.' },
      { text: 'Ich hab heute selbst Kaffee gekocht. Am Lagerfeuer. Er war furchtbar. Ich bin so stolz.' },
      { text: 'Sand. Überall Sand. In Stellen, von denen ich nicht wusste, dass ich sie habe.' },
      { text: 'Fährt hier echt ein Bus zurück? Nicht, dass ich zurück will. Nur so.' },
      { text: 'Die Bildschirme in der Stadt sind aus, und hier gab’s nie welche. Ich fass es nicht, wie leise Wasser ist.' },
      { text: 'Achtung, die Krabbe klaut keine Handtücher. Sie faltet sie. Das ist schlimmer.' },
      { text: 'Guten Morgen, Meer. Du hast dich über Nacht nicht verändert. Respekt.', when: { time: 'morgen' } },
      { text: 'Gleich geht die Sonne unter. Ohne Smog. Ich hab Taschentücher dabei, nur zur Sicherheit.', when: { time: 'abend' } },
      { text: 'Freitag ist Musik im Strandclub! Hunter tanzt. Das muss man gesehen haben. Einmal.', when: { all: [CLUB_OFFEN, { weekday: ['do', 'fr'] }] } },
      { text: 'Wer baut denn bitte einen Club aus Treibholz? … Kann ich mitmachen?', when: CLUB_BAU },
      { text: 'Psst, da drüben am Feuer erzählen sie Geistergeschichten. Die Geister sind alle von Quantum.', when: ABENDS_NACHTS },
    ],
  },
  onEnter: [
    { id: 'das-meer-erstbesuch', once: true, dialogue: 'das-meer-ankunft', effects: [{ markSeen: 'das-meer-betreten' }, { xp: 50 }] },
  ],
};

const dialogues: Record<string, DialogueDef> = {
  'das-meer-ankunft': {
    id: 'das-meer-ankunft',
    start: 'a',
    nodes: [
      {
        id: 'a',
        lines: [
          { speaker: 'narrator', text: 'Die Piste kippt über die letzte Düne, und dann ist es einfach da. Kein Dunst, kein Streifen am Horizont, keine Postkarte. Das Meer. Türkis, laut und ganz und gar nicht beeindruckt von euch.' },
          { speaker: 'narrator', text: 'Der Sand ist hell und warm. Es riecht nach Salz, Sonne und einem Sommer, den die Stadt seit Jahrzehnten verpasst hat. Irgendwer heult. Irgendwer behauptet, es sei Sand im Auge.' },
        ],
      },
    ],
  },
  'das-meer-abspann': {
    id: 'das-meer-abspann',
    start: 'a',
    nodes: [
      {
        id: 'a',
        lines: [
          { speaker: 'narrator', text: 'Ein Holzrahmen am Wegweiser, voller Fotos, mit Wäscheklammern an eine Schnur gehängt: die Crew am Wasser, Hunter im Liegestuhl, Nyra mit einer Muschel so groß wie ihr Kopf, Dante und Raven am Feuer, verwackelt.' },
          { speaker: 'narrator', text: 'Wenn du hier hinsiehst, läuft der Abspann. Danach geht es zurück zum Titel. Speichere vorher, wenn du am Strand weiterspielen willst.' },
        ],
        choices: [
          { text: 'Abspann ansehen.', next: 'los' },
          { text: 'Noch nicht. Der Sommer ist noch lang.' },
        ],
      },
      {
        id: 'los',
        lines: [{ speaker: 'narrator', text: 'Die Sonne setzt sich aufs Wasser. Irgendwer dreht die Musik lauter. Du lehnst dich zurück und lässt die Fotos laufen.' }],
        effects: [{ ending: true }],
      },
    ],
  },
};

export const part: ContentPart = {
  maps: { [meer.id]: meer },
  dialogues,
};
