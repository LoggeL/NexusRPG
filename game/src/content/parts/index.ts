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
import { part as p129 } from './npc-welt/barista-perle-akt23';
import { part as p130 } from './npc-welt/bruder-kabellos';
import { part as p131 } from './npc-welt/bruder-kabellos-akt23';
import { part as p132 } from './npc-welt/bruno-brecher';
import { part as p133 } from './npc-welt/bruno-brecher-akt23';
import { part as p134 } from './npc-welt/direktorin-hartlauf';
import { part as p135 } from './npc-welt/direktorin-hartlauf-akt23';
import { part as p136 } from './npc-welt/dj-lumo';
import { part as p137 } from './npc-welt/dj-lumo-akt23';
import { part as p138 } from './npc-welt/dr-winkel';
import { part as p139 } from './npc-welt/dr-winkel-akt23';
import { part as p140 } from './npc-welt/falke';
import { part as p141 } from './npc-welt/falke-akt23';
import { part as p142 } from './npc-welt/fluss-frieda';
import { part as p143 } from './npc-welt/frau-klingel';
import { part as p144 } from './npc-welt/frau-klingel-akt23';
import { part as p145 } from './npc-welt/frau-takt';
import { part as p146 } from './npc-welt/frau-takt-akt23';
import { part as p147 } from './npc-welt/fx-60';
import { part as p148 } from './npc-welt/fx-60-akt23';
import { part as p149 } from './npc-welt/gerda-gleis';
import { part as p150 } from './npc-welt/gerda-gleis-akt23';
import { part as p151 } from './npc-welt/gutschein-gerd';
import { part as p152 } from './npc-welt/gutschein-gerd-akt23';
import { part as p153 } from './npc-welt/hafen-hannes';
import { part as p154 } from './npc-welt/henk-angler';
import { part as p155 } from './npc-welt/henk-angler-akt23';
import { part as p156 } from './npc-welt/herr-blitz';
import { part as p157 } from './npc-welt/herr-blitz-akt23';
import { part as p158 } from './npc-welt/herr-glanz';
import { part as p159 } from './npc-welt/herr-glanz-akt23';
import { part as p160 } from './npc-welt/knuspi';
import { part as p161 } from './npc-welt/knuspi-akt23';
import { part as p162 } from './npc-welt/knut';
import { part as p163 } from './npc-welt/knut-akt23';
import { part as p164 } from './npc-welt/kurt';
import { part as p165 } from './npc-welt/kurt-akt23';
import { part as p166 } from './npc-welt/madame-satin';
import { part as p167 } from './npc-welt/meister-watt';
import { part as p168 } from './npc-welt/mira-loetzinn';
import { part as p169 } from './npc-welt/mixi';
import { part as p170 } from './npc-welt/mutter-bruehe';
import { part as p171 } from './npc-welt/ole-gaehn';
import { part as p172 } from './npc-welt/opa-blech';
import { part as p173 } from './npc-welt/opa-gurrmann';
import { part as p174 } from './npc-welt/paul';
import { part as p175 } from './npc-welt/salzige-grete';
import { part as p176 } from './npc-welt/sina-spray';
import { part as p177 } from './npc-welt/turbo-tilda';
import { part as p178 } from './npc-welt/vex-schrapnell';
import { part as p179 } from './npc-welt/vinyl-vincent';
import { part as p180 } from './npc-welt/wett-willi';
import { part as p181 } from './quest-enden/abspann';
import { part as p182 } from './quest-enden/enden';
import { part as p183 } from './quest-enden/epilog-karten';
import { part as p184 } from './quest-enden/nachspiel';
import { part as p185 } from './quest-enden/side-offene-werkstatt';
import { part as p186 } from './quest-enden/side-strandclub';
import { part as p187 } from './quest-enden/side-zweite-chance';
import { part as p188 } from './quest-enden/sonder-chrome-tresor';
import { part as p189 } from './quest-enden/sonder-konvoi-nougat';
import { part as p190 } from './quest-enden/sonder-letzte-runde';
import { part as p191 } from './quest-enden/sonder-pumpwerk-pegel';
import { part as p192 } from './quest-enden/sonder-tafel';
import { part as p193 } from './quest-main-2/freie-phase';
import { part as p194 } from './quest-main-2/main-2-bruch';
import { part as p195 } from './quest-main-2/main-2-countdown';
import { part as p196 } from './quest-main-2/main-2-kanal';
import { part as p197 } from './quest-main-2/main-2-krisensitzung';
import { part as p198 } from './quest-main-2/planungstafel-party';
import { part as p199 } from './quest-main-2/prep-ausweise';
import { part as p200 } from './quest-main-2/prep-fahrzeug';
import { part as p201 } from './quest-main-2/prep-gaesteliste';
import { part as p202 } from './quest-main-2/prep-gegenmittel';
import { part as p203 } from './quest-main-2/prep-outfits';
import { part as p204 } from './quest-main-2/prep-turm-plan';
import { part as p205 } from './quest-main-3/main-3-blade';
import { part as p206 } from './quest-main-3/main-3-einlass';
import { part as p207 } from './quest-main-3/main-3-gedankenkontrolle';
import { part as p208 } from './quest-main-3/main-3-labor';
import { part as p209 } from './quest-main-3/main-3-nexus';
import { part as p210 } from './quest-main-a/main-0-digitech';
import { part as p211 } from './quest-main-a/main-1-ankunft';
import { part as p212 } from './quest-main-a/main-1-dexter';
import { part as p213 } from './quest-main-a/main-1-probezeit';
import { part as p214 } from './quest-main-b/main-1-auf-raven';
import { part as p215 } from './quest-main-b/main-1-dante';
import { part as p216 } from './quest-main-b/main-1-der-plan';
import { part as p217 } from './quest-main-b/main-1-raven';
import { part as p218 } from './quest-main-b/planungstafel';
import { part as p219 } from './quest-main-b/prep-ablenkung';
import { part as p220 } from './quest-main-b/prep-fluchtweg';
import { part as p221 } from './quest-main-b/prep-grundriss';
import { part as p222 } from './quest-main-b/prep-wachplan';
import { part as p223 } from './quest-main-b/prep-zugangskarte';
import { part as p224 } from './quest-pers-23/auftraege-23';
import { part as p225 } from './quest-pers-23/kopfgeld-stufe3';
import { part as p226 } from './quest-pers-23/pers-alesa-wasserfilter';
import { part as p227 } from './quest-pers-23/pers-blade-teddymantel';
import { part as p228 } from './quest-pers-23/pers-collin-pixel';
import { part as p229 } from './quest-pers-23/pers-delya-quelle';
import { part as p230 } from './quest-pers-23/pers-gustav-alte-liebe';
import { part as p231 } from './quest-pers-23/pers-ki-nexus-seele';
import { part as p232 } from './quest-pers-23/pers-marla-brunnen';
import { part as p233 } from './quest-pers-23/pers-pim-kleine-schrift';
import { part as p234 } from './quest-pers-23/pers-ripper-taschenuhr';
import { part as p235 } from './quest-pers-23/pers-seraphina-plan-b';
import { part as p236 } from './quest-pers-23/pers-serenity-gewaechshaus';
import { part as p237 } from './quest-pers-23/pers-sybella-schnaeppchen';
import { part as p238 } from './quest-pers-23/pers-xion-umschulung';
import { part as p239 } from './quest-pers-jobs/dinge';
import { part as p240 } from './quest-pers-jobs/figuren';
import { part as p241 } from './quest-pers-jobs/job-bergung';
import { part as p242 } from './quest-pers-jobs/job-datenraub';
import { part as p243 } from './quest-pers-jobs/job-eskorte';
import { part as p244 } from './quest-pers-jobs/job-kanal';
import { part as p245 } from './quest-pers-jobs/job-kopfgeld';
import { part as p246 } from './quest-pers-jobs/job-kurier';
import { part as p247 } from './quest-pers-jobs/job-schulden';
import { part as p248 } from './quest-pers-jobs/job-tuersteher';
import { part as p249 } from './quest-pers-jobs/kopfgeld-der-kassierer';
import { part as p250 } from './quest-pers-jobs/kopfgeld-graf-gully-zwei';
import { part as p251 } from './quest-pers-jobs/kopfgeld-krawall-kalle';
import { part as p252 } from './quest-pers-jobs/kopfgeld-loetkolben-lola';
import { part as p253 } from './quest-pers-jobs/kopfgeld-neon-nils';
import { part as p254 } from './quest-pers-jobs/kopfgeld-oma-turbo';
import { part as p255 } from './quest-pers-jobs/kopfgeld-toaster';
import { part as p256 } from './quest-pers-jobs/kopfgeld-zwei-finger-zoltan';
import { part as p257 } from './quest-pers-jobs/pers-babette-markttag';
import { part as p258 } from './quest-pers-jobs/pers-barkeeper-letzter-vers';
import { part as p259 } from './quest-pers-jobs/pers-bolzen-bein';
import { part as p260 } from './quest-pers-jobs/pers-dante-erstpressung';
import { part as p261 } from './quest-pers-jobs/pers-daria-botendienst';
import { part as p262 } from './quest-pers-jobs/pers-dexter-schuldenfrei';
import { part as p263 } from './quest-pers-jobs/pers-freya-fairer-lohn';
import { part as p264 } from './quest-pers-jobs/pers-hunter-reiner-tisch';
import { part as p265 } from './quest-pers-jobs/pers-jakko-kochbuch';
import { part as p266 } from './quest-pers-jobs/pers-kameramann-ungeschminkt';
import { part as p267 } from './quest-pers-jobs/pers-kiki-reichweite';
import { part as p268 } from './quest-pers-jobs/pers-kinder-wasserturm';
import { part as p269 } from './quest-pers-jobs/pers-kuschel-ohrenflick';
import { part as p270 } from './quest-pers-jobs/pers-lio-album';
import { part as p271 } from './quest-pers-jobs/pers-nebelhorn-letzte-faehre';
import { part as p272 } from './quest-pers-jobs/pers-richter-goldene-gurke';
import { part as p273 } from './quest-pers-jobs/tafel-collin';
import { part as p274 } from './quest-pers-jobs/tafel-dante';
import { part as p275 } from './quest-pers-jobs/tafel-gully';
import { part as p276 } from './quest-pers-jobs/tafel-hunter';
import { part as p277 } from './quest-side-23-a/pers-nyra-silent-angel';
import { part as p278 } from './quest-side-23-a/side-alesas-zuendholz';
import { part as p279 } from './quest-side-23-a/side-captain-kuschel';
import { part as p280 } from './quest-side-23-a/side-ki-fluestern';
import { part as p281 } from './quest-side-23-a/side-teekraenzchen';
import { part as p282 } from './quest-side-23-a/side-weg-zum-meer';
import { part as p283 } from './quest-side-23-a/side-xions-kralle';
import { part as p284 } from './quest-side-23-b/side-chrome-pudel';
import { part as p285 } from './quest-side-23-b/side-glasherz';
import { part as p286 } from './quest-side-23-b/side-hartlaufs-rache';
import { part as p287 } from './quest-side-23-b/side-kraehes-ehre';
import { part as p288 } from './quest-side-23-b/side-oednis-frieden';
import { part as p289 } from './quest-side-23-b/side-rostzaehne-ende';
import { part as p290 } from './quest-side-23-b/side-verlorene-frequenz';
import { part as p291 } from './quest-side-a/side-chrome-10';
import { part as p292 } from './quest-side-a/side-eingehendes-fax';
import { part as p293 } from './quest-side-a/side-eins-turnier';
import { part as p294 } from './quest-side-a/side-feierabend-fuer-kessel';
import { part as p295 } from './quest-side-a/side-jimmys-chip';
import { part as p296 } from './quest-side-a/side-keksalarm';
import { part as p297 } from './quest-side-a/side-live-dabei';
import { part as p298 } from './quest-side-a/side-riegel-krise';
import { part as p299 } from './quest-side-a/side-schallplatten';
import { part as p300 } from './quest-side-a/side-uebliche-verspaetung';
import { part as p301 } from './quest-side-a/side-zehn-credits';
import { part as p302 } from './quest-side-b/pers-vega-adlerauge';
import { part as p303 } from './quest-side-b/side-abzieher';
import { part as p304 } from './quest-side-b/side-digitech-geist';
import { part as p305 } from './quest-side-b/side-drohnenrennen';
import { part as p306 } from './quest-side-b/side-hunde-der-brackbucht';
import { part as p307 } from './quest-side-b/side-neon-limo';
import { part as p308 } from './quest-side-b/side-oma-volts-lager';
import { part as p309 } from './quest-side-b/side-rattenkoenig';
import { part as p310 } from './quest-side-b/side-streaming-suenden';
import { part as p311 } from './quest-side-b/side-thai-chi';
import { part as p312 } from './quest-side-b/side-zweite-hand';
import { part as p313 } from './quest-side-c/pers-aria-lieblingsshirt';
import { part as p314 } from './quest-side-c/pers-raven-handschellen';
import { part as p315 } from './quest-side-c/side-alte-gewohnheiten';
import { part as p316 } from './quest-side-c/side-collins-peruecke';
import { part as p317 } from './quest-side-c/side-container-77';
import { part as p318 } from './quest-side-c/side-lumos-platte';
import { part as p319 } from './quest-side-c/side-rettung-am-rechen';
import { part as p320 } from './quest-side-c/side-rostlaube';
import { part as p321 } from './quest-side-c/side-strom-fuer-die-rohre';
import { part as p322 } from './quest-side-c/side-wand-der-freiheit';
import { part as p323 } from './system/abilities-items';
import { part as p324 } from './system/checks';
import { part as p325 } from './system/cyberware';
import { part as p326 } from './system/items-andenken';
import { part as p327 } from './system/items-cyberware';
import { part as p328 } from './system/items-geschenke';
import { part as p329 } from './system/items-kleidung';
import { part as p330 } from './system/items-quest';
import { part as p331 } from './system/items-sammeln';
import { part as p332 } from './system/items-verbrauch';
import { part as p333 } from './system/items-waffen';
import { part as p334 } from './system/shops';
import { part as p335 } from './vexaria/akt2';
import { part as p336 } from './vexaria/akt3';
import { part as p337 } from './vexaria/aria';
import { part as p338 } from './vexaria/aria-akt1';
import { part as p339 } from './vexaria/baukasten-naechte';
import { part as p340 } from './vexaria/bruch';
import { part as p341 } from './vexaria/danach';
import { part as p342 } from './vexaria/enden';
import { part as p343 } from './vexaria/funken';
import { part as p344 } from './vexaria/hoehepunkt';
import { part as p345 } from './vexaria/krise';
import { part as p346 } from './vexaria/nachspiel';
import { part as p347 } from './vexaria/rivalinnen';
import { part as p348 } from './vexaria/system';
import { part as p349 } from './vexaria/versoehnung';
import { part as p350 } from './vexaria/zerberster';
import { part as p351 } from './world-23/barks-23';
import { part as p352 } from './world-23/drohnen-23';
import { part as p353 } from './world-23/nachrichten-23';
import { part as p354 } from './world-23/passanten-23';
import { part as p355 } from './world-23/quartier-23';
import { part as p356 } from './world-23/stadtereignisse-23';
import { part as p357 } from './world-23/telefon-23';
import { part as p358 } from './world/bezirke-fraktionen';
import { part as p359 } from './world/nachrichten';
import { part as p360 } from './world/quartier';
import { part as p361 } from './world/stadtereignisse';
import { part as p362 } from './world/telefon';

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
  ['npc-welt/barista-perle-akt23', p129],
  ['npc-welt/bruder-kabellos', p130],
  ['npc-welt/bruder-kabellos-akt23', p131],
  ['npc-welt/bruno-brecher', p132],
  ['npc-welt/bruno-brecher-akt23', p133],
  ['npc-welt/direktorin-hartlauf', p134],
  ['npc-welt/direktorin-hartlauf-akt23', p135],
  ['npc-welt/dj-lumo', p136],
  ['npc-welt/dj-lumo-akt23', p137],
  ['npc-welt/dr-winkel', p138],
  ['npc-welt/dr-winkel-akt23', p139],
  ['npc-welt/falke', p140],
  ['npc-welt/falke-akt23', p141],
  ['npc-welt/fluss-frieda', p142],
  ['npc-welt/frau-klingel', p143],
  ['npc-welt/frau-klingel-akt23', p144],
  ['npc-welt/frau-takt', p145],
  ['npc-welt/frau-takt-akt23', p146],
  ['npc-welt/fx-60', p147],
  ['npc-welt/fx-60-akt23', p148],
  ['npc-welt/gerda-gleis', p149],
  ['npc-welt/gerda-gleis-akt23', p150],
  ['npc-welt/gutschein-gerd', p151],
  ['npc-welt/gutschein-gerd-akt23', p152],
  ['npc-welt/hafen-hannes', p153],
  ['npc-welt/henk-angler', p154],
  ['npc-welt/henk-angler-akt23', p155],
  ['npc-welt/herr-blitz', p156],
  ['npc-welt/herr-blitz-akt23', p157],
  ['npc-welt/herr-glanz', p158],
  ['npc-welt/herr-glanz-akt23', p159],
  ['npc-welt/knuspi', p160],
  ['npc-welt/knuspi-akt23', p161],
  ['npc-welt/knut', p162],
  ['npc-welt/knut-akt23', p163],
  ['npc-welt/kurt', p164],
  ['npc-welt/kurt-akt23', p165],
  ['npc-welt/madame-satin', p166],
  ['npc-welt/meister-watt', p167],
  ['npc-welt/mira-loetzinn', p168],
  ['npc-welt/mixi', p169],
  ['npc-welt/mutter-bruehe', p170],
  ['npc-welt/ole-gaehn', p171],
  ['npc-welt/opa-blech', p172],
  ['npc-welt/opa-gurrmann', p173],
  ['npc-welt/paul', p174],
  ['npc-welt/salzige-grete', p175],
  ['npc-welt/sina-spray', p176],
  ['npc-welt/turbo-tilda', p177],
  ['npc-welt/vex-schrapnell', p178],
  ['npc-welt/vinyl-vincent', p179],
  ['npc-welt/wett-willi', p180],
  ['quest-enden/abspann', p181],
  ['quest-enden/enden', p182],
  ['quest-enden/epilog-karten', p183],
  ['quest-enden/nachspiel', p184],
  ['quest-enden/side-offene-werkstatt', p185],
  ['quest-enden/side-strandclub', p186],
  ['quest-enden/side-zweite-chance', p187],
  ['quest-enden/sonder-chrome-tresor', p188],
  ['quest-enden/sonder-konvoi-nougat', p189],
  ['quest-enden/sonder-letzte-runde', p190],
  ['quest-enden/sonder-pumpwerk-pegel', p191],
  ['quest-enden/sonder-tafel', p192],
  ['quest-main-2/freie-phase', p193],
  ['quest-main-2/main-2-bruch', p194],
  ['quest-main-2/main-2-countdown', p195],
  ['quest-main-2/main-2-kanal', p196],
  ['quest-main-2/main-2-krisensitzung', p197],
  ['quest-main-2/planungstafel-party', p198],
  ['quest-main-2/prep-ausweise', p199],
  ['quest-main-2/prep-fahrzeug', p200],
  ['quest-main-2/prep-gaesteliste', p201],
  ['quest-main-2/prep-gegenmittel', p202],
  ['quest-main-2/prep-outfits', p203],
  ['quest-main-2/prep-turm-plan', p204],
  ['quest-main-3/main-3-blade', p205],
  ['quest-main-3/main-3-einlass', p206],
  ['quest-main-3/main-3-gedankenkontrolle', p207],
  ['quest-main-3/main-3-labor', p208],
  ['quest-main-3/main-3-nexus', p209],
  ['quest-main-a/main-0-digitech', p210],
  ['quest-main-a/main-1-ankunft', p211],
  ['quest-main-a/main-1-dexter', p212],
  ['quest-main-a/main-1-probezeit', p213],
  ['quest-main-b/main-1-auf-raven', p214],
  ['quest-main-b/main-1-dante', p215],
  ['quest-main-b/main-1-der-plan', p216],
  ['quest-main-b/main-1-raven', p217],
  ['quest-main-b/planungstafel', p218],
  ['quest-main-b/prep-ablenkung', p219],
  ['quest-main-b/prep-fluchtweg', p220],
  ['quest-main-b/prep-grundriss', p221],
  ['quest-main-b/prep-wachplan', p222],
  ['quest-main-b/prep-zugangskarte', p223],
  ['quest-pers-23/auftraege-23', p224],
  ['quest-pers-23/kopfgeld-stufe3', p225],
  ['quest-pers-23/pers-alesa-wasserfilter', p226],
  ['quest-pers-23/pers-blade-teddymantel', p227],
  ['quest-pers-23/pers-collin-pixel', p228],
  ['quest-pers-23/pers-delya-quelle', p229],
  ['quest-pers-23/pers-gustav-alte-liebe', p230],
  ['quest-pers-23/pers-ki-nexus-seele', p231],
  ['quest-pers-23/pers-marla-brunnen', p232],
  ['quest-pers-23/pers-pim-kleine-schrift', p233],
  ['quest-pers-23/pers-ripper-taschenuhr', p234],
  ['quest-pers-23/pers-seraphina-plan-b', p235],
  ['quest-pers-23/pers-serenity-gewaechshaus', p236],
  ['quest-pers-23/pers-sybella-schnaeppchen', p237],
  ['quest-pers-23/pers-xion-umschulung', p238],
  ['quest-pers-jobs/dinge', p239],
  ['quest-pers-jobs/figuren', p240],
  ['quest-pers-jobs/job-bergung', p241],
  ['quest-pers-jobs/job-datenraub', p242],
  ['quest-pers-jobs/job-eskorte', p243],
  ['quest-pers-jobs/job-kanal', p244],
  ['quest-pers-jobs/job-kopfgeld', p245],
  ['quest-pers-jobs/job-kurier', p246],
  ['quest-pers-jobs/job-schulden', p247],
  ['quest-pers-jobs/job-tuersteher', p248],
  ['quest-pers-jobs/kopfgeld-der-kassierer', p249],
  ['quest-pers-jobs/kopfgeld-graf-gully-zwei', p250],
  ['quest-pers-jobs/kopfgeld-krawall-kalle', p251],
  ['quest-pers-jobs/kopfgeld-loetkolben-lola', p252],
  ['quest-pers-jobs/kopfgeld-neon-nils', p253],
  ['quest-pers-jobs/kopfgeld-oma-turbo', p254],
  ['quest-pers-jobs/kopfgeld-toaster', p255],
  ['quest-pers-jobs/kopfgeld-zwei-finger-zoltan', p256],
  ['quest-pers-jobs/pers-babette-markttag', p257],
  ['quest-pers-jobs/pers-barkeeper-letzter-vers', p258],
  ['quest-pers-jobs/pers-bolzen-bein', p259],
  ['quest-pers-jobs/pers-dante-erstpressung', p260],
  ['quest-pers-jobs/pers-daria-botendienst', p261],
  ['quest-pers-jobs/pers-dexter-schuldenfrei', p262],
  ['quest-pers-jobs/pers-freya-fairer-lohn', p263],
  ['quest-pers-jobs/pers-hunter-reiner-tisch', p264],
  ['quest-pers-jobs/pers-jakko-kochbuch', p265],
  ['quest-pers-jobs/pers-kameramann-ungeschminkt', p266],
  ['quest-pers-jobs/pers-kiki-reichweite', p267],
  ['quest-pers-jobs/pers-kinder-wasserturm', p268],
  ['quest-pers-jobs/pers-kuschel-ohrenflick', p269],
  ['quest-pers-jobs/pers-lio-album', p270],
  ['quest-pers-jobs/pers-nebelhorn-letzte-faehre', p271],
  ['quest-pers-jobs/pers-richter-goldene-gurke', p272],
  ['quest-pers-jobs/tafel-collin', p273],
  ['quest-pers-jobs/tafel-dante', p274],
  ['quest-pers-jobs/tafel-gully', p275],
  ['quest-pers-jobs/tafel-hunter', p276],
  ['quest-side-23-a/pers-nyra-silent-angel', p277],
  ['quest-side-23-a/side-alesas-zuendholz', p278],
  ['quest-side-23-a/side-captain-kuschel', p279],
  ['quest-side-23-a/side-ki-fluestern', p280],
  ['quest-side-23-a/side-teekraenzchen', p281],
  ['quest-side-23-a/side-weg-zum-meer', p282],
  ['quest-side-23-a/side-xions-kralle', p283],
  ['quest-side-23-b/side-chrome-pudel', p284],
  ['quest-side-23-b/side-glasherz', p285],
  ['quest-side-23-b/side-hartlaufs-rache', p286],
  ['quest-side-23-b/side-kraehes-ehre', p287],
  ['quest-side-23-b/side-oednis-frieden', p288],
  ['quest-side-23-b/side-rostzaehne-ende', p289],
  ['quest-side-23-b/side-verlorene-frequenz', p290],
  ['quest-side-a/side-chrome-10', p291],
  ['quest-side-a/side-eingehendes-fax', p292],
  ['quest-side-a/side-eins-turnier', p293],
  ['quest-side-a/side-feierabend-fuer-kessel', p294],
  ['quest-side-a/side-jimmys-chip', p295],
  ['quest-side-a/side-keksalarm', p296],
  ['quest-side-a/side-live-dabei', p297],
  ['quest-side-a/side-riegel-krise', p298],
  ['quest-side-a/side-schallplatten', p299],
  ['quest-side-a/side-uebliche-verspaetung', p300],
  ['quest-side-a/side-zehn-credits', p301],
  ['quest-side-b/pers-vega-adlerauge', p302],
  ['quest-side-b/side-abzieher', p303],
  ['quest-side-b/side-digitech-geist', p304],
  ['quest-side-b/side-drohnenrennen', p305],
  ['quest-side-b/side-hunde-der-brackbucht', p306],
  ['quest-side-b/side-neon-limo', p307],
  ['quest-side-b/side-oma-volts-lager', p308],
  ['quest-side-b/side-rattenkoenig', p309],
  ['quest-side-b/side-streaming-suenden', p310],
  ['quest-side-b/side-thai-chi', p311],
  ['quest-side-b/side-zweite-hand', p312],
  ['quest-side-c/pers-aria-lieblingsshirt', p313],
  ['quest-side-c/pers-raven-handschellen', p314],
  ['quest-side-c/side-alte-gewohnheiten', p315],
  ['quest-side-c/side-collins-peruecke', p316],
  ['quest-side-c/side-container-77', p317],
  ['quest-side-c/side-lumos-platte', p318],
  ['quest-side-c/side-rettung-am-rechen', p319],
  ['quest-side-c/side-rostlaube', p320],
  ['quest-side-c/side-strom-fuer-die-rohre', p321],
  ['quest-side-c/side-wand-der-freiheit', p322],
  ['system/abilities-items', p323],
  ['system/checks', p324],
  ['system/cyberware', p325],
  ['system/items-andenken', p326],
  ['system/items-cyberware', p327],
  ['system/items-geschenke', p328],
  ['system/items-kleidung', p329],
  ['system/items-quest', p330],
  ['system/items-sammeln', p331],
  ['system/items-verbrauch', p332],
  ['system/items-waffen', p333],
  ['system/shops', p334],
  ['vexaria/akt2', p335],
  ['vexaria/akt3', p336],
  ['vexaria/aria', p337],
  ['vexaria/aria-akt1', p338],
  ['vexaria/baukasten-naechte', p339],
  ['vexaria/bruch', p340],
  ['vexaria/danach', p341],
  ['vexaria/enden', p342],
  ['vexaria/funken', p343],
  ['vexaria/hoehepunkt', p344],
  ['vexaria/krise', p345],
  ['vexaria/nachspiel', p346],
  ['vexaria/rivalinnen', p347],
  ['vexaria/system', p348],
  ['vexaria/versoehnung', p349],
  ['vexaria/zerberster', p350],
  ['world-23/barks-23', p351],
  ['world-23/drohnen-23', p352],
  ['world-23/nachrichten-23', p353],
  ['world-23/passanten-23', p354],
  ['world-23/quartier-23', p355],
  ['world-23/stadtereignisse-23', p356],
  ['world-23/telefon-23', p357],
  ['world/bezirke-fraktionen', p358],
  ['world/nachrichten', p359],
  ['world/quartier', p360],
  ['world/stadtereignisse', p361],
  ['world/telefon', p362],
];
