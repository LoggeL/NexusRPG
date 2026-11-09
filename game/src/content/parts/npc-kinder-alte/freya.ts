// Freya (Straßenkind, will Richterin werden, führt die Fluchdose): NpcDef, Tagesgespräche, he-freya-2…10 (world.md §4.4).
// Nur Freundschaft (child: true). Geburtstag am Samstag von side-keksalarm. Persönliche Quest pers-freya-fairer-lohn
// baut der Quest-Agent. Die Fluchdose: Wer in ihrer Nähe flucht, zahlt einen Credit (oder einen Keks).
import type { Condition, DialogueChoice, NpcDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import { FREYA_HE_23, FREYA_SCHEDULE_23, FREYA_TALK_FRUEH, FREYA_TALK_POOL } from './freya-akt23';
import {
  EXWACHE, KINDERZEIT, KNAST, L, N, chk, dialogs, dlg, herz, node, zeitHinweis, zeitHinweisWann,
} from './_dsl';

const F = 'freya';
const KEKSALARM_AKTIV: Condition = { quest: 'side-keksalarm', state: 'active' };

/** Fluch-Wahl: kostet einen Credit für die Fluchdose (ausgegraut, wenn man pleite ist). */
const fluch = (text: string, next: string): DialogueChoice => ({
  text, next, requires: { credits: 1 }, effects: [{ credits: -1 }, { setFlag: 'fluchdose_gefuettert' }],
});

const npc: NpcDef = {
  id: F,
  name: 'Freya',
  unknownName: 'Mädchen mit Notizbuch',
  portrait: 'freya',
  sprite: 'freya-walk',
  faction: 'unterstadt',
  child: true,
  bio: 'Will Richterin werden. Führt die Fluchdose (ein Keks oder ein Credit pro Fluch), liebt Regeln, Stempel und Gerechtigkeit.',
  gifts: {
    loves: ['gesetzbuch', 'stempelkissen', 'dantes-kekse'],
    likes: ['stickerbogen', 'comic-heft', 'bao-dampfnudel', 'murmelbeutel', 'echtobst-apfel', 'hofhonig'],
    dislikes: ['raubkopie-stick', 'parfuem-ozon'],
    hates: ['handschellen', 'virus-implantat', 'rostige-dose'],
  },
  // Geburtstag: der Samstag von side-keksalarm, sonst Tag 6 im Festkalender (der erste Samstag).
  birthday: { any: [{ cycleDay: 6 }, { all: [{ weekday: 'sa' }, KEKSALARM_AKTIV] }] },
  schedule: [
    ...FREYA_SCHEDULE_23,
    { slot: 'morgen', days: ['mi'], place: { map: 'gerichtssaal', at: 'zuschauerbaenke' } },
    { slot: 'morgen', place: { map: 'das-nest', at: 'schlafnischen' } },
    { slot: 'tag', days: ['mi'], place: { map: 'eisenhof', at: 'gerichtsgarten' } },
    { slot: 'tag', place: { map: 'schrottmarkt', at: 'botenstand' } },
    { slot: 'abend', days: ['do'], place: { map: 'dantes-werkstatt', at: 'eins-tisch' } },
    { slot: 'abend', when: KINDERZEIT, place: { map: 'schrottmarkt', at: 'lio-ecke' } },
    { slot: ['abend', 'nacht'], place: { map: 'das-nest', at: 'schlafnischen' } },
  ],
  heartEvents: [
    {
      id: 'he-freya-2', hearts: 2, map: 'schrottmarkt', time: 'tag', when: { not: { weekday: 'mi' } },
      dialogue: 'dlg-he-freya-2', effects: [{ xp: 25 }],
    },
    {
      id: 'he-freya-4', hearts: 4, map: 'eisenhof', time: 'tag', when: { weekday: 'mi' },
      dialogue: 'dlg-he-freya-4', effects: [{ xp: 35 }],
    },
    {
      id: 'he-freya-6', hearts: 6, map: 'schrottmarkt', time: 'abend', when: { all: [KINDERZEIT, { not: { weekday: 'do' } }] },
      dialogue: 'dlg-he-freya-6', effects: [{ xp: 45 }],
    },
    ...FREYA_HE_23,
    { id: 're-freya-2', hearts: -2, map: 'schrottmarkt', time: 'tag', dialogue: 'dlg-re-freya-2' },
  ],
  talk: [
    { dialogue: 'freya-schweigen', when: { rival: F } },
    { dialogue: 'freya-zeit', minHearts: 8, when: zeitHinweisWann('freya-zeit') },
    ...FREYA_TALK_FRUEH,
    { dialogue: 'freya-geburtstag', when: { all: [{ weekday: 'sa' }, KEKSALARM_AKTIV] } },
    { dialogue: 'freya-gericht', when: { all: [{ time: 'morgen' }, { weekday: 'mi' }] } },
    { dialogue: 'freya-garten', when: { all: [{ time: 'tag' }, { weekday: 'mi' }] } },
    { dialogue: 'freya-morgen', when: { time: 'morgen' } },
    { dialogue: 'freya-eins', when: { all: [{ time: 'abend' }, { weekday: 'do' }] } },
    { dialogue: 'freya-lio', when: { time: 'abend' } },
    ...FREYA_TALK_POOL,
    { dialogue: 'freya-tag-4', minHearts: 4 },
    { dialogue: 'freya-tag-0' },
  ],
};

const dialogues = dialogs(
  // ------------------------------------------------------------------------------------------- Tagesgespräche
  dlg('freya-tag-0', [
    node('a', [
      N('Freya sitzt am Botenstand, ein Notizbuch auf den Knien, und guckt dich an wie eine Zeugin, die gleich vereidigt wird.'),
      L(F, 'Name, Anliegen, Vorstrafen. In dieser Reihenfolge, bitte.', 'signatur'),
    ], {
      choices: [
        { text: '„Keine Vorstrafen. Also, keine bewiesenen.“', next: 'vorstrafen' },
        fluch('„Verdammt, Kind, ich will nur ’nen Brief verschicken.“', 'fluch'),
        { text: '[Ex-Wache] „Dienstnummer vier-sieben-null. Ehemals.“', tag: '[Ex-Wache]', when: EXWACHE, next: 'wache', once: true, id: 'wache' },
        { text: '„Bis später, Frau Richterin.“', effects: [herz(F, 5)] },
      ],
    }),
    node('vorstrafen', [
      L(F, '„Keine bewiesenen.“ Notiert. Mit Fragezeichen. Das Fragezeichen ist nicht gut für dich.'),
    ]),
    node('fluch', [
      L(F, 'Einspruch! „Verdammt“ macht einen Credit. Fluchdose. Das Geld geht an Kekse und an Gerechtigkeit. In dieser Reihenfolge.', 'wut'),
      N('Sie hält dir eine Blechdose hin. Darauf steht in Schönschrift: „FLUCHDOSE – AUCH FÜR ERWACHSENE“. Du wirfst einen Credit rein.'),
    ]),
    node('wache', [
      L(F, 'Du warst bei der Wache?! Wie lang? Welches Revier? Hattest du einen Hund? Hast du mal jemanden verhaftet, der unschuldig war? Wie viele Formulare braucht man für eine Festnahme? Darf ich deine Marke sehen? Ist die echt?', 'ueberrascht'),
      L(F, 'Ich hab noch siebenundneunzig Fragen. Ich stell dir jeden Tag drei. Das ist fair.', 'freude'),
    ], { effects: [herz(F, 30)] }),
  ]),

  dlg('freya-tag-4', [
    node('a', [
      L(F, 'Zwischenbericht der Fluchdose: Diese Woche einundvierzig Credits. Davon von Hunter: zwanzig. Davon von dir: zu viele.', 'signatur'),
    ], {
      choices: [
        { text: '„Und von Dante?“', next: 'dante' },
        { text: '„Und von Oma Volt?“', next: 'oma' },
        fluch('„Ach du Scheiße, so viel?“', 'fluch'),
      ],
    }),
    node('dante', [
      L(F, 'Null. Dante flucht nicht. Dante sagt „Heiliges Kanonenrohr“. Ich hab lange überlegt, ob das ein Fluch ist. Urteil: Es ist ein Gebet.'),
    ]),
    node('oma', [
      L(F, 'Oma Volt zahlt pauschal. Fünf Credits am Montag, dann darf sie die ganze Woche. Das ist rechtlich bedenklich, aber praktisch.', 'besorgt'),
    ]),
    node('fluch', [
      L(F, 'Zweiundvierzig.', 'signatur'),
      N('Die Dose klimpert. Freya macht einen Strich ins Notizbuch. Der Strich sieht zufrieden aus.'),
    ]),
  ]),

  dlg('freya-morgen', [
    node('a', [
      N('Freya sitzt im Schneidersitz in ihrer Nische und liest im Licht einer Taschenlampe in einem Gesetzbuch, das größer ist als ihr Oberkörper.'),
      L(F, 'Psst. Ich bin bei Paragraf zweihundertzwölf. Da geht es um Hühner. Ich weiß nicht, warum. Aber es ist spannend.'),
    ], {
      choices: [
        { text: '„Was steht da über Hühner?“', next: 'huehner' },
        { text: '„Lies weiter. Ich stör nicht.“', effects: [herz(F, 5)] },
      ],
    }),
    node('huehner', [
      L(F, 'Dass man sie nicht „zur Belustigung über öffentliche Plätze treiben“ darf. Das heißt, irgendwer hat das mal gemacht. Und es war so schlimm, dass sie ein Gesetz geschrieben haben.', 'ueberrascht'),
      L(F, 'Ich will wissen, wer. Ich will ihn verurteilen. Oder ihm gratulieren. Ich bin noch unentschieden.'),
    ]),
  ]),

  dlg('freya-gericht', [
    node('a', [
      N('Bagatellgericht. Auf der Zuschauerbank sitzt Freya kerzengerade, die Hände gefaltet, und schreibt jedes Wort mit.'),
      L(F, '(flüsternd) Psst! Es wird verhandelt! Ein Mann hat einen Mülleimer-Roboter beleidigt. Der Roboter hat Anzeige erstattet.', 'ueberrascht'),
    ], {
      choices: [
        { text: '(flüsternd) „Kann ein Roboter Anzeige erstatten?“', next: 'roboter' },
        { text: '(Leise neben sie setzen und zuhören.)', effects: [herz(F, 10), { advanceTime: 20 }], next: 'zuhoeren' },
      ],
    }),
    node('roboter', [
      L(F, 'Das ist die Frage! Das ist DIE Frage! Der Richter guckt schon seit zehn Minuten in ein Buch und sagt nichts. Ich glaub, er weiß es auch nicht.', 'freude'),
    ]),
    node('zuhoeren', [
      N('Zwanzig Minuten später: Der Mann muss sich beim Roboter entschuldigen. Der Roboter sagt „Danke!“. Der Mann weint ein bisschen. Freya nickt, als hätte sie es genau so vorausgesagt.'),
      L(F, 'Weise. Sehr weise. Ich hätte ihn zusätzlich zum Mülltrennen verdonnert. Aber weise.'),
    ]),
  ]),

  dlg('freya-garten', [
    node('a', [
      N('Im Gerichtsgarten jätet der Richter Unkraut. Bei jedem Löwenzahn murmelt er „Schuldig!“. Freya kniet daneben und sortiert die Verurteilten in einen Eimer.'),
      L(F, 'Mittwochs ist Gerichtstag. Morgens Verhandlung, mittags Vollstreckung. Am Unkraut.', 'signatur'),
      L('richter', 'Schuldig. …Schuldig. …Du da: freigesprochen. Du bist Petersilie.'),
    ], {
      choices: [
        { text: '„Darf ich mithelfen?“', effects: [herz(F, 10), herz('richter', 10), { advanceTime: 30 }], next: 'helfen' },
        { text: '„Ihr zwei seid unheimlich.“', next: 'unheimlich' },
      ],
    }),
    node('helfen', [
      N('Eine halbe Stunde lang ziehst du Unkraut. Freya kontrolliert jedes Stück. Zweimal legt sie Einspruch ein, einmal zu Recht.'),
      L(F, 'Gute Arbeit. Du bist als Schöffe zugelassen. Für Unkraut.', 'freude'),
    ]),
    node('unheimlich', [L(F, 'Danke. Das ist das Netteste, was du je gesagt hast.', 'freude')]),
  ]),

  dlg('freya-eins', [
    node('a', [
      N('Eins!-Abend bei Dante. Freya spielt nicht. Freya hat die offiziellen Regeln ausgedruckt, laminiert und liest sie bei jeder Karte vor.'),
      L(F, 'Einspruch! Man darf auf eine „Plus Vier“ keine „Plus Zwei“ legen. Regel sieben, Absatz drei. Jakko, nimm die Karte zurück.', 'wut'),
      L('jakko', 'Aber dann muss ich vier ziehen! Das ist wie vier Dampfnudeln, nur traurig!', 'trauer'),
    ], {
      choices: [
        { text: '„Freya, das ist ein Kartenspiel, kein Prozess.“', next: 'prozess' },
        { text: '„Regel ist Regel. Zieh, Jakko.“', effects: [herz(F, 10), herz('jakko', -5)], next: 'regel' },
      ],
    }),
    node('prozess', [L(F, 'Alles ist ein Prozess. Das Leben ist ein Prozess. Und gerade verlierst du ihn.', 'signatur')]),
    node('regel', [L(F, 'Danke. Endlich jemand mit Rechtsverständnis.', 'freude')]),
  ]),

  dlg('freya-lio', [
    node('a', [
      N('In der Ecke spielt Lio Funkel auf seiner Gitarre. Freya sitzt auf einer Kiste davor, die Augen zu, und bewegt die Lippen mit.'),
      L(F, 'Psst. Das ist das Lied ohne Reim. Er sagt, er findet keinen Reim auf „Unterstadt“. Ich hab ihm „Unterstadt hat’s satt“ vorgeschlagen. Er hat geweint. Ich glaub, vor Freude.'),
    ], {
      choices: [
        { text: '(Zuhören, bis das Lied zu Ende ist.)', effects: [herz(F, 5), herz('lio-funkel', 5), { advanceTime: 10 }], next: 'zuhoeren' },
        { text: '„Um acht bist du im Nest, ja?“', next: 'acht' },
      ],
    }),
    node('zuhoeren', [L(F, 'Siehst du. Manche Sachen brauchen keine Regeln. Nur Ruhe. Das hab ich nicht im Gesetzbuch gelesen. Das hab ich selbst rausgefunden.')]),
    node('acht', [L(F, 'Natürlich. Um acht ist Nachtruhe. Das ist eine Regel. Ich hab sie gemacht. Also halte ich sie auch.', 'signatur')]),
  ]),

  dlg('freya-geburtstag', [
    node('a', [
      L(F, 'Heute ist ein ganz normaler Tag. Es passiert nichts Besonderes. Niemand hat Geburtstag. Ich schon gar nicht.', 'signatur'),
      N('Sie guckt dich sehr, sehr lange an. Dann noch länger.'),
    ], {
      choices: [
        { text: '„Alles Gute zum Geburtstag, Freya.“', effects: [herz(F, 20)], next: 'gratuliert' },
        { text: '„Na dann. Schönen normalen Tag.“', next: 'normal' },
      ],
    }),
    node('gratuliert', [L(F, 'Woher weißt du das?! …Daria. Das ist Geheimnisverrat. Ich verurteile sie später. Danke.', 'freude')]),
    node('normal', [L(F, 'Danke. Ja. Ganz normal. Total normal. Ich geh jetzt ganz normal weg und bin ganz normal nicht enttäuscht.', 'trauer')]),
  ]),

  dlg('freya-schweigen', [
    node('a', [
      N('Freya hält dir ein Pappschild entgegen: „KEIN KONTAKT MIT DER BESCHULDIGTEN PARTEI“.'),
      L(F, 'Ich darf nicht mit dir reden. Ich bin befangen. Und beleidigt. Hauptsächlich beleidigt.', 'wut'),
    ], {
      choices: [
        {
          text: '„Drei Dampfnudeln. Für euch drei. Als Schadensersatz.“',
          requires: { item: 'bao-dampfnudel', min: 3 },
          effects: [{ take: 'bao-dampfnudel', qty: 3 }, { reconcile: F }, herz('daria', 10), herz('jakko', 10)],
          next: 'frieden',
        },
        { text: '„Es tut mir leid.“', next: 'sorry' },
        { text: '(Gehen.)' },
      ],
    }),
    node('sorry', [L(F, 'Entschuldigung zur Kenntnis genommen. Schadensersatz steht noch aus. Drei Dampfnudeln. Das ist der Tarif.')]),
    node('frieden', [L(F, 'Vergleich angenommen. Das Verfahren wird eingestellt. Aber es bleibt in den Akten.', 'freude')]),
  ]),

  zeitHinweis('freya-zeit', [
    L(F, 'Ich hab dich aus meinem Notizbuch gestrichen. Aus der Spalte „Verdächtig“. Du stehst jetzt unter „Zeugen der Verteidigung“. Das ist die beste Spalte.', 'freude'),
  ]),

  // ------------------------------------------------------------------------------------------- Herz-Ereignisse
  dlg('dlg-he-freya-2', [
    node('a', [
      L(F, 'Einspruch! Komm sofort mit, ich brauch eine erwachsene Person als Zeugen. Du bist zwar nur so mittel erwachsen, aber du musst reichen.', 'wut'),
      N('Sie zerrt dich an der Jacke zu einem Gemüsestand. Hinter dem Tresen: Bodo Bückling, Schnurrbart wie ein Scheuerlappen, Waage wie aus einem Museum.'),
      L(F, 'Bodos Waage lügt. Die Tomaten von Babette wiegen bei ihm immer zwanzig Gramm mehr. Wenn Babette einkauft, zahlt sie für Luft.'),
      N('Bodo: „Die Waage ist geeicht, Kleine. Siehst du den Stempel? Das ist ein amtlicher Stempel.“'),
      L(F, 'Das ist ein Kronkorken, Bodo. Mit Edding.', 'signatur'),
    ], {
      choices: [
        {
          text: '(Die Waage untersuchen. Von unten.)',
          check: chk('he-freya-2-technik', 'technik', 3, ['maschine', 'beobachten']),
          next: 'magnet',
        },
        {
          text: '„Bodo, der Daumen-Trick ist älter als dein Schnurrbart.“',
          check: chk('he-freya-2-strasse', 'strasse', 3, ['beobachten', 'bluff']),
          next: 'daumen',
        },
        { text: '„Wir wiegen was, dessen Gewicht wir kennen.“', next: 'probe' },
        { text: '„Ist doch nicht unser Problem, Freya.“', next: 'egal' },
      ],
    }),
    node('magnet', [
      N('Unter der Waagschale klebt ein Magnet, so groß wie eine Faust. Er hält eine Schraube fest. Die Schraube hält das Ergebnis fest. Bodo hält die Luft an.'),
    ], { effects: [herz(F, 40)], next: 'urteil' }),
    node('daumen', [
      N('Bodo nimmt den Daumen von der Schale. Die Waage springt um zwanzig Gramm zurück. Ganz langsam, wie ein schlechtes Gewissen.'),
    ], { effects: [herz(F, 40)], next: 'urteil' }),
    node('probe', [
      L(F, 'Natürlich! Eine Nougatbombe wiegt genau fünfzig Gramm. Steht drauf. Das ist ein Eichgewicht mit Schokolade!', 'freude'),
      N('Sie legt eine angeknabberte Nougatbombe auf die Schale. Die Waage zeigt siebzig Gramm. Freya legt die Bombe wieder weg, ohne den Blick von Bodo zu nehmen.'),
      L(F, 'Und die ist schon angebissen. Sie müsste also weniger wiegen. Bodo. Erklär dich.'),
    ], { effects: [herz(F, 45)], next: 'urteil' }),
    node('egal', [
      L(F, 'Nicht unser Problem? Babette füttert uns, wenn keiner hinguckt. Wenn Bodo sie betrügt, betrügt er uns.', 'trauer'),
      L(F, 'Ich dachte, du bist auf der richtigen Seite.'),
    ], {
      choices: [
        { text: '„…Okay. Du hast recht. Lass uns was wiegen, das wir kennen.“', next: 'probe' },
        { text: '(Mit den Schultern zucken.)', effects: [herz(F, -10)] },
      ],
    }),
    node('urteil', [
      N('Bodo: „Das war … das war für die Inflation! Alle machen das!“'),
      L(F, 'Einspruch! „Alle machen das“ ist keine Verteidigung. Ich hab nachgeschlagen.', 'wut'),
      L(F, 'Urteil: Bodo zahlt Babette die Luft der letzten drei Monate zurück. Und er trägt eine Woche lang ein Schild: „ICH HAB GEMOGELT“. In Großbuchstaben.', 'signatur'),
      N('Bodo seufzt wie ein Kühlschrank, der aufgibt, und kritzelt das Schild. Ein paar Marktleute klatschen. Einer ruft: „Endlich!“'),
      L(F, 'Danke für die Zeugenaussage. Du bist gar nicht so übel. Für eine erwachsene Person.', 'freude'),
    ], { effects: [{ rep: 'unterstadt', delta: 3 }, herz('babette-bao', 10), { setFlag: 'freya_waage_geprueft' }] }),
  ]),

  dlg('dlg-he-freya-4', [
    node('a', [
      N('Mittwoch, Gerichtsgarten. Freya sitzt auf einer umgedrehten Gießkanne und kaut auf ihrem Bleistift. Neben ihr ein Beet Kohlköpfe, eines davon mit einer Lücke.'),
      L(F, 'Heute Morgen war ein Fall. Ein alter Mann hat einen Kohlkopf aus diesem Beet geklaut. Aus dem GERICHTSgarten. Das ist, als würde man der Polizei das Auto klauen.', 'besorgt'),
      L(F, 'Und weißt du, was der Richter gesagt hat? Drei Wochen Unkraut jäten. Hier. Mit Mittagessen. MIT MITTAGESSEN!'),
      L(F, 'Das ist doch keine Strafe. Das ist ein Job! Das ist … ich versteh’s nicht. Ich versteh sonst immer alles.', 'trauer'),
    ], {
      choices: [
        { text: '„Vielleicht hatte der Mann einfach Hunger.“', next: 'hunger' },
        { text: '„Regeln sind Regeln. Er hätte bestraft werden müssen.“', next: 'regeln' },
        { text: '[Ex-Wache] „Ich hab Leute für weniger einkassiert. Hat nie was besser gemacht.“', tag: '[Ex-Wache]', when: EXWACHE, next: 'erfahrung' },
        { text: '[Knast] „Ich war drin, Freya. Da lernt man nichts außer Löffel schleifen.“', tag: '[Knast]', when: KNAST, next: 'erfahrung' },
        { text: '„Frag ihn doch selbst.“', next: 'richter' },
      ],
    }),
    node('hunger', [
      L(F, 'Hunger ist kein Rechtfertigungsgrund. Steht in Paragraf zweiundvierzig.'),
      L(F, '…Aber Jakko hat immer Hunger. Und wenn Jakko einen Kohlkopf klauen würde, würde ich ihn nicht ins Gefängnis stecken. Ich würde ihm einen zweiten geben.', 'besorgt'),
      L(F, 'Oh. OH. Ist das der Trick? Dass man an Jakko denkt?', 'ueberrascht'),
    ], { effects: [herz(F, 40), { setFlag: 'freya_urteil_gnade' }], next: 'richter' }),
    node('regeln', [
      L(F, 'Genau! Danke! Regeln sind Regeln. Sonst klaut jeder Kohl, und dann gibt es keinen Kohl mehr, und dann …', 'freude'),
      L(F, '…und dann klaut jeder Kohl, weil es keinen mehr gibt. Hm. Das ist ein Kreis. Ich mag keine Kreise in der Argumentation.', 'besorgt'),
    ], { effects: [herz(F, 25), { setFlag: 'freya_urteil_regeln' }], next: 'richter' }),
    node('erfahrung', [
      L(F, 'Du … warst dabei? Auf der anderen Seite? Erzähl. Alles. Langsam. Ich schreib mit.', 'ueberrascht'),
      N('Du erzählst. Sie schreibt drei Seiten voll, ohne aufzusehen. Dann klappt sie das Notizbuch zu und schaut auf den Kohl.'),
      L(F, 'Also soll eine Strafe was reparieren. Nicht noch mehr kaputtmachen. Das steht nirgends. Das muss jemand reinschreiben.'),
    ], { effects: [herz(F, 50), { setFlag: 'freya_urteil_gnade' }], next: 'richter' }),
    node('richter', [
      N('Hinter euch raschelt es. Der Richter steht im Beet, eine Harke in der Hand, Erde auf der Robe.'),
      L('richter', 'Schuldig. …Das war ein Löwenzahn. Nicht du, Kind.'),
      L('richter', 'Der Mann hatte Hunger, ja. Aber er hat auch drei Wochen lang einen Grund, morgens aufzustehen. Und ich hab drei Wochen lang jemanden, der mir hilft. Das Gesetz sagt, was verboten ist. Wie man gerecht ist, sagt es nicht. Das muss man selbst rausfinden.'),
      L('richter', 'Wer das kann, wird eine gute Richterin. Wer das nicht kann, wird ein guter Paragraf.'),
      L(F, '…Ich will keine Paragraf werden.', 'besorgt'),
      L('richter', 'Dann iss mit uns zu Mittag. Gerichtskantine, Kohlsuppe. Der Kohl ist beschlagnahmt.'),
    ], {
      effects: [herz('richter', 15)],
      choices: [
        { text: '„Ich komm mit.“', effects: [herz(F, 15), { advanceTime: 45 }, { heal: 15 }], next: 'suppe' },
        { text: '„Geh ruhig, Freya. Ich muss weiter.“', next: 'tschuess' },
      ],
    }),
    node('suppe', [
      N('Die Kohlsuppe schmeckt nach Kohl, Gerechtigkeit und einer Prise Paragraf. Freya isst zwei Teller und fragt den Richter dabei vierundzwanzig Dinge.'),
      L(F, 'Das war der beste Mittwoch meines Lebens. Bitte nicht weitersagen. Ich hab einen strengen Ruf.', 'freude'),
    ]),
    node('tschuess', [L(F, 'Okay. Ich erzähl dir alles. Morgen. In drei Raten.', 'freude')]),
  ]),

  dlg('dlg-he-freya-6', [
    node('a', [
      N('In der Lio-Ecke ist es still. Zu still. Lio Funkel sitzt auf seiner Kiste und hält die Gitarre wie einen verletzten Vogel. Eine Saite hängt lose herunter.'),
      L('lio-funkel', 'Die G-Saite. Mitten im Refrain. Das ist kein Unfall, das ist eine Rezension.'),
      N('Freya steht daneben, die Fluchdose an die Brust gedrückt. Sie sieht aus, als würde sie gleich ein sehr schweres Urteil fällen.'),
      L(F, 'Neue Saiten kosten vierzig Credits. In der Fluchdose sind siebenunddreißig. Ich hab dreimal nachgezählt. Viermal.', 'besorgt'),
      L(F, 'Aber die Fluchdose ist für Kekse. Das steht so in der Satzung. Paragraf eins: „Für Kekse.“ Paragraf zwei: „Siehe Paragraf eins.“'),
    ], {
      choices: [
        { text: '„Satzungen kann man ändern, Frau Richterin.“', next: 'satzung' },
        { text: '„Regeln sind Regeln. Kekse sind Kekse.“', next: 'kekse' },
      ],
    }),
    node('kekse', [
      L(F, 'Ja. Genau. Kekse. …', 'trauer'),
      N('Sie guckt auf Lio. Lio guckt auf die Saite. Die Saite guckt nirgendwohin, sie ist kaputt.'),
      L(F, 'Aber Lio spielt jeden Abend für uns. Gratis. Er hat nie einen Keks verlangt. Ist es gerecht, wenn wir nur nehmen?'),
    ], { next: 'satzung' }),
    node('satzung', [
      L(F, 'Antrag auf Satzungsänderung! Die Fluchdose darf ab sofort auch für … für gute Zwecke benutzt werden. Wer ist dafür?', 'signatur'),
      N('Sie hebt die Hand. Du hebst die Hand. Lio hebt die Hand, weil alle die Hand heben.'),
      L(F, 'Angenommen! Einstimmig! …Bleibt das Problem mit den drei Credits.'),
    ], {
      choices: [
        { text: '„Ich leg die drei drauf.“', requires: { credits: 3 }, effects: [{ credits: -3 }], next: 'gekauft' },
        {
          text: '„Moment.“ (Tief Luft holen.) „Verdammter rostiger Drecksmist, Arschgeige, Kackbratze!“',
          requires: { credits: 3 }, effects: [{ credits: -3 }, { setFlag: 'fluchdose_gefuettert' }], next: 'salve',
        },
        {
          text: '(Mit dem Saitenhändler am Elektronikstand verhandeln.)',
          check: chk('he-freya-6-feilschen', 'ausstrahlung', 4, ['feilschen', 'ueberreden']),
          next: 'gehandelt',
        },
        {
          text: '(Die alte Saite knoten und mit dem Lötkolben verschmelzen.)',
          check: chk('he-freya-6-loeten', 'technik', 4, ['reparieren']),
          next: 'geflickt',
        },
        { text: '„Dann sammeln wir halt weiter. Hunter kommt um sieben.“', next: 'warten' },
      ],
    }),
    node('salve', [
      N('Der halbe Markt dreht sich um. Eine Taube fällt fast vom Dach. Lio lässt beinahe die Gitarre fallen.'),
      L(F, 'Das … waren genau drei. Präzise. Professionell. Ich bin entsetzt und beeindruckt. Bezahl.', 'ueberrascht'),
      L(F, '…Absichtliches Fluchen zur Finanzierung guter Zwecke. Das ist eine Grauzone. Ich muss das nachschlagen. Später. Ich muss jetzt erst lachen.', 'freude'),
    ], { effects: [herz(F, 20)], next: 'gekauft' }),
    node('gehandelt', [
      N('Du lehnst dich an den Elektronikstand und erzählst dem Händler von einem armen Musiker, einem Kind mit einer Fluchdose und dem Ruf, den man sich in der Unterstadt verdient. Nach zwei Minuten kosten die Saiten siebenunddreißig Credits. Und der Händler schnieft.'),
    ], { effects: [herz(F, 10)], next: 'gekauft' }),
    node('gekauft', [
      N('Freya zählt das Geld auf den Tresen, Münze für Münze, Keks-Krümel inklusive. Dann trägt sie die neuen Saiten zu Lio, mit beiden Händen, wie eine Urkunde.'),
      L(F, 'Im Namen der Fluchdose. Für gute Zwecke. Satzung Paragraf drei.', 'signatur'),
      L('lio-funkel', 'Freya … ich weiß nicht, was ich sagen soll. Ich schreib dir ein Lied. Ein ganzes. Mit Reim.'),
      L(F, 'Auf „Freya“ reimt sich nichts. Ich hab’s geprüft.', 'freude'),
      L('lio-funkel', 'Dann wird es das erste Lied ohne Reim, das sich trotzdem reimt.'),
    ], { effects: [herz(F, 40), herz('lio-funkel', 20), { setFlag: 'freya_saiten_lio' }], next: 'ende' }),
    node('geflickt', [
      N('Ein Knoten, ein Tropfen Lötzinn, ein Gebet. Lio schlägt den Akkord an. Er klingt wie eine Katze mit Schluckauf. Aber er klingt.'),
      L('lio-funkel', 'Das hält. Bis morgen. Vielleicht. Freya, kauf trotzdem die neuen. Mit deinen siebenunddreißig und ein bisschen Glück.'),
      L(F, 'Ich spare die drei Credits zusammen. Bis Freitag. Notfalls muss Hunter öfter fluchen. Ich provoziere ihn.', 'signatur'),
    ], { effects: [herz(F, 35), herz('lio-funkel', 15), { setFlag: 'freya_saiten_lio' }], next: 'ende' }),
    node('warten', [
      L(F, 'Hunter. Ja. Hunter flucht pro Stunde zweimal. Plus einmal, wenn Dante „Heiliges Kanonenrohr“ sagt.', 'signatur'),
      L(F, 'Bis morgen hab ich das Geld. Lio, du musst heute ohne G-Saite spielen. Spiel einfach traurige Lieder. Die brauchen weniger Saiten.'),
      L('lio-funkel', 'Das ist … erstaunlich zutreffend.'),
    ], { effects: [herz(F, 25), herz('lio-funkel', 10), { setFlag: 'freya_saiten_lio' }], next: 'ende' }),
    node('ende', [
      L(F, 'Weißt du, was ich heute gelernt hab? Regeln sind für Leute da. Nicht Leute für Regeln. Das schreib ich mir auf. Ganz vorne ins Buch.', 'freude'),
    ]),
  ]),

  // he-freya-8 und he-freya-10: freya-akt23.ts

  dlg('dlg-re-freya-2', [
    node('a', [
      N('An deinem Schuh klebt ein Zettel. Darauf, in Schönschrift: „STRAFZETTEL. Grund: Gemeinheit. Betrag: drei Dampfnudeln. Zahlbar an: das Kindergericht.“'),
    ]),
  ]),
);

export const part: ContentPart = {
  npcs: { [F]: npc },
  dialogues,
};
