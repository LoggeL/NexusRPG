// job-kanal · Kanal-Säuberung ab Rang 1 (world.md §6.6), auch an Gullys Kanalbrett.
// Kampf: die sichtbare Rattengruppe auf kanal-sammler (Kartenbegegnung 'job-kanal', Sieg schließt über `encounter` ab).
// Ohne Kampf: `[Technik 4]` Lebendfalle oder Röstzwiebel-Köder (ohne Check) – umsiedeln statt ausräuchern. Ruf `kanalvolk` +3.
// JobKind kennt keine Kanal-Säuberung: läuft als 'kopfgeld' (Lücke).
import type { JobTemplateDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import { fertig, vorlage, zielSpot, zusatz } from './_auftrag';
import { L, N, P, byId, c, chk, dlg, item, job, node, rep, take, zeit } from './_lib';

const J = 'job-kanal';
const ZIEL = { map: 'kanal-sammler', spot: 'rattennest-3', label: 'Kanal-Sammler, Rattennest' };

const tpl: JobTemplateDef = vorlage({
  id: J, kind: 'kopfgeld', title: 'Kanal-Säuberung: {ziel}',
  text: 'Ein Rattennest blockiert den Kabelweg. Ausräuchern oder umsiedeln, Hauptsache weg. Das Kanalvolk sagt Danke, Hunter sagt {credits} Cr.',
  boards: ['auftragstafel', 'gullys-kanalbrett'], targets: [{ map: ZIEL.map, label: ZIEL.label }], encounter: 'enc-job-kanal',
  reward: { credits: [55, 65], xp: 40, rep: { kanalvolk: 3 } },
});

const nest = dlg('pj-kanal-nest', [
  node('start', [N('Das Nest: Kabelreste, Kronkorken, ein halber Teddy. Es raschelt. Es raschelt viel. Zwanzig Augenpaare gucken dich an, und keins davon hat Angst.')], {
    choices: [
      c('Aus einem Rohrstück und einer Klappe eine Lebendfalle bauen.', 'falle', { check: chk('kanal-falle', 'technik', 4, ['falle', 'basteln']), effects: [fertig(J)] }),
      c('Eine Spur aus Röstzwiebeln legen, bis ganz rüber zum Überlauf.', 'koeder', { requires: item('roestzwiebeln'), effects: [take('roestzwiebeln'), zeit(30), fertig(J)] }),
      c('Ausräuchern. Mit Gewalt. (Die Rattengruppe auf der Karte angreifen.)'),
    ],
  }),
  node('falle', [N('Klick. Die Falle ist voll. Zweimal, dreimal, zehnmal. Du trägst die Ratten in einen Seitenkanal, wo sie keine Kabel mehr fressen, sondern nur noch Algen.'), P('Ihr dürft mich jetzt hassen. Aus der Entfernung.')], {
    next: 'dank',
  }),
  node('koeder', [N('Die Ratten folgen den Röstzwiebeln wie einer Prozession. Am Überlauf wartet ein frisches Nest aus Lumpen. Sie ziehen ein. Eine dreht sich um und nickt dir zu.')], { next: 'dank' }),
  node('dank', [N('Auf dem Rückweg steht Bürgermeister Gully am Kabelweg, die Amtskette aus Kronkorken frisch poliert.'), L('buergermeister-gully', 'Umgesiedelt, nicht umgebracht! So mag ich das. Das Kanalvolk merkt sich Leute mit Manieren.', 'freude')], {
    effects: [rep('kanalvolk', 2)],
  }),
]);

export const part: ContentPart = {
  jobs: byId(tpl),
  dialogues: byId(nest),
  mapAdditions: zusatz([zielSpot('pj-kanal-nest', ZIEL, 'Rattennest ansehen', nest.id, job(J), 0, -40)]),
};
