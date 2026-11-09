// Dante – Genie und Wahnsinn, Schrauber mit Werkstatt voller Platten (world.md §4.2, §4.6, §4.7 „Die Wärme der
// Analogtechnik“ und Paar-Strang Dante/Raven, §11.2). Tagesablauf nach design/plan/act1.json (npcSchedules.dante),
// Herz-Ereignisse he-dante-2/4/6 in Akt 1, he-dante-8/10 angelegt und an act2 gebunden. Begleiter erst ab act2.
// Dazu die Arm-Wartung aus dem Strang Vex × Aria (world.md §4.7 „Status zusammen“, beide Fassungen).
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode, NpcDef, Weekday } from '../../../modules/contracts';
import {
  type Menue, abblende, dialog, erz, flag, herz, ich, knoten, neu, pruefung, rede, sammle, sammleSzenen, sprecher,
  tagesgespraech, ZEIT_HINWEIS,
} from './_helfer';

const D = sprecher('dante');
const A = sprecher('aria');
const R = sprecher('raven');

const ROM: Condition = { romance: 'dante' };
const VEX: Condition = { playerIs: 'vex' };
const KENNT: Condition = { quest: 'main-1-dante', state: 'done' };

// ---------------------------------------------------------------------------------------------- Menü

function menue(): Menue {
  const zurueck: DialogueChoice[] = [{ text: 'Noch was, Dante.', next: 'menue', id: 'zurueck' }, { text: 'Bis später.' }];
  const flirt = (n: number, tage: Weekday[]): DialogueChoice => ({
    text: 'Mit Dante flirten.', tag: '[Romanze]', next: `flirt-${n}`, id: `flirt-${n}`, when: { all: [ROM, { weekday: tage }] },
  });
  const antworten: DialogueChoice[] = [
    { text: '„Dann verbrenn dich halt. Ich puste.“', check: pruefung('dante-flirt-frech', 'ausstrahlung', 6, ['flirt']), next: 'flirt-a' },
    { text: '„Sieben Sekunden? Ich zähl weiter.“', next: 'flirt-b' },
    { text: '„Dante. Atmen.“', next: 'flirt-c' },
  ];

  const choices: DialogueChoice[] = [
    { text: '„Hübsch hier. Fast wie zu Hause. Nur mit mehr Rost.“', tag: '[Oberstadt]', when: { origin: 'origin-oberstadt' }, once: true, id: 'd-oberstadt', next: 'd-oberstadt' },
    { text: '„Kennst du Radio Rost? Draußen läuft das den ganzen Tag.“', tag: '[Ödnis]', when: { origin: 'origin-oednis' }, once: true, id: 'd-oednis', next: 'd-oednis', effects: [herz('dante', 20)] },
    {
      text: '„Der Zentrator da hinten – ist das ein Siebziger mit Doppelspule?“', tag: '[Schrott]', once: true, id: 'd-schrott', next: 'd-schrott',
      when: { all: [{ origin: 'origin-schrott' }, { noItem: 'wissen-zentrator' }] }, effects: [{ give: 'wissen-zentrator' }, herz('dante', 20)],
    },
    { text: 'Was kannst du bei mir einbauen?', when: KENNT, next: 'laden', effects: [{ shop: 'dantes-werkstatt' }] },
    {
      text: 'Eine Runde Eins!?', next: 'eins', when: { all: [KENNT, { weekday: 'do' }, { time: 'abend' }] },
      effects: [{
        minigame: 'akt-eins', level: 1, key: 'dante-eins', label: 'Eins! bei Dante',
        win: [{ message: 'Gewonnen. Hinter der Werkstatttür flucht jemand. Gedämpft. Lange. Sehr kreativ.' }],
        lose: [{ message: 'Dante gewinnt und tanzt einen Siegestanz, der in drei Bezirken verboten wäre.' }],
      }],
    },
    {
      text: 'Keksalarm?', next: 'keksalarm', when: { all: [{ seen: 'he-dante-2' }, { time: ['morgen', 'abend'] }] },
      effects: [{
        minigame: 'akt-keksalarm', level: 2, key: 'dante-keksalarm', label: 'Keksalarm',
        win: [{ give: 'dantes-kekse', qty: 2 }, { message: 'Zwei Tüten Kekse für die Crew. Dante weint ein bisschen.' }],
        lose: [{ message: 'Halb verkohlt, halb am Boden. Drei-Sekunden-Regel. Ihr esst sie trotzdem.' }],
      }],
    },
    { text: 'Erzähl vom Knast.', tag: '[Dante ♥3]', requires: { hearts: 'dante', min: 3 }, when: KENNT, once: true, id: 'd-knast', next: 'knast' },
    { text: 'Komm mit, Dante. Wir brauchen dich für den Bruch.', when: { all: [KENNT, { not: { act: 2 } }] }, next: 'ruhestand' },
    { text: 'Wie geht’s Captain Kuschel?', when: { notFlag: 'nyra_hat_kuschel' }, next: 'kuschel' },
    { text: 'Vermisst du Captain Kuschel?', when: { flag: 'nyra_hat_kuschel' }, next: 'kuschel-nyra' },
    { text: 'Dein Geheimnis ist sicher bei mir.', when: { all: [{ flag: 'dante_geheimnis_versprochen' }, { notFlag: 'dante_geheimnis_gebrochen' }] }, once: true, id: 'd-geheimnis', next: 'geheimnis' },
    { text: 'Kannst du nochmal nach dem Arm sehen, Doc?', when: { all: [VEX, { flag: 'vexaria_armwartung' }] }, next: 'arm-kurz' },
    flirt(1, ['mo', 'fr']),
    flirt(2, ['di', 'sa']),
    flirt(3, ['mi', 'so']),
    flirt(4, ['do']),
    { text: 'Bis später.' },
  ];

  const nodes: DialogueNode[] = [
    knoten('menue', [D('Noch was? Frag! Frag alles! Außer nach dem Schrank. Welcher Schrank. Es gibt keinen Schrank.')], { choices }),
    knoten('d-oberstadt', [
      D('Du riechst nach Glasreiniger. Komm rein, aber fass nichts an.', 'signatur'),
      D('Das da ist ein Faxgerät von 2060. Das ist älter als dein Selbstwertgefühl. Und es funktioniert noch.'),
    ], { choices: zurueck }),
    knoten('d-oednis', [
      D('RADIO ROST! Heiliges Kanonenrohr! Der Typ mit der Stimme wie ein Kiesweg? Spielt der noch die Sonntags-Platten?', 'ueberrascht'),
      D('Wenn du je wieder rausfährst: Nimm einen Rekorder mit. Ich zahl in Keksen. In sehr vielen Keksen.', 'freude'),
    ], { choices: zurueck }),
    knoten('d-schrott', [
      D('Ein Siebziger mit Doppelspule! Du siehst das! Um Himmels Willen, endlich jemand, der was SIEHT!', 'freude'),
      D('Pass auf. Hier. Serviette.', 'signatur'),
      erz('Dante kritzelt in einer Minute einen Zentrator aufs Papier, mit Pfeilen, Totenköpfen und einem kleinen Keks an der verwundbaren Stelle.'),
      D('Das ist die Schwachstelle. Quantum baut die alle gleich. Faul! Faul und reich. Die schlimmste Sorte.'),
    ], { choices: zurueck }),
    knoten('laden', [D('Liege ist frei, Lötkolben ist heiß, Captain Kuschel hat Bereitschaft. Leg dich hin. Nein, nicht auf den Hasen.')]),
    knoten('eins', [D('Eins! Daria mischt, Freya zählt, Jakko schummelt. Ich verliere. Mit Würde. Meistens.', 'signatur')], { choices: zurueck }),
    knoten('keksalarm', [D('KEKSALARM! Topflappen an! Blech kommt!', 'freude')], { choices: zurueck }),
    knoten('knast', [
      D('Drei Jahre. Weißt du, was das Schlimmste war? Nicht die Wand. Nicht das Essen. Obwohl das Essen … Um Himmels Willen, das Essen.'),
      D('Das Schlimmste: Kein Strom. Nichts zum Schrauben. Ich hab einen Toaster aus Löffeln gebaut. Er hat nicht getoastet. Aber er hat geklickt. Das war genug.', 'trauer'),
      D('Nimm, was du kriegen kannst, und hau ab. Hab ich mir auf die Pritsche geritzt. Und dann bin ich nicht abgehauen. Ich hab gebacken. Hier.'),
    ], { choices: zurueck, effects: [herz('dante', 20)] }),
    knoten('ruhestand', [
      D('Nein. Nein nein nein. Ich bin im Ruhestand. Ich hab einen Rentnerausweis. Den hab ich selbst gedruckt, aber er ist gültig.', 'besorgt'),
      D('Letztes Mal hab ich gesagt: „Gib mir noch eine Sekunde.“ Und dann war Raven sieben Jahre weg. Ich krieg keine Sekunde mehr. Ich will keine.', 'trauer'),
      D('Aber wenn ihr verletzt seid: Werkstatt ist offen. Kekse auch. Das ist meine Art zu helfen. Die einzige, die keinen erwischt.'),
    ], { choices: zurueck }),
    knoten('kuschel', [
      D('Er schläft. Er schläft immer. Er ist ein Hase mit Burnout.'),
      D('Captain Kuschel hat mehr Einsätze erlebt als Hunter. Er war beim Digitech-Bruch. Im Rucksack. Er hat nie darüber geredet.', 'signatur'),
    ], { choices: zurueck }),
    knoten('kuschel-nyra', [
      D('Nyra hat ihn. Er hat sie ausgesucht. Hasen wissen so was.', 'besorgt'),
      D('Wenn du sie siehst, sag ihr: Er mag Karottenschalen und Vinyl-Knistern. Und er beißt, wenn man „Quantum“ sagt. Sehr guter Hase.'),
    ], { choices: zurueck }),
    knoten('geheimnis', [
      D('Pssst! Nicht so laut! Die Wände haben Ohren. Die Ohren sind Captain Kuschels.', 'besorgt'),
      D('… Danke. Wirklich. Du bist der einzige Mensch, der den Schrank gesehen hat und nicht gelacht hat. Außer Ripper. Ripper hat gelacht. Ripper lacht über alles.'),
    ], { choices: zurueck, effects: [herz('dante', 15)] }),
    knoten('arm-kurz', [
      erz('Dante klopft mit dem Schraubenzieher gegen deinen Metallarm und hält das Ohr dran wie an eine Melone.'),
      D('Summt wie ein Kühlschrank. Ein glücklicher Kühlschrank. Raus mit dir. Und grüß die Zöpfe.', 'signatur'),
    ], { choices: zurueck }),
    // Flirt (Romanzefassung, nur mit { romance: 'dante' })
    knoten('flirt-1', [D('Du riechst nach Lötzinn. Das ist … ehrlich gesagt das Schärfste, was ich seit Jahren gerochen hab.', 'verlegen')], { choices: antworten }),
    knoten('flirt-2', [D('Heiliges Kanonenrohr, steh nicht so nah am Ofen, sonst verbrenn ich mir die Kekse. Oder dich. Oder mich.', 'verlegen')], { choices: antworten }),
    knoten('flirt-3', [D('Ich hab zehntausend Stunden auf meiner Pritsche geübt. Für Gitarre! Für Gitarre, um Himmels Willen!', 'ueberrascht')], { choices: antworten }),
    knoten('flirt-4', [D('Drei-Sekunden-Regel gilt übrigens auch für Blicke. Du bist bei sieben.', 'signatur')], { choices: antworten }),
    knoten('flirt-a', [D('Du … pustest. Okay. Okay okay okay. Ich muss mich kurz an die Werkbank lehnen. Die Werkbank braucht das.', 'verlegen')], { choices: zurueck }),
    knoten('flirt-b', [D('Acht. Neun. Hör auf zu zählen! Nein! Zähl weiter!', 'freude')], { choices: zurueck }),
    knoten('flirt-c', [D('Atmen. Ja. Gute Idee. Ich atme. Siehst du? Ich atme sehr gut. Wie ein Blasebalg. Ein verliebter Blasebalg. Hab ich das laut gesagt?', 'verlegen')], { choices: zurueck }),
  ];
  return { choices, nodes };
}

const M = menue();

const RIVALE: Menue = {
  choices: [
    {
      text: '„Lass uns Eins! spielen. Und ich verlier. Absichtlich.“', next: 'versoehnung',
      when: { all: [{ weekday: 'do' }, { time: 'abend' }] }, effects: [{ reconcile: 'dante' }, { advanceTime: 45 }],
    },
    { text: 'Schon gut. Ich geh.' },
  ],
  nodes: [
    knoten('versoehnung', [
      erz('Du spielst so schlecht, dass sogar Jakko Mitleid kriegt. Am Ende legt Dante seine letzte Karte, brüllt „EINS!“ und dann „GEWONNEN!“ und dann noch mal „EINS!“, weil es so schön war.'),
      D('Ich hab gewonnen. Ich hab GEWONNEN. Zum ersten Mal seit … Moment. Du hast mich gewinnen lassen.', 'ueberrascht'),
      D('… Das ist das Netteste und Gemeinste, was je einer für mich getan hat. Wir sind quitt. Kekse?', 'freude'),
    ]),
  ],
};

// ---------------------------------------------------------------------------------------------- Tagesgespräche

const T = {
  rivale: tagesgespraech('dante-tag-rivale',
    [D('Oh. Du. Die Preise haben sich verdoppelt. Für dich. Gerade eben. Inflation.', 'wut')],
    [D('Ich hab dir einen Klingelton gemacht. Er heißt „Verräter“. Er ist sehr laut, und er hat ein Saxofon-Solo.', 'wut')],
    RIVALE),
  verpetzt: tagesgespraech('dante-tag-verpetzt',
    [
      D('Du hast es ihr gesagt. DU HAST ES IHR GESAGT.', 'wut'),
      D('Raven hat heute „Hallo“ zu mir gesagt. „Hallo“! Mit Augenkontakt! Weißt du, was das mit einem Mann macht?'),
    ],
    [D('… Okay. Okay okay okay. Vielleicht war das gut. Ich weiß es nicht. Ich bin wütend und glücklich gleichzeitig, und das ist sehr schlecht für meinen Kreislauf.', 'besorgt')],
    M, { effects: [flag('dante_reagierte_verpetzt')] }),
  muellsack: tagesgespraech('dante-tag-vexaria-muellsack',
    [
      D('Ich hab nichts gesehen. Ich war ein Müllsack. Müllsäcke haben keine Augen.', 'verlegen'),
      D('… Sie hatte dich an der GÜRTELSCHLAUFE! Heiliges Kanonenrohr! An der Gürtelschlaufe!', 'ueberrascht'),
    ],
    [D('Hunter sagt, ich soll nicht drüber reden. Ich rede nicht drüber. Ich hab nur ein Lied darüber geschrieben. Es hat elf Strophen. Willst du die dritte hören?', 'freude')],
    M, { effects: [flag('dante_kommentar_vexaria_muellsack')] }),
  vexariaZusammen: tagesgespraech('dante-tag-vexaria-zusammen',
    [D('Heiliges Kanonenrohr, ich hab’s GEWUSST! Seit dem Müllsack! Ich WAR der Müllsack!', 'freude')],
    [D('Ich back euch was. Herzförmig. Nein, das ist kitschig. Schlagerförmig! Nein. Zerberster-förmig. Ja. Das mag sie.', 'signatur')],
    M, { effects: [flag('dante_kommentar_vexaria_zusammen')] }),
  ariaRomanze: tagesgespraech('dante-tag-aria-romanze',
    [D('Du und Aria! Um Himmels Willen! Das ist, als würde man einen Vorschlaghammer mit einem Plattenspieler verkuppeln!', 'ueberrascht')],
    [D('Ich mein das nett! Plattenspieler sind toll! Vorschlaghammer auch! Nur nicht gleichzeitig auf der Werkbank. Bitte.', 'freude')],
    M, { effects: [flag('dante_kommentar_aria_romanze')] }),
  fremd: tagesgespraech('dante-tag-fremd',
    [D('Heiliges Kanonenrohr, ein Kunde! Nein. Kein Kunde. Wir haben zu. Für immer. Also bis morgen früh.', 'ueberrascht')],
    [D('Ich bin im Ruhestand. Ich schraub nur noch. Und backe. Und hör Platten. Und schraube. Das ist ein sehr voller Ruhestand.')],
    M),
  zeit: tagesgespraech('dante-tag-zeit',
    [D('Du schon wieder! Ich mein: Du! Schon wieder! Das ist gut. Das ist sehr gut.', 'freude'), erz(ZEIT_HINWEIS)],
    [D('Ich hab eine Platte, die spiel ich erst, wenn alles vorbei ist. Wenn wir alle noch da sind. Frag nicht, welche. Doch, frag. Nein. Später.', 'besorgt')],
    M),
  eins: tagesgespraech('dante-tag-eins',
    [D('Eins!-Abend! Daria mischt, Freya zählt, Jakko schummelt, ich verliere. Tradition!', 'signatur')],
    [D('Wenn ich verliere, geh ich kurz raus. Wenn du hinter der Tür Geräusche hörst: Das ist das Faxgerät. Es flucht. Faxgeräte fluchen. Das ist bekannt.', 'verlegen')],
    M),
  plattenkiste: tagesgespraech('dante-tag-plattenkiste',
    [D('Pssst! Die Kiste hier ist Gold. Vinyl-Vincent hat keine Ahnung, was er da verkauft. Ich schon. Um Himmels Willen, ich schon.', 'freude')],
    [D('Eine Pressung von „Kabelbrand – Live im Keller“! Mit Kaffeefleck! Der Kaffeefleck ist original! Von der Band! Wahrscheinlich!')],
    M),
  ofen: tagesgespraech('dante-tag-ofen',
    [D('Nicht reinkommen! Doch, reinkommen! Tür zu! Der Teig mag keine Zugluft!', 'ueberrascht')],
    [D('Das Geheimnis guter Kekse? Butter. Und Zeit. Und dass man sie nicht fallen lässt. Und wenn doch: Drei-Sekunden-Regel!', 'signatur')],
    M),
  werkbank: tagesgespraech('dante-tag-werkbank',
    [D('Halt das mal. Nein, das andere. Das, das nicht raucht.')],
    [
      D('Ich hab hier einen Zentrator von 2071, der mich seit drei Tagen anlügt. Zentratoren lügen nicht. Dieser schon. Er ist besonders.'),
      D('Digital ist kalt. Alles, was ich anfasse, wird wieder warm. Das ist mein Trick. Und Lötzinn.', 'freude'),
    ],
    M),
  tanzflaeche: tagesgespraech('dante-tag-tanzflaeche',
    [D('SAMSTAG! Du bist hier! Ich bin hier! Die Musik ist hier! Heiliges Kanonenrohr, tanz!', 'freude')],
    [D('Ich tanze wie ein kaputter Mixer, ich weiß. Aber ein kaputter Mixer hat mehr Spaß als ein heiler. Frag Mixi.')],
    M),
  vertraut: tagesgespraech('dante-tag-vertraut',
    [D('{name}! Ich hab Kekse gebacken. Für dich. Also, für alle. Aber deine sind die mit den meisten Schokostückchen. Zufall.', 'freude')],
    [D('Weißt du, was das Schlimmste am Knast war? Dass keiner „Gute Nacht“ gesagt hat. Du sagst immer „Bis später“. Das ist fast dasselbe.', 'besorgt')],
    M),
  platten: tagesgespraech('dante-tag-platten',
    [D('Psst. Hör mal. Das Knistern am Anfang. Hörst du’s? Das ist die Seele. Digital hat keine Seele. Nur Bits. Bits knistern nicht.')],
    [D('Nimm, was du kriegen kannst, und hau ab. Hab ich im Knast gedacht. Draußen hab ich dann Platten gekriegt. Und bin geblieben.', 'signatur')],
    M),
};

/** Arm-Wartung im Strang Vex × Aria (einmalig, danach Kurzoption im Menü). */
const armwartung = dialog('dante-tag-armwartung', [
  knoten('start', [
    erz('Werkbank. Dante beugt sich mit Lupenbrille über deinen Metallarm. Aria sitzt daneben auf der Werkbank, die Beine baumeln, der Schläger lehnt an der Wand.'),
    D('Wer hat das zusammengeklebt? Ripper? Natürlich Ripper. Das ist kein Arm, das ist ein Ratenvertrag mit Fingern.', 'wut'),
    A('Mach ihn heil. Ich hab ihn verbogen. … Ein bisschen.', 'verlegen'),
    erz('Dante öffnet die Abdeckung. Drähte, Öl, ein Zahnrad mit Bissspuren. Aria beugt sich vor und verzieht das Gesicht.'),
    A('Ich hab bei meinem nie zugeguckt. Ist ekliger als gedacht. Mach weiter.', 'freude'),
    D('Ich bau dir was Gescheites. Umsonst. Dafür verlier ich halt zweimal im Monat gegen Ripper beim Eins!.'),
  ], {
    choices: [
      { text: '„Nee. Ich zahl, was ich schulde.“', next: 'zahlen' },
      { text: 'Nichts sagen. Nur den Kopf schütteln.', next: 'kopf' },
    ],
  }),
  knoten('zahlen', [ich('Nee. Ich zahl, was ich schulde.', 'neutral')], { next: 'leise' }),
  knoten('kopf', [erz('Du schüttelst den Kopf. Dante seufzt. Aria guckt dich lange an.')], { next: 'leise' }),
  knoten('leise', [
    A('Ich hab damals nein gesagt zu dem Ding. Du konntest nicht.', 'trauer'),
    ich('Ich hab nicht mal gefragt.'),
    erz('Eine Weile hört man nur den Lötkolben. Dann klickt die Abdeckung zu. Der Arm summt statt zu zischen.'),
    D('Läuft jetzt leiser. Sag’s Ripper nicht. Und sag ihr nicht, dass ich weich bin.', 'verlegen'),
    A('Zu spät, Bäcker. Ich hab’s gesehen.', 'signatur'),
  ], { effects: [herz('aria', 20), herz('dante', 20), flag('vexaria_armwartung')] }),
]);

// ---------------------------------------------------------------------------------------------- Herz-Ereignisse

const he2 = dialog('he-dante-2', [
  knoten('start', [
    erz('Es riecht nach Zimt, Butter und Panik. Dante tanzt mit zwei Topflappen zwischen Ofen und Werkbank.'),
    D('Heiliges Kanonenrohr, du kommst genau richtig! Erstes Blech! Das erste Blech ist heilig! Das erste Blech –', 'freude'),
    erz('Das Blech rutscht ihm aus den Topflappen. Zwölf Kekse fliegen in Zeitlupe durch die Werkstatt.'),
  ], {
    choices: [
      { text: 'Hechten und das Blech fangen.', check: pruefung('he-dante-2-hechten', 'reflexe', 5, ['fangen']), next: 'gefangen', effects: [herz('dante', 40)] },
      {
        text: 'Die Kekse im Flug einsammeln!', next: 'flug',
        effects: [{
          minigame: 'akt-keksalarm', level: 1, key: 'he-dante-2-keksalarm', label: 'Das erste Blech',
          win: [{ give: 'dantes-kekse', qty: 2 }, herz('dante', 20)], lose: [{ message: 'Die Hälfte landet auf dem Boden. Dante zählt laut: „Eins! Zwei!“' }],
        }],
      },
      { text: 'Zu spät. Einen vom Boden aufheben und reinbeißen.', next: 'boden', effects: [herz('dante', 50)] },
    ],
  }),
  knoten('gefangen', [
    erz('Du schlitterst über den Boden und fängst das Blech zwei Zentimeter über den Fliesen. Heiß. Sehr heiß.'),
    D('DU HAST ES GEFANGEN! Das erste Blech! Weißt du, wie lange keiner mehr mein erstes Blech gefangen hat? Sieben Jahre! Weil ich sieben Jahre keins gebacken hab!', 'freude'),
  ], { next: 'regel' }),
  knoten('flug', [erz('Kekse fliegen, du fängst, Dante brüllt Zahlen, Captain Kuschel versteckt sich hinter dem Faxgerät.')], { next: 'regel' }),
  knoten('boden', [
    ich('Drei-Sekunden-Regel.'),
    D('DREI-SEKUNDEN-REGEL! Du kennst die Drei-Sekunden-Regel! Um Himmels Willen, ich hab einen Seelenverwandten!', 'ueberrascht'),
  ], { next: 'regel' }),
  knoten('regel', [
    D('Die Drei-Sekunden-Regel ist das wichtigste Gesetz der Unterstadt. Wichtiger als „Schulden muss man immer begleichen“. Sag das nicht Hunter.'),
    D('Hier. Der da. Der ist dreimal runtergefallen und immer unter drei Sekunden. Das ist ein Glückskeks. Ein Drei-Sekunden-Keks.', 'signatur'),
    erz('Er drückt dir einen leicht zerbröselten Keks in die Hand, so feierlich, als wär’s ein Orden.'),
    D('Und ab heute: Einbau gratis. Für dich. Keine Widerrede. Bezahlung nur in Kekskrümeln.', 'freude'),
  ], { effects: [{ give: 'drei-sekunden-keks' }, herz('dante', 20), { xp: 40 }, flag('dante_keks_freund'), { message: 'Cyberware-Einbau bei Dante ist ab jetzt kostenlos.' }] }),
]);

const he4 = dialog('he-dante-4', [
  knoten('start', [
    erz('Abend. Die Werkstatt glüht im Licht der Röhrenverstärker. Dante steht vor dem Plattenspieler und hält eine Platte, als wär sie ein Neugeborenes.'),
    D('Kabelbrand. Erste Tour. Vinyl-Vincent hatte sie unter einem Stapel Schlager. SCHLAGER. Das ist, als würde man einen Diamanten in Kartoffelsalat verstecken.', 'freude'),
    D('Du tanzt jetzt mit mir. Das ist keine Frage. Das ist ein Plattenspieler-Gesetz.', 'signatur'),
  ], {
    choices: [
      {
        text: 'Mitreißen lassen.', next: 'tanz',
        effects: [{
          minigame: 'akt-tanz', level: 1, key: 'he-dante-4-tanz', label: 'Werkstatt-Disco',
          win: [herz('dante', 30)], lose: [herz('dante', 10), { message: 'Du trittst ihm zweimal auf den Fuß. Er bedankt sich jedes Mal.' }],
        }],
      },
      { text: 'Dante in eine Drehung ziehen.', check: pruefung('he-dante-4-drehung', 'reflexe', 5, ['tanz']), next: 'drehung', effects: [herz('dante', 40)] },
      { text: 'Wie ein Kühlschrank wippen.', next: 'kuehlschrank', effects: [herz('dante', 25)] },
    ],
  }),
  knoten('tanz', [erz('Captain Kuschel sitzt auf dem Regal und sieht euch mit der Würde eines Hasen zu, der schon alles gesehen hat.')], { next: 'knast' }),
  knoten('drehung', [erz('Dante dreht sich, stolpert, fängt sich an der Werkbank und kreischt vor Glück.'), D('NOCHMAL!', 'freude')], { next: 'knast' }),
  knoten('kuehlschrank', [D('Wippen ist auch Tanzen! Wippen ist der Anfang von allem! Ich hab im Knast drei Jahre gewippt!', 'freude')], { next: 'knast' }),
  knoten('knast', [
    erz('Die Platte läuft aus. Ihr lasst euch aufs durchgesessene Sofa fallen. Es quietscht wie ein Akkordeon.'),
    D('Drei Jahre. Weißt du, was ich da gemacht hab? Gitarre gelernt. Ohne Gitarre.'),
    D('Ich hab mir das Griffbrett mit einem Löffel in die Pritsche geritzt. Sechs Saiten aus Zahnseide. Zehntausend Stunden. Jeden Tag. Akkorde ohne Ton.', 'trauer'),
    D('Als ich rauskam, hab ich mir eine echte gekauft. Und weißt du was? Ich konnte alles spielen. Und es klang … schrecklich. Weil ich nie gehört hatte, wie es klingen soll.', 'freude'),
    D('Seitdem sammle ich Platten. Damit ich weiß, wie’s klingen soll.'),
  ], {
    choices: [
      { text: '„Spiel mir was. Schrecklich ist okay.“', check: pruefung('he-dante-4-spielen', 'ausstrahlung', 5, ['ueberzeugen']), next: 'spiel', effects: [herz('dante', 40)] },
      { text: '„Zehntausend Stunden für nichts?“', next: 'nichts', effects: [herz('dante', 10)] },
      { text: '„Das ist das Traurigste und Schönste, was ich je gehört hab.“', next: 'schoen', effects: [herz('dante', 30)] },
    ],
  }),
  knoten('spiel', [
    erz('Er holt eine verbeulte Gitarre unter dem Sofa hervor und spielt drei Akkorde. Sie sind falsch. Sie sind wunderschön. Captain Kuschel legt die Ohren an.'),
    D('Siehst du? Schrecklich! Ich liebe es!', 'freude'),
  ], { next: 'erstpressung' }),
  knoten('nichts', [D('Für nichts? Um Himmels Willen, nein! Für die Hände! Die Hände wissen es jetzt. Das Ohr muss nur noch nachkommen.', 'ueberrascht')], { next: 'erstpressung' }),
  knoten('schoen', [
    D('… Das ist das Netteste, was einer seit dem Knast zu mir gesagt hat. Außer Captain Kuschel. Der sagt nichts, aber er meint es.', 'ueberrascht'),
  ], { next: 'erstpressung' }),
  knoten('erstpressung', [
    D('Es gibt eine Platte. „Samstagnacht im Neon“. Erstpressung, nur fünfzig Stück. Auf einer ist mein Gitarrensolo. Mein einziges. Aufgenommen mit dem Gefängnischor, über einen geschmuggelten Rekorder.', 'besorgt'),
    D('Ich hab sie nie gehört. Sie ist irgendwo da draußen. Gustav weiß vielleicht was. Oder Dexter. Oder sonst wer, der Sachen hat, die er nicht haben sollte.'),
    D('Wenn du sie findest … Heiliges Kanonenrohr. Wenn du sie findest.'),
  ], {
    choices: [
      { text: '„Ich such sie dir.“', when: { quest: 'pers-dante-erstpressung', state: 'inactive' }, next: 'ende', effects: [{ startQuest: 'pers-dante-erstpressung' }] },
      { text: '„Ich halt die Augen offen.“', when: { not: { quest: 'pers-dante-erstpressung', state: 'inactive' } }, next: 'ende' },
    ],
  }),
  knoten('ende', [
    D('Und das Sofa hier: Wenn du mal nicht heimkommst, schläfst du da. Captain Kuschel teilt. Meistens. Er tritt nachts.', 'freude'),
  ], { effects: [{ xp: 60 }, herz('dante', 20), flag('dante_sofa'), { message: 'Dantes Sofa ist jetzt ein Notschlafplatz.' }] }),
]);

const he6 = dialog('he-dante-6', [
  knoten('start', [
    erz('Tagsüber. Dante liegt halb unter der Werkbank, nur seine Beine schauen raus.'),
    D('Sicherung! Ich brauch eine Zehner-Sicherung! Im Schrank! Der linke! Nein, der rechte! NEIN, NICHT DER LINKE –', 'ueberrascht'),
    erz('Zu spät. Die linke Schranktür schwingt auf, und ein Schwall Fotos rutscht dir entgegen. Polaroids, Ausdrucke, ein zerknickter Besucherausweis vom Eisenhof. Auf jedem: Raven.'),
    erz('Raven lachend auf einem Dach. Raven mit einer Sonnenbrille, die eindeutig Hunter gehört. Raven schlafend auf genau diesem Sofa, vor sieben Jahren.'),
    D('Um Himmels Willen.', 'ueberrascht'),
    erz('Dante kriecht hervor, knallt mit dem Kopf gegen die Werkbank und sammelt die Fotos ein, als wären sie glühende Kohlen.'),
    D('Das ist … ein Archiv. Ein historisches Archiv. Für die Crew-Chronik. Ich bin der Crew-Chronist.', 'besorgt'),
    D('… Okay. Nein. Das ist kein Archiv.', 'trauer'),
    D('Ich hab ihr jeden Monat ein Foto geschickt. Damit sie die Stadt sieht. Die hier hab ich behalten. Damit ich sie seh.'),
    D('Bitte. Sag’s keinem. Vor allem nicht ihr. Ich krieg das selbst hin. Irgendwann. In zehntausend Stunden.'),
  ], {
    choices: [
      { text: '„Ich hab nichts gesehen. Großes Ehrenwort.“', next: 'versprechen', effects: [flag('dante_geheimnis_versprochen'), flag('dante_vertraut'), herz('dante', 50)] },
      {
        text: '„Sie ist frei, Dante. Du nicht. Sag’s ihr selbst.“', check: pruefung('he-dante-6-mut', 'ausstrahlung', 6, ['ueberzeugen']), next: 'mut',
        effects: [flag('dante_geheimnis_versprochen'), flag('dante_vertraut'), flag('paar_dante_raven_ermutigt'), herz('dante', 60)],
      },
      {
        text: '„Was ist dir mein Schweigen wert?“', check: pruefung('he-dante-6-erpressen', 'strasse', 5, ['einschuechtern']), next: 'erpressen',
        effects: [flag('dante_geheimnis_versprochen'), { give: 'dantes-kekse', qty: 3 }, herz('dante', -10)],
      },
      { text: '„Raven? Die ist über dich weg. Sieben Jahre, Dante.“', next: 'entmutigen', effects: [flag('paar_dante_raven_entmutigt'), herz('dante', -20)] },
      {
        text: '„Und wenn jemand anderes will, dass du ihn ansiehst?“', tag: '[Romanze]', when: ROM, next: 'romanze',
        effects: [flag('dante_geheimnis_versprochen'), flag('dante_romanze_angedeutet'), herz('dante', 30)],
      },
    ],
  }),
  knoten('versprechen', [
    D('Großes Ehrenwort. Mit Spucke?'),
    ich('Ohne Spucke.'),
    D('Ohne Spucke. Okay. Das ist ernster. Ohne Spucke ist viel ernster.', 'freude'),
  ], { next: 'ende' }),
  knoten('mut', [
    D('Frei. Ich bin … nicht frei. Heiliges Kanonenrohr, du hast recht. Ich sitz immer noch. In dem Schrank da.', 'trauer'),
    D('Irgendwann sag ich’s ihr. Mit Keksen. Und einer Platte. Und vielleicht einem Plan. Hast du einen Plan? Nein? Ich mach einen. Mit Diagramm.'),
  ], { next: 'ende' }),
  knoten('erpressen', [
    D('Erpressung! In meiner eigenen Werkstatt! Bei meinen eigenen Fotos!', 'wut'),
    D('… Drei Kekse. Mehr hab ich nicht. Die sind frisch. Fast. Einer war kurz auf dem Boden. Unter drei Sekunden.'),
  ], { next: 'ende' }),
  knoten('entmutigen', [
    D('Ja. Ja, wahrscheinlich. Sieben Jahre.', 'trauer'),
    erz('Er legt die Fotos zurück. Eins nach dem anderen, sehr sorgfältig, als würde er eine Platte in die Hülle schieben.'),
    D('Nimm, was du kriegen kannst, und hau ab. Hab ich nie gekonnt.'),
  ], { next: 'ende' }),
  knoten('romanze', [
    D('Jemand … anderes? Wer? Du? Um Himmels Willen.', 'verlegen'),
    D('Ich hab gerade einen Schrank voller Fotos aufgemacht, und du … Das ist zu viel Information für einen Werktag. Frag mich das nochmal. Wenn ich nicht zwischen Polaroids sitze.', 'verlegen'),
  ], { next: 'ende' }),
  knoten('ende', [
    erz('Die Schranktür geht zu. Klick. Dante lehnt sich mit dem Rücken dagegen, als könnte sie sonst wieder aufspringen.'),
    D('Zehner-Sicherung. Rechter Schrank. Bitte.', 'besorgt'),
  ], { effects: [{ xp: 100 }, herz('dante', 20)] }),
]);

// ♥8 und ♥10: angelegt, erst ab act2.
const he8 = dialog('he-dante-8', [
  knoten('start', [
    erz('Sonntag, Flohmarkt. Dante sitzt zwischen zwei Kisten Platten und einem Karton VHS. Er hält dir ein abgegriffenes Kartendeck hin.'),
    D('Mein erstes Eins!-Deck. Seit dem Knast nie mehr angefasst. Ich hasse Eins!. Ich liebe dieses Deck. Du kriegst es.', 'besorgt'),
    D('Weißt du, warum ich aufgehört hab? Mit dem Hacken? Digital ist kalt. Du hackst ein System, und es merkt nicht mal, dass du da warst.'),
    D('Eine Platte merkt es. Jeder Kratzer erzählt, wer sie gehört hat. Ich will Sachen, die sich an mich erinnern. Das ist die Wärme der Analogtechnik.', 'freude'),
  ], {
    effects: [{ give: 'dantes-altes-deck' }],
    choices: [
      { text: '„Ich erinnere mich an dich, Dante. Ohne Kratzer.“', next: 'freund', effects: [herz('dante', 40)] },
      { text: '„Dann leg eine Platte auf. Für uns.“', tag: '[Romanze]', when: { all: [ROM, { notFlag: 'paar_dante_raven_geholfen' }] }, next: 'tanz' },
    ],
  }),
  knoten('freund', [D('Ohne Kratzer. Ha! Gib mir Zeit. Ich krieg dich noch zerkratzt. Im guten Sinn!', 'freude')], { effects: [{ xp: 150 }] }),
  knoten('tanz', [
    erz('Er legt eine Platte auf den Koffer-Plattenspieler, eine, die er seit dem Knast nicht mehr gehört hat. Zwischen den Kisten tanzt ihr. Er tritt dir dreimal auf den Fuß.'),
    D('Das ist Absicht. Taktik. Damit du näher kommst.', 'verlegen'),
    erz('Es funktioniert.'),
  ], { effects: [flag('dante_romanze_tanz'), herz('dante', 50), { xp: 150 }] }),
]);

const he10 = dialog('he-dante-10', [
  knoten('start', [
    erz('Werkstatt, spät. Dante hält Captain Kuschel im Arm wie einen Pokal.'),
    D('Captain Kuschel braucht einen Paten. Falls mir was passiert. Oder falls ich backe und vergess, ihn zu füttern. Das passiert öfter, als ich zugeben will.'),
    D('Und das hier. Das Original. Mit Fettflecken. Wer das Rezept hat, gehört zur Familie. Das ist ein Gesetz. Ich hab’s grad erlassen.', 'freude'),
  ], {
    effects: [{ give: 'kekse-rezept' }, flag('dante_kuschel_pate'), { xp: 200 }],
    choices: [
      { text: '„Und Raven?“', next: 'raven', when: { notFlag: 'dante_romanze_zusammen' } },
      { text: '„Dante. Und wir?“', tag: '[Romanze]', when: { all: [ROM, { notFlag: 'paar_dante_raven_geholfen' }] }, next: 'wir' },
    ],
  }),
  knoten('raven', [D('Raven. Ich … brauch Hilfe. Ein Date. Ein richtiges. Mit Kerzen. Ohne Feuerlöscher. Na gut, mit Feuerlöscher. Hilfst du mir?', 'besorgt')], {
    choices: [
      { text: '„Ich helf dir. Wir machen das richtig.“', next: 'helfen', effects: [flag('paar_dante_raven_geholfen'), flag('paar_dante_raven_gestoert', false), herz('dante', 60)] },
      { text: '„Lass das, Dante. Das wird nichts.“', next: 'stoeren', effects: [flag('paar_dante_raven_gestoert'), herz('dante', -30)] },
      { text: '„Das musst du allein schaffen.“', next: 'allein', effects: [herz('dante', 10)] },
    ],
  }),
  knoten('helfen', [D('Richtig! Mit Plan! Mit Diagramm! Ich hab schon ein Diagramm! Es hat Farben!', 'freude')]),
  knoten('stoeren', [D('… Na gut. Ich hab’s wenigstens versucht. Fast.', 'trauer')]),
  knoten('allein', [D('Allein. Ja. Zehntausend Stunden allein. Ich kann das. Glaub ich.', 'besorgt')]),
  knoten('wir', [
    D('Wir? Ich … Raven … du … Heiliges Kanonenrohr, ich hab zwei Herzen, und eins davon ist ein Röhrenverstärker.', 'verlegen'),
    erz('Ein Knall im Sicherungskasten. Stromausfall. Nur die Röhren glimmen noch orange. Dante redet weiter. Über Kondensatoren. Über Spannungsspitzen. Ohne Punkt und Komma.'),
  ], {
    choices: [
      { text: 'Ihn küssen.', next: 'kuss', effects: [{ cutscene: 'szene-rom-dante-werkstatt' }, herz('dante', 60)] },
      { text: '„Dante. Halt die Klappe.“', check: pruefung('he-dante-10-klappe', 'ausstrahlung', 7, ['flirt']), next: 'kuss', effects: [{ cutscene: 'szene-rom-dante-werkstatt' }, herz('dante', 70)] },
    ],
  }),
  knoten('kuss', [
    erz('Er verstummt mitten im Wort „Elektrolyt“. Seine Hände sind warm vom Lötkolben und zittern ein bisschen. Er schmeckt nach Zimt.'),
    D('… Okay. Das war besser als jede Erstpressung. Und ich hab eine Erstpressung.', 'zaertlich'),
    R('(am nächsten Tag, trocken) Viel Glück. Er redet beim Küssen.', 'signatur'),
  ], {
    effects: [flag('dante_romanze_zusammen')],
    choices: [
      { text: 'Bleiben.', next: 'morgen', effects: [flag('dante_nacht'), { cutscene: 'szene-dante-nacht' }] },
      { text: '„Ein andermal, Kekskönig.“', next: 'andermal' },
    ],
  }),
  knoten('morgen', [
    erz('Morgen danach. Dante steht in Unterhose und Schürze am Ofen. Drei Bleche.'),
    D('Drei Bleche. Ich war motiviert.', 'verlegen'),
  ], { effects: [{ checkBuff: { id: 'beschwingt-dante', label: 'Beschwingt', value: 1, attribute: 'ausstrahlung' } }] }),
  knoten('andermal', [D('Ein andermal. Ich back schon mal vor. Für den Fall der Fälle. Für alle Fälle.', 'signatur')]),
]);

// ---------------------------------------------------------------------------------------------- Figur

const dante: NpcDef = {
  id: 'dante',
  name: 'Dante',
  unknownName: 'Mann mit Plattenkiste',
  portrait: 'dante',
  sprite: 'dante-walk',
  faction: 'crew-hunter',
  romanceable: true,
  bio: 'Ehemaliger Hacker, seit dem Knast „im Ruhestand“. Schrauber mit Werkstatt voller Platten, VHS und einem Faxgerät von 2060. Backt Kekse, verliert beim Eins!, versteckt Fotos im Schrank.',
  gifts: {
    loves: ['vinyl-platte', 'vhs-kassette', 'faxpapier', 'nougatbombe'],
    likes: ['chips-tuete', 'comic-heft', 'loetkolben-gold', 'plueschmoehre', 'retro-tastatur', 'echtobst-apfel', 'hofhonig'],
    dislikes: ['datenkristall', 'seltenes-implantat'],
    hates: ['kartendeck', 'goldknauf-replik', 'nexi-pluesch', 'rostige-dose', 'virus-implantat'],
  },
  schedule: [
    // he-dante-8 (act2): Sonntag auf dem Flohmarkt.
    { slot: 'tag', days: ['so'], when: { act: 2 }, place: { map: 'schrottmarkt', at: 'flohmarkt' } },
    { slot: 'morgen', days: ['mo', 'do'], place: { map: 'schrottmarkt', at: 'plattenkiste-dante' } },
    { slot: 'morgen', place: { map: 'dantes-werkstatt', at: 'ofen' } },
    { slot: 'tag', place: { map: 'dantes-werkstatt', at: 'werkbank' } },
    { slot: 'abend', days: ['do'], place: { map: 'dantes-werkstatt', at: 'eins-tisch' } },
    { slot: 'abend', place: { map: 'dantes-werkstatt', at: 'plattenspieler' } },
    { slot: 'nacht', days: ['sa'], place: { map: 'high-voltage', at: 'tanzflaeche' } },
    { place: 'away' },
  ],
  heartEvents: [
    { id: 'he-dante-2', hearts: 2, map: 'dantes-werkstatt', time: ['morgen', 'abend'], when: KENNT, dialogue: 'he-dante-2' },
    { id: 'he-dante-4', hearts: 4, map: 'dantes-werkstatt', time: 'abend', when: { all: [KENNT, { not: { weekday: 'do' } }] }, dialogue: 'he-dante-4' },
    { id: 'he-dante-6', hearts: 6, map: 'dantes-werkstatt', time: 'tag', when: KENNT, cutscene: 'szene-he-dante-6', dialogue: 'he-dante-6' },
    { id: 'he-dante-8', hearts: 8, map: 'schrottmarkt', time: 'tag', when: { all: [{ act: 2 }, { weekday: 'so' }] }, dialogue: 'he-dante-8' },
    { id: 'he-dante-10', hearts: 10, map: 'dantes-werkstatt', time: 'nacht', when: { all: [{ act: 2 }, { seen: 'he-dante-8' }] }, dialogue: 'he-dante-10' },
  ],
  companion: {
    // world.md §4.6/§11.2: Dante kämpft erst ab act2 (main-2-countdown).
    recruit: { act: 2 },
    stats: {
      hp: 42, armor: 1, morale: 70,
      attributes: { technik: 8, koerper: 3, reflexe: 5, ausstrahlung: 5, strasse: 4 },
      weapon: { kind: 'smart', damage: 4, range: 6, hit: 5 },
      abilities: ['dante-nougatbomben-wurf', 'dante-heiliges-kanonenrohr'],
    },
    heartAbilities: [{ hearts: 6, ability: 'dante-kuschel-ablenkung' }],
  },
  partyCheckBonus: [
    { attribute: 'technik', tags: ['hacken', 'reparieren'], value: 1, label: 'Dante quasselt dir ins Ohr' },
  ],
  talk: [
    rede('dante-tag-rivale', { rival: 'dante' }),
    rede('dante-tag-verpetzt', { all: [{ flag: 'dante_geheimnis_gebrochen' }, { notFlag: 'dante_reagierte_verpetzt' }] }),
    rede('dante-tag-armwartung', { all: [VEX, { seen: 'rom-vexaria-armdruecken' }, { notFlag: 'vexaria_armwartung' }, { time: ['tag', 'abend'] }] }),
    rede('dante-tag-vexaria-muellsack', { all: [VEX, { flag: 'vexaria_knutsch' }, { notFlag: 'dante_kommentar_vexaria_muellsack' }] }),
    rede('dante-tag-vexaria-zusammen', { all: [VEX, { flag: 'aria_kuss' }, { notFlag: 'dante_kommentar_vexaria_zusammen' }] }),
    rede('dante-tag-aria-romanze', { all: [{ not: VEX }, { flag: 'aria_romanze_zusammen' }, { notFlag: 'dante_kommentar_aria_romanze' }] }),
    rede('dante-tag-fremd', { not: KENNT }),
    rede('dante-tag-zeit', { not: { act: 2 } }, 8),
    rede('dante-tag-eins', { all: [{ weekday: 'do' }, { time: 'abend' }] }),
    rede('dante-tag-plattenkiste', { all: [{ weekday: ['mo', 'do'] }, { time: 'morgen' }] }),
    rede('dante-tag-ofen', { time: 'morgen' }),
    rede('dante-tag-werkbank', { time: 'tag' }),
    rede('dante-tag-tanzflaeche', { all: [{ weekday: 'sa' }, { time: 'nacht' }] }),
    rede('dante-tag-vertraut', undefined, 6),
    rede('dante-tag-platten'),
  ],
};

export const part: ContentPart = {
  npcs: { dante },
  dialogues: sammle(
    T.rivale, T.verpetzt, T.muellsack, T.vexariaZusammen, T.ariaRomanze, T.fremd, T.zeit, T.eins, T.plattenkiste,
    T.ofen, T.werkbank, T.tanzflaeche, T.vertraut, T.platten, armwartung,
    he2, he4, he6, he8, he10,
  ),
  cutscenes: sammleSzenen(
    {
      id: 'szene-he-dante-6', title: 'Der Schrank',
      beats: [
        { image: 'cut-he-dante-6', pan: 'in', fade: 'in', caption: 'Dantes Werkstatt. Der linke Schrank. Der falsche Schrank.', hold: 1400 },
        { image: 'cut-he-dante-6', pan: 'left', lines: [D('Nicht hingucken! Doch, hingucken! Nein! Augen zu! Um Himmels Willen!', 'ueberrascht')] },
      ],
    },
    {
      id: 'szene-rom-dante-werkstatt', title: 'Die Wärme der Analogtechnik',
      beats: [{ image: 'cut-rom-dante-werkstatt', pan: 'in', fade: 'in', caption: 'Stromausfall. Nur die Röhren glimmen. Und zum ersten Mal sagt Dante nichts.', hold: 2200 }],
    },
    {
      id: 'szene-dante-nacht', title: 'Nicht jugendfrei für Hasen',
      beats: [
        { image: 'cut-rom-dante-werkstatt', pan: 'out', lines: [D('Captain Kuschel, raus. Ja, du auch. Der Rest der Nacht ist … nicht jugendfrei für Hasen. Oder Hunde. Was auch immer du bist.', 'verlegen')] },
        abblende('Die Röhren glimmen weiter. Irgendwo knistert eine Platte, die keiner mehr umdreht.'),
      ],
    },
  ),
  phone: {
    'tel-dante-kekse': {
      id: 'tel-dante-kekse', from: 'dante',
      text: 'KEKSALARM! Morgens oder abends, Werkstatt! Bring Hunger mit! Und Schuhe, der Boden ist heiß!',
      auto: { all: [{ hearts: 'dante', min: 2 }, KENNT, neu('he-dante-2')] },
    },
    'tel-dante-platte': {
      id: 'tel-dante-platte', from: 'dante',
      text: 'Hab eine Platte gefunden. DIE Platte. Komm heute Abend vorbei. Nicht donnerstags, da verlier ich beim Eins!. Um Himmels Willen, komm!',
      auto: { all: [{ hearts: 'dante', min: 4 }, neu('he-dante-4')] },
    },
    'tel-dante-sicherung': {
      id: 'tel-dante-sicherung', from: 'dante',
      text: 'Brauch tagsüber deine Hilfe in der Werkstatt. Sicherungskasten. Fass bloß nicht den linken Schrank an. Da ist nichts drin. Wirklich gar nichts.',
      auto: { all: [{ hearts: 'dante', min: 6 }, neu('he-dante-6')] },
    },
  },
};
