// Seraphina Chrome (Blau) – älteste der Chrome-Schwestern, Investorin und Strategin (world.md §4.3).
// Volle Fassung für Akt 1–3 und Nachspiel; ersetzt npc-welt/seraphina-chrome.ts (gleiche ID, Akt-1-Sätze übernommen).
// Tagesablauf nach design/plan/act23.json (npcSchedules.seraphina-chrome, „ersetzt“), Herz-Ereignisse
// he-seraphina-chrome-2…10, Rivalität re-seraphina-chrome-2/5 (Hausverbot, Bagatellklage). Keine Romanze, kein Begleiter.
// Ab ♥6 „10 % Rabatt in der Oberstadt“ (Flag seraphina_rabatt; wirkt über ShopDef.priceRules in maps-23/shops-chrome-himmel.ts).
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode, NpcDef } from '../../../modules/contracts';
import {
  type Menue, AKT2, EPILOG, PARTYNACHT, ab, alle, dialog, eins, erz, flag, gesehen, geschenk, gespraech, herz,
  knoten, meldung, nicht, nichtGetroffen, ort, pruefung, queststand, rede, rivale, sammle, sprecher, weg, xp, zurueck,
} from './_q';

const ID = 'seraphina-chrome';
const S = sprecher(ID);
const SY = sprecher('sybella-chrome');
const SE = sprecher('serenity-chrome');
const C = sprecher('collin-charleston');

const EINBRUCH: Condition = queststand('side-alte-gewohnheiten', 'active');
const Z = zurueck('Noch ein Wort, Frau Chrome.', 'Ich empfehle mich.');

// ---------------------------------------------------------------------------------------------- Menü

const choices: DialogueChoice[] = [
  { text: '„Was ist Quantum für Sie?“', once: true, id: 's-quantum', next: 'quantum', when: nicht(EPILOG) },
  { text: '„Warum halten Sie Reden vor Tauben?“', once: true, id: 's-tauben', next: 'tauben' },
  { text: '„Wie sind Ihre Schwestern so?“', once: true, id: 's-schwestern', next: 'schwestern' },
  { text: '„Wissen Sie, was der Chip mit den Leuten macht?“', when: alle(AKT2, nicht(EPILOG)), once: true, id: 's-chip', next: 'chip' },
  {
    text: '„Sie sehen aus, als bräuchten Sie einen Plan B.“', tag: '[Seraphina ♥3]', requires: ab(ID, 3),
    when: alle(AKT2, queststand('pers-seraphina-plan-b', 'inactive')), next: 'planb', effects: [{ startQuest: 'pers-seraphina-plan-b' }],
  },
  { text: '„Was macht die Stiftung?“', when: alle(EPILOG, gesehen('he-seraphina-chrome-10')), once: true, id: 's-stiftung', next: 'stiftung' },
  { text: 'Ich empfehle mich.' },
];

const nodes: DialogueNode[] = [
  knoten('quantum', [
    S('Quantum ist ein Anfang. In fünf Jahren wird Quantum die Welt nicht verändern. Quantum wird die Welt sein.', 'signatur'),
    S('Wir verschenken nichts. Aber wir nehmen auch nichts, was uns nicht ohnehin zusteht. Und uns steht vieles zu. Fast alles.'),
  ], { choices: Z }),
  knoten('tauben', [
    S('Tauben unterbrechen nicht. Sie stellen keine kritischen Rückfragen. Sie sind das ideale Aufsichtsgremium.', 'freude'),
    S('Und wenn eine gurrt, weiß ich: Die Pointe sitzt. Mein Vater hielt seine Reden vor Goldfischen. Ich habe mich verbessert.'),
  ], { choices: Z }),
  knoten('schwestern', [
    S('Sybella zählt. Serenity seufzt. Ich denke. Zusammen sind wir eine Familie, getrennt sind wir drei Probleme.', 'signatur'),
    S('Sybella würde für ein Prozent Rabatt ihre Seele verkaufen, aber nur mit Mengenrabatt. Serenity würde ihre Seele verschenken, und zwar an den Falschen.'),
    S('Ich bewahre die Seelen. In einem Tresor. Mit Zinsen.'),
  ], { choices: Z }),
  knoten('chip', [
    S('Ich weiß, was in den Quartalsberichten steht. Zufriedenheit: 97 Prozent. Fluktuation: null. Krankmeldungen: null.', 'besorgt'),
    S('Null. Keine Firma hat null Krankmeldungen. Nicht einmal Gräber haben null Krankmeldungen.'),
    S('Ich habe nachgefragt. Blade hat mir Pralinen geschickt. Es ist nicht das erste Mal, dass er Fragen mit Pralinen beantwortet.'),
  ], { choices: Z }),
  knoten('planb', [
    S('Plan B. Ich habe nie einen Plan B gebraucht. Plan A ist bei uns eine Verpflichtung.', 'wut'),
    S('… Aber die Gala nächste Woche. Der Strom im Penthouse ist instabil, die Band hat abgesagt, das Catering ist verhaftet worden. Fragen Sie nicht.', 'besorgt'),
    S('Ein Generator. Musik. Essen, das nicht nach Quantum schmeckt. Wenn Sie das besorgen, vergesse ich, wo Sie herkommen. Kurz.'),
  ], { choices: Z }),
  knoten('stiftung', [
    S('Sie bezahlt Dächer in der Rohrsiedlung, Lehrer im Fundbüro der Kinder und ein Gewächshaus, das meine Schwester ohne mich nie gebaut hätte.', 'freude'),
    S('Wir verschenken nichts. Wir investieren in Menschen. Die Rendite ist miserabel. Ich habe noch nie so gerne Geld verloren.'),
  ], { choices: Z }),
];

const M: Menue = { zeile: S('Noch etwas? Fassen Sie sich kurz. Kürze ist eine Tugend, die man sich leisten können muss.'), choices, nodes };

// ---------------------------------------------------------------------------------------------- Tagesgespräche

const T = {
  // Akt-1-Sätze aus npc-welt/seraphina-chrome.ts (gleiche IDs).
  oberstadt: gespraech('seraphina-tag-oberstadt', [
    S('Ah, endlich jemand mit Haltung. Man erkennt die gute Schule am Rücken. Wir verschenken nichts. Aber wir erinnern uns an Namen.'),
  ], M),
  gosse: gespraech('seraphina-tag-gosse', [
    S('Wie … authentisch.'),
    erz('Sie wendet sich wieder den Tauben zu. Nach einer langen Pause, ohne dich anzusehen:'),
    S('Nun? Sie stehen noch da. Das ist entweder Mut oder Orientierungslosigkeit. Beides interessiert mich.'),
  ], M),
  nacht: dialog('seraphina-tag-nacht', [knoten('start', [
    erz('Hinter einer Glastür im blauen Schlafzimmer: eine Silhouette im Seidenmantel, ein Tablet in der Hand, Kurse im Gesicht. Sie schläft nicht. Sie plant.'),
  ])]),
  standard: gespraech('seraphina-tag-standard', [
    erz('Eine Frau in Blau steht auf einer Parkbank im Glaspark. Vor ihr: zweihundert Tauben. Sie hält eine Rede.'),
    S('… und darum, meine Damen und Herren, wird Quantum in fünf Jahren die Welt nicht verändern. Quantum wird die Welt SEIN. … Sie stören. Wir verschenken nichts. Auch keine Aufmerksamkeit.'),
  ], M),
  glaspark: gespraech('seraphina-tag-glaspark', [
    erz('Die Tauben machen Platz, als du dich näherst. Seraphina nicht.'),
    S('Ah, Sie. Mein menschliches Publikum. Bleiben Sie stehen, es verbessert die Akustik.', 'signatur'),
  ], M),
  salon: gespraech('seraphina-tag-salon', [
    erz('Der blaue Salon im Penthouse. Ein Frühstückstisch für zwölf, gedeckt für eine. Seraphina liest drei Zeitungen gleichzeitig, eine davon aus Papier.'),
    S('Sie sind früh. Früh ist gut. Wer früh kommt, bekommt die Krümel der Mächtigen. Croissant?'),
  ], M),
  balkon: gespraech('seraphina-tag-balkon', [
    erz('Der blaue Balkon. Unter euch Wolken, darüber nur noch Himmel. Seraphina telefoniert mit drei Kontinenten und hält einen Finger hoch: Warten Sie.'),
    S('… Kaufen. Alles. Nein, nicht Sie, ich meine die Firma. Ja, Sie auch. – Verzeihung. Was wollten Sie?'),
  ], M),
  vorstand: gespraech('seraphina-tag-vorstand', [
    erz('Am Chefaufzug im Quantum-Foyer. Seraphina, in Vorstandsblau, tippt ungeduldig mit dem Absatz.'),
    S('Vorstandssitzung. Blade wird reden, ich werde rechnen, und am Ende wird er sagen, es war seine Idee. Das ist das Wesen der Partnerschaft.', 'wut'),
  ], M),
  vertraut: gespraech('seraphina-tag-vertraut', [
    S('Sie schon wieder. Wissen Sie, die meisten Leute aus der Unterstadt sehen mich an wie einen Geldautomaten. Sie sehen mich an wie ein Problem. Das ist erfrischend.', 'freude'),
  ], M),
  zweifel: gespraech('seraphina-tag-zweifel', [
    S('Ich habe die Zahlen der Probanden nochmal gelesen. Ich bin Investorin. Ich weiß, wann eine Bilanz lügt. Diese hier lügt mit einem Lächeln.', 'besorgt'),
  ], M),
  party: dialog('seraphina-tag-party', [knoten('start', [
    erz('In der VIP-Lounge, in einem Kleid, das blauer ist als der Himmel draußen. Sie hält ein Glas, aus dem sie nicht trinkt.'),
    S('Heute Nacht wird Quantum zum Weltkonzern. Ich sollte glücklich sein. Ich bin … beschäftigt. Das ist bei uns dasselbe.', 'besorgt'),
  ])]),
  studio: gespraech('seraphina-tag-studio', [
    erz('NX-1-Studio. Seraphina sitzt in der Maske für ihre Talkshow „Chrome Klartext“. Die Maskenbildnerin zittert.'),
    S('Ich habe jetzt eine Sendung. Jeden Abend. Ich sage den Leuten, was ich denke. Es ist verstörend, wie gut die Quoten sind.', 'freude'),
  ], M),
  epilog: gespraech('seraphina-tag-epilog', [
    S('Ah. Sie. Setzen Sie sich. Wir sind jetzt die Familie, die Quantum gestützt hat und es nie zugeben wird. Ich übe gerade, es zuzugeben. Es geht langsam.', 'besorgt'),
  ], M),
  rivale: dialog('seraphina-tag-rivale', [knoten('start', [
    S('Sie haben Hausverbot. Im Penthouse, auf dem Boulevard und, wenn es nach mir geht, in meinen Gedanken.', 'wut'),
  ], {
    choices: [
      {
        text: 'Ein blaues Seidentuch reichen, mit einer tiefen Verbeugung.', when: { item: 'seidentuch-blau' }, next: 'tuch',
        effects: [{ take: 'seidentuch-blau' }, { reconcile: ID }],
      },
      {
        text: '„Wir verschenken nichts, sagen Sie. Dann verschenken Sie auch keinen Verbündeten.“', tag: '[Ausstrahlung 6]',
        check: pruefung('seraphina-rivale-verbuendet', 'ausstrahlung', 6, ['ueberreden']), next: 'worte', effects: [{ reconcile: ID }],
      },
      { text: 'Gehen.' },
    ],
  }), knoten('tuch', [
    S('Blau. Echte Seide. Und die Verbeugung … beinahe korrekt.', 'ueberrascht'),
    S('Das Hausverbot ist aufgehoben. Die Klage ziehe ich zurück. Den Groll behalte ich, aber nur als Sammlerstück.'),
  ]), knoten('worte', [
    S('Hm. Ein Argument mit meinen eigenen Worten. Das ist entweder Frechheit oder Strategie.', 'signatur'),
    S('Ich nehme Strategie. Wir fangen neu an. Mit Abstand. Zwei Meter. Mindestens.'),
  ])]),
};

// ---------------------------------------------------------------------------------------------- Herz-Ereignisse

/** ♥2 (Glaspark, abends, ab Akt 1): Rede vor Tauben. */
const he2 = dialog('he-seraphina-chrome-2', [
  knoten('start', [
    erz('Glaspark, Abendlicht durch die Kuppel. Seraphina steht auf ihrer Bank, vor ihr die Tauben in Reihen, als hätte jemand sie bestuhlt.'),
    S('… und darum, verehrte Anteilseigner, ist Wachstum keine Option, sondern eine Pflicht!'),
    erz('Eine Taube gurrt. Eine andere fliegt weg. Seraphina sieht ihr nach wie einem Investor, der aussteigt.'),
    S('Sehen Sie das? Abwanderung. Bei Tauben. Ich verliere mein Publikum. Was mache ich falsch?', 'besorgt'),
  ], {
    choices: [
      {
        text: 'Auf die Bank daneben steigen. „Und darum, meine Damen und Herren: Brotkrumen für alle!“', tag: '[Ausstrahlung 4]',
        check: pruefung('he-seraphina-chrome-2-rede', 'ausstrahlung', 4, ['buehne']), next: 'krumen', effects: [herz(ID, 50)],
      },
      { text: '„Sie reden über Geld. Tauben wollen Futter.“', next: 'futter', effects: [herz(ID, 35)] },
      { text: '„Vielleicht liegt’s am Publikum. Tauben sind Ratten mit Flügeln.“', next: 'ratten', effects: [herz(ID, 20)] },
    ],
  }),
  knoten('krumen', [
    erz('Du wirfst eine Handvoll Krümel. Zweihundert Tauben jubeln, so gut Tauben jubeln können. Seraphina starrt dich an. Dann wirft sie selbst. Mit der Präzision einer Frau, die Golfbälle über Kontinente schlägt.'),
    S('Sie sehen? Sie folgen. Das ist Führung. Mit Kohlenhydraten.', 'freude'),
  ], { next: 'ende' }),
  knoten('futter', [
    S('Futter. Hm. Das ist … erstaunlich präzise. Investoren sind genau so.', 'ueberrascht'),
    S('Ich habe dreißig Jahre Wirtschaft studiert, und die Lösung ist ein Brötchen.'),
  ], { next: 'ende' }),
  knoten('ratten', [
    S('Ratten mit Flügeln. Mein Vorstand, also.', 'signatur'),
    S('Das war … beinahe ein Witz. Gut. Sie dürfen bleiben. Stehen Sie gerade.'),
  ], { next: 'ende' }),
  knoten('ende', [
    S('Wir verschenken nichts. Aber für Sie mache ich eine Ausnahme: Ich merke mir Ihren Namen. {name}. Ja. Es klingt nach Unterstadt. Und nach Ehrgeiz.'),
  ], { effects: [flag('seraphina_tauben'), xp(40)] }),
]);

/** ♥4 (Penthouse-Salon, morgens, act2): Drei Investmentpläne. */
const he4 = dialog('he-seraphina-chrome-4', [
  knoten('start', [
    erz('Blauer Salon, morgens. Auf dem Frühstückstisch liegen drei Mappen. Seraphina klopft mit einem silbernen Löffel auf jede.'),
    S('Drei Pläne. Einer davon wird heute Mittag in den Nachrichten sein. Ich will, dass jemand ohne Aktien wählt. Das ist ein Experiment.', 'signatur'),
    S('Erstens: „Kanal-Wellness“ – die Kanalisation als Spa. Zweitens: „Chip für Haustiere“ – glückliche Pudel, glückliche Besitzer. Drittens: „Golfplatz Rohrsiedlung“ – mit allem, was dazugehört. Abriss.'),
  ], {
    choices: [
      { text: '„Kanal-Wellness. Das Kanalvolk wird Sie lieben. Oder fressen.“', next: 'kanal', effects: [herz(ID, 40), flag('seraphina_plan_kanal')] },
      { text: '„Keiner. Legen Sie das Geld in die Unterstadt. Echte Dächer, echte Leitungen.“', next: 'keiner', effects: [herz(ID, 50), flag('seraphina_plan_dach')] },
      {
        text: '„Plan zwei ist Plan Schwarm mit Pudel. Ich hab die Zahlen im Foyer gesehen.“', tag: '[Straße 5]',
        when: { flag: 'blade_fuehrung_zahlen' }, check: pruefung('he-seraphina-chrome-4-schwarm', 'strasse', 5, ['durchschauen']),
        next: 'schwarm', effects: [herz(ID, 60), flag('seraphina_plan_schwarm')],
      },
      { text: '„Golfplatz. Ich wollte schon immer mal was abreißen.“', next: 'golf', effects: [herz(ID, -20)] },
    ],
  }),
  knoten('kanal', [
    S('Kanal-Wellness. Ja. Wir nennen es „Unterstadt Spa“. Schlammbäder sind ohnehin schon da. Man muss sie nur teuer machen.', 'freude'),
  ], { next: 'ende' }),
  knoten('keiner', [
    S('Keiner. Sie wählen „keiner“. Bei drei Optionen.', 'ueberrascht'),
    erz('Sie legt den Löffel hin. Sie schaut lange auf die Mappen. Dann auf dich.'),
    S('Wissen Sie, wie lange mir niemand mehr widersprochen hat? Seit Vater gestorben ist. Und der hat mir auch nur widersprochen, weil er taub war.'),
  ], { next: 'ende' }),
  knoten('schwarm', [
    S('Plan Schwarm. Sie haben die interne Bezeichnung gesehen. Im Foyer.', 'besorgt'),
    S('Dann wissen Sie mehr als ich. Und ich sitze im Vorstand. Das ist ein Zustand, den ich nicht dulde.'),
  ], { next: 'ende' }),
  knoten('golf', [S('Golf in der Rohrsiedlung. Wie geschmacklos. Ich nehme den Plan trotzdem. Geschmacklosigkeit verkauft sich gut.', 'signatur')], { next: 'ende' }),
  knoten('ende', [
    S('Mittags in den Nachrichten. Achten Sie auf mein Gesicht. Ich werde staatstragend aussehen. Das bin ich dem Pudel schuldig.'),
  ], { effects: [meldung('Seraphina Chrome stellt mittags ihren neuen Investmentplan in den Nachrichten vor.'), xp(60)] }),
]);

/** ♥6 (Penthouse, blauer Balkon, tags, act2): Die letzten Angestellten wurden „zerlegt“. [Ausstrahlung 6] → seraphina_zweifel. */
const BEWEIS: Condition = eins({ flag: 'blade_fuehrung_zahlen' }, { item: 'nexus-forschungsdaten' }, { flag: 'alesa_zweifel' });
const he6 = dialog('he-seraphina-chrome-6', [
  knoten('start', [
    erz('Der blaue Balkon. Seraphina steht an der Brüstung, ohne Telefon. Unten im Wolkendunst glitzert der Quantum-Spire.'),
    S('Wissen Sie, was in meinem Bericht steht? Die Reinigungskräfte der dritten Etage wurden „zerlegt“. Ein Fachbegriff aus Blades Abteilung. Er meint „umstrukturiert“.', 'besorgt'),
    S('Ich habe eine von ihnen gestern gesehen. Frau Hollerbach. Dreißig Jahre im Haus. Sie hat mich angelächelt und gesagt: „Das ist eine ausgezeichnete Entscheidung, Frau Chrome.“ Ich hatte gar nichts entschieden.'),
  ], {
    choices: [
      {
        text: '„Zerlegt heißt gechippt. Und Sie haben das Geld dafür gegeben.“', tag: '[Ausstrahlung 6]',
        check: pruefung('he-seraphina-chrome-6-wahrheit', 'ausstrahlung', 6, ['ueberreden']), next: 'wahrheit', effects: [herz(ID, 50)],
      },
      { text: 'Ihr zeigen, was du über Plan Schwarm weißt.', tag: '[Beweis]', when: BEWEIS, next: 'beweis', effects: [herz(ID, 50)] },
      { text: '„Vielleicht ist Frau Hollerbach einfach glücklich?“', next: 'gluecklich', effects: [herz(ID, 30)] },
    ],
  }),
  knoten('wahrheit', [
    S('Ich habe das Geld gegeben.', 'trauer'),
    erz('Sie wiederholt es nicht als Frage. Sie wiederholt es wie eine Zahl, die man sich merken muss.'),
    S('Wir verschenken nichts. Das war immer mein Satz. Ich habe Frau Hollerbach nichts geschenkt. Ich habe ihr etwas genommen. Gegen Quittung.'),
  ], { next: 'zweifel' }),
  knoten('beweis', [
    erz('Du erzählst ihr von der Chip-Charge, von „Projekt Schwarm“, von den Probanden mit den flachen Träumen.'),
    S('Viertausend Stück. Zur Releaseparty. Und ich habe die Gästeliste genehmigt.', 'trauer'),
  ], { next: 'zweifel' }),
  knoten('gluecklich', [
    S('Glücklich. Ja. Das ist das Wort im Bericht. Glücklich, zufrieden, null Krankmeldungen.', 'besorgt'),
    S('Ich kenne glückliche Menschen. Sie lachen manchmal an der falschen Stelle. Frau Hollerbach lacht nie an der falschen Stelle. Nie.'),
  ], { next: 'ende' }),
  knoten('zweifel', [
    S('Ich werde nicht öffentlich gegen Blade sprechen. Noch nicht. Aber ich werde nicht mehr unterschreiben, ohne zu lesen.', 'wut'),
    S('Und Sie … Sie bekommen in der Oberstadt zehn Prozent. Auf alles. Sagen Sie den Händlern, Seraphina schickt Sie. Es ist kein Geschenk. Es ist eine Anzahlung.'),
  ], { next: 'ende', effects: [flag('seraphina_zweifel'), flag('seraphina_rabatt')] }),
  knoten('ende', [
    S('Gehen Sie jetzt. Ich möchte eine Weile auf diese Wolken sehen und so tun, als wären sie unbezahlbar.'),
  ], { effects: [xp(80)] }),
]);

/** ♥8 (Nachspiel, NX-1-Studio, abends): ehrliche Entschuldigung in der Talkshow. */
const he8 = dialog('he-seraphina-chrome-8', [
  knoten('start', [
    erz('NX-1-Studio, live. Das Licht rot. Collin Charleston moderiert, Seraphina sitzt auf dem Gästesofa, kerzengerade. Du stehst hinter der Kamera; sie hat darauf bestanden.'),
    C('Frau Chrome, die ganze Stadt fragt sich: Haben Sie gewusst, was der Chip anrichtet?'),
    erz('Seraphina sieht an der Kamera vorbei, direkt zu dir.'),
  ], {
    choices: [
      { text: 'Ihr zunicken. „Sag’s.“', next: 'sagen', effects: [herz(ID, 50)] },
      {
        text: 'Auf einen Zettel schreiben: „Wir verschenken nichts – außer heute eine Entschuldigung.“ und hochhalten.', tag: '[Ausstrahlung 5]',
        check: pruefung('he-seraphina-chrome-8-zettel', 'ausstrahlung', 5, ['buehne']), next: 'zettel', effects: [herz(ID, 60)],
      },
    ],
  }),
  knoten('sagen', [
    S('Ich habe es nicht gewusst. Ich habe es nicht wissen wollen. Das ist schlimmer.', 'trauer'),
    S('Ich entschuldige mich bei Frau Hollerbach. Bei allen in der dritten Etage. Bei der Unterstadt, die ich immer nur von oben gesehen habe.'),
  ], { next: 'ende' }),
  knoten('zettel', [
    erz('Sie liest den Zettel. Ein Mundwinkel zuckt.'),
    S('Wir verschenken nichts. Das habe ich mein Leben lang gesagt. Heute verschenke ich eine Entschuldigung. An alle. Ohne Quittung.', 'freude'),
    S('Es tut mir leid. Ich habe in einen Mann investiert statt in eine Stadt.'),
  ], { next: 'ende' }),
  knoten('ende', [
    C('Meine Damen und Herren … ich bin sprachlos. Das ist mir live noch nie passiert. Werbung!'),
    erz('Nach der Sendung findet sie dich am Ausgang. Sie hält deine Hand eine Sekunde zu lang, für ihre Verhältnisse eine Umarmung.'),
    S('Die Quote war phänomenal. Und ich fühle mich, als hätte ich einen Zahn gezogen bekommen. Ohne Betäubung. Danke.', 'freude'),
  ], { effects: [flag('seraphina_entschuldigt'), { rep: 'unterstadt', delta: 10 }, xp(150)] }),
]);

/** ♥10 (Nachspiel, Boulevard, tags, nach ♥8): Chrome-Stiftung für die Unterstadt, chrome-mitgliedskarte. */
const he10 = dialog('he-seraphina-chrome-10', [
  knoten('start', [
    erz('Mitten auf dem Chrome-Boulevard. Eine kleine Bühne, ein blaues Band, Presse. Sybella hält die Schere, Serenity einen Blumenkorb. Seraphina winkt dich nach vorn.'),
    S('Meine Damen und Herren: die Chrome-Stiftung. Für Dächer, Wasser und Schulbücher in der Unterstadt. Sybella hat das Budget berechnet.'),
    SY('Viel zu hoch. Ich hab es trotzdem unterschrieben. Ich bin selbst überrascht.'),
    SE('Und ich darf die Gärten machen! Alle Gärten!'),
    S('Und die erste Mitgliedskarte der Stiftung geht an die Person, die mir gezeigt hat, dass Tauben Futter wollen und Menschen auch.', 'freude'),
  ], {
    choices: [
      { text: 'Die Karte annehmen und das Band durchschneiden.', next: 'band' },
      { text: '„Gib sie Mutter Brühe. Die kocht seit Jahren für die Rohrsiedlung.“', next: 'bruehe', effects: [herz('mutter-bruehe', 30)] },
    ],
  }),
  knoten('band', [
    erz('Schnipp. Applaus. Eine Taube landet auf deiner Schulter, als wäre sie bestellt. Bei Seraphina würde dich das nicht wundern.'),
  ], { next: 'ende' }),
  knoten('bruehe', [
    S('Mutter Brühe bekommt die zweite. Und einen Sitz im Kuratorium. Mit Suppenrecht.', 'freude'),
    S('Aber die erste gehört Ihnen. Das ist nicht verhandelbar. Ich habe sie gravieren lassen. Gravuren kann man nicht zurückgeben.'),
  ], { next: 'ende' }),
  knoten('ende', [
    S('Wir verschenken nichts. Das bleibt mein Satz. Aber man darf einen Satz neu betonen: Wir verschenken nichts – wir teilen.', 'freude'),
  ], { effects: [geschenk('chrome-mitgliedskarte'), { rep: 'chrome-haus', delta: 20 }, xp(250)] }),
]);

// ---------------------------------------------------------------------------------------------- Rivalität

const re2 = dialog('re-seraphina-chrome-2', [knoten('start', [
  erz('Portier Albert tritt dir in den Weg, ein Briefkuvert auf einem Silbertablett.'),
  erz('Darin, auf blauem Büttenpapier: „Hausverbot. Penthouse, Boulevard, Balkonsicht. Mit vorzüglicher Hochachtung, S. Chrome.“'),
], { effects: [flag('seraphina_hausverbot')] })]);

const re5 = dialog('re-seraphina-chrome-5', [knoten('start', [
  erz('Ein Gerichtsbote mit Zylinder überreicht dir ein Schreiben. Klage der Familie Chrome gegen dich wegen „unbotmäßigen Atmens in Sichtweite des Balkons“. Streitwert: drei Credits. Gerichtskosten: siebzig.'),
  erz('Der Bote nickt dir mitfühlend zu. „Sie hat gute Anwälte. Und viel Zeit.“'),
], { effects: [flag('seraphina_klage'), { wanted: 1 }, meldung('Bagatellklage der Chromes: Der Richter erwartet dich.')] })]);

// ---------------------------------------------------------------------------------------------- Figur

const seraphina: NpcDef = {
  id: ID,
  name: 'Seraphina Chrome',
  unknownName: 'Frau in Blau',
  portrait: 'seraphina',
  sprite: 'seraphina-walk',
  faction: 'chrome-haus',
  maxHearts: 10,
  bio: 'Älteste der drei Chrome-Schwestern, Investorin und Strategin von Quantum. Farbe Blau. Hält Reden vor Tauben und will Quantum zum Weltkonzern machen. „Wir verschenken nichts.“',
  gifts: {
    loves: ['seidentuch-blau', 'planungsbrett-glas', 'perlenkette'],
    likes: ['zeitung-papier', 'parfuem-ozon', 'edelbrause', 'taschenspiegel-gold', 'echtobst-apfel', 'hofhonig'],
    dislikes: ['seidentuch-rot', 'seidentuch-gruen', 'chrome-10-gutschein'],
    hates: ['synth-nudeln', 'rostige-dose', 'virus-implantat'],
  },
  schedule: [
    ort('A', 'nx1-studio', 'studio-set', { when: EPILOG }),
    ort('M', 'chrome-penthouse', 'salon', { when: EPILOG }),
    ort('T', 'chrome-boulevard', 'boulevard-mitte', { when: EPILOG }),
    weg('*', { when: EPILOG }),
    ort('*', 'himmelsgarten', 'vip-lounge', { when: PARTYNACHT }),
    ort('N', 'chrome-penthouse', 'schlafzimmer-blau', { when: EINBRUCH }),
    ort('M', 'chrome-penthouse', 'salon'),
    ort('T', 'quantum-foyer', 'chefaufzug', { days: ['mo', 'do'] }),
    ort('T', 'chrome-penthouse', 'seraphinas-spiegel'), // Plan: balkon-blau (Spot fehlt auf der Karte, gaps)
    ort('A', 'glasarkaden', 'glaspark-tauben'),
    weg('N'),
  ],
  heartEvents: [
    { id: 'he-seraphina-chrome-2', hearts: 2, map: 'glasarkaden', time: 'abend', when: { notFlag: 'epilog' }, dialogue: 'he-seraphina-chrome-2' },
    { id: 'he-seraphina-chrome-4', hearts: 4, map: 'chrome-penthouse', time: 'morgen', when: alle(AKT2, { notFlag: 'epilog' }, gesehen('he-seraphina-chrome-2')), dialogue: 'he-seraphina-chrome-4' },
    { id: 'he-seraphina-chrome-6', hearts: 6, map: 'chrome-penthouse', time: 'tag', when: alle(AKT2, { notFlag: 'epilog' }, gesehen('he-seraphina-chrome-4')), dialogue: 'he-seraphina-chrome-6' },
    { id: 'he-seraphina-chrome-8', hearts: 8, map: 'nx1-studio', time: 'abend', when: EPILOG, dialogue: 'he-seraphina-chrome-8' },
    { id: 'he-seraphina-chrome-10', hearts: 10, map: 'chrome-boulevard', time: 'tag', when: alle(EPILOG, gesehen('he-seraphina-chrome-8')), dialogue: 'he-seraphina-chrome-10' },
    { id: 're-seraphina-chrome-2', hearts: -2, map: 'chrome-boulevard', when: { notFlag: 'epilog' }, dialogue: 're-seraphina-chrome-2' },
    { id: 're-seraphina-chrome-5', hearts: -5, map: 'glasarkaden', when: { notFlag: 'epilog' }, dialogue: 're-seraphina-chrome-5' },
  ],
  talk: [
    rede('seraphina-tag-rivale', rivale(ID)),
    rede('seraphina-tag-studio', alle(EPILOG, { time: 'abend' })),
    rede('seraphina-tag-epilog', EPILOG),
    rede('seraphina-tag-party', PARTYNACHT),
    rede('seraphina-tag-nacht', { time: 'nacht' }),
    rede('seraphina-tag-oberstadt', alle(nichtGetroffen(ID), { origin: 'origin-oberstadt' })),
    rede('seraphina-tag-gosse', alle(nichtGetroffen(ID), { origin: 'origin-gossenkind' })),
    rede('seraphina-tag-standard', nichtGetroffen(ID)),
    rede('seraphina-tag-zweifel', alle(AKT2, { flag: 'seraphina_zweifel' })),
    rede('seraphina-tag-vorstand', alle({ weekday: ['mo', 'do'] }, { time: 'tag' })),
    rede('seraphina-tag-salon', { time: 'morgen' }),
    rede('seraphina-tag-balkon', { time: 'tag' }),
    rede('seraphina-tag-vertraut', undefined, 4),
    rede('seraphina-tag-glaspark'),
  ],
};

export const part: ContentPart = {
  npcs: { [ID]: seraphina },
  dialogues: sammle(
    T.oberstadt, T.gosse, T.nacht, T.standard, T.glaspark, T.salon, T.balkon, T.vorstand, T.vertraut, T.zweifel, T.party,
    T.studio, T.epilog, T.rivale, he2, he4, he6, he8, he10, re2, re5,
  ),
};
