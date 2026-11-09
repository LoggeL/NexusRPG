// Vorbereitung prep-fluchtweg „Rückweg durch den Kanal“ (world.md §5.2). Bonus im Bruch: zusätzlicher Ausgang,
// main-2-kanal kürzer. Wege: Kampf enc-kanal-ratten (Rattenbrücke) · gc-26 Bürgermeister Gully · 3 schrott-ersatzteil
// spenden (Ruf kanalvolk +15).
import type { ContentPart } from '../../part';
import type { DialogueDef, QuestDef } from '../../../modules/contracts';
import { active, all, any, flag, l, nar, noFlag } from './_lib';

const Q = 'prep-fluchtweg';
const GESICHERT = 'fluchtweg_gesichert';
const OFFEN = all(active(Q), noFlag(GESICHERT));

const quest: QuestDef = {
  id: Q,
  kind: 'main',
  title: 'Vorbereitung: Rückweg durch den Kanal',
  summary: 'Rein kommt man immer. Raus ist die Kunst. Unter dem Campus läuft der alte Notausgang des Kanalvolks.',
  giver: 'raven',
  act: 1,
  autoStart: flag('plan_gefasst'),
  steps: [
    {
      id: 'fluchtweg',
      text: 'Sichere einen Rückweg durch den Kanal-Sammler.',
      done: any(flag(GESICHERT), { questStep: Q, step: 'weg-ratten' }, { questStep: Q, step: 'weg-gully' }, { questStep: Q, step: 'weg-spende' }),
    },
    {
      id: 'weg-ratten',
      text: 'Weg: Über die Rattenbrücke im Kanal-Sammler traut sich keiner mehr. Räum sie frei.',
      done: { won: 'enc-kanal-ratten' },
      optional: true,
      marker: { map: 'kanal-sammler', at: 'rattennest-2' },
      effects: [{ setFlag: GESICHERT }, { rep: 'kanalvolk', delta: 5 }],
    },
    {
      id: 'weg-gully',
      text: 'Weg: Bürgermeister Gully regiert das Kanalvolk (morgens und tagsüber im Rathaus). Überzeug ihn.',
      done: flag('fluchtweg_gully'),
      optional: true,
      marker: { map: 'kanal-sammler', at: 'gullys-rathaus' },
    },
    {
      id: 'weg-spende',
      text: 'Weg: Gully nimmt auch drei Schrott-Ersatzteile für die Pumpen.',
      done: flag('fluchtweg_spende'),
      optional: true,
      marker: { map: 'kanal-sammler', at: 'gullys-rathaus' },
    },
  ],
  reward: {
    xp: 50,
    effects: [
      { setFlag: 'prep_fluchtweg' },
      { message: 'Planungstafel: Rückweg abgehakt. Im Bruch: zusätzlicher Ausgang durch den Kanal.' },
    ],
  },
};

const gully: DialogueDef = {
  id: 'prep-fluchtweg-gully',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        nar('Das Rathaus des Kanalvolks ist ein umgedrehtes Boot auf Ziegelsteinen. Bürgermeister Gully trägt eine Krone aus Rohrschellen und einen Bademantel mit Amtskette.'),
        l('buergermeister-gully', 'Bürger! Besucher! Steuerzahler? Nein? Schade. Was wünscht die Oberwelt vom Unten?'),
        l('player', 'Einen Weg raus aus der Oberstadt. Durch eure Rohre. Diskret.'),
        l('buergermeister-gully', 'Diskret! Das Kanalvolk ist die Diskretion selbst. Wir sind so diskret, dass die Stadt vergessen hat, dass es uns gibt. Aber Wege kosten. Wege sind Infrastruktur. Infrastruktur ist Politik.'),
      ],
      choices: [
        { text: '„Wenn Quantum den Campus ausbaut, laufen deren Abwässer direkt in euer Wohnzimmer. Wir sind die Einzigen, die was dagegen tun.“', check: 'gc-26', next: 'ueberzeugt' },
        {
          text: 'Drei Schrott-Ersatzteile für die Pumpen spenden.',
          requires: { item: 'schrott-ersatzteil', min: 3 },
          effects: [{ take: 'schrott-ersatzteil', qty: 3 }],
          next: 'spende',
        },
        { text: '„Was kostet denn so ein Weg?“', next: 'preis' },
        { text: '„Ich komm wieder.“' },
      ],
    },
    {
      id: 'preis',
      lines: [
        l('buergermeister-gully', 'Drei Ersatzteile. Für die Pumpen. Echte, mit Gewinde, keine Dekoration.'),
        l('buergermeister-gully', 'Oder Sie räumen die Rattenbrücke frei. Da traut sich keiner mehr drüber, seit dort etwas wohnt, das mal eine Ratte war. Es hat Arme. Wir reden nicht darüber.'),
      ],
    },
    {
      id: 'ueberzeugt',
      lines: [
        l('buergermeister-gully', 'Abwasser … von OBEN? In UNSER Wohnzimmer?'),
        l('buergermeister-gully', 'Das ist … das ist Krieg! Umweltkrieg! Ich berufe sofort eine Sondersitzung ein. Mit mir. Ich bin dafür.'),
        l('buergermeister-gully', 'Der alte Notausgang hinter dem Trockendock führt bis unter den Campus-Zaun. Ich lasse ihn ölen. Höchstpersönlich. Also, Frieda ölt. Ich beaufsichtige.'),
      ],
      effects: [{ setFlag: 'fluchtweg_gully' }, { setFlag: GESICHERT }, { rep: 'kanalvolk', delta: 5 }],
    },
    {
      id: 'spende',
      lines: [
        l('buergermeister-gully', 'Ersatzteile! Echte! Mit GEWINDE!'),
        nar('Gully hält eines ins trübe Licht, als wäre es ein Juwel. Irgendwo hinter dem Boot jubeln mehrere Stimmen. Und eine Ratte.'),
        l('buergermeister-gully', 'Das Kanalvolk vergisst nie. Außer Geburtstage. Der Notausgang hinter dem Trockendock gehört Ihnen. Bringen Sie keine Wachen mit. Bringen Sie Kekse mit.'),
      ],
      effects: [{ setFlag: 'fluchtweg_spende' }, { setFlag: GESICHERT }, { rep: 'kanalvolk', delta: 15 }],
    },
  ],
};

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: { [gully.id]: gully },
  mapAdditions: {
    'kanal-sammler': {
      hotspots: [
        { id: 'prep-fluchtweg-gully', at: 'gullys-rathaus', label: 'Bürgermeister Gully: Fluchtweg', kind: 'talk', dialogue: gully.id, when: all(OFFEN, { time: ['morgen', 'tag'] }) },
        {
          id: 'prep-fluchtweg-tuer',
          at: 'fluchtweg-tuer',
          label: 'Notausgang',
          kind: 'look',
          when: flag(GESICHERT),
          lines: [nar('Eine Eisentür mit frischem Öl an den Angeln und einem Pappschild: „NOTAUSGANG · NUR FÜR FREUNDE DES KANALVOLKS · UND RATTEN“. Dahinter riecht es nach Oberstadt. Also nach Seife.')],
        },
      ],
      encounters: [
        { id: 'prep-fluchtweg-rattenbruecke', encounter: 'enc-kanal-ratten', at: 'rattennest-2', when: OFFEN, once: true },
      ],
    },
  },
};
