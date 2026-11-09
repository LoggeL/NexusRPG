// Elsa – Bastlerin am Aussiedlerhof, Opa Gustavs Frau (world.md §4.4 opa-gustav, §4.5, §6.5 pers-gustav-alte-liebe,
// pers-alesa-wasserfilter; act23.json npcSchedules/events). Ging vor zwanzig Jahren zu den Aussiedlern, weil sie ins Grüne
// wollte und Gustav nicht aus der Stadt. Ihr Lied mit Gustav: „Der letzte Zug nach Grün“ (2034).
// Questdialoge (Brief überbringen, Werkstatt reparieren, Zentrator-Wasserfilter) bauen die Quest-Pakete.
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode } from '../../../modules/contracts';
import {
  type Menue, dialog, erz, flag, geschenke, gespraech, herz, knoten, nichtGetroffen, ort, pruefung, rede, sammle,
  sprecher, weg, weltfigur, zurueck,
} from './_oednis';

const ID = 'elsa';
const E = sprecher(ID);
const Z = zurueck('Noch was, Elsa.', 'Bis später, Elsa.');

const GUSTAV_LAEUFT: Condition = { quest: 'pers-gustav-alte-liebe', state: 'active' };
const GUSTAV_DONE: Condition = { quest: 'pers-gustav-alte-liebe', state: 'done' };
const ALESA_LAEUFT: Condition = { quest: 'pers-alesa-wasserfilter', state: 'active' };
const ALESA_DONE: Condition = { quest: 'pers-alesa-wasserfilter', state: 'done' };

const choices: DialogueChoice[] = [
  { text: 'Was baust du gerade?', next: 'bauen' },
  { text: 'Hast du Wasserfilter?', next: 'filter', effects: [{ shop: 'hofladen' }] },
  { text: 'Wie lebt es sich hier draußen?', next: 'leben' },
  { text: '„Kennst du einen Gustav vom Schrottmarkt?“', when: { all: [{ not: GUSTAV_LAEUFT }, { not: GUSTAV_DONE }, { met: 'opa-gustav' }] }, once: true, id: 'elsa-gustav-frage', next: 'gustav' },
  { text: 'Wie geht’s dir und Gustav?', when: GUSTAV_DONE, next: 'paar' },
  {
    text: 'An Elsas Werkbank eine Kleinigkeit reparieren.', tag: '[Werkbank]', when: { notFlag: 'heute_elsa_werkbank' }, next: 'werkbank',
    effects: [flag('heute_elsa_werkbank'), {
      minigame: 'akt-werkbank', level: 2, key: 'elsa-werkbank', label: 'Elsas Werkbank',
      win: [herz(ID, 15), { give: 'reparaturset' }, { rep: 'aussiedler', delta: 2 }, { message: 'Elsa: „Sauber verlötet. Gustav hätte geflucht. Du nicht. Das ist ein Fortschritt.“' }],
      lose: [{ message: 'Elsa pustet den Rauch weg. „Funkt nicht. Riecht aber interessant.“' }],
    }],
  },
  { text: '„Wofür baust du all das Zeug, wenn es hier keiner sieht?“', tag: '[Elsa ♥3]', requires: { hearts: ID, min: 3 }, once: true, id: 'elsa-wofuer', next: 'wofuer' },
  { text: 'Bis später, Elsa.' },
];

const nodes: DialogueNode[] = [
  knoten('bauen', [
    E('Einen Bewässerungsroboter aus einem Kühlschrank, zwei Scheibenwischern und einer Kaffeemaschine. Er gießt die Beete und macht dabei Espresso. Keiner hat danach gefragt. Darum mach ich’s.', 'freude'),
    E('Und Mecker, die Ziege, braucht neue Kniegelenke. Sie klettert auf alles. Gestern aufs Solarsegel. Heute auf Marlas Wohnwagen. Morgen vermutlich auf mich.'),
  ], { choices: Z }),
  knoten('filter', [E('Im Hofladen. Die Filter baue ich, Marla verkauft sie. Sie ist besser im Verkaufen. Ich sag den Leuten immer, was alles kaputtgehen kann. Das ist schlecht fürs Geschäft.')]),
  knoten('leben', [
    E('Langsam. Staubig. Grün, wenn man sich Mühe gibt. In der Stadt hab ich vierzig Jahre lang Dinge repariert, die andere weggeworfen haben. Hier repariere ich Dinge, die sonst keiner hat.'),
    E('Und abends ist es so still, dass du deine eigenen Gedanken hörst. Am Anfang ist das furchtbar. Nach zwanzig Jahren ist es fast schön.'),
  ], { choices: Z }),
  knoten('gustav', [
    erz('Elsa legt den Lötkolben ab. Sehr vorsichtig. Als wäre er plötzlich zerbrechlich.'),
    E('Gustav. Mit dem Kran. Und dem Klappstuhl mit der Kuhle.', 'trauer'),
    E('Ich kenne einen Gustav. Den kannte ich mal sehr gut. Der hat sich zwanzig Jahre nicht gemeldet. Wenn er was will, soll er selbst kommen. Oder wenigstens schreiben. Mit der Hand. Nicht diktiert an eine Taube.'),
  ], { choices: Z, effects: [flag('elsa_kennt_gustav_frage')] }),
  knoten('paar', [
    E('Er kommt sonntags. Er sitzt auf der Bank und meckert über den Sand. Dann repariert er meinen Bewässerungsroboter, obwohl der nicht kaputt ist. Dann geht er wieder.', 'freude'),
    E('Ich hab ihm gesagt, er soll den Kran mitbringen. Er sagt, der Kran heißt wie ich und das wäre komisch. Ich sag: Komisch war, dass du zwanzig Jahre gebraucht hast.'),
  ], { choices: Z }),
  knoten('werkbank', [E('Da liegt ein Funkgerät, das nur noch Wetterberichte von 2050 empfängt. Wenn du’s hinkriegst, gehört dir das Ersatzteil, das übrig bleibt. Es bleibt immer eins übrig.')]),
  knoten('wofuer', [
    E('Weil irgendwann einer kommt, der genau das braucht. Ein Stadtkind mit kaputtem Arm. Ein Konvoi mit gebrochener Achse. Ein alter Mann mit gebrochenem Herzen. Ich hab für alles ein Ersatzteil.', 'zaertlich'),
    E('Nur fürs Herz nicht. Da muss man selbst kommen.'),
  ], { choices: Z, effects: [herz(ID, 25)] }),
];

const M: Menue = { zeile: E('Was noch? Ich hab Lot auf dem Kolben, das wird nicht wärmer.'), choices, nodes };

const T = {
  rivale: dialog('elsa-tag-rivale', [knoten('start', [
    E('Für dich hab ich keine Ersatzteile. Für dich hab ich nicht mal eine Schraube übrig.', 'wut'),
    E('Geh. Bevor ich Mecker auf dich hetze. Sie frisst Stiefel. Mit Füßen drin.'),
  ])]),
  erstes: gespraech('elsa-tag-erstes', [
    erz('In der Werkstatt aus Wellblech und Lehm sitzt eine kleine Frau um die siebzig, Strohhut, Schweißerbrille auf der Stirn, Ärmel hochgekrempelt. Um sie herum Kabel, Rohre, halb fertige Maschinen. Neben ihr ein Ziegenroboter, der an einem Schraubenzieher kaut.'),
    E('Ein neues Gesicht. Selten hier draußen. Ich bin Elsa. Das ist Mecker. Fass sie nicht an, sie beißt. Fass auch sonst nichts an. Das meiste beißt auch.'),
  ], M),
  morgen: gespraech('elsa-tag-morgen', [
    erz('Früh am Morgen. Elsa sitzt vor der Werkstatt, eine Tasse Tee in der Hand, und sieht den Solarsegeln beim Aufwachen zu. Mecker steht auf dem Werkstattdach und meckert.'),
    E('Morgen. Die Segel brauchen eine Stunde, bis sie Strom machen. Ich auch. Setz dich, wenn du leise bist.'),
  ], M),
  abend: gespraech('elsa-tag-abend', [
    erz('Am Lagerfeuer des Hofs. Die Aussiedler sitzen auf Kanistern, jemand spielt Mundharmonika. Elsa hat ihre Brille abgenommen und sieht plötzlich viel weicher aus.'),
    E('Abends wird hier nicht gearbeitet. Abends wird erzählt, gegessen und so getan, als hätte man keine Rückenschmerzen.'),
  ], M),
  gustavLaeuft: gespraech('elsa-tag-gustav-laeuft', [
    erz('Elsa sieht dich an. Lange. Dann wieder auf ihre Werkbank. Ihre Hände zittern ein bisschen, als sie die Schraube eindreht.'),
    E('Du riechst nach Schrottmarkt. Nach Altöl und gebrannten Mandeln. Ich weiß, wer dich schickt. Ich weiß nur noch nicht, ob ich es hören will.', 'besorgt'),
  ], M),
  paar: gespraech('elsa-tag-paar', [
    erz('Auf der Bank vor der Werkstatt liegt ein Klappstuhlkissen mit einer Kuhle. Elsa tut so, als hätte sie es nicht dort hingelegt.'),
    E('Ah, unser Postbote. Gustav lässt grüßen. Er lässt jeden Tag grüßen. Per Taube. Zwanzig Jahre nichts und jetzt hab ich einen ganzen Taubenschwarm im Garten.', 'freude'),
  ], M),
  alesa: gespraech('elsa-tag-alesa', [
    E('Diese Alesa von Quantum. Hat einen Zentrator in meine Werkstatt geschleppt und will daraus einen Wasserfilter bauen. Ein Gerät, das Gehirne umschreibt, soll jetzt Brunnenwasser putzen.', 'ueberrascht'),
    E('Verrückt. Gefällt mir. Ich hab ihr meinen besten Lötkolben geliehen. Den leih ich sonst keinem. Nicht mal Gustav.'),
  ], M),
  alesaDone: gespraech('elsa-tag-alesa-done', [
    E('Der Brunnen läuft. Klares Wasser, das nach nichts schmeckt. Weißt du, wie selten das ist? Wasser, das nach nichts schmeckt?', 'freude'),
    E('Alesa kommt jetzt einmal im Monat und wir bauen Unsinn zusammen. Letztes Mal einen Toaster, der Gedichte druckt. Schlechte Gedichte. Aber knusprige.'),
  ], M),
  freund: gespraech('elsa-tag-freund', [E('Da bist du ja! Ich hab dir einen Tee gemacht. Er ist kalt geworden, weil du zu spät bist. Trink ihn trotzdem.', 'freude')], M),
  standard: gespraech('elsa-tag-standard', [E('Na? Kaputt, durstig oder neugierig? Für alle drei hab ich was. Nur nicht gleichzeitig.')], M),
};

/** ♥2: Mecker, der Ziegenroboter, ist vom Solarsegel gefallen und hat sich ein Knie zerlegt. */
const he2 = dialog('he-elsa-2', [
  knoten('start', [
    erz('Morgens vor der Werkstatt. Mecker liegt auf der Seite, ein Hinterbein steht in einem Winkel ab, den Ziegen nicht haben sollten. Sie meckert. Laut. In Moll.'),
    E('Sie ist wieder aufs Solarsegel geklettert. Und runtergefallen. Wieder. Das Kniegelenk ist hin. Und meine Hände sind heute nicht ruhig genug für die Feinarbeit.', 'besorgt'),
    E('Hilf mir. Du hältst, ich schraube. Oder umgekehrt. Hauptsache, sie hört auf zu meckern, bevor die Hühner Depressionen kriegen.'),
  ], {
    choices: [
      { text: 'Das Kniegelenk selbst neu einsetzen.', tag: '[Technik 4]', check: pruefung('he-elsa-2-knie', 'technik', 4, ['reparieren']), next: 'technik' },
      { text: 'Mecker festhalten, egal wie sehr sie zappelt.', tag: '[Körper 3]', check: pruefung('he-elsa-2-halten', 'koerper', 3, ['kraft', 'tiere']), next: 'halten' },
      { text: 'Mecker hinter den Ohren kraulen und ihr gut zureden.', next: 'kraulen' },
    ],
  }),
  knoten('technik', [
    erz('Du ziehst das alte Gelenk raus, Elsa reicht dir ein neues aus einem Fahrradlenker. Drei Schrauben, ein Tropfen Öl. Mecker steht auf, macht einen Bocksprung und frisst dir zum Dank den Schnürsenkel.'),
    E('Sauber! Du hast Hände wie mein Gustav, früher. Bevor sie zittrig wurden. Seine, nicht meine. Meine sind immer noch gut. Fast.', 'freude'),
  ], { next: 'ende', effects: [herz(ID, 45), { xp: 40 }] }),
  knoten('halten', [
    erz('Mecker tritt, beißt, meckert und versucht dich mit dem Kopf umzuwerfen. Du hältst. Elsa schraubt. Nach zehn Minuten seid ihr alle drei voller Sand und Öl. Mecker steht. Du kaum noch.'),
    E('Ha! Die hat dir einen blauen Fleck verpasst. Den behältst du eine Woche. Ist eine Auszeichnung hier draußen.', 'freude'),
  ], { next: 'ende', effects: [herz(ID, 45), { xp: 40 }] }),
  knoten('kraulen', [
    erz('Du kraulst Mecker hinter den Blechohren. Sie hört auf zu meckern und sieht dich mit ihren Kameraaugen an. Elsa nutzt die Ruhe und schraubt, langsam, mit zusammengebissenen Zähnen. Es dauert. Aber es hält.'),
    E('Sie mag dich. Mecker mag niemanden. Sie mag nicht mal mich. Sie mag nur das Solarsegel. Und jetzt dich.'),
  ], { next: 'ende', effects: [herz(ID, 35), { xp: 25 }] }),
  knoten('ende', [
    E('Hier. Für dich. Aus dem alten Gelenk. Ich werf nichts weg, das weißt du inzwischen.'),
    erz('Sie drückt dir eine kleine Schraubenmutter in die Hand, die quietscht, wenn man sie dreht.'),
  ], { effects: [{ give: 'quietsche-mutter' }, flag('elsa_mecker_repariert'), { rep: 'aussiedler', delta: 5 }] }),
]);

/** ♥4 (nach pers-gustav-alte-liebe): Am Lagerfeuer erzählt Elsa von Gustav als jungem Kranführer. */
const he4 = dialog('he-elsa-4', [
  knoten('start', [
    erz('Abends am Lagerfeuer des Hofs. Die anderen sind schon schlafen gegangen. Elsa sitzt allein auf einem Kanister, ein altes Foto in der Hand: ein junger Mann in einer Krankabine, Zigarette im Mundwinkel, Grinsen wie ein Scheunentor.'),
    E('Weißt du, wie ich ihn kennengelernt hab? 2032, Schrottmarkt. Er hat mit dem Kran einen ganzen Kleinwagen über meinen Stand gehoben. Um mir eine Blume zu geben. Eine Plastikblume. Aus dem Handschuhfach.', 'freude'),
    E('Er hat sie mir durchs Fenster gereicht, zwanzig Meter über dem Boden. Ich hab ihn angebrüllt. Eine Woche später hab ich ihn geheiratet.'),
  ], {
    choices: [
      { text: '„Warum bist du damals gegangen?“', next: 'gegangen' },
      { text: '„Spiel mir euer Lied vor.“ Auf das alte Radio am Feuer zeigen.', tag: '[Technik 3]', check: pruefung('he-elsa-4-radio', 'technik', 3, ['funk']), next: 'lied' },
      { text: 'Neben ihr sitzen und das Feuer anschauen.', next: 'feuer' },
    ],
  }),
  knoten('gegangen', [
    E('Weil ich Grün wollte. Echtes Grün. Keine Leuchtreklame. Und er wollte die Stadt. Seinen Kran, seinen Markt, seinen Lärm. Wir haben uns angebrüllt, wochenlang. Dann bin ich mit dem letzten Konvoi raus.', 'trauer'),
    E('Ich dachte, er kommt hinterher. Er dachte, ich komm zurück. So sind zwanzig Jahre vergangen. Zwei sture Esel an zwei Enden einer Straße.'),
    E('Ohne dich wären wir da gestorben. Jeder an seinem Ende.'),
  ], { next: 'ende', effects: [herz(ID, 55)] }),
  knoten('lied', [
    erz('Du drehst am Radio, bis Radio Rost durchkommt. Opa Funk legt gerade auf, als hätte er es gewusst: Akkordeon, Geige, „Der letzte Zug nach Grün“. Elsa summt mit. Dann singt sie. Leise, ein bisschen schief.'),
    E('Er hat bei dem Lied immer geweint. Und behauptet, es sei Rost im Auge. Wie alle Männer in dieser Stadt. Es ist nie Rost.', 'zaertlich'),
  ], { next: 'ende', effects: [herz(ID, 60)] }),
  knoten('feuer', [
    erz('Ihr schweigt. Das Feuer knackt. Irgendwo am Zaun klirren Glasskorpione. Nach einer Weile lehnt Elsa ihren Kopf kurz an deine Schulter. Nur kurz.'),
    E('Danke. Fürs Briefetragen. Fürs Zuhören. Für die Plastikblume, die ich nicht weggeworfen hab. Sie liegt seit zwanzig Jahren in meiner Werkzeugkiste.'),
  ], { next: 'ende', effects: [herz(ID, 50)] }),
  knoten('ende', [
    E('Hier. Nimm das. Ich hab’s für den Tag gebaut, an dem einer kommt, der es verdient.'),
    erz('Ein Wasserfilter, handgebaut, mit einer kleinen gelöteten Blume auf dem Deckel.'),
  ], { effects: [{ give: 'wasserfilter' }, { xp: 60 }, flag('elsa_erzaehlt_gustav')] }),
]);

const elsa = weltfigur({
  id: ID,
  name: 'Elsa',
  unknownName: 'Frau mit Strohhut und Lötkolben',
  faction: 'aussiedler',
  bio: 'Bastlerin am Aussiedlerhof, um die siebzig, Strohhut und Schweißerbrille. Ging vor zwanzig Jahren aus der Stadt ins Grüne, Opa Gustav blieb. Baut Wasserfilter, Bewässerungsroboter und Ersatzteile für alles außer Herzen.',
  gifts: geschenke({
    loves: ['blumensamen', 'oelkaennchen', 'samenbombe'],
    likes: ['quietsche-mutter', 'wasserfilter', 'vhs-kassette', 'frisches-gemuese', 'tai-chi-tee'],
    dislikes: ['chrome-10-gutschein', 'haarspray-deluxe'],
    hates: ['plastikpflanze', 'magnet-stoerer'],
  }),
  schedule: [
    ort('M,T', 'aussiedlerhof', 'elsas-werkstatt'),
    ort('A', 'aussiedlerhof', 'lagerfeuer-hof'),
    weg('N'),
  ],
  heartEvents: [
    { id: 'he-elsa-2', hearts: 2, map: 'aussiedlerhof', time: 'morgen', dialogue: 'he-elsa-2' },
    { id: 'he-elsa-4', hearts: 4, map: 'aussiedlerhof', time: 'abend', when: { all: [{ seen: 'he-elsa-2' }, GUSTAV_DONE] }, dialogue: 'he-elsa-4' },
  ],
  talk: [
    rede('elsa-tag-rivale', { rival: ID }),
    rede('elsa-tag-erstes', nichtGetroffen(ID)),
    rede('elsa-tag-alesa', ALESA_LAEUFT),
    rede('elsa-tag-gustav-laeuft', GUSTAV_LAEUFT),
    rede('elsa-tag-alesa-done', ALESA_DONE),
    rede('elsa-tag-paar', GUSTAV_DONE),
    rede('elsa-tag-freund', { hearts: ID, min: 4 }),
    rede('elsa-tag-morgen', { time: 'morgen' }),
    rede('elsa-tag-abend', { time: 'abend' }),
    rede('elsa-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: elsa },
  dialogues: sammle(
    T.rivale, T.erstes, T.morgen, T.abend, T.gustavLaeuft, T.paar, T.alesa, T.alesaDone, T.freund, T.standard, he2, he4,
  ),
};
