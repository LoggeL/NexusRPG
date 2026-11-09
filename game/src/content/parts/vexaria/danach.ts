// Vex × Aria „Kanal neun“ und „Erste Reihe“ (world.md §4.7, Stationen 12–13) plus Crew-Kommentare „Status zusammen“
// und „Klatsch“: einmalige Kurzszenen nach der ersten Nacht (ab dem zweiten Tag danach, höchstens eine pro Tag).
//
// Station 13 liegt im Kanon im Nachspiel (`das-meer`, Eröffnung `side-strandclub`). Akt-1-Weg (gaps/vexaria.md):
// Aria lädt zwei Tage nach Station 12 per Telefon ein, Kabelbrand spielt ein Geheimkonzert auf dem Schlickstrand unter
// der `flutmauer` (Containerbühne, Lichtertraverse). Die Kanonfassung am Meer kann später auf denselben Dialog zeigen.
import type { ContentPart } from '../../part';
import type { Condition, DailyRuleDef, DialogueDef, HeartEventDef, PhoneMessageDef } from '../../../modules/contracts';
import {
  a, AKT3, all, any, byId, ch, chk, cut, dlg, EPILOG, flag, herz, HEUTE_FREI, msg, n, node, noFlag, not, R, s, seen, set,
  STATION_START, twin, V, v, WARTEN_VORBEI, ZUSAMMEN, ZWEI_TAGE,
} from './_util';

const KAS = 'KANAL 9 · Kas (Aufnahme): „Schrapnell eins an alle: Nicht anhalten. Nicht umdrehen. Wir sehen uns im Ziel.“';

// ---------------------------------------------------------------------------
// Station 12 · rom-vexaria-funkmast · „Kanal neun“

const funkmast = (id: string, rom: boolean): DialogueDef => dlg(id, [
  node('start', [
    n('Der alte Funkmast über den Lötgassen. Sonnenuntergang, kein Regen. Rostige Sprossen, vierzig Meter, oben eine Plattform aus Gitterrost, auf der die Tauben von Opa Gurrmann wohnen.'),
  ], {
    effects: STATION_START,
    choices: [
      ch('Hochklettern.', 'nachricht', { when: flag('vexaria_morgen_gegangen') }),
      ch('Hochklettern.', 'klettern', { when: noFlag('vexaria_morgen_gegangen') }),
    ],
  }),
  node('nachricht', [
    n('Dein Telefon summt, bevor du die erste Sprosse anfasst. Aria, die drei Meter hinter dir steht und tippt, statt zu reden.'),
    a('(Telefon) Heute bleibst du bis zum Ende. Versprochen?', 'besorgt'),
    v('Versprochen.'),
    n('Sie steckt das Telefon weg und grinst, als hätte sie gerade einen Vertrag unterschrieben.'),
  ], { next: 'klettern' }),
  node('klettern', [
    n('Du kletterst vor. Aria hinterher. Auf halber Höhe hörst du sie fluchen: Der Zerberster hängt schwer an der Sprosse, die Silberfinger rutschen am Rost ab, ihr Stiefel tritt ins Leere.'),
    n('Du sagst nichts. Du greifst nach unten, packst sie mit der Metallhand am Gürtel, an der runden Silberschnalle, und ziehst. Zwanzig Kilo Arm, sechzig Kilo Aria. Dein Ellbogen summt. Er hält.'),
    a(rom ? 'Wenn du mich so am Gürtel packst, Postbotin, vergess ich, dass wir auf \'nem Mast hängen.' : 'Danke. Sag\'s keinem. Ich hab \'nen Ruf.', rom ? 'verlegen' : 'freude'),
    n('Oben. Die Plattform knarzt. Der Wind riecht nach Lötzinn und Taubendreck. An den Streben hängen Armbänder. Dutzende. Stoff, Leder, Kabelbinder, ausgeblichen von Jahren Sonne und Regen.'),
    a('Was ist das alles?', 'ueberrascht'),
    v('Kuriere, die aufgehört haben. Kas hat das eingeführt. Wer geht, bindet sein Band an den Mast. Damit man weiß, dass er nicht verschwunden ist. Nur weg.', 'neutral'),
    a('Und wo ist seins?', 'trauer'),
    v('Gibt keins. Er hat nicht aufgehört. Er ist nur … nicht mehr gekommen.', 'trauer'),
    n('Du ziehst den Kurierfunk vom Gürtel. Du drehst auf Kanal 9. Du gibst ihn ihr.'),
    n(KAS),
    n(KAS),
    a('Der klingt wie du. Nur mit mehr Wörtern.', 'trauer'),
    n('Sie hält den Funk in der echten Hand und sagt lange nichts. Die Schleife läuft. Nicht anhalten. Nicht umdrehen. Und irgendwo zwischen der dritten und der vierten Wiederholung bricht in dir was durch, das seit zwei Jahren hinter einem Rolltor gelegen hat.'),
    v('Ich bin so scheißwütend auf ihn. Er gibt mir \'ne Regel und haut ab. Wer macht das? Wer gibt einem \'ne Regel und haut ab?', 'wut'),
    v('Ich hab gewonnen. Das Rennen. Ich hab das Scheißrennen gewonnen.', 'trauer'),
    n('Du heulst. Richtig. Rotz, Krach, Schultern, alles. Du hast nicht geheult, als du runtergeklettert bist. Nicht bei Ripper. Nicht bei der Beerdigung, zu der keiner kam.'),
    n('Aria hält dich. Mit beiden Armen. Auch mit dem Zerberster, vorsichtig und fest, die silbernen Finger flach auf deinem Rücken, als würde sie ein Ei halten, das sie auf keinen Fall zerdrücken darf.'),
    a('Ich halt. Ich kann das.', rom ? 'zaertlich' : 'trauer'),
    a('Weißt du, was ich mit dem Ding noch nie gemacht hab? Jemanden festgehalten. Ohne dass was kaputtgeht.', 'trauer'),
    ...(rom ? [
      a('Die Brecherin hält dich grad fest, Vex. Merk dir das. Ich merk\'s mir auch.', 'zaertlich'),
    ] : [
      a('Crew hält. Das ist der Job.', 'trauer'),
    ]),
  ], { effects: [{ cutscene: rom ? 'rom-vexaria-funkmast' : 'rom-vexaria-funkmast-fs' }] }),
]);

const funkmastSchleife = (id: string, rom: boolean): DialogueDef => dlg(id, [
  node('start', [
    n('Irgendwann ist es dunkel. Die Schleife läuft noch. Du nimmst den Funk zurück. Dein Daumen liegt auf der Sprechtaste.'),
  ], {
    choices: [
      ch('Drübersprechen.', 'neu'),
      ch('Abschalten.', 'aus'),
      ch('Laufen lassen. Noch nicht.', 'noch'),
    ],
  }),
  node('neu', [
    v('Schrapnell zwei an alle. Ich halt an. Ab und zu. Wenn einer ruft.', 'trauer'),
    v('… Wir sehen uns im Ziel, Kas. Ich hab\'s nicht eilig.', 'neutral'),
    n('Du lässt die Taste los. Die Schleife läuft weiter: Kas\' Satz. Dann deiner. Dann wieder Kas. Zwei Stimmen auf Kanal 9. Zum ersten Mal.'),
  ], { effects: [set('vexaria_funkmast_neu')], next: 'baender' }),
  node('aus', [
    v('Tschüss, Großer.', 'trauer'),
    n('Klick. Stille. Nur die Tauben, die sich auf der Strebe zurechtgurren.'),
    a('War das richtig?', 'besorgt'),
    v('Weiß nicht. Fühlt sich leicht an. Ich hasse das.', 'neutral'),
  ], { effects: [set('vexaria_funkmast_aus')], next: 'baender' }),
  node('noch', [
    v('Noch nicht.', 'trauer'),
    a('Okay. Wir kommen wieder her. Ich komm mit.', rom ? 'zaertlich' : 'neutral'),
  ], { effects: [set('vexaria_funkmast_noch')], next: 'baender' }),
  node('baender', [
    n('Du streifst eins von Kas\' schwarzen Armbändern vom Metallhandgelenk. Du trägst drei. Hast du immer. Du knotest es an die Strebe, zwischen die anderen. Das erste für ihn.'),
    n('Das zweite bindest du Aria ums rechte Handgelenk. Das echte. Du ziehst den Knoten mit den Zähnen fest.'),
    a('Ich nehm\'s nicht ab. Auch nicht unter der Dusche. Auch nicht, wenn\'s stinkt.', 'trauer'),
    n('Dann holst du ein zweites Funkgerät aus der Weste. Kurierfunk, verschrammt, mit Panzertape um den Akku. Du drehst den Schalter fest auf 9 und klebst ihn mit Tape fest.'),
    v(rom ? 'Kanal neun. Da bin ich. Auf der Party, nach der Party. Immer.' : 'Kanal neun. Wenn\'s brennt. Da bin ich.', rom ? 'zaertlich' : 'neutral'),
    a('Du gibst mir Kas\' Kanal.', 'ueberrascht'),
    a('Okay. Okay, ich heul nicht. Mir ist was ins Auge geflogen. \'Ne Taube.', rom ? 'zaertlich' : 'freude'),
  ], {
    effects: [
      set('vexaria_funkmast'), { give: 'kas-armband' }, { give: 'funk-kanal-neun' }, herz(60), ...ZWEI_TAGE,
      ...(rom ? [set('vexaria_rueckendeckung'), msg('Duo-Passiv „Rückendeckung“ freigeschaltet.')] : []),
    ],
  }),
]);

// ---------------------------------------------------------------------------
// Station 13 · rom-vexaria-konzert · „Erste Reihe“ (Akt-1-Weg: Geheimkonzert am Schlickstrand)

const konzert = (id: string, rom: boolean): DialogueDef => dlg(id, [
  node('start', [
    n('Der Schlickstrand unter der Flutmauer. Aus drei Containern und einem Gerüst hat jemand eine Bühne gebaut, darüber hängt eine Traverse mit Scheinwerfern, festgezurrt mit Schellen. Hunderte Leute im Sand, Bier in Eimern, Feuertonnen. Auf dem Banner, schief gesprüht: KABELBRAND. NUR HEUTE.'),
    n('Bevor Aria was sagen kann, bist du schon oben. Am Gerüst. Unaufgefordert. Du rüttelst an jeder Schelle, eine nach der anderen.'),
    a('Komm runter, du Spinnerin!', 'wut'),
  ], {
    effects: STATION_START,
    choices: [
      ch('Jede Schelle nachziehen. Alle vierzig.', 'geruest-gut', { check: chk(`vexaria-konzert-reflexe${rom ? '' : '-fs'}`, 'reflexe', 6, ['dach', 'klettern']), effects: [herz(20), set('vexaria_konzert_geruest')] }),
      ch('Kurz rütteln. Runter.', 'geruest'),
    ],
  }),
  node('geruest-gut', [
    v('Alles neu. Alle vierzig Schellen.', 'freude'),
    n('Du ziehst jede nach, mit der Metallhand, bis der Stahl quietscht. Eine Roadie-Frau mit Stirnlampe sieht dir zu und sagt: „Willst du \'n Job?“'),
    a('… Danke.', rom ? 'zaertlich' : 'freude'),
  ], { next: 'eingang' }),
  node('geruest', [
    v('Hält. Meistens.'),
    a('MEISTENS? Komm sofort runter!', 'besorgt'),
  ], { next: 'eingang' }),
  node('eingang', rom ? [
    n('Am Eingang, zwischen zwei Paletten, steht ein Türsteher mit Hals wie ein Hydrant. Aria hält ihm deinen Pass unter die Nase.'),
    s('narrator', 'Türsteher: „Der Pass ist von dreiundachtzig.“'),
    a('Der gilt. Ich bin die Ausstellerin.', 'signatur'),
    n('Er sieht den Pass an. Dann den Zerberster. Dann tritt er zur Seite.'),
    v('Fühlt sich falsch an. Vordertür. Wie \'ne Falle.', 'ueberrascht'),
  ] : [
    n('Am Eingang, zwischen zwei Paletten, steht ein Türsteher mit einer Liste.'),
    s('narrator', 'Türsteher: „Gästeliste. … Crew Hunter. Natürlich. Rein mit euch, bevor er anruft.“'),
    a('Siehst du, Rennsemmel? Vordertür. Wir sind VIP.', 'signatur'),
    s('vega', 'Ich hab drei Fluchtwege markiert. Nur damit ihr\'s wisst.', 'neutral'),
  ], { next: 'klappern' }),
  node('klappern', [
    n('Die Band stimmt. Die Leute schreien. Und dann, hinter dem letzten Container, bleibt Aria stehen.'),
    n('Der Wind kommt vom Meer. Die Scheinwerfer an der Traverse klappern. Ganz leise. Metall auf Metall.'),
  ], {
    choices: [
      ch('Weiter.', 'still', { when: flag('vexaria_konzert_geruest') }),
      ch('Weiter.', 'angst', { when: noFlag('vexaria_konzert_geruest') }),
    ],
  }),
  node('still', [
    n('Sie lauscht. Das Klappern kommt nicht. Die Schellen halten alles fest, jede einzelne.'),
    a('Hörst du was? Ich hör … nix. Ich hör NIX.', 'ueberrascht'),
    a('Trotzdem. Scheiße. Mir zittern die Knie.', 'besorgt'),
  ], { next: 'meter' }),
  node('angst', [
    a('Das Klappern. Hörst du das? Die Lichter. Scheiße. Scheiße, ich kann nicht –', 'besorgt'),
    n('Ihre Metallhand zittert. Du siehst es. Ihre echte zittert mehr.'),
  ], { next: 'meter' }),
  node('meter', [
    n('Du sagst nichts. Du stellst dich nur neben sie. Schulter an Schulter.'),
    v(rom ? 'Hundert Meter. Sag, wenn wir gehen.' : 'Hundert Meter. Sagt, wenn wir gehen.', 'neutral'),
    a('… Neunzig.', 'trauer'),
    n('Ihr geht. Zehn Meter.'),
    a(rom ? 'Achtzig. Gib mir deine Hand. Die echte. Also meine echte. Du weißt schon.' : 'Achtzig. Vega, nimm meinen anderen Arm. Den, der nix spürt. Halt ihn trotzdem.', rom ? 'verlegen' : 'trauer'),
    n('Siebzig. Fünfzig. Dreißig. Die Bässe gehen dir in die Rippen. Dann bist du am Absperrgitter. Erste Reihe. Aria schreit.'),
    a('ICH BIN AUF \'NEM KONZERT! ICH BIN AUF \'NEM SCHEISSKONZERT!', 'freude'),
    n('Sie springt. Sie singt jedes Lied mit. Falsch. Genau so falsch wie Kas.'),
    n('Dann, zum Schluss, tritt die Sängerin ans Mikro. Kabelbrand, die Haare grau, die Stimme wie ein Kiesweg.'),
    s('narrator', 'Sängerin: „Das letzte. Für alle, die immer vorher abhauen. Die letzte Strophe kennt keiner. Die Leute hauen immer vorher ab.“'),
    n('„Nicht anhalten“. Kas\' Lied. Du kennst jede Zeile. Bis zur letzten Strophe. Die hast du nie gehört. Ihr musstet immer vorher vom Dach, vor dem Sicherheitsdienst.'),
    n('Die Sängerin singt sie. Leise. Nicht anhalten, nicht umdrehn – außer einer ruft nach dir.'),
    n('Du drehst dich um. Zu ihr.'),
    v('Die kannte er nicht. Die Strophe. Er ist immer vorher gerannt.', 'trauer'),
    v(rom ? 'Ich halt an. Wenn du rufst.' : 'Ich halt an. Wenn ihr ruft.', rom ? 'zaertlich' : 'neutral'),
    ...(rom ? [
      a('Dann ruf ich. Jeden Tag. Bis du\'s satt hast.', 'zaertlich'),
      a('Und dann noch länger. Ich bin laut.', 'signatur'),
    ] : [
      a('Dann rufen wir. Beide. Bis du\'s satt hast.', 'freude'),
      s('vega', 'Ich ruf leiser. Aber genauer.', 'neutral'),
    ]),
  ], {
    choices: rom ? [
      ch('Sie küssen. Mitten im Lichtgewitter.', 'kuss', { effects: [herz(40)] }),
      ch('Aria auf die Schultern heben.', 'schultern', { effects: [herz(40)] }),
      ch('Nur die Hand fester halten.', 'hand', { effects: [herz(40)] }),
    ] : [
      ch('Aria auf die Schultern heben.', 'schultern', { effects: [herz(40)] }),
      ch('Den Arm um beide legen.', 'beide', { effects: [herz(40), { relation: 'vega', delta: 20 }] }),
    ],
  }),
  node('kuss', [
    n('Du ziehst sie an den Gurtriemen ihrer eigenen Tasche zu dir. Mitten im Licht, mitten im Lärm. Sie schmeckt nach Bier und Salz und Kirsche, und sie lacht dir in den Mund, und dann lacht sie nicht mehr, sondern küsst zurück, die Zerberster-Finger in deinem Gurtzeug, als würde sie dich nie wieder loslassen.'),
    n('Irgendwo hinter euch ruft Collin Charleston „EXKLUSIV!“ in eine Kamera.'),
    s('delya-delloraine', 'Ich nenne keine Namen. Aber ich hab Fotos.', 'signatur'),
  ], { next: 'strand' }),
  node('schultern', [
    n('Du gehst in die Knie. Sie kapiert sofort. Ein Ruck, und sie sitzt auf deinen Schultern, und dein Ellbogen kreischt, und es ist dir egal.'),
    n('Aria reckt die Metallfaust über die Menge. Das Scheinwerferlicht bricht sich in der Silberschale.'),
    a('ICH BIN WIEDER DA, IHR ARSCHLÖCHER!', 'freude'),
    v('Du wiegst \'ne Tonne.', 'signatur'),
    a('Halt die Klappe und halt mich fest.', rom ? 'zaertlich' : 'freude'),
  ], { next: 'strand' }),
  node('hand', [
    n('Du drückst ihre Hand. Fester. Sie drückt zurück.'),
    a('Ich weiß. Ich weiß. Ich auch.', 'zaertlich'),
  ], { next: 'strand' }),
  node('beide', [
    n('Arm in Arm. Du, Aria, Vega. Erste Reihe. Vega singt nicht mit. Vega bewegt nur die Lippen. Bei der letzten Strophe nicht mal mehr das.'),
  ], { next: 'strand' }),
  node('strand', [
    n('Später. Die Feuertonnen brennen runter. Ihr sitzt im Sand, den Rücken an eine Bühnenkiste gelehnt. Das Meer schwappt an den Schlick, schwarz und geduldig.'),
    a('Weißt du, was ich heute nicht bin? Die Brecherin. Und du bist heute nicht auf der Flucht.', rom ? 'zaertlich' : 'freude'),
    v('Nee. Ich steh einfach rum. Mit dir. Ist geil.', 'freude'),
  ], {
    choices: [
      ch('Zum Wellenbrecher.', 'spalt', { when: all(flag('vexaria_luecke_gemieden'), noFlag('vexaria_luecke_gesprungen')) }),
      ch('Sitzen bleiben.', 'ende'),
    ],
  }),
  node('spalt', [
    n('Der Wellenbrecher. Betonblöcke, und zwischen zweien ein Spalt, einen Meter breit. Darunter Wasser.'),
    a('Ist keine Lücke. Ist \'n Witz von \'ner Lücke.', 'signatur'),
    a('Springen?', 'zaertlich'),
  ], {
    choices: [
      ch('Springen.', 'gesprungen', { effects: [set('vexaria_luecke_gesprungen')] }),
      ch('„Nächstes Mal.“', 'ende'),
    ],
  }),
  node('gesprungen', [
    n('Du springst. Einen Meter. Lächerlich. Deine Knie zittern trotzdem. Drüben fängt sie dich auf, mit beiden Armen.'),
    v('Hey, Kas.', 'trauer'),
  ], { next: 'ende' }),
  node('ende', [
    n('Am nächsten Morgen steht es auf jedem Bildschirm der Unterstadt. Collin Charleston, live, mit Sand in der Frisur:'),
    s('collin-charleston', rom
      ? 'Unterstadt-Brecherin und Dachkurierin in der ersten Reihe gesichtet. Verletzte: keine. Gekreische: ja. Gerissene Schnallen: eine.'
      : 'Unterstadt-Brecherin und Dachkurierin in der ersten Reihe gesichtet. Verletzte: keine. Gekreische: ja.', 'freude'),
  ], { effects: [set('vexaria_konzert'), { relation: 'collin-charleston', delta: 10 }] }),
]);

// ---------------------------------------------------------------------------
// Crew-Kommentare und Weltleben („Status zusammen“, nur Vex/Aria)

const kommentar = (id: string, lines: DialogueDef['nodes'][number]['lines']): DialogueDef => dlg(id, [node('start', lines)]);

const kommentare: DialogueDef[] = [
  kommentar('vexaria-kiki-taxi', [
    n('Ein Taxi rollt im Schritttempo neben dir her. Das Fenster ist offen, der Taxifunk plärrt.'),
    s('kiki-karbon', 'Kurs liegt an: Unterstadt, zwei Insassen, und die Rückbank wurde nicht mal gebraucht!', 'freude'),
    v('Fahr weiter, Kiki.', 'wut'),
    s('kiki-karbon', 'Ich fahr ja! Ganz langsam! Damit ich alles erzählen kann!', 'freude'),
  ]),
  kommentar('vexaria-kuschel-zettel', [
    n('Auf deinem Kissen im Quartier liegt ein Zettel. Krakelige Schrift, ein Pfotenabdruck als Unterschrift. Captain Kuschel sitzt daneben, schnüffelt an deinem Ärmel und niest.'),
    n('„Das Gurtzeug lag auf dem Boden. Das Gurtzeug liegt nie auf dem Boden. – C. K.“'),
  ]),
  kommentar('vexaria-gurrmann-mast', [
    s('opa-gurrmann', 'Ihre Tauben fragen, warum am Mast jetzt zwei sitzen. Ich hab gesagt: Frühling.', 'freude'),
    s('opa-gurrmann', 'Die Tauben haben gesagt, es ist Herbst. Die Tauben sind sehr klug.', 'neutral'),
  ]),
  kommentar('vexaria-kanal4-paket', [
    n('Dein Funk knackt. Kanal 4.'),
    n('KANAL 4 · Kurier Zwölf: „Chefin, Paket für dich. Absender: ‚dein Stern‘. Es tickt.“'),
    n('KANAL 4 · Kurier Sieben-Neun: „Ich heul immer noch.“'),
    v('Ihr seid alle gefeuert.', 'wut'),
    n('KANAL 4 · Kurier Zwölf: „Du kannst uns nicht feuern, Chefin. Wir sind selbstständig. Und wir lieben dich.“'),
  ]),
  kommentar('vexaria-ripper-zuzweit', [
    s('ripper', 'Kurierin und Brecherin. Liefert ihr jetzt zu zweit? Ich hätt\' da \'n Paket.', 'signatur'),
    s('ripper', 'Und sind alle Implantate noch dran? Ich frag aus geschäftlichem Interesse. Rein geschäftlich.', 'signatur'),
    a('Verpiss dich, Ripper.', 'wut'),
    s('ripper', 'Schätzchen. Ich bin hier Stammgast.', 'freude'),
  ]),
  kommentar('vexaria-dante-werkbank', [
    s('dante', 'Ihr zwei. Auf meiner Werkbank. Wenn ich da noch mal Kronkorken finde, bau ich euch beiden Klingeln ein.', 'verlegen'),
    s('dante', '… Kleine. Hübsche. Mit Melodie.', 'freude'),
  ]),
  kommentar('vexaria-bude-heim', [
    n('Die Kurierbude. Zwei Kronkorken, zwei Becher, ein Foto, ein Pass an der Wand, ein Konzertbändchen. Kein leerer Fleck mehr.'),
    v('Hier wohnt jetzt einer.', 'freude'),
  ]),
];

// ---------------------------------------------------------------------------
// Klatsch nach der ersten Nacht (nur Vex/Aria). Die Nacht selbst kommt nie vor: nur Hals, Schnallen, Wellblech, Gerede.
//
// Ablauf: Tageswechsel nach der ersten Nacht → `vexaria_klatsch_warte`, nächster Tageswechsel → `vexaria_klatsch_bereit`
// (das Frühstück am Morgen danach bleibt Hunters, Dantes, Vegas und Rippers erster Auftritt). Danach höchstens eine
// Szene pro Tag (`vexaria_klatsch_heute`, fällt jeden Morgen), nie an einem Stationstag, nie im Streit, bis Akt 3.

const KLATSCH: Condition = all(
  V, flag('vexaria_nacht'), flag('vexaria_klatsch_bereit'), noFlag('vexaria_klatsch_heute'), noFlag('aria_heute'),
  noFlag('aria_romanze_streit'), noFlag('vexaria_fruehstueck'), not(AKT3), not(EPILOG),
);
/** Aria läuft frei herum (Akt-2-Variante A: gechippt, bis Vex sie rettet). */
const ARIA_DA: Condition = any(noFlag('aria_gechippt'), flag('vexaria_gerettet'));
const KLATSCH_HEUTE = [set('vexaria_klatsch_heute')];
const enter = (map: string, id: string) => seen(`enter:${map}:${id}`);

const klatschDaily: DailyRuleDef[] = [
  // Reihenfolge zählt: erst warte → bereit, dann Nacht → warte (sonst springt alles am selben Morgen durch).
  { id: 'vexaria-klatsch-bereit', when: flag('vexaria_klatsch_warte'), effects: [set('vexaria_klatsch_warte', false), set('vexaria_klatsch_bereit')] },
  {
    id: 'vexaria-klatsch-start', when: all(V, flag('vexaria_nacht'), noFlag('vexaria_klatsch_warte'), noFlag('vexaria_klatsch_bereit')),
    effects: [set('vexaria_klatsch_warte')],
  },
  { id: 'vexaria-klatsch-tag', when: flag('vexaria_klatsch_heute'), effects: [set('vexaria_klatsch_heute', false)] },
];

// --- Hunter: Kaffee, Hals, Schal (high-voltage, morgens an der Kasse)
const klatschHunter: DialogueDef = dlg('vexaria-klatsch-hunter', [
  node('start', [
    n('Das High Voltage am Morgen. Stühle auf den Tischen, die Kaffeemaschine röchelt. Hunter steht an der Kasse und zählt Wechselgeld, ohne aufzusehen. Er schiebt dir einen Becher über den Tresen. Schwarz. Ungefragt.'),
    s('hunter', 'Geht aufs Haus.', 'neutral'),
    n('Dann sieht er doch auf. Nicht in dein Gesicht. Tiefer. Links am Hals, knapp über dem Top, da, wo das Gurtzeug nicht hinkommt. Er nimmt die Sonnenbrille ab. Er setzt sie wieder auf.'),
    s('hunter', 'Postbotin. Du hast da was.', 'signatur'),
    v('Wo?', 'ueberrascht'),
    s('hunter', 'Hals. Rund. Ungefähr so groß wie ein Kronkorken. Ich tipp auf Kirschgeschmack, aber ich bin kein Fachmann.', 'neutral'),
  ], {
    choices: [
      ch('Am Top hochziehen. Irgendwas hochziehen.', 'kragen'),
      ch('„Taube.“', 'taube'),
      ch('„Willst du Details, Chef?“', 'details', { effects: [{ relation: 'hunter', delta: 5 }] }),
    ],
  }),
  node('kragen', [
    n('Du ziehst am Top. Das Top hat keinen Kragen. Du ziehst trotzdem, und die Metallfinger machen es nicht besser, nur schief.'),
    s('hunter', 'Hilft nicht. Versuch\'s mit dem Gurtzeug. Ach nee. Das hat ja jetzt \'ne Lücke.', 'signatur'),
    v('Halt die Klappe, Hunter.', 'verlegen'),
  ], { next: 'schal' }),
  node('taube', [
    v('Taube. Opa Gurrmanns. Die sind aggressiv.', 'signatur'),
    s('hunter', 'Eine Taube. Mit Lippen.', 'neutral'),
    s('hunter', 'Sag der Taube, sie soll nächstes Mal irgendwo picken, wo ein Kragen drüber ist. Ich hab Gäste mit schwachen Nerven und einen Ruf als seriöser Betrieb.', 'signatur'),
  ], { next: 'schal' }),
  node('details', [
    s('hunter', 'Gott. Nein.', 'ueberrascht'),
    s('hunter', 'Ich hab drei Jahre gebraucht, um zu vergessen, was Dante mir über seinen Toaster erzählt hat. In meinem Kopf ist kein Platz mehr. Da wohnt jetzt der Toaster.', 'neutral'),
    v('Schade. Ist \'ne gute Geschichte. Kommt ein Rolltor drin vor.', 'signatur'),
    s('hunter', 'Trink deinen Kaffee.', 'neutral'),
  ], { next: 'schal' }),
  node('schal', [
    n('Hinter dir knallt die Tür. Aria kommt rein, gähnt wie ein Hafenkran, nimmt dir den Becher aus der Hand und trinkt ihn halb leer. Sie trägt einen Schal. Einen dicken, grauen, zweimal um den Hals gewickelt. Draußen sind zweiundzwanzig Grad.'),
    s('hunter', 'Schöner Schal, Brecherin.', 'neutral'),
    a('Halt\'s Maul, Hunter.', 'verlegen'),
    n('Sie sieht deinen Hals. Sie sieht ihn eine Sekunde zu lang an. Dann grinst sie in den Becher, sehr zufrieden mit sich, und zieht den Schal noch ein Stück höher.'),
    s('hunter', 'Zwei Kaffee, zwei Hälse. Ich mach euch Mengenrabatt. Und jetzt raus aus meinem Morgen, bevor ich sentimental werde.', 'signatur'),
  ]),
]);

// --- Dante: die Schnalle (dantes-werkstatt, tagsüber an der Werkbank)
const klatschDante: DialogueDef = dlg('vexaria-klatsch-dante', [
  node('start', [
    n('Dantes Werkstatt. Der Plattenspieler läuft, irgendwas mit Bläsern. Dante steht an der Werkbank, die Schutzbrille auf der Stirn, und sagt nicht „Hallo“. Er sagt gar nichts. Er streckt nur die Hand aus. Fordernd.'),
    v('Was?', 'ueberrascht'),
    s('dante', 'Gurtzeug.', 'neutral'),
    n('Er wartet. Er wartet so lange, bis du es ausziehst. Zehn Schnallen. Er legt es auf die Werkbank, glatt, wie einen Patienten, und fährt mit dem Daumen über die Stelle an der linken Schulter, wo die elfte war. Ein abgerissener Steg. Zwei aufgebogene Ösen. Silberne Kratzer im Leder, fünf nebeneinander.'),
    n('Er sagt immer noch nichts. Er nimmt eine neue Schnalle aus der Schürzentasche. Schwarz brüniert, frisch gedreht, mit einem winzigen eingravierten Zickzack. Ein Dach.'),
    s('dante', 'Die alte hängt an ihrem Gürtel. Weiß die ganze Unterstadt. Kiki hat\'s im Taxifunk durchgesagt. Zweimal. Mit Wetterbericht.', 'signatur'),
  ], {
    choices: [
      ch('Nicken. „Mach.“', 'nieten', { effects: [set('vexaria_schnalle_neu'), { relation: 'dante', delta: 10 }] }),
      ch('„Lass die Lücke.“', 'luecke', { effects: [herz(10)] }),
    ],
  }),
  node('nieten', [
    n('Kein Wort mehr. Er setzt die Schnalle an, nimmt den Niethammer. Drei Schläge. Pling. Pling. Pling. Dann packt er die Schnalle mit beiden Händen und zieht, mit seinem ganzen Gewicht, bis die Werkbank wackelt und Captain Kuschel vom Regal kippt. Sie hält.'),
    s('dante', 'Die hält jetzt zwei Tonnen Zug.', 'neutral'),
    s('dante', 'Für den Fall, dass wieder eine Brecherin dran rumreißt. Nächstes Mal reißt ihr bitte was, das ich nicht nieten muss. Den Türrahmen. Das Rolltor. Mich nicht. Ich hab ein schwaches Herz und sehr gute Ohren.', 'signatur'),
    v('Dante.', 'verlegen'),
    s('dante', 'Elf. Wie neu. Heiliges Kanonenrohr, ich bin ein Künstler.', 'freude'),
  ]),
  node('luecke', [
    n('Dante sieht dich an. Lange. Dann legt er die neue Schnalle in eine kleine Blechdose, klappt den Deckel zu und schiebt sie dir über die Werkbank.'),
    s('dante', 'Romantikerin. Wusst ich\'s doch. Unter dem ganzen Leder bist du ein Poesiealbum mit Nieten.', 'freude'),
    s('dante', 'Behalt sie. Für den Tag, an dem du sie brauchst. Oder für den Tag, an dem die Brecherin die nächste abreißt. Ich würd sagen, Donnerstag.', 'signatur'),
    v('Wenn du das irgendwem erzählst …', 'wut'),
    s('dante', 'Wem denn? Captain Kuschel weiß es schon. Der hat\'s mir erzählt.', 'neutral'),
  ]),
]);

// --- Kiki: zählt laut nach (neon-gasse, abends/nachts am Taxi; nach dem Taxi-Kommentar)
const klatschKiki: DialogueDef = dlg('vexaria-klatsch-kiki', [
  node('start', [
    n('Der Vorplatz der Neon-Gasse. Kikis Taxi steht quer über zwei Parkplätzen, Warnblinker an. Vier Leute warten auf eine Fahrt. Kiki fährt keinen. Kiki lehnt am Kotflügel und sieht dich kommen, als hätte sie seit drei Tagen auf genau diesen Moment gewartet.'),
    s('kiki-karbon', 'STOPP! Stehen bleiben! Arme hoch! Nicht schießen, ich zähl nur!', 'freude'),
    n('Sie zeigt mit dem Finger auf deine Brust. Auf die Schnallen.'),
    s('kiki-karbon', 'Eins. Zwei. Drei. Vier …', 'freude'),
  ], {
    choices: [
      ch('Stehen bleiben. Arme hoch. Zählen lassen.', 'zaehlen'),
      ch('Einfach weitergehen.', 'weiter'),
    ],
  }),
  node('zaehlen', [
    n('Du bleibst stehen. Du hebst die Arme, die echte und die schwarze. Die vier Leute in der Schlange zählen mit. Ein Typ mit Einkaufswagen zählt mit. Eine Taube auf der Leuchtreklame guckt zu.'),
    s('kiki-karbon', 'Fünf! Sechs! Sieben! Acht! Neun!', 'freude'),
  ], {
    choices: [
      ch('Weiter.', 'zehn', { when: noFlag('vexaria_schnalle_neu') }),
      ch('Weiter.', 'elf', { when: flag('vexaria_schnalle_neu') }),
    ],
  }),
  node('zehn', [
    s('kiki-karbon', 'ZEHN! ZEHN, Leute! Ihr habt\'s gehört! Ich hab gesagt zehn! Wer hat gegen mich gewettet? Zahlen, ihr Geizkragen!', 'freude'),
    n('Die Schlange stöhnt. Münzen wandern. Der Typ mit dem Einkaufswagen zahlt in Pfandbons.'),
    a('Elf, du Schwätzerin.', 'signatur'),
    n('Aria. Hinter Kiki, die Hände in den Taschen. Sie zieht die Jacke ein Stück zur Seite. An ihrem Gürtel, neben der runden Silberschnalle, baumelt eine kleine schwarze.'),
    a('Die elfte hab ich. Die bleibt bei mir.', 'verlegen'),
    s('kiki-karbon', 'Die zählt nicht! Die ist ausgewandert! Das ist Steuerflucht!', 'wut'),
  ], { next: 'ende' }),
  node('elf', [
    s('kiki-karbon', 'Zehn … elf. … ELF?!', 'ueberrascht'),
    s('kiki-karbon', 'Wer hat da genietet? Das ist Beweisvernichtung! Das war DANTE! Ich ruf meinen Anwalt! Ich hab keinen Anwalt! Ich ruf Collin!', 'wut'),
    n('Die Schlange jubelt. Münzen wandern, in die andere Richtung. Kiki zahlt jeden einzeln aus und flucht dabei in drei Sprachen und einer Hupe.'),
    a('Und die alte hab ich. Macht zwölf. Rechne nach.', 'signatur'),
    n('Aria. Hinter Kiki, die Hände in den Taschen, die kleine schwarze Schnalle am Gürtel, gut sichtbar.'),
  ], { next: 'ende' }),
  node('weiter', [
    n('Du gehst weiter. Kiki läuft rückwärts vor dir her und zählt, die Finger ausgestreckt, wie ein Schiedsrichter.'),
    s('kiki-karbon', 'Fünf! Sechs! Bleib stehen, du verwackelst! Sieben … oder war das schon sieben?! Mist!', 'wut'),
    s('kiki-karbon', 'Gut. Gut! Dann frag ich die Brecherin. Die weiß es GENAU. Die hat ja jede einzeln …', 'freude'),
    v('Wenn du sie fragst, bist du tot.', 'wut'),
    s('kiki-karbon', 'Ich frag sie per Taxifunk! Da kannst du mich nicht hauen!', 'freude'),
    a('Ich hör dich, Kiki. Ich steh direkt hinter dir.', 'signatur'),
    n('Kiki dreht sich um. Kiki sieht den Zerberster. Kiki ist sehr schnell in ihrem Taxi.'),
  ], { next: 'ende' }),
  node('ende', [
    n('Aria hakt sich bei dir ein, mit dem Metallarm, schwer und kühl an deinem nackten Arm, und zieht dich weiter, Richtung Lötgassen.'),
    a('Die ganze Stadt zählt deine Schnallen, Rennsemmel. Ich bin so stolz. Ich bin auch so rot. Guck mich nicht an.', 'verlegen'),
  ], {
    choices: [
      ch('Sie trotzdem angucken.', undefined, { effects: [herz(10)] }),
      ch('„Ich zähl deine auch mal. Wenn keiner guckt.“', undefined, { effects: [herz(10)] }),
    ],
  }),
]);

// --- Vega: die Kurve (high-voltage, abends am Tisch von Vega und Aria)
const klatschVega: DialogueDef = dlg('vexaria-klatsch-vega', [
  node('start', [
    n('Der Tisch hinten links. Vegas und Arias Tisch. Vega sitzt allein da, vor sich ein Glas Wasser und ein Blatt Millimeterpapier. Darauf eine Kurve. Mit Lineal gezogen. Mit Achsenbeschriftung.'),
    s('vega', 'Setz dich. Ich hab was für dich.', 'neutral'),
    n('Sie dreht das Blatt um. X-Achse: Uhrzeit. Y-Achse: Dezibel. Oben drüber, in Druckbuchstaben: LÖTGASSEN. KURIERBUDE. WELLBLECH.'),
    s('vega', 'Ich wohn zwei Dächer weiter. Ich hab ein Messgerät. Ich hatte Langeweile. Das ist keine gute Kombination für euch.', 'neutral'),
    v('Vega. Nein.', 'wut'),
    s('vega', 'Keine Sorge. Ich interpretier nichts. Ich mess nur.', 'signatur'),
    s('vega', 'Spitzenwert zweiundsiebzig Dezibel. Zum Vergleich: Kikis Hupe hat achtundneunzig. Ihr habt also noch Luft nach oben. Falls ihr ehrgeizig seid.', 'neutral'),
  ], {
    choices: [
      ch('Das Blatt nehmen und zerreißen.', 'reissen'),
      ch('„Wann war der Spitzenwert?“', 'spitze', { effects: [{ relation: 'vega', delta: 10 }] }),
      ch('Rot werden. Einfach nur rot werden.', 'rot'),
    ],
  }),
  node('reissen', [
    n('Du reißt es durch. Dann noch mal. Dann noch mal, bis es Konfetti ist, und die Metallknöchel klacken dabei.'),
    s('vega', 'Ich hab drei Kopien. Eine für Hunter, eine für die Akte, eine für Aria. Die weiß es nur noch nicht.', 'neutral'),
  ], { next: 'aria' }),
  node('spitze', [
    v('Und? Wann war der Spitzenwert?', 'signatur'),
    s('vega', 'Halb zwei. Das Mikrofon sagt: ein Lachen. Ihres. Dann ein Scheppern, Rolltor. Dann noch ein Lachen. Deins.', 'neutral'),
    s('vega', 'Ich bin Scharfschützin. Ich hör den Unterschied zwischen Leuten, die lachen, weil sie nervös sind, und Leuten, die lachen, weil sie sich sicher fühlen.', 'neutral'),
    s('vega', 'Das war die zweite Sorte. Bei beiden. Mehr wollte ich nicht wissen. Mehr hab ich auch nicht gemessen. Ich hab dann das Gerät ausgeschaltet. Und mich umgedreht.', 'trauer'),
  ], { next: 'aria' }),
  node('rot', [
    n('Du wirst rot. Du merkst es selbst: die Ohren, der Hals, die Stelle unter dem Gurtzeug. Deine Metallfaust schließt sich um nichts.'),
    s('vega', 'Interessant. Das hab ich bei dir noch nie gemessen.', 'ueberrascht'),
    s('vega', 'Notiert.', 'signatur'),
  ], { next: 'aria' }),
  node('aria', [
    n('Aria plumpst neben Vega auf die Bank, eine Limo in jeder Hand. Sie sieht das Millimeterpapier, oder was davon übrig ist. Sie sieht dich. Sie sieht wieder das Papier.'),
    a('Ist das … Vega. Hast du uns GEMESSEN?', 'ueberrascht'),
    s('vega', 'Achthundert Meter. Gilt für alles. Auch für Wellblech.', 'signatur'),
    a('Ich will \'ne Kopie. Für den Kühlschrank. Mit \'nem Magneten. Und ich will \'nen neuen Rekord.', 'freude'),
    v('Aria.', 'verlegen'),
    a('Was? Wir sind ehrgeizig.', 'signatur'),
  ]),
]);

// --- Lio: findet keinen Reim mehr (neon-gasse, nachts auf der Lichterkettenbank)
const klatschLio: DialogueDef = dlg('vexaria-klatsch-lio', [
  node('start', [
    n('Die Lichterkettenbank in der Neon-Gasse. Lio Funkel sitzt da, das Akkordeon auf den Knien, einen Bleistift hinterm Ohr und einen zweiten im Mund. Als er dich sieht, fällt ihm der aus dem Mund.'),
    s('lio-funkel', 'Vex! Hi! Hallo. Hi. Ich hab dich gar nicht … Ich mach nur … nichts. Ich mach Musik. Ohne Musik. Gerade.', 'verlegen'),
    n('Auf dem aufgeschlagenen Notenheft steht in großen Buchstaben: BALLADE VOM EISENARM, TEIL ZWEI. Darunter ist alles durchgestrichen. Dick. Mehrfach. An einer Stelle ist das Papier durch.'),
    v('Teil zwei?', 'signatur'),
    s('lio-funkel', 'Nein. Es gibt keinen Teil zwei. Ich hab Reime gesucht. Auf „Schnalle“. Es gibt nur „Falle“, „Halle“, „alle“. Und dann kam „Knalle“, und dann hab ich den Bleistift weggelegt und bin ganz allein auf einer Bank rot geworden. Nachts. Ich bin ein erwachsener Mann.', 'verlegen'),
  ], {
    choices: [
      ch('Das Notenheft nehmen.', 'heft', { effects: [{ relation: 'lio-funkel', delta: 10 }] }),
      ch('„Reim mal auf ‚Wellblech‘. Viel Spaß.“', 'wellblech'),
      ch('Ihm die Metallhand auf die Schulter legen.', 'schulter'),
    ],
  }),
  node('heft', [
    n('Du nimmst ihm das Heft ab, bevor er es zuklappen kann. Unter all dem Durchgestrichenen steht noch eine Zeile. Ganz klein. Nicht durchgestrichen.'),
    n('„Wer nie geblieben ist, bleibt doch einmal stehn – und die Gasse dreht sich weg und lässt sie gehn.“'),
    v('… Die ist gut.', 'zaertlich'),
    s('lio-funkel', 'Die ist für euch. Sie ist gut, weil sie nichts verrät. Ich hab Anstand. Ein bisschen. Die Ballade bleibt vor dem Rolltor stehen.', 'verlegen'),
    s('lio-funkel', 'Den Rest hab ich in den Kanal geworfen. Die Ratten sind jetzt auch rot.', 'freude'),
  ]),
  node('wellblech', [
    s('lio-funkel', '„Wellblech“ … „hell, frech“ … „schnell, Pech“ … nein. Nein! Ich will das nicht reimen! Ich wohn drei Gassen weiter! Ich hab Ohren!', 'besorgt'),
    s('lio-funkel', 'Ich spiel heute was Instrumentales. Ganz lang. Ganz leise. Für alle Beteiligten.', 'verlegen'),
  ]),
  node('schulter', [
    n('Deine Metallhand landet auf seiner Schulter. Schwer. Er quietscht wie sein Akkordeon.'),
    s('lio-funkel', 'Ist ja gut! Ich reim nix mehr auf Arm, nix auf Schnalle, nix auf irgendwas mit Rolltor! Ich bin raus! Ich mach ab jetzt nur noch Seemannslieder!', 'besorgt'),
    v('Braver Junge.', 'signatur'),
    s('lio-funkel', '… Darf ich wenigstens „Brecherin“ auf „Herzen in Ketten“ reimen? Nein? Das reimt sich ja auch nicht. Ich geh dann mal.', 'trauer'),
  ]),
]);

// --- Ripper: Peilsender im Ratenarm (high-voltage, abends am Ecktisch)
const klatschRipper: DialogueDef = dlg('vexaria-klatsch-ripper', [
  node('start', [
    n('Der Ecktisch im High Voltage. Ripper sitzt da wie immer, ein Bein über der Stuhllehne, ein Tablet auf dem Knie, eine Tasse Kaffee, die er nie bezahlt.'),
    s('ripper', 'Postbotin. Setz dich. Ich hab Zahlen für dich.', 'signatur'),
    n('Er dreht das Tablet um. Eine Karte der Lötgassen. Ein roter Punkt. Daneben eine Liste mit Uhrzeiten und eine Kurve, die aussieht wie ein Gebirge.'),
    s('ripper', 'Jeder Arm auf Raten hat \'nen Peilsender. Seite neun im Vertrag. Ganz klein, direkt unter der Stelle, wo du unterschrieben hast, ohne zu lesen.', 'signatur'),
    v('Du hast mich getrackt.', 'wut'),
    s('ripper', 'Ich hab mein EIGENTUM getrackt, Schätzchen. Und mein Eigentum hat in drei Jahren nie zwei Nächte am selben Ort geschlafen. Nie. Ich hab Grafiken.', 'neutral'),
    s('ripper', 'Und dann, plötzlich: Kurierbude. Kurierbude. Kurierbude. Der Punkt rührt sich nicht mehr. Ich dachte erst, du bist tot. Dann hab ich die Servotemperatur gesehen.', 'signatur'),
    s('ripper', 'Ellbogengelenk, Temperaturspitze, halb zwei. Ursache unbekannt. Ich hab drei Vermutungen, und alle drei sind schmutzig.', 'freude'),
  ], {
    choices: [
      ch('Das Tablet nehmen. Mit der Metallhand.', 'brechen'),
      ch('„Schick die Rechnung an die Kurierbude. Da bin ich jetzt.“', 'bude', { effects: [herz(10)] }),
      ch('„Aria. Komm mal.“', 'aria', { effects: [herz(10)] }),
    ],
  }),
  node('brechen', [
    n('Du nimmst das Tablet. Es knackt, als du es faltest. Einmal. Zweimal. Bis es in deine Westentasche passt.'),
    s('ripper', 'Das war die Kopie, Schätzchen. Das Original liegt in der Praxis. Und auf \'nem Stick in meinem Strumpf. Willst du da auch reingreifen? Ich hab nichts dagegen.', 'freude'),
    s('ripper', 'Das Tablet kommt auf die Rechnung. Montag.', 'signatur'),
    v('Montag.', 'wut'),
  ]),
  node('bude', [
    v('Dann weißt du ja, wo du die Rechnung hinschickst. Kurierbude. Da bin ich jetzt öfter.', 'signatur'),
    s('ripper', '… Oh. Oh, das ist ja richtig süß. Mir wird schlecht. Mach das nie wieder vor mir, ich hab gerade gegessen.', 'ueberrascht'),
    s('ripper', 'Ich schalt den Sender nachts ab. Nicht aus Anstand. Ich hab keinen. Ich will nur nicht, dass mir das Diagnosegerät durchbrennt.', 'signatur'),
  ]),
  node('aria', [
    n('Du drehst dich nicht mal um. Stuhlbeine kratzen. Aria kommt von der Tanzfläche rüber, langsam, die Zerberster-Faust offen. Die Silberfinger klicken einzeln, einer nach dem anderen.'),
    v('Ripper hat \'nen Peilsender in meinem Arm. Und \'ne Kurve. Von der Bude.', 'neutral'),
    a('Hat er. Hat er wirklich.', 'wut'),
    a('Ripper. Schätzchen. Du schaltest den jetzt ab. Oder ich bau ihn dir aus. Durch die Nase.', 'signatur'),
    s('ripper', 'Aus! Siehst du? Aus! Grünes Lämpchen! Gott, ihr zwei seid zusammen noch anstrengender als einzeln.', 'besorgt'),
    a('Danke. Die Kurve will ich trotzdem. Ausgedruckt. Groß.', 'freude'),
    n('Sie legt dir die Metallhand in den Nacken, kühl, schwer, und lässt sie da liegen, während Ripper druckt. Ganz ruhig. Als würde sie ein Revier markieren.'),
  ]),
]);

// --- Opa Gurrmann: ahnungslos (loetgassen, morgens/tagsüber am Taubenschlag)
const klatschGurrmann: DialogueDef = dlg('vexaria-klatsch-gurrmann', [
  node('start', [
    s('opa-gurrmann', 'Fräulein Vex! Gut, dass ich Sie treffe. Hatten Sie auch den Sturm neulich nachts?', 'besorgt'),
    s('opa-gurrmann', 'Bei Ihnen unten hat das Wellblech gescheppert wie verrückt. Die Tauben sind dreimal aufgeflogen. Dreimal! Herbert hat ein Ei verloren. Herbert ist ein Männchen.', 'besorgt'),
    v('… Sturm. Ja.', 'verlegen'),
    s('opa-gurrmann', 'Komisch nur, dass hier oben kein Lüftchen ging. Die Wetterfahne hat sich nicht gerührt. Nur bei Ihnen. So ein … örtliches Wetter.', 'neutral'),
  ], {
    choices: [
      ch('„Ganz örtlich. Kommt nicht wieder.“', 'luege'),
      ch('„War kein Sturm, Opa. War Besuch.“', 'besuch', { effects: [{ relation: 'opa-gurrmann', delta: 5 }] }),
      ch('„Kommt bestimmt wieder. Sorry an Herbert.“', 'frech'),
    ],
  }),
  node('luege', [
    s('opa-gurrmann', 'Hoffentlich! Ich schick Ihnen den Dante vorbei, der soll das Rolltor festschrauben. Das klappert ja ganz fürchterlich. Und Gummi! Ich hab noch Gummi im Keller. Für die Kanten.', 'freude'),
    n('Er klopft dir auf die Schulter. Auf die mit dem Metallarm. Er merkt es nicht.'),
  ]),
  node('besuch', [
    s('opa-gurrmann', 'Besuch! Ach, wie schön! Die junge Dame mit dem silbernen Arm? Die mögen die Tauben. Die bringt immer Brotkrumen. Und klaut sie dann wieder, wenn sie Hunger hat.', 'freude'),
    s('opa-gurrmann', 'Habt ihr gerauft? Ich hab ein Rumpeln gehört. Und dann Lachen. Viel Lachen. Ich hab mir gedacht: Wenn bei einer Rauferei so viel gelacht wird, dann ist es eine gute Rauferei.', 'neutral'),
    v('Die beste.', 'zaertlich'),
    s('opa-gurrmann', 'Na also. Meine Frau und ich haben auch immer gerauft. Vierzig Jahre. Die Nachbarn haben sich nie beschwert. Die waren taub. Glück muss man haben.', 'freude'),
  ]),
  node('frech', [
    v('Kommt bestimmt wieder. Sorry an Herbert.', 'signatur'),
    s('opa-gurrmann', 'Dann strick ich den Tauben Ohrenschützer. Aus Wolle. Ich stricke gern.', 'freude'),
    s('opa-gurrmann', '… Wieso sind Sie denn so rot, Fräulein? Haben Sie Fieber? Ich hab Tee! Kamille! Gegen alles!', 'besorgt'),
  ]),
]);

// --- Captain Kuschel: Ohrensprache (dantes-werkstatt, morgens/abends; Dante übersetzt)
const klatschKuschel: DialogueDef = dlg('vexaria-klatsch-kuschel', [
  node('start', [
    n('Auf dem Regal über der Werkbank sitzt Captain Kuschel. Jemand hat ihm ein Gurtzeug gebastelt. Aus Schnürsenkeln und Büroklammern, mit Schnallen aus plattgeklopften Kronkorken. Eine fehlt.'),
    s('dante', 'Guck mich nicht an. Das war Nyra. Ich hab nur die Kronkorken plattgehämmert. Mit Liebe.', 'verlegen'),
    n('Captain Kuschel sieht dich an. Das linke Ohr steht. Das rechte knickt ab, langsam, bis es auf der Stelle liegt, wo die Schnalle fehlt.'),
    s('dante', 'Das heißt: „Ich bin nicht böse. Ich bin enttäuscht. Du hättest mich vorher fragen können. Ich hätte gesagt: Mach.“', 'neutral'),
    v('Das sagt ein Ohr?', 'ueberrascht'),
    s('dante', 'Er ist sehr ausdrucksstark.', 'signatur'),
  ], {
    choices: [
      ch('Ihm salutieren.', 'salut'),
      ch('Die Lücke mit einem Kronkorken aus der Weste füllen.', 'kronkorken', { effects: [{ relation: 'captain-kuschel', delta: 10 }] }),
      ch('„Du bist aus Plüsch. Halt dich raus.“', 'pluesch'),
    ],
  }),
  node('salut', [
    n('Du salutierst. Mit der Metallhand. Die Knöchel klacken an deiner Stirn. Beide Ohren gehen hoch, steil wie Antennen.'),
    s('dante', 'Beide Ohren. Das heißt: „Weitermachen, Soldatin. Aber leiser. Die Taubendrohnen haben sich beschwert. Schriftlich.“', 'freude'),
  ]),
  node('kronkorken', [
    n('Du ziehst einen Kronkorken aus der Weste, beißt ihn platt und klemmst ihn in die Lücke. Er passt. Natürlich passt er.'),
    s('dante', 'Er sagt: „Jetzt sind wir quitt.“ Und dass er Aria mag. Er mag nicht viele. Mich mag er nicht mal, und ich hab ihm die Ohren genäht.', 'trauer'),
    s('dante', 'Er sagt auch, du sollst sie gut festhalten. Aber nicht zu fest. Er weiß, wie das ist, wenn einer mit Metallhänden zu fest drückt. Frag nicht. Es war ein Schraubstock.', 'neutral'),
  ]),
  node('pluesch', [
    n('Beide Ohren fallen. Platt. Captain Kuschel sieht aus wie ein Sack, der gerade erfahren hat, dass er ein Sack ist.'),
    s('dante', 'Jetzt hast du ihn verletzt. Er hat Gefühle. Er hat mehr Gefühle als du, und du grinst seit drei Tagen.', 'wut'),
    v('Ich grins nicht.', 'verlegen'),
    s('dante', 'Du grinst. Kanal 4 führt Buch. Sieben-Neun hat \'ne Strichliste.', 'signatur'),
  ]),
]);

// --- Nachbarn: Unterschriftenliste am Rolltor (loetgassen, morgens)
const NACHBARIN = 'Frau Kranich vom Wäschehof (aus dem Fenster)';
const KALLE = 'Kalle von gegenüber (Unterhemd, Schweißermaske auf der Stirn)';
const klatschNachbarn: DialogueDef = dlg('vexaria-klatsch-nachbarn', [
  node('start', [
    n('Morgens an der Kurierbude. Am Rolltor klebt ein Zettel. Mit Panzertape. Sehr viel Panzertape. Oben drüber, mit Kugelschreiber: UNTERSCHRIFTENLISTE GEGEN NÄCHTLICHE RUHESTÖRUNG (WELLBLECH).'),
    n('Vierzehn Unterschriften. Eine ist ein Taubenfuß in Tinte. Eine ist von Lio, durchgestrichen, daneben: „’tschuldigung, ich find’s eigentlich schön“.'),
    s('narrator', `${NACHBARIN}: „DU! Kurierin! Ich hab zwei Kinder und einen Mann mit Frühschicht! Ein Rolltor ist KEINE Tür, gegen die man ständig rennen muss, du Trampeltier!“`),
    s('narrator', `${KALLE}: „Lass sie doch, Kranich. Endlich mal was los hier. Seit der Schlagzeuger weg ist, war’s mir zu ruhig.“`),
    s('narrator', `${NACHBARIN}: „Du hältst dich raus, Kalle! Du hast um drei Uhr ‚Zugabe‘ gerufen!“`),
  ], {
    choices: [
      ch('Unterschreiben.', 'unterschreiben'),
      ch('Die Liste abreißen.', 'abreissen'),
      ch('„Kommt nicht wieder vor.“', 'luegen'),
    ],
  }),
  node('unterschreiben', [
    n('Du nimmst den Kuli, der an einer Schnur am Panzertape hängt, und unterschreibst. Ganz unten. „V. Schrapnell. Seh ich auch so.“'),
    s('narrator', `${NACHBARIN}: „Du kannst doch nicht gegen dich selbst unterschreiben!“`),
    v('Doch. Bin Chefin. Ich kann alles.', 'signatur'),
    n('Als du abends zurückkommst, steht unter deiner Unterschrift noch eine. Krakelig, mit Kirschlippenstift, hinter dem A ein Herz, das aussieht wie ein Kronkorken: „Ich nicht. – A.“'),
  ], { effects: [herz(10)] }),
  node('abreissen', [
    n('Du reißt die Liste ab. Mit der Metallhand. Das Panzertape bleibt hängen, die Liste nicht. Du knüllst sie zusammen.'),
    s('narrator', `${NACHBARIN}: „Barbarin!“`),
    s('narrator', `${KALLE}: „Bravo!“`),
    v('Kranich. Kauf dir Ohrstöpsel. Oder ’n eigenes Leben.', 'wut'),
    s('narrator', `${NACHBARIN}: „Ich HAB ein Leben! Ich hör nur gerade deins!“`),
    n('Das Fenster knallt zu. Kalle reckt den Daumen. Auf dem Taubenschlag gurrt eine Taube, und es klingt verdächtig nach Lachen.'),
  ]),
  node('luegen', [
    v('Kommt nicht wieder vor.', 'verlegen'),
    s('narrator', `${NACHBARIN}: „Das hast du letztes Jahr über die Dachrennen auch gesagt!“`),
    s('narrator', `${KALLE}: „Und über die Kronkorken. Und über den Pizzaroller.“`),
    v('Der Pizzaroller war ein Unfall.', 'signatur'),
    n('Du schiebst das Rolltor hoch. Es kreischt. Beide Nachbarn sehen dich an. Du schiebst es sehr, sehr langsam wieder runter.'),
  ]),
]);

// --- Oma Volt: zwei Becher und Ohrstöpsel (neon-gasse, morgens am Kiosk)
const klatschOmaVolt: DialogueDef = dlg('vexaria-klatsch-omavolt', [
  node('start', [
    n('Kiosk Volt-Eck. Die Jalousie ist oben. Auf dem Tresen stehen schon zwei Becher Kaffee, bevor du was gesagt hast. Daneben eine kleine Papiertüte, oben zugetackert.'),
    s('oma-volt', 'Zwei Schwarze. Und in der Tüte sind Ohrstöpsel. Zwanzig Paar. Die verteilst du in den Lötgassen. Gehen aufs Haus.', 'neutral'),
    v('Wieso Ohrstöpsel?', 'ueberrascht'),
    s('oma-volt', 'Kindchen. Die Kranich vom Wäschehof kauft hier ihre Zigaretten. Die Kranich redet. Die Kranich redet seit drei Tagen von nichts anderem.', 'signatur'),
    s('oma-volt', 'Ich war auch mal jung. Vor fünfzig Jahren, ein Kranführer vom Hafen. Wir haben das Kranhäuschen zum Schaukeln gebracht. Wegen Wind. Sagen wir.', 'freude'),
    s('oma-volt', 'Der halbe Hafen hat sich beschwert. Wir haben dann geheiratet, damit Ruhe ist. Hat nicht geholfen. Mit der Ruhe, mein ich.', 'freude'),
  ], {
    choices: [
      ch('Die Tüte nehmen. „Danke, Oma.“', 'danke', { effects: [{ relation: 'oma-volt', delta: 5 }] }),
      ch('„Ich brauch keine Stöpsel. Ich brauch \'ne dickere Wand.“', 'wand'),
      ch('Die Becher nehmen. Schnell gehen.', 'flucht'),
    ],
  }),
  node('danke', [
    s('oma-volt', 'Und grüß mir die Kleine mit dem Silberarm. Sag ihr, sie soll aufhören, dir Kaugummi aus der Weste zu klauen. Die kauft sie nämlich hier. Auf deinen Namen.', 'neutral'),
  ]),
  node('wand', [
    s('oma-volt', 'Wellblech ist ehrlich, Kindchen. Dicke Wände sind was für Leute, die was zu verstecken haben.', 'signatur'),
    s('oma-volt', '… Ihr zwei habt ja nichts zu verstecken. Hört man.', 'freude'),
  ]),
  node('flucht', [
    n('Du nimmst die Becher, die Tüte und gehst. Schnell. Hinter dir lacht Oma Volt, so laut, dass ein Taubenschwarm vom Kioskdach aufsteigt.'),
    s('oma-volt', 'Den zweiten Becher zahlst du ab jetzt! Die Schonfrist ist vorbei!', 'freude'),
  ]),
]);

// --- Schluss: das Dach über der Bude, wenn die halbe Unterstadt Bescheid weiß (loetgassen, nachts)
const klatschDach: DialogueDef = dlg('vexaria-klatsch-dach', [
  node('start', [
    n('Nacht. Das Dach über der Kurierbude, Teerpappe, noch warm vom Tag. Aria sitzt schon da, die Stiefel über der Kante, und hält einen zerknitterten Zettel ins rote Blinklicht vom Funkmast. An einer Ecke klebt noch Panzertape.'),
    a('Kranichs Liste. Vierzehn Unterschriften. Hab ich geklaut. Ist das jetzt Beweisvernichtung oder ein Liebesbrief?', 'signatur'),
    v('Gib her.', 'verlegen'),
    a('Nee. Hör zu.', 'freude'),
    a('Die ganze Unterstadt weiß es, Rennsemmel. Die ganze. Mich hat heut im Bus \'ne Oma gefragt, ob ich „die Brecherin von der Kurierin“ bin. VON. Als wär ich \'n Paket.', 'verlegen'),
    v('Bist du nicht. Pakete beschweren sich nicht.', 'signatur'),
    a('Ich beschwer mich nicht. Ich … stell fest.', 'verlegen'),
    n('Sie legt den Zettel weg. Ein Zopf rutscht ihr über die Schulter. Sie sieht dich nicht an, als sie weiterredet, sondern über die Dächer, die rot und blau blinken.'),
    a('Ich war noch nie was, worüber die Leute reden, ohne dass vorher einer blutet. Ist komisch. Ist … gut komisch.', 'zaertlich'),
  ], {
    choices: [
      ch('„Sollen wir leiser sein?“', 'leiser'),
      ch('Zwei Finger in ihren Gürtel haken. Ziehen.', 'ziehen'),
      ch('Nichts sagen. Den Kopf an ihre Schulter legen.', 'schulter'),
    ],
  }),
  node('leiser', [
    v('Sollen wir leiser sein? Ehrlich. Wenn dir das zu viel wird mit dem Gerede.', 'neutral'),
    a('Leiser.', 'ueberrascht'),
    n('Sie dreht sich zu dir. Langsam. Ein Grinsen, das unten im Mundwinkel anfängt und sich durchfrisst, bis die Augen mitmachen.'),
    a('Ich hab mein halbes Leben leise gemacht, damit keiner guckt. Ich hab keinen Bock mehr auf leise.', 'zaertlich'),
    a('Aber danke, dass du fragst. Ehrlich. Das macht\'s schlimmer. Komm her.', 'verlegen'),
  ], { next: 'kuss' }),
  node('ziehen', [
    n('Du hakst zwei Finger in ihren Gürtel, da, wo deine schwarze Schnalle neben ihrer silbernen hängt, und ziehst. Sie rutscht über die Teerpappe zu dir, ohne jeden Widerstand, mit einem kleinen überraschten Laut, den sie sofort hasst.'),
    a('Das war \'n Quieken. Das war KEIN Quieken. Wenn du das erzählst –', 'verlegen'),
    v('Die Kranich hat\'s bestimmt gehört.', 'signatur'),
    a('Die Kranich kann mich mal.', 'freude'),
  ], { next: 'kuss' }),
  node('schulter', [
    n('Du sagst nichts. Du lehnst dich rüber und legst den Kopf auf ihre Schulter, die echte, warm unter dem dünnen Shirt. Sie hält still. Dann merkst du, wie ihr Atem schneller wird, obwohl du gar nichts machst.'),
    a('Das ist unfair. Du machst gar nix, und ich krieg trotzdem Herzklopfen. Hörst du das? Hör nicht hin.', 'verlegen'),
    v('Hör schon hin.', 'zaertlich'),
    n('Der Zerberster legt sich um dich, vorsichtig, Finger für Finger, als müsste sie sich jedes Mal neu erinnern, wie fest „fest genug“ ist.'),
  ], { next: 'kuss' }),
  node('kuss', [
    n('Sie küsst dich. Nicht wie in der Gasse, hastig, mit Keks und Angst. Langsam. Als hätte sie diesmal Zeit und wüsste es.'),
    n('Ihre echte Hand wandert in deinen Nacken, unter die Haare, die Fingerkuppen rau auf deiner Haut. Die Metallhand bleibt an deiner Hüfte liegen, kühl durch den Stoff, und rührt sich nicht. Du spürst, dass sie sich zwingt, sich nicht zu rühren. Das ist schlimmer als alles andere.'),
    n('Du küsst ihren Mundwinkel. Ihr Kinn. Die Stelle unter dem Ohr, wo der Puls sitzt. Der rast. Sie macht ein Geräusch, halb Lachen, halb Fluch.'),
    a('Da. Genau da. Jetzt weiß ich, wo Hunter die ganze Zeit hingeguckt hat, du Arschloch.', 'verlegen'),
    v('Soll ich aufhören?', 'signatur'),
    a('Wag es.', 'zaertlich'),
    n('Unten in der Gasse geht ein Fenster auf. Eine Stimme, scharf wie eine Blechschere: „ICH HÖR EUCH DA OBEN!“'),
    n('Aria lacht dir in den Hals. Sie hört nicht auf. Du auch nicht.'),
    a('Rolltor oder Dach, Postbotin? Ich frag nur einmal. … Ich frag bestimmt noch öfter.', 'signatur'),
  ], {
    choices: [
      ch('„Rolltor.“', 'rolltor', { when: noFlag('vexaria_nacht_woche'), effects: [herz(20)] }),
      ch('„Dach. Bleib hier.“', 'dach', { effects: [herz(20)] }),
    ],
  }),
  node('rolltor', [
    n('Ihr klettert die Feuerleiter runter, viel zu schnell, Aria zwei Sprossen unter dir. Ihr Stiefel bleibt hängen, sie flucht, du hältst sie am Gürtel, sie lacht. Unten schiebst du das Rolltor hoch. Es kreischt. Gegenüber geht das Licht an.'),
    n('Drinnen greifst du nach deinem Gurtzeug. Sie ist schneller. Sie zählt die Schnallen rückwärts, laut, extra laut, damit die Kranich mitzählen kann. Die erste mit den Zähnen. Die zweite mit dem Daumen. Den Rest im Dunkeln, ohne hinzusehen.'),
    a('Hab geübt. An Hunters Barhockern. Frag nicht.', 'verlegen'),
    n('Das Gurtzeug fällt. Dein Top fliegt über die Kiste. Ihr Shirt landet auf der Glühbirne, und sofort riecht es nach angekokeltem Bandshirt. Keine von euch kümmert sich.'),
    n('Von draußen ruft die Kranich noch irgendwas. Ihr hört nicht mehr zu.'),
    n('Klick.'),
  ], { effects: [set('vexaria_nacht_woche'), { cutscene: 'vexaria-nacht-kurz' }] }),
  node('dach', [
    n('Ihr bleibt. Ihr Kopf in deinem Schoß, die Zöpfe über deinen Knien, der Zerberster quer über deinem Bauch, schwer wie eine Decke. Sie liest dir die Liste vor, alle vierzehn Namen, mit verstellten Stimmen. Bei Lios Unterschrift weint sie vor Lachen.'),
    a('Morgen kleb ich sie wieder ans Rolltor. Mit \'nem Kronkorken. Damit alle sehen, dass wir sie gelesen haben.', 'freude'),
    a('Und dass es uns scheißegal ist.', 'zaertlich'),
  ]),
]);

const klatsch: DialogueDef[] = [
  klatschHunter, klatschDante, klatschKiki, klatschVega, klatschLio, klatschRipper, klatschGurrmann, klatschKuschel,
  klatschNachbarn, klatschOmaVolt, klatschDach,
];

/** Gesehen-Schlüssel der Klatsch-Szenen (für das Dach am Schluss: fünf davon). */
const KLATSCH_GESEHEN: Condition[] = [
  enter('high-voltage', 'vexaria-klatsch-hunter'), enter('dantes-werkstatt', 'vexaria-klatsch-dante'),
  enter('neon-gasse', 'vexaria-klatsch-kiki'), enter('high-voltage', 'vexaria-klatsch-vega'),
  enter('neon-gasse', 'vexaria-klatsch-lio'), enter('high-voltage', 'vexaria-klatsch-ripper'),
  enter('loetgassen', 'vexaria-klatsch-gurrmann'), enter('dantes-werkstatt', 'vexaria-klatsch-kuschel'),
  enter('loetgassen', 'vexaria-klatsch-nachbarn'), enter('neon-gasse', 'vexaria-klatsch-omavolt'),
];

// ---------------------------------------------------------------------------
// Cutscenes

const cutscenes = [
  cut('rom-vexaria-funkmast', 'Kanal neun', [
    { image: 'cut-rom-vexaria-funkmast', pan: 'out', fade: 'in', hold: 2600, caption: 'Vierzig Meter. Ein Funk. Zwei Stimmen.' },
    { image: 'cut-rom-vexaria-funkmast', pan: 'left', lines: [n('Sie hält dich, bis die Sonne weg ist. Die Tauben gurren. Die Armbänder flattern. Keins davon ist für dich.')] },
  ], [{ dialogue: 'rom-vexaria-funkmast-schleife' }]),
  cut('rom-vexaria-funkmast-fs', 'Kanal neun', [
    { image: 'cut-rom-vexaria-funkmast', pan: 'out', fade: 'in', hold: 2600, caption: 'Vierzig Meter. Ein Funk. Zwei Stimmen.' },
    { image: 'cut-rom-vexaria-funkmast', pan: 'left', lines: [n('Sie hält dich, bis die Sonne weg ist. Crew hält. Das ist der Job.')] },
  ], [{ dialogue: 'rom-vexaria-funkmast-schleife-fs' }]),
  cut('rom-vexaria-konzert', 'Erste Reihe', [
    { image: 'cut-rom-vexaria-konzert', pan: 'in', fade: 'in', hold: 2600, caption: 'Hundert Meter. Neunzig. Erste Reihe.' },
  ], [{ dialogue: 'rom-vexaria-konzert' }]),
  cut('rom-vexaria-konzert-fs', 'Erste Reihe', [
    { image: 'cut-rom-vexaria-konzert', pan: 'in', fade: 'in', hold: 2600, caption: 'Hundert Meter. Neunzig. Erste Reihe.' },
  ], [{ dialogue: 'rom-vexaria-konzert-fs' }]),
];

// ---------------------------------------------------------------------------
// Telefon

const KONZERT_OFFEN: Condition = all(V, seen('rom-vexaria-funkmast'), not(seen('rom-vexaria-konzert')));

const phone: PhoneMessageDef[] = [
  {
    id: 'aria-vex-konzert', from: 'aria',
    text: 'KABELBRAND. Schlickstrand unter der Flutmauer. Geheimkonzert. Morgen Abend oder übermorgen oder wann du Zeit hast, die spielen die ganze Woche. Ich geh hin. ICH GEH HIN. Kommst du mit? Bitte. Ich sag nie bitte.',
    auto: all(KONZERT_OFFEN, WARTEN_VORBEI, { time: ['morgen', 'tag'] }),
    replies: [
      { text: 'Erste Reihe.', effects: [set('vexaria_konzert_einladung'), { relation: 'aria', delta: 10 }] },
      { text: 'Ich kletter vorher aufs Gerüst.', effects: [set('vexaria_konzert_einladung'), { relation: 'aria', delta: 10 }] },
    ],
  },
  {
    id: 'aria-vex-kanal-neun', from: 'aria', text: 'Kanal neun. Wenn du so weit bist.',
    auto: all(V, seen('rom-vexaria-konzert'), flag('vexaria_funkmast_noch')),
  },
];

// ---------------------------------------------------------------------------
// Herz-Ereignisse

export const DANACH_EVENTS: HeartEventDef[] = [
  ...twin({
    id: 'rom-vexaria-funkmast', hearts: 8, map: 'loetgassen', time: 'abend',
    when: all(V, HEUTE_FREI, WARTEN_VORBEI, flag('vexaria_kas_erzaehlt'), seen('rom-vexaria-kuss')),
  }, all(R, ZUSAMMEN), { dialogue: 'rom-vexaria-funkmast' }, { dialogue: 'rom-vexaria-funkmast-fs' }),
  ...twin({
    id: 'rom-vexaria-konzert', hearts: 8, map: 'flutmauer', time: ['abend', 'nacht'],
    when: all(V, HEUTE_FREI, flag('vexaria_kas_erzaehlt'), flag('vexaria_konzert_einladung')),
  }, all(R, ZUSAMMEN, { item: 'kabelbrand-pass' }), { cutscene: 'rom-vexaria-konzert' }, { cutscene: 'rom-vexaria-konzert-fs' }),
];

const ZUSAMMEN_V: Condition = all(V, flag('aria_romanze_zusammen'));

export const part: ContentPart = {
  dialogues: byId([
    funkmast('rom-vexaria-funkmast', true), funkmast('rom-vexaria-funkmast-fs', false),
    funkmastSchleife('rom-vexaria-funkmast-schleife', true), funkmastSchleife('rom-vexaria-funkmast-schleife-fs', false),
    konzert('rom-vexaria-konzert', true), konzert('rom-vexaria-konzert-fs', false),
    ...kommentare,
    ...klatsch,
  ]),
  cutscenes: byId(cutscenes),
  phone: byId(phone),
  daily: byId(klatschDaily),
  mapAdditions: {
    'neon-gasse': {
      onEnter: [
        { id: 'vexaria-kiki-taxi', once: true, when: all(V, flag('vexaria_nacht'), { time: ['abend', 'nacht'] }, noFlag('aria_heute')), dialogue: 'vexaria-kiki-taxi' },
        // Klatsch: Kiki am Taxi (nach ihrem Taxifunk-Spruch), Lio auf der Bank (nicht samstags, da steht er auf der Bühne),
        // Oma Volt am Kiosk (sonntags tagsüber ist sie auf dem Flohmarkt, morgens immer da).
        {
          id: 'vexaria-klatsch-kiki', once: true, effects: KLATSCH_HEUTE, dialogue: 'vexaria-klatsch-kiki',
          when: all(KLATSCH, ARIA_DA, enter('neon-gasse', 'vexaria-kiki-taxi'), { time: ['abend', 'nacht'] }),
        },
        {
          id: 'vexaria-klatsch-lio', once: true, effects: KLATSCH_HEUTE, dialogue: 'vexaria-klatsch-lio',
          when: all(KLATSCH, { time: 'nacht' }, not({ weekday: 'sa' })),
        },
        {
          id: 'vexaria-klatsch-omavolt', once: true, effects: KLATSCH_HEUTE, dialogue: 'vexaria-klatsch-omavolt',
          when: all(KLATSCH, { time: 'morgen' }),
        },
      ],
    },
    'crew-quartier': {
      onEnter: [{ id: 'vexaria-kuschel-zettel', once: true, when: all(V, flag('vexaria_nacht')), dialogue: 'vexaria-kuschel-zettel' }],
    },
    'loetgassen': {
      onEnter: [
        { id: 'vexaria-gurrmann-mast', once: true, when: all(V, seen('rom-vexaria-funkmast'), noFlag('aria_heute'), { time: ['tag', 'abend'] }), dialogue: 'vexaria-gurrmann-mast' },
        { id: 'vexaria-kanal4-paket', once: true, when: all(ZUSAMMEN_V, flag('vexaria_kanal4'), { time: 'morgen' }), dialogue: 'vexaria-kanal4-paket' },
        { id: 'vexaria-bude-heim', once: true, when: all(V, seen('rom-vexaria-konzert')), dialogue: 'vexaria-bude-heim' },
        // Klatsch: Nachbarn morgens am Rolltor, Opa Gurrmann tagsüber am Taubenschlag, zum Schluss das Dach (nach fünf Szenen).
        {
          id: 'vexaria-klatsch-nachbarn', once: true, effects: KLATSCH_HEUTE, dialogue: 'vexaria-klatsch-nachbarn',
          when: all(KLATSCH, { time: 'morgen' }),
        },
        {
          id: 'vexaria-klatsch-gurrmann', once: true, effects: KLATSCH_HEUTE, dialogue: 'vexaria-klatsch-gurrmann',
          when: all(KLATSCH, { time: 'tag' }),
        },
        {
          id: 'vexaria-klatsch-dach', once: true, effects: KLATSCH_HEUTE, dialogue: 'vexaria-klatsch-dach',
          when: all(KLATSCH, ARIA_DA, { time: 'nacht' }, { atLeast: KLATSCH_GESEHEN, min: 5 }),
        },
      ],
    },
    'high-voltage': {
      onEnter: [
        { id: 'vexaria-ripper-zuzweit', once: true, when: all(ZUSAMMEN_V, { time: 'abend' }, { not: { weekday: 'mo' } }, noFlag('vexaria_fruehstueck')), dialogue: 'vexaria-ripper-zuzweit' },
        // Klatsch: Hunter morgens an der Kasse (sonntags angelt er), abends Vega am Tisch oder Ripper am Ecktisch.
        {
          id: 'vexaria-klatsch-hunter', once: true, effects: KLATSCH_HEUTE, dialogue: 'vexaria-klatsch-hunter',
          when: all(KLATSCH, ARIA_DA, { time: 'morgen' }, not({ weekday: 'so' })),
        },
        {
          id: 'vexaria-klatsch-vega', once: true, effects: KLATSCH_HEUTE, dialogue: 'vexaria-klatsch-vega',
          when: all(KLATSCH, ARIA_DA, { time: 'abend' }, not({ quest: 'prep-wachplan', state: 'active' })),
        },
        {
          id: 'vexaria-klatsch-ripper', once: true, effects: KLATSCH_HEUTE, dialogue: 'vexaria-klatsch-ripper',
          when: all(KLATSCH, ARIA_DA, { time: 'abend' }),
        },
      ],
    },
    'dantes-werkstatt': {
      onEnter: [
        { id: 'vexaria-dante-werkbank', once: true, when: all(ZUSAMMEN_V, flag('vexaria_armwartung')), dialogue: 'vexaria-dante-werkbank' },
        // Klatsch: Dante tagsüber an der Werkbank (sonntags in Akt 2 auf dem Flohmarkt), Captain Kuschel morgens/abends
        // auf seinem Regal, Dante übersetzt (morgens Mo/Do steht Dante auf dem Schrottmarkt).
        {
          id: 'vexaria-klatsch-dante', once: true, effects: KLATSCH_HEUTE, dialogue: 'vexaria-klatsch-dante',
          when: all(KLATSCH, { time: 'tag' }, not({ weekday: 'so' })),
        },
        {
          id: 'vexaria-klatsch-kuschel', once: true, effects: KLATSCH_HEUTE, dialogue: 'vexaria-klatsch-kuschel',
          when: all(KLATSCH, any({ time: 'abend' }, all({ time: 'morgen' }, not({ weekday: ['mo', 'do'] })))),
        },
      ],
    },
  },
};
