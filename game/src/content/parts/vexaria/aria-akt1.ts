// Aria-Strang „Zerberster-Herz“, Akt 1 (world.md §4.7, Stationen 1–4) mit Vex-Fassungen (Tabelle „Vex-Fassungen“).
// Tafeln rom-aria-* bleiben Ich-Perspektive, auch für Vex. Romanzefassung nur mit { romance: 'aria' } und ab Station 3
// mit aria_romanze_angebahnt; Freundschaft mit Standard-Ausdrücken.
import type { ContentPart } from '../../part';
import type { Condition, DialogueDef, HeartEventDef, PhoneMessageDef } from '../../../modules/contracts';
import {
  a, all, any, byId, ch, chk, cut, dlg, flag, GOSSE_ANDERE, GOSSE_VEX, herz, HEUTE_FREI, msg, n, node, noFlag, not, NOT_V, p, R,
  s, seen, set, station, STATION_START, V, v, WARTEN_VORBEI, ZWEI_TAGE,
} from './_util';

const ROM_AN_ALLE: Condition = all(R, flag('aria_romanze_angebahnt'));
const FS_ALLE: Condition = not(ROM_AN_ALLE);

// ---------------------------------------------------------------------------
// A1 · rom-aria-training · „Schlag zu, Weichei“ (♥6, Garage Rostlaube an der Hafenkante)

const training: DialogueDef = dlg('rom-aria-training', [
  node('start', [
    n('Die Garage Rostlaube. Käpt\'n Nebelhorn duldet den Boxsack, solange keiner sein Boot erwähnt. Aria hat dir zwei Pratzen zugeworfen und die Bandagen um die echte Hand gewickelt.'),
    a('Hände hoch, Deckung, nicht so schlaff. Du boxt wie ein nasser Lappen.', 'signatur'),
    n('Pratze gegen Faust. Pratze gegen Zerberster. Jeder Schlag des Metallarms fährt dir bis in die Schultern. Sie lacht bei jedem. Dann, mitten im Rhythmus, kommt einer zu schnell.'),
    n('Die silberne Faust bleibt zwei Zentimeter vor deinem Gesicht stehen. Du riechst das Öl in den Gelenken. Zu spät gebremst. Viel zu spät.'),
    a('Scheiße. Sorry. Das Ding ist manchmal schneller als ich.', 'besorgt'),
    n('Sie ist blass geworden. Für einen Moment ist da kein Großmaul, nur jemand, der sich vor der eigenen Hand erschreckt.'),
    a('Vergiss es. War nix. Nochmal, und diesmal triffst du, du Pfeife.', 'freude'),
  ], {
    effects: STATION_START,
    choices: [
      ch('Die Pratze durchschlagen. Mit allem.', 'koerper', { check: chk('aria-training-koerper', 'koerper', 5, ['kraft']), effects: [herz(40)] }),
      ch('Unter der nächsten Faust wegtauchen.', 'reflexe', { check: chk('aria-training-reflexe', 'reflexe', 6, ['ausweichen']), effects: [herz(40)] }),
      ch('„Du hast gebremst. Ich auch. Ich brems sonst nie.“', 'gebremst-vex', { when: V, effects: [herz(30)] }),
      ch('„Du hast gebremst. Das zählt.“', 'gebremst', { when: NOT_V, effects: [herz(20)] }),
      ch('„Auf\'m Bahnhofsklo hätte mich das \'nen Zahn gekostet.“', 'knast', { ...GOSSE_VEX, effects: [herz(30)] }),
      ch('„Im Hof hätte mich das die Zähne gekostet.“', 'knast', { tag: '[Knast]', when: all(NOT_V, { origin: 'origin-knastvogel' }), effects: [herz(30)] }),
      ch('Weiterboxen und verlieren. Mit Stil.', 'verlieren', { effects: [herz(20)] }),
    ],
  }),
  node('koerper', [
    n('Du legst alles in einen Schlag. Die Pratze knallt gegen ihre Faust, ihr Fuß rutscht einen halben Schritt zurück.'),
    a('Na also, da steckt ja doch ein Mensch drin.', 'freude'),
  ], { next: 'ende' }),
  node('reflexe', [
    n('Die nächste Faust zischt über deinen Kopf hinweg. Du bist schon auf der anderen Seite, bevor sie merkt, dass sie Luft geschlagen hat.'),
    a('HA! Woher kannst du das?', 'ueberrascht'),
  ], { next: 'reflexe-2' }),
  node('reflexe-2', [a('Du bewegst dich wie \'ne Taube auf Koffein!', 'freude')], { next: 'ende' }),
  node('gebremst-vex', [
    v('Du hast gebremst. Ich auch. Ich brems sonst nie.'),
    a('… Echt jetzt?', 'ueberrascht'),
    v('Echt jetzt. Gewöhn dich nicht dran.', 'signatur'),
  ], { next: 'ende' }),
  node('gebremst', [
    p('Du hast gebremst. Das zählt.'),
    a('… Ja? Findest du?', 'ueberrascht'),
  ], { next: 'ende' }),
  node('knast', [
    a('Siehst du. Deshalb bremse ich ja.', 'freude'),
    n('Sie grinst schief, aber ihre Metallhand hängt jetzt ruhiger an ihrer Seite.'),
  ], { next: 'ende' }),
  node('verlieren', [
    n('Drei Runden später liegst du auf der Matte, und Aria sitzt auf dem Boxsack-Hocker und trinkt aus deiner Flasche.'),
    a('Verlieren kannst du schon mal gut.', 'freude'),
  ], { next: 'ende' }),
  node('ende', [
    a('Selbe Zeit nächste Woche. Wenn du kneifst, hol ich dich ab. Mit dem Schläger.', 'signatur'),
  ], { effects: [msg('Sparring mit Aria: einmal pro Woche abends in der Garage Rostlaube (Tagesgespräch).')] }),
]);

// ---------------------------------------------------------------------------
// A2 · rom-aria-werkstatt · „Drei Nächte“ (♥7, Di/Do tagsüber, Dantes Werkstatt)

const werkstatt: DialogueDef = dlg('rom-aria-werkstatt', [
  node('start', [
    n('Dante wollte Kaffee holen. Das war vor vierzig Minuten. Durchs Fenster sieht man ihn am Eins!-Tisch mit drei Kindern, die ihn gerade ausnehmen.'),
    n('Aria sitzt allein an der Einbauliege. Die Abdeckung des Zerbersters ist aufgeklappt, darunter Federn, Kabel, ein Kern, der leise tickt. Sie schraubt mit der echten Hand und flucht dabei gleichmäßig wie ein Metronom.'),
    a('Guck nicht so. Das ist nicht eklig. Okay, ist es. Gib mir den Kreuzschlitz. Nein, den ANDEREN Kreuzschlitz.', 'signatur'),
    n('Eine Weile ist nur das Klicken der Ratsche zu hören. Dann fängt sie an zu reden, ohne aufzusehen.'),
    a('Rennhalle 9. Abschiedskonzert von Kabelbrand. Ich war Roadie. Ich hab die Lichter gehängt. Dann ist die Traverse runtergekommen. Starkstrom. Vega hat mich rausgetragen.', 'trauer'),
    a('Ich bin aufgewacht, Kuschel lag auf meiner Brust, und ich wollte mir die Augen reiben. Mit links. Da war das hier. Kalt. Ich hab geschrien wie am Spieß.', 'trauer'),
    a('Dante hat mir \'ne Nougatbombe in den Mund gestopft, damit ich die Klappe halte. Hat funktioniert.', 'freude'),
    a('Drei Nächte. Drei Nächte hat er an dem Ding gebaut, und er hat nie einen Cent genommen. Sag ihm nie, dass ich das weiß.', 'neutral'),
    a('Manchmal juckt die Hand. Die echte. Die irgendwo in \'nem Container verrottet. Lach nicht, verdammt.', 'besorgt'),
  ], {
    effects: STATION_START,
    choices: [
      ch('„Juckt die Hand gerade?“', 'jucken-vex', { when: V, effects: [herz(40)] }),
      ch('„Tut\'s weh?“', 'weh', { when: NOT_V, effects: [herz(40)] }),
      ch('„Hat der auch einen Toastermodus?“', 'toaster', { effects: [herz(10)] }),
      ch('Feinjustierung am Griffsensor. „Halt still.“', 'gravur', { when: NOT_V, check: chk('aria-werkstatt-technik', 'technik', 6, ['reparieren']) }),
      ch('„Gib her. Ich halt die Platte, du lötest.“', 'gravur', { when: V, check: chk('aria-werkstatt-strasse-vex', 'strasse', 5, ['reparieren']) }),
      ch('„Der Kern ist kein Dante-Teil. Das ist Ripper-Ware.“', 'kern', { tag: '[Schrott]', when: all(NOT_V, { origin: 'origin-schrott' }), effects: [set('aria_kern_ripper')] }),
    ],
  }),
  node('jucken-vex', [
    a('… Woher weißt du, dass man das fragt?', 'ueberrascht'),
    n('Du hebst die schwarzen Metallfinger. Sie surren leise, eine Spur zu langsam.'),
    v('Meine juckt jeden Abend. Die, die\'s nicht mehr gibt.'),
    n('Aria hört auf zu schrauben. Sie sieht auf deinen Arm, als würde sie ihn zum ersten Mal wirklich sehen. Graphitschwarz. Zerkratzt. Billig.'),
    a('Woher hast du das Ding eigentlich?', 'neutral'),
    v('Ripper. Raten.'),
    a('Und davor?', 'besorgt'),
    v('Davor hatt ich einen. Später.', 'trauer'),
    a('… Okay. Später.', 'neutral'),
    a('Alle fragen, wie stark das Ding ist. Du bist die Erste, die fragt, ob\'s juckt.', 'neutral'),
  ], { next: 'ende' }),
  node('weh', [
    a('Alle fragen, wie stark das Ding ist. Du bist der erste Mensch, der fragt, ob\'s wehtut.', 'neutral'),
    a('Ja. Manchmal. Da, wo nix mehr ist. Das ist das Bescheuerte.', 'trauer'),
  ], { next: 'ende' }),
  node('toaster', [
    a('Hat der was?!', 'wut'),
    n('Sie starrt dich an. Dann prustet sie los, so heftig, dass ihr der Kreuzschlitz aus der Hand fällt.'),
    a('Arschloch. Nein. Aber ich frag Dante. Ich hätt so gern \'nen Toastermodus.', 'freude'),
  ], { next: 'ende' }),
  node('gravur', [
    n('Ihr arbeitet zu zweit: deine Hand hält die Abdeckplatte, ihre den Lötkolben. Eure Finger sind sehr nah beieinander. Keine von euch sagt etwas dazu.'),
    n('Als die Platte sitzt, ritzt Aria mit der Lötspitze ein kleines Zeichen in die Innenseite. Ganz schnell, als wäre es verboten.'),
    a('Nicht gucken. Ist privat.', 'signatur'),
  ], {
    choices: [
      ch('Doch gucken.', 'gravur-vex', { when: V }),
      ch('Doch gucken.', 'gravur-andere', { when: NOT_V }),
    ],
  }),
  node('gravur-vex', [
    n('Ein kleines Zickzack-Dach. Wie die Dächer über der Neon-Gasse, wenn man sie von oben sieht. Wie die Strecke, die du jede Nacht läufst.'),
    a('Ich hab gesagt, nicht gucken!', 'wut'),
    v('War nicht komplett scheiße.'),
  ], { effects: [{ give: 'zerberster-gravur' }], next: 'ende' }),
  node('gravur-andere', [
    n('Ein kleiner Stern, schief. Daneben zwei Buchstaben, die sie sofort mit dem Daumen verschmiert.'),
    a('Ich hab gesagt, nicht gucken!', 'wut'),
  ], { effects: [{ give: 'zerberster-gravur' }], next: 'ende' }),
  node('kern', [
    a('Halt die Klappe.', 'wut'),
    n('Sie beugt sich über den Kern. Lange.'),
    a('… Ernsthaft? Scheiße.', 'besorgt'),
  ], { next: 'ende' }),
  node('ende', [
    n('Draußen ruft Dante „EINS!“ und verliert trotzdem. Aria klappt die Abdeckung zu und klopft zweimal darauf, wie auf den Kopf eines Hundes.'),
    a('Sag keinem, dass ich geredet hab. Ich hab \'nen Ruf.', 'signatur'),
  ], { effects: [set('aria_unfall_erzaehlt')] }),
]);

// ---------------------------------------------------------------------------
// A3 · rom-aria-dach · „Ist das ein Date?“ (♥8, 22–01 Uhr, Dachterrasse der Neon-Gasse)

const dachFrage = (prefix: string) => [
  node(`${prefix}-frage`, [
    a('Und? Ist das hier … also … ist das ein Date? Sag nein, dann war\'s keins und keiner muss sterben.', 'verlegen'),
  ], {
    choices: [
      ch('„Wenn du\'s so nennst: ja.“', `${prefix}-ja`, { when: NOT_V, check: chk(`aria-dach-ausstrahlung-${prefix}`, 'ausstrahlung', 5, ['flirt']) }),
      ch('„Ein Date hätte Stäbchen, die nicht abbrechen.“', `${prefix}-ja-staebchen`, { check: chk(`aria-dach-strasse-${prefix}`, 'strasse', 5, ['flirt']) }),
      ch('„Ist \'n Date. Ich hab extra geduscht.“', `${prefix}-ja-vex`, { when: all(V, any(flag('vexaria_hand'), flag('aria_unfall_erzaehlt'))) }),
      ch('„Ist \'n Date. Ich hab extra geduscht.“', `${prefix}-zu-schnell`, { when: all(V, noFlag('vexaria_hand'), noFlag('aria_unfall_erzaehlt')) }),
      ch('„Ja. Ich wollte, dass es eins ist.“', `${prefix}-ja`, { when: all(NOT_V, flag('aria_unfall_erzaehlt')) }),
      ch('„Ja. Ich wollte, dass es eins ist.“', `${prefix}-zu-schnell`, { when: all(NOT_V, noFlag('aria_unfall_erzaehlt')) }),
      ch('„Du kennst die Nudelbude am Bahnhof? Dann weißt du, dass das hier Luxus ist.“', `${prefix}-ja-gosse`, { ...GOSSE_VEX }),
      ch('„Du kennst die Nudelbude am Bahnhof? Dann weißt du, dass das hier Luxus ist.“', `${prefix}-ja-gosse`, { ...GOSSE_ANDERE }),
      ch('„Ein Date mit \'nem Snob. Meine Mutter würde sich im Grab umdrehen. Sie lebt übrigens noch, ich übertreib nur gern.“', `${prefix}-ja`, { tag: '[Oberstadt]', when: all(NOT_V, { origin: 'origin-oberstadt' }) }),
      ch('„Crew-Abend.“', `${prefix}-crew`),
    ],
  }),
  node(`${prefix}-ja-staebchen`, [
    n('Du hältst ihr dein Stäbchen hin. Es ist in der Mitte durchgebrochen.'),
    a('… Ist das ein Ja? Das ist ein Ja. Das ist das gossigste Ja, das ich je gekriegt hab.', 'verlegen'),
  ], { next: `${prefix}-ja` }),
  node(`${prefix}-ja-vex`, [
    a('Du hast – für mich –? Okay. Das ist ein Date. Das ist SO ein Date.', 'zaertlich'),
  ], { next: `${prefix}-ja` }),
  node(`${prefix}-ja-gosse`, [
    a('Die mit dem Koch, der ins Wasser spuckt, „für den Geschmack“? Gott. Ja. Das hier ist das Ritz.', 'freude'),
  ], { effects: [herz(20)], next: `${prefix}-ja` }),
  node(`${prefix}-ja`, [
    a('Gut. Okay. Gut. Iss deine Nudeln, bevor ich\'s mir anders überleg.', 'zaertlich'),
    n('Sie rückt ein Stück näher. Nicht viel. Gerade so, dass ihre Schulter deine streift, wenn sie isst. Sie isst sehr viel in dieser Nacht.'),
  ], { effects: [set('aria_romanze_angebahnt'), set('aria_date_spaeter', false), herz(60), msg('Aria: Romanze angebahnt.')] }),
  node(`${prefix}-zu-schnell`, [
    a('Zu schnell. Frag mich nächste Woche nochmal.', 'verlegen'),
    n('Sie grinst in ihre Nudeln. Es ist kein Nein. Es ist ein „noch nicht“ mit Soße.'),
  ], { effects: [set('aria_date_spaeter'), ...ZWEI_TAGE, herz(20)] }),
  node(`${prefix}-crew`, [
    a('Crew-Abend. Klar. Crew-Abend.', 'freude'),
    a('Dann ist das hier der beste Crew-Abend der Geschichte, und du kriegst die Hälfte von meinem Nachtisch. Ich hab keinen Nachtisch. Du kriegst nix.', 'signatur'),
  ], { effects: [herz(40), set('aria_crewabend')] }),
];

const dach: DialogueDef = dlg('rom-aria-dach', [
  node('start', [
    n('Die Dachterrasse über der Neon-Gasse. Vega räumt ihren Ausguck mit einem Augenrollen, das man bis zur Flutmauer sehen kann, und nimmt ihre Thermoskanne mit.'),
    s('vega', 'Zwei Stunden. Dann will ich meinen Stuhl zurück. Und fasst meinen Windmesser nicht an.', 'neutral'),
    n('Aria sitzt auf der Bank unter der Lichterkette, zwei Boxen Synth-Nudeln auf den Knien. Sie hält dir eine hin, ohne dich anzusehen.'),
    a('Warum Hühner nicht in die Oberstadt dürfen? Weil sie keinen … warte, ich krieg\'s hin.', 'freude'),
    n('Sie lacht. Bevor sie den Witz zu Ende erzählt hat. Dann noch mal, weil sie den Schluss vergessen hat, und dann so sehr, dass sie sich an einer Nudel verschluckt.'),
    a('Weil sie keinen … Pass … haben. Nee. Das war\'s nicht. Scheiße. Das war echt lustig, als Dante es erzählt hat.', 'freude'),
  ], {
    effects: STATION_START,
    choices: [
      ch('Weiteressen.', 'vex-ort', { when: V }),
      ch('Weiteressen.', 'a-frage', { when: NOT_V }),
    ],
  }),
  node('vex-ort', [
    n('Die Stadt unter euch summt. Ganz hinten, über den Dächern, liegt die Lücke. Du siehst nicht hin. Diesmal nicht.'),
    v('Ich bin nie zweimal am gleichen Ort. Ich bin zum zweiten Mal hier oben mit dir.', 'verlegen'),
    a('… Ist das gut oder schlecht?', 'ueberrascht'),
    v('Weiß ich noch nicht.'),
  ], { next: 'a-frage' }),
  ...dachFrage('a'),
]);

/** Neuer Versuch nach „Zu schnell“ (über das Tagesgespräch). */
const dachNochmal: DialogueDef = dlg('aria-date-nochmal', [
  node('start', [
    a('Du. Ich hab nachgedacht. Ist selten, tut weh. Die Frage vom Dach. Frag nochmal.', 'verlegen'),
  ], { next: 'b-frage' }),
  ...dachFrage('b'),
]);

// ---------------------------------------------------------------------------
// A4 · rom-aria-albtraum · „Nur die Brecherin“ (♥8, zwei Tage nach dem Dach, kurz vor zwei, Feuerleiter)

const albtraum: DialogueDef = dlg('rom-aria-albtraum', [
  node('start', [
    n('„bist du wach“ – ohne Fragezeichen. Du bist wach. Du bist meistens wach.'),
    n('Die Feuerleiter unter der Dachterrasse. Aria sitzt auf der dritten Stufe im Kapuzenpulli, die Kapuze tief, die Knie hochgezogen. Die Metallhand liegt auf ihrem Oberschenkel und zittert. Metall zittert nicht. Diese schon.'),
    a('Ich hab im Schlaf in die Wand gehauen. Mit dem Ding. Jetzt hör ich den Nachbarn schnarchen.', 'besorgt'),
    a('Ich hab vom Konzert geträumt. Wie immer. Das Klappern. Die Lichter klappern, bevor sie fallen, weißt du das? So ein … Klappern.', 'trauer'),
  ], {
    effects: STATION_START,
    choices: [
      ch('Zuhören.', 'vex-kinder', { when: V }),
      ch('Zuhören.', 'kern', { when: NOT_V }),
    ],
  }),
  node('vex-kinder', [
    a('… und oben, auf dem Oberlicht, waren zwei Kids. Ich träum immer, dass die fallen. Nicht ich. Die.', 'trauer'),
    v('…', 'ueberrascht'),
    n('Vex sagt nichts.'),
    v('…', 'trauer'),
    n('Dein Daumen findet die Schnalle am Brustriemen. Zwei Kids auf dem Glas. Ein Lied, falsch mitgesungen. Ein Schrei von unten. Du drehst dich nicht um. Du hast dich nie umgedreht.'),
  ], { next: 'kern' }),
  node('kern', [
    a('Hunter ruft mich, wenn was kaputtgehen soll. Keiner ruft mich, wenn was heil bleiben soll. Ich bin die Brecherin. Das ist alles.', 'trauer'),
    a('Wenn das Ding mal ausfällt, was bin ich dann? \'Ne Heulsuse mit Baseballschläger.', 'wut'),
  ], {
    choices: [
      ch('„Ich bin hier. Ich geh nicht. Heute nicht.“', 'hier-vex', { when: V, effects: [herz(50)] }),
      ch('Die zitternde Metallhand zwischen beide Hände nehmen. „Die zittert nicht. Die friert. Gib her.“', 'hand-vex', { when: V, check: chk('aria-albtraum-koerper-vex', 'koerper', 4, ['trost']), effects: [herz(50)] }),
      ch('„Du bist die, die mich um drei Uhr nachts anschreibt. Nicht der Arm.“', 'nachts', { when: NOT_V, check: chk('aria-albtraum-ausstrahlung', 'ausstrahlung', 6, ['trost']), effects: [herz(60)] }),
      ch('„In meiner ersten Nacht in der Zelle hab ich die Wand verprügelt. Die Wand hat gewonnen.“', 'knast', { tag: '[Knast]', when: all(NOT_V, { origin: 'origin-knastvogel' }), effects: [herz(50)] }),
      ch('„Da draußen sagt man: Wer nachts nicht schlafen kann, zählt Sterne, keine Fehler.“', 'sterne', { tag: '[Ödnis]', when: all(NOT_V, { origin: 'origin-oednis' }), effects: [herz(40)] }),
      ch('Neben ihr sitzen und schweigen.', 'schweigen-rom', { when: ROM_AN_ALLE, effects: [herz(40)] }),
      ch('Neben ihr sitzen und schweigen.', 'schweigen-fs', { when: FS_ALLE, effects: [herz(40)] }),
    ],
  }),
  node('hier-vex', [
    v('Ich bin hier. Ich geh nicht. Heute nicht.'),
    n('Für Vex Schrapnell, die nie zwei Nächte am selben Ort schläft, ist „heute nicht“ ein ziemlich großes Versprechen. Aria scheint das zu wissen. Sie sieht dich lange an.'),
  ], { next: 'schluss' }),
  node('hand-vex', [
    n('Du nimmst ihre Metallhand. Deine echte drunter, deine schwarze drüber. Drei Hände aus zwei Sorten Metall und einer Sorte Haut.'),
    v('Die zittert nicht. Die friert. Gib her.'),
    n('Das Zittern hört nicht sofort auf. Aber es wird langsamer. Wie ein Motor, der endlich in den Leerlauf darf.'),
  ], { next: 'schluss' }),
  node('nachts', [
    p('Du bist die, die mich um drei Uhr nachts anschreibt. Nicht der Arm.'),
    n('Sie zieht die Kapuze noch tiefer. Darunter ein Geräusch, halb Lachen, halb das andere.'),
  ], { next: 'schluss' }),
  node('knast', [
    a('Die Wand hat … HA. Die Wand.', 'freude'),
    n('Sie lacht. Unter Tränen, aber sie lacht.'),
  ], { next: 'schluss' }),
  node('sterne', [
    a('Okay. Eins. Zwei. Drei. … Da ist \'ne Drohne. Zählt die?', 'freude'),
    n('Sie kommt bis drei. Das ist mehr als nichts.'),
  ], { next: 'schluss' }),
  node('schweigen-rom', [
    n('Ihr sitzt. Die Stadt brummt. Irgendwann, ganz langsam, als könnte es jemand sehen, lehnt Aria den Kopf an deine Schulter. Die Zöpfe kitzeln an deinem Hals.'),
  ], { next: 'schluss' }),
  node('schweigen-fs', [
    n('Ihr sitzt. Die Stadt brummt. Irgendwann boxt Aria dir gegen die Schulter. Nicht fest. Dann lässt sie die Faust einfach dort liegen.'),
  ], { next: 'schluss-fs' }),
  node('schluss', [
    a('Sag das nochmal. Nein. Lass. Sonst glaub ich\'s noch.', 'zaertlich'),
  ], {
    choices: [
      ch('Sitzen bleiben, bis es hell wird.', 'ende', { when: ROM_AN_ALLE }),
      ch('Sitzen bleiben, bis es hell wird.', 'schluss-fs', { when: FS_ALLE }),
    ],
  }),
  node('schluss-fs', [a('Danke. Für … das. Sag\'s keinem. Ich hab \'nen Ruf.', 'freude')], { next: 'ende' }),
  node('ende', [
    n('Irgendwann geht über den Kränen der Hafenkante ein dünnes Grau auf. Aria schläft auf der Feuerleiter ein. Du nicht.'),
  ], { effects: [set('aria_albtraum_geteilt')] }),
]);

// ---------------------------------------------------------------------------
// Telefon-Einladungen

const phone: PhoneMessageDef[] = [
  {
    id: 'aria-ruf-dach', from: 'aria', text: 'Komm aufs Dach. Bring nix mit. Doch: Hunger.',
    auto: all(seen('rom-aria-werkstatt'), not(seen('rom-aria-dach')), { hearts: 'aria', min: 8 }, HEUTE_FREI, { time: ['abend', 'nacht'] }),
  },
  {
    id: 'aria-ruf-albtraum', from: 'aria', text: 'bist du wach',
    auto: all(seen('rom-aria-dach'), not(seen('rom-aria-albtraum')), WARTEN_VORBEI, HEUTE_FREI, { clockBetween: [1380, 1560] }),
    replies: [{ text: 'Ja. Wo?' }, { text: 'Immer.', effects: [herz(5)] }],
  },
];

// ---------------------------------------------------------------------------
// Tafeln (Ich-Perspektive, beide Spielfiguren)

const cutscenes = [
  cut('rom-aria-training', 'Schlag zu, Weichei', [
    { image: 'cut-rom-aria-training', pan: 'in', fade: 'in', hold: 1800, caption: 'Garage Rostlaube. Pratze gegen Zerberster.' },
    { image: 'cut-rom-aria-training', pan: 'left', lines: [a('Na los. Ich beiß nicht. Der Arm vielleicht.', 'signatur')] },
  ], [{ dialogue: 'rom-aria-training' }]),
  cut('rom-aria-werkstatt', 'Drei Nächte', [
    { image: 'cut-rom-aria-werkstatt', pan: 'right', fade: 'in', hold: 1800, caption: 'Dantes Werkstatt. Dienstag oder Donnerstag. Kaffee kommt nie.' },
  ], [{ dialogue: 'rom-aria-werkstatt' }]),
  cut('rom-aria-dach', 'Ist das ein Date?', [
    { image: 'cut-rom-aria-dach', pan: 'in', fade: 'in', hold: 2000, caption: 'Dachterrasse, Lichterkette, zwei Boxen Synth-Nudeln.' },
  ], [{ dialogue: 'rom-aria-dach' }]),
  cut('rom-aria-albtraum', 'Nur die Brecherin', [
    { image: 'cut-rom-aria-albtraum', pan: 'in', fade: 'in', hold: 2200, caption: 'Feuerleiter. Kurz vor zwei. Die Metallhand zittert.' },
  ], [{ dialogue: 'rom-aria-albtraum' }]),
];

// ---------------------------------------------------------------------------
// Herz-Ereignisse

export const ARIA_AKT1_EVENTS: HeartEventDef[] = [
  station({
    id: 'rom-aria-training', hearts: 6, map: 'hafenkante', time: ['abend', 'nacht'],
    // Bei Vex erst nach der Lücke (Reihenfolge world.md §4.7).
    when: all(HEUTE_FREI, any(NOT_V, seen('rom-vexaria-luecke'))),
    cutscene: 'rom-aria-training',
  }),
  station({
    id: 'rom-aria-werkstatt', hearts: 7, map: 'dantes-werkstatt', time: 'tag',
    when: all(HEUTE_FREI, { weekday: ['di', 'do'] }, seen('rom-aria-training'), any(NOT_V, seen('rom-vexaria-armdruecken'))),
    cutscene: 'rom-aria-werkstatt',
  }),
  station({
    id: 'rom-aria-dach', hearts: 8, map: 'neon-gasse', time: 'nacht',
    when: all(HEUTE_FREI, seen('rom-aria-werkstatt'), { clockBetween: [1320, 1500] }),
    cutscene: 'rom-aria-dach',
    effects: [...ZWEI_TAGE],
  }),
  station({
    id: 'rom-aria-albtraum', hearts: 8, map: 'neon-gasse', time: 'nacht',
    when: all(HEUTE_FREI, seen('rom-aria-dach'), WARTEN_VORBEI, { clockBetween: [1380, 1560] }),
    cutscene: 'rom-aria-albtraum',
  }),
];

export const part: ContentPart = {
  dialogues: byId([training, werkstatt, dach, dachNochmal, albtraum]),
  cutscenes: byId(cutscenes),
  phone: byId(phone),
};
