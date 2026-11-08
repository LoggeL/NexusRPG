import { describe, expect, it } from 'vitest';
import { DEFAULT_APPEARANCE } from '../appearance';
import { fixtureContent } from '../__fixtures__/content';
import { createCampaign, parseSave, SAVE_VERSION, serializeState } from './index';

function played() {
  const content = fixtureContent();
  const campaign = createCampaign(content, { storage: null, seed: 11 });
  campaign.createCharacter({ name: 'Testfigur', look: 'a', origin: 'gosse', attributes: { technik: 5, koerper: 4, reflexe: 4, ausstrahlung: 3, strasse: 3 } });
  campaign.apply([{ setFlag: 'angekommen' }, { relation: 'raven', delta: 230 }, { give: 'messer' }, { rep: 'crew', delta: 7 }]);
  campaign.setLocation('bar', [100, 400], 'e');
  campaign.buy('kiosk', 'kaffee');
  campaign.acceptJob(campaign.jobOffers('tafel')[0].id);
  campaign.readPhone('hallo', 0);
  return { content, campaign };
}

const mutateSave = (raw: string, change: (data: Record<string, any>) => void) => {
  const data = JSON.parse(raw);
  change(data);
  return JSON.stringify(data);
};

describe('Speicherformat', () => {
  it('überträgt einen Spielstand verlustfrei', () => {
    const { content, campaign } = played();
    const raw = campaign.exportSave();
    expect(JSON.parse(raw).version).toBe(SAVE_VERSION);
    const parsed = parseSave(raw, content);
    expect('state' in parsed && parsed.state).toEqual(JSON.parse(raw));
    const other = createCampaign(content, { storage: null });
    expect(other.importSave(raw)).toBe(true);
    expect(serializeState(other.state())).toBe(raw);
  });

  const broken: [string, (data: Record<string, any>) => void][] = [
    ['falsche Version', d => { d.version = 3; }],
    ['Aussehen kaputt', d => { d.player.appearance = { v: 1 }; }],
    ['unbekannte Karte', d => { d.map = 'mond'; }],
    ['Position außerhalb', d => { d.position = [5000, 10]; }],
    ['unbekannter Gegenstand', d => { d.inventory.laser = 1; }],
    ['negative Menge', d => { d.inventory.kaffee = -1; }],
    ['Attribut zu hoch', d => { d.player.attributes.technik = 11; }],
    ['Stufe passt nicht zu XP', d => { d.player.level = 9; }],
    ['unbekannte Figur', d => { d.relations.niemand = d.relations.raven; }],
    ['Punkte außerhalb', d => { d.relations.raven.points = 5000; }],
    ['Party ohne Crew', d => { d.party = ['raven']; }],
    ['unbekannter Queststatus', d => { d.quests.ankunft.status = 'vielleicht'; }],
    ['Uhr außerhalb', d => { d.clock.minutes = 100; }],
    ['Credits negativ', d => { d.credits = -5; }],
    ['Flag kein Boolean', d => { d.flags.x = 'ja'; }],
    ['reservierter Schlüssel', d => { d.flags = JSON.parse('{"__proto__": true}'); }],
    ['Ruf außerhalb', d => { d.reputation.crew = 500; }],
    ['unbekannte Telefonnachricht', d => { d.phone.push({ id: 'spam', day: 1, read: false }); }],
    ['Spieler fehlt', d => { delete d.player; }],
  ];

  for (const [label, change] of broken) {
    it(`lehnt ab und lässt die Partie unverändert: ${label}`, () => {
      const { content, campaign } = played();
      const raw = mutateSave(campaign.exportSave(), change);
      const before = campaign.state();
      expect(campaign.importSave(raw)).toBe(false);
      expect(campaign.lastImportError()).toBeTruthy();
      expect(campaign.state()).toBe(before);
      expect('error' in parseSave(raw, content)).toBe(true);
    });
  }

  it('lehnt Nicht-JSON, leere und übergroße Eingaben ab', () => {
    const { content, campaign } = played();
    const before = campaign.state();
    for (const raw of ['', 'kein json', '[]', 'null', 'x'.repeat(600_000)]) {
      expect(campaign.importSave(raw)).toBe(false);
      expect('error' in parseSave(raw, content)).toBe(true);
    }
    expect(campaign.state()).toBe(before);
  });

  it('migriert Version 1: Aussehen aus der Vorlage, unbekannte Vorlage ersetzt', () => {
    const { content, campaign } = played();
    const raw = mutateSave(campaign.exportSave(), d => { d.version = 1; delete d.player.appearance; d.player.look = 'test-a'; });
    const parsed = parseSave(raw, content);
    expect('state' in parsed).toBe(true);
    if (!('state' in parsed)) return;
    expect(parsed.state.version).toBe(SAVE_VERSION);
    expect(parsed.state.player.look).toBe('a');
    expect(parsed.state.player.appearance).toEqual(DEFAULT_APPEARANCE);
    expect(parsed.notes.length).toBeGreaterThan(0);
  });

  it('verwirft unbekannte Zusatzfelder', () => {
    const { content, campaign } = played();
    const raw = mutateSave(campaign.exportSave(), d => { d.cheat = true; });
    const parsed = parseSave(raw, content);
    expect('state' in parsed && 'cheat' in parsed.state).toBe(false);
  });
});
