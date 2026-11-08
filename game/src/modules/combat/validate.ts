// Kampfregeln: Inhaltsprüfung für Arenen, Begegnungen, Gegner und Fähigkeiten (ergänzt campaign/lint.ts um
// Regeln, die nur der Kampf kennt: Startfelder, Missionsziele, Wertebereiche, Probeaufbau).
import type { Cell } from '../contracts';
import { has } from '../campaign/ids';
import { cellKey, cellsWith, inBounds, isWalkable, neighbors, parseLayout } from './grid';
import { createBattle } from './setup';
import type { CombatData, PartyMemberSpec } from './types';

const PROBE: PartyMemberSpec = {
  id: 'probe', name: 'Probe', source: { kind: 'player' }, sprite: 'probe', level: 1, hp: 30, maxHp: 30, armor: 0,
  attributes: { technik: 3, koerper: 3, reflexe: 3, ausstrahlung: 3, strasse: 3 }, weapons: [], abilities: [],
};

const cellText = (cell: Cell) => `(${cell[0]}, ${cell[1]})`;

/** Begehbare Felder, die von den Startfeldern aus erreichbar sind (ohne Einheiten). */
function connected(layout: readonly string[], starts: readonly Cell[]): Set<string> {
  const seen = new Set<string>(starts.map(cellKey));
  const queue = [...starts];
  for (let i = 0; i < queue.length; i++) {
    for (const next of neighbors(queue[i])) {
      const key = cellKey(next);
      if (seen.has(key) || !isWalkable(layout, next)) continue;
      seen.add(key);
      queue.push(next);
    }
  }
  return seen;
}

/** Liefert lesbare Probleme (leer = alles in Ordnung). */
export function validateCombatContent(data: CombatData): string[] {
  const problems: string[] = [];
  const report = (at: string, text: string) => problems.push(`${at}: ${text}`);

  for (const ability of Object.values(data.abilities)) {
    const at = `Fähigkeit ${ability.id}`;
    if (!(ability.ap >= 1 && ability.ap <= 2 && Number.isInteger(ability.ap))) report(at, 'ap muss 1 oder 2 sein');
    if (!(ability.range >= 0)) report(at, 'range darf nicht negativ sein');
    if (ability.target === 'enemy' && ability.range < 1) report(at, 'Gegnerziele brauchen range ≥ 1');
    if (ability.radius !== undefined && !(ability.radius >= 0)) report(at, 'radius darf nicht negativ sein');
    if (ability.status) {
      if (!(ability.status.turns >= 1)) report(at, 'Zustand braucht turns ≥ 1');
      if (ability.status.chance !== undefined && !(ability.status.chance > 0 && ability.status.chance <= 1)) report(at, 'chance liegt zwischen 0 und 1');
    }
    if (ability.cooldown !== undefined && !(ability.cooldown >= 0)) report(at, 'cooldown darf nicht negativ sein');
    if (ability.uses !== undefined && !(ability.uses >= 1)) report(at, 'uses braucht ≥ 1');
    if (!ability.damage && !ability.heal && !ability.status && ability.kind !== 'sozial') report(at, 'wirkt nicht (kein Schaden, keine Heilung, kein Zustand)');
  }

  for (const enemy of Object.values(data.enemies)) {
    const at = `Gegner ${enemy.id}`;
    if (!(enemy.stats.hp > 0)) report(at, 'braucht LP > 0');
    if (!(enemy.stats.weapon.range >= 1)) report(at, 'Waffenreichweite braucht ≥ 1');
    if (enemy.stats.morale !== undefined && !(enemy.stats.morale >= 0 && enemy.stats.morale <= 100)) report(at, 'Moral liegt zwischen 0 und 100');
    if (enemy.credits && enemy.credits[0] > enemy.credits[1]) report(at, 'Credits: Minimum größer als Maximum');
    for (const loot of enemy.loot ?? []) if (!(loot.chance > 0 && loot.chance <= 1)) report(at, `Beute ${loot.item}: chance zwischen 0 und 1`);
    let last = 1;
    for (const phase of enemy.phases ?? []) {
      if (!(phase.below > 0 && phase.below < 1)) report(at, 'Phase: below liegt zwischen 0 und 1');
      if (phase.below > last) report(at, 'Phasen absteigend nach below ordnen');
      last = phase.below;
    }
  }

  for (const arena of Object.values(data.arenas)) {
    const at = `Arena ${arena.id}`;
    try {
      const layout = parseLayout(arena.layout, at);
      const party = cellsWith(layout, 'P');
      const enemies = cellsWith(layout, 'E');
      if (!party.length) report(at, 'kein Party-Start (P)');
      if (!enemies.length) report(at, 'kein Gegner-Start (E)');
      const reach = connected(layout, party);
      if (party.length && enemies.some(cell => !reach.has(cellKey(cell)))) report(at, 'Party- und Gegnerstart sind nicht durchgehend verbunden');
    } catch (error) {
      report(at, (error as Error).message);
    }
  }

  for (const encounter of Object.values(data.encounters)) {
    const at = `Begegnung ${encounter.id}`;
    const arena = has(data.arenas, encounter.arena) ? data.arenas[encounter.arena] : undefined;
    if (!arena) { report(at, `unbekannte Arena „${encounter.arena}“`); continue; }
    let layout: string[];
    try { layout = parseLayout(arena.layout); } catch { continue; }
    const walkable = (cell: Cell) => inBounds(cell) && isWalkable(layout, cell);
    const reach = connected(layout, cellsWith(layout, 'P'));
    const reachable = (cell: Cell) => reach.has(cellKey(cell));
    for (const entry of encounter.enemies) {
      if (!has(data.enemies, entry.enemy)) report(at, `unbekannter Gegner „${entry.enemy}“`);
      if (entry.at && !walkable(entry.at)) report(at, `Startfeld ${cellText(entry.at)} für ${entry.enemy} nicht begehbar`);
      if (entry.count !== undefined && !(entry.count >= 1)) report(at, `count für ${entry.enemy} braucht ≥ 1`);
    }
    const objective = encounter.objective;
    if (objective?.kind === 'survive' && !(objective.rounds >= 1)) report(at, 'Überleben braucht rounds ≥ 1');
    if (objective?.kind === 'reach') {
      if (!objective.cells.length) report(at, 'Ausgang ohne Felder');
      for (const cell of objective.cells) {
        if (!walkable(cell)) report(at, `Ausgangsfeld ${cellText(cell)} nicht begehbar`);
        else if (!reachable(cell)) report(at, `Ausgangsfeld ${cellText(cell)} vom Party-Start aus unerreichbar`);
      }
    }
    if (objective?.kind === 'hack') {
      if (!inBounds(objective.cell)) report(at, `Terminal ${cellText(objective.cell)} außerhalb der Arena`);
      if (!(objective.ap >= 1)) report(at, 'Terminal braucht ap ≥ 1');
      const around = [[0, 0], [0, 1], [1, 0], [0, -1], [-1, 0]].map(([dx, dy]) => [objective.cell[0] + dx, objective.cell[1] + dy] as Cell);
      if (!around.some(cell => walkable(cell) && reachable(cell))) report(at, 'Terminal ist vom Party-Start aus nicht erreichbar');
    }
    if (objective?.kind === 'rescue' && !walkable(objective.cell)) report(at, `Schutzperson auf ${cellText(objective.cell)} nicht begehbar`);
    if (encounter.canFlee === false && objective?.kind === 'reach') report(at, 'Ausgangsziel ohne Flucht ist unnötig streng – canFlee prüfen');
    try {
      createBattle(data, { encounter: encounter.id, seed: 1, party: [PROBE, { ...PROBE, id: 'probe-2' }, { ...PROBE, id: 'probe-3' }] });
    } catch (error) {
      report(at, `Aufbau scheitert: ${(error as Error).message}`);
    }
  }
  return problems;
}
