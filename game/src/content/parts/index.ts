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
import { part as p40 } from './npc-crew-a/dante';
import { part as p41 } from './npc-crew-a/hunter';
import { part as p42 } from './npc-crew-a/raven';
import { part as p43 } from './npc-crew-b/captain-kuschel';
import { part as p44 } from './npc-crew-b/jimmy';
import { part as p45 } from './npc-crew-b/nyra';
import { part as p46 } from './npc-crew-b/vega';
import { part as p47 } from './npc-kinder-alte/daria';
import { part as p48 } from './npc-kinder-alte/freya';
import { part as p49 } from './npc-kinder-alte/jakko';
import { part as p50 } from './npc-kinder-alte/oma-volt';
import { part as p51 } from './npc-kinder-alte/opa-gustav';
import { part as p52 } from './npc-medien-club/barkeeper';
import { part as p53 } from './npc-medien-club/collin-charleston';
import { part as p54 } from './npc-medien-club/delya-delloraine';
import { part as p55 } from './npc-medien-club/kameramann';
import { part as p56 } from './npc-medien-club/ripper';
import { part as p57 } from './npc-ordnung-markt/babette-bao';
import { part as p58 } from './npc-ordnung-markt/dexter';
import { part as p59 } from './npc-ordnung-markt/kiki-karbon';
import { part as p60 } from './npc-ordnung-markt/richter';
import { part as p61 } from './npc-ordnung-markt/wache';
import { part as p62 } from './npc-unterstadt/bolzen';
import { part as p63 } from './npc-unterstadt/buergermeister-gully';
import { part as p64 } from './npc-unterstadt/kaeptn-nebelhorn';
import { part as p65 } from './npc-unterstadt/lio-funkel';
import { part as p66 } from './npc-unterstadt/marla-sand';
import { part as p67 } from './npc-unterstadt/pim-pinzette';
import { part as p68 } from './npc-welt/barista-perle';
import { part as p69 } from './npc-welt/bruder-kabellos';
import { part as p70 } from './npc-welt/bruno-brecher';
import { part as p71 } from './npc-welt/direktorin-hartlauf';
import { part as p72 } from './npc-welt/dj-lumo';
import { part as p73 } from './npc-welt/dr-winkel';
import { part as p74 } from './npc-welt/falke';
import { part as p75 } from './npc-welt/fluss-frieda';
import { part as p76 } from './npc-welt/fraeulein-pixel';
import { part as p77 } from './npc-welt/frau-klingel';
import { part as p78 } from './npc-welt/frau-takt';
import { part as p79 } from './npc-welt/fx-60';
import { part as p80 } from './npc-welt/gerda-gleis';
import { part as p81 } from './npc-welt/gutschein-gerd';
import { part as p82 } from './npc-welt/hafen-hannes';
import { part as p83 } from './npc-welt/henk-angler';
import { part as p84 } from './npc-welt/herr-blitz';
import { part as p85 } from './npc-welt/herr-glanz';
import { part as p86 } from './npc-welt/knuspi';
import { part as p87 } from './npc-welt/knut';
import { part as p88 } from './npc-welt/kurt';
import { part as p89 } from './npc-welt/madame-satin';
import { part as p90 } from './npc-welt/meister-watt';
import { part as p91 } from './npc-welt/mila';
import { part as p92 } from './npc-welt/mira-loetzinn';
import { part as p93 } from './npc-welt/mixi';
import { part as p94 } from './npc-welt/mutter-bruehe';
import { part as p95 } from './npc-welt/ole-gaehn';
import { part as p96 } from './npc-welt/opa-blech';
import { part as p97 } from './npc-welt/opa-gurrmann';
import { part as p98 } from './npc-welt/paul';
import { part as p99 } from './npc-welt/pfeffer';
import { part as p100 } from './npc-welt/salzige-grete';
import { part as p101 } from './npc-welt/sina-spray';
import { part as p102 } from './npc-welt/stylistin-gina';
import { part as p103 } from './npc-welt/turbo-tilda';
import { part as p104 } from './npc-welt/vex-schrapnell';
import { part as p105 } from './npc-welt/vinyl-vincent';
import { part as p106 } from './npc-welt/wett-willi';
import { part as p107 } from './quest-main-a/main-0-digitech';
import { part as p108 } from './quest-main-a/main-1-ankunft';
import { part as p109 } from './quest-main-a/main-1-dexter';
import { part as p110 } from './quest-main-a/main-1-probezeit';
import { part as p111 } from './quest-main-b/main-1-auf-raven';
import { part as p112 } from './quest-main-b/main-1-dante';
import { part as p113 } from './quest-main-b/main-1-der-plan';
import { part as p114 } from './quest-main-b/main-1-raven';
import { part as p115 } from './quest-main-b/planungstafel';
import { part as p116 } from './quest-main-b/prep-ablenkung';
import { part as p117 } from './quest-main-b/prep-fluchtweg';
import { part as p118 } from './quest-main-b/prep-grundriss';
import { part as p119 } from './quest-main-b/prep-wachplan';
import { part as p120 } from './quest-main-b/prep-zugangskarte';
import { part as p121 } from './quest-pers-jobs/dinge';
import { part as p122 } from './quest-pers-jobs/figuren';
import { part as p123 } from './quest-pers-jobs/job-bergung';
import { part as p124 } from './quest-pers-jobs/job-datenraub';
import { part as p125 } from './quest-pers-jobs/job-eskorte';
import { part as p126 } from './quest-pers-jobs/job-kanal';
import { part as p127 } from './quest-pers-jobs/job-kopfgeld';
import { part as p128 } from './quest-pers-jobs/job-kurier';
import { part as p129 } from './quest-pers-jobs/job-schulden';
import { part as p130 } from './quest-pers-jobs/job-tuersteher';
import { part as p131 } from './quest-pers-jobs/kopfgeld-der-kassierer';
import { part as p132 } from './quest-pers-jobs/kopfgeld-graf-gully-zwei';
import { part as p133 } from './quest-pers-jobs/kopfgeld-krawall-kalle';
import { part as p134 } from './quest-pers-jobs/kopfgeld-loetkolben-lola';
import { part as p135 } from './quest-pers-jobs/kopfgeld-neon-nils';
import { part as p136 } from './quest-pers-jobs/kopfgeld-oma-turbo';
import { part as p137 } from './quest-pers-jobs/kopfgeld-toaster';
import { part as p138 } from './quest-pers-jobs/kopfgeld-zwei-finger-zoltan';
import { part as p139 } from './quest-pers-jobs/pers-babette-markttag';
import { part as p140 } from './quest-pers-jobs/pers-barkeeper-letzter-vers';
import { part as p141 } from './quest-pers-jobs/pers-bolzen-bein';
import { part as p142 } from './quest-pers-jobs/pers-dante-erstpressung';
import { part as p143 } from './quest-pers-jobs/pers-daria-botendienst';
import { part as p144 } from './quest-pers-jobs/pers-dexter-schuldenfrei';
import { part as p145 } from './quest-pers-jobs/pers-freya-fairer-lohn';
import { part as p146 } from './quest-pers-jobs/pers-hunter-reiner-tisch';
import { part as p147 } from './quest-pers-jobs/pers-jakko-kochbuch';
import { part as p148 } from './quest-pers-jobs/pers-kameramann-ungeschminkt';
import { part as p149 } from './quest-pers-jobs/pers-kiki-reichweite';
import { part as p150 } from './quest-pers-jobs/pers-kinder-wasserturm';
import { part as p151 } from './quest-pers-jobs/pers-kuschel-ohrenflick';
import { part as p152 } from './quest-pers-jobs/pers-lio-album';
import { part as p153 } from './quest-pers-jobs/pers-nebelhorn-letzte-faehre';
import { part as p154 } from './quest-pers-jobs/pers-richter-goldene-gurke';
import { part as p155 } from './quest-pers-jobs/tafel-collin';
import { part as p156 } from './quest-pers-jobs/tafel-dante';
import { part as p157 } from './quest-pers-jobs/tafel-gully';
import { part as p158 } from './quest-pers-jobs/tafel-hunter';
import { part as p159 } from './quest-side-a/side-chrome-10';
import { part as p160 } from './quest-side-a/side-eingehendes-fax';
import { part as p161 } from './quest-side-a/side-eins-turnier';
import { part as p162 } from './quest-side-a/side-feierabend-fuer-kessel';
import { part as p163 } from './quest-side-a/side-jimmys-chip';
import { part as p164 } from './quest-side-a/side-keksalarm';
import { part as p165 } from './quest-side-a/side-live-dabei';
import { part as p166 } from './quest-side-a/side-riegel-krise';
import { part as p167 } from './quest-side-a/side-schallplatten';
import { part as p168 } from './quest-side-a/side-uebliche-verspaetung';
import { part as p169 } from './quest-side-a/side-zehn-credits';
import { part as p170 } from './quest-side-b/pers-vega-adlerauge';
import { part as p171 } from './quest-side-b/side-abzieher';
import { part as p172 } from './quest-side-b/side-digitech-geist';
import { part as p173 } from './quest-side-b/side-drohnenrennen';
import { part as p174 } from './quest-side-b/side-hunde-der-brackbucht';
import { part as p175 } from './quest-side-b/side-neon-limo';
import { part as p176 } from './quest-side-b/side-oma-volts-lager';
import { part as p177 } from './quest-side-b/side-rattenkoenig';
import { part as p178 } from './quest-side-b/side-streaming-suenden';
import { part as p179 } from './quest-side-b/side-thai-chi';
import { part as p180 } from './quest-side-b/side-zweite-hand';
import { part as p181 } from './quest-side-c/pers-aria-lieblingsshirt';
import { part as p182 } from './quest-side-c/pers-raven-handschellen';
import { part as p183 } from './quest-side-c/side-alte-gewohnheiten';
import { part as p184 } from './quest-side-c/side-collins-peruecke';
import { part as p185 } from './quest-side-c/side-container-77';
import { part as p186 } from './quest-side-c/side-lumos-platte';
import { part as p187 } from './quest-side-c/side-rettung-am-rechen';
import { part as p188 } from './quest-side-c/side-rostlaube';
import { part as p189 } from './quest-side-c/side-strom-fuer-die-rohre';
import { part as p190 } from './quest-side-c/side-wand-der-freiheit';
import { part as p191 } from './system/abilities-items';
import { part as p192 } from './system/checks';
import { part as p193 } from './system/cyberware';
import { part as p194 } from './system/items-andenken';
import { part as p195 } from './system/items-cyberware';
import { part as p196 } from './system/items-geschenke';
import { part as p197 } from './system/items-kleidung';
import { part as p198 } from './system/items-quest';
import { part as p199 } from './system/items-sammeln';
import { part as p200 } from './system/items-verbrauch';
import { part as p201 } from './system/items-waffen';
import { part as p202 } from './system/shops';
import { part as p203 } from './vexaria/aria';
import { part as p204 } from './vexaria/aria-akt1';
import { part as p205 } from './vexaria/bruch';
import { part as p206 } from './vexaria/danach';
import { part as p207 } from './vexaria/funken';
import { part as p208 } from './vexaria/hoehepunkt';
import { part as p209 } from './vexaria/rivalinnen';
import { part as p210 } from './vexaria/system';
import { part as p211 } from './world/bezirke-fraktionen';
import { part as p212 } from './world/nachrichten';
import { part as p213 } from './world/quartier';
import { part as p214 } from './world/stadtereignisse';
import { part as p215 } from './world/telefon';

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
  ['npc-crew-a/dante', p40],
  ['npc-crew-a/hunter', p41],
  ['npc-crew-a/raven', p42],
  ['npc-crew-b/captain-kuschel', p43],
  ['npc-crew-b/jimmy', p44],
  ['npc-crew-b/nyra', p45],
  ['npc-crew-b/vega', p46],
  ['npc-kinder-alte/daria', p47],
  ['npc-kinder-alte/freya', p48],
  ['npc-kinder-alte/jakko', p49],
  ['npc-kinder-alte/oma-volt', p50],
  ['npc-kinder-alte/opa-gustav', p51],
  ['npc-medien-club/barkeeper', p52],
  ['npc-medien-club/collin-charleston', p53],
  ['npc-medien-club/delya-delloraine', p54],
  ['npc-medien-club/kameramann', p55],
  ['npc-medien-club/ripper', p56],
  ['npc-ordnung-markt/babette-bao', p57],
  ['npc-ordnung-markt/dexter', p58],
  ['npc-ordnung-markt/kiki-karbon', p59],
  ['npc-ordnung-markt/richter', p60],
  ['npc-ordnung-markt/wache', p61],
  ['npc-unterstadt/bolzen', p62],
  ['npc-unterstadt/buergermeister-gully', p63],
  ['npc-unterstadt/kaeptn-nebelhorn', p64],
  ['npc-unterstadt/lio-funkel', p65],
  ['npc-unterstadt/marla-sand', p66],
  ['npc-unterstadt/pim-pinzette', p67],
  ['npc-welt/barista-perle', p68],
  ['npc-welt/bruder-kabellos', p69],
  ['npc-welt/bruno-brecher', p70],
  ['npc-welt/direktorin-hartlauf', p71],
  ['npc-welt/dj-lumo', p72],
  ['npc-welt/dr-winkel', p73],
  ['npc-welt/falke', p74],
  ['npc-welt/fluss-frieda', p75],
  ['npc-welt/fraeulein-pixel', p76],
  ['npc-welt/frau-klingel', p77],
  ['npc-welt/frau-takt', p78],
  ['npc-welt/fx-60', p79],
  ['npc-welt/gerda-gleis', p80],
  ['npc-welt/gutschein-gerd', p81],
  ['npc-welt/hafen-hannes', p82],
  ['npc-welt/henk-angler', p83],
  ['npc-welt/herr-blitz', p84],
  ['npc-welt/herr-glanz', p85],
  ['npc-welt/knuspi', p86],
  ['npc-welt/knut', p87],
  ['npc-welt/kurt', p88],
  ['npc-welt/madame-satin', p89],
  ['npc-welt/meister-watt', p90],
  ['npc-welt/mila', p91],
  ['npc-welt/mira-loetzinn', p92],
  ['npc-welt/mixi', p93],
  ['npc-welt/mutter-bruehe', p94],
  ['npc-welt/ole-gaehn', p95],
  ['npc-welt/opa-blech', p96],
  ['npc-welt/opa-gurrmann', p97],
  ['npc-welt/paul', p98],
  ['npc-welt/pfeffer', p99],
  ['npc-welt/salzige-grete', p100],
  ['npc-welt/sina-spray', p101],
  ['npc-welt/stylistin-gina', p102],
  ['npc-welt/turbo-tilda', p103],
  ['npc-welt/vex-schrapnell', p104],
  ['npc-welt/vinyl-vincent', p105],
  ['npc-welt/wett-willi', p106],
  ['quest-main-a/main-0-digitech', p107],
  ['quest-main-a/main-1-ankunft', p108],
  ['quest-main-a/main-1-dexter', p109],
  ['quest-main-a/main-1-probezeit', p110],
  ['quest-main-b/main-1-auf-raven', p111],
  ['quest-main-b/main-1-dante', p112],
  ['quest-main-b/main-1-der-plan', p113],
  ['quest-main-b/main-1-raven', p114],
  ['quest-main-b/planungstafel', p115],
  ['quest-main-b/prep-ablenkung', p116],
  ['quest-main-b/prep-fluchtweg', p117],
  ['quest-main-b/prep-grundriss', p118],
  ['quest-main-b/prep-wachplan', p119],
  ['quest-main-b/prep-zugangskarte', p120],
  ['quest-pers-jobs/dinge', p121],
  ['quest-pers-jobs/figuren', p122],
  ['quest-pers-jobs/job-bergung', p123],
  ['quest-pers-jobs/job-datenraub', p124],
  ['quest-pers-jobs/job-eskorte', p125],
  ['quest-pers-jobs/job-kanal', p126],
  ['quest-pers-jobs/job-kopfgeld', p127],
  ['quest-pers-jobs/job-kurier', p128],
  ['quest-pers-jobs/job-schulden', p129],
  ['quest-pers-jobs/job-tuersteher', p130],
  ['quest-pers-jobs/kopfgeld-der-kassierer', p131],
  ['quest-pers-jobs/kopfgeld-graf-gully-zwei', p132],
  ['quest-pers-jobs/kopfgeld-krawall-kalle', p133],
  ['quest-pers-jobs/kopfgeld-loetkolben-lola', p134],
  ['quest-pers-jobs/kopfgeld-neon-nils', p135],
  ['quest-pers-jobs/kopfgeld-oma-turbo', p136],
  ['quest-pers-jobs/kopfgeld-toaster', p137],
  ['quest-pers-jobs/kopfgeld-zwei-finger-zoltan', p138],
  ['quest-pers-jobs/pers-babette-markttag', p139],
  ['quest-pers-jobs/pers-barkeeper-letzter-vers', p140],
  ['quest-pers-jobs/pers-bolzen-bein', p141],
  ['quest-pers-jobs/pers-dante-erstpressung', p142],
  ['quest-pers-jobs/pers-daria-botendienst', p143],
  ['quest-pers-jobs/pers-dexter-schuldenfrei', p144],
  ['quest-pers-jobs/pers-freya-fairer-lohn', p145],
  ['quest-pers-jobs/pers-hunter-reiner-tisch', p146],
  ['quest-pers-jobs/pers-jakko-kochbuch', p147],
  ['quest-pers-jobs/pers-kameramann-ungeschminkt', p148],
  ['quest-pers-jobs/pers-kiki-reichweite', p149],
  ['quest-pers-jobs/pers-kinder-wasserturm', p150],
  ['quest-pers-jobs/pers-kuschel-ohrenflick', p151],
  ['quest-pers-jobs/pers-lio-album', p152],
  ['quest-pers-jobs/pers-nebelhorn-letzte-faehre', p153],
  ['quest-pers-jobs/pers-richter-goldene-gurke', p154],
  ['quest-pers-jobs/tafel-collin', p155],
  ['quest-pers-jobs/tafel-dante', p156],
  ['quest-pers-jobs/tafel-gully', p157],
  ['quest-pers-jobs/tafel-hunter', p158],
  ['quest-side-a/side-chrome-10', p159],
  ['quest-side-a/side-eingehendes-fax', p160],
  ['quest-side-a/side-eins-turnier', p161],
  ['quest-side-a/side-feierabend-fuer-kessel', p162],
  ['quest-side-a/side-jimmys-chip', p163],
  ['quest-side-a/side-keksalarm', p164],
  ['quest-side-a/side-live-dabei', p165],
  ['quest-side-a/side-riegel-krise', p166],
  ['quest-side-a/side-schallplatten', p167],
  ['quest-side-a/side-uebliche-verspaetung', p168],
  ['quest-side-a/side-zehn-credits', p169],
  ['quest-side-b/pers-vega-adlerauge', p170],
  ['quest-side-b/side-abzieher', p171],
  ['quest-side-b/side-digitech-geist', p172],
  ['quest-side-b/side-drohnenrennen', p173],
  ['quest-side-b/side-hunde-der-brackbucht', p174],
  ['quest-side-b/side-neon-limo', p175],
  ['quest-side-b/side-oma-volts-lager', p176],
  ['quest-side-b/side-rattenkoenig', p177],
  ['quest-side-b/side-streaming-suenden', p178],
  ['quest-side-b/side-thai-chi', p179],
  ['quest-side-b/side-zweite-hand', p180],
  ['quest-side-c/pers-aria-lieblingsshirt', p181],
  ['quest-side-c/pers-raven-handschellen', p182],
  ['quest-side-c/side-alte-gewohnheiten', p183],
  ['quest-side-c/side-collins-peruecke', p184],
  ['quest-side-c/side-container-77', p185],
  ['quest-side-c/side-lumos-platte', p186],
  ['quest-side-c/side-rettung-am-rechen', p187],
  ['quest-side-c/side-rostlaube', p188],
  ['quest-side-c/side-strom-fuer-die-rohre', p189],
  ['quest-side-c/side-wand-der-freiheit', p190],
  ['system/abilities-items', p191],
  ['system/checks', p192],
  ['system/cyberware', p193],
  ['system/items-andenken', p194],
  ['system/items-cyberware', p195],
  ['system/items-geschenke', p196],
  ['system/items-kleidung', p197],
  ['system/items-quest', p198],
  ['system/items-sammeln', p199],
  ['system/items-verbrauch', p200],
  ['system/items-waffen', p201],
  ['system/shops', p202],
  ['vexaria/aria', p203],
  ['vexaria/aria-akt1', p204],
  ['vexaria/bruch', p205],
  ['vexaria/danach', p206],
  ['vexaria/funken', p207],
  ['vexaria/hoehepunkt', p208],
  ['vexaria/rivalinnen', p209],
  ['vexaria/system', p210],
  ['world/bezirke-fraktionen', p211],
  ['world/nachrichten', p212],
  ['world/quartier', p213],
  ['world/stadtereignisse', p214],
  ['world/telefon', p215],
];
