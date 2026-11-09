// Fräulein Pixel – Fälscherin im Fotoautomaten am Bahnhof Mitte (world.md §4.5, §3.9 akt-fotoautomat, Shop fraeulein-pixel).
import type { ContentPart } from '../../part';
import type { DialogueChoice, DialogueNode } from '../../../modules/contracts';
import {
  type Menue, dialog, erz, flag, geschenke, gespraech, herz, ich, knoten, nichtGetroffen, ort, pruefung, rede, sammle,
  sprecher, weg, weltfigur, zurueck,
} from './_welt';

const ID = 'fraeulein-pixel';
const P = sprecher(ID);
const Z = zurueck('Noch was, Fräulein.', 'Lächeln, Klick, weg.');

const choices: DialogueChoice[] = [
  { text: 'Was hast du im Angebot?', next: 'ware', effects: [{ shop: 'fraeulein-pixel' }] },
  { text: 'Was kostet ein Oberstadt-Ausweis?', once: true, id: 'px-ausweis', next: 'ausweis' },
  { text: 'Wie wird man Fälscherin?', tag: '[Pixel ♥2]', requires: { hearts: ID, min: 2 }, once: true, id: 'px-beruf', next: 'beruf' },
  { text: '„Mein alter Dienstausweis. Kannst du den … verbessern?“', tag: '[Ex-Wache]', when: { origin: 'origin-ex-wache' }, once: true, id: 'px-wache', next: 'wache' },
  { text: 'Lächeln, Klick, weg.' },
];

const nodes: DialogueNode[] = [
  knoten('ware', [P('Bitte recht freundlich. Oder recht fremd. Wie du willst. Ich mach beides.')]),
  knoten('ausweis', [
    P('Vierhundert. Mit Hologramm, Prüfziffer und einem Foto, auf dem du aussiehst, als hättest du schon mal eine Steuererklärung gemacht.'),
    P('Das ist der Preis für Leute, die ich mag. Leute, die ich nicht mag, zahlen auch vierhundert. Aber ich mach dann das Foto schief.'),
  ], { choices: Z }),
  knoten('beruf', [
    P('Ich war Passfotografin. Beim Amt. Zwölf Jahre. Ich hab zehntausend Menschen gesagt: „Nicht lächeln.“'),
    P('Irgendwann hab ich gedacht: Die Leute verdienen bessere Fotos. Und bessere Namen. Und manchmal ein anderes Geburtsdatum.'),
  ], { choices: Z, effects: [herz(ID, 20)] }),
  knoten('wache', [
    P('Oh, ein echter! Mit Stempel! Weißt du, was so einer auf dem Markt wert ist? Mehr als dein Gewissen.'),
    P('Behalt ihn. Ich verbessere keine echten Sachen. Das bringt Unglück. Und Papierkram.'),
  ], { choices: Z, effects: [herz(ID, 30)] }),
];

const M: Menue = { zeile: P('Noch was? Der Vorhang ist offen, die Luft wird kalt, und mein Toner ist nervös.'), choices, nodes };

const T = {
  rivale: dialog('pixel-tag-rivale', [knoten('start', [P('Automat außer Betrieb.'), erz('Ein Zettel klebt am Vorhang: „AUSSER BETRIEB. FÜR DICH.“')])]),
  erstes: gespraech('pixel-tag-erstes', [
    erz('Ein alter Fotoautomat, der Vorhang mit Glitzersternen beklebt. Drinnen sitzt eine Frau mit pinkem Pony und Lupenmonokel. Sie hält dir einen Kamm hin.'),
    P('Fräulein Pixel. Passfotos, Bewerbungsfotos, Fotos für Ausweise, die es nicht gibt. Bitte recht freundlich.'),
    P('Kämm dich. Nein, nicht so. So machen das Leute, die verhaftet werden wollen.'),
  ], M),
  nacht: gespraech('pixel-tag-nacht', [
    erz('Der Fotoautomat leuchtet in der Bahnhofshalle wie ein Aquarium. Ein Typ kommt mit Sonnenbrille raus und heißt jetzt anders.'),
    P('Nachts läuft das Geschäft. Tagsüber gibt’s nur Touristen, die vier Fotos von ihrer Zunge wollen.'),
  ], M),
  vertraut: gespraech('pixel-tag-vertraut', [P('Ah, mein Lieblingsgesicht. Weißt du, dass du ein sehr fälschbares Gesicht hast? Das ist ein Kompliment.')], M),
  standard: gespraech('pixel-tag-standard', [P('Lächeln, Klick, weg. Oder willst du was Besonderes?')], M),
};

/** ♥2: Ein Testausweis im Fotoautomaten. */
const he2 = dialog('he-fraeulein-pixel-2', [
  knoten('start', [
    erz('Fräulein Pixel winkt dich in die Kabine. Auf dem Schoß hat sie einen Stapel Plastikkarten und eine Stempelrolle.'),
    P('Ich hab einen Auftrag und zu wenig Hände. Ein Gartenausweis für den Gerichtsgarten. Die Hologramme flimmern. Hilf mir, sie richtig zu legen.'),
  ], {
    choices: [
      {
        text: 'Die Kacheln selbst ausrichten.', tag: '[Fotoautomat]',
        effects: [{
          minigame: 'akt-fotoautomat', level: 1, key: 'he-fraeulein-pixel-2', label: 'Gartenausweis fälschen',
          win: [herz(ID, 40), { xp: 40 }, { credits: 20 }, { dialogue: 'he-fraeulein-pixel-2-ende' }],
          lose: [herz(ID, 25), { xp: 20 }, { dialogue: 'he-fraeulein-pixel-2-ende' }],
        }],
      },
      { text: '„Die Prüfziffer ist Quersumme mal drei. Lass mich.“', tag: '[Technik 4]', check: pruefung('he-pixel-2-ziffer', 'technik', 4), next: 'ziffer' },
    ],
  }),
  knoten('ziffer', [P('Quersumme mal drei! Woher weißt du das? Das hab ich mir selbst ausgedacht! Dachte ich!')], { effects: [herz(ID, 45), { xp: 40 }, { credits: 20 }, { dialogue: 'he-fraeulein-pixel-2-ende' }] }),
]);

const he2Ende = dialog('he-fraeulein-pixel-2-ende', [
  knoten('start', [
    P('Fertig. Der Richter wird sich wundern, wer neuerdings seine Kürbisse gießt.'),
    P('Du hast Talent. Wenn du je ein neues Leben brauchst, ruf mich an. Das erste ist gratis. Das zweite kostet.'),
  ], { effects: [flag('pixel_kollegin')] }),
]);

/** ♥4: Fräulein Pixel fälscht etwas ganz Persönliches. */
const he4 = dialog('he-fraeulein-pixel-4', [
  knoten('start', [
    erz('Spät nachts. Fräulein Pixel hat den Vorhang zugezogen. Als du ihn aufschiebst, hält sie eine Karte gegen das Licht. Ein altes Foto: eine junge Frau mit Pony, daneben ein Mann mit Hut.'),
    P('Meine Eltern. Das einzige Foto. Ist von 2061, beim großen Hochwasser fast ertrunken.'),
    P('Ich krieg es nicht restauriert. Ich fälsch jeden Tag die Zukunft von Leuten, und meine eigene Vergangenheit krieg ich nicht hin.'),
  ], {
    choices: [
      { text: 'Die Wasserflecken vorsichtig mit dem Hologrammstift ausgleichen.', tag: '[Technik 5]', check: pruefung('he-pixel-4-foto', 'technik', 5), next: 'repariert' },
      { text: '„Der Kameramann vom NX-1 kann das. Ich bring’s ihm.“', next: 'kameramann' },
      { text: '„Vielleicht muss es nicht perfekt sein. Es ist echt. Das kannst du von keinem Ausweis sagen.“', tag: '[Ausstrahlung 5]', check: pruefung('he-pixel-4-echt', 'ausstrahlung', 5), next: 'echt' },
    ],
  }),
  knoten('repariert', [erz('Strich für Strich kommt das Gesicht des Mannes zurück. Er lacht. Er hat denselben Pony.')], { next: 'ende', effects: [herz(ID, 60)] }),
  knoten('kameramann', [erz('Zwei Tage später liegt das Foto wieder auf ihrem Schoß, gestochen scharf. Auf der Rückseite ein Aufkleber: „[ : ) ]“.')], { next: 'ende', effects: [herz(ID, 45), herz('kameramann', 20)] }),
  knoten('echt', [P('Echt. Hm. Das ist ein Wort, das ich lange nicht mehr benutzt hab.'), erz('Sie steckt das Foto in die Brusttasche. So, wie es ist.')], { next: 'ende', effects: [herz(ID, 60)] }),
  knoten('ende', [
    ich('Was machst du jetzt damit?'),
    P('Ich häng’s in den Automaten. Gleich neben den Spiegel. Damit jeder, der hier ein neues Leben anfängt, sieht, dass das alte auch was wert war.'),
    P('Und für dich: Dietrich-Set. Geschenkt. Erzähl’s nicht dem Fundbüro, Gerda sammelt die.'),
  ], { effects: [{ xp: 60 }, { give: 'dietrich-set' }] }),
]);

const pixel = weltfigur({
  id: ID,
  name: 'Fräulein Pixel',
  unknownName: 'Frau im Fotoautomaten',
  faction: 'unterstadt',
  bio: 'Ehemalige Passfotografin beim Amt, heute Fälscherin im Fotoautomaten am Bahnhof Mitte. Pinker Pony, Lupenmonokel. Ausweise, Dietriche, neue Leben. „Bitte recht freundlich.“',
  gifts: geschenke({
    loves: ['kamera-objektiv', 'stempelkissen', 'schwarzer-lippenstift'],
    likes: ['neonkreide', 'stickerbogen', 'synth-kaffee', 'comic-heft'],
    dislikes: ['gesetzbuch', 'zeitung-papier'],
    hates: ['handschellen', 'peilsender'],
  }),
  schedule: [ort('A,N', 'bahnhof-mitte', 'fotoautomat'), weg('M,T')],
  heartEvents: [
    { id: 'he-fraeulein-pixel-2', hearts: 2, map: 'bahnhof-mitte', time: 'abend', dialogue: 'he-fraeulein-pixel-2' },
    { id: 'he-fraeulein-pixel-4', hearts: 4, map: 'bahnhof-mitte', time: 'nacht', when: { seen: 'he-fraeulein-pixel-2' }, dialogue: 'he-fraeulein-pixel-4' },
  ],
  talk: [
    rede('pixel-tag-rivale', { rival: ID }),
    rede('pixel-tag-erstes', nichtGetroffen(ID)),
    rede('pixel-tag-vertraut', undefined, 4),
    rede('pixel-tag-nacht', { time: 'nacht' }),
    rede('pixel-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: pixel },
  dialogues: sammle(T.rivale, T.erstes, T.nacht, T.vertraut, T.standard, he2, he2Ende, he4),
};
