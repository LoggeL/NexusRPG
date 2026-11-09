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
    a('Gut. Setz dich. Nicht so weit weg. … Auch nicht so nah. Doch. Doch, so nah.', 'verlegen'),
    n('Du setzt dich. Eure Schultern berühren sich. Ihre ist warm durch das Netzshirt, deine kalt vom Gurtzeug. Keiner rückt weg.'),
  ], {
    choices: [
      ch('„Wie viel übrig ist, wolltest du wissen.“', 'uebrig'),
      ch('Ihr die Flasche abnehmen. Einen Schluck. Zurückgeben.', 'flasche'),
    ],
  }),
  node('flasche', [
    n('Du trinkst aus ihrer Flasche, nicht aus deiner. Sie sieht dir dabei zu. Ihr Blick bleibt an deinem Mund hängen, eine Sekunde zu lang, dann an der Flasche, dann wieder an deinem Mund.'),
    a('Das war meine.', 'verlegen'),
    v('Weiß ich.', 'signatur'),
  ], { next: 'uebrig' }),
  node('uebrig', [
    v('Alles. Alles ist übrig. Die Klappe. Die Zöpfe. Das Schnarchen. Der Kronkorken an meiner Tür.', 'neutral'),
    v('Und der Arm. Mit Sperre, ohne Sperre, mit Ripper-Kern. Der Arm hat mich auf dem Dach festgehalten, als ich gefallen wär. Der gehört dazu. Du gehörst dazu.', 'zaertlich'),
    n('Aria starrt auf die Gasse. Ihr Kiefer arbeitet. Dann legt sie den Zerberster in deinen Schoß, ganz vorsichtig, als würde sie dir etwas Zerbrechliches geben. Zwanzig Kilo Silber auf deinen Oberschenkeln. Sie summen.'),
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
  ], { next: 'kuss' }),
  node('knoechel', [
    n('Du hebst ihre Hand. Metall, kühl von der Nacht. Du küsst die Knöchel, einen nach dem anderen, so langsam, dass es albern wäre, wenn es nicht so ernst wäre.'),
    a('Vex. Ich spür das nicht. Du weißt, dass ich das nicht spür.', 'verlegen'),
    v('Ich schon.', 'zaertlich'),
    n('Sie gibt ein Geräusch von sich, halb Lachen, halb etwas ganz anderes.'),
  ], { next: 'kuss' }),
  node('kuss', [
    n('Dann ist ihre echte Hand in deinem Nacken. In deinen Locken. Sie zieht dich zu sich, nicht vorsichtig diesmal, und küsst dich. Sie schmeckt nach Bier und Wut und Salz von vorhin. Ihr küsst euch wie zwei Leute, die sich gerade angeschrien haben und es bereuen und es wieder tun würden.'),
    n('Irgendwann liegst du halb auf dem Rücken auf dem rauen Teerpappendach, und sie ist über dir, die Zöpfe fallen dir rechts und links ins Gesicht wie ein Vorhang, und unter dem Vorhang gibt es nur sie. Ihre Lippen an deinem Kinn. An deinem Hals, genau über dem Gurtriemen. Dein Atem geht nicht mehr gerade.'),
    a('Kiki hat dich hier geküsst. Auf die Wange. Ich küss dich überall, wo sie nicht war. Das ist Revierverhalten. Ich steh dazu.', 'signatur'),
    v('Überall ist viel.', 'verlegen'),
    a('Ich hab Zeit. Und du hast Schnallen. Wie viele waren\'s noch? Elf?', 'verlegen'),
    n('Ihre Finger finden die erste Schnalle am Gurtzeug. Sie öffnet sie nicht. Sie legt nur den Daumen drauf und wartet. Sie sieht dich an. Sie fragt, ohne zu fragen.'),
  ], {
    choices: [
      ch('„Nicht hier. Unten. Rolltor zu.“', 'bude', { effects: [BESCHWINGT] }),
      ch('Ihre Hand nehmen. Liegen bleiben. Die Sterne zählen, die es hier nicht gibt.', 'sterne', { effects: [herz(20)] }),
    ],
  }),
  node('bude', [
    n('Feuerleiter runter, sie zuerst, du hinterher, viel zu schnell, sie lacht, als du die letzte Sprosse verpasst. Das Rolltor rasselt hoch, rasselt runter. Dunkel. Ihr stolpert über die Kiste, über den Schläger, über euch selbst.'),
    n('Sie drückt dich gegen die Wellblechwand, die Metallhand flach neben deinem Kopf, die echte unter dem Gurtzeug flach auf deinem Top, da, wo dein Herz rast. Sie spürt es. Sie grinst. Du hörst das Grinsen.'),
    a('Da drin ist ja richtig was los, Postbotin.', 'signatur'),
    v('Halt die Klappe, Großmaul.', 'zaertlich'),
    a('Mach sie mir doch zu.', 'verlegen'),
    n('Die erste Schnalle klickt. Deine Hand findet die Kette der Glühbirne.'),
  ], { effects: [set('vexaria_nacht'), set('aria_nacht'), set('vexaria_nacht_woche'), { cutscene: 'rom-vexaria-dachnacht-abblende' }] }),
  node('sterne', [
    n('Ihr bleibt liegen. Ihr Kopf auf deiner Brust, ihr Zerberster quer über deinem Bauch, schwer wie eine Decke. Über euch gibt es keine Sterne, nur den roten Punkt am Funkmast, der an- und ausgeht.'),
    a('Das da ist meiner. Der rote. Der blinkt nur für mich.', 'zaertlich'),
    v('Der blinkt für Flugzeuge.', 'neutral'),
    a('Für mich und Flugzeuge.', 'zaertlich'),
    n('Irgendwann schläft sie ein, mitten im Satz. Du bleibst wach, bis der Mast heller ist als der Himmel.'),
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
    { image: 'black', lines: [n('Auf Schwarz: Regen, der nicht kommt. Ein Lachen, gedämpft vom Wellblech. Dann gar nichts mehr, lange.')], hold: 1800 },
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

