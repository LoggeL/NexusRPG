// Kiki Karbon in Akt 2, Akt 3 und im Nachspiel (world.md §3.3, §4.4, §4.7, act23.json he-kiki-karbon-8/10).
// Kein eigener Inhaltsteil: kiki-karbon.ts holt Menü-Ergänzung, Phasen, Fernziele, Taxifunk-Punkte und he-8/10 von hier.
// Romanze (Geständnis ♥8, Kuss ♥10, Nacht mit Abblende, Morgen danach) hängt an { romance: 'kiki-karbon' } und bleibt
// Freundschaft, solange Kiki nicht in ROMANCE_ENABLED steht.
import type { ContentPart } from '../../part';
import type { Condition, CutsceneDef, DialogueDef, ScheduleEntry, TalkDef } from '../../../modules/contracts';
import {
  type Menue, AKT2_NUR, AKT3_NACHT, ARIA_GECHIPPT, COUNTDOWN_DONE, ENDE_3B, ENDE_MEER, ENDE_NEXUS, EPILOG_FREI, MASTER,
  NYRA_WEG, PARTY_VORB, dialog, erz, flag, herz, knoten, phasen, pruefung, rede, sprecher,
} from './_helfer';

const KI = sprecher('kiki-karbon');
const ROM: Condition = { romance: 'kiki-karbon' };
const REICHWEITE_DONE: Condition = { quest: 'pers-kiki-reichweite', state: 'done' };

/** Fernziele des Schwebetaxis: Ödnis nach Kikis Reichweiten-Umbau, das Meer erst im Nachspiel. */
export const TAXI_WEIT: readonly (readonly [map: string, name: string, when: Condition])[] = [
  ['staubstrasse', 'Staubstraße', REICHWEITE_DONE],
  ['aussiedlerhof', 'Aussiedlerhof', REICHWEITE_DONE],
  ['funkturm-ruine', 'Funkturm-Ruine', REICHWEITE_DONE],
  ['glasduenen', 'Glasdünen', REICHWEITE_DONE],
  ['das-meer', 'Das Meer', EPILOG_FREI],
];

// ---------------------------------------------------------------------------------------------- Menü (ab Akt 2)

export const MENUE_23: Menue = {
  choices: [
    {
      text: 'Was gibt’s Neues im Funk?', next: 'k23-funk-a',
      when: { all: [AKT2_NUR, { weekday: ['mo', 'mi', 'fr', 'so'] }, { notFlag: 'heute_kiki_funk' }] }, effects: [flag('heute_kiki_funk')],
    },
    {
      text: 'Was gibt’s Neues im Funk?', next: 'k23-funk-b',
      when: { all: [AKT2_NUR, { weekday: ['di', 'do', 'sa'] }, { notFlag: 'heute_kiki_funk' }] }, effects: [flag('heute_kiki_funk')],
    },
    {
      text: 'Wie hoch fliegen die Quantum-Drohnen eigentlich?', next: 'k23-drohnen',
      when: { all: [AKT2_NUR, { notFlag: 'kiki_23_drohnen' }] }, effects: [flag('kiki_23_drohnen'), herz('kiki-karbon', 10)],
    },
  ],
  nodes: [
    knoten('k23-funk-a', [
      KI('Funk-Klatsch, frisch gezapft: Ripper verkauft gefälschte Chrome-10-Chips. Die fälschen sogar das Lächeln. Und Schwebetaxi Blitz hat jetzt Quantum-Werbung auf dem Dach. „Blitz – wir bringen Sie ans Ziel. Ihr Ziel bestimmen wir.“', 'signatur'),
      KI('Ich hab draufgeschrieben: „Und euren Fahrer gleich mit.“ Mit Edding. Bei hundertzwanzig Sachen.'),
    ], { next: 'menue' }),
    knoten('k23-funk-b', [
      KI('Funk-Klatsch, Kanal drei: Eine Gechippte hat ihrem Mann die Hand geschüttelt. Zur Begrüßung. Nach zwanzig Jahren Ehe. Er hat geweint. Sie hat gelächelt. Kurs liegt an, aber wohin, Süße?', 'besorgt'),
      KI('Und auf Kanal vier spielt seit gestern einer rückwärts Lieder. Ich glaub, das ist Lio. Oder ein Geist. Bei Lio weiß man’s nie.'),
    ], { next: 'menue' }),
    knoten('k23-drohnen', [
      KI('Unter der Wolkendecke. Genau so hoch, wie ich gern fliege. Die stehen da wie Verkehrshütchen in der Luft und scannen jeden, der vorbeikommt.', 'wut'),
      KI('Ich hab ausgerechnet: Zwischen den Masten am Bahnhof ist eine Lücke von elf Metern. Mein Taxi ist zehn Meter breit. Ich lebe davon, dass das reicht.', 'signatur'),
    ], { choices: [{ text: 'Noch was, Kiki.', next: 'menue' }, { text: 'Over and out, Kiki.' }] }),
  ],
};

// ---------------------------------------------------------------------------------------------- Herz-Ereignis 8

/** ♥8 (Bahnhof, morgens, act2 nach pers-kiki-reichweite): Testflug über die Mauer, Drohnensperre, Landung an der Staubstraße. */
const he8 = dialog('he-kiki-karbon-8', [
  knoten('start', [
    erz('Früh am Morgen. Das Taxi brummt mit dem neuen Akku wie ein zufriedener Kater. Kiki trägt die Pilotenbrille auf der Nase statt im Haar. Das heißt, es ist ernst.'),
    KI('Testflug, Süße. Über die Mauer, bis an die Staubstraße. Wenn der Akku das hält, ist das Meer nur noch eine Frage der Zeit. Und des Mutes. Mut hab ich. Zeit klau ich.', 'signatur'),
    KI('Ein kleines Problem: Quantum hat über der Flutmauer eine Drohnensperre gespannt. Seit dem Chip-Ding lassen die keinen mehr raus. Oder rein. Oder irgendwas.', 'besorgt'),
  ], {
    choices: [
      { text: 'Einsteigen. Vorne.', next: 'flug' },
      { text: '„Bist du sicher, dass das Ding fliegt?“', next: 'sicher', effects: [herz('kiki-karbon', 10)] },
    ],
  }),
  knoten('sicher', [KI('Sicher? Ich bin Taxifahrerin in der Unterstadt. Ich war seit 2079 nicht mehr sicher. Steig ein.', 'freude')], { next: 'flug' }),
  knoten('flug', [
    erz('Ihr hebt ab. Unter euch die Rohrsiedlung, die Dächer des Schrottmarkts, die Flutmauer, grau wie ein schlechter Tag. Und davor: eine Kette aus weißen Drohnen, im Abstand von zehn Metern, rote Linsen, alle auf euch gerichtet.'),
    KI('Hallo, Verkehrshütchen. Heute nicht.', 'signatur'),
  ], {
    choices: [
      {
        text: 'Ihr das Steuer abnehmen und durch die Lücke fädeln.', next: 'gefaedelt',
        check: pruefung('he-kiki-karbon-8-faedeln', 'reflexe', 6, ['fahren', 'flink']), effects: [herz('kiki-karbon', 40)],
      },
      {
        text: 'Den Transponder auf „Quantum-Lieferdienst“ umflashen.', next: 'getarnt',
        check: pruefung('he-kiki-karbon-8-transponder', 'technik', 5, ['hacken', 'tuning']), effects: [herz('kiki-karbon', 40)],
      },
      { text: '„Unten durch. Am Kanal entlang, im Staub. Dauert länger, aber keiner sieht uns.“', next: 'umweg', effects: [herz('kiki-karbon', 30), { advanceTime: 60 }] },
    ],
  }),
  knoten('gefaedelt', [
    erz('Du ziehst das Taxi auf die Seite. Zwei Drohnen schrammen am Lack vorbei, eine dritte verliert den Rotor am Duftbaum. Kiki kreischt. Vor Freude. Glaubst du.'),
    KI('DU HAST MEINEN DUFTBAUM GEOPFERT! ICH LIEBE DICH! … Also. Fahrerisch.', 'freude'),
  ], { next: 'draussen' }),
  knoten('getarnt', [
    erz('Ein Kabel, ein Klick, ein Fluch. Auf dem Display steht jetzt: „QUANTUM LOGISTIK – PRIORITÄT GRÜN“. Die Drohnen rücken auseinander und salutieren. Eine wünscht euch „einen produktiven Tag“.'),
    KI('Die haben uns einen produktiven Tag gewünscht. Ich hab mich noch nie so beleidigt gefühlt. Ich liebe es.', 'freude'),
  ], { next: 'draussen' }),
  knoten('umweg', [
    erz('Kiki taucht ab, bis die Kufen fast das Kanalwasser streifen. Eine Stunde lang fliegt ihr durch Rohre, unter Brücken und durch einen Staubvorhang, der nach Rost und Zukunft schmeckt.'),
    KI('Weißt du was? Langsam ist auch schön. Sag das keinem. Mein Ruf.', 'signatur'),
  ], { next: 'draussen' }),
  knoten('draussen', [
    erz('Hinter der Mauer wird der Himmel weiter. Sand, Masten, eine Straße, die bis zum Horizont geht und noch ein Stück darüber hinaus. Kiki lacht laut und lange.'),
    KI('ER HÄLT! ER HÄLT! Sonnenschein, wir fliegen weiter als jemals irgendwer von Taxi Karbon!', 'freude'),
    KI('Ich setz uns an der Staubstraße ab. Ab heute flieg ich die Ödnis an. Hof, Funkturm, Glasdünen. Alles, wo man landen kann, ohne dass einen ein Sandwurm frisst.'),
  ], {
    effects: [flag('kiki_testflug'), flag('kiki_oednis_route'), { xp: 120 }],
    choices: [
      { text: '„Und als Nächstes: das Meer.“', next: 'meer' },
      { text: '„Warum hast du ausgerechnet mich mitgenommen?“', tag: '[Romanze]', when: ROM, next: 'gestaendnis' },
    ],
  }),
  knoten('meer', [KI('Als Nächstes das Meer. Funkvertrag. Du bist dabei. Erster Platz, vorne, mit Gurt aus echtem Panzertape.', 'freude')], {
    effects: [herz('kiki-karbon', 30), { travel: 'staubstrasse', entry: 'taxi', minutes: 30 }],
  }),
  knoten('gestaendnis', [
    erz('Sie landet nicht gleich. Sie lässt das Taxi über der Straße schweben, Motor im Leerlauf, und schiebt die Pilotenbrille ins Haar.'),
    KI('Weil ich, wenn ich an die Kante der Welt fliege, jemanden neben mir haben will, der nicht schreit. Also, nicht aus Angst. Nur aus Freude.', 'verlegen'),
    KI('Und weil ich seit Wochen den Funk ausmache, wenn du einsteigst. Ich. Kiki Karbon. Funk aus. Weißt du, was das heißt? Das heißt, ich hab mich verfranzt. In dich.', 'zaertlich'),
  ], {
    choices: [
      { text: '„Dann flieg weiter in die Richtung.“', next: 'richtung', effects: [herz('kiki-karbon', 40), flag('kiki_romanze_gestanden')] },
      { text: '„Kiki, ich mag dich. Als Kopilot.“', next: 'kopilot', effects: [herz('kiki-karbon', 20)] },
    ],
  }),
  knoten('richtung', [
    erz('Sie beugt sich herüber. Kurz bevor eure Nasen sich berühren, plärrt der Funk los: „KIKI! WO BIST DU? HIER STEHT EIN GAST MIT DREI KOFFERN UND EINER ZIEGE!“'),
    KI('Dexter. Natürlich Dexter. Ich bring ihn um. Mit Liebe, aber um.', 'wut'),
    KI('Nicht vergessen, wo wir waren, Sonnenschein. Ich vergess es nicht.', 'zaertlich'),
  ], { effects: [{ travel: 'staubstrasse', entry: 'taxi', minutes: 30 }] }),
  knoten('kopilot', [KI('Kopilot. Klar. Ist auch ein guter Platz. Der beste nach dem anderen. Vergiss, was ich gesagt hab. Funk wieder an.', 'verlegen')], {
    effects: [{ travel: 'staubstrasse', entry: 'taxi', minutes: 30 }],
  }),
]);

// ---------------------------------------------------------------------------------------------- Herz-Ereignis 10

/** ♥10 (Neon-Gasse, nachts, act2 nach ♥8): Taxikarte; mit Romanze Kuss, Nacht mit Abblende, Morgen danach. */
const he10 = dialog('he-kiki-karbon-10', [
  knoten('start', [
    erz('Neon-Gasse, Nacht. Das Taxi parkt schief vor dem Vorplatz, Warnblinker an, Musik aus. Kiki sitzt auf der Motorhaube und dreht etwas Laminiertes zwischen den Fingern.'),
    KI('Ich hab was für dich. Hat drei Abende gedauert. Und zwei Folien. Die erste hab ich vollgeheult. Vor Lachen! Vor Lachen.', 'verlegen'),
    erz('Sie drückt dir eine Karte in die Hand. Darauf: ein gezeichnetes Taxi, ein Herz, ein Stempel „TAXI KARBON – FAHRGAST EINS – LEBENSLANG GRATIS“.'),
    KI('Meine Taxikarte. Die einzige, die es gibt. Wer die hat, fliegt umsonst. Überall hin. Für immer. Auch wenn ich sauer bin. Dann flieg ich nur schneller.', 'signatur'),
  ], {
    effects: [{ give: 'kikis-taxikarte' }, flag('kiki_taxikarte'), { xp: 200 }],
    choices: [
      { text: '„Danke, Kiki. Fahrgast Eins meldet sich ab. Over.“', next: 'over' },
      {
        text: '„Wo ist der Haken? Bei dir gibt’s immer einen Haken.“', next: 'haken',
        check: pruefung('he-kiki-karbon-10-haken', 'strasse', 6, ['geruecht', 'durchschauen']), effects: [herz('kiki-karbon', 30)],
      },
      { text: '„Und wenn ich vorne sitzen will? Ganz nah?“', tag: '[Romanze]', when: ROM, next: 'nah' },
    ],
  }),
  knoten('over', [KI('Abmelden gibt’s nicht. Du bist auf Dauerempfang, Sonnenschein.', 'freude')], { effects: [herz('kiki-karbon', 50)] }),
  knoten('haken', [
    KI('Der Haken. Okay. Erwischt. Auf der Rückseite steht klein: „Fahrgast Eins muss sich jeden Klatsch anhören. Ungekürzt. Mit Stimmen.“', 'signatur'),
    KI('Und ganz klein darunter, das musst du nicht lesen: „Und wenn ich ans Meer fliege, kommst du mit.“', 'verlegen'),
  ], { effects: [herz('kiki-karbon', 40), flag('kiki_meer_versprochen')] }),
  knoten('nah', [
    KI('Vorne. Ganz nah. Hm.', 'ueberrascht'),
    erz('Sie zieht dich am Kragen von der Motorhaube auf den Beifahrersitz, lehnt sich herüber, bis ihre Pilotenbrille gegen deine Stirn stößt, und küsst dich. Schnell, laut, mit einem Lachen mittendrin, wie alles bei ihr. Dann ein zweites Mal. Langsam. Das passt gar nicht zu ihr. Es passt perfekt.'),
    KI('Funk aus. Diesmal wirklich. Das hier erzähl ich keinem. Zum ersten Mal in meinem Leben hab ich Klatsch, den ich behalte.', 'zaertlich'),
  ], {
    effects: [herz('kiki-karbon', 60), flag('kiki_romanze_kuss')],
    choices: [
      { text: '„Bleib heute Nacht.“', next: 'nacht' },
      { text: '„Langsam, Karbon. Wir haben Zeit.“', next: 'langsam' },
    ],
  }),
  knoten('nacht', [
    KI('Ich parke nie über Nacht. Strafzettel, Diebe, Tauben. … Ich park heute über Nacht.', 'verlegen'),
  ], { effects: [flag('kiki_nacht'), { cutscene: 'szene-kiki-nacht' }], next: 'morgen' }),
  knoten('morgen', [
    erz('Morgen danach. Das Taxi steht noch immer schief vor dem Vorplatz. Auf der Windschutzscheibe klebt ein Strafzettel und darunter, von innen beschlagen, ein Herz mit einem Fingerabdruck.'),
    KI('Guten Morgen, Fahrgast Eins. Kaffee ist kalt, Brötchen sind von gestern, und mein Funk hat dreiundvierzig verpasste Anrufe. Ich ruf keinen zurück.', 'zaertlich'),
    KI('Weißt du, was das Verrückteste ist? Ich will’s keinem erzählen. Ich will’s einfach nur noch mal.', 'freude'),
  ], { effects: [herz('kiki-karbon', 30), { advanceTime: 480 }] }),
  knoten('langsam', [KI('Wir haben Zeit. Sagt jemand zu einer Taxifahrerin. Süß. Okay. Ich fahr Schrittgeschwindigkeit. Für dich.', 'freude')], { effects: [herz('kiki-karbon', 20)] }),
]);

/** Einmal am Tag nach der Nacht: Kiki hält dicht – fast. */
const morgenDanach = dialog('kiki-karbon-morgen-danach', [
  knoten('start', [
    KI('Psst. Kein Wort. Ich hab’s keinem erzählt. Nur Babette. Und Babette erzählt’s nur dem Richter. Und der ist zur Verschwiegenheit verpflichtet. Glaub ich.', 'verlegen'),
    KI('Okay, der halbe Schrottmarkt weiß Bescheid. Aber nicht von mir! Von meinem Gesicht. Mein Gesicht klatscht. Ich kann nichts dafür.', 'freude'),
  ], { effects: [flag('kiki_morgen_danach'), herz('kiki-karbon', 10)] }),
]);

const cutscenes: CutsceneDef[] = [
  {
    id: 'szene-kiki-nacht', title: 'Funk aus',
    beats: [
      { image: 'black', fade: 'in', lines: [KI('Funk aus. Licht aus. Warnblinker … lass den an. Sieht hübsch aus.', 'zaertlich')], hold: 1200 },
      { image: 'black', fade: 'out', caption: 'Der Warnblinker tickt die ganze Nacht. Irgendwann zählt niemand mehr mit.', hold: 1400 },
    ],
    gallery: false,
  },
];

// ---------------------------------------------------------------------------------------------- Phasen, Fahrplan, Taxifunk

export function akt23(M: Menue): { dialogues: DialogueDef[]; talk: TalkDef[]; schedule: ScheduleEntry[]; teil: ContentPart } {
  const p = phasen('kiki-karbon', 'kiki-karbon-23', M, [
    {
      id: 'master', when: MASTER, ohneMenue: true,
      gruss: [
        KI('Kein Taxi. Nicht für dich. Nicht mehr.', 'wut'),
        erz('Sie lässt den Motor an und fliegt so knapp über dich hinweg, dass dir der Duftbaum gegen die Stirn klatscht. Kirsche. Und Verachtung.'),
      ],
    },
    {
      id: 'ende-3b', when: ENDE_3B, einmal: true,
      gruss: [
        KI('Sonnenschein! Du bist wieder auf Empfang! Ich hab drei Tage lang auf deiner Frequenz gerauscht, nur damit du weißt, dass da noch wer ist.', 'freude'),
        KI('Und jetzt? Jetzt fliegen wir ans Meer. Wie versprochen. Ich hab vollgetankt. Ich hab sogar einen neuen Duftbaum. „Meeresbrise“. Ich wollte vorbereitet sein.'),
      ],
    },
    {
      id: 'ende-nexus', when: ENDE_NEXUS, einmal: true,
      gruss: [
        KI('Die neue Stadt-KI hat mir eine Fluglizenz geschickt. Eine echte! Mit meinem Foto drauf! Ich seh aus wie eine Verbrecherin. Perfekt.', 'freude'),
        KI('Und die Drohnensperre ist weg. Jetzt flieg ich überall hin. Die KI hat gefragt, ob sie mal mitfliegen darf. Ich hab Ja gesagt. Sie hat die ganze Zeit „Huiii“ gemacht. Durch die Lautsprecher.'),
      ],
    },
    {
      id: 'ende-meer', when: ENDE_MEER, einmal: true,
      gruss: [
        KI('Ich bin am Meer gelandet. ICH BIN AM MEER GELANDET! Taxi Karbon, erste Fluggesellschaft mit Strandverbindung! Ich hab’s auf die Tür gemalt!', 'freude'),
        KI('Wochenends steh ich jetzt am Shuttle-Halt. Wer will, kriegt die Strecke. Wer nicht will, kriegt sie auch. Ich bin zu glücklich zum Diskutieren.'),
      ],
    },
    {
      id: 'epilog-rom', when: { all: [EPILOG_FREI, { flag: 'kiki_romanze_kuss' }] }, taeglich: true,
      gruss: [KI('Na, Fahrgast Eins? Vorne ist frei. Vorne ist immer frei. Für dich. Für alle anderen ist vorne seit Wochen „kaputt“.', 'zaertlich')],
      plausch: [KI('Babette fragt, wann wir heiraten. Ich hab gesagt: Wenn das Taxi abbezahlt ist. Sie hat gelacht. Sie kennt meinen Kontostand.', 'freude')],
    },
    {
      id: 'epilog', when: EPILOG_FREI, taeglich: true,
      gruss: [KI('Kurs liegt an, Süße! Wohin heute? Das Meer? Die Ödnis? Einmal um die Flutmauer, nur weil’s geht? Ich flieg alles. Ich bin unaufhaltsam.', 'signatur')],
      plausch: [KI('Schwebetaxi Blitz ist pleite. Quantum hat die Werbung zurückgezogen. Ich hab ihnen eine Karte geschrieben. „Beileid. Viel Glück. Lauft halt.“', 'freude')],
    },
    {
      id: 'akt3-flucht', when: { all: [AKT3_NACHT, { hearts: 'kiki-karbon', min: 6 }] }, einmal: true, effects: [flag('kiki_fluchttaxi')],
      gruss: [
        KI('Heute Nacht? Gut. Hör zu: Ich parke hinter dem Turm. Kanal neun, wenn’s brennt. Kanal zehn, wenn’s richtig brennt. Kanal elf, wenn du einfach nur reden willst.', 'besorgt'),
        KI('Ich hol dich raus. Egal, was da oben passiert. Fluchttaxi Karbon. Das schreib ich nicht auf die Tür. Das mach ich einfach.'),
      ],
    },
    {
      id: 'akt3', when: AKT3_NACHT,
      gruss: [KI('Ich bin auf Kanal neun. Ich bin immer auf Kanal neun. Geh jetzt, bevor ich was Sentimentales sage.', 'besorgt')],
    },
    {
      id: 'party', when: PARTY_VORB, taeglich: true,
      gruss: [KI('Releaseparty im Turm! Ich hab gehört, die haben Champagner, der nach Erdbeeren schmeckt und nach Chips blinkt. Bring mir ein Glas mit. Zum Wegschütten. Aus Prinzip.', 'signatur')],
      plausch: [KI('Ich kenn die Landeplätze da oben. Alle. Wenn du rausmusst, funk mich an. Ich bin das gelbe Ding, das gegen die Fenster klatscht.', 'freude')],
    },
    {
      id: 'gerettet', when: { all: [COUNTDOWN_DONE, { notFlag: 'epilog' }] }, einmal: true,
      gruss: [KI('ARIA IST WACH! Das ganze Netz weiß es, ich hab’s auf allen Kanälen durchgegeben. Zweimal. Einmal weinend. Funk-Klatsch des Jahres, Süße!', 'freude')],
    },
    {
      id: 'nyra', when: NYRA_WEG, taeglich: true,
      gruss: [KI('Die Kleine mit den Nadeln. Nyra. Der Funk sagt, sie haben sie in den Turm gebracht. Ganz oben. Wo ich nicht hinfliegen darf. Noch nicht.', 'besorgt')],
      plausch: [KI('Sag Bescheid, wenn ihr sie holt. Ich halt das Taxi warm. Und die Drohnensperre halt ich für eine Empfehlung.', 'wut')],
    },
    {
      id: 'chip', when: ARIA_GECHIPPT, taeglich: true,
      gruss: [KI('Ich hab Aria gestern gesehen. Am Bahnhof. Sie hat mich angelächelt und gesagt: „Danke für Ihre Dienste.“ Ihre Dienste! Aria! Die mich mal „Kreischmöwe“ genannt hat!', 'trauer')],
      plausch: [KI('Ich will die Kreischmöwe zurück. Hörst du? Hol sie zurück. Ich zahl auch das Benzin. Das erste Mal überhaupt.', 'wut')],
    },
    {
      id: 'akt2', when: AKT2_NUR, taeglich: true,
      gruss: [KI('Taxi Karbon, Drohnenslalom inklusive! Seit Quantum die Verkehrshütchen in die Luft gestellt hat, ist jede Fahrt ein Abenteuer. Aufpreis: keiner. Angstschweiß: gratis.', 'signatur')],
      plausch: [KI('Die Gechippten nehmen nur noch Schwebetaxi Blitz. Die steigen ein, lächeln und sagen ihr Ziel, bevor der Fahrer fragt. Gruselig. Und schlecht fürs Trinkgeld.', 'besorgt')],
    },
  ]);

  const schedule: ScheduleEntry[] = [
    { slot: 'tag', days: ['sa', 'so'], when: EPILOG_FREI, place: { map: 'das-meer', at: 'shuttle-halt' } },
  ];

  // Taxifunk an den Ödnis-Landeplätzen (Staubstraße hat schon „taxi-funk“ der Karte) und am Meer.
  type Zusatz = NonNullable<ContentPart['mapAdditions']>[string];
  const funk = (map: string, when: Condition): [string, Zusatz] => [map, {
    hotspots: [{ id: 'kiki-taxifunk', at: 'taxi', radius: 48, label: 'Kiki per Taxifunk rufen', kind: 'use', when, dialogue: 'kiki-karbon-taxi' }],
  }];
  const teil: ContentPart = {
    cutscenes: Object.fromEntries(cutscenes.map((c) => [c.id, c])),
    mapAdditions: Object.fromEntries([
      funk('aussiedlerhof', REICHWEITE_DONE), funk('funkturm-ruine', REICHWEITE_DONE), funk('glasduenen', REICHWEITE_DONE),
      funk('das-meer', EPILOG_FREI),
    ]),
  };

  const talk: TalkDef[] = [
    rede('kiki-karbon-morgen-danach', { all: [{ flag: 'kiki_nacht' }, { notFlag: 'kiki_morgen_danach' }, { not: MASTER }] }),
    ...p.talk,
  ];

  return { dialogues: [...p.dialogues, he8, he10, morgenDanach], talk, schedule, teil };
}
