// Serenity Chrome (Grün) – jüngste der Chrome-Schwestern, Romantikerin, will eigentlich gärtnern (world.md §4.3).
// Volle Fassung für Akt 1–3 und Nachspiel; ersetzt npc-welt/serenity-chrome.ts (gleiche ID, Akt-1-Sätze übernommen).
// Tagesablauf nach design/plan/act23.json (npcSchedules.serenity-chrome, „ersetzt“), Herz-Ereignisse
// he-serenity-chrome-2…10, Rivalität re-serenity-chrome-2/5 (Gerüchte, Fortsetzungsroman; Versöhnung: Lio singt ein Happy End).
// he-serenity-chrome-6 schaltet den Turmaufzug zum Himmelsgarten frei (Ausgang prüft „gesehen“). Keine Romanze.
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode, NpcDef } from '../../../modules/contracts';
import {
  type Menue, AKT2, EPILOG, PARTYNACHT, ab, alle, dialog, eins, erz, flag, gesehen, geschenk, gespraech, geschenke, herz, ich,
  knoten, meldung, nicht, nichtGetroffen, ort, pruefung, queststand, rede, rivale, sammle, sprecher, weg, xp, zurueck,
} from './_q';

const ID = 'serenity-chrome';
const S = sprecher(ID);
const L = sprecher('lio-funkel');
const MA = sprecher('marla-sand');

const EINBRUCH: Condition = queststand('side-alte-gewohnheiten', 'active');
const Z = zurueck('Erzähl noch was, Serenity.', 'Ich muss weiter.');

// ---------------------------------------------------------------------------------------------- Menü

const choices: DialogueChoice[] = [
  {
    text: '„In der Ödnis blüht die Wüstenrose nur eine Nacht. Danach riecht der ganze Hof nach Honig.“', tag: '[Ödnis]',
    when: { origin: 'origin-oednis' }, once: true, id: 'se-oednis', next: 'oednis', effects: [herz(ID, 50)],
  },
  { text: '„Was liest du da?“', next: 'roman' },
  { text: '„Was findest du eigentlich an Blade?“', once: true, id: 'se-blade', next: 'blade', when: nicht(EPILOG) },
  { text: '„Wenn du dürftest – was würdest du machen?“', tag: '[Serenity ♥2]', requires: ab(ID, 2), once: true, id: 'se-wunsch', next: 'wunsch' },
  {
    text: '„Auf den Dächern der Unterstadt wäre Platz für ein Gewächshaus.“', tag: '[Serenity ♥3]', requires: ab(ID, 3),
    when: alle(AKT2, queststand('pers-serenity-gewaechshaus', 'inactive')), next: 'gewaechshaus',
    effects: [{ startQuest: 'pers-serenity-gewaechshaus' }],
  },
  { text: 'Ich muss weiter.' },
];

const nodes: DialogueNode[] = [
  knoten('oednis', [
    S('Eine Nacht? Nur eine? Und dann Honig?', 'ueberrascht'),
    erz('Sie hat das Buch zugeklappt, ohne ein Lesezeichen reinzulegen. Das macht sie nie.'),
    S('Erzähl mir alles. Wie tief sind die Wurzeln? Gießt man sie? Spricht man mit ihr? Oh, sag, dass man mit ihr spricht!', 'freude'),
  ], { choices: Z }),
  knoten('roman', [
    S('„Herz aus Chrom“, Band sieben. Die Mechanikerin Rosalind verliebt sich in den Androiden Gideon, aber Gideon hat ein Update bekommen und erinnert sich nicht mehr an ihren Namen!', 'trauer'),
    S('Sie schreibt ihren Namen auf jede Schraube, die sie ihm einsetzt. Achthundertvierzig Schrauben. Hach.'),
    ich('Das ist eigentlich ziemlich gruselig.'),
    S('Das ist ROMANTISCH. Gruselig und romantisch sind Nachbarn. Sie leihen sich gegenseitig Zucker.', 'signatur'),
  ], { choices: Z }),
  knoten('blade', [
    S('Er hat so schöne Hände. Und dieser Mantel. Wie ein großer, gefährlicher Bär, der Champagner trinkt.', 'freude'),
    S('Seraphina sagt, er ist ein Schlangenmensch. Sybella sagt, er ist überbewertet. Ich sage: ein Schnuckelchen. Mit Schatten. Die besten haben Schatten.'),
  ], { choices: Z }),
  knoten('wunsch', [
    S('Machen? Ich?', 'ueberrascht'),
    erz('Sie sieht auf ihre Seidenhandschuhe. Unter den Nägeln ist Erde. Sie versteckt es nicht.'),
    S('Ich würde gärtnern. Mit Händen. Ohne Handschuhe. Tomaten, die nach Tomate schmecken. Blumen, die keiner bestellt hat.', 'trauer'),
    S('Aber eine Chrome gärtnert nicht. Eine Chrome lässt gärtnern. Hat Papa gesagt. Papa hat auch gesagt, Pudel sind Statussymbole.'),
  ], { choices: Z, effects: [herz(ID, 20)] }),
  knoten('gewaechshaus', [
    S('Ein Gewächshaus. Auf einem Dach. In der Unterstadt. Wo es regnet und alles nach Rost riecht.', 'ueberrascht'),
    S('Das ist das Schönste, was mir je jemand angeboten hat. Mehr als Diamanten. Diamanten wachsen nicht.', 'freude'),
    S('Die Dachterrasse in der Neon-Gasse. Ich habe sie von oben gesehen. Ich bringe Samen mit. Und Mut. Und Sonnenhut.'),
  ], { choices: Z }),
];

const M: Menue = { zeile: S('Hach. Noch was? Ich habe Zeit. Ich habe immer Zeit. Das ist das Problem mit Geld.'), choices, nodes };

// ---------------------------------------------------------------------------------------------- Tagesgespräche

const T = {
  // Akt-1-Sätze aus npc-welt/serenity-chrome.ts (gleiche IDs).
  oednis: gespraech('serenity-tag-oednis', [
    S('Aus der Ödnis? Wirklich? Wächst da draußen etwas? Kakteen? Blühen die? Welche Farbe? Oh, sagen Sie es mir nicht. Doch. Nein. Später.'),
  ], M),
  morgen: gespraech('serenity-tag-morgen', [
    erz('Im Glaspark kniet eine Frau in Grün im Beet, die Seidenhandschuhe voller Erde. Sie flüstert mit einer Orchidee.'),
    S('Psst. Sie schläft noch. Pflanzen brauchen Ruhe. Und Liebe. Und jemanden, der ihnen sagt, dass sie schön sind.'),
  ], M),
  nacht: dialog('serenity-tag-nacht', [knoten('start', [
    erz('Im grünen Schlafzimmer brennt eine Leselampe. Eine Frau liegt zwischen Kissen und liest „Herz aus Chrom“. Sie seufzt. Sehr laut.'),
  ])]),
  standard: gespraech('serenity-tag-standard', [
    erz('Am Ecktisch des Cafés sitzt eine blonde Frau in Grün, vor sich einen Tee, den sie nicht trinkt. Sie schaut hinaus in den Glaspark.'),
    S('Hach. Haben Sie ihn gesehen? Den Mann im Teddyfell? Ein Schnuckelchen. Aber sagen Sie es nicht meinen Schwestern.'),
  ], M),
  cafe: gespraech('serenity-tag-cafe', [
    S('Du! Setz dich! Rosalind hat Gideon gerade einen Brief geschrieben, auf einer Platine. Ich muss es jemandem erzählen, sonst platze ich.', 'freude'),
  ], M),
  glaspark: gespraech('serenity-tag-glaspark', [
    S('Guten Morgen! Die Orchidee hat heute Nacht eine neue Knospe bekommen. Ich habe ihr ein Lied vorgesungen. Sie war höflich genug, nicht zu welken.', 'freude'),
  ], M),
  promenade: gespraech('serenity-tag-promenade', [
    erz('Auf der Promenade des Boulevards. Serenity schiebt einen Kinderwagen. Darin: drei Topfpflanzen mit Sonnenbrillen.'),
    S('Sie brauchen frische Luft! Hier oben ist sie zwar gefiltert, aber Pflanzen merken das nicht. Glaube ich. Hoffe ich.'),
  ], M),
  studio: gespraech('serenity-tag-studio', [
    erz('NX-1-Studio, Garderobe. Am Schminkspiegel klebt ein Zettel: „HERZENSANGELEGENHEITEN – heute: Liebe im Zeitalter der Chips“. Serenity atmet in eine Papiertüte.'),
    S('Ich moderiere. Jeden Mittwoch. Live. Ich liebe es. Ich sterbe jedes Mal. Beides gleichzeitig.', 'besorgt'),
  ], M),
  vertraut: gespraech('serenity-tag-vertraut', [
    S('Da bist du ja! Weißt du, dass du in meinem Tagebuch vorkommst? Als „die Person, die zuhört“. Das ist eine seltene Pflanze.', 'freude'),
  ], M),
  party: dialog('serenity-tag-party', [knoten('start', [
    erz('Unter den Rosenbögen, in einem Kleid aus grüner Seide, eine echte Rose im Haar. Sie lächelt jeden Gast an. Ihre Augen nicht.'),
    S('Blade hat gesagt, die Rosen sind künstlich, weil echte nicht so lange halten. Ich habe sie heimlich ausgetauscht. Sie halten bis Mitternacht. Das reicht für ein Märchen.', 'besorgt'),
  ])]),
  beet: gespraech('serenity-tag-beet', [
    erz('Der Himmelsgarten am Morgen, ohne Party, ohne Champagner. Serenity kniet in einem frisch umgegrabenen Beet. Keine Handschuhe.'),
    S('Ich gieße hier jetzt jeden Morgen. Hecki sagt, ich mache es falsch. Hecki ist ein Roboter. Er hat keine Ahnung von Liebe. Nur von Wasser.', 'freude'),
  ], M),
  hofgarten: gespraech('serenity-tag-hofgarten', [
    erz('Aussiedlerhof, Samstagmorgen. Zwischen den Hofbeeten ein schmales Stück Erde mit einem handgemalten Schild: „SERENITYS GARTEN · bitte nicht treten · bitte doch staunen“.'),
    S('Marla hat mir gezeigt, wie man Kartoffeln steckt. Ich habe geweint. Vor Kartoffeln! Das ist mein Leben jetzt, und es ist wunderbar.', 'freude'),
  ], M),
  rivale: dialog('serenity-tag-rivale', [knoten('start', [
    S('Hach. Du. Weißt du, dass du jetzt in Band acht vorkommst? Als „der Schurke mit den kalten Händen“. Seite 112. Du wirst von einem Kronleuchter erschlagen.', 'wut'),
  ], {
    choices: [
      {
        text: '„Lio, sing ihr was. Mit Happy End.“', tag: '[Lio ♥3]', when: { met: 'lio-funkel' }, requires: ab('lio-funkel', 3),
        next: 'lio', effects: [{ reconcile: ID }, herz('lio-funkel', 10)],
      },
      {
        text: 'Ihr eine Orchidee hinhalten. Ohne Worte.', when: { item: 'orchidee' }, next: 'orchidee',
        effects: [{ take: 'orchidee' }, { reconcile: ID }],
      },
      { text: 'Gehen. Kronleuchter meiden.' },
    ],
  }), knoten('lio', [
    erz('Lio Funkel taucht auf, als hätte er auf sein Stichwort gewartet. Er hat. Er stimmt das Synth-Akkordeon und singt ein Lied über einen Schurken, der eigentlich nur gießen wollte.'),
    L('… und am Ende, im Regen, unterm rostigen Dach, wird der Schurke zum Gärtner – und die Rose wird wach!'),
    S('Ein Happy End. Für den Schurken. Das hat sich noch keiner getraut.', 'trauer'),
    S('Ich schreibe Seite 112 neu. Der Kronleuchter fällt daneben. Knapp. Damit es spannend bleibt.', 'freude'),
  ]), knoten('orchidee', [
    S('Eine Orchidee. Mit Knospe. Und du hast sie nicht im Plastik gekauft, das sehe ich an der Erde.', 'ueberrascht'),
    S('Gut. Der Schurke bekommt ein Kapitel Bewährung. Danach sehen wir weiter.'),
  ])]),
};

// ---------------------------------------------------------------------------------------------- Herz-Ereignisse

/** ♥2 (Glaspark, morgens, ab Akt 1): Eine kranke Pflanze [Technik 4]. */
const he2 = dialog('he-serenity-chrome-2', [
  knoten('start', [
    erz('Glaspark, Morgentau auf den Scheiben. Serenity kniet vor einer Orchidee, deren Blätter gelb und schlaff hängen. Sie hat Tränen auf den Wangen und Erde auf der Nase.'),
    S('Sie stirbt. Ich habe alles gemacht. Gedüngt, gegossen, ihr „Herz aus Chrom“ vorgelesen, Band eins bis sechs.', 'trauer'),
    S('Kannst du … kannst du sie dir ansehen? Du siehst aus wie jemand, der Dinge repariert.'),
  ], {
    choices: [
      {
        text: 'Die Bewässerungsdüse der Glasarkaden prüfen. Die tropft hier Kühlwasser statt Wasser.', tag: '[Technik 4]',
        check: pruefung('he-serenity-chrome-2-duese', 'technik', 4, ['reparieren']), next: 'duese', effects: [herz(ID, 50)],
      },
      { text: 'Die Orchidee umtopfen, an einen Platz mit echtem Licht.', next: 'umtopfen', effects: [herz(ID, 40)] },
      { text: '„Vielleicht hat sie einfach genug von Band sechs.“', next: 'band', effects: [herz(ID, 25)] },
    ],
  }),
  knoten('duese', [
    erz('Ein Schraubenschlüssel, eine Drehung, ein Fluch. Aus der Düse tropft jetzt klares Wasser statt der bläulichen Brühe.'),
    S('Kühlwasser? Die Glasarkaden gießen mit KÜHLWASSER? Ich schreibe einen Brief. An alle. Mit Glitzer.', 'wut'),
    S('Du hast sie gerettet. Und alle anderen hier auch. Du bist ein … ein Pflanzenritter!', 'freude'),
  ], { next: 'ende' }),
  knoten('umtopfen', [
    erz('Ihr tragt die Orchidee zum Fenster am Rand der Kuppel. Sonne. Echte, schmutzige Unterstadtsonne, durch zwei Schichten Glas.'),
    S('Sie dreht sich schon zum Licht. Siehst du? Sie wollte nur woanders sein. Wie ich manchmal.', 'besorgt'),
  ], { next: 'ende' }),
  knoten('band', [
    S('Band sechs ist der traurigste! Gideon verliert seine Erinnerungen und …', 'wut'),
    erz('Sie hält inne. Sieht die Orchidee an.'),
    S('… Oh. Vielleicht hast du recht. Ich lese ihr ab morgen Gedichte vor. Fröhliche.'),
  ], { next: 'ende' }),
  knoten('ende', [
    S('Komm wieder. Morgens. Pflanzen mögen Besuch, der nicht nur guckt, sondern bleibt.'),
  ], { effects: [flag('serenity_orchidee'), xp(40)] }),
]);

/** ♥4 (Café, abends): Sie liest aus „Herz aus Chrom“. */
const he4 = dialog('he-serenity-chrome-4', [
  knoten('start', [
    erz('Café Sahnehaube, Abend. Serenity hat dir einen Stuhl freigehalten, mit einem Kissen darauf und einem Schild: „RESERVIERT FÜR ZUHÖRER“.'),
    S('Ich lese dir das Ende von Band sieben vor. Ich habe es noch keinem vorgelesen. Meine Schwestern sagen, ich soll mit „solchem Zeug“ aufhören.', 'besorgt'),
    erz('Sie liest. Leise, dann lauter. Rosalind steht auf einem Dach im Regen, Gideon vor ihr, und er sagt ihren Namen. Zum ersten Mal seit dem Update. Serenity muss das Buch sinken lassen.'),
    S('„Rosalind.“ Nur das. Er sagt nur ihren Namen. Und es ist genug.', 'trauer'),
  ], {
    choices: [
      {
        text: 'Gideons Zeile wiederholen, mit Gefühl und schlechtem Roboter-Akzent.', tag: '[Ausstrahlung 4]',
        check: pruefung('he-serenity-chrome-4-gideon', 'ausstrahlung', 4, ['buehne']), next: 'gideon', effects: [herz(ID, 50)],
      },
      { text: '„Warum ist es genug?“', next: 'warum', effects: [herz(ID, 45)] },
      { text: '„Ich hätte ihn neu gestartet. Mit Backup.“', next: 'backup', effects: [herz(ID, 25)] },
    ],
  }),
  knoten('gideon', [
    erz('„RO-SA-LIND.“ Ein Gast am Nebentisch verschluckt sich. Perle hinter der Theke klatscht.'),
    S('Hach! Du hast es GESPIELT! Mit Akzent!', 'freude'),
  ], { next: 'ende' }),
  knoten('warum', [
    S('Weil keiner hier oben je meinen Namen sagt. Sie sagen „Frau Chrome“. Oder „die Jüngste“. Oder „die mit den Pflanzen“.', 'trauer'),
    ich('Serenity.'),
    erz('Sie sieht dich an. Sie sagt nichts. Sie lächelt so breit, dass ihr Tee kalt wird.'),
  ], { next: 'ende' }),
  knoten('backup', [
    S('Backup! Du bist schlimmer als Sybella.', 'wut'),
    S('… Aber im Ernst. Ein Backup. Wenn Gideon eins gehabt hätte, hätte es keinen Band acht gebraucht. Ich muss das der Autorin schreiben.'),
  ], { next: 'ende' }),
  knoten('ende', [
    S('Danke, dass du geblieben bist. Bis zum Ende. Die meisten gehen vorher.'),
  ], { effects: [flag('serenity_vorgelesen'), xp(60)] }),
]);

/** ♥6 (NX-1-Studio, Mi tagsüber, act2): Lampenfieber [Ausstrahlung 5]; schaltet den Himmelsgarten frei. */
const he6 = dialog('he-serenity-chrome-6', [
  knoten('start', [
    erz('NX-1-Studio, zehn Minuten vor der Sendung. Serenity sitzt vor dem Schminkspiegel, die Papiertüte vor dem Mund. Die Tüte bläht sich wie eine kleine Lunge.'),
    S('Ich kann nicht. Heute ist Blade zu Gast. Thema: „Liebe ist eine ausgezeichnete Entscheidung“. Er hat das Thema ausgesucht. Ich soll ihn fragen, ob er jemals geliebt hat.', 'besorgt'),
    S('Was, wenn er „Nein“ sagt? Was, wenn er „Ja“ sagt? Beides ist furchtbar!'),
  ], {
    choices: [
      {
        text: '„Dann frag nicht ihn. Frag die Zuschauer. Und dann sag, was du selbst denkst.“', tag: '[Ausstrahlung 5]',
        check: pruefung('he-serenity-chrome-6-mut', 'ausstrahlung', 5, ['ueberreden']), next: 'mut', effects: [herz(ID, 60)],
      },
      { text: 'Ihre Hand nehmen und mit ihr zusammen zählen. Ein, zwei, drei. Atmen.', next: 'atmen', effects: [herz(ID, 50)] },
      { text: '„Stell dir vor, alle Zuschauer sind Topfpflanzen.“', next: 'pflanzen', effects: [herz(ID, 45)] },
    ],
  }),
  knoten('mut', [
    erz('Die Sendung läuft. Serenity fragt das Publikum. Eine Oma ruft: „Liebe ist, wenn man trotzdem bleibt!“ Applaus. Dann sieht Serenity in die Kamera.'),
    S('Ich glaube, Liebe ist keine Entscheidung, die jemand anders für einen trifft. Auch kein Chip. Auch kein … Master.', 'signatur'),
    erz('Blade, auf dem Gästesofa, verliert für eine Sekunde sein Lächeln. Die Quote steigt um zwölf Prozent.'),
  ], { next: 'ende', effects: [flag('serenity_sendung_mut')] }),
  knoten('atmen', [
    erz('Ihr zählt. Bis zehn. Dann noch mal. Die Tüte sinkt. Der Aufnahmeleiter ruft „Noch zwei Minuten!“, und Serenity steht auf, ohne zu zittern.'),
    S('Ich mache es. Für Rosalind. Und für die Orchidee. Und für dich.', 'freude'),
  ], { next: 'ende' }),
  knoten('pflanzen', [
    S('Topfpflanzen. Hunderte. Mit kleinen Gesichtern.', 'freude'),
    erz('Sie kichert. Dann lacht sie. Dann geht sie raus und moderiert die beste Sendung ihres Lebens, und jedes Mal, wenn sie ins Publikum sieht, lächelt sie ein bisschen zu breit.'),
  ], { next: 'ende' }),
  knoten('ende', [
    erz('Nach der Sendung drückt sie dir eine kleine Messingkarte in die Hand. Darauf eine gravierte Rose.'),
    S('Der Schlüssel für den Turmaufzug. Zum Himmelsgarten. Ganz oben auf dem Chrome Tower ist mein Lieblingsort. Tagsüber, wenn keiner da ist. Komm mich besuchen.'),
  ], { effects: [flag('serenity_himmelsgarten'), meldung('Der Turmaufzug zum Himmelsgarten öffnet sich jetzt tagsüber für dich.'), xp(100)] }),
]);

/** ♥8 (Himmelsgarten, morgens/tags, nach ♥6): „Mich hat nie jemand gefragt, was ich will.“ */
const he8 = dialog('he-serenity-chrome-8', [
  knoten('start', [
    erz('Himmelsgarten, früh. Die Rosenbögen tropfen vom Tau, über euch nur Himmel. Serenity sitzt auf dem Rand eines Beets und hat die Schuhe ausgezogen.'),
    S('Weißt du, was ich gemerkt habe? Mich hat nie jemand gefragt, was ich will. Nicht Papa, nicht Seraphina, nicht Sybella. Nicht mal ich selbst.', 'trauer'),
    S('Seraphina will die Welt. Sybella will Prozente. Und ich soll lächeln und Blade nett finden. Ich finde Blade nett. Aber ich will … ich weiß nicht.'),
  ], {
    choices: [
      { text: '„Was willst du, Serenity?“', next: 'frage', effects: [herz(ID, 60)] },
      {
        text: '„Du willst Erde unter den Fingern. Ich hab dich gesehen. Du versteckst es nicht mal mehr.“', tag: '[Straße 5]',
        check: pruefung('he-serenity-chrome-8-durchschaut', 'strasse', 5, ['durchschauen']), next: 'erde', effects: [herz(ID, 60)],
      },
    ],
  }),
  knoten('frage', [
    erz('Sie sieht dich an, als hättest du ihr eine Tür geöffnet, von der sie nicht wusste, dass sie da ist.'),
    S('Ich will … einen Garten. Einen echten. Nicht hier oben, wo alles gefiltert ist. Draußen. Wo es regnet und staubt und wo man nicht weiß, ob es wächst.', 'freude'),
    S('Ich will etwas, das nicht gekauft ist. Das ist alles. Das ist so viel.'),
  ], { next: 'ende' }),
  knoten('erde', [
    S('Erde unter den Fingern.', 'ueberrascht'),
    erz('Sie hebt die Hände. Schwarz bis zu den Knöcheln. Sie lacht, und es klingt nicht wie in den Romanen. Es klingt echt.'),
    S('Ja. Genau das. Und sonst nichts.'),
  ], { next: 'ende' }),
  knoten('ende', [
    S('Danke, dass du gefragt hast. Das ist besser als jeder Band. Sag es nicht der Autorin.'),
  ], { effects: [flag('serenity_wunsch'), xp(150)] }),
]);

/** ♥10 (Nachspiel, Aussiedlerhof, Sa morgens): Eigener Garten, serenitys-ring. */
const he10 = dialog('he-serenity-chrome-10', [
  knoten('start', [
    erz('Aussiedlerhof, Samstag, Sonnenaufgang. Serenity steht in einem kleinen, krummen Beet zwischen Marlas Kartoffeln, in Gummistiefeln, mit Erde bis zu den Ellbogen.'),
    S('Du bist gekommen! Sieh mal! Die erste Tomate. Sie ist hässlich. Sie ist schief. Sie ist MEINE.', 'freude'),
    MA('Sie hat die Pflanze dreimal am Tag gegossen und ihr Gedichte vorgelesen. Ich hab gesagt, das bringt nichts. Die Tomate hat mich widerlegt.'),
  ], {
    choices: [
      {
        text: 'Mit anpacken und die Beete fertig machen.',
        effects: [{
          minigame: 'akt-gaertnern', level: 2, key: 'serenity-hofgarten', label: 'Serenitys Hofgarten',
          win: [{ dialogue: 'he-serenity-chrome-10-ring' }, herz(ID, 30)],
          lose: [{ dialogue: 'he-serenity-chrome-10-ring' }],
        }],
      },
      { text: 'Die schiefe Tomate probieren.', next: 'tomate' },
    ],
  }),
  knoten('tomate', [
    erz('Sie schmeckt nach Sonne, nach Staub und ein bisschen nach Marlas Gießkanne. Es ist die beste Tomate deines Lebens. Es ist vermutlich die erste echte.'),
  ], { next: 'ring' }),
  knoten('ring', [
    erz('Serenity holt ein Samentütchen aus der Schürze. Darin, zwischen Ringelblumensamen, ein schlichter Ring aus grünem Glas.'),
    S('Den hat mir Papa geschenkt. Getragen hab ich ihn nie, nur aufbewahrt. Er hat gesagt: „Damit du nie vergisst, wo du herkommst.“ Er meinte das Haus. Ich glaube, er meinte eigentlich das hier.', 'trauer'),
    S('Ich will, dass du ihn hast. Weil du gefragt hast, was ich will. Und weil du geblieben bist, bis ich es wusste.', 'freude'),
  ], { effects: [geschenk('serenitys-ring'), flag('serenity_garten'), xp(250)] }),
]);

const he10Ring = dialog('he-serenity-chrome-10-ring', [knoten('start', [
  erz('Am Ende sind die Beete grün, die Hände schwarz und Serenity summt ein Lied, das sie von Lio hat. Dann holt sie ein Samentütchen aus der Schürze. Darin, zwischen Ringelblumensamen, ein schlichter Ring aus grünem Glas.'),
  S('Den hat mir Papa geschenkt. Nie getragen, nur aufbewahrt. „Damit du nie vergisst, wo du herkommst.“ Er meinte das Haus. Ich glaube, er meinte eigentlich das hier.', 'trauer'),
  S('Ich will, dass du ihn hast. Weil du gefragt hast, was ich will. Und weil du geblieben bist, bis ich es wusste.', 'freude'),
], { effects: [geschenk('serenitys-ring'), flag('serenity_garten'), xp(250)] })]);

// ---------------------------------------------------------------------------------------------- Rivalität

const re2 = dialog('re-serenity-chrome-2', [knoten('start', [
  erz('Zwei Damen an der Brüstung tuscheln, als du vorbeigehst. „… das ist die Person, über die Serenity Chrome so geseufzt hat. Nicht die gute Art Seufzer. Die andere.“'),
  erz('Eine Verkäuferin dreht das „Geöffnet“-Schild um, als sie dich sieht.'),
], { effects: [flag('serenity_geruechte')] })]);

const re5 = dialog('re-serenity-chrome-5', [knoten('start', [
  erz('Am Kiosk der Glasarkaden liegt ein frischer Stapel: „HERZ AUS CHROM – Band 8: Der Schurke mit den kalten Händen“. Auf dem Cover: eine Figur, die dir verdächtig ähnlich sieht. Mit Schnurrbart. Du hast keinen Schnurrbart.'),
], { effects: [flag('serenity_roman_boesewicht'), { rep: 'chrome-haus', delta: -10 }, meldung('Serenity hat dich als Bösewicht in ihren Fortsetzungsroman geschrieben.')] })]);

// ---------------------------------------------------------------------------------------------- Figur

const serenity: NpcDef = {
  id: ID,
  name: 'Serenity Chrome',
  unknownName: 'Blonde Frau in Grün',
  portrait: 'serenity',
  sprite: 'serenity-walk',
  faction: 'chrome-haus',
  maxHearts: 10,
  bio: 'Jüngste der drei Chrome-Schwestern, Farbe Grün. Romantikerin, liest „Herz aus Chrom“, gießt morgens im Glaspark und will eigentlich nur gärtnern. Findet Blade „ein Schnuckelchen“.',
  gifts: geschenke({
    loves: ['liebesroman', 'seidentuch-gruen', 'blumensamen', 'orchidee'],
    likes: ['samenbombe', 'autogrammkarte-collin', 'parfuem-ozon', 'edelbrause'],
    dislikes: ['seidentuch-rot', 'kassenbuch'],
    hates: ['plastikpflanze'],
  }),
  schedule: [
    ort('M', 'aussiedlerhof', 'serenity-garten', { days: ['sa'], when: EPILOG }),
    ort('M', 'himmelsgarten', 'serenity-beet', { when: EPILOG }),
    ort('*', 'himmelsgarten', 'rosenboegen', { when: PARTYNACHT }),
    ort('N', 'chrome-penthouse', 'schlafzimmer-gruen', { when: EINBRUCH }),
    ort('M', 'glasarkaden', 'glaspark'),
    ort('T', 'nx1-studio', 'schminkspiegel', { days: ['mi'] }),
    ort('T', 'chrome-boulevard', 'promenade'),
    ort('A', 'cafe-sahnehaube', 'ecktisch-cafe'),
    weg(),
  ],
  heartEvents: [
    { id: 'he-serenity-chrome-2', hearts: 2, map: 'glasarkaden', time: 'morgen', when: { notFlag: 'epilog' }, dialogue: 'he-serenity-chrome-2' },
    { id: 'he-serenity-chrome-4', hearts: 4, map: 'cafe-sahnehaube', time: 'abend', when: gesehen('he-serenity-chrome-2'), dialogue: 'he-serenity-chrome-4' },
    { id: 'he-serenity-chrome-6', hearts: 6, map: 'nx1-studio', time: 'tag', when: alle(AKT2, { weekday: 'mi' }, gesehen('he-serenity-chrome-4')), dialogue: 'he-serenity-chrome-6' },
    { id: 'he-serenity-chrome-8', hearts: 8, map: 'himmelsgarten', time: ['morgen', 'tag'], when: alle(gesehen('he-serenity-chrome-6'), nicht(PARTYNACHT)), dialogue: 'he-serenity-chrome-8' },
    { id: 'he-serenity-chrome-10', hearts: 10, map: 'aussiedlerhof', time: 'morgen', when: alle(EPILOG, { weekday: 'sa' }, gesehen('he-serenity-chrome-8')), dialogue: 'he-serenity-chrome-10' },
    { id: 're-serenity-chrome-2', hearts: -2, map: 'chrome-boulevard', dialogue: 're-serenity-chrome-2' },
    { id: 're-serenity-chrome-5', hearts: -5, map: 'glasarkaden', dialogue: 're-serenity-chrome-5' },
  ],
  talk: [
    rede('serenity-tag-rivale', rivale(ID)),
    rede('serenity-tag-hofgarten', alle(EPILOG, { weekday: 'sa' }, { time: 'morgen' })),
    rede('serenity-tag-beet', alle(EPILOG, { time: 'morgen' })),
    rede('serenity-tag-party', PARTYNACHT),
    rede('serenity-tag-nacht', { time: 'nacht' }),
    rede('serenity-tag-oednis', alle(nichtGetroffen(ID), { origin: 'origin-oednis' })),
    rede('serenity-tag-morgen', alle(nichtGetroffen(ID), { time: 'morgen' })),
    rede('serenity-tag-standard', nichtGetroffen(ID)),
    rede('serenity-tag-studio', alle({ weekday: 'mi' }, { time: 'tag' })),
    rede('serenity-tag-glaspark', { time: 'morgen' }),
    rede('serenity-tag-promenade', { time: 'tag' }),
    rede('serenity-tag-vertraut', eins({ time: 'abend' }), 4),
    rede('serenity-tag-cafe'),
  ],
};

export const part: ContentPart = {
  npcs: { [ID]: serenity },
  dialogues: sammle(
    T.oednis, T.morgen, T.nacht, T.standard, T.cafe, T.glaspark, T.promenade, T.studio, T.vertraut, T.party, T.beet,
    T.hofgarten, T.rivale, he2, he4, he6, he8, he10, he10Ring, re2, re5,
  ),
};
