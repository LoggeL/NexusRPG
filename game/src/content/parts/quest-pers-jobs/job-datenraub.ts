// job-datenraub · Datenraub ab Rang 3 (world.md §6.6). Ziele: Quantum-Lieferdepot (hafenkante), Gerichtsarchiv (eisenhof),
// Satin & Chrom (glasarkaden), NX-1-Redaktion (nur solange Collin unter ♥2).
// Wege: Hack-Minispiel oder `[Technik 6]`, Karte stehlen `[Reflexe 6]`, Angestellte überreden `[Ausstrahlung 6]`,
// Hintertür über Kanalvolk oder Ripper `[Straße 5]`, offensiv (ohne Check; Ruf `ordnungsdienst` −5 als Fahndungsersatz).
// Eisenhof und Glasarkaden haben Hack und Technik schon an der Karte; hier kommen nur die übrigen Wege dazu.
import type { DialogueChoice, DialogueDef, JobTemplateDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import { type Ziel, fertig, vorlage, ziele, zielSpot, zusatz } from './_auftrag';
import { N, P, abRang, all, byId, c, chk, dlg, hearts, job, msg, node, not, rep } from './_lib';

const J = 'job-datenraub';
const J_NX1 = 'job-datenraub-nx1';

interface Terminal extends Ziel { key: string; job: string; ort: string; dativ: string; akkusativ: string; hack: boolean }
const TERMINALS: Terminal[] = [
  { key: 'depot', job: J, map: 'hafenkante', spot: 'quantum-depot', label: 'Quantum-Lieferdepot', hack: true,
    ort: 'Das Quantum-Lieferdepot: Rolltor, Kamera, ein Terminal hinter Panzerglas und ein Lagerist, der seit drei Stunden auf dieselbe Kiste starrt.',
    dativ: 'Dem Lageristen', akkusativ: 'Den Lageristen' },
  { key: 'archiv', job: J, map: 'eisenhof', spot: 'behoerden-terminal', label: 'Gerichtsarchiv', hack: false,
    ort: 'Das Behördenterminal am Gerichtsarchiv. Davor eine Schreibkraft mit Kaffee und dem Blick eines Menschen, der seit 2063 auf den Feierabend wartet.',
    dativ: 'Der Schreibkraft', akkusativ: 'Die Schreibkraft' },
  { key: 'satin', job: J, map: 'glasarkaden', spot: 'satin-und-chrom', label: 'Satin & Chrom', hack: false,
    ort: 'Satin & Chrom: Spiegel, Samt, ein Verkäufer mit Chrom-Wangenknochen und hinter der Theke das Kundenterminal.',
    dativ: 'Dem Verkäufer', akkusativ: 'Den Verkäufer' },
  { key: 'nx1', job: J_NX1, map: 'nx1-studio', spot: 'redaktion', label: 'NX-1-Redaktion', hack: true,
    ort: 'Die NX-1-Redaktion. Bildschirme, Pappbecher, ein Volontär, der eine Schlagzeile tippt und wieder löscht. „QUANTUM RETTET“ … „QUANTUM HILFT“ … „QUANTUM IST“.',
    dativ: 'Dem Volontär', akkusativ: 'Den Volontär' },
];

const T: JobTemplateDef[] = [
  vorlage({
    id: J, kind: 'datenraub', title: 'Datenraub: {ziel}',
    text: 'Rein, Daten ziehen, raus. Wer fragt, für wen, kriegt keine Antwort. Wer fragt, wie viel: {credits} Cr.',
    boards: ['auftragstafel'], when: abRang(3), targets: ziele(TERMINALS.filter((t) => t.job === J)),
    reward: { credits: [140, 160], xp: 90, rep: { 'crew-hunter': 4 } },
  }),
  vorlage({
    id: J_NX1, kind: 'datenraub', title: 'Datenraub: {ziel}',
    text: 'Jemand will wissen, was NX-1 morgen sendet, bevor NX-1 es weiß. {credits} Cr. Collin darf davon nichts mitkriegen.',
    boards: ['auftragstafel'], when: all(abRang(3), not(hearts('collin-charleston', 2))), targets: ziele(TERMINALS.filter((t) => t.job === J_NX1)),
    reward: { credits: [140, 160], xp: 90, rep: { 'crew-hunter': 4, 'nx1-medien': -3 } },
  }),
];

const raub = (t: Terminal): DialogueDef => {
  const done = [fertig(t.job)];
  const wege: DialogueChoice[] = [
    ...(t.hack ? [
      c('Ans Terminal und hacken.', undefined, {
        effects: [{
          minigame: 'akt-hacken', level: 3, key: `pj-datenraub-${t.key}`, label: t.label,
          win: [...done, msg('Daten gezogen. Niemand hat was gemerkt. Außer dem Terminal, und das redet nicht.')],
          lose: [msg('Das Terminal sperrt sich. Ein zweiter Versuch ist drin, wenn keiner guckt.')],
        }],
      }),
      c('Ohne Spielerei ins Wartungsmenü.', 'drin', { check: chk(`datenraub-${t.key}-technik`, 'technik', 6, ['hacken', 'terminal']), effects: done }),
    ] : []),
    c(`${t.dativ} im Vorbeigehen die Zugangskarte abnehmen.`, 'drin',
      { check: chk(`datenraub-${t.key}-karte`, 'reflexe', 6, ['taschendieb']), effects: done }),
    c(`${t.akkusativ} überreden: „Wartung. Haben Sie das Ticket nicht gekriegt?“`, 'drin',
      { check: chk(`datenraub-${t.key}-reden`, 'ausstrahlung', 6, ['ueberreden', 'luegen']), effects: done }),
    c('Über das Kanalvolk oder Ripper an eine Hintertür in der Leitung kommen.', 'drin',
      { check: chk(`datenraub-${t.key}-hintertuer`, 'strasse', 5, ['kontakte']), effects: done }),
    c('Offensiv: Panzerglas eintreten, Stick rein, rennen.', 'offensiv', { effects: [...done, rep('ordnungsdienst', -5)] }),
    c('Später.'),
  ];
  return dlg(`pj-datenraub-${t.key}`, [
    node('start', [N(t.ort)], { choices: wege }),
    node('drin', [N('Der Fortschrittsbalken kriecht. Hundert Prozent. Du ziehst den Stick, steckst ihn ein und gehst. Nicht rennen. Rennen ist verdächtig.'), P('Ich war nie hier.')]),
    node('offensiv', [N('Es klirrt. Es piept. Es heult. Du bist schon zwei Straßen weiter, als die Sirene richtig in Fahrt kommt. Der Ordnungsdienst hat jetzt ein Foto von deinem Hinterkopf.')]),
  ]);
};

export const part: ContentPart = {
  jobs: byId(...T),
  dialogues: byId(...TERMINALS.map(raub)),
  mapAdditions: zusatz(TERMINALS.map((t) => zielSpot(`pj-datenraub-${t.key}`, t, t.hack ? `Datenraub: ${t.label}` : `Datenraub: andere Wege`,
    `pj-datenraub-${t.key}`, job(t.job), t.hack ? 0 : 60, t.hack ? 0 : 20))),
};
