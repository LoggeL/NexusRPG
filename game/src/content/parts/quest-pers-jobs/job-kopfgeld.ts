// job-kopfgeld · generierte Kopfgelder ab Rang 2 (world.md §6.6/§6.7 „danach generierte Ziele“) und die Abgabe
// der benannten Kopfgelder an der Saalwache im Gerichtssaal.
// Generische Ziele: `[Reflexe 5]` stellen, Kampf (Sieg setzt `kopfgeld_gestellt`), `[Ausstrahlung 5]` Selbstanzeige,
// laufen lassen (halber Lohn). Abliefern am Kopfgeld-Schalter des Gerichtssaals (gerichtssaal-kopfgeld, fremde Karte).
import type { DialogueDef, JobTemplateDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import { type Ziel, fertig, kampf, vorlage, ziele, zielSpot, zusatz } from './_auftrag';
import { abgabeKnoten, abgabeWahl } from './_kopfgeld';
import { N, abRang, all, byId, c, chk, cr, dlg, job, msg, node, noFlag, rep, set } from './_lib';
import { ziel as zoltan } from './kopfgeld-zwei-finger-zoltan';
import { ziel as lola } from './kopfgeld-loetkolben-lola';
import { ziel as kalle } from './kopfgeld-krawall-kalle';
import { ziel as nils } from './kopfgeld-neon-nils';
import { ziel as kassierer } from './kopfgeld-der-kassierer';
import { ziel as turbo } from './kopfgeld-oma-turbo';
import { ziel as toaster } from './kopfgeld-toaster';
import { ziel as graf } from './kopfgeld-graf-gully-zwei';

const J = 'job-kopfgeld';
const GESTELLT = 'kopfgeld_gestellt';
const BENANNT = [zoltan, lola, kalle, nils, kassierer, turbo, toaster, graf];

interface Fluechtig extends Ziel { key: string; bild: string }
const ZIELE: Fluechtig[] = [
  { key: 'hafen', map: 'hafenkante', spot: 'kai-mitte', label: 'Hafenkante, Kai',
    bild: 'Ein Mann mit Kapuze sitzt auf einem Poller und tut so, als würde er angeln. Ohne Angel. Das Fahndungsfoto auf deinem Kommunikator tut so, als wäre er es. Er ist es.' },
  { key: 'loet', map: 'loetgassen', spot: 'stellwerk-loet', label: 'Lötgassen, Stellwerk',
    bild: 'Eine Frau in Kurierweste lehnt am Stellwerkskasten und zählt Geld, das nicht ihr gehört. Auf dem Steckbrief heißt sie „die Schnelle“. Sie sieht nicht schnell aus. Das ist der Trick.' },
  { key: 'bahnhof', map: 'bahnhof-mitte', spot: 'wartehaeuschen', label: 'Bahnhof Mitte, Wartehäuschen',
    bild: 'Im Wartehäuschen sitzt ein Typ mit drei Sonnenbrillen übereinander. Er wartet auf keinen Zug. Er wartet darauf, dass keiner ihn erkennt. Du erkennst ihn.' },
];

const tpl: JobTemplateDef = vorlage({
  id: J, kind: 'kopfgeld', title: 'Kopfgeld: {ziel}',
  text: 'Ein Steckbrief, ein Foto, ein Ort. Finden, stellen, beim Richter abliefern. Lebend. {credits} Cr.',
  boards: ['auftragstafel'], when: abRang(2), targets: ziele(ZIELE),
  reward: { credits: [180, 220], xp: 120, rep: { 'crew-hunter': 4 } },
});

const zugriff = kampf('pj-enc-kopfgeld', 'Kopfgeld: Zugriff', {
  arena: 'arena-hinterhof', enemies: [{ enemy: 'strassen-flitzer' }, { enemy: 'abzieher' }], reward: { xp: 20 },
  intro: [{ speaker: 'narrator', text: 'Das Ziel pfeift. Ein Kumpel kommt aus dem Schatten. Natürlich kommt ein Kumpel aus dem Schatten.' }],
}, [set(GESTELLT), msg('Gestellt. Abliefern: Gerichtssaal, Kopfgeld-Schalter.')]);

const stellen = (z: Fluechtig, i: number): DialogueDef => dlg(`pj-kopfgeld-${z.key}`, [
  node('start', [N(z.bild)], {
    choices: [
      c('Zugreifen, bevor das Ziel losrennt.', 'gestellt', { check: chk(`kopfgeld-greifen-${i}`, 'reflexe', 5, ['schnell']), effects: [set(GESTELLT)] }),
      c('„Stell dich. Sonst stellt dich jemand, der weniger nett ist als ich.“', 'selbst', { check: chk(`kopfgeld-reden-${i}`, 'ausstrahlung', 5, ['ueberreden']), effects: [fertig(J), rep('unterstadt', 5)] }),
      c('Den Weg abschneiden. Notfalls mit Gewalt.', undefined, { effects: [{ battle: zugriff.id }] }),
      c('„Erzähl mir was Nützliches, dann hab ich dich nie gesehen.“', 'laufen', { effects: [fertig(J), cr(-100)] }),
      c('Später.'),
    ],
  }),
  node('gestellt', [N('Ein Griff, ein Ruck, Handschellen aus Hunters Schublade. Sie quietschen. Abliefern: Gerichtssaal, Kopfgeld-Schalter.')]),
  node('selbst', [N('Das Ziel denkt nach, zuckt mit den Schultern und geht selbst los, Richtung Eisenhof. Du gehst trotzdem mit. Vertrauen ist gut, Kopfgeld ist besser.')]),
  node('laufen', [N('Ein Name, eine Adresse, ein Gerücht über Quantum-Lieferungen am Hafen. Dann ist das Ziel weg. Du hast jetzt einen Kontakt und die Hälfte vom Lohn.')]),
]);

// Saalwache: Abgabe der benannten Kopfgelder.
const abgabe = dlg('pj-kopfgeld-abgabe', [
  node('start', [N('Der Wachtmeister an der Saalwache hat einen Stempel, ein Klemmbrett und den Blick eines Mannes, der schon alles abgeliefert bekommen hat. Einmal sogar einen Wal.')], {
    choices: [...BENANNT.map(abgabeWahl), c('Gehen.')],
  }),
  ...BENANNT.map(abgabeKnoten),
]);

export const part: ContentPart = {
  jobs: byId(tpl),
  encounters: byId(zugriff),
  dialogues: byId(...ZIELE.map(stellen), abgabe),
  mapAdditions: zusatz([
    ...ZIELE.map((z) => zielSpot(`pj-kopfgeld-${z.key}`, z, 'Kopfgeld-Ziel', `pj-kopfgeld-${z.key}`, all(job(J), noFlag(GESTELLT)), -40, 30)),
    zielSpot('pj-kopfgeld-abgabe', { map: 'gerichtssaal', spot: 'saalwache', label: 'Saalwache' }, 'Kopfgeld abliefern (Saalwache)', abgabe.id,
      { any: BENANNT.map((k) => job(`kopfgeld-${k.key}`)) }, 0, -40),
  ]),
};
