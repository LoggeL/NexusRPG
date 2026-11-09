// Sammelgespräche der persönlichen Quests (quest-pers-jobs).
// Jede Quest liefert `beitraege` (Figur + Bedingung + Auswahl + Knoten). Pro Figur entsteht EIN Dialog `pj-hub-<npc>`
// (Gruß, alle gerade gültigen Beiträge, Abschied). Er hängt an einem Sprech-Hotspot direkt neben dem Platz der Figur –
// so bleiben Tagesgespräch, Herz-Ereignisse und Geschenke der Figur unangetastet, und keine Figur steht doppelt herum.
// Plätze und Zeiten folgen design/plan/act1.json (npcSchedules), vereinfacht auf die Hauptplätze.
import type { Condition, DialogueDef, DialogueLine, TimeSlot, Weekday } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import type { Hotspot } from './_lib';
import { L, all, any, bye, done, not, time } from './_lib';

import { beitraege as babette } from './pers-babette-markttag';
import { beitraege as barkeeper } from './pers-barkeeper-letzter-vers';
import { beitraege as bolzen } from './pers-bolzen-bein';
import { beitraege as dante } from './pers-dante-erstpressung';
import { beitraege as daria } from './pers-daria-botendienst';
import { beitraege as dexter } from './pers-dexter-schuldenfrei';
import { beitraege as freya } from './pers-freya-fairer-lohn';
import { beitraege as hunter } from './pers-hunter-reiner-tisch';
import { beitraege as jakko } from './pers-jakko-kochbuch';
import { beitraege as kameramann } from './pers-kameramann-ungeschminkt';
import { beitraege as kiki } from './pers-kiki-reichweite';
import { beitraege as wasserturm } from './pers-kinder-wasserturm';
import { beitraege as kuschel } from './pers-kuschel-ohrenflick';
import { beitraege as lio } from './pers-lio-album';
import { beitraege as nebelhorn } from './pers-nebelhorn-letzte-faehre';
import { beitraege as richter } from './pers-richter-goldene-gurke';

import { neben } from './_karten';

export const ALLE_BEITRAEGE = [
  ...babette, ...barkeeper, ...bolzen, ...dante, ...daria, ...dexter, ...freya, ...hunter, ...jakko, ...kameramann, ...kiki,
  ...wasserturm, ...kuschel, ...lio, ...nebelhorn, ...richter,
];

// ------------------------------------------------------------------------------------------- Plätze
interface Ort { map: string; spot: string; when: Condition }
const TAG: Record<string, TimeSlot> = { M: 'morgen', T: 'tag', A: 'abend', N: 'nacht' };
/** `o('schrottmarkt', 'kran', 'M', ['mo'])` – Tageszeiten als Buchstaben, optional nur an / nicht an bestimmten Tagen. */
function o(map: string, spot: string, slots: string, nur?: Weekday[], ausser?: Weekday[], extra?: Condition): Ort {
  const conds: Condition[] = [time(...slots.split('').map((s) => TAG[s]!))];
  if (nur) conds.push({ weekday: nur });
  if (ausser) conds.push(not({ weekday: ausser }));
  if (extra) conds.push(extra);
  return { map, spot, when: conds.length === 1 ? conds[0]! : all(...conds) };
}
const MMF: Weekday[] = ['mo', 'mi', 'fr'];

const ORTE: Record<string, Ort[]> = {
  'opa-gustav': [
    o('schrottmarkt', 'kran', 'M'), o('schrottmarkt', 'schrottkram-stand', 'T', undefined, ['so']), o('schrottmarkt', 'flohmarkt', 'T', ['so']),
    o('schrottmarkt', 'wohnwagen', 'A', undefined, ['fr']),
  ],
  dexter: [
    o('schrottmarkt', 'dexter-versteck', 'M'), o('schrottmarkt', 'dexter-buero', 'TN'),
    o('schrottmarkt', 'dexter-buero', 'A', undefined, undefined, not(done('main-1-dexter'))),
    o('high-voltage', 'dexter-tisch', 'A', undefined, undefined, done('main-1-dexter')),
  ],
  dante: [
    o('dantes-werkstatt', 'ofen', 'M', undefined, ['mo', 'do']), o('schrottmarkt', 'plattenkiste-dante', 'M', ['mo', 'do']),
    o('dantes-werkstatt', 'werkbank', 'T'), o('dantes-werkstatt', 'plattenspieler', 'A', undefined, ['do']), o('dantes-werkstatt', 'eins-tisch', 'A', ['do']),
  ],
  'collin-charleston': [
    o('nx1-studio', 'radio-kabine', 'M'), o('stufenplatz', 'buehne', 'T', MMF), o('nx1-studio', 'schminkspiegel', 'T', undefined, MMF),
    o('cafe-sahnehaube', 'autogramm-tisch', 'A', undefined, ['di']), o('high-voltage', 'moderatorenpult', 'A', ['di']),
  ],
  barkeeper: [
    o('high-voltage', 'tresen', 'M'), o('schrottmarkt', 'marktplatz-mitte', 'T', ['mo']), o('neon-gasse', 'klingen-ecke', 'T', undefined, ['mo']),
    o('hafenkante', 'alte-arena', 'AN', ['mo']), o('high-voltage', 'tresen', 'AN', undefined, ['mo']),
  ],
  jakko: [
    o('schrottmarkt', 'garkueche-hocker', 'M'), o('schrottmarkt', 'kran', 'T', MMF), o('schrottmarkt', 'garkueche-hocker', 'T', undefined, MMF),
    o('schrottmarkt', 'garkueche-hocker', 'A', undefined, ['do']), o('dantes-werkstatt', 'eins-tisch', 'A', ['do']),
  ],
  daria: [o('das-nest', 'schlafnischen', 'MN'), o('schrottmarkt', 'botenstand', 'T'), o('neon-gasse', 'pfandflaschen-ecke', 'A', undefined, ['do']), o('dantes-werkstatt', 'eins-tisch', 'A', ['do'])],
  freya: [
    o('das-nest', 'schlafnischen', 'MN'), o('schrottmarkt', 'botenstand', 'T', undefined, ['mi']), o('eisenhof', 'gerichtsgarten', 'T', ['mi']),
    o('schrottmarkt', 'lio-ecke', 'A', undefined, ['do']), o('dantes-werkstatt', 'eins-tisch', 'A', ['do']),
  ],
  ripper: [o('ripper-praxis', 'behandlungsstuhl', 'T', undefined, ['di', 'fr']), o('high-voltage', 'ecktisch', 'A')],
  'mutter-bruehe': [o('suppenkueche', 'kessel', 'MTA')],
  'opa-gurrmann': [o('loetgassen', 'taubenschlag', 'MTA')],
  'marla-sand': [o('schrottmarkt', 'karawanenstand', 'MT', ['sa']), o('high-voltage', 'oldie-ecke', 'A', ['sa'])],
  'vinyl-vincent': [o('schrottmarkt', 'plattenstand-vincent', 'TA')],
  'wett-willi': [o('schrottmarkt', 'huetchenspiel', 'TA')],
  'frau-klingel': [o('schrottmarkt', 'klingel-stand', 'TA')],
  'salzige-grete': [o('hafenkante', 'fischstand', 'MT')],
  'lio-funkel': [o('bahnhof-mitte', 'musikerecke', 'T'), o('schrottmarkt', 'lio-ecke', 'A', undefined, ['di']), o('high-voltage', 'buehne', 'A', ['di'])],
  kameramann: [
    o('nx1-studio', 'regie', 'M'), o('stufenplatz', 'kamerakran', 'T', MMF), o('schrottmarkt', 'stadt-tv', 'T', undefined, MMF),
    o('schrottmarkt', 'filmposten', 'A'),
  ],
  'kiki-karbon': [
    o('bahnhof-mitte', 'taxistand', 'M'), o('glasarkaden', 'kiki-landeplatz', 'T', MMF), o('schrottmarkt', 'taxi-landeplatz', 'T', ['di', 'do']),
    o('neon-gasse', 'vorplatz', 'T', ['sa', 'so']), o('neon-gasse', 'vorplatz', 'AN'),
  ],
  'mira-loetzinn': [o('loetzinn-laden', 'theke', 'MTA')],
  richter: [
    o('gerichtssaal', 'richterbank', 'M'), o('eisenhof', 'gerichtsgarten', 'T', undefined, ['so']), o('schrottmarkt', 'flohmarkt', 'T', ['so']),
    o('eisenhof', 'richter-bank', 'A', undefined, ['do', 'fr']), o('high-voltage', 'kartentisch', 'A', ['do']), o('schrottmarkt', 'garkueche-bank', 'A', ['fr']),
  ],
  'kaeptn-nebelhorn': [
    o('hafenkante', 'steg', 'M'), o('hafenkante', 'faehre', 'T'), o('hafenkante', 'steg', 'A', undefined, ['mi', 'fr']),
    o('high-voltage', 'stammtisch', 'A', ['mi', 'fr']), o('hausboot-nebelhorn', 'kajuete', 'N'),
  ],
  hunter: [
    o('high-voltage', 'kasse', 'M', undefined, ['so']), o('hafenkante', 'angelsteg', 'M', ['so']),
    o('hv-hinterzimmer', 'schreibtisch', 'T', undefined, ['mo', 'do']), o('schrottmarkt', 'marktplatz-mitte', 'T', ['mo', 'do']),
    o('high-voltage', 'tresen-ende', 'AN'),
  ],
  'babette-bao': [o('schrottmarkt', 'garkueche', 'MTA', undefined, ['mo']), o('hafenkante', 'fischmarkt', 'A', ['mo'])],
  'oma-volt': [o('neon-gasse', 'kiosk', 'MA'), o('neon-gasse', 'kiosk', 'T', undefined, ['so']), o('schrottmarkt', 'flohmarkt', 'T', ['so'])],
  'henk-angler': [o('flutmauer', 'leuchtturm', 'MTA'), o('flutmauer', 'leuchtturm-oben', 'N')],
};

/** Abweichender Versatz, wo rechts neben dem Spot kein begehbarer Boden ist. */
const VERSATZ: Record<string, [number, number]> = { 'hv-hinterzimmer/schreibtisch': [0, 44] };

const NAME: Record<string, string> = {
  'opa-gustav': 'Opa Gustav', dexter: 'Dexter', dante: 'Dante', 'collin-charleston': 'Collin', barkeeper: 'dem Barkeeper', jakko: 'Jakko',
  daria: 'Daria', freya: 'Freya', ripper: 'Ripper', 'mutter-bruehe': 'Mutter Brühe', 'opa-gurrmann': 'Opa Gurrmann', 'marla-sand': 'Marla',
  'vinyl-vincent': 'Vinyl-Vincent', 'wett-willi': 'Wett-Willi', 'frau-klingel': 'Frau Klingel', 'salzige-grete': 'Salziger Grete',
  'lio-funkel': 'Lio', kameramann: 'dem Kameramann', 'kiki-karbon': 'Kiki', 'mira-loetzinn': 'Mira', richter: 'dem Richter',
  'kaeptn-nebelhorn': 'Käpt’n Nebelhorn', hunter: 'Hunter', 'babette-bao': 'Babette', 'oma-volt': 'Oma Volt', 'henk-angler': 'Henk',
};

const GRUSS: Record<string, DialogueLine> = {
  'opa-gustav': L('opa-gustav', 'Na, Jungspund? Setz dich, aber nicht auf die Kiste. Die beißt.', 'freude'),
  dexter: L('dexter', 'Kunde! Oder Gläubiger? Sag Kunde. Bitte sag Kunde.'),
  dante: L('dante', 'Na, Kumpel? Keks? Nimm einen. Nimm zwei. Kuschel hat schon drei.', 'freude'),
  'collin-charleston': L('collin-charleston', 'Ah, meine Lieblingszuschauerin! Oder mein Lieblingszuschauer. Kamera läuft nicht, also: Was gibt’s?', 'freude'),
  barkeeper: L('barkeeper', 'Was darf’s sein? Ein Glas, ein Rat oder beides?'),
  jakko: L('jakko', 'Hey! Hast du Hunger? Ich hab Hunger. Ich hab immer Hunger.', 'freude'),
  daria: L('daria', 'Was? Ich hab zu tun. Schnell.'),
  freya: L('freya', 'Hallo. Ich hab gerade eine Liste gemacht. Willst du sie hören? Ist lang.'),
  ripper: L('ripper', 'Wenn du blutest, setz dich hin. Wenn nicht, mach’s kurz.'),
  'mutter-bruehe': L('mutter-bruehe', 'Kind, du bist zu dünn. Setz dich, red, iss.'),
  'opa-gurrmann': L('opa-gurrmann', 'Gurr. Entschuldigung, Gewohnheit. Was gibt’s?'),
  'marla-sand': L('marla-sand', 'Sand im Schuh, Geld im Beutel. Was brauchst du?'),
  'vinyl-vincent': L('vinyl-vincent', 'Psst. Hörst du das Knistern? Das ist Qualität. Was willst du?'),
  'wett-willi': L('wett-willi', 'Unter welchem Hütchen? Ach, du willst reden. Langweilig, aber bitte.'),
  'frau-klingel': L('frau-klingel', 'Ding-dong! Kleiner Scherz. Was kann ich für dich tun?'),
  'salzige-grete': L('salzige-grete', 'Fisch oder Gequatsche? Fisch kostet.'),
  'lio-funkel': L('lio-funkel', 'Oh. Hallo. Ich hab gerade an dich gedacht. Also, an ein Lied. In dem du vorkommst. Vielleicht.', 'verlegen'),
  kameramann: L('kameramann', '[ HALLO ]'),
  'kiki-karbon': L('kiki-karbon', 'Steig ein oder sag, was du willst, Süße. Der Taxameter läuft im Kopf.'),
  'mira-loetzinn': L('mira-loetzinn', 'Vorsicht, die Lötspitze ist heiß. Was brauchst du?'),
  richter: L('richter', 'Die Sitzung ist eröffnet. Also, das Gespräch. Bitte.'),
  'kaeptn-nebelhorn': L('kaeptn-nebelhorn', 'Klar Schiff, Landratte! Was liegt an?', 'freude'),
  hunter: L('hunter', 'Du. Mach’s kurz, ich zähl gerade.', 'signatur'),
  'babette-bao': L('babette-bao', 'Hunger? Natürlich Hunger. Was noch?', 'freude'),
  'oma-volt': L('oma-volt', 'Na, Schätzchen? Blitzbrause oder Tratsch?'),
  'henk-angler': L('henk-angler', 'Riechst du das? Nebel kommt. Was willst du?'),
};

// ------------------------------------------------------------------------------------------- Aufbau
const PRO_FIGUR = new Map<string, typeof ALLE_BEITRAEGE>();
for (const b of ALLE_BEITRAEGE) PRO_FIGUR.set(b.npc, [...(PRO_FIGUR.get(b.npc) ?? []), b]);

const DIALOGE: Record<string, DialogueDef> = {};
const ZUSATZ: Record<string, { hotspots: Hotspot[] }> = {};
for (const [npc, liste] of PRO_FIGUR) {
  const id = `pj-hub-${npc}`;
  DIALOGE[id] = {
    id, start: 'start',
    nodes: [
      {
        id: 'start', lines: [GRUSS[npc] ?? L(npc, 'Ja?')],
        choices: [
          ...liste.map((b) => ({ text: b.text, next: b.start, when: b.when, ...(b.tag ? { tag: b.tag } : {}) })),
          bye('Ach, nichts.'),
        ],
      },
      ...liste.flatMap((b) => b.nodes),
    ],
  };
  const offen = any(...liste.map((b) => b.when));
  (ORTE[npc] ?? []).forEach((ort, i) => {
    const add = (ZUSATZ[ort.map] ??= { hotspots: [] });
    add.hotspots.push({
      id: `pj-hub-${npc}-${i}`, at: neben(ort.map, ort.spot, ...(VERSATZ[`${ort.map}/${ort.spot}`] ?? [44, 0])), label: `Mit ${NAME[npc] ?? npc} reden`, kind: 'talk',
      dialogue: id, radius: 40, when: all(offen, ort.when),
    });
  });
}

/** Figuren mit Beiträgen, aber ohne Platz (fällt in content-Tests nicht auf, deshalb hier sichtbar). */
export const FIGUREN_OHNE_ORT = [...PRO_FIGUR.keys()].filter((npc) => !ORTE[npc]);

export const part: ContentPart = {
  dialogues: DIALOGE,
  mapAdditions: ZUSATZ,
};
