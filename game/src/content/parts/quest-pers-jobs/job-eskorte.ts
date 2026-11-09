// job-eskorte · Begleitschutz ab Rang 3 (world.md §6.6): Pim zu ihrer Mutter, Lio zum Auftritt, ein Oberstadt-Tourist,
// der „das echte Unterstadtleben“ sehen will. Am Ziel wartet der Hinterhalt: Kampf (Schützling retten),
// `[Ausstrahlung 5]` zur Eile bewegen oder Schleichroute (ohne Check, dauert).
import type { DialogueDef, DialogueLine, JobTemplateDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import { type Ziel, fertig, kampf, vorlage, ziele, zielSpot, zusatz } from './_auftrag';
import { L, N, abRang, byId, c, chk, dlg, job, node, rel, zeit } from './_lib';

const J = 'job-eskorte';

interface Schuetzling extends Ziel { key: string; anfang: DialogueLine[]; trodeln: string; ende: DialogueLine[] }
const LEUTE: Schuetzling[] = [
  {
    key: 'pim', map: 'rohrsiedlung', spot: 'hof-mitte', label: 'Rohrsiedlung (Pim zu ihrer Mutter)',
    anfang: [N('Pim, acht Jahre, Rucksack größer als sie, hält deine Hand und erzählt dir alles über Regenwürmer. Alles.')],
    trodeln: 'Pim bleibt bei jeder Pfütze stehen. „Da ist einer drin! Ein Regenwurm! Er heißt Gerd!“',
    ende: [N('Eine Frau rennt aus einem Rohrbogen, reißt Pim hoch und weint in den Rucksack. Pim erklärt ihr Gerd.')],
  },
  {
    key: 'lio', map: 'stufenplatz', spot: 'buehne', label: 'Stufenplatz (Lio zum Auftritt)',
    anfang: [L('lio-funkel', 'Ich hab Lampenfieber. Und Gitarrenfieber. Und ein bisschen richtiges Fieber, glaub ich.', 'verlegen')],
    trodeln: 'Lio bleibt an jeder Ecke stehen und schreibt eine Zeile auf. „Das Echo hier! Hörst du das? Moment, ich muss das festhalten.“',
    ende: [L('lio-funkel', 'Wir sind da. Ich bin da. Oh nein, ich bin da. … Danke. Hör zu, wenn du willst. Erstes Lied ist für dich.', 'freude')],
  },
  {
    key: 'tourist', map: 'neon-gasse', spot: 'gassenmitte', label: 'Neon-Gasse (Oberstadt-Tourist)',
    anfang: [N('Ein Oberstadt-Tourist in weißen Sneakers und Funktionsjacke, Kamera am Hals. „Ich will das ECHTE Unterstadtleben sehen. Authentisch. Ungefiltert. Mit Streetfood, aber nicht zu scharf.“')],
    trodeln: 'Der Tourist fotografiert einen Müllcontainer. Dann eine Ratte. Dann die Ratte mit dem Müllcontainer. „So roh! So ehrlich!“',
    ende: [N('Der Tourist zahlt, verteilt Trinkgeld an eine Mülltonne und schreibt eine Bewertung: „Fünf Sterne. Fast überfallen worden. Unvergesslich.“')],
  },
];

const tpl: JobTemplateDef = vorlage({
  id: J, kind: 'eskorte', title: 'Begleitschutz: {ziel}',
  text: 'Jemand muss sicher ankommen. Langsam, mit Pausen, mit Bedürfnissen. Du bist das Bedürfnis nach Sicherheit. {credits} Cr.',
  boards: ['auftragstafel'], when: abRang(3), targets: ziele(LEUTE),
  reward: { credits: [110, 130], xp: 70, rep: { 'crew-hunter': 3 } },
});

const hinterhalt = kampf('pj-enc-eskorte', 'Hinterhalt beim Begleitschutz', {
  arena: 'arena-strasse', enemies: [{ enemy: 'abzieher', count: 2 }, { enemy: 'strassen-flitzer' }],
  objective: { kind: 'rescue', unit: 'passant-tourist', cell: [1, 3] }, start: 'hinterhalt', reward: { xp: 30 },
  intro: [{ speaker: 'narrator', text: 'Schlagringe um die Ecke. „Hübscher Begleiter. Was kostet der?“ Pass auf deinen Schützling auf.' }],
}, [fertig(J)]);

const geleit = (p: Schuetzling, i: number): DialogueDef => dlg(`pj-eskorte-${p.key}`, [
  node('start', [...p.anfang, N(p.trodeln), N('Fast da. An der letzten Ecke stehen drei Gestalten, die dich und deinen Schützling sehr genau ansehen.')], {
    choices: [
      c('Dazwischen stellen. Schützling hinter dich.', undefined, { effects: [{ battle: hinterhalt.id }] }),
      c('„Wir gehen jetzt sehr schnell. Nicht gucken. Nicht reden. LOS.“', 'da', { check: chk(`eskorte-eile-${i}`, 'ausstrahlung', 5, ['ueberreden']), effects: [fertig(J)] }),
      c('Kehrtmachen und den Umweg durch die Hinterhöfe nehmen.', 'umweg', { effects: [zeit(60), fertig(J)] }),
      c('Später.'),
    ],
  }),
  node('umweg', [N('Eine Stunde Hinterhöfe, Wäscheleinen, eine Treppe ohne Geländer. Dein Schützling findet es großartig. Du nicht.')], { next: 'da' }),
  node('da', [...p.ende], { effects: p.key === 'lio' ? [rel('lio-funkel', 10)] : [] }),
]);

export const part: ContentPart = {
  jobs: byId(tpl),
  encounters: byId(hinterhalt),
  dialogues: byId(...LEUTE.map(geleit)),
  mapAdditions: zusatz(LEUTE.map((p) => zielSpot(`pj-eskorte-${p.key}`, p, 'Begleitschutz: Ankunft', `pj-eskorte-${p.key}`, job(J), 0, 40))),
};
