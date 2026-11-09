// Vex × Aria „Kanal neun“ und „Erste Reihe“ (world.md §4.7, Stationen 12–13) plus Crew-Kommentare „Status zusammen“.
//
// Station 13 liegt im Kanon im Nachspiel (`das-meer`, Eröffnung `side-strandclub`). Akt-1-Weg (gaps/vexaria.md):
// Aria lädt zwei Tage nach Station 12 per Telefon ein, Kabelbrand spielt ein Geheimkonzert auf dem Schlickstrand unter
// der `flutmauer` (Containerbühne, Lichtertraverse). Die Kanonfassung am Meer kann später auf denselben Dialog zeigen.
import type { ContentPart } from '../../part';
import type { Condition, DialogueDef, HeartEventDef, PhoneMessageDef } from '../../../modules/contracts';
import {
  a, all, byId, ch, chk, cut, dlg, flag, herz, HEUTE_FREI, msg, n, node, noFlag, not, R, s, seen, set, STATION_START, twin,
  V, v, WARTEN_VORBEI, ZUSAMMEN, ZWEI_TAGE,
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
  ]),
  cutscenes: byId(cutscenes),
  phone: byId(phone),
  mapAdditions: {
    'neon-gasse': {
      onEnter: [{ id: 'vexaria-kiki-taxi', once: true, when: all(V, flag('vexaria_nacht'), { time: ['abend', 'nacht'] }, noFlag('aria_heute')), dialogue: 'vexaria-kiki-taxi' }],
    },
    'crew-quartier': {
      onEnter: [{ id: 'vexaria-kuschel-zettel', once: true, when: all(V, flag('vexaria_nacht')), dialogue: 'vexaria-kuschel-zettel' }],
    },
    'loetgassen': {
      onEnter: [
        { id: 'vexaria-gurrmann-mast', once: true, when: all(V, seen('rom-vexaria-funkmast'), noFlag('aria_heute'), { time: ['tag', 'abend'] }), dialogue: 'vexaria-gurrmann-mast' },
        { id: 'vexaria-kanal4-paket', once: true, when: all(ZUSAMMEN_V, flag('vexaria_kanal4'), { time: 'morgen' }), dialogue: 'vexaria-kanal4-paket' },
        { id: 'vexaria-bude-heim', once: true, when: all(V, seen('rom-vexaria-konzert')), dialogue: 'vexaria-bude-heim' },
      ],
    },
    'high-voltage': {
      onEnter: [{ id: 'vexaria-ripper-zuzweit', once: true, when: all(ZUSAMMEN_V, { time: 'abend' }, { not: { weekday: 'mo' } }, noFlag('vexaria_fruehstueck')), dialogue: 'vexaria-ripper-zuzweit' }],
    },
    'dantes-werkstatt': {
      onEnter: [{ id: 'vexaria-dante-werkbank', once: true, when: all(ZUSAMMEN_V, flag('vexaria_armwartung')), dialogue: 'vexaria-dante-werkbank' }],
    },
  },
};
