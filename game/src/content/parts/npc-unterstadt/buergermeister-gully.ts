// Bürgermeister Gully – selbsternanntes Oberhaupt des Kanalvolks (world.md §4.4, §6.2 #14/#27, §11.2).
// Weltfigur mit Kurzeintrag: höchstens 5 Herzen, Herz-Ereignisse he-buergermeister-gully-2 (Ehrenbürger der Rohre)
// und -4 (geheimer Gullyweg, Flag gully_geheimweg; Wege per mapAdditions auf kanal-sammler und neon-gasse).
// Questgeber side-rattenkoenig und side-strom-fuer-die-rohre (Quests baut der Quest-Agent, hier der Auftakt).
// prep-fluchtweg (gc-26) liegt bei quest-main-b.
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode, NpcDef } from '../../../modules/contracts';
import {
  type Menue, einmalig, alle, dialog, erz, flag, herz, herzEreignis, ich, knoten, nicht, pruefung, rede, sammle, sprecher,
  tagesgespraech,
} from './_lib';

const ID = 'buergermeister-gully';
const G = sprecher(ID);
const RK = 'side-rattenkoenig';
const STROM = 'side-strom-fuer-die-rohre';
const RK_AKTIV: Condition = { quest: RK, state: 'active' };
const RK_DONE: Condition = { quest: RK, state: 'done' };
const STROM_AKTIV: Condition = { quest: STROM, state: 'active' };
const STROM_DONE: Condition = { quest: STROM, state: 'done' };
const GEHEIMWEG: Condition = { flag: 'gully_geheimweg' };

// ---------------------------------------------------------------------------------------------- Menü

function menue(): Menue {
  const zurueck: DialogueChoice[] = [{ text: 'Eine weitere Eingabe, Herr Bürgermeister.', next: 'menue', id: 'zurueck' }, { text: 'Gute Amtsführung.' }];
  const choices0: DialogueChoice[] = [
    { text: 'Gibt es Probleme im Reich?', when: { quest: RK, state: 'inactive' }, next: 'rattenkoenig', id: 'g-rk' },
    { text: 'Wie steht’s um Nagbert?', when: RK_AKTIV, next: 'rk-stand', id: 'g-rk-stand' },
    { text: '„Röstzwiebeln. Ratten werden blöd bei Röstzwiebeln. Jedes Gossenkind weiß das.“', tag: '[Gosse]', when: alle(RK_AKTIV, { origin: 'origin-gossenkind' }), once: true, id: 'g-gosse', next: 'gosse' },
    { text: 'Warum sind die Leuchtpilze so schlapp?', when: alle({ quest: STROM, state: 'inactive' }, { met: ID }), next: 'strom', id: 'g-strom' },
    { text: 'Wie läuft’s mit dem Generator?', when: STROM_AKTIV, next: 'strom-stand', id: 'g-strom-stand' },
    { text: 'Was ist das schwarze Brett da?', once: true, id: 'g-brett', next: 'brett' },
    { text: 'Halten Sie mal eine Rede, Herr Bürgermeister.', next: 'rede', id: 'g-rede' },
    { text: 'Wer ist eigentlich Graf Gully?', once: true, id: 'g-graf', next: 'graf' },
    { text: 'Zeig mir nochmal den Geheimweg.', when: GEHEIMWEG, next: 'geheimweg', id: 'g-geheimweg' },
    { text: 'Gute Amtsführung.' },
  ];
  const choices = einmalig(ID, choices0);
  const nodes: DialogueNode[] = [
    knoten('menue', [G('Die Sprechstunde ist eröffnet! Bitte ziehen Sie eine Nummer. Es gibt nur eine Nummer. Sie haben sie.', 'signatur')], { choices }),
    knoten('rattenkoenig', [
      G('Probleme? PROBLEME? Bürgerin, Bürger, Sie sprechen mit dem Oberhaupt eines Reiches in der Krise!', 'wut'),
      G('Ein Tyrann hat sich im alten Thronsaal eingenistet. Nagbert. Eine Ratte von der Größe eines Kühlschranks mit einer Krone aus Kronkorken. Er frisst unsere Ersatzteile! Gewinde, Dichtungen, sogar die Muttern! Die MUTTERN!'),
      G('Ich habe Verhandlungen angeboten. Er hat meinen Unterhändler gefressen. Also, den Hut meines Unterhändlers. Mit dem Unterhändler drin. Kurz.'),
      G('Kraft meines Amtes beauftrage ich Sie hiermit, das Problem zu lösen. Wie, ist mir gleich. Aber bitte nicht die Krone kaputtmachen. Die ist Kulturgut.', 'signatur'),
    ], {
      choices: [
        { text: 'Ich kümmere mich um Nagbert.', next: 'rk-ja', effects: [{ startQuest: RK }] },
        { text: 'Klingt nach einem Problem für morgen.', next: 'menue' },
      ],
    }),
    knoten('rk-ja', [G('Hervorragend! Ich stelle Ihnen hiermit einen Passierschein aus. Er ist mündlich. Er gilt, solange ich es sage. Ich sage es jetzt. Gehen Sie!', 'freude')], { choices: zurueck }),
    knoten('rk-stand', [
      G('Der Thronsaal liegt hinter der Grenze im Osten. Drei Nester auf dem Weg, voller Untertanen, die nicht wissen, dass sie meine Untertanen sind.', 'signatur'),
      G('Man kann sie umgehen. Man kann sie verdreschen. Man kann ihnen auch Käse hinlegen und eine Falle bauen. Ich bin für Käse. Käse ist diplomatisch.'),
    ], { choices: zurueck }),
    knoten('gosse', [
      G('Röstzwiebeln? Röst … ZWIEBELN? Das ist … das ist genial! Das ist Staatskunst!', 'ueberrascht'),
      G('Ich ernenne Sie hiermit zur Beraterin, zum Berater, zur beratenden Person für Zwiebelfragen. Die Stelle ist unbezahlt, aber sehr ehrenvoll.', 'freude'),
    ], { choices: zurueck, effects: [herz(ID, 30), flag('gully_roestzwiebel_tipp')] }),
    knoten('strom', [
      G('Die Leuchtpilze welken. Sehen Sie? Grau statt grün. Das ist unser Licht, unsere Wärme, unser … Abendessen, wenn es eng wird.', 'besorgt'),
      G('Der Notgenerator im Trockendock ist hinüber. Er hat geraucht, gehustet und dann „Pling“ gemacht. „Pling“ ist nie gut.'),
      G('Wir bräuchten Ersatzteile. Und ein Kabel. Ein langes. Von oben, aus den Lötgassen, bis hier runter. Die Oberwelt hat Strom im Überfluss. Wir wollen nur ein bisschen. Für die Pilze. Und für meinen Wasserkocher.'),
    ], {
      choices: [
        { text: 'Ich besorg euch Strom.', next: 'strom-ja', effects: [{ startQuest: STROM }] },
        { text: 'Mal sehen, was ich finde.', next: 'menue' },
      ],
    }),
    knoten('strom-ja', [G('Licht für die Rohre! Ich werde eine Gedenktafel anbringen lassen. Mit Ihrem Namen. In Leuchtpilzschrift. Wenn die Pilze wieder leuchten.', 'freude')], { choices: zurueck }),
    knoten('strom-stand', [
      G('Der Generator steht im Trockendock und schmollt. Mira Lötzinn oben in den Lötgassen hat Kabel. Sie ist streng. Sie mag keine Leute, die nicht grüßen. Grüßen Sie!', 'signatur'),
      G('Und wenn Sie Ratten am Kabelweg sehen: Das sind keine Untertanen. Das sind Saboteure. Mit Zähnen.'),
    ], { choices: zurueck }),
    knoten('brett', [
      G('Das Kanalbrett! Amtliches Verkündungsorgan des Kanalvolks! Hier hängen Aufträge, Gesuche und Beschwerden. Hauptsächlich Beschwerden. Über mich.', 'signatur'),
      G('Für Fremde ist es zu. Wer sich um das Volk verdient macht, darf ran. Ruf, wie man oben sagt. Hier unten sagen wir: Stallgeruch.'),
    ], { choices: zurueck }),
    knoten('rede', [
      erz('Gully stellt sich auf eine umgedrehte Kiste, rückt die Schärpe aus Absperrband zurecht und räuspert sich. Drei Ratten setzen sich vor ihn. Sie sehen aufmerksam aus.'),
      G('Bürgerinnen! Bürger! Ratten! Kraft meines Amtes als Oberhaupt der Rohre, Hüter der Rechen und Großsiegelbewahrer des Gullys …', 'signatur'),
      G('… verkünde ich: Der Pegel ist stabil! Die Pilze halten durch! Und wer noch einmal in den Trinkwasserkanal pinkelt, wird verbannt! IN DIE OBERWELT!', 'wut'),
      erz('Die Ratten applaudieren. Also, sie quieken. Gully verbeugt sich tief und fällt fast von der Kiste.'),
      G('Danke, danke. Die Rede wiederhole ich jeden Abend. Die Ratten mögen Routine.', 'freude'),
    ], { choices: zurueck }),
    knoten('graf', [
      G('Graf Gully. Pah! Ein Hochstapler! Ein Usurpator! Er sitzt auf einem Thron aus Abflussrohren und behauptet, er sei der wahre Herrscher!', 'wut'),
      G('Wir sind nicht verwandt. Wir haben nur zufällig denselben Namen. Und dieselbe Nase. Und dieselbe Mutter. ABER WIR SIND NICHT VERWANDT.'),
      G('Es gibt ein Kopfgeld auf ihn. Oben an der Tafel. Ich hab’s ausgesetzt. Zwei Mal. Er hat beim ersten Mal den Zettel gefressen.'),
    ], { choices: zurueck }),
    knoten('geheimweg', [
      G('Pssst. Hinter dem Trockendock, die Klappe mit dem Kronkorken drauf. Sie führt direkt unter die Neon-Gasse, raus beim Pfandflaschen-Eck. Kein Gitter, kein Siegel, kein Nagbert.', 'signatur'),
      G('Sagen Sie es keinem. Das ist ein Staatsgeheimnis. Das einzige, das wir haben. Ich bin sehr stolz darauf.'),
    ], { choices: zurueck }),
  ];
  return { choices, nodes };
}

const M = menue();

// ---------------------------------------------------------------------------------------------- Tagesgespräche

const T = {
  erstes: tagesgespraech('buergermeister-gully-tag-erstes',
    [
      erz('Ein rundlicher Mann in Gummistiefeln und einem Mantel, der früher einmal einem Admiral gehört haben muss. Über der Brust: eine Schärpe aus rot-weißem Absperrband. Auf dem Kopf: ein Topf. Mit Feder.'),
      G('Halt! Wer betritt das Hoheitsgebiet des Kanalvolks? Nennen Sie Namen, Herkunft und Anliegen! Langsam, ich schreibe mit!', 'signatur'),
      ich('{name}. Von oben. Ich guck mich nur um.'),
      G('„Guckt sich nur um.“ Notiert. Willkommen, Besucher von oben! Ich bin Gully, Bürgermeister, Oberhaupt der Rohre, gewählt mit hundert Prozent der Stimmen. Meiner Stimme. Es war eine sehr knappe Wahl.', 'freude'),
    ],
    [G('Fühlen Sie sich wie zu Hause. Aber ziehen Sie die Schuhe nicht aus. Hier unten ist der Boden sehr … lebendig.')],
    M),
  rkSieg: tagesgespraech('buergermeister-gully-tag-rk-sieg',
    [
      G('Die Heldin! Der Held! Die heldenhafte Person! Nagbert ist gestürzt, die Ersatzteile sind sicher, das Volk jubelt!', 'freude'),
      G('Kraft meines Amtes: Die Kanal-Schnellwege stehen Ihnen offen. Die Gitter erkennen Sie jetzt. Also, ich hab den Ratten gesagt, sie sollen Sie durchlassen. Das ist dasselbe.'),
    ],
    [G('Die Krone haben wir übrigens restauriert. Sie steht in meinem Rathaus. Auf einem Kissen. Ich schau sie mir jeden Abend an. Nicht, weil ich sie tragen will. Nur so.', 'signatur')],
    M, { effects: [flag('gully_rk_dank')] }),
  stromDone: tagesgespraech('buergermeister-gully-tag-strom',
    [
      G('LICHT! Sehen Sie, wie sie leuchten! Grün! Grüner als je zuvor! Die Pilze haben gesungen. Okay, das war der Generator. Aber es klang wie Singen!', 'freude'),
      G('Das Trockendock-Bett heizt jetzt auch. Wenn Sie mal müde sind: Es ist das wärmste Bett der Unterstadt. Unter der Unterstadt. Sie wissen, was ich meine.'),
    ],
    [G('Die Gedenktafel ist in Arbeit. Ich hab Ihren Namen in Pilzsporen geschrieben. In drei Wochen kann man ihn lesen. In vier Wochen ist er gegessen.')],
    M, { effects: [flag('gully_strom_dank')] }),
  rkAktiv: tagesgespraech('buergermeister-gully-tag-rk',
    [G('Haben Sie den Tyrannen? Nein? Dann eilen Sie! Jede Minute frisst er ein Gewinde! Ich höre sein Schmatzen bis ins Rathaus!', 'wut')],
    [G('Ich habe eine Notverordnung erlassen. Ersatzteile werden ab sofort unter dem Kopfkissen aufbewahrt. Das Volk schläft schlecht, aber sicher.')],
    M),
  abend: tagesgespraech('buergermeister-gully-tag-rechen',
    [G('Rechen-Inspektion! Täglich zur Abendstunde! Der Rechen ist das Tor zu unserem Reich. Was hängenbleibt, gehört dem Volk. Was durchrutscht, gehört dem Meer.', 'signatur')],
    [
      G('Heute gefunden: ein Schuh, ein Fahrradsattel, ein Gebiss, drei Liebesbriefe, adressiert an „Kessel“. Ich hab sie gelesen. Aus Amtspflicht. Sie sind sehr … leidenschaftlich.'),
      G('Gestern war ein Kind im Rechen. Ein echtes. Wir haben es rausgezogen. Es hat sich bedankt und dann meinen Hut geklaut. Die Jugend.', 'wut'),
    ],
    M),
  nacht: tagesgespraech('buergermeister-gully-tag-grenze',
    [
      G('Psst! Leise! Das hier ist die Grenze zum Thronsaal. Ich halte Wache. Allein. Mutig. Mit einer Taschenlampe, die nur flackert.', 'besorgt'),
      erz('Aus der Dunkelheit kommt ein Kratzen. Gully springt einen halben Meter hoch und landet in einer Pfütze.'),
    ],
    [G('Das war ein Untertan. Ein kleiner. Ich hab ihn erschreckt, nicht er mich. Ich bin das Oberhaupt. Oberhäupter erschrecken nicht. Sie … erstarren strategisch.', 'besorgt')],
    M),
  nachtFrei: tagesgespraech('buergermeister-gully-tag-grenze-frei',
    [G('Ich bewache die Grenze immer noch. Aus Gewohnheit. Nagbert ist weg, aber was, wenn er einen Cousin hat? Ratten haben immer Cousins.', 'signatur')],
    [G('Nachts, wenn es still ist, hört man die Stadt über uns. Schritte, Musik, Lachen. Sie wissen nicht, dass wir da sind. Das ist das Schöne. Und das Traurige.', 'besorgt')],
    M),
  ehrenbuerger: tagesgespraech('buergermeister-gully-tag-ehrenbuerger',
    [G('Ehrenbürgerin! Ehrenbürger! Ehrenbürgerliche Person! Die Ratten haben Sie schon von weitem erkannt. Sie haben nicht gebissen. Das ist ein Zeichen großer Zuneigung.', 'freude')],
    [G('Als Ehrenbürger haben Sie Rechte! Das Recht auf freien Durchgang, das Recht auf eine Leuchtpilzsuppe pro Woche und das Recht, mich zu unterbrechen. Letzteres bitte selten.', 'signatur')],
    M),
  standard: tagesgespraech('buergermeister-gully-tag-rathaus',
    [G('Das Rathaus hat geöffnet! Bitte treten Sie ein. Bitte treten Sie nicht auf die Ratte. Die Ratte ist Beamtin.', 'signatur')],
    [G('Heute auf der Tagesordnung: Pegelstand, Pilzernte, die Frage, wer meinen Topf geklaut hat. Ich trage den Ersatztopf. Der Ersatztopf hat ein Loch. Ich bin sehr wütend, aber beherrscht.', 'wut')],
    M),
};

// ---------------------------------------------------------------------------------------------- Herz-Ereignisse

/** ♥2: Ernennung zum „Ehrenbürger der Rohre“. */
const he2 = dialog('he-buergermeister-gully-2', [
  knoten('start', [
    erz('Vor Gullys Rathaus haben sich das halbe Kanalvolk und eine überraschende Menge Ratten versammelt. Jemand hat eine Girlande aus Kronkorken aufgehängt. Gully steht auf seiner Kiste, die Schärpe frisch gebügelt.'),
    G('Da ist sie! Da ist er! Da ist die zu ehrende Person! Treten Sie vor!', 'freude'),
    G('Kraft meines Amtes als Oberhaupt der Rohre, Hüter der Rechen und Großsiegelbewahrer des Gullys ernenne ich Sie hiermit feierlich zum EHRENBÜRGER DER ROHRE!'),
    erz('Applaus. Quieken. Eine alte Frau schnäuzt sich gerührt in einen Lappen, der vorher ein Socken war.'),
    G('Sie müssen jetzt den Eid sprechen. Der Eid ist kurz. Er hat nur vierzehn Strophen.', 'signatur'),
  ], {
    choices: [
      { text: 'Eine eigene Rede halten. Laut. Mit erhobener Faust.', check: pruefung('he-gully-2-rede', 'ausstrahlung', 4, ['buehne', 'ueberreden']), next: 'rede', effects: [herz(ID, 40), { rep: 'kanalvolk', delta: 5 }] },
      { text: 'Alle vierzehn Strophen nachsprechen.', next: 'eid', effects: [{ advanceTime: 20 }, herz(ID, 40)] },
      { text: '„Muss ich was unterschreiben?“', next: 'unterschrift', effects: [herz(ID, 25)] },
    ],
  }),
  knoten('rede', [
    ich('Volk der Rohre! Die da oben haben uns vergessen! Aber wir haben sie nicht vergessen! Wir haben ihre Schuhe! Ihre Gebisse! Ihre Liebesbriefe!'),
    erz('Jubel. Echter Jubel. Jemand schwenkt einen Gummistiefel. Die Ratten stellen sich auf die Hinterbeine.'),
    G('Das … das war besser als meine Rede. Das war besser als ALLE meine Reden. Ich bin gerührt und ein bisschen eifersüchtig.', 'ueberrascht'),
  ], { next: 'ende' }),
  knoten('eid', [
    erz('Strophe eins: Treue zu den Rohren. Strophe sechs: Respekt vor dem Pegel. Strophe elf: nie die Pilze anlecken. Strophe vierzehn: „Und so weiter und so fort, Gully hat das letzte Wort.“'),
    G('Fehlerfrei! FEHLERFREI! Das hat zuletzt meine Mutter geschafft. Und die hat geschummelt!', 'freude'),
  ], { next: 'ende' }),
  knoten('unterschrift', [
    G('Unterschreiben! Natürlich! Ordnung muss sein!', 'freude'),
    erz('Er reicht dir eine nasse Pappe und einen Stummel Kreide. Du unterschreibst. Eine Ratte drückt ihre Pfote daneben. Gully stempelt mit einem Kronkorken.'),
    G('Beglaubigt! Notariell! Rattariell! Das hält vor jedem Gericht. Unter der Erde.'),
  ], { next: 'ende' }),
  knoten('ende', [
    erz('Gully legt dir eine Schärpe um. Absperrband, wie seine, nur dünner. Darauf mit Edding: „EHRENBÜRGER DER ROHRE“.'),
    G('Tragen Sie sie mit Stolz! Oder in der Tasche. Oben lachen sie sonst. Oben haben sie keine Kultur.', 'signatur'),
  ], { effects: [flag('ehrenbuerger_der_rohre'), { rep: 'kanalvolk', delta: 10 }, { xp: 50 }] }),
]);

/** ♥4 (Maximum 5): Geheimer Gullyweg zwischen Trockendock und Neon-Gasse. */
const he4 = dialog('he-buergermeister-gully-4', [
  knoten('start', [
    erz('Gully winkt dich hektisch hinter das Rathaus. Er guckt nach links, nach rechts, nach oben und, sicherheitshalber, nach unten.'),
    G('Ehrenbürger. Kommen Sie. Schnell. Ich zeige Ihnen jetzt etwas, das außer mir nur drei Leute kennen. Zwei davon sind Ratten. Eine ist tot. Die Ratte, nicht die Person.', 'besorgt'),
    erz('Hinter dem Trockendock, unter einer Plane, eine runde Klappe. Darauf geklebt: ein einzelner Kronkorken.'),
    G('Der Gullyweg. Der geheime. Er führt nach oben, direkt in die Neon-Gasse. Kein Gitter, kein Siegel, keine Kontrolle. Ich hab ihn selbst gegraben. Mit einem Löffel. Über elf Jahre.', 'signatur'),
    G('Aber er ist verwinkelt. Wer sich verläuft, kommt in der Kanalisation von Pumpwerk Sieben raus. Und von dort kommt keiner zurück. Also, keiner, der nicht schwimmen kann.'),
  ], {
    choices: [
      { text: 'Mir den Weg genau einprägen. Links, links, rechts, Leiter, Kronkorken.', check: pruefung('he-gully-4-weg', 'strasse', 4, ['geruecht', 'verstecke']), next: 'gemerkt', effects: [herz(ID, 40)] },
      { text: 'Hinter Gully herlaufen und nicht fragen.', next: 'folgen', effects: [herz(ID, 30), { advanceTime: 20 }] },
      { text: '„Warum zeigen Sie mir das?“', next: 'warum' },
    ],
  }),
  knoten('warum', [
    G('Warum? Weil Sie zurückgekommen sind. Die meisten von oben kommen einmal, rümpfen die Nase und kommen nie wieder. Sie kommen wieder. Sie reden mit mir. Sie hören sogar zu, wenn ich Reden halte.', 'besorgt'),
    G('Ein Bürgermeister ohne Freunde ist nur ein Mann mit einem Topf auf dem Kopf. Ich will nicht nur ein Mann mit einem Topf auf dem Kopf sein.'),
  ], {
    choices: [
      { text: 'Mir den Weg genau einprägen.', check: pruefung('he-gully-4-weg', 'strasse', 4, ['geruecht', 'verstecke']), next: 'gemerkt', effects: [herz(ID, 50)] },
      { text: 'Hinter Gully herlaufen.', next: 'folgen', effects: [herz(ID, 40), { advanceTime: 20 }] },
    ],
  }),
  knoten('gemerkt', [
    erz('Ihr klettert durch Rohre, unter tropfenden Leitungen, an einem Rattennest vorbei, das höflich Platz macht. Du merkst dir jede Abzweigung. Dann eine Leiter, ein Deckel – und du stehst in der Neon-Gasse, direkt neben dem Pfandflaschen-Eck. Es riecht nach Fett und Freiheit.'),
    G('Sie haben es sich gemerkt. Beim ersten Mal. Ich hab sieben Jahre gebraucht. Und einen Löffel. Ich bin beeindruckt und gekränkt.', 'ueberrascht'),
  ], { next: 'ende' }),
  knoten('folgen', [
    erz('Gully läuft voraus und kommentiert jede Biegung: „Hier hab ich einmal eine Socke verloren.“ „Hier hab ich einmal geweint.“ „Hier wohnt Herbert. Hallo, Herbert!“ Herbert ist eine Ratte. Herbert winkt nicht zurück.'),
    G('Und da ist der Deckel. Sie haben sich nichts gemerkt, oder? Macht nichts. Ich hab Pfeile an die Wände gemalt. Mit Pilzfarbe. Die leuchten.', 'freude'),
  ], { next: 'ende' }),
  knoten('ende', [
    G('Ab heute ist der Gullyweg Ihrer. Hinter dem Trockendock rein, in der Neon-Gasse raus. Und andersrum. Sagen Sie es keinem. Wenn doch, werde ich sehr, sehr enttäuscht gucken. Das ist meine schlimmste Waffe.', 'signatur'),
    erz('Neuer Weg: Gullyweg zwischen Trockendock (Kanal-Sammler) und Pfandflaschen-Eck (Neon-Gasse).'),
  ], { effects: [flag('gully_geheimweg'), { rep: 'kanalvolk', delta: 10 }, { xp: 70 }] }),
]);

/** Auswahl am Gullyweg im Kanal (Hotspot per mapAdditions). */
const geheimwegKanal = dialog('gully-geheimweg-kanal', [
  knoten('start', [
    erz('Die runde Klappe hinter dem Trockendock. Ein Kronkorken, frisch poliert. Daneben ein Pfeil in Leuchtpilzfarbe: „NEON-GASSE. NICHT HERBERT STÖREN.“'),
  ], {
    choices: [
      { text: 'Rauf in die Neon-Gasse.', effects: [{ travel: 'neon-gasse', entry: 'station', minutes: 15 }] },
      { text: 'Lieber nicht.' },
    ],
  }),
]);

// ---------------------------------------------------------------------------------------------- Figur

const gully: NpcDef = {
  id: ID,
  name: 'Bürgermeister Gully',
  unknownName: 'Mann mit Topf auf dem Kopf',
  portrait: ID,
  sprite: `${ID}-walk`,
  faction: 'kanalvolk',
  maxHearts: 5,
  bio: 'Selbsternannter Bürgermeister des Kanalvolks mit Schärpe aus Absperrband und einem Topf als Amtshut. Regiert vom Trockendock aus, hält jeden Abend Reden an die Ratten und fürchtet sich nachts an der Grenze zum Thronsaal.',
  gifts: {
    loves: ['kronkorkenkrone', 'pilzsuppe', 'zeitung-papier'],
    likes: ['synth-kaffee', 'reparaturset', 'echtobst-apfel', 'hofhonig', 'leuchtpilz'],
    dislikes: ['waschpulver'],
    hates: ['peilsender', 'rostige-dose', 'virus-implantat'],
  },
  schedule: [
    { slot: ['morgen', 'tag'], place: { map: 'kanal-sammler', at: 'gullys-rathaus' } },
    { slot: 'abend', place: { map: 'kanal-sammler', at: 'rechen' } },
    { slot: 'nacht', place: { map: 'kanal-sammler', at: 'thronsaal-grenze' } },
  ],
  heartEvents: [
    herzEreignis('he-buergermeister-gully-2', 2, 'kanal-sammler', ['morgen', 'tag']),
    herzEreignis('he-buergermeister-gully-4', 4, 'kanal-sammler', ['morgen', 'tag']),
  ],
  talk: [
    rede('buergermeister-gully-tag-erstes', { not: { met: ID } }),
    rede('buergermeister-gully-tag-rk-sieg', alle(RK_DONE, { notFlag: 'gully_rk_dank' })),
    rede('buergermeister-gully-tag-strom', alle(STROM_DONE, { notFlag: 'gully_strom_dank' })),
    rede('buergermeister-gully-tag-rk', RK_AKTIV),
    rede('buergermeister-gully-tag-grenze', alle({ time: 'nacht' }, nicht(RK_DONE))),
    rede('buergermeister-gully-tag-grenze-frei', { time: 'nacht' }),
    rede('buergermeister-gully-tag-rechen', { time: 'abend' }),
    rede('buergermeister-gully-tag-ehrenbuerger', { flag: 'ehrenbuerger_der_rohre' }),
    rede('buergermeister-gully-tag-rathaus'),
  ],
};

export const part: ContentPart = {
  npcs: { [ID]: gully },
  dialogues: sammle(
    T.erstes, T.rkSieg, T.stromDone, T.rkAktiv, T.abend, T.nacht, T.nachtFrei, T.ehrenbuerger, T.standard,
    he2, he4, geheimwegKanal,
  ),
  mapAdditions: {
    'kanal-sammler': {
      hotspots: [{
        id: 'gully-geheimweg', at: 'trockendock', radius: 48, label: 'Gullyweg (Klappe mit Kronkorken)', kind: 'use',
        when: GEHEIMWEG, dialogue: 'gully-geheimweg-kanal',
      }],
    },
    'neon-gasse': {
      hotspots: [{
        id: 'gully-geheimweg-oben', at: 'pfandflaschen-ecke', radius: 44, label: 'Gullydeckel mit Kronkorken', kind: 'use',
        when: GEHEIMWEG,
        lines: [
          { speaker: 'narrator', text: 'Ein Gullydeckel, auf den jemand einen Kronkorken geklebt hat. Darunter: eine Leiter, ein Pfeil in Leuchtpilzfarbe und der Geruch von Gullys Wasserkocher.' },
        ],
        effects: [{ travel: 'kanal-sammler', entry: 'aufwachen', minutes: 15 }],
      }],
    },
  },
};
