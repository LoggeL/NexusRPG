// ERZEUGT von scripts/gen_content_parts.mjs – nicht von Hand ändern.
import type { ContentPart } from '../part';
import { part as p0 } from './_test/index';
import { part as p1 } from './combat-arenas/arenas';
import { part as p2 } from './combat/abilities';
import { part as p3 } from './combat/bosses';
import { part as p4 } from './combat/encounters-act1';
import { part as p5 } from './combat/encounters-aria';
import { part as p6 } from './combat/encounters-jobs';
import { part as p7 } from './combat/enemies';
import { part as p8 } from './combat/random';
import { part as p9 } from './maps/bahnhof-mitte';
import { part as p10 } from './maps/cafe-sahnehaube';
import { part as p11 } from './maps/chrome-penthouse';
import { part as p12 } from './maps/crew-quartier';
import { part as p13 } from './maps/dantes-werkstatt';
import { part as p14 } from './maps/das-nest';
import { part as p15 } from './maps/digitech-areal';
import { part as p16 } from './maps/digitech-tresor';
import { part as p17 } from './maps/eisenhof';
import { part as p18 } from './maps/flutmauer';
import { part as p19 } from './maps/fundbuero';
import { part as p20 } from './maps/gerichtssaal';
import { part as p21 } from './maps/glasarkaden';
import { part as p22 } from './maps/hafenkante';
import { part as p23 } from './maps/hausboot-nebelhorn';
import { part as p24 } from './maps/high-voltage';
import { part as p25 } from './maps/hv-hinterzimmer';
import { part as p26 } from './maps/kanal-sammler';
import { part as p27 } from './maps/loetgassen';
import { part as p28 } from './maps/loetzinn-laden';
import { part as p29 } from './maps/neon-gasse';
import { part as p30 } from './maps/netzcafe-datenkruemel';
import { part as p31 } from './maps/nx1-studio';
import { part as p32 } from './maps/quantum-schauraum';
import { part as p33 } from './maps/ripper-praxis';
import { part as p34 } from './maps/rohrsiedlung';
import { part as p35 } from './maps/schrottmarkt';
import { part as p36 } from './maps/stufenplatz';
import { part as p37 } from './maps/suppenkueche';
import { part as p38 } from './maps/ubahn-wagen';
import { part as p39 } from './maps/zellentrakt';
import { part as p40 } from './npc-crew-a/hunter';
import { part as p41 } from './npc-crew-a/raven';
import { part as p42 } from './quest-main-a/main-0-digitech';
import { part as p43 } from './quest-main-a/main-1-ankunft';
import { part as p44 } from './quest-main-a/main-1-dexter';
import { part as p45 } from './quest-main-a/main-1-probezeit';
import { part as p46 } from './quest-main-b/main-1-auf-raven';
import { part as p47 } from './quest-main-b/main-1-dante';
import { part as p48 } from './quest-main-b/main-1-der-plan';
import { part as p49 } from './quest-main-b/main-1-raven';
import { part as p50 } from './quest-main-b/planungstafel';
import { part as p51 } from './quest-main-b/prep-ablenkung';
import { part as p52 } from './quest-main-b/prep-fluchtweg';
import { part as p53 } from './quest-main-b/prep-grundriss';
import { part as p54 } from './quest-main-b/prep-wachplan';
import { part as p55 } from './quest-main-b/prep-zugangskarte';
import { part as p56 } from './system/abilities-items';
import { part as p57 } from './system/checks';
import { part as p58 } from './system/cyberware';
import { part as p59 } from './system/items-andenken';
import { part as p60 } from './system/items-cyberware';
import { part as p61 } from './system/items-geschenke';
import { part as p62 } from './system/items-kleidung';
import { part as p63 } from './system/items-quest';
import { part as p64 } from './system/items-sammeln';
import { part as p65 } from './system/items-verbrauch';
import { part as p66 } from './system/items-waffen';
import { part as p67 } from './system/shops';
import { part as p68 } from './vexaria/_util';
import { part as p69 } from './vexaria/aria-akt1';
import { part as p70 } from './vexaria/bruch';
import { part as p71 } from './vexaria/funken';
import { part as p72 } from './vexaria/rivalinnen';

export const PARTS: readonly (readonly [string, ContentPart])[] = [
  ['_test/index', p0],
  ['combat-arenas/arenas', p1],
  ['combat/abilities', p2],
  ['combat/bosses', p3],
  ['combat/encounters-act1', p4],
  ['combat/encounters-aria', p5],
  ['combat/encounters-jobs', p6],
  ['combat/enemies', p7],
  ['combat/random', p8],
  ['maps/bahnhof-mitte', p9],
  ['maps/cafe-sahnehaube', p10],
  ['maps/chrome-penthouse', p11],
  ['maps/crew-quartier', p12],
  ['maps/dantes-werkstatt', p13],
  ['maps/das-nest', p14],
  ['maps/digitech-areal', p15],
  ['maps/digitech-tresor', p16],
  ['maps/eisenhof', p17],
  ['maps/flutmauer', p18],
  ['maps/fundbuero', p19],
  ['maps/gerichtssaal', p20],
  ['maps/glasarkaden', p21],
  ['maps/hafenkante', p22],
  ['maps/hausboot-nebelhorn', p23],
  ['maps/high-voltage', p24],
  ['maps/hv-hinterzimmer', p25],
  ['maps/kanal-sammler', p26],
  ['maps/loetgassen', p27],
  ['maps/loetzinn-laden', p28],
  ['maps/neon-gasse', p29],
  ['maps/netzcafe-datenkruemel', p30],
  ['maps/nx1-studio', p31],
  ['maps/quantum-schauraum', p32],
  ['maps/ripper-praxis', p33],
  ['maps/rohrsiedlung', p34],
  ['maps/schrottmarkt', p35],
  ['maps/stufenplatz', p36],
  ['maps/suppenkueche', p37],
  ['maps/ubahn-wagen', p38],
  ['maps/zellentrakt', p39],
  ['npc-crew-a/hunter', p40],
  ['npc-crew-a/raven', p41],
  ['quest-main-a/main-0-digitech', p42],
  ['quest-main-a/main-1-ankunft', p43],
  ['quest-main-a/main-1-dexter', p44],
  ['quest-main-a/main-1-probezeit', p45],
  ['quest-main-b/main-1-auf-raven', p46],
  ['quest-main-b/main-1-dante', p47],
  ['quest-main-b/main-1-der-plan', p48],
  ['quest-main-b/main-1-raven', p49],
  ['quest-main-b/planungstafel', p50],
  ['quest-main-b/prep-ablenkung', p51],
  ['quest-main-b/prep-fluchtweg', p52],
  ['quest-main-b/prep-grundriss', p53],
  ['quest-main-b/prep-wachplan', p54],
  ['quest-main-b/prep-zugangskarte', p55],
  ['system/abilities-items', p56],
  ['system/checks', p57],
  ['system/cyberware', p58],
  ['system/items-andenken', p59],
  ['system/items-cyberware', p60],
  ['system/items-geschenke', p61],
  ['system/items-kleidung', p62],
  ['system/items-quest', p63],
  ['system/items-sammeln', p64],
  ['system/items-verbrauch', p65],
  ['system/items-waffen', p66],
  ['system/shops', p67],
  ['vexaria/_util', p68],
  ['vexaria/aria-akt1', p69],
  ['vexaria/bruch', p70],
  ['vexaria/funken', p71],
  ['vexaria/rivalinnen', p72],
];
