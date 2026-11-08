// TESTINHALT – Dialoge. Check-Optionen zeigen „[Technik 6]“; jede braucht einen anderen Weg zum Ziel.
import type { DialogueDef } from '../modules/contracts';

export const DIALOGUES: Record<string, DialogueDef> = {
  'test-raven-chip': {
    id: 'test-raven-chip',
    start: 'start',
    nodes: [
      {
        id: 'start',
        lines: [
          { speaker: 'raven', text: 'Da bist du ja, {name}. Hunter sagt, du kennst dich mit Technik aus.' },
          { speaker: 'raven', text: 'Auf diesem Chip ist irgendwas, für das Leute Ärger machen. Kriegst du ihn auf?' },
        ],
        choices: [
          {
            text: 'Ich sehe mir den Chip an.', check: 'test-chip-technik', next: 'erfolg',
            effects: [{ setFlag: 'test-chip-entschluesselt' }, { relation: 'raven', delta: 30 }],
          },
          { text: 'Ich kenne da wen auf der Straße.', check: 'test-gosse', next: 'gosse' },
          { text: 'Dante hat doch einen Scanner. Ich frag ihn.', next: 'dante', effects: [{ give: 'datenchip' }] },
          { text: 'Wer bist du eigentlich?', next: 'wer', once: true },
          { text: 'Später.' },
        ],
      },
      {
        id: 'erfolg',
        lines: [
          { speaker: 'narrator', text: 'Ein paar Handgriffe, ein Funke – der Chip spuckt eine Lagerliste aus.' },
          { speaker: 'raven', portrait: 'angry', text: 'Das sind unsere Kisten. Jemand beklaut die Crew.' },
        ],
        effects: [{ sfx: 'hack' }],
      },
      {
        id: 'gosse',
        lines: [{ speaker: 'raven', text: 'Straßenkontakte, hm? Gut. Aber erst mal sehen wir selbst nach.' }],
        next: 'start',
      },
      {
        id: 'dante',
        lines: [{ speaker: 'raven', text: 'Gute Idee. Hier, nimm ihn mit. Und verlier ihn nicht.' }],
      },
      {
        id: 'wer',
        lines: [{ speaker: 'raven', text: 'Raven. Mehr musst du erst mal nicht wissen.' }],
        effects: [{ setFlag: 'raven-bekannt' }],
        next: 'start',
      },
    ],
  },
  'test-raven-alltag': {
    id: 'test-raven-alltag',
    start: 'start',
    nodes: [
      {
        id: 'start',
        lines: [{ speaker: 'raven', text: 'Alles ruhig. Zu ruhig.' }],
        choices: [
          { text: 'Willst du ein Stück mitkommen?', tag: '[Raven ♥3]', requires: { hearts: 'raven', min: 3 }, next: 'nett' },
          { text: 'Bis später.' },
        ],
      },
      { id: 'nett', lines: [{ speaker: 'raven', text: 'Vielleicht. Wenn du nicht wieder über Synth-Kaffee redest.' }], effects: [{ relation: 'raven', delta: 10 }] },
    ],
  },
  'test-raven-herz-2': {
    id: 'test-raven-herz-2',
    start: 'start',
    nodes: [
      {
        id: 'start',
        lines: [
          { speaker: 'raven', text: 'Du bist ja immer noch da. Respekt.' },
          { speaker: 'raven', text: 'Wenn dich jemand blöd anmacht: Sag mir Bescheid.' },
        ],
      },
    ],
  },
  'test-dante-alltag': {
    id: 'test-dante-alltag',
    start: 'start',
    nodes: [
      {
        id: 'start',
        lines: [{ speaker: 'dante', text: 'Willkommen an Dantes Stand. Alles fast legal.' }],
        choices: [
          {
            text: 'Kannst du diesen Chip scannen?', when: { item: 'datenchip' }, next: 'scan',
            effects: [{ take: 'datenchip' }, { setFlag: 'test-chip-entschluesselt' }, { relation: 'dante', delta: 20 }],
          },
          { text: 'Zeig mir, was du hast.', effects: [{ shop: 'test-kiosk' }] },
          { text: 'Schöner Tag noch.' },
        ],
      },
      {
        id: 'scan',
        lines: [
          { speaker: 'dante', text: 'Hm. Eine Lagerliste. Eure Kisten, oder?' },
          { speaker: 'dante', text: 'Sag Raven, sie schuldet mir einen Kaffee.' },
        ],
      },
    ],
  },
};
