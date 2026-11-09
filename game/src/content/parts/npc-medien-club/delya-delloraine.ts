// Delya Delloraine – Nachrichtensprecherin und Reporterin bei NX-1 (world.md §4.4, §11.2).
// Tagesablauf nach design/plan/act1.json (npcSchedules.delya-delloraine), Herz-Ereignisse he-delya-delloraine-2/4/6
// (plan events), -8/-10 angelegt und an act2 gebunden. Kein Begleiter. Romanze: nur Kennzeichen (nicht freigegeben),
// daher ausschließlich Freundschaftsfassung.
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode, NpcDef } from '../../../modules/contracts';
import {
  type Menu, AKT1, AKT2, VEX, VEXARIA, ZEIT_HINWEIS, all, byId, chk, daily, dlg, erz, flag, hearts, ich, noFlag, node,
  not, rel, rep, seen, set, sp, talk, xp,
} from './_util';

const D = sp('delya-delloraine');
const C = sp('collin-charleston');
const K = sp('kameramann');
const Z = sp('narrator');

const ID = 'delya-delloraine';
const PROBEZEIT: Condition = { quest: 'main-1-probezeit', state: 'done' };

// ------------------------------------------------------------------------------------------- Menü

function menu(): Menu {
  const zurueck: DialogueChoice[] = [{ text: 'Noch eine Frage.', next: 'menue', id: 'zurueck' }, { text: 'Bis dann, Delya.' }];

  const choices: DialogueChoice[] = [
    {
      text: '„Wer im Eisenhof kassiert, willst du wissen? Ich weiß es.“', tag: '[Ex-Wache]', when: { origin: 'origin-ex-wache' },
      once: true, id: 'd-wache', next: 'd-wache', effects: [rel(ID, 50), set('delya_insider_eisenhof')],
    },
    { text: 'Woran arbeitest du gerade?', tag: '[Delya ♥2]', requires: hearts(ID, 2), when: PROBEZEIT, next: 'recherche' },
    { text: 'Ich hab einen Tipp für dich.', when: { item: 'exklusiv-tipp' }, next: 'tipp', effects: [{ take: 'exklusiv-tipp' }, rel(ID, 60), rep('nx1-medien', 5)] },
    { text: '„Du hast über die Kuriere recherchiert.“', when: VEX, once: true, id: 'd-vex', next: 'vex' },
    { text: 'Wie hältst du es mit Collin aus?', once: true, id: 'd-collin', next: 'collin' },
    { text: 'Die Verschwundenen. Ich helf dir suchen.', when: all(AKT2, seen('he-delya-delloraine-4'), { quest: 'pers-delya-quelle', state: 'inactive' }), next: 'quelle', effects: [{ startQuest: 'pers-delya-quelle' }] },
    { text: 'Gibt’s schon was Neues über die Verschwundenen?', when: all(AKT1, seen('he-delya-delloraine-4')), next: 'quelle-akt1' },
    { text: 'Bis dann, Delya.' },
  ];

  const nodes: DialogueNode[] = [
    node('menue', [D('Noch etwas? Ich hab fünf Minuten. Dann muss ich Fakten überprüfen, die Collin erfunden hat.', 'neutral')], { choices }),
    node('d-wache', [
      ich('Der Kantinenwirt. Die Wachen zahlen ihm für Dienstpläne mit freien Freitagen. Und er zahlt jemandem weiter oben. Ich weiß nicht wem. Aber er hat einen goldenen Kugelschreiber.'),
      D('Ein goldener Kugelschreiber.', 'ueberrascht'),
      erz('Sie schreibt es auf. In Kurzschrift. Dann reißt sie die Seite heraus, faltet sie zweimal und steckt sie in ihren Schuh.'),
      D('Ich nenne keine Namen. Auch deinen nicht. Danke.', 'signatur'),
    ], { choices: zurueck }),
    node('recherche', [
      D('Drei Sachen. Erstens: Die Chrome-10-Gutscheine tauchen in der Unterstadt schneller auf als in der Oberstadt. Warum verschenkt man etwas zuerst an die, die es sich nicht leisten können?', 'besorgt'),
      D('Zweitens: Der Rattenkönig im Kanal ist echt. Ich hab ihn gesehen. Er hatte eine Krone aus Kronkorken. Ich werde das nie senden.'),
      D('Drittens: Ripper zahlt Kindern zehn Credits für Implantate. Das ist keine Neuigkeit. Das ist ein Skandal, den keiner mehr hören will.', 'wut'),
    ], { choices: zurueck, effects: [set('geruecht_chrome_gutscheine')] }),
    node('tipp', [
      erz('Du gibst ihr den Zettel. Sie liest ihn zweimal, dann ein drittes Mal, langsamer.'),
      D('Woher hast du das?', 'ueberrascht'),
      D('Nein. Sag es nicht. Ich will es nicht wissen, dann kann ich es nicht verraten. Ich nenne keine Namen.', 'signatur'),
    ], { choices: zurueck }),
    node('vex', [
      D('Vor zwei Jahren. Ein Kurier, abgestürzt über der Neon-Gasse. Neun Stockwerke. Es gab keine Untersuchung. Kein Bericht. Nur eine Zeile in den Unfallmeldungen.', 'besorgt'),
      ich('Und?'),
      D('Und nichts. Ich hab aufgehört, als ich gemerkt habe, dass es keine Geschichte ist, sondern jemandes Bruder.', 'trauer'),
      D('Wenn du je willst, dass jemand die Akte liest: Ich lese sie. Wenn nicht, liegt sie da. Ich nenne keine Namen.'),
    ], { choices: zurueck, effects: [rel(ID, 20)] }),
    node('collin', [
      D('Collin ist eine Naturgewalt. Wie ein Wetter, das sich selbst moderiert.', 'neutral'),
      D('Aber er hat einmal um vier Uhr morgens einem Fremden sein Sakko gegeben und mich gebeten, es nicht zu erwähnen. Das erwähne ich jetzt auch nicht.', 'freude'),
    ], { choices: zurueck }),
    node('quelle', [
      D('Drei Kanal-Schlafwandler. Einer am Rechen, eine in der Rohrsiedlung, einer, den keiner vermisst, weil keiner ihn kannte.', 'besorgt'),
      D('Bring sie zu Dante. Er ist der Einzige, der so einen Chip anfasst, ohne ihn zu verkaufen.'),
    ], { choices: zurueck }),
    node('quelle-akt1', [
      D('Die Liste wird länger. Langsam. Sieben Namen. Acht seit Dienstag.', 'besorgt'),
      D('Ich brauche mehr als Namen. Ich brauche einen, der zurückkommt und erzählen kann. Bis dahin: Augen auf, Mund zu.'),
    ], { choices: zurueck }),
  ];
  return { choices, nodes };
}

const M = menu();

// ------------------------------------------------------------------------------------------- Tagesgespräche

const T = {
  rivale: daily('delya-tag-rivale',
    [D('Du bist in meinem nächsten Bericht. Nicht als Quelle. Als Thema.', 'wut')],
    [D('„Gewalt in der Neon-Gasse: Wer schützt die Unterstadt vor ihren eigenen Helden?“ Gute Überschrift, oder? Ich hab lange daran gefeilt.', 'wut')],
    { choices: [{ text: 'Dann schreib halt.' }], nodes: [] }),
  vexaria: daily('delya-tag-vexaria',
    [
      D('Guten Tag. Ich habe eine Frage, und du musst nicht antworten.', 'neutral'),
      D('Flutmauer. Sonnenuntergang. Zwei Personen, eine davon mit Metallarm, die andere mit Metallarm. Ich nenne keine Namen.', 'signatur'),
      D('Aber ich hab Fotos.', 'freude'),
    ],
    [
      D('Keine Sorge. Ich sende sie nicht. Collin wollte. Ich hab ihm das Persönlichkeitsrecht erklärt. Mit dem Gesetzbuch. Mit der Kante.', 'neutral'),
      C('Es war die Ecke! Die ECKE, Delya!', 'wut'),
      D('Gratuliere übrigens. Inoffiziell. Das ist das Höchste, was ich anbieten kann.', 'freude'),
    ],
    M, { effects: [set('delya_kommentar_vexaria')] }),
  collinPaar: daily('delya-tag-collin-paar',
    [D('Ich nenne keine Namen.', 'signatur'), D('Aber ich hab Fotos. Vom Testbild. Und von dem, was davor war.', 'freude')],
    [D('Er singt jetzt morgens in der Redaktion. Leise. Für ihn. Es ist unerträglich. Ich freu mich für euch.', 'neutral')],
    M, { effects: [set('delya_kommentar_collin')] }),
  zeit: daily('delya-tag-zeit',
    [D('Ich arbeite an etwas. Über dich. Über uns alle. Aber es fehlt noch der Schluss.', 'besorgt'), erz(ZEIT_HINWEIS)],
    [D('Eine gute Geschichte erkennt man daran, dass sie sich weigert, fertig zu werden.')],
    M),
  redaktion: daily('delya-tag-redaktion',
    [D('Morgen. Redaktionskonferenz in zehn Minuten. Collin bringt Croissants und behauptet, das sei Recherche.', 'neutral')],
    [D('Heute auf dem Plan: Chrome-10-Werbung, Chrome-10-Werbung und eine Meldung über eine Katze, die einen Kran bedient. Die Katze ist der einzige echte Inhalt.', 'besorgt')],
    M),
  gericht: daily('delya-tag-gericht',
    [D('Psst. Bagatellgericht. Ein Mann ist angeklagt, weil er einen Werbebildschirm umgedreht hat. Damit er schlafen kann.', 'neutral')],
    [D('Der Richter hat ihn zu drei Tagen „Werbung mit Ton“ verurteilt. Das ist grausamer als Gefängnis. Ich schreibe mit.', 'wut')],
    M),
  markt: daily('delya-tag-markt',
    [D('Straßenumfrage. Frage eins: Haben Sie Angst vor der Zukunft? Frage zwei: Warum nicht?', 'neutral')],
    [
      D('Neun von zehn sagen: „Nö, ich hab ja Chrome-10-Gutscheine.“ Der Zehnte sagt: „Verpiss dich.“ Den Zehnten mag ich.', 'freude'),
      K('[AUFNAHME LÄUFT]'),
      D('Nicht auf den Zehnten zoomen. Der will das nicht.'),
    ],
    M),
  abend: daily('delya-tag-abend',
    [D('Abendnachrichten in zwanzig Minuten. Ich lese, was sie mir geben. Und manchmal betone ich es so, dass man merkt, was fehlt.', 'signatur')],
    [D('Die Kunst ist nicht, die Wahrheit zu sagen. Die Kunst ist, sie zwischen zwei Werbeblöcken nicht zu verlieren.')],
    M),
  quellen: daily('delya-tag-quellen',
    [D('Du hast mich nicht gesehen. Ich bin nicht hier. Und die Person, die gerade weggegangen ist, gibt es nicht.', 'besorgt')],
    [D('Bahnhof Mitte, nachts. Hier reden die Leute, die tagsüber schweigen. Ich höre zu. Ich nenne keine Namen.', 'neutral')],
    M),
  vertraut: daily('delya-tag-vertraut',
    [D('{name}. Gut, dass du da bist. Nicht wegen einer Geschichte. Einfach so.', 'freude')],
    [D('Ich habe eine Liste mit Menschen, denen ich vertraue. Sie ist kurz. Du bist jetzt drauf. Bleistift, nicht Kugelschreiber. Aber drauf.', 'signatur')],
    M),
  fremd: daily('delya-tag-fremd',
    [D('Delya Delloraine, NX-1. Darf ich fragen, wer Sie sind? Sie müssen nicht antworten. Die meisten tun es trotzdem.', 'neutral')],
    [D('Ich bin nicht Collin. Ich will keine Autogramme verteilen, ich will Antworten einsammeln. Sie sind herzlich eingeladen, mir welche zu geben.')],
    M),
  standard: daily('delya-tag-standard',
    [D('Hallo. Hast du etwas gesehen, das niemand sehen sollte? Nein? Schade. Komm wieder, wenn doch.', 'neutral')],
    [D('Weißt du, was das Schlimmste an diesem Beruf ist? Man hört nie auf zu fragen. Nicht mal beim Bäcker. „Warum ist das Brot grau?“ Er weiß es auch nicht.', 'besorgt')],
    M),
};

// ------------------------------------------------------------------------------------------- he-delya-delloraine-2

const he2 = dlg('he-delya-delloraine-2', [
  node('start', [
    erz('Redaktion, früh. Ein Großraumbüro mit fünf Schreibtischen, auf vier davon liegen Collins Fanartikel. Am fünften sitzt Delya, vor einem Diktiergerät und zwei Bechern Synth-Kaffee. Einer ist für dich.'),
    D('Setz dich. Ich hätte gern ein Interview. Ohne Kamera. Ohne Sendung. Ich will nur verstehen.', 'neutral'),
    erz('Sie drückt auf das Diktiergerät. Dann, nach kurzem Zögern, wieder auf Stopp.'),
    D('Erste Frage: Wer bist du, wenn keiner fragt?'),
  ], {
    choices: [
      { text: '„Jemand, der seine Schulden zahlt. Meistens.“', next: 'frage2', effects: [rel(ID, 10)] },
      { text: '„Niemand. Und das ist hier unten ein ziemlich guter Job.“', next: 'frage2', effects: [rel(ID, 15)] },
      { text: '„Eine Lügnerin. Und du schreibst das jetzt nicht auf.“', next: 'luege', effects: [rel(ID, 10)] },
      { text: 'Gegenfrage: „Wer bist du, wenn das Rotlicht aus ist?“', check: chk('he-delya-2-gegenfrage', 'ausstrahlung', 4, ['ueberreden']), next: 'gegenfrage' },
    ],
  }),
  node('luege', [
    D('Nein, schreib ich nicht. Lügen sind in der Unterstadt keine Nachricht. Sie sind Wetter.', 'freude'),
  ], { next: 'frage2' }),
  node('gegenfrage', [
    D('…', 'ueberrascht'),
    D('Jemand, der Angst hat, dass die eigene Stimme irgendwann nur noch vorliest. Gute Frage. Ich hasse gute Fragen, wenn sie mir gestellt werden.', 'besorgt'),
  ], { effects: [rel(ID, 30)], next: 'frage2' }),
  node('frage2', [
    D('Zweite Frage. Hunters Crew. Ich höre, ihr kassiert Schulden ein, ihr helft Kindern, ihr prügelt euch mit Rostzähnen. Was davon stimmt?'),
  ], {
    choices: [
      { text: '„Alles. Gleichzeitig. Meistens vor dem Frühstück.“', next: 'frage3' },
      { text: '„Ich red nicht über die Crew.“', next: 'schweigen', effects: [rel(ID, 20), rep('crew-hunter', 3)] },
      { text: '„Willst du was Echtes? Die Rostzähne nehmen an der Lötgasse zehn Prozent von jedem Kurier.“', check: chk('he-delya-2-tipp', 'strasse', 4, ['geruecht']), next: 'tipp', effects: [rel(ID, 40), rep('unterstadt', 3)] },
    ],
  }),
  node('schweigen', [
    D('Gut.', 'freude'),
    D('Wirklich. Gut. Wer nicht über die eigenen Leute redet, redet auch nicht über meine Quellen. Das ist eine bessere Antwort als alles andere.'),
  ], { next: 'frage3' }),
  node('tipp', [
    D('Zehn Prozent. Jeder Kurier. Seit wann?', 'ueberrascht'),
    ich('Seit die Wache an der Lötgasse Feierabend um sechs macht.'),
    erz('Sie schreibt mit. Schnell, sauber, ohne aufzusehen. Dann klappt sie das Notizbuch zu, und für einen Moment sieht sie aus, als hätte sie Hunger.'),
    D('Ich nenne keine Namen. Auch deinen nicht. Versprochen.', 'signatur'),
  ], { next: 'frage3' }),
  node('frage3', [
    D('Letzte Frage. Glaubst du, dass es hier unten besser wird?', 'besorgt'),
  ], {
    choices: [
      { text: '„Nein. Aber wir werden besser darin, es auszuhalten.“', next: 'ende' },
      { text: '„Ja. Wenn Leute wie du weiter fragen.“', next: 'ende', effects: [rel(ID, 20)] },
      { text: '„Frag mich in einem Jahr. Wenn ich noch lebe.“', next: 'ende' },
    ],
  }),
  node('ende', [
    erz('Sie sieht lange auf das Diktiergerät, das die ganze Zeit aus war.'),
    D('Danke. Das war das beste Interview, das ich nie senden werde.', 'freude'),
    D('Wenn du je etwas weißt, das die Stadt wissen sollte: Ich bin morgens hier. Und ich nenne keine Namen.'),
  ], { effects: [xp(30), rep('nx1-medien', 3), set('delya_interview')] }),
]);

// ------------------------------------------------------------------------------------------- he-delya-delloraine-4

const he4 = dlg('he-delya-delloraine-4', [
  node('start', [
    erz('Bahnhof Mitte, nach elf. Unter der kaputten Uhr an der Quellenecke steht Delya, Mantelkragen hoch, und spricht mit einer Frau in einer Schaffnermütze, die immer wieder über die Schulter guckt.'),
    Z('„Siebter Fall. Der Kalle vom Rechen. Läuft nachts mit offenen Augen in den Kanal und kommt morgens nicht wieder. Sagt nichts. Lächelt nur. Wie im Fernsehen.“'),
    D('Mehr brauche ich nicht. Danke. Geh nach Hause. Nicht durch den Tunnel.', 'besorgt'),
    erz('Die Frau verschwindet. Delya dreht sich zu dir um. Und dann, sehr leise:'),
    D('Nicht umdrehen. Hinter dir, am Fotoautomaten. Grauer Mantel. Steht da seit einer halben Stunde und hat noch kein Foto gemacht.', 'besorgt'),
  ], {
    choices: [
      { text: 'Den Mann in ein Gespräch über Ausweisfotos verwickeln, bis Delya weg ist.', check: chk('he-delya-4-ablenken', 'strasse', 5, ['ablenken', 'luegen']), next: 'ablenken' },
      { text: 'Blitzschnell sein Notizgerät aus der Manteltasche angeln.', check: chk('he-delya-4-taschendieb', 'reflexe', 5, ['taschendiebstahl']), next: 'klauen' },
      { text: 'Laut: „Delya Delloraine! Ich bin dein größter Fan! Autogramm!“', next: 'fan' },
      { text: 'Delya den Arm anbieten und einfach gehen. Ganz normal.', next: 'gehen' },
    ],
  }),
  node('ablenken', [
    erz('Du stellst dich neben den Grauen und fragst, ob der Automat „auch so ein Lächeln mit Zähnen“ kann. Du fragst nach Hintergründen. Nach Rabatten. Ob man mit Hut darf. Ob man mit Hund darf. Ob man mit Hut UND Hund darf.'),
    erz('Als er dich endlich abgeschüttelt hat, ist Delya weg. Er auch, ziemlich schnell, und er hat dabei in einen Kragen gesprochen.'),
  ], { effects: [rel(ID, 40)], next: 'treffen' }),
  node('klauen', [
    erz('Ein Rempler, ein „Oh, Verzeihung“, und in deiner Jackentasche steckt ein Notizgerät, das dir nicht gehört. Der Graue merkt es erst, als du schon die Treppe runter bist.'),
    erz('Auf dem Display: eine Liste. Sieben Namen. Neben jedem ein Uhrzeitstempel. Und ein kleines blaues Q als Kopfzeile.'),
  ], { effects: [rel(ID, 40), set('delya_liste_q')], next: 'treffen' }),
  node('fan', [
    erz('Der halbe Bahnsteig dreht sich um. Zwei Pendler zücken Telefone. Ein Betrunkener singt die NX-1-Erkennungsmelodie. Der Graue hat jetzt dreißig Zeugen und keine Lust mehr.'),
    D('Das war … furchtbar laut. Und sehr effektiv. Gib mir einen Stift.', 'freude'),
    erz('Sie unterschreibt dir tatsächlich ein Autogramm. „Für meinen größten Fan. Keine Namen. D.“'),
  ], { effects: [rel(ID, 30)], next: 'treffen' }),
  node('gehen', [
    erz('Ihr geht. Nicht schnell. Arm in Arm, wie zwei Leute, die vom letzten Zug kommen. Der Graue folgt euch bis zur Treppe. Dann bleibt er stehen. Ihr seid zu gewöhnlich, um interessant zu sein.'),
    D('Das war mutig. Und dumm. Die beste Mischung.', 'besorgt'),
  ], { effects: [rel(ID, 30)], next: 'treffen' }),
  node('treffen', [
    erz('Später, unter der Treppe zum Gleis zwei, zeigt dir Delya ihr Notizbuch. Sieben Einträge. Keine Namen, nur Orte und Zeiten. Kanal. Rohrsiedlung. Rechen. Immer nachts. Immer allein.'),
    D('Menschen verschwinden in der Unterstadt. Nicht so, wie sie immer verschwinden. Sie gehen freiwillig. Mit offenen Augen. Und wer zurückkommt, lächelt.', 'besorgt'),
    D('Ich habe keinen Beweis. Ich habe nur eine Liste und einen Mann im grauen Mantel. Das reicht nicht für eine Sendung. Das reicht für schlechte Träume.'),
  ], {
    choices: [
      { text: '„Ich helf dir. Wenn’s so weit ist.“', next: 'ende', effects: [rel(ID, 20), set('delya_hilfe_versprochen')] },
      { text: '„Vielleicht ist das Chrome 10.“', next: 'chrome' },
      { text: '„Lass das. Das ist zu groß für dich.“', next: 'gross' },
    ],
  }),
  node('chrome', [
    D('Vielleicht. Ich sage das nicht laut. Ich schreibe es nicht auf. Und du hast es von mir nicht gehört.', 'besorgt'),
    D('Ich nenne keine Namen. Aber ich nenne ein Produkt nicht, und das ist schlimmer.'),
  ], { effects: [set('geruecht_schlafwandler_chrome')], next: 'ende' }),
  node('gross', [
    D('Alles ist zu groß für mich. Deshalb arbeite ich so sorgfältig.', 'wut'),
    D('Aber danke, dass du Angst um mich hast. Das hat lange keiner mehr gemacht.', 'freude'),
  ], { effects: [rel(ID, 10)], next: 'ende' }),
  node('ende', [
    D('Wenn du jemanden siehst, der nachts mit offenen Augen in den Kanal läuft: Halt ihn nicht auf. Folg ihm. Und dann sag es mir.', 'besorgt'),
  ], { effects: [xp(50), set('delya_verschwundene'), { message: 'Delyas Liste: Diese Spur führt weiter in Akt 2.' }] }),
]);

// ------------------------------------------------------------------------------------------- he-delya-delloraine-6

const he6 = dlg('he-delya-delloraine-6', [
  node('start', [
    erz('Regie, kurz vor den Abendnachrichten. Delya steht mit einem Datenstick in der Hand vor dem Sendepult. Neben ihr, mit verschränkten Armen und einem Lineal in der Brusttasche: ein glattrasierter Mann mit Namensschild „H. Glattstrich – Qualitätssicherung“.'),
    Z('„Abgelehnt. Zu düster. Keine Verkaufsbotschaft. Die Zuschauer wollen Lösungen, Frau Delloraine. Chrome 10 ist eine Lösung.“'),
    erz('Glattstrich geht zum Kaffeeautomaten. Delya sieht dich an. Auf dem Stick: ihr Bericht. Drei Minuten über Ripper und die Zehn-Credit-Kinder. Über die Schlafwandler. Über eine Unterstadt, die keiner sendet.'),
    D('Ich lese in vier Minuten die Nachrichten. Und der Bericht ist nicht drin.', 'wut'),
  ], {
    choices: [
      { text: 'Den Stick in den Sendeplan schmuggeln. Hinter der Wetterkarte.', check: chk('he-delya-6-sendeplan', 'technik', 6, ['hacken', 'daten']), next: 'technik' },
      { text: 'Glattstrich am Kaffeeautomaten in ein Gespräch über Lineale verwickeln.', check: chk('he-delya-6-glattstrich', 'ausstrahlung', 6, ['ablenken', 'ueberreden']), next: 'ablenken' },
      { text: 'Den Stick in Collins Haarsprayschachtel stecken. Die prüft keiner.', next: 'haarspray' },
      { text: '„Lass es. Du verlierst deinen Job.“', next: 'lass' },
    ],
  }),
  node('technik', [
    erz('Der Sendeplan ist eine Tabelle mit Passwort „NX1NX1“. Du schiebst Delyas Datei hinter die Wetterkarte, benennst sie in „Wetter_lang_FINAL_wirklich.mp4“ um und sperrst die Zeile für Änderungen.'),
    erz('Um 19:03 sagt der Wettermann „Und jetzt: die Aussichten“. Dann laufen drei Minuten Unterstadt. Ungeschnitten.'),
  ], { effects: [rel(ID, 40)], next: 'gesendet' }),
  node('ablenken', [
    ich('Ist das ein Edelstahllineal? Mit Millimeter UND Zoll? Darf ich mal halten? Wie misst man damit Qualität? In Zoll oder Millimeter?'),
    Z('Glattstrich blüht auf. Niemand hat ihn je nach seinem Lineal gefragt. Er erklärt dir den Unterschied zwischen geeicht und kalibriert, mit Beispielen, mit Anekdoten, mit einem Tonfall, der verdächtig nach Liebe klingt.'),
    erz('Hinter ihm schiebt Delya den Stick ins Pult. Die Sendung läuft. Glattstrich hört nichts, er erklärt gerade Zoll.'),
  ], { effects: [rel(ID, 40)], next: 'gesendet' }),
  node('haarspray', [
    erz('Collins Haarsprayschachtel: Samt, Gold, „NICHT ÖFFNEN – FRISURNOTFALL“. Der Stick passt perfekt. Der Kameramann sieht dich dabei, sein Visier blinkt.'),
    K('[ICH HAB NICHTS GESEHEN.]'),
    K('[ICH SCHALTE DEN STICK IN 3 … 2 …]'),
    erz('Die Schachtel steht neben dem Sendepult, wie jeden Abend. Um 19:04 drückt der Kameramann einen Knopf, den es eigentlich nicht gibt.'),
  ], { effects: [rel(ID, 30), { relation: 'kameramann', delta: 20 }, { advanceTime: 20 }], next: 'gesendet' }),
  node('lass', [
    D('Mein Job ist es, das zu senden. Wenn ich es nicht sende, habe ich meinen Job schon verloren. Nur der Vertrag weiß es noch nicht.', 'wut'),
    D('Hilf mir. Oder geh. Aber sag mir nicht, ich soll es lassen.'),
  ], {
    choices: [
      { text: 'Den Stick in Collins Haarsprayschachtel stecken.', next: 'haarspray' },
      { text: 'Gehen.', next: 'gegangen' },
    ],
  }),
  node('gegangen', [
    erz('Du gehst. Hinter dir liest Delya um 19:00 die Nachrichten. Chrome 10. Chrome 10. Eine Katze auf einem Kran. Ihre Stimme ist ganz ruhig. Zu ruhig.'),
  ], { effects: [rel(ID, -20), set('delya_bericht_verpasst')] }),
  node('gesendet', [
    erz('Drei Minuten. Bilder von Kindern, die Implantate in Socken tragen. Von Ripper, der zählt. Von einer leeren Pritsche im Kanal. Delyas Stimme darüber, nüchtern, ohne ein einziges Adjektiv.'),
    erz('Bei Minute drei schaltet die Regie panisch auf Werbung. Zu spät. Auf den Stadt-TV-Wänden von Schrottmarkt und Neon-Gasse bleiben die Leute stehen.'),
    Z('Glattstrich kommt aus dem Kaffeeraum gerannt, das Lineal gezückt wie eine Waffe. „Wer war das? WER WAR DAS?“'),
    D('Technischer Fehler, Herr Glattstrich. Die Wetterkarte war zu lang.', 'signatur'),
    erz('Später, auf der Feuertreppe des Studios, zündet sie sich eine Zigarette an, die sie nicht raucht. Sie hält sie nur.'),
    D('Ich hab morgen ein Gespräch beim Intendanten. Vielleicht verliere ich den Job. Vielleicht bekomme ich eine Abmahnung. Vielleicht eine eigene Sendung. Bei NX-1 weiß man das nie.', 'besorgt'),
    D('Danke, {name}. Ich nenne keine Namen. Aber deinen vergesse ich nicht.', 'freude'),
  ], { effects: [xp(70), rep('unterstadt', 5), rep('nx1-medien', -3), set('delya_bericht_gesendet')] }),
]);

// ------------------------------------------------------------------------------------------- he-delya-delloraine-8/10 (act2)

const he8 = dlg('he-delya-delloraine-8', [
  node('start', [
    erz('Die Feuertreppe des Studios, nachts. Delya hat zwei Becher Synth-Kaffee mitgebracht und ein altes Foto: ein kleines Mädchen mit einem Kassettenrekorder, der größer ist als sein Kopf.'),
    D('Ich war acht. Unser Block in der Rohrsiedlung sollte abgerissen werden. Im Fernsehen hieß es: „Freiwillige Umsiedlung, alle Bewohner einverstanden“. Keiner war einverstanden.', 'trauer'),
    D('Ich bin mit dem Rekorder durch alle Wohnungen und hab gefragt. Dreiundvierzig Leute. Dreiundvierzig Mal „Nein“. Die Kassette hab ich zum Sender gebracht. Sie haben sie nie gespielt.', 'wut'),
    D('Deshalb mach ich das. Nicht für die Wahrheit. Für die dreiundvierzig.', 'besorgt'),
  ], {
    choices: [
      { text: '„Hast du die Kassette noch?“', next: 'kassette' },
      { text: 'Ihr den Becher nachfüllen und schweigen.', next: 'ende', effects: [rel(ID, 20)] },
    ],
  }),
  node('kassette', [D('Natürlich. Unter meinem Kopfkissen. Ich nenne keine Namen. Aber ich habe dreiundvierzig Stimmen.', 'freude')], { next: 'ende' }),
  node('ende', [erz('Ihr sitzt, bis der Kaffee kalt ist. Unten blinkt die Stadt. Irgendwo darin dreiundvierzig Leute, die nie gesendet wurden.')], { effects: [xp(80), rel(ID, 40)] }),
]);

const he10 = dlg('he-delya-delloraine-10', [
  node('start', [
    erz('Ein neues Studio, eine Etage unter Collins. Kahle Wände, ein Tisch, zwei Stühle, eine Kamera. Über der Tür ein Schild: „DELLORAINE – UNGEFRAGT“.'),
    D('Meine eigene Sendung. Fünfzehn Minuten. Mittwochs, 23:40. Keine Werbung. Kein Glattstrich. Kein Collin, außer er bringt Croissants.', 'freude'),
    D('Erster Gast: du. Und vorher das hier.', 'signatur'),
    erz('Sie reicht dir einen Presseausweis in Gold, schwer wie ein Versprechen. Darauf, wo der Name stehen müsste: nichts.'),
    D('Ich nenne keine Namen. Den musst du selbst eintragen.', 'freude'),
  ], { effects: [{ give: 'presseausweis-gold' }, xp(120), rel(ID, 50), rep('nx1-medien', 10)] }),
]);

// ------------------------------------------------------------------------------------------- Figur

const delya: NpcDef = {
  id: ID,
  name: 'Delya Delloraine',
  portrait: 'delya',
  sprite: 'delya-walk',
  faction: 'nx1-medien',
  // Kennzeichen laut world.md §4.7; nicht in ROMANCE_ENABLED, daher nur Freundschaft.
  romanceable: true,
  bio: 'Nachrichtensprecherin und Reporterin bei NX-1, Mitte dreißig. Recherchiert, wo andere moderieren. Nennt keine Namen.',
  gifts: {
    loves: ['zeitung-papier', 'reporter-notizbuch', 'exklusiv-tipp'],
    likes: ['synth-kaffee', 'kamera-objektiv', 'teleprompter-chip', 'gesetzbuch', 'echtobst-apfel', 'hofhonig'],
    dislikes: ['autogrammkarte-collin', 'liebesroman'],
    hates: ['peilsender', 'rostige-dose', 'virus-implantat'],
  },
  schedule: [
    { slot: 'morgen', place: { map: 'nx1-studio', at: 'redaktion' } },
    { slot: 'tag', days: ['di', 'do'], place: { map: 'gerichtssaal', at: 'zuschauerbaenke' }, pose: 'sitzen' },
    { slot: 'tag', place: { map: 'schrottmarkt', at: 'stadt-tv' } },
    { slot: 'abend', place: { map: 'nx1-studio', at: 'studio-set' } },
    { slot: 'nacht', days: ['fr', 'sa'], place: { map: 'bahnhof-mitte', at: 'quellen-ecke' } },
    { slot: 'nacht', place: 'away' },
  ],
  heartEvents: [
    { id: 'he-delya-delloraine-2', hearts: 2, map: 'nx1-studio', time: 'morgen', dialogue: 'he-delya-delloraine-2' },
    {
      id: 'he-delya-delloraine-4', hearts: 4, map: 'bahnhof-mitte', time: 'nacht',
      when: all(seen('he-delya-delloraine-2'), { weekday: ['fr', 'sa'] }), dialogue: 'he-delya-delloraine-4',
    },
    { id: 'he-delya-delloraine-6', hearts: 6, map: 'nx1-studio', time: 'abend', when: seen('he-delya-delloraine-4'), dialogue: 'he-delya-delloraine-6' },
    { id: 'he-delya-delloraine-8', hearts: 8, map: 'nx1-studio', time: 'abend', when: all(AKT2, seen('he-delya-delloraine-6')), dialogue: 'he-delya-delloraine-8' },
    { id: 'he-delya-delloraine-10', hearts: 10, map: 'nx1-studio', time: 'abend', when: all(AKT2, seen('he-delya-delloraine-8')), dialogue: 'he-delya-delloraine-10' },
  ],
  talk: [
    talk('delya-tag-rivale', { rival: ID }),
    talk('delya-tag-vexaria', all(VEXARIA, noFlag('delya_kommentar_vexaria'))),
    talk('delya-tag-collin-paar', all(flag('collin_kuss'), noFlag('delya_kommentar_collin'))),
    talk('delya-tag-zeit', AKT1, 8),
    talk('delya-tag-fremd', not({ met: ID })),
    talk('delya-tag-redaktion', { time: 'morgen' }),
    talk('delya-tag-gericht', all({ weekday: ['di', 'do'] }, { time: 'tag' })),
    talk('delya-tag-quellen', { time: 'nacht' }),
    talk('delya-tag-vertraut', undefined, 5),
    talk('delya-tag-markt', { time: 'tag' }),
    talk('delya-tag-abend', { time: 'abend' }),
    talk('delya-tag-standard'),
  ],
};

export const part: ContentPart = {
  npcs: { [ID]: delya },
  dialogues: byId([
    T.rivale, T.vexaria, T.collinPaar, T.zeit, T.redaktion, T.gericht, T.markt, T.abend, T.quellen, T.vertraut, T.fremd,
    T.standard, he2, he4, he6, he8, he10,
  ]),
};
