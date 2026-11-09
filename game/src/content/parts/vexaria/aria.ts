// Aria (NpcDef) mit Tagesablauf, Geschenken, Begleiterwerten, Tagesgesprächen, Flirt-Pools und allen Herz-Ereignissen:
// Kanon-Herzereignisse he-aria-2/4/6, „Zerberster-Herz“ Akt 1 (aria-akt1.ts) und Vex × Aria (rivalinnen/funken/bruch/
// hoehepunkt/danach). world.md §4.2 `aria`, §4.7.
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueDef, DialogueLine, HeartEventDef, NpcDef, TalkDef } from '../../../modules/contracts';
import { AKT2_EVENTS, AKT2_TALK } from './akt2';
import { AKT3_EVENTS } from './akt3';
import { ARIA_AKT1_EVENTS } from './aria-akt1';
import { ENDEN_EVENTS } from './enden';
import { KRISE_EVENTS } from './krise';
import { NACHSPIEL_EVENTS, NACHSPIEL_TALK } from './nachspiel';
import { VERSOEHNUNG_EVENTS } from './versoehnung';
import { ZERBERSTER_EVENTS } from './zerberster';
import { BRUCH_EVENTS } from './bruch';
import { DANACH_EVENTS } from './danach';
import { FUNKEN_EVENTS } from './funken';
import { HOEHEPUNKT_EVENTS } from './hoehepunkt';
import { RIVALINNEN_EVENTS } from './rivalinnen';
import {
  a, all, ANGEBAHNT, any, byId, ch, chk, dlg, flag, GOSSE_ANDERE, herz, n, node, noFlag, not, NOT_V, R, s, seen, set, STREIT,
  V, v, WARTEN_VORBEI, ZUSAMMEN,
} from './_util';

// ---------------------------------------------------------------------------
// Kanon-Herzereignisse (alle Spielfiguren; he-aria-6 nicht für Vex, dort Station 3)

/** Streit oder Krach mit Aria: Duo-Aktionen und „Unkaputtbar“ ruhen. */
const IM_STREIT = any(STREIT, flag('aria_krach'));

const he2: DialogueDef = dlg('he-aria-2', [
  node('start', [
    n('Schrottmarkt, früh am Morgen. Die Händler schieben gerade die Rolltore hoch. Aria steht vor einem Stand mit gebrauchten Akkus, den Schläger lässig über der Schulter, und lächelt den Händler an. Es ist kein nettes Lächeln.'),
    a('Morgen, Dexter-Schätzchen. Hunter sagt, du bist drei Wochen hinten. Hunter sagt auch, ich soll freundlich sein. Ich bin freundlich. Siehst du? Ich lächle.', 'signatur'),
    s('narrator', 'Händler: „Nächste Woche, Aria, ich schwör, nächste Woche –“'),
    n('Aria seufzt. Dann packt sie mit dem Zerberster die Mülltonne neben dem Stand, eine volle, aus Metall, und wirft sie. Einhändig. Über den Stand. Die Tonne knallt drei Meter weiter gegen eine Hauswand und rollt scheppernd aus.'),
    n('Der Händler zahlt. Sofort. Mit Trinkgeld.'),
    a('Danke, Schätzchen! Schönen Tag noch!', 'freude'),
    a('Was guckst du so? Die Tonne war eh leer. Fast. Na gut, nicht leer.', 'freude'),
  ], {
    choices: [
      ch('„Hätte er nicht sowieso gezahlt?“', 'frage'),
      ch('„Das war geil.“', 'geil', { effects: [herz(20)] }),
      ch('„Auf der Straße hätte er erst gezahlt, wenn die Tonne ihn trifft.“', 'gosse', { ...GOSSE_ANDERE, effects: [herz(30)] }),
      ch('„Auf der Straße hätte er erst gezahlt, wenn die Tonne ihn trifft.“', 'gosse', { tag: '[Gosse]', when: V, effects: [herz(30)] }),
    ],
  }),
  node('frage', [a('Klar. Aber dann hätt ich die Tonne nicht werfen dürfen. Wo bleibt da der Spaß?', 'signatur')]),
  node('geil', [a('Ich weiß. Ich mach das jeden Montag. Komm wieder vorbei, dann werf ich was Größeres.', 'freude')]),
  node('gosse', [a('Ha! Du kennst das Spiel. Ich mag dich. Ein bisschen. Nicht zu viel. Mach dir nix drauf ein.', 'freude')]),
]);

const he4: DialogueDef = dlg('he-aria-4', [
  node('start', [
    n('Dantes Werkstatt. Aria liegt auf der Einbauliege, der Zerberster aufgeklappt wie ein Werkzeugkasten. Dante hat eine Lupe auf der Stirn und drei Schraubenzieher im Mund.'),
    a('Hey. Setz dich. Dante redet nicht, wenn er schraubt. Also red ich. Ist eh besser so.', 'freude'),
    a('Weißt du, wie ich den hier gekriegt hab? Ich lag drei Tage hier. Genau hier. Dante hat nicht geschlafen. Drei Nächte. Er hat mit mir geredet, die ganze Zeit, obwohl ich nicht wach war. Über Kekse. Über seine Mutter. Über einen Hund, den er nie hatte.', 'neutral'),
    s('dante', 'Mmpf. Mmmpf-mmpf.', 'verlegen'),
    a('Er sagt, das stimmt nicht. Es stimmt.', 'freude'),
    a('Als ich aufgewacht bin, hatte ich \'nen Arm. Den hier. Silber, schwer, viel zu stark. Ich hab ihm als Erstes damit die Kaffeetasse zerdrückt. Dann hab ich geheult. Dann er.', 'trauer'),
  ], {
    choices: [
      ch('„Tut\'s noch weh?“', 'weh'),
      ch('Dante einen Keks aus der Dose reichen.', 'keks', { effects: [{ relation: 'dante', delta: 10 }, herz(10)] }),
      ch('Dante die Platte halten, während er lötet.', 'loeten', { check: chk('aria-he4-technik', 'technik', 5, ['reparatur']), effects: [herz(30)] }),
    ],
  }),
  node('weh', [
    a('Der Arm? Nö. Der Arm spürt nix. Die Hand, die nicht mehr da ist, die juckt. Jeden Abend um zehn. Wie ein Wecker.', 'trauer'),
    a('Und jetzt guck nicht so. Ich hab dir das erzählt, weil du zugehört hast. Mach was draus. Oder nicht. Mir egal.', 'verlegen'),
  ], { effects: [herz(20)] }),
  node('keks', [
    s('dante', '(spuckt die Schraubenzieher aus) Endlich versteht mich jemand.', 'freude'),
    a('Er braucht Zucker, sonst lötet er schief. Gut gemacht.', 'freude'),
  ]),
  node('loeten', [
    s('dante', 'Ruhige Hände. Gut. Halt. Halt. Halt … perfekt.', 'freude'),
    a('Ey. Du bist ja gar nicht so nutzlos.', 'freude'),
  ]),
]);

const he6: DialogueDef = dlg('he-aria-6', [
  node('start', [
    n('High Voltage, Abend. Aria knallt den Ellbogen auf den Ecktisch, dass die Gläser hüpfen.'),
    a('Armdrücken. Du gegen mich. Mit der Echten, ich bin ja kein Monster.', 'signatur'),
    s('hunter', 'Nicht mein Tisch. Bitte nicht mein Tisch.', 'besorgt'),
  ], {
    choices: [
      ch('Zupacken und drücken.', 'sieg', { check: chk('aria-he6-koerper', 'koerper', 7, ['kraft']), effects: [herz(40), set('aria_armdruecken_sieg')] }),
      ch('Zupacken und ehrlich verlieren.', 'verloren', { effects: [herz(30)] }),
      ch('„Ich hab gesessen. Da lernt man, wann man verliert.“', 'knast', { tag: '[Knast]', when: { origin: 'origin-knastvogel' }, effects: [herz(30)] }),
    ],
  }),
  node('sieg', [
    n('Ihr Arm geht runter. Langsam. Zitternd. Dann knallt ihre Faust auf den Tisch. Sie starrt dich an.'),
    a('… Noch mal. SOFORT noch mal.', 'ueberrascht'),
    a('Okay. Okay. Respekt. Bier geht auf mich. Und morgen Revanche, und dann mach ich dich fertig.', 'freude'),
  ]),
  node('verloren', [
    n('Sie lässt dich zappeln. Dann legt sie deinen Arm sanft, fast zärtlich, auf die Tischplatte.'),
    a('Du hast nicht aufgegeben. Bis zum Schluss nicht. Das mag ich. Verlieren können ist auch \'ne Kunst.', 'freude'),
  ]),
  node('knast', [
    a('Du hast gesessen? Cool. Ich meine: nicht cool. Aber cool.', 'ueberrascht'),
    a('Und du verlierst mit Absicht. Das ist das Hinterhältigste, was ich je gesehen hab. Bier?', 'freude'),
  ]),
]);

const KANON_EVENTS: HeartEventDef[] = [
  { id: 'he-aria-2', hearts: 2, map: 'schrottmarkt', time: 'morgen', when: not(seen('he-aria-2')), dialogue: 'he-aria-2' },
  { id: 'he-aria-4', hearts: 4, map: 'dantes-werkstatt', time: 'tag', when: all({ weekday: ['di', 'do'] }, not(seen('he-aria-4'))), dialogue: 'he-aria-4' },
  { id: 'he-aria-6', hearts: 6, map: 'high-voltage', time: 'abend', when: all(NOT_V, { quest: 'main-1-dexter', state: 'done' }, not(seen('he-aria-6'))), dialogue: 'he-aria-6' },
];

// ---------------------------------------------------------------------------
// Tagesgespräche

/** Einzeilige Tagesgesprächs-Dialoge (Pool-Zeile plus optionale Antworten). */
const zeile = (id: string, lines: DialogueLine[], choices?: DialogueChoice[]): DialogueDef =>
  dlg(id, [node('start', lines, choices ? { choices } : {})]);

/** Eine Zeile pro Tag aus einem Pool (28-Tage-Kalender). */
function pool(prefix: string, lines: DialogueLine[][], base: Condition, answers?: (i: number) => DialogueChoice[] | undefined): { defs: DialogueDef[]; talk: TalkDef[] } {
  const defs: DialogueDef[] = [];
  const talk: TalkDef[] = [];
  lines.forEach((l, i) => {
    const id = `${prefix}-${i + 1}`;
    const days: number[] = [];
    for (let d = i + 1; d <= 28; d += lines.length) days.push(d);
    defs.push(zeile(id, l, answers?.(i)));
    talk.push({ dialogue: id, when: all(base, { cycleDay: days }) });
  });
  return { defs, talk };
}

const ANDERE_ROMANZEN = ['hunter', 'dante', 'collin-charleston', 'lio-funkel', 'raven', 'kiki-karbon', 'delya-delloraine', 'marla-sand'];
const FREMDFLIRT: Condition = any(...ANDERE_ROMANZEN.map((id) => flag(`flirt_${id}`)));
const FREMDFLIRT_LOESCHEN = ANDERE_ROMANZEN.map((id) => set(`flirt_${id}`, false));
const IN_BEZIEHUNG: Condition = all(R, ZUSAMMEN);

// Eifersucht und Trennung (beide Spielfiguren).
const eifersucht = zeile('aria-tag-eifersucht', [
  a('Ich hab gesehen, wie du geguckt hast.', 'wut'),
], [
  ch('„Wie hab ich denn geguckt?“', undefined, { when: V, effects: [set('aria_eifersucht_gewarnt'), ...FREMDFLIRT_LOESCHEN, { dialogue: 'aria-tag-eifersucht-vex' }] }),
  ch('„Wie hab ich denn geguckt?“', undefined, { when: NOT_V, effects: [set('aria_eifersucht_gewarnt'), ...FREMDFLIRT_LOESCHEN, { dialogue: 'aria-tag-eifersucht-andere' }] }),
]);
const eifersuchtVex = zeile('aria-tag-eifersucht-vex', [
  a('Noch einmal, und ich häng dein Gurtzeug an den Funkmast. Mit dir drin.', 'wut'),
  v('… Verstanden.', 'besorgt'),
  a('Gut. Und jetzt küss mich, damit alle sehen, wem du gehörst. Ich mein: zu wem.', 'verlegen'),
]);
const eifersuchtAndere = zeile('aria-tag-eifersucht-andere', [
  a('Noch einmal, und ich zeig dir, wofür der Zerberster eigentlich gebaut ist. Und dann zeig ich\'s der anderen Person.', 'wut'),
  a('Ich teil nicht. Ich hab nie geteilt. Ich hab ein Shirt, einen Arm und dich. Fertig.', 'trauer'),
]);
const trennung = dlg('aria-tag-trennung', [
  node('start', [
    a('Ich hab dich gewarnt. Einmal. Ich warn nicht zweimal.', 'trauer'),
    a('Okay. Hau ab, bevor ich was kaputtmach.', 'trauer'),
  ], {
    effects: [
      set('aria_romanze_zusammen', false), set('aria_romanze_angebahnt', false), set('aria_romanze_freundschaft'),
      set('aria_eifersucht_gewarnt', false), ...FREMDFLIRT_LOESCHEN, herz(-200),
    ],
  }),
]);
const redenTrennung = dlg('aria-tag-reden', [
  node('start', [a('Was? Du guckst so, als hättest du \'n Paket verloren. Oder \'nen Arm.', 'besorgt')], {
    choices: [
      ch('„Ich will Schluss machen.“', 'schluss'),
      ch('„Nix. Komm her.“', 'nix'),
    ],
  }),
  node('schluss', [
    n('Sie sagt sehr lange nichts.'),
    a('Okay. Hau ab, bevor ich was kaputtmach.', 'trauer'),
    a('… Die Andenken behältst du. Wehe, du schmeißt was weg.', 'trauer'),
  ], { effects: [set('aria_romanze_zusammen', false), set('aria_romanze_freundschaft'), herz(-200)] }),
  node('nix', [a('Komm du doch her. Ich bin bequem.', 'zaertlich')]),
]);

// Streit (Akt-1-Weg und Akt 2).
const streitZeile = zeile('aria-tag-streit', [
  a('Hab zu tun.', 'wut'),
  n('Sie dreht dir den Rücken zu. Der Zerberster knackt, als sie die Faust ballt.'),
]);
const streitKanal4 = zeile('aria-tag-streit-kanal4', [
  a('Hab zu tun.', 'wut'),
  a('… Die Kuriere grüßen mich mit Herzchen. Mit HERZCHEN, Vex.', 'verlegen'),
  n('Sie geht. Aber sie dreht sich an der Tür noch mal um. Nur ganz kurz.'),
]);

// Vex: Wochen-Wiederholungen.
const montag = zeile('aria-vex-montag', [a('Montag. Ripper-Tag. Soll ich mitkommen und böse gucken?', 'signatur')], [
  ch('„Komm mit.“', undefined, { effects: [herz(5)] }),
  ch('„Ich krieg das allein hin.“'),
]);
const montagRaten = zeile('aria-vex-montag-raten', [
  a('Montag. Ripper-Tag. Lass mich die Raten übernehmen. Ich hab gespart. Ehrlich. Fast.', 'zaertlich'),
], [ch('„Nee. Den stotter ich selber ab. Ist das Einzige, was ich behalt.“', 'nee', { effects: [set('vexaria_raten_angeboten'), herz(10)] })]);
montagRaten.nodes.push(node('nee', [a('… Du bist so ein stures Stück Paketband.', 'zaertlich')]));
const dachrennen = zeile('aria-vex-dachrennen', [
  a('Freitagnacht. Dach. Revanche. Ich hab neue Schuhe. Die haben Profil. Glaub ich.', 'signatur'),
], [
  ch('Mitrennen. Und gewinnen.', undefined, { check: chk('vexaria-dachrennen-reflexe', 'reflexe', 6, ['dach', 'rennen']), effects: [set('vexaria_rennen_woche'), herz(10), { xp: 20 }, { advanceTime: 30 }] }),
  ch('Mitrennen. Sie gewinnen lassen.', undefined, { effects: [set('vexaria_rennen_woche'), herz(10), { advanceTime: 30 }] }),
  ch('„Nächste Woche.“'),
]);
const mast = zeile('aria-vex-mast', [a('Mast?', 'zaertlich'), v('Mast.', 'zaertlich')], [
  ch('Hoch zum Funkmast.', undefined, { effects: [set('vexaria_mast_woche'), herz(10), { advanceTime: 60 }] }),
  ch('„Heute nicht, Stern.“'),
]);
const nachtWiederTalk: TalkDef = {
  dialogue: 'vexaria-nacht-wieder',
  when: all(V, R, flag('aria_kuss'), any(flag('aria_nacht'), flag('vexaria_licht_spaeter')), noFlag('vexaria_nacht_woche'), { time: ['abend', 'nacht'] }),
};
const gegangenAbend = zeile('aria-vex-gegangen', [
  a('Nächstes Mal weckst du mich, bevor du abhaust. Abhauen ist dein Ding, schon klar. Aber nicht von mir.', 'besorgt'),
], [ch('„Versprochen.“', undefined, { effects: [set('vexaria_gegangen_besprochen'), herz(10)] })]);
const budeMorgens = zeile('aria-vex-bude-morgens', [
  a('Bude oder Quartier? Mir egal. Hauptsache, du bist morgens noch da.', 'zaertlich'),
], [ch('„Bin ich.“', undefined, { effects: [set('vexaria_bude_zeile')] })]);
const armSummt = zeile('aria-vex-arm-summt', [
  a('Dein Arm summt. Dante hat dich verwöhnt. Ich bin eifersüchtig. Auf Dante.', 'freude'),
], [ch('„Summt nur, wenn du da bist.“', undefined, { effects: [set('vexaria_summt_zeile')] })]);

// Vex: Flirt-Antworten (world.md „Vex-Antworten“), an jeder Flirt- und Zusammen-Zeile.
const vexAntworten = (i: number): DialogueChoice[] => [
  ch('„Ich liefer pünktlich. Auch das.“', `ant-${i}-a`),
  ch('„Zöpfe. Du bist laut. Ich mag laut. Sag\'s keinem.“', `ant-${i}-b`),
  ch('„Ich hab \'ne Hose mit acht Taschen. Rate, in welcher meine Hände gleich sind.“', `ant-${i}-c`, { check: chk('vexaria-flirt-ausstrahlung', 'ausstrahlung', 3, ['flirt']) }),
  ch('Zopf schnappen, Kuss auf die Wange, weg.', `ant-${i}-d`, { check: chk('vexaria-flirt-reflexe', 'reflexe', 6, ['flirt']) }),
];
const vexAntwortKnoten = (i: number) => [
  node(`ant-${i}-a`, [a('Pünktlich. Klar. Das ist dein Vorspiel, oder? Pünktlichkeit.', 'verlegen')]),
  node(`ant-${i}-b`, [a('Ich sag\'s allen. Laut. Ich bin ja laut.', 'freude')]),
  node(`ant-${i}-c`, [a('… In MEINER Jacke, du Sau.', 'verlegen')], { effects: [{ checkBuff: { id: 'aria-flirt-beschwingt', label: 'Beschwingt', value: 1, attribute: 'ausstrahlung', forDays: 0, consumes: false } }] }),
  node(`ant-${i}-d`, [
    n('Du schnappst einen Zopf, ziehst sie dran zu dir, Kuss auf die Wange, und bist zwei Meter weg, bevor der Zerberster da ist, wo du eben warst.'),
    a('DU! Komm zurück, ich war noch nicht fertig mit dir!', 'verlegen'),
  ]),
];
const flirtDlg = (id: string, lines: DialogueLine[], i: number): DialogueDef =>
  dlg(id, [node('start', lines, { choices: vexAntworten(i) }), ...vexAntwortKnoten(i)]);

function vexPool(prefix: string, lines: DialogueLine[][], base: Condition): { defs: DialogueDef[]; talk: TalkDef[] } {
  const defs: DialogueDef[] = [];
  const talk: TalkDef[] = [];
  lines.forEach((l, i) => {
    const id = `${prefix}-${i + 1}`;
    const days: number[] = [];
    for (let d = i + 1; d <= 28; d += lines.length) days.push(d);
    defs.push(flirtDlg(id, l, i));
    talk.push({ dialogue: id, when: all(base, { cycleDay: days }) });
  });
  return { defs, talk };
}

const VEX_FLIRT = vexPool('aria-vex-flirt', [
  [a('Hör auf, so lässig an der Wand zu lehnen. Das ist Körperverletzung. An mir.', 'verlegen')],
  [a('Deine Hose hat acht Taschen. Ich hab nachgezählt. Mit den Händen.', 'verlegen')],
  [a('Du hast Kettenöl am Hals. Halt still. … Nee, ist weg. Ich wollt nur anfassen.', 'zaertlich')],
  [a('Wenn du mich noch mal so schräg anguckst, vergess ich, dass wir in der Öffentlichkeit sind. Und Hunter vergisst es nie.', 'verlegen')],
  [a('Du bist das Einzige hier, das schneller ist als ich. Und das Einzige, das ich einholen will.', 'zaertlich')],
  [a('Glotz nicht so. Oder doch. Mir egal. … Nee, glotz weiter.', 'verlegen')],
  [a('Wenn du heute wieder mit dem Gurtzeug über die Dächer turnst, guck ich zu. Nur damit du\'s weißt. Ich guck immer zu.', 'verlegen')],
], all(V, R, any(ANGEBAHNT, seen('rom-vexaria-bude')), noFlag('aria_romanze_zusammen'), noFlag('aria_romanze_streit')));

const VEX_ZUSAMMEN = vexPool('aria-vex-zusammen', [
  [a('Da ist ja mein Lieblingsproblem.', 'zaertlich')],
  [a('Wenn du heute stirbst, bring ich dich um.', 'signatur')],
  [a('Da ist ja meine Lieblingslieferung.', 'freude')],
  [a('Ich hab dir \'n Kronkorken ans Gurtzeug geklebt. Merkst du erst heute Abend.', 'signatur')],
  [a('Hundert Meter. Neunzig. Weißt du noch?', 'zaertlich')],
  [a('Wenn du heute über die Lücke springst, spring ich mit. Wenn nicht, wart ich drüben.', 'zaertlich')],
  [a('Kanal neun. Ich hab nur reingerauscht, um zu hören, ob du da bist. Bist du. Gut. Tschüss.', 'verlegen')],
  [a('Du hast heute gelacht. Zweimal. Ich führ Buch.', 'freude')],
  [a('Zehn Schnallen. Ich zähl sie abends. Wie Schäfchen, nur geiler.', 'verlegen')],
  [a('Du hast im Schlaf „Zustellung erfolgt“ gesagt. Was soll ich damit anfangen?', 'freude')],
  [a('Die Kuriere grüßen mich immer noch mit Herzchen. Ich hab \'nen Ruf, Vex. Den hast du ruiniert. Danke.', 'zaertlich')],
  [a('Hunter will wissen, ob du jetzt Prozente zahlst, weil du sein Crewmitglied knutschst. Ich hab ihm den Schläger gezeigt.', 'signatur')],
  [a('Dreh dich mal um. … Nur so. Ich wollt sehen, ob du\'s machst.', 'zaertlich')],
  [a('Ich träum nicht mehr vom Klappern. Ich träum, wie du über Dächer rennst. Ist anstrengender. Aber schöner.', 'zaertlich')],
  [v('Wenn du mich weiter so anguckst, liefer ich heut nix aus.', 'verlegen'), a('Dann guck ich weiter. Die Pakete können warten. Ich nicht.', 'verlegen')],
  [v('Paket für dich. Inhalt: ich. Unterschreib hier.', 'signatur'), a('Wo? … Oh. DA. Okay. Mit Zähnen oder mit Kuli?', 'verlegen')],
  [v('Hab dir was mitgebracht.', 'neutral'), a('Ist es ein Paket?', 'freude'), v('Es ist immer ein Paket.', 'signatur')],
], all(V, IN_BEZIEHUNG));

const VEX_RIVALINNEN = pool('aria-vex-rivalinnen', [
  [a('Na, Postbotin. Zehn Prozent.', 'signatur')],
  [a('Freitag. Dach. Bring Taschentücher.', 'signatur')],
  [a('Ich hab Hunters Geländer bezahlt. Mit deinem Geld. Kleiner Scherz. Mit seinem.', 'freude')],
  [a('Du bist mir \'ne Revanche schuldig. Oder ich dir. Egal, wir machen einfach weiter.', 'signatur')],
], all(V, not(seen('rom-vexaria-bude'))), (i) => (i === 0 ? [
  ch('„Zehn Prozent von nix.“'),
  ch('Eine Volt-Limo auf den Tresen stellen.', undefined, { when: flag('vexaria_limo_schuld'), effects: [set('vexaria_limo_schuld', false), herz(10)] }),
] : undefined));

const VEX_CREW = pool('aria-vex-crew', [
  [a('Na, Rennsemmel. Heute schon jemanden zugestellt?', 'freude')],
  [a('Vega sagt, du hast gestern mit \'ner Taube geredet. Ich sag nix. Ich mach das auch.', 'freude')],
  [a('Wenn du mich noch mal „Großmaul“ nennst, nenn ich dich „Paketband“. Vor allen.', 'signatur')],
  [a('Crew-Abend? Hunter zahlt. Hunter weiß es noch nicht.', 'freude')],
  [a('Du bist komisch. Gutes Komisch. Kas-Komisch, schätz ich.', 'neutral')],
], all(V, seen('rom-vexaria-bude')));

// Andere Spielfiguren: Kanon-Flirt, Kanon-Zusammen, Alltag.
const ANDERE_FLIRT = pool('aria-flirt', [
  [a('Glotz nicht so. Oder doch. Mir egal. … Nee, glotz weiter.', 'verlegen')],
  [a('Wenn du mich noch mal so anfasst, wenn ich wütend bin, vergess ich, warum ich wütend war. Arschloch.', 'verlegen')],
  [a('Ich kann mit der Hand Stahl biegen. Willst du wissen, was ich mit der anderen kann? … Kochen. Schlecht.', 'signatur')],
  [a('Du bist das Einzige hier, das ich nicht kaputtmachen will.', 'zaertlich')],
], all(NOT_V, R, ANGEBAHNT, noFlag('aria_romanze_zusammen')), () => [
  ch('„Glotz ich doch gern.“', undefined, { effects: [] }),
  ch('Ihr eine Strähne aus dem Gesicht streichen.', undefined, { check: chk('aria-flirt-ausstrahlung', 'ausstrahlung', 5, ['flirt']) }),
]);
const ANDERE_ZUSAMMEN = pool('aria-zusammen', [
  [a('Da ist ja mein Lieblingsproblem.', 'zaertlich')],
  [a('Wenn du heute stirbst, bring ich dich um.', 'signatur')],
  [a('Ich hab dir \'nen Kronkorken in die Jackentasche gesteckt. Glücksbringer. Oder Müll. Such\'s dir aus.', 'freude')],
  [a('Vega sagt, ich grins seit Tagen. Ich hab gesagt, das ist ein Krampf.', 'verlegen')],
  [a('Wenn\'s heute schiefgeht, trag ich dich raus. Wenn\'s gut geht, auch.', 'zaertlich')],
  [a('Komm her. Nur kurz. … Okay, nicht nur kurz.', 'zaertlich')],
], all(NOT_V, IN_BEZIEHUNG));
const ANDERE_ALLTAG: { defs: DialogueDef[]; talk: TalkDef[] } = (() => {
  const defs = [
    zeile('aria-alltag-morgen', [a('Inkasso. Morgens zahlen die Leute lieber. Noch nicht wach genug, um wegzurennen.', 'signatur')]),
    zeile('aria-alltag-tag', [a('Neon-Gasse ist meine Gasse. Ich pass auf. Wenn einer Ärger macht, hab ich Spaß.', 'freude')]),
    zeile('aria-alltag-werkstatt', [a('Armwartung. Dante sagt, ich soll stillhalten. Ich halt nie still. Er weiß das.', 'freude')]),
    zeile('aria-alltag-abend', [a('Setz dich. Bier? Nein? Dann trinkst du halt Limo wie ein Kind. Ich urteil nicht. Doch.', 'freude')]),
    zeile('aria-alltag-nacht', [a('Tanzfläche. Komm schon. Ich tret dir nicht auf die Füße. Absichtlich nicht.', 'signatur')]),
    zeile('aria-alltag-oberstadt', [a('Snob.', 'wut'), n('Sie sagt es zu dir. Dann geht sie.')]),
    zeile('aria-alltag-oberstadt-witz', [a('Na, Snob? … Ist jetzt ein Kosename. Gewöhn dich dran.', 'freude')]),
    zeile('aria-alltag-knast', [a('Du hast gesessen? Cool. Ich meine: nicht cool. Aber cool.', 'ueberrascht')]),
    zeile('aria-alltag-vertraut', [a('Weißt du was? Du bist okay. Mehr als okay. Sag\'s keinem, ich hab \'nen Ruf.', 'freude')]),
  ];
  const talk: TalkDef[] = [
    { dialogue: 'aria-alltag-oberstadt', when: all({ origin: 'origin-oberstadt' }, { not: { hearts: 'aria', min: 4 } }) },
    { dialogue: 'aria-alltag-oberstadt-witz', when: all({ origin: 'origin-oberstadt' }, { cycleDay: [3, 10, 17, 24] }) },
    { dialogue: 'aria-alltag-knast', when: all({ origin: 'origin-knastvogel' }, { cycleDay: [5, 19] }) },
    { dialogue: 'aria-alltag-vertraut', minHearts: 6, when: { cycleDay: [7, 14, 21, 28] } },
    { dialogue: 'aria-alltag-morgen', when: { time: 'morgen' } },
    { dialogue: 'aria-alltag-werkstatt', when: all({ time: 'tag' }, { weekday: ['di', 'do'] }) },
    { dialogue: 'aria-alltag-tag', when: { time: 'tag' } },
    { dialogue: 'aria-alltag-nacht', when: { time: 'nacht' } },
    { dialogue: 'aria-alltag-abend' },
  ];
  return { defs, talk };
})();

const talk: TalkDef[] = [
  // Eifersucht/Trennung zuerst.
  { dialogue: 'aria-tag-trennung', when: all(IN_BEZIEHUNG, flag('aria_eifersucht_gewarnt'), FREMDFLIRT) },
  { dialogue: 'aria-tag-eifersucht', when: all(IN_BEZIEHUNG, noFlag('aria_eifersucht_gewarnt'), FREMDFLIRT) },
  // Streit.
  { dialogue: 'aria-tag-streit-kanal4', when: all(V, any(STREIT, flag('aria_krach')), flag('vexaria_kanal4')) },
  { dialogue: 'aria-tag-streit', when: any(STREIT, flag('aria_krach')) },
  // Vex: besondere Zeilen.
  nachtWiederTalk,
  { dialogue: 'aria-vex-gegangen', when: all(V, flag('vexaria_morgen_gegangen'), noFlag('vexaria_gegangen_besprochen'), { time: ['abend', 'nacht'] }) },
  { dialogue: 'aria-vex-bude-morgens', when: all(V, any(flag('vexaria_morgen_zurueck'), flag('vexaria_morgen_geblieben')), noFlag('vexaria_bude_zeile')) },
  { dialogue: 'aria-vex-arm-summt', when: all(V, flag('vexaria_armwartung'), noFlag('vexaria_summt_zeile')) },
  { dialogue: 'aria-vex-montag-raten', when: all(V, { weekday: 'mo' }, seen('rom-vexaria-kuss'), noFlag('vexaria_raten_angeboten')) },
  { dialogue: 'aria-vex-montag', when: all(V, { weekday: 'mo' }, seen('rom-vexaria-armdruecken')) },
  { dialogue: 'aria-vex-mast', when: all(V, seen('rom-vexaria-funkmast'), { time: 'nacht' }, noFlag('vexaria_mast_woche')) },
  { dialogue: 'aria-vex-dachrennen', when: all(V, seen('rom-vexaria-luecke'), { weekday: ['fr', 'sa'] }, { time: 'nacht' }, noFlag('vexaria_rennen_woche')) },
  // Akt 2/3 und Nachspiel (akt2.ts, nachspiel.ts): Dachnacht-Frage, Akt-2-Flirtpool, Alltag am Meer.
  ...NACHSPIEL_TALK, ...AKT2_TALK,
  // Kanon: neuer Date-Versuch.
  { dialogue: 'aria-date-nochmal', when: all(flag('aria_date_spaeter'), noFlag('aria_romanze_angebahnt'), WARTEN_VORBEI, R) },
  // Reden über Schluss (nur im Status zusammen, selten angeboten).
  { dialogue: 'aria-tag-reden', when: all(IN_BEZIEHUNG, { cycleDay: [13, 27] }) },
  ...VEX_ZUSAMMEN.talk, ...VEX_FLIRT.talk, ...VEX_RIVALINNEN.talk, ...VEX_CREW.talk,
  ...ANDERE_ZUSAMMEN.talk, ...ANDERE_FLIRT.talk, ...ANDERE_ALLTAG.talk,
];

// ---------------------------------------------------------------------------
// NpcDef

const aria: NpcDef = {
  id: 'aria',
  name: 'Aria',
  portrait: 'aria',
  sprite: 'aria-walk',
  faction: 'crew-hunter',
  romanceable: true,
  bio: 'Brecherin der Crew mit dem Arm-Implantat „Zerberster 3000“ und silbernem Aluschläger. Verlor vor drei Jahren als Roadie beim Kabelbrand-Abschiedskonzert in der Rennhalle 9 den linken Arm. Laut, direkt, flucht gern, wird leise, wenn es ernst wird.',
  gifts: {
    loves: ['griffband-schlaeger', 'zerberster-oel', 'volt-limo', 'kronkorkenkrone', 'bandshirt'],
    likes: ['synth-nudeln', 'nougatbombe', 'stickerbogen', 'boxbandagen', 'dantes-kekse'],
    dislikes: ['parfuem-ozon', 'taschenspiegel-gold'],
    hates: ['defekter-neurochip', 'handschellen', 'seidentuch-blau'],
  },
  schedule: [
    // Akt 2, Variante A: gechippt bei Xion/Ripper bzw. bewusstlos, bis main-2-countdown (Vex: bis zur Rettung, akt2.ts).
    {
      when: all(flag('aria_gechippt'), not({ quest: 'main-2-countdown', state: 'done' }), noFlag('vexaria_gerettet')),
      place: 'away',
    },
    // Ende 3 ohne 3b: Aria ist mit der Crew am Meer, ohne die Spielfigur.
    { when: all({ flag: 'epilog' }, flag('ende_master'), noFlag('ende_doch_noch_meer')), place: { map: 'das-meer', at: 'lagerfeuer' } },
    // Nachspiel: Freitag bis Sonntag am Meer.
    { days: ['fr', 'sa', 'so'], when: { flag: 'epilog' }, place: { map: 'das-meer', at: 'wasserlinie' } },
    // Partynacht (Akt 3, vor dem Nachspiel): im Himmelsgarten.
    { when: all({ act: 3 }, noFlag('epilog')), place: { map: 'himmelsgarten', at: 'tanzflaeche-glas' } },
    // Vex × Aria: Frühstück nach Station 11 am Tresen.
    { slot: ['morgen', 'tag'], when: all(V, flag('vexaria_fruehstueck')), place: { map: 'high-voltage', at: 'fruehstueckstisch' } },
    { slot: 'morgen', place: { map: 'schrottmarkt', at: 'inkasso-gasse' } },
    { slot: 'tag', days: ['di', 'do'], place: { map: 'dantes-werkstatt', at: 'einbau-liege' } },
    { slot: 'tag', place: { map: 'neon-gasse', at: 'gassenmitte' } },
    { slot: 'abend', place: { map: 'high-voltage', at: 'vega-aria-tisch' } },
    { slot: 'nacht', place: { map: 'high-voltage', at: 'tanzflaeche' } },
  ],
  heartEvents: [
    ...KANON_EVENTS, ...ARIA_AKT1_EVENTS, ...RIVALINNEN_EVENTS, ...FUNKEN_EVENTS, ...BRUCH_EVENTS, ...HOEHEPUNKT_EVENTS, ...DANACH_EVENTS,
    ...ZERBERSTER_EVENTS, ...AKT2_EVENTS, ...VERSOEHNUNG_EVENTS, ...KRISE_EVENTS, ...AKT3_EVENTS, ...ENDEN_EVENTS, ...NACHSPIEL_EVENTS,
  ],
  companion: {
    recruit: { quest: 'main-1-dexter', state: 'done' },
    // Variante A: gechippt bei Ripper bzw. bis Dante den Chip zieht (wie ihr „away“ im Tagesablauf).
    // Ende 3 ohne 3b: Aria sitzt mit der Crew am Meer (Integration).
    unavailableWhen: any(
      all(flag('aria_gechippt'), not({ quest: 'main-2-countdown', state: 'done' }), noFlag('vexaria_gerettet')),
      flag('master_modus'),
    ),
    unavailableText: 'Aria ist nicht zu erreichen. Entweder steckt Quantums Chip in ihrem Nacken, oder sie will dich gerade nicht sehen.',
    stats: {
      hp: 60, armor: 3, morale: 85,
      attributes: { technik: 2, koerper: 8, reflexe: 5, ausstrahlung: 4, strasse: 5 },
      weapon: { kind: 'nahkampf', damage: 6, range: 1, ability: 'waffe-homerun' },
      abilities: ['aria-homerun', 'aria-zerbersten'],
    },
    heartAbilities: [{ hearts: 6, ability: 'aria-unkaputtbar' }],
    // Kanon: 15 Minuten nur im Status „zusammen“ (oder mit dem Funkgerät Kanal neun), sonst 30.
    callMinutes: 30,
    callMinutesWhen: [{ when: any(ZUSAMMEN, { item: 'funk-kanal-neun' }), minutes: 15 }],
    abilityRules: [
      // Zerberster gesperrt (Akt 2, Arm in Wartung): nur der Schläger.
      { when: flag('aria_arm_gesperrt'), remove: 'aria-zerbersten' },
      // Im Streit: kein „Unkaputtbar“ (world.md §4.7 „Folgen bis zur Versöhnung“).
      { when: IM_STREIT, remove: 'aria-unkaputtbar' },
    ],
    duo: [
      // Vex × Aria: „Paket für dich!“ – „Zugestellt.“ (Spielfigur + Begleiterin, auch mit gesperrtem Arm).
      { ability: 'duo-express-zustellung', holder: 'player', when: all(V, { hearts: 'aria', min: 6 }, not(IM_STREIT)) },
      // Nach Station 12 (Funkmast): Aria stellt sich vor Vex.
      {
        ability: 'duo-rueckendeckung', holder: 'companion',
        when: all(V, { hearts: 'aria', min: 6 }, any(flag('vexaria_rueckendeckung'), flag('vexaria_funkmast')), not(IM_STREIT)),
      },
      // Kanon „Rücken an Rücken“: zusammen und mit dem Kabelbrand-Pass.
      { ability: 'duo-ruecken-an-ruecken', holder: 'player', when: all(ZUSAMMEN, { item: 'kabelbrand-pass' }, not(IM_STREIT)) },
      // Duos mit anderen Begleitern (beide in der Party, Spielfigur mit beiden ♥6).
      {
        ability: 'duo-die-wachhunde',
        when: all({ companion: 'vega' }, { hearts: 'aria', min: 6 }, { hearts: 'vega', min: 6 }, not(IM_STREIT)),
      },
      {
        ability: 'duo-abrissbirne',
        when: all({ companion: 'jimmy' }, { hearts: 'aria', min: 6 }, { hearts: 'jimmy', min: 6 }, not(IM_STREIT)),
      },
    ],
  },
  talk,
};

export const part: ContentPart = {
  npcs: { aria },
  dialogues: byId([
    he2, he4, he6,
    eifersucht, eifersuchtVex, eifersuchtAndere, trennung, redenTrennung, streitZeile, streitKanal4,
    montag, montagRaten, dachrennen, mast, gegangenAbend, budeMorgens, armSummt,
    ...VEX_FLIRT.defs, ...VEX_ZUSAMMEN.defs, ...VEX_RIVALINNEN.defs, ...VEX_CREW.defs,
    ...ANDERE_FLIRT.defs, ...ANDERE_ZUSAMMEN.defs, ...ANDERE_ALLTAG.defs,
  ]),
};

