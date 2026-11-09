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
import { part as p15 } from './integration/luecken';
import { part as p16 } from './maps-23/aussiedlerhof';
import { part as p17 } from './maps-23/blades-buero';
import { part as p18 } from './maps-23/chrome-auftraege';
import { part as p19 } from './maps-23/chrome-boulevard';
import { part as p20 } from './maps-23/das-meer';
import { part as p21 } from './maps-23/datentunnel';
import { part as p22 } from './maps-23/funkturm-ruine';
import { part as p23 } from './maps-23/glasduenen';
import { part as p24 } from './maps-23/himmelsgarten';
import { part as p25 } from './maps-23/pumpwerk-sieben';
import { part as p26 } from './maps-23/quantum-campus';
import { part as p27 } from './maps-23/quantum-foyer';
import { part as p28 } from './maps-23/quantum-labor';
import { part as p29 } from './maps-23/rennhalle-9';
import { part as p30 } from './maps-23/rudis-diner';
import { part as p31 } from './maps-23/server-kern';
import { part as p32 } from './maps-23/shops-chrome-himmel';
import { part as p33 } from './maps-23/shops-meer';
import { part as p34 } from './maps-23/shops-oednis-hof';
import { part as p35 } from './maps-23/shops-quantum';
import { part as p36 } from './maps-23/shops-staubstrasse';
import { part as p37 } from './maps-23/staubstrasse';
import { part as p38 } from './maps/bahnhof-mitte';
import { part as p39 } from './maps/cafe-sahnehaube';
import { part as p40 } from './maps/chrome-penthouse';
import { part as p41 } from './maps/crew-quartier';
import { part as p42 } from './maps/dantes-werkstatt';
import { part as p43 } from './maps/das-nest';
import { part as p44 } from './maps/digitech-areal';
import { part as p45 } from './maps/digitech-tresor';
import { part as p46 } from './maps/eisenhof';
import { part as p47 } from './maps/flutmauer';
import { part as p48 } from './maps/fundbuero';
import { part as p49 } from './maps/gerichtssaal';
import { part as p50 } from './maps/glasarkaden';
import { part as p51 } from './maps/hafenkante';
import { part as p52 } from './maps/hausboot-nebelhorn';
import { part as p53 } from './maps/high-voltage';
import { part as p54 } from './maps/hv-hinterzimmer';
import { part as p55 } from './maps/kanal-sammler';
import { part as p56 } from './maps/loetgassen';
import { part as p57 } from './maps/loetzinn-laden';
import { part as p58 } from './maps/neon-gasse';
import { part as p59 } from './maps/netzcafe-datenkruemel';
import { part as p60 } from './maps/nx1-studio';
import { part as p61 } from './maps/quantum-schauraum';
import { part as p62 } from './maps/ripper-praxis';
import { part as p63 } from './maps/rohrsiedlung';
import { part as p64 } from './maps/schrottmarkt';
import { part as p65 } from './maps/stufenplatz';
import { part as p66 } from './maps/suppenkueche';
import { part as p67 } from './maps/ubahn-wagen';
import { part as p68 } from './maps/zellentrakt';
import { part as p69 } from './npc-crew-a/dante';
import { part as p70 } from './npc-crew-a/hunter';
import { part as p71 } from './npc-crew-a/paar';
import { part as p72 } from './npc-crew-a/raven';
import { part as p73 } from './npc-crew-b/begleiter-23';
import { part as p74 } from './npc-crew-b/captain-kuschel';
import { part as p75 } from './npc-crew-b/jimmy';
import { part as p76 } from './npc-crew-b/nyra';
import { part as p77 } from './npc-crew-b/vega';
import { part as p78 } from './npc-kinder-alte/daria';
import { part as p79 } from './npc-kinder-alte/daria-akt23';
import { part as p80 } from './npc-kinder-alte/freya';
import { part as p81 } from './npc-kinder-alte/freya-akt23';
import { part as p82 } from './npc-kinder-alte/jakko';
import { part as p83 } from './npc-kinder-alte/jakko-akt23';
import { part as p84 } from './npc-kinder-alte/oma-volt';
import { part as p85 } from './npc-kinder-alte/oma-volt-akt23';
import { part as p86 } from './npc-kinder-alte/opa-gustav';
import { part as p87 } from './npc-kinder-alte/opa-gustav-akt23';
import { part as p88 } from './npc-medien-club/barkeeper';
import { part as p89 } from './npc-medien-club/collin-charleston';
import { part as p90 } from './npc-medien-club/delya-delloraine';
import { part as p91 } from './npc-medien-club/kameramann';
import { part as p92 } from './npc-medien-club/ripper';
import { part as p93 } from './npc-oednis/elsa';
import { part as p94 } from './npc-oednis/folgen';
import { part as p95 } from './npc-oednis/glasblaeserin';
import { part as p96 } from './npc-oednis/krabbe-karl';
import { part as p97 } from './npc-oednis/kraehe';
import { part as p98 } from './npc-oednis/opa-funk';
import { part as p99 } from './npc-oednis/rudi';
import { part as p100 } from './npc-oednis/schlafwandler';
import { part as p101 } from './npc-oednis/statisten';
import { part as p102 } from './npc-oednis/staubbaron-broesel';
import { part as p103 } from './npc-ordnung-markt/babette-bao';
import { part as p104 } from './npc-ordnung-markt/dexter';
import { part as p105 } from './npc-ordnung-markt/kiki-karbon';
import { part as p106 } from './npc-ordnung-markt/richter';
import { part as p107 } from './npc-ordnung-markt/wache';
import { part as p108 } from './npc-quantum/alesa-zero';
import { part as p109 } from './npc-quantum/bijou';
import { part as p110 } from './npc-quantum/blade';
import { part as p111 } from './npc-quantum/fraeulein-pixel';
import { part as p112 } from './npc-quantum/ki-nexus';
import { part as p113 } from './npc-quantum/leutnant-nadel';
import { part as p114 } from './npc-quantum/mila';
import { part as p115 } from './npc-quantum/pfeffer';
import { part as p116 } from './npc-quantum/portier-albert';
import { part as p117 } from './npc-quantum/seraphina-chrome';
import { part as p118 } from './npc-quantum/serenity-chrome';
import { part as p119 } from './npc-quantum/stylistin-gina';
import { part as p120 } from './npc-quantum/sybella-chrome';
import { part as p121 } from './npc-quantum/xion-venom';
import { part as p122 } from './npc-unterstadt/bolzen';
import { part as p123 } from './npc-unterstadt/buergermeister-gully';
import { part as p124 } from './npc-unterstadt/kaeptn-nebelhorn';
import { part as p125 } from './npc-unterstadt/lio-funkel';
import { part as p126 } from './npc-unterstadt/marla-sand';
import { part as p127 } from './npc-unterstadt/pim-pinzette';
import { part as p128 } from './npc-welt/barista-perle';
import { part as p129 } from './npc-welt/bruder-kabellos';
import { part as p130 } from './npc-welt/bruno-brecher';
import { part as p131 } from './npc-welt/direktorin-hartlauf';
import { part as p132 } from './npc-welt/dj-lumo';
import { part as p133 } from './npc-welt/dr-winkel';
import { part as p134 } from './npc-welt/falke';
import { part as p135 } from './npc-welt/fluss-frieda';
import { part as p136 } from './npc-welt/frau-klingel';
import { part as p137 } from './npc-welt/frau-takt';
import { part as p138 } from './npc-welt/fx-60';
import { part as p139 } from './npc-welt/gerda-gleis';
import { part as p140 } from './npc-welt/gutschein-gerd';
import { part as p141 } from './npc-welt/hafen-hannes';
import { part as p142 } from './npc-welt/henk-angler';
import { part as p143 } from './npc-welt/herr-blitz';
import { part as p144 } from './npc-welt/herr-glanz';
import { part as p145 } from './npc-welt/knuspi';
import { part as p146 } from './npc-welt/knut';
import { part as p147 } from './npc-welt/kurt';
import { part as p148 } from './npc-welt/madame-satin';
import { part as p149 } from './npc-welt/meister-watt';
import { part as p150 } from './npc-welt/mira-loetzinn';
import { part as p151 } from './npc-welt/mixi';
import { part as p152 } from './npc-welt/mutter-bruehe';
import { part as p153 } from './npc-welt/ole-gaehn';
import { part as p154 } from './npc-welt/opa-blech';
import { part as p155 } from './npc-welt/opa-gurrmann';
import { part as p156 } from './npc-welt/paul';
import { part as p157 } from './npc-welt/salzige-grete';
import { part as p158 } from './npc-welt/sina-spray';
import { part as p159 } from './npc-welt/turbo-tilda';
import { part as p160 } from './npc-welt/vex-schrapnell';
import { part as p161 } from './npc-welt/vinyl-vincent';
import { part as p162 } from './npc-welt/wett-willi';
import { part as p163 } from './quest-enden/abspann';
import { part as p164 } from './quest-enden/enden';
import { part as p165 } from './quest-enden/epilog-karten';
import { part as p166 } from './quest-enden/nachspiel';
import { part as p167 } from './quest-enden/side-offene-werkstatt';
import { part as p168 } from './quest-enden/side-strandclub';
import { part as p169 } from './quest-enden/side-zweite-chance';
import { part as p170 } from './quest-enden/sonder-chrome-tresor';
import { part as p171 } from './quest-enden/sonder-konvoi-nougat';
import { part as p172 } from './quest-enden/sonder-letzte-runde';
import { part as p173 } from './quest-enden/sonder-pumpwerk-pegel';
import { part as p174 } from './quest-enden/sonder-tafel';
import { part as p175 } from './quest-main-2/freie-phase';
import { part as p176 } from './quest-main-2/main-2-bruch';
import { part as p177 } from './quest-main-2/main-2-countdown';
import { part as p178 } from './quest-main-2/main-2-kanal';
import { part as p179 } from './quest-main-2/main-2-krisensitzung';
import { part as p180 } from './quest-main-2/planungstafel-party';
import { part as p181 } from './quest-main-2/prep-ausweise';
import { part as p182 } from './quest-main-2/prep-fahrzeug';
import { part as p183 } from './quest-main-2/prep-gaesteliste';
import { part as p184 } from './quest-main-2/prep-gegenmittel';
import { part as p185 } from './quest-main-2/prep-outfits';
import { part as p186 } from './quest-main-2/prep-turm-plan';
import { part as p187 } from './quest-main-3/main-3-blade';
import { part as p188 } from './quest-main-3/main-3-einlass';
import { part as p189 } from './quest-main-3/main-3-gedankenkontrolle';
import { part as p190 } from './quest-main-3/main-3-labor';
import { part as p191 } from './quest-main-3/main-3-nexus';
import { part as p192 } from './quest-main-a/main-0-digitech';
import { part as p193 } from './quest-main-a/main-1-ankunft';
import { part as p194 } from './quest-main-a/main-1-dexter';
import { part as p195 } from './quest-main-a/main-1-probezeit';
import { part as p196 } from './quest-main-b/main-1-auf-raven';
import { part as p197 } from './quest-main-b/main-1-dante';
import { part as p198 } from './quest-main-b/main-1-der-plan';
import { part as p199 } from './quest-main-b/main-1-raven';
import { part as p200 } from './quest-main-b/planungstafel';
import { part as p201 } from './quest-main-b/prep-ablenkung';
import { part as p202 } from './quest-main-b/prep-fluchtweg';
import { part as p203 } from './quest-main-b/prep-grundriss';
import { part as p204 } from './quest-main-b/prep-wachplan';
import { part as p205 } from './quest-main-b/prep-zugangskarte';
import { part as p206 } from './quest-pers-23/auftraege-23';
import { part as p207 } from './quest-pers-23/kopfgeld-stufe3';
import { part as p208 } from './quest-pers-23/pers-alesa-wasserfilter';
import { part as p209 } from './quest-pers-23/pers-blade-teddymantel';
import { part as p210 } from './quest-pers-23/pers-collin-pixel';
import { part as p211 } from './quest-pers-23/pers-delya-quelle';
import { part as p212 } from './quest-pers-23/pers-gustav-alte-liebe';
import { part as p213 } from './quest-pers-23/pers-ki-nexus-seele';
import { part as p214 } from './quest-pers-23/pers-marla-brunnen';
import { part as p215 } from './quest-pers-23/pers-pim-kleine-schrift';
import { part as p216 } from './quest-pers-23/pers-ripper-taschenuhr';
import { part as p217 } from './quest-pers-23/pers-seraphina-plan-b';
import { part as p218 } from './quest-pers-23/pers-serenity-gewaechshaus';
import { part as p219 } from './quest-pers-23/pers-sybella-schnaeppchen';
import { part as p220 } from './quest-pers-23/pers-xion-umschulung';
import { part as p221 } from './quest-pers-jobs/dinge';
import { part as p222 } from './quest-pers-jobs/figuren';
import { part as p223 } from './quest-pers-jobs/job-bergung';
import { part as p224 } from './quest-pers-jobs/job-datenraub';
import { part as p225 } from './quest-pers-jobs/job-eskorte';
import { part as p226 } from './quest-pers-jobs/job-kanal';
import { part as p227 } from './quest-pers-jobs/job-kopfgeld';
import { part as p228 } from './quest-pers-jobs/job-kurier';
import { part as p229 } from './quest-pers-jobs/job-schulden';
import { part as p230 } from './quest-pers-jobs/job-tuersteher';
import { part as p231 } from './quest-pers-jobs/kopfgeld-der-kassierer';
import { part as p232 } from './quest-pers-jobs/kopfgeld-graf-gully-zwei';
import { part as p233 } from './quest-pers-jobs/kopfgeld-krawall-kalle';
import { part as p234 } from './quest-pers-jobs/kopfgeld-loetkolben-lola';
import { part as p235 } from './quest-pers-jobs/kopfgeld-neon-nils';
import { part as p236 } from './quest-pers-jobs/kopfgeld-oma-turbo';
import { part as p237 } from './quest-pers-jobs/kopfgeld-toaster';
import { part as p238 } from './quest-pers-jobs/kopfgeld-zwei-finger-zoltan';
import { part as p239 } from './quest-pers-jobs/pers-babette-markttag';
import { part as p240 } from './quest-pers-jobs/pers-barkeeper-letzter-vers';
import { part as p241 } from './quest-pers-jobs/pers-bolzen-bein';
import { part as p242 } from './quest-pers-jobs/pers-dante-erstpressung';
import { part as p243 } from './quest-pers-jobs/pers-daria-botendienst';
import { part as p244 } from './quest-pers-jobs/pers-dexter-schuldenfrei';
import { part as p245 } from './quest-pers-jobs/pers-freya-fairer-lohn';
import { part as p246 } from './quest-pers-jobs/pers-hunter-reiner-tisch';
import { part as p247 } from './quest-pers-jobs/pers-jakko-kochbuch';
import { part as p248 } from './quest-pers-jobs/pers-kameramann-ungeschminkt';
import { part as p249 } from './quest-pers-jobs/pers-kiki-reichweite';
import { part as p250 } from './quest-pers-jobs/pers-kinder-wasserturm';
import { part as p251 } from './quest-pers-jobs/pers-kuschel-ohrenflick';
import { part as p252 } from './quest-pers-jobs/pers-lio-album';
import { part as p253 } from './quest-pers-jobs/pers-nebelhorn-letzte-faehre';
import { part as p254 } from './quest-pers-jobs/pers-richter-goldene-gurke';
import { part as p255 } from './quest-pers-jobs/tafel-collin';
import { part as p256 } from './quest-pers-jobs/tafel-dante';
import { part as p257 } from './quest-pers-jobs/tafel-gully';
import { part as p258 } from './quest-pers-jobs/tafel-hunter';
import { part as p259 } from './quest-side-23-a/pers-nyra-silent-angel';
import { part as p260 } from './quest-side-23-a/side-alesas-zuendholz';
import { part as p261 } from './quest-side-23-a/side-captain-kuschel';
import { part as p262 } from './quest-side-23-a/side-ki-fluestern';
import { part as p263 } from './quest-side-23-a/side-teekraenzchen';
import { part as p264 } from './quest-side-23-a/side-weg-zum-meer';
import { part as p265 } from './quest-side-23-a/side-xions-kralle';
import { part as p266 } from './quest-side-23-b/side-chrome-pudel';
import { part as p267 } from './quest-side-23-b/side-glasherz';
import { part as p268 } from './quest-side-23-b/side-hartlaufs-rache';
import { part as p269 } from './quest-side-23-b/side-kraehes-ehre';
import { part as p270 } from './quest-side-23-b/side-oednis-frieden';
import { part as p271 } from './quest-side-23-b/side-rostzaehne-ende';
import { part as p272 } from './quest-side-23-b/side-verlorene-frequenz';
import { part as p273 } from './quest-side-a/side-chrome-10';
import { part as p274 } from './quest-side-a/side-eingehendes-fax';
import { part as p275 } from './quest-side-a/side-eins-turnier';
import { part as p276 } from './quest-side-a/side-feierabend-fuer-kessel';
import { part as p277 } from './quest-side-a/side-jimmys-chip';
import { part as p278 } from './quest-side-a/side-keksalarm';
import { part as p279 } from './quest-side-a/side-live-dabei';
import { part as p280 } from './quest-side-a/side-riegel-krise';
import { part as p281 } from './quest-side-a/side-schallplatten';
import { part as p282 } from './quest-side-a/side-uebliche-verspaetung';
import { part as p283 } from './quest-side-a/side-zehn-credits';
import { part as p284 } from './quest-side-b/pers-vega-adlerauge';
import { part as p285 } from './quest-side-b/side-abzieher';
import { part as p286 } from './quest-side-b/side-digitech-geist';
import { part as p287 } from './quest-side-b/side-drohnenrennen';
import { part as p288 } from './quest-side-b/side-hunde-der-brackbucht';
import { part as p289 } from './quest-side-b/side-neon-limo';
import { part as p290 } from './quest-side-b/side-oma-volts-lager';
import { part as p291 } from './quest-side-b/side-rattenkoenig';
import { part as p292 } from './quest-side-b/side-streaming-suenden';
import { part as p293 } from './quest-side-b/side-thai-chi';
import { part as p294 } from './quest-side-b/side-zweite-hand';
import { part as p295 } from './quest-side-c/pers-aria-lieblingsshirt';
import { part as p296 } from './quest-side-c/pers-raven-handschellen';
import { part as p297 } from './quest-side-c/side-alte-gewohnheiten';
import { part as p298 } from './quest-side-c/side-collins-peruecke';
import { part as p299 } from './quest-side-c/side-container-77';
import { part as p300 } from './quest-side-c/side-lumos-platte';
import { part as p301 } from './quest-side-c/side-rettung-am-rechen';
import { part as p302 } from './quest-side-c/side-rostlaube';
import { part as p303 } from './quest-side-c/side-strom-fuer-die-rohre';
import { part as p304 } from './quest-side-c/side-wand-der-freiheit';
import { part as p305 } from './system/abilities-items';
import { part as p306 } from './system/checks';
import { part as p307 } from './system/cyberware';
import { part as p308 } from './system/items-andenken';
import { part as p309 } from './system/items-cyberware';
import { part as p310 } from './system/items-geschenke';
import { part as p311 } from './system/items-kleidung';
import { part as p312 } from './system/items-quest';
import { part as p313 } from './system/items-sammeln';
import { part as p314 } from './system/items-verbrauch';
import { part as p315 } from './system/items-waffen';
import { part as p316 } from './system/shops';
import { part as p317 } from './vexaria/akt2';
import { part as p318 } from './vexaria/akt3';
import { part as p319 } from './vexaria/aria';
import { part as p320 } from './vexaria/aria-akt1';
import { part as p321 } from './vexaria/bruch';
import { part as p322 } from './vexaria/danach';
import { part as p323 } from './vexaria/enden';
import { part as p324 } from './vexaria/funken';
import { part as p325 } from './vexaria/hoehepunkt';
import { part as p326 } from './vexaria/krise';
import { part as p327 } from './vexaria/nachspiel';
import { part as p328 } from './vexaria/rivalinnen';
import { part as p329 } from './vexaria/system';
import { part as p330 } from './vexaria/versoehnung';
import { part as p331 } from './vexaria/zerberster';
import { part as p332 } from './world-23/barks-23';
import { part as p333 } from './world-23/drohnen-23';
import { part as p334 } from './world-23/nachrichten-23';
import { part as p335 } from './world-23/passanten-23';
import { part as p336 } from './world-23/quartier-23';
import { part as p337 } from './world-23/stadtereignisse-23';
import { part as p338 } from './world-23/telefon-23';
import { part as p339 } from './world/bezirke-fraktionen';
import { part as p340 } from './world/nachrichten';
import { part as p341 } from './world/quartier';
import { part as p342 } from './world/stadtereignisse';
import { part as p343 } from './world/telefon';

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
  ['integration/luecken', p15],
  ['maps-23/aussiedlerhof', p16],
  ['maps-23/blades-buero', p17],
  ['maps-23/chrome-auftraege', p18],
  ['maps-23/chrome-boulevard', p19],
  ['maps-23/das-meer', p20],
  ['maps-23/datentunnel', p21],
  ['maps-23/funkturm-ruine', p22],
  ['maps-23/glasduenen', p23],
  ['maps-23/himmelsgarten', p24],
  ['maps-23/pumpwerk-sieben', p25],
  ['maps-23/quantum-campus', p26],
  ['maps-23/quantum-foyer', p27],
  ['maps-23/quantum-labor', p28],
  ['maps-23/rennhalle-9', p29],
  ['maps-23/rudis-diner', p30],
  ['maps-23/server-kern', p31],
  ['maps-23/shops-chrome-himmel', p32],
  ['maps-23/shops-meer', p33],
  ['maps-23/shops-oednis-hof', p34],
  ['maps-23/shops-quantum', p35],
  ['maps-23/shops-staubstrasse', p36],
  ['maps-23/staubstrasse', p37],
  ['maps/bahnhof-mitte', p38],
  ['maps/cafe-sahnehaube', p39],
  ['maps/chrome-penthouse', p40],
  ['maps/crew-quartier', p41],
  ['maps/dantes-werkstatt', p42],
  ['maps/das-nest', p43],
  ['maps/digitech-areal', p44],
  ['maps/digitech-tresor', p45],
  ['maps/eisenhof', p46],
  ['maps/flutmauer', p47],
  ['maps/fundbuero', p48],
  ['maps/gerichtssaal', p49],
  ['maps/glasarkaden', p50],
  ['maps/hafenkante', p51],
  ['maps/hausboot-nebelhorn', p52],
  ['maps/high-voltage', p53],
  ['maps/hv-hinterzimmer', p54],
  ['maps/kanal-sammler', p55],
  ['maps/loetgassen', p56],
  ['maps/loetzinn-laden', p57],
  ['maps/neon-gasse', p58],
  ['maps/netzcafe-datenkruemel', p59],
  ['maps/nx1-studio', p60],
  ['maps/quantum-schauraum', p61],
  ['maps/ripper-praxis', p62],
  ['maps/rohrsiedlung', p63],
  ['maps/schrottmarkt', p64],
  ['maps/stufenplatz', p65],
  ['maps/suppenkueche', p66],
  ['maps/ubahn-wagen', p67],
  ['maps/zellentrakt', p68],
  ['npc-crew-a/dante', p69],
  ['npc-crew-a/hunter', p70],
  ['npc-crew-a/paar', p71],
  ['npc-crew-a/raven', p72],
  ['npc-crew-b/begleiter-23', p73],
  ['npc-crew-b/captain-kuschel', p74],
  ['npc-crew-b/jimmy', p75],
  ['npc-crew-b/nyra', p76],
  ['npc-crew-b/vega', p77],
  ['npc-kinder-alte/daria', p78],
  ['npc-kinder-alte/daria-akt23', p79],
  ['npc-kinder-alte/freya', p80],
  ['npc-kinder-alte/freya-akt23', p81],
  ['npc-kinder-alte/jakko', p82],
  ['npc-kinder-alte/jakko-akt23', p83],
  ['npc-kinder-alte/oma-volt', p84],
  ['npc-kinder-alte/oma-volt-akt23', p85],
  ['npc-kinder-alte/opa-gustav', p86],
  ['npc-kinder-alte/opa-gustav-akt23', p87],
  ['npc-medien-club/barkeeper', p88],
  ['npc-medien-club/collin-charleston', p89],
  ['npc-medien-club/delya-delloraine', p90],
  ['npc-medien-club/kameramann', p91],
  ['npc-medien-club/ripper', p92],
  ['npc-oednis/elsa', p93],
  ['npc-oednis/folgen', p94],
  ['npc-oednis/glasblaeserin', p95],
  ['npc-oednis/krabbe-karl', p96],
  ['npc-oednis/kraehe', p97],
  ['npc-oednis/opa-funk', p98],
  ['npc-oednis/rudi', p99],
  ['npc-oednis/schlafwandler', p100],
  ['npc-oednis/statisten', p101],
  ['npc-oednis/staubbaron-broesel', p102],
  ['npc-ordnung-markt/babette-bao', p103],
  ['npc-ordnung-markt/dexter', p104],
  ['npc-ordnung-markt/kiki-karbon', p105],
  ['npc-ordnung-markt/richter', p106],
  ['npc-ordnung-markt/wache', p107],
  ['npc-quantum/alesa-zero', p108],
  ['npc-quantum/bijou', p109],
  ['npc-quantum/blade', p110],
  ['npc-quantum/fraeulein-pixel', p111],
  ['npc-quantum/ki-nexus', p112],
  ['npc-quantum/leutnant-nadel', p113],
  ['npc-quantum/mila', p114],
  ['npc-quantum/pfeffer', p115],
  ['npc-quantum/portier-albert', p116],
  ['npc-quantum/seraphina-chrome', p117],
  ['npc-quantum/serenity-chrome', p118],
  ['npc-quantum/stylistin-gina', p119],
  ['npc-quantum/sybella-chrome', p120],
  ['npc-quantum/xion-venom', p121],
  ['npc-unterstadt/bolzen', p122],
  ['npc-unterstadt/buergermeister-gully', p123],
  ['npc-unterstadt/kaeptn-nebelhorn', p124],
  ['npc-unterstadt/lio-funkel', p125],
  ['npc-unterstadt/marla-sand', p126],
  ['npc-unterstadt/pim-pinzette', p127],
  ['npc-welt/barista-perle', p128],
  ['npc-welt/bruder-kabellos', p129],
  ['npc-welt/bruno-brecher', p130],
  ['npc-welt/direktorin-hartlauf', p131],
  ['npc-welt/dj-lumo', p132],
  ['npc-welt/dr-winkel', p133],
  ['npc-welt/falke', p134],
  ['npc-welt/fluss-frieda', p135],
  ['npc-welt/frau-klingel', p136],
  ['npc-welt/frau-takt', p137],
  ['npc-welt/fx-60', p138],
  ['npc-welt/gerda-gleis', p139],
  ['npc-welt/gutschein-gerd', p140],
  ['npc-welt/hafen-hannes', p141],
  ['npc-welt/henk-angler', p142],
  ['npc-welt/herr-blitz', p143],
  ['npc-welt/herr-glanz', p144],
  ['npc-welt/knuspi', p145],
  ['npc-welt/knut', p146],
  ['npc-welt/kurt', p147],
  ['npc-welt/madame-satin', p148],
  ['npc-welt/meister-watt', p149],
  ['npc-welt/mira-loetzinn', p150],
  ['npc-welt/mixi', p151],
  ['npc-welt/mutter-bruehe', p152],
  ['npc-welt/ole-gaehn', p153],
  ['npc-welt/opa-blech', p154],
  ['npc-welt/opa-gurrmann', p155],
  ['npc-welt/paul', p156],
  ['npc-welt/salzige-grete', p157],
  ['npc-welt/sina-spray', p158],
  ['npc-welt/turbo-tilda', p159],
  ['npc-welt/vex-schrapnell', p160],
  ['npc-welt/vinyl-vincent', p161],
  ['npc-welt/wett-willi', p162],
  ['quest-enden/abspann', p163],
  ['quest-enden/enden', p164],
  ['quest-enden/epilog-karten', p165],
  ['quest-enden/nachspiel', p166],
  ['quest-enden/side-offene-werkstatt', p167],
  ['quest-enden/side-strandclub', p168],
  ['quest-enden/side-zweite-chance', p169],
  ['quest-enden/sonder-chrome-tresor', p170],
  ['quest-enden/sonder-konvoi-nougat', p171],
  ['quest-enden/sonder-letzte-runde', p172],
  ['quest-enden/sonder-pumpwerk-pegel', p173],
  ['quest-enden/sonder-tafel', p174],
  ['quest-main-2/freie-phase', p175],
  ['quest-main-2/main-2-bruch', p176],
  ['quest-main-2/main-2-countdown', p177],
  ['quest-main-2/main-2-kanal', p178],
  ['quest-main-2/main-2-krisensitzung', p179],
  ['quest-main-2/planungstafel-party', p180],
  ['quest-main-2/prep-ausweise', p181],
  ['quest-main-2/prep-fahrzeug', p182],
  ['quest-main-2/prep-gaesteliste', p183],
  ['quest-main-2/prep-gegenmittel', p184],
  ['quest-main-2/prep-outfits', p185],
  ['quest-main-2/prep-turm-plan', p186],
  ['quest-main-3/main-3-blade', p187],
  ['quest-main-3/main-3-einlass', p188],
  ['quest-main-3/main-3-gedankenkontrolle', p189],
  ['quest-main-3/main-3-labor', p190],
  ['quest-main-3/main-3-nexus', p191],
  ['quest-main-a/main-0-digitech', p192],
  ['quest-main-a/main-1-ankunft', p193],
  ['quest-main-a/main-1-dexter', p194],
  ['quest-main-a/main-1-probezeit', p195],
  ['quest-main-b/main-1-auf-raven', p196],
  ['quest-main-b/main-1-dante', p197],
  ['quest-main-b/main-1-der-plan', p198],
  ['quest-main-b/main-1-raven', p199],
  ['quest-main-b/planungstafel', p200],
  ['quest-main-b/prep-ablenkung', p201],
  ['quest-main-b/prep-fluchtweg', p202],
  ['quest-main-b/prep-grundriss', p203],
  ['quest-main-b/prep-wachplan', p204],
  ['quest-main-b/prep-zugangskarte', p205],
  ['quest-pers-23/auftraege-23', p206],
  ['quest-pers-23/kopfgeld-stufe3', p207],
  ['quest-pers-23/pers-alesa-wasserfilter', p208],
  ['quest-pers-23/pers-blade-teddymantel', p209],
  ['quest-pers-23/pers-collin-pixel', p210],
  ['quest-pers-23/pers-delya-quelle', p211],
  ['quest-pers-23/pers-gustav-alte-liebe', p212],
  ['quest-pers-23/pers-ki-nexus-seele', p213],
  ['quest-pers-23/pers-marla-brunnen', p214],
  ['quest-pers-23/pers-pim-kleine-schrift', p215],
  ['quest-pers-23/pers-ripper-taschenuhr', p216],
  ['quest-pers-23/pers-seraphina-plan-b', p217],
  ['quest-pers-23/pers-serenity-gewaechshaus', p218],
  ['quest-pers-23/pers-sybella-schnaeppchen', p219],
  ['quest-pers-23/pers-xion-umschulung', p220],
  ['quest-pers-jobs/dinge', p221],
  ['quest-pers-jobs/figuren', p222],
  ['quest-pers-jobs/job-bergung', p223],
  ['quest-pers-jobs/job-datenraub', p224],
  ['quest-pers-jobs/job-eskorte', p225],
  ['quest-pers-jobs/job-kanal', p226],
  ['quest-pers-jobs/job-kopfgeld', p227],
  ['quest-pers-jobs/job-kurier', p228],
  ['quest-pers-jobs/job-schulden', p229],
  ['quest-pers-jobs/job-tuersteher', p230],
  ['quest-pers-jobs/kopfgeld-der-kassierer', p231],
  ['quest-pers-jobs/kopfgeld-graf-gully-zwei', p232],
  ['quest-pers-jobs/kopfgeld-krawall-kalle', p233],
  ['quest-pers-jobs/kopfgeld-loetkolben-lola', p234],
  ['quest-pers-jobs/kopfgeld-neon-nils', p235],
  ['quest-pers-jobs/kopfgeld-oma-turbo', p236],
  ['quest-pers-jobs/kopfgeld-toaster', p237],
  ['quest-pers-jobs/kopfgeld-zwei-finger-zoltan', p238],
  ['quest-pers-jobs/pers-babette-markttag', p239],
  ['quest-pers-jobs/pers-barkeeper-letzter-vers', p240],
  ['quest-pers-jobs/pers-bolzen-bein', p241],
  ['quest-pers-jobs/pers-dante-erstpressung', p242],
  ['quest-pers-jobs/pers-daria-botendienst', p243],
  ['quest-pers-jobs/pers-dexter-schuldenfrei', p244],
  ['quest-pers-jobs/pers-freya-fairer-lohn', p245],
  ['quest-pers-jobs/pers-hunter-reiner-tisch', p246],
  ['quest-pers-jobs/pers-jakko-kochbuch', p247],
  ['quest-pers-jobs/pers-kameramann-ungeschminkt', p248],
  ['quest-pers-jobs/pers-kiki-reichweite', p249],
  ['quest-pers-jobs/pers-kinder-wasserturm', p250],
  ['quest-pers-jobs/pers-kuschel-ohrenflick', p251],
  ['quest-pers-jobs/pers-lio-album', p252],
  ['quest-pers-jobs/pers-nebelhorn-letzte-faehre', p253],
  ['quest-pers-jobs/pers-richter-goldene-gurke', p254],
  ['quest-pers-jobs/tafel-collin', p255],
  ['quest-pers-jobs/tafel-dante', p256],
  ['quest-pers-jobs/tafel-gully', p257],
  ['quest-pers-jobs/tafel-hunter', p258],
  ['quest-side-23-a/pers-nyra-silent-angel', p259],
  ['quest-side-23-a/side-alesas-zuendholz', p260],
  ['quest-side-23-a/side-captain-kuschel', p261],
  ['quest-side-23-a/side-ki-fluestern', p262],
  ['quest-side-23-a/side-teekraenzchen', p263],
  ['quest-side-23-a/side-weg-zum-meer', p264],
  ['quest-side-23-a/side-xions-kralle', p265],
  ['quest-side-23-b/side-chrome-pudel', p266],
  ['quest-side-23-b/side-glasherz', p267],
  ['quest-side-23-b/side-hartlaufs-rache', p268],
  ['quest-side-23-b/side-kraehes-ehre', p269],
  ['quest-side-23-b/side-oednis-frieden', p270],
  ['quest-side-23-b/side-rostzaehne-ende', p271],
  ['quest-side-23-b/side-verlorene-frequenz', p272],
  ['quest-side-a/side-chrome-10', p273],
  ['quest-side-a/side-eingehendes-fax', p274],
  ['quest-side-a/side-eins-turnier', p275],
  ['quest-side-a/side-feierabend-fuer-kessel', p276],
  ['quest-side-a/side-jimmys-chip', p277],
  ['quest-side-a/side-keksalarm', p278],
  ['quest-side-a/side-live-dabei', p279],
  ['quest-side-a/side-riegel-krise', p280],
  ['quest-side-a/side-schallplatten', p281],
  ['quest-side-a/side-uebliche-verspaetung', p282],
  ['quest-side-a/side-zehn-credits', p283],
  ['quest-side-b/pers-vega-adlerauge', p284],
  ['quest-side-b/side-abzieher', p285],
  ['quest-side-b/side-digitech-geist', p286],
  ['quest-side-b/side-drohnenrennen', p287],
  ['quest-side-b/side-hunde-der-brackbucht', p288],
  ['quest-side-b/side-neon-limo', p289],
  ['quest-side-b/side-oma-volts-lager', p290],
  ['quest-side-b/side-rattenkoenig', p291],
  ['quest-side-b/side-streaming-suenden', p292],
  ['quest-side-b/side-thai-chi', p293],
  ['quest-side-b/side-zweite-hand', p294],
  ['quest-side-c/pers-aria-lieblingsshirt', p295],
  ['quest-side-c/pers-raven-handschellen', p296],
  ['quest-side-c/side-alte-gewohnheiten', p297],
  ['quest-side-c/side-collins-peruecke', p298],
  ['quest-side-c/side-container-77', p299],
  ['quest-side-c/side-lumos-platte', p300],
  ['quest-side-c/side-rettung-am-rechen', p301],
  ['quest-side-c/side-rostlaube', p302],
  ['quest-side-c/side-strom-fuer-die-rohre', p303],
  ['quest-side-c/side-wand-der-freiheit', p304],
  ['system/abilities-items', p305],
  ['system/checks', p306],
  ['system/cyberware', p307],
  ['system/items-andenken', p308],
  ['system/items-cyberware', p309],
  ['system/items-geschenke', p310],
  ['system/items-kleidung', p311],
  ['system/items-quest', p312],
  ['system/items-sammeln', p313],
  ['system/items-verbrauch', p314],
  ['system/items-waffen', p315],
  ['system/shops', p316],
  ['vexaria/akt2', p317],
  ['vexaria/akt3', p318],
  ['vexaria/aria', p319],
  ['vexaria/aria-akt1', p320],
  ['vexaria/bruch', p321],
  ['vexaria/danach', p322],
  ['vexaria/enden', p323],
  ['vexaria/funken', p324],
  ['vexaria/hoehepunkt', p325],
  ['vexaria/krise', p326],
  ['vexaria/nachspiel', p327],
  ['vexaria/rivalinnen', p328],
  ['vexaria/system', p329],
  ['vexaria/versoehnung', p330],
  ['vexaria/zerberster', p331],
  ['world-23/barks-23', p332],
  ['world-23/drohnen-23', p333],
  ['world-23/nachrichten-23', p334],
  ['world-23/passanten-23', p335],
  ['world-23/quartier-23', p336],
  ['world-23/stadtereignisse-23', p337],
  ['world-23/telefon-23', p338],
  ['world/bezirke-fraktionen', p339],
  ['world/nachrichten', p340],
  ['world/quartier', p341],
  ['world/stadtereignisse', p342],
  ['world/telefon', p343],
];
