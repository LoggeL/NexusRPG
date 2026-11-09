// Zone Schrottmarkt (world.md §3.5, Plan design/plan/act1.json maps.schrottmarkt, Paket pkg-schrottmarkt).
// Großer Platz aus Wellblechständen: Garküche links, Stadt-TV in der Mitte, Halde mit Kran, Wohnwagen und Dexters Büro
// hinten, Rippers Praxis (grünes Kreuz) rechts, Rohrbogen nach Süden, Kanalgitter vorne links.
// Geometrie am fertigen Bild (game/public/assets/bg/schrottmarkt.webp) nachgezogen; Prüfung: node scripts/map_tool.mjs schrottmarkt.
//
// Quest-Hotspots mit eigener Logik (oma-volts-lager, gerds-kasse, gerds-drucker, waage, oelfass) legen die Quest- und
// Figuren-Agenten über mapAdditions an; hier stehen dafür nur die Spots und neutrale Blicke mit anderen IDs.
import type { Condition, DialogueLine, EncounterDef, HotspotDef, MapDef, Point } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const n = (text: string): DialogueLine => ({ speaker: 'narrator', text });
const ich = (text: string): DialogueLine => ({ speaker: 'player', text });

// ---------------------------------------------------------------------------------------------------- Bedingungen

/** Babettes Garküche: morgens bis abends, montags Ruhetag (wie Shop garkueche-babette). */
const BABETTE_OFFEN: Condition = { all: [{ time: ['morgen', 'tag', 'abend'] }, { not: { weekday: 'mo' } }] };
const TAG_ABEND: Condition = { time: ['tag', 'abend'] };
const NACHTS: Condition = { time: 'nacht' };
const FLOHMARKT: Condition = { all: [{ weekday: 'so' }, { time: ['morgen', 'tag'] }] };
const MARLA_DA: Condition = { all: [{ weekday: 'sa' }, { time: ['morgen', 'tag'] }] };
/** Rippers Praxis: tagsüber offen (Ripper da), Quests können per Flag aufschließen. */
const PRAXIS_OFFEN: Condition = { any: [{ time: 'tag' }, { flag: 'ripper_praxis_offen' }] };
const DEXTER_ERLEDIGT: Condition = { quest: 'main-1-dexter', state: 'done' };

// ---------------------------------------------------------------------------------------------------- Sammelobjekte

function loot(id: string, at: Point, label: string, text: string, extra: Partial<HotspotDef> = {}): HotspotDef {
  return {
    id, at, label, kind: 'loot', once: true, radius: 46,
    lines: [n(text)],
    effects: [{ give: id }, { setFlag: `gefunden_${id}` }],
    ...extra,
  };
}

// ---------------------------------------------------------------------------------------------------- Begegnung

/** Nachtstreife der Rostzähne (world.md §3.5 „N … Rostzähne-Streife“); die Zufallstabelle §8.7 kennt sie nicht. */
const STREIFE: EncounterDef = {
  id: 'enc-schrott-rostzahn-streife',
  name: 'Rostzähne-Streife',
  arena: 'arena-hinterhof',
  enemies: [{ enemy: 'rostzahn-schlaeger', count: 2 }],
  intro: [
    n('Zwei Rostzähne schlendern über den leeren Markt und treten gegen jede Plane, die nicht schnell genug zurückweicht.'),
    n('„Marktaufsicht, Herzchen. Nachtzuschlag. Zahlbar in Credits, Zähnen oder Würde. Such dir was aus.“'),
  ],
  reward: { xp: 25, credits: 15 },
};

// ---------------------------------------------------------------------------------------------------- Karte

const schrottmarkt: MapDef = {
  id: 'schrottmarkt',
  name: 'Schrottmarkt',
  subtitle: 'Unterstadt',
  size: [1536, 1024],
  district: 'unterstadt',
  lighting: 'outdoor',
  bg: 'bg-schrottmarkt',
  walk: [
    [
      [0, 592], [66, 592], [66, 272], [150, 272], [150, 248], [345, 248], [345, 112], [1100, 112], [1100, 262],
      [1250, 262], [1250, 500], [1452, 500], [1452, 560], [1536, 560], [1536, 600], [1508, 600], [1508, 785],
      [1345, 785], [1345, 990], [904, 990], [904, 1024], [656, 1024], [656, 990], [300, 990], [300, 962], [0, 962],
    ],
  ],
  block: [
    // Kran (Fuß, Leiter, Kisten, Reifen)
    [[395, 112], [560, 112], [560, 170], [625, 200], [625, 246], [395, 246]],
    // Kisten und Ölfass vor Dexters Büro
    [[1015, 180], [1100, 180], [1136, 205], [1136, 272], [1085, 276], [1015, 252]],
    // Babettes Garküche mit Hockern und Bank
    [[66, 282], [330, 282], [330, 470], [312, 505], [222, 505], [218, 555], [132, 555], [132, 575], [66, 575]],
    // Stand mit dem großen Fernseher
    [[595, 365], [690, 330], [910, 330], [955, 410], [925, 500], [868, 528], [712, 528], [600, 490]],
    // Gustavs Schrottkram (Standreihe links)
    [[330, 560], [380, 525], [640, 525], [672, 570], [672, 712], [330, 712]],
    // Elektronikstand (Standreihe rechts)
    [[850, 560], [905, 528], [1192, 528], [1198, 706], [855, 706]],
    // Gutschein-Gerds Stand
    [[1262, 520], [1452, 520], [1452, 688], [1268, 688]],
    // Imbiss „Lötkolben“ mit Rohr, Kisten und Hockern
    [[0, 700], [80, 700], [80, 738], [308, 738], [308, 905], [290, 952], [0, 962]],
    // Wett-Willis Klapptisch
    [[352, 842], [444, 842], [444, 912], [352, 912]],
    // Pfosten des Rohrbogens
    [[598, 792], [656, 792], [656, 962], [598, 962]],
    [[904, 792], [962, 792], [962, 962], [904, 962]],
    // Vinyl-Vincents Plattenstand
    [[1095, 800], [1125, 772], [1345, 772], [1345, 962], [1095, 962]],
  ],
  exits: [
    { id: 'nach-neon-gasse', rect: [0, 596, 26, 96], to: 'neon-gasse', entry: 'von-schrottmarkt', label: 'Zur Neon-Gasse' },
    { id: 'nach-rohrsiedlung', rect: [660, 996, 240, 28], to: 'rohrsiedlung', entry: 'von-schrottmarkt', label: 'Zur Rohrsiedlung' },
    { id: 'nach-hafenkante', rect: [1460, 560, 76, 26], to: 'hafenkante', entry: 'von-schrottmarkt', label: 'Zur Hafenkante' },
    {
      id: 'nach-ripper-praxis', rect: [1352, 462, 70, 46], to: 'ripper-praxis', entry: 'von-schrottmarkt', label: 'Rippers Praxis',
      interact: true, when: PRAXIS_OFFEN, minutes: 2,
      lockedText: 'Ein Schild am grünen Kreuz: „Komme gleich. Oder nicht. – R.“',
    },
    {
      id: 'kanalgitter', rect: [488, 858, 72, 50], to: 'kanal-sammler', entry: 'gitter-schrottmarkt', label: 'Kanalgitter',
      interact: true, when: { quest: 'side-rattenkoenig', state: 'done' }, minutes: 15,
      lockedText: 'Ein Gitter mit Kronkorken-Siegel. Bürgermeister Gully lässt nur Freunde der Rohre durch.',
    },
  ],
  entries: {
    'von-neon-gasse': { at: [64, 644], facing: 'e' },
    'von-rohrsiedlung': { at: [780, 952], facing: 'n' },
    'von-hafenkante': { at: [1478, 640], facing: 'w' },
    'von-ripper-praxis': { at: [1386, 518], facing: 's' },
    kanalgitter: { at: [524, 934], facing: 'n' },
    taxi: { at: [862, 214], facing: 's' },
  },
  spots: {
    // Garküche
    garkueche: { at: [350, 455], facing: 'w' },
    'garkueche-hocker': { at: [266, 526], facing: 'n' },
    'garkueche-bank': { at: [178, 582], facing: 'n' },
    // Halde, Kran, Wohnwagen, Dexter
    kran: { at: [430, 274], facing: 'n' },
    'kran-kabine': { at: [488, 262], facing: 'n' },
    'schrottkram-stand': { at: [500, 732], facing: 'n' },
    wohnwagen: { at: [240, 262], facing: 's' },
    halde: { at: [760, 160], facing: 'n' },
    'dexter-buero': { at: [1172, 284], facing: 's' },
    'dexter-versteck': { at: [946, 338], facing: 'w' },
    oelfass: { at: [1114, 294], facing: 'n' },
    'inkasso-gasse': { at: [1232, 300], facing: 'w' },
    'toaster-ecke': { at: [1000, 150], facing: 's' },
    // Markt
    'stadt-tv': { at: [776, 552], facing: 'n' },
    filmposten: { at: [596, 300], facing: 'e' },
    botenstand: { at: [530, 470], facing: 's' },
    'mila-ecke': { at: [436, 476], facing: 's' },
    elektronikstand: { at: [1022, 724], facing: 'n' },
    'raven-ecke': { at: [1228, 468], facing: 'w' },
    'marktplatz-mitte': { at: [766, 640], facing: 's' },
    marktstaende: { at: [700, 600], facing: 'w' },
    'plattenkiste-dante': { at: [1060, 852], facing: 'e' },
    'plattenstand-vincent': { at: [1180, 976], facing: 'n' },
    huetchenspiel: { at: [398, 828], facing: 's' },
    'imbiss-loetkolben': { at: [330, 896], facing: 'w' },
    'lio-ecke': { at: [1000, 880], facing: 'w' },
    'oma-volts-lager': { at: [1440, 768], facing: 's' },
    'gerds-stand': { at: [1356, 706], facing: 'n' },
    'gerds-hinterhof': { at: [1480, 650], facing: 'w' },
    'kabelbrand-merch': { at: [560, 772], facing: 's' },
    'watt-pose': { at: [212, 650], facing: 's' },
    'klingel-stand': { at: [1222, 746], facing: 's' },
    karawanenstand: { at: [982, 218], facing: 's' },
    flohmarkt: { at: [642, 212], facing: 's' },
    'taxi-landeplatz': { at: [862, 190], facing: 's' },
    'sybella-verkleidet': { at: [1052, 470], facing: 's' },
    'zoltan-revier': { at: [312, 640], facing: 'e' },
    'rostzaehne-streife': { at: [780, 880], facing: 'n' },
    waage: { at: [936, 744], facing: 's' },
    'auftrag-a': { at: [150, 690], facing: 'e' },
  },
  hotspots: [
    // ------------------------------------------------------------ Garküche
    {
      id: 'bao-babette', at: [276, 478], radius: 62, label: 'Bao Babette – Dampfnudeln', kind: 'shop', shop: 'garkueche-babette',
      when: BABETTE_OFFEN,
    },
    {
      id: 'babettes-dampfkoerbe', at: [196, 522], radius: 60, label: 'Bei Babette mitkochen', kind: 'use', when: BABETTE_OFFEN,
      lines: [n('Babette drückt dir ohne zu fragen einen Kochlöffel in die Hand. „Du stehst eh im Weg. Dann steh wenigstens produktiv im Weg.“')],
      effects: [{
        minigame: 'akt-kochen', level: 2, key: 'kochen-babette', label: 'Dampfnudeln mit Babette',
        win: [
          { give: 'bao-dampfnudel', qty: 3 }, { relation: 'babette-bao', delta: 10 }, { xp: 10 },
          { message: 'Babette kostet, nickt einmal und schiebt dir drei Nudeln rüber. Höchstes Lob. Andere kriegen nur ein Grunzen.' },
        ],
        lose: [
          { give: 'bao-dampfnudel' },
          { message: '„Das ist keine Dampfnudel, das ist ein Hilferuf.“ Babette isst sie trotzdem. Eine bleibt für dich.' },
        ],
      }],
    },
    {
      id: 'garkueche-zu', at: [276, 478], radius: 62, label: 'Garküche', kind: 'look', when: { not: BABETTE_OFFEN },
      lines: [n('Die Plane ist runtergelassen, die Töpfe sind kalt. An einem Bambuskorb klebt ein Zettel: ein durchgestrichener Topf, daneben ein Fisch. Babette ist entweder am Fischmarkt oder im Bett. Beides heilig.')],
    },
    // ------------------------------------------------------------ Kran, Wohnwagen, Halde
    {
      id: 'kranhebel', at: [452, 252], radius: 56, label: 'Kranhebel lösen', kind: 'check', check: 'gc-148', once: true,
      lines: [n('Am Fuß des Krans ragt ein Hebel aus einem Kasten voller Rost. Ein Schild zeigt eine Hand, einen Blitz und einen Totenkopf. Gustavs Gebrauchsanweisung.')],
      altText: 'Der Hebel ist festgerostet wie Gustavs Ansichten über Musik. Mehr Körper – oder ein Ölkännchen aus Gustavs Schrottkram (15 Cr).',
      effects: [
        { relation: 'opa-gustav', delta: 20 }, { xp: 20 }, { setFlag: 'aussicht_schrottmarkt' }, { markSeen: 'aussicht-schrottmarkt' },
        { advanceTime: 15 }, { dialogue: 'schrottmarkt-kranfahrt' },
      ],
    },
    {
      id: 'aussicht-kran', at: [452, 252], radius: 56, label: 'Aussicht vom Kran', kind: 'look', when: { seen: 'kranhebel' },
      lines: [
        n('Du kletterst die Leiter zur Kabine hoch. Unten der Markt: Planen, Laternen, das blaue Flackern des großen Fernsehers. Rechts leuchtet Rippers Kreuz grün wie ein Versprechen, das keiner halten will.'),
        n('Hinter den Containern glitzert die Hafenkante, im Süden dampfen die Rohre der Siedlung. Und ganz oben, über allem, der Quantum-Tower. Der guckt nie runter. Muss er auch nicht.'),
      ],
    },
    {
      id: 'gustavs-radio', at: [300, 214], radius: 52, label: 'Gustavs Radio', kind: 'look',
      lines: [
        n('Ein Kofferradio auf einer Kiste, Antenne mit Alufolie verlängert. Es spielt einen Schlager von 2031, in dem sich „Herz“ auf „Schmerz“ reimt und „Liebe“ auf „Getriebe“.'),
        n('Daneben ein Klappstuhl mit Kuhle. Die Kuhle hat die exakte Form von Opa Gustavs Hintern. Zwanzig Jahre Arbeit.'),
      ],
    },
    {
      id: 'gustavs-werkbank', at: [176, 250], radius: 56, label: 'An Gustavs Werkbank basteln', kind: 'use',
      when: { seen: 'he-opa-gustav-6' },
      lines: [n('Gustav hat dir unter der Markise eine Werkbank freigeräumt. „Werkzeug zurück an den Haken. Sonst Hausverbot. Auch für die Seele.“')],
      effects: [
        { take: 'schrott-ersatzteil', qty: 2 },
        {
          minigame: 'akt-werkbank', level: 2, key: 'werkbank-gustav', label: 'Basteln an Gustavs Werkbank',
          win: [{ give: 'reparaturset' }, { xp: 10 }, { message: 'Aus zwei Schrottteilen wird ein Reparaturset. Gustav: „Na also. Früher war hier alles grün. Und du warst ungeschickt.“' }],
          lose: [{ message: 'Es zischt, es knallt, es riecht nach Haaren. Gustav reicht dir wortlos den Feuerlöscher.' }],
        },
      ],
    },
    {
      id: 'halde-schrottberg', at: [760, 116], radius: 60, label: 'Schrottberg ansehen', kind: 'look',
      lines: [
        n('Ein Berg aus Autowracks, Waschmaschinen, Röhrenfernsehern und Drohnenleichen. Irgendwo darin piept ein Wecker, seit Jahren. Niemand findet ihn. Niemand will ihn finden.'),
        n('Auf einem Kühlschrank hat jemand mit Sprühfarbe ein Gesicht gemalt. Es sieht enttäuscht aus. Es hat Gründe.'),
      ],
    },
    {
      id: 'halde-wrack', at: [600, 150], radius: 54, label: 'Wrack ausschlachten', kind: 'loot', once: true,
      lines: [n('Unter einem umgekippten Lieferwagen glänzt noch brauchbares Zeug. Du ziehst, zerrst, fluchst. Das Wrack gibt nach – du auch fast.')],
      effects: [{ give: 'schrott-ersatzteil', qty: 3 }],
    },
    {
      id: 'dexters-schrott', at: [1172, 262], radius: 56, label: 'Dexters Schrott', kind: 'shop', shop: 'dexters-schrott',
      when: DEXTER_ERLEDIGT,
    },
    {
      id: 'dexters-tuer', at: [1172, 262], radius: 56, label: 'Dexters Wellblechbüro', kind: 'look', hideWhen: DEXTER_ERLEDIGT,
      lines: [
        n('An der verbeulten Tür hängt ein Pappschild: „BIN NICHT DA. WIRKLICH NICHT. GEHT WEG. – D.“ Drinnen läuft ein Fernseher. Und jemand atmet sehr leise.'),
        ich('Dexter. Ich hör dich schwitzen.'),
        n('Das Atmen hört auf. Der Fernseher wird lauter.'),
      ],
    },
    // ------------------------------------------------------------ Markt
    { id: 'stadt-tv', at: [776, 520], radius: 64, label: 'Stadt-TV ansehen', kind: 'screen' },
    {
      id: 'gustavs-schrottkram', at: [500, 708], radius: 62, label: 'Gustavs Schrottkram', kind: 'shop', shop: 'gustavs-schrottkram',
      when: { time: ['morgen', 'tag'] },
    },
    {
      id: 'schrottkram-zu', at: [500, 708], radius: 62, label: 'Kabelkisten', kind: 'look', when: { time: ['abend', 'nacht'] },
      lines: [n('Über Gustavs Kisten liegt eine Plane mit einem Zettel: „Geschlossen. Diebe bitte Zettel hinterlassen, damit ich weiß, was fehlt.“')],
    },
    {
      id: 'elektronikstand', at: [1022, 702], radius: 62, label: 'Elektronikstand', kind: 'shop', shop: 'elektronikstand',
      when: { time: 'tag' },
    },
    {
      id: 'imbiss-loetkolben', at: [298, 878], radius: 64, label: 'Imbiss „Lötkolben“', kind: 'shop', shop: 'imbiss-loetkolben',
      when: { time: ['tag', 'abend', 'nacht'] },
    },
    {
      id: 'vinyl-vincent', at: [1220, 952], radius: 60, label: 'Vinyl-Vincents Plattenkiste', kind: 'shop', shop: 'vinyl-vincent',
      when: TAG_ABEND,
    },
    {
      id: 'grammophon', at: [1300, 950], radius: 46, label: 'Grammophon', kind: 'look',
      lines: [n('Ein Grammophon mit goldenem Trichter. Kein Preisschild, nur ein Zettel: „Unverkäuflich. Außer für sehr viel.“ Vincent hat ein Wort unterstrichen. Es ist „sehr“.')],
    },
    {
      id: 'huetchenspiel', at: [398, 912], radius: 62, label: 'Hütchenspiel (Einsatz 10 Cr)', kind: 'use', when: TAG_ABEND,
      lines: [n('Drei Becher, eine Kugel, ein Mann mit sehr flinken Fingern und sehr wenig Gewissen. „Zehn rein, dreißig raus! Das Auge ist schneller als die Hand – deins nicht, aber probier’s!“')],
      effects: [
        { credits: -10 },
        {
          minigame: 'akt-huetchenspiel', level: 2, key: 'huetchen-willi', label: 'Wett-Willis Hütchen',
          win: [{ credits: 30 }, { message: 'Wett-Willi zahlt mit einem Lächeln, das nicht bis zu den Augen kommt. „Glückspilz. Pilze wachsen im Dunkeln, weißt du?“' }],
          lose: [{ message: 'Die Kugel war unter keinem Becher. Natürlich nicht. Willi zuckt mit den Schultern: „Physik, Kumpel.“' }],
        },
      ],
    },
    {
      id: 'huetchen-durchschauen', at: [440, 912], radius: 50, label: 'Willis Trick durchschauen', kind: 'check', check: 'gc-151',
      when: TAG_ABEND, once: true,
      lines: [n('Du schaust nicht auf die Becher. Du schaust auf Willis linken Ärmel.')],
      altText: 'Willis Hände sind schneller als dein Blick. Spiel einfach mit – das Hütchenspiel geht immer.',
      effects: [
        { credits: 50 }, { relation: 'wett-willi', delta: 20 },
        { message: 'Du ziehst ihm die Kugel aus dem Ärmel. Willi starrt dich an, dann lacht er und zählt fünfzig Credits ab. „Feierabend für heute. Und du: Komm wieder. Ich mag Leute, die mich beklauen, bevor ich sie beklaue.“' },
      ],
    },
    {
      id: 'flohmarkt-stand', at: [642, 236], radius: 70, label: 'Sonntags-Flohmarkt', kind: 'shop', shop: 'flohmarkt', when: FLOHMARKT,
    },
    {
      id: 'flohmarkt-eigener-stand', at: [540, 214], radius: 56, label: 'Eigenen Flohmarktstand aufbauen', kind: 'use', when: FLOHMARKT,
      lines: [n('Ein freier Platz auf der Halde, eine Decke, dein Kram. Die Kundschaft: Rentner mit Lupen, Kinder mit Kronkorken und ein Typ, der alles anfasst und nichts kauft.')],
      effects: [{
        minigame: 'akt-flohmarkt', level: 2, key: 'flohmarkt-eigener-stand', label: 'Flohmarktstand',
        win: [{ credits: 80 }, { xp: 15 }, { rep: 'unterstadt', delta: 1 }, { message: 'Ausverkauft. Sogar der kaputte Toaster ging weg. An Dexter. Natürlich an Dexter.' }],
        lose: [{ credits: 20 }, { message: 'Zwanzig Credits und ein Knopf. Der Knopf war kein Geld. Der Typ, der alles anfasst, ist schon wieder da.' }],
      }],
    },
    {
      id: 'karawanenstand', at: [982, 240], radius: 64, label: 'Marlas Karawanenstand', kind: 'shop', shop: 'marla-karawane', when: MARLA_DA,
    },
    {
      id: 'gerds-auslage', at: [1356, 662], radius: 56, label: 'Gerds Gutscheine', kind: 'look',
      hideWhen: { quest: 'side-chrome-10', state: 'done' },
      lines: [
        n('Stapel bunter Gutscheine: „CHROME 10 – 10 % auf alles! (Außer auf alles.)“ Das Hologramm ist mit Kugelschreiber gemalt. Die Seriennummern sind alle 0000001.'),
        n('Im Drucker hinter dem Stand klemmt noch einer. Die Tinte ist feucht. Wertanlage, frisch aus dem Ofen.'),
      ],
    },
    {
      id: 'lager-rolltor', at: [1470, 806], radius: 54, label: 'Rolltor mit Katzenschloss', kind: 'look',
      hideWhen: { quest: 'side-oma-volts-lager', state: ['active', 'done'] },
      lines: [n('Ein Rolltor, gesichert mit einem Vorhängeschloss in Katzenform. Darauf, in Oma Volts Schönschrift: „Finger weg. Ich weiß, wo du wohnst. Ich weiß, wo ALLE wohnen.“')],
    },
    {
      id: 'dampfgitter', at: [156, 684], radius: 46, label: 'Dampfendes Gitter', kind: 'look',
      lines: [n('Aus dem Gitter steigt warmer Dampf. Es riecht nach Kanal, Ingwer und etwas, das man besser nicht benennt. Drei Tauben sitzen drumherum wie Rentner in der Sauna.')],
    },
    {
      id: 'hafenblick', at: [1494, 520], radius: 50, label: 'Durchgang zur Hafenkante', kind: 'look',
      lines: [n('Zwischen den Containern öffnet sich der Blick auf die Hafenkräne. Salzwind kommt rein und verliert sofort gegen den Geruch von Babettes Brühe.')],
    },
    {
      id: 'kanalgitter-blick', at: [524, 886], radius: 40, label: 'Kanalgitter ansehen', kind: 'look',
      hideWhen: { quest: 'side-rattenkoenig', state: 'done' },
      lines: [n('Unter dem Gitter rauscht es. Ein Kronkorken ist ins Eisen geklemmt wie ein Siegel. Von unten blinzelt dich eine Ratte an, sehr würdevoll, mit einem Krönchen aus Alufolie.')],
    },
    // ------------------------------------------------------------ Sammelobjekte
    loot('glueckstern-02', [893, 300], 'Blechstern an der Laterne', 'An der Laternenstange mit den Lichterketten hängt ein ausgeschnittener Blechstern. Du drehst ihn ab. Die Lichterkette flackert beleidigt.'),
    loot('glueckstern-03', [952, 116], 'Blechstern im Schrottberg', 'Zwischen zwei Waschmaschinen steckt ein Blechstern. Wer ihn hier versteckt hat, wollte, dass ihn jemand findet, der sich die Finger aufreißt.'),
    loot('datenwuerfel-02', [612, 476], 'Kiste unter dem Fernseher', 'In einer Kiste unter dem großen Fernseher, zwischen Fernbedienungen ohne Batterien: ein glimmender Datenwürfel mit Digitech-Prägung.'),
    loot('jimmy-spur-01', [646, 314], 'Zerknitterter Werbezettel', 'An der Lichterkettenstange flattert ein Werbezettel: „Jimmys Turmbau – Ölfässer jeder Größe“. Die Telefonnummer ist abgerissen. Die Schrift ist rührend ordentlich.'),
  ],
  foreground: [
    // Rohrbogen über dem Südausgang: Wer darunter durchgeht, verschwindet halb hinter den Rohren.
    { rect: [598, 772, 366, 72], baseY: 960 },
  ],
  encounters: [
    {
      id: 'rostzaehne-streife', encounter: 'enc-schrott-rostzahn-streife', at: [780, 880], sprite: 'rostzahn-schlaeger-walk', when: NACHTS,
      patrol: [[780, 920], [780, 800], [700, 760], [860, 760], [780, 800]],
      avoid: { id: 'sm-streife-abwimmeln', attribute: 'strasse', threshold: 5, tags: ['einschuechtern', 'geruecht'], label: '[Straße 5]' },
    },
    {
      id: 'zerleger-nachts', encounter: 'enc-zufall-schrottmarkt-zerleger-nacht', at: [1100, 420], sprite: 'zerleger-walk', when: NACHTS,
      patrol: [[1100, 420], [1100, 300], [980, 300], [1000, 470]],
      avoid: { id: 'sm-zerleger-abwimmeln', attribute: 'strasse', threshold: 5, tags: ['einschuechtern'], label: '[Straße 5]' },
    },
    {
      id: 'drohnen-halde', encounter: 'enc-zufall-schrottmarkt-drohnen-nacht', at: [700, 170], sprite: 'spaeherdrohne-walk', when: NACHTS,
      patrol: [[700, 170], [900, 170], [900, 230], [700, 230]],
      avoid: { id: 'sm-drohnen-umleiten', attribute: 'technik', threshold: 5, tags: ['drohne', 'hacken'], label: '[Technik 5]' },
    },
    {
      id: 'taschendieb-abends', encounter: 'enc-zufall-schrottmarkt-flitzer-abend', at: [330, 780], sprite: 'abzieher-walk', when: { time: 'abend' },
      patrol: [[330, 780], [560, 800], [700, 760], [330, 760]],
      avoid: { id: 'sm-flitzer-durchschauen', attribute: 'reflexe', threshold: 4, tags: ['beobachten'], label: '[Reflexe 4]' },
    },
  ],
  lights: [
    { at: [270, 390], radius: 150, color: '#ffb347', intensity: 0.9, slots: ['abend', 'nacht'] },
    { at: [40, 450], radius: 120, color: '#ff3fa4', slots: ['abend', 'nacht'] },
    { at: [776, 410], radius: 190, color: '#3ef2ff', intensity: 0.9, slots: ['morgen', 'abend', 'nacht'] },
    { at: [1385, 330], radius: 150, color: '#39ff7a', intensity: 1, slots: ['abend', 'nacht'] },
    { at: [1386, 470], radius: 110, color: '#39ff7a', intensity: 0.7, slots: ['abend', 'nacht'] },
    { at: [1020, 620], radius: 130, color: '#3ef2ff', slots: ['abend', 'nacht'] },
    { at: [470, 620], radius: 130, color: '#ff3fa4', intensity: 0.8, slots: ['abend', 'nacht'] },
    { at: [120, 840], radius: 110, color: '#ff3fa4', slots: ['abend', 'nacht'] },
    { at: [236, 820], radius: 110, color: '#ffcc55', intensity: 0.8, slots: ['abend', 'nacht'] },
    { at: [1220, 840], radius: 120, color: '#ffb347', intensity: 0.8, slots: ['abend', 'nacht'] },
    { at: [1225, 160], radius: 100, color: '#ffb347', intensity: 0.8, slots: ['abend', 'nacht'] },
    { at: [1110, 225], radius: 90, color: '#ff7a2a', intensity: 0.9, slots: ['abend', 'nacht'] },
    { at: [230, 170], radius: 110, color: '#ffcc66', intensity: 0.7, slots: ['abend', 'nacht'] },
    { at: [470, 125], radius: 80, color: '#ffcc55', intensity: 0.6, slots: ['abend', 'nacht'] },
    { at: [780, 300], radius: 200, color: '#ffd27a', intensity: 0.5, slots: ['abend', 'nacht'] },
    { at: [776, 830], radius: 110, color: '#ffcc66', intensity: 0.8, slots: ['abend', 'nacht'] },
  ],
  ambient: {
    count: 10,
    bySlot: { morgen: 5, tag: 12, abend: 10, nacht: 4 },
    sprites: [
      'passant-schrotti-walk', 'passant-strassenhaendler-walk', 'passant-arbeiterin-walk', 'passant-oma-walk',
      'passant-punk-walk', 'passant-kurier-walk', 'passant-tourist-walk', 'passant-kanalvolk-walk',
    ],
    routes: [
      [[60, 644], [330, 760], [800, 760], [1230, 760], [1480, 700], [1480, 610]],
      [[380, 282], [700, 292], [1000, 300], [1200, 320], [1220, 480]],
      [[560, 350], [560, 520], [780, 556], [980, 520], [990, 320]],
      [[780, 1000], [780, 880], [700, 760], [720, 560]],
      [[400, 262], [606, 182], [900, 190], [1080, 290]],
      [[340, 960], [600, 970], [1000, 960], [1300, 978]],
      [[90, 640], [300, 600], [450, 480], [560, 330]],
      [[1234, 300], [1236, 500], [1220, 740], [960, 740], [850, 980]],
    ],
    barks: [
      { text: 'Wer hat schon wieder die Laterne geklaut? Die war festgeschraubt!' },
      { text: 'Mutter Brühe sagt, heute gibt’s Suppe. Gestern gab’s auch Suppe.' },
      { text: 'Die Rostzähne haben gestern meinen Schatten erpresst.' },
      { text: 'Spielt jemand Eins? Ich hab nur noch Plus-Vier-Karten.' },
      { text: 'Drei Platinen für zehn! Zwei davon funktionieren! Vermutlich!' },
      { text: 'Bei Vincent kostet ’ne Platte so viel wie ’ne Niere. Und die Niere ist gebraucht.' },
      { text: 'Babettes Dampfnudeln sind besser als Sex. Okay, ich hatte lange keinen. Aber trotzdem.' },
      { text: 'Gutscheine von Gerd? Steck sie dir sonst wohin, Kumpel. Gefaltet.' },
      { text: 'Der alte Watt steht schon wieder so da. Ich glaub, der ist festgerostet.' },
      { text: 'Mein Toaster ist weggelaufen. Wörtlich. Er hat „Ich bin ein Mensch“ gerufen.' },
      { text: '„Gustav, dein Kran quietscht!“ – „Das ist kein Quietschen, du Banause, das ist Jazz!“' },
      { text: 'Hat wer Dexter gesehen? Der Sack schuldet mir ’nen Fuffi und ’ne Entschuldigung.', when: { not: DEXTER_ERLEDIGT } },
      { text: 'Dexter hat bezahlt. Freiwillig. Ich glaub, morgen regnet’s Credits.', when: DEXTER_ERLEDIGT },
      { text: 'Ripper gibt zehn Credits für ein Kinderauge. Zehn! Das ist kein Preis, das ist ’ne Beleidigung.', when: { not: { quest: 'pers-freya-fairer-lohn', state: 'done' } } },
      { text: 'Ripper zahlt jetzt fair. Fair! Ripper! Ich brauch ’nen Schnaps.', when: { quest: 'pers-freya-fairer-lohn', state: 'done' } },
      { text: 'Kaffee. Kaffee. Wo gibt’s hier verdammt noch mal Kaffee?', when: { time: 'morgen' } },
      { text: 'Babette hat Ruhetag. Ich esse heute Kabel. Wie ein Tier.', when: { weekday: 'mo' } },
      { text: 'Flohmarkt! Heute ist alles antik. Seit gestern.', when: FLOHMARKT },
      { text: 'Die Karawane ist da! Echtes Wasser! Fast echt!', when: MARLA_DA },
      { text: 'Psst. Implantat gefällig? Fast nicht geklaut.', when: NACHTS },
      { text: 'Geh nicht auf die Halde, wenn’s dunkel ist. Dexters Drohnen grüßen nachts mit Bohrern.', when: NACHTS },
      { text: 'Mein Nachbar sagt jetzt immer „Ja, Master“. Früher hat er nur gegrunzt.', when: { act: 2 } },
      { text: 'Chrome 10 hier, Chrome 10 da. Ich will einfach nur meine Nougatbombe.', when: { act: 2 } },
      { text: 'Hunters Leute waren hier. Jetzt ist alles ruhiger. Und lauter.', when: { act: 2 } },
      { text: 'Die Bildschirme sind aus! Ich sehe zum ersten Mal den Himmel. Der ist ja grau.', when: { act: 3 } },
      { text: 'Fährt hier echt ein Bus ans Meer?', when: { act: 3 } },
    ],
  },
  ambience: 'unterstadt',
  onEnter: [
    { id: 'schrottmarkt-erstbesuch', once: true, dialogue: 'schrottmarkt-ankunft', effects: [{ markSeen: 'schrottmarkt-betreten' }] },
    {
      id: 'schrottmarkt-erster-flohmarkt', once: true, when: FLOHMARKT,
      effects: [{ message: 'Sonntag am Schrottmarkt: Auf der Halde stehen Decken voller Kram. Flohmarkt bis 17 Uhr – und wer will, baut selbst einen Stand auf.' }],
    },
  ],
};

export const part: ContentPart = {
  maps: { [schrottmarkt.id]: schrottmarkt },
  encounters: { [STREIFE.id]: STREIFE },
  dialogues: {
    'schrottmarkt-ankunft': {
      id: 'schrottmarkt-ankunft',
      start: 'a',
      nodes: [
        {
          id: 'a',
          lines: [
            n('Der Schrottmarkt. Wellblech, Planen, Laternen in allen Farben, die ein Stromdieb je geklaut hat. Es riecht nach Lötzinn, Dampfnudeln und nassem Hund – wobei der Hund aus Metall ist.'),
            n('Links dampft Babettes Garküche, in der Mitte flimmert ein Fernseher so groß wie ein Kleinwagen, hinten türmt sich die Halde mit Gustavs Kran. Rechts leuchtet ein grünes Kreuz. Da schraubt Ripper. An Menschen.'),
          ],
          choices: [
            { text: '„Hier kriegt man alles. Außer Garantie.“' },
            { text: '„Wer hier was verkauft, hat’s irgendwem abgeschraubt.“' },
            { text: '(Die Hand auf die Brieftasche legen.)' },
          ],
        },
      ],
    },
    'schrottmarkt-kranfahrt': {
      id: 'schrottmarkt-kranfahrt',
      start: 'a',
      nodes: [
        {
          id: 'a',
          lines: [
            n('Der Hebel bricht mit einem Knall aus dem Rost. Irgendwo ächzt ein Getriebe, das seit Jahren auf genau diesen Moment gewartet hat. Der Ausleger schwenkt – und die Kabine mit dir darin hebt ab.'),
            { speaker: 'opa-gustav', text: 'He! HE! Wer fährt da mit meiner Elsa?! … Ach, du bist das. Na, dann halt dich fest. Und nicht an den roten Knopf. Der rote Knopf ist für Notfälle und für Silvester.' },
            n('Von oben ist der Markt ein Flickenteppich aus Planen und Licht. Die Neon-Gasse glüht pink im Westen, im Osten stehen die Hafenkräne wie Giraffen ohne Zuhause, im Süden atmen die Rohre der Siedlung Dampf.'),
            n('Und über allem, viel zu sauber, der Quantum-Tower. Gustav brummt unten: „Früher war hier alles grün.“ Du glaubst ihm fast.'),
          ],
          choices: [
            { text: '„Gustav, die Aussicht ist der Hammer.“', effects: [{ relation: 'opa-gustav', delta: 5 }] },
            { text: '(Den roten Knopf drücken.)', next: 'knopf' },
          ],
        },
        {
          id: 'knopf',
          lines: [
            n('Eine Hupe. Sehr laut. Sehr lang. Der ganze Markt dreht sich um. Babette wirft einen Bambuskorb nach dem Kran.'),
            { speaker: 'opa-gustav', text: 'Siehste. Silvester. Jetzt komm runter, bevor Babette dich mit Dampfnudeln abschießt.' },
          ],
        },
      ],
    },
  },
};
