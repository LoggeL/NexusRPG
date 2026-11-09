// Lio Funkel in Akt 2, Akt 3 und im Nachspiel (world.md §4.4, §4.6, §4.7 „Lied ohne Reim“, act23.json he-lio-funkel-8/10).
// Kein eigener Inhaltsteil: lio-funkel.ts holt Menü-Ergänzung, Phasen, Wochenfrage, Fähigkeiten und he-8/10 von hier.
// Romanze: Geständnis ♥8 (nach dem Auftritt), Kuss ♥10 (Track 7), Nacht mit Abblende, Morgen danach; danach einmal
// pro Woche „Kommst du noch hoch?“. Alles an { romance: 'lio-funkel' } bzw. lio-funkel_romanze_zusammen.
import type { ContentPart } from '../../part';
import type { AbilityDef, Condition, DialogueDef, ScheduleEntry, TalkDef } from '../../../modules/contracts';
import {
  type Menue, AKT2_NUR, AKT3_NACHT, ARIA_GECHIPPT, COUNTDOWN_DONE, ENDE_3B, ENDE_MEER, ENDE_NEXUS, EPILOG_FREI, MASTER,
  NYRA_WEG, PARTY_VORB, alle, dialog, erz, flag, herz, knoten, nicht, phasen, pruefung, rede, sprecher,
} from './_lib';

const ID = 'lio-funkel';
const L = sprecher(ID);
const H = sprecher('hunter');
const A = sprecher('aria');
const ich = sprecher('player');

const ROM: Condition = { romance: ID };
const ZUSAMMEN: Condition = { flag: 'lio-funkel_romanze_zusammen' };

// ---------------------------------------------------------------------------------------------- Fähigkeit

/** Nach dem Album (lio_album_fertig): Lio spielt den Stadthit, Gegner im Umkreis verlieren den Takt. */
export const STADTHIT: AbilityDef = {
  id: 'lio-stadthit', name: 'Stadthit',
  description: 'Lio spielt den Refrain, den die ganze Unterstadt kennt. Gegner im Umkreis summen mit und vergessen kurz, warum sie hier sind (Betäubt, 1 Runde).',
  kind: 'sozial', ap: 2, target: 'area', range: 5, radius: 2, attribute: 'ausstrahlung', status: { id: 'betaeubt', turns: 1, chance: 0.6 }, cooldown: 4,
};

// ---------------------------------------------------------------------------------------------- Menü (ab Akt 2)

export const MENUE_23: Menue = {
  choices: [
    {
      text: 'Spiel was gegen die Chips.', tag: '[Protestlied]', next: 'l23-protest',
      when: alle(AKT2_NUR, { notFlag: 'heute_lio_protest' }),
      effects: [flag('heute_lio_protest'), { checkBuff: { id: 'lio-protestlied', label: 'Protestlied im Ohr', value: 1, attribute: 'ausstrahlung', tags: ['ueberreden', 'buehne'], forDays: 0, consumes: true } }],
    },
    {
      text: 'Wie hält Berta das eigentlich aus? Mit Drohnen und Stromsperren?', next: 'l23-berta',
      when: alle(AKT2_NUR, { notFlag: 'lio_23_berta' }), effects: [flag('lio_23_berta'), herz(ID, 10)],
    },
  ],
  nodes: [
    knoten('l23-protest', [
      L('„Lächeln ist kein Upgrade, / Grinsen ist kein Code, / wer dir sagt, du bist zu langsam, / der hat Angst vor deinem Tod … nee, warte. Vor deinem Trott.“', 'signatur'),
      L('Die Strophe arbeite ich noch aus. Aber der Refrain sitzt. Drei Gechippte sind gestern stehen geblieben. Einer hat mitgewippt. Mitgewippt, {name}! Mit dem Fuß!', 'freude'),
    ], { next: 'menue' }),
    knoten('l23-berta', [
      L('Berta hat einen eigenen Akku. Aus einer Quantum-Drohne. Dexter hat ihn mir verkauft und gesagt, der flüstert manchmal. Er flüstert manchmal.', 'verlegen'),
      L('Er flüstert „Master“. Ich spiel dann einfach lauter. Bis jetzt hat Berta gewonnen.'),
    ], { choices: [{ text: 'Noch was, Lio.', next: 'menue' }, { text: 'Bis später.' }] }),
  ],
};

// ---------------------------------------------------------------------------------------------- Herz-Ereignis 8

const FUER_MICH: Condition = alle(ROM, { flag: 'lio_8_fuer_mich' });

/** ♥8 (High Voltage, Samstagnacht, act2): erster großer Auftritt, Quantum kappt den Strom, Protestlied; mit Romanze Geständnis. */
const he8 = dialog('he-lio-funkel-8', [
  knoten('start', [
    erz('Samstag, High Voltage, voll bis an die Decke. Auf dem Plakat am Eingang steht in Hunters Handschrift: „HEUTE: LIO FUNKEL. ER IST GUT. ICH HAB NACHGEZÄHLT.“'),
    erz('Hinter der Bühne. Lio, kreidebleich, umklammert Berta wie einen Rettungsring.'),
    L('Ich kann das nicht. Da draußen sind dreihundert Leute. Dreihundert! Am Bahnhof sind es zwölf, und die Hälfte davon wartet nur auf die Bahn.', 'trauer'),
    L('Und vorne an der Tür stehen zwei Gechippte. Die lächeln. Die lächeln schon, bevor ich überhaupt angefangen habe. Wie soll ich gegen so ein Lächeln anspielen?', 'besorgt'),
    H('Funkel. Du hast vier Minuten. Wenn du in vier Minuten nicht auf der Bühne stehst, stell ich Collin auf die Bühne. Und Collin singt Schlager.'),
  ], {
    choices: [
      { text: '„Lio. Guck mich an. Die sind wegen dir hier. Nicht trotz.“', check: pruefung('he-lio-8-mut', 'ausstrahlung', 6, ['buehne', 'trost']), next: 'mut', effects: [herz(ID, 50)] },
      { text: 'Ihn einfach auf die Bühne schieben.', next: 'schieben', effects: [herz(ID, 30)] },
      { text: '„Spiel für mich. Nur für mich. Die anderen sind Deko.“', tag: '[Romanze]', when: ROM, next: 'fuer-mich', effects: [herz(ID, 50), flag('lio_8_fuer_mich')] },
    ],
  }),
  knoten('mut', [
    L('Wegen mir. Okay. Okay okay okay. Wegen mir.', 'ueberrascht'),
    erz('Er geht raus. Das erste Lied wackelt. Das zweite nicht mehr. Beim dritten singt der ganze Club, und Lio lacht ins Mikro, mitten im Refrain.'),
  ], { next: 'strom' }),
  knoten('schieben', [
    erz('Ein Schubs, ein Stolpern, Scheinwerferlicht. Lio steht auf der Bühne, als wäre er vom Himmel gefallen. Dann spielt er. Und wie er spielt.'),
  ], { next: 'strom' }),
  knoten('fuer-mich', [
    erz('Er spielt für dich. Das merkt der ganze Club spätestens beim vierten Lied, das er „jemandem da hinten, der genau weiß, wer gemeint ist“ widmet.'),
    L('„… und deine Hände an meinem Balg, / und mein Herz geht schneller als der Bass im Saal …“', 'zaertlich'),
    erz('Hunter dreht den Ton halb runter. Dante pfeift durch die Finger. Aria brüllt „ZIEHT EUCH WAS AN!“, obwohl alle angezogen sind.'),
  ], { next: 'strom' }),
  knoten('strom', [
    erz('Mitten im fünften Lied: Schwarz. Der Strom ist weg. Im ganzen Block. Durch die Lüftung schwebt eine weiße Drohne und sagt mit freundlicher Stimme: „NICHT REGISTRIERTE KUNDGEBUNG. BITTE GEHEN SIE LÄCHELND NACH HAUSE.“'),
    H('Die haben mir den Strom abgedreht. In meinem Club. Neuling. Mach was. Irgendwas. Ich halte die Leute so lange am Tresen fest.'),
  ], {
    choices: [
      {
        text: 'Bertas Drohnenakku an die Bühnenanlage klemmen.', next: 'notstrom',
        check: pruefung('he-lio-8-notstrom', 'technik', 5, ['reparieren', 'strom']), effects: [herz(ID, 30)],
      },
      {
        text: 'Den Saal anfeuern, bis die Drohne nicht mehr gegen den Lärm ankommt.', next: 'saal',
        check: pruefung('he-lio-8-saal', 'ausstrahlung', 6, ['buehne', 'anfuehren']), effects: [herz(ID, 30), { rep: 'unterstadt', delta: 2 }],
      },
      { text: '„Lio. Ohne Strom. Einfach weiter.“', next: 'unplugged', effects: [herz(ID, 30)] },
    ],
  }),
  knoten('notstrom', [
    erz('Ein Kabel, ein Funke, ein Fluch, der sich zufällig reimt. Dann knallen die Boxen wieder an, lauter als vorher. Die Drohne zuckt zusammen, als hätte sie Ohren.'),
    L('Berta, du Biest! Du flüsterst „Master“ und spielst für die Rebellion! Ich liebe dich!', 'freude'),
  ], { next: 'protest' }),
  knoten('saal', [
    erz('Du springst auf einen Tisch und brüllst den Refrain vor. Erst singt der Tisch mit, dann der Tresen, dann der ganze Club. Dreihundert Stimmen gegen eine freundliche Maschine. Die Drohne meldet „KAPAZITÄT ÜBERSCHRITTEN“ und fliegt rückwärts hinaus.'),
  ], { next: 'protest' }),
  knoten('unplugged', [
    erz('Lio stellt sich auf den Bühnenrand. Kein Mikro, kein Verstärker, nur Berta und ihr Balg, der atmet. Er singt leise. Der Club wird so still, dass man die Drohne summen hört. Dann übertönt ihn der Club. Flüsternd.'),
  ], { next: 'protest' }),
  knoten('protest', [
    L('„Lächeln ist kein Upgrade, / Grinsen ist kein Code, / und wer heut nicht mitsingt, / der ist morgen noch nicht tot.“', 'signatur'),
    erz('Die zwei Gechippten an der Tür lächeln immer noch. Aber einer von ihnen bewegt die Lippen. Ganz leicht. Im Takt.'),
  ], {
    effects: [flag('lio_erster_auftritt'), flag('lio_protestlied'), { xp: 150 }],
    choices: [
      { text: 'Hinter die Bühne.', when: FUER_MICH, next: 'danach' },
      { text: 'Hinter die Bühne.', when: nicht(FUER_MICH), next: 'ende' },
    ],
  }),
  knoten('danach', [
    erz('Hinter der Bühne, danach. Lio, verschwitzt, mit Mütze in der Hand und einem Grinsen, das nicht mehr weggeht.'),
    L('War das zu viel? Das war zu viel. Ich hab noch drei Strophen. Die sind schlimmer. Willst du sie hören? Hier? Jetzt? Ganz nah?', 'verlegen'),
  ], {
    effects: [flag('lio_romanze_auftritt')],
    choices: [
      { text: '„Hier. Jetzt. Ganz nah.“', next: 'gestaendnis', effects: [herz(ID, 30)] },
      { text: '„Heb sie auf. Für ein andermal.“', next: 'aufheben' },
    ],
  }),
  knoten('gestaendnis', [
    L('Keine Strophen. Ich sag’s einfach. Ohne Reim. Das hab ich noch nie gemacht.', 'verlegen'),
    L('Ich schreib seit Wochen jedes Lied über dich. Auch die über Tauben. Vor allem die über Tauben. Und ich hab Angst, dass du’s merkst. Und noch mehr Angst, dass du’s nicht merkst.', 'zaertlich'),
    ich('Ich hab’s gemerkt, Funkel. Die Tauben waren sehr deutlich.'),
    L('… Gut. Dann muss ich’s nicht mehr verstecken. Dann schreib ich jetzt eins, das nur dir gehört. Mit leerem Track am Ende. Für später.', 'freude'),
  ], { effects: [flag('lio_romanze_gestanden')] }),
  knoten('aufheben', [L('Ein andermal. Das ist das schönste Wort, das es gibt. Da steckt „mal“ drin. Und „andere“. Und Hoffnung.', 'zaertlich')]),
  knoten('ende', [
    L('Ich hab’s gemacht. Ich hab vor dreihundert Leuten gespielt, gegen eine Drohne, ohne Strom, und mir nicht in die Hose gemacht. Das kommt in den Ordner „Gute Tage“. Ganz nach vorne.', 'freude'),
  ]),
]);

// ---------------------------------------------------------------------------------------------- Herz-Ereignis 10

/** ♥10 (Dachterrasse Neon-Gasse, Nacht, act2 nach ♥8 und pers-lio-album): Albumpremiere, Blackout, Track 7. */
const he10 = dialog('he-lio-funkel-10', [
  knoten('start', [
    erz('Albumpremiere auf der Dachterrasse über der Neon-Gasse. Lichterketten, Klappstühle, die halbe Unterstadt. Unten kreisen Drohnen. Oben ist es ihnen egal.'),
    L('Sechs Lieder. Die Stadt ist in jedem davon: Nebelhorn, Keksalarm, Kanalrechen, Tauben, Rennhalle. Und Applaus. Der ist das sechste.', 'freude'),
    erz('Kaum steht er vor dem Mikro, flackert die Lichterkette und geht aus. Quantum-Stromsperre, Block für Block, pünktlich wie die Bahn nie ist.'),
    L('Natürlich. Natürlich heute. Die Stadt hasst mich. Nein. Die Stadt liebt mich und Quantum hasst die Stadt. Das ist ein Unterschied. Das ist Lied sieben.', 'wut'),
  ], {
    choices: [
      {
        text: 'Den Generator vom Nachbardach anzapfen.', next: 'generator',
        check: pruefung('he-lio-10-generator', 'technik', 5, ['reparieren', 'strom']), effects: [herz(ID, 30)],
      },
      { text: '„Alle: Feuerzeuge. Telefone. Was leuchtet, hoch.“', next: 'lichter', effects: [herz(ID, 30)] },
    ],
  }),
  knoten('generator', [erz('Ein Verlängerungskabel quer über die Gasse, eine Steckdose, die nach Ozon riecht. Die Lichterkette springt wieder an. Unten jubelt jemand, der gar nicht eingeladen war.')], { next: 'premiere' }),
  knoten('lichter', [erz('Hundert kleine Lichter gehen an. Feuerzeuge, Displays, ein Leuchtstab von Dexter, auf dem „ZINSEN: EIN LÄCHELN“ steht. Das Dach sieht aus wie ein Sternenhimmel, der sich verlaufen hat.')], { next: 'premiere' }),
  knoten('premiere', [
    erz('Lio spielt sechs Lieder. Die Leute singen bei jedem mit, auch bei denen, die sie noch nie gehört haben.'),
    L('Lied Nummer sechs hat keinen Titel. Und keinen Reim. Weil es um jemanden geht, der sich auf nichts reimt.', 'zaertlich'),
    L('Das bist du. Du reimst dich auf nichts.'),
    erz('Nach dem letzten Ton drückt er dir eine Kassette in die Hand. Auf dem Etikett, schief: „LIO FUNKEL – STADT. Track 7 ist ein Geheimnis.“'),
  ], {
    effects: [{ give: 'lio-album' }, flag('lio_album_fertig'), { xp: 200 }],
    choices: [
      { text: '„Du hast es geschafft, Lio.“', next: 'freund', effects: [herz(ID, 50)] },
      { text: '„Und Track 7?“', tag: '[Romanze]', when: ROM, next: 'track7' },
    ],
  }),
  knoten('freund', [L('Wir. Wir haben es geschafft. Du hast die Stadt gesammelt, ich hab nur Krach dazu gemacht. Danke, {name}. Für alles.', 'freude')]),
  knoten('track7', [
    L('Track 7 ist ein Kuss. Also, noch nicht. Track 7 ist leer. Damit ich ihn jetzt aufnehmen kann.', 'verlegen'),
  ], {
    choices: [
      { text: 'Ihn unter der Lichterkette küssen.', next: 'kuss', effects: [{ cutscene: 'szene-rom-lio-dach' }, herz(ID, 60)] },
      { text: '„Langsam, Funkel. Ich bin kein Refrain zum Mitgrölen.“', next: 'langsam', effects: [herz(ID, 40)] },
    ],
  }),
  knoten('kuss', [
    erz('Unter der Lichterkette, Berta zwischen euch, die bei jeder Bewegung leise seufzt. Er schmeckt nach Synth-Kaffee und Lampenfieber. Irgendwo drückt jemand aus Versehen eine Taste, und das Akkordeon spielt einen Akkord, den es in keiner Musiktheorie gibt.'),
    L('… Das war Track 7. Ich nehm ihn nicht auf. Der gehört nur uns.', 'zaertlich'),
  ], { next: 'nacht', effects: [flag('lio-funkel_romanze_zusammen')] }),
  knoten('langsam', [
    L('Kein Refrain. Okay. Dann eine Ballade. Die sind langsam. Die haben Zeit.', 'zaertlich'),
    erz('Er nimmt deine Hand. Mehr nicht. Es ist genug, um Berta zum Seufzen zu bringen.'),
  ], { next: 'nacht', effects: [flag('lio-funkel_romanze_zusammen')] }),
  knoten('nacht', [
    erz('Die Gäste gehen. Die Lichterketten bleiben an. Lio packt Berta nicht ein.'),
    L('Ich spiel dir noch was. Leise. Ganz leise. Okay, ich spiel gar nichts.', 'verlegen'),
  ], {
    choices: [
      { text: 'Bleiben.', next: 'morgen', effects: [flag('lio-funkel_nacht'), { cutscene: 'szene-lio-nacht' }] },
      { text: '„Ein andermal, Funkel. Schreib solange.“', next: 'andermal' },
    ],
  }),
  knoten('morgen', [
    erz('Morgen danach. Lio summt ein neues Lied, das verdächtig nach letzter Nacht klingt. Am selben Nachmittag spielt er es am Bahnhof. Alle wissen Bescheid. Wirklich alle.'),
    L('Ich hab’s „Unbetitelt Nummer zwei“ genannt. Die Leute nennen es „Das mit dem Seufzen“. Ich kann mit beidem leben.', 'zaertlich'),
  ], { effects: [{ advanceTime: 480 }, { checkBuff: { id: 'beschwingt-lio', label: 'Beschwingt', value: 1, attribute: 'ausstrahlung', forDays: 0, consumes: false } }] }),
  knoten('andermal', [L('Ein andermal. Gut. Dann schreib ich solange ein Lied darüber, wie du „ein andermal“ sagst. Es wird sehnsüchtig. Und sehr, sehr laut.', 'signatur')]),
]);

// ---------------------------------------------------------------------------------------------- Wochenfrage (zusammen)

const hoch = dialog('lio-23-hoch', [
  knoten('start', [
    L('Hey. Du. Ich hab oben noch Synth-Kaffee. Und eine Lichterkette, die nur angeht, wenn jemand Schönes danebensteht. Kommst du nachher noch hoch?', 'zaertlich'),
  ], {
    choices: [
      { text: '„Mach die Lichterkette an.“', next: 'ja', effects: [flag('woche_lio_hoch'), herz(ID, 20)] },
      { text: '„Heute nicht, Funkel. Aber frag nächste Woche wieder.“', next: 'nein', effects: [flag('woche_lio_hoch')] },
    ],
  }),
  knoten('ja', [L('Berta! Augen zu! … Ich weiß. Trotzdem.', 'verlegen')], { effects: [{ cutscene: 'szene-lio-nacht' }], next: 'morgen' }),
  knoten('morgen', [
    erz('Am Morgen klebt ein Zettel an deiner Stirn. Darauf, in Lios Krakelschrift, eine neue Zeile: „Du schläfst wie ein Refrain. Immer wieder gern.“'),
  ], { effects: [{ advanceTime: 480 }, { checkBuff: { id: 'beschwingt-lio', label: 'Beschwingt', value: 1, attribute: 'ausstrahlung', forDays: 0, consumes: false } }] }),
  knoten('nein', [L('Nächste Woche. Ich schreib’s mir auf. Auf die Hand. Und auf Berta. Berta vergisst nichts.', 'freude')]),
]);

// ---------------------------------------------------------------------------------------------- Phasen und Fahrplan

export function akt23(M: Menue): { dialogues: DialogueDef[]; talk: TalkDef[]; schedule: ScheduleEntry[]; teil: ContentPart } {
  const p = phasen(ID, 'lio-23', M, [
    {
      id: 'master', when: MASTER, ohneMenue: true,
      gruss: [
        L('Ich spiel nicht für dich. Ich spiel nie wieder für dich.', 'wut'),
        erz('Er spielt trotzdem. Ein Lied ohne Worte, in Moll, so leise, dass nur du es hörst. Es heißt, das weißt du sofort, „Für jemanden, der weg ist“.'),
      ],
    },
    {
      id: 'ende-3b', when: ENDE_3B, einmal: true,
      gruss: [
        L('Du bist zurück! Ich hab ein Lied geschrieben, als du weg warst. Es war schrecklich. Ich hab’s verbrannt. Berta hat geweint. Jetzt schreib ich ein neues. Es heißt „Doch noch“.', 'freude'),
        L('Der Refrain geht: „Doch noch, doch noch, doch noch Meer.“ Ich arbeite am Rest. Der Rest ist schwer, weil ich die ganze Zeit grinse.'),
      ],
    },
    {
      id: 'ende-nexus', when: ENDE_NEXUS, einmal: true,
      gruss: [
        L('Die Stadt-KI hat sich mein Album gewünscht. Zum Lernen. Sie sagt, Menschen erklären sich in Liedern besser als in Gesetzen. Ich hab sie gefragt, welcher Track ihr Lieblingslied ist. Sie hat gesagt: Track 7.', 'ueberrascht'),
        L('Track 7 ist leer. Sie mag die Stille dazwischen. Ich glaub, wir verstehen uns.'),
      ],
    },
    {
      id: 'ende-meer', when: ENDE_MEER, einmal: true,
      gruss: [
        L('Ich hab am Meer gespielt. Am Meer! Die Wellen kommen immer auf die Eins. Ich hab noch nie so eine gute Rhythmusgruppe gehabt. Und sie wollen kein Geld.', 'freude'),
        L('Freitags bin ich auf der Strandclub-Bühne. Am Wochenende am Lagerfeuer. Und Karl, die Krabbe, tanzt. Seitwärts. Natürlich.'),
      ],
    },
    {
      id: 'epilog-rom', when: alle(EPILOG_FREI, ZUSAMMEN), taeglich: true,
      gruss: [L('Da bist du ja. Ich hab heute schon drei Lieder über dich geschrieben. Eins davon ist gut. Zwei sind sehr peinlich. Ich spiel dir die peinlichen.', 'zaertlich')],
      plausch: [L('Weißt du, was das Schönste am Nachspiel ist? Dass keiner mehr einen Countdown hat. Ich kann ein Lied zehn Minuten lang machen. Und du hörst zu.', 'zaertlich')],
    },
    {
      id: 'epilog', when: EPILOG_FREI, taeglich: true,
      gruss: [L('{name}! Das Album hat sich achtzig Mal verkauft! Achtzig! Sechzig davon an Dexter. Er verschenkt sie als Zahlungserinnerung. Aber hey: verkauft.', 'freude')],
      plausch: [L('Ich schreib jetzt das zweite Album. Es heißt „Danach“. Es ist über die Stadt, wenn keiner mehr lächeln muss. Viel Platz für Pausen.', 'signatur')],
    },
    {
      id: 'akt3', when: AKT3_NACHT, einmal: true, effects: [flag('lio_ablenkung')],
      gruss: [
        L('Heute Nacht spiel ich unten vor dem Turm. Laut. Sehr laut. Wenn alle Wachen zu mir gucken, gucken sie nicht zu dir. Das ist mein Beitrag. Ich bin die Ablenkung. Ich war immer schon die Ablenkung.', 'signatur'),
        L('Und wenn du oben bist und Angst kriegst: Hör hin. Irgendwo da unten spielt einer nur für dich.', 'zaertlich'),
      ],
    },
    {
      id: 'akt3-nach', when: AKT3_NACHT,
      gruss: [L('Geh. Berta und ich halten unten die Stellung. Und wenn sie uns wegtragen, spielen wir im Liegen weiter.', 'besorgt')],
    },
    {
      id: 'party', when: PARTY_VORB, taeglich: true,
      gruss: [L('Releaseparty! Die haben eine Band gebucht. Eine Quantum-Band. Die spielen nur Lieder, die Chrome 10 erlaubt. Drei Akkorde, alle in Dur. Ich krieg Ausschlag.', 'wut')],
      plausch: [L('Wenn ich da reinkomme, spiel ich das Protestlied. Auf deren Anlage. Hunter sagt, das ist Selbstmord. Ich sag, das ist Kunst. Manchmal ist das dasselbe.', 'signatur')],
    },
    {
      id: 'gerettet', when: alle(COUNTDOWN_DONE, { notFlag: 'epilog' }), einmal: true,
      gruss: [
        L('Aria ist zurück. Sie hat mich gestern angebrüllt, weil ich zu laut gespielt habe. Ich hab vor Freude geheult. Sie hat mich wieder angebrüllt. Weil ich geheult hab. Bestes Konzert meines Lebens.', 'freude'),
        A('Wenn du das in ein Lied packst, Funkel, pack ich dich in einen Container.'),
      ],
    },
    {
      id: 'nyra', when: NYRA_WEG, taeglich: true,
      gruss: [L('Ich spiel jede Nacht auf Nyras alter Frequenz. Falls sie irgendwo ein Radio hat. Falls sie zuhört. Falls sie noch weiß, wie Musik geht.', 'trauer')],
      plausch: [L('Das Lied heißt „Haarnadel“. Es hat keinen Refrain. Den kriegt es erst, wenn sie wieder da ist.', 'trauer')],
    },
    {
      id: 'chip', when: ARIA_GECHIPPT, taeglich: true,
      gruss: [L('Ich hab Aria ein Lied gespielt. Ihr Lied. Das mit den Fäusten und dem Bier. Sie hat geklatscht. Höflich. Aria klatscht nie höflich. Aria klatscht dir eine.', 'trauer')],
      plausch: [L('Aber bei der zweiten Strophe hat ihr linkes Auge gezuckt. Ich schwör’s. Da ist noch was. Ganz hinten. Es wartet auf den Refrain.', 'besorgt')],
    },
    {
      id: 'akt2', when: AKT2_NUR, taeglich: true,
      gruss: [L('Am Bahnhof hört keiner mehr zu. Die Gechippten laufen vorbei und lächeln in die Luft. Ich spiel trotzdem. Für die, die noch nicht lächeln. Die werfen jetzt doppelt so viel in den Hut.', 'signatur')],
      plausch: [L('Quantum hat „nicht registrierte Darbietungen“ verboten. Ich hab mich registriert. Als „Lärmbelästigung, freiwillig“. Der Beamte hat gelacht. Ich glaub, der war nicht gechippt.', 'freude')],
    },
  ]);

  const schedule: ScheduleEntry[] = [
    // Nachspiel Meer: am Wochenende abends am Lagerfeuer (Strandbühne freitags und Funkturm stehen in npc-oednis/folgen.ts).
    { slot: 'abend', days: ['sa', 'so'], when: ENDE_MEER, place: { map: 'das-meer', at: 'lagerfeuer' } },
  ];

  const talk: TalkDef[] = [
    rede('lio-23-hoch', alle(ZUSAMMEN, { time: ['abend', 'nacht'] }, { notFlag: 'woche_lio_hoch' }, nicht(MASTER), nicht(AKT3_NACHT))),
    ...p.talk,
  ];

  return { dialogues: [...p.dialogues, he8, he10, hoch], talk, schedule, teil: { abilities: { [STADTHIT.id]: STADTHIT } } };
}
