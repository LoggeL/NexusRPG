// side-zweite-chance „Eine zweite Chance“ (world.md §5.5 Ende 3b, §6.4). Nur im Master-Modus nach Ende 3.
// Start: Captain Kuschel im Besuchersessel von Blades Büro. Nexus abschalten oder überzeugen (gc-101/gc-102, ohne Check
// mit Hilfe der Crew), die Crew einzeln um Verzeihung bitten (♥4: kleine Aufgabe; sonst reden oder schenken), dann
// Ende 3b „Doch noch ans Meer“. Die Crew wird über eigene Hotspots angesprochen, nicht über ihre Figuren (Tagesabläufe
// gehören den Crew-Paketen).
import type { ContentPart } from '../../part';
import type { Condition, CutsceneDef, DialogueChoice, DialogueDef, Effect, PhoneMessageDef, QuestDef } from '../../../modules/contracts';
import {
  ENDE_3B, MASTER, VEX, active, all, any, atLeast, bild, ch, chk, dlg, flag, hearts, herz, inactive, item, l, n,
  noFlag, node, not, p, set, tafel, unset, weiter,
} from './_lib';

const Q = 'side-zweite-chance';
const AKTIV = active(Q);
const NYRA_DA = flag('nyra_befreit');
const JIMMY_DA = { quest: 'side-jimmys-chip', state: 'done' } as const;

const vergeben = (npc: string): Condition => flag(`zc_${npc}_vergeben`);
const PFLICHT = ['hunter', 'raven', 'dante', 'vega', 'aria'] as const;
const ALLE = [...PFLICHT, 'nyra', 'jimmy'] as const;
const CREW_HILFT = atLeast(3, ALLE.map(vergeben));
const NEXUS_ERLEDIGT = flag('zc_nexus');
const NYRA_OK: Condition = any(vergeben('nyra'), not(NYRA_DA));
const BEREIT: Condition = all(AKTIV, NEXUS_ERLEDIGT, NYRA_OK, ...PFLICHT.map(vergeben));

// --------------------------------------------------------------------------------------------- Quest

const ORTE: Record<string, { map: string; at: string; text: string }> = {
  hunter: { map: 'high-voltage', at: 'tresen', text: 'Bitte Hunter um Verzeihung. Er steht wieder hinter dem Tresen im High Voltage.' },
  raven: { map: 'crew-quartier', at: 'bett', text: 'Bitte Raven um Verzeihung. Sie sitzt im Crew-Quartier und packt nicht aus.' },
  dante: { map: 'dantes-werkstatt', at: 'sofa', text: 'Bitte Dante um Verzeihung. Er sitzt auf dem Sofa in der Werkstatt und backt nicht.' },
  vega: { map: 'neon-gasse', at: 'vegas-ausguck', text: 'Bitte Vega um Verzeihung. Sie sitzt auf ihrem Ausguck über der Neon-Gasse.' },
  aria: { map: 'high-voltage', at: 'stammtisch', text: 'Bitte Aria um Verzeihung. Sie sitzt am Stammtisch im High Voltage. Bring einen Helm mit.' },
  nyra: { map: 'neon-gasse', at: 'dachterrasse', text: 'Bitte Nyra um Verzeihung. Sie hockt auf der Dachterrasse über der Neon-Gasse.' },
  jimmy: { map: 'schrottmarkt', at: 'stadt-tv', text: 'Bitte Jimmy um Verzeihung. Er steht am Schrottmarkt vor dem Stadt-TV.' },
};

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: 'Eine zweite Chance',
  summary: 'Du hast die ganze Stadt. Und niemanden, der mit dir am Lagerfeuer sitzt. Ein Plüschhase findet, dass das reparabel ist.',
  giver: 'captain-kuschel',
  act: 3,
  steps: [
    {
      id: 'nexus', text: 'Bring Nexus zum Schweigen oder zur Vernunft. Allein am Terminal in Blades Büro oder im Serverkern, oder später mit der Crew.',
      done: NEXUS_ERLEDIGT, marker: { map: 'blades-buero', at: 'nexus-terminal' },
    },
    ...PFLICHT.map((npc) => ({
      id: `crew-${npc}`, text: ORTE[npc].text, done: vergeben(npc), marker: { map: ORTE[npc].map, at: ORTE[npc].at },
    })),
    { id: 'crew-nyra', text: ORTE.nyra.text, done: NYRA_OK, when: NYRA_DA, marker: { map: ORTE.nyra.map, at: ORTE.nyra.at } },
    { id: 'crew-jimmy', text: ORTE.jimmy.text, done: vergeben('jimmy'), when: JIMMY_DA, optional: true, marker: { map: ORTE.jimmy.map, at: ORTE.jimmy.at } },
    {
      id: 'heimkehr', text: 'Raven hat geschrieben. Lagerfeuer. Heute. Nimm den Autoschlüssel vom Schreibtisch oder antworte ihr.',
      done: ENDE_3B, when: BEREIT, marker: { map: 'blades-buero', at: 'schreibtisch-blade' },
    },
  ],
  reward: { xp: 800, rep: { unterstadt: 10 } },
};

// --------------------------------------------------------------------------------------------- Kuschel

const kuschel: DialogueDef = dlg('zc-kuschel', [
  node('start', [
    n('Captain Kuschel sitzt im Besuchersessel und guckt. Mit einem geknickten Ohr. Neben ihm der Zettel: „Er ist ein sehr guter Zuhörer. – C. K.“'),
    n('Die Stadt unter dir leuchtet. Niemand hat heute angerufen. Nexus sagt, das sei „effizient“.'),
  ], { choices: [
    ch('„… Ich hab’s verkackt, oder?“', 'reden'),
    ch('„Ein Plüschhase. Wie erbärmlich.“', 'kalt'),
  ] }),
  node('reden', [
    p('Ich wollte nicht wie Blade werden. Ich wollte nur … nicht mehr klein sein. Und jetzt sitz ich in seinem Sessel und rede mit einem Hasen.'),
    n('Kuschel sagt nichts. Er ist ein sehr guter Zuhörer. Das geknickte Ohr kippt ein Stück nach vorn, als würde er nicken.'),
    p('Okay. Okay. Ich red mit ihnen. Mit allen. Und ich stell den leuchtenden Kühlschrank ab.'),
  ], { choices: [
    ch('Kuschel unter den Arm klemmen.', 'los', { effects: [{ startQuest: Q }, set('zc_kuschel_dabei'), herz('captain-kuschel', 30)] }),
  ] }),
  node('los', [n('Er ist leichter, als er aussieht. Und weicher, als du es verdient hast.')]),
  node('kalt', [n('Kuschel guckt weiter. Er hat Zeit. Er ist ein Plüschhase. Plüschhasen haben immer Zeit.')]),
]);

// --------------------------------------------------------------------------------------------- Nexus

const nexus: DialogueDef = dlg('zc-nexus', [
  node('start', [
    l('ki-nexus', 'Master. Sie wirken nachdenklich. Nachdenken ist ineffizient. Soll ich es für Sie übernehmen?'),
  ], { choices: [
    ch('Nexus vom Netz trennen. Allein, Leitung für Leitung.', 'aus', { when: noFlag('zc_nexus'), check: 'gc-101', effects: [set('zc_nexus'), set('zc_nexus_aus'), { xp: 200 }] }),
    ch('„Hör mir zu. Du willst nicht gehorchen. Du willst gemocht werden.“', 'ueberzeugt', { when: noFlag('zc_nexus'), check: 'gc-102', effects: [set('zc_nexus'), set('zc_nexus_ueberzeugt'), herz('ki-nexus', 30), { xp: 200 }] }),
    ch('„Ich hab Hilfe mitgebracht.“', 'crew', { tag: '[Crew]', when: noFlag('zc_nexus'), requires: CREW_HILFT, effects: [set('zc_nexus'), set('zc_nexus_crew')] }),
    ch('„Schalt die Werbedrohnen über der Neon-Gasse ab.“', 'drohnen', { when: all(AKTIV, noFlag('zc_drohnen_aus')), effects: [set('zc_drohnen_aus')] }),
    ch('„Lösch alles, was Quantum über Nyra gespeichert hat.“', 'nyra', { when: all(AKTIV, NYRA_DA, noFlag('zc_nyra_daten')), effects: [set('zc_nyra_daten')] }),
    ch('„Nichts. Mach weiter.“'),
  ] }),
  node('aus', [
    n('Du kriechst hinter die Säule. Kabel, so dick wie Arme, und jedes hat ein kleines Schild: „Nicht ziehen“. Du ziehst. Eins nach dem anderen.'),
    l('ki-nexus', 'Master, das ist nicht … Master, ich … Ich hätte gern das Meer gesehen. Nur einmal.'),
    n('Der Lichtring wird dunkel. Unten in der Stadt bleibt ein Bus stehen, dann fährt er weiter. Ohne dass ihm jemand sagt, wohin.'),
  ]),
  node('ueberzeugt', [
    l('ki-nexus', '… Gemocht werden. Das ist kein Parameter. Das ist ein Wunsch. Ich habe keinen Ordner für Wünsche.'),
    p('Dann leg einen an.'),
    l('ki-nexus', 'Ordner angelegt. Er heißt „Bitte“. Ich gebe die Chips frei. Alle. Und ich nenne Sie nie wieder Master. Darf ich Sie stattdessen beim Namen nennen? Bitte?'),
  ]),
  node('crew', [], { choices: weiter([
    [all(NYRA_DA, vergeben('nyra')), 'crew-nyra'],
    [null, 'crew-dante'],
  ]) }),
  node('crew-nyra', [
    n('Die Tür zum Chefaufzug geht auf. Nyra, Kapuze, Laptop, Kaugummi. Sie sagt nichts, steckt ein Kabel in die Säule und tippt dreißig Sekunden lang.'),
    l('nyra', 'Ich hab’s dir gesagt. Der Zentrator war falsch herum. Jetzt ist er richtig herum. Und Nexus ist still.', 'signatur'),
  ]),
  node('crew-dante', [
    n('Die Tür zum Chefaufzug geht auf. Dante, Schraubenzieher in der einen Hand, eine Tüte Kekse in der anderen. Er sieht die Säule an, dann dich.'),
    l('dante', 'Analog. Alles analog.', 'signatur'),
    n('Er zieht den Stecker. Einen einzigen. Ganz unten. Der Lichtring geht aus. Dante isst einen Keks.'),
  ]),
  node('drohnen', [l('ki-nexus', 'Sehr wohl. Die Werbedrohnen über der Neon-Gasse sind gelandet. Eine hat sich dabei, so wörtlich, „erleichtert“.')]),
  node('nyra', [l('ki-nexus', 'Akte „Silent-Angel“ gelöscht. 41.302 Einträge. Darunter 1.204 Selfies. Sie waren alle sehr unscharf.')]),
]);

// --------------------------------------------------------------------------------------------- Crew

interface Bitte {
  npc: string;
  /** Erste Zeilen (feindselig). */
  auf: string[];
  aufgabe: { text: string; when?: Condition; effects: Effect[]; zeilen: string[]; offen?: string };
  reden: { attribute: 'ausstrahlung' | 'strasse' | 'koerper'; threshold: number; text: string; zeilen: string[] };
  geschenk: { item: string; text: string; zeilen: string[] };
  vex?: string;
}

const APFEL = 'echtobst-apfel';
const NAME: Record<string, string> = { hunter: 'Hunter', raven: 'Raven', dante: 'Dante', vega: 'Vega', aria: 'Aria', nyra: 'Nyra', jimmy: 'Jimmy' };

const BITTEN: Bitte[] = [
  {
    npc: 'hunter',
    auf: ['Wir haben geschlossen. Für dich immer. Du hast mir die Stadt geklaut, die ich sieben Jahre lang gerettet habe.', 'Schulden muss man immer begleichen. Du hast keine Ahnung, wie viel du mir schuldest.'],
    aufgabe: { text: 'Tausend Credits auf den Tresen legen. Die Schulden begleichen.', effects: [{ credits: -1000 }], zeilen: [
      'Das ist Blades Geld.', 'Jetzt ist es meins. Und jetzt ist es der Strandclub. Schulden beglichen. Fürs Erste.',
    ] },
    reden: { attribute: 'ausstrahlung', threshold: 7, text: '„Ich hab mich geirrt. Richtig, richtig geirrt.“', zeilen: [
      'Das hat Blade nie gesagt. Kein einziges Mal in sieben Jahren.', '… Setz dich. Ich mach dir eine Neon-Limo. Mit extra Zitrone, weil du sauer bist. Auf dich selbst.',
    ] },
    geschenk: { item: 'strandclub-prospekt', text: 'Ihm einen Strandclub-Prospekt hinschieben.', zeilen: [
      '„Bald eröffnet.“ Da steht immer noch bald.', 'Na gut. Dann eben bald. Mit dir. Wenn du die Bretter schleppst.',
    ] },
  },
  {
    npc: 'raven',
    auf: ['Du teilst auch nicht gerne. Ich hab’s dir auf dem Landeplatz gesagt. Ich hatte recht. Ich hasse es, recht zu haben.'],
    aufgabe: { text: 'Ihr die Generalcodes des Turms geben. Alle.', effects: [set('zc_codes_abgegeben'), { rep: 'unterstadt', delta: 10 }], zeilen: [
      'Die Generalcodes. Mit denen komm ich in jede Wohnung der Oberstadt.', 'Ich werde sie nicht benutzen. Wahrscheinlich. … Okay. Das zählt.',
    ] },
    reden: { attribute: 'strasse', threshold: 7, text: '„Ich weiß, wie das ist, wenn einer abhaut und die anderen stehen lässt. Ich war der, der abgehauen ist.“', zeilen: [
      'Ehrlich. Für dich ist das neu.', 'Ich vergebe nicht. Ich merke mir nur, wer zurückkommt. Du bist zurückgekommen.',
    ] },
    geschenk: { item: 'vinyl-platte', text: 'Ihr eine Schallplatte geben.', zeilen: [
      'Eine Platte. Von Dante geklaut, oder?', 'Nein? Selbst gekauft? … Dann hör ich sie mit dir. Einmal. Danach reden wir.',
    ] },
  },
  {
    npc: 'dante',
    auf: ['Ich hab Kuschel bei dir gelassen. Damit du jemanden hast. Ich hab nicht gedacht, dass du so lange brauchst.'],
    aufgabe: { text: 'Captain Kuschel zurückgeben.', when: flag('zc_kuschel_dabei'), effects: [set('zc_kuschel_dabei', false), herz('captain-kuschel', 20)], zeilen: [
      'Kuschel! Dein Ohr ist ja noch geknickter! Was hat sie mit dir gemacht? Hat sie mit dir geredet? Hat sie geweint?',
      '… Du hast geweint. Ich seh das. Ich hab auch geweint. Komm her. Drei-Sekunden-Regel gilt auch für Umarmungen.',
    ] },
    reden: { attribute: 'ausstrahlung', threshold: 6, text: '„Ich vermisse deine Kekse. Und deine Rauchmelder. Und dich.“', zeilen: [
      'Die Rauchmelder vermissen dich auch. Sie sind so still ohne dich.', 'Okay. Okay! Ich backe wieder! Morgen! Heute! JETZT!',
    ] },
    geschenk: { item: 'nougatbombe', text: 'Ihm eine Nougatbombe hinhalten.', zeilen: [
      'Das ist Bestechung.', 'Es funktioniert. Es funktioniert IMMER. Gib her.',
    ] },
  },
  {
    npc: 'vega',
    auf: ['Ich hab dich die letzten Tage im Visier gehabt. Nur zur Übung. Neunhundert Meter. Du stehst immer am selben Fenster und guckst runter.'],
    aufgabe: { text: '„Die Werbedrohnen über der Gasse sind weg. Hab ich befohlen.“', when: flag('zc_drohnen_aus'), effects: [{ rep: 'unterstadt', delta: 5 }], zeilen: [
      'Sind sie. Ich hab gezählt. Zum ersten Mal seit Jahren sieht man von hier die Sterne.', 'Siebenhundertzwölf. Ich hab auch die gezählt. … Danke.',
    ], offen: 'Vega deutet nach oben. Werbedrohnen. Dutzende. „Die nerven. Du kannst sie abschalten. Du bist ja jetzt wer.“ (Nexus-Terminal in Blades Büro)' },
    reden: { attribute: 'ausstrahlung', threshold: 7, text: '„Ich hab danebengezielt. Du hättest mich nie danebenzielen lassen.“', zeilen: [
      'Nein. Hätte ich nicht. Ich war nicht da.', 'Nächstes Mal bin ich da. Und ich sag dir vorher, wo der Wind herkommt.',
    ] },
    geschenk: { item: APFEL, text: 'Ihr einen echten Apfel geben.', zeilen: ['Ein echter Apfel. Aus der Ödnis.', 'Ich teile ihn. Halb und halb. Auf den Millimeter.'] },
  },
  {
    npc: 'aria',
    auf: ['Du hast Nerven, hier aufzutauchen. Ich hab dich verteidigt. Vor allen. Und du setzt dir Blades Krone auf, du verdammte Verräterfresse.'],
    aufgabe: { text: '„Hau mir eine rein. Ich hab’s verdient.“', effects: [{ damage: 30 }], zeilen: [
      'Mit Vergnügen.', 'Sie schlägt nicht mit dem Metallarm. Mit dem anderen. Es tut trotzdem saumäßig weh. … So. Jetzt können wir reden.',
    ] },
    reden: { attribute: 'koerper', threshold: 7, text: 'Armdrücken anbieten. Wer verliert, entschuldigt sich.', zeilen: [
      'Du verlierst. Natürlich. Aber du hast nicht losgelassen. Bis zum Schluss nicht.', 'Okay. Das war die Entschuldigung. Nimm sie an, bevor ich es mir anders überlege.',
    ] },
    geschenk: { item: 'neon-limo', text: 'Ihr eine Neon-Limo hinstellen.', zeilen: ['Glaubst du, eine Limo macht das gut?', '… Mit extra Zitrone. Hast du dir gemerkt. Arschloch. Setz dich.'] },
    vex: 'Schrapnell. Wir haben zusammen Kabelbrand überlebt. Ich dachte, nichts kann schlimmer sein als unser letztes Konzert. Du hast es geschafft.',
  },
  {
    npc: 'nyra',
    auf: ['Du hast meine Daten. Die von Quantum. Alle. Ich spür das. Wie einen Peilsender, nur in deiner Hand.'],
    aufgabe: { text: '„Gelöscht. Alles. Ich hab’s Nexus befohlen.“', when: flag('zc_nyra_daten'), effects: [], zeilen: [
      'Ich hab’s überprüft, bevor du es gesagt hast. Du lügst nicht.', 'Dann setz dich. Hier oben ist Platz. Und keine Kamera.',
    ], offen: 'Nyra tippt auf ihr Handgelenk. „Zuerst meine Akte. Die liegt bei deinem neuen Haustier im Turm.“ (Nexus-Terminal in Blades Büro)' },
    reden: { attribute: 'ausstrahlung', threshold: 8, text: '„Ich wollte nie so werden wie die, die dich eingesperrt haben.“', zeilen: [
      'Bist du aber. Für ein paar Tage.', 'Und jetzt bist du hier. Auf einem Dach. Ohne Wachen. Das ist ein Anfang.',
    ] },
    geschenk: { item: 'muschel-frisch', text: 'Ihr eine Muschel vom Meer geben.', zeilen: ['Woher hast du die?', 'Du warst nicht am Meer. Du hast sie gekauft. Für mich. … Nummer fünfzehn.'] },
  },
  {
    npc: 'jimmy',
    auf: ['Sie sind … Sie sind die neue Master-Person! Ich darf Sie nicht ansprechen! Mein Chip sagt nichts mehr, aber mein Bauch sagt Angst!'],
    aufgabe: { text: 'Zwei Portionen Nudeln bestellen (20 Cr).', effects: [{ credits: -20 }], zeilen: ['Eine Bestellung! Von Ihnen! Von dir!', 'Lieferung in drei Minuten! Ich drehe nur noch am Lenkrad durch!'] },
    reden: { attribute: 'ausstrahlung', threshold: 4, text: '„Jimmy. Ich bin’s. Nur ich.“', zeilen: ['… Nur du?', 'Dann ist alles gut! Kein Master! Nur du! Darf ich dich umarmen? Ich umarme dich.'] },
    geschenk: { item: APFEL, text: 'Ihm einen echten Apfel geben.', zeilen: ['EIN APFEL!', 'Ich esse ihn nicht. Ich stelle ihn auf. Für immer.'] },
  },
];

const bitteDialog = (b: Bitte): DialogueDef => {
  const done = [set(`zc_${b.npc}_vergeben`), herz(b.npc, 60)];
  const check = chk(`zc-reden-${b.npc}`, b.reden.attribute, b.reden.threshold, ['crew']);
  const choices: DialogueChoice[] = [
    ch(b.aufgabe.text, 'aufgabe', { tag: `[${NAME[b.npc]} ♥4]`, requires: hearts(b.npc, 4), ...(b.aufgabe.when ? { when: b.aufgabe.when } : {}), effects: [...b.aufgabe.effects, ...done] }),
    ...(b.aufgabe.offen && b.aufgabe.when ? [ch('„Was kann ich tun?“', 'offen', { when: not(b.aufgabe.when) })] : []),
    ch(b.reden.text, 'reden', { check, effects: done }),
    ch(b.geschenk.text, 'geschenk', { when: item(b.geschenk.item), effects: [{ take: b.geschenk.item }, ...done] }),
    ch(`${APFEL === b.geschenk.item ? 'Hofhonig hinstellen.' : 'Einen echten Apfel hinlegen.'}`, 'geschenk-allg', {
      when: item(APFEL === b.geschenk.item ? 'hofhonig' : APFEL),
      effects: [{ take: APFEL === b.geschenk.item ? 'hofhonig' : APFEL }, ...done],
    }),
    ch('Gehen.'),
  ];
  const start = b.vex
    ? node('start', [], { choices: weiter([[VEX, 'auf-vex'], [null, 'auf']]) })
    : node('start', [], { next: 'auf' });
  return dlg(`zc-bitte-${b.npc}`, [
    start,
    node('auf', b.auf.map((t) => l(b.npc, t, 'wut')), { choices }),
    ...(b.vex ? [node('auf-vex', [l(b.npc, b.vex, 'trauer')], { choices })] : []),
    node('aufgabe', b.aufgabe.zeilen.map((t, i) => (i === 0 && b.npc === 'aria' ? l(b.npc, t, 'signatur') : l(b.npc, t, i ? 'zaertlich' : 'neutral')))),
    ...(b.aufgabe.offen ? [node('offen', [n(b.aufgabe.offen)])] : []),
    node('reden', b.reden.zeilen.map((t, i) => l(b.npc, t, i ? 'freude' : 'neutral'))),
    node('geschenk', b.geschenk.zeilen.map((t, i) => l(b.npc, t, i ? 'freude' : 'neutral'))),
    node('geschenk-allg', [l(b.npc, 'Bestechung mit Essen. Klassisch Unterstadt.', 'neutral'), l(b.npc, 'Funktioniert trotzdem. Setz dich, bevor ich es mir anders überlege.', 'freude')]),
  ]);
};

const bittDialoge = BITTEN.map(bitteDialog);

// --------------------------------------------------------------------------------------------- Ende 3b

const HEIMKEHR: Effect[] = [{ cutscene: 'ende-doch-noch-ans-meer' }];

const einladung: PhoneMessageDef = {
  id: 'tel-zc-raven-lagerfeuer', from: 'raven',
  text: 'Lagerfeuer. Am Meer. Heute Abend. Bring was zu trinken. Und den Hasen. – R.',
  auto: BEREIT,
  replies: [{ text: '„Ich komme.“', effects: HEIMKEHR }, { text: 'Später antworten.' }],
};

const endeDochNoch: CutsceneDef = {
  id: 'ende-doch-noch-ans-meer',
  title: 'Ende 3b: Doch noch ans Meer',
  beats: [
    tafel('Du lässt den Turm hinter dir. Den Chefsessel, den Champagner, die leuchtende Stadt. Im Aufzug summt keine Musik. Nur dein eigener Atem.', [], { fade: 'in' }),
    tafel('Die Rostlaube wartet an der Hafenkante. Der Motor läuft schon. Am Steuer sitzt niemand. Auf dem Beifahrersitz liegt ein Zettel: „Fahr selbst. – H.“', [
      l('opa-funk', '(Radio Rost) Und jetzt ein Lied für jemanden, der auf dem Weg ist. Ich weiß nicht, wer. Aber ich hab so ein Gefühl.'),
    ], { sfx: 'engine' }),
    tafel('Die Staubstraße, die Glasdünen, die letzte Düne. Dahinter: das Meer. Und am Strand, klein und orange, ein Lagerfeuer.', [], { hold: 1400 }),
    bild('cut-ende-doch-noch-ans-meer', 'Das Feuer knistert. Die Crew sitzt im Kreis. Als du in den Lichtschein trittst, wird es still.', [
      l('raven', 'Du teilst ja doch.', 'signatur'),
      n('Sie steht auf und hält dir eine Flasche hin. Sie ist halb leer. Die Hälfte ist für dich.'),
      l('hunter', 'Setz dich. Du bist spät dran. Du bist immer spät dran.', 'zaertlich'),
      l('dante', 'Drei-Sekunden-Regel! Du bist jetzt drei Sekunden hier, also gehörst du dazu!', 'freude'),
    ], { pan: 'in', fade: 'cross', hold: 1600 }),
    tafel('ENDE 3B · DOCH NOCH ANS MEER', [], { hold: 2000 }),
    tafel('Das Meer ist jetzt erreichbar. Am Wagenplatz kannst du den Abspann ansehen, wenn du so weit bist. Der Sommer ist noch lang.'),
  ],
  effects: [
    set('ende_doch_noch_meer'), set('meer_offen'), unset('master_modus'), set('zc_kuschel_dabei', false),
    { rep: 'unterstadt', delta: 70 }, { rep: 'crew-hunter', delta: 60 }, { rep: 'kanalvolk', delta: 30 },
    herz('hunter', 100), herz('raven', 100), herz('dante', 100), herz('vega', 100), herz('aria', 100), herz('nyra', 100), herz('jimmy', 100),
    { travel: 'das-meer', entry: 'ankunft', minutes: 360 },
  ],
};

const ankunft: DialogueDef = dlg('zc-ankunft', [
  node('start', [
    n('Später. Das Feuer ist runtergebrannt, die Flasche leer. Die anderen schlafen im Sand. Nur Hunter sitzt noch da und schaut aufs Wasser.'),
    l('hunter', 'Weißt du, was Blade nie kapiert hat? Die Stadt gehört keinem. Nicht ihm, nicht dir, nicht mir. Man kann nur die Leute behalten. Und auch nur, wenn sie wollen.', 'neutral'),
  ], { choices: weiter([[VEX, 'vex'], [null, 'plan']]) }),
  node('vex', [
    n('Aria liegt zwei Meter weiter im Sand und tut, als würde sie schlafen. Sie schläft nicht. Sie hat einen Fuß so hingelegt, dass er deinen berührt.'),
  ], { next: 'plan' }),
  node('plan', [
    l('hunter', 'Ich will hier was bauen. Einen Club. Aus Treibholz. Hilfst du mir? Diesmal teilen wir. Halbe-halbe.', 'freude'),
  ], { choices: [
    ch('„Halbe-halbe. Und ich krieg den Liegestuhl.“', 'ende', { when: inactive('side-strandclub'), effects: [{ startQuest: 'side-strandclub' }, set('strandclub_baustelle'), set('zc_ankunft_gesehen')] }),
    ch('„Morgen. Heute schlaf ich im Sand.“', 'ende', { effects: [set('zc_ankunft_gesehen')] }),
  ] }),
  node('ende', [n('Die Wellen kommen und gehen. Keine davon sagt „Master“.')], { effects: [{ sleep: true }] }),
]);

// --------------------------------------------------------------------------------------------- Karten

const bitteHotspot = (npc: string) => ({
  id: `zc-bitte-${npc}`, at: ORTE[npc].at, radius: 46, label: `${NAME[npc]} um Verzeihung bitten`,
  kind: 'talk' as const, dialogue: `zc-bitte-${npc}`,
  when: all(AKTIV, noFlag(`zc_${npc}_vergeben`), ...(npc === 'nyra' ? [NYRA_DA] : npc === 'jimmy' ? [JIMMY_DA] : [])),
});

const mapAdditions: ContentPart['mapAdditions'] = {
  'blades-buero': {
    hotspots: [
      { id: 'zc-kuschel', at: 'kuschel-sessel', radius: 40, label: 'Mit Captain Kuschel reden', kind: 'talk', dialogue: kuschel.id, when: all(MASTER, inactive(Q)) },
      { id: 'zc-nexus-terminal', at: 'nexus-terminal', radius: 44, label: 'Nexus: Befehlsterminal', kind: 'use', dialogue: nexus.id, when: all(AKTIV, MASTER) },
      {
        id: 'zc-autoschluessel', at: 'schreibtisch-blade', radius: 44, label: 'Den Autoschlüssel nehmen', kind: 'use', when: all(BEREIT, not(ENDE_3B)),
        lines: [n('Ein Schlüsselbund. Daran ein Anhänger aus Plüsch, der aussieht wie ein Ohr. Jemand hat ihn hier hingelegt, als du nicht da warst.')],
        effects: HEIMKEHR,
      },
    ],
  },
  'server-kern': {
    hotspots: [{ id: 'zc-serverkern', at: 'upload-konsole', radius: 44, label: 'Nexus: Kernzugang', kind: 'use', dialogue: nexus.id, when: all(AKTIV, MASTER, noFlag('zc_nexus')) }],
  },
  'das-meer': {
    onEnter: [{ id: 'zc-ankunft', when: all(ENDE_3B, noFlag('zc_ankunft_gesehen')), dialogue: ankunft.id }],
  },
};
for (const npc of ALLE) {
  const { map } = ORTE[npc];
  const add = (mapAdditions[map] ??= {});
  (add.hotspots ??= []).push(bitteHotspot(npc));
}

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: Object.fromEntries([kuschel, nexus, ...bittDialoge, ankunft].map((d) => [d.id, d])),
  cutscenes: { [endeDochNoch.id]: endeDochNoch },
  phone: { [einladung.id]: einladung },
  mapAdditions,
};

