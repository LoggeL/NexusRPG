// side-zweite-hand „Second-Hand-Seele“ (world.md §6.2 Nr. 16) · Auftraggeber Dante · Unterstadt · ein Tag 06–21 Uhr,
// nach main-1-dante. Vier reparierte Implantate ausliefern: Hafen-Hannes (Greifarm), Frau Klingel (Hörimplantat spielt
// Radio), Jakko (Spielzeug „Leuchtfinger“), Lio Funkel (Augenimplantat).
// Wege: gc-75 Frau Klingel kalibrieren (oder lassen) · Kampf enc-hafen-rostzaehne · Kanal-Abkürzung (nach
// side-rattenkoenig) · Lio: selbst 60 Cr zahlen oder Dante sagt sowieso „gratis“.
import type { ContentPart } from '../../part';
import type { DialogueDef, ItemDef, PhoneMessageDef, QuestDef } from '../../../modules/contracts';
import { L, N, P, UHR, active, all, any, bye, done, flag, inactive, item, msg, node, noFlag, not, rel, set, time } from './_lib';

const Q = 'side-zweite-hand';
const D = 'dante';

const LIEFERZEIT = { clockBetween: [UHR(6), UHR(21)] as const };
const ALLE = all(flag('zh_hannes'), flag('zh_klingel'), flag('zh_jakko'), flag('zh_lio'));

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: 'Second-Hand-Seele',
  summary: 'Dante hat vier Implantate repariert und keine Zeit, sie auszuliefern. Die Kundschaft wartet zwischen 06 und 21 Uhr. Danach schläft die Unterstadt. Oder prügelt sich.',
  giver: D,
  act: 1,
  steps: [
    {
      id: 'hannes', text: 'Greifarm zu Hafen-Hannes an die Hafenkante (Kai-Mitte, morgens bis abends).',
      done: flag('zh_hannes'), marker: { map: 'hafenkante', at: [760, 450] },
    },
    {
      id: 'klingel', text: 'Hörimplantat zu Frau Klingel auf den Schrottmarkt (tags und abends am Stand).',
      done: flag('zh_klingel'), marker: { map: 'schrottmarkt', at: [1222, 746] },
    },
    {
      id: 'jakko', text: 'Den „Leuchtfinger“ zu Jakko an Babettes Garküche (bis 20 Uhr).',
      done: flag('zh_jakko'), marker: { map: 'schrottmarkt', at: [266, 526] },
    },
    {
      id: 'lio', text: 'Augenimplantat zu Lio Funkel (tags in der Musikerecke am Bahnhof, abends am Schrottmarkt).',
      done: flag('zh_lio'), marker: { map: 'bahnhof-mitte', at: [168, 612] },
    },
    {
      id: 'zurueck', text: 'Zurück zu Dante in die Werkstatt.',
      done: flag('zh_abgeschlossen'), when: ALLE, marker: { map: 'dantes-werkstatt', at: [600, 290] },
    },
  ],
  reward: {
    xp: 220,
    items: { 'arme-zerberster-attrappe': 1 },
    relations: { [D]: 80 },
    rep: { unterstadt: 15 },
  },
};

// ---------------------------------------------------------------------------------------- Dante
const auftrag: DialogueDef = {
  id: 'zh-dante-auftrag',
  start: 'start',
  nodes: [
    node('start', [
      N('Auf der Werkbank liegen vier Päckchen in Zeitungspapier, mit Paketschnur verknotet. Auf jedem klebt ein Zettel in Dantes Krakelschrift.'),
      L(D, 'Da bist du ja! Perfekt! Ich hab ein Problem. Ein logistisches Problem. Ich habe vier Implantate repariert und null Beine, die sie ausliefern.'),
      L(D, 'Also, ich hab Beine. Aber die sind beschäftigt. Mit Stehen. An der Werkbank. Weil hier noch neun weitere kaputte Sachen liegen.'),
    ], {
      choices: [
        { text: '„Gib her. Wer kriegt was?“', next: 'liste' },
        { text: '„Was zahlt die Lieferung?“', next: 'geld' },
        bye('„Ich bin kein Paketdienst.“'),
      ],
    }),
    node('geld', [
      L(D, 'Zahlen? Die Leute zahlen MIR. Manchmal. Wenn sie können. Meistens mit Kuchen.'),
      L(D, 'Aber ich hab da was für dich. Eine Überraschung. Eine Zerberster-Attrappe. Sieht aus wie Arias Arm, ist aber ein Toaster. Ehrlich, das ist das Beste, was ich je gebaut hab, und ich hab ein Faxgerät wiederbelebt.'),
    ], { next: 'liste' }),
    node('liste', [
      L(D, 'Erstens: Hafen-Hannes, Greifarm. Kai-Mitte an der Hafenkante. Vorsicht, da lungern Rostzähne rum, die riechen Ersatzteile auf zwei Kilometer.'),
      L(D, 'Zweitens: Frau Klingel, Hörimplantat. Schrottmarkt. Das Ding spielt aus Versehen Radio. Ich krieg’s nicht raus. Sie wird es dir erklären. Laut.'),
      L(D, 'Drittens: Jakko. Ein Leuchtfinger. Spielzeug. Er hat drei Wochen gespart. In Kronkorken.'),
      L(D, 'Viertens: Lio Funkel. Augenimplantat, damit er seine Noten wieder lesen kann. Er kann nicht zahlen. Er tut so, als könnte er. Lass ihn.'),
      L(D, 'Alles bis heute Abend um neun. Danach schläft die Unterstadt, und wer dann noch mit Implantaten rumläuft, wird zu einem Implantat verarbeitet.'),
    ], {
      effects: [
        { give: 'greifarm-hannes' }, { give: 'hoerimplantat-klingel' }, { give: 'leuchtfinger' }, { give: 'augenimplantat-lio' },
        { startQuest: Q }, msg('Vier Päckchen. Vier Kunden. Bis 21 Uhr.'),
      ],
      choices: [{ text: '„Bin schon weg.“' }],
    }),
  ],
};

// ---------------------------------------------------------------------------------------- Hafen-Hannes
const hannes: DialogueDef = {
  id: 'zh-hannes',
  start: 'start',
  nodes: [
    node('start', [
      L('hafen-hannes', 'Ist das mein Arm? Ist das MEIN ARM? Komm her, Kurier, ich hab seit drei Wochen nur mit links gearbeitet, ich hab Muskeln, wo keine sein sollten!'),
    ], {
      choices: [
        { text: 'Das Päckchen übergeben.', when: all(item('greifarm-hannes'), not({ won: 'enc-hafen-rostzaehne' })), next: 'rostzaehne' },
        { text: '„Die Rostzähne sind erledigt. Jetzt kriegst du deinen Arm.“', when: all(item('greifarm-hannes'), { won: 'enc-hafen-rostzaehne' }), effects: [{ take: 'greifarm-hannes' }], next: 'uebergabe' },
        bye('„Moment noch.“'),
      ],
    }),
    node('rostzaehne', [
      N('Hinter einem Container lösen sich zwei Gestalten. Rote Bandanas, Zahnspangen aus Draht, eine Kette, die jemand sehr liebevoll poliert hat.'),
      N('„Hübsches Päckchen, Kurier. Riecht nach Greifarm. Riecht nach zweihundert Credits beim Ripper.“'),
      L('hafen-hannes', 'Scheiße. Die warten hier seit Tagen auf genau das.'),
    ], {
      choices: [
        { text: '„Riecht nach Ärger, ihr Zahnfeen. Kommt her.“', next: 'kampf' },
        {
          text: '„Hannes, komm mit. Ich kenn ’nen Weg durchs Kanalgitter, wo die nicht hinkommen.“', tag: '[Freund der Rohre]',
          when: done('side-rattenkoenig'), effects: [{ take: 'greifarm-hannes' }], next: 'kanal',
        },
        {
          text: 'Den Rostzähnen fünfzig Credits Wegzoll hinwerfen.', requires: { credits: 50 },
          effects: [{ credits: -50 }, { take: 'greifarm-hannes' }], next: 'zoll',
        },
        bye('Rückzug. Später wiederkommen.'),
      ],
    }),
    node('kampf', [N('Die Kette schwingt. Hannes duckt sich hinter einen Poller und brüllt Anfeuerungen, die man nicht in Kinderbücher schreibt.')], {
      effects: [{ battle: 'enc-hafen-rostzaehne' }],
    }),
    node('kanal', [
      N('Ihr verschwindet durch das Gitter am Kai. Unten im Kanal riecht es wie immer, aber niemand mit Kette wartet. Zwanzig Meter weiter klettert ihr aus einem Gully hinter Hannes’ Spind.'),
      N('Oben hört man die Rostzähne fluchen. Sie suchen noch.'),
    ], { effects: [{ advanceTime: 20 }], next: 'uebergabe' }),
    node('zoll', [
      N('Die Rostzähne fangen das Geld, zählen es zweimal und ziehen ab. „Guter Kurier. Kluger Kurier. Lebender Kurier.“'),
    ], { next: 'uebergabe' }),
    node('uebergabe', [
      N('Hannes reißt das Zeitungspapier auf und schraubt sich den Greifarm direkt am Kai an. Er klackt, fährt aus, greift einen Poller und hebt ihn zwei Zentimeter an. Hannes heult fast.'),
      L('hafen-hannes', 'Ich kann wieder Kisten werfen! Ich kann wieder Leuten den Mittelfinger zeigen, mit BEIDEN Händen! Sag Dante, er ist ein verdammter Heiliger!'),
    ], { effects: [set('zh_hannes'), rel('hafen-hannes', 60), { rep: 'unterstadt', delta: 2 }] }),
  ],
};

// ---------------------------------------------------------------------------------------- Frau Klingel
const klingel: DialogueDef = {
  id: 'zh-klingel',
  start: 'start',
  nodes: [
    node('start', [
      N('Frau Klingel sitzt hinter ihrem Stand mit Messingglocken, einen Hörtrichter aus Blech im Ohr. Sie ist mindestens neunzig und hat die Ausstrahlung eines Feldwebels.'),
      L('frau-klingel', 'WAS? Lauter! Ich bin schwerhörig, nicht blöd!'),
      P('Ihr Hörimplantat! Von Dante!'),
      L('frau-klingel', 'NA ENDLICH!'),
      N('Sie steckt das Implantat ein. Es knackt. Dann, deutlich hörbar für den halben Markt: „… und jetzt das Wetter: Rostregen ab Mittag, gefolgt von noch mehr Rostregen …“'),
      L('frau-klingel', 'Da! Da ist es wieder! Radio! Den ganzen Tag! Gestern lief zwei Stunden Schlager!'),
    ], {
      choices: [
        { text: 'Das Implantat mit Dantes Werkzeug neu kalibrieren.', check: 'gc-75', next: 'kalibriert' },
        { text: '„Wollen Sie das Radio wirklich weghaben?“', next: 'lassen' },
      ],
    }),
    node('kalibriert', [
      N('Du klappst die winzige Abdeckung auf, drehst an einem Potentiometer, so klein wie ein Reiskorn. Das Radio verstummt mitten in „Paragraph der Liebe“.'),
      L('frau-klingel', '… Ich hör die Glocken. Ich hör meine eigenen Glocken. Ich hör die Tauben. Ich hör, wie der Babette-Kerl da hinten über mich lästert. GEHÖRT, JUNGE!'),
      L('frau-klingel', 'Sie kriegen ein Glöckchen. Für die Tasche. Damit ich Sie höre, wenn Sie kommen.'),
    ], { effects: [{ take: 'hoerimplantat-klingel' }, set('zh_klingel'), set('klingel_kalibriert'), rel('frau-klingel', 60)] }),
    node('lassen', [
      L('frau-klingel', 'Weg? WEG?'),
      N('Sie hält inne. Aus ihrem Ohr dudelt ein alter Song, irgendwas mit Akkordeon. Ihr Fuß wippt.'),
      L('frau-klingel', 'Na ja. Seit mein Kurt tot ist, redet ja keiner mehr mit mir. Das Radio redet. Den ganzen Tag. Über Wetter, über Mord, über Schlager. Wie Kurt. Nur netter.'),
      L('frau-klingel', 'Lassen Sie’s drin. Und sagen Sie Dante, er soll bei Gelegenheit einen Lautstärkeregler einbauen. Für die Werbung.'),
    ], { effects: [{ take: 'hoerimplantat-klingel' }, set('zh_klingel'), set('klingel_radio'), rel('frau-klingel', 80)] }),
  ],
};

// ---------------------------------------------------------------------------------------- Jakko
const jakko: DialogueDef = {
  id: 'zh-jakko',
  start: 'start',
  nodes: [
    node('start', [
      L('jakko', 'Ist das … ist das der LEUCHTFINGER? Von Dante? Für mich?'),
      N('Jakko reißt das Papier auf. Ein kleiner Handschuh mit einem Finger aus Glasfaser, der in allen Farben leuchtet, wenn man damit zeigt. Jakko zeigt auf alles. Auf Babette. Auf einen Hund. Auf den Himmel.'),
      L('jakko', 'Das ist so gut wie eine Dampfnudel! Nein! Das ist so gut wie ZWEI Dampfnudeln! Mit Soße!'),
      L('jakko', 'Ich hab gespart. Hier. Siebenundvierzig Kronkorken. Das sind fast fünf Credits, wenn man sie beim Gully umtauscht.'),
    ], {
      choices: [
        { text: '„Behalt deine Kronkorken. Der geht aufs Haus.“', next: 'gratis' },
        { text: 'Die Kronkorken annehmen. Ein Deal ist ein Deal.', next: 'deal' },
      ],
    }),
    node('gratis', [
      L('jakko', 'Echt? ECHT? Dann koch ich dir was! Irgendwann! Wenn ich Koch bin! Das ist ein Versprechen. Ich zeig drauf, siehst du? Jetzt leuchtet es. Jetzt gilt es.'),
    ], { effects: [{ take: 'leuchtfinger' }, set('zh_jakko'), rel('jakko', 60)] }),
    node('deal', [
      N('Jakko zählt sie dir einzeln in die Hand. Bei jedem Kronkorken nickt er ernst. Babette hinter der Theke schüttelt den Kopf über dich, aber sie lächelt dabei.'),
      L('jakko', 'Geschäft ist Geschäft. Sagt Daria auch immer.'),
    ], { effects: [{ take: 'leuchtfinger' }, set('zh_jakko'), rel('jakko', 40)] }),
  ],
};

// ---------------------------------------------------------------------------------------- Lio
const lio: DialogueDef = {
  id: 'zh-lio',
  start: 'start',
  nodes: [
    node('start', [
      N('Lio Funkel lehnt mit seinem Synth-Akkordeon an der Wand und blinzelt auf ein Notenblatt, das er sich so dicht vors Gesicht hält, dass er es fast küsst.'),
      L('lio-funkel', 'Ist das mein Auge? Von Dante? Oh, oh, oh. Ich hab seit Wochen alles nur noch nach Gehör gespielt. Wie ein Pianist im Nebel, der den Faden verlor und dabei …'),
      L('lio-funkel', '… ich hab schon wieder gereimt. Das passiert, wenn ich nervös bin.'),
      N('Er setzt das Implantat ein. Er blinzelt. Dann sieht er dich an, wirklich an, und lächelt so breit, dass sein Akkordeon quietscht.'),
      L('lio-funkel', 'Ich kann die Noten lesen. Ich kann DICH lesen. Du siehst müde aus. Und gut. Müde und gut.'),
      L('lio-funkel', 'Was kriegt Dante? Ich hab … ich hab da ein paar Credits. Irgendwo. In einer Socke.'),
    ], {
      choices: [
        { text: 'Selbst sechzig Credits an Dante geben. „Ist bezahlt.“', requires: { credits: 60 }, effects: [{ credits: -60 }], next: 'bezahlt' },
        { text: '„Dante sagt: gratis. Er sagt das sowieso immer.“', next: 'gratis' },
      ],
    }),
    node('bezahlt', [
      L('lio-funkel', 'Du … zahlst für mich? Niemand zahlt für mich. Niemand außer der Regen, und der zahlt in nassen Schuhen.'),
      L('lio-funkel', 'Ich schreib dir ein Lied. Nein, ich schreib dir eine Strophe. Nein, ich schreib dir den ganzen Refrain. Mit Schlagzeug.'),
    ], { effects: [{ take: 'augenimplantat-lio' }, set('zh_lio'), set('zh_lio_bezahlt'), rel('lio-funkel', 40)] }),
    node('gratis', [
      L('lio-funkel', 'Typisch Dante. Der Mann würde auch für einen Toaster ein Herz einbauen.'),
      L('lio-funkel', 'Sag ihm, Lied Nummer drei auf meinem nächsten Album gehört ihm. Es heißt „Der Schrauber mit den Kekshänden“. Es wird schrecklich. Er wird es lieben.'),
    ], { effects: [{ take: 'augenimplantat-lio' }, set('zh_lio')] }),
  ],
};

// ---------------------------------------------------------------------------------------- Abschluss
const abschluss: DialogueDef = {
  id: 'zh-dante-abschluss',
  start: 'start',
  nodes: [
    node('start', [
      L(D, 'Alle vier? ALLE VIER? Vor neun? Heiliges Kanonenrohr. Ich hab mit drei gerechnet und einem Nachruf.', 'freude'),
      N('Dante wischt sich die Hände an der Schürze ab und holt unter der Werkbank ein Gerät hervor, das aussieht wie Arias Zerberster-Arm. Silberne Spiralfedern, genietete Schale. Er drückt einen Knopf. Aus dem Unterarm springen zwei Scheiben Toast.'),
      L(D, 'Die Zerberster-Attrappe. Sieht aus wie ein Zerberster, ist aber ein Toaster. Mit Krümelschublade. Zeig sie nicht Aria. Oder zeig sie Aria. Ich will ihr Gesicht sehen. Von weit weg.'),
    ], {
      choices: [
        { text: '„Frau Klingel hört ihre Glocken wieder.“', when: flag('klingel_kalibriert'), next: 'klingel-a' },
        { text: '„Frau Klingel will das Radio behalten. Sie sagt, es redet wie ihr Mann.“', when: flag('klingel_radio'), next: 'klingel-b' },
        { text: '„Danke, Dante.“', next: 'ende' },
      ],
    }),
    node('klingel-a', [L(D, 'Du hast das Radio rausgekriegt? Ich hab drei Tage daran gesessen! Du bist eine Bedrohung für meinen Berufsstolz.')], { next: 'ende' }),
    node('klingel-b', [
      L(D, 'Oh.', 'trauer'),
      L(D, 'Dann war es gar kein Fehler. Dann war es ein Feature. Das sind die besten Reparaturen. Die, bei denen man gar nichts repariert.', 'zaertlich'),
    ], { next: 'ende' }),
    node('ende', [L(D, 'Die Unterstadt läuft auf zweiter Hand, weißt du? Zweite Hand, zweite Chance, zweiter Toast. Geh. Du hast es dir verdient.')], {
      effects: [set('zh_abgeschlossen'), { completeQuest: Q }],
    }),
  ],
};

// ---------------------------------------------------------------------------------------- Gegenstände, Telefon
const Qi = (id: string, name: string, description: string): ItemDef =>
  ({ id, name, category: 'quest', icon: id, price: 0, sellable: false, description });
const items: Record<string, ItemDef> = {
  'greifarm-hannes': Qi('greifarm-hannes', 'Päckchen: Greifarm', 'In Zeitungspapier, mit Paketschnur. Zettel: „HANNES – NICHT FALLEN LASSEN, ER BEISST.“'),
  'hoerimplantat-klingel': Qi('hoerimplantat-klingel', 'Päckchen: Hörimplantat', 'Klein, rund, spielt leise Radio. Zettel: „FR. KLINGEL – LAUT REDEN!!“'),
  leuchtfinger: Qi('leuchtfinger', 'Päckchen: Leuchtfinger', 'Ein Kinderhandschuh mit einem Finger aus Glasfaser. Zettel: „JAKKO – NICHT IN DIE AUGEN ZEIGEN.“'),
  'augenimplantat-lio': Qi('augenimplantat-lio', 'Päckchen: Augenimplantat', 'Eine Linse in Watte. Zettel: „LIO – GRATIS. ER SOLL NICHT DISKUTIEREN.“'),
};

const spaet: PhoneMessageDef = {
  id: 'zh-dante-spaet',
  from: D,
  text: 'Es ist neun! NEUN! Die Unterstadt schläft. Morgen ab sechs geht’s weiter, und bitte lass dich bis dahin nicht zu einem Implantat verarbeiten. – D. (und C. K.)',
  auto: all(active(Q), not(ALLE), { clockBetween: [UHR(21), UHR(21, 30)] }),
};

const IN_ZEIT = all(active(Q), LIEFERZEIT);

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: {
    [auftrag.id]: auftrag, [hannes.id]: hannes, [klingel.id]: klingel, [jakko.id]: jakko, [lio.id]: lio, [abschluss.id]: abschluss,
  },
  items,
  phone: { [spaet.id]: spaet },
  mapAdditions: {
    'dantes-werkstatt': {
      hotspots: [
        {
          id: 'zh-dante-auftrag', at: 'werkbank', label: 'Dante: Vier Päckchen', kind: 'talk', dialogue: auftrag.id,
          when: all(inactive(Q), done('main-1-dante'), { clockBetween: [UHR(6), UHR(17)] }),
        },
        { id: 'zh-dante-abschluss', at: 'werkbank', label: 'Dante: Alle ausgeliefert', kind: 'talk', dialogue: abschluss.id, when: all(active(Q), ALLE, time('morgen', 'tag', 'abend')) },
      ],
    },
    hafenkante: {
      hotspots: [
        { id: 'zh-hannes', at: 'kai-mitte', label: 'Hafen-Hannes: Greifarm abgeben', kind: 'talk', dialogue: hannes.id, when: all(IN_ZEIT, noFlag('zh_hannes'), item('greifarm-hannes'), time('morgen', 'tag', 'abend')) },
      ],
    },
    schrottmarkt: {
      hotspots: [
        { id: 'zh-klingel', at: 'klingel-stand', label: 'Frau Klingel: Hörimplantat', kind: 'talk', dialogue: klingel.id, when: all(IN_ZEIT, noFlag('zh_klingel'), item('hoerimplantat-klingel'), time('tag', 'abend')) },
        {
          id: 'zh-jakko', at: 'garkueche-hocker', label: 'Jakko: Leuchtfinger', kind: 'talk', dialogue: jakko.id,
          when: all(IN_ZEIT, noFlag('zh_jakko'), item('leuchtfinger'), { clockBetween: [UHR(6), UHR(20)] }, any(time('morgen', 'abend'), { not: { weekday: ['mo', 'mi', 'fr'] } })),
        },
        {
          id: 'zh-jakko-kran', at: 'kran', label: 'Jakko: Leuchtfinger', kind: 'talk', dialogue: jakko.id,
          when: all(IN_ZEIT, noFlag('zh_jakko'), item('leuchtfinger'), time('tag'), { weekday: ['mo', 'mi', 'fr'] }),
        },
        { id: 'zh-lio-abend', at: 'lio-ecke', label: 'Lio Funkel: Augenimplantat', kind: 'talk', dialogue: lio.id, when: all(IN_ZEIT, noFlag('zh_lio'), item('augenimplantat-lio'), time('abend')) },
      ],
    },
    'bahnhof-mitte': {
      hotspots: [
        { id: 'zh-lio', at: 'musikerecke', label: 'Lio Funkel: Augenimplantat', kind: 'talk', dialogue: lio.id, when: all(IN_ZEIT, noFlag('zh_lio'), item('augenimplantat-lio'), time('tag')) },
      ],
    },
  },
};

