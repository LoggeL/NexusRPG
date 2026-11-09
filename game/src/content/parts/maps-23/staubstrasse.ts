// Staubstraße (world.md §3.5, §3.8, §3.9, §8.7, §10.4/§10.7; Plan design/plan/act23.json → maps.staubstrasse,
// Paket pkg-staubstrasse). Zone 1536×1024, Tor zur Ödnis: Rostlaube-Parkplatz (zurück zur Hafenkante), gerade
// Wüstenstraße mit Pistenkreuz (Nord: Funkturm-Ruine, Süd: Aussiedlerhof), Wegzoll-Schranke nach Westen (Glasdünen,
// nur mit Giftschutz), Wrackburg der Staubfalken, Rennpiste mit Sprungschanze, Rudis Diner im Flugzeugrumpf,
// Konvoi-Halt (Mo/Do), Lagerfeuer, Brösels Wasserstand, Singende Masten.
// Quest-Hotspots mit Plan-IDs (sprungschanze gc-134, singende-masten gc-92, wegzoll gc-93) und feste Quest-Begegnungen
// legen die Quest-Pakete per mapAdditions an die Spots hier (siehe design/plan/gaps/maps-23.md).
import type { Condition, MapDef, Point, Polygon, Rect } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const box = ([x, y, w, h]: Rect): Polygon => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];

/** Plan-Spots (act23.json) plus eigene Punkte. */
const S = {
  'rostlaube-parkplatz': [1290, 640],
  'diner-tuer': [528, 905],
  'diner-leuchtschild': [545, 650],
  'wrackburg-tor': [365, 410],
  'wrackburg-hof': [300, 255],
  'staubfalken-wache': [560, 425],
  'rennpiste-start': [1195, 395],
  sprungschanze: [1400, 245],
  lagerfeuer: [975, 715],
  'konvoi-halt': [1270, 665],
  'broesel-wasserstand': [790, 425],
  'wegzoll-schranke': [240, 520],
  'singende-masten': [215, 680],
  'pisten-kreuz': [970, 520],
  'windraeder-blick': [780, 225],
  'auftrag-a': [1420, 660],
  // eigene
  'taxi-landeplatz': [1130, 625],
  'diner-heck': [885, 760],
  'wrackburg-mauer': [645, 160],
  'glasstaub-kante': [70, 625],
} satisfies Record<string, Point>;

const at = (id: keyof typeof S): Point => S[id];
const off = (id: keyof typeof S, dx: number, dy: number): Point => [S[id][0] + dx, S[id][1] + dy];

const N = 'narrator';
const TAGSUEBER: Condition = { time: ['tag', 'abend'] };
const ABENDS_NACHTS: Condition = { time: ['abend', 'nacht'] };
const KONVOI_DA: Condition = { all: [{ weekday: ['mo', 'do'] }, { time: 'tag' }] };
const FRIEDEN: Condition = { quest: 'side-oednis-frieden', state: 'done' };
const KRAEHES_EHRE: Condition = { quest: 'side-kraehes-ehre', state: 'done' };
/** Staubfalken lassen dich in Ruhe nach dem Frieden oder mit Krähes freiem Geleit (wie parts/combat-23/random.ts). */
const FALKEN_FEINDLICH: Condition = { all: [{ not: FRIEDEN }, { not: KRAEHES_EHRE }] };
const ROSTLAUBE: Condition = { quest: 'side-rostlaube', state: 'done' };
/** Giftschutz für die Glasdünen (world.md §3.2): Filtermembran, Staubmaske oder gc-111 [Körper 8] (dauerhaft abgehärtet). */
const GIFTSCHUTZ: Condition = {
  any: [{ cyberware: 'haut-filtermembran' }, { item: 'staubmaske' }, { flag: 'glasstaub_abgehaertet' }],
};
const WEG_ZUM_MEER_AKTIV: Condition = { quest: 'side-weg-zum-meer', state: 'active' };

const staubstrasse: MapDef = {
  id: 'staubstrasse',
  name: 'Staubstraße',
  subtitle: 'Ödnis · Tor zur Wüste',
  size: [1536, 1024],
  district: 'oednis',
  lighting: 'outdoor',
  bg: 'bg-staubstrasse',
  bgVariants: [{ when: FRIEDEN, bg: 'bg-staubstrasse-frieden' }],
  walk: [
    [[0, 0], [1536, 0], [1536, 1024], [0, 1024]],
  ],
  block: [
    box([40, 0, 580, 120]), // Wrackburg: Nordmauer aus Autowracks
    box([40, 0, 85, 390]), // Westmauer
    box([120, 100, 125, 50]), // Fässer und Bude an der Nordmauer
    box([475, 60, 135, 140]), // Ostbude
    box([510, 200, 100, 195]), // Wachturm
    box([20, 255, 270, 130]), // Südmauer links vom Tor
    box([440, 285, 75, 105]), // Südmauer rechts vom Tor
    box([255, 180, 40, 45]), box([310, 160, 65, 45]), box([390, 200, 40, 45]), box([455, 205, 65, 55]), // Hof: Feuertonne, Sofa, Sessel, Motorrad
    box([650, 270, 225, 120]), // Brösels Wasserstand (Tank, Schirm, Kanister)
    box([705, 150, 25, 45]), box([775, 130, 25, 55]), box([850, 120, 25, 40]), // Windräder
    box([1000, 50, 525, 60]), box([1000, 100, 60, 200]), box([1470, 100, 55, 200]), // Rennpiste: Reifenwall oben, links, rechts
    box([1040, 240, 130, 130]), box([1220, 260, 305, 110]), // Reifenwall unten mit Startturm (Lücke an der Startlinie)
    box([1140, 160, 110, 45]), box([1360, 150, 90, 65]), // Innenfeld-Reifen, Sprungschanze
    box([905, 525, 50, 45]), // Wegweiser
    box([20, 430, 150, 150]), box([165, 510, 40, 70]), // Zollbude mit Sandsäcken, Schrankenfuß
    box([225, 730, 640, 120]), // Rudis Diner (Rumpf)
    [[330, 850], [490, 840], [460, 905], [340, 920]], // Tragfläche
    box([440, 855, 40, 45]), box([575, 845, 40, 50]), // Fässer am Diner
    box([770, 650, 80, 85]), // Leitwerk
    box([85, 840, 55, 60]), box([145, 860, 55, 40]), box([65, 890, 85, 50]), // Singende Masten und Schaltkästen
    box([1015, 700, 95, 45]), // Lagerfeuer
    box([1020, 745, 225, 165]), box([1240, 740, 60, 140]), box([1290, 700, 225, 200]), // Konvoi-Laster
    box([1300, 545, 180, 55]), box([1480, 545, 45, 55]), // Rostlaube, Fässer
    box([1255, 565, 30, 55]), // Kaktus
  ],
  foreground: [
    { rect: [20, 240, 600, 150], baseY: 390 },
    { rect: [650, 250, 225, 145], baseY: 392 },
    { rect: [1040, 230, 130, 140], baseY: 370 },
    { rect: [220, 650, 650, 230], baseY: 870 },
    { rect: [1020, 690, 495, 230], baseY: 910 },
    { rect: [20, 430, 160, 150], baseY: 580 },
    { rect: [1295, 505, 230, 100], baseY: 600 },
  ],
  exits: [
    {
      id: 'rostlaube', rect: [1310, 598, 160, 26], to: 'hafenkante', entry: 'von-staubstrasse', label: 'Mit der Rostlaube zurück in die Stadt',
      interact: true, minutes: 60,
    },
    { id: 'nach-aussiedlerhof', rect: [850, 1000, 120, 24], to: 'aussiedlerhof', entry: 'von-staubstrasse', label: 'Piste zum Aussiedlerhof' },
    { id: 'nach-funkturm-ruine', rect: [860, 0, 110, 24], to: 'funkturm-ruine', entry: 'von-staubstrasse', label: 'Piste zur Funkturm-Ruine' },
    {
      id: 'nach-glasduenen', rect: [0, 380, 24, 240], to: 'glasduenen', entry: 'von-staubstrasse', label: 'Piste zu den Glasdünen',
      when: GIFTSCHUTZ,
      lockedText: 'Der Wind trägt Glasstaub. Nach drei Atemzügen schmeckst du Blut und Regenbogen. Ohne Filter geht hier keiner weiter.',
    },
    {
      id: 'diner-tuer', rect: [500, 850, 60, 26], to: 'rudis-diner', entry: 'von-staubstrasse', label: 'Rudis Diner',
      interact: true,
    },
  ],
  entries: {
    'von-hafenkante': { at: [1290, 640], facing: 'w' },
    'von-aussiedlerhof': { at: [905, 970], facing: 'n' },
    'von-funkturm-ruine': { at: [912, 55], facing: 's' },
    'von-glasduenen': { at: [100, 615], facing: 'e' },
    'von-rudis-diner': { at: [528, 910], facing: 's' },
    taxi: { at: [1150, 640], facing: 's' },
  },
  spots: Object.fromEntries(Object.entries(S).map(([id, p]) => [id, { at: p }])),
  hotspots: [
    // ---------------------------------------------------------------- Aktivitäten (world.md §3.9)
    {
      id: 'wrackrennen', at: at('rennpiste-start'), radius: 60, label: 'Wrackrennen fahren', kind: 'use',
      when: { all: [TAGSUEBER, ROSTLAUBE] }, daily: true,
      lines: [
        { speaker: N, text: 'An der Startlinie lehnen drei Staubfalken an einem Ölfass und wetten um Patronen. Einer pfeift, als er die Rostlaube sieht: „Die Karre? Mutig. Krähe fährt heute nicht, aber ich schon. Einmal rum, Schanze inklusive.“' },
      ],
      effects: [{
        minigame: 'akt-wrackrennen', level: 2, key: 'wrackrennen-staubstrasse', label: 'Wrackrennen auf der Staubpiste',
        win: [
          { rep: 'staubfalken', delta: 3 }, { credits: 40 },
          { message: 'Du rauschst als Erste über die Ziellinie. Die Falken heulen wie Kojoten und zahlen ihre Wette: 40 Cr und ein bisschen Respekt.' },
        ],
        lose: [{ message: 'Die Rostlaube hustet Staub, du hustest mit. Die Falken klatschen trotzdem. Höflich. Ein bisschen gemein.' }],
      }],
    },
    {
      id: 'wrackrennen-ohne-wagen', at: at('rennpiste-start'), radius: 60, label: 'Rennpiste ansehen', kind: 'look',
      when: { not: { all: [TAGSUEBER, ROSTLAUBE] } },
      lines: [
        { speaker: N, text: 'Eine Ovalpiste aus festgefahrenem Sand, eingefasst von Reifenstapeln und Ölfässern. An der Startlinie ein Gerüstturm, an dem eine zerfetzte Zielflagge hängt. In den Reifen stecken Kronkorken, einer für jeden Unfall. Es sind viele.' },
        { speaker: N, text: 'Gefahren wird tagsüber und abends, mit eigenem Wagen. Zu Fuß, sagen die Falken, ist es kein Rennen, sondern Selbstmord mit Zuschauern.' },
      ],
    },
    {
      id: 'schanze-ansehen', at: off('sprungschanze', 0, 30), radius: 48, label: 'Sprungschanze ansehen', kind: 'look',
      hideWhen: { quest: 'side-kraehes-ehre', state: 'active' },
      lines: [
        { speaker: N, text: 'Eine Rampe aus Bohlen, einer Motorhaube und viel Gottvertrauen. Dahinter siebzig Meter Abkürzung durch die Luft, wenn man im richtigen Moment Gas gibt. Wer zu früh Gas gibt, landet im Reifenstapel. Wer zu spät, im Krankenhaus. Das nächste Krankenhaus ist sechzig Minuten weg.' },
      ],
    },
    // ---------------------------------------------------------------- Händler und Dienste
    { id: 'konvoi', at: at('konvoi-halt'), radius: 64, label: 'Beim Konvoi handeln', kind: 'shop', shop: 'konvoi', when: KONVOI_DA },
    {
      id: 'konvoi-zu', at: at('konvoi-halt'), radius: 64, label: 'Konvoi-Halt', kind: 'look', when: { not: KONVOI_DA },
      lines: [
        { speaker: N, text: 'Die Laster des Konvois stehen da wie schlafende Elefanten aus Stahl. Planen zu, Ladeluken verriegelt, unter einem Reifen schnarcht ein Fahrer mit Hut auf dem Gesicht.' },
        { speaker: N, text: 'Ein Brett an der Stoßstange, mit Kreide: ein Mond, zwei Kreuze. Montag und Donnerstag, tagsüber. Sonst wird geschlafen, getankt oder gelogen.' },
      ],
    },
    {
      id: 'taxi-funk', at: at('taxi-landeplatz'), radius: 50, label: 'Kiki anfunken', kind: 'use',
      when: { quest: 'pers-kiki-reichweite', state: 'done' },
      lines: [{ speaker: N, text: 'Du drückst die Notruftaste, die Kiki dir in die Hand gedrückt hat. Nach vier Sekunden knackt es: „Kurs liegt an, Süße! Halt dich an deinem Sand fest!“ Ein gelbes Schwebetaxi fällt fast vom Himmel.' }],
      effects: [{ dialogue: 'kiki-karbon-taxi' }],
    },
    // ---------------------------------------------------------------- Orte zum Ansehen
    {
      id: 'diner-leuchtschild', at: at('diner-leuchtschild'), radius: 44, label: 'Leuchtschild ansehen', kind: 'look',
      lines: [
        { speaker: N, text: 'Über der Tür ein Stapel Pfannkuchen mit Flügeln, aus Neonröhren gebogen. Darunter die Schrift, an der drei Buchstaben flackern: „RUDIS – Pfannkuchen seit dem Absturz“.' },
        { speaker: N, text: 'Nachts sieht man das Ding aus fünf Kilometern. Die Konvoi-Fahrer sagen, es hätte mehr Leben gerettet als jede Karte. Die Staubfalken sagen, es hätte mehr Leute angelockt als jede Falle.' },
      ],
    },
    {
      id: 'wrackburg-tor-ansehen', at: off('wrackburg-tor', 70, 10), radius: 50, label: 'Wrackburg ansehen', kind: 'look',
      lines: [
        { speaker: N, text: 'Die Wrackburg: Busse, Pick-ups und eine halbe Planierraupe, aufeinandergestapelt zu einer Festung. Auf den Zinnen flattern Wimpel aus Krähenfedern und Unterhosen. Das Tor besteht aus zwei Autotüren und einer Kette, die bei jedem Windstoß klimpert.' },
        { speaker: N, text: 'Über dem Tor ein Krähenschädel aus Blech. Seine Augen sind Rücklichter. Sie blinken, wenn jemand reinkommt, und zweimal, wenn jemand nicht wieder rauskommt.' },
      ],
    },
    {
      id: 'wrackburg-hof-ansehen', at: off('wrackburg-hof', 80, 20), radius: 50, label: 'Feuertonne im Hof', kind: 'look',
      when: { not: { time: 'morgen' } },
      lines: [
        { speaker: N, text: 'In der Mitte des Hofs brennt eine Feuertonne, um die durchgesessene Sofas stehen. An einer Wand hängt eine Tafel aus Blech, darauf Striche und Namen. „Geschichten, die Krähe noch nicht kannte“, steht drüber. Die Liste ist kurz.' },
      ],
    },
    {
      id: 'wrackburg-morgens', at: off('wrackburg-hof', 80, 20), radius: 50, label: 'Leerer Hof', kind: 'look', when: { time: 'morgen' },
      lines: [
        { speaker: N, text: 'Morgens schläft die Wrackburg. Aus einem Bus schnarcht es dreistimmig. Die Feuertonne glimmt, eine Krähe aus Blech dreht sich auf ihrer Stange im Wind und guckt dich an, als hättest du ihr Frühstück geklaut.' },
      ],
    },
    {
      id: 'staubfalken-wache-ansehen', at: off('staubfalken-wache', 20, 26), radius: 40, label: 'Wachposten', kind: 'look',
      lines: [
        { speaker: N, text: 'Ein Hochsitz auf Stelzen aus Auspuffrohren, oben eine Handkurbel-Sirene. Wer hier Wache schiebt, sieht dich lange, bevor du ihn siehst. Und kurbelt vorsichtshalber schon mal.' },
      ],
    },
    {
      id: 'wasserstand-leer', at: off('broesel-wasserstand', 0, 20), radius: 50, label: 'Wasserstand', kind: 'look',
      when: { quest: 'kopfgeld-staubbaron-broesel', state: 'done' },
      lines: [
        { speaker: N, text: 'Brösels Wasserstand ist verwaist. Jemand hat den Hahn abgeschraubt und ein Schild drangehängt: „Wasser gibt’s bei Rudi. Umsonst. Für Arschlöcher drei Credits.“' },
      ],
    },
    {
      id: 'pisten-kreuz', at: off('pisten-kreuz', 20, -30), radius: 46, label: 'Wegweiser lesen', kind: 'look',
      lines: [
        { speaker: N, text: 'Ein Pfahl voller Pfeile. Nach Norden: „FUNK“. Nach Süden: „HOF (Honig!)“. Nach Westen: „MEER“, dreimal durchgestrichen, darunter „GLAS – NICHT ATMEN“. Nach Osten: „STADT“, mit einer kleinen Zeichnung eines Mittelfingers.' },
        { speaker: N, text: 'Ein Ziegenroboter knabbert unten am Pfahl. Der Wegweiser nach Süden ist schon zur Hälfte gefressen.' },
      ],
    },
    {
      id: 'windraeder-blick', at: at('windraeder-blick'), radius: 56, label: 'Windräder am Horizont', kind: 'look',
      lines: [
        { speaker: N, text: 'Drei weiße Windräder auf den Dünen, eins dreht sich, eins zuckt, eins hat aufgegeben. Dahinter nichts als Sand bis zum Himmel, und der Himmel ist hier so weit, dass man sich klein fühlt. In der Stadt gibt’s davon nur einen Streifen zwischen den Dächern.' },
        { speaker: N, text: 'Wenn der Wind dreht, hört man von Norden Musik. Opa Funk, sagen die Leute. Radio Rost. Er sendet schon, seit es nichts mehr gibt, worüber man berichten könnte.' },
      ],
    },
    {
      id: 'masten-ansehen', at: off('singende-masten', -25, 30), radius: 48, label: 'Singende Masten', kind: 'look',
      hideWhen: WEG_ZUM_MEER_AKTIV,
      lines: [
        { speaker: N, text: 'Alte Funkmasten, schief in den Sand gerammt, behängt mit Blechdosen, Windspielen und Flaschen. Wenn der Wind durchgeht, heulen sie in einem Akkord, der dir in die Zähne fährt.' },
        { speaker: N, text: 'Marla sagt, wer den Masten zuhört, weiß, woher der Sandsturm kommt. Die Falken sagen, wer den Masten zuhört, wird irgendwann komisch. Marla hört ihnen sehr oft zu.' },
      ],
    },
    {
      id: 'schranke-ansehen', at: off('wegzoll-schranke', 60, -50), radius: 46, label: 'Wegzoll-Schranke', kind: 'look',
      hideWhen: WEG_ZUM_MEER_AKTIV,
      when: { not: FRIEDEN },
      lines: [
        { speaker: N, text: 'Ein rot-weißes Rohr auf einem Reifenstapel, daneben eine Zollbude aus Blech mit Krähenfedern am Dach. Ein Schild: „WEGZOLL – 300 Cr, eine Geschichte oder deine Schuhe“. Davor ein Haufen Schuhe.' },
      ],
    },
    {
      id: 'schranke-frieden', at: off('wegzoll-schranke', 60, -50), radius: 46, label: 'Offene Schranke', kind: 'look', when: FRIEDEN,
      lines: [
        { speaker: N, text: 'Die Schranke steht offen und ist mit Blumen aus Draht geschmückt. Auf dem Zollschild ist „300 Cr“ durchgestrichen. Neu: „Eskorte zum Meer: frag Krähe. Schuhe: behalt sie.“' },
      ],
    },
    {
      id: 'glasstaub-durchhalten', at: at('glasstaub-kante'), radius: 50, label: 'Ohne Filter in den Glasstaub', kind: 'check', check: 'gc-111',
      hideWhen: GIFTSCHUTZ,
      altText: 'Nach zwei Schritten brennt die Lunge, nach drei siehst du Regenbogen. Mit einer Staubmaske (Rudi, Fluss-Frieda), einer Filtermembran (Ripper) – oder deutlich mehr Körper – kommst du durch.',
      effects: [
        { setFlag: 'glasstaub_abgehaertet' },
        { message: 'Du ziehst dir das Tuch vors Gesicht, atmest flach und läufst. Es brennt. Es glitzert. Es geht. Deine Lunge ist ab heute offiziell aus Leder.' },
      ],
    },
    {
      id: 'rostlaube-ansehen', at: [1225, 580], radius: 40, label: 'Rostlaube', kind: 'look',
      lines: [
        { speaker: N, text: 'Die Rostlaube parkt schief im Sand, die Motorhaube tickt in der Hitze. Auf der Heckscheibe hat jemand mit dem Finger „WASCH MICH“ in den Staub geschrieben, darunter, in anderer Schrift: „NEIN“.' },
      ],
    },
    {
      id: 'lagerfeuer-tag', at: off('lagerfeuer', 0, 40), radius: 46, label: 'Feuerstelle', kind: 'look', when: { not: ABENDS_NACHTS },
      lines: [
        { speaker: N, text: 'Ein Ring aus Steinen und Baumstämmen, in der Mitte kalte Asche und ein verbeulter Kessel. Abends brennt hier ein Feuer, und wer sich dazusetzt, kriegt einen Becher und eine Geschichte. Meistens in der Reihenfolge.' },
      ],
    },
    {
      id: 'lagerfeuer-abend', at: off('lagerfeuer', 0, 40), radius: 46, label: 'Am Lagerfeuer sitzen', kind: 'use', when: ABENDS_NACHTS, daily: true,
      lines: [
        { speaker: N, text: 'Du setzt dich ans Feuer. Jemand drückt dir einen Becher in die Hand, der nach Rauch und Kaktus schmeckt. Über dir so viele Sterne, dass es fast obszön ist. In der Stadt hat man die alle verkauft.' },
        { speaker: N, text: 'Eine Weile sagt keiner was. Dann erzählt ein Konvoi-Fahrer von einem Ort, wo das Wasser blau ist und bis zum Horizont geht. Alle lachen. Keiner glaubt es. Alle wollen hin.' },
      ],
      effects: [{ heal: 'full' }, { advanceTime: 30 }],
    },
    // ---------------------------------------------------------------- Sammelobjekte
    {
      id: 'glueckstern-16', at: at('wrackburg-mauer'), radius: 44, label: 'Glitzern in der Wrackmauer', kind: 'loot', once: true,
      lines: [{ speaker: N, text: 'Zwischen einem Kühlergrill und einer Badewanne klemmt etwas Funkelndes in der Wrackmauer. Die Falken haben es übersehen. Oder es war ihnen zu kitschig.' }],
      effects: [{ give: 'glueckstern-16' }],
    },
    {
      id: 'neon-tag-09', at: at('diner-heck'), radius: 44, label: 'Neon-Tag am Leitwerk abfotografieren', kind: 'loot', once: true,
      lines: [{ speaker: N, text: 'Hinten am Leitwerk des Diners leuchtet ein Tag in Neonfarbe: ein Falke aus Schrott, die Flügel aus Radkappen. Wer hier gesprüht hat, musste auf Rudis Mülltonnen stehen. Rudi weiß es. Rudi hat die Leiter gehalten.' }],
      effects: [{ give: 'neon-tag-09' }],
    },
    {
      id: 'flaschenpost-03', at: [215, 955], radius: 44, label: 'Flasche im Sand ausgraben', kind: 'loot', once: true,
      lines: [{ speaker: N, text: 'Am Fuß eines Masts steckt eine Flasche im Sand, als hätte sie jemand hier eingepflanzt. Flaschenpost. Mitten in der Wüste. Irgendwer hat Humor oder keine Karte.' }],
      effects: [{ give: 'flaschenpost-03' }],
    },
  ],
  encounters: [
    {
      id: 'falken-schranke-abends', encounter: 'enc-zufall-staubstrasse-falken-abend', at: off('wegzoll-schranke', 120, 40),
      sprite: 'staubfalke-walk', when: { all: [{ time: 'abend' }, FALKEN_FEINDLICH] },
      patrol: [off('wegzoll-schranke', 120, 40), off('wegzoll-schranke', 300, 60), off('wegzoll-schranke', 160, 160)],
      avoid: { id: 'st-falken-geschichte', attribute: 'ausstrahlung', threshold: 6, tags: ['verhandeln', 'geschichte'], label: '[Ausstrahlung 6]' },
    },
    {
      id: 'falken-piste-nachts', encounter: 'enc-zufall-staubstrasse-falken-nacht', at: [1000, 460],
      sprite: 'staubfalke-walk', when: { all: [{ time: 'nacht' }, FALKEN_FEINDLICH] },
      patrol: [[1000, 460], [1250, 440], [1200, 640], [1000, 600]],
      avoid: { id: 'st-falken-umschleichen', attribute: 'reflexe', threshold: 6, tags: ['schleichen'], label: '[Reflexe 6]' },
    },
    {
      id: 'schrottkraehen-tag', encounter: 'enc-zufall-staubstrasse-kraehen-tag', at: [900, 300],
      sprite: 'schrottkraehe-walk', when: { time: 'tag' },
      patrol: [[900, 300], [760, 470], [960, 420]],
      avoid: { id: 'st-kraehen-ablenken', attribute: 'strasse', threshold: 5, tags: ['ablenken'], label: '[Straße 5]' },
    },
  ],
  lights: [
    { at: [545, 700], radius: 180, color: '#ff3fa4', intensity: 0.75, slots: ['abend', 'nacht'] },
    { at: [545, 725], radius: 110, color: '#3ef2ff', intensity: 0.55, slots: ['abend', 'nacht'] },
    { at: [380, 790], radius: 110, color: '#ffcf7a', intensity: 0.6, slots: ['abend', 'nacht'] },
    { at: [680, 790], radius: 120, color: '#ffcf7a', intensity: 0.6, slots: ['abend', 'nacht'] },
    { at: [528, 830], radius: 90, color: '#ffd89a', intensity: 0.6, slots: ['abend', 'nacht'] },
    { at: [1062, 720], radius: 210, color: '#ff8a2a', intensity: 0.85, slots: ['abend', 'nacht'] },
    { at: [272, 195], radius: 170, color: '#ff8a2a', intensity: 0.75, slots: ['abend', 'nacht'] },
    { at: [548, 260], radius: 70, color: '#3ef2ff', intensity: 0.5, slots: ['abend', 'nacht'] },
    { at: [120, 515], radius: 90, color: '#3ef2ff', intensity: 0.5, slots: ['abend', 'nacht'] },
    { at: [790, 330], radius: 90, color: '#ffd89a', intensity: 0.45, slots: ['abend', 'nacht'] },
    { at: [1330, 820], radius: 70, color: '#ff3fa4', intensity: 0.5, slots: ['abend', 'nacht'] },
    { at: [1140, 860], radius: 70, color: '#3ef2ff', intensity: 0.5, slots: ['abend', 'nacht'] },
    { at: [1050, 130], radius: 70, color: '#fff2c8', intensity: 0.5, slots: ['abend', 'nacht'] },
    { at: [1470, 80], radius: 70, color: '#fff2c8', intensity: 0.5, slots: ['abend', 'nacht'] },
    { at: [760, 512], radius: 900, color: '#ff9a3c', intensity: 0.12, slots: ['abend'] },
  ],
  ambient: {
    count: 2,
    bySlot: { morgen: 1, tag: 3, abend: 4, nacht: 1 },
    sprites: ['passant-arbeiterin-walk', 'passant-schrotti-walk', 'passant-punk-walk'],
    routes: [
      [[1290, 640], [890, 555], [560, 520], [528, 910]],
      [[905, 970], [920, 640], [790, 440]],
      [[365, 420], [700, 520], [975, 760]],
      [[1270, 665], [1100, 640], [970, 520], [912, 60]],
    ],
    barks: [
      { text: 'Wasser ist Leben. Sand ist … auch da.' },
      { text: 'Radio Rost spielt heute wieder nur Platten mit Sprung.' },
      { text: 'Die Falken fliegen tief. Gibt Sturm oder Ärger.' },
      { text: 'Rudi hat heute Pfannkuchen. Rudi hat jeden Tag Pfannkuchen. Rudi IST Pfannkuchen.' },
      { text: 'Dieser verdammte Ziegenroboter hat schon wieder den Wegweiser gefressen.' },
      { text: 'Heiß. Heißer. Ödnis.', when: { time: 'tag' } },
      { text: 'Montag und Donnerstag kommt der Konvoi. Heute ist … verdammt, welcher Tag ist heute?', when: { not: KONVOI_DA } },
      { text: 'Der Konvoi ist da! Wer Postkarten vom Meer will: Die sind gelogen, aber hübsch.', when: KONVOI_DA },
      { text: 'Wer abends am Feuer sitzt, hört die besten Lügen der Ödnis.', when: { time: 'abend' } },
      { text: 'Nicht so laut. Nachts hören die Falken alles.', when: { all: [{ time: 'nacht' }, FALKEN_FEINDLICH] } },
      { text: 'Dreihundert Wegzoll. Dreihundert! Ich zahl lieber in Schuhen.', when: FALKEN_FEINDLICH },
      { text: 'Seit dem Frieden fahr ich mit Falken-Eskorte. Die riechen nach Diesel, aber sie schießen nicht auf mich.', when: FRIEDEN },
      { text: 'Krähe sagt, du hast ’ne gute Geschichte. Krähe sagt das sonst nie.', when: KRAEHES_EHRE },
      { text: 'Der Konvoi fährt jetzt jeden Tag ans Meer. Mit Sonnencreme!', when: { flag: 'epilog' } },
    ],
  },
  ambience: 'oednis',
  onEnter: [
    { id: 'staubstrasse-erstbesuch', once: true, dialogue: 'staubstrasse-ankunft', effects: [{ markSeen: 'staubstrasse-betreten' }] },
  ],
};

export const part: ContentPart = {
  maps: { [staubstrasse.id]: staubstrasse },
  dialogues: {
    'staubstrasse-ankunft': {
      id: 'staubstrasse-ankunft',
      start: 'a',
      nodes: [
        {
          id: 'a',
          lines: [
            { speaker: N, text: 'Die Stadt hört nicht auf, sie franst aus. Erst Zäune, dann Schrott, dann nur noch Sand, rot wie Rost und heiß wie eine Herdplatte. Die Rostlaube rollt aus und gibt ein Geräusch von sich, das nach Erleichterung klingt.' },
            { speaker: N, text: 'Die Staubstraße: eine Straße, die schnurgerade ins Nichts führt, ein Flugzeug, das zum Diner geworden ist, und eine Festung aus Autowracks, auf der Krähenfedern flattern. Von irgendwoher kommt Musik. Und Staub. Vor allem Staub.' },
          ],
          choices: [
            { text: '„Endlich mal Luft, die nicht nach Kanal riecht.“', tag: '[Ödnis]', when: { origin: 'origin-oednis' }, next: 'heimat' },
            { text: '„Okay. Wo ist hier das Meer?“', next: 'meer' },
            { text: 'Erstmal den Staub aus den Zähnen spucken.' },
          ],
        },
        {
          id: 'heimat',
          lines: [
            { speaker: N, text: 'Der Wind dreht und trägt Holzrauch vom Lagerfeuer heran. Du liest ihn wie einen Brief von zu Hause: Sandsturm übermorgen, Konvoi Donnerstag, Rudi hat Pfannkuchen auf dem Herd. Manches ändert sich nie.' },
          ],
          effects: [{ relation: 'marla-sand', delta: 10 }],
        },
        {
          id: 'meer',
          lines: [
            { speaker: N, text: 'Der Wegweiser am Pistenkreuz zeigt nach Westen. „MEER“, dreimal durchgestrichen. Darunter: „GLAS – NICHT ATMEN“. Klingt nach einem Ausflug, für den man was Besseres als Turnschuhe braucht.' },
          ],
        },
      ],
    },
  },
};
