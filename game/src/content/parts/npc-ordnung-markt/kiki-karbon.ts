// Kiki Karbon – Schwebetaxi-Fahrerin um die dreißig, schnell, laut, Klatschbase, will einmal bis ans Meer fliegen
// (world.md §3.3, §4.4, §4.7, §11.2). Tagesablauf nach design/plan/act1.json (npcSchedules.kiki-karbon).
// Herz-Ereignisse he-kiki-karbon-2/4/6 in Akt 1 (♥2 schaltet das Schwebetaxi frei), -8/-10 angelegt und an act2 gebunden.
// Romanze nur als Kennzeichen (ROMANCE_CANDIDATES); Flirtzeilen hängen an { romance: 'kiki-karbon' } und bleiben aus,
// solange sie nicht in ROMANCE_ENABLED steht. Klatschbase des Strangs Vex × Aria (world.md §4.7, Armdrücken).
// Quests nur als Verweis/Start: pers-kiki-reichweite; Beweisfotos für side-uebliche-verspaetung (Flag kiki_beweisfotos).
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode, NpcDef, Weekday } from '../../../modules/contracts';
import {
  type Menue, AB_AKT2, NICHT_AKT2, TAXI_ZIELE, VEX, ZEIT_HINWEIS, dialog, erz, flag, herz, ich, knoten, neu, pruefung, rede,
  sammle, sprecher, tagesgespraech,
} from './_helfer';

const KI = sprecher('kiki-karbon');

const ROM: Condition = { romance: 'kiki-karbon' };
const TAXI_FREI: Condition = { seen: 'he-kiki-karbon-2' };
const REICHWEITE = 'pers-kiki-reichweite';

// ---------------------------------------------------------------------------------------------- Schwebetaxi

/** Fahrpreise: 20 Cr (world.md §3.3); Rivalität doppelt und mit Umweg; Taxikarte und Freifahrt gratis. */
function taxiChoices(): DialogueChoice[] {
  const out: DialogueChoice[] = [];
  for (const [map, name] of TAXI_ZIELE) {
    const ziel = { visited: map } as const;
    out.push(
      {
        text: `${name} (gratis, Taxikarte)`, when: { all: [ziel, { item: 'kikis-taxikarte' }] },
        effects: [{ travel: map, entry: 'taxi', minutes: 20 }],
      },
      {
        text: `${name} (Freifahrt)`, when: { all: [ziel, { noItem: 'kikis-taxikarte' }, { flag: 'kiki_freifahrt' }] },
        effects: [flag('kiki_freifahrt', false), { travel: map, entry: 'taxi', minutes: 20 }],
      },
      {
        text: `${name} (40 Cr, mit Umweg)`, when: { all: [ziel, { noItem: 'kikis-taxikarte' }, { notFlag: 'kiki_freifahrt' }, { rival: 'kiki-karbon' }] },
        requires: { credits: 40 }, effects: [{ credits: -40 }, { travel: map, entry: 'taxi', minutes: 40 }],
      },
      {
        text: `${name} (20 Cr)`, when: { all: [ziel, { noItem: 'kikis-taxikarte' }, { notFlag: 'kiki_freifahrt' }, { not: { rival: 'kiki-karbon' } }] },
        requires: { credits: 20 }, effects: [{ credits: -20 }, { travel: map, entry: 'taxi', minutes: 20 }],
      },
    );
  }
  return out;
}

const taxi = dialog('kiki-karbon-taxi', [
  knoten('start', [
    KI('Einsteigen, anschnallen, Klappe halten! Wohin, Süße? Kurs liegt an!', 'signatur'),
    erz('Das Schwebetaxi riecht nach Ozon, Kirschduftbaum und kaltem Kaffee. Am Rückspiegel baumeln drei Duftbäume übereinander, der Gurt ist mit Panzertape geflickt, und aus dem Funk knistert es pausenlos.'),
  ], { choices: [...taxiChoices(), { text: 'Doch nicht. Ich lauf.', next: 'laufen' }] }),
  knoten('laufen', [KI('Laufen! Wie im Mittelalter! Viel Spaß mit deinen Knien, Süße. Over and out.', 'wut')]),
]);

// ---------------------------------------------------------------------------------------------- Menü

function menue(): Menue {
  const zurueck: DialogueChoice[] = [{ text: 'Noch was, Kiki.', next: 'menue', id: 'zurueck' }, { text: 'Over and out.' }];

  const flirt = (n: number, tage: Weekday[]): DialogueChoice => ({
    text: 'Mit Kiki flirten.', tag: '[Romanze]', next: `flirt-${n}`, id: `flirt-${n}`,
    when: { all: [ROM, { weekday: tage }] },
  });
  const antworten: DialogueChoice[] = [
    { text: '„Dann fahr langsamer. Ich will was davon haben.“', check: pruefung('kiki-flirt-frech', 'ausstrahlung', 6, ['flirt']), next: 'flirt-a', effects: [herz('kiki-karbon', 10)] },
    { text: '„Ich steig nur wegen der Aussicht ein.“', next: 'flirt-b', effects: [herz('kiki-karbon', 5)] },
    { text: '„Augen auf die Straße, Kiki.“', next: 'flirt-c' },
  ];

  const choices: DialogueChoice[] = [
    { text: 'Taxi! Ich muss wohin.', when: TAXI_FREI, effects: [{ dialogue: 'kiki-karbon-taxi' }] },
    { text: 'Was gibt’s Neues in der Stadt?', next: 'klatsch' },
    {
      text: 'Hast du was gegen „Schwebetaxi Blitz“ in der Hand?', tag: '[Kiki ♥2]', next: 'blitz', once: true, id: 'k-blitz',
      when: { quest: 'side-uebliche-verspaetung', state: 'active' }, requires: { hearts: 'kiki-karbon', min: 2 },
      effects: [flag('kiki_beweisfotos'), { message: 'Kiki schickt dir drei Beweisfotos aufs Telefon.' }],
    },
    { text: 'Wie weit kommt dein Taxi eigentlich?', when: { quest: REICHWEITE, state: 'active' }, next: 'reichweite' },
    {
      text: '„Kiki. Hör auf, mit mir zu flirten. Aria zerlegt sonst dein Taxi.“', when: { all: [VEX, { flag: 'aria_romanze_angebahnt' }] },
      once: true, id: 'k-vex-aria', next: 'vex-aria',
    },
    flirt(1, ['mo', 'fr']),
    flirt(2, ['di', 'sa']),
    flirt(3, ['mi', 'so']),
    flirt(4, ['do']),
    { text: 'Over and out.' },
  ];

  const nodes: DialogueNode[] = [
    knoten('menue', [KI('Noch was? Schnell, Süße, der Taxameter läuft. Also, nicht für dich. Für mein Herz.', 'signatur')], { choices }),
    knoten('klatsch', [
      KI('Neues? Ich bin die Zeitung, Süße! Nur schneller und mit besserer Frisur.', 'freude'),
      KI('Herr Blitz fliegt ohne Lizenz und hat einen Kasten am Armaturenbrett, der piept, wenn die U-Bahn kommt. Zufall, sagt er. Ich sag: Störsender.'),
      KI('Dienstags nachts ist am Container 77 an der Hafenkante Licht. Zwei Leute, ein Koffer. Einer davon hat einen Schnauzer, der Mädchen weinen lässt.', 'signatur'),
      KI('Und am Bahnsteig-Ende hat einer mit Kronkorken was an die Wand gekritzelt. Sieht aus wie ein Notenschlüssel mit Zähnen. Keine Ahnung, was das soll. Aber ich hab’s gesehen. Ich seh alles.'),
    ], { choices: zurueck, effects: [flag('kiki_klatsch_gehoert')] }),
    knoten('blitz', [
      KI('Gegen Blitz? Süße. Ich hab ein ganzes ALBUM.', 'freude'),
      KI('Hier: Blitz, wie er am Stellwerk rumschraubt. Hier: Blitz, wie er den Kasten einbaut. Und hier: Blitz in Unterhose, aber das ist ein anderes Thema.', 'signatur'),
      KI('Nimm die ersten zwei. Das dritte behalte ich. Für schlechte Tage.'),
    ], { choices: zurueck }),
    knoten('reichweite', [
      KI('Bis zur Flutmauer und zurück, wenn ich Rückenwind hab und nicht atme. Der Akku ist von 2071 und hat Asthma.', 'wut'),
      KI('Ich brauch Zellen. Gute. Lötzinn hat welche, die sind teuer. Dexter hat welche, die sind gestohlen. Und Dante kann Wunder, wenn man ihm Kekse bringt.'),
      KI('Dann fliegen wir. Übers Wasser. Bis es blau wird.', 'freude'),
    ], { choices: zurueck }),
    knoten('vex-aria', [
      KI('Flirten? Ich? Mit DIR? Ich flirte mit jedem, Süße, das ist Kundenbindung!', 'ueberrascht'),
      KI('… Okay, mit dir ein bisschen mehr. Weil du so finster guckst, wenn ich das mach. Das ist süß.', 'signatur'),
      KI('Aber gut. Die Brecherin hat letzte Woche meinen Seitenspiegel angeguckt. Nur angeguckt. Der Spiegel ist von alleine abgefallen. Ich hab’s verstanden. Kurs geändert, Funkdisziplin.', 'wut'),
      KI('Ich sag dir was, Vex: Die hat dich gern. Richtig gern. So gern, dass sie Spiegel abguckt. Pass auf das Mädchen auf. Over.'),
    ], { choices: zurueck, effects: [herz('kiki-karbon', 10)] }),
    // Flirt (Romanzefassung, nur mit { romance: 'kiki-karbon' })
    knoten('flirt-1', [KI('Kurs liegt an, Süße. Direkt auf dich. Ich hab keine Bremse eingebaut.', 'signatur')], { choices: antworten }),
    knoten('flirt-2', [KI('Weißt du, was ich an dir mag? Du schnallst dich an. Das ist heutzutage fast schon versaut.', 'freude')], { choices: antworten }),
    knoten('flirt-3', [KI('Meine Rückbank hat Ledersitze. Echte. Die quietschen. Nur so als … Fahrgastinformation.', 'signatur')], { choices: antworten }),
    knoten('flirt-4', [KI('Wenn du mich noch einmal so anguckst, fahr ich gegen einen Laternenmast. Und dann musst du mich retten. Mit Mund-zu-Mund.', 'freude')], { choices: antworten }),
    knoten('flirt-a', [
      KI('Langsamer? Ich? … Für dich schalte ich runter, Süße. Ganz runter. Bis in den ersten Gang.', 'ueberrascht'),
      KI('Oh. Oh, ich bin rot. Funk aus. FUNK AUS. Das hat keiner gehört.', 'signatur'),
    ], { choices: zurueck }),
    knoten('flirt-b', [KI('Die Aussicht. Klar. Die Aussicht ist um die dreißig, laut und hat Kaffeeflecken auf dem Overall. Gern geschehen.', 'freude')], { choices: zurueck }),
    knoten('flirt-c', [KI('Spielverderber. Augen auf die Straße. Na gut. Aber die Ohren bleiben bei dir.', 'signatur')], { choices: zurueck }),
  ];
  return { choices, nodes };
}

const M = menue();

/** Rivalität: Umwege und doppelter Preis; Versöhnung über Duftbaum, Trinkgeld oder Funkjargon. */
const RIVALE: Menue = {
  choices: [
    { text: 'Ihr einen Taxi-Duftbaum an den Spiegel hängen.', when: { item: 'taxi-duftbaum' }, next: 'duftbaum', effects: [{ take: 'taxi-duftbaum' }, { reconcile: 'kiki-karbon' }] },
    { text: 'Trinkgeld für alle Fahrten nachzahlen. 50 Credits.', requires: { credits: 50 }, next: 'trinkgeld', effects: [{ credits: -50 }, { reconcile: 'kiki-karbon' }] },
    {
      text: '„Kiki, hier spricht Fahrgast Eins. Bitte um Landeerlaubnis für eine Entschuldigung. Over.“', next: 'funk',
      check: pruefung('kiki-versoehnung-funk', 'ausstrahlung', 5, ['ueberzeugen']), effects: [{ reconcile: 'kiki-karbon' }],
    },
    { text: 'Over and out.' },
  ],
  nodes: [
    knoten('duftbaum', [
      KI('Kirsche? … Kirsche. Mein Lieblingsduft.', 'ueberrascht'),
      KI('Du bist ein Arsch, Süße. Aber ein Arsch mit Geschmack. Frieden. Normale Preise ab sofort.', 'freude'),
    ]),
    knoten('trinkgeld', [KI('Nachgezahlt. Mit Zinsen. So wird das was mit uns. Kurs liegt wieder an.', 'signatur')]),
    knoten('funk', [
      KI('Landeerlaubnis … erteilt. Du Idiot. Du süßer Idiot.', 'freude'),
      KI('Okay. Schwamm drüber. Aber das nächste Mal, wenn du mich versetzt, lass ich dich über dem Kanal raus.', 'wut'),
    ]),
  ],
};

// ---------------------------------------------------------------------------------------------- Tagesgespräche

const T = {
  rivale: tagesgespraech('kiki-karbon-tag-rivale',
    [KI('Ach, du. Kurs liegt an – auf den Umweg. Doppelter Preis, Süße, ich hab dich auf der schwarzen Liste. Ganz oben. Mit Herzchen. Mit einem ZERBROCHENEN Herzchen.', 'wut')],
    [KI('Über Funk weiß jetzt jeder Taxifahrer in der Unterstadt, dass du kein Trinkgeld gibst. Jeder. Auch die mit den Eselkarren.', 'wut')],
    RIVALE),
  oberstadt: tagesgespraech('kiki-karbon-tag-oberstadt',
    [
      KI('Oha. Feine Schuhe, feines Kinn, feine Nase, die gerade den Bahnhof riecht und es bereut.', 'signatur'),
      KI('Trinkgeld, Schätzchen? Nein? Kommt noch. Bei mir zahlen alle Trinkgeld. Irgendwann aus Angst, irgendwann aus Liebe.', 'freude'),
    ],
    [KI('Oben fliegt keiner selbst. Da fliegen Drohnen. Wir hier unten fliegen noch mit Händen. Und mit Flüchen. Hauptsächlich Flüchen.')],
    M, { effects: [flag('kiki_herkunft')] }),
  vexariaZusammen: tagesgespraech('kiki-karbon-tag-vexaria-zusammen',
    [
      KI('ACHTUNG, ALLE EINHEITEN! Zielperson in Sicht! Die Postbotin persönlich!', 'freude'),
      KI('Sag nichts. Ich weiß es. Die ganze Unterstadt weiß es. Die Ratten im Kanal wissen es. Du und die Brecherin. Zusammen. Offiziell. Mit Händchen.'),
    ],
    [
      KI('Weißt du, was die Taxifahrer am Funk sagen? „Kurierin und Brecherin – das schnellste Paar der Stadt, und keiner von beiden hält an.“ Ich hab’s erfunden. Es ist ein Hit.', 'signatur'),
      KI('Und wenn ihr mal eine Rückbank braucht: Ich fahr ganz langsam. Und ich guck nicht in den Spiegel. Na ja. Ich guck nur ein bisschen in den Spiegel.', 'freude'),
    ],
    M, { effects: [flag('kiki_klatsch_zusammen')] }),
  vexariaKnutsch: tagesgespraech('kiki-karbon-tag-vexaria-knutsch',
    [
      KI('Psst. Postbotin. Komm her. Näher. Ich hab da was gehört.', 'signatur'),
      KI('Hinterausgang High Voltage, Seitengasse, ratternder Lüftungsschacht. Zwei Personen. Eine mit Zöpfen, eine mit Locken. Lange Pause beim Atmen. Stimmt das?'),
    ],
    [KI('Sag nichts! Dein Gesicht hat schon alles gesagt. Dein Gesicht ist eine Plaudertasche. Ich LIEBE dein Gesicht.', 'freude')],
    M, { effects: [flag('kiki_klatsch_knutsch')] }),
  vexariaHand: tagesgespraech('kiki-karbon-tag-vexaria-hand',
    [
      KI('Na, Postbotin? Hand wieder frei? Oder klebt die Brecherin noch dran?', 'freude'),
      KI('Ich hab beim Armdrücken genau hingeguckt. Ihr wart fertig. Und dann wart ihr NICHT fertig. Drei Minuten lang. Ich hab gestoppt.'),
    ],
    [KI('Die Wetten von dem Abend hab ich noch. Fünf zu eins auf die Locken. Und eine neue: zehn zu eins, dass ihr vor der Neonnacht knutscht. Willst du einsteigen? Nein? Feigling.', 'signatur')],
    M, { effects: [flag('kiki_klatsch_hand')] }),
  ariaRomanze: tagesgespraech('kiki-karbon-tag-aria-romanze',
    [KI('Du und Aria! Taxifunk hat’s bestätigt, Süße. Das Mädchen hat gestern beim Schutzgeldeintreiben GESUMMT. Gesummt! Die Rostzähne haben vor Angst freiwillig gezahlt.', 'freude')],
    [KI('Pass auf sie auf. Unter dem ganzen Metall ist die so weich wie Babettes Dampfnudeln. Und genauso heiß, wenn man nicht aufpasst.', 'signatur')],
    M, { effects: [flag('kiki_klatsch_aria')] }),
  zeit: tagesgespraech('kiki-karbon-tag-zeit',
    [
      KI('Ich hab einen Plan, Süße. Einen großen. Mit Akku. Und Wasser. Und dir auf dem Beifahrersitz.', 'freude'),
      erz(ZEIT_HINWEIS),
    ],
    [KI('Noch nicht. Die Stadt hat gerade Turbulenzen. Wenn sich das beruhigt hat, fliegen wir los. Ich spür das im Rotor.', 'neutral')],
    M),
  reichweite: tagesgespraech('kiki-karbon-tag-reichweite',
    [KI('Und? Akkuteile? Zellen? Irgendwas, das länger hält als meine Beziehungen?', 'signatur')],
    [KI('Gestern bin ich bis zur Flutmauer geflogen und hab übers Wasser geguckt. Braun bis zum Horizont. Aber irgendwo dahinter wird’s blau. Ich weiß das. Nebelhorn hat’s geschworen. Nebelhorn schwört viel.', 'neutral')],
    M),
  morgen: tagesgespraech('kiki-karbon-tag-morgen',
    [KI('Taxistand Bahnhof Mitte, Kiki Karbon am Funk! Morgen, Süße! Kaffee? Ich hab drei. Zwei davon sind meine. Der dritte auch.', 'freude')],
    [
      KI('Heute früh: Frau Takt hat ihren Hut im Gleis verloren, Nyra sitzt seit sechs im Netzcafé und redet mit ihrem Bildschirm, und Jimmy – oder einer, der aussieht wie Jimmy – hat am Wartehäuschen geschlafen.'),
      KI('Sag Hunter nichts. Doch. Sag’s ihm. Aber sag nicht, dass es von mir ist. Doch, sag’s. Er soll wissen, dass ich’s wusste.', 'signatur'),
    ],
    M),
  glasarkaden: tagesgespraech('kiki-karbon-tag-glasarkaden',
    [KI('Glasarkaden! Landeplatz für Leute, die nicht laufen wollen. Ich lade sie ab, sie geben kein Trinkgeld, ich lächle. Mein Lächeln kostet extra, die wissen es nur nicht.', 'signatur')],
    [KI('Da vorne im Café sitzt einer mit Goldknauf-Stock. Guckt jeden an, als würde er ihn gleich kaufen. Ich hab ihm einmal den Rotorstaub auf den Anzug geblasen. Aus Versehen. Mit Absicht.', 'wut')],
    M),
  schrottmarkt: tagesgespraech('kiki-karbon-tag-schrottmarkt',
    [KI('Schrottmarkt, Landeplatz zwei! Hier kauf ich meine Ersatzteile. Und meine Ersatz-Ersatzteile. Und Dampfnudeln. Viele Dampfnudeln.', 'freude')],
    [KI('Dexter hat mir letzte Woche einen „original Quantum-Rotor“ verkauft. Es war ein Ventilator mit Aufkleber. Er hat geweint, als ich’s gemerkt hab. Ich hab ihm trotzdem gezahlt. Weil er so schön geweint hat.', 'signatur')],
    M),
  wochenende: tagesgespraech('kiki-karbon-tag-wochenende',
    [KI('Wochenende in der Neon-Gasse! Hier passiert alles, Süße. Und ich bin da, wenn’s passiert. Mit Kamera. Und mit Mund.', 'freude')],
    [KI('Gestern Nacht ist Dante auf der Tanzfläche gegen eine Säule getanzt. Die Säule hat gewonnen. Er hat sich bei ihr entschuldigt. Zweimal.', 'signatur')],
    M),
  abend: tagesgespraech('kiki-karbon-tag-abend',
    [KI('Feierabendverkehr! Alle wollen nach Hause, keiner weiß, wo das ist. Ich bring sie trotzdem hin. Meistens.', 'neutral')],
    [KI('Weißt du, was das Beste an meinem Job ist? Die Leute reden auf der Rückbank, als wäre ich nicht da. Ich bin IMMER da. Ich hab Ohren wie ein Abhörsatellit.', 'signatur')],
    M),
  nacht: tagesgespraech('kiki-karbon-tag-nacht',
    [KI('Nachtschicht vorm High Voltage. Die Besten steigen um zwei Uhr ein. Betrunken, verliebt oder beides. Die zahlen am meisten.', 'freude')],
    [KI('Manchmal, wenn nichts los ist, lieg ich auf dem Taxidach und guck in den Smog. Irgendwo da oben sind Sterne. Und irgendwo da hinten ist das Meer. Ich will beides sehen. Am selben Abend.', 'neutral')],
    M),
  vertraut: tagesgespraech('kiki-karbon-tag-vertraut',
    [KI('Da ist ja mein Lieblingsfahrgast! Funk an alle: Fahrgast Eins ist in Sicht! Wiederhole: Fahrgast Eins!', 'freude')],
    [KI('Für dich hab ich einen eigenen Funkcode. „Sonnenschein“. Weil du mich immer so anguckst, als hätte ich nicht seit zwei Tagen dieselben Socken an. Hab ich übrigens.', 'signatur')],
    M),
  standard: tagesgespraech('kiki-karbon-tag-standard',
    [KI('Kurs liegt an, Süße! Kiki Karbon, ehrliches Schwebetaxi, keine Störsender, keine Ausreden. Was gibt’s?', 'freude')],
    [KI('Wenn du was wissen willst: Frag mich. Ich weiß alles. Und was ich nicht weiß, erfinde ich so gut, dass es stimmt.', 'signatur')],
    M),
};

// ---------------------------------------------------------------------------------------------- Herz-Ereignisse

const he2 = dialog('he-kiki-karbon-2', [
  knoten('start', [
    erz('Morgens am Taxistand. Ein gelbes Schwebetaxi mit Beulen, Aufklebern und einem halb abgerissenen „Schwebetaxi Blitz“-Werbebanner, über das jemand mit Edding „NICHT DIE“ geschrieben hat, sinkt mit lautem Fauchen in die Landebucht.'),
    KI('Achtung, Achtung! Landung in drei, zwei … Mist, zu weit. Egal! Gelandet!', 'freude'),
    erz('Die Tür fliegt auf. Kiki Karbon: Overall, Pilotenbrille im Haar, ein Kaffeebecher in jeder Hand und ein Headset, aus dem es pausenlos knistert.'),
    KI('Du! Ich kenn dich. Du bist die Person, über die alle reden. Und ich bin die Person, die das ganze Reden macht. Wir müssen uns kennenlernen. Sofort. Kaffee?', 'signatur'),
  ], {
    choices: [
      {
        text: 'Ein Gerücht gegen ein Gerücht tauschen. Ich hab eins über Ripper.', next: 'tausch',
        check: pruefung('he-kiki-karbon-2-tausch', 'strasse', 4, ['geruecht']), effects: [herz('kiki-karbon', 40)],
      },
      {
        text: '„Kaffee? Nur, wenn du mir verrätst, wer hier wem was schuldet.“', next: 'charme',
        check: pruefung('he-kiki-karbon-2-charme', 'ausstrahlung', 4, ['ueberzeugen']), effects: [herz('kiki-karbon', 40)],
      },
      { text: '„Trinkgeld, Schätzchen?“ – „Du zuerst.“', tag: '[Oberstadt]', when: { origin: 'origin-oberstadt' }, next: 'oberstadt', effects: [herz('kiki-karbon', 40)] },
      { text: 'Kaffee nehmen. Und einfach zuhören.', next: 'zuhoeren', effects: [herz('kiki-karbon', 30)] },
    ],
  }),
  knoten('tausch', [
    ich('Ripper hat hinter seiner Praxis ein Kühlregal mit der Aufschrift „Ersatzteile – nicht von Kunden“. Darin: Eis am Stiel. Nur Eis am Stiel.'),
    KI('Eis am Stiel. RIPPER. Der Schlächter vom Schrottmarkt isst heimlich Eis am Stiel.', 'ueberrascht'),
    KI('Das ist Gold, Süße. Das geht SOFORT über den Funk. … Okay, mein Gegenzug.', 'freude'),
  ], { next: 'karte' }),
  knoten('charme', [
    KI('Wer wem was schuldet? Ha! Das ist eine Landkarte, keine Frage.', 'freude'),
    KI('Dexter schuldet allen was. Hunter schuldet keinem was, aber alle tun so. Und Ripper schuldet der ganzen Stadt eine Entschuldigung. Die kriegt sie nie.', 'signatur'),
  ], { next: 'karte' }),
  knoten('oberstadt', [
    KI('Du zuerst. HA! Du bist von oben und frech. Das gibt’s selten. Meistens sind die von oben nur teuer.', 'freude'),
    KI('Weißt du, wie viele von euch ich schon geflogen hab? Die zahlen das Doppelte, damit ich nicht über die Unterstadt fliege. Ich flieg trotzdem drüber. Ganz tief.', 'signatur'),
  ], { next: 'karte' }),
  knoten('zuhoeren', [
    erz('Zehn Minuten lang redet Kiki ohne Luft zu holen: über Frau Takts Hut, Dantes Faxgerät, Babettes heimliche Kinderessen und einen Rostzahn, der seiner Mutter jeden Sonntag Blumen klaut.'),
    KI('Du hörst zu! Du hörst wirklich zu! Weißt du, wie selten das ist? Alle anderen setzen Kopfhörer auf, wenn ich einsteige.', 'ueberrascht'),
  ], { next: 'karte' }),
  knoten('karte', [
    erz('Sie zieht dir das Telefon aus der Hand, ohne zu fragen, tippt darauf herum und gibt es zurück. Auf deiner Stadtkarte blinken jetzt kleine gelbe Sterne mit Notizen in Kikis Handschrift: „Blitz-Störsender hier???“ · „Container 77, Di Nacht, Licht“ · „Bahnsteig-Ende: Kritzelei, Jimmy?“'),
    KI('Klatschkarte. Gratis. Alles, was ich weiß und dir nicht hätte sagen sollen.', 'signatur'),
    KI('Und ab heute fliege ich dich. Überall hin, wo du schon mal warst. Zwanzig Credits, zwanzig Minuten, null Ausreden. Die erste Fahrt geht aufs Haus. Kurs liegt an, Süße!', 'freude'),
  ], {
    effects: [flag('kiki_taxi'), flag('kiki_freifahrt'), flag('kiki_klatschkarte'), { message: 'Schwebetaxi freigeschaltet: Kiki fliegt dich zu jeder besuchten Zone.' }],
    choices: [
      { text: 'Gleich losfliegen.', effects: [{ dialogue: 'kiki-karbon-taxi' }] },
      { text: '„Später, Kiki. Danke.“', next: 'ende' },
    ],
  }),
  knoten('ende', [KI('Später! Später ist mein Lieblingswort nach „jetzt“. Over and out, Süße.', 'freude')], { effects: [{ xp: 40 }, herz('kiki-karbon', 20)] }),
]);

const he4 = dialog('he-kiki-karbon-4', [
  knoten('start', [
    erz('Vor dem High Voltage. Kiki lehnt am Taxi, als eine schwarze Quantum-Kurierdrohne über die Neon-Gasse sirrt, direkt über ihrem Dach in der Luft stehen bleibt und eine Leuchtschrift auf den Asphalt projiziert: „LANGSAM. VERALTET. UNTERSTADT.“'),
    KI('Hat die gerade … HAT DIE GERADE MEIN TAXI BELEIDIGT?', 'wut'),
    erz('Die Drohne blinkt. Neue Schrift: „RENNEN? STUFENPLATZ UND ZURÜCK. VERLIERER RÄUMT DEN LUFTRAUM.“'),
    KI('Einsteigen. Sofort. Anschnallen. Gebet sprechen. Wir zerlegen dieses fliegende Bügeleisen.', 'wut'),
    erz('Ein paar Gäste vom High Voltage drängeln sich schon an der Tür. Bruno nimmt Wetten an. Zehn Credits auf Kiki, drei zu eins.'),
  ], {
    choices: [
      { text: 'Zehn Credits auf Kiki setzen.', requires: { credits: 10 }, next: 'start-rennen', effects: [{ credits: -10 }, flag('kiki_wette')] },
      { text: 'Einfach einsteigen.', next: 'start-rennen' },
    ],
  }),
  knoten('start-rennen', [
    erz('Das Taxi springt hoch wie ein getretener Hund. Die Neonschilder schmieren zu Streifen, die Quantum-Drohne zieht glatt und kalt vorbei. Über dem Bahnhof wird es eng: Stromkabel, Wäscheleinen, ein Werbeballon mit Collins Gesicht.'),
    KI('Die nimmt die Kabelschneise! Die ist zu eng für mich! Die ist zu eng für alles, was atmet!', 'ueberrascht'),
  ], {
    choices: [
      {
        text: 'Ins Steuer greifen und zwischen den Kabeln durchfädeln.', next: 'faedeln',
        check: pruefung('he-kiki-karbon-4-faedeln', 'reflexe', 5, ['fahren', 'flink']), effects: [herz('kiki-karbon', 50)],
      },
      {
        text: 'Unters Armaturenbrett tauchen und den Rotor-Begrenzer überbrücken.', next: 'begrenzer',
        check: pruefung('he-kiki-karbon-4-begrenzer', 'technik', 5, ['reparieren', 'tuning']), effects: [herz('kiki-karbon', 50)],
      },
      { text: '„Gib Gas, Kiki! Mitten durch den Ballon!“', next: 'ballon', effects: [herz('kiki-karbon', 30)] },
    ],
  }),
  knoten('faedeln', [
    erz('Du packst das Steuer über ihre Hände. Links, rechts, ein Kabel streift das Dach, eine Unterhose von einer Wäscheleine klatscht gegen die Scheibe – und dann seid ihr durch, eine Rotorlänge vor der Drohne.'),
    KI('DU BIST VERRÜCKT! DU BIST VOLL VERRÜCKT! ICH LIEBE DAS!', 'freude'),
  ], { next: 'sieg' }),
  knoten('begrenzer', [
    erz('Zwei Kabel, ein Funke, ein Fluch. Der Rotor heult auf wie ein Wolf mit Zahnschmerzen, und das Taxi schießt in einer Kurve über die Kabelschneise hinweg, an der Drohne vorbei, die vor Schreck einen Moment lang „FEHLER“ projiziert.'),
    KI('Was hast du gemacht? Was HAST du gemacht? Mach das nie wieder. Mach das sofort nochmal!', 'ueberrascht'),
  ], { next: 'sieg' }),
  knoten('ballon', [
    erz('Kiki gibt Gas. Mitten durch den Werbeballon. Collins Gesicht platzt mit einem dumpfen „Plopp“, Gummifetzen kleben an der Scheibe. Ihr kommt raus, blind, schief – und zwei Meter hinter der Drohne über die Ziellinie.'),
    KI('Zweite! ZWEITE! Mit Collin im Gesicht! Das zählt doppelt!', 'wut'),
    erz('Die Drohne projiziert: „VERLOREN, UNTERSTADT.“ Dann fliegt ihr ein Stück Ballon in den Rotor, und sie trudelt zischend in einen Müllcontainer.'),
    KI('… Okay. DAS zählt. Das zählt total.', 'freude'),
  ], { next: 'ende', effects: [flag('kiki_rennen_knapp')] }),
  knoten('sieg', [
    erz('Zurück vor dem High Voltage. Die Drohne landet hinter euch, projiziert ein kleinlautes „NEUBERECHNUNG“ und fliegt davon. Die Gäste johlen. Bruno zahlt aus.'),
    KI('Siehst du das? SIEHST DU DAS? Unterstadt eins, Oberstadt null! Das geht über den Funk! Das geht über ALLE Funks!', 'freude'),
  ], { next: 'ende', effects: [flag('kiki_rennen_sieg'), { rep: 'unterstadt', delta: 3 }] }),
  knoten('ende', [
    erz('Kiki sitzt noch eine Weile auf der Motorhaube, die Hände zittern, das Grinsen nicht.'),
    KI('Weißt du was? Du bist offiziell mein Kopilot. Mit Funkcode. Ich nenn dich „Sonnenschein“. Widerspruch zwecklos.', 'signatur'),
  ], {
    effects: [{ xp: 60 }, herz('kiki-karbon', 20)],
    choices: [
      { text: 'Wettgewinn abholen.', when: { all: [{ flag: 'kiki_wette' }, { flag: 'kiki_rennen_sieg' }] }, next: 'wette', effects: [{ credits: 30 }, flag('kiki_wette', false)] },
      { text: '„Sonnenschein. Ernsthaft?“', next: 'sonnenschein' },
    ],
  }),
  knoten('wette', [erz('Bruno zählt dir dreißig Credits in die Hand. „Drei zu eins. Hätt ich auch auf sie gesetzt. Hab ich aber nicht. Fragt nicht.“')]),
  knoten('sonnenschein', [KI('Ernsthaft. Ich hab auch einen für Hunter. „Wolke“. Sag’s ihm nicht.', 'freude')]),
]);

const he6 = dialog('he-kiki-karbon-6', [
  knoten('start', [
    erz('Nacht. Das Taxi steht vor dem High Voltage, Motor aus. Kiki liegt auf dem Dach, die Arme hinter dem Kopf, und schaut in den Smog. Sie klopft neben sich aufs Blech.'),
    KI('Komm hoch. Das Dach hält. Meistens. Wenn nicht, verklagen wir Dexter.', 'neutral'),
    erz('Du kletterst hoch. Das Blech ist noch warm vom Motor.'),
    KI('Weißt du, warum ich Taxi fahre? Nicht wegen dem Geld. Das Geld ist scheiße. Wegen dem Moment, wenn man ganz oben ist und alles klein wird. Die Schulden. Der Ärger. Die Leute.', 'neutral'),
    KI('Und dann guck ich immer nach Westen. Hinter die Flutmauer. Da ist das Meer. Ich war noch nie da. Mein Akku schafft’s nicht. Ich bin dreißig, ich fliege seit zwölf Jahren, und ich war noch nie am Meer.', 'wut'),
  ], {
    choices: [
      {
        text: '„Dann bauen wir dir einen besseren Akku. Lass mich mal unter die Haube gucken.“', next: 'akku',
        check: pruefung('he-kiki-karbon-6-akku', 'technik', 6, ['reparieren']), effects: [herz('kiki-karbon', 50), flag('kiki_akku_geprueft')],
      },
      { text: '„Babette kommt vom Meer. Aus Möwenhafen. Sie sagt, da klauen einem die Möwen die Nudeln.“', when: { flag: 'babette_moewenhafen' }, next: 'moewen', effects: [herz('kiki-karbon', 40), herz('babette-bao', 10)] },
      { text: '„Wenn du hinfliegst, will ich mit.“', next: 'mit', effects: [herz('kiki-karbon', 40)] },
      { text: 'Neben ihr liegen bleiben und schweigend in den Smog gucken.', next: 'schweigen', effects: [herz('kiki-karbon', 35)] },
    ],
  }),
  knoten('akku', [
    erz('Unter der Haube: ein Akku, der aussieht wie ein Schuhkarton mit Ausschlag. Drei Zellen sind aufgebläht, eine summt verdächtig, und jemand hat „VIEL GLÜCK“ auf das Gehäuse geschrieben.'),
    ich('Drei Zellen sind hin. Mit neuen Zellen und einer Kühlung kommst du doppelt so weit. Mindestens.'),
    KI('Doppelt? DOPPELT? Doppelt ist … doppelt ist Meer!', 'ueberrascht'),
  ], { next: 'plan' }),
  knoten('moewen', [
    KI('Babette? Unsere Babette? Vom MEER?', 'ueberrascht'),
    KI('Möwen, die Nudeln klauen. Das ist das Schönste, was ich je gehört hab. Ich will beklaut werden. Von einer Möwe. Am Strand.', 'freude'),
  ], { next: 'plan' }),
  knoten('mit', [
    KI('Mit? Du willst mit? Echt jetzt? Kein „mal sehen“, kein „wenn ich Zeit hab“?', 'ueberrascht'),
    ich('Echt jetzt.'),
    KI('Dann ist das ein Vertrag. Funkvertrag. Der ist bindender als jeder Stempel vom Richter.', 'freude'),
  ], { next: 'plan' }),
  knoten('schweigen', [
    erz('Ihr liegt eine ganze Weile so da. Aus dem Club wummert Bass durch das Blech. Irgendwo hupt ein Lastwagen. Kiki sagt nichts. Kiki sagt sonst immer etwas.'),
    KI('Weißt du, das ist das erste Mal, dass ich mit jemandem auf dem Dach liege und nicht rede. Das ist komisch. Das ist gut komisch.', 'neutral'),
  ], { next: 'plan' }),
  knoten('plan', [
    KI('Okay. Plan. Ich brauch Akkuteile. Gute Zellen, eine Kühlung, und jemanden, der das alles zusammensteckt, ohne dass wir in die Luft fliegen. Also, in die falsche Luft.', 'signatur'),
    KI('Hilfst du mir? Und wenn wir’s schaffen, fliegen wir zusammen. Über die Mauer. Bis es blau wird.', 'freude'),
  ], { effects: [{ startQuest: REICHWEITE }, { xp: 80 }, herz('kiki-karbon', 20), flag('kiki_will_ans_meer')] }),
]);

// ♥8 und ♥10: angelegt, erst ab act2 (world.md §11.2).
const he8 = dialog('he-kiki-karbon-8', [
  knoten('start', [
    erz('Früh am Morgen. Das Taxi brummt mit neuem Akku, Kiki trägt die Pilotenbrille auf der Nase statt im Haar. Das heißt, es ist ernst.'),
    KI('Testflug. Bis an den Rand der Ödnis und zurück. Wenn der Akku hält, ist das Meer nur noch eine Frage der Zeit. Und des Mutes. Mut hab ich. Zeit klau ich.', 'signatur'),
    erz('Ihr fliegt über die Rohrsiedlung, über die Staubstraße, bis der Sand anfängt. Am Horizont flimmert die Hitze. Kiki lacht laut und lange.'),
    KI('ER HÄLT! ER HÄLT! Sonnenschein, wir fliegen weiter als jemals irgendwer von Taxi Karbon!', 'freude'),
  ], {
    effects: [flag('kiki_testflug'), { xp: 120 }],
    choices: [{ text: '„Und als Nächstes: das Meer.“', next: 'meer' }],
  }),
  knoten('meer', [KI('Als Nächstes das Meer. Funkvertrag. Du bist dabei.', 'freude')], { effects: [herz('kiki-karbon', 40)] }),
]);

const he10 = dialog('he-kiki-karbon-10', [
  knoten('start', [
    erz('Neon-Gasse, Nacht. Kiki drückt dir eine laminierte Karte in die Hand. Darauf: ein gezeichnetes Taxi, ein Herz, ein Stempel „TAXI KARBON – FAHRGAST EINS – LEBENSLANG GRATIS“.'),
    KI('Meine Taxikarte. Die einzige, die es gibt. Wer die hat, fliegt umsonst. Überall hin. Für immer. Auch wenn ich sauer bin. Dann flieg ich nur schneller.', 'signatur'),
  ], {
    effects: [{ give: 'kikis-taxikarte' }, flag('kiki_taxikarte'), { xp: 200 }],
    choices: [
      { text: '„Danke, Kiki. Fahrgast Eins meldet sich ab. Over.“', next: 'over' },
      { text: '„Und wenn ich vorne sitzen will? Ganz nah?“', tag: '[Romanze]', when: ROM, next: 'nah' },
    ],
  }),
  knoten('over', [KI('Abmelden gibt’s nicht. Du bist auf Dauerempfang, Sonnenschein.', 'freude')], { effects: [herz('kiki-karbon', 50)] }),
  knoten('nah', [
    KI('Vorne. Ganz nah. Hm.', 'ueberrascht'),
    erz('Sie zieht dich am Kragen auf den Beifahrersitz, lehnt sich herüber, bis ihre Pilotenbrille gegen deine Stirn stößt, und küsst dich. Schnell, laut, mit einem Lachen mittendrin, wie alles bei ihr.'),
    KI('Funk aus. Diesmal wirklich. Das hier erzähl ich keinem. Zum ersten Mal in meinem Leben.', 'signatur'),
  ], { effects: [herz('kiki-karbon', 60), flag('kiki_romanze_kuss')] }),
]);

// ---------------------------------------------------------------------------------------------- Figur

const kiki: NpcDef = {
  id: 'kiki-karbon',
  name: 'Kiki Karbon',
  unknownName: 'Taxifahrerin',
  portrait: 'kiki-karbon',
  sprite: 'kiki-karbon-walk',
  faction: 'unterstadt',
  romanceable: true,
  bio: 'Schwebetaxi-Fahrerin um die dreißig, fährt für „Taxi Karbon“, die ehrliche Konkurrenz von „Schwebetaxi Blitz“. Schnell, laut, Klatschbase mit Funkjargon („Kurs liegt an, Süße!“). Will einmal bis ans Meer fliegen.',
  gifts: {
    loves: ['taxi-duftbaum', 'ersatz-rotor', 'lio-demo-chip'],
    likes: ['volt-limo', 'sonnenbrille-gold', 'stickerbogen', 'neon-limo', 'echtobst-apfel', 'hofhonig'],
    dislikes: ['tai-chi-tee', 'gesetzbuch'],
    hates: ['kanalschlamm', 'rostige-dose', 'virus-implantat'],
  },
  schedule: [
    { slot: 'morgen', place: { map: 'bahnhof-mitte', at: 'taxistand' } },
    { slot: 'tag', days: ['mo', 'mi', 'fr'], place: { map: 'glasarkaden', at: 'kiki-landeplatz' } },
    { slot: 'tag', days: ['di', 'do'], place: { map: 'schrottmarkt', at: 'taxi-landeplatz' } },
    { slot: 'tag', days: ['sa', 'so'], place: { map: 'neon-gasse', at: 'vorplatz' } },
    { slot: ['abend', 'nacht'], place: { map: 'neon-gasse', at: 'vorplatz' } },
  ],
  heartEvents: [
    { id: 'he-kiki-karbon-2', hearts: 2, map: 'bahnhof-mitte', time: 'morgen', dialogue: 'he-kiki-karbon-2' },
    { id: 'he-kiki-karbon-4', hearts: 4, map: 'neon-gasse', time: ['abend', 'nacht'], dialogue: 'he-kiki-karbon-4' },
    { id: 'he-kiki-karbon-6', hearts: 6, map: 'neon-gasse', time: 'nacht', dialogue: 'he-kiki-karbon-6' },
    { id: 'he-kiki-karbon-8', hearts: 8, map: 'bahnhof-mitte', time: 'morgen', when: { all: [AB_AKT2, { quest: REICHWEITE, state: 'done' }] }, dialogue: 'he-kiki-karbon-8' },
    { id: 'he-kiki-karbon-10', hearts: 10, map: 'neon-gasse', time: 'nacht', when: { all: [AB_AKT2, { seen: 'he-kiki-karbon-8' }] }, dialogue: 'he-kiki-karbon-10' },
  ],
  talk: [
    rede('kiki-karbon-tag-rivale', { rival: 'kiki-karbon' }),
    rede('kiki-karbon-tag-oberstadt', { all: [{ origin: 'origin-oberstadt' }, { notFlag: 'kiki_herkunft' }] }),
    // Klatschbase des Strangs Vex × Aria: jede Stufe einmal, die neueste zuerst.
    rede('kiki-karbon-tag-vexaria-zusammen', { all: [VEX, { flag: 'aria_romanze_zusammen' }, { notFlag: 'kiki_klatsch_zusammen' }] }),
    rede('kiki-karbon-tag-vexaria-knutsch', { all: [VEX, { flag: 'vexaria_knutsch' }, { notFlag: 'kiki_klatsch_knutsch' }, { notFlag: 'aria_romanze_zusammen' }] }),
    rede('kiki-karbon-tag-vexaria-hand', { all: [VEX, { flag: 'vexaria_hand' }, { notFlag: 'kiki_klatsch_hand' }, { notFlag: 'vexaria_knutsch' }] }),
    rede('kiki-karbon-tag-aria-romanze', { all: [{ not: VEX }, { flag: 'aria_romanze_zusammen' }, { notFlag: 'kiki_klatsch_aria' }] }),
    rede('kiki-karbon-tag-zeit', NICHT_AKT2, 8),
    rede('kiki-karbon-tag-reichweite', { quest: REICHWEITE, state: 'active' }),
    rede('kiki-karbon-tag-vertraut', undefined, 6),
    rede('kiki-karbon-tag-morgen', { time: 'morgen' }),
    rede('kiki-karbon-tag-glasarkaden', { all: [{ time: 'tag' }, { weekday: ['mo', 'mi', 'fr'] }] }),
    rede('kiki-karbon-tag-schrottmarkt', { all: [{ time: 'tag' }, { weekday: ['di', 'do'] }] }),
    rede('kiki-karbon-tag-wochenende', { time: 'tag' }),
    rede('kiki-karbon-tag-abend', { time: 'abend' }),
    rede('kiki-karbon-tag-nacht', { time: 'nacht' }),
    rede('kiki-karbon-tag-standard'),
  ],
};

export const part: ContentPart = {
  npcs: { 'kiki-karbon': kiki },
  dialogues: sammle(
    taxi,
    T.rivale, T.oberstadt, T.vexariaZusammen, T.vexariaKnutsch, T.vexariaHand, T.ariaRomanze, T.zeit, T.reichweite,
    T.morgen, T.glasarkaden, T.schrottmarkt, T.wochenende, T.abend, T.nacht, T.vertraut, T.standard,
    he2, he4, he6, he8, he10,
  ),
  // Taxifunk an jedem Landepunkt (Einstieg `taxi`) der Außenzonen; am Bahnhof steht schon der Taxistand der Karte.
  mapAdditions: Object.fromEntries(
    TAXI_ZIELE.filter(([map]) => map !== 'bahnhof-mitte').map(([map]) => [map, {
      hotspots: [{
        id: 'kiki-taxifunk', at: 'taxi', radius: 48, label: 'Kiki per Taxifunk rufen', kind: 'use' as const,
        when: TAXI_FREI, dialogue: 'kiki-karbon-taxi',
      }],
    }]),
  ),
  phone: {
    'tel-kiki-rennen': {
      id: 'tel-kiki-rennen', from: 'kiki-karbon',
      text: 'Süße! Heute Abend vorm High Voltage. Eine Quantum-Drohne hat mein Taxi „veraltet“ genannt. Ich brauch einen Kopiloten. Und einen Zeugen. Kurs liegt an!',
      auto: { all: [{ hearts: 'kiki-karbon', min: 4 }, neu('he-kiki-karbon-4')] },
      replies: [{ text: 'Ich bin dabei.' }, { text: 'Ist das legal?', effects: [herz('kiki-karbon', 5)] }],
    },
  },
};

