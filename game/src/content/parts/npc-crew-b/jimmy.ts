// Jimmy – ehemaliges Crew-Mitglied mit verseuchtem Neurochip (world.md §4.2, §4.6, §6.2 #6, §11.2).
// Vor side-jimmys-chip: unsichtbar, bis man 4 Spuren jimmy-spur-01…08 hat ([Gosse] zählt doppelt); dann M Wartehäuschen,
// T Bahnsteig, A/N Ölfass-Türme an der Hafenkante. Die Spuren liegen als Loot-Hotspots der Zonen-Agenten auf den Karten.
// Nach side-jimmys-chip (Quest-Agent, Wahl Neustart/Patch → Flags jimmy_status_neustart | jimmy_status_patch):
// M Dantes Werkstatt, T Botendienste (away), A High Voltage, N Crew-Quartier-Couch; Begleiter.
// Herz-Ereignisse 2/4/6 nach der Rettung, 8/10 angelegt und an act2 gebunden. Keine Rivalität (nur verletzte Werbesprüche).
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode, NpcDef } from '../../../modules/contracts';
import {
  type Menue, VEX, einmalig, aktiv, dialog, done, erz, flag, herz, ich, knoten, mindestens, offen, pruefung, rede, sammle,
  sprecher, tagesgespraech, ZEIT_HINWEIS,
} from './_helfer';

const J = sprecher('jimmy');
const H = sprecher('hunter');
const X = sprecher('xion-venom');

const QUEST = 'side-jimmys-chip';
const SPUREN = ['01', '02', '03', '04', '05', '06', '07', '08'].map((n) => `jimmy-spur-${n}`);
const JIMMY_DA: Condition = {
  any: [
    mindestens(SPUREN, 4),
    { all: [{ origin: 'origin-gossenkind' }, mindestens(SPUREN, 2)] },
    { flag: 'jimmy_spuren_genug' },
    { flag: 'jimmy_status_gefunden' },
  ],
};
const GERETTET: Condition = { any: [done(QUEST), { flag: 'jimmy_gerettet' }] };
const VERWIRRT: Condition = { all: [{ not: GERETTET }, JIMMY_DA] };
const PATCH: Condition = { flag: 'jimmy_status_patch' };
const NEUSTART: Condition = { all: [GERETTET, { not: PATCH }] };

// ---------------------------------------------------------------------------------------------- Vor der Rettung

/** Erstkontakt mit dem verwirrten Jimmy (world.md §6.2 #6: „Willkommen, wie kann ich Ihre Zukunft optimieren?“). */
const erstkontakt = dialog('jimmy-erstkontakt', [
  knoten('start', [
    erz('Zwischen den Ölfässern steht ein Mann im ölverschmierten Overall. Er hat gerade ein Fass auf ein anderes gestellt und richtet es mit der Wasserwaage aus. Die Wasserwaage ist eine Volt-Limo-Dose.'),
    J('Willkommen, wie kann ich Ihre Zukunft optimieren?', 'signatur'),
    J('Heute im Angebot: Ölfässer! Gestapelt! Handverlesen! Für nur drei Easy-Raten von „Ihre Seele“!', 'freude'),
  ], {
    effects: [flag('jimmy_status_gefunden')],
    choices: [
      { text: '„Jimmy. Ich komm von Vega. Und von Hunter.“', next: 'namen' },
      { text: '„Lötkolben-Soße, Jimmy. Rohrbank. Weißt du noch? Du schuldest mir drei Thermoskannen.“', tag: '[Gosse]', when: { origin: 'origin-gossenkind' }, next: 'gosse', effects: [herz('jimmy', 40)] },
      { text: '„Ich hätte gern eine Zukunft. Groß. Mit Pommes.“', next: 'bestellung', effects: [herz('jimmy', 20)] },
      { text: 'Seinen Nacken angucken. Da blinkt was unter der Haut.', check: pruefung('jimmy-chip-blick', 'technik', 5, ['cyberware', 'beobachten']), next: 'chip' },
    ],
  }),
  knoten('namen', [
    J('Vega … Vega … Ihre Anfrage wird bearbeitet.', 'trauer'),
    erz('Seine Augen flackern. Für eine halbe Sekunde ist da jemand anderes drin. Jemand, der Vega kennt.'),
    J('… Vega bringt Nudeln. Scharf. Ich … Fehler 404. Jimmy nicht gefunden. Bitte versuchen Sie es später erneut.', 'trauer'),
  ], { next: 'ende' }),
  knoten('gosse', [
    J('Soße. Thermoskanne. Heiß…getränk.', 'trauer'),
    J('Du … du hast immer die leeren Kannen zurückgebracht. Weil ich Pfand drauf hatte. Du warst mein bester Kunde. Mein einziger Kunde.', 'freude'),
    J('Update von mir: Fehler. Fehler. Ich weiß, wer du bist, aber ich weiß nicht, wer ich bin. Ist das ein Sonderangebot?', 'trauer'),
  ], { next: 'ende' }),
  knoten('bestellung', [
    J('Eine Zukunft mit Pommes! Ausgezeichnete Wahl! Ihre Bestellung wird bearbeitet!', 'freude'),
    erz('Jimmy stellt feierlich ein leeres Fass vor dich hin.'),
    J('Bitte sehr. Ihre Zukunft. Pommes sind aus. Pommes sind seit 2079 aus.'),
  ], { next: 'ende' }),
  knoten('chip', [
    erz('Unter der Haut am Nacken pulsiert ein Neurochip, viel zu hell, im Takt einer Werbemelodie. Daneben eine feine Narbe. Und ein winziges eingebranntes Logo, halb verwischt: ein Q.'),
    ich('Das Ding sendet. Oder empfängt. Jemand hat ihm Werbung direkt ins Hirn gekippt.'),
    J('Kundenservice von morgen! Jetzt mit noch mehr morgen!', 'signatur'),
  ], { next: 'ende', effects: [flag('jimmy_chip_gesehen')] }),
  knoten('ende', [
    erz('Jimmy wendet sich wieder seinen Fässern zu. Er summt einen Jingle. Er summt ihn falsch. Das ist das Menschlichste an ihm.'),
  ], {
    choices: [
      { text: 'Vega sagen, dass ich ihn gefunden hab.', when: offen(QUEST), effects: [{ startQuest: QUEST }] },
      { text: 'Fürs Erste gehen.' },
    ],
  }),
]);

const VERWIRRT_MENUE: Menue = {
  choices: einmalig('jimmy', [
    { text: 'Ein Fass anreichen.', next: 'fass', once: true, id: 'jv-fass', effects: [herz('jimmy', 15)] },
    { text: 'Den wackelnden Turm auffangen, bevor er umkippt.', check: pruefung('jimmy-turm-fangen', 'reflexe', 5, ['springen']), next: 'turm', once: true, id: 'jv-turm', effects: [herz('jimmy', 30)] },
    { text: '„Jimmy, du musst mit zu Dante.“', when: aktiv(QUEST), next: 'dante' },
    { text: 'Gehen.' },
  ]),
  nodes: [
    knoten('fass', [
      J('Vielen Dank für Ihren Einkauf! Dieses Fass wurde zu Ihrer Zufriedenheit gestapelt!', 'freude'),
      erz('Er streichelt das Fass. Dann dich. Kurz, auf den Arm. Dann erschrickt er und entschuldigt sich beim Fass.'),
    ]),
    knoten('turm', [
      erz('Der oberste Turm neigt sich. Du springst, fängst das Fass mit der Schulter ab und schiebst es zurück. Jimmy starrt dich an.'),
      J('Sie haben … meinen Turm gerettet. Ich … das war … danke.', 'trauer'),
      J('Upps. Danke. Bitte bewerten Sie diesen Service mit fünf Sternen.', 'signatur'),
    ]),
    knoten('dante', [
      J('Dante … Dante … Werkstatt. Kekse. Platten.', 'trauer'),
      J('Nein. Nein, nein. Der Chip sagt: Werkstatt ist ein Konkurrenzprodukt. Ich darf nicht zur Konkurrenz.', 'wut'),
      erz('Er braucht Ruhe, bevor er mitkommt. Ein Ruhemodus, ein vertrauter Mensch, ein Lied, das er liebt. Oder ein sehr, sehr sanfter Kampf.'),
    ]),
  ],
};

const V = {
  turm: tagesgespraech('jimmy-tag-verwirrt-turm',
    [J('Willkommen, wie kann ich Ihre Zukunft optimieren? Unser Turm des Tages: sieben Fässer, null Statik, hundert Prozent Hoffnung!', 'signatur')],
    [J('Ich baue Türme, weil von oben das Signal besser ist. Welches Signal? Gute Frage. Bitte warten Sie. Sie sind der nächste in der Warteschleife.', 'trauer')],
    VERWIRRT_MENUE),
  schlaf: tagesgespraech('jimmy-tag-verwirrt-schlaf',
    [
      erz('Jimmy liegt zusammengerollt auf der Bank im Wartehäuschen, die Jacke als Kissen. Er schnarcht im Rhythmus eines Werbejingles.'),
      J('Zzz … Ihr Anruf ist uns wichtig … zzz … bitte legen Sie nicht auf …'),
    ],
    [J('… zzz … Vega? … Nudeln … scharf … zzz … Update von mir … zzz …', 'trauer')],
    VERWIRRT_MENUE),
  bahnsteig: tagesgespraech('jimmy-tag-verwirrt-bahnsteig',
    [J('Achtung am Gleis eins: Ein Zug fährt ein! Bitte begrüßen Sie ihn herzlich! WILLKOMMEN, ZUG!', 'freude')],
    [J('Ich zähle Züge. Vierhundertzwölf. Kreidestriche. Die Kreide ist alle. Der Zug hat sich nicht bedankt. Züge sind unhöflich. Ich bin trotzdem freundlich. Das ist mein Job.', 'signatur')],
    VERWIRRT_MENUE),
  traurig: tagesgespraech('jimmy-tag-verwirrt-traurig',
    [J('Ihre Bewertung wurde gespeichert: ein Stern. Danke für … nichts. Danke für nichts.', 'trauer')],
    [J('Ich bin nicht böse. Ich kann nicht böse sein. Mein Chip hat keine Taste dafür. Aber ich hab eine Taste für traurig. Die drück ich gerade.', 'trauer')],
    { choices: [{ text: 'Gehen.' }], nodes: [] }),
};

// ---------------------------------------------------------------------------------------------- Nach der Rettung

function menue(): Menue {
  const zurueck: DialogueChoice[] = [{ text: 'Noch was, Jimmy.', next: 'menue', id: 'zurueck' }, { text: 'Bis später.' }];

  const choices: DialogueChoice[] = einmalig('jimmy', [
    { text: 'Komm mit, Jimmy. Ich brauch dich draußen.', when: { all: [GERETTET, { not: { recruited: 'jimmy' } }] }, next: 'rekrut', effects: [{ recruit: 'jimmy' }] },
    { text: 'Wie geht’s dem Chip?', next: 'chip-patch', when: PATCH },
    { text: 'Wie geht’s dem Kopf?', next: 'chip-neustart', when: NEUSTART },
    { text: '„Lötkolben-Soße, Jimmy.“', tag: '[Gosse]', when: { origin: 'origin-gossenkind' }, once: true, id: 'jg-gosse', next: 'gosse', effects: [herz('jimmy', 30)] },
    { text: 'Was weißt du noch von früher?', requires: { hearts: 'jimmy', min: 3 }, tag: '[Jimmy ♥3]', once: true, id: 'jg-frueher', next: 'frueher' },
    { text: 'Hunter hat gesagt, du bist durch.', once: true, id: 'jg-hunter', next: 'hunter' },
    { text: '„Aria und ich … Was meinst du?“', tag: '[Vex]', when: { all: [VEX, { any: [{ flag: 'vexaria_knutsch' }, { flag: 'aria_romanze_angebahnt' }] }] }, once: true, id: 'jg-vex', next: 'vex' },
    { text: 'Bis später.' },
  ]);

  const nodes: DialogueNode[] = [
    knoten('menue', [J('Was kann ich für dich tun? Also, nicht so wie früher. Normal. Einfach so. Als Mensch. Ich übe noch.', 'freude')], { choices }),
    knoten('rekrut', [
      J('Echt? JA! Ich meine: ja. Gerne. Ich hol meine Funkenschleuder. Die hab ich unter der Couch. Neben den Socken. Nicht neben meinen.', 'freude'),
      J('Ich bin der Ersatzmann. Wenn einer umfällt, steh ich da. Das konnt ich immer. Rumstehen. Jetzt mach ich’s professionell.'),
    ]),
    knoten('chip-patch', [
      J('Gut! Meistens. Manchmal sag ich noch „Vielen Dank für Ihren Einkauf“, wenn mir einer die Tür aufhält. Und manchmal, im Kampf, kommen … Funken. Aus Stellen, wo keine Funken sein sollten.', 'signatur'),
      J('Dante sagt, das ist ein Feature. Ich glaub, Dante lügt, wenn er mich mag.'),
    ], { choices: zurueck }),
    knoten('chip-neustart', [
      J('Leer. Sauber. Wie eine frisch gewischte Bar.', 'freude'),
      J('Ich hab ein paar Sachen vergessen. Wer Dexter ist, zum Beispiel. Ich hab das Gefühl, ich schulde ihm Geld. Ich hab das Gefühl, ich schulde allen Geld. Ist das normal?', 'besorgt'),
    ], { choices: zurueck }),
    knoten('gosse', [
      J('Soße! Ich weiß es wieder! Die Thermoskannen! „Heißgetränk“! Der Pfand!', 'freude'),
      J('Weißt du, was das Verrückte ist? Mit dem Chip hab ich nur Werbung im Kopf gehabt. Aber die Soße war schon damals Betrug. Ich war schon immer im Marketing.', 'signatur'),
    ], { choices: zurueck }),
    knoten('frueher', [
      J('Zwei Jobs. Tagsüber für Hunter, Kisten und Botengänge. Nachts Putzkolonne. Bei Digitech, in der Ruine, für die Abrissfirma. Bevor da alles zu war.', 'besorgt'),
      J('Ich war immer müde. Und dann stand da dieser Werbestand. Gratis-Chip. „Nie wieder müde!“ Ich war nie wieder müde. Ich war nie wieder irgendwas.', 'trauer'),
    ], { choices: zurueck, effects: [herz('jimmy', 20)] }),
    knoten('hunter', [
      J('Hat er? Ja. Hat er bestimmt.', 'trauer'),
      J('Weißt du, er hat recht gehabt. Ich war durch. Durch wie ein Toast, den keiner rausholt. Aber dann hat mich einer rausgeholt.', 'freude'),
      J('Er muss sich nicht entschuldigen. Er wird’s irgendwann trotzdem tun, weil er Hunter ist und Schulden hasst. Auch die, die er mir schuldet.'),
    ], { choices: zurueck }),
    knoten('vex', [
      J('Oh! Oh, ich hab Erfahrung in Kundenzufriedenheit! Lass mich analysieren.', 'freude'),
      J('Aria sagt zu dir „Arschloch“ in einem Ton, den ich als „Premium-Kundenbindung“ einstufen würde. Das ist das Höchste, was es gibt. Zu mir sagt sie nur „Jimmy, verpiss dich“. Das ist Standard-Tarif.'),
      J('Mein Rat: Nicht kündigen. Lebenslanges Abo. Kein Kleingedrucktes.', 'signatur'),
    ], { choices: zurueck, effects: [herz('jimmy', 10)] }),
  ];
  return { choices, nodes };
}

const M = menue();

const T = {
  zeit: tagesgespraech('jimmy-tag-zeit',
    [J('{name}! Mein Lieblingsmensch auf Platz … ich hab die Liste neu sortiert. Du stehst oben. Hunter ist sauer.', 'freude'), erz(ZEIT_HINWEIS)],
    [J('Da ist noch was, das ich Hunter sagen muss. Oder er mir. Wir wissen beide nicht, wer anfängt. Wir warten auf den richtigen Moment. Der richtige Moment ist schüchtern.', 'trauer')],
    M),
  danke: tagesgespraech('jimmy-tag-danke',
    [
      J('Du! DU! Du bist die Person! Die Person, die mich rausgeholt hat!', 'freude'),
      J('Ich weiß nicht genau, was ich in den letzten Wochen gemacht hab. Dante sagt, ich hab Türme gebaut. Vega sagt, ich hab ihr eine Regenversicherung verkauft. Die ist übrigens gültig.'),
    ],
    [J('Ich hab beschlossen, nie wieder was Gratis anzunehmen. Außer Kekse von Dante. Die sind nicht gratis, die kosten Zuhören.', 'signatur')],
    M, { effects: [flag('jimmy_kommentar_danke'), herz('jimmy', 20)] }),
  werkstatt: tagesgespraech('jimmy-tag-werkstatt',
    [J('Morgen! Dante hat mich zum Keks-Vorkoster ernannt. Ich bin quasi Lebensmittelprüfer. Wenn ich umfalle, war der Teig schlecht.', 'freude')],
    [J('Ich sitz auf dem Hocker, weil Dante sagt, mein Kopf braucht morgens Ruhe. Mein Kopf hat sieben Wochen Werbung geschaut. Der braucht ein Jahr Ruhe. Mindestens.', 'signatur')],
    M),
  club: tagesgespraech('jimmy-tag-club',
    [J('Abend! Ich darf wieder rein! Hunter hat gesagt: „Aber du zahlst.“ Ich zahl! Mit echtem Geld! Nicht mit Gutscheinen!', 'freude')],
    [J('Der Barkeeper hat mir einen Drink gemacht, der „Neustart“ heißt. Er hat erst gesagt, das ist nur Wasser. Ich hab trotzdem geweint.', 'trauer')],
    M),
  couch: tagesgespraech('jimmy-tag-couch',
    [J('Psst. Ich schlaf hier. Auf der Couch. Im Quartier. Mit Decke. Mit einer echten Decke, nicht mit einem Werbeplakat.', 'freude')],
    [J('Wenn ich nachts aufwache und „Willkommen“ sage, ist das nur ein Reflex. Bitte nicht wegrennen. Einfach „Danke“ sagen, dann schlaf ich weiter.', 'besorgt')],
    M),
  patch: tagesgespraech('jimmy-tag-patch',
    [J('Hallo! Update von mir: Mir geht’s gut! Upps. Alter Code. Ich mein: Mir geht’s gut. Ohne Update.', 'signatur')],
    [J('Gestern hab ich einem Typen auf dem Schrottmarkt aus Versehen eine Garantieverlängerung verkauft. Für einen Toaster. Er war glücklich. Ich auch. Der Toaster nicht.', 'freude')],
    M),
  vertraut: tagesgespraech('jimmy-tag-vertraut',
    [J('{name}! Ich hab dir was mitgebracht. Nichts. Aber mit Liebe. Ich übe noch, was Geschenke angeht. Bisher verschenk ich hauptsächlich Begeisterung.', 'freude')],
    [J('Weißt du, was das Schönste an Freunden ist? Die wollen nichts verkaufen. Ich hab das lange nicht gewusst.')],
    M),
  standard: tagesgespraech('jimmy-tag-standard',
    [J('Hi! Ich bin’s. Jimmy. Der echte. Mit allen Updates. Also, mit keinen. Du weißt, was ich meine.', 'freude')],
    [J('Ich hab mir angewöhnt, jedem Zug zu winken. Nicht, weil der Chip das sagt. Weil’s nett ist. Züge haben auch Gefühle. Wahrscheinlich nicht. Aber vielleicht.')],
    M),
};

// ---------------------------------------------------------------------------------------------- Herz-Ereignisse

const he2 = dialog('he-jimmy-2', [
  knoten('start', [
    erz('Dantes Werkstatt, früh. Jimmy sitzt auf seinem Hocker, die Hände um eine Tasse Kakao, als wäre sie ein Rettungsring. Als er dich sieht, springt er auf und verschüttet die Hälfte.'),
    J('Update von mir. Nein. Halt. Kein Update. Ich wollte … ich will … Danke. Ich hab das geübt. Vor dem Spiegel. Der Spiegel war nicht beeindruckt.', 'besorgt'),
    J('Du hast mich da rausgeholt. Aus den Fässern. Aus dem Kopf. Ich weiß nicht, wie man so was zurückzahlt. Ich hab Hunter gefragt. Er hat gesagt: „In Raten.“', 'trauer'),
  ], {
    choices: [
      { text: '„Du schuldest mir nichts, Jimmy.“', next: 'nichts', effects: [herz('jimmy', 30)] },
      { text: '„Gib Dexter seine Kohle zurück. Dann sind wir quitt.“', check: pruefung('he-jimmy-2-dexter', 'ausstrahlung', 4, ['ueberreden', 'schulden']), next: 'dexter', effects: [herz('jimmy', 40), herz('dexter', 20)] },
      { text: '„Eine Pizza. Mit Pommes drauf. Zukunft mit Pommes, weißt du noch?“', next: 'pommes', effects: [herz('jimmy', 40)] },
    ],
  }),
  knoten('nichts', [J('Doch. Tu ich. Und das ist schön. Früher hab ich nur Leuten was geschuldet, die ich nicht mochte.', 'freude')], { next: 'ende' }),
  knoten('dexter', [
    J('Dexter. Dexter … der Schrotthändler? Dem schulde ich was?', 'ueberrascht'),
    J('Okay. Okay! Ich zahl. Ich trag drei Wochen lang Kisten für ihn. Und ich sag nicht ein einziges Mal „Vielen Dank für Ihren Einkauf“. Höchstens zweimal.', 'signatur'),
  ], { next: 'ende' }),
  knoten('pommes', [
    J('Ich … ich erinnere mich. Ich hab dir ein leeres Fass verkauft. Als Zukunft.', 'trauer'),
    J('Diesmal mach ich’s richtig. Pizza mit Pommes. Ich zahl. Mit echten Credits. Freitag. Ich schreib’s mir auf. Auf die Hand. Mit Edding.', 'freude'),
  ], { next: 'ende' }),
  knoten('ende', [
    erz('Jimmy drückt dir etwas in die Hand: eine Dose Volt-Limo, eiskalt, und einen Zettel, auf dem in sehr ordentlicher Schrift steht: „Gutschein für einmal Jimmy. Unbegrenzt gültig.“'),
  ], { effects: [{ give: 'volt-limo' }, flag('jimmy_gutschein'), { xp: 40 }] }),
]);

const he4 = dialog('he-jimmy-4', [
  knoten('start', [
    erz('Neon-Gasse, Abend. Aus einem kaputten Lautsprecher am Kiosk dudelt ein Schlager von 2070. Mitten auf dem Pflaster tanzt Jimmy. Schlecht. Mit voller Hingabe.'),
    J('Komm! Tanz mit! Das Lied lief immer in der Putzkolonne! Nachts, bei Digitech! Wir haben mit den Wischmopps getanzt!', 'freude'),
  ], {
    choices: [
      {
        text: 'Mittanzen.', next: 'erinnerung',
        effects: [{
          minigame: 'akt-tanz', level: 1, key: 'he-jimmy-4-tanz', label: 'Gassentanz mit Jimmy',
          win: [herz('jimmy', 30), { message: 'Ihr tanzt, bis der Kiosk-Wächter applaudiert. Zögerlich, aber er applaudiert.' }],
          lose: [herz('jimmy', 15), { message: 'Du trittst Jimmy dreimal auf den Fuß. Er bedankt sich jedes Mal.' }],
        }],
      },
      { text: 'Einen Moonwalk über das nasse Pflaster legen.', check: pruefung('he-jimmy-4-moonwalk', 'reflexe', 5, ['tanz']), next: 'erinnerung', effects: [herz('jimmy', 40)] },
      { text: 'Am Rand stehen und klatschen.', next: 'erinnerung', effects: [herz('jimmy', 20)] },
    ],
  }),
  knoten('erinnerung', [
    erz('Das Lied endet. Jimmy bleibt stehen, außer Atem, und starrt auf das Pflaster, als läge da etwas.'),
    J('Da war ein Raum. Bei Digitech. Ganz unten. Den durften wir nicht putzen. Rote Tür. Und dahinter hat was gesummt. Wie ein Kühlschrank, der denkt.', 'besorgt'),
    J('Einmal stand die Tür offen. Da drin waren lauter Chips. In Reihen. Mit einem Q drauf. Ich hab’s vergessen. Bis gerade. Bis zu dem Lied.', 'trauer'),
  ], {
    choices: [
      { text: '„Ein Q. Quantum?“', next: 'quantum' },
      { text: '„Du musst das Dante erzählen.“', next: 'dante' },
    ],
  }),
  knoten('quantum', [J('Ich weiß nicht. Damals hieß das noch nicht so. Aber das Logo war dasselbe wie … wie auf meinem Gratis-Chip.', 'besorgt')], { next: 'ende' }),
  knoten('dante', [J('Dante. Ja. Der wird sich aufregen. „Um Himmels Willen!“ Ich mag es, wenn er sich aufregt. Das heißt, es ist wichtig.', 'signatur')], { next: 'ende' }),
  knoten('ende', [J('Danke fürs Tanzen. Mein Kopf erinnert sich besser, wenn meine Füße dabei sind.', 'freude')], {
    effects: [flag('jimmy_digitech_erinnerung'), { xp: 60 }],
  }),
]);

const he6 = dialog('he-jimmy-6', [
  knoten('start', [
    erz('Neon-Gasse, vor dem Werbestand. Holoschilder blinken: „Chrome 10 – Bald gratis für alle!“ Jimmy steht davor, die Hände in den Taschen, ganz still.'),
    J('Hier war’s. Genau hier. Dieser Stand. Damals stand da ein Korb mit Chips. „Gratis-Test! Nie wieder müde!“', 'trauer'),
    J('Ein Mann im weißen Anzug hat ihn mir in die Hand gedrückt. Mit einem Lächeln wie eine Klinge. Er hat gesagt: „Du bist genau unsere Zielgruppe.“', 'besorgt'),
    X('Kann ich helfen? Oh. Du schon wieder. Kundenservice von morgen. Wie läuft’s?', 'signatur'),
  ], {
    choices: [
      { text: 'Einen der Werbeflyer einstecken. Auf der Rückseite steht eine Chargennummer.', check: pruefung('he-jimmy-6-flyer', 'strasse', 5, ['geruecht', 'beobachten']), next: 'flyer', effects: [herz('jimmy', 40)] },
      { text: 'Den Chipkorb mit dem Handscanner abtasten.', check: pruefung('he-jimmy-6-scan', 'technik', 5, ['hacken']), next: 'scan', effects: [herz('jimmy', 40)] },
      { text: 'Ein Foto vom Stand machen. Mit Xion drauf.', next: 'foto', effects: [herz('jimmy', 30)] },
      { text: 'Jimmy wegziehen. „Komm. Der ist es nicht wert.“', next: 'weg', effects: [herz('jimmy', 20)] },
    ],
  }),
  knoten('flyer', [
    erz('Chargennummer Q-2086-0047. Dieselbe Nummer wie die, die Dante unter dem Lack von Jimmys altem Chip gefunden hat. Wenn er sie gefunden hat. Jetzt hast du sie schwarz auf Hochglanz.'),
    X('Hey. Die Flyer sind zum Lesen, nicht zum Klauen.', 'wut'),
    ich('Ich lese gründlich.'),
  ], { next: 'ende' }),
  knoten('scan', [
    erz('Der Scanner piept dreimal. Jeder „Gratis-Chip“ im Korb trägt dieselbe versteckte Kennung. Sie senden alle auf einer Frequenz, die nicht im Verzeichnis steht.'),
    X('Was machst du da? Das ist ein Werbestand. Kein Labor.', 'wut'),
  ], { next: 'ende' }),
  knoten('foto', [
    erz('Klick. Xion hebt die Hand vors Gesicht, zu spät. Auf dem Bild: der Stand, der Korb, das Logo. Und Jimmy im Hintergrund, mit einem Gesicht, das alles erzählt.'),
    X('Löschen. Sofort.', 'wut'),
    J('Nein.', 'wut'),
    erz('Das erste Mal, dass du Jimmy „nein“ sagen hörst. Es klingt gut.'),
  ], { next: 'ende' }),
  knoten('weg', [
    J('Nein. Warte. Ich will mir das merken. Ganz genau. Damit ich es irgendwann erzählen kann. Vor Gericht. Oder im Fernsehen. Oder Collin.', 'besorgt'),
    erz('Jimmy prägt sich den Stand ein. Jede Schraube, jedes Logo. Du siehst ihm dabei zu, wie er zum ersten Mal seit Wochen ganz da ist.'),
  ], { next: 'ende' }),
  knoten('ende', [
    J('Das war kein Unfall. Das war Absicht. Ich war ein Test. Ein Kundentest.', 'wut'),
    J('Update von mir: Ich bin sauer. Das ist neu. Ich glaub, das ist gesund.', 'signatur'),
  ], { effects: [flag('xion_werbestand_beweis'), { xp: 90 }] }),
]);

// ♥8 und ♥10: angelegt, erst ab act2 (world.md §11.2).
const he8 = dialog('he-jimmy-8', [
  knoten('start', [
    erz('High Voltage, nach Feierabend. Hunter steht an Jimmys Tisch, die Sonnenbrille in der Hand. Das macht er nie.'),
    H('Jimmy. Ich hab gesagt, du bist durch. Vor allen. Das war falsch.', 'besorgt'),
    H('Schulden muss man immer begleichen. Das hier ist meine.'),
    J('… Hunter. Ich … Fehler 404. Worte nicht gefunden.', 'trauer'),
  ], {
    choices: [
      { text: 'Jimmy eine Hand auf die Schulter legen. „Sag einfach Danke, Jimmy.“', next: 'ende', effects: [herz('jimmy', 40), herz('hunter', 20)] },
      { text: '„Hunter, setz dich. Das wird länger.“', check: pruefung('he-jimmy-8-hunter', 'ausstrahlung', 6, ['ueberreden']), next: 'ende', effects: [herz('jimmy', 50), herz('hunter', 30)] },
    ],
  }),
  knoten('ende', [J('Danke. Danke, Boss. Bitte bewerten Sie … nein. Einfach nur: danke.', 'freude')], { effects: [flag('hunter_entschuldigt_jimmy'), { xp: 120 }] }),
]);

const he10 = dialog('he-jimmy-10', [
  knoten('start', [
    erz('Dach des Crew-Quartiers. Jimmy hält dir einen abgegriffenen Casino-Chip hin, rot, mit einem Kratzer quer über der Zahl.'),
    J('Mein Glückschip. Hab ich seit ich sieben bin. Der hat mich nie verlassen. Nicht mal, als ich mich selbst verlassen hab.', 'trauer'),
    J('Jetzt gehört er dir. Weil du auch geblieben bist.', 'freude'),
  ], { choices: [{ text: 'Den Chip nehmen.', next: 'ende' }] }),
  knoten('ende', [J('Willkommen. Wie kann ich deine Zukunft optimieren? … Das war ein Witz. Ein eigener. Von mir.', 'signatur')], {
    effects: [{ give: 'jimmys-glueckschip' }, herz('jimmy', 40), { xp: 150 }],
  }),
]);

// ---------------------------------------------------------------------------------------------- Figur

const jimmy: NpcDef = {
  id: 'jimmy',
  name: 'Jimmy',
  unknownName: 'Mann zwischen Ölfässern',
  knownFlag: 'jimmy_status_gefunden',
  portrait: 'jimmy',
  sprite: 'jimmy-walk',
  faction: 'crew-hunter',
  bio: 'Ehemaliges Crew-Mitglied, das zwei Jobs gleichzeitig machte. Ein Gratis-Chip von Xions Werbestand hat seinen Neurochip verseucht; seitdem hält er sich für den „Kundenservice von morgen“ und baut nachts Türme aus Ölfässern.',
  gifts: {
    loves: ['synth-nudeln', 'katzenvideo-archiv', 'alter-neurochip'],
    likes: ['neon-limo', 'nougatbombe', 'comic-heft', 'aufzieh-roboter', 'echtobst-apfel', 'hofhonig'],
    dislikes: ['faxpapier', 'synth-kaffee'],
    hates: ['virus-implantat', 'magnet-stoerer'],
  },
  schedule: [
    // Nach side-jimmys-chip: Crew-Alltag.
    { slot: 'morgen', when: GERETTET, place: { map: 'dantes-werkstatt', at: 'jimmy-hocker' } },
    { slot: 'tag', when: GERETTET, place: 'away' },
    { slot: 'abend', when: GERETTET, place: { map: 'high-voltage', at: 'sitzecke-gaeste' } },
    { slot: 'nacht', when: GERETTET, place: { map: 'crew-quartier', at: 'couch' } },
    // Vorher: erst ab 4 Spuren sichtbar.
    { slot: 'morgen', when: JIMMY_DA, place: { map: 'bahnhof-mitte', at: 'wartehaeuschen' }, dialogue: 'jimmy-tag-verwirrt-schlaf' },
    { slot: 'tag', when: JIMMY_DA, place: { map: 'bahnhof-mitte', at: 'bahnsteig-ende' }, dialogue: 'jimmy-tag-verwirrt-bahnsteig' },
    { slot: ['abend', 'nacht'], when: JIMMY_DA, place: { map: 'hafenkante', at: 'oelfass-tuerme' } },
    { place: 'away' },
  ],
  heartEvents: [
    { id: 'he-jimmy-2', hearts: 2, map: 'dantes-werkstatt', time: 'morgen', when: GERETTET, dialogue: 'he-jimmy-2' },
    { id: 'he-jimmy-4', hearts: 4, map: 'neon-gasse', time: 'abend', when: GERETTET, dialogue: 'he-jimmy-4' },
    { id: 'he-jimmy-6', hearts: 6, map: 'neon-gasse', time: 'abend', when: { all: [GERETTET, { seen: 'he-jimmy-4' }] }, cutscene: 'szene-he-jimmy-6', dialogue: 'he-jimmy-6' },
    { id: 'he-jimmy-8', hearts: 8, map: 'high-voltage', time: ['abend', 'nacht'], when: { all: [{ act: 2 }, GERETTET] }, dialogue: 'he-jimmy-8' },
    { id: 'he-jimmy-10', hearts: 10, map: 'crew-quartier', when: { all: [{ act: 2 }, { seen: 'he-jimmy-8' }] }, dialogue: 'he-jimmy-10' },
  ],
  companion: {
    // world.md §4.6: ab side-jimmys-chip. Neustart = Hacker (Firewall-Kuss), Patch = Chaos (Chipfieber).
    // Die Fähigkeitswahl nach Variante kennt CompanionDef nicht (Lücke notiert); Grundausstattung = Neustart.
    recruit: GERETTET,
    stats: {
      hp: 44, armor: 1, morale: 75,
      attributes: { technik: 6, koerper: 4, reflexe: 6, ausstrahlung: 5, strasse: 4 },
      weapon: { kind: 'fernkampf', damage: 5, range: 3, hit: 0 },
      abilities: ['jimmy-firewall-kuss', 'jimmy-ersatzmann'],
    },
    heartAbilities: [{ hearts: 6, ability: 'jimmy-comeback' }],
    // Variante „Patch“ statt „Neustart“ (side-jimmys-chip): Chipfieber statt Firewall-Kuss.
    abilityRules: [{ when: { flag: 'jimmy_status_patch' }, replace: ['jimmy-firewall-kuss', 'jimmy-chipfieber'] }],
  },
  partyCheckBonus: [
    { attribute: 'ausstrahlung', tags: ['verhandeln', 'feilschen'], value: 1, label: 'Jimmy macht Verkaufsgespräch' },
  ],
  talk: [
    // Vorher (verwirrt).
    rede('jimmy-erstkontakt', { all: [VERWIRRT, { notFlag: 'jimmy_status_gefunden' }] }),
    rede('jimmy-tag-verwirrt-traurig', { all: [VERWIRRT, { rival: 'jimmy', min: 2 }] }),
    rede('jimmy-tag-verwirrt-schlaf', { all: [VERWIRRT, { time: 'morgen' }] }),
    rede('jimmy-tag-verwirrt-bahnsteig', { all: [VERWIRRT, { time: 'tag' }] }),
    rede('jimmy-tag-verwirrt-turm', VERWIRRT),
    // Danach.
    rede('jimmy-tag-danke', { all: [GERETTET, { notFlag: 'jimmy_kommentar_danke' }] }),
    rede('jimmy-tag-zeit', { all: [GERETTET, { not: { act: 2 } }] }, 8),
    rede('jimmy-tag-patch', { all: [PATCH, { weekday: ['mo', 'mi', 'fr'] }] }),
    rede('jimmy-tag-vertraut', GERETTET, 6),
    rede('jimmy-tag-werkstatt', { all: [GERETTET, { time: 'morgen' }] }),
    rede('jimmy-tag-club', { all: [GERETTET, { time: 'abend' }] }),
    rede('jimmy-tag-couch', { all: [GERETTET, { time: 'nacht' }] }),
    rede('jimmy-tag-standard'),
  ],
};

export const part: ContentPart = {
  npcs: { jimmy },
  dialogues: sammle(
    erstkontakt, V.turm, V.schlaf, V.bahnsteig, V.traurig,
    T.zeit, T.danke, T.werkstatt, T.club, T.couch, T.patch, T.vertraut, T.standard,
    he2, he4, he6, he8, he10,
  ),
  cutscenes: {
    'szene-he-jimmy-6': {
      id: 'szene-he-jimmy-6', title: 'Gratis',
      beats: [
        { image: 'cut-he-jimmy-6', pan: 'in', fade: 'in', caption: 'Neon-Gasse, Werbestand. „Nie wieder müde!“ Das teuerste Versprechen der Stadt.', hold: 1600 },
      ],
    },
  },
  phone: {
    'tel-jimmy-gutschein': {
      id: 'tel-jimmy-gutschein', from: 'jimmy',
      text: 'Hallo! Hier ist Jimmy. Der echte. Kein Werbeanruf. Wollte nur sagen: Dein Gutschein ist noch gültig. Unbegrenzt. Ende der Durchsage. Das war keine Durchsage. Tschüss!',
      auto: { all: [{ flag: 'jimmy_gutschein' }, { hearts: 'jimmy', min: 3 }] },
    },
  },
};
