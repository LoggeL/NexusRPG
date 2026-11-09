// Hunters Auftragstafel (world.md §6.6): drei Aufträge pro Tag, ab Rang 3 ein Nachtauftrag ab 21:00, Laufzeit bis 02:00
// des Folgetags, Frühstücksbonus +25 %, Fehlschlag −2 Ruf. Die Vorlagen stehen in job-*.ts und kopfgeld-*.ts.
import type { JobBoardDef } from '../../../modules/jobs';
import type { ContentPart } from '../../part';
import { abRang, all } from './_lib';

const tafel: JobBoardDef = {
  name: 'Hunters Auftragstafel',
  faction: 'crew-hunter',
  ranks: [
    { min: 0, title: 'Laufbursche' },
    { min: 20, title: 'Handlanger' },
    { min: 40, title: 'Profi' },
    { min: 60, title: 'Spezialistin/Spezialist' },
    { min: 80, title: 'Hunters rechte Hand' },
  ],
  slots: 3,
  extraSlots: [{ when: all(abRang(3), { clockBetween: [1260, 1560] }), count: 1 }],
  firstJobBonus: 0.25,
  creditStep: 0.25,
  xpStep: 0.1,
  expiresAfterDays: 1,
  failRep: 2,
};

export const part: ContentPart = { jobBoards: { auftragstafel: tafel } };
