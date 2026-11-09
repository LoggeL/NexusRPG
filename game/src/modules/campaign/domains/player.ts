// Domäne „Vertretung“: Die Spielfigur wird vorübergehend durch eine andere Figur ersetzt (Prolog als Raven,
// world.md §5.1). Während der Vertretung ist `state.player` das Blatt der Figur (Name, Werte, eigene LP), die eigene
// Spielfigur liegt in `player.standIn.own`. Alles, was `state.player` liest (Checks, Kampf, HUD), sieht so die Figur.
// Inventar, Credits, Uhr, Flags und Beziehungen bleiben gemeinsam.
import type { AttributeId, GameContent, PlayerState, StandInDef } from '../../contracts';
import { ATTRIBUTE_IDS, ATTR_MAX, ATTR_MIN, clamp, has } from '../ids';
import { SAVE_LIMITS, fail, obj } from '../validate';
import type { EffectContext, EffectSpecs } from '../registry';
import { addXp, clampHp, maxHpOf, parsePlayer } from './character';

/** Längste HUD-Datumszeile einer Vertretung (Speicherformat). */
export const STAND_IN_LABEL_MAX = 60;

/** Vertretung beenden: eigene Figur zurück, XP aus der Vertretung gutschreiben, Ausrüstungswechsel übernehmen. */
export function endStandInIn(ctx: EffectContext): void {
  const sheet = ctx.draft.player;
  const stand = sheet.standIn;
  if (!stand) return;
  const own: PlayerState = { ...stand.own, equipment: { ...sheet.equipment } };
  const gained = Math.max(0, sheet.xp - stand.own.xp);
  ctx.draft.player = own;
  clampHp(ctx.content, ctx.draft);
  if (gained > 0) addXp(ctx, gained);
}

function standInProblem(ctx: EffectContext, def: StandInDef): string | null {
  if (!def || typeof def !== 'object' || typeof def.npc !== 'string' || !has(ctx.content.npcs, def.npc)) return 'Unbekannte Figur für die Vertretung.';
  if (!def.attributes || typeof def.attributes !== 'object') return 'Vertretung ohne Werte.';
  if (def.name !== undefined && (typeof def.name !== 'string' || !def.name || def.name.length > SAVE_LIMITS.nameLength)) return 'Ungültiger Name der Vertretung.';
  if (def.dateLabel !== undefined && (typeof def.dateLabel !== 'string' || def.dateLabel.length > STAND_IN_LABEL_MAX)) return 'Ungültige Datumszeile.';
  return null;
}

/** Vertretung beginnen; dieselbe Figur erneut ist ein No-op, eine andere löst die laufende ab. */
export function startStandInIn(ctx: EffectContext, def: StandInDef): string | null {
  const problem = standInProblem(ctx, def);
  if (problem) return problem;
  if (ctx.draft.player.standIn?.npc === def.npc) return null;
  if (ctx.draft.player.standIn) endStandInIn(ctx);
  const own = ctx.draft.player;
  const attributes = {} as Record<AttributeId, number>;
  for (const id of ATTRIBUTE_IDS) {
    const value = def.attributes[id];
    attributes[id] = clamp(Number.isFinite(value) ? Math.round(value) : own.attributes[id], ATTR_MIN, ATTR_MAX);
  }
  const sheet: PlayerState = {
    created: own.created,
    name: def.name ?? ctx.content.npcs[def.npc].name,
    look: own.look,
    appearance: own.appearance,
    origin: own.origin,
    level: own.level,
    xp: own.xp,
    attributes,
    unspentAttr: 0,
    perkPoints: 0,
    perks: (def.perks ?? []).filter(perk => has(ctx.content.perks, perk)),
    cyberware: {},
    equipment: { ...own.equipment },
    hp: 1,
    standIn: { npc: def.npc, ...(def.dateLabel ? { dateLabel: def.dateLabel } : {}), own },
  };
  sheet.hp = maxHpOf(ctx.content, sheet);
  ctx.draft.player = sheet;
  return null;
}

export const playerEffects: EffectSpecs<'standIn'> = {
  standIn: {
    apply(e, ctx) {
      if (e.standIn === null) { endStandInIn(ctx); return null; }
      return startStandInIn(ctx, e.standIn);
    },
    refs: e => (e.standIn ? [{ kind: 'npcs' as const, id: e.standIn.npc }] : []),
  },
};

/**
 * Spielfigur aus dem Speicherformat samt laufender Vertretung (`standIn` ist optional; alte Stände haben keine).
 * Die eigene Figur darf selbst keine Vertretung tragen.
 */
export function parsePlayerState(value: unknown, content: GameContent, notes: string[] = []): PlayerState {
  const player = parsePlayer(value, content, notes);
  const raw = obj(value, 'Spielfigur').standIn;
  if (raw === undefined) return player;
  const s = obj(raw, 'Vertretung');
  if (typeof s.npc !== 'string' || !has(content.npcs, s.npc)) fail('Unbekannte Figur in der Vertretung.');
  if (s.dateLabel !== undefined && (typeof s.dateLabel !== 'string' || s.dateLabel.length > STAND_IN_LABEL_MAX)) fail('Ungültige Datumszeile der Vertretung.');
  if (Object.keys(s).some(key => key !== 'npc' && key !== 'dateLabel' && key !== 'own')) fail('Unbekannte Angabe in der Vertretung.');
  if (obj(s.own, 'Eigene Spielfigur').standIn !== undefined) fail('Verschachtelte Vertretung.');
  const own = parsePlayer(s.own, content, notes);
  player.standIn = { npc: s.npc as string, ...(typeof s.dateLabel === 'string' && s.dateLabel ? { dateLabel: s.dateLabel } : {}), own };
  return player;
}
