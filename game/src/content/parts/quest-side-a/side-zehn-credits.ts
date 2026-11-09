// Nebenquest 2 `side-zehn-credits` „Zehn Credits“ (world.md §6.2 Nr. 2). Daria, Freya, Jakko am Botenstand
// (schrottmarkt), tagsüber, nach main-1-probezeit. Bessere Einnahmequelle finden → gemeinsames Essen bei Babette.
// Wege: gc-52 [Ausstrahlung 5] Oma Volt stellt sie als Botengänger an (bester Ausgang, startet pers-daria-botendienst) ·
// gc-53 [Technik 4] Implantat gemeinsam reparieren und Viren erkennen · metalldetektor schenken · [Hunter ♥4] Clubküche.
// Kein Kampfweg. Am Ende: ihre 10 Cr ablehnen (Ruf unterstadt +10) oder annehmen (−5).
// Straßenkinder: nur Freundschaft, kindgerecht (Freyas Fluchdose als Gag).
import type { ContentPart } from '../../part';
import type { CutsceneDef, DialogueDef, QuestDef } from '../../../modules/contracts';
import { active, all, any, dlg, done, flag, hearts, ich, inactive, item, l, msg, nar, node, noFlag, set, time, tschuess } from './_lib';

const Q = 'side-zehn-credits';
const D = 'daria';
const F = 'freya';
const J = 'jakko';

const WEGE = ['kinder_botendienst', 'kinder_implantat_kurs', 'kinder_metalldetektor', 'kinder_clubkueche'] as const;
const EINNAHME = any(...WEGE.map(flag));
const PROBEZEIT = done('main-1-probezeit');

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: 'Zehn Credits',
  summary: 'Daria, Freya und Jakko wollen essen können, ohne zu betteln. Ihr ganzes Kapital: zehn Credits. Sie bieten sie dir an.',
  giver: D,
  act: 1,
  steps: [
    {
      id: 'einnahme', text: 'Finde den Kindern eine Einnahmequelle, die mehr bringt als zehn Credits und Mitleid.',
      done: EINNAHME, marker: { map: 'schrottmarkt' },
    },
    {
      id: 'weg-oma', text: 'Weg: Oma Volt am Kiosk in der Neon-Gasse braucht vielleicht Botengänger.',
      optional: true, when: noFlag('kinder_botendienst'), done: flag('kinder_botendienst'), marker: { map: 'neon-gasse' },
    },
    {
      id: 'weg-implantat', text: 'Weg: Zeig ihnen am Botenstand, wie man ein Implantat repariert und Viren erkennt.',
      optional: true, when: noFlag('kinder_implantat_kurs'), done: flag('kinder_implantat_kurs'), marker: { map: 'schrottmarkt' },
    },
    {
      id: 'weg-detektor', text: 'Weg: Ein Metalldetektor (Händler) macht den Schlickstrand an der Flutmauer zur Goldgrube.',
      optional: true, when: noFlag('kinder_metalldetektor'), done: flag('kinder_metalldetektor'), marker: { map: 'schrottmarkt' },
    },
    {
      id: 'weg-hunter', text: 'Weg: Hunter (♥4) könnte die Clubküche aufmachen. Er sitzt tagsüber im Hinterzimmer.',
      optional: true, when: all(hearts('hunter', 4), noFlag('kinder_clubkueche')), done: flag('kinder_clubkueche'),
      marker: { map: 'hv-hinterzimmer' },
    },
    {
      id: 'essen', text: 'Feiert die neue Arbeit mit einem gemeinsamen Essen bei Babettes Garküche (Schrottmarkt, Bank).',
      when: EINNAHME, done: flag('kinder_essen'), marker: { map: 'schrottmarkt' },
    },
  ],
  reward: {
    xp: 180,
    items: { kinderbild: 1 },
    relations: { daria: 100, freya: 100, jakko: 100 },
    effects: [msg('Die Kinder haben dir ein Bild gemalt: du, riesig, mit drei kleinen Figuren auf den Schultern. Darunter: „UNSER INVESTOR“.')],
  },
};

// ---------------------------------------------------------------------------------------------- Botenstand

const stand: DialogueDef = dlg('side-zehn-credits-stand', [
  node('start', [
    nar('Hinter einer umgedrehten Obstkiste sitzen drei Kinder. Daria mit Klemmbrett, Freya mit einer Blechdose („FLUCHDOSE – 1 KEKS“), Jakko mit Hunger.'),
    l(D, 'Du. Ja, du. Du hast Hunters Probezeit überlebt. Das heißt, du kannst Probleme lösen. Wir haben eins.', 'signatur'),
  ], {
    choices: [
      { text: '„Was für ein Problem?“', when: inactive(Q), next: 'problem' },
      { text: '„Zeigt mal das kaputte Implantat. Wir machen das zusammen.“', when: all(active(Q), noFlag('kinder_implantat_kurs')), next: 'implantat' },
      {
        text: 'Den Metalldetektor schenken.', tag: '[Metalldetektor]',
        when: all(active(Q), noFlag('kinder_metalldetektor')), requires: item('metalldetektor'), next: 'detektor',
      },
      { text: '„Wie läuft das Geschäft?“', when: active(Q), next: 'stand' },
      { text: '„Na, ihr Unternehmer?“', when: done(Q), next: 'danach' },
      tschuess('„Später, Chefin.“'),
    ],
  }),
  node('problem', [
    l(D, 'Wir verdienen zehn Credits am Tag. Zu dritt. Mit Pfandflaschen und Botengängen für Leute, die nicht zahlen.', 'wut'),
    l(F, 'Einspruch. Einige zahlen. In Knöpfen. Knöpfe sind keine Währung, das steht in keinem Gesetzbuch.', 'neutral'),
    l(J, 'Und Ripper zahlt für alte Implantate zehn Credits. Für EIN Implantat! Das ist so wenig wie eine halbe Dampfnudel! Ohne Füllung!', 'trauer'),
    l(D, 'Wir wollen nicht betteln. Betteln ist scheiße für die Verhandlungsposition.'),
    l(F, 'Daria. Fluchdose.', 'neutral'),
    nar('Daria wirft seufzend einen zerbröselten Keks in die Dose.'),
    l(D, 'Also. Wir haben zehn Credits. Unser ganzes Kapital. Die kriegst du, wenn du uns was Besseres besorgst. Eine richtige Einnahmequelle.', 'signatur'),
  ], {
    choices: [
      { text: '„Behaltet eure Kohle. Ich kümmer mich drum.“', next: 'zusage' },
      { text: '„Zehn Credits? Ich bin teuer, Kleine. Aber gut, ich mach’s.“', next: 'zusage' },
      { text: '„Verdammte Scheiße, ihr seid härter als Hunter.“', next: 'fluch' },
      tschuess('„Ich hab gerade keinen Kopf dafür.“'),
    ],
  }),
  node('fluch', [
    l(F, 'Fluchdose. Zwei Kekse. „Verdammt“ und „Scheiße“ sind zwei Delikte.', 'neutral'),
    ich('Ich hab keinen Keks.'),
    l(F, 'Dann schuldest du dem Gericht. Das Gericht vergisst nie.', 'signatur'),
  ], { next: 'zusage' }),
  node('zusage', [
    l(D, 'Super. Vorschläge nimmt die Geschäftsführung entgegen. Ich bin die Geschäftsführung.', 'freude'),
    l(J, 'Oma Volt sucht immer Leute zum Tragen! Und Hunter hat eine Küche, die keiner benutzt, weil Hunter nur Nougatbomben isst!', 'freude'),
    l(F, 'Und wenn wir wüssten, welche Implantate Viren haben, könnte Ripper uns nicht mehr bescheißen. Das wäre gerecht. Gerecht ist mein Lieblingswort.'),
  ], { effects: [{ startQuest: Q }] }),
  node('stand', [
    l(D, 'Bisher: zehn Credits, ein Knopf und ein Gummiband. Das Gummiband ist gut. Den Rest kannst du verbessern.'),
    l(J, 'Ich hab Hunger. Das ist kein Geschäftsbericht, das ist nur eine Information.'),
  ]),
  node('implantat', [
    nar('Freya holt ein Implantat aus einer Schuhschachtel: ein Fingergelenk mit grünem Lämpchen. Das Lämpchen flackert rot, wenn man es schüttelt.'),
    l(F, 'Ripper sagt, das hat einen Virus. Ripper sagt das bei jedem. Dann zahlt er zehn.'),
  ], {
    choices: [
      { text: '„Gebt mal her. Guckt genau hin, ich zeig’s euch.“', check: 'gc-53', next: 'kurs' },
      { text: '„Davon versteh ich zu wenig. Aber ich kenn Leute, die mehr zahlen.“' },
    ],
  }),
  node('kurs', [
    nar('Du schraubst das Gelenk auf, zeigst ihnen die Platine, die Prüfsumme, das kleine schwarze Ding, das da nicht hingehört.'),
    ich('Das hier ist ein echter Virus. Das hier daneben ist nur Dreck. Ripper erzählt euch bei beidem dasselbe.'),
    l(J, 'Das sieht aus wie eine verbrannte Rosine!', 'ueberrascht'),
    l(F, 'Ripper hat uns also systematisch belogen. Das ist Betrug nach Paragraph … ich such den noch raus. Aber es ist Betrug.', 'wut'),
    l(D, 'Ab jetzt prüfen wir selbst. Saubere Teile, fairer Preis. Und wenn Ripper meckert, verkaufen wir an Dante.', 'signatur'),
  ], { effects: [set('kinder_implantat_kurs'), { relation: 'ripper', delta: -20 }, msg('Die Kinder erkennen jetzt selbst, ob ein Implantat verseucht ist. Rippers Zehn-Credit-Trick ist geplatzt.')] }),
  node('detektor', [
    nar('Du drückst Daria den Metalldetektor in die Hand. Sie hält ihn wie ein Zepter.'),
    l(D, 'Ein … Metalldetektor. Ein echter. Mit Batterie.', 'ueberrascht'),
    l(J, 'An der Flutmauer im Schlick liegen Kronkorken, Schrauben, Münzen von früher! Das ist wie eine Schatzkiste ohne Deckel!', 'freude'),
    l(F, 'Eigentumsrechtlich ist Strandgut herrenlos. Ich habe nachgesehen. Dreimal.'),
  ], { effects: [{ take: 'metalldetektor' }, set('kinder_metalldetektor')] }),
  node('danach', [
    l(D, 'Umsatz verdreifacht. Ausgaben: ein Keks pro Fluch. Freya ist die eigentliche Gewinnerin.', 'freude'),
    l(F, 'Ich bin das Finanzamt. Das Finanzamt gewinnt immer.', 'signatur'),
  ]),
]);

// ---------------------------------------------------------------------------------------------- Oma Volt (gc-52)

const oma: DialogueDef = dlg('side-zehn-credits-oma', [
  node('start', [
    l('oma-volt', 'Kindchen! Du guckst, als wolltest du was. Alle gucken so. Was ist es diesmal?', 'neutral'),
  ], {
    choices: [
      { text: '„Die drei Kinder vom Schrottmarkt. Daria, Freya, Jakko. Die brauchen Arbeit.“', next: 'kinder' },
      tschuess('„Nichts, Oma. Nur Hallo.“'),
    ],
  }),
  node('kinder', [
    l('oma-volt', 'Die drei Rotznasen? Die klauen mir die Kronkorken von der Theke, wenn sie denken, ich guck nicht. Ich guck immer.', 'wut'),
    l('oma-volt', 'Arbeit, ja? Bei mir kommt nichts weg. Nicht mal Zeit.'),
  ], {
    choices: [
      {
        text: '„Genau deshalb. Die kennen jede Abkürzung, jeden Hinterhof. Mit dir als Chefin werden die ehrlich. Und du kriegst die schnellsten Boten der Unterstadt.“',
        check: 'gc-52', next: 'ja',
      },
      { text: '„Die würden schon spuren. Bitte?“', next: 'nein' },
      tschuess('„Vergiss es.“'),
    ],
  }),
  node('ja', [
    l('oma-volt', 'Hm. Hmmm. Schnellste Boten. Ehrlich. Mit MIR als Chefin.', 'neutral'),
    l('oma-volt', 'Na gut, Kindchen. Morgen um acht stehen die drei hier. Gewaschen. Ich zahle ehrlich, ich zahle pünktlich, und wer klaut, kriegt Kartoffelschälen bis zur Rente.', 'freude'),
    l('oma-volt', 'Und sag der Kleinen mit dem Klemmbrett: Ich verhandle nicht. Ich bin Oma Volt.'),
  ], { effects: [set('kinder_botendienst'), { relation: 'oma-volt', delta: 30 }], next: 'botendienst' }),
  // Eigener Knoten: Startet die Folgequest separat, damit eine fehlende Quest den Rest nicht zurückrollt.
  node('botendienst', [nar('Irgendwo am Schrottmarkt wird gleich ein Klemmbrett vor Freude in die Luft geworfen.')], {
    effects: [{ startQuest: 'pers-daria-botendienst' }],
  }),
  node('nein', [
    l('oma-volt', '„Bitte“ ist ein schönes Wort. Aber bezahlt hab ich noch nie mit Wörtern.'),
    l('oma-volt', 'Überzeug mich, Kindchen. Oder lass es bleiben. Es gibt noch andere Wege, Kindern zu helfen, als sie Oma Volt aufs Auge zu drücken.'),
  ]),
]);

// ---------------------------------------------------------------------------------------------- Hunter (♥4)

const hunter: DialogueDef = dlg('side-zehn-credits-hunter', [
  node('start', [
    nar('Hunter sitzt im Hinterzimmer über dem Kassenbuch. Er blickt nicht auf.'),
    l('hunter', 'Wenn das um Geld geht, nein. Wenn das um Geld geht, das ich verdiene, vielleicht.', 'neutral'),
  ], {
    choices: [
      { text: '„Die Kinder vom Schrottmarkt. Die hungern sich durch. Deine Küche steht leer.“', next: 'kueche' },
      tschuess('„Schon gut.“'),
    ],
  }),
  node('kueche', [
    nar('Hunter legt den Stift weg. Er nimmt die Sonnenbrille ab. Das macht er nicht oft.'),
    l('hunter', 'Daria, Freya, Jakko.', 'besorgt'),
    l('hunter', 'Ab morgen gibt’s jeden Mittag was aus der Clubküche. Warmes. Der Barkeeper kocht, wenn er nicht dichtet. Er dichtet beim Kochen. Das Essen wird trotzdem gut.'),
    ich('Und was kostet’s?'),
    l('hunter', 'Kinder haben keine Schulden.', 'signatur'),
    l('hunter', 'Und jetzt raus, bevor ich es mir anders überlege. Ich überleg es mir nicht anders. Raus trotzdem.'),
  ], { effects: [set('kinder_clubkueche'), { relation: 'hunter', delta: 20 }, { rep: 'crew-hunter', delta: 5 }] }),
]);

// ---------------------------------------------------------------------------------------------- Abschluss bei Babette

const essen: DialogueDef = dlg('side-zehn-credits-essen', [
  node('start', [
    nar('Babette hat die Bank vor der Garküche mit einer Tischdecke bedeckt. Eine echte Tischdecke, mit Blumen. Sie hat sie aus einer überfluteten Stadt mitgebracht und noch nie benutzt.'),
    l('babette-bao', 'Setzen. Alle. Wer nicht isst, kriegt Ärger. Wer zu schnell isst, kriegt auch Ärger. Jakko, das gilt für dich.', 'freude'),
    l(J, 'Das ist das beste Essen meines Lebens. Und ich hab noch nicht mal angefangen.', 'freude'),
    l(F, 'Ich erkläre dieses Essen hiermit für rechtskräftig.', 'freude'),
    l(D, 'Okay. Geschäftliches.', 'signatur'),
    nar('Daria schiebt dir zehn Credits über den Tisch. Eine Münze, gestapelt aus kleineren Münzen, mit Klebeband zusammengehalten.'),
    l(D, 'Vertrag ist Vertrag. Unser ganzes Kapital. Du hast es dir verdient.'),
  ], {
    choices: [
      { text: '„Steck das weg. Investiert’s in euren Laden.“', next: 'ablehnen' },
      { text: '„Vertrag ist Vertrag.“ (Die zehn Credits nehmen)', next: 'annehmen' },
      { text: '„Ich nehm’s nur, wenn ihr mir dafür die Fluchdose verzeiht.“', next: 'fluchdose' },
    ],
  }),
  node('ablehnen', [
    nar('Daria starrt dich an, als hättest du ihr gerade ein Haus geschenkt. Dann schnappt sie sich die Münze, bevor du es dir anders überlegst.'),
    l(D, 'Du bist ein miserabler Geschäftsmann. Das find ich gut.', 'freude'),
    l('babette-bao', 'Das hat jetzt die ganze Gasse gesehen, Schätzchen. Die Leute reden. Gut so.'),
  ], { effects: [{ rep: 'unterstadt', delta: 10 }], next: 'schluss' }),
  node('annehmen', [
    nar('Du steckst die zehn Credits ein. Jakko hört kurz auf zu kauen. Freya schreibt etwas in ihr Heft.'),
    l(F, 'Vermerk: Der Investor nimmt Geld von Kindern. Legal. Aber vermerkt.', 'neutral'),
    l('babette-bao', 'Hmpf. Na ja. Ein Mensch muss essen. Du isst trotzdem gratis bei mir, aber ich gucke dabei streng.'),
  ], { effects: [{ credits: 10 }, { rep: 'unterstadt', delta: -5 }], next: 'schluss' }),
  node('fluchdose', [
    l(F, 'Das Gericht nimmt keine Bestechung an.', 'wut'),
    l(F, '… Das Gericht nimmt aber einen Vergleich an. Die zehn Credits bleiben bei uns, die Schuld ist getilgt. Hammer.', 'signatur'),
    nar('Freya klopft mit einem Essstäbchen auf den Tisch.'),
  ], { effects: [{ rep: 'unterstadt', delta: 10 }], next: 'schluss' }),
  node('schluss', [
    nar('Später, die Teller leer, Jakko schläft mit dem Kopf auf der Tischdecke. Daria rechnet im Licht der Lichterketten ihre neue Woche durch. Freya hält deine Hand, ohne es zu merken.'),
    l(D, 'Danke. Sag das keinem. Das ist schlecht fürs Image.', 'verlegen'),
  ], { effects: [set('kinder_essen')] }),
]);

// ---------------------------------------------------------------------------------------------- Schlüsselszene

const bild: CutsceneDef = {
  id: 'side-zehn-credits-abend',
  title: 'Zehn Credits',
  beats: [
    { image: 'cut-side-zehn-credits-abend', caption: 'Schrottmarkt, Abend. Unter den Lichterketten sitzen drei Kinder mit vollen Bäuchen.', fade: 'in', hold: 1400 },
    { image: 'cut-side-zehn-credits-abend', caption: 'Zum ersten Mal seit Wochen rechnet Daria nicht, was sie morgen essen.', hold: 1400 },
    { image: 'cut-side-zehn-credits-abend', caption: 'Sie rechnet, was sie morgen verdienen. Das ist ein Unterschied wie Tag und Nacht. Und es ist Nacht. Und es ist schön.', fade: 'out', hold: 1600 },
  ],
};

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: { [stand.id]: stand, [oma.id]: oma, [hunter.id]: hunter, [essen.id]: essen },
  cutscenes: { [bild.id]: bild },
  mapAdditions: {
    schrottmarkt: {
      hotspots: [
        {
          id: 'q-zehn-credits-stand', at: 'botenstand', radius: 60, label: 'Die Kinder am Botenstand', kind: 'talk', dialogue: stand.id,
          when: all(PROBEZEIT, time('morgen', 'tag')),
        },
        {
          id: 'q-zehn-credits-essen', at: 'garkueche-bank', radius: 60, label: 'Gemeinsames Essen bei Babette', kind: 'talk', dialogue: essen.id,
          when: all(active(Q), EINNAHME, noFlag('kinder_essen'), time('tag', 'abend')),
        },
      ],
      onEnter: [
        { id: 'side-zehn-credits-abend', when: all(done(Q), time('abend', 'nacht')), cutscene: bild.id, once: true },
      ],
    },
    'neon-gasse': {
      hotspots: [
        {
          id: 'q-zehn-credits-oma', at: 'kiosk', radius: 60, label: 'Oma Volt: Arbeit für die Kinder', kind: 'talk', dialogue: oma.id,
          when: all(active(Q), noFlag('kinder_botendienst'), time('morgen', 'tag', 'abend')),
        },
      ],
    },
    'hv-hinterzimmer': {
      hotspots: [
        {
          id: 'q-zehn-credits-hunter', at: 'schreibtisch', radius: 60, label: 'Hunter: Essen für die Kinder', kind: 'talk', dialogue: hunter.id,
          when: all(active(Q), hearts('hunter', 4), noFlag('kinder_clubkueche')),
        },
      ],
    },
    flutmauer: {
      hotspots: [
        {
          id: 'q-zehn-credits-schlick', at: 'schlickstrand', radius: 56, label: 'Die Kinder mit dem Metalldetektor', kind: 'look', once: true,
          when: all(flag('kinder_metalldetektor'), time('tag')),
          lines: [
            nar('Drei kleine Gestalten im Schlick. Jakko schwenkt den Detektor wie ein Schwert, Freya protokolliert jeden Fund, Daria verhandelt bereits mit einer Möwe.'),
            l(J, 'EINE MÜNZE VON 2040! Die ist älter als Oma Volt!', 'freude'),
          ],
          effects: [{ relation: 'jakko', delta: 10 }],
        },
      ],
    },
  },
};

