// side-neon-limo „Hunters Spezial“ (world.md §6.2 Nr. 13) · Auftraggeber Barkeeper · high-voltage · A.
// Zutaten: Leuchtalge (flutmauer nachts, Zone) · Kanalminze (Kanalvolk-Garten, Zone) oder Gullys Sirup (Ruf kanalvolk 20)
// · Oberstadt-Eis (Feinkost-Rampe). Mischen: gc-71 Mixi (Zone, Hotspot `mixi`) · gc-72 Oma Volts Familienrezept
// · Rezeptkarte aus der Fundkammer. Danach drei Testpersonen: Hunter, Raven (vor ihrer Entlassung: Vega), Aria.
import type { ContentPart } from '../../part';
import type { CheckDef, CutsceneDef, DialogueDef, ItemDef, QuestDef } from '../../../modules/contracts';
import {
  L, N, P, VEXARIA, VEX_OHNE_ROM, active, all, any, bye, done, flag, inactive, item, msg, node, noFlag, not, rel, set,
  tafel, time, welt,
} from './_lib';

const Q = 'side-neon-limo';
const B = 'barkeeper';

const ALGE = item('leuchtalge');
const MINZE = any(item('kanalminze'), item('kanal-sirup'));
const EIS = item('oberstadt-eis');
const GEMISCHT = flag('nl_gemischt');
const METHODE = any(flag('mixi_repariert'), flag('nl_rezept_oma'), item('rezeptkarte-neon-limo'));
const RAVEN_FREI = done('main-1-raven');
const GETESTET = all(flag('nl_test_hunter'), any(flag('nl_test_raven'), flag('nl_test_vega')), flag('nl_test_aria'));
const ABEND_NACHT = time('abend', 'nacht');

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: 'Hunters Spezial',
  summary: 'Zum Clubjubiläum braucht das High Voltage ein alkoholfreies Signaturgetränk. Mixi, der Mixroboter, ist kaputt. Der Barkeeper hat eine Liste. In Dreizeilern.',
  giver: B,
  act: 1,
  steps: [
    {
      id: 'alge', text: 'Leuchtalge besorgen: Brackbucht an der Flutmauer, nur nachts (oder nachts im Hafenbecken angeln).',
      done: any(ALGE, GEMISCHT), marker: { map: 'flutmauer', at: [1150, 815] },
    },
    {
      id: 'minze', text: 'Kanalminze aus dem Garten des Kanalvolks – oder Bürgermeister Gully überreden, seinen Sirup rauszurücken.',
      done: any(MINZE, GEMISCHT), marker: { map: 'kanal-sammler', at: [250, 885] },
    },
    {
      id: 'eis', text: 'Oberstadt-Eis von der Feinkost-Rampe im Lieferhof der Glasarkaden (Lieferanteneingang am Stufenplatz).',
      done: any(EIS, GEMISCHT), marker: { map: 'glasarkaden', at: [1252, 806] },
    },
    {
      id: 'methode', text: 'Einen Weg zum Mischen finden: Mixi reparieren, Oma Volts Familienrezept, oder die Rezeptkarte aus der Fundkammer am Eisenhof.',
      done: any(METHODE, GEMISCHT), marker: { map: 'high-voltage', at: [262, 232] },
    },
    {
      id: 'mischen', text: 'Abends am Tresen des High Voltage die Neon-Limo mischen.',
      done: GEMISCHT, when: all(any(ALGE, GEMISCHT), any(MINZE, GEMISCHT), any(EIS, GEMISCHT)), marker: { map: 'high-voltage', at: [292, 420] },
    },
    { id: 'test-hunter', text: 'Testperson Hunter: „etwas mit Wumms“.', done: flag('nl_test_hunter'), when: GEMISCHT, marker: { map: 'high-voltage', at: [292, 640] } },
    {
      id: 'test-raven', text: 'Testperson Raven: „etwas Ehrliches“. (Solange Raven sitzt, springt Vega ein.)',
      done: any(flag('nl_test_raven'), flag('nl_test_vega')), when: GEMISCHT, marker: { map: 'high-voltage', at: [250, 470] },
    },
    { id: 'test-aria', text: 'Testperson Aria: „etwas, das knallt“.', done: flag('nl_test_aria'), when: GEMISCHT, marker: { map: 'high-voltage', at: [1200, 452] } },
    { id: 'abgabe', text: 'Dem Barkeeper Bericht erstatten.', done: flag('nl_abgeschlossen'), when: GETESTET, marker: { map: 'high-voltage', at: [292, 420] } },
  ],
  reward: {
    xp: 150,
    credits: 200,
    relations: { [B]: 80 },
    rep: { 'crew-hunter': 10 },
    effects: [msg('Neu im Clubsortiment: Neon-Limo. Leuchtet im Dunkeln. Und im Magen.')],
  },
};

// ------------------------------------------------------------------------------------------ Auftakt
const auftrag: DialogueDef = {
  id: 'nl-barkeeper-auftrag',
  start: 'start',
  nodes: [
    node('start', [
      N('Der Barkeeper poliert ein Glas, das seit zehn Minuten sauber ist. Neben ihm gluckert Mixi, der Mixroboter, und spuckt pinken Schaum auf den Tresen.'),
      L(B, 'Zehn Jahre High Voltage / niemand denkt an die, die fahren / Hunter will ein Glas.'),
      P('Ein Jubiläumsdrink? Ohne Alkohol?'),
      L(B, 'Ohne Prozent, mit Seele / Algen leuchten, Minze kühlt / Eis aus kalter Höhe.'),
    ], {
      choices: [
        { text: '„Leuchtalge, Kanalminze, Oberstadt-Eis. Wo krieg ich das?“', next: 'wo' },
        { text: '„Und Mixi? Der sieht aus, als hätte er ’nen Schlaganfall.“', next: 'mixi' },
        bye('„Ich bin Kurier, kein Barista.“'),
      ],
    }),
    node('mixi', [
      L(B, 'Mixi schweigt seit Mai / Schläuche, Herz und Rührarm müde / wer ihn heilt, bereut.'),
      N('Mixi gibt ein Geräusch von sich, das klingt wie ein Kühlschrank, der „Hilfe“ sagt.'),
    ], { choices: [{ text: '„Bereut? Warum bereut?“', next: 'bereut' }, { text: '„Okay. Zutaten.“', next: 'wo' }] }),
    node('bereut', [L(B, 'Repariert spricht er / und dann spricht er und spricht er / bis zum Morgengrau’n.')], { next: 'wo' }),
    node('wo', [
      L(B, 'Brackbucht in der Nacht / Algen glühen grün im Schlick / pflück, bevor es tagt.'),
      L(B, 'Unten bei Gully / wächst die Minze unterm Rohr / oder frag nach Sirup.'),
      L(B, 'Oben hinter Glas / Lieferhof der feinen Leute / dort friert man Eis ein.'),
      L(B, 'Mischen: Mixi, oder / Oma Volt kennt ein Rezept / Fundkammer kennt’s auch.'),
    ], { effects: [{ startQuest: Q }], choices: [{ text: '„Ich geh einkaufen.“' }] }),
  ],
};

// ------------------------------------------------------------------------------------------ Zutatenquellen
const eisCheck: CheckDef = welt('nl-feinkost-bruchware', 'strasse', 4, ['ueberreden', 'geruecht'], '[Straße 4]');
const feinkost: DialogueDef = {
  id: 'nl-feinkost-eis',
  start: 'start',
  nodes: [
    node('start', [
      N('An der Feinkost-Rampe stapeln sich Kisten mit Aufschriften wie „Gletscherwasser, handgeschmolzen“. Ein Lieferant mit Kühlhandschuhen raucht und sieht aus, als hasse er jede einzelne Kiste.'),
      N('In einer Styroporbox dampft Eis. Echtes Eis. Klares, kaltes Oberstadt-Eis aus Wasser, das nie durch ein Rohr der Unterstadt geflossen ist.'),
    ], {
      choices: [
        { text: 'Eine Tüte Oberstadt-Eis kaufen (25 Cr).', requires: { credits: 25 }, effects: [{ credits: -25 }, { give: 'oberstadt-eis' }], next: 'gekauft' },
        { text: '„Die angebrochene Box da hinten nimmt doch eh keiner mehr. Bruchware, oder?“', check: eisCheck, effects: [{ give: 'oberstadt-eis' }], next: 'bruch' },
        bye('Weitergehen. Gefrorenes Wasser für Geld. Die spinnen, die Oberstädter.'),
      ],
    }),
    node('gekauft', [N('Der Lieferant nimmt das Geld, ohne dich anzusehen. „Nicht lutschen. Das Zeug kostet mehr als deine Schuhe.“')]),
    node('bruch', [
      N('Der Lieferant mustert dich, dann die Box, dann seinen Chef, der gerade nicht hinsieht. Er tritt die Box mit dem Fuß zu dir rüber.'),
      N('„Ich hab nichts gesehen. Ich seh nie was. Dafür werd ich bezahlt.“'),
    ]),
  ],
};

const oma: DialogueDef = {
  id: 'nl-oma-rezept',
  start: 'start',
  nodes: [
    node('start', [
      L('oma-volt', 'Neon-Limo? Für Hunters Laden? Kindchen, das ist nichts anderes als Großmutters Blitzbrause mit Algen drin.'),
      L('oma-volt', 'Das Rezept geb ich aber nicht jedem. Meine Großmutter hat damit drei Männer verführt und einen Stromausfall überlebt. In der Reihenfolge.'),
    ], {
      choices: [
        { text: '„Oma Volt. Für Hunter. Für den Club. Für die Unterstadt. Für Ihre Großmutter, Gott hab sie selig.“', check: 'gc-72', next: 'rezept' },
        { text: '„Was kostet eine Abschrift?“', next: 'preis' },
        bye('„Dann eben nicht.“'),
      ],
    }),
    node('preis', [L('oma-volt', 'Vierzig. Und du sagst keinem, dass ich Familienrezepte verkaufe. Sonst steh ich da wie eine aus der Oberstadt.')], {
      choices: [
        { text: 'Vierzig Credits auf den Tresen legen.', requires: { credits: 40 }, effects: [{ credits: -40 }], next: 'rezept' },
        bye('„Zu teuer.“'),
      ],
    }),
    node('rezept', [
      N('Oma Volt kritzelt mit Kugelschreiber auf die Rückseite eines Kassenbons. Sie schirmt den Zettel mit dem Arm ab wie eine Schülerin bei der Klassenarbeit.'),
      L('oma-volt', 'Erst die Minze zerquetschen. Nicht zärtlich. Wie einen Exmann. Dann das Eis. Die Alge zum Schluss, sonst wird sie beleidigt und leuchtet nicht.'),
      L('oma-volt', 'Und ein Löffel Brausepulver. Das Geheimnis ist immer ein Löffel Brausepulver.'),
    ], { effects: [{ setFlag: 'nl_rezept_oma' }, msg('Notiert: Großmutters Blitzbrause (Neon-Fassung).')] }),
  ],
};

const gully: DialogueDef = {
  id: 'nl-gully-sirup',
  start: 'start',
  nodes: [
    node('start', [
      L('buergermeister-gully', 'Minze? Für die OBERWELT? Kraft meines Amtes als Oberhaupt der Rohre: Die Kanalminze ist ein Kulturgut!'),
      L('buergermeister-gully', 'Aber. ABER. Sie haben dem Kanalvolk gedient. Das Kanalvolk dient zurück. Ich überreiche Ihnen hiermit den Staatssirup. Konzentrat. Ein Tropfen ersetzt ein ganzes Beet.'),
      N('Gully überreicht feierlich eine Schnapsflasche mit grünem Sirup. Auf dem Etikett steht in Kinderschrift „STAADSSIRUB“.'),
    ], { effects: [{ give: 'kanal-sirup' }, rel('buergermeister-gully', 20)], choices: [{ text: '„Danke, Herr Bürgermeister.“' }] }),
  ],
};

// ------------------------------------------------------------------------------------------ Mischen
const mischen: DialogueDef = {
  id: 'nl-mischen',
  start: 'start',
  nodes: [
    node('start', [L(B, 'Die Zutaten da? / Leg sie auf den Tresen hin / ich halte das Glas.')], {
      choices: [
        { text: 'Die Zutaten liegen schon auf dem Tresen. Weiter.', when: flag('nl_zutaten'), next: 'wie' },
        {
          text: 'Alge, Minze und Eis auf den Tresen legen.', when: all(noFlag('nl_zutaten'), item('kanalminze')),
          effects: [{ take: 'leuchtalge' }, { take: 'kanalminze' }, { take: 'oberstadt-eis' }, set('nl_zutaten')], next: 'wie',
        },
        {
          text: 'Alge, Gullys Staatssirup und Eis auf den Tresen legen.', when: all(noFlag('nl_zutaten'), not(item('kanalminze')), item('kanal-sirup')),
          effects: [{ take: 'leuchtalge' }, { take: 'kanal-sirup' }, { take: 'oberstadt-eis' }, set('nl_zutaten')], next: 'wie',
        },
        bye('„Moment noch.“'),
      ],
    }),
    node('wie', [L(B, 'Und nun? Wie mischen? / Hand, Maschine oder Schrift / alles ist ein Weg.')], {
      choices: [
        { text: '„Mixi. Zeig, was du kannst.“', when: flag('mixi_repariert'), next: 'mixi' },
        { text: 'Nach Oma Volts Familienrezept mischen.', when: flag('nl_rezept_oma'), next: 'oma' },
        { text: 'Nach der Rezeptkarte aus der Fundkammer mischen.', when: item('rezeptkarte-neon-limo'), next: 'karte' },
        { text: 'Einfach nach Gefühl. Wie schwer kann das sein?', next: 'gefuehl' },
      ],
    }),
    node('gefuehl', [
      N('Du kippst, rührst, schüttelst. Es zischt. Es leuchtet. Es riecht nach Krankenhaus und Mittwoch.'),
      L(B, 'Mutig, doch es schmeckt / wie ein Kuss vom Abflussrohr / such dir eine Hilfe.'),
      N('Er kippt es weg. Zum Glück hat er von allem einen Rest abgezweigt, bevor du losgelegt hast. Die Zutaten liegen noch auf dem Tresen. Ohne Rezept oder Mixi geht hier aber gar nichts.'),
    ]),
    node('mixi', [
      L('mixi', 'BESTELLUNG ERKANNT! Neon-Limo, Version eins Punkt null! Ich habe so lange darauf gewartet! Wusstest du, dass ich früher Opernarien gesummt habe? Wusstest du, dass Minze ein Kraut ist? Wusstest du –'),
      N('Mixi rührt, schüttelt, schäumt und redet. Das Glas, das er auf den Tresen stellt, leuchtet wie ein Neonschild in einer Regennacht. Er redet immer noch.'),
      L(B, 'Perfekt ist das Glas / leider schweigt die Maschine / nie mehr. Nie, nie mehr.'),
    ], { effects: [set('nl_gemischt'), set('nl_mix_mixi')], next: 'fertig' }),
    node('oma', [
      N('Minze zerquetschen wie einen Exmann. Eis. Die Alge zum Schluss. Ein Löffel Brausepulver. Es knistert, es zischt, dann geht in dem Glas ein grünes Licht an, sanft, wie eine Nachttischlampe.'),
      L(B, 'Großmutter lebt fort / in einem Glas voller Licht / Oma Volt grinst irgendwo.'),
    ], { effects: [set('nl_gemischt'), set('nl_mix_oma')], next: 'fertig' }),
    node('karte', [
      N('Die Karteikarte ist fettig, verblichen und trägt den Stempel „SICHERGESTELLT 2079“. Darauf, in Mixis Druckschrift: „NEON-LIMO (NOTFALL). 3 Teile Minze, 2 Teile Eis, 1 Alge, mit Liebe.“'),
      N('Du hältst dich dran, bis auf das mit der Liebe. Das Glas leuchtet trotzdem.'),
      L(B, 'Aus der Asservate / kommt der Drink zurück ins Licht / Freispruch für den Durst.'),
    ], { effects: [set('nl_gemischt'), set('nl_mix_karte')], next: 'fertig' }),
    node('fertig', [
      L(B, 'Drei Münder, drei Wünsche / Hunter, Raven, Aria / sie sind das Gericht.'),
    ], { effects: [msg('Die Neon-Limo steht. Jetzt drei Testpersonen im Club: Hunter, Raven, Aria.')] }),
  ],
};

// ------------------------------------------------------------------------------------------ Testpersonen
const testHunter: DialogueDef = {
  id: 'nl-test-hunter',
  start: 'start',
  nodes: [
    node('start', [
      L('hunter', 'Das ist also mein Jubiläumsdrink. Er leuchtet. Warum leuchtet er? Ich hab nicht gesagt, er soll leuchten.'),
      L('hunter', 'Ich will was mit Wumms. Ich will, dass ein Gast den Becher absetzt und denkt: „Heilige Scheiße, ich zahl gleich zwei.“'),
    ], {
      choices: [
        { text: 'Einen Schuss Chili-Sirup rein. „Wumms genug?“', next: 'chili' },
        { text: '„Trink. Und denk an die Rechnung, die du bald schreibst.“', next: 'rechnung' },
        { text: '„Ich hab dir einen Schluck Wodka reingetan.“ (Hast du nicht.)', next: 'wodka' },
      ],
    }),
    node('chili', [
      N('Hunter trinkt. Er hustet. Er nimmt die Sonnenbrille ab, wischt sich eine Träne weg und setzt sie wieder auf.'),
      L('hunter', '… Das brennt wie meine erste Steuerprüfung. Gut. Sehr gut. Den nehm ich.', 'freude'),
    ], { effects: [set('nl_test_hunter'), rel('hunter', 20)] }),
    node('rechnung', [
      N('Hunter trinkt, langsam, wie ein Mann, der ein Vertragswerk prüft. Dann rechnet er sichtbar im Kopf.'),
      L('hunter', 'Herstellung zwei Credits, Verkauf fünfzehn. … Ich spür den Wumms. Der Wumms ist die Marge.', 'signatur'),
    ], { effects: [set('nl_test_hunter'), rel('hunter', 20)] }),
    node('wodka', [
      N('Hunter trinkt, nickt anerkennend, trinkt noch mal.'),
      L('hunter', 'Ja. Man schmeckt’s. Ordentlich Umdrehungen.'),
      P('Ist kein Tropfen drin.'),
      L('hunter', '… Dann ist es Placebo-Wumms. Den kann man auch verkaufen. Sag’s keinem. Und hör auf zu grinsen, Neuling.'),
    ], { effects: [set('nl_test_hunter'), rel('hunter', 10)] }),
  ],
};

const testRaven: DialogueDef = {
  id: 'nl-test-raven',
  start: 'start',
  nodes: [
    node('start', [
      L('raven', 'Was ist das? Es glüht.'),
      P('Neon-Limo. Hunters Jubiläumsdrink. Ohne Alkohol.'),
      L('raven', 'Sieben Jahre lang gab’s im Eisenhof jeden Tag Tee, der nach Rohr geschmeckt hat. Ich will was Ehrliches. Kein Schirmchen. Kein Glitzer. Keine Lügen im Glas.'),
    ], {
      choices: [
        { text: 'Schirmchen raus, Strohhalm raus, nur das Glas hinstellen.', next: 'pur' },
        { text: '„Ehrlich? Der Barkeeper hat Mixi angefleht. Es ist ein Wunder, dass es nicht explodiert.“', next: 'wahrheit' },
      ],
    }),
    node('pur', [
      N('Raven trinkt. Lange. Sie stellt das Glas ab und sieht hinein, als stünde da was geschrieben.'),
      L('raven', 'Schmeckt nach Minze. Und nach draußen.', 'zaertlich'),
      L('raven', '… Sag dem Barkeeper, er kann bleiben.'),
    ], { effects: [set('nl_test_raven'), rel('raven', 30)] }),
    node('wahrheit', [
      L('raven', 'Billige Lüge.'),
      P('Ist die Wahrheit.'),
      N('Raven nimmt einen Schluck. Ihr Mundwinkel zuckt, verräterisch, fast ein Lächeln.'),
      L('raven', 'Dann ist es der ehrlichste Drink in diesem Laden. Passt.', 'signatur'),
    ], { effects: [set('nl_test_raven'), rel('raven', 20)] }),
  ],
};

const testVega: DialogueDef = {
  id: 'nl-test-vega',
  start: 'start',
  nodes: [
    node('start', [
      L('vega', 'Raven sitzt noch. Ich vertrete sie. Sie würde sagen: „Ehrlich soll’s sein.“ Ich sage: Das Glas ist zwei Millimeter schief befüllt.'),
      N('Vega trinkt. Sie hält das Glas gegen das Neonlicht, dreht es um vierzig Grad, nickt.'),
      L('vega', 'Ehrlich genug. Leuchtet auf drei Meter. Damit findet man nachts den Weg nach Hause. Ich nehm das.'),
    ], { effects: [set('nl_test_vega'), rel('vega', 20)], choices: [{ text: '„Ich sag’s Raven, wenn sie draußen ist.“' }] }),
  ],
};

const testAria: DialogueDef = {
  id: 'nl-test-aria',
  start: 'start',
  nodes: [
    node('start', [
      L('aria', 'Ist das das Zeug, von dem der Barkeeper seit Tagen Gedichte murmelt? Gib her.'),
      L('aria', 'Ich will was, das KNALLT. Was, wo man den ersten Schluck nimmt und denkt: Scheiße, ich lebe.'),
    ], {
      choices: [
        { text: 'Einen Löffel Brausepulver obendrauf kippen.', next: 'brause' },
        { text: '„Trink’s auf ex. Wenn du dich traust.“', next: 'ex' },
        { text: 'Das Glas vor ihr hochhalten. „Willst du’s knallen lassen? Dann musst du’s dir holen.“', when: VEX_OHNE_ROM, next: 'vex-rival' },
        { text: 'Selbst einen Schluck nehmen. Ganz langsam. Dann das Glas über den Tisch schieben. „Probier. Da, wo ich getrunken hab.“', tag: '[Vex × Aria]', when: VEXARIA, next: 'vex-rom' },
      ],
    }),
    node('brause', [
      N('Das Glas zischt, schäumt über, spritzt Aria grünes Leuchten auf die Nase und in die Zöpfe. Sie kreischt. Dann lacht sie so laut, dass zwei Tische sich umdrehen.'),
      L('aria', 'ICH LEUCHTE! Vega! Guck! Ich bin radioaktiv!', 'freude'),
      L('aria', 'Das. Das ist es. Das knallt. Ich will zehn davon. Und eins für meine Nase.'),
    ], { effects: [set('nl_test_aria'), rel('aria', 30)] }),
    node('ex', [
      N('Aria kippt das Glas in einem Zug. Sie knallt es auf den Tisch, dass die Flaschen klirren, rülpst wie ein Hafenarbeiter und schlägt sich mit dem Zerberster auf die Brust. Es dröhnt.'),
      L('aria', 'Gehirnfrost! GEHIRNFROST! Geil! Noch eins!', 'freude'),
    ], { effects: [set('nl_test_aria'), rel('aria', 20)] }),
    node('vex-rival', [
      L('aria', 'Holen? Von dir? Postbotin, ich hol mir alles, was ich will. Meistens mit dem Schläger.'),
      N('Sie greift zu. Du ziehst das Glas weg. Sie greift wieder, schneller. Ihre Finger schließen sich um deine Hand und das Glas zugleich, und für eine Sekunde zerrt keine von euch.'),
      L('aria', '… Lass los.'),
      P('Du zuerst.'),
      N('Sie lässt nicht los. Sie trinkt einfach, aus dem Glas in deiner Hand, ohne den Blick von dir zu nehmen. Grüner Schaum auf ihrer Oberlippe. Sie leckt ihn weg.'),
      L('aria', 'Knallt. Fast so wie du, wenn du verlierst.', 'signatur'),
      L('vega', 'Ich geh mal kurz … irgendwohin. Wo’s weniger Spannung gibt. Ins Umspannwerk vielleicht.'),
    ], { effects: [set('nl_test_aria'), rel('aria', 30)] }),
    node('vex-rom', [
      N('Aria sieht dich an. Dann das Glas. Dann wieder dich, langsam, von unten nach oben. Sie dreht das Glas, bis der Rand mit deinem Abdruck zu ihr zeigt, und setzt die Lippen genau dort an.'),
      N('Sie trinkt, ohne zu blinzeln. Ein Tropfen leuchtendes Grün läuft ihr übers Kinn. Sie wischt ihn nicht weg.'),
      L('aria', 'Schmeckt nach Minze. Und nach dir. Das ist unfair, Rennsemmel. Du kannst nicht einfach … so was machen. Mitten im Club.', 'verlegen'),
      P('Hab ich doch gerade.'),
      N('Unter dem Tisch hakt sich ihr Stiefel um deinen Knöchel und zieht. Nicht fest. Gerade fest genug, dass du weißt, dass es Absicht ist.'),
      L('aria', 'Weißt du, was knallt? Wenn du mich so anguckst und Vega sitzt daneben und ich kann nichts machen. Gar nichts. Außer mir vorstellen, was ich nachher mache.', 'zaertlich'),
      L('vega', 'Ich sitz übrigens noch hier. Bei zwölf Zentimeter Abstand. Ich hab nachgemessen.'),
      L('aria', 'Dann rück weg, Vega.'),
      N('Aria schiebt dir das leere Glas zurück. Auf dem Rand: zwei Abdrücke, ineinander. Sie beugt sich vor, so nah, dass ihr Atem nach Minze und Brause riecht.'),
      L('aria', 'Sag dem Barkeeper: Das Ding knallt. Und sag ihm nicht, warum.', 'zaertlich'),
    ], { effects: [set('nl_test_aria'), rel('aria', 40)] }),
  ],
};

// ------------------------------------------------------------------------------------------ Abgabe
const abgabe: DialogueDef = {
  id: 'nl-abgabe',
  start: 'start',
  nodes: [
    node('start', [
      L(B, 'Drei Urteile da / Wumms und Wahrheit, Knall und Licht / du hast es geschafft.'),
      N('Der Barkeeper stellt ein frisches Glas Neon-Limo auf den Tresen, schiebt es dir hin und – zum ersten Mal, seit du ihn kennst – lächelt er. Kaum sichtbar. Wie eine Klinge, die man nur im richtigen Licht sieht.'),
      L(B, 'Zum Jubiläum / steht dein Drink auf jeder Karte / auf’s Haus, für immer.'),
    ], { effects: [set('nl_abgeschlossen'), { completeQuest: Q }], next: 'feier' }),
    node('feier', [], { effects: [{ cutscene: 'nl-jubilaeum' }] }),
  ],
};

const jubilaeum: CutsceneDef = {
  id: 'nl-jubilaeum',
  title: 'Zehn Jahre High Voltage',
  beats: [
    tafel('Samstagnacht. Zehn Jahre High Voltage. Die Tanzfläche glüht grün.', undefined, 'in'),
    tafel('Hunter hält eine Rede, die aus genau einem Satz besteht.', [
      L('hunter', 'Zehn Jahre. Niemand ist gestorben, fast alle haben bezahlt. Prost.'),
    ]),
    tafel('Hundert Gläser Neon-Limo gehen gleichzeitig in die Luft. Mixi summt eine Opernarie. Niemand bittet ihn aufzuhören. Noch nicht.', [
      L(B, 'Licht in hundert Händen / keiner trinkt hier auf den Rausch / alle auf das Jetzt.'),
    ]),
  ],
};

// ------------------------------------------------------------------------------------------ Gegenstände
const Qi = (id: string, name: string, description: string): ItemDef =>
  ({ id, name, category: 'quest', icon: id, price: 0, sellable: false, description });
const items: Record<string, ItemDef> = {
  leuchtalge: Qi('leuchtalge', 'Leuchtalge', 'Eine Handvoll Algen aus der Brackbucht. Leuchtet grün, riecht nach Batterie und ein bisschen nach Abenteuer.'),
  kanalminze: Qi('kanalminze', 'Kanalminze', 'Minze aus dem Garten des Kanalvolks. Wächst unter einem tropfenden Rohr und ist trotzdem frischer als alles in der Oberstadt.'),
  'kanal-sirup': Qi('kanal-sirup', 'Gullys Staatssirup', 'Grünes Minzkonzentrat in einer Schnapsflasche. Etikett in Kinderschrift: „STAADSSIRUB“.'),
  'oberstadt-eis': Qi('oberstadt-eis', 'Oberstadt-Eis', 'Klares Eis aus Wasser, das nie durch ein Rohr der Unterstadt geflossen ist. Schmilzt beleidigt, wenn man es anfasst.'),
  'rezeptkarte-neon-limo': Qi('rezeptkarte-neon-limo', 'Rezeptkarte „Neon-Limo“', 'Eine fettige Karteikarte aus der Fundkammer, Stempel „SICHERGESTELLT 2079“. In Mixis Druckschrift: drei Teile Minze, zwei Teile Eis, eine Alge, mit Liebe.'),
};

const LIMO_AKTIV = all(active(Q), noFlag('nl_gemischt'));

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: {
    [auftrag.id]: auftrag, [feinkost.id]: feinkost, [oma.id]: oma, [gully.id]: gully, [mischen.id]: mischen,
    [testHunter.id]: testHunter, [testRaven.id]: testRaven, [testVega.id]: testVega, [testAria.id]: testAria, [abgabe.id]: abgabe,
  },
  cutscenes: { [jubilaeum.id]: jubilaeum },
  items,
  mapAdditions: {
    'high-voltage': {
      hotspots: [
        { id: 'nl-auftrag', at: 'tresen', label: 'Barkeeper: Jubiläumsdrink', kind: 'talk', dialogue: auftrag.id, when: all(inactive(Q), ABEND_NACHT) },
        {
          id: 'nl-mischen', at: 'tresen', label: 'Neon-Limo mischen', kind: 'use', dialogue: mischen.id,
          when: all(LIMO_AKTIV, ABEND_NACHT, any(all(ALGE, MINZE, EIS), flag('nl_zutaten'))),
        },
        {
          id: 'nl-test-hunter', at: 'tresen-ende', label: 'Hunter probieren lassen', kind: 'talk', dialogue: testHunter.id,
          when: all(active(Q), GEMISCHT, noFlag('nl_test_hunter'), ABEND_NACHT),
        },
        {
          id: 'nl-test-raven', at: 'bar-hocker', label: 'Raven probieren lassen', kind: 'talk', dialogue: testRaven.id,
          when: all(active(Q), GEMISCHT, RAVEN_FREI, noFlag('nl_test_raven'), noFlag('nl_test_vega'), time('abend')),
        },
        {
          id: 'nl-test-vega', at: 'vega-aria-tisch', label: 'Vega probieren lassen (für Raven)', kind: 'talk', dialogue: testVega.id,
          when: all(active(Q), GEMISCHT, not(RAVEN_FREI), noFlag('nl_test_vega'), time('abend')),
        },
        {
          id: 'nl-test-aria', at: 'vega-aria-tisch', label: 'Aria probieren lassen', kind: 'talk', dialogue: testAria.id,
          when: all(active(Q), GEMISCHT, noFlag('nl_test_aria'), time('abend')),
        },
        {
          id: 'nl-test-aria-nacht', at: 'tanzflaeche', label: 'Aria probieren lassen', kind: 'talk', dialogue: testAria.id,
          when: all(active(Q), GEMISCHT, noFlag('nl_test_aria'), time('nacht')),
        },
        { id: 'nl-abgabe', at: 'tresen', label: 'Barkeeper: Bericht', kind: 'talk', dialogue: abgabe.id, when: all(active(Q), GETESTET, ABEND_NACHT) },
      ],
    },
    glasarkaden: {
      hotspots: [
        {
          id: 'nl-feinkost-eis', at: 'feinkost-rampe', label: 'Oberstadt-Eis besorgen', kind: 'talk', dialogue: feinkost.id,
          when: all(LIMO_AKTIV, not(EIS)),
        },
      ],
    },
    'neon-gasse': {
      hotspots: [
        {
          id: 'nl-oma-rezept', at: 'kiosk', label: 'Oma Volt: Familienrezept', kind: 'talk', dialogue: oma.id,
          when: all(LIMO_AKTIV, noFlag('nl_rezept_oma'), time('morgen', 'tag', 'abend')),
        },
      ],
    },
    'kanal-sammler': {
      hotspots: [
        {
          id: 'nl-gully-sirup', at: 'gullys-rathaus', label: 'Gully: Staatssirup', kind: 'talk', dialogue: gully.id,
          when: all(LIMO_AKTIV, { rep: 'kanalvolk', min: 20 }, not(MINZE), time('morgen', 'tag')),
        },
      ],
    },
    eisenhof: {
      hotspots: [
        {
          id: 'nl-rezeptkarte', at: 'fundkammer', label: 'Zwischen den Kaffeebechern wühlen', kind: 'loot', once: true,
          when: all(LIMO_AKTIV, not(item('rezeptkarte-neon-limo'))),
          lines: [
            N('Dreihundert gleiche Kaffeebecher, eine Kiste Regenschirme, ein Gebiss. Und dazwischen, unter einem Becher mit „Bester Wachtmeister der Welt“: eine fettige Karteikarte. „NEON-LIMO (NOTFALL)“.'),
          ],
          effects: [{ give: 'rezeptkarte-neon-limo' }],
        },
      ],
    },
  },
};
