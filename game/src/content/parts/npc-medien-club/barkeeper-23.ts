// Der Barkeeper in Akt 2, Akt 3 und im Nachspiel – weiter nur in Dreizeilern (world.md §4.4, §4.6, §5.3–5.5).
// Keine Inhaltsdatei: barkeeper.ts baut daraus Figur und Teil.
// - he-barkeeper-8 (Freitag/Samstag, ein gechippter Gast fängt Streit an, Signaturgetränk „Stiller Vers“),
// - he-barkeeper-10 (nach Ladenschluss: der letzte Vers und die Maske),
// - Tagesgespräche zu Chip-Gästen, Drohnen, Chrome 10, Nyra, Aria, Dante, Party, Partynacht, Enden, Master-Modus,
// - Tagesablauf im Nachspiel: Wochenende an der Strandclub-Bar (nach side-strandclub),
// - Begleiter: „Stiller Vers“ nach he-barkeeper-8.
import type { AbilityDef, Condition, DialogueDef, ScheduleEntry, TalkDef } from '../../../modules/contracts';
import {
  type Menu, ARIA_WEG, ARIA_ZURUECK, DANTE_CREW, ENDE_3B, ENDE_NEXUS, EPILOG, MASTER, MEER_ENDE, NACH_BRUCH, NYRA_WEG,
  PARTYNACHT, PARTY_PLAN, VEX, all, chk, daily, dlg, erz, ich, noFlag, node, not, rel, rep, seen, set, sp, talk, weiter,
  xp,
} from './_util';

const B = sp('barkeeper');
const H = sp('hunter');
const A = sp('aria');
const D = sp('dante');

const vers = (a: string, b: string, c: string): string => `${a} / ${b} / ${c}`;
const VERS_FERTIG: Condition = { quest: 'pers-barkeeper-letzter-vers', state: 'done' };
const STRANDCLUB: Condition = { quest: 'side-strandclub', state: 'done' };
/** Aria ist im Club (nicht gechippt weg). */
const ARIA_DA: Condition = { not: ARIA_WEG };

// ------------------------------------------------------------------------------------------- he-barkeeper-8

const he8 = dlg('he-barkeeper-8', [
  node('start', [
    erz('Freitagnacht im High Voltage. Die Tanzfläche kocht, Mixi piept im Takt, an der Bar stehen die Leute in drei Reihen. Und mittendrin ein Kerl im Quantum-Hemd, so breit wie die Tür, mit einem blau glimmenden Punkt im Nacken.'),
    sp('narrator')('„CHROME ZEHN!“, brüllt er und knallt einen Gutschein auf den Tresen. „Zehn Prozent! Das ist eine ausgezeichnete Entscheidung! Das hat der Master gesagt!“'),
    erz('Zwei Rostzähne neben ihm lachen. Das ist ein Fehler. Der Quantum-Kerl packt einen am Kragen, der andere greift nach einer Flasche, und das erste Glas fliegt. Direkt auf Mixi zu.'),
  ], {
    choices: [
      { text: 'Hechten und das Glas aus der Luft fangen.', check: chk('he-barkeeper-8-glas', 'reflexe', 6, ['reaktion', 'fangen']), next: 'glas' },
      { text: 'Auf den Tresen steigen: „Runde aufs Haus für jeden, der jetzt sitzt!“', check: chk('he-barkeeper-8-runde', 'ausstrahlung', 6, ['ueberreden', 'menge']), next: 'runde' },
      { text: 'Dich zwischen die drei stellen. Schultern breit.', check: chk('he-barkeeper-8-dazwischen', 'koerper', 6, ['einschuechtern', 'kraft']), next: 'dazwischen' },
      { text: 'Nichts tun. Zum Barkeeper schauen.', next: 'blick' },
    ],
  }),
  node('glas', [
    erz('Du bist schon in der Luft, bevor du drüber nachdenkst. Das Glas landet in deiner Hand, heil, nicht mal ein Tropfen verschüttet. Mixi piept etwas, das sehr nach „Danke“ klingt.'),
    B(vers('Ein Glas in der Luft', 'die meisten sehen nur Scherben', 'du sahst einen Flug.')),
  ], { effects: [rel('barkeeper', 20)], next: 'blick' }),
  node('runde', [
    ich('RUNDE AUFS HAUS! Für jeden, der in drei Sekunden sitzt! Drei! Zwei!'),
    erz('Die halbe Bar sitzt bei „zwei“. Die Rostzähne setzen sich bei „eins“. Nur der Quantum-Kerl steht noch, den Kragen eines Rostzahns in der Faust und einen sehr verwirrten Ausdruck im Gesicht.'),
    H('Wer zahlt diese Runde? WER ZAHLT DIESE RUNDE?!'),
  ], { effects: [rel('barkeeper', 20), { relation: 'hunter', delta: -10 }], next: 'blick' }),
  node('dazwischen', [
    erz('Du schiebst dich zwischen die beiden Rostzähne und den Schrank im Quantum-Hemd. Er ist größer als du. Er riecht nach Desinfektionsmittel und Neuwagen. Er ballt die Faust, und dann zögert er, als hätte ihm jemand im Kopf „Pause“ gesagt.'),
  ], { effects: [rel('barkeeper', 20)], next: 'blick' }),
  node('blick', [
    erz('Der Barkeeper stellt das Glas ab, das er gerade poliert. Sieht hin. Das ist alles.'),
    erz('Die Rostzähne erstarren mitten im Schlag, lassen die Fäuste sinken und setzen sich. Nebeneinander. Einer entschuldigt sich beim anderen. Und der Quantum-Kerl? Der blaue Punkt in seinem Nacken flackert. Einmal. Zweimal. Als wüsste der Chip nicht mehr, wer hier das Sagen hat.'),
    sp('narrator')('„… Master?“, fragt der Kerl leise. Er meint den Barkeeper.'),
    B(vers('Ich bin nicht dein Herr', 'ich bin nur der mit dem Tuch', 'setz dich. Trink Wasser.')),
    erz('Der Kerl setzt sich. Und fängt an zu weinen, still, mit beiden Händen um ein Glas Wasser, wie ein Kind, das sich verlaufen hat und endlich jemanden gefunden hat, der nicht schreit.'),
  ], { choices: weiter([[all(VEX, ARIA_DA), 'vex'], [ARIA_DA, 'aria'], [null, 'drink']]) }),
  node('vex', [
    A('Hast du das gesehen, Kurier? Der hat einen Chip mit einem BLICK ausgeschaltet. Ich will das auch können. Bring’s mir bei. Nein, bring’s IHM bei, dass er’s MIR beibringt.', 'ueberrascht'),
  ], { next: 'drink' }),
  node('aria', [A('Okay. Okay okay okay. Der Mann hat einen Chip mit einem Blick ausgeschaltet. Ich hab Gänsehaut. Am Metallarm. Das geht gar nicht.', 'ueberrascht')], { next: 'drink' }),
  node('drink', [
    erz('Später, als sich der Club beruhigt hat, schiebt er dir ein Glas hin. Es ist dunkelblau, schmeckt nach Tee, Salz und etwas, das du nicht kennst, und es leuchtet erst, wenn man es ansieht.'),
    B(vers('Für dich, Gast, heut Nacht', 'ein Glas, das es nirgends gibt', 'ich nenn es „Stiller Vers“.')),
  ], {
    choices: [
      { text: 'Trinken. Langsam.', next: 'trinken' },
      { text: 'Das Glas zu dem weinenden Kerl rüberschieben.', next: 'teilen', effects: [rep('unterstadt', 3)] },
      { text: '„Was ist da drin?“', next: 'rezept' },
    ],
  }),
  node('trinken', [
    erz('Es ist, als würde jemand in deinem Kopf das Licht dimmen. Nicht dunkel. Nur leiser. Die Bar, die Musik, der Kerl mit dem Chip: alles ist noch da, aber es drängelt nicht mehr.'),
    B(vers('Jetzt hörst du es auch', 'zwischen zwei Liedern die Pause', 'da wohne ich.')),
  ], { next: 'ende' }),
  node('teilen', [
    erz('Der Kerl im Quantum-Hemd sieht das Glas an, dann dich, dann trinkt er. Der blaue Punkt in seinem Nacken wird für einen Moment grau. Er blinzelt, als wäre er gerade aufgewacht. „Wo … wo bin ich?“'),
    B(vers('Du gabst ihm dein Glas', 'nun fragt er, wo er ist', 'das ist schon ein Anfang.')),
  ], { effects: [rel('barkeeper', 20)], next: 'ende' }),
  node('rezept', [
    B(vers('Tee aus Hunters Schrank', 'eine Träne Hafenwasser', 'den Rest sag ich nicht.')),
    H('Hafenwasser?! Wir haben eine Lizenz, verdammt! … Haben wir eine Lizenz?', 'besorgt'),
  ], { next: 'trinken' }),
  node('ende', [erz('Er poliert das nächste Glas. Ab heute steht auf der Karte, ganz unten, ohne Preis: „Stiller Vers – nur auf Nachfrage. Nur für manche.“')], {
    effects: [
      xp(80), rel('barkeeper', 40), set('stiller_vers_bekannt'), set('barkeeper_stiller_vers'),
      { checkBuff: { id: 'stiller-vers', label: 'Stiller Vers', value: 1, attribute: 'ausstrahlung', forDays: 0, consumes: false } },
      { message: 'Stiller Vers: +1 Ausstrahlung bis Mitternacht. Der Barkeeper kann im Kampf jetzt „Stiller Vers“ ausschenken.' },
    ],
  }),
]);

// ------------------------------------------------------------------------------------------- he-barkeeper-10

const he10 = dlg('he-barkeeper-10', [
  node('start', [
    erz('Nach Ladenschluss. Die Stühle stehen umgedreht auf den Tischen, Mixi summt im Standby, Hunter zählt hinten die Kasse und flucht dabei in einer Sprache, die nur aus Zahlen besteht.'),
    erz('Der Barkeeper legt sein Notizbuch auf den Tresen. Leder, abgegriffen, Raketen und ein Hund mit acht Beinen auf jeder zweiten Seite. Er schlägt die letzte Seite auf.'),
  ], { choices: weiter([[VERS_FERTIG, 'fertig'], [null, 'offen']]) }),
  node('fertig', [
    B(vers('Das Buch ist zurück', 'Jakkos Raketen fliegen mit', 'der letzte Vers auch.')),
    erz('Er liest ihn dir vor. Leise, so leise, dass Hunter hinten aufhört zu zählen.'),
    B(vers('Am Ende der Nacht', 'bleibt einer, der die Gläser zählt', 'heute zählt er zwei.')),
  ], { effects: [rel('barkeeper', 20)], next: 'maske' }),
  node('offen', [
    B(vers('Die letzte Zeile', 'Jakko hat sie übermalt', 'mit einem Mond, der lacht.')),
    B(vers('Zwei Zeilen hab ich', '„Am Ende der Nacht bleibt einer“', 'der dritte ist deiner.')),
    erz('Er schiebt dir den Stift hin. Der Mond auf der Seite grinst dich an.'),
  ], {
    choices: [
      { text: 'Schreiben: „… der die Gläser zählt. Heute zählt er zwei.“', next: 'zeile', effects: [set('barkeeper_vers_zwei')] },
      { text: 'Schreiben: „… und der Mond lacht trotzdem.“', next: 'zeile', effects: [set('barkeeper_vers_mond')] },
      { text: 'Etwas ganz Eigenes schreiben, ohne nachzudenken.', check: chk('he-barkeeper-10-vers', 'ausstrahlung', 7, ['kunst', 'gefuehl']), next: 'eigen', effects: [set('barkeeper_vers_eigen')] },
      { text: 'Den Stift zurückschieben. „Das ist dein Gedicht.“', next: 'zurueck' },
    ],
  }),
  node('zeile', [
    erz('Er liest es. Zweimal. Dann nickt er, ein einziges Mal, so tief, dass es fast eine Verbeugung ist.'),
    B(vers('Sie zählt keine Silben', 'aber sie stimmt trotzdem', 'wie du, Gast. Wie du.')),
  ], { effects: [rel('barkeeper', 20)], next: 'maske' }),
  node('eigen', [
    erz('Du schreibst, und es passiert einfach: drei Zeilen, keine gezählt, alle wahr. Über eine Bar, in der keiner allein trinken muss, wenn er nicht will.'),
    erz('Der Barkeeper liest. Dann legt er das Tuch weg. Das hast du noch nie gesehen. Das Tuch ist sonst wie ein Teil seiner Hand.'),
    B(vers('Ich schrieb vierzig Jahre', 'und du schreibst es in einem Zug', 'ich bin nicht neidisch. Doch.')),
  ], { effects: [rel('barkeeper', 40)], next: 'maske' }),
  node('zurueck', [
    B(vers('Mein Gedicht, sagst du', 'dann bleibt die Zeile offen', 'wie eine Tür. Gut.')),
  ], { effects: [rel('barkeeper', 10)], next: 'maske' }),
  node('maske', [
    erz('Er stellt eine Kiste auf den Tresen, hinter Hunters schlechtem Rum hervorgezogen. Darin, auf einem zusammengelegten Plakat: eine schwarze Maske, glatt, ohne Mund. Das Gesicht des Stillen. Die Ersatzmaske, die nie in den Ring musste.'),
    B(vers('Ich trug sie vierzig Mal', 'nun trägst du sie einmal nicht', 'und denkst dabei an mich.')),
    erz('Er legt sie dir in die Hände. Und dann sagt er etwas ohne Versmaß, ganz leise: seinen Namen. Genau in diesem Moment lässt Hunter hinten das Kassentablett fallen. Münzen klirren über den ganzen Boden.'),
    H('… Was? Hab ich was verpasst?', 'besorgt'),
  ], {
    choices: [
      { text: '„Sag ihn noch mal.“', next: 'nochmal' },
      { text: 'Lächeln. Du hast ihn trotzdem verstanden. Fast.', next: 'fast' },
      { text: 'Die Maske aufsetzen.', next: 'aufsetzen' },
    ],
  }),
  node('nochmal', [B(vers('Einmal ist genug', 'Namen sind wie gute Gläser', 'man zerbricht sie leicht.')), erz('Und dann, ohne Vers, sehr leise: „Danke.“ Danach tut er so, als wäre das nie passiert.')], { next: 'ende' }),
  node('fast', [B(vers('Fast ist schon sehr viel', 'die meisten hören gar nichts', 'du hörst zwischen Münzen.')), erz('Und dann, ohne Vers, sehr leise: „Danke.“ Danach tut er so, als wäre das nie passiert.')], { next: 'ende' }),
  node('aufsetzen', [
    erz('Die Maske ist leichter, als sie aussieht, und innen riecht sie nach altem Leder und Salz. Durch die Augenschlitze sieht der Club ganz anders aus: kleiner, wärmer, ein Ort, an dem man nicht kämpfen muss.'),
    erz('Der Barkeeper sieht dich an. Und lacht. Laut. Ein einziges Mal, wie ein Glas, das gegen ein anderes stößt.'),
    H('Er LACHT? Er lacht! Das ist … das ist schlimmer als Hafenwasser! Ich muss mich setzen.', 'ueberrascht'),
  ], { effects: [rel('barkeeper', 20)], next: 'ende' }),
  node('ende', [B(vers('Die Bar ist jetzt zu', 'doch für dich bleibt sie offen', 'auch wenn ich nicht da bin.'))], {
    effects: [{ give: 'barkeeper-maske' }, xp(120), rel('barkeeper', 50), set('barkeeper_name_gehoert'), rep('crew-hunter', 5)],
  }),
]);

// ------------------------------------------------------------------------------------------- Tagesgespräche Akt 2/3

function gespraeche(M: Menu): DialogueDef[] {
  const chips = daily('barkeeper-tag-akt2-chips',
    [B(vers('Sie sagen jetzt „Master“', 'zu mir, wenn ich Eis bringe', 'ich sage nur: „Bitte.“'))],
    [
      B(vers('Ein Chip hinterm Ohr', 'der Gast lacht an der falschen Stelle', 'ich schenk ihm Wasser ein.')),
      B(vers('Wer hier trinken will', 'muss den Nacken mir zeigen', 'Hunters neue Regel.')),
    ],
    M);
  const drohnen = daily('barkeeper-tag-akt2-drohnen',
    [B(vers('Über der Gasse', 'summt eine Drohne im Kreis', 'sie filmt meine Klinge.'))],
    [
      B(vers('Ich übte am Dach', 'sie kam zu nah an mein Licht', 'nun sind es zwei Drohnen.')),
      erz('Er zeigt mit dem Kinn zur Tür. Daneben hängen, sauber halbiert, die zwei Hälften einer Quantum-Drohne an einem Nagel. Darunter ein Zettel in Hunters Schrift: „Fundsache.“'),
    ],
    M);
  const chrome = daily('barkeeper-tag-akt2-chrome',
    [B(vers('Chrome-Zehn-Gutscheine', 'Hunter nimmt nicht einen davon', 'ich bau eine Burg.'))],
    [
      erz('Am Ende des Tresens steht tatsächlich eine Burg. Aus Gutscheinen. Mit Zinnen, Zugbrücke und einem kleinen Wimpel aus einer Cocktailserviette.'),
      B(vers('Wer zehn Prozent schenkt', 'will hundert Prozent zurück', 'das weiß jedes Glas.')),
    ],
    M);
  const nyra = daily('barkeeper-tag-nyra',
    [
      erz('In der Laptop-Ecke steht ein Kühlmittel-Mocktail auf dem Tisch. Unberührt. Das Eis darin ist frisch. Jemand wechselt es jede Stunde.'),
      B(vers('Ihr Platz in der Ecke', 'ich stell ihr Glas jeden Abend hin', 'falls sie leise kommt.')),
    ],
    [B(vers('Sie trank nie aus', 'sie sah nur durch das Glas aufs Meer', 'das es hier nicht gibt.'))],
    M, { effects: [set('barkeeper_nyra_gesagt')] });
  const ariaWeg = daily('barkeeper-tag-aria-weg',
    [
      erz('Er poliert ein einziges Glas. Ein großes, mit einem Sprung am Rand, den Aria reingebissen hat, als sie Hunter mal etwas beweisen wollte.'),
      B(vers('Ihr Glas steht hier', 'niemand trinkt daraus heut Nacht', 'ich poliere es.')),
    ],
    [B(vers('Sie kommt zurück', 'sie ist zu laut, um zu verschwinden', 'die Stille wartet nicht.'))],
    M, { effects: [set('barkeeper_aria_weg_gesagt')] });
  const ariaZurueck = daily('barkeeper-tag-aria-zurueck',
    [B(vers('Sie lacht wieder laut', 'zerbrach drei Hocker vor Freude', 'ich habe gezählt.'))],
    [
      A('Vier! Es waren VIER Hocker! Zähl richtig, Dichter!', 'freude'),
      B(vers('Der vierte war schon kaputt', 'du hast ihn nur zu Ende gebracht', 'auch das ist ein Talent.')),
    ],
    M, { effects: [set('barkeeper_aria_zurueck_gesagt')] });
  const dante = daily('barkeeper-tag-dante',
    [
      erz('Hinter dem Tresen steht ein Blech Kekse. Daneben Dante, der versucht, sie unauffällig zwischen die Erdnüsse zu schmuggeln.'),
      B(vers('Der Mann mit Platten', 'backt jetzt hinter meiner Bar', 'mein Tresen riecht süß.')),
    ],
    [
      D('Er hat nichts dagegen! Er hat nur … geguckt. Lange. Mit Silben. Ich interpretier das als Ja.', 'verlegen'),
      B(vers('Drei Sekunden lang', 'darf ein Keks am Boden liegen', 'hier liegt er nicht mal eine.')),
    ],
    M, { effects: [set('barkeeper_dante_gesagt')] });
  const party = daily('barkeeper-tag-party',
    [B(vers('Ihr geht nach oben', 'ich bleibe hinter dem Tresen', 'jemand muss hier sein.'))],
    [
      B(vers('Hunter übt die Rede', 'vor dem Spiegel im Lager', 'er sagt „äh“ sehr oft.')),
      B(vers('Wenn ihr wiederkommt', 'steht euer Glas schon bereit', 'wenn nicht, auch. Für immer.')),
    ],
    M);
  const partynacht = daily('barkeeper-tag-partynacht',
    [B(vers('Heute Nacht der Turm', 'die Gläser zittern im Regal', 'ich nicht. Fast nicht.'))],
    [B(vers('Der Club ist leer heut', 'nur ich und Mixi und das Licht', 'wir warten auf euch.'))],
    M);
  const endeErst = dlg('barkeeper-tag-ende', [
    node('start', [erz('Er stellt dir ein Glas hin, bevor du dich setzt. Dann ein zweites daneben. Dann, nach einem Moment, ein drittes.')], {
      choices: weiter([[ENDE_NEXUS, 'nexus'], [ENDE_3B, 'dreib'], [null, 'meer']]),
    }),
    node('meer', [
      B(vers('Der Turm ist jetzt dunkel', 'die Gäste sagen wieder „Prost“', 'nicht mehr „Master“. Gut.')),
      B(vers('Hunter will ans Meer', 'ein Club im Sand mit Neonlicht', 'ich nehm das Tuch mit.')),
    ], { next: 'schluss' }),
    node('nexus', [
      B(vers('Die Stimme im Radio', 'fragt mich jetzt nach Dreizeilern', 'ich bring es ihr bei.')),
      B(vers('Sie zählt die Silben', 'doch sie weiß nicht, wo die Pause ist', 'das lernt man nicht schnell.')),
    ], { next: 'schluss' }),
    node('dreib', [
      B(vers('Der Hocker blieb frei', 'ich hab ihn jeden Tag poliert', 'setz dich. Willkommen.')),
    ], { next: 'schluss' }),
    node('schluss', [], { choices: [{ text: 'Anstoßen.', next: 'prost' }, { text: 'Nur nicken.' }], effects: [set('barkeeper_ende_kommentar'), xp(30), rel('barkeeper', 20)] }),
    node('prost', [erz('Die Gläser klingen. Er trinkt Tee. Du trinkst etwas, das nach Salz und Feierabend schmeckt.')]),
  ]);
  const strand = daily('barkeeper-tag-strand',
    [
      erz('Die Strandclub-Bar ist eine Planke auf zwei Fässern, darüber eine Lichterkette, die Hunter „das Dach“ nennt. Der Barkeeper steht dahinter, barfuß, das Tuch über der Schulter.'),
      B(vers('Salz auf dem Tresen', 'der Wind trinkt aus jedem Glas', 'ich schenk ihm nach.')),
    ],
    [B(vers('Montags hier am Meer', 'keine Arena, nur Wellen', 'die zählen für mich.'))],
    M);
  const epilog = daily('barkeeper-tag-epilog',
    [B(vers('Ein leiser Abend', 'keiner hat heute geschrien', 'ich vermiss es nicht.'))],
    [B(vers('Die Gäste von früher', 'bringen jetzt ihre Kinder mit', 'die trinken nur Limo.'))],
    M);
  const master = dlg('barkeeper-tag-master', [
    node('start', [
      B('…'),
      erz('Er stellt dir ein Glas Wasser hin. Ohne Eis. Ohne Blick. Hinter dir stehen zwei Gäste mit blauen Punkten im Nacken und lächeln, ohne zu blinzeln.'),
    ], {
      choices: [
        { text: '„Sag was.“', next: 'sag' },
        { text: '„Kämpf für mich.“', next: 'nein' },
        { text: 'Das Wasser trinken und gehen.' },
      ],
    }),
    node('sag', [
      B(vers('Du sitzt jetzt ganz oben', 'die Gläser dort sind aus Kristall', 'meine sind ehrlich.')),
      B(vers('Der Hocker ist frei', 'wenn du ihn je wieder willst', 'ich polier ihn weiter.')),
    ], { effects: [set('barkeeper_master_vers')] }),
    node('nein', [B('…'), erz('Er nimmt das Tuch von der Schulter und legt es zusammen. Einmal. Zweimal. Dreimal. Das ist die Antwort.')]),
  ]);
  return [chips, drohnen, chrome, nyra, ariaWeg, ariaZurueck, dante, party, partynacht, endeErst, strand, epilog, master];
}

// ------------------------------------------------------------------------------------------- Bausteine für barkeeper.ts

export const BARKEEPER_TALK_MASTER: TalkDef = talk('barkeeper-tag-master', MASTER);
export const BARKEEPER_TALK_23: TalkDef[] = [
  talk('barkeeper-tag-ende', all(EPILOG, MEER_ENDE, noFlag('barkeeper_ende_kommentar'))),
  talk('barkeeper-tag-strand', all(EPILOG, STRANDCLUB, { weekday: ['sa', 'so'] }, { time: ['abend', 'nacht'] })),
  talk('barkeeper-tag-epilog', all(EPILOG, { time: ['abend', 'nacht'] })),
  talk('barkeeper-tag-partynacht', PARTYNACHT),
  talk('barkeeper-tag-aria-weg', all(NACH_BRUCH, ARIA_WEG, noFlag('barkeeper_aria_weg_gesagt'))),
  talk('barkeeper-tag-aria-zurueck', all(ARIA_ZURUECK, { flag: 'aria_gechippt' }, noFlag('barkeeper_aria_zurueck_gesagt'))),
  talk('barkeeper-tag-dante', all(DANTE_CREW, noFlag('barkeeper_dante_gesagt'), { time: ['abend', 'nacht'] })),
  talk('barkeeper-tag-nyra', all(NYRA_WEG, ARIA_ZURUECK, noFlag('barkeeper_nyra_gesagt'), { time: ['abend', 'nacht'] })),
  talk('barkeeper-tag-party', all(PARTY_PLAN, { time: ['morgen', 'abend', 'nacht'] })),
  talk('barkeeper-tag-akt2-chips', all(NACH_BRUCH, { time: ['abend', 'nacht'] }, { weekday: ['mo', 'do', 'so'] })),
  talk('barkeeper-tag-akt2-drohnen', all(NACH_BRUCH, { time: ['morgen', 'tag'] })),
  talk('barkeeper-tag-akt2-chrome', all(NACH_BRUCH, { time: ['abend', 'nacht'] }, { weekday: ['di', 'mi', 'sa'] })),
];

/** Nachspiel: Wochenende an der Strandclub-Bar (vor die Akt-1-Einträge). */
export const BARKEEPER_SCHEDULE_23: ScheduleEntry[] = [
  {
    slot: ['abend', 'nacht'], days: ['sa', 'so'], when: all(EPILOG, MEER_ENDE, not(MASTER), STRANDCLUB),
    place: { map: 'das-meer', at: 'strandclub-bar' }, pose: 'polieren',
  },
];

export const BARKEEPER_ABILITIES: AbilityDef[] = [
  {
    id: 'barkeeper-stiller-vers', name: 'Stiller Vers',
    description: 'Ein dunkelblaues Glas, das erst leuchtet, wenn man es ansieht. Verbündete in 2 Feldern +8 LP, der Kopf wird leiser.',
    kind: 'support', ap: 1, target: 'area', range: 0, radius: 2, heal: 8, cooldown: 3,
  },
];
export const BARKEEPER_ABILITY_RULES = [{ when: seen('he-barkeeper-8'), add: 'barkeeper-stiller-vers' }];

export function barkeeper23(M: Menu): DialogueDef[] {
  return [he8, he10, ...gespraeche(M)];
}
