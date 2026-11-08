import { describe, expect, it } from 'vitest';
import { content } from './index';
import { NEVER_ROMANCE, ROMANCE_CANDIDATES, ROMANCE_ENABLED } from './romance';

describe('Romanze-Schalter', () => {
  it('enthält nie die Straßenkinder oder gesperrte Figuren', () => {
    for (const child of ['daria', 'freya', 'jakko']) expect(NEVER_ROMANCE).toContain(child);
    for (const npc of NEVER_ROMANCE) {
      expect(ROMANCE_ENABLED.has(npc)).toBe(false);
      expect(ROMANCE_CANDIDATES).not.toContain(npc);
    }
  });

  it('schaltet nur Figuren der Positivliste frei und übernimmt alle vorhandenen', () => {
    for (const npc of ROMANCE_ENABLED) expect(ROMANCE_CANDIDATES).toContain(npc);
    for (const npc of content.romance) expect(ROMANCE_ENABLED.has(npc)).toBe(true);
    for (const npc of ROMANCE_ENABLED) if (content.npcs[npc]) expect(content.romance.has(npc)).toBe(true);
  });

  it('freigeschaltete Figuren sind im Inhalt romanzierbar und keine Kinder', () => {
    for (const npc of ROMANCE_ENABLED) {
      const def = content.npcs[npc];
      if (!def) continue; // Figur noch nicht im Inhalt
      expect(def.romanceable).toBe(true);
      expect(def.child).not.toBe(true);
    }
  });

  it('markiert Kinderfiguren und gesperrte Figuren im Inhalt nie als romanzierbar', () => {
    for (const npc of Object.values(content.npcs)) {
      if (npc.child || NEVER_ROMANCE.includes(npc.id)) expect(npc.romanceable).not.toBe(true);
      if (npc.romanceable) expect(ROMANCE_CANDIDATES).toContain(npc.id);
    }
  });
});
