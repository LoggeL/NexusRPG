// Captain Kuschel – Dantes Plüschhase mit sehr großen Ohren (world.md §4.2, §11.2).
// Spricht nie: Seine Zeilen sind Ohrenstellungen (hoch = ja, schlapp = traurig, eines geknickt = skeptisch); Dante, Nyra
// oder die Kinder übersetzen. Hinterlässt Zettel, unterschrieben „– C. K.“. Wechselt in main-1-dante zu Nyra
// (Flag nyra_hat_kuschel). Mo/Mi tagsüber im das-nest „ausgeliehen“. Kein Begleiter (Kampfgegenstand captain-kuschel).
// Herz-Ereignisse 2/4/6 in Akt 1, 8/10 ab Akt 2 als volle Szenen in kuschel-akt23.ts (dort auch Akt 2/3, Nachspiel). Persönliche Quest pers-kuschel-ohrenflick (Quest-Agent).
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode, NpcDef } from '../../../modules/contracts';
import {
  type Menue, VEX, einmalig, aktiv, dialog, done, erz, flag, herz, ich, knoten, neu, offen, pruefung, rede, sammle, sprecher,
  tagesgespraech, ZEIT_HINWEIS,
} from './_helfer';
import { KUSCHEL_FREI, akt23, he10, he8, menue23 } from './kuschel-akt23';
import { KUSCHEL_RE, kuschelEvents } from './_rivalitaet';

const K = sprecher('captain-kuschel');
const D = sprecher('dante');
const N = sprecher('nyra');
const DA = sprecher('daria');
const FR = sprecher('freya');
const JA = sprecher('jakko');
const BO = sprecher('bolzen');

const BEI_NYRA: Condition = { flag: 'nyra_hat_kuschel' };
const OHRENFLICK = 'pers-kuschel-ohrenflick';
const WOCHENTAG = ['mo', 'di', 'mi', 'do', 'fr'] as const;

// ---------------------------------------------------------------------------------------------- Menü

function menue(): Menue {
  const zurueck: DialogueChoice[] = [{ text: 'Noch was, Captain.', next: 'menue', id: 'zurueck' }, { text: 'Tschüss, Captain.' }];
  const M23 = menue23(zurueck);

  const choices: DialogueChoice[] = einmalig('kuschel', [
    { text: 'Ihm die Ohren kraulen.', next: 'kraulen' },
    {
      text: 'Moment. Dein linkes Ohr ist eingerissen!', next: 'ohr', id: 'k-ohr',
      when: { all: [{ hearts: 'captain-kuschel', min: 1 }, offen(OHRENFLICK)] }, effects: [{ startQuest: OHRENFLICK }],
    },
    { text: 'Wie geht’s dem Ohr?', when: aktiv(OHRENFLICK), next: 'ohr-stand' },
    { text: 'Was hältst du von Dante?', next: 'dante', once: true, id: 'k-dante' },
    { text: 'Was hältst du von Nyra?', when: BEI_NYRA, next: 'nyra', once: true, id: 'k-nyra' },
    { text: '„Was meinst du, Captain … mag sie mich?“', tag: '[Vex]', when: { all: [VEX, { any: [{ flag: 'vexaria_wette' }, { flag: 'vexaria_knutsch' }] }] }, next: 'vex-frage', once: true, id: 'k-vex' },
    { text: 'Hast du mir einen Zettel dagelassen?', requires: { hearts: 'captain-kuschel', min: 3 }, tag: '[Kuschel ♥3]', next: 'zettel', once: true, id: 'k-zettel' },
    ...M23.choices,
    { text: 'Tschüss, Captain.' },
  ]);

  const nodes: DialogueNode[] = [
    knoten('menue', [K('(Die Ohren stehen erwartungsvoll halb hoch.)')], { choices }),
    knoten('kraulen', [
      erz('Du kraulst Captain Kuschel hinter den Ohren. Das Fell ist weich, an einer Stelle ein bisschen verfilzt, an einer anderen klebt ein Keksrest.'),
      K('(Beide Ohren sinken genüsslich nach hinten.)', 'freude'),
      erz('Irgendwo in seinem Inneren knistert die Füllung. Es klingt verdächtig nach Schnurren.'),
    ], { choices: zurueck }),
    knoten('ohr', [
      erz('An der Wurzel des linken Ohrs klafft eine Naht. Ein Büschel Füllwatte quillt heraus wie ein kleiner Wolkenrest.'),
      K('(Das linke Ohr hängt schlapp. Das rechte zuckt tapfer.)', 'trauer'),
      erz('Am Ohr steckt ein zusammengefalteter Zettel: „Nicht schlimm. Bisschen schlimm. Oma Volt kann nähen. Sie hat Nadel und Faden oder will 30 Credits. – C. K.“'),
    ], { choices: zurueck }),
    knoten('ohr-stand', [
      K('(Das linke Ohr hängt. Das rechte zeigt Richtung Neon-Gasse. Richtung Kiosk.)', 'trauer'),
      erz('Er meint wohl: Oma Volt. Kiosk. Nadel und Faden, oder sie will Geld. Er meint es sehr deutlich.'),
    ], { choices: zurueck }),
    knoten('dante', [
      K('(Beide Ohren schnellen senkrecht hoch. Dann eins leicht zur Seite.)', 'freude'),
      erz('Übersetzt ungefähr: „Bester Mensch. Backt zu viele Kekse. Weint bei Schallplatten. Bester Mensch.“'),
    ], { choices: zurueck, effects: [herz('captain-kuschel', 10)] }),
    knoten('nyra', [
      K('(Ein Ohr hoch, eins geknickt. Dann klappt auch das geknickte langsam hoch.)', 'freude'),
      erz('Übersetzt ungefähr: „Zu viel Energydrink. Zu wenig Schlaf. Hält mich nachts fest, als würde ich weglaufen. Ich lauf nicht weg.“'),
    ], { choices: zurueck, effects: [herz('captain-kuschel', 10), herz('nyra', 10)] }),
    knoten('vex-frage', [
      erz('Du fragst einen Plüschhasen um Rat in Liebesdingen. Niemand sieht hin. Hoffentlich.'),
      K('(Beide Ohren hoch. Sehr hoch. Dann wackeln sie. Beide. Gleichzeitig.)', 'freude'),
      erz('Unter seiner Pfote steckt ein Zettel, als hätte er auf genau diese Frage gewartet: „Die mit dem Schläger guckt dir hinterher, wenn du gehst. Jedes Mal. Du bist blind. – C. K.“'),
      ich('… Danke, Captain. Du bist ein Arsch.', 'freude'),
      K('(Ein Ohr knickt ab. Unverkennbar: ein Zwinkern.)'),
    ], { choices: zurueck, effects: [herz('captain-kuschel', 10)] }),
    knoten('zettel', [
      erz('Captain Kuschel guckt dich mit seinen Knopfaugen an. Unter ihm, plattgesessen: ein Zettel.'),
      erz('„Du schläfst zu wenig. Du isst zu viel Mist. Du bist trotzdem okay. – C. K.“'),
      K('(Ein Ohr hoch.)'),
    ], { choices: zurueck }),
    ...M23.nodes,
  ];
  return { choices, nodes };
}

const M = menue();
const A23 = akt23(M);

/** Rivalität: „Ich bin enttäuscht. – C. K.“ Versöhnung: Naht flicken (Nadel und Faden oder Ohrenflick erledigt). */
const RIVALE: Menue = {
  choices: [
    {
      text: 'Nadel und Faden nehmen und die alte Naht an seinem Ohr nachziehen.', next: 'versoehnt',
      when: { item: 'nadel-und-faden' }, effects: [{ take: 'nadel-und-faden' }, { reconcile: 'captain-kuschel' }, { xp: 30 }],
    },
    { text: '„Ich hab dein Ohr flicken lassen. Erinnerst du dich?“', when: done(OHRENFLICK), next: 'versoehnt', effects: [{ reconcile: 'captain-kuschel' }] },
    { text: 'Leise rückwärts gehen.' },
  ],
  nodes: [
    knoten('versoehnt', [
      erz('Stich für Stich. Captain Kuschel hält still. Die Ohren richten sich auf, millimeterweise, wie Antennen, die wieder Empfang haben.'),
      K('(Beide Ohren hoch.)', 'freude'),
      erz('Später findest du einen Zettel in deiner Tasche: „Entschuldigung angenommen. Nächstes Mal mit Keks. – C. K.“'),
    ]),
  ],
};

// ---------------------------------------------------------------------------------------------- Tagesgespräche

const T = {
  rivale: tagesgespraech('kuschel-tag-rivale',
    [
      K('(Beide Ohren flach nach hinten. Er dreht sich weg. Langsam. Mit Absicht.)', 'trauer'),
      erz('Vor ihm liegt ein Zettel: „Ich bin enttäuscht. – C. K.“'),
    ],
    [erz('Der Zettel hat auf der Rückseite einen Nachtrag: „Sehr enttäuscht. Unterstrichen. – C. K.“')],
    RIVALE),
  zeit: tagesgespraech('kuschel-tag-zeit',
    [K('(Ein Ohr hoch, das andere zeigt vage Richtung Zukunft.)', 'freude'), erz(ZEIT_HINWEIS)],
    [erz('Ein Zettel: „Wir sind noch nicht fertig miteinander. Das Beste kommt noch. Und eine Waschmaschine. Leider. – C. K.“')],
    M),
  werkstattMorgen: tagesgespraech('kuschel-tag-werkstatt-morgen',
    [
      erz('Captain Kuschel thront auf seinem Kissen im Regal. Aus dem Ofen riecht es nach verbrannten Keksen.'),
      K('(Beide Ohren hoch, Richtung Ofen.)'),
      D('Er sagt: „Dante, die Kekse.“ Ich WEISS, Captain! Drei-Sekunden-Regel! DREI SEKUNDEN!', 'ueberrascht'),
    ],
    [D('Er hat jeden Morgen den gleichen Gesichtsausdruck. Ich deute das als Vertrauen. Er deutet das als Geduld.')],
    M),
  werkstatt: tagesgespraech('kuschel-tag-werkstatt',
    [
      erz('Captain Kuschel sitzt im Regal zwischen einer Schale sortierter Schrauben und einem Faxgerät von 2060.'),
      K('(Ein Ohr geknickt. Skeptisch.)'),
      D('Er fragt, ob du dir die Hände gewaschen hast. Du musst nicht antworten. Er weiß es schon.'),
    ],
    [D('Der Captain war mit mir im Eisenhof. Also nicht in der Zelle, die Wachen haben ihn konfisziert. Aber er hat draußen gewartet. Vier Jahre in einer Asservatenkiste. Das nenn ich Loyalität.', 'trauer')],
    M),
  nacht: tagesgespraech('kuschel-tag-nacht',
    [K('(Beide Ohren schlapp. Er schläft. Plüschhasen schlafen mit offenen Knopfaugen.)')],
    [erz('Ein Zettel unter ihm: „Bitte nicht wecken. Außer bei Keksen. – C. K.“')],
    M),
  nest: tagesgespraech('kuschel-tag-nest',
    [
      erz('Captain Kuschel sitzt auf dem Ehrensessel im Nest, mit einem Kronkorken als Krone und einem Lätzchen aus einer Serviette.'),
      FR('Ehrengast! Hier wird nicht geschubst. Das ist Gesetz. Ich bin die Richterin.'),
      JA('Er hat gesagt, er will Kakao. Mit den Ohren. Ich hab’s gesehen.'),
      DA('Er hat gar nichts gesagt. Du willst Kakao, Jakko.'),
    ],
    [K('(Beide Ohren hoch, als Daria den Kakao bringt.)', 'freude'), JA('SIEHST DU!')],
    M),
  beiNyra: tagesgespraech('kuschel-tag-bei-nyra',
    [
      erz('Captain Kuschel lugt aus Nyras Kapuze. Seine Ohren hängen ihr über die Schultern wie ein zweiter Schal.'),
      N('Er sagt Hallo. Mit dem linken Ohr. Das linke ist das Hallo-Ohr. Das rechte ist für Kritik.', 'freude'),
      K('(Das rechte Ohr zuckt.)'),
      N('… Er findet meine Haltung schlecht. Danke, Captain.', 'besorgt'),
    ],
    [N('Ich hab ihm einen eigenen Ordner angelegt. Mit Fotos. Er guckt auf allen gleich. Das ist künstlerisch sehr konsequent.')],
    M),
  meer: tagesgespraech('kuschel-tag-meer',
    [
      erz('An der Flutmauer sitzt Captain Kuschel auf dem Geländer, Nyra hält ihn von hinten fest. Die Ohren flattern im Wind.'),
      K('(Beide Ohren im Wind. Er sieht aus, als würde er gleich losfliegen.)', 'freude'),
      N('Er will das Meer sehen. Wir wollen alle das Meer sehen. Er ist nur der Einzige, der fliegen könnte.'),
    ],
    [N('Ich glaub, er war schon mal da. Er hat so einen Blick. Den Blick von jemandem, der Salz kennt.')],
    M),
  vertraut: tagesgespraech('kuschel-tag-vertraut',
    [K('(Beide Ohren hoch. Er lehnt sich ein winziges Stück in deine Richtung.)', 'freude')],
    [erz('In deiner Jackentasche steckt plötzlich ein Zettel. Du hast keine Ahnung, wie er da reingekommen ist: „Du bist mein zweitliebster Mensch. Sag es nicht Dante. – C. K.“')],
    M),
};

// ---------------------------------------------------------------------------------------------- Herz-Ereignisse

const VERTRAUEN = { checkBuff: { id: 'kuschel-vertrauen', label: 'Captain Kuschel glaubt an dich', value: 1, consumes: true } };

const he2 = dialog('he-captain-kuschel-2', [
  knoten('start', [erz('In der Werkstatt ist es ruhig. Nur der Plattenspieler knistert am Ende einer Platte, und Captain Kuschel sitzt da und guckt dich an.')], {
    choices: [
      { text: '(Weiter.)', when: { not: BEI_NYRA }, next: 'dante' },
      { text: '(Weiter.)', when: BEI_NYRA, next: 'nyra' },
    ],
  }),
  knoten('dante', [
    D('Er will, dass du ihm was erzählst. Ein Geheimnis. Das macht er mit allen, die er mag. Ich hab ihm schon alles erzählt. Zweimal.', 'freude'),
    D('Keine Sorge. Er sagt nichts weiter. Er sagt ja gar nichts. Ich geh mal … Kekse. Ich geh Kekse.'),
  ], { next: 'geheimnis' }),
  knoten('nyra', [
    N('Hi! Ich bin nur zu Besuch. Mit ihm. Dante hat gesagt, er soll seine alte Werkstatt sehen dürfen. Er hatte Heimweh. Ich auch. Nach einer Werkstatt, die nicht meine ist.', 'freude'),
    N('Er will, dass du ihm was anvertraust. Ich geh weg. Ich hör nicht zu. Ich bin Silent-Angel, nicht Lauschender Angel. Okay, manchmal schon.'),
  ], { next: 'geheimnis' }),
  knoten('geheimnis', [
    erz('Ihr seid allein. Du und ein Plüschhase mit sehr großen Ohren. Die Ohren warten.'),
  ], {
    choices: [
      { text: '„Ich hab Angst, dass ich das hier vermassle. Die Crew. Alles.“', next: 'angst' },
      { text: '„Die drei Kekse, die Dante vermisst? Das war ich.“', next: 'kekse' },
      { text: '„Früher hab ich Plüschtiere aus Läden geklaut und am Bahnhof verkauft. Tut mir leid. Nicht dir persönlich.“', tag: '[Gosse]', when: { origin: 'origin-gossenkind' }, next: 'gosse' },
      { text: '„Ich komm aus einem Turm, in dem es keine Plüschtiere gibt. Nur Designobjekte. Du wärst da verboten.“', tag: '[Oberstadt]', when: { origin: 'origin-oberstadt' }, next: 'oberstadt' },
      { text: '„Es gibt da eine. Laut. Mit Schläger. Ich krieg sie nicht aus dem Kopf. Erzähl’s keinem.“', tag: '[Vex]', when: VEX, next: 'vex' },
    ],
  }),
  knoten('angst', [
    K('(Ein Ohr senkt sich. Langsam. Bis es deine Hand berührt.)', 'trauer'),
    erz('Das Ohr bleibt da liegen. Weich und ein bisschen schwer. Das ist kein Trost. Das ist etwas Besseres: Er ist einfach da.'),
  ], { next: 'ende' }),
  knoten('kekse', [
    K('(Beide Ohren hoch. Dann, sehr langsam, eins geknickt.)'),
    erz('Unverkennbar: Er weiß es schon. Er hat es gesehen. Er hat es geduldet. Er erwartet beim nächsten Mal einen Anteil.'),
  ], { next: 'ende' }),
  knoten('gosse', [
    K('(Ohren flach. Lange Pause. Dann: eins hoch.)'),
    erz('Vergeben. Unter Vorbehalt. Unter sehr großem Vorbehalt.'),
  ], { next: 'ende' }),
  knoten('oberstadt', [
    K('(Beide Ohren steil hoch, empört.)', 'ueberrascht'),
    erz('Captain Kuschel ist offensichtlich der Meinung, dass ein Turm ohne Plüschtiere kein Zuhause ist. Er hat recht.'),
  ], { next: 'ende' }),
  knoten('vex', [
    K('(Beide Ohren hoch. Und dann, Wunder der Füllwatte, ein ganz leichtes Wackeln.)', 'freude'),
    erz('Wenn ein Plüschhase grinsen könnte, würde er jetzt grinsen. Er kann nicht. Er tut es trotzdem.'),
  ], { next: 'ende', effects: [flag('kuschel_weiss_von_aria')] }),
  knoten('ende', [
    erz('Als du gehen willst, liegt neben dir ein Zettel. Krakelige Buchstaben: „Du schaffst das. Heute noch. – C. K.“'),
    erz('Captain Kuschel glaubt an dich: +1 auf deinen nächsten Check.'),
  ], { effects: [VERTRAUEN, herz('captain-kuschel', 30), { xp: 30 }] }),
]);

const he4 = dialog('he-captain-kuschel-4', [
  knoten('start', [
    erz('Teekränzchen im Nest. Eine umgedrehte Kiste, vier Tassen ohne Henkel, eine Kanne mit Blümchen und einem Sprung. Captain Kuschel sitzt am Kopfende.'),
    FR('Du bist zu spät. Teekränzchen beginnt um Punkt. Punkt war vor zehn Minuten.', 'wut'),
    DA('Setz dich. Kleiner Finger abspreizen. Das ist die Regel. Wer den Finger nicht spreizt, muss abwaschen.'),
    JA('Und man muss dem Captain zuerst einschenken. Er ist der Kapitän. Kapitäne kriegen zuerst.'),
  ], {
    choices: [
      { text: 'Mit Grandezza einschenken. Kleiner Finger hoch, Verbeugung vor dem Captain, „Ihr Earl Grey, Kapitän“.', check: pruefung('he-kuschel-4-teekraenzchen', 'ausstrahlung', 3, ['buehne', 'kinder']), next: 'grandezza', effects: [herz('captain-kuschel', 40), herz('daria', 15), herz('freya', 15), herz('jakko', 15)] },
      { text: 'Dantes Kekse auspacken. „Ich hab Gebäck mitgebracht.“', when: { item: 'dantes-kekse' }, next: 'kekse', effects: [{ take: 'dantes-kekse' }, herz('captain-kuschel', 40), herz('daria', 20), herz('freya', 20), herz('jakko', 25)] },
      { text: 'Einfach einschenken. Ein bisschen kleckern.', next: 'kleckern', effects: [herz('captain-kuschel', 25), herz('daria', 5), herz('freya', 5), herz('jakko', 10)] },
    ],
  }),
  knoten('grandezza', [
    FR('… Akzeptabel.', 'ueberrascht'),
    DA('Sie hat „akzeptabel“ gesagt. Freya sagt nie „akzeptabel“. Freya sagt „abgelehnt“.'),
    K('(Beide Ohren hoch. Ein Ohr wippt, als würde er mit dem kleinen Finger mitspreizen.)', 'freude'),
  ], { next: 'gespraech' }),
  knoten('kekse', [
    JA('KEKSE.', 'freude'),
    FR('Jakko! Man schreit nicht beim Teekränzchen! … Einer für jeden. Zwei für den Captain.'),
    K('(Beide Ohren hoch. Vor ihm liegen zwei Kekse. Bis zum Ende des Kränzchens ist einer davon auf geheimnisvolle Weise weg.)', 'freude'),
    JA('Ich war das nicht. Er war das.'),
  ], { next: 'gespraech' }),
  knoten('kleckern', [
    erz('Der Tee landet halb in der Tasse, halb auf Captain Kuschels Pfote.'),
    FR('Abwaschen. Du. Sofort. Und Entschuldigung beim Captain.'),
    ich('Entschuldigung, Captain.'),
    K('(Ein Ohr hoch. Gnädig.)'),
  ], { next: 'gespraech' }),
  knoten('gespraech', [
    DA('Weißt du, warum er montags und mittwochs hier ist? Dante leiht ihn uns. Weil Jakko nachts Albträume hat.'),
    JA('Hab ich nicht! … Manchmal. Aber wenn der Captain da ist, nicht. Seine Ohren halten die Albträume ab. Wie ein Zaun.'),
    FR('Das ist wissenschaftlich bewiesen. Von mir.'),
    K('(Beide Ohren stehen kerzengerade. Wachdienst.)'),
  ], {
    choices: [
      { text: '„Das ist der beste Zaun der Stadt.“', next: 'ende' },
      { text: '„Ich hab auch manchmal Albträume.“', next: 'ende-auch', effects: [herz('jakko', 15)] },
    ],
  }),
  knoten('ende-auch', [
    JA('Echt? Dann darfst du ihn auch mal leihen. Aber nur dienstags. Montags und mittwochs ist er unser.', 'freude'),
  ], { next: 'ende' }),
  knoten('ende', [
    erz('Beim Abschied steckt in deiner Tasse ein Zettel, nass vom Tee: „Gutes Kränzchen. Nächstes Mal ohne Kleckern. Oder mit. Egal. – C. K.“'),
  ], { effects: [{ xp: 60 }, flag('kuschel_teekraenzchen')] }),
]);

const he6 = dialog('he-captain-kuschel-6', [
  knoten('start', [
    erz('Das Nest ist in Aufruhr. Freya läuft im Kreis, Daria hat eine Karte mit roten Kreuzen aufgehängt, Jakko sitzt unter dem Tisch und weint leise in seinen Teddy.'),
    DA('Er ist WEG. Der Captain ist weg. Heute Morgen war er noch auf dem Sessel. Jetzt: nichts. Nur Krümel.', 'wut'),
    erz('Aus der Ecke beim Kuschelplatz kommt ein metallisches Schnaufen. Bolzen, der Roboterhund, liegt in einem Haufen aus alten Decken und wedelt mit dem Schwanz, dass die Funken fliegen.'),
    erz('Zwischen seinen Pfoten, vorsichtig im Maul wie ein rohes Ei: zwei sehr große Plüschohren.'),
  ], {
    choices: [
      { text: 'Bolzens Apportier-Modus umschalten. Die Klappe am Nacken, zweiter Schalter von links.', check: pruefung('he-kuschel-6-bolzen', 'technik', 4, ['maschine', 'drohne']), next: 'schalter', effects: [herz('captain-kuschel', 30), herz('bolzen', 20)] },
      { text: 'Eine Leckerli-Schraube hinhalten.', when: { item: 'leckerli-schraube' }, next: 'leckerli', effects: [{ take: 'leckerli-schraube' }, herz('captain-kuschel', 30), herz('bolzen', 40)] },
      { text: 'Sich hinknien. „Bolzen. Aus. Bitte.“', next: 'bitte', effects: [herz('captain-kuschel', 25), herz('bolzen', 25)] },
      { text: 'Daran ziehen.', next: 'ziehen', effects: [herz('captain-kuschel', 10)] },
    ],
  }),
  knoten('schalter', [
    erz('Klick. Bolzens Augen wechseln von Rot auf Grün. Er öffnet das Maul, legt den Captain ab und setzt sich ordentlich hin, als hätte er nie etwas anderes vorgehabt.'),
    BO('WUFF. APPORTIERT. FUND ABGELIEFERT. BELOHNUNG ERWARTET.'),
  ], { next: 'fund' }),
  knoten('leckerli', [
    erz('Bolzen sieht die Schraube. Bolzen sieht den Captain. Bolzen sieht die Schraube. Die Schraube gewinnt.'),
    BO('WUFF! TAUSCH AKZEPTIERT.', 'freude'),
  ], { next: 'fund' }),
  knoten('bitte', [
    erz('Bolzen legt den Kopf schief. Dann, sehr langsam, legt er den Captain vor dich hin. Er schnüffelt noch einmal an ihm, als wollte er sich verabschieden.'),
    BO('wuff.'),
  ], { next: 'fund' }),
  knoten('ziehen', [
    erz('Bolzen zieht zurück. Du ziehst fester. Irgendwo reißt eine Naht. Bolzen lässt erschrocken los, und du fällst mit dem Captain auf den Hintern.'),
    FR('Du hast ihn KAPUTT gemacht!', 'wut'),
    erz('Nur ein bisschen. Eine Naht am Bauch. Er sieht trotzdem würdevoll aus. Das kann er.'),
  ], { next: 'fund' }),
  knoten('fund', [
    erz('Captain Kuschel ist ein bisschen feucht, ein bisschen platt und sehr eindeutig in Ordnung. Jakko kriecht unter dem Tisch hervor und drückt ihn so fest, dass die Ohren abstehen.'),
    erz('Im Hundekörbchen, unter der Decke: ein Zettel. Verschmiert, aber lesbar.'),
    erz('„Bin nicht entführt. Bin auf Urlaub. Bolzen hatte Angst vor Gewitter. Ich hab aufgepasst. – C. K.“'),
    DA('… Er hat auf den Hund aufgepasst.', 'ueberrascht'),
    JA('Er passt auf alle auf. Das ist sein Job. Er ist der Captain.'),
    K('(Beide Ohren hoch. Leicht zerzaust. Stolz.)', 'freude'),
  ], { effects: [flag('kuschel_gefunden'), herz('daria', 10), herz('freya', 10), herz('jakko', 20), { xp: 80 }] }),
]);

// ♥8 und ♥10: volle Szenen in kuschel-akt23.ts.

// Rivalität −5: Zettelkrieg.
const re5 = dialog('re-captain-kuschel-5', [
  knoten('start', [
    erz('Überall in der Werkstatt hängen Zettel. Am Ofen, am Plattenspieler, am Faxgerät, an deiner Jacke. Auf allen steht dasselbe.'),
    erz('„Ich bin enttäuscht. – C. K.“'),
    D('Er hat die ganze Nacht geschrieben. Ich weiß nicht mal, wo er die Stifte herhat. Bitte. Mach das wieder gut. Er schmollt in Ohrenform.', 'besorgt'),
  ], { choices: [{ text: 'Einen Zettel zurückschreiben: „Tut mir leid. – {name}“', effects: [herz('captain-kuschel', 40)] }, { text: 'Gehen.' }] }),
]);

// ---------------------------------------------------------------------------------------------- Figur

/** Neben Nyra stehen (gleiche Karte, ein paar Schritte daneben). */
const neben = (map: string, at: readonly [number, number]) => ({ map, at });

const kuschel: NpcDef = {
  id: 'captain-kuschel',
  name: 'Captain Kuschel',
  portrait: 'captain-kuschel',
  sprite: 'captain-kuschel-walk',
  faction: 'crew-hunter',
  bio: 'Dantes Plüschhase mit sehr großen Ohren. Spricht nie, sagt alles mit den Ohren: hoch heißt ja, schlapp heißt traurig, eins geknickt heißt skeptisch. Hinterlässt Zettel, unterschrieben „– C. K.“. Mag alle gleich. Außer Waschmaschinen.',
  gifts: {
    loves: ['plueschmoehre', 'samtfliege', 'nadel-und-faden'],
    likes: ['dantes-kekse', 'kartendeck', 'stickerbogen', 'murmelbeutel'],
    dislikes: ['drohnen-propeller', 'synth-nudeln'],
    hates: ['waschpulver'],
  },
  schedule: [
    // Akt 2 (Turm, Fundbüro, Mila), Master-Modus, Nachspiel (kuschel-akt23.ts).
    ...A23.schedule,
    // Ab ♥6 einmal verschwunden, bis Bolzen ihn im Nest findet (he-captain-kuschel-6).
    { when: { all: [{ hearts: 'captain-kuschel', min: 6 }, neu('he-captain-kuschel-6'), KUSCHEL_FREI] }, place: 'away' },
    // Mo/Mi tagsüber im Nest ausgeliehen – auch, wenn er schon bei Nyra wohnt.
    { slot: 'tag', days: ['mo', 'mi'], place: { map: 'das-nest', at: 'kuschel-platz' }, dialogue: 'kuschel-tag-nest' },
    // Bei Nyra: mit ihr unterwegs (in der Party trägt sie ihn in der Kapuze).
    { when: { all: [BEI_NYRA, { companion: 'nyra' }] }, place: 'away' },
    { slot: 'morgen', when: BEI_NYRA, place: neben('netzcafe-datenkruemel', [946, 470]) },
    { slot: 'tag', when: BEI_NYRA, place: neben('schrottmarkt', [1064, 736]) },
    { slot: 'abend', days: ['sa', 'so'], when: BEI_NYRA, place: neben('high-voltage', [356, 792]) },
    { slot: 'abend', when: BEI_NYRA, place: neben('flutmauer', [842, 336]), dialogue: 'kuschel-tag-meer' },
    { slot: 'nacht', when: BEI_NYRA, place: neben('neon-gasse', [1222, 96]) },
    { place: { map: 'dantes-werkstatt', at: 'kuschel-regal' } },
  ],
  heartEvents: [
    { id: 'he-captain-kuschel-2', hearts: 2, map: 'dantes-werkstatt', time: ['morgen', 'tag', 'abend'], when: KUSCHEL_FREI, dialogue: 'he-captain-kuschel-2' },
    { id: 'he-captain-kuschel-4', hearts: 4, map: 'das-nest', time: 'tag', when: { all: [{ weekday: ['mo', 'mi'] }, KUSCHEL_FREI] }, dialogue: 'he-captain-kuschel-4' },
    { id: 'he-captain-kuschel-6', hearts: 6, map: 'das-nest', time: 'tag', when: KUSCHEL_FREI, dialogue: 'he-captain-kuschel-6' },
    { id: 'he-captain-kuschel-8', hearts: 8, map: 'schrottmarkt', time: 'tag', when: { all: [{ act: 2 }, KUSCHEL_FREI] }, dialogue: 'he-captain-kuschel-8' },
    { id: 'he-captain-kuschel-10', hearts: 10, map: 'crew-quartier', time: ['abend', 'nacht'], when: { all: [{ act: 2 }, { seen: 'he-captain-kuschel-8' }, KUSCHEL_FREI] }, dialogue: 'he-captain-kuschel-10' },
    { id: 're-captain-kuschel-5', hearts: -5, map: 'dantes-werkstatt', when: KUSCHEL_FREI, dialogue: 're-captain-kuschel-5' },
    // Rivalität −2 (Zettel „Ich bin enttäuscht.“) und −8 (Ohren zugebunden): _rivalitaet.ts.
    ...kuschelEvents(KUSCHEL_FREI),
  ],
  talk: [
    rede('kuschel-tag-rivale', { rival: 'captain-kuschel' }),
    // Akt 2/3, Master-Modus, Nachspiel (kuschel-akt23.ts).
    ...A23.talk,
    rede('kuschel-tag-zeit', { not: { act: 2 } }, 8),
    rede('kuschel-tag-nest', { all: [{ weekday: ['mo', 'mi'] }, { time: 'tag' }] }),
    rede('kuschel-tag-nacht', { time: 'nacht' }),
    rede('kuschel-tag-meer', { all: [BEI_NYRA, { time: 'abend' }, { weekday: [...WOCHENTAG] }] }),
    rede('kuschel-tag-bei-nyra', BEI_NYRA),
    rede('kuschel-tag-vertraut', undefined, 6),
    rede('kuschel-tag-werkstatt-morgen', { time: 'morgen' }),
    rede('kuschel-tag-werkstatt'),
  ],
};

export const part: ContentPart = {
  npcs: { 'captain-kuschel': kuschel },
  dialogues: sammle(
    T.rivale, T.zeit, T.werkstattMorgen, T.werkstatt, T.nacht, T.nest, T.beiNyra, T.meer, T.vertraut,
    he2, he4, he6, he8, he10, re5, ...KUSCHEL_RE, ...A23.dialogues.filter((d) => d.id !== he8.id && d.id !== he10.id),
  ),
  phone: {
    ...A23.phone,
    'tel-kuschel-weg': {
      id: 'tel-kuschel-weg', from: 'dante',
      text: 'NOTFALL. Captain Kuschel ist WEG. Kein Zettel, nichts. Nyra heult, ich heule, der Plattenspieler eiert. Die Kinder haben ihn zuletzt gesehen. Geh ins Nest. BITTE.',
      auto: { all: [{ hearts: 'captain-kuschel', min: 6 }, neu('he-captain-kuschel-6'), KUSCHEL_FREI] },
    },
  },
};
