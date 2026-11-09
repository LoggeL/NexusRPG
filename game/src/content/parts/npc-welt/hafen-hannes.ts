// Hafen-Hannes – Hafenarbeiter mit Greifarm an der Hafenkante (world.md §4.5). Seine Quest side-container-77
// (quest-side-c) startet über den Hotspot c77-hannes am Kai; side-zweite-hand bringt ihm den reparierten Greifarm (zh_hannes).
import type { ContentPart } from '../../part';
import type { DialogueChoice, DialogueNode } from '../../../modules/contracts';
import {
  type Menue, dialog, erz, flag, geschenke, gespraech, herz, ich, knoten, nichtGetroffen, ort, pruefung, rede, sammle,
  sprecher, weg, weltfigur, zurueck,
} from './_welt';

const ID = 'hafen-hannes';
const QUEST = 'side-container-77';
const H = sprecher(ID);
const Z = zurueck('Noch was, Hannes.', 'Mast- und Schotbruch.');

const choices: DialogueChoice[] = [
  { text: 'Was macht der Greifarm?', next: 'arm' },
  { text: 'Was ist an Container 77 so seltsam?', when: { quest: QUEST, state: 'active' }, next: 'c77' },
  { text: '„Kannst du mir einen Kaffee spendieren? Hafenblut?“', next: 'kaffee', effects: [{ give: 'synth-kaffee' }] },
  { text: 'Wer hat hier am Hafen das Sagen?', tag: '[Hannes ♥3]', requires: { hearts: ID, min: 3 }, once: true, id: 'h-sagen', next: 'sagen' },
  { text: '„Ich hab früher am Kai Schichten gemacht. Kennst du noch Kalle Kran?“', tag: '[Ex-Wache]', when: { origin: 'origin-ex-wache' }, once: true, id: 'h-wache', next: 'wache' },
  { text: 'Mast- und Schotbruch.' },
];

const nodes: DialogueNode[] = [
  knoten('arm', [
    erz('Hannes hebt den Greifarm. Er quietscht, greift daneben, greift noch mal daneben und erwischt schließlich eine vorbeifliegende Möwe. Er lässt sie los. Sie ist beleidigt.'),
    H('Läuft. Mehr oder weniger. Dante sagt, er schaut sich das an. Dante sagt das seit acht Monaten.'),
  ], { choices: Z }),
  knoten('c77', [H('Nachts laufen da Leute rum, die keine Hafenarbeiter sind. Und am nächsten Morgen fehlt einem von uns ein Implantat. Zufall? Ich hab schon zwei Kumpels ohne Ohr gesehen.')], { choices: Z }),
  knoten('kaffee', [H('Hier. Hafenblut. Schmeckt nach Diesel und Reue. Nach dem dritten Becher hörst du Möwen reden. Nach dem vierten antworten sie.')], { choices: Z }),
  knoten('sagen', [
    H('Offiziell die Hafenbehörde. Die sitzt in der Oberstadt und war nie hier.'),
    H('Inoffiziell die Rostzähne. Funzel, ihr Chef, hockt im Container-Labyrinth und kassiert Schutzgeld. Von uns. Für Schutz vor sich selbst.'),
    H('Und richtig das Sagen hat die Möwe da. Die klaut jedem das Frühstück. Keiner traut sich was.'),
  ], { choices: Z, effects: [herz(ID, 20)] }),
  knoten('wache', [H('Kalle Kran? Der hat dir mal den Helm vom Kopf gegriffen! Mit dem Kran! Du bist das? Ha! Komm her, du alte Uniform!'), erz('Er klopft dir mit dem Greifarm auf die Schulter. Es tut weh. Es ist liebevoll gemeint.')], { choices: Z, effects: [herz(ID, 40)] }),
];

const M: Menue = { zeile: H('Und? Ich hab Pause. Fünf Minuten. Seit einer halben Stunde.'), choices, nodes };

const T = {
  rivale: dialog('hannes-tag-rivale', [knoten('start', [H('Für dich gibt’s hier keine Arbeit.'), H('Und kein Hafenblut. Verpiss dich vom Kai, bevor ich dich mit dem Arm reinwerfe.')])]),
  erstes: gespraech('hannes-tag-erstes', [
    erz('Ein Kerl wie ein Poller, Mütze tief in der Stirn, Vollbart mit Salzkrusten. Statt eines rechten Arms trägt er einen hydraulischen Greifer, der leise zischt.'),
    H('Neu am Hafen? Hannes. Hafen-Hannes, weil’s noch einen Hannes gibt. Der ist aber am Kanal. Kanal-Hannes. Wir reden nicht drüber.'),
  ], M),
  morgen: gespraech('hannes-tag-morgen', [
    erz('Hannes steht am Kai und schaut den Kränen beim Aufwachen zu. In der Greiferhand ein dampfender Becher.'),
    H('Morgen. Die Kräne sind wie ich: Die ersten zehn Minuten nur Geräusche, kein Inhalt.'),
  ], M),
  standard: gespraech('hannes-tag-standard', [H('Na, Landratte? Willst du arbeiten oder nur gucken? Gucken ist gratis. Arbeiten zahlt auch nicht viel mehr.')], M),
};

/** ♥2: Eine Kiste hängt am Kran fest, Hannes’ Arm streikt. */
const he2 = dialog('he-hafen-hannes-2', [
  knoten('start', [
    erz('Über dem Kai baumelt eine Palette am Kranhaken, schief, kurz vorm Abrutschen. Darunter: Hafenarbeiter in Panik. Hannes’ Greifarm zuckt, aber greift nicht.'),
    H('Mein Arm hängt! Ausgerechnet jetzt! Wenn die Kiste fällt, ist der Kai Matsch. Und der Matsch sind wir.'),
  ], {
    choices: [
      { text: 'Den Greifarm mit einem Schlag aufs Hydraulikventil wecken.', tag: '[Technik 4]', check: pruefung('he-hannes-2-ventil', 'technik', 4, ['maschine']), next: 'arm' },
      { text: 'Die Kranleiter hoch und die Palette per Hand sichern.', tag: '[Reflexe 4]', check: pruefung('he-hannes-2-kran', 'reflexe', 4, ['klettern']), next: 'kran' },
      { text: 'Alle unter der Palette wegscheuchen.', next: 'weg' },
    ],
  }),
  knoten('arm', [erz('Ein Schlag, ein Zischen, der Greifer schnappt zu und hält die Palette fest wie eine Frikadelle. Applaus vom Kai.')], { next: 'ende', effects: [herz(ID, 45), { xp: 40 }] }),
  knoten('kran', [erz('Du hängst am Kranausleger, zehn Meter über dem Kai, und knotest die Palette fest. Unten singen die Hafenarbeiter ein Seemannslied. Für dich. Schief.')], { next: 'ende', effects: [herz(ID, 45), { xp: 40 }] }),
  knoten('weg', [erz('Du brüllst. Alle rennen. Die Palette fällt, platzt auf und verteilt zweihundert Gummienten über den Kai. Keiner ist verletzt. Alle sind verwirrt.')], { next: 'ende', effects: [herz(ID, 30), { xp: 25 }] }),
  knoten('ende', [H('Gut gemacht. Ab jetzt bist du am Kai bekannt. Das heißt: Keiner klaut dir das Frühstück. Außer die Möwe.')], { effects: [flag('hannes_kai_bekannt')] }),
]);

/** ♥4: Hannes erzählt von seinem Arm. */
const he4 = dialog('he-hafen-hannes-4', [
  knoten('start', [
    erz('Feierabend. Hannes sitzt auf einem Poller und lässt die Beine über dem Hafenbecken baumeln. Er hat zwei Becher Hafenblut dabei.'),
    H('Willst du wissen, wie ich den Arm verloren hab? Alle wollen das wissen. Keiner fragt.'),
    H('Containerkette. 2078. Mein Kumpel Piet hing drin. Ich hab ihn rausgezogen. Er hatte danach noch beide Arme. Ich nicht mehr. Fairer Tausch.'),
  ], {
    choices: [
      { text: '„Und Piet?“', next: 'piet' },
      { text: '„Wer hat dir den Greifarm bezahlt?“', tag: '[Straße 5]', check: pruefung('he-hannes-4-arm', 'strasse', 5, ['geruecht']), next: 'bezahlt' },
      { text: 'Mit ihm anstoßen.', next: 'anstossen' },
    ],
  }),
  knoten('piet', [H('Piet läuft heute mit den Rostzähnen. Treibt für Funzel Schutzgeld ein. Bei uns. Er hat vergessen, wer ihn rausgezogen hat. Oder er will’s vergessen.', 'trauer'), H('Wenn’s mal knallt mit den Rostzähnen, dann weiß ich, wo ich stehe. Aber es wird mir leidtun.')], { next: 'ende', effects: [herz(ID, 55), flag('hannes_piet_rostzahn')] }),
  knoten('bezahlt', [H('Die Hafenarbeiter. Jeder zehn Credits. Dreihundert Leute. Auf dem Arm steht kein Name von einer Firma. Da stehen dreihundert Namen. Innen, eingeritzt.'), erz('Er dreht den Arm. Tatsächlich: winzige Namen, dicht an dicht.')], { next: 'ende', effects: [herz(ID, 60)] }),
  knoten('anstossen', [erz('Ihr stoßt an. Das Hafenblut schmeckt nach Diesel. Nach dem zweiten Schluck hörst du eine Möwe „Prost“ sagen.')], { next: 'ende', effects: [herz(ID, 45)] }),
  knoten('ende', [
    ich('Danke, dass du mir das erzählst.'),
    H('Dafür hat man Freunde. Damit man nicht alles mit Möwen besprechen muss.'),
  ], { effects: [{ xp: 60 }] }),
]);

const hannes = weltfigur({
  id: ID,
  name: 'Hafen-Hannes',
  unknownName: 'Hafenarbeiter mit Greifarm',
  faction: 'unterstadt',
  bio: 'Hafenarbeiter an der Hafenkante mit hydraulischem Greifarm statt rechtem Arm. Salzbart, Mütze, Hafenblut im Becher. Kennt jeden Kran, jede Kiste und jede Möwe.',
  gifts: geschenke({
    loves: ['synth-kaffee', 'oelkaennchen', 'zerberster-oel'],
    likes: ['algen-chips', 'postkarte-meer', 'muschel-glas', 'rostige-schraube'],
    dislikes: ['parfuem-ozon', 'seidentuch-blau'],
    hates: ['magnet-stoerer', 'peilsender'],
  }),
  schedule: [ort('M,T,A', 'hafenkante', 'kai-mitte'), weg('N')],
  heartEvents: [
    { id: 'he-hafen-hannes-2', hearts: 2, map: 'hafenkante', time: ['morgen', 'tag'], dialogue: 'he-hafen-hannes-2' },
    { id: 'he-hafen-hannes-4', hearts: 4, map: 'hafenkante', time: 'abend', when: { seen: 'he-hafen-hannes-2' }, dialogue: 'he-hafen-hannes-4' },
  ],
  talk: [
    rede('hannes-tag-rivale', { rival: ID }),
    rede('hannes-tag-erstes', nichtGetroffen(ID)),
    rede('hannes-tag-morgen', { time: 'morgen' }),
    rede('hannes-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: hannes },
  dialogues: sammle(T.rivale, T.erstes, T.morgen, T.standard, he2, he4),
};
