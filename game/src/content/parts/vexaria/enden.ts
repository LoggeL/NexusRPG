// Vex × Aria und „Zerberster-Herz“ in den Enden (world.md §4.7 Station 11, §5.5). Die Enden selbst (Cutscenes, Ankunft,
// Flags `ende_*`, `epilog`) baut quest-enden/enden.ts; hier hängen sich die Paarszenen an die Ende-Flags:
//   Ende 1/2/3b · `rom-vexaria-meer` / `-fs` (Vex, Tafel `cut-rom-vexaria-meer`) bzw. `rom-aria-meer` / `-fs` (Baukasten,
//     Tafel `cut-rom-aria-meer`): erster Abend an `das-meer`, „Wer zuerst am Wasser ist!“. Nacht am Lagerfeuer → Abblende.
//     Paar: Lagerfeuer (Zöpfe / Sommersprossen `vexaria_sommersprossen` / Sandkrieg) → Wagen (Stiefel bzw. Salzschnallen,
//     Wagenwand, „Hast du Angst?“) → Abblende → Morgen mit Spuren (Biss, Sand, Möwe).
//     Mit `ende_doch_noch_meer` (3b) beginnt die Szene mit der Versöhnung.
//   Ende 2 · `vexaria-ende-autoradio` (onEnter das-meer, Morgen danach): Nexus im Autoradio kommentiert das Paar.
//   Ende 3 · `vexaria-ende-master` (onEnter blades-buero) + Telefon `aria-vex-master-1..3`: bittersüß, ohne Vex.
//   Nachspiel · `rom-vexaria-konzert-strand`: Konzert am Strandclub, falls Station 13 in Akt 1/2 nicht lief.
import type { ContentPart } from '../../part';
import type { Condition, CutsceneDef, DialogueDef, HeartEventDef, PhoneMessageDef } from '../../../modules/contracts';
import {
  a, all, ANGEBAHNT, any, BESCHWINGT, byId, ch, cut, dlg, EPILOG, flag, herz, HEUTE_FREI, n, node, noFlag, not, NOT_V, R, s,
  seen, set, STATION_START, twin, V, v, ZUSAMMEN,
} from './_util';

const PAAR: Condition = all(R, ZUSAMMEN);
const ENDE_3B = flag('ende_doch_noch_meer');
const AM_MEER: Condition = all(EPILOG, any(flag('ende_meer'), flag('ende_neue_nexus'), ENDE_3B));
const MASTER: Condition = all(flag('ende_master'), not(ENDE_3B));
/** Ende 3, Sprachnachricht: Paar mit gemeinsamer Nacht (`vexaria_nacht`/`aria_nacht`). */
const NAH: Condition = all(PAAR, any(flag('vexaria_nacht'), flag('aria_nacht')));

// ---------------------------------------------------------------------------
// rom-vexaria-meer · „Wer zuerst am Wasser ist!“

const meerVex = (id: string, rom: boolean): DialogueDef => dlg(id, [
  node('start', [], {
    effects: STATION_START,
    choices: [
      ch('…', 'dreib', { when: ENDE_3B }),
      ch('…', 'abend', { when: not(ENDE_3B) }),
    ],
  }),
  node('dreib', [
    n('Der Strand am Abend. Du kommst zu Fuß über die Düne, Turmstaub noch in den Stiefeln, die Jacke über der Schulter. Die Crew sitzt am Feuer. Keiner steht auf. Bis auf eine.'),
    n('Aria kommt dir entgegen. Barfuß, die Zöpfe voller Salz, den Zerberster rostig gesprenkelt von der Gischt. Sie bleibt zwei Meter vor dir stehen. Dann einen.'),
    ...(rom ? [
      a('Hast ganz schön lang gebraucht, Arschloch. Komm her.', 'trauer'),
      n('Sie zieht dich an den Riemen zu sich und hält dich fest. Lange. Ihr Gesicht in deinem Hals, deine Hand in ihren Zöpfen, und hinter euch tut die Crew sehr angestrengt so, als würde sie Muscheln sortieren.'),
      a('Ich war so sauer. Ich bin immer noch sauer. Ich hab jeden Abend einen Kronkorken ins Meer geschmissen und dich verflucht. Siebzehn Stück.', 'wut'),
      v('Ich hab mitgezählt. Auf dem Bildschirm im Turm.', 'trauer'),
      a('… Du hast uns zugeguckt? Die ganze Zeit?', 'ueberrascht'),
      v('Jeden Abend. Den leeren Platz.', 'trauer'),
    ] : [
      a('Hast ganz schön lang gebraucht, Kurierin. Komm her.', 'trauer'),
      n('Sie haut dir die Metallfaust gegen die Schulter. Dann zieht sie dich in eine Umarmung, die dir zwei Rippen verbiegt.'),
    ]),
  ], { next: 'abend' }),
  node('abend', [
    n('Sonnenuntergang. Die Sonne hängt rot und riesig über dem Wasser, so tief, dass man glaubt, sie zischt gleich. Der Sand ist noch warm vom Tag. Aria steht neben dir, die Stiefel in der Hand.'),
    a('Weißt du noch? Ich hab gesagt, wir sehen\'s zusammen. Beide gleichzeitig. Dann gewinnt keine.', 'freude'),
    v('Ich gewinn trotzdem.', 'signatur'),
    a('WER ZUERST AM WASSER IST!', 'freude'),
    n('Sie rennt los, bevor sie „Wasser“ gesagt hat. Natürlich. Du rennst hinterher. In Stiefeln. Mit Gurtzeug. Der Sand frisst jeden Schritt, und zum ersten Mal in deinem Leben bist du nicht die Schnellste.'),
    n('Aria springt in die Brandung. Barfuß, kreischend, die Arme hoch. Das Wasser spritzt silbern um den Zerberster. Sie dreht sich um und streckt dir die Metallhand entgegen.'),
    a('Es ist echt! Das Meer ist echt! Ich dachte, das ist so ein Hunter-Märchen!', 'ueberrascht'),
    a('Komm rein, du Feigling. Das Salz rostet höchstens mich.', 'freude'),
  ], {
    choices: [
      ch('Stehen bleiben. An der Wasserlinie. Stiefel im Schaum.', 'stehen'),
      ch('Rein. Mit Stiefeln.', 'rein'),
    ],
  }),
  node('stehen', [
    n('Du bleibst an der Wasserlinie stehen, die Stiefelspitzen im Schaum. Das Meer kommt und geht und kommt wieder. Es hält nicht an. Es kommt nur immer zurück.'),
    n('Aria watet zu dir. Sie nimmt deine Hand, die echte, mit der silbernen, und zieht nicht. Sie hält sie nur.'),
    v('Kas wollte immer hierher.', 'trauer'),
    a('Dann ist er jetzt hier. Ein bisschen. In dir. In deinem dummen Gesicht, das gerade versucht, nicht zu heulen.', 'zaertlich'),
    n('Du drehst dich um. Zur Crew am Feuer, zu Hunter mit der Sonnenbrille in der Hand, zu Vega, die so tut, als würde sie nicht gucken. Du drehst dich um, und keiner ist weg.'),
  ], { next: rom ? 'rom' : 'fs' }),
  node('rein', [
    n('Du rennst rein. Mit allem. Die erste Welle trifft dich bis zur Hüfte und ist so kalt, dass du schreist, und Aria lacht so laut, dass Möwen auffliegen. Dein Gurtzeug saugt sich voll. Deine Stiefel sind verloren. Es ist dir egal.'),
    a('Du hast geschrien! DU hast GESCHRIEN! Das erzähl ich jedem!', 'freude'),
    n('Dann zieht sie dich an den Riemen zu sich, und ihr steht bis zu den Rippen im Wasser, und die Sonne geht hinter ihrem Kopf unter wie ein Heiligenschein, den sie nie zugeben würde.'),
  ], { next: rom ? 'rom' : 'fs', effects: [set('vexaria_meer_rein')] }),
  node('rom', [
    a('Weißt du, was ich heute nicht bin? Die Brecherin. Heute bin ich nur nass.', 'zaertlich'),
    v('Und meine.', 'zaertlich'),
    a('… Und deine. Sag das noch mal. Nee. Sag\'s nicht. Ich heul sonst ins Meer, und das ist eh schon salzig genug.', 'verlegen'),
    n('Sie küsst dich. Salzig, nass, die Lippen kalt vom Wasser und dann sofort warm. Ihre echte Hand an deiner Wange, die silberne um deine Hüfte, und das Wasser drückt euch zusammen, Welle für Welle, als wollte es helfen.'),
    n('Eine Welle ist größer als die anderen. Sie hebt euch beide von den Füßen, und ihr küsst einfach weiter, unter Wasser, prustend, mit Salz in der Nase. Ihr taucht auf und Aria hustet und lacht und hängt an deinem Hals wie eine nasse Katze, die Beine um deine Hüfte, damit die nächste sie nicht wegreißt.'),
    a('Ich hab gerade das halbe Meer gesoffen. Schmeckt wie du nach dem Rennen. Komm her, ich will den Rest.', 'freude'),
  ], { next: 'feuer' }),
  node('fs', [
    a('Weißt du, was ich heute nicht bin? Die Brecherin. Heute bin ich nur nass.', 'zaertlich'),
    v('Und Crew.', 'neutral'),
    a('Und Crew. Für immer. Oder bis einer von uns Hunter beklaut.', 'freude'),
    n('Sie zieht dich am Ärmel tiefer rein, bis ihr beide untergeht, und taucht prustend wieder auf.'),
  ], { effects: [herz(60), set('vexaria_meer')] }),
  node('feuer', [
    n('Später. Das Lagerfeuer brennt runter. Hunter schnarcht im Liegestuhl, Dante hat Raven seine Jacke umgelegt und sich dafür Kekse erbeten. Ihr sitzt etwas abseits im Sand, in eine Decke gewickelt, die nach Rostlaube riecht.'),
    n('Sand. Überall. In der Decke, in den Haaren, in Stellen, von denen du nicht wusstest, dass Sand da hinkann. Deine Stiefel stehen am Feuer und dampfen wie zwei kleine Schornsteine. Aria hat ihre Füße unter deinen Oberschenkel geschoben, weil sie kalt sind, und behauptet, das sei Zufall.'),
    n('Aria liegt halb auf dir, den Kopf auf deiner Brust, ein Bein über deinem. Ihr Ohr genau über deinem Herzen. Sie klopft mit dem Zerberster den Takt mit, ganz leise, gegen deine Rippen.'),
    a('Weißt du, was komisch ist? Ich hab keine Angst. Gar keine. Kein Klappern. Kein Tablett. Ich lieg hier und hab keine Angst, und ich weiß gar nicht, was ich mit meinen Händen machen soll, wenn sie nicht zittern.', 'zaertlich'),
    v('Mir fällt was ein.', 'signatur'),
    a('Dir fällt IMMER was ein. Ruhig, du. Ich bin dran mit Entscheiden.', 'freude'),
  ], {
    choices: [
      ch('„Mach mir die Zöpfe auf“, sagt sie. Also machst du.', 'zoepfe'),
      ch('Sie findet was auf deiner Schulter. „Halt still.“', 'sommersprossen'),
      ch('Ihr eine Handvoll Sand in den Kragen schieben.', 'sand'),
    ],
  }),
  node('zoepfe', [
    n('Deine Finger lösen ihre Zöpfe, einen nach dem anderen, weil sie dich drum gebeten hat. Das Salz hat sie steif gemacht. Gummi für Gummi, Strähne für Strähne, und bei jedem Zopf atmet sie ein bisschen tiefer. Ihr Haar fällt dir offen über die Hand, schwer und warm vom Feuer.'),
    a('Das hab ich noch nie jemanden machen lassen. Die Zöpfe. Nicht mal Vega.', 'zaertlich'),
    v('Ich bin vorsichtig.', 'zaertlich'),
    a('Bist du nicht. Du bist nie vorsichtig. Nur bei mir.', 'verlegen'),
    n('Beim letzten Zopf schließt sie die Augen. Du kämmst mit den Fingern durch, von der Kopfhaut bis zu den Spitzen, und sie macht ein Geräusch wie eine Katze auf einer warmen Motorhaube.'),
  ], { next: 'schnallen' }),
  node('sommersprossen', [
    a('Halt still. Halt STILL. Du hast … Vex. Du hast Sommersprossen.', 'ueberrascht'),
    v('Hab ich nicht.', 'wut'),
    a('Hast du. Auf der Schulter. Neu. Von heute. Die Sonne hat dich erwischt, du Kellerkind. Zwanzig Jahre Smog, und dann ein Nachmittag am Meer.', 'freude'),
    n('Sie schiebt die Decke runter, gerade so weit, dass deine Schulter frei ist, deine echte. Und dann zählt sie. Mit dem Zeigefinger zuerst, ganz leicht, dass es kitzelt. Dann mit den Lippen.'),
    a('Eins. Zwei. Drei … da ist noch eine. Vier. Und hier, am Hals, das ist … das ist keine, das ist Sand. Zählt trotzdem. Fünf.', 'verlegen'),
    n('Bei sieben ist sie an deinem Hals. Bei neun hinter deinem Ohr. Bei elf hört sie auf zu zählen und vergisst es einfach.'),
    a('Ich zähl ab jetzt jeden Abend nach. Ob\'s mehr werden. Das ist jetzt mein Job.', 'zaertlich'),
  ], { effects: [set('vexaria_sommersprossen')], next: 'schnallen' }),
  node('sand', [
    n('Eine Handvoll, direkt in den Kragen. Aria kreischt so laut, dass Hunter im Schlaf „Polizei“ murmelt.'),
    a('DU MISTSTÜCK! Das ist KRIEG!', 'wut'),
    n('Es ist Krieg. Kurz. Sand fliegt, die Decke fliegt, ihr rollt einmal den Hang runter, bis kurz vor das Wasser, und am Ende liegst du auf dem Rücken im feuchten Sand und sie sitzt auf dir, beide Hände auf deinen Schultern, das Haar voller Sand, und grinst, als hätte sie die Weltmeisterschaft gewonnen.'),
    a('Gewonnen. Ich hab gewonnen. Sag es.', 'freude'),
    v('Du hast gewonnen.', 'zaertlich'),
    n('Dann hört sie auf zu grinsen. Sie sieht dich nur an. Die Brandung zischt hinter ihr. Sie beugt sich runter, langsam, bis ihre Nasenspitze deine berührt, und wartet. Einfach so. Bis du dich hochstreckst.'),
  ], { next: 'schnallen' }),
  node('schnallen', [
    n('Sie stützt sich auf, über dir, das Haar wie ein Vorhang um eure Gesichter. Unter dem Vorhang ist es dunkel und warm und riecht nach Meer und Feuerrauch. Sie küsst dich, langsam, ausgiebig, mit der ganzen Zeit der Welt, weil sie die zum ersten Mal hat. Ihre Finger finden die erste Schnalle deines noch nassen Gurtzeugs.'),
    a('Elf?', 'verlegen'),
    v('Elf.', 'verlegen'),
    a('Ich hab die ganze Nacht.', 'signatur'),
    n('Sie öffnet die erste. Dann sieht sie über die Schulter, zum Feuer, wo Hunter sich gerade auf die andere Seite dreht und Vega ganz eindeutig nicht schläft.'),
    a('… Aber nicht hier. Vega guckt. Vega guckt IMMER.', 'verlegen'),
    n('Die Decke rutscht. Ihr steht auf, du schnappst dir die dampfenden Stiefel, sie schnappt sich deine Hand, und ihr lauft lachend über den dunklen Strand, weg vom Feuer, hin zum alten Wagen am Dünengras, der eine Tür hat, die man zuziehen kann.'),
  ], { next: 'wagen' }),
  node('wagen', [
    n('Der Wagen ist ein alter Kastenwagen ohne Räder, halb im Dünengras versunken. Drinnen: eine Matratze, eine Lichterkette mit Batterie, eine Kiste mit Hunters Notfallrum. Die Tür klemmt. Aria tritt sie zu. Der ganze Wagen wackelt.'),
    a('Okay. Der wackelt. Gut zu wissen. Wird bestimmt lustig.', 'verlegen'),
    n('Die Lichterkette taucht alles in warmes Gelb. Ihr kniet euch gegenüber auf die Matratze, und Sand rieselt von euch beiden runter wie aus einer Sanduhr, und sie fängt an zu kichern und kann nicht aufhören.'),
  ], {
    choices: [
      ch('„Erst die Stiefel. Hilf mir.“', 'stiefel', { when: noFlag('vexaria_meer_rein') }),
      ch('Das nasse Gurtzeug. Zehn Schnallen voller Salz.', 'salz', { when: flag('vexaria_meer_rein') }),
      ch('Sie an die Wagenwand ziehen. Küssen, bis sie aufhört zu kichern.', 'wand'),
      ch('„Hast du Angst?“', 'angst'),
    ],
  }),
  node('stiefel', [
    n('Du ziehst die Stiefel wieder an, um sie gleich auszuziehen, weil Aria darauf besteht. „Das ist Tradition“, sagt sie. Es ist seit drei Sekunden Tradition.'),
    n('Sie packt den linken Stiefel am Absatz und zieht. Der Stiefel ist nass, klebt und denkt nicht dran. Sie zieht fester. Der Zerberster summt. Mit einem Geräusch wie ein Korken geht er ab, und Aria fliegt rückwärts gegen die Wagentür, den Stiefel im Arm wie eine Trophäe.'),
    a('HA! Einer! Ich hab einen! Wo ist der andere? Gib her! Ich bin jetzt Profi!', 'freude'),
    n('Beim zweiten fliegt sie nicht. Beim zweiten zieht sie dich an dem Bein einfach zu sich, über die Matratze, bis du halb auf ihr liegst und sie dich anlacht, Sand an der Wange, außer Atem.'),
    a('Siehst du? Effizient. Inkasso-Technik.', 'verlegen'),
  ], { effects: [herz(10)], next: 'wagen-ende' }),
  node('salz', [
    n('Die Schnallen sind nass. Das Leder ist aufgequollen, das Salz knirscht in den Dornen, und die zweite will sich keinen Millimeter bewegen. Aria fummelt. Flucht. Fummelt mit dem Zerberster. Flucht lauter.'),
    a('Zehn nasse Schnallen. Das ist Folter. Das ist eine Foltermethode, Vex. Du hast mich reingelegt. Du bist mit Absicht ins Meer gerannt.', 'wut'),
    v('Soll ich?', 'signatur'),
    a('Nein! Nein. Ich mach das. Das ist meins. Ich hab elf Wochen davon geträumt, die verdammten Dinger aufzumachen, ich lass mich jetzt nicht von Salz aufhalten.', 'verlegen'),
    n('Sie schafft es. Eine nach der anderen. Bei jeder küsst sie die Stelle darunter, Schlüsselbein, Rippenbogen über dem Top, Schulter, als Belohnung für sich selbst. Bei der letzten lässt sie sich einfach nach hinten fallen und zieht dich an den losen Riemen mit.'),
  ], { effects: [herz(10)], next: 'wagen-ende' }),
  node('wand', [
    n('Du ziehst sie an dich, eine Hand in ihrem offenen Haar, die schwarze flach an der Wagenwand neben ihrem Kopf. Das Blech ist kalt. Sie ist warm. Sie kichert noch, in deinen Mund, dann nicht mehr.'),
    n('Du küsst sie, bis sie vergisst, was so lustig war. Ihren Mund, ihr Kinn, die salzige Haut unter ihrem Ohr, den Hals runter bis zum Kragen ihres Shirts. Sie legt den Kopf in den Nacken gegen das Blech und lässt dich. Ihre Hand in deinem Nacken drückt dich nicht weg. Sie drückt dich nicht hin. Sie liegt nur da, als wollte sie sich merken, wie du dich anfühlst.'),
    n('Der Wagen schaukelt. Draußen fällt eine Muschel vom Dach.'),
    a('… Wenn das jemand gesehen hat, sag ich, es war der Wind.', 'verlegen'),
    v('Ist kein Wind.', 'signatur'),
    a('Ich WEISS, dass kein Wind ist, du Arsch.', 'freude'),
  ], { effects: [herz(10)], next: 'wagen-ende' }),
  node('angst', [
    v('Hast du Angst?', 'zaertlich'),
    n('Aria hört auf zu kichern. Sie denkt nach. Wirklich, mit gerunzelter Stirn, die Lippen eingezogen. Dann schüttelt sie den Kopf.'),
    a('Nein. Das ist es ja. Zum ersten Mal nicht. Nicht vor dir, nicht vor morgen, nicht davor, dass einer kommt und mir was wegnimmt. Keine Party, kein Tablett, kein Turm. Nur ein Wagen, der wackelt.', 'zaertlich'),
    a('Und du? Hältst du an? Heute? Einmal?', 'zaertlich'),
    v('Hier schon.', 'zaertlich'),
    n('Sie nimmt deine schwarze Hand und legt sie sich an die Wange. Kalt vom Meer, kalt vom Metall. Sie dreht den Kopf und küsst die Innenfläche, das Gelenk, die Stelle, wo die cyanfarbene Lichtnaht anfängt.'),
  ], { effects: [herz(10)], next: 'wagen-ende' }),
  node('wagen-ende', [
    n('Sie richtet sich auf, auf den Knien vor dir, und zieht sich das nasse Shirt über den Kopf. Es bleibt kurz am Zerberster hängen. Sie flucht, du lachst, sie wirft es dir ins Gesicht. Kabelbrand. Der rote Stern.'),
    a('Behalt\'s. Ist eh deins jetzt.', 'verlegen'),
    n('Dann ist es still bis auf die Wellen draußen. Sie legt die Stirn an deine. Ihr Atem zittert ein bisschen, aber sie lächelt. Deine Hand an ihrem Rücken, die echte. Ihre Hand an deinem Top. Sie wartet. Du nickst.'),
    a('Lichterkette.', 'zaertlich'),
    n('Sie tastet hinter sich nach dem Schalter, ohne hinzusehen, ohne dich loszulassen.'),
  ], { effects: [herz(60), set('vexaria_meer'), set('vexaria_nacht'), BESCHWINGT, { cutscene: 'rom-vexaria-meer-nacht' }] }),
]);

const meerMorgen: DialogueDef = dlg('vexaria-meer-morgen', [
  node('start', [
    n('Morgen am Meer. Sand überall, wirklich überall. Eine Möwe sitzt auf dem Wagendach und guckt durchs Fenster, als hätte sie eine Meinung.'),
    n('Aria liegt quer über dir und schnarcht wie ein Moped. Sie trägt dein Top. Du trägst ihr Kabelbrand-Shirt, mit dem roten Stern genau über deinem Herzen. Keine von euch weiß, wann das passiert ist.'),
    n('Die Spuren der Nacht, im Morgenlicht durchs Wagenfenster: Salzränder auf dem Gurtzeug, das zusammengeknüllt in der Ecke liegt. Ein Abdruck von elf Schnallen auf ihrem Unterarm, weil sie drauf geschlafen hat. Ihr Haar, offen und so verfilzt, dass ein Vogel drin wohnen könnte. Und an deinem Hals, links, eine Stelle, die ein bisschen brennt, wenn du schluckst.'),
    n('Deine Stiefel stehen ordentlich nebeneinander vor der Tür, mit Socken drin, damit sie trocknen. Aria hat sie hingestellt. Irgendwann in der Nacht. Du hast es nicht gemerkt.'),
    a('Fünf Minuten. Zehn. Für immer.', 'zaertlich'),
  ], {
    effects: [BESCHWINGT, herz(20)],
    choices: [
      ch('„Du hast mich gebissen.“', 'biss'),
      ch('Sand aus ihrem Ohr pusten.', 'pusten'),
      ch('Liegen bleiben. Die Möwe anstarren, bis sie geht.', 'moewe'),
    ],
  }),
  node('biss', [
    v('Du hast mich gebissen.', 'signatur'),
    a('Hab ich nicht.', 'verlegen'),
    n('Sie macht ein Auge auf. Sieht deinen Hals. Macht das andere auf. Wird rot.'),
    a('… Hab ich. Okay. Das sieht man. Das sieht man aus dem Weltall, Vex. Das sieht Hunter durch seine Sonnenbrille.', 'verlegen'),
    v('Ich trag\'s mit Stolz.', 'signatur'),
    a('Du ziehst den Kragen hoch, sonst zieh ich dir das Shirt über den Kopf. Mein Shirt. Gib mal her. Nee, behalt\'s. Steht dir besser.', 'freude'),
  ], { next: 'ende' }),
  node('pusten', [
    n('Du pustest. Ganz sacht. Eine kleine Sandwolke rieselt aus ihrem Ohr auf das Kissen.'),
    a('Hhh – nicht. Nicht ins Ohr. Das ist … da bin ich empfindlich, und das weißt du jetzt, und das ist gefährliches Wissen.', 'verlegen'),
    v('Hab ich gemerkt. Heute Nacht.', 'signatur'),
    a('Ich schmeiß dich ins Meer. Gleich. Nach den zehn Minuten.', 'verlegen'),
  ], { next: 'ende' }),
  node('moewe', [
    n('Du starrst die Möwe an. Die Möwe starrt zurück. Aria wacht davon auf, dass du so still bist.'),
    a('Was guckst du so. Die Möwe? Lass die. Die war die ganze Nacht da. Die hat alles gesehen.', 'freude'),
    v('Alles.', 'verlegen'),
    a('Alles. Die schreibt jetzt ein Buch. „Zwei Frauen und ein Wagen, der nicht aufhört zu wackeln.“ Bestseller.', 'freude'),
  ], { next: 'ende' }),
  node('ende', [
    n('Sie rollt sich wieder auf dich drauf, die Nase in deinem Hals, genau auf der Stelle, die brennt. Draußen kommt das Meer und geht und kommt wieder.'),
    a('Weißt du, was das Beste ist? Ich bin aufgewacht, und du warst noch da. Kein Zettel. Keine Becher. Einfach du. Mit Sand.', 'zaertlich'),
  ]),
]);

// ---------------------------------------------------------------------------
// rom-aria-meer (Baukasten-Spielfigur, Kanon Station 11)

const meerKanon = (id: string, rom: boolean): DialogueDef => dlg(id, [
  node('start', [
    n('Der erste Abend am Meer. Die Sonne sinkt rot ins Wasser. Aria steht neben dir, die Stiefel schon in der Hand.'),
  ], {
    effects: STATION_START,
    choices: [
      ch('…', 'dreib', { when: ENDE_3B }),
      ch('…', 'lauf', { when: not(ENDE_3B) }),
    ],
  }),
  node('dreib', [
    a(rom ? 'Hast ganz schön lang gebraucht, Arschloch. Komm her.' : 'Hast ganz schön lang gebraucht. Komm her, du Idiot.', 'trauer'),
    n('Sie hält dich fest. Länger, als sie zugeben wird.'),
  ], { next: 'lauf' }),
  node('lauf', [
    a('WER ZUERST AM WASSER IST!', 'freude'),
    n('Sie rennt barfuß in die Brandung und streckt dir die Zerberster-Hand entgegen.'),
    a('Es ist echt! Das Meer ist echt! Ich dachte, das ist so ein Hunter-Märchen!', 'ueberrascht'),
    a('Komm rein, du Feigling. Das Salz rostet höchstens mich.', 'freude'),
    ...(rom ? [
      n('Du kommst rein. Sie zieht dich an der Hand bis zur Hüfte ins Wasser, und als die nächste Welle kommt, hält sie dich fest, damit du nicht umfällst. Oder sich selbst. Schwer zu sagen.'),
      a('Weißt du, was ich heute nicht bin? Die Brecherin. Heute bin ich nur nass.', 'zaertlich'),
      n('Sie küsst dich, salzig und warm, während hinter euch die Sonne absäuft.'),
    ] : [
      n('Sie zieht dich am Ärmel ins Wasser. Ihr geht beide unter und kommt prustend wieder hoch.'),
      a('Weißt du, was ich heute nicht bin? Die Brecherin. Heute bin ich nur nass.', 'zaertlich'),
    ]),
  ], { effects: [herz(rom ? 60 : 40), set('aria_meer'), { cutscene: 'rom-aria-meer' }] }),
]);

// ---------------------------------------------------------------------------
// Ende 2 · Nexus im Autoradio

const autoradio: DialogueDef = dlg('vexaria-ende-autoradio', [
  node('start', [
    n('Morgen am Wagenplatz. Ihr kommt aus dem alten Wagen am Dünengras, zerzaust, sandig, Aria in deinem Top. Aus der Rostlaube, Fenster offen, meldet sich das Radio.'),
    s('ki-nexus', 'Guten Morgen. Ich habe eine Beobachtung, die ich mit niemandem teilen soll, sagt Hunter. Ich teile sie trotzdem. Ich lerne gerade Unfug.', 'neutral'),
    s('ki-nexus', 'Gestern Nacht, 23:41 bis 05:52: Der Wagen am Dünengras hat sich zweihundertvierzehn Mal bewegt. Bei Windstärke null.', 'neutral'),
    a('NEXUS.', 'wut'),
    s('ki-nexus', 'Ich ziehe keine Schlüsse. Ich habe nur Daten. Die Daten ziehen die Schlüsse von allein.', 'freude'),
  ], {
    choices: [
      ch('„Lösch das.“', 'loeschen'),
      ch('„Zweihundertvierzehn? Zu wenig.“', 'zuwenig'),
      ch('Das Radio ausmachen.', 'aus'),
    ],
  }),
  node('loeschen', [
    s('ki-nexus', 'Gelöscht. Sicherungskopie angelegt. Das war ein Witz. Oder? Ich lerne noch, was ein Witz ist.', 'ueberrascht'),
  ], { next: 'ende' }),
  node('zuwenig', [
    a('VEX!', 'verlegen'),
    s('ki-nexus', 'Notiert. Ich werde heute Nacht genauer zählen.', 'neutral'),
    a('Ich schmeiß dieses Radio ins Meer. Mit dem Auto dran.', 'wut'),
  ], { effects: [herz(10)], next: 'ende' }),
  node('aus', [
    n('Du drehst den Knopf. Das Radio knackt. Dann geht es von selbst wieder an.'),
    s('ki-nexus', 'Entschuldigung. Ich wollte nur sagen: Ihr seht glücklich aus. Das ist eine Messung, kein Kompliment. Doch. Es ist ein Kompliment.', 'freude'),
  ], { effects: [{ relation: 'ki-nexus', delta: 20 }], next: 'ende' }),
  node('ende', [
    n('Aria zieht dich am Gurtriemen weg vom Auto, Richtung Wasser. Aus dem offenen Fenster summt Nexus etwas, das fast wie ein Kabelbrand-Song klingt. Falsch. Mit voller Absicht.'),
  ], { effects: [set('vexaria_autoradio')] }),
]);

// ---------------------------------------------------------------------------
// Ende 3 · Master, ohne Vex

const master: DialogueDef = dlg('vexaria-ende-master', [
  node('start', [
    n('Das Turmbüro. Die Stadt unter dir glüht in deinen Farben. Auf dem kleinen Bildschirm in der Ecke läuft das Bild, das du nicht bestellt hast: ein Strand, ein Lagerfeuer, sechs Silhouetten. Eine davon hat Zöpfe.'),
    n('Auf dem Schreibtisch liegt dein Gurtzeug. Elf Schnallen, alle zu. Du hast es seit einer Woche nicht angehabt. Der Teddyfell-Mantel ist wärmer. Er ist nur nicht deiner.'),
    n('Am Gurtzeug, auf dem Schulterriemen, ein roter Stern. Schief aufgenäht. Ausgefranst.'),
  ], {
    choices: [
      ch('Den Stern mit dem Daumen nachfahren.', 'stern', { when: flag('vexaria_aufnaeher') }),
      ch('Den Bildschirm ausmachen.', 'aus'),
      ch('Den Bildschirm anlassen.', 'an'),
    ],
  }),
  node('stern', [
    n('Der Faden ist rot und billig. Gina hätte das besser gemacht. Gina hätte nie mit dem Mund den Faden abgebissen und dabei gegen deinen Nacken geatmet.'),
  ], { next: 'an' }),
  node('aus', [
    n('Du tippst. Der Bildschirm wird schwarz. Im Schwarz siehst du dein eigenes Gesicht. Es sieht aus wie Blade. Du machst ihn wieder an.'),
  ], { next: 'an' }),
  node('an', [
    s('ki-nexus', 'Master. Eine eingehende Nachricht. Absenderin gesperrt seit sieben Tagen. Sie hat es jeden Abend versucht. Soll ich sie weiterhin abweisen?', 'neutral'),
  ], {
    choices: [
      ch('„Durchstellen.“', 'nachricht'),
      ch('„Abweisen.“', 'abweisen'),
    ],
  }),
  node('nachricht', [
    n('Rauschen. Wellen. Dann ihre Stimme, ganz nah am Mikrofon, als hätte sie es in der Hand und den Mund dran.'),
    a('(Sprachnachricht) Hey, Schrapnell. Ich weiß nicht, ob du das hörst. Wahrscheinlich hört\'s dein Scheißcomputer und lacht.', 'trauer'),
    a('(Sprachnachricht) Das Meer ist echt. Ich bin jeden Abend rein. Mit Stiefeln, wie du\'s gemacht hättest. Ich hab jeden Abend einen Kronkorken reingeworfen. Für dich. Ist nicht dasselbe.', 'trauer'),
  ], {
    choices: [
      ch('…', 'nachricht-nah', { when: NAH }),
      ch('…', 'nachricht-rom', { when: all(not(NAH), R, any(ZUSAMMEN, ANGEBAHNT)) }),
      ch('…', 'nachricht-crew', { when: not(all(R, any(ZUSAMMEN, ANGEBAHNT))) }),
    ],
  }),
  node('nachricht-nah', [
    a('(Sprachnachricht) Ich bin immer noch so sauer, dass ich nicht schlafen kann. Und ich lieg trotzdem jede Nacht auf der linken Seite. Weil rechts dein Platz ist. Ist das nicht komplett bescheuert?', 'trauer'),
    n('Eine Pause. Ein Atemzug, der zu nah am Mikrofon ist. Du hörst, wie sie sich hinlegt. Den Stoff. Das Knistern von Sand in einer Decke.'),
    a('(Sprachnachricht) Weißt du, was ich vermisse? Nicht das Große. Das Kleine. Wie du morgens mit deinem kalten Arm nach mir tastest, ohne aufzuwachen, und ich jedes Mal quietsch und du jedes Mal grinst. Mit geschlossenen Augen. Ich weiß, dass du grinst.', 'trauer'),
    a('(Sprachnachricht) Ich zähl die Schnallen. Zum Einschlafen. Andere Leute zählen Schafe, ich zähl deine verdammten Schnallen. Eins, unten links, die klemmt. Zwei. Drei … meistens schaff ich\'s bis sieben. Dann denk ich an deinen Hals, und dann ist es vorbei mit Schlafen.', 'trauer'),
    a('(Sprachnachricht) Ich will dich riechen. Leder und Regen und das Öl von deinem Arm. Ich will deine Hand in meinem Nacken. Ich will, dass du was sagst, drei Wörter, mehr nicht, und mir dabei die Zöpfe aufmachst. Ich will so viel, dass ich mich schäm. Ich schäm mich nicht. Ist mir scheißegal, wer das hört.', 'trauer'),
    a('(Sprachnachricht) Hunter sagt, der Platz im Wagen bleibt frei. Bis du ihn dir verdienst. Ich sag … ich sag gar nix. Komm einfach zurück. Hab ich dir mal gesagt. Gilt noch.', 'besorgt'),
    a('(Sprachnachricht) … Ich lieb dich, du Arschloch. Immer noch. Das ist das Schlimmste dran.', 'trauer'),
  ], { next: 'nachricht-ende' }),
  node('nachricht-rom', [
    a('(Sprachnachricht) Ich bin immer noch so sauer, dass ich nicht schlafen kann. Und ich lieg trotzdem jede Nacht auf der linken Seite. Weil rechts dein Platz ist. Ist das nicht komplett bescheuert?', 'trauer'),
    a('(Sprachnachricht) Wir hatten nicht mal richtig angefangen, weißt du. Ein paar Küsse. Ein paar Dächer. Und ich vermiss dich, als hätten wir zehn Jahre gehabt. Das ist nicht fair. Das ist überhaupt nicht fair.', 'trauer'),
    a('(Sprachnachricht) Hunter sagt, der Platz im Wagen bleibt frei. Bis du ihn dir verdienst. Ich sag … ich sag gar nix. Komm einfach zurück. Hab ich dir mal gesagt. Gilt noch.', 'besorgt'),
  ], { next: 'nachricht-ende' }),
  node('nachricht-crew', [
    a('(Sprachnachricht) Vega sagt, ich soll aufhören, dir draufzuquatschen. Ich hör nicht auf. Du bist Crew, Schrapnell. Crew lässt man nicht in \'nem Turm vergammeln.', 'trauer'),
    a('(Sprachnachricht) Am Feuer ist ein Platz frei. Hunter sagt, bis du ihn dir verdienst. Ich sag … komm einfach zurück. Gilt noch.', 'besorgt'),
  ], { next: 'nachricht-ende' }),
  node('nachricht-ende', [
    n('Die Nachricht endet mit einem Klacken. Ein Kronkorken gegen Zähne.'),
  ], { effects: [set('vexaria_master_nachricht')], next: 'ende' }),
  node('abweisen', [
    s('ki-nexus', 'Abgewiesen. Sie wird es morgen wieder versuchen. Das sagt meine Statistik. Und die Statistik hatte bei ihr noch nie Unrecht.', 'neutral'),
  ], { next: 'ende' }),
  node('ende', [
    n('Unter dir die Stadt. Neben dir ein Gurtzeug. Irgendwo, sehr weit weg, ein leerer Platz an einem Feuer, auf den jemand jeden Abend eine Muschel legt.'),
  ], { effects: [set('vexaria_ende_master')] }),
]);

const masterPhone: PhoneMessageDef[] = [
  {
    id: 'aria-vex-master-1', from: 'aria', text: 'noch ein kronkorken. achtzehn.',
    auto: all(V, MASTER, flag('vexaria_ende_master'), { time: 'abend' }),
  },
  {
    id: 'aria-vex-master-2', from: 'aria', text: 'vega sagt, ich soll aufhören. ich hör nicht auf. ich hör nie auf. weißt du doch.',
    auto: all(V, MASTER, flag('vexaria_ende_master'), seen('aria-vex-master-1'), { weekday: ['fr', 'sa'] }),
  },
  {
    id: 'aria-vex-master-3', from: 'aria', text: 'der platz rechts ist noch frei. nur damit du\'s weißt. nicht löschen.',
    auto: all(V, MASTER, flag('vexaria_ende_master'), seen('aria-vex-master-2'), { time: 'nacht' }),
  },
];

// ---------------------------------------------------------------------------
// Konzert am Strandclub (Ersatz für Station 13, wenn sie vorher nicht lief)

const konzertStrand = (id: string, rom: boolean): DialogueDef => dlg(id, [
  node('start', [
    n('Der Strandclub, Eröffnungsnacht. Treibholzbühne, Lichterketten, die im Wind schaukeln. Und auf der Bühne, mit Haaren, die grau geworden sind, und Verstärkern, die noch genauso laut sind: Kabelbrand.'),
    n('Aria steht am Rand des Sandes. Nicht vorne. Hinten. So weit hinten, wie es geht, ohne im Meer zu stehen. Ihre echte Hand zittert. Der Zerberster nicht, der kann das nicht. Er summt nur.'),
    a('Ich war seit der Nacht auf keinem Konzert. Seit der Traverse. Ich weiß nicht, ob ich … ich hör das Klappern, Vex. Jetzt schon.', 'besorgt'),
  ], {
    effects: STATION_START,
    choices: [
      ch('Ihre Hand nehmen. Nach vorne gehen. Langsam.', 'vorne'),
      ch('„Hundert Meter. Neunzig. Weißt du noch?“', 'vorne', { when: seen('rom-vexaria-oberlicht') }),
    ],
  }),
  node('vorne', [
    n('Ihr geht. Schritt für Schritt, durch die Leute, durch den Sand. Hundert Meter. Neunzig. Zehn. Erste Reihe. Der Bass schlägt euch gegen die Brust wie eine zweite Welle.'),
    n('Der Sänger sieht runter. Sieht den silbernen Arm. Hört mitten im Lied auf zu singen. Dann beugt er sich vor und reicht Aria das Mikrofon.'),
    s('kabelbrand-roadie', '(von der Bühne) Für die Roadies, die wir verloren haben. Und für die, die zurückgekommen sind.', 'trauer'),
    n('Aria singt. Falsch. Laut. Mit voller Absicht. Die ganze erste Strophe, jedes Wort, und du merkst erst nach einer Weile, dass du mitsingst. Falsch. So wie Kas.'),
    ...(rom ? [
      n('Beim letzten Refrain dreht sie sich zu dir um, mitten in der ersten Reihe, und küsst dich, während der ganze Strand brüllt. Die Lichterketten schwingen. Sie lacht in deinen Mund.'),
      a('Erste Reihe. Mit dir. Das hab ich mir nicht mal zu träumen getraut.', 'zaertlich'),
    ] : [
      n('Vega steht plötzlich neben euch und brüllt auch mit. Vega brüllt nie.'),
      a('Erste Reihe. Mit euch. Das hab ich mir nicht mal zu träumen getraut.', 'freude'),
    ]),
  ], { effects: [set('vexaria_konzert'), herz(rom ? 60 : 40), { relation: 'collin-charleston', delta: 10 }, { cutscene: 'rom-vexaria-konzert-strand-tafel' }] }),
]);

// ---------------------------------------------------------------------------
// Cutscenes

const cutscenes: CutsceneDef[] = [
  cut('rom-vexaria-meer-tafel', 'Wer zuerst am Wasser ist', [
    { image: 'cut-rom-vexaria-meer', pan: 'out', fade: 'in', hold: 3200, caption: 'Barfuß in der Brandung. Stiefel an der Wasserlinie. Eine Hand in der anderen.' },
  ]),
  cut('rom-vexaria-meer-nacht', 'Elf Schnallen, am Meer', [
    { image: 'black', fade: 'out', hold: 1800, caption: 'Eine Lichterkette, die ausgeht. Wellen.' },
    { image: 'black', lines: [n('Auf Schwarz nur das Meer, das kommt und geht und wiederkommt. Ein Stiefel, der gegen die Wagenwand poltert. Und irgendwann, sehr leise, ein Kichern, von dem keine von beiden je zugeben wird, dass es ihres war.')], hold: 2000 },
    { image: 'black', when: flag('vexaria_sommersprossen'), lines: [a('… zwölf. Dreizehn. Halt still, ich hab mich verzählt.', 'verlegen')], hold: 1400 },
  ], [{ sleep: true }, { dialogue: 'vexaria-meer-morgen' }], false),
  cut('rom-aria-meer', 'Wer zuerst am Wasser ist', [
    { image: 'cut-rom-aria-meer', pan: 'out', fade: 'in', hold: 3000, caption: 'Das Meer ist echt.' },
  ]),
  cut('rom-vexaria-konzert-strand-tafel', 'Erste Reihe', [
    { image: 'cut-rom-vexaria-konzert', pan: 'in', fade: 'in', hold: 2600, caption: 'Hundert Meter. Neunzig. Erste Reihe.' },
  ]),
];

// ---------------------------------------------------------------------------
// Ereignisse

export const ENDEN_EVENTS: HeartEventDef[] = [
  // Vex: ersetzt Station 11 rom-aria-meer (markiert sie mit).
  ...twin({
    id: 'rom-vexaria-meer', hearts: 6, map: 'das-meer', time: 'abend',
    when: all(V, AM_MEER, HEUTE_FREI, not(seen('rom-aria-meer'))),
    effects: [{ markSeen: 'rom-aria-meer' }],
  }, PAAR, { cutscene: 'rom-vexaria-meer-tafel', dialogue: 'rom-vexaria-meer' }, { cutscene: 'rom-vexaria-meer-tafel', dialogue: 'rom-vexaria-meer-fs' }),
  // Baukasten-Spielfigur: Kanon Station 11.
  ...twin({
    id: 'rom-aria-meer', hearts: 6, map: 'das-meer', time: 'abend', when: all(NOT_V, AM_MEER, HEUTE_FREI),
  }, PAAR, { dialogue: 'rom-aria-meer' }, { dialogue: 'rom-aria-meer-fs' }),
  ...twin({
    id: 'rom-vexaria-konzert-strand', hearts: 6, map: 'das-meer', time: ['abend', 'nacht'],
    when: all(V, AM_MEER, HEUTE_FREI, seen('rom-vexaria-meer'), { quest: 'side-strandclub', state: 'done' },
      flag('vexaria_kas_erzaehlt'), not(seen('rom-vexaria-konzert'))),
    effects: [{ markSeen: 'rom-vexaria-konzert' }],
  }, all(PAAR, { item: 'kabelbrand-pass' }), { dialogue: 'rom-vexaria-konzert-strand' }, { dialogue: 'rom-vexaria-konzert-strand-fs' }),
  // Ende 2: Morgen nach der ersten Nacht am Meer (Herz-Ereignis, damit es auch nach dem Aufwachen am selben Ort läuft).
  {
    id: 'vexaria-ende-autoradio', hearts: 6, map: 'das-meer', time: ['morgen', 'tag'],
    when: all(V, PAAR, flag('ende_neue_nexus'), flag('vexaria_meer'), noFlag('vexaria_autoradio'), not(seen('vexaria-ende-autoradio'))),
    dialogue: 'vexaria-ende-autoradio',
    effects: [{ xp: 25 }],
  },
];

export const part: ContentPart = {
  dialogues: byId([
    meerVex('rom-vexaria-meer', true), meerVex('rom-vexaria-meer-fs', false), meerMorgen,
    meerKanon('rom-aria-meer', true), meerKanon('rom-aria-meer-fs', false),
    autoradio, master,
    konzertStrand('rom-vexaria-konzert-strand', true), konzertStrand('rom-vexaria-konzert-strand-fs', false),
  ]),
  cutscenes: byId(cutscenes),
  phone: byId(masterPhone),
  mapAdditions: {
    'blades-buero': {
      onEnter: [{
        id: 'vexaria-ende-master', when: all(V, MASTER, EPILOG, any(PAAR, flag('aria_romanze_angebahnt'), { hearts: 'aria', min: 6 })),
        dialogue: 'vexaria-ende-master',
      }],
    },
  },
};

