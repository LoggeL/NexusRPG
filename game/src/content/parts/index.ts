// ERZEUGT von scripts/gen_content_parts.mjs – nicht von Hand ändern.
import type { ContentPart } from '../part';
import { part as p0 } from './combat-23/encounters-akt2-main';
import { part as p1 } from './combat-23/encounters-akt2-side';
import { part as p2 } from './combat-23/encounters-akt3';
import { part as p3 } from './combat-23/encounters-nachspiel';
import { part as p4 } from './combat-23/enemies';
import { part as p5 } from './combat-23/random';
import { part as p6 } from './combat-arenas-23/arenas';
import { part as p7 } from './combat-arenas/arenas';
import { part as p8 } from './combat/abilities';
import { part as p9 } from './combat/bosses';
import { part as p10 } from './combat/encounters-act1';
import { part as p11 } from './combat/encounters-aria';
import { part as p12 } from './combat/encounters-jobs';
import { part as p13 } from './combat/enemies';
import { part as p14 } from './combat/random';
import { part as p15 } from './integration/ende';
import { part as p16 } from './integration/luecken';
import { part as p17 } from './maps/bahnhof-mitte';
import { part as p18 } from './maps/cafe-sahnehaube';
import { part as p19 } from './maps/chrome-penthouse';
import { part as p20 } from './maps/crew-quartier';
import { part as p21 } from './maps/dantes-werkstatt';
import { part as p22 } from './maps/das-nest';
import { part as p23 } from './maps/digitech-areal';
import { part as p24 } from './maps/digitech-tresor';
import { part as p25 } from './maps/eisenhof';
import { part as p26 } from './maps/flutmauer';
import { part as p27 } from './maps/fundbuero';
import { part as p28 } from './maps/gerichtssaal';
import { part as p29 } from './maps/glasarkaden';
import { part as p30 } from './maps/hafenkante';
import { part as p31 } from './maps/hausboot-nebelhorn';
import { part as p32 } from './maps/high-voltage';
import { part as p33 } from './maps/hv-hinterzimmer';
import { part as p34 } from './maps/kanal-sammler';
import { part as p35 } from './maps/loetgassen';
import { part as p36 } from './maps/loetzinn-laden';
import { part as p37 } from './maps/neon-gasse';
import { part as p38 } from './maps/netzcafe-datenkruemel';
import { part as p39 } from './maps/nx1-studio';
import { part as p40 } from './maps/quantum-schauraum';
import { part as p41 } from './maps/ripper-praxis';
import { part as p42 } from './maps/rohrsiedlung';
import { part as p43 } from './maps/schrottmarkt';
import { part as p44 } from './maps/stufenplatz';
import { part as p45 } from './maps/suppenkueche';
import { part as p46 } from './maps/ubahn-wagen';
import { part as p47 } from './maps/zellentrakt';
import { part as p48 } from './npc-crew-a/dante';
import { part as p49 } from './npc-crew-a/hunter';
import { part as p50 } from './npc-crew-a/raven';
import { part as p51 } from './npc-crew-b/captain-kuschel';
import { part as p52 } from './npc-crew-b/jimmy';
import { part as p53 } from './npc-crew-b/nyra';
import { part as p54 } from './npc-crew-b/vega';
import { part as p55 } from './npc-kinder-alte/daria';
import { part as p56 } from './npc-kinder-alte/freya';
import { part as p57 } from './npc-kinder-alte/jakko';
import { part as p58 } from './npc-kinder-alte/oma-volt';
import { part as p59 } from './npc-kinder-alte/opa-gustav';
import { part as p60 } from './npc-medien-club/barkeeper';
import { part as p61 } from './npc-medien-club/collin-charleston';
import { part as p62 } from './npc-medien-club/delya-delloraine';
import { part as p63 } from './npc-medien-club/kameramann';
import { part as p64 } from './npc-medien-club/ripper';
import { part as p65 } from './npc-ordnung-markt/babette-bao';
import { part as p66 } from './npc-ordnung-markt/dexter';
import { part as p67 } from './npc-ordnung-markt/kiki-karbon';
import { part as p68 } from './npc-ordnung-markt/richter';
import { part as p69 } from './npc-ordnung-markt/wache';
import { part as p70 } from './npc-unterstadt/bolzen';
import { part as p71 } from './npc-unterstadt/buergermeister-gully';
import { part as p72 } from './npc-unterstadt/kaeptn-nebelhorn';
import { part as p73 } from './npc-unterstadt/lio-funkel';
import { part as p74 } from './npc-unterstadt/marla-sand';
import { part as p75 } from './npc-unterstadt/pim-pinzette';
import { part as p76 } from './npc-welt/alesa-zero';
import { part as p77 } from './npc-welt/barista-perle';
import { part as p78 } from './npc-welt/bijou';
import { part as p79 } from './npc-welt/blade';
import { part as p80 } from './npc-welt/bruder-kabellos';
import { part as p81 } from './npc-welt/bruno-brecher';
import { part as p82 } from './npc-welt/direktorin-hartlauf';
import { part as p83 } from './npc-welt/dj-lumo';
import { part as p84 } from './npc-welt/dr-winkel';
import { part as p85 } from './npc-welt/falke';
import { part as p86 } from './npc-welt/fluss-frieda';
import { part as p87 } from './npc-welt/fraeulein-pixel';
import { part as p88 } from './npc-welt/frau-klingel';
import { part as p89 } from './npc-welt/frau-takt';
import { part as p90 } from './npc-welt/fx-60';
import { part as p91 } from './npc-welt/gerda-gleis';
import { part as p92 } from './npc-welt/gutschein-gerd';
import { part as p93 } from './npc-welt/hafen-hannes';
import { part as p94 } from './npc-welt/henk-angler';
import { part as p95 } from './npc-welt/herr-blitz';
import { part as p96 } from './npc-welt/herr-glanz';
import { part as p97 } from './npc-welt/ki-nexus';
import { part as p98 } from './npc-welt/knuspi';
import { part as p99 } from './npc-welt/knut';
import { part as p100 } from './npc-welt/kurt';
import { part as p101 } from './npc-welt/madame-satin';
import { part as p102 } from './npc-welt/meister-watt';
import { part as p103 } from './npc-welt/mila';
import { part as p104 } from './npc-welt/mira-loetzinn';
import { part as p105 } from './npc-welt/mixi';
import { part as p106 } from './npc-welt/mutter-bruehe';
import { part as p107 } from './npc-welt/ole-gaehn';
import { part as p108 } from './npc-welt/opa-blech';
import { part as p109 } from './npc-welt/opa-gurrmann';
import { part as p110 } from './npc-welt/paul';
import { part as p111 } from './npc-welt/pfeffer';
import { part as p112 } from './npc-welt/portier-albert';
import { part as p113 } from './npc-welt/salzige-grete';
import { part as p114 } from './npc-welt/seraphina-chrome';
import { part as p115 } from './npc-welt/serenity-chrome';
import { part as p116 } from './npc-welt/sina-spray';
import { part as p117 } from './npc-welt/stylistin-gina';
import { part as p118 } from './npc-welt/sybella-chrome';
import { part as p119 } from './npc-welt/turbo-tilda';
import { part as p120 } from './npc-welt/vex-schrapnell';
import { part as p121 } from './npc-welt/vinyl-vincent';
import { part as p122 } from './npc-welt/wett-willi';
import { part as p123 } from './npc-welt/xion-venom';
import { part as p124 } from './quest-main-a/main-0-digitech';
import { part as p125 } from './quest-main-a/main-1-ankunft';
import { part as p126 } from './quest-main-a/main-1-dexter';
import { part as p127 } from './quest-main-a/main-1-probezeit';
import { part as p128 } from './quest-main-b/main-1-auf-raven';
import { part as p129 } from './quest-main-b/main-1-dante';
import { part as p130 } from './quest-main-b/main-1-der-plan';
import { part as p131 } from './quest-main-b/main-1-raven';
import { part as p132 } from './quest-main-b/planungstafel';
import { part as p133 } from './quest-main-b/prep-ablenkung';
import { part as p134 } from './quest-main-b/prep-fluchtweg';
import { part as p135 } from './quest-main-b/prep-grundriss';
import { part as p136 } from './quest-main-b/prep-wachplan';
import { part as p137 } from './quest-main-b/prep-zugangskarte';
import { part as p138 } from './quest-pers-jobs/dinge';
import { part as p139 } from './quest-pers-jobs/figuren';
import { part as p140 } from './quest-pers-jobs/job-bergung';
import { part as p141 } from './quest-pers-jobs/job-datenraub';
import { part as p142 } from './quest-pers-jobs/job-eskorte';
import { part as p143 } from './quest-pers-jobs/job-kanal';
import { part as p144 } from './quest-pers-jobs/job-kopfgeld';
import { part as p145 } from './quest-pers-jobs/job-kurier';
import { part as p146 } from './quest-pers-jobs/job-schulden';
import { part as p147 } from './quest-pers-jobs/job-tuersteher';
import { part as p148 } from './quest-pers-jobs/kopfgeld-der-kassierer';
import { part as p149 } from './quest-pers-jobs/kopfgeld-graf-gully-zwei';
import { part as p150 } from './quest-pers-jobs/kopfgeld-krawall-kalle';
import { part as p151 } from './quest-pers-jobs/kopfgeld-loetkolben-lola';
import { part as p152 } from './quest-pers-jobs/kopfgeld-neon-nils';
import { part as p153 } from './quest-pers-jobs/kopfgeld-oma-turbo';
import { part as p154 } from './quest-pers-jobs/kopfgeld-toaster';
import { part as p155 } from './quest-pers-jobs/kopfgeld-zwei-finger-zoltan';
import { part as p156 } from './quest-pers-jobs/pers-babette-markttag';
import { part as p157 } from './quest-pers-jobs/pers-barkeeper-letzter-vers';
import { part as p158 } from './quest-pers-jobs/pers-bolzen-bein';
import { part as p159 } from './quest-pers-jobs/pers-dante-erstpressung';
import { part as p160 } from './quest-pers-jobs/pers-daria-botendienst';
import { part as p161 } from './quest-pers-jobs/pers-dexter-schuldenfrei';
import { part as p162 } from './quest-pers-jobs/pers-freya-fairer-lohn';
import { part as p163 } from './quest-pers-jobs/pers-hunter-reiner-tisch';
import { part as p164 } from './quest-pers-jobs/pers-jakko-kochbuch';
import { part as p165 } from './quest-pers-jobs/pers-kameramann-ungeschminkt';
import { part as p166 } from './quest-pers-jobs/pers-kiki-reichweite';
import { part as p167 } from './quest-pers-jobs/pers-kinder-wasserturm';
import { part as p168 } from './quest-pers-jobs/pers-kuschel-ohrenflick';
import { part as p169 } from './quest-pers-jobs/pers-lio-album';
import { part as p170 } from './quest-pers-jobs/pers-nebelhorn-letzte-faehre';
import { part as p171 } from './quest-pers-jobs/pers-richter-goldene-gurke';
import { part as p172 } from './quest-pers-jobs/tafel-collin';
import { part as p173 } from './quest-pers-jobs/tafel-dante';
import { part as p174 } from './quest-pers-jobs/tafel-gully';
import { part as p175 } from './quest-pers-jobs/tafel-hunter';
import { part as p176 } from './quest-side-a/side-chrome-10';
import { part as p177 } from './quest-side-a/side-eingehendes-fax';
import { part as p178 } from './quest-side-a/side-eins-turnier';
import { part as p179 } from './quest-side-a/side-feierabend-fuer-kessel';
import { part as p180 } from './quest-side-a/side-jimmys-chip';
import { part as p181 } from './quest-side-a/side-keksalarm';
import { part as p182 } from './quest-side-a/side-live-dabei';
import { part as p183 } from './quest-side-a/side-riegel-krise';
import { part as p184 } from './quest-side-a/side-schallplatten';
import { part as p185 } from './quest-side-a/side-uebliche-verspaetung';
import { part as p186 } from './quest-side-a/side-zehn-credits';
import { part as p187 } from './quest-side-b/pers-vega-adlerauge';
import { part as p188 } from './quest-side-b/side-abzieher';
import { part as p189 } from './quest-side-b/side-digitech-geist';
import { part as p190 } from './quest-side-b/side-drohnenrennen';
import { part as p191 } from './quest-side-b/side-hunde-der-brackbucht';
import { part as p192 } from './quest-side-b/side-neon-limo';
import { part as p193 } from './quest-side-b/side-oma-volts-lager';
import { part as p194 } from './quest-side-b/side-rattenkoenig';
import { part as p195 } from './quest-side-b/side-streaming-suenden';
import { part as p196 } from './quest-side-b/side-thai-chi';
import { part as p197 } from './quest-side-b/side-zweite-hand';
import { part as p198 } from './quest-side-c/pers-aria-lieblingsshirt';
import { part as p199 } from './quest-side-c/pers-raven-handschellen';
import { part as p200 } from './quest-side-c/side-alte-gewohnheiten';
import { part as p201 } from './quest-side-c/side-collins-peruecke';
import { part as p202 } from './quest-side-c/side-container-77';
import { part as p203 } from './quest-side-c/side-lumos-platte';
import { part as p204 } from './quest-side-c/side-rettung-am-rechen';
import { part as p205 } from './quest-side-c/side-rostlaube';
import { part as p206 } from './quest-side-c/side-strom-fuer-die-rohre';
import { part as p207 } from './quest-side-c/side-wand-der-freiheit';
import { part as p208 } from './system/abilities-items';
import { part as p209 } from './system/checks';
import { part as p210 } from './system/cyberware';
import { part as p211 } from './system/items-andenken';
import { part as p212 } from './system/items-cyberware';
import { part as p213 } from './system/items-geschenke';
import { part as p214 } from './system/items-kleidung';
import { part as p215 } from './system/items-quest';
import { part as p216 } from './system/items-sammeln';
import { part as p217 } from './system/items-verbrauch';
import { part as p218 } from './system/items-waffen';
import { part as p219 } from './system/shops';
import { part as p220 } from './vexaria/aria';
import { part as p221 } from './vexaria/aria-akt1';
import { part as p222 } from './vexaria/bruch';
import { part as p223 } from './vexaria/danach';
import { part as p224 } from './vexaria/funken';
import { part as p225 } from './vexaria/hoehepunkt';
import { part as p226 } from './vexaria/rivalinnen';
import { part as p227 } from './vexaria/system';
import { part as p228 } from './world/bezirke-fraktionen';
import { part as p229 } from './world/nachrichten';
import { part as p230 } from './world/quartier';
import { part as p231 } from './world/stadtereignisse';
import { part as p232 } from './world/telefon';

export const PARTS: readonly (readonly [string, ContentPart])[] = [
  ['combat-23/encounters-akt2-main', p0],
  ['combat-23/encounters-akt2-side', p1],
  ['combat-23/encounters-akt3', p2],
  ['combat-23/encounters-nachspiel', p3],
  ['combat-23/enemies', p4],
  ['combat-23/random', p5],
  ['combat-arenas-23/arenas', p6],
  ['combat-arenas/arenas', p7],
  ['combat/abilities', p8],
  ['combat/bosses', p9],
  ['combat/encounters-act1', p10],
  ['combat/encounters-aria', p11],
  ['combat/encounters-jobs', p12],
  ['combat/enemies', p13],
  ['combat/random', p14],
  ['integration/ende', p15],
  ['integration/luecken', p16],
  ['maps/bahnhof-mitte', p17],
  ['maps/cafe-sahnehaube', p18],
  ['maps/chrome-penthouse', p19],
  ['maps/crew-quartier', p20],
  ['maps/dantes-werkstatt', p21],
  ['maps/das-nest', p22],
  ['maps/digitech-areal', p23],
  ['maps/digitech-tresor', p24],
  ['maps/eisenhof', p25],
  ['maps/flutmauer', p26],
  ['maps/fundbuero', p27],
  ['maps/gerichtssaal', p28],
  ['maps/glasarkaden', p29],
  ['maps/hafenkante', p30],
  ['maps/hausboot-nebelhorn', p31],
  ['maps/high-voltage', p32],
  ['maps/hv-hinterzimmer', p33],
  ['maps/kanal-sammler', p34],
  ['maps/loetgassen', p35],
  ['maps/loetzinn-laden', p36],
  ['maps/neon-gasse', p37],
  ['maps/netzcafe-datenkruemel', p38],
  ['maps/nx1-studio', p39],
  ['maps/quantum-schauraum', p40],
  ['maps/ripper-praxis', p41],
  ['maps/rohrsiedlung', p42],
  ['maps/schrottmarkt', p43],
  ['maps/stufenplatz', p44],
  ['maps/suppenkueche', p45],
  ['maps/ubahn-wagen', p46],
  ['maps/zellentrakt', p47],
  ['npc-crew-a/dante', p48],
  ['npc-crew-a/hunter', p49],
  ['npc-crew-a/raven', p50],
  ['npc-crew-b/captain-kuschel', p51],
  ['npc-crew-b/jimmy', p52],
  ['npc-crew-b/nyra', p53],
  ['npc-crew-b/vega', p54],
  ['npc-kinder-alte/daria', p55],
  ['npc-kinder-alte/freya', p56],
  ['npc-kinder-alte/jakko', p57],
  ['npc-kinder-alte/oma-volt', p58],
  ['npc-kinder-alte/opa-gustav', p59],
  ['npc-medien-club/barkeeper', p60],
  ['npc-medien-club/collin-charleston', p61],
  ['npc-medien-club/delya-delloraine', p62],
  ['npc-medien-club/kameramann', p63],
  ['npc-medien-club/ripper', p64],
  ['npc-ordnung-markt/babette-bao', p65],
  ['npc-ordnung-markt/dexter', p66],
  ['npc-ordnung-markt/kiki-karbon', p67],
  ['npc-ordnung-markt/richter', p68],
  ['npc-ordnung-markt/wache', p69],
  ['npc-unterstadt/bolzen', p70],
  ['npc-unterstadt/buergermeister-gully', p71],
  ['npc-unterstadt/kaeptn-nebelhorn', p72],
  ['npc-unterstadt/lio-funkel', p73],
  ['npc-unterstadt/marla-sand', p74],
  ['npc-unterstadt/pim-pinzette', p75],
  ['npc-welt/alesa-zero', p76],
  ['npc-welt/barista-perle', p77],
  ['npc-welt/bijou', p78],
  ['npc-welt/blade', p79],
  ['npc-welt/bruder-kabellos', p80],
  ['npc-welt/bruno-brecher', p81],
  ['npc-welt/direktorin-hartlauf', p82],
  ['npc-welt/dj-lumo', p83],
  ['npc-welt/dr-winkel', p84],
  ['npc-welt/falke', p85],
  ['npc-welt/fluss-frieda', p86],
  ['npc-welt/fraeulein-pixel', p87],
  ['npc-welt/frau-klingel', p88],
  ['npc-welt/frau-takt', p89],
  ['npc-welt/fx-60', p90],
  ['npc-welt/gerda-gleis', p91],
  ['npc-welt/gutschein-gerd', p92],
  ['npc-welt/hafen-hannes', p93],
  ['npc-welt/henk-angler', p94],
  ['npc-welt/herr-blitz', p95],
  ['npc-welt/herr-glanz', p96],
  ['npc-welt/ki-nexus', p97],
  ['npc-welt/knuspi', p98],
  ['npc-welt/knut', p99],
  ['npc-welt/kurt', p100],
  ['npc-welt/madame-satin', p101],
  ['npc-welt/meister-watt', p102],
  ['npc-welt/mila', p103],
  ['npc-welt/mira-loetzinn', p104],
  ['npc-welt/mixi', p105],
  ['npc-welt/mutter-bruehe', p106],
  ['npc-welt/ole-gaehn', p107],
  ['npc-welt/opa-blech', p108],
  ['npc-welt/opa-gurrmann', p109],
  ['npc-welt/paul', p110],
  ['npc-welt/pfeffer', p111],
  ['npc-welt/portier-albert', p112],
  ['npc-welt/salzige-grete', p113],
  ['npc-welt/seraphina-chrome', p114],
  ['npc-welt/serenity-chrome', p115],
  ['npc-welt/sina-spray', p116],
  ['npc-welt/stylistin-gina', p117],
  ['npc-welt/sybella-chrome', p118],
  ['npc-welt/turbo-tilda', p119],
  ['npc-welt/vex-schrapnell', p120],
  ['npc-welt/vinyl-vincent', p121],
  ['npc-welt/wett-willi', p122],
  ['npc-welt/xion-venom', p123],
  ['quest-main-a/main-0-digitech', p124],
  ['quest-main-a/main-1-ankunft', p125],
  ['quest-main-a/main-1-dexter', p126],
  ['quest-main-a/main-1-probezeit', p127],
  ['quest-main-b/main-1-auf-raven', p128],
  ['quest-main-b/main-1-dante', p129],
  ['quest-main-b/main-1-der-plan', p130],
  ['quest-main-b/main-1-raven', p131],
  ['quest-main-b/planungstafel', p132],
  ['quest-main-b/prep-ablenkung', p133],
  ['quest-main-b/prep-fluchtweg', p134],
  ['quest-main-b/prep-grundriss', p135],
  ['quest-main-b/prep-wachplan', p136],
  ['quest-main-b/prep-zugangskarte', p137],
  ['quest-pers-jobs/dinge', p138],
  ['quest-pers-jobs/figuren', p139],
  ['quest-pers-jobs/job-bergung', p140],
  ['quest-pers-jobs/job-datenraub', p141],
  ['quest-pers-jobs/job-eskorte', p142],
  ['quest-pers-jobs/job-kanal', p143],
  ['quest-pers-jobs/job-kopfgeld', p144],
  ['quest-pers-jobs/job-kurier', p145],
  ['quest-pers-jobs/job-schulden', p146],
  ['quest-pers-jobs/job-tuersteher', p147],
  ['quest-pers-jobs/kopfgeld-der-kassierer', p148],
  ['quest-pers-jobs/kopfgeld-graf-gully-zwei', p149],
  ['quest-pers-jobs/kopfgeld-krawall-kalle', p150],
  ['quest-pers-jobs/kopfgeld-loetkolben-lola', p151],
  ['quest-pers-jobs/kopfgeld-neon-nils', p152],
  ['quest-pers-jobs/kopfgeld-oma-turbo', p153],
  ['quest-pers-jobs/kopfgeld-toaster', p154],
  ['quest-pers-jobs/kopfgeld-zwei-finger-zoltan', p155],
  ['quest-pers-jobs/pers-babette-markttag', p156],
  ['quest-pers-jobs/pers-barkeeper-letzter-vers', p157],
  ['quest-pers-jobs/pers-bolzen-bein', p158],
  ['quest-pers-jobs/pers-dante-erstpressung', p159],
  ['quest-pers-jobs/pers-daria-botendienst', p160],
  ['quest-pers-jobs/pers-dexter-schuldenfrei', p161],
  ['quest-pers-jobs/pers-freya-fairer-lohn', p162],
  ['quest-pers-jobs/pers-hunter-reiner-tisch', p163],
  ['quest-pers-jobs/pers-jakko-kochbuch', p164],
  ['quest-pers-jobs/pers-kameramann-ungeschminkt', p165],
  ['quest-pers-jobs/pers-kiki-reichweite', p166],
  ['quest-pers-jobs/pers-kinder-wasserturm', p167],
  ['quest-pers-jobs/pers-kuschel-ohrenflick', p168],
  ['quest-pers-jobs/pers-lio-album', p169],
  ['quest-pers-jobs/pers-nebelhorn-letzte-faehre', p170],
  ['quest-pers-jobs/pers-richter-goldene-gurke', p171],
  ['quest-pers-jobs/tafel-collin', p172],
  ['quest-pers-jobs/tafel-dante', p173],
  ['quest-pers-jobs/tafel-gully', p174],
  ['quest-pers-jobs/tafel-hunter', p175],
  ['quest-side-a/side-chrome-10', p176],
  ['quest-side-a/side-eingehendes-fax', p177],
  ['quest-side-a/side-eins-turnier', p178],
  ['quest-side-a/side-feierabend-fuer-kessel', p179],
  ['quest-side-a/side-jimmys-chip', p180],
  ['quest-side-a/side-keksalarm', p181],
  ['quest-side-a/side-live-dabei', p182],
  ['quest-side-a/side-riegel-krise', p183],
  ['quest-side-a/side-schallplatten', p184],
  ['quest-side-a/side-uebliche-verspaetung', p185],
  ['quest-side-a/side-zehn-credits', p186],
  ['quest-side-b/pers-vega-adlerauge', p187],
  ['quest-side-b/side-abzieher', p188],
  ['quest-side-b/side-digitech-geist', p189],
  ['quest-side-b/side-drohnenrennen', p190],
  ['quest-side-b/side-hunde-der-brackbucht', p191],
  ['quest-side-b/side-neon-limo', p192],
  ['quest-side-b/side-oma-volts-lager', p193],
  ['quest-side-b/side-rattenkoenig', p194],
  ['quest-side-b/side-streaming-suenden', p195],
  ['quest-side-b/side-thai-chi', p196],
  ['quest-side-b/side-zweite-hand', p197],
  ['quest-side-c/pers-aria-lieblingsshirt', p198],
  ['quest-side-c/pers-raven-handschellen', p199],
  ['quest-side-c/side-alte-gewohnheiten', p200],
  ['quest-side-c/side-collins-peruecke', p201],
  ['quest-side-c/side-container-77', p202],
  ['quest-side-c/side-lumos-platte', p203],
  ['quest-side-c/side-rettung-am-rechen', p204],
  ['quest-side-c/side-rostlaube', p205],
  ['quest-side-c/side-strom-fuer-die-rohre', p206],
  ['quest-side-c/side-wand-der-freiheit', p207],
  ['system/abilities-items', p208],
  ['system/checks', p209],
  ['system/cyberware', p210],
  ['system/items-andenken', p211],
  ['system/items-cyberware', p212],
  ['system/items-geschenke', p213],
  ['system/items-kleidung', p214],
  ['system/items-quest', p215],
  ['system/items-sammeln', p216],
  ['system/items-verbrauch', p217],
  ['system/items-waffen', p218],
  ['system/shops', p219],
  ['vexaria/aria', p220],
  ['vexaria/aria-akt1', p221],
  ['vexaria/bruch', p222],
  ['vexaria/danach', p223],
  ['vexaria/funken', p224],
  ['vexaria/hoehepunkt', p225],
  ['vexaria/rivalinnen', p226],
  ['vexaria/system', p227],
  ['world/bezirke-fraktionen', p228],
  ['world/nachrichten', p229],
  ['world/quartier', p230],
  ['world/stadtereignisse', p231],
  ['world/telefon', p232],
];
