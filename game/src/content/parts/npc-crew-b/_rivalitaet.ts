// Rivalitäts-Ereignisse re-<npc>-2/-5/-8 für Vega, Aria, Nyra, Jimmy und Captain Kuschel (world.md §4.1, §4.2).
// Kein eigener Inhaltsteil: Die Figurendateien holen Dialoge, Ereignisse und Folgen hier ab (Aria: vexaria/aria.ts).
// Schon vorhanden und unverändert: re-vega-5 (Wettschießen), re-nyra-5 (Hack-Duell), re-captain-kuschel-5 (Zettelkrieg).
// Versöhnung wie bisher über das Rivalen-Menü der Figur (`reconcile`): Vega Kaffee um 06:00, Nyra Postkarte vom Meer,
// Kuschel Ohrenflick bzw. Nadel und Faden, Aria neues Griffband, Jimmy eine Entschuldigung (er kann niemandem böse sein).
import type { Condition, DialogueChoice, DialogueDef, HeartEventDef, NewsDef, TimeSlot } from '../../../modules/contracts';
import type { Menue } from './_helfer';
import { dialog, erz, flag, herz, ich, knoten, pruefung, sprecher } from './_helfer';

const V = sprecher('vega');
const A = sprecher('aria');
const N = sprecher('nyra');
const J = sprecher('jimmy');
const K = sprecher('captain-kuschel');
const D = sprecher('dante');
const H = sprecher('hunter');

/** Rivalitäts-Ereignis (negatives Herz). */
const re = (npc: string, stufe: 2 | 5 | 8, map: string, time: TimeSlot | TimeSlot[] | undefined, when: Condition): HeartEventDef => {
  const id = `re-${npc}-${stufe}`;
  const ev: HeartEventDef = { id, hearts: -stufe, map, when, dialogue: id };
  if (time) ev.time = time;
  return ev;
};

// ---------------------------------------------------------------------------------------------- Vega

/** Folgen der Rivalität (world.md §4.2): keine Hinweise mehr, Fehler landen bei Hunter. */
export const VEGA_RIVALE: Condition = { rival: 'vega' };

const reVega2 = dialog('re-vega-2', [
  knoten('start', [
    erz('Dach über der Neon-Gasse, früh. Vega liegt am Fernrohr. Du fragst nach dem Wind. Sie antwortet nicht.'),
    V('Wind? Find’s selbst raus. Guck auf die Wäsche. Oder auf die Fahnen. Die Fahnen lügen, aber das sag ich dir ja nicht mehr.', 'wut'),
    V('Ab heute gibt’s keine Meter mehr von mir. Keine Ecken, keine Verstecke, kein „Der Typ links hat ein Messer“. Du bist auf dich allein gestellt. Viel Glück. Meint niemand ernst.'),
  ], {
    effects: [flag('vega_keine_hinweise')],
    choices: [
      { text: '„Vega. Was hab ich dir getan?“', next: 'getan' },
      { text: '„Ich hab auch Augen.“', next: 'augen' },
    ],
  }),
  knoten('getan', [V('Frag nicht mich. Frag dich. Du hast zwei Ohren und ein Gewissen. Eins davon funktioniert.', 'wut')]),
  knoten('augen', [V('Zwei. Und beide gucken in die falsche Richtung. Aber mach ruhig.', 'signatur')]),
]);

const reVega8 = dialog('re-vega-8', [
  knoten('start', [
    erz('High Voltage, Abend. Vega steht am Tresen, mit Hunter, und zeigt nicht auf dich. Sie muss nicht. Hunter guckt schon.'),
    V('Bahnhof, Dienstag: vergeigt. Schrottmarkt, Donnerstag: vergeigt. Die Tür hinterm Club: offen gelassen. Ich hab alles notiert. Mit Uhrzeit.', 'wut'),
    H('Stimmt das?', 'wut'),
    V('Ich treffe immer, Boss. Auch mit Worten.'),
  ], {
    effects: [herz('hunter', -30), flag('vega_hat_gepetzt')],
    choices: [
      { text: '„Die Hälfte davon stimmt nicht.“', check: pruefung('re-vega-8-widerspruch', 'ausstrahlung', 6, ['ueberreden']), next: 'haelfte' },
      { text: 'Nichts sagen. Gehen.', next: 'gehen' },
    ],
  }),
  knoten('haelfte', [
    H('Die Hälfte. Hm. Dann zahl ich dir auch nur die Hälfte vom Ärger. Raus hier. Beide.', 'signatur'),
    V('… Die Tür war wirklich offen. Der Rest war vielleicht ein bisschen Ballistik.', 'besorgt'),
  ], { effects: [herz('hunter', 20), herz('vega', 20)] }),
  knoten('gehen', [
    erz('Du gehst. An der Tür drehst du dich um. Vega guckt dir nach. Durchs Zielfernrohr, ohne Gewehr. Aus Gewohnheit. Oder nicht.'),
  ]),
]);

export function vegaEvents(base: Condition): HeartEventDef[] {
  return [
    re('vega', 2, 'neon-gasse', 'morgen', base),
    re('vega', 8, 'high-voltage', 'abend', base),
  ];
}
export const VEGA_RE: DialogueDef[] = [reVega2, reVega8];

// ---------------------------------------------------------------------------------------------- Aria

const reAria2 = dialog('re-aria-2', [
  knoten('start', [
    erz('Schrottmarkt, früh. Aria lehnt am Stand gegenüber, den Schläger über der Schulter, und hält dir die offene Hand hin. Die echte.'),
    A('Morgen, Schätzchen. Schutzgeld. Zehn Credits.', 'signatur'),
    ich('Schutz wovor?'),
    A('Vor mir. Ist ein Sonderangebot. Nur für dich. Weil ich dich gerade so richtig scheiße finde.', 'wut'),
  ], {
    choices: [
      { text: 'Zehn Credits in die Hand legen.', requires: { credits: 10 }, next: 'zahlen', effects: [{ credits: -10 }, herz('aria', 10)] },
      {
        text: 'Die Mülltonne fangen, bevor sie fliegt.', next: 'tonne',
        check: pruefung('re-aria-2-tonne', 'reflexe', 6, ['kampf']), effects: [herz('aria', 30)],
      },
      { text: '„Verpiss dich, Aria.“', next: 'verpiss' },
    ],
  }),
  knoten('zahlen', [
    A('Danke, Schätzchen. Schönen Tag noch. Du bist jetzt geschützt. Vor mir. Bis Montag.', 'freude'),
    erz('Sie steckt die Münzen ein, ohne hinzusehen. Dann, leiser, mehr zu sich selbst: „Scheiße. Das hat keinen Spaß gemacht.“'),
  ]),
  knoten('tonne', [
    erz('Sie packt die Tonne, holt aus, und du bist schon da. Deine Hände am Rand, ihre am Griff, die Tonne zwischen euch wie ein sehr hässlicher Tanzpartner.'),
    A('… Okay. Das war nicht schlecht. Das war sogar ziemlich gut, du Arschloch.', 'ueberrascht'),
    A('Schutzgeld ist trotzdem fällig. Nächste Woche. Mit Zinsen.', 'signatur'),
  ]),
  knoten('verpiss', [
    erz('Die Tonne fliegt. Nicht auf dich. Einen Meter neben dich, in einen Stapel leerer Kisten, die das nicht verdient haben.'),
    A('Ich verpiss mich nie. Ich bin von hier. Du bist zu Besuch.', 'wut'),
  ]),
]);

const reAria5 = dialog('re-aria-5', [
  knoten('start', [
    erz('Glasarkaden, Pixelpalast, Abend. Hinter den Automaten gibt es ein Bällebad für Kindergeburtstage. Heute ist kein Kindergeburtstag. Heute steht Aria drin, bis zu den Knien in bunten Plastikkugeln, und winkt dich mit dem Zerberster heran.'),
    A('Du. Rein da. Wir klären das. Ohne Schläger, ich bin ja kein Monster. Nur mit Bällen. Und Fäusten.', 'signatur'),
    erz('Der Aufseher, ein Junge mit Kopfhörern und einer Plakette „Spaßbeauftragter“, guckt kurz hoch und entscheidet sich, nichts gesehen zu haben.'),
  ], {
    choices: [
      {
        text: 'Reinspringen und ringen.', next: 'gewonnen',
        check: pruefung('re-aria-5-baellebad', 'koerper', 7, ['kampf', 'kraft']), effects: [herz('aria', 60), { xp: 30 }],
      },
      { text: 'Reinspringen. Und verlieren. Spektakulär.', next: 'verloren', effects: [herz('aria', 30)] },
      { text: 'Eine Handvoll Bälle werfen und abhauen.', next: 'feige', effects: [herz('aria', -10)] },
    ],
  }),
  knoten('gewonnen', [
    erz('Ihr verschwindet beide unter der Oberfläche. Rot, gelb, blau, ein Ellbogen, ein Fluch, ein Zopf in deinem Mund. Als ihr wieder auftaucht, sitzt du auf ihr. Irgendwie. Mit einem grünen Ball in der Hand wie einer Trophäe.'),
    A('… Ich hab Bälle im BH. Ich hab Bälle überall. Du hast gewonnen. Ich hasse dich ein bisschen weniger.', 'freude'),
    A('Wir sind nicht quitt. Aber mein Schläger braucht neues Griffband. Nur so als Info. Ich sag das zu niemand Bestimmtem.', 'besorgt'),
  ]),
  knoten('verloren', [
    erz('Sie zieht dich an der Jacke rein, dreht dich einmal um dich selbst und drückt dich unter die Kugeln, bis nur noch deine Füße rausgucken. Dann setzt sie sich auf dich und lacht. Laut, schief, echt.'),
    A('Das war die beste Prügelei seit Monaten. Und keiner blutet. Ich bin fast stolz.', 'freude'),
    A('Mein Griffband ist übrigens durch. Seit Wochen. Nur so.', 'besorgt'),
  ]),
  knoten('feige', [
    erz('Drei Bälle treffen. Einer prallt vom Zerberster ab und landet im Kaffee des Spaßbeauftragten. Du bist schon draußen.'),
    A('FEIGLING! Komm zurück! Ich hab noch Bälle!', 'wut'),
  ]),
]);

const reAria8 = dialog('re-aria-8', [
  knoten('start', [
    erz('High Voltage, Nacht. Die Tanzfläche ist leer bis auf Aria. Sie sitzt auf dem Boden, den Schläger quer über den Knien, und reißt das alte Griffband ab, Streifen für Streifen.'),
    A('Weißt du, was das Schlimmste ist? Ich hab gedacht, du bist eine von den Guten. Nicht nett. Gut. Das ist was anderes.', 'trauer'),
    A('Das Griffband ist durch. Wie wir. Ich krieg ein neues. Uns krieg ich nicht neu.', 'trauer'),
    erz('Sie wirft den letzten Streifen weg. Der silberne Griff glänzt nackt im Neonlicht.'),
  ], {
    choices: [
      { text: '„Aria. Das will ich nicht.“', next: 'nicht', effects: [herz('aria', 20)] },
      { text: 'Gehen.' },
    ],
  }),
  knoten('nicht', [
    A('Dann mach was. Reden kann jeder. Ich bin Brecherin, keine Therapeutin.', 'wut'),
    A('… Pink. Wenn du je wieder Griffband kaufst. Ich mag Pink. Sag’s keinem.', 'besorgt'),
  ]),
]);

/** Arias Rivalen-Gespräch mit Versöhnung über neues Griffband (world.md §4.2). */
const RIVALE_ARIA: DialogueChoice[] = [
  {
    text: 'Ihr eine Rolle neues Griffband hinlegen. Pink.', next: 'versoehnt',
    when: { item: 'griffband-schlaeger' }, effects: [{ take: 'griffband-schlaeger' }, { reconcile: 'aria' }, { xp: 40 }],
  },
  { text: '„Zehn Credits Schutzgeld. Für diese Woche.“', requires: { credits: 10 }, next: 'schutzgeld', effects: [{ credits: -10 }, herz('aria', 5)] },
  { text: 'Schon gut. Ich geh.' },
];
const ariaRivale = dialog('aria-tag-rivale', [
  knoten('start', [
    A('Schutzgeld? Nein? Dann verpiss dich. Ich hab zu tun. Ich guck gerade böse, das ist anstrengend.', 'wut'),
  ], { choices: RIVALE_ARIA }),
  knoten('versoehnt', [
    erz('Aria nimmt die Rolle. Dreht sie in der echten Hand. Pink. Neon. Genau das, das sie immer kauft.'),
    A('Du hast dir das gemerkt.', 'ueberrascht'),
    erz('Sie wickelt es um den Griff, sofort, mitten im Gespräch, fest und sauber, Lage für Lage. Dann schwingt sie den Schläger einmal probeweise. Er pfeift.'),
    A('… Okay. Wir sind quitt. Nicht Freunde. Quitt. Und wenn du noch mal so ein Arschloch bist, bist du das Erste, was das neue Griffband zu sehen kriegt.', 'freude'),
  ]),
  knoten('schutzgeld', [A('Danke, Schätzchen. Du bist geschützt. Vor mir. Bis Montag. Glücklich macht mich das trotzdem nicht.', 'signatur')]),
]);

export function ariaEvents(base: Condition): HeartEventDef[] {
  return [
    re('aria', 2, 'schrottmarkt', 'morgen', base),
    re('aria', 5, 'glasarkaden', 'abend', base),
    re('aria', 8, 'high-voltage', 'nacht', base),
  ];
}
export const ARIA_RE: DialogueDef[] = [reAria2, reAria5, reAria8, ariaRivale];
export const ARIA_RIVALE_TALK = 'aria-tag-rivale';

// ---------------------------------------------------------------------------------------------- Nyra

/** Peinliche Aufnahmen auf dem Stadt-TV (world.md §4.2), solange die Rivalität dauert. */
export const NYRA_NEWS: Record<string, NewsDef> = {
  'news-nyra-peinlich-1': {
    id: 'news-nyra-peinlich-1', anchor: 'collin-charleston', headline: 'Zuschauervideo der Woche',
    when: { rival: 'nyra' }, priority: 1,
    lines: [
      { speaker: 'collin-charleston', text: 'Noxius, unser Zuschauervideo der Woche! Eingeschickt von „Silent-Angel“! Eine Person aus der Unterstadt, eine Nudel, ein nasser Boden. Zeitlupe, bitte!', expr: 'freude' },
      { speaker: 'delya-delloraine', text: 'Und noch mal. Und noch mal rückwärts. Mit Musik. Die Musik ist … Kammermusik?', expr: 'ueberrascht' },
      { speaker: 'collin-charleston', text: 'Exklusiv! Unglaublich! Peinlich! Ich hab’s mir dreimal angesehen. Für die Recherche.', expr: 'signatur' },
    ],
  },
  'news-nyra-peinlich-2': {
    id: 'news-nyra-peinlich-2', anchor: 'delya-delloraine', headline: 'Das Niesen von Noxius',
    when: { rival: 'nyra', min: 5 }, priority: 1,
    lines: [
      { speaker: 'delya-delloraine', text: 'Ein Hacker hat heute Nacht alle Werbetafeln am Bahnhof Mitte übernommen. Gezeigt wurde zwölf Minuten lang eine einzige Person. Beim Niesen.', expr: 'neutral' },
      { speaker: 'collin-charleston', text: 'Zwölf Minuten! Ich hab eine Sendung, die ist kürzer! Und sie hat weniger Zuschauer!', expr: 'ueberrascht' },
      { speaker: 'delya-delloraine', text: 'Die Quelle nennt sich „Silent-Angel“. Sie lässt ausrichten: „Wer mich enttäuscht, wird viral.“', expr: 'signatur' },
    ],
  },
  'news-nyra-peinlich-3': {
    id: 'news-nyra-peinlich-3', anchor: 'collin-charleston', headline: 'Sondersendung: Die Akte Unterstadt',
    when: { rival: 'nyra', min: 8 }, priority: 1,
    lines: [
      { speaker: 'collin-charleston', text: 'Sondersendung! Ein anonymer Datensatz: Eine Person aus der Unterstadt singt unter der Dusche. Falsch. Eine Stunde lang.', expr: 'freude' },
      { speaker: 'delya-delloraine', text: 'Wir zeigen das nicht. Wir haben Standards. … Wir zeigen nur den Refrain.', expr: 'besorgt' },
      { speaker: 'collin-charleston', text: 'Wer auch immer das ist: Versöhn dich mit der Absenderin. Für uns alle. Bitte.', expr: 'trauer' },
    ],
  },
};

const reNyra2 = dialog('re-nyra-2', [
  knoten('start', [
    erz('Schrottmarkt, Elektronikstand. Nyra sitzt hinter drei Bildschirmen und tippt. Als sie dich sieht, tippt sie lauter.'),
    N('Moment. Ich bin gerade beschäftigt. Ich entfolg dich. Überall. Das dauert, du bist auf erstaunlich vielen Plattformen. Auch auf welchen, wo du gar nicht bist. Da hab ich dich vorher angelegt. Damit ich dich entfolgen kann.', 'wut'),
    erz('Über dem Stand hängt ein alter Fernseher. Das Stadt-TV läuft. Gerade beginnt das Zuschauervideo der Woche.'),
    N('Oh. Guck mal. Das bist du. Rein zufällig.', 'signatur'),
  ], {
    effects: [{ news: 'news-nyra-peinlich-1' }, flag('nyra_entfolgt')],
    choices: [
      { text: '„Nyra. Das ist kindisch.“', next: 'kindisch' },
      { text: 'Mit Würde zuschauen.', next: 'wuerde', effects: [herz('nyra', 10)] },
    ],
  }),
  knoten('kindisch', [N('Kindisch ist mein Spezialgebiet. Ich hab einen Abschluss darin. Selbst ausgestellt. Mit Siegel.', 'wut')]),
  knoten('wuerde', [
    erz('Du schaust dir selbst beim Ausrutschen zu. In Zeitlupe. Mit Kammermusik. Nyras Mundwinkel zuckt. Einmal.'),
    N('Hör auf, so würdevoll zu gucken. Das macht’s weniger lustig.', 'besorgt'),
  ]),
]);

const reNyra8 = dialog('re-nyra-8', [
  knoten('start', [
    erz('Flutmauer, Abend. Nyra sitzt auf der Bank am Münzfernrohr, den Laptop auf den Knien. Sie hat das Fernrohr nicht bezahlt. Sie guckt auf den Bildschirm.'),
    N('Ich lösch gerade was. Das Dokument „Zeugenaussagen Meer“. Du warst Eintrag Nummer eins. Der einzige.', 'trauer'),
    N('Ab morgen gibt’s eine Sondersendung über dich. Auf allen Kanälen. Ich hab Material. Viel Material. Du singst unter der Dusche, wusstest du das?', 'wut'),
    N('… Wenn ich zurückkomme, wollt ihr mich dann noch? Hab ich immer gefragt. Jetzt frag ich nicht mehr.', 'trauer'),
  ], {
    effects: [{ news: 'news-nyra-peinlich-3' }],
    choices: [
      { text: '„Lösch das nicht, Nyra.“', next: 'nicht', effects: [herz('nyra', 20)] },
      { text: 'Neben ihr sitzen. Nichts sagen.', next: 'sitzen', effects: [herz('nyra', 10)] },
      { text: 'Gehen.' },
    ],
  }),
  knoten('nicht', [
    N('Zu spät. Ich hab’s in den Papierkorb geschoben. Den leer ich aber nie. Das ist ein Datenschutzproblem. Das ist mir egal.', 'besorgt'),
    N('Postkarten. Ich hab mal gesagt, ich mag Postkarten. Ich sag das jetzt nicht noch mal.', 'trauer'),
  ]),
  knoten('sitzen', [
    erz('Ihr sitzt. Unten rollt das Wasser braun gegen die Mauer. Irgendwann klappt Nyra den Laptop zu, ohne etwas gelöscht zu haben.'),
    N('Das heißt nichts. Der Akku war leer.', 'besorgt'),
  ]),
]);

export function nyraEvents(base: Condition): HeartEventDef[] {
  return [
    re('nyra', 2, 'schrottmarkt', 'tag', base),
    re('nyra', 8, 'flutmauer', 'abend', base),
  ];
}
export const NYRA_RE: DialogueDef[] = [reNyra2, reNyra8];

// ---------------------------------------------------------------------------------------------- Jimmy

const reJimmy2 = dialog('re-jimmy-2', [
  knoten('start', [
    erz('Dantes Werkstatt, früh. Jimmy sitzt auf seinem Hocker. Als du reinkommst, steht er auf, verbeugt sich und lächelt wie ein Werbeplakat, das Regen abgekriegt hat.'),
    J('Willkommen. Ihre Zufriedenheit ist uns wichtig. Bitte bewerten Sie Ihr Erlebnis mit Jimmy auf einer Skala von null bis null Sternen.', 'trauer'),
    J('Oh. Das war … alter Code. Der kommt, wenn’s wehtut. Dante sagt, das ist wie Schluckauf. Für die Seele.', 'besorgt'),
  ], {
    choices: [
      { text: '„Fünf Sterne, Jimmy.“', next: 'sterne', effects: [herz('jimmy', 20)] },
      { text: 'Schulterzucken.', next: 'zucken' },
    ],
  }),
  knoten('sterne', [J('Fünf. Von null. Das ist … mathematisch schwierig. Ich nehm’s trotzdem.', 'freude')]),
  knoten('zucken', [J('Ihre Rückmeldung wurde gespeichert. Sie wird … ach, ich mach Kakao.', 'trauer')]),
]);

const reJimmy5 = dialog('re-jimmy-5', [
  knoten('start', [
    erz('High Voltage, Abend. Jimmy steht hinter dir in der Schlange am Tresen und räuspert sich. Dreimal. Dann, mit fester Stimme:'),
    J('Sehr geehrte Kundin, sehr geehrter Kunde. Sie haben das Abo „Freundschaft“ gekündigt. Wir bedauern das sehr. Sehr. SEHR.', 'trauer'),
    J('Möchten Sie den Grund angeben? Zu teuer? Zu nervig? Zu viel Jimmy? Wir arbeiten an allem. Vor allem am Jimmy.', 'besorgt'),
    erz('Der Barkeeper stellt ihm wortlos ein Glas Wasser hin. Auf dem Bierdeckel steht „Neustart“.'),
  ], {
    choices: [
      { text: '„Ich hab nichts gekündigt, Jimmy.“', next: 'nicht', effects: [herz('jimmy', 30)] },
      { text: '„Zu viel Jimmy.“', next: 'zuviel', effects: [herz('jimmy', -10)] },
    ],
  }),
  knoten('nicht', [J('Nicht? Dann ist das ein Systemfehler. Systemfehler kann ich. Ich war sieben Wochen einer.', 'freude')]),
  knoten('zuviel', [J('Verstanden. Wir reduzieren. Ab sofort nur noch halber Jimmy. Ein Halbjimmy. Danke für Ihr Feedback.', 'trauer')]),
]);

const reJimmy8 = dialog('re-jimmy-8', [
  knoten('start', [
    erz('Crew-Quartier, Nacht. Jimmy liegt auf der Couch, die Decke bis zum Kinn, und starrt an die Decke. Als du reinkommst, sagt er, ohne den Kopf zu drehen:'),
    J('Fehler 404. Freund nicht gefunden.', 'trauer'),
    J('Ich kann nicht sauer sein. Hab’s probiert. Ich hab geübt, vor dem Spiegel, mit böser Stimme. Der Spiegel hat gelacht. Ich auch. Dann hab ich geheult.', 'trauer'),
    J('Sag einfach was. Irgendwas. Ich nehm alles. Ich war mal Kundenservice.', 'besorgt'),
  ], {
    choices: [
      { text: '„Es tut mir leid, Jimmy. Wirklich.“', next: 'leid', effects: [{ reconcile: 'jimmy' }, { xp: 30 }] },
      { text: 'Die Decke zurechtzupfen und gehen.', next: 'decke', effects: [herz('jimmy', 20)] },
    ],
  }),
  knoten('leid', [
    J('Okay.', 'freude'),
    J('Einfach so. Okay. Ich hab dir doch gesagt, ich kann nicht böse sein. Das ist kein Bug. Das ist das Einzige, was der Chip nicht kaputt gekriegt hat.', 'freude'),
    erz('Er dreht sich zur Wand und schläft ein, bevor du die Tür erreichst. Er lächelt im Schlaf. Ganz ohne Werbung.'),
  ]),
  knoten('decke', [J('Danke. Die Decke ist nett zu mir. Die kündigt nie.', 'trauer')]),
]);

/** Jimmy nach der Rettung als Rivale: nur verletzte Werbesprüche, Versöhnung mit einer Entschuldigung (world.md §4.2). */
export const JIMMY_RIVALE: Menue = {
  choices: [
    { text: '„Jimmy. Es tut mir leid.“', next: 'versoehnt', effects: [{ reconcile: 'jimmy' }, { xp: 30 }] },
    { text: 'Synth-Nudeln hinstellen. Als Entschuldigung.', when: { item: 'synth-nudeln' }, next: 'nudeln', effects: [{ take: 'synth-nudeln' }, { reconcile: 'jimmy' }, herz('jimmy', 40), { xp: 30 }] },
    { text: 'Bis später.' },
  ],
  nodes: [
    knoten('versoehnt', [
      J('Entschuldigung angenommen. Bearbeitungszeit: null Sekunden. Rekord.', 'freude'),
      J('Ich hab doch gesagt, ich kann nicht böse sein. Ich hab’s nur … geübt. Es war furchtbar.'),
    ]),
    knoten('nudeln', [
      J('Nudeln! Mit Entschuldigung! Das ist das beste Kombi-Angebot der Stadt!', 'freude'),
      J('Wir sind wieder Freunde. Mit allem. Lebenslang. Ohne Kleingedrucktes.'),
    ]),
  ],
};
export const JIMMY_RIVALE_GRUSS = [J('Willkommen bei Jimmy. Leider ist Jimmy gerade … nicht so gut drauf. Bitte versuchen Sie es später. Oder jetzt. Jetzt geht auch.', 'trauer')];
export const JIMMY_RIVALE_PLAUSCH = [J('Ich hab dir einen Gutschein geschrieben. „Ein Jimmy, gebraucht, wie neu.“ Dann hab ich ihn wieder zerrissen. Dann wieder geklebt. Er liegt in meiner Tasche. Falls du fragst. Du fragst nicht.', 'trauer')];

export function jimmyEvents(base: Condition): HeartEventDef[] {
  return [
    re('jimmy', 2, 'dantes-werkstatt', 'morgen', base),
    re('jimmy', 5, 'high-voltage', 'abend', base),
    re('jimmy', 8, 'crew-quartier', 'nacht', base),
  ];
}
export const JIMMY_RE: DialogueDef[] = [reJimmy2, reJimmy5, reJimmy8];

// ---------------------------------------------------------------------------------------------- Captain Kuschel

const reKuschel2 = dialog('re-captain-kuschel-2', [
  knoten('start', [
    erz('Dantes Werkstatt. Auf deiner Jacke, die du gestern hier vergessen hast, klebt ein Zettel. Krakelige Druckbuchstaben.'),
    erz('„Ich bin enttäuscht. – C. K.“'),
    K('(Beide Ohren flach nach hinten. Er sitzt im Regal und guckt demonstrativ an dir vorbei.)', 'trauer'),
    D('Er schmollt. In Ohrenform. Das ist die schlimmste Form. Ich hab das einmal erlebt, als ich seine Fliege in die Wäsche getan hab. Drei Wochen.', 'besorgt'),
  ], {
    choices: [
      { text: 'Einen Zettel zurückkleben: „Tut mir leid. – {name}“', next: 'zettel', effects: [herz('captain-kuschel', 20)] },
      { text: '„Das ist ein Plüschhase, Dante.“', next: 'hase', effects: [herz('captain-kuschel', -10), herz('dante', -10)] },
    ],
  }),
  knoten('zettel', [K('(Ein Ohr zuckt. Nur eins. Nur ein bisschen. Mehr ist heute nicht drin.)')]),
  knoten('hase', [
    D('Sag das nicht so laut. Er hört dich. Mit DEN Ohren hört er alles.', 'wut'),
    K('(Beide Ohren noch flacher. Das sollte eigentlich nicht gehen.)', 'trauer'),
  ]),
]);

const reKuschel8 = dialog('re-captain-kuschel-8', [
  knoten('start', [
    erz('Dantes Werkstatt, Abend. Captain Kuschel sitzt auf seinem Kissen, mit dem Rücken zu dir. Seine Ohren sind mit einem Haargummi zusammengebunden. Geschlossen.'),
    erz('Daneben, sorgfältig an den Plattenspieler geklebt, ein Zettel: „Sprechstunde nur nach Ohrenflick. Oder mit Nadel und Faden. Sonst gar nicht. – C. K.“'),
    D('Er hat das Haargummi von Aria. Er hat es sich GEHOLT. Ich weiß nicht, wie. Ich will es nicht wissen.', 'besorgt'),
  ], {
    choices: [
      { text: 'Sich vor ihn hocken und warten.', next: 'warten', effects: [herz('captain-kuschel', 10), { advanceTime: 20 }] },
      { text: 'Gehen.' },
    ],
  }),
  knoten('warten', [
    erz('Zwanzig Minuten. Der Plattenspieler läuft aus. Dann löst sich das Haargummi, ganz von selbst. Ein Ohr rutscht ein Stück zur Seite. Richtung Nähkästchen.'),
    D('Das ist ein Hinweis. Er gibt nie Hinweise. Nimm ihn.', 'freude'),
  ]),
]);

export function kuschelEvents(base: Condition): HeartEventDef[] {
  return [
    re('captain-kuschel', 2, 'dantes-werkstatt', ['morgen', 'tag'], base),
    re('captain-kuschel', 8, 'dantes-werkstatt', 'abend', base),
  ];
}
export const KUSCHEL_RE: DialogueDef[] = [reKuschel2, reKuschel8];
