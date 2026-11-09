// pers-vega-adlerauge „Adlerauge“ (world.md §6.2 Nr. 22) · Vega · hafenkante · ab Vega ♥3.
// Start: vega.ts (Dialogwahl [Vega ♥3]) und zusätzlich per Telefon, sobald ♥3 erreicht ist.
// Schritte: Falke ansprechen (falke-kran T) → Zielfernrohr zurückholen → Vega zurückgeben.
// Wege: Vega schießt, du gibst Wind und Entfernung (akt-schiessstand) · gc-83 [Reflexe 7] selbst antreten
// · nachts aus Falkes Wohnwagen holen (akt-schloss, „unsportlich, aber effektiv“) · Kampf enc-kran-falke.
// Belohnung: 220 XP, Vega +100, Flag vega_kobra_reichweite (Kobra-Schuss +1 Reichweite); he-vega-4 schaltet vega.ts frei.
// VEXARIA: Aria taucht bei der Rückgabe auf und beansprucht Vex. Sehr deutlich.
import type { ContentPart } from '../../part';
import type { CutsceneDef, DialogueDef, ItemDef, PhoneMessageDef, QuestDef } from '../../../modules/contracts';
import { L, N, VEXARIA, VEXARIA_ZUSAMMEN, active, all, any, bye, done, flag, hearts, inactive, item, node, noFlag, not, rel, set, tafel, time } from './_lib';

const Q = 'pers-vega-adlerauge';
const V = 'vega';
const F = 'falke';
const A = 'aria';

const FERNROHR = item('vegas-fernrohr-geklaut');
const GEKAEMPFT = { won: 'enc-kran-falke' };
const ZURUECK = any(FERNROHR, flag('va_fernrohr_zurueck'), GEKAEMPFT);

const quest: QuestDef = {
  id: Q,
  kind: 'personal',
  title: 'Adlerauge',
  summary: 'Vegas Zielfernrohr wurde geklaut. Am Hafen prahlt ein Quantum-Scharfschütze namens Falke mit einem, das genauso aussieht. Mit ihrem Kratzer. Mit ihrer Gravur.',
  giver: V,
  act: 1,
  steps: [
    { id: 'falke', text: 'Falke an den Rostkai-Kränen ansprechen (tagsüber).', done: any(flag('va_falke_getroffen'), ZURUECK), marker: { map: 'hafenkante', at: [1245, 610] } },
    {
      id: 'fernrohr', text: 'Das Zielfernrohr zurückholen: Wettschießen, nachts aus dem Wohnwagen, oder ihn vom Kran holen.',
      done: ZURUECK, marker: { map: 'hafenkante', at: [1100, 470] },
    },
    { id: 'rueckgabe', text: 'Vega ihr Fernrohr zurückgeben.', done: flag('va_fernrohr_zurueck'), when: ZURUECK, marker: { map: 'neon-gasse', at: [1372, 106] } },
  ],
  reward: {
    xp: 220,
    relations: { [V]: 100 },
    effects: [set('vega_kobra_reichweite'), { message: 'Vega hat ihr Fernrohr wieder. Kobra-Schuss: +1 Reichweite.' }],
  },
};

const start: PhoneMessageDef = {
  id: 'va-vega-anruf',
  from: V,
  text: 'Mein Fernrohr ist weg. Am Hafen läuft ein Quantum-Wichser namens Falke rum und schießt damit Dosen. Mit MEINEM Kratzer. Ich bleib ruhig. Ich bin sehr ruhig. Kommst du mit? – V.',
  auto: all(hearts(V, 3), inactive(Q), done('main-1-probezeit')),
  replies: [
    { text: 'Bin dabei. Wir holen es zurück.', effects: [{ startQuest: Q }] },
    { text: 'Später. Atme durch.' },
  ],
};

// --------------------------------------------------------------------------------------------- Falke
const falke: DialogueDef = {
  id: 'va-falke',
  start: 'start',
  nodes: [
    node('start', [
      N('Oben auf dem Kran, auf einem Klappstuhl, den nie jemand hochgetragen haben kann: ein Mann in Quantum-Weiß, Sonnenbrille, ein Gewehr quer über den Knien. Am Lauf: ein Zielfernrohr mit einem Kratzer in Sternform.'),
      L(F, 'Na? Willst du ein Autogramm? Ich unterschreibe auf Dosen. Mit Kugeln.'),
      L(F, 'Das Fernrohr? Gefunden. Auf dem Schwarzmarkt. Ehrlich gekauft, ehrlich poliert. Wenn deine kleine Freundin es zurückwill, soll sie’s sich verdienen. Wettschießen, Kran zu Kran. Wer verliert, verliert.'),
    ], {
      effects: [set('va_falke_getroffen')],
      choices: [
        { text: '„Kratzer, Gravur, Sternform. Das ist ihres.“', next: 'gravur' },
        { text: '„Wettschießen. Abgemacht.“', next: 'abgemacht' },
        { text: '„Oder ich hol dich da runter.“', next: 'drohung' },
        bye('Gehen.'),
      ],
    }),
    node('gravur', [
      L(F, 'Und? Steht da „Vega“ drauf? Nein. Da steht „V“. V wie Falke. Das ist Französisch.'),
    ], { next: 'abgemacht' }),
    node('abgemacht', [
      L(F, 'Am Schießstand, solange es hell ist. Zehn Dosen, drei Kräne, eine Chance. Bring Vega mit. Ich will ihr Gesicht sehen, wenn sie zweite wird.'),
    ]),
    node('drohung', [
      L(F, 'Von hier oben sieht jeder klein aus. Du siehst besonders klein aus. Versuch’s.'),
    ], {
      choices: [
        { text: 'Die Kranleiter hoch. Jetzt.', effects: [set('va_weg_kampf'), { battle: 'enc-kran-falke' }] },
        bye('Lieber später.'),
      ],
    }),
  ],
};

// --------------------------------------------------------------------------------------------- Wettschießen
const wettschiessen: DialogueDef = {
  id: 'va-wettschiessen',
  start: 'start',
  nodes: [
    node('start', [
      N('Der Schießstand zwischen den Kränen. Zehn Dosen an Drähten, die im Hafenwind tanzen. Falke lehnt am Geländer und gähnt demonstrativ. Hafenarbeiter wetten in Zigaretten.'),
      L(V, 'Ich schieß. Du liest den Wind. Wie auf dem Dach. Die Wäsche, die Möwen, der Rauch vom Grill. Sag mir, wohin.', 'signatur'),
      L(F, 'Teamarbeit. Wie süß. Ich schieß allein. Weil ich gut bin.'),
    ], {
      choices: [
        {
          text: 'Neben Vega knien und ihr Wind und Entfernung ansagen.',
          effects: [{
            minigame: 'akt-schiessstand', level: 2, key: 'va-wettschiessen-vega', label: 'Adlerauge: Wind lesen',
            win: [{ give: 'vegas-fernrohr-geklaut' }, set('va_weg_vega'), rel(V, 20), { dialogue: 'va-wett-sieg' }],
            lose: [{ message: 'Vega trifft neun. Falke trifft zehn. Er macht ein Foto von seinem Ergebnis. Nochmal, solange es hell ist.' }],
          }],
        },
        {
          text: '„Ich schieß selbst. Vega, du schaust zu und lernst.“', check: 'gc-83',
          effects: [{ give: 'vegas-fernrohr-geklaut' }, set('va_weg_selbst')], next: 'selbst',
        },
        bye('„Moment. Ich muss erst den Wind fühlen.“'),
      ],
    }),
    node('selbst', [
      N('Zehn Schüsse. Zehn Dosen. Die letzte trifft deine Kugel genau im Moment, als eine Möwe vorbeisegelt. Die Möwe bleibt unverletzt und entsetzt.'),
      L(F, 'Das … das war Glück. Der Wind hat gedreht.'),
      L(V, 'Der Wind hat nicht gedreht. Du hast gezittert. Gib’s her, Falke. Und wisch deine Fingerabdrücke ab.', 'wut'),
      N('Falke schraubt das Fernrohr ab, als würde er sich einen Zahn ziehen.'),
    ]),
  ],
};

const wettSieg: DialogueDef = {
  id: 'va-wett-sieg',
  start: 'start',
  nodes: [
    node('start', [
      N('„Drei Grad links. Böe von der Wäscheleine. Jetzt.“ Vega atmet aus, drückt ab. Die zehnte Dose fliegt vom Draht, dreht sich zweimal in der Luft und landet in Falkes Kaffee.'),
      L(V, 'Zehn. Und das mit einem geliehenen Fernrohr, du Arsch.', 'signatur'),
      L(F, 'Das … ist noch nicht vorbei. Wir sehen uns.'),
      L(V, 'Ich seh dich jetzt schon. Ich seh dich immer. Das ist mein Job. Fernrohr. Her.'),
      N('Falke wirft es dir zu. Er wirft schlecht. Du fängst gut.'),
    ]),
  ],
};

// --------------------------------------------------------------------------------------------- Nachts im Wohnwagen
const wohnwagen: DialogueDef = {
  id: 'va-wohnwagen',
  start: 'start',
  nodes: [
    node('start', [
      N('Falkes Wohnwagen hinter dem Kran. Durch die dünne Wand: Schnarchen. Vega hatte recht, es ist B-Moll. Das Fernrohr liegt hinter dem Fenster auf einem Samtkissen, wie ein Pokal. Das Schloss am Fenster ist billig. Falke nicht.'),
    ], {
      choices: [
        {
          text: 'Das Fensterschloss knacken.',
          effects: [{
            minigame: 'akt-schloss', level: 2, key: 'va-wohnwagen-schloss', label: 'Falkes Wohnwagen',
            win: [{ give: 'vegas-fernrohr-geklaut' }, set('va_weg_nachts'), { message: 'Das Fernrohr ist in deiner Jacke. Falke schnarcht weiter. Unsportlich, aber effektiv.' }],
            lose: [{ message: 'Das Schloss klemmt. Drinnen setzt das Schnarchen kurz aus. Dann geht es in Dur weiter. Nochmal.' }],
          }],
        },
        bye('Leise wieder abziehen.'),
      ],
    }),
  ],
};

// --------------------------------------------------------------------------------------------- Rückgabe
const rueckgabe: DialogueDef = {
  id: 'va-rueckgabe',
  start: 'start',
  nodes: [
    node('start', [
      N('Vega nimmt das Fernrohr mit beiden Händen. Sie dreht es, findet den Kratzer, fährt mit dem Daumen über die Gravur. Ein kleines „V“. Daneben, so klein, dass man es kaum sieht: ein „J“.'),
      L(V, 'Jimmy hat das reingekratzt. Mit einem Nagel. Als er neun war. Er hat gesagt, dann vergesse ich ihn nie, auch wenn ich durch das Ding nur noch Ziele seh.', 'trauer'),
      L(V, 'Ich seh nicht nur Ziele. Danke, dass du mich dran erinnerst.'),
    ], {
      effects: [{ take: 'vegas-fernrohr-geklaut' }, set('va_fernrohr_zurueck')],
      choices: [
        { text: '„Wie hat Falke es gekriegt?“', next: 'wie' },
        { text: '„Schau mal durch. Was siehst du?“', next: 'durch' },
      ],
    }),
    node('wie', [
      L(V, 'Irgendwer aus der Crew hat es auf dem Schwarzmarkt vertickt. Irgendwer, der Geld brauchte. Ich will nicht wissen, wer. Wenn ich es weiß, muss ich was tun.', 'wut'),
    ], { next: 'durch' }),
    node('durch', [
      N('Sie hebt das Fernrohr ans Auge, schwenkt über die Dächer. Lange. Dann lacht sie, kurz und überrascht.'),
      L(V, 'Ich seh … die Stadt. Als ob jemand die Sterne auf den Boden geschüttet hätte. Frag mich irgendwann nachts noch mal. Dann zeig ich dir, was ich meine.'),
    ], {
      choices: [
        { text: 'Weiter.', when: not(VEXARIA), effects: [{ completeQuest: Q }] },
        { text: 'Weiter.', when: VEXARIA, effects: [{ cutscene: 'va-aria-dach' }] },
      ],
    }),
  ],
};

// Vex × Aria: Aria kommt aufs Dach, als Vega gerade „danke“ sagt.
const ariaDach: CutsceneDef = {
  id: 'va-aria-dach',
  title: 'Dachbesuch',
  beats: [
    tafel('Schritte auf der Feuerleiter. Schwer, schnell, ungeduldig. Aria schwingt sich über die Dachkante, Schläger auf dem Rücken, Haare zerzaust vom Wind.', [
      L(A, 'Ah. Hier steckst du, Rennsemmel. Ich such dich seit einer Stunde. Ich hab drei Leuten gedroht. Einer davon war ein Hund.'),
      L(V, 'Sie hat mein Fernrohr zurückgeholt, Aria. Sei nett.'),
      L(A, 'Ich bin immer nett. Ich bin gerade so nett, dass es wehtut.', 'verlegen'),
    ], 'in'),
    tafel('Aria stellt sich hinter Vex, legt ihr beide Arme um die Hüfte, das Kinn auf die Schulter, direkt über dem Gurtzeug. Ihr Atem ist warm am Ohr. Sie riecht nach Hafenwind und Kirschkaugummi.', [
      L(A, 'Du hast Falke vom Kran geholt? Oder ihm was geklaut? Egal. Beides heiß. Sag mir, dass du ihn wenigstens einmal angeschrien hast.', 'zaertlich'),
      L('player', 'Ich hab gar nicht geschrien, Zöpfe. Ich war cool.'),
      L(A, 'Lügnerin. Du schreist immer. Ich hör das gern.', 'zaertlich'),
    ]),
    tafel('Ihre Hand rutscht unter den Gurtriemen, die Finger gespreizt über deinem Bauch. Sie zieht dich rückwärts an sich, bis zwischen euch nichts mehr passt. Dann ein Kuss in den Nacken, langsam, und noch einer, tiefer, dort wo der Kragen aufhört.', [
      L(V, 'Ich … geh mal da rüber. Sterne gucken. Ganz weit da rüber. Mit Fernrohr. In die andere Richtung.'),
      L(A, 'Guter Plan, Vega. Wirklich guter Plan.', 'verlegen'),
    ]),
    tafel('Kaum ist Vega hinter dem Wassertank verschwunden, dreht Aria dich um, packt dich am Gurtzeug und küsst dich, als hätte sie den ganzen Tag darauf gewartet. Hart, dann weich, dann so, dass du das Dach unter den Füßen vergisst. Deine Ripper-Hand findet ihre Zöpfe, die andere ihren Hosenbund.'),
    tafel('„Heute Nacht, Postbotin“, flüstert sie dir an die Lippen. „Bei mir. Und dein Gurtzeug bleibt an der Tür.“', [
      L('player', 'Du bist echt unmöglich, Großmaul.'),
      L(A, 'Unmöglich gut. Komm. Bevor Vega mit dem Fernrohr wieder in unsere Richtung schaut.', 'zaertlich'),
    ]),
    tafel('Die Lichter der Stadt flackern unter euch. Was danach kommt, sieht nicht mal Vega.', undefined, 'out'),
  ],
  effects: [set('va_aria_dach'), rel(A, 30), { completeQuest: Q }],
};

// Kurze Zusatzzeile am Tisch in der High-Voltage nach der Quest, wenn Vex und Aria zusammen sind.
const tisch: DialogueDef = {
  id: 'va-tisch-vexaria',
  start: 'start',
  nodes: [
    node('start', [
      L(V, 'Ich hab euch übrigens gesehen. Auf dem Dach. Durchs Fernrohr. Aus Versehen. Zweimal aus Versehen.'),
      L(A, 'Vega! Das ist Spannen!', 'verlegen'),
      L(V, 'Das ist Aufklärung. Und ihr wart nicht leise. Die Möwen haben applaudiert.'),
      L(A, 'Die Möwen haben gar nichts. Sag was, Postbotin. Verteidige meine Ehre.', 'zaertlich'),
    ], {
      choices: [
        { text: 'Aria auf den Schoß ziehen. „Welche Ehre, Zöpfe?“', effects: [rel(A, 10), set('va_tisch_gesehen')], next: 'schoss' },
        { text: '„Vega, mach ein Foto. Für den Hochzeitsflyer.“', effects: [rel(V, 10), set('va_tisch_gesehen')], next: 'flyer' },
      ],
    }),
    node('schoss', [
      N('Aria landet auf deinem Schoß, quietscht empört und bleibt sitzen. Ihre Finger haken sich in deinen Gurtriemen. Sie flüstert dir etwas ins Ohr, das Vega die Augenbrauen bis in den Haaransatz treibt.'),
      L(V, 'Ich hol mir ein neues Bier. Und neue Augen.'),
    ]),
    node('flyer', [
      L(A, 'HOCHZEIT? Du – ich – wir haben noch nicht mal … ich bring dich um. Später. Nach dem Bier.', 'verlegen'),
      L(V, 'Ich mach das Foto. Mit Teleobjektiv.', 'signatur'),
    ]),
  ],
};

const items: Record<string, ItemDef> = {
  'vegas-fernrohr-geklaut': {
    id: 'vegas-fernrohr-geklaut', name: 'Vegas Fernrohr (zurückgeholt)', category: 'quest', icon: 'vegas-zielfernrohr', price: 0, sellable: false,
    description: 'Kratzer in Sternform, ein kleines „V“ in der Fassung. Und daneben ein „J“, so klein, dass man es kaum sieht.',
  },
};

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: {
    [falke.id]: falke, [wettschiessen.id]: wettschiessen, [wettSieg.id]: wettSieg, [wohnwagen.id]: wohnwagen,
    [rueckgabe.id]: rueckgabe, [tisch.id]: tisch,
  },
  cutscenes: { [ariaDach.id]: ariaDach },
  phone: { [start.id]: start },
  items,
  mapAdditions: {
    hafenkante: {
      hotspots: [
        {
          id: 'va-schlick', at: 'falke-kran', label: 'Das Fernrohr aus dem Schlick fischen', kind: 'use',
          when: all(active(Q), GEKAEMPFT, not(FERNROHR), noFlag('va_fernrohr_zurueck')),
          lines: [N('Falke hängt mit dem Gürtel am Ausleger und flucht in drei Sprachen. Sein Gewehr ist unten im Schlick gelandet, das Fernrohr gleich daneben. Du wischst es an seiner weißen Jacke ab. Die hängt praktischerweise auch da.')],
          effects: [{ give: 'vegas-fernrohr-geklaut' }],
        },
        { id: 'va-falke', at: 'falke-kran', label: 'Falke', kind: 'talk', dialogue: falke.id, when: all(active(Q), not(ZURUECK), time('tag')) },
        {
          id: 'va-wettschiessen', at: 'schiessstand', label: 'Wettschießen gegen Falke', kind: 'use', dialogue: wettschiessen.id,
          when: all(active(Q), flag('va_falke_getroffen'), not(ZURUECK), time('tag')),
        },
        {
          id: 'va-wohnwagen', at: 'falkes-wohnwagen', label: 'Falkes Wohnwagen', kind: 'use', dialogue: wohnwagen.id,
          when: all(active(Q), not(ZURUECK), time('nacht')),
        },
      ],
    },
    'neon-gasse': {
      hotspots: [
        {
          id: 'va-rueckgabe', at: 'vegas-ausguck', label: 'Vega das Fernrohr geben', kind: 'talk', dialogue: rueckgabe.id,
          when: all(active(Q), FERNROHR, time('morgen', 'abend', 'nacht')),
        },
      ],
    },
    'high-voltage': {
      hotspots: [
        {
          id: 'va-rueckgabe-hv', at: 'vega-aria-tisch', label: 'Vega das Fernrohr geben', kind: 'talk', dialogue: rueckgabe.id,
          when: all(active(Q), FERNROHR, not(VEXARIA), time('abend')),
        },
        {
          id: 'va-tisch-vexaria', at: 'vega-aria-tisch', label: 'Vega und Aria', kind: 'talk', dialogue: tisch.id,
          when: all(done(Q), flag('va_aria_dach'), VEXARIA_ZUSAMMEN, noFlag('va_tisch_gesehen'), time('abend')),
        },
      ],
    },
  },
};
