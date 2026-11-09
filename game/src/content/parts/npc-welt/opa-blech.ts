// Opa Blech – Oma Volts eingemotteter Sicherheitsroboter (world.md §4.5, §4.4 oma-volt he-4, side-oma-volts-lager gc-79).
// Bis he-oma-volt-4 bzw. side-oma-volts-lager steht er im Lager am Schrottmarkt, danach als Kioskwächter am Volt-Eck.
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode } from '../../../modules/contracts';
import {
  type Menue, dialog, erz, flag, geschenke, gespraech, herz, knoten, nichtGetroffen, ort, pruefung, rede, sammle,
  sprecher, weltfigur, zurueck,
} from './_welt';
import { akt23 } from './opa-blech-akt23';

const ID = 'opa-blech';
const B = sprecher(ID);
const Z = zurueck('WEITERE ANFRAGE.', 'ABMELDEN.');
const WAECHTER: Condition = { any: [{ seen: 'he-oma-volt-4' }, { quest: 'side-oma-volts-lager', state: 'done' }] };

const choices: DialogueChoice[] = [
  { text: 'Statusbericht, Opa Blech.', next: 'status' },
  { text: 'Erzähl von früher.', tag: '[Blech ♥2]', requires: { hearts: ID, min: 2 }, once: true, id: 'ob-frueher', next: 'frueher' },
  { text: 'Wer ist der gefährlichste Kunde am Kiosk?', when: WAECHTER, next: 'kunden' },
  { text: 'ABMELDEN.' },
];

const nodes: DialogueNode[] = [
  knoten('status', [
    B('STATUS: WACHSAM. GELENKE: QUIETSCHEND. AKKU: 34 %. MORAL: HOCH. GRUND FÜR MORAL: UNBEKANNT.'),
    B('SICHERHEITSPROTOKOLL 7: KEKSE SIND KEINE WAFFEN. AUSSER DIE VON DANTE.'),
  ], { choices: Z }),
  knoten('frueher', [
    B('BAUJAHR 2049. EINSATZ: BANKFILIALE MITTELRING. ÜBERFÄLLE VERHINDERT: 0. ÜBERFÄLLE BEOBACHTET: 17.'),
    B('DANN: VERSCHROTTET. DANN: GEKAUFT VON FRAU VOLT FÜR 12 CREDITS UND EINEN EINTOPF.'),
    B('SIE NENNT MICH „OPA“. ICH BIN NICHT IHR GROSSVATER. ICH HABE ES ÜBERPRÜFT. ZWEIMAL.'),
  ], { choices: Z, effects: [herz(ID, 20)] }),
  knoten('kunden', [
    B('KUNDE 1: KNUT. KAUFT NIE, FASST ALLES AN. BEDROHUNGSSTUFE: GELB.'),
    B('KUNDE 2: DEXTER. ZAHLT MIT GUTSCHEINEN. BEDROHUNGSSTUFE: TRAURIG.'),
    B('KUNDE 3: BRUNO. KAUFT JEDEN TAG EINE PLÜSCHMÖHRE UND VERSTECKT SIE. BEDROHUNGSSTUFE: GEHEIM.'),
  ], { choices: Z }),
];

const M: Menue = { zeile: B('WEITERE EINGABE ERWARTET.'), choices, nodes };

const T = {
  rivale: dialog('opa-blech-tag-rivale', [knoten('start', [B('ZIELPERSON ERKANNT. ZUGANG VERWEIGERT.'), B('BITTE ENTFERNEN SIE SICH. BITTE. DAS IST EINE HÖFLICHE DROHUNG.')])]),
  lager: gespraech('opa-blech-tag-lager', [
    erz('Zwischen Kartons mit Nadelkissen und Limonade steht ein Roboter, mit Folie bedeckt, ein Strickschal um den Hals. Ein Auge leuchtet schwach.'),
    B('RUHEMODUS. RUHEMODUS. ICH BIN IM RUHEMODUS. BITTE NICHT STÖREN. ODER DOCH. ES IST LANGWEILIG.'),
  ], M),
  erstes: gespraech('opa-blech-tag-erstes', [
    erz('Neben dem Volt-Eck steht ein kantiger Roboter mit Strickschal und Mütze. Er dreht den Kopf mit einem Quietschen, das man bis zur Hafenkante hört.'),
    B('GUTEN TAG. ICH BIN OPA BLECH. SICHERHEITSEINHEIT DES KIOSKS VOLT-ECK. BITTE BEZAHLEN SIE IHRE NOUGATBOMBEN.'),
  ], M),
  standard: gespraech('opa-blech-tag-standard', [B('BÜRGER ERKANNT. FREUNDLICHKEITSPROTOKOLL AKTIV. HALLO.')], M),
};

/** ♥2: Gelenke ölen. */
const he2 = dialog('he-opa-blech-2', [
  knoten('start', [
    erz('Opa Blech versucht, sich zu dir umzudrehen. Er schafft eine Vierteldrehung, dann quietscht es so laut, dass zwei Tauben vom Vordach fallen.'),
    B('FEHLER. GELENK 4 VERWEIGERT DIE ARBEIT. GELENK 4 IST IN DER GEWERKSCHAFT.'),
  ], {
    choices: [
      { text: 'Das Gelenk mit dem Ölkännchen schmieren.', when: { item: 'oelkaennchen' }, effects: [{ take: 'oelkaennchen' }], next: 'oel' },
      { text: 'Das Gelenk auseinandernehmen und neu einsetzen.', tag: '[Technik 3]', check: pruefung('he-opa-blech-2-gelenk', 'technik', 3), next: 'technik' },
      { text: 'Einen kräftigen Tritt gegen das Gelenk.', next: 'tritt' },
    ],
  }),
  knoten('oel', [B('GELENK 4 … GELENK 4 IST GLÜCKLICH. ICH WUSSTE NICHT, DASS GELENKE GLÜCKLICH SEIN KÖNNEN.')], { next: 'ende', effects: [herz(ID, 50), { xp: 30 }] }),
  knoten('technik', [B('NEUE BEWEGUNGSFREIHEIT: 280 GRAD. ICH KANN JETZT HINTER MICH SCHAUEN. DA IST EINE WAND. SCHÖNE WAND.')], { next: 'ende', effects: [herz(ID, 40), { xp: 40 }] }),
  knoten('tritt', [
    erz('Klong. Das Gelenk springt zurück. Dein Zeh nicht.'),
    B('GELENK 4 FUNKTIONIERT. IHR ZEH MELDET SCHADEN. EMPFEHLUNG: WENIGER TRETEN.'),
  ], { next: 'ende', effects: [herz(ID, 25), { damage: 3 }] }),
  knoten('ende', [B('DANKE, BÜRGER. ICH HABE SIE ALS „FREUNDLICH“ GESPEICHERT. KATEGORIE: SELTEN.')], { effects: [flag('opa_blech_geoelt')] }),
]);

/** ♥4: Opa Blech zeigt sein altes Patrouillen-Logbuch. */
const he4 = dialog('he-opa-blech-4', [
  knoten('start', [
    erz('Abends, der Kiosk schließt. Opa Blech projiziert mit seinem Auge ein flackerndes Bild an die Hauswand: Eine Bankfiliale, 2049, und eine Frau in Kittelschürze, die einem Bankräuber einen Eintopf über den Kopf kippt.'),
    B('ARCHIVAUFNAHME. FRAU VOLT. VOR 37 JAHREN. ÜBERFALL 18. VERHINDERT DURCH: EINTOPF.'),
    B('ICH HABE NIE JEMANDEM DIESE AUFNAHME GEZEIGT. SPEICHERPLATZ: 0,2 %. WERT: 100 %.'),
  ], {
    choices: [
      { text: '„Zeig sie ihr. Sie wird heulen.“', next: 'zeigen' },
      { text: '„Gib mir eine Kopie. Ich bring sie dem Kameramann, der macht was draus.“', tag: '[Technik 4]', check: pruefung('he-opa-blech-4-kopie', 'technik', 4), next: 'kopie' },
    ],
  }),
  knoten('zeigen', [
    erz('Oma Volt kommt aus dem Kiosk, sieht das Bild, lässt eine Kiste Brause fallen und lacht, bis sie weint.'),
    sprecher('oma-volt')('Du alter Blecheimer. Das hast du die ganze Zeit gespeichert?'),
    B('SPEICHERUNG WAR … SENTIMENTAL. FEHLER NICHT BEHOBEN. FEHLER WIRD BEHALTEN.'),
  ], { next: 'ende', effects: [herz(ID, 50), herz('oma-volt', 40)] }),
  knoten('kopie', [
    B('KOPIE ERSTELLT. AUF DATENKRISTALL. BITTE VORSICHTIG BEHANDELN. ES IST MEIN BESTER TAG.'),
  ], { next: 'ende', effects: [herz(ID, 50), { give: 'datenkristall' }] }),
  knoten('ende', [B('BÜRGER {name}: STATUS AKTUALISIERT. NEUER STATUS: FREUND. KATEGORIE: SEHR SELTEN.')], { effects: [{ xp: 50 }] }),
]);

// Akt 2, Partynacht und Nachspiel: opa-blech-akt23.ts.
const A23 = akt23(M, WAECHTER);

const blech = weltfigur({
  id: ID,
  name: 'Opa Blech',
  unknownName: 'Roboter mit Strickschal',
  faction: 'unterstadt',
  bio: 'Oma Volts Sicherheitsroboter, Baujahr 2049, gekauft für 12 Credits und einen Eintopf. Strickschal, Mütze, Gelenk 4 ist in der Gewerkschaft. Spricht nur in Großbuchstaben.',
  gifts: geschenke({
    loves: ['oelkaennchen', 'quietsche-mutter', 'nadel-und-faden'],
    likes: ['rostige-schraube', 'glitzerschrott', 'reparaturset'],
    dislikes: ['waschpulver', 'echtobst-apfel'],
    hates: ['magnet-stoerer', 'feuerloescher-mini'],
  }),
  schedule: [
    ort('*', 'neon-gasse', 'kiosk-waechter', { when: WAECHTER }),
    ort('*', 'schrottmarkt', 'oma-volts-lager'),
  ],
  heartEvents: [
    { id: 'he-opa-blech-2', hearts: 2, map: 'neon-gasse', time: ['morgen', 'tag'], when: WAECHTER, dialogue: 'he-opa-blech-2' },
    { id: 'he-opa-blech-4', hearts: 4, map: 'neon-gasse', time: 'abend', when: { all: [WAECHTER, { seen: 'he-opa-blech-2' }] }, dialogue: 'he-opa-blech-4' },
  ],
  talk: [
    rede('opa-blech-tag-rivale', { rival: ID }),
    rede('opa-blech-tag-lager', { not: WAECHTER }),
    rede('opa-blech-tag-erstes', nichtGetroffen(ID)),
    ...A23.talk,
    rede('opa-blech-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: blech },
  dialogues: sammle(T.rivale, T.lager, T.erstes, T.standard, he2, he4, ...A23.dialogues),
};
