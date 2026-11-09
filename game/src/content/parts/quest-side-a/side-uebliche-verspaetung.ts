// Nebenquest 1 `side-uebliche-verspaetung` „Die übliche Verspätung“ (world.md §6.2 Nr. 1).
// Frau Takt (14 Stoppuhren) am Stellwerk von Bahnhof Mitte, M/T. Drei Stellwerke mit Störsendern
// (neon-gasse: Karte selbst, Flag stellwerk_neon_entstoert · loetgassen und hafenkante: hier per mapAdditions),
// Spur zu „Schwebetaxi Blitz“ (Frau Takt oder Kikis Beweisfotos ab ♥2), Showdown am Taxistand:
// gc-51 [Straße 6] Lizenz · Kampf enc-taxistand · [Collin ♥2] Bericht in den Nachrichten · Kikis Fotos · Störsender vorlegen.
import type { ContentPart } from '../../part';
import type { DialogueDef, PhoneMessageDef, QuestDef } from '../../../modules/contracts';
import { type AddHotspot, active, all, any, dlg, done, flag, hearts, ich, inactive, l, msg, nar, node, noFlag, set, time, tschuess, VEX } from './_lib';

const Q = 'side-uebliche-verspaetung';
const T = 'frau-takt';
const B = 'herr-blitz';

const NEON = 'stellwerk_neon_entstoert';
const LOET = 'stellwerk_loet_entstoert';
const HAFEN = 'stellwerk_hafen_entstoert';
const ALLE_DREI = all(flag(NEON), flag(LOET), flag(HAFEN));
const SPUR = 'takt_spur_blitz';
const BLITZ_ERLEDIGT = 'takt_blitz_erledigt';
const BLITZ_GESCHAFFT = any(flag(BLITZ_ERLEDIGT), { won: 'enc-taxistand' });

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: 'Die übliche Verspätung',
  summary: 'Frau Takt misst seit 2071 jede U-Bahn. Pünktlich war keine. Jetzt hat sie einen Verdacht – und vierzehn Stoppuhren.',
  giver: T,
  act: 1,
  steps: [
    {
      id: 'stellwerk-neon', text: 'Entstöre das Stellwerk in der Neon-Gasse (neben dem Kiosk).',
      done: flag(NEON), marker: { map: 'neon-gasse' },
    },
    {
      id: 'stellwerk-loet', text: 'Entstöre das Stellwerk in den Lötgassen.',
      done: flag(LOET), marker: { map: 'loetgassen' },
    },
    {
      id: 'stellwerk-hafen', text: 'Entstöre das Stellwerk an der Hafenkante.',
      done: flag(HAFEN), marker: { map: 'hafenkante' },
    },
    {
      id: 'spur', text: 'Bring die Störsender zu Frau Takt. Wer klebt so was an Stellwerke?',
      when: ALLE_DREI, done: flag(SPUR), marker: { map: 'bahnhof-mitte' },
    },
    {
      id: 'kiki', text: 'Optional: Kiki Karbon hat am Taxistand Fotos gemacht (ab ♥2).',
      optional: true, when: all(hearts('kiki-karbon', 2), noFlag('takt_beweisfotos')),
      done: flag('takt_beweisfotos'), marker: { map: 'bahnhof-mitte' },
    },
    {
      id: 'blitz', text: 'Stell Herrn Blitz am Taxistand von Bahnhof Mitte (tagsüber).',
      when: flag(SPUR), done: BLITZ_GESCHAFFT, marker: { map: 'bahnhof-mitte' },
    },
    {
      id: 'takt', text: 'Melde Frau Takt, dass die Bahn ab sofort pünktlich fährt.',
      when: BLITZ_GESCHAFFT, done: flag('takt_belohnt'), marker: { map: 'bahnhof-mitte' },
    },
  ],
  reward: {
    xp: 200,
    credits: 250,
    items: { 'stoppuhr-takt': 1 },
    rep: { unterstadt: 10 },
    effects: [
      set('ubahn_puenktlich'),
      msg('Die U-Bahn fährt pünktlich. Fahrten kosten ab jetzt 15 statt 30 Minuten. Die halbe Unterstadt kommt zu früh zur Arbeit und ist stinksauer.'),
    ],
  },
};

// ---------------------------------------------------------------------------------------------- Frau Takt

const takt: DialogueDef = dlg('side-verspaetung-takt', [
  node('start', [
    nar('Hinter der Scheibe des Stellwerks: eine Frau in Uniform, Dutt wie aus Beton, vierzehn Stoppuhren an einem Brett. Sie drückt eine davon, ohne hinzusehen.'),
    l(T, 'Sie stehen seit vierzig Komma drei Sekunden vor meinem Fenster. Wollen Sie etwas, oder sind Sie eine Verspätung?', 'neutral'),
  ], {
    choices: [
      { text: '„Was messen Sie da eigentlich?“', when: inactive(Q), next: 'klage' },
      { text: '„Die Stellwerke sind sauber. Und das hier klebte dran.“ (Störsender zeigen)', when: all(active(Q), ALLE_DREI, noFlag(SPUR)), next: 'spur' },
      { text: '„Wie geht’s der Pünktlichkeit?“', when: all(active(Q), noFlag(SPUR)), next: 'stand' },
      { text: '„Herr Blitz klebt keine Störsender mehr.“', when: all(active(Q), BLITZ_GESCHAFFT, noFlag('takt_belohnt')), next: 'ende' },
      { text: '„Wie läuft die Bahn?“', when: done(Q), next: 'danach' },
      tschuess('„Nur geguckt.“'),
    ],
  }),
  node('klage', [
    l(T, 'Ich messe die Linie Drei. Seit dem vierzehnten März 2071, sechs Uhr null null. Seitdem war kein einziger Zug pünktlich. Kein. Einziger.', 'wut'),
    l(T, 'Zwei Minuten zu spät. Neun Minuten zu spät. Einmal zwei Tage zu spät, da kam der Zug mit einem Hochzeitspaar an, das beim Einsteigen noch nicht verlobt war.'),
    l(T, 'Die Leitstelle sagt: „Wetter.“ Unter der Erde. WETTER. Ich sage: Jemand pfuscht an meinen Stellwerken rum. Neon-Gasse, Lötgassen, Hafenkante. Alle drei spinnen, sobald es eng wird.'),
    ich('Und warum gehen Sie nicht selbst nachsehen?'),
    l(T, 'Weil ich dann nicht messen kann, Sie Amateur. Wer misst, wenn ich weg bin? Sie?', 'wut'),
  ], {
    choices: [
      { text: '„Okay. Ich schau mir die drei Kästen an.“', next: 'auftrag' },
      { text: '„Was springt dabei raus?“', next: 'lohn' },
      { text: '„Klingt nach einem Problem für jemanden, der’s pünktlich lösen will. Also nicht für mich.“' },
    ],
  }),
  node('lohn', [
    l(T, 'Zweihundertfünfzig Credits aus der Kaffeekasse. Und eine Stoppuhr. Meine fünfzehnte. Ich habe sie nie benutzt, weil fünfzehn eine unordentliche Zahl ist.'),
    l(T, 'Und das Wichtigste: Danach fahren Sie fünfzehn Minuten statt dreißig. Jeden Tag. Rechnen Sie mal hoch, was Ihnen das an Leben spart. Ich habe es ausgerechnet. Es ist viel.'),
  ], { choices: [{ text: '„Abgemacht.“', next: 'auftrag' }, tschuess('„Ich überleg’s mir.“')] }),
  node('auftrag', [
    l(T, 'Stellwerk Neon-Gasse: grauer Kasten neben dem Kiosk. Lötgassen: an der Hauswand gegenüber der Werkstätten. Hafenkante: am Kai, unter dem Signalmast.', 'signatur'),
    l(T, 'Wer Technik hat, kriegt das in Minuten hin. Wer keine hat, nimmt einen Schraubschlüssel und Geduld. Dexter verleiht so was. Gegen Geld. Und gegen den Willen Gottes.'),
    l(T, 'Ich stoppe die Zeit. Ab jetzt.'),
  ], { effects: [{ startQuest: Q }] }),
  node('stand', [
    l(T, 'Neun Minuten zwölf Verspätung heute früh. Gestern acht vierzig. Ich wäre erfreut, wenn ich erfreut sein könnte.'),
    l(T, 'Drei Stellwerke: Neon-Gasse, Lötgassen, Hafenkante. Ich zähle bis drei. Nicht laut. Innerlich. Die ganze Zeit.'),
  ]),
  node('spur', [
    nar('Du legst drei Störsender auf ihr Pult. Kleine Kästchen, mit gelbem Panzertape umwickelt. Auf dem Tape: lauter kleine Blitze.'),
    l(T, 'Gelbes Tape. Mit Blitzen. Das ist kein Tape, das ist ein Geständnis.', 'ueberrascht'),
    l(T, '„Schwebetaxi Blitz“. Jedes Mal, wenn die Bahn hängt, stehen die Leute oben am Taxistand Schlange. Und wer kassiert? Herr Blitz. Dieser aufgeblasene Ventilator mit Schnurrbart.', 'wut'),
    l(T, 'Er steht tagsüber am Taxistand. Ich möchte, dass Sie ihn stellen. Ich möchte nicht wissen, wie. Ich möchte nur wissen, wie lange es gedauert hat.'),
  ], { effects: [set(SPUR)] }),
  node('ende', [
    l(T, 'Moment.', 'neutral'),
    nar('Unten fährt die Linie Drei ein. Frau Takt hält eine Stoppuhr hoch. Die Türen gehen auf. Sie drückt.'),
    l(T, 'Sechzehn Uhr zwölf. Null Sekunden.', 'ueberrascht'),
    l(T, 'Null. Sekunden.'),
    nar('Sie setzt sich sehr langsam hin. Eine Träne läuft ihr über die Wange, genau im Takt.'),
    l(T, 'Fünfzehn Jahre. Hier. Die Stoppuhr. Die fünfzehnte. Ich habe beschlossen, dass fünfzehn ab heute eine ordentliche Zahl ist.', 'freude'),
  ], {
    choices: [
      { text: '„Gern geschehen. War mir eine Ehre, Frau Takt.“', next: 'ende-nett' },
      { text: '„Heulen Sie mir jetzt nicht das Stellwerk voll.“', next: 'ende-ruppig' },
      { text: '„Ich mach das nur, damit ich morgen pünktlich zu spät komme.“', when: VEX, next: 'ende-vex' },
    ],
  }),
  node('ende-nett', [l(T, 'Die Ehre war vierzehn Komma acht Sekunden lang ganz meine. Ich hab’s gemessen.', 'freude')], { effects: [set('takt_belohnt')] }),
  node('ende-ruppig', [l(T, 'Ich heule in Intervallen. Das stört niemanden. Gehen Sie, bevor ich die Rührung in Minuten umrechne.', 'verlegen')], { effects: [set('takt_belohnt')] }),
  node('ende-vex', [
    l(T, 'Ah. Die Kurierin. Sie fahren auf Dächern, weil die Bahn zu spät ist. Ab morgen haben Sie keine Ausrede mehr.', 'signatur'),
    ich('Ich hab nie eine gebraucht. Dächer sind einfach geiler.'),
  ], { effects: [set('takt_belohnt')] }),
  node('danach', [
    l(T, 'Null Komma vier Sekunden Abweichung im Wochenschnitt. Die Leute beschweren sich, dass sie zu früh ankommen.'),
    l(T, 'Endlich. Endlich beschweren sie sich über das Richtige.', 'freude'),
  ]),
]);

// ---------------------------------------------------------------------------------------------- Herr Blitz

const blitz: DialogueDef = dlg('side-verspaetung-blitz', [
  node('start', [
    nar('Ein knallgelbes Schwebetaxi mit Blitz-Lackierung, daneben ein Mann mit Goldkettchen und einem Schnurrbart, der mehr Pflege bekommt als die meisten Kinder der Unterstadt.'),
    l(B, 'Blitz! Schwebetaxi Blitz! Wenn die Bahn mal wieder hängt – und sie hängt IMMER –, ist Blitz schon da! Wohin, Schätzchen?', 'freude'),
  ], {
    choices: [
      { text: '„Zum Stellwerk. Da kannst du gleich deine Störsender abholen.“', next: 'stellen' },
      tschuess('„Nirgendwohin. Weiter so.“'),
    ],
  }),
  node('stellen', [
    l(B, 'Störsender? Ich? Ich bin ein ehrlicher Unternehmer! Ich habe ein Diplom! Von mir selbst, aber ein Diplom!', 'ueberrascht'),
    l(B, 'Und überhaupt, Schätzchen: Beweise? Hast du Beweise? Gelbes Tape gibt’s in jedem Laden.'),
  ], {
    choices: [
      { text: '„Ich hab mich umgehört. Du fliegst seit drei Jahren ohne Lizenz. Soll das die Ordnungsstelle wissen?“', check: 'gc-51', next: 'lizenz' },
      {
        text: '„Kiki hat dich fotografiert. Beim Ankleben. In der Neon-Gasse. Mit Zunge zwischen den Zähnen.“', tag: '[Kikis Fotos]',
        when: flag('takt_beweisfotos'), next: 'fotos',
      },
      {
        text: '„Ich ruf Collin an. Morgen bist du in den Nachrichten: ‚Der Mann, der die U-Bahn klaut‘.“', tag: '[Collin ♥2]',
        requires: hearts('collin-charleston', 2), next: 'collin',
      },
      { text: '„Dann eben ohne Beweise. Ich polier dir den Lack.“', next: 'kampf' },
      { text: '„Ich hab dein Tape. Und die Zeiten, wann die Bahn hängt. Immer, wenn deine Schlange am längsten ist.“', next: 'leugnen' },
      tschuess('„Wir sprechen uns noch.“'),
    ],
  }),
  node('leugnen', [
    l(B, 'Zufall! Statistik! Statistik ist ein Zufall mit Taschenrechner!', 'wut'),
    l(B, 'Ohne Beweis gibt’s nur eins: Du steigst ein und zahlst, oder du verpisst dich von meinem Stand.'),
  ], {
    choices: [
      { text: '„Dann eben so.“ (Draufhauen)', next: 'kampf' },
      tschuess('„Ich komm mit Beweisen wieder.“'),
    ],
  }),
  node('lizenz', [
    l(B, 'Woher … das ist … das ist eine LÜGE, die zufällig wahr ist!', 'besorgt'),
    nar('Er sieht sich um. Am Taxistand stehen sechs Pendler und ein Hund. Alle gucken.'),
    l(B, 'Gut. GUT. Ich nehm die Dinger ab. Alle. Und ich klebe nie wieder was an irgendwas. Nicht mal Briefmarken.'),
    l(B, 'Und du, Schätzchen, hast mich nie gesehen. Hier, für die Augen. Damit sie vergessen.'),
  ], { effects: [{ credits: 80 }, set(BLITZ_ERLEDIGT)], next: 'abflug' }),
  node('fotos', [
    nar('Du hältst ihm Kikis Fotos hin. Herr Blitz in der Neon-Gasse, Panzertape im Mund, Störsender in der Hand, Hintern zur Kamera.'),
    l(B, 'Das ist … mein guter Winkel ist das nicht.', 'verlegen'),
    l(B, 'Kiki Karbon. Natürlich. Diese Hupe mit Rotoren. Sie kann mich nicht leiden, seit ich ihr Taxi „fliegenden Rasenmäher“ genannt hab.'),
    l(B, 'Na schön. Ich hör auf. Die Bahn fährt. Die Welt geht unter. Bist du jetzt zufrieden?'),
  ], { effects: [set(BLITZ_ERLEDIGT), { relation: 'kiki-karbon', delta: 30 }], next: 'abflug' }),
  node('collin', [
    l(B, 'Collin? COLLIN CHARLESTON? Der Mann mit den Zähnen?', 'besorgt'),
    l(B, 'Der hat letzte Woche einen Würstchenverkäufer so lange „exklusiv“ interviewt, bis der ausgewandert ist. In die Ödnis. Zu Fuß.'),
    l(B, 'Kein Collin. Bitte. Ich nehm die Dinger ab. Ich schwör’s auf meinen Schnurrbart.'),
  ], { effects: [set(BLITZ_ERLEDIGT), set('meinung_plus_blitz'), { relation: 'collin-charleston', delta: 20 }], next: 'abflug' }),
  node('kampf', [
    l(B, 'Ach so läuft das? Jungs! Kundenbeschwerde! Holt die Fahrtenbücher. Die schweren!', 'wut'),
    nar('Zwei Fahrer in gelben Westen schälen sich aus dem Taxi. Einer hat einen Radmutternschlüssel, der andere eine sehr laute Hupe.'),
  ], { effects: [{ battle: 'enc-taxistand' }] }),
  node('abflug', [
    nar('Herr Blitz reißt die Tür auf, schwingt sich ins Taxi und hebt ab. Ein Schwall Abgas, ein letzter Blick zurück.'),
    l(B, 'Das war’s nicht, Schätzchen! Blitz schlägt immer zweimal ein!', 'wut'),
    ich('Nicht mit dem Kopf voran, hoffentlich.'),
  ]),
]);

// Kikis Beweisfotos (ab ♥2): kurzer Dialog am Taxistand.
const kiki: DialogueDef = dlg('side-verspaetung-kiki', [
  node('start', [
    l('kiki-karbon', 'Kurs liegt an, Süße! Du jagst Blitz? Sag das doch gleich!', 'freude'),
    l('kiki-karbon', 'Ich hab den Sack fotografiert. Dreimal. Wie er nachts Kästchen an Stellwerke klebt. Ich wollt’s eigentlich bei seiner Hochzeit zeigen, aber er heiratet ja keiner.'),
  ], {
    choices: [
      { text: '„Her damit. Du bist ein Engel mit Rotoren.“', next: 'gib' },
      tschuess('„Später, Kiki.“'),
    ],
  }),
  node('gib', [
    nar('Kiki schiebt dir drei Fotos über die Motorhaube. Herr Blitz von hinten, von der Seite und, besonders schön, beim Stolpern.'),
    l('kiki-karbon', 'Mach ihn fertig. Und wenn er heult, schick mir ein Video. Ende.', 'signatur'),
  ], { effects: [set('takt_beweisfotos'), msg('Kikis Beweisfotos: Herr Blitz beim Ankleben eines Störsenders.')] }),
]);

// ---------------------------------------------------------------------------------------------- Stellwerke

/** Stellwerk entstören: Check-Hotspot gc-50 und Schraubschlüssel-Weg (1 Std.). */
function stellwerk(id: string, spot: string, fl: string, ort: string): AddHotspot[] {
  const offen = all(active(Q), noFlag(fl));
  return [
    {
      id, at: spot, radius: 56, label: 'Stellwerk entstören', kind: 'check', check: 'gc-50',
      when: offen, hideWhen: flag(fl),
      lines: [nar(`Der Stellwerkkasten ${ort}. Das Gitter ist aufgebogen, drinnen klebt ein kleiner Kasten mit gelbem Panzertape. Auf dem Tape: lauter kleine Blitze.`)],
      altText: 'Kabelsalat mit Ansage. Für die Feinarbeit fehlen dir Technik-Punkte – mit Dexters Schraubschlüssel geht es auch, dauert dann aber eine Stunde.',
      effects: [set(fl), msg('Störsender ab, Kabel zurück. Irgendwo tief unter dir hupt eine U-Bahn, verwirrt, weil sie plötzlich fahren darf.')],
    },
    {
      id: `${id}-schluessel`, at: spot, radius: 56, label: 'Stellwerk mit Schraubschlüssel bearbeiten (1 Std.)', kind: 'use',
      when: all(offen, { item: 'dexters-schraubschluessel' }), hideWhen: flag(fl),
      effects: [
        { advanceTime: 60 }, set(fl),
        msg('Eine Stunde, drei abgebrochene Fingernägel und eine sehr persönliche Beziehung zu einem Schraubschlüssel später ist der Störsender ab.'),
      ],
    },
  ];
}

const tel: PhoneMessageDef = {
  id: 'tel-takt-puenktlich',
  from: T,
  text: 'Linie Drei, heute 07:14:00. Null Sekunden. Ich wiederhole: NULL. Sekunden. Kommen Sie vorbei. Ich habe etwas für Sie. – Takt',
  auto: all(active(Q), BLITZ_GESCHAFFT),
  replies: [{ text: 'Bin unterwegs.' }, { text: 'Pünktlich?', effects: [msg('Frau Takt: „Wagen Sie es nicht.“')] }],
};

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: { [takt.id]: takt, [blitz.id]: blitz, [kiki.id]: kiki },
  phone: { [tel.id]: tel },
  mapAdditions: {
    'bahnhof-mitte': {
      hotspots: [
        { id: 'q-verspaetung-takt', at: 'stellwerk', radius: 60, label: 'Frau Takt (Stellwerk)', kind: 'talk', dialogue: takt.id, when: time('morgen', 'tag') },
        {
          id: 'q-verspaetung-blitz', at: 'taxistand-blitz', radius: 60, label: 'Herrn Blitz stellen', kind: 'talk', dialogue: blitz.id,
          when: all(active(Q), flag(SPUR), { not: BLITZ_GESCHAFFT }, time('tag', 'abend')),
        },
        {
          id: 'q-verspaetung-kiki', at: 'taxistand', radius: 60, label: 'Kiki nach Herrn Blitz fragen', kind: 'talk', dialogue: kiki.id,
          when: all(active(Q), flag(SPUR), hearts('kiki-karbon', 2), noFlag('takt_beweisfotos'), { not: BLITZ_GESCHAFFT }),
        },
      ],
    },
    loetgassen: { hotspots: stellwerk('stellwerk-loet', 'stellwerk-loet', LOET, 'in den Lötgassen') },
    hafenkante: { hotspots: stellwerk('stellwerk-hafen', 'stellwerk-hafen', HAFEN, 'am Kai') },
  },
};

