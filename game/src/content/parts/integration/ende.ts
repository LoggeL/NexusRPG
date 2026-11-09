// Integration: Platzhalter-Ende, solange Akt 2 und 3 fehlen (ENDING in content/world.ts zeigt hierher).
import type { ContentPart } from '../../part';

export const part: ContentPart = {
  cutscenes: {
    'ende-fortsetzung-folgt': {
      id: 'ende-fortsetzung-folgt',
      title: 'Fortsetzung folgt',
      gallery: false,
      beats: [
        { image: 'black', fade: 'in', caption: 'Noxius, 2086. Die Stadt atmet noch. Ihr auch.', hold: 1800 },
        { image: 'black', caption: 'FORTSETZUNG FOLGT', hold: 3000 },
        { image: 'black', caption: 'Akt 2 „Der Chip“ und Akt 3 sind in Arbeit. Bis dahin: Die Unterstadt gehört dir.', hold: 2000 },
      ],
    },
  },
};
