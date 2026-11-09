// Vex × Aria, Akt 2, Weg mit Akt-1-Brücke (`BRUECKE`, _util.ts): Der große Streit ist schon durch, Aria und Vex sind
// zusammen (oder Crew). Nach `pers-aria-zerberster` kommt statt `rom-aria-streit` die kurze Krise:
//   `rom-vexaria-krise` (A, high-voltage → Gasse): Kikis Lippenstift auf Vex' Wange + der Weg zum Code + Arias Angst,
//   seit dem Chip / dem toten Arm „weniger“ zu sein. Endet mit Arias Abgang aufs Dach.
//   `rom-vexaria-dachnacht` (N, loetgassen, gleiche Nacht, zählt mit der Krise als eine Station): Versöhnung auf dem
//   Dach der Kurierbude, lange Annäherung, Abblende auf Schwarz, kurzer Morgen.
// Freundschaft: `rom-vexaria-krise-fs`, kurz, ohne Eifersucht, Bier auf dem Dach in derselben Szene.
import type { ContentPart } from '../../part';
import type { Condition, CutsceneDef, DialogueDef, HeartEventDef } from '../../../modules/contracts';
import {
  a, AKT2, all, ANGEBAHNT, any, BESCHWINGT, BRUECKE, byId, ch, chk, cut, dlg, flag, herz, HEUTE_FREI, msg, n, node,
  not, R, s, seen, set, STATION_START, twin, V, v, ZUSAMMEN,
} from './_util';

const Q_DONE: Condition = { quest: 'pers-aria-zerberster', state: 'done' };
const DEAL = flag('aria_weg_deal');
const ALLEIN = flag('aria_weg_alleingang');
const CHIP = flag('aria_gechippt');
const ROM: Condition = all(R, any(ZUSAMMEN, ANGEBAHNT));

// ---------------------------------------------------------------------------
// rom-vexaria-krise · „Lippenstift“

const krise: DialogueDef = dlg('rom-vexaria-krise', [
  node('start', [
    n('Abend vor dem High Voltage. Du kommst von einer Lieferung, und Kiki Karbon hält mit quietschenden Reifen neben dir, das Taxifenster schon unten. Du hast ihr letzte Woche den Ersatzteilschein für die Lichtmaschine über drei Dächer gebracht. In einer Stunde. Sie hatte drei Tage gerechnet.'),
    s('kiki-karbon', 'Da ist sie ja! Meine Heldin! Meine kleine Rakete! Komm her –', 'freude'),
    n('Bevor du ausweichen kannst, hat sie dich am Gurtriemen durchs Fenster gezogen und dir einen Kuss auf die Wange gedrückt. Laut. Feucht. Kirschrot. Dann ist sie weg, und hinten am Taxi winkt ein Wackeldackel.'),
    n('Die Clubtür steht offen. In der Tür steht Aria. Sie hat alles gesehen. Natürlich hat sie alles gesehen.'),
    a('Hübsche Farbe. Steht dir. Passt zu gar nix an dir.', 'wut'),
  ], {
    effects: STATION_START,
    choices: [
      ch('„Kiki. Lichtmaschine. Ein Schein. Das war\'s.“', 'erklaeren'),
      ch('Die Wange mit dem Ärmel abwischen. Langsam. Sie dabei angucken.', 'wischen'),
      ch('„Eifersüchtig, Zöpfe?“', 'necken'),
    ],
  }),
  node('erklaeren', [
    a('Klar. Lichtmaschine. Ist ja auch egal. Ist alles egal.', 'wut'),
  ], { next: 'kern' }),
  node('wischen', [
    n('Du wischst. Der Lippenstift verschmiert nur. Jetzt hast du einen rosa Streifen bis zum Ohr. Arias Mundwinkel zuckt. Dann zwingt sie ihn wieder runter.'),
    a('Lass. Machst\'s nur schlimmer. Wie immer.', 'wut'),
  ], { next: 'kern' }),
  node('necken', [
    a('Ja! JA, okay? Bin ich! Weil sie dich anfassen darf, einfach so, durchs Taxifenster, und ich steh hier und weiß nicht mal mehr, ob ich das noch darf!', 'wut'),
    n('Es ist raus, bevor sie es aufhalten kann. Sie sieht aus, als würde sie es gern wieder einfangen.'),
  ], { next: 'kern' }),
  node('kern', [], {
    choices: [
      ch('…', 'deal', { when: DEAL }),
      ch('…', 'allein', { when: ALLEIN }),
      ch('…', 'gemeinsam', { when: all(not(DEAL), not(ALLEIN)) }),
    ],
  }),
  node('deal', [
    a('Ripper hat\'s mir erzählt. Grinsend. Am Ecktisch. „Deine Postbotin liefert alles, Schätzchen, sogar dich.“', 'wut'),
    a('Wir hatten das schon. Wir hatten genau das schon mal, Vex! Paket, Ripper, hinter meinem Rücken. Und du machst es einfach NOCHMAL.', 'trauer'),
  ], { next: 'angst' }),
  node('allein', [
    a('Du warst allein bei ihm. Mit den Zangen. Schon wieder allein. Ich dachte, wir hätten das geklärt, auf dem Dach, im Regen, mit Kas und allem.', 'trauer'),
    a('Ich hab die ganze Nacht auf Dantes Hocker gesessen und auf die Tür gestarrt. Mit einem Arm. Weißt du, wie sich das anfühlt? Nicht mal die Tür hätte ich aufgekriegt, wenn du drangeklopft hättest.', 'wut'),
  ], { next: 'angst' }),
  node('gemeinsam', [
    a('Wir haben das zusammen gemacht. Das war gut. Das war richtig gut.', 'trauer'),
    a('Und trotzdem guckst du mich seitdem an, als würd ich gleich wieder umkippen. Als wär ich aus Glas. Ich hasse das.', 'wut'),
  ], { next: 'angst' }),
  node('angst', [], {
    choices: [
      ch('…', 'angst-chip', { when: CHIP }),
      ch('…', 'angst-arm', { when: not(CHIP) }),
    ],
  }),
  node('angst-chip', [
    n('Sie lehnt sich gegen die Wand. Plötzlich ist die ganze Wut weg, und darunter ist etwas, das viel kleiner ist und viel lauter.'),
    a('Ich hab „Ja, Master“ gesagt. Zu Blade. Mit meinem Mund. Ich weiß es nicht mehr, aber Vega hat\'s mir erzählt, und Dante hat dabei auf seine Schuhe geguckt.', 'trauer'),
    a('Du warst da. Du hast mich so gesehen. Mit lila Augen und ohne mich drin. Und dann der Arm. Und dann der Tisch. Wie viel ist noch übrig von mir, Vex? Ehrlich. Und warum knutscht dich dann nicht \'ne Taxifahrerin, die ganz ist?', 'trauer'),
  ], { next: 'wahl' }),
  node('angst-arm', [
    n('Sie lehnt sich gegen die Wand. Plötzlich ist die ganze Wut weg, und darunter ist etwas, das viel kleiner ist und viel lauter.'),
    a('Der Arm ist auf dem Markt runtergefallen. Vor allen. Wie ein Sack. Und ich stand da und konnte meinen eigenen Schläger nicht aufheben.', 'trauer'),
    a('Du hast ihn aufgehoben. Du hebst immer alles auf. Irgendwann hebst du mich auf und merkst, dass da nix mehr dran ist. Und dann ist da \'ne Taxifahrerin mit Kirschmund, die ganz ist.', 'trauer'),
  ], { next: 'wahl' }),
  node('wahl', [], {
    choices: [
      ch('„Du bist nicht weniger. Du bist das Lauteste, was ich kenn. Auch wenn du leise bist.“', 'ehrlich', { check: chk('vexaria-krise-ausstrahlung', 'ausstrahlung', 5, ['trost']), effects: [herz(40)] }),
      ch('„Ich hab\'s wieder allein gemacht. Weil ich Schiss hatte. Nicht um mich.“', 'schiss', { when: any(DEAL, ALLEIN), effects: [herz(30)] }),
      ch('Nichts sagen. Ihr die echte Hand an die Wange legen. Dahin, wo Kikis Lippenstift bei dir ist.', 'hand', { effects: [herz(30)] }),
      ch('„Ich brauch \'ne Pause.“', 'pause', { effects: [herz(-30)] }),
    ],
  }),
  node('ehrlich', [
    n('Sie lacht. Kaputt, aber echt. Wischt sich mit dem Zerberster über die Augen, was eine schlechte Idee ist, weil Metall nicht saugt.'),
    a('Kühlflüssigkeit.', 'trauer'),
    v('Klar.', 'zaertlich'),
  ], { next: 'abgang' }),
  node('schiss', [
    a('Um mich. Ja. Ich weiß. Das ist ja das Schlimme. Ich kann dir nicht mal richtig böse sein, weil du\'s aus dem dämlichsten, schönsten Grund machst.', 'trauer'),
  ], { next: 'abgang' }),
  node('hand', [
    n('Deine Finger an ihrer Wange. Sie ist heiß vom Brüllen. Sie schließt die Augen und drückt das Gesicht eine Sekunde lang in deine Hand, wie eine Katze, die das nie zugeben würde.'),
  ], { next: 'abgang' }),
  node('pause', [
    a('Pause. Klar. Das kannst du ja. Pausen und Abhauen.', 'wut'),
  ], { next: 'abgang' }),
  node('abgang', [
    a('Ich geh jetzt. Nicht weg-weg. Nur … aufs Dach oder so. Mir ist zu laut im Kopf.', 'besorgt'),
    a('Und wasch dir das Gesicht, du siehst aus wie \'n Clown.', 'wut'),
    n('Sie geht. Nicht in den Club. Richtung Lötgassen. Richtung deiner Bude. Du weißt, welches Dach sie meint, auch wenn sie es nicht gesagt hat. Es gibt nur eins, auf dem sie je mit dir gesessen hat.'),
  ], { effects: [set('vexaria_krise_offen'), set('vexaria_krise'), msg('Heute Nacht: das Dach über der Kurierbude.')] }),
]);

const kriseFs: DialogueDef = dlg('rom-vexaria-krise-fs', [
  node('start', [
    n('Abend vor dem High Voltage. Kiki Karbon hält mit quietschenden Reifen, drückt dir aus dem Taxifenster einen Kuss auf die Wange, kirschrot, „für die Lichtmaschine, Rakete!“, und braust davon. In der Clubtür steht Aria und kriegt sich nicht mehr ein.'),
    a('HA! Die Postbotin hat \'nen Abdruck! Bleib so! Ich hol Vega! VEGA!', 'freude'),
    n('Dann hört sie auf zu lachen. Ihr Blick geht zu deiner Schulter. Zu dem, was sie über den Code gehört hat.'),
  ], {
    effects: STATION_START,
    choices: [
      ch('…', 'deal', { when: DEAL }),
      ch('…', 'allein', { when: ALLEIN }),
      ch('…', 'gemeinsam', { when: all(not(DEAL), not(ALLEIN)) }),
    ],
  }),
  node('deal', [a('Ripper. Hinter meinem Rücken. Schon wieder. Ey. Crew macht so was nicht.', 'wut')], { next: 'schluss' }),
  node('allein', [a('Allein zu Ripper. Bist du komplett bescheuert? Crew geht zu zweit. Mindestens.', 'wut')], { next: 'schluss' }),
  node('gemeinsam', [a('Wir haben das gut gemacht, oder? Zusammen. Sag, dass wir das gut gemacht haben.', 'besorgt')], { next: 'schluss' }),
  node('schluss', [
    v('Bier. Dach. Jetzt.', 'neutral'),
    a('… Okay. Aber du zahlst. Und du lässt den Lippenstift dran.', 'freude'),
    n('Ihr sitzt bis Mitternacht auf dem Dach über der Kurierbude. Sie redet über den Arm, über den Tisch, über Rippers Mandarinen. Du hörst zu. Irgendwann schläft sie gegen deine Schulter ein und schnarcht wie ein Moped.'),
  ], { effects: [herz(60), { advanceTime: 180 }] }),
]);

// ---------------------------------------------------------------------------
// rom-vexaria-dachnacht · „Wie viel übrig ist“

const dachnacht: DialogueDef = dlg('rom-vexaria-dachnacht', [
  node('start', [
    n('Nacht. Das Dach über der Kurierbude. Der Funkmast blinkt rot, die Stadt summt unter euch wie ein Kühlschrank. Aria sitzt an der Kante, die Stiefel über der Gasse, zwei Flaschen neben sich. Eine ist schon halb leer. Die andere ist für dich. Sie hat sie nicht aufgemacht. Sie wusste, dass du kommst.'),
    a('Du hast dir das Gesicht gewaschen.', 'neutral'),
    v('Dreimal.', 'neutral'),
    a('Fast. Unterm Ohr ist noch was. Rosa. Lass. Da kümmer ich mich später drum.', 'wut'),
    a('Setz dich. Nicht so weit weg. … Auch nicht so nah. Doch. Doch, so nah.', 'verlegen'),
    n('Du setzt dich. Eure Schultern berühren sich. Ihre ist warm durch das Netzshirt, deine kalt vom Gurtzeug. Keiner rückt weg. Du spürst, wie sie atmet. Zu flach, zu schnell, wie nach drei Runden Armdrücken.'),
  ], {
    choices: [
      ch('„Wie viel übrig ist, wolltest du wissen.“', 'uebrig'),
      ch('Ihr die Flasche abnehmen. Einen Schluck. Zurückgeben.', 'flasche'),
      ch('Nichts sagen. Den Kopf an ihre Schulter legen.', 'schulter'),
    ],
  }),
  node('flasche', [
    n('Du trinkst aus ihrer Flasche, nicht aus deiner. Sie sieht dir dabei zu. Ihr Blick bleibt an deinem Mund hängen, eine Sekunde zu lang, dann an der Flasche, dann wieder an deinem Mund.'),
    a('Das war meine.', 'verlegen'),
    v('Weiß ich.', 'signatur'),
    a('Arschloch. … Gib her.', 'verlegen'),
    n('Sie trinkt nach dir. Genau da, wo dein Mund war. Und guckt dich dabei an, als wär das ein Wettkampf.'),
  ], { next: 'uebrig' }),
  node('schulter', [
    n('Du legst den Kopf an ihre Schulter. Sie erstarrt. Dann sinkt ihre Wange auf deine Haare, und du hörst, wie sie ausatmet, lang und zitternd, als hätte sie die Luft seit dem Club angehalten.'),
    a('Du bist so unfair. Ich war grad so schön wütend. Ich hatte \'ne ganze Rede.', 'verlegen'),
    v('Halt sie trotzdem.', 'zaertlich'),
    a('Kann ich nicht mehr. Du riechst nach Seife. Dreimal Seife. Das ist Sabotage.', 'verlegen'),
  ], { next: 'uebrig' }),
  node('uebrig', [
    v('Alles. Alles ist übrig. Die Klappe. Die Zöpfe. Das Schnarchen. Der Kronkorken an meiner Tür.', 'neutral'),
    v('Und der Arm. Mit Sperre, ohne Sperre, mit Ripper-Kern. Der Arm hat mich auf dem Dach festgehalten, als ich gefallen wär. Der gehört dazu. Du gehörst dazu.', 'zaertlich'),
  ], {
    choices: [
      ch('…', 'angst-chip', { when: CHIP }),
      ch('…', 'angst-arm', { when: not(CHIP) }),
    ],
  }),
  node('angst-chip', [
    n('Aria sagt lange nichts. Dann redet sie in die Gasse runter, nicht zu dir.'),
    a('Weißt du, was ich seitdem träum? Nicht Blade. Nicht den Tisch. Ich träum, dass ich aufwach und mir einer sagt, was ich will. Und ich mach\'s. Und ich merk\'s nicht mal.', 'trauer'),
    a('„Ja, Master.“ Das sitzt da noch irgendwo. Wie \'n Splitter unterm Fingernagel. Ich hab Schiss, dass ich irgendwann nicht mehr weiß, was meins ist und was der Chip.', 'trauer'),
    n('Dann dreht sie den Kopf. Sieht dich an. Und irgendwas in ihrem Blick kippt. Von Angst in etwas, das viel wacher ist. Viel näher.'),
    a('Aber das hier weiß ich. Das weiß ich ganz genau. Das hat mir keiner eingebaut, das hab ich mir selbst ausgesucht. Mit offenen Augen. Braunen.', 'verlegen'),
  ], { next: 'arm' }),
  node('angst-arm', [
    n('Aria sagt lange nichts. Dann redet sie in die Gasse runter, nicht zu dir.'),
    a('Weißt du, was ich seitdem träum? Der Arm fällt runter. Auf dem Markt, auf der Bühne, im Bett. Immer wieder. Und jedes Mal guckt jemand hin und denkt: Ach so. Die ist ja nur halb.', 'trauer'),
    a('Und dann seh ich Kiki. Ganz. Zwei Hände, beide warm. Und ich denk: Klar küsst die dich. Die kann dich anfassen und spürt auch noch was dabei.', 'trauer'),
    n('Dann dreht sie den Kopf. Sieht dich an. Und irgendwas in ihrem Blick kippt. Von Angst in etwas, das viel wacher ist. Viel näher.'),
    a('Aber ich spür ja was. Mit der einen. Und die will gerade nur eins, die ganze Zeit schon, seit der Clubtür. Das ist ja das Bescheuerte.', 'verlegen'),
  ], { next: 'arm' }),
  node('arm', [
    n('Sie legt den Zerberster in deinen Schoß, ganz vorsichtig, als würde sie dir etwas Zerbrechliches geben. Zwanzig Kilo Silber auf deinen Oberschenkeln. Sie summen.'),
    a('Dann halt ihn. Wenn er dazugehört. Halt ihn mal.', 'zaertlich'),
  ], {
    choices: [
      ch('Die Platten mit dem Daumen nachfahren. Eine nach der anderen.', 'platten', { effects: [herz(30)] }),
      ch('Die silberne Hand an deinen Mund heben. Die Knöchel küssen.', 'knoechel', { effects: [herz(40)] }),
    ],
  }),
  node('platten', [
    n('Du fährst die Fugen nach. Schulter, Oberarm, das Gelenk, wo Dante seine Gravur versteckt hat. Sie spürt es nicht. Das sagt sie dir oft genug. Aber sie hält die Luft an, jedes Mal, wenn dein Daumen über eine Naht gleitet, und als du am Handgelenk ankommst, atmet sie zitternd aus.'),
    a('Ich spür nix. Ich schwör. Ich spür nix. Hör nicht auf.', 'verlegen'),
    n('Du hörst nicht auf. Du fährst wieder hoch, bis zur Schulter, bis dahin, wo das Silber aufhört und die Haut anfängt, und lässt den Daumen genau auf der Grenze liegen. Da spürt sie es. Du merkst es daran, dass sie dir die echte Hand ins Knie krallt.'),
  ], { next: 'ehrlich' }),
  node('knoechel', [
    n('Du hebst ihre Hand. Metall, kühl von der Nacht. Du küsst die Knöchel, einen nach dem anderen, so langsam, dass es albern wäre, wenn es nicht so ernst wäre.'),
    a('Vex. Ich spür das nicht. Du weißt, dass ich das nicht spür.', 'verlegen'),
    v('Ich schon.', 'zaertlich'),
    n('Sie gibt ein Geräusch von sich, halb Lachen, halb etwas ganz anderes. Dann dreht sie die silberne Hand in deiner um und legt sie dir an die Wange, so behutsam, dass die Finger nicht mal zucken. Kühl. Ganz still. Die vorsichtigste Hand der Unterstadt.'),
  ], { next: 'ehrlich' }),
  node('ehrlich', [
    n('Ihr Atem geht schneller als vorhin. Deiner auch. Sie wartet. Du weißt, worauf: dass du auch mal was sagst. Was Echtes. Nicht nur „Klar“ und „Weiß ich“.'),
  ], {
    choices: [
      ch('„Ich hatte auch Angst. Dass du nie wieder rumbrüllst. Dass es einfach still ist.“', 'e-still', { effects: [herz(20)] }),
      ch('Die echte Hand hochhalten. Sie zittert. „Guck. Seit du gegangen bist. Geht nicht weg.“', 'e-zittern', { effects: [herz(20)] }),
      ch('„Ich bin nicht weggelaufen. Heute nicht. Das ist alles, was ich hab.“', 'e-geblieben', { effects: [herz(20)] }),
    ],
  }),
  node('e-still', [
    a('Still. Ich. Pff. Das schaff ich nicht mal im Schlaf, frag Vega.', 'freude'),
    n('Dann bricht ihr die Stimme weg, mitten im Lachen.'),
    a('… Du hattest echt Angst. Um mich. Um die laute Version.', 'zaertlich'),
    v('Um die einzige Version.', 'zaertlich'),
  ], { next: 'kuss' }),
  node('e-zittern', [
    n('Sie nimmt deine Hand. Legt sie flach an ihren Hals, unter das Ohr, da, wo der Puls sitzt. Er rast. Deine Finger zittern dagegen, und ihr Puls hämmert zurück, als wollten die beiden sich gegenseitig übertönen.'),
    a('Gleichstand. Ich zitter auch. Nur innen. Seit der Clubtür.', 'verlegen'),
  ], { next: 'kuss' }),
  node('e-geblieben', [
    a('Das ist \'ne ganze Menge, Rennsemmel. Für dich ist das \'n Marathon.', 'zaertlich'),
    n('Sie lacht leise. Dann hört sie auf zu lachen und guckt auf deinen Mund. Und guckt nicht mehr weg.'),
  ], { next: 'kuss' }),
  node('kuss', [
    n('Dann ist ihre echte Hand in deinem Nacken. In deinen Locken. Sie zieht dich zu sich, nicht vorsichtig diesmal, und küsst dich.'),
    n('Sie schmeckt nach Bier und Wut und dem Salz von vorhin. Der erste Kuss ist ein Zusammenstoß: Zähne, dein Nasenring, ein Fluch gegen deine Lippen. Der zweite ist langsamer. Der dritte ist so langsam, dass du vergisst, wo das Dach aufhört und die Gasse anfängt.'),
    n('Ihr küsst euch wie zwei, die sich vor drei Stunden angeschrien haben und es bereuen und es sofort wieder tun würden, nur um sich danach wieder so zu küssen. Ihr Atem stolpert. Deiner auch. Unten in der Gasse pfeift jemand, und keine von euch hört hin.'),
    n('Irgendwann löst sie sich. Einen Zentimeter. Ihre Stirn bleibt an deiner. Sie atmet dir ins Gesicht, warm, zu schnell, und ihre Finger in deinem Nacken lassen nicht los.'),
    a('Ich will dich, Vex. Nicht trotz heute. Wegen heute. Ist das bescheuert?', 'verlegen'),
  ], {
    choices: [
      ch('Dich nach hinten auf die Teerpappe fallen lassen. Sie mitziehen. Sie machen lassen.', 'sie-fuehrt'),
      ch('Sie umdrehen. Sie auf die Teerpappe legen. Selbst führen.', 'vex-fuehrt'),
      ch('„Sag\'s nochmal. Langsamer.“', 'langsam'),
    ],
  }),
  node('sie-fuehrt', [
    n('Du lässt dich nach hinten fallen und ziehst sie mit. Die Teerpappe ist rau und noch warm vom Tag. Sie ist über dir, die Zöpfe fallen dir rechts und links ins Gesicht wie ein Vorhang, und unter dem Vorhang gibt es nur sie.'),
    a('Kiki hat dich hier geküsst. Auf die Wange. Ich küss dich überall, wo sie nicht war. Das ist Revierverhalten. Ich steh dazu.', 'signatur'),
    v('Überall ist viel.', 'verlegen'),
    a('Ich hab Zeit.', 'verlegen'),
    n('Sie fängt unter dem Ohr an, da, wo noch Kiki war, und küsst es weg. Dann die Kieferlinie entlang, Kuss für Kuss, als würde sie eine Route abfahren. Dein Kinn. Die Kuhle darunter. Dein Hals, genau über dem Gurtriemen, wo die Haut dünn ist und dein Puls direkt unter ihren Lippen hämmert. Sie bleibt da. Sie bleibt da viel zu lange.'),
    n('Dein Atem geht nicht mehr gerade. Deine echte Hand liegt in ihrem Kreuz, unter dem Saum vom Shirt, Haut an Haut, und jedes Mal, wenn deine Fingerkuppen sich bewegen, zuckt sie und beißt dich zur Strafe sacht in den Hals.'),
    a('Hier war sie nicht. Hier auch nicht. Hier –', 'verlegen'),
    v('Da war keiner.', 'verlegen'),
    a('Jetzt schon. Gehört mir. Steht jetzt im Grundbuch.', 'signatur'),
  ], { next: 'schnalle' }),
  node('vex-fuehrt', [
    n('Du drehst euch um. Eine Bewegung, schnell, wie über eine Lücke. Jetzt liegt sie auf der Teerpappe, die Zöpfe ausgebreitet, der Zerberster neben ihrem Kopf, und sie guckt zu dir hoch. Überrascht. Und sehr, sehr einverstanden.'),
    a('Oha. Die Postbotin übernimmt die Route.', 'ueberrascht'),
    v('Revierverhalten. Kann ich auch.', 'signatur'),
    n('Du küsst sie unter dem Kinn. Am Hals. An der Kuhle über dem Schlüsselbein, wo das Netzshirt anfängt. Dann die linke Schulter, da, wo die Haut in die Silbernaht übergeht. Die Narbe ist wulstig und warm, und als deine Lippen darübergehen, hört Aria auf zu atmen.'),
    a('Da … da guckt nie einer hin. Da will nie einer hin.', 'verlegen'),
    v('Ich schon.', 'zaertlich'),
    n('Deine schwarze Metallhand liegt auf ihrer Hüfte. Ganz leicht. Du hältst die Finger gespreizt und still, weil du weißt, was Ripper-Hydraulik mit einer Hüfte macht, wenn man nicht aufpasst. Sie merkt es. Sie legt ihre echte Hand auf deine Metallfinger und drückt sie fester an sich.'),
    a('Ich zerbrech nicht, Rennsemmel. Hab ich dir heut schon dreimal gesagt. Fester. … Ja. So.', 'verlegen'),
  ], { next: 'schnalle' }),
  node('langsam', [
    a('Ich. Will. Dich.', 'verlegen'),
    n('Sie sagt es langsam. Jedes Wort einzeln, mit einem Kuss dazwischen. Einer auf den Mundwinkel. Einer auf die Unterlippe. Einer genau drauf, der so lange dauert, dass das letzte Wort nur noch geflüstert ist.'),
    a('Und du? Nicht nicken. Sagen. Ich will\'s hören. Mit Worten, du Schweigerin.', 'zaertlich'),
    v('Dich. Seit dem Schläger. Seit „Schlag zu, Weichei“. Jeden Tag \'n bisschen mehr. Heute am meisten.', 'zaertlich'),
    n('Sie starrt dich an. Dann zieht sie dich mit sich runter auf die Teerpappe, Seite an Seite, Gesicht an Gesicht, und ihr küsst euch im Liegen, faul und tief, ihr Bein über deinem, deine Hand in ihrem Nacken, bis der Mast zweimal geblinkt hat. Dreimal. Zehnmal. Du hörst auf zu zählen.'),
    a('Das war\'n ganzer Satz, Vex. Mit Verb und allem. Ich glaub, ich muss mich hinlegen. Oh. Lieg ja schon.', 'freude'),
  ], { next: 'schnalle' }),
  node('schnalle', [
    n('Ihre Finger finden die erste Schnalle am Gurtzeug. Oben, am Brustriemen. Sie öffnet sie nicht. Sie legt nur den Daumen drauf und wartet. Sie sieht dich an. Sie fragt, ohne zu fragen.'),
    a('Wie viele waren\'s noch? Elf?', 'verlegen'),
  ], {
    choices: [
      ch('„Eine. Hier. Die anderen zehn unten.“', 'eine', { effects: [BESCHWINGT] }),
      ch('„Nicht hier. Unten. Rolltor zu.“', 'bude', { effects: [BESCHWINGT] }),
      ch('Ihre Hand nehmen. Liegen bleiben. Die Sterne zählen, die es hier nicht gibt.', 'sterne', { effects: [herz(20)] }),
    ],
  }),
  node('eine', [
    n('Klick. Die Schnalle springt auf, und der Brustriemen lockert sich einen Fingerbreit. Nur einen. Es ist lächerlich, wie viel ein Fingerbreit ausmacht. Du kriegst plötzlich mehr Luft und gleichzeitig gar keine.'),
    a('Eine. Hm. Fühlt sich an wie \'n Geschenk, das man ganz langsam auspackt. Ich hasse langsam auspacken.', 'verlegen'),
    v('Dann komm runter.', 'signatur'),
  ], { next: 'bude' }),
  node('bude', [
    n('Feuerleiter runter, sie zuerst, du hinterher, viel zu schnell. Sie lacht, als du die letzte Sprosse verpasst und ihr in die Arme fällst. Das Rolltor rasselt hoch, rasselt runter. Dunkel. Ihr stolpert über die Kiste, über den Schläger, über euch selbst.'),
    n('Sie drückt dich gegen die Wellblechwand, die Metallhand flach neben deinem Kopf, die echte unter dem Gurtzeug flach auf deinem Top, da, wo dein Herz rast. Sie spürt es. Sie grinst. Du hörst das Grinsen.'),
    a('Da drin ist ja richtig was los, Postbotin.', 'signatur'),
    v('Halt die Klappe, Großmaul.', 'zaertlich'),
    a('Mach sie mir doch zu.', 'verlegen'),
    n('Du machst sie ihr zu. Mit dem Mund. Lange. Sie lacht in den Kuss hinein und hört dann auf zu lachen.'),
    n('Dann zählt sie. Laut, an deinem Hals, eine Schnalle nach der anderen. „Zehn.“ Klick. „Neun.“ Klick. Bei sieben flucht sie, weil die Zerberster-Finger zu groß für die kleine Schnalle am Schulterriemen sind, und nimmt die Zähne dazu. Bei vier lacht ihr beide so sehr, dass ihr an der Wand runterrutscht.'),
    a('Drei. Zwei. … Eins. Wer baut so was? Wer zieht sich jeden Morgen \'nen Tresor an?', 'wut'),
    v('Diebstahlsicher.', 'signatur'),
    n('Das Gurtzeug rutscht dir von den Schultern und fällt, schwer, mit einem Geräusch wie ein Schlüsselbund, der aufgibt. Ohne die Riemen fühlst du dich leicht. Fast zu leicht. Als könnte der nächste Atemzug dich vom Boden heben.'),
  ], {
    choices: [
      ch('Ihr das Shirt über den Kopf ziehen. Vorsichtig, wegen der Zöpfe.', 'shirt'),
      ch('„Sag, wenn ich langsamer soll.“', 'fragen'),
      ch('„Stern.“', 'stern'),
    ],
  }),
  node('shirt', [
    n('Vorsichtig hilft nichts. Das Shirt bleibt an einem Zopf hängen. Natürlich. Aria steckt mit erhobenen Armen fest, ein silberner, ein echter, das Gesicht im Stoff, und flucht dumpf durch den roten Stern.'),
    a('Hilf mir, du Miststück, nicht lachen, HILF mir –', 'wut'),
    n('Du hilfst. Irgendwann. Das Shirt fliegt in die Ecke und landet auf dem Schläger. Sie steht vor dir, die Zöpfe zerzaust, das Gesicht rot vom Fluchen und von etwas anderem, und guckt dich an, als hätte sie gerade gewonnen.'),
    a('Jetzt du. Und wehe, du hast da drunter noch \'n Gurtzeug.', 'verlegen'),
  ], { next: 'licht' }),
  node('fragen', [
    a('Langsamer? Vex. Ich hab drei Stunden auf dem Dach gewartet. Ich hab gewartet, seit Kiki dich angefasst hat. Ich hab vielleicht mein ganzes Scheißleben gewartet.', 'verlegen'),
    a('… Aber ja. Ich sag\'s. Wenn. Und du auch. Abgemacht?', 'zaertlich'),
    v('Abgemacht.', 'zaertlich'),
    n('Sie zieht dir mit den Zähnen den fingerlosen Handschuh von der echten Hand, Finger für Finger, ohne den Blick von dir zu nehmen. Dann küsst sie die Innenseite deines Handgelenks, da, wo der Puls sitzt, und lässt den Handschuh einfach fallen.'),
  ], { next: 'licht' }),
  node('stern', [
    n('Sie hält still. Mitten in allem. Ihre Hand auf deinem Herzen, deine an ihrer Wange.'),
    a('Unfair. Das darfst du nicht sagen, wenn ich grad … wenn wir grad …', 'zaertlich'),
    v('Stern.', 'zaertlich'),
    n('Sie küsst dich so sanft, dass es fast wehtut. Ihre Stirn an deiner. Sie zittert. Diesmal nicht vor Angst.'),
    a('Okay. Okay. Ich bin hinüber. Komplett. Zufrieden?', 'verlegen'),
  ], { next: 'licht' }),
  node('licht', [
    n('Stiefel. Irgendwer tritt sich die Stiefel von den Füßen, und irgendwer verheddert sich dabei in den Schnürsenkeln und flucht, und es ist dir egal, wer. Der Zerberster liegt kühl auf deinem Rücken, ganz vorsichtig, wie eine Hand, die gelernt hat, nichts kaputt zu machen.'),
    a('Rennsemmel. Licht aus.', 'verlegen'),
    n('Deine Hand findet die Kette der Glühbirne.'),
  ], { effects: [set('vexaria_nacht'), set('aria_nacht'), set('vexaria_nacht_woche'), { cutscene: 'rom-vexaria-dachnacht-abblende' }] }),
  node('sterne', [
    n('Ihr bleibt liegen. Ihr Kopf auf deiner Brust, ihr Zerberster quer über deinem Bauch, schwer wie eine Decke. Ihre echte Hand hat sich unter den Brustriemen geschoben und liegt da, flach, auf deinem Top, über deinem Herzen. Sie zählt mit. Du merkst es an ihren Lippen.'),
    a('Hundertzwölf. Hundertzwölf pro Minute, Postbotin. Im Liegen. Du bist ein Wrack.', 'verlegen'),
    v('Deine Schuld.', 'verlegen'),
    a('Ich weiß. Ich bin so stolz drauf.', 'zaertlich'),
    n('Über euch gibt es keine Sterne, nur den roten Punkt am Funkmast, der an- und ausgeht.'),
    a('Das da ist meiner. Der rote. Der blinkt nur für mich.', 'zaertlich'),
    v('Der blinkt für Flugzeuge.', 'neutral'),
    a('Für mich und Flugzeuge. … Nächstes Mal zähl ich die Schnallen. Alle elf. Heute zähl ich nur das hier.', 'zaertlich'),
    n('Sie küsst dich noch einmal, langsam, ohne Eile, mit dem Kopf schon halb im Schlaf. Irgendwann schläft sie ein, mitten im Satz, die Hand noch über deinem Herzen. Du bleibst wach, bis der Mast heller ist als der Himmel.'),
  ], { effects: [herz(20), { advanceTime: 300 }] }),
]);

const kriseMorgen: DialogueDef = dlg('vexaria-krise-morgen', [
  node('start', [
    n('05:40. Kurierbude. Grau sickert unterm Rolltor durch. Auf dem Boden zwei Stiefelpaare, wild übereinander, ein Gurtzeug mit elf offenen Schnallen über der Kiste, ein Schläger in der Ecke, gefallen und liegen geblieben.'),
    n('Aria liegt quer über der Matratze und über dir, den Zerberster als Kissen für sich selbst missbraucht. Auf ihrer Wange: ein rosa Fleck. Kirschrot. Von dir. Von deiner Wange. Von Kiki.'),
    v('Du hast Kiki im Gesicht.', 'freude'),
    a('Mmh. Is\' jetzt meins. Hab\'s mir verdient. Fünf Minuten noch. Zehn.', 'zaertlich'),
  ], { effects: [BESCHWINGT, herz(20), set('vexaria_krise_offen', false), set('vexaria_versoehnt_akt2')] }),
]);

// Hunter am Abend danach (einmalig).
const kriseHunter: DialogueDef = dlg('vexaria-krise-hunter', [
  node('start', [
    s('hunter', 'Kiki war hier. Hat gefragt, ob du Single bist. Ich hab gesagt, du bist Kurierin. Das ist dasselbe, nur mit mehr Treppen.', 'signatur'),
    s('hunter', 'Dann kam Aria rein, mit deinem Lippenstift im Gesicht. Kiki hat ihr Wasser ausgetrunken und ist gegangen. Ohne Trinkgeld. Ihr schuldet mir zwei Credits.', 'neutral'),
    v('Schreib\'s an.', 'signatur'),
  ]),
]);

const cutscenes: CutsceneDef[] = [
  cut('rom-vexaria-dachnacht-abblende', 'Elf Schnallen, zweiter Versuch', [
    { image: 'black', fade: 'out', hold: 1800, caption: 'Klick. Dunkel.' },
    { image: 'black', lines: [n('Auf Schwarz: ein Lachen, gedämpft vom Wellblech. Dann Arias Stimme, ausnahmsweise kein bisschen laut: „Langsam, Rennsemmel. Wir haben bis morgen.“')], hold: 2000 },
    { image: 'black', lines: [n('Regen, der nicht kommt. Ein Funkmast, der für niemanden blinkt. Dann gar nichts mehr, lange.')], hold: 1800 },
  ], [{ sleep: true }, { dialogue: 'vexaria-krise-morgen' }], false),
];

// ---------------------------------------------------------------------------

export const KRISE_EVENTS: HeartEventDef[] = [
  ...twin({
    id: 'rom-vexaria-krise', hearts: 8, map: 'neon-gasse', time: 'abend',
    when: all(V, AKT2, BRUECKE, Q_DONE, HEUTE_FREI),
  }, ROM, { dialogue: 'rom-vexaria-krise' }, { dialogue: 'rom-vexaria-krise-fs' }),
  {
    // Gleiche Nacht wie die Krise (zählt mit ihr als eine Station, keine Tagessperre); geht auch später, solange offen.
    id: 'rom-vexaria-dachnacht', hearts: 8, map: 'loetgassen', time: 'nacht',
    when: all(V, R, flag('vexaria_krise_offen'), not(seen('rom-vexaria-dachnacht'))),
    dialogue: 'rom-vexaria-dachnacht',
    effects: [{ xp: 25 }, set('vexaria_krise_offen', false)],
  },
];

export const part: ContentPart = {
  dialogues: byId([krise, kriseFs, dachnacht, kriseMorgen, kriseHunter]),
  cutscenes: byId(cutscenes),
  mapAdditions: {
    'high-voltage': {
      onEnter: [{
        id: 'vexaria-krise-hunter', when: all(V, seen('rom-vexaria-dachnacht'), { time: ['abend', 'nacht'] }),
        dialogue: 'vexaria-krise-hunter',
      }],
    },
  },
};

