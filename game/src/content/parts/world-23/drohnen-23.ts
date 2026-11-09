// Quantum-Drohnen in der Unterstadt (world.md §5.3 „Freie Phase Akt 2“, §10.7 „Fortschritt“): Nach dem Bruch
// schwebt über jeder Unterstadt-Zone eine sichtbare Späher-Gruppe. Umgehen per Check (je Zone ein anderes Attribut)
// oder einfach außen herum laufen; wer kämpft, holt sich Quantum-Chipschrott (für prep-gegenmittel), aber die
// Drohne funkt im Absturz noch das Gesicht durch: Fahndung +1 (Quantum-Alarm, §10.3).
// Nur Akt 2 nach main-2-bruch; im Master-Modus gehorchen die Drohnen der Spielfigur und greifen nicht an.
// Die Blick-Hotspots „Quantum-Drohne“ und der Dosenwurf in quest-main-2/freie-phase.ts bleiben daneben bestehen.
import type { EncounterDef, MapEncounterDef, Point } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import type { MapAddition } from '../../part';
import { NACH_BRUCH, byId, give, msg, nar, wcheck23 } from './_w23';

interface Drohne {
  key: string;
  map: string;
  /** Spot der Zielkarte. */
  at: string;
  patrol: Point[];
  arena: string;
  name: string;
  intro: string;
  mitWache?: boolean;
  avoid: MapEncounterDef['avoid'];
}

const DROHNEN: Drohne[] = [
  {
    key: 'neon-gasse', map: 'neon-gasse', at: 'kalle-ecke', patrol: [[360, 382], [520, 424], [700, 520]], arena: 'arena-strasse',
    name: 'Späher über der Neon-Gasse',
    intro: 'Zwei weiße Drohnen sinken aus dem Neon herab, rote Augen, sanfte Stimme: „Bitte lächeln Sie. Ihr Lächeln wird gespeichert. Für immer.“',
    avoid: wcheck23('drohne-neon-schatten', 'reflexe', 5, { tags: ['schleichen'] } /* Im Schatten der Markise vorbei */),
  },
  {
    key: 'schrottmarkt', map: 'schrottmarkt', at: 'halde', patrol: [[760, 160], [642, 212], [862, 190]], arena: 'arena-schrottplatz',
    name: 'Späher über der Halde',
    intro: 'Über der Schrotthalde kreisen zwei Quantum-Späher und eine Störsender-Drohne. Gustavs Kran zeigt anklagend nach oben. Die Drohnen ignorieren ihn. Dich nicht.',
    avoid: wcheck23('drohne-markt-hack', 'technik', 5, { tags: ['hacken', 'drohne'] } /* Drohnen auf „Wartung“ funken */),
  },
  {
    key: 'loetgassen', map: 'loetgassen', at: 'waeschehof', patrol: [[1430, 580], [1420, 680], [1290, 600]], arena: 'arena-hinterhof',
    name: 'Späher im Wäschehof',
    intro: 'Zwischen den Wäscheleinen hängt eine Drohne fest und schimpft mit einer Unterhose. Die zweite hat dich schon gesehen. „Unbekanntes Gesicht. Unbekanntes Gesicht wird bekannt gemacht.“',
    avoid: wcheck23('drohne-loet-kurierweg', 'strasse', 5, { tags: ['schleichen', 'verstecke'] } /* Kurier-Schleichweg durch die Overalls */),
  },
  {
    key: 'rohrsiedlung', map: 'rohrsiedlung', at: 'quantum-streife', patrol: [[760, 720], [700, 640], [880, 560]], arena: 'arena-hinterhof',
    name: 'Quantum-Streife in der Rohrsiedlung', mitWache: true,
    intro: 'Ein Quantum-Wachmann mit Drohne an der Leine, wie ein Hund. „Routinekontrolle. Bitte nennen Sie Namen, Wohnort und Ihre Meinung zu Chrome 10. Die richtige Meinung.“',
    avoid: wcheck23('drohne-rohr-kletterpfad', 'reflexe', 6, { tags: ['klettern', 'schleichen'] } /* Über den Kletterpfad an den Rohren */),
  },
  {
    key: 'bahnhof', map: 'bahnhof-mitte', at: 'gleise', patrol: [[560, 566], [700, 430], [420, 768]], arena: 'arena-gleise',
    name: 'Späher am Bahnsteig',
    intro: 'Zwei Drohnen gleiten über die Gleise und scannen jeden, der aus der U-Bahn steigt. Die U-Bahn ist zu spät. Die Drohnen nicht.',
    avoid: wcheck23('drohne-bahnhof-fahrplan', 'technik', 6, { tags: ['hacken', 'drohne'] } /* Drohnen auf den Fahrplan von Frau Takt umleiten */),
  },
  {
    key: 'hafenkante', map: 'hafenkante', at: 'quantum-depot', patrol: [[1380, 268], [1220, 300], [1100, 470]], arena: 'arena-hafen',
    name: 'Depotwache mit Späher', mitWache: true,
    intro: 'Vor dem Quantum-Depot: ein Wachmann, eine Drohne, ein Klemmbrett. „Sie stehen auf Firmengelände. Sie stehen auch auf meiner Liste. Ich hab nur eine Liste.“',
    avoid: wcheck23('drohne-hafen-container', 'koerper', 6, { tags: ['kraft'] } /* Einen Container als Deckung vorschieben */),
  },
];

const encId = (d: Drohne) => `enc-welt23-drohne-${d.key}`;

const encounters: EncounterDef[] = DROHNEN.map((d) => ({
  id: encId(d),
  name: d.name,
  arena: d.arena,
  enemies: d.mitWache
    ? [{ enemy: 'quantum-wachmann' }, { enemy: 'spaeherdrohne' }]
    : [{ enemy: 'spaeherdrohne', count: 2 }, ...(d.key === 'schrottmarkt' ? [{ enemy: 'stoerdrohne' }] : [])],
  intro: [nar(d.intro)],
  reward: { xp: 40, items: { 'quantum-chip-schrott': 1 } },
  onWin: [
    { wanted: 1 },
    msg('Im Absturz funkt die Drohne noch ein letztes Bild nach Hause. Deins. Quantum-Alarm: Fahndung +1. Im Wrack klappert ein Chip.'),
  ],
}));

const placement = (d: Drohne): Omit<MapEncounterDef, 'at'> & { at: string } => ({
  id: `welt23-drohne-${d.key}`,
  encounter: encId(d),
  at: d.at,
  sprite: d.mitWache ? 'quantum-wachmann-walk' : 'spaeherdrohne-walk',
  patrol: d.patrol,
  radius: 56,
  when: NACH_BRUCH,
  avoid: d.avoid,
});

const mapAdditions: Record<string, MapAddition> = {};
for (const d of DROHNEN) {
  const add = (mapAdditions[d.map] ??= {});
  (add.encounters ??= []).push(placement(d));
}

// Die Halde hat einen Absturzplatz: Nach dem Sieg liegt dort einmal ein Teil herum.
(mapAdditions.schrottmarkt!.hotspots ??= []).push({
  id: 'welt23-drohnenwrack-halde', at: 'halde', radius: 44, label: 'Drohnenwrack durchsuchen', kind: 'loot', once: true,
  when: { won: 'enc-welt23-drohne-schrottmarkt' },
  effects: [give('schrott-ersatzteil', 2), msg('Zwei Rotoren, ein Kameraauge ohne Lust und zwei brauchbare Ersatzteile. Gustav ruft vom Kran: „Die Linse ist meine!“')],
});

export const part: ContentPart = {
  encounters: byId(encounters),
  mapAdditions,
};
