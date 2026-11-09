// Hafenkante (world.md §3.5, §3.9, §8.7, §10.4/§10.7; Plan design/plan/act1.json, Paket pkg-hafenkante).
// Zone 1536×1024: Kai mit Rostkai-Kränen, Hafenbecken mit Hausboot und Fähre, Container-Labyrinth, Rennhalle 9 (gesperrt),
// Garage mit der Rostlaube, Quantum-Lieferdepot. Legt station-hafenkante an.
// Quest-Hotspots (Container 77, Beweisfoto, Rostzähne-Farbe, Stellwerk, Depot-Terminal, Rostlaube-Einbau) und feste
// Quest-Begegnungen setzen die Quest-Agenten per mapAdditions an die Spots hier (siehe design/plan/gaps/maps-hafenkante.md).
import type { Condition, MapDef, Point, Polygon, Rect } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const box = ([x, y, w, h]: Rect): Polygon => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];

/** Benannte Punkte (Plan-IDs) – Hotspots und Begegnungen sitzen daran. */
const S = {
  'rostkai-kraene': [1120, 560],
  schiessstand: [1100, 470],
  'falke-kran': [1245, 610],
  'kran-ausleger': [945, 620],
  'falkes-wohnwagen': [1500, 290],
  hafenbecken: [1000, 662],
  angelsteg: [1180, 790],
  steg: [815, 880],
  faehre: [1270, 830],
  'hausboot-gangway': [840, 880],
  'rennhalle-tor': [955, 268],
  'garage-rostlaube': [130, 268],
  boxsack: [310, 262],
  'container-labyrinth': [365, 560],
  'rostzaehne-lager': [82, 760],
  'container-77': [290, 925],
  'container-77-versteck': [628, 820],
  'container-hai': [230, 500],
  'oelfass-tuerme': [1385, 620],
  'quantum-depot': [1380, 268],
  ueberlaufrohr: [1405, 450],
  fischstand: [628, 770],
  fischmarkt: [580, 710],
  'kai-mitte': [760, 450],
  'tildas-box': [1220, 300],
  'knuspi-versteck': [620, 960],
  'alte-arena': [430, 950],
  'kassierer-bude': [140, 330],
  'ubahn-abgang': [665, 268],
  'stellwerk-hafen': [552, 268],
  'auftrag-a': [700, 400],
} satisfies Record<string, Point>;

const at = (id: keyof typeof S): Point => S[id];
const off = (id: keyof typeof S, dx: number, dy: number): Point => [S[id][0] + dx, S[id][1] + dy];

const NACHTS: Condition = { time: 'nacht' };
const ABENDS_NACHTS: Condition = { time: ['abend', 'nacht'] };
const VEX: Condition = { playerIs: 'vex' };

const hafenkante: MapDef = {
  id: 'hafenkante',
  name: 'Hafenkante',
  subtitle: 'Unterstadt · Rostkai',
  size: [1536, 1024],
  district: 'unterstadt',
  lighting: 'outdoor',
  bg: 'bg-hafenkante',
  station: 'station-hafenkante',
  walk: [
    [[0, 250], [1536, 250], [1536, 672], [800, 672], [785, 702], [655, 706], [655, 1024], [0, 1024]],
    box([440, 0, 62, 256]), // Gleissteg-Treppe
    [[655, 830], [772, 830], [772, 862], [858, 862], [858, 898], [775, 898], [768, 870], [655, 870]], // Fischsteg zum Hausboot
    [[1160, 668], [1200, 668], [1200, 810], [1292, 810], [1292, 852], [1180, 852], [1160, 832]], // Angelsteg zur Fähre
  ],
  block: [
    [[0, 285], [100, 318], [100, 505], [58, 600], [58, 866], [0, 872]], // Zaun zum Schrottmarkt
    [[0, 872], [58, 866], [200, 945], [205, 962], [0, 962]], // Rampenmauer
    box([128, 515, 210, 98]), // Hai-Container
    box([393, 515, 200, 98]), box([520, 585, 58, 35]), // Container + Paletten
    box([578, 580, 122, 88]), // kleiner Container
    box([108, 638, 107, 220]), // blauer Container mit Kisten
    box([268, 642, 205, 92]), box([473, 695, 45, 42]), // gestreifter Container + Palette
    box([250, 757, 110, 150]), // Container 77 (gelb) + Kisten
    box([393, 768, 210, 108]), // roter Container
    box([648, 700, 120, 130]), // Fischstand
    box([872, 590, 42, 62]), box([973, 590, 42, 62]), // Kran 1
    box([1172, 590, 42, 62]), box([1273, 590, 42, 62]), // Kran 2
    box([1425, 318, 111, 190]), // Überlaufrohr
    box([1412, 556, 124, 116]), // Ölfass-Türme
  ],
  foreground: [
    { rect: [868, 420, 196, 150], baseY: 652 },
    { rect: [1168, 420, 200, 150], baseY: 652 },
  ],
  exits: [
    { id: 'nach-schrottmarkt', rect: [0, 250, 24, 36], to: 'schrottmarkt', entry: 'von-hafenkante', label: 'Zum Schrottmarkt' },
    { id: 'nach-bahnhof-mitte', rect: [440, 0, 62, 26], to: 'bahnhof-mitte', entry: 'von-hafenkante', label: 'Gleissteg zum Bahnhof Mitte' },
    { id: 'nach-flutmauer', rect: [0, 1000, 205, 24], to: 'flutmauer', entry: 'von-hafenkante', label: 'Rampe zur Flutmauer' },
    {
      id: 'nach-hausboot', rect: [832, 862, 26, 36], to: 'hausboot-nebelhorn', entry: 'von-hafenkante', label: 'Käpt’n Nebelhorns Hausboot',
      interact: true,
      when: { any: [{ time: ['morgen', 'abend', 'nacht'] }, { hearts: 'kaeptn-nebelhorn', min: 2 }] },
      lockedText: 'Ein Schild an der Gangway: „Betreten nur mit Einladung. Oder Kuchen.“ Der Käpt’n ist tagsüber auf der Fähre.',
    },
    {
      id: 'nach-rennhalle-9', rect: [900, 236, 110, 24], to: 'rennhalle-9', entry: 'von-hafenkante', label: 'Rennhalle 9',
      interact: true, when: { flag: 'rennhalle-9-geoeffnet' },
      lockedText: 'Rolltor zu, Zielflagge eingerollt. Ein Zettel: „Wegen Umbau geschlossen. Kommt bald! Echt jetzt.“',
    },
    {
      id: 'rostlaube', rect: [195, 238, 70, 22], to: 'staubstrasse', entry: 'von-hafenkante', label: 'Mit der Rostlaube in die Ödnis',
      interact: true, minutes: 60,
      when: { all: [{ quest: 'side-rostlaube', state: 'done' }, { act: 2 }] },
      lockedText: 'Die Rostlaube springt an, hustet und stirbt beleidigt. Der Konvoi fährt erst wieder, wenn der Sand sich setzt.',
    },
    {
      id: 'kanalgitter', rect: [280, 410, 44, 32], to: 'kanal-sammler', entry: 'gitter-hafenkante', label: 'Kanalgitter (Schnellweg)',
      interact: true, when: { quest: 'side-rattenkoenig', state: 'done' },
      lockedText: 'Ein Gitter mit Kronkorken-Siegel. Bürgermeister Gully lässt nur Freunde der Rohre durch.',
    },
  ],
  entries: {
    'von-schrottmarkt': { at: [40, 272], facing: 'e' },
    'von-bahnhof-mitte': { at: [471, 275], facing: 's' },
    'von-flutmauer': { at: [150, 982], facing: 'e' },
    'von-hausboot-nebelhorn': { at: [805, 880], facing: 'w' },
    'von-rennhalle-9': { at: [955, 285], facing: 's' },
    'von-staubstrasse': { at: [230, 280], facing: 's' },
    kanalgitter: { at: [302, 460], facing: 's' },
    ueberlaufrohr: { at: [1400, 455], facing: 'w' },
    station: { at: [665, 290], facing: 's' },
    taxi: { at: [760, 330], facing: 's' },
  },
  spots: Object.fromEntries(Object.entries(S).map(([id, p]) => [id, { at: p }])),
  hotspots: [
    // ---------------------------------------------------------------- Aktivitäten (world.md §3.9)
    {
      id: 'angeln-hafenbecken', at: at('angelsteg'), radius: 50, label: 'Angeln', kind: 'use',
      lines: [{ speaker: 'narrator', text: 'Am Geländer hängt eine Leihangel an einer Kette. Daneben ein Schild: „Fang nix, was zurückbeißt.“' }],
      effects: [{
        minigame: 'akt-angeln', level: 2, key: 'angeln-hafenkante', label: 'Angeln im Hafenbecken',
        win: [{ give: 'treibholz' }, { credits: 12 }, { message: 'Ein Treibholz und ein Fisch, den Grete dir für 12 Cr abnimmt, ohne hinzusehen.' }],
        lose: [{ give: 'rostige-dose' }, { message: 'Eine rostige Dose. Innen bewegt sich was. Glückwunsch.' }],
      }],
    },
    {
      id: 'angeln-leuchtalge', at: at('hafenbecken'), radius: 56, label: 'Nach Leuchtalgen angeln', kind: 'use', when: NACHTS,
      lines: [{ speaker: 'narrator', text: 'Nachts glüht das Hafenbecken grün. Leuchtalgen, sagt Grete. Atommüll, sagt der Rest. Grete zahlt trotzdem.' }],
      effects: [{
        minigame: 'akt-angeln', level: 3, key: 'angeln-leuchtalge', label: 'Leuchtalgen fischen',
        win: [{ give: 'algen-chips' }, { credits: 25 }, { message: 'Eine Handvoll Leuchtalgen. Grete zahlt 25 Cr und legt eine Tüte Algen-Chips drauf.' }],
        lose: [{ message: 'Die Algen leuchten dich nur kurz an und tauchen ab. Hämisch, irgendwie.' }],
      }],
    },
    {
      id: 'schiessstand', at: at('schiessstand'), radius: 60, label: 'Blechdosen schießen', kind: 'use', when: { time: 'tag' },
      lines: [{ speaker: 'narrator', text: 'Zwischen den Kränen hängen Blechdosen an Drähten. Ein Hafenarbeiter verleiht Luftgewehre für ’nen Credit und ein Lächeln. Das Lächeln ist optional.' }],
      effects: [{
        minigame: 'akt-schiessstand', level: 2, key: 'schiessstand-rostkai', label: 'Von Kran zu Kran',
        win: [{ credits: 30 }, { message: 'Alle Dosen runter. Die Hafenarbeiter klatschen. Einer zahlt seine Wette: 30 Cr.' }],
        lose: [{ message: 'Eine Dose wackelt. Aus Mitleid.' }],
      }],
    },
    {
      id: 'schiessstand-zu', at: at('schiessstand'), radius: 60, label: 'Schießstand ansehen', kind: 'look', when: { not: { time: 'tag' } },
      lines: [{ speaker: 'narrator', text: 'Die Blechdosen baumeln im Wind. Die Gewehre sind weggeschlossen. „Geschossen wird tagsüber. Nachts schießen hier andere.“' }],
    },
    {
      id: 'drohnenrennen', at: at('rostkai-kraene'), radius: 70, label: 'Beim Drohnenrennen starten', kind: 'use',
      when: { all: [{ weekday: 'fr' }, { time: 'abend' }] },
      lines: [{ speaker: 'narrator', text: 'Freitagabend an den Rostkai-Kränen: Zwischen den Auslegern blinken Ringe, Wetten gehen von Hand zu Hand, irgendwer brüllt einen Countdown, der bei sieben anfängt.' }],
      effects: [{
        minigame: 'akt-drohnenrennen', level: 3, key: 'drohnenrennen-rostkai', label: 'Rostkai-Rallye',
        win: [{ credits: 60 }, { message: 'Durch alle Ringe, keinen Kran geküsst. 60 Cr Preisgeld.' }],
        lose: [{ message: 'Deine Drohne parkt im Hafenbecken. Die Möwen sind begeistert.' }],
      }],
    },
    {
      id: 'drohnenrennen-plakat', at: at('rostkai-kraene'), radius: 70, label: 'Rennplakat lesen', kind: 'look',
      when: { not: { all: [{ weekday: 'fr' }, { time: 'abend' }] } },
      lines: [{ speaker: 'narrator', text: 'Ein Plakat am Kranbein: „DROHNENRENNEN – jeden Freitag ab Abend! Startgeld: Mut. Preisgeld: Ruhm und Credits. Haftung: haha.“' }],
    },
    // ---------------------------------------------------------------- Welt-Checks und Sammelobjekte
    {
      id: 'kran-ausleger', at: at('kran-ausleger'), radius: 48, label: 'Auf den Kranausleger klettern', kind: 'check', check: 'gc-152', once: true,
      altText: 'Die Leiter endet drei Meter unter dem Ausleger, der Rest ist Balancieren über nichts. Mit mehr Reflexen – oder Vega kennt eine Kranleiter, die bis oben geht.',
      effects: [
        { setFlag: 'hafen_kranausleger' },
        { xp: 20 },
        { message: 'Oben auf dem Ausleger: der ganze Hafen unter dir, die Rennhalle, das grüne Becken, hinter der Flutmauer ein Streifen Grau, der das Meer sein könnte. Ganz vorne klemmt etwas Glänzendes.' },
      ],
    },
    {
      id: 'datenwuerfel-06', at: off('kran-ausleger', 0, -50), radius: 46, label: 'Datenwürfel aufheben', kind: 'loot', once: true,
      when: { flag: 'hafen_kranausleger' },
      effects: [{ give: 'datenwuerfel-06' }],
    },
    {
      id: 'container-schieben', at: [242, 690], radius: 44, label: 'Container zur Seite schieben', kind: 'check', check: 'gc-145', once: true,
      altText: 'Der Container bewegt sich keinen Millimeter. Mit mehr Körper, einem Greifhaken – oder Hafen-Hannes hilft mit seinem Greifarm, wenn er dich mag.',
      effects: [
        { setFlag: 'hafen_container_verschoben' },
        { message: 'Mit einem Kreischen rutscht der Container zur Seite. Dahinter: eine Lücke, eine Abkürzung und etwas, das funkelt.' },
      ],
    },
    {
      id: 'glueckstern-08', at: [242, 740], radius: 46, label: 'Glücksstern aufheben', kind: 'loot', once: true,
      when: { flag: 'hafen_container_verschoben' },
      effects: [{ give: 'glueckstern-08' }],
    },
    {
      id: 'neon-tag-06', at: [1236, 262], radius: 46, label: 'Neon-Tag abfotografieren', kind: 'loot', once: true,
      lines: [{ speaker: 'narrator', text: 'Neben dem Kiosk leuchtet ein frisches Neon-Tag an der Wellblechwand. Jemand hat sich sehr viel Mühe gegeben und sehr wenig Rechtschreibung.' }],
      effects: [{ give: 'neon-tag-06' }],
    },
    {
      id: 'jimmy-spur-05', at: [735, 690], radius: 46, label: 'Ölfass-Türmchen untersuchen', kind: 'loot', once: true,
      effects: [{ give: 'jimmy-spur-05' }],
    },
    {
      id: 'jimmy-spur-06', at: off('oelfass-tuerme', -10, 40), radius: 46, label: 'Zettel zwischen den Fässern', kind: 'loot', once: true,
      effects: [{ give: 'jimmy-spur-06' }],
    },
    {
      id: 'flaschenpost-01', at: [690, 866], radius: 46, label: 'Flaschenpost herausfischen', kind: 'loot', once: true,
      lines: [{ speaker: 'narrator', text: 'Am Ende des Stegs dümpelt eine Flasche gegen den Pfahl, als würde sie anklopfen.' }],
      effects: [{ give: 'flaschenpost-01' }],
    },
    // ---------------------------------------------------------------- Händler
    { id: 'salzige-grete', at: at('fischstand'), radius: 50, label: 'Salzige Gretes Fischstand', kind: 'shop', shop: 'salzige-grete' },
    { id: 'rennhallen-kiosk', at: [1150, 262], radius: 50, label: 'Rennhallen-Kiosk', kind: 'shop', shop: 'rennhallen-kiosk' },
    { id: 'garage-rostlaube', at: at('garage-rostlaube'), radius: 46, label: 'Garage: Rostlaube-Teile', kind: 'shop', shop: 'garage-rostlaube' },
    // ---------------------------------------------------------------- Orte zum Ansehen
    {
      id: 'boxsack', at: at('boxsack'), radius: 44, label: 'Boxsack', kind: 'use', when: { not: { seen: 'rom-aria-training' } },
      lines: [
        { speaker: 'narrator', text: 'Ein Boxsack aus Lkw-Plane, geflickt mit Panzertape. Auf Kopfhöhe ist das Leder blank geschlagen, auf Kniehöhe auch. Wer hier trainiert, schlägt dreckig.' },
        { speaker: 'narrator', text: 'Du haust einmal rein. Der Sack schwingt kaum. Deine Knöchel melden sich beim Gewerkschaftsvertreter.' },
      ],
    },
    {
      id: 'boxsack-aria', at: at('boxsack'), radius: 44, label: 'Arias Boxsack', kind: 'use', when: { seen: 'rom-aria-training' },
      lines: [
        { speaker: 'narrator', text: 'Arias Boxsack. Seit dem Training hängt er ein bisschen schief, und in der Plane steckt eine Delle in exakt der Form einer Metallfaust.' },
        { speaker: 'narrator', text: 'Am Haken baumelt ein zerknülltes Haargummi. Rot. Wie ihre Zöpfe, wenn sie sie nach dem dritten Satz neu bindet und dich dabei angrinst, als hätte sie gewonnen.' },
      ],
    },
    {
      id: 'boxsack-vex', at: off('boxsack', 30, 6), radius: 34, label: 'Den Sack festhalten', kind: 'use',
      when: { all: [VEX, { seen: 'rom-aria-training' }, { flag: 'aria_romanze_angebahnt' }] },
      lines: [
        { speaker: 'player', text: 'Hier hat sie gesagt, ich soll den Sack halten. „Fester, Postbotin. Ich beiß nicht. Meistens.“' },
        { speaker: 'narrator', text: 'Vex hatte die Arme um die Plane und Arias Atem auf der anderen Seite, heiß, durch zwei Zentimeter Leder. Jeder Schlag ging durch den Sack direkt in Vex’ Brustkorb.' },
        { speaker: 'player', text: 'Hab drei Lieferungen verpennt danach. War’s wert.' },
      ],
    },
    {
      id: 'hai-container', at: off('container-hai', 0, -10), radius: 56, label: 'Container mit dem Hai', kind: 'look',
      when: { not: { flag: 'vexaria_oberlicht' } },
      lines: [
        { speaker: 'narrator', text: 'Auf dem roten Container prangt ein gesprühter Hai, drei Meter lang, mit Sonnenbrille und mehr Zähnen, als die Biologie erlaubt. Auf das Dach führen Trittmulden im Blech.' },
        { speaker: 'narrator', text: 'Von da oben sieht man die Rennhalle 9. Die meisten hier gucken lieber nicht hin.' },
      ],
    },
    {
      id: 'hai-container-oberlicht', at: off('container-hai', 0, -10), radius: 56, label: 'Aufs Hai-Dach schauen', kind: 'look',
      when: { all: [VEX, { flag: 'vexaria_oberlicht' }] },
      lines: [
        { speaker: 'narrator', text: 'Das Containerdach mit dem Hai. Das Blech hält die Tageswärme bis spät in die Nacht. Hier lag Arias Kopf an deiner Schulter, schwer und warm, ihre Zöpfe kitzelten deinen Hals, und keine von euch hat sich getraut, sich zu bewegen.' },
        { speaker: 'player', text: 'Stern.' },
        { speaker: 'narrator', text: 'Hundert Meter bis zur Halle. Nächstes Mal neunzig.' },
      ],
    },
    {
      id: 'hai-container-freundschaft', at: off('container-hai', 0, -10), radius: 56, label: 'Container mit dem Hai', kind: 'look',
      when: { all: [{ not: VEX }, { flag: 'vexaria_oberlicht' }] },
      lines: [{ speaker: 'narrator', text: 'Auf dem Dach des Hai-Containers liegen zwei leere Bierdosen, sorgfältig nebeneinander. Jemand hat mit Kreide „100 m“ daneben geschrieben.' }],
    },
    {
      id: 'nebelhorn', at: [780, 868], radius: 36, label: 'Ins Nebelhorn blasen', kind: 'use',
      when: { hearts: 'kaeptn-nebelhorn', min: 2 },
      lines: [
        { speaker: 'narrator', text: 'Du setzt an. Das Horn holt Luft, die du nicht hattest, und dann: TUUUUUUUUT.' },
        { speaker: 'narrator', text: 'Drei Möwen fallen ins Wasser. Am Kran fällt jemandem der Kaffee runter. Irgendwo im Container-Labyrinth jubelt ein Rostzahn, ohne zu wissen, warum.' },
      ],
      effects: [{ advanceTime: 5 }],
    },
    {
      id: 'nebelhorn-tabu', at: [780, 868], radius: 36, label: 'Nebelhorn ansehen', kind: 'look',
      when: { not: { hearts: 'kaeptn-nebelhorn', min: 2 } },
      lines: [
        { speaker: 'narrator', text: 'Ein Messingtrichter so groß wie ein Waschzuber, blank poliert. Ein Zettel daran: „Nur für Käpt’n und gute Freunde. Du bist noch keins von beidem.“' },
      ],
    },
    {
      id: 'ueberlaufrohr', at: at('ueberlaufrohr'), radius: 50, label: 'Überlaufrohr ansehen', kind: 'look',
      lines: [
        { speaker: 'narrator', text: 'Ein Rohr, groß genug für einen Kleinwagen, mit einem Gitter davor. Von innen verriegelt.' },
        { speaker: 'narrator', text: 'Aus der Tiefe tropft es im Takt. Irgendwo da drin, sagen die Hafenarbeiter, liegt das Pumpwerk Sieben. Und keiner geht freiwillig rein.' },
      ],
    },
    {
      id: 'ubahn-zugang', at: at('ubahn-abgang'), radius: 50, label: 'U-Bahn Hafenkante', kind: 'use',
      lines: [
        { speaker: 'narrator', text: 'Station Hafenkante. Die Treppe riecht nach Salz und Bremsbelag. Auf dem Fahrplan steht bei jeder Abfahrt „ca.“.' },
        { speaker: 'narrator', text: 'Über die Stadtkarte fährst du von hier zu jeder freigeschalteten Station.' },
      ],
    },
    {
      id: 'rennhalle-ansehen', at: off('rennhalle-tor', 100, 0), radius: 50, label: 'Rennhalle 9 ansehen', kind: 'look',
      lines: [
        { speaker: 'narrator', text: 'Eine Wellblechhalle, lang wie ein Güterzug, darüber eine Zielflagge so groß wie ein Segel. Das Glasoberlicht im Dach ist an einer Stelle mit Blech geflickt.' },
        { speaker: 'narrator', text: 'Mittwochs und samstags, sagt man, rennen hier nachts Schrottbots. Gerade rennt hier nur der Rost.' },
      ],
    },
    {
      id: 'quantum-depot-zaun', at: at('quantum-depot'), radius: 56, label: 'Quantum-Lieferdepot', kind: 'look',
      lines: [
        { speaker: 'narrator', text: 'Ein Zaun, so sauber, dass er im Hafen wie ein Fremdkörper aussieht. Dahinter weiße Container, weißes Licht, weiße Laster. Alles mit dem Q-Logo, alles abgeschlossen.' },
        { speaker: 'narrator', text: 'Nachts rollen hier Laster an, ohne Licht, ohne Hupe. Die Hafenarbeiter nennen sie „die Leisen“ und gehen dann Bier holen.' },
      ],
    },
    {
      id: 'faehre-ansehen', at: at('faehre'), radius: 56, label: 'Fähre ansehen', kind: 'look', when: { not: { time: 'tag' } },
      lines: [
        { speaker: 'narrator', text: 'Eine kleine Fähre mit orangen Rettungsringen, frisch gestrichen, die Maschine gepflegt wie ein Haustier. Sie fährt einmal quer übers Becken und zurück. Nie weiter.' },
      ],
    },
    {
      id: 'kraene-ansehen', at: off('rostkai-kraene', 0, 70), radius: 50, label: 'Rostkai-Kräne ansehen', kind: 'look',
      lines: [
        { speaker: 'narrator', text: 'Zwei Containerkräne, rostig wie ein Kiefer voller Karies. Seit Jahren hebt hier nichts mehr was, außer der Stimmung beim Drohnenrennen.' },
      ],
    },
  ],
  encounters: [
    {
      id: 'rostzaehne-abends', encounter: 'enc-zufall-hafenkante-rostzaehne-abend', at: [365, 500],
      sprite: 'rostzahn-schlaeger-walk', when: { time: 'abend' },
      patrol: [[365, 500], [545, 640], [545, 750], [365, 500]],
      avoid: { id: 'hk-rostzaehne-abwimmeln', attribute: 'strasse', threshold: 5, tags: ['einschuechtern', 'geruecht'], label: '[Straße 5]' },
    },
    {
      id: 'rostzaehne-nachts', encounter: 'enc-zufall-hafenkante-rostzaehne-zerleger-nacht', at: [500, 940],
      sprite: 'rostzahn-schlaeger-walk', when: NACHTS,
      patrol: [[500, 940], [250, 970], [380, 750]],
      avoid: { id: 'hk-rostzaehne-umgehen', attribute: 'reflexe', threshold: 5, tags: ['schleichen'], label: '[Reflexe 5]' },
    },
    {
      id: 'depotwache', encounter: 'enc-zufall-hafenkante-depot-nacht', at: [1380, 300],
      sprite: 'quantum-wachmann-walk', when: NACHTS,
      patrol: [[1380, 300], [1220, 330]],
      avoid: { id: 'hk-depot-vorbeischleichen', attribute: 'reflexe', threshold: 6, tags: ['schleichen'], label: '[Reflexe 6]' },
    },
    {
      id: 'kran-drohnen', encounter: 'enc-zufall-hafenkante-drohnen-tag', at: [1250, 520],
      sprite: 'spaeherdrohne-walk', when: { all: [{ time: 'tag' }, { dayAtLeast: 2 }] },
      patrol: [[1250, 520], [1010, 520]],
      avoid: { id: 'hk-drohnen-stoeren', attribute: 'technik', threshold: 4, tags: ['drohne'], label: '[Technik 4]' },
    },
  ],
  lights: [
    { at: [955, 190], radius: 210, color: '#ff3fa4', intensity: 0.7, slots: ['abend', 'nacht'] },
    { at: [1150, 200], radius: 110, color: '#ff8a2a', intensity: 0.6, slots: ['abend', 'nacht'] },
    { at: [1335, 40], radius: 240, color: '#e8f4ff', intensity: 0.8, slots: ['nacht'] },
    { at: [665, 150], radius: 150, color: '#3ef2ff', intensity: 0.7, slots: ['abend', 'nacht'] },
    { at: [470, 150], radius: 110, color: '#3ef2ff', intensity: 0.5, slots: ['abend', 'nacht'] },
    { at: [220, 130], radius: 140, color: '#ff3fa4', intensity: 0.5, slots: ['abend', 'nacht'] },
    { at: [700, 770], radius: 120, color: '#ffd89a', intensity: 0.6, slots: ['morgen', 'abend', 'nacht'] },
    { at: [990, 840], radius: 160, color: '#ffcf7a', intensity: 0.7, slots: ['abend', 'nacht'] },
    { at: [1400, 830], radius: 130, color: '#ffcf7a', intensity: 0.6, slots: ['abend', 'nacht'] },
    { at: [925, 445], radius: 60, color: '#ff2a2a', intensity: 0.8, slots: ['abend', 'nacht'] },
    { at: [1225, 445], radius: 60, color: '#ff2a2a', intensity: 0.8, slots: ['abend', 'nacht'] },
    { at: [1100, 900], radius: 340, color: '#39ff9c', intensity: 0.35, slots: ['nacht'] },
    { at: [230, 560], radius: 120, color: '#b04bff', intensity: 0.45, slots: ['abend', 'nacht'] },
    { at: [40, 370], radius: 110, color: '#ffb36b', intensity: 0.6, slots: ['abend', 'nacht'] },
  ],
  ambient: {
    count: 8,
    bySlot: { morgen: 5, tag: 10, abend: 8, nacht: 4 },
    sprites: [
      'passant-arbeiterin-walk', 'passant-schrotti-walk', 'passant-kurier-walk', 'passant-strassenhaendler-walk',
      'passant-oma-walk', 'passant-tourist-walk', 'passant-punk-walk', 'passant-anzug-walk',
    ],
    routes: [
      [[40, 272], [700, 320], [1280, 300]],
      [[471, 275], [760, 450], [1150, 480]],
      [[200, 420], [560, 470], [800, 620]],
      [[1350, 470], [1100, 540], [620, 470]],
      [[150, 982], [400, 960], [560, 700], [700, 420]],
      [[760, 330], [1040, 300], [1380, 480]],
    ],
    barks: [
      { text: 'Wer hat schon wieder die Laterne geklaut? Die war festgeschraubt!' },
      { text: 'Mutter Brühe sagt, heute gibt’s Suppe. Gestern gab’s auch Suppe.' },
      { text: 'Die Rostzähne haben gestern meinen Schatten erpresst.' },
      { text: 'Spielt jemand Eins? Ich hab nur noch Plus-Vier-Karten.' },
      { text: 'Grete hat heute Algen-Chips. Oder Algen. Oder Chips. Schwer zu sagen.' },
      { text: 'Der Kran hat sich bewegt. Ich schwör’s. Ganz von allein.' },
      { text: 'Nebelhorn sagt, die Fähre fährt pünktlich. Wohin, sagt er nicht.' },
      { text: 'Scheiß Möwen. Scheiß Smog. Scheiß Montag.', when: { weekday: 'mo' } },
      { text: 'Kaffee. Bitte. Irgendwer. Ich zahl in Fisch.', when: { time: 'morgen' } },
      { text: 'Freitag Drohnenrennen! Ich setz alles auf Tilda. Alles heißt: drei Credits.', when: { weekday: ['do', 'fr'] } },
      { text: 'Hörst du die Laster am Depot? Die fahren ohne Licht. Ich guck da nicht hin.', when: NACHTS },
      { text: 'Bleib aus dem Labyrinth, Schätzchen. Abends gehört das den Rostzähnen.', when: ABENDS_NACHTS },
      { text: 'Früher war die Rennhalle voll. Bis die Traverse kam. Seitdem … na ja.', when: { time: ['tag', 'abend'] } },
      { text: 'Mein Nachbar sagt jetzt immer „Ja, Master“. Früher hat er nur gegrunzt.', when: { act: 2 } },
      { text: 'Chrome 10 hier, Chrome 10 da. Ich will einfach nur meine Nougatbombe.', when: { act: 2 } },
      { text: 'Hunters Leute waren hier. Jetzt ist alles ruhiger. Und lauter.', when: { act: 2 } },
      { text: 'Die Bildschirme sind aus! Ich sehe zum ersten Mal den Himmel. Der ist ja grau.', when: { act: 3 } },
      { text: 'Fährt hier echt ein Bus ans Meer?', when: { act: 3 } },
    ],
  },
  ambience: 'unterstadt',
  onEnter: [
    { id: 'hafenkante-erstbesuch', once: true, dialogue: 'hafenkante-ankunft', effects: [{ markSeen: 'hafenkante-betreten' }] },
  ],
};

export const part: ContentPart = {
  maps: { [hafenkante.id]: hafenkante },
  stations: {
    'station-hafenkante': { id: 'station-hafenkante', name: 'Hafenkante', map: 'hafenkante', entry: 'station', cityPos: [0.58, 0.68] },
  },
  dialogues: {
    'hafenkante-ankunft': {
      id: 'hafenkante-ankunft',
      start: 'a',
      nodes: [
        {
          id: 'a',
          lines: [
            { speaker: 'narrator', text: 'Die Hafenkante. Salzluft, Diesel und eine Brise, die nach Fisch riecht und nach Fisch schmeckt. Zwei rostige Kräne stehen über dem grünen Becken wie Rentner, die nicht nach Hause wollen.' },
            { speaker: 'narrator', text: 'Ein Hausboot dümpelt am Steg, die Rennhalle schweigt, und hinten am Depot brummt Quantum-Strom durch einen Zaun, der viel zu sauber ist für diese Gegend.' },
          ],
        },
      ],
    },
  },
};
