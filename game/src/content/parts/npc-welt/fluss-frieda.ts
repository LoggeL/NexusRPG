// Fluss-Frieda – Kanal-Händlerin im Kanal-Sammler (world.md §4.5, Shop fluss-frieda, Fraktion kanalvolk).
// Ihre Quest side-rettung-am-rechen und die Kühlerpumpe aus side-rostlaube (gc-113) laufen über eigene Hotspots der Quests.
import type { ContentPart } from '../../part';
import type { DialogueChoice, DialogueNode } from '../../../modules/contracts';
import {
  type Menue, dialog, erz, flag, geschenke, gespraech, herz, ich, knoten, nichtGetroffen, ort, pruefung, rede, sammle,
  sprecher, weg, weltfigur, zurueck,
} from './_welt';

const ID = 'fluss-frieda';
const F = sprecher(ID);
const Z = zurueck('Noch was, Frieda.', 'Gute Strömung.');

const choices: DialogueChoice[] = [
  { text: 'Was hast du auf dem Floß?', next: 'laden', effects: [{ shop: 'fluss-frieda' }] },
  { text: 'Was treibt so alles den Kanal runter?', next: 'treibgut' },
  {
    text: 'Mit dem Floß eine Runde Treibgut fischen.', tag: '[Floß]', next: 'floss',
    effects: [{
      minigame: 'akt-floss', level: 1, key: 'frieda-floss', label: 'Treibgut fischen mit Frieda',
      win: [{ give: 'treibholz' }, { credits: 20 }, herz(ID, 10), { rep: 'kanalvolk', delta: 1 }],
      lose: [{ message: 'Frieda: „Floß bleibt oben, du bleibst oben. Das ist schon ein Erfolg.“' }],
    }],
  },
  { text: '„Wie ist das Leben beim Kanalvolk?“', tag: '[Frieda ♥3]', requires: { hearts: ID, min: 3 }, once: true, id: 'fr-volk', next: 'volk' },
  { text: 'Gute Strömung.' },
];

const nodes: DialogueNode[] = [
  knoten('laden', [F('Pilzsuppe, Stirnlampen, Masken. Und Zeug, das von oben kommt. Die Oberstadt wirft weg, die Unterstadt fischt auf, und das Kanalvolk verkauft es zurück. Kreislauf.')]),
  knoten('treibgut', [
    F('Alles. Schuhe. Fernseher. Ein Klavier, einmal. Es hat beim Treiben gespielt. Von allein. Ich hab nicht gefragt, wie.'),
    F('Und manchmal Briefe in Flaschen. Von Leuten oben, die sich einsam fühlen. Ich antworte. Mit Pilzen. Keiner hat sich je beschwert.'),
  ], { choices: Z }),
  knoten('floss', [F('Rauf aufs Floß. Halt dich fest. Wenn was Großes vorbeitreibt: nicht anfassen. Großes beißt.')]),
  knoten('volk', [
    F('Feucht. Dunkel. Ehrlich. Wir haben keinen Strom, aber wir haben Pilze, die leuchten. Wir haben keine Sonne, aber wir haben Bürgermeister Gully. Der leuchtet auch, wenn er getrunken hat.'),
    F('Oben denken sie, wir sind Ratten. Wir sind keine Ratten. Die Ratten sind unsere Nachbarn. Wir grüßen uns.'),
  ], { choices: Z, effects: [herz(ID, 20)] }),
];

const M: Menue = { zeile: F('Noch was? Die Strömung wartet nicht. Ich auch nicht lang.'), choices, nodes };

const T = {
  rivale: dialog('frieda-tag-rivale', [knoten('start', [F('Kein Handel mit dir.'), F('Spring in den Kanal und lass dich treiben. Weit.')])]),
  erstes: gespraech('frieda-tag-erstes', [
    erz('Am Rand des Kanal-Sammlers schaukelt ein Floß aus Fässern und Türen, beladen mit Kisten, Pilzkörben und einem Sonnenschirm ohne Sonne. Darauf steht eine Frau in Wathose mit Stake und Stirnlampe.'),
    F('Frieda. Fluss-Frieda. Was du verloren hast, hab ich gefunden. Was du brauchst, hab ich vielleicht. Was du willst, kostet extra.'),
  ], M),
  standard: gespraech('frieda-tag-standard', [F('Na, Landratte? Willst du was kaufen oder nur nass werden?')], M),
};

/** ♥2: Ein Rohrbruch spült Friedas Ware weg. */
const he2 = dialog('he-fluss-frieda-2', [
  knoten('start', [
    erz('Ein Rohr über dem Sammler platzt. Ein Wasserschwall reißt die Hälfte von Friedas Kisten vom Floß. Pilzkörbe treiben davon wie kleine Boote.'),
    F('MEINE WARE! Die Pilze! Die Lampen! Mein Sonnenschirm! Nicht der Sonnenschirm!'),
  ], {
    choices: [
      { text: 'Ins Wasser springen und die Kisten zurückholen.', tag: '[Körper 4]', check: pruefung('he-frieda-2-schwimmen', 'koerper', 4, ['tauchen']), next: 'geschwommen' },
      { text: 'Das Rohr mit einem Ventil abdrehen, bevor mehr kommt.', tag: '[Technik 4]', check: pruefung('he-frieda-2-ventil', 'technik', 4, ['maschine']), next: 'ventil' },
      { text: 'Mit dem Stake die Kisten ans Ufer lenken.', next: 'stake' },
    ],
  }),
  knoten('geschwommen', [erz('Das Wasser ist kalt, grün und riecht nach Dingen, die man nicht wissen will. Du holst sechs Kisten und den Sonnenschirm. Frieda küsst den Sonnenschirm.')], { next: 'ende', effects: [herz(ID, 45), { xp: 40 }] }),
  knoten('ventil', [erz('Du drehst. Das Rohr röchelt und verstummt. Frieda fischt den Rest mit dem Netz. Am Ende fehlt nur eine Kiste. Darin waren Socken. Keiner trauert.')], { next: 'ende', effects: [herz(ID, 45), { xp: 40 }] }),
  knoten('stake', [erz('Du stakst wie ein Gondoliere, der noch nie eine Gondel gesehen hat. Die Hälfte der Kisten landet am Ufer, die andere Hälfte beim Kanalvolk. Die bringen sie zurück. Gegen Pilze.')], { next: 'ende', effects: [herz(ID, 35), { xp: 30 }] }),
  knoten('ende', [F('Du bist kein Kanalvolk. Aber du schwimmst wie eins. Das ist das höchste Lob hier unten.')], { effects: [flag('frieda_freund'), { rep: 'kanalvolk', delta: 2 }] }),
]);

/** ♥4: Frieda zeigt den Ort, wo der Kanal das Meer riecht. */
const he4 = dialog('he-fluss-frieda-4', [
  knoten('start', [
    erz('Frieda stakt dich durch einen engen Tunnel bis zu einem Gitter. Dahinter: Dunkelheit. Und ein Geruch. Salz.'),
    F('Hier riecht man das Meer. Nur hier. Nur bei Ebbe. Der Kanal fließt hinter dem Gitter weiter, unter der Flutmauer durch, bis zum Strand.'),
    F('Ich bin noch nie da gewesen. Das Gitter ist zu. Seit dreißig Jahren. Ich komme jeden Monat her und rieche.'),
  ], {
    choices: [
      { text: 'Das Gitter untersuchen.', tag: '[Technik 5]', check: pruefung('he-frieda-4-gitter', 'technik', 5, ['verklemmt']), next: 'gitter' },
      { text: 'Einfach mit ihr dasitzen und riechen.', next: 'riechen' },
      { text: '„Käpt’n Nebelhorn fährt ans Meer. Frag ihn.“', when: { met: 'kaeptn-nebelhorn' }, next: 'nebelhorn' },
    ],
  }),
  knoten('gitter', [erz('Das Schloss ist verrostet, aber nicht verschweißt. Du kriegst es einen Spalt weit auf. Frieda starrt in die Dunkelheit. Sie macht es wieder zu.'), F('Noch nicht. Aber jetzt weiß ich, dass es geht. Das reicht für heute.')], { next: 'ende', effects: [herz(ID, 60), flag('frieda_gitter_offen')] }),
  knoten('riechen', [erz('Ihr sitzt auf dem Floß. Das Wasser plätschert. Irgendwo hinter dem Gitter rauscht etwas, das größer ist als die ganze Stadt.')], { next: 'ende', effects: [herz(ID, 50)] }),
  knoten('nebelhorn', [F('Nebelhorn? Der alte Lügner? … Der lügt nur über Fische. Über das Meer nie. Vielleicht frag ich ihn.'), erz('Sie lächelt. Unter der Stirnlampe sieht es aus wie ein Sonnenaufgang.')], { next: 'ende', effects: [herz(ID, 55), flag('frieda_nebelhorn')] }),
  knoten('ende', [
    ich('Warum zeigst du mir das?'),
    F('Weil du der Erste bist, der nicht gefragt hat, was es kostet.'),
  ], { effects: [{ xp: 60 }, { rep: 'kanalvolk', delta: 3 }] }),
]);

const frieda = weltfigur({
  id: ID,
  name: 'Fluss-Frieda',
  unknownName: 'Frau auf dem Floß',
  faction: 'kanalvolk',
  bio: 'Kanal-Händlerin mit Floß aus Fässern und Türen im Kanal-Sammler. Wathose, Stake, Stirnlampe. Fischt, was die Oberstadt wegwirft, und verkauft es zurück. Riecht jeden Monat am Gitter das Meer.',
  gifts: geschenke({
    loves: ['muschel-glas', 'leuchtpilz', 'postkarte-meer'],
    likes: ['treibholz', 'wasserfilter', 'synth-kaffee', 'algen-chips'],
    dislikes: ['parfuem-ozon', 'seidentuch-blau'],
    hates: ['plastikpflanze', 'waschpulver'],
  }),
  schedule: [ort('M,T,A', 'kanal-sammler', 'friedas-stand'), weg('N')],
  heartEvents: [
    { id: 'he-fluss-frieda-2', hearts: 2, map: 'kanal-sammler', time: ['morgen', 'tag'], dialogue: 'he-fluss-frieda-2' },
    { id: 'he-fluss-frieda-4', hearts: 4, map: 'kanal-sammler', time: ['tag', 'abend'], when: { seen: 'he-fluss-frieda-2' }, dialogue: 'he-fluss-frieda-4' },
  ],
  talk: [
    rede('frieda-tag-rivale', { rival: ID }),
    rede('frieda-tag-erstes', nichtGetroffen(ID)),
    rede('frieda-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: frieda },
  dialogues: sammle(T.rivale, T.erstes, T.standard, he2, he4),
};
