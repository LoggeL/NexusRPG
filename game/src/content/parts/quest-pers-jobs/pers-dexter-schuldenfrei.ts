// pers-dexter-schuldenfrei · Sechs Gläubiger (world.md §6.5; Start bei he-dexter-6: Dexters Gläubigerbuch mit netten Notizen).
// Je Gläubiger: auszahlen, `[Ausstrahlung 5]` vertrösten, `[Straße 5]` Gegenrechnung aufmachen oder einen Arbeitsdeal aushandeln
// (ohne Check, Dexter arbeitet ab). Hunter steht auch im Buch – der kommt in Akt 2 (he-dexter-8).
// Belohnung: Dexters Leihhaus (eigener Laden mit besserem Ankauf) neben seinem Büro.
import type { Condition, QuestDef, ShopDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import {
  type Beitrag, L, N, P, active, all, any, beitrag, bye, c, chk, cr, done, flag, give, hearts, node, noFlag, nochWas, rel, seen,
  set, schritt, time, zeit,
} from './_lib';

const Q = 'pers-dexter-schuldenfrei';
const AKTIV = active(Q);
const DX = 'dexter';
const BUCH = 'dexters-glaeubigerbuch';

interface Glaeubiger {
  key: string; npc: string; name: string; summe: number; map: string; grund: string;
  klage: string; vertroestet: string; gegen: string; deal: string;
}

const LISTE: Glaeubiger[] = [
  {
    key: 'babette', npc: 'babette-bao', name: 'Babette', summe: 40, map: 'schrottmarkt', grund: 'angeschriebene Dampfnudeln',
    klage: 'Dexter? Der hat seit März angeschrieben. Achtundvierzig Dampfnudeln. Ich hab mitgezählt. Er hat jede einzelne gelobt. Lob macht nicht satt, Kindchen.',
    vertroestet: 'Ratenzahlung in Dampfnudeln? Er zahlt mir in Dampfnudeln, die er mir abkauft? … Das ist so dumm, das gefällt mir.',
    gegen: 'Er hat meinen Herd repariert? Zweimal? Und nie was gesagt? … Na gut. Dann sind wir quitt. Aber sag ihm nicht, dass ich gerührt bin.',
    deal: 'Er spült. Eine Woche. Jeden Abend. Und er singt dabei nicht. Das ist die wichtigste Bedingung.',
  },
  {
    key: 'gustav', npc: 'opa-gustav', name: 'Opa Gustav', summe: 60, map: 'schrottmarkt', grund: 'Kranmiete für eine Drohnenbergung',
    klage: 'Er hat meinen Kran gemietet, um eine Drohne aus der Halde zu fischen. Die Drohne war seine. Er hat sie selbst reingeworfen. Aus Versehen. Zweimal.',
    vertroestet: 'Ach, Kindchen. Ich hab Zeit. Ich hab mehr Zeit als Credits. Früher war hier alles grün, und Schulden hat man mit Handschlag vergessen.',
    gegen: 'Er hat Knurri das Bein geschweißt, als er lahmte? Für nichts? Ha! Dann schulde ich ihm was. Streich die Zeile.',
    deal: 'Er ölt meinen Kran. Jeden Sonntag. Einen Monat lang. Und er bringt seinen eigenen Lappen mit.',
  },
  {
    key: 'vincent', npc: 'vinyl-vincent', name: 'Vinyl-Vincent', summe: 80, map: 'schrottmarkt', grund: 'drei Platten auf Pump',
    klage: 'Drei Platten. Auf Pump. Er hat gesagt, er hört sie nur einmal an. Das war vor einem Jahr. Ich will meine Platten oder mein Geld. Oder beides. Vor allem beides.',
    vertroestet: 'Du redest wie ein Plattenhändler. Das ist das größte Kompliment, das ich habe. Gut. Er hat Zeit bis zum Herbst.',
    gegen: 'Er hat mir einen Plattenspieler verkauft, der nie lief? Und ich hab nie bezahlt? … Woher weißt du das? Gut. Quitt. Und Klappe.',
    deal: 'Er baut mir eine Drohne, die nachts meinen Stand bewacht. Eine, die beißt.',
  },
  {
    key: 'willi', npc: 'wett-willi', name: 'Wett-Willi', summe: 120, map: 'schrottmarkt', grund: 'Wettschulden vom Hütchenspiel',
    klage: 'Dexter hat siebenmal gewettet, dass die Kugel unter dem mittleren Hütchen ist. Sie war es nie. Sie ist es nie. Das ist das Geschäftsmodell, Freund.',
    vertroestet: 'Du hast ein Gesicht wie ein Hütchen. Man weiß nie, was drunter ist. Gefällt mir. Er hat Aufschub.',
    gegen: 'Du weißt, dass meine Hütchen Magnete haben? Und dass das illegal ist? Und dass der Richter montags hier vorbeigeht? … Ich streich die Schulden. Und du vergisst die Magnete.',
    deal: 'Er steht eine Woche neben mir und jubelt, wenn einer verliert. Professionell. Mit Hut.',
  },
  {
    key: 'volt', npc: 'oma-volt', name: 'Oma Volt', summe: 25, map: 'neon-gasse', grund: 'Blitzbrause auf Rechnung',
    klage: 'Fünfundzwanzig Credits Blitzbrause. Er hat gesagt, er braucht sie für „Forschung“. Kindchen, ich bin alt, aber nicht doof. Der hat sie getrunken.',
    vertroestet: 'Ach, der Junge. Er bringt mir jedes Jahr ein Weihnachtsgeschenk. Es ist immer kaputt. Aber er bringt es. Gut, er hat Zeit.',
    gegen: 'Er hat Opa Blech den Lautsprecher repariert, damit er wieder schimpfen kann? Ach, deshalb schimpft er wieder. Quitt, Kindchen.',
    deal: 'Er kehrt eine Woche lang den Kiosk. Morgens. Vor sieben. Er hasst Morgen. Genau deshalb.',
  },
  {
    key: 'klingel', npc: 'frau-klingel', name: 'Frau Klingel', summe: 30, map: 'schrottmarkt', grund: 'eine nicht bezahlte Radioreparatur',
    klage: 'WAS? Ach so, Dexter! Der hat mein Hörimplantat repariert, und jetzt spielt es Radio! Ich hab ihn bezahlt! Nein, ER sollte MICH bezahlen! Für die Schäden! Ich hör nur noch Schlager!',
    vertroestet: 'WAS? Geduld? Ja, Geduld hab ich. Ich hab Schlager. Schlager sind Geduld mit Akkordeon.',
    gegen: 'Er hat gar kein Geld genommen? Und das Radio war … ein Bonus? Ein BONUS? … Weißt du was, ich mag den Bonus. Quitt.',
    deal: 'Er baut einen Lautstärkeknopf ein. Einen echten. Damit ich wenigstens leiser Schlager hören kann.',
  },
];

const fl = (g: Glaeubiger) => `dx_${g.key}`;
const ALLE: Condition = all(...LISTE.map((g) => flag(fl(g))));

const quest: QuestDef = {
  id: Q, kind: 'personal', act: 1, giver: DX,
  title: 'Schuldenfrei (fast)',
  summary: 'Dexter schuldet der halben Unterstadt Geld – und hat neben jeden Namen etwas Nettes geschrieben. Sechs Gläubiger, sechs Gespräche. Hunter heben wir uns für später auf.',
  autoStart: any(seen('he-dexter-6'), hearts(DX, 6)),
  steps: [
    schritt('buch', 'Lass dir von Dexter das Gläubigerbuch geben (Wellblechbüro, Schrottmarkt).', 'dx_start', { marker: { map: 'schrottmarkt' } }),
    ...LISTE.map((g) => schritt(g.key, `${g.name}: ${g.summe} Cr für ${g.grund}.`, fl(g), { when: flag('dx_start'), marker: { map: g.map } })),
    schritt('fertig', 'Bring Dexter das Gläubigerbuch zurück.', 'dx_fertig', { when: all(flag('dx_start'), ALLE), marker: { map: 'schrottmarkt' } }),
  ],
  reward: { xp: 200, items: { 'beglichener-schuldschein': 1 }, relations: { dexter: 100 }, rep: { unterstadt: 5 } },
};

// ------------------------------------------------------------------------------------------- Dexter
const start = beitrag(DX, all(AKTIV, noFlag('dx_start')), '„Dein Gläubigerbuch. Zeig mal her.“', [
  node('dx-d-start', [
    L(DX, 'Mein … du hast es gesehen? Das ist privat! Das ist wie ein Tagebuch, nur mit Zahlen. Und Schuld. Viel Schuld.', 'besorgt'),
    N('Er schiebt dir das Notizbuch hin. Neben jedem Namen eine Notiz. „Babette – macht die besten Nudeln, bald zurückzahlen!!“ „Gustav – hat mir mal das Leben gerettet (Kran)“. Neben „Hunter“ stehen nur drei Punkte.'),
    L(DX, 'Ich will das nicht mehr. Ich will morgens aufwachen und keinem ausweichen müssen. Ich hab mich dreimal diese Woche hinter einem Fernseher versteckt. Vor Oma Volt. Sie ist achtzig.', 'trauer'),
  ], {
    choices: [
      c('„Gib her. Ich red mit allen sechs.“', 'dx-d-ja', { effects: [give(BUCH), set('dx_start'), rel(DX, 20)] }),
      c('„Und Hunter?“', 'dx-d-hunter', { once: true, id: 'dx-d-hunter' }),
    ],
  }),
  node('dx-d-hunter', [
    L(DX, 'Hunter … ist ein eigenes Kapitel. Ein eigenes Buch. Eine eigene Bibliothek. Den mach ich selbst. Irgendwann. Wenn ich mutig bin. Oder betrunken.', 'besorgt'),
  ], { next: 'dx-d-start' }),
  node('dx-d-ja', [L(DX, 'Du bist ein Engel. Ein Inkasso-Engel. Mit Flügeln aus Mahnungen.', 'freude')], { choices: [nochWas(), bye()] }),
]);

const fertig = beitrag(DX, all(AKTIV, flag('dx_start'), ALLE, noFlag('dx_fertig')), 'Das Gläubigerbuch zurückgeben. Sechs Zeilen durchgestrichen.', [
  node('dx-f-start', [
    N('Dexter blättert. Durchgestrichen. Durchgestrichen. Durchgestrichen. Bei der sechsten Zeile hält er die Seite gegen das Licht, als könnte die Tinte zurückkommen.'),
    L(DX, 'Ich … ich schulde keinem mehr was. Außer Hunter. Und dir. Dir schulde ich jetzt alles.', 'ueberrascht'),
    L(DX, 'Weißt du, was ich mache? Ich mach ein Leihhaus auf. Ein ehrliches! Man bringt mir Sachen, ich geb gutes Geld dafür. Wer kennt sich besser mit Schulden aus als ich? Niemand!', 'freude'),
    L(DX, 'Und hier. Ein beglichener Schuldschein. Mein erster. Den kannst du einrahmen. Oder Hunter schenken, der liebt so was.', 'signatur'),
  ], { effects: [set('dx_fertig'), set('dexter_leihhaus')] }),
]);

// ------------------------------------------------------------------------------------------- Gläubiger
const glaeubiger = (g: Glaeubiger): Beitrag => beitrag(g.npc, all(AKTIV, flag('dx_start'), noFlag(fl(g))),
  `Dexters Gläubigerbuch aufschlagen. „${g.name}, ${g.summe} Credits.“`, [
    node(`dx-${g.key}-start`, [L(g.npc, g.klage, 'wut')], {
      choices: [
        c(`Für Dexter zahlen. (${g.summe} Cr)`, `dx-${g.key}-bezahlt`, { requires: { credits: g.summe }, effects: [cr(-g.summe)] }),
        c('„Er zahlt. Nicht heute. Aber er zahlt. Gib ihm Zeit, und er wird dein bester Kunde.“', `dx-${g.key}-vertroestet`,
          { check: chk(`dx-${g.key}-vertroesten`, 'ausstrahlung', 5, ['ueberreden', 'verhandeln']) }),
        c('„Moment. Ich hab gehört, Dexter hat dir mal einen Gefallen getan. Rechnen wir gegen.“', `dx-${g.key}-gegen`,
          { check: chk(`dx-${g.key}-gegenrechnung`, 'strasse', 5, ['geruecht', 'feilschen']) }),
        c('„Er arbeitet’s ab. Was brauchst du?“', `dx-${g.key}-deal`),
      ],
    }),
    node(`dx-${g.key}-bezahlt`, [N(`Du zählst ${g.summe} Credits ab. ${g.name} streicht die Zeile mit einem Gesichtsausdruck, als hätte das Universum gerade einen Fehler gemacht.`)], {
      effects: [set(fl(g)), rel(g.npc, 10), rel(DX, 20)], choices: [nochWas(), bye()],
    }),
    node(`dx-${g.key}-vertroestet`, [L(g.npc, g.vertroestet, 'neutral')], { effects: [set(fl(g))], choices: [nochWas(), bye()] }),
    node(`dx-${g.key}-gegen`, [L(g.npc, g.gegen, 'ueberrascht')], { effects: [set(fl(g)), rel(g.npc, 5)], choices: [nochWas(), bye()] }),
    node(`dx-${g.key}-deal`, [
      L(g.npc, g.deal, 'signatur'),
      P('Ich sag’s ihm. Er wird jammern. Dann macht er’s.'),
    ], { effects: [set(fl(g)), zeit(20)], choices: [nochWas(), bye()] }),
  ]);

export const beitraege: Beitrag[] = [start, fertig, ...LISTE.map(glaeubiger)];

// ------------------------------------------------------------------------------------------- Leihhaus
const leihhaus: ShopDef = {
  id: 'dexters-leihhaus', name: 'Dexters Leihhaus („Ehrlich seit gestern“)', owner: DX, faction: 'unterstadt',
  open: time('tag', 'abend', 'nacht'), buyRate: 0.6,
  stock: [
    { item: 'vhs-kassette', qty: 2 }, { item: 'alte-euromuenze', qty: 1 }, { item: 'glitzerschrott', qty: 3 },
    { item: 'retro-tastatur', qty: 1 }, { item: 'aufzieh-roboter', qty: 1 }, { item: 'kartendeck', qty: 1 },
  ],
};

export const part: ContentPart = {
  quests: { [Q]: quest },
  shops: { [leihhaus.id]: leihhaus },
  mapAdditions: {
    schrottmarkt: {
      hotspots: [{
        id: 'pj-dx-leihhaus', at: [1172, 334], radius: 56, label: 'Dexters Leihhaus', kind: 'shop', shop: leihhaus.id,
        when: all(done(Q), time('tag', 'abend', 'nacht')),
      }],
    },
  },
};
