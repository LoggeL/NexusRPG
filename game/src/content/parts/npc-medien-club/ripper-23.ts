// Ripper in Akt 2, Akt 3 und im Nachspiel (world.md §4.4, §4.6, §5.3–5.5; design/plan/act23.json).
// Keine Inhaltsdatei: ripper.ts baut daraus Figur und Teil (gemeinsames Menü, keine Kreisimporte).
// - he-ripper-8 (Preistafel, nur nach pers-freya-fairer-lohn) und he-ripper-10 (Auslage) als volle Szenen,
// - Tagesgespräche: Chip-Panik, Quantum-Drohnen, Chrome 10, Nyra weg, Kanal-Nachspiel (Aria an Ripper verkauft),
//   Party-Vorbereitung (Quantum-Schrott für prep-gegenmittel), Partynacht, Reaktion auf jedes Ende, Master-Modus,
// - Tagesablauf: OP-Nische im Pumpwerk, solange main-2-kanal läuft (act23.json, vorangestellt),
// - Begleiter: „Ehrlicher Restposten“ nach he-ripper-10.
import type { AbilityDef, Condition, DialogueDef, ScheduleEntry, TalkDef } from '../../../modules/contracts';
import {
  type Menu, ARIA_ZURUECK, ENDE_3B, ENDE_NEXUS, EPILOG, MASTER, MEER_ENDE, NACH_BRUCH, NYRA_WEG, PARTYNACHT, PARTY_PLAN,
  VEX, all, chk, daily, dlg, erz, ich, mehr, noFlag, node, not, rel, rep, seen, set, sp, talk, weiter, xp,
} from './_util';

const R = sp('ripper');
const F = sp('freya');

const KANAL_AKTIV: Condition = { quest: 'main-2-kanal', state: 'active' };
const KANAL_DONE: Condition = { quest: 'main-2-kanal', state: 'done' };
const UHR_DA: Condition = { quest: 'pers-ripper-taschenuhr', state: 'done' };
const ANGEHEUERT: Condition = { recruited: 'ripper' };

// ------------------------------------------------------------------------------------------- he-ripper-8

const he8 = dlg('he-ripper-8', [
  node('start', [
    erz('Rippers Praxis, mittags. Die Preistafel neben der Tür ist neu. Mit Kreide, in Rippers krakeliger Schrift: „Kinderteile: fairer Preis. Wer feilscht, fliegt.“ Darunter, kleiner und sehr ordentlich: „Kontrolliert. F.“'),
    erz('Vor dem Tresen steht Freya mit ihrem Ordner. Neben ihr ein Junge mit Pflaster auf der Nase, der etwas in beiden Händen hält, als wär’s ein Vogel. Es blinkt. Blau. Im Takt eines Herzschlags, der nicht seiner ist.'),
    F('Der hat das aus der Tonne hinterm Quantum-Depot. Tafelpreis, Ripper. Ich schreib mit.'),
    R('Ich seh, dass du mitschreibst. Du schreibst immer mit. Du schreibst mit, wenn ich niese.', 'wut'),
    erz('Ripper klemmt sich die Lupe ins Auge, beugt sich über das blinkende Ding und wird sehr still.'),
    R('… Na, was haben wir denn da. Ein Quantum-Chip. Beta-Serie. Und der ist noch wach.', 'besorgt'),
    R('Da ist ein Virus drauf. Und das ist das erste Mal in zwanzig Jahren, dass ich das ernst mein.', 'besorgt'),
  ], {
    choices: [
      { text: 'Den Chip übernehmen und ihn schlafen legen, bevor er funkt.', check: chk('he-ripper-8-chip', 'technik', 6, ['cyberware', 'hacken']), next: 'chip' },
      { text: '„Fairer Preis heißt das Doppelte von dem, was du gleich sagen wolltest.“', check: chk('he-ripper-8-preis', 'strasse', 5, ['handel', 'verhandeln']), next: 'preis' },
      { text: '„Zahl ihn aus, Ripper. Nach Tafel. Ich guck zu.“', next: 'tafel' },
      { text: '„Ich kauf ihn dir ab. Zwanzig für den Kleinen, der Chip geht zu Dante.“', requires: { credits: 20 }, tag: '[20 Cr]', next: 'dante', effects: [{ credits: -20 }, { give: 'quantum-chip-schrott' }] },
    ],
  }),
  node('chip', [
    erz('Du nimmst dem Jungen das Ding ab, drehst es ins Licht und findest die Stelle, wo die Antenne in das Gehäuse läuft. Ein Fingernagel, ein Knacks. Das Blinken stockt. Dann geht es aus, wie ein Auge, das sich endlich schließen darf.'),
    R('Sauber. Das war sauber. Ich hätte gezittert. Ich zitter nie. Ich hätte trotzdem gezittert.', 'ueberrascht'),
    R('Vierzig für den Kleinen. Nach Tafel. Und den toten Chip nimmst du mit. Ich will keinen Quantum-Müll im Haus, der wieder aufwacht und „Master“ sagt.', 'signatur'),
  ], { effects: [{ give: 'quantum-chip-schrott' }, rel('ripper', 20)], next: 'ende' }),
  node('preis', [
    ich('Freya, wie viel steht auf der Tafel für „funktionsfähiges Implantat, Fundstück“?'),
    F('Vierzig.'),
    ich('Und für „funktionsfähiges Implantat, Fundstück, gefährlich, Finder hat sich die Finger verbrannt“?'),
    F('… Steht da nicht. Aber ich kann’s dazuschreiben.', 'freude'),
    R('Du kannst das nicht einfach DAZUSCHREIBEN!', 'wut'),
    erz('Freya schreibt es dazu. Achtzig. Mit Ausrufezeichen. Ripper zählt dem Jungen achtzig Credits hin und sieht dabei aus wie ein Mann, der sich selbst eine Niere entfernt.'),
    R('Das ist Raub. Am helllichten Tag. Von einem Kind mit Ordner.', 'trauer'),
  ], { effects: [rel('ripper', 30), rep('unterstadt', 3)], next: 'ende' }),
  node('tafel', [
    erz('Ripper liest die Tafel vor, als wär’s sein eigenes Todesurteil. „Funktionsfähiges Implantat, Fundstück: vierzig.“ Er zählt dem Jungen vierzig Credits hin. Einzeln. Jede Münze bekommt einen kleinen Abschiedsblick.'),
    F('Kontrolliert.', 'freude'),
    R('Ja, ja. Kontrolliert. Hau ab, bevor ich’s mir anders überleg. Und wasch dir die Hände, das Ding war in einer Quantum-Tonne.', 'signatur'),
  ], { effects: [rel('ripper', 40)], next: 'ende' }),
  node('dante', [
    erz('Du legst zwanzig Credits auf den Tresen, Ripper legt mit verzerrtem Gesicht zwanzig dazu, weil die Tafel es so will. Der Junge strahlt. Den Chip wickelst du in ein Tuch. Er blinkt noch eine Weile in deiner Tasche, dann gibt er auf.'),
    R('Bring den Dreck zu deinem Plattenmann. Der baut daraus wahrscheinlich ein Radio. Oder einen Toaster, der „bitte“ sagt.', 'signatur'),
  ], { effects: [rel('ripper', 30)], next: 'ende' }),
  node('ende', [
    erz('Der Junge rennt los. An der Tür dreht er sich noch einmal um und ruft: „Danke, Onkel Ripper!“ Dann ist er weg.'),
    R('„Onkel Ripper.“', 'ueberrascht'),
    R('Guck nicht so. Ich hab’s nicht wegen dir gemacht. Ich hab’s gemacht, weil die Kleine mit dem Ordner jeden Morgen vor meiner Tür stand. Jeden. Morgen.', 'wut'),
    R('Mein Umsatz ist um elf Prozent gesunken. Meine Laune um vierzig. Und ich schlaf besser. Das ist ekelhaft.', 'besorgt'),
  ], {
    choices: [
      { text: '„Steht dir, Onkel Ripper.“', next: 'onkel', effects: [rel('ripper', 20)] },
      { text: '„Elf Prozent? Du hast die Kinder jahrelang um elf Prozent beklaut?“', next: 'elf' },
      { text: '„Freya, gute Arbeit.“', next: 'freya' },
    ],
  }),
  node('onkel', [R('Sag das noch einmal, und ich bau dir ein Implantat ein, das nur noch Schlager spielt.', 'wut'), R('… Onkel. Pff. Ich hab nicht mal Geschwister.', 'freude')], { next: 'schluss' }),
  node('elf', [R('Um elf Prozent unterbezahlt. Das ist ein Unterschied. Ein juristischer. Frag den Richter. Nein, frag ihn nicht, der will dann mitreden.', 'signatur')], { next: 'schluss' }),
  node('freya', [
    F('Ich weiß.', 'freude'),
    erz('Sie klappt den Ordner zu. Auf dem Rücken steht in Glitzerstift: „RIPPER – FALL 1“. Es gibt offenbar einen Fall 2. Ripper sieht es auch und wird blass.'),
  ], { next: 'schluss' }),
  node('schluss', [R('Raus jetzt. Bevor ich noch was Nettes mache. Das ist ansteckend, und ich bin nicht geimpft.', 'freude')], {
    effects: [xp(80), rel('ripper', 40), rep('unterstadt', 5), set('ripper_fairer_preis'), { message: 'Ripper zahlt jetzt nach Tafel. Die Unterstadt spricht darüber.' }],
  }),
]);

// ------------------------------------------------------------------------------------------- he-ripper-10

const he10 = dlg('he-ripper-10', [
  node('start', [
    erz('Über der Praxis hängt ein neues Schild, schief, mit Neonröhren, von denen eine flackert: „RIPPERS EHRLICHER RESTPOSTEN (MEISTENS)“.'),
    R('Das „meistens“ war Freyas Idee. Für die Glaubwürdigkeit. Ich hab „manchmal“ vorgeschlagen. Sie hat mich mit dem Ordner gehauen.', 'freude'),
    erz('Auf der Auslage liegen drei Dinge auf schwarzem Samt: ein Paar Kanal-Kiemen mit Preisschild „wie neu“, ein rot leuchtendes Auge „Nachtsicht PREMIUM II“ und ein Datenkristall mit der Aufschrift „Garantiert virenfrei“.'),
    R('Erste ehrliche Inventur. Du bist meine Prüfung. Eins von den dreien ist gefälscht. Find’s, und ich glaub dir, dass das hier funktioniert.', 'signatur'),
  ], {
    choices: [
      { text: '„Die Kiemen. Die Dichtung ist aus Fahrradschlauch.“', check: chk('he-ripper-10-kiemen', 'technik', 6, ['cyberware', 'faelschung']), next: 'kiemen' },
      { text: '„Der Kristall. Wer ‚garantiert virenfrei‘ draufschreibt, hat ein Virus draufgeschrieben.“', check: chk('he-ripper-10-kristall', 'strasse', 6, ['faelschung', 'handel']), next: 'kristall' },
      { text: '„Das Auge. Schon wieder ein Rücklicht, Ripper?“', next: 'auge' },
      { text: '„Alles echt. Ich vertrau dir.“', next: 'vertrauen' },
    ],
  }),
  node('kiemen', [
    erz('Du ziehst an der Dichtung. Sie dehnt sich, schnalzt zurück und trägt den verblassten Aufdruck „Velo-Blitz 28 Zoll“.'),
    R('Richtig. Und die anderen zwei auch. Alles gefälscht. Alle drei.', 'freude'),
  ], { next: 'aufloesung' }),
  node('kristall', [
    erz('Du steckst den Kristall in den Leseschlitz an der Kasse. Auf dem Display erscheint ein tanzender Totenkopf mit Sonnenbrille und der Text „HALLO RIPPER :)“.'),
    R('Richtig. Und die anderen zwei auch. Alles gefälscht. Alle drei.', 'freude'),
  ], { next: 'aufloesung' }),
  node('auge', [
    erz('Du hältst das Auge gegen das Licht. Glasmurmel. Batterie. „Volt-Eck – 3 für 2“. Sie haben die Aktion verbessert.'),
    R('Richtig. Und die anderen zwei auch. Alles gefälscht. Alle drei.', 'freude'),
  ], { next: 'aufloesung' }),
  node('vertrauen', [
    R('FALSCH. Alles gefälscht. Alle drei.', 'wut'),
    R('Ich wollte sehen, ob du mir jetzt blind vertraust. Tu das nie. Nie! Auch nicht, wenn ein Schild „ehrlich“ sagt. GERADE dann nicht.', 'besorgt'),
  ], { effects: [rel('ripper', 10)], next: 'aufloesung' }),
  node('aufloesung', [
    R('Das ist der Restposten von früher. Den verkauf ich nicht mehr. Den heb ich auf. Damit ich nicht vergesse, was ich war.', 'trauer'),
    R('Ehrlich heißt nicht, dass ich nett bin, Schätzchen. Ehrlich heißt, ich sag dir, wenn ich dich übers Ohr hau. Vorher.', 'signatur'),
  ], { choices: weiter([[UHR_DA, 'uhr'], [null, 'ohne-uhr']]) }),
  node('uhr', [
    erz('Aus seiner Westentasche hängt eine Kette. Messing, Springdeckel, ein kleiner Kratzer, wo ein Sechsjähriger mal reingebissen hat. Sie tickt. Du hörst es bis hierher.'),
    R('Sie geht vier Minuten vor. Wie mein Vater. Der war auch immer zu früh.', 'trauer'),
  ], { next: 'lupe' }),
  node('ohne-uhr', [
    R('Die Uhr meines Vaters hängt immer noch da oben in der roten Seide. Ich hab gestern auf dem Boulevard gestanden und durchs Fenster geguckt. Sie tickt noch. Glaub ich.', 'besorgt'),
  ], { next: 'lupe' }),
  node('lupe', [
    R('Hier. Nimm. Bevor ich’s mir anders überleg.', 'signatur'),
    erz('Er drückt dir seine Juwelierlupe in die Hand. Die, mit der er seit zwanzig Jahren jedes Teil prüft. Das Messing ist warm von seiner Weste.'),
    R('Damit siehst du die Viren. Und die Fälschungen. Und manchmal, wenn das Licht stimmt, die Leute, die sie verkaufen.', 'besorgt'),
  ], {
    choices: [
      { text: '„Du brauchst die doch selbst.“', next: 'brauchst' },
      { text: '„Danke, Ripper.“', next: 'danke' },
      { text: 'Die Lupe ins Auge klemmen und ihn ansehen.', next: 'ansehen' },
    ],
  }),
  node('brauchst', [R('Ich hab drei. Das ist meine beste. Deshalb kriegst du sie. Wenn du fragst, warum, kostet die Antwort extra.', 'signatur')], { next: 'ende' }),
  node('danke', [R('Nicht weinen. Wenn du weinst, beschlägt sie. Dann siehst du die Viren nicht.', 'trauer')], { next: 'ende' }),
  node('ansehen', [
    erz('Durch die Lupe ist Ripper riesig: jede Pore, jede Narbe, ein Lötspritzer am Kinn, die Augen eines Neunjährigen, der zwei Dosen Bohnen gegen eine Uhr getauscht hat.'),
    R('Und? Was siehst du?', 'besorgt'),
    ich('Ehrliche Ware. Meistens.'),
    R('… Raus. RAUS. Bevor ich dir Rabatt gebe.', 'freude'),
  ], { effects: [rel('ripper', 20)], next: 'ende' }),
  node('ende', [erz('Das Schild über der Tür flackert. „EHRLICHER RESTPOSTEN (MEISTENS)“. Diesmal flackert das „MEISTENS“.')], {
    effects: [{ give: 'rippers-lupe' }, xp(120), rel('ripper', 50), set('ripper_ehrlich'), rep('unterstadt', 5)],
  }),
]);

// ------------------------------------------------------------------------------------------- Tagesgespräche Akt 2/3

function gespraeche(M: Menu): DialogueDef[] {
  // OP-Nische im Pumpwerk, solange main-2-kanal läuft. Den Kampf führt die Hauptquest.
  const opNische = dlg('ripper-tag-op-nische', [
    node('start', [
      erz('Eine OP-Nische zwischen zwei Pumpenrädern, Stirnlampe, ein Klapptisch mit Werkzeug, das aussieht, als hätte es schon Schlimmeres gesehen. Ripper zählt Scheine. Er hört nicht auf, als er dich sieht.'),
      R('Was haben wir denn da? Kundschaft. Im Pumpwerk. Um diese Uhrzeit. Das ist entweder sehr gut fürs Geschäft oder sehr schlecht für mich.', 'besorgt'),
      R('Ich hab nur eingekauft. Gekauft ist gekauft. Sprich mit dem Großen mit den Krallen, der hat den Preis gemacht.', 'signatur'),
    ], {
      choices: [
        { text: '„Du weißt, wen du da gekauft hast.“', next: 'weisst' },
        { text: '„Der Arm gehört nicht dir.“', when: VEX, next: 'vex' },
        { text: 'Gehen.' },
      ],
    }),
    node('weisst', [R('Ich weiß, was ich gekauft hab. Wen, das ist nicht mein Fachgebiet.', 'besorgt'), erz('Er sagt das ein bisschen zu schnell. Und er sieht dabei nicht zur Trage hinter dem Vorhang.')]),
    node('vex', [R('Raten, Schätzchen. Alles Raten. Ihrer ist nie abbezahlt worden. Deiner auch nicht. Ich hab ein Herz für Ratenkunden, deshalb seid ihr beide noch dran.', 'signatur')]),
  ]);

  // Nach main-2-kanal, einmal: Ripper hat Aria (bzw. einen Probanden) gekauft.
  const kanalDanach = dlg('ripper-tag-kanal-danach', [
    node('start', [
      erz('Ripper sieht dich kommen und hebt beide Hände, bevor du den Mund aufmachst. In der einen hält er eine Rechnung. In der anderen einen Eisbeutel, den er sich gleich danach wieder an die Schläfe drückt.'),
      R('Bevor du was sagst: Ich hab sechshundert Credits verloren, eine OP-Lampe, zwei Zähne von meinen Jungs und meinen Glauben an Xion. Ich bin quitt mit dem Universum.', 'wut'),
    ], { choices: weiter([[{ flag: 'aria_gechippt' }, 'aria'], [null, 'proband']]) }),
    node('aria', [
      R('Und ja. Ich hab sie gekauft. Die Brecherin. Bewusstlos, Chip im Nacken, auf einer Trage, die nach Desinfektionsmittel und Xions Rasierwasser gestunken hat.', 'besorgt'),
      R('Für den Zerberster. Nur für den Zerberster! Der Rest von ihr war nie auf der Rechnung.'),
    ], { next: 'frage' }),
    node('proband', [
      R('Und ja. Xion hat mir einen gechippten Probanden auf einer Trage angedreht. Sechshundert. Wegen der Teile. Ich hab nicht gefragt, wie er heißt. Das frag ich nie.', 'besorgt'),
      R('Diesmal hätte ich gefragt. Glaub ich.'),
    ], { next: 'frage' }),
    node('frage', [erz('Er wartet. Ripper wartet sonst nie. Ripper redet sonst so lange, bis der andere aufgibt.')], {
      choices: [
        { text: 'Ihn am Kragen an die Wand drücken. „Noch mal so ein Deal, und du bist das Ersatzteil.“', check: chk('ripper-kanal-wand', 'koerper', 7, ['einschuechtern', 'kraft']), next: 'wand' },
        { text: '„Sag mir, dass es dir egal war. Sag’s mir ins Gesicht.“', check: chk('ripper-kanal-gewissen', 'ausstrahlung', 6, ['ueberreden', 'gewissen']), next: 'gewissen' },
        { text: '„Zwölf Taschenuhren, Ripper. Zwölf Jahre im Kanal. Und dann kaufst du Leute.“', tag: '[Gosse]', when: { origin: 'origin-gossenkind' }, next: 'gosse' },
        { text: '„Vergiss es. Einmal. Nur dieses eine Mal.“', next: 'vergessen' },
        { text: '„Du bist für mich gestorben.“', next: 'gestorben' },
      ],
    }),
    node('wand', [
      erz('Die Rechnung flattert zu Boden. Der Eisbeutel auch. Ripper hängt mit den Zehenspitzen über dem Boden und atmet sehr flach.'),
      R('Verstanden. Verstanden! Kein Deal mehr mit Krallen. Kein Deal mit Tragen. Ich schreib’s mir auf. Ich lass es mir tätowieren!', 'besorgt'),
      erz('Als du loslässt, zählt er dir hundertfünfzig Credits hin, ohne dass du was gesagt hast. „Schmerzensgeld. Für dich. Für sie. Für mich. Egal. Nimm.“'),
    ], { effects: [{ credits: 150 }, rel('ripper', -10), set('ripper_kanal_geklaert'), set('ripper_kanal_eingeschuechtert')] }),
    node('gewissen', [
      R('Egal? Mir?', 'wut'),
      erz('Er setzt an. Einmal. Zweimal. Dann setzt er sich hin, auf den Behandlungsstuhl, als wär er selbst der Patient.'),
      R('Ich hab ihr meinen Mantel übergelegt. Da unten war’s kalt, und Xion hat gelacht, und sie hat im Schlaf „nicht anhalten“ gemurmelt. Ich hab den Mantel nicht zurückgekriegt. Ich will ihn auch nicht zurück.', 'trauer'),
      R('Hier. Für den Arm. Zerberster-Öl, Oberstadt-Qualität. Gratis. Wenn du das irgendwem erzählst, sag ich, du lügst.', 'signatur'),
    ], { effects: [{ give: 'zerberster-oel' }, rel('ripper', 30), set('ripper_kanal_geklaert'), set('ripper_kanal_reue')] }),
    node('gosse', [
      erz('Du klopfst. Zweimal, Pause, einmal. Ripper zuckt zusammen, als hättest du ihm ins Gesicht geschlagen.'),
      R('Mach das nicht. Nicht jetzt. Nicht mit dem Zeichen.', 'trauer'),
      R('… Ich weiß. Ich weiß es doch. Jola hätte mir dafür die Nase gebrochen. Und sie hätte recht gehabt.', 'besorgt'),
    ], { effects: [rel('ripper', 40), set('ripper_kanal_geklaert'), set('ripper_kanal_reue')] }),
    node('vergessen', [R('Einmal. Gut. Ich hab ein sehr gutes Gedächtnis für Schulden. Das hier ist eine. Ich zahl sie ab. Irgendwann. Mit Zinsen, die ich mir selbst berechne.', 'besorgt')], {
      effects: [rel('ripper', 10), set('ripper_kanal_geklaert')],
    }),
    node('gestorben', [R('Gestorben. Pff. Tote zahlen keine Raten. Du schon. Wir sehen uns, Kundschaft.', 'wut'), erz('Er sagt es laut. Aber er sieht dir nicht nach, als du gehst. Er sieht auf seine Hände.')], {
      effects: [rel('ripper', -60), set('ripper_kanal_geklaert')],
    }),
  ]);

  const nyra = daily('ripper-tag-nyra',
    [
      R('Die kleine Leise. Silent Irgendwas. Die mit den Kopfhörern. Sitzt im Turm, sagen sie.', 'besorgt'),
      R('Die hat mir mal das Kassenbuch gehackt. Hat nichts geklaut. Hat nur alle Zahlen richtig hingeschrieben. Das war das Grausamste, was mir je passiert ist.'),
    ],
    [R('Wenn ihr sie da rausholt, und sie braucht was Neues im Kopf, weil die da oben was Altes reingesteckt haben: Ich mach’s. Zum Selbstkostenpreis. Ich weiß nicht mal, was mein Selbstkostenpreis ist. Ich hatte noch nie einen.', 'signatur')],
    M, { effects: [set('ripper_nyra_gesagt')] });

  const chips = daily('ripper-tag-akt2-chips',
    [
      R('Geschäft läuft wie verrückt, Schätzchen. Alle wollen ihren Quantum-Chip wieder raus. Chip raus: fünfzig. Chip rein macht Quantum gratis.', 'signatur'),
      R('Ich hasse gratis. Gratis ist das teuerste Wort der Stadt.'),
    ],
    [
      R('Gestern war einer da, der hat beim Rausoperieren „Danke, Master“ zu mir gesagt. Zu MIR. Ich war kurz geschmeichelt. Dann hab ich mich geschämt. Dann hab ich ihm zehn Credits extra berechnet.', 'besorgt'),
      R('Was haben wir denn da? Eine Stadt, die sich freiwillig was in den Kopf steckt, weil’s ein Logo hat. Und ich bin der Böse, weil ich Preise verlange.'),
    ],
    M);
  const drohnen = daily('ripper-tag-akt2-drohnen',
    [
      R('Hörst du das Summen? Quantum-Drohnen. Drei Stück, jeden Tag um zwölf, über meinem Dach. Scannen meine Ware.', 'wut'),
      R('Ich hab eine runtergeholt. Mit einem Besen. Jetzt hab ich eine Quantum-Drohne im Hinterzimmer, die mich „Bürger“ nennt.'),
    ],
    [
      R('Wenn eine fragt: Ich hab hier nur Ersatzteile für Toaster. Die Toaster sind nur sehr … menschenförmig.', 'signatur'),
      R('Und sag deinen Freunden, sie sollen nicht in die Linse gucken. Die Dinger merken sich Gesichter. Ich verkauf Gesichter. Ich weiß, was die wert sind.', 'besorgt'),
    ],
    M);
  const chrome = daily('ripper-tag-akt2-chrome',
    [
      R('„Chrome 10“. Überall. Zehn Prozent auf alles, auf Brot, auf Strom, auf Särge. Weißt du, wer keine zehn Prozent gibt? Ich.', 'wut'),
      R('Und trotzdem kommen sie. Weil ich der Einzige bin, bei dem sie wissen, wo der Haken ist. Er ist im Preis. Ehrlich, oder?'),
    ],
    [R('Die Gutscheine tauschen sie bei mir gegen echtes Geld. Zwanzig Prozent Abschlag. Ich bin die Bank der Unterstadt, Schätzchen. Die Bank mit dem grünen Kreuz.', 'signatur')],
    M);

  const partyPlan = daily('ripper-tag-party',
    [
      R('Releaseparty. Im Himmelsgarten. Ihr. Ich hab’s gehört. Die halbe Unterstadt hat’s gehört, ihr flüstert wie Presslufthämmer.', 'besorgt'),
      R('Wenn ihr Teile braucht: Ich hab Teile. Wenn ihr Mut braucht: Den verkauf ich nicht, den hab ich selbst nicht.'),
    ],
    [
      R('Euer Plattenmann baut Chip-Blocker, sagt man. Aus Quantum-Schrott. Rat mal, wer drei Kisten Quantum-Schrott im Lager hat. Aus ehrlicher Quelle. Aus einer Tonne.', 'signatur'),
      R('Gästeliste? Frag den Frisierten vom Fernsehen. Ausweise? Die Kleine mit der Pixel-Brille. Und sterbt nicht da oben. Tote zahlen keine Raten.', 'besorgt'),
    ],
    mehr(M, [{
      text: 'Quantum-Schrott kaufen.', tag: '[60 Cr]', id: 'r-chipschrott', next: 'schrott-kauf',
      when: noFlag('heute_ripper_chipschrott'), requires: { credits: 60 },
      effects: [{ credits: -60 }, { give: 'quantum-chip-schrott' }, set('heute_ripper_chipschrott')],
    }], [
      node('schrott-kauf', [
        erz('Ripper holt eine Kiste hinter dem Vorhang hervor. Darin klappern tote Quantum-Chips wie Zähne in einem Glas.'),
        R('Einer pro Tag. Mehr geb ich nicht raus, sonst merkt Quantum, dass ich ihre Tonnen leere. Und sag dem Plattenmann: Wenn das Ding explodiert, war’s seine Lötstelle, nicht meine Ware.', 'signatur'),
      ], { choices: [{ text: 'Noch was, Ripper.', next: 'menue' }, { text: 'Bis dann.' }] }),
    ]));

  const partynacht = daily('ripper-tag-partynacht',
    [
      R('Heute Nacht, hm? Ihr da oben, Champagner, Blade, Gedankenkontrolle. Und ich hier unten mit meiner Kasse.', 'besorgt'),
      R('Ich hab eine Wette laufen. Auf euch. Ich wette nie auf Leute. Leute verlieren. Also enttäuscht mich nicht, sonst verlier ich auch.'),
    ],
    [R('Wenn ihr nicht wiederkommt, wer zahlt dann die ganzen Raten? Eben. Also kommt wieder. Rein geschäftlich.', 'signatur')],
    M);

  // Nachspiel: erste Reaktion auf das Ende (einmal), danach Alltag.
  const endeErst = dlg('ripper-tag-ende', [
    node('start', [R('Na, wen haben wir denn da. Die Weltretter. Oder Weltumbauer. Oder was immer ihr da oben angestellt habt.', 'signatur')], {
      choices: weiter([[ENDE_NEXUS, 'nexus'], [ENDE_3B, 'dreib'], [null, 'meer']]),
    }),
    node('meer', [
      R('Der Turm ist dunkel, die Chips liegen in den Mülltonnen, und rat mal, wer die Mülltonnen leert. Ich hab seit Montag vierhundert Quantum-Chips gekauft. Für zwei Credits das Stück.', 'freude'),
      R('Die Stadt ist frei, und ich bin reich. Das nenn ich ein Happy End.', 'signatur'),
      R('… Und die Kinder haben jetzt ein Fundbüro. Ich war erster Kunde. Ich hab nix verloren. Ich wollt nur gucken. Sie haben mir eine Quittung gegeben. Mit Stempel.', 'besorgt'),
    ], { next: 'schluss' }),
    node('nexus', [
      R('Dantes Werkstatt ist jetzt „offizielle Implantat-Klinik der Unterstadt“. OFFIZIELL. Mit Schild. Und einer KI, die „bitte“ sagt.', 'wut'),
      R('Ich bin seit zwanzig Jahren inoffiziell. Mir hat nie einer ein Schild gegeben. Ich hab mir meins selbst gemacht. Es flackert.'),
      R('Die neue Nexus hat mich gestern angerufen. Höflich. Ob ich „Interesse an einer Kooperation“ hätte. Ich hab aufgelegt. Dann hab ich zurückgerufen. Man muss flexibel sein.', 'signatur'),
    ], { next: 'schluss' }),
    node('dreib', [
      R('Du. Du bist wieder da. Ohne Turm, ohne Anzug, ohne Leute, die „Master“ zu dir sagen. Wie fühlt sich das an?', 'besorgt'),
      R('Für mich fühlt es sich an wie ein Kunde, der seine Raten wieder bezahlt. Schön. Ungewohnt. Leicht verdächtig.', 'signatur'),
    ], { next: 'schluss' }),
    node('schluss', [], {
      choices: [
        { text: '„Und du, Ripper? Was machst du jetzt?“', next: 'jetzt' },
        { text: '„Der Arm ist übrigens noch dran.“', when: VEX, next: 'arm' },
        { text: 'Bis dann.' },
      ],
      effects: [set('ripper_ende_kommentar'), xp(30)],
    }),
    node('jetzt', [
      R('Was ich jetzt mache? Dasselbe wie vorher. Nur mit Schild. Und mit Tafel. Und mit einem Kind mit Ordner, das mir jeden Morgen den Puls fühlt.', 'freude'),
      R('Vielleicht fahr ich auch mal ans Meer. Gucken, ob man Salzwasser verkaufen kann.'),
    ]),
    node('arm', [R('Natürlich ist er noch dran. Er ist nicht abbezahlt. Ich hab gesagt, ich hol ihn mir. Ich hol ihn mir. Nächstes Jahr. Oder übernächstes. Ich hab ja Zeit.', 'signatur')]),
  ]);

  const epilog = daily('ripper-tag-epilog',
    [R('Was haben wir denn da? Stammkundschaft. Die beste Sorte. Die kommt wieder, auch wenn ich unfreundlich bin.', 'freude')],
    [
      R('Seit dem großen Knall verkauf ich mehr Zahnräder als Chips. Die Leute bauen wieder Sachen. Mit den Händen. Es ist widerlich gesund.', 'signatur'),
      R('Und Freya hat mich zum „Händler des Monats“ gewählt. Es gibt nur einen Händler auf ihrer Liste. Ich. Ich hab mich trotzdem gefreut.', 'freude'),
    ],
    M);

  // Master-Modus: Ripper ist der Einzige, der noch Geschäfte macht. Aus Angst und aus Prinzip.
  const master = dlg('ripper-tag-master', [
    node('start', [
      R('M-Master. Was für eine Ehre. Was für ein Besuch. Was für ein … Sie haben Leute dabei. Gechippte Leute. Die gucken so.', 'besorgt'),
      R('Für Sie: alles. Zum doppelten Preis. Spaß! Zum halben. Bitte nicht chippen. Ich hab einen sehr empfindlichen Nacken.'),
      erz('Er lacht. Es klingt wie eine Schublade, die klemmt. Unter dem Tresen liegt eine Kiste mit der Aufschrift „Quantum-Chips – NICHT ANFASSEN“. Sie ist zugenagelt. Von innen, scheint es.'),
    ], {
      choices: [
        { text: 'Zeig mir, was du hast.', next: 'laden' },
        { text: '„Du hast Angst vor mir.“', next: 'angst' },
        { text: '„Komm mit. Sechzig am Tag.“', tag: '[60 Cr]', when: not(ANGEHEUERT), requires: { credits: 60 }, next: 'mit', effects: [{ credits: -60 }, { recruit: 'ripper' }, set('ripper_soeldner')] },
        { text: 'Feierabend, Ripper.', when: ANGEHEUERT, next: 'weg', effects: [{ dismiss: 'ripper' }] },
        { text: 'Gehen.' },
      ],
    }),
    node('laden', [R('Alles, was Sie wollen. Kein Virus drauf. Ich schwör’s. Ich hab’s dreimal geprüft. Weil Sie es sind.', 'besorgt')], { effects: [{ shop: 'ripper-praxis' }] }),
    node('angst', [
      R('Angst? Ich? Ich hab Respekt. Respekt ist Angst mit Krawatte.', 'besorgt'),
      R('… Ja. Ich hab Angst. Nicht vor dem Chip. Vor dem, was du draus gemacht hast. Ich hab auch mal Leute gekauft. Ich weiß, wie das Gesicht aussieht. Du hast es jetzt.', 'trauer'),
      R('Wenn du’s dir je anders überlegst: Die Rostlaube steht noch bei der Hafenkante. Ich hab sie nicht verkauft. Hat mir keiner abgekauft. Das ist der einzige Grund.', 'signatur'),
    ], { effects: [set('ripper_master_angst')] }),
    node('mit', [R('Doppelter Freundschaftspreis. Für den Master. Ich schieß auf alles, was Sie sagen. Außer auf Kinder. Und auf die Crew. Und auf den Barkeeper, der guckt so.', 'besorgt')]),
    node('weg', [R('Danke. Danke, Master. Ich mein: Feierabend. Schön. Ich geh dann mal sehr schnell nach Hause.', 'besorgt')]),
  ]);

  return [opNische, kanalDanach, nyra, chips, drohnen, chrome, partyPlan, partynacht, endeErst, epilog, master];
}

// ------------------------------------------------------------------------------------------- Bausteine für ripper.ts

/** Tagesgespräche Akt 2/3/Nachspiel, die vor die Akt-1-Einträge gehören (Master-Modus steht ganz oben, siehe ripper.ts). */
export const RIPPER_TALK_MASTER: TalkDef = talk('ripper-tag-master', MASTER);
export const RIPPER_TALK_23: TalkDef[] = [
  talk('ripper-tag-op-nische', { quest: 'main-2-kanal', state: 'active' }),
  talk('ripper-tag-kanal-danach', all(KANAL_DONE, noFlag('ripper_kanal_geklaert'))),
  talk('ripper-tag-ende', all(EPILOG, MEER_ENDE, noFlag('ripper_ende_kommentar'))),
  talk('ripper-tag-epilog', EPILOG),
  talk('ripper-tag-partynacht', PARTYNACHT),
  talk('ripper-tag-party', all(PARTY_PLAN, { time: ['tag', 'abend'] })),
  talk('ripper-tag-nyra', all(NYRA_WEG, ARIA_ZURUECK, noFlag('ripper_nyra_gesagt'))),
  talk('ripper-tag-akt2-chips', all(NACH_BRUCH, { time: ['tag', 'abend'] }, { weekday: ['mo', 'do', 'so'] })),
  talk('ripper-tag-akt2-drohnen', all(NACH_BRUCH, { time: ['tag', 'abend'] }, { weekday: ['di', 'fr'] })),
  talk('ripper-tag-akt2-chrome', all(NACH_BRUCH, { time: ['tag', 'abend'] })),
];

/** Tagesablauf: vor die Akt-1-Einträge (act23.json, scheduleMode vorangestellt). */
export const RIPPER_SCHEDULE_23: ScheduleEntry[] = [
  { when: KANAL_AKTIV, place: { map: 'pumpwerk-sieben', at: 'op-nische' }, pose: 'zaehlen' },
];

/** Neue Begleiter-Fähigkeit nach he-ripper-10. */
export const RIPPER_ABILITIES: AbilityDef[] = [
  {
    id: 'ripper-ehrlicher-restposten', name: 'Ehrlicher Restposten',
    description: '„Geprüft. Meistens.“ Ripper wirft einem Verbündeten ein Ersatzteil zu, das tatsächlich passt (+12 LP, Geschützt).',
    kind: 'support', ap: 1, target: 'ally', range: 4, heal: 12, status: { id: 'geschuetzt', turns: 1 }, cooldown: 3,
  },
];
export const RIPPER_ABILITY_RULES = [{ when: seen('he-ripper-10'), add: 'ripper-ehrlicher-restposten' }];

/** Herz-Ereignisse 8/10 als Dialoge, Rest der Akt-2/3-Gespräche. */
export function ripper23(M: Menu): DialogueDef[] {
  return [he8, he10, ...gespraeche(M)];
}
