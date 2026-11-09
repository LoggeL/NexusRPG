// Nebenquest 11 `side-feierabend-fuer-kessel` „Feierabend für Wachtmeisterin Kessel“ (world.md §6.2 Nr. 11).
// Kessel (`wache`) am Entlassungstor, morgens, nach main-1-raven. Sie will Yogalehrerin werden.
// Fundkammer aufräumen (Dialog eisenhof-fundkammer der Karte, Flag kessel_fundkammer_sortiert) → drei Kisten fehlen
// (Freigang-Gang): Kampf enc-gerichtsplatz-gang (Karte) oder nachts zurückholen (Karte, kessel_kisten_zurueck)
// → Kündigung durchsetzen: gc-67 [Ausstrahlung 6] Richter überzeugen · gc-68 [Technik 5] Formular „vorgenehmigen“
// · ohne Check: Dienstweg (drei Stunden Warteschlange, 50 Cr Gebühr).
// Belohnung: behoerdenkarte, ravens-alte-jacke (falls noch nicht aus der Fundkammer), Kessel ♥ +100, Ruf unterstadt +5;
// Flag kessel_yogalehrerin (Kessel unterrichtet in side-thai-chi).
import type { ContentPart } from '../../part';
import type { CutsceneDef, DialogueDef, QuestDef } from '../../../modules/contracts';
import { active, all, any, dlg, done, flag, ich, inactive, l, msg, nar, node, noFlag, not, set, time, tschuess, VEX } from './_lib';

const Q = 'side-feierabend-fuer-kessel';
const W = 'wache';
const R = 'richter';
const KISTEN = any(flag('kessel_kisten_zurueck'), { won: 'enc-gerichtsplatz-gang' });
const KUENDIGUNG = flag('kessel_kuendigung');

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: 'Feierabend für Wachtmeisterin Kessel',
  summary: 'Zweiundzwanzig Jahre Dienst am Eisenhof. Kessel will kündigen und Yogalehrerin werden. Der Dienstweg ist länger als ihre Strichliste.',
  giver: W,
  act: 1,
  steps: [
    {
      id: 'fundkammer', text: 'Räum Kessels Fundkammer auf (Eisenhof, links neben dem Gericht). Ohne Übergabe keine Kündigung.',
      done: flag('kessel_fundkammer_sortiert'), marker: { map: 'eisenhof' },
    },
    {
      id: 'kisten', text: 'Hol Kiste 7, 8 und 9 von der Freigang-Gang zurück – am Gerichtsplatz mit Fäusten oder nachts heimlich aus ihrem Versteck hinter der Plane.',
      when: flag('kessel_fundkammer_sortiert'), done: KISTEN, marker: { map: 'eisenhof' },
    },
    {
      id: 'kuendigung', text: 'Setz die Kündigung durch: Richter überzeugen (Gerichtssaal, morgens), Formular am Behördenterminal „vorgenehmigen“ oder den Dienstweg gehen.',
      when: KISTEN, done: KUENDIGUNG, marker: { map: 'eisenhof' },
    },
    {
      id: 'kessel', text: 'Bring Kessel die unterschriebene Kündigung (Entlassungstor, morgens oder tagsüber).',
      when: KUENDIGUNG, done: flag('kessel_frei'), marker: { map: 'eisenhof' },
    },
  ],
  reward: {
    xp: 220,
    items: { behoerdenkarte: 1 },
    relations: { wache: 100 },
    rep: { unterstadt: 5 },
    effects: [set('kessel_yogalehrerin'), msg('Kessel schenkt dir ihre Behördenkarte. „Die brauch ich nicht mehr. Ich brauch jetzt eine Yogamatte.“')],
  },
};

// ---------------------------------------------------------------------------------------------- Kessel am Entlassungstor

const kessel: DialogueDef = dlg('side-kessel-tor', [
  node('start', [
    nar('Wachtmeisterin Kessel steht am Entlassungstor, Klemmbrett in der Hand, und macht einen Strich. Dann noch einen. Dann seufzt sie so tief, dass ihr Dienstabzeichen wackelt.'),
    l(W, 'Ich hoffe für Sie, dass wir uns nicht wiedersehen. Das sage ich jeden Morgen. Zu jedem. Seit zweiundzwanzig Jahren.', 'neutral'),
  ], {
    choices: [
      { text: '„Sie sehen aus, als bräuchten Sie Urlaub. Für immer.“', when: inactive(Q), next: 'traum' },
      { text: '„Die Fundkammer ist sortiert.“', when: all(active(Q), flag('kessel_fundkammer_sortiert'), not(KISTEN)), next: 'kisten' },
      { text: '„Hier. Ihre Kündigung. Gestempelt.“', when: all(active(Q), KUENDIGUNG, noFlag('kessel_frei')), next: 'frei' },
      { text: '„Wie läuft’s mit dem Feierabend?“', when: all(active(Q), not(KUENDIGUNG)), next: 'stand' },
      { text: '„Namaste, Frau Kessel.“', when: done(Q), next: 'danach' },
      tschuess('„Wir sehen uns nicht wieder.“'),
    ],
  }),
  node('traum', [
    l(W, 'Für immer. Hm.', 'besorgt'),
    nar('Sie sieht sich um. Niemand guckt. Sie zieht ein zerknittertes Faltblatt aus der Uniformtasche: „Yoga für Anfängerinnen – Atme die Stadt aus“.'),
    l(W, 'Ich will Yogalehrerin werden. Sagen Sie nichts. Ich weiß, wie das klingt. Ich höre es jeden Abend in meinem Kopf, in der Stimme meines Vorgesetzten.', 'verlegen'),
    l(W, 'Herabschauender Hund. Ich schaue seit zweiundzwanzig Jahren auf Hunde herab. Ich bin qualifiziert.'),
    l(W, 'Aber ohne ordentliche Übergabe gibt es keine Kündigung. Und die Fundkammer … die Fundkammer ist kein Raum. Die Fundkammer ist ein Zustand.', 'trauer'),
  ], {
    choices: [
      { text: '„Ich räum Ihre Fundkammer auf. Und dann sind Sie frei.“', next: 'zusage' },
      { text: '„Yoga? Ernsthaft? Sie haben letzte Woche einen Rentner wegen Spuckens verhaftet.“', next: 'spucken' },
      tschuess('„Viel Glück damit.“'),
    ],
  }),
  node('spucken', [
    l(W, 'Er hat auf meine Schuhe gespuckt. Das ist kein Spucken, das ist ein Angriff auf die Uniform.', 'wut'),
    l(W, 'Und ja. Ernsthaft. Ich will Leuten beibringen, wie man atmet. Hier atmet niemand. Hier hält jeder die Luft an, bis er rauskommt.', 'trauer'),
  ], { next: 'zusage-frage' }),
  node('zusage-frage', [l(W, 'Also? Helfen Sie mir, oder stehen Sie nur da wie ein Gerichtsvollzieher ohne Auftrag?')], {
    choices: [{ text: '„Ich helfe.“', next: 'zusage' }, tschuess('„Ich steh nur da.“')],
  }),
  node('zusage', [
    l(W, 'Die Fundkammer ist links neben dem Gericht. Ravens alte Jacke liegt da irgendwo, ein versiegelter Laptop von Dante und etwa dreihundert Kaffeebecher. Meine. Fassen Sie sie nicht an. Doch, fassen Sie sie an. Ich gebe auf.', 'neutral'),
    l(W, 'Ich mache einen Strich für Sie. In der Spalte „Hilfreich“. Die Spalte ist neu.'),
  ], { effects: [{ startQuest: Q }] }),
  node('stand', [
    l(W, 'Ich habe heute Morgen schon zwei Sonnengrüße gemacht. Im Wachhäuschen. Ich bin mit dem Ellbogen an den Alarmknopf gekommen. Das war ein Fehlalarm. Das war auch Yoga.', 'verlegen'),
  ]),
  node('kisten', [
    l(W, 'Sortiert? SORTIERT? Ich wusste nicht, dass das möglich ist.', 'ueberrascht'),
    l(W, 'Und Kiste 7, 8 und 9 … Die Freigang-Gang. Die sitzen am Gerichtsplatz auf meinen Kisten wie Hühner auf Eiern. Hühner mit Vorstrafen.', 'wut'),
    l(W, 'Ich darf da nicht eingreifen. Dienstvorschrift. Freigänger sind „im Vertrauensverhältnis“. Sie dürfen das. Sie haben kein Vertrauensverhältnis. Mit niemandem.'),
    ich('Tagsüber mit Gewalt, nachts mit Grips. Verstanden.'),
  ]),
  node('frei', [
    nar('Kessel nimmt das Papier. Sie liest es. Sie liest es noch mal. Dann nimmt sie die Dienstmütze ab, ganz langsam, als wäre sie aus Glas.'),
    l(W, 'Zweiundzwanzig Jahre. Neuntausendsechshundert Striche. Und jetzt ein Stempel.', 'trauer'),
    l(W, 'Ich hoffe für Sie, dass wir uns nicht wiedersehen.', 'zaertlich'),
    nar('Sie lächelt. Zum ersten Mal, seit du sie kennst, meint sie das Gegenteil.'),
    l(W, 'Außer beim Yoga. Dienstag und Donnerstag, sechs Uhr, Hinterhof in den Lötgassen. Ich habe schon jemanden, der kommen will. Er trägt eine Sonnenbrille und sagt, er sei nicht da.', 'freude'),
  ], {
    choices: [
      { text: '„Ich komm vorbei.“', next: 'jacke' },
      { text: '„Hunter? Beim Yoga? Das muss ich sehen.“', next: 'jacke' },
      { text: '[Vex] „Wenn ich morgens um sechs irgendwo bin, dann auf einem Dach. Aber für Sie mach ich eine Ausnahme.“', when: VEX, next: 'jacke' },
    ],
  }),
  node('jacke', [
    l(W, 'Und hier. Ravens Jacke, falls Sie sie noch nicht haben. Persönliche Habe. Ich hatte nie das Herz, sie wegzuwerfen. Ich hatte nie das Herz, sie zurückzugeben. Ich hatte nie das Herz für irgendwas. Jetzt schon.', 'zaertlich'),
  ], {
    effects: [set('kessel_frei')],
    choices: [
      { text: 'Die Jacke nehmen.', when: { noItem: 'ravens-alte-jacke' }, effects: [{ give: 'ravens-alte-jacke' }], next: 'abschied' },
      { text: '„Hab ich schon. Raven wird sich freuen.“', when: { item: 'ravens-alte-jacke' }, next: 'abschied' },
    ],
  }),
  node('abschied', [nar('Kessel klemmt sich die Mütze unter den Arm, dreht sich um und geht durch das Entlassungstor. Von innen nach außen. Das Drehkreuz quietscht, als würde es applaudieren.')], {
    effects: [{ cutscene: 'side-kessel-feierabend' }],
  }),
  node('danach', [l(W, 'Namaste. Und wenn Sie im Kurs quatschen, mache ich einen Strich. Alte Gewohnheit. Ich atme sie weg.', 'freude')]),
]);

// ---------------------------------------------------------------------------------------------- Richter (gc-67)

const richter: DialogueDef = dlg('side-kessel-richter', [
  node('start', [
    nar('Der Richter sitzt hinter seiner Bank und schneidet mit einer Gartenschere an einem Bonsai. Neben dem Hammer liegt ein Stapel Briefe. Ganz oben: „KÜNDIGUNG – KESSEL (3. Versuch)“.'),
    l(R, 'Kessel. Sie will gehen. Ohne Stempel. Ohne Formular. Ohne Respekt vor dem Verfahren. Schuldig.', 'wut'),
  ], {
    choices: [
      {
        text: '„Euer Ehren, eine Wachtmeisterin, die nicht mehr will, ist eine Wachtmeisterin, die wegguckt. Sie hat Dexter im Wäschekorb rausgelassen. Wollen Sie das wirklich weiter in Ihrem Gericht?“',
        check: 'gc-67', next: 'ueberzeugt',
      },
      { text: '„Dann eben ordnungsgemäß. Wo ist die Warteschlange?“', next: 'dienstweg' },
      tschuess('„Ich komm wieder.“'),
    ],
  }),
  node('ueberzeugt', [
    l(R, 'Im Wäschekorb.', 'ueberrascht'),
    l(R, 'Ich habe mich immer gefragt, warum der Korb so geschwitzt hat.'),
    nar('Der Richter nimmt den Stempel, haucht ihn an und knallt ihn auf die Kündigung, dass der Bonsai zittert.'),
    l(R, 'Kündigung angenommen. Mit sofortiger Wirkung. Und sagen Sie ihr: Sie war die einzige Wache, die je pünktlich zum Unkrautjäten kam. Das kommt nicht ins Protokoll.', 'zaertlich'),
  ], { effects: [set('kessel_kuendigung'), { relation: R, delta: 20 }] }),
  node('dienstweg', [
    l(R, 'Warteschlange C, Schalter 4, Formular K-7 in dreifacher Ausfertigung. Bearbeitungsgebühr fünfzig Credits. Bearbeitungszeit: drei Stunden. Wenn Sie Glück haben. Sie haben kein Glück.', 'signatur'),
  ], {
    choices: [
      {
        text: 'Anstellen, zahlen, warten. (50 Cr, 3 Stunden)', requires: { credits: 50 },
        effects: [{ credits: -50 }, { advanceTime: 180 }, set('kessel_kuendigung')], next: 'gewartet',
      },
      tschuess('„Ich find einen schnelleren Weg.“'),
    ],
  }),
  node('gewartet', [
    nar('Drei Stunden. Ein Automat mit Wartemarken, ein Ficus, der langsam stirbt, und ein Mann neben dir, der seit 2081 auf eine Baugenehmigung wartet. Er ist sehr gesprächig.'),
    nar('Dann: ein Stempel. Laut. Endgültig. Schön.'),
  ]),
]);

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: { [kessel.id]: kessel, [richter.id]: richter },
  cutscenes: {
    'side-kessel-feierabend': {
      id: 'side-kessel-feierabend',
      title: 'Feierabend',
      beats: [
        { image: 'black', caption: 'Eisenhof, Entlassungstor. Das Drehkreuz dreht nur nach außen.', fade: 'in', hold: 1300 },
        { image: 'black', caption: 'Zweiundzwanzig Jahre hat Kessel daneben gestanden. Heute geht sie hindurch.', hold: 1500 },
        { image: 'black', caption: 'Draußen bleibt sie stehen, schließt die Augen und atmet ein. Smog. Neon. Freiheit. In der Reihenfolge.', fade: 'out', hold: 1600 },
      ],
    } satisfies CutsceneDef,
  },
  mapAdditions: {
    eisenhof: {
      hotspots: [
        {
          id: 'q-kessel-tor', at: 'entlassungstor', radius: 64, label: 'Wachtmeisterin Kessel', kind: 'talk', dialogue: kessel.id,
          when: all(done('main-1-raven'), any(
            all(inactive(Q), time('morgen'), { not: { weekday: 'mi' } }),
            all(active(Q), time('morgen', 'tag')),
            all(done(Q), time('morgen')),
          )),
        },
        {
          id: 'q-kessel-formular', at: 'behoerden-terminal', radius: 56, label: 'Formular K-7 „vorgenehmigen“', kind: 'check', check: 'gc-68',
          when: all(active(Q), KISTEN, not(KUENDIGUNG)), hideWhen: KUENDIGUNG,
          lines: [nar('Das Behördenterminal. Im Menü „Personal“ wartet Kessels Kündigung seit Monaten auf eine Genehmigung. Das Feld „Vorgenehmigt durch“ ist leer. Und editierbar, wenn man weiß, wo.')],
          altText: 'Das Personalmenü will eine Dienstnummer, die du nicht hast. Bleibt der Richter im Gerichtssaal – mit Überzeugungskraft oder über den Dienstweg.',
          effects: [set('kessel_kuendigung'), msg('Kündigung „vorgenehmigt durch: Verwaltung“. Die Verwaltung bist jetzt du. Niemand wird das je prüfen. Niemand prüft hier irgendwas.')],
        },
      ],
    },
    gerichtssaal: {
      hotspots: [
        {
          id: 'q-kessel-richter', at: 'richterbank', radius: 64, label: 'Richter: Kessels Kündigung', kind: 'talk', dialogue: richter.id,
          when: all(active(Q), KISTEN, not(KUENDIGUNG), time('morgen', 'tag')),
        },
      ],
    },
  },
};

void flag; void ich;
