// pers-aria-lieblingsshirt · „Mein Lieblingsshirt“ (world.md §6.2 Nr. 23). Aria ab ♥3, high-voltage + schrottmarkt.
// Hunter hat Arias Kabelbrand-Shirt (Tour 2081) als Putzlappen benutzt. Wege: gc-84 Armdrücken mit dem Roadie
// (oder das Armdrück-Minispiel), Tausch bei Vinyl-Vincent gegen eine Platte, [Hunter ♥4] Hunter lässt eins drucken,
// Fälschung vom Wühltisch (Aria ♥ +20 statt +100). Vex- und Romanzefassung bei der Übergabe.
import type { ContentPart } from '../../part';
import type { DialogueDef, QuestDef } from '../../../modules/contracts';
import {
  ARIA_ROM, NOT_VEX, VEX, VEXARIA_ROM, active, all, any, ch, dlg, flag, hearts, herz, inactive, item, l, n, noFlag, node,
  not, p, set,
} from './_q';

const Q = 'pers-aria-lieblingsshirt';
const A = 'aria';
const R = 'kabelbrand-roadie';
const ECHT = 'shirt_echt';
const FAKE = 'shirt_faelschung';
const UEBERGEBEN = 'shirt_uebergeben';
const HAT_SHIRT = any(flag(ECHT), flag(FAKE));
const SUCHE = all(active(Q), not(HAT_SHIRT));

const quest: QuestDef = {
  id: Q,
  kind: 'personal',
  title: 'Mein Lieblingsshirt',
  summary: 'Hunter hat mit Arias Kabelbrand-Shirt den Tresen gewischt. Mit Desinfektionszeug. Aria braucht Ersatz, bevor jemand stirbt.',
  giver: A,
  act: 1,
  steps: [
    {
      id: 'ersatz', text: 'Besorg Aria ein neues Kabelbrand-Shirt von der Tour 2081.',
      done: HAT_SHIRT,
    },
    {
      id: 'weg-roadie', optional: true, when: not(HAT_SHIRT),
      text: 'Weg: Der Roadie am Kabelbrand-Merchstand (Schrottmarkt, tags und abends) rückt sein letztes Original nur nach einem Armdrücken raus.',
      done: flag('shirt_weg_roadie'), marker: { map: 'schrottmarkt', at: [560, 772] },
    },
    {
      id: 'weg-vincent', optional: true, when: not(HAT_SHIRT),
      text: 'Weg: Vinyl-Vincent (Schrottmarkt, tags und abends) tauscht Shirts gegen Schallplatten.',
      done: flag('shirt_weg_vincent'), marker: { map: 'schrottmarkt', at: [1180, 976] },
    },
    {
      id: 'weg-hunter', optional: true, when: not(HAT_SHIRT),
      text: 'Weg: Rede Hunter ins Gewissen. Wenn er dich genug mag (♥4), macht er es vielleicht selbst wieder gut.',
      done: flag('shirt_weg_hunter'), marker: { map: 'high-voltage', at: [292, 640] },
    },
    {
      id: 'weg-wuehltisch', optional: true, when: not(HAT_SHIRT),
      text: 'Notlösung: Am Wühltisch auf dem Schrottmarkt gibt es Bandshirts für 40 Credits. Original ist was anderes.',
      done: flag(FAKE), marker: { map: 'schrottmarkt', at: [700, 600] },
    },
    {
      id: 'uebergeben', text: 'Bring Aria das Shirt (High Voltage, abends am Tisch oder nachts auf der Tanzfläche).',
      when: HAT_SHIRT, done: flag(UEBERGEBEN), marker: { map: 'high-voltage', at: [1200, 452] },
    },
  ],
  reward: { xp: 160, items: { 'kabelbrand-shirt': 1 } },
};

// ---------------------------------------------------------------------------------------------- Auftakt

const start: DialogueDef = dlg('shirt-start', [
  node('start', [
    n('Aria sitzt am Ecktisch, vor sich ein graues, nasses Etwas. Es riecht nach Zitronenreiniger. Ganz in der Mitte, verwaschen: ein roter Stern.'),
    l(A, 'Weißt du, was das ist? Das WAR mein Kabelbrand-Shirt. Tour 2081. Vom Drummer signiert. Mit Edding. Quer über die Titten.', 'wut'),
    l(A, 'Und weißt du, was der feine Herr Hunter damit gemacht hat? Den TRESEN gewischt. Mit Desinfektionszeug. Weil es „in der Putzkiste lag“.', 'wut'),
    l(A, 'Es lag in der Putzkiste, weil ich’s da VERSTECKT hab! Vor Vega! Die wollte es waschen!', 'wut'),
    n('Am Nebentisch hebt Vega die Hand, ohne aufzusehen. „Es stand von alleine.“'),
  ], {
    choices: [
      ch('„Dann besorgen wir dir ein neues. Original.“', 'ja'),
      ch('„Ist doch nur ein Shirt, Zöpfe.“', 'nur-shirt', { when: VEX }),
      ch('„Ist doch nur ein Shirt.“', 'nur-shirt', { when: NOT_VEX }),
      ch('„Soll ich Hunter für dich verprügeln?“', 'pruegeln'),
      ch('„Nicht mein Problem.“', 'nein'),
    ],
  }),
  node('nur-shirt', [
    n('Es wird sehr still am Tisch. Irgendwo hinter dir stellt der Barkeeper vorsichtshalber die guten Gläser weg.'),
    l(A, 'NUR. Ein. Shirt.', 'wut'),
    l(A, 'Das Shirt war in der Rennhalle 9, als die Halle noch stand. Das Shirt hat mehr Konzerte gesehen als du Sonnenaufgänge. Das Shirt war dabei, als …', 'trauer'),
    n('Sie bricht ab. Der Zerberster knirscht leise, als sich die Metallfinger um die Tischkante legen. Dann lässt sie los.'),
    l(A, 'Vergiss es. Du verstehst das nicht. Hilfst du mir jetzt, oder muss ich dir erst den Arsch versohlen?', 'signatur'),
  ], { choices: [ch('„Okay, okay. Ich helf dir.“', 'ja')] }),
  node('pruegeln', [
    l(A, 'Ha! Erstes Recht hab ich. Ich hab ihm schon gedroht, dass ich sein Seidenhemd als Klopapier benutze.', 'freude'),
    l(A, 'Er hat nur gesagt: „Das Hemd ist teurer als deine Miete, Kleine.“ Arschloch. Er hat recht. Das macht’s schlimmer.', 'wut'),
  ], { next: 'ja' }),
  node('nein', [
    l(A, 'Hab auch nicht gefragt, du Pfeife.', 'wut'),
    n('Sie wringt den Lappen aus. Er quietscht. Es klingt wie ein kleiner Tod.'),
  ]),
  node('ja', [
    l(A, '… Echt jetzt? Du würdest …', 'ueberrascht'),
    l(A, 'Okay. Okay! Am Schrottmarkt steht ein Merchstand, da verkauft so ein alter Roadie Kabelbrand-Kram. Angeblich hat er noch Originale von der Tour. Angeblich rückt er sie nur raus, wenn man ihn beim Armdrücken plattmacht.', 'freude'),
    l(A, 'Vinyl-Vincent hortet auch Zeug unter seiner Plattenkiste. Der tauscht alles gegen Platten, sogar seine Oma.', 'signatur'),
    l(A, 'Und wehe, du bringst mir ’ne Fälschung vom Wühltisch. Ich seh das. Ich seh das an der NAHT.', 'wut'),
  ], { effects: [{ startQuest: Q }] }),
]);

// ---------------------------------------------------------------------------------------------- Roadie

const roadie: DialogueDef = dlg('shirt-roadie', [
  node('start', [
    n('Ein Klapptisch voller Bandshirts, Aufnäher und abgekauter Drumsticks. Dahinter ein Kerl mit Unterarmen wie Ölfässer, Pferdeschwanz, Weste voller Backstage-Pässe von Konzerten, die es nicht mehr gibt.'),
    l(R, 'Kabelbrand, Tour Einundachtzig, Original? Hab ich. Eins noch. Größe M. Das letzte, verdammte Ding.', 'neutral'),
    l(R, 'Verkauf ich nicht. Kann man gewinnen. Armdrücken. Wer Schrammel umlegt, kriegt das Shirt. Hat seit dem Abschiedskonzert keiner geschafft.', 'signatur'),
  ], {
    choices: [
      ch('Ärmel hoch, Ellbogen auf den Tisch, und drücken.', 'kraft', { check: 'gc-84' }),
      ch('Armdrücken. Nicht mit Kraft, mit Timing.', undefined, {
        effects: [{
          minigame: 'akt-armdruecken', level: 3, key: 'shirt-armdruecken', label: 'Armdrücken gegen Schrammel',
          win: [set(ECHT), set('shirt_weg_roadie'), { message: 'Schrammels Arm knallt auf den Tisch. Der halbe Markt jubelt. Das Shirt gehört dir.' }],
          lose: [{ message: 'Schrammel drückt dich auf den Tisch wie einen Aufkleber. „Wiederkommen. Essen. Wiederkommen.“' }],
        }],
      }),
      ch('„Das ist für Aria. Die mit dem Zerberster.“', 'aria', { once: true, id: 'roadie-aria' }),
      ch('„Ich hab ’nen Ratenarm von Ripper. Willst du das wirklich?“', 'ratenarm', { when: VEX, once: true, id: 'roadie-vex' }),
      ch('„Später.“'),
    ],
  }),
  node('kraft', [
    n('Ihr verhakt die Finger. Schrammels Hand ist warm, trocken und so groß wie ein Bratpfannendeckel. Er grinst. Dann drückst du.'),
    n('Eine Sekunde passiert nichts. Zwei. Dann knackt etwas in seinem Ellbogen, er macht „Huch“ wie eine Oma auf Glatteis, und sein Handrücken klatscht auf den Tisch.'),
    l(R, 'Heilige Lichttraverse. Du hast Arme wie ’n Gabelstapler.', 'ueberrascht'),
    l(R, 'Na gut. Abgemacht ist abgemacht.', 'neutral'),
  ], { next: 'shirt' }),
  node('shirt', [
    n('Er zieht eine Plastiktüte unter dem Tisch hervor, eingeschweißt, als wäre es ein Organ. Darin: schwarzes Shirt, roter Stern, auf dem Rücken die Tourdaten 2081. Kein Brandloch. Kein Zitronengeruch.'),
    l(R, 'Pass drauf auf. Das ist ’n Stück Geschichte. Und wasch es links. LINKS, hörst du?', 'besorgt'),
  ], { effects: [set(ECHT), set('shirt_weg_roadie')] }),
  node('aria', [
    l(R, 'Aria?', 'ueberrascht'),
    n('Schrammel legt den Drumstick weg, mit dem er gerade gespielt hat. Er sieht plötzlich zehn Jahre älter aus.'),
    l(R, 'Die kleine Aria. Von der Lichttraverse. Die war die beste Roadie, die wir je hatten. Hat Boxen geschleppt wie drei Männer und dabei schlimmer geflucht als der Bassist.', 'trauer'),
    l(R, 'Ich war an dem Abend in der Rennhalle. Ich hab gesehen, wie die Traverse … Scheiße. Ich hab gedacht, die hat’s nicht geschafft.', 'trauer'),
    p('Sie lebt. Sie hat einen Arm aus Stahl und einen Schläger aus Aluminium. Und sie ist sauer.'),
    l(R, 'Ha. Klingt nach ihr.', 'freude'),
    l(R, 'Trotzdem: Armdrücken. Gerade für sie. Die hätte mich auch erst umgelegt, bevor sie was geschenkt nimmt. So war die.', 'signatur'),
  ], { effects: [set('shirt_roadie_kennt_aria')], next: 'start' }),
  node('ratenarm', [
    l(R, 'Ripper-Arm? Ha! Der fällt dir beim dritten Zug ab, und dann hab ich zwei Arme und du keinen.', 'freude'),
    p('Dann nehm ich den anderen.'),
    l(R, 'Gefällt mir. Gefällt mir sehr. Setz dich.', 'signatur'),
  ], { next: 'start' }),
]);

// ---------------------------------------------------------------------------------------------- Vinyl-Vincent

const vincent: DialogueDef = dlg('shirt-vincent', [
  node('start', [
    n('Vinyl-Vincent sitzt zwischen seinen Plattenkisten wie ein Drache auf seinem Gold. Er riecht nach Staub, Kaffee und Geheimnissen.'),
    l('vinyl-vincent', 'Kabelbrand-Shirt, Tour Einundachtzig? Hab ich. Unterm Tresen. Nur für Freunde.', 'signatur'),
    l('vinyl-vincent', 'Und Freunde bringen mir Platten. Geld hab ich. Platten hab ich nie genug.', 'neutral'),
  ], {
    choices: [
      ch('Eine Vinyl-Platte auf den Tisch legen.', 'tausch', { requires: item('vinyl-platte'), effects: [{ take: 'vinyl-platte' }] }),
      ch('„Und für Geld?“', 'geld'),
      ch('„Ich komm mit ’ner Platte wieder.“'),
    ],
  }),
  node('geld', [
    l('vinyl-vincent', 'Geld? Geld kann man nicht auflegen. Geld knistert nicht. Geld hat keine B-Seite.', 'wut'),
    l('vinyl-vincent', 'Kauf mir meinetwegen eine Platte ab und gib sie mir zurück. Dann sind wir quitt, und ich hab zweimal verdient. So mag ich Freundschaft.', 'freude'),
  ], { next: 'start' }),
  node('tausch', [
    n('Vincent hält die Platte gegen das Licht, dreht sie, pustet, lauscht an der Rille wie an einer Muschel.'),
    l('vinyl-vincent', 'Hm. Keine Kratzer. Gute Pressung. Du bist ein Freund.', 'freude'),
    n('Er greift unter den Tresen und holt ein zusammengefaltetes Shirt hervor. Schwarz, roter Stern, Tourdaten. Es riecht nach Keller und nach 2081.'),
    l('vinyl-vincent', 'Sag deiner Freundin, sie soll es nicht in die Putzkiste legen. Ich hab so Geschichten gehört.', 'signatur'),
  ], { effects: [set(ECHT), set('shirt_weg_vincent')] }),
]);

// ---------------------------------------------------------------------------------------------- Hunter

const hunter: DialogueDef = dlg('shirt-hunter', [
  node('start', [
    n('Hunter poliert Gläser. Mit einem neuen Lappen. Einem blütenweißen, sehr unschuldigen Lappen.'),
    l('hunter', 'Wenn du wegen dem Shirt kommst: Es lag in der Putzkiste. Wer seine Sachen in die Putzkiste legt, kriegt sie sauber zurück.', 'neutral'),
  ], {
    choices: [
      ch('„Hunter. Das war kein Lappen. Das war Arias Rüstung.“', 'gewissen', { tag: '[Hunter ♥4]', requires: hearts('hunter', 4) }),
      ch('„Du schuldest ihr was. Und du hasst offene Schulden.“', 'schulden', { when: not(hearts('hunter', 4)) }),
      ch('„Schon gut.“'),
    ],
  }),
  node('schulden', [
    l('hunter', 'Netter Versuch, Neuling. Schulden sind, wenn man was leiht. Ich hab nur geputzt.', 'signatur'),
    l('hunter', 'Wenn du willst, dass ich mich entschuldige, musst du mich erst besser kennen. Viel besser.', 'neutral'),
  ]),
  node('gewissen', [
    n('Hunter hört auf zu polieren. Er stellt das Glas ab. Dann nimmt er die Sonnenbrille ab, putzt sie mit dem Lappen und setzt sie wieder auf. Das macht er, wenn er nachdenkt. Oder wenn er sich schämt.'),
    l('hunter', 'Die Rennhalle. Das Shirt war … von dem Abend?', 'besorgt'),
    p('Von der Tour davor. Aber ja. Es ist alles, was sie aus der Zeit noch hat. Außer dem Phantomschmerz.'),
    l('hunter', 'Verdammt.', 'trauer'),
    l('hunter', 'Der Siebdrucker in der Neon-Gasse schuldet mir dreihundert Credits. Alle schulden mir was. Ich lass ihn ein Shirt drucken. Originalvorlage, Originalfarbe. Er hat die Schablonen noch, er hat damals für die Band gedruckt.', 'signatur'),
    l('hunter', 'Und ich geb’s ihr selbst. Wenn einer sich entschuldigt, dann der, der’s verbockt hat. Steht in keinem Buch, ist aber so.', 'neutral'),
    n('Eine Stunde später liegt ein Päckchen auf dem Tresen. Noch warm vom Trockner. Hunter schiebt es dir hin, ohne hinzusehen.'),
    l('hunter', 'Du trägst es rüber. Ich komm nach. Ich muss mir noch überlegen, was ich sag. Ich sag sowas nicht oft.', 'besorgt'),
  ], { effects: [{ advanceTime: 60 }, set(ECHT), set('shirt_weg_hunter'), herz('hunter', 20)] }),
]);

// ---------------------------------------------------------------------------------------------- Wühltisch

const wuehltisch: DialogueDef = dlg('shirt-wuehltisch', [
  node('start', [
    n('Ein Wühltisch: „BANDSHIRTS – ORIGINAL – 40 CR – KEIN UMTAUSCH“. Ganz oben liegt ein schwarzes Shirt mit rotem Stern. Darunter steht in großen Buchstaben: KABELBRNAD – WELTOUR 2018.'),
    n('Die Band gab es 2018 noch gar nicht. Der Stern hat sechs Zacken. Einer davon ist ein Daumen.'),
  ], {
    choices: [
      ch('Kaufen (40 Cr). Wird schon keiner merken.', 'kauf', { requires: { credits: 40 }, effects: [{ credits: -40 }] }),
      ch('Liegen lassen.'),
    ],
  }),
  node('kauf', [
    n('Der Verkäufer steckt das Geld ein, ohne von seinem Kreuzworträtsel aufzusehen. „Gute Wahl. Das ist das Original vom Original.“'),
  ], { effects: [set(FAKE)] }),
]);

// ---------------------------------------------------------------------------------------------- Übergabe

const uebergabe: DialogueDef = dlg('shirt-uebergabe', [
  node('start', [
    n('Du legst das Päckchen vor Aria auf den Tisch.'),
    l(A, 'Was ist das? Wenn das ’ne Bombe ist, will ich zuerst gucken.', 'ueberrascht'),
  ], {
    choices: [
      ch('Auspacken lassen.', 'fake', { when: all(flag(FAKE), noFlag(ECHT)) }),
      ch('Auspacken lassen.', 'echt', { when: flag(ECHT) }),
    ],
  }),
  // --- Fälschung
  node('fake', [
    n('Aria faltet das Shirt auseinander. Hält es hoch. Liest. Liest noch mal. Ihre Lippen bewegen sich lautlos: Ka. Bel. Brnad.'),
    l(A, 'Weltour Zwanzigachtzehn.', 'neutral'),
    l(A, 'Da war der Drummer neun.', 'neutral'),
    n('Sie zählt die Zacken am Stern. Bei sechs hält sie inne. Bei dem Daumen schnaubt sie.'),
    l(A, 'Gute Absicht. Schlechte Naht.', 'signatur'),
    l(A, '… Ich zieh’s trotzdem zum Schlafen an. Sag’s keinem. Und jetzt verpiss dich, bevor ich gerührt bin.', 'freude'),
  ], { effects: [herz(A, 20), set(UEBERGEBEN)], next: 'altes' }),
  // --- Original
  node('echt', [
    n('Aria faltet das Shirt auseinander, ganz langsam, als könnte es zerfallen. Schwarzer Stoff. Roter Stern. Auf dem Rücken die Tourdaten 2081, jede Stadt, jede Halle. Ganz unten: Rennhalle 9.'),
    n('Sie riecht daran. Sie riecht noch mal daran. Dann drückt sie das Gesicht hinein und sagt eine Weile gar nichts.'),
    l(A, 'Scheiße. Das ist echt. Das ist ECHT.', 'ueberrascht'),
  ], {
    choices: [
      ch('„Schrammel lässt grüßen. Der Roadie vom Merchstand.“', 'bolle', { when: flag('shirt_roadie_kennt_aria') }),
      ch('Abwarten. Hunter kommt gerade rüber.', 'hunter', { when: flag('shirt_weg_hunter') }),
      ch('Einfach grinsen.', 'gefuehl'),
    ],
  }),
  node('bolle', [
    l(A, 'Schrammel? SCHRAMMEL lebt? Der alte Bulle mit dem Pferdeschwanz? Der hat mir beigebracht, wie man ’ne Box trägt, ohne dass einem der Rücken bricht!', 'freude'),
    l(A, 'Der war an dem Abend da. Der hat …', 'trauer'),
    n('Sie schluckt, fährt sich mit dem Handrücken über die Nase und grinst schief.'),
    l(A, 'Ich geh ihn besuchen. Irgendwann. Wenn ich nicht heul dabei. Also nie.', 'signatur'),
  ], { effects: [herz(A, 20)], next: 'gefuehl' }),
  node('hunter', [
    n('Hunter steht am Tisch. Die Hände in den Taschen, die Sonnenbrille auf, das Seidenhemd perfekt. Er räuspert sich zweimal.'),
    l('hunter', 'Aria. Das mit dem Lappen. Das war … nicht mein bester Moment. Ich hab’s drucken lassen. Original. Ich hab dem Drucker die Schulden erlassen. Dreihundert Credits. Für ein Shirt.', 'besorgt'),
    l(A, 'Du hast … für mich … Schulden erlassen?', 'ueberrascht'),
    l(A, 'Das ist das Netteste, was du je gemacht hast. Ich hasse es. Danke.', 'freude'),
    l('hunter', 'Erzähl’s keinem. Sonst denkt jeder, er kann hier umsonst trinken.', 'signatur'),
    n('Er dreht sich um und geht. Ein paar Schritte weiter bleibt er stehen und poliert seine Sonnenbrille. Lange.'),
  ], { effects: [herz('hunter', 30)], next: 'gefuehl' }),
  node('gefuehl', [
    l(A, 'Du hast für mich ein Kabelbrand-Shirt besorgt. Ein Original. Weil Hunter ein Arschloch mit Putzfimmel ist.', 'freude'),
  ], {
    effects: [herz(A, 100), set(UEBERGEBEN)],
    choices: [
      ch('Weiter.', 'rom-vex', { when: VEXARIA_ROM }),
      ch('Weiter.', 'rom', { when: all(ARIA_ROM, NOT_VEX) }),
      ch('Weiter.', 'vex', { when: all(VEX, not(ARIA_ROM)) }),
      ch('Weiter.', 'freund', { when: all(NOT_VEX, not(ARIA_ROM)) }),
    ],
  }),
  // --- Vex × Aria, Romanzefassung
  node('rom-vex', [
    n('Aria steht auf. Sie zieht das Shirt einfach über ihr Langarmshirt, mitten im Club, die Zöpfe verheddern sich im Kragen, sie flucht, zerrt, und dann ist der Kopf durch. Der rote Stern sitzt über dem anderen roten Stern. Doppelt hält besser.'),
    l(A, 'Und? Sag was, Postbotin.', 'verlegen'),
  ], {
    choices: [
      ch('„Steht dir.“', 'rom-vex-a'),
      ch('„Zieh’s nie wieder aus.“', 'rom-vex-b', { tag: '[Gosse]', when: { origin: 'origin-gossenkind' } }),
      ch('Nichts sagen. Nur gucken. Lange.', 'rom-vex-c'),
    ],
  }),
  node('rom-vex-a', [
    l(A, '„Steht dir.“ Zwei Wörter. Du bist echt ’ne Dichterin.', 'freude'),
    l(A, 'Aber du hast dabei auf meine Brust geguckt, nicht auf den Stern. Ich hab’s gesehen. Ich seh sowas.', 'signatur'),
    p('Der Stern ist auf deiner Brust, Zöpfe. Wo soll ich sonst hingucken?'),
  ], { next: 'rom-vex-ende' }),
  node('rom-vex-b', [
    l(A, 'Nie?', 'ueberrascht'),
    n('Sie tritt einen Schritt näher. Dann noch einen. Du riechst Zitronenreiniger, Schweiß und das Öl vom Zerberster.'),
    l(A, 'Auch nicht, wenn du ganz lieb fragst, Rennsemmel?', 'verlegen'),
    p('Ich frag nie lieb.'),
    l(A, 'Ich weiß. Genau das ist ja das Problem.', 'zaertlich'),
  ], { effects: [herz(A, 20)], next: 'rom-vex-ende' }),
  node('rom-vex-c', [
    n('Du sagst nichts. Du guckst. Sie guckt zurück. Zwei Sekunden. Fünf. Die Musik wechselt, und keine von euch merkt es.'),
    l(A, 'Glotz nicht so. Oder doch. Mir egal. … Nee. Glotz weiter.', 'verlegen'),
  ], { next: 'rom-vex-ende' }),
  node('rom-vex-ende', [
    n('Sie greift nach deinem Gurtriemen, zieht dich daran ein Stück zu sich heran, bis eure Stirnen fast aneinanderstoßen. Ihr Atem geht schneller als nach einem Dachrennen. Deiner auch.'),
    l(A, 'Das ist das Zweitnetteste, was jemand je für mich gemacht hat.', 'zaertlich'),
    p('Und das Netteste?'),
    l(A, 'Weiß ich noch nicht. Ich hab da so ’ne Idee. Die braucht ’ne Nacht ohne Vega.', 'verlegen'),
    n('Vom Nebentisch, ohne aufzusehen: „Ich bin noch da. Zwei Meter vierzig entfernt.“'),
    n('Aria lässt den Riemen los, als hätte sie sich daran verbrannt. Sie läuft knallrot an, bis unter die Zöpfe, und boxt dir mit der echten Hand gegen die Schulter. Fester als nötig. Länger als nötig.'),
    l(A, 'Halt die Klappe, Vega! Und du: Hau ab. Bevor ich was mach, das ich nicht bereu.', 'verlegen'),
  ], { next: 'altes' }),
  // --- Romanze mit der Baukasten-Spielfigur
  node('rom', [
    n('Aria zieht das Shirt einfach über ihr Langarmshirt, mitten im Club. Die Zöpfe verheddern sich im Kragen, sie flucht, zerrt, und dann sitzt der rote Stern über dem anderen roten Stern.'),
    l(A, 'Und? Wie seh ich aus?', 'verlegen'),
  ], {
    choices: [
      ch('„Wie die gefährlichste Frau der Unterstadt.“', 'rom-a'),
      ch('„Das Shirt steht dir. Aber ich hab da eine Theorie, was dir noch besser steht.“', 'rom-b', {
        check: { id: 'shirt-flirt-frech', attribute: 'ausstrahlung', threshold: 5, tags: ['flirt'] },
      }),
    ],
  }),
  node('rom-a', [
    l(A, 'Gefährlichste? Ich bin auch die lauteste. Und die mit dem besten Shirt. Jetzt wieder.', 'freude'),
    l(A, 'Du bist das Einzige hier, das ich nicht kaputtmachen will. Merk dir das. Ich sag’s nicht zweimal.', 'zaertlich'),
  ], { next: 'altes' }),
  node('rom-b', [
    l(A, 'Ach ja? Und was?', 'ueberrascht'),
    p('Mein Arm um deine Schultern.'),
    n('Sie starrt dich an. Dann lacht sie, laut und hässlich und wunderbar, und dann nimmt sie deinen Arm und legt ihn sich selbst um die Schultern, als wäre es ein Schal.'),
    l(A, 'Theorie bestätigt, Klugscheißer. Und jetzt halt die Klappe, bevor du’s kaputt redest.', 'zaertlich'),
  ], { effects: [herz(A, 20)], next: 'altes' }),
  // --- Freundschaft
  node('vex', [
    n('Aria zieht das Shirt über ihr Langarmshirt, mitten im Club. Dann boxt sie dir gegen die Schulter. Mit der echten Hand. Es tut trotzdem weh.'),
    l(A, 'War nicht komplett scheiße, Postbotin. Siehst du? Ich kann das auch.', 'signatur'),
    p('Klingt aus deinem Mund wie ein Heiratsantrag.'),
    l(A, 'Träum weiter. … Danke.', 'freude'),
  ], { next: 'altes' }),
  node('freund', [
    n('Aria zieht das Shirt über ihr Langarmshirt, mitten im Club, und dreht sich einmal im Kreis. Der Zerberster zischt zufrieden.'),
    l(A, 'Ich würd dich umarmen, aber ich hab Angst, dass ich dir dabei was breche. Nimm das hier.', 'freude'),
    n('Sie boxt dir gegen die Schulter. Es ist das herzlichste blaue Fleck deines Lebens.'),
  ], { next: 'altes' }),
  // --- Das alte Shirt
  node('altes', [
    n('Aria hält dir den grauen, zitronigen Lappen hin. Den alten roten Stern. Das Brandloch am Saum.'),
    l(A, 'Hier. Das alte. Wasch es. Dreimal. Und wenn du’s trägst, bist du offiziell Kabelbrand-Fan. Lebenslang. Keine Rückgabe.', 'signatur'),
    l(A, 'Und wenn Hunter es noch einmal anfasst, brech ich ihm das Seidenhemd.', 'wut'),
  ]),
]);


export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: {
    [start.id]: start, [roadie.id]: roadie, [vincent.id]: vincent, [hunter.id]: hunter,
    [wuehltisch.id]: wuehltisch, [uebergabe.id]: uebergabe,
  },
  mapAdditions: {
    'high-voltage': {
      hotspots: [
        {
          id: 'shirt-aria-tisch', at: 'vega-aria-tisch', label: 'Aria wringt einen Lappen aus', kind: 'talk', dialogue: start.id,
          when: all(inactive(Q), hearts(A, 3), { time: 'abend' }),
        },
        {
          id: 'shirt-hunter', at: 'tresen-ende', label: 'Hunter auf das Shirt ansprechen', kind: 'talk', dialogue: hunter.id,
          when: all(SUCHE, { time: ['abend', 'nacht'] }),
        },
        {
          id: 'shirt-uebergabe-tisch', at: 'vega-aria-tisch', label: 'Aria das Shirt geben', kind: 'talk', dialogue: uebergabe.id,
          when: all(active(Q), HAT_SHIRT, noFlag(UEBERGEBEN), { time: 'abend' }),
        },
        {
          id: 'shirt-uebergabe-tanz', at: 'tanzflaeche', label: 'Aria das Shirt geben', kind: 'talk', dialogue: uebergabe.id,
          when: all(active(Q), HAT_SHIRT, noFlag(UEBERGEBEN), { time: 'nacht' }),
        },
      ],
    },
    schrottmarkt: {
      hotspots: [
        {
          id: 'shirt-merchstand', at: 'kabelbrand-merch', label: 'Kabelbrand-Merchstand (Roadie Schrammel)', kind: 'talk', dialogue: roadie.id,
          when: all(SUCHE, { time: ['tag', 'abend'] }),
        },
        {
          id: 'shirt-merchstand-look', at: 'kabelbrand-merch', label: 'Kabelbrand-Merchstand', kind: 'look',
          when: all(not(SUCHE), { time: ['tag', 'abend'] }),
          lines: [n('Bandshirts, Aufnäher, Drumsticks. Roadie Schrammel nickt dir zu wie einem alten Bekannten. Über dem Stand hängt ein Schild: „Armdrücken nur noch mittwochs. Wegen Ellbogen.“')],
        },
        {
          id: 'shirt-vincent-kiste', at: 'plattenstand-vincent', label: 'Vincent nach dem Shirt fragen', kind: 'talk', dialogue: vincent.id,
          when: all(SUCHE, { time: ['tag', 'abend'] }),
        },
        {
          id: 'shirt-wuehltisch', at: 'marktstaende', label: 'Wühltisch mit Bandshirts', kind: 'use', dialogue: wuehltisch.id,
          when: all(SUCHE, { time: ['tag', 'abend'] }),
        },
      ],
    },
  },
};
