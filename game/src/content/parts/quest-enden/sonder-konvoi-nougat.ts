// sonder-konvoi-nougat „Zucker für die Ödnis“ (Hunters Sonderauftrag, Rang 5): fünfzig Kisten Nougatbomben vom
// Konvoi-Halt über die Wegzoll-Schranke der Staubfalken zum Hofladen am Aussiedlerhof. An der Schranke: gc-93,
// Nougat-Zoll, 200 Cr, Kampf (enc-oednis-staubfalken) oder freie Durchfahrt mit Krähes Segen.
import type { ContentPart } from '../../part';
import type { DialogueDef, QuestDef } from '../../../modules/contracts';
import { active, any, all, ch, dlg, done, flag, herz, item, l, n, noFlag, node, not, p, set, stepDone } from './_lib';

const Q = 'sonder-konvoi-nougat';
const AKTIV = active(Q);
const GELADEN = flag('skn_geladen');
const DURCH = flag('skn_durch');
const ABGELIEFERT = flag('skn_abgeliefert');

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: 'Sonderauftrag: Zucker für die Ödnis',
  summary: 'Die Aussiedler haben Hunter im Winter Wasser geschickt. Er schickt ihnen fünfzig Kisten Nougatbomben. Die Staubfalken an der Schranke haben auch Hunger.',
  giver: 'hunter',
  act: 2,
  steps: [
    { id: 'laden', text: 'Lade die Kisten am Konvoi-Halt der Staubstraße.', done: GELADEN, marker: { map: 'staubstrasse', at: 'konvoi-halt' } },
    { id: 'schranke', text: 'Komm an der Wegzoll-Schranke der Staubfalken vorbei.', done: DURCH, when: stepDone(Q, 'laden'), marker: { map: 'staubstrasse', at: 'wegzoll-schranke' } },
    { id: 'hofladen', text: 'Liefere die Kisten im Hofladen am Aussiedlerhof ab.', done: ABGELIEFERT, when: stepDone(Q, 'schranke'), marker: { map: 'aussiedlerhof', at: 'hofladen' } },
  ],
  reward: { xp: 300, credits: 250, rep: { aussiedler: 15, 'crew-hunter': 5 }, relations: { hunter: 20 }, items: { nougatbombe: 2 } },
};

const laden: DialogueDef = dlg('skn-laden', [
  node('start', [
    n('Am Konvoi-Halt stehen fünfzig Kisten, auf jeder ein Aufkleber: „HV – NICHT ESSEN“. Auf einer fehlt das „NICHT“. Jemand war schon dran.'),
    p('Fünfzig Kisten. Ein Wagen. Null Kühlung. Wenn das schmilzt, ist das die klebrigste Katastrophe der Ödnis.'),
  ], { choices: [ch('Kisten laden.', undefined, { effects: [set('skn_geladen'), { advanceTime: 30 }] })] }),
]);

const schranke: DialogueDef = dlg('skn-schranke', [
  node('start', [
    n('Die Wegzoll-Schranke: ein Schlagbaum aus einem Laternenmast, daneben zwei Staubfalken mit Bolzenschleudern und eine Blechdose mit der Aufschrift „Zoll“.'),
    l('kraehe', 'Was ist in den Kisten?', 'neutral'),
    p('Zucker. Für die Aussiedler.'),
    l('kraehe', 'Zucker. Die Aussiedler kriegen Zucker, und wir kriegen Staub. Das ist keine Ehre. Das ist Diebstahl am Gaumen.', 'wut'),
  ], { choices: [
    ch('„Lass mich dir eine Geschichte erzählen. Über einen Club und ein Meer.“', 'geschichte', { check: 'gc-93', effects: [set('skn_durch'), { rep: 'staubfalken', delta: 5 }] }),
    ch('„Wir sind doch längst quitt, Krähe.“', 'frei', { tag: '[Ödnis]', when: any(flag('kraehe_teilhaberin'), done('side-kraehes-ehre'), done('side-oednis-frieden')), effects: [set('skn_durch'), herz('kraehe', 5)] }),
    ch('Zoll in Nougat zahlen (3 Nougatbomben).', 'nougat', { when: item('nougatbombe', 3), effects: [{ take: 'nougatbombe', qty: 3 }, set('skn_durch'), { rep: 'staubfalken', delta: 5 }] }),
    ch('Zoll in Credits zahlen (200 Cr).', 'credits', { effects: [{ credits: -200 }, set('skn_durch')] }),
    ch('„Macht den Weg frei, oder ich mach ihn frei.“', 'kampf', { effects: [{ rep: 'staubfalken', delta: -10 }, { battle: 'enc-oednis-staubfalken', win: [set('skn_durch')] }] }),
  ] }),
  node('geschichte', [
    l('kraehe', 'Ein Club. Am Meer. Für alle. Mit Rabatt für Falken? … Gute Geschichte. Ich nehme sie als Zoll. Sie ist besser als Credits.', 'freude'),
  ]),
  node('frei', [l('kraehe', 'Wort ist Wort. Fahrt durch. Und wenn eine Kiste vom Wagen fällt, haben wir sie nicht gesehen.', 'signatur')]),
  node('nougat', [n('Krähe nimmt die drei Nougatbomben, riecht daran, beißt hinein. Sie schließt die Augen. Der Schlagbaum geht hoch, ohne dass einer ihn anfasst.')]),
  node('credits', [l('kraehe', 'Credits. Langweilig. Aber ehrlich. Fahrt.', 'neutral')]),
  node('kampf', [l('kraehe', 'Wie du willst. Falken! Zeigt ihnen, wie Staub schmeckt!', 'wut')]),
]);

const hofladen: DialogueDef = dlg('skn-hofladen', [
  node('start', [
    n('Der Hofladen am Aussiedlerhof. Eier, Honig, getrocknete Tomaten, ein Schild „Heute: alles“. Als du die Kisten abstellst, kommen von überall Kinder. Und der Ziegenroboter.'),
    l('marla-sand', 'Fünfzig Kisten? Hunter, der alte Angeber. Sag ihm, dass das zu viel ist. Und dass wir alles behalten.', 'freude'),
  ], { choices: [ch('Abliefern.', 'ende', { effects: [set('skn_abgeliefert')] })] }),
  node('ende', [
    n('Der Ziegenroboter hat eine Kiste aufgebissen, bevor jemand „Nein“ sagen kann. Er frisst drei Nougatbomben mitsamt Papier. Danach meckert er wie ein Motorrad.'),
    l('marla-sand', 'Den setzen wir auf Diät. Morgen. Heute ist Feiertag.', 'freude'),
  ]),
]);

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: Object.fromEntries([laden, schranke, hofladen].map((d) => [d.id, d])),
  mapAdditions: {
    staubstrasse: {
      hotspots: [
        { id: 'skn-laden', at: 'konvoi-halt', radius: 50, label: 'Nougat-Kisten laden', kind: 'use', dialogue: laden.id, when: all(AKTIV, not(GELADEN)) },
        { id: 'skn-schranke', at: 'wegzoll-schranke', radius: 50, label: 'Wegzoll: Nougat-Konvoi', kind: 'talk', dialogue: schranke.id, when: all(AKTIV, GELADEN, not(DURCH)) },
      ],
    },
    aussiedlerhof: {
      hotspots: [{ id: 'skn-hofladen', at: 'hofladen', radius: 50, label: 'Nougat abliefern', kind: 'use', dialogue: hofladen.id, when: all(AKTIV, DURCH, noFlag('skn_abgeliefert')) }],
    },
  },
};
