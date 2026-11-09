// Vorbereitung prep-zugangskarte „Zugangskarte“ (world.md §5.2). Bonus im Bruch: Seiteneingang, eine Wachgruppe weniger.
// Wege: Wachmann Pfeffer Fr/Sa im High Voltage: gc-23 Taschendiebstahl, gc-24 Karaoke-Wette · behoerdenkarte an der
// Werkbank im Crew-Quartier umprogrammieren (Leitungs-Hack) · Kampf enc-gasse-pfeffer in der Neon-Gasse (Fr/Sa nachts).
import type { ContentPart } from '../../part';
import type { DialogueDef, Effect, QuestDef } from '../../../modules/contracts';
import { VEX, NOT_VEX, active, all, any, flag, l, nar } from './_lib';

const Q = 'prep-zugangskarte';
const KARTE = 'zugangskarte-quantum';
const OFFEN = all(active(Q), { noItem: KARTE });
const PFEFFER_DA = all(OFFEN, { weekday: ['fr', 'sa'] }, { time: ['abend', 'nacht'] });
const KARTE_HER = (weg: string): Effect[] => [{ give: KARTE }, { setFlag: weg }];

const quest: QuestDef = {
  id: Q,
  kind: 'main',
  title: 'Vorbereitung: Zugangskarte',
  summary: 'Eine echte Quantum-Karte, und wir gehen durch den Seiteneingang statt durch die Wand. – Hunter',
  giver: 'hunter',
  act: 1,
  autoStart: flag('plan_gefasst'),
  steps: [
    {
      id: 'karte',
      text: 'Besorge eine Quantum-Zugangskarte.',
      done: any({ item: KARTE }, { questStep: Q, step: 'weg-pfeffer' }, { questStep: Q, step: 'weg-behoerdenkarte' }, { questStep: Q, step: 'weg-kampf' }),
    },
    {
      id: 'weg-pfeffer',
      text: 'Weg: Wachmann Pfeffer trinkt freitags und samstags abends im High Voltage. Seine Karte hängt an einem Jojo-Band.',
      done: flag('zugangskarte_pfeffer'),
      optional: true,
      marker: { map: 'high-voltage' },
    },
    {
      id: 'weg-behoerdenkarte',
      text: 'Weg: Die Behördenkarte an der Werkbank im Crew-Quartier auf Quantum umprogrammieren.',
      when: { item: 'behoerdenkarte' },
      done: flag('zugangskarte_umprogrammiert'),
      optional: true,
      marker: { map: 'crew-quartier' },
    },
    {
      id: 'weg-kampf',
      text: 'Weg: Pfeffer geht Fr/Sa nachts durch die Neon-Gasse heim. Man könnte ihn … überzeugen.',
      done: { won: 'enc-gasse-pfeffer' },
      optional: true,
      marker: { map: 'neon-gasse' },
      effects: [
        { give: KARTE },
        { wanted: 1 },
        { message: 'Pfeffers Karte gehört jetzt dir. Seine Dienstdrohne hat alles aufgenommen – der Ordnungsdienst wird sich dein Gesicht merken.' },
      ],
    },
  ],
  reward: {
    xp: 50,
    effects: [
      { setFlag: 'prep_zugangskarte' },
      { message: 'Planungstafel: Zugangskarte abgehakt. Im Bruch: Seiteneingang, eine Wachgruppe weniger.' },
    ],
  },
};

const karaoke: Effect = {
  minigame: 'akt-karaoke', level: 2, key: 'prep-zugangskarte-karaoke', label: 'Karaoke-Wette gegen Pfeffer',
  win: [...KARTE_HER('zugangskarte_pfeffer'), { message: 'Pfeffer drückt dir schluchzend die Karte in die Hand: „Das war schöner als mein Leuchtturm.“' }],
  lose: [{ message: 'Pfeffer gewinnt mit einer Träne im Auge. „Revanche? Nächste Woche? Ich übe!“' }],
};

const pfeffer: DialogueDef = {
  id: 'prep-zugangskarte-pfeffer',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        nar('Wachmann Pfeffer: Quantum-Uniform mit offenem Kragen, drei leere Gläser, ein volles. Am Gürtel baumelt eine Zugangskarte an einem Jojo-Band, das bei jeder Bewegung fröhlich hüpft.'),
        l('pfeffer', 'Feierabend! Endlich Feierabend! Wissen Sie, was ich den ganzen Tag mache? Ich stehe. Vor einer Tür. Und die Tür steht vor mir. Wir starren uns an. Die Tür gewinnt immer.'),
        l('pfeffer', 'Gleich ist Karaoke. Ich bin gut. Ich bin SEHR gut. Meine Tochter Mila sagt, ich klinge wie ein Wal mit Liebeskummer. Das ist ein Kompliment. Wale sind majestätisch.'),
      ],
      choices: [
        { text: '(Ihm auf die Schulter klopfen und dabei das Jojo-Band abknipsen.)', check: 'gc-23', when: NOT_VEX, next: 'dieb' },
        { text: '(Kurierhände. Klaps, Lachen, Klick – wie eine Paketübergabe im Vorbeifahren.)', check: 'gc-23', when: VEX, next: 'dieb' },
        { text: '„Wette: Ich sing besser als du. Wer verliert, gibt dem anderen, was er am Gürtel trägt.“', check: 'gc-24', next: 'wette' },
        { text: '„Was macht man so als Quantum-Wachmann?“', next: 'plausch' },
        { text: 'Ihn in Ruhe trinken lassen.' },
      ],
    },
    {
      id: 'plausch',
      lines: [
        l('pfeffer', 'Ich bewache Tor drei. Labortrakt. Da kommt keiner rein ohne Karte. Ich hab eine Karte!'),
        l('pfeffer', 'Also, eigentlich gehört sie Dr. Pflaume. Der hat sie beim Kegeln verloren, und ich hab sie gefunden, und seitdem darf ich in die Kantine im Labortrakt. Die haben Pudding. Mit Haut.'),
        l('pfeffer', 'Erzählen Sie das keinem. Vor allem nicht Mila. Mila glaubt, ich bin ein Held.'),
      ],
      choices: [
        { text: '(Jetzt das Jojo-Band abknipsen.)', check: 'gc-23', next: 'dieb' },
        { text: '„Klingt, als bräuchtest du eine Wette. Karaoke. Um die Karte.“', check: 'gc-24', next: 'wette' },
        { text: '„Grüß Mila.“' },
      ],
    },
    {
      id: 'dieb',
      lines: [
        nar('Ein Klaps auf die Schulter, ein Lachen über einen Witz, den er gar nicht gemacht hat, ein leises Klick. Das Jojo-Band schnurrt zurück an den Gürtel. Ohne Karte.'),
        l('pfeffer', 'Sie sind nett! Netter als die Tür!'),
      ],
      effects: KARTE_HER('zugangskarte_pfeffer'),
    },
    {
      id: 'wette',
      lines: [
        l('pfeffer', 'Eine WETTE? Oh, das ist gut. Das ist sehr gut. Mila wird stolz sein. Oder entsetzt. Meistens beides.'),
        nar('Ihr steigt auf die Bühne. Pfeffer singt eine Ballade über einen Leuchtturm, den niemand mehr liebt. Zwei Gäste weinen. Einer davon ist Ripper. Dann bist du dran.'),
      ],
      choices: [
        { text: 'Singen.', effects: [karaoke] },
        { text: '„Weißt du was? Du hast gewonnen. Behalt die Karte.“' },
      ],
    },
  ],
};

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: { [pfeffer.id]: pfeffer },
  mapAdditions: {
    'high-voltage': {
      hotspots: [
        { id: 'prep-zugangskarte-pfeffer', at: 'pfeffer-tisch', label: 'Wachmann Pfeffer', kind: 'talk', dialogue: pfeffer.id, when: PFEFFER_DA },
      ],
    },
    'crew-quartier': {
      hotspots: [
        {
          id: 'prep-zugangskarte-werkbank',
          at: 'werkbank',
          label: 'Behördenkarte auf Quantum umprogrammieren',
          kind: 'use',
          when: all(OFFEN, { item: 'behoerdenkarte' }),
          lines: [nar('Ordnungsdienst und Quantum benutzen denselben Kartenrohling. Natürlich. Einer hat ihn erfunden, der andere hat ihn gekauft. Ein Klon des Chips, eine neue Signatur …')],
          effects: [{
            minigame: 'akt-hacken', level: 3, key: 'prep-zugangskarte-umprogrammieren', label: 'Kartenchip klonen',
            win: [...KARTE_HER('zugangskarte_umprogrammiert'), { message: 'Die geklonte Karte blinkt grün. Die Behördenkarte behältst du – sie merkt nichts.' }],
            lose: [{ message: 'Die Karte zischt und riecht nach verbranntem Haar. Noch mal, langsamer.' }],
          }],
        },
      ],
    },
    'neon-gasse': {
      encounters: [
        {
          id: 'prep-zugangskarte-heimweg',
          encounter: 'enc-gasse-pfeffer',
          at: 'pfeffer-gasse',
          sprite: 'quantum-wachmann-walk',
          when: all(OFFEN, { weekday: ['fr', 'sa'] }, { time: 'nacht' }),
          once: true,
        },
      ],
    },
  },
};
