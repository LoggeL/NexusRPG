// Querverweis- und Strukturprüfung für Inhalte (für content.test.ts): fehlende IDs, Knoten, Einstiege, Checks …
// Bedingungen und Effekte melden ihre Verweise selbst (`refs` in den Domänen-Handlern).
import type { CheckRef, Condition, Effect, GameContent, MapDef, Point } from '../contracts';
import { resolveCheck } from './checks';
import { CONDITION_SPECS } from './conditions';
import { choiceKeyPart } from './dialogueKeys';
import { EFFECT_SPECS } from './effects';
import { ATTRIBUTE_IDS, CYBER_SLOTS, DEFAULT_MAP_SIZE, has } from './ids';
import { discriminant, type ConditionSpec, type EffectSpec, type Ref } from './registry';
import { DEFAULT_APPEARANCE, parseAppearance } from '../appearance';
import { findCharacterProblems } from '../character';
import { presetProblem } from './domains/character';
import { shopProblems } from '../economy';
import { jobProblems } from '../jobs';
import { questProblems } from '../quests';
import { relationshipProblems } from '../relationships';
import { scheduleProblems, shelterOf } from '../time';

const ARENA_COLS = 12;
const ARENA_ROWS = 8;
const ARENA_CHARS = /^[.#hH~PE]+$/;

/** Liefert lesbare Problembeschreibungen; leere Liste = alles auflösbar. */
export function findContentProblems(content: GameContent): string[] {
  const problems: string[] = [];
  const report = (where: string, what: string) => problems.push(`${where}: ${what}`);

  const resolves = (ref: Ref): boolean => {
    if (ref.kind === 'entry') {
      const [map, entry] = ref.id.split('#');
      return has(content.maps, map) && has(content.maps[map].entries, entry ?? '');
    }
    if (ref.kind === 'questStep') {
      const [quest, step] = ref.id.split('/');
      return has(content.quests, quest) && content.quests[quest].steps.some(s => s.id === step);
    }
    return has(content[ref.kind] as object, ref.id);
  };
  const checkRefs = (where: string, refs: Ref[]) => {
    for (const ref of refs) if (!resolves(ref)) report(where, `unbekannter Verweis ${ref.kind} „${ref.id}“`);
  };

  const condition = (where: string, c?: Condition, depth = 0): void => {
    if (c === undefined || depth > 32) return;
    if (!c || typeof c !== 'object') { report(where, 'ungültige Bedingung'); return; }
    const key = discriminant(c, CONDITION_SPECS);
    if (!key) { report(where, `unbekannte Bedingung ${JSON.stringify(c)}`); return; }
    if ('all' in c) c.all.forEach(x => condition(where, x, depth + 1));
    else if ('any' in c) c.any.forEach(x => condition(where, x, depth + 1));
    else if ('not' in c) condition(where, c.not, depth + 1);
    else if ('atLeast' in c) c.atLeast.forEach(x => condition(where, x, depth + 1));
    const spec = CONDITION_SPECS[key as keyof typeof CONDITION_SPECS] as ConditionSpec<keyof typeof CONDITION_SPECS>;
    checkRefs(where, spec.refs?.(c as never) ?? []);
  };

  const effects = (where: string, list?: readonly Effect[]): void => {
    if (list === undefined) return;
    if (!Array.isArray(list)) { report(where, 'Effekte sind keine Liste'); return; }
    for (const e of list) {
      const key = e && typeof e === 'object' ? discriminant(e, EFFECT_SPECS) : null;
      if (!key) { report(where, `unbekannter Effekt ${JSON.stringify(e)}`); continue; }
      const spec = EFFECT_SPECS[key as keyof typeof EFFECT_SPECS] as EffectSpec<keyof typeof EFFECT_SPECS>;
      checkRefs(where, spec.refs?.(e as never) ?? []);
      // Nachläufe von Kampf und Minispiel
      if (key === 'battle' || key === 'minigame') {
        const nested = e as { win?: Effect[]; lose?: Effect[]; flee?: Effect[] };
        effects(`${where} (Sieg)`, nested.win);
        effects(`${where} (Niederlage)`, nested.lose);
        effects(`${where} (Flucht)`, nested.flee);
      }
    }
  };

  const check = (where: string, ref?: CheckRef) => {
    if (ref === undefined) return;
    const def = resolveCheck(content, ref);
    if (!def) { report(where, `unbekannter Check „${typeof ref === 'string' ? ref : JSON.stringify(ref)}“`); return; }
    if (!ATTRIBUTE_IDS.includes(def.attribute)) report(where, `Check ${def.id}: unbekanntes Attribut „${def.attribute}“`);
    if (!Number.isInteger(def.threshold) || def.threshold < 3 || def.threshold > 10) report(where, `Check ${def.id}: Schwelle ${def.threshold} nicht in 3–10`);
    for (const bonus of def.bonuses ?? []) condition(`${where} Check ${def.id}`, bonus.when);
    if (typeof ref !== 'string' && has(content.checks, def.id) && content.checks[def.id] !== ref) {
      report(where, `eingebetteter Check „${def.id}“ verdeckt einen gleichnamigen Check aus content.checks`);
    }
  };

  const ref = (where: string, kind: Ref['kind'], id: string | undefined) => {
    if (id !== undefined && !resolves({ kind, id })) report(where, `unbekannter Verweis ${kind} „${id}“`);
  };

  const keyed = (label: string, record: Record<string, { id: string }>) => {
    for (const [key, value] of Object.entries(record)) if (value.id !== key) report(`${label} ${key}`, `id „${value.id}“ passt nicht zum Schlüssel`);
  };
  keyed('Karte', content.maps); keyed('Dialog', content.dialogues); keyed('Cutscene', content.cutscenes);
  keyed('Gegenstand', content.items); keyed('Figur', content.npcs); keyed('Check', content.checks); keyed('Perk', content.perks);
  keyed('Cyberware', content.cyberware); keyed('Herkunft', content.origins); keyed('Aussehen', content.looks);
  keyed('Fraktion', content.factions); keyed('Quest', content.quests); keyed('Auftrag', content.jobs); keyed('Händler', content.shops);
  keyed('Begegnung', content.encounters); keyed('Arena', content.arenas); keyed('Gegner', content.enemies);
  keyed('Fähigkeit', content.abilities); keyed('Sendung', content.news); keyed('Nachricht', content.phone);
  keyed('Station', content.stations); keyed('Bezirk', content.districts);

  // ------------------------------------------------------------- Karten
  const inside = (map: MapDef, p: Point) => {
    const [w, h] = map.size ?? DEFAULT_MAP_SIZE;
    return p[0] >= 0 && p[1] >= 0 && p[0] <= w && p[1] <= h;
  };
  for (const [key, map] of Object.entries(content.maps)) {
    const at = `Karte ${key}`;
    const [w, h] = map.size ?? DEFAULT_MAP_SIZE;
    if (!(w > 0 && h > 0)) report(at, 'ungültige Größe');
    if (!map.walk?.length) report(at, 'keine begehbare Fläche');
    if (!Object.keys(map.entries).length) report(at, 'keine Einstiege');
    if (!has(content.districts, map.district)) report(at, `unbekannter Bezirk „${map.district}“`);
    for (const [name, entry] of Object.entries(map.entries)) if (!inside(map, entry.at)) report(at, `Einstieg ${name} liegt außerhalb der Karte`);
    for (const polygon of [...map.walk, ...(map.block ?? [])]) for (const p of polygon) if (!inside(map, p)) { report(at, 'Polygonpunkt außerhalb der Karte'); break; }
    if (map.station) ref(at, 'stations', map.station);
    for (const exit of map.exits) {
      const where = `${at} Ausgang ${exit.id}`;
      ref(where, 'entry', `${exit.to}#${exit.entry}`);
      condition(where, exit.when);
      check(where, exit.check);
      effects(where, exit.effects);
    }
    if (map.fastTravel) ref(`${at} Schnellreise`, map.fastTravel.entry ? 'entry' : 'maps', map.fastTravel.entry ? `${map.fastTravel.to}#${map.fastTravel.entry}` : map.fastTravel.to);
    for (const variant of map.bgVariants ?? []) condition(`${at} Hintergrundvariante`, variant.when);
    for (const variant of map.musicWhen ?? []) condition(`${at} Musikvariante`, variant.when);
    for (const variant of map.blockVariants ?? []) {
      condition(`${at} Begehbarkeit`, variant.when);
      for (const polygon of [...(variant.walk ?? []), ...(variant.block ?? [])]) for (const p of polygon) if (!inside(map, p)) { report(at, 'Polygonpunkt außerhalb der Karte'); break; }
    }
    for (const light of map.lights ?? []) condition(`${at} Licht`, light.when);
    condition(`${at} Passanten`, map.ambient?.when);
    for (const spot of map.hotspots) {
      const where = `${at} Hotspot ${spot.id}`;
      if (!inside(map, spot.at)) report(where, 'liegt außerhalb der Karte');
      ref(where, 'dialogues', spot.dialogue);
      ref(where, 'shops', spot.shop);
      if (spot.kind === 'shop' && !spot.shop) report(where, 'Händler-Hotspot ohne shop');
      if (spot.kind === 'board' && !spot.board) report(where, 'Auftragstafel ohne board');
      check(where, spot.check);
      effects(where, spot.effects);
      condition(where, spot.when);
      condition(where, spot.hideWhen);
      for (const line of spot.lines ?? []) if (line.speaker !== 'player' && line.speaker !== 'narrator') ref(where, 'npcs', line.speaker);
    }
    for (const npc of map.npcs ?? []) {
      const where = `${at} Figur ${npc.id}`;
      ref(where, 'npcs', npc.npc);
      ref(where, 'dialogues', npc.dialogue);
      condition(where, npc.when);
      condition(where, npc.hideWhen);
      if (!inside(map, npc.at)) report(where, 'liegt außerhalb der Karte');
    }
    for (const enc of map.encounters ?? []) {
      const where = `${at} Gegnergruppe ${enc.id}`;
      ref(where, 'encounters', enc.encounter);
      condition(where, enc.when);
      check(where, enc.avoid);
    }
    for (const enter of map.onEnter ?? []) {
      const where = `${at} onEnter ${enter.id}`;
      ref(where, 'cutscenes', enter.cutscene);
      ref(where, 'dialogues', enter.dialogue);
      effects(where, enter.effects);
      condition(where, enter.when);
    }
    for (const bark of map.ambient?.barks ?? []) condition(`${at} Passanten`, bark.when);
  }
  for (const [key, district] of Object.entries(content.districts)) if (district.id !== key) report(`Bezirk ${key}`, 'id passt nicht');
  for (const station of Object.values(content.stations)) {
    ref(`Station ${station.id}`, 'entry', `${station.map}#${station.entry}`);
    condition(`Station ${station.id}`, station.when);
  }

  // ------------------------------------------------------------- Dialoge und Cutscenes
  const speaker = (where: string, id: string) => { if (id !== 'player' && id !== 'narrator') ref(where, 'npcs', id); };
  for (const [key, dialogue] of Object.entries(content.dialogues)) {
    const at = `Dialog ${key}`;
    const nodes = new Set(dialogue.nodes.map(node => node.id));
    if (nodes.size !== dialogue.nodes.length) report(at, 'doppelte Knoten-IDs');
    const node = (where: string, id?: string) => { if (id !== undefined && !nodes.has(id)) report(where, `unbekannter Knoten „${id}“`); };
    node(at, dialogue.start);
    const onceKeys = new Map<string, string>();
    for (const n of dialogue.nodes) {
      const where = `${at}/${n.id}`;
      node(where, n.next);
      effects(where, n.effects);
      for (const line of n.lines) speaker(where, line.speaker);
      n.choices?.forEach((choice, index) => {
        const w = `${where} Wahl ${index}`;
        node(w, choice.next);
        condition(w, choice.when);
        condition(w, choice.requires);
        check(w, choice.check);
        effects(w, choice.effects);
        if (choice.once) {
          const k = choiceKeyPart(choice);
          const first = onceKeys.get(k);
          if (first !== undefined && first !== choice.text) report(w, `once-Wahl teilt den Schlüssel „${k}“ – eigene id setzen`);
          else onceKeys.set(k, choice.text);
        }
      });
    }
  }
  for (const [key, cut] of Object.entries(content.cutscenes)) {
    effects(`Cutscene ${key}`, cut.effects);
    if (!cut.beats.length) report(`Cutscene ${key}`, 'keine Beats');
    for (const beat of cut.beats) {
      for (const line of beat.lines ?? []) speaker(`Cutscene ${key}`, line.speaker);
      condition(`Cutscene ${key}`, beat.when);
    }
  }
  for (const [key, def] of Object.entries(content.checks)) check(`Check ${key}`, def);

  // ------------------------------------------------------------- Figur, Gegenstände, Wirtschaft
  for (const item of Object.values(content.items)) {
    const at = `Gegenstand ${item.id}`;
    if (!(item.price >= 0)) report(at, 'ungültiger Preis');
    effects(at, item.use?.effects);
    condition(at, item.use?.when);
    ref(at, 'cyberware', item.cyberware);
    if (item.category === 'cyberware' && !item.cyberware) report(at, 'Cyberware-Gegenstand ohne cyberware');
    if (item.use?.battle && !has(content.abilities, item.use.battle)) report(at, `unbekannte Fähigkeit „${item.use.battle}“`);
  }
  for (const perk of Object.values(content.perks)) {
    if (!ATTRIBUTE_IDS.includes(perk.attribute)) report(`Perk ${perk.id}`, 'unbekanntes Attribut');
    if (perk.ability && !has(content.abilities, perk.ability)) report(`Perk ${perk.id}`, `unbekannte Fähigkeit „${perk.ability}“`);
  }
  for (const part of Object.values(content.cyberware)) {
    const at = `Cyberware ${part.id}`;
    if (!CYBER_SLOTS.includes(part.slot)) report(at, `unbekannter Platz „${part.slot}“`);
    ref(at, 'items', part.item);
    if (part.ability && !has(content.abilities, part.ability)) report(at, `unbekannte Fähigkeit „${part.ability}“`);
  }
  for (const origin of Object.values(content.origins)) {
    const at = `Herkunft ${origin.id}`;
    if (!ATTRIBUTE_IDS.includes(origin.bonus)) report(at, 'unbekanntes Bonusattribut');
    for (const item of Object.keys(origin.items ?? {})) ref(at, 'items', item);
    for (const npc of Object.keys(origin.relations ?? {})) ref(at, 'npcs', npc);
    for (const faction of Object.keys(origin.rep ?? {})) ref(at, 'factions', faction);
  }
  if (!Object.keys(content.looks).length) report('Aussehen', 'kein Aussehen definiert');
  for (const look of Object.values(content.looks)) {
    if (look.appearance && 'error' in parseAppearance(look.appearance, DEFAULT_APPEARANCE)) report(`Vorlage ${look.id}`, 'ungültiges Aussehen');
    else if (look.appearance) {
      const parsed = parseAppearance(look.appearance, DEFAULT_APPEARANCE);
      if ('replaced' in parsed && parsed.replaced.length) report(`Vorlage ${look.id}`, `unbekannte Teile: ${parsed.replaced.join(', ')}`);
    }
  }
  for (const id of Object.keys(content.presets ?? {})) {
    const problem = presetProblem(content, id);
    if (problem) report(`Fertige Spielfigur ${id}`, problem);
  }
  if (!Object.keys(content.origins).length) report('Herkunft', 'keine Herkunft definiert');
  // Bereich character: Erweiterungsfelder (Mindeststufe, Kontextregeln, Ersatz, Gebühren …), Bedingungen hier geprüft.
  const characterLint = findCharacterProblems(content);
  problems.push(...characterLint.problems);
  for (const entry of characterLint.conditions) condition(entry.where, entry.condition);
  for (const shop of Object.values(content.shops)) {
    const at = `Händler ${shop.id}`;
    ref(at, 'npcs', shop.owner);
    ref(at, 'factions', shop.faction);
    condition(at, shop.open);
    condition(at, shop.ripperdoc?.freeWhen);
    for (const rule of shop.priceRules ?? []) condition(`${at} Preisregel`, rule.when);
    for (const entry of shop.stock) { ref(at, 'items', entry.item); condition(at, entry.when); }
  }
  for (const job of Object.values(content.jobs)) {
    const at = `Auftrag ${job.id}`;
    if (!job.boards.length) report(at, 'keine Auftragstafel');
    if (!job.targets.length) report(at, 'keine Ziele');
    for (const target of job.targets) ref(at, 'maps', target.map);
    ref(at, 'encounters', job.encounter);
    ref(at, 'items', job.item);
    condition(at, job.when);
    for (const faction of Object.keys(job.reward.rep ?? {})) ref(at, 'factions', faction);
  }

  // ------------------------------------------------------------- Figuren
  const giftRef = (where: string, entry: string) => { if (!entry.startsWith('#')) ref(where, 'items', entry); };
  for (const npc of Object.values(content.npcs)) {
    const at = `Figur ${npc.id}`;
    ref(at, 'factions', npc.faction);
    for (const list of [npc.gifts, ...(npc.giftVariants ?? []).map(v => v.gifts)]) {
      for (const entry of [...(list?.loves ?? []), ...(list?.likes ?? []), ...(list?.dislikes ?? []), ...(list?.hates ?? [])]) giftRef(`${at} Geschenke`, entry);
    }
    for (const variant of npc.giftVariants ?? []) condition(`${at} Geschenkvariante`, variant.when);
    for (const entry of npc.schedule ?? []) {
      const where = `${at} Tagesablauf`;
      condition(where, entry.when);
      ref(where, 'dialogues', entry.dialogue);
      if (entry.place === 'away') continue;
      ref(where, 'maps', entry.place.map);
      const map = content.maps[entry.place.map];
      if (map && typeof entry.place.at === 'string' && !(map.spots && has(map.spots, entry.place.at))) report(where, `unbekannter Punkt „${entry.place.at}“ auf ${entry.place.map}`);
      if (map && typeof entry.place.at !== 'string' && !inside(map, entry.place.at)) report(where, `Punkt außerhalb von ${entry.place.map}`);
    }
    for (const event of npc.heartEvents ?? []) {
      const where = `${at} Herz-Ereignis ${event.id}`;
      ref(where, 'maps', event.map);
      ref(where, 'cutscenes', event.cutscene);
      ref(where, 'dialogues', event.dialogue);
      effects(where, event.effects);
      condition(where, event.when);
      if (!event.cutscene && !event.dialogue && !event.effects?.length) report(where, 'ohne Inhalt');
    }
    for (const talk of npc.talk ?? []) { ref(`${at} Gespräch`, 'dialogues', talk.dialogue); condition(`${at} Gespräch`, talk.when); }
    condition(`${at} Herzen eingefroren`, npc.heartsFrozen);
    if (npc.companion) {
      condition(`${at} Begleiter`, npc.companion.recruit);
      for (const rule of npc.companion.abilityRules ?? []) condition(`${at} Begleiter`, rule.when);
      for (const duo of npc.companion.duo ?? []) condition(`${at} Duo`, duo.when);
      for (const entry of npc.companion.callMinutesWhen ?? []) condition(`${at} Begleiter`, entry.when);
      condition(`${at} Begleiter nicht verfügbar`, npc.companion.unavailableWhen);
      for (const ability of [
        ...npc.companion.stats.abilities, ...(npc.companion.heartAbilities ?? []).map(a => a.ability),
        ...(npc.companion.abilityRules ?? []).flatMap(rule => [rule.add, rule.remove, ...(rule.replace ?? [])]).filter((a): a is string => !!a),
        ...(npc.companion.duo ?? []).map(duo => duo.ability),
      ]) {
        if (!has(content.abilities, ability)) report(`${at} Begleiter`, `unbekannte Fähigkeit „${ability}“`);
      }
    }
    if (npc.child && npc.romanceable) report(at, 'Kinderfiguren dürfen nicht romanzierbar sein');
  }
  for (const npc of content.romance) {
    if (!has(content.npcs, npc)) report('Romanze', `unbekannte Figur „${npc}“`);
    else if (content.npcs[npc].child) report('Romanze', `Kinderfigur „${npc}“ darf nie freigeschaltet sein`);
    else if (!content.npcs[npc].romanceable) report('Romanze', `„${npc}“ ist nicht als romanceable gekennzeichnet`);
  }

  // ------------------------------------------------------------- Quests
  for (const quest of Object.values(content.quests)) {
    const at = `Quest ${quest.id}`;
    ref(at, 'npcs', quest.giver);
    condition(at, quest.autoStart);
    condition(at, quest.fail);
    const steps = new Set<string>();
    for (const step of quest.steps) {
      const where = `${at}/${step.id}`;
      if (steps.has(step.id)) report(where, 'doppelte Schritt-ID');
      steps.add(step.id);
      condition(where, step.done);
      condition(where, step.when);
      effects(where, step.effects);
      if (step.marker) ref(where, 'maps', step.marker.map);
      if (step.marker && typeof step.marker.at === 'string' && has(content.maps, step.marker.map)) {
        const target = content.maps[step.marker.map];
        if (!target.spots?.[step.marker.at] && !target.entries[step.marker.at]) report(where, `Marker-Spot „${step.marker.at}“ fehlt auf ${step.marker.map}`);
      }
    }
    const reward = quest.reward;
    for (const item of Object.keys(reward?.items ?? {})) ref(`${at} Belohnung`, 'items', item);
    for (const npc of Object.keys(reward?.relations ?? {})) ref(`${at} Belohnung`, 'npcs', npc);
    for (const faction of Object.keys(reward?.rep ?? {})) ref(`${at} Belohnung`, 'factions', faction);
    effects(`${at} Belohnung`, reward?.effects);
  }

  // ------------------------------------------------------------- Kampf
  for (const arena of Object.values(content.arenas)) {
    const at = `Arena ${arena.id}`;
    if (arena.layout.length !== ARENA_ROWS || arena.layout.some(row => row.length !== ARENA_COLS || !ARENA_CHARS.test(row))) {
      report(at, `layout braucht ${ARENA_ROWS} Zeilen à ${ARENA_COLS} Zeichen aus „.#hH~PE“`);
    }
    const all = arena.layout.join('');
    if (!all.includes('P') || !all.includes('E')) report(at, 'Startfelder für Party (P) und Gegner (E) fehlen');
  }
  for (const enemy of Object.values(content.enemies)) {
    for (const ability of [...enemy.stats.abilities, ...(enemy.phases ?? []).flatMap(p => p.abilities ?? [])]) {
      if (!has(content.abilities, ability)) report(`Gegner ${enemy.id}`, `unbekannte Fähigkeit „${ability}“`);
    }
    for (const loot of enemy.loot ?? []) ref(`Gegner ${enemy.id}`, 'items', loot.item);
  }
  for (const encounter of Object.values(content.encounters)) {
    const at = `Begegnung ${encounter.id}`;
    if (!has(content.arenas, encounter.arena)) report(at, `unbekannte Arena „${encounter.arena}“`);
    if (!encounter.enemies.length) report(at, 'keine Gegner');
    for (const entry of encounter.enemies) if (!has(content.enemies, entry.enemy)) report(at, `unbekannter Gegner „${entry.enemy}“`);
    for (const map of encounter.random?.maps ?? []) ref(at, 'maps', map);
    condition(at, encounter.when);
    for (const entry of encounter.startStatus ?? []) {
      condition(`${at} Startzustand`, entry.when);
      if (!['party', 'enemies', 'player'].includes(entry.target) && !has(content.enemies, entry.target)) report(at, `Startzustand: unbekanntes Ziel „${entry.target}“`);
    }
    effects(`${at} Sieg`, encounter.onWin);
    effects(`${at} Niederlage`, encounter.onLose);
    for (const item of Object.keys(encounter.reward?.items ?? {})) ref(at, 'items', item);
    for (const line of encounter.intro ?? []) speaker(at, line.speaker);
  }

  // ------------------------------------------------------------- Nachrichten, Telefon, Start
  for (const news of Object.values(content.news)) {
    ref(`Sendung ${news.id}`, 'npcs', news.anchor);
    condition(`Sendung ${news.id}`, news.when);
    for (const line of news.lines) speaker(`Sendung ${news.id}`, line.speaker);
  }
  for (const message of Object.values(content.phone)) {
    ref(`Nachricht ${message.id}`, 'npcs', message.from);
    condition(`Nachricht ${message.id}`, message.auto);
    effects(`Nachricht ${message.id}`, message.effects);
    for (const reply of message.replies ?? []) effects(`Nachricht ${message.id} Antwort`, reply.effects);
  }
  for (const [id, rule] of Object.entries(content.daily ?? {})) {
    condition(`Tageswechsel ${id}`, rule.when);
    effects(`Tageswechsel ${id}`, rule.effects);
  }
  ref('Start', 'entry', `${content.start.map}#${content.start.entry}`);
  ref('Start', 'cutscenes', content.start.cutscene);
  for (const item of Object.keys(content.start.items ?? {})) ref('Start', 'items', item);
  ref('Unterschlupf', 'entry', `${content.home.map}#${content.home.entry}`);
  for (const [act, start] of Object.entries(content.actStarts)) {
    if (!start) continue;
    const at = `Aktstart ${act}`;
    ref(at, 'entry', `${start.map}#${start.entry}`);
    for (const item of Object.keys(start.items ?? {})) ref(at, 'items', item);
    for (const npc of [...(start.recruited ?? []), ...(start.party ?? []), ...Object.keys(start.relations ?? {})]) ref(at, 'npcs', npc);
    for (const quest of Object.keys(start.quests ?? {})) ref(at, 'quests', quest);
    for (const station of start.stations ?? []) ref(at, 'stations', station);
    for (const map of start.visited ?? []) ref(at, 'maps', map);
  }
  for (const cut of content.ending.cutscenes) ref('Ende', 'cutscenes', cut);
  content.ending.epilogue.forEach((line, index) => condition(`Epilog ${index}`, line.when));

  // ------------------------------------------------------------- Strukturregeln quests+economy (Module)
  problems.push(...questProblems(content), ...jobProblems(content), ...shopProblems(content));

  // ------------------------------------------------------------- Strukturregeln relationships+time (Module)
  problems.push(...relationshipProblems(content), ...scheduleProblems(content));
  for (const map of Object.values(content.maps)) {
    const shelter = shelterOf(map);
    if (!shelter) continue;
    condition(`Karte ${map.id} Notschlafplatz`, shelter.when);
    if (shelter.entry) ref(`Karte ${map.id} Notschlafplatz`, 'entry', `${map.id}#${shelter.entry}`);
  }
  for (const note of content.home.collapseNotes ?? []) {
    if (typeof note !== 'string') condition('Unterschlupf Notiz', (note as { when?: Condition }).when);
  }
  return problems;
}

/** Ziel einer Schnellreise: der Zugang draußen bei `fastTravel`, sonst die Karte selbst. */
export function fastTravelDestination(content: GameContent, map: string): { map: string; entry?: string } {
  const def = has(content.maps, map) ? content.maps[map] : undefined;
  const redirect = def?.fastTravel;
  if (!redirect || !has(content.maps, redirect.to)) return { map };
  return redirect.entry !== undefined ? { map: redirect.to, entry: redirect.entry } : { map: redirect.to };
}
