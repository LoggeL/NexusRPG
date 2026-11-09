// Krähe – Anführerin der Staubfalken in der Wrackburg an der Staubstraße (world.md §3.5, §4.5, §6.3 side-kraehes-ehre,
// §6.4 side-strandclub gc-99, §8.5 boss-kraehe). Sammelt Geschichten, lebt nach einem Ehrenkodex.
// Questdialoge (Ehrenduell, Wrackrennen, Teilhaberin) bauen die Quest-Pakete; hier: Figur, Tagesgespräche, Herz-Ereignisse.
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode } from '../../../modules/contracts';
import {
  type Menue, dialog, erz, flag, geschenke, gespraech, herz, ich, knoten, nichtGetroffen, ort, pruefung, rede, sammle,
  sprecher, weg, weltfigur, zurueck,
} from './_oednis';

const ID = 'kraehe';
const K = sprecher(ID);
const Z = zurueck('Noch was, Krähe.', 'Wind im Rücken.');

const EHRE: Condition = { quest: 'side-kraehes-ehre', state: 'done' };
const EHRE_LAEUFT: Condition = { quest: 'side-kraehes-ehre', state: 'active' };
const FRIEDEN: Condition = { quest: 'side-oednis-frieden', state: 'done' };
const GESCHICHTE_HEUTE = 'heute_kraehe_geschichte';

const choices: DialogueChoice[] = [
  { text: 'Wer sind die Staubfalken?', next: 'falken' },
  { text: 'Was ist dein Ehrenkodex?', next: 'kodex' },
  { text: 'Warum sammelst du Geschichten?', next: 'geschichten' },
  { text: '„Was muss ich tun, damit ihr mich in Ruhe lasst?“', when: { not: EHRE }, next: 'ruhe' },
  {
    text: 'Eine Geschichte erzählen: wie Hunter den Keksalarm erfunden hat.', tag: '[Ausstrahlung 5]',
    when: { notFlag: GESCHICHTE_HEUTE }, check: pruefung('kraehe-geschichte-keks', 'ausstrahlung', 5, ['buehne']), next: 'erzaehlt-gut',
    effects: [flag(GESCHICHTE_HEUTE), { rep: 'staubfalken', delta: 3 }, herz(ID, 15)],
  },
  {
    text: 'Eine Geschichte erzählen: die Wahrheit über deinen letzten Kater. Ohne Ausschmückung.',
    when: { notFlag: GESCHICHTE_HEUTE }, next: 'erzaehlt-ehrlich',
    effects: [flag(GESCHICHTE_HEUTE), { rep: 'staubfalken', delta: 1 }, herz(ID, 5)],
  },
  {
    text: 'Ein Armdrücken gegen ihren größten Falken.', tag: '[Armdrücken]', once: true, id: 'kraehe-arm', next: 'arm',
    effects: [{
      minigame: 'akt-armdruecken', level: 3, key: 'kraehe-armdruecken', label: 'Armdrücken in der Wrackburg',
      win: [{ rep: 'staubfalken', delta: 5 }, herz(ID, 20), { message: 'Die Falken trommeln auf Blech. Krähe: „Der Kleine weint nicht. Er schwitzt aus den Augen.“' }],
      lose: [{ message: 'Krähe: „Verloren, aber mit Haltung. Haltung zählt. Ein bisschen.“' }],
    }],
  },
  { text: '„Woher hast du die Narben?“', tag: '[Krähe ♥3]', requires: { hearts: ID, min: 3 }, once: true, id: 'kraehe-narben', next: 'narben' },
  { text: '„Ich kenne die alten Lieder der Pisten.“', tag: '[Ödnis]', when: { origin: 'origin-oednis' }, once: true, id: 'kraehe-oednis', next: 'oednis' },
  { text: 'Wind im Rücken.' },
];

const nodes: DialogueNode[] = [
  knoten('falken', [
    K('Wir sind das, was übrig bleibt, wenn die Stadt dich ausspuckt und die Wüste dich nicht frisst. Motorräder, Wracks, Federn. Und Regeln.'),
    K('Die Aussiedler nennen uns Räuber. Wir nennen es Straßenpflege. Wer die Straße benutzt, zahlt. Wer nicht zahlt, läuft. Wer frech wird, läuft ohne Schuhe.', 'signatur'),
  ], { choices: Z }),
  knoten('kodex', [
    K('Drei Regeln. Erstens: Wir nehmen Zoll, kein Leben. Zweitens: Wer sich ergibt, kriegt Wasser. Drittens: Wer eine Geschichte erzählt, die ich nicht kenne, fährt umsonst.'),
    K('Die vierte Regel ist geheim. Die fünfte ist: Klau nie Rudis Pfannkuchen. Die gilt für alle in der Ödnis. Sogar für die Skorpione.'),
  ], { choices: Z }),
  knoten('geschichten', [
    K('Weil hier draußen alles zu Staub wird. Häuser, Wagen, Leute. Nur Geschichten nicht. Die erzählt man am Feuer weiter, und dann leben die Leute noch ein bisschen.'),
    K('Ich hab dreihundertzwölf. Alle im Kopf. Wenn ich sterbe, erzählen meine Falken sie weiter. Hoffentlich nicht so scheiße, wie sie singen.'),
  ], { choices: Z }),
  knoten('ruhe', [
    K('Zahl den Zoll, wie jeder. Oder beweis, dass du was taugst. Ein Ehrenduell, ein Rennen auf meiner Piste, oder eine Geschichte, die mich umhaut.', 'signatur'),
    K('Wer eins davon schafft, kriegt freies Geleit. Und eine Feder. Die Feder ist wichtig. Ohne Feder bist du hier nur ein Tourist mit Sonnenbrand.'),
  ], { choices: Z }),
  knoten('erzaehlt-gut', [
    erz('Du erzählst vom Keksalarm im High Voltage: drei Sekunden, ein Teller, eine Crew, die sich wie Raubtiere auf Dantes Kekse stürzt. Bei Hunters Sprung über den Tresen lacht Krähe so laut, dass ein Falke vom Wrackdach fällt.'),
    K('Dreihundertdreizehn! Die erzähle ich heute Nacht weiter. Mit mehr Blut. Kekse sind langweilig ohne Blut.', 'freude'),
  ], { choices: Z }),
  knoten('erzaehlt-ehrlich', [
    erz('Du erzählst vom letzten Kater. Ohne Pointe, ohne Held, nur Kopfschmerzen und ein Döner, der dich angesehen hat. Krähe hört höflich zu.'),
    K('Ehrlich. Nicht gut, aber ehrlich. Kriegt Platz dreihundertachtzig. Hinten. Neben der Geschichte von dem Kerl, der seinen Schuh gegessen hat.'),
  ], { choices: Z }),
  knoten('arm', [K('Bolle! Komm her, du Fleischberg. Und du: Ellbogen auf die Motorhaube. Wer die Haube berührt, verliert. Wer heult, verliert doppelt.')]),
  knoten('narben', [
    K('Die da am Hals: Glasskorpion. Die am Arm: mein Bruder. Die über dem Auge: eine Tür, die schneller zuging als gedacht.', 'neutral'),
    K('Und die da, die man nicht sieht? Die hat mir die Stadt verpasst. Ich war mal Zustellerin in der Oberstadt. Bis ein Quantum-Paket explodiert ist und sie mich dafür eingesperrt haben. Seitdem fahre ich lieber, wo keine Pakete sind.'),
  ], { choices: Z, effects: [herz(ID, 25)] }),
  knoten('oednis', [
    erz('Du summst die ersten Takte von „Sand im Getriebe“. Krähe stockt. Dann singt sie mit, rau und schief, und drei Falken auf den Wracks stimmen ein.'),
    K('Das kennen nur Leute, die hier groß geworden sind. Du bist nicht von außerhalb. Du gehörst hierher und warst nur zu lange weg. Willkommen zurück.', 'freude'),
  ], { choices: Z, effects: [herz(ID, 40), { rep: 'staubfalken', delta: 5 }] }),
];

const M: Menue = { zeile: K('Was noch? Die Sonne wartet nicht, und ich auch nicht lange.'), choices, nodes };

const T = {
  rivale: dialog('kraehe-tag-rivale', [knoten('start', [
    K('Du hast hier keine Feder mehr. Du hast hier nicht mal mehr Schatten.', 'wut'),
    K('Verpiss dich von meiner Straße, du ehrlose Sandlaus, bevor ich meine Falken frage, wer heute Lust auf Jagd hat.'),
  ])]),
  erstes: gespraech('kraehe-tag-erstes', [
    erz('Hinter dem Tor aus Autowracks steht eine Frau in einem Mantel aus Lederflicken und schwarzen Federn. Kurzes graues Haar, Schutzbrille auf der Stirn, ein Kettenspeer über der Schulter. Auf den Wracks über ihr hocken Gestalten mit Bolzenschleudern.'),
    K('Na sieh mal an. Ein Stadtkind. Riecht nach Neon und Angst. Ich bin Krähe. Das hier ist meine Straße.', 'signatur'),
    K('Wer hier durchwill, zahlt mit Credits, mit Mut oder mit einer guten Geschichte. Was hast du dabei?'),
  ], M),
  ehreLaeuft: gespraech('kraehe-tag-ehre-laeuft', [
    K('Und? Hast du dich entschieden? Duell, Rennen oder Geschichte. Meine Falken haben schon Wetten laufen. Die meisten auf deinen Tod. Aber nur aus Gewohnheit.', 'signatur'),
  ], M),
  ehre: gespraech('kraehe-tag-ehre', [
    erz('Die Falken auf den Wracks nicken dir zu, als du kommst. Einer tippt sich an die Schutzbrille. Das ist hier draußen ungefähr ein Handschlag.'),
    K('Da ist ja meine Lieblingsgeschichte! Du hast freies Geleit, so weit die Pisten reichen. Wer dich anfasst, kriegt es mit mir zu tun. Und mit meinem Speer. Der hat mehr Humor als ich.', 'freude'),
  ], M),
  frieden: gespraech('kraehe-tag-frieden', [
    K('Seit dem Vertrag frisst mein Haufen Pfannkuchen statt Zoll. Die werden fett. Die Hälfte kommt nicht mehr aufs Motorrad.', 'freude'),
    K('Ist trotzdem gut. Marla hat mir gestern Wasser angeboten, einfach so. Ich hab fast geheult. Erzähl das keinem, sonst ess ich dich.'),
  ], M),
  nacht: gespraech('kraehe-tag-nacht', [
    erz('Im Hof der Wrackburg brennt ein Feuer in einer halben Ölwanne. Die Falken sitzen drumherum auf Autositzen. Krähe steht und erzählt, die Hände in der Luft, ihre Schatten tanzen über das Blech.'),
    K('… und dann sagt der Skorpion: „Ich bin nicht wegen dem Wasser hier.“ Ha! Setz dich. Hier wird jetzt erzählt. Wer nur zuhört, holt Holz.'),
  ], M),
  freund: gespraech('kraehe-tag-freund', [
    K('Na, du Wüstenblume. Wieder auf meiner Straße? Ich hab dir einen Platz am Feuer freigehalten. Der Platz hatte vorher Bolle. Bolle hat geheult.', 'freude'),
  ], M),
  epilog: gespraech('kraehe-tag-epilog', [
    erz('Krähe sitzt auf dem Falkenpflock am Strand, die Stiefel im Sand, eine Kokosnuss mit Strohhalm in der Hand. Sie trägt eine Sonnenbrille mit Federn am Bügel.'),
    K('Teilhaberin. Klingt gut, oder? Ich bin jetzt Geschäftsfrau. Ich hab einen Stempel. Er macht ein Federmuster. Ich stempel alles. Auch Hunter.', 'freude'),
    K('Das Meer ist größer, als ich dachte. Lauter, auch. Es erzählt die ganze Zeit dieselbe Geschichte. Aber die ist gut.'),
  ], M),
  standard: gespraech('kraehe-tag-standard', [K('Stadtkind. Was willst du? Zoll zahlen oder Zeit verschwenden?')], M),
};

/** ♥2: Krähe sammelt Geschichten. Im Hof der Wrackburg muss man ihr eine erzählen, die sie nicht kennt. */
const he2 = dialog('he-kraehe-2', [
  knoten('start', [
    erz('Mittagshitze im Hof der Wrackburg. Die Falken dösen unter Planen. Krähe sitzt auf einer Motorhaube, ein zerfleddertes Notizbuch auf den Knien, und kaut auf einem Bleistift.'),
    K('Du. Komm her. Ich hab ein Problem. Mir gehen die Geschichten aus. Die Falken erzählen nur noch, wer wem das Motorrad geklaut hat. Ich kann das nicht mehr hören.', 'besorgt'),
    K('Erzähl mir was aus der Stadt. Was Echtes. Wenn es mir gefällt, schreib ich’s auf. Das ist hier draußen eine Ehre. Fast so gut wie ein Denkmal. Nur billiger.'),
  ], {
    choices: [
      { text: 'Die Geschichte vom Hasen, der eine Hackercrew anführt. (Captain Kuschel)', tag: '[Ausstrahlung 4]', check: pruefung('he-kraehe-2-kuschel', 'ausstrahlung', 4, ['buehne']), next: 'kuschel' },
      { text: 'Die Geschichte vom Bürgermeister, der im Kanal auf einem Kronkorken-Thron sitzt.', tag: '[Straße 4]', check: pruefung('he-kraehe-2-gully', 'strasse', 4, ['geruecht']), next: 'gully' },
      { text: 'Ehrlich sagen: „Ich bin nicht gut im Erzählen. Erzähl du mir eine.“', next: 'umgekehrt' },
    ],
  }),
  knoten('kuschel', [
    erz('Du erzählst von Captain Kuschel: Plüschhase, Maskottchen, Gewissen der Crew, mit einer Mütze, die er nie abnimmt. Wie Dante ihn bei jedem Einbruch mitnimmt. Wie Nyra ihm Bericht erstattet. Krähe hört mit offenem Mund zu.'),
    K('Ein Hase. Als Anführer. Der nichts sagt und alle hören trotzdem auf ihn.', 'ueberrascht'),
    K('Das ist die beste Geschichte seit Jahren. Das ist ein Hase mit Ehre. Wenn ich sterbe, will ich als Hase wiederkommen.'),
  ], { next: 'ende', effects: [herz(ID, 50), { xp: 40 }] }),
  knoten('gully', [
    erz('Du erzählst vom Bürgermeister Gully, der unter der Stadt regiert, mit einer Krone aus Kronkorken, Ratten als Hofstaat und einem Rathaus in einem trockengelegten Dock.'),
    K('Ein König im Abwasser. Mit Krone aus Flaschendeckeln. Und alle gehorchen ihm, weil er der Einzige ist, der sich den Titel selbst gegeben hat.', 'freude'),
    K('Das gefällt mir. Das ist ehrlich. So funktionieren alle Könige. Nur riechen die meisten besser.'),
  ], { next: 'ende', effects: [herz(ID, 50), { xp: 40 }] }),
  knoten('umgekehrt', [
    K('Ehrlich, hm? Selten. Gut, dann hör zu.', 'neutral'),
    erz('Krähe erzählt von einer Fahrerin, die einen Konvoi durch einen Sandsturm geführt hat, blind, nur nach dem Geräusch der singenden Masten. Sie erzählt es so gut, dass du den Sand im Mund schmeckst. Am Ende stellt sich heraus: Die Fahrerin war sie selbst. Mit siebzehn.'),
    K('Die hab ich noch keinem erzählt. Siehst du? Du bist doch gut im Erzählen. Du kannst nur besser zuhören.'),
  ], { next: 'ende', effects: [herz(ID, 40), { xp: 30 }] }),
  knoten('ende', [
    erz('Krähe schreibt etwas in ihr Notizbuch. Neben den Eintrag malt sie eine kleine Feder.'),
    K('Du stehst jetzt im Buch. Wer im Buch steht, wird von meinen Falken nicht ausgeraubt. Nur ein bisschen angepöbelt. Aus Liebe.'),
  ], { effects: [flag('kraehe_buch'), { rep: 'staubfalken', delta: 5 }] }),
]);

/** ♥4 (nach side-kraehes-ehre): Abends am Lagerfeuer verleiht Krähe die Ehrenfeder vor allen Falken. */
const he4 = dialog('he-kraehe-4', [
  knoten('start', [
    erz('Abend am Lagerplatz der Staubstraße. Das Feuer ist größer als sonst, die Falken haben ihre Motorräder im Kreis aufgestellt, Scheinwerfer an. Es riecht nach Diesel, Gegrilltem und schlechten Entscheidungen.'),
    K('Ruhe, ihr Ratten! Heute wird keiner verprügelt. Heute wird geehrt.', 'signatur'),
    K('Das Stadtkind hier hat mich geschlagen. Auf meiner eigenen Straße. Nach meinen Regeln. Das ist seit sieben Jahren keinem gelungen. Darum kriegt es heute eine Feder vom Mantel. Von meinem. Nicht von einer Taube.'),
    erz('Sie reißt eine lange schwarze Feder aus ihrem Mantel. Es tut ihr sichtlich weh. Die Falken werden still.'),
  ], {
    choices: [
      { text: 'Die Feder annehmen und eine Rede halten.', tag: '[Ausstrahlung 5]', check: pruefung('he-kraehe-4-rede', 'ausstrahlung', 5, ['buehne']), next: 'rede' },
      { text: 'Die Feder ans eigene Halsband knoten, vor allen, ohne ein Wort.', tag: '[Körper 4]', check: pruefung('he-kraehe-4-stark', 'koerper', 4, ['einschuechtern']), next: 'still' },
      { text: '„Ich will die Feder nicht. Gib mir dafür Wasser für die Aussiedler.“', next: 'wasser' },
    ],
  }),
  knoten('rede', [
    ich('Ich bin hier, weil ich weg musste. Ihr seid hier, weil ihr weg musstet. Vielleicht sind wir alle nur Leute, die die Stadt nicht wollte. Dann machen wir eben was Eigenes draus.'),
    erz('Ein Moment Stille. Dann trommeln die Falken auf ihre Tanks, bis das Feuer zittert. Krähe wischt sich etwas aus dem Auge und behauptet, es sei Sand.'),
  ], { next: 'ende', effects: [herz(ID, 60), { rep: 'staubfalken', delta: 10 }] }),
  knoten('still', [
    erz('Du knotest die Feder fest, ziehst den Knoten mit den Zähnen nach und siehst dabei jedem Falken in die Augen. Keiner hält dem Blick lange stand.'),
    K('Ha! Keine Worte. Nur Haltung. Ihr habt’s gesehen. So sieht Ehre aus, ihr Pfannkuchenfresser.', 'freude'),
  ], { next: 'ende', effects: [herz(ID, 55), { rep: 'staubfalken', delta: 8 }] }),
  knoten('wasser', [
    K('Du verschmähst meine Feder? Vor allen?', 'wut'),
    erz('Die Falken greifen zu den Schleudern. Krähe hebt die Hand. Lange. Dann lacht sie, kurz und heiser.'),
    K('Du verschmähst sie für die Aussiedler. Das ist das Dümmste und Ehrenhafteste, was ich seit Jahren gehört hab. Gut. Drei Kanister zum Hof. Und die Feder kriegst du trotzdem. Halt die Klappe und nimm sie.'),
  ], { next: 'ende', effects: [herz(ID, 50), { rep: 'aussiedler', delta: 10 }, { rep: 'staubfalken', delta: 3 }, flag('kraehe_wasser_fuer_hof')] }),
  knoten('ende', [
    K('Mit der Feder kommst du überall durch, wo meine Falken stehen. Bis ans Meer, wenn’s sein muss. Und wenn dich einer anpöbelt, zeig sie ihm. Wenn er dann immer noch pöbelt, ruf mich. Ich bring Schaufeln mit.'),
  ], { effects: [flag('kraehe_ehrenfeder'), { xp: 70 }] }),
]);

const kraehe = weltfigur({
  id: ID,
  name: 'Krähe',
  unknownName: 'Frau im Federmantel',
  faction: 'staubfalken',
  bio: 'Anführerin der Staubfalken in der Wrackburg. Mantel aus Lederflicken und Krähenfedern, Kettenspeer, graue Stoppeln. Nimmt Zoll, keine Leben, und sammelt Geschichten: dreihundertzwölf, alle im Kopf.',
  gifts: geschenke({
    loves: ['haiku-buechlein', 'reporter-notizbuch', 'vhs-kassette'],
    likes: ['bandshirt', 'wuestenrose', 'sandflasche', 'klingenpolitur', 'hofhonig-pfannkuchen'],
    dislikes: ['parfuem-ozon', 'chrome-10-gutschein'],
    hates: ['handschellen', 'peilsender'],
  }),
  schedule: [
    ort('A', 'das-meer', 'grundstueck-pflock', { days: ['sa'], when: { all: [{ flag: 'epilog' }, { flag: 'kraehe_teilhaberin' }] } }),
    ort('T', 'staubstrasse', 'wrackburg-hof'),
    ort('A', 'staubstrasse', 'wrackburg-tor'),
    ort('N', 'staubstrasse', 'wrackburg-hof'),
    weg('M'),
  ],
  heartEvents: [
    { id: 'he-kraehe-2', hearts: 2, map: 'staubstrasse', time: 'tag', dialogue: 'he-kraehe-2' },
    { id: 'he-kraehe-4', hearts: 4, map: 'staubstrasse', time: 'abend', when: { all: [{ seen: 'he-kraehe-2' }, EHRE] }, dialogue: 'he-kraehe-4' },
  ],
  talk: [
    rede('kraehe-tag-rivale', { rival: ID }),
    rede('kraehe-tag-erstes', nichtGetroffen(ID)),
    rede('kraehe-tag-epilog', { all: [{ flag: 'epilog' }, { flag: 'kraehe_teilhaberin' }] }),
    rede('kraehe-tag-ehre-laeuft', EHRE_LAEUFT),
    rede('kraehe-tag-nacht', { time: 'nacht' }),
    rede('kraehe-tag-frieden', FRIEDEN),
    rede('kraehe-tag-ehre', EHRE),
    rede('kraehe-tag-freund', { hearts: ID, min: 4 }),
    rede('kraehe-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: kraehe },
  dialogues: sammle(
    T.rivale, T.erstes, T.ehreLaeuft, T.ehre, T.frieden, T.nacht, T.freund, T.epilog, T.standard, he2, he4,
  ),
};
