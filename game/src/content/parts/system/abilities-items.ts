// Kampffähigkeiten, die an Gegenständen hängen: Waffen-Sonderangriffe (`ItemDef.weapon.ability`) und Wurf-/
// Einsatzgegenstände (`ItemDef.use.battle`). Statuswirkungen nur aus StatusId; Verlangsamt/Ermutigt usw. fehlen der
// Engine noch (design/plan/gaps/system.md) und stehen deshalb nur im Text.
import type { AbilityDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const abilities: Record<string, AbilityDef> = {
  // --- Waffen ----------------------------------------------------------------------------------------------
  'waffe-homerun': {
    id: 'waffe-homerun', name: 'Homerun', kind: 'nahkampf', ap: 2, target: 'enemy', range: 1, damage: 2, hit: -5, cooldown: 2,
    description: 'Voll durchgezogen: +2 Schaden, der Treffer schickt das Ziel zurück (Rückstoß 1).',
  },
  'waffe-schockstoss': {
    id: 'waffe-schockstoss', name: 'Schockstoß', kind: 'nahkampf', ap: 1, target: 'enemy', range: 1, damage: 0, cooldown: 2,
    status: { id: 'betaeubt', turns: 1, chance: 0.4 },
    description: 'Akku auf Anschlag. Mit etwas Glück zuckt das Ziel eine Runde lang nur noch („Betäubt“).',
  },
  'waffe-federschnitt': {
    id: 'waffe-federschnitt', name: 'Federschnitt', kind: 'nahkampf', ap: 1, target: 'enemy', range: 2, damage: 1, cooldown: 2,
    status: { id: 'blutet', turns: 2, chance: 0.6 },
    description: 'Ein flacher Schnitt mit der Krähenfeder. Funken sprühen, das Ziel ist „Angeschlagen“.',
  },
  'waffe-goldknauf-hieb': {
    id: 'waffe-goldknauf-hieb', name: 'Goldknauf-Hieb', kind: 'nahkampf', ap: 2, target: 'enemy', range: 1, damage: 3, cooldown: 3,
    status: { id: 'betaeubt', turns: 1, chance: 0.5 },
    description: 'Der Knauf trifft genau da, wo Arroganz am meisten wehtut. +3 Schaden, Chance auf „Betäubt“.',
  },
  'waffe-netzwurf': {
    id: 'waffe-netzwurf', name: 'Netzwurf', kind: 'fernkampf', ap: 1, target: 'enemy', range: 4, damage: 0, hit: 10, cooldown: 2,
    status: { id: 'betaeubt', turns: 1, chance: 0.5 },
    description: 'Das Netz klebt. Wer sich darin verheddert, verliert mit etwas Glück den nächsten Zug.',
  },
  'waffe-funkenkegel': {
    id: 'waffe-funkenkegel', name: 'Funkenkegel', kind: 'fernkampf', ap: 2, target: 'area', range: 3, radius: 1, damage: 0, cooldown: 2,
    status: { id: 'brennt', turns: 2, chance: 0.7 },
    description: 'Ein Fächer aus Funken über drei mal drei Felder. Alles darin fängt mit etwas Pech Feuer („Brennt“).',
  },
  'waffe-keksschuss': {
    id: 'waffe-keksschuss', name: 'Keksschuss', kind: 'support', ap: 1, target: 'ally', range: 5, heal: 8,
    description: 'Ein Keks im hohen Bogen auf einen Verbündeten: +8 LP. Jakko wäre stolz.',
  },
  'waffe-drohnenstoerung': {
    id: 'waffe-drohnenstoerung', name: 'Rauschteppich', kind: 'hack', ap: 1, target: 'area', range: 4, radius: 1, damage: 1, attribute: 'technik', cooldown: 2,
    status: { id: 'gehackt', turns: 1, chance: 0.6 },
    description: 'Der Störsender legt Rauschen über drei mal drei Felder. Drohnen darin verlieren den Faden.',
  },
  'waffe-datenstich': {
    id: 'waffe-datenstich', name: 'Datenstich', kind: 'hack', ap: 1, target: 'enemy', range: 6, damage: 3, attribute: 'technik', hit: 10,
    description: 'Die Datenlanze bohrt sich durch zwei Lagen Firewall. +3 Hack-Schaden.',
  },

  // --- Wurf- und Einsatzgegenstände -----------------------------------------------------------------------
  'gegenstand-stoergranate': {
    id: 'gegenstand-stoergranate', name: 'Störgranate werfen', kind: 'gegenstand', ap: 1, target: 'area', range: 4, radius: 1, damage: 0,
    status: { id: 'gehackt', turns: 1 },
    description: 'Elektromagnetischer Plopp über drei mal drei Felder: Drohnen und Gechippte sind „Gehackt“.',
  },
  'gegenstand-rauchtopf': {
    id: 'gegenstand-rauchtopf', name: 'Rauchtopf zünden', kind: 'gegenstand', ap: 1, target: 'area', range: 3, radius: 1,
    status: { id: 'geschuetzt', turns: 2 },
    description: 'Dicker grauer Qualm. Verbündete im Umkreis sind zwei Runden „Geschützt“.',
  },
  'gegenstand-klebegranate': {
    id: 'gegenstand-klebegranate', name: 'Klebegranate werfen', kind: 'gegenstand', ap: 1, target: 'enemy', range: 4, damage: 0,
    status: { id: 'betaeubt', turns: 1 },
    description: 'Ein Klumpen Gustav-Spezialkleber. Das Ziel klebt eine Runde fest („Betäubt“).',
  },
};

export const part: ContentPart = { abilities };
