// Collins Tipps (world.md §6.6, ab Collin ♥2): Tipps per Telefon und am Tippzettel im NX-1-Studio.
// Aufträge: Fotos und Gerüchte für Collins Sendung. Am Ziel jeweils ein Check und ein Weg ohne Check.
// Die Wirkung auf `meinung` (öffentliche Meinung) gibt es in der Engine nicht; ersatzweise Ruf nx1-medien (Lücke).
import type { AttributeId, DialogueDef, Effect, JobTemplateDef } from '../../../modules/contracts';
import type { JobBoardDef } from '../../../modules/jobs';
import type { ContentPart } from '../../part';
import { type Ziel, fertig, vorlage, zielSpot, zusatz } from './_auftrag';
import { neben } from './_karten';
import { N, P, byId, c, chk, cr, dlg, hearts, job, node, tel, zeit } from './_lib';

const C = 'collin-charleston';
const AB_HERZ2 = hearts(C, 2);

const tipps: JobBoardDef = { name: 'Collins Tipps', faction: 'nx1-medien', slots: 2, failRep: 1 };

interface Tipp extends Ziel {
  key: string; titel: string; art: 'foto' | 'geruecht'; bild: string;
  check: [AttributeId, number, string[]]; checkText: string; ohneText: string; ohneEffekte: Effect[]; ergebnis: string
}
const TIPPS: Tipp[] = [
  { key: 'brunnen', map: 'glasarkaden', spot: 'springbrunnen', label: 'Glasarkaden, Springbrunnen', titel: 'Promi im Springbrunnen', art: 'foto',
    bild: 'Am Springbrunnen der Glasarkaden: ein Oberstadt-Influencer, der für ein Video so tut, als würde er Münzen für die Armen werfen. Es sind Schokotaler.',
    check: ['reflexe', 4, ['timing']], checkText: 'Genau im Moment abdrücken, als er den Schokotaler auspackt und selbst isst.',
    ohneText: 'Warten, bis er es noch mal macht. Er macht es noch mal. Er macht es immer noch mal.', ohneEffekte: [zeit(45)],
    ergebnis: 'Das Foto ist perfekt. Collin wird es „Schokoladenseite der Oberstadt“ nennen.' },
  { key: 'kai', map: 'hafenkante', spot: 'kai-mitte', label: 'Hafenkante, Kai', titel: 'Gerücht vom Kai', art: 'geruecht',
    bild: 'Am Kai stehen zwei Hafenarbeiter und flüstern. Ein Wort fällt immer wieder: „Quantum“. Dann: „Freitag“. Dann: „Die Kisten summen.“',
    check: ['strasse', 4, ['geruecht']], checkText: 'Unauffällig danebenstellen, eine Zigarette schnorren und mitreden.',
    ohneText: 'Eine Runde Muschelsuppe für beide ausgeben und zuhören. (15 Cr)', ohneEffekte: [cr(-15)],
    ergebnis: 'Freitags laden Quantum-Leute Kisten aus, die summen. Keiner weiß, was drin ist. Alle haben Angst davor. Collin wird es lieben.' },
  { key: 'buehne', map: 'stufenplatz', spot: 'buehne', label: 'Stufenplatz, Bühne', titel: 'Wer sabotiert die Bühne?', art: 'geruecht',
    bild: 'An der Bühne am Stufenplatz ist schon wieder ein Kabel durchgeschnitten. Daneben ein Fußabdruck mit Quantum-Profil. Und ein Bonbonpapier.',
    check: ['technik', 4, ['elektronik']], checkText: 'Das Kabel untersuchen: Schnitt, Werkzeug, Uhrzeit.',
    ohneText: 'Die Brezelverkäuferin fragen. Die sieht alles. Und erzählt alles. Sehr lange.', ohneEffekte: [zeit(40)],
    ergebnis: 'Ein Quantum-Techniker schneidet die Kabel, immer kurz vor Collins Sendung. Er isst dabei Bonbons. Collin schwört Rache. Mit Bonbons.' },
];

const T: JobTemplateDef[] = TIPPS.map((t) => vorlage({
  id: `job-collin-${t.key}`, kind: 'datenraub', title: `Collins Tipp: ${t.titel}`,
  text: t.art === 'foto'
    ? 'Collin braucht ein Foto für die Abendsendung. Echt, scharf, peinlich für die Richtigen. Ort: {ziel}. {credits} Cr.'
    : 'Collin hat ein Gerücht gehört und braucht jemanden, der es bestätigt. Oder widerlegt. Hauptsache Quote. Ort: {ziel}. {credits} Cr.',
  boards: ['collins-tipps'], when: AB_HERZ2, targets: [{ map: t.map, label: t.label }],
  reward: { credits: [40, 60], xp: 40, rep: { 'nx1-medien': 2 } },
}));

const recherche = (t: Tipp): DialogueDef => {
  const J = `job-collin-${t.key}`;
  return dlg(`pj-collin-${t.key}`, [
    node('start', [N(t.bild)], {
      choices: [
        c(t.checkText, 'fertig', { check: chk(`collin-${t.key}`, t.check[0], t.check[1], t.check[2]), effects: [fertig(J)] }),
        c(t.ohneText, 'fertig', { effects: [...t.ohneEffekte, fertig(J)] }),
        c('Später.'),
      ],
    }),
    node('fertig', [N(t.ergebnis), P(t.art === 'foto' ? 'Hab ich. Collin, du schuldest mir ein Autogramm. Ein ironisches.' : 'Bestätigt. Collin wird kreischen.')]),
  ]);
};

const anruf = tel('pj-collin-tipps', C,
  'Darling! Ich hab eine Idee: Du bist ab sofort meine Quelle. Meine geheime. Ich schick dir Tipps, du bringst mir Bilder und Geschichten, ich bring sie ins Fernsehen, die Stadt bringt mir Liebe. Alle gewinnen! Tippzettel hängt im Studio an meinem Schminkspiegel. Küsschen. Kamera aus.',
  { auto: AB_HERZ2, replies: [{ text: 'Zeig her.', effects: [{ jobBoard: 'collins-tipps' }] }, { text: 'Später, Collin.' }] });

export const part: ContentPart = {
  jobs: byId(...T),
  jobBoards: { 'collins-tipps': tipps },
  dialogues: byId(...TIPPS.map(recherche)),
  phone: byId(anruf),
  mapAdditions: zusatz([
    ['nx1-studio', { id: 'pj-collins-tippzettel', at: neben('nx1-studio', 'schminkspiegel', 0, 56), label: 'Collins Tippzettel', kind: 'board', board: 'collins-tipps', when: AB_HERZ2 }],
    ...TIPPS.map((t) => zielSpot(`pj-collin-${t.key}`, t, `Collins Tipp: ${t.titel}`, `pj-collin-${t.key}`, job(`job-collin-${t.key}`), 40, -40)),
  ]),
};
