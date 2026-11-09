// Glasdünen (world.md §3.5, §3.8/§3.9, §8.7, §10.4/§10.7; Plan design/plan/act23.json, Paket pkg-oednis-hof).
// Zone 1536×1024: Dünen aus geschmolzenem Glas. Oben am Horizont ein dunkelblauer Streifen: das Meer.
// Links oben die Aussichtsdüne (eigene Laufinsel) hinter der Glasschlucht; die eingestürzte Brücke wird über die
// Seilwinde (gc-94 [Technik 6], Reparaturset) gespannt oder man hangelt (gc-103 [Körper 7], Greifhaken) hinüber.
// Rechts oben die Glaswerkstatt mit Ofen (Glasbläserin T/A), links unten das Skorpionnest (enc-duenen-koenigin),
// rechts unten Brösels Versteck. Ausgänge: Piste Ost zur Staubstraße, Wagenpiste West zum Meer (erst mit Flag epilog).
// Flags für Quest-Agenten (side-weg-zum-meer, side-glasherz) siehe design/plan/gaps/maps-23-oednis-hof.md.
import type { CheckDef, Condition, MapDef, Point } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import { GLASWERKSTATT_OFFEN } from './shops-oednis-hof';

const N = 'narrator';

/** Benannte Punkte (Plan-IDs aus act23.json, alle auf begehbarem Boden). */
const S = {
  'pisten-ost': [1440, 520],
  glaswerkstatt: [1195, 330],
  glasofen: [1430, 320],
  skorpionnest: [560, 690],
  'broesel-versteck': [1060, 840],
  'eingestuerzte-bruecke': [690, 250],
  seilwinde: [770, 315],
  aussichtsduene: [300, 240],
  wagenpiste: [130, 820],
  'auftrag-a': [700, 520],
} satisfies Record<string, Point>;

// --- Bedingungen ---------------------------------------------------------------------------------------------------
const epilog: Condition = { flag: 'epilog' };
const brueckeGespannt: Condition = { flag: 'glasduenen_bruecke_gespannt' };
const glasherzAktiv: Condition = { quest: 'side-glasherz', state: 'active' };
/** Die Königin ist erledigt: Ei zurück, abgelenkt, besiegt oder die Quest ist durch. */
const koeniginRuhig: Condition = {
  any: [
    { flag: 'glasherz_ei_zurueck' }, { flag: 'glasherz_koenigin_abgelenkt' }, { won: 'enc-duenen-koenigin' },
    { quest: 'side-glasherz', state: ['done', 'failed'] },
  ],
};
const koeniginWach: Condition = { all: [glasherzAktiv, { not: koeniginRuhig }] };
const kannGraben: Condition = { any: [{ item: 'metalldetektor' }, { origin: 'origin-oednis' }] };

/** Am Nest vorbeischleichen, ohne die Brut zu wecken (kein world.md-Check, daher eingebettet). */
const nestSchleichen: CheckDef = {
  id: 'glasduenen-nest-schleichen', attribute: 'reflexe', threshold: 6, tags: ['schleichen', 'welt'], label: '[Reflexe 6]',
};

const glasduenen: MapDef = {
  id: 'glasduenen',
  name: 'Glasdünen',
  subtitle: 'Ödnis · Am Rand der Welt',
  size: [1536, 1024],
  district: 'oednis',
  lighting: 'outdoor',
  bg: 'bg-glasduenen',
  bgVariants: [{ when: { time: ['abend', 'nacht'] }, bg: 'bg-glasduenen-abend' }],
  walk: [
    // Aussichtsdüne (Laufinsel hinter der Glasschlucht, nur über die Brücke bzw. Hangeln)
    [[175, 125], [300, 95], [440, 110], [470, 180], [470, 292], [420, 302], [200, 302], [140, 255]],
    // Dünenebene mit Nordstreifen zur Seilwinde, Piste Ost und Wagenpiste West
    [
      [700, 105], [880, 105], [880, 300], [1536, 300], [1536, 990], [0, 990], [0, 450], [300, 445], [480, 432], [580, 420],
      [640, 390], [655, 300], [660, 200], [690, 130],
    ],
  ],
  block: [
    [[190, 150], [260, 150], [260, 200], [190, 200]], // Steinmann
    [[268, 95], [295, 95], [295, 190], [268, 190]], // Wegpfahl
    [[705, 185], [830, 185], [830, 295], [705, 295]], // Seilwinde
    [[880, 30], [1340, 30], [1340, 298], [880, 298]], // Glaswerkstatt mit Regalen
    [[1340, 40], [1536, 40], [1536, 292], [1340, 292]], // Glasofen, Holz, Sand
    [[905, 505], [1000, 505], [1000, 555], [905, 555]], // Kristalle Mitte
    [[1080, 640], [1170, 640], [1170, 690], [1080, 690]], // Kristalle rechts
    [[280, 780], [380, 700], [480, 690], [640, 740], [770, 830], [730, 950], [460, 975], [280, 930]], // Skorpionnest
    [[1100, 770], [1300, 720], [1536, 760], [1536, 960], [1380, 960], [1260, 900], [1100, 900]], // Brösels Wrack und Plane
    [[30, 530], [130, 530], [130, 640], [30, 640]], // Schild an der Wagenpiste
    [[145, 620], [345, 620], [345, 690], [145, 690]], // Schranke
    [[0, 580], [40, 580], [40, 760], [0, 760]], // Zaunpfähle links
  ],
  foreground: [
    { rect: [700, 175, 140, 125], baseY: 295 },
    { rect: [895, 460, 115, 100], baseY: 555 },
    { rect: [1070, 595, 110, 100], baseY: 690 },
    { rect: [1140, 715, 396, 250], baseY: 900 },
    { rect: [25, 520, 330, 175], baseY: 690 },
  ],
  exits: [
    { id: 'nach-staubstrasse', rect: [1508, 420, 28, 220], to: 'staubstrasse', entry: 'von-glasduenen', label: 'Piste zur Staubstraße' },
    {
      id: 'wagenpiste', rect: [0, 770, 28, 210], to: 'das-meer', entry: 'von-glasduenen', label: 'Wagenpiste zum Meer',
      // Integration (design/plan/ending.md): nur mit meer_offen – im Master-Modus (Ende 3 ohne 3b) bleibt die Piste zu.
      when: { all: [epilog, { flag: 'meer_offen' }] }, minutes: 60,
      lockedText: 'Die Piste endet an einem Schild: „Meer – 40 km. Wagen erforderlich. Mut auch.“ Noch nicht.',
    },
    {
      id: 'bruecke-hinueber', rect: [655, 215, 40, 75], to: 'glasduenen', entry: 'aussichtsduene', label: 'Über die Brücke',
      interact: true, when: brueckeGespannt, minutes: 5,
      lockedText: 'Die Brücke hängt in Fetzen in der Glasschlucht. Die Seilwinde daneben sieht aus, als hätte sie noch einen Zug übrig.',
    },
    {
      id: 'bruecke-zurueck', rect: [430, 205, 40, 75], to: 'glasduenen', entry: 'bruecke', label: 'Zurück über die Schlucht',
      interact: true, minutes: 5,
    },
  ],
  entries: {
    'von-staubstrasse': { at: [1440, 520], facing: 'w' },
    'von-das-meer': { at: [90, 870], facing: 'e' },
    taxi: { at: [1100, 440], facing: 's' },
    aussichtsduene: { at: [390, 250], facing: 'w' },
    bruecke: { at: [700, 320], facing: 'e' },
  },
  spots: Object.fromEntries(Object.entries(S).map(([id, at]) => [id, {
    at,
    facing: (['glaswerkstatt', 'glasofen'].includes(id) ? 'n'
      : ['aussichtsduene', 'wagenpiste', 'eingestuerzte-bruecke'].includes(id) ? 'w'
        : id === 'pisten-ost' ? 'w' : 's') as 'n' | 'w' | 's',
  }])),
  hotspots: [
    // --- Glaswerkstatt ---------------------------------------------------------------------------------------------
    {
      id: 'glaswerkstatt', at: [1195, 320], radius: 64, label: 'Glaswerkstatt', kind: 'shop', shop: 'glaswerkstatt', when: GLASWERKSTATT_OFFEN,
      lines: [{ speaker: N, text: 'Regale voller Glaskugeln, Glasmuscheln, Vasen mit Luftblasen drin wie gefangene Seufzer. Die Wände der Hütte sind aus Flaschen gemauert, und das Licht fällt in zwanzig Farben auf den Boden. Hier ist alles zerbrechlich, außer der Frau, die es macht.' }],
    },
    {
      id: 'glaswerkstatt-zu', at: [1195, 320], radius: 64, label: 'Glaswerkstatt (zu)', kind: 'look', when: { not: GLASWERKSTATT_OFFEN },
      lines: [{ speaker: N, text: 'Vor der Tür hängt eine Glaskugel an einer Schnur, darin ein gemalter schlafender Mond. Geschlossen. Die Glasbläserin arbeitet, wenn der Ofen heiß und die Sonne hoch ist, und abends, wenn das Glas rot leuchtet.' }],
    },
    {
      id: 'glasofen', at: [1430, 315], radius: 56, label: 'Glasofen', kind: 'look',
      lines: [
        { speaker: N, text: 'Ein Kuppelofen aus Ziegeln, so heiß, dass die Luft davor flimmert wie über einer Neonröhre. Im Maul glüht es orange. Daneben ein Haufen Sand, ein Stapel Holz und eine Blechdose mit der Aufschrift … nein, ohne Aufschrift. Nur ein gemaltes Herz.' },
        { speaker: N, text: 'Hier wird aus Wüste Glas. Aus Sand, Feuer und Geduld. Die Glasbläserin sagt, Glas vergisst nie, wie heiß es mal war.' },
      ],
    },
    // --- Aussichtsdüne (Laufinsel) ---------------------------------------------------------------------------------
    {
      id: 'aussicht-duene', at: [300, 235], radius: 60, label: 'Ausschau halten', kind: 'use', dialogue: 'glasduenen-aussicht',
    },
    {
      id: 'duene-steinmann', at: [225, 220], radius: 44, label: 'Steinmann', kind: 'look',
      lines: [{ speaker: N, text: 'Ein Türmchen aus flachen Steinen und Glasscherben, jeder Stein von jemand anderem hingelegt. Ganz oben eine Muschel. Wer es bis hierher schafft, legt was dazu. Du legst einen Kronkorken drauf. Für die nächsten.' }],
      effects: [{ markSeen: 'glasduenen-steinmann' }],
    },
    // --- Glasschlucht und Brücke -----------------------------------------------------------------------------------
    {
      id: 'eingestuerzte-bruecke', at: [680, 250], radius: 50, label: 'Eingestürzte Brücke', kind: 'look', when: { not: brueckeGespannt },
      lines: [
        { speaker: N, text: 'Eine Seilbrücke über die Glasschlucht, oder was von ihr übrig ist: zwei Stahlseile, ein paar Planken, die Hälfte baumelt in die Tiefe. Unten glitzert die Schlucht türkis und bernsteinfarben, scharf wie ein Haufen zerbrochener Weinflaschen.' },
        { speaker: N, text: 'Drüben die Aussichtsdüne. Von dort, sagt man, sieht man das Meer. Die Seilwinde neben dir rostet vor sich hin. Oder man hangelt am Restseil hinüber und betet.' },
      ],
    },
    {
      id: 'seilwinde', at: [770, 310], radius: 50, label: 'Seilwinde reparieren', kind: 'check', check: 'gc-94', hideWhen: brueckeGespannt,
      lines: [{ speaker: N, text: 'Eine Handwinde auf einem Betonklotz, Zahnräder voller Glasstaub, die Sperrklinke gebrochen. Das Stahlseil ist noch dran. Mit ein bisschen Schrauberei zieht sie die Brücke wieder straff.' }],
      altText: 'Die Zahnräder knirschen, die Klinke springt dir ins Gesicht. Ohne mehr Technik wird das nichts. Ein Reparaturset könnte helfen, oder du hangelst dich am Restseil hinüber.',
      effects: [
        { setFlag: 'glasduenen_bruecke_gespannt' }, { xp: 30 },
        { message: 'Die Winde rattert, die Seile spannen sich, die Planken klappen hoch wie ein Kartenhaus rückwärts. Die Brücke hält. Wahrscheinlich.' },
      ],
    },
    {
      id: 'seilwinde-reparaturset', at: [845, 290], radius: 44, label: 'Winde mit Reparaturset flicken', kind: 'use',
      when: { item: 'reparaturset' }, hideWhen: brueckeGespannt,
      effects: [
        { take: 'reparaturset' }, { setFlag: 'glasduenen_bruecke_gespannt' }, { xp: 15 }, { advanceTime: 30 },
        { message: 'Neue Klinke, frisches Fett, drei Flüche. Die Winde zieht die Brücke straff. Das Reparaturset ist alle, die Schlucht nicht mehr.' },
      ],
    },
    {
      id: 'seilwinde-fertig', at: [770, 310], radius: 50, label: 'Seilwinde', kind: 'look', when: brueckeGespannt,
      lines: [{ speaker: N, text: 'Die Winde steht fest, die Seile summen im Wind wie eine riesige Gitarrensaite. Jemand hat mit Glasstaub ein Smiley auf den Betonklotz gemalt. Vielleicht warst das du.' }],
    },
    {
      id: 'schlucht-hangeln', at: [680, 180], radius: 40, label: 'Am Restseil hinüberhangeln', kind: 'check', check: 'gc-103', hideWhen: brueckeGespannt,
      lines: [{ speaker: N, text: 'Ein einzelnes Stahlseil spannt sich noch über die Schlucht. Zwanzig Meter Hand über Hand, unter dir Glas wie Haifischzähne. Hoffentlich hast du heute nichts Wichtiges vor.' }],
      altText: 'Nach drei Griffen brennen die Arme, nach vier rutschst du zurück auf die Kante. Für den Weg fehlt dir Körper. Die Seilwinde wäre die schlauere Wahl, oder ein Greifhaken.',
      effects: [
        { xp: 20 }, { message: 'Hand über Hand, Herz im Hals. Drüben angekommen, küsst du die Düne. Sie schmeckt nach Sand.' },
        { travel: 'glasduenen', entry: 'aussichtsduene', minutes: 10 },
      ],
    },
    {
      id: 'schlucht-greifhaken', at: [710, 140], radius: 40, label: 'Mit dem Greifhaken hinüberschwingen', kind: 'use',
      when: { cyberware: 'arme-greifhaken' }, hideWhen: brueckeGespannt,
      effects: [
        { message: 'Der Haken pfeift über die Schlucht und beißt sich in einen Brückenpfosten. Ein Schwung, ein Schrei, der nur ein bisschen unwürdig ist, und du stehst drüben.' },
        { travel: 'glasduenen', entry: 'aussichtsduene', minutes: 5 },
      ],
    },
    {
      id: 'flaschenpost-04', at: [520, 465], radius: 46, label: 'Flasche an der Schluchtkante', kind: 'loot', once: true,
      lines: [{ speaker: N, text: 'An der Kante der Glasschlucht, eingeklemmt zwischen zwei Glaszacken: eine Flasche mit Korken, vom Sand blind geschliffen. Vierzig Kilometer vom Wasser. Entweder hat sie jemand verloren, oder das Meer war mal sehr viel näher.' }],
      effects: [{ give: 'flaschenpost-04' }],
    },
    // --- Dünenebene ------------------------------------------------------------------------------------------------
    {
      id: 'glueckstern-18', at: [1300, 340], radius: 44, label: 'Funkeln auf dem Dünenkamm', kind: 'loot', once: true,
      lines: [{ speaker: N, text: 'Zwischen tausend funkelnden Scherben funkelt eine anders: ein Glücksstern, halb im Glas eingeschmolzen, als hätte die Wüste ihn festhalten wollen. Mit etwas Fummelei löst du ihn. Die Wüste lässt ihn gehen.' }],
      effects: [{ give: 'glueckstern-18' }],
    },
    {
      id: 'glaskristalle', at: [955, 590], radius: 52, label: 'Singende Kristalle', kind: 'look',
      lines: [{ speaker: N, text: 'Glaszacken, mannshoch, gewachsen aus geschmolzenem Sand. Wenn der Wind darüberstreicht, summen sie einen Ton, irgendwo zwischen Kirchenorgel und kaputtem Kühlschrank. Du summst mit. Die Kristalle summen schöner.' }],
    },
    {
      id: 'fossile-muschel-graben', at: [880, 880], radius: 52, label: 'Im Sand graben', kind: 'use', when: kannGraben, daily: true,
      lines: [{ speaker: N, text: 'Hier, wo der Sand weich wird, piept der Detektor, oder dein Bauch sagt dir, dass es sich lohnt. Du gräbst mit bloßen Händen, Glasstaub unter den Fingernägeln.' }],
      effects: [
        { give: 'fossile-muschel' }, { advanceTime: 20 },
        { message: 'Eine Muschel aus Stein, eingerollt wie ein schlafendes Tier. Hier war mal Meer. Irgendwann kommt es vielleicht zurück.' },
      ],
    },
    {
      id: 'weicher-sand', at: [880, 880], radius: 52, label: 'Weicher Sand', kind: 'look', when: { not: kannGraben },
      lines: [{ speaker: N, text: 'Der Sand ist hier weicher, heller, voller winziger Kalkbröckchen. Wer hier mit einem Metalldetektor oder dem Gespür der Ödnis gräbt, findet angeblich Muscheln aus Stein. Du findest nur Sand in den Schuhen.' }],
    },
    // --- Skorpionnest ----------------------------------------------------------------------------------------------
    {
      id: 'skorpionnest', at: S.skorpionnest, radius: 64, label: 'Skorpionnest', kind: 'look', when: { not: koeniginWach },
      lines: [{ speaker: N, text: 'Ein Krater aus Glassplittern, spitz wie eine Krone, in der Mitte eine ovale Mulde, glatt geschliffen. Unter dem Sand bewegt sich etwas Großes im Schlaf. Du gehst sehr leise und sehr schnell weiter.' }],
    },
    {
      id: 'skorpionnest-koenigin', at: S.skorpionnest, radius: 64, label: 'Die Königin', kind: 'use', when: koeniginWach, dialogue: 'glasduenen-koenigin',
    },
    // --- Brösels Versteck ------------------------------------------------------------------------------------------
    {
      id: 'broesel-versteck', at: S['broesel-versteck'], radius: 60, label: 'Versteck hinter dem Wrack', kind: 'look',
      lines: [{ speaker: N, text: 'Hinter einem halb vergrabenen Autowrack: eine geflickte Plane, ein Klappstuhl, eine Kiste mit Wasserflaschen, auf jeder ein Preisschild mit drei Nullen. Hier haust jemand, der Durst für ein Geschäftsmodell hält. Staubbaron Brösel, schätzt du. Der Kerl verkauft Sand an die Wüste.' }],
    },
    // --- Wagenpiste ------------------------------------------------------------------------------------------------
    {
      id: 'wagenpiste-schild', at: [200, 730], radius: 50, label: 'Schranke an der Wagenpiste', kind: 'look', when: { not: epilog },
      lines: [
        { speaker: N, text: 'Eine rostige Schranke, Holzpfähle, Reifenspuren, die nach Westen verschwinden. Am Schild nur eine gemalte Welle und darunter, eingeritzt: „Meer – 40 km. Wagen erforderlich. Mut auch.“' },
        { speaker: N, text: 'Zu Fuß schaffst du hier nur den Weg zurück. Irgendwann, wenn die Stadt nicht mehr an dir zieht, fährt hier ein Wagen. Noch nicht.' },
      ],
    },
    {
      id: 'wagenpiste-offen', at: [200, 730], radius: 50, label: 'Wagenpiste', kind: 'look', when: epilog,
      lines: [{ speaker: N, text: 'Die Schranke steht offen, mit Draht hochgebunden und einem Kranz aus Muscheln dran. Reifenspuren, frisch, viele. Der Konvoi fährt jetzt jeden Tag. Westen riecht nach Salz.' }],
    },
  ],
  lights: [
    { at: [1435, 215], radius: 170, color: '#ff8a3a', intensity: 0.85, slots: ['abend', 'nacht'] }, // Glasofen
    { at: [1195, 200], radius: 130, color: '#ffd27a', intensity: 0.55, slots: ['abend', 'nacht'] }, // Flaschenfenster
    { at: [1320, 920], radius: 80, color: '#ffb35c', intensity: 0.7, slots: ['abend', 'nacht'] }, // Brösels Feuer
    { at: [560, 260], radius: 230, color: '#33e6ff', intensity: 0.4, slots: ['nacht'] }, // leuchtende Glasschlucht
    { at: [260, 390], radius: 200, color: '#33e6ff', intensity: 0.3, slots: ['nacht'] },
    { at: [520, 840], radius: 160, color: '#b45cff', intensity: 0.35, slots: ['nacht'] }, // Nest schimmert
    { at: [955, 515], radius: 100, color: '#9fe8ff', intensity: 0.4, slots: ['nacht'] }, // Kristalle
    { at: [1125, 650], radius: 90, color: '#9fe8ff', intensity: 0.35, slots: ['nacht'] },
  ],
  ambient: {
    count: 1,
    bySlot: { morgen: 1, tag: 2, abend: 2, nacht: 0 },
    sprites: ['passant-schrotti-walk', 'passant-arbeiterin-walk', 'passant-strassenhaendler-walk'],
    routes: [
      [[1440, 520], [1250, 440], [1195, 340]],
      [[1195, 360], [900, 420], [700, 600], [420, 600], [200, 760], [90, 880]],
      [[1440, 600], [1250, 650], [950, 760], [850, 900]],
    ],
    barks: [
      { text: 'Wasser ist Leben. Sand ist … auch da.' },
      { text: 'Radio Rost spielt heute wieder nur Platten mit Sprung.' },
      { text: 'Die Falken fliegen tief. Gibt Sturm oder Ärger.', when: { act: 2 } },
      { text: 'Der Konvoi fährt jetzt jeden Tag ans Meer. Mit Sonnencreme!', when: epilog },
      { text: 'Fass nichts an, was funkelt. Hier funkeln die Sachen, die dich fressen wollen.' },
      { text: 'Ich hab mir eine Vase bei der Glasbläserin gekauft. Für meine Asche. Man muss ja vorbereitet sein.' },
      { text: 'Siehst du den blauen Streifen da hinten? Das ist kein Smog, Kumpel. Das ist das verfickte Meer.' },
      { text: 'Barfuß? Hier? Du bist entweder ein Heiliger oder bald ein Pflaster.' },
      { text: 'Brösel verkauft Wasser für zwanzig Credits die Flasche. Zwanzig! Der Arsch soll an seinem Sand ersticken.', when: { not: { flag: 'glasherz_ei_zurueck' } } },
      { text: 'Die Königin ist wach. Ich hab sie gehört. Klingt wie ein Kronleuchter, der wütend ist.', when: koeniginWach },
      { text: 'Seit die Brücke wieder hängt, rennen alle zur Düne hoch und heulen beim Meergucken. Ich auch.', when: brueckeGespannt },
      { text: 'Abends wird das Glas rot. Dann sieht die Wüste aus, als hätte sie Fieber.', when: { time: 'abend' } },
    ],
  },
  ambience: 'oednis',
  onEnter: [
    { id: 'glasduenen-erstbesuch', once: true, dialogue: 'glasduenen-ankunft', effects: [{ markSeen: 'glasduenen-betreten' }] },
    {
      id: 'glasduenen-nachspiel', once: true, when: { all: [epilog, { seen: 'glasduenen-betreten' }] },
      effects: [{ message: 'Die Schranke an der Wagenpiste steht offen. Westen riecht nach Salz.' }],
    },
  ],
};

// --- Dialoge -------------------------------------------------------------------------------------------------------
const dialogues: NonNullable<ContentPart['dialogues']> = {
  'glasduenen-ankunft': {
    id: 'glasduenen-ankunft',
    start: 'a',
    nodes: [{
      id: 'a',
      lines: [
        { speaker: N, text: 'Hinter dem letzten Giftnebel reißt die Luft auf, und die Welt funkelt. Dünen aus Glas, geschmolzen in irgendeinem Krieg, den keiner mehr erklären kann, in allen Farben, die die Sonne kennt. Jeder Schritt knirscht wie auf Zucker.' },
        { speaker: N, text: 'Links eine Schlucht, die von innen leuchtet, rechts eine Hütte aus bunten Flaschen mit einem Ofen, der raucht. Und ganz hinten am Horizont, dünn wie ein Strich mit Filzstift: ein dunkelblauer Streifen. Du starrst ihn an, bis die Augen tränen. Das ist das Meer.' },
      ],
    }],
  },
  'glasduenen-aussicht': {
    id: 'glasduenen-aussicht',
    start: 'a',
    nodes: [
      {
        id: 'a',
        lines: [{ speaker: N, text: 'Der Gipfel der Aussichtsdüne, ein flacher Teller aus Glas und Sand. Der Wind kommt hier von Westen, und er riecht anders als jeder Wind, den du kennst.' }],
        choices: [
          { text: 'Nach Westen schauen.', next: 'blick', when: { not: { seen: 'aussicht-glasduenen' } } },
          { text: 'Nochmal hinschauen.', next: 'nochmal', when: { seen: 'aussicht-glasduenen' } },
          { text: 'Ein Foto machen. Fürs Team.', next: 'foto', when: { all: [{ seen: 'aussicht-glasduenen' }, { noItem: 'meer-foto' }] } },
          { text: 'Runter von der Düne.' },
        ],
      },
      {
        id: 'blick',
        lines: [
          { speaker: N, text: 'Unter dir die Glasdünen, die Hütte der Glasbläserin wie ein bunter Murmelhaufen, die Piste nach Osten, und dahinter, ganz weit, ein grauer Fleck mit Spitze: die Stadt. Der Chrome Tower. Von hier aus ist er so groß wie dein Daumen.' },
          { speaker: N, text: 'Und im Westen: Wasser. Nicht Kanalwasser, nicht Brackbucht. Blaues, echtes, bewegtes Wasser bis zum Ende der Welt, mit weißen Rändern, die sich bewegen. Wellen. Du hast Wellen nur aus Filmen gekannt.' },
          { speaker: 'player', text: 'Scheiße. Es gibt es wirklich.' },
        ],
        effects: [
          { markSeen: 'aussicht-glasduenen' }, { setFlag: 'meer_von_duene_gesehen' }, { xp: 20 },
          { message: 'Aussichtspunkt entdeckt: Aussichtsdüne (+20 XP)' },
        ],
        next: 'nachblick',
      },
      {
        id: 'nachblick',
        lines: [{ speaker: N, text: 'Vierzig Kilometer. Ein Wagen, ein bisschen Mut, und eine Stadt, die dich gehen lässt. Irgendwann. Du nimmst dir vor, dass es nicht bei irgendwann bleibt.' }],
        choices: [
          { text: 'Ein Foto machen. Fürs Team.', next: 'foto', when: { noItem: 'meer-foto' } },
          { text: 'Einfach weiter schauen.' },
        ],
      },
      {
        id: 'foto',
        lines: [
          { speaker: N, text: 'Du hältst das Telefon hoch, wartest, bis eine Welle bricht, und drückst ab. Das Bild ist verwackelt, der Horizont schief und dein Daumen oben links. Es ist das schönste Foto, das du je gemacht hast.' },
        ],
        effects: [{ give: 'meer-foto' }, { setFlag: 'meer_foto_gemacht' }],
      },
      {
        id: 'nochmal',
        lines: [{ speaker: N, text: 'Das Meer ist noch da. Es wartet nicht auf dich, es ist einfach da, so wie es immer da war. Das ist beruhigender, als du gedacht hättest.' }],
        effects: [{ advanceTime: 15 }],
      },
    ],
  },
  'glasduenen-koenigin': {
    id: 'glasduenen-koenigin',
    start: 'a',
    nodes: [
      {
        id: 'a',
        lines: [
          { speaker: N, text: 'Der Krater bebt. Glassplitter rieseln, und aus der Mulde hebt sich ein Kopf so groß wie ein Lieferwagen, mit Augen wie Diskokugeln. Die Königin der Glasskorpione. Sie sucht ihr Ei. Und sie ist sauer, dass du nicht ihr Ei bist.' },
        ],
        choices: [
          { text: 'Das Ei vorsichtig in die Mulde legen.', when: { flag: 'glasherz_ei_geborgen' }, next: 'ei' },
          { text: 'Eine Handvoll Glasperlen in den Sand werfen.', when: { item: 'glasperlen' }, next: 'perlen', effects: [{ take: 'glasperlen' }] },
          { text: 'Leise rückwärts verschwinden.', check: nestSchleichen, next: 'weg' },
          { text: 'Kämpfen. Glas bricht, wenn man fest genug zuhaut.', next: 'kampf' },
          { text: 'Wegrennen. Schreiend.' },
        ],
      },
      {
        id: 'ei',
        lines: [
          { speaker: N, text: 'Du legst das Ei in die Mulde. Es ist warm, es pulsiert leise, und es klickt, als es den Sand berührt. Die Königin senkt den Kopf, bis ihre Fühler dein Gesicht streifen. Kalt. Glatt. Fast zärtlich.' },
          { speaker: N, text: 'Dann gräbt sie sich ein, um das Ei herum, und der Krater ist still. Irgendwo hinter dir lässt die Glasbläserin den Atem raus, den sie seit drei Tagen anhält.' },
        ],
        effects: [{ setFlag: 'glasherz_ei_zurueck' }, { xp: 40 }, { rep: 'aussiedler', delta: 2 }],
      },
      {
        id: 'perlen',
        lines: [
          { speaker: N, text: 'Die Perlen kullern funkelnd über den Sand. Die Königin erstarrt. Dann dreht sie den Kopf, langsam, wie eine Elster vor einem Juweliergeschäft, und schiebt die Perlen mit einer Schere in ihr Nest. Eine nach der anderen. Sorgfältig.' },
          { speaker: N, text: 'Du hast vielleicht zwei Tage. Dann merkt sie, dass Glasperlen kein Ei sind. Aber zwei Tage sind in der Ödnis eine Ewigkeit.' },
        ],
        effects: [{ setFlag: 'glasherz_koenigin_abgelenkt' }, { xp: 25 }],
      },
      {
        id: 'weg',
        lines: [{ speaker: N, text: 'Ein Schritt, noch einer, nicht atmen, nicht knirschen. Die Königin schnuppert, zischt, und sinkt zurück in den Sand. Sie hat dich nicht bemerkt. Oder du warst ihr zu mager.' }],
      },
      {
        id: 'kampf',
        lines: [{ speaker: N, text: 'Du hebst die Waffe. Die Königin hebt den Stachel. Das Licht bricht sich in ihrem Panzer in hundert hässliche Regenbögen.' }],
        effects: [{ battle: 'enc-duenen-koenigin' }],
      },
    ],
  },
};

export const part: ContentPart = {
  maps: { [glasduenen.id]: glasduenen },
  dialogues,
};
