// Bruno Brecher – Türsteher des High Voltage (world.md §4.5, Kurzeintrag, max. 5 Herzen).
// Die Samtkordel (gc-04, main-1-probezeit) baut die Karte neon-gasse; hier: Figur, Tagesgespräche, he-2/he-4.
import type { ContentPart } from '../../part';
import type { DialogueChoice, DialogueNode } from '../../../modules/contracts';
import {
  type Menue, VEX, dialog, erz, flag, geschenke, gespraech, herz, ich, knoten, nichtGetroffen, ort, pruefung, rede, sammle,
  sprecher, weg, weltfigur, zurueck,
} from './_welt';

const ID = 'bruno-brecher';
const B = sprecher(ID);
const Z = zurueck('Noch was, Bruno.', 'Schönen Abend noch.');

const choices: DialogueChoice[] = [
  { text: 'Wie wird man eigentlich Türsteher?', once: true, id: 'b-beruf', next: 'beruf' },
  { text: 'Wer war heute schon da?', tag: '[Bruno ♥2]', requires: { hearts: ID, min: 2 }, next: 'klatsch' },
  { text: '„Bewerte meinen Stil. Ehrlich.“', check: pruefung('bruno-stil', 'ausstrahlung', 4), once: true, id: 'b-stil', next: 'stil', effects: [herz(ID, 20)] },
  { text: '„Ich hab dir eine Dose Proteinpulver mitgebracht. Unverbeult.“', when: VEX, once: true, id: 'b-vex', next: 'vex' },
  { text: 'Schönen Abend noch.' },
];

const nodes: DialogueNode[] = [
  knoten('beruf', [
    B('Man steht. Lange. Man guckt. Lange. Man sagt „Nein“. Oft.'),
    B('Und man hat Arme. Arme helfen. Ich hab zwei, und beide haben eine eigene Postleitzahl.'),
    B('Der Rest ist Stil. Stil kann man nicht lernen. Stil hat man, oder man steht in der Schlange.'),
  ], { choices: Z }),
  knoten('klatsch', [
    B('Ripper. Ecktisch. Hat mir Trinkgeld gegeben. Hab’s auf Viren gescannt.'),
    B('Dexter. Hat versucht, sich als Kellner reinzuschleichen. Mit Tablett. Ohne Hose. Ich hab nicht gefragt.'),
    B('Und Kiki. Hat mich „Großer“ genannt. Ich bin groß. Sie hat recht. Ich mag sie trotzdem nicht.'),
  ], { choices: Z }),
  knoten('stil', [
    erz('Bruno tritt einen Schritt zurück. Er mustert dich von den Schuhen bis zum Scheitel, so langsam, dass irgendwo eine Kerze herunterbrennt.'),
    B('Schuhe: Unterstadt. Haltung: Mittelring. Blick: Ärger.'),
    B('… Sieben von zehn. Mehr hab ich seit drei Jahren nicht vergeben. Erzähl’s nicht rum.'),
  ], { choices: Z }),
  knoten('vex', [
    B('Unverbeult. Deckel zu. Schmeckt nicht nach Abgas.'),
    B('Schrapnell. Das ist das Netteste, was eine Kurierin je für mich getan hat. Du darfst morgen vor der Schlange rein. Übermorgen wieder in die Schlange.'),
  ], { choices: Z, effects: [herz(ID, 30)] }),
];

const M: Menue = { zeile: B('Noch was? Hinter dir steht die Schlange und hasst dich.'), choices, nodes };

const T = {
  rivale: dialog('bruno-tag-rivale', [knoten('start', [B('Nein.'), B('Auch nicht nachher. Auch nicht mit Stil.')])]),
  erstes: gespraech('bruno-tag-erstes', [
    erz('Ein Schrank von einem Mann in Samtjacke, Hals wie ein Hydrant, Fingerknöchel mit Tätowierungen: S-T-I-L.'),
    B('Bruno. Bruno Brecher. Ich brech Regeln nicht. Ich brech Leute, die sie brechen.'),
    B('Nur Gäste mit Stil. Merk dir das. Steht auch auf meinen Knöcheln, falls du’s vergisst.'),
  ], M),
  vip: gespraech('bruno-tag-vip', [
    B('Da ist ja mein Rattenfänger. Geh durch. Und wenn du eine Ratte siehst: Du hast sie nicht gesehen. Ich auch nicht.'),
  ], M),
  stammgast: gespraech('bruno-tag-stammgast', [
    B('Abend. Stil sitzt heute. Fast.'),
    B('Rein mit dir. Und sag Hunter, die Kordel hat einen Knoten. Ich mag keine Knoten.'),
  ], M),
  pfeffer: gespraech('bruno-tag-pfeffer', [
    B('Quantum-Wachmann am Tisch hinten. Pfeffer. Kommt jeden Freitag, trinkt Mocktail, weint bei Karaoke.'),
    B('Ich lass ihn rein, weil er Trinkgeld gibt. Und weil er Fotos von seiner Tochter zeigt. Die Kleine malt Hasen. Gute Hasen.'),
  ], M),
  standard: gespraech('bruno-tag-standard', [B('Nur Gäste mit Stil.'), B('Du darfst. Diesmal. Vielleicht.')], M),
};

/** ♥2: Ein Oberstadt-Schnösel will rein – Stilberatung an der Kordel. */
const he2 = dialog('he-bruno-brecher-2', [
  knoten('start', [
    erz('Vor der Samtkordel wankt ein Oberstadt-Typ mit goldener Sonnenbrille, nachts. Er wedelt mit einem Chrome-10-Gutschein.'),
    erz('„Weißt du, wer ich bin? Ich bin Kunde! Ich hab einen GUTSCHEIN!“'),
    B('Du. Komm her. Du bist Stilberatung. Ich bin beschäftigt mit Nicht-Zuschlagen.'),
  ], {
    choices: [
      { text: '„Gutscheine gelten nur in der Oberstadt. Hier gilt nur Bruno.“', tag: '[Ausstrahlung 4]', check: pruefung('he-bruno-2-reden', 'ausstrahlung', 4), next: 'reden' },
      { text: 'Den Typen höflich, aber bestimmt bis zum Kiosk tragen.', tag: '[Körper 5]', check: pruefung('he-bruno-2-tragen', 'koerper', 5), next: 'tragen' },
      { text: '„Volt-Eck da drüben hat noch auf. Die nehmen alles. Sogar Gutscheine. Glaub ich.“', next: 'kiosk' },
    ],
  }),
  knoten('reden', [
    erz('Der Typ blinzelt. Er schaut auf seinen Gutschein. Er schaut auf Bruno. Er geht. Rückwärts.'),
    B('Hm. Ohne Anfassen. Das ist hohe Kunst.'),
  ], { next: 'ende', effects: [herz(ID, 40), { xp: 40 }] }),
  knoten('tragen', [
    erz('Du hebst ihn unter den Achseln an. Er strampelt wie ein Hamster mit Rentenvertrag. Oma Volt nimmt ihn am Kiosk in Empfang und verkauft ihm eine Brause.'),
    B('Saubere Technik. Knie gebeugt. Rücken gerade. Du würdest einen guten Schrank abgeben.'),
  ], { next: 'ende', effects: [herz(ID, 40), { xp: 40 }] }),
  knoten('kiosk', [
    erz('Der Typ torkelt zum Volt-Eck. Oma Volt kreischt „Kindchen, NICHT DAS REGAL!“, und irgendwas fällt um.'),
    B('Problem verschoben. Auch eine Lösung. Oma Volt wird mich hassen.'),
  ], { next: 'ende', effects: [herz(ID, 25), { xp: 25 }] }),
  knoten('ende', [
    B('Ab heute kein Anstehen mehr für dich. Kordel geht auf, wenn du kommst. Nicht weitersagen. Sonst kommen alle.'),
  ], { effects: [flag('bruno_stammgast'), flag('hv_einlass')] }),
]);

/** ♥4: Eine Kanalratte am Eingang – Bruno hat panische Angst. */
const he4 = dialog('he-bruno-brecher-4', [
  knoten('start', [
    erz('Bruno steht nicht vor der Tür. Bruno steht AUF dem Mülleimer neben der Tür. Unter ihm sitzt eine Kanalratte, so groß wie eine Handtasche, und frisst ein Pommesbrot.'),
    B('Sag nichts. Sag einfach gar nichts.'),
    B('Mach, dass sie weggeht. Bitte. Ich sag nie bitte. Merk dir, dass ich bitte gesagt hab.'),
  ], {
    choices: [
      { text: 'Die Ratte mit einem Pappkarton einfangen.', tag: '[Reflexe 4]', check: pruefung('he-bruno-4-karton', 'reflexe', 4), next: 'karton' },
      { text: 'Röstzwiebeln streuen. Ratten hassen Röstzwiebeln.', when: { item: 'roestzwiebeln' }, effects: [{ take: 'roestzwiebeln' }], next: 'zwiebeln' },
      { text: '„Die Kanalratten sind Untertanen von Bürgermeister Gully. Ich ruf ihn an.“', tag: '[Straße 4]', check: pruefung('he-bruno-4-gully', 'strasse', 4), next: 'gully' },
      { text: 'Mit dem Besen scheuchen. Dauert.', next: 'besen' },
    ],
  }),
  knoten('karton', [
    erz('Ein Sprung, ein Karton, ein beleidigtes Quieken. Du trägst die Ratte zum Gully und lässt sie frei. Sie zeigt dir den Mittelfinger. Ratten können das.'),
  ], { next: 'ende', effects: [herz(ID, 50), { xp: 60 }] }),
  knoten('zwiebeln', [
    erz('Die Ratte schnüffelt, niest dreimal und verschwindet beleidigt im Gully. Die Gasse riecht nach Imbissbude.'),
  ], { next: 'ende', effects: [herz(ID, 50), { xp: 60 }] }),
  knoten('gully', [
    erz('Du rufst etwas in den Gully. Aus dem Rohr antwortet eine pompöse Stimme: „Kraft meines Amtes – Bertram, KOMM SOFORT NACH HAUSE!“ Die Ratte trollt sich.'),
  ], { next: 'ende', effects: [herz(ID, 50), { xp: 60 }, { rep: 'kanalvolk', delta: 2 }] }),
  knoten('besen', [
    erz('Zwanzig Minuten Besen, Fluchen und einmal versehentlich Bruno am Schienbein. Dann ist die Ratte weg. Wahrscheinlich aus Langeweile.'),
  ], { next: 'ende', effects: [herz(ID, 35), { xp: 40 }, { advanceTime: 20 }] }),
  knoten('ende', [
    erz('Bruno steigt vom Mülleimer. Er rückt seine Samtjacke zurecht, als wäre nichts gewesen.'),
    B('Das hier ist nie passiert.'),
    ich('Was ist nie passiert?'),
    B('Siehst du. Stil.'),
    B('Hier. Mein VIP-Stempel. Den kriegen nur drei Leute. Hunter, Mixi und jetzt du. Mixi weiß nicht, dass er ihn hat.'),
  ], { effects: [flag('bruno_vip'), { give: 'poster-hv' }] }),
]);

const bruno = weltfigur({
  id: ID,
  name: 'Bruno Brecher',
  unknownName: 'Türsteher',
  faction: 'crew-hunter',
  bio: 'Türsteher des High Voltage. Ein Schrank mit Samtjacke und Knöchel-Tattoo „STIL“. „Nur Gäste mit Stil.“ Hat heimlich panische Angst vor Ratten.',
  gifts: geschenke({
    loves: ['samtfliege', 'plueschmoehre', 'haarspray-deluxe'],
    likes: ['synth-kaffee', 'bao-dampfnudel', 'sonnenbrille-gold', 'boxbandagen'],
    dislikes: ['chips-tuete', 'chrome-10-gutschein'],
    hates: ['kanalschlamm'],
  }),
  schedule: [ort('A,N', 'neon-gasse', 'hv-eingang'), weg('M,T')],
  heartEvents: [
    { id: 'he-bruno-brecher-2', hearts: 2, map: 'neon-gasse', time: 'abend', dialogue: 'he-bruno-brecher-2' },
    { id: 'he-bruno-brecher-4', hearts: 4, map: 'neon-gasse', time: 'nacht', when: { seen: 'he-bruno-brecher-2' }, dialogue: 'he-bruno-brecher-4' },
  ],
  talk: [
    rede('bruno-tag-rivale', { rival: ID }),
    rede('bruno-tag-erstes', nichtGetroffen(ID)),
    rede('bruno-tag-vip', { flag: 'bruno_vip' }),
    rede('bruno-tag-pfeffer', { all: [{ weekday: ['fr', 'sa'] }, { time: 'nacht' }] }),
    rede('bruno-tag-stammgast', { flag: 'bruno_stammgast' }),
    rede('bruno-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: bruno },
  dialogues: sammle(T.rivale, T.erstes, T.vip, T.stammgast, T.pfeffer, T.standard, he2, he4),
};
