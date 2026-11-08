// Speicherplätze, Galerie-Speicher und Einstellungen (Bereich dom-ui) – ohne Browser über eine Speicher-Attrappe.
import { describe, expect, it } from 'vitest';
import { sanitizeSettings } from './settings';
import { createGalleryStore, createSaveSlots, SLOT_COUNT, summarizeSave } from './storage';

function fakeStorage(options: { failWrites?: boolean } = {}) {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => { if (options.failWrites) throw new Error('voll'); data.set(key, value); },
    removeItem: (key: string) => { data.delete(key); },
  };
}

const save = (over: Record<string, unknown> = {}) => JSON.stringify({
  version: 1, map: 'neon-gasse', act: 1, playTimeMs: 61000, ended: false,
  player: { name: 'Kim', level: 3 }, clock: { day: 4, minutes: 1100 }, ...over,
});

describe('Speicherplätze', () => {
  it('hat drei Plätze, schreibt, liest und löscht', () => {
    const storage = fakeStorage();
    const slots = createSaveSlots(storage);
    expect(slots.list()).toHaveLength(SLOT_COUNT);
    expect(slots.list().every((entry) => entry.empty)).toBe(true);
    expect(slots.write(2, save(), 1000)).toBe(true);
    expect(slots.read(2)).toBe(save());
    const summary = slots.list()[1];
    expect(summary).toMatchObject({ slot: 2, empty: false, savedAt: 1000, name: 'Kim', level: 3, day: 4, minutes: 1100, map: 'neon-gasse', playTimeMs: 61000 });
    slots.clear(2);
    expect(slots.read(2)).toBeNull();
    expect(storage.data.size).toBe(0);
  });

  it('lehnt ungültige Plätze ab und meldet volle Speicher', () => {
    const slots = createSaveSlots(fakeStorage());
    expect(slots.write(0, save())).toBe(false);
    expect(slots.write(4, save())).toBe(false);
    expect(slots.read(9)).toBeNull();
    expect(createSaveSlots(fakeStorage({ failWrites: true })).write(1, save())).toBe(false);
  });

  it('funktioniert ohne localStorage im Speicher weiter', () => {
    const slots = createSaveSlots(null);
    expect(slots.write(1, save(), 5)).toBe(true);
    expect(slots.list()[0]).toMatchObject({ empty: false, name: 'Kim', savedAt: 5 });
  });

  it('kennzeichnet beschädigte Plätze und ältere Rohdaten', () => {
    const storage = fakeStorage();
    storage.setItem('nexusrpg-slot-1', 'kein json');
    storage.setItem('nexusrpg-slot-3', save({ ended: true }));
    const list = createSaveSlots(storage).list();
    expect(list[0]).toMatchObject({ empty: false, corrupt: true });
    expect(list[2]).toMatchObject({ empty: false, ended: true, name: 'Kim' });
  });

  it('fasst Spielstände fehlertolerant zusammen', () => {
    expect(summarizeSave(null)).toEqual({ slot: 0, empty: true });
    expect(summarizeSave('[]', 1)).toMatchObject({ corrupt: true });
    expect(summarizeSave(JSON.stringify({ player: { name: 42 }, clock: 'x' }), 1)).toEqual({ slot: 1, empty: false });
  });
});

describe('Galerie-Speicher', () => {
  it('merkt sich gesehene Szenen über Partien hinweg', () => {
    const storage = fakeStorage();
    const store = createGalleryStore(storage);
    expect(store.ids()).toEqual([]);
    expect(store.add(['a', 'b'])).toBe(true);
    expect(store.add(['a'])).toBe(false);
    expect(createGalleryStore(storage).ids()).toEqual(['a', 'b']);
    storage.setItem('nexusrpg-gallery-v1', '{"kaputt":1}');
    expect(createGalleryStore(storage).ids()).toEqual([]);
  });
});

describe('Einstellungen', () => {
  it('übernimmt nur erlaubte Schriftgrößen', () => {
    expect(sanitizeSettings({ textScale: 1.3 }).textScale).toBe(1.3);
    expect(sanitizeSettings({ textScale: 7 }).textScale).toBe(1);
    expect(sanitizeSettings(null).textScale).toBe(1);
  });
});
