// side-lumos-platte · „Lumos Platte“ (world.md §6.2 Nr. 28). DJ Lumo, neon-gasse (A) / high-voltage (N).
// DJ Lumos einzige Pressung seines Sets ist zerkratzt → Ersatz (Vinyl-Vincent: kaufen oder tauschen; Marlas Konvoi am
// Samstag; Opa Funk erst in Akt 2) oder gc-121 Kratzer mit Dantes Methode glätten → ein Abend an den Plattentellern
// (Tanz-Minispiel „Meisterklasse“ oder einfach feiern). [Dante ♥4]: Dante legt selbst auf, Raven kommt zum Tanzen.
import type { ContentPart } from '../../part';
import type { CutsceneDef, DialogueDef, QuestDef } from '../../../modules/contracts';
import { active, all, any, ch, dlg, flag, hearts, herz, inactive, item, l, n, noFlag, node, not, set } from './_q';

const Q = 'side-lumos-platte';
const LU = 'dj-lumo';
const ERSATZ = 'lumo_ersatz';
const GEGLAETTET = 'lumo_geglaettet';
const DANTE = 'lumo_dante_legt_auf';
const ABEND = 'lumo_abend';
const PLATTE_OK = any(flag(ERSATZ), flag(GEGLAETTET), flag(DANTE));
const SUCHE = all(active(Q), not(PLATTE_OK));

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: 'Lumos Platte',
  summary: 'DJ Lumos einzige Pressung seines Sets hat einen Kratzer quer durch den Drop. Ohne den Drop kein Set. Ohne Set kein Lumo.',
  giver: LU,
  act: 1,
  steps: [
    {
      id: 'platte', text: 'Besorg Lumo Ersatz für seine Platte – oder rette die alte.',
      done: PLATTE_OK,
    },
    {
      id: 'weg-vincent', optional: true, when: not(PLATTE_OK),
      text: 'Weg: Vinyl-Vincent am Schrottmarkt (tags, abends) hat vielleicht noch eine Pressung.',
      done: flag('lumo_weg_vincent'), marker: { map: 'schrottmarkt', at: [1180, 976] },
    },
    {
      id: 'weg-konvoi', optional: true, when: not(PLATTE_OK),
      text: 'Weg: Samstags morgens und tagsüber steht Marla Sands Karawane am Schrottmarkt. Der Konvoi handelt mit allem, was die Ödnis ausspuckt.',
      done: flag('lumo_weg_konvoi'), marker: { map: 'schrottmarkt', at: [982, 218] },
    },
    {
      id: 'weg-dante', optional: true, when: not(PLATTE_OK),
      text: 'Weg: Dante in seiner Werkstatt kennt eine Methode, Kratzer aus Vinyl zu bügeln. Angeblich.',
      done: flag(GEGLAETTET), marker: { map: 'dantes-werkstatt', at: [830, 285] },
    },
    {
      id: 'abend', text: 'Ein Abend an den Plattentellern: nachts im High Voltage am DJ-Pult.',
      when: PLATTE_OK, done: flag(ABEND), marker: { map: 'high-voltage', at: [915, 256] },
    },
  ],
  reward: {
    xp: 140, credits: 100, items: { 'schallplatte-08': 1 }, rep: { 'crew-hunter': 5 }, relations: { [LU]: 60 },
    effects: [set('tanz_stufe_3'), { message: 'Tanzfläche im High Voltage: Stufe 3 freigeschaltet.' }],
  },
};

// ---------------------------------------------------------------------------------------------- Auftakt

const start: DialogueDef = dlg('lumo-start', [
  node('start', [
    n('An der Ecke unter der kaputten Neonschrift sitzt ein Typ mit Kopfhörern um den Hals, Sonnenbrille in der Nacht und einer Plattentasche auf dem Schoß, die er hält wie ein Baby. Er wippt. Ohne Musik.'),
    l(LU, 'Hundertachtundzwanzig. Hörst du das? Nein? Ich auch nicht. Das ist das Problem.', 'trauer'),
    n('Er zieht eine Platte aus der Hülle. Schwarzes Vinyl, weißes Etikett, handschriftlich: „LUMO – NEONHERZ (Dubplate, einzige Pressung)“. Quer durch die Rillen: ein Kratzer wie ein Blitz.'),
    l(LU, 'Einzige Pressung. Mein ganzes Set baut auf dem Drop auf. Und irgendein Arsch hat sich im Club draufgesetzt. Mit Nieten am Hintern.', 'wut'),
  ], {
    choices: [
      ch('„Ich besorg dir Ersatz.“', 'ja'),
      ch('„Kann man das nicht reparieren?“', 'reparieren'),
      ch('„Dann leg halt was anderes auf.“', 'anderes'),
    ],
  }),
  node('anderes', [
    l(LU, 'Was anderes. WAS ANDERES. Sagst du einem Koch auch, er soll halt was anderes kochen, wenn du ihm das Salz klaust?', 'wut'),
    l(LU, 'Das ist meine Platte. Die hab ich gepresst, als ich noch an Musik geglaubt hab. Okay, ich glaub immer noch dran. Aber leiser.', 'trauer'),
  ], { next: 'ja' }),
  node('reparieren', [
    l(LU, 'Reparieren? Vinyl? Mann. Man sagt, Dante in den Lötgassen bügelt Kratzer mit einer Nadel, einem Föhn und einem Gebet raus. Aber ich geb meine Platte nicht aus der Hand. Außer an dich. Vielleicht.', 'ueberrascht'),
  ], { next: 'ja' }),
  node('ja', [
    l(LU, 'Vinyl-Vincent hat manchmal Dubplates aus alten Clubnächten. Oder der Konvoi von draußen, der kommt samstags. Die finden Platten in Bunkern. Echt.', 'neutral'),
    l(LU, 'Und wenn du die Platte rettest … Dann spielen wir sie. Im High Voltage. Ein Abend. Du und ich und die Tanzfläche. Abgemacht?', 'freude'),
    n('Er drückt dir die zerkratzte Platte in die Hand. Ganz vorsichtig. Er lässt sie erst los, als du sie wirklich hältst.'),
  ], { effects: [{ startQuest: Q }, set('lumo_platte_dabei')] }),
]);

// ---------------------------------------------------------------------------------------------- Ersatz

const vincent: DialogueDef = dlg('lumo-vincent', [
  node('start', [
    l('vinyl-vincent', 'Lumo? „Neonherz“? Die Dubplate? Die gibt es nur einmal. Hat er gesagt. Hat er gelogen.', 'signatur'),
    n('Vincent zieht eine Hülle aus der hintersten Kiste. Dasselbe Etikett. Andere Handschrift. „Neonherz – Testpressung 2. NICHT LUMO ZEIGEN“.'),
    l('vinyl-vincent', 'Hat mir sein Presswerk vor Jahren vertickt. Er wollte, dass es einzigartig bleibt. Ich wollte Geld. Wir hatten beide recht.', 'freude'),
  ], {
    choices: [
      ch('Kaufen (150 Cr).', 'kauf', { requires: { credits: 150 }, effects: [{ credits: -150 }] }),
      ch('Gegen eine Vinyl-Platte tauschen.', 'kauf', { requires: item('vinyl-platte'), effects: [{ take: 'vinyl-platte' }] }),
      ch('„Später.“'),
    ],
  }),
  node('kauf', [
    l('vinyl-vincent', 'Sag ihm, du hast sie im Müll gefunden. Dann hat er wenigstens eine schöne Geschichte.', 'signatur'),
  ], { effects: [set(ERSATZ), set('lumo_weg_vincent')] }),
]);

const konvoi: DialogueDef = dlg('lumo-konvoi', [
  node('start', [
    n('Marla Sands Karawanenwagen steht staubig zwischen den Marktständen. In einer Kiste: Wasserfilter, Glasscherben, Samen und ein Stapel Schallplatten, die nach Sand riechen.'),
    l('marla-sand', 'Platten? Die finden wir in Bunkern. Die Leute damals haben Musik vergraben wie Saatgut. Wer den Wind liest, findet auch die Lieder.', 'neutral'),
    n('Ganz unten im Stapel: eine Dubplate. Kein Etikett. Nur mit Filzstift: „Neonherz (Mitschnitt, Halle 9)“.'),
  ], {
    choices: [
      ch('Kaufen (100 Cr).', 'kauf', { requires: { credits: 100 }, effects: [{ credits: -100 }] }),
      ch('Weitergehen.'),
    ],
  }),
  node('kauf', [
    l('marla-sand', 'Gute Wahl. Musik, die man ausgräbt, klingt immer ein bisschen nach Zuhause.', 'freude'),
  ], { effects: [set(ERSATZ), set('lumo_weg_konvoi'), herz('marla-sand', 10)] }),
]);

const glaetten: DialogueDef = dlg('lumo-glaetten', [
  node('start', [
    n('Dantes Plattenspieler steht zwischen einem Röhrenverstärker und einem Teller Kekse. Daneben ein Föhn, eine Nadel und ein Zettel: „Methode D. – NICHT NACHMACHEN (außer ich bin dabei)“.'),
  ], {
    choices: [
      ch('Methode D.: Föhn auf lauwarm, Nadel im Takt, Rille für Rille den Kratzer glätten.', 'geschafft', { check: 'gc-121' }),
      ch('Die Platte wieder einpacken.'),
    ],
  }),
  node('geschafft', [
    n('Du föhnst, du ziehst, du fluchst. Dann legst du die Nadel auf. Ein Knacken. Noch ein Knacken. Und dann der Drop, sauber, fett, wie ein Hammer aus Samt.'),
    l('dante', 'HEILIGES KANONENROHR! Das ist meine Methode! Und es hat funktioniert! Das hat bei mir nur jedes dritte Mal funktioniert!', 'freude'),
  ], { effects: [set(GEGLAETTET), herz('dante', 10)] }),
]);

// ---------------------------------------------------------------------------------------------- Der Abend

const abend: DialogueDef = dlg('lumo-abend', [
  node('start', [
    n('Das DJ-Pult im High Voltage. Zwei Plattenteller, ein Mischpult mit mehr Knöpfen als ein Raumschiff, eine Kiste Volt-Limo als Fußstütze. DJ Lumo steht dahinter und reibt sich die Hände.'),
    l(LU, 'Und? Hast du sie?', 'besorgt'),
  ], {
    choices: [
      ch('Die gerettete Platte auflegen.', 'auflegen', { when: any(flag(ERSATZ), flag(GEGLAETTET)) }),
      ch('„Ich hab was Besseres. Ich hab Dante.“', 'dante', { tag: '[Dante ♥4]', requires: hearts('dante', 4), when: not(any(flag(ERSATZ), flag(GEGLAETTET))) }),
      ch('„Noch nicht.“'),
    ],
  }),
  node('auflegen', [
    n('Lumo nimmt die Platte, hält sie gegen das Licht, pustet einmal darüber und legt sie auf. Er senkt die Nadel. Das ganze Pult hält den Atem an.'),
    l(LU, 'Hundertachtundzwanzig.', 'freude'),
    n('Dann kommt der Drop. Der Bass rollt durch den Club wie eine Welle durch ein Hafenbecken. Hunter hinter der Bar nickt im Takt. Hunter nickt NIE im Takt.'),
    l(LU, 'Jetzt du. Tanzfläche. Ich spiel dir die Meisterklasse. Wenn du mithältst, bist du offiziell gefährlich.', 'signatur'),
  ], {
    choices: [
      ch('Auf die Tanzfläche: Meisterklasse!', undefined, {
        effects: [{
          minigame: 'akt-tanz', level: 3, key: 'lumo-meisterklasse', label: 'Meisterklasse mit DJ Lumo',
          win: [set(ABEND), set('lumo_meisterklasse'), herz(LU, 20), { message: 'Lumo zeigt mit beiden Händen auf dich. Der ganze Club jubelt. Du bist offiziell gefährlich.' }],
          lose: [set(ABEND), { message: 'Du stolperst über den Drop. Lumo grinst. „Hundertachtundzwanzig ist nicht jedermanns Tempo. Komm wieder.“' }],
        }],
      }),
      ch('Einfach mittanzen, ohne zu zählen.', 'feiern', { effects: [set(ABEND)] }),
    ],
  }),
  node('feiern', [
    n('Du tanzt. Falsch, laut, glücklich. Lumo dreht die Bässe hoch, bis die Gläser hinter der Bar mitklirren. Irgendwann tanzt sogar der Barkeeper. Heimlich, hinter dem Zapfhahn.'),
    l(LU, 'Siehst du? Musik ist kein Wettbewerb. Außer wenn sie einer ist.', 'freude'),
  ]),
  node('dante', [
    l(LU, 'DANTE? Der Dante? Der mit den Erstpressungen und dem Faxgerät?', 'ueberrascht'),
  ], { effects: [{ cutscene: 'lumo-dante-legt-auf' }, set(DANTE)] }),
]);

const danteLegtAuf: CutsceneDef = {
  id: 'lumo-dante-legt-auf',
  title: 'Dante legt auf',
  beats: [
    {
      image: 'black', fade: 'in',
      caption: 'Dante kommt mit zwei Plattenkoffern, einer Schutzbrille auf der Stirn und der Würde eines Mannes, der zehntausend Stunden geübt hat. Für Gitarre. Aber trotzdem.',
      lines: [l('dante', 'Lumo, mein Junge. Leih mir deine Teller. Heute spielt die Analogtechnik.', 'signatur')],
    },
    {
      image: 'black', sfx: 'switch',
      caption: 'Er legt Platten auf, die keiner kennt. Funk aus den Sechzigern, Synthpop aus den Achtzigern, eine Polka, die irgendwie funktioniert. Die Tanzfläche geht steil.',
      lines: [l(LU, 'Was IST das? Warum kann ich nicht aufhören zu tanzen?', 'freude')],
    },
    {
      image: 'black',
      caption: 'Dann legt Dante etwas Langsames auf. Und an der Bar stellt Raven ihr Glas ab. Sie geht über die Tanzfläche, ohne jemanden anzusehen, und bleibt vor dem DJ-Pult stehen.',
      lines: [
        l('raven', 'Ein Lied. Eins. Und wenn du mir auf den Fuß trittst, brech ich dir die Nadel.', 'signatur'),
        l('dante', 'Ich … trete … nie … Um Himmels Willen. Doch. Ich trete immer.', 'verlegen'),
      ],
    },
    {
      image: 'black', fade: 'out',
      caption: 'Lumo übernimmt die Teller. Dante tanzt mit Raven. Er tritt ihr zweimal auf den Fuß. Sie bricht ihm nicht die Nadel. Hunter hinter der Bar poliert ein Glas sehr, sehr lange.',
      lines: [l(LU, 'Alter. Das war das beste Set, das ich nie gespielt hab.', 'freude')],
    },
  ],
  effects: [set(ABEND), set('lumo_dante_raven_tanz'), herz('dante', 30), herz('raven', 20), { advanceTime: 90 }],
  gallery: false,
};

const LUMO_ZEIT = { time: 'abend' } as const;

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: { [start.id]: start, [vincent.id]: vincent, [konvoi.id]: konvoi, [glaetten.id]: glaetten, [abend.id]: abend },
  cutscenes: { [danteLegtAuf.id]: danteLegtAuf },
  mapAdditions: {
    'neon-gasse': {
      hotspots: [{
        id: 'lumo-ecke', at: 'lumos-ecke', label: 'DJ Lumo', kind: 'talk', dialogue: start.id,
        when: all(inactive(Q), LUMO_ZEIT),
      }],
    },
    'high-voltage': {
      hotspots: [
        {
          id: 'lumo-pult-start', at: 'dj-pult', label: 'DJ Lumo', kind: 'talk', dialogue: start.id,
          when: all(inactive(Q), { time: 'nacht' }),
        },
        {
          id: 'lumo-pult', at: 'dj-pult', label: 'An die Plattenteller', kind: 'talk', dialogue: abend.id,
          when: all(active(Q), noFlag(ABEND), { time: 'nacht' }),
        },
      ],
    },
    schrottmarkt: {
      hotspots: [
        {
          id: 'lumo-vincent', at: 'plattenstand-vincent', label: 'Vincent nach Lumos Dubplate fragen', kind: 'talk', dialogue: vincent.id,
          when: all(SUCHE, { time: ['tag', 'abend'] }),
        },
        {
          id: 'lumo-konvoi', at: 'karawanenstand', label: 'In der Plattenkiste des Konvois stöbern', kind: 'use', dialogue: konvoi.id,
          when: all(SUCHE, { weekday: 'sa' }, { time: ['morgen', 'tag'] }),
        },
      ],
    },
    'dantes-werkstatt': {
      hotspots: [{
        id: 'lumo-glaetten', at: 'plattenspieler', label: 'Lumos Platte retten', kind: 'use', dialogue: glaetten.id,
        when: SUCHE,
      }],
    },
  },
};

