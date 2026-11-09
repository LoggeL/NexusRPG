// Pim Pinzette in Akt 2, Akt 3 und im Nachspiel (world.md §4.4, act23.json he-pim-pinzette-8/10). Nur Freundschaft.
// Kein eigener Inhaltsteil: pim-pinzette.ts holt Menü-Ergänzung, Phasen, Tagesablauf und he-8/10 von hier.
// pers-pim-kleine-schrift und prep-turm-plan (Pims Serviette) bauen andere Ordner; hier nur Verweise.
import type { ContentPart } from '../../part';
import type { DialogueDef, ScheduleEntry, TalkDef } from '../../../modules/contracts';
import {
  type Menue, AKT2, AKT2_NUR, AKT3_NACHT, ARIA_GECHIPPT, COUNTDOWN_DONE, ENDE_3B, ENDE_MEER, ENDE_NEXUS, EPILOG, EPILOG_FREI,
  MASTER, NYRA_WEG, PARTY_VORB, alle, dialog, erz, flag, herz, ich, knoten, nicht, phasen, pruefung, sprecher,
} from './_lib';

const ID = 'pim-pinzette';
const P = sprecher(ID);
const RI = sprecher('richter');

// ---------------------------------------------------------------------------------------------- Menü (ab Akt 2)

export const MENUE_23: Menue = {
  choices: [
    {
      text: 'Wie ist es im Labor, seit Chrome 10 draußen ist?', next: 'p23-labor',
      when: alle(AKT2_NUR, { notFlag: 'pim_23_labor' }), effects: [flag('pim_23_labor'), herz(ID, 10)],
    },
    {
      text: 'Lass uns Pommes holen. Ich zahl.', tag: '[Pommes]', next: 'p23-pommes',
      when: alle(AKT2, { time: 'abend' }, { notFlag: 'heute_pim_pommes' }), requires: { credits: 8 },
      effects: [flag('heute_pim_pommes'), { credits: -8 }, herz(ID, 15), { heal: 10 }],
    },
  ],
  nodes: [
    knoten('p23-labor', [
      P('Still. So still. Die Kollegen lächeln. Alle. Den ganzen Tag. Herr Brandl aus der Spülküche hat mir heute „Guten Morgen“ gesagt. Er hat noch nie „Guten Morgen“ gesagt. Er hat sonst „Scheiße, schon wieder Montag“ gesagt.', 'besorgt'),
      P('Ich hab mir angewöhnt, beim Pipettieren zu fluchen. Leise. Damit ich weiß, dass ich noch ich bin. Entschuldigung. Scheiße. Entschuldigung.', 'verlegen'),
    ], { next: 'menue' }),
    knoten('p23-pommes', [
      erz('Zwei Schalen Pommes, eine mit Mayo, eine mit noch mehr Mayo. Pim isst schweigend und sehr schnell, wie jemand, der seit dem Frühstück vergessen hat, dass er einen Körper hat.'),
      P('Danke. Das ist das erste, was heute geschmeckt hat. Nach was anderem als Desinfektionsmittel.', 'freude'),
    ], { next: 'menue' }),
  ],
};

// ---------------------------------------------------------------------------------------------- Herz-Ereignis 8

/** ♥8 (Eisenhof, Gerichtsplatz, tags, act2): Pims Aussage vor dem Richter – gegen eine Quantum-Anwaltsdrohne. */
const he8 = dialog('he-pim-pinzette-8', [
  knoten('start', [
    erz('Gerichtsplatz am Eisenhof. Der Richter hat unter freiem Himmel eine Anhörung angesetzt, „weil drinnen die Wanzen zuhören“. Auf der Bank: der Richter mit Hammer. Daneben: eine schwebende Quantum-Anwaltsdrohne mit Krawatte. Eine echte Krawatte. Aus Seide.'),
    erz('Pim in ihrem besten Pullover, der trotzdem aussieht wie ein Laborkittel. Sie hält einen Zettel mit ihrer Aussage. Er ist nass vom Händeschwitzen.'),
    P('Ich soll da hin. Und sagen, was ich in Labor null gesehen hab. Vor Leuten. Vor dem Richter. Vor einer Kamera von NX-1. Und vor dieser Drohne. Ich kann nicht mal vor einem Spiegel reden.', 'besorgt'),
    RI('Zeugin Pinzette! Vortreten! Keine Angst, das Gericht beißt nur Angeklagte. Und manchmal Kekse.'),
  ], {
    choices: [
      { text: '„Ich geh mit. Guck nur mich an.“', check: pruefung('he-pim-8-mut', 'ausstrahlung', 6, ['trost']), next: 'mut', effects: [herz(ID, 50)] },
      { text: '„Lies einfach vor. Wort für Wort.“', next: 'vorlesen', effects: [herz(ID, 40)] },
    ],
  }),
  knoten('mut', [
    P('Nur Sie. Okay. Wenn ich umfalle, fangen Sie mich auf. Wie die Schachtel. Damals.', 'signatur'),
    erz('Pim tritt vor und redet. Zuerst leise, dann schneller, dann so schnell, dass der Richter die Hand hebt: „Zeugin. Atmen. Das Gericht kommt nicht mit.“'),
  ], { next: 'drohne' }),
  knoten('vorlesen', [
    P('Wort für Wort. Okay. Ich lese gut. Ich lese Beipackzettel zum Spaß. Das hilft jetzt. Endlich hilft das mal.', 'besorgt'),
    erz('Sie liest vor. Serie 10, Steuerbefehl „Master“, Probandenliste. Ihre Stimme zittert, ihr Finger nicht. Der Finger fährt jede Zeile ab, als wäre es eine Pipette.'),
  ], { next: 'drohne' }),
  knoten('drohne', [
    erz('Die Anwaltsdrohne surrt nach vorne. „EINSPRUCH. DIE ZEUGIN IST NACHWEISLICH UNZUVERLÄSSIG. SIE HAT SICH IN DIESEM JAHR 4 812 MAL ENTSCHULDIGT. WER SICH SO OFT ENTSCHULDIGT, HAT ETWAS ZU VERBERGEN.“'),
    P('Das … das stimmt. Das mit den Entschuldigungen. Das ist … Entschuldigung.', 'trauer'),
    RI('Hm. Das ist ein Argument. Ein schlechtes, aber ein Argument. Was sagt die Gegenseite?'),
    erz('Der Richter sieht dich an. Pim sieht dich an. Die Drohne sieht dich mit drei Linsen gleichzeitig an.'),
  ], {
    choices: [
      {
        text: '„Euer Ehren, die Drohne zählt Entschuldigungen. Wer zählt so was? Nur jemand, der Angst vor Leuten hat, die sich noch schämen können.“', next: 'rede',
        check: pruefung('he-pim-8-plaedoyer', 'ausstrahlung', 6, ['ueberzeugen', 'recht']), effects: [herz(ID, 40), herz('richter', 20)],
      },
      {
        text: 'Den Datenstrom der Drohne mitlesen: Die Zahl hat sie sich ausgedacht.', next: 'gefaelscht',
        check: pruefung('he-pim-8-datenstrom', 'technik', 5, ['hacken', 'terminal']), effects: [herz(ID, 40)],
      },
      { text: '„Pim. Sag’s noch einmal. Ohne Entschuldigung.“', next: 'ohne', effects: [herz(ID, 50)] },
    ],
  }),
  knoten('rede', [
    erz('Stille auf dem Gerichtsplatz. Dann klatscht jemand von den Zuschauerbänken. Dann die Gemüsebeete. Dann, sehr zögerlich, ein Wachmann.'),
    RI('Abgelehnt. Der Einspruch, nicht die Zeugin. Die Zeugin ist hiermit die glaubwürdigste Person, die dieses Gericht je gesehen hat. Ich lasse das eintragen. In Großbuchstaben.'),
  ], { next: 'ende' }),
  knoten('gefaelscht', [
    ich('Euer Ehren: Die Zahl 4 812 kommt aus einer Datei namens „GLAUBWÜRDIGKEIT_ZERSTÖREN_v3“. Version drei. Es gab also schon zwei schlechtere.'),
    RI('Die Drohne lügt? Vor meinem Gericht? Ungeheuerlich! Gerichtsdiener! Die Krawatte wird beschlagnahmt!'),
    erz('Ein Wachmann zieht der Drohne die Seidenkrawatte ab. Die Drohne surrt beleidigt davon. Nackt, sozusagen.'),
  ], { next: 'ende' }),
  knoten('ohne', [
    erz('Pim schließt die Augen. Dann öffnet sie sie wieder und sieht die Drohne an. Direkt in die mittlere Linse.'),
    P('Quantum chippt Menschen. Ich hab die Formel gesehen. Ich hab die Probanden gesehen. Und ich hab es aufgeschrieben. Klein. Aber ich hab’s aufgeschrieben.', 'wut'),
    P('…'),
    P('Ich hab mich nicht entschuldigt.', 'ueberrascht'),
    RI('Nein. Hat sie nicht. Protokoll: Die Zeugin hat sich nicht entschuldigt. Das Gericht ist gerührt. Weiter.'),
  ], { next: 'ende' }),
  knoten('ende', [
    erz('Nach der Anhörung sitzt Pim auf der Treppe am Gerichtsplatz und zittert am ganzen Körper. Dann fängt sie an zu lachen. Das Lachen hört eine ganze Weile nicht auf.'),
    P('Ich hab’s gesagt. Vor allen. Die Kamera hat’s. NX-1 sendet es heute Abend. Meine Mutter wird es sehen. Sie wird fragen, warum ich den grünen Pullover anhatte.', 'freude'),
    P('Danke. Ich weiß, ich soll mich nicht mehr entschuldigen. Aber bedanken darf ich mich. Das ist was anderes. Das ist besser.'),
  ], { effects: [flag('pim_ausgesagt'), { xp: 150 }, { rep: 'unterstadt', delta: 3 }] }),
]);

// ---------------------------------------------------------------------------------------------- Herz-Ereignis 10

/** ♥10 (Schrottmarkt, tags, ab Akt 3 – faktisch im Nachspiel, nicht nach dem Master-Ende): Werkstatt „Nullpunkt“. */
const he10 = dialog('he-pim-pinzette-10', [
  knoten('start', [
    erz('Marktplatzmitte am Schrottmarkt. Pim steht auf einer umgedrehten Kiste, ohne Kittel, in einer Latzhose mit vierzig Taschen, und verteilt Zettel. Darauf, von Hand gezeichnet: „NULLPUNKT – Reparaturen, Feinmechanik, keine Fragen. Ab Montag. In der alten Glasfassade am Digitech-Areal.“'),
    P('Ich hab gekündigt! Bei Quantum! Per Brief! Mit Unterschrift! Ich hab „Mit freundlichen Grüßen“ weggelassen! Einfach weggelassen!', 'freude'),
    P('Und jetzt mach ich einen Laden auf. Meinen. Unseren. Ich brauche nur noch … alles. Werkbank, Strom, Kunden. Und Mut. Mut hab ich jetzt. Den hab ich auf dem Gerichtsplatz gefunden.'),
  ], {
    choices: [
      {
        text: 'Die erste Reparatur gleich hier machen: ein Kinderradio, das „Master“ rauscht.', next: 'reparatur',
        check: pruefung('he-pim-10-radio', 'technik', 6, ['reparieren', 'feinmechanik']), effects: [herz(ID, 40), { rep: 'unterstadt', delta: 2 }],
      },
      {
        text: 'Die Zettel unter die Leute bringen. Laut.', next: 'werbung',
        check: pruefung('he-pim-10-werbung', 'strasse', 5, ['geruecht', 'verkaufen']), effects: [herz(ID, 40)],
      },
      { text: 'Neben ihr auf die Kiste steigen und einfach mitverteilen.', next: 'mit', effects: [herz(ID, 40)] },
    ],
  }),
  knoten('reparatur', [
    erz('Zwei Schrauben, eine Lötstelle, ein Chip, den du mit spitzen Fingern herauspulst. Das Radio spielt wieder Musik. Ausgerechnet Lio. Die Kinder tanzen. Pim schreibt etwas in ihr Notizbuch. Sehr klein.'),
    P('Erster Auftrag: erledigt. Bezahlung: ein Tanz. Das ist das beste Geschäftsmodell der Welt. Dexter wird neidisch.', 'freude'),
  ], { next: 'kaefer' }),
  knoten('werbung', [
    erz('Du rufst über den Markt, bis Babette dich mit einer Kelle zum Schweigen bringt. Aber dann stehen zwanzig Leute vor der Kiste. Mit kaputten Toastern, Implantaten, einem Ziegenroboter, der nur noch rückwärts läuft.'),
    P('Zwanzig. Zwanzig Kunden. Am ersten Tag! Ich muss mich hinsetzen. Nein. Ich muss arbeiten. Nein. Ich muss mich hinsetzen und arbeiten.', 'ueberrascht'),
  ], { next: 'kaefer' }),
  knoten('mit', [
    erz('Ihr steht zu zweit auf einer Kiste, die für eine Person gebaut ist, und reicht Zettel herum. Die Kiste ächzt. Pim auch. Vor Lachen. Am Ende sind alle Zettel weg, und einer davon klebt an Dexters Stirn.'),
  ], { next: 'kaefer' }),
  knoten('kaefer', [
    erz('Als die Kiste leer ist, öffnet Pim die Hand. Darin ein Käfer, kleiner als Krabbel, mit grün leuchtenden Augen und einer winzigen Gravur auf dem Panzer: dein Name. Ganz klein. Unten rechts.'),
    P('Das ist Krabbels kleine Schwester. Sie gehört Ihnen. Sie krabbelt in jedes Schloss. Und sie entschuldigt sich nie. Das hab ich extra so gebaut.', 'freude'),
    P('Ihr Name steht auch auf dem Ladenschild. Ganz klein. Unten rechts. Ich hab ihn mit Herbert graviert. Herbert ist mein Lötkolben. Er hat geweint. Also, getropft.', 'signatur'),
  ], {
    effects: [{ give: 'pims-mikrokaefer' }, flag('pim_nullpunkt'), { xp: 200 }],
    choices: [
      { text: '„Darf ich dich duzen, Pim? Wir haben zusammen einen Laden.“', next: 'du', effects: [herz(ID, 50)] },
      { text: '„Viel Glück mit Nullpunkt, Pim.“', next: 'glueck', effects: [herz(ID, 40)] },
    ],
  }),
  knoten('du', [
    P('Duzen. Ich. Sie. Du. Oh. Oh nein. Okay. Du. Du! Das ist ja ganz leicht! Warum hab ich das zwei Jahre nicht gemacht?', 'ueberrascht'),
    P('Du bist mein erster Duz-Freund. Ich schreib’s mir auf. Groß. Zum ersten Mal schreib ich was groß.', 'freude'),
  ], { effects: [flag('pim_duzt')] }),
  knoten('glueck', [P('Glück brauch ich nicht. Ich hab Pinzetten. Und Sie. Und Herbert. Das reicht für drei Läden.', 'freude')]),
]);

// ---------------------------------------------------------------------------------------------- Phasen und Fahrplan

export function akt23(M: Menue): { dialogues: DialogueDef[]; talk: TalkDef[]; schedule: ScheduleEntry[]; teil: ContentPart } {
  const p = phasen(ID, 'pim-pinzette-23', M, [
    {
      id: 'master', when: MASTER, ohneMenue: true,
      gruss: [
        P('Ja, Master. Natürlich, Master. Entschuldigung, Master.', 'trauer'),
        erz('Sie lächelt. Es ist nicht ihr Lächeln. Ihre Hände zittern trotzdem, nur ganz leicht, als würde darin noch jemand wohnen, der sich entschuldigen will.'),
      ],
    },
    {
      id: 'ende-3b', when: ENDE_3B, einmal: true,
      gruss: [
        P('Sie … du … Sie sind wieder Sie! Ich hab die ganze Zeit Ihre Werte überwacht. Heimlich. Mit einem Käfer. Entschuldigung. Nein! Keine Entschuldigung! Gern geschehen!', 'freude'),
        P('Ich hab den Chip analysiert, den sie Ihnen eingesetzt haben. Er ist jetzt ein Schlüsselanhänger. Wollen Sie ihn? Er sagt nichts mehr. Ich hab ihm das Sprechen abgewöhnt.'),
      ],
    },
    {
      id: 'ende-nexus', when: ENDE_NEXUS, einmal: true,
      gruss: [
        P('Die neue KI hat mich gefragt, ob ich ihr beibringe, wie man sich entschuldigt. Sie sagt, das kann sie noch nicht richtig. Ich hab gesagt: Das ist eine Gabe. Ich hab zwei Jahre geübt.', 'signatur'),
        P('Und dann hab ich ihr beigebracht, wann man es lässt. Das war schwerer. Für uns beide.'),
      ],
    },
    {
      id: 'ende-meer', when: ENDE_MEER, einmal: true,
      gruss: [
        P('Blade sitzt! Und Frau Zero hat gekündigt. Von selbst. Sie hat mir ihre Pipetten geschenkt und gesagt: „Mach was Besseres damit.“ Ich mach Krabbel Nummer drei.', 'freude'),
        P('Und ich war am Meer. Ich hab Salzwasser unters Mikroskop gelegt. Es ist voller Leben. Das ist das Unhygienischste und Schönste, was ich je gesehen habe.'),
      ],
    },
    {
      id: 'epilog', when: EPILOG_FREI, taeglich: true,
      gruss: [P('Nullpunkt hat Kundschaft! Ein Toaster, zwei Implantate, ein Ziegenroboter, der jetzt vorwärts läuft. Leider nur vorwärts. Er ist gegen die Wand gelaufen. Dreimal.', 'freude')],
      plausch: [P('Ich schlaf jetzt acht Stunden. Acht! Ich wusste nicht, dass Menschen das dürfen. Ich hab mich bei meinem Kissen entschuldigt, dass ich es so lange vernachlässigt habe.', 'verlegen')],
    },
    {
      id: 'akt3', when: AKT3_NACHT, einmal: true, effects: [flag('pim_labortuer_offen')],
      gruss: [
        P('Heute Nacht. Ich weiß. Ich bin im Labor. Spätschicht. Ich hab die Labortür so verkabelt, dass sie bei Alarm aufgeht statt zu. Das war ein Versehen. Ein sehr absichtliches Versehen.', 'signatur'),
        P('Wenn Sie da oben irgendwo festsitzen: Labor, Werkbank, ganz hinten. Ich hab Pommes. Kalte. Aber Pommes.'),
      ],
    },
    {
      id: 'akt3-nach', when: AKT3_NACHT,
      gruss: [P('Gehen Sie! Bevor jemand merkt, dass ich mit Ihnen rede. Und passen Sie auf sich auf. Das ist keine Bitte. Das ist eine Laboranweisung.', 'besorgt')],
    },
    {
      id: 'party', when: PARTY_VORB, taeglich: true,
      gruss: [P('Die Releaseparty. Alle im Labor müssen hin. Mit Chip. Ich hab meinen … nicht eingesetzt. Ich hab ihn auf die Haut geklebt. Mit Pflaster. Sieht von weitem genauso aus.', 'verlegen')],
      plausch: [P('Wenn mich jemand fragt, lächle ich. Ich übe schon. Vor dem Spiegel. Der Spiegel hat Angst vor mir.', 'besorgt')],
    },
    {
      id: 'gerettet', when: alle(COUNTDOWN_DONE, { notFlag: 'epilog' }), einmal: true, effects: [herz(ID, 20)],
      gruss: [P('Sie haben es geschafft! Der Chip ist raus! Ich hab im Labor die Werte gesehen und so laut gejubelt, dass Frau Zero gefragt hat, ob ich krank bin. Ich hab Ja gesagt. Glücklich krank.', 'freude')],
    },
    {
      id: 'nyra', when: NYRA_WEG, taeglich: true,
      gruss: [P('Nyra. Sie ist im Labor. Nicht in meinem. In dem darüber. Ich hör manchmal Tastaturgeräusche durch die Decke. Schnell. Sehr schnell. Wie jemand, der sich nicht ergibt.', 'besorgt')],
      plausch: [P('Ich hab ihr einen Zettel ins Lüftungsgitter geschoben. „Halt durch. P.“ Ganz klein geschrieben. Ich hoffe, sie hat eine Lupe.', 'trauer')],
    },
    {
      id: 'chip', when: ARIA_GECHIPPT, taeglich: true,
      gruss: [P('Ich hab ihre Werte gesehen. Arias. Im System. Ich hab die Formel für den Chip pipettiert, der in ihr steckt. Ich. Mit diesen Händen.', 'trauer')],
      plausch: [P('Dante sucht ein Gegenmittel. Ich hab ihm meine Notizen gegeben. Alle. Auch die mit Kaffeeflecken. Wenn es klappt, war es nicht umsonst, dass ich da war.', 'besorgt')],
    },
    {
      id: 'akt2', when: AKT2_NUR, taeglich: true,
      gruss: [P('Hallo! Leise! Hier sind überall Drohnen. Die hören mit. Also sage ich jetzt laut: Was für ein schöner Tag für Quantum! … So. Jetzt können wir reden.', 'verlegen')],
      plausch: [P('Sie haben im Labor neue Kittel eingeführt. Mit Chip-Tasche. Ich hab meine zugenäht. Mit OP-Faden. Das hält ewig.', 'signatur')],
    },
  ]);

  // act23.json pim-pinzette „ersetzt“.
  const schedule: ScheduleEntry[] = [
    { slot: 'tag', when: EPILOG_FREI, place: { map: 'digitech-areal', at: 'glasfassade' } },
    { slot: 'morgen', place: { map: 'bahnhof-mitte', at: 'pendlerbank' } },
    { when: alle(AKT3_NACHT), place: { map: 'quantum-labor', at: 'pims-werkbank' } },
    { slot: 'tag', when: alle(AKT2, nicht(EPILOG)), place: { map: 'quantum-labor', at: 'pims-werkbank' } },
    { slot: 'tag', place: 'away' },
    { slot: 'abend', place: { map: 'schrottmarkt', at: 'imbiss-loetkolben' } },
    { slot: 'nacht', place: 'away' },
  ];

  return { dialogues: [...p.dialogues, he8, he10], talk: p.talk, schedule, teil: {} };
}
