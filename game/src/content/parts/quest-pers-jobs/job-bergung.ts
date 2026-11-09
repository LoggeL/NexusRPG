// job-bergung · Bergung ab Rang 2 (world.md §6.6): Halde (schrottmarkt), Digitech-Areal, Brackbucht (flutmauer).
// Wege: Kampf, Schleichen (ohne Check, dauert), `[Körper 5]` schwere Teile, `[Technik 5]` ausbauen statt reißen (doppelter
// Teilewert). JobKind kennt keine Bergung: läuft als 'kurier' (Lücke).
import type { DialogueDef, JobTemplateDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import { type Ziel, fertig, kampf, vorlage, ziele, zielSpot, zusatz } from './_auftrag';
import { N, P, abRang, byId, c, chk, dlg, give, job, node, zeit } from './_lib';

const J = 'job-bergung';
const TEIL = 'schrott-ersatzteil';

interface Fundort extends Ziel { key: string; bild: string; waechter: string }
const ORTE: Fundort[] = [
  { key: 'halde', map: 'schrottmarkt', spot: 'halde', label: 'Schrottmarkt, Halde',
    bild: 'Ein abgestürzter Lieferkran, halb im Schrottberg. Im Getriebe stecken Teile, für die Gustav seinen Wohnwagen verkaufen würde.',
    waechter: 'Oben auf dem Ausleger sitzen Schrottkrähen und eine Drohne, die irgendwer vor Jahren vergessen hat abzuschalten.' },
  { key: 'digitech', map: 'digitech-areal', spot: 'wachroboter-reste', label: 'Digitech-Areal, Wachroboter',
    bild: 'Die Reste eines Wachroboters, Brustplatte offen. Drinnen: ein Servo-Paket, unberührt, weil sich keiner traut.',
    waechter: 'Zwischen den Trümmern patrouilliert eine Schrottdrohne. Zwei Krähen haben sich ihr angeschlossen. Aus Prinzip.' },
  { key: 'brackbucht', map: 'flutmauer', spot: 'drohnenwrack', label: 'Brackbucht, Drohnenwrack',
    bild: 'Ein Drohnenwrack im Schlick, der Akku noch warm. Wenn man ihn richtig ausbaut, ist er ein Vermögen. Wenn nicht, ist man es los.',
    waechter: 'Am Wrack picken Schrottkrähen nach Kabeln. Eine Drohne summt darüber, als gehöre ihr der Strand.' },
];

const tpl: JobTemplateDef = vorlage({
  id: J, kind: 'kurier', title: 'Bergung: {ziel}',
  text: 'Da liegt was rum, das Geld wert ist. Hol es, bevor es jemand anderes holt. Teile behältst du, Hunter kriegt die Quittung. {credits} Cr.',
  boards: ['auftragstafel'], when: abRang(2), targets: ziele(ORTE),
  reward: { credits: [80, 100], xp: 60, rep: { 'crew-hunter': 3 } },
});

const krach = kampf('pj-enc-bergung', 'Bergung mit Zuschauern', {
  arena: 'arena-schrottplatz', enemies: [{ enemy: 'schrottkraehe', count: 2 }, { enemy: 'schrottdrohne' }], reward: { xp: 20 },
  intro: [{ speaker: 'narrator', text: 'Die guten Teile liegen ganz unten. Die Krähen sitzen ganz oben. Und sie teilen nicht.' }],
}, [fertig(J), give(TEIL, 2)]);

const bergen = (o: Fundort): DialogueDef => dlg(`pj-bergung-${o.key}`, [
  node('start', [N(o.bild), N(o.waechter)], {
    choices: [
      c('Die Teile ordentlich ausbauen, Schraube für Schraube.', 'sauber', { check: chk(`bergung-${o.key}-technik`, 'technik', 5, ['reparieren', 'maschine']), effects: [fertig(J), give(TEIL, 4)] }),
      c('Das schwere Zeug einfach rausreißen und schultern.', 'grob', { check: chk(`bergung-${o.key}-koerper`, 'koerper', 5, ['heben']), effects: [fertig(J), give(TEIL, 2)] }),
      c('Die Wächter verscheuchen. Mit Gewalt.', undefined, { effects: [{ battle: krach.id }] }),
      c('Warten, bis die Krähen weiterziehen, und dann leise ran.', 'leise', { effects: [zeit(60), fertig(J), give(TEIL, 2)] }),
      c('Später.'),
    ],
  }),
  node('sauber', [N('Ausgebaut statt abgerissen. Die Teile glänzen, als hätte sie jemand poliert. Doppelter Wert. Gustav würde dich adoptieren.'), P('So geht Bergung.', 'freude')]),
  node('grob', [N('Es knackt, es reißt, es tut weh. Aber die Teile sind draußen. Mehr oder weniger.')]),
  node('leise', [N('Eine Stunde Geduld. Die Krähen fliegen ab, die Drohne dreht eine Runde. Du schnappst dir, was du tragen kannst.')]),
]);

export const part: ContentPart = {
  jobs: byId(tpl),
  encounters: byId(krach),
  dialogues: byId(...ORTE.map(bergen)),
  mapAdditions: zusatz(ORTE.map((o) => zielSpot(`pj-bergung-${o.key}`, o, 'Bergung', `pj-bergung-${o.key}`, job(J), 40, 30))),
};
