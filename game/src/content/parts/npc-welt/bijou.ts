// Bijou – Roboterpudel der Chrome-Schwestern (world.md §4.5, Zone chrome-boulevard = Akt 2, side-chrome-pudel).
// In Akt 1 laut Plan nur nachts schlafend auf dem Sofa im Penthouse, solange side-alte-gewohnheiten läuft
// (Leckerli-Hotspot an der Karte). Herz-Ereignisse 2/4 folgen mit chrome-boulevard in Akt 2 (gaps/npc-welt.md).
import type { ContentPart } from '../../part';
import { einSatz, erz, geschenke, ort, rede, sammle, weg, weltfigur } from './_welt';

const ID = 'bijou';

const T = {
  schlaf: einSatz('bijou-tag-schlaf', [
    erz('Auf dem Samtsofa liegt ein Pudel aus poliertem Chrom, die Locken aus feinen Federn. Er schnarcht elektrisch. Bei jedem Atemzug blinkt ein kleines Herz auf seinem Halsband.'),
    erz('Ein Ohr zuckt. Bijou träumt. Vermutlich von Schrauben. Besser, er wacht nicht auf.'),
  ]),
};

const bijou = weltfigur({
  id: ID,
  name: 'Bijou',
  unknownName: 'Chrompudel',
  faction: 'chrome-haus',
  bio: 'Roboterpudel der Chrome-Schwestern, poliertes Chrom, Federlocken, Herz am Halsband. Liebt Schrauben-Leckerli, hasst Waschmaschinen. Haut gern ab.',
  gifts: geschenke({
    loves: ['quietsche-mutter', 'rostige-schraube', 'teddyfell-buerste'],
    likes: ['oelkaennchen', 'murmelbeutel', 'plueschmoehre'],
    dislikes: ['seidentuch-rot', 'parfuem-ozon'],
    hates: ['waschpulver', 'magnet-stoerer'],
  }),
  schedule: [
    ort('N', 'chrome-penthouse', 'sofa-bijou', { when: { quest: 'side-alte-gewohnheiten', state: 'active' } }),
    weg(),
  ],
  talk: [rede('bijou-tag-schlaf')],
});

export const part: ContentPart = {
  npcs: { [ID]: bijou },
  dialogues: sammle(T.schlaf),
};
