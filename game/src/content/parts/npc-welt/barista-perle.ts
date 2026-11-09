// Barista Perle – Café Sahnehaube in den Glasarkaden (world.md §4.5, Shop cafe-sahnehaube). Im Café sitzen als
// Hintergrundfiguren Blade (abends), Alesa Zero (morgens werktags) und Serenity Chrome (abends): Perle sieht alles.
import type { ContentPart } from '../../part';
import type { DialogueChoice, DialogueNode } from '../../../modules/contracts';
import {
  type Menue, dialog, erz, flag, geschenke, gespraech, herz, ich, knoten, nichtGetroffen, ort, pruefung, rede, sammle,
  sprecher, weg, weltfigur, zurueck,
} from './_welt';

const ID = 'barista-perle';
const P = sprecher(ID);
const Z = zurueck('Noch was, Perle.', 'Danke für den Kaffee.');

const choices: DialogueChoice[] = [
  { text: 'Was empfiehlst du?', next: 'laden', effects: [{ shop: 'cafe-sahnehaube' }] },
  { text: 'Wer sind deine Stammgäste?', next: 'gaeste' },
  { text: '„Der Typ im langen Mantel am Ecktisch – wer ist das?“', tag: '[Perle ♥2]', requires: { hearts: ID, min: 2 }, once: true, id: 'pe-blade', next: 'blade' },
  { text: 'Wie bist du Barista geworden?', once: true, id: 'pe-beruf', next: 'beruf' },
  { text: 'Danke für den Kaffee.' },
];

const nodes: DialogueNode[] = [
  knoten('laden', [P('Die Sahnehaube Spezial. Doppelter Espresso, dreifache Sahne, eine Kirsche obendrauf. Die Kirsche ist echt. Sie kostet mehr als der Kaffee.')]),
  knoten('gaeste', [
    P('Morgens eine Frau im Laborkittel, Fenstertisch, schwarzer Kaffee, liest drei Tablets gleichzeitig und lächelt nie. Sie gibt zwanzig Prozent Trinkgeld. Exakt. Jedes Mal.'),
    P('Abends eine blonde Dame in Grün am Ecktisch, bestellt Tee und trinkt ihn nicht. Sie schaut nur raus. Auf den Glaspark.'),
    P('Und ab und zu ein Mann im langen Mantel. Den bediene ich schnell. Sehr schnell.'),
  ], { choices: Z }),
  knoten('blade', [
    P('Blade. Er arbeitet für Quantum. Sicherheit. Was immer das heißt. Er trinkt Espresso ohne Zucker und hat noch nie geblinzelt. Ich hab gezählt.', 'besorgt'),
    P('Einmal hat ein Kunde ihm Kaffee übers Knie geschüttet. Der Kunde war am nächsten Tag nicht mehr Kunde. Der Kunde war auch sonst nirgends mehr.'),
  ], { choices: Z, effects: [herz(ID, 15), flag('perle_blade_hinweis')] }),
  knoten('beruf', [
    P('Ich wollte Sängerin werden. Dann hab ich gemerkt, dass Milchaufschäumer besser zahlen als Bühnen. Und mehr Applaus bekommen. Na ja. Zischen. Aber es klingt fast wie Applaus.'),
  ], { choices: Z }),
];

const M: Menue = { zeile: P('Noch was, Süßer? Die Maschine pfeift schon nach mir.'), choices, nodes };

const T = {
  rivale: dialog('perle-tag-rivale', [knoten('start', [P('Für dich: entkoffeiniert.'), P('Und lauwarm. Und ich spuck vorher rein. Vielleicht.')])]),
  erstes: gespraech('perle-tag-erstes', [
    erz('Ein Café wie eine Torte: rosa Wände, goldene Spiegel, Kuchen unter Glashauben. Hinter der Theke zischt eine Messingmaschine. Davor eine junge Frau mit Perlenohrringen und einem Haarknoten, aus dem Kaffeelöffel ragen.'),
    P('Willkommen in der Sahnehaube! Ich bin Perle. Ich mach den besten Kaffee der Glasarkaden. Und den einzigen ehrlichen.'),
  ], M),
  standard: gespraech('perle-tag-standard', [P('Da ist ja wer! Das Übliche? Ich weiß nicht, was dein Übliches ist. Aber ich tu so.')], M),
  vertraut: gespraech('perle-tag-vertraut', [P('Mein Lieblingsgast aus der Unterstadt! Ich hab dir ein Stück Kuchen zurückgelegt. Unter der Theke. Wo die Chefin nicht guckt.')], M),
};

/** ♥2: Die Kaffeemaschine streikt vor der Mittagsrush. */
const he2 = dialog('he-barista-perle-2', [
  knoten('start', [
    erz('Die Messingmaschine pfeift, ruckelt und spuckt braunen Dampf. Vor der Theke stehen zwölf Oberstädter mit Uhren am Handgelenk und Ungeduld im Gesicht.'),
    P('Die Maschine hat einen Anfall! Ausgerechnet jetzt! Wenn ich die nicht in fünf Minuten flott krieg, werd ich im Netz gekreuzigt!'),
  ], {
    choices: [
      { text: 'Das Druckventil entkalken, mit bloßen Händen.', tag: '[Technik 4]', check: pruefung('he-perle-2-ventil', 'technik', 4, ['maschine']), next: 'repariert' },
      { text: 'Die Warteschlange mit einer Show unterhalten.', tag: '[Ausstrahlung 4]', check: pruefung('he-perle-2-show', 'ausstrahlung', 4, ['buehne']), next: 'show' },
      { text: 'Allen kalten Kakao aus dem Kühlschrank anbieten.', next: 'kakao' },
    ],
  }),
  knoten('repariert', [erz('Ein Zischen, ein Klonk, und die Maschine schnurrt wie eine Katze. Perle küsst die Maschine. Dann dich. Auf die Wange. Professionell.')], { next: 'ende', effects: [herz(ID, 45), { xp: 40 }] }),
  knoten('show', [erz('Du balancierst drei Kuchenteller auf einem Arm und erzählst die Geschichte von Hunters Seitenscheitel. Die Schlange lacht. Niemand merkt, dass die Maschine zehn Minuten braucht.')], { next: 'ende', effects: [herz(ID, 45), { xp: 40 }] }),
  knoten('kakao', [erz('Kalter Kakao, serviert mit Würde. Die Oberstädter sind irritiert. Dann begeistert. „Retro“, sagt einer. „So unterstädtisch“, sagt eine andere. Perle setzt ihn auf die Karte.')], { next: 'ende', effects: [herz(ID, 35), { xp: 30 }] }),
  knoten('ende', [P('Du bist ein Engel aus dem Rinnstein. Das ist das Netteste, was ich hier oben je zu jemandem gesagt hab.')], { effects: [flag('perle_freund')] }),
]);

/** ♥4: Perle singt nach Ladenschluss. */
const he4 = dialog('he-barista-perle-4', [
  knoten('start', [
    erz('Nach Ladenschluss. Die Stühle stehen auf den Tischen. Perle hat das Radio laut gedreht und singt in ein Milchkännchen wie in ein Mikrofon. Als sie dich sieht, erstarrt sie.'),
    P('Du hast nichts gesehen. Du hast vor allem nichts gehört.'),
    P('… War es schlimm? Sag ehrlich. Nein, sag nicht ehrlich. Sag nett.'),
  ], {
    choices: [
      { text: '„Es war richtig gut. Du solltest im High Voltage auftreten.“', tag: '[Ausstrahlung 5]', check: pruefung('he-perle-4-hv', 'ausstrahlung', 5, ['ueberreden']), next: 'hv' },
      { text: 'Ein zweites Milchkännchen nehmen und mitsingen.', next: 'duett' },
      { text: '„Es war schief. Aber mit Herz.“', next: 'ehrlich' },
    ],
  }),
  knoten('hv', [P('Im High Voltage? Wo die Leute mit Schlägern tanzen? … Ich hab ein rosa Kleid. Das passt da gar nicht hin. Das ist perfekt.', 'freude')], { next: 'ende', effects: [herz(ID, 60), flag('perle_hv_auftritt')] }),
  knoten('duett', [erz('Ihr singt zusammen, zwei Milchkännchen, ein Radio, ein leeres Café. Draußen bleibt ein Wachmann stehen und wippt mit dem Fuß.')], { next: 'ende', effects: [herz(ID, 55)] }),
  knoten('ehrlich', [P('Schief. Mit Herz. … Das schreib ich auf meinen Grabstein. Oder auf die Kaffeekarte.'), erz('Sie lacht, bis ihr die Löffel aus dem Haarknoten fallen.')], { next: 'ende', effects: [herz(ID, 50)] }),
  knoten('ende', [
    ich('Warum hast du aufgehört zu singen?'),
    P('Hab ich nicht. Ich hab nur aufgehört, es jemandem zu zeigen. Bis eben.'),
  ], { effects: [{ xp: 60 }, { give: 'sahnetorte-stueck' }] }),
]);

const perle = weltfigur({
  id: ID,
  name: 'Barista Perle',
  unknownName: 'Barista mit Perlenohrringen',
  faction: 'unterstadt',
  bio: 'Barista im Café Sahnehaube in den Glasarkaden. Perlenohrringe, Kaffeelöffel im Haarknoten, wollte mal Sängerin werden. Kennt die Bestellungen aller Gäste – auch der gefährlichen.',
  gifts: geschenke({
    loves: ['sahnetorte-stueck', 'mikrofon-puschel', 'perlenkette'],
    likes: ['synth-kaffee', 'vinyl-platte', 'orchidee', 'liebesroman'],
    dislikes: ['volt-limo', 'kuehlmittel-mocktail'],
    hates: ['kanalschlamm', 'zerberster-oel'],
  }),
  schedule: [ort('M,T,A', 'cafe-sahnehaube', 'theke'), weg('N')],
  heartEvents: [
    { id: 'he-barista-perle-2', hearts: 2, map: 'cafe-sahnehaube', time: ['morgen', 'tag'], dialogue: 'he-barista-perle-2' },
    { id: 'he-barista-perle-4', hearts: 4, map: 'cafe-sahnehaube', time: 'abend', when: { seen: 'he-barista-perle-2' }, dialogue: 'he-barista-perle-4' },
  ],
  talk: [
    rede('perle-tag-rivale', { rival: ID }),
    rede('perle-tag-erstes', nichtGetroffen(ID)),
    rede('perle-tag-vertraut', undefined, 4),
    rede('perle-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: perle },
  dialogues: sammle(T.rivale, T.erstes, T.standard, T.vertraut, he2, he4),
};
