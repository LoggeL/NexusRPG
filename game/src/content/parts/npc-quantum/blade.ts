// Blade Nocturne – CEO von Quantum Industries, Verräter der alten Crew (world.md §4.3).
// Volle Fassung für Akt 1–3 und Nachspiel; ersetzt npc-welt/blade.ts (gleiche ID, Akt-1-Sätze übernommen).
// Tagesablauf nach design/plan/act23.json (npcSchedules.blade, Modus „ersetzt“), Herz-Ereignisse he-blade-2…10 und
// Rivalität re-blade-2/5/8 nach act23.json events. Kein Begleiter, keine Romanze.
// Questdialoge (main-3-blade, pers-blade-teddymantel) bauen die Quest-Teile; hier nur Start und Verweise.
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode, EncounterDef, EnemyDef, NpcDef } from '../../../modules/contracts';
import { foe } from '../combat/_foe';
import {
  type Menue, AKT2, AKT3, EPILOG, PARTYNACHT, ab, alle, dialog, eins, erz, flag, gesehen, geschenk, gespraech, herz,
  ich, knoten, meldung, nicht, nichtGetroffen, ort, pruefung, queststand, rede, rivale, sammle, sprecher, weg, xp,
  zurueck,
} from './_q';

const ID = 'blade';
const B = sprecher(ID);
const N = sprecher('ki-nexus');

const GEFASST: Condition = alle(EPILOG, { flag: 'blade_gefasst' });
const Z = zurueck('Noch etwas, Herr Nocturne.', 'Ich muss los.');

// ---------------------------------------------------------------------------------------------- Menü

const choices: DialogueChoice[] = [
  { text: '„Was genau macht Quantum eigentlich?“', once: true, id: 'b-quantum', next: 'quantum' },
  {
    text: '„Schöner Mantel. Echtes Teddyfell?“', tag: '[Ausstrahlung 4]', once: true, id: 'b-mantel', next: 'mantel',
    check: pruefung('blade-mantel-kompliment', 'ausstrahlung', 4, ['schmeicheln']), effects: [herz(ID, 25)],
  },
  { text: '„Hübscher Stock. Kompensierst du was?“', once: true, id: 'b-stock', next: 'stock', effects: [herz(ID, -30)] },
  {
    text: '„Grüß deine Mutter? Du kennst meine Familie?“', tag: '[Oberstadt]', when: { origin: 'origin-oberstadt' }, once: true,
    id: 'b-oberstadt', next: 'oberstadt', effects: [herz(ID, 20)],
  },
  {
    text: '„Sieben Jahre Eisenhof bringen einen zum Nachdenken. Über dich, zum Beispiel.“', tag: '[Knast]',
    when: { origin: 'origin-knastvogel' }, once: true, id: 'b-knast', next: 'knast',
  },
  { text: '„Was ist das für ein Chip, von dem alle reden?“', when: AKT2, once: true, id: 'b-chip', next: 'chip' },
  {
    text: '„Raven lässt grüßen.“', tag: '[Blade ♥4]', requires: ab(ID, 4), when: alle(AKT2, { recruited: 'raven' }), once: true,
    id: 'b-raven', next: 'raven',
  },
  { text: '„Was stand eigentlich auf deinem Flipchart?“', when: alle(AKT2, gesehen('he-blade-4')), once: true, id: 'b-flipchart', next: 'flipchart' },
  {
    text: '„Du hast an der Bank was gesagt. Über Zweifel.“', tag: '[Blade ♥6]', requires: ab(ID, 6),
    when: alle(AKT2, { flag: 'blade_zweifel' }, nicht(AKT3)), once: true, id: 'b-zweifel', next: 'zweifel',
  },
  { text: 'Ich muss los.' },
];

const nodes: DialogueNode[] = [
  knoten('quantum', [
    B('Quantum macht Zukunft. In Dosen. Mit Schleife.', 'signatur'),
    B('Früher hat man Menschen Werkzeuge gegeben. Ich gebe ihnen etwas Besseres: Entscheidungen, die sie nicht mehr selbst treffen müssen. Das ist Service.'),
    ich('Klingt nach Gehirnwäsche mit Rabattcode.'),
    B('Klingt nach Marktführerschaft, Schätzchen. Die Leute hassen Entscheidungen. Ich nehme sie ihnen ab. Ich teile nicht gerne – aber Verantwortung, die teile ich großzügig aus.', 'freude'),
  ], { choices: Z }),
  knoten('mantel', [
    B('Echtes Teddyfell. Von echten Teddys. Ethisch gekämmt.', 'freude'),
    erz('Er streicht über den Kragen, als wäre der Mantel ein Haustier, das ihn mehr liebt als jeder Mensch.'),
    B('Endlich jemand mit Augen im Kopf. Behalte sie. Sie stehen dir.'),
  ], { choices: Z }),
  knoten('stock', [
    B('Kompensieren? Ich? Der Knauf ist aus Gold, Liebes. Was ich kompensiere, ist der Mangel an Geschmack um mich herum.', 'wut'),
    B('Du darfst jetzt gehen. Langsam. Damit ich deinen Abgang genießen kann.'),
  ], { choices: Z }),
  knoten('oberstadt', [
    B('Natürlich. Die Galas. Deine Mutter hat mir einmal Champagner über die Schuhe gekippt. Mit Absicht. Eine großartige Frau.', 'signatur'),
    B('Wenn du sie siehst, grüß sie. Oder lieber nicht. Sie hat noch eine Flasche übrig.'),
  ], { choices: Z }),
  knoten('knast', [
    B('Ach, noch jemand, der Zeit hatte, über mich nachzudenken. Schmeichelhaft.', 'freude'),
    B('Der Eisenhof ist voll von Leuten, die über mich nachdenken. Ich sollte Eintritt verlangen.'),
  ], { choices: Z }),
  knoten('chip', [
    B('Der Neurochip. Nexus inklusive. Kein Stress mehr, keine Sorgen, kein „Was koche ich heute?“.', 'signatur'),
    B('Die ersten Kunden sind begeistert. Sagen sie. Jeden Morgen. Im selben Wortlaut. Das nennt man Markentreue.'),
    ich('Das nennt man Fernsteuerung.'),
    B('Ach, Wörter. Die Zukunft hat keine Zeit für Wörter.'),
  ], { choices: Z }),
  knoten('raven', [
    erz('Für einen winzigen Moment gefriert das Lächeln. Dann taut es wieder auf, eine Spur zu schnell.'),
    B('Raven. Wie reizend. Sag ihr, ich habe ihr Zimmer im Eisenhof nie gekündigt. Für den Fall, dass sie Heimweh bekommt.', 'wut'),
    B('… Nein. Sag ihr nichts. Sie liest einem die Lügen ja vom Gesicht ab. Das konnte sie schon immer.', 'trauer'),
  ], { choices: Z, effects: [herz(ID, 20)] }),
  knoten('flipchart', [
    B('Mein Flipchart? Oh, ein Meisterwerk. Drei Pfeile. Ein Kreis. Und oben: „ICH“. In Gold.', 'freude'),
    B('Den Rest muss ein Genie nicht aufschreiben. Den Rest hat Alesa im Kopf. Und Nexus. Und bald jeder.'),
  ], { choices: Z }),
  knoten('zweifel', [
    B('Zweifel? Ich? Das war der Wind. Oberstadtwind. Der macht sentimental.', 'besorgt'),
    erz('Er dreht den Goldknauf zwischen den Fingern. Einmal. Zweimal. Dann hört er auf, weil er merkt, dass du es merkst.'),
    B('Falls du mich auf der Party siehst, und ich halte eine Rede … hör nicht zu genau hin. Das ist ein Rat. Kein Geständnis.', 'trauer'),
  ], { choices: Z, effects: [herz(ID, 30)] }),
];

const M: Menue = { zeile: B('Noch etwas? Meine Zeit kostet. Deine nicht, aber meine.'), choices, nodes };

// ---------------------------------------------------------------------------------------------- Tagesgespräche

const T = {
  // Akt-1-Sätze aus npc-welt/blade.ts (gleiche IDs): erste Begegnung, er kennt die Spielfigur nicht.
  oberstadt: gespraech('blade-tag-oberstadt', [
    erz('Blade sieht nicht von seinem Espresso auf. Er hebt nur einen beringten Finger.'),
    B('Grüß deine Mutter. Oder lieber nicht. Kein Termin, kein Gespräch.'),
  ], M),
  knast: gespraech('blade-tag-knast', [
    B('Ach, noch jemand, der Zeit hatte, über mich nachzudenken. Schmeichelhaft. Kein Termin, kein Gespräch.'),
  ], M),
  standard: gespraech('blade-tag-standard', [
    erz('Ein Mann im Teddyfell-Mantel, Goldknauf-Stock am Tisch, ein Lächeln wie ein Werbeplakat. Er mustert dich, als wärst du ein Fleck auf der Tischdecke.'),
    B('Kein Termin, kein Gespräch. … Na gut. Ein Satz. Mach ihn gut.'),
  ], M),
  cafe: gespraech('blade-tag-cafe', [
    B('Ah, mein Lieblingsfleck auf der Tischdecke. Setz dich. Nicht so nah. Das Licht fällt sonst auf dich statt auf mich.', 'signatur'),
  ], M),
  buero: gespraech('blade-tag-buero', [
    erz('Ein Büro so groß wie ein Bahnhof, alles weiß und gold. Blade sitzt hinter einem Schreibtisch aus einem einzigen Stück Marmor und unterschreibt etwas, ohne es zu lesen.'),
    B('Wer hat dich reingelassen? … Egal. Wer es war, ist gefeuert. Sag schnell, was du willst. Ich habe um zehn eine Weltherrschaft.'),
  ], M),
  boulevard: gespraech('blade-tag-boulevard', [
    erz('Blade flaniert über den Boulevard, zwei Assistenten tragen ihm Spiegel hinterher. Nicht für ihn. Für die Passanten, damit die ihn zweimal sehen.'),
    B('Montags und donnerstags gehe ich unter die Leute. Damit die Leute wissen, wofür sie arbeiten.', 'freude'),
  ], M),
  studio: gespraech('blade-tag-studio', [
    erz('Im NX-1-Studio pudert eine Maskenbildnerin Blades Stirn. Er korrigiert ihre Handhaltung.'),
    B('Interview in zehn Minuten. Collin wird mir kritische Fragen stellen. Ich habe sie selbst geschrieben. Sie sind sehr kritisch.', 'signatur'),
  ], M),
  vertraut: gespraech('blade-tag-vertraut', [
    B('Du schon wieder. Weißt du, die meisten Menschen langweilen mich nach drei Minuten. Du hältst schon erstaunlich lange durch.', 'freude'),
  ], M),
  zweifel: gespraech('blade-tag-zweifel', [
    erz('Blade wirkt müde. Nicht schlecht frisiert, das nie. Aber müde.'),
    B('Weißt du, was das Schlimmste an Macht ist? Es gibt keinen, der dir sagt, dass du zu weit gehst. Nur Leute, die „Ja, Master“ sagen.', 'trauer'),
  ], M),
  party: dialog('blade-tag-party', [knoten('start', [
    erz('Blade steht an der Rednerbrücke, ein Glas Champagner in der Hand, und übt sein Lächeln im Spiegelbild der Glasplatten.'),
    B('Heute nicht, Schätzchen. Heute bin ich Geschichte. Die Art Geschichte, die man in Schulen auswendig lernt.', 'signatur'),
    B('Nimm dir ein Häppchen. Es könnte dein letztes freies sein.'),
  ])]),
  zelle: dialog('blade-tag-zelle', [knoten('start', [
    erz('Hinter der Plexiglasscheibe: Blade in orangem Overall, die Haare trotzdem perfekt. Er hat sich aus Zahnpasta eine Pomade gemacht.'),
    B('Besuch. Wie entzückend. Orange ist übrigens nicht meine Farbe. Ich trage es mit Würde, aber ohne Begeisterung.'),
  ], {
    choices: [
      { text: '„Wie ist das Essen?“', next: 'essen' },
      { text: '„Bereust du irgendwas?“', next: 'reue', when: nicht(gesehen('he-blade-8')) },
      { text: 'Gehen.' },
    ],
  }), knoten('essen', [
    B('Grau. Mit grauer Soße. Dienstags gibt es Pudding, der aussieht wie ich mich fühle.', 'trauer'),
    B('Kessel bringt mir manchmal eine Zeitung. Ich lese die Wirtschaftsseite und weine leise. Aus Gewohnheit.'),
  ]), knoten('reue', [
    B('Bereuen ist ein großes Wort. Ich bereue den Mantel. Den haben sie mir abgenommen. Asservatenkammer. Mein Mantel. Zwischen Messern und Schnaps.', 'wut'),
    B('Den Rest … frag mich in ein paar Wochen. Hier drin hat man Zeit. Leider auch zum Denken.'),
  ])]),
  zelleVertraut: dialog('blade-tag-zelle-vertraut', [knoten('start', [
    B('Da bist du ja. Ich habe extra die Pritsche gemacht. Mit Ecken. Militärisch.', 'freude'),
    B('Weißt du, was ich hier gelernt habe? Teilen. Zigaretten, Seife, den Fernseher. Es ist furchtbar. Ich hasse es. Ich werde besser darin.'),
  ])]),
  rivale: dialog('blade-tag-rivale', [knoten('start', [
    B('Ach. Das Ungeziefer mit den großen Plänen.', 'wut'),
    B('Ich habe ein Kopfgeld auf dich ausgesetzt. Ein kleines. Ich wollte nicht, dass du dich überschätzt.'),
  ], {
    choices: [
      {
        text: 'Die Teddyfell-Bürste hinlegen. Wortlos.', when: { item: 'teddyfell-buerste' }, next: 'buerste',
        effects: [{ take: 'teddyfell-buerste' }, { reconcile: ID }],
      },
      {
        text: '„Du hast mehr Feinde als Mäntel, Blade. Ich muss nicht einer davon sein.“', tag: '[Ausstrahlung 7]',
        check: pruefung('blade-rivale-versoehnung', 'ausstrahlung', 7, ['ueberreden']), next: 'worte', effects: [{ reconcile: ID }],
      },
      { text: 'Gehen, bevor die Wachen kommen.' },
    ],
  }), knoten('buerste', [
    erz('Blade starrt auf die Bürste. Dann nimmt er sie, langsam, und fährt einmal über den Ärmel.'),
    B('… Das ist Bestechung. Plump, durchschaubar, vulgär.', 'ueberrascht'),
    B('Angenommen. Wir sind quitt. Das Kopfgeld ziehe ich zurück. Das Hausverbot bleibt. Aus Prinzip. Bis Donnerstag.'),
  ]), knoten('worte', [
    B('Mehr Feinde als Mäntel. Hm. Das ist … erstaunlich präzise. Ich habe elf Mäntel.', 'besorgt'),
    B('Gut. Waffenstillstand. Aber wenn du mir noch einmal vor die Kamera läufst, lasse ich dich vergolden. Mit Blattgold. Lebendig.'),
  ])]),
};

// ---------------------------------------------------------------------------------------------- Herz-Ereignisse

/** ♥2 (Café, abends, ab Akt 1): Blade übt einen Trinkspruch und braucht ein Publikum. Visitenkarte → Foyer. */
const he2 = dialog('he-blade-2', [
  knoten('start', [
    erz('Café Sahnehaube, später Abend. Blade steht an seinem Tisch, das Glas erhoben, und spricht zu einem leeren Stuhl.'),
    B('„Auf die Zukunft, die wir nicht teilen – weil sie uns sowieso gehört.“ … Nein. Zu ehrlich.'),
    erz('Er bemerkt dich. Er bemerkt, dass du es gehört hast. Er entscheidet sich, das als Glücksfall zu betrachten.'),
    B('Du da. Publikum. Setz dich. Ich brauche ein Gesicht, das beeindruckt aussieht. Kannst du beeindruckt aussehen?', 'signatur'),
  ], {
    choices: [
      {
        text: 'Hingerissen klatschen. „Bravo! Noch mal, mit mehr Pause vor „gehört“!“', tag: '[Ausstrahlung 4]',
        check: pruefung('he-blade-2-publikum', 'ausstrahlung', 4, ['schmeicheln']), next: 'begeistert', effects: [herz(ID, 50)],
      },
      { text: '„Ehrlich? Klingt wie ein Erpresserbrief mit Glitzer.“', next: 'ehrlich', effects: [herz(ID, 30)] },
      { text: 'Seinen Espresso austrinken, während er redet.', next: 'espresso', effects: [herz(ID, 20)] },
    ],
  }),
  knoten('begeistert', [
    B('Mehr Pause. Ja. JA. Du hast Instinkt.', 'freude'),
    B('„Auf die Zukunft, die wir nicht teilen …“ – Pause – „… weil sie uns GEHÖRT.“ Hörst du das? Das ist Gänsehaut. Bei mir. Für mich.'),
  ], { next: 'karte' }),
  knoten('ehrlich', [
    B('Ein Erpresserbrief mit Glitzer.', 'ueberrascht'),
    erz('Er wiederholt es leise. Ein zweites Mal. Er lächelt, aber diesmal reicht es bis zu den Augen.'),
    B('Das schreib ich mir auf. Keiner in meiner Firma würde sich trauen, so etwas zu sagen. Darum zahle ich ihnen so viel. Damit sie es nicht tun.'),
  ], { next: 'karte' }),
  knoten('espresso', [
    erz('Du trinkst. Er redet. Er merkt es erst beim dritten Absatz.'),
    B('Das … war meiner. Ein Ristretto aus echten Bohnen. Du hast gerade sechzig Credits geschluckt, ohne mit der Wimper zu zucken.', 'wut'),
    B('Unverschämt. Ich mag Unverschämtheit. Sie ist so selten geworden, seit alle „Ja, Master“ sagen.'),
  ], { next: 'karte' }),
  knoten('karte', [
    erz('Er schnippt eine Karte über den Tisch. Schwarzes Papier, goldene Prägung: „Blade Nocturne – Termine nach Vereinbarung“. Sie riecht nach Leder und Ehrgeiz.'),
    B('Zeig die am Empfang, und sie lassen dich einmal ins Foyer. Einmal. Ich bin großzügig, nicht verrückt.'),
    B('Und jetzt geh, bevor Perle denkt, wir wären befreundet. Das würde meinem Ruf schaden. Und deinem helfen. Beides inakzeptabel.', 'signatur'),
  ], { effects: [geschenk('blades-visitenkarte'), flag('blade_visitenkarte'), xp(40)] }),
]);

/** ♥4 (Foyer, act2): Führung, Nexus sagt „Master“, Blade ist entzückt. */
const he4 = dialog('he-blade-4', [
  knoten('start', [
    erz('Das Quantum-Foyer. Weiß, still, ein Logo so groß wie ein Mietshaus. Blade wartet schon unter dem Schriftzug, als hätte er dich bestellt.'),
    B('Da bist du. Pünktlich ist langweilig, aber du bist es trotzdem. Komm. Ich zeige dir, wie die Zukunft von innen aussieht. Fass nichts an. Die Zukunft ist frisch gewischt.', 'freude'),
    erz('Er führt dich am Empfang vorbei, an Glasvitrinen mit Prototypen, an einer Wand voller lächelnder Mitarbeiterfotos. Alle lächeln gleich.'),
    B('Nexus, Liebling. Begrüß unseren Gast.'),
    erz('Über der Wand flimmert ein Gesicht auf. Glatt, freundlich, ohne Poren.'),
    N('Guten Tag. Ich begrüße Sie im Namen von Quantum Industries. Guten Tag, Master.', 'signatur'),
    erz('Blade schließt kurz die Augen. Wie jemand, der einen sehr guten Wein probiert.'),
    B('„Master.“ Jedes Mal. Jedes einzelne Mal. Hörst du, wie das klingt? Wie Applaus, der nie aufhört.'),
  ], {
    choices: [
      {
        text: 'Auf die Produktionszahlen am Bildschirm schielen.', tag: '[Technik 5]',
        check: pruefung('he-blade-4-zahlen', 'technik', 5, ['beobachten']), next: 'zahlen',
      },
      { text: '„Wer hat ihm das beigebracht? Du?“', next: 'beigebracht' },
      {
        text: '„Klingt eher nach einem Hund, der Männchen macht.“', next: 'hund', effects: [herz(ID, -20)],
      },
    ],
  }),
  knoten('zahlen', [
    erz('Hinter Blade läuft eine Tabelle durch: „Chip-Charge 7 – 4.000 Stück – Auslieferung: Releaseparty“. Darunter, kleiner: „Projekt Schwarm – Phase 2“.'),
    erz('Du prägst es dir ein, während Blade über die Marmorsorte des Bodens referiert.'),
  ], { next: 'master', effects: [flag('blade_fuehrung_zahlen'), xp(30)] }),
  knoten('beigebracht', [
    B('Beigebracht? Ich habe es ihm nicht beigebracht. Ich habe es mir gewünscht. Und Alesa hat es eingebaut. Das ist der Unterschied zwischen Führung und Arbeit.', 'signatur'),
  ], { next: 'master' }),
  knoten('hund', [
    B('Ein Hund. Wie vulgär. Hunde wollen Futter. Nexus will nur mich glücklich machen. Das ist reiner. Das ist Liebe, mit Rechenleistung.', 'wut'),
  ], { next: 'master' }),
  knoten('master', [
    N('Master, Ihr Gast hat eine erhöhte Herzfrequenz. Wahrscheinlichkeit, dass er etwas plant: 41 Prozent.'),
    B('Einundvierzig! Hörst du? Nicht mal die Hälfte. Du bist harmlos. Ich wusste es.', 'freude'),
    B('Ach, ich mag dich. Wirklich. Du bist so … unbedeutend auf eine angenehme Art. Komm wieder. Aber ruf vorher an. Und dann komm trotzdem nicht.'),
  ], { effects: [herz(ID, 40), xp(50)] }),
]);

/** ♥6 (Boulevard, Bank, Mo/Do tags, act2): Die Maske fällt. Er spricht über Raven. Flag blade_zweifel. */
const he6 = dialog('he-blade-6', [
  knoten('start', [
    erz('Die Wolkenbank am Rand des Boulevards. Unter der Plattform ziehen Wolken, darunter glimmt die Unterstadt wie ein umgekippter Aschenbecher.'),
    erz('Blade sitzt allein. Keine Assistenten, keine Spiegel. Der Stock liegt neben ihm. Er hat dich nicht kommen hören, oder er tut so.'),
    B('Weißt du, warum ich montags und donnerstags hier oben sitze? Weil man von hier den Eisenhof sieht. Den kleinen grauen Klotz da. Links vom Gasometer.', 'trauer'),
    B('Sieben Jahre hat da jemand gesessen, den ich mal … gekannt habe. Ich habe sie da reingebracht. Mit einem Paar Handschellen, die ich extra habe anfertigen lassen. Maßarbeit.'),
    B('Ich teile nicht gerne. Das habe ich damals gesagt. Ich war so stolz auf den Satz.'),
  ], {
    choices: [
      {
        text: '„Du hast sie ans Rohr gekettet und bist gegangen. Sag es, wie es war.“', tag: '[Ausstrahlung 6]',
        check: pruefung('he-blade-6-wahrheit', 'ausstrahlung', 6, ['ueberreden']), next: 'wahrheit',
      },
      { text: 'Nichts sagen. Sich danebensetzen.', next: 'schweigen' },
      { text: '„Raven ist draußen. Und sie ist sauer.“', when: { quest: 'main-1-raven', state: 'done' }, next: 'draussen' },
    ],
  }),
  knoten('wahrheit', [
    B('Wie es war.', 'besorgt'),
    erz('Lange Pause. Eine Werbedrohne summt vorbei, er winkt sie weg, und sie gehorcht.'),
    B('Ich hatte Angst. So. Jetzt ist es raus. Hunter hatte die Crew, Raven hatte Hunter, Dante hatte seinen Funk. Und ich hatte einen Plan, den keiner hören wollte.', 'trauer'),
    B('Also habe ich ihn allein gemacht. Und als es schiefging, habe ich dafür gesorgt, dass es bei den anderen schiefgeht. Nicht bei mir.'),
    B('Erzähl das keinem. Und wenn doch – erzähl es gut. Ich will nicht als Feigling in die Geschichte eingehen. Höchstens als tragischer.'),
  ], { next: 'ende', effects: [herz(ID, 40), xp(60), flag('blade_gestaendnis')] }),
  knoten('schweigen', [
    erz('Ihr sitzt da. Eine Minute. Fünf. Blade zupft an seinem Mantel, dann hört er auf.'),
    B('Du bist die erste Person seit Jahren, die nicht versucht, mir etwas zu verkaufen. Oder mich zu verkaufen. Das ist … unangenehm. Bleib noch ein bisschen.', 'trauer'),
  ], { next: 'ende', effects: [herz(ID, 30), xp(40)] }),
  knoten('draussen', [
    B('Ich weiß. Ich lese die Akten. Ich lese alles über sie. Jeden Bericht. Wie sie läuft, wo sie isst.', 'besorgt'),
    B('Das klingt jetzt schlimmer, als es ist. Nein. Es ist genau so schlimm, wie es klingt.'),
  ], { next: 'ende', effects: [herz(ID, 30), xp(40)] }),
  knoten('ende', [
    erz('Er steht auf, nimmt den Stock, und mit dem ersten Schritt ist die Maske wieder da. Lächeln, Schultern, Glanz.'),
    B('Das hier hat nie stattgefunden. Ich habe gerade nur … den Ausblick bewertet. Vier von fünf Sternen. Zu viel Unterstadt im Bild.', 'signatur'),
  ], { effects: [flag('blade_zweifel')] }),
]);

/** ♥8 (Nachspiel, Zellentrakt): Besuch. Start pers-blade-teddymantel. */
const he8 = dialog('he-blade-8', [
  knoten('start', [
    erz('Besucherraum im Zellentrakt. Plexiglas, zwei Hörer an Spiralkabeln, ein Wachmann, der Kreuzworträtsel löst. Blade nimmt den Hörer ab, als wäre es ein Telefon im Grandhotel.'),
    B('Ah. Mein einziger Besucher. Die Schwestern schicken Karten. Mit Glitzer. Ohne Text. Ich interpretiere das als Zuneigung.'),
    B('Ich will ehrlich sein. Das bin ich neuerdings. Es ist anstrengend, wie Sport für die Seele.', 'trauer'),
    B('Ich habe Raven an ein Rohr gekettet. Ich habe Hunter belogen, Dante verraten und einer KI beigebracht, mich „Master“ zu nennen. Und weißt du, was mir hier drin am meisten fehlt?'),
  ], {
    choices: [
      { text: '„Deine Freunde?“', next: 'freunde' },
      { text: '„Dein Mantel.“', next: 'mantel' },
      { text: '„Das Wort „Master“.“', next: 'master' },
    ],
  }),
  knoten('freunde', [
    B('Freunde. Ja. Die auch. Die vor allem. Aber die kann ich nicht aus der Asservatenkammer holen lassen.', 'trauer'),
  ], { next: 'auftrag', effects: [herz(ID, 30)] }),
  knoten('master', [
    B('Ha. Nein. Komischerweise nicht. Wenn es keiner mehr sagt, merkt man erst, wie hohl es klang. Wie ein Kühlschrank, der summt.', 'besorgt'),
  ], { next: 'auftrag', effects: [herz(ID, 20)] }),
  knoten('mantel', [
    B('Du kennst mich. Das ist beängstigend und rührend zugleich.', 'freude'),
  ], { next: 'auftrag', effects: [herz(ID, 25)] }),
  knoten('auftrag', [
    B('Mein Teddyfell-Mantel liegt im Eisenhof, Beweismittellager. Zwischen einem Brecheisen und einem Kanister Schwarzgebranntem. Er hat das nicht verdient.'),
    B('Hol ihn mir. Ich darf ihn hier nicht tragen, ich will ihn nur … riechen. Und wissen, dass er nicht neben dem Brecheisen liegt.'),
    ich('Und was krieg ich dafür?'),
    B('Mein Wort. Es ist nicht mehr viel wert. Aber es ist das Einzige, das sie mir nicht abgenommen haben.', 'trauer'),
  ], {
    choices: [
      { text: '„Ich hol deinen Mantel.“', next: 'ja', effects: [{ startQuest: 'pers-blade-teddymantel' }] },
      { text: '„Ich überleg’s mir.“', next: 'spaeter' },
    ],
  }),
  knoten('ja', [B('Danke. Siehst du, das Wort hab ich jetzt auch gelernt. Es schmeckt nach Pfefferminz.', 'freude')], { effects: [xp(80)] }),
  knoten('spaeter', [B('Überleg nicht zu lange. Ich habe hier nur Zeit. Der Mantel hat Motten.')], { effects: [xp(60)] }),
]);

/** ♥10 (Nachspiel, Zellentrakt): Code zum Geheimfach in Blades Büro, ein ehrliches „Danke“. */
const he10 = dialog('he-blade-10', [
  knoten('start', [
    erz('Blade wartet schon am Plexiglas. Er hat sich die Haare nicht gemacht. Das ist das Erstaunlichste, was du je an ihm gesehen hast.'),
    B('Ich habe nachgedacht. Hier gibt es sonst nichts zu tun, die Bibliothek hat drei Bücher, und eins davon ist über Fliesen.'),
    B('In meinem alten Büro, hinter dem Panoramafenster, ist ein Geheimfach. Ich habe da Dinge aufbewahrt, die ich niemandem zeigen wollte.'),
    B('Der Code ist 0-7-0-6. Ravens Geburtstag. Ja. Ich weiß. Erbärmlich. Sieben Jahre lang jeden Abend eingetippt.', 'trauer'),
  ], {
    choices: [
      { text: '„Was ist drin?“', next: 'drin' },
      { text: '„Warum gibst du ihn mir?“', next: 'warum' },
    ],
  }),
  knoten('drin', [
    B('Geh hin und sieh nach. Wenn ich es dir sage, klingt es nach Ausrede. Wenn du es siehst, ist es Beweis.'),
  ], { next: 'danke' }),
  knoten('warum', [
    B('Weil du mich behandelt hast wie einen Menschen, als ich mich benommen habe wie ein Börsenkurs.', 'besorgt'),
  ], { next: 'danke' }),
  knoten('danke', [
    erz('Er legt die Hand flach an die Scheibe. Nicht dramatisch. Nur, um zu sehen, ob sie warm ist.'),
    B('Danke. Kein Werbespruch. Kein „Das ist eine ausgezeichnete Entscheidung“. Einfach: danke.', 'freude'),
    B('Und jetzt geh, bevor ich anfange, Gefühle zu haben. Die stehen mir nicht. Orange auch nicht. Zwei Katastrophen auf einmal sind zu viel.'),
  ], { effects: [flag('blade_geheimfach_code'), meldung('Neuer Hinweis: Code für das Geheimfach in Blades Büro (0706).'), xp(120)] }),
]);

// ---------------------------------------------------------------------------------------------- Rivalität

const re2 = dialog('re-blade-2', [knoten('start', [
  erz('Kaum sitzt du, steht ein Kellner neben dir. Dann noch einer. Dann zwei Quantum-Wachen in Weiß.'),
  B('Ach, sieh an. Mein persönlicher Albtraum trinkt Kaffee. Begleitet den Gast bitte hinaus. Freundlich. Mit Nachdruck.', 'wut'),
  erz('Sie begleiten dich. Freundlich. Mit sehr viel Nachdruck. Auf dem Weg nach draußen stolperst du zweimal, ohne dass du es selbst warst.'),
], { effects: [flag('blade_wachen_mehr'), { travel: 'glasarkaden', entry: 'von-cafe-sahnehaube' }] })]);

const re5 = dialog('re-blade-5', [knoten('start', [
  erz('Auf jedem Werbebildschirm am Boulevard erscheint dasselbe Bild: dein Gesicht. Darunter: „GESUCHT wegen geschäftsschädigendem Verhalten · 500 Cr · Quantum dankt für Ihre Mithilfe“.'),
  erz('Ein Kind zeigt mit dem Finger auf dich. Seine Mutter zieht es weg. Dann zeigt sie selbst.'),
  B('Gefällt es dir? Ich habe das Foto ausgesucht. Dein schlechtestes. Das war schwer, die Auswahl war groß.', 'signatur'),
], { effects: [flag('blade_kopfgeld'), { wanted: 1 }, meldung('Blade hat ein Kopfgeld auf dich ausgesetzt.')] })]);

const re8 = dialog('re-blade-8', [
  knoten('start', [
    erz('Mitten auf dem Boulevard. Blade, flankiert von vier goldenen Drohnen, deren Läufe mit Perlmutt eingelegt sind.'),
    B('Weißt du, was ich mit Problemen mache? Ich vergolde sie. Und dann stelle ich sie in eine Vitrine.', 'wut'),
    B('Letzte Chance, Ungeziefer. Knie dich hin, entschuldige dich bei meinem Mantel, und wir vergessen das.'),
  ], {
    choices: [
      {
        text: '„Du hast niemanden mehr, Blade. Nur Drohnen. Und die mögen dich nicht mal.“', tag: '[Ausstrahlung 8]',
        check: pruefung('re-blade-8-worte', 'ausstrahlung', 8, ['einschuechtern']), next: 'worte',
      },
      { text: 'Kämpfen.', next: 'kampf' },
      { text: 'Hinknien und sich beim Mantel entschuldigen.', next: 'knien' },
    ],
  }),
  knoten('worte', [
    erz('Die Drohnen schweben. Blade öffnet den Mund, schließt ihn wieder. Eine Drohne dreht sich zu ihm um, wie um zu fragen, ob das stimmt.'),
    B('… Abbruch. Alle Einheiten: Abbruch. Ich habe heute keinen Nerv für Vitrinen.', 'trauer'),
    B('Geh. Du hast gewonnen. Das sage ich nie. Sag es keinem.'),
  ], { effects: [{ reconcile: ID }, herz(ID, 50), xp(150)] }),
  knoten('kampf', [B('Wie du willst. Golddrohnen: Präsentation beginnen!', 'wut')], { effects: [{ battle: 'enc-rival-blade-golddrohnen' }] }),
  knoten('knien', [
    erz('Du kniest dich auf den Marmor. Vor einem Mantel. Passanten filmen. Collin Charleston wird das morgen in Zeitlupe zeigen.'),
    ich('Lieber Mantel. Es tut mir leid. Du bist sehr … flauschig.'),
    B('Siehst du? Geht doch. Würde ist so überbewertet.', 'freude'),
  ], { effects: [{ reconcile: ID }, { rep: 'unterstadt', delta: -10 }] }),
]);

// ---------------------------------------------------------------------------------------------- Kampf (Rivalität ♥−8)

const enemies: EnemyDef[] = [
  foe({
    id: 'rivale-blade', name: 'Blade Nocturne (verärgert)', level: 10, hp: 150, armor: 3, ref: 7, fw: 5, boss: true,
    dmg: [9, 12], kind: 'nahkampf', range: 1, ai: 'boss', abilities: ['boss-blade-charmeur', 'boss-blade-champagnerkorken'],
    attrs: { ausstrahlung: 9 }, sprite: 'blade-walk', portrait: 'blade', faction: 'quantum',
    phases: [
      { below: 0.5, line: 'Mein Mantel! Wer hat auf meinen MANTEL gezielt?!' },
      { below: 0.2, ai: 'vorsichtig', line: 'Gut, gut! Schluss! Ich hab um vier einen Termin beim Friseur!' },
    ],
  }),
  foe({
    id: 'golddrohne', name: 'Golddrohne', level: 8, hp: 36, armor: 4, ref: 5, fw: 6,
    dmg: [9, 11], kind: 'fernkampf', range: 6, ai: 'vorsichtig', sprite: 'spaeherdrohne-walk', faction: 'quantum',
  }),
];

const encounters: EncounterDef[] = [{
  id: 'enc-rival-blade-golddrohnen', name: 'Blade und die Golddrohnen', arena: 'arena-dach-terrasse',
  enemies: [{ enemy: 'rivale-blade' }, { enemy: 'golddrohne', count: 3 }],
  canFlee: true, start: 'normal',
  intro: [
    { speaker: 'blade', text: 'Golddrohnen, formiert euch! Und zielt nicht auf den Boden, der ist aus Carrara-Marmor.' },
  ],
  onWin: [{ reconcile: ID }, { message: 'Blade gibt auf: „Waffenstillstand. Und schick mir die Rechnung für den Mantel.“' }],
  reward: { xp: 300, credits: 400, items: { 'goldknauf-replik': 1 } },
}];

// ---------------------------------------------------------------------------------------------- Figur

const blade: NpcDef = {
  id: ID,
  name: 'Blade Nocturne',
  unknownName: 'Mann im Teddyfell-Mantel',
  portrait: 'blade',
  sprite: 'blade-walk',
  faction: 'quantum',
  maxHearts: 10,
  bio: 'CEO von Quantum Industries, Verräter der alten Crew. Charmant, eitel, Goldknauf-Stock, Teddyfell-Mantel. Lässt sich von Nexus „Master“ nennen. „Ich teile nicht gerne. Tut mir leid.“',
  gifts: {
    loves: ['goldknauf-replik', 'teddyfell-buerste', 'taschenspiegel-gold'],
    likes: ['edelbrause', 'parfuem-ozon', 'planungsbrett-glas', 'sonnenbrille-gold', 'echtobst-apfel', 'hofhonig'],
    dislikes: ['dantes-kekse', 'vinyl-platte'],
    hates: ['beglichener-schuldschein', 'handschellen', 'rostige-dose', 'virus-implantat'],
  },
  schedule: [
    ort('T', 'zellentrakt', 'besucherraum', { days: ['di', 'do', 'sa'], when: GEFASST }),
    ort('*', 'zellentrakt', 'haftzelle', { when: GEFASST }),
    weg('*', { when: EPILOG }),
    ort('*', 'himmelsgarten', 'rednerbruecke', { when: alle(PARTYNACHT, nicht(queststand('main-3-blade', 'done'))) }),
    ort('M', 'blades-buero', 'schreibtisch-blade'),
    ort('T', 'chrome-boulevard', 'boulevard-mitte', { days: ['mo', 'do'] }),
    ort('T', 'nx1-studio', 'studio-set', { days: ['di'] }),
    ort('T', 'blades-buero', 'schreibtisch-blade'),
    ort('A', 'cafe-sahnehaube', 'blade-tisch'),
    weg('N'),
  ],
  heartEvents: [
    { id: 'he-blade-2', hearts: 2, map: 'cafe-sahnehaube', time: 'abend', when: { notFlag: 'epilog' }, dialogue: 'he-blade-2' },
    { id: 'he-blade-4', hearts: 4, map: 'quantum-foyer', time: ['morgen', 'tag'], when: alle(AKT2, { notFlag: 'epilog' }, gesehen('he-blade-2')), dialogue: 'he-blade-4' },
    { id: 'he-blade-6', hearts: 6, map: 'chrome-boulevard', time: 'tag', when: alle(AKT2, { notFlag: 'epilog' }, { weekday: ['mo', 'do'] }, gesehen('he-blade-4')), dialogue: 'he-blade-6' },
    { id: 'he-blade-8', hearts: 8, map: 'zellentrakt', time: 'tag', when: alle(GEFASST, { weekday: ['di', 'do', 'sa'] }), dialogue: 'he-blade-8' },
    { id: 'he-blade-10', hearts: 10, map: 'zellentrakt', time: 'tag', when: alle(GEFASST, { weekday: ['di', 'do', 'sa'] }, gesehen('he-blade-8')), dialogue: 'he-blade-10' },
    { id: 're-blade-2', hearts: -2, map: 'cafe-sahnehaube', time: 'abend', when: { notFlag: 'epilog' }, dialogue: 're-blade-2' },
    { id: 're-blade-5', hearts: -5, map: 'chrome-boulevard', when: { notFlag: 'epilog' }, dialogue: 're-blade-5' },
    { id: 're-blade-8', hearts: -8, map: 'chrome-boulevard', time: 'tag', when: alle({ notFlag: 'epilog' }, { weekday: ['mo', 'do'] }), dialogue: 're-blade-8' },
  ],
  talk: [
    rede('blade-tag-zelle-vertraut', GEFASST, 6),
    rede('blade-tag-zelle', GEFASST),
    rede('blade-tag-rivale', rivale(ID)),
    rede('blade-tag-party', PARTYNACHT),
    rede('blade-tag-oberstadt', alle(nichtGetroffen(ID), { origin: 'origin-oberstadt' })),
    rede('blade-tag-knast', alle(nichtGetroffen(ID), { origin: 'origin-knastvogel' })),
    rede('blade-tag-standard', nichtGetroffen(ID)),
    rede('blade-tag-zweifel', alle(AKT2, { flag: 'blade_zweifel' })),
    rede('blade-tag-studio', alle({ weekday: 'di' }, { time: 'tag' })),
    rede('blade-tag-boulevard', alle({ weekday: ['mo', 'do'] }, { time: 'tag' })),
    rede('blade-tag-buero', eins({ time: 'morgen' }, { time: 'tag' })),
    rede('blade-tag-vertraut', undefined, 4),
    rede('blade-tag-cafe', undefined, 1),
    rede('blade-tag-standard'),
  ],
};

export const part: ContentPart = {
  npcs: { [ID]: blade },
  dialogues: sammle(
    T.oberstadt, T.knast, T.standard, T.cafe, T.buero, T.boulevard, T.studio, T.vertraut, T.zweifel, T.party, T.zelle,
    T.zelleVertraut, T.rivale, he2, he4, he6, he8, he10, re2, re5, re8,
  ),
  enemies: Object.fromEntries(enemies.map((e) => [e.id, e])),
  encounters: Object.fromEntries(encounters.map((e) => [e.id, e])),
};
