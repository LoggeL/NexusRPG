// job-schulden · Schulden eintreiben (world.md §6.6). Vier Schuldner mit festen Plätzen und Zeiten.
// Schwelle X nach Rang an Hunters Tafel: 1: 4, 2: 5, 3: 6, ab 4: 7. Wege: `[Körper X]`, `[Ausstrahlung X]` Ratenzahlung,
// `[Technik X]` Konto, `[Straße X]` Versteck, Kampf, selbst vorstrecken (ohne Check, Ruf `unterstadt` +3).
// Zauberer Zappo zusätzlich `[Reflexe 6]` (Geld im Hut).
import type { AttributeId, Condition, DialogueChoice, DialogueDef, JobTemplateDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import { type Ziel, fertig, kampf, vorlage, ziele, zielSpot, zusatz } from './_auftrag';
import { L, N, P, abRang, all, byId, c, chk, cr, dlg, genauRang, job, msg, node, rep, time } from './_lib';

const J = 'job-schulden';

interface Schuldner extends Ziel { key: string; name: string; wann: Condition; auftritt: string; ausrede: string; versteck: string; konto: string }
const SCHULDNER: Schuldner[] = [
  {
    key: 'schorsch', name: 'Schorsch Spätzahler', map: 'neon-gasse', spot: 'muelltonnen', label: 'Neon-Gasse, bei den Mülltonnen', wann: time('abend', 'nacht'),
    auftritt: 'Schorsch Spätzahler sitzt auf einer Mülltonne und liest in einem dicken Heft. Auf dem Umschlag: „AUSREDEN, BAND 4“.',
    ausrede: '„Hunter? Ah. Moment.“ Er blättert. „Nummer 212: Meine Oma hat meine Credits gegessen. Nummer 213: Meine Oma IST ein Credit. Nein, warte, das ist noch nicht fertig.“',
    versteck: 'Unter der dritten Mülltonne klebt eine Dose. In der Dose: hundert Credits und ein Zettel, „AUSREDE 1: Das ist nicht meine Dose.“',
    konto: 'Sein Kommunikator hat als Passwort „Ausrede“. Du überweist Hunter, was Hunter gehört.',
  },
  {
    key: 'zinseszins', name: 'Madame Zinseszins', map: 'loetgassen', spot: 'kabeltrommeln', label: 'Lötgassen, Kabeltrommeln', wann: time('tag', 'abend'),
    auftritt: 'Madame Zinseszins thront auf einer Kabeltrommel, Perlenkette aus Lötzinn, Rechenschieber in der Hand. Sie verleiht selbst Geld. Nur zurückzahlen tut sie es nicht.',
    ausrede: '„Ich schulde Hunter nichts. Hunter schuldet mir Zinsen auf die Zeit, die ich mit Warten verbringe. Nach meiner Rechnung schuldet er mir siebzehn Credits.“',
    versteck: 'Im Hohlraum ihres Rechenschiebers: zusammengerollte Scheine. Sie hat dich das Teil die ganze Zeit schwenken sehen lassen.',
    konto: 'Ihr Kreditbuch läuft auf einem uralten Tablet. Eine Spalte heißt „Hunter (nie)“. Du änderst „nie“ in „jetzt“.',
  },
  {
    key: 'zappo', name: 'Zauberer Zappo', map: 'stufenplatz', spot: 'prediger-kiste', label: 'Stufenplatz, Predigerkiste', wann: time('tag'),
    auftritt: 'Zauberer Zappo steht auf einer Kiste, Zylinder, Glitzerumhang, Kaninchen aus Blech. Er zaubert Münzen aus Ohren. Leider nie zurück in Hunters Kasse.',
    ausrede: '„Schulden? Ich? Schau in deine Tasche!“ In deiner Tasche ist ein Kaninchen aus Blech. Es guckt dich an. „Siehst du? Ich bin großzügig. Wir sind quitt.“',
    versteck: 'Der Zylinder hat einen doppelten Boden. Natürlich hat er einen doppelten Boden. Er ist ein Zauberer.',
    konto: 'Sein Zauberstab ist ein Bezahlterminal. Kein Witz. Du tippst eine Rückbuchung ein. Abrakadabra.',
  },
  {
    key: 'rolf', name: 'Rohr-Rolf', map: 'rohrsiedlung', spot: 'baenke', label: 'Rohrsiedlung, die Bänke', wann: time('morgen', 'tag', 'abend'),
    auftritt: 'Rohr-Rolf liegt auf einer Bank und tut so, als würde er schlafen. Seine Augen sind zu, aber seine Hand hält sehr fest seine Brieftasche.',
    ausrede: '„Ich schlafe. Komm wieder, wenn ich wach bin. Ich bin nie wach. Ich bin ein Naturgesetz.“',
    versteck: 'Unter der Bank, mit Draht an der Rohrleitung befestigt: eine Keksdose. Rolf öffnet ein Auge und schließt es schnell wieder.',
    konto: 'Er hat sein Konto an das Wasserrohr gekoppelt. Warum, weiß niemand. Zwei Handgriffe am Verteiler, und Hunter kriegt sein Geld.',
  },
];

const tpl: JobTemplateDef = vorlage({
  id: J, kind: 'schulden', title: 'Schulden: {ziel}',
  text: 'Jemand schuldet Hunter Geld. Hunter mag das nicht. Hol es ab – wie, ist deine Sache, solange am Ende Credits auf seinem Tresen liegen. {credits} Cr.',
  boards: ['auftragstafel'], targets: ziele(SCHULDNER),
  reward: { credits: [90, 110], xp: 60, rep: { 'crew-hunter': 3 } },
});

const pruegel = kampf('pj-enc-schulden', 'Schulden eintreiben', {
  arena: 'arena-hinterhof', enemies: [{ enemy: 'schuldner' }, { enemy: 'abzieher', count: 2 }], reward: { xp: 20 },
  intro: [{ speaker: 'narrator', text: '„Morgen! Ganz sicher morgen! … Jungs, die Leute von Hunter sind da!“ Zwei Kumpel kommen mit Stuhlbeinen aus der Ecke.' }],
}, [fertig(J)]);

/** Wege mit Rangschwelle: je Rang eine Auswahl (nur die passende ist sichtbar). */
function rangWege(s: Schuldner): DialogueChoice[] {
  const wege: { attr: AttributeId; text: string; next: string; tags: string[] }[] = [
    { attr: 'koerper', text: 'Am Kragen packen und hochheben. Nur ein bisschen. Bis die Füße baumeln.', next: 'koerper', tags: ['einschuechtern'] },
    { attr: 'ausstrahlung', text: '„Ratenzahlung. Drei Tage, zwanzig Prozent obendrauf. Dann sind alle glücklich.“', next: 'raten', tags: ['ueberreden', 'verhandeln'] },
    { attr: 'technik', text: 'Einen Blick aufs Konto werfen. Rein technisch.', next: 'konto', tags: ['hacken'] },
    { attr: 'strasse', text: 'Überlegen, wo so jemand sein Geld versteckt.', next: 'versteck', tags: ['versteck'] },
  ];
  const out: DialogueChoice[] = [];
  [1, 2, 3, 4].forEach((rang) => {
    const schwelle = rang + 3;
    const wann = rang === 4 ? abRang(4) : genauRang(rang);
    for (const w of wege) out.push(c(w.text, w.next, { when: wann, check: chk(`schulden-${s.key}-${w.attr}-${rang}`, w.attr, schwelle, w.tags) }));
  });
  return out;
}

const gespraech = (s: Schuldner): DialogueDef => dlg(`pj-schulden-${s.key}`, [
  node('start', [N(s.auftritt), P(`${s.name}? Hunter schickt mich.`), N(s.ausrede)], {
    choices: [
      ...rangWege(s),
      ...(s.key === 'zappo' ? [c('Dem Zauberer blitzschnell in den Zylinder greifen.', 'versteck', { check: chk('schulden-zappo-hut', 'reflexe', 6, ['taschendieb']) })] : []),
      c('„Okay. Dann eben auf die harte Tour.“', undefined, { effects: [{ battle: pruegel.id }] }),
      c('Seufzen und die Summe selbst auf den Tisch legen. (100 Cr)', 'vorstrecken', { requires: { credits: 100 }, effects: [cr(-100), rep('unterstadt', 3), fertig(J)] }),
      c('„Ich komm wieder.“'),
    ],
  }),
  node('koerper', [N(`${s.name} zappelt kurz, dann fällt eine Brieftasche aus dem Ärmel. Erstaunlich, was Schwerkraft alles regelt.`)], { effects: [fertig(J)], next: 'ende' }),
  node('raten', [N(`${s.name} rechnet, stöhnt, unterschreibt einen Zettel und drückt dir die erste Rate in die Hand. Die anderen holt Hunter selbst ab. Er freut sich drauf.`)], {
    effects: [fertig(J), msg('Ratenzahlung vereinbart: Hunter treibt den Rest selbst ein.')], next: 'ende',
  }),
  node('konto', [N(s.konto)], { effects: [fertig(J)], next: 'ende' }),
  node('versteck', [N(s.versteck)], { effects: [fertig(J)], next: 'ende' }),
  node('vorstrecken', [
    N(`${s.name} starrt dich an, als hättest du gerade ein Kaninchen aus einem Hut gezogen. Einem fremden Hut.`),
    L('hunter', 'Das ist nicht, wie das funktioniert. … Aber gut. Geld ist Geld. Deins riecht sogar besser.', 'signatur'),
  ], { next: 'ende' }),
  node('ende', [N('Auftrag erledigt. Irgendwo im High Voltage klingelt eine Kasse, obwohl niemand drangeht.')]),
]);

export const part: ContentPart = {
  jobs: byId(tpl),
  encounters: byId(pruegel),
  dialogues: byId(...SCHULDNER.map(gespraech)),
  mapAdditions: zusatz(SCHULDNER.map((s) => zielSpot(`pj-schulden-${s.key}`, s, s.name, `pj-schulden-${s.key}`, all(job(J), s.wann), 0, 0))),
};
