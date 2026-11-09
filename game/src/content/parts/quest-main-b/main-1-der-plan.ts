// Hauptquest main-1-der-plan „Hunters großer Plan“ (world.md §5.2): Briefing im Hinterzimmer.
// Mit geruecht-master → warnung_ki · gc-28 → notschalter · [Raven ♥4] „Diesmal ohne Ego, Hunter.“
// Abschluss setzt plan_gefasst: Die fünf Vorbereitungen (prep-*) starten, die Planungstafel öffnet sich (planungstafel.ts).
import type { ContentPart } from '../../part';
import type { DialogueDef, PhoneMessageDef, QuestDef } from '../../../modules/contracts';
import { ARIA_ROM_GENERIC, VEXARIA, active, all, done, flag, l, nar, noFlag } from './_lib';

const Q = 'main-1-der-plan';

const quest: QuestDef = {
  id: Q,
  kind: 'main',
  title: 'Hunters großer Plan',
  summary: 'Hunter ruft die Crew ins Hinterzimmer. Ein Chip, ein Labor, eine Releaseparty – und eine sehr kleine Chance.',
  giver: 'hunter',
  act: 1,
  autoStart: done('main-1-dante'),
  steps: [
    {
      id: 'briefing',
      text: 'Komm ins Hinterzimmer des High Voltage zur Crew-Besprechung.',
      done: flag('plan_gefasst'),
      marker: { map: 'hv-hinterzimmer' },
    },
  ],
  reward: {
    xp: 80,
    effects: [{ message: 'Die Planungstafel im Hinterzimmer ist offen: fünf Vorbereitungen, mindestens zwei davon vor dem Bruch.' }],
  },
};

const briefing: DialogueDef = {
  id: 'main-1-der-plan-briefing',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        nar('Das Hinterzimmer ist zu klein für sechs Leute und ein Ego wie Hunters. Vega lehnt an der Wand, Aria sitzt verkehrt herum auf einem Stuhl, Raven steht am Fenster. Nyra hat Captain Kuschel auf dem Schoß und streichelt ihm nervös die Ohren.'),
        nar('Auf dem Planungstisch liegt ein Stadtplan, der nach Oberstadt riecht: teures Papier, keine Kaffeeflecken. Noch nicht.'),
        l('hunter', 'Gut. Alle da. Außer dem, der fehlt. Fangen wir trotzdem an.', 'neutral'),
        l('hunter', 'In ein paar Wochen schmeißt Quantum die größte Releaseparty aller Zeiten. Vorher lagern sie im Labor auf dem Campus etwas, das ihnen sehr viel wert ist. Einen Chip. Und die Daten dazu.', 'signatur'),
        l('raven', 'Den Chip? Denselben?', 'wut'),
        l('hunter', 'Denselben Ärger, jedenfalls. Wir holen ihn. Wir holen die Daten. Und wir verkaufen beides an die Leute, die Quantum am meisten hassen. Das sind viele. Das wird teuer.', 'neutral'),
        l('aria', 'Ich hab nur gehört: Einbruch, Oberstadt, teuer. Ich bin dabei. Wen darf ich hauen?', 'freude'),
        l('vega', 'Campus-Mauer: vier Meter. Kameras alle zwölf Meter. Zwei Streifen, Schichtwechsel unbekannt. Machbar. Aber nicht blind.', 'neutral'),
      ],
      next: 'fragen',
    },
    {
      id: 'fragen',
      lines: [l('hunter', 'Fragen? Einwände? Kluge Ideen? Letzteres bitte zuerst, ich hab nicht ewig Zeit.', 'neutral')],
      choices: [
        {
          text: '„Die Quantum-Fahrer erzählen, ihr Chef will von der Neuen im Labor ‚Master‘ genannt werden. Die Neue, die nie schläft.“',
          tag: '[Gerücht]', when: { item: 'geruecht-master' }, once: true, id: 'master', next: 'master',
        },
        {
          text: '„Wenn da drin was Großes läuft, brauchen wir einen Notschalter. Etwas, das im Labor den Strom kappt, wenn’s schiefgeht.“',
          check: 'gc-28', once: true, id: 'notschalter', next: 'notschalter',
        },
        {
          text: '„Diesmal ohne Ego, Hunter. Keiner kettet keinen an ein Rohr.“',
          tag: '[Raven ♥4]', requires: { hearts: 'raven', min: 4 }, once: true, id: 'ego', next: 'ego',
        },
        { text: '(Unter dem Tisch stößt Arias Stiefel gegen deinen. Und bleibt da.)', when: VEXARIA, once: true, id: 'stiefel', next: 'stiefel' },
        { text: '(Aria beugt sich zu dir rüber, bis ihr Zopf deine Wange streift.)', when: ARIA_ROM_GENERIC, once: true, id: 'zopf', next: 'zopf' },
        { text: '„Wer macht was?“', next: 'aufgaben' },
      ],
    },
    {
      id: 'master',
      lines: [
        l('nyra', 'Die nie schläft … Leute, das ist keine Laborassistentin. Das klingt nach einer KI. Einer großen. Einer sehr großen.', 'besorgt'),
        l('hunter', 'Eine KI, die man „Master“ nennen soll. Großartig. Wir klauen also einem Gott das Spielzeug.', 'besorgt'),
        l('vega', 'Dann gehen wir leiser rein. Und schneller raus.', 'neutral'),
        l('raven', 'Und keiner fasst irgendwas an, das blau leuchtet.', 'signatur'),
      ],
      effects: [{ setFlag: 'warnung_ki' }],
      next: 'fragen',
    },
    {
      id: 'notschalter',
      lines: [
        l('nyra', 'Ein Unterbrecher im Versorgungsbus … wenn ich vorher ins Netz komme, kann ich das als Schleife legen. Ein Signal. Alles aus. Licht, Kameras, alles.', 'ueberrascht'),
        l('hunter', 'Ein Knopf. Ich liebe Knöpfe. Mach das.', 'freude'),
        l('nyra', 'Das ist nicht so einfach wie ein Knopf. … Okay, am Ende ist es ein Knopf.', 'freude'),
      ],
      effects: [{ setFlag: 'notschalter' }],
      next: 'fragen',
    },
    {
      id: 'ego',
      lines: [
        nar('Es wird still. Raven dreht sich vom Fenster weg. Hunter nimmt die Sonnenbrille ab. Das hat seit Jahren keiner gesehen.'),
        l('hunter', '…Diesmal ohne Ego. Ja.', 'besorgt'),
        l('raven', 'Ich nehm dich beim Wort, Hunter. Du hast nur noch eins.', 'neutral'),
      ],
      effects: [{ setFlag: 'plan_ohne_ego' }, { relation: 'raven', delta: 40 }, { relation: 'hunter', delta: 20 }],
      next: 'fragen',
    },
    {
      id: 'stiefel',
      lines: [
        l('aria', 'Was? Ich hab lange Beine. Und der Tisch ist klein.', 'signatur'),
        nar('Ihr Stiefel bleibt, wo er ist. Dann wandert er ein Stück höher, an deinem Schienbein entlang, ganz langsam, während Hunter über Kameraabstände redet. Du verstehst kein Wort von dem, was Hunter sagt.'),
        nar('Vega schaut zwischen euch hin und her und schreibt etwas in ihr Notizbuch, das verdächtig nach einer Strichliste aussieht.'),
        l('vega', 'Zwei Meter Abstand, ihr zwei. Wir planen einen Einbruch, keine Hochzeit.', 'neutral'),
        l('aria', 'Halt die Fresse, Vega.', 'verlegen'),
      ],
      effects: [{ relation: 'aria', delta: 20 }],
      next: 'fragen',
    },
    {
      id: 'zopf',
      lines: [
        l('aria', '(flüstert) Wenn wir das überleben, schuldest du mir einen Abend. Einen ganzen. Ohne Hunter, ohne Ratten, ohne Kameras.', 'zaertlich'),
        l('hunter', 'Aria. Ich höre dich flüstern. Ich höre immer alles.', 'neutral'),
        l('aria', 'Dann hör weg, Opa.', 'verlegen'),
      ],
      effects: [{ relation: 'aria', delta: 20 }],
      next: 'fragen',
    },
    {
      id: 'aufgaben',
      lines: [
        l('hunter', 'Gute Frage. Bevor wir losschlagen, brauchen wir Vorbereitung. Fünf Dinge. Mindestens zwei davon, sonst geh ich nicht mal pinkeln, geschweige denn auf den Campus.', 'signatur'),
        l('hunter', 'Eins: einen Grundriss vom Labor. Zwei: eine Zugangskarte. Drei: die Streifenzeiten. Vier: einen Rückweg, der nicht durchs Haupttor führt. Fünf: eine Ablenkung am Haupttor.', 'neutral'),
        l('hunter', 'Die Liste hängt an der Planungstafel. Wer was erledigt, hakt ab. Sind zwei Haken dran, sagt ihr mir Bescheid – an der Tafel. Dann schlagen wir los.', 'neutral'),
        l('raven', 'Und Dante?', 'besorgt'),
        l('hunter', 'Dante hat Nein gesagt. Dann ist es Nein.', 'trauer'),
        nar('Captain Kuschel klappt beide Ohren nach unten. Nyra streicht sie sanft wieder hoch.'),
      ],
      effects: [{ setFlag: 'plan_gefasst' }],
    },
  ],
};

const telefon: PhoneMessageDef = {
  id: 'tel-hunter-briefing',
  from: 'hunter',
  text: 'Hinterzimmer, sobald du kannst. Crew-Besprechung. Wer zu spät kommt, zahlt die Getränke. Für immer. – H.',
  auto: active(Q),
  replies: [{ text: 'Unterwegs.' }],
};

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: { [briefing.id]: briefing },
  phone: { [telefon.id]: telefon },
  news: {
    'news-main-1-der-plan': {
      id: 'news-main-1-der-plan',
      anchor: 'delya-delloraine',
      headline: 'Chrome 10 gratis für alle?',
      lines: [
        l('delya-delloraine', 'Exklusiv: Chrome 10 ist ab morgen gratis für alle Bürger!', 'ueberrascht'),
        l('collin-charleston', 'Gratis? Ich liebe gratis.', 'freude'),
      ],
      when: done(Q),
      priority: 5,
    },
  },
  mapAdditions: {
    'hv-hinterzimmer': {
      onEnter: [
        { id: 'main-1-der-plan-besprechung', when: all(active(Q), noFlag('plan_gefasst')), dialogue: briefing.id },
      ],
      hotspots: [
        {
          id: 'main-1-der-plan-tisch',
          at: 'planungstisch',
          label: 'Crew-Besprechung',
          kind: 'talk',
          dialogue: briefing.id,
          when: all(active(Q), noFlag('plan_gefasst')),
        },
      ],
    },
  },
};
