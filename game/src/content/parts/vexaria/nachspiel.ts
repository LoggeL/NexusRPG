// Vex × Aria im Nachspiel (`epilog`): Alltag als Paar. Tagesgesprächs-Pool, kleine Szenen und ein Ausblick.
//   `vexaria-alltag-zaehne` (das-meer, morgens): Zähneputzen am Wasserhahn hinter dem Strandclub.
//   `vexaria-alltag-rate` (ripper-praxis, montags): die letzte Rate für Vex' Arm.
//   `vexaria-alltag-schluessel` (loetgassen, abends): ein Schlüssel fürs Rolltor der Kurierbude.
//   `aria-vex-strandnacht` (Tagesgespräch nachts am Meer, einmal pro Woche `vexaria_strand_woche`): Lagerfeuer → Abblende.
//   `vexaria-ausblick` (das-meer, Steg, nach mindestens zwei Alltagsszenen): Pläne. Abschluss des Strangs.
// Gilt nicht in Ende 3 ohne 3b (dort ist Aria fort, siehe enden.ts).
import type { ContentPart } from '../../part';
import type { Condition, CutsceneDef, DialogueDef, DialogueLine, HeartEventDef, TalkDef } from '../../../modules/contracts';
import {
  a, all, any, BESCHWINGT, byId, ch, cut, dlg, EPILOG, flag, herz, n, node, noFlag, not, R, s, seen, set, V, v, ZUSAMMEN,
} from './_util';

const PAAR: Condition = all(R, ZUSAMMEN);
const DA: Condition = all(V, PAAR, EPILOG, any(not(flag('ende_master')), flag('ende_doch_noch_meer')));

// ---------------------------------------------------------------------------
// Tagesgespräche im Nachspiel

const ZEILEN: DialogueLine[][] = [
  [a('Guten Morgen, Postbotin. Du hast Sand in den Ohren. Ich hab nachgeguckt. Mit der Zunge.', 'verlegen')],
  [a('Hunter will, dass wir den Strandclub abends abschließen. Ich hab gesagt, wir sind zu beschäftigt. Er hat nicht gefragt, womit. Kluger Mann.', 'signatur')],
  [a('Du hast heute Nacht im Schlaf „Zugestellt“ gesagt. Und dann meinen Namen. In der Reihenfolge. Ich bin mir nicht sicher, ob ich beleidigt bin.', 'freude')],
  [a('Der Zerberster quietscht vom Salz. Dante sagt, Öl. Ich sag, du. Du hast so schöne Hände für Öl.', 'verlegen')],
  [v('Wo willst du hin?', 'neutral'), a('Nirgends. Das ist das Geile. Ich muss nirgends hin. Ich muss nur hier sein. Mit dir. Und \'nem Bier.', 'zaertlich')],
  [a('Ich hab dir einen Kronkorken an den Wagen geklebt. Und einen ans Gurtzeug. Und einen an deinen Stiefel. Du gehörst jetzt offiziell mir. Steht auf den Kronkorken.', 'signatur')],
  [a('Weißt du, was komisch ist? Ich träum gar nicht mehr. Kein Klappern, keine Traverse. Ich schlaf einfach. Weil du schnarchst. Das übertönt alles.', 'zaertlich'), v('Ich schnarch nicht.', 'wut'), a('Du schnarchst wie ein Kompressor. Ein süßer Kompressor.', 'freude')],
  [a('Wenn du heute wieder joggen gehst, am Strand, um sechs, mit nacktem Oberarm, dann komm ich mit. Nicht zum Joggen. Zum Gucken.', 'verlegen')],
  [a('Vega hat gesagt, wir sind ekelhaft. Ich hab gesagt, danke. Sie hat gesagt, das war kein Kompliment. Ich hab gesagt, doch.', 'freude')],
  [v('Bleibst du heute?', 'verlegen'), a('Ich bleib jeden Tag. Frag das nicht mehr. Doch, frag. Ich hör\'s gern.', 'zaertlich')],
];

const zeilen: DialogueDef[] = ZEILEN.map((l, i) => dlg(`aria-vex-epilog-${i + 1}`, [node('start', l)]));
const zeilenTalk: TalkDef[] = ZEILEN.map((_, i) => {
  const days: number[] = [];
  for (let d = i + 1; d <= 28; d += ZEILEN.length) days.push(d);
  return { dialogue: `aria-vex-epilog-${i + 1}`, when: all(DA, { cycleDay: days }) };
});

const strandFrage: DialogueDef = dlg('aria-vex-strandnacht', [
  node('start', [
    a('Feuer ist noch an. Hunter schläft. Die Decke ist frei. Ich mein ja nur.', 'verlegen'),
  ], {
    choices: [
      ch('„Decke.“', 'feuer', { effects: [set('vexaria_strand_woche')] }),
      ch('„Morgen.“', undefined, { effects: [set('vexaria_strand_woche')] }),
    ],
  }),
  node('feuer', [
    n('Das Lagerfeuer knackt. Funken steigen in einen Himmel, der hier so viele Sterne hat, dass es fast unhöflich ist. Ihr liegt unter der Decke, die nach Rostlaube riecht, ihr Kopf auf deinem Arm, deinem echten, deine Metallhand auf ihrer Hüfte.'),
    a('Zähl mal die Sterne.', 'zaertlich'),
    v('Zu viele.', 'neutral'),
    a('Dann zähl meine Sommersprossen. Die sind weniger. Aber du musst nah ran.', 'verlegen'),
    n('Du gehst nah ran. Du zählst. Mit den Lippen, eine nach der anderen, Nasenrücken, Wange, Kinn, und bei siebzehn verzählst du dich absichtlich und fängst von vorne an. Sie lacht, dann lacht sie nicht mehr. Ihre Finger sind in deinem Gurtzeug, an der ersten Schnalle.'),
    a('Siebzehn. Du warst bei siebzehn.', 'verlegen'),
    v('Ich fang lieber noch mal an.', 'zaertlich'),
  ], { effects: [herz(10), BESCHWINGT, { cutscene: 'vexaria-strandnacht' }] }),
]);

const strandMorgen: DialogueDef = dlg('vexaria-strandnacht-morgen', [
  node('start', [
    n('Morgengrauen am Lagerfeuer. Die Glut ist grau. Die Decke ist voller Sand. Hunter steht über euch mit zwei Kaffee und einer Sonnenbrille, hinter der er sehr bewusst nicht hinguckt.'),
    s('hunter', 'Keine Turteleien an meinem Strand. … Na gut. Eine. Pro Nacht. Kaffee?', 'signatur'),
  ]),
]);

// ---------------------------------------------------------------------------
// Alltagsszenen

const zaehne: DialogueDef = dlg('vexaria-alltag-zaehne', [
  node('start', [
    n('Früher Morgen hinter dem Strandclub. Ein Wasserhahn an einem Pfahl, ein Spiegel mit Sprung, zwei Zahnbürsten in einem Kronkorken-Glas. Aria steht schon da, in deinem Top, Schaum bis zum Kinn.'),
    a('Mmpf. Du bist zu spät. Ich bin schon bei den Backenzähnen.', 'freude'),
    n('Du stellst dich neben sie. Schulter an Schulter. Ihr putzt. Im Spiegel siehst du zwei Frauen mit Sand im Haar, Schaum im Mundwinkel und einem Grinsen, das nicht weggehen will.'),
  ], {
    choices: [
      ch('Ihr Schaum auf die Nase tupfen.', 'schaum', { effects: [herz(10)] }),
      ch('Ihre Zahnbürste nehmen. Aus Versehen. Absichtlich.', 'buerste', { effects: [herz(10)] }),
    ],
  }),
  node('schaum', [
    a('DU –', 'wut'),
    n('Sie revanchiert sich mit einer ganzen Handvoll. Dann mit dem Wasserhahn. Hunter, der gerade mit der Zeitung vorbeikommt, dreht sofort wieder um.'),
  ], { next: 'ende' }),
  node('buerste', [
    a('Das ist meine. Die gelbe ist meine. Die blaue ist deine. Das haben wir besprochen.', 'wut'),
    v('Die schmeckt nach dir.', 'signatur'),
    a('… Das ist das Ekelhafteste und Romantischste, was je einer gesagt hat. Behalt sie. Ich nehm deine.', 'verlegen'),
  ], { next: 'ende' }),
  node('ende', [
    n('Danach küsst sie dich. Pfefferminz und Salz. Ihr kommt beide zu spät zum Frühstück, und keiner fragt, warum.'),
  ], { effects: [set('vexaria_alltag_zaehne')] }),
]);

const rate: DialogueDef = dlg('vexaria-alltag-rate', [
  node('start', [
    n('Montag. Rippers Praxis. Die Glocke an der Tür klingelt, du legst die Credits für die Wochenrate auf den Tresen, wie seit Jahren. Ripper schiebt sie zurück.'),
    s('ripper', 'Bezahlt, Schätzchen. Alle. Bis zur letzten.', 'neutral'),
    v('Von wem.', 'ueberrascht'),
    s('ripper', 'Von einer gewissen Brecherin, die mir einen Haufen Bargeld hingeknallt hat und dazu einen Satz, den ich meiner Mutter nicht erzählen kann. Und eine Drohung mit dem Zerberster. Sehr kreativ. Ich hab mitgeschrieben.', 'signatur'),
    s('ripper', 'Der Arm gehört dir. Glückwunsch. Ich schick trotzdem \'ne Rechnung. Aus Gewohnheit.', 'freude'),
    n('Du stehst draußen vor der Praxis und guckst deinen schwarzen Arm an. Die Finger. Das Gelenk. Rippers Naht. Er gehört dir. Er hat dir nie gehört, und jetzt gehört er dir.'),
    n('Dein Telefon brummt.'),
    a('(Nachricht) Montag. Keine Rate. Dafür heute Abend Armdrücken. Wer verliert, macht das Frühstück. Ich verlier absichtlich.', 'freude'),
  ], { effects: [set('vexaria_raten_bezahlt'), set('vexaria_alltag_rate'), herz(30)] }),
]);

const schluessel: DialogueDef = dlg('vexaria-alltag-schluessel', [
  node('start', [
    n('Die Lötgassen, Abend. Die Kurierbude ist noch da, wie du sie zurückgelassen hast: Kronkorken an der Tür, eine Matratze, eine Kiste, ein Pass an der Wand. Aria lehnt am Rolltor und tut so, als würde sie warten, obwohl sie wartet.'),
    a('Wir pendeln jetzt, oder? Meer am Wochenende, Stadt unter der Woche. Wie reiche Leute. Nur ohne Geld.', 'freude'),
    n('Du ziehst etwas aus der Westentasche. Ein Schlüssel an einem Schlüsselring aus einem verbogenen Kronkorken. Für das Vorhängeschloss am Rolltor. Das Schloss, das du seit Kas niemandem gegeben hast.'),
    v('Für die Bude.', 'verlegen'),
    a('…', 'ueberrascht'),
    a('Du hast nie jemandem einen Schlüssel gegeben. Du hast mir erzählt, du hast nicht mal Kas einen gegeben, weil er durch das Dach gekommen ist.', 'zaertlich'),
    v('Du kommst nicht durchs Dach. Du bist zu laut.', 'signatur'),
    a('Ich bin GENAU richtig laut.', 'verlegen'),
    n('Sie nimmt den Schlüssel mit dem Zerberster, ganz vorsichtig zwischen zwei silbernen Fingern, als wär er aus Glas. Dann schließt sie das Rolltor auf, obwohl es offen ist, nur um zu hören, wie es klickt. Dann zieht sie dich rein.'),
  ], { effects: [set('vexaria_alltag_schluessel'), herz(40), { give: 'aria-kronkorken' }] }),
]);

const ausblick: DialogueDef = dlg('vexaria-ausblick', [
  node('start', [
    n('Der Steg am Meer, spät. Die Planken knarzen. Ihr sitzt am Ende, die Beine über dem Wasser, Aria barfuß, du in Stiefeln, weil manche Dinge sich nicht ändern. Unten schwimmt die Blechkrabbe vorbei und sortiert Algen.'),
    a('Hunter hat gefragt, was wir jetzt machen. So mit Leben und allem. Ich hab gesagt, weiß ich nicht. Ich wollt\'s dich zuerst fragen.', 'neutral'),
  ], {
    choices: [
      ch('„Kurierdienst. Stadt bis Meer. Zwei Leute. Eine schnell, eine laut.“', 'kurier'),
      ch('„Bude am Strand. Eine Tür. Ein Schloss. Zwei Schlüssel.“', 'bude'),
      ch('„Weiß nicht. Ist das erste Mal, dass ich nicht weiß, wohin. Fühlt sich gut an.“', 'offen'),
    ],
  }),
  node('kurier', [
    a('„Schrapnell & Zerberster, Express-Zustellung.“ Mit Kronkorken als Logo. Und ich mach die Mahnungen.', 'signatur'),
    v('Du machst die Mahnungen mit der Mülltonne.', 'freude'),
    a('Ist effizient.', 'freude'),
  ], { effects: [set('vexaria_ausblick_kurier')], next: 'ende' }),
  node('bude', [
    a('Mit \'nem Fenster aufs Meer. Und einem Boxsack. Und einem Bett, in das wir beide quer passen.', 'zaertlich'),
    v('Breites Bett.', 'verlegen'),
    a('SEHR breites Bett.', 'verlegen'),
  ], { effects: [set('vexaria_ausblick_bude')], next: 'ende' }),
  node('offen', [
    a('Ja. Ja, fühlt sich gut an. Als hätte keiner was bestellt, und trotzdem kommt was an.', 'zaertlich'),
  ], { effects: [set('vexaria_ausblick_offen')], next: 'ende' }),
  node('ende', [
    n('Sie lehnt sich an dich. Das Meer kommt und geht und kommt wieder. Es hält nicht an. Es kommt nur immer zurück.'),
    a('Weißt du, was ich glaub? Kas hätte das hier gemocht. Er hätte falsch gesungen. Und dich ausgelacht, weil du in Stiefeln am Meer sitzt.', 'zaertlich'),
    v('Und dann hätt er dich adoptiert.', 'zaertlich'),
    a('Nach drei Tagen.', 'freude'),
    v('Nach einem.', 'zaertlich'),
    n('Ihr bleibt sitzen, bis die Sterne verblassen. Zwei Frauen am Ende eines Stegs. Eine dreht sich zur anderen um. Wer, ist egal. Es ist immer beide.'),
  ], { effects: [set('vexaria_ausblick'), herz(50), BESCHWINGT] }),
]);

// ---------------------------------------------------------------------------

const cutscenes: CutsceneDef[] = [
  cut('vexaria-strandnacht', 'Sommersprossen', [
    { image: 'black', fade: 'out', hold: 1600, caption: 'Funken. Sterne. Eine Decke, die über den Kopf rutscht.' },
  ], [{ sleep: true }, { dialogue: 'vexaria-strandnacht-morgen' }], false),
];

const ALLTAG_GESEHEN: Condition = { atLeast: [flag('vexaria_alltag_zaehne'), flag('vexaria_alltag_rate'), flag('vexaria_alltag_schluessel'), seen('rom-vexaria-konzert')], min: 2 };

export const NACHSPIEL_EVENTS: HeartEventDef[] = [
  {
    id: 'vexaria-alltag-zaehne', hearts: 6, map: 'das-meer', time: 'morgen',
    when: all(DA, seen('rom-vexaria-meer'), noFlag('vexaria_alltag_zaehne')),
    dialogue: 'vexaria-alltag-zaehne',
    effects: [{ xp: 15 }],
  },
  {
    id: 'vexaria-alltag-schluessel', hearts: 6, map: 'loetgassen', time: ['abend', 'nacht'],
    when: all(DA, seen('rom-vexaria-meer'), noFlag('vexaria_alltag_schluessel')),
    dialogue: 'vexaria-alltag-schluessel',
    effects: [{ xp: 15 }],
  },
  {
    id: 'vexaria-ausblick', hearts: 6, map: 'das-meer', time: 'nacht',
    when: all(DA, ALLTAG_GESEHEN, not(seen('vexaria-ausblick'))),
    dialogue: 'vexaria-ausblick',
    effects: [{ xp: 50 }],
  },
];

/** Für aria.ts: Tagesgespräche im Nachspiel (vor den allgemeinen Pools). */
export const NACHSPIEL_TALK: TalkDef[] = [
  { dialogue: 'aria-vex-strandnacht', when: all(DA, { time: 'nacht' }, noFlag('vexaria_strand_woche'), seen('rom-vexaria-meer')) },
  ...zeilenTalk,
];

export const part: ContentPart = {
  dialogues: byId([...zeilen, strandFrage, strandMorgen, zaehne, rate, schluessel, ausblick]),
  cutscenes: byId(cutscenes),
  mapAdditions: {
    'ripper-praxis': {
      onEnter: [{
        id: 'vexaria-alltag-rate', when: all(DA, { weekday: 'mo' }, seen('rom-vexaria-meer'), noFlag('vexaria_alltag_rate')),
        dialogue: 'vexaria-alltag-rate',
      }],
    },
  },
};
