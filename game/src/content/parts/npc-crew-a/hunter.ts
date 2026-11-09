// Hunter – Chef der Crew, Wirt des High Voltage (world.md §4.2, §4.6, §4.7 „Nach Ladenschluss“, §11.2).
// Tagesablauf nach design/plan/act1.json (npcSchedules.hunter), Herz-Ereignisse he-hunter-2/4/6 in Akt 1,
// he-hunter-8/10 angelegt und an act2 gebunden. Begleiter erst ab act2.
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode, NpcDef, Weekday } from '../../../modules/contracts';
import {
  type Menue, abblende, dialog, erz, flag, herz, ich, knoten, neu, pruefung, rede, sammle, sammleSzenen, sprecher,
  tagesgespraech, ZEIT_HINWEIS,
} from './_helfer';

const H = sprecher('hunter');
const N = sprecher('kaeptn-nebelhorn');
const B = sprecher('barkeeper');

const ROM: Condition = { romance: 'hunter' };
const PROBEZEIT_DONE: Condition = { quest: 'main-1-probezeit', state: 'done' };

// ---------------------------------------------------------------------------------------------- Menü

function menue(): Menue {
  const zurueck: DialogueChoice[] = [{ text: 'Noch was, Boss.', next: 'menue', id: 'zurueck' }, { text: 'Bis später.' }];

  /** Flirt-Varianten nach Wochentag (world.md §4.7, Hunter-Flirtzeilen). */
  const flirt = (n: number, tage: Weekday[]): DialogueChoice => ({
    text: 'Mit Hunter flirten.', tag: '[Romanze]', next: `flirt-${n}`, id: `flirt-${n}`,
    when: { all: [ROM, { weekday: tage }] },
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
    flirt(1, ['mo', 'fr']),
    flirt(2, ['di', 'sa']),
    flirt(3, ['mi', 'so']),
    flirt(4, ['do']),
    { text: 'Bis später.' },
  ];

  const nodes: DialogueNode[] = [
    knoten('menue', [H('Noch was? Mach schnell, die Zeit läuft. Meine Zeit. Die ist teuer.')], { choices }),
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

// ♥8 und ♥10: angelegt, erst ab act2 (world.md §11.2).
const he8 = dialog('he-hunter-8', [
  knoten('start', [
    erz('Hinterzimmer, nach Ladenschluss. Hunter steht vor der Fotowand. Ein Bild in der Mitte: Hunter, Raven, Dante, Vega – und am Rand, halb im Schatten, Blade mit dem Goldknauf.'),
    H('Das da sind wir. Vor sieben Jahren. Blade hat sich immer da hingestellt, wo man ihn nicht sieht, wenn’s ernst wird.'),
    H('Drei Jahre hab ich gesessen. Jeden Tag hab ich an diese Wand gedacht. Dann hab ich sie gebaut.', 'trauer'),
    erz('Er legt dir einen schweren Messingschlüssel in die Hand.'),
    H('Der Hinterzimmerschlüssel. Wer den hat, gehört dazu. Verlier ihn, und ich verlier dich.'),
  ], {
    effects: [flag('hunter_hinterzimmer_schluessel')],
    choices: [
      { text: '„Ich pass drauf auf.“', next: 'freund' },
      { text: '„Und jetzt? Legst du eine Platte auf?“', tag: '[Romanze]', when: ROM, next: 'tanz' },
    ],
  }),
  knoten('freund', [
    H('Gut. … Jetzt raus, bevor ich sentimental werde. Sentimental ist schlecht fürs Geschäft.', 'besorgt'),
  ], { effects: [herz('hunter', 40), { xp: 120 }] }),
  knoten('tanz', [
    erz('Er legt eine alte Platte auf. Etwas Langsames, Knisterndes. Seine Hand findet deinen Rücken, warm durch den Stoff, unsicher wie ein Mann, der zum ersten Mal ohne Kassenbuch etwas zählt.'),
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
  ], { effects: [flag('hunter_romanze_tanz'), { xp: 120 }] }),
  knoten('allen', [
    H('Dann erzähl ich allen, wie du dabei geguckt hast.', 'signatur'),
    erz('Ihr tanzt trotzdem. Schlecht. Lange. Bis die Platte knackt und keiner von euch loslässt.'),
  ], { effects: [flag('hunter_romanze_tanz'), { xp: 120 }] }),
]);

const he10 = dialog('he-hunter-10', [
  knoten('start', [
    erz('Der Club ist voll bis unter die Neonbögen. Hunter steigt auf den Tresen. Auf den Tresen! Der Barkeeper hält sich die Augen zu.'),
    H('Ruhe! RUHE! … Danke. Glas hoch.'),
    H('Auf {name}! Wer den Laden zusammenhält, wenn ich’s nicht kann.', 'freude'),
    erz('Der Club brüllt. Stunden später sind nur noch umgedrehte Stühle da. Hunter nimmt die Sonnenbrille ab. Zum ersten Mal.'),
    H('Teilhaber. Das heißt, du kriegst die Hälfte vom Laden. Die Hälfte der Schulden auch, aber über die reden wir nicht.'),
    H('Hier. Meine Brille. Für die wichtigen Momente. Ich brauch sie heute nicht mehr.'),
  ], {
    effects: [{ give: 'hunters-sonnenbrille' }, flag('hunter_teilhaber'), { xp: 200 }],
    choices: [
      { text: '„Partner. Auf uns.“', next: 'partner', effects: [herz('hunter', 50)] },
      { text: '„Die Hälfte vom Laden. Und der Rest?“', tag: '[Romanze]', when: ROM, next: 'rest' },
    ],
  }),
  knoten('partner', [H('Auf uns. Und jetzt fegst du. Teilhaber fegen zuerst.', 'freude')]),
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
      { text: 'Bleiben.', next: 'morgen', effects: [flag('hunter_nacht'), { cutscene: 'szene-hunter-nacht' }] },
      { text: '„Ein andermal, Teilhaber.“', next: 'andermal' },
    ],
  }),
  knoten('morgen', [
    erz('Morgen danach. Hunter, rosa Seidenhemd, zwei Tassen Synth-Kaffee, eine davon mit „CHEF“ beschriftet. Er gibt dir die andere.'),
    H('Du schnarchst. Wie eine Kaffeemaschine. Ich hab’s vermisst, dass einer schnarcht.', 'zaertlich'),
  ], { effects: [{ checkBuff: { id: 'beschwingt-hunter', label: 'Beschwingt', value: 1, attribute: 'ausstrahlung' } }] }),
  knoten('andermal', [H('Ein andermal. Ich schreib’s dir an. Mit Zinsen.', 'signatur')]),
]);

// ---------------------------------------------------------------------------------------------- Figur

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
    { id: 'he-hunter-8', hearts: 8, map: 'hv-hinterzimmer', time: 'nacht', when: { act: 2 }, dialogue: 'he-hunter-8' },
    { id: 'he-hunter-10', hearts: 10, map: 'high-voltage', time: 'nacht', when: { all: [{ act: 2 }, { seen: 'he-hunter-8' }] }, dialogue: 'he-hunter-10' },
  ],
  companion: {
    // world.md §4.6/§11.2: Hunter kämpft erst ab act2 (Sondermissionen, Finale).
    recruit: { act: 2 },
    stats: {
      hp: 56, armor: 2, morale: 90,
      attributes: { technik: 3, koerper: 6, reflexe: 5, ausstrahlung: 7, strasse: 6 },
      weapon: { kind: 'fernkampf', damage: 5, range: 5, hit: 5 },
      abilities: ['hunter-drinks', 'hunter-runde-aufs-haus'],
    },
    heartAbilities: [{ hearts: 6, ability: 'hunter-schmiere-stehen' }],
  },
  partyCheckBonus: [
    { attribute: 'ausstrahlung', tags: ['verhandeln', 'einschuechtern'], value: 1, label: 'Hunter guckt über die Sonnenbrille' },
  ],
  talk: [
    rede('hunter-tag-rivale', { rival: 'hunter' }),
    rede('hunter-tag-vor-probezeit', { not: PROBEZEIT_DONE }),
    rede('hunter-tag-vexaria-tanz', { all: [{ playerIs: 'vex' }, { flag: 'vexaria_eifersucht' }, { notFlag: 'hunter_kommentar_vexaria_tanz' }] }),
    rede('hunter-tag-vexaria-zusammen', { all: [{ playerIs: 'vex' }, { flag: 'aria_kuss' }, { notFlag: 'hunter_kommentar_vexaria_zusammen' }] }),
    rede('hunter-tag-aria-romanze', { all: [{ not: { playerIs: 'vex' } }, { flag: 'aria_romanze_zusammen' }, { notFlag: 'hunter_kommentar_aria_romanze' }] }),
    rede('hunter-tag-zeit', { not: { act: 2 } }, 8),
    rede('hunter-tag-plan', { quest: 'main-1-der-plan', state: 'active' }),
    rede('hunter-tag-angeln', { all: [{ weekday: 'so' }, { time: 'morgen' }] }),
    rede('hunter-tag-montag', { all: [{ weekday: 'mo' }, { time: ['abend', 'nacht'] }] }),
    rede('hunter-tag-morgen', { time: 'morgen' }),
    rede('hunter-tag-markt', { all: [{ weekday: ['mo', 'do'] }, { time: 'tag' }] }),
    rede('hunter-tag-buero', { time: 'tag' }),
    rede('hunter-tag-vertraut', undefined, 6),
    rede('hunter-tag-bar'),
  ],
};

export const part: ContentPart = {
  npcs: { hunter },
  dialogues: sammle(
    T.rivale, T.vorProbezeit, T.vexariaTanz, T.vexariaZusammen, T.ariaRomanze, T.zeit, T.plan, T.angeln, T.montag,
    T.morgen, T.markt, T.buero, T.vertraut, T.bar,
    he2, he4, he6, he8, he10,
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
      id: 'szene-hunter-nacht', title: 'Geschlossen',
      beats: [
        { image: 'cut-rom-hunter-bar', pan: 'out', lines: [H('Licht aus. Kasse zu. Und du … bleibst genau da.', 'zaertlich')] },
        abblende('Das Schild an der Tür sagt „Geschlossen“. Das Schild lügt nicht.'),
      ],
    },
  ),
  phone: {
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
