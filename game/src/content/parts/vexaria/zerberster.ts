// Aria-Strang „Zerberster-Herz“, Akt 2: he-aria-8 (Variante B), Station 5 `rom-aria-ausfall` und die persönliche Quest
// `pers-aria-zerberster` „Wem gehört der Arm?“ (world.md §4.2 aria, §4.7 Station 5, §6.3 Nr. 39), mit Vex-Fassungen.
//
// Ablauf: Variante A von main-2-bruch (`aria_gechippt`): direkt nach `main-2-countdown` erwacht Aria auf Dantes Tisch,
// der Zerberster ist tot (für Vex vorher `rom-vexaria-rettung`, akt2.ts). Variante B: `he-aria-8` auf dem Schrottmarkt,
// Ripper sperrt den Arm per Fernbedienung, nachts bei Dante dann `rom-aria-ausfall`.
// Entscheidung `aria_weg_gemeinsam` | `_deal` | `_alleingang` → Code holen → Dante spielt ihn ein (`aria_arm_frei`) →
// `aria_streit_scham` | `_deal` | `_alleingang` für den Streit (versoehnung.ts) bzw. die Krise (krise.ts, Vex mit Brücke).
import type { ContentPart } from '../../part';
import type { Condition, DialogueDef, HeartEventDef, PhoneMessageDef, QuestDef } from '../../../modules/contracts';
import {
  a, AKT2, all, any, byId, ch, chk, cut, dlg, flag, GOSSE_ANDERE, GOSSE_VEX, herz, HEUTE_FREI, msg, n, node,
  noFlag, not, NOT_V, R, s, seen, set, STATION_START, V, v, ZUSAMMEN,
} from './_util';

const Q = 'pers-aria-zerberster';
const AKTIV: Condition = { quest: Q, state: 'active' };
const GEMEINSAM = flag('aria_weg_gemeinsam');
const DEAL = flag('aria_weg_deal');
const ALLEIN = flag('aria_weg_alleingang');
/** Code in der Hand: per Flag oder durch einen gewonnenen Praxis-Kampf. */
const CODE: Condition = any(
  flag('aria_code'), { won: 'enc-praxis-ripper' }, { won: 'enc-praxis-ripper-vex' },
  { won: 'enc-praxis-ripper-allein' }, { won: 'enc-praxis-ripper-allein-vex' },
);
/** Vex mit Aria zusammen bzw. angebahnt (Zärtlichkeitszeilen in der Not). */
const VEX_NAH: Condition = all(V, R, any(ZUSAMMEN, flag('aria_romanze_angebahnt')));
const step = (id: string) => ({ questStep: Q, step: id });

// ---------------------------------------------------------------------------
// he-aria-8 · „Der Zerberster-Beleg“ (Variante B, ♥8, Schrottmarkt, tagsüber)

const he8: DialogueDef = dlg('he-aria-8', [
  node('start', [
    n('Schrottmarkt, Inkasso-Gasse. Aria hat gerade einen Akku-Händler gegen die Wand gelehnt, freundlich, mit dem Schläger quer vor seiner Brust. Die Leute gucken. Die Leute gucken immer, wenn Aria arbeitet.'),
    a('Drei Wochen, Schätzchen. Hunter ist geduldig. Ich bin Hunters Geduld. Und meine ist gerade –', 'signatur'),
    n('Hinter ihr klickt etwas. Ein kleines, sauberes Klicken, wie ein Kugelschreiber.'),
    s('ripper', 'Aus.', 'signatur'),
    n('Ripper steht am Ende der Gasse, eine Fernbedienung zwischen zwei Fingern, so klein wie ein Feuerzeug. Der Zerberster fällt. Einfach so. Der silberne Arm sackt an Arias Seite herunter wie ein nasser Sandsack, die Finger offen, der Schläger klappert aufs Pflaster.'),
    a('Was … was hast du –', 'ueberrascht'),
    s('ripper', 'Gekauft ist gekauft, Schätzchen. Der Kern ist nie bezahlt worden. Dante hat ihn bei mir bestellt, per Fax, vor drei Jahren. Ich hab ihn geliefert. Mit Händlersperre. Ich bin Geschäftsmann, keine Wohlfahrt.', 'signatur'),
    s('ripper', 'Vierhundert Credits, und er wackelt wieder. Oder du überlegst dir was Hübsches. Ich bin flexibel.', 'freude'),
    n('Der Akku-Händler ist weg, bevor einer was sagen kann. Die Leute gucken immer noch. Aria versucht, den Schläger aufzuheben. Mit der falschen Hand. Es geht nicht. Sie versucht es noch mal.'),
  ], {
    choices: [
      ch('Den Schläger aufheben und ihr geben.', 'schlaeger', { effects: [herz(20)] }),
      ch('Ripper hinterher.', 'ripper'),
      ch('„Komm. Zu Dante.“', 'dante', { when: NOT_V }),
      ch('„Komm. Zu Dante. Ich trag den Arm, du trägst die Wut.“', 'dante', { when: V }),
    ],
  }),
  node('schlaeger', [
    n('Du hebst den Schläger auf. Sie nimmt ihn mit der echten Hand, ohne dich anzusehen, und klemmt ihn unter den toten Arm.'),
    a('Danke. Sag nix. Bitte sag jetzt einfach nix.', 'trauer'),
  ], { next: 'dante' }),
  node('ripper', [
    n('Ripper ist schon um die Ecke, als du die Gasse erreichst. Nur sein Lachen hängt noch zwischen den Ständen, und ein Hauch Desinfektionsmittel.'),
    n('Hinter dir sagt Aria leise: „Lass. Lass ihn. Bitte.“ Sie sagt nie bitte.'),
  ], { next: 'dante' }),
  node('dante', [
    a('Der Arm wiegt zwanzig Kilo, wenn er tot ist. Wusstest du das? Ich wusste das nicht. Ich hab ihn nie tot getragen.', 'besorgt'),
    n('Ihr lauft. Langsam. Ihr Arm hängt zwischen euch. Heute Nacht, in Dantes Werkstatt, wird sich zeigen, wie schlimm es ist.'),
  ], { effects: [set('aria_arm_gesperrt'), { startQuest: Q }, msg('Aria braucht Dante. Heute Nacht, in der Werkstatt.')] }),
]);

// ---------------------------------------------------------------------------
// Station 5 · rom-aria-ausfall · „Wem gehört der Arm?“

const ausfall: DialogueDef = dlg('rom-aria-ausfall', [
  node('start', [], {
    effects: STATION_START,
    choices: [
      ch('…', 'a-vex', { when: all(flag('aria_gechippt'), flag('vexaria_gerettet'), not({ quest: 'main-2-countdown', state: 'done' })) }),
      ch('…', 'a', { when: all(flag('aria_gechippt'), not(all(flag('vexaria_gerettet'), not({ quest: 'main-2-countdown', state: 'done' })))) }),
      ch('…', 'b', { when: noFlag('aria_gechippt') }),
    ],
  }),
  node('a', [
    n('Dantes Werkstatt. Die Mülltonne draußen in der Gasse qualmt noch vom Chip. Captain Kuschel liegt mit dem Gesicht nach unten im Regal, als könnte er das alles nicht mitansehen.'),
    n('Aria liegt auf der Einbauliege. Sie öffnet die Augen. Langsam. Dann sehr schnell.'),
    a('Schon wieder dieser Tisch. Schon wieder wach, und es fehlt was.', 'trauer'),
    n('Sie will sich aufstützen. Mit links. Der Zerberster bewegt sich nicht. Kein Summen, kein Klacken. Nichts.'),
    s('dante', 'Nicht. Bleib liegen. Der Arm ist … Ripper. Im Pumpwerk, bevor wir da waren. Händlersperre im Kern.', 'besorgt'),
    n('Dantes Telefon brummt auf der Werkbank. Lautsprecher, natürlich. Ripper hat noch nie leise telefoniert.'),
    s('ripper', '(Telefon) Gekauft ist gekauft. Der Kern ist nie bezahlt worden. Ich hol mir nur, was mir gehört. Und Xion hat mir heute Nacht für sechshundert Credits ein Chipmädchen angedreht, das mir dann weggerannt ist. Ich bin heute sehr schlecht gelaunt.', 'wut'),
  ], { next: 'kern' }),
  node('a-vex', [
    n('Dantes Werkstatt, kurz vor Morgengrauen. Du legst Aria auf die Einbauliege. Deine Schultern brennen, deine Knie zittern, dein Gurtzeug ist an der Brust aufgerissen, wo ihre Kralle saß. Dante steht im Schlafanzug da, mit einer Lötlampe in der Hand, als wollte er euch damit verteidigen.'),
    s('dante', 'Um Himmels Willen. Um Himmels WILLEN. Leg sie hin. Nein, nicht da, da – egal, ja, da.', 'besorgt'),
    n('Hinter Arias Ohr pulsiert der Chip noch. Schwach, blau, wie ein Glühwürmchen, das nicht weiß, dass es tot sein sollte. Dante sieht ihn an und wird blass.'),
    s('dante', 'Der ist noch drin. Den hol ich raus, sobald ich weiß, wie, ohne dass er hochgeht. Erst der Arm. Der Arm ist das, was sie jetzt umbringt.', 'besorgt'),
    s('ripper', '(Telefon) Gekauft ist gekauft, Postbotin. Der Kern ist nie bezahlt worden. Und du hast mir gerade sechshundert Credits weggetragen. Huckepack. Ich bin heute sehr, sehr schlecht gelaunt.', 'wut'),
  ], { next: 'kern' }),
  node('b', [
    n('Dantes Werkstatt, mitten in der Nacht. Nur die Lampe über der Einbauliege brennt. Der Zerberster liegt aufgeklappt da wie ein Motorblock, Dante hat drei Lupen auf der Stirn und keinen einzigen Witz im Gesicht.'),
    a('Schon wieder dieser Tisch. Schon wieder wach, und es fehlt was.', 'trauer'),
  ], { next: 'kern' }),
  node('kern', [
    a('Glotz nicht so. Ich heul nicht. Das ist Kühlflüssigkeit.', 'wut'),
    s('dante', 'Um Himmels Willen, der Mistkerl hat den Code in Analog-Logik verschachtelt. Analog! Mein Gebiet! Ich hasse ihn! Ich hasse ihn mit Röhren!', 'wut'),
    a('Ohne das Ding bin ich nix, hörst du? Nix. Ich krieg nicht mal mein Shirt allein an.', 'besorgt'),
    n('Ihr Bandshirt liegt zusammengeknüllt auf dem Hocker. Kabelbrand, der rote Stern. Dante hat es ihr ausziehen müssen, um an die Schulter zu kommen. Sie sitzt im schwarzen Unterhemd da und hält sich mit der echten Hand den toten Arm, als wäre er ein Kind.'),
  ], {
    choices: [
      ch('Ihr das Shirt anziehen. Vorsichtig.', 'shirt-vex', { when: VEX_NAH }),
      ch('Ihr das Shirt reichen.', 'shirt', { when: not(VEX_NAH) }),
      ch('Die Sperre halb überbrücken.', 'notbehelf', { check: chk('aria-ausfall-technik', 'technik', 6, ['reparatur', 'cyberware']), when: NOT_V, effects: [herz(40), set('aria_finger_wackeln')] }),
      ch('„Analog-Verschachtelung. Gib mir die Platine.“', 'schrott', { tag: '[Schrott]', when: all(NOT_V, { origin: 'origin-schrott' }), check: chk('aria-ausfall-schrott', 'technik', 5, ['reparatur']), effects: [herz(40), set('aria_finger_wackeln')] }),
      ch('„Ich hol dir den Analog-Prüfer aus Lötzinns Laden. Zehn Minuten. Übers Dach.“', 'pruefer', { when: V, check: chk('vexaria-ausfall-reflexe', 'reflexe', 6, ['dach', 'rennen']), effects: [herz(40), set('aria_finger_wackeln'), { advanceTime: 10 }] }),
      ch('Neben ihr sitzen bleiben.', 'sitzen'),
    ],
  }),
  node('shirt-vex', [
    v('Arme hoch.', 'neutral'),
    a('… Arm. Einzahl. Du Arschloch.', 'trauer'),
    v('Arm hoch.', 'zaertlich'),
    n('Sie lacht. Es ist ein kaputtes, nasses Lachen, aber es ist eins. Du fädelst den toten Arm durch den Ärmel, zwanzig Kilo Silber, Zentimeter für Zentimeter, damit kein Saum an den Platten hängen bleibt. Dann den Kopf. Ihre Zöpfe bleiben im Kragen hängen. Du ziehst sie raus, einen nach dem anderen. Deine Fingerknöchel streifen ihren Nacken. Sie hält ganz still.'),
    a('Du bist so vorsichtig. Hör auf damit. Ich heul sonst wirklich.', 'verlegen'),
    v('Kühlflüssigkeit.', 'zaertlich'),
    a('… Genau. Kühlflüssigkeit.', 'zaertlich'),
  ], { effects: [herz(30)], next: 'entscheidung' }),
  node('shirt', [
    n('Du reichst ihr das Shirt. Sie starrt es an. Dann dich.'),
    a('Hilf mir. Und wenn du lachst, beiß ich dich.', 'wut'),
    n('Du lachst nicht. Ihr kriegt es zusammen hin, nach drei Versuchen und vier Flüchen.'),
  ], { effects: [herz(20)], next: 'entscheidung' }),
  node('notbehelf', [
    n('Zwei Krokodilklemmen, ein Draht quer über die Analog-Logik, ein Stoßgebet zu einem Gott, an den Dante nur beim Löten glaubt. Dann zuckt etwas im Zerberster. Der kleine Finger. Dann der Ringfinger.'),
    a('Er wackelt! Scheiße, er WACKELT!', 'ueberrascht'),
    s('dante', 'Nur die Finger. Zum Zerbersten reicht das nicht. Aber zum Bier halten.', 'freude'),
  ], { next: 'entscheidung' }),
  node('schrott', [
    s('dante', 'Endlich versteht mich einer! Endlich! Halt die Klemme, halt sie, nicht wackeln – JA!', 'freude'),
    n('Die Finger des Zerbersters zucken. Einer nach dem anderen, wie ein Klavier, das sich räuspert.'),
    a('Er wackelt! Scheiße, er WACKELT!', 'ueberrascht'),
  ], { next: 'entscheidung' }),
  node('pruefer', [
    n('Du bist weg, bevor Dante den Satz zu Ende flucht. Fenster, Regenrinne, zwei Dächer, Lötzinns Oberlicht, das nie abgeschlossen ist. Mira wird morgen einen Zettel finden: „Hab den Prüfer. Zahl Montag. – V.“'),
    n('Neun Minuten. Dante steckt den Prüfer an, dreht an zwei Rädchen, flucht analog. Dann zuckt der kleine Finger des Zerbersters.'),
    a('Er wackelt! Scheiße, er WACKELT!', 'ueberrascht'),
    a('Du warst neun Minuten weg. Ich hab gezählt. Ich zähl sonst nie. Mach das nicht noch mal ohne Bescheid.', 'besorgt'),
  ], { next: 'entscheidung' }),
  node('sitzen', [
    n('Du setzt dich auf die Kante der Liege. Sie lehnt sich nicht an. Aber sie rückt auch nicht weg. Irgendwann liegt ihr Kopf an deiner Schulter, und keiner von euch erwähnt es.'),
  ], { effects: [herz(20)], next: 'entscheidung' }),
  node('entscheidung', [
    s('dante', 'Ohne Code ist der Arm ein Briefbeschwerer. Ripper hat den Code. Ripper gibt nie was her. Ripper gibt nicht mal Wechselgeld raus.', 'besorgt'),
    a('Dann holen wir ihn uns. Irgendwie. Ich weiß nur nicht wie. Ich weiß gar nix grad.', 'besorgt'),
  ], {
    choices: [
      ch('„Ich hol den Code. Heute Nacht. Allein. Ich bin schneller.“', 'vex-reflex', { when: V, once: true }),
      ch('„Wir holen ihn uns. Du und ich.“', 'gemeinsam', { when: NOT_V }),
      ch('„Wir. Nicht ich. Hab ich gelernt. Glaub ich.“', 'gemeinsam', { when: V }),
      ch('„Ich kümmer mich drum.“ (Heimlich mit Ripper verhandeln.)', 'deal'),
      ch('„Bleib hier. Ich hol ihn mir allein.“ (Nachts in die Praxis.)', 'allein'),
    ],
  }),
  node('vex-reflex', [
    v('Ich hol den Code. Heute Nacht. Allein. Ich bin schneller.', 'neutral'),
    a('Natürlich bist du schneller. Du bist immer schneller. Und immer allein.', 'wut'),
    n('Sie sagt es nicht laut. Das ist schlimmer.'),
  ], { next: 'entscheidung' }),
  node('gemeinsam', [
    a('Du und ich? Mit einem Arm und einem Schläger, den ich nicht halten kann?', 'ueberrascht'),
    a('… Okay. Okay. Ja. Wir holen ihn uns. Und wenn Ripper zickt, hau ich ihm mit dem toten Arm eine runter. Zwanzig Kilo. Mal sehen, wer dann lacht.', 'signatur'),
    s('dante', 'Fang beim Fax an. Ich hab den Kern damals per Fax bestellt. Wenn der Beleg noch im Speicher ist, gehört der Arm dir. Schwarz auf weiß. Na ja, grau auf grau.', 'neutral'),
  ], { effects: [set('aria_weg_gemeinsam'), herz(30), step('entscheidung')] }),
  node('deal', [
    a('Du kümmerst dich drum. Okay.', 'neutral'),
    n('Sie fragt nicht wie. Sie ist zu müde, um zu fragen. Du weißt, wo Ripper nachts sein Lager hat. Unten im Kanal-Sammler, hinter den Rechen. Du weißt auch, dass er dort mit sich reden lässt.'),
  ], { effects: [set('aria_weg_deal'), step('entscheidung')] }),
  node('allein', [
    a('Allein? Bist du – nein. Nein! Hörst du mir zu? Der hat Zerleger. Der hat –', 'wut'),
    n('Dante legt ihr die Hand auf die Schulter. Die echte. Sie ist zu erschöpft, um weiterzubrüllen. Sie sieht dich nur an. Lange.'),
    a('Wenn du mit weniger Teilen zurückkommst, als du hingehst, red ich nie wieder mit dir.', 'trauer'),
  ], { effects: [set('aria_weg_alleingang'), step('entscheidung')] }),
]);

// ---------------------------------------------------------------------------
// Weg „gemeinsam“: Faxspeicher (gc-127), dann Ripper in der Praxis

const fax: DialogueDef = dlg('aria-zerberster-fax', [
  node('start', [
    n('Dantes Faxgerät. Ein beiger Kasten aus einem Jahrhundert, in dem Leute Papier noch geglaubt haben. Der Speicher rattert, wenn man ihn weckt. Aria lehnt am Regal, den toten Arm im Tragetuch aus einem alten Bandshirt.'),
    a('Wenn das Ding mir meinen Arm zurückgibt, heirate ich es.', 'signatur'),
  ], {
    choices: [
      ch('Den Speicher durchsuchen.', 'gefunden', { check: 'gc-127', effects: [set('aria_beleg'), herz(20), { xp: 30 }] }),
      ch('Dante fragen, wie man das Ding bedient.', 'dante'),
    ],
  }),
  node('gefunden', [
    n('Drei Jahre Bestellungen. Röhren, Kekszutaten, ein Hundekorb, Röhren, Röhren. Und dann, eingeklemmt zwischen zwei Rechnungen für Lötzinn, ein Fax mit Rippers Briefkopf.'),
    n('„Kern Typ K-3, generalüberholt. Bezahlt: 1 × Eins!-Abend pro Monat, zu verlieren an R. Unbefristet.“ Darunter Rippers Unterschrift. Und ein Stempel. BEZAHLT.'),
    a('Bezahlt. BEZAHLT. Mit … Kartenspielen?', 'ueberrascht'),
    s('dante', 'Ich verlier einmal im Monat absichtlich gegen ihn. Seit drei Jahren. Es ist das Schwerste, was ich je gemacht hab. Er spielt so SCHLECHT.', 'verlegen'),
    a('Dante. Ich lieb dich. Sag\'s keinem.', 'freude'),
  ], { effects: [{ give: 'beglichener-schuldschein' }, msg('Beleg gefunden: Der Kern ist bezahlt.')] }),
  node('dante', [
    s('dante', 'Grüner Knopf, dann Stern, dann Raute, dann beten. Wenn es piept, ist alles gut. Wenn es zweimal piept, renn.', 'neutral'),
    n('Es piept dreimal. Dann druckt es eine Speisekarte von 2071. Mit mehr Zeit und Geduld klappt es vielleicht. Oder ihr geht direkt zu Ripper.'),
  ]),
]);

const praxis: DialogueDef = dlg('aria-zerberster-praxis', [
  node('start', [
    n('Rippers Praxis. Weiße Kacheln, die nicht ganz weiß sind. Eine Preistafel, auf der „Finger“ unter „Sonderangebote“ steht. Ripper sitzt auf seinem Behandlungsstuhl und schält eine Mandarine mit einem Skalpell.'),
    s('ripper', 'Die Brecherin und ihr Schatz. Kommt ihr den Arm abholen oder den Rest von ihr abgeben?', 'signatur'),
    a('Ich hab noch einen Arm, der funktioniert, Ripper. Rate mal, welcher dir gleich die Zähne nachzählt.', 'wut'),
  ], {
    choices: [
      ch('Den Beleg auf den Tisch legen.', 'beleg', { when: flag('aria_beleg') }),
      ch('„Container 77. Ich weiß, was drin ist. Die Wache würde es auch gern wissen.“', 'erpressen', { check: 'gc-128' }),
      ch('Vierhundert Credits hinlegen.', 'zahlen', { effects: [{ credits: -400 }] }),
      ch('„Code. Oder wir holen ihn uns.“', 'kampf'),
    ],
  }),
  node('beleg', [
    n('Du legst das Fax auf seine Mandarine. Er liest. Er liest es noch einmal. Das Skalpell bleibt in der Luft stehen.'),
    s('ripper', '… Dante, dieser hinterhältige Röhrenknutscher. Er verliert ABSICHTLICH?', 'wut'),
    s('ripper', 'Drei Jahre. Ich dachte, ich bin gut. Ich hab meiner Mutter erzählt, dass ich gut bin.', 'trauer'),
    n('Er kritzelt sechs Ziffern auf ein Rezeptblatt und wirft es dir hin, ohne hinzusehen.'),
    s('ripper', 'Raus. Beide. Und sagt Dante, nächsten Monat spielen wir ehrlich. Dann reiß ich ihm die Röhren raus.', 'wut'),
  ], { effects: [set('aria_code'), { relation: 'ripper', delta: -20 }] }),
  node('erpressen', [
    n('Rippers Lächeln bleibt, wo es ist. Nur die Augen gehen kurz zur Tür. Zur Hafenkante, irgendwo da draußen. Container 77.'),
    s('ripper', 'Du bist ja ein ganz schlimmes Schätzchen.', 'wut'),
    s('ripper', 'Sechs Ziffern. Und dann vergisst du die Zahl siebenundsiebzig. Für immer. Ich hab sehr gute Vergesslichkeitsimplantate, falls du Hilfe brauchst.', 'signatur'),
  ], { effects: [set('aria_code'), set('ripper_erpresst'), { relation: 'ripper', delta: -40 }] }),
  node('zahlen', [
    n('Vierhundert. Er zählt sie zweimal. Er riecht an einem Schein.'),
    s('ripper', 'Bargeld. Ich liebe Bargeld. Bargeld hat keine Gefühle.', 'freude'),
    a('Das war mein Arm, du Wichser. Den hast du mir grad zum zweiten Mal verkauft.', 'wut'),
    s('ripper', 'Und beim dritten Mal gibt\'s Rabatt. Ich bin ja kein Unmensch.', 'signatur'),
  ], { effects: [set('aria_code'), { give: 'beglichener-schuldschein' }] }),
  node('kampf', [], {
    choices: [
      ch('„Zöpfe. Links oder rechts?“', undefined, { when: V, effects: [{ battle: 'enc-praxis-ripper-vex' }] }),
      ch('Angreifen.', undefined, { when: NOT_V, effects: [{ battle: 'enc-praxis-ripper' }] }),
    ],
  }),
]);

// ---------------------------------------------------------------------------
// Weg „Deal“: Rippers Lager im Kanal-Sammler (nachts)

const lager: DialogueDef = dlg('aria-zerberster-lager', [
  node('start', [
    n('Rippers Lager hinter den Rechen. Kühlschränke ohne Strom, Kisten mit Etiketten wie „Leber, gebraucht“ und „Weihnachtsdeko“. Ripper sitzt auf einer Kiste, die „Nicht setzen“ heißt, und isst Nudeln mit Stäbchen.'),
    s('ripper', 'Ah. Der Schatz kommt allein. Das ist immer ein gutes Zeichen. Für mich.', 'signatur'),
  ], {
    choices: [
      ch('„Ripper. Den Code.“', 'vex', { when: V }),
      ch('„Den Code. Für einen Gefallen.“', 'gefallen', { when: NOT_V, check: chk('aria-deal-strasse', 'strasse', 6, ['verhandeln']) }),
      ch('Klopfen. Zweimal lang, dreimal kurz.', 'klopf', { ...GOSSE_ANDERE }),
      ch('Vierhundert Credits auf die Kiste legen.', 'zahlen', { effects: [{ credits: -400 }] }),
      ch('Ein seltenes Implantat anbieten.', 'implantat', { when: { item: 'seltenes-implantat' }, effects: [{ take: 'seltenes-implantat' }] }),
    ],
  }),
  node('vex', [
    s('ripper', 'Du bist doch Kurierin, Schätzchen. Ein Paket. Container 77, Dienstag. Dafür kriegst du den Code. Und ich streich dir drei Raten.', 'freude'),
    n('Drei Raten. Schon wieder. Der leichteste Weg, den es gibt. Ein Paket, ein Dach, ein Container. Das kannst du im Schlaf.'),
    v('Kannst du meinen auch sperren?', 'besorgt'),
    s('ripper', 'Muss ich nicht, Schätzchen. Du zahlst ja.', 'signatur'),
    n('Er lächelt. Dein Ellbogen zischt. Er hört es. Natürlich hört er es.'),
  ], {
    choices: [
      ch('Einschlagen.', 'gefallen-ok', { effects: [set('vexaria_raten_gestrichen')] }),
      ch('Klopfen. Zweimal lang, dreimal kurz.', 'klopf', { ...GOSSE_VEX }),
      ch('Vierhundert Credits auf die Kiste legen.', 'zahlen', { effects: [{ credits: -400 }] }),
    ],
  }),
  node('gefallen', [
    s('ripper', 'Ein Gefallen. Hübsches Wort. Container 77 an der Hafenkante, Dienstag. Ein Paket rein, keine Fragen raus.', 'freude'),
  ], { next: 'gefallen-ok' }),
  node('klopf', [
    n('Zweimal lang, dreimal kurz. Das Klopfzeichen der Unterstadt-Kliniken, für Leute, die nicht in der Kartei stehen wollen. Ripper hört auf zu kauen.'),
    s('ripper', 'Wer hat dir das beigebracht? … Nein. Will ich nicht wissen. Du bist eine von uns. Gefallen, kein Wort weiter. Container 77, Dienstag.', 'ueberrascht'),
  ], { next: 'gefallen-ok' }),
  node('gefallen-ok', [
    n('Er zieht ein Rezeptblatt aus der Kitteltasche. Sechs Ziffern, ein Nudelfleck.'),
    s('ripper', 'Und, Schätzchen: Sie erfährt nichts von mir. Ich bin diskret. Bis ich\'s nicht mehr bin.', 'signatur'),
  ], { effects: [set('aria_code'), set('ripper_gefallen'), msg('Rippers Gefallen: ein Paket nach Container 77 (Hafenkante).')] }),
  node('zahlen', [
    s('ripper', 'Bargeld im Kanal. Du bist romantisch. Hier. Sechs Ziffern.', 'freude'),
  ], { effects: [set('aria_code'), { give: 'beglichener-schuldschein' }] }),
  node('implantat', [
    n('Ripper nimmt das Implantat mit zwei Fingern, hält es gegen die Taschenlampe und atmet hörbar ein.'),
    s('ripper', 'Seriennummer gibt\'s nicht. Wunderschön. Der Code gehört dir. Und wir zwei sind quitt. Fürs Erste.', 'freude'),
  ], { effects: [set('aria_code'), { give: 'beglichener-schuldschein' }] }),
]);

// ---------------------------------------------------------------------------
// Weg „Alleingang“: nachts in die Praxis

const einbruch: DialogueDef = dlg('aria-zerberster-einbruch', [
  node('start', [
    n('Rippers Praxis bei Nacht. Der Vorhang zum Hinterzimmer bewegt sich im Luftzug einer Lüftung, die nie jemand repariert hat. Dahinter: eine Schublade, ein Code, zwei Zerleger, die im Stehen schlafen, und Ripper, der nie schläft.'),
  ], {
    choices: [
      ch('Durch die Dachluke. Ungesehen an die Schublade.', 'sauber', { when: V, check: chk('vexaria-einbruch-reflexe', 'reflexe', 6, ['schleichen', 'dach']) }),
      ch('Ungesehen an die Schublade.', 'sauber', { when: NOT_V, check: chk('aria-einbruch-reflexe', 'reflexe', 7, ['schleichen']) }),
      ch('Rein. Notfalls mit Gewalt.', 'kampf'),
    ],
  }),
  node('sauber', [
    n('Durch die Luke, auf den Medikamentenschrank, auf den Boden, ohne dass eine Fliese knackt. Die Schublade klemmt. Du ziehst. Ein Rezeptblatt, sechs Ziffern, ein Kaffeefleck.'),
    n('Auf dem Rückweg reißt dir ein Zerleger im Halbschlaf mit der Zange die Schulter auf. Er wacht nicht mal richtig auf. Du schon.'),
  ], { effects: [set('aria_code'), { damage: 12 }, set('heute_angeschlagen'), msg('Angeschlagen bis zum nächsten Schlaf.')] }),
  node('kampf', [], {
    choices: [
      ch('Durch den Vorhang.', undefined, { when: V, effects: [{ battle: 'enc-praxis-ripper-allein-vex' }, { damage: 8 }, set('heute_angeschlagen')] }),
      ch('Durch den Vorhang.', undefined, { when: NOT_V, effects: [{ battle: 'enc-praxis-ripper-allein' }, { damage: 8 }, set('heute_angeschlagen')] }),
    ],
  }),
]);

// ---------------------------------------------------------------------------
// Container 77: Rippers Gefallen erfüllen oder platzen lassen (Geste für rom-aria-regen bzw. die Krise)

const container77: DialogueDef = dlg('aria-container-77', [
  node('start', [
    n('Container 77. Rost, ein Vorhängeschloss ohne Bügel, drinnen riecht es nach Kühlakku und schlechtem Gewissen. Auf dem Boden ein Kreidekreuz: hier abstellen.'),
    n('Das Paket in deiner Hand ist kalt. Es brummt leise.'),
  ], {
    choices: [
      ch('Abliefern. Gefallen erledigt.', 'abliefern'),
      ch('Ins Hafenbecken damit. Und Rippers Stempel behalten.', 'platzen'),
    ],
  }),
  node('abliefern', [
    n('Du stellst es aufs Kreuz. Zehn Minuten später summt dein Telefon: ein Foto von einem Schuldschein, gestempelt BEZAHLT. Dann klopft ein Zerleger an die Containerwand und reicht dir das Original durch den Spalt.'),
  ], { effects: [set('ripper_gefallen', false), { give: 'beglichener-schuldschein' }, { relation: 'ripper', delta: 20 }] }),
  node('platzen', [
    n('Das Paket macht im Hafenbecken ein Geräusch wie ein beleidigter Kühlschrank und geht unter. In der Seitentasche steckte Rippers Stempel. Du stempelst dir den Schuldschein selbst. BEZAHLT. Sieht fast echt aus.'),
    n('Irgendwo in der Unterstadt bekommt Ripper gerade sehr schlechte Laune.'),
  ], { effects: [set('ripper_gefallen', false), set('ripper_deal_geplatzt'), { give: 'beglichener-schuldschein' }, { relation: 'ripper', delta: -50 }] }),
]);

// ---------------------------------------------------------------------------
// Code einspielen: der Arm wacht auf

const frei: DialogueDef = dlg('aria-zerberster-frei', [
  node('start', [
    n('Dantes Werkstatt. Aria liegt auf der Einbauliege, den Zerberster aufgeklappt, und tut so, als wäre sie nicht nervös. Sie kaut auf ihrem Zopf. Sie kaut nie auf ihrem Zopf.'),
    s('dante', 'Sechs Ziffern. Wenn Ripper uns verarscht hat, explodiert gleich nichts. Er mag keine Explosionen. Zu wenig Ersatzteile übrig.', 'neutral'),
    n('Dante tippt. Eins. Zwei. Drei. Vier. Fünf. Sechs.'),
    n('Stille.'),
    n('Dann ein Summen. Tief, aus der Schulter heraus, wie ein Kühlschrank, der nachts anspringt. Die silbernen Finger öffnen sich. Schließen sich. Ballen sich zur Faust.'),
    a('… Er ist da. Er ist DA!', 'ueberrascht'),
    n('Sie springt von der Liege, packt die Werkbank mit dem Zerberster und hebt sie an. Mit allem drauf. Dante schreit wegen seiner Röhren. Captain Kuschel fällt aus dem Regal.'),
  ], {
    choices: [
      ch('Weiter.', 'gemeinsam', { when: GEMEINSAM }),
      ch('Weiter.', 'deal', { when: DEAL }),
      ch('Weiter.', 'allein', { when: ALLEIN }),
    ],
  }),
  node('gemeinsam', [
    a('Wir haben das gemacht. Wir! Du und ich und ein Faxgerät!', 'freude'),
    n('Sie umarmt dich. Mit beiden Armen. Der Zerberster drückt ein bisschen zu fest, dann sofort weniger, als hätte er es gemerkt.'),
    n('Aber als sie loslässt, sieht sie dich einen Moment zu lange an. Als würde sie sich gerade an etwas erinnern. An einen Tisch. An Kühlflüssigkeit. An dich, wie du zugesehen hast.'),
  ], { effects: [set('aria_streit_scham')], next: 'ende' }),
  node('deal', [
    a('Wie hast du das gemacht? Ripper gibt nie was her.', 'ueberrascht'),
  ], {
    choices: [
      ch('„Ist egal.“', 'deal-ende'),
      ch('„Ich hab ihm einen Gefallen versprochen.“', 'deal-ehrlich', { when: flag('ripper_gefallen') }),
    ],
  }),
  node('deal-ende', [
    a('Ist egal. Okay. Ist egal.', 'neutral'),
    n('Sie lacht und beugt den Arm, wieder und wieder, und hört nicht auf. Sie fragt nicht weiter. Noch nicht.'),
  ], { effects: [set('aria_streit_deal')], next: 'ende' }),
  node('deal-ehrlich', [
    n('Sie hört auf, den Arm zu beugen.'),
    a('Einen Gefallen. Ripper. Für mich. Hinter meinem Rücken.', 'wut'),
    a('… Danke. Ich weiß nicht, ob ich dich gleich küssen oder schlagen will. Frag mich morgen.', 'trauer'),
  ], { effects: [set('aria_streit_deal'), set('aria_streit_gehoert')], next: 'ende' }),
  node('allein', [
    a('Was ist mit deiner Schulter? Was ist mit deinem GESICHT?', 'besorgt'),
    s('dante', 'Ich hab nix gesagt. Ich hab nur geguckt. Ich gucke sehr laut, ich weiß.', 'verlegen'),
    a('Du warst allein da drin. Bei Ripper. Mit seinen Zangen.', 'wut'),
    n('Der Zerberster summt. Sie ballt ihn zur Faust. Dann öffnet sie ihn wieder, ganz langsam, als würde sie sich zwingen.'),
  ], { effects: [set('aria_streit_alleingang')], next: 'ende' }),
  node('ende', [
    s('dante', 'Läuft. Sauber. Ripper-Kern, Dante-Hülle. Ihr seid jetzt wieder eine Abrissbirne. Bitte nicht in meiner Werkstatt.', 'freude'),
  ], {
    effects: [
      set('aria_arm_gesperrt', false), set('aria_arm_frei'), herz(40),
      msg('Der Zerberster läuft wieder.'),
    ],
  }),
]);

// ---------------------------------------------------------------------------
// Telefon und Tafeln

const phone: PhoneMessageDef[] = [
  {
    id: 'ripper-container-77', from: 'ripper', text: 'Container 77, Dienstag. Vergiss es nicht, Schätzchen. Ich vergesse nie was. Beruflich.',
    auto: all(flag('ripper_gefallen'), { weekday: ['mo', 'di'] }),
  },
];

const cutscenes = [
  cut('rom-aria-ausfall', 'Wem gehört der Arm?', [
    { image: 'cut-rom-aria-ausfall', pan: 'in', fade: 'in', hold: 2600, caption: 'Ein Tisch. Eine Lampe. Ein Arm, der nicht mehr antwortet.' },
  ]),
];

// ---------------------------------------------------------------------------
// Herz-Ereignisse

/** Variante A: gleich nach dem Countdown (Vex: Rettung in akt2.ts kettet den Dialog direkt an). Variante B: nachts nach he-aria-8. */
const AUSFALL_A: Condition = all(flag('aria_gechippt'), { quest: 'main-2-countdown', state: 'done' }, NOT_V);
const AUSFALL_B: Condition = all(noFlag('aria_gechippt'), seen('he-aria-8'), { time: 'nacht' });

export const ZERBERSTER_EVENTS: HeartEventDef[] = [
  {
    id: 'he-aria-8', hearts: 8, map: 'schrottmarkt', time: 'tag',
    when: all(AKT2, noFlag('aria_gechippt'), { quest: 'main-2-bruch', state: 'done' }, HEUTE_FREI, not(seen('he-aria-8'))),
    dialogue: 'he-aria-8',
    effects: [{ setFlag: 'aria_heute' }, { xp: 25 }],
  },
  {
    id: 'rom-aria-ausfall', hearts: 1, map: 'dantes-werkstatt',
    when: all(AKT2, any(AUSFALL_A, AUSFALL_B), not(seen('rom-aria-ausfall'))),
    cutscene: 'rom-aria-ausfall',
    dialogue: 'rom-aria-ausfall',
    effects: [
      { setFlag: 'aria_heute' }, { xp: 25 }, set('aria_arm_gesperrt'), { startQuest: Q }, step('dante'),
    ],
  },
];

// ---------------------------------------------------------------------------
// Quest

const quest: QuestDef = {
  id: Q,
  kind: 'personal',
  title: 'Wem gehört der Arm?',
  giver: 'aria',
  act: 2,
  summary: 'Ripper behauptet, der Zerberster-Kern sei nie bezahlt worden, und hat Arias Arm per Händlersperre lahmgelegt. Hol den Freischaltcode – mit Aria, hinter ihrem Rücken oder ganz allein.',
  steps: [
    { id: 'dante', text: 'Aria zu Dante bringen. Der Zerberster ist tot.', done: seen('rom-aria-ausfall'), marker: { map: 'dantes-werkstatt', at: 'einbau-liege' } },
    { id: 'entscheidung', text: 'Entscheiden, wie du an den Code kommst.', when: seen('rom-aria-ausfall'), done: any(GEMEINSAM, DEAL, ALLEIN), marker: { map: 'dantes-werkstatt', at: 'einbau-liege' } },
    { id: 'beleg', optional: true, text: 'Gemeinsam: In Dantes Faxspeicher nach dem Einbaubeleg suchen.', when: GEMEINSAM, done: any(flag('aria_beleg'), CODE), marker: { map: 'dantes-werkstatt', at: 'faxgeraet' } },
    { id: 'praxis', optional: true, text: 'Gemeinsam: Ripper in seiner Praxis zur Rede stellen (Beleg, Erpressung, 400 Cr oder Kampf).', when: GEMEINSAM, done: CODE, marker: { map: 'ripper-praxis', at: 'behandlungsstuhl' } },
    { id: 'lager', optional: true, text: 'Heimlich: Nachts zu Rippers Lager im Kanal-Sammler.', when: DEAL, done: CODE, marker: { map: 'kanal-sammler', at: 'rippers-lager' } },
    { id: 'einbruch', optional: true, text: 'Allein: Nachts in Rippers Praxis einsteigen.', when: ALLEIN, done: CODE, marker: { map: 'ripper-praxis', at: 'hinterzimmer-vorhang' } },
    { id: 'code', text: 'Den Freischaltcode holen.', when: any(GEMEINSAM, DEAL, ALLEIN), done: CODE },
    { id: 'einbau', text: 'Den Code zu Dante bringen.', when: CODE, done: flag('aria_arm_frei'), marker: { map: 'dantes-werkstatt', at: 'einbau-liege' } },
  ],
  reward: { xp: 220, relations: { aria: 100, ripper: -50 } },
};

// ---------------------------------------------------------------------------

export const part: ContentPart = {
  dialogues: byId([he8, ausfall, fax, praxis, lager, einbruch, container77, frei]),
  cutscenes: byId(cutscenes),
  phone: byId(phone),
  quests: { [Q]: quest },
  mapAdditions: {
    'dantes-werkstatt': {
      hotspots: [
        {
          id: 'aria-faxspeicher', at: 'faxgeraet', label: 'Faxspeicher durchsuchen', kind: 'use',
          when: all(AKTIV, GEMEINSAM, noFlag('aria_beleg'), not(CODE)), dialogue: 'aria-zerberster-fax',
        },
        {
          id: 'aria-code-einspielen', at: 'einbau-liege', label: 'Den Code einspielen', kind: 'use',
          when: all(AKTIV, CODE, noFlag('aria_arm_frei')), dialogue: 'aria-zerberster-frei',
        },
      ],
    },
    'ripper-praxis': {
      hotspots: [
        {
          id: 'aria-ripper-rede', at: 'behandlungsstuhl', label: 'Ripper zur Rede stellen', kind: 'talk',
          when: all(AKTIV, GEMEINSAM, not(CODE), { time: ['morgen', 'tag', 'abend'] }), dialogue: 'aria-zerberster-praxis',
        },
        {
          id: 'aria-einbruch', at: 'hinterzimmer-vorhang', label: 'Hinter den Vorhang', kind: 'use',
          when: all(AKTIV, ALLEIN, not(CODE), { time: 'nacht' }), dialogue: 'aria-zerberster-einbruch',
        },
        {
          id: 'aria-schuld-nachzahlen', at: 'preistafel', label: 'Rippers Gefallen mit 400 Cr ablösen', kind: 'use',
          when: flag('ripper_gefallen'),
          effects: [{ credits: -400 }, set('ripper_gefallen', false), { give: 'beglichener-schuldschein' }, msg('Gefallen abgelöst. Ripper stempelt: BEZAHLT.')],
        },
      ],
    },
    'kanal-sammler': {
      hotspots: [{
        id: 'aria-rippers-lager', at: 'rippers-lager', label: 'Ripper', kind: 'talk',
        when: all(AKTIV, DEAL, not(CODE), { time: 'nacht' }), dialogue: 'aria-zerberster-lager',
      }],
    },
    'hafenkante': {
      hotspots: [{
        id: 'aria-container-77', at: 'container-77', label: 'Rippers Paket abstellen', kind: 'use',
        when: flag('ripper_gefallen'), dialogue: 'aria-container-77',
      }],
    },
  },
};

