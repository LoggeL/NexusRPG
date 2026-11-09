// side-xions-kralle · „Venomkralle“ (world.md §6.3 Nr. 37). Xion („Ich bin nicht dumm. Ich weiß, wer du bist.“) ·
// hafenkante, Schrottring (Spot alte-arena) · Sa N.
// Start: Xions Gesprächswahlen (npc-quantum/xion-venom.ts) oder hier seine Nachricht.
// Schritte: Training bei Aria (Boxsack, A/N) oder Raven (Crew-Quartier) – optional, Ringtraining Reflexe +1 für 7 Tage
// auf Flucht/Konter → Duell → Siegerehrung.
// Lösungen: Kampf enc-ring-xion · gc-96 [Reflexe 8] Konter (Kralle zwei Runden weg, zählt als Sieg) · dienstplan-2079
// vor Publikum (Xion verlässt den Ring, xion_fehlt) · gc-97 [Ausstrahlung 7] Blades Spott (Xion ♥ +150, kein Sieg) ·
// Handschuh manipulieren: [Technik 6] unentdeckt, sonst entdeckt (Ruf unterstadt −10).
// Belohnung: 300 XP, 500 Cr; arme-venomkralle nur bei Sieg.
import type { ContentPart } from '../../part';
import type { Condition, DialogueDef, QuestDef } from '../../../modules/contracts';
import {
  active, AKT2, all, any, byId, ch, chk, COUNTDOWN, dlg, flag, herz, inactive, item, l, msg, n, noFlag, node, NOT_VEX, p,
  phone, set, VEX, won, zeit,
} from './_lib';

const Q = 'side-xions-kralle';
const X = 'xion-venom';
const A = 'aria';
const R = 'raven';

const SIEG: Condition = any(won('enc-ring-xion'), flag('xk_sieg'));
const ENTSCHIEDEN: Condition = any(SIEG, flag('xk_dienstplan'), flag('xk_respekt'));
const RINGNACHT: Condition = all({ weekday: 'sa' }, zeit('nacht'));

const BUFF = {
  checkBuff: {
    id: 'xk-ringtraining', label: 'Ringtraining', value: 1, attribute: 'reflexe' as const, tags: ['flucht'], forDays: 7, consumes: false,
  },
};

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: 'Venomkralle',
  summary: 'Xion Venom will es wissen: eins gegen eins im Schrottring an der Hafenkante, mit Schockhandschuhen. Samstagnacht.',
  giver: X,
  act: 2,
  steps: [
    {
      id: 'training', optional: true,
      text: 'Optional: Vor dem Duell trainieren. Aria am Boxsack der Hafenkante (abends, nachts) oder Raven im Crew-Quartier.',
      done: any(flag('xk_trainiert'), ENTSCHIEDEN), marker: { map: 'hafenkante', at: 'boxsack' },
    },
    {
      id: 'duell', text: 'Samstagnacht: Duell gegen Xion im Schrottring an der Hafenkante.',
      done: ENTSCHIEDEN, marker: { map: 'hafenkante', at: 'alte-arena' },
    },
    {
      id: 'ehrung', text: 'Nach dem Duell: am Ring abholen, was dir zusteht.',
      when: ENTSCHIEDEN, done: flag('xk_abschluss'), marker: { map: 'hafenkante', at: 'alte-arena' },
    },
  ],
  reward: { xp: 300, credits: 500 },
};

// ---------------------------------------------------------------------------------------------- Training

const trainingAria: DialogueDef = dlg('xk-training-aria', [
  node('start', [
    n('Aria hängt am Boxsack, als hätte er ihr Geld geschuldet. Der Zerberster summt bei jedem Schlag, der Sack quietscht an seiner Kette.'),
    l(A, 'Xion? Im Ring? Mit Schockhandschuhen? Haha. Der Typ hat eine Kralle wie ein Dosenöffner und das Hirn von einem Dosenöffner.', 'freude'),
    l(A, 'Er schlägt immer zuerst mit links. Immer. Weil die Kralle rechts ist und er will, dass du auf die Kralle guckst. Guck nicht auf die Kralle. Guck auf seine Schulter.', 'signatur'),
  ], {
    choices: [
      ch('„Zeig’s mir.“', 'training', { when: NOT_VEX }),
      ch('„Zeig’s mir. Und hör auf, so zu grinsen.“', 'vex', { when: VEX }),
      ch('„Später.“'),
    ],
  }),
  node('training', [
    n('Eine Stunde lang. Aria spielt Xion, mit einem Besenstiel als Kralle und einem Akzent, den sie für einen Quantum-Akzent hält. Du landest dreimal auf dem Hintern. Beim vierten Mal weichst du aus.'),
    l(A, 'Na bitte. Und jetzt: nicht stolz sein. Stolz sein ist, wie man eine Kralle ins Gesicht kriegt.', 'freude'),
  ], { effects: [BUFF, set('xk_trainiert'), herz(A, 30), { advanceTime: 60 }, msg('Ringtraining: Reflexe +1 für Konter, sieben Tage lang.')] }),
  node('vex', [
    l(A, 'Ich grinse nicht. Ich freu mich nur, dass die Postbotin mal von MIR was lernt. Statt immer nur Pakete zu bringen.', 'zaertlich'),
    n('Eine Stunde lang. Aria ist näher dran als nötig, wenn sie dir die Schulter einrenkt. Du sagst nichts. Sie auch nicht. Dann haut sie dich mit dem Besenstiel um und lacht.'),
    l(A, 'Wenn er dich trifft, hau ich ihn hinterher. Nur damit du’s weißt. Das ist keine Drohung. Das ist ein Service.', 'signatur'),
  ], { effects: [BUFF, set('xk_trainiert'), herz(A, 40), { advanceTime: 60 }, msg('Ringtraining: Reflexe +1 für Konter, sieben Tage lang.')] }),
]);

const trainingRaven: DialogueDef = dlg('xk-training-raven', [
  node('start', [
    n('Raven steht an der Pinnwand und hat schon einen Zettel mit „XION“ draufgeheftet. Darunter: drei Fotos, zwei Zeitungsausschnitte und eine Skizze seiner Kralle mit Pfeilen.'),
    l(R, 'Ich hab ihn studiert. Er ist ein Muster. Alle Wachleute sind Muster. Er wird am Anfang drei Mal antäuschen, dann vorspringen, und wenn du ausweichst, wird er wütend und vergisst die Deckung.', 'neutral'),
    l(R, 'Wir üben das. Ich bin Xion. Ich bin sehr wütend.', 'signatur'),
  ], {
    choices: [
      ch('„Los.“', 'training'),
      ch('„Ein andermal.“'),
    ],
  }),
  node('training', [
    n('Raven ist ein schrecklicher Xion. Sie ist zu schnell, zu leise und zu klug. Aber sie täuscht dreimal an und springt dann vor, genau wie sie es angekündigt hat. Nach einer Stunde weißt du, wann du ausweichen musst. Und dass Raven sehr harte Ellbogen hat.'),
    l(R, 'Gut. Wenn du gewinnst, lädst du mich auf ein Bier ein. Wenn du verlierst, lade ich dich ein. Und lache.', 'freude'),
  ], { effects: [BUFF, set('xk_trainiert'), herz(R, 30), { advanceTime: 60 }, msg('Ringtraining: Reflexe +1 für Konter, sieben Tage lang.')] }),
]);

// ---------------------------------------------------------------------------------------------- Duell

const ring: DialogueDef = dlg('xk-ring', [
  node('start', [
    n('Der Schrottring am Pier: vier Ölfässer, vier Pfosten, zwischen ihnen Stromseile, die knistern, wenn jemand dagegen spuckt. Die halbe Hafenkante steht drumherum, Bierdosen in der Hand, Wettscheine in der anderen. Ein Buchmacher ruft Quoten aus. Deine sind beleidigend.'),
    l(X, 'Da bist du ja. Ich bin nicht dumm. Ich wusste, dass du kommst.', 'signatur'),
    l(X, 'Schockhandschuhe. Eins gegen eins. Wer liegen bleibt, verliert. Ich hab die Regeln aufgeschrieben. Auf einen Zettel. Er hat eine Überschrift.', 'wut'),
  ], {
    choices: [
      ch('Handschuhe an. Rein in den Ring.', 'kampf'),
      ch('Ihn kommen lassen. Auf die Schulter gucken, nicht auf die Kralle. Und kontern.', 'konter', { check: 'gc-96' }),
      ch('Den Dienstplan von 2079 hochhalten. So, dass alle ihn sehen.', 'dienstplan', { requires: item('dienstplan-2079') }),
      ch('„Blade hält dich für die grobe Arbeit. Nicht fürs Denken. Das weißt du, oder?“', 'blade', { check: 'gc-97' }),
      ch('Vorher in der Kabine kurz an seinem Handschuh rumschrauben.', 'handschuh', { when: noFlag('xk_handschuh_versucht') }),
      ch('„Nicht heute.“'),
    ],
  }),
  node('kampf', [
    n('Der Buchmacher schlägt mit einem Schraubenschlüssel gegen ein Ölfass. Gong.'),
  ], { effects: [{ battle: 'enc-ring-xion' }] }),
  node('konter', [
    n('Er täuscht an. Einmal, zweimal, dreimal. Dann springt er, die Kralle vorn, und du siehst es kommen, an der Schulter, bevor er es selbst weiß.'),
    n('Ausweichen. Ducken. Ein Schockhandschuh voll in die Kralle. Es knallt, es blitzt, und die Venomkralle hängt plötzlich schlaff an seinem Arm wie ein nasser Regenschirm. Sie zuckt. Sie raucht. Sie macht zwei Runden lang gar nichts.'),
    n('Zwei Runden sind lang, wenn man sie richtig nutzt. Du nutzt sie richtig.'),
    l(X, 'Das … das war … ich war abgelenkt. Von der Kralle. Die ist kaputt. Die war vorher schon kaputt.', 'wut'),
  ], { effects: [set('xk_konter'), set('xk_sieg'), msg('Xion geht zu Boden. Die Hafenkante tobt.')] }),
  node('dienstplan', [
    n('Du ziehst den Zettel aus der Jacke und hältst ihn hoch. Ein alter Quantum-Dienstplan. Rennhalle 9, Abschiedskonzert Kabelbrand, Nacht des Unfalls. Ein Name durchgestrichen. Jemand aus der ersten Reihe liest laut vor: „Xion Venom.“'),
    n('Es wird still am Ring. Sehr still. Irgendwer lässt eine Dose fallen.'),
    l(X, 'Woher hast du … Ich hatte Dienst. Ich hätte Dienst gehabt. Ich hab getauscht. Ich wollte zu einem Date. Sie ist nicht gekommen. Und dann …', 'trauer'),
  ], {
    choices: [
      ch('Weiter.', 'dienstplan-vex', { when: VEX }),
      ch('Weiter.', 'dienstplan-ende', { when: NOT_VEX }),
    ],
  }),
  node('dienstplan-vex', [
    p('Aria lag unter der Traverse. Starkstrom. Wo warst du? Wo war die Absperrung, die du hättest prüfen sollen?', 'wut'),
    l(X, 'Ich … ich weiß, wer sie ist. Ich weiß es. Ich hab sie im Krankenhaus gesehen. Ich bin nicht reingegangen.', 'trauer'),
  ], { next: 'dienstplan-ende' }),
  node('dienstplan-ende', [
    n('Xion zieht die Handschuhe aus. Langsam. Er legt sie auf das Ölfass, steigt durch die Stromseile, ohne auf das Knistern zu achten, und geht. Durch die Menge, die ihm Platz macht. Keiner lacht.'),
    l('narrator', 'Der Buchmacher: „Äh. Kampflos. Das zählt. Das zählt doch? Ich sag, das zählt.“'),
  ], { effects: [set('xk_dienstplan'), set('xion_fehlt'), { take: 'dienstplan-2079' }, msg('Xion hat den Ring verlassen. Ob er wiederkommt, weiß keiner.')] }),
  node('blade', [
    n('Xion bleibt stehen, mitten in der Bewegung. Die Kralle schwebt in der Luft.'),
    l(X, 'Was?', 'ueberrascht'),
    p('Du schreibst Meldungen. Dreimal. Mit zu vielen Ausrufezeichen. Keiner liest sie. Du bist für Blade ein Hund mit Kralle. Und du kämpfst hier für ihn, als würde er zugucken.'),
    n('Er sieht in die Menge. Kein Blade. Natürlich kein Blade. Nur Hafenarbeiter mit Bier und eine Frau, die ein Baby füttert.'),
    l(X, 'Er guckt nicht zu. Er guckt nie zu.', 'trauer'),
    l(X, 'Ich bin nicht dumm. Ich bin nur … ich bin müde. Der Wechsel um eins ist Mist.', 'trauer'),
    n('Er setzt sich auf das Ölfass. Die Handschuhe auf den Knien. Die Menge buht, dann wird sie leiser, dann setzt sich einer neben ihn und gibt ihm ein Bier.'),
  ], { effects: [set('xk_respekt'), herz(X, 150), msg('Xion kämpft heute nicht mehr. Aus einem Rivalen wird jemand, der nachdenkt.')] }),
  node('handschuh', [
    n('Die Kabine ist ein umgebauter Toilettencontainer. Xions Schockhandschuhe hängen an einem Haken, die Kontakte glänzen, der Akku summt. Er ist gerade draußen und lässt sich bejubeln.'),
  ], {
    choices: [
      ch('Den Akku so umpolen, dass er erst nach dem ersten Treffer stirbt.', 'handschuh-gut', { check: chk('xk-handschuh', 'technik', 6, ['hacken']) }),
      ch('Einfach irgendein Kabel rausreißen.', 'handschuh-schlecht'),
      ch('Lieber nicht.', 'start'),
    ],
  }),
  node('handschuh-gut', [
    n('Zwei Schrauben, ein Kabel, eine Lötstelle mit dem Feuerzeug. Niemand sieht es. Xion zieht die Handschuhe an, schlägt die Fäuste zusammen, es knistert prächtig.'),
    n('Erster Schlag: Er trifft. Dann ein Puff, ein Rauchwölkchen, und seine Handschuhe sind zwei Topflappen. Du nicht.'),
    l(X, 'Was … was ist das? Das ist Sabotage! Das ist … ich kann das nicht beweisen. Verdammt.', 'wut'),
  ], { effects: [set('xk_handschuh_versucht'), set('xk_manipuliert'), set('xk_sieg'), msg('Xion geht zu Boden. Keiner hat was gemerkt.')] }),
  node('handschuh-schlecht', [
    n('Du reißt ein Kabel raus. Es funkt. Laut. Die Kabinentür geht auf, und der Buchmacher sieht dich mit einem roten Draht in der Hand vor Xions Handschuhen stehen.'),
    l('narrator', 'Buchmacher: „BETRUG! Leute! Hier will einer bescheißen!“'),
    n('Pfiffe. Eine Bierdose fliegt. Xion lacht, wirft die kaputten Handschuhe weg und zieht ein Ersatzpaar an. Der Kampf findet trotzdem statt. Nur jetzt hasst dich der ganze Pier.'),
  ], { effects: [set('xk_handschuh_versucht'), set('xk_entdeckt'), { rep: 'unterstadt', delta: -10 }], next: 'kampf' }),
]);

// ---------------------------------------------------------------------------------------------- Siegerehrung

const ehrung: DialogueDef = dlg('xk-ehrung', [
  node('start', [
    n('Nach dem Duell. Der Ring ist leer bis auf Bierdosen und Wettscheine. Der Buchmacher zählt Scheine in eine Blechdose und sieht dich an, als wärst du ein Steuerbescheid.'),
  ], {
    choices: [
      ch('Weiter.', 'sieg', { when: SIEG }),
      ch('Weiter.', 'dienstplan', { when: all({ not: SIEG }, flag('xk_dienstplan')) }),
      ch('Weiter.', 'respekt', { when: all({ not: SIEG }, noFlag('xk_dienstplan'), flag('xk_respekt')) }),
    ],
  }),
  node('sieg', [
    l(X, 'Okay. Okay. Du hast gewonnen. Ich bin nicht dumm, ich hab’s gemerkt.', 'wut'),
    n('Er schraubt an seinem Unterarm. Ein Klick, ein Zischen, und er hält dir die Venomkralle hin, ausgebaut, noch warm.'),
    l(X, 'Ring-Regel. Wer verliert, gibt das Teil ab, mit dem er angegeben hat. Die Regel hab ich auch geschrieben. Ich bereue sie sehr.', 'trauer'),
    l(X, 'Ripper baut mir eine neue. Eine bessere. Mit Leuchtstreifen.', 'signatur'),
  ], { effects: [{ give: 'arme-venomkralle' }, { rep: 'unterstadt', delta: 5 }], next: 'ende' }),
  node('dienstplan', [
    l('narrator', 'Buchmacher: „Kampflos ist kampflos. Hier, dein Anteil. Und der Kerl ist weg. Hat seine Kralle mitgenommen. Hat gesagt, er nimmt Urlaub. Wachleute nehmen nie Urlaub.“'),
  ], { next: 'ende' }),
  node('respekt', [
    l(X, 'Du hättest mich auch verprügeln können. Hast du nicht.', 'neutral'),
    l(X, 'Ich weiß immer noch, wer du bist. Aber jetzt weiß ich auch, wer ich bin. Glaube ich. Ein müder Wachmann mit zu vielen Ausrufezeichen.', 'trauer'),
    l(X, 'Die Kralle behalt ich. Aber du kriegst die Wette. Ich hab auf dich gesetzt. Kurz vorher. Ich bin nicht dumm.', 'signatur'),
  ], { next: 'ende' }),
  node('ende', [
    n('Der Buchmacher drückt dir einen dicken Umschlag in die Hand. Es riecht nach Fisch und Wettschulden.'),
  ], { effects: [set('xk_abschluss')] }),
]);

// ---------------------------------------------------------------------------------------------- Telefon

const phones = [
  phone('xk-herausforderung', X, 'Ich bin nicht dumm. Ich weiß, wer du bist. Samstag. Nacht. Schrottring an der Hafenkante. Eins gegen eins. Schockhandschuhe. Bring einen Sanitäter mit. Für dich.', {
    auto: all(AKT2, COUNTDOWN, inactive(Q), zeit('nacht')),
    effects: [{ startQuest: Q }],
    replies: [
      { text: '„Ich bring dir einen Sanitäter mit. Für dich.“' },
      { text: '„Wie viele Ausrufezeichen hatte deine letzte Meldung?“', effects: [herz(X, -10)] },
    ],
  }),
];

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: byId([trainingAria, trainingRaven, ring, ehrung]),
  phone: byId(phones),
  mapAdditions: {
    hafenkante: {
      hotspots: [
        {
          id: 'xk-training-aria', at: [290, 290], radius: 48, label: 'Mit Aria fürs Duell trainieren', kind: 'talk', dialogue: trainingAria.id,
          when: all(active(Q), noFlag('xk_trainiert'), noFlag('aria_weg'), zeit('abend', 'nacht'), { not: ENTSCHIEDEN }),
        },
        {
          id: 'xk-ring', at: 'alte-arena', label: 'Schrottring: Duell gegen Xion', kind: 'use', dialogue: ring.id,
          when: all(active(Q), RINGNACHT, { not: ENTSCHIEDEN }),
        },
        {
          id: 'xk-ring-zu', at: 'alte-arena', label: 'Schrottring', kind: 'look',
          when: all(active(Q), { not: RINGNACHT }, { not: ENTSCHIEDEN }),
          lines: [n('Der Schrottring: vier Ölfässer, vier Pfosten, schlaffe Stromseile. Ein Zettel am Pfosten: „DUELL. SAMSTAG. NACHT. KEINE AUSREDEN!!!“ Drei Ausrufezeichen. Eindeutig Xion.')],
        },
        {
          id: 'xk-ehrung', at: 'alte-arena', label: 'Nach dem Duell', kind: 'talk', dialogue: ehrung.id,
          when: all(active(Q), ENTSCHIEDEN, noFlag('xk_abschluss')),
        },
      ],
    },
    'crew-quartier': {
      hotspots: [
        {
          id: 'xk-training-raven', at: [545, 320], radius: 44, label: 'Raven: Duell-Training', kind: 'talk', dialogue: trainingRaven.id,
          when: all(active(Q), noFlag('xk_trainiert'), zeit('morgen', 'tag', 'abend'), { not: ENTSCHIEDEN }),
        },
      ],
    },
  },
};
