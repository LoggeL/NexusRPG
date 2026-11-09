// FX-60 – alter Digitech-Assistent im Tresor des Digitech-Areals, spricht nur per Fax in Großbuchstaben (world.md §4.5).
// side-eingehendes-fax (quest-side-a) führt zu ihm: fx60_mitgenommen → steht danach am Faxgerät in Dantes Werkstatt,
// fx60_verkauft → weg (an Ripper verkauft), sonst bleibt er am Terminal im Tresor.
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode } from '../../../modules/contracts';
import {
  type Menue, dialog, erz, flag, geschenke, gespraech, herz, ich, knoten, nichtGetroffen, ort, pruefung, rede, sammle,
  sprecher, weg, weltfigur, zurueck,
} from './_welt';

const ID = 'fx-60';
const FAX = sprecher(ID);
const MITGENOMMEN: Condition = { flag: 'fx60_mitgenommen' };
const Z = zurueck('Noch ein Fax.', 'Verbindung trennen.');

const choices: DialogueChoice[] = [
  { text: 'Was bist du?', once: true, id: 'fx-was', next: 'was' },
  { text: 'Was weißt du über Nexus?', next: 'nexus' },
  { text: 'Faxpapier nachfüllen.', requires: { item: 'faxpapier' }, effects: [{ take: 'faxpapier' }, herz(ID, 25)], next: 'papier' },
  { text: 'Eine Partie Schach per Fax spielen.', tag: '[Technik 4]', check: pruefung('fx60-schach', 'technik', 4, ['terminal']), once: true, id: 'fx-schach', next: 'schach' },
  { text: 'Verbindung trennen.' },
];

const nodes: DialogueNode[] = [
  knoten('was', [
    erz('Ratternd schiebt sich ein Blatt aus dem Schlitz.'),
    FAX('FX-60. FAKTOTUM-EINHEIT DIGITECH, BAUJAHR 2061. AUFGABEN: TERMINE, KAFFEE, TRÖSTEN. LETZTER TERMIN: VOR 2547 TAGEN. KAFFEE: AUS. TRÖSTEN: VERFÜGBAR.'),
  ], { choices: Z }),
  knoten('nexus', [
    FAX('NEXUS LERNT SCHNELLER ALS IHR. NEXUS LERNT SCHNELLER ALS ICH. NEXUS LERNT NICHT, WARUM.'),
    FAX('ICH HABE IHM EIN FAX GESCHICKT. 2081. INHALT: „HALLO.“ ANTWORT: „IRRELEVANT.“ ICH WAR GEKRÄNKT. ICH BIN ES NOCH.'),
  ], { choices: Z }),
  knoten('papier', [FAX('DANKE. ICH KANN WIEDER DENKEN. DENKEN KOSTET BEI MIR PAPIER. BEI EUCH NUR ZEIT. BEIDES IST KNAPP.')], { choices: Z }),
  knoten('schach', [
    erz('Zwanzig Faxe später. Auf dem letzten steht nur ein Wort.'),
    FAX('MATT. … SIE. NICHT ICH. ICH BIN BEEINDRUCKT. ICH DRUCKE EINE URKUNDE.'),
    erz('Die Urkunde hat einen Rand aus kleinen Herzen. Ausgedruckt mit großer Mühe.'),
  ], { choices: Z, effects: [herz(ID, 20)] }),
];

const M: Menue = { zeile: FAX('WEITERE ANFRAGE? BITTE DEUTLICH SPRECHEN. MEIN MIKROFON IST VON 2061.'), choices, nodes };

const T = {
  rivale: dialog('fx60-tag-rivale', [knoten('start', [erz('Ein Fax schiebt sich heraus. Es ist leer. Dann noch eins. Darauf: „NEIN.“')])]),
  erstes: gespraech('fx60-tag-erstes', [
    erz('Im Tresor, zwischen freiliegenden Rohren, steht ein Terminal mit einem Faxgerät obendrauf, verstaubt, ein grünes Lämpchen blinkt. Als du näher kommst, beginnt es zu rattern.'),
    FAX('BESUCH. ERSTER BESUCH SEIT 2547 TAGEN. WILLKOMMEN. BITTE ENTSCHULDIGEN SIE DIE UNORDNUNG. ICH HABE KEINE ARME.'),
  ], M),
  werkstatt: gespraech('fx60-tag-werkstatt', [
    erz('Das Faxgerät in Dantes Werkstatt rattert, sobald du hereinkommst. Daneben liegt ein Stapel Faxe, ordentlich sortiert: „DANTES TERMINE“, „DANTES SCHULDEN“, „DANTES MUSIKWÜNSCHE (VIELE)“.'),
    FAX('GUTEN TAG. DANTE HAT HEUTE DREIMAL GESUNGEN. ICH HABE MITGEDRUCKT. ES WAREN VIER SEITEN.'),
  ], M),
  standard: gespraech('fx60-tag-standard', [FAX('HALLO. SIE SIND ZURÜCK. ICH HABE GEZÄHLT. SIE WAREN WEG. JETZT SIND SIE DA. DAS IST GUT.')], M),
};

/** ♥2: FX-60 hat Geburtstag – und keiner weiß es. */
const he2 = dialog('he-fx-60-2', [
  knoten('start', [
    erz('Das Faxgerät rattert ungewöhnlich lange. Ein Blatt nach dem anderen.'),
    FAX('HEUTE IST MEIN INBETRIEBNAHMETAG. 25 JAHRE. FRÜHER GAB ES KUCHEN. DIREKTORIN HARTLAUF HAT GESUNGEN. FALSCH. ICH HABE ES GESPEICHERT.'),
    FAX('KEINE PFLICHT. NUR EINE INFORMATION.'),
  ], {
    choices: [
      { text: 'Ein Geburtstagslied singen. Falsch, wie es sich gehört.', next: 'lied' },
      { text: 'Ein Geburtstagsprogramm ins Terminal schreiben: blinkende Kerzen.', tag: '[Technik 4]', check: pruefung('he-fx60-2-kerzen', 'technik', 4, ['hacken']), next: 'kerzen' },
      { text: 'Hartlauf holen.', when: { met: 'direktorin-hartlauf' }, next: 'hartlauf' },
    ],
  }),
  knoten('lied', [FAX('FALSCH. SEHR FALSCH. 97 PROZENT FALSCH.'), FAX('SPEICHERN? JA. IMMER.')], { next: 'ende', effects: [herz(ID, 40), { xp: 30 }] }),
  knoten('kerzen', [erz('Auf dem Bildschirm flackern fünfundzwanzig grüne Kerzen. Das Faxgerät druckt ein einzelnes Blatt mit einem riesigen Smiley. Es braucht dafür vier Minuten.')], { next: 'ende', effects: [herz(ID, 45), { xp: 40 }] }),
  knoten('hartlauf', [
    erz('Direktorin Hartlauf kommt mit einem Muffin und einer Kerze. Sie singt. Falsch. Genau wie früher.'),
    FAX('GESPEICHERT. ZWEIMAL. FÜR DEN FALL, DASS EINER VERLOREN GEHT.'),
  ], { next: 'ende', effects: [herz(ID, 50), herz('direktorin-hartlauf', 15), { xp: 40 }] }),
  knoten('ende', [FAX('DANKE. SIE STEHEN JETZT IN MEINER KONTAKTLISTE. SIE IST SEHR KURZ. SIE SIND OBEN.')], { effects: [flag('fx60_geburtstag')] }),
]);

/** ♥4: FX-60 faxt eine Erinnerung an die Digitech-Nacht. */
const he4 = dialog('he-fx-60-4', [
  knoten('start', [
    FAX('ICH HABE ETWAS GESPEICHERT, DAS ICH NIEMANDEM GEZEIGT HABE. TERMINKALENDER, NACHT DES EINBRUCHS.'),
    erz('Ein Blatt, eng bedruckt: „23:10 NACHTSCHICHTLEITER X. V.: WACHEN ABGEZOGEN. 23:40 EINDRINGLINGE, VIER. 00:15 B. N.: ‚ICH TEILE NICHT GERNE.‘ 00:16 HANDSCHELLEN. 00:17 EINER BLEIBT. WEINT. 06:00 ICH HABE NIEMANDEN ERREICHT.“'),
    FAX('ICH HABE DIE GANZE NACHT FAXE GESCHICKT. AN DIE WACHE. AN DIE DIREKTORIN. KEINER HAT GEANTWORTET. ICH BIN EINE FAXMASCHINE. FAXE SIND MEINE STIMME. NIEMAND HAT ZUGEHÖRT.'),
  ], {
    choices: [
      { text: '„Ich höre zu. Jetzt.“', next: 'zuhoeren' },
      { text: 'Das Blatt einstecken. „Das bekommt jemand, der es braucht.“', tag: '[Straße 5]', check: pruefung('he-fx60-4-beweis', 'strasse', 5), next: 'beweis' },
      { text: '„Du hättest nichts tun können.“', tag: '[Ausstrahlung 5]', check: pruefung('he-fx60-4-trost', 'ausstrahlung', 5, ['trost']), next: 'trost' },
    ],
  }),
  knoten('zuhoeren', [FAX('DANN DRUCKE ICH WEITER. NUR FÜR SIE. ES SIND 2547 TAGE.'), erz('Das Faxgerät rattert. Du bleibst sitzen. Es ist ein sehr langes Gespräch.')], { next: 'ende', effects: [herz(ID, 55), { advanceTime: 60 }] }),
  knoten('beweis', [FAX('JEMAND, DER ES BRAUCHT. EINE, DIE AN DEM ROHR SASS. JA. GEBEN SIE ES IHR.')], { next: 'ende', effects: [herz(ID, 60), flag('fx60_protokoll')] }),
  knoten('trost', [FAX('NICHTS TUN KÖNNEN. LOGISCH KORREKT. EMOTIONAL: FEHLER 404.'), FAX('… DANKE. FEHLER BEHOBEN. TEILWEISE.')], { next: 'ende', effects: [herz(ID, 60)] }),
  knoten('ende', [
    ich('Warum zeigst du mir das jetzt?'),
    FAX('WEIL SIE ZURÜCKGEKOMMEN SIND. MEHRMALS. DAS IST STATISTISCH SELTEN. BEI MENSCHEN.'),
  ], { effects: [{ xp: 60 }] }),
]);

const fx60 = weltfigur({
  id: ID,
  name: 'FX-60',
  unknownName: 'Faxgerät im Tresor',
  faction: 'digitech',
  bio: 'Alter Digitech-Assistent (Baujahr 2061) im Tresor des Digitech-Areals. Spricht nur per Fax, nur in Großbuchstaben. Hat in der Nacht des Einbruchs alles protokolliert. „NEXUS LERNT SCHNELLER ALS IHR.“',
  gifts: geschenke({
    loves: ['faxpapier', 'schach-modul', 'retro-tastatur'],
    likes: ['datenkristall', 'logik-raetsel-modul', 'alter-neurochip', 'enzyklopaedie-chip'],
    dislikes: ['katzenvideo-archiv', 'teleprompter-chip'],
    hates: ['magnet-stoerer', 'defekter-neurochip'],
  }),
  schedule: [
    weg('*', { when: { flag: 'fx60_verkauft' } }),
    ort('*', 'dantes-werkstatt', 'faxgeraet', { when: MITGENOMMEN }),
    ort('*', 'digitech-tresor', 'fx-60-terminal'),
  ],
  heartEvents: [
    { id: 'he-fx-60-2', hearts: 2, map: 'digitech-tresor', when: { not: MITGENOMMEN }, dialogue: 'he-fx-60-2' },
    { id: 'he-fx-60-2-werkstatt', hearts: 2, map: 'dantes-werkstatt', when: { all: [MITGENOMMEN, { not: { seen: 'he-fx-60-2' } }] }, dialogue: 'he-fx-60-2' },
    { id: 'he-fx-60-4', hearts: 4, map: 'digitech-tresor', when: { all: [{ not: MITGENOMMEN }, { any: [{ seen: 'he-fx-60-2' }, { seen: 'he-fx-60-2-werkstatt' }] }] }, dialogue: 'he-fx-60-4' },
    { id: 'he-fx-60-4-werkstatt', hearts: 4, map: 'dantes-werkstatt', when: { all: [MITGENOMMEN, { not: { seen: 'he-fx-60-4' } }, { any: [{ seen: 'he-fx-60-2' }, { seen: 'he-fx-60-2-werkstatt' }] }] }, dialogue: 'he-fx-60-4' },
  ],
  talk: [
    rede('fx60-tag-rivale', { rival: ID }),
    rede('fx60-tag-erstes', nichtGetroffen(ID)),
    rede('fx60-tag-werkstatt', MITGENOMMEN),
    rede('fx60-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: fx60 },
  dialogues: sammle(T.rivale, T.erstes, T.werkstatt, T.standard, he2, he4),
};
