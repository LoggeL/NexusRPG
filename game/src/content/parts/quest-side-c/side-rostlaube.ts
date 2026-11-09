// side-rostlaube · „Die Rostlaube“ (world.md §6.2 Nr. 25). Käpt'n Nebelhorn besitzt die Garage an der Hafenkante,
// fährt aber nie. Der Kombi braucht rostlaube-zuendkerze, rostlaube-kuehlerpumpe, rostlaube-batterie → Einbau → Probefahrt.
// Teile: Zündkerze aus side-drohnenrennen (Rennpreis) oder Gustav (120 Cr) · Kühlerpumpe aus dem Pumpwerk (act2, nicht
// hier), gc-113 bei Fluss-Frieda oder Gustav gegen 3 schrott-ersatzteil · Batterie im Digitech-Keller (Hotspot der Zone)
// oder gc-114 aus Schrott löten · Einbau gc-115 oder [Dante ♥2]. Ausfahrt in die Ödnis: Ausgang `rostlaube` (act2).
import type { ContentPart } from '../../part';
import type { CutsceneDef, DialogueDef, QuestDef } from '../../../modules/contracts';
import { active, all, any, ch, dlg, flag, hearts, herz, inactive, item, l, n, noFlag, node, not, p, set } from './_q';

const Q = 'side-rostlaube';
const NB = 'kaeptn-nebelhorn';
const ZK = 'rostlaube-zuendkerze';
const KP = 'rostlaube-kuehlerpumpe';
const BT = 'rostlaube-batterie';
const ALLE_TEILE = all(item(ZK), item(KP), item(BT));
const EINGEBAUT = 'rostlaube_eingebaut';
const GEFAHREN = 'rostlaube_probefahrt';
const OFFEN = all(active(Q), noFlag(EINGEBAUT));

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: 'Die Rostlaube',
  summary: 'In Käpt’n Nebelhorns Garage steht ein Kombi, der seit zwanzig Jahren nicht gefahren ist. Der Käpt’n auch nicht. Zeit, dass sich das ändert.',
  giver: NB,
  act: 1,
  steps: [
    {
      id: 'zuendkerze', text: 'Besorg eine Zündkerze für die Rostlaube (Opa Gustav am Schrottmarkt, 120 Cr – oder als Preis beim Drohnenrennen).',
      done: any(item(ZK), flag(EINGEBAUT)), marker: { map: 'schrottmarkt', at: [500, 732] },
    },
    {
      id: 'kuehlerpumpe', text: 'Besorg eine Kühlerpumpe (Fluss-Frieda im Kanal handelt, Gustav tauscht gegen drei Ersatzteile).',
      done: any(item(KP), flag(EINGEBAUT)), marker: { map: 'kanal-sammler', at: [578, 704] },
    },
    {
      id: 'batterie', text: 'Besorg eine Batterie (Notstrom im Digitech-Keller – oder aus Schrott in der Garage zusammenlöten).',
      done: any(item(BT), flag(EINGEBAUT)), marker: { map: 'digitech-tresor', at: [214, 520] },
    },
    {
      id: 'einbau', text: 'Bau die Teile in der Garage an der Hafenkante ein – selbst oder mit Dantes Hilfe.',
      when: any(ALLE_TEILE, flag(EINGEBAUT)), done: flag(EINGEBAUT), marker: { map: 'hafenkante', at: [130, 268] },
    },
    {
      id: 'probefahrt', text: 'Probefahrt mit Käpt’n Nebelhorn.',
      when: flag(EINGEBAUT), done: flag(GEFAHREN), marker: { map: 'hafenkante', at: [130, 268] },
    },
  ],
  reward: {
    xp: 250,
    relations: { [NB]: 60 },
    effects: [set('rostlaube_faehrt'), set('prep_fahrzeug_rostlaube'), { message: 'Die Rostlaube fährt. Sobald der Weg in die Ödnis offen ist, steht sie in der Garage bereit.' }],
  },
};

// ---------------------------------------------------------------------------------------------- Auftakt

const start: DialogueDef = dlg('rostlaube-start', [
  node('start', [
    n('In der offenen Garage steht ein Kombi unter einer Plane. Darunter: Rost in sieben Farben, ein Wackeldackel ohne Kopf und auf der Heckscheibe ein Aufkleber: „Mein anderes Auto ist ein Boot“.'),
    n('Du hebst die Plane an. Hinter dir räuspert sich jemand wie ein Schiffsdiesel.'),
    l(NB, 'Ahoi! Finger weg von der Laube, du Landratte! Die schläft!', 'wut'),
    l(NB, 'Das ist die Rostlaube. Die hat meine Oma gefahren. Bis ans Meer und zurück, sagt das Logbuch. Ich hab sie geerbt. Mit Garage.', 'neutral'),
  ], {
    choices: [
      ch('„Und warum steht sie hier rum?“', 'warum'),
      ch('„Ein Auto, das bis ans Meer fährt? Das will ich sehen.“', 'warum'),
      ch('„Ich lass sie schlafen.“'),
    ],
  }),
  node('warum', [
    l(NB, 'Weil … sie kaputt ist. Ganz klar. Zündkerze hin, Kühlerpumpe hin, Batterie tot wie ein Hering in der Pfanne.', 'besorgt'),
    l(NB, 'Und weil ich nicht fahre. Ich bin Kapitän. Kapitäne fahren nicht. Kapitäne schippern. Im Hafenbecken. Wo’s sicher ist.', 'besorgt'),
    n('Er klopft auf das Dach. Ganz sanft, als würde er einem Pferd den Hals tätscheln.'),
    l(NB, 'Aber wenn sie wieder schnurren würde … nur so. Damit sie nicht denkt, ich hab sie vergessen. Klar Schiff?', 'neutral'),
  ], {
    choices: [
      ch('„Klar Schiff. Ich besorg die Teile.“', 'ja', { effects: [{ startQuest: Q }] }),
      ch('„Vielleicht später.“'),
    ],
  }),
  node('ja', [
    l(NB, 'TUUUT! Das ist das Horn in meinem Herzen.', 'freude'),
    l(NB, 'Zündkerze hat der alte Gustav am Schrottmarkt, der hat alles, was älter ist als er selbst. Für die Pumpe frag Fluss-Frieda unten im Kanal. Und Batterien … die alten Digitech-Keller sollen voll damit sein. Sagt man. Ich war nie da. Zu weit weg vom Wasser.', 'signatur'),
  ]),
]);

// ---------------------------------------------------------------------------------------------- Gustav

const gustav: DialogueDef = dlg('rostlaube-gustav', [
  node('start', [
    n('Opa Gustav sitzt zwischen Bergen aus Schrauben, Röhren und Radios, die alle gleichzeitig verschiedene Sender spielen. Knurri, sein Wachroboter, knurrt dich an. Dann wedelt er mit der Antenne.'),
    l('opa-gustav', 'Teile für die Rostlaube? Vom Nebelhorn? Ha! Früher war hier alles grün. Und die Rostlaube war blau.', 'freude'),
  ], {
    choices: [
      ch('Zündkerze kaufen (120 Cr).', 'kerze', {
        when: all(not(item(ZK)), noFlag(EINGEBAUT)), requires: { credits: 120 }, effects: [{ credits: -120 }, { give: ZK }],
      }),
      ch('Kühlerpumpe gegen drei Schrott-Ersatzteile tauschen.', 'pumpe', {
        when: all(not(item(KP)), noFlag(EINGEBAUT)), requires: item('schrott-ersatzteil', 3),
        effects: [{ take: 'schrott-ersatzteil', qty: 3 }, { give: KP }],
      }),
      ch('„Was weißt du über die Rostlaube?“', 'geschichte', { once: true, id: 'gustav-geschichte' }),
      ch('„Danke, Gustav.“'),
    ],
  }),
  node('kerze', [
    n('Gustav wühlt in einer Zigarrenkiste voller Zündkerzen, hält eine gegen das Licht, leckt dran und nickt.'),
    l('opa-gustav', 'Original. Hab ich ’79 aus einem Leichenwagen gezogen. Der braucht sie nicht mehr. Der Fahrer auch nicht.', 'signatur'),
  ], { next: 'start' }),
  node('pumpe', [
    l('opa-gustav', 'Drei Ersatzteile? Für eine Kühlerpumpe? Das ist Wucher. Für mich. Ich mach’s trotzdem. Ich mag den Nebelhorn. Der hat mir mal meine Brille aus dem Hafenbecken geangelt.', 'freude'),
    n('Er zieht eine Pumpe unter einem Haufen Toaster hervor. Sie quietscht, als hätte sie Heimweh.'),
  ], { next: 'start' }),
  node('geschichte', [
    l('opa-gustav', 'Nebelhorns Oma, die alte Wilma, ist mit dem Ding bis ans Meer gefahren. Zweimal. Einmal hin, einmal mit einem Seemann zurück. Das war sein Opa.', 'freude'),
    l('opa-gustav', 'Der Junge hat Angst vor allem, was größer ist als das Hafenbecken. Aber die Laube, die liebt er. Mach sie ganz. Vielleicht traut er sich dann.', 'neutral'),
  ], { next: 'start' }),
]);

// ---------------------------------------------------------------------------------------------- Fluss-Frieda

const frieda: DialogueDef = dlg('rostlaube-frieda', [
  node('start', [
    n('Fluss-Frieda sitzt auf ihrem Floß, eine Stirnlampe auf dem Kopf, eine Pfeife im Mundwinkel und ein Netz voller Treibgut zu ihren Füßen.'),
    l('fluss-frieda', 'Eine Kühlerpumpe? Hab ich. Hat letzte Woche den Kanal runtergeschwommen. Mit einem Fisch drin. Den Fisch hab ich gegessen.', 'neutral'),
    l('fluss-frieda', 'Die Pumpe kostet dich was. Hier unten hat alles einen Preis. Außer Pilze. Die wachsen von selber. Wenn Strom da ist.', 'signatur'),
  ], {
    choices: [
      ch('„Was hältst du von einem Tausch: Ich red mit Gully, dass dein Floß einen Ehrenplatz am Anleger kriegt.“', 'handel', { check: 'gc-113' }),
      ch('„Ich hab nicht genug. Ich frag Gustav.“'),
    ],
  }),
  node('handel', [
    l('fluss-frieda', 'Ehrenplatz. Am Anleger. Neben dem Rathaus. Hm.', 'ueberrascht'),
    l('fluss-frieda', 'Du bist ein Schlitzohr. Ich mag Schlitzohren. Die schwimmen oben.', 'freude'),
    n('Sie wirft dir die Pumpe zu. Sie ist nass. Sie riecht nach Fisch. Sie gehört dir.'),
  ], { effects: [{ give: KP }, herz('fluss-frieda', 20)] }),
]);

// ---------------------------------------------------------------------------------------------- Garage

const garage: DialogueDef = dlg('rostlaube-garage', [
  node('start', [
    n('Die Rostlaube steht unter ihrer Plane und tut so, als würde sie schlafen. Die Motorhaube klemmt. Im Kofferraum: eine Kiste mit Schrott, eine Taschenlampe und ein Seemannsknoten-Buch.'),
  ], {
    choices: [
      ch('Aus dem Schrott im Kofferraum eine Batterie zusammenlöten.', 'batterie', {
        check: 'gc-114', when: all(not(item(BT)), noFlag(EINGEBAUT)), effects: [{ give: BT }, { advanceTime: 45 }],
      }),
      ch('Alle drei Teile selbst einbauen.', 'selbst', {
        check: 'gc-115', when: all(ALLE_TEILE, noFlag(EINGEBAUT)),
      }),
      ch('Dante anrufen. „Ich hab hier ein Auto, das ist älter als deine Platten.“', 'dante', {
        tag: '[Dante ♥2]', requires: hearts('dante', 2), when: all(ALLE_TEILE, noFlag(EINGEBAUT)),
      }),
      ch('Nebelhorn holen. Probefahrt!', 'probe', { when: all(flag(EINGEBAUT), noFlag(GEFAHREN)) }),
      ch('Plane wieder drüber.'),
    ],
  }),
  node('batterie', [
    n('Zwölf alte Akkuzellen, ein Kabelbinder, ein Kaugummi für die Isolierung und viel Geduld. Am Ende brummt das Ding wie ein müder Bienenstock.'),
    n('Es ist hässlich. Es ist gefährlich. Es hat Spannung. Wie alle guten Dinge in der Unterstadt.'),
  ], { next: 'start' }),
  node('selbst', [
    n('Du kriechst unter die Haube. Zündkerze rein. Die Pumpe will erst nicht, dann mit einem satten Schmatzen doch. Batterie angeklemmt, Funken, Fluch, noch mal angeklemmt.'),
    n('Du drehst den Schlüssel. Die Rostlaube hustet, spuckt eine Wolke, die aussieht wie ein Gespenst, und dann … läuft sie. Rund. Sie schnurrt wie eine Katze, die Diesel trinkt.'),
  ], { effects: [{ take: ZK }, { take: KP }, { take: BT }, set(EINGEBAUT), { advanceTime: 60 }], next: 'start' }),
  node('dante', [
    l('dante', 'Ein AUTO? Mit ZÜNDKERZE? Und Vergaser? Heiliges Kanonenrohr, ich bin in zwanzig Minuten da! Fass nichts an! Atme nicht drauf!', 'freude'),
    n('Er ist in fünfzehn da. Mit Werkzeugkoffer, Schutzbrille und einer Tüte Kekse. Er streichelt die Motorhaube. Er redet mit der Kühlerpumpe. Er nennt die Batterie „Schätzchen“.'),
    l('dante', 'Analog! Alles analog! Kein Chip, kein Update, keine Cloud! Nur Benzin, Funke und Gottvertrauen! So hat man früher Autos gebaut!', 'freude'),
    n('Eine Stunde später schnurrt die Rostlaube. Dante wischt sich eine Träne weg und behauptet, es sei Öl.'),
  ], { effects: [{ take: ZK }, { take: KP }, { take: BT }, set(EINGEBAUT), { advanceTime: 60 }, herz('dante', 30)], next: 'start' }),
  node('probe', [
    n('Käpt’n Nebelhorn steht vor seiner Garage und starrt die laufende Rostlaube an, als wäre sie ein Wal, der an Land gekrochen ist.'),
    l(NB, 'Sie … läuft. Sie LÄUFT! Hörst du das? Das ist ihr Herz! Klar Schiff!', 'freude'),
  ], { effects: [{ cutscene: 'rostlaube-probefahrt' }] }),
]);

const probefahrt: CutsceneDef = {
  id: 'rostlaube-probefahrt',
  title: 'Die Probefahrt',
  beats: [
    {
      image: 'black', fade: 'in', sfx: 'engine',
      caption: 'Käpt’n Nebelhorn sitzt am Steuer. Er hält es wie ein Ruder. Er hat sich angeschnallt. Zweimal.',
      lines: [l(NB, 'Wo ist der Anker? Warum hat das Ding keinen Anker? Wie hält man das an?', 'besorgt')],
    },
    {
      image: 'black',
      caption: 'Einmal um das Hafenbecken. Im Schritttempo. Hafen-Hannes winkt mit dem Greifarm. Zwei Möwen überholen euch zu Fuß.',
      lines: [
        p('Du kannst ruhig Gas geben, Käpt’n.'),
        l(NB, 'Gas? GAS? Ich gebe kein Gas, ich gebe Wind!', 'wut'),
      ],
    },
    {
      image: 'black',
      caption: 'Am Ende der Kaimauer, wo die Straße zur Ödnis abzweigt, hält er an. Lange. Der Motor brummt. Weit hinten, hinter dem Dunst, ahnt man den Horizont.',
      lines: [
        l(NB, 'Da lang ist Oma gefahren. Bis ans Meer. Das richtige. Nicht das Hafenbecken.', 'trauer'),
        l(NB, 'Vielleicht … irgendwann. Mit dir auf dem Beifahrersitz. Und einer Schwimmweste. Und zwei Ankern.', 'neutral'),
      ],
    },
    {
      image: 'black', fade: 'out',
      caption: 'Er dreht um. Aber er lächelt. Und auf dem Rückweg drückt er einmal auf die Hupe. Sie klingt fast wie ein Nebelhorn.',
      lines: [l(NB, 'TUUUT! Klar Schiff, Landratte. Du hast mir die Laube wiedergegeben.', 'freude')],
    },
  ],
  effects: [set(GEFAHREN), { advanceTime: 40 }],
  gallery: false,
};

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: { [start.id]: start, [gustav.id]: gustav, [frieda.id]: frieda, [garage.id]: garage },
  cutscenes: { [probefahrt.id]: probefahrt },
  mapAdditions: {
    hafenkante: {
      hotspots: [
        {
          id: 'rostlaube-plane', at: 'garage-rostlaube', label: 'Das Auto unter der Plane', kind: 'talk', dialogue: start.id,
          when: all(inactive(Q), { time: ['morgen', 'tag', 'abend'] }),
        },
        {
          id: 'rostlaube-einbau', at: 'garage-rostlaube', label: 'An der Rostlaube schrauben', kind: 'use', dialogue: garage.id,
          when: all(active(Q), noFlag(GEFAHREN)),
        },
      ],
    },
    schrottmarkt: {
      hotspots: [{
        id: 'rostlaube-gustav', at: 'schrottkram-stand', label: 'Gustav nach Rostlauben-Teilen fragen', kind: 'talk', dialogue: gustav.id,
        when: all(OFFEN, { time: ['morgen', 'tag'] }),
      }],
    },
    'kanal-sammler': {
      hotspots: [{
        id: 'rostlaube-frieda', at: 'friedas-stand', label: 'Frieda nach einer Kühlerpumpe fragen', kind: 'talk', dialogue: frieda.id,
        when: all(OFFEN, not(item(KP)), { time: ['morgen', 'tag', 'abend'] }),
      }],
    },
  },
};
