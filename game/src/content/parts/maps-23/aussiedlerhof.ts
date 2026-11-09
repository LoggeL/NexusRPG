// Aussiedlerhof (world.md §3.5, §3.8/§3.9, §8.7, §10.4/§10.7; Plan design/plan/act23.json, Paket pkg-oednis-hof).
// Zone 1536×1024: ein Hof aus Lehm und Wellblech in der roten Ödnis. Oben das offene Hoftor (Piste zur Staubstraße),
// links oben der Hofladen, rechts oben die Solarsegel. Links Marlas Wohnwagen mit Muschelfenstern und Veranda
// (Notschlafplatz), in der Mitte der Brunnen mit Handpumpe, rechts Elsas Werkstatt mit Gustavs Bank davor.
// Unten Beete unter Netzen, das eigene Feld, das Lagerfeuer und die Gartenecke (Serenity im Nachspiel). Ostzaun:
// dahinter funkeln die Glasdünen, nachts kommen Glasskorpione (Zufallsbegegnung combat-23/random.ts).
// Figuren (Marla, Elsa, Gustav, Serenity) setzen die Figuren-Pakete per Tagesablauf auf die Spots; Quest-Schritte
// (pers-marla-brunnen, pers-gustav-alte-liebe, pers-alesa-wasserfilter, side-weg-zum-meer) per mapAdditions.
import type { CheckDef, Condition, MapDef, Point } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import { HOFLADEN_OFFEN } from './shops-oednis-hof';

const N = 'narrator';

/** Benannte Punkte (Plan-IDs aus act23.json, alle auf begehbarem Boden). */
const S = {
  hoftor: [775, 170],
  hofladen: [400, 300],
  brunnen: [730, 560],
  beete: [300, 660],
  'eigenes-feld': [710, 705],
  'marlas-wohnwagen': [80, 655],
  veranda: [355, 640],
  wegezettel: [175, 650],
  'elsas-werkstatt': [1160, 525],
  ziegenroboter: [1280, 615],
  waescheleine: [400, 345],
  solarsegel: [960, 250],
  'zaun-ost': [1440, 690],
  'lagerfeuer-hof': [1060, 700],
  'gustav-bank': [1010, 515],
  'serenity-garten': [1185, 770],
  'auftrag-a': [560, 560],
} satisfies Record<string, Point>;

// --- Bedingungen ---------------------------------------------------------------------------------------------------
const nacht: Condition = { time: 'nacht' };
const abendNacht: Condition = { time: ['abend', 'nacht'] };
const epilog: Condition = { flag: 'epilog' };
/** Eigenes Feld: Ruf aussiedler 80 oder pers-marla-brunnen erledigt (world.md §3.5, act23.json). */
const feldFrei: Condition = { any: [{ rep: 'aussiedler', min: 80 }, { quest: 'pers-marla-brunnen', state: 'done' }] };
const gustavUndElsa: Condition = { quest: 'pers-gustav-alte-liebe', state: 'done' };
const marlaRivalin: Condition = { rival: 'marla-sand' };

/** Solarsegel ausrichten (kein world.md-Check genannt, daher eingebettet). */
const segelAusrichten: CheckDef = {
  id: 'aussiedlerhof-segel-ausrichten', attribute: 'technik', threshold: 4, tags: ['maschine', 'reparieren', 'welt'], label: '[Technik 4]',
};
/** Ziegenroboter-Morse mitlesen. */
const morseLesen: CheckDef = {
  id: 'aussiedlerhof-ziege-morse', attribute: 'technik', threshold: 5, tags: ['funk', 'beobachten'], label: '[Technik 5]',
};
/** Ziegenroboter vom Zaun wegziehen. */
const ziegeZerren: CheckDef = {
  id: 'aussiedlerhof-ziege-zerren', attribute: 'koerper', threshold: 5, tags: ['kraft', 'welt'], label: '[Körper 5]',
};

const aussiedlerhof: MapDef = {
  id: 'aussiedlerhof',
  name: 'Aussiedlerhof',
  subtitle: 'Ödnis · Marlas Hof',
  size: [1536, 1024],
  district: 'oednis',
  lighting: 'outdoor',
  bg: 'bg-aussiedlerhof',
  bgVariants: [{ when: feldFrei, bg: 'bg-aussiedlerhof-feld' }],
  walk: [
    // Piste durchs Hoftor nach Norden
    [[722, 0], [830, 0], [830, 150], [722, 150]],
    // Hofplatz
    [[0, 270], [610, 270], [610, 130], [1485, 130], [1485, 935], [0, 935]],
  ],
  block: [
    [[30, 20], [610, 20], [610, 270], [30, 270]], // Hofladen mit Kisten und Säcken
    [[610, 20], [722, 20], [722, 132], [610, 132]], // Zaun und Torflügel links
    [[830, 20], [1060, 20], [1060, 132], [830, 132]], // Torflügel und Zaun rechts
    [[1030, 130], [1485, 130], [1485, 240], [1030, 240]], // Solarsegel und Batteriekasten
    [[30, 262], [52, 262], [52, 345], [30, 345]], // Wäschepfahl links
    [[338, 262], [358, 262], [358, 345], [338, 345]], // Wäschepfahl rechts
    [[0, 350], [220, 350], [220, 610], [130, 640], [0, 640]], // Marlas Wohnwagen
    [[215, 385], [450, 385], [450, 590], [390, 590], [390, 612], [320, 612], [320, 590], [215, 590]], // Veranda
    [[640, 395], [820, 395], [820, 518], [640, 518]], // Brunnen
    [[880, 230], [1465, 230], [1465, 490], [1075, 490], [1075, 485], [945, 485], [945, 445], [880, 445]], // Elsas Werkstatt, Fässer, Bank
    [[1238, 525], [1332, 525], [1332, 585], [1238, 585]], // Ziegenroboter
    [[1360, 440], [1485, 440], [1485, 618], [1365, 618]], // Roller und Schubkarre
    [[0, 700], [520, 700], [520, 915], [0, 915]], // Beete und Regentonne
    [[585, 735], [838, 735], [838, 892], [585, 892]], // eigenes Feld
    [[918, 728], [1205, 728], [1205, 862], [918, 862]], // Feuerstelle mit Stämmen
    [[1222, 650], [1465, 650], [1465, 898], [1222, 898]], // Gartenecke
  ],
  foreground: [
    { rect: [636, 305, 194, 213], baseY: 518 }, // Pumpe ragt über den Brunnen
    { rect: [1230, 460, 110, 125], baseY: 585 }, // Ziegenroboter
    { rect: [0, 640, 525, 275], baseY: 915 }, // Netze über den Beeten
    { rect: [1222, 645, 245, 253], baseY: 898 }, // Rankgitter
  ],
  exits: [
    { id: 'nach-staubstrasse', rect: [725, 0, 102, 28], to: 'staubstrasse', entry: 'von-aussiedlerhof', label: 'Piste zur Staubstraße' },
  ],
  entries: {
    'von-staubstrasse': { at: [775, 175], facing: 's' },
    aufwachen: { at: [355, 645], facing: 's' },
    taxi: { at: [560, 420], facing: 's' },
  },
  spots: Object.fromEntries(Object.entries(S).map(([id, at]) => [id, {
    at,
    facing: (['hofladen', 'solarsegel', 'waescheleine', 'beete'].includes(id) ? 'n'
      : id === 'wegezettel' || id === 'marlas-wohnwagen' ? 'w'
        : id === 'zaun-ost' || id === 'elsas-werkstatt' ? 'e' : 's') as 'n' | 'w' | 'e' | 's',
  }])),
  hotspots: [
    // --- Hoftor und Hofladen ---------------------------------------------------------------------------------------
    {
      id: 'hoftor', at: [775, 140], radius: 50, label: 'Hoftor', kind: 'look',
      lines: [{ speaker: N, text: 'Das Hoftor ist eine alte Autotür an zwei Scharnieren aus Fahrradketten. Abgeschlossen wird nie. Wer hier rein will, muss erst vierzig Kilometer Wüste überleben, das ist Sicherheit genug.' }],
    },
    {
      id: 'hofladen', at: [400, 290], radius: 64, label: 'Hofladen', kind: 'shop', shop: 'hofladen', when: HOFLADEN_OFFEN,
      lines: [{ speaker: N, text: 'Kisten voller Möhren mit Erde dran, Honiggläser in der Sonne, Wasserfilter wie Goldbarren aufgereiht. An der Tafel: eine gemalte Möhre und eine Biene. Preise verhandelt man hier mit Händen, Füßen und Geduld.' }],
    },
    {
      id: 'hofladen-zu', at: [400, 290], radius: 64, label: 'Hofladen (zu)', kind: 'look',
      when: { all: [{ not: HOFLADEN_OFFEN }, { not: marlaRivalin }] },
      lines: [{ speaker: N, text: 'Die Markise ist eingerollt, eine Decke liegt über den Kisten. Auf der Tafel jetzt nur ein gemalter Mond. Hofladen ist morgens und tagsüber, wenn das Gemüse noch frisch und die Leute noch freundlich sind.' }],
    },
    {
      id: 'hofladen-rivalin', at: [400, 290], radius: 64, label: 'Hofladen (für dich zu)', kind: 'look', when: marlaRivalin,
      lines: [{ speaker: N, text: 'Die Läden sind runter, mitten am Tag. Auf der Tafel hat jemand eine Möhre gemalt und daneben einen Stiefel, der einen Hintern tritt. Die Botschaft ist auch ohne Buchstaben angekommen.' }],
    },
    // --- Marlas Wohnwagen, Veranda, Wegezettel ---------------------------------------------------------------------
    {
      id: 'wegezettel', at: S.wegezettel, radius: 56, label: 'Marlas Wegezettel', kind: 'board', board: 'marlas-wegezettel', when: { act: 2 },
      lines: [{ speaker: N, text: 'Eine Korkwand an der Wohnwagenseite, gespickt mit Zetteln, die mit Wäscheklammern festgehalten werden, weil Reißzwecken der Wind frisst. Wasser holen, Wracks bergen, Leute sicher von A nach B bringen. Hier draußen ist jeder Auftrag ein Gefallen mit Preisschild.' }],
    },
    {
      id: 'marlas-wohnwagen', at: [80, 660], radius: 60, label: 'Marlas Wohnwagen', kind: 'look',
      lines: [
        { speaker: N, text: 'Ein runder Silberwohnwagen, so alt, dass er noch Chrom hatte, bevor Chrom Oberstadt war. Um jedes Fenster sind Muscheln geklebt: weiß, rosa, eine blaue mit Sprung. Muscheln, vierzig Kilometer vom nächsten Wasser.' },
        { speaker: N, text: 'Durchs Fenster: eine Seekarte an der Wand, mit Bleistift weitergezeichnet, wo die gedruckten Linien aufhören. Wer so eine Karte hat, hat entweder einen Plan oder Heimweh. Bei Marla vermutlich beides.' },
      ],
    },
    {
      id: 'schallplatte-12', at: [30, 665], radius: 44, label: 'Päckchen am Fenster', kind: 'loot', once: true,
      when: { hearts: 'marla-sand', min: 5 },
      lines: [
        { speaker: N, text: 'Am Wohnwagenfenster lehnt ein flaches Päckchen in Packpapier, mit Kordel und einer getrockneten Wüstenblume verschnürt. Auf dem Zettel: „Für dich. Nicht abspielen, wenn ich dabei bin. – M.“' },
        { speaker: N, text: 'Eine Platte. Auf dem Cover Marla, zwanzig Jahre jünger, mit Mundharmonika und einem Blick, als hätte sie gerade das Meer gesehen. Sie hat dir ihr peinlichstes Geheimnis geschenkt. Das ist hier draußen ein Antrag. Oder fast.' },
      ],
      effects: [{ give: 'schallplatte-12' }, { relation: 'marla-sand', delta: 10 }],
    },
    {
      id: 'veranda', at: [355, 625], radius: 52, label: 'Auf Marlas Veranda schlafen', kind: 'sleep',
      lines: [{ speaker: N, text: 'Eine Hängematte unter der Wohnwagenmarkise, eine Wolldecke, die nach Rauch und Salbei riecht. Über dir klimpert ein Windspiel aus Glasscherben. Marla hat gesagt: „Wer müde ist, schläft. Wer schnarcht, schläft woanders.“' }],
    },
    // --- Brunnen ---------------------------------------------------------------------------------------------------
    {
      id: 'brunnen-pumpe', at: [730, 545], radius: 60, label: 'Wasser pumpen', kind: 'use',
      lines: [{ speaker: N, text: 'Die Handpumpe quietscht in drei Tonarten, hustet Rost, dann kommt Wasser. Echtes, kaltes Wasser aus der Erde, nicht aus einem Quantum-Tank. Du trinkst, bis dir der Bauch weh tut. Es schmeckt nach Stein und ein bisschen nach Hoffnung.' }],
      effects: [{ heal: 20 }, { advanceTime: 5 }],
    },
    {
      id: 'brunnen-schacht', at: [840, 470], radius: 40, label: 'In den Brunnen schauen', kind: 'look', hideWhen: { quest: 'pers-marla-brunnen', state: 'done' },
      lines: [{ speaker: N, text: 'Dunkel, kühl, tief. Ganz unten ein Glitzern, das jeden Sommer ein Stück weiter nach unten rutscht. Der Brunnen trocknet langsam aus. Alle hier wissen es, keiner sagt es laut.' }],
    },
    {
      id: 'brunnen-schacht-tief', at: [840, 470], radius: 40, label: 'In den Brunnen schauen', kind: 'look', when: { quest: 'pers-marla-brunnen', state: 'done' },
      lines: [{ speaker: N, text: 'Das Wasser steht wieder hoch, so hoch, dass du dein Spiegelbild siehst. Es sieht müde aus, aber zufrieden. Irgendwer hat mit Kreide auf den Brunnenrand gemalt: ein Herz und eine Bohrmaschine.' }],
    },
    // --- Beete und Feld --------------------------------------------------------------------------------------------
    {
      id: 'beete', at: [300, 670], radius: 70, label: 'Beete unter Netzen', kind: 'look',
      lines: [{ speaker: N, text: 'Lange Hochbeete unter Schattennetzen: Tomaten, Bohnen, Kohl mit Löchern drin, die nach Blechkäfer aussehen. Grün. So viel Grün, dass deine Stadtaugen kurz nicht wissen, wohin damit.' }],
    },
    {
      id: 'glueckstern-17', at: [545, 800], radius: 44, label: 'Glitzern zwischen den Bohnen', kind: 'loot', once: true,
      lines: [{ speaker: N, text: 'An einer Bohnenstange hängt ein Glücksstern, festgebunden mit Bast, als Vogelscheuche gegen Blechkäfer. Wirkt offensichtlich nicht. Du nimmst ihn trotzdem mit.' }],
      effects: [{ give: 'glueckstern-17' }],
    },
    {
      id: 'gaertnern', at: S['eigenes-feld'], radius: 70, label: 'Eigenes Feld bestellen', kind: 'use', when: feldFrei, daily: true,
      lines: [{ speaker: N, text: 'Dein Feld. Deins. Ein Rechteck dunkle Erde mit Planken drum herum, eine Gießkanne, eine Hacke mit deinem Namen eingeritzt, falsch geschrieben. Marla sagt, die Erde merkt sich, wer sich kümmert.' }],
      effects: [{
        minigame: 'akt-gaertnern', level: 2, key: 'aussiedlerhof-feld', label: 'Feld am Hof',
        win: [{ rep: 'aussiedler', delta: 2 }, { xp: 15 }, { advanceTime: 60 }, { message: 'Volle Körbe. Die Aussiedler nicken dir zu, als wärst du schon immer hier gewesen.' }],
        lose: [{ advanceTime: 60 }, { message: 'Die Blechkäfer feiern ein Festmahl. Du hast heute vor allem Insekten gefüttert.' }],
      }],
    },
    {
      id: 'eigenes-feld-brach', at: S['eigenes-feld'], radius: 70, label: 'Brachliegendes Feld', kind: 'look', when: { not: feldFrei },
      lines: [{ speaker: N, text: 'Ein abgestecktes Stück Erde, umgegraben und dann vergessen. Ohne Wasser wächst hier nur Staub. Marla sagt, das Feld kriegt, wer dem Hof genug gegeben hat. Oder wer den Brunnen wieder zum Laufen bringt.' }],
    },
    // --- Elsas Werkstatt, Gustavs Bank -----------------------------------------------------------------------------
    {
      id: 'elsas-werkstatt', at: [1170, 510], radius: 60, label: 'Elsas Werkstatt', kind: 'look',
      lines: [
        { speaker: N, text: 'Ein Wellblechschuppen mit offenem Rolltor, drin eine Werkbank, die aussieht wie Gustavs Werkbank, nur ordentlicher. Zahnräder in Gläsern, nach Größe sortiert. Ein Funkgerät, das leise Radio Rost spielt. Ein halber Ziegenroboter auf dem Tisch.' },
        { speaker: N, text: 'An der Wand ein verblichenes Foto: ein junger Kerl im Kranführer-Overall, der in die Kamera grinst wie ein Idiot. Jemand hat es zwanzig Jahre lang nicht abgehängt.' },
      ],
    },
    {
      id: 'gustav-bank', at: [1010, 505], radius: 46, label: 'Bank vor der Werkstatt', kind: 'look', when: { not: gustavUndElsa },
      lines: [{ speaker: N, text: 'Eine Holzbank aus einer alten Palette, Platz für zwei, benutzt von einer. Die linke Seite ist blank gesessen, die rechte staubig. Manche Leute lassen einen Platz frei, und keiner fragt warum.' }],
    },
    {
      id: 'gustav-bank-spaeter', at: [1010, 505], radius: 46, label: 'Bank vor der Werkstatt', kind: 'look', when: gustavUndElsa,
      lines: [{ speaker: N, text: 'Beide Seiten der Bank sind jetzt blank gesessen. In die Lehne ist frisch geritzt: „G + E“, und darunter, kleiner, in Elsas akkurater Schrift: „Endlich, du alter Sturkopf.“' }],
    },
    // --- Hofleben --------------------------------------------------------------------------------------------------
    {
      id: 'ziegenroboter', at: S.ziegenroboter, radius: 52, label: 'Ziegenroboter', kind: 'talk', dialogue: 'aussiedlerhof-ziegenroboter',
    },
    {
      id: 'waescheleine', at: [200, 330], radius: 56, label: 'Wäscheleine', kind: 'look',
      lines: [{ speaker: N, text: 'Hemden, Socken und ein riesiger geblümter Schlüpfer flattern im Wüstenwind. Alles ist nach einer Stunde trocken und nach zwei Stunden wieder voller Sand. Der Schlüpfer gehört angeblich niemandem. Er hängt trotzdem jede Woche da.' }],
    },
    {
      id: 'solarsegel', at: [990, 215], radius: 70, label: 'Solarsegel', kind: 'use', dialogue: 'aussiedlerhof-solarsegel',
    },
    {
      id: 'zaun-ost', at: S['zaun-ost'], radius: 56, label: 'Ostzaun', kind: 'look', when: { not: nacht },
      lines: [{ speaker: N, text: 'Ein Zaun aus Draht, Bettgestellen und einem Kühlergrill. Dahinter funkeln die Glasdünen in der Hitze, als hätte jemand den Horizont mit Glitzer bestreut. An einem Pfosten klebt Glasstaub. Etwas hat sich hier gerieben. Etwas mit Panzer.' }],
    },
    {
      id: 'zaun-ost-nacht', at: S['zaun-ost'], radius: 56, label: 'Ostzaun', kind: 'look', when: nacht,
      lines: [{ speaker: N, text: 'Im Mondlicht klirrt es hinter dem Draht. Kleine Lichtpunkte, die sich bewegen, gebrochenes Mondlicht auf Glaspanzern. Die Skorpione kommen nachts an den Zaun, wegen der Wärme, sagt Elsa. Wegen der Hühner, sagt Marla. Wegen dir, sagt dein Bauch.' }],
    },
    {
      id: 'lagerfeuer-hof', at: [1060, 705], radius: 64, label: 'Ans Lagerfeuer setzen', kind: 'use', when: abendNacht, dialogue: 'aussiedlerhof-lagerfeuer',
    },
    {
      id: 'lagerfeuer-asche', at: [1060, 705], radius: 64, label: 'Feuerstelle', kind: 'look', when: { not: abendNacht },
      lines: [{ speaker: N, text: 'Ein Ring aus Steinen, kalte Asche, Holzstämme als Bänke. Auf einem Stamm liegt eine Mundharmonika, vergessen oder hingelegt für später. Abends wird hier gesungen. Schlecht, laut und mit Herz.' }],
    },
    {
      id: 'serenity-garten', at: S['serenity-garten'], radius: 60, label: 'Gartenecke', kind: 'look', when: { not: epilog },
      lines: [{ speaker: N, text: 'Eine Ecke Erde, mit Glasscherben in einer sauberen Linie abgesteckt. Nichts wächst, aber jemand hat ein kleines Rankgitter aufgestellt, wie eine Einladung. Elsa sagt, die Ecke wartet auf jemanden, der Blumen nicht nur von Hochglanzfotos kennt.' }],
    },
    {
      id: 'serenity-garten-bluehend', at: S['serenity-garten'], radius: 60, label: 'Serenitys Garten', kind: 'look', when: epilog,
      lines: [
        { speaker: N, text: 'Die Ecke blüht. Kapuzinerkresse am Rankgitter, Ringelblumen, eine Rose, die zu trotzig ist, um in der Wüste einzugehen. Die Beete sind gerade gezogen wie mit dem Lineal, und an einem Holzstab hängt ein Paar Gartenhandschuhe in Chromsilber.' },
        { speaker: N, text: 'Die Oberstadt hat Serenity Chrome alles gegeben außer Erde unter den Fingernägeln. Hier draußen holt sie es nach, jeden Samstag.' },
      ],
    },
  ],
  lights: [
    { at: [258, 455], radius: 120, color: '#ffc46b', intensity: 0.8, slots: ['abend', 'nacht'] }, // Laterne Veranda
    { at: [150, 450], radius: 80, color: '#ffd27a', intensity: 0.5, slots: ['abend', 'nacht'] }, // Wohnwagenfenster
    { at: [1055, 810], radius: 200, color: '#ff8a3a', intensity: 0.9, slots: ['abend', 'nacht'] }, // Lagerfeuer
    { at: [1068, 325], radius: 110, color: '#ffd27a', intensity: 0.65, slots: ['abend', 'nacht'] }, // Werkstattlampe
    { at: [1230, 400], radius: 130, color: '#ffd27a', intensity: 0.45, slots: ['abend', 'nacht'] }, // Werkstatt innen
    { at: [265, 155], radius: 90, color: '#ffc46b', intensity: 0.5, slots: ['abend', 'nacht'] }, // Hofladen-Laterne
    { at: [1415, 205], radius: 60, color: '#33e6ff', intensity: 0.45, slots: ['nacht'] }, // Batteriekasten der Segel
    { at: [1515, 330], radius: 140, color: '#9fe8ff', intensity: 0.3, slots: ['nacht'] }, // Glasschimmer hinterm Zaun
  ],
  ambient: {
    count: 2,
    bySlot: { morgen: 2, tag: 3, abend: 3, nacht: 1 },
    sprites: ['passant-arbeiterin-walk', 'passant-schrotti-walk', 'passant-oma-walk', 'passant-strassenhaendler-walk'],
    routes: [
      [[775, 160], [700, 300], [560, 420], [420, 650]],
      [[860, 560], [1000, 600], [1150, 560], [1300, 640]],
      [[420, 300], [600, 330], [860, 300], [960, 220]],
      [[560, 640], [860, 690], [1100, 680], [1180, 900]],
    ],
    barks: [
      { text: 'Wasser ist Leben. Sand ist … auch da.' },
      { text: 'Radio Rost spielt heute wieder nur Platten mit Sprung.' },
      { text: 'Die Falken fliegen tief. Gibt Sturm oder Ärger.', when: { act: 2 } },
      { text: 'Der Konvoi fährt jetzt jeden Tag ans Meer. Mit Sonnencreme!', when: epilog },
      { text: 'Die Ziege hat schon wieder den Wegweiser gefressen. Jetzt weiß keiner mehr, wo Norden ist. Die Ziege schon.' },
      { text: 'Stadtmensch, was? Erkennt man an den Schuhen. Und am Gesicht, wenn du Wasser trinkst.' },
      { text: 'Fass die Tomaten nicht an. Die haben mehr Pflege gekriegt als meine Kinder.' },
      { text: 'Marla hat wieder Windrichtungen in den Sand gemalt. Morgen gibt’s Sturm. Oder sie war nur gelangweilt.' },
      { text: 'Scheißhitze. Ich schwitz Wasser, das ich mir nicht leisten kann.', when: { time: 'tag' } },
      { text: 'Morgen, Fremde. Kaffee gibt’s keinen, aber heißes Wasser mit Hoffnung.', when: { time: 'morgen' } },
      { text: 'Heut Abend singen wir wieder. Bring was zu trinken mit, oder wenigstens ’ne gute Stimme.', when: { time: 'abend' } },
      { text: 'Hörst du das Klirren am Zaun? Bleib im Licht, Kumpel. Glas mag kein Feuer.', when: nacht },
      { text: 'In der Stadt sagen sie „Ja, Master“. Hier draußen sagen wir „Verpiss dich“. Gesünder.', when: { act: 2 } },
      { text: 'Der Brunnen läuft wieder wie ’n junger Gott. Wer immer das war: Du kriegst ’n Honigglas.', when: { quest: 'pers-marla-brunnen', state: 'done' } },
      { text: 'Der alte Kranführer und Elsa sitzen jeden Abend auf der Bank. Händchen halten mit siebzig. Ich krieg Zucker.', when: gustavUndElsa },
      { text: 'Die Chrome-Lady buddelt im Beet und flucht wie ’n Hafenarbeiter. Ich mag sie.', when: epilog },
    ],
  },
  ambience: 'oednis',
  shelter: { entry: 'aufwachen' },
  onEnter: [
    { id: 'aussiedlerhof-erstbesuch', once: true, dialogue: 'aussiedlerhof-ankunft', effects: [{ markSeen: 'aussiedlerhof-betreten' }] },
    {
      id: 'aussiedlerhof-nachspiel', once: true, when: { all: [epilog, { seen: 'aussiedlerhof-betreten' }] },
      dialogue: 'aussiedlerhof-nachspiel',
    },
  ],
};

// --- Dialoge -------------------------------------------------------------------------------------------------------
const dialogues: NonNullable<ContentPart['dialogues']> = {
  'aussiedlerhof-ankunft': {
    id: 'aussiedlerhof-ankunft',
    start: 'a',
    nodes: [{
      id: 'a',
      lines: [
        { speaker: N, text: 'Die Piste endet an einer Autotür, die so tut, als wäre sie ein Tor. Dahinter: Lehm, Wellblech, Solarsegel wie gestrandete Drachen, und Beete. Grüne Beete. Mitten in der Wüste wächst Kohl, und er sieht dabei auch noch zufrieden aus.' },
        { speaker: N, text: 'Ein Brunnen quietscht, ein Ziegenroboter meckert in Morsezeichen, ein silberner Wohnwagen blinzelt dich mit Muschelfenstern an. Nach der Stadt ist es hier so still, dass du dein eigenes Blut rauschen hörst. Das ist der Aussiedlerhof. Wer hier lebt, hat sich gegen die Stadt entschieden. Und gegen fließend Wasser.' },
      ],
    }],
  },
  'aussiedlerhof-nachspiel': {
    id: 'aussiedlerhof-nachspiel',
    start: 'a',
    nodes: [{
      id: 'a',
      lines: [
        { speaker: N, text: 'Der Hof ist voller als früher. Neue Zelte am Zaun, Kinder aus der Unterstadt, die zum ersten Mal Erde zwischen den Fingern haben und nicht wissen, ob sie das eklig finden sollen. In der Gartenecke blüht etwas, das gestern noch Staub war.' },
        { speaker: N, text: 'Keiner sagt hier „Master“. Keiner trägt einen Chip. Und wenn der Wind richtig steht, riecht es nach Salz. Die Wagenpiste zum Meer ist offen. Endlich.' },
      ],
    }],
  },
  'aussiedlerhof-ziegenroboter': {
    id: 'aussiedlerhof-ziegenroboter',
    start: 'a',
    nodes: [
      {
        id: 'a',
        lines: [
          { speaker: N, text: 'Ein Ziegenroboter, kniehoch, aus Ölfass, Rasenmähermotor und zwei Lötkolben als Hörnern. Er kaut auf einem Wegweiser herum und meckert dich an: kurz, kurz, lang. Kurz, kurz, lang.' },
        ],
        choices: [
          { text: 'Hinter den Ohren kraulen.', next: 'kraulen' },
          { text: 'Das Meckern mitlesen. Das ist Morse.', check: morseLesen, next: 'morse', once: true, id: 'ziege-morse' },
          { text: 'Ein Ersatzteil verfüttern.', when: { item: 'schrott-ersatzteil' }, next: 'fuettern', effects: [{ take: 'schrott-ersatzteil' }] },
          { text: 'Den Wegweiser aus dem Maul zerren.', check: ziegeZerren, next: 'wegweiser', once: true, id: 'ziege-wegweiser' },
          { text: 'Rückwärts weggehen. Langsam.' },
        ],
      },
      {
        id: 'kraulen',
        lines: [
          { speaker: N, text: 'Du kraulst zwischen den Lötkolben. Der Motor schnurrt, ein Schwall Diesel tropft auf deinen Schuh. Die Ziege lehnt sich an dein Bein, als hätte sie nie etwas anderes gewollt. Dann beißt sie in deinen Schnürsenkel.' },
        ],
      },
      {
        id: 'morse',
        lines: [
          { speaker: N, text: 'Kurz, kurz, lang. Das ist ein U. Dann ein H, dann noch ein U. Dann eine lange Pause, und dann, sehr deutlich: S-C-H-E-I-S-S-H-I-T-Z-E.' },
          { speaker: N, text: 'Elsa hat ihr also das Fluchen beigebracht. Oder Marla. Oder die Ziege hat einfach lange genug zugehört. Du nickst ihr zu. Sie hat recht.' },
        ],
        effects: [{ xp: 15 }, { markSeen: 'ziegenroboter-morse' }],
      },
      {
        id: 'fuettern',
        lines: [
          { speaker: N, text: 'Die Ziege schnappt sich das Ersatzteil, mahlt es mit einem Geräusch wie ein Häcksler im Steinbruch und rülpst eine Schraube aus. Sie gibt sie dir zurück. Sauber abgeleckt. Ein Freundschaftsangebot, schätzt du.' },
        ],
        effects: [{ rep: 'aussiedler', delta: 1 }, { give: 'schrott-ersatzteil' }],
      },
      {
        id: 'wegweiser',
        lines: [
          { speaker: N, text: 'Du ziehst, die Ziege zieht, der Wegweiser knarzt. Mit einem Ruck hast du ihn, die Ziege kugelt sich in den Sand und meckert empört: lang, lang, kurz, lang. Das hieß bestimmt nichts Nettes.' },
          { speaker: N, text: 'Auf dem Wegweiser steht in verwitterter Farbe nur ein Pfeil und eine gemalte Welle. Westen. Das Meer. Irgendwer hat den Weg schon mal gekannt.' },
        ],
        effects: [{ xp: 10 }, { setFlag: 'wegweiser_meer_gesehen' }, { rep: 'aussiedler', delta: 1 }],
      },
    ],
  },
  'aussiedlerhof-solarsegel': {
    id: 'aussiedlerhof-solarsegel',
    start: 'a',
    nodes: [
      {
        id: 'a',
        lines: [
          { speaker: N, text: 'Dreieckige Segel aus Solarfolie auf Stangen, mit Seilen abgespannt wie bei einem Schiff, das nie ablegt. Ein Kasten summt, an dem ein Zettel mit einer gezeichneten Sonne und einem traurigen Smiley klebt. Die Segel hängen schief, und auf der Folie liegt Sand.' },
        ],
        choices: [
          { text: 'Die Segel nach der Sonne ausrichten.', check: segelAusrichten, next: 'ausgerichtet', when: { notFlag: 'heute_solarsegel' } },
          { text: 'Mit dem Besen den Sand von der Folie fegen.', next: 'gefegt', when: { notFlag: 'heute_solarsegel' } },
          { text: 'Nur den Schatten genießen.', next: 'schatten' },
        ],
      },
      {
        id: 'ausgerichtet',
        lines: [
          { speaker: N, text: 'Du lockerst drei Spanner, drehst zwei Stangen, ziehst ein Seil nach. Der Kasten piept, das traurige Smiley auf dem Zettel guckt plötzlich irgendwie weniger traurig. Heute Abend gibt’s Licht am Lagerfeuer. Und kaltes Bier, falls jemand Bier hat.' },
        ],
        effects: [{ setFlag: 'heute_solarsegel' }, { rep: 'aussiedler', delta: 2 }, { xp: 10 }, { advanceTime: 15 }],
      },
      {
        id: 'gefegt',
        lines: [
          { speaker: N, text: 'Eine halbe Stunde fegen, den Sand im Mund, in den Ohren, in Körperöffnungen, die du nicht erwähnen willst. Die Folie glänzt wieder. Ein Aussiedler hebt den Daumen. Ein zweiter wirft dir eine Kaktusfrucht zu.' },
        ],
        effects: [{ setFlag: 'heute_solarsegel' }, { rep: 'aussiedler', delta: 1 }, { give: 'kaktusfrucht' }, { advanceTime: 30 }],
      },
      {
        id: 'schatten',
        lines: [{ speaker: N, text: 'Unter den Segeln ist es fünf Grad kühler. Fünf Grad sind hier draußen ein Luxusurlaub.' }],
        effects: [{ advanceTime: 10 }],
      },
    ],
  },
  'aussiedlerhof-lagerfeuer': {
    id: 'aussiedlerhof-lagerfeuer',
    start: 'a',
    nodes: [
      {
        id: 'a',
        lines: [
          { speaker: N, text: 'Funken steigen in einen Himmel, der hier draußen tatsächlich Sterne hat. Viele. Zu viele, eigentlich, als würde jemand angeben. Auf den Stämmen sitzen Aussiedler mit Blechbechern, einer stimmt eine Gitarre, die nur noch fünf Saiten hat.' },
        ],
        choices: [
          { text: 'Mitsingen.', next: 'singen', when: { notFlag: 'heute_lagerfeuer_hof' } },
          { text: 'Einfach zuhören und ins Feuer starren.', next: 'zuhoeren', when: { notFlag: 'heute_lagerfeuer_hof' } },
          { text: '[Ödnis] Das alte Karawanenlied anstimmen.', tag: '[Ödnis]', when: { all: [{ origin: 'origin-oednis' }, { notFlag: 'heute_lagerfeuer_hof' }] }, next: 'karawanenlied' },
          { text: 'Noch ein bisschen sitzen bleiben.', next: 'sitzen', when: { flag: 'heute_lagerfeuer_hof' } },
          { text: 'Aufstehen.' },
        ],
      },
      {
        id: 'singen',
        lines: [
          { speaker: N, text: 'Du kennst den Text nicht. Keiner kennt den Text. Das Lied handelt von einem Brunnen, einer Frau und einem Kamel, wobei unklar bleibt, wer wen verlassen hat. Beim Refrain grölt der ganze Hof, und du grölst mit.' },
          { speaker: N, text: 'Jemand drückt dir einen Becher in die Hand. Es ist Kaktusschnaps. Er brennt wie Kabelbrand und wärmt bis in die Zehen.' },
        ],
        effects: [{ setFlag: 'heute_lagerfeuer_hof' }, { rep: 'aussiedler', delta: 2 }, { heal: 30 }, { advanceTime: 45 }],
      },
      {
        id: 'zuhoeren',
        lines: [
          { speaker: N, text: 'Das Feuer knackt, die Gitarre verstimmt sich langsam, und irgendwann merkst du, dass du seit zehn Minuten an nichts gedacht hast. Kein Bruch, kein Chip, kein Quantum. Nur Funken und ein Typ, der behauptet, er hätte mal einen echten Fisch gegessen.' },
        ],
        effects: [{ setFlag: 'heute_lagerfeuer_hof' }, { heal: 'full' }, { advanceTime: 45 }],
      },
      {
        id: 'karawanenlied',
        lines: [
          { speaker: N, text: 'Du summst die ersten Takte, und das Feuer wird still. Dann fällt eine alte Frau ein, dann die Gitarre, dann alle. Das Lied ist älter als die Stadt. Wer es kennt, gehört hierher, egal wie lange er weg war.' },
          { speaker: N, text: 'Hinterher klopft dir jemand auf die Schulter. „Willkommen zurück“, sagt er, und es klingt nicht wie eine Floskel.' },
        ],
        effects: [{ setFlag: 'heute_lagerfeuer_hof' }, { rep: 'aussiedler', delta: 4 }, { heal: 'full' }, { advanceTime: 45 }],
      },
      {
        id: 'sitzen',
        lines: [{ speaker: N, text: 'Die Glut wird rot, die Gespräche leiser. Irgendwer schnarcht schon auf seinem Stamm. Du bleibst noch, bis die Sterne sich gedreht haben.' }],
        effects: [{ advanceTime: 30 }],
      },
    ],
  },
};

export const part: ContentPart = {
  maps: { [aussiedlerhof.id]: aussiedlerhof },
  dialogues,
};
