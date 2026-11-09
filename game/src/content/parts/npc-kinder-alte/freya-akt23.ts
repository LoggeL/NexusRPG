// Freya in Akt 2, Akt 3 und im Nachspiel (world.md §4.4, §5.3–5.5, §10.4–10.6; act23.json events/flags).
// Volle Herz-Ereignisse he-freya-8 (Kindergericht über Dantes Kekse, [Ausstrahlung 5]) und he-freya-10
// (Gerichtsgarten: Geständnisse mit Glitzer im Nacken, Andenken fairness-stempel), Tagesgespräche nach Phase.
// Wird von freya.ts in NpcDef.talk/heartEvents/schedule eingehängt. Nur Freundschaft (Kind).
import type { Condition, DialogueChoice, HeartEventDef, ScheduleEntry, TalkDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import {
  A2_CHAOS, A2_FREI, A2_OFFEN, A2_PARTY, ARIA_GECHIPPT, DANTE_DA, ENDE_3B, ENDE_MEER, ENDE_NEXUS, EXWACHE, HERZ_SPAET,
  KINDER_MEER, L, MASTER, N, NACHSPIEL, NYRA_BEFREIT, PARTYNACHT, chk, dialogs, dlg, einmal, herz, node,
} from './_dsl';

const F = 'freya';
const KUSCHEL_WEG: Condition = { all: [{ flag: 'nyra_hat_kuschel' }, { notFlag: 'nyra_befreit' }, { notFlag: 'epilog' }] };
const KLAGE = { flag: 'freya_klageschrift' } as const;

/** Fluch-Wahl: kostet einen Credit für die Fluchdose. */
const fluch = (text: string, next: string, extra: DialogueChoice['effects'] = []): DialogueChoice => ({
  text, next, requires: { credits: 1 }, effects: [{ credits: -1 }, { setFlag: 'fluchdose_gefuettert' }, ...(extra ?? [])],
});

export const FREYA_HE_23: HeartEventDef[] = [
  {
    id: 'he-freya-8', hearts: 8, map: 'dantes-werkstatt', time: 'abend', when: { all: [HERZ_SPAET, { weekday: 'do' }] },
    dialogue: 'dlg-he-freya-8', effects: [{ xp: 60 }],
  },
  {
    id: 'he-freya-10', hearts: 10, map: 'eisenhof', time: 'tag', when: { all: [HERZ_SPAET, { weekday: 'mi' }] },
    dialogue: 'dlg-he-freya-10', effects: [{ xp: 80 }, { give: 'fairness-stempel' }],
  },
];

export const FREYA_TALK_FRUEH: TalkDef[] = [
  { dialogue: 'freya-master', when: MASTER },
  { dialogue: 'freya-3b', when: einmal('freya-3b', ENDE_3B) },
  { dialogue: 'freya-nachspiel', when: einmal('freya-nachspiel', NACHSPIEL) },
  { dialogue: 'freya-meer', when: { all: [KINDER_MEER, { weekday: 'sa' }, { time: 'tag' }] } },
  { dialogue: 'freya-partynacht', when: PARTYNACHT },
  { dialogue: 'freya-a2-bruch', when: einmal('freya-a2-bruch', A2_CHAOS) },
  { dialogue: 'freya-a2-aria', when: einmal('freya-a2-aria', { all: [A2_FREI, ARIA_GECHIPPT] }) },
  { dialogue: 'freya-a2-party', when: einmal('freya-a2-party', A2_PARTY) },
];

export const FREYA_TALK_POOL: TalkDef[] = [
  { dialogue: 'freya-a2-tag', when: A2_OFFEN },
  { dialogue: 'freya-a2-nervoes', when: A2_PARTY },
  { dialogue: 'freya-nachspiel-tag', when: NACHSPIEL },
];

export const FREYA_SCHEDULE_23: ScheduleEntry[] = [
  { when: PARTYNACHT, place: { map: 'das-nest', at: 'eins-kiste' } },
  { slot: ['abend', 'nacht'], when: MASTER, place: { map: 'das-nest', at: 'schlafnischen' } },
  { slot: 'tag', days: ['sa'], when: KINDER_MEER, place: { map: 'das-meer', at: 'wasserlinie' } },
];

const dialogues = dialogs(
  // ------------------------------------------------------------------------------------------- Herz-Ereignis 8
  dlg('dlg-he-freya-8', [
    node('a', [
      N('Dantes Werkstatt ist ein Gerichtssaal. Der Eins!-Tisch ist die Richterbank, ein Toaster das Mikrofon, ein Stapel Schallplatten die Geschworenenbank. Auf der Anklagebank: Dante, mit Krümeln im Bart.'),
      L(F, 'Das Kindergericht tagt! Der Angeklagte Dante wird beschuldigt, die Kekse für den Eins!-Abend gegessen zu haben. Alle. Zwölf Stück. Vor dem ersten Spiel.', 'signatur'),
      L('dante', 'Das ist eine Verleumdung! Ich hab sie … geprüft. Auf Qualität. Zwölfmal. Das ist Qualitätssicherung, Euer Ehren.'),
      L(F, 'Notiert: Der Angeklagte gesteht die Prüfung. {name}, du bist als Verteidigung bestellt. Daria ist Anklage. Jakko ist Zeuge. Captain Kuschel ist Gerichtsdiener.'),
    ], {
      choices: [
        { text: '„Wo ist denn der Gerichtsdiener?“', when: KUSCHEL_WEG, next: 'kuschel-weg' },
        { text: '„Die Verteidigung ist bereit, Euer Ehren.“', next: 'beweise' },
      ],
    }),
    node('kuschel-weg', [
      L(F, 'Der Gerichtsdiener ist … verhindert. Er ist bei Nyra. Im Turm. Das ist ein Dienstauftrag.', 'trauer'),
      N('Sie legt die Hand kurz auf das leere Regal, wo der Hase sonst sitzt. Dann setzt sie einen Toaster auf seinen Platz.'),
      L(F, 'Der Toaster vertritt ihn. Kommissarisch. Bis Captain Kuschel zurück ist. Mit Nyra. Das ist kein Wunsch. Das ist eine Verfügung.', 'signatur'),
      L('dante', 'Ich hab den Toaster gebaut. Er ist sehr gerecht. Er verbrennt alles gleich.'),
    ], { effects: [herz(F, 10)], next: 'beweise' }),
    node('beweise', [
      L(F, 'Beweisaufnahme! Die Verteidigung darf Beweise vorlegen. Oder Zeugen befragen. Oder einfach gut aussehen. Das hilft beim Richter nicht. Bei mir ein bisschen.'),
      L('daria', 'Die Anklage hat Krümel! Im Bart! Mehr braucht die Anklage nicht!', 'signatur'),
    ], {
      choices: [
        {
          text: '(Die Krümel unter Dantes Lupe legen.) „Zwei Sorten Krümel, Euer Ehren. Butterkeks. Und … Schokolade mit Chili.“',
          check: chk('he-freya-8-kruemel', 'technik', 4, ['untersuchen', 'beweis']),
          next: 'zwei-sorten',
        },
        {
          text: '(Den Zeugen in die Zange nehmen.) „Jakko, was knistert da in deiner Jackentasche?“',
          check: chk('he-freya-8-zeuge', 'strasse', 4, ['verhoer', 'beobachten']),
          next: 'jakko',
        },
        { text: '„Ich rufe den Zeugen Jakko auf. Jakko, hast du Hunger?“', next: 'jakko-frage' },
      ],
    }),
    node('zwei-sorten', [
      L('dante', 'Chili? Ich hab keine Chilikekse gebacken. Die waren für nächste Woche. Die lagen im Schrank. Im versteckten Schrank.', 'ueberrascht'),
      N('Alle Köpfe drehen sich zu Jakko. Jakko hat rote Ohren. Und Schokolade am Ohr.'),
    ], { effects: [herz(F, 20)], next: 'jakko' }),
    node('jakko-frage', [
      L('jakko', 'Immer! … Moment. Das war eine Fangfrage.', 'ueberrascht'),
    ], { next: 'jakko' }),
    node('jakko', [
      L('jakko', 'Okay, OKAY! Ich hab die Chilikekse gegessen! Drei! Aber nur, weil Dante die zwölf anderen schon weg hatte und ich dachte, die gehören jetzt allen!', 'trauer'),
      L(F, 'Mitangeklagter! Wir haben einen Mitangeklagten! Das ist das beste Verfahren seit dem Kohl!', 'freude'),
      L(F, 'Die Verteidigung hat das Schlusswort. Danach urteile ich. Hart. Aber gerecht. Aber hart.'),
    ], {
      choices: [
        {
          text: '„Hohes Gericht: Wer hat die Kekse gebacken? Dante. Wer hat sie je bezahlt bekommen? Niemand. Das ist kein Diebstahl, das ist Lohn. Und Jakko ist ein Kind im Wachstum. Das ist kein Verbrechen, das ist Biologie.“',
          check: chk('he-freya-8-plaedoyer', 'ausstrahlung', 5, ['ueberreden', 'buehne']),
          next: 'freispruch',
        },
        { text: '„Ich bitte um Gnade vor Recht. Sie haben es gestanden. Sie backen neue, zusammen, und wir gucken zu.“', next: 'gnade' },
        { text: '„Beide schuldig. Guck dir den Bart an. Und das Ohr.“', next: 'schuldig' },
      ],
    }),
    node('freispruch', [
      L(F, '… Das ist ein gutes Argument. Ein sehr gutes. Verdammt.', 'ueberrascht'),
      L(F, 'Das macht einen Keks. Für mich. Ich zahl in die eigene Dose. Freispruch für beide! Wegen Lohn und Biologie!'),
      L('dante', 'Gerechtigkeit! Heiliges Kanonenrohr, Gerechtigkeit!', 'freude'),
      L('jakko', 'Heißt das, ich darf noch einen?', 'freude'),
      L(F, 'Nein. Freispruch heißt nicht Nachschlag. Das ist ein Grundsatz.'),
    ], { effects: [herz(F, 50), herz('dante', 20), herz('jakko', 10), { setFlag: 'freya_urteil_freispruch' }], next: 'nachdenken' }),
    node('gnade', [
      L(F, 'Gnade vor Recht … das steht in keinem Buch, das ich hab. Aber der Richter sagt das manchmal. Wenn er müde ist. Oder wenn er recht hat.', 'besorgt'),
      L(F, 'Urteil: Die Angeklagten backen vierundzwanzig neue Kekse. Unter Aufsicht des Gerichts. Das Gericht probiert. Zur Qualitätssicherung.', 'signatur'),
      L('dante', 'Das ist das schönste Urteil, das je über mich gefällt wurde. Und ich hab schon ein paar gehört.', 'freude'),
    ], { effects: [herz(F, 60), herz('dante', 15), herz('jakko', 15), { setFlag: 'freya_urteil_gnade' }], next: 'nachdenken' }),
    node('schuldig', [
      L('dante', 'Verrat! Von der eigenen Verteidigung! Ich hätte mir einen Toaster nehmen sollen!'),
      L(F, 'Urteil: schuldig. Beide. Strafe: Sie backen neue. Vierundzwanzig. Und wir gucken zu, damit keiner prüft.', 'signatur'),
      L('jakko', 'Ich bin vorbestraft! Mit zehn! Das ist so cool! Und so traurig!', 'trauer'),
    ], { effects: [herz(F, 40), herz('dante', -10), { setFlag: 'freya_urteil_schuldig' }], next: 'nachdenken' }),
    node('nachdenken', [
      N('Später, als es nach frischem Teig riecht und Dante Jakko das Rühren beibringt, setzt sich Freya neben dich. Sie hat ihr Notizbuch auf dem Schoß und schreibt nicht.'),
      L(F, 'Weißt du, was komisch ist? Ich hab immer gedacht, Gerechtigkeit ist, wenn alle sich an die Regeln halten. Aber die mit dem Glitzer im Nacken, die haben sich an alle Regeln gehalten. An jede einzelne.', 'besorgt'),
      L(F, 'Und das ist nicht gerecht. Das ist nur … ordentlich.'),
    ], {
      choices: [
        { text: '„Regeln sind ein Werkzeug, Freya. Gerechtigkeit ist, wofür man es benutzt.“', next: 'werkzeug' },
        { text: '„Deshalb braucht’s Leute wie dich. Die Einspruch sagen.“', next: 'einspruch' },
      ],
    }),
    node('werkzeug', [
      L(F, 'Ein Werkzeug. Wie Dantes Lötkolben. Man kann damit was reparieren. Oder sich die Finger verbrennen.', 'zaertlich'),
      L(F, 'Das schreib ich auf. Seite eins. Über die alte Seite eins drüber.'),
    ], { effects: [herz(F, 20), { setFlag: 'freya_kindergericht' }] }),
    node('einspruch', [
      L(F, 'Einspruch kann jeder sagen. Man muss nur wissen, wann. Und laut genug sein. Ich bin sehr laut.', 'signatur'),
    ], { effects: [herz(F, 20), { setFlag: 'freya_kindergericht' }] }),
  ]),

  // ------------------------------------------------------------------------------------------- Herz-Ereignis 10
  dlg('dlg-he-freya-10', [
    node('start', [N('Mittwoch im Gerichtsgarten. Zwischen den Kohlbeeten stehen die Bänke des Bagatellgerichts. Freya sitzt in der ersten Reihe und hat das Notizbuch schon aufgeschlagen.')], {
      choices: [
        { text: '(Zur Verhandlung setzen.)', when: { notFlag: 'epilog' }, next: 'a' },
        { text: '(Zur Verhandlung setzen.)', when: { flag: 'epilog' }, next: 'a-nachspiel', id: 'setzen-nachspiel' },
      ],
    }),
    node('a-nachspiel', [
      N('Die Bänke sind voll. Seit die Chips aus sind, kommen viele hierher, um sich selbst anzuzeigen. Für Dinge, die sie getan haben, als sie noch „Master“ gesagt haben.'),
      N('Vor dem Richter steht ein Mann im Overall. Im Nacken eine kleine Narbe. Er hat, mit Chip, seine Nachbarn bei Quantum gemeldet. Alle elf. Er will bestraft werden. Hart.'),
      N('Mann im Overall: „Ich war es. Ich hab die Liste geschrieben. Mit meiner Hand. Bitte, Euer Ehren. Ich kann nicht schlafen.“'),
      L('richter', 'Ein Geständnis. Klar und frei. Das Gesetz ist eindeutig, so leid es mir tut.', 'trauer'),
      L(F, 'EINSPRUCH!', 'wut'),
      N('Freya steht auf der Zuschauerbank. Ihre Stimme zittert, aber sie steht.'),
      L(F, 'Euer Ehren, das war nicht er. Das war der Chip. Wenn man jemandem die Hand führt, ist nicht die Hand schuld. Steht vielleicht in keinem Buch. Sollte aber.'),
    ], {
      choices: [
        {
          text: '(Vortreten.) „Euer Ehren, fragen Sie ihn, ob er die Liste heute noch einmal schreiben würde.“',
          check: chk('he-freya-10-plaedoyer', 'ausstrahlung', 6, ['ueberreden', 'gericht']),
          next: 'n-frage',
        },
        {
          text: '„Die Chips sind tot, aber ihr Protokoll steckt noch drin. Da steht, wer die Befehle gegeben hat. Und das war nicht er.“',
          check: chk('he-freya-10-chip', 'technik', 5, ['implantat', 'beweis']),
          next: 'n-protokoll',
        },
        {
          text: '„Verfahrensordnung Paragraf sechsunddreißig: Handlungen unter fremdem Einfluss sind nicht schuldhaft. Das hab ich jahrelang selbst runtergebetet.“',
          tag: '[Ex-Wache]', when: EXWACHE, next: 'n-paragraf',
        },
        { text: '(Neben Freya treten und nichts sagen. Nur da sein.)', next: 'n-allein' },
      ],
    }),
    node('n-frage', [
      L('richter', 'Herr Angeklagter. Würden Sie die Liste heute noch einmal schreiben?'),
      N('Mann im Overall: „Nie. Ich würde sie verbrennen. Ich würde jeden Einzelnen warnen.“'),
      N('Er weint. Auf den Bänken nicken Leute, die genau wissen, wie sich das anfühlt.'),
    ], { effects: [herz(F, 40)], next: 'urteil-nachspiel' }),
    node('n-protokoll', [
      N('Du bittest den Mann, sich umzudrehen, und hältst Dantes kleinen Scanner an die Narbe. Auf dem Display laufen Zeilen durch. Befehl, Befehl, Befehl. Absender immer derselbe: MASTER.'),
      L('richter', 'Das Gericht nimmt das als Beweis auf. Ich verstehe nichts davon. Aber ich verstehe das Wort „Absender“.', 'besorgt'),
    ], { effects: [herz(F, 40)], next: 'urteil-nachspiel' }),
    node('n-paragraf', [
      L('richter', 'Sechsunddreißig … Den hat seit Jahren keiner mehr zitiert. Den hat seit Jahren keiner mehr gebraucht. Jetzt brauchen wir ihn jeden Tag.', 'besorgt'),
      L(F, 'Sie kennen den auswendig? Ich will den auch auswendig. Kannst du mir den aufschreiben? Mit Kommas?', 'ueberrascht'),
    ], { effects: [herz(F, 40)], next: 'urteil-nachspiel' }),
    node('n-allein', [
      N('Freya merkt, dass du neben ihr stehst. Sie atmet einmal tief ein. Dann redet sie weiter. Lauter.'),
      L(F, 'Euer Ehren, Sie haben mir mal gesagt, Strafe soll was heilen. Was heilt das, wenn er ins Loch kommt? Lassen Sie ihn den elf Nachbarn helfen. Jedem einzeln. Das heilt was.', 'signatur'),
      N('Der Richter nimmt die Brille ab. Er reibt sich die Augen. Dann sieht er den Mann an, und den Saal, und zum Schluss Freya.'),
    ], { effects: [herz(F, 70)], next: 'urteil-nachspiel' }),
    node('urteil-nachspiel', [
      L('richter', 'Das Gericht stellt fest: Was jemand unter fremdem Willen getan hat, ist nicht seine Schuld. Aber er darf helfen, es wiedergutzumachen. Wer will, kommt mittwochs her und tut das.', 'besorgt'),
      L('richter', 'Schreib das auf, Freya. Du hast die schönere Schrift. Wir nennen es … Lex Freya.'),
      L(F, 'Lex … Freya. Das ist Latein. Ich hab ein Gesetz. Mit meinem Namen. Ich bin zehn und hab ein Gesetz.', 'ueberrascht'),
    ], { next: 'zeremonie' }),
    node('a', [
      N('Mittwoch, Bagatellgericht im Gerichtsgarten. Die Bänke sind voll, aber es ist zu still. Viele der Zuschauer sitzen kerzengerade und lächeln. Im Nacken glitzert es.'),
      N('Vor dem Richter steht ein Mann im Overall. Ihm wird vorgeworfen, eine Laterne geklaut zu haben. Die Laterne steht noch da. Man sieht sie von hier.'),
      N('Mann im Overall: „Ich bekenne mich schuldig, Master. Es ist eine ausgezeichnete Entscheidung, mich zu verurteilen.“'),
      L('richter', 'Na also. Ein Geständnis. Das spart Zeit. Ich hab heute noch vierzig Fälle und einen Rosenkohl, der nicht von allein wächst.'),
      L(F, 'EINSPRUCH!', 'wut'),
      N('Freya steht auf der Zuschauerbank. Ihre Stimme zittert, aber sie steht.'),
      L(F, 'Euer Ehren, der Mann hat Glitzer im Nacken. Das Geständnis zählt nicht. Der sagt zu allem Ja. Gestern hat er zu einer Mülltonne „Master“ gesagt. Ich war dabei. Ich hab’s protokolliert.'),
      L('richter', 'Freya. Kind. Ein Geständnis ist ein Geständnis. So steht es im Gesetz.'),
    ], {
      choices: [
        {
          text: '(Vortreten.) „Euer Ehren, ein Geständnis gilt nur, wenn es frei ist. Fragen Sie ihn, wie die Laterne aussieht. Die da drüben.“',
          check: chk('he-freya-10-plaedoyer', 'ausstrahlung', 6, ['ueberreden', 'gericht']),
          next: 'laterne',
        },
        {
          text: '(Dem Mann in den Nacken sehen.) „Chrome-10-Leuchtdiode, blinkt im Sekundentakt. Der Chip sendet. Der redet gar nicht selbst.“',
          check: chk('he-freya-10-chip', 'technik', 5, ['implantat', 'beweis']),
          next: 'chip',
        },
        {
          text: '„Verfahrensordnung Paragraf sechsunddreißig: Aussagen unter Einfluss sind auszusetzen. Das hab ich jahrelang selbst runtergebetet.“',
          tag: '[Ex-Wache]', when: EXWACHE, next: 'paragraf',
        },
        { text: '(Neben Freya treten und nichts sagen. Nur da sein.)', next: 'freya-allein' },
      ],
    }),
    node('laterne', [
      L('richter', 'Na gut. Herr Angeklagter: Welche Farbe hat die Laterne?'),
      N('Mann im Overall: „Die Laterne hat die Farbe, die Master empfiehlt.“'),
      N('Es wird sehr still im Garten. Sogar der Rosenkohl hört zu.'),
    ], { effects: [herz(F, 40)], next: 'urteil' }),
    node('chip', [
      N('Du schiebst den Kragen des Mannes zur Seite. Im Nacken, unter der Haut, blinkt ein lila Punkt. Einmal pro Sekunde, wie ein Herzschlag, der nicht ihm gehört.'),
      L('richter', 'Das … das hab ich auch bei meinem Gerichtsdiener gesehen. Ich dachte, das ist Mode.', 'ueberrascht'),
    ], { effects: [herz(F, 40)], next: 'urteil' }),
    node('paragraf', [
      L('richter', 'Sechsunddreißig … Den hat seit Jahren keiner mehr zitiert. Den hat seit Jahren keiner mehr gebraucht.', 'besorgt'),
      L(F, 'Sie kennen den auswendig? Ich will den auch auswendig. Kannst du mir den aufschreiben? Mit Kommas?', 'ueberrascht'),
    ], { effects: [herz(F, 40)], next: 'urteil' }),
    node('freya-allein', [
      N('Freya merkt, dass du neben ihr stehst. Sie atmet einmal tief ein. Dann redet sie weiter. Lauter.'),
      L(F, 'Euer Ehren, Sie haben mir mal gesagt, ein Richter muss zuhören, auch wenn keiner was sagt. Der Mann sagt nichts. Sein Chip redet. Hören Sie zu, wer hier wirklich spricht!', 'signatur'),
      N('Der Richter nimmt die Brille ab. Er reibt sich die Augen. Dann sieht er den Mann im Overall lange an, und der Mann lächelt zurück, genau gleich lang, genau gleich breit.'),
    ], { effects: [herz(F, 70)], next: 'urteil' }),
    node('urteil', [
      L('richter', 'Das Gericht setzt das Verfahren aus. Und ab heute gilt am Bagatellgericht: Geständnisse mit Glitzer im Nacken sind unzulässig.', 'besorgt'),
      L('richter', 'Schreib das auf, Freya. Du hast die schönere Schrift. Wir nennen es … Lex Freya.'),
      L(F, 'Lex … Freya. Das ist Latein. Ich hab ein Gesetz. Mit meinem Namen. Ich bin zehn und hab ein Gesetz.', 'ueberrascht'),
    ], { next: 'zeremonie' }),
    node('zeremonie', [
      N('Nach der Sitzung, zwischen den Beeten, hält der Richter ein kleines Holzkästchen in der Hand.'),
      L('richter', 'Für Verdienste um die Gerechtigkeit auf dem Schrottmarkt, die Fluchdose, den Kohl und heute: der Ehrenstempel des Bagatellgerichts. Junior-Ausführung.'),
      L(F, 'Danke, Euer Ehren. Ich hab eine Rede vorbereitet. Elf Seiten. Ich lass sie weg. Nein. Eine Seite les ich. Nein. Ich lass sie weg.', 'freude'),
      N('Dann dreht sie sich zu dir und drückt dir einen Stempel in die Hand. Geschnitzt aus einer halben Kartoffel, mit Lack überzogen, damit er hält. Darauf: ein Herz. Es ist schief.'),
      L(F, 'Der Fairness-Stempel. Für dich. Das Herz ist schief, weil Gerechtigkeit auch schief ist. Aber es ist ein Herz. Das ist der Punkt.', 'zaertlich'),
      L(F, 'Wer den hat, muss fair sein. Und darf Einspruch sagen. Aber nur, wenn’s wichtig ist. Heute war’s wichtig.'),
    ], {
      effects: [{ setFlag: 'lex_freya' }, herz('richter', 30), { rep: 'unterstadt', delta: 5 }],
      choices: [
        { text: '„Einspruch, Euer Ehren: Das ist zu viel Ehre für mich.“', next: 'zuviel' },
        { text: '„Ich pass gut drauf auf, Freya. Und auf dich.“', next: 'danke' },
        fluch('„Heilige Scheiße, Freya. Du hast ein Gesetz.“', 'fluch'),
      ],
    }),
    node('zuviel', [L(F, 'Einspruch abgelehnt. Du hast ihn dir verdient. Ich hab nachgeschlagen. Unter „F“ wie „fair“ und unter „{name}“.', 'freude')]),
    node('danke', [L(F, 'Weiß ich. Sonst hätte ich ihn dir nicht gegeben. Ich bin eine gute Menschenkennerin. Fast so gut wie Captain Kuschel.', 'zaertlich')]),
    node('fluch', [
      L(F, 'Das macht einen Credit. Für die Dose.', 'signatur'),
      L(F, '… Aber ja. Heilige Sch… – das macht auch einen. Ich zahl selbst. Heute ist ein Feiertag.', 'freude'),
    ], { effects: [herz(F, 10)] }),
  ]),

  // ------------------------------------------------------------------------------------------- Akt 2
  dlg('freya-a2-bruch', [
    node('a', [
      N('Freya sitzt mit gerunzelter Stirn über einem Blatt, auf dem oben in Schönschrift steht: „KLAGESCHRIFT“.'),
      L(F, 'Ich hab gehört, was passiert ist. Nyra ist im Turm. Gegen ihren Willen. Das ist Freiheitsberaubung. Und Aria … die haben ihr was eingebaut, das sie nicht wollte. Das ist Körperverletzung. Mindestens.', 'wut'),
      L(F, 'Ich verklage Quantum. Ich weiß, dass ich zehn bin. Im Gesetzbuch steht nirgends, dass Zehnjährige nicht klagen dürfen. Ich hab’s dreimal gelesen. Seite vierzehn fehlt, aber da steht bestimmt nichts Wichtiges.'),
    ], {
      effects: [{ markSeen: 'freya-a2-bruch' }],
      choices: [
        { text: '(Unterschreiben.) „Ich bin Zeuge. Schreib meinen Namen drunter.“', effects: [{ setFlag: 'freya_klageschrift' }, herz(F, 30)], next: 'unterschrift' },
        { text: '„Quantum hat hundert Anwälte, Freya.“', next: 'anwaelte' },
        fluch('„Scheiße, Freya. Es tut mir so leid.“', 'fluch'),
      ],
    }),
    node('unterschrift', [
      L(F, 'Zeuge. Gut. Zeugen sind wichtiger als Anwälte. Anwälte reden. Zeugen waren dabei.', 'signatur'),
      L(F, 'Ich bring sie zum Richter, wenn das alles vorbei ist. Wenn es dann noch einen Richter gibt, der keinen Glitzer im Nacken hat.'),
    ]),
    node('anwaelte', [
      L(F, 'Hundert Anwälte. Und ich hab einen Bleistift. Der ist schon kurz.', 'trauer'),
      L(F, 'Aber im Gericht zählt nicht, wer mehr Anwälte hat. Da zählt, wer recht hat. Das hat der Richter gesagt. Ich glaub ihm. Ich muss.'),
    ], {
      choices: [
        { text: '„Dann unterschreib ich. Als Zeuge.“', effects: [{ setFlag: 'freya_klageschrift' }, herz(F, 30)], next: 'unterschrift' },
        { text: '„Behalt sie. Für später.“' },
      ],
    }),
    node('fluch', [
      L(F, 'Das macht einen Credit. … Ausnahmsweise darf man heute fluchen. Ich hab’s auch gemacht. Zweimal. Ich hab mir selbst eine Rechnung geschrieben.', 'trauer'),
    ], { effects: [herz(F, 10)], next: 'a-nochmal' }),
    node('a-nochmal', [L(F, 'Unterschreibst du? Als Zeuge?')], {
      choices: [
        { text: '„Ja.“', effects: [{ setFlag: 'freya_klageschrift' }, herz(F, 30)], next: 'unterschrift' },
        { text: '„Später.“' },
      ],
    }),
  ]),

  dlg('freya-a2-aria', [
    node('a', [
      L(F, 'Aria ist wieder da! Sie hat beim Reinkommen dreimal geflucht. Das macht drei Credits.', 'freude'),
      L(F, 'Ich hab sie ihr erlassen. Einmalig. Gnade vor Recht. Das hab ich von dir. Und Dante ist jetzt bei euch. Der Angeklagte von neulich. Ich hoffe, er hat sich gebessert.', 'signatur'),
    ], {
      effects: [{ markSeen: 'freya-a2-aria' }, herz(F, 10)],
      choices: [
        { text: '„Er hat Aria das Leben gerettet.“', next: 'gerettet' },
        { text: '„Er hat gestern wieder alle Kekse geprüft.“', when: DANTE_DA, next: 'kekse' },
      ],
    }),
    node('gerettet', [L(F, 'Dann wird die Vorstrafe gelöscht. Das darf ich. Ich hab die Akten. Die Akten sind ein Schuhkarton, aber es sind Akten.', 'zaertlich')]),
    node('kekse', [L(F, 'Rückfall. Ich eröffne ein neues Verfahren. Aber erst nach dem Eins!. Prioritäten.', 'signatur')]),
  ]),

  dlg('freya-a2-tag', [
    node('a', [
      N('Freya hält die Fluchdose in der Hand und schüttelt sie. Es klappert kaum.'),
      L(F, 'Die Fluchdose ist fast leer. Seit alle Chrome 10 haben, flucht keiner mehr. Die sagen alle nur noch „Danke“ und „sehr gern“ und „ausgezeichnete Entscheidung“.', 'besorgt'),
      L(F, 'Das ist unheimlich. Ich hab nie gedacht, dass ich das mal sag: Flucht doch mal einer!'),
    ], {
      choices: [
        fluch('„Verdammte Scheiße noch mal, Freya.“', 'erleichtert', [herz(F, 15)]),
        fluch('„Diese verdammten Quantum-Arschgeigen.“', 'erleichtert', [herz(F, 15)]),
        { text: '„Ich fluch nicht. Ich hab Manieren.“', next: 'manieren' },
        { text: '„Was macht der Richter?“', next: 'richter' },
        { text: '„Bis dann, Euer Ehren.“', effects: [herz(F, 5)] },
      ],
    }),
    node('erleichtert', [
      N('Freya schließt die Augen, als würde sie Musik hören.'),
      L(F, 'Danke. Ein echter Mensch. Mit echten Schimpfwörtern. Das macht einen Credit. Den nehm ich mit Freude.', 'freude'),
    ]),
    node('manieren', [L(F, 'Manieren sind gut. Aber Manieren und Glitzer sehen gerade gleich aus. Pass auf, dass keiner dich verwechselt.', 'besorgt')]),
    node('richter', [
      L(F, 'Der Richter jätet mehr Beete als sonst. Er sagt, im Gericht sagen alle nur noch Ja. Das ist das langweiligste Gericht der Welt.', 'trauer'),
      L(F, 'Ich geh trotzdem jeden Mittwoch hin. Einer muss Einspruch sagen.', 'signatur'),
    ]),
  ]),

  dlg('freya-a2-party', [
    node('a', [
      L(F, 'Daria hat gesagt, ihr geht auf diese Party. Mit falschen Ausweisen. Und einer gefälschten Gästeliste.', 'besorgt'),
      L(F, 'Das ist Urkundenfälschung. Paragraf zweihundertsiebenundsechzig. Ich hab’s nachgeschlagen. Ich wollte es nicht nachschlagen. Ich hab’s trotzdem gemacht.'),
    ], {
      effects: [{ markSeen: 'freya-a2-party' }],
      choices: [
        {
          text: '„Manchmal muss man eine Regel brechen, damit tausend andere wieder was bedeuten. Die da oben chippen die ganze Stadt, Freya.“',
          check: chk('freya-a2-party-regel', 'ausstrahlung', 5, ['ueberreden']),
          next: 'verstanden',
        },
        { text: '„Du hast recht. Es ist Fälschung. Wir machen es trotzdem.“', next: 'ehrlich' },
        { text: '„Du hast nichts gehört.“', next: 'taub' },
      ],
    }),
    node('verstanden', [
      L(F, 'Notstand. Das heißt Notstand. Steht auf Seite zweihundertachtundsiebzig. Wenn man was Schlimmes tut, um was viel Schlimmeres zu verhindern.', 'ueberrascht'),
      L(F, 'Das Kindergericht erkennt auf Notstand. Einstimmig. Ich bin einstimmig.', 'signatur'),
    ], { effects: [herz(F, 30)], next: 'segen' }),
    node('ehrlich', [
      L(F, 'Wenigstens lügst du nicht. Das rechne ich an. Strafmildernd.', 'trauer'),
    ], { effects: [herz(F, 20)], next: 'segen' }),
    node('taub', [
      L(F, 'Ich hab nichts gehört. Ich bin taub. Vorübergehend. Bis Montag.', 'signatur'),
    ], { effects: [herz(F, 10)], next: 'segen' }),
    node('segen', [
      N('Freya nimmt deine Hand und drückt einen Stempel auf den Handrücken. Ein kleines, schiefes Herz in Stempelfarbe.'),
      L(F, 'Das Siegel des Kindergerichts. Wer das hat, darf Einspruch sagen. Auch da oben. Auch bei Blade. Besonders bei Blade.', 'zaertlich'),
    ], {
      effects: [{
        checkBuff: { id: 'buff-freya-siegel', label: 'Siegel des Kindergerichts', value: 1, attribute: 'ausstrahlung', consumes: true },
      }],
    }),
  ]),

  dlg('freya-a2-nervoes', [
    node('a', [
      N('Freya hat ihr Notizbuch neu sortiert. Alphabetisch. Dann nach Farbe. Dann wieder alphabetisch.'),
      L(F, 'Ich hab eine Liste gemacht. „Was alles schiefgehen kann.“ Die ist sechsundvierzig Punkte lang. Punkt siebenundvierzig ist „Dante fängt an zu singen“.', 'besorgt'),
    ], {
      choices: [
        { text: '„Mach eine zweite Liste. Was alles klappen kann.“', next: 'zweite' },
        fluch('„Scheiß auf die Liste.“', 'scheiss'),
      ],
    }),
    node('zweite', [
      L(F, 'Die hat bisher einen Punkt: „{name} ist dabei.“ Das ist ein guter Punkt. Ich unterstreiche ihn. Zweimal.', 'zaertlich'),
    ], { effects: [herz(F, 10)] }),
    node('scheiss', [
      L(F, 'Das macht einen Credit. … Und es hilft. Komisch. Fluchen hilft. Das sag ich keinem.', 'freude'),
    ], { effects: [herz(F, 5)] }),
  ]),

  // ------------------------------------------------------------------------------------------- Akt 3
  dlg('freya-partynacht', [
    node('a', [
      N('Freya sitzt vor dem flackernden Fernseher im Nest, die Klageschrift auf dem Schoß, und schreibt jede Lüge mit, die auf NX-1 gesagt wird. Die Liste ist schon zwei Seiten lang.'),
      L(F, 'Beweismittel. Für später. Wenn sie da oben was Fieses machen, steht es hier drin. Mit Uhrzeit.', 'signatur'),
      L(F, 'Pass auf dich auf. Das ist eine gerichtliche Anordnung.', 'besorgt'),
    ], { effects: [herz(F, 5)] }),
  ]),

  // ------------------------------------------------------------------------------------------- Nachspiel
  dlg('freya-nachspiel', [
    node('a', [
      L(F, 'Du bist zurück. Das Gericht stellt fest: Du bist zurück. Mit allen Gliedmaßen. Ich hab nachgezählt.', 'freude'),
    ], {
      effects: [{ markSeen: 'freya-nachspiel' }, herz(F, 20)],
      choices: [
        { text: '„Was ist mit deiner Klageschrift?“', when: KLAGE, next: 'klage' },
        { text: '„Nyra ist wieder da.“', when: NYRA_BEFREIT, next: 'nyra' },
        { text: '„Nexus ist jetzt eine Helfer-KI.“', when: ENDE_NEXUS, next: 'nexus' },
        { text: '„Wir waren am Meer.“', when: ENDE_MEER, next: 'meer' },
        { text: '„Alles gut, Freya?“', next: 'gut' },
      ],
    }),
    node('klage', [
      L(F, 'Der Richter hat sie angenommen! Er hat gesagt: „Klage zulässig, Beklagte flüchtig, Kläger zehn Jahre alt, Gericht beeindruckt.“', 'freude'),
      L(F, 'Und dann hat er sie in einen Rahmen gehängt. Im Gerichtsgarten. Neben dem Rosenkohl. Mit deiner Unterschrift drauf. Du bist jetzt aktenkundig.', 'signatur'),
    ], { effects: [herz(F, 20)], next: 'a2' }),
    node('nyra', [
      L(F, 'Und Captain Kuschel? Ist der Gerichtsdiener auch zurück?', 'besorgt'),
      L(F, '… Gut. Dann kann der Toaster in Rente. Er hat seinen Dienst getan. Er hat dreimal Brot verbrannt, aber gerecht.'),
    ], { next: 'a2' }),
    node('nexus', [
      L(F, 'Eine KI, die hilft. Hm. Ich hab ihr drei Fragen gestellt. Sie hat alle richtig beantwortet und sich bedankt. Das ist verdächtig höflich.', 'besorgt'),
      L(F, 'Ich hab sie unter Bewährung gestellt. Ein Jahr. Wenn sie in einem Jahr noch keinen gechippt hat, darf sie „Freya“ zu mir sagen. Bis dahin: „Euer Ehren“.', 'signatur'),
    ], { next: 'a2' }),
    node('meer', [
      L(F, 'Am Meer. Gibt es da Regeln? Wer darf wo liegen? Wem gehört eine Welle?', 'ueberrascht'),
      L(F, 'Ich muss da hin. Dringend. Rein beruflich.'),
    ], {
      choices: [
        { text: '„Samstag. Ihr drei kommt mit.“', effects: [{ setFlag: 'kinder_meer_dabei' }, herz(F, 30), herz('daria', 20), herz('jakko', 20)], next: 'samstag' },
        { text: '„Bald, Freya.“', next: 'a2' },
      ],
    }),
    node('samstag', [L(F, 'Ich bring das Gesetzbuch mit. Und Sonnencreme. Und ein Stempelkissen. Falls das Meer unterschreiben muss.', 'freude')], { next: 'a2' }),
    node('gut', [L(F, 'Alles gut. Fast. Die Fluchdose ist wieder voll. Das ist das beste Zeichen, das es gibt. Die Leute fluchen wieder. Die Stadt ist zurück.', 'zaertlich')]),
    node('a2', [L(F, 'Sonst noch was für das Protokoll?')], {
      choices: [
        { text: '„Was ist mit deiner Klageschrift?“', when: KLAGE, next: 'klage', once: true, id: 'n-klage' },
        { text: '„Wir waren am Meer.“', when: ENDE_MEER, next: 'meer', once: true, id: 'n-meer' },
        { text: '„Nichts mehr, Euer Ehren.“', next: 'gut' },
      ],
    }),
  ]),

  dlg('freya-nachspiel-tag', [
    node('a', [
      N('Freya hat am Fundbüro der Bande einen eigenen Schreibtisch: eine umgedrehte Kiste mit dem Schild „EINGANGSBUCH · RECHTSAUSKUNFT (KOSTENLOS, NUR HEUTE, JEDEN TAG)“.'),
      L(F, 'Bürgerberatung. Seit die Chips raus sind, wissen viele nicht mehr, was sie unterschrieben haben. Ich lese es ihnen vor. Meistens ist es schlimm.', 'signatur'),
    ], {
      choices: [
        { text: '„Was hast du heute verhandelt?“', next: 'fall' },
        { text: '„Gilt die Lex Freya noch?“', when: { flag: 'lex_freya' }, next: 'lex' },
        { text: '„Wie war das Meer?“', when: { flag: 'kinder_meer_dabei' }, next: 'meer' },
        fluch('„Verdammt, du bist die Beste.“', 'fluch'),
        { text: '„Bis später.“', effects: [herz(F, 5)] },
      ],
    }),
    node('fall', [
      L(F, 'Ein Mann wollte seinen Chrome-10-Vertrag kündigen. Der Vertrag hatte vierhundert Seiten. Auf Seite dreihundertneunundneunzig stand: „Kündigung nur durch Master“.', 'wut'),
      L(F, 'Ich hab Einspruch eingelegt. Bei Quantum. Per Taubenpost. Die Taube ist noch nicht zurück. Ich glaube, sie hat Angst.'),
    ]),
    node('lex', [L(F, 'Gilt. Für immer. Der Richter hat sie in den Kohl geschnitzt. Wenn der Kohl wächst, wächst das Gesetz mit.', 'freude')]),
    node('meer', [L(F, 'Am Meer gibt es keine Regeln. Ich hab welche gemacht. Siebzehn. Regel eins: Keine Möwe klaut Jakkos Brot. Die Möwen halten sich nicht dran. Wir prozessieren noch.', 'signatur')]),
    node('fluch', [L(F, 'Einen Credit. Und danke. Das Kompliment ist gratis, der Fluch nicht.', 'freude')], { effects: [herz(F, 10)] }),
  ]),

  dlg('freya-meer', [
    node('a', [
      N('Freya steht an der Wasserlinie, Hosenbeine hochgekrempelt, und sieht den Wellen zu, als würde sie ihre Aussagen prüfen.'),
      L(F, 'Jede Welle kommt zurück. Jede. Das ist das zuverlässigste, was ich je gesehen hab. Zuverlässiger als die U-Bahn. Zuverlässiger als Daria.', 'zaertlich'),
    ], {
      choices: [
        { text: '„Und, ist das Meer gerecht?“', next: 'gerecht' },
        { text: '(Neben ihr stehen und die Füße nass werden lassen.)', effects: [herz(F, 10)], next: 'nass' },
      ],
    }),
    node('gerecht', [L(F, 'Es macht alle gleich nass. Reiche, Arme, Kinder, Hunter. Das ist die gerechteste Sache in ganz Noxius. Und es ist nicht mal in Noxius.', 'signatur')]),
    node('nass', [L(F, 'Kalt. Einspruch. … Abgelehnt. Ich bleib trotzdem stehen.', 'freude')]),
  ]),

  dlg('freya-master', [
    node('a', [
      N('Freya steht hinter ihrer Kiste. Vor ihr liegt ein Blatt, Schönschrift, Überschrift: „VERFAHREN GEGEN {name}. IN ABWESENHEIT.“'),
      L(F, 'In Abwesenheit, weil du abwesend bist. Hier drin.', 'wut'),
      N('Sie tippt sich an die Brust. Dann an die Schläfe.'),
      L(F, 'Anklage: Du hast genau das getan, wogegen wir zusammen Einspruch gesagt haben. Das Gericht ist befangen. Das Gericht hat dich gemocht. Das Gericht urteilt trotzdem.', 'trauer'),
    ], {
      choices: [
        { text: '„Und das Urteil?“', next: 'urteil' },
        { text: '(Gehen.)' },
      ],
    }),
    node('urteil', [
      L(F, 'Das Urteil ist ausgesetzt. Bis du zurückkommst. Richtig zurück. Ohne Turm. Das ist Gnade vor Recht. Die hab ich von dir gelernt. Ich hasse, dass ich sie von dir gelernt hab.', 'trauer'),
    ]),
  ]),

  dlg('freya-3b', [
    node('a', [
      L(F, 'Das Gericht hat die Akte wieder aufgemacht. Verfahren gegen {name}. Neuer Sachstand: zurückgekommen.', 'besorgt'),
      L(F, 'Das Urteil lautet: schuldig. Strafe: Du kommst jeden Mittwoch mit ins Gericht. Ein Jahr lang. Und sagst Einspruch, wenn’s wichtig ist.', 'signatur'),
    ], {
      effects: [{ markSeen: 'freya-3b' }],
      choices: [
        { text: '„Ich nehme das Urteil an.“', next: 'annehmen' },
        fluch('„Scheiße, Freya. Danke.“', 'fluch'),
      ],
    }),
    node('annehmen', [L(F, 'Gut. Dann ist die Sache erledigt. Fast. Den Rest erledigt die Zeit. Die ist der langsamste Richter, aber der gerechteste.', 'zaertlich')], { effects: [herz(F, 60)] }),
    node('fluch', [L(F, 'Einen Credit. Und gern geschehen. Das war das Teuerste, was ich je gesagt hab.', 'zaertlich')], { effects: [herz(F, 60)] }),
  ]),
);

export const part: ContentPart = { dialogues };
