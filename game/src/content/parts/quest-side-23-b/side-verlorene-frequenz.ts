// side-verlorene-frequenz · „Die verlorene Frequenz“ (world.md §6.3 Nr. 46). Opa Funk, funkturm-ruine, abends, Akt 2.
// Radio Rost erreicht die Stadt nicht mehr → Windrad reparieren → Relais an der Flutmauer → erste Sendung mit Lio.
// Windrad-Drohnen: Kampf enc-funkturm-windraeder oder [Reflexe 6] ausweichen; Windrad: gc-139 [Technik 6] oder mit
// Reparaturset (ohne Check); Relais oben im Leuchtturm (ohne Check, [Technik 4] für sauberes Signal); erste Sendung abends
// am Pult: [Lio ♥4] Lio spielt live, sonst Minispiel akt-radio-rost St. 2 (key frequenz-erste-sendung; auch verloren geht
// die Sendung raus, nur schiefer). Lios Tagesablauf stellt ihn ab frequenz_relais abends ans Pult (act23.json).
// Belohnung 220 XP, schallplatte-06 (falls schon vorhanden: vinyl-platte), Ruf aussiedler +10, Flag radio_rost_stadt.
import type { ContentPart } from '../../part';
import type { CutsceneDef, DialogueDef, NewsDef, PhoneMessageDef, QuestDef } from '../../../modules/contracts';
import {
  ACT2, VEX, active, all, any, bild, ch, chk, dlg, done, flag, hearts, herz, inactive, item, l, msg, n, noFlag, noItem, node, p,
  set, tafel, time, won,
} from './_lib';

const Q = 'side-verlorene-frequenz';
const FU = 'opa-funk';
const LI = 'lio-funkel';
const HE = 'henk-angler';
const ENC = 'enc-funkturm-windraeder';

const UMGANGEN = 'fq_drohnen_umgangen';
const WINDRAD = 'fq_windrad';
const RELAIS = 'frequenz_relais';
const SENDUNG = 'fq_erste_sendung';
const STADT = 'radio_rost_stadt';

const DROHNEN_WEG = any(won(ENC), flag(UMGANGEN));

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: 'Die verlorene Frequenz',
  summary: 'Radio Rost hört man nur noch bis zur Staubstraße. Opa Funk will zurück in die Stadt, wenigstens auf Sendung. Dafür braucht er Wind, ein Relais und eine Stimme, die nicht seine ist.',
  giver: FU,
  act: 2,
  steps: [
    {
      id: 'drohnen', text: 'Vertreib die Windrad-Drohnen aus ihrem Nest am Windrad der Funkturm-Ruine.',
      done: DROHNEN_WEG, marker: { map: 'funkturm-ruine', at: 'windrad-drohnen-nest' },
    },
    {
      id: 'windrad', when: DROHNEN_WEG, text: 'Bring das Windrad wieder zum Laufen.',
      done: flag(WINDRAD), marker: { map: 'funkturm-ruine', at: 'windrad' },
    },
    {
      id: 'relais', when: flag(WINDRAD), text: 'Bau Opa Funks Relais oben im Leuchtturm an der Flutmauer ein.',
      done: flag(RELAIS), marker: { map: 'flutmauer', at: 'leuchtturm-oben' },
    },
    {
      id: 'sendung', when: flag(RELAIS), text: 'Die erste Sendung für die ganze Stadt: abends am Pult der Funkturm-Ruine, mit Lio Funkel.',
      done: flag(SENDUNG), marker: { map: 'funkturm-ruine', at: 'radio-rost-pult' },
    },
  ],
  reward: { xp: 220, rep: { aussiedler: 10 }, effects: [set(STADT)] },
};

// ---------------------------------------------------------------------------------------------- Auftakt

const start: DialogueDef = dlg('frequenz-start', [
  node('start', [
    n('Unter der geflickten Plane sitzt Opa Funk im Ohrensessel, die Kopfhörer um den Hals, und dreht an einem Regler, der zu nichts mehr gehört. Die rote Lampe „Auf Sendung“ brennt. Das Rauschen aus dem Lautsprecher klingt einsam.'),
    l(FU, 'Hier ist Radio Rost, auf allen Frequenzen, die keiner will. Heute: dreißig Grad, Sand und die Frage, ob uns überhaupt noch einer hört.', 'neutral'),
    n('Er nimmt die Kopfhörer ab und schaut dich an.'),
    l(FU, 'Bis zur Staubstraße reicht es noch. Bei Rudi hören sie mich. Bei Marla. Bei Krähe, wenn sie gute Laune hat. Aber die Stadt? Die Stadt hört Chrome-Radio. Zwölf Stunden Werbung und ein Lied, und das Lied ist auch Werbung.', 'wut'),
  ], {
    choices: [
      ch('„Und was brauchst du, damit die Stadt dich hört?“', 'plan'),
      ch('„Vielleicht will die Stadt dich nicht hören.“', 'frech'),
    ],
  }),
  node('frech', [
    l(FU, 'Kann sein. Muss sie aber. Nicht wegen mir. Wegen dem, was ich sage. In der Stadt sagt keiner mehr was. Die sagen alle nur noch „Ja, Master“.', 'trauer'),
  ], { next: 'plan' }),
  node('plan', [
    l(FU, 'Drei Dinge. Strom, Reichweite, eine Stimme. Strom kommt vom Windrad. Das steht still, weil Windrad-Drohnen drin nisten. Die lieben Windräder. So sehr, dass sie sie kaputtmachen. Wie manche Leute ihre Ehe.', 'signatur'),
    l(FU, 'Reichweite: ein Relais an der Flutmauer. Ganz oben im Leuchtturm. Von da sieht man die halbe Stadt, und die halbe Stadt sieht ein Signal. Ich hab das Relais schon gebaut. Seit sechs Jahren. Es liegt hier. Es wartet. Wie ich.', 'neutral'),
    l(FU, 'Und die Stimme. Meine ist zu alt, um die Stadt zu wecken. Ich brauch einen Jungen. Mit Musik im Kopf. Wenn du einen kennst, sag ihm, Radio Rost lädt ein.', 'neutral'),
  ], {
    choices: [
      ch('„Ich krieg dich auf Sendung, Opa.“', 'ja', { effects: [{ startQuest: Q }] }),
      ch('„Ich denk drüber nach.“'),
    ],
  }),
  node('ja', [
    l(FU, 'Opa Funk sagt: Wer verspricht, muss liefern. Wer liefert, kriegt Platten. Los, Kind.', 'freude'),
  ]),
]);

// ---------------------------------------------------------------------------------------------- Drohnen

const nest: DialogueDef = dlg('frequenz-nest', [
  node('start', [
    n('Oben an der Nabe des Windrads hängt ein Nest aus Schrott und Draht. Drei rote Augen blinken darin. Die Windrad-Drohnen haben dich bemerkt, und ihre Rotoren fangen an zu summen, in einem Ton, der „verpiss dich“ heißt.'),
  ], {
    choices: [
      ch('Hochklettern und sie runterholen.', 'kampf'),
      ch('Unter den Rotoren durchtauchen und eine Plane übers Nest werfen.', 'plane', {
        check: chk('frequenz-drohnen-ausweichen', 'reflexe', 6, ['ausweichen', 'klettern']), effects: [set(UMGANGEN)],
      }),
      ch('Später.'),
    ],
  }),
  node('kampf', [
    l(FU, 'Hol sie runter, Kind! Radio Rost braucht Wind, keine Mitbewohner!', 'wut'),
  ], { effects: [{ battle: ENC }] }),
  node('plane', [
    n('Die erste Drohne stößt herab, du duckst dich, die zweite schneidet dir fast eine Locke ab, du rollst über den Gittermast. Oben reißt du die alte Zeltplane vom Gestänge und wirfst sie über das Nest. Drinnen surrt es empört. Dann gibt es auf.'),
    n('Du knotest die Plane zu einem Sack und lässt ihn am Seil hinunter. Opa Funk trägt das Bündel weg, weit in die Dünen, und redet dabei beruhigend auf die Drohnen ein. Über das Wetter.'),
  ]),
]);

// ---------------------------------------------------------------------------------------------- Windrad

const windrad: DialogueDef = dlg('frequenz-windrad', [
  node('start', [
    n('Ohne Drohnen sieht man den Schaden: Ein Lager ist zerfressen, die Kabel zur Bunkerbatterie sind durchgeknabbert, an einem Flügel fehlt ein Stück. Die Stoffbänder hängen schlaff. Das Windrad sieht aus, wie Opa Funk sich morgens fühlt.'),
  ], {
    choices: [
      ch('Das Lager tauschen, die Kabel neu verlöten, den Flügel mit Blech flicken.', 'gut', { check: 'gc-139', effects: [set(WINDRAD)] }),
      ch('Ein Reparaturset aufreißen und machen, was auf der Packung steht.', 'set', {
        requires: item('reparaturset'), effects: [{ take: 'reparaturset' }, set(WINDRAD)],
      }),
      ch('Später.'),
    ],
  }),
  node('gut', [
    n('Zwei Stunden mit Schraubenschlüssel und Lötkolben. Dann gibst du dem Flügel einen Stoß. Das Windrad knarzt, ruckelt und fängt sich. Es dreht. Langsam, dann gleichmäßig, und die Stoffbänder flattern wie Applaus.'),
    l(FU, 'Hörst du das? Das ist Strom. Das klingt wie Geld, nur ehrlicher.', 'freude'),
  ], { effects: [{ advanceTime: 120 }] }),
  node('set', [
    n('Laut Packung: „Universal-Reparaturset. Für alles außer Herzen.“ Klebeband, Schellen, eine Tube Wundermasse. Nach einer Stunde hält der Flügel. Das Lager quietscht, aber es dreht.'),
    l(FU, 'Quietscht. Gut. Dann weiß ich wenigstens, dass es noch lebt.', 'freude'),
  ], { effects: [{ advanceTime: 60 }] }),
]);

// ---------------------------------------------------------------------------------------------- Relais

const relaisAbholen: DialogueDef = dlg('frequenz-relais-abholen', [
  node('start', [
    n('Opa Funk drückt dir einen Kasten aus Aluminium in die Hand, mit einer Antenne wie ein Grashalm und einem Aufkleber: „Relais 1. Nicht fallen lassen. Nicht treten. Nicht lieben, sie liebt nicht zurück.“'),
    l(FU, 'Ganz oben im Leuchtturm an der Flutmauer. Henk lässt dich rein, der alte Angler. Er hört mich seit dreißig Jahren. Er wird es nicht zugeben.', 'neutral'),
  ], { effects: [set('fq_relais_dabei'), msg('Relais eingepackt. Ab zur Flutmauer.')] }),
]);

const relais: DialogueDef = dlg('frequenz-relais', [
  node('start', [
    n('Ganz oben im Leuchtturm pfeift der Wind durch die Scheiben. Unter dir die Brackbucht, dahinter das Meer im Dunst, und in der anderen Richtung die ganze Stadt: Neon, Rauch, Türme. Henk Angler steht in der Tür und tut so, als würde er nicht zuschauen.'),
    l(HE, 'Opa Funk, was? Der alte Spinner. Hab ihn gehört, wie er 2061 die Sturmflut angesagt hat. Zwei Tage vor allen anderen.', 'neutral'),
    l(HE, 'Mach hin. Wenn der Kasten die Lampe stört, werf ich ihn ins Meer.', 'signatur'),
  ], {
    choices: [
      ch('Die Antenne exakt auf die Funkturm-Ruine ausrichten. Peilung, Winkel, Feinjustierung.', 'sauber', {
        check: chk('frequenz-relais-peilen', 'technik', 4, ['reparieren', 'funk']), effects: [set(RELAIS), set('fq_relais_sauber')],
      }),
      ch('Den Kasten ans Geländer schrauben und die Antenne grob Richtung Ödnis drehen.', 'grob', { effects: [set(RELAIS)] }),
    ],
  }),
  node('sauber', [
    n('Du drehst die Antenne millimeterweise, bis das grüne Lämpchen am Kasten nicht mehr flackert, sondern brennt. Aus deinem Telefon kommt plötzlich ein Knistern. Dann eine Stimme, ganz weit weg und doch ganz nah: „… Test. Test. Hier ist Radio Rost. Ist da wer?“'),
    l(HE, 'Klar und deutlich. Verdammt. Der alte Spinner klingt wie früher.', 'ueberrascht'),
  ], { next: 'kanal' }),
  node('grob', [
    n('Du schraubst den Kasten fest und biegst die Antenne Richtung Wüste. Das Lämpchen flackert. Aus deinem Telefon kommt ein Knistern, dann eine Stimme durch das Rauschen: „… Test … ist da … Rost … wer?“'),
    l(HE, 'Klingt wie ein Hustenanfall in einer Blechdose. Reicht aber. Die Leute in der Stadt kennen nichts anderes.', 'neutral'),
  ], { next: 'kanal' }),
  node('kanal', [
    n('Henk brummt etwas, das wie „Na also“ klingt, und dreht sich weg, damit du nicht siehst, dass er grinst.'),
  ], {
    choices: [
      ch('„Kanal 9 lasst ihr in Ruhe. Da redet einer, der nicht gestört werden will.“', 'vex', { when: VEX }),
      ch('Wieder runter.', undefined),
    ],
  }),
  node('vex', [
    n('Du sagst es ins Telefon. Am anderen Ende ist eine Weile nur Rauschen. Dann Opa Funk, leiser als sonst.'),
    l(FU, 'Kanal 9? Den hab ich nie angefasst, Kind. Da läuft seit zwei Jahren dieselbe Schleife. Ich hör sie manchmal nachts. „Nicht anhalten.“ Ich hab gedacht, das ist ein Gebet.', 'trauer'),
    p('Ist es auch. So ungefähr.', 'neutral'),
  ]),
]);

// ---------------------------------------------------------------------------------------------- Lio

const telLio: PhoneMessageDef = {
  id: 'tel-lio-radio-rost',
  from: LI,
  text: 'Ein alter Mann hat auf meinem Akkordeon-Funk angerufen. Er heißt Funk. Er sagt, ich soll heute Abend in der Ödnis singen. Für die ganze Stadt. Mir ist schlecht. Mir ist gut. Ich komme. Kommst du auch?',
  auto: all(active(Q), flag(RELAIS)),
  replies: [{ text: 'Ich bin da.', effects: [herz(LI, 10)] }, { text: 'Klar, Lio.' }],
};

// ---------------------------------------------------------------------------------------------- Erste Sendung

const sendung: DialogueDef = dlg('frequenz-sendung', [
  node('start', [
    n('Abends glimmt am Funkturm jedes Lämpchen. Das Windrad dreht sich, die rote Lampe brennt heller als je zuvor. Neben Opa Funks Ohrensessel steht Lio Funkel mit seinem Synth-Akkordeon und sieht aus, als müsste er sich gleich übergeben. Vor Glück.'),
    l(LI, 'Die ganze Stadt? Echt? Auch die Neon-Gasse? Auch die Leute, die mir nie was in den Hut werfen?', 'ueberrascht'),
    l(FU, 'Besonders die. Die hören heute umsonst. Dann merken sie, was sie verpasst haben.', 'signatur'),
    l(FU, 'Kind, du machst die Ansage. Ich bin zu aufgeregt. Ich hab seit fünfzehn Jahren nicht mehr für die Stadt gesendet.', 'besorgt'),
  ], {
    choices: [
      ch('„Lio. Spiel einfach. Spiel das Lied über die Stadt. Das echte.“', 'lio', {
        tag: '[Lio ♥4]', requires: hearts(LI, 4), effects: [herz(LI, 40), set(SENDUNG)],
      }),
      ch('Ans Mikro. Ansage, Pegel, Hörertelefon. Los.', undefined, {
        effects: [{
          minigame: 'akt-radio-rost', level: 2, key: 'frequenz-erste-sendung', label: 'Radio Rost – Die erste Sendung für die Stadt',
          win: [set(SENDUNG), set('fq_sendung_glatt'), { dialogue: 'frequenz-sendung-danach' }],
          lose: [set(SENDUNG), { dialogue: 'frequenz-sendung-danach' }],
        }],
      }),
      ch('„Noch nicht. Ich brauch eine Minute.“'),
    ],
  }),
  node('lio', [
    n('Lio schließt die Augen. Das Akkordeon atmet ein. Und dann singt er, über die Neon-Gasse, über die Garküche, über Oma Volt und ihre Fernbedienung, über Kinder, die Eins! spielen, und über Leute, die „Ja, Master“ sagen und es nicht meinen.'),
    n('Er reimt nicht immer. Manchmal stolpert er. Opa Funk dreht den Pegel hoch, bis die Antenne summt.'),
  ], { effects: [{ cutscene: 'side-verlorene-frequenz-sendung' }] }),
]);

const sendungDanach: DialogueDef = dlg('frequenz-sendung-danach', [
  node('start', [
    n('Die rote Lampe brennt noch, als die letzte Platte ausläuft. Opa Funk lehnt sich im Sessel zurück, die Kopfhörer schief, und das Telefon neben dem Pult klingelt. Und klingelt. Und klingelt.'),
  ], {
    choices: [
      ch('Weiter.', undefined, { when: flag('fq_sendung_glatt'), effects: [{ cutscene: 'side-verlorene-frequenz-sendung' }] }),
      ch('Weiter.', 'schief', { when: noFlag('fq_sendung_glatt') }),
    ],
  }),
  node('schief', [
    l(FU, 'Rückkopplung, zweimal verhaspelt, und einer hat angerufen und nur „Hä?“ gesagt. Wunderbar. Das ist Radio. Das ist echtes Radio.', 'freude'),
  ], { effects: [{ cutscene: 'side-verlorene-frequenz-sendung' }] }),
]);

const sendungCut: CutsceneDef = {
  id: 'side-verlorene-frequenz-sendung',
  title: 'Radio Rost sendet',
  gallery: false,
  beats: [
    bild('bg-funkturm-ruine-sendet', { pan: 'out', fade: 'in', hold: 1600, caption: 'Zum ersten Mal seit fünfzehn Jahren reicht das Signal von Radio Rost bis in die Stadt.' }),
    tafel('In der Garküche am Schrottmarkt dreht Babette das Radio lauter. In der Rohrsiedlung singt Mutter Brühe mit, falsch. Im Zellentrakt am Eisenhof klopft jemand den Takt an die Gitter.', { hold: 1800 }),
    tafel('In der Neon-Gasse bleiben Leute stehen, die seit Wochen nur noch „Ja, Master“ sagen. Sie hören zu. Einer runzelt die Stirn, als würde er sich an etwas erinnern.', { hold: 1800 }),
    bild('bg-funkturm-ruine-sendet', { pan: 'in', hold: 1400, caption: 'Opa Funk sagt ins Mikro: „Hier ist Radio Rost. Wir sind wieder da. Und wir gehen nicht mehr weg.“' }),
  ],
  effects: [{ dialogue: 'frequenz-lohn' }],
};

const lohn: DialogueDef = dlg('frequenz-lohn', [
  node('start', [
    l(FU, 'Kind. Komm her.', 'zaertlich'),
    n('Opa Funk zieht eine Platte aus dem Regal hinter dem Sessel. Die Hülle ist handbeschriftet: „Stimmen aus dem Staub“. Darauf ein Foto von einem jungen Mann am Mischpult und einer Frau mit Kopfhörern, die lacht.'),
    l(FU, 'Die erste Sendung von Radio Rost. 2049. Meine Frau und ich. Ich hab zwei Pressungen. Eine behalte ich. Die andere kriegt jemand, der zuhört.', 'zaertlich'),
  ], {
    choices: [
      ch('Die Platte nehmen.', 'danke', { when: noItem('schallplatte-06'), effects: [{ give: 'schallplatte-06' }] }),
      ch('„Die hab ich schon. Von Vinyl-Vincent.“', 'doppelt', { when: item('schallplatte-06') }),
    ],
  }),
  node('danke', [
    l(FU, 'Pass drauf auf. Und wenn du sie hörst: Bei Minute zwölf lacht sie. Da hab ich ihr eine Kaffeetasse umgeworfen. Das ist das Beste an der ganzen Platte.', 'freude'),
  ], { next: 'ende' }),
  node('doppelt', [
    l(FU, 'Vincent! Dieser Plattengeier. Dann nimm die hier. Irgendwas Schönes. Ich such dir eins aus, das zu dir passt.', 'wut'),
  ], { effects: [{ give: 'vinyl-platte' }], next: 'ende' }),
  node('ende', [
    l(LI, 'Ich hab ein neues Lied angefangen. Über einen Funkturm in der Wüste und einen alten Mann, der nie aufgehört hat zu reden. Darf ich wiederkommen?', 'freude'),
    l(FU, 'Opa Funk sagt: Jeden Abend, Junge. Jeden verdammten Abend.', 'freude'),
  ], { effects: [herz(FU, 60)] }),
]);

const news: NewsDef = {
  id: 'news-side-frequenz',
  anchor: FU,
  headline: 'Radio Rost ist zurück',
  when: done(Q),
  priority: 3,
  lines: [
    l(FU, 'Hier ist Radio Rost. Auf allen Kanälen. Ja, auch auf deinem. Nein, du kannst nicht umschalten. Doch, kannst du. Aber warum solltest du?', 'freude'),
    l(FU, 'Nachrichten aus der Ödnis: Rudi hat neue Pfannkuchen. Krähe hat schlechte Laune. Die Glasdünen glänzen. Und wer in der Stadt „Ja, Master“ sagt: Hör mal eine Platte. Das hilft. Manchmal.', 'signatur'),
  ],
};

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: {
    [start.id]: start, [nest.id]: nest, [windrad.id]: windrad, [relaisAbholen.id]: relaisAbholen, [relais.id]: relais,
    [sendung.id]: sendung, [sendungDanach.id]: sendungDanach, [lohn.id]: lohn,
  },
  cutscenes: { [sendungCut.id]: sendungCut },
  phone: { [telLio.id]: telLio },
  news: { [news.id]: news },
  mapAdditions: {
    'funkturm-ruine': {
      hotspots: [
        {
          id: 'q-frequenz-start', at: 'radio-rost-pult', radius: 60, label: 'Opa Funk und das Rauschen', kind: 'talk', dialogue: start.id,
          when: all(ACT2, inactive(Q), time('abend')),
        },
        {
          id: 'q-frequenz-nest', at: 'windrad-drohnen-nest', radius: 56, label: 'Windrad-Drohnen im Nest', kind: 'use', dialogue: nest.id,
          when: all(active(Q), { not: DROHNEN_WEG }),
        },
        {
          id: 'q-frequenz-windrad', at: 'windrad', radius: 56, label: 'Windrad reparieren', kind: 'use', dialogue: windrad.id,
          when: all(active(Q), DROHNEN_WEG, noFlag(WINDRAD)),
        },
        {
          id: 'q-frequenz-relais-abholen', at: 'radio-rost-pult', radius: 60, label: 'Opa Funks Relais abholen', kind: 'talk', dialogue: relaisAbholen.id,
          when: all(active(Q), flag(WINDRAD), noFlag('fq_relais_dabei'), time('morgen', 'tag', 'abend')),
        },
        {
          id: 'q-frequenz-sendung', at: 'radio-rost-pult', radius: 60, label: 'Die erste Sendung für die Stadt', kind: 'talk', dialogue: sendung.id,
          when: all(active(Q), flag(RELAIS), noFlag(SENDUNG), time('abend')),
        },
      ],
    },
    flutmauer: {
      hotspots: [{
        id: 'q-frequenz-relais', at: 'leuchtturm-oben', radius: 56, label: 'Opa Funks Relais einbauen', kind: 'use', dialogue: relais.id,
        when: all(active(Q), flag('fq_relais_dabei'), noFlag(RELAIS)),
      }],
    },
  },
};
