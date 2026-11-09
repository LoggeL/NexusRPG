// pers-xion-umschulung · „Umschulung“ (world.md §6.5, Xion, Nachspiel). Start he-xion-venom-8 bzw. Xions Gespräch
// (npc-quantum/xion-venom.ts). Bruno überzeugen (`[Ausstrahlung 5]`, `[Bruno ♥4]` oder ohne Check: selbst mit an der Tür
// stehen), dann der Probeabend nachts an der HV-Tür: Xion coachen `[Ausstrahlung 6]`, Kampf enc-tuer-xion-probeabend
// (combat-23/encounters-nachspiel.ts) oder ohne Check Xion machen lassen. Xion ♥ +100.
import type { QuestDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import {
  L, N, VEX, active, all, bye, byId, c, cc, chk, dlg, fight, flag, hearts, karten, msg, node, noFlag, not, rede, rel,
  schritt, set, stelle, time, won,
} from './_lib';

const Q = 'pers-xion-umschulung';
const X = 'xion-venom';
const BR = 'bruno-brecher';
const ENC = 'enc-tuer-xion-probeabend';
const AKTIV = active(Q);
const ZUGESAGT = flag('xu_bruno');

const quest: QuestDef = {
  id: Q, kind: 'personal', act: 3, giver: X,
  title: 'Umschulung',
  summary: 'Xion Venom, Ex-Sicherheitschef von Quantum, Kralle am Arm, Vergangenheit am Hals, sucht Arbeit. Er kann stehen, gucken und Leute davon überzeugen, woanders sein zu wollen. Bruno am High Voltage braucht genau so jemanden. Bruno weiß das nur noch nicht.',
  steps: [
    schritt('bruno', 'Überzeug Bruno, Xion einen Probeabend zu geben (Neon-Gasse, HV-Eingang, abends).', ZUGESAGT, ['neon-gasse', 'hv-eingang']),
    schritt('probe', 'Nachts an der HV-Tür: Xions Probeabend.', 'xu_probe', ['neon-gasse', 'hv-eingang'], { when: ZUGESAGT }),
  ],
  reward: { xp: 350, relations: { [X]: 100, [BR]: 30 }, rep: { unterstadt: 5 } },
};

// ------------------------------------------------------------------------------------------- Bruno
const bruno = dlg('p23-xu-bruno', [
  node('start', [
    L(BR, 'Xion. An meiner Tür. Der Typ, der Aria verkauft hat. Der Typ mit der Kralle, die auf drei Fahndungsplakaten war.', 'wut'),
    L(BR, 'Ich hab zwanzig Jahre an dieser Tür gestanden. Ich lass nicht jeden hin. Ich lass kaum jemanden rein.'),
  ], {
    choices: [
      cc('„Du hast auch mal jemandem was angetan. Und Hunter hat dir eine Tür gegeben.“', 'ja', chk('xu-bruno', 'ausstrahlung', 5, ['ueberreden'])),
      c('„Bruno. Für mich.“', 'ja', { tag: '[Bruno ♥4]', requires: hearts(BR, 4) }),
      c('„Ein Abend. Ich steh daneben. Wenn er Mist baut, bau ich ihn ab.“', 'daneben'),
      c('„Aria wird ihn sehen. Jeden Abend. Das ist seine Strafe und seine Chance.“', 'aria', { when: VEX }),
      bye('„Denk drüber nach.“'),
    ],
  }),
  node('aria', [L(BR, 'Du sagst das. Ausgerechnet du. … Gut. Wenn du ihn ertragen kannst, kann ich es auch.', 'besorgt')], { next: 'ja' }),
  node('daneben', [L(BR, 'Du daneben. Dann hab ich zwei Probleme an der Tür statt einem. … Na gut. Zwei Probleme sind besser als ein leerer Platz.', 'signatur')], { next: 'ja' }),
  node('ja', [
    L(BR, 'Ein Abend. Freitag oder nicht, egal. Nachts, wenn die Rempler kommen. Wenn er die Kralle benutzt, ist er raus. Wenn er redet, darf er bleiben.', 'neutral'),
  ], { effects: [set('xu_bruno'), msg('Bruno gibt Xion einen Probeabend. Nachts an der HV-Tür.')] }),
]);

// ------------------------------------------------------------------------------------------- Probeabend
const probe = dlg('p23-xu-probe', [
  node('start', [
    N('Nacht vor dem High Voltage. Xion trägt ein schwarzes Hemd, durch das die Kralle passt, und ein Namensschild: „XION – IN AUSBILDUNG“. Er steht so gerade, dass es wehtut. Bruno lehnt am Türrahmen und isst eine Brezel.'),
    L(X, 'Ich bin bereit. Ich bin nicht bereit. Was sagt man? Sagt man „Guten Abend“? Bei Quantum hat man „Hände an die Wand“ gesagt.', 'besorgt'),
    N('Die Gasse runter kommen drei Rempler. Breit, laut, betrunken. Einer zeigt auf Xion und grinst.'),
  ], {
    choices: [
      cc('Xion zuflüstern: „Augenkontakt. Ruhig. Sag ihnen, was sie bekommen, wenn sie gehen.“', 'geredet', chk('xu-coach', 'ausstrahlung', 6, ['ueberreden', 'lehren'])),
      c('Die Rempler kommen lassen.', undefined, { effects: [fight(ENC)] }),
      c('Nach der Rangelei zu Bruno sehen.', 'nach-kampf', { when: won(ENC) }),
      c('Nichts sagen. Xion machen lassen.', 'allein'),
    ],
  }),
  node('geredet', [
    L(X, 'Guten Abend. Ihr kommt heute nicht rein. Aber am Kiosk gibt es Neon-Limo, zwei für eins, und die Bank da drüben ist frei. Ich empfehle die Bank.', 'neutral'),
    N('Die Rempler gucken sich an. Einer zuckt mit den Schultern. Sie gehen zum Kiosk. Bruno hört auf zu kauen.'),
  ], { effects: [rel(X, 20)], next: 'urteil' }),
  node('allein', [
    L(X, 'Ich bin Xion Venom. Ich war Sicherheitschef bei Quantum. Ich hab Leute an Rohre gekettet. Jetzt stehe ich hier und sage: Nein.', 'signatur'),
    N('Pause. Die Rempler gucken auf die Kralle. Die Kralle bleibt unten. Einer sagt: „Alter, der ist gruselig, wenn er höflich ist.“ Sie gehen.'),
  ], { next: 'urteil' }),
  node('nach-kampf', [
    N('Die drei sitzen ordentlich am Bordstein, nebeneinander, wie in einer Schulklasse. Xion hat die Kralle nicht benutzt. Er hat nur sehr laut sehr freundliche Sachen gesagt und dabei Leute hochgehoben.'),
  ], { next: 'urteil' }),
  node('urteil', [
    L(BR, 'Hm.', 'neutral'),
    L(X, 'Hm gut? Hm schlecht? Bruno, ich kann „Hm“ nicht lesen, ich war bei Quantum, da gab es nur Ja und Nein!', 'besorgt'),
    L(BR, 'Hm heißt: Morgen um neun. Bring dein eigenes Namensschild mit. Ohne „in Ausbildung“.', 'freude'),
  ], {
    choices: [
      c('„Glückwunsch, Türsteher.“', 'ende'),
      c('„Wenn du Aria jemals wieder anfasst, bin ich die, die vor der Tür steht.“', 'drohung', { when: VEX }),
    ],
  }),
  node('drohung', [L(X, 'Das weiß ich. Darum hab ich keine Angst vor den Remplern. Ich hab nur Angst vor dir.', 'verlegen')], { next: 'ende' }),
  node('ende', [
    L(X, 'Ein Job. Ein echter. Mit Namensschild und Brezel. Danke. Das hab ich bei Quantum nie gesagt. Da hat man sich bedankt, indem man niemanden verklagt.', 'freude'),
  ], { effects: [set('xu_probe'), set('xion_tuersteher')] }),
]);

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: byId(bruno, probe),
  mapAdditions: karten([
    ['neon-gasse', rede('p23-xu-bruno', 'hv-eingang', 'Bruno: Ein Probeabend für Xion', bruno.id, all(AKTIV, not(ZUGESAGT), time('abend', 'nacht')))],
    ['neon-gasse', stelle('p23-xu-xion', X, 'hv-eingang', probe.id, all(AKTIV, ZUGESAGT, noFlag('xu_probe'), time('nacht'))), 'npc'],
  ]),
};
