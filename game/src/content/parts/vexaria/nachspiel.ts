// Vex × Aria im Nachspiel (`epilog`): Alltag als Paar. Tagesgesprächs-Pool, kleine Szenen und ein Ausblick.
//   `vexaria-alltag-zaehne` (das-meer, morgens): Zähneputzen am Wasserhahn hinter dem Strandclub.
//   `vexaria-alltag-rate` (ripper-praxis, montags): die letzte Rate für Vex' Arm.
//   `vexaria-alltag-schluessel` (loetgassen, abends): ein Schlüssel fürs Rolltor der Kurierbude.
//   `aria-vex-strandnacht` (Tagesgespräch Fr–So nachts am Meer, einmal pro Woche `vexaria_strand_woche`): Vorspiel nach
//     Wochentag (Fr Schnallen-Wette, Sa Öl für den Zerberster, So Kronkorken schnipsen) → Sommersprossen → Abblende.
//   `vexaria-ausblick` (das-meer, Steg, nach mindestens zwei Alltagsszenen): Pläne. Abschluss des Strangs.
// Gilt nicht in Ende 3 ohne 3b (dort ist Aria fort, siehe enden.ts).
import type { ContentPart } from '../../part';
import type { Condition, CutsceneDef, DialogueDef, DialogueLine, HeartEventDef, TalkDef } from '../../../modules/contracts';
import {
  a, all, any, BESCHWINGT, byId, ch, cut, dlg, EPILOG, flag, herz, n, node, noFlag, not, R, s, seen, set, V, v, ZUSAMMEN,
} from './_util';

const PAAR: Condition = all(R, ZUSAMMEN);
const DA: Condition = all(V, PAAR, EPILOG, any(not(flag('ende_master')), flag('ende_doch_noch_meer')));

// ---------------------------------------------------------------------------
// Tagesgespräche im Nachspiel

const ZEILEN: DialogueLine[][] = [
  [a('Guten Morgen, Postbotin. Du hast Sand in den Ohren. Ich hab nachgeguckt. Mit der Zunge.', 'verlegen')],
  [a('Hunter will, dass wir den Strandclub abends abschließen. Ich hab gesagt, wir sind zu beschäftigt. Er hat nicht gefragt, womit. Kluger Mann.', 'signatur')],
  [a('Du hast heute Nacht im Schlaf „Zugestellt“ gesagt. Und dann meinen Namen. In der Reihenfolge. Ich bin mir nicht sicher, ob ich beleidigt bin.', 'freude')],
  [a('Der Zerberster quietscht vom Salz. Dante sagt, Öl. Ich sag, du. Du hast so schöne Hände für Öl.', 'verlegen')],
  [v('Wo willst du hin?', 'neutral'), a('Nirgends. Das ist das Geile. Ich muss nirgends hin. Ich muss nur hier sein. Mit dir. Und \'nem Bier.', 'zaertlich')],
  [a('Ich hab dir einen Kronkorken an den Wagen geklebt. Und einen ans Gurtzeug. Und einen an deinen Stiefel. Du gehörst jetzt offiziell mir. Steht auf den Kronkorken.', 'signatur')],
  [a('Weißt du, was komisch ist? Ich träum gar nicht mehr. Kein Klappern, keine Traverse. Ich schlaf einfach. Weil du schnarchst. Das übertönt alles.', 'zaertlich'), v('Ich schnarch nicht.', 'wut'), a('Du schnarchst wie ein Kompressor. Ein süßer Kompressor.', 'freude')],
  [a('Wenn du heute wieder joggen gehst, am Strand, um sechs, mit nacktem Oberarm, dann komm ich mit. Nicht zum Joggen. Zum Gucken.', 'verlegen')],
  [a('Vega hat gesagt, wir sind ekelhaft. Ich hab gesagt, danke. Sie hat gesagt, das war kein Kompliment. Ich hab gesagt, doch.', 'freude')],
  [v('Bleibst du heute?', 'verlegen'), a('Ich bleib jeden Tag. Frag das nicht mehr. Doch, frag. Ich hör\'s gern.', 'zaertlich')],
];

const zeilen: DialogueDef[] = ZEILEN.map((l, i) => dlg(`aria-vex-epilog-${i + 1}`, [node('start', l)]));
const zeilenTalk: TalkDef[] = ZEILEN.map((_, i) => {
  const days: number[] = [];
  for (let d = i + 1; d <= 28; d += ZEILEN.length) days.push(d);
  return { dialogue: `aria-vex-epilog-${i + 1}`, when: all(DA, { cycleDay: days }) };
});

const FR: Condition = { weekday: 'fr' };
const SO: Condition = { weekday: 'so' };

const strandFrage: DialogueDef = dlg('aria-vex-strandnacht', [
  node('start', [
    a('Feuer ist noch an. Hunter schläft. Die Decke ist frei. Ich mein ja nur.', 'verlegen'),
  ], {
    choices: [
      ch('„Decke.“', 'feuer', { effects: [set('vexaria_strand_woche')] }),
      ch('„Morgen.“', undefined, { effects: [set('vexaria_strand_woche')] }),
    ],
  }),
  node('feuer', [
    n('Das Lagerfeuer knackt. Funken steigen in einen Himmel, der hier so viele Sterne hat, dass es fast unhöflich ist. Die Decke, die nach Rostlaube riecht, liegt schon da, wo sie immer liegt: hinter dem Treibholzstamm, wo man vom Liegestuhl aus nichts sieht.'),
  ], {
    choices: [
      ch('…', 'freitag', { when: FR }),
      ch('…', 'sonntag', { when: SO }),
      ch('…', 'samstag', { when: not({ weekday: ['fr', 'so'] }) }),
    ],
  }),

  // Freitag: Die Woche abschütteln. Schnell, frech, ein Wettrennen.
  node('freitag', [
    n('Freitag. Ihr kommt beide aus der Stadt, du von der letzten Tour, sie vom Inkasso. Du riechst nach Abgas und Regen, sie nach Motoröl und dem Schweiß von jemandem, der nicht zahlen wollte. Sie lässt sich neben dich auf die Decke fallen wie ein Sack Schrauben.'),
    a('Fünf Tage. Fünf Tage hab ich dich nur morgens gesehen, mit Zahnbürste im Maul. Das ist kein Leben. Das ist Folter mit Pfefferminz.', 'wut'),
    a('Wette. Ich krieg dein Gurtzeug mit geschlossenen Augen auf. Alle elf. Unter fünfzehn Sekunden. Wenn ich gewinn, bist du morgen dran mit Frühstück. Und mit allem anderen.', 'signatur'),
    v('Und wenn du verlierst?', 'signatur'),
    a('Ich verlier nicht. Ich kenn die Dinger besser als mein eigenes Gesicht. Unten links klemmt. Die vierte quietscht. Bei der siebten kriegst du Gänsehaut.', 'verlegen'),
    v('Krieg ich nicht.', 'neutral'),
    a('Kriegst du. Jedes Mal. Wollen wir wetten? Ach so, wir wetten ja schon.', 'freude'),
  ], {
    choices: [
      ch('Mitzählen. Laut. Gnadenlos.', 'fr-zaehlen'),
      ch('Ihr die Augen zuhalten. Mit der kalten Hand.', 'fr-augen'),
      ch('Sie gewinnen lassen. Offensichtlich.', 'fr-gewinnen'),
    ],
  }),
  node('fr-zaehlen', [
    n('Sie macht die Augen zu. Du zählst. Eins. Ihre Finger fliegen, unten links, der Dorn klemmt, sie flucht und schafft es trotzdem. Vier. Die vierte quietscht. Sieben.'),
    n('Bei sieben kriegst du Gänsehaut. Ihre Fingerkuppen streifen über die Haut unter dem Riemen, an der Seite, über den Rippen, und du hörst auf zu zählen.'),
    a('Neun. Zehn. Elf. Wie viel?', 'freude'),
    v('… Hab vergessen zu zählen.', 'verlegen'),
    a('Dann gilt\'s als gewonnen. Regel. Hab ich grad erfunden. Wegen der Gänsehaut. Die hab ich gesehen, du Lügnerin.', 'signatur'),
  ], { next: 'zaehlen' }),
  node('fr-augen', [
    n('Du legst ihr die schwarze Hand über die Augen. Sie zuckt, weil sie kalt ist, und lacht, weil sie es wusste.'),
    a('Unfair. Das ist Behinderung des Inkassos. Dafür gibt\'s Zinsen.', 'freude'),
    n('Sie arbeitet sich blind vor. Langsamer jetzt, weil sie mit der echten Hand tasten muss und dabei nicht aufhört zu grinsen. Jede Schnalle findet sie über einen Umweg: Schulter, Schlüsselbein, die Kuhle am Hals, wo der Puls sitzt. Da bleibt sie länger, als nötig wäre.'),
    a('Das ist keine Schnalle.', 'verlegen'),
    v('Nee.', 'verlegen'),
    a('Weiß ich. Ich wollt nur gucken, wie schnell das da schlägt. Ziemlich schnell, Rennsemmel. Zinsen.', 'verlegen'),
  ], { next: 'zaehlen' }),
  node('fr-gewinnen', [
    n('Du lehnst dich zurück, die Arme hinter dem Kopf. Aria starrt dich an. Dann macht sie die Augen zu und braucht vierzig Sekunden, weil sie so tut, als würde sie sich Mühe geben, und dabei die ganze Zeit kichert.'),
    a('Vierzig. Hab gewonnen.', 'freude'),
    v('Vierzig ist über fünfzehn.', 'signatur'),
    a('Bei uns zählt man anders. Bei uns zählt man in Küssen. Und ich hab elf gebraucht. Gewonnen.', 'verlegen'),
  ], { next: 'zaehlen' }),

  // Samstag: Langsam. Öl für den Zerberster.
  node('samstag', [
    n('Samstag. Kein Wecker morgen, kein Job, keine Eile. Aria hat ein Ölkännchen aus Dantes Werkstatt mitgebracht und legt es dir wortlos in die Hand. Dann setzt sie sich zwischen deine Knie, den Rücken an dir, und streckt den Zerberster vor sich ins Feuerlicht.'),
    a('Der quietscht. Seit Mittwoch. Dante sagt, Öl. Ich sag, du. Du hast so schöne Hände für Öl.', 'verlegen'),
    n('Ihr habt das schon ein Dutzend Mal gemacht. Du weißt, wo es quietscht: Handgelenk, die Spiralfeder am Ellbogen, das Gelenk an der Schulter, wo das Metall in sie übergeht. Du fängst unten an. Ein Tropfen. Den Finger hinterher. Das Feuer spiegelt sich in jedem silbernen Glied.'),
    n('Sie lehnt den Kopf nach hinten an deine Schulter. Je weiter du nach oben kommst, desto ruhiger atmet sie. Am Ellbogen schließt sie die Augen. An der Schulter, an der Naht, wo das Öl auf Haut trifft, hält sie die Luft an.'),
    a('Du machst das zu gründlich.', 'verlegen'),
  ], {
    choices: [
      ch('Gründlicher.', 'sa-gruendlich'),
      ch('Ihr das Kännchen geben. „Jetzt du. Meiner quietscht auch.“', 'sa-tausch'),
      ch('Das Öl weglegen. Ihren Nacken küssen.', 'sa-nacken'),
    ],
  }),
  node('sa-gruendlich', [
    n('Gründlicher. Dein Daumen fährt die Naht nach, rundherum, ganz langsam, da, wo sie nichts fühlt, und dann daneben, da, wo sie alles fühlt. Sie macht ein Geräusch wie ein Motor im Leerlauf.'),
    a('Okay. Okay, das ist … du weißt genau, was du da tust. Das weißt du seit Monaten. Du machst das mit Absicht.', 'verlegen'),
    v('Ist Wartung.', 'signatur'),
    a('Ist WARTUNG, sagt sie. Ich zeig dir gleich Wartung.', 'verlegen'),
  ], { next: 'zaehlen' }),
  node('sa-tausch', [
    n('Sie dreht sich um, kniet sich vor dich, nimmt das Kännchen und deinen schwarzen Arm. Sie ölt dich genau so, wie du sie geölt hast. Gelenk für Gelenk. Kolben für Kolben. Die cyanfarbene Lichtnaht am Unterarm entlang, mit der Fingerspitze, bis zur Schulter. Bis zu Rippers Naht.'),
    a('Hier hörst du auf. Und hier fängst du an.', 'zaertlich'),
    n('Sie küsst die Stelle. Dann noch mal, eine Handbreit höher, auf der Haut. Dann am Hals. Das Kännchen fällt in den Sand und keine von euch hebt es auf.'),
  ], { next: 'zaehlen' }),
  node('sa-nacken', [
    n('Du stellst das Kännchen in den Sand. Du schiebst ihr die Zöpfe zur Seite und küsst ihren Nacken. Einmal. Da, wo der Haaransatz anfängt. Sie wird ganz still.'),
    a('Weiter. Nicht aufhören. Ich hab dir gesagt, da bin ich empfindlich, und du nutzt das schamlos aus, und ich will, dass du das weiter schamlos ausnutzt.', 'verlegen'),
    n('Du nutzt es aus. Den Nacken entlang, zur Schulter, wieder zurück. Sie greift nach hinten, mit der echten Hand, in deine Haare, und hält dich da fest.'),
  ], { next: 'zaehlen' }),

  // Sonntag: Faul. Die letzte Nacht vor der Woche. Kronkorken schnipsen.
  node('sonntag', [
    n('Sonntag. Die letzte Nacht vor der Woche. Ihr seid beide zu faul, um irgendwas zu wollen, und wollt trotzdem alles. Aria liegt auf dem Bauch neben dir, das Kinn auf den verschränkten Armen, und schnipst Kronkorken gegen eine leere Bierflasche im Sand.'),
    a('Neues Spiel. Wer trifft, sagt wo. Und die andere muss da einen Kuss hinmachen. Keine Widerrede, keine Verhandlung. Inkasso-Regeln.', 'signatur'),
    v('Und wenn keine trifft?', 'neutral'),
    a('Dann haben wir beide verloren, und dann liegen wir hier rum und gucken Sterne. Ist auch okay. Sonntag.', 'zaertlich'),
  ], {
    choices: [
      ch('Schnipsen. Treffen. „Schulter.“', 'so-treffen'),
      ch('Daneben schnipsen. Mit Absicht. Sie schnipsen lassen.', 'so-daneben'),
    ],
  }),
  node('so-treffen', [
    n('Klink. Der Kronkorken trifft den Flaschenhals. Aria stöhnt theatralisch, rollt sich rüber und küsst deine Schulter. Dann, weil sie fair ist, noch mal daneben, weil sie sich verschätzt hat, sagt sie.'),
    a('Meine Runde.', 'signatur'),
    n('Klink. Sie trifft natürlich. Sie trifft immer.'),
    a('Hals. Links. Da, wo du immer den Kragen hochziehst, wenn Hunter guckt.', 'verlegen'),
    n('Du küsst sie dahin. Sie hält ganz still. Dann trifft sie noch mal, ohne hinzusehen, und sagt „Mund“, und das Spiel ist vorbei, weil keine von euch mehr zählt.'),
  ], { next: 'zaehlen' }),
  node('so-daneben', [
    n('Dein Kronkorken landet einen Meter neben der Flasche. Aria sieht dich an. Sie weiß genau, dass du aus zehn Metern ein Paket durch ein Oberlicht wirfst.'),
    a('Oh. Ohhh. So läuft das heute. Gut. Dann schnipp ich. Und du hältst still.', 'verlegen'),
    n('Klink. „Handgelenk.“ Klink. „Schlüsselbein.“ Klink. „Unterm Ohr.“ Sie trifft jedes Mal, und jedes Mal nimmt sie sich mehr Zeit, und beim fünften Treffer sagt sie gar nichts mehr, sie zeigt nur noch.'),
    a('Weißt du, was das Schönste an Sonntag ist? Dass ich weiß, wie\'s ausgeht. Und es trotzdem langsam mach.', 'zaertlich'),
  ], { next: 'zaehlen' }),

  // Gemeinsam: Sommersprossen.
  node('zaehlen', [
    n('Irgendwann liegt ihr unter der Decke, ihr Kopf auf deinem Arm, deinem echten, deine Metallhand auf ihrer Hüfte. Das Feuer ist runtergebrannt bis auf ein rotes Atmen.'),
    a('Zähl mal die Sterne.', 'zaertlich'),
    v('Zu viele.', 'neutral'),
    a('Dann zähl meine Sommersprossen. Die sind weniger. Aber du musst nah ran.', 'verlegen'),
    n('Du gehst nah ran. Du zählst. Mit den Lippen, eine nach der anderen, Nasenrücken, Wange, Kinn, die drei am Hals, die sie hasst und du nicht. Bei siebzehn verzählst du dich absichtlich und fängst von vorne an. Sie lacht, dann lacht sie nicht mehr. Ihre Finger sind in deinem Gurtzeug, an der ersten Schnalle, unten links, die klemmt.'),
    a('Siebzehn. Du warst bei siebzehn.', 'verlegen'),
    v('Ich fang lieber noch mal an.', 'zaertlich'),
    a('Du fängst jede Woche noch mal an. Jede Woche bei siebzehn. Ich glaub, du kannst gar nicht weiter zählen.', 'verlegen'),
    v('Ich will nicht weiter zählen.', 'zaertlich'),
    n('Die erste Schnalle geht auf. Die Decke rutscht euch über die Köpfe.'),
  ], { effects: [herz(10), BESCHWINGT, { cutscene: 'vexaria-strandnacht' }] }),
]);

const strandMorgen: DialogueDef = dlg('vexaria-strandnacht-morgen', [
  node('start', [
    n('Morgengrauen am Lagerfeuer. Die Glut ist grau. Die Decke ist voller Sand. Hunter steht über euch mit zwei Kaffee und einer Sonnenbrille, hinter der er sehr bewusst nicht hinguckt.'),
    s('hunter', 'Keine Turteleien an meinem Strand. … Na gut. Eine. Pro Nacht. Kaffee?', 'signatur'),
  ], {
    choices: [
      // Nach dem Schlafen ist schon der Folgetag: Freitagnacht → Samstagmorgen usw.
      ch('…', 'fr', { when: { weekday: 'sa' } }),
      ch('…', 'so', { when: { weekday: 'mo' } }),
      ch('…', 'sa', { when: not({ weekday: ['sa', 'mo'] }) }),
    ],
  }),
  node('fr', [
    s('hunter', 'Und wer von euch beiden hat eine Bierflasche voller Kronkorken neben meinen Liegestuhl gestellt? Nein. Ich will\'s nicht wissen.', 'neutral'),
    a('(unter der Decke) Sie hat verloren. Sie macht Frühstück. Zwei Kaffee reichen nicht, Hunter, wir brauchen vier.', 'freude'),
  ]),
  node('sa', [
    s('hunter', 'Das Ölkännchen gehört Dante. Er sucht es seit gestern. Ich sag ihm, es ist im Sand. Ich sag ihm nicht, warum.', 'signatur'),
    a('(unter der Decke) Sag ihm, es war Wartung.', 'verlegen'),
  ]),
  node('so', [
    s('hunter', 'Montag, Mädels. Die Stadt ruft. Der Bus fährt um acht. Und Vex, zieh den Kragen hoch. Ich bin alt, nicht blind.', 'signatur'),
    a('(unter der Decke) Fünf Minuten. Zehn. Bis nächsten Freitag.', 'zaertlich'),
  ]),
]);

// ---------------------------------------------------------------------------
// Alltagsszenen

const zaehne: DialogueDef = dlg('vexaria-alltag-zaehne', [
  node('start', [
    n('Früher Morgen hinter dem Strandclub. Ein Wasserhahn an einem Pfahl, ein Spiegel mit Sprung, zwei Zahnbürsten in einem Kronkorken-Glas. Aria steht schon da, in deinem Top, Schaum bis zum Kinn.'),
    a('Mmpf. Du bist zu spät. Ich bin schon bei den Backenzähnen.', 'freude'),
    n('Du stellst dich neben sie. Schulter an Schulter. Ihr putzt. Im Spiegel siehst du zwei Frauen mit Sand im Haar, Schaum im Mundwinkel und einem Grinsen, das nicht weggehen will.'),
  ], {
    choices: [
      ch('Ihr Schaum auf die Nase tupfen.', 'schaum', { effects: [herz(10)] }),
      ch('Ihre Zahnbürste nehmen. Aus Versehen. Absichtlich.', 'buerste', { effects: [herz(10)] }),
    ],
  }),
  node('schaum', [
    a('DU –', 'wut'),
    n('Sie revanchiert sich mit einer ganzen Handvoll. Dann mit dem Wasserhahn. Hunter, der gerade mit der Zeitung vorbeikommt, dreht sofort wieder um.'),
  ], { next: 'ende' }),
  node('buerste', [
    a('Das ist meine. Die gelbe ist meine. Die blaue ist deine. Das haben wir besprochen.', 'wut'),
    v('Die schmeckt nach dir.', 'signatur'),
    a('… Das ist das Ekelhafteste und Romantischste, was je einer gesagt hat. Behalt sie. Ich nehm deine.', 'verlegen'),
  ], { next: 'ende' }),
  node('ende', [
    n('Danach küsst sie dich. Pfefferminz und Salz. Erst kurz, über dem Waschbecken, mit Schaum im Mundwinkel. Dann schiebt sie dich mit dem Zerberster rückwärts gegen den Pfahl, ganz sanft, und der Wasserhahn läuft weiter, und keine von euch dreht ihn zu.'),
    n('Ihre echte Hand unter dem Saum deines Tops, flach auf deinem Rücken, nass vom Wasserhahn. Kalt. Du ziehst die Luft ein. Sie grinst an deinem Mund.'),
    a('Rache. Für den kalten Arm. Jeden Morgen. Fünf Uhr. Direkt ins Kreuz.', 'verlegen'),
  ], {
    choices: [
      ch('„Hunter wartet mit dem Frühstück.“', 'ende-frueh'),
      ch('Den Wasserhahn zudrehen. Mit dem Fuß. Ohne loszulassen.', 'ende-spaet'),
    ],
  }),
  node('ende-frueh', [
    a('Hunter wartet seit fünfzig Jahren auf irgendwas. Der hält noch fünf Minuten aus.', 'signatur'),
    n('Er hält zwanzig aus. Ihr kommt mit nassen Haaren und Zahnpasta am Hals zum Frühstück, und Hunter schiebt euch wortlos die Kaffeebecher hin und eine Serviette für den Hals.'),
  ], { effects: [set('vexaria_alltag_zaehne')] }),
  node('ende-spaet', [
    n('Du drehst den Hahn mit dem Stiefel zu. Es braucht drei Versuche. Aria lacht so sehr, dass sie sich an dir festhalten muss, und dann hält sie sich weiter fest, auch als sie nicht mehr lacht.'),
    a('Kein Frühstück heute. Ich hab schon gefrühstückt. Pfefferminz.', 'verlegen'),
    n('Ihr kommt beide zu spät zum Frühstück, und keiner fragt, warum. Vega fragt doch. Hunter tritt ihr unterm Tisch vors Schienbein.'),
  ], { effects: [set('vexaria_alltag_zaehne')] }),
]);

const rate: DialogueDef = dlg('vexaria-alltag-rate', [
  node('start', [
    n('Montag. Rippers Praxis. Die Glocke an der Tür klingelt, du legst die Credits für die Wochenrate auf den Tresen, wie seit Jahren. Ripper schiebt sie zurück.'),
    s('ripper', 'Bezahlt, Schätzchen. Alle. Bis zur letzten.', 'neutral'),
    v('Von wem.', 'ueberrascht'),
    s('ripper', 'Von einer gewissen Brecherin, die mir einen Haufen Bargeld hingeknallt hat und dazu einen Satz, den ich meiner Mutter nicht erzählen kann. Und eine Drohung mit dem Zerberster. Sehr kreativ. Ich hab mitgeschrieben.', 'signatur'),
    s('ripper', 'Der Arm gehört dir. Glückwunsch. Ich schick trotzdem \'ne Rechnung. Aus Gewohnheit.', 'freude'),
    n('Du stehst draußen vor der Praxis und guckst deinen schwarzen Arm an. Die Finger. Das Gelenk. Rippers Naht. Er gehört dir. Er hat dir nie gehört, und jetzt gehört er dir.'),
    n('Dein Telefon brummt.'),
    a('(Nachricht) Montag. Keine Rate. Dafür heute Abend Armdrücken. Wer verliert, macht das Frühstück. Ich verlier absichtlich.', 'freude'),
  ], { effects: [set('vexaria_raten_bezahlt'), set('vexaria_alltag_rate'), herz(30)] }),
]);

const schluessel: DialogueDef = dlg('vexaria-alltag-schluessel', [
  node('start', [
    n('Die Lötgassen, Abend. Die Kurierbude ist noch da, wie du sie zurückgelassen hast: Kronkorken an der Tür, eine Matratze, eine Kiste, ein Pass an der Wand. Aria lehnt am Rolltor und tut so, als würde sie warten, obwohl sie wartet.'),
    a('Wir pendeln jetzt, oder? Meer am Wochenende, Stadt unter der Woche. Wie reiche Leute. Nur ohne Geld.', 'freude'),
    n('Du ziehst etwas aus der Westentasche. Ein Schlüssel an einem Schlüsselring aus einem verbogenen Kronkorken. Für das Vorhängeschloss am Rolltor. Das Schloss, das du seit Kas niemandem gegeben hast.'),
    v('Für die Bude.', 'verlegen'),
    a('…', 'ueberrascht'),
    a('Du hast nie jemandem einen Schlüssel gegeben. Du hast mir erzählt, du hast nicht mal Kas einen gegeben, weil er durch das Dach gekommen ist.', 'zaertlich'),
    v('Du kommst nicht durchs Dach. Du bist zu laut.', 'signatur'),
    a('Ich bin GENAU richtig laut.', 'verlegen'),
    n('Sie nimmt den Schlüssel mit dem Zerberster, ganz vorsichtig zwischen zwei silbernen Fingern, als wär er aus Glas. Dann schließt sie das Rolltor auf, obwohl es offen ist, nur um zu hören, wie es klickt. Dann zieht sie dich rein.'),
  ], {
    effects: [set('vexaria_alltag_schluessel'), herz(40), { give: 'aria-kronkorken' }],
    choices: [
      ch('„Und jetzt schließ ab. Von innen.“', 'schluessel-zu'),
      ch('„Ich zeig dir, wo der Kaffee steht.“', 'schluessel-kaffee'),
    ],
  }),
  node('schluessel-zu', [
    n('Sie zieht das Rolltor runter. Es rattert. Die Kronkorken klimpern. Dann steckt sie den Schlüssel ins Schloss, von innen, und dreht. Klick. Sie lehnt sich mit dem Rücken gegen das Wellblech und sieht dich an, als hätte sie gerade die ganze Stadt ausgesperrt.'),
    a('Weißt du, wie oft ich davor stand? Vor dem Tor? Und dachte, irgendwann krieg ich einen Schlüssel, und dann komm ich rein, wann ich will?', 'zaertlich'),
    v('Wann willst du?', 'verlegen'),
    a('Jetzt. Immer. Jetzt.', 'verlegen'),
    n('Sie hakt zwei Finger in deinen Brustriemen und zieht. Ihr Mund an deinem Hals, ihr Atem warm unter dem Kragen. Die erste Schnalle. Unten links. Die klemmt immer noch. Sie lacht in deine Haut.'),
    a('Das reparierst du nie, oder? Mit Absicht. Damit ich länger brauch.', 'verlegen'),
    v('Jetzt hast du\'s rausgefunden.', 'signatur'),
    n('Über euch schwingt die Glühbirne am Kabel, weil eine von euch dagegengestoßen ist. Das Licht schaukelt über die Wand, über die Kronkorken, über den alten Pass. Keine von euch hält sie an.'),
  ], { effects: [BESCHWINGT] }),
  node('schluessel-kaffee', [
    v('Ich zeig dir, wo der Kaffee steht.', 'neutral'),
    a('Der Kaffee steht in der Kiste. Neben dem Pass. Seit drei Jahren. Ich war hier, Vex. Oft. Ich weiß, wo der Kaffee steht.', 'freude'),
    v('Du weißt nicht, wo der gute Kaffee steht.', 'signatur'),
    n('Du ziehst eine lose Platte aus der Wand. Dahinter: eine Dose Echtbohnen, eine Flasche Schnaps und ein Foto von Kas, der dir die Zunge rausstreckt. Aria guckt lange auf das Foto. Dann auf dich.'),
    a('Das ist mehr als ein Schlüssel. Das ist … das ist dein Versteck. Du zeigst mir dein Versteck.', 'zaertlich'),
    n('Sie stellt den Kaffee zurück, ohne ihn aufzumachen. Dann nimmt sie dein Gesicht in beide Hände, die echte warm, die silberne kühl, und küsst dich so langsam, dass das Wasser auf dem Kocher, den du angemacht hast, erst pfeift und dann verkocht.'),
  ], { effects: [herz(10)] }),
]);

const ausblick: DialogueDef = dlg('vexaria-ausblick', [
  node('start', [
    n('Der Steg am Meer, spät. Die Planken knarzen. Ihr sitzt am Ende, die Beine über dem Wasser, Aria barfuß, du in Stiefeln, weil manche Dinge sich nicht ändern. Unten schwimmt die Blechkrabbe vorbei und sortiert Algen.'),
    a('Hunter hat gefragt, was wir jetzt machen. So mit Leben und allem. Ich hab gesagt, weiß ich nicht. Ich wollt\'s dich zuerst fragen.', 'neutral'),
  ], {
    choices: [
      ch('„Kurierdienst. Stadt bis Meer. Zwei Leute. Eine schnell, eine laut.“', 'kurier'),
      ch('„Bude am Strand. Eine Tür. Ein Schloss. Zwei Schlüssel.“', 'bude'),
      ch('„Weiß nicht. Ist das erste Mal, dass ich nicht weiß, wohin. Fühlt sich gut an.“', 'offen'),
    ],
  }),
  node('kurier', [
    a('„Schrapnell & Zerberster, Express-Zustellung.“ Mit Kronkorken als Logo. Und ich mach die Mahnungen.', 'signatur'),
    v('Du machst die Mahnungen mit der Mülltonne.', 'freude'),
    a('Ist effizient.', 'freude'),
  ], { effects: [set('vexaria_ausblick_kurier')], next: 'ende' }),
  node('bude', [
    a('Mit \'nem Fenster aufs Meer. Und einem Boxsack. Und einem Bett, in das wir beide quer passen.', 'zaertlich'),
    v('Breites Bett.', 'verlegen'),
    a('SEHR breites Bett.', 'verlegen'),
  ], { effects: [set('vexaria_ausblick_bude')], next: 'ende' }),
  node('offen', [
    a('Ja. Ja, fühlt sich gut an. Als hätte keiner was bestellt, und trotzdem kommt was an.', 'zaertlich'),
  ], { effects: [set('vexaria_ausblick_offen')], next: 'ende' }),
  node('ende', [
    n('Sie lehnt sich an dich. Das Meer kommt und geht und kommt wieder. Es hält nicht an. Es kommt nur immer zurück.'),
    a('Weißt du, was ich glaub? Kas hätte das hier gemocht. Er hätte falsch gesungen. Und dich ausgelacht, weil du in Stiefeln am Meer sitzt.', 'zaertlich'),
    v('Und dann hätt er dich adoptiert.', 'zaertlich'),
    a('Nach drei Tagen.', 'freude'),
    v('Nach einem.', 'zaertlich'),
    n('Ihr bleibt sitzen, bis die Sterne verblassen. Zwei Frauen am Ende eines Stegs. Eine dreht sich zur anderen um. Wer, ist egal. Es ist immer beide.'),
  ], { effects: [set('vexaria_ausblick'), herz(50), BESCHWINGT] }),
]);

// ---------------------------------------------------------------------------

const cutscenes: CutsceneDef[] = [
  cut('vexaria-strandnacht', 'Sommersprossen', [
    { image: 'black', fade: 'out', hold: 1600, caption: 'Funken. Sterne. Eine Decke, die über den Kopf rutscht.' },
    { image: 'black', when: FR, lines: [n('Unter der Decke ein Klimpern, elfmal, sehr schnell hintereinander. Dann ein triumphierendes „Ha!“ und ein „Psst!“ vom Liegestuhl.')], hold: 1400 },
    { image: 'black', when: not({ weekday: ['fr', 'so'] }), lines: [n('Ein Ölkännchen kippt in den Sand. Keine Hand greift danach. Das Feuer atmet rot.')], hold: 1400 },
    { image: 'black', when: SO, lines: [n('Ein letzter Kronkorken rollt die Düne runter, ganz langsam, bis ans Wasser. Klink. Keiner hat ihn geschnipst.')], hold: 1400 },
  ], [{ sleep: true }, { dialogue: 'vexaria-strandnacht-morgen' }], false),
];

const ALLTAG_GESEHEN: Condition = { atLeast: [flag('vexaria_alltag_zaehne'), flag('vexaria_alltag_rate'), flag('vexaria_alltag_schluessel'), seen('rom-vexaria-konzert')], min: 2 };

export const NACHSPIEL_EVENTS: HeartEventDef[] = [
  {
    id: 'vexaria-alltag-zaehne', hearts: 6, map: 'das-meer', time: 'morgen',
    when: all(DA, seen('rom-vexaria-meer'), noFlag('vexaria_alltag_zaehne')),
    dialogue: 'vexaria-alltag-zaehne',
    effects: [{ xp: 15 }],
  },
  {
    id: 'vexaria-alltag-schluessel', hearts: 6, map: 'loetgassen', time: ['abend', 'nacht'],
    when: all(DA, seen('rom-vexaria-meer'), noFlag('vexaria_alltag_schluessel')),
    dialogue: 'vexaria-alltag-schluessel',
    effects: [{ xp: 15 }],
  },
  {
    id: 'vexaria-ausblick', hearts: 6, map: 'das-meer', time: 'nacht',
    when: all(DA, ALLTAG_GESEHEN, not(seen('vexaria-ausblick'))),
    dialogue: 'vexaria-ausblick',
    effects: [{ xp: 50 }],
  },
];

/** Für aria.ts: Tagesgespräche im Nachspiel (vor den allgemeinen Pools). */
export const NACHSPIEL_TALK: TalkDef[] = [
  // Nur Fr–So: dann ist Aria am Meer (Tagesablauf aria.ts), unter der Woche nachts im High Voltage.
  { dialogue: 'aria-vex-strandnacht', when: all(DA, { time: 'nacht' }, { weekday: ['fr', 'sa', 'so'] }, noFlag('vexaria_strand_woche'), seen('rom-vexaria-meer')) },
  ...zeilenTalk,
];

export const part: ContentPart = {
  dialogues: byId([...zeilen, strandFrage, strandMorgen, zaehne, rate, schluessel, ausblick]),
  cutscenes: byId(cutscenes),
  mapAdditions: {
    'ripper-praxis': {
      onEnter: [{
        id: 'vexaria-alltag-rate', when: all(DA, { weekday: 'mo' }, seen('rom-vexaria-meer'), noFlag('vexaria_alltag_rate')),
        dialogue: 'vexaria-alltag-rate',
      }],
    },
  },
};
