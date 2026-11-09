// Gullys Kanalbrett (world.md §6.6, ab Ruf kanalvolk 10 – die Sperre sitzt am Hotspot in maps/kanal-sammler.ts).
// Vorlagen: job-kanal (job-kanal.ts) und die Rohrpost hier. Rohrpost: Dose abliefern (ohne Check) oder unterwegs lesen
// (Ruf kanalvolk −2, dafür ein Gerücht); `[Reflexe 4]` spart den Abstieg.
import type { DialogueDef, ItemDef, JobTemplateDef } from '../../../modules/contracts';
import type { JobBoardDef } from '../../../modules/jobs';
import type { ContentPart } from '../../part';
import { type Ziel, fertig, vorlage, ziele, zielSpot, zusatz } from './_auftrag';
import { N, P, all, byId, c, chk, dlg, item, job, msg, node, rep, take, zeit } from './_lib';

const J = 'job-gully-rohrpost';
const DOSE = 'pj-rohrpost-dose';

const brett: JobBoardDef = {
  name: 'Gullys Kanalbrett', faction: 'kanalvolk', slots: 2,
  ranks: [{ min: 10, title: 'Gast im Kanal' }, { min: 30, title: 'Freund des Kanals' }, { min: 60, title: 'Ehrenratte' }],
};

const ZIELE: (Ziel & { key: string })[] = [
  { key: 'rohr', map: 'rohrsiedlung', spot: 'rohrschacht', label: 'Rohrsiedlung, Rohrschacht' },
  { key: 'loet', map: 'loetgassen', spot: 'gully', label: 'Lötgassen, Gully' },
  { key: 'markt', map: 'schrottmarkt', spot: 'kanalgitter', label: 'Schrottmarkt, Kanalgitter' },
];

const dose: ItemDef = {
  id: DOSE, name: 'Rohrpost-Dose', category: 'quest', icon: 'kurierpaket', price: 0, sellable: false,
  description: 'Eine verbeulte Konservendose mit Wachssiegel und Gullys Kronkorken-Wappen. Drinnen raschelt Papier. Lesen ist unhöflich. Sehr unhöflich.',
};

const tpl: JobTemplateDef = vorlage({
  id: J, kind: 'kurier', title: 'Rohrpost: {ziel}',
  text: 'Bürgermeister Gully verschickt Amtspost. In Dosen. Durch Rohre, die nicht mehr gehen. Bring die Dose zum Empfänger an der Oberfläche. {credits} Cr und die Dankbarkeit des Kanalvolks.',
  boards: ['gullys-kanalbrett'], targets: ziele(ZIELE), item: DOSE,
  reward: { credits: [35, 45], xp: 30, rep: { kanalvolk: 3 } },
});

const zustellen = (z: Ziel & { key: string }, i: number): DialogueDef => dlg(`pj-rohrpost-${z.key}`, [
  node('start', [N(`${z.label}. Unten im Schacht leuchtet eine Stirnlampe. Eine Hand winkt nach oben. Der Empfänger kommt nicht hoch. Empfänger kommen nie hoch.`)], {
    choices: [
      c('Die Dose zielgenau in die winkende Hand werfen.', 'zugestellt', { check: chk(`rohrpost-wurf-${i}`, 'reflexe', 4, ['werfen']), effects: [take(DOSE), fertig(J)] }),
      c('Die Leiter runterklettern und die Dose persönlich übergeben.', 'zugestellt', { effects: [zeit(20), take(DOSE), fertig(J)] }),
      c('Erst mal reinschauen. Nur ganz kurz.', 'gelesen'),
      c('Später.'),
    ],
  }),
  node('gelesen', [N('Im Wachssiegel ist jetzt ein Daumenabdruck. Deiner. Auf dem Zettel steht: „Einladung zum Rattenball. Kleiderordnung: feucht.“ Das war’s. Das ist das große Geheimnis.')], {
    effects: [rep('kanalvolk', -2), msg('Das Kanalvolk merkt so was. Das Siegel ist gebrochen.')],
    choices: [c('Die Dose trotzdem abgeben.', 'zugestellt', { effects: [take(DOSE), fertig(J)] })],
  }),
  node('zugestellt', [N('Unten ruft jemand „Danke!“ und dann noch was, das wie ein Rattenpfiff klingt. Vermutlich auch Danke.'), P('Post ist Post.')]),
]);

export const part: ContentPart = {
  items: byId(dose),
  jobs: byId(tpl),
  jobBoards: { 'gullys-kanalbrett': brett },
  dialogues: byId(...ZIELE.map(zustellen)),
  mapAdditions: zusatz(ZIELE.map((z) => zielSpot(`pj-rohrpost-${z.key}`, z, 'Rohrpost abliefern', `pj-rohrpost-${z.key}`, all(job(J), item(DOSE)), 40, 0))),
};
