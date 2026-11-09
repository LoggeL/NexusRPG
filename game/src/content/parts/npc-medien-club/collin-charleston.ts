// Collin Charleston – Star-Moderator von NX-1 (world.md §4.4, §4.7 „Live und unzensiert“, §11.2).
// Tagesablauf nach design/plan/act1.json (npcSchedules.collin-charleston), Herz-Ereignisse he-collin-charleston-2/4/6
// (plan events). Akt 2/3 und Nachspiel (he-8/-10 in beiden Fassungen, Date mit Geständnis auf der Flutmauer,
// Tagesgespräche, Party, Enden) in collin-charleston-23.ts. Kein Begleiter.
// Romanze: freigegeben (ROMANCE_ENABLED). Flirts ab ♥6 (romanceEnabled), Kuss/Nacht ab ♥8 ({ romance }).
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode, NpcDef, Weekday } from '../../../modules/contracts';
import {
  type Menu, AKT1, AKT2, VEX, VEXARIA, ZEIT_HINWEIS, abblende, all, byId, chk, cut, daily, dlg, erz, flag, hearts, ich,
  noFlag, node, not, rel, rep, seen, set, sp, talk, xp,
} from './_util';
import { MASTER } from './_util';
import {
  COLLIN_EVENT_FLUTMAUER, COLLIN_PHONE, COLLIN_SCHEDULE_23, COLLIN_TALK_23, COLLIN_TALK_MASTER, ZUSAMMEN, collin23,
} from './collin-charleston-23';

const C = sp('collin-charleston');
const K = sp('kameramann');
const D = sp('delya-delloraine');
const H = sp('hunter');

const ID = 'collin-charleston';
/** Flirtzeilen ab ♥6, sobald die Romanze freigeschaltet ist (Engine: romanceEnabled); Kuss/Nacht bleiben an ROM (♥8). */
const FLIRT: Condition = { all: [{ romanceEnabled: ID }, { hearts: ID, min: 6 }] };
const PROBEZEIT: Condition = { quest: 'main-1-probezeit', state: 'done' };
const VOR_DER_SENDUNG: Condition = all({ weekday: ['mo', 'mi', 'fr'] }, { clockBetween: [600, 720] });

// ------------------------------------------------------------------------------------------- Menü

function menu(): Menu {
  const zurueck: DialogueChoice[] = [{ text: 'Noch was, Collin.', next: 'menue', id: 'zurueck' }, { text: 'Bis dann. Bleib frisiert.' }];

  /** Flirtzeilen (world.md §4.7) nach Wochentag, nur Romanzefassung. */
  const flirt = (n: number, tage: Weekday[]): DialogueChoice => ({
    text: 'Mit Collin flirten.', tag: '[Romanze]', next: `flirt-${n}`, id: `flirt-${n}`,
    when: all(FLIRT, noFlag('collin_romanze_abgelehnt'), { weekday: tage }), effects: [set('flirt_collin-charleston')],
  });
  const antworten: DialogueChoice[] = [
    { text: '„Dann geh off air. Mit mir.“', check: chk('collin-flirt-frech', 'ausstrahlung', 6, ['flirt']), next: 'flirt-a', effects: [rel(ID, 15)] },
    { text: '„Deine Frisur hält. Ich wackel ein bisschen.“', next: 'flirt-b', effects: [rel(ID, 10)] },
    { text: '„Kamera wieder an, Collin. Du bist süß, wenn du dich verhaspelst.“', next: 'flirt-c', effects: [rel(ID, 10)] },
  ];

  const choices: DialogueChoice[] = [
    { text: '„Wir hatten denselben Friseur. Oben. Damals.“', tag: '[Oberstadt]', when: { origin: 'origin-oberstadt' }, once: true, id: 'c-oberstadt', next: 'c-oberstadt' },
    { text: '„Frag schon. Wie’s drinnen war.“', tag: '[Knast]', when: { origin: 'origin-knastvogel' }, once: true, id: 'c-knast', next: 'c-knast', effects: [rel(ID, 30), rep('nx1-medien', 3)] },
    { text: 'Ein Autogramm, bitte.', when: all({ time: 'abend' }, { noItem: 'autogrammkarte-collin' }), next: 'autogramm', effects: [{ give: 'autogrammkarte-collin' }] },
    { text: '„Kein Interview, Collin.“', when: VEX, once: true, id: 'c-vex', next: 'vex' },
    { text: 'Hast du Angst vor der Kamera?', tag: '[Collin ♥3]', requires: hearts(ID, 3), once: true, id: 'c-angst', next: 'angst' },
    { text: 'Wie läuft’s mit Pixel-Pete?', when: { quest: 'pers-collin-pixel', state: 'active' }, next: 'pete' },
    { text: 'Dienstag Karaoke. Singst du auch?', when: { weekday: ['mo', 'di'] }, once: true, id: 'c-karaoke', next: 'karaoke' },
    flirt(1, ['mo', 'do']),
    flirt(2, ['di', 'fr']),
    flirt(3, ['mi', 'sa']),
    flirt(4, ['so']),
    { text: 'Bis dann. Bleib frisiert.' },
  ];

  const nodes: DialogueNode[] = [
    node('menue', [C('Was noch? Fragen? Ich liebe Fragen! Solange ich die Antworten vorher kenne.', 'signatur')], { choices }),
    node('c-oberstadt', [
      C('Gaston! Natürlich Gaston! Der Mann mit den goldenen Scheren! Ist er noch …', 'freude'),
      ich('Er schneidet jetzt Hecken. Im Himmelsgarten.'),
      C('… Unglaublich. Tragisch. Exklusiv. Erzähl das keinem. Mein Haar weiß nicht, dass er weg ist.', 'trauer'),
    ], { choices: zurueck }),
    node('c-knast', [
      C('Wie war’s drinnen? Erzähl! Exklusiv! Waren die Wände grau? Waren sie SEHR grau?', 'freude'),
      ich('Grau. Und das Essen hatte eine Persönlichkeit. Eine schlechte.'),
      C('„Das Essen hatte eine Persönlichkeit.“ Das ist ein Titel! Das ist eine Staffel! Ich ruf dich an. Ich ruf nie an. Aber dich ruf ich an!', 'ueberrascht'),
    ], { choices: zurueck }),
    node('autogramm', [
      erz('Collin zieht eine Karte aus der Innentasche, signiert sie mit einem Schwung, der fast den Tisch umreißt, und haucht drauf, damit die Tinte trocknet. Oder aus Gewohnheit.'),
      C('Für dich. Mit Herz. Das Herz mach ich nur bei Leuten, die ich mag. Und bei allen anderen. Aber bei dir mein ich’s.', 'signatur'),
    ], { choices: zurueck }),
    node('vex', [
      C('Die Dachkurierin! Exklusiv! Erzähl, wie fühlt es sich an, neun Stockwerke über dem Abgrund …', 'freude'),
      ich('Nein.'),
      C('Ein Wort! Ein einziges! Für die Zuschauer!', 'ueberrascht'),
      ich('Nein.'),
      C('… Das war das kürzeste Interview meiner Karriere. Und das ehrlichste. Ich hasse es. Ich liebe es.', 'besorgt'),
    ], { choices: zurueck, effects: [rel(ID, 10)] }),
    node('angst', [
      C('Angst? Ich? Vor der Kamera? Die Kamera ist meine Mutter. Meine Geliebte. Mein Spiegel.', 'signatur'),
      C('… Ich hab Angst vor dem, was danach kommt. Wenn das rote Licht ausgeht. Dann bin ich nur ein Mann Mitte vierzig mit sehr viel Haarspray und sehr wenig Plan.', 'besorgt'),
    ], { choices: zurueck }),
    node('pete', [
      C('Pixel-Pete. Er lächelt immer. Er schwitzt nie. Er hat gestern die Wetterkarte moderiert und das Wetter hat sich an ihn gehalten.', 'wut'),
      C('Hast du schon was rausgefunden? Irgendwas? Einen Kurzschluss? Einen Skandal? Einen Pickel?', 'besorgt'),
    ], { choices: zurueck }),
    node('karaoke', [
      C('Singen? Ich MODERIERE. Ich bin der Mann zwischen den Liedern! Der Kitt! Der Glanz!', 'signatur'),
      C('Okay. Einmal. Zwei Uhr nachts, als alle schon weg waren. „Neonherz“, Kabelbrand. Bruno hat geweint. Vor Schmerz.', 'verlegen'),
    ], { choices: zurueck }),
    // Flirt (Romanzefassung)
    node('flirt-1', [C('Exklusiv! Unglaublich! {name} sieht heute verboten gut aus! … Das war off air. Leider.', 'signatur')], { choices: antworten }),
    node('flirt-2', [C('Meine Frisur hält jedem Sturm stand. Bei dir bin ich mir nicht sicher.', 'verlegen')], { choices: antworten }),
    node('flirt-3', [C('Ich hab dreihundert Leute interviewt. Bei dir fällt mir keine Frage ein. Nur Antworten.', 'zaertlich')], { choices: antworten }),
    node('flirt-4', [C('Kamera aus. Gut. Jetzt darf ich ehrlich sein: Du bist mein Lieblingsskandal.', 'signatur')], { choices: antworten }),
    node('flirt-a', [
      C('Off air. Mit dir. Ich …', 'ueberrascht'),
      erz('Er greift nach seiner Krawatte, als müsse er sie lockern, und lockert sie tatsächlich. Ganz langsam. Mit Blick auf dich.'),
      C('Pass auf, was du sagst. Ich hab einen Ruf zu verlieren. Und ich bin gerade sehr bereit, ihn zu verlieren.', 'zaertlich'),
    ], { choices: zurueck }),
    node('flirt-b', [C('Wackeln ist gut. Wackeln ist Quote. Komm näher, dann wackeln wir zusammen. … Das klang besser im Kopf.', 'verlegen')], { choices: zurueck }),
    node('flirt-c', [C('Süß! Ich bin nicht süß! Ich bin SEXY! Das steht in meinem Vertrag! … Paragraf drei. Sag’s noch mal.', 'freude')], { choices: zurueck }),
  ];
  return { choices, nodes };
}

const M = menu();

// ------------------------------------------------------------------------------------------- Tagesgespräche

const T = {
  rivale: daily('collin-tag-rivale',
    [C('Und hier sehen Sie: den UNRUHESTIFTER der Woche! Vorsicht, Zuschauer, dieses Subjekt spricht ohne Teleprompter!', 'wut')],
    [
      C('Gestern in den Nachrichten: Nougatbomben-Diebstahl in der Neon-Gasse. Täterbeschreibung: sieht dir zufällig sehr ähnlich. Rein zufällig.', 'signatur'),
      C('Willst du eine Gegendarstellung? Live? Dann komm Montag zur Bühne. Und bring Mut mit. Und Puder.'),
    ],
    { choices: [{ text: 'Du kannst mich mal, Collin.' }], nodes: [] }),
  peruecke: dlg('collin-tag-peruecke', [
    node('start', [
      erz('Collin steht hinter der Bühne, die Hände flach auf dem Kopf, als würde er etwas festhalten, das nicht mehr da ist. Unter seinen Fingern: ein sehr, sehr dünner Flaum.'),
      C('Sieh mich nicht an! SIEH MICH NICHT AN! Kamera aus! Welt aus!', 'wut'),
      C('Mein … Haarteil. Weg. Ich hab’s hier hingelegt, nur fürs Puder, und dann kam der Wind, und dann kam eine TAUBE, und in zwei Stunden bin ich live!', 'besorgt'),
    ], {
      choices: [
        { text: 'Ich find dein Haar. Versprochen.', next: 'ja', effects: [{ startQuest: 'side-collins-peruecke' }] },
        { text: '„Geh doch so. Glatze ist ehrlich.“', next: 'ehrlich', effects: [{ startQuest: 'side-collins-peruecke' }] },
        { text: 'Ich hab keine Zeit für Haare.', next: 'nein' },
      ],
    }),
    node('ja', [C('Du bist ein Engel! Ein Engel mit Augen! Opa Gurrmanns Tauben! Der Wind! Irgendein Kind! Such alles ab! Exklusiv!', 'freude')]),
    node('ehrlich', [
      C('Ehrlich? EHRLICH? Ehrlichkeit hat keine Quote!', 'wut'),
      C('… Hat sie? Nein. Such es. Bitte. Und wenn du es nicht findest, reden wir über Ehrlichkeit. Mit einem Hut.', 'besorgt'),
    ]),
    node('nein', [C('Natürlich. Keiner hat Zeit für Haare. Nur die Haare haben Zeit. Für immer. Weg.', 'trauer')]),
  ]),
  vexaria: daily('collin-tag-vexaria',
    [
      C('DU! Komm her! Exklusiv! Unglaublich! Die Dachkurierin und die Brecherin! Auf der Flutmauer! Im Sonnenuntergang!', 'freude'),
      C('Ich hab nichts gesehen. Ich hab ALLES gesehen. Mein Kameramann hat behauptet, der Speicher war voll. Der Speicher war nie voll. Ich kenne meinen Speicher!', 'ueberrascht'),
    ],
    [
      C('Weißt du, wie gern ich das senden würde? „Liebe über den Dächern: Zwei Unterstadt-Rüpel und ein Kuss gegen jede Regel“! Dazu Streicher!', 'signatur'),
      D('Er sendet es nicht. Ich hab ihm erklärt, was Persönlichkeitsrechte sind. Mit einem Gesetzbuch. Gegen den Kopf.'),
      C('Sie hat mir gedroht. Mit Fakten. Das ist das Schlimmste, was man einem Moderator antun kann.', 'besorgt'),
    ],
    M, { effects: [set('collin_kommentar_vexaria')] }),
  nacht: daily('collin-tag-morgen-danach',
    [
      C('Guten Morgen, Unterstadt! … Ich probe. Ganz beiläufig. „Gestern Abend? Ach, nichts Besonderes. Ein Gast. Eine Nacht. Ein Mythos.“', 'signatur'),
      C('Zu viel? Zu wenig? Sag nichts. Dein Grinsen sagt alles, und es sagt: zu viel.', 'verlegen'),
    ],
    [
      C('Die Perücke saß übrigens die ganze Nacht. Die GANZE Nacht. Das ist Ingenieurskunst.', 'freude'),
      H('Wenn er im Radio über dich redet, bin ich raus.'),
    ],
    M, { effects: [set('collin_morgen_danach')] }),
  paar: daily('collin-tag-paar',
    [
      C('Da ist es ja, mein Lieblingsskandal. Komm her. Nein, näher. Die Kamera ist aus. Diesmal wirklich.', 'zaertlich'),
      erz('Er streicht dir eine Strähne aus dem Gesicht, mit der Präzision eines Mannes, der sein Leben lang Frisuren gerichtet hat. Dann tut er so, als hätte er nur Staub weggewischt.'),
    ],
    [
      C('Seit der Sendung liegen sechshundert Zuschauerbriefe auf meinem Tisch. Dreihundert wollen dich. Dreihundert wollen mich. Ich hab allen geschrieben: vergeben.', 'signatur'),
      C('Kommst du nachher noch hoch? Das Zimmerchen über dem Studio. Ich hab eine Flasche Edelbrause. Und keine Termine.', 'verlegen'),
    ],
    M),
  zeit: daily('collin-tag-zeit',
    [C('{name}! Mein liebster Gast! Ich hab eine Sondersendung im Kopf. Über dich. Aber der Sender sagt: „noch nicht“.', 'besorgt'), erz(ZEIT_HINWEIS)],
    [C('Manche Geschichten muss man reifen lassen. Wie Käse. Oder Moderatoren. Ich reife. Siehst du? Ich reife sehr gut.', 'signatur')],
    M),
  radio: daily('collin-tag-radio',
    [C('Guten Morgen, Unterstadt! Hier ist Collin Charleston auf NX-1 Radio, und heute wird es UNGLAUBLICH!', 'freude'), erz('Er nimmt den Kopfhörer ab und dreht sich zu dir.')],
    [
      C('Weißt du, was das Schöne am Radio ist? Keiner sieht die Frisur. Das ist auch das Schreckliche am Radio.', 'besorgt'),
      C('Willst du nachher anrufen? „Stimme der Straße“. Sag irgendwas. Je ehrlicher, desto besser. Je besser, desto Quote.'),
    ],
    M),
  live: daily('collin-tag-live',
    [C('Noch zwanzig Minuten! Puder! Wo ist mein Puder? Ich glänze! Glänze ich? Sag mir, dass ich nicht glänze!', 'besorgt')],
    [
      C('Heute live: der Chrome-10-Werbestand, die Wettervorhersage und ein Interview mit einem Mann, der behauptet, er sei mit einer Kanalratte verheiratet.', 'signatur'),
      K('[COLLIN: 2 MIN VERSPÄTUNG. NOCH NICHT.]'),
      C('Ich bin nie zu spät! Die Zeit ist zu früh!', 'wut'),
    ],
    M),
  spiegel: daily('collin-tag-spiegel',
    [C('Moment. Moment! Linke Seite. Sieht sie gut aus? Die linke Seite ist meine Schokoladenseite. Die rechte ist meine Vollkornseite.', 'signatur')],
    [C('Der Spiegel lügt nie. Deshalb hab ich drei. Zwei davon lügen, das gleicht sich aus.', 'freude')],
    M),
  karaoke: daily('collin-tag-karaoke',
    [C('KARAOKE-DIENSTAG im High Voltage! Ich bin euer Gastgeber, euer Kompass, euer Herz! Wer singt als Nächstes?', 'freude')],
    [
      C('Der Typ eben hat „Neonherz“ in drei Tonarten gleichzeitig gesungen. Drei! Das ist ein neuer Rekord! Das ist Folter!', 'ueberrascht'),
      C('Komm schon. Ein Lied. Ich moderier dich an wie eine Legende. Und wenn du schief singst, sag ich, das war Absicht. Kunst!', 'signatur'),
    ],
    M),
  cafe: daily('collin-tag-cafe',
    [C('Autogrammstunde! Sahnehaube! Die beste Zeit des Tages! Alle lieben mich und keiner darf mich anfassen!', 'freude')],
    [
      C('Weißt du, wer gestern hier war? Blade Nocturne. Am Fenstertisch. Er hat mir zugenickt. ZUGENICKT. Ich hab drei Stunden über das Nicken nachgedacht.', 'ueberrascht'),
      C('Er hat so ein Lächeln. Wie ein Haifisch, der gerade Zahnpasta-Werbung macht.', 'besorgt'),
    ],
    M),
  vertraut: daily('collin-tag-vertraut',
    [C('{name}! Du! Mein Lieblingsgesicht! Nach meinem! Knapp danach!', 'freude')],
    [
      C('Ich hab nachgedacht. Selten, aber gründlich. Du bist der einzige Mensch, der mich ansieht, wenn die Kamera aus ist. Das ist … unheimlich. Und schön.', 'zaertlich'),
      C('Vergiss, dass ich das gesagt hab. Oder nicht. Entscheide du. Ich moderier das dann.', 'verlegen'),
    ],
    M),
  fremd: daily('collin-tag-fremd',
    [C('Ah! Ein neues Gesicht! Wie heißt du? Egal! Ich nenn dich „Zuschauer“! Hallo, Zuschauer!', 'freude')],
    [C('Live! Exklusiv! Unglaublich! Das sind meine drei Lieblingswörter. Mein viertes ist „Haarspray“. Mein fünftes ist „Gage“.', 'signatur')],
    M),
  standard: daily('collin-tag-standard',
    [C('Hallo, hallo! Collin Charleston, live und in Farbe! Was kann ich für dich tun? Außer gut aussehen.', 'signatur')],
    [C('Die Unterstadt ist voller Geschichten. Die meisten riechen schlecht. Die besten auch.', 'freude')],
    M),
};

// ------------------------------------------------------------------------------------------- he-collin-charleston-2

const he2 = dlg('he-collin-charleston-2', [
  node('start', [
    erz('NX-1 Radio, morgens. Collin sitzt in der Kabine, zwei Kopfhörer, drei Kaffeebecher, ein Mikrofon mit Puschel. Er winkt dich so heftig herein, dass ein Becher umkippt.'),
    C('Du! Rein! Schnell! Mein Anrufer ist eingeschlafen! LIVE eingeschlafen!', 'besorgt'),
    erz('Er drückt dich auf den Gaststuhl und schiebt dir ein Mikrofon unter die Nase. Das rote Licht geht an.'),
    C('Und weiter geht’s mit „Stimme der Straße“! Hier ist ein echter Mensch aus der echten Unterstadt! Sag uns: Wie ist das Leben da unten?', 'freude'),
  ], {
    choices: [
      { text: '„Großartig. Dank Quantum haben wir jetzt sogar Werbung im Klo.“', next: 'quantum', effects: [rep('nx1-medien', 5), rep('unterstadt', -5)] },
      { text: '„Beschissen. Aber wir halten zusammen. Mehr als ihr da oben.“', next: 'ehrlich', effects: [rep('unterstadt', 5), rep('nx1-medien', -5)] },
      { text: '„Wir haben hier keine Aussicht. Aber Aussichten.“', check: chk('he-collin-2-spruch', 'ausstrahlung', 4, ['auftritt', 'witz']), next: 'spruch', effects: [rep('unterstadt', 3), rep('nx1-medien', 3)] },
      { text: 'Nichts sagen. Ins Mikro starren.', next: 'stille' },
    ],
  }),
  node('quantum', [
    C('Werbung im Klo! Fantastisch! Fortschritt! Hygiene! Unterhaltung! Alles auf einmal!', 'freude'),
    erz('Hinter der Glasscheibe hebt jemand von der Regie beide Daumen. Collin strahlt. Du fühlst dich ein bisschen schmutzig, und das liegt nicht am Klo.'),
  ], { next: 'zweite' }),
  node('ehrlich', [
    erz('Ein Piepton zensiert das erste Wort. Collin wird blass, dann rot, dann eine Farbe, für die es keinen Namen gibt.'),
    C('Ha! Ha ha! Die Straße! So … rau! So … echt! Unglaublich! Wir sind gleich wieder da!', 'ueberrascht'),
    erz('Er drückt einen Knopf. Werbung. Dann sieht er dich an, und zum ersten Mal ist sein Lächeln kein Moderationslächeln.'),
    C('Das war das Ehrlichste, was in dieser Kabine seit Jahren gesagt wurde. Ich krieg Ärger. Es war es wert.', 'besorgt'),
  ], { next: 'zweite' }),
  node('spruch', [
    C('„Keine Aussicht, aber Aussichten!“ Das ist … das ist ein Slogan! Das ist ein T-Shirt! Das ist eine Staffel!', 'ueberrascht'),
    erz('Die Leitungen leuchten. Alle. Gleichzeitig. Jemand ruft an, nur um „Aussichten!“ ins Telefon zu brüllen.'),
  ], { effects: [rel(ID, 20)], next: 'zweite' }),
  node('stille', [
    erz('Drei Sekunden Stille. Im Radio sind drei Sekunden eine Ewigkeit. Collin schwitzt. Dann übernimmt er.'),
    C('Hören Sie das? HÖREN SIE DAS? Das ist die Stille der Unterstadt! Erschüttert! Sprachlos! Bewegt! Wir lassen sie einfach … wirken. Exklusiv.', 'signatur'),
    erz('Es ist das Absurdeste, was du je gehört hast. Und es funktioniert.'),
  ], { next: 'zweite' }),
  node('zweite', [
    C('Letzte Frage, für unseren Sponsor: Würdest du Chrome 10 empfehlen? Ja oder ja?', 'signatur'),
  ], {
    choices: [
      { text: '„Ja. Für Leute, die gern Ja sagen.“', next: 'ende', effects: [rep('nx1-medien', 2)] },
      { text: '„Nein. Mein Freund hat’s genommen und singt jetzt Werbejingles.“', next: 'jimmy', effects: [rep('unterstadt', 3), set('collin_radio_jimmy')] },
      { text: '„Frag mich das ohne Sponsor, Collin.“', next: 'ohne', effects: [rel(ID, 10)] },
    ],
  }),
  node('jimmy', [
    C('Werbejingles! Wie … wie lustig! Das ist sicher eine Ausnahme! Bestimmt!', 'besorgt'),
    erz('Er sieht zur Regie. Die Regie sieht weg. Collin lacht zu laut und spielt ein Lied.'),
  ], { next: 'ende' }),
  node('ohne', [
    erz('Collin schaltet das Mikrofon stumm. Nur für eine Sekunde.'),
    C('Ohne Sponsor? Ich würd’s nicht nehmen. Ich nehm nicht mal Vitamine. Ich vertrau meinem Körper nicht, wie soll ich da einem Chip vertrauen?', 'besorgt'),
    erz('Mikro an. „Natürlich JA! Chrome 10! Für ein besseres Ich!“'),
  ], { next: 'ende' }),
  node('ende', [
    erz('Das rote Licht geht aus. Collin lehnt sich zurück und atmet, als hätte er einen Marathon moderiert.'),
    C('Du bist ein Naturtalent. Oder eine Naturkatastrophe. Bei mir gibt es da keinen Unterschied, beides ist Quote.', 'freude'),
    C('Zwanzig Credits Honorar. Mehr kann ich nicht. Mehr hab ich nicht. Mein Friseur ist teuer.'),
  ], { effects: [{ credits: 20 }, xp(30), set('collin_stimme_der_strasse')] }),
]);

// ------------------------------------------------------------------------------------------- he-collin-charleston-4

const he4 = dlg('he-collin-charleston-4', [
  node('start', [
    erz('Stufenplatz, kurz vor zwölf. Die Bühne steht, die Menge wartet, der Kran schwenkt. Collin steht hinter dem Vorhang und schlägt mit der flachen Hand auf ein Gerät, das Funken spuckt.'),
    C('Der Teleprompter! Tot! Tot wie meine erste Ehe! Ich hab keinen Text! Ich hab NIE Text! Ich hab den Teleprompter!', 'besorgt'),
    K('[LIVE IN 2:00]'),
    C('Zwei Minuten! In zwei Minuten sieht mich die ganze Stadt, wie ich „Äh“ sage! Ich sage nie „Äh“! Ich wurde ohne „Äh“ geboren!', 'wut'),
  ], {
    choices: [
      { text: 'Den Prompter aufschrauben. Wackelkontakt, ganz sicher.', check: chk('he-collin-4-prompter', 'technik', 5, ['reparieren', 'elektronik']), next: 'reparieren' },
      { text: '„Ich geh mit raus. Wir improvisieren. Zu zweit.“', check: chk('he-collin-4-impro', 'ausstrahlung', 5, ['auftritt', 'improvisieren']), next: 'impro' },
      { text: 'Pappe und Edding holen. Ich halt dir die Karten hoch.', next: 'karten' },
      { text: '„Du schaffst das ohne. Du bist Collin Charleston.“', next: 'mut' },
    ],
  }),
  node('reparieren', [
    erz('Gehäuse auf. Eine Lötstelle hat sich gelöst, und in der Lüftung steckt eine Haarnadel. Collins Haarnadel. Du klemmst das Kabel fest, ziehst die Nadel raus, und der Bildschirm springt an: „Guten Tag, Unterstadt! (lächeln) (Pause) (lächeln)“.'),
    C('Er lebt! ER LEBT! Du bist ein Wunder! Ein Wunder mit Schraubenzieher!', 'freude'),
    K('[LIVE IN 0:10]'),
    erz('Collin rennt raus, strahlt, und moderiert die beste Sendung seit Wochen. Die Haarnadel steckst du ein. Und einen Ersatzchip, der neben dem Prompter lag.'),
  ], { effects: [rel(ID, 30), { give: 'teleprompter-chip' }, rep('nx1-medien', 5)], next: 'ende' }),
  node('impro', [
    erz('Ihr geht zusammen raus. Collin wirft dir die erste Frage zu, du schmetterst sie zurück. Er fragt nach dem Wetter, du sagst: „Grau mit Chance auf noch grauer.“ Die Menge lacht. Er fragt nach Chrome 10, du sagst: „Der Chip, der Ja sagt, bevor du gefragt hast.“ Die Menge lacht lauter. Die Regie schwitzt.'),
    C('Meine Damen und Herren, mein Co-Moderator! Spontan! Ungeplant! Unbezahlt!', 'freude'),
    K('[ :D ]'),
  ], { effects: [rel(ID, 40), rep('nx1-medien', 5), rep('unterstadt', 3)], next: 'ende' }),
  node('karten', [
    erz('Du reißt einen Karton vom Brezelstand ab, kritzelst in Sekunden Stichworte drauf und stellst dich hinter den Kran. „WETTER.“ – „CHROME 10 (lächeln).“ – „NICHT ÄH SAGEN.“'),
    erz('Collin liest alles vor. Auch „(lächeln)“. Auch „NICHT ÄH SAGEN“. Auch die Rückseite, auf der „Brezel 3 Cr“ steht.'),
    C('… und Brezeln, drei Credits, das ist … das ist unser heutiges Angebot! Exklusiv! Kaufen Sie Brezeln!', 'ueberrascht'),
    erz('Der Brezelstand ist in zehn Minuten ausverkauft. Der Händler schenkt dir eine.'),
  ], { effects: [rel(ID, 30), { give: 'brezel' }, rep('unterstadt', 2)], next: 'ende' }),
  node('mut', [
    C('Ich bin Collin Charleston.', 'besorgt'),
    C('Ich bin … COLLIN CHARLESTON!', 'signatur'),
    erz('Er geht raus. Er sagt „Äh“. Zweimal. Dann fängt er sich und redet zwanzig Minuten über seine Frisur, ohne Punkt und Komma. Es ist schrecklich. Die Leute lieben es.'),
  ], { effects: [rel(ID, 20)], next: 'ende' }),
  node('ende', [
    erz('Nach der Sendung sitzt Collin auf der Bühnenkante, die Krawatte offen. Er reicht dir eine Flasche Edelbrause, die er eigentlich für sich selbst gekauft hat.'),
    C('Ich hab heute zum ersten Mal seit zwölf Jahren nicht gewusst, was ich als Nächstes sage.', 'besorgt'),
    C('Es war furchtbar. Es war das Lebendigste, was ich seit zwölf Jahren gemacht hab. Sag’s keinem.', 'freude'),
  ], { effects: [xp(50), set('collin_teleprompter_gerettet')] }),
]);

// ------------------------------------------------------------------------------------------- he-collin-charleston-6

const he6 = dlg('he-collin-charleston-6', [
  node('start', [
    erz('Die Regie im NX-1-Studio. Sechzehn Monitore, und auf allen dasselbe Gesicht: makellos, glänzend, ein Lächeln wie aus einer Zahnpasta-Werbung. Unten eingeblendet: „PIXEL-PETE – Der Moderator, der nie schwitzt. Testsendung.“'),
    erz('Collin sitzt allein im Regiestuhl. Ohne Puder. Ohne Lächeln. Er hat das Sakko ausgezogen, und die Schultern darunter sind schmaler, als man denkt.'),
    C('Er braucht keinen Kaffee. Keine Pause. Keinen Friseur. Er kann in sieben Sprachen lächeln.', 'trauer'),
    C('Nächsten Monat testen sie ihn bei den Mittagsnachrichten. Wenn die Quote stimmt … dann bin ich ein Archivbild.'),
  ], {
    choices: [
      { text: 'Die Testsendung Bild für Bild durchgehen.', check: chk('he-collin-6-pete', 'technik', 5, ['daten', 'hacken']), next: 'technik' },
      { text: '„Pete kann nicht schwitzen. Du schon. Das nennt man live.“', check: chk('he-collin-6-mut', 'ausstrahlung', 5, ['ueberreden', 'trost']), next: 'mut' },
      { text: 'Neben ihn setzen. Nichts sagen. Einen Kaffee rüberschieben.', next: 'kaffee' },
      { text: '„Dann such dir halt einen ehrlichen Job.“', next: 'hart' },
    ],
  }),
  node('technik', [
    erz('Du spulst die Testsendung zurück, langsamer, noch langsamer. Bei Bild 4.212 wiederholt sich eine Handbewegung. Bei 9.880 dieselbe Augenbraue. Du legst eine alte Collin-Sendung daneben. Dieselbe Augenbraue.'),
    ich('Collin. Der ist aus dir gebaut. Aus deinen alten Sendungen. Pete ist ein Zusammenschnitt von dir, nur ohne die guten Stellen.'),
    C('Aus … mir? Die haben mich … geklaut? Meine AUGENBRAUE?', 'ueberrascht'),
    C('Das ist das Schlimmste und das Schmeichelhafteste, was mir je passiert ist.', 'wut'),
  ], { effects: [rel(ID, 30), set('pete_ist_collin')], next: 'quest' }),
  node('mut', [
    ich('Pete hat nie live „Äh“ gesagt und sich gefangen. Pete hat nie einen Teleprompter mit Pappe ersetzt. Die Leute gucken dich nicht, weil du perfekt bist. Sondern weil du’s nicht bist und trotzdem weitermachst.'),
    C('…', 'ueberrascht'),
    C('Das muss ich mir aufschreiben. Nein. Das muss ich mir merken. Aufschreiben ist was für Teleprompter.', 'zaertlich'),
  ], { effects: [rel(ID, 30)], next: 'quest' }),
  node('kaffee', [
    erz('Ihr sitzt da. Pete lächelt auf sechzehn Monitoren. Collin trinkt den Kaffee in kleinen Schlucken, wie jemand, der ihn nicht schmeckt, aber festhalten will.'),
    C('Weißt du, was komisch ist? Du bist der Erste, der hier reinkommt und nicht fragt, ob ich mal ein Selfie mache.', 'trauer'),
  ], { effects: [rel(ID, 20)], next: 'quest' }),
  node('hart', [
    C('Ehrlich? Ich kann nichts anderes. Ich hab mit sechzehn angefangen. Wetterkarten. Ich kann mit dem Arm von Norden nach Süden zeigen. Das ist meine einzige Qualifikation.', 'wut'),
    C('… Okay. Das war fies. Aber ehrlich. Ich mag dich trotzdem. Das ist mein Problem, nicht deins.', 'besorgt'),
  ], { next: 'quest' }),
  node('quest', [
    C('Ich will wissen, wer Pete wirklich ist. Wer ihn gebaut hat. Was er sagt, wenn keiner zuhört. Und ich will ihn live auseinandernehmen. Vor allen.', 'signatur'),
    C('Hilfst du mir? Ich zahl in Ruhm. Und in Credits, falls Ruhm gerade nicht angenommen wird.'),
  ], {
    choices: [
      { text: '„Wir entlarven den Blechkopf. Zusammen.“', next: 'ja', effects: [{ startQuest: 'pers-collin-pixel' }] },
      { text: '„Gib mir Zeit. Ich muss erst meinen eigenen Mist sortieren.“', next: 'spaeter' },
    ],
  }),
  node('ja', [
    C('Zusammen! Das klingt wie ein Sendungstitel! „Collin und {name}: Zusammen gegen die Maschine!“ Ich hör schon die Fanfaren!', 'freude'),
    C('Und … danke. Ohne Fanfare. Nur danke.', 'zaertlich'),
  ], { effects: [xp(60), set('collin_pete_angst')] }),
  node('spaeter', [C('Zeit. Hab ich nicht. Aber für dich find ich welche. Ich hab noch zwei Wochen Urlaub, die ich nie genommen hab.', 'besorgt')], {
    effects: [xp(60), set('collin_pete_angst')],
  }),
]);

const nachtDlg = dlg('collin-bleib-heute-nacht', [
  node('start', [
    erz('Das Zimmerchen über dem Studio. Ein Bett, das zu groß ist für den Raum, drei Spiegel, eine Flasche Edelbrause und ein Fenster, durch das das rote Licht der Sendeantenne fällt. An, aus. An, aus.'),
    C('Das hier ist das einzige Zimmer der Stadt ohne Kamera. Ich hab nachgeschaut. Zweimal. Und die Spiegel hab ich umgedreht.', 'verlegen'),
    C('Bleibst du?', 'zaertlich'),
  ], {
    choices: [
      { text: 'Bleiben.', next: 'bleiben', effects: [set('collin-charleston_nacht'), set('collin_nacht'), set('woche_collin_nacht')] },
      { text: '„Ein andermal, Star.“', next: 'andermal', effects: [set('heute_collin_gefragt')] },
    ],
  }),
  node('bleiben', [
    C('Eine Regel. Die Perücke bleibt auf. Das ist nicht verhandelbar.', 'signatur'),
    ich('Und alles andere?'),
    C('Alles andere ist … live. Ungeprobt. Ohne Teleprompter.', 'zaertlich'),
    erz('Er knipst das Licht aus. Nur die Antenne blinkt noch. An. Aus. An.'),
  ], { effects: [{ cutscene: 'collin-nacht' }] }),
  node('andermal', [
    C('Ein andermal. Natürlich. Ich bin ja Wiederholungen gewohnt.', 'trauer'),
    C('… Ich zähl die Tage. Laut. Im Radio. Mit Countdown-Musik. Du wirst es bereuen.', 'freude'),
  ]),
]);

const morgenDlg = dlg('collin-morgen-danach', [
  node('start', [
    erz('Morgen. Collin steht vor dem einzigen Spiegel, den er wieder umgedreht hat, im Bademantel, die Perücke perfekt. Er probt.'),
    C('„Gestern? Ach. Nichts Besonderes. Ein Gast. Ein Abend. Eine … Legende.“ Nein. Zu viel. „Ein netter Abend.“ Zu wenig. „Unglaublich.“ … Ja. Unglaublich.', 'signatur'),
    erz('Er bemerkt dich im Spiegel und wird rot. Collin Charleston, der Mann ohne „Äh“, sagt: „Äh.“'),
  ], { effects: [{ checkBuff: { id: 'beschwingt-collin', label: 'Beschwingt', value: 1, attribute: 'ausstrahlung', forDays: 0, consumes: false } }, { message: 'Beschwingt: +1 Ausstrahlung bis Mitternacht.' }] }),
]);

const cutscenes = [
  cut('collin-testbild', 'Live und unzensiert', [
    { image: 'cut-rom-collin-testbild', pan: 'in', fade: 'in', hold: 2200, caption: 'NX-1, Hauptsendezeit. Eine Regel weniger.' },
    {
      image: 'cut-rom-collin-testbild', pan: 'none',
      lines: [
        erz('Er küsst dich. Vor sechzigtausend Zuschauern, im Studiolicht, mitten in der Sondersendung. In der Regie schlägt jemand auf den Knopf. Testbild. Pfeifton.'),
        C('Das … war nicht im Skript.', 'zaertlich'),
        ich('Gut so.'),
      ],
    },
    { image: 'black', fade: 'in', caption: 'Ticker, nächster Morgen: „NX-1-Star knutscht Unterstadt-Abschaum – Einschaltquote Rekord“' },
  ], [set('collin_kuss'), set(`${ID}_romanze_zusammen`), { give: 'goldenes-mikro' }, xp(150), rel(ID, 60)]),
  cut('collin-nacht', 'Ohne Teleprompter', [
    { image: 'black', fade: 'in', lines: [erz('Das rote Licht der Antenne. An. Aus. Ein Lachen, sehr leise, gar nicht moderiert.'), C('Du bist live, weißt du das? Die ganze Zeit.', 'zaertlich')] },
    abblende('Sendepause.'),
  ], [{ sleep: true }, { dialogue: 'collin-morgen-danach' }]),
];

// ------------------------------------------------------------------------------------------- Figur

const collin: NpcDef = {
  id: ID,
  name: 'Collin Charleston',
  portrait: 'collin',
  sprite: 'collin-walk',
  faction: 'nx1-medien',
  romanceable: true,
  bio: 'Star-Moderator von NX-1, Mitte vierzig, perfekte Frisur, Showstimme. Hat Angst, von einem KI-Moderator ersetzt zu werden – und vor dem Moment, wenn das rote Licht ausgeht.',
  gifts: {
    loves: ['haarspray-deluxe', 'mikrofon-puschel', 'sonnenbrille-gold'],
    likes: ['taschenspiegel-gold', 'autogrammkarte-collin', 'teleprompter-chip', 'edelbrause', 'echtobst-apfel', 'hofhonig'],
    dislikes: ['zeitung-papier', 'algen-chips'],
    hates: ['magnet-stoerer', 'rostige-dose', 'virus-implantat'],
  },
  schedule: [
    ...COLLIN_SCHEDULE_23,
    { slot: 'morgen', place: { map: 'nx1-studio', at: 'radio-kabine' } },
    { slot: 'tag', days: ['mo', 'mi', 'fr'], place: { map: 'stufenplatz', at: 'buehne' }, pose: 'moderieren' },
    { slot: 'tag', place: { map: 'nx1-studio', at: 'schminkspiegel' } },
    { slot: 'abend', days: ['di'], place: { map: 'high-voltage', at: 'moderatorenpult' }, pose: 'moderieren' },
    { slot: 'nacht', days: ['di'], when: { clockBetween: [1260, 1380] }, place: { map: 'high-voltage', at: 'moderatorenpult' }, pose: 'moderieren' },
    { slot: 'abend', place: { map: 'cafe-sahnehaube', at: 'autogramm-tisch' }, pose: 'sitzen' },
    { slot: 'nacht', place: 'away' },
  ],
  heartEvents: [
    { id: 'he-collin-charleston-2', hearts: 2, map: 'nx1-studio', time: 'morgen', dialogue: 'he-collin-charleston-2' },
    {
      id: 'he-collin-charleston-4', hearts: 4, map: 'stufenplatz', time: 'tag',
      when: all(seen('he-collin-charleston-2'), VOR_DER_SENDUNG), dialogue: 'he-collin-charleston-4',
    },
    { id: 'he-collin-charleston-6', hearts: 6, map: 'nx1-studio', time: 'tag', when: seen('he-collin-charleston-4'), dialogue: 'he-collin-charleston-6' },
    {
      id: 'he-collin-charleston-8', hearts: 8, map: 'high-voltage', time: ['abend', 'nacht'],
      when: all(AKT2, seen('he-collin-charleston-6'), { weekday: 'di' }), dialogue: 'he-collin-charleston-8',
    },
    COLLIN_EVENT_FLUTMAUER,
    {
      id: 'he-collin-charleston-10', hearts: 10, map: 'nx1-studio', time: 'abend',
      when: all(AKT2, seen('he-collin-charleston-8')), dialogue: 'he-collin-charleston-10',
    },
  ],
  talk: [
    COLLIN_TALK_MASTER,
    talk('collin-tag-rivale', { rival: ID }),
    talk('collin-tag-peruecke', all(PROBEZEIT, VOR_DER_SENDUNG, { dayAtLeast: 3 }, { quest: 'side-collins-peruecke', state: 'inactive' })),
    talk('collin-tag-morgen-danach', all(flag('collin_nacht'), noFlag('collin_morgen_danach'), { time: 'morgen' })),
    // „Bleib heute Nacht“: höchstens einmal pro Woche (Flag woche_*), nach „Ein andermal“ erst morgen wieder.
    talk('collin-bleib-heute-nacht', all(ZUSAMMEN, not(MASTER), { time: 'abend' }, noFlag('woche_collin_nacht'), noFlag('heute_collin_gefragt'))),
    talk('collin-tag-vexaria', all(VEXARIA, noFlag('collin_kommentar_vexaria'))),
    talk('collin-tag-zeit', AKT1, 8),
    ...COLLIN_TALK_23,
    talk('collin-tag-fremd', not({ met: ID })),
    talk('collin-tag-radio', { time: 'morgen' }),
    talk('collin-tag-live', all({ weekday: ['mo', 'mi', 'fr'] }, { time: 'tag' })),
    talk('collin-tag-karaoke', all({ weekday: 'di' }, { time: ['abend', 'nacht'] })),
    talk('collin-tag-vertraut', undefined, 5),
    talk('collin-tag-spiegel', { time: 'tag' }),
    talk('collin-tag-cafe', { time: 'abend' }),
    talk('collin-tag-standard'),
  ],
};

export const part: ContentPart = {
  npcs: { [ID]: collin },
  dialogues: byId([
    T.rivale, T.peruecke, T.vexaria, T.nacht, T.paar, T.zeit, T.radio, T.live, T.spiegel, T.karaoke, T.cafe, T.vertraut,
    T.fremd, T.standard, he2, he4, he6, ...collin23(M), nachtDlg, morgenDlg,
  ]),
  cutscenes: byId(cutscenes),
  phone: byId(COLLIN_PHONE),
};
