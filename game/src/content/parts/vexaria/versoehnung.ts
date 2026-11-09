// Aria-Strang „Zerberster-Herz“, Akt 2: Station 6 `rom-aria-streit`, Station 7 `rom-aria-vega`, Station 8 `rom-aria-regen`
// und für die Baukasten-Spielfigur Station 9 `rom-aria-kuss` / `he-aria-10` (world.md §4.7), mit Vex-Fassungen
// (Tabelle „Vex-Fassungen“). Für Vex gilt der Kanonweg nur ohne Akt-1-Brücke (`BRUECKE`, siehe _util.ts):
// streit → 7 `rom-vexaria-funkstille` → vega → 8 `rom-vexaria-umdrehen` → regen → 9 `rom-vexaria-kuss` (hoehepunkt.ts).
// Mit Brücke übernimmt krise.ts.
//
// Zähler (system.ts): `aria_streit_t4..t1` („vier Tage seit Station 6“), `aria_krach_t2..t1` (Freundschaftskrach der
// Baukasten-Spielfigur, zwei Tage), `aria_gescheitert_t3..t1` (Streitfolgen enden drei Tage nach dem Misslingen).
import type { ContentPart } from '../../part';
import type { Condition, CutsceneDef, DialogueChoice, DialogueDef, Effect, HeartEventDef } from '../../../modules/contracts';
import {
  a, AKT2, all, ANGEBAHNT, any, BRUECKE, byId, ch, chk, cut, dlg, EPILOG, flag, herz, HEUTE_FREI, msg, n, node, noFlag,
  not, NOT_V, R, s, seen, set, STATION_START, STREIT, twin, V, v, WARTEN_VORBEI, ZUSAMMEN, ZWEI_TAGE,
} from './_util';

const Q_DONE: Condition = { quest: 'pers-aria-zerberster', state: 'done' };
/** Kanonweg: alle außer Vex mit Akt-1-Brücke. */
const KANON: Condition = any(NOT_V, not(BRUECKE));
const DEAL = flag('aria_streit_deal');
const ALLEIN = flag('aria_streit_alleingang');
const SCHAM = flag('aria_streit_scham');
const GEHOERT = flag('aria_streit_gehoert');

// ---------------------------------------------------------------------------
// Station 6 · rom-aria-streit · „Verpiss dich“

const streit = (id: string, rom: boolean): DialogueDef => dlg(id, [
  node('start', [], {
    effects: STATION_START,
    choices: [
      ch('…', 'ausloeser-deal', { when: DEAL }),
      ch('…', 'ausloeser-allein', { when: ALLEIN }),
      ch('…', 'ausloeser-scham', { when: all(not(DEAL), not(ALLEIN)) }),
    ],
  }),
  node('ausloeser-deal', [
    n('Neon-Gasse, früher Abend. Die Leuchtreklame des High Voltage flackert sich warm. Durch die offene Tür hörst du Ripper am Ecktisch, laut, mit einem Glas in der Hand, das er nicht bezahlt hat.'),
    s('ripper', 'Und dann kommt der Schatz nachts in mein Lager gekrochen, ganz allein, und handelt mir den Code ab. Für ein Paketchen! Dein Schatz hat dich günstig ausgelöst, Brecherin. Ich hätte mehr genommen.', 'freude'),
    n('Die Tür fliegt auf. Aria kommt raus. Sie sieht dich. Ihr Zerberster summt, ein tiefer, böser Ton.'),
  ], { next: 'deal' }),
  node('ausloeser-allein', [
    n('Neon-Gasse, früher Abend. Aria wartet vor dem High Voltage auf dich. Dante steht neben ihr und guckt sehr angestrengt in eine andere Richtung.'),
    s('dante', 'Ich hab nix gesagt. Ich hab nur erwähnt, dass du genäht werden musstest. Und wo. Und wie oft. Um Himmels Willen, ich bin ein schlechter Lügner, das weiß jeder!', 'verlegen'),
    n('Dante verschwindet im Club. Aria sieht auf deine Schulter. Auf die frische Naht unterm Kragen.'),
  ], { next: 'allein' }),
  node('ausloeser-scham', [
    n('Neon-Gasse, früher Abend. Aria steht vor dem High Voltage, den Schläger über der Schulter, den Zerberster an der Seite, der wieder summt, wie er summen soll. Sie sollte glücklich aussehen.'),
    n('Sie sieht dich kommen und verschränkt die Arme. Niemand muss was sagen. Es reicht, dass du sie ansiehst.'),
  ], { next: 'scham' }),
  node('deal', [
    a('Ihr habt über meinen Arm verhandelt wie über ein gebrauchtes Moped. Hinter meinem Rücken. Mit RIPPER.', 'wut'),
    a('Ich bin keine Ware, verdammt. Nicht seine und nicht deine.', 'wut'),
    ...(rom ? [] : [a('Was fällt dir ein, ey? Was FÄLLT dir ein?', 'wut')]),
  ], { next: 'vex-deal' }),
  node('vex-deal', [], {
    choices: [
      ch('…', 'vex-deal-zeile', { when: V }),
      ch('…', 'schluss', { when: NOT_V }),
    ],
  }),
  node('vex-deal-zeile', [
    a('Du hast mich ausgeliefert. Wie ein Paket. Ist das alles, was du kannst? Sachen von A nach B bringen?', 'wut'),
  ], { next: 'schluss' }),
  node('allein', [
    a('Bist du komplett bescheuert? Allein? Der hätte dich ausgeschlachtet und deine Nieren am Schrottmarkt verhökert!', 'wut'),
    ...(rom ? [a('Ich hab schon einen Arm verloren. Ich will nicht auch noch … vergiss es.', 'trauer')] : [a('Was fällt dir ein, ey? Ich hab dich nicht drum gebeten!', 'wut')]),
  ], { next: 'vex-allein' }),
  node('vex-allein', [], {
    choices: [
      ch('…', 'vex-allein-zeile', { when: V }),
      ch('…', 'schluss', { when: NOT_V }),
    ],
  }),
  node('vex-allein-zeile', [
    a('Du rennst immer allein, oder? Und wer dreht sich nach DIR um, du Idiotin?', 'wut'),
  ], { next: 'schluss' }),
  node('scham', [
    a('Du hast mich gesehen. Heulend. Auf dem Tisch. Wie ein kaputtes Kind.', 'trauer'),
    ...(rom ? [a('Und du guckst mich immer noch so an. Wieso guckst du mich immer noch so an? Hör auf damit.', 'wut')] : [a('Was fällt dir ein, mich so anzugucken, ey? Als wär ich aus Glas?', 'wut')]),
  ], { next: 'vex-scham' }),
  node('vex-scham', [], {
    choices: [
      ch('…', 'vex-scham-zeile', { when: all(V, flag('vexaria_oberlicht')) }),
      ch('…', 'schluss', { when: not(all(V, flag('vexaria_oberlicht'))) }),
    ],
  }),
  node('vex-scham-zeile', [
    a('Du warst schon mal da, als ich am Boden lag. Zweimal reicht.', 'trauer'),
  ], { next: 'schluss' }),
  node('schluss', [
    a('Lass mich in Ruhe. Verpiss dich einfach.', 'wut'),
    n('Sie dreht sich um. Ihre Zöpfe schlagen gegen den Schläger. Sie geht.'),
  ], {
    choices: [
      ch('„Ein Satz noch. Dann geh ich.“', 'gehoert', { when: NOT_V, check: chk(`aria-streit-ausstrahlung${rom ? '' : '-fs'}`, 'ausstrahlung', 7, ['trost']), effects: [set('aria_streit_gehoert')] }),
      ch('„Ich weiß, wie man abhaut. Ich will das nicht mehr.“', 'gehoert-vex', { when: V, check: chk(`vexaria-aria-streit-strasse${rom ? '' : '-fs'}`, 'strasse', 5, ['trost']), effects: [set('aria_streit_gehoert')] }),
      ch('Sie gehen lassen.', 'gehen-lassen'),
      ch('Umdrehen. Gehen. Nicht umgucken.', 'umdrehen', { when: V }),
      ch('Hinterher. Am Arm festhalten.', 'festhalten', { effects: [herz(-40)] }),
      ch('„Ich hab\'s für dich getan!“', 'schreien', { effects: [herz(-60)] }),
    ],
  }),
  node('gehoert', [
    n('Sie bleibt stehen. Mit dem Rücken zu dir. Du sagst deinen Satz. Er ist nicht gut. Er ist ehrlich.'),
    n('Sie hört zu. Bis zum Ende. Ihre Schultern gehen einmal hoch und wieder runter. Dann geht sie trotzdem. Aber sie geht langsamer.'),
  ], { next: 'ende' }),
  node('gehoert-vex', [
    v('Ich weiß, wie man abhaut. Ich kann das besser als jeder in dieser Stadt.', 'trauer'),
    v('Ich will das nicht mehr.', 'besorgt'),
    n('Aria bleibt stehen. Sie dreht sich nicht um. Aber ihre echte Hand ballt sich zur Faust und öffnet sich wieder, als würde sie etwas fallen lassen, das sie lange festgehalten hat.'),
    a('Dann tu\'s nicht. Ganz einfach. Tu\'s einfach nicht.', 'trauer'),
    n('Sie geht. Langsamer, als sie gekommen ist.'),
  ], { next: 'ende' }),
  node('gehen-lassen', [
    n('Du lässt sie gehen. Die Gasse schluckt sie. Der Regen fängt an, als hätte er darauf gewartet.'),
  ], { next: 'ende' }),
  node('umdrehen', [
    n('Du drehst dich um. Du gehst. Du guckst nicht zurück. Hinter dir knallt die Clubtür.'),
    n('Wie immer.'),
  ], { next: 'ende' }),
  node('festhalten', [
    n('Du holst sie ein und greifst nach ihrem Arm. Dem silbernen. Der Zerberster reißt sich los, ohne dass sie es will, ein Ruck, der dir fast die Schulter auskugelt.'),
    a('FASS. MICH. NICHT. AN.', 'wut'),
    n('Dann ist sie weg. Deine Hand kribbelt noch.'),
  ], { next: 'ende' }),
  node('schreien', [
    a('Für mich? FÜR MICH?', 'wut'),
    a('Dann hör auf, Sachen für mich zu tun. Tu mal was MIT mir. Ach, vergiss es.', 'trauer'),
  ], { next: 'ende' }),
  node('ende', [], {
    effects: rom
      ? [set('aria_romanze_streit'), set('aria_romanze_angebahnt', false), ...ZWEI_TAGE, set('aria_streit_t4'), msg('Aria ist sauer. Richtig.')]
      : [set('aria_krach'), set('aria_krach_t2'), ...ZWEI_TAGE, set('aria_streit_t4'), msg('Krach mit Aria.')],
    choices: [
      ch('Weiter.', 'vex-nacht', { when: V }),
      ch('Weiter.', undefined, { when: NOT_V }),
    ],
  }),
  node('vex-nacht', [
    n('Die Nacht liegt vor dir wie eine Lieferung ohne Adresse. Die Kurierbude hat ein Dach. Das Dach hat einen Funk.'),
  ]),
]);

// ---------------------------------------------------------------------------
// Station 7 · rom-aria-vega · „Auf 800 Meter“

const vega: DialogueDef = dlg('rom-aria-vega', [
  node('start', [
    n('Morgen über der Neon-Gasse. Vegas Ausguck: ein Klappstuhl, ein Windmesser, eine Thermoskanne, die älter ist als du. Vega winkt dich ran, ohne vom Zielfernrohr aufzusehen.'),
    s('vega', 'Setz dich. Nein, nicht da, da liegt mein Windmesser.', 'neutral'),
    n('Sie gießt dir Kaffee in den Deckel der Thermoskanne. Er ist schwarz und bitter und genau richtig.'),
    s('vega', 'Ich hab sie damals aus der Rennhalle getragen. Ich trag sie nicht nochmal irgendwo raus, verstanden?', 'besorgt'),
  ], {
    effects: STATION_START,
    choices: [
      ch('…', 'drohung', { when: all(R, STREIT) }),
      ch('…', 'freundin', { when: not(all(R, STREIT)) }),
    ],
  }),
  node('drohung', [
    s('vega', 'Wenn du ihr wehtust, find ich dich. Auf 800 Meter. Bei Seitenwind.', 'signatur'),
  ], { next: 'kanal' }),
  node('freundin', [
    s('vega', 'Sie ist meine beste Freundin. Du bist … auch okay.', 'neutral'),
  ], { next: 'kanal' }),
  node('kanal', [], {
    choices: [
      ch('…', 'kanal4', { when: all(V, flag('vexaria_kanal4')) }),
      ch('…', 'rat', { when: not(all(V, flag('vexaria_kanal4'))) }),
    ],
  }),
  node('kanal4', [
    s('vega', 'Kanal 4. Ich hab mitgeschrieben. Willst du\'s ausgedruckt?', 'signatur'),
    v('Nein.', 'wut'),
    s('vega', 'Ich droh dir trotzdem. 800 Meter. Ist Tradition.', 'signatur'),
  ], { next: 'rat' }),
  node('rat', [], {
    choices: [
      ch('…', 'rat-deal', { when: DEAL }),
      ch('…', 'rat-allein', { when: ALLEIN }),
      ch('…', 'rat-scham', { when: all(not(DEAL), not(ALLEIN)) }),
    ],
  }),
  node('rat-deal', [
    s('vega', 'Sie ist ihr Leben lang verhandelt worden. Klinik, Ripper, Hunter mit seinen Prozenten. Sag ihr nicht, dass du\'s gut gemeint hast. Sag ihr, dass es falsch war.', 'neutral'),
  ], { next: 'vex-rat' }),
  node('rat-allein', [
    s('vega', 'Sie hat keine Angst um sich. Sie hat Angst, dass noch jemand wegen ihr was verliert.', 'besorgt'),
  ], { next: 'vex-rat' }),
  node('rat-scham', [
    s('vega', 'Sie schiebt dich nicht weg, weil du sie schwach gesehen hast. Sondern weil\'s dir nichts ausgemacht hat. Das hält sie nicht aus.', 'neutral'),
  ], { next: 'vex-rat' }),
  node('vex-rat', [], {
    choices: [
      ch('…', 'vex-rat-zeile', { when: V }),
      ch('…', 'wahl', { when: NOT_V }),
    ],
  }),
  node('vex-rat-zeile', [
    s('vega', 'Und noch was, Kurierin. Du läufst, weil du glaubst, wer stehen bleibt, verliert jemanden. Sie bleibt stehen, weil sie glaubt, wer läuft, ist weg. Ihr habt beide unrecht. Und ihr seid beide Idioten.', 'neutral'),
  ], { next: 'wahl' }),
  node('wahl', [], {
    choices: [
      ch('„Ich mein\'s ernst mit ihr.“', 'ernst', { when: not(all(V, flag('vexaria_oberlicht'))), check: chk('aria-vega-ausstrahlung', 'ausstrahlung', 6, ['ehrlich']), effects: [{ relation: 'vega', delta: 40 }] }),
      ch('„Ich hab sie damals nicht rausgetragen. Ich lag auf dem Glas und bin gerannt. Diesmal bleib ich.“', 'oberlicht', { when: all(V, flag('vexaria_oberlicht')), check: chk('vexaria-aria-vega-strasse', 'strasse', 5, ['ehrlich']), effects: [{ relation: 'vega', delta: 40 }] }),
      ch('„Ich weiß nicht, wie ich das reparieren soll.“', 'ehrlich', { effects: [{ relation: 'vega', delta: 20 }] }),
      ch('„Erzähl mir von damals.“', 'damals', { tag: '[Vega ♥6]', requires: { hearts: 'vega', min: 6 } }),
      ch('„Lagebesprechung, verstanden.“', 'wache', { tag: '[Ex-Wache]', when: all(NOT_V, { origin: 'origin-ex-wache' }), effects: [{ relation: 'vega', delta: 30 }] }),
      ch('„Geht dich nichts an.“', 'abwimmeln', { effects: [{ relation: 'vega', delta: -40 }, set('vexaria_vega_abgewimmelt')] }),
    ],
  }),
  node('ernst', [
    n('Vega sieht dich zum ersten Mal an diesem Morgen direkt an. Nicht durchs Zielfernrohr. Einfach so.'),
    s('vega', 'Gut. Dann bring ihr was mit, das zum Streit passt. Keine Blumen. Sie hasst Blumen, die verwelken vor ihren Augen. Was Echtes.', 'neutral'),
  ], { next: 'geste' }),
  node('oberlicht', [
    n('Vega setzt die Thermoskanne ab. Lange sagt sie nichts. Der Windmesser dreht sich.'),
    s('vega', 'Ihr wart die zwei auf dem Oberlicht? Ich hab euch gesehen. Ich hab gedacht, ihr fallt durch.', 'besorgt'),
    s('vega', '… Okay. Okay, Kurierin. Dann bleib diesmal.', 'neutral'),
  ], { next: 'geste' }),
  node('ehrlich', [
    s('vega', 'Gut. Das ist der erste ehrliche Satz, den ich heute hör. Fang damit an.', 'neutral'),
  ], { next: 'geste' }),
  node('damals', [
    s('vega', 'Nach dem Unfall kam sie ein halbes Jahr nicht in den Club. Ein halbes Jahr. Ich saß jeden Abend vor ihrer Tür. Mit Bier. Hab nicht geklopft. Nur gesessen.', 'besorgt'),
    s('vega', 'Am hundertachtzigsten Abend hat sie die Tür aufgemacht und gesagt: „Du sitzt auf meiner Fußmatte, du Freak.“ Dann haben wir das Bier getrunken. Das ist die ganze Geschichte.', 'neutral'),
    s('vega', 'Du musst nicht reden. Du musst nur da sitzen bleiben.', 'neutral'),
  ], { next: 'geste' }),
  node('wache', [
    s('vega', 'Wenigstens einer hier, der zuhört.', 'signatur'),
    s('vega', 'Lage: Sie ist verletzt und laut. Ziel: Sie ist verletzt und leise, neben dir. Mittel: eine Geste, die zum Streit passt. Und keine Ausreden. Wegtreten.', 'neutral'),
  ], { next: 'geste' }),
  node('geste', [], {
    choices: [
      ch('…', 'tipp-deal', { when: DEAL }),
      ch('…', 'tipp-allein', { when: ALLEIN }),
      ch('…', 'tipp-scham', { when: all(not(DEAL), not(ALLEIN)) }),
    ],
  }),
  node('tipp-deal', [s('vega', 'Rippers Schuldschein. Gestempelt. Ob du den Gefallen erfüllst, nachzahlst oder ihm den Deal um die Ohren haust – sie will sehen, dass sie niemandem mehr gehört.', 'neutral')], { next: 'schluss' }),
  node('tipp-allein', [s('vega', 'Griffband für ihren Schläger. Gibt\'s am Markt. Und dann fragst du sie, ob sie beim nächsten Auftrag mitkommt. Als Partnerin. Nicht als Leibwache.', 'neutral')], { next: 'schluss' }),
  node('tipp-scham', [s('vega', 'Red mit Hunter. Er soll ihr einen Auftrag geben, bei dem was heil bleiben muss. Die Kids beim Eins!-Turnier. Sie muss sehen, dass ihre Hände mehr können als kaputtmachen.', 'neutral')], { next: 'schluss' }),
  node('schluss', [], {
    effects: [set('aria_vega_rat')],
    choices: [
      ch('„Und jetzt?“', 'schluss-vex-rom', { when: all(V, R, STREIT) }),
      ch('„Und jetzt?“', 'schluss-vex-fs', { when: all(V, not(all(R, STREIT))) }),
      ch('„Und jetzt?“', 'schluss-andere', { when: NOT_V }),
    ],
  }),
  node('schluss-vex-rom', [s('vega', 'Sie sucht dich. Nachts. Auf den Dächern. Sie kennt die Wege nicht, Vex.', 'besorgt')]),
  node('schluss-vex-fs', [s('vega', 'Sie will dich heute Nacht zum Bier abholen. Über die Dächer. Sie kennt die Wege nicht, Vex.', 'besorgt')]),
  node('schluss-andere', [
    s('vega', 'Jetzt trinkst du deinen Kaffee aus und gehst. Und wenn es regnet, stell dich unters Vordach. Sie kommt da immer vorbei, wenn sie vom Inkasso zurückkommt. Immer. Seit Jahren.', 'neutral'),
  ]),
  node('abwimmeln', [
    s('vega', 'Wie du willst.', 'wut'),
    n('Sie dreht dir den Rücken zu und guckt wieder durchs Zielfernrohr. Auf irgendwas sehr weit weg. Der Kaffee ist plötzlich kalt.'),
  ]),
]);

// ---------------------------------------------------------------------------
// Station 8 · rom-aria-regen · „Unter einer Jacke“

const GESTE_DEAL: Condition = { item: 'beglichener-schuldschein' };
const GESTE_ALLEIN: Condition = { item: 'griffband-schlaeger' };
const GESTE_SCHAM: Condition = flag('aria_geste_hunter');
const GESTE: Condition = any(GESTE_DEAL, GESTE_ALLEIN, GESTE_SCHAM);
const PASSEND: Condition = any(all(DEAL, GESTE_DEAL), all(ALLEIN, GESTE_ALLEIN), all(SCHAM, GESTE_SCHAM));
const RAT: Condition = any(flag('aria_vega_rat'), all(V, flag('vexaria_umgedreht')));
const VIER_TAGE: Condition = all(noFlag('aria_streit_t4'), noFlag('aria_streit_t3'), noFlag('aria_streit_t2'), noFlag('aria_streit_t1'));

/** Freie Rede: [Ausstrahlung 7] (Vex 4), je 1 weniger mit `aria_streit_gehoert` und passender Geste, mindestens 3. */
const freieRede = (): DialogueChoice[] => {
  const out: DialogueChoice[] = [];
  for (const vex of [false, true]) {
    for (const g of [false, true]) {
      for (const p of [false, true]) {
        const base = vex ? 4 : 7;
        const t = Math.max(3, base - (g ? 1 : 0) - (p ? 1 : 0));
        out.push(ch('Frei reden. Irgendwie. Mit allem, was du hast.', 'erfolg', {
          id: `frei-${vex ? 'v' : 'n'}${g ? 'g' : ''}${p ? 'p' : ''}`,
          when: all(vex ? V : NOT_V, g ? GEHOERT : not(GEHOERT), p ? PASSEND : not(PASSEND)),
          check: chk(`${vex ? 'vexaria' : 'aria'}-regen-ausstrahlung-${t}`, 'ausstrahlung', t, ['ehrlich']),
        }));
      }
    }
  }
  return out;
};

const regen: DialogueDef = dlg('rom-aria-regen', [
  node('start', [
    n('Abend, Neon-Gasse. Der Himmel hat den ganzen Tag gedroht. Jetzt macht er ernst. Der Regen kommt nicht in Tropfen, sondern in Wänden, und du schaffst es gerade noch unter das Vordach neben dem Pfandautomaten.'),
    n('Zwei Sekunden später kommt Aria um die Ecke. Vom Inkasso, den Schläger quer über dem Nacken, nass bis auf die Zöpfe. Sie sieht dich. Sie sieht den Regen. Es gibt kein anderes Vordach.'),
    a('Was willst du? Ich hab zu … na toll. Regen. Natürlich Regen.', 'wut'),
    n('Sie stellt sich unter das Vordach. So weit weg von dir, wie es geht. Das sind vierzig Zentimeter. Das Wasser läuft ihr aus den Zöpfen über den Hals, in den Kragen ihres Bandshirts. Sie wischt es nicht weg.'),
  ], {
    effects: STATION_START,
    choices: [
      ch('Rippers gestempelten Schuldschein hinhalten.', 'geste-deal', { when: GESTE_DEAL }),
      ch('Ihr das Griffband geben. Und fragen.', 'geste-allein', { when: GESTE_ALLEIN }),
      ch('„Hunter hat dir einen Job gegeben. Die Kids beim Turnier.“', 'geste-scham', { when: GESTE_SCHAM }),
    ],
  }),
  node('geste-deal', [
    n('Du ziehst das Papier aus der Innentasche. Es ist ein bisschen feucht. Der Stempel ist trotzdem lesbar: BEZAHLT.'),
    a('Was ist das?', 'wut'),
    v('Deiner. Der Arm gehört dir. Keinem sonst. Auch nicht mir.', 'neutral'),
    n('Aria nimmt das Papier mit der echten Hand. Sie liest es zweimal. Ihr Daumen fährt über den Stempel, als wäre er eine Narbe.'),
  ], { next: 'rede' }),
  node('geste-allein', [
    n('Du hältst ihr eine Rolle Griffband hin. Schwarz, mit einem roten Faden durch die Mitte. Wie der Stern auf ihrem Shirt.'),
    a('Griffband. Du schenkst mir in einem Gewitter … Griffband.', 'wut'),
    v('Beim nächsten Auftrag. Kommst du mit? Nicht als Leibwache. Als Partnerin.', 'neutral'),
    n('Sie dreht die Rolle in der Hand. Der Zerberster summt, ganz leise.'),
  ], { next: 'rede' }),
  node('geste-scham', [
    a('Woher weißt du das? … Hunter. Natürlich Hunter. Er hat gesagt, er hätte \'ne Eingebung gehabt. Hunter hat nie Eingebungen.', 'wut'),
    a('Die Kleine mit den Zahnlücken hat gewonnen. Ich hab drei Stunden auf sie aufgepasst und nix kaputtgemacht. Nicht mal \'nen Stuhl. Die hat mich zum Abschied umarmt. Mit dem Arm.', 'trauer'),
  ], { next: 'rede' }),
  node('rede', [], {
    choices: [
      ch('„Ich hab über dich verhandelt, als wärst du ein Ersatzteil. Das war falsch. Punkt.“', 'erfolg', { tag: '[Vegas Rat]', when: all(RAT, DEAL) }),
      ch('„Ich hatte Angst um dich. Das ist keine Ausrede. Das ist nur wahr.“', 'erfolg', { tag: '[Vegas Rat]', when: all(RAT, ALLEIN) }),
      ch('„Ich hab dich heulen sehen. Und wenn\'s sein muss, will ich das wieder. Ich geh nicht weg.“', 'erfolg', { tag: '[Vegas Rat]', when: all(RAT, not(DEAL), not(ALLEIN)) }),
      ch('„Kas hat gesagt, wer anhält, wird geschnappt. Ich will, dass du mich schnappst.“', 'erfolg-kas', { when: all(V, flag('vexaria_kas_erzaehlt')) }),
      ...freieRede(),
      ch('„Wo ich herkomm, verzeiht keiner. Man vergisst nur. Ich will nicht, dass du vergisst. Ich will, dass du verzeihst.“', 'erfolg', { tag: '[Gosse]', when: any(V, { origin: 'origin-gossenkind' }) }),
      ch('„Ich hab drei Jahre auf eine zweite Chance gewartet. Ich frag nur nach einer.“', 'erfolg', { tag: '[Knast]', when: all(NOT_V, { origin: 'origin-knastvogel' }) }),
      ch('„Ich hab\'s doch nur für dich gemacht!“', 'misslungen'),
      ch('Nichts sagen. Den Regen reden lassen.', 'misslungen'),
    ],
  }),
  node('erfolg-kas', [
    v('Kas hat gesagt, wer anhält, wird geschnappt.', 'neutral'),
    v('Ich will, dass du mich schnappst.', 'zaertlich'),
    a('…', 'ueberrascht'),
    a('Das ist das Dümmste und Schönste, was mir je einer unterm Vordach gesagt hat.', 'zaertlich'),
  ], { next: 'erfolg' }),
  node('erfolg', [], {
    choices: [
      ch('…', 'erfolg-vex', { when: V }),
      ch('…', 'erfolg-andere', { when: NOT_V }),
    ],
  }),
  node('erfolg-andere', [
    n('Aria sieht dich an. Lange. Das Wasser tropft ihr von der Nasenspitze. Dann lacht sie. Erst nur mit den Schultern, dann richtig, laut und kaputt und wunderschön.'),
    a('Du bist so ein Idiot. Komm her, du wirst ja nass.', 'freude'),
    n('Sie zieht ihre Jacke aus und hält sie über euch beide, obwohl das Vordach reicht, obwohl ihr beide eh schon nass seid. Unter der Jacke ist es eng. Warm. Es riecht nach Regen und Motoröl und ihr. Ihr Atem geht schnell, dein Atem auch, und keiner von euch macht einen Schritt zurück.'),
    a('Mach das nie wieder. Und wenn doch, nimm mich mit.', 'zaertlich'),
    n('Ihre Stirn sinkt gegen deine. Ihre Nase streift deine. Du kannst den Regen auf ihren Lippen sehen. Einen Atemzug lang ist da nichts mehr zwischen euch, nur ein Wort, das keiner sagt.'),
    a('Nicht hier. Nicht unterm Vordach. Ich will\'s richtig.', 'verlegen'),
  ], { next: 'versoehnt' }),
  node('erfolg-vex', [
    n('Du ziehst die Lieferweste aus der Hüfttasche, die mit den Reflexstreifen, die du nur bei Lieferungen überziehst. Aria nimmt sie dir aus der Hand und hält sie über euch beide, obwohl das Vordach reicht.'),
    a('Deine Weste hat Reflexstreifen. Jetzt sieht jeder Taxifahrer, wie ich heul. Danke auch.', 'freude'),
    a('Komm her. Näher. Noch näher. Da ist kein Regen mehr, ich weiß, ich will nur –', 'zaertlich'),
    n('Unter der Weste ist die Welt einen halben Meter breit. Ihre Stirn an deiner. Ihre Nase streift deine. Du spürst ihren Atem, schnell und warm, und das Wasser aus ihren Zöpfen, das dir in den Kragen läuft. Deine Metallfinger finden den Gurtriemen an ihrer Hüfte und halten sich daran fest, als wäre er eine Dachkante.'),
    n('Eure Lippen sind so nah, dass ein Wort sie berühren würde. Aria beißt sich auf die Unterlippe. Fest.'),
    a('Nein. Nicht unterm Vordach. Ich will\'s richtig. Auf der Mauer.', 'verlegen'),
    v('Auf der Mauer.', 'verlegen'),
    a('Bei Sonnenuntergang. Mit Rennen vorher. Ich will dich schnaufen sehen.', 'signatur'),
  ], { next: 'versoehnt' }),
  node('versoehnt', [], {
    effects: [
      set('aria_versoehnung_verdient'), set('aria_versoehnung_gescheitert', false), set('aria_romanze_streit', false),
      set('aria_romanze_angebahnt'), herz(120), set('aria_streit_t4', false), set('aria_streit_t3', false),
      set('aria_streit_t2', false), set('aria_streit_t1', false), msg('Versöhnt. Fast.'),
    ],
    choices: [
      ch('Weiter.', 'ripper-geplatzt', { when: flag('ripper_deal_geplatzt') }),
      ch('Weiter.', undefined, { when: noFlag('ripper_deal_geplatzt') }),
    ],
  }),
  node('ripper-geplatzt', [
    n('Irgendwo in der Unterstadt, so stellst du es dir vor, hört Ripper gerade ein Lachen durch den Regen und weiß nicht, warum er es hasst.'),
  ], { effects: [{ relation: 'ripper', delta: -50 }, set('ripper_gefallen', false)] }),
  node('misslungen', [
    a('Nicht jetzt. Vielleicht nie. Geh einfach.', 'trauer'),
    n('Sie tritt aus dem Vordach in den Regen. Sie dreht sich nicht um. Du bleibst trocken stehen und hasst jeden einzelnen Tropfen, der dich nicht trifft.'),
  ], {
    effects: [
      set('aria_versoehnung_gescheitert'), set('aria_gescheitert_t3'), msg('Gescheitert. Die Romanze ruht. Crew seid ihr trotzdem.'),
    ],
  }),
]);

const regenFs: DialogueDef = dlg('rom-aria-regen-fs', [
  node('start', [
    n('Abend, Neon-Gasse. Regen wie aus Eimern. Du stehst unter dem Vordach neben dem Pfandautomaten, als Aria vom Inkasso kommt und sich danebenquetscht.'),
    a('Na toll. Regen. Und du. Beides auf einmal.', 'wut'),
  ], {
    effects: STATION_START,
    choices: [
      ch('Rippers Schuldschein hinhalten.', 'ok', { when: GESTE_DEAL }),
      ch('Ihr das Griffband geben.', 'ok', { when: GESTE_ALLEIN }),
      ch('„Hunter sagt, du warst super mit den Kids.“', 'ok', { when: GESTE_SCHAM }),
    ],
  }),
  node('ok', [
    n('Sie guckt das Ding an. Dann dich. Dann den Regen.'),
    a('Du bist so ein Idiot. Komm her, du wirst ja nass.', 'freude'),
    n('Sie zieht dich am Kragen näher an die Wand, wo es trocken ist, und boxt dich mit dem Zerberster gegen die Schulter. Sanft. Für Zerberster-Verhältnisse.'),
    a('Wir sind Crew. Crew macht Scheiße, und dann bringt Crew Griffband oder so. Is\' gut jetzt.', 'freude'),
  ], { effects: [set('aria_krach', false), set('aria_krach_t2', false), set('aria_krach_t1', false), set('aria_versoehnung_verdient'), herz(80)] }),
]);

// ---------------------------------------------------------------------------
// Hunters Auftrag (Geste „scham“)

const hunterGeste: DialogueDef = dlg('aria-geste-hunter', [
  node('start', [
    n('Hunter sitzt am Tresen, die Brille auf der Stirn, und zählt Kronkorken in Zehnerhäufchen. Er hört dir zu, ohne aufzusehen.'),
    s('hunter', 'Ein Auftrag, bei dem was heil bleiben muss. Für Aria. Damit sie sieht, dass sie mehr ist als ihr Arm.', 'neutral'),
    s('hunter', 'Du weißt, dass ich keine Wohlfahrt bin. … Das Eins!-Turnier am Wochenende. Die Gören brauchen jemanden, der aufpasst, dass keiner die Kasse klaut. Ich sag ihr, es war meine Idee. Wenn du jemals erzählst, dass ich nett war, streich ich dir die Provision.', 'signatur'),
  ], { effects: [set('aria_geste_hunter'), { relation: 'hunter', delta: 10 }, msg('Hunter gibt Aria den Turnier-Job.')] }),
]);

const cutscenes: CutsceneDef[] = [
  cut('rom-aria-streit', 'Verpiss dich', [
    { image: 'cut-rom-aria-streit', pan: 'left', fade: 'in', hold: 2400, caption: 'Neon-Gasse. Ein Rücken, der sich entfernt.' },
  ]),
  cut('rom-aria-vega', 'Auf 800 Meter', [
    { image: 'cut-rom-aria-vega', pan: 'right', fade: 'in', hold: 2400, caption: 'Ein Windmesser. Eine Thermoskanne. Eine Warnung.' },
  ]),
  cut('rom-aria-regen', 'Unter einer Jacke', [
    { image: 'cut-rom-aria-regen', pan: 'in', fade: 'in', hold: 2600, caption: 'Vierzig Zentimeter Vordach. Kein anderes weit und breit.' },
  ]),
  cut('rom-aria-kuss', 'Wer zuerst an der Mauer ist', [
    { image: 'cut-rom-aria-kuss', pan: 'out', fade: 'cross', hold: 3200, caption: 'Kein Ton. Nur Wind und Möwen.' },
  ], [{ dialogue: 'rom-aria-kuss-nachher' }]),
];

// ---------------------------------------------------------------------------
// Station 9 (Baukasten-Spielfigur) · rom-aria-kuss · Freundschaft he-aria-10

const kussStart = (id: string, rom: boolean): DialogueDef => dlg(id, [
  node('start', [
    n('Die Dachterrasse über der Neon-Gasse, kurz vor Sonnenuntergang. Kein Regen. Die Luft riecht nach nassem Blech, das trocknet. Aria sitzt auf dem Geländer und schlenkert mit den Stiefeln über neun Stockwerken.'),
    a('Da bist du. Rennen. Von hier bis zur Flutmauer. Über die Dächer. Wer zuerst am Geländer ist.', 'signatur'),
    ...(rom ? [a('Und wer gewinnt, darf sich was wünschen. Ich weiß schon, was ich mir wünsch. Guck nicht so. Lauf.', 'verlegen')] : [a('Wer verliert, zahlt das Bier. Los!', 'freude')]),
    n('Sie rennt los, bevor sie „los“ gesagt hat. Neon-Gasse, Hafenkante, ein Sprung über einen Lüftungsschacht, Containerdächer, die unter euch dröhnen wie Trommeln.'),
  ], {
    effects: STATION_START,
    choices: [
      ch('Alles geben.', 'gewonnen', { check: chk(`aria-mauer-reflexe${rom ? '' : '-fs'}`, 'reflexe', 7, ['rennen', 'dach']) }),
      ch('Mithalten, so gut es geht.', 'verloren'),
    ],
  }),
  node('gewonnen', [
    n('Du schlägst einen halben Atemzug vor ihr aufs Geländer der Flutmauer. Sie knallt neben dir dagegen, keuchend, lachend, wütend.'),
    a('Schummel-Arsch! Du bist bei der Regenrinne abgekürzt, ich hab\'s gesehen!', 'freude'),
  ], { next: rom ? 'mauer' : 'mauer-fs' }),
  node('verloren', [
    n('Sie ist zwei Sekunden vor dir oben, schlägt mit dem Zerberster aufs Geländer, dass es dröhnt, und dreht sich mit ausgebreiteten Armen um.'),
    a('Gewonnen! Ha! Du schnaufst wie Hunters Kaffeemaschine.', 'signatur'),
  ], { next: rom ? 'mauer' : 'mauer-fs' }),
  node('mauer', [
    n('Ihr setzt euch aufs Geländer. Unten schlägt das Meer gegen den Beton. Die Sonne hängt rot im Dunst und färbt Arias silbernen Arm kupfern.'),
    n('Sie wühlt in der Tasche und drückt dir einen alten Schläger in die Hand, das Griffband dreifach geflickt. Dann, nach langem Zögern, ein laminiertes Stück Plastik. Ein Backstage-Pass. „Kabelbrand – Abschiedstour 2083“.'),
    a('Mein Ersatzschläger. Ist jetzt deiner.', 'freude'),
    a('Den Pass schlepp ich seit drei Jahren mit mir rum. Seit der Nacht war ich auf keinem Konzert. Behalt ihn. Vielleicht gehen wir irgendwann.', 'verlegen'),
    n('Dann nimmt sie deine Hand. Mit der Zerberster-Hand. Die silbernen Finger schließen sich um deine, so vorsichtig, dass du merkst, wie viel Kraft sie gerade nicht benutzt.'),
    a('Ich spür nix mit der Hand. Aber ich weiß, dass du sie hältst. Das ist mehr, als ich dachte, dass ich noch krieg.', 'zaertlich'),
  ], {
    effects: [{ give: 'arias-ersatzschlaeger' }, { give: 'kabelbrand-pass' }],
    choices: [
      ch('Sie küssen.', 'kuss'),
      ch('Warten.', 'warten'),
      ch('Nur ihre Hand halten. Noch nicht.', 'hand'),
    ],
  }),
  node('kuss', [
    n('Du beugst dich zu ihr. Sie kommt dir entgegen, schneller, als du dachtest, und hält dann doch einen Fingerbreit vor dir an. Ihr Atem streift deinen Mund. Sie riecht nach Wind und Kronkorken und Sonne.'),
    n('Sie zieht dich an der Jacke heran, so vorsichtig, als könnte sie etwas kaputtmachen. Dann küsst sie dich. Kurz. Zärtlich. Dann noch mal, nicht mehr so kurz, und ihre echte Hand gräbt sich in deinen Kragen, und die silberne liegt ganz still auf deiner Hüfte, als hätte sie Angst vor sich selbst.'),
  ], { next: 'kuss-ende' }),
  node('warten', [
    n('Du wartest. Sie wartet. Die Sonne berührt das Wasser.'),
    a('Gott, bist du langsam.', 'freude'),
    n('Sie packt dich am Kragen und küsst dich. Kein Zögern diesmal. Ihre Lippen sind warm und salzig vom Wind, und als sie sich löst, nur ein winziges Stück, lehnt sie die Stirn gegen deine und küsst dich gleich noch mal, weil einmal offensichtlich nicht gereicht hat.'),
  ], { next: 'kuss-ende' }),
  node('kuss-ende', [], { effects: [set('aria_kuss'), herz(40), { cutscene: 'rom-aria-kuss' }] }),
  node('hand', [
    a('Okay. Ich lauf nicht weg. Diesmal nicht.', 'zaertlich'),
    n('Sie lehnt sich an deine Schulter. Die Sonne fällt ins Meer. Ihr seht zu, bis nur noch ein roter Strich übrig ist.'),
  ], { effects: [...KUSS_FOLGEN, { travel: 'flutmauer', entry: 'von-hafenkante', minutes: 30 }] }),
  node('mauer-fs', [
    n('Ihr hockt euch aufs Geländer. Aria drückt dir ihren alten Ersatzschläger in die Hand, das Griffband dreifach geflickt.'),
    a('Mein Ersatzschläger. Von vor dem Zerberster. Ist jetzt deiner. Wenn du ihn verlierst, verlier ich dich. Kapiert?', 'freude'),
    n('Dann fischt sie zwei Kronkorken aus der Hosentasche. Ihr werft sie gleichzeitig ins Meer. Weit draußen machen sie zwei winzige Ringe.'),
    a('Crew. Für immer. Oder bis einer von uns Hunter beklaut.', 'freude'),
  ], { effects: [{ give: 'arias-ersatzschlaeger' }, set('aria_romanze_freundschaft'), ...ZWEI_TAGE, herz(80), { travel: 'flutmauer', entry: 'von-hafenkante', minutes: 30 }] }),
]);

/** Status „zusammen“ (gilt für Kuss und „nur Hand halten“). */
const KUSS_FOLGEN: Effect[] = [
  set('aria_romanze_zusammen'), set('aria_romanze_angebahnt', false), set('aria_romanze_streit', false), ...ZWEI_TAGE,
];

const kussNachher: DialogueDef = dlg('rom-aria-kuss-nachher', [
  node('start', [
    n('Danach lacht sie leise gegen deine Schulter. Ihr ganzer Körper zittert mit, und der Zerberster klackert dabei gegen das Geländer.'),
    a('Scheiße. Ich hab gezittert. Sag\'s keinem.', 'verlegen'),
    n('Ihr bleibt sitzen, bis es dunkel wird. Ihre Hand in deiner. Ihre Zöpfe in deinem Gesicht, wenn der Wind dreht. Keiner von euch hat es eilig, irgendwohin zu kommen.'),
  ], { effects: [...KUSS_FOLGEN, { travel: 'flutmauer', entry: 'von-hafenkante', minutes: 30 }] }),
]);

// ---------------------------------------------------------------------------
// Herz-Ereignisse

const STREIT_BASIS: Condition = all(AKT2, KANON, Q_DONE);
const REGEN_BASIS: Condition = all(
  AKT2, KANON, seen('rom-aria-streit'), WARTEN_VORBEI, GESTE, any(RAT, VIER_TAGE),
  any(NOT_V, seen('rom-vexaria-umdrehen')),
);
/** Kuss der Baukasten-Spielfigur: verdient (Akt 2+) oder spät (Nachspiel). */
const KUSS_VERSOEHNT: Condition = any(all(AKT2, flag('aria_versoehnung_verdient')), all(EPILOG, flag('aria_versoehnung_spaet')));
const KUSS_ROM: Condition = all(R, any(ANGEBAHNT, ZUSAMMEN), KUSS_VERSOEHNT);
/** Freundschaft: keine Romanze möglich oder abgelehnt; nicht während eines laufenden Streits. */
const KUSS_FS: Condition = all(
  not(all(R, any(ANGEBAHNT, flag('aria_versoehnung_gescheitert'), flag('aria_versoehnung_spaet')))),
  noFlag('aria_romanze_streit'), noFlag('aria_krach'),
);

export const VERSOEHNUNG_EVENTS: HeartEventDef[] = [
  ...twin({
    id: 'rom-aria-streit', hearts: 1, map: 'neon-gasse', time: 'abend', when: all(STREIT_BASIS, HEUTE_FREI),
  }, all(R, ANGEBAHNT), { cutscene: 'rom-aria-streit', dialogue: 'rom-aria-streit' }, { dialogue: 'rom-aria-streit-fs' }),
  {
    id: 'rom-aria-vega', hearts: 1, map: 'neon-gasse', time: 'morgen',
    when: all(AKT2, KANON, seen('rom-aria-streit'), HEUTE_FREI, noFlag('aria_warte2'),
      any(NOT_V, seen('rom-vexaria-funkstille')), not(seen('rom-aria-vega'))),
    cutscene: 'rom-aria-vega',
    dialogue: 'rom-aria-vega',
    effects: [{ setFlag: 'aria_heute' }, { xp: 25 }],
  },
  ...twin({
    id: 'rom-aria-regen', hearts: 1, map: 'neon-gasse', time: ['abend', 'nacht'], when: all(REGEN_BASIS, HEUTE_FREI),
  }, all(R, STREIT), { cutscene: 'rom-aria-regen', dialogue: 'rom-aria-regen' }, { dialogue: 'rom-aria-regen-fs' }),
  {
    id: 'rom-aria-kuss', hearts: 10, map: 'neon-gasse', time: 'abend',
    when: all(NOT_V, Q_DONE, HEUTE_FREI, KUSS_ROM, not(seen('rom-aria-kuss'))),
    dialogue: 'rom-aria-kuss',
    effects: [{ setFlag: 'aria_heute' }, { xp: 25 }],
  },
  {
    id: 'he-aria-10', hearts: 10, map: 'neon-gasse', time: 'abend',
    when: all(NOT_V, Q_DONE, HEUTE_FREI, KUSS_FS, not(seen('rom-aria-kuss')), not(seen('he-aria-10'))),
    dialogue: 'he-aria-10',
    effects: [{ setFlag: 'aria_heute' }, { xp: 25 }, { markSeen: 'rom-aria-kuss' }],
  },
];

export const part: ContentPart = {
  dialogues: byId([
    streit('rom-aria-streit', true), streit('rom-aria-streit-fs', false), vega, regen, regenFs, hunterGeste,
    kussStart('rom-aria-kuss', true), kussStart('he-aria-10', false), kussNachher,
  ]),
  cutscenes: byId(cutscenes),
  mapAdditions: {
    'high-voltage': {
      hotspots: [{
        id: 'aria-geste-hunter', at: 'tresen', label: 'Hunter um einen Job für Aria bitten', kind: 'talk',
        when: all(seen('rom-aria-streit'), not(seen('rom-aria-regen')), noFlag('aria_geste_hunter'), { time: ['abend', 'nacht'] }, { hearts: 'hunter', min: 6 }),
        dialogue: 'aria-geste-hunter',
      }],
    },
  },
};
