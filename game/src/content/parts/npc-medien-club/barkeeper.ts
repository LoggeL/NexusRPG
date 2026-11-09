// Der Barkeeper – High Voltage, spricht ausschließlich in Dreizeilern (world.md §4.4, §4.6, §11.2).
// Tagesablauf nach design/plan/act1.json (npcSchedules.barkeeper), Herz-Ereignisse he-barkeeper-2/4/6 (plan events),
// he-barkeeper-8/10 angelegt und an act2 gebunden. Begleiter ab ♥8 (Akt 1 erreichbar, Einsatzgrenzen siehe gaps).
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode, NpcDef } from '../../../modules/contracts';
import {
  type Menu, AKT1, AKT2, NOT_VEX, VEX, VEXARIA, ZEIT_HINWEIS, all, byId, chk, daily, dlg, erz, hearts, ich, noFlag,
  node, not, rel, rep, seen, set, sp, talk, xp,
} from './_util';

const B = sp('barkeeper');
const H = sp('hunter');
const A = sp('aria');

const PROBEZEIT: Condition = { quest: 'main-1-probezeit', state: 'done' };
const IM_TEAM: Condition = { recruited: 'barkeeper' };

/** Dreizeiler: drei Zeilen, durch „ / “ getrennt (so zeigt sie das Spiel in einer Sprechblase). */
const vers = (a: string, b: string, c: string): string => `${a} / ${b} / ${c}`;

// ------------------------------------------------------------------------------------------- Menü

function menu(): Menu {
  const zurueck: DialogueChoice[] = [{ text: 'Noch was.', next: 'menue', id: 'zurueck' }, { text: 'Danke. Bis später.' }];

  const choices: DialogueChoice[] = [
    { text: 'Auf sein Handgelenk zeigen. Die Zahl kennst du.', tag: '[Knast]', when: { origin: 'origin-knastvogel' }, once: true, id: 'b-knast', next: 'b-knast', effects: [rel('barkeeper', 40)] },
    { text: 'Was erzählt man sich so?', tag: '[Barkeeper ♥2]', requires: hearts('barkeeper', 2), when: PROBEZEIT, next: 'geruecht' },
    {
      text: 'Du siehst aus, als bräuchtest du Hilfe.', id: 'b-limo', next: 'limo',
      when: all(PROBEZEIT, { quest: 'side-neon-limo', state: 'inactive' }, { time: ['abend', 'nacht'] }),
      effects: [{ startQuest: 'side-neon-limo' }],
    },
    {
      text: 'Was ist mit deinem Notizbuch passiert?', tag: '[Barkeeper ♥3]', id: 'b-vers', next: 'vers-quest',
      requires: hearts('barkeeper', 3), when: all(PROBEZEIT, { quest: 'pers-barkeeper-letzter-vers', state: 'inactive' }),
      effects: [{ startQuest: 'pers-barkeeper-letzter-vers' }],
    },
    { text: '„Ich halt nie an. Das weißt du, oder?“', when: VEX, once: true, id: 'b-vex', next: 'vex' },
    { text: 'Was trinkst du eigentlich selbst?', once: true, id: 'b-trinken', next: 'trinken' },
    { text: 'Die Arena. Erzählst du mir mehr?', when: seen('he-barkeeper-6'), once: true, id: 'b-arena', next: 'arena' },
    {
      text: 'Kämpf mit mir. Wenn’s drauf ankommt.', tag: '[Barkeeper ♥8]', id: 'b-rekrut', next: 'rekrut',
      requires: hearts('barkeeper', 8), when: all(PROBEZEIT, not(IM_TEAM)), effects: [{ recruit: 'barkeeper' }],
    },
    { text: 'Geh zurück hinter deine Bar.', when: IM_TEAM, next: 'entlassen', effects: [{ dismiss: 'barkeeper' }] },
    { text: 'Danke. Bis später.' },
  ];

  const nodes: DialogueNode[] = [
    node('menue', [B(vers('Noch etwas, Gast?', 'das Glas hört dir geduldig zu', 'ich tu’s ebenfalls.'))], { choices }),
    node('b-knast', [
      erz('Er dreht das Handgelenk, bis die tätowierte Zahl unter dem Ärmel verschwindet. Dann schiebt er dir ein Glas hin. Wasser. Kalt.'),
      B(vers('Die Zahl am Gelenk', 'du kennst sie aus den Duschen', 'wir reden nicht drüber.')),
      B(vers('Doch wer drinnen war', 'trinkt bei mir das erste Glas', 'immer ohne Preis.')),
    ], { choices: zurueck }),
    node('geruecht', [
      B(vers('Xion kauft Kisten', 'dienstags, wenn der Nebel kommt', 'Ripper trägt sie mit.')),
      B(vers('Der Richter spielt Eins!', 'donnerstags im hinteren Eck', 'und verliert so gern.')),
      B(vers('Collin hat Angst', 'vor einem Gesicht aus Licht', 'das nie Pause macht.')),
    ], { choices: zurueck, effects: [set('geruecht_container_77'), set('geruecht_richter_eins'), set('geruecht_pixel_pete')] }),
    node('limo', [
      erz('Hinter ihm piept Mixi, der Mixroboter, eine Melodie, die verdächtig nach Fehlermeldung klingt. Aus seinem Strohhalm tropft etwas Grünes.'),
      B(vers('Der Club wird bald zehn', 'Hunter will ein Neon ohne Gift', 'Mixi will nur sterben.')),
      B(vers('Leuchtalge, Minze', 'und Eis aus der Oberstadt', 'bring sie, und ich mische.')),
      ich('Leuchtalge in der Brackbucht, Minze im Kanal, Eis da oben. Klingt nach einem Wochenende.'),
      B(vers('Drei Gäste probieren', 'Hunter, Raven und Aria', 'drei Arten von Durst.')),
    ], { choices: zurueck }),
    node('vers-quest', [
      erz('Er legt ein Notizbuch auf den Tresen. Leder, abgegriffen. Drinnen: Dreizeiler in winziger Schrift, und darüber, in leuchtendem Filzstift, Raketen, ein Hund mit acht Beinen und eine Sonne mit Sonnenbrille.'),
      B(vers('Jakko fand mein Buch', 'jetzt fliegen Hunde durch den Herbst', 'der letzte Vers fehlt.')),
      B(vers('Ich bin nicht böse', 'nur ein Gedicht hat kein Ende', 'kannst du es finden?')),
    ], { choices: zurueck }),
    node('vex', [
      B(vers('Du rennst immer fort', 'Pakete bleiben eine Nacht', 'Gläser bleiben hier.')),
      B(vers('Doch dein Hocker hier', 'steht seit Wochen am selben Fleck', 'du hast ihn gewählt.')),
    ], { choices: zurueck, effects: [rel('barkeeper', 20)] }),
    node('trinken', [
      erz('Er hebt eine Tasse. Darin dampft Tee, so hell, dass er fast nach nichts aussieht.'),
      B(vers('Tee, der nichts verspricht', 'kein Rausch, kein Morgen danach', 'nur warme Hände.')),
    ], { choices: zurueck }),
    node('arena', [
      B(vers('Vierzig Kämpfe lang', 'nannten sie mich „Den Stillen“', 'ich war nur müde.')),
      B(vers('Der letzte war ein Kind', 'mit einer Klinge, viel zu groß', 'ich legte meine hin.')),
      erz('Er poliert dasselbe Glas jetzt seit einer Minute. Es glänzt längst.'),
    ], { choices: zurueck }),
    node('rekrut', [
      erz('Er legt das Tuch zusammen. Einmal, zweimal, dreimal. Dann greift er unter den Tresen und zieht eine Kabelpeitsche hervor, sauber aufgerollt wie ein Gartenschlauch.'),
      B(vers('Hinter dieser Bar', 'beende ich jeden Streit', 'davor auch, mit dir.')),
      B(vers('Nur nicht freitags spät', 'samstags gehört die Nacht dem Tresen', 'Hunter mixt zu schlecht.')),
    ], { effects: [set('barkeeper_kaempft_mit')] }),
    node('entlassen', [B(vers('Das Tuch wartet schon', 'die Gläser haben gezählt', 'wie lang ich fort war.'))]),
  ];
  return { choices, nodes };
}

const M = menu();

// ------------------------------------------------------------------------------------------- Tagesgespräche

const T = {
  rivale: daily('barkeeper-tag-rivale',
    [B('…'), erz('Er stellt dir ein Glas Wasser hin. Ohne Eis. Ohne Blick. Ohne Vers.')],
    [B('…'), erz('Hunter, am anderen Ende: „Wenn der nicht mal mehr reimt, hast du echt Scheiße gebaut.“')],
    { choices: [{ text: 'Schon gut.' }], nodes: [] }),
  vexaria: daily('barkeeper-tag-vexaria',
    [
      erz('Er schiebt dir zwei Gläser hin. Dann ein drittes, halbvoll, mit einem Strohhalm, an dem Lippenstift klebt, der nicht deiner ist.'),
      B(vers('Zwei Hocker, ein Pulli', 'die Ärmel sind zu lang für sie', 'ich polier woanders.')),
      B(vers('Hinterm Club die Wand', 'hielt euch beide gestern Nacht', 'sie verlangt jetzt Miete.')),
    ],
    [
      B(vers('Sie lacht lauter jetzt', 'und du drehst dich zu ihr um', 'das ist neu an dir.')),
      A('Hat der gerade über uns gedichtet? HAT DER ÜBER UNS GEDICHTET?', 'freude'),
      B(vers('Ich dichte nur Gläser', 'dass zwei aus einem trinken', 'ist nicht meine Schuld.')),
    ],
    M, { effects: [set('barkeeper_kommentar_vexaria')] }),
  aria: daily('barkeeper-tag-aria',
    [B(vers('Aria trinkt jetzt', 'aus deinem Glas, wenn du gehst', 'früher klaute sie Eis.'))],
    [B(vers('Ein Stuhl ist zerlegt', 'sie hat dabei gelächelt', 'Hunter schreibt’s dir an.'))],
    M, { effects: [set('barkeeper_kommentar_aria')] }),
  zeit: daily('barkeeper-tag-zeit',
    [B(vers('Manche Verse brauchen', 'mehr als einen kalten Winter', 'dieser braucht noch zwei.')), erz(ZEIT_HINWEIS)],
    [B(vers('Was ich dir noch sag', 'braucht einen Abend mit Sturm', 'der Sturm kommt noch.'))],
    M),
  montag: daily('barkeeper-tag-montag',
    [
      erz('Montag. Kein Tresen, kein Tuch. Er sitzt auf einem umgedrehten Fass vor einem rostigen Gitter, hinter dem einmal Scheinwerfer hingen.'),
      B(vers('Montag. Salz und Rost', 'die alte Arena schweigt', 'ich höre sie doch.')),
    ],
    [
      B(vers('Heute mixt der Chef', 'ich bitte dich um eines:', 'bestell nur Wasser.')),
      erz('Aus der Ferne, quer über die Hafenkante, hört man Hunter brüllen: „MIXI! Was heißt ‚Fehler 404 Limette‘?!“'),
    ],
    M),
  morgen: daily('barkeeper-tag-morgen',
    [B(vers('Morgen, kalt und blau', 'Gläser zählen ihre Flecken', 'ich zähle mit ihnen.'))],
    [B(vers('Bruno schläft im Sitzen', 'Mixi träumt von Strom', 'nur der Kaffee wacht.'))],
    M),
  klinge: daily('barkeeper-tag-klinge',
    [
      erz('Auf dem Dach der Neon-Gasse. Eine schmale Klinge schneidet Kreise in den Smog, langsam, als würde sie etwas umrühren. Dann steht sie still.'),
      B(vers('Klinge, Dach und Wind', 'die Stadt unter mir ist laut', 'die Klinge ist still.')),
    ],
    [B(vers('Sieh nicht auf die Hand', 'sieh auf den Atem davor', 'da fängt alles an.'))],
    M),
  markt: daily('barkeeper-tag-markt',
    [B(vers('Zitronen im Smog', 'Hunter zahlt zwölf für eine', 'ich handle auf neun.'))],
    [B(vers('Der Händler da drüben', 'wiegt mit dem Daumen auf der Waage', 'sein Daumen ist schwer.'))],
    M),
  wochenende: daily('barkeeper-tag-wochenende',
    [B(vers('Freitag, volles Haus', 'zwölf Hände wollen Neon', 'ich hab zwei. Das reicht.'))],
    [
      erz('Er schenkt drei Gläser gleichzeitig ein, ohne hinzusehen, und wirft einem Gast, der gerade die Faust hebt, einen Blick zu. Der Gast setzt sich wieder.'),
      B(vers('Ein Blick ist billig', 'eine Faust kostet Zähne', 'die meisten zahlen Blick.')),
    ],
    M),
  vertraut: daily('barkeeper-tag-vertraut',
    [B(vers('Dein Platz ist noch warm', 'ich hab ihn nicht weggewischt', 'das heißt etwas hier.'))],
    [B(vers('Du kamst als Fremde', 'jetzt kennt der Tresen dein Glas', 'und ich deinen Durst.'))],
    M),
  fremd: daily('barkeeper-tag-fremd',
    [B(vers('Neues Gesicht hier', 'trinkt zu schnell und redet laut', 'bleibt vielleicht ein Jahr.'))],
    [B(vers('Leeres Glas am Rand', 'niemand sieht, wie spät es ist', 'Hunter sieht es doch.'))],
    M),
  bar: daily('barkeeper-tag-bar',
    [B(vers('Bestell, was du willst', 'ich mische, was du brauchst', 'zahl, was Hunter sagt.'))],
    [
      B(vers('Der Ecktisch flüstert', 'Ripper zählt sein Wechselgeld', 'zweimal, nie genug.')),
      H('Hör auf, über meine Kunden zu dichten! … Mach weiter. Aber reim nicht über mich.'),
      B(vers('Der Chef will kein Lied', 'doch seine Brille rutscht', 'wenn er lächeln muss.')),
    ],
    M),
};

// ------------------------------------------------------------------------------------------- he-barkeeper-2

const he2 = dlg('he-barkeeper-2', [
  node('start', [
    erz('Halb sieben. Das High Voltage riecht nach kaltem Rauch und Zitronenreiniger. Auf dem Tresen stehen hundert Gläser in Reihen, als warteten sie auf eine Inspektion.'),
    erz('Der Barkeeper legt dir ein weißes Tuch über die Schulter. Ohne Frage. Ohne Erklärung.'),
    B(vers('Hundert Gläser hier', 'jedes hat einen Fleck, den', 'nur das Licht verrät.')),
  ], {
    choices: [
      { text: 'Schnell und sauber aus dem Handgelenk polieren.', check: chk('he-barkeeper-2-handgelenk', 'reflexe', 4, ['geschick']), next: 'schnell' },
      { text: 'Ein Glas „aus Versehen“ fallen lassen. Mal sehen, was er macht.', next: 'fallen' },
      { text: 'Langsam. Glas für Glas. Gegen das Licht halten.', next: 'langsam', effects: [{ advanceTime: 45 }] },
      { text: '„Wie lange machst du das schon?“', once: true, id: 'he2-frage', next: 'frage' },
    ],
  }),
  node('frage', [
    B(vers('Seit die Fäuste ruhen', 'ich zählte erst Kämpfe, dann', 'zähl ich jetzt Gläser.')),
    erz('Er nimmt ein Glas, dreht es einmal, und es glänzt. Du hast keine Ahnung, was er gemacht hat.'),
  ], {
    choices: [
      { text: 'Schnell und sauber aus dem Handgelenk polieren.', check: chk('he-barkeeper-2-handgelenk', 'reflexe', 4, ['geschick']), next: 'schnell' },
      { text: 'Ein Glas „aus Versehen“ fallen lassen.', next: 'fallen' },
      { text: 'Langsam. Glas für Glas.', next: 'langsam', effects: [{ advanceTime: 45 }] },
    ],
  }),
  node('schnell', [
    erz('Drehen, wischen, gegen das Licht, abstellen. Nach zwanzig Gläsern hast du den Rhythmus. Nach vierzig singt ein Glas, als du mit dem Fingernagel dagegen tippst.'),
    B(vers('Das Glas hat gesungen', 'es tut das nur für Hände', 'die nicht lügen wollen.')),
  ], { effects: [rel('barkeeper', 30)], next: 'ende' }),
  node('fallen', [
    erz('Du lässt ein Glas über die Tresenkante kippen. Es ist noch nicht ganz unten, da steht er schon neben dir. Seine Hand ist unter dem Glas, bevor du sie hast kommen sehen. Er hat nicht mal hingeschaut.'),
    B(vers('Das war Absicht, Gast', 'beim nächsten fang ich nicht', 'dann zahlt es Hunter.')),
    erz('Für einen Barkeeper war das zu schnell. Viel zu schnell. So bewegt sich jemand, der früher für etwas anderes bezahlt wurde.'),
  ], { effects: [rel('barkeeper', 20), set('barkeeper_reflexe_gesehen')], next: 'ende' }),
  node('langsam', [
    erz('Eine Dreiviertelstunde. Du findest einen Lippenstiftrand, einen Fingerabdruck, der verdächtig nach Hunter aussieht, und einen Kronkorken, der in einem Glas festklebt.'),
    B(vers('Langsam ist nicht schlecht', 'wer jeden Fleck einzeln sieht', 'übersieht nichts mehr.')),
  ], { effects: [rel('barkeeper', 30)], next: 'ende' }),
  node('ende', [
    erz('Er nimmt dir das Tuch von der Schulter, faltet es und legt es dir in die Hand. Dann schiebt er zwanzig Credits über den Tresen.'),
    B(vers('Behalte das Tuch', 'wer polieren kann, der kann', 'auch am Abend mixen.')),
  ], {
    effects: [
      { credits: 20 }, xp(30), set('barkeeper_polieren'),
      { checkBuff: { id: 'barkeeper-ruhige-hand', label: 'Ruhige Hand', value: 1, attribute: 'reflexe', tags: ['geschick', 'barschicht'] } },
    ],
  }),
]);

// ------------------------------------------------------------------------------------------- he-barkeeper-4

const he4 = dlg('he-barkeeper-4', [
  node('start', [
    erz('Dachterrasse, mittags. Der Smog liegt wie Watte über der Neon-Gasse. Der Barkeeper steht barfuß auf einer Teerpappe, die Klinge locker in der Hand. Neben ihm, an die Lüftung gelehnt: ein Besenstiel.'),
    B(vers('Nimm dir den Besen', 'die Klinge ist noch zu scharf', 'für deinen Atem.')),
    erz('Er macht es vor: einatmen, Klinge hoch. Ausatmen, Klinge runter. Langsam. So langsam, dass eine Taube auf der Lüftung sitzen bleibt.'),
  ], {
    choices: [
      { text: 'Seinen Bewegungen exakt folgen. Atem und Stiel zugleich.', check: chk('he-barkeeper-4-atem', 'reflexe', 5, ['konzentration', 'kampf']), next: 'reflexe' },
      { text: 'Die Haltung einfach stur halten, bis die Beine brennen.', check: chk('he-barkeeper-4-haltung', 'koerper', 5, ['ausdauer']), next: 'koerper' },
      { text: 'Nur atmen. Den Besen liegen lassen.', next: 'atmen', effects: [{ advanceTime: 60 }] },
      { text: 'Mit dem Besenstiel nach ihm schlagen. Überraschung!', next: 'angriff' },
    ],
  }),
  node('reflexe', [
    erz('Hoch, runter. Ein, aus. Irgendwann hörst du die Gasse nicht mehr, nur noch das Pfeifen des Windes am Lüftungsrohr. Dein Besen und seine Klinge bewegen sich gleichzeitig. Die Taube bleibt sitzen.'),
    B(vers('Die Taube bleibt da', 'das heißt, du bist kein Sturm mehr', 'nur noch Wind. Sehr gut.')),
  ], { effects: [rel('barkeeper', 40)], next: 'ende' }),
  node('koerper', [
    erz('Nach zehn Minuten zittern deine Oberschenkel. Nach zwanzig zittert alles. Du stehst trotzdem. Der Barkeeper legt dir zwei Finger auf den Rücken und drückt dich einen Zentimeter gerader.'),
    B(vers('Stur ist auch ein Weg', 'der Berg atmet nicht, und doch', 'steht er seit Ewigkeiten.')),
  ], { effects: [rel('barkeeper', 30)], next: 'ende' }),
  node('atmen', [
    erz('Du setzt dich im Schneidersitz neben die Taube und atmest. Eine Stunde lang. Unten hupt ein Schwebetaxi, oben zieht der Smog vorbei. Irgendwann merkst du, dass du lächelst und nicht weißt, warum.'),
    B(vers('Wer erst atmen lernt', 'braucht die Klinge später kaum', 'das ist der Trick dabei.')),
  ], { effects: [rel('barkeeper', 30)], next: 'ende' }),
  node('angriff', [
    erz('Du schwingst den Besenstiel. Er ist nicht mehr da. Er steht hinter dir, die flache Seite der Klinge berührt ganz leicht deinen Nacken. Die Taube ist trotzdem weggeflogen. Wegen dir.'),
    B(vers('Mutig, doch zu laut', 'die Taube hat dich gehört', 'lange vor mir schon.')),
    erz('Zum ersten Mal siehst du ihn lachen. Lautlos. Nur die Schultern.'),
  ], { effects: [rel('barkeeper', 20)], next: 'atmen-danach' }),
  node('atmen-danach', [
    erz('Er drückt dir den Besen wieder in die Hand und macht weiter, als wäre nichts gewesen. Ein, aus. Du machst mit. Diesmal ohne Überraschung.'),
  ], { effects: [{ advanceTime: 30 }], next: 'ende' }),
  node('ende', [
    B(vers('Ruhiger Atem nun', 'trag ihn mit dir in den Streit', 'er wiegt nichts. Er hilft.')),
    erz('Er wischt die Klinge an einem Tuch ab und steckt sie in eine Scheide, die du vorher nicht gesehen hast. Unter seiner Weste. Natürlich.'),
  ], {
    effects: [
      xp(50), set('barkeeper_ruhiger_atem'),
      { checkBuff: { id: 'barkeeper-ruhiger-atem', label: 'Ruhiger Atem', value: 1, attribute: 'reflexe' } },
      { message: 'Ruhiger Atem: +1 auf den nächsten Reflexe-Check.' },
    ],
  }),
]);

// ------------------------------------------------------------------------------------------- he-barkeeper-6

const he6 = dlg('he-barkeeper-6', [
  node('start', [
    erz('Montagabend an der Hafenkante. Hinter einem verrosteten Gitter: ein Ring aus Containern, ausgeblichene Plakate, ein Scheinwerfer, der nur noch an einem Kabel hängt. „DIE RINGE VON ROSTKAI – HEUTE: DER STILLE“.'),
    erz('Der Barkeeper sitzt auf einem Fass davor. Er hat dich kommen hören. Er hat dich wahrscheinlich schon vor drei Containern kommen hören.'),
    B(vers('Hier stand ich einst', 'sie riefen einen Namen', 'der nicht meiner war.')),
    erz('Schritte. Ein Mann mit Fischschürze und Goldzahn kommt um die Ecke, eine Zigarre im Mundwinkel, die Arme ausgebreitet.'),
    sp('narrator')('„Der STILLE! Ich wusste, du kommst zurück! Ein Kampf, Freitag, die Rostzähne zahlen dreitausend. Einer. Für die alten Zeiten.“ – Das ist Zeno. Früher Veranstalter. Heute Fischhändler. Immer noch Veranstalter.'),
  ], {
    choices: [
      { text: '„Er hat Nein gesagt. Er sagt nur mit weniger Worten.“', check: chk('he-barkeeper-6-zeno', 'ausstrahlung', 5, ['ueberreden', 'einschuechtern']), next: 'reden' },
      { text: 'Neben den Barkeeper treten. Schultern breit. Nichts sagen.', check: chk('he-barkeeper-6-wand', 'koerper', 6, ['einschuechtern']), next: 'wand' },
      { text: 'Zeno die Zigarre aus dem Mund nehmen und ins Hafenbecken schnippen.', next: 'zigarre' },
      { text: 'Nichts tun. Abwarten, was der Barkeeper macht.', next: 'blick' },
    ],
  }),
  node('reden', [
    ich('Dreitausend für einen Kampf. Wie viel davon hast du ihm damals gezahlt? Zehn Prozent? Fünf? Er hat dir vierzig Abende verkauft. Der Laden hier ist zu, Zeno. Geh Fisch verkaufen.'),
    erz('Zeno kaut auf seiner Zigarre, als würde sie ihm antworten. Dann zuckt er die Schultern und trollt sich. „Freitag. Falls du’s dir überlegst.“'),
  ], { effects: [rel('barkeeper', 30)], next: 'geschichte' }),
  node('wand', [
    erz('Du stellst dich daneben. Ihr seid jetzt zwei. Zeno guckt vom einen zum anderen, rechnet, und das Ergebnis gefällt ihm nicht.'),
    sp('narrator')('„Ihr Stillen seid alle gleich. Langweilig.“ Er geht. Schneller, als er gekommen ist.'),
  ], { effects: [rel('barkeeper', 30)], next: 'geschichte' }),
  node('zigarre', [
    erz('Die Zigarre beschreibt einen eleganten Bogen und zischt ins Wasser. Zeno starrt ihr nach, dann auf dich, dann auf den Barkeeper, der sehr, sehr langsam aufsteht.'),
    sp('narrator')('„Schon gut! Schon gut! Ich hab nix gesagt! Ich verkauf Fisch! Wer will Fisch?“'),
    B(vers('Die Glut ist versunken', 'das war meine Lieblingszigarre', 'von ihm. Gut gemacht.')),
  ], { effects: [rel('barkeeper', 40)], next: 'geschichte' }),
  node('blick', [
    erz('Der Barkeeper steht nicht auf. Er hebt nur den Kopf und sieht Zeno an. Drei Sekunden. Zeno hört auf zu lächeln. Vier. Er nimmt die Zigarre aus dem Mund. Fünf. Er geht.'),
    B(vers('Ein Blick ist billig', 'Zeno kannte meinen gut', 'er hat ihn bezahlt.')),
  ], { effects: [rel('barkeeper', 20)], next: 'geschichte' }),
  node('geschichte', [
    erz('Er klopft neben sich auf das Fass. Du setzt dich. Der Hafen gluckert. Irgendwo zieht ein Kran einen Container über den Himmel.'),
    B(vers('Vierzig Abende', 'jeder Sieg ein Name weniger', 'den ich vergessen will.')),
    B(vers('Am letzten stand dort', 'ein Junge, sechzehn vielleicht', 'mit meiner alten Klinge.')),
    B(vers('Ich legte sie hin', 'die Menge warf mit Flaschen', 'Hunter fing eine auf.')),
    erz('Hunter. Natürlich. Hunter, damals ohne Bar, mit einer Flasche in der Hand und einem Angebot: „Ich brauch jemanden, der Gläser poliert und nicht fragt.“'),
  ], {
    choices: [
      { text: '„Und der Junge?“', next: 'junge' },
      { text: '„Die Maske auf dem Plakat. Hast du die noch?“', next: 'maske' },
      { text: 'Nur nicken. Ihm Zeit lassen.', next: 'ende', effects: [rel('barkeeper', 10)] },
    ],
  }),
  node('junge', [
    B(vers('Er fährt jetzt Taxi', 'manchmal hupt er dreimal laut', 'wenn er vorbeifährt.')),
    erz('Dreimal Hupen. Das hast du schon gehört, vor dem High Voltage, spät nachts. Du hast gedacht, das ist Kiki.'),
  ], { next: 'ende' }),
  node('maske', [
    B(vers('Sie hängt im Schrank', 'hinter Hunters schlechtem Rum', 'da sucht keiner nach.')),
    B(vers('Vielleicht eines Tages', 'zeig ich sie dir. Nicht heute', 'heute ist Montag.')),
  ], { effects: [set('barkeeper_maske_erwaehnt')], next: 'ende' }),
  node('ende', [
    B(vers('Montags komm ich her', 'damit die Arena weiß', 'ich bin nicht zurück.')),
    B(vers('Doch wenn du mich brauchst', 'und der Streit es wert ist', 'kämpf ich noch einmal.')),
  ], { effects: [xp(60), set('barkeeper_arena_erzaehlt'), rep('crew-hunter', 3)] }),
]);

// ------------------------------------------------------------------------------------------- he-barkeeper-8/10 (act2)

const he8 = dlg('he-barkeeper-8', [
  node('start', [
    erz('Freitagabend, Gedränge. Zwei Rostzähne gehen am Tanzboden aufeinander los, Gläser fliegen, jemand schreit nach Bruno. Der Barkeeper stellt das Glas ab, das er gerade poliert. Sieht hin. Das ist alles.'),
    erz('Die Rostzähne erstarren mitten im Schlag, lassen die Fäuste sinken und setzen sich. Nebeneinander. Einer entschuldigt sich beim anderen.'),
    B(vers('Für dich, Gast, heut Nacht', 'ein Glas, das es nirgends gibt', 'ich nenn es „Stiller Vers“.')),
    erz('Es ist dunkelblau, schmeckt nach Tee, Salz und etwas, das du nicht kennst, und es leuchtet erst, wenn man es ansieht.'),
  ], { effects: [xp(80), rel('barkeeper', 40), set('stiller_vers_bekannt')] }),
]);

const he10 = dlg('he-barkeeper-10', [
  node('start', [
    erz('Nach Ladenschluss. Er stellt eine Kiste auf den Tresen, hinter Hunters schlechtem Rum hervorgezogen. Darin: eine schwarze Maske, glatt, ohne Mund. Das Plakatgesicht des Stillen.'),
    B(vers('Ich trug sie vierzig Mal', 'nun trägst du sie einmal nicht', 'und denkst dabei an mich.')),
    erz('Er legt sie dir in die Hände. Zum ersten Mal sagt er etwas ohne Versmaß, ganz leise: „Danke.“ Dann tut er so, als wäre das nie passiert.'),
  ], { effects: [{ give: 'barkeeper-maske' }, xp(120), rel('barkeeper', 50)] }),
]);

// ------------------------------------------------------------------------------------------- Figur

const barkeeper: NpcDef = {
  id: 'barkeeper',
  name: 'Der Barkeeper',
  portrait: 'barkeeper',
  sprite: 'barkeeper-walk',
  faction: 'crew-hunter',
  bio: 'Ruhiger Barkeeper des High Voltage, früher „Der Stille“ in den Ringen von Rostkai. Spricht nur in Dreizeilern und fängt Gläser, bevor sie fallen.',
  gifts: {
    loves: ['klingenpolitur', 'haiku-buechlein', 'tai-chi-tee'],
    likes: ['kaktusfrucht', 'algen-chips', 'synth-kaffee', 'postkarte-meer', 'echtobst-apfel', 'hofhonig'],
    dislikes: ['volt-limo', 'kartendeck'],
    hates: ['haarspray-deluxe', 'rostige-dose', 'virus-implantat'],
  },
  schedule: [
    { slot: 'morgen', place: { map: 'high-voltage', at: 'tresen' }, pose: 'polieren' },
    { slot: 'tag', days: ['mo'], place: { map: 'schrottmarkt', at: 'marktplatz-mitte' } },
    { slot: 'tag', place: { map: 'neon-gasse', at: 'klingen-ecke' }, pose: 'klinge' },
    { slot: ['abend', 'nacht'], days: ['mo'], place: { map: 'hafenkante', at: 'alte-arena' }, pose: 'sitzen' },
    { slot: ['abend', 'nacht'], place: { map: 'high-voltage', at: 'tresen' }, pose: 'polieren' },
  ],
  heartEvents: [
    { id: 'he-barkeeper-2', hearts: 2, map: 'high-voltage', time: 'morgen', when: PROBEZEIT, dialogue: 'he-barkeeper-2' },
    { id: 'he-barkeeper-4', hearts: 4, map: 'neon-gasse', time: 'tag', when: all(seen('he-barkeeper-2'), { not: { weekday: 'mo' } }), dialogue: 'he-barkeeper-4' },
    { id: 'he-barkeeper-6', hearts: 6, map: 'hafenkante', time: 'abend', when: all(seen('he-barkeeper-4'), { weekday: 'mo' }), dialogue: 'he-barkeeper-6' },
    { id: 'he-barkeeper-8', hearts: 8, map: 'high-voltage', time: ['abend', 'nacht'], when: all(AKT2, seen('he-barkeeper-6'), { weekday: ['fr', 'sa'] }), dialogue: 'he-barkeeper-8' },
    { id: 'he-barkeeper-10', hearts: 10, map: 'high-voltage', time: 'nacht', when: all(AKT2, seen('he-barkeeper-8')), dialogue: 'he-barkeeper-10' },
  ],
  companion: {
    // world.md §4.6/§11.2: ab ♥8; in Akt 1 nur Club- und Neon-Gassen-Kämpfe, nicht Fr/Sa nachts (siehe gaps).
    recruit: hearts('barkeeper', 8),
    stats: {
      hp: 50, armor: 2, morale: 95,
      attributes: { technik: 3, koerper: 6, reflexe: 8, ausstrahlung: 5, strasse: 5 },
      weapon: { kind: 'nahkampf', damage: 6, range: 2, hit: 10 },
      abilities: ['barkeeper-mondschnitt', 'barkeeper-stille-wacht'],
    },
    heartAbilities: [{ hearts: 10, ability: 'barkeeper-letzter-vers' }],
  },
  talk: [
    talk('barkeeper-tag-rivale', { rival: 'barkeeper' }),
    talk('barkeeper-tag-vexaria', all(VEXARIA, noFlag('barkeeper_kommentar_vexaria'), { time: ['morgen', 'abend', 'nacht'] })),
    talk('barkeeper-tag-aria', all(NOT_VEX, { flag: 'aria_romanze_zusammen' }, noFlag('barkeeper_kommentar_aria'))),
    talk('barkeeper-tag-zeit', AKT1, 8),
    talk('barkeeper-tag-fremd', { not: PROBEZEIT }),
    talk('barkeeper-tag-montag', all({ weekday: 'mo' }, { time: ['abend', 'nacht'] })),
    talk('barkeeper-tag-markt', all({ weekday: 'mo' }, { time: 'tag' })),
    talk('barkeeper-tag-morgen', { time: 'morgen' }),
    talk('barkeeper-tag-klinge', { time: 'tag' }),
    talk('barkeeper-tag-wochenende', all({ weekday: ['fr', 'sa'] }, { time: 'nacht' })),
    talk('barkeeper-tag-vertraut', undefined, 5),
    talk('barkeeper-tag-bar'),
  ],
};

export const part: ContentPart = {
  npcs: { barkeeper },
  dialogues: byId([
    T.rivale, T.vexaria, T.aria, T.zeit, T.montag, T.morgen, T.klinge, T.markt, T.wochenende, T.vertraut, T.fremd, T.bar,
    he2, he4, he6, he8, he10,
  ]),
};
