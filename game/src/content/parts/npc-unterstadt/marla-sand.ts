// Marla Sand – Aussiedlerin und Karawanenhändlerin (world.md §4.4, §4.6, §11.2).
// Akt 1: nur samstags als Besucherin am Schrottmarkt (Karawanenstand M/T, abends Oldie-Ecke im High Voltage),
// Herz-Ereignis he-marla-sand-2 am Karawanenwagen (design/plan/act1.json notes: Wasserfilter statt Brunnen).
// he-marla-sand-4…10 angelegt und an act2 gebunden (Hof und Ödnis folgen; Karten dann umhängen, siehe Lücken).
// Begleiterin ab ♥6, laut §11.2 erst ab act2. Romanze nur mit { romance: 'marla-sand' } (derzeit nicht freigeschaltet).
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode, NpcDef } from '../../../modules/contracts';
import {
  type Menue, einmalig, AKT2, VOR_AKT2, alle, dialog, erz, flag, herz, herzEreignis, ich, knoten, nicht, pruefung, rede, sammle,
  sprecher, tagesgespraech, ZEIT_HINWEIS,
} from './_lib';

const ID = 'marla-sand';
const M_ = sprecher(ID);
const ROM: Condition = { romance: ID };
/** Flirtzeilen ab ♥6, sobald die Romanze freigeschaltet ist (Engine: romanceEnabled); Kuss/Nacht bleiben an ROM (♥8). */
const FLIRT: Condition = { all: [{ romanceEnabled: ID }, { hearts: ID, min: 6 }] };
const ODNIS: Condition = { origin: 'origin-oednis' };

// ---------------------------------------------------------------------------------------------- Menü

function menue(): Menue {
  const zurueck: DialogueChoice[] = [{ text: 'Noch eine Frage, Marla.', next: 'menue', id: 'zurueck' }, { text: 'Gute Reise.' }];
  const choices0: DialogueChoice[] = [
    { text: 'Was hast du heute auf dem Wagen?', when: { time: ['morgen', 'tag'] }, next: 'laden', id: 'm-laden' },
    { text: '„Ich bin draußen aufgewachsen. Zwischen Sand und Funkturm.“', tag: '[Ödnis]', when: ODNIS, once: true, id: 'm-oednis', next: 'oednis' },
    { text: 'Du hast das Meer gesehen? Wirklich?', once: true, id: 'm-meer', next: 'meer' },
    { text: 'Warum kommst du nur samstags?', once: true, id: 'm-samstag', next: 'samstag' },
    { text: 'Kann man noch über die Staubstraße?', next: 'staubstrasse', id: 'm-staub' },
    { text: 'Weißt du was über die Küstenkarte?', when: { item: 'kuestenkarte-fragment' }, once: true, id: 'm-karte', next: 'karte' },
    { text: 'Komm mit. Ich brauch jemanden, der den Wind liest.', requires: { hearts: ID, min: 6 }, tag: '[Marla ♥6]', when: alle(AKT2, nicht({ recruited: ID })), next: 'mit', effects: [{ recruit: ID }] },
    { text: 'Bleib hier, Marla.', when: { companion: ID }, next: 'weg', effects: [{ dismiss: ID }] },
    { text: '„Du siehst gut aus für jemanden, der drei Tage durch Sand gefahren ist.“', tag: '[Romanze]', when: FLIRT, next: 'flirt', id: 'm-flirt' },
    { text: 'Gute Reise.' },
  ];
  const choices = einmalig(ID, choices0);
  const nodes: DialogueNode[] = [
    knoten('menue', [M_('Frag. Fragen kosten nichts. Antworten manchmal schon. Aber nicht bei mir, nicht heute.')], { choices }),
    knoten('laden', [
      M_('Samen, die noch keimen. Filter, die noch filtern. Honig von Bienen, die schlauer sind als die meisten Leute hier.', 'signatur'),
      M_('Und Treibholz. Die Stadtleute kaufen es als Deko. Draußen machen wir Feuer damit. Ich verrate nicht, wer recht hat.'),
    ], { choices: [{ text: 'Zeig her.', effects: [{ shop: 'marla-karawane' }] }, ...zurueck] }),
    knoten('oednis', [
      M_('Ich seh es an deinen Augen. Die blinzeln anders. Wer im Sand groß wird, blinzelt sparsam.', 'freude'),
      M_('Willkommen zurück. Auch wenn du gar nicht zurück bist. Die Ödnis vergisst niemanden, der ihr Wasser getrunken hat. Auch die Stadt nicht.'),
    ], { choices: zurueck, effects: [herz(ID, 200)] }),
    knoten('meer', [
      M_('Einmal. Vor zwanzig Jahren. Mein Vater hat uns hingefahren, auf einem Laster, der mehr Loch war als Laster.', 'zaertlich'),
      M_('Es ist nicht blau, wie sie sagen. Es ist alles. Grün, grau, silbern. Es atmet. Ich hab eine Stunde nur dagestanden und zugehört, wie es atmet.'),
      M_('Den Weg kenn ich noch. Halb. Die andere Hälfte steht auf alten Karten. Die liegen verstreut, wie alles hier. Wer den Wind liest, verläuft sich nicht. Aber Wind allein reicht nicht bis ans Meer.', 'signatur'),
    ], { choices: zurueck }),
    knoten('samstag', [
      M_('Weil die Karawane drei Tage braucht. Hin und zurück. Und weil samstags die Leute Geld haben und noch nicht alles versoffen.', 'signatur'),
      M_('Den Rest der Woche bin ich auf dem Hof. Brunnen, Ziegen, Kinder, die keine Ziegen sind, sich aber so benehmen.'),
    ], { choices: zurueck }),
    knoten('staubstrasse', [
      M_('Nicht jetzt. Der Konvoi fährt erst wieder, wenn der Sand sich setzt. Und der Sand ist gerade sehr wütend.', 'besorgt'),
      M_('Wenn du raus willst, brauchst du einen Wagen, der fährt. Und einen, der fährt, wenn er muss. Das ist nicht dasselbe.'),
    ], { choices: zurueck }),
    knoten('karte', [
      erz('Marla nimmt das Fragment vorsichtig zwischen zwei Finger, als wäre es ein Schmetterling.'),
      M_('Bojen. Die alte Küstenlinie. Das ist ein Stück vom Weg. Ein gutes Stück.', 'freude'),
      M_('Pass drauf auf. Es gibt noch mehr davon. Vier, sagt man. Wer alle hat, findet das Meer, ohne zu fragen.'),
    ], { choices: zurueck, effects: [herz(ID, 20)] }),
    knoten('mit', [M_('Ich nehm die Feldflasche. Und den Bolzer. Der Wind kommt mit, ob du willst oder nicht.', 'signatur')]),
    knoten('weg', [M_('Gut. Ich bleib. Aber nicht zu lang. Stillstehen ist für Brunnen.')]),
    knoten('flirt', [
      M_('Drei Tage Sand machen ehrlich. Und durstig. Willst du rausfinden, worauf?', 'signatur'),
      M_('… Guck nicht so. Ich bin vierzig, nicht tot. Und du bist nicht der erste, der es versucht. Aber der erste seit Langem, bei dem ich drüber nachdenke.', 'freude'),
    ], { choices: zurueck }),
  ];
  return { choices, nodes };
}

const MENUE = menue();

// ---------------------------------------------------------------------------------------------- Tagesgespräche

const T = {
  erstes: tagesgespraech('marla-sand-tag-erstes',
    [
      erz('Ein Karawanenwagen mit Planen in Sandfarben, darauf Kanister, Saatbeutel und ein Bündel Treibholz. Daneben eine Frau mit Kopftuch, sonnengegerbten Händen und einem Blick, der durch dich durch bis zum Horizont geht.'),
      M_('Du stehst im Wind. Komm hier rüber, in den Schatten. Hier unten gibt es zwar keine Sonne, aber die Gewohnheit bleibt.', 'signatur'),
      M_('Marla. Marla Sand. Vom Aussiedlerhof draußen. Samstags bin ich hier. Sonst bin ich da, wo man noch den Himmel sieht.'),
    ],
    [M_('Die Stadt stinkt wie ein Kamel mit Zahnfäule. Aber sie hat Ersatzteile. Und Leute, die noch zuhören, wenn man was Kluges sagt. Wenige.')],
    MENUE),
  zeit: tagesgespraech('marla-sand-tag-zeit',
    [
      M_('Du kommst jeden Samstag. Das merk ich mir. Irgendwann zeig ich dir den Hof. Und den Brunnen. Und den Weg.', 'freude'),
      erz(ZEIT_HINWEIS),
    ],
    [M_('Manche Dinge muss man erst im Sand sagen. Hier unten verhallen sie zwischen den Blechdächern.')],
    MENUE, { effects: [flag('marla_zeit_hinweis')] }),
  oednis: tagesgespraech('marla-sand-tag-oednis',
    [M_('Da ist ja mein Sandkind. Du riechst immer noch nach Stadt. Das geht weg. Irgendwann.', 'freude')],
    [M_('Wenn du Heimweh hast: Riech an den Kanistern. Da ist noch ein bisschen Draußen drin. Wüstenluft in Plastik. Mehr hab ich nicht.', 'zaertlich')],
    MENUE),
  morgen: tagesgespraech('marla-sand-tag-morgen',
    [M_('Früh hier. Gut. Die Händler, die früh kommen, verkaufen ehrlich. Die späten verkaufen, was übrig ist, und nennen es Rarität.', 'signatur')],
    [
      M_('Heute Nacht hat jemand versucht, einen Kanister zu klauen. Ich hab ihm den Kanister gelassen. Er war leer. Er wird es merken, wenn er Durst hat.'),
      M_('Wer den Wind liest, verläuft sich nicht. Wer Kanister klaut, ohne reinzugucken, verläuft sich jeden Tag.'),
    ],
    MENUE),
  tag: tagesgespraech('marla-sand-tag-tag',
    [M_('Viel Betrieb. Die Stadtleute kaufen Samen und lassen sie auf der Fensterbank verdorren. Ich verkauf sie trotzdem. Hoffnung ist mein bestes Produkt.', 'signatur')],
    [M_('Dein Marktgeschrei hier ist lauter als jeder Sandsturm. Aber ein Sandsturm entschuldigt sich wenigstens nicht hinterher, dass er so laut war.')],
    MENUE),
  abend: tagesgespraech('marla-sand-tag-abend',
    [M_('Feierabend. Der Wagen ist zu, die Ziegen sind weit weg, und Hunter schenkt einen Tropfen aus, der nach Kaktus schmeckt. Setz dich.', 'freude')],
    [
      M_('Gustav spielt mir manchmal die alten Lieder vor. Die, die mein Vater auf dem Laster gesungen hat. Er hat geschummelt bei den Texten. Gustav auch.'),
      M_('Morgen früh fahr ich zurück. Der Sand wartet. Er wartet immer. Er ist der geduldigste Gläubiger, den es gibt.', 'besorgt'),
    ],
    MENUE),
  vertraut: tagesgespraech('marla-sand-tag-vertraut',
    [M_('{name}. Ich hab dir was aufgehoben. Nein, nicht zum Kaufen. Zum Anschauen. Eine Wüstenrose, ganz frisch aus dem Sand. Die wachsen ohne Wasser. Wie manche Leute.', 'freude')],
    [M_('Du bist einer von denen, die zurückkommen. Das sieht man. Die meisten kommen einmal und dann nie wieder. Du kommst wieder. Das ist mehr wert als Credits.')],
    MENUE),
  standard: tagesgespraech('marla-sand-tag-standard',
    [M_('Na, Stadtkind. Noch nicht verdurstet?')],
    [M_('Draußen sagen wir: Der Sand nimmt, was du liegen lässt. Hier unten nimmt es die Stadt. Pass auf deine Taschen auf. Und auf dein Herz. In der Reihenfolge.', 'signatur')],
    MENUE),
};

// ---------------------------------------------------------------------------------------------- Herz-Ereignisse

/** ♥2 (Akt 1, Sa am Karawanenstand): Der Wasserfilter des Karawanenwagens ist hin – [Körper 4] oder [Technik 4]. */
const he2 = dialog('he-marla-sand-2', [
  knoten('start', [
    erz('Am Karawanenstand riecht es nach Brackwasser. Marla kniet neben dem Wagen, die Ärmel hochgekrempelt, vor einem Tank, aus dem es braun tropft.'),
    M_('Der Filter. Hat auf der Fahrt eine Ladung Rostsand gefressen. Jetzt spuckt er, was er nicht verdaut.', 'besorgt'),
    M_('Ohne sauberes Wasser fahr ich nicht zurück. Drei Tage Sand mit einem Tank voller Rost – das überleben nur Kakteen. Und Ripper.'),
    M_('Der Tank muss runter vom Wagen, der Filter raus. Ich schaff den Tank nicht allein. Und den Filter versteh ich nicht. Er ist aus der Stadt. Stadtzeug ist kompliziert, damit man es neu kaufen muss.'),
  ], {
    choices: [
      { text: 'Den Tank vom Wagen wuchten.', check: pruefung('he-marla-2-koerper', 'koerper', 4, ['kraft', 'welt']), next: 'gehoben', effects: [herz(ID, 40)] },
      { text: 'Den Filter auseinandernehmen und durchspülen.', check: pruefung('he-marla-2-technik', 'technik', 4, ['reparieren', 'maschine']), next: 'gefiltert', effects: [herz(ID, 40)] },
      { text: 'Einen neuen Wasserfilter aus der Tasche ziehen.', when: { item: 'wasserfilter' }, next: 'neuer-filter', effects: [{ take: 'wasserfilter' }, herz(ID, 80)] },
      { text: 'Eimer holen. Wir pumpen den Tank von Hand leer und spülen nach.', next: 'eimer', effects: [{ advanceTime: 60 }, herz(ID, 30)] },
    ],
  }),
  knoten('gehoben', [
    erz('Du gehst in die Knie, packst die Haltebügel und hebst. Der Tank knarzt, du knarzt lauter. Dann steht er auf dem Pflaster, und Marla sieht dich an, als hättest du gerade einen Brunnen gegraben.'),
    M_('Starke Arme. In der Ödnis heiraten sie für so was. Hier unten zahlen sie nicht mal Trinkgeld.', 'freude'),
    erz('Den Rest erledigt sie selbst: Filter raus, ausklopfen, Sand raus, Filter rein. Sie kann es doch. Sie brauchte nur jemanden für den Tank.'),
  ], { next: 'ende' }),
  knoten('gefiltert', [
    erz('Drei Schrauben, eine Dichtung, eine Kammer voller roter Schlacke. Du spülst, drehst die Membran um, setzt alles verkehrt herum zusammen – was sich als richtig herum herausstellt.'),
    M_('Klar. Es läuft klar. Du hast Stadtzeug verstanden. Das ist eine seltene Gabe. Behalt sie, aber gib nicht damit an.', 'freude'),
  ], { next: 'ende' }),
  knoten('neuer-filter', [
    M_('Ein neuer. Original. Weißt du, was so was draußen wert ist? Eine Ziege. Zwei, wenn die Ziege dumm ist.', 'ueberrascht'),
    M_('Das ist zu viel. Das nehm ich nicht. … Ich nehm es. Aber ich vergesse es nicht. Wir in der Ödnis zählen Gefallen wie Wassertropfen.', 'freude'),
  ], { next: 'ende' }),
  knoten('eimer', [
    erz('Eine Stunde, zwölf Eimer, ein nasser Ärmel bis zur Schulter. Ihr pumpt, kippt, spült und pumpt wieder, bis das Wasser nur noch leicht nach Rost schmeckt. Also nach Stadt.'),
    M_('So machen wir es draußen. Kein Werkzeug, nur Geduld und Rücken. Du hast beides. Wenigstens heute.', 'signatur'),
  ], { next: 'ende' }),
  knoten('ende', [
    M_('Weißt du, warum ich das Meer gesehen hab und so wenige andere? Weil ich jemanden hatte, der den Tank hebt, wenn ich ihn nicht heben kann.', 'zaertlich'),
    M_('Hier. Samen von meinem Hof. Wirf sie irgendwo hin, wo keiner damit rechnet. Das ist das Schönste an Samen: Sie fragen nicht.'),
  ], {
    choices: [
      { text: '„Danke, Marla.“', next: 'danke' },
      { text: '„Nimmst du mich irgendwann mit raus?“', next: 'raus' },
    ],
    effects: [{ give: 'samenbombe' }, flag('marla_filter_repariert'), { xp: 50 }],
  }),
  knoten('danke', [M_('Bedank dich beim Wind. Der hat dich zu meinem Wagen geweht.', 'freude')]),
  knoten('raus', [
    M_('Irgendwann. Wenn der Sand sich setzt und die Straße wieder frei ist. Dann zeig ich dir den Hof. Und vielleicht noch weiter.', 'signatur'),
    ich('Bis zum Meer?'),
    M_('Bis dahin, wo dein Wasser reicht. Und dann ein Stückchen weiter. So kommt man ans Meer.', 'zaertlich'),
  ], { effects: [herz(ID, 10)] }),
]);

// ♥4–♥10: angelegt, erst ab act2 (Hof, Ödnis; world.md §11.2). Orte vorläufig am Karawanenstand, siehe Lücken.
const he4 = dialog('he-marla-sand-4', [
  knoten('start', [
    erz('Lagerfeuer aus Treibholz, die Flammen grün vom Salz. Marla sitzt im Schneidersitz und reicht dir einen Becher mit etwas, das nach Kaktus und Rauch schmeckt.'),
    M_('Ich hab dir vom Meer erzählt. Aber nicht alles. Nicht, warum ich nie wieder hingefahren bin.', 'besorgt'),
    M_('Mein Vater ist dort geblieben. Nicht gestorben. Geblieben. Er hat gesagt: „Hier ist es gut, Marla. Fahr du zurück, die Ziegen brauchen dich.“ Und ich bin gefahren.'),
    erz('Sie zieht ein gefaltetes, salzfleckiges Stück Karte aus dem Kopftuch.'),
    M_('Das hat er mir mitgegeben. Ein Stück vom Weg. Ich hab es nie benutzt. Vielleicht wartet es auf dich.'),
  ], {
    effects: [{ give: 'kuestenkarte-fragment' }, flag('marla_meer_geschichte'), { xp: 100 }],
    choices: [
      { text: '„Wir fahren hin. Zusammen.“', next: 'zusammen', effects: [herz(ID, 50)] },
      { text: 'Schweigend ins Feuer schauen.', next: 'feuer', effects: [herz(ID, 40)] },
    ],
  }),
  knoten('zusammen', [M_('Zusammen. Das Wort hab ich lange nicht gehört. Es klingt wie Regen auf Blech.', 'zaertlich')]),
  knoten('feuer', [M_('Du kannst schweigen. Das ist selten in der Stadt. Da reden alle, damit sie die Stille nicht hören.', 'freude')]),
]);

const he6 = dialog('he-marla-sand-6', [
  knoten('start', [
    erz('Der Himmel wird gelb. Dann braun. Dann gibt es keinen Himmel mehr. Sandsturm.'),
    M_('Runter! Gesicht in den Ärmel. Und jetzt hör hin. Nicht gucken. Hören.', 'besorgt'),
    M_('Der Wind hat eine Stimme. Wenn er pfeift, kommt er von den Dünen. Wenn er brummt, von den Ruinen. Wenn er still wird … dann lauf.'),
  ], {
    choices: [
      { text: 'Hinhören und die Richtung bestimmen.', check: pruefung('he-marla-6-wind', 'strasse', 5, ['sandsturm', 'beobachten']), next: 'gelesen', effects: [herz(ID, 50)] },
      { text: 'Marlas Hand nehmen und ihr folgen.', next: 'folgen', effects: [herz(ID, 40)] },
    ],
  }),
  knoten('gelesen', [
    ich('Er brummt. Von links. Die Ruinen sind links. Also … rechts lang.'),
    M_('Ha! Wer den Wind liest, verläuft sich nicht. Du hast ihn gelesen. Langsam, mit dem Finger unter der Zeile, aber gelesen.', 'freude'),
  ], { effects: [flag('marla_wind_gelesen'), { xp: 120 }] }),
  knoten('folgen', [
    erz('Ihre Hand ist rau und warm. Sie zieht dich durch den Sand wie durch einen Vorhang, ohne zu zögern. Als der Sturm vorbei ist, steht ihr genau vor dem Hof.'),
    M_('Nächstes Mal liest du selbst. Ich bin nicht immer da. Aber diesmal war ich da.', 'zaertlich'),
  ], { effects: [flag('marla_wind_gelesen'), { xp: 120 }] }),
]);

const he8 = dialog('he-marla-sand-8', [
  knoten('start', [
    erz('Die Karawane steht. Über den Dünen kreisen Staubfalken – Plünderer mit Gleitschirmen und Rostklingen.'),
    M_('Wenn wir umdrehen, kommen wir ohne Ware heim. Wenn wir weiterfahren, kommen wir vielleicht gar nicht heim. Ich mag beide Möglichkeiten nicht.', 'besorgt'),
  ], {
    choices: [
      { text: '„Wir fahren. Ich halt sie dir vom Leib.“', next: 'fahren', effects: [herz(ID, 60)] },
      { text: '„Verhandeln. Jeder hat Durst, auch Plünderer.“', check: pruefung('he-marla-8-verhandeln', 'ausstrahlung', 6, ['verhandeln']), next: 'verhandeln', effects: [herz(ID, 60)] },
    ],
  }),
  knoten('fahren', [M_('Dann fahren wir. Und wenn wir ankommen, koch ich dir was, das nicht nach Konserve schmeckt. Versprochen.', 'signatur')], { effects: [flag('marla_eskorte'), { xp: 160 }] }),
  knoten('verhandeln', [M_('Wasser gegen Durchfahrt. Du hast mit Staubfalken gefeilscht und sie haben sich bedankt. Draußen nennen sie dich jetzt „die Zunge“. Gewöhn dich dran.', 'freude')], { effects: [flag('marla_eskorte'), { xp: 160 }] }),
]);

const he10 = dialog('he-marla-sand-10', [
  knoten('start', [
    erz('Der Brunnen auf dem Hof gibt Wasser. Klares, kaltes, echtes Wasser. Marla hält einen Stab aus gebogenem Kupferdraht in der Hand.'),
    M_('Mein Wasserstab. Mein Vater hat damit den ersten Brunnen gefunden. Ich den zweiten. Den dritten findest du.', 'zaertlich'),
    M_('Nimm ihn. Und wenn du je am Meer stehst und einen alten Mann mit Ziegenbart siehst, sag ihm, Marla hat nicht vergessen, wie es atmet.'),
  ], {
    effects: [{ give: 'marlas-wasserstab' }, flag('marla_wasserstab'), { xp: 200 }],
    choices: [
      { text: '„Ich sag es ihm. Versprochen.“', next: 'ende', effects: [herz(ID, 50)] },
      { text: '„Sag es ihm selbst. Komm mit.“', tag: '[Romanze]', when: ROM, next: 'romanze', effects: [herz(ID, 60)] },
    ],
  }),
  knoten('ende', [M_('Gut. Dann weiß ich, dass es jemand hört.', 'freude')]),
  knoten('romanze', [
    M_('Mitkommen. Ans Meer. Mit dir.', 'zaertlich'),
    erz('Sie lacht leise und lehnt die Stirn an deine Schulter. Der Wind dreht sich und bringt den Geruch von Regen, irgendwo weit weg.'),
    M_('Frag mich nochmal, wenn die Sterne rauskommen. Dann sag ich ja. Bis dahin tun wir so, als müssten wir noch überlegen.'),
  ], { effects: [flag('marla-sand_romanze_zusammen')] }),
]);

// ---------------------------------------------------------------------------------------------- Figur

const SAMSTAG = { weekday: 'sa' } as const;

const marla: NpcDef = {
  id: ID,
  name: 'Marla Sand',
  unknownName: 'Frau mit Karawanenwagen',
  portrait: ID,
  sprite: `${ID}-walk`,
  faction: 'unterstadt',
  romanceable: true,
  bio: 'Aussiedlerin um die vierzig, leitet den Aussiedlerhof und kommt samstags mit der Karawane auf den Schrottmarkt. Hat das Meer gesehen und kennt den halben Weg dorthin.',
  gifts: {
    loves: ['wasserfilter', 'samenbombe', 'treibholz'],
    likes: ['wuestenrose', 'blumensamen', 'zeitung-papier', 'hofhonig', 'echtobst-apfel'],
    dislikes: ['edelbrause', 'parfuem-ozon'],
    hates: ['plastikpflanze', 'rostige-dose', 'virus-implantat'],
  },
  schedule: [
    // Akt 2: Aussiedlerhof Mo–Fr/So, Sa wie hier, nachts Staubstraße (Karten folgen mit der Ödnis).
    { slot: ['morgen', 'tag'], days: ['sa'], place: { map: 'schrottmarkt', at: 'karawanenstand' } },
    { slot: 'abend', days: ['sa'], place: { map: 'high-voltage', at: 'oldie-ecke' } },
    { place: 'away' },
  ],
  heartEvents: [
    herzEreignis('he-marla-sand-2', 2, 'schrottmarkt', ['morgen', 'tag'], SAMSTAG),
    herzEreignis('he-marla-sand-4', 4, 'schrottmarkt', ['morgen', 'tag'], alle(AKT2, SAMSTAG)),
    herzEreignis('he-marla-sand-6', 6, 'schrottmarkt', ['morgen', 'tag'], alle(AKT2, SAMSTAG, { seen: 'he-marla-sand-4' })),
    herzEreignis('he-marla-sand-8', 8, 'schrottmarkt', ['morgen', 'tag'], alle(AKT2, SAMSTAG, { seen: 'he-marla-sand-6' })),
    herzEreignis('he-marla-sand-10', 10, 'schrottmarkt', ['morgen', 'tag'], alle(AKT2, SAMSTAG, { seen: 'he-marla-sand-8' })),
  ],
  companion: {
    // world.md §4.6: ab ♥6; §11.2: Akt 1 nur Besucherin → erst ab act2.
    recruit: alle(AKT2, { hearts: ID, min: 6 }),
    stats: {
      hp: 44, armor: 2, morale: 80,
      attributes: { technik: 4, koerper: 6, reflexe: 6, ausstrahlung: 5, strasse: 6 },
      weapon: { kind: 'fernkampf', damage: 6, range: 6, hit: 5 },
      abilities: ['marla-sandschleier', 'marla-wasser-teilen'],
    },
    heartAbilities: [{ hearts: 8, ability: 'marla-windkundig' }],
  },
  partyCheckBonus: [
    { tags: ['sandsturm', 'feilschen'], value: 1, label: 'Marla kennt den Wind' },
  ],
  talk: [
    rede('marla-sand-tag-erstes', { not: { met: ID } }),
    rede('marla-sand-tag-zeit', alle(VOR_AKT2, { notFlag: 'marla_zeit_hinweis' }), 4),
    rede('marla-sand-tag-oednis', alle(ODNIS, { seen: 'he-marla-sand-2' })),
    rede('marla-sand-tag-abend', { time: 'abend' }),
    rede('marla-sand-tag-vertraut', undefined, 3),
    rede('marla-sand-tag-morgen', { time: 'morgen' }),
    rede('marla-sand-tag-tag', { time: 'tag' }),
    rede('marla-sand-tag-standard'),
  ],
};

export const part: ContentPart = {
  npcs: { [ID]: marla },
  dialogues: sammle(
    T.erstes, T.zeit, T.oednis, T.morgen, T.tag, T.abend, T.vertraut, T.standard,
    he2, he4, he6, he8, he10,
  ),
};
