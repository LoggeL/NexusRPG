// Baukasten für die benannten Kopfgelder (world.md §6.7, Stufe 1–2). Kein Inhaltsteil.
// Ablauf: Auftrag an Hunters Tafel (Stufe 1 ab Rang 2, Stufe 2 ab Rang 4) → Ziel auf der Karte (Hotspot, nur mit Auftrag) →
//   gestellt (Check, Weg ohne Check oder Kampfsieg) → beim Gerichtssaal an der Saalwache abliefern (voller Lohn) ·
//   laufen lassen gegen Information (halber Lohn, Ziel wird Kontakt) · zur Selbstanzeige überreden (voll, Ruf `unterstadt` +5).
import type { AttributeId, Condition, DialogueChoice, DialogueDef, DialogueLine, Effect, JobTemplateDef } from '../../../modules/contracts';
import { fertig, zielSpot } from './_auftrag';
import type { Hotspot } from './_lib';
import { N, abRang, all, any, c, chk, cr, dlg, flag, job, msg, node, noFlag, not, rep, set } from './_lib';

export interface Weg {
  text: string;
  check?: [AttributeId, number, string[]];
  requires?: Condition;
  when?: Condition;
  tag?: string;
  effects?: Effect[];
  ergebnis: 'gestellt' | 'selbst';
  zeilen: DialogueLine[];
}

export interface Kopfgeld {
  key: string;
  name: string;
  stufe: 1 | 2;
  map: string;
  spot: string;
  ortLabel: string;
  wann: Condition;
  /** Kampf aus combat/encounters-jobs.ts; fehlt bei Oma Turbo (Kampf unmöglich). */
  encounter?: string;
  steckbrief: string;
  auftritt: DialogueLine[];
  wege: Weg[];
  kampfText?: string;
  /** Was das Ziel verrät, wenn man es laufen lässt. */
  info: DialogueLine[];
  abgabe: string;
}

export const kgId = (k: Kopfgeld) => `kopfgeld-${k.key}`;
const gestellt = (k: Kopfgeld) => `kg_${k.key.replace(/-/g, '_')}_gestellt`;
export const erledigt = (k: Kopfgeld) => `kg_${k.key.replace(/-/g, '_')}_erledigt`;
const LOHN = { 1: 200, 2: 400 } as const;
const XP = { 1: 120, 2: 200 } as const;

export function vorlageKopfgeld(k: Kopfgeld): JobTemplateDef {
  return {
    id: kgId(k), kind: 'kopfgeld', title: `Kopfgeld: ${k.name}`,
    text: `${k.steckbrief} Ort: ${k.ortLabel}. Lebend beim Richter abliefern. {credits} Cr.`,
    boards: ['auftragstafel'], when: all(abRang(k.stufe === 1 ? 2 : 4), noFlag(erledigt(k))),
    targets: [{ map: k.map, label: k.ortLabel }],
    reward: { credits: [LOHN[k.stufe], LOHN[k.stufe]], xp: XP[k.stufe], rep: { 'crew-hunter': 4 } },
  };
}

/** Gestellt = Flag oder gewonnener Kampf. */
export const istGestellt = (k: Kopfgeld): Condition => (k.encounter ? any(flag(gestellt(k)), { won: k.encounter }) : flag(gestellt(k)));

export function zielDialog(k: Kopfgeld): DialogueDef {
  const J = kgId(k);
  const wege: DialogueChoice[] = k.wege.map((w, i) => c(w.text, `weg-${i}`, {
    ...(w.check ? { check: chk(`kg-${k.key}-${i}`, w.check[0], w.check[1], w.check[2]) } : {}),
    ...(w.requires ? { requires: w.requires } : {}),
    ...(w.when ? { when: w.when } : {}),
    ...(w.tag ? { tag: w.tag } : {}),
    ...(w.effects ? { effects: w.effects } : {}),
  }));
  return dlg(`pj-kg-${k.key}`, [
    node('start', k.auftritt, {
      choices: [
        ...wege,
        ...(k.encounter ? [c(k.kampfText ?? 'Zugreifen. Mit allem, was du hast.', undefined, { effects: [{ battle: k.encounter }] })] : []),
        c('„Erzähl mir was Nützliches, dann hab ich dich nie gesehen.“', 'laufen'),
        c('Später.'),
      ],
    }),
    ...k.wege.map((w, i) => node(`weg-${i}`, w.zeilen, {
      effects: w.ergebnis === 'gestellt'
        ? [set(gestellt(k)), msg(`${k.name} ist gestellt. Abliefern: Gerichtssaal, an der Saalwache.`)]
        : [fertig(J), rep('unterstadt', 5), set(erledigt(k))],
    })),
    node('laufen', k.info, {
      effects: [fertig(J), cr(-LOHN[k.stufe] / 2), set(erledigt(k)), set(`kontakt_${k.key.replace(/-/g, '_')}`),
        msg('Laufen lassen: halber Lohn. Dafür hast du jetzt einen Kontakt, der dir etwas schuldet.')],
    }),
  ]);
}

export const zielHotspot = (k: Kopfgeld): [string, Hotspot] =>
  zielSpot(`pj-kg-${k.key}`, { map: k.map, spot: k.spot, label: k.ortLabel }, k.name, `pj-kg-${k.key}`,
    all(job(kgId(k)), k.wann, not(istGestellt(k)), noFlag(erledigt(k))), 0, 0);

/** Auswahl an der Saalwache. */
export const abgabeWahl = (k: Kopfgeld): DialogueChoice => c(`${k.name} abliefern.`, `ab-${k.key}`, {
  when: all(job(kgId(k)), istGestellt(k), noFlag(erledigt(k))),
  effects: [fertig(kgId(k)), set(erledigt(k))],
});
export const abgabeKnoten = (k: Kopfgeld) => node(`ab-${k.key}`, [N(k.abgabe)], { next: 'start' });
