// Rudis Diner (world.md §3.5 staubstrasse, §4.5 `rudi`, §6.3 side-oednis-frieden, §6.5 pers-jakko-kochbuch;
// Plan design/plan/act23.json → maps.rudis-diner, Paket pkg-staubstrasse).
// Innenraum 1024×768 im Rumpf eines abgestürzten Passagierflugzeugs: Cockpit als Büro (links), Tresen mit Hockern,
// Küche hinter der Durchreiche (oben rechts, über eine Schwingtür erreichbar), langer Verhandlungstisch im Heck,
// Sitznischen aus Flugzeugsitzen, Jukebox. Quest-Raum für side-oednis-frieden (Spot `verhandlungstisch`) und
// pers-jakko-kochbuch (Spot `kueche`) – die Quest-Hotspots setzen die Quest-Pakete per mapAdditions an diese Spots.
import type { Condition, MapDef, Point, Polygon, Rect } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const box = ([x, y, w, h]: Rect): Polygon => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];

/** Plan-Spots (act23.json) plus eigene Punkte. */
const S = {
  tresen: [450, 204],
  kueche: [850, 172],
  sitznischen: [280, 545],
  verhandlungstisch: [640, 420],
  jukebox: [712, 548],
  cockpit: [100, 380],
  // eigene
  'tresen-vorne': [450, 292],
  durchreiche: [880, 292],
  tuer: [495, 700],
} satisfies Record<string, Point>;

const at = (id: keyof typeof S): Point => S[id];

const N = 'narrator';
const FRIEDEN: Condition = { quest: 'side-oednis-frieden', state: 'done' };
const FREQUENZ: Condition = { quest: 'side-verlorene-frequenz', state: 'done' };
const RUDI_DA: Condition = { time: ['morgen', 'tag', 'abend'] };

const diner: MapDef = {
  id: 'rudis-diner',
  name: 'Rudis Diner',
  subtitle: 'Ödnis · Pfannkuchen seit dem Absturz',
  size: [1024, 768],
  district: 'oednis',
  lighting: 'indoor',
  bg: 'bg-rudis-diner',
  walk: [
    box([5, 280, 1015, 290]), // Schachbrettboden
    box([175, 150, 80, 135]), // Durchgang links neben dem Tresen
    box([175, 150, 515, 65]), // Gang hinter dem Tresen
    box([690, 150, 320, 40]), // Küche hinter der Durchreiche
    box([690, 150, 80, 135]), // Schwingtür
    box([440, 560, 110, 208]), // Tür
  ],
  block: [
    box([0, 270, 80, 85]), // Spind und Kiste im Cockpit
    box([70, 230, 85, 105]), // Rudis Schreibtisch
    box([255, 218, 430, 40]), // Tresen
    box([772, 190, 240, 75]), // Küchentresen mit Durchreiche
    box([665, 340, 355, 105]), box([735, 440, 230, 55]), // Verhandlungstisch mit Stühlen
    box([590, 565, 180, 165]), // Pflanze und Jukebox
  ],
  foreground: [
    { rect: [250, 175, 440, 105], baseY: 262 },
    { rect: [770, 175, 245, 95], baseY: 266 },
  ],
  exits: [
    { id: 'nach-staubstrasse', rect: [445, 740, 100, 28], to: 'staubstrasse', entry: 'von-rudis-diner', label: 'Raus in den Staub' },
  ],
  entries: {
    'von-staubstrasse': { at: [495, 690], facing: 'n' },
  },
  spots: Object.fromEntries(Object.entries(S).map(([id, p]) => [id, { at: p }])),
  hotspots: [
    // ---------------------------------------------------------------- Händler
    {
      id: 'rudis-tresen', at: at('tresen-vorne'), radius: 64, label: 'Am Tresen bestellen', kind: 'shop', shop: 'rudis-diner',
      when: RUDI_DA,
    },
    {
      id: 'tresen-nachts', at: at('tresen-vorne'), radius: 64, label: 'Tresen', kind: 'look', when: { not: RUDI_DA },
      lines: [
        { speaker: N, text: 'Die Hocker stehen auf dem Tresen, die Kaffeemaschine röchelt im Schlaf. Auf einem Zettel unter der Kuchenglocke: „Bin pennen. Pfannkuchen gibt’s ab sechs. Wer was klaut, zahlt doppelt. Ich weiß, wo du parkst.“' },
      ],
    },
    // ---------------------------------------------------------------- Orte
    {
      id: 'jukebox', at: at('jukebox'), radius: 56, label: 'Jukebox', kind: 'use', dialogue: 'rudis-jukebox',
    },
    {
      id: 'cockpit', at: at('cockpit'), radius: 60, label: 'Cockpit ansehen', kind: 'look',
      lines: [
        { speaker: N, text: 'Das alte Cockpit ist Rudis Büro: zwei Pilotensitze, ein Armaturenbrett voller toter Zeiger und ein Schreibtisch aus einer Bordküchen-Klappe. Darauf Rechnungen, ein Aschenbecher aus einer Turbinenschaufel und eine Tasse mit der Aufschrift „Bester Pilot der Welt“. Durchgestrichen. Darunter mit Kuli: „zweitbester“.' },
        { speaker: N, text: 'An die Scheiben sind Fotos geklebt: der Rumpf, frisch in den Sand gepflügt, Rauch, ein junger Rudi mit Pilotenmütze und einem Gesichtsausdruck zwischen „lebe noch“ und „scheiße, lebe noch“. Auf dem letzten Foto steht schon das Leuchtschild.' },
      ],
    },
    {
      id: 'cockpit-funk', at: [172, 320], radius: 40, label: 'Bordfunk ausprobieren', kind: 'use', daily: true,
      lines: [
        { speaker: N, text: 'Du drückst die Sprechtaste des alten Bordfunks. „Mayday, Mayday, hier …“ Es knackt. Eine Stimme antwortet aus dem Rauschen: „Hier Radio Rost. Mayday ist ausverkauft, Kind. Versuch’s mit Pfannkuchen.“' },
      ],
      effects: [{ xp: 5 }],
    },
    {
      id: 'sitznischen', at: at('sitznischen'), radius: 64, label: 'Am Nebentisch lauschen', kind: 'use', dialogue: 'rudis-sitznischen',
    },
    {
      id: 'verhandlungstisch-ansehen', at: [850, 520], radius: 56, label: 'Langer Tisch im Heck', kind: 'look',
      hideWhen: { quest: 'side-oednis-frieden', state: 'active' },
      when: { not: FRIEDEN },
      lines: [
        { speaker: N, text: 'Ein langer Tisch aus einer Landeklappe, darunter eine Karte der Ödnis unter Glas. Jemand hat mit Fettstift die Wrackburg und den Aussiedlerhof eingekreist und einen sehr großen, sehr wütenden Pfeil dazwischen gemalt.' },
        { speaker: N, text: 'Rudi nennt ihn „den Friedenstisch“. Bisher wurde daran nur gegessen. Und einmal mit einer Gabel nach jemandem geworfen.' },
      ],
    },
    {
      id: 'verhandlungstisch-vertrag', at: [850, 520], radius: 56, label: 'Den Friedensvertrag ansehen', kind: 'look', when: FRIEDEN,
      lines: [
        { speaker: N, text: 'Über dem langen Tisch hängt jetzt ein Rahmen: der Friedensvertrag zwischen Staubfalken und Aussiedlern, auf eine Serviette geschrieben, mit Honigfleck, Krähenfeder und drei Unterschriften, eine davon ein Daumenabdruck in Bratfett.' },
        { speaker: N, text: 'Darunter ein neuer Zettel von Rudi: „Wer hier Streit anfängt, spült eine Woche. Gilt für alle. Auch für Krähe. Besonders für Krähe.“' },
      ],
    },
    {
      id: 'durchreiche', at: at('durchreiche'), radius: 44, label: 'Durch die Durchreiche schauen', kind: 'look',
      hideWhen: { quest: 'pers-jakko-kochbuch', state: 'active' },
      lines: [
        { speaker: N, text: 'In der Küche brutzelt es auf einer Grillplatte so groß wie eine Tür. Neben dem Herd klebt ein Rezept, sorgfältig zugehalten von einer Pfanne, damit es keiner liest. Die Pfanne ist festgeschweißt.' },
      ],
    },
    {
      id: 'honigregal', at: [600, 178], radius: 40, label: 'Gepäckfächer ansehen', kind: 'look',
      lines: [
        { speaker: N, text: 'Die alten Gepäckfächer sind jetzt Regale: Tassen, Teller, Ketchupflaschen und eine ganze Reihe Gläser Hofhonig. Auf einem Fach klebt noch das Schild „Nur Handgepäck“. Darin liegt eine Schrotflinte.' },
      ],
    },
    {
      id: 'kaffeemaschine', at: [610, 292], radius: 40, label: 'Nachschenken', kind: 'use', when: RUDI_DA, daily: true,
      lines: [
        { speaker: N, text: 'Die Kanne auf der Warmhalteplatte ist für alle da, sagt ein Schild. Der Kaffee ist schwarz wie Altöl und schmeckt auch so. Dein Herz schlägt kurz im Takt der Jukebox.' },
      ],
      effects: [{ heal: 10 }],
    },
  ],
  lights: [
    { at: [450, 170], radius: 220, color: '#ffcf7a', intensity: 0.5 },
    { at: [355, 230], radius: 120, color: '#ff3fa4', intensity: 0.45 },
    { at: [710, 620], radius: 150, color: '#ff3fa4', intensity: 0.6 },
    { at: [710, 600], radius: 80, color: '#3ef2ff', intensity: 0.45 },
    { at: [860, 150], radius: 150, color: '#ffb36b', intensity: 0.5 },
    { at: [840, 390], radius: 170, color: '#ffd89a', intensity: 0.45 },
    { at: [90, 180], radius: 120, color: '#3ef2ff', intensity: 0.35 },
    { at: [150, 600], radius: 110, color: '#ffcf7a', intensity: 0.45 },
    { at: [860, 600], radius: 110, color: '#ffcf7a', intensity: 0.45 },
    { at: [495, 740], radius: 130, color: '#fff2c8', intensity: 0.5, slots: ['morgen', 'tag'] },
  ],
  ambient: {
    count: 2,
    bySlot: { morgen: 2, tag: 3, abend: 3, nacht: 0 },
    sprites: ['passant-arbeiterin-walk', 'passant-schrotti-walk', 'passant-punk-walk'],
    routes: [
      [[495, 690], [480, 400], [300, 320]],
      [[600, 500], [560, 330], [250, 480]],
    ],
    barks: [
      { text: 'Rudi, noch einen. Nein, nicht Kaffee. Pfannkuchen. Nein, beides.' },
      { text: 'Wasser ist Leben. Sand ist … auch da.' },
      { text: 'Die Falken fliegen tief. Gibt Sturm oder Ärger.' },
      { text: 'Hab gehört, der Konvoi nimmt jetzt Honig statt Credits. Endlich eine Währung, die schmeckt.' },
      { text: 'Wer hat die Jukebox getreten? Die spielt jetzt nur noch rückwärts.', when: { not: FREQUENZ } },
      { text: 'Hörst du das? Radio Rost. Bis in die Stadt, sagen sie. Opa Funk, du alter Sack!', when: FREQUENZ },
      { text: 'Frieden. Ich trau dem Scheiß nicht. Aber die Pfannkuchen sind seitdem größer.', when: FRIEDEN },
      { text: 'Der Konvoi fährt jetzt jeden Tag ans Meer. Mit Sonnencreme!', when: { flag: 'epilog' } },
    ],
  },
  ambience: 'innen',
  music: 'oednis',
  onEnter: [
    { id: 'rudis-diner-erstbesuch', once: true, dialogue: 'rudis-diner-ankunft', effects: [{ markSeen: 'rudis-diner-betreten' }] },
  ],
};

export const part: ContentPart = {
  maps: { [diner.id]: diner },
  dialogues: {
    'rudis-diner-ankunft': {
      id: 'rudis-diner-ankunft',
      start: 'a',
      nodes: [{
        id: 'a',
        lines: [
          { speaker: N, text: 'Drinnen ist es zehn Grad kühler und hundert Grad fettiger. Ein Flugzeugrumpf, voll mit Hockern, Neonröhren und dem Geruch von Pfannkuchen, die seit Jahrzehnten in derselben Pfanne entstehen.' },
          { speaker: N, text: 'Ein Schild über dem Tresen: „Notausgänge: keine. Notfall-Pfannkuchen: jederzeit.“ Die Sitze haben noch Anschnallgurte. Zwei Konvoi-Fahrer sind angeschnallt. Sicher ist sicher.' },
        ],
      }],
    },
    'rudis-jukebox': {
      id: 'rudis-jukebox',
      start: 'a',
      nodes: [
        {
          id: 'a',
          lines: [{ speaker: N, text: 'Die Jukebox blubbert in allen Farben. Die Tasten sind abgegriffen bis aufs Metall, auf dreien klebt ein Pflaster mit „NICHT DRÜCKEN“. Ein Credit pro Lied.' }],
          choices: [
            { text: 'Etwas Fröhliches drücken (1 Cr).', requires: { credits: 1 }, next: 'froh', effects: [{ credits: -1 }] },
            { text: 'Konvoi-Kapelle, „Sand im Getriebe“ (1 Cr).', when: { item: 'schallplatte-11' }, requires: { credits: 1 }, next: 'konvoi', effects: [{ credits: -1 }] },
            { text: 'Auf Radio Rost umschalten.', when: FREQUENZ, next: 'radio' },
            { text: 'Eine der Pflaster-Tasten drücken.', next: 'pflaster', once: true, id: 'jukebox-pflaster' },
            { text: 'Der Jukebox einen Tritt geben.', tag: '[Körper 5]', check: { id: 'rudis-jukebox-tritt', attribute: 'koerper', threshold: 5, tags: ['kraft'], label: '[Körper 5]' }, next: 'tritt', once: true, id: 'jukebox-tritt' },
            { text: 'Lieber Ruhe.' },
          ],
        },
        {
          id: 'froh',
          lines: [
            { speaker: N, text: 'Ein Rock’n’Roll-Stück von vor dem Zusammenbruch. Die Konvoi-Fahrer wippen mit, einer trommelt auf seinem Gurtschloss. Für drei Minuten ist die Ödnis ein Ort, an dem man tanzen könnte.' },
          ],
          effects: [{ advanceTime: 5 }],
        },
        {
          id: 'konvoi',
          lines: [
            { speaker: N, text: '„Sand im Getriebe, Liebe im Tank …“ Der ganze Diner singt mit, falsch und laut. Rudi haut im Takt mit dem Pfannenwender auf den Tresen. Jemand weint ein bisschen in seinen Kaffee. Es ist schön.' },
          ],
          effects: [{ rep: 'aussiedler', delta: 1 }, { advanceTime: 5 }],
        },
        {
          id: 'radio',
          lines: [
            { speaker: N, text: 'Ein Hebel an der Seite, ein Knacken, dann Opa Funks Stimme, warm wie ein Ofen: „… und das war das Wetter. Heiß. Morgen auch. Für die Stadt da draußen: Hallo. Ihr seid nicht allein. Wir hier draußen auch nicht mehr.“' },
            { speaker: N, text: 'Rudi stellt lauter. Keiner sagt was. Das ist hier das größte Kompliment.' },
          ],
          effects: [{ advanceTime: 5 }],
        },
        {
          id: 'pflaster',
          lines: [
            { speaker: N, text: 'Die Jukebox ruckelt, spuckt einen Funken und spielt dann ein Lied, das ausschließlich aus einem Mann besteht, der „Pfannkuchen“ singt. Achtzehn Minuten lang.' },
            { speaker: N, text: 'Rudi, ohne aufzusehen: „Das hab ich aufgenommen. Nach dem Absturz. Hatte viel Zeit. Wer es abbricht, hat Hausverbot.“' },
          ],
          effects: [{ advanceTime: 20 }],
        },
        {
          id: 'tritt',
          lines: [
            { speaker: N, text: 'Du trittst gegen die Seite. Die Jukebox hustet, die Lichter flackern, und aus dem Münzschacht rasseln ein paar alte Credits, die seit Jahren drinklemmen.' },
            { speaker: N, text: 'Von hinten Rudi: „Wenn du die kaputt machst, bezahlst du sie. In Pfannkuchen. Die du isst.“' },
          ],
          effects: [{ credits: 12 }],
        },
      ],
    },
    'rudis-sitznischen': {
      id: 'rudis-sitznischen',
      start: 'a',
      nodes: [
        {
          id: 'a',
          lines: [{ speaker: N, text: 'In den Nischen aus alten Flugzeugsitzen hocken Konvoi-Fahrer, Aussiedler mit Wasserkanistern und, mit Sicherheitsabstand, zwei Staubfalken mit Federn im Haar. Alle reden. Keiner zu dir.' }],
          choices: [
            { text: 'Den Konvoi-Fahrern zuhören.', next: 'konvoi', when: { not: FRIEDEN } },
            { text: 'Den Staubfalken am Fenster zuhören.', next: 'falken', when: { not: { quest: 'side-kraehes-ehre', state: 'done' } } },
            { text: 'Den Aussiedlern zuhören.', next: 'aussiedler' },
            { text: 'Was erzählt man sich über Radio Rost?', next: 'radio', when: { not: FREQUENZ } },
            { text: 'Was erzählt man sich über Brösel?', next: 'broesel', when: { not: { quest: 'kopfgeld-staubbaron-broesel', state: 'done' } } },
            { text: 'Was ist heute los?', next: 'frieden', when: FRIEDEN },
            { text: 'Weiter.' },
          ],
        },
        {
          id: 'konvoi',
          lines: [
            { speaker: N, text: 'Ein Fahrer mit Sonnenbrand in Form seiner Sonnenbrille: „Dreihundert Wegzoll an der Schranke. DREIHUNDERT. Dafür krieg ich in der Stadt ’ne Niere. ’Ne gebrauchte, aber trotzdem.“' },
            { speaker: N, text: 'Seine Kollegin: „Marla sagt, man könnte mit den Falken reden. An Rudis Tisch. Marla sagt viel, wenn der Wind weht.“' },
          ],
        },
        {
          id: 'falken',
          lines: [
            { speaker: N, text: 'Der eine Falke, leise: „Krähe sucht jemanden für die Wrackpiste. Oder fürs Duell. Hauptsache, es gibt ’ne Geschichte, die sie noch nicht kennt.“' },
            { speaker: N, text: 'Der andere: „Letzter hat ihr erzählt, er wäre mal Pilot gewesen. Sie hat gelacht, bis er geweint hat. Dann hat Rudi geweint. Rudi WAR Pilot.“' },
          ],
        },
        {
          id: 'aussiedler',
          lines: [
            { speaker: N, text: 'Eine Aussiedlerin poliert ihren Kanister, als wäre er ein Familienerbstück: „Brunnen gibt wieder was her. Marla hat mit dem Draht gewackelt, und zack, Wasser. Ich sag ja, die Frau ist ’ne Hexe. ’Ne nützliche.“' },
            { speaker: N, text: '„Und nachts klirrt’s am Zaun. Glasskorpione. Schön anzusehen, bis sie dir in den Arsch stechen.“' },
          ],
        },
        {
          id: 'radio',
          lines: [
            { speaker: N, text: '„Opa Funk sendet noch, aber nur bis zum Lagerfeuer. Sein Windrad hat sich ’n Drohnennest eingefangen, und ohne Strom kein Radio Rost in der Stadt.“' },
            { speaker: N, text: '„Die Piste nach Norden. Am Pistenkreuz links vom Diner hoch. Kannst den Turm nicht verfehlen, der liegt nämlich um.“' },
          ],
        },
        {
          id: 'broesel',
          lines: [
            { speaker: N, text: '„Staubbaron Brösel? Verkauft Wasser für drei Credits den Schluck. Den SCHLUCK. Hat sich einen Wassertank geklaut und nennt sich jetzt Baron.“' },
            { speaker: N, text: '„In der Stadt hängt ’n Kopfgeld auf den aus. Wer’s holt, kriegt hier ’nen Pfannkuchen aufs Haus. Von mir. Aus Rache.“' },
          ],
        },
        {
          id: 'frieden',
          lines: [
            { speaker: N, text: 'Am selben Tisch, zum ersten Mal: ein Konvoi-Fahrer und ein Staubfalke, die sich einen Pfannkuchen teilen. Sie streiten nur noch darüber, wer den Honig zuerst kriegt.' },
            { speaker: N, text: '„Seit dem Vertrag fährt der Konvoi mit Eskorte. Die Falken kriegen Diesel, wir kriegen Ruhe. Und Rudi kriegt alle.“' },
          ],
        },
      ],
    },
  },
};
