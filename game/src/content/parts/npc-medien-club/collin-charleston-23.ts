// Collin Charleston in Akt 2, Akt 3 und im Nachspiel (world.md §4.4, §4.7 „Live und unzensiert“, §5.3–5.5).
// Keine Inhaltsdatei: collin-charleston.ts baut daraus Figur und Teil.
// Romanze (freigegeben): ♥8 Karaoke-Duett (he-collin-charleston-8) → Date auf der Flutmauer mit Geständnis
// (rom-collin-flutmauer, eigenes Herz-Ereignis) → ♥10 Kuss vor laufender Kamera (he-collin-charleston-10, Tafel
// rom-collin-testbild) → „Bleib heute Nacht“ (einmal pro Woche, Abblende) → Morgen danach. Ohne Romanze laufen alle
// Szenen als Freundschaft. Ablehnen ist im Geständnis jederzeit möglich (Flag collin_romanze_abgelehnt).
import type { Condition, DialogueDef, HeartEventDef, PhoneMessageDef, ScheduleEntry, TalkDef } from '../../../modules/contracts';
import {
  type Menu, ARIA_WEG, ARIA_ZURUECK, ENDE_3B, ENDE_NEXUS, EPILOG, MASTER, MEER_ENDE, NACH_BRUCH, NYRA_WEG, PARTYNACHT,
  PARTY_PLAN, all, any, chk, daily, dlg, erz, flag, ich, mehr, noFlag, node, not, rel, rep, seen, set, sp, talk,
  weiter, xp,
} from './_util';

const C = sp('collin-charleston');
const K = sp('kameramann');
const D = sp('delya-delloraine');
const H = sp('hunter');
const Z = sp('narrator');

export const ID = 'collin-charleston';
/** Romanze möglich (Schalter + ♥8) und nicht abgelehnt. */
export const ROM: Condition = all({ romance: ID }, noFlag('collin_romanze_abgelehnt'));
/** Eine aktive Romanze gleichzeitig (world.md §4.7): keine andere freigegebene Figur ist „zusammen“. */
const FREI: Condition = all(
  ...['hunter_romanze_zusammen', 'dante_romanze_zusammen', 'aria_romanze_zusammen', 'aria_kuss', 'lio-funkel_romanze_zusammen'].map(noFlag),
);
/** Nächster Romanze-Schritt möglich (Händchen, Date, Kuss). */
const ROM_NEU: Condition = all(ROM, FREI);
/** Nach dem Geständnis auf der Flutmauer (oder, falls das Date übersprungen wurde, nach dem Romanze-Duett). */
export const ROM_BEREIT: Condition = all(ROM_NEU, any(flag('collin_gestaendnis'), flag('collin_duett_romanze')));
/** Paar: Kuss gesehen. */
export const ZUSAMMEN: Condition = all(ROM, flag('collin_kuss'));
const PIXEL_AKTIV: Condition = { quest: 'pers-collin-pixel', state: 'active' };
const PIXEL_DONE: Condition = { quest: 'pers-collin-pixel', state: 'done' };
const EINLASS_OFFEN: Condition = { not: { quest: 'main-3-einlass', state: 'done' } };

// ------------------------------------------------------------------------------------------- he-collin-charleston-8

const he8 = dlg('he-collin-charleston-8', [
  node('start', [
    erz('Karaoke-Dienstag im High Voltage. Der Club ist voller als sonst: Seit Quantum überall Chips verteilt, wollen die Leute wenigstens einmal am Abend etwas laut singen, das nicht „Master“ heißt.'),
    C('Meine Damen und Herren, heute eine Premiere! Ein Duett! Ich und … {name}! „Neonherz“ von Kabelbrand! Applaus! Applaus, oder ich lass Hunter singen!', 'freude'),
    H('Ich sing nicht. Ich hab nie gesungen. Wer was anderes behauptet, hat Hausverbot.'),
    erz('Die Musik setzt ein. Collin singt erstaunlich gut. Dann kommt die Stelle mit dem hohen Ton, und er sieht dich an wie ein Mann, der von einer Brücke springt und hofft, dass unten Wasser ist.'),
  ], {
    choices: [
      { text: 'Den hohen Ton übernehmen. Volle Lunge.', check: chk('he-collin-8-ton', 'ausstrahlung', 6, ['auftritt', 'singen']), next: 'ton' },
      { text: 'Der Mikroständer kippt. Hechten.', check: chk('he-collin-8-staender', 'reflexe', 5, ['reaktion']), next: 'staender' },
      { text: 'Einfach schief und sehr laut mitsingen.', next: 'schief' },
    ],
  }),
  node('ton', [
    erz('Du triffst ihn. Irgendwie. Der Ton geht durch den Club, durch die Lüftung, wahrscheinlich bis zur Hafenkante. Mixi piept anerkennend. Ein gechippter Gast an der Bar blinzelt, als wäre er gerade aufgewacht.'),
    C('UNGLAUBLICH! Das war … das war live! Und echt! Und ich hatte Gänsehaut unter dem Haarspray!', 'ueberrascht'),
  ], { effects: [rel(ID, 20), rep('unterstadt', 2)], next: 'refrain' }),
  node('staender', [
    erz('Collin tritt beim Tanzen gegen den Mikroständer. Er kippt, du fängst ihn mit einer Hand, drehst ihn einmal wie einen Tanzpartner und stellst ihn zurück. Der Club johlt, als wär das Choreografie.'),
    C('Geprobt! Alles geprobt! … Nichts war geprobt. Ich liebe dich. Als Bühnenpartner. Als BÜHNENPARTNER.', 'verlegen'),
  ], { effects: [rel(ID, 20)], next: 'refrain' }),
  node('schief', [
    erz('Ihr singt beide falsch. In verschiedene Richtungen. Bruno hält sich die Ohren zu, Hunter das Gesicht. Der Club singt trotzdem mit, weil man bei „Neonherz“ einfach mitsingt.'),
    C('Das war das Schlimmste, was ich je moderiert habe! Und das Schönste! Wie meine erste Ehe!', 'freude'),
  ], { next: 'refrain' }),
  node('refrain', [erz('Der letzte Refrain. Der ganze Club steht. Collin steht neben dir, verschwitzt, die Frisur zum ersten Mal in Gefahr, und er grinst wie ein Junge.')], {
    choices: [
      { text: 'Beim letzten Refrain seine Hand nehmen.', when: ROM_NEU, next: 'rom', effects: [set('flirt_collin-charleston')] },
      { text: 'Ihm den Arm um die Schulter legen und den Refrain grölen.', next: 'freund' },
    ],
  }),
  node('rom', [
    erz('Du nimmst seine Hand. Er verpasst den Einsatz. Zum ersten Mal in seinem Leben verpasst Collin Charleston einen Einsatz.'),
    erz('Beim letzten Refrain zieht er das Mikro weg, lehnt sich zu dir, so nah, dass du sein Haarspray riechst und darunter etwas Wärmeres.'),
    C('Den Rest singen wir zu Hause. Oder bei dir. Ich bin flexibel.', 'zaertlich'),
    H('Wenn ihr auf meiner Bühne knutscht, zahlt ihr Bühnenmiete!'),
    C('Wir knutschen nicht! … Noch nicht. Morgen. Flutmauer. Sonnenuntergang. Ohne Kamera. Kommst du? Sag ja. Sag nicht nein. Sag einfach ja.', 'verlegen'),
  ], {
    choices: [
      { text: '„Ja.“', next: 'date-ja', effects: [set('collin_date_flutmauer')] },
      { text: '„Ich überleg’s mir, Star.“', next: 'date-vielleicht', effects: [set('collin_date_flutmauer')] },
    ],
  }),
  node('date-ja', [C('Ja! Sie hat … er hat … {name} hat JA gesagt! Exklusiv! … Das war off air. Oder? Bruno, war das off air?', 'freude')], { next: 'ende-rom' }),
  node('date-vielleicht', [C('Überlegen ist gut! Überlegen ist fast ja! Ich bin da. Abends. An der Mauer. Mit der besten Frisur meines Lebens.', 'signatur')], { next: 'ende-rom' }),
  node('ende-rom', [erz('Auf dem Weg von der Bühne hält er deine Hand immer noch. Er merkt es erst an der Bar. Dann lässt er nicht los.')], {
    effects: [xp(80), rel(ID, 60), set('collin_duett_romanze'), { message: 'Collin wartet abends auf der Flutmauer.' }],
  }),
  node('freund', [
    C('Das war … das war der beste Auftritt meines Lebens! Und ich hatte schon viele! Die meisten allein!', 'freude'),
    C('Du bist mein Duettpartner. Für immer. Das steht jetzt im Vertrag. Ich schreib ihn morgen.', 'signatur'),
    erz('Er drückt dir ein Glas Edelbrause in die Hand, stößt an und singt den Refrain noch einmal, allein, nur für dich, viel zu leise für ein Mikro.'),
  ], { effects: [xp(80), rel(ID, 60), set('collin_duett')] }),
]);

// ------------------------------------------------------------------------------------------- rom-collin-flutmauer (Geständnis)

const flutmauer = dlg('rom-collin-flutmauer', [
  node('start', [
    erz('Die Flutmauer, Sonnenuntergang. Collin steht am Geländer, im Trenchcoat, ohne Mikro, ohne Kameramann, und versucht so auszusehen, als stünde er zufällig hier. Er hat zwei Becher Edelbrause dabei. Einer ist schon halb leer, vor Nervosität.'),
    C('Du bist gekommen. Ich hab drei Begrüßungen geprobt. Alle weg. Hallo.', 'verlegen'),
    erz('Ihr lauft. Unter euch das Meer, grau und endlos, darüber Möwen, die Chrome-10-Flyer in den Schnäbeln tragen. Collin redet zehn Minuten über nichts. Dann bleibt er stehen.'),
    C('Weißt du, was das Problem ist, wenn man zwölf Jahre lang live ist? Man weiß nie, ob die Leute einen meinen. Oder die Sendung.', 'besorgt'),
    C('Und bei dir weiß ich es. Das ist das Furchterregendste, was mir je passiert ist. Ich bin … ich bin verknallt. In dich. Off air. Komplett off air.', 'zaertlich'),
  ], {
    choices: [
      { text: '„Sag’s noch mal. Ohne Moderationsstimme.“', check: chk('rom-collin-flutmauer-stimme', 'ausstrahlung', 6, ['flirt', 'gefuehl']), next: 'stimme' },
      { text: '„Ich bin auch verknallt, du eitler Pfau.“', next: 'pfau' },
      { text: 'Seine Hand nehmen. Nichts sagen.', next: 'hand' },
      { text: '„Collin … ich mag dich. Sehr. Aber nicht so.“', next: 'nein' },
    ],
  }),
  node('stimme', [
    erz('Er setzt an. Die Showstimme kommt, das warme Bariton-„Meine Damen und Herren“. Er schluckt sie runter. Was dann kommt, ist leiser, rauer, ein bisschen zittrig.'),
    C('Ich bin verknallt in dich. Und ich hab Angst. Und das ist das erste Mal seit zwölf Jahren, dass ich was sage, das keiner geschrieben hat.', 'zaertlich'),
    erz('Er sieht dich an. Kein Teleprompter. Kein rotes Licht. Nur ein Mann Mitte vierzig mit sehr viel Haarspray und, zum ersten Mal, einem Plan.'),
  ], { effects: [rel(ID, 30)], next: 'ja' }),
  node('pfau', [
    C('Pfau! Ich bin ein PFAU?', 'ueberrascht'),
    C('… Ja. Ich bin ein Pfau. Ein verknallter Pfau. Das ist der Titel meiner Autobiografie. Danke.', 'freude'),
  ], { next: 'ja' }),
  node('hand', [
    erz('Du nimmst seine Hand. Sie ist warm und ein bisschen feucht und hält deine so vorsichtig, als könnte sie zerbrechen. Collin sagt zum ersten Mal an diesem Abend minutenlang gar nichts.'),
    C('Das war die beste Antwort, die ich je bekommen hab. Und ich hab dreihundert Leute interviewt.', 'zaertlich'),
  ], { next: 'ja' }),
  node('ja', [
    erz('Die Sonne geht unter. Er lehnt sich zu dir. Ganz nah. Und dann bleibt er stehen, eine Fingerbreite vor deinem Gesicht, und grinst.'),
    C('Nein. Nicht hier. Den Kuss heb ich mir auf. Für einen Moment, der es verdient. Ich bin Fernsehmann. Ich hab ein Gespür für Dramaturgie.', 'signatur'),
    ich('Du bist unmöglich.'),
    C('Unglaublich. Das Wort heißt unglaublich.', 'zaertlich'),
  ], { effects: [xp(60), rel(ID, 40), set('collin_gestaendnis'), set('flirt_collin-charleston'), { message: 'Romanze mit Collin: Er hebt sich den Kuss auf.' }] }),
  node('nein', [
    C('Oh.', 'trauer'),
    erz('Er nickt. Zu schnell. Dann lacht er, ein bisschen zu laut, und wirft seinen Becher in hohem Bogen über die Mauer ins Meer.'),
    C('Gut. Gut! Ehrlich! Ich mag ehrlich. Ehrlich hat keine Quote, aber … ich mag es. Freunde?', 'besorgt'),
    ich('Die besten.'),
    C('Die besten. Live und unzensiert. Und wehe, du erzählst Delya davon. Sie macht einen Bericht draus. Mit Grafik.', 'freude'),
  ], { effects: [xp(40), rel(ID, 20), set('collin_romanze_abgelehnt')] }),
]);

// ------------------------------------------------------------------------------------------- he-collin-charleston-10

const he10 = dlg('he-collin-charleston-10', [
  node('start', [
    erz('NX-1-Studio, Hauptsendezeit. Eine Sondersendung: „Unterstadt-Held: Die wahre Geschichte von {name}“. Collin sitzt am Nachrichtentisch, du auf dem Gaststuhl, der Kameramann hinter der großen Kamera. Sein Visier zeigt: [ON AIR].'),
    C('Guten Abend, Noxius! Heute bei mir: jemand, über den die ganze Stadt redet. Und ich rede am lautesten.', 'signatur'),
    erz('Dann flackert der Teleprompter. Mitten im Text erscheint eine neue Zeile, die keiner geschrieben hat: „UNTERBRECHUNG: CHROME-10-SONDERANGEBOT. JETZT.“ Darunter, in der Ecke des Monitors, ein glänzendes Lächeln.'),
  ], { choices: weiter([[PIXEL_DONE, 'ohne-pete'], [null, 'pete']]) }),
  node('pete', [
    Z('Auf dem Studiomonitor erscheint Pixel-Pete. Makellos. „Guten Abend! Ich übernehme ab hier. Collin wirkt erschöpft. Ein Werbespot hilft.“'),
    C('Er … er ist in der Leitung. In MEINER Sendung.', 'besorgt'),
  ], { next: 'wahl' }),
  node('ohne-pete', [
    Z('Aus der Regie die Stimme von Herrn Glattstrich: „Collin! Werbung! JETZT! Quantum hat die halbe Stunde gekauft!“'),
    C('Glattstrich. Natürlich. Wenn kein Roboter mich abschalten will, macht es ein Mensch mit Lineal.', 'wut'),
  ], { next: 'wahl' }),
  node('wahl', [], {
    choices: [
      { text: 'Unter dem Tisch das Kabel des Teleprompters ziehen.', check: chk('he-collin-10-kabel', 'technik', 6, ['elektronik', 'sabotage']), next: 'kabel' },
      { text: 'In die Kamera: „Noxius, ihr wollt die Wahrheit über Chrome 10? Ich erzähl sie euch.“', check: chk('he-collin-10-wahrheit', 'ausstrahlung', 7, ['auftritt', 'ueberzeugen']), next: 'wahrheit' },
      { text: 'Zum Kameramann nicken. Er weiß, was zu tun ist.', next: 'kameramann' },
    ],
  }),
  node('kabel', [
    erz('Ein Ruck, ein Knistern, und der Teleprompter wird schwarz. Pixel-Petes Lächeln, die Werbezeile, alles weg. In der Regie schreit jemand. Collin starrt auf den leeren Bildschirm. Zum ersten Mal in seiner Karriere hat er nichts zum Ablesen.'),
  ], { effects: [rel(ID, 10)], next: 'collin' }),
  node('wahrheit', [
    ich('Chrome 10 sind keine Rabatte. Das sind Chips. Und die Chips sagen euch, was ihr denkt. Wenn euer Nachbar plötzlich „Master“ sagt, ist er nicht höflich geworden. Dann hat ihn jemand gekauft.'),
    erz('Stille. Im Studio, in der Regie, wahrscheinlich in der halben Stadt. Dann leuchtet das Telefonpult auf. Alle Leitungen gleichzeitig.'),
  ], { effects: [rel(ID, 20), rep('unterstadt', 5), rep('quantum', -5), set('collin_sondersendung_wahrheit')], next: 'collin' }),
  node('kameramann', [
    K('[ VERSTANDEN ]'),
    erz('Der Kameramann schwenkt die Kamera weg vom Monitor, weg vom Teleprompter, und hält sie nur noch auf euch zwei. Ganz nah. Was auch immer die Regie einspielen will: Es läuft ins Leere.'),
  ], { next: 'collin' }),
  node('collin', [
    C('Meine Damen und Herren, ich verletze jetzt jede Regel des Senders.', 'signatur'),
    erz('Er schiebt den Teleprompter mit dem Fuß weg. Der Ohrstöpsel brüllt. Er zieht ihn raus und wirft ihn über die Schulter.'),
  ], { choices: weiter([[ROM_BEREIT, 'rom-frage'], [null, 'freund']]) }),
  node('rom-frage', [
    C('Ich hab dreihundert Leute interviewt. Und keiner hat mich je gefragt, wie es MIR geht. Außer dir. Jeden. Verdammten. Tag.', 'zaertlich'),
    C('Ich hab dir auf der Mauer gesagt, ich heb mir was auf. Für einen Moment, der es verdient. Sechzigtausend Leute gucken zu. Verdient das genug?', 'verlegen'),
  ], {
    choices: [
      { text: 'Aufstehen. Ihm entgegenkommen.', next: 'rom' },
      { text: '„Nicht vor sechzigtausend Leuten, Collin.“', next: 'nicht-live' },
    ],
  }),
  node('rom', [erz('Er steht auf. Du auch. Die Regie brüllt durch die Lautsprecher. Der Kameramann zoomt nicht ran. Er zoomt raus. Ganz langsam.')], {
    effects: [{ cutscene: 'collin-testbild' }],
  }),
  node('nicht-live', [
    C('Nicht live. Natürlich. Du hast recht. Du hast immer recht, das ist anstrengend.', 'verlegen'),
    erz('Er greift nach seinem Mikro und hält es so, dass es eure Gesichter verdeckt. Hinter dem vergoldeten Mikrofon, für die Kamera nur ein Schatten, küsst er dich auf die Stirn. Dann ganz kurz auf den Mund. Das Mikro fängt nur ein Geräusch ein, das klingt wie ein Lächeln.'),
    C('Für die Zuschauer: Das war ein technisches Problem. Bitte bleiben Sie dran.', 'zaertlich'),
    erz('Nach der Sendung drückt er dir das Mikrofon in die Hand. Vergoldet, verbeult, mit seinem Namen eingraviert und einem Zahnabdruck am Griff.'),
  ], { effects: [set('collin_kuss'), set(`${ID}_romanze_zusammen`), { give: 'goldenes-mikro' }, xp(150), rel(ID, 60)] }),
  node('freund', [
    C('Diese Stadt hat mir zwölf Jahre lang zugehört. Heute hör ich zu. Erzähl. Alles. Ungeschnitten.', 'zaertlich'),
    erz('Und du erzählst. Eine Stunde lang. Ohne Werbepause. Von der Probezeit, vom Bruch, von Leuten, die nachts im Kanal herumlaufen und „Master“ murmeln. Die Regie gibt irgendwann auf und schaltet nur noch die Kamera nach.'),
    C('Das war meine beste Sendung. Weil ich fast nichts gesagt hab.', 'freude'),
    erz('Hinterher drückt er dir sein altes Mikrofon in die Hand. Vergoldet, verbeult, mit seinem Namen eingraviert und einem Zahnabdruck am Griff.'),
    C('Du bist jetzt offiziell Stimme der Straße. Auf Lebenszeit. Das ist kein Titel. Das ist eine Drohung.', 'signatur'),
  ], { effects: [{ give: 'goldenes-mikro' }, xp(120), rel(ID, 50), rep('nx1-medien', 5)] }),
]);

// ------------------------------------------------------------------------------------------- Tagesgespräche Akt 2/3

function gespraeche(M: Menu): DialogueDef[] {
  const chips = daily('collin-tag-akt2-chips',
    [
      C('{name}! Gut, dass du da bist! Ein Mensch! Ein echter, ungechippter, unhöflicher Mensch!', 'besorgt'),
      C('Glattstrich sagt seit Montag „Master“ zu Blade. Am Telefon. Mit Verbeugung. Ich hab ihn durchs Fenster gesehen. Er hat sich vor einem TELEFON verbeugt.'),
    ],
    [
      C('Die Visagistin hat einen Chip. Sie schminkt jetzt alle gleich. Ich sehe aus wie der Nachrichtensprecher von Chrome-City. Ich sehe aus wie WERBUNG.', 'wut'),
      C('Ich hab mir Alufolie in die Perücke gelegt. Delya sagt, das hilft nicht. Ich sag: Sie hat auch keinen Chip. Zufall? Ich glaube nicht.', 'signatur'),
    ],
    M);
  const chrome = daily('collin-tag-akt2-chrome',
    [C('Chrome 10! Chrome 10! Zehn Prozent auf alles! … Entschuldige. Ich hab heute vierzig Spots anmoderiert. Mein Mund macht das jetzt von allein.', 'besorgt')],
    [
      C('Ich hab heute zweimal „Chrome 9“ gesagt. Absichtlich. Es ist mein kleiner Widerstand. Mein Guerillakampf. Mit Frisur.', 'signatur'),
      K('[ZWEIMAL. ICH HAB MITGEZÄHLT.]'),
    ],
    M);
  const drohnen = daily('collin-tag-akt2-drohnen',
    [C('Seit gestern hängt eine Quantum-Drohne im Studio. Über dem Nachrichtentisch. Sie „unterstützt die Bildqualität“.', 'besorgt')],
    [C('Sie hat mir heute gesagt, dass meine linke Seite besser aussieht. Ich wusste das. Aber ich wollte es nicht von einer DROHNE hören.', 'wut')],
    M);
  const pete = daily('collin-tag-akt2-pete',
    [C('Pixel-Pete moderiert jetzt die Mittagsnachrichten. Er hat gestern gesagt: „Die Unterstadt freut sich über Chrome 10.“ Die Unterstadt hat sich nicht gefreut. Ich war da.', 'wut')],
    [C('Wenn du was findest. Irgendwas. Einen Bug, einen Kurzschluss, ein schlechtes Haar … Ich brauch dich. Mehr als Haarspray. Und das sag ich nicht leichtfertig.', 'besorgt')],
    M);
  const nyra = daily('collin-tag-nyra',
    [C('Wir sollen nichts über die Hackerin senden. „Silent Angel“. Anweisung von oben. Von GANZ oben. Mit Goldrand.', 'besorgt')],
    [C('Aber ich hab gestern im Wetterbericht „Leises Rauschen über dem Meer“ gesagt. Für sie. Falls sie zuhört. Delya sagt, das war kitschig. Delya hat geweint.', 'trauer')],
    M, { effects: [set('collin_nyra_gesagt')] });
  const ariaWeg = daily('collin-tag-aria-weg',
    [C('Der Einbruch im Campus. Ich hab einen Lieferwagen mit Salat erwähnt. Live. Weil es mir so aufgeschrieben wurde. Ich hab nicht gefragt, wer drin war.', 'besorgt')],
    [C('Jetzt hör ich, eure Brecherin ist weg. Und ich hab Witze über Salat gemacht. Ich bin ein schlechter Mensch mit einer guten Frisur.', 'trauer')],
    mehr(M, [{ text: '„Wo hast du das mit dem Lieferwagen her?“', next: 'quelle', once: true, id: 'c-salat' }], [
      node('quelle', [
        C('Aus der Regie. Glattstrich hatte einen Zettel. Und auf dem Zettel stand ganz unten, durchgestrichen: „Ware an R., Pumpwerk 7“. Ich hab gedacht, das ist eine Bestellung. Für Rasierwasser.', 'besorgt'),
        C('Das ist keine Bestellung für Rasierwasser, oder?', 'trauer'),
      ], { effects: [set('collin_aria_hinweis')], choices: [{ text: 'Noch was, Collin.', next: 'menue' }, { text: 'Bis dann.' }] }),
    ]),
    { effects: [set('collin_aria_weg_gesagt')] });
  const ariaZurueck = daily('collin-tag-aria-zurueck',
    [C('Sie ist zurück! Die Brecherin! Sie hat heute Morgen meinen Kameramann hochgehoben, um ihn zu umarmen! Mit Kamera! Bild: großartig! Ton: Schreie!', 'freude')],
    [K('[ICH HAB NICHT GESCHRIEN. DAS WAR DER HELM.]'), C('Er hat geschrien.', 'signatur')],
    M, { effects: [set('collin_aria_zurueck_gesagt')] });
  const party = daily('collin-tag-party',
    [
      C('Ich moderiere die Releaseparty. ICH. Im Himmelsgarten. Vor Blade Nocturne, vor Sybella Chrome, vor ganz Noxius.', 'besorgt'),
      C('Ich hab seit drei Nächten nicht geschlafen. Meine Perücke hat graue Haare bekommen. Eine PERÜCKE.'),
    ],
    [
      C('Und ihr geht da hin. Ich weiß es. Ich sag’s keinem. Ich hab’s nur Delya gesagt. Und dem Kameramann. Und meinem Spiegel. Der Spiegel ist verschwiegen.', 'verlegen'),
      C('Wenn ihr eine Gästeliste braucht: Die liegt in der Regie. In der grünen Mappe. Unter dem Lineal von Glattstrich. Ich hab nichts gesagt. Ich hab nur laut gedacht.', 'signatur'),
    ],
    M);
  const partyRom = daily('collin-tag-party-paar',
    [C('Du. Komm her. Ich muss mich an jemandem festhalten, der nicht moderiert werden will.', 'zaertlich')],
    [
      C('Wenn wir das überleben … nehm ich Urlaub. Zum ersten Mal seit zwölf Jahren. Mit dir. Irgendwo, wo es keinen Empfang gibt.', 'zaertlich'),
      C('Und wenn wir es nicht überleben, will ich, dass du weißt: Meine Frisur saß. Bis zum Schluss.', 'signatur'),
    ],
    M);
  const foyer = dlg('collin-tag-partynacht-foyer', [node('start', [
    C('Nicht jetzt, Liebling, nicht jetzt, ich bin in dreißig Sekunden live! Puder! Wo ist der Puder? Kameramann, bin ich glänzend?', 'besorgt'),
    K('[GLÄNZEND: JA. NERVÖS: SEHR.]'),
    C('… Du siehst gut aus. Sehr gut. Gefährlich gut. Was immer ihr vorhabt: Ich hab dich nicht gesehen. Ich seh sowieso nichts. Das Licht ist zu hell.', 'verlegen'),
  ])]);
  const podest = daily('collin-tag-partynacht',
    [C('Ich moderiere gleich Blades Rede. Wenn ich „Master“ sage, hau mir eine. Fest. Auf die linke Seite, die ist versichert.', 'besorgt')],
    [
      C('Hier oben sind sechshundert Gäste, und alle kriegen gleich einen Chip zum Champagner. Gratis. Ich hab gelernt: Gratis ist das teuerste Wort der Stadt. Von Ripper. Ausgerechnet.', 'besorgt'),
      D('Collin. Mikro an. Atmen.'),
      C('Ich atme! Ich atme so professionell, wie man atmen kann!', 'wut'),
    ],
    M);
  const endeErst = dlg('collin-tag-ende', [
    node('start', [C('DU! Komm her! Lass dich ansehen! Exklusiv! Unglaublich! Lebend!', 'freude')], {
      choices: weiter([[ENDE_NEXUS, 'nexus'], [ENDE_3B, 'dreib'], [null, 'meer']]),
    }),
    node('meer', [
      C('Blade Nocturne in Handschellen! Live! Ich hab es moderiert, und meine Stimme hat nur einmal gekiekst! Beste Quote der Sendergeschichte!', 'freude'),
      C('Und dann ist der Turm ausgegangen, und keiner hat mehr „Master“ gesagt, und Glattstrich hat sich bei mir entschuldigt. ENTSCHULDIGT. Ich hab’s aufgenommen. Ich hör es mir jeden Morgen an.', 'signatur'),
    ], { next: 'schluss' }),
    node('nexus', [
      C('Nexus moderiert jetzt das Wetter. Höflich. Mit „bitte“ und „danke“ und „liebe Kolleginnen und Kollegen“. Es ist der netteste Kollege, den ich je hatte, und ich hasse es.', 'besorgt'),
      C('Pixel-Pete ist übrigens gelöscht. Nexus hat ihn „in den Ruhestand verabschiedet“. Mit einer Rede. Ich hab geweint. Vor Erleichterung. Nur vor Erleichterung.', 'freude'),
    ], { next: 'schluss' }),
    node('dreib', [
      C('Ich hab heute Morgen „Guten Morgen“ gesagt! Zu mir selbst! Im Spiegel! Und es war mir egal, ob die Frisur sitzt!', 'freude'),
      C('Weißt du, wie es ist, drei Wochen lang „Alles ist gut, Master“ zu sagen und es nicht zu meinen? Und dann bist du zurückgekommen. Du. Mit einem verbeulten Auto und sehr viel Gehupe.', 'zaertlich'),
    ], { next: 'schluss' }),
    node('schluss', [], { choices: weiter([[ZUSAMMEN, 'paar'], [null, 'freund']]), effects: [set('collin_ende_kommentar'), xp(30), rel(ID, 20)] }),
    node('paar', [
      C('Und jetzt: Urlaub. Ich hab ihn eingereicht. Glattstrich hat unterschrieben, ohne zu lesen. Drei Wochen. Am Meer. Mit dir. Kein Empfang. Keine Kamera.', 'zaertlich'),
      K('[ICH KOMM NICHT MIT.]'),
      C('Er kommt mit.', 'signatur'),
    ]),
    node('freund', [C('Du bist mein Lieblingsgast. Für immer. Ich hab das schon in den Vertrag geschrieben. Den gibt es übrigens wirklich. Unterschreib ihn nicht, da steht „Exklusivrechte“ drin.', 'freude')]),
  ]);
  const strand = daily('collin-tag-strand',
    [
      erz('Am Lagerfeuer am Meer sitzt Collin im Hawaiihemd, barfuß, eine Sonnenbrille in den Haaren, die er nicht trägt, weil sie die Frisur drückt.'),
      C('Hier hört mich keiner. Kein Sender, kein Mikro. Ich hab heute zwei Stunden geschwiegen. Delya hat die Zeit gestoppt. Es ist ein Rekord.', 'zaertlich'),
    ],
    [C('Morgen fahr ich zurück. Sendung. Aber die Wochenenden … die Wochenenden gehören dem Sand. Und dir. Und dem Sand.', 'verlegen')],
    M);
  const epilog = daily('collin-tag-epilog',
    [C('Guten Tag, Noxius! … Ach, du bist es. Ich begrüß inzwischen auch Möwen so. Alte Gewohnheit.', 'freude')],
    [
      C('Die neue Sendung heißt „Stimme der Straße – Live“. Jeden Freitag. Keine Werbung. Keine Teleprompter. Nur Leute aus der Unterstadt, die erzählen. Ich sitz daneben und halt die Klappe.', 'signatur'),
      C('Das Schwierigste daran ist das Klappe-Halten. Ich übe. Delya stoppt mit.', 'besorgt'),
    ],
    M);
  const master = dlg('collin-tag-master', [
    node('start', [
      C('Guten Abend, Master. Alles ist gut, Master. Die Einschaltquote ist ausgezeichnet, Master.', 'neutral'),
      erz('Sein Lächeln sitzt. Seine Frisur sitzt. Im Nacken glimmt ein blauer Punkt. Seine Augen folgen dir einen halben Takt zu spät.'),
    ], {
      choices: [
        { text: '„Collin. Ich bin’s.“', next: 'ich' },
        { text: '„Sag was, das nicht im Skript steht.“', check: chk('collin-master-skript', 'ausstrahlung', 8, ['ueberzeugen', 'gefuehl']), next: 'skript' },
        { text: 'Gehen.' },
      ],
    }),
    node('ich', [
      C('Natürlich sind Sie es, Master. Sie sind immer Sie. Das ist eine ausgezeichnete Eigenschaft.', 'neutral'),
      erz('Für einen Moment flackert der Punkt in seinem Nacken. Seine Hand zuckt zum Mikrofon und hält es so fest, dass die Knöchel weiß werden. Dann ist der Moment vorbei.'),
    ]),
    node('skript', [
      erz('Er öffnet den Mund. Was rauskommt, ist erst „Master“, dann ein Knacken, dann seine Stimme, die echte, ganz leise.'),
      C('… Neonherz. Zweiter Refrain. Du hast schief gesungen.', 'trauer'),
      C('Alles ist gut, Master.', 'neutral'),
      erz('Er dreht sich weg und moderiert weiter, in eine Kamera, die gar nicht läuft.'),
    ], { effects: [set('collin_master_erinnert'), rel(ID, 10)] }),
  ]);
  return [chips, chrome, drohnen, pete, nyra, ariaWeg, ariaZurueck, party, partyRom, foyer, podest, endeErst, strand, epilog, master];
}

// ------------------------------------------------------------------------------------------- Bausteine für collin-charleston.ts

/** Date auf der Flutmauer: eigenes Herz-Ereignis zwischen 8 und 10 (Romanzefassung). */
export const COLLIN_EVENT_FLUTMAUER: HeartEventDef = {
  id: 'rom-collin-flutmauer', hearts: 8, map: 'flutmauer', time: 'abend',
  when: all(ROM_NEU, seen('he-collin-charleston-8'), flag('collin_date_flutmauer')), dialogue: 'rom-collin-flutmauer',
};

export const COLLIN_TALK_MASTER: TalkDef = talk('collin-tag-master', MASTER);
export const COLLIN_TALK_23: TalkDef[] = [
  talk('collin-tag-ende', all(EPILOG, MEER_ENDE, noFlag('collin_ende_kommentar'))),
  talk('collin-tag-strand', all(EPILOG, ZUSAMMEN, { weekday: ['sa', 'so'] }, { time: 'abend' })),
  talk('collin-tag-epilog', EPILOG),
  talk('collin-tag-partynacht-foyer', all(PARTYNACHT, EINLASS_OFFEN)),
  talk('collin-tag-partynacht', PARTYNACHT),
  talk('collin-tag-party-paar', all(PARTY_PLAN, ZUSAMMEN)),
  talk('collin-tag-party', PARTY_PLAN),
  talk('collin-tag-aria-weg', all(NACH_BRUCH, ARIA_WEG, noFlag('collin_aria_weg_gesagt'))),
  talk('collin-tag-aria-zurueck', all(ARIA_ZURUECK, { flag: 'aria_gechippt' }, noFlag('collin_aria_zurueck_gesagt'))),
  talk('collin-tag-nyra', all(NYRA_WEG, ARIA_ZURUECK, noFlag('collin_nyra_gesagt'))),
  // Paar-Gespräch (aus collin-charleston.ts): an drei Tagen vor dem Akt-2-Alltag, im Nachspiel von dessen Gesprächen abgelöst.
  talk('collin-tag-paar', all(ZUSAMMEN, { weekday: ['di', 'do', 'sa'] })),
  talk('collin-tag-akt2-pete', all(NACH_BRUCH, PIXEL_AKTIV, { weekday: ['mo', 'mi', 'fr'] })),
  talk('collin-tag-akt2-chips', all(NACH_BRUCH, { weekday: ['mo', 'do', 'so'] })),
  talk('collin-tag-akt2-drohnen', all(NACH_BRUCH, { weekday: ['di', 'sa'] })),
  talk('collin-tag-akt2-chrome', NACH_BRUCH),
];

/** act23.json (vorangestellt): Partynacht im Foyer, dann am Presse-Podest; Nachspiel. */
export const COLLIN_SCHEDULE_23: ScheduleEntry[] = [
  { when: MASTER, place: { map: 'nx1-studio', at: 'studio-set' }, pose: 'moderieren' },
  { when: all(PARTYNACHT, EINLASS_OFFEN), place: { map: 'quantum-foyer', at: 'presse-ecke' }, pose: 'moderieren' },
  { when: PARTYNACHT, place: { map: 'himmelsgarten', at: 'presse-podest' }, pose: 'moderieren' },
  // Sondersendung (he-collin-charleston-10): abends im Studio, solange sie fällig ist.
  {
    slot: 'abend', when: all(NACH_BRUCH, seen('he-collin-charleston-8'), not(seen('he-collin-charleston-10')), { hearts: ID, min: 10 }),
    place: { map: 'nx1-studio', at: 'studio-set' }, pose: 'moderieren',
  },
  { slot: 'abend', days: ['sa', 'so'], when: all(EPILOG, MEER_ENDE, ZUSAMMEN), place: { map: 'das-meer', at: 'lagerfeuer' }, pose: 'sitzen' },
  { slot: 'abend', days: ['fr'], when: all(EPILOG, not(MASTER)), place: { map: 'nx1-studio', at: 'studio-set' }, pose: 'moderieren' },
];

export const COLLIN_PHONE: PhoneMessageDef[] = [
  {
    id: 'tel-collin-party', from: ID,
    text: 'Ich moderiere die Releaseparty. Ich hab Lampenfieber. Ich hatte nie Lampenfieber. Ich hab die Lampen immer GELIEBT. Ruf nicht zurück, ich bin beim Atmen.',
    auto: all(PARTY_PLAN, { hearts: ID, min: 4 }, noFlag('tel_collin_party')),
    effects: [set('tel_collin_party')],
    replies: [
      { text: '„Atme, Star. Du schaffst das.“', effects: [rel(ID, 10)] },
      { text: '„Die Lampen lieben dich auch.“', effects: [rel(ID, 15)] },
    ],
  },
  {
    id: 'tel-collin-flutmauer', from: ID,
    text: 'Flutmauer. Sonnenuntergang. Ich steh hier seit einer Stunde und tu so, als wäre ich zufällig hier. Eine Möwe hat mich angegriffen. Wegen der Frisur, glaub ich. Kommst du?',
    auto: all(ROM_NEU, flag('collin_date_flutmauer'), not(seen('rom-collin-flutmauer')), { time: 'abend' }, noFlag('tel_collin_flutmauer')),
    effects: [set('tel_collin_flutmauer')],
    replies: [{ text: '„Bin unterwegs.“' }, { text: '„Halt die Möwe hin. Ich komm.“', effects: [rel(ID, 5)] }],
  },
];

export function collin23(M: Menu): DialogueDef[] {
  return [he8, flutmauer, he10, ...gespraeche(M)];
}

