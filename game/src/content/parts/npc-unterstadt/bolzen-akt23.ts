// Bolzen in Akt 2, Akt 3 und im Nachspiel (world.md §4.4, act23.json he-bolzen-8/10). Nur Freundschaft (Haustier).
// Kein eigener Inhaltsteil: bolzen.ts holt Menü-Ergänzung, Tagesfunde, Phasen, Fähigkeiten und he-8/10 von hier.
// Tagesfunde ab Akt 2 über `heute_bolzen_fund` (Tagesflag, jeden Morgen frisch), Wochentag bestimmt den Fund;
// mit Bolzens Marke (♥10) an Festtagen seltene Funde.
import type { ContentPart } from '../../part';
import type { AbilityDef, Condition, DialogueDef, ScheduleEntry, TalkDef, Weekday } from '../../../modules/contracts';
import {
  type Menue, AKT2, AKT2_NUR, AKT3_NACHT, ARIA_GECHIPPT, COUNTDOWN_DONE, ENDE_3B, ENDE_MEER, ENDE_NEXUS, EPILOG_FREI, MASTER,
  NYRA_WEG, PARTY_VORB, alle, dialog, erz, flag, herz, knoten, nicht, phasen, pruefung, rede, sprecher, tagesgespraech,
} from './_lib';

const ID = 'bolzen';
const B = sprecher(ID);
const V = sprecher('vega');
const D = sprecher('dante');

// ---------------------------------------------------------------------------------------------- Fähigkeiten

/** Ab Akt 2: einmal pro Kampf Bellen (world.md §4.4 „1× pro Kampf Bellen“). */
export const BELLEN: AbilityDef = {
  id: 'bolzen-bellen', name: 'Bellen',
  description: 'Bolzen bellt mit dem alten Quantum-Alarmlautsprecher. Gegner im Umkreis zucken zusammen (Betäubt, 1 Runde).',
  kind: 'sozial', ap: 1, target: 'area', range: 0, radius: 2, status: { id: 'betaeubt', turns: 1, chance: 0.7 }, uses: 1,
};

/** Ab ♥8: Schnüffeln – Bolzen riecht, wo es wehtut. */
export const SCHNUEFFELN: AbilityDef = {
  id: 'bolzen-schnueffeln', name: 'Schnüffeln',
  description: 'Bolzen schnüffelt am Gegner und knurrt auf die Schwachstelle. Ziel ist Markiert (2 Runden).',
  kind: 'trick', ap: 1, target: 'enemy', range: 6, status: { id: 'markiert', turns: 2 }, cooldown: 3,
};

// ---------------------------------------------------------------------------------------------- Menü (ab Akt 2)

export const MENUE_23: Menue = {
  choices: [
    {
      text: 'Bolzen, riechst du Chips?', next: 'b23-chips',
      when: alle(AKT2_NUR, { notFlag: 'bolzen_23_chips' }), effects: [flag('bolzen_23_chips'), herz(ID, 10)],
    },
  ],
  nodes: [
    knoten('b23-chips', [
      erz('Bolzen schnüffelt an deiner Hand, an deinem Nacken, an deinem Ohr. Dann niest er Funken und wedelt.'),
      B('Wuff! (Das heißt: Du riechst nach dir. Gut. Die Gechippten riechen nach Neuwagen. Ich mag keinen Neuwagen. Neuwagen hat keine Seele. Und keine Wurst.)', 'freude'),
      B('Grrrr. (Das heißt: Wenn einer nach Neuwagen riecht und dir zu nah kommt, bell ich. Laut. Mit Alarm.)', 'wut'),
    ], { next: 'menue' }),
  ],
};

// ---------------------------------------------------------------------------------------------- Tagesfunde (ab Akt 2)

const FUNDE_23: { tag: Weekday; item: string; text: string }[] = [
  { tag: 'mo', item: 'drohnen-propeller', text: 'Ein Rotorblatt einer Quantum-Drohne. Angekaut. Am Ende klebt noch ein Stück Linse. Bolzen sieht aus, als hätte er sie persönlich vom Himmel geholt. Hat er vielleicht.' },
  { tag: 'di', item: 'quantum-chip-schrott', text: 'Ein Chip. Chrome 10, Ausschuss, im Kanal angeschwemmt. Bolzen hält ihn ganz vorsichtig zwischen den Zähnen, als wüsste er, dass er nicht zubeißen darf.' },
  { tag: 'mi', item: 'glitzerschrott', text: 'Glitzerschrott. Viel. Sehr viel. Er hat offenbar Dexters Vorratskiste gefunden. Von der Halde hört man jemanden „GERLINDE!“ rufen. Gerlinde war es nicht.' },
  { tag: 'do', item: 'chips-tuete', text: 'Eine Tüte Algen-Chips. Ungeöffnet. Er hat sie nicht gefressen. Für Bolzen ist das ein Liebesbeweis von historischem Ausmaß.' },
  { tag: 'fr', item: 'rostige-schraube', text: 'Eine rostige Schraube. Wieder. Er legt sie dir hin wie einen Diamanten. Für Bolzen gibt es keine schlechten Funde. Nur Funde.' },
  { tag: 'sa', item: 'kaktusfrucht', text: 'Eine Kaktusfrucht. Woher? Bolzen schweigt. Er hat Stacheln in der Schnauze und sieht sehr zufrieden aus.' },
  { tag: 'so', item: 'comic-heft', text: 'Ein Comic: „Robo-Rex und die Lächel-Armee“. Jemand hat den Robohund auf dem Cover mit Kugelschreiber blau angemalt. Bolzen findet, er sieht ihm ähnlich.' },
];

const SELTEN: { tag: number[]; item: string; text: string } = {
  tag: [7, 21], item: 'alte-euromuenze',
  text: 'Eine alte Euromünze. Echt. Vor der Flut geprägt. Bolzen legt sie dir in die Hand und setzt sich ganz gerade hin, mit der Marke um den Hals. Er weiß, dass das was Besonderes ist.',
};

const EPILOG_FUND: { item: string; text: string } = {
  item: 'muschel-glas', text: 'Ein Glas voller Muscheln. Sand, Seetang, eine sehr beleidigte kleine Krabbe. Die Krabbe darf gehen. Die Muscheln bleiben.',
};

const fundGruss = (text: string) => [
  erz('Bolzen wartet schon. Er sitzt vor deinem Bett, Schwanz-Servo auf Anschlag, und legt dir etwas vor die Füße.'),
  erz(text),
  B('WUFF! (Das heißt: Für dich! Gefunden! Draußen! Nicht geklaut! Fast nicht geklaut!)', 'freude'),
];
const FUND_PLAUSCH = [B('Wuff wuff. (Das heißt: Morgen find ich was Besseres. Was Größeres. Vielleicht eine Drohne. Eine ganze. Mit Pilot.)')];

function funde(M: Menue): { dialogues: DialogueDef[]; talk: TalkDef[] } {
  const basis: Condition = alle(AKT2, { seen: 'he-bolzen-2' }, { time: 'morgen' }, nicht({ companion: ID }), nicht(MASTER), { notFlag: 'heute_bolzen_fund' });
  const dialogues: DialogueDef[] = [];
  const talk: TalkDef[] = [];
  const add = (id: string, when: Condition, item: string, text: string) => {
    dialogues.push(tagesgespraech(id, fundGruss(text), FUND_PLAUSCH, M, { effects: [{ give: item }, flag('heute_bolzen_fund'), herz(ID, 5)] }));
    talk.push(rede(id, alle(basis, when)));
  };
  add('bolzen-23-fund-selten', alle({ item: 'bolzens-marke' }, { cycleDay: SELTEN.tag }), SELTEN.item, SELTEN.text);
  add('bolzen-23-fund-meer', ENDE_MEER, EPILOG_FUND.item, EPILOG_FUND.text);
  for (const f of FUNDE_23) add(`bolzen-23-fund-${f.tag}`, { weekday: f.tag }, f.item, f.text);
  return { dialogues, talk };
}

// ---------------------------------------------------------------------------------------------- Herz-Ereignis 8

/** ♥8 (Schrottmarkt, Halde, tags, act2): die Digitech-Kiste – Nyras alter Ausweis und eine Kinderzeichnung. */
const he8 = dialog('he-bolzen-8', [
  knoten('start', [
    erz('Bolzen gräbt. Seit einer Stunde. Am Schrottmarkt, hinter Dexters Halde. Erde fliegt, Dexter flucht, Gerlinde meckert. Dann ein metallisches Klong – und Bolzen zieht eine Kiste aus dem Dreck. Rostig, versiegelt, mit einem Logo, das du kennst: DIGITECH.'),
    B('WUFF! (Das heißt: Ich hab dir gesagt, ich grab was Großes aus! ICH HAB ES GESAGT!)', 'freude'),
    erz('Auf dem Siegel blinkt ein schwaches rotes Licht. Daneben ein Aufkleber: „EIGENTUM QUANTUM – BEI FUND MELDEN“. Bolzen hat draufgepinkelt. Das Licht blinkt jetzt etwas unregelmäßiger.'),
  ], {
    choices: [
      { text: 'Das Siegel knacken.', check: pruefung('he-bolzen-8-siegel', 'technik', 6, ['hacken']), next: 'auf', effects: [herz(ID, 50)] },
      { text: 'Bolzen das Siegel abbeißen lassen.', check: pruefung('he-bolzen-8-biss', 'koerper', 5, ['kraft']), next: 'biss', effects: [herz(ID, 50)] },
      { text: 'Mit Bolzens Hilfe aufstemmen. Dauert halt.', next: 'auf', effects: [herz(ID, 40), { advanceTime: 30 }] },
    ],
  }),
  knoten('biss', [
    erz('Du hältst die Kiste fest, Bolzen beißt zu. Es knackt, funkt, zischt. Das Siegel ist ab. Bolzens Eckzahn auch. Er spuckt ihn aus und wedelt, als wäre das ein fairer Tausch.'),
  ], { next: 'auf' }),
  knoten('auf', [
    erz('In der Kiste: zwei Datenwürfel, ein Kabelsalat – und ein Dienstausweis von vor sieben Jahren. „DIGITECH – Praktikantin“. Ein Foto von einem Mädchen mit zu großer Brille und Haarnadeln. Der Name ist halb abgekratzt. Aber die Haarnadeln kennst du.'),
    erz('Darunter, gefaltet: eine Kinderzeichnung. Ein blauer Roboterhund mit Knickohr. Darüber in krakeliger Schrift: „Für Einheit 7-B. Du bist kein Wachhund. Du bist ein guter Hund.“'),
    B('…', 'trauer'),
    erz('Bolzen schnüffelt an der Zeichnung. Lange. Sein Schwanz-Servo steht still. Dann legt er den Kopf auf das Papier und gibt einen Laut von sich, den du von ihm noch nie gehört hast. Kein Piepen, kein Bellen. Etwas Leises.'),
  ], {
    effects: [flag('bolzen_digitech_kiste'), { xp: 150 }],
    choices: [
      { text: '„Das heben wir für Nyra auf. Bis sie zurück ist.“', when: NYRA_WEG, next: 'aufheben', effects: [flag('bolzen_nyra_zeichnung'), herz(ID, 30)] },
      { text: '„Das bringen wir Nyra. Jetzt gleich.“', when: nicht(NYRA_WEG), next: 'bringen', effects: [flag('bolzen_nyra_zeichnung'), herz(ID, 30), herz('nyra', 30)] },
      { text: 'Die Datenwürfel Vega geben.', next: 'vega', effects: [flag('bolzen_datenwuerfel_vega'), herz('vega', 20)] },
      { text: 'Die Zeichnung Bolzen lassen.', next: 'lassen', effects: [herz(ID, 50)] },
    ],
  }),
  knoten('aufheben', [
    erz('Du faltest die Zeichnung und steckst sie in die Innentasche. Bolzen sieht dir dabei zu, sehr genau. Dann setzt er sich neben dich, als wollte er sagen: Ich warte mit.'),
    B('Wuff. (Das heißt: Sie kommt zurück. Ich riech das. Ich riech das ganz sicher. Fast ganz sicher.)', 'neutral'),
  ]),
  knoten('bringen', [
    erz('Ihr findet Nyra am Abend im Crew-Quartier. Sie nimmt die Zeichnung, sieht Bolzen an, und dann sitzt sie eine Stunde mit ihm auf dem Boden, die Stirn an seinem Metallkopf.'),
    erz('Keiner von beiden sagt etwas. Bolzen kann ja auch nicht. Aber er piept ganz leise. Im Takt ihres Atems.'),
  ]),
  knoten('vega', [
    V('Digitech-Würfel von 2079? Verschlüsselt mit ihrem alten Standard? Oh, das ist süß. Das ist, als würde man einen Tresor mit Kaugummi verriegeln. Gib her.'),
    V('… Da sind Wartungsprotokolle drauf. Von einer Einheit 7-B. Und jemand hat jede Nacht einen Kommentar dazugeschrieben: „Heute hat er mich angelächelt. Hunde können nicht lächeln. Er schon.“'),
    erz('Bolzen wedelt. Er hat sehr genau zugehört.'),
  ]),
  knoten('lassen', [
    erz('Du legst die Zeichnung in Bolzens Hundekorb, unter die Decke. Er trägt sie nicht herum, frisst sie nicht, sabbert sie nicht voll. Er schläft nur jede Nacht mit der Schnauze darauf.'),
    D('Er hat eine Erinnerung gekriegt. Eine richtige, nicht aus dem Speicher. Das ist mehr, als die meisten von uns haben, Kumpel.'),
  ]),
]);

// ---------------------------------------------------------------------------------------------- Herz-Ereignis 10

/** ♥10 (Crew-Quartier, Hundekorb, morgens, act2 nach ♥8): Bolzens Marke. */
const he10 = dialog('he-bolzen-10', [
  knoten('start', [
    erz('Bolzen kommt mit etwas im Maul. Diesmal ist es kein Kabel, keine Schraube, kein Hase. Es ist eine Unterlegscheibe an einem Band, mit Zahnabdrücken. Er legt sie dir in die Hand und setzt sich. Ganz gerade.'),
    B('Wuff. (Das heißt: Meine Marke. Hab ich selbst gemacht. Damit jeder weiß, dass ich zu dir gehöre. Und du zu mir.)', 'freude'),
    erz('Auf der Scheibe sind Kratzer. Mit viel gutem Willen ist es ein Name. Deiner. Mit sehr viel gutem Willen.'),
  ], {
    choices: [
      {
        text: 'Einen Peilsender in die Marke löten, damit du ihn immer findest.', next: 'peilsender',
        check: pruefung('he-bolzen-10-sender', 'technik', 5, ['basteln', 'feinmechanik']), effects: [herz(ID, 30), flag('bolzen_marke_peilsender')],
      },
      { text: 'Die Marke um den eigenen Hals hängen.', next: 'hals', effects: [herz(ID, 50)] },
      { text: 'Ihm „Bolzen“ in den Napf gravieren. Damit es gerecht ist.', next: 'napf', effects: [herz(ID, 40)] },
    ],
  }),
  knoten('peilsender', [
    erz('Ein winziger Sender, ein Tropfen Lötzinn. Jetzt piept die Marke, wenn Bolzen in der Nähe ist. Er findet das großartig und rennt den ganzen Vormittag im Kreis, um es zu testen.'),
    B('WUFF WUFF WUFF! (Das heißt: ICH BIN DA! ICH BIN DA! ICH BIN IMMER NOCH DA!)', 'freude'),
  ], { next: 'ende' }),
  knoten('hals', [
    erz('Du hängst dir die Marke um den Hals. Bolzen sieht dich an, legt den Kopf schief und dann die Schnauze auf deine Brust, genau auf die Marke. Er bleibt so. Sehr lange. Bis dein Bein einschläft.'),
  ], { next: 'ende' }),
  knoten('napf', [
    erz('Du ritzt mit dem Messer „BOLZEN“ in seinen Napf. Er schnüffelt an jedem Buchstaben. Dann frisst er aus dem Napf, langsamer als sonst. Er genießt jeden Bissen. Es ist sein Napf. Mit seinem Namen.'),
  ], { next: 'ende' }),
  knoten('ende', [
    B('Wuff. (Das heißt: Wir sind jetzt eine Familie. Das steht so in meinem Code. Ich hab ihn selbst umgeschrieben. Mit den Zähnen.)', 'freude'),
  ], { effects: [{ give: 'bolzens-marke' }, flag('bolzen_marke'), { xp: 200 }, herz(ID, 30)] }),
]);

// ---------------------------------------------------------------------------------------------- Phasen und Fahrplan

export function akt23(M: Menue): { dialogues: DialogueDef[]; talk: TalkDef[]; schedule: ScheduleEntry[]; teil: ContentPart } {
  const p = phasen(ID, 'bolzen-23', M, [
    {
      id: 'master', when: MASTER, ohneMenue: true,
      gruss: [
        erz('Bolzens Augen leuchten blau. Er setzt sich kerzengerade hin. Aus dem Lautsprecher, mit der alten Stimme: „EINHEIT 7-B. MASTER ERKANNT. BEREIT.“'),
        erz('Dann fängt er an zu zittern. Er winselt, ganz leise, dreht sich weg und kriecht in seinen Korb. Er guckt dich nicht an. Er weiß nicht, was er tun soll. Du schon.'),
      ],
    },
    {
      id: 'ende-3b', when: ENDE_3B, einmal: true,
      gruss: [B('WUFF WUFF WUFF WUFF! (Das heißt: Du riechst wieder nach dir! Nicht nach Neuwagen! Ich hab’s gewusst! Ich hab jede Nacht vor der Tür gewartet! Ich hab nur zweimal reingepinkelt!)', 'freude')],
    },
    {
      id: 'ende-nexus', when: ENDE_NEXUS, einmal: true,
      gruss: [
        erz('Bolzen trägt einen neuen Halsbandchip. Die neue Stadt-KI hat ihn geschickt, mit einer Notiz: „Für den guten Hund. Bitte nicht fressen.“'),
        B('Wuff. (Das heißt: Ich hab ihn nicht gefressen. Nur angeleckt. Er schmeckt nach Zukunft. Und ein bisschen nach Batterie.)', 'freude'),
      ],
    },
    {
      id: 'ende-meer', when: ENDE_MEER, einmal: true,
      gruss: [
        erz('Bolzen hat Sand im Fell, Salz im Getriebe und eine Krabbe am Ohr, die nicht loslassen will. Er hat es nicht eilig, sie abzuschütteln.'),
        B('WUFF! (Das heißt: DAS MEER! Es ist nass! Es ist überall! Es wehrt sich, wenn man reinbeißt! Ich liebe es! Ich hab Rost! Egal!)', 'freude'),
      ],
    },
    {
      id: 'epilog', when: EPILOG_FREI, taeglich: true,
      gruss: [B('Wuff wuff. (Das heißt: Guten Morgen! Ich hab heute schon drei Leute begrüßt, einen Briefträger verbellt und eine Drohne gejagt. Die Drohne hat sich entschuldigt. Die neuen machen das.)', 'freude')],
      plausch: [B('Wuff. (Das heißt: Kraulen. Jetzt. Bitte. Ich hab den Tag frei. Ich hab jeden Tag frei. Ich bin ein Hund.)')],
    },
    {
      id: 'akt3', when: AKT3_NACHT,
      gruss: [
        erz('Bolzen sitzt an der Tür, Ohren hoch, Augen auf dich gerichtet. Er weiß, dass heute etwas ist. Hunde wissen das immer.'),
        B('Grrr. Wuff. (Das heißt: Ich komm mit. Oder ich warte hier. Aber wenn du nicht zurückkommst, hol ich dich. Mit Zähnen.)', 'besorgt'),
      ],
    },
    {
      id: 'party', when: PARTY_VORB, taeglich: true,
      gruss: [B('Wuff? (Das heißt: Party? Mit Häppchen? Fallen da Häppchen runter? Nimm mich mit. Ich räum den Boden auf. Kostenlos.)', 'freude')],
    },
    {
      id: 'gerettet', when: alle(COUNTDOWN_DONE, { notFlag: 'epilog' }), einmal: true,
      gruss: [B('WUFF! (Das heißt: Aria riecht wieder nach Aria! Nach Bier und Schweiß und Wut! Ich hab sie umgeworfen vor Freude! Sie hat mich zurückgeworfen! Bester Tag!)', 'freude')],
    },
    {
      id: 'nyra', when: NYRA_WEG, taeglich: true,
      gruss: [
        erz('Bolzen liegt vor Nyras leerem Platz im Crew-Quartier. Er hat ihre alte Jacke aus irgendeiner Ecke gezogen und den Kopf darauf gelegt.'),
        B('Wuff … (Das heißt: Ich bewach das. Bis sie zurück ist. Ich war mal ein Wachhund. Jetzt bin ich ihr Wachhund.)', 'trauer'),
      ],
    },
    {
      id: 'chip', when: ARIA_GECHIPPT, taeglich: true,
      gruss: [B('Grrrrrr. (Das heißt: Aria war hier. Sie riecht nach Neuwagen. Ich hab sie verbellt. Ich hab Aria verbellt. Ich hab mich danach geschämt. Aber sie riecht falsch.)', 'wut')],
      plausch: [B('Wuff. (Das heißt: Wenn du sie zurückholst, verbell ich sie nie wieder. Nur noch an Feiertagen. Aus Tradition.)', 'trauer')],
    },
    {
      id: 'akt2', when: AKT2_NUR, taeglich: true,
      gruss: [B('Wuff! (Das heißt: Draußen sind überall Drohnen. Ich jag sie. Ich fang keine. Aber ich jag sie. Das ist mein Beitrag zur Revolution.)', 'freude')],
      plausch: [B('Grr. (Das heißt: Manche Drohnen sagen „Einheit 7-B, melden“. Ich melde mich nicht. Ich bin abgemeldet. Für immer. Ich gehör jetzt dir.)', 'signatur')],
    },
  ]);
  const f = funde(M);

  const schedule: ScheduleEntry[] = [
    // Nachspiel am Meer: am Wochenende tagsüber am Strand (sofern nicht in der Party).
    { slot: 'tag', days: ['sa', 'so'], when: alle(ENDE_MEER, nicht({ companion: ID })), place: { map: 'das-meer', at: 'strand' } },
  ];

  return {
    dialogues: [...p.dialogues, ...f.dialogues, he8, he10],
    talk: [...f.talk, ...p.talk],
    schedule,
    teil: { abilities: { [BELLEN.id]: BELLEN, [SCHNUEFFELN.id]: SCHNUEFFELN } },
  };
}
