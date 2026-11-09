// Jakko in Akt 2, Akt 3 und im Nachspiel (world.md §4.4, §5.3–5.5, §10.4–10.7; act23.json events/flags).
// Volle Herz-Ereignisse he-jakko-8 (er kocht für den ganzen Markt, gegen die Gratis-Nährriegel von Quantum) und
// he-jakko-10 (Kochbuch-Seite, Andenken jakkos-rezept), Tagesgespräche nach Phase, Nyras aufgehobene Dampfnudel.
// Wird von jakko.ts in NpcDef.talk/heartEvents/schedule eingehängt. Nur Freundschaft (Kind).
import type { HeartEventDef, ScheduleEntry, TalkDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import {
  A2_CHAOS, A2_FREI, A2_OFFEN, A2_PARTY, ARIA_GECHIPPT, ENDE_3B, ENDE_MEER, ENDE_NEXUS, HERZ_SPAET, KINDER_MEER, L,
  MASTER, N, NACHSPIEL, NYRA_BEFREIT, OEDNIS, PARTYNACHT, chk, dialogs, dlg, einmal, herz, node,
} from './_dsl';

const J = 'jakko';
const KOCHBUCH_FERTIG = { quest: 'pers-jakko-kochbuch', state: 'done' } as const;
const NYRA_NUDEL = { flag: 'jakko_nyra_dampfnudel' } as const;

export const JAKKO_HE_23: HeartEventDef[] = [
  {
    id: 'he-jakko-8', hearts: 8, map: 'schrottmarkt', time: 'tag', when: { all: [HERZ_SPAET, { not: { weekday: 'mo' } }] },
    dialogue: 'dlg-he-jakko-8', effects: [{ xp: 60 }],
  },
  {
    id: 'he-jakko-10', hearts: 10, map: 'das-nest', time: 'morgen', when: HERZ_SPAET,
    dialogue: 'dlg-he-jakko-10', effects: [{ xp: 80 }, { give: 'jakkos-rezept' }],
  },
];

export const JAKKO_TALK_FRUEH: TalkDef[] = [
  { dialogue: 'jakko-master', when: MASTER },
  { dialogue: 'jakko-3b', when: einmal('jakko-3b', ENDE_3B) },
  { dialogue: 'jakko-nachspiel', when: einmal('jakko-nachspiel', NACHSPIEL) },
  { dialogue: 'jakko-nyra-nudel', when: einmal('jakko-nyra-nudel', { all: [NYRA_NUDEL, NYRA_BEFREIT] }) },
  { dialogue: 'jakko-meer', when: { all: [KINDER_MEER, { weekday: 'sa' }, { time: 'tag' }] } },
  { dialogue: 'jakko-partynacht', when: PARTYNACHT },
  { dialogue: 'jakko-a2-bruch', when: einmal('jakko-a2-bruch', A2_CHAOS) },
  { dialogue: 'jakko-a2-aria', when: einmal('jakko-a2-aria', { all: [A2_FREI, ARIA_GECHIPPT] }) },
  { dialogue: 'jakko-a2-party', when: einmal('jakko-a2-party', A2_PARTY) },
];

export const JAKKO_TALK_POOL: TalkDef[] = [
  { dialogue: 'jakko-a2-tag', when: A2_OFFEN },
  { dialogue: 'jakko-a2-nervoes', when: A2_PARTY },
  { dialogue: 'jakko-nachspiel-tag', when: NACHSPIEL },
];

export const JAKKO_SCHEDULE_23: ScheduleEntry[] = [
  { when: PARTYNACHT, place: { map: 'das-nest', at: 'essensplatz' } },
  { slot: ['abend', 'nacht'], when: MASTER, place: { map: 'das-nest', at: 'essensplatz' } },
  { slot: 'tag', days: ['sa'], when: KINDER_MEER, place: { map: 'das-meer', at: 'lagerfeuer' } },
];

const dialogues = dialogs(
  // ------------------------------------------------------------------------------------------- Herz-Ereignis 8
  dlg('dlg-he-jakko-8', [
    node('start', [N('Über dem Schrottmarkt hängt ein Geruch, der nicht nach Öl riecht. Sondern nach Zwiebeln. Sehr vielen Zwiebeln.')], {
      choices: [
        { text: '(Dem Geruch nach.)', when: { notFlag: 'epilog' }, next: 'a' },
        { text: '(Dem Geruch nach.)', when: { flag: 'epilog' }, next: 'a-nachspiel', id: 'geruch-nachspiel' },
      ],
    }),
    node('a-nachspiel', [
      N('Seit die Chips aus sind, haben viele Leute vergessen, wie man kocht. Oder was sie mögen. Am Markt stapeln sich Kisten mit übrig gebliebenen Quantum-Nährriegeln, und die Leute kauen sie, weil sie nicht wissen, was sie sonst essen sollen.'),
      N('Mitten auf dem Markt steht ein langer Tisch aus zwei Türen und vier Ölfässern. Darauf Töpfe, Pfannen, Schüsseln. Davor ein Schild in Buntstift: „ECHTES ESSEN. FÜR ALLE. DAMIT IHR WIEDER WISST, WIE’S SCHMECKT.“'),
      L(J, 'Die Leute essen immer noch die Riegel! Freiwillig! Die schmecken nach Pappe mit Erdbeerduft! Das ist schlimmer als gechippt!', 'wut'),
      L(J, 'Heute koch ich für den ganzen Markt. Jeder kriegt was. Wer Geld hat, zahlt. Wer keins hat, erzählt eine Geschichte. Wer vergessen hat, was er mag, kriegt von allem was.', 'freude'),
      L('babette-bao', 'Er steht seit fünf Uhr in meiner Küche. Ich hab nur den großen Topf getragen. Und geweint. Ein bisschen. Zwiebeln.'),
      L(J, 'Nur … der große Herd will nicht. Und die Zwiebeln reichen nicht.', 'besorgt'),
    ], {
      choices: [
        {
          text: '(Unter den Herd kriechen.) „Gasdüse verkokt. Gib mal die Haarnadel.“',
          check: chk('he-jakko-8-herd', 'technik', 4, ['reparieren', 'kueche']),
          next: 'herd',
        },
        {
          text: '(Durch die Stände gehen.) „Gustav, deine Zwiebeln. Dexter, deine Gewürze. Und keiner sagt Nein zu einem Kind mit Kochlöffel.“',
          check: chk('he-jakko-8-zutaten', 'strasse', 5, ['verhandeln', 'markt']),
          next: 'zutaten',
        },
        { text: '(Eine Schürze nehmen und mit Jakko kochen.)', next: 'kochen' },
      ],
    }),
    node('a', [
      N('Über dem Schrottmarkt schwebt eine Quantum-Drohne mit Lautsprecher. Aus ihrem Bauch fallen kleine lila Päckchen: „NÄHRRIEGEL CHROME · Alles, was Sie brauchen. Gratis. Lächeln Sie, Master freut sich.“'),
      N('Die Leute sammeln sie ein. Manche essen sie gleich. Sie lächeln dabei. Alle gleich.'),
      N('Und mitten auf dem Markt steht ein langer Tisch aus zwei Türen und vier Ölfässern. Darauf Töpfe, Pfannen, Schüsseln, alles, was Jakko leihen, betteln oder Babette abschwatzen konnte. Davor ein Schild in Buntstift: „ECHTES ESSEN. FÜR ALLE. AUCH FÜR DICH.“'),
      L(J, 'Die Riegel schmecken nach Pappe mit Erdbeerduft! Ich hab einen probiert! Ich hab geweint, und nicht vor Freude!', 'wut'),
      L(J, 'Heute koch ich für den ganzen Markt. Jeder kriegt was. Wer Geld hat, zahlt. Wer keins hat, erzählt eine Geschichte. Wer gechippt ist, kriegt doppelt, weil der’s am nötigsten hat!', 'freude'),
      L('babette-bao', 'Er steht seit fünf Uhr in meiner Küche. Ich hab nur den großen Topf getragen. Und geweint. Ein bisschen. Zwiebeln.'),
      L(J, 'Nur … der große Herd will nicht. Und die Zwiebeln reichen nicht. Und die Drohne macht so laut, dass keiner mich hört.', 'besorgt'),
    ], {
      choices: [
        {
          text: '(Unter den Herd kriechen.) „Gasdüse verkokt. Gib mal die Haarnadel.“',
          check: chk('he-jakko-8-herd', 'technik', 4, ['reparieren', 'kueche']),
          next: 'herd',
        },
        {
          text: '(Durch die Stände gehen.) „Gustav, deine Zwiebeln. Dexter, deine Gewürze. Und keiner sagt Nein zu einem Kind mit Kochlöffel.“',
          check: chk('he-jakko-8-zutaten', 'strasse', 5, ['verhandeln', 'markt']),
          next: 'zutaten',
        },
        {
          text: '(Einen Topfdeckel nach der Drohne werfen.)',
          check: chk('he-jakko-8-drohne', 'reflexe', 5, ['werfen', 'zielen']),
          next: 'drohne',
        },
        { text: '(Eine Schürze nehmen und mit Jakko kochen.)', next: 'kochen' },
      ],
    }),
    node('herd', [
      N('Fünf Minuten auf dem Rücken im Staub, eine Haarnadel von Babette, ein Fluch, den Freya zum Glück nicht hört. Dann faucht es, und eine blaue Flamme springt hoch.'),
      L(J, 'ER BRENNT! Der Herd brennt! Also richtig, so wie er soll!', 'freude'),
    ], { effects: [herz(J, 30)], next: 'ausgabe' }),
    node('zutaten', [
      N('Gustav gibt einen Sack Zwiebeln und erzählt dabei, dass Zwiebeln früher grün waren. Dexter gibt Gewürze und schreibt eine Rechnung, die er nie einlösen wird. Mira Lötzinn bringt eine Kiste Kartoffeln „aus Versehen“.'),
      L(J, 'Das reicht für … für alle! Für ALLE! Ich muss jetzt sehr schnell schnippeln!', 'freude'),
    ], { effects: [herz(J, 30), { rep: 'unterstadt', delta: 3 }], next: 'ausgabe' }),
    node('drohne', [
      N('Der Topfdeckel segelt durch die Luft wie eine Frisbee aus Edelstahl. Klong. Die Drohne trudelt, ihr Lautsprecher stottert „Lächeln Sie, M-M-Mas…“ und landet in Gustavs Schrotthaufen.'),
      N('Knurri schnüffelt daran und pinkelt drauf. Ölig.'),
      L(J, 'Jetzt hört mich jeder! ESSEN! ES GIBT ECHTES ESSEN!', 'freude'),
    ], { effects: [herz(J, 30), { give: 'quantum-chip-schrott' }], next: 'ausgabe' }),
    node('kochen', [
      N('Jakko drückt dir einen Kochlöffel in die Hand, der fast so groß ist wie er. „Rühren. Immer rühren. Wenn du aufhörst, brennt’s an, und wenn’s anbrennt, schmeckt’s nach Quantum.“'),
    ], {
      effects: [{
        minigame: 'akt-kochen', level: 3, key: 'jakko-marktessen', label: 'Kochen für den ganzen Markt',
        win: [herz(J, 30), { message: 'Jakko: „Das ist so gut wie eine Dampfnudel! Nein, besser! Nein, sag das nicht Babette!“' }],
        lose: [herz(J, 20), { message: 'Jakko: „Bisschen angebrannt. Das nennt man Röstaroma. Hat Babette gesagt. Glaub ich.“' }],
      }],
      next: 'ausgabe',
    }),
    node('ausgabe', [
      N('Dann geht es los. Die Schlange reicht bis zum Kran. Ripper stellt sich an und zahlt doppelt, ohne dass ihn jemand zwingt. Wett-Willi erzählt eine Geschichte, die sogar stimmt.'),
    ], {
      choices: [
        { text: '(Weiter austeilen.)', when: { notFlag: 'epilog' }, next: 'glitzer' },
        { text: '(Weiter austeilen.)', when: { flag: 'epilog' }, next: 'vergessen', id: 'austeilen-nachspiel' },
      ],
    }),
    node('vergessen', [
      N('Dann kommt ein Mann mit einer Narbe im Nacken, da, wo mal ein lila Punkt geblinkt hat. Er hält einen Nährriegel in der Hand und schaut auf die Töpfe, als wären sie eine Prüfung.'),
      N('Mann mit Narbe: „Ich weiß nicht, was ich mag. Master hat immer gesagt, was ich mag. Jetzt sagt keiner mehr was.“'),
      L(J, 'Dann probierst du. Von allem. Das ist die Regel. Die Regel hab ich gerade gemacht.', 'besorgt'),
    ], {
      choices: [
        { text: '(Dem Mann eine Schüssel unter die Nase halten.)', next: 'duft-nachspiel' },
        { text: '„Fang mit dem an, was nach Kindheit riecht.“', next: 'duft-nachspiel' },
      ],
    }),
    node('duft-nachspiel', [
      N('Der Mann riecht. Er probiert. Erst den Eintopf, dann die Suppe, dann Babettes Dampfnudel. Bei der Dampfnudel bleibt er stehen und kaut sehr lange.'),
      N('Mann mit Narbe: „Die. Die mag ich. Glaube ich. Nein. Ich weiß es.“ Er lacht, ganz kurz, als hätte er sich selbst erschreckt.'),
      L(J, 'Siehst du? SIEHST DU? Essen ist stärker als Chips! Auch als tote Chips! Das schreib ich ins Kochbuch! Auf die erste Seite!', 'freude'),
    ], { effects: [herz(J, 40), { setFlag: 'jakko_essen_staerker' }], next: 'ende' }),
    node('glitzer', [
      N('Dann kommt ein Mann mit Glitzer im Nacken. Er hält einen Nährriegel in der Hand und lächelt.'),
      N('Mann mit Glitzer: „Danke, nein. Ich esse nur, was Master empfiehlt. Master empfiehlt Nährriegel. Ausgezeichnete Entscheidung.“'),
      L(J, 'Aber … das ist Eintopf. Den hab ich gemacht. Für dich. Extra.', 'trauer'),
    ], {
      choices: [
        { text: '(Dem Mann die Schüssel einfach unter die Nase halten.)', next: 'duft' },
        {
          text: '„Master empfiehlt auch, dass man nicht unhöflich zu Köchen ist. Steht in den Nutzungsbedingungen. Seite zwölf.“',
          check: chk('he-jakko-8-bluff', 'ausstrahlung', 5, ['luegen', 'bluff']),
          next: 'bluff',
        },
        { text: '„Lass ihn, Jakko. Nicht jeder kann gerettet werden. Heute.“', next: 'lassen' },
      ],
    }),
    node('duft', [
      N('Der Dampf steigt dem Mann ins Gesicht. Zwiebeln, Kartoffeln, irgendwas mit Paprika. Er blinzelt. Einmal. Zweimal. Der lila Punkt im Nacken flackert.'),
      N('Mann mit Glitzer: „… Das riecht wie bei meiner Mutter. Früher. Als die Küche noch …“ Er nimmt die Schüssel. Er isst. Er lächelt nicht. Er weint ein bisschen. Das ist besser.'),
      L(J, 'Siehst du? SIEHST DU? Essen ist stärker als Chips! Das schreib ich ins Kochbuch! Auf die erste Seite!', 'freude'),
    ], { effects: [herz(J, 40), { setFlag: 'jakko_essen_staerker' }], next: 'ende' }),
    node('bluff', [
      N('Mann mit Glitzer: „Seite zwölf. Natürlich. Verzeihung. Master wünscht guten Appetit.“'),
      N('Er nimmt die Schüssel. Er isst. Nach dem dritten Löffel hört er auf zu lächeln und fängt an zu kauen wie ein Mensch.'),
      L(J, 'Du hast den Chip angelogen! Darf man das? Freya sagt bestimmt, das darf man nicht. Ich sag’s ihr nicht.', 'freude'),
    ], { effects: [herz(J, 30), { setFlag: 'jakko_essen_staerker' }], next: 'ende' }),
    node('lassen', [
      N('Der Mann geht weiter. Jakko sieht ihm nach. Dann füllt er eine Schüssel, stellt sie auf den Rand des Tischs und legt einen Löffel daneben.'),
      L(J, 'Für wenn er zurückkommt. Er kommt zurück. Jeder kommt zurück, wenn’s gut riecht.', 'trauer'),
    ], { effects: [herz(J, 30)], next: 'ende' }),
    node('ende', [
      N('Am Nachmittag ist der Topf leer. Die Schlange ist satt. Babette sitzt auf einem Ölfass und schnäuzt sich, und es sind keine Zwiebeln mehr da.'),
      L('babette-bao', 'Der Junge hat heute mehr Leute gefüttert als Quantum. Mit nichts. Mit Resten und Sturheit.'),
      L(J, 'Wenn ich groß bin, koch ich für die ganze Stadt. Auch für die Oberstadt. Aber die zahlen doppelt. Dreifach. Und sie müssen abwaschen.', 'signatur'),
      L(J, 'Und du kriegst immer die erste Portion. Weil du der Erste warst, der mitgekocht hat. Oder geflickt. Oder geworfen. Egal. Du warst da.', 'zaertlich'),
    ], { effects: [{ heal: 30 }, { rep: 'unterstadt', delta: 5 }, { setFlag: 'jakko_marktessen' }] }),
  ]),

  // ------------------------------------------------------------------------------------------- Herz-Ereignis 10
  dlg('dlg-he-jakko-10', [
    node('a', [
      N('Im Nest riecht es nach Eintopf. Auf Jakkos Herd aus Schrott blubbert ein Topf, und Jakko steht davor mit einem Heft in der Hand, in dem Buntstiftschrift auf Fettflecken tanzt.'),
      L(J, 'Mein Kochbuch. Guck. Nicht anfassen, da ist noch Soße drauf. Die gehört zum Rezept.', 'freude'),
    ], {
      choices: [
        { text: '„Sind die Rezepte von Babette, Rudi und Mutter Brühe drin?“', when: KOCHBUCH_FERTIG, next: 'fertig' },
        { text: '„Ist es fertig?“', when: { not: KOCHBUCH_FERTIG }, next: 'unfertig' },
      ],
    }),
    node('fertig', [
      L(J, 'Alle drei! Babettes Dampfnudel, Rudis Pfannkuchen aus der Ödnis, Mutter Brühes Suppe für schlechte Tage. Und meins: Jakkos Eintopf. Der hat einen Kochwettbewerb gewonnen. Gegen Daria. Sie hat Toast gemacht.', 'freude'),
    ], { next: 'seite' }),
    node('unfertig', [
      L(J, 'Fast. Mir fehlen noch ein paar. Babette sagt, ein Kochbuch ist nie fertig, so wie ein Hunger nie fertig ist. Das ist philosophisch. Ich hab nachgefragt, was das heißt. Es heißt: Iss was.', 'signatur'),
    ], { next: 'seite' }),
    node('seite', [
      L(J, 'Aber eine Seite ist ganz fertig. Und die ist für dich.', 'zaertlich'),
      N('Er reißt eine Seite heraus und gibt sie dir. Oben steht: „Eintopf für Leute, die man mag“. Darunter eine Zeichnung von dir mit Kochmütze. Die Mütze ist größer als du. Im Hintergrund: Daria, Freya, die Crew, ein Hase mit großen Ohren.'),
      L(J, 'Das ist das wichtigste Rezept. Das kann man nur kochen, wenn man jemanden mag. Sonst schmeckt’s nach Algen-Chips. Oder nach Nährriegel. Das ist noch schlimmer.', 'signatur'),
      L(J, 'Zutaten: alles, was da ist. Plus einer, mit dem man’s isst. Ohne den geht’s nicht. Hab ich getestet.'),
    ], {
      choices: [
        { text: '„Dann kochen wir’s jetzt. Zusammen.“', next: 'zusammen' },
        { text: '„Kaktusfrucht dazu. So machen wir das in der Ödnis.“', tag: '[Ödnis]', when: OEDNIS, next: 'kaktus' },
        { text: '„Das ist das schönste Rezept der Welt, Jakko.“', next: 'schoen' },
      ],
    }),
    node('zusammen', [N('Jakko hüpft. Er reicht dir den großen Löffel und nimmt sich selbst den kleinen, was bei Jakko die größte Ehre ist, die es gibt.')], {
      effects: [{
        minigame: 'akt-kochen', level: 2, key: 'jakko-eintopf-zusammen', label: 'Eintopf für Leute, die man mag',
        win: [herz(J, 20), { give: 'jakkos-eintopf' }, { message: 'Jakko: „Perfekt. Und weißt du, warum? Wegen der Zutat ganz unten.“' }],
        lose: [herz(J, 20), { give: 'jakkos-eintopf' }, { message: 'Jakko: „Angebrannt. Schmeckt trotzdem. Weil wir’s zusammen gemacht haben. Steht im Rezept.“' }],
      }],
      next: 'ende',
    }),
    node('kaktus', [
      L(J, 'Kaktus? IM EINTOPF? Das ist … das ist … das ist genial! Das schreib ich dazu! Mit Sternchen! „Variante Ödnis, von {name}.“', 'freude'),
    ], { effects: [herz(J, 20), { give: 'jakkos-eintopf' }, { setFlag: 'jakko_kaktus_variante' }], next: 'ende' }),
    node('schoen', [
      L(J, 'Ich weiß. Ich hab’s ja geschrieben.', 'freude'),
    ], { effects: [herz(J, 10)], next: 'ende' }),
    node('ende', [
      L('daria', '(aus der Schlafnische) Riecht’s da nach Eintopf? Ist das offiziell? Wird da ohne mich gegessen?'),
      L('freya', '(aus der anderen Nische) Einspruch! Frühstück ohne Protokoll!'),
      L(J, 'Jetzt essen! Alle! Ich hab drei Stunden nur gerochen, ich bin am Ende!', 'freude'),
    ]),
  ]),

  // ------------------------------------------------------------------------------------------- Akt 2
  dlg('jakko-a2-bruch', [
    node('a', [
      N('Jakko sitzt auf seinem Hocker an der Garküche und hält eine Dampfnudel in beiden Händen, als wäre sie aus Glas.'),
      L(J, 'Ist Aria krank? Ich hab gehört, sie ist krank. Ich hab Suppe gemacht. Babette sagt, Suppe hilft gegen alles, außer gegen Quantum.', 'besorgt'),
      L(J, 'Und die hier ist für Nyra. Die heb ich auf. Bis sie wiederkommt. Die wird hart, ich weiß. Ich heb sie trotzdem auf.', 'trauer'),
    ], {
      effects: [{ markSeen: 'jakko-a2-bruch' }],
      choices: [
        { text: '„Heb sie auf, Jakko. Ich bring Nyra her, und dann kriegt sie eine frische.“', effects: [{ setFlag: 'jakko_nyra_dampfnudel' }, herz(J, 30)], next: 'versprechen' },
        { text: '„Iss sie lieber selbst. Wer weiß, wie lange das dauert.“', next: 'essen' },
      ],
    }),
    node('versprechen', [
      L(J, 'Versprochen? Mit Löffel drauf? … Okay. Dann leg ich sie neben den Herd. Da ist es warm. Da wartet sie gut.', 'zaertlich'),
    ]),
    node('essen', [
      L(J, 'NEIN! Die ist für Nyra! Die ist ein Versprechen! Man isst keine Versprechen! … Außer man hat sehr großen Hunger. Hab ich nicht. Gerade.', 'wut'),
    ], { effects: [{ setFlag: 'jakko_nyra_dampfnudel' }] }),
  ]),

  dlg('jakko-a2-aria', [
    node('a', [
      L(J, 'ARIA IST WIEDER DA! Sie hat mich hochgehoben wie einen Sack Kartoffeln! Und gesagt, ich bin schwerer geworden! Das stimmt, ich hab extra viel gegessen, damit ich groß bin, wenn sie zurückkommt!', 'freude'),
      L(J, 'Sie hat die Suppe gegessen. Alles. Und den Topf ausgeleckt. Mit dem Finger. Mit dem Metallfinger! Das hat geklirrt!'),
    ], {
      effects: [{ markSeen: 'jakko-a2-aria' }, herz(J, 10)],
      choices: [
        { text: '„Deine Suppe hat sie bestimmt gesund gemacht.“', next: 'suppe' },
        { text: '„Und Dante ist jetzt auch bei uns.“', next: 'dante' },
      ],
    }),
    node('suppe', [L(J, 'Und Dante. Ein bisschen. Aber hauptsächlich die Suppe.', 'signatur')]),
    node('dante', [L(J, 'Dann gibt’s jetzt öfter Kekse! Mathematik: mehr Dante gleich mehr Kekse. Freya hat das nachgerechnet.', 'freude')]),
  ]),

  dlg('jakko-a2-tag', [
    node('a', [
      N('Jakko rührt in einem Topf, der für ihn eigentlich zu groß ist. Neben ihm liegt ein Stapel ungeöffneter Quantum-Nährriegel. Er benutzt sie als Hocker.'),
      L(J, 'Die Riegel sind gut für eins: draufsitzen. Weich und lila. Essen kann man die nicht. Also, kann man, aber dann wird man traurig und lächelt trotzdem.', 'signatur'),
    ], {
      choices: [
        { text: '„Was kochst du heute?“', next: 'heute' },
        { text: '„Wie geht’s Babette?“', next: 'babette' },
        { text: '„Liegt Nyras Dampfnudel noch beim Herd?“', when: { all: [NYRA_NUDEL, { not: NYRA_BEFREIT }] }, next: 'nudel' },
        {
          text: '„Hast du was für unterwegs? Es wird gerade ziemlich ernst.“', tag: '[Jakko ♥6]',
          requires: { hearts: J, min: 6 }, when: { notFlag: 'heute_jakko_proviant' }, next: 'proviant',
        },
        { text: '„Bis später, Chef.“', effects: [herz(J, 5)] },
      ],
    }),
    node('heute', [
      L(J, 'Eintopf gegen Lila. Neues Rezept. Viel Zwiebel, damit die Drohnen weinen.', 'freude'),
      L(J, 'Babette sagt, seit die Leute die Riegel essen, kommen weniger. Aber die, die kommen, essen doppelt. Das gleicht sich aus. Fast.'),
    ]),
    node('babette', [
      L(J, 'Babette ist wütend. Richtig wütend. Sie hat einer Quantum-Drohne mit dem Dampfkorb eins übergezogen. Die Drohne hat sich entschuldigt. Babette hat gesagt: „Zu spät, Blechbüchse.“', 'freude'),
      L(J, 'Ich will so werden wie Babette. Nur mit mehr Haaren.'),
    ]),
    node('nudel', [
      L(J, 'Liegt da. Ist hart wie ein Pflasterstein. Ich hab sie mit einem Tuch zugedeckt, damit sie nicht friert.', 'trauer'),
      L(J, 'Wenn Nyra wiederkommt, krieg sie eine neue. Und die alte stell ich ins Regal. Als Denkmal. Für Warten.'),
    ]),
    node('proviant', [
      N('Jakko wickelt etwas in Zeitungspapier und drückt es dir in die Hand. Es ist warm und riecht nach Zuhause.'),
      L(J, 'Dampfnudel. Frisch. Nicht für Nyra, die ist für dich. Für wenn’s ernst wird. Ernst geht besser mit vollem Bauch.', 'zaertlich'),
    ], { effects: [{ give: 'bao-dampfnudel' }, { setFlag: 'heute_jakko_proviant' }, herz(J, 5)] }),
  ]),

  dlg('jakko-a2-party', [
    node('a', [
      L(J, 'Ihr geht auf die Party im Turm? Die mit den Häppchen? Die haben bestimmt Häppchen mit Gold drauf! Echtem Gold!', 'freude'),
      L(J, 'Bringst du mir eins mit? Nur eins. Ich will wissen, wie Gold schmeckt. Daria sagt, nach Geld. Freya sagt, nach Ungerechtigkeit. Ich glaub, nach Butter.'),
    ], {
      effects: [{ markSeen: 'jakko-a2-party' }],
      choices: [
        { text: '„Ich bring dir eins mit. Versprochen.“', effects: [{ setFlag: 'jakko_haeppchen_wunsch' }, herz(J, 20)], next: 'ja' },
        { text: '„Jakko, die Häppchen sind das Letzte, worum ich mich da kümmere.“', next: 'nein' },
      ],
    }),
    node('ja', [L(J, 'JA! Steck’s in die Tasche. Nicht die Hosentasche. Da wird’s zerdrückt. Die Brusttasche. Beim Herz. Da ist es sicher.', 'freude')]),
    node('nein', [
      L(J, 'Ich weiß. Das war ein Witz. Ein bisschen. Ein halber.', 'trauer'),
      L(J, 'Komm einfach wieder. Ohne Häppchen. Das ist auch okay. Das ist sogar besser. Sag Daria nicht, dass ich das gesagt hab.', 'zaertlich'),
    ], { effects: [herz(J, 10)] }),
  ]),

  dlg('jakko-a2-nervoes', [
    node('a', [
      N('Jakko kocht. Und kocht. Auf dem Tresen stehen schon sieben Töpfe, und er setzt den achten auf.'),
      L(J, 'Wenn ich nervös bin, koch ich. Ich bin sehr nervös. Das reicht jetzt für die ganze Unterstadt. Und für einen Teil vom Kanalvolk.', 'besorgt'),
    ], {
      choices: [
        { text: '„Ich nehm einen Teller. Nervosität macht hungrig.“', effects: [{ heal: 20 }, herz(J, 10)], next: 'teller' },
        { text: '„Jakko. Atmen. Es wird gut.“', next: 'atmen' },
      ],
    }),
    node('teller', [L(J, 'Siehst du! Schon besser! Essen ist das Gegenteil von Angst. Hat Babette gesagt. Oder ich. Einer von uns ist sehr schlau.', 'freude')]),
    node('atmen', [L(J, 'Ich atme. Ich atme ganz viel. Es riecht nach Zwiebeln. Das hilft. Ein bisschen.', 'besorgt')]),
  ]),

  // ------------------------------------------------------------------------------------------- Akt 3
  dlg('jakko-partynacht', [
    node('a', [
      N('Jakko sitzt im Nest vor dem Fernseher, eine Schüssel kaltes Popcorn auf dem Schoß. Er isst nicht. Das ist das Unheimlichste an diesem Abend.'),
      L(J, 'Die haben Häppchen. Ich hab sie im Fernsehen gesehen. Die sind winzig. Die sind so klein, die kann man gar nicht teilen.', 'trauer'),
      L(J, 'Komm wieder. Ich hab Suppe warm gestellt. Für alle. Auch für Raven. Auch wenn Raven nie Suppe isst.', 'besorgt'),
    ], { effects: [herz(J, 5)] }),
  ]),

  // ------------------------------------------------------------------------------------------- Nachspiel
  dlg('jakko-nachspiel', [
    node('a', [
      L(J, 'DU BIST WIEDER DA! Ich hab Suppe! Ich hab immer noch Suppe! Ich hab seit der Partynacht Suppe warm gehalten, die ist jetzt sehr, sehr dick!', 'freude'),
    ], {
      effects: [{ markSeen: 'jakko-nachspiel' }, herz(J, 20)],
      choices: [
        { text: '(Ein goldenes Häppchen aus der Brusttasche ziehen. Leicht zerdrückt.)', when: { flag: 'jakko_haeppchen_wunsch' }, next: 'haeppchen' },
        { text: '„Wir waren am Meer, Jakko.“', when: ENDE_MEER, next: 'meer' },
        { text: '„Nexus hilft jetzt. Auch beim Kochen.“', when: ENDE_NEXUS, next: 'nexus' },
        { text: '„Gib mir einen Teller.“', next: 'teller' },
      ],
    }),
    node('haeppchen', [
      N('Jakko nimmt das Häppchen mit zwei Fingern. Es ist platt, ein Blattgoldfetzen klebt daran, es riecht nach Turm und Angst und ein bisschen nach Lachs.'),
      N('Er beißt hinein. Er kaut. Lange.'),
      L(J, '… Nach Butter. Ich hatte recht. Gold schmeckt nach Butter. Und nach ein bisschen Fisch. Und nach nix.', 'ueberrascht'),
      L(J, 'Meine Dampfnudeln sind besser. Das wusste ich. Aber jetzt weiß ich’s offiziell.', 'freude'),
    ], { effects: [herz(J, 40), { setFlag: 'jakko_gold_probiert' }], next: 'teller' }),
    node('meer', [
      L(J, 'Wie schmeckt das Meer? Salzig? Wie Algen-Chips? Igitt. Ich will trotzdem hin. Da gibt’s bestimmt Fische, die noch keiner gekocht hat.', 'freude'),
    ], {
      choices: [
        { text: '„Samstag nehm ich euch mit. Alle drei.“', effects: [{ setFlag: 'kinder_meer_dabei' }, herz(J, 30), herz('daria', 20), herz('freya', 20)], next: 'samstag' },
        { text: '„Bald, Jakko.“', next: 'teller' },
      ],
    }),
    node('samstag', [L(J, 'SAMSTAG! Ich koch am Strand! Am Lagerfeuer! Mit Meerwasser statt Salz! Das ist so effizient, das hätte Master erfunden! Nee, das hab ICH erfunden!', 'freude')], { next: 'teller' }),
    node('nexus', [
      L(J, 'Die KI hat mir ein Rezept vorgelesen. Über den Lautsprecher am Markt. Es war falsch. Zu wenig Zwiebeln. Ich hab’s ihr gesagt.', 'signatur'),
      L(J, 'Und sie hat sich bedankt! Und es geändert! Jetzt sagt sie überall in der Stadt mein Rezept an. „Nach Jakko.“ Ich bin berühmt. Bei einer KI.', 'freude'),
    ], { next: 'teller' }),
    node('teller', [
      N('Die Suppe ist so dick, dass der Löffel steht. Sie ist trotzdem das Beste, was du seit Tagen gegessen hast.'),
    ], { effects: [{ heal: 'full' }] }),
  ]),

  dlg('jakko-nyra-nudel', [
    node('a', [
      N('Jakko steht vor dir, in jeder Hand eine Dampfnudel. Die linke ist hart, grau und hat einen Sprung. Die rechte dampft.'),
      L(J, 'Ist Nyra wirklich wieder da? Dann muss das hier zu ihr. Die frische zum Essen. Die alte zum Angucken. Damit sie weiß, dass wir gewartet haben.', 'zaertlich'),
    ], {
      effects: [{ markSeen: 'jakko-nyra-nudel' }],
      choices: [
        { text: '„Ich bring sie ihr. Beide.“', next: 'bringen' },
        { text: '„Bring sie ihr selbst. Sie freut sich mehr, wenn du’s bist.“', next: 'selbst' },
      ],
    }),
    node('bringen', [
      L(J, 'Pass auf die alte auf. Die ist zerbrechlich. Nein, die ist unzerbrechlich. Die ist wie ein Stein. Aber ein Stein mit Gefühlen.', 'signatur'),
    ], { effects: [herz(J, 20), herz('nyra', 30), { message: 'Nyra hat Jakkos Dampfnudeln bekommen. Die alte steht jetzt in ihrem Muschelregal.' }] }),
    node('selbst', [
      L(J, 'Ich? Selbst? … Okay. Okay! Ich geh jetzt. Nein, erst Haare kämmen. Nein, die Dampfnudel wird kalt. Ich geh jetzt!', 'freude'),
    ], { effects: [herz(J, 30), herz('nyra', 30), { message: 'Jakko rennt los. Später erzählt Nyra, er habe die harte Dampfnudel „wie eine Medaille“ überreicht.' }] }),
  ]),

  dlg('jakko-nachspiel-tag', [
    node('a', [
      N('An der Garküche hängt ein neues Schild, Buntstift auf Pappe: „JAKKOS EINTOPF · AUCH FÜR LEUTE OHNE GELD · OBERSTADT ZAHLT DREIFACH“.'),
      L(J, 'Kundschaft! Echte! Mit Hunger! Was darf’s sein? Eintopf, Eintopf oder Eintopf mit extra Eintopf?', 'freude'),
    ], {
      choices: [
        { text: '„Eintopf mit extra Eintopf.“', when: { notFlag: 'heute_jakko_eintopf' }, effects: [{ setFlag: 'heute_jakko_eintopf' }, { heal: 40 }, herz(J, 5)], next: 'eintopf' },
        { text: '„Wie war das Meer?“', when: { flag: 'kinder_meer_dabei' }, next: 'meer' },
        { text: '„Kochst du immer noch mit Babette?“', next: 'babette' },
        { text: '„Bis später, Chef.“', effects: [herz(J, 5)] },
      ],
    }),
    node('eintopf', [L(J, 'Gute Wahl! Die beste Wahl! Eine ausgezeichnete Entscheidung, Master! … Das war ein Witz. Den darf man jetzt machen. Glaub ich.', 'signatur')]),
    node('meer', [L(J, 'Ich hab Meerwasser gekocht. Es wurde Salz. Ich hab Salz gemacht! Aus nichts! Ich bin quasi ein Zauberer. Babette sagt, ich bin ein Salzsieder. Klingt weniger cool.', 'freude')]),
    node('babette', [L(J, 'Jeden Tag. Sie sagt, ich darf bald allein den großen Topf. Wenn ich groß bin. Ich frag jeden Tag, ob ich schon groß bin. Sie sagt jeden Tag: „Fast.“', 'zaertlich')]),
  ]),

  dlg('jakko-meer', [
    node('a', [
      N('Am Lagerfeuer hat Jakko einen Topf auf drei Steine gestellt. Darin brodelt etwas, das nach Meer, Kartoffeln und Optimismus riecht. Krabbe Karl sitzt daneben und guckt sehr misstrauisch.'),
      L(J, 'Strandeintopf! Erfunden heute Morgen! Zutaten: Muscheln, Kartoffeln, Meer. Das Meer ist gratis. Das ist das einzige Gratis, das nicht gemein ist.', 'freude'),
    ], {
      choices: [
        { text: '(Probieren.)', when: { notFlag: 'heute_jakko_strand' }, effects: [{ setFlag: 'heute_jakko_strand' }, { heal: 40 }, herz(J, 10)], next: 'probieren' },
        { text: '„Ist Karl im Rezept?“', next: 'karl' },
      ],
    }),
    node('probieren', [L(J, 'Und? UND? … Du musst nichts sagen. Dein Gesicht sagt alles. Dein Gesicht sagt „Jakko ist ein Genie“.', 'signatur')]),
    node('karl', [L(J, 'NEIN! Karl ist ein Freund! Freunde kocht man nicht! Das ist Regel eins im Kochbuch. Regel zwei: Möwen schon. Aber die sind zu schnell.', 'wut')]),
  ]),

  dlg('jakko-master', [
    node('a', [
      N('Jakko steht an der Garküche. Als er dich sieht, hört er auf zu rühren. Der Löffel bleibt im Topf stehen.'),
      L(J, 'Ich koch nicht für dich. Ich hab’s versucht. Ich hab einen Teller gemacht. Der Löffel wollte nicht. Er ist einfach liegen geblieben.', 'trauer'),
      L(J, 'Die Drohnen sagen jetzt Rezepte an. Mit deiner Stimme. Nährriegel. Jeden Tag Nährriegel. Ich hab gedacht, du magst Dampfnudeln.'),
    ], {
      choices: [
        { text: '„Jakko …“', next: 'jakko' },
        { text: '(Gehen.)' },
      ],
    }),
    node('jakko', [
      L(J, 'Nicht. Bitte nicht. Wenn du nett bist, wird’s schlimmer. Dann denk ich, du kommst zurück, und dann kommst du nicht.', 'trauer'),
      N('Er dreht sich zum Topf um. Er rührt weiter. Er rührt sehr lange in die gleiche Richtung.'),
    ]),
  ]),

  dlg('jakko-3b', [
    node('a', [
      N('Jakko hält dir einen Teller hin, bevor du überhaupt etwas sagen kannst. Seine Hände zittern ein bisschen. Der Eintopf schwappt.'),
      L(J, 'Der Löffel will wieder. Hab ich gerade getestet. Er bleibt nicht mehr liegen.', 'zaertlich'),
    ], {
      effects: [{ markSeen: 'jakko-3b' }, herz(J, 60), { heal: 'full' }],
      choices: [
        { text: '„Danke, Jakko. Das ist das Beste, was ich seit Wochen gegessen hab.“', next: 'danke' },
        { text: '(Essen. Einfach essen.)', next: 'essen' },
      ],
    }),
    node('danke', [L(J, 'Ich weiß. Champagner im Turm schmeckt bestimmt scheiße. Hat Daria gesagt. Sie sagt jetzt öfter „scheiße“. Freya ist reich geworden.', 'signatur')]),
    node('essen', [L(J, 'Gut so. Erst essen. Dann reden. Dann noch mal essen. So macht man Frieden. Steht im Kochbuch. Seite eins. Hab ich gestern geschrieben.', 'zaertlich')]),
  ]),
);

export const part: ContentPart = { dialogues };
