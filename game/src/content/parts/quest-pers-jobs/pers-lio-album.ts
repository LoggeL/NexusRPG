// pers-lio-album · Sechs Klänge der Stadt (world.md §6.5): Nebelhorn, Keksalarm, Rennhalle, Kanalrechen, Taubenschlag, Applaus.
// Aufnahme je Ort: `[Reflexe 4]` den Moment erwischen, geduldig warten (ohne Check) oder mit dem Profi-Mikro des Kameramanns
// (`[Kameramann ♥4]`) sauber und sofort. Schnitt: Nyra `[Technik 5]` oder Lio selbst (ohne Check, dauert).
import type { DialogueDef, QuestDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import type { Hotspot } from './_lib';
import {
  type Beitrag, L, N, P, active, all, beitrag, bye, byId, c, chk, dlg, flag, give, hearts, item, node, noFlag, nochWas, rel,
  set, schritt, spotUse, take, time, zeit,
} from './_lib';

const Q = 'pers-lio-album';
const AKTIV = active(Q);
const LF = 'lio-funkel';
const REC = 'lios-aufnahmegeraet';
const MIKRO = 'profi-mikro-kameramann';

interface Klang { key: string; titel: string; map: string; at: string; label: string; bild: string; wann?: ReturnType<typeof time> }
const KLAENGE: Klang[] = [
  { key: 'nebelhorn', titel: 'Das Nebelhorn um sechs', map: 'hafenkante', at: 'steg', label: 'Nebelhorn aufnehmen', wann: time('morgen'),
    bild: 'Käpt’n Nebelhorn holt Luft wie ein Wal vor dem Abtauchen. Dann bläst er. Die Möwen fallen fast vom Kran. Der Ton rollt über das Hafenbecken und kommt dreimal zurück.' },
  { key: 'keksalarm', titel: 'Keksalarm', map: 'dantes-werkstatt', at: 'ofen', label: 'Keksalarm aufnehmen', wann: time('morgen', 'abend'),
    bild: 'Der Ofen piept. Dante schreit „DREI-SEKUNDEN-REGEL!“, ein Blech knallt auf den Boden, Captain Kuschel stellt die Ohren auf, und irgendwo klatscht jemand.' },
  { key: 'rennhalle', titel: 'Rennhalle 9', map: 'hafenkante', at: 'rennhalle-tor', label: 'Rennhalle durchs Tor aufnehmen',
    bild: 'Hinter dem verrosteten Tor heulen Motoren, die keine Auspuffe kennen. Jemand brüllt Wettquoten. Ein Schrottbot jault, als würde er gerade gewinnen. Oder sterben.' },
  { key: 'rechen', titel: 'Der Kanalrechen', map: 'kanal-sammler', at: 'rechen', label: 'Kanalrechen aufnehmen',
    bild: 'Wasser rauscht durch die Stäbe des Rechens. Treibgut klappert. Eine Ratte singt. Ein Rohr singt zurück. Es klingt wie eine Kirche, die unter Wasser steht.' },
  { key: 'tauben', titel: 'Taubenschlag', map: 'loetgassen', at: 'taubenschlag', label: 'Taubendrohnen aufnehmen',
    bild: 'Dreißig Taubendrohnen starten gleichzeitig. Rotoren, Gurren aus Lautsprechern, Opa Gurrmann ruft jede beim Namen. Hilde antwortet. Die anderen nicht.' },
  { key: 'applaus', titel: 'Applaus am Stufenplatz', map: 'stufenplatz', at: 'buehne', label: 'Applaus aufnehmen', wann: time('tag'),
    bild: 'Collin verbeugt sich vor der Bühne, und der ganze Stufenplatz klatscht – manche, weil sie ihn lieben, die meisten, weil ein Schild „APPLAUS“ blinkt. Applaus ist Applaus.' },
];
const fl = (k: Klang) => `la_${k.key}`;
const ALLE = all(...KLAENGE.map((k) => flag(fl(k))));

const quest: QuestDef = {
  id: Q, kind: 'personal', act: 1, giver: LF,
  title: 'Lied ohne Reim',
  summary: 'Lio will ein Album machen. Kein Studio, keine Band – nur die Stadt. Sechs Klänge, die nach Noxius klingen.',
  autoStart: hearts(LF, 4),
  steps: [
    schritt('lio', 'Sprich mit Lio (Bahnhof Mitte tagsüber, Schrottmarkt abends).', 'la_start', { marker: { map: 'bahnhof-mitte' } }),
    ...KLAENGE.map((k) => schritt(k.key, `Aufnahme: ${k.titel}.`, fl(k), { when: flag('la_start'), marker: { map: k.map } })),
    schritt('mikro', 'Optional: Leih dir beim Kameramann ein Profi-Mikro.', 'la_mikro', { when: flag('la_start'), optional: true, marker: { map: 'schrottmarkt' } }),
    schritt('schnitt', 'Bring Lio die Aufnahmen – und lass sie schneiden.', 'la_fertig', { when: all(flag('la_start'), ALLE), marker: { map: 'bahnhof-mitte' } }),
  ],
  reward: { xp: 220, items: { 'lio-demo-chip': 1 }, relations: { 'lio-funkel': 120 } },
};

// ------------------------------------------------------------------------------------------- Lio
const start = beitrag(LF, all(AKTIV, noFlag('la_start')), '„Du wolltest ein Album machen?“', [
  node('la-l-start', [
    L(LF, 'Ein Album. Ja. Kein Studio, kein Label, keine Quantum-Lizenz. Nur die Stadt. Ich will, dass man Noxius hört, wenn man die Augen zumacht.', 'zaertlich'),
    L(LF, 'Das Nebelhorn um sechs. Dantes Keksalarm. Die Rennhalle. Den Kanalrechen. Die Tauben in den Lötgassen. Und Applaus. Echten. Oder fast echten.'),
    L(LF, 'Ich hab einen Rekorder. Er hat ein Mikro an einem Löffel. Der Löffel macht den Klang wärmer. Glaub ich. Ich hab nie einen ohne Löffel gehabt.', 'verlegen'),
  ], { choices: [c('„Gib her. Ich bring dir die Stadt.“', 'la-l-ja', { effects: [give(REC), set('la_start')] })] }),
  node('la-l-ja', [L(LF, 'Du bringst mir die Stadt, und ich bring sie zum Klingen. Das reimt sich nicht. Das ist gut. Das Album heißt „Lied ohne Reim“.', 'freude')], {
    choices: [nochWas(), bye()],
  }),
]);

const schnitt = beitrag(LF, all(AKTIV, flag('la_start'), ALLE, noFlag('la_fertig')), 'Den Rekorder zurückgeben. „Sechs Klänge. Alle drauf.“', [
  node('la-s-start', [
    N('Lio hört sich alles an, Kopfhörer auf, Augen zu. Beim Nebelhorn lächelt er. Beim Keksalarm lacht er. Beim Kanalrechen wird er ganz still.'),
    L(LF, 'Das ist es. Das ist die Stadt. Jetzt muss es nur noch geschnitten werden. Ich kann das. Langsam. Sehr langsam. Oder …', 'freude'),
  ], {
    choices: [
      c('„Nyra schneidet dir das. Ich sitz daneben und halt die Klappe.“', 'la-s-nyra', { check: chk('la-schnitt', 'technik', 5, ['elektronik', 'hacken']) }),
      c('„Mach du. Ich bleib und hör zu.“', 'la-s-selbst'),
    ],
  }),
  node('la-s-nyra', [
    L('nyra', 'Rauschfilter, Kompressor, Hall vom Kanal über die Tauben. Fertig. Du hast die Pegel gut gehalten. Für einen Menschen.', 'neutral'),
    N('Eine Stunde. Nyra tippt, du drehst Knöpfe, Lio sitzt dazwischen und hat die Hände vor dem Mund.'),
  ], { effects: [zeit(60), rel('nyra', 20)], next: 'la-s-fertig' }),
  node('la-s-selbst', [
    N('Lio schneidet bis tief in die Nacht, mit einem Programm, das älter ist als er. Du schläfst zweimal ein und wachst jedes Mal zu einem anderen Klang auf.'),
  ], { effects: [zeit(240)], next: 'la-s-fertig' }),
  node('la-s-fertig', [
    L(LF, '„Lied ohne Reim“. Sechs Stücke. Das erste beginnt mit dem Nebelhorn und endet mit Applaus. Dazwischen: wir.', 'zaertlich'),
    L(LF, 'Hunter will es im High Voltage spielen. Nach Ladenschluss. Er hat gesagt, wenn einer redet, fliegt er raus. Das ist bei Hunter Liebe.', 'freude'),
    N('Er drückt dir einen Demo-Chip in die Hand. Mit Filzstift draufgeschrieben: „Für die, die zugehört hat.“'),
  ], { effects: [take(REC), set('la_fertig'), set('lio_album_fertig')] }),
]);

// ------------------------------------------------------------------------------------------- Kameramann (Profi-Mikro)
const KM = 'kameramann';
const mikro = beitrag(KM, all(AKTIV, flag('la_start'), noFlag('la_mikro'), { noItem: MIKRO }), 'Auf sein Richtmikro zeigen. „Kann ich das leihen?“', [
  node('la-k-start', [L(KM, '[ … ? ]'), N('Das Visier flackert. Dann: „[FÜR LIO?]“')], {
    choices: [
      c('„Für Lio. Sein Album.“', 'la-k-ja', { tag: '[Kameramann ♥4]', requires: hearts(KM, 4) }),
      c('„Für Lio. Bitte?“', 'la-k-nein', { when: { not: hearts(KM, 4) } }),
    ],
  }),
  node('la-k-ja', [L(KM, '[ : ) ]'), N('Er drückt dir das Mikro in die Hand. Das Visier zeigt: „[ZURÜCKGEBEN]“, dann „[WIRKLICH]“, dann ein Herz.')], {
    effects: [give(MIKRO), set('la_mikro')], choices: [nochWas(), bye()],
  }),
  node('la-k-nein', [L(KM, '[ NOCH NICHT ]'), N('Er tippt auf sein Herz, dann auf das Mikro. Erst Freundschaft, dann Technik. Fair.')], { choices: [nochWas(), bye()] }),
]);

export const beitraege: Beitrag[] = [start, schnitt, mikro];

// ------------------------------------------------------------------------------------------- Aufnahmen
const aufnahme = (k: Klang): DialogueDef => dlg(`pj-la-${k.key}`, [
  node('start', [N(k.bild)], {
    choices: [
      c('Mit dem Profi-Mikro aufnehmen. Klar und sauber.', 'gut', { when: item(MIKRO) }),
      c('Genau im richtigen Moment auf Aufnahme drücken.', 'gut', { check: chk(`la-${k.key}`, 'reflexe', 4, ['timing']) }),
      c('Warten, bis der Moment noch mal kommt, und dann aufnehmen.', 'geduld'),
      bye('Später.'),
    ],
  }),
  node('gut', [N('Der Pegel springt, ohne zu übersteuern. Perfekt. Lio wird weinen.'), P('Hab dich.', 'freude')], { effects: [set(fl(k))] }),
  node('geduld', [N('Du wartest. Einmal ist ein Bus zu laut, einmal hustet jemand, einmal du selbst. Beim vierten Mal sitzt es.')], { effects: [zeit(30), set(fl(k))] }),
]);
const AUFNAHMEN = KLAENGE.map(aufnahme);

const hotspots = (map: string): Hotspot[] => KLAENGE.filter((k) => k.map === map).map((k) => spotUse(
  `pj-la-${k.key}`, k.at, k.label, `pj-la-${k.key}`,
  all(AKTIV, item(REC), noFlag(fl(k)), ...(k.wann ? [k.wann] : [])),
));

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: byId(...AUFNAHMEN),
  mapAdditions: Object.fromEntries([...new Set(KLAENGE.map((k) => k.map))].map((map) => [map, { hotspots: hotspots(map) }])),
};
