// Hunter – Chef der Crew, Wirt des High Voltage (world.md §4.2, §4.6, §4.7 „Nach Ladenschluss“, §11.2).
// Tagesablauf nach design/plan/act1.json (npcSchedules.hunter), Herz-Ereignisse he-hunter-2/4/6 in Akt 1,
// he-hunter-8/10 angelegt und an act2 gebunden. Begleiter erst ab act2.
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode, NpcDef, Weekday } from '../../../modules/contracts';
import {
  type Menue, AKT2, COUNTDOWN_DONE, NICHT_MASTER, RUHIG, abblende, dialog, erz, flag, frei, herz, ich, knoten, neu,
  pruefung, rede, sammle, sammleSzenen, sprecher, tagesgespraech, und, ZEIT_HINWEIS,
} from './_helfer';
import { HUNTER_PLAN_23, HUNTER_TEL_23, hunter23 } from './_hunter23';

const H = sprecher('hunter');
const N = sprecher('kaeptn-nebelhorn');
const B = sprecher('barkeeper');
const BB = sprecher('babette-bao');
const D = sprecher('dante');
const A = sprecher('aria');
const RP = sprecher('ripper');

const ROM: Condition = { romance: 'hunter' };
/** Flirtzeilen ab ♥6, sobald die Romanze freigeschaltet ist (Engine: romanceEnabled); Kuss/Nacht bleiben an ROM (♥8). */
const FLIRT: Condition = { all: [{ romanceEnabled: 'hunter' }, { hearts: 'hunter', min: 6 }] };
const PROBEZEIT_DONE: Condition = { quest: 'main-1-probezeit', state: 'done' };
/** Heute mit einer anderen freigegebenen Figur geflirtet (Tagesflag, fällt morgens; world.md §4.7 „Trennung und Eifersucht“). */
const FLIRT_FREMD = ['heute_flirt_dante', 'heute_flirt_aria', 'heute_flirt_collin-charleston', 'heute_flirt_lio-funkel'];
const HAT_FREMD_GEFLIRTET: Condition = { any: FLIRT_FREMD.map((f): Condition => ({ flag: f })) };
const ZUSAMMEN: Condition = { all: [ROM, { flag: 'hunter_romanze_zusammen' }] };

// ---------------------------------------------------------------------------------------------- Menü

function menue(): Menue {
  const zurueck: DialogueChoice[] = [{ text: 'Noch was, Boss.', next: 'menue', id: 'zurueck' }, { text: 'Bis später.' }];

  /** Flirt-Varianten nach Wochentag (world.md §4.7, Hunter-Flirtzeilen). */
  const flirt = (n: number, tage: Weekday[]): DialogueChoice => ({
    text: 'Mit Hunter flirten.', tag: '[Romanze]', next: `flirt-${n}`, id: `flirt-${n}`,
    when: { all: [FLIRT, { weekday: tage }] }, effects: [flag('heute_flirt_hunter')],
  });
  const antworten: DialogueChoice[] = [
    { text: '„Dann setz es mir auf die Rechnung. Ganz oben.“', check: pruefung('hunter-flirt-frech', 'ausstrahlung', 6, ['flirt']), next: 'flirt-a' },
    { text: '„Ich starr nicht. Ich bewerte.“', next: 'flirt-b' },
    { text: '„Arbeite weiter, Chef.“', next: 'flirt-c' },
  ];

  const choices: DialogueChoice[] = [
    { text: '„Die Schuhe? Maßanfertigung.“', tag: '[Oberstadt]', when: { origin: 'origin-oberstadt' }, once: true, id: 'h-oberstadt', next: 'h-oberstadt' },
    { text: '„Ich weiß, wie es klingt, wenn eine Zellentür zufällt.“', tag: '[Knast]', when: { origin: 'origin-knastvogel' }, once: true, id: 'h-knast', next: 'h-knast' },
    { text: '„Draußen in der Ödnis träumen alle vom selben: Wasser, das nicht nach Rost schmeckt.“', tag: '[Ödnis]', when: { origin: 'origin-oednis' }, once: true, id: 'h-oednis', next: 'h-oednis' },
    { text: 'Gibt’s Arbeit für mich?', when: PROBEZEIT_DONE, next: 'arbeit' },
    { text: 'Erzähl mir von Blade.', requires: { hearts: 'hunter', min: 3 }, tag: '[Hunter ♥3]', once: true, id: 'h-blade', next: 'blade', when: PROBEZEIT_DONE },
    { text: 'Wie waren die drei Jahre im Eisenhof?', requires: { hearts: 'hunter', min: 4 }, tag: '[Hunter ♥4]', once: true, id: 'h-knastzeit', next: 'knastzeit', when: PROBEZEIT_DONE },
    {
      text: 'Was ist das für ein Flyer unter deinem Kassenbuch?', next: 'thai', id: 'h-thai',
      when: { all: [{ hearts: 'hunter', min: 3 }, { quest: 'main-1-dante', state: 'done' }, { quest: 'side-thai-chi', state: 'inactive' }, { time: 'morgen' }] },
      effects: [{ startQuest: 'side-thai-chi' }],
    },
    {
      text: 'Und wenn der Bruch schiefgeht?', next: 'plan-sorge', once: true, id: 'h-plan-sorge',
      when: { quest: 'main-1-der-plan', state: ['active', 'done'] },
    },
    { text: 'Nougatbomben, hm? Ausgerechnet du.', when: { seen: 'he-hunter-4' }, once: true, id: 'h-nougat', next: 'nougat' },
    { text: 'Wann angeln wir wieder?', when: { seen: 'he-hunter-6' }, once: true, id: 'h-angeln', next: 'angeln-wieder' },
    {
      text: 'Kommst du mal mit raus, Boss? Auf Tour?', next: 'tour', id: 'h-tour',
      when: { all: [AKT2, COUNTDOWN_DONE, NICHT_MASTER, { not: { recruited: 'hunter' } }] }, effects: [{ recruit: 'hunter' }],
    },
    { text: 'Hunter. Was ist mit Nyra? Ehrlich.', when: { all: [AKT2, { flag: 'nyra_befreit' }] }, once: true, id: 'h-nyra-zurueck', next: 'nyra-zurueck' },
    {
      text: '„Machst du heute früher zu?“', tag: '[Romanze]', next: 'nacht-frage', id: 'h-nacht-frage',
      when: { all: [ZUSAMMEN, frei('hunter'), NICHT_MASTER, { notFlag: 'woche_hunter_nacht' }, { time: ['abend', 'nacht'] }] },
    },
    flirt(1, ['mo', 'fr']),
    flirt(2, ['di', 'sa']),
    flirt(3, ['mi', 'so']),
    flirt(4, ['do']),
    { text: 'Bis später.' },
  ];

  const nodes: DialogueNode[] = [
    knoten('menue', [H('Noch was? Mach schnell, die Zeit läuft. Meine Zeit. Die ist teuer.')], { choices }),
    knoten('tour', [
      H('Auf Tour. Ich. Mit Mitte fünfzig und Rücken.', 'signatur'),
      H('… Gut. Aber nur, wenn’s sich lohnt. Und ich red. Du schießt. Wenn einer fragt, wer der Chef ist: Ich. Auch wenn ich hinter dir in Deckung lieg.'),
    ], { choices: zurueck }),
    knoten('nyra-zurueck', [
      H('Sie ist zurück. Sie hat sich entschuldigt. Bei MIR. Für etwas, das ich gemacht hab.', 'trauer'),
      H('Ich hab ihr einen Hocker mit Namensschild gegeben. Sie hat es nicht abgemacht. Das ist der Unterschied zwischen ihr und Raven.', 'freude'),
    ], { choices: zurueck, effects: [herz('hunter', 10)] }),
    knoten('nacht-frage', [
      H('Früher zu. Ich. Der Mann, der für eine Minute Verspätung Leute feuert.', 'signatur'),
      H('… Kommst du nachher noch hoch?', 'zaertlich'),
    ], {
      choices: [
        { text: '„Ich bin schon oben.“', effects: [flag('hunter_nacht'), flag('woche_hunter_nacht'), { cutscene: 'szene-hunter-nacht-woche' }] },
        { text: '„Ein andermal, Teilhaber.“', next: 'nacht-andermal' },
      ],
    }),
    knoten('nacht-andermal', [H('Ein andermal. Ich schreib’s an. Die Liste wird lang. Irgendwann schick ich dir eine Mahnung. Mit Herzchen.', 'signatur')], { choices: zurueck }),
    knoten('h-oberstadt', [
      H('Feine Schuhe. Die halten hier unten keine Woche.', 'signatur'),
      H('Maßanfertigung, sagst du. Dann lass dir gleich ein zweites Paar machen. Für die Flucht.'),
    ], { choices: zurueck }),
    knoten('h-knast', [
      H('Wie lange?'),
      ich('Lange genug.'),
      H('Dann weißt du, was eine zweite Chance wert ist.', 'besorgt'),
      H('Hier drin kriegst du genau eine. Die zweite zahlt man bar.'),
    ], { choices: zurueck }),
    knoten('h-oednis', [
      H('Die Ödnis. Mein Vater wollte da raus. Aussiedlerhof, Brunnen, Ziegen. Hat’s bis zur Staubstraße geschafft und ist umgedreht, weil er sein Feuerzeug vergessen hat.', 'besorgt'),
      H('Er ist nie wieder losgefahren. Ich hab mir geschworen: Wenn ich losfahre, nehm ich zwei Feuerzeuge mit.'),
    ], { choices: zurueck }),
    knoten('arbeit', [
      H('Auftragstafel. Hinterzimmer. Da hängt alles, was Geld bringt und nicht zu sehr stinkt.'),
      H('Regel eins: Was du annimmst, lieferst du. Regel zwei: Schulden muss man immer begleichen. Regel drei: siehe Regel zwei.', 'signatur'),
    ], { choices: zurueck }),
    knoten('blade', [
      H('Blade. Hm.', 'wut'),
      H('Der Typ hat einen Stock mit Goldknauf und ein Herz aus demselben Material. Hübsch, glänzt, ist hohl.'),
      H('Vor sieben Jahren: Digitech. Er nimmt den Chip, kettet Raven an ein Rohr und spaziert raus. Wir anderen spazieren rein. In den Eisenhof.'),
      H('Ich hab drei Jahre gekriegt. Raven sieben. Blade einen Fernsehauftritt.', 'trauer'),
      H('Wenn du ihn je triffst: Lächel nicht zurück. Der zählt Lächeln wie andere Leute Kleingeld.'),
    ], { choices: zurueck, effects: [herz('hunter', 20)] }),
    knoten('knastzeit', [
      H('Drei Jahre. Zelle mit Blick auf eine Wand, die ein Fenster sein wollte.'),
      H('Weißt du, was man da lernt? Rechnen. Jeden Tag: Wie viele Tage noch. Wie viele Credits. Wie viele Leute, die dir was schulden.', 'besorgt'),
      H('Am Ende stand da eine Zahl. Die Zahl ist jetzt dieser Laden. Jeder Hocker ein Tag. Setz dich nicht auf den wackeligen, das ist der erste Monat.'),
    ], { choices: zurueck, effects: [herz('hunter', 20)] }),
    knoten('thai', [
      erz('Unter dem Kassenbuch lugt ein knallgelber Zettel hervor: „Tai Chi für Anfänger – Hinterhof-Studio, Lötgassen. Finde deine innere Mitte!“'),
      H('Das ist nichts. Das ist Altpapier. Das ist ... Werbung, die jemand in meinen Laden geschleppt hat.', 'wut'),
      H('...', 'besorgt'),
      H('Okay. Hör zu. Wenn ich hungrig bin, werd ich ... schwierig. Die Diva, sagt der Barkeeper. Ich will das abstellen. Ohne dass es einer merkt.'),
      H('Lötgassen. Morgens. Du kommst mit und stehst Schmiere. Und wenn du lachst, kriegst du Hausverbot. In der ganzen Unterstadt.', 'signatur'),
    ], { choices: zurueck }),
    knoten('plan-sorge', [
      H('Schiefgehen. Hm.'),
      H('Letztes Mal ging’s schief, weil einer von uns mehr wollte als die anderen. Diesmal teilen wir. Alles. Auch die Angst.', 'besorgt'),
      H('Und wenn’s trotzdem schiefgeht, schuldest du mir nichts. Das ist das einzige Mal, dass ich das sage. Schreib’s dir auf.'),
    ], { choices: zurueck }),
    knoten('nougat', [
      H('Ein Wort darüber außerhalb dieser Wände und ich erzähl jedem, dass du beim Tanzen die Zunge rausstreckst.', 'wut'),
      H('... Sie sind gut, okay? Sie sind gut. Unter dem Tresen liegt jetzt eine Notfallkiste. Finger weg. Außer im Notfall. Notfall bin ich.'),
    ], { choices: zurueck }),
    knoten('angeln-wieder', [
      H('Sonntag. Sechs Uhr. Hafenkante. Nebelhorn bringt die Würmer, du bringst den Kaffee.'),
      H('Und wenn du wieder eine Dose rausziehst, stell ich sie hinter die Bar. Als Mahnmal.', 'signatur'),
    ], { choices: zurueck }),
    // Flirt (Romanzefassung, nur mit { romance: 'hunter' })
    knoten('flirt-1', [H('Du bist pünktlich. Das find ich gefährlich attraktiv.', 'verlegen')], { choices: antworten }),
    knoten('flirt-2', [H('Hör auf, mich so anzugucken, Neuling. Ich hab eine Bar zu führen.', 'signatur')], { choices: antworten }),
    knoten('flirt-3', [H('Seidenhemd steht mir, ich weiß. Du darfst trotzdem weiter starren.', 'signatur')], { choices: antworten }),
    knoten('flirt-4', [H('Wenn du noch einmal so lächelst, setz ich’s dir auf die Rechnung.', 'verlegen')], { choices: antworten }),
    knoten('flirt-a', [
      H('Ganz oben steht Ripper. Willst du neben Ripper stehen?'),
      H('Dachte ich mir. Für dich mach ich eine eigene Seite. Mit Goldrand.', 'zaertlich'),
    ], { choices: zurueck }),
    knoten('flirt-b', [H('Und? ... Sag nichts. Ich will’s nicht wissen. Doch. Später. Nach Ladenschluss.', 'verlegen')], { choices: zurueck }),
    knoten('flirt-c', [H('Gute Antwort. Langweilig, aber gut. Ich steh auf Leute, die mich arbeiten lassen.', 'signatur')], { choices: zurueck }),
  ];
  return { choices, nodes };
}

const M = menue();

/** Vor der Probezeit: knappes Menü ohne Arbeit und Geschichten. */
const VOR_PROBEZEIT: Menue = {
  choices: [
    { text: 'Wann redest du mit mir?', next: 'wann' },
    { text: 'Bis später.' },
  ],
  nodes: [
    knoten('wann', [
      H('Wenn ich rufe. Hinterzimmer. Bis dahin: Hände weg von meiner Kasse, Füße weg von meinem Tresen.'),
      H('Und wenn hier gleich jemand eine Waffe zieht – guck dir an, wer was macht. Ich tu das auch.', 'signatur'),
    ]),
  ],
};

/** Rivalität: Versöhnungsquest pers-hunter-reiner-tisch (world.md §4.2). */
const RIVALE: Menue = {
  choices: [
    {
      text: 'Ich will das geradebiegen. Was kostet das?', next: 'reiner-tisch',
      when: { quest: 'pers-hunter-reiner-tisch', state: 'inactive' }, effects: [{ startQuest: 'pers-hunter-reiner-tisch' }],
    },
    { text: 'Schon gut. Ich geh ja.' },
  ],
  nodes: [
    knoten('reiner-tisch', [
      H('Geradebiegen. Hm. Du zahlst, was du mir schuldest. Alles. Bis auf den letzten Credit.', 'wut'),
      H('Und dann stehst du einen Abend hinter meiner Bar. Mit Lächeln. Wenn du lächeln kannst. Ich hab’s noch nie gesehen.'),
      H('Schulden muss man immer begleichen. Auch die, die man nicht in Credits zählt.'),
    ]),
  ],
};

// ---------------------------------------------------------------------------------------------- Tagesgespräche

const T = {
  rivale: tagesgespraech('hunter-tag-rivale',
    [H('Du. Hast du meine Credits dabei? Nein? Dann red mit dem Barkeeper. Der hört sich alles an. Ich nicht.', 'wut')],
    [H('Weißt du, was ich mit Leuten mache, die mich enttäuschen? Ich schreib sie auf. Ganz oben. In Rot. Mit Ausrufezeichen.', 'wut')],
    RIVALE),
  vorProbezeit: tagesgespraech('hunter-tag-vor-probezeit',
    [H('Du bist der Neuling. Oder die Neue. Egal. Du bist zu spät oder zu früh, beides kostet.', 'signatur')],
    [H('Setz dich. Trink was. Bezahl was. Ich hab gleich Zeit für dich. „Gleich“ ist eine Maßeinheit, die nur ich kenne.')],
    VOR_PROBEZEIT),
  vexariaTanz: tagesgespraech('hunter-tag-vexaria-tanz',
    [
      H('Schrapnell. Komm her.', 'signatur'),
      H('Keine Turteleien auf meiner Tanzfläche. … Das war keine Turtelei, das war ein Unfall mit Keks. Wird nicht wieder vorkommen.'),
      H('Oder doch. Mir egal. Hauptsache, keiner stolpert über den Schläger.', 'freude'),
    ],
    [H('Dante erzählt seit gestern jedem Gast die Müllsack-Geschichte. Jedem. Auch dem Lieferanten. Der Lieferant hat geweint.')],
    M, { effects: [flag('hunter_kommentar_vexaria_tanz')] }),
  vexariaZusammen: tagesgespraech('hunter-tag-vexaria-zusammen',
    [
      H('Zwei von meinen Leuten.', 'besorgt'),
      H('Ich hätte Regeln machen sollen. … Ich hätte mich nicht dran gehalten. Weitermachen.', 'freude'),
    ],
    [H('Keine Turteleien an meinem Tresen. Und kein Pulli-Tausch. Ich verlier den Überblick, wer wer ist.', 'signatur')],
    M, { effects: [flag('hunter_kommentar_vexaria_zusammen')] }),
  ariaRomanze: tagesgespraech('hunter-tag-aria-romanze',
    [H('Du und Aria. Mein Tresen hat schon Schlimmeres gesehen. Nicht viel Schlimmeres, aber Schlimmeres.', 'signatur')],
    [H('Wenn sie wegen dir einen Stuhl zerlegt, zahlst du den Stuhl. Wenn sie wegen dir lacht … zahlst du trotzdem den Stuhl. So ist Liebe in meinem Laden.')],
    M, { effects: [flag('hunter_kommentar_aria_romanze')] }),
  zeit: tagesgespraech('hunter-tag-zeit',
    [
      H('{name}. Komm her. Nein, nichts Wichtiges. Ich wollte nur sehen, ob du noch da bist.', 'besorgt'),
      erz(ZEIT_HINWEIS),
    ],
    [H('Es gibt Sachen, die sag ich erst, wenn wir den großen Bruch hinter uns haben. Vorher ist alles nur Gerede, und Gerede kostet Getränke.')],
    M),
  plan: tagesgespraech('hunter-tag-plan',
    [H('Planungstafel hängt im Hinterzimmer. Zwei Vorbereitungen, dann reden wir über heute Nacht.', 'signatur')],
    [H('Ein guter Plan ist wie ein guter Drink: Man merkt nicht, wie stark er ist, bis man liegt. Und dann liegt man gut.')],
    M),
  angeln: tagesgespraech('hunter-tag-angeln',
    [H('Pssst. Die Fische hören dich. Nebelhorn sagt, die hören alles. Nebelhorn sagt auch, dass seine Pfeife mit ihm redet.', 'freude')],
    [H('Seit vier Sonntagen nichts gefangen. Ist mir egal. Hier schreit keiner nach Wechselgeld, und das Wasser schuldet mir nichts.')],
    M),
  montag: tagesgespraech('hunter-tag-montag',
    [H('Barkeeper hat frei. Ich mix heute. Bestell was Einfaches. Wasser. Wasser kann ich.', 'besorgt')],
    [
      H('Was ist in einem Neon-Limo? … Limo und Neon, nehme ich an. Wo ist das Neon? Warum leuchtet das nicht?', 'wut'),
      H('Mixi! MIXI! Hör auf, mich anzupiepen, du Toaster mit Strohhalm!'),
    ],
    M),
  morgen: tagesgespraech('hunter-tag-morgen',
    [H('Morgen. Die Zahlen sind wach, ich noch nicht. Red leise.')],
    [
      H('Ripper schuldet mir drei Runden, Dexter eine Lebensgeschichte, und der Kiosk will Geld für Eiswürfel. Eiswürfel! Das ist gefrorenes Wasser, kein Luxusgut.', 'wut'),
      H('Schulden muss man immer begleichen. Auch beim Eis.'),
    ],
    M),
  markt: tagesgespraech('hunter-tag-markt',
    [H('Einkauf. Wenn du mich hier siehst, siehst du mich nicht. Die Händler erhöhen sonst die Preise, sobald sie meine Brille sehen.', 'signatur')],
    [H('Zitronen. Echte Zitronen. Zwölf Credits das Stück. Für zwölf Credits will ich, dass die Zitrone meine Steuererklärung macht.', 'wut')],
    M),
  buero: tagesgespraech('hunter-tag-buero',
    [H('Hinterzimmer heißt Hinterzimmer, weil man hier hinten nicht stört. Du störst. Was gibt’s?')],
    [H('Ich mach die Abrechnung. Die Abrechnung macht mich. Wer gewinnt, weiß noch keiner. Bisher steht’s unentschieden, und das ist schlecht fürs Geschäft.')],
    M),
  vertraut: tagesgespraech('hunter-tag-vertraut',
    [H('{name}. Dein Platz am Tresen ist frei. Ich hab ihn freigehalten. Sag’s keinem.', 'freude')],
    [H('Ich hab nachgedacht. Über den Strand. Wenn wir das Ding drehen und keiner stirbt, dann … egal. Trink. Geht aufs Haus. Einmal.')],
    M),
  bar: tagesgespraech('hunter-tag-bar',
    [H('Neuling. Setz dich, trink was, zahl was. In dieser Reihenfolge, wenn’s sein muss. Aber zahlen ist Pflicht.')],
    [
      H('Weißt du, warum der Laden läuft? Pünktlichkeit. Wer zehn Minuten zu spät kommt, kommt beim nächsten Mal gar nicht. So einfach ist Gastronomie.'),
      H('Und wer zwanzig Minuten zu spät kommt, wird Türsteher. Frag Bruno.', 'signatur'),
    ],
    M),
};

// ---------------------------------------------------------------------------------------------- Herz-Ereignisse

const he2 = dialog('he-hunter-2', [
  knoten('start', [
    erz('Kurz nach Mitternacht. Die letzten Gäste sind draußen, Bruno rollt die Samtkordel ein. Hunter sitzt an der Kasse, Sonnenbrille auf, ein Gummiband um jedes Bündel.'),
    H('Neuling. Gut. Setz dich. Zweite Schublade, du zählst.'),
    H('Wenn’s am Ende nicht stimmt, zählen wir nochmal. Und dann nochmal. Ich hab Zeit. Du nicht, aber das ist dein Problem.', 'signatur'),
  ], {
    choices: [
      { text: 'Die Zählmaschine rattert. Ich richte sie.', check: pruefung('he-hunter-2-zaehlmaschine', 'technik', 4, ['reparieren']), next: 'maschine', effects: [herz('hunter', 30)] },
      { text: 'Moment. Der Fünfziger hier ist falsch.', check: pruefung('he-hunter-2-blueten', 'strasse', 5, ['faelschung']), next: 'blueten', effects: [herz('hunter', 40), { credits: 20 }] },
      { text: 'Ich zähl einfach. Schein für Schein.', next: 'zaehlen', effects: [{ advanceTime: 30 }, herz('hunter', 20)] },
    ],
  }),
  knoten('maschine', [
    erz('Du klopfst zweimal auf das Gehäuse und drehst an einer Schraube, die seit Jahren keiner angefasst hat. Die Maschine schnurrt wie neu.'),
    H('Die hat drei Jahre gestottert. Ich dachte, das ist ihre Persönlichkeit.', 'ueberrascht'),
    H('Gute Hände. Hände, die nicht klauen, sind noch besser. Wir werden sehen.'),
  ], { next: 'kiste' }),
  knoten('blueten', [
    ich('Das Hologramm ist aufgeklebt. Und die Seriennummer ist ein Geburtsdatum.'),
    H('Ripper. Das ist Rippers Handschrift. Der zahlt mir seit einem Jahr mit Geld aus seinem Drucker.', 'wut'),
    H('Finderlohn. Zwanzig. Echte. Ich hab sie geprüft. Zweimal.', 'signatur'),
  ], { next: 'kiste' }),
  knoten('zaehlen', [
    erz('Eine halbe Stunde, zwei Stapel, ein Krampf im Daumen. Am Ende stimmt es auf den Credit.'),
    H('Auf den Credit. Weißt du, wie selten das ist? Der Barkeeper zählt immer einen zu viel. Aus Höflichkeit.'),
  ], { next: 'kiste' }),
  knoten('kiste', [
    erz('Hunter zieht eine Holzkiste unter dem Tresen hervor. Auf dem Deckel steht mit Edding: JIMMY. NICHT ANFASSEN. AUCH DU NICHT, HUNTER.'),
    H('Jimmys Kram. Seit dem Chipfieber steht die hier. Zwei Wochen. Ich räum sie nicht aus. Ich räum sie um. Das ist ein Unterschied.', 'besorgt'),
    erz('Darin: ein Kabelbrand-Aufnäher, drei Plektren, eine angebissene Nougatbombe – und ein Zettel. „Jimmy schuldet Hunter 40 Cr. Oder ein Lied.“'),
  ], {
    choices: [
      { text: 'Den Schuldschein zerreißen.', next: 'zerreissen', effects: [flag('hunter_jimmy_erlassen')] },
      { text: 'Aufheben. Jimmy kommt wieder und zahlt.', next: 'aufheben', effects: [flag('hunter_jimmy_hoffnung')] },
      { text: 'Was ist mit Jimmy eigentlich passiert?', next: 'jimmy', once: true, id: 'he2-jimmy' },
    ],
  }),
  knoten('jimmy', [
    H('Chip gekauft. Billig. „Neuer Mensch in zwei Minuten.“ Zwei Minuten später war er weg. Läuft irgendwo rum und singt Werbung.'),
    H('Wenn du was hörst, irgendwas – Spuren, Gerüchte, Kronkorken mit seinem Gekritzel –, sagst du es mir. Zuerst mir.', 'trauer'),
  ], {
    effects: [flag('hunter_sucht_jimmy')],
    choices: [
      { text: 'Den Schuldschein zerreißen.', next: 'zerreissen', effects: [flag('hunter_jimmy_erlassen')] },
      { text: 'Aufheben. Jimmy kommt wieder und zahlt.', next: 'aufheben', effects: [flag('hunter_jimmy_hoffnung')] },
    ],
  }),
  knoten('zerreissen', [
    H('Schulden muss man immer begleichen.', 'ueberrascht'),
    H('… Außer bei Jimmy. Jimmy zahlt in Lärm, und Lärm hatten wir genug.'),
  ], { next: 'ende' }),
  knoten('aufheben', [
    H('Ja. Der kommt wieder. Und dann singt er mir das Lied. Schief. Auf meinem Tresen.'),
    H('Leg’s zurück. Genau so, wie’s lag. Er merkt das.', 'besorgt'),
  ], { next: 'ende' }),
  knoten('ende', [
    H('Kasse ist Vertrauenssache. Ab heute hast du ein bisschen davon. Nicht viel. Ein Bündel.', 'signatur'),
    erz('Er drückt dir dreißig Credits in die Hand. „Nachtzuschlag.“ Dann knipst er das Licht aus, bevor du dich bedanken kannst.'),
  ], { effects: [{ credits: 30 }, { xp: 40 }, herz('hunter', 20)] }),
]);

const he4 = dialog('he-hunter-4', [
  knoten('start', [
    erz('Am Tresenende: Hunter. Jackett weg, Haare verrutscht, Sonnenbrille schief. Er schiebt ein Glas von sich.'),
    H('Das Eis ist zu eckig. Wer hat das Eis so eckig gemacht? BRUNO! Bruno, du bist gefeuert! … Du bist wieder eingestellt, aber auf Bewährung!', 'wut'),
    B('Er hat seit heute Mittag nichts gegessen. Dann wird er so. Wir nennen es „die Diva“. Er nennt es „Führungsstil“.'),
    H('Ich höre dich! Die Musik ist zu laut, das Licht zu lila, und dieser Hocker guckt mich an. Hocker! Guck woanders hin!', 'wut'),
  ], {
    choices: [
      { text: 'Eine Nougatbombe hinhalten.', when: { item: 'nougatbombe' }, next: 'riegel', effects: [{ take: 'nougatbombe' }] },
      { text: '„Hunter. Mund auf. Keine Widerrede.“', check: pruefung('he-hunter-4-diva', 'ausstrahlung', 5, ['befehl']), next: 'befehl' },
      { text: 'Babettes Dampfnudel aus der Tasche holen.', when: { item: 'bao-dampfnudel' }, next: 'dampfnudel', effects: [{ take: 'bao-dampfnudel' }] },
      { text: 'Ich renn schnell zum Volt-Eck.', next: 'kiosk', effects: [{ advanceTime: 15 }] },
    ],
  }),
  knoten('riegel', [
    H('Was ist das. Nein. Ich esse nichts, was nach Kindheit schmeckt.', 'wut'),
    ich('Iss.'),
    erz('Er isst. Erst misstrauisch, dann schneller. Dann leckt er das Papier ab und tut so, als hätte es keiner gesehen.'),
  ], { next: 'wunder' }),
  knoten('befehl', [
    erz('Du greifst hinter den Tresen, wo der Barkeeper die Notfall-Nougatbomben versteckt, und schiebst Hunter eine zwischen die Zähne, bevor er Luft holen kann.'),
    H('Mmpf. … Mmmh.'),
  ], { next: 'wunder' }),
  knoten('dampfnudel', [
    H('Babette? … Babette ist eine Heilige.', 'ueberrascht'),
    erz('Die Dampfnudel verschwindet in drei Bissen. „Hast du noch was Süßes? Kleiner? In Papier?“ Der Barkeeper wirft wortlos eine Nougatbombe über den Tresen. Hunter fängt sie, ohne hinzusehen.'),
  ], { next: 'wunder' }),
  knoten('kiosk', [
    erz('Oma Volt wirft dir eine Nougatbombe hinterher, bevor du fragen kannst. „Für Hunter? Geht aufs Haus. Seins.“ Als du zurückkommst, hat Hunter gerade einem Stuhl gekündigt.'),
    H('Was ist das. Nein. Ich esse nichts, was nach Kindheit schmeckt.', 'wut'),
    erz('Du wickelst sie aus. Er isst. Natürlich isst er.'),
  ], { next: 'wunder' }),
  knoten('wunder', [
    erz('Stille. Hunter rückt die Sonnenbrille gerade, knöpft das Hemd zu, streicht das Haar glatt. Ein Mann kehrt in seinen Körper zurück.'),
    H('Das … schmeckt nach dem Tag, an dem ich zum ersten Mal Wechselgeld geklaut hab. Ich war acht. Es war ein guter Tag.', 'trauer'),
    H('Bruno ist nicht gefeuert. Der Hocker auch nicht. Und du … du hast gesehen, was du gesehen hast.'),
  ], {
    choices: [
      { text: '„Hab ich. Ich nenn es ‚die Diva‘.“', next: 'diva' },
      { text: '„Ich hab nichts gesehen, Boss.“', next: 'nichts', effects: [herz('hunter', 10)] },
    ],
  }),
  knoten('diva', [
    H('Nenn es, wie du willst. Aber nur hier drin.', 'wut'),
    H('Und wenn du’s einem erzählst, erzähl ich allen, dass du im Schlaf redest. Tust du? Egal. Glaubt jeder.', 'signatur'),
  ], { next: 'ende' }),
  knoten('nichts', [H('Gute Antwort. Teure Antwort. Ich merk sie mir.', 'freude')], { next: 'ende' }),
  knoten('ende', [
    erz('Unter dem Tresen steht ab heute eine Kiste mit dem Aufkleber „NOTFALL – HUNTER“. Zwei Nougatbomben wandern in deine Tasche. Hunter guckt weg. Sehr bewusst.'),
  ], { effects: [{ give: 'nougatbombe', qty: 2 }, flag('hunter_liebt_nougat'), { xp: 50 }, herz('hunter', 30), { message: 'Hunter liebt jetzt Nougatbomben.' }] }),
]);

const he6 = dialog('he-hunter-6', [
  knoten('start', [
    erz('Nebel über dem Hafenbecken. Am Angelsteg sitzen zwei Männer auf umgedrehten Bierkisten: Käpt’n Nebelhorn mit Pfeife – und Hunter, im Seidenhemd, mit Sonnenbrille, um sechs Uhr morgens.'),
    N('Ahoi! Der Boss hat gesagt, du kommst. Der Boss hat auch gesagt, du kommst pünktlich. Der Boss hat gewettet.'),
    H('Ich hab gewonnen. Setz dich. Die Rute da. Nein, die andere. Die da ist Nebelhorns, die beißt.'),
  ], {
    choices: [
      {
        text: 'Auswerfen. Mal sehen, was beißt.', next: 'meer',
        effects: [{
          minigame: 'akt-angeln', level: 1, key: 'he-hunter-6-angeln', label: 'Angeln mit Hunter',
          win: [herz('hunter', 20), { message: 'Ein Fisch! Ein echter! Er sieht beleidigt aus.' }],
          lose: [{ give: 'rostige-dose' }, { message: 'Eine rostige Dose. Hunter nickt anerkennend: „Zählt auch.“' }],
        }],
      },
      { text: 'Ich guck lieber zu und klau Nebelhorns Kaffee.', next: 'meer' },
    ],
  }),
  knoten('meer', [
    H('Weißt du, was das Schöne am Angeln ist? Keiner schuldet keinem was. Der Fisch beißt oder nicht. Ehrliche Geschäfte.'),
    N('Hinter der Flutmauer, Junge, da ist es blau. Richtig blau. Hab’s gesehen, einundsechzig. Oder zweiundsechzig. Da war Rum im Spiel.'),
    H('Das Meer. Ja. Jeder hier unten redet vom Meer, keiner war da.', 'besorgt'),
    H('Ich hab da eine Idee. Nicht lachen. … Ein Club. Am Strand. Sand statt Kippen. Echte Wellen statt Nebelmaschine. Und kein Ripper.'),
  ], {
    choices: [
      { text: '„Wenn du den Strandclub baust, will ich die Bar.“', check: pruefung('he-hunter-6-bar', 'ausstrahlung', 6, ['verhandeln']), next: 'bar', effects: [herz('hunter', 40)] },
      { text: '„Draußen träumen alle von Wasser. Du träumst wenigstens groß.“', tag: '[Ödnis]', when: { origin: 'origin-oednis' }, next: 'oednis', effects: [herz('hunter', 30)] },
      { text: '„Strandclub? Klingt nach dir.“', next: 'nett', effects: [herz('hunter', 25)] },
      { text: '„Das Meer ist ein Märchen, Hunter.“', next: 'maerchen', effects: [herz('hunter', 5)] },
    ],
  }),
  knoten('bar', [
    H('Die Bar. Ha!', 'freude'),
    erz('Hunter lacht. Kurz, laut, überrascht von sich selbst. Nebelhorn verschluckt sich an der Pfeife.'),
    H('Die Bar kriegst du. Aber du zahlst Miete. In Cocktails. Mit Schirmchen.'),
  ], { next: 'ende' }),
  knoten('oednis', [H('Groß träumen ist billig. Groß bauen nicht. Aber danke. Wirklich.', 'besorgt')], { next: 'ende' }),
  knoten('nett', [H('Nach mir? Ein Club, in dem man barfuß rumläuft? … Ja. Vielleicht genau deswegen.')], { next: 'ende' }),
  knoten('maerchen', [
    N('MÄRCHEN? Ich hab da Möwen gesehen! Echte! Die haben mir das Brot geklaut, die Biester!'),
    H('Lass gut sein, Käpt’n. Wer nicht träumt, zahlt wenigstens pünktlich.'),
  ], { next: 'ende' }),
  knoten('ende', [
    erz('Die Sonne kriecht über die Kräne. Hunter sieht eine Weile aufs graue Wasser. Dann zu dir.'),
    H('{name}.', 'freude'),
    erz('Zum ersten Mal sagt er deinen Namen. Nicht „Neuling“.'),
    H('Gewöhn dich nicht dran. … Nächsten Sonntag bringst du Kaffee mit.', 'signatur'),
  ], { effects: [flag('hunter_strandclub_idee'), flag('hunter_nennt_namen'), herz('kaeptn-nebelhorn', 20), herz('hunter', 30), { xp: 80 }] }),
]);

// ♥8 und ♥10 ab Akt 2 (nach dem Countdown oder im Nachspiel), world.md §4.2 und §4.7 „Nach Ladenschluss“.
const ROMANZE_FREI: Condition = { all: [ROM, frei('hunter')] };

const he8 = dialog('he-hunter-8', [
  knoten('start', [
    erz('Hinterzimmer, nach Ladenschluss. Unten stapelt Bruno die Stühle, oben summt die Lüftung. Hunter steht vor der Fotowand, in der Hand eine Flasche ohne Etikett und zwei Gläser, die nicht zusammenpassen.'),
    H('Eisenhof-Reserve. Hab ich am Tag meiner Entlassung gekauft. Für den Tag, an dem ich sie mit jemandem trinke, der mir nichts schuldet.', 'besorgt'),
    erz('In der Mitte der Wand ein Foto, das älter ist als der Club: Hunter mit Haaren, Raven ohne Narben, Dante mit einem Funkgerät so groß wie ein Toaster, Vega halb hinter einem Fernrohr. Und am Rand, im Schatten, ein Mann mit Goldknauf-Stock, der als Einziger in die Kamera lächelt.'),
    H('Das sind wir. Vor sieben Jahren. Drei Tage vor Digitech.'),
    H('Blade und ich haben uns mit neunzehn auf dem Schrottmarkt kennengelernt. Er hat mir zwanzig Credits geliehen. Für meinen ersten Barhocker. Er hat gesagt: „Schulden muss man immer begleichen, Hunter.“', 'trauer'),
    H('Den Satz hab ich von ihm. Und er hat seine nie bezahlt. Nicht eine.', 'wut'),
  ], {
    choices: [
      {
        text: '„Guck dir seine Hand an. Die steckt in deiner Jackentasche.“', check: pruefung('he-hunter-8-hand', 'strasse', 6, ['beobachten']),
        next: 'hand', effects: [herz('hunter', 40), flag('hunter_feuerzeug')],
      },
      {
        text: '„Häng ihn ab. Er gehört nicht zur Crew.“', check: pruefung('he-hunter-8-abhaengen', 'ausstrahlung', 6, ['ueberzeugen']),
        next: 'abhaengen', effects: [herz('hunter', 40), flag('hunter_blade_foto_ab')],
      },
      { text: '„Drei Jahre Wand. Und du hängst dir sein Gesicht an die nächste.“', tag: '[Knast]', when: { origin: 'origin-knastvogel' }, next: 'knast', effects: [herz('hunter', 35)] },
      { text: '„Warum hängt er überhaupt noch da?“', next: 'warum', effects: [herz('hunter', 25)] },
    ],
  }),
  knoten('hand', [
    erz('Hunter beugt sich vor. Nimmt die Sonnenbrille ab, nur einen Spalt. Auf dem Foto steckt Blades linke Hand tatsächlich in Hunters Jackentasche, ganz beiläufig, als gehöre sie dahin.'),
    H('Mein Feuerzeug. Das silberne. Ich hab’s sieben Jahre gesucht. Ich hab RIPPER verdächtigt. Ich hab Ripper drei Wochen lang kein Wechselgeld gegeben.', 'ueberrascht'),
    erz('Und dann lacht er. Nicht kurz. Lange, mit dem Kopf an der Wand, bis die Gläser auf dem Tablett klirren.'),
    H('Der Mistkerl hat mich schon beklaut, während er für ein Foto gelächelt hat. Das ist … das ist fast schon Kunst.'),
  ], { next: 'schluessel' }),
  knoten('abhaengen', [
    H('Abhängen. Hm.', 'besorgt'),
    erz('Er zögert. Dann zieht er die Reißzwecke raus, faltet das Foto so, dass nur noch vier Gesichter zu sehen sind, und hängt es wieder auf. Den Rand mit dem Goldknauf steckt er in Jimmys Kiste.'),
    H('Da liegt er gut. Zwischen einer angebissenen Nougatbombe und einem Schuldschein über vierzig Credits. Ehrlichere Gesellschaft hatte er nie.', 'signatur'),
  ], { next: 'schluessel' }),
  knoten('knast', [
    H('… Ja. Hab ich.', 'trauer'),
    H('Im Eisenhof hatte ich nichts an der Wand. Durfte man nicht. Ich hab mir sein Gesicht trotzdem jeden Abend vorgestellt. Damit ich weiß, wofür ich rechne.'),
    H('Vielleicht ist es Zeit, mit dem Rechnen aufzuhören. Vielleicht. Nicht heute.'),
  ], { next: 'schluessel' }),
  knoten('warum', [
    H('Damit ich nie vergess, wie Verrat aussieht. Er lächelt. Immer. Wer bei einem Bruch lächelt, hat schon ausgerechnet, wie viel er allein kriegt.', 'wut'),
    H('Und damit ich nie vergess, wie wir ausgesehen haben, bevor er’s ausgerechnet hat.', 'trauer'),
  ], { next: 'schluessel' }),
  knoten('schluessel', [
    erz('Hunter schenkt ein. Zwei Finger breit, sehr genau. Dann legt er dir einen schweren Messingschlüssel neben das Glas.'),
    H('Der Hinterzimmerschlüssel. Hat nur einer außer mir. Hatte. Jetzt hast du ihn.'),
    H('Er passt auch an die Hausbar da unterm Schreibtisch. Eine Sache pro Tag. Nicht mehr. Ich zähl nach. Ich zähl immer nach.', 'signatur'),
    H('Wer den hat, gehört dazu. Verlier ihn, und ich verlier dich. So einfach ist das. So schwer.'),
  ], {
    effects: [flag('hunter_hinterzimmer_schluessel'), { message: 'Hinterzimmerschlüssel: Hunters Hausbar im Hinterzimmer (einmal pro Tag).' }],
    choices: [
      { text: '„Auf die, die noch da sind.“', next: 'freund' },
      { text: '„Ich pass drauf auf. Und auf dich.“', next: 'freund', effects: [herz('hunter', 10)] },
      { text: '„Und jetzt? Legst du eine Platte auf?“', tag: '[Romanze]', when: ROMANZE_FREI, next: 'tanz' },
    ],
  }),
  knoten('freund', [
    erz('Ihr stoßt an. Die Eisenhof-Reserve schmeckt nach Rauch, Rost und sehr viel Geduld.'),
    H('Auf die, die noch da sind. Und auf Nyra. Die ist auch noch da. Nur woanders. Wir holen sie.', 'trauer'),
    H('Weißt du, warum ich in die Ödnis wollte? Nicht wegen der Ziegen. Weil man da keinem trauen muss. Da ist ja keiner.'),
    H('Blöde Idee. Ich trau euch. Das ist viel anstrengender. Und viel besser.', 'freude'),
    H('So. Raus jetzt, bevor ich sentimental werde. Sentimental ist schlecht fürs Geschäft. Und die Flasche bleibt hier.', 'signatur'),
  ], { effects: [herz('hunter', 40), { xp: 120 }] }),
  knoten('tanz', [
    erz('Er stellt das Glas ab. Sieht dich lange an, über den Rand der Brille. Dann holt er eine Platte aus dem Regal hinter der Fotowand, eine mit einem Kaffeering auf der Hülle, und legt sie auf den alten Koffer-Plattenspieler.'),
    erz('Etwas Langsames, Knisterndes. Seine Hand findet deinen Rücken, warm durch den Stoff, unsicher wie ein Mann, der zum ersten Mal ohne Kassenbuch etwas zählt.'),
    H('Ich tanz nicht. Ich hab nie getanzt. Sag’s keinem, sonst bist du gefeuert.', 'verlegen'),
  ], {
    choices: [
      { text: '„Dann führ ich.“', check: pruefung('he-hunter-8-fuehren', 'ausstrahlung', 6, ['flirt']), next: 'fuehren', effects: [herz('hunter', 60)] },
      { text: '„Ich sag’s nur allen.“', next: 'allen', effects: [herz('hunter', 50)] },
    ],
  }),
  knoten('fuehren', [
    erz('Du übernimmst. Hunter stolpert genau einmal, dann nicht mehr. Und dann lacht er laut, mit dem ganzen Bauch, und vergisst, die Brille geradezurücken.'),
    H('Du bist gefährlich. Ich hab gewusst, dass du gefährlich bist. Pünktliche Leute sind immer gefährlich.', 'zaertlich'),
    H('Babettes Garküche. Ein Abend, an dem sie aufhat. Ich lad dich ein. Das ist kein Vorschlag, das ist eine Reservierung.', 'signatur'),
  ], { effects: [flag('hunter_romanze_tanz'), flag('hunter_date_geplant'), { xp: 120 }] }),
  knoten('allen', [
    H('Dann erzähl ich allen, wie du dabei geguckt hast.', 'signatur'),
    erz('Ihr tanzt trotzdem. Schlecht. Lange. Bis die Platte knackt und keiner von euch loslässt.'),
    H('… Babettes Garküche. Ein Abend, an dem sie aufhat. Ich lad dich ein. Wehe, du sagst nein. Wehe, du sagst es so, dass ich es merke.', 'verlegen'),
  ], { effects: [flag('hunter_romanze_tanz'), flag('hunter_date_geplant'), { xp: 120 }] }),
]);

/** Romanze-Station zwischen ♥8 und ♥10: das Date bei Babette (world.md §4.7 „Ablauf“: Abendessen bei Babette). */
const date = dialog('rom-hunter-date', [
  knoten('start', [
    erz('Babettes Garküche, abends. Dampf, Lampions, das Klappern von Stäbchen. Am hintersten Tisch sitzt Hunter, sehr gerade, und hat sich ganz offensichtlich die Haare gekämmt. Zweimal.'),
    BB('Hunter! Mit Begleitung! Hunter hat BEGLEITUNG! Ich hol die guten Stäbchen. Die, die nicht splittern!'),
    H('Babette. Bitte. Ich bin ein Geschäftsmann.', 'verlegen'),
    BB('Du bist ein Geschäftsmann, der seit vier Jahren allein Dampfnudeln isst. Setz dich, Schätzchen. Er beißt nicht. Nur, wenn er hungrig ist.'),
  ], {
    choices: [
      { text: '„Das rosa Hemd. Für mich?“', when: { flag: 'hunter_date_rosa' }, next: 'rosa' },
      { text: 'Hinsetzen. Ihm gegenüber.', next: 'essen' },
    ],
  }),
  knoten('rosa', [
    H('Du hast gefragt. Ich hab gehört. Das passiert nicht oft. Genieß es.', 'signatur'),
    erz('Es ist das rosa Seidenhemd. Frisch gebügelt. Er hat die Knöpfe bis oben zugemacht und dann einen wieder auf. Man sieht, dass er lange darüber nachgedacht hat.'),
  ], { next: 'essen', effects: [herz('hunter', 10)] }),
  knoten('essen', [
    erz('Zwei Teller Dampfnudeln, eine Kanne Tee, der nach Rauch schmeckt. Hunter greift nach seiner Brieftasche, bevor das Essen überhaupt steht.'),
    H('Ich zahl. Jetzt. Vorher. Dann ist es erledigt, und ich kann mich auf … das hier konzentrieren.', 'besorgt'),
  ], {
    choices: [
      { text: '„Steck das weg. Ich lad dich ein.“', when: { credits: 30 }, next: 'einladen', effects: [{ credits: -30 }, herz('hunter', 50)] },
      { text: '„Babette, schreib’s Ripper an.“', check: pruefung('rom-hunter-date-ripper', 'strasse', 5, ['trick']), next: 'ripper', effects: [herz('hunter', 40)] },
      { text: 'Eine Dampfnudel nehmen und sie ihm hinhalten. „Mund auf.“', check: pruefung('rom-hunter-date-futtern', 'ausstrahlung', 6, ['flirt']), next: 'futtern', effects: [herz('hunter', 50)] },
      { text: 'Ihn zahlen lassen.', next: 'zahlen', effects: [herz('hunter', 30)] },
    ],
  }),
  knoten('einladen', [
    H('Du … lädst mich ein. Mich.', 'ueberrascht'),
    H('Mich hat noch nie einer eingeladen. Ich hab immer bezahlt. Für alle. Seit ich neunzehn bin. Das ist … Ich weiß nicht, wohin mit meinen Händen.', 'verlegen'),
    erz('Du schon. Du nimmst eine davon über den Tisch. Sie ist groß, warm und ein bisschen feucht.'),
    H('Das ist der Dampf. Von den Nudeln.', 'verlegen'),
  ], { next: 'spaziergang' }),
  knoten('ripper', [
    BB('Ripper? Der hat bei mir eh schon eine Seite. Eine Zeile mehr merkt der nicht. Der kann nicht lesen, wenn er nüchtern ist.'),
    H('Du bist ein schlechter Mensch. Ich mag schlechte Menschen. Ich mag dich.', 'freude'),
    H('… Das war zu schnell. Streich den letzten Satz. Nein. Lass ihn stehen.', 'verlegen'),
  ], { next: 'spaziergang' }),
  knoten('futtern', [
    erz('Hunter sieht die Dampfnudel an. Dann dich. Dann Babette, die hinter der Theke so tut, als würde sie Gemüse schneiden, und dabei seit einer Minute dieselbe Möhre hält.'),
    H('Das hast du bei der Diva gelernt. Das ist Erpressung mit Teig.', 'verlegen'),
    erz('Er macht den Mund auf. Er wird rot bis zu den Ohren. Hunter. Rot. Babette lässt die Möhre fallen.'),
  ], { next: 'spaziergang' }),
  knoten('zahlen', [
    H('Siehst du. Erledigt. Jetzt kann ich atmen.', 'signatur'),
    erz('Er atmet. Er isst. Und irgendwann, ohne hinzusehen, schiebt er dir die letzte Dampfnudel rüber. Bei Hunter ist das ungefähr ein Heiratsantrag.'),
  ], { next: 'spaziergang' }),
  knoten('spaziergang', [
    erz('Später. Der Markt schläft, die Lampions schaukeln. Ihr lauft zwischen den geschlossenen Ständen durch, und irgendwann ist seine Hand in deiner, und keiner von euch hat es angefangen.'),
    H('Ich bin Anfang fünfzig. Ich hab einen Club, zwei Vorstrafen und einen Plan für einen Strand, den ich nie gesehen hab.', 'besorgt'),
    H('Ich bin nicht gut in so was. Ich weiß nur, wie man Schulden zählt. Und du bist die erste Rechnung, die ich nicht begleichen will. Ich will, dass sie offen bleibt.', 'zaertlich'),
  ], {
    choices: [
      { text: 'Seine Hand drücken. Nichts sagen.', next: 'ende' },
      { text: '„Dann lass anschreiben, Hunter.“', next: 'ende', effects: [herz('hunter', 10)] },
    ],
  }),
  knoten('ende', [
    erz('Vor dem High Voltage bleibt er stehen und lässt deine Hand los, als hätte er gerade gemerkt, dass Bruno guckt. Bruno guckt.'),
    H('Gute Nacht, {name}. Das war … pünktlich.', 'zaertlich'),
  ], { effects: [flag('hunter_date'), { cutscene: 'szene-rom-hunter-date' }, herz('hunter', 40), { xp: 80 }] }),
]);

const he10 = dialog('he-hunter-10', [
  knoten('start', [
    erz('Der Club ist voll bis unter die Neonbögen. Hunter steigt auf den Tresen. Auf den Tresen! Der Barkeeper hält sich die Augen zu, Bruno die Ohren, Mixi piept panisch.'),
    H('Ruhe! RUHE! … Danke. Glas hoch.'),
    H('Vor ein paar Monaten kam hier einer rein, siebenundvierzig Minuten zu spät, weil die U-Bahn eine Meinung hatte. Ich hab gesagt: Probezeit.', 'signatur'),
    H('Die Probezeit ist vorbei. Auf {name}! Wer den Laden zusammenhält, wenn ich’s nicht kann.', 'freude'),
    erz('Der Club brüllt. Ripper weint in sein Bier. Und alle gucken auf dich.'),
  ], {
    choices: [
      {
        text: 'Auch auf den Tresen steigen und eine Rede halten.', check: pruefung('he-hunter-10-rede', 'ausstrahlung', 7, ['rede']),
        next: 'rede', effects: [herz('hunter', 30), { rep: 'crew-hunter', delta: 10 }],
      },
      { text: '„Steig da runter, bevor Bruno dich runterholt.“', check: pruefung('he-hunter-10-bruno', 'strasse', 5, ['spott']), next: 'bruno', effects: [herz('hunter', 25)] },
      { text: 'Glas hoch. „Auf die Crew!“', next: 'crew', effects: [herz('hunter', 20)] },
    ],
  }),
  knoten('rede', [
    erz('Du kletterst hoch. Der Tresen knarzt. Unter dir ein Meer aus Gläsern, über dir die Neonbögen.'),
    ich('Ich bin zu spät gekommen. Ich bin geblieben. Und ich hab gelernt: Schulden muss man immer begleichen. Also: Die nächste Runde geht auf Hunter!'),
    H('WAS?', 'ueberrascht'),
    erz('Der Club explodiert. Hunter guckt dich an, als hättest du gerade seine Kasse angezündet. Dann lacht er, laut, mit dem ganzen Bauch, und nickt dem Barkeeper zu. Eine Runde. Eine.'),
  ], { next: 'leer' }),
  knoten('bruno', [
    H('Bruno würde nie –', 'signatur'),
    erz('Bruno setzt sich in Bewegung. Hunter springt runter, schneller als jeder Fünfzigjährige springen sollte, und landet mit Würde. Fast.'),
    H('Gute Instinkte. Schlechte Manieren. Genau richtig für eine Teilhaberschaft.', 'freude'),
  ], { next: 'leer' }),
  knoten('crew', [erz('„AUF DIE CREW!“ Zweihundert Gläser. Ein Geräusch wie ein Gewitter aus Glas. Hunter nickt dir zu, und in dem Nicken steckt mehr als in jeder Rede.')], { next: 'leer' }),
  knoten('leer', [
    erz('Stunden später. Umgedrehte Stühle, klebriger Boden, das Summen der Kühlschränke. Hunter sitzt auf dem Tresen, die Füße baumeln. Er nimmt die Sonnenbrille ab. Zum ersten Mal, seit du ihn kennst.'),
    erz('Seine Augen sind braun. Müde. Freundlicher, als die Brille je zugegeben hätte.'),
    H('Hier. Bierdeckel-Vertrag. Hat der Barkeeper aufgesetzt, Bruno war Zeuge, Mixi hat gepiept.', 'signatur'),
    erz('Auf einem Bierdeckel, in Hunters enger Handschrift: „Teilhaberschaft High Voltage. 50/50. Gewinne montags. Schulden … reden wir drüber.“'),
    H('Teilhaber. Das heißt, du kriegst die Hälfte vom Laden. Die Hälfte der Schulden auch, aber über die reden wir nicht.'),
  ], {
    choices: [
      { text: 'Unterschreiben.', next: 'brille', effects: [flag('hunter_teilhaber')] },
      {
        text: '„Fünfzig-fünfzig. Und die Notfallkiste unterm Tresen gehört mir.“', check: pruefung('he-hunter-10-vertrag', 'strasse', 7, ['verhandeln']),
        next: 'verhandelt', effects: [flag('hunter_teilhaber'), flag('hunter_teilhaber_verhandelt')],
      },
      { text: '„Ich will keinen Laden, Hunter. Nur meinen Hocker.“', next: 'hocker', effects: [flag('hunter_teilhaber')] },
    ],
  }),
  knoten('verhandelt', [
    H('Die Notfallkiste. Die NOTFALLKISTE.', 'wut'),
    H('… Halsabschneider. Ich hab dir alles beigebracht. Unterschrieben. Aber die Hälfte der Nougatbomben bleibt meine. Notfall ist Notfall.', 'freude'),
  ], { next: 'brille' }),
  knoten('hocker', [
    H('Den hast du sowieso. Mit Namensschild. Raven hat ihres abgemacht, deins bleibt dran.', 'zaertlich'),
    H('Unterschreib trotzdem. Ich will, dass es irgendwo steht. Auf Papier. Ich hab zu lange mit Sachen gelebt, die nirgendwo stehen.'),
    erz('Du unterschreibst. Auf einem Bierdeckel. Es ist das Verbindlichste, was du je unterschrieben hast.'),
  ], { next: 'brille' }),
  knoten('brille', [
    erz('Hunter klappt die Sonnenbrille zusammen und legt sie dir in die Hand.'),
    H('Meine Brille. Für die wichtigen Momente. Ich brauch sie heute nicht mehr. Ich will heute sehen, was ich sehe.'),
  ], {
    effects: [
      { give: 'hunters-sonnenbrille' }, { xp: 200 }, herz('hunter', 30),
      { message: 'Teilhaber im High Voltage: Gewinnanteil jeden Montag.' },
    ],
    choices: [
      { text: '„Partner. Auf uns.“', next: 'partner' },
      { text: '„Die Hälfte vom Laden. Und der Rest?“', tag: '[Romanze]', when: { all: [ROMANZE_FREI, { flag: 'hunter_romanze_tanz' }] }, next: 'rest' },
    ],
  }),
  knoten('partner', [
    H('Auf uns. Und jetzt fegst du. Teilhaber fegen zuerst. Steht im Kleingedruckten.', 'freude'),
    H('{name}? … Danke. Für alles, was du nicht weißt. Das ist mehr, als du denkst.', 'trauer'),
  ], { effects: [herz('hunter', 20)] }),
  knoten('rest', [
    H('Und von mir, wenn du willst. Ich bin nicht billig. Aber ich bin treu.', 'zaertlich'),
  ], {
    choices: [
      { text: 'Ihn küssen.', next: 'kuss', effects: [{ cutscene: 'szene-rom-hunter-bar' }, herz('hunter', 60)] },
      { text: '„Ich will. Aber langsam.“', next: 'langsam', effects: [herz('hunter', 50)] },
    ],
  }),
  knoten('kuss', [
    erz('Zwischen umgedrehten Stühlen, Stirn an Stirn im Gegenlicht der Neonbögen. Er schmeckt nach Synth-Kaffee und Nougat und nach drei Jahren, die er niemandem erzählt hat. Seine Hand liegt in deinem Nacken, als hätte sie da schon immer hingehört.'),
    H('… Das stand nicht im Kassenbuch.', 'verlegen'),
  ], { next: 'nacht', effects: [flag('hunter_romanze_zusammen')] }),
  knoten('langsam', [
    H('Langsam kann ich. Ich hab drei Jahre gewartet, um diesen Laden aufzumachen.'),
    erz('Er küsst dich auf die Stirn. Ganz kurz. Dann tut er so, als wäre eine Fliege da gewesen.'),
  ], { next: 'nacht', effects: [flag('hunter_romanze_zusammen')] }),
  knoten('nacht', [
    erz('Hunter dreht das Schild an der Tür auf „Geschlossen“ und lehnt sich dagegen.'),
    H('Die Bar ist zu. Ich nicht.', 'signatur'),
  ], {
    choices: [
      { text: 'Bleiben.', effects: [flag('hunter_nacht'), flag('woche_hunter_nacht'), { cutscene: 'szene-hunter-nacht' }] },
      { text: '„Ein andermal, Teilhaber.“', next: 'andermal' },
    ],
  }),
  knoten('andermal', [H('Ein andermal. Ich schreib’s dir an. Mit Zinsen.', 'signatur')]),
]);

/** Morgen danach (world.md §4.7): Hunters Zeile, dann Frühstück im High Voltage mit der Crew. */
const morgenDanach = dialog('hunter-morgen-danach', [
  knoten('start', [
    erz('Morgen. Licht durch die Lamellen des Hinterzimmers. Es riecht nach Kaffee und nach einem Mann, der zu viel Rasierwasser für einen Dienstag benutzt.'),
    erz('Hunter, rosa Seidenhemd, zwei Tassen Synth-Kaffee, eine davon mit „CHEF“ beschriftet. Er gibt dir die andere.'),
    H('Du schnarchst. Wie eine Kaffeemaschine. Ich hab’s vermisst, dass einer schnarcht.', 'zaertlich'),
  ], {
    choices: [
      { text: '„Du redest im Schlaf. Über Wechselgeld.“', next: 'fruehstueck', effects: [herz('hunter', 10)] },
      { text: 'Die Tasse mit „CHEF“ klauen.', next: 'fruehstueck', effects: [herz('hunter', 15)] },
    ],
  }),
  knoten('fruehstueck', [
    erz('Frühstück im High Voltage. Ihr kommt die Treppe runter. Nebeneinander. Das war ein Fehler.'),
    D('Hunter grinst. HUNTER GRINST. Ruft einen Arzt! Ruft zwei!', 'ueberrascht'),
    A('Boss, du hast Lippenstift am Kragen. Ach nee, das ist Ketchup. Oder?', 'signatur'),
    RP('Alle Implantate noch dran? Ich frag nur, weil ich Garantie gebe. Auf Teile, nicht auf Herzen.'),
    H('Wer noch ein Wort sagt, zahlt seinen Kaffee. Ab heute. Für immer.', 'wut'),
    erz('Stille. Dann flüstert Dante: „Es hat sich gelohnt.“ und zahlt seinen Kaffee.'),
  ], { effects: [{ checkBuff: { id: 'beschwingt-hunter', label: 'Beschwingt', value: 1, attribute: 'ausstrahlung', forDays: 0, consumes: false } }, { message: 'Beschwingt: +1 Ausstrahlung bis Mitternacht.' }] }),
]);

/** „Kommst du nachher noch hoch?“ – höchstens einmal pro Woche (Flag woche_hunter_nacht fällt montags). */
const morgenWoche = dialog('hunter-morgen-woche', [
  knoten('start', [
    erz('Morgen. Zwei Tassen Kaffee auf dem Schreibtisch, eine mit „CHEF“, eine mit deinem Namen. Die ist neu.'),
    H('Hab sie machen lassen. Bei Pim. Sag nichts. Die Buchstaben sind schief, weil Pim beim Gravieren gekichert hat.', 'verlegen'),
  ], { effects: [{ checkBuff: { id: 'beschwingt-hunter', label: 'Beschwingt', value: 1, attribute: 'ausstrahlung', forDays: 0, consumes: false } }, { message: 'Beschwingt: +1 Ausstrahlung bis Mitternacht.' }, herz('hunter', 10)] }),
]);

/** Eifersucht und Trennung (world.md §4.7): Warnung bei der ersten Annäherung an eine andere Figur, beim zweiten Mal Schluss. */
const eifersucht = dialog('hunter-eifersucht', [
  knoten('start', [
    H('Ich hab gesehen, wie du geguckt hast. Noch einmal und ich zieh dir die Ohren lang.', 'wut'),
    H('Ich bin Anfang fünfzig. Ich hab keine Zeit für Spielchen. Ich hab gesagt, ich bin treu. Ich hab nicht gesagt, ich bin blöd.'),
  ], {
    effects: [flag('hunter_eifersucht_gewarnt'), ...FLIRT_FREMD.map((f) => flag(f, false))],
    choices: [
      { text: '„War nur Gerede, Hunter.“', next: 'gerede' },
      { text: '„Eifersüchtig steht dir.“', check: pruefung('hunter-eifersucht-frech', 'ausstrahlung', 7, ['flirt']), next: 'steht' },
    ],
  }),
  knoten('gerede', [H('Gerede kostet Getränke. Und das hier war ein teures.', 'signatur')]),
  knoten('steht', [H('… Halt die Klappe. Und hör nicht auf, so zu gucken. Nur nicht bei anderen.', 'verlegen')]),
]);
const trennung = dialog('hunter-trennung', [
  knoten('start', [
    erz('Hunter wartet nicht hinter dem Tresen. Er wartet davor. Die Sonnenbrille ist auf, und zwar ganz.'),
    H('Zweimal. Ich hab’s dir gesagt. Ich sag’s nicht dreimal. Ich bin kein Papagei.', 'wut'),
    H('Wir sind fertig. Nicht als Teilhaber. Nicht als Crew. Nur … das andere.', 'trauer'),
  ], {
    effects: [
      herz('hunter', -150), flag('hunter_romanze_zusammen', false), flag('hunter_nacht', false), flag('hunter_getrennt'),
      ...FLIRT_FREMD.map((f) => flag(f, false)),
    ],
    choices: [
      { text: '„Es tut mir leid.“', next: 'leid' },
      { text: '„Dann ist es eben vorbei.“', next: 'vorbei' },
    ],
  }),
  knoten('leid', [H('Ich weiß. Mir auch. Das ist das Schlimme dran.', 'trauer')]),
  knoten('vorbei', [H('Ja. Ist es. Dein Kaffee kostet ab heute wieder.', 'wut')]),
]);

// ---------------------------------------------------------------------------------------------- Figur

const A23 = hunter23(M);

/** Hausbar im Hinterzimmer (Belohnung he-hunter-8): eine Sache pro Tag. */
const hausbar = dialog('hunter-hausbar', [
  knoten('start', [erz('Unter dem Schreibtisch, hinter einer Klappe mit Messingschloss: Hunters Hausbar. Zwei Regale, sauber sortiert, mit Zettel: „Eine. EINE. – H.“')], {
    choices: [
      { text: 'Eine Nougatbombe aus der Notfallkiste.', effects: [{ give: 'nougatbombe' }] },
      { text: 'Einen Synth-Kaffee, schwarz wie Hunters Laune.', effects: [{ give: 'synth-kaffee' }] },
      { text: 'Ein Medipflaster aus der Erste-Hilfe-Dose.', effects: [{ give: 'medipflaster' }] },
    ],
  }),
]);

const hunter: NpcDef = {
  id: 'hunter',
  name: 'Hunter',
  portrait: 'hunter',
  sprite: 'hunter-walk',
  faction: 'crew-hunter',
  romanceable: true,
  bio: 'Chef der Crew und Wirt des High Voltage. Anfang 50, Sonnenbrille, Seidenhemd, Bauchgefühl für Geld. Saß drei Jahre wegen Blade. Hasst Unpünktlichkeit und offene Schulden.',
  gifts: {
    loves: ['beglichener-schuldschein', 'rosa-seidenhemd', 'sonnenbrille-gold', 'stoppuhr-takt'],
    likes: ['kassenbuch', 'synth-kaffee', 'bao-dampfnudel', 'poster-hv', 'strandclub-prospekt', 'echtobst-apfel', 'hofhonig'],
    dislikes: ['tai-chi-tee', 'kartendeck'],
    hates: ['kanalschlamm', 'virus-implantat', 'kronkorkenkrone', 'nougatbombe', 'rostige-dose'],
  },
  giftVariants: [
    {
      // Nach he-hunter-4 liebt er Nougatbomben; nach side-thai-chi ist Tee kein Feind mehr.
      when: { all: [{ flag: 'hunter_liebt_nougat' }, { quest: 'side-thai-chi', state: 'done' }] },
      gifts: {
        loves: ['beglichener-schuldschein', 'rosa-seidenhemd', 'sonnenbrille-gold', 'stoppuhr-takt', 'nougatbombe'],
        likes: ['kassenbuch', 'synth-kaffee', 'bao-dampfnudel', 'poster-hv', 'strandclub-prospekt', 'echtobst-apfel', 'hofhonig', 'tai-chi-tee'],
        dislikes: ['kartendeck'],
        hates: ['kanalschlamm', 'virus-implantat', 'kronkorkenkrone', 'rostige-dose'],
      },
    },
    {
      when: { flag: 'hunter_liebt_nougat' },
      gifts: {
        loves: ['beglichener-schuldschein', 'rosa-seidenhemd', 'sonnenbrille-gold', 'stoppuhr-takt', 'nougatbombe'],
        likes: ['kassenbuch', 'synth-kaffee', 'bao-dampfnudel', 'poster-hv', 'strandclub-prospekt', 'echtobst-apfel', 'hofhonig'],
        dislikes: ['tai-chi-tee', 'kartendeck'],
        hates: ['kanalschlamm', 'virus-implantat', 'kronkorkenkrone', 'rostige-dose'],
      },
    },
  ],
  schedule: [
    // Akt 2/3/Nachspiel vorangestellt (design/plan/act23.json npcSchedules.hunter).
    ...HUNTER_PLAN_23,
    // he-hunter-2: nach Mitternacht an der Kasse.
    { slot: 'nacht', when: { all: [{ hearts: 'hunter', min: 2 }, neu('he-hunter-2')] }, place: { map: 'high-voltage', at: 'kasse' } },
    { slot: 'morgen', days: ['so'], place: { map: 'hafenkante', at: 'angelsteg' } },
    { slot: 'morgen', place: { map: 'high-voltage', at: 'kasse' } },
    { slot: 'tag', days: ['mo', 'do'], place: { map: 'schrottmarkt', at: 'marktplatz-mitte' } },
    { slot: 'tag', place: { map: 'hv-hinterzimmer', at: 'schreibtisch' } },
    // Montags vertritt er den Barkeeper und mixt schlecht.
    { slot: ['abend', 'nacht'], days: ['mo'], place: { map: 'high-voltage', at: 'tresen' } },
    { slot: ['abend', 'nacht'], place: { map: 'high-voltage', at: 'tresen-ende' } },
  ],
  heartEvents: [
    { id: 'he-hunter-2', hearts: 2, map: 'high-voltage', time: 'nacht', when: { clockBetween: [1440, 1560] }, dialogue: 'he-hunter-2' },
    { id: 'he-hunter-4', hearts: 4, map: 'high-voltage', time: 'abend', when: { quest: 'main-1-probezeit', state: 'done' }, dialogue: 'he-hunter-4' },
    { id: 'he-hunter-6', hearts: 6, map: 'hafenkante', time: 'morgen', when: { weekday: 'so' }, cutscene: 'szene-he-hunter-6', dialogue: 'he-hunter-6' },
    { id: 'he-hunter-8', hearts: 8, map: 'hv-hinterzimmer', time: 'nacht', when: RUHIG, dialogue: 'he-hunter-8' },
    // Romanze-Station Date (zwischen ♥8 und ♥10): Babettes Garküche, abends, nicht am Ruhetag.
    {
      id: 'rom-hunter-date', hearts: 8, map: 'schrottmarkt', time: 'abend',
      when: und(RUHIG, ROM, { flag: 'hunter_date_geplant' }, { not: { weekday: 'mo' } }), dialogue: 'rom-hunter-date',
    },
    {
      id: 'he-hunter-10', hearts: 10, map: 'high-voltage', time: 'nacht',
      // Läuft die Romanze (Tanz bei ♥8), wartet der Höhepunkt auf das Date.
      when: und(RUHIG, { seen: 'he-hunter-8' }, { any: [{ not: ROM }, { notFlag: 'hunter_romanze_tanz' }, { seen: 'rom-hunter-date' }] }),
      dialogue: 'he-hunter-10',
    },
  ],
  companion: {
    // world.md §4.6/§11.2: Hunter kämpft erst ab act2 (Sondermissionen, Finale). Im Master-Modus kommt er nicht mit.
    recruit: { all: [{ act: 2 }, NICHT_MASTER] },
    stats: {
      hp: 56, armor: 2, morale: 90,
      attributes: { technik: 3, koerper: 6, reflexe: 5, ausstrahlung: 7, strasse: 6 },
      weapon: { kind: 'fernkampf', damage: 5, range: 5, hit: 5 },
      abilities: ['hunter-drinks', 'hunter-runde-aufs-haus'],
    },
    // Wächst mit der Stufe (Akt 2/3).
    statsByLevel: [
      { minLevel: 6, hp: 68, armor: 3, morale: 95, attributes: { koerper: 7, ausstrahlung: 8, strasse: 7 }, weapon: { damage: 6, range: 5, hit: 6 } },
      { minLevel: 9, hp: 82, armor: 4, morale: 100, attributes: { koerper: 8, reflexe: 6, ausstrahlung: 9 }, weapon: { damage: 8, range: 6, hit: 6 } },
    ],
    heartAbilities: [{ hearts: 6, ability: 'hunter-schmiere-stehen' }],
    // Nach den Tai-Chi-Stunden (side-thai-chi): Innere Mitte.
    abilityRules: [{ when: { quest: 'side-thai-chi', state: 'done' }, add: 'hunter-innere-mitte' }],
    // Duo „Der Plan“ (world.md §4.6): Hunter + beliebiger Begleiter, beide in der Party, Spielfigur mit beiden ♥6.
    duo: [{
      ability: 'duo-der-plan',
      when: {
        all: [
          { hearts: 'hunter', min: 6 },
          { any: ['raven', 'dante', 'vega', 'aria', 'nyra', 'jimmy'].map((npc): Condition => ({ all: [{ companion: npc }, { hearts: npc, min: 6 }] })) },
        ],
      },
    }],
  },
  partyCheckBonus: [
    { attribute: 'ausstrahlung', tags: ['verhandeln', 'einschuechtern'], value: 1, label: 'Hunter guckt über die Sonnenbrille' },
  ],
  talk: [
    ...A23.talkFirst,
    rede('hunter-tag-rivale', { rival: 'hunter' }),
    rede('hunter-tag-vor-probezeit', { not: PROBEZEIT_DONE }),
    // Eifersucht: heute mit einer anderen freigegebenen Figur geflirtet, während Hunter und die Spielfigur zusammen sind.
    rede('hunter-trennung', und(ZUSAMMEN, HAT_FREMD_GEFLIRTET, { flag: 'hunter_eifersucht_gewarnt' })),
    rede('hunter-eifersucht', und(ZUSAMMEN, HAT_FREMD_GEFLIRTET)),
    rede('hunter-tag-vexaria-tanz', { all: [{ playerIs: 'vex' }, { flag: 'vexaria_eifersucht' }, { notFlag: 'hunter_kommentar_vexaria_tanz' }] }),
    rede('hunter-tag-vexaria-zusammen', { all: [{ playerIs: 'vex' }, { flag: 'aria_kuss' }, { notFlag: 'hunter_kommentar_vexaria_zusammen' }] }),
    rede('hunter-tag-aria-romanze', { all: [{ not: { playerIs: 'vex' } }, { flag: 'aria_romanze_zusammen' }, { notFlag: 'hunter_kommentar_aria_romanze' }] }),
    ...A23.talk,
    rede('hunter-tag-plan', { quest: 'main-1-der-plan', state: 'active' }),
    rede('hunter-tag-zeit', { not: { act: 2 } }, 8),
    rede('hunter-tag-angeln', { all: [{ weekday: 'so' }, { time: 'morgen' }] }),
    rede('hunter-tag-montag', { all: [{ weekday: 'mo' }, { time: ['abend', 'nacht'] }] }),
    ...A23.talkLate,
    rede('hunter-tag-morgen', { time: 'morgen' }),
    rede('hunter-tag-markt', { all: [{ weekday: ['mo', 'do'] }, { time: 'tag' }] }),
    rede('hunter-tag-buero', { time: 'tag' }),
    rede('hunter-tag-vertraut', undefined, 6),
    rede('hunter-tag-bar'),
  ],
};

export const part: ContentPart = {
  npcs: { hunter },
  mapAdditions: {
    'hv-hinterzimmer': {
      hotspots: [{
        id: 'hunter-hausbar', at: 'schreibtisch', label: 'Hunters Hausbar', kind: 'loot', daily: true,
        when: { flag: 'hunter_hinterzimmer_schluessel' }, dialogue: 'hunter-hausbar',
      }],
    },
  },
  // Teilhaberschaft (he-hunter-10): Gewinnanteil montags, nicht im Master-Modus.
  daily: {
    'hunter-gewinnanteil': {
      id: 'hunter-gewinnanteil',
      when: und({ flag: 'hunter_teilhaber' }, { notFlag: 'hunter_teilhaber_verhandelt' }, { weekday: 'mo' }, NICHT_MASTER),
      effects: [{ credits: 150 }, { message: 'Gewinnanteil High Voltage: +150 Cr. „Schulden muss man immer begleichen. Gewinne auch.“ – H.' }],
    },
    'hunter-gewinnanteil-verhandelt': {
      id: 'hunter-gewinnanteil-verhandelt',
      when: und({ flag: 'hunter_teilhaber_verhandelt' }, { weekday: 'mo' }, NICHT_MASTER),
      effects: [{ credits: 220 }, { give: 'nougatbombe' }, { message: 'Gewinnanteil High Voltage: +220 Cr und eine Nougatbombe aus „deiner“ Notfallkiste.' }],
    },
  },
  dialogues: sammle(
    ...A23.dialogues,
    T.rivale, T.vorProbezeit, T.vexariaTanz, T.vexariaZusammen, T.ariaRomanze, T.zeit, T.plan, T.angeln, T.montag,
    T.morgen, T.markt, T.buero, T.vertraut, T.bar,
    he2, he4, he6, he8, date, he10, morgenDanach, morgenWoche, eifersucht, trennung, hausbar,
  ),
  cutscenes: sammleSzenen(
    {
      id: 'szene-he-hunter-6', title: 'Sonntags angeln',
      beats: [
        { image: 'cut-he-hunter-6', pan: 'left', fade: 'in', caption: 'Sonntag, sechs Uhr. Hafenkante.', hold: 1400 },
        { image: 'cut-he-hunter-6', pan: 'in', lines: [N('Der Boss angelt seit vier Sonntagen. Gefangen hat er nix. Glücklich ist er trotzdem. Sag’s ihm nicht.')] },
      ],
    },
    {
      id: 'szene-rom-hunter-bar', title: 'Nach Ladenschluss',
      beats: [{ image: 'cut-rom-hunter-bar', pan: 'in', fade: 'in', caption: 'Umgedrehte Stühle. Neonbögen. Und eine Sonnenbrille, die zum ersten Mal nicht auf seiner Nase sitzt.', hold: 2200 }],
    },
    {
      id: 'szene-hunter-nacht', title: 'Geschlossen', gallery: false,
      beats: [
        { image: 'black', fade: 'in', lines: [H('Licht aus. Kasse zu. Und du … bleibst genau da.', 'zaertlich'), erz('Irgendwo unten fällt ein Barhocker um. Keiner von euch hebt ihn auf.')] },
        abblende('Das Schild an der Tür sagt „Geschlossen“. Das Schild lügt nicht.'),
      ],
      effects: [{ sleep: true }, { dialogue: 'hunter-morgen-danach' }],
    },
    {
      id: 'szene-hunter-nacht-woche', title: 'Früher zu', gallery: false,
      beats: [
        { image: 'black', fade: 'in', lines: [H('Bruno! Feierabend! … Nein, jetzt. JETZT, Bruno.', 'verlegen')] },
        abblende('Zum ersten Mal in der Geschichte des High Voltage schließt der Laden eine Stunde zu früh.'),
      ],
      effects: [{ sleep: true }, { dialogue: 'hunter-morgen-woche' }],
    },
    {
      id: 'szene-rom-hunter-date', title: 'Dampfnudeln für zwei',
      beats: [{ image: 'cut-rom-hunter-date', pan: 'in', fade: 'in', caption: 'Zwei Hände über einem Teller Dampfnudeln. Eine davon gehört einem Mann, der sonst nur Geld festhält.', hold: 2000 }],
    },
  ),
  phone: {
    ...HUNTER_TEL_23,
    'tel-hunter-kasse': {
      id: 'tel-hunter-kasse', from: 'hunter',
      text: 'Nach Mitternacht. Kasse. Bring Finger mit, die zählen können. – H.',
      auto: { all: [{ hearts: 'hunter', min: 2 }, neu('he-hunter-2')] },
    },
    'tel-hunter-angeln': {
      id: 'tel-hunter-angeln', from: 'hunter',
      text: 'Sonntag, sechs Uhr, Hafenkante, Angelsteg. Wer zu spät kommt, wird Köder.',
      auto: { all: [{ hearts: 'hunter', min: 6 }, neu('he-hunter-6')] },
      replies: [{ text: 'Ich bring Kaffee.' }, { text: 'Sechs Uhr?! Bist du krank?' }],
    },
  },
};
