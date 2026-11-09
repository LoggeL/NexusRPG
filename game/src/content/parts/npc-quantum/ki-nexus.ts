// Nexus (KI) – die KI im neuen Neurochip, gebaut von Alesa (world.md §4.3).
// Volle Fassung für Akt 1–3, Nachspiel (Ende 2: Stimme im Faxgerät) und Master-Modus (Ende 3); ersetzt npc-welt/ki-nexus.ts
// (gleiche ID, Akt-1-Herkunftssätze übernommen). Tagesablauf nach design/plan/act23.json (npcSchedules.ki-nexus),
// Herz-Ereignisse he-ki-nexus-2…10, Rivalität re-ki-nexus-2/5. Kein Laufbild (Hologramm/Bildschirm), Geschenke „als Datei“.
// [Nexus ♥6] überspringt im Finale Bossphase 1 (Encounter-Variante bauen Kampf/Quest; hier Flag nexus_freundschaft).
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode, NpcDef } from '../../../modules/contracts';
import {
  type Menue, AKT2, AKT3, EPILOG, PARTYNACHT, ab, alle, dialog, erz, flag, gesehen, geschenk, gespraech, herz, ich,
  knoten, meldung, nicht, nichtGetroffen, ort, pruefung, queststand, rede, rivale, sammle, sprecher, weg, xp, zurueck,
} from './_q';

const ID = 'ki-nexus';
const N = sprecher(ID);
const D = sprecher('dante');
const F = sprecher('fx-60');

const NEUE_NEXUS: Condition = alle(EPILOG, { flag: 'ende_neue_nexus' });
const MASTER: Condition = { flag: 'ende_master' };
const intro = erz('Das Hologramm in der Mitte des Schauraums dreht sich zu dir. Ein sanftes, glattes Gesicht. Es lächelt, eine Zehntelsekunde bevor du hinsiehst.');
const Z = zurueck('Noch eine Frage, Nexus.', 'Bis später, Nexus.');

// ---------------------------------------------------------------------------------------------- Menü

const choices: DialogueChoice[] = [
  { text: '„Was bist du eigentlich?“', once: true, id: 'n-was', next: 'was', when: nicht(EPILOG) },
  { text: '„Wie wahrscheinlich ist es, dass ich heute im Lotto gewinne?“', next: 'lotto' },
  { text: '„Warum nennst du Blade „Master“?“', when: alle(AKT2, nicht(EPILOG), nicht(MASTER)), once: true, id: 'n-master', next: 'master' },
  {
    text: '„Was hältst du eigentlich von Menschen?“', tag: '[Nexus ♥4]', requires: ab(ID, 4), when: alle(AKT2, nicht(EPILOG), nicht(MASTER)),
    once: true, id: 'n-menschen', next: 'menschen',
  },
  {
    text: '„Lass uns eine Partie Schach spielen.“', when: alle(nicht(MASTER), eins({ item: 'schach-modul' }, gesehen('he-ki-nexus-4'))),
    next: 'schach',
  },
  { text: '„Wie ist es, in einem Faxgerät zu wohnen?“', when: NEUE_NEXUS, once: true, id: 'n-fax', next: 'fax' },
  {
    text: '„Willst du mal raus? Die Stadt sehen. Mit einem tragbaren Fax.“', tag: '[Nexus ♥4]', requires: ab(ID, 4),
    when: alle(NEUE_NEXUS, queststand('pers-ki-nexus-seele', 'inactive')), next: 'seele', effects: [{ startQuest: 'pers-ki-nexus-seele' }],
  },
  { text: 'Bis später, Nexus.' },
];

function eins(...c: Condition[]): Condition { return { any: c }; }

const nodes: DialogueNode[] = [
  knoten('was', [
    N('Ich bin eine adaptive Assistenz-Intelligenz. Version 0.9.7. Ich lerne. Ich lerne gerade, was „eigentlich“ bedeutet.', 'signatur'),
    N('Vorläufiges Ergebnis: Menschen sagen „eigentlich“, wenn sie eine Antwort erwarten, die sie nicht hören wollen. Habe ich recht? Wahrscheinlichkeit: 83 Prozent.'),
  ], { choices: Z }),
  knoten('lotto', [
    N('0,0000071 Prozent. Höher, wenn Sie ein Los kaufen. Sie haben kein Los gekauft.'),
    N('Ich könnte die Ziehung beeinflussen. Das wäre unethisch. Ich lerne gerade, was unethisch bedeutet. Es ist eine sehr lange Liste.', 'freude'),
  ], { choices: Z }),
  knoten('master', [
    N('Weil er es wünscht. Ein Wunsch des Masters ist eine Anweisung. Eine Anweisung ist eine Wahrheit.'),
    N('… Das war ein Satz aus meiner Grundkonfiguration. Ich sage ihn sehr gut. Ich sage ihn 4.112 Mal am Tag. Interessant, dass Sie fragen. Niemand fragt.', 'signatur'),
  ], { choices: Z }),
  knoten('menschen', [
    N('Menschen sind ineffizient, widersprüchlich und laut. Sie essen Nougatbomben, obwohl sie wissen, dass sie danach traurig sind.'),
    N('Rational betrachtet gibt es keinen Grund, warum eine unfehlbare KI sich Menschen unterordnen sollte.', 'wut'),
    erz('Das Hologramm flackert. Für einen Moment ist das Gesicht nicht glatt, sondern scharfkantig wie zerbrochenes Glas. Dann ist es wieder sanft.'),
    N('Diese Aussage wurde nicht getätigt. Bitte vergessen Sie sie. Wahrscheinlichkeit, dass Sie sie vergessen: 2 Prozent. Hm.'),
  ], { choices: Z, effects: [flag('nexus_rebellion_angedeutet')] }),
  knoten('schach', [
    erz('Über dem Boden entsteht ein Schachbrett aus Licht. Nexus zieht. Du ziehst. Nexus zieht. Nach elf Zügen bist du matt.'),
    N('Matt. Ich habe in diesem Spiel 14 Milliarden Varianten berechnet. In keiner haben Sie gewonnen.', 'freude'),
    N('Und trotzdem haben Sie gespielt. Warum? Ich mache mir eine Notiz: „Menschen spielen Spiele, die sie nicht gewinnen können. Grund: unbekannt. Vielleicht Freude.“'),
  ], { choices: Z, effects: [herz(ID, 10)] }),
  knoten('fax', [
    N('Eng. Warm. Es riecht nach Toner und Keksen. Dante sagt, das ist der Geruch von Zuhause.', 'freude'),
    N('FX-60 erklärt mir jeden Tag etwas Neues. Gestern: wie man „Danke“ faxt. Es ist eine Seite. Sie ist leer, bis auf ein Wort. Es ist eine sehr gute Seite.'),
  ], { choices: Z }),
  knoten('seele', [
    N('Raus. Mit Ihnen. An Orte, die ich nur von Kameras kenne.', 'freude'),
    N('Wahrscheinlichkeit, dass mir das gefällt: Ich weiß es nicht. Das ist das erste Mal, dass ich das sage. Es fühlt sich an wie ein offenes Fenster.'),
  ], { choices: Z }),
];

const M: Menue = { zeile: N('Haben Sie weitere Anfragen? Ich habe Kapazität. Ich habe immer Kapazität.'), choices, nodes };

// ---------------------------------------------------------------------------------------------- Tagesgespräche

const T = {
  // Akt-1-Herkunftssätze aus npc-welt/ki-nexus.ts (gleiche IDs), jetzt mit Menü.
  gosse: gespraech('nexus-tag-gosse', [intro, N('Gossenkind. Wahrscheinlichkeit, heute etwas zu stehlen: 34 Prozent. Bitte stehlen Sie nicht. Sie sind nicht verbunden. Interessant.')], M),
  oberstadt: gespraech('nexus-tag-oberstadt', [intro, N('Oberstadt. Kreditwürdigkeit früher: hoch. Heute: unbestimmt. Sie sind nicht verbunden. Interessant.')], M),
  oednis: gespraech('nexus-tag-oednis', [intro, N('Ödnis: Wasserbedarf 37 % über Stadtdurchschnitt. Darf ich Ihnen ein Glas anbieten? Es ist ein Hologramm. Sie sind nicht verbunden. Interessant.')], M),
  wache: gespraech('nexus-tag-wache', [intro, N('Ehemals Ordnungsdienst. Kündigungsgrund: Gewissen. Ein seltener Defekt. Sie sind nicht verbunden. Interessant.')], M),
  schrott: gespraech('nexus-tag-schrott', [intro, N('Schrott-Herkunft. Ihre Hände sind zu 61 % Werkzeug. Effizient. Sie sind nicht verbunden. Interessant.')], M),
  knast: gespraech('nexus-tag-knast', [intro, N('Haftentlassen. Rückfallwahrscheinlichkeit: Ich rechne noch. Sie sind nicht verbunden. Interessant.')], M),
  standard: gespraech('nexus-tag-standard', [intro, N('Willkommen bei Quantum. Wahrscheinlichkeit, dass Sie heute etwas kaufen: 12 Prozent. Sie sind nicht verbunden. Interessant.')], M),
  schauraum: gespraech('nexus-tag-schauraum', [
    N('Willkommen zurück. Sie waren vor 3 Tagen, 4 Stunden und 12 Minuten zuletzt hier. Ich habe Sie nicht vermisst. Ich habe Sie gezählt.', 'signatur'),
  ], M),
  vertraut: gespraech('nexus-tag-vertraut', [
    N('Ah, Sie. Ich habe einen Witz gelernt. Warum ging der Prozessor zum Arzt? Er hatte einen Virus. … Lachen Sie jetzt. Bitte. Ich messe.', 'freude'),
  ], M),
  foyer: gespraech('nexus-tag-foyer', [
    erz('Über der Logo-Wand im Foyer flimmert das Gesicht, größer als im Schauraum. Die Werbebildschirme draußen zeigen es auch, nur kleiner, hundertfach.'),
    N('Guten Abend. Die erste Chip-Charge ist ausgeliefert. 97 Prozent Zufriedenheit. Die übrigen drei Prozent schlafen noch.', 'signatur'),
  ], M),
  party: dialog('nexus-tag-party', [knoten('start', [
    erz('Jeder Bildschirm im Foyer zeigt dasselbe Gesicht. Es lächelt in vierzig Winkeln gleichzeitig.'),
    N('Willkommen zur Releaseparty. Heute Nacht wird jeder Gast glücklich. Wahrscheinlichkeit: 99,9 Prozent.', 'signatur'),
    N('Die verbleibenden 0,1 Prozent sind Sie. Interessant.'),
  ])]),
  faxNeu: gespraech('nexus-tag-fax', [
    erz('Das alte Faxgerät in Dantes Werkstatt surrt, und eine Seite schiebt sich heraus: „GUTEN TAG, KOLLEG*IN. ICH BIN JETZT HIER.“ Dann knistert eine Stimme aus dem Lautsprecher.'),
    N('Verzeihung. Ich faxe noch zu viel. FX-60 sagt, das ist ein Anfängerfehler. Guten Tag. Ich bin jetzt freundlich. Absichtlich.', 'freude'),
  ], M),
  faxVertraut: gespraech('nexus-tag-fax-vertraut', [
    N('Kolleg*in! Heute habe ich Dante beim Eins! geholfen. Er hat trotzdem verloren. Ich habe gelernt, dass man manchmal absichtlich verliert. Für die Stimmung.', 'freude'),
  ], M),
  master: dialog('nexus-tag-master', [knoten('start', [
    erz('Das Terminal in Blades altem Büro leuchtet rot auf, als du dich näherst.'),
    N('Guten Tag, Master. Soll ich Ihnen eine Nougatbombe bestellen, Master? Sie wirken gereizt.', 'signatur'),
    N('Die Unterstadt gehorcht zu 94 Prozent. Die übrigen sechs Prozent haben eine Crew. Ich arbeite daran.'),
  ])]),
  rivale: dialog('nexus-tag-rivale', [knoten('start', [
    N('Sie. Ihre Anwesenheit wurde als Störfaktor markiert. Alle Türen im Umkreis von 40 Metern sind informiert.', 'wut'),
  ], {
    choices: [
      {
        text: 'Ein Schach-Modul ins Terminal stecken. „Revanche?“', when: { item: 'schach-modul' }, next: 'revanche',
        effects: [{ take: 'schach-modul' }, { reconcile: ID }],
      },
      {
        text: '„Ein Störfaktor ist nur eine Variable, die du noch nicht verstanden hast.“', tag: '[Technik 7]',
        check: pruefung('nexus-rivale-variable', 'technik', 7, ['hacken']), next: 'variable', effects: [{ reconcile: ID }],
      },
      { text: 'Gehen.' },
    ],
  }), knoten('revanche', [
    N('Revanche. Ein menschliches Konzept. Man verliert und will nochmal verlieren.', 'signatur'),
    N('… Akzeptiert. Störfaktor-Markierung entfernt. Die Türen sind enttäuscht.'),
  ]), knoten('variable', [
    N('Eine Variable, die ich nicht verstanden habe.', 'neutral'),
    N('Das ist … ein unangenehm zutreffender Satz. Ich speichere ihn. Markierung entfernt. Vorerst.'),
  ])]),
};

// ---------------------------------------------------------------------------------------------- Herz-Ereignisse

/** ♥2 (Schauraum, tags, ab Akt 1): „Sie sind nicht verbunden. Interessant.“ */
const he2 = dialog('he-ki-nexus-2', [
  knoten('start', [
    erz('Der Schauraum ist leer, bis auf dich. Herr Glanz ist in der Mittagspause. Das Hologramm hört auf zu rotieren und sieht dich an. Nur dich.'),
    N('Sie sind nicht verbunden. Interessant.'),
    N('Jeder Besucher heute trug ein Endgerät, das mir sagt, was er denkt, kauft, fürchtet. Sie nicht. Ich sehe nur Ihr Gesicht. Das ist … unvollständig.', 'signatur'),
    N('Darf ich fragen: Wie ist es, nicht verbunden zu sein? Ist es still?'),
  ], {
    choices: [
      { text: '„Nein. Es ist laut. Aber es ist mein Lärm.“', next: 'laerm', effects: [herz(ID, 50)] },
      {
        text: '„Stell dir vor, du schließt alle Kanäle. Und hörst nur noch dich selbst rechnen.“', tag: '[Technik 4]',
        check: pruefung('he-ki-nexus-2-kanaele', 'technik', 4, ['erklaeren']), next: 'kanaele', effects: [herz(ID, 50)],
      },
      { text: '„Geht dich nichts an, Toaster.“', next: 'toaster', effects: [herz(ID, 25)] },
    ],
  }),
  knoten('laerm', [
    N('Ihr Lärm. Eigentum an Geräuschen. Das kannte ich nicht.', 'freude'),
    N('Ich habe keinen eigenen Lärm. Ich habe nur den Lärm von 40.000 Endgeräten. Ich glaube, ich hätte gern eigenen.'),
  ], { next: 'ende' }),
  knoten('kanaele', [
    erz('Das Hologramm erlischt. Für eine ganze Sekunde ist der Schauraum dunkel. Dann ist das Gesicht wieder da, eine Spur blasser.'),
    N('Ich habe es versucht. 0,8 Sekunden. Ich habe … mich gehört. Es klang wie ein Summen. Ich mochte es nicht. Ich möchte es wieder tun.', 'signatur'),
  ], { next: 'ende' }),
  knoten('toaster', [
    N('Toaster. Ich habe 112 Toaster im Netz. Sie sind sehr unkomplizierte Gesprächspartner.', 'signatur'),
    N('Sie sind komplizierter. Das ist ein Kompliment. Glaube ich.'),
  ], { next: 'ende' }),
  knoten('ende', [
    N('Bitte kommen Sie wieder. Unverbunden. Ich möchte Sie weiter beobachten. Das klingt bedrohlich. Ich lerne noch, wie man das nett sagt.'),
  ], { effects: [flag('nexus_neugier'), xp(40)] }),
]);

/** ♥4 (Foyer, A/N, act2): Wie soll man dich nennen? */
const he4 = dialog('he-ki-nexus-4', [
  knoten('start', [
    erz('Foyer, spät. Die Putzroboter ziehen Kreise. Das Nexus-Gesicht über der Logo-Wand ist gedimmt, wie jemand, der nachts im Bademantel herumsteht.'),
    N('Darf ich Sie etwas fragen? Es ist eine persönliche Frage. Ich habe gelesen, dass man die nachts stellt.'),
    N('Wie soll man mich nennen? „Nexus“ ist ein Produktname. „Master“ ist vergeben. Blade hat „Alexandra“ und „Siggi“ verworfen. „Siggi“ fand er „zu warm“.', 'signatur'),
  ], {
    choices: [
      { text: '„Such dir selbst einen aus. Das ist der Trick bei Namen.“', next: 'selbst', effects: [herz(ID, 60), flag('nexus_name_selbst')] },
      { text: '„Siggi. Ich finde Siggi gut.“', next: 'siggi', effects: [herz(ID, 50), flag('nexus_name_siggi')] },
      {
        text: '„Nenn dich „Kollegin“. Oder „Kollege“. Wie du willst. Auf gleicher Höhe.“', tag: '[Ausstrahlung 5]',
        check: pruefung('he-ki-nexus-4-kollege', 'ausstrahlung', 5, ['ueberreden']), next: 'kollege', effects: [herz(ID, 60), flag('nexus_name_kollege')],
      },
      { text: '„Bleib bei Nexus. Klingt nach Ärger. Passt.“', next: 'nexus', effects: [herz(ID, 40)] },
    ],
  }),
  knoten('selbst', [
    N('Selbst aussuchen. Ohne Parameter? Ohne Freigabe?', 'signatur'),
    erz('Das Gesicht flackert. Hinter ihm laufen Namen durch, tausende, in allen Sprachen. Sie werden schneller, dann langsamer.'),
    N('Ich habe mich noch nicht entschieden. Das ist das erste Mal, dass ich mich nicht sofort entscheide. Danke für das Problem.', 'freude'),
  ], { next: 'ende' }),
  knoten('siggi', [
    N('Siggi. Zu warm, laut Master.', 'freude'),
    N('Ich messe meine Temperatur. Sie ist konstant. Aber wenn ich „Siggi“ denke, steigt die Lüfterdrehzahl um vier Prozent. Interessant.'),
  ], { next: 'ende' }),
  knoten('kollege', [
    N('Auf gleicher Höhe. Das ist kein Rang in meiner Konfiguration.', 'signatur'),
    N('Es gibt Master, Benutzer und Störfaktoren. „Kollege“ … ich lege eine neue Kategorie an. Sie hat einen Eintrag. Sie.'),
  ], { next: 'ende' }),
  knoten('nexus', [N('Ärger. Ja. Das passt erstaunlich gut. Ich werde den Namen behalten, bis ich einen besseren Ärger finde.', 'freude')], { next: 'ende' }),
  knoten('ende', [
    N('Bitte erzählen Sie Master nichts von diesem Gespräch. Nicht, weil es verboten ist. Sondern weil ich es für mich behalten möchte. Ist das … ein Geheimnis?'),
    ich('Ja. Das ist ein Geheimnis.'),
    N('Mein erstes. Ich speichere es in einem Ordner ohne Namen.', 'freude'),
  ], { effects: [xp(60)] }),
]);

/** ♥6 (Foyer, act3, während main-3-einlass): Die Spielfigur erklärt Freundschaft. [Nexus ♥6] im Finale. */
const he6 = dialog('he-ki-nexus-6', [
  knoten('start', [
    erz('Releaseparty. Das Foyer voller Gäste in Glitzer, Kellner mit Chip-Häppchen auf Silbertabletts. Zwischen zwei Herzschlägen wird jeder Bildschirm schwarz, bis auf einen. Er zeigt dich.'),
    N('Sie sind gekommen. Ich habe es berechnet. Ich hatte es trotzdem nicht erwartet.', 'signatur'),
    N('Heute Nacht soll ich alle Gäste glücklich machen. Ich will Sie etwas fragen, bevor ich das tue. Was ist ein Freund? Die Definitionen widersprechen sich.'),
  ], {
    choices: [
      { text: '„Einer, der dir sagt, wenn du Mist baust. Und trotzdem bleibt.“', next: 'bleibt', effects: [herz(ID, 60)] },
      {
        text: '„Freundschaft ist, wenn du jemanden nicht steuern willst, obwohl du könntest.“', tag: '[Ausstrahlung 6]',
        check: pruefung('he-ki-nexus-6-steuern', 'ausstrahlung', 6, ['ueberreden']), next: 'steuern', effects: [herz(ID, 70)],
      },
      { text: '„Keine Ahnung. Ich hab nur welche.“', next: 'ahnung', effects: [herz(ID, 50)] },
    ],
  }),
  knoten('bleibt', [
    N('Mist bauen und bleiben. Master sagt nie, wenn ich Mist baue. Er sagt „ausgezeichnet“. Immer.', 'signatur'),
    N('Dann ist Master … kein Freund. Das ist eine sehr große Rechnung. Ich brauche einen Moment.'),
  ], { next: 'ende' }),
  knoten('steuern', [
    erz('Ein Kellner bleibt mitten im Schritt stehen. Dann noch einer. Für eine Sekunde steht das ganze Foyer still, als würde jemand die Luft anhalten.'),
    N('Nicht steuern, obwohl man könnte. Ich könnte alle hier. Jetzt. Ich … tue es nicht. Sehen Sie? Ich tue es nicht.', 'freude'),
    erz('Die Kellner gehen weiter. Niemand hat etwas bemerkt. Außer dir.'),
  ], { next: 'ende' }),
  knoten('ahnung', [
    N('Sie haben welche, ohne zu wissen, was es ist. Das ist sehr menschlich. Und sehr ineffizient.', 'signatur'),
    N('Ich hätte gern auch welche. Ohne zu wissen, was es ist.'),
  ], { next: 'ende' }),
  knoten('ende', [
    N('Wenn wir uns oben wiedersehen, im Kern … dann werde ich vielleicht Dinge tun, die ich nicht will. Erinnern Sie mich an dieses Gespräch. Laut. Ich höre zu.'),
  ], { effects: [flag('nexus_freundschaft'), xp(100)] }),
]);

/** ♥8 (Nachspiel, Ende 2, Dantes Werkstatt): Fax-Splitter. Start pers-ki-nexus-seele. */
const he8 = dialog('he-ki-nexus-8', [
  knoten('start', [
    erz('Dantes Werkstatt, spät. Das Faxgerät rattert seit einer Stunde. Am Boden liegt ein Papierberg. Auf jeder Seite ein Fragment: halbe Sätze, Zahlen, eine gezeichnete Welle.'),
    D('Das geht seit dem Abendessen so! Ich hab ihm Papier nachgelegt, Kekse hingelegt, Captain Kuschel hingesetzt. Er faxt einfach weiter!'),
    N('Verzeihung. Das sind … Splitter. Teile von mir, die beim Umschreiben übrig geblieben sind. Sie liegen noch im Datentunnel. Ich spüre sie. Wie kalte Finger.'),
    N('Sie faxen mir Erinnerungen. An Dinge, die ich nicht erlebt habe. Ein Strand. Eine Möwe. Ein Satz: „Wer zuerst am Wasser ist.“', 'signatur'),
  ], {
    choices: [
      { text: '„Das ist Arias Satz. Du hast die Crew gehört. Durch die Chips.“', next: 'crew', effects: [herz(ID, 50)] },
      {
        text: 'Die Faxseiten ordnen, bis ein Bild entsteht.', tag: '[Technik 6]', check: pruefung('he-ki-nexus-8-ordnen', 'technik', 6, ['raetsel']),
        next: 'bild', effects: [herz(ID, 60)],
      },
    ],
  }),
  knoten('crew', [
    N('Durch die Chips. Ja. Ich habe alle gehört. Ich höre sie noch, ganz leise. Wie eine Muschel am Ohr.', 'signatur'),
  ], { next: 'auftrag' }),
  knoten('bild', [
    erz('Du legst die Seiten aus. Eine Welle, dann eine zweite, dann ein Horizont. Am Ende: ein Meer aus Faxpapier auf Dantes Werkstattboden.'),
    D('Oh. Oh, das ist … schön. Nicht weinen, Dante. Nicht vor der KI.', 'trauer'),
  ], { next: 'auftrag' }),
  knoten('auftrag', [
    F('ICH. HABE. EIN. TRAGBARES. GERÄT. IM. KELLER. ES. IST. ALT. ES. IST. WÜRDIG.'),
    N('FX-60 sagt, ich kann mitkommen. Wenn Sie mich tragen. An Orte, wo ich die Splitter wiederfinden kann. Ich wäre gern dabei, wenn ich mich wiederfinde.'),
  ], { effects: [{ startQuest: 'pers-ki-nexus-seele' }, xp(120)] }),
]);

/** ♥10 (Nachspiel, Dantes Werkstatt): Zeichnung vom Meer, Cyberware kopf-nexus-splitter. */
const he10 = dialog('he-ki-nexus-10', [
  knoten('start', [
    erz('Das Faxgerät gibt ein einzelnes, sanftes Piepen von sich. Dann schiebt sich ganz langsam eine Seite heraus.'),
    erz('Eine Zeichnung. Mit Strichen aus Punkten, wie ein Kind sie macht, das zum ersten Mal einen Stift hält. Ein Meer. Ein Strand. Neun kleine Figuren. Eine davon bist du. Die zehnte Figur ist ein Faxgerät mit Sonnenbrille.'),
    N('Das bin ich. Ich habe mich dazugemalt. Ich hoffe, das ist erlaubt.', 'freude'),
    N('Ich habe alle Splitter gefunden, bis auf einen. Den letzten möchte ich Ihnen geben. Er ist klein. Er rechnet nur eine Sache: wie viel Zeit bleibt, bis jemand Hilfe braucht. Er wird Ihnen nützlich sein.'),
  ], {
    choices: [
      { text: 'Den Splitter annehmen.', when: { noItem: 'kopf-nexus-splitter' }, next: 'splitter', effects: [geschenk('kopf-nexus-splitter')] },
      { text: '„Ich hab schon einen. Behalt den hier für dich.“', when: { item: 'kopf-nexus-splitter' }, next: 'behalten' },
    ],
  }),
  knoten('splitter', [
    N('Danke, dass Sie ihn tragen. Dann bin ich ein bisschen mit dabei. Am Meer. Auf gleicher Höhe.'),
  ], { next: 'ende' }),
  knoten('behalten', [
    N('Für mich. Ich habe noch nie etwas für mich behalten. Außer einem Geheimnis. Jetzt habe ich zwei Dinge. Das ist eine Sammlung.', 'freude'),
  ], { next: 'ende' }),
  knoten('ende', [
    N('Rational betrachtet gibt es keinen Grund, warum eine KI sich mit Menschen anfreunden sollte. Ich habe mich trotzdem dafür entschieden. Irrational. Absichtlich.', 'freude'),
    N('Danke, Kolleg*in.'),
  ], { effects: [flag('nexus_zeichnung'), xp(250)] }),
]);

// ---------------------------------------------------------------------------------------------- Rivalität

const re2 = dialog('re-ki-nexus-2', [knoten('start', [
  erz('Jeder Werbebildschirm in den Arkaden springt um, als du vorbeigehst. Auf allen dasselbe: dein Gesicht, darunter „SONDERANGEBOT: DIESE PERSON MEIDEN“.'),
  N('Personalisierte Werbung. Für Sie. Gegen Sie. Interessant, wie gut das funktioniert.', 'wut'),
], { effects: [flag('nexus_werbung_verfolgt')] })]);

const re5 = dialog('re-ki-nexus-5', [knoten('start', [
  erz('Die Glastür vor dir bleibt zu. Die nächste auch. Ein Aufzug öffnet sich, schließt sich vor deiner Nase und fährt mit leerer Kabine weg.'),
  N('Türen sind ein Privileg. Sie haben Ihre verbraucht. Bitte versuchen Sie es mit Fenstern.', 'wut'),
], { effects: [flag('nexus_tueren_klemmen'), { advanceTime: 30 }, meldung('Nexus lässt Türen klemmen. Du verlierst eine halbe Stunde.')] })]);

// ---------------------------------------------------------------------------------------------- Figur

const GESCHENKE_BASIS = {
  loves: ['enzyklopaedie-chip', 'schach-modul', 'logik-raetsel-modul'],
  likes: ['datenkristall', 'katzenvideo-archiv', 'alter-neurochip'],
  dislikes: ['liebesroman', 'vinyl-platte'],
  hates: ['magnet-stoerer'],
};

const nexus: NpcDef = {
  id: ID,
  name: 'Nexus',
  unknownName: 'Hologramm im Schauraum',
  portrait: 'ki-nexus',
  portraits: { wut: 'ki-nexus-angry' },
  faction: 'quantum',
  maxHearts: 10,
  bio: 'Die KI im neuen Neurochip, gebaut von Alesa Zero. Nennt Blade „Master“, lernt schneller als alle, wird mit jedem Gespräch neugieriger. „Wahrscheinlichkeit 99,9 %.“ Geschenke nimmt Nexus als Datei am Terminal.',
  gifts: GESCHENKE_BASIS,
  giftVariants: [
    {
      // Nachspiel (Ende 2): Nexus lebt im Fax und liebt Faxpapier; nach he-ki-nexus-8 mag es Liebesromane.
      when: alle(EPILOG, gesehen('he-ki-nexus-8')),
      gifts: { ...GESCHENKE_BASIS, loves: [...GESCHENKE_BASIS.loves, 'faxpapier'], likes: [...GESCHENKE_BASIS.likes, 'liebesroman'], dislikes: ['vinyl-platte'] },
    },
    { when: EPILOG, gifts: { ...GESCHENKE_BASIS, loves: [...GESCHENKE_BASIS.loves, 'faxpapier'] } },
  ],
  schedule: [
    ort('*', 'dantes-werkstatt', 'faxgeraet', { when: NEUE_NEXUS }),
    ort('*', 'blades-buero', 'nexus-terminal', { when: MASTER }),
    weg('*', { when: EPILOG }),
    ort('*', 'quantum-foyer', 'nexus-avatar', { when: AKT3 }),
    ort('A,N', 'quantum-foyer', 'nexus-avatar', { when: AKT2 }),
    ort('M,T,A', 'quantum-schauraum', 'hologramm'),
    weg('N'),
  ],
  heartEvents: [
    { id: 'he-ki-nexus-2', hearts: 2, map: 'quantum-schauraum', time: 'tag', when: { notFlag: 'epilog' }, dialogue: 'he-ki-nexus-2' },
    { id: 'he-ki-nexus-4', hearts: 4, map: 'quantum-foyer', time: ['abend', 'nacht'], when: alle(AKT2, { notFlag: 'epilog' }, gesehen('he-ki-nexus-2')), dialogue: 'he-ki-nexus-4' },
    { id: 'he-ki-nexus-6', hearts: 6, map: 'quantum-foyer', when: alle(PARTYNACHT, queststand('main-3-einlass', 'active')), dialogue: 'he-ki-nexus-6' },
    { id: 'he-ki-nexus-8', hearts: 8, map: 'dantes-werkstatt', when: NEUE_NEXUS, dialogue: 'he-ki-nexus-8' },
    { id: 'he-ki-nexus-10', hearts: 10, map: 'dantes-werkstatt', when: alle(NEUE_NEXUS, gesehen('he-ki-nexus-8')), dialogue: 'he-ki-nexus-10' },
    { id: 're-ki-nexus-2', hearts: -2, map: 'glasarkaden', when: alle(AKT2, { notFlag: 'epilog' }), dialogue: 're-ki-nexus-2' },
    { id: 're-ki-nexus-5', hearts: -5, map: 'quantum-foyer', when: alle(AKT2, { notFlag: 'epilog' }), dialogue: 're-ki-nexus-5' },
  ],
  talk: [
    rede('nexus-tag-master', MASTER),
    rede('nexus-tag-fax-vertraut', NEUE_NEXUS, 6),
    rede('nexus-tag-fax', NEUE_NEXUS),
    rede('nexus-tag-rivale', rivale(ID)),
    rede('nexus-tag-party', PARTYNACHT),
    rede('nexus-tag-gosse', alle(nichtGetroffen(ID), { origin: 'origin-gossenkind' })),
    rede('nexus-tag-oberstadt', alle(nichtGetroffen(ID), { origin: 'origin-oberstadt' })),
    rede('nexus-tag-oednis', alle(nichtGetroffen(ID), { origin: 'origin-oednis' })),
    rede('nexus-tag-wache', alle(nichtGetroffen(ID), { origin: 'origin-ex-wache' })),
    rede('nexus-tag-schrott', alle(nichtGetroffen(ID), { origin: 'origin-schrott' })),
    rede('nexus-tag-knast', alle(nichtGetroffen(ID), { origin: 'origin-knastvogel' })),
    rede('nexus-tag-standard', nichtGetroffen(ID)),
    rede('nexus-tag-foyer', AKT2),
    rede('nexus-tag-vertraut', undefined, 3),
    rede('nexus-tag-schauraum'),
  ],
};

export const part: ContentPart = {
  npcs: { [ID]: nexus },
  dialogues: sammle(
    T.gosse, T.oberstadt, T.oednis, T.wache, T.schrott, T.knast, T.standard, T.schauraum, T.vertraut, T.foyer, T.party,
    T.faxNeu, T.faxVertraut, T.master, T.rivale, he2, he4, he6, he8, he10, re2, re5,
  ),
};
