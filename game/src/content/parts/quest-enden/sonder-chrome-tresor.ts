// sonder-chrome-tresor „Die Perlenkette“ (Hunters Sonderauftrag, Rang 5): Die Kette von Hunters Mutter liegt im Tresor
// von Juwelier Glanzstück am Chrome-Boulevard. Wege: Pfandschein + 600 Cr, Richters Gefallen, [Straße 7], nachts mit
// Albert in den Tresor (akt-schloss), oder einfach kaufen (1.500 Cr). Zurück zu Hunter an den Tresen.
import type { ContentPart } from '../../part';
import type { Condition, DialogueDef, Effect, QuestDef } from '../../../modules/contracts';
import { active, all, ch, chk, dlg, flag, item, l, n, noFlag, node, not, p, set, stepDone, time, weiter } from './_lib';

const Q = 'sonder-chrome-tresor';
const AKTIV = active(Q);
const KETTE = flag('sct_kette');

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: 'Sonderauftrag: Die Perlenkette',
  summary: 'Hunter hat die Perlenkette seiner Mutter versetzt, als das High Voltage pleite war. Sie liegt im Tresor eines Juweliers in der Oberstadt.',
  giver: 'hunter',
  act: 2,
  steps: [
    {
      id: 'pfandschein', text: 'Hol dir bei Hunter am Tresen den alten Pfandschein. (Optional, macht es billiger.)', optional: true,
      done: flag('sct_pfandschein'), marker: { map: 'high-voltage', at: 'tresen' },
    },
    {
      id: 'kette', text: 'Bring die Perlenkette aus dem Juwelier Glanzstück am Chrome-Boulevard. Bezahlen, verhandeln oder nachts mit Albert durch den Hintereingang.',
      done: KETTE, marker: { map: 'chrome-boulevard', at: 'juwelier-glanzstueck' },
    },
    {
      id: 'zurueck', text: 'Gib Hunter die Kette. Am Tresen im High Voltage.', done: flag('sct_uebergeben'), when: stepDone(Q, 'kette'),
      marker: { map: 'high-voltage', at: 'tresen' },
    },
  ],
  reward: { xp: 350, rep: { 'crew-hunter': 10 }, relations: { hunter: 60 } },
};

const BESORGT: Effect[] = [set('sct_kette'), { give: 'perlenkette' }];
const verhandeln = chk('sct-glanzstueck-strasse', 'strasse', 7, ['verhandeln', 'luegen']);

const juwelier: DialogueDef = dlg('sct-juwelier', [
  node('start', [
    n('Juwelier Glanzstück. Weißer Teppich, weiße Wände, ein Verkäufer mit weißen Handschuhen und dem Gesicht eines Mannes, der Unterstadt riecht, bevor sie die Tür aufmacht.'),
    p('Eine Perlenkette. Alt. Versetzt vor ein paar Jahren. Auf den Namen Hunter.'),
    n('Er blättert in einem Buch, das teurer aussieht als dein Leben. „Pfandfrist abgelaufen. Die Kette gehört jetzt dem Haus. Eintausendfünfhundert Credits. Für Sie.“'),
  ], { choices: [
    ch('Den Pfandschein und 600 Credits auf den Tresen legen.', 'pfand', { when: flag('sct_pfandschein'), effects: [{ credits: -600 }, ...BESORGT] }),
    ch('„Der Richter lässt grüßen.“ (Richters Gefallen)', 'richter', { when: item('richters-gefallen'), effects: [{ take: 'richters-gefallen' }, ...BESORGT] }),
    ch('„Pfandfristen für Erbstücke? In der Oberstadt? Das wäre ein Skandal bei NX-1.“', 'skandal', { check: verhandeln, effects: [...BESORGT, { rep: 'chrome-haus', delta: -5 }] }),
    ch('Kaufen (1.500 Cr).', 'kauf', { effects: [{ credits: -1500 }, ...BESORGT] }),
    ch('„Ich komm wieder.“'),
  ] }),
  node('pfand', [n('Er betrachtet den Pfandschein mit spitzen Fingern, als wäre er radioaktiv. „Nun gut. Aus Kulanz.“ Er sagt das Wort, als hätte er es gerade erfunden.')]),
  node('richter', [n('Er liest den Zettel. Er wird blass. „Der Richter. Natürlich. Bitte grüßen Sie zurück. Und sagen Sie ihm, die Uhr ist noch nicht fertig.“')]),
  node('skandal', [n('Er schaut zur Tür, als würde Collin gleich mit Kamera reinplatzen. „Aus … Kulanz. Und bitte ohne Presse.“ Die Kette liegt in einem Samtsäckchen. Er hat es nicht mal zugebunden.')]),
  node('kauf', [n('Er zählt die Credits zweimal. Dann noch einmal. Dann gibt er dir die Kette, ohne Säckchen. Säckchen kosten extra.')]),
]);

// Nachts: Albert lässt dich durch den Hintereingang, dann das Schloss am Tresor.
const albert: DialogueDef = dlg('sct-albert', [
  node('start', [
    l('portier-albert', 'Ein Erbstück, sagen Sie? Von einer Mutter? Hm. Ich habe auch eine Mutter. Sie ist zweiundneunzig und hat nie etwas versetzt außer meinem Vater.', 'neutral'),
    l('portier-albert', 'Der Hintereingang von Glanzstück klemmt. Wenn er heute Nacht zufällig offen wäre, wäre das ein Versehen. Ich mache selten Versehen. Heute vielleicht.', 'zaertlich'),
  ], { choices: [ch('„Danke, Albert.“', undefined, { effects: [set('sct_albert')] })] }),
]);

const TRESOR_OFFEN: Condition = all(AKTIV, flag('sct_albert'), not(KETTE), time('nacht'));

const HAT_KETTE: Condition = all(KETTE, item('perlenkette'));

const quittung: DialogueDef = dlg('sct-hunter', [
  node('start', [], { choices: weiter([[HAT_KETTE, 'uebergabe'], [null, 'schein']]) }),
  node('schein', [
    l('hunter', 'Du gehst zu Glanzstück? Hier. Der Pfandschein. Vier Jahre lang hab ich ihn im Portemonnaie gehabt. Er ist abgelaufen. Ich wollte ihn trotzdem nicht wegwerfen.', 'verlegen'),
  ], { effects: [set('sct_pfandschein')] }),
  node('uebergabe', [
    n('Du legst die Kette auf den Tresen. Hunter sagt nichts. Er nimmt sie, dreht eine Perle zwischen den Fingern, als würde er sie zählen. Es sind dreiundvierzig. Er weiß das.'),
    l('hunter', 'Sie hat die jeden Sonntag getragen. Zum Kochen. Wer trägt Perlen zum Kochen?', 'trauer'),
    l('hunter', '… Schulden muss man immer begleichen. Das hier ist keine Schuld. Das ist was anderes. Ich weiß nur noch nicht, wie man das nennt.', 'zaertlich'),
  ], { effects: [{ take: 'perlenkette' }, set('sct_uebergeben')] }),
]);

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: Object.fromEntries([juwelier, albert, quittung].map((d) => [d.id, d])),
  mapAdditions: {
    'chrome-boulevard': {
      hotspots: [
        { id: 'sct-juwelier', at: 'juwelier-glanzstueck', radius: 46, label: 'Glanzstück: Perlenkette', kind: 'talk', dialogue: juwelier.id, when: all(AKTIV, not(KETTE), time('morgen', 'tag', 'abend')) },
        { id: 'sct-albert', at: 'portierloge', radius: 44, label: 'Albert um ein Versehen bitten', kind: 'talk', dialogue: albert.id, when: all(AKTIV, not(KETTE), noFlag('sct_albert')) },
        {
          id: 'sct-tresor', at: 'juwelier-glanzstueck', radius: 46, label: 'Hintereingang: Tresor knacken', kind: 'use', when: TRESOR_OFFEN,
          effects: [{
            minigame: 'akt-schloss', level: 3, key: 'sct-tresor', label: 'Tresorschloss bei Glanzstück',
            win: [...BESORGT, { message: 'Klick. Hinter Samt und Seidenpapier: dreiundvierzig Perlen. Du nimmst nur die Kette. Sonst nichts. Fast nichts.' }],
            lose: [{ wanted: 1 }, { message: 'Ein Alarm. Leise, höflich, sehr oberstädtisch. Du bist trotzdem schneller weg als er.' }],
          }],
        },
      ],
    },
    'high-voltage': {
      hotspots: [{ id: 'sct-hunter', at: 'tresen', radius: 44, label: 'Hunter: Perlenkette', kind: 'talk', dialogue: quittung.id, when: all(AKTIV, { any: [all(noFlag('sct_pfandschein'), not(KETTE)), HAT_KETTE] }) }],
    },
  },
};
