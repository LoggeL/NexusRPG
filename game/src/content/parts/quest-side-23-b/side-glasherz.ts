// side-glasherz · „Glasherz“ (world.md §6.3 Nr. 45). Die Glasbläserin, glasduenen, tagsüber, Akt 2.
// Ein Skorpion-Ei wurde gestohlen, die Königin greift die Werkstatt an → Ei finden (Staubbaron Brösel will es verkaufen)
// → zurückbringen oder kämpfen. Das Nest selbst (Ei zurücklegen, Glasperlen, Kampf enc-duenen-koenigin) baut die Karte
// (maps-23/glasduenen.ts, Hotspot skorpionnest-koenigin); diese Datei setzt dafür glasherz_ei_geborgen.
// Ei holen: tagsüber steht Brösel am Versteck: gc-138 [Straße 6] abschwatzen · kaufen (300 Cr, Sammlerpreis) ·
// Kampf enc-kopfgeld-staubbaron-broesel. Morgens/abends ist das Versteck leer: Kiste mit akt-schloss knacken oder
// [Körper 6] aufbrechen. Glasperlen-Ablenkung und Bosskampf gehen auch ganz ohne Ei.
// Belohnung 280 XP, muschel-glas, glasherz, Ruf aussiedler +10.
import type { ContentPart } from '../../part';
import type { Condition, CutsceneDef, DialogueDef, NewsDef, QuestDef } from '../../../modules/contracts';
import {
  ACT2, VEX, active, all, any, bild, ch, chk, dlg, done, flag, herz, inactive, l, msg, n, noFlag, node, not, p, rep, set, tafel,
  time, won,
} from './_lib';

const Q = 'side-glasherz';
const GB = 'glasblaeserin';
const BR = 'staubbaron-broesel';

const GEBORGEN = 'glasherz_ei_geborgen';
const ZURUECK = 'glasherz_ei_zurueck';
const ABGELENKT = 'glasherz_koenigin_abgelenkt';
const BOSS = 'enc-duenen-koenigin';
const BROESEL_KAMPF = 'enc-kopfgeld-staubbaron-broesel';
const BERICHT = 'glasherz_bericht';

const KOENIGIN_RUHIG: Condition = any(flag(ZURUECK), flag(ABGELENKT), won(BOSS));
const EI_HOLBAR: Condition = all(active(Q), noFlag(GEBORGEN), noFlag(ZURUECK));

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: 'Glasherz',
  summary: 'Jemand hat der Glasskorpion-Königin ihr Ei gestohlen, und jetzt hält sie die Glasbläserin für die Diebin. Die Werkstatt hat schon keine Fenster mehr.',
  giver: GB,
  act: 2,
  steps: [
    {
      id: 'ei', optional: true, when: all(noFlag(GEBORGEN), not(KOENIGIN_RUHIG)),
      text: 'Hol das Ei zurück. Brösel versteckt es hinter einem Wrack in den Glasdünen (tagsüber steht er selbst dabei).',
      done: flag(GEBORGEN), marker: { map: 'glasduenen', at: 'broesel-versteck' },
    },
    {
      id: 'koenigin', text: 'Beruhige die Königin am Skorpionnest: das Ei zurücklegen, sie mit Glasperlen ablenken oder kämpfen.',
      done: KOENIGIN_RUHIG, marker: { map: 'glasduenen', at: 'skorpionnest' },
    },
    {
      id: 'bericht', when: KOENIGIN_RUHIG, text: 'Sag der Glasbläserin, dass die Königin Ruhe gibt (Werkstatt, tagsüber und abends).',
      done: flag(BERICHT), marker: { map: 'glasduenen', at: 'glaswerkstatt' },
    },
  ],
  reward: { xp: 280, items: { 'muschel-glas': 1, glasherz: 1 }, rep: { aussiedler: 10 } },
};

// ---------------------------------------------------------------------------------------------- Auftakt

const start: DialogueDef = dlg('glasherz-start', [
  node('start', [
    n('Die Werkstatt der Glasbläserin sieht aus, als hätte jemand mit einem Kronleuchter Tennis gespielt. Die Flaschenfenster sind zersprungen, in der Wand stecken Glasstacheln, so lang wie ein Unterarm. Die Glasbläserin fegt Scherben. Sehr ruhig. Sehr wütend.'),
    l(GB, 'Die Königin war hier. Die Glasskorpion-Königin. Zweimal. Sie sucht ihr Ei.', 'besorgt'),
    l(GB, 'Jemand hat es aus dem Nest geholt. Einer mit Stiefeln, die nach Wasser riechen. Und sie denkt, ich war es. Weil ich hier wohne. Weil ich die Einzige bin, die sie kennt.', 'wut'),
  ], {
    choices: [
      ch('„Ein Glasskorpion-Ei. Was will man damit?“', 'wert'),
      ch('„Stiefel, die nach Wasser riechen. Brösel.“', 'broesel'),
      ch('„Zieh doch einfach um.“', 'umzug'),
    ],
  }),
  node('umzug', [
    l(GB, 'Umziehen? Wohin? In die Stadt? Wo man durch kein Fenster mehr durchsieht, weil auf jedem Werbung läuft?', 'wut'),
    l(GB, 'Das hier ist mein Ofen. Mein Sand. Meine Königin, wenn man so will. Wir hatten eine Abmachung. Ich mache keinen Lärm, sie sticht mich nicht.', 'trauer'),
  ], { next: 'wert' }),
  node('wert', [
    l(GB, 'In der Oberstadt zahlen sie ein Vermögen für so was. Ein lebendes Glasei, das leuchtet. Als Deko. Für den Couchtisch. Bis es schlüpft und den Couchtisch frisst.', 'signatur'),
  ], { next: 'broesel' }),
  node('broesel', [
    l(GB, 'Brösel. Der Wasserbaron. Wer hier draußen riecht nach Wasser? Nur einer. Der, der es verkauft.', 'wut'),
    l(GB, 'Er versteckt Sachen in den Dünen. Hinter dem großen Wrack im Osten. Wie ein Hund, der Knochen vergräbt. Ein Hund mit Hut.', 'neutral'),
    l(GB, 'Bring das Ei zurück ins Nest. Oder halte die Königin anders auf. Bevor sie das dritte Mal kommt. Beim dritten Mal kommt sie nicht wegen der Fenster.', 'besorgt'),
  ], {
    choices: [
      ch('„Ich kümmer mich drum.“', 'ja', { effects: [{ startQuest: Q }] }),
      ch('„Ich überleg’s mir.“'),
    ],
  }),
  node('ja', [
    l(GB, 'Danke. Wenn du Glasperlen brauchst: Ich hab welche. Sie mag alles, was glänzt. Wie alle Königinnen.', 'neutral'),
  ]),
]);

// ---------------------------------------------------------------------------------------------- Brösel am Versteck

const broesel: DialogueDef = dlg('glasherz-broesel', [
  node('start', [
    n('Hinter dem großen Wrack sitzt Brösel auf einer Kiste mit Luftlöchern, einen Sonnenschirm über dem Kopf und eine Thermoskanne in der Hand. Aus der Kiste kommt ein leises Klirren. Und ein Leuchten, blau wie eine Gasflamme.'),
    l(BR, 'Ah! Kundschaft! Mitten in der Wüste! Was für ein Zufall! Ich sitze hier rein zufällig. Auf einer rein zufälligen Kiste.', 'besorgt'),
  ], {
    choices: [
      ch('„Brösel. Das Ei.“', 'ei'),
      ch('„Was ist in der Kiste?“', 'ei'),
    ],
  }),
  node('ei', [
    l(BR, 'Das? Ein Sammlerstück! Ein Unikat der Natur! Rechtmäßig gefunden in einer herrenlosen Mulde! Ein Käufer aus der Oberstadt zahlt mir zweitausend. Zweitausend! Davon kann ich mir drei neue Hüte kaufen.', 'signatur'),
  ], {
    choices: [
      ch('„Die Mulde hatte eine Herrin. Die gerade die Glaswerkstatt zerlegt. Wenn sie rausfindet, wer das Ei hat, kommt sie zu deinem Wasserstand. Glaub mir: Sie riecht Wasser.“', 'schwatzen', {
        check: 'gc-138', effects: [set(GEBORGEN), rep('aussiedler', 3)],
      }),
      ch('„Dreihundert. Bar. Und du siehst morgen noch aus wie heute.“', 'kaufen', { effects: [{ credits: -300 }, set(GEBORGEN)] }),
      ch('„Gib her, oder ich setz dich in die Kiste.“', 'kampf'),
      ch('„Ich überleg’s mir.“'),
    ],
  }),
  node('schwatzen', [
    n('Brösel wird blass. Unter dem Kunstlederhut sieht man es nicht, aber man sieht, wie er die Thermoskanne fester hält.'),
    l(BR, 'Sie … riecht Wasser? Wirklich? Das stand in keinem Ratgeber! Ich hab drei Ratgeber! „Wüste für Anfänger“, „Reich durch Durst“ und „Skorpione: Freunde fürs Leben“!', 'ueberrascht'),
    l(BR, 'Nimm es. NIMM ES. Ich hab es nie gesehen. Ich war nie hier. Diese Kiste ist eine Halluzination. Hitzschlag. Ganz schlimm.', 'besorgt'),
  ], { next: 'ei-in-der-hand' }),
  node('kaufen', [
    l(BR, 'Dreihundert? Das ist Raub! Das ist Wegelagerei! Das ist … ein faires Angebot, wenn ich mir deine Arme so ansehe. Abgemacht.', 'wut'),
    n('Er zählt die Scheine dreimal. Dann ein viertes Mal, langsamer, mit Gefühl.'),
  ], { next: 'ei-in-der-hand' }),
  node('kampf', [
    l(BR, 'Gewalt! Gegen einen Geschäftsmann! Krähen! Meine Krähen! Hilfe!', 'wut'),
    n('Zwei Schrottkrähen stoßen vom Wrack herab, kreischend wie kaputte Bremsen.'),
  ], { effects: [{ battle: BROESEL_KAMPF }] }),
  node('ei-in-der-hand', [
    n('Du öffnest die Kiste. Darin, gebettet auf einen alten Pullover, liegt das Ei: so groß wie ein Melonenkopf, aus milchigem Glas, und darin bewegt sich etwas Blaues, langsam, wie ein Herzschlag unter Wasser. Es ist warm.'),
    p('Na komm. Zurück zu Mama. Bevor sie die Wüste umgräbt.', 'neutral'),
  ], { effects: [msg('Skorpion-Ei geborgen. Zurück zum Skorpionnest.')] }),
]);

const broeselBesiegt: DialogueDef = dlg('glasherz-broesel-besiegt', [
  node('start', [
    n('Brösel sitzt im Sand, den Hut schief, die Thermoskanne leer, und schaut zu, wie du die Kiste aufmachst.'),
    l(BR, 'Das war ein Investment! Ein Zukunftsprojekt! Ich wollte nur … ein bisschen reich sein. So viel ist das nicht.', 'trauer'),
    n('Das Ei liegt auf einem alten Pullover und leuchtet blau. Du nimmst es heraus. Es ist warm, wie ein Atemzug.'),
  ], { effects: [set(GEBORGEN), msg('Skorpion-Ei geborgen. Zurück zum Skorpionnest.')] }),
]);

// ---------------------------------------------------------------------------------------------- Versteck ohne Brösel

const versteck: DialogueDef = dlg('glasherz-versteck', [
  node('start', [
    n('Hinter dem großen Wrack: ein Sonnenschirm, eine Thermoskanne, ein Klappstuhl. Kein Brösel. Der steht um diese Zeit an seinem Wasserstand. Unter einer Plane: eine Kiste mit Luftlöchern und einem Vorhängeschloss so groß wie eine Faust. Aus der Kiste leuchtet es blau.'),
  ], {
    choices: [
      ch('Das Schloss knacken.', undefined, {
        effects: [{
          minigame: 'akt-schloss', level: 2, key: 'glasherz-broesel-kiste', label: 'Brösels Vorhängeschloss',
          win: [set(GEBORGEN), { dialogue: 'glasherz-versteck-auf' }],
          lose: [msg('Das Schloss klemmt. Brösels Schlösser sind das Einzige, was er nicht billig gekauft hat.')],
        }],
      }),
      ch('Die Kiste an den Scharnieren aufreißen.', 'auf', {
        check: chk('glasherz-kiste-aufreissen', 'koerper', 6, ['kraft']), effects: [set(GEBORGEN)],
      }),
      ch('Später wiederkommen.'),
    ],
  }),
  node('auf', [
    n('Die Scharniere quietschen, das Holz knackt, und der Deckel fliegt mitsamt Schloss in den Sand. Brösel wird später denken, ein Skorpion war es. Er wird es allen erzählen. Niemand wird ihm glauben.'),
  ], { next: 'ei' }),
  node('ei', [
    n('Darin, auf einem alten Pullover: das Ei. Groß wie ein Melonenkopf, milchiges Glas, darin bewegt sich etwas Blaues, langsam, wie ein Herzschlag unter Wasser.'),
  ], { effects: [msg('Skorpion-Ei geborgen. Zurück zum Skorpionnest.')] }),
]);

const versteckAuf: DialogueDef = dlg('glasherz-versteck-auf', [
  node('start', [
    n('Klick. Das Schloss fällt in den Sand. Darin, auf einem alten Pullover: das Ei. Groß wie ein Melonenkopf, milchiges Glas, darin bewegt sich etwas Blaues, langsam, wie ein Herzschlag unter Wasser.'),
    p('Brösel wird fluchen. Hoffentlich so laut, dass es die Königin hört. Aber nicht heute.'),
  ], { effects: [msg('Skorpion-Ei geborgen. Zurück zum Skorpionnest.')] }),
]);

// ---------------------------------------------------------------------------------------------- Bericht

const bericht: DialogueDef = dlg('glasherz-bericht', [
  node('start', [
    l(GB, 'Es ist still. Seit heute Morgen. Kein Klirren, kein Graben. Ich hab das erste Mal seit Tagen geschlafen. Erzähl.', 'besorgt'),
  ], {
    choices: [
      ch('„Das Ei liegt wieder im Nest. Sie hat mich angeschaut. Fast zärtlich.“', 'ei', { when: flag(ZURUECK) }),
      ch('„Sie spielt mit Glasperlen. Für eine Weile.“', 'perlen', { when: all(flag(ABGELENKT), noFlag(ZURUECK)) }),
      ch('„Sie liegt im Sand. Sie wird nicht wiederkommen. Glaube ich.“', 'kampf', { when: all(won(BOSS), noFlag(ZURUECK), noFlag(ABGELENKT)) }),
    ],
  }),
  node('ei', [
    l(GB, 'Zurück im Nest. Dann ist sie wieder eine Königin und keine Mutter in Panik. Gut. Panik ist das Schlimmste, was Glas passieren kann. Glas verzeiht keinen Schreck.', 'freude'),
  ], { next: 'lohn' }),
  node('perlen', [
    l(GB, 'Glasperlen. Ha. Sie ist eine Elster mit Stachel. Das hält nicht ewig.', 'neutral'),
  ], {
    choices: [
      ch('„Ich hab das Ei. Bring du es ihr, wenn sie sich beruhigt hat.“', 'ei-geben', { when: flag(GEBORGEN), effects: [set(ZURUECK)] }),
      ch('„Dann hoffen wir, dass ihr Glasperlen reichen.“', 'hoffen', { when: noFlag(GEBORGEN) }),
    ],
  }),
  node('ei-geben', [
    n('Du legst ihr das Ei in die Hände. Sie hält es wie etwas, das zerbrechen könnte, und das ist es auch.'),
    l(GB, 'Heute Nacht trag ich es hin. Wenn sie schläft. Dann denkt sie, es ist von allein zurückgekommen. So mögen Königinnen ihre Wunder. Unverdient.', 'zaertlich'),
  ], { effects: [herz(GB, 30)], next: 'lohn' }),
  node('hoffen', [
    l(GB, 'Ich mache neue. Jeden Tag ein paar. Dann reicht es. Und vielleicht kommt das Ei ja doch noch nach Hause. Brösel kann nicht alles ewig verstecken. Nicht mal seinen Charakter.', 'neutral'),
  ], { next: 'lohn' }),
  node('kampf', [
    l(GB, 'Sie liegt im Sand. Sie hat nur ihr Ei gesucht.', 'trauer'),
    n('Sie fegt eine Weile weiter, ohne etwas zu sagen. Dann stellt sie den Besen weg.'),
    l(GB, 'Nein. Du hast getan, was ich wollte. Ich wollte nur nicht, dass es so aussieht. Glas ist ehrlich. Ich bin es nicht immer.', 'trauer'),
  ], {
    choices: [
      ch('„Ich hab das Ei. Vielleicht schlüpft da drin die nächste Königin.“', 'ei-hueten', { when: flag(GEBORGEN), effects: [set(ZURUECK)] }),
      ch('„Tut mir leid.“', 'lohn'),
    ],
  }),
  node('ei-hueten', [
    l(GB, 'Dann brüte ich es aus. Am Ofen. Glas mag Wärme. Und wenn sie schlüpft, erzähle ich ihr, dass ihre Mutter tapfer war. Das ist nicht ganz gelogen.', 'zaertlich'),
  ], { effects: [herz(GB, 20)], next: 'lohn' }),
  node('lohn', [
    l(GB, 'Ich hab dir was gemacht. Gestern Nacht, als ich nicht schlafen konnte.', 'verlegen'),
    n('Sie legt zwei Dinge auf den Werktisch. Eine Muschel aus geblasenem Glas, durch die der Wind singt, wenn man sie ans Ohr hält. Und ein Herz aus Wüstenglas an einer Lederschnur. Innen ein einzelnes Luftbläschen, wie ein eingefrorener Atemzug.'),
    l(GB, 'Das Herz ist aus dem Glas, das die Königin aus meinen Fenstern geschlagen hat. Ich hab es eingeschmolzen. Ein Glasherz. Schenk es jemandem, der zerbrechen könnte. Oder trag es selbst.', 'zaertlich'),
  ], {
    choices: [
      ch('„Danke.“', undefined, { effects: [set(BERICHT), herz(GB, 40), { cutscene: 'side-glasherz-ofen' }] }),
      ch('„Ich zerbrech nicht so schnell.“', 'vex', { when: VEX, effects: [set(BERICHT), herz(GB, 40)] }),
    ],
  }),
  node('vex', [
    l(GB, 'Nein? Glas zerbricht auch nicht schnell. Nur einmal. Pass auf deins auf.', 'neutral'),
    n('Sie schaut auf deinen Metallarm und dann auf deinen linken Handschuh. Sie sagt nichts weiter. Sie weiß, wie Narben aussehen. Sie macht welche aus Glas.'),
  ], { effects: [{ cutscene: 'side-glasherz-ofen' }] }),
]);

const ofen: CutsceneDef = {
  id: 'side-glasherz-ofen',
  title: 'Glasherz',
  gallery: false,
  beats: [
    bild('bg-glasduenen', { pan: 'out', fade: 'in', hold: 1400, caption: 'Am Abend glühen die Glasdünen in allen Farben, die es gibt, und in ein paar, die es nur hier gibt.' }),
    tafel('Hinter der Werkstatt, tief im Nest, leuchtet es blau. Ganz ruhig. Wie ein Herz, das wieder weiß, wo es hingehört.', { fade: 'out', hold: 1800 }),
  ],
};

const news: NewsDef = {
  id: 'news-side-glasherz',
  anchor: 'opa-funk',
  headline: 'Radio Rost: Ruhe in den Glasdünen',
  when: done(Q),
  priority: 3,
  lines: [
    l('opa-funk', 'Aus den Glasdünen: Die Skorpionkönigin gibt Ruhe. Die Glasbläserin hat neue Fenster. Und Brösel hat eine Kiste weniger.', 'freude'),
    l('opa-funk', 'Wer Wasser für zwanzig Credits kauft, ist selber schuld. Wer Eier klaut, kriegt Besuch. Das war die Lebenshilfe für heute.', 'neutral'),
  ],
};

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: {
    [start.id]: start, [broesel.id]: broesel, [broeselBesiegt.id]: broeselBesiegt, [versteck.id]: versteck,
    [versteckAuf.id]: versteckAuf, [bericht.id]: bericht,
  },
  cutscenes: { [ofen.id]: ofen },
  news: { [news.id]: news },
  mapAdditions: {
    glasduenen: {
      hotspots: [
        {
          id: 'q-glasherz-start', at: 'glaswerkstatt', radius: 70, label: 'Die Glasbläserin fegt Scherben', kind: 'talk', dialogue: start.id,
          when: all(ACT2, inactive(Q), time('tag', 'abend')),
        },
        {
          id: 'q-glasherz-broesel', at: 'broesel-versteck', radius: 64, label: 'Brösel auf seiner Kiste', kind: 'talk', dialogue: broesel.id,
          when: all(EI_HOLBAR, time('tag'), not(won(BROESEL_KAMPF))),
        },
        {
          id: 'q-glasherz-broesel-besiegt', at: 'broesel-versteck', radius: 64, label: 'Brösels Kiste öffnen', kind: 'use', dialogue: broeselBesiegt.id,
          when: all(EI_HOLBAR, won(BROESEL_KAMPF)),
        },
        {
          id: 'q-glasherz-versteck', at: 'broesel-versteck', radius: 64, label: 'Brösels Versteck durchsuchen', kind: 'use', dialogue: versteck.id,
          when: all(EI_HOLBAR, time('morgen', 'abend', 'nacht'), not(won(BROESEL_KAMPF))),
        },
        {
          id: 'q-glasherz-bericht', at: 'glaswerkstatt', radius: 70, label: 'Der Glasbläserin Bescheid sagen', kind: 'talk', dialogue: bericht.id,
          when: all(active(Q), KOENIGIN_RUHIG, noFlag(BERICHT), time('tag', 'abend')),
        },
      ],
    },
  },
};
