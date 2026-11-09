// Vex × Aria, Akt 2: Vex' Sicht auf `main-2-bruch` (Variante A `vexaria-bruch-a`, Variante B `vexaria-bruch-b`),
// die Rettung aus dem Chipnebel `rom-vexaria-rettung` (Tafel `cut-rom-vexaria-rettung`, pumpwerk-sieben; Ausweich-
// fassung `rom-vexaria-rettung-werkstatt` nach main-2-countdown), wöchentliche Dachnächte, Akt-2-Flirtpool und
// Crew-Kommentare. Arias Stationen 5–8 stehen in zerberster.ts / versoehnung.ts, die Krise in krise.ts.
import type { ContentPart } from '../../part';
import type { Condition, CutsceneDef, DialogueDef, DialogueLine, HeartEventDef, TalkDef } from '../../../modules/contracts';
import {
  a, AKT2, AKT3, all, ANGEBAHNT, any, BESCHWINGT, byId, ch, chk, cut, dlg, EPILOG, flag, herz, HEUTE_FREI, msg, n, node,
  noFlag, not, poolDays, R, s, seen, set, STATION_START, V, v, ZUSAMMEN,
} from './_util';

const CHIP = flag('aria_gechippt');
const COUNTDOWN: Condition = { quest: 'main-2-countdown', state: 'done' };
const GERETTET = flag('vexaria_gerettet');
const ROM: Condition = all(R, any(ZUSAMMEN, ANGEBAHNT));
const PAAR: Condition = all(R, ZUSAMMEN);
const Q = 'pers-aria-zerberster';

// ---------------------------------------------------------------------------
// vexaria-bruch-a · „Ja, Master“ (Variante A: Aria gechippt und weg)

const bruchA: DialogueDef = dlg('vexaria-bruch-a', [
  node('start', [
    n('Kurierbude. Das Rolltor ist halb unten, die Glühbirne an. Du hast nicht geschlafen. Du hast nicht mal das Gurtzeug ausgezogen. Auf der Kiste liegt dein Telefon, das Display nach oben, Arias Name ganz oben in der Liste.'),
    n('Du hast es neunmal versucht. Beim zehnten Mal klickt es in der Leitung.'),
    v('Aria. Aria, wo bist du? Sag was. Sag irgendwas, Großmaul.', 'besorgt'),
    a('Ja, Master?', 'neutral'),
    n('Es ist ihre Stimme. Ohne alles, was ihre Stimme ist. Keine Flüche, kein Lachen hinten dran, kein Kronkorken zwischen den Zähnen. Nur ein glatter, freundlicher Ton, wie eine Ansage in der Magnetbahn.'),
    a('Wie kann ich helfen, Master?', 'neutral'),
  ], {
    choices: [
      ch('Auflegen. Das Telefon gegen die Wand.', 'wand'),
      ch('„Ich bin nicht dein Master. Ich bin die Postbotin. Hörst du? DIE POSTBOTIN.“', 'schreien'),
      ch('Nichts sagen. Zuhören, bis die Leitung tot ist.', 'still'),
    ],
  }),
  node('wand', [
    n('Das Telefon fliegt. Es zerspringt an der Wellblechwand, und das Geräusch ist so laut, dass Captain Kuschel, der hier gar nicht wohnt, in deinem Kopf vom Regal fällt.'),
    n('Dein Metallarm zischt. Die Finger haben sich so fest zusammengezogen, dass du sie mit der anderen Hand aufbiegen musst. Einen nach dem anderen.'),
  ], { next: 'wut' }),
  node('schreien', [
    a('Verstanden, Master. Postbotin. Ich habe es mir gemerkt.', 'neutral'),
    n('Dann ist die Leitung tot. Du schreist trotzdem weiter. Eine Weile. Bis die Nachbarin gegen das Rolltor klopft.'),
  ], { next: 'wut' }),
  node('still', [
    n('Du hörst sie atmen. Gleichmäßig. Zu gleichmäßig. Aria atmet nie gleichmäßig, sie atmet wie sie redet, in Stößen, zu laut, mittendrin ein Lachen. Dann, ganz hinten, ganz leise, etwas anderes. Ein Klacken. Wie ein Kronkorken, der gegen Zähne schlägt.'),
    n('Dann ist die Leitung tot.'),
  ], { effects: [set('vexaria_bruch_klacken')], next: 'wut' }),
  node('wut', [], {
    choices: [
      ch('…', 'paar', { when: ROM }),
      ch('…', 'crew', { when: not(ROM) }),
    ],
  }),
  node('paar', [
    n('Du sitzt auf der Matratze. Der Kronkorken an der Tür glänzt im Licht der Glühbirne. Sie hat ihn mit Spucke und Zuversicht festgeklebt. „Hält“, hat sie gesagt.'),
    v('Ich hab dich angeguckt. Auf dem Tisch. Und ich bin nicht gesprungen. Ich bin nicht schnell genug gewesen. Das erste Mal in meinem Leben nicht schnell genug.', 'trauer'),
    v('Scheiße, Zöpfe. Scheiße.', 'wut'),
    n('Es ist das erste Mal seit Kas, dass du weinst. Es dauert nicht lange. Du bist schnell, auch darin.'),
  ], { next: 'plan' }),
  node('crew', [
    n('Du sitzt auf der Matratze und starrst auf deine Hände. Die echte zittert. Die andere nicht, die kann das nicht.'),
    v('Crew lässt man nicht liegen. Hat Kas gesagt. Hat Kas nie gemacht. Ich auch nicht.', 'wut'),
  ], { next: 'plan' }),
  node('plan', [
    n('Draußen piept dein Funk. Kanal 4, die Kurierflotte. Jemand, der nicht genannt werden will, sagt nur einen Satz.'),
    n('„Sieben-Neun an Postbotin. Xion Venom ist heute Nacht mit \'ner Trage durch den Kanal-Sammler. Richtung Pumpwerk Sieben. Die Trage hatte Zöpfe.“'),
    v('Danke, Sieben-Neun.', 'neutral'),
    n('Du stehst auf. Du ziehst die Schnallen nach. Alle elf.'),
  ], { effects: [set('vexaria_bruch_a'), herz(20), msg('Pumpwerk Sieben. Über den Kanal-Sammler oder die Hafenkante.')] }),
]);

// ---------------------------------------------------------------------------
// vexaria-bruch-b · „Hab nicht angehalten“ (Variante B: Vex hat sie selbst vom Tisch geholt)

const bruchB: DialogueDef = dlg('vexaria-bruch-b', [
  node('start', [
    n('High Voltage, nach dem Bruch. Die Crew sitzt herum wie nach einem Erdbeben: Hunter starrt in ein leeres Glas, Vega putzt ein Zielfernrohr, das schon sauber ist. Nyras Platz am Tresen ist leer.'),
    n('Aria packt dich am Gurtriemen und zieht dich durch den Hinterausgang auf den Hof. Zwischen die Mülltonnen. Wo keiner guckt.'),
    a('Du bist über die Bank. Über die verdammte Bank, mit Xion daneben und der Kralle. Ohne nachzudenken.', 'ueberrascht'),
    v('Hab nicht angehalten.', 'signatur'),
    a('Ich weiß! Ich war DA! Ich hab dich gesehen, wie du geflogen bist, du – du –', 'wut'),
  ], {
    effects: STATION_START,
    choices: [
      ch('…', 'paar', { when: PAAR }),
      ch('…', 'angebahnt', { when: all(R, ANGEBAHNT) }),
      ch('…', 'crew', { when: not(ROM) }),
    ],
  }),
  node('paar', [
    n('Sie findet das Wort nicht. Sie küsst dich stattdessen. Hart, gegen die Hofmauer, die Metallhand flach neben deinem Kopf auf dem Stein, damit sie nicht an dir landet. Die echte krallt sich in dein Gurtzeug und hält fest, als würdest du gleich wieder springen.'),
    n('Du schmeckst Rauch vom Labor, Salz von ihr, Kronkorken. Sie atmet in deinen Mund. Ihre Stirn stößt gegen deine, und dann küsst sie dich noch mal, langsamer, so langsam, dass du die Mülltonnen vergisst, den Hof, die Stadt.'),
    a('Wenn du das noch mal machst … mach das noch mal. Nein. Mach das nie wieder. Doch. Ich weiß nicht.', 'verlegen'),
    v('Entscheid dich, Großmaul.', 'zaertlich'),
    a('Halt die Klappe und lass mich weiterküssen.', 'zaertlich'),
  ], { effects: [herz(60), BESCHWINGT], next: 'nyra' }),
  node('angebahnt', [
    n('Sie findet das Wort nicht. Sie steht ganz nah vor dir, so nah, dass ihre Zöpfe deine Schulter streifen. Ihre Hand liegt flach auf deinem Gurtzeug, über dem Brustriemen, da, wo dein Herz noch immer so rast wie über der Bank.'),
    a('Das klopft ja immer noch.', 'verlegen'),
    v('Ist das Labor. Adrenalin.', 'verlegen'),
    a('Klar. Labor.', 'zaertlich'),
    n('Sie lässt die Hand liegen. Lange. Dann nimmt sie sie weg, als hätte sie sich verbrannt, und lacht, und guckt dir nicht in die Augen.'),
  ], { effects: [herz(40)], next: 'nyra' }),
  node('crew', [
    a('Du bist so eine Irre. Komm her.', 'freude'),
    n('Sie haut dir die Metallfaust gegen die Schulter. Sanft. Dann noch mal, weniger sanft. Dann zieht sie dich in eine Umarmung, die nach Rauch und Bier riecht und dir zwei Rippen verbiegt.'),
  ], { effects: [herz(40)], next: 'nyra' }),
  node('nyra', [
    a('Nyra ist noch drin. Hinter der Tür.', 'trauer'),
    v('Wir holen sie.', 'neutral'),
    a('Ja. Wir. Merk dir das Wort. Wir.', 'besorgt'),
  ], { effects: [set('vexaria_bruch_b')] }),
]);

// ---------------------------------------------------------------------------
// rom-vexaria-rettung · „Ich halt nicht an“ (Tafel)

const rettung: DialogueDef = dlg('rom-vexaria-rettung', [
  node('start', [], {
    choices: [
      ch('…', 'pumpwerk', { when: not(COUNTDOWN) }),
      ch('…', 'werkstatt', { when: COUNTDOWN }),
    ],
  }),
  node('pumpwerk', [
    n('Pumpwerk Sieben. Rotlicht von einer Notlampe, Wasser bis zu den Knöcheln, das Rauschen der alten Pumpen wie ein Herzschlag, der zu langsam ist. In der OP-Nische, auf einer rostigen Trage: Aria.'),
    n('Weiter hinten, am Ventilstand, feilschen Xion und Ripper um sie. „Sechshundert.“ „Fünfhundert, sie hat Kratzer.“ „Sie hat einen ZERBERSTER.“ Sie stehen mit dem Rücken zu dir. Du hast drei Minuten. Vielleicht.'),
  ], { next: 'kralle' }),
  node('werkstatt', [
    n('Dantes Werkstatt, nach dem Countdown. Draußen qualmt die Mülltonne noch vom Chip. Drinnen liegt Aria auf der Einbauliege, die Augen offen, und sieht an die Decke. Durch die Decke. Durch alles.'),
    s('dante', 'Der Chip ist tot. Aber sie hängt noch drin. Wie in einem Traum, aus dem sie keiner weckt. Ich hab ihr Kekse hingehalten. Kekse, Vex! Sie hat nicht mal geblinzelt.', 'besorgt'),
  ], { next: 'kralle' }),
  node('kralle', [
    n('Du kniest dich neben sie. Ihre Augen leuchten violett, ein weiches, falsches Licht. Dann schnellt ihr silberner Arm hoch, ohne dass ihr Gesicht sich bewegt, und die Metallfinger krallen sich in dein Gurtzeug. In den Brustriemen. Und ziehen dich runter. Zu ihr.'),
    a('Unbefugte Person. Master wird informiert.', 'neutral'),
    n('Das Leder knirscht. Die Schnalle unter ihren Fingern verbiegt sich. Ihr Gesicht ist zehn Zentimeter vor deinem, und da ist niemand drin.'),
    v('Hey, Zöpfe. Ich bin\'s.', 'besorgt'),
  ], {
    choices: [
      ch('„Die Lücke. Viereinhalb Meter. Du hast gesagt, das spring ich nie.“', 'r1-luecke', { when: seen('rom-vexaria-luecke') }),
      ch('„Kronkorken. An meiner Tür. Du klebst jede Woche \'n neuen.“', 'r1-korken', { when: flag('vexaria_kronkorken') }),
      ch('„Das Oberlicht. Das Klappern. Wir waren beide da. Weißt du noch?“', 'r1-oberlicht', { when: flag('vexaria_oberlicht') }),
      ch('„Großmaul. Wach auf. Du schuldest mir \'ne Revanche.“', 'r1-revanche'),
    ],
  }),
  node('r1-luecke', [
    n('Die Finger am Riemen zucken. Einmal.'),
    a('Lü… Unbekannter Begriff.', 'neutral'),
    v('Lücke. Du bist gesprungen, schlecht und laut. Auf allen vieren gelandet. Hast gelacht wie \'n kaputter Kompressor.', 'besorgt'),
  ], { next: 'runde2' }),
  node('r1-korken', [
    n('Ihr Blick rutscht. Nur ein Stück. Weg von der Decke, hin zu deiner Weste, wo du ihn trägst, platt, mit Zahnabdruck: ihren ersten Kronkorken.'),
    a('Kronkorken. Gegenstand ohne Wert. Löschen.', 'neutral'),
    v('Nicht löschen. Hast du selbst gesagt. Auf Kanal 4. Nicht löschen.', 'besorgt'),
  ], { next: 'runde2' }),
  node('r1-oberlicht', [
    n('Etwas geht durch ihr Gesicht. Ein Zucken unter dem linken Auge, genau da, wo sie zuckt, wenn irgendwo eine Traverse knackt.'),
    a('Klap… pern.', 'neutral'),
    v('Ja. Das Klappern. Wir hören beide dasselbe. Wir hören\'s zusammen. Dann ist es weniger.', 'trauer'),
  ], { next: 'runde2' }),
  node('r1-revanche', [
    a('Revanche. Kein Eintrag.', 'neutral'),
    v('Lügnerin. Montags. Armdrücken. Du verlierst immer absichtlich in der dritten Runde, wenn Hunter guckt, damit er dich nicht für angeberisch hält.', 'besorgt'),
    n('Ihr Mundwinkel. Er bewegt sich nicht. Aber er will.'),
  ], { next: 'runde2' }),
  node('runde2', [
    n('Hinten am Ventilstand wird es lauter. Oder in der Werkstatt flucht Dante. Egal. Du hast nur noch sie.'),
  ], {
    choices: [
      ch('„Flutmauer. Sonnenuntergang. Du hast gezittert. Wind, hast du gesagt.“', 'r2-kuss', { when: flag('aria_kuss') }),
      ch('„Nie umdrehen, hat Kas gesagt. Guck. Ich dreh mich um. Ich dreh mich zu dir um.“', 'r2-kas', { when: flag('vexaria_kas_erzaehlt') }),
      ch('„Das Dach. Lichterketten. Du hast gefragt, ob das ein Date ist.“', 'r2-dach', { when: seen('rom-aria-dach') }),
      ch('„Du schnarchst wie \'n Moped. Auf meiner Matratze. Quer.“', 'r2-schnarchen', { when: flag('vexaria_nacht') }),
      ch('„Du hast mir mal den Schläger hingehalten und gesagt: Schlag zu, Weichei.“', 'r2-schlag'),
    ],
  }),
  node('r2-kuss', [
    n('Ihre echte Hand bewegt sich. Langsam, wie unter Wasser. Sie hebt sich und bleibt in der Luft stehen, einen Fingerbreit vor deinem Mund.'),
    a('Wind.', 'neutral'),
    n('Es ist kein Systemwort. Es ist ihres.'),
  ], { next: 'runde3' }),
  node('r2-kas', [
    n('Die Kralle am Riemen lockert sich. Einen Millimeter. Zwei.'),
    a('Umdrehen. Vex … dreht sich … nicht um.', 'neutral'),
    v('Doch. Jetzt schon. Für dich immer.', 'trauer'),
  ], { next: 'runde3' }),
  node('r2-dach', [
    a('Date. Abfrage: War das ein …', 'neutral'),
    v('Ja. Das war eins. Das war das beste, das ich je hatte. Ich hatte vorher keins. Zählt trotzdem.', 'besorgt'),
    n('Das Violett flackert. Wie eine Leuchtreklame, die nicht weiß, ob sie an oder aus sein will.'),
  ], { next: 'runde3' }),
  node('r2-schnarchen', [
    a('Ich schnarche nicht.', 'neutral'),
    n('Pause. Dann, viel leiser, fast unhörbar, mit einem Ton, den kein Chip der Welt hinkriegt:'),
    a('… Ich schnarche nicht, du Arschloch.', 'neutral'),
  ], { next: 'runde3' }),
  node('r2-schlag', [
    a('Schlag … zu.', 'neutral'),
    v('Weichei. Hast du gesagt. Weichei. Zu mir. Keiner sagt Weichei zu mir.', 'besorgt'),
    n('Die silbernen Finger öffnen und schließen sich am Riemen. Als würde sie einen Schläger suchen.'),
  ], { next: 'runde3' }),
  node('runde3', [
    n('Ihr seid so nah, dass dein Atem ihre Wimpern bewegt. Ihre Pupillen ziehen sich zusammen und wieder auf, zusammen und auf. Da ist jemand. Ganz hinten. Der klopft.'),
  ], {
    choices: [
      ch('„ARIA. Ich halt nicht an. Nie. Aber für dich bleib ich stehen. Hier. Jetzt. Komm raus.“', 'durchbruch', { check: chk('vexaria-rettung-ausstrahlung', 'ausstrahlung', 6, ['trost']), effects: [herz(40)] }),
      ch('Ihre silberne Hand vom Riemen lösen und an deinen Metallarm legen. Metall an Metall. Wie über der Lücke.', 'langsam', { effects: [herz(30), { damage: 6 }] }),
      ch('Sie küssen. Mitten in den Nebel.', 'kuss', { when: all(PAAR, flag('aria_kuss')), effects: [herz(50)] }),
    ],
  }),
  node('langsam', [
    n('Du biegst ihre Finger auf. Einen nach dem anderen, wie deine eigenen nach dem Telefon. Es tut weh. Ihre Kralle reißt dir die Haut am Handgelenk auf, bevor sie loslässt. Dann legst du die silberne Hand an deinen schwarzen Unterarm. Metall auf Metall. Es klackt.'),
    n('Sie spürt es nicht. Das sagt sie dir oft genug. Aber sie hört es. Und ihr Gesicht – ihr Gesicht kommt zurück. Stück für Stück, wie ein Haus, in dem jemand die Lichter anmacht, Zimmer für Zimmer.'),
  ], { next: 'durchbruch' }),
  node('kuss', [
    n('Du küsst sie. Ganz vorsichtig. Ihre Lippen sind kalt und reglos, und eine schreckliche Sekunde lang ist da nichts.'),
    n('Dann küsst sie zurück. Erst nur ein Zucken. Dann richtig, verzweifelt, hungrig, die Hand im Riemen zieht dich nicht mehr runter, sie hält dich fest, und ein Geräusch kommt aus ihrer Kehle, das kein Chip machen würde.'),
  ], { next: 'durchbruch' }),
  node('durchbruch', [
    n('Das Violett geht aus. Wie ein Licht, das jemand ausknipst. Darunter: braun. Nass. Wütend. Sie.'),
    a('… Vex? Wieso kniest du? Wieso … heulst du?', 'ueberrascht'),
    v('Kühlflüssigkeit.', 'zaertlich'),
    a('Das ist MEIN Spruch, du Diebin. Du klaust mir meine – oh Gott. Oh Gott, was hab ich gesagt? Hab ich was gesagt? Ich hab „Master“ gesagt. Ich hab MASTER gesagt!', 'trauer'),
    v('Hast du. Zählt nicht. Neuer Tag.', 'neutral'),
    n('Sie zieht dich an den Riemen zu sich runter, diesmal mit Absicht, und drückt das Gesicht in deinen Hals. Sie zittert am ganzen Körper. Du hältst sie, bis es weniger wird.'),
  ], {
    choices: [
      ch('…', 'raus-pumpwerk', { when: not(COUNTDOWN) }),
      ch('…', 'raus-werkstatt', { when: COUNTDOWN }),
    ],
  }),
  node('raus-pumpwerk', [
    n('Hinten am Ventilstand verstummt das Feilschen.'),
    s('ripper', 'Xion. Unsere Ware steht auf.', 'wut'),
    s('ripper', 'Na gut. Dann eben nicht. Aus.', 'signatur'),
    n('Ein Klicken, wie ein Kugelschreiber. Arias silberner Arm fällt von deinem Rücken. Schlaff. Tot. Zwanzig Kilo, die plötzlich nichts mehr wollen.'),
    a('Mein Arm. Mein Arm, Vex, ich spür ihn nicht, ich spür ihn noch weniger als sonst –', 'besorgt'),
    v('Ich trag ihn. Ich trag dich. Halt dich fest. Mit dem anderen.', 'neutral'),
    n('Du nimmst sie huckepack. Mit Arm. Siebzig Kilo Brecherin und zwanzig Kilo totes Silber. Durchs Wasser, das Überlaufrohr hoch, die Leiter rauf, durch drei Hinterhöfe. Du hältst nicht an. Nicht ein Mal. Hinter dir lacht Ripper, und das Lachen wird kleiner, bis es weg ist.'),
  ], { next: 'ende' }),
  node('raus-werkstatt', [
    s('dante', 'Sie blinzelt. Sie BLINZELT! Um Himmels Willen! Kekse! Wer will Kekse?', 'freude'),
    n('Aria will ihn umarmen. Mit beiden Armen. Der silberne bleibt liegen, wo er liegt. Tot.'),
    a('Dante. Was ist mit meinem Arm.', 'besorgt'),
  ], { next: 'ende' }),
  node('ende', [], {
    effects: [
      set('vexaria_gerettet'), set('aria_arm_gesperrt'), { markSeen: 'rom-aria-ausfall' }, { startQuest: Q },
      { questStep: Q, step: 'dante' },
    ],
    choices: [
      ch('Weiter.', 'zu-dante', { when: not(COUNTDOWN) }),
      ch('Weiter.', 'bleiben', { when: COUNTDOWN }),
    ],
  }),
  node('zu-dante', [], { effects: [{ travel: 'dantes-werkstatt', entry: 'von-loetgassen', minutes: 40 }, { dialogue: 'rom-aria-ausfall' }] }),
  node('bleiben', [], { effects: [{ dialogue: 'rom-aria-ausfall' }] }),
]);

// ---------------------------------------------------------------------------
// Dachnächte (wöchentlich, Akt 2/3, als Paar) – über das Tagesgespräch

const dachFrage: DialogueDef = dlg('aria-vex-dach-frage', [
  node('start', [
    a('Dach? Ich brauch Luft. Und dich. In der Reihenfolge. Oder umgekehrt.', 'verlegen'),
  ], {
    choices: [
      ch('„Dach.“', undefined, { effects: [set('vexaria_dach_woche'), { dialogue: 'vexaria-dach-gespraech' }] }),
      ch('„Morgen. Versprochen.“', undefined, { effects: [set('vexaria_dach_woche')] }),
    ],
  }),
]);

const dachGespraech: DialogueDef = dlg('vexaria-dach-gespraech', [
  node('start', [
    n('Die Dachterrasse über der Neon-Gasse, nach Mitternacht. Vega ist weg, ihr Klappstuhl nicht. Ihr setzt euch auf die Brüstung, Aria zwischen deinen Knien, den Rücken an deiner Brust, dein Kinn auf ihrem Kopf. Ihre Zöpfe riechen nach Club und Regen.'),
  ], {
    effects: [set('vexaria_dach_gewesen')],
    choices: [
      ch('…', 'kas', { when: { weekday: ['mo', 'di'] } }),
      ch('…', 'klinik', { when: { weekday: ['mi', 'do'] } }),
      ch('…', 'meer', { when: { weekday: ['fr', 'sa'] } }),
      ch('…', 'narben', { when: { weekday: 'so' } }),
    ],
  }),
  node('kas', [
    a('Wie war er? Kas. Nicht die Geschichte. Er. Was hat er gegessen? Wie hat er gelacht?', 'neutral'),
    v('Nudeln. Nur Nudeln. Mit Senf. Hat gelacht wie ein Esel, der sich verschluckt. Hat jedes Lied falsch gesungen, mit voller Absicht, weil richtig langweilig war.', 'neutral'),
    v('Hat mir die Haare geschnitten. Mit der Rohrzange. Sah scheiße aus. Hab\'s jahrelang so gelassen.', 'freude'),
    a('Ich hätt ihn gemocht.', 'zaertlich'),
    v('Er hätt dich gehasst. Zu laut. Und dann hätt er dich nach drei Tagen adoptiert.', 'zaertlich'),
    n('Sie lacht in deinen Arm hinein. Du spürst es in den Rippen.'),
  ], { next: 'nah' }),
  node('klinik', [
    a('Nach dem Unfall, in der Klinik, hab ich jede Nacht die Deckenplatten gezählt. Vierundsechzig. Mit einem Wasserfleck, der aussah wie ein Hund. Ich hab den Hund Kabel genannt.', 'trauer'),
    a('Die Ärzte haben über mich geredet, als wär ich nicht da. „Die Linke ist nicht zu retten.“ Als hätt ich zwei Linke und eine wär übrig.', 'wut'),
    v('Ich red nie über dich, als wärst du nicht da.', 'neutral'),
    a('Nee. Du redest gar nicht. Ist besser. Ist viel besser.', 'zaertlich'),
    n('Sie nimmt deine echte Hand und legt sie auf die Narbe an ihrer Schulter, da, wo das Silber anfängt. Durch das Netzshirt fühlt sich die Naht warm an. Sie lässt dich lange da liegen.'),
  ], { next: 'nah' }),
  node('meer', [
    a('Wenn das alles vorbei ist. Blade, Chip, Party, der ganze Scheiß. Was machst du dann?', 'neutral'),
    v('Ausliefern.', 'neutral'),
    a('Vex.', 'wut'),
    v('… Ans Meer. Hab ich nie gesehen. Kas wollte immer. Hat\'s nie geschafft.', 'trauer'),
    a('Ich auch nicht. Wir sehen\'s zusammen. Zum ersten Mal. Beide gleichzeitig. Dann gewinnt keine.', 'zaertlich'),
    v('Ich gewinn trotzdem. Ich renn schneller.', 'signatur'),
    a('Ich schubs dich vorher in den Sand.', 'freude'),
  ], { next: 'nah' }),
  node('narben', [
    a('Zeig mal.', 'neutral'),
    v('Was?', 'ueberrascht'),
    a('Wo der Ripper-Arm anfängt. Du zeigst mir nie, wo er anfängt.', 'zaertlich'),
    n('Du schiebst den Ärmel hoch. Über dem Ellbogen, wo das Schwarz in die Haut übergeht, eine wulstige Naht, schlecht verheilt, Rippers Handschrift. Aria fährt sie mit dem Zeigefinger nach. Ganz langsam. Du hältst die Luft an, ohne es zu wollen.'),
    a('Das spürst du.', 'verlegen'),
    v('Das spür ich.', 'verlegen'),
    a('Gut. Ich mein … gut. Für dich. Wegen … Medizin.', 'verlegen'),
  ], { next: 'nah' }),
  node('nah', [
    n('Irgendwann dreht sie sich zu dir um. Zwischen deinen Knien, auf der Brüstung, über neun Stockwerken, und es ist ihr egal. Sie küsst dich. Langsam, ohne Eile, als hätte sie die ganze Nacht, und die hat sie.'),
    n('Ihre echte Hand wandert unter den Brustriemen deines Gurtzeugs und bleibt flach auf deinem Top liegen. Deine Metallfinger in ihren Zöpfen, die echten in ihrem Nacken, da, wo sie empfindlich ist. Sie seufzt in deinen Mund.'),
    a('Bude? Oder hier, bis Vega mit dem Fernglas um die Ecke kommt?', 'verlegen'),
  ], {
    choices: [
      ch('„Bude.“', undefined, { effects: [set('vexaria_nacht_woche'), BESCHWINGT, { cutscene: 'vexaria-nacht-kurz' }] }),
      ch('„Hier. Noch ein bisschen.“', undefined, { effects: [herz(15), BESCHWINGT, { advanceTime: 120 }] }),
    ],
  }),
]);

// ---------------------------------------------------------------------------
// Akt-2-Flirtpool (Vex, zusammen): an ungeraden Kalendertagen statt des allgemeinen Pools

const AKT2_ZEILEN: DialogueLine[][] = [
  [a('Ich hab heute meinen Schläger mit links gehalten. Mit dem Arm. Hat geklappt. Ich will, dass du mir dafür heute Abend was Unanständiges sagst.', 'verlegen'), v('Zwanzig Kilo Silber. Und du.', 'signatur'), a('… Das war nicht unanständig, das war schön. Mach\'s nochmal anders.', 'verlegen')],
  [a('Du riechst nach Kanalwasser. Immer noch. Ich hab dich trotzdem an der Wand geküsst. Was sagt das über mich?', 'verlegen')],
  [a('Wenn Blade mich nochmal anfasst, beiß ich. Wenn du mich anfasst … beiß ich auch. Aber anders.', 'signatur')],
  [a('Dante hat mich gefragt, warum ich so grinse. Ich hab gesagt: Gurtzeug. Er hat\'s nicht verstanden. Er hat\'s total verstanden.', 'verlegen')],
  [a('Ich hab heute Nacht geträumt, dass du anhältst. Mitten auf der Straße. Nur für mich. Dann bin ich aufgewacht und du hast quer über mir gelegen. Hat auch gezählt.', 'zaertlich')],
  [v('Du hast meinen Pulli an.', 'neutral'), a('Deiner riecht nach dir. Meiner riecht nach Ripper-Praxis. Ist doch klar, oder?', 'zaertlich')],
  [a('Countdown bis zur Party. Countdown bis Blade. Und mein liebster: Countdown bis du heute Abend die Schnallen aufmachst. Der ist der kürzeste.', 'verlegen')],
];

const akt2Defs: DialogueDef[] = AKT2_ZEILEN.map((l, i) => dlg(`aria-vex-akt2-${i + 1}`, [node('start', l)]));
const UNGERADE = poolDays(0, 2);
const akt2Talk: TalkDef[] = AKT2_ZEILEN.map((_, i) => ({
  dialogue: `aria-vex-akt2-${i + 1}`,
  when: all(V, PAAR, AKT2, not(AKT3), { cycleDay: UNGERADE.filter((_, k) => k % AKT2_ZEILEN.length === i) }),
}));

/** Für aria.ts: Dachnacht-Frage und Akt-2-Flirtpool (vor den allgemeinen Vex-Pools einhängen). */
export const AKT2_TALK: TalkDef[] = [
  { dialogue: 'aria-vex-dach-frage', when: all(V, PAAR, AKT2, not(EPILOG), { time: 'nacht' }, noFlag('vexaria_dach_woche')) },
  ...akt2Talk,
];

// ---------------------------------------------------------------------------
// Crew-Kommentare

const crewDante: DialogueDef = dlg('vexaria-crew-dante-rettung', [
  node('start', [
    s('dante', 'Du hast sie getragen. Den ganzen Weg vom Pumpwerk. Kanal 4 hat live berichtet. Sieben-Neun hat geweint. ICH hab geweint. Captain Kuschel hat nicht geweint, aber nur, weil er aus Plüsch ist.', 'freude'),
    s('dante', 'Heiliges Kanonenrohr. Wenn du ihr jemals wehtust, bau ich dir einen Toaster in den Ellbogen. Einen, der nur verbrennt.', 'signatur'),
  ]),
]);

const crewVega: DialogueDef = dlg('vexaria-crew-vega-akt2', [
  node('start', [
    s('vega', 'Ich hab euch gestern vom Ausguck gesehen. Auf der Brüstung. Bei Wind von Nordost, Stärke vier.', 'neutral'),
    s('vega', 'Ihr wart zu weit vorne. Rutscht ihr ab, fang ich keine von euch. Ich hab nur zwei Hände und ein Gewehr.', 'besorgt'),
    s('vega', 'Achthundert Meter. Gilt immer noch. Für beide Richtungen.', 'signatur'),
  ]),
]);

const crewHunter: DialogueDef = dlg('vexaria-crew-hunter-akt2', [
  node('start', [
    s('hunter', 'Postbotin. Setz dich. Nein, nicht da, da sitzt Nyra. Da sitzt immer noch Nyra.', 'trauer'),
    s('hunter', 'Du hast meine Brecherin aus dem Kanal geholt. Ich bezahl dich nicht dafür, weil das kein Auftrag war. Ich bezahl dir trotzdem ein Bier, weil ich alt werde und sentimental.', 'neutral'),
    s('hunter', 'Keine Turteleien auf meiner Tanzfläche. … Na gut. Eine.', 'signatur'),
  ]),
]);

const crewRipper: DialogueDef = dlg('vexaria-crew-ripper-akt2', [
  node('start', [
    s('ripper', 'Mein Lieblingskundenpaar. Ihr habt mir eine Ware gestohlen, einen Code abgeluchst und meine Mandarine zerquetscht.', 'wut'),
    s('ripper', 'Herzlichen Glückwunsch. Ich schick \'ne Rechnung. Montag. Wie immer, Schätzchen.', 'signatur'),
  ]),
]);

// ---------------------------------------------------------------------------
// Cutscenes und Ereignisse

const cutscenes: CutsceneDef[] = [
  cut('rom-vexaria-rettung', 'Ich halt nicht an', [
    { image: 'cut-rom-vexaria-rettung', pan: 'in', fade: 'in', hold: 3000, caption: 'Rotlicht. Wasser. Eine Hand aus Silber im Gurtzeug.' },
  ]),
];

const RETTUNG_BASIS: Condition = all(V, AKT2, CHIP, noFlag('vexaria_gerettet'), not(seen('rom-aria-ausfall')));

export const AKT2_EVENTS: HeartEventDef[] = [
  {
    id: 'vexaria-bruch-a', hearts: 1, map: 'loetgassen',
    when: all(V, AKT2, CHIP, flag('bruch_entkommen'), not(GERETTET), not(COUNTDOWN), not(seen('vexaria-bruch-a'))),
    dialogue: 'vexaria-bruch-a',
    effects: [{ xp: 25 }],
  },
  {
    id: 'vexaria-bruch-b', hearts: 1, map: 'high-voltage', time: ['abend', 'nacht'],
    when: all(V, AKT2, flag('aria_entkommen'), flag('bruch_entkommen'), HEUTE_FREI, not(seen('vexaria-bruch-b'))),
    dialogue: 'vexaria-bruch-b',
    effects: [{ xp: 25 }],
  },
  {
    id: 'rom-vexaria-rettung', hearts: 1, map: 'pumpwerk-sieben',
    when: all(RETTUNG_BASIS, not(COUNTDOWN), not(seen('rom-vexaria-rettung'))),
    cutscene: 'rom-vexaria-rettung',
    dialogue: 'rom-vexaria-rettung',
    effects: [{ xp: 50 }, set('aria_heute')],
  },
  {
    id: 'rom-vexaria-rettung-werkstatt', hearts: 1, map: 'dantes-werkstatt',
    when: all(RETTUNG_BASIS, COUNTDOWN, not(seen('rom-vexaria-rettung'))),
    cutscene: 'rom-vexaria-rettung',
    dialogue: 'rom-vexaria-rettung',
    effects: [{ xp: 50 }, set('aria_heute'), { markSeen: 'rom-vexaria-rettung' }],
  },
];

export const part: ContentPart = {
  dialogues: byId([bruchA, bruchB, rettung, dachFrage, dachGespraech, ...akt2Defs, crewDante, crewVega, crewHunter, crewRipper]),
  cutscenes: byId(cutscenes),
  mapAdditions: {
    'dantes-werkstatt': {
      onEnter: [{
        id: 'vexaria-crew-dante-rettung', when: all(V, GERETTET, seen('rom-aria-ausfall'), noFlag('aria_heute')),
        dialogue: 'vexaria-crew-dante-rettung',
      }],
    },
    'neon-gasse': {
      onEnter: [{
        id: 'vexaria-crew-vega-akt2', when: all(V, PAAR, AKT2, flag('vexaria_dach_gewesen'), { time: ['morgen', 'tag'] }),
        dialogue: 'vexaria-crew-vega-akt2',
      }],
    },
    'high-voltage': {
      onEnter: [{
        id: 'vexaria-crew-hunter-akt2', when: all(V, GERETTET, flag('aria_arm_frei'), { time: ['abend', 'nacht'] }),
        dialogue: 'vexaria-crew-hunter-akt2',
      }],
    },
    'ripper-praxis': {
      onEnter: [{
        id: 'vexaria-crew-ripper-akt2', when: all(V, PAAR, { quest: Q, state: 'done' }),
        dialogue: 'vexaria-crew-ripper-akt2',
      }],
    },
  },
};

