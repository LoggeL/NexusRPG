// sonder-letzte-runde „Die letzte Runde“ (Hunters Sonderauftrag, Rang 5): Unter der alten Bühne der Rennhalle Neun
// liegt eine Flasche Rostkai Reserve 2070. Bretter auf: [Körper 7], [Technik 6], Aria im Team, oder zwei Stunden mit
// bloßen Händen. Dann Toast am Tresen des High Voltage. Ein Glas bleibt voll stehen (Blade, Epilog-Karte).
import type { ContentPart } from '../../part';
import type { Condition, DialogueDef, Effect, QuestDef } from '../../../modules/contracts';
import { BLADE_GEFASST, BLADE_WEG, VEX, active, all, ch, chk, dlg, flag, herz, l, n, node, not, p, set, stepDone, weiter } from './_lib';

const Q = 'sonder-letzte-runde';
const AKTIV = active(Q);
const FOTO = flag('slr_foto');
const FLASCHE = flag('slr_flasche');
const TOAST = flag('slr_toast');

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: 'Sonderauftrag: Die letzte Runde',
  summary: 'Hunter hat vor Jahren eine Flasche versteckt. Für eine letzte Runde mit jemandem, der nicht mehr da ist. Oder noch nicht wieder.',
  giver: 'hunter',
  act: 2,
  steps: [
    { id: 'foto', text: 'Sieh dir das Foto mit dem Kreuz an der Fotowand im Hinterzimmer an.', done: FOTO, marker: { map: 'hv-hinterzimmer', at: 'fotowand' } },
    { id: 'flasche', text: 'Hol die Flasche unter der alten Bühne in der Rennhalle Neun hervor.', done: FLASCHE, when: stepDone(Q, 'foto'), marker: { map: 'rennhalle-9', at: 'alte-buehne' } },
    { id: 'toast', text: 'Bring die Flasche an den Tresen im High Voltage. Letzte Runde.', done: TOAST, when: stepDone(Q, 'flasche'), marker: { map: 'high-voltage', at: 'tresen' } },
  ],
  reward: { xp: 300, rep: { 'crew-hunter': 10 }, relations: { hunter: 50 } },
};

const foto: DialogueDef = dlg('slr-foto', [
  node('start', [
    n('Das Foto ist alt, die Ecken weich. Drei Leute vor einer Bühne mit Rennflaggen: ein junger Hunter mit zu viel Haargel, ein Mann im Teddymantel mit einer Flasche, und ein Mädchen mit Kapuze, das in die Kamera zeigt.'),
    n('Über den Mann mit dem Mantel hat jemand ein Kreuz gemalt. Nicht durchgestrichen. Nur ein Kreuz. Wie auf einer Schatzkarte.'),
    n('Auf der Rückseite: „Rennhalle 9, unter dem dritten Brett. Für die letzte Runde. – H. & B.“'),
    p('H. und B. Hunter und … nein. Nein, oder?'),
  ], { effects: [set('slr_foto')] }),
]);

const technik = chk('slr-bretter-technik', 'technik', 6, ['werkzeug']);
const koerper = chk('slr-bretter-koerper', 'koerper', 7, ['kraft']);
const GEFUNDEN: Effect[] = [set('slr_flasche')];
const ARIA_DA: Condition = { companion: 'aria' };

const buehne: DialogueDef = dlg('slr-buehne', [
  node('start', [
    n('Die alte Bühne der Rennhalle Neun. Verzogene Bretter, ein Vorhang, der mal rot war, und auf dem dritten Brett von links ein eingeritztes „H & B“ mit einem Blitz, den jemand später zu einem Totenkopf umgekratzt hat.'),
  ], { choices: [
    ch('Das Brett mit einem Ruck hochreißen.', 'gefunden', { check: koerper, effects: GEFUNDEN }),
    ch('Die Nägel mit dem Multitool ziehen.', 'gefunden', { check: technik, effects: GEFUNDEN }),
    ch('„Aria, machst du mal?“', 'aria', { when: all(ARIA_DA, not(VEX)), effects: [...GEFUNDEN, herz('aria', 5)] }),
    ch('„Aria. Drittes Brett. Wie damals im Proberaum.“', 'aria-vex', { when: all(ARIA_DA, VEX), effects: [...GEFUNDEN, herz('aria', 10)] }),
    ch('Brett für Brett mit bloßen Händen lösen. Das dauert.', 'muehsam', { effects: [{ advanceTime: 120 }, ...GEFUNDEN] }),
    ch('Später.'),
  ] }),
  node('aria', [
    l('aria', 'Geh mal zur Seite.', 'signatur'),
    n('Der Zerberster geht durch das Brett wie durch Pappe. Und durch das Brett darunter. Und durch ein Stück Fußboden, das dazu nichts gesagt hat.'),
  ], { next: 'gefunden' }),
  node('aria-vex', [
    l('aria', 'Damals hab ich die Bühne zerlegt, weil du den Einsatz verpennt hast. Heute aus Spaß.', 'freude'),
    n('Ein Schlag. Holz splittert. Aria schüttelt den Arm aus und grinst dich an, als wäre es 2079 und alles noch heil.'),
  ], { next: 'gefunden' }),
  node('muehsam', [n('Zwei Stunden, sieben Splitter, ein Fluch für jeden. Dann gibt das Brett auf. Du hättest es früher aufgegeben, aber du bist sturer als Holz.')], { next: 'gefunden' }),
  node('gefunden', [
    n('Darunter, in einer Kiste mit Stroh: eine Flasche. Staubig, schwer, mit einem Etikett, das fast abgefallen ist. „Rostkai Reserve 2070“. Und ein zweites Glas, eingewickelt in ein Stück Teddyfell.'),
  ]),
]);

const toast: DialogueDef = dlg('slr-toast', [
  node('start', [
    n('Du stellst die Flasche auf den Tresen. Hunter hört auf, Gläser zu polieren. Er sieht sie lange an. Dann stellt er drei Gläser hin. Eins für dich, eins für sich. Eins ohne Namen.'),
    l('hunter', 'Blade und ich haben das Ding nach unserem ersten Sieg in der Rennhalle versteckt. Wir haben gesagt: Wenn einer von uns gewinnt, so richtig, trinken wir sie zusammen.', 'trauer'),
    l('hunter', 'Dann hat er gewonnen. Und ich hab nicht mit ihm getrunken. Und dann kam die Digitech-Nacht.', 'neutral'),
  ], { choices: weiter([
    [BLADE_GEFASST, 'gefasst'],
    [BLADE_WEG, 'weg'],
    [null, 'vorher'],
  ]) }),
  node('gefasst', [l('hunter', 'Jetzt sitzt er. Ich hab gewonnen. Das ist nicht so, wie ich es mir vorgestellt habe.', 'trauer')], { next: 'glas' }),
  node('weg', [l('hunter', 'Jetzt fliegt er irgendwo da draußen rum, in einem Gleiter ohne Rückspiegel. Typisch.', 'signatur')], { next: 'glas' }),
  node('vorher', [l('hunter', 'Und jetzt sitzt er in seinem Turm und glaubt, er hätte gewonnen. Hat er nicht. Noch nicht.', 'wut')], { next: 'glas' }),
  node('glas', [
    n('Er schenkt zwei Gläser voll. Das dritte auch. Dann stellt er es ans Ende des Tresens, unter das Foto von damals.'),
    l('hunter', 'Das bleibt stehen. Für den Tag, an dem er wieder ein Mensch ist. Oder für nie. Mal sehen, was zuerst kommt.', 'zaertlich'),
  ], { choices: [
    ch('„Auf die letzte Runde.“', 'ende', { effects: [set('slr_toast')] }),
    ch('„Auf dich, Hunter. Nicht auf ihn.“', 'ende', { effects: [set('slr_toast'), herz('hunter', 10)] }),
  ] }),
  node('ende', [n('Ihr stoßt an. Der Rostkai schmeckt nach Rauch, Benzin und etwas, das du nicht benennen kannst. Hunter sagt, das ist Wehmut. Er sagt, sie wird mit dem Alter besser.')]),
]);

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: Object.fromEntries([foto, buehne, toast].map((d) => [d.id, d])),
  mapAdditions: {
    'hv-hinterzimmer': {
      hotspots: [{ id: 'slr-foto', at: 'fotowand', radius: 40, label: 'Foto mit Kreuz', kind: 'look', dialogue: foto.id, when: all(AKTIV, not(FOTO)) }],
    },
    'rennhalle-9': {
      hotspots: [{ id: 'slr-buehne', at: 'alte-buehne', radius: 46, label: 'Das dritte Brett', kind: 'use', dialogue: buehne.id, when: all(AKTIV, FOTO, not(FLASCHE)) }],
    },
    'high-voltage': {
      hotspots: [{ id: 'slr-toast', at: 'tresen', radius: 44, label: 'Letzte Runde', kind: 'use', dialogue: toast.id, when: all(AKTIV, FLASCHE, not(TOAST)) }],
    },
  },
};


