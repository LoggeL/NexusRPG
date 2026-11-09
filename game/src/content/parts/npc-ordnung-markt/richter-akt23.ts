// Der Richter in Akt 2, Akt 3 und im Nachspiel (world.md §4.4, §5.3–5.5, act23.json events he-richter-8/10, boards).
// Kein eigener Inhaltsteil: richter.ts holt Menü-Ergänzung, Phasen-Gespräche, Herz-Ereignisse 8/10, Tafel
// „Streitschlichtung“ (Auftragstafel nach he-richter-10) und Tagesablauf-Ergänzungen von hier.
import type { ContentPart } from '../../part';
import type { DialogueDef, JobTemplateDef, ScheduleEntry, TalkDef } from '../../../modules/contracts';
import type { JobBoardDef } from '../../../modules/jobs';
import {
  type Menue, AKT2_NUR, AKT3_NACHT, ARIA_GECHIPPT, COUNTDOWN_DONE, ENDE_3B, ENDE_MEER, ENDE_NEXUS, EPILOG_FREI, MASTER,
  NYRA_WEG, PARTY_VORB, dialog, erz, flag, herz, ich, knoten, phasen, pruefung, sprecher,
} from './_helfer';

const R = sprecher('richter');
const DA = sprecher('dante');
const B = sprecher('babette-bao');
const OV = sprecher('oma-volt');
const D = sprecher('dexter');
const KK = sprecher('captain-kuschel');

const SCHLICHTER = { flag: 'richter_schlichter' } as const;
const JOB = 'job-streitschlichtung';

// ---------------------------------------------------------------------------------------------- Menü (ab Akt 2)

export const MENUE_23: Menue = {
  choices: [
    {
      text: 'Was sagt das Gesetz eigentlich zu Gedankenchips?', next: 'r23-chips',
      when: { all: [{ act: 2 }, { notFlag: 'richter_23_chips' }] }, effects: [flag('richter_23_chips'), herz('richter', 10)],
    },
    { text: 'Gibt es Streit zu schlichten, Euer Ehren?', when: SCHLICHTER, next: 'r23-tafel' },
  ],
  nodes: [
    knoten('r23-chips', [
      R('Paragraf eins: Der Bürger denkt selbst. Paragraf zwei: Der Bürger denkt selbst, auch wenn es wehtut.', 'neutral'),
      R('Paragraf drei hat Quantum letzte Woche gesponsert. Seitdem steht da „vorbehaltlich anderslautender Firmware“.', 'wut'),
      R('Ich habe ihn mit Tipp-Ex überstrichen. In meiner Ausgabe. Das ist Urkundenfälschung. Ich zeige mich selbst an. Später.'),
    ], { choices: [{ text: 'Noch eine Frage, Euer Ehren.', next: 'menue' }, { text: 'Ich empfehle mich.' }] }),
    knoten('r23-tafel', [
      R('Immer. Die Unterstadt streitet wie andere Leute atmen. Am Aushang im Gerichtssaal hängen die Fälle. Nehmen Sie einen. Urteilen Sie gerecht. Und kurz.', 'neutral'),
    ], { choices: [{ text: 'Die Fälle ansehen.', effects: [{ jobBoard: 'streitschlichtung' }] }, { text: 'Später.', next: 'menue' }] }),
  ],
};

// ---------------------------------------------------------------------------------------------- Herz-Ereignis 8

/** ♥8: Keks-Wettbewerb in Dantes Werkstatt, der Richter als Juror, die Spielfigur als Beisitz (So tags, act2). */
const he8 = dialog('he-richter-8', [
  knoten('start', [
    erz('Sonntag, Dantes Werkstatt. Zwischen Lötstationen und Plattenkisten stehen sieben Teller auf einer Tür, die auf zwei Fässern liegt. Ein Pappschild: „1. UNTERSTÄDTISCHER KEKSPROZESS“.'),
    erz('Auf einem umgedrehten Eimer thront der Richter, Robe frisch gebügelt, Serviette im Kragen, Hammer in der Hand. Hinter den Tellern: sieben nervöse Bäcker. Und eine Quantum-Drohne mit Schürze.'),
    R('{name}. Gut. Sie sind Beisitz. Beisitz heißt: Sie sitzen bei. Und Sie probieren mit. Ich vertraue meinem Gaumen, aber ein Gericht braucht zwei Zungen.', 'neutral'),
    DA('Euer Ehren, Nummer drei ist … anonym! Völlig anonym! Mit Schokostückchen! Und ganz sicher nicht von mir!'),
    erz('Die Drohne surrt vor. „TELLER SIEBEN: CHROME-10-KNUSPERTRAUM. HEUTE GRATIS. MIT ÜBERRASCHUNG IM KERN.“'),
  ], {
    choices: [
      {
        text: 'Den Chrome-10-Keks aufbrechen. „Überraschung im Kern“ klingt nach Elektronik.', next: 'chip',
        check: pruefung('he-richter-8-chip', 'technik', 5, ['untersuchen']), effects: [herz('richter', 30), flag('richter_keks_chip')],
      },
      {
        text: 'Dexters Teller beäugen. Die Kekse sehen verdächtig gleich aus.', next: 'dexter',
        check: pruefung('he-richter-8-dexter', 'strasse', 5, ['spuren']), effects: [herz('richter', 20)],
      },
      { text: 'Babette heimlich zuzwinkern. Sie hat Nummer fünf.', next: 'tipp', effects: [herz('richter', -10), herz('babette-bao', 10)] },
      { text: '„Euer Ehren, wir urteilen mit dem Bauch. Fangen wir an.“', next: 'bauch', effects: [herz('richter', 20)] },
    ],
  }),
  knoten('chip', [
    erz('Du brichst den glänzenden Keks auseinander. Zwischen Zuckerguss und Teig sitzt ein Chip, so groß wie ein Fingernagel. Er blinkt freundlich. Er sagt leise: „Möchten Sie ein kostenloses Upgrade?“'),
    R('Ein Keks. Mit Anliegen.', 'wut'),
    R('Teller sieben ist disqualifiziert. Wegen versuchter Bestechung des Verdauungstrakts. Die Drohne verlässt den Saal. Die Werkstatt. Mein Blickfeld.'),
    erz('Dante wirft ein Geschirrtuch über die Drohne. Captain Kuschel setzt sich obendrauf. Die Drohne gibt auf.'),
    KK('…'),
    DA('Gut gemacht, Captain. Du bist ab heute Gerichtsdiener. Mit Löffel.'),
  ], { next: 'probe' }),
  knoten('dexter', [
    erz('Teller sechs. Die Kekse sind perfekt rund, perfekt gleich und tragen auf der Unterseite den Prägestempel „KNUSPI-WERK – 48 STÜCK“.'),
    ich('Dexter. Die sind aus der Packung.'),
    D('Sind sie nicht! Die sind … vorgebacken. Von Fremden. Mit Liebe. Ich hab sie mit Liebe ausgepackt!', 'besorgt'),
    R('Dexter. Sie stehen zum zweiten Mal in diesem Jahr vor mir. Zum ersten Mal wegen Keksen.', 'neutral'),
    R('Ich verwarne Sie. Und ich esse trotzdem einen. Packungskekse sind ehrlich. Sie lügen nur auf dem Etikett.'),
  ], { next: 'probe' }),
  knoten('tipp', [
    R('Ich habe das Zwinkern gesehen. Ich sehe alles. Ich bin seit vierzig Jahren Richter und Großvater von niemandem.', 'wut'),
    R('Beeinflussung des Jurors. Durch Mimik. Notiert. Babettes Teller verliert einen Punkt. Babette, das tut mir leid.'),
    B('Mir nicht, Euer Ehren. Ich hab dreißig Jahre Garküche. Ich gewinne auch mit einem Punkt weniger.', 'signatur'),
  ], { next: 'probe' }),
  knoten('bauch', [R('Der Bauch. Das ehrlichste Organ der Justiz. Er lässt sich nicht bestechen, nur füttern.', 'ueberrascht')], { next: 'probe' }),
  knoten('probe', [
    erz('Ihr probiert euch durch. Oma Volts Blitzbrause-Kekse knistern auf der Zunge. Babettes Kräutergebäck schmeckt nach Sonntag und Hafen. Nummer drei ist zu dunkel, zu groß, zu viel Schokolade und mit Abstand das Beste.'),
    OV('Kindchen, wenn du meine nicht nimmst, näh ich dir die Taschen zu. Nur zu.'),
    R('Beisitz. Ihr Urteil zuerst. Ich höre. Dann entscheide ich, ob ich Ihnen zustimme.', 'neutral'),
  ], {
    choices: [
      { text: '„Nummer drei. Ehrlich, schief und viel zu viel. Wie Dante.“', next: 'sieg-dante', effects: [herz('dante', 40), herz('richter', 20)] },
      { text: '„Nummer fünf. Babettes Kräutergebäck. Das schmeckt nach Zuhause.“', next: 'sieg-babette', effects: [herz('babette-bao', 40), herz('richter', 20)] },
      { text: '„Nummer eins. Oma Volt. Es knistert, und ich hab Angst vor ihr.“', next: 'sieg-volt', effects: [herz('oma-volt', 40), herz('richter', 15)] },
      {
        text: '„Euer Ehren, ich beantrage: alle schuldig. Der vorsätzlichen Köstlichkeit.“', next: 'sieg-alle',
        check: pruefung('he-richter-8-alle', 'ausstrahlung', 6, ['ueberzeugen']), effects: [herz('richter', 40), herz('dante', 15), herz('babette-bao', 15)],
      },
    ],
  }),
  knoten('sieg-dante', [
    R('Nummer drei. Schuldig. Schuldig der vorsätzlichen Köstlichkeit. Mildernde Umstände: keine. Der Täter ist offensichtlich.', 'neutral'),
    DA('JAAAAA! Captain, wir sind SCHULDIG! Zum ersten Mal freu ich mich drüber! Euer Ehren, ich … darf ich Sie umarmen?'),
    R('Nein. Zwei Meter Abstand. Das ist eine Auflage.', 'ueberrascht'),
    erz('Dante umarmt ihn trotzdem. Der Richter lässt es geschehen, steif wie ein Aktenschrank, und klopft ihm zweimal auf den Rücken.'),
  ], { next: 'ende' }),
  knoten('sieg-babette', [
    R('Nummer fünf. Babette Bao. Das Gericht schließt sich an. Das Gericht hat zwei davon in der Robe. Als Beweismittel.', 'neutral'),
    B('Ein Urteil, das nach Kräutern riecht. So soll das sein. Dante, Schätzchen, nicht weinen, du kriegst die Hälfte vom Preis. Der Preis ist ein Topf.', 'freude'),
  ], { next: 'ende' }),
  knoten('sieg-volt', [
    R('Nummer eins. Ich hatte ebenfalls Angst. Angst ist kein schlechter Ratgeber in Geschmacksfragen.', 'neutral'),
    OV('Siehste. Respekt vor dem Alter, Kindchen. Und vor der Brause.'),
    DA('… Nummer drei war von mir. Nur damit das im Protokoll steht. Für die Nachwelt. Für Captain Kuschel.'),
  ], { next: 'ende' }),
  knoten('sieg-alle', [
    R('Alle schuldig.', 'ueberrascht'),
    R('Das ist … das ist eine Sammelverurteilung. Das ist rechtlich hochproblematisch. Das ist das Beste, was ich seit Jahren gehört habe.'),
    R('Angenommen. Alle Bäcker sind schuldig. Strafe: Sie backen nächsten Sonntag wieder. Für die Kinder im Nest. Ich zahle das Mehl.', 'neutral'),
    erz('Die Werkstatt jubelt. Dante legt eine Platte auf. Der Richter wippt mit dem Fuß und behauptet hinterher, es sei ein Krampf gewesen.'),
  ], { next: 'ende', effects: [flag('richter_keks_alle')] }),
  knoten('ende', [
    R('Die Sitzung ist geschlossen. Beisitz, Sie waren unbestechlich. Fast. Das reicht für die Unterstadt.', 'neutral'),
    erz('Beim Gehen drückt er dir eine Papiertüte in die Hand. Darauf, in Schönschrift: „Beweismittel Nr. 7 – sichergestellt“. Drinnen: Kekse von jedem Teller. Außer der Sieben.'),
  ], { effects: [{ give: 'dantes-kekse', qty: 2 }, { give: 'kraeuter-gebaeck' }, { xp: 120 }, herz('richter', 30), flag('richter_keks_juror')] }),
]);

// ---------------------------------------------------------------------------------------------- Herz-Ereignis 10

/** ♥10: Ehrenamtliches Gerichtsmitglied (abends Richterbank am Eisenhof) – öffnet die Tafel „Streitschlichtung“. */
const he10 = dialog('he-richter-10', [
  knoten('start', [
    erz('Abend am Eisenhof. Der Richter sitzt auf seiner Bank, neben ihm ein Kästchen aus Nussholz und ein Stapel Akten mit einem Gummiband drum. Über dem Gefängnishof hängt eine Quantum-Drohne und filmt die Tomaten.'),
    R('{name}. Setzen Sie sich. Ich habe einen Antrag gestellt. Bei mir. Ich habe drei Wochen darüber beraten. Mit mir. Wir waren uns lange nicht einig.', 'neutral'),
    R('Die Stadt dreht durch. Leute sagen „Master“ zu Laternenpfählen. Nachbarn zeigen sich an, weil der Chip es empfiehlt. Ich komme mit dem Urteilen nicht mehr hinterher.'),
    R('Ich brauche jemanden, der hingeht, zuhört und sagt, was gerecht ist. Kein Richter. Ein Mensch. Ehrenamtlich. Aber vorher eine Frage. Die einzige, die zählt.'),
    R('Was ist Gerechtigkeit?', 'ueberrascht'),
  ], {
    choices: [
      { text: '„Dass jeder bekommt, was er verdient. Auch die da oben.“', next: 'antwort-verdient', effects: [herz('richter', 20)] },
      { text: '„Dass man zuhört, bevor man urteilt.“', next: 'antwort-zuhoeren', effects: [herz('richter', 25)] },
      {
        text: '„Gnade vor Recht. Wenn einer fällt, hilft man ihm hoch. Dann redet man.“', next: 'antwort-gnade',
        check: pruefung('he-richter-10-gnade', 'ausstrahlung', 7, ['ueberzeugen']), effects: [herz('richter', 40)],
      },
      { text: '„Ich hab gesessen. Gerechtigkeit ist, wenn einer dich danach noch grüßt.“', tag: '[Knast]', when: { origin: 'origin-knastvogel' }, next: 'antwort-knast', effects: [herz('richter', 40)] },
    ],
  }),
  knoten('antwort-verdient', [
    R('Auch die da oben. Ja. Das Gesetz hat keinen Aufzug. Es nimmt die Treppe, Stufe für Stufe. Bis ganz nach oben.', 'neutral'),
  ], { next: 'probefall' }),
  knoten('antwort-zuhoeren', [
    R('Zuhören. Das habe ich vierzig Jahre lang vergessen. Ich habe zugehört, bis ich wusste, was ich sagen wollte. Das ist nicht dasselbe.', 'neutral'),
  ], { next: 'probefall' }),
  knoten('antwort-gnade', [
    R('Gnade vor Recht.', 'ueberrascht'),
    erz('Er sagt lange nichts. Im Gefängnishof spielt Zelle neun drei falsche Akkorde und dann einen richtigen.'),
    R('Das steht in keinem Paragrafen. Ich werde einen schreiben. Paragraf null. Er kommt vor allen anderen.'),
  ], { next: 'probefall', effects: [flag('richter_paragraf_null')] }),
  knoten('antwort-knast', [
    R('Wenn einer dich danach noch grüßt.', 'neutral'),
    R('Ich grüße Sie, {name}. Seit dem ersten Tag. Mit Stirnrunzeln. Aber gegrüßt habe ich.'),
  ], { next: 'probefall' }),
  knoten('probefall', [
    erz('Wie bestellt schleift ein Ordnungshüter einen Mann in Bademantel heran. In der Schläfe glimmt ein Chrome-10-Chip. In der Hand hält er einen Gartenzwerg. Den Gartenzwerg des Richters.'),
    erz('„Das ist eine ausgezeichnete Entscheidung, Master“, sagt der Mann zu niemandem und lächelt.'),
    R('Ihr Probefall. Diebstahl eines Gartenzwergs. Der Täter ist geständig. Der Täter weiß nicht, dass er geständig ist. Urteilen Sie.', 'neutral'),
  ], {
    choices: [
      { text: '„Freispruch. Der Chip hat geklaut, nicht er. Bringt ihn zu Dante.“', next: 'fall-frei', effects: [herz('richter', 20), { rep: 'unterstadt', delta: 2 }] },
      { text: '„Zwei Stunden Unkraut. Mit dem Zwerg als Aufsicht. Danach zu Dante.“', next: 'fall-unkraut', effects: [herz('richter', 25)] },
      {
        text: 'Den Bademantel durchsuchen. Wer hat ihm den Chip verkauft?', next: 'fall-haendler',
        check: pruefung('he-richter-10-haendler', 'strasse', 6, ['spuren', 'geruecht']), effects: [herz('richter', 30), { rep: 'ordnungsdienst', delta: 3 }],
      },
    ],
  }),
  knoten('fall-frei', [
    R('Freispruch. Für einen geständigen Dieb. Weil der Dieb nicht er selbst war.', 'ueberrascht'),
    R('Das ist entweder der Anfang einer neuen Rechtsprechung oder das Ende der Zivilisation. Ich stimme zu. Bringt ihn zu Dante.'),
  ], { next: 'ernennung' }),
  knoten('fall-unkraut', [
    R('Mit dem Zwerg als Aufsicht. Der Zwerg ist streng. Der Zwerg hat noch nie ein Auge zugedrückt. Er hat keine Lider.', 'neutral'),
  ], { next: 'ernennung' }),
  knoten('fall-haendler', [
    erz('In der Bademanteltasche: ein Kassenbon. „Chrome-10-Probierstand, Glasarkaden. Gratis-Upgrade. Vielen Dank, Master.“ Dazu eine Visitenkarte mit Sybella Chromes Unterschrift in Goldtinte.'),
    R('Der Täter hat einen Lieferanten. Der Lieferant hat einen Vorgesetzten. Und der Vorgesetzte hat einen Turm.', 'wut'),
    R('Das ist kein Bagatellfall mehr. Das ist eine Akte. Eine dicke. Ich lege sie oben ins Regal. Da, wo man sie nicht vergisst.'),
  ], { next: 'ernennung', effects: [flag('richter_akte_quantum')] }),
  knoten('ernennung', [
    erz('Der Richter steht auf, streicht die Robe glatt und öffnet das Nussholzkästchen. Darin: ein Richterhammer in Miniatur, mit Messingring. Auf dem Griff eingraviert: „RLM79“.'),
    R('{name}. Kraft meines Amtes ernenne ich Sie zum ehrenamtlichen Mitglied des Bagatellgerichts. Streitschlichtung. Nachbarn, Ziegen, Toaster. Und Leute mit Chips.', 'neutral'),
    R('Wenn jemand fragt, wofür die Gravur steht: „Recht, Lauterkeit, Mäßigung“. Neunundsiebzig ist die Seriennummer.', 'ueberrascht'),
  ], {
    effects: [{ give: 'richterhammer-mini' }, flag('richter_schlichter'), { xp: 200 }, { message: 'Neue Auftragstafel: Streitschlichtung (Gerichtssaal).' }],
    choices: [
      { text: '„Ich nehme an, Euer Ehren.“', next: 'an', effects: [herz('richter', 50)] },
      { text: '„Schuldig. Der Bewilligung schuldig.“', next: 'schuldig', effects: [herz('richter', 50)] },
    ],
  }),
  knoten('an', [R('Gut. Die Fälle hängen im Gerichtssaal aus. Und Sie gießen die Tomaten. Ehrenamt fängt unten an.', 'neutral')]),
  knoten('schuldig', [
    erz('Der Richter lacht. Kurz, laut, überrascht. Im Gefängnishof antwortet jemand mit einem Gitarrenriff, und die Quantum-Drohne über den Tomaten dreht verwirrt ab.'),
    R('Das, {name}, ist das erste Mal, dass mich jemand mit meinem eigenen Wort erwischt. Ich lege Berufung ein. Bei mir. Abgelehnt.'),
  ]),
]);

// ---------------------------------------------------------------------------------------------- Tafel Streitschlichtung

const tafel: JobBoardDef = {
  name: 'Streitschlichtung (Bagatellgericht)', slots: 2,
  ranks: [{ min: 0, title: 'Beisitz' }, { min: 6, title: 'Schlichter' }, { min: 9, title: 'Friedensrichter' }],
};

interface Fall { key: string; map: string; spot: string; label: string }
const FAELLE: Fall[] = [
  { key: 'leine', map: 'neon-gasse', spot: 'gassenmitte', label: 'Neon-Gasse, Gassenmitte' },
  { key: 'waage', map: 'schrottmarkt', spot: 'waage', label: 'Schrottmarkt, Waage' },
  { key: 'tauben', map: 'loetgassen', spot: 'waeschehof', label: 'Lötgassen, Wäschehof' },
];

const job: JobTemplateDef = {
  id: JOB, kind: 'kurier', title: 'Streit schlichten: {ziel}',
  text: 'Der Richter schickt dich mit Mini-Hammer und Notizblock. Hör beide Seiten, sprich ein Urteil, verhindere eine Schlägerei. {credits} Cr aus der Gerichtskasse.',
  boards: ['streitschlichtung'], when: SCHLICHTER, targets: FAELLE.map((f) => ({ map: f.map, label: f.label })),
  reward: { credits: [40, 60], xp: 40, rep: { ordnungsdienst: 2, unterstadt: 2 } },
};

const fertig = { completeJob: JOB } as const;

const fallDialoge: DialogueDef[] = [
  dialog('streit-leine', [
    knoten('start', [
      erz('Über der Gasse hängt eine Wäscheleine zwischen zwei Fenstern. Links lehnt Frau Pötsch mit Lockenwicklern, rechts ein Rostzahn im Feinrippunterhemd. Auf der Leine: ein BH und eine Lederjacke. Beide zerren.'),
      erz('„Meine Leine!“ – „Mein Fenster, mein Haken, meine Leine!“ – „Dein Haken hält nur wegen MEINEM Dübel!“'),
    ], {
      choices: [
        { text: '„Montag bis Mittwoch ihre, Donnerstag bis Samstag seine. Sonntag lüftet ihr zusammen.“', next: 'vergleich', check: pruefung('streit-leine-vergleich', 'ausstrahlung', 5, ['verhandeln']), effects: [fertig, herz('richter', 5)] },
        { text: 'Den Mini-Hammer auf das Fensterbrett knallen. „SCHULDIG! Beide! Ruhe!“', next: 'hammer', effects: [fertig] },
        { text: 'Später.' },
      ],
    }),
    knoten('vergleich', [erz('Stille. Dann nickt Frau Pötsch. Der Rostzahn nickt auch, widerwillig. „Aber Sonntag hängt meine Jacke oben.“ – „Deine Jacke hängt IMMER oben!“ Na ja. Fast.'), ich('Fall geschlossen.')]),
    knoten('hammer', [erz('Beide zucken zusammen. Die Leine bleibt, wo sie ist. Der BH auch. Die Jacke rutscht in eine Pfütze, und plötzlich lachen alle drei. Gerechtigkeit ist manchmal nass.')]),
  ]),
  dialog('streit-waage', [
    knoten('start', [
      erz('An der Marktwaage brüllt ein Gemüsehändler eine Kundin an, die gerade einen Kohlkopf mit beiden Händen festhält. Die Kundin trägt einen Chrome-10-Chip. Sie lächelt. Das macht den Händler noch wütender.'),
      erz('„Die hat mir gesagt, die Waage lügt! Meine Waage lügt nie!“ – „Das ist eine ausgezeichnete Entscheidung, Master“, sagt die Kundin zum Kohlkopf.'),
    ], {
      choices: [
        { text: 'Unter die Waagschale gucken. Da klebt doch was.', next: 'magnet', check: pruefung('streit-waage-magnet', 'strasse', 5, ['spuren']), effects: [fertig, { rep: 'unterstadt', delta: 2 }] },
        { text: 'Den Kohlkopf bezahlen und der Kundin den Weg zu Dante zeigen.', next: 'bezahlt', effects: [{ credits: -10 }, fertig] },
        { text: 'Später.' },
      ],
    }),
    knoten('magnet', [erz('Unter der Schale: ein Magnet, so groß wie ein Daumen. Der Händler wird blass, dann rot, dann sehr freundlich. Die Kundin bekommt den Kohl gratis und eine Gurke obendrauf. Der Magnet geht an den Richter.'), ich('Die Waage lügt nicht. Ihr Besitzer schon.')]),
    knoten('bezahlt', [erz('Zehn Credits für einen Kohlkopf. Die Kundin bedankt sich beim Kohl. Der Händler brummt, aber er hört auf zu brüllen. Manchmal ist Frieden einfach ein schlechter Preis.')]),
  ]),
  dialog('streit-tauben', [
    knoten('start', [
      erz('Im Wäschehof stehen sich zwei Nachbarn gegenüber, jeder mit einer Taube auf dem Arm. Beide Tauben heißen Gerhard. Beide Männer behaupten, ihr Gerhard sei der echte. Die Tauben ist das egal.'),
    ], {
      choices: [
        { text: 'Beide Tauben loslassen lassen und schauen, wohin sie fliegen.', next: 'flug', check: pruefung('streit-tauben-flug', 'reflexe', 5, ['beobachten']), effects: [fertig] },
        { text: '„Ihr habt jetzt beide einen halben Gerhard. Teilt euch das Futter.“', next: 'halb', effects: [fertig, { advanceTime: 20 }] },
        { text: 'Später.' },
      ],
    }),
    knoten('flug', [erz('Du siehst genau hin: Der eine Gerhard fliegt zum linken Fenster, der andere zum Taubenschlag auf dem Dach. Zwei Tauben, zwei Zuhause. Die Nachbarn sehen sich an und geben sich verlegen die Hand.')]),
    knoten('halb', [erz('Zwanzig Minuten Diskussion über die Frage, welche Hälfte einer Taube wem gehört. Am Ende teilen sie das Futter. Und einen Kaffee. Gerhard und Gerhard schauen zu.')]),
  ]),
];

// ---------------------------------------------------------------------------------------------- Phasen

export function akt23(M: Menue): { dialogues: DialogueDef[]; talk: TalkDef[]; schedule: ScheduleEntry[]; teil: ContentPart } {
  const p = phasen('richter', 'richter-23', M, [
    {
      id: 'master', when: MASTER, ohneMenue: true,
      gruss: [
        R('Sie. In meinem Garten. Mit diesem Blick, den man nur von ganz oben bekommt.', 'wut'),
        R('Ich habe vierzig Jahre lang geglaubt, das Gesetz wiegt mehr als ein Turm. Sie haben mich eines Besseren belehrt. Gehen Sie. Die Tomaten haben Angst vor Ihnen. Ich noch nicht.'),
      ],
    },
    {
      id: 'ende-3b', when: ENDE_3B, einmal: true,
      gruss: [
        R('Berufung. Ich habe sie mir selbst vorgelegt, Ihren Fall. Spielfigur gegen Turm. Ich habe stattgegeben.', 'neutral'),
        R('Wer zurückkommt, nachdem er oben war, hat mehr Mut als jeder, der nie hochgefahren ist. Willkommen zurück auf der Anklagebank des Lebens. Sie ist bequemer, als man denkt.'),
      ],
      plausch: [R('Ich habe Ihre Akte nicht vernichtet. Ich habe sie umbenannt. Sie heißt jetzt „Bewährung, bestanden“.')],
    },
    {
      id: 'ende-nexus', when: ENDE_NEXUS, einmal: true,
      gruss: [
        R('Eine Künstliche Intelligenz hat sich beim Gericht als Zeugin angemeldet. Mit Aktenzeichen. Höflich. Sie sagt „Euer Ehren“ und nicht „Master“.', 'ueberrascht'),
        R('Ich weiß nicht, ob ich ihr glaube. Ich weiß, dass ich ihr zuhöre. Paragraf null, Sie erinnern sich.'),
      ],
      plausch: [R('Sie hat beantragt, die Chips schrittweise abzuschalten. Mit Nachsorge bei Dante. Der Antrag ist besser formuliert als alles, was die Staatsanwaltschaft je eingereicht hat. Ich bin beleidigt und beeindruckt.')],
    },
    {
      id: 'ende-meer', when: ENDE_MEER, einmal: true,
      gruss: [
        R('Blade Nocturne sitzt im Zellentrakt. Er hat eine Beschwerde eingereicht. Über die Matratze. Und über das Licht. Und über mich.', 'neutral'),
        R('Der Prozess beginnt nächsten Mittwoch. Kein Bagatellgericht. Ich habe extra einen zweiten Hammer bestellt. Für die großen Fälle.'),
      ],
      plausch: [R('Ich war am Meer, wissen Sie. Samstag. Ich habe die Robe ausgezogen und die Füße ins Wasser gehalten. Es war kalt. Ich habe nicht „schuldig“ gesagt. Nicht einmal zu den Quallen.', 'ueberrascht')],
    },
    {
      id: 'epilog', when: EPILOG_FREI, taeglich: true,
      gruss: [R('{name}. Die Anklagebank ist leer, seit die Chips aus sind. Ich langweile mich. Das ist das schönste Gefühl, das ein Richter haben kann.', 'neutral')],
      plausch: [
        R('Gestern hatte ich nur einen Fall: ein Mann hat seinen Toaster geheiratet. Ich habe sie getraut. Was soll ich sagen. Er sah glücklich aus. Der Toaster warm.'),
      ],
    },
    {
      id: 'akt3', when: AKT3_NACHT,
      gruss: [R('Heute Nacht ist die Party im Turm. Ich habe Bereitschaft. Ich sitze in Robe neben dem Telefon und warte, ob jemand einen Haftbefehl braucht. Für ganz oben.', 'besorgt')],
      plausch: [R('Wenn Sie zurückkommen, {name}, will ich keine Zeugenaussage. Ich will Sie nur sehen. Vollständig. Mit allen Gliedmaßen. Das ist eine Auflage.')],
    },
    {
      id: 'party', when: PARTY_VORB, taeglich: true,
      gruss: [R('Releaseparty. Im Turm. Ich bin nicht eingeladen. Richter werden nie eingeladen. Man fürchtet, dass sie urteilen. Zu Recht.', 'neutral')],
      plausch: [
        R('Ich habe gehört, Sie gehen hin. Mit gefälschten Ausweisen, nehme ich an. Ich habe das nicht gehört. Ich habe Tomaten im Ohr.', 'ueberrascht'),
        R('Kommen Sie heil wieder. Ich habe noch Fälle für Sie. Und einen Kürbis, der Ihre Meinung braucht.'),
      ],
    },
    {
      id: 'gerettet', when: { all: [COUNTDOWN_DONE, { notFlag: 'epilog' }] }, einmal: true,
      gruss: [
        R('Dante ist wieder im Dienst, höre ich. Mit einer Mülltonne voller Konfetti und einem Krater in der Gasse. Das Gericht vermerkt: Bewährung bestanden. Knapp.', 'neutral'),
        R('Und die junge Frau mit dem Arm ist wach. Gut. Sie hat mir einmal einen Briefkasten zertrümmert. Ich habe ihr nie verziehen. Ich bin trotzdem froh.'),
      ],
    },
    {
      id: 'nyra', when: NYRA_WEG, einmal: true,
      gruss: [
        R('Die Hackerin. Die Leise. Sie ist noch im Turm, heißt es.', 'besorgt'),
        R('Wenn Sie jemanden aus einem Turm holen wollen, brauchen Sie einen Durchsuchungsbeschluss. Ich habe keinen. Ich habe eine Leiter. Im Garten. Nehmen Sie, was Sie brauchen.'),
      ],
    },
    {
      id: 'chip', when: ARIA_GECHIPPT, taeglich: true,
      gruss: [R('Mein Gerichtsdiener sagt seit gestern „Master“ zu mir. Ich habe ihn suspendiert. Er hat sich bedankt. Für die ausgezeichnete Entscheidung.', 'wut')],
      plausch: [
        R('Auf der Anklagebank saß heute eine Frau, die ihre eigene Wohnung ausgeräumt hat. Für Quantum. Freiwillig, sagt sie. Ihr Chip sagt das auch. Ich glaube keinem von beiden.'),
        R('Und Ihre Kollegin, die mit dem Arm? Man erzählt sich Dinge. Ich hoffe, die Gerüchte sind falsch. Gerüchte sind meistens falsch. Meistens.', 'besorgt'),
      ],
    },
    {
      id: 'akt2-a', when: { all: [AKT2_NUR, { weekday: ['mo', 'mi', 'fr', 'so'] }] }, taeglich: true,
      gruss: [R('Drohnen. Über meinem Garten. Sie vermessen die Beete. Eine hat meine Kürbisse „ineffizient“ genannt. Ich habe sie mit dem Gartenschlauch verurteilt.', 'wut')],
      plausch: [R('Quantum hat dem Gericht Chrome-10-Gutscheine geschickt. „Für die Justiz.“ Ich habe sie als Unterlage für den Kaffee benutzt. Seitdem schmeckt der Kaffee nach Firmware.')],
    },
    {
      id: 'akt2-b', when: AKT2_NUR, taeglich: true,
      gruss: [R('Razzia in der Neon-Gasse, Razzia am Schrottmarkt. Die Ordnungshüter verhaften, ich lasse frei. Wir sind ein eingespieltes Team. Leider gegeneinander.', 'neutral')],
      plausch: [R('Wissen Sie, was das Schlimmste ist? Die Gechippten sind die höflichsten Angeklagten, die ich je hatte. Ich vermisse die Flüche. Die waren wenigstens ehrlich.')],
    },
  ]);

  const schedule: ScheduleEntry[] = [
    // Nachspiel: samstags am Meer, privat und barfuß (Ende 1/2/3b).
    { slot: 'tag', days: ['sa'], when: EPILOG_FREI, place: { map: 'das-meer', at: 'strand' } },
  ];

  const teil: ContentPart = {
    jobs: { [JOB]: job },
    jobBoards: { streitschlichtung: tafel },
    mapAdditions: {
      gerichtssaal: {
        hotspots: [{
          id: 'streitschlichtung', at: 'zuschauerbaenke-rechts', radius: 48, label: 'Aushang: Streitschlichtung', kind: 'board',
          board: 'streitschlichtung', when: SCHLICHTER,
        }],
      },
      ...Object.fromEntries(FAELLE.map((f) => [f.map, {
        hotspots: [{
          id: `streit-${f.key}`, at: f.spot, radius: 44, label: 'Streit schlichten', kind: 'use' as const,
          dialogue: `streit-${f.key}`, when: { job: JOB },
        }],
      }])),
    },
  };

  return { dialogues: [...p.dialogues, he8, he10, ...fallDialoge], talk: p.talk, schedule, teil };
}

