// pers-daria-botendienst · Darias Kinderkurier (world.md §6.5; Start über he-daria-2 in daria.ts).
// Wege: drei Testlieferungen begleiten (Oma Volt, Opa Gurrmanns Taubenschlag, Dantes Werkstatt) oder `[Straße 4]` eine Route
// zeichnen, die die Kinder allein laufen. Belohnung: Grüße und kleine Aufmerksamkeiten per Kinderkurier vom Botenstand aus.
import type { Condition, DialogueChoice, QuestDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import {
  type Beitrag, L, N, P, active, all, any, beitrag, bye, byId, c, chk, cr, dlg, done, flag, hearts, msg, node, noFlag, nochWas,
  rel, set, schritt, time, xp,
} from './_lib';

const Q = 'pers-daria-botendienst';
const AKTIV = active(Q);
const DR = 'daria';

const quest: QuestDef = {
  id: Q, kind: 'personal', act: 1, giver: DR,
  title: 'Kinderkurier GmbH (in Gründung)',
  summary: 'Daria baut einen Botendienst auf. Drei Testlieferungen, dann tragen die Kinder deine Grüße durch die ganze Unterstadt.',
  autoStart: any(flag('daria_vertrag'), hearts(DR, 3)),
  steps: [
    schritt('vertrag', 'Sprich mit Daria am Botenstand auf dem Schrottmarkt (tagsüber).', 'db_start', { marker: { map: 'schrottmarkt' } }),
    schritt('volt', 'Testlieferung 1: Ein Päckchen Blitzbrause-Pulver für Oma Volt (Neon-Gasse).', 'db_volt', { when: flag('db_start'), marker: { map: 'neon-gasse' } }),
    schritt('tauben', 'Testlieferung 2: Körnerbeutel für Opa Gurrmanns Taubendrohnen (Lötgassen).', 'db_tauben', { when: flag('db_start'), marker: { map: 'loetgassen' } }),
    schritt('dante', 'Testlieferung 3: Eine Tüte Schrauben „zum Naschen“ für Dante (Werkstatt).', 'db_dante', { when: flag('db_start'), marker: { map: 'dantes-werkstatt' } }),
    schritt('abrechnung', 'Zurück zu Daria. Abrechnung.', 'db_fertig',
      { when: all(flag('db_volt'), flag('db_tauben'), flag('db_dante')), marker: { map: 'schrottmarkt' } }),
  ],
  reward: { xp: 150, relations: { daria: 80, freya: 20, jakko: 20 }, rep: { unterstadt: 5 } },
};

// ------------------------------------------------------------------------------------------- Daria
const vertrag = beitrag(DR, all(AKTIV, noFlag('db_start')), '„Also. Kinderkurier. Wie läuft der Test?“', [
  node('db-d-start', [
    L(DR, 'Gut, dass du fragst, Kundschaft Nummer eins. Ich hab drei Testpakete. Drei Ziele. Drei Läufer. Und null Ahnung, ob die Route hält.', 'signatur'),
    L(DR, 'Freya läuft zu Oma Volt, Jakko in die Lötgassen zu den Tauben, und ich zu Dante, weil Dante immer Kekse hat. Du läufst mit. Als … Qualitätskontrolle.'),
    L('freya', 'Und als Zeugin. Wenn einer die Pakete aufmacht, gibt es eine Strafe. Einen Keks.', 'neutral'),
  ], {
    choices: [
      c('„Ich lauf mit. Alle drei.“', 'db-d-mit', { effects: [set('db_start')] }),
      c('Eine Route auf Darias Stadtkarte zeichnen, mit Abkürzungen, Hunden und Rostzahn-Revieren.', 'db-d-route',
        { check: chk('db-route', 'strasse', 4, ['orientierung', 'geruecht']) }),
    ],
  }),
  node('db-d-mit', [
    L(DR, 'Abgemacht. Du machst ein Kreuz bei jeder Übergabe. Ein schönes Kreuz. Kein Krakel.', 'freude'),
  ], { choices: [nochWas(), bye()] }),
  node('db-d-route', [
    N('Du malst. Über die Hängebrücke, nicht durch den Wäschehof (Hund), am Kiosk vorbei (Oma Volt gibt Bonbons), nie nach Einbruch der Dunkelheit am Hafen. Daria guckt, als würdest du ihr einen Schatz zeigen.'),
    L(DR, 'Du hast den Rostzahn-Weg rot gemacht. Und den Hund mit Zähnen gemalt. Das ist professionell.', 'ueberrascht'),
    N('Eine Stunde später sind alle drei zurück, außer Atem, mit drei Unterschriften. Jakko hat Körner im Haar. Freya hat ein Protokoll geschrieben.'),
  ], { effects: [set('db_start'), set('db_volt'), set('db_tauben'), set('db_dante'), rel(DR, 30)], next: 'db-d-abrechnung' }),
  node('db-d-abrechnung', [
    L(DR, 'Drei von drei. Null Verluste. Ein Keks Strafe für Jakko, weil er an den Körnern genascht hat.', 'freude'),
    L('jakko', 'Die waren gut! Fast so gut wie eine Dampfnudel!', 'freude'),
    L(DR, 'Ab jetzt läuft der Kinderkurier. Willst du wem was schicken – Gruß, Snack, Drohung –, kommst du an den Stand. Wir finden jeden. Fast jeden.'),
  ], { effects: [set('db_fertig')] }),
]);

const abrechnung = beitrag(DR, all(AKTIV, flag('db_volt'), flag('db_tauben'), flag('db_dante'), noFlag('db_fertig')),
  'Drei Kreuze vorzeigen. „Alles zugestellt.“', [
    node('db-a-start', [
      L(DR, 'Drei Kreuze! Und keins ist ein Krakel. Ich bin stolz auf dich. Und auf mich. Vor allem auf mich.', 'freude'),
    ], { next: 'db-d-abrechnung' }),
  ]);

// ------------------------------------------------------------------------------------------- Empfänger
const volt = beitrag('oma-volt', all(AKTIV, flag('db_start'), noFlag('db_volt')), 'Freya überreicht ein Päckchen. „Kinderkurier! Unterschrift bitte.“', [
  node('db-v-start', [
    L('freya', 'Eine Lieferung für Frau Volt. Bitte hier unterschreiben. Und hier. Und das hier ist für die Akten.', 'neutral'),
    L('oma-volt', 'Akten! Kindchen, ich hab nicht mal einen Schrank. Gib her, der Stift.', 'freude'),
    N('Oma Volt unterschreibt mit Schnörkel und drückt Freya einen sauren Drops in die Hand. „Trinkgeld.“ Freya notiert: „Trinkgeld: 1 Drops (sauer).“'),
  ], { effects: [set('db_volt'), rel('oma-volt', 10)], choices: [nochWas(), bye()] }),
]);
const tauben = beitrag('opa-gurrmann', all(AKTIV, flag('db_start'), noFlag('db_tauben')), 'Jakko schwenkt einen Körnerbeutel. „Lieferung für die Tauben!“', [
  node('db-t-start', [
    L('opa-gurrmann', 'Körner! Die Mädels haben schon geklappert. Sie fressen eigentlich Strom, aber Körner sind Tradition.', 'freude'),
    N('Eine Taubendrohne landet auf Jakkos Kopf und pickt ihm sehr zärtlich ins Haar. Jakko erstarrt, glücklich wie ein Denkmal.'),
    P('Unterschrift, bitte. Und nimm das Ding von seinem Kopf.'),
  ], { effects: [set('db_tauben')], choices: [nochWas(), bye()] }),
]);
const dante = beitrag('dante', all(AKTIV, flag('db_start'), noFlag('db_dante')), 'Daria hält eine Tüte hoch. „Kinderkurier. Schrauben zum Naschen.“', [
  node('db-da-start', [
    L('dante', 'Schrauben zum Naschen! Wer hat … oh. Oh, das war ich. Ich hab das bestellt. Gestern. Ich wollte testen, ob ihr wirklich liefert.', 'ueberrascht'),
    L(DR, 'Wir liefern immer. Unterschrift. Und Trinkgeld. In Keksen.', 'signatur'),
    N('Dante zahlt in Keksen. Daria zählt sie zweimal.'),
  ], { effects: [set('db_dante'), rel('dante', 10)], choices: [nochWas(), bye()] }),
]);

export const beitraege: Beitrag[] = [vertrag, abrechnung, volt, tauben, dante];

// ------------------------------------------------------------------------------------------- Kinderkurier (nach der Quest)
const EMPFAENGER: [npc: string, name: string][] = [
  ['hunter', 'Hunter'], ['raven', 'Raven'], ['dante', 'Dante'], ['vega', 'Vega'], ['aria', 'Aria'], ['nyra', 'Nyra'],
  ['babette-bao', 'Babette'], ['opa-gustav', 'Opa Gustav'], ['oma-volt', 'Oma Volt'], ['kiki-karbon', 'Kiki'],
  ['lio-funkel', 'Lio'], ['collin-charleston', 'Collin'], ['barkeeper', 'den Barkeeper'], ['richter', 'den Richter'],
];
const PREIS = 50;
const wahl: DialogueChoice[] = EMPFAENGER.map(([npc, name]) => c(`Gruß an ${name} (${PREIS} Cr)`, 'raus', {
  when: { met: npc } as Condition, requires: { credits: PREIS },
  effects: [cr(-PREIS), rel(npc, 15), msg(`Der Kinderkurier ist unterwegs zu ${name}.`)],
}));

const kurier = dlg('pj-db-kinderkurier', [
  node('start', [
    N('Eine Obstkiste mit Aufschrift „KINDERKURIER – SCHNELL, SICHER, MEISTENS“. Daneben eine Preisliste in Freyas Schönschrift und eine Dose mit dem Etikett „Trinkgeld (Pflicht)“.'),
    L(DR, 'Gruß mit Dampfnudel, persönlich übergeben, mit Lächeln. Fünfzig Credits. Das Lächeln ist echt, die Dampfnudel auch. Wem?', 'signatur'),
  ], { choices: [...wahl, bye('Heute nicht.')] }),
  node('raus', [
    N('Jakko schnappt sich die Dampfnudel, Freya den Zettel, und weg sind sie. Daria trägt den Auftrag in ein Heft ein, das „Imperium“ heißt.'),
  ], { effects: [xp(5)] }),
]);

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: byId(kurier),
  mapAdditions: {
    schrottmarkt: {
      hotspots: [{
        id: 'pj-db-kinderkurier', at: [575, 480], radius: 56, label: 'Kinderkurier (Grüße verschicken)', kind: 'use',
        dialogue: kurier.id, when: all(done(Q), time('tag')),
      }],
    },
  },
};
