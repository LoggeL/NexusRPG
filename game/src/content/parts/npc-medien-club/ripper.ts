// Ripper – Schrauber, Hehler, Kopf der Zerleger (world.md §4.4, §4.6, §11.2).
// Tagesablauf nach design/plan/act1.json (npcSchedules.ripper), Herz-Ereignisse he-ripper-2/4/6 in Akt 1 (Orte laut
// plan events). Akt 2/3 und Nachspiel (he-ripper-8/10, Tagesgespräche, Tagesablauf, Fähigkeit) in ripper-23.ts.
// Begleiter ab ♥6 als Söldner (30 Cr, im Master-Modus 60, siehe gaps).
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode, NpcDef } from '../../../modules/contracts';
import {
  type Menu, AKT1, AKT2, IRGENDEINE_NACHT, NOT_VEX, VEX, VEXARIA, ZEIT_HINWEIS, all, any, byId, chk, daily, dlg, erz,
  hearts, ich, noFlag, node, not, rel, rep, seen, set, sp, talk, xp,
} from './_util';
import { MASTER } from './_util';
import {
  RIPPER_ABILITIES, RIPPER_ABILITY_RULES, RIPPER_SCHEDULE_23, RIPPER_TALK_23, RIPPER_TALK_MASTER, ripper23,
} from './ripper-23';

const R = sp('ripper');
const KUNDIN = sp('narrator');

const PROBEZEIT: Condition = { quest: 'main-1-probezeit', state: 'done' };
const ANGEHEUERT: Condition = { recruited: 'ripper' };

// ------------------------------------------------------------------------------------------- Menü

function menu(): Menu {
  const zurueck: DialogueChoice[] = [{ text: 'Noch was, Ripper.', next: 'menue', id: 'zurueck' }, { text: 'Bis dann.' }];

  const choices: DialogueChoice[] = [
    { text: '„Du bist der mit den zehn Credits für Kinder.“', tag: '[Gosse]', when: { origin: 'origin-gossenkind' }, once: true, id: 'r-gosse', next: 'r-gosse' },
    { text: '„Das ist ein Kessler-Servo. Den hast du falsch rum eingelötet.“', tag: '[Schrott]', when: { origin: 'origin-schrott' }, once: true, id: 'r-schrott', next: 'r-schrott', effects: [rel('ripper', 50)] },
    { text: 'Zeig mal, was du hast.', when: { time: 'tag' }, next: 'laden' },
    { text: '„Der Arm knirscht.“', when: VEX, next: 'arm', id: 'r-arm' },
    { text: 'Was zahlst du den Kindern eigentlich?', when: PROBEZEIT, once: true, id: 'r-kinder', next: 'kinder' },
    {
      text: 'Was läuft in Container 77?', tag: '[Ripper ♥3]', requires: hearts('ripper', 3), once: true, id: 'r-container',
      next: 'container', when: PROBEZEIT,
    },
    { text: 'Erzähl mir von der Uhr deines Vaters.', when: seen('he-ripper-6'), once: true, id: 'r-uhr', next: 'uhr' },
    {
      text: '„Die Uhr deines Vaters. Ich bin jetzt oft genug da oben. Ich hol sie.“', id: 'r-uhr-akt2', next: 'uhr-quest',
      when: all(AKT2, seen('he-ripper-6'), { quest: 'pers-ripper-taschenuhr', state: 'inactive' }, not(MASTER)),
      effects: [{ startQuest: 'pers-ripper-taschenuhr' }],
    },
    {
      text: 'Komm mit. Dreißig für heute.', tag: '[Ripper ♥6 · 30 Cr]', id: 'r-anheuern',
      when: all(hearts('ripper', 6), not(ANGEHEUERT), not(MASTER)), requires: { credits: 30 }, next: 'anheuern',
      effects: [{ credits: -30 }, { recruit: 'ripper' }, set('ripper_soeldner')],
    },
    { text: 'Feierabend, Ripper. Du kannst gehen.', when: ANGEHEUERT, next: 'entlassen', effects: [{ dismiss: 'ripper' }] },
    { text: 'Bis dann.' },
  ];

  const nodes: DialogueNode[] = [
    node('menue', [R('Noch was? Reden kostet nix. Zuhören schon. Ich schreib’s auf.', 'signatur')], { choices }),
    node('r-gosse', [
      R('Zehn sind zehn mehr als null, Schätzchen. Frag mal in der Oberstadt, was die für eure Rotznasen zahlen.', 'wut'),
      R('Du bist eine von denen, die mir Ärger machen. Ich riech das. Ihr riecht alle nach nassem Karton und Gerechtigkeit.'),
    ], { choices: zurueck }),
    node('r-schrott', [
      R('Falsch rum …', 'ueberrascht'),
      erz('Er dreht das Teil unter der Lupe. Einmal. Zweimal. Dann flucht er so leise, dass es fast ein Gebet ist.'),
      R('Wo hast du das gelernt? Gustav? Natürlich Gustav. Der alte Sack hat mir mit zwölf auf die Finger gehauen, weil ich seinen Lötkolben geklaut hab.', 'freude'),
      R('Na gut. Du darfst wiederkommen. Aber du fasst nix an, ohne zu fragen. Und wenn du fragst, sag ich nein.', 'signatur'),
    ], { choices: zurueck }),
    node('laden', [R('Was haben wir denn da? Ach ja: dich. Und dein Geld. Lass uns Freunde werden, ihr zwei.', 'signatur')], {
      effects: [{ shop: 'ripper-praxis' }],
    }),
    node('arm', [
      R('Knirscht? Das ist kein Knirschen, das ist Charakter. Der Arm redet mit dir. Er sagt: „Montag. Fünfundzwanzig.“', 'signatur'),
      ich('Und wenn er bricht?'),
      R('Dann gehört er immer noch mir, bis die letzte Rate drin ist. Geh zu deinem Plattenmann, der ölt umsonst. Der ist so nett, dass mir schlecht wird.'),
    ], { choices: zurueck }),
    node('kinder', [
      R('Was ich den Kindern zahle? Was der Markt hergibt.', 'signatur'),
      R('Und der Markt ist ein Arschloch, Schätzchen. Ich bin nur sein Kassierer.'),
      erz('Er sieht dabei kurz zu dem Pappschild mit den Preisen. Länger, als ein Kassierer gucken müsste.'),
    ], { choices: zurueck }),
    node('container', [
      R('Container 77? Nie gehört. Großer Hafen. Viele Zahlen.', 'besorgt'),
      R('… Dienstags. Nachts. Wenn du da Leute siehst, die aussehen wie ich und einer, der aussieht wie ein Schrank mit Krallen: Du hast sie nicht gesehen.'),
      R('Ich sag dir das, weil du mir sympathisch bist. Das ist gelogen. Ich sag dir das, damit du weißt, wo du NICHT hingehst.', 'signatur'),
    ], { choices: zurueck, effects: [set('container_77_gehoert')] }),
    node('uhr', [
      R('Messing. Springdeckel. Ein kleiner Kratzer, wo ich mit sechs reingebissen hab, weil ich dachte, die ist aus Schokolade.', 'trauer'),
      R('Hängt jetzt in einer Vitrine auf dem Chrome-Boulevard. Rote Seide drumrum. Preisschild drunter. Für das, was die verlangt, kauf ich dir die halbe Praxis.'),
      R('Wenn du je da oben bist … guck sie dir nur an. Mehr nicht. Ich will wissen, ob sie noch tickt.', 'besorgt'),
    ], {
      choices: [
        { text: 'Ich hol sie dir.', when: AKT2, next: 'uhr-quest', effects: [{ startQuest: 'pers-ripper-taschenuhr' }] },
        { text: 'Wenn ich je da hochkomme, schau ich nach.', next: 'uhr-spaeter', effects: [set('ripper_taschenuhr_versprochen')] },
        ...zurueck,
      ],
    }),
    node('uhr-quest', [R('Du hast einen Knall. … Mach. Aber wenn du erwischt wirst, kenn ich dich nicht. Und wenn nicht, kenn ich dich sehr gut.', 'freude')], { choices: zurueck }),
    node('uhr-spaeter', [R('Pff. Versprechen. Die sind wie Gebrauchtteile: Sehen gut aus, bis man sie einbaut.', 'signatur'), R('… Danke.')], { choices: zurueck }),
    node('anheuern', [
      erz('Du legst dreißig Credits auf den Tisch. Ripper zählt sie zweimal, beißt auf eine Münze und steckt sie in eine Westentasche, die vorher nicht da war.'),
      R('Freundschaftspreis. Andere zahlen fünfzig. Andere sind aber auch nicht meine Freunde. Sie sind meine Kunden.', 'signatur'),
      R('Regeln: Ich schieß nur, wenn’s sich lohnt. Was die Gegner fallen lassen, prüf ich zuerst. Und wenn’s brenzlig wird, bin ich der Erste, der „Das ist mir zu heiß!“ ruft.'),
      R('Und: Dreißig. Jeden Morgen. Solange ich hinter dir herlaufe, buch ich das selbst ab. Ist die Kasse leer, bin ich weg. Ich bin kein Ehrenamt, Schätzchen.', 'signatur'),
    ]),
    node('entlassen', [R('Hat mich gefreut. Nein, hat’s nicht. Aber das Geld schon. Bis zum nächsten Mal, Kundschaft.', 'signatur')]),
  ];
  return { choices, nodes };
}

const M = menu();

// ------------------------------------------------------------------------------------------- Tagesgespräche

const T = {
  rivale: daily('ripper-tag-rivale',
    [R('Du. Ich hab dein Gesicht auf einen Zettel gemalt und den Zettel an die Dartscheibe gehängt. Ich treff schlecht. Aber ich übe.', 'wut')],
    [
      R('Willst du was kaufen? Für dich gilt der Spezialtarif: doppelt. Und auf alles ist ein Virus drauf. Extra für dich.', 'wut'),
      R('Willst du das wieder grade biegen? Container 77. Da läuft was, das mir den Hals brechen könnte. Lass es platzen, ohne mich zu verpfeifen. Dann reden wir.', 'besorgt'),
    ],
    { choices: [{ text: 'Schon gut.' }], nodes: [] }),
  vexaria: daily('ripper-tag-vexaria',
    [
      R('Na, wen haben wir denn da? Die Kurierin. Und so ein Grinsen. Das kenn ich. Das ist das Grinsen nach einem guten Deal.', 'signatur'),
      R('Kurierin und Brecherin. Liefert ihr jetzt zu zweit? Ich hätt’ da ’n Paket.'),
      R('Und sind alle Implantate noch dran? Nur fürs Protokoll. Ich hab Garantieansprüche.', 'freude'),
    ],
    [
      R('Wenn sie dir mit der Metallhand am Arm rumfummelt: Die Lichtnähte sind empfindlich. Nicht wegen dir. Wegen meiner Ware.', 'signatur'),
      R('Ich mein ja nur. Romantik kostet. Reparaturen auch. Ich nehm beides in bar.'),
    ],
    M, { effects: [set('ripper_kommentar_vexaria')] }),
  nacht: daily('ripper-tag-nacht',
    [
      R('Morgen. Oder Mittag. Du siehst aus, als wüsstest du nicht, welches.', 'signatur'),
      R('Kurze Frage, rein geschäftlich: Sind alle Implantate noch dran? Ich frag jeden, der so guckt. Letztes Jahr fehlte einem ein Ohr. Liebe ist ein Schlachtfeld, Schätzchen.'),
    ],
    [R('Ich verkauf auch Halstücher. Gegen Flecken am Hals. Nicht dass du welche hast. Ich mein ja nur. Zehn Credits.', 'freude')],
    M, { effects: [set('ripper_kommentar_nacht')] }),
  zeit: daily('ripper-tag-zeit',
    [
      R('Du schon wieder. Weißt du, was das Schlimmste ist? Ich hab mich an dich gewöhnt. Das ist schlecht fürs Geschäft.', 'besorgt'),
      erz(ZEIT_HINWEIS),
    ],
    [R('Es gibt da was mit den Kindern und meinen Preisen. Rede ich nicht drüber. Noch nicht. Erst wenn die Stadt mich zwingt. Oder du.')],
    M),
  fremd: daily('ripper-tag-fremd',
    [R('Was haben wir denn da? Frischfleisch. Gesund, wenig Chrom, zwei funktionierende Nieren.', 'signatur')],
    [R('Keine Sorge, ich guck nur. Gucken kostet nix. Noch nicht. Komm wieder, wenn du was hast, das ich ausschlachten kann. Oder Geld.')],
    M),
  container: daily('ripper-tag-container',
    [R('Hast du dich verlaufen? Hier gibt’s nichts zu sehen. Nur Container. Und Nebel. Und mich, der nicht hier ist.', 'besorgt')],
    [R('Wenn du einen großen Kerl mit Krallen siehst: lächeln, nicken, rückwärts gehen. Der kauft keine Teile. Der macht welche.', 'besorgt')],
    M),
  kanal: daily('ripper-tag-kanal',
    [R('Mein Lager. Mein Kanal. Meine Ratten. Die eine da heißt Buchhaltung. Die beißt, wenn die Zahlen nicht stimmen.', 'signatur')],
    [
      R('Dienstag und Freitag kommt die Lieferung. Woher? Von oben. Was? Ersatzteile. Für wen? Für Leute, die nicht fragen.'),
      R('Du fragst ziemlich viel für jemanden, der nicht fragen soll.', 'wut'),
    ],
    M),
  praxis: daily('ripper-tag-praxis',
    [R('Willkommen in Rippers Praxis! Grünes Kreuz heißt: Hier wird geholfen. Gegen Bezahlung. Das steht klein drunter.', 'freude')],
    [
      R('Neues Auge? Neue Hand? Neue Leber? Die Leber ist gebraucht, aber der Vorbesitzer hat kaum getrunken. Behauptet er. Er ist tot, also kann er nicht widersprechen.', 'signatur'),
      R('Was haben wir denn da? Eine Kundin mit Zweifeln. Die mag ich. Zweifel kann man verkaufen. Ich nenn das Garantieverlängerung.'),
    ],
    M),
  ecktisch: daily('ripper-tag-ecktisch',
    [R('Mein Ecktisch. Hunter hat mir den nie vermietet. Ich sitz hier trotzdem seit sechs Jahren. Gewohnheitsrecht, Schätzchen.', 'signatur')],
    [
      R('Siehst du den Typen an der Bar? Linkes Auge Quantum-Billigserie, rechtes Auge Glas. Der zahlt mir das Glasauge seit zwei Jahren ab. Ich hab ihm gesagt: Wenn du nicht zahlst, hol ich’s mir.'),
      R('Hat er nicht geglaubt. Jetzt glaubt er. Und sieht nur noch halb so viel. Ist trotzdem glücklicher.', 'freude'),
    ],
    M),
  vertraut: daily('ripper-tag-vertraut',
    [R('{name}. Setz dich. Nein, nicht da, da sitzt meine Kasse. Daneben.', 'freude')],
    [
      R('Weißt du, warum ich die Lupe immer dabeihab? Weil die Welt aus der Nähe ehrlicher aussieht. Die Leute nicht. Aber die Welt.'),
      R('… Das hast du nicht gehört. Ich bin ein Halsabschneider. Schreib das auf, wenn du über mich redest.', 'signatur'),
    ],
    M),
  standard: daily('ripper-tag-standard',
    [R('Was haben wir denn da? Ach, du. Willst du was verkaufen? Zeig her. Da ist ein Virus drauf. Zehn Credits.', 'signatur')],
    [R('Die Stadt ist ein großer Schrottplatz, und ich bin der Einzige, der weiß, was die Teile wert sind. Das macht mich nicht reich. Das macht mich unbeliebt. Reich bin ich nebenbei.')],
    M),
};

// ------------------------------------------------------------------------------------------- he-ripper-2

const he2 = dlg('he-ripper-2', [
  node('start', [
    erz('Rippers Praxis, mittags. Unter dem grünen Kreuz glänzt eine neue Vitrine. Darin, auf Samt: ein Auge. Rot leuchtende Iris, ein Etikett: „Nachtsicht PREMIUM – Oberstadt-Qualität – 400 Cr“.'),
    KUNDIN('Vor der Vitrine steht eine Frau in Gummistiefeln, ein Bündel Scheine in der Faust. „Für meinen Jungen. Der arbeitet nachts im Kanal. Der sieht da unten nix.“'),
    R('Bestes Auge der Stadt, Gnädigste. Da sieht Ihr Junge im Dunkeln die Ratten husten. Vierhundert, und ich leg ein Putztuch drauf.', 'signatur'),
    erz('Irgendwas an dem Auge stimmt nicht. Es leuchtet ein bisschen zu gleichmäßig. Wie eine Lampe. Eine billige.'),
  ], {
    choices: [
      { text: 'Das Gehäuse prüfen. Ohne dass er’s merkt.', check: chk('he-ripper-2-gehaeuse', 'technik', 5, ['cyberware', 'faelschung']), next: 'technik' },
      { text: '„Seit wann schreibt Quantum Seriennummern mit Kuli?“', check: chk('he-ripper-2-trick', 'strasse', 4, ['faelschung', 'handel']), next: 'strasse' },
      { text: '„Das ist ein Fahrradrücklicht. Mit Murmel.“', tag: '[Schrott]', when: { origin: 'origin-schrott' }, next: 'schrott' },
      { text: '„Darf ich mal halten?“ Das Ding gegen das Fenster heben.', next: 'licht' },
      { text: 'Nichts sagen. Ist nicht mein Problem.', next: 'weg' },
    ],
  }),
  node('technik', [
    erz('Du lehnst dich an die Vitrine, als wolltest du nur gucken, und tippst mit dem Fingernagel an die Fassung. Ein winziger Spalt, ein Druck, und die Rückseite klappt auf: zwei Knopfzellen, eine rote Diode, ein Kaugummi als Kleber.'),
    R('…', 'ueberrascht'),
  ], { next: 'erwischt' }),
  node('strasse', [
    ich('Und das Siegel ist von einer Nougatbomben-Packung. Man sieht noch das „ougat“.'),
    R('Das ist … ein Designelement.', 'ueberrascht'),
  ], { next: 'erwischt' }),
  node('schrott', [
    ich('Vorne Rücklicht, hinten Murmel, dazwischen Hoffnung. Hab ich mit neun auch gebaut. Hab’s aber nicht für vierhundert verkauft.'),
    R('Mit neun hätt ich’s für vierhundert verkauft. Deshalb hab ich eine Praxis und du nicht.', 'signatur'),
  ], { next: 'erwischt' }),
  node('licht', [
    erz('Ripper kann nicht schnell genug Nein sagen. Du hältst das Auge ins Mittagslicht. Durch die rote Iris sieht man eine Glasmurmel. Und dahinter eine Batterie mit der Aufschrift „Volt-Eck – 2 für 1“.'),
    KUNDIN('Die Frau starrt darauf. Dann auf Ripper.'),
  ], { next: 'erwischt' }),
  node('erwischt', [
    R('Ich … das ist ein Ausstellungsstück. Das echte liegt hinten. Natürlich. Hinten.', 'besorgt'),
    erz('Die Frau in Gummistiefeln sieht dich an. Ripper sieht dich an. Hinten liegt gar nichts, das wisst ihr alle drei.'),
  ], {
    choices: [
      {
        text: 'Leise zu Ripper: „Gib ihr was Echtes. Zum Murmelpreis.“', next: 'leise',
        effects: [rel('ripper', 40), set('ripper_rabatt'), rep('unterstadt', 3)],
      },
      {
        text: 'Laut: „Leute! Rippers Premium-Auge ist ein Rücklicht!“', next: 'laut',
        effects: [rel('ripper', 10), set('ripper_rabatt'), rep('unterstadt', 6), rep('zerleger', -5)],
      },
      {
        text: 'Zu Ripper: „Fünfzig, und ich hab nichts gesehen.“', next: 'erpressen',
        effects: [{ credits: 50 }, rel('ripper', -10), set('ripper_kennt_dich'), rep('zerleger', 3)],
      },
    ],
  }),
  node('leise', [
    R('Zum Murmelpreis. Du ruinierst mich. Weißt du das?', 'wut'),
    erz('Er verschwindet hinter dem Vorhang und kommt mit einem echten, matten, hässlichen Nachtsichtauge zurück. Gebraucht. Funktioniert. „Achtzig. Für Ihren Jungen. Und erzählen Sie keinem, dass ich nett war.“'),
    KUNDIN('Die Frau drückt dir im Gehen den Arm. Ripper sieht dabei weg.'),
    R('Du hast gute Augen. Bessere als meine Ware. Ab heute zahlst du zehn Prozent weniger. Weil ich dich nicht zum Feind will. Nicht, weil ich dich mag.', 'signatur'),
  ], { next: 'ende' }),
  node('laut', [
    erz('Draußen bleibt der halbe Markt stehen. Jemand lacht. Jemand ruft „Rücklicht-Ripper!“. Der Name wird kleben, das hörst du schon.'),
    R('Du … kleine … Sch…', 'wut'),
    R('Gut. Gut! Zehn Prozent Rabatt für alle Kunden mit Augen. Heute und für immer. Zufrieden? Und jetzt RAUS, Gnädigste, Sie kriegen ein echtes, gebraucht, achtzig.'),
    R('Und du: Respekt. Großes Maul, gutes Auge. Das ist eine gefährliche Mischung. Ich hab die auch.', 'signatur'),
  ], { next: 'ende' }),
  node('erpressen', [
    R('Fünfzig. Für nichts gesehen.', 'ueberrascht'),
    R('… Das ist das erste Mal seit Jahren, dass mich jemand beklaut, und ich bin stolz drauf.', 'freude'),
    erz('Er zählt dir fünfzig hin. Dann tauscht er das Auge gegen ein echtes, das er der Frau für achtzig verkauft, und zwinkert dir zu, als wärt ihr Kollegen. Seid ihr jetzt wohl.'),
    R('Ich kenn dich jetzt. Das ist gut für dich. Und schlecht für dich. Such’s dir aus.', 'signatur'),
  ], { next: 'ende-erpresst' }),
  node('weg', [
    erz('Du drehst dich weg. Hinter dir zählt Ripper vierhundert Credits. Draußen fängt der Junge der Frau heute Nacht an, mit einer Murmel im Kopf durch den Kanal zu laufen.'),
    R('Kluges Kind. Wer nichts sieht, braucht kein Auge.', 'signatur'),
  ], { effects: [rel('ripper', 10), rep('unterstadt', -3)] }),
  node('ende', [erz('Rippers Preise sinken für dich um zehn Prozent. Ripper selbst sinkt in seinen Stuhl und guckt die Murmel an, als hätte sie ihn verraten.')], {
    effects: [xp(40), { message: 'Ripper: −10 % für dich.' }],
  }),
  node('ende-erpresst', [erz('Fünfzig Credits mehr. Und ein Hehler, der dich jetzt beim Namen kennt.')], { effects: [xp(40)] }),
]);

// ------------------------------------------------------------------------------------------- he-ripper-4

const he4 = dlg('he-ripper-4', [
  node('start', [
    erz('Auf dem Behandlungsstuhl sitzt kein Patient, sondern ein Mann in einem Anzug, der nach Glasarkaden riecht. Silbernes Haar, silberne Manschetten, ein silbernes Lächeln. Auf seinem Schoß: ein Koffer mit Schaumstoff-Fächern.'),
    sp('narrator')('„Silberling. Sammlung Echtheit“, steht auf der Karte, die er dir reicht, ohne dich anzusehen. „Wir kaufen Geschichte. Unterstadt-Teile. Getragen. Mit Patina.“'),
    R('Der Herr will Kanal-Kiemen vom Kanalvolk, alte Kinderimplantate aus meiner Kiste und, ich zitiere, „irgendwas, das noch warm ist“.', 'besorgt'),
    R('Fünfhundert. Für eine Kiste Ausschuss. Das ist mehr, als ich im Monat verdiene. Offiziell.'),
    erz('Auf der Rückseite der Visitenkarte, kaum sichtbar im Gegenlicht: ein blasses Wasserzeichen. Ein Q.'),
  ], {
    choices: [
      { text: '„Verkauf. Fünfhundert sind fünfhundert.“', next: 'verkauf' },
      { text: '„Dreifacher Preis. Und die Kinderteile bleiben hier.“', check: chk('he-ripper-4-feilschen', 'strasse', 6, ['handel', 'verhandeln']), next: 'feilschen' },
      { text: 'Laut, mit Rippers Stimme: „Da ist ein Virus drauf!“', check: chk('he-ripper-4-virus', 'ausstrahlung', 5, ['bluff', 'luegen']), next: 'virus' },
      { text: 'Die alte Dienstmarke zeigen. „Kontrolle. Herkunftsnachweise, bitte.“', tag: '[Ex-Wache]', when: { origin: 'origin-ex-wache' }, next: 'marke' },
      { text: 'Ripper beiseite nehmen. „Der kauft keine Teile. Der kauft uns.“', next: 'beiseite' },
    ],
  }),
  node('verkauf', [
    R('Siehst du? Geschäftssinn. Ich wusste, aus dir wird was.', 'freude'),
    erz('Ripper packt den Koffer voll. Bei der Kiste mit den Kinderimplantaten zögert er. Eine Sekunde. Zwei. Dann packt er sie dazu. Silberling zahlt, ohne zu zählen, und geht, ohne sich zu verabschieden.'),
    R('Zehn Prozent für dich. Vermittlungsgebühr. …', 'signatur'),
    R('Schöne Hände hat der. Nie was getragen damit. Nur gekauft.', 'besorgt'),
  ], { effects: [{ credits: 50 }, rel('ripper', 30), rep('zerleger', 5), rep('unterstadt', -5), set('ripper_oberstadt_deal', true), set('ripper_deal_gemacht')], next: 'ende' }),
  node('feilschen', [
    ich('Patina kostet extra. Geschichte kostet doppelt. Und Kinder sind unverkäuflich, das ist hier Tradition.'),
    erz('Silberling hebt zum ersten Mal den Blick. Er mustert dich wie eine Vase, bei der er sich nicht sicher ist, ob sie echt ist. Dann zahlt er fünfzehnhundert für Kiemen und Ausschuss. Die Kinderkiste bleibt auf dem Tresen.'),
    R('Fünfzehnhundert. FÜNFZEHNHUNDERT. Ich glaub, ich muss mich hinlegen. Auf den Stuhl. Mein Stuhl. Der ist wieder frei.', 'ueberrascht'),
    R('Achtzig für dich. Ja, nur achtzig. Ich bin gerührt, nicht bescheuert.', 'freude'),
  ], { effects: [{ credits: 80 }, rel('ripper', 60), rep('zerleger', 5), set('ripper_deal_gemacht')], next: 'kinderkiste' }),
  node('virus', [
    erz('Du schnappst dir das nächstbeste Implantat, hältst es gegen das Licht und kreischst es fast: „DA IST EIN VIRUS DRAUF!“'),
    erz('Silberling springt auf, als hätte der Stuhl ihn gebissen. Er klappt den Koffer zu, wischt sich die Hände an einem Seidentuch ab und ist draußen, bevor die Glastür zu Ende gequietscht hat.'),
    R('Das ist MEIN Spruch!', 'wut'),
    R('…', 'ueberrascht'),
    R('Und du sagst ihn besser als ich. Verdammt. Fünfhundert Credits Verlust, und ich lach. Was hast du mit mir gemacht?', 'freude'),
  ], { effects: [rel('ripper', 50), rep('unterstadt', 5), set('ripper_deal_geplatzt')], next: 'kinderkiste' }),
  node('marke', [
    erz('Du klappst die alte Marke auf. Sie ist abgelaufen, verbeult und eindeutig nicht mehr gültig. Silberling sieht nur das Wappen.'),
    sp('narrator')('„Ich – ich bin nur Sammler. Ich hab nichts gekauft. Ich war nie hier.“ Er ist weg, bevor du „Ausweis“ sagen kannst.'),
    R('Eine Wache. In meiner Praxis. Und ich hab mich nicht übergeben. Das ist Fortschritt.', 'ueberrascht'),
  ], { effects: [rel('ripper', 40), set('ripper_deal_geplatzt')], next: 'kinderkiste' }),
  node('beiseite', [
    ich('Guck dir die Karte gegen das Licht an. Das Q. Die kaufen nicht Patina. Die kaufen, was hier unten noch funktioniert. Und dann bauen sie’s nach. Oder ab.'),
    R('…', 'besorgt'),
    erz('Ripper hält die Karte gegen die Lampe. Lange. Dann geht er zum Stuhl, nimmt Silberling den Koffer vom Schoß und stellt ihn vor die Tür.'),
    R('Geschlossen. Inventur. Wegen … Viren. Auf Wiedersehen, Herr Silberling.', 'wut'),
  ], { effects: [rel('ripper', 40), rep('unterstadt', 3), set('ripper_deal_geplatzt')], next: 'kinderkiste' }),
  node('kinderkiste', [
    erz('Die Kiste mit den alten Kinderimplantaten steht noch auf dem Tresen. Ripper legt die Hand drauf. Nicht wie ein Händler. Eher wie jemand, der eine Katze beruhigt.'),
    R('Weißt du, was das Witzige ist? Mein erstes Implantat hab ich mit acht verkauft. Ein Ohr. Nicht meins, ich hab’s gefunden. Glaub ich.', 'trauer'),
    R('Vergiss es. Ich red zu viel, wenn ich kein Geld verdiene.'),
  ], { next: 'ende' }),
  node('ende', [
    R('Die Oberstadt will unsere Teile. Unsere Kiemen, unsere Augen, unsere Kinder-Ohren. Und irgendwann will sie den Rest.', 'besorgt'),
    R('Merk dir das Q, {name}. Ich hab’s mir gemerkt.'),
  ], { effects: [xp(50), set('geruecht_q_sammler')] }),
]);

// ------------------------------------------------------------------------------------------- he-ripper-6

const he6 = dlg('he-ripper-6', [
  node('start', [
    erz('Abends am Ecktisch. Ripper hat kein Kassenbuch vor sich, sondern ein Samttuch. Darauf liegen zwölf Taschenuhren in einer Reihe, aufgeklappt. Elf ticken. Eine nicht.'),
    R('Setz dich. Nicht anfassen. Atmen geht.', 'besorgt'),
    erz('Er zieht jede einzeln auf, hält sie ans Ohr und legt sie zurück. Bei der zwölften wartet er. Nichts.'),
  ], {
    choices: [
      { text: '„Du ziehst die in einer Reihenfolge auf. Wie ein Gebet.“', check: chk('he-ripper-6-reihenfolge', 'strasse', 5, ['beobachten']), next: 'reihenfolge' },
      { text: '„Gib mir die stumme. Da hängt nur die Unruh.“', check: chk('he-ripper-6-unruh', 'technik', 5, ['reparieren', 'feinmechanik']), next: 'reparatur' },
      { text: 'Zweimal klopfen, Pause, einmal. Das Klopfzeichen der Kanal-Kinder.', tag: '[Gosse]', when: { origin: 'origin-gossenkind' }, next: 'klopfen' },
      { text: 'Einfach still sitzen bleiben und zuhören.', next: 'zuhoeren' },
    ],
  }),
  node('reihenfolge', [
    R('Gebet. Pff. Ich bete nicht. Ich zähl.', 'signatur'),
    R('… Die erste hab ich mit neun geklaut. Die zweite mit zehn verkauft und mit elf zurückgeklaut. Jede ist ein Jahr. Zwölf Jahre auf der Straße, bevor mich einer reingelassen hat.'),
  ], { next: 'geschichte' }),
  node('reparatur', [
    erz('Ripper zögert, dann legt er dir die stumme Uhr auf die Handfläche, als wäre sie aus Zucker. Du tippst die Unruh mit der Spitze eines Zahnstochers an. Ein Zucken. Dann: tick. Tick. Tick.'),
    R('Die läuft seit drei Jahren nicht.', 'ueberrascht'),
    R('Ich hab sie zu jedem Uhrmacher in der Unterstadt gebracht. Alle wollten Geld. Du willst … was willst du?', 'besorgt'),
  ], { effects: [rel('ripper', 30)], next: 'geschichte' }),
  node('klopfen', [
    R('…', 'ueberrascht'),
    erz('Ripper klopft zurück. Zweimal, Pause, einmal. Seine Hand zittert dabei nicht. Seine Stimme schon.'),
    R('Das kennt keiner mehr. Das haben wir erfunden. Ich und Jola und der kleine Bert. Jola ist tot. Bert verkauft Versicherungen. Schlimmer als tot.', 'trauer'),
  ], { effects: [rel('ripper', 40)], next: 'geschichte' }),
  node('zuhoeren', [
    erz('Du sagst nichts. Das Ticken füllt den Tisch, den Lärm der Bar, die Pause zwischen zwei Liedern. Irgendwann fängt Ripper an zu reden. Nicht zu dir. Eher zu den Uhren.'),
  ], { next: 'geschichte' }),
  node('geschichte', [
    R('Mein Vater hat in den Lötgassen Uhren repariert. Keine Implantate. Uhren. Er sagte: „Ein Implantat sagt dir, was du bist. Eine Uhr sagt dir nur, wie spät es ist. Das ist ehrlicher.“', 'trauer'),
    R('Dann kam das Chipfieber. Das erste, lange vor eurem Jimmy. Er hat gehustet, bis er nicht mehr gehustet hat. Ich war neun.'),
    R('Seine Uhr hab ich für zwei Dosen Bohnen verkauft. Zwei. Und heute hängt sie in einer Boutique auf dem Chrome-Boulevard. Rote Seide. Sechshundert Credits.', 'wut'),
    R('Und deshalb, Schätzchen, zahl ich euren Kindern zehn Credits. Weil mir keiner was gezahlt hat. Das ist nicht fair. Das ist Tradition.', 'signatur'),
  ], {
    choices: [
      { text: '„Tradition ist das, was man aufhört, wenn man’s kapiert hat.“', next: 'kinder', effects: [rel('ripper', 20), set('ripper_kinder_nachdenklich')] },
      { text: '„Ich hol dir die Uhr zurück. Irgendwann.“', next: 'uhr', effects: [set('ripper_taschenuhr_versprochen')] },
      { text: '„Den Arm hast du mir auch nicht geschenkt.“', when: VEX, next: 'vex' },
      { text: 'Nichts sagen. Ihm das Glas nachfüllen.', next: 'glas', effects: [rel('ripper', 10)] },
    ],
  }),
  node('kinder', [
    R('Kapiert. Pff. Du klingst wie Freya. Die Kleine mit dem Ordner. Die schreibt meine Preise auf und hängt sie an die Markttafel. Mit Ausrufezeichen.', 'wut'),
    R('… Vielleicht red ich mal mit ihr. Nicht wegen dir. Wegen der Ausrufezeichen.'),
  ], { next: 'ende' }),
  node('uhr', [
    R('Irgendwann. Das Wort kauf ich nicht. Das hab ich zu oft gehört.', 'signatur'),
    R('… Aber wenn du’s schaffst, dann zahl ich dir den vollen Preis für alles, was du mir je bringst. Einen Monat lang. Das ist mein Ernst. Das ist das Ernsteste, was ich hab.'),
  ], { next: 'ende' }),
  node('vex', [
    R('Nein. Hab ich nicht.', 'signatur'),
    R('Du kamst rein, eine Hand weniger, das Gurtzeug von wem anders um die Brust, und hast nicht geheult. Kein Wort. Hast nur gefragt, was es kostet.'),
    R('Ich hab dir den Ratenarm gegeben, den die Brecherin nicht wollte. Weil du mich an mich erinnert hast. Zahl trotzdem. Montags. Sentimentalität macht keine Miete.', 'besorgt'),
  ], { effects: [rel('ripper', 20)], next: 'ende' }),
  node('glas', [
    erz('Du schenkst nach. Ripper trinkt nicht. Er hält das Glas nur fest, als könnte es auch weglaufen.'),
  ], { next: 'ende' }),
  node('ende', [
    R('Gut. Genug geheult. Ich hab nicht geheult. Das ist Lötdampf.', 'wut'),
    R('Hör zu. Wenn du mal Rückendeckung brauchst, irgendwo, wo’s knallt: dreißig am Tag. Freundschaftspreis. Andere zahlen fünfzig. Andere sind auch keine Freunde.', 'signatur'),
    erz('Ripper klappt die Uhren zu, eine nach der anderen. Die zwölfte zuletzt. Wenn du sie repariert hast, tickt sie noch, als er sie in die Weste steckt.'),
  ], { effects: [xp(60), set('ripper_soeldner_angebot'), { message: 'Ripper kann jetzt als Söldner angeheuert werden (30 Cr).' }] }),
]);

// ------------------------------------------------------------------------------------------- Figur

const ripper: NpcDef = {
  id: 'ripper',
  name: 'Ripper',
  unknownName: 'Mann mit Juwelierlupe',
  knownFlag: 'ripper_bekannt',
  portrait: 'ripper',
  sprite: 'ripper-walk',
  faction: 'zerleger',
  bio: 'Schrauber und Hehler mit grünem Kreuz über der Praxis, Kopf der Zerleger. Zahlt den Kindern zehn Credits und hat ein Herz, das er gut versteckt. Meistens.',
  gifts: {
    loves: ['seltenes-implantat', 'schweissbrille-gelb', 'kassenbuch'],
    likes: ['alte-euromuenze', 'glitzerschrott', 'zerberster-oel', 'volt-limo', 'echtobst-apfel', 'hofhonig'],
    dislikes: ['dantes-kekse', 'plueschmoehre'],
    hates: ['virus-implantat', 'beglichener-schuldschein', 'rostige-dose'],
  },
  schedule: [
    ...RIPPER_SCHEDULE_23,
    { slot: 'morgen', place: 'away' },
    { slot: 'tag', days: ['di', 'fr'], place: { map: 'kanal-sammler', at: 'rippers-lager' }, pose: 'zaehlen' },
    { slot: 'tag', place: { map: 'ripper-praxis', at: 'behandlungsstuhl' } },
    { slot: 'abend', place: { map: 'high-voltage', at: 'ecktisch' }, pose: 'sitzen' },
    { slot: 'nacht', days: ['di'], place: { map: 'hafenkante', at: 'container-77' } },
    { slot: 'nacht', place: { map: 'kanal-sammler', at: 'rippers-lager' } },
  ],
  heartEvents: [
    { id: 'he-ripper-2', hearts: 2, map: 'ripper-praxis', time: 'tag', when: PROBEZEIT, dialogue: 'he-ripper-2' },
    { id: 'he-ripper-4', hearts: 4, map: 'ripper-praxis', time: 'tag', when: seen('he-ripper-2'), dialogue: 'he-ripper-4' },
    { id: 'he-ripper-6', hearts: 6, map: 'high-voltage', time: 'abend', when: seen('he-ripper-4'), dialogue: 'he-ripper-6' },
    {
      id: 'he-ripper-8', hearts: 8, map: 'ripper-praxis', time: 'tag',
      when: all(AKT2, seen('he-ripper-6'), { quest: 'pers-freya-fairer-lohn', state: 'done' }), dialogue: 'he-ripper-8',
    },
    { id: 'he-ripper-10', hearts: 10, map: 'ripper-praxis', time: 'tag', when: all(AKT2, seen('he-ripper-8')), dialogue: 'he-ripper-10' },
  ],
  companion: {
    // world.md §4.6: Söldner ab ♥6, 30 Cr pro Tag (Anheuern im Tagesgespräch, Tagessatz über `daily` unten).
    recruit: hearts('ripper', 6),
    stats: {
      hp: 48, armor: 1, morale: 45,
      attributes: { technik: 7, koerper: 4, reflexe: 6, ausstrahlung: 4, strasse: 7 },
      weapon: { kind: 'fernkampf', damage: 5, range: 5, hit: 5 },
      abilities: ['ripper-ausschlachten', 'ripper-rauchbombe'],
    },
    heartAbilities: [{ hearts: 8, ability: 'ripper-kleiner-deal' }],
    abilityRules: RIPPER_ABILITY_RULES,
  },
  talk: [
    RIPPER_TALK_MASTER,
    talk('ripper-tag-rivale', { rival: 'ripper' }),
    talk('ripper-tag-vexaria', all(VEXARIA, noFlag('ripper_kommentar_vexaria'))),
    talk('ripper-tag-nacht', all(IRGENDEINE_NACHT, noFlag('ripper_kommentar_nacht'), { time: ['morgen', 'tag'] })),
    talk('ripper-tag-zeit', AKT1, 8),
    ...RIPPER_TALK_23,
    talk('ripper-tag-fremd', all(not(PROBEZEIT), NOT_VEX)),
    talk('ripper-tag-container', all({ weekday: 'di' }, { time: 'nacht' })),
    talk('ripper-tag-kanal', any({ time: 'nacht' }, all({ weekday: ['di', 'fr'] }, { time: 'tag' }))),
    talk('ripper-tag-vertraut', undefined, 5),
    talk('ripper-tag-praxis', { time: 'tag' }),
    talk('ripper-tag-ecktisch', { time: 'abend' }),
    talk('ripper-tag-standard'),
  ],
};

/**
 * Söldner-Tagessatz (world.md §4.6: 30 Cr pro Tag, im Master-Modus 60): zum Tageswechsel, solange Ripper in der Party
 * ist. Reicht das Geld nicht, verlässt er die Party (bleibt in der Crew). Reihenfolge: zahlen vor pleite.
 */
const IN_PARTY: Condition = { companion: 'ripper' };
const TAGESSATZ = {
  'ripper-tagessatz': {
    id: 'ripper-tagessatz', when: all(IN_PARTY, not(MASTER), { credits: 30 }),
    effects: [{ credits: -30 }, set('heute_ripper_bezahlt'), { message: 'Ripper bucht seinen Tagessatz ab: 30 Credits. „Freundschaftspreis. Jeden Morgen neu.“' }],
  },
  'ripper-tagessatz-master': {
    id: 'ripper-tagessatz-master', when: all(IN_PARTY, MASTER, { credits: 60 }),
    effects: [{ credits: -60 }, set('heute_ripper_bezahlt'), { message: 'Ripper bucht 60 Credits ab. „Für den Master. Doppelt. Aus Respekt. Und aus Angst.“' }],
  },
  'ripper-tagessatz-pleite': {
    id: 'ripper-tagessatz-pleite', when: all(IN_PARTY, noFlag('heute_ripper_bezahlt')),
    effects: [{ dismiss: 'ripper' }, { message: 'Ripper schaut in deine Kasse, dann in dein Gesicht. „Kein Tagessatz, kein Ripper. Ruf mich, wenn du wieder flüssig bist, du Pleitegeier.“' }],
  },
} satisfies NonNullable<ContentPart['daily']>;

export const part: ContentPart = {
  npcs: { ripper },
  daily: TAGESSATZ,
  dialogues: byId([
    T.rivale, T.vexaria, T.nacht, T.zeit, T.fremd, T.container, T.kanal, T.praxis, T.ecktisch, T.vertraut, T.standard,
    he2, he4, he6, ...ripper23(M),
  ]),
  abilities: Object.fromEntries(RIPPER_ABILITIES.map((a) => [a.id, a])),
};
