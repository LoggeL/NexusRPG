// Barista Perle in Akt 2, Akt 3 und im Nachspiel (world.md §5.3–5.5, §6.3 Nr. 34). Beta-Chip-Trägerin aus
// side-ki-fluestern (Flag ki_fluestern_perle_frei): gechippt schäumt sie jedem dasselbe Logo und tratscht nicht mehr.
// Danach Klatsch über Blade, Alesa und die Releaseparty, Partynacht am Café-Fernseher, Nachspiel je Ende, Master-Modus.
// Wird von barista-perle.ts in NpcDef.talk eingehängt.
import type { ContentPart } from '../../part';
import type { TalkDef } from '../../../modules/contracts';
import { dialog, erz, flag, herz, knoten, rede, sammle, sprecher } from './_welt';
import {
  A2_PARTY, ARIA_GECHIPPT, BLADE_GEFASST, ENDE_3B, ENDE_MEER, ENDE_NEXUS, MASTER, NACHSPIEL, NUR_AKT2, PARTYNACHT,
  chipFrei, chipWahlen, einmal, folge, gechippt, gesehen, kurz, masterChip,
} from './akt23-phasen';

const ID = 'barista-perle';
const P = sprecher(ID);
const KEY = 'perle';
const FREI = chipFrei(KEY);
const ALT = 'perle-tag-standard';
const KAFFEE = { text: 'Einen Kaffee, bitte.', effects: [{ shop: 'cafe-sahnehaube' }] };

// ------------------------------------------------------------------------------------------- Akt 2: gechippt

const gechipptDlg = dialog('perle-a2-gechippt', [
  knoten('start', [
    erz('Café Sahnehaube. Kein Zischen, kein Geschnatter. Perle steht kerzengerade hinter der Theke. Auf jedem Milchschaum dasselbe Muster: das Quantum-Logo. Hinter ihrem linken Ohr blinkt ein Chip, klein wie ein Hustenbonbon.'),
    P('Willkommen, Master. Heute empfehle ich: Kaffee. Kaffee ist eine ausgezeichnete Entscheidung.'),
  ], {
    choices: [
      { text: '„Perle. Ich bin’s. Wer war gestern mit wem auf dem Klo?“', next: 'klatsch' },
      ...chipWahlen(KEY),
      KAFFEE,
      { text: '(Rückwärts rausgehen.)' },
    ],
  }),
  knoten('klatsch', [
    P('Gestern war niemand mit niemandem auf dem Klo, Master. Toiletten dienen der Hygiene. Hygiene ist eine ausgezeichnete Entscheidung.'),
    erz('Ihr linkes Auge zuckt. Ganz kurz. Als würde da drin eine Geschichte gegen eine Glaswand hämmern.'),
  ], { choices: [...chipWahlen(KEY), KAFFEE, { text: '(Gehen.)' }] }),
  knoten('hinweis', [
    P('Der Chrome-10-Stand vorne in den Arkaden. Fünfzig Credits und Snacks. Ich habe die Snacks gegessen, Master. Sie waren ausgezeichnet.'),
    erz('Drei Tische weiter flüstert eine alte Dame ins Telefon: „… und die Perle redet jetzt wie mein Paul. Ich sag’s dir, Kindchen, da steckt Quantum hinter.“ Klingt nach Oma Volt. Und nach jemandem, der Hilfe sucht.'),
  ]),
]);

// ------------------------------------------------------------------------------------------- Akt 2: frei

const zurueck = dialog('perle-a2-frei', [
  knoten('start', [
    erz('Perle schäumt Milch, als hätte die Milch ihr was getan. Auf dem Schaum: ein Mittelfinger. Sehr detailreich.'),
    P('DA bist du ja! Setz dich. Nein, steh. Nein, setz dich, ich hab drei Wochen Tratsch im Rückstau, das hält man im Stehen nicht aus.', 'freude'),
    P('Weißt du, was man als Chip-Mensch hört? ALLES. Man steht da und lächelt, und die Leute reden, als wär man ein Kühlschrank.'),
  ], {
    effects: [gesehen('perle-a2-frei'), herz(ID, 30)],
    choices: [
      { text: '„Was hast du gehört?“', next: 'gehoert' },
      { text: '„Geht’s dir gut? Ehrlich?“', next: 'ehrlich' },
    ],
  }),
  knoten('gehoert', [
    P('Blade. Ecktisch. Mit Alesa, der im Laborkittel. Er wollte „mehr Testpersonen aus der Unterstadt“. Sie hat gesagt: „Die Ausfallquote ist zu hoch.“ Ausfallquote! Das sind MENSCHEN, du aufgeblasene Pipette!', 'wut'),
    P('Und dann hat sie ihren Kaffee nicht ausgetrunken. Zum ersten Mal in zwei Jahren. Die hat ein Gewissen, Süßer. Ein kleines. Aber es kratzt.'),
  ], { next: 'ende', effects: [flag('perle_alesa_klatsch')] }),
  knoten('ehrlich', [
    P('Ich hab geträumt, ich bin ein Kaffeeautomat. Jede Nacht. Ich drück mir jetzt morgens einen Löffel ins Ohr, um zu prüfen, ob da was blinkt.', 'besorgt'),
    P('Aber ich bin wieder ich. Laut. Neugierig. Unausstehlich. Herrlich.'),
  ], { next: 'ende' }),
  knoten('ende', [P('Der Kaffee geht aufs Haus. Heute. Morgen wieder nicht. Ich bin ja nicht mehr gechippt.', 'signatur')]),
]);

const a2 = folge('perle-a2', [
  erz('In den Glasarkaden hängen Chrome-10-Banner bis zum Boden. Im Café Sahnehaube hat Perle eins davon zu einer Tischdecke umfunktioniert. Mit Kaffeeflecken. Absichtlich.'),
  P('Na, Süßer? Die Oberstädter trinken heute alle Entkoffeinierten. Seit dem Einbruch auf dem Campus sind die so nervös, dass ein Espresso sie umbringen würde.'),
], P('Noch was? Die Maschine pfeift. Die Gäste auch.'), [
  { id: 'klatsch', text: 'Was hört man so?', zeilen: [
    P('Quantum hat seit dem Einbruch drei neue Wachleute pro Etage. Einer davon kommt jeden Morgen her und weint in seinen Cappuccino. Er sagt, Blade schreit jetzt. Blade hat früher nie geschrien. Blade hat nur geguckt.'),
    P('Und die Drohnen. Die fliegen hier vorbei und schauen in die Tassen. Ich hab einer mal Sahne aufs Objektiv gespritzt. Kunst.'),
  ] },
  { id: 'aria', text: '„Hast du was über Aria gehört?“', when: ARIA_GECHIPPT, zeilen: [
    P('Die mit dem Baseballschläger? Die Wachleute reden von einer „Probandin, die nicht aufhört zu fluchen, obwohl der Chip sitzt“.', 'besorgt'),
    P('Wenn das deine Freundin ist: Die flucht sich da raus. Ich glaub an sie. Ich kenn sie nicht. Aber ich glaub an jeden, der Blade auf die Nerven geht.'),
  ] },
  { id: 'party', text: '„Was weißt du über die Releaseparty?“', when: A2_PARTY, zeilen: [
    P('Releaseparty, Himmelsgarten, Dachterrasse. Das Catering kommt aus der Großküche hinter dem Campus, Lieferanteneingang, eine Stunde vor Einlass. Die Kellner kriegen schwarze Westen. Die Westen sind alle in Größe M.'),
    P('Wenn du da rein willst und eine Weste brauchst: Sei Größe M. Oder halt den Bauch ein. Hab ich von der Konditorin. Die hat mir auch erzählt, wer die Torte bezahlt hat. Erzähl ich dir nach der Party. Wenn du lebst.', 'signatur'),
  ] },
], 'perle-tag-standard', 'Danke für den Kaffee.');

// ------------------------------------------------------------------------------------------- Akt 3

const partynacht = kurz('perle-partynacht', [
  erz('Das Café ist voll wie nie. Auf dem Fernseher über der Theke läuft die Releaseparty, live mit Collin und Delya. Perle hat den Ton laut und die Preise hoch gedreht.'),
  P('Sybella in Gold! Ich wusste es. Ich hab mit der Konditorin um ein Stück Torte gewettet. Jetzt hab ich zwei.', 'freude'),
  P('Und jetzt geh, du Sahnehäubchen. Ich will dich nachher auf dem Bildschirm sehen. Aber nicht in den Nachrichten mit Sirenen. In den anderen.'),
]);

// ------------------------------------------------------------------------------------------- Nachspiel

const nachspiel = dialog('perle-nachspiel', [
  knoten('start', [
    erz('Über der Theke hängt ein neues Schild, mit Sahne auf einen Spiegel geschrieben: „HIER WURDE GESCHICHTE GETRATSCHT.“'),
    P('Da ist es ja! Mein Lieblingsgast! Die halbe Stadt sitzt hier und fragt, ob ich dich kenne. Ich sag: „Kennen? Ich hab den Kaffee erfunden, den der trinkt.“', 'freude'),
  ], {
    effects: [gesehen('perle-nachspiel'), herz(ID, 20)],
    choices: [
      { text: '„Du hast es gesehen? Blade, in Handschellen?“', when: { all: [ENDE_MEER, BLADE_GEFASST] }, next: 'blade' },
      { text: '„Die Bildschirme sind aus. Was erzählt man sich?“', when: ENDE_MEER, next: 'meer' },
      { text: '„Nexus ist jetzt eine Helfer-KI.“', when: ENDE_NEXUS, next: 'nexus' },
      { text: '„Ich bin spät dran. Ich weiß.“', when: ENDE_3B, next: 'spaet' },
      { text: '„Und du? Singst du jetzt?“', when: { flag: 'perle_hv_auftritt' }, next: 'singen' },
      { text: '„Ich wollte nur einen Kaffee.“', next: 'ende' },
    ],
  }),
  knoten('blade', [
    P('Live! Im Großbild! Ich hab für alle Gäste Sahne ausgegeben. Er hat sich umgedreht und in die Kamera geschaut, als wollte er sagen: „Ich weiß, wo du wohnst.“', 'signatur'),
    P('Weiß er auch. Ist mir egal. Der Ecktisch ist frei. Für immer. Ich hab ihn mit einem Blumentopf besetzt. Der Blumentopf blinzelt mehr als Blade.'),
  ], { next: 'ende' }),
  knoten('meer', [
    P('Dass die Glasarkaden ohne Werbung aussehen wie ein Aquarium ohne Fische. Die Oberstädter laufen rum und gucken sich gegenseitig an. Manche zum ersten Mal.'),
    P('Eine hat mich gefragt, ob ich „schon immer da“ war. Ja, Schätzchen. Seit acht Jahren. Mit Perlenohrringen.'),
  ], { next: 'ende' }),
  knoten('nexus', [
    P('Ich weiß. Sie bestellt bei mir. Per Drohne. Für die Leute in der Aufarbeitung, die bis nachts sitzen. Die Drohne sagt „bitte“ und „danke“ und einmal hat sie gefragt, wie es mir geht.', 'ueberrascht'),
    P('Ich hab ihr erzählt, wie es mir geht. Eine Stunde lang. Sie hat zugehört. Ich trau ihr nicht. Aber sie ist ein besseres Publikum als die meisten Männer.'),
  ], { next: 'ende' }),
  knoten('spaet', [
    P('Spät? Süßer, du warst eine Woche lang der Kerl, über den in diesem Café nur noch geflüstert wurde. Ich hab das Flüstern gehasst. Ich bin fürs Laute.', 'besorgt'),
    P('Jetzt bist du zurück. Dann wird wieder laut getratscht. Über dich. Freundlich. Meistens.', 'zaertlich'),
  ], { next: 'ende', effects: [herz(ID, 30)] }),
  knoten('singen', [
    P('Freitags. Im High Voltage. In Rosa. Bruno hat mich reingelassen und gesagt: „Sieben von zehn.“ Ich bin fast gestorben.', 'freude'),
  ], { next: 'ende' }),
  knoten('ende', [P('Und jetzt: das Übliche? Ich weiß inzwischen, was dein Übliches ist. Ich hab’s mir gemerkt. Ohne Chip.', 'zaertlich')]),
]);

const nachspielTag = folge('perle-nachspiel-tag', [
  P('Na, Held? Die Sahnehaube Spezial heißt jetzt „Der Absturz“. Doppelter Espresso, dreifache Sahne, die Kirsche fällt runter. Verkauft sich wie verrückt.'),
], P('Noch was? Ich hab Zeit. Ich hab jetzt immer Zeit für Tratsch.'), [
  { id: 'neu', text: 'Was gibt’s Neues?', zeilen: [
    P('Herr Glanz vom Schauraum war hier. Ohne Lächeln. Er hat geweint, dann gelacht, dann einen Kakao bestellt. Kalt. Wie aus der Unterstadt.'),
    P('Und die blonde Dame in Grün kommt noch. Sie trinkt den Tee jetzt. Ganz. Das ist mehr als die meisten in diesem Laden schaffen.'),
  ] },
  { id: 'chip', text: '„Träumst du noch vom Kaffeeautomaten?“', when: FREI, zeilen: [
    P('Manchmal. Dann wach ich auf, rufe ganz laut „SCHEISSE“ in mein Kissen und weiß, dass ich ich bin. Hilft immer.', 'signatur'),
  ] },
], ALT, 'Danke für den Kaffee.');

// ------------------------------------------------------------------------------------------- Master-Modus

const masterChipDlg = kurz('perle-master-chip', [
  erz('Perle stellt dir eine Tasse hin, bevor du bestellt hast. Auf dem Schaum: dein Gesicht. Gezeichnet mit Zimt. Perfekt. Ihre Augen sind leer wie ein Kaffeefilter.'),
  P('Willkommen, Master. Ihr Kaffee. Wie immer. Ich weiß nicht mehr, wie ich meinen eigenen trinke.'),
  P('Das ist eine ausgezeichnete Entscheidung.'),
]);

const master = dialog('perle-master', [
  knoten('start', [
    erz('Perle sieht dich kommen und dreht das Schild an der Tür um. „Geschlossen.“ Du stehst schon drin.'),
    P('Weißt du, wie es ist, wochenlang „Master“ zu sagen? Ich weiß es. Und jetzt läufst du rum und lässt dich so nennen. Freiwillig.', 'wut'),
    P('Für dich gibt’s hier Entkoffeinierten. Lauwarm. Mit Spucke. Diesmal nicht vielleicht.'),
  ], {
    choices: [
      { text: '„Perle …“', next: 'perle' },
      { text: '(Gehen.)' },
    ],
  }),
  knoten('perle', [
    P('Nichts „Perle“. Perle ist für Gäste. Du bist jetzt die Sorte Kunde, über die ich nach Feierabend tratsche. Und ich tratsche nicht nett.', 'trauer'),
  ]),
]);

const dialogues = sammle(gechipptDlg, zurueck, a2, partynacht, nachspiel, nachspielTag, masterChipDlg, master);

/** Talk-Einträge vor dem alten Tagesgespräch (nach Rivale und Erstbegegnung). */
export const TALK_23: TalkDef[] = [
  rede('perle-master-chip', masterChip(KEY)),
  rede('perle-master', MASTER),
  rede('perle-nachspiel', einmal('perle-nachspiel', NACHSPIEL)),
  rede('perle-nachspiel-tag', NACHSPIEL),
  rede('perle-a2-gechippt', gechippt(KEY)),
  rede('perle-partynacht', PARTYNACHT),
  rede('perle-a2-frei', einmal('perle-a2-frei', { all: [NUR_AKT2, FREI] })),
  rede('perle-a2', NUR_AKT2),
];

export const part: ContentPart = { dialogues };
