// side-rostzaehne-ende · „Das Ende der Rostzähne“ (world.md §6.3 Nr. 42). Hafen-Hannes, hafenkante, ab Ruf unterstadt 30, Akt 2.
// Die Rostzähne pressen den ganzen Hafen aus → Lager im Container-Labyrinth finden → Chef „Funzel“ stellen.
// Lager finden: abends dem Kassierer Schraubzwinge folgen (ohne Check) · [Reflexe 5] über die Container · [Straße 5]
// Zahn-Pfeile lesen · Vex (dachlaeuferin) über die Containerdächer. Im Lager tagsüber Schutzgeld-Quittungen holen
// (Kampf enc-rostzahn-lager oder [Reflexe 6] reinschleichen; Quittungen = +1 auf den Streik-Check und Kessels Razzia mit Ruf).
// Funzel stellen: Boss enc-hafen-funzel · gc-132 [Straße 8] vor seiner Gang bloßstellen · gc-133 [Ausstrahlung 6]
// Hafenarbeiter vereinen (Streik, bei Hannes) · Lager bei Kessel melden (Wachhäuschen Eisenhof, ohne Check).
// Belohnung 320 XP, 500 Cr, Ruf unterstadt +20; Flag rostzaehne_aufgeloest (Hafen ohne Schutzgeld).
// Funzel (NpcDef in npc-oednis/statisten) verschwindet während der Quest aus dem Labyrinth; hier per mapAdditions am Lager (abends/nachts).
import type { ContentPart } from '../../part';
import type { CutsceneDef, DialogueDef, NewsDef, PhoneMessageDef, QuestDef } from '../../../modules/contracts';
import {
  ACT2, ARIA_DA, VEX, WACH, active, all, any, bild, buff, ch, chk, dlg, done, flag, herz, inactive, l, msg, n, noFlag, node, not,
  p, rep, set, tafel, time, won,
} from './_lib';

const Q = 'side-rostzaehne-ende';
const HH = 'hafen-hannes';
const FU = 'funzel';
const KE = 'wache';
const AR = 'aria';

const GEFUNDEN = 'rz_lager_gefunden';
const QUITTUNGEN = 'rz_quittungen';
const BLOSS = 'rz_funzel_blossgestellt';
const STREIK = 'rz_streik';
const RAZZIA = 'rz_razzia';
const ABGESCHLOSSEN = 'rz_hannes_bericht';
const AUFGELOEST = 'rostzaehne_aufgeloest';

const ERLEDIGT = any(won('enc-hafen-funzel'), flag(BLOSS), flag(STREIK), flag(RAZZIA));
const ABENDS = time('abend', 'nacht');
const RUF: { rep: string; min: number } = { rep: 'unterstadt', min: 30 };

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: 'Das Ende der Rostzähne',
  summary: 'Die Rostzähne pressen den ganzen Hafen aus. Sogar die Möwen zahlen, in Fisch. Hafen-Hannes hat genug, und er hat einen Greifarm.',
  giver: HH,
  act: 2,
  steps: [
    {
      id: 'lager', text: 'Finde das Lager der Rostzähne im Container-Labyrinth (abends kommt der Kassierer vorbei).',
      done: flag(GEFUNDEN), marker: { map: 'hafenkante', at: 'container-labyrinth' },
    },
    {
      id: 'quittungen', optional: true, when: all(flag(GEFUNDEN), noFlag(QUITTUNGEN), not(ERLEDIGT)),
      text: 'Optional: Tagsüber ist Funzel nicht im Lager. Hol dir die Schutzgeld-Quittungen als Beweis.',
      done: flag(QUITTUNGEN), marker: { map: 'hafenkante', at: 'rostzaehne-lager' },
    },
    {
      id: 'funzel', when: flag(GEFUNDEN),
      text: 'Mach den Rostzähnen ein Ende: Funzel im Lager stellen (abends), die Hafenarbeiter mit Hannes zum Streik bringen oder das Lager bei Kessel am Eisenhof melden.',
      done: ERLEDIGT, marker: { map: 'hafenkante', at: 'rostzaehne-lager' },
    },
    {
      id: 'hannes', when: ERLEDIGT, text: 'Erzähl Hafen-Hannes am Kai, dass der Hafen frei ist.',
      done: flag(ABGESCHLOSSEN), marker: { map: 'hafenkante', at: 'kai-mitte' },
    },
  ],
  reward: { xp: 320, credits: 500, rep: { unterstadt: 20 }, effects: [set(AUFGELOEST)] },
};

// ---------------------------------------------------------------------------------------------- Auftakt

const tel: PhoneMessageDef = {
  id: 'tel-hannes-rostzaehne',
  from: HH,
  text: 'Hier Hannes. Schreib langsam, Greifarm. Die Rostzähne nehmen jetzt Doppelte. Von allen. Grete weint in ihre Fische. Komm an den Kai.',
  auto: all(ACT2, RUF, inactive(Q), { met: HH }),
  replies: [{ text: 'Bin unterwegs.' }, { text: 'Später.' }],
};

const start: DialogueDef = dlg('rostz-hannes-start', [
  node('start', [
    n('Hafen-Hannes sitzt auf seinem Poller und schält keinen Apfel. Er hält ein Bündel Quittungen in der Greifzange, gelbes Papier, jede mit einem aufgestempelten Zahn.'),
    l(HH, 'Du. Gut. Ich hab gehört, du kriegst Sachen hin. Container 77, der ganze Ärger. Die Leute reden über dich. Die guten Leute.', 'neutral'),
    l(HH, 'Die Rostzähne. Früher drei Halbstarke mit Nieten. Jetzt hat sie einer übernommen, der nennt sich Funzel. Wickelt sich in Leuchtketten und kassiert. Grete zahlt für ihren Stand. Nebelhorn für seine Fähre. Die Jungs für den Weg zur Schicht. Den Weg!', 'wut'),
    l(HH, 'Doppelte seit letzter Woche. Wer nicht zahlt, dem fällt was auf den Kopf. Meistens ein Container.', 'wut'),
  ], {
    choices: [
      ch('„Wo hockt die Bande?“', 'wo'),
      ch('„Und warum macht ihr nicht einfach zu vierzigst Rabatz?“', 'warum'),
      ch('„Die Rostzähne? Die haben uns Kuriere jahrelang abgezockt. Zehn Prozent pro Paket.“', 'vex', { when: VEX }),
    ],
  }),
  node('vex', [
    l(HH, 'Die Schrapnell-Kuriere, was? Ich kenn dich. Du bist die mit dem Ripper-Arm, die über die Kräne springt, als wär das ein Spielplatz.', 'signatur'),
    p('Zehn Prozent pro Paket. Und wer nicht zahlt, dem schlitzen sie die Reifen. Ich hab vier Roller verloren. Und einen Zahn. Nicht meinen.', 'wut'),
  ], { next: 'wo' }),
  node('warum', [
    l(HH, 'Weil die Hälfte Familie hat. Und die andere Hälfte Schulden. Und weil keiner weiß, wo die ihr Lager haben. Ohne Lager kein Geld, ohne Geld keine Bande. Aber wo ist das Lager?', 'trauer'),
  ], { next: 'wo' }),
  node('wo', [
    l(HH, 'Irgendwo im Container-Labyrinth. Jeden Abend kommt ihr Kassierer, Schraubzwinge, mit der Tasche voll Geld, und verschwindet zwischen den Containern. Keiner traut sich hinterher.', 'neutral'),
    l(HH, 'Find das Lager. Dann reden wir weiter. Die Jungs legen zusammen. Diesmal mehr als ein Umschlag.', 'neutral'),
  ], {
    choices: [
      ch('„Ich mach die Rostzähne platt.“', 'ja', { effects: [{ startQuest: Q }] }),
      ch('„Nicht heute, Hannes.“'),
    ],
  }),
  node('ja', [
    l(HH, 'Platt. Ja. Das Wort mag ich. Das ist ein Hafenwort.', 'freude'),
  ], {
    choices: [
      ch('Weiter.', undefined, { when: not(ARIA_DA) }),
      ch('Weiter.', 'aria', { when: ARIA_DA }),
    ],
  }),
  node('aria', [
    l(AR, 'Schutzgeld. SCHUTZGELD. Das ist MEIN Witz! Ich sag das zu Leuten, damit die lachen! Und dieser Lichterkettenwichser macht damit Kohle?', 'wut'),
    l(AR, 'Ich will ihn. Ich will ihm jede Birne einzeln rausdrehen.', 'wut'),
  ]),
]);

// ---------------------------------------------------------------------------------------------- Labyrinth

const labyrinth: DialogueDef = dlg('rostz-labyrinth', [
  node('start', [
    n('Das Container-Labyrinth: rostige Stahlkisten, drei, vier Stück hoch gestapelt, Gänge so schmal, dass man seitwärts gehen muss. Überall Graffiti. Ein Zahn mit Grinsen. Ein Zahn mit Messer. Ein Zahn mit einem sehr detaillierten Mittelfinger.'),
  ], {
    choices: [
      ch('Hinter einem Container warten, bis der Kassierer kommt, und ihm folgen.', 'folgen', { when: ABENDS, effects: [set(GEFUNDEN)] }),
      ch('Auf die Container klettern und das Labyrinth von oben absuchen.', 'klettern', {
        check: chk('rostz-labyrinth-klettern', 'reflexe', 5, ['klettern']), effects: [set(GEFUNDEN)],
      }),
      ch('Die Zahn-Graffiti lesen. Banden markieren ihre Wege.', 'graffiti', {
        check: chk('rostz-labyrinth-graffiti', 'strasse', 5, ['spuren', 'gosse']), effects: [set(GEFUNDEN)],
      }),
      ch('Über die Containerdächer. Wie zu Hause.', 'dach', { tag: '[Dachläuferin]', when: { perk: 'dachlaeuferin' }, effects: [set(GEFUNDEN)] }),
      ch('Gehen. Abends schlurfen die Kassierer hier durch, dann ist es leichter.'),
    ],
  }),
  node('folgen', [
    n('Kurz nach Sonnenuntergang schlurft ein dürrer Rostzahn mit einer Bauchtasche vorbei, die klimpert wie eine Spardose. Schraubzwinge. Er pfeift. Falsch. Du folgst dem Pfeifen.'),
    n('Links, rechts, unter einem Container durch, an einem Ölfass vorbei, auf dem „PRIVAT. AUCH FÜR DICH.“ steht. Dann ein offener Doppelcontainer, Leuchtketten über dem Eingang, Musik, Gelächter. Das Lager.'),
  ], { next: 'gefunden' }),
  node('klettern', [
    n('Du ziehst dich an einer Containertür hoch, dann noch einen, dann stehst du auf dem Dach des Labyrinths. Von oben sieht es aus wie ein Schaltplan, den ein Betrunkener gelötet hat.'),
    n('Hinten am Rand: ein Doppelcontainer, dessen Dach mit Leuchtketten behängt ist. So viele, dass man ihn vom Mond aus sieht. Unauffällig ist nicht ihr Ding.'),
  ], { next: 'gefunden' }),
  node('graffiti', [
    n('Die Zähne sind nicht nur Deko. Bei jeder Abzweigung ist einer gesprayt, und die Spitze zeigt in eine Richtung. Rostzähne sind nicht klug genug für Geheimgänge. Aber klug genug, um sich nicht zu verlaufen.'),
    n('Du folgst den Zahnspitzen. Am Ende: ein Doppelcontainer mit Leuchtketten und einem Schild „Rostzahn-Zentrale. Klopfen. Dann zahlen.“'),
  ], { next: 'gefunden' }),
  node('dach', [
    n('Drei Schritte Anlauf, ein Satz auf den ersten Container, der zweite, der dritte. Du läufst über die Dächer, wie andere über einen Bürgersteig gehen. Unter dir zischen zwei Rostzähne, ob da oben was war. Da war was.'),
    n('Am Ende des Labyrinths blinkt es wie ein Jahrmarkt: Leuchtketten über einem Doppelcontainer. Das Lager.'),
  ], { next: 'gefunden' }),
  node('gefunden', [
    p('Gefunden. Tagsüber sind da sicher weniger Leute. Abends ist der Chef da.'),
  ], { effects: [msg('Rostzahn-Lager gefunden.')] }),
]);

// ---------------------------------------------------------------------------------------------- Lager tagsüber

const lagerTag: DialogueDef = dlg('rostz-lager-tag', [
  node('start', [
    n('Das Lager bei Tag: ein Doppelcontainer voller Kisten, Leuchtketten in Kartons, ein Sofa aus Autositzen. Zwei Rostzähne spielen Karten um Schutzgeld, das sie gerade erst geklaut haben. Funzel ist nicht da. Funzel schläft bis abends, sagen sie. Funzel ist ein Nachtmensch.'),
    n('Auf einem Regal: Ordner. Gelbe Quittungen mit Zahnstempel. Jede einzelne erpresste Zahlung, sauber abgeheftet. Verbrecher mit Buchhaltung. Die gefährlichste Sorte.'),
  ], {
    choices: [
      ch('Reinschleichen und die Ordner einstecken.', 'schleichen', {
        check: chk('rostz-lager-schleichen', 'reflexe', 6, ['schleichen']), when: noFlag(QUITTUNGEN), effects: [set(QUITTUNGEN), quittungBuff()],
      }),
      ch('Reingehen und Hallo sagen. Mit der Faust.', 'kampf', { when: noFlag(QUITTUNGEN) }),
      ch('Abends wiederkommen, wenn Funzel da ist.'),
    ],
  }),
  node('schleichen', [
    n('Die beiden Rostzähne streiten über eine Karte, die es im Spiel gar nicht gibt. Du gleitest am Sofa vorbei, ziehst drei Ordner aus dem Regal und bist wieder draußen, bevor einer „Ass!“ brüllt.'),
    p('Fein säuberlich abgeheftet. Mit Datum, Betrag und Namen. Die haben ihr eigenes Geständnis geschrieben.'),
  ]),
  node('kampf', [
    l('narrator', '„Ey! Das ist Privatgelände! Also, unser privates geklautes Gelände! Jungs, Besuch!“'),
  ], { effects: [{ battle: 'enc-rostzahn-lager' }] }),
]);

function quittungBuff() {
  return buff({
    id: 'rostz-quittungen', label: 'Schutzgeld-Quittungen in der Hand', value: 1, attribute: 'ausstrahlung', tags: ['buehne', 'ueberreden'],
    consumes: true,
  });
}

const lagerBeute: DialogueDef = dlg('rostz-lager-beute', [
  node('start', [
    n('Die Rostzähne liegen zwischen Leuchtkettenkartons und jammern. Im Regal stehen die Ordner mit den Quittungen. Jede erpresste Zahlung, mit Datum und Stempel.'),
    p('Danke für die Buchhaltung, Jungs. Hätte ich selbst nicht besser hingekriegt.'),
  ], { effects: [set(QUITTUNGEN), quittungBuff()] }),
]);

// ---------------------------------------------------------------------------------------------- Funzel

const funzelDlg: DialogueDef = dlg('rostz-funzel', [
  node('start', [
    n('Abends glüht das Lager wie ein Kirmeswagen. Zwanzig Rostzähne hocken auf Kisten und Containerdächern. In der Mitte, auf einem Thron aus drei Bierkästen: Funzel. Hager, Goldzahn, die Neonpeitsche über der Schulter, und in so viele Leuchtketten gewickelt, dass er summt.'),
    l(FU, 'Na sieh mal an. Ein Kunde! Willkommen bei den Rostzähnen. Du zahlst Eintritt, du zahlst fürs Atmen, du zahlst dafür, dass ich dich anschaue. Ich schau dich gerade an. Das macht zwanzig.', 'signatur'),
  ], {
    choices: [
      ch('„Funzel. Erzähl deinen Jungs doch mal, warum du ‚Funzel‘ heißt.“', 'bloss', { check: 'gc-132' }),
      ch('„Hier zahlt keiner mehr. Ab heute.“', 'kampf'),
      ch('„Schöne Lichter. Wär schade drum.“', 'drohung'),
      ch('Rückzug. Für heute.'),
    ],
  }),
  node('drohung', [
    l(FU, 'Drohst du mir? MIR? Ich bin Funzel! Ich leuchte! Wer leuchtet, hat recht!', 'wut'),
  ], {
    choices: [
      ch('„Warum heißt du eigentlich Funzel?“', 'bloss', { check: 'gc-132' }),
      ch('„Dann knipsen wir dich jetzt aus.“', 'kampf'),
      ch('Rückzug.'),
    ],
  }),
  node('bloss', [
    n('Du sagst es laut. Laut genug, dass es die Jungs auf den Containerdächern hören. Ein Rostzahn kichert. Ein anderer stößt ihn an. Funzel glüht. Er glüht nicht vor Licht.'),
    p('Weil du im Dunkeln Angst hast. Darum die Lämpchen. Alle. Der große Funzel schläft mit Nachtlicht. Drei Nachtlichter. Eins in Form einer Ente.'),
    n('Das ist kein Bluff. Hinter dem Bierkastenthron, neben dem Sofa, steht ein Nachtlicht in Form einer Ente. Mit Funzels Namen drauf. Mit Herzchen. Du siehst es von hier.'),
    l(FU, 'Das … Das ist eine Lüge! Die Ente gehört meiner Nichte!', 'ueberrascht'),
    l('narrator', 'Ein Rostzahn von oben: „Du hast keine Nichte, Funzel.“ Ein zweiter: „Er hat mich mal angerufen, weil der Strom weg war. Um drei Uhr nachts. Er hat geweint.“'),
    n('Das Gelächter fängt hinten an und rollt nach vorn wie eine Welle. Funzel steht auf seinem Bierkastenthron, und seine Leuchtketten blinken hektisch, als wollten sie fliehen. Sie können nicht. Er kann.'),
    l(FU, 'Ihr … ihr seid alle gefeuert! Alle! Die Rostzähne sind AUFGELÖST!', 'wut'),
    n('Er rennt. Klimpernd, blinkend, in die Nacht. Hinter ihm bleibt eine Spur aus herausgefallenen Glühbirnchen. Die Rostzähne schauen einander an. Dann zuckt einer mit den Schultern und fängt an, die Kisten aufzuteilen.'),
  ], { effects: [set(BLOSS), rep('rostzaehne', -20)], next: 'ende-bloss' }),
  node('ende-bloss', [
    p('Hafen ohne Schutzgeld. Ich sag’s Hannes.'),
  ], {
    choices: [
      ch('Gehen.', undefined, { when: not(ARIA_DA) }),
      ch('Gehen.', 'aria-bloss', { when: ARIA_DA }),
    ],
  }),
  node('aria-bloss', [
    l(AR, 'Eine Ente. Eine verfickte Ente. Das ist besser als jede Prügelei. Okay, fast jede.', 'freude'),
  ]),
  node('kampf', [
    l(FU, 'Jungs! Lichter an! Zähne raus!', 'wut'),
  ], { effects: [{ battle: 'enc-hafen-funzel' }] }),
]);

// ---------------------------------------------------------------------------------------------- Streik

const streik: DialogueDef = dlg('rostz-streik', [
  node('start', [
    l(HH, 'Du hast das Lager gefunden? Gut. Und jetzt? Ich kann nicht vierzig Mann zu einem Container schicken. Die haben Familie. Und Angst.', 'besorgt'),
  ], {
    choices: [
      ch('„Hol alle zusammen. Ich rede mit ihnen.“', 'rede', { check: 'gc-133' }),
      ch('„Ich kümmer mich anders drum.“'),
    ],
  }),
  node('rede', [
    n('Eine halbe Stunde später stehen sie am Kai: Hafenarbeiter mit Greifarmen, Grete mit Fischmesser, Nebelhorn mit Nebelhorn, Turbo-Tilda auf einer Kiste. Vierzig, fünfzig Leute. Sie schauen dich an, als wärst du eine Wettervorhersage.'),
    p('Die Rostzähne nehmen euer Geld. Jeden Tag. Und was machen sie damit? Lämpchen. Bier. Noch mehr Lämpchen. Ihr bezahlt Funzels Stromrechnung.'),
    p('Ab morgen zahlt keiner. Keiner. Ihr lauft gemeinsam zur Schicht, ihr steht gemeinsam am Stand, ihr fahrt gemeinsam mit der Fähre. Die sind zwanzig. Ihr seid der Hafen.'),
    n('Stille. Dann haut Hannes seinen Greifarm auf einen Poller, dass es dröhnt.'),
    l(HH, 'DER HAFEN!', 'wut'),
    n('Und vierzig Leute brüllen es nach. Irgendwo zwischen den Containern geht eine Leuchtkette aus.'),
  ], { effects: [set(STREIK), herz(HH, 40), rep('rostzaehne', -20), { cutscene: 'side-rostzaehne-streik' }] }),
]);

const streikCut: CutsceneDef = {
  id: 'side-rostzaehne-streik',
  title: 'Der Hafen',
  gallery: false,
  beats: [
    bild('bg-hafenkante', { pan: 'right', fade: 'in', hold: 1400, caption: 'Am nächsten Morgen zahlt am Hafen niemand. Die Hafenarbeiter gehen in Gruppen zur Schicht, Grete verkauft Fisch mit einem Fischmesser neben der Kasse.' }),
    bild('bg-hafenkante', { pan: 'in', hold: 1600, caption: 'Am dritten Tag sitzen die Rostzähne ohne Geld vor ihrem Lager. Am vierten Tag hat Funzel die Leuchtketten verkauft. Am fünften Tag fragt einer bei Hannes nach Arbeit.' }),
    tafel('Hannes gibt ihm einen Besen. „Fang mit deinem Graffiti an.“', { fade: 'out', hold: 1400 }),
  ],
};

// ---------------------------------------------------------------------------------------------- Kessel

const kessel: DialogueDef = dlg('rostz-kessel', [
  node('start', [
    n('Im Wachhäuschen am Eisenhof riecht es nach Kaffee und Formularen. Wachtmeisterin Kessel kommt vom Tor herüber, die Tasse in der Hand, und setzt sich auf die Schreibtischkante.'),
    l(KE, 'Rostzähne? Am Hafen? Wir kriegen jede Woche Anzeigen. Ohne Namen, ohne Ort. Was willst du, dass ich mache? Den Hafen umstellen? Ich habe vier Leute. Einer davon ist ein Drucker.', 'neutral'),
  ], {
    choices: [
      ch('Die Quittungen auf den Tisch legen. Datum, Betrag, Zahnstempel.', 'quittungen', { when: flag(QUITTUNGEN) }),
      ch('„Ich kenn den Ort. Ich bring euch hin. Heute Nacht.“', 'ort'),
      ch('„Vergiss es.“'),
    ],
  }),
  node('quittungen', [
    n('Kessel blättert. Sie stellt den Kaffee ab. Das macht sie nur bei ernsten Sachen und bei Geburtstagstorten.'),
    l(KE, 'Die haben sich selbst angezeigt. Schriftlich. Mit Stempel. Das ist das Dümmste und Schönste, was ich in zwanzig Dienstjahren gesehen habe.', 'freude'),
    l(KE, 'Damit kriege ich einen Durchsuchungsbefehl. Heute noch. Und der Richter unterschreibt ihn sogar, wenn ich ihm sage, dass Funzel einmal sein Fahrrad mit Leuchtketten beklebt hat.', 'signatur'),
  ], { effects: [rep('ordnungsdienst', 10)], next: 'razzia' }),
  node('ort', [
    l(KE, 'Ohne Beweise kein Durchsuchungsbefehl. Aber …', 'neutral'),
    l(KE, 'Eine Streife darf sich verlaufen. Nachts. Am Hafen. Und wenn sie sich zufällig in einem Lager voller Diebesgut verläuft, dann ist das kein Einsatz, sondern Pech. Für die.', 'signatur'),
  ], { next: 'razzia' }),
  node('razzia', [
    n('In der Nacht fahren drei Streifenwagen an der Hafenkante vor. Ohne Sirene. Kessel steigt aus, zieht den Mantel zurecht und klopft an den Doppelcontainer. „Ordnungsdienst. Kontrolle. Wer leuchtet, kommt mit.“'),
    n('Funzel leuchtet. Er kommt mit. Die anderen rennen in alle Richtungen und lassen eine Spur aus Glühbirnchen zurück.'),
  ], { effects: [set(RAZZIA), { advanceTime: 60 }, rep('rostzaehne', -20), herz(KE, 30)] }),
]);

// ---------------------------------------------------------------------------------------------- Bericht

const bericht: DialogueDef = dlg('rostz-bericht', [
  node('start', [
    l(HH, 'Ich hab’s gehört. Der ganze Kai hat’s gehört. Erzähl trotzdem. Ich will’s noch mal hören. Langsam.', 'freude'),
  ], {
    choices: [
      ch('„Funzel liegt zwischen den Containern. Seine Lämpchen auch.“', 'kampf', { when: won('enc-hafen-funzel') }),
      ch('„Ich hab ihm vor seiner Gang die Ente weggenommen. Bildlich.“', 'bloss', { when: flag(BLOSS) }),
      ch('„Das wart ihr. Der Streik. Ich hab nur geredet.“', 'streik', { when: flag(STREIK) }),
      ch('„Kessel hat ihn abgeholt. Heute Nacht.“', 'razzia', { when: flag(RAZZIA) }),
    ],
  }),
  node('kampf', [
    l(HH, 'Gut. Gut! Die Jungs haben die Lämpchen schon eingesammelt. Grete hängt sie über ihren Stand. Das ist jetzt Kunst.', 'freude'),
  ], { next: 'lohn' }),
  node('bloss', [
    l(HH, 'Die Ente! Ha! Pjotr hat gesagt, er hat Funzel heute am Bahnhof gesehen. Mit Nachtlicht im Rucksack. Er hat ihn nicht ausgelacht. Er hat ihn sehr laut nicht ausgelacht.', 'freude'),
  ], { next: 'lohn' }),
  node('streik', [
    l(HH, 'Geredet. Hm. Du hast vierzig Leute dazu gebracht, gleichzeitig Nein zu sagen. Ich hab dreißig Jahre gebraucht, um zu lernen, wie man das sagt. Du hast eine halbe Stunde gebraucht.', 'zaertlich'),
  ], { next: 'lohn' }),
  node('razzia', [
    l(HH, 'Kessel. Ausgerechnet. Na ja. Ordnung muss sein. Hat man mir jedenfalls immer gesagt. Ich hab’s nie geglaubt. Bis heute.', 'neutral'),
  ], { next: 'lohn' }),
  node('lohn', [
    n('Hannes greift in die Jacke. Diesmal ist es kein zerknitterter Umschlag. Es ist ein Schuhkarton. Mit Gummiband.'),
    l(HH, 'Fünfhundert. Von allen. Grete hat Fischschuppen dazugelegt. Die sind für Glück, sagt sie. Ich glaub, die sind einfach von ihr.', 'freude'),
    l(HH, 'Der Hafen schuldet dir was. Das vergisst er nicht. Der Hafen vergisst nie was. Darum riecht er so.', 'signatur'),
  ], { effects: [set(ABGESCHLOSSEN), herz(HH, 60)] }),
]);

const news: NewsDef = {
  id: 'news-side-rostzaehne',
  anchor: 'delya-delloraine',
  headline: 'Hafen ohne Schutzgeld',
  when: done(Q),
  priority: 3,
  lines: [
    l('delya-delloraine', 'Die Rostzähne sind Geschichte. Am Hafen zahlt niemand mehr Schutzgeld, und die Hafenarbeiter feiern mit Fisch und Lichterketten.', 'freude'),
    l('collin-charleston', 'Ehemalige Bandenmitglieder haben einen Malerbetrieb gegründet. Erster Auftrag: ihr eigenes Graffiti überstreichen.', 'freude'),
  ],
};

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: {
    [start.id]: start, [labyrinth.id]: labyrinth, [lagerTag.id]: lagerTag, [lagerBeute.id]: lagerBeute,
    [funzelDlg.id]: funzelDlg, [streik.id]: streik, [kessel.id]: kessel, [bericht.id]: bericht,
  },
  cutscenes: { [streikCut.id]: streikCut },
  phone: { [tel.id]: tel },
  news: { [news.id]: news },
  mapAdditions: {
    hafenkante: {
      hotspots: [
        {
          id: 'q-rostz-hannes', at: 'kai-mitte', radius: 60, label: 'Hafen-Hannes und die Rostzähne', kind: 'talk', dialogue: start.id,
          when: all(ACT2, RUF, inactive(Q), WACH),
        },
        {
          id: 'q-rostz-streik', at: 'kai-mitte', radius: 60, label: 'Mit Hannes die Hafenarbeiter zusammentrommeln', kind: 'talk', dialogue: streik.id,
          when: all(active(Q), flag(GEFUNDEN), not(ERLEDIGT), WACH),
        },
        {
          id: 'q-rostz-bericht', at: 'kai-mitte', radius: 60, label: 'Hafen-Hannes Bescheid sagen', kind: 'talk', dialogue: bericht.id,
          when: all(active(Q), ERLEDIGT, noFlag(ABGESCHLOSSEN), WACH),
        },
        {
          id: 'q-rostz-labyrinth', at: 'container-labyrinth', radius: 70, label: 'Container-Labyrinth durchsuchen', kind: 'use', dialogue: labyrinth.id,
          when: all(active(Q), noFlag(GEFUNDEN)),
        },
        {
          id: 'q-rostz-lager-tag', at: 'rostzaehne-lager', radius: 64, label: 'Rostzahn-Lager (Funzel schläft)', kind: 'use', dialogue: lagerTag.id,
          when: all(active(Q), flag(GEFUNDEN), not(ERLEDIGT), time('morgen', 'tag'), noFlag(QUITTUNGEN)),
        },
        {
          id: 'q-rostz-lager-beute', at: 'rostzaehne-lager', radius: 64, label: 'Die Quittungen einstecken', kind: 'loot', dialogue: lagerBeute.id,
          when: all(active(Q), won('enc-rostzahn-lager'), noFlag(QUITTUNGEN)),
        },
      ],
      npcs: [{
        id: 'q-rostz-funzel', npc: FU, at: 'rostzaehne-lager', facing: 's', dialogue: funzelDlg.id,
        when: all(active(Q), flag(GEFUNDEN), not(ERLEDIGT), ABENDS),
      }],
    },
    eisenhof: {
      hotspots: [{
        id: 'q-rostz-kessel', at: 'wachhaeuschen', radius: 56, label: 'Das Rostzahn-Lager melden', kind: 'talk', dialogue: kessel.id,
        when: all(active(Q), flag(GEFUNDEN), not(ERLEDIGT), WACH),
      }],
    },
  },
};
