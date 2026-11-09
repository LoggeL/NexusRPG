// Vex × Aria und „Zerberster-Herz“ in den Enden (world.md §4.7 Station 11, §5.5). Die Enden selbst (Cutscenes, Ankunft,
// Flags `ende_*`, `epilog`) baut quest-enden/enden.ts; hier hängen sich die Paarszenen an die Ende-Flags:
//   Ende 1/2/3b · `rom-vexaria-meer` / `-fs` (Vex, Tafel `cut-rom-vexaria-meer`) bzw. `rom-aria-meer` / `-fs` (Baukasten,
//     Tafel `cut-rom-aria-meer`): erster Abend an `das-meer`, „Wer zuerst am Wasser ist!“. Nacht am Lagerfeuer → Abblende.
//     Mit `ende_doch_noch_meer` (3b) beginnt die Szene mit der Versöhnung.
//   Ende 2 · `vexaria-ende-autoradio` (onEnter das-meer, Morgen danach): Nexus im Autoradio kommentiert das Paar.
//   Ende 3 · `vexaria-ende-master` (onEnter blades-buero) + Telefon `aria-vex-master-1..3`: bittersüß, ohne Vex.
//   Nachspiel · `rom-vexaria-konzert-strand`: Konzert am Strandclub, falls Station 13 in Akt 1/2 nicht lief.
import type { ContentPart } from '../../part';
import type { Condition, CutsceneDef, DialogueDef, HeartEventDef, PhoneMessageDef } from '../../../modules/contracts';
import {
  a, all, any, BESCHWINGT, byId, ch, cut, dlg, EPILOG, flag, herz, HEUTE_FREI, n, node, noFlag, not, NOT_V, R, s,
  seen, set, STATION_START, twin, V, v, ZUSAMMEN,
} from './_util';

const PAAR: Condition = all(R, ZUSAMMEN);
const ENDE_3B = flag('ende_doch_noch_meer');
const AM_MEER: Condition = all(EPILOG, any(flag('ende_meer'), flag('ende_neue_nexus'), ENDE_3B));
const MASTER: Condition = all(flag('ende_master'), not(ENDE_3B));

// ---------------------------------------------------------------------------
// rom-vexaria-meer · „Wer zuerst am Wasser ist!“

const meerVex = (id: string, rom: boolean): DialogueDef => dlg(id, [
  node('start', [], {
    effects: STATION_START,
    choices: [
      ch('…', 'dreib', { when: ENDE_3B }),
      ch('…', 'abend', { when: not(ENDE_3B) }),
    ],
  }),
  node('dreib', [
    n('Der Strand am Abend. Du kommst zu Fuß über die Düne, Turmstaub noch in den Stiefeln, die Jacke über der Schulter. Die Crew sitzt am Feuer. Keiner steht auf. Bis auf eine.'),
    n('Aria kommt dir entgegen. Barfuß, die Zöpfe voller Salz, den Zerberster rostig gesprenkelt von der Gischt. Sie bleibt zwei Meter vor dir stehen. Dann einen.'),
    ...(rom ? [
      a('Hast ganz schön lang gebraucht, Arschloch. Komm her.', 'trauer'),
      n('Sie zieht dich an den Riemen zu sich und hält dich fest. Lange. Ihr Gesicht in deinem Hals, deine Hand in ihren Zöpfen, und hinter euch tut die Crew sehr angestrengt so, als würde sie Muscheln sortieren.'),
      a('Ich war so sauer. Ich bin immer noch sauer. Ich hab jeden Abend einen Kronkorken ins Meer geschmissen und dich verflucht. Siebzehn Stück.', 'wut'),
      v('Ich hab mitgezählt. Auf dem Bildschirm im Turm.', 'trauer'),
      a('… Du hast uns zugeguckt? Die ganze Zeit?', 'ueberrascht'),
      v('Jeden Abend. Den leeren Platz.', 'trauer'),
    ] : [
      a('Hast ganz schön lang gebraucht, Kurierin. Komm her.', 'trauer'),
      n('Sie haut dir die Metallfaust gegen die Schulter. Dann zieht sie dich in eine Umarmung, die dir zwei Rippen verbiegt.'),
    ]),
  ], { next: 'abend' }),
  node('abend', [
    n('Sonnenuntergang. Die Sonne hängt rot und riesig über dem Wasser, so tief, dass man glaubt, sie zischt gleich. Der Sand ist noch warm vom Tag. Aria steht neben dir, die Stiefel in der Hand.'),
    a('Weißt du noch? Ich hab gesagt, wir sehen\'s zusammen. Beide gleichzeitig. Dann gewinnt keine.', 'freude'),
    v('Ich gewinn trotzdem.', 'signatur'),
    a('WER ZUERST AM WASSER IST!', 'freude'),
    n('Sie rennt los, bevor sie „Wasser“ gesagt hat. Natürlich. Du rennst hinterher. In Stiefeln. Mit Gurtzeug. Der Sand frisst jeden Schritt, und zum ersten Mal in deinem Leben bist du nicht die Schnellste.'),
    n('Aria springt in die Brandung. Barfuß, kreischend, die Arme hoch. Das Wasser spritzt silbern um den Zerberster. Sie dreht sich um und streckt dir die Metallhand entgegen.'),
    a('Es ist echt! Das Meer ist echt! Ich dachte, das ist so ein Hunter-Märchen!', 'ueberrascht'),
    a('Komm rein, du Feigling. Das Salz rostet höchstens mich.', 'freude'),
  ], {
    choices: [
      ch('Stehen bleiben. An der Wasserlinie. Stiefel im Schaum.', 'stehen'),
      ch('Rein. Mit Stiefeln.', 'rein'),
    ],
  }),
  node('stehen', [
    n('Du bleibst an der Wasserlinie stehen, die Stiefelspitzen im Schaum. Das Meer kommt und geht und kommt wieder. Es hält nicht an. Es kommt nur immer zurück.'),
    n('Aria watet zu dir. Sie nimmt deine Hand, die echte, mit der silbernen, und zieht nicht. Sie hält sie nur.'),
    v('Kas wollte immer hierher.', 'trauer'),
    a('Dann ist er jetzt hier. Ein bisschen. In dir. In deinem dummen Gesicht, das gerade versucht, nicht zu heulen.', 'zaertlich'),
    n('Du drehst dich um. Zur Crew am Feuer, zu Hunter mit der Sonnenbrille in der Hand, zu Vega, die so tut, als würde sie nicht gucken. Du drehst dich um, und keiner ist weg.'),
  ], { next: rom ? 'rom' : 'fs' }),
  node('rein', [
    n('Du rennst rein. Mit allem. Die erste Welle trifft dich bis zur Hüfte und ist so kalt, dass du schreist, und Aria lacht so laut, dass Möwen auffliegen. Dein Gurtzeug saugt sich voll. Deine Stiefel sind verloren. Es ist dir egal.'),
    a('Du hast geschrien! DU hast GESCHRIEN! Das erzähl ich jedem!', 'freude'),
    n('Dann zieht sie dich an den Riemen zu sich, und ihr steht bis zu den Rippen im Wasser, und die Sonne geht hinter ihrem Kopf unter wie ein Heiligenschein, den sie nie zugeben würde.'),
  ], { next: rom ? 'rom' : 'fs', effects: [set('vexaria_meer_rein')] }),
  node('rom', [
    a('Weißt du, was ich heute nicht bin? Die Brecherin. Heute bin ich nur nass.', 'zaertlich'),
    v('Und meine.', 'zaertlich'),
    a('… Und deine. Sag das noch mal. Nee. Sag\'s nicht. Ich heul sonst ins Meer, und das ist eh schon salzig genug.', 'verlegen'),
    n('Sie küsst dich. Salzig, nass, die Lippen kalt vom Wasser und dann sofort warm. Ihre echte Hand an deiner Wange, die silberne um deine Hüfte, und das Wasser drückt euch zusammen, Welle für Welle, als wollte es helfen.'),
  ], { next: 'feuer' }),
  node('fs', [
    a('Weißt du, was ich heute nicht bin? Die Brecherin. Heute bin ich nur nass.', 'zaertlich'),
    v('Und Crew.', 'neutral'),
    a('Und Crew. Für immer. Oder bis einer von uns Hunter beklaut.', 'freude'),
    n('Sie zieht dich am Ärmel tiefer rein, bis ihr beide untergeht, und taucht prustend wieder auf.'),
  ], { effects: [herz(60), set('vexaria_meer')] }),
  node('feuer', [
    n('Später. Das Lagerfeuer brennt runter. Hunter schnarcht im Liegestuhl, Dante hat Raven seine Jacke umgelegt und sich dafür Kekse erbeten. Ihr sitzt etwas abseits im Sand, in eine Decke gewickelt, die nach Rostlaube riecht.'),
    n('Aria liegt halb auf dir, den Kopf auf deiner Brust, ein Bein über deinem. Deine Finger lösen ihre Zöpfe, einen nach dem anderen, weil sie dich drum gebeten hat. Das Salz hat sie steif gemacht. Ihr Haar fällt dir offen über die Hand, schwer und warm vom Feuer.'),
    a('Das hab ich noch nie jemanden machen lassen. Die Zöpfe. Nicht mal Vega.', 'zaertlich'),
    v('Ich bin vorsichtig.', 'zaertlich'),
    a('Bist du nicht. Du bist nie vorsichtig. Nur bei mir.', 'verlegen'),
    n('Sie stützt sich auf, über dir, das offene Haar wie ein Vorhang um eure Gesichter. Unter dem Vorhang ist es dunkel und warm und riecht nach Meer. Sie küsst dich, langsam, und ihre Finger finden die erste Schnalle deines noch nassen Gurtzeugs.'),
    a('Elf?', 'verlegen'),
    v('Elf.', 'verlegen'),
    a('Ich hab die ganze Nacht.', 'signatur'),
    n('Die Decke rutscht. Ihr steht auf und lauft lachend über den dunklen Strand, weg vom Feuer, hin zum alten Wagen am Dünengras, der eine Tür hat, die man zuziehen kann.'),
  ], { effects: [herz(60), set('vexaria_meer'), set('vexaria_nacht'), BESCHWINGT, { cutscene: 'rom-vexaria-meer-nacht' }] }),
]);

const meerMorgen: DialogueDef = dlg('vexaria-meer-morgen', [
  node('start', [
    n('Morgen am Meer. Sand überall, wirklich überall. Eine Möwe sitzt auf dem Wagendach und guckt durchs Fenster, als hätte sie eine Meinung.'),
    n('Aria liegt quer über dir und schnarcht wie ein Moped. Sie trägt dein Top. Du trägst ihr Kabelbrand-Shirt, mit dem roten Stern genau über deinem Herzen. Keine von euch weiß, wann das passiert ist.'),
    a('Fünf Minuten. Zehn. Für immer.', 'zaertlich'),
  ], { effects: [BESCHWINGT, herz(20)] }),
]);

// ---------------------------------------------------------------------------
// rom-aria-meer (Baukasten-Spielfigur, Kanon Station 11)

const meerKanon = (id: string, rom: boolean): DialogueDef => dlg(id, [
  node('start', [
    n('Der erste Abend am Meer. Die Sonne sinkt rot ins Wasser. Aria steht neben dir, die Stiefel schon in der Hand.'),
  ], {
    effects: STATION_START,
    choices: [
      ch('…', 'dreib', { when: ENDE_3B }),
      ch('…', 'lauf', { when: not(ENDE_3B) }),
    ],
  }),
  node('dreib', [
    a(rom ? 'Hast ganz schön lang gebraucht, Arschloch. Komm her.' : 'Hast ganz schön lang gebraucht. Komm her, du Idiot.', 'trauer'),
    n('Sie hält dich fest. Länger, als sie zugeben wird.'),
  ], { next: 'lauf' }),
  node('lauf', [
    a('WER ZUERST AM WASSER IST!', 'freude'),
    n('Sie rennt barfuß in die Brandung und streckt dir die Zerberster-Hand entgegen.'),
    a('Es ist echt! Das Meer ist echt! Ich dachte, das ist so ein Hunter-Märchen!', 'ueberrascht'),
    a('Komm rein, du Feigling. Das Salz rostet höchstens mich.', 'freude'),
    ...(rom ? [
      n('Du kommst rein. Sie zieht dich an der Hand bis zur Hüfte ins Wasser, und als die nächste Welle kommt, hält sie dich fest, damit du nicht umfällst. Oder sich selbst. Schwer zu sagen.'),
      a('Weißt du, was ich heute nicht bin? Die Brecherin. Heute bin ich nur nass.', 'zaertlich'),
      n('Sie küsst dich, salzig und warm, während hinter euch die Sonne absäuft.'),
    ] : [
      n('Sie zieht dich am Ärmel ins Wasser. Ihr geht beide unter und kommt prustend wieder hoch.'),
      a('Weißt du, was ich heute nicht bin? Die Brecherin. Heute bin ich nur nass.', 'zaertlich'),
    ]),
  ], { effects: [herz(rom ? 60 : 40), set('aria_meer'), { cutscene: 'rom-aria-meer' }] }),
]);

// ---------------------------------------------------------------------------
// Ende 2 · Nexus im Autoradio

const autoradio: DialogueDef = dlg('vexaria-ende-autoradio', [
  node('start', [
    n('Morgen am Wagenplatz. Ihr kommt aus dem alten Wagen am Dünengras, zerzaust, sandig, Aria in deinem Top. Aus der Rostlaube, Fenster offen, meldet sich das Radio.'),
    s('ki-nexus', 'Guten Morgen. Ich habe eine Beobachtung, die ich mit niemandem teilen soll, sagt Hunter. Ich teile sie trotzdem. Ich lerne gerade Unfug.', 'neutral'),
    s('ki-nexus', 'Gestern Nacht, 23:41 bis 05:52: Der Wagen am Dünengras hat sich zweihundertvierzehn Mal bewegt. Bei Windstärke null.', 'neutral'),
    a('NEXUS.', 'wut'),
    s('ki-nexus', 'Ich ziehe keine Schlüsse. Ich habe nur Daten. Die Daten ziehen die Schlüsse von allein.', 'freude'),
  ], {
    choices: [
      ch('„Lösch das.“', 'loeschen'),
      ch('„Zweihundertvierzehn? Zu wenig.“', 'zuwenig'),
      ch('Das Radio ausmachen.', 'aus'),
    ],
  }),
  node('loeschen', [
    s('ki-nexus', 'Gelöscht. Sicherungskopie angelegt. Das war ein Witz. Oder? Ich lerne noch, was ein Witz ist.', 'ueberrascht'),
  ], { next: 'ende' }),
  node('zuwenig', [
    a('VEX!', 'verlegen'),
    s('ki-nexus', 'Notiert. Ich werde heute Nacht genauer zählen.', 'neutral'),
    a('Ich schmeiß dieses Radio ins Meer. Mit dem Auto dran.', 'wut'),
  ], { effects: [herz(10)], next: 'ende' }),
  node('aus', [
    n('Du drehst den Knopf. Das Radio knackt. Dann geht es von selbst wieder an.'),
    s('ki-nexus', 'Entschuldigung. Ich wollte nur sagen: Ihr seht glücklich aus. Das ist eine Messung, kein Kompliment. Doch. Es ist ein Kompliment.', 'freude'),
  ], { effects: [{ relation: 'ki-nexus', delta: 20 }], next: 'ende' }),
  node('ende', [
    n('Aria zieht dich am Gurtriemen weg vom Auto, Richtung Wasser. Aus dem offenen Fenster summt Nexus etwas, das fast wie ein Kabelbrand-Song klingt. Falsch. Mit voller Absicht.'),
  ], { effects: [set('vexaria_autoradio')] }),
]);

// ---------------------------------------------------------------------------
// Ende 3 · Master, ohne Vex

const master: DialogueDef = dlg('vexaria-ende-master', [
  node('start', [
    n('Das Turmbüro. Die Stadt unter dir glüht in deinen Farben. Auf dem kleinen Bildschirm in der Ecke läuft das Bild, das du nicht bestellt hast: ein Strand, ein Lagerfeuer, sechs Silhouetten. Eine davon hat Zöpfe.'),
    n('Auf dem Schreibtisch liegt dein Gurtzeug. Elf Schnallen, alle zu. Du hast es seit einer Woche nicht angehabt. Der Teddyfell-Mantel ist wärmer. Er ist nur nicht deiner.'),
    n('Am Gurtzeug, auf dem Schulterriemen, ein roter Stern. Schief aufgenäht. Ausgefranst.'),
  ], {
    choices: [
      ch('Den Stern mit dem Daumen nachfahren.', 'stern', { when: flag('vexaria_aufnaeher') }),
      ch('Den Bildschirm ausmachen.', 'aus'),
      ch('Den Bildschirm anlassen.', 'an'),
    ],
  }),
  node('stern', [
    n('Der Faden ist rot und billig. Gina hätte das besser gemacht. Gina hätte nie mit dem Mund den Faden abgebissen und dabei gegen deinen Nacken geatmet.'),
  ], { next: 'an' }),
  node('aus', [
    n('Du tippst. Der Bildschirm wird schwarz. Im Schwarz siehst du dein eigenes Gesicht. Es sieht aus wie Blade. Du machst ihn wieder an.'),
  ], { next: 'an' }),
  node('an', [
    s('ki-nexus', 'Master. Eine eingehende Nachricht. Absenderin gesperrt seit sieben Tagen. Sie hat es jeden Abend versucht. Soll ich sie weiterhin abweisen?', 'neutral'),
  ], {
    choices: [
      ch('„Durchstellen.“', 'nachricht'),
      ch('„Abweisen.“', 'abweisen'),
    ],
  }),
  node('nachricht', [
    n('Rauschen. Wellen. Dann ihre Stimme, ganz nah am Mikrofon, als hätte sie es in der Hand und den Mund dran.'),
    a('(Sprachnachricht) Hey, Schrapnell. Ich weiß nicht, ob du das hörst. Wahrscheinlich hört\'s dein Scheißcomputer und lacht.', 'trauer'),
    a('(Sprachnachricht) Das Meer ist echt. Ich bin jeden Abend rein. Mit Stiefeln, wie du\'s gemacht hättest. Ich hab jeden Abend einen Kronkorken reingeworfen. Für dich. Ist nicht dasselbe.', 'trauer'),
    a('(Sprachnachricht) Ich bin immer noch so sauer, dass ich nicht schlafen kann. Und ich lieg trotzdem jede Nacht auf der linken Seite. Weil rechts dein Platz ist. Ist das nicht komplett bescheuert?', 'trauer'),
    a('(Sprachnachricht) Hunter sagt, der Platz im Wagen bleibt frei. Bis du ihn dir verdienst. Ich sag … ich sag gar nix. Komm einfach zurück. Hab ich dir mal gesagt. Gilt noch.', 'besorgt'),
    n('Die Nachricht endet mit einem Klacken. Ein Kronkorken gegen Zähne.'),
  ], { effects: [set('vexaria_master_nachricht')], next: 'ende' }),
  node('abweisen', [
    s('ki-nexus', 'Abgewiesen. Sie wird es morgen wieder versuchen. Das sagt meine Statistik. Und die Statistik hatte bei ihr noch nie Unrecht.', 'neutral'),
  ], { next: 'ende' }),
  node('ende', [
    n('Unter dir die Stadt. Neben dir ein Gurtzeug. Irgendwo, sehr weit weg, ein leerer Platz an einem Feuer, auf den jemand jeden Abend eine Muschel legt.'),
  ], { effects: [set('vexaria_ende_master')] }),
]);

const masterPhone: PhoneMessageDef[] = [
  {
    id: 'aria-vex-master-1', from: 'aria', text: 'noch ein kronkorken. achtzehn.',
    auto: all(V, MASTER, flag('vexaria_ende_master'), { time: 'abend' }),
  },
  {
    id: 'aria-vex-master-2', from: 'aria', text: 'vega sagt, ich soll aufhören. ich hör nicht auf. ich hör nie auf. weißt du doch.',
    auto: all(V, MASTER, flag('vexaria_ende_master'), seen('aria-vex-master-1'), { weekday: ['fr', 'sa'] }),
  },
  {
    id: 'aria-vex-master-3', from: 'aria', text: 'der platz rechts ist noch frei. nur damit du\'s weißt. nicht löschen.',
    auto: all(V, MASTER, flag('vexaria_ende_master'), seen('aria-vex-master-2'), { time: 'nacht' }),
  },
];

// ---------------------------------------------------------------------------
// Konzert am Strandclub (Ersatz für Station 13, wenn sie vorher nicht lief)

const konzertStrand = (id: string, rom: boolean): DialogueDef => dlg(id, [
  node('start', [
    n('Der Strandclub, Eröffnungsnacht. Treibholzbühne, Lichterketten, die im Wind schaukeln. Und auf der Bühne, mit Haaren, die grau geworden sind, und Verstärkern, die noch genauso laut sind: Kabelbrand.'),
    n('Aria steht am Rand des Sandes. Nicht vorne. Hinten. So weit hinten, wie es geht, ohne im Meer zu stehen. Ihre echte Hand zittert. Der Zerberster nicht, der kann das nicht. Er summt nur.'),
    a('Ich war seit der Nacht auf keinem Konzert. Seit der Traverse. Ich weiß nicht, ob ich … ich hör das Klappern, Vex. Jetzt schon.', 'besorgt'),
  ], {
    effects: STATION_START,
    choices: [
      ch('Ihre Hand nehmen. Nach vorne gehen. Langsam.', 'vorne'),
      ch('„Hundert Meter. Neunzig. Weißt du noch?“', 'vorne', { when: seen('rom-vexaria-oberlicht') }),
    ],
  }),
  node('vorne', [
    n('Ihr geht. Schritt für Schritt, durch die Leute, durch den Sand. Hundert Meter. Neunzig. Zehn. Erste Reihe. Der Bass schlägt euch gegen die Brust wie eine zweite Welle.'),
    n('Der Sänger sieht runter. Sieht den silbernen Arm. Hört mitten im Lied auf zu singen. Dann beugt er sich vor und reicht Aria das Mikrofon.'),
    s('kabelbrand-roadie', '(von der Bühne) Für die Roadies, die wir verloren haben. Und für die, die zurückgekommen sind.', 'trauer'),
    n('Aria singt. Falsch. Laut. Mit voller Absicht. Die ganze erste Strophe, jedes Wort, und du merkst erst nach einer Weile, dass du mitsingst. Falsch. So wie Kas.'),
    ...(rom ? [
      n('Beim letzten Refrain dreht sie sich zu dir um, mitten in der ersten Reihe, und küsst dich, während der ganze Strand brüllt. Die Lichterketten schwingen. Sie lacht in deinen Mund.'),
      a('Erste Reihe. Mit dir. Das hab ich mir nicht mal zu träumen getraut.', 'zaertlich'),
    ] : [
      n('Vega steht plötzlich neben euch und brüllt auch mit. Vega brüllt nie.'),
      a('Erste Reihe. Mit euch. Das hab ich mir nicht mal zu träumen getraut.', 'freude'),
    ]),
  ], { effects: [set('vexaria_konzert'), herz(rom ? 60 : 40), { relation: 'collin-charleston', delta: 10 }, { cutscene: 'rom-vexaria-konzert-strand-tafel' }] }),
]);

// ---------------------------------------------------------------------------
// Cutscenes

const cutscenes: CutsceneDef[] = [
  cut('rom-vexaria-meer-tafel', 'Wer zuerst am Wasser ist', [
    { image: 'cut-rom-vexaria-meer', pan: 'out', fade: 'in', hold: 3200, caption: 'Barfuß in der Brandung. Stiefel an der Wasserlinie. Eine Hand in der anderen.' },
  ]),
  cut('rom-vexaria-meer-nacht', 'Elf Schnallen, am Meer', [
    { image: 'black', fade: 'out', hold: 1800, caption: 'Eine Wagentür, die zufällt. Wellen.' },
    { image: 'black', lines: [n('Auf Schwarz nur das Meer, das kommt und geht und wiederkommt. Und irgendwann, sehr leise, ein Kichern, von dem keine von beiden je zugeben wird, dass es ihres war.')], hold: 2000 },
  ], [{ sleep: true }, { dialogue: 'vexaria-meer-morgen' }], false),
  cut('rom-aria-meer', 'Wer zuerst am Wasser ist', [
    { image: 'cut-rom-aria-meer', pan: 'out', fade: 'in', hold: 3000, caption: 'Das Meer ist echt.' },
  ]),
  cut('rom-vexaria-konzert-strand-tafel', 'Erste Reihe', [
    { image: 'cut-rom-vexaria-konzert', pan: 'in', fade: 'in', hold: 2600, caption: 'Hundert Meter. Neunzig. Erste Reihe.' },
  ]),
];

// ---------------------------------------------------------------------------
// Ereignisse

export const ENDEN_EVENTS: HeartEventDef[] = [
  // Vex: ersetzt Station 11 rom-aria-meer (markiert sie mit).
  ...twin({
    id: 'rom-vexaria-meer', hearts: 6, map: 'das-meer', time: 'abend',
    when: all(V, AM_MEER, HEUTE_FREI, not(seen('rom-aria-meer'))),
    effects: [{ markSeen: 'rom-aria-meer' }],
  }, PAAR, { cutscene: 'rom-vexaria-meer-tafel', dialogue: 'rom-vexaria-meer' }, { cutscene: 'rom-vexaria-meer-tafel', dialogue: 'rom-vexaria-meer-fs' }),
  // Baukasten-Spielfigur: Kanon Station 11.
  ...twin({
    id: 'rom-aria-meer', hearts: 6, map: 'das-meer', time: 'abend', when: all(NOT_V, AM_MEER, HEUTE_FREI),
  }, PAAR, { dialogue: 'rom-aria-meer' }, { dialogue: 'rom-aria-meer-fs' }),
  ...twin({
    id: 'rom-vexaria-konzert-strand', hearts: 6, map: 'das-meer', time: ['abend', 'nacht'],
    when: all(V, AM_MEER, HEUTE_FREI, seen('rom-vexaria-meer'), { quest: 'side-strandclub', state: 'done' },
      flag('vexaria_kas_erzaehlt'), not(seen('rom-vexaria-konzert'))),
    effects: [{ markSeen: 'rom-vexaria-konzert' }],
  }, all(PAAR, { item: 'kabelbrand-pass' }), { dialogue: 'rom-vexaria-konzert-strand' }, { dialogue: 'rom-vexaria-konzert-strand-fs' }),
  // Ende 2: Morgen nach der ersten Nacht am Meer (Herz-Ereignis, damit es auch nach dem Aufwachen am selben Ort läuft).
  {
    id: 'vexaria-ende-autoradio', hearts: 6, map: 'das-meer', time: ['morgen', 'tag'],
    when: all(V, PAAR, flag('ende_neue_nexus'), flag('vexaria_meer'), noFlag('vexaria_autoradio'), not(seen('vexaria-ende-autoradio'))),
    dialogue: 'vexaria-ende-autoradio',
    effects: [{ xp: 25 }],
  },
];

export const part: ContentPart = {
  dialogues: byId([
    meerVex('rom-vexaria-meer', true), meerVex('rom-vexaria-meer-fs', false), meerMorgen,
    meerKanon('rom-aria-meer', true), meerKanon('rom-aria-meer-fs', false),
    autoradio, master,
    konzertStrand('rom-vexaria-konzert-strand', true), konzertStrand('rom-vexaria-konzert-strand-fs', false),
  ]),
  cutscenes: byId(cutscenes),
  phone: byId(masterPhone),
  mapAdditions: {
    'blades-buero': {
      onEnter: [{
        id: 'vexaria-ende-master', when: all(V, MASTER, EPILOG, any(PAAR, flag('aria_romanze_angebahnt'), { hearts: 'aria', min: 6 })),
        dialogue: 'vexaria-ende-master',
      }],
    },
  },
};

