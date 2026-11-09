// Rennhalle 9 (world.md §3.4 Mi/Sa, §3.6, §3.9 akt-schrottbot-rennen, §4.7 Oberlicht/Traverse, §10.6 Rennnacht;
// Plan design/plan/act23.json maps.rennhalle-9, Paket pkg-rennhalle-meer).
// Innenraum 1536×1024: Wellblechhalle mit ovaler Schrottbot-Bahn, Reifen-Innenfeld, Startrampe, Boxengasse (links),
// Tribüne (oben rechts), Wettschalter und Siegerpodest (rechts), alte Kabelbrand-Bühne unter Planen (oben links),
// die gestürzte Lichttraverse davor, Lichtfleck des Glasoberlichts. Rolltor unten zur Hafenkante.
// Wiedereröffnung: setzt `rennhalle-9-geoeffnet` ab Akt 2 per mapAdditions.hafenkante.onEnter (unten).
// Dazu das Strand-Shuttle an hafenkante:faehre (act23.json notes), weil es auf den Einstieg das-meer/shuttle zeigt.
// Geometrie am fertigen Bild game/public/assets/bg/rennhalle-9.webp nachgezogen (scripts/map_tool.mjs).
// Nicht hier: Turbo-Tilda (Tagesablauf N Mi/Sa an der boxengasse), sonder-letzte-runde (alte-buehne),
// prep-fahrzeug und pers-lio-album (rennbahn) – per Spot-Name von den Quest-Paketen.
import type { CheckDef, Condition, DialogueChoice, DialogueDef, DialogueNode, Effect, MapDef, Point, Polygon, Rect } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const box = ([x, y, w, h]: Rect): Polygon => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];

/** Benannte Punkte (Plan-IDs aus act23.json). */
const S = {
  rolltor: [768, 880],
  rennbahn: [455, 700],
  startrampe: [452, 600],
  boxengasse: [285, 600],
  tribuene: [1150, 345],
  wettschalter: [1300, 560],
  siegerpodest: [1415, 722],
  'alte-buehne': [330, 372],
  traverse: [640, 392],
  oberlicht: [850, 250],
} satisfies Record<string, Point>;

const at = (id: keyof typeof S): Point => S[id];
const off = (id: keyof typeof S, dx: number, dy: number): Point => [S[id][0] + dx, S[id][1] + dy];

/** Rennnacht: Mittwoch und Samstag 21–01 Uhr (world.md §10.6). */
const RENNNACHT: Condition = { all: [{ weekday: ['mi', 'sa'] }, { clockBetween: [1260, 1500] }] };
const KEINE_RENNNACHT: Condition = { not: RENNNACHT };
const VEX: Condition = { playerIs: 'vex' };
const ARIA: Condition = { companion: 'aria' };
const GETUNT: Condition = { flag: 'heute_bot_getunt' };
const POKAL: Condition = { flag: 'rennhalle_pokal' };

// ---------------------------------------------------------------------------------------------- Wetten
// Der Sieger einer Rennnacht hängt am Zyklustag (fest je Spielstand und Tag, Neuladen ändert nichts).
type Bot = 'bueffel' | 'oma' | 'wagen';
const SIEG: Record<Bot, number[]> = {
  bueffel: [1, 2, 5, 6, 9, 10, 13, 14, 17, 18, 21, 22, 25, 26],
  oma: [3, 7, 11, 15, 19, 23, 27],
  wagen: [4, 8, 12, 16, 20, 24, 28],
};
const BOTS: Record<Bot, { name: string; quote: number; lauf: string; sieg: string }> = {
  bueffel: {
    name: 'Blechbüffel', quote: 2,
    lauf: 'Der Blechbüffel walzt los wie ein Kühlschrank mit Wut im Bauch. Er rammt alles, was sich bewegt, und zwei Dinge, die sich nicht bewegen.',
    sieg: 'Der Büffel kracht als Erster über die Ziellinie, durch die Bande und halb in die Tribüne. Zählt. Die Buchmacherin zahlt mit Leichenbittermiene.',
  },
  oma: {
    name: 'Oma Kawumm', quote: 3,
    lauf: 'Oma Kawumm, ein Rasenmäher mit Raketenmotor und Häkeldeckchen, startet als Letzte. Dann zündet der Nachbrenner.',
    sieg: 'Oma Kawumm fliegt auf der Zielgeraden an allen vorbei, verliert das Häkeldeckchen und gewinnt mit brennendem Hintern. Die Halle steht Kopf.',
  },
  wagen: {
    name: 'Der Einkaufswagen', quote: 5,
    lauf: 'Der Einkaufswagen. Ein echter Einkaufswagen mit zwei Akkuschraubern und einem quietschenden Rad. Die Halle lacht. Noch.',
    sieg: 'Vorne crashen der Büffel und Oma Kawumm ineinander. Der Einkaufswagen eiert seelenruhig durch das brennende Wrack und rollt als Erster über die Linie. Die Buchmacherin wird blass.',
  },
};
const EINSATZ = 30;

const bauche: CheckDef = { id: 'rennhalle-bots-lesen', attribute: 'technik', threshold: 6, tags: ['maschine', 'technik'], label: '[Technik 6]' };

function wettNodes(): DialogueNode[] {
  const nodes: DialogueNode[] = [];
  for (const bot of Object.keys(BOTS) as Bot[]) {
    const b = BOTS[bot];
    nodes.push({
      id: `lauf-${bot}`,
      lines: [
        { speaker: 'narrator', text: `Du schiebst ${EINSATZ} Cr durchs Gitter. Die Buchmacherin knallt einen Stempel auf den Schein: „${b.name}. Quote ${b.quote} zu 1. Viel Glück, Schätzchen. Brauchst du.“` },
        { speaker: 'narrator', text: 'Startschuss. Funken, Qualm, ein Rad fliegt in die Tribüne und wird dort begeistert behalten.' },
        { speaker: 'narrator', text: b.lauf },
      ],
      choices: [
        { text: 'Hinsehen.', when: { cycleDay: SIEG[bot] }, next: `sieg-${bot}` },
        { text: 'Hinsehen.', when: { not: { cycleDay: SIEG[bot] } }, next: 'pleite' },
      ],
    });
    nodes.push({
      id: `sieg-${bot}`,
      lines: [{ speaker: 'narrator', text: b.sieg }],
      effects: [{ credits: EINSATZ * b.quote }, { message: `Wette gewonnen: ${EINSATZ * b.quote} Cr.` }],
    });
  }
  return nodes;
}

const wettChoices: DialogueChoice[] = (Object.keys(BOTS) as Bot[]).map((bot) => ({
  text: `${EINSATZ} Cr auf „${BOTS[bot].name}“ (Quote ${BOTS[bot].quote} zu 1).`,
  requires: { credits: EINSATZ },
  next: `lauf-${bot}`,
  effects: [{ credits: -EINSATZ }, { setFlag: 'heute_rennhalle_wette' }] as Effect[],
}));

const wetten: DialogueDef = {
  id: 'rennhalle-wetten',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        { speaker: 'narrator', text: 'Hinter dem Gitter sitzt die Buchmacherin: Augenklappe, Rechenschieber, Zigarillo, das nie brennt. Auf der Tafel hinter ihr nur Striche und Totenköpfe.' },
        { speaker: 'narrator', text: '„Drei Bots heute. Einsatz dreißig, keiner mehr, keiner weniger, ich bin ein seriöses Unternehmen. Und wer heult, fliegt raus.“' },
      ],
      choices: [
        { text: 'Erst die Bots in der Boxengasse abchecken.', check: bauche, next: 'tipp', id: 'rh-wette-tipp' },
        { text: 'Wer ist Favorit?', next: 'favorit', id: 'rh-wette-favorit' },
        ...wettChoices,
        { text: 'Nur gucken. Mein Geld bleibt bei mir.' },
      ],
    },
    {
      id: 'favorit',
      lines: [{ speaker: 'narrator', text: '„Favorit? Der Büffel. Immer der Büffel. Bis er’s nicht ist. Dafür gibt’s Quoten, Schätzchen, und dafür gibt’s mich.“' }],
      next: 'wahl',
    },
    {
      id: 'tipp',
      lines: [
        { speaker: 'narrator', text: 'Du schlenderst die Boxengasse runter, als ob du da hingehörst. Ein Blick auf Lager, Akkus, Schweißnähte. Die Schrauber merken nichts. Oder es ist ihnen egal.' },
      ],
      choices: [
        { text: 'Und?', when: { cycleDay: SIEG.bueffel }, next: 'tipp-bueffel' },
        { text: 'Und?', when: { cycleDay: SIEG.oma }, next: 'tipp-oma' },
        { text: 'Und?', when: { cycleDay: SIEG.wagen }, next: 'tipp-wagen' },
      ],
    },
    {
      id: 'tipp-bueffel',
      lines: [{ speaker: 'narrator', text: 'Oma Kawumms Nachbrenner ist mit Klebeband geflickt, der Einkaufswagen hat ein Rad, das nach links will. Der Büffel dagegen: frisch gefettet, doppelt verschraubt. Der rollt heute durch.' }],
      next: 'wahl',
    },
    {
      id: 'tipp-oma',
      lines: [{ speaker: 'narrator', text: 'Beim Büffel tropft Öl aus dem Getriebe, ganz leise. Oma Kawumm hat einen neuen Raketenmotor, und ihr Schrauber grinst wie jemand, der mehr weiß. Tipp: Oma.' }],
      next: 'wahl',
    },
    {
      id: 'tipp-wagen',
      lines: [{ speaker: 'narrator', text: 'Büffel und Oma stehen nebeneinander am Start. Beide Schrauber wollen auf Rammen fahren. Wenn die sich in Kurve eins küssen, ist nur noch einer übrig: der Einkaufswagen.' }],
      next: 'wahl',
    },
    {
      id: 'wahl',
      lines: [{ speaker: 'narrator', text: 'Die Buchmacherin trommelt auf den Tresen. „Und? Ich hab nicht ewig. Ich hab genau bis Startschuss.“' }],
      choices: [...wettChoices, { text: 'Doch nicht. Mein Geld bleibt bei mir.' }],
    },
    ...wettNodes(),
    {
      id: 'pleite',
      lines: [
        { speaker: 'narrator', text: 'Dein Bot liegt nach Kurve zwei auf dem Rücken und strampelt. Die Buchmacherin steckt deinen Einsatz ein, ohne hinzusehen.' },
        { speaker: 'narrator', text: '„Nächstes Mal, Schätzchen. Oder übernächstes. Oder lass es einfach, dann bin ich wenigstens nicht schuld.“' },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------------------------- Bot-Tuning
const tuningCheck: CheckDef = { id: 'rennhalle-bot-tuning', attribute: 'technik', threshold: 6, tags: ['maschine', 'technik'], label: '[Technik 6]' };

const tuning: DialogueDef = {
  id: 'rennhalle-tuning',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        { speaker: 'narrator', text: 'Leihbot Nummer 7 steht aufgebockt in der Box: ein Staubsauger mit Ketten, einem Rammbock und dem Selbstbewusstsein eines Panzers. Der Motor stottert.' },
        { speaker: 'narrator', text: 'Ein Schrauber mit Ölgesicht hält dir den Schraubenschlüssel hin. „Selber machen oder machen lassen? Machen lassen kostet vierzig.“' },
      ],
      choices: [
        { text: 'Ich mach das. Vergaser, Übersetzung, Bremse raus.', check: tuningCheck, next: 'selbst' },
        { text: 'Hier sind vierzig. Mach ihn schnell.', requires: { credits: 40 }, effects: [{ credits: -40 }], next: 'lassen' },
        { text: 'Lass mal. Der läuft schon.' },
      ],
    },
    {
      id: 'selbst',
      lines: [
        { speaker: 'narrator', text: 'Drei Handgriffe, ein Fluch, ein Kabel, das jetzt woanders steckt. Nummer 7 brüllt auf wie ein beleidigter Bär.' },
        { speaker: 'narrator', text: 'Der Schrauber pfeift durch die Zähne. „Wo hast du das gelernt?“ – „Internet.“ – „Gibt’s nicht mehr.“ – „Eben.“' },
      ],
      effects: [{ setFlag: 'heute_bot_getunt' }, { message: 'Bot getunt: Das Rennen heute Nacht wird leichter.' }],
    },
    {
      id: 'lassen',
      lines: [{ speaker: 'narrator', text: 'Der Schrauber verschwindet halb im Bot. Es klappert, zischt, einmal schreit er kurz. Dann tätschelt er Nummer 7. „Der fliegt jetzt. Nicht wörtlich. Hoffentlich.“' }],
      effects: [{ setFlag: 'heute_bot_getunt' }, { message: 'Bot getunt: Das Rennen heute Nacht wird leichter.' }],
    },
  ],
};

// ---------------------------------------------------------------------------------------------- Rennen
const rennenWin: Effect[] = [
  { credits: 80 }, { xp: 30 },
  { message: 'Erster! Die Tribüne bebt, irgendwer wirft dir eine Bierdose zu. Voll. 80 Cr Preisgeld.' },
];
const rennenLose: Effect[] = [{ message: 'Dein Bot parkt in den Reifen. Die Tribüne johlt trotzdem. Hier johlt man über alles, was brennt.' }];

const rennhalle: MapDef = {
  id: 'rennhalle-9',
  name: 'Rennhalle 9',
  subtitle: 'Hafenkante · Schrottbot-Rennen Mi und Sa',
  size: [1536, 1024],
  district: 'unterstadt',
  lighting: 'indoor',
  bg: 'bg-rennhalle-9',
  bgVariants: [{ when: RENNNACHT, bg: 'bg-rennhalle-9-rennnacht' }],
  walk: [
    [
      [245, 352], [640, 352], [640, 186], [1062, 186], [1062, 320], [1285, 320], [1285, 562], [1520, 585], [1520, 698],
      [1362, 698], [1362, 902], [962, 902], [962, 1024], [574, 1024], [574, 902], [312, 902], [312, 874], [245, 874],
    ],
  ],
  block: [
    [[412, 268], [470, 262], [760, 274], [850, 335], [842, 370], [640, 356], [420, 356]], // gestürzte Traverse
    box([545, 470, 586, 212]), // Innenfeld mit Reifenwand
    box([384, 490, 132, 66]), // Startrampe
    box([1330, 596, 176, 86]), // Siegerpodest
    box([238, 718, 44, 88]), // Reifenstapel an der Boxengasse
    box([1225, 892, 100, 132]), // Palette
  ],
  exits: [
    { id: 'nach-hafenkante', rect: [600, 1000, 336, 24], to: 'hafenkante', entry: 'von-rennhalle-9', label: 'Rolltor zur Hafenkante' },
  ],
  entries: {
    'von-hafenkante': { at: [768, 948], facing: 'n' },
  },
  spots: Object.fromEntries(Object.entries(S).map(([id, p]) => [id, { at: p }])),
  hotspots: [
    // ---------------------------------------------------------------- Schrottbot-Rennen (world.md §3.9)
    {
      id: 'schrottbot-rennen', at: at('rennbahn'), radius: 60, label: 'Schrottbot-Rennen fahren', kind: 'use',
      when: { all: [RENNNACHT, { not: GETUNT }] },
      lines: [{ speaker: 'narrator', text: 'Startgeld: Mut. Leihbot: Nummer 7, ein Staubsauger mit Ketten. Der Rennleiter hebt eine Flagge, die mal ein Bettlaken war.' }],
      effects: [{ minigame: 'akt-schrottbot-rennen', level: 2, key: 'rennhalle-rennen', label: 'Rennnacht in Halle 9', win: rennenWin, lose: rennenLose }],
    },
    {
      id: 'schrottbot-rennen-getunt', at: at('rennbahn'), radius: 60, label: 'Schrottbot-Rennen fahren (getunt)', kind: 'use',
      when: { all: [RENNNACHT, GETUNT] },
      lines: [{ speaker: 'narrator', text: 'Nummer 7 brummt wie ein frisch gefütterter Bär. Die anderen Schrauber gucken rüber. Lass sie gucken.' }],
      effects: [{ minigame: 'akt-schrottbot-rennen', level: 1, key: 'rennhalle-rennen', label: 'Rennnacht in Halle 9 (getunt)', win: rennenWin, lose: rennenLose }],
    },
    {
      id: 'pokalrennen', at: at('startrampe'), radius: 50, label: 'Pokalrennen fahren', kind: 'use',
      when: { all: [RENNNACHT, { wonMinigame: 'rennhalle-rennen' }] },
      lines: [
        { speaker: 'narrator', text: 'Die Startrampe. Hier fahren nur die, die schon mal gewonnen haben. Heute: du und drei Bots, die aussehen, als hätten sie schon Leute gefressen.' },
        { speaker: 'narrator', text: 'Auf dem Podest blitzt der Pokal: ein verbeulter Goldbecher mit eingebauter Glühbirne. Unbezahlbar. Also, wertlos. Aber unbezahlbar.' },
      ],
      effects: [{
        minigame: 'akt-schrottbot-rennen', level: 4, key: 'rennhalle-pokal', label: 'Pokalrennen in Halle 9',
        win: [
          { credits: 250 }, { xp: 80 }, { setFlag: 'rennhalle_pokal' },
          { message: 'Pokalsieg! 250 Cr, und der Goldbecher trägt jetzt deinen Namen. Mit Edding. Falsch geschrieben. Egal.' },
        ],
        lose: [{ message: 'Zweiter. Der Sieger-Bot fährt eine Ehrenrunde über deinen. Dreimal.' }],
      }],
    },
    {
      id: 'training', at: at('rennbahn'), radius: 60, label: 'Trainingsrunde fahren', kind: 'use',
      when: { all: [KEINE_RENNNACHT, { time: ['tag', 'abend'] }] },
      lines: [{ speaker: 'narrator', text: 'Tagsüber ist die Bahn leer. Ein Schrauber verleiht Nummer 7 für eine Runde gegen eine Nougatbombe. Und gegen die Zusage, nichts kaputt zu machen, was nicht schon kaputt ist.' }],
      effects: [{
        minigame: 'akt-schrottbot-rennen', level: 1, key: 'rennhalle-training', label: 'Trainingsrunde',
        win: [{ xp: 10 }, { message: 'Saubere Runde. Der Schrauber nickt anerkennend. Mittwochs und samstags ab neun gilt’s.' }],
        lose: [{ message: 'Nummer 7 fährt sich an der Startrampe fest und macht ein Geräusch, das nach Trauer klingt.' }],
      }],
    },
    {
      id: 'rennbahn-leer', at: at('rennbahn'), radius: 60, label: 'Rennbahn ansehen', kind: 'look',
      when: { all: [KEINE_RENNNACHT, { not: { time: ['tag', 'abend'] } }] },
      lines: [
        { speaker: 'narrator', text: 'Die Bahn liegt still. Reifenspuren in Kreisen, Ölflecken in Form von Kontinenten, die Ziellinie frisch nachgemalt.' },
        { speaker: 'narrator', text: 'Ein Schild an der Bande: „RENNNACHT MI + SA AB 21 UHR. Wer vorher fährt, fährt allein. Und zahlt.“' },
      ],
    },
    {
      id: 'bot-tuning', at: off('boxengasse', 0, -60), radius: 50, label: 'Bot tunen', kind: 'use', dialogue: 'rennhalle-tuning',
      when: { all: [RENNNACHT, { not: GETUNT }] },
    },
    {
      id: 'boxengasse', at: off('boxengasse', 0, -60), radius: 50, label: 'Boxengasse ansehen', kind: 'look',
      when: KEINE_RENNNACHT,
      lines: [
        { speaker: 'narrator', text: 'Drei Wellblechboxen, jede mit Werkbank, Schweißgerät und einem halbfertigen Rennbot. In der mittleren hängt ein Kalender mit Bots in Badehose.' },
        { speaker: 'narrator', text: 'Auf einer Tafel steht der Rekord der Halle: „TURBO-TILDA – 41,3 s“. Darunter, nachträglich: „ODER SO“.' },
      ],
    },
    {
      id: 'schrottkiste', at: [285, 800], radius: 44, label: 'In der Schrottkiste wühlen', kind: 'loot', daily: true,
      lines: [{ speaker: 'narrator', text: 'Eine Kiste mit „ZU VERSCHENKEN“. Unten drunter, zwischen Kabelresten und einem einzelnen Plüschwürfel: ein brauchbares Teil.' }],
      effects: [{ give: 'schrott-ersatzteil' }],
    },
    // ---------------------------------------------------------------- Wetten
    {
      id: 'wettschalter', at: at('wettschalter'), radius: 56, label: 'Wetten (30 Cr)', kind: 'use', dialogue: 'rennhalle-wetten',
      when: { all: [RENNNACHT, { notFlag: 'heute_rennhalle_wette' }] },
    },
    {
      id: 'wettschalter-gewettet', at: at('wettschalter'), radius: 56, label: 'Wettschalter', kind: 'look',
      when: { all: [RENNNACHT, { flag: 'heute_rennhalle_wette' }] },
      lines: [{ speaker: 'narrator', text: '„Ein Schein pro Nase und Nacht, Schätzchen. Ich will dich nicht ruinieren. Das macht das Leben schon.“' }],
    },
    {
      id: 'wettschalter-zu', at: at('wettschalter'), radius: 56, label: 'Wettschalter ansehen', kind: 'look', when: KEINE_RENNNACHT,
      lines: [
        { speaker: 'narrator', text: 'Gitter runter, Lampe aus. Auf der Kreidetafel stehen nur Striche, Totenköpfe und ein sehr detailliert gezeichneter Einkaufswagen mit Heiligenschein.' },
        { speaker: 'narrator', text: 'Ein Zettel: „Wetten nur Mi + Sa, Rennnacht. Kein Kredit. Kein Gejammer. Keine Ausnahme. Auch nicht für dich, Dexter.“' },
      ],
    },
    // ---------------------------------------------------------------- Orte zum Ansehen
    {
      id: 'siegerpodest', at: at('siegerpodest'), radius: 54, label: 'Siegerpodest', kind: 'look', when: { not: POKAL },
      lines: [
        { speaker: 'narrator', text: 'Drei Kisten, rot gestrichen, die mittlere am höchsten. Oben drauf der Pokal: ein verbeulter Goldbecher, in den jemand eine Glühbirne geschraubt hat. Er leuchtet, wenn man ihn hochhebt.' },
        { speaker: 'narrator', text: 'Eingraviert: siebenmal „TILDA“, einmal „DER EINKAUFSWAGEN“ und einmal „SCHNUFFI“. Keiner weiß, wer Schnuffi war.' },
      ],
    },
    {
      id: 'siegerpodest-pokal', at: at('siegerpodest'), radius: 54, label: 'Dein Pokal', kind: 'look', when: POKAL,
      lines: [
        { speaker: 'narrator', text: 'Der Goldbecher steht wieder auf der obersten Kiste. Unter „SCHNUFFI“ steht jetzt mit Edding dein Name. Falsch geschrieben, aber mit Herz drumherum.' },
        { speaker: 'narrator', text: 'Du hebst ihn kurz an. Die Glühbirne geht an. Irgendwo auf der Tribüne klatscht jemand, der eigentlich nur aufwachen wollte.' },
      ],
    },
    {
      id: 'tribuene', at: at('tribuene'), radius: 60, label: 'Tribüne', kind: 'look',
      lines: [
        { speaker: 'narrator', text: 'Holzbänke auf Stahlgerüst, sieben Reihen, voller Becher, Kronkorken und verlorener Wettscheine. Die oberste Reihe wackelt. Da sitzen die Stammgäste.' },
        { speaker: 'narrator', text: 'In eine Bank ist geritzt: „Rennen sind wie Liebe. Laut, teuer, und am Ende brennt was.“' },
      ],
    },
    {
      id: 'alte-buehne', at: at('alte-buehne'), radius: 64, label: 'Verhängte Bühne', kind: 'look',
      lines: [
        { speaker: 'narrator', text: 'Eine Bühne unter grauen Planen, festgezurrt wie ein Unfall, über den keiner reden will. An einer Ecke schaut ein Boxenturm raus, darauf ein halber Blitz: das Logo von „Kabelbrand“.' },
        { speaker: 'narrator', text: 'Seit dem Abschiedskonzert 2083 hat hier niemand mehr gespielt. Am Bühnenrand stehen Kerzen und vertrocknete Blumen. Jemand bringt immer neue. Niemand gibt zu, wer.' },
      ],
    },
    {
      id: 'traverse', at: at('traverse'), radius: 60, label: 'Die gestürzte Traverse', kind: 'look',
      when: { not: { any: [VEX, ARIA] } },
      lines: [
        { speaker: 'narrator', text: 'Ein Lichtgerüst aus Aluminium, zwölf Meter lang, verrostet, zwei Scheinwerfer hängen noch dran wie gebrochene Finger. Es liegt da, wo es vor drei Jahren hingefallen ist.' },
        { speaker: 'narrator', text: 'Die Rennleute fahren drum herum. Keiner räumt es weg. „Das gehört hierher“, sagt der Rennleiter, und dann redet er sehr schnell über etwas anderes.' },
      ],
    },
    {
      id: 'traverse-aria', at: at('traverse'), radius: 60, label: 'Die gestürzte Traverse', kind: 'look',
      when: { all: [ARIA, { not: VEX }] },
      lines: [
        { speaker: 'narrator', text: 'Aria bleibt stehen. Sie sieht nicht hin. Sie sieht so angestrengt nicht hin, dass es lauter ist als jedes Rennen.' },
        { speaker: 'aria', expr: 'besorgt', text: 'Da lag ich. Genau da, wo der linke Scheinwerfer ist. Riecht immer noch nach verbranntem Kabel. Bilde ich mir ein. Weiß ich.' },
        { speaker: 'aria', expr: 'wut', text: 'Können wir weitergehen? Nicht weil ich Angst hab. Ich hab keine Angst. Ich hab nur keinen Bock auf diese Scheiß-Traverse.' },
      ],
      effects: [{ markSeen: 'rennhalle-traverse-aria' }],
    },
    {
      id: 'traverse-vex', at: at('traverse'), radius: 60, label: 'Die gestürzte Traverse', kind: 'look',
      when: { all: [VEX, { not: ARIA }] },
      lines: [
        { speaker: 'narrator', text: 'Zwölf Meter Aluminium, verrostet. Von oben, durchs Oberlicht, sah sie damals aus wie ein Lineal aus Licht. Dann wie ein fallendes.' },
        { speaker: 'player', text: 'Kas hat mich weggezogen. „Nie umdrehen.“ Unten hat jemand geschrien. Ich hab mich nicht umgedreht.' },
      ],
    },
    {
      id: 'traverse-vex-aria', at: at('traverse'), radius: 60, label: 'Die gestürzte Traverse', kind: 'look',
      when: { all: [VEX, ARIA] },
      lines: [
        { speaker: 'narrator', text: 'Aria steht neben dir. Ganz nah. Ihr Zerberster brummt leise, ihre echte Hand sucht deine Jacke und hält sich am Saum fest wie an einem Geländer.' },
        { speaker: 'player', text: 'Ich war da oben. Damals. Ich hab dich schreien hören.' },
        { speaker: 'aria', expr: 'trauer', text: 'Und du hast dich nicht umgedreht. Ich weiß. Heute stehst du hier. Das zählt mehr. Halt einfach die Klappe und bleib stehen, ja?' },
      ],
      effects: [{ markSeen: 'rennhalle-traverse-vexaria' }],
    },
    {
      id: 'oberlicht', at: at('oberlicht'), radius: 60, label: 'Zum Oberlicht hochschauen', kind: 'look', when: { not: VEX },
      lines: [
        { speaker: 'narrator', text: 'Hoch oben im Dach ein Glasoberlicht, schmutzig, an einer Ecke mit Blech geflickt. Durch die Scheiben fällt ein Lichtstreifen auf den Beton, in dem der Staub tanzt.' },
        { speaker: 'narrator', text: 'Man sieht Fußabdrücke auf dem Glas. Von außen. Wer klettert denn bitte auf das Dach einer Rennhalle?' },
      ],
    },
    {
      id: 'oberlicht-vex', at: at('oberlicht'), radius: 60, label: 'Zum Oberlicht hochschauen', kind: 'look', when: VEX,
      lines: [
        { speaker: 'narrator', text: 'Das Oberlicht. Von hier unten winzig. Von oben war es eine Bühne aus Glas, warm vom Licht darunter, und Kas lag auf dem Rücken und sang jedes Lied mit. Falsch. Laut. Glücklich.' },
        { speaker: 'player', text: 'Kein Ticket, kein Problem, hat er gesagt. Bester Platz der Stadt.' },
        { speaker: 'narrator', text: 'Die Ecke mit dem Blech. Da hat die Scheibe damals nachgegeben, als ihr gerannt seid.' },
      ],
    },
    {
      id: 'rolltor-innen', at: off('rolltor', 260, -10), radius: 44, label: 'Plakatwand', kind: 'look',
      lines: [
        { speaker: 'narrator', text: 'Plakate über Plakaten: „WIEDERERÖFFNUNG!“, „SCHROTTBOTS – BLECH, DAS BRENNT“, und ganz unten, halb überklebt, ein altes Konzertplakat. Ein Blitz, ein Kabel, „ABSCHIEDSTOUR“.' },
        { speaker: 'narrator', text: 'Jemand hat das Datum mit Edding schwarz übermalt. Sehr gründlich.' },
      ],
    },
  ],
  lights: [
    { at: [240, 20], radius: 130, color: '#ff3fa4', intensity: 0.6 },
    { at: [1305, 20], radius: 130, color: '#ff3fa4', intensity: 0.6 },
    { at: [18, 180], radius: 110, color: '#ff3fa4', intensity: 0.5 },
    { at: [18, 330], radius: 110, color: '#3ef2ff', intensity: 0.5 },
    { at: [18, 480], radius: 110, color: '#3ef2ff', intensity: 0.5 },
    { at: [712, 100], radius: 110, color: '#3ef2ff', intensity: 0.5 },
    { at: [1045, 100], radius: 110, color: '#3ef2ff', intensity: 0.5 },
    { at: [668, 60], radius: 70, color: '#ff2a2a', intensity: 0.7 },
    { at: [1078, 60], radius: 70, color: '#ff2a2a', intensity: 0.7 },
    { at: [545, 872], radius: 80, color: '#ff2a2a', intensity: 0.7 },
    { at: [990, 872], radius: 80, color: '#ff2a2a', intensity: 0.7 },
    { at: [1400, 410], radius: 90, color: '#ff2a2a', intensity: 0.6 },
    { at: [175, 390], radius: 120, color: '#ffcf7a', intensity: 0.7 },
    { at: [165, 545], radius: 120, color: '#ffcf7a', intensity: 0.7 },
    { at: [165, 710], radius: 120, color: '#ffcf7a', intensity: 0.7 },
    { at: [1415, 590], radius: 70, color: '#ffd84a', intensity: 0.6 },
    { at: [850, 200], radius: 200, color: '#bfe8ff', intensity: 0.45, slots: ['morgen', 'tag'] },
    { at: [768, 960], radius: 160, color: '#3ef2ff', intensity: 0.5, slots: ['abend', 'nacht'] },
    { at: [185, 300], radius: 50, color: '#ffb35a', intensity: 0.6 },
  ],
  ambience: 'club',
  ambient: {
    count: 3,
    bySlot: { morgen: 0, tag: 2, abend: 3, nacht: 6 },
    sprites: ['passant-schrotti-walk', 'passant-arbeiterin-walk', 'passant-punk-walk', 'passant-kurier-walk', 'passant-tourist-walk'],
    routes: [
      [[768, 940], [700, 760], [420, 760], [300, 420]],
      [[1200, 360], [1240, 760], [1000, 840], [600, 840]],
      [[300, 420], [800, 420], [1200, 420]],
      [[1300, 575], [1200, 780], [800, 860]],
    ],
    barks: [
      { text: 'Rennen in Halle 9: Turbo-Tilda siegt, Zweiter ist ein Einkaufswagen. Ich war dabei!' },
      { text: 'Wer hat mein Rad geklaut? Das war am Bot festgeschraubt!' },
      { text: 'Mittwoch und Samstag. Den Rest der Woche lebe ich nur so halb.' },
      { text: 'Nicht zur Bühne gucken. Bringt Unglück. Und schlechte Laune.' },
      { text: 'Ich setz alles auf den Büffel! Alles heißt: dreißig. Mehr nimmt sie ja nicht.', when: RENNNACHT },
      { text: 'Oma Kawumm brennt schon wieder! Ist das Absicht? Ist das Absicht?!', when: RENNNACHT },
      { text: 'Vorne sitzen nur Anfänger. Da fliegen die Räder hin.', when: RENNNACHT },
      { text: 'HALLE NEUN! HALLE NEUN! … Ich hab Stimmbruch. Seit gestern. Mit vierzig.', when: RENNNACHT },
      { text: 'Tagsüber ist das hier wie Kirche. Nur mit mehr Öl.', when: KEINE_RENNNACHT },
      { text: 'Mein Nachbar sagt jetzt immer „Ja, Master“. Sogar beim Wetten. Er verliert trotzdem.', when: { act: 2 } },
      { text: 'Die Bildschirme in der Stadt sind aus. Hier waren eh nie welche. Hier gibt’s Feuer.', when: { flag: 'epilog' } },
    ],
  },
  onEnter: [
    { id: 'rennhalle-9-erstbesuch', once: true, dialogue: 'rennhalle-9-ankunft', effects: [{ markSeen: 'rennhalle-9-betreten' }] },
    {
      id: 'rennhalle-9-aria', dialogue: 'rennhalle-9-aria',
      when: { all: [ARIA, { notFlag: 'heute_rennhalle_aria' }, { not: { flag: 'vexaria_konzert' } }] },
      effects: [{ setFlag: 'heute_rennhalle_aria' }],
    },
    {
      id: 'rennhalle-9-aria-danach', dialogue: 'rennhalle-9-aria-danach',
      when: { all: [ARIA, { notFlag: 'heute_rennhalle_aria' }, { flag: 'vexaria_konzert' }] },
      effects: [{ setFlag: 'heute_rennhalle_aria' }],
    },
  ],
};

const dialogues: Record<string, DialogueDef> = {
  'rennhalle-9-ankunft': {
    id: 'rennhalle-9-ankunft',
    start: 'a',
    nodes: [
      {
        id: 'a',
        lines: [
          { speaker: 'narrator', text: 'Rennhalle 9. Wellblech, Öl, Gummi und ein Geruch nach verbranntem Kabel, der nie ganz rausgegangen ist. In der Mitte eine Bahn, auf der Bots aus Müll um Ruhm und Credits rammen.' },
          { speaker: 'narrator', text: 'Oben links eine Bühne unter Planen. Davor ein umgestürztes Lichtgerüst, um das alle herumfahren, als wär’s ein Grab. Ist es vielleicht auch.' },
        ],
      },
    ],
  },
  'rennhalle-9-aria': {
    id: 'rennhalle-9-aria',
    start: 'a',
    nodes: [
      {
        id: 'a',
        lines: [
          { speaker: 'narrator', text: 'Aria bleibt im Rolltor stehen. Ihr Zerberster ist zur Faust geballt, die Silberfinger knirschen. Dann geht sie doch rein. Dicht hinter dir. Den Blick stur nach rechts.' },
          { speaker: 'aria', expr: 'wut', text: 'Sag nichts. Ich bin hier, weil du hier bist. Nicht wegen der Halle. Die Halle kann mich mal.' },
        ],
        choices: [
          { text: 'Wir sind schnell wieder draußen.', effects: [{ relation: 'aria', delta: 5 }] },
          { text: '„Hundert Meter.“ Ich bleib zwischen dir und der Bühne.', when: { playerIs: 'vex' }, effects: [{ relation: 'aria', delta: 10 }], next: 'vex' },
          { text: 'Ist doch nur eine Halle.', next: 'nur' },
        ],
      },
      {
        id: 'vex',
        lines: [{ speaker: 'aria', expr: 'verlegen', text: 'Arschloch. Hör auf, so nett zu sein, sonst muss ich dich vor allen Leuten umarmen. … Okay. Bleib da stehen.' }],
      },
      {
        id: 'nur',
        lines: [{ speaker: 'aria', expr: 'wut', text: 'Für dich vielleicht. Für mich ist das der Ort, an dem mein Arm noch liegt. Also halt die Fresse und lass uns machen, was wir machen müssen.' }],
        effects: [{ relation: 'aria', delta: -10 }],
      },
    ],
  },
  'rennhalle-9-aria-danach': {
    id: 'rennhalle-9-aria-danach',
    start: 'a',
    nodes: [
      {
        id: 'a',
        lines: [
          { speaker: 'narrator', text: 'Aria geht durchs Rolltor, als wär’s irgendeine Tür. Sie bleibt kurz stehen, schaut zur verhängten Bühne. Lange. Dann grinst sie schief.' },
          { speaker: 'aria', expr: 'freude', text: 'Neunzig Meter, Postbotin. Dann achtzig. Irgendwann reiß ich die Planen da runter und spiel selber. Schlecht. Aber laut.' },
        ],
      },
    ],
  },
  'rennhalle-wetten': wetten,
  'rennhalle-tuning': tuning,
};

export const part: ContentPart = {
  maps: { [rennhalle.id]: rennhalle },
  dialogues,
  mapAdditions: {
    hafenkante: {
      onEnter: [
        {
          id: 'rennhalle-9-wiedereroeffnung', once: true,
          when: { all: [{ act: 2 }, { notFlag: 'rennhalle-9-geoeffnet' }] },
          effects: [
            { setFlag: 'rennhalle-9-geoeffnet' },
            { message: 'An der Rennhalle 9 hängt die Zielflagge wieder draußen: „WIEDERERÖFFNUNG! Rennnacht Mi + Sa ab 21 Uhr.“' },
          ],
        },
      ],
      hotspots: [
        {
          id: 'strand-shuttle', at: 'faehre', radius: 56, label: 'Strand-Shuttle ans Meer', kind: 'use',
          when: { all: [{ flag: 'epilog' }, { any: [{ flag: 'strandclub_shuttle' }, { quest: 'side-strandclub', state: 'done' }] }] },
          lines: [
            { speaker: 'narrator', text: 'Am Fährsteg schaukelt das Strand-Shuttle, ein Kahn mit Sonnensegel, Lichterkette und einem Fahrplan, auf dem nur „Morgens. Mittags. Wenn’s passt.“ steht.' },
          ],
          effects: [{ travel: 'das-meer', entry: 'shuttle', minutes: 60 }],
        },
      ],
    },
  },
};
