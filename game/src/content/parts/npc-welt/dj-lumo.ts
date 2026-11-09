// DJ Lumo – DJ des High Voltage, Tanz-Minispiel, Auftraggeber side-lumos-platte (world.md §4.5, §3.9, §6.2 #28).
import type { ContentPart } from '../../part';
import type { DialogueChoice, DialogueNode } from '../../../modules/contracts';
import {
  type Menue, dialog, erz, flag, geschenke, gespraech, herz, ich, knoten, nichtGetroffen, ort, pruefung, rede, sammle,
  sprecher, weg, weltfigur, zurueck,
} from './_welt';
import { TALK_23, SCHEDULE_23 } from './dj-lumo-akt23';

const ID = 'dj-lumo';
const L = sprecher(ID);
const Z = zurueck('Noch ’ne Frage, Lumo.', 'Bleib laut.');
const QUEST = 'side-lumos-platte';

const choices: DialogueChoice[] = [
  {
    text: 'Du siehst aus, als wär dir die Platte gesprungen.', next: 'quest',
    when: { quest: QUEST, state: 'inactive' }, effects: [{ startQuest: QUEST }],
  },
  { text: 'Wie läuft’s mit dem Ersatz für deine Platte?', when: { quest: QUEST, state: 'active' }, next: 'quest-laeuft' },
  {
    text: 'Leg was auf. Ich tanz.', tag: '[Tanzfläche]', next: 'tanzen',
    when: { all: [{ weekday: ['fr', 'sa'] }, { time: 'nacht' }] },
  },
  { text: 'Was ist das beste Lied, das je in diesem Laden lief?', once: true, id: 'l-lied', next: 'lied' },
  { text: 'Hast du Kabelbrand mal live gesehen?', tag: '[Lumo ♥3]', requires: { hearts: ID, min: 3 }, once: true, id: 'l-kabelbrand', next: 'kabelbrand' },
  { text: '„Spielt Radio Rost noch die alten Platten mit Sprung?“', tag: '[Ödnis]', when: { origin: 'origin-oednis' }, once: true, id: 'l-oednis', next: 'oednis' },
  { text: 'Bleib laut.' },
];

const nodes: DialogueNode[] = [
  knoten('quest', [
    L('Gesprungen ist gut. Zerkratzt ist schlimmer. Meine einzige Pressung vom Set. „Neonregen, Remix 2079“. Einmal gepresst, nie wieder.', 'trauer'),
    L('Jemand hat sie als Untersetzer benutzt. Für eine Volt-Limo. Ich weiß, wer. Ich sag’s nicht. Es war Dexter.'),
    L('Ich brauch Ersatz. Vinyl-Vincent hat vielleicht was, zu Fantasiepreisen. Oder irgendwer, der Platten aus der Ödnis kennt.'),
  ], { choices: Z }),
  knoten('quest-laeuft', [
    L('Jeden Abend leg ich vom Stick auf. Vom STICK. Die Leute merken das. Die Leute tanzen digital. Das ist kein Tanzen, das ist Zappeln mit Abo.', 'besorgt'),
  ], { choices: Z }),
  knoten('tanzen', [
    L('Dann zeig, was du hast. Ich dreh den Bass auf, bis die Gläser hinter der Bar Angst kriegen.'),
  ], {
    effects: [{
      minigame: 'akt-tanz', level: 2, key: 'lumo-tanz', label: 'Tanzfläche im High Voltage',
      win: [herz(ID, 15), { xp: 20 }, { message: 'Lumo: „DAS war ein Drop!“' }],
      lose: [{ message: 'Lumo: „Mutig. Falscher Takt, aber mutig.“' }],
    }],
  }),
  knoten('lied', [
    L('Einfach. Die Nacht, als der Strom ausfiel und Hunter das Saxofon rausgeholt hat.'),
    L('Er spielt keinen einzigen richtigen Ton. Der Laden tobt. Der Barkeeper weint. Seitdem darf niemand das Saxofon anfassen. Es hängt hinter der Bar. Es hat Sicherheitsglas.'),
  ], { choices: Z, effects: [herz(ID, 15)] }),
  knoten('kabelbrand', [
    L('Das Abschiedskonzert in der Rennhalle 9. Ich war da. Ganz hinten. Dann fiel die Traverse.', 'trauer'),
    L('Seitdem spiel ich Kabelbrand nur, wenn Aria nicht da ist. Sie tut so, als wär’s ihr egal. Ihr Schläger zittert dann.'),
  ], { choices: Z, effects: [herz(ID, 25)] }),
  knoten('oednis', [
    L('Radio Rost! Opa Funk! Der Mann sendet seit vierzig Jahren mit einer Antenne aus Kleiderbügeln.', 'freude'),
    L('Wenn du je wieder rausfährst: Bring mir eine Aufnahme mit. Irgendwas. Ich sample sogar das Rauschen.'),
  ], { choices: Z, effects: [herz(ID, 30)] }),
];

const M: Menue = { zeile: L('Noch was? Ich hab vierzig Sekunden bis zum nächsten Drop.'), choices, nodes };

const T = {
  rivale: dialog('lumo-tag-rivale', [knoten('start', [L('Für dich spiel ich heute nur Fahrstuhlmusik.'), L('Mit Werbung dazwischen.')])]),
  erstes: gespraech('lumo-tag-erstes', [
    erz('Ein schmaler Typ mit Kopfhörern, die er nie ganz aufsetzt, und einer Jacke aus alten Platten-Covern. Er nickt im Takt von etwas, das nur er hört.'),
    L('Yo. Lumo. DJ Lumo. Das „DJ“ ist kein Titel, das ist eine Lebenseinstellung.'),
    L('Abends hier in der Gasse, ich teste Tracks an Passanten. Nachts drinnen am Pult. Wenn du tanzt, tanz. Wenn du nur rumstehst, steh wenigstens im Takt.'),
  ], M),
  gasse: gespraech('lumo-tag-gasse', [
    erz('Lumo hat einen Lautsprecher auf eine Mülltonne gestellt. Zwei Tauben nicken mit. Eine dritte geht.'),
    L('Testlauf. Wenn die Tauben bleiben, läuft’s heute Nacht. Die dritte hat keinen Geschmack.'),
  ], M),
  pult: gespraech('lumo-tag-pult', [
    erz('Hinter dem Pult blinkt alles. Lumo hat eine Hand am Regler und die andere an einer Neon-Limo.'),
    L('Hey! Komm näher, ich versteh dich nicht! Ich versteh dich trotzdem nicht! Lächeln und nicken!'),
  ], M),
  vertraut: gespraech('lumo-tag-vertraut', [
    L('Da ist ja mein Lieblingsgast. Für dich lass ich heute den Bass ein bisschen länger fallen.'),
  ], M),
  standard: gespraech('lumo-tag-standard', [L('Yo. Was geht. Was läuft. Was tanzt.')], M),
};

/** ♥2: Die Spielfigur wählt den nächsten Track für die Gasse. */
const he2 = dialog('he-dj-lumo-2', [
  knoten('start', [
    erz('Abend in der Neon-Gasse. Vor dem High Voltage hat sich ein Grüppchen gebildet, Lumos Mülltonnen-Lautsprecher knistert.'),
    L('Du! Notfall! Mein Kabel kracht, die Leute werden unruhig und ich muss pinkeln. Du übernimmst. Dreißig Sekunden. Such einen Track aus.'),
  ], {
    choices: [
      { text: 'Die Leute anheizen: „Wer hat Bock auf Bass?!“', tag: '[Ausstrahlung 4]', check: pruefung('he-lumo-2-anheizen', 'ausstrahlung', 4), next: 'anheizen' },
      { text: 'Erst mal das knackende Kabel flicken.', tag: '[Technik 4]', check: pruefung('he-lumo-2-kabel', 'technik', 4), next: 'kabel' },
      { text: 'Einfach den Oldie mit dem Saxofon auflegen.', next: 'oldie' },
    ],
  }),
  knoten('anheizen', [
    erz('Du brüllst. Die Gasse brüllt zurück. Als Lumo zurückkommt, tanzt sogar Bruno. Ein bisschen. Mit dem kleinen Zeh.'),
    L('Was hast du gemacht? Bruno TANZT. Das ist ein Wunder. Das ist ein Wunder mit Bass.'),
  ], { next: 'ende', effects: [herz(ID, 40), { xp: 40 }] }),
  knoten('kabel', [
    erz('Isolierband, ein Kaugummi und ein beherzter Schlag aufs Gehäuse. Der Lautsprecher hört auf zu krachen und fängt an zu singen.'),
    L('Du hast meinen Lautsprecher geheilt. Du bist jetzt sein Pate. Er heißt Brummi.'),
  ], { next: 'ende', effects: [herz(ID, 40), { xp: 40 }] }),
  knoten('oldie', [
    erz('Ein Saxofon jault. Die Jugend stöhnt. Aber Oma Volt am Kiosk wiegt sich, und zwei alte Schrotthändler tanzen Wange an Wange.'),
    L('Mutig. Generationenvertrag. Ich respektier das.'),
  ], { next: 'ende', effects: [herz(ID, 25), { xp: 25 }] }),
  knoten('ende', [L('Ab jetzt sagst du mir, was läuft. Einmal pro Nacht. Aber nicht zu oft, sonst bist du ich.')]),
]);

/** ♥4: Lumo lässt die Spielfigur ans Pult (Fr/Sa nachts im High Voltage). */
const he4 = dialog('he-dj-lumo-4', [
  knoten('start', [
    erz('Freitag- oder Samstagnacht, der Club ist voll bis unter die Neonbögen. Lumo winkt dich hinter das Pult.'),
    L('Heute legst du einen Block auf. Fünf Minuten. Wenn die Fläche leer wird, sind wir beide arbeitslos.'),
    L('Hand auf den Regler. Fühl den Raum. Der Raum ist ein Tier. Füttere das Tier.'),
  ], {
    choices: [
      {
        text: 'Auflegen und gleich mittanzen.',
        effects: [{
          minigame: 'akt-tanz', level: 2, key: 'he-dj-lumo-4', label: 'Lumos Pult: fünf Minuten Ruhm',
          win: [herz(ID, 50), { credits: 40 }, { xp: 60 }, flag('lumo_pult_gewonnen'), { dialogue: 'he-dj-lumo-4-ende' }],
          lose: [herz(ID, 30), { xp: 40 }, { dialogue: 'he-dj-lumo-4-ende' }],
        }],
      },
      { text: '„Ich hab ein Gefühl für den Raum.“', tag: '[Ausstrahlung 5]', check: pruefung('he-lumo-4-raum', 'ausstrahlung', 5), next: 'raum' },
    ],
  }),
  knoten('raum', [
    erz('Du schließt die Augen, drehst den Bass weg, lässt die Fläche eine Sekunde in der Stille hängen. Dann kommt der Drop. Der Club explodiert.'),
    L('Das war … das war MEIN Trick. Woher kennst du meinen Trick?!', 'ueberrascht'),
    ich('Gelernt ist gelernt.'),
    L('Jetzt nimmst du das. Neon-Limo, auf mich. Und du darfst ab jetzt nachts immer auf die Tanzfläche, auch wenn Bruno meckert.'),
  ], { effects: [herz(ID, 60), { credits: 40 }, { xp: 80 }, { give: 'neon-limo' }, flag('lumo_freund')] }),
]);

const he4Ende = dialog('he-dj-lumo-4-ende', [
  knoten('start', [
    L('Okay. Okay okay okay. Die Fläche ist nicht leer. Das ist schon mal mehr, als Hunter mit dem Saxofon geschafft hat.'),
    ich('Und jetzt?'),
    L('Jetzt nimmst du das. Neon-Limo, auf mich. Und du darfst ab jetzt nachts immer auf die Tanzfläche, auch wenn Bruno meckert.'),
  ], { effects: [{ give: 'neon-limo' }, flag('lumo_freund')] }),
]);

const lumo = weltfigur({
  id: ID,
  name: 'DJ Lumo',
  unknownName: 'Typ mit Kopfhörern',
  faction: 'crew-hunter',
  bio: 'DJ des High Voltage. Kopfhörer halb auf, Jacke aus Plattencovern. Testet Tracks abends in der Gasse an Tauben. „Das DJ ist eine Lebenseinstellung.“',
  gifts: geschenke({
    loves: ['vinyl-platte', 'neon-limo', 'lio-demo-chip'],
    likes: ['volt-limo', 'comic-heft', 'poster-hv', 'vhs-kassette'],
    dislikes: ['raubkopie-stick', 'zeitung-papier'],
    hates: ['magnet-stoerer'],
  }),
  schedule: [...SCHEDULE_23, ort('A', 'neon-gasse', 'lumos-ecke'), ort('N', 'high-voltage', 'dj-pult'), weg('M,T')],
  heartEvents: [
    { id: 'he-dj-lumo-2', hearts: 2, map: 'neon-gasse', time: 'abend', dialogue: 'he-dj-lumo-2' },
    { id: 'he-dj-lumo-4', hearts: 4, map: 'high-voltage', time: 'nacht', when: { all: [{ weekday: ['fr', 'sa'] }, { seen: 'he-dj-lumo-2' }] }, dialogue: 'he-dj-lumo-4' },
  ],
  talk: [
    rede('lumo-tag-rivale', { rival: ID }),
    rede('lumo-tag-erstes', nichtGetroffen(ID)),
    ...TALK_23,
    rede('lumo-tag-vertraut', undefined, 4),
    rede('lumo-tag-gasse', { time: 'abend' }),
    rede('lumo-tag-pult', { time: 'nacht' }),
    rede('lumo-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: lumo },
  dialogues: sammle(T.rivale, T.erstes, T.gasse, T.pult, T.vertraut, T.standard, he2, he4, he4Ende),
};
