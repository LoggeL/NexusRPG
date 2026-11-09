// Festnahme (world.md §10.3 „3: Festnahme bei Kontakt“): Effekt `arrest`.
// Ab in den Zellentrakt (Einstieg `haft`), Flag `in_haft`, ein Teil der Credits wird als Strafe eingezogen und die
// Fahndung fällt auf 0. Raus kommt man über die vorhandenen Zellentrakt-Inhalte (Pritsche bis 06:00 bzw. morgens an
// der Tür klopfen). Wann eine Festnahme auslöst (Streifenkarten, Sperren in Story-Szenen), steht im Inhalt
// (content/parts/system/festnahme.ts). Richter-Rivalität: höhere Strafe (world.md §4.5).
// Zuständig: Bereich Wirtschaft (Fahndung).
import type { Condition } from '../../contracts';
import { has } from '../ids';
import type { EffectSpecs } from '../registry';
import { WANTED_MAX } from './core';
import { addCredits } from './economy';

export const ARREST_MAP = 'zellentrakt';
export const ARREST_ENTRY = 'haft';
export const ARREST_FLAG = 'in_haft';
/** Strafe in Prozent der Credits. */
export const ARREST_FINE_PERCENT = 10;
/** Richter-Rivalität: „höhere Strafen“. */
export const ARREST_HARSH_FINE_PERCENT = 20;
export const ARREST_HARSH_WHEN: Condition = { rival: 'richter' };

/** Strafe in Credits für diesen Kontostand (abgerundet, nie negativ). */
export const arrestFine = (credits: number, percent: number): number =>
  Math.max(0, Math.floor((Number.isFinite(credits) ? credits : 0) * percent / 100));

export const arrestEffects: EffectSpecs<'arrest'> = {
  arrest: {
    apply(e, ctx) {
      if (e.arrest !== true) return 'Ungültige Festnahme.';
      const { content, draft } = ctx;
      if (draft.flags[ARREST_FLAG] === true) return null;
      if (!has(content.maps, ARREST_MAP) || !has(content.maps[ARREST_MAP].entries, ARREST_ENTRY)) {
        return `Unbekannter Einstieg: ${ARREST_MAP}#${ARREST_ENTRY}`;
      }
      draft.flags[ARREST_FLAG] = true;
      for (let level = 1; level <= WANTED_MAX; level++) delete draft.flags[`fahndung_${level}`];
      const harsh = ctx.evaluate(ARREST_HARSH_WHEN);
      const fine = arrestFine(draft.credits, harsh ? ARREST_HARSH_FINE_PERCENT : ARREST_FINE_PERCENT);
      ctx.messages.push(harsh
        ? 'Festgenommen. Der Richter hat dich auf dem Kieker: doppelte Strafe, Fahndung gelöscht.'
        : 'Festgenommen. Eine Nacht im Zellentrakt, Fahndung gelöscht.');
      if (fine > 0) {
        const problem = addCredits(ctx, -fine);
        if (problem) return problem;
      }
      ctx.requests.push({ travel: ARREST_MAP, entry: ARREST_ENTRY });
      return null;
    },
    refs: () => [{ kind: 'entry', id: `${ARREST_MAP}#${ARREST_ENTRY}` }],
  },
};
