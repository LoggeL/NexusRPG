// Dexter in Akt 2, Akt 3 und im Nachspiel (world.md §4.4, §5.3 prep-gegenmittel, act23.json he-dexter-8/10).
// Kein eigener Inhaltsteil: dexter.ts holt Menü-Ergänzung, Phasen-Gespräche und he-dexter-8/10 von hier.
import type { ContentPart } from '../../part';
import type { DialogueDef, ScheduleEntry, TalkDef } from '../../../modules/contracts';
import {
  type Menue, AKT2_NUR, AKT3_NACHT, ARIA_GECHIPPT, COUNTDOWN_DONE, ENDE_3B, ENDE_MEER, ENDE_NEXUS, EPILOG_FREI, MASTER,
  PARTY_VORB, dialog, erz, flag, herz, ich, knoten, phasen, pruefung, sprecher,
} from './_helfer';

const D = sprecher('dexter');
const H = sprecher('hunter');
const A = sprecher('aria');
const JA = sprecher('jakko');

// ---------------------------------------------------------------------------------------------- Menü (ab Akt 2)

export const MENUE_23: Menue = {
  choices: [
    {
      text: 'Hast du Quantum-Chipschrott? Dante braucht welchen für ein Gegenmittel.', next: 'd23-schrott',
      when: { all: [{ quest: 'prep-gegenmittel', state: 'active' }, { notFlag: 'dexter_chipschrott' }] },
    },
    {
      text: 'Was machst du eigentlich mit den ganzen abgeschossenen Drohnen?', next: 'd23-drohnen',
      when: { all: [AKT2_NUR, { notFlag: 'dexter_23_drohnen' }] }, effects: [flag('dexter_23_drohnen'), herz('dexter', 10)],
    },
  ],
  nodes: [
    knoten('d23-schrott', [
      D('Chipschrott? Ich? Ich hab nur das, was vom Himmel fällt. Und seit Quantum Drohnen über die Unterstadt schickt, fällt viel vom Himmel.', 'signatur'),
      erz('Er zieht eine Keksdose unter dem Schreibtisch hervor. Darin klimpern Chips. Manche blinken noch. Einer flüstert „Master“.'),
      D('Normalerweise dreißig Credits das Stück. Für die Crew … dreißig Credits. Ich hab Fixkosten! Ich hab Gerlinde!', 'besorgt'),
    ], {
      choices: [
        { text: 'Dreißig Credits zahlen.', requires: { credits: 30 }, next: 'd23-schrott-gekauft', effects: [{ credits: -30 }, { give: 'quantum-chip-schrott' }, flag('dexter_chipschrott')] },
        {
          text: '„Dexter. Die VHS. Die zehn Credits. Wir sind quitt, wenn du mir einen gibst.“', next: 'd23-schrott-quitt',
          check: pruefung('dexter-23-chipschrott', 'strasse', 5, ['verhandeln']), effects: [{ give: 'quantum-chip-schrott' }, flag('dexter_chipschrott'), herz('dexter', 10)],
        },
        { text: 'Lass mal.', next: 'menue' },
      ],
    }),
    knoten('d23-schrott-gekauft', [D('Danke! Ich schreib dir eine Quittung. Auf einen Chrome-10-Gutschein. Die Rückseite ist noch gut.', 'freude')], { next: 'menue' }),
    knoten('d23-schrott-quitt', [D('Die VHS … die VHS war ein Geschenk! … Okay. Okay, quitt. Das ist das erste Mal, dass ich mit jemandem quitt bin. Das fühlt sich komisch an. Gut komisch.', 'ueberrascht')], { next: 'menue' }),
    knoten('d23-drohnen', [
      D('Ich bau sie um! Aus einer Quantum-Wachdrohne mach ich drei Lieferdrohnen und einen Toaster. Der Toaster sagt „Master“, wenn das Brot fertig ist. Ich arbeite dran.', 'freude'),
      D('Gerlinde frisst die Rotoren. Sie sagt, sie schmecken nach Oberstadt. Also nach nichts. Aber teuer.'),
    ], { choices: [{ text: 'Noch was, Dexter.', next: 'menue' }, { text: 'Bis dann. Zahl deine Schulden.' }] }),
  ],
};

// ---------------------------------------------------------------------------------------------- Herz-Ereignis 8

/** ♥8 (High Voltage, abends, act2): Dexter zahlt Hunter zurück – fast. */
const he8 = dialog('he-dexter-8', [
  knoten('start', [
    erz('High Voltage, früher Abend. Dexter trägt einen Anzug, dessen Ärmel ausnahmsweise dranbleiben. Er sitzt an seinem Tisch und zählt zum vierten Mal einen Stapel Scheine, der nach Maschinenöl riecht.'),
    D('{name}! Gut, dass du da bist. Heute ist der Tag. Ich zahl Hunter zurück. Alles. Zwölfhundert. Aus dem Verkauf von Quantum-Drohnenteilen. Die fallen ja jetzt praktisch vom Himmel.', 'freude'),
    D('Ich hab nur … ein winziges Problem. Ein klitzekleines. Kaum der Rede wert.', 'besorgt'),
    ich('Wie viel fehlt?'),
    D('Zweihundert. Und ein bisschen Mut. Der Mut fehlt mehr.', 'besorgt'),
  ], {
    choices: [
      { text: 'Ihm die zweihundert Credits leihen.', requires: { credits: 200 }, next: 'geliehen', effects: [{ credits: -200 }, herz('dexter', 40), flag('dexter_zweihundert_geliehen')] },
      {
        text: '„Wir verhandeln. Zinsen gegen Drohnenwartung für den Club. Lass mich reden.“', next: 'verhandelt',
        check: pruefung('he-dexter-8-verhandeln', 'strasse', 6, ['verhandeln']), effects: [herz('dexter', 40), herz('hunter', 10)],
      },
      { text: '„Zahl, was du hast. Den Rest arbeitest du ab. Das ist ehrlich.“', next: 'ehrlich', effects: [herz('dexter', 30)] },
    ],
  }),
  knoten('geliehen', [
    D('Du … leihst mir Geld. Mir. Dexter. Weißt du, was das heißt? Du bist jetzt Gläubiger Nummer sieben!', 'ueberrascht'),
    D('Ich schreib dich ins Buch. Mit einem Herz daneben. Und mit einem Datum. Einem echten. Diesmal mein ich’s.'),
  ], { next: 'tresen' }),
  knoten('verhandelt', [
    erz('Du gehst mit Dexter an den Tresen und redest, bevor Hunter etwas sagen kann. Wartung aller Kühlschrankdrohnen, ein Jahr lang. Ein neuer Ventilator für das Hinterzimmer. Und Dexter hält die Klappe, wenn Hunter Kreuzworträtsel löst.'),
    H('… Ein Jahr Wartung. Und er hält die Klappe.'),
    H('Neuling, wenn du so weitermachst, stell ich dich als Buchhalter ein. Und das ist keine Belohnung.'),
  ], { next: 'tresen' }),
  knoten('ehrlich', [
    D('Abarbeiten. Ich. Mit meinen Händen. Die haben noch nie was abgearbeitet. Die haben nur … aufgeschoben.', 'besorgt'),
    D('Okay. Okay! Zehnhundert jetzt, zweihundert in Gläserspülen. Das ist ein Plan. Ich hab noch nie einen Plan gehabt, der nicht mit „irgendwann“ angefangen hat.', 'freude'),
  ], { next: 'tresen' }),
  knoten('tresen', [
    erz('Dexter marschiert zum Tresen. Der Club wird leiser. Irgendwer stellt die Musik ab. Dexter legt den Umschlag auf das Holz, als wäre er aus Glas.'),
    D('Hunter. Zwölfhundert. Alles da. Minus Gutscheine, die wir nicht erwähnen. Plus Zinsen, die wir erwähnen.', 'signatur'),
    H('…'),
    erz('Hunter zählt. Zweimal. Dann nimmt er die Sonnenbrille ab. Das macht er nie. Das hat ihn hier noch keiner machen sehen.'),
    H('Dexter. Du hast gezahlt.'),
    D('ICH HAB GEZAHLT! ICH ZAHLE IMMER! UND JETZT IST IRGENDWANN!', 'freude'),
    A('Ich wollte dich gerade ein letztes Mal verhauen. Jetzt hab ich nichts mehr vor heute Abend. Danke, Dexter. Echt nicht.'),
  ], {
    choices: [
      { text: 'Applaudieren. Laut.', next: 'applaus' },
      { text: '„Runde aufs Haus, Hunter?“', next: 'runde' },
      { text: 'Dexter den Schuldschein von der Wand geben lassen.', next: 'schein' },
    ],
  }),
  knoten('applaus', [erz('Der ganze Club klatscht mit. Dexter verbeugt sich so tief, dass ihm doch ein Ärmel abfällt. Er hebt ihn auf, verbeugt sich nochmal und verliert den zweiten.')], { next: 'ende' }),
  knoten('runde', [H('Eine Runde. Leitungswasser. Mit Strohhalm. Der Strohhalm geht aufs Haus. Ich bin ja kein Unmensch.')], { next: 'ende', effects: [herz('hunter', 20)] }),
  knoten('schein', [
    erz('Hunter greift hinter den Tresen, zieht einen vergilbten Zettel von einem Nagel – „Dexter: 1200. Viel Glück.“ – und schreibt quer darüber: „BEGLICHEN“. Dann reicht er ihn nicht Dexter, sondern dir.'),
    H('Heb den auf. Wenn er wieder anfängt, legst du ihm den auf den Tisch.'),
  ], { next: 'ende', effects: [{ give: 'beglichener-schuldschein' }] }),
  knoten('ende', [
    D('Das ist der beste Tag meines Lebens. Und morgen fang ich ein neues Leben an. Eins ohne Schulden. Ich weiß gar nicht, wie das geht. Hilfst du mir?', 'freude'),
  ], { effects: [flag('dexter_hunter_bezahlt'), { xp: 120 }, herz('dexter', 20)] }),
]);

// ---------------------------------------------------------------------------------------------- Herz-Ereignis 10

/** ♥10 (Wellblechbüro, tags, act2 nach ♥8): Dexters Leihhaus öffnet – erster Kunde, Zinssatz, Andenken. */
const he10 = dialog('he-dexter-10', [
  knoten('start', [
    erz('Über dem Wellblechbüro auf der Halde hängt ein neues Schild, handgemalt, noch feucht: „DEXTERS LEIHHAUS – Kredit für alle, die keinen kriegen.“ Darunter ein leerer Fleck, wo der Zinssatz hin soll.'),
    D('{name}! Eröffnung! Heute! Du bist Ehrengast. Und Bürge. Und Berater. Und ich hab Kekse gekauft. Aus der Packung. Ehrlich ausgepackt.', 'freude'),
    D('Ich hab nur eine Frage. Die wichtigste. Was schreib ich unten hin? Zinsen. Leute wie ich brauchen Kredit. Aber Leute wie ich haben auch kein Geld für Zinsen.', 'besorgt'),
  ], {
    choices: [
      { text: '„Zinsen: ein Lächeln.“', next: 'laecheln', effects: [herz('dexter', 30)] },
      { text: '„Zwei Prozent. Und wer nicht zahlen kann, kriegt Suppe statt Mahnung.“', next: 'suppe', effects: [herz('dexter', 30)] },
      {
        text: '„Keine Zinsen. Aber eine Regel: Chrome-10-Chips nimmst du nie als Pfand. Nie.“', next: 'regel',
        check: pruefung('he-dexter-10-regel', 'ausstrahlung', 6, ['ueberzeugen']), effects: [herz('dexter', 40), { rep: 'unterstadt', delta: 3 }],
      },
    ],
  }),
  knoten('laecheln', [erz('Dexter malt mit zitternder Hand: „ZINSEN: EIN LÄCHELN“. Dann tritt er zurück und betrachtet es, als hätte er gerade die Mona Lisa gemalt. Mit Rechtschreibfehler. „LÄCHLEN“. Ihr lasst es so.')], { next: 'kunde' }),
  knoten('suppe', [erz('„2 % – WER NICHT KANN, KRIEGT SUPPE“. Babette schickt, kaum dass das Schild trocken ist, einen Topf herüber. Mit Zettel: „Für die ersten drei Pleiten. Danach kostet’s.“')], { next: 'kunde' }),
  knoten('regel', [
    D('Nie. Auch nicht, wenn sie glänzen. Auch nicht, wenn sie „Master“ flüstern und ich einsam bin.', 'ueberrascht'),
    erz('Er schreibt es ganz unten aufs Schild, in Großbuchstaben: „KEINE CHIPS ALS PFAND. AUCH KEINE HÜBSCHEN.“'),
  ], { next: 'kunde', effects: [flag('dexter_keine_chips')] }),
  knoten('kunde', [
    erz('Der erste Kunde steht schon da: Jakko aus dem Nest, die Mütze in den Händen, ein zerbeultes Kochbuch unter dem Arm.'),
    JA('Ich brauch zwanzig Credits. Für einen Topf. Einen richtigen. Ich zahl’s zurück. Mit Essen. Ich koch jetzt.'),
    D('Zwanzig … für einen Topf … mit Essen zurück.', 'besorgt'),
    erz('Dexter sieht dich an. Er sieht aus wie jemand, der gleich zum ersten Mal in seinem Leben auf der anderen Seite des Tisches sitzt.'),
  ], {
    choices: [
      { text: 'Nicken. „Das ist dein Laden, Dexter.“', next: 'kredit' },
      { text: '„Gib ihm dreißig. Ein Deckel gehört dazu.“', next: 'deckel', effects: [herz('jakko', 20)] },
    ],
  }),
  knoten('kredit', [D('Zwanzig Credits, Jakko. Rückzahlung: ein Teller. Wenn er schmeckt, zwei. Und wenn nicht, sagen wir beide, dass er geschmeckt hat. So läuft das hier.', 'freude')], { next: 'buch' }),
  knoten('deckel', [D('Dreißig! Mit Deckel! Ein Topf ohne Deckel ist wie ein Schuldner ohne Ausrede. Halb so viel wert.', 'signatur')], { next: 'buch' }),
  knoten('buch', [
    erz('Als Jakko weg ist, zieht Dexter sein altes Gläubigerbuch aus der Schublade. Jede Zeile ist durchgestrichen. Neben jeder steht in wackliger Schrift: „Bezahlt.“ Neben Hunter steht: „Bezahlt. Er hat die Brille abgenommen.“'),
    D('Das ist für dich. Mein Schuldbuch. Das Einzige, was ich nie wieder brauche. Wenn du’s aufschlägst, siehst du, wer ich mal war. Und wenn du’s zuschlägst, wer ich jetzt bin.', 'signatur'),
  ], {
    effects: [{ give: 'dexters-schuldbuch' }, flag('dexter_leihhaus'), { xp: 200 }],
    choices: [
      { text: '„Ich bin stolz auf dich, Dexter.“', next: 'stolz' },
      { text: '„Und wo steh ich jetzt? Gläubiger Nummer sieben?“', when: { flag: 'dexter_zweihundert_geliehen' }, next: 'sieben' },
    ],
  }),
  knoten('stolz', [D('Sag das nicht so laut. Sonst muss ich weinen. Und Weinen kostet bei mir jetzt Gebühren. Ein Lächeln.', 'besorgt')], { effects: [herz('dexter', 50)] }),
  knoten('sieben', [
    erz('Dexter zieht einen Umschlag aus der Jackentasche. Zweihundert Credits, sauber gezählt, mit einem Zettel: „Für Nummer sieben. Pünktlich. Zum ersten Mal.“'),
    D('Ich zahle immer. Und jetzt sogar rechtzeitig. Ich erkenn mich selbst nicht wieder. Ich mag den Typen.', 'freude'),
  ], { effects: [{ credits: 200 }, herz('dexter', 50), flag('dexter_zweihundert_geliehen', false)] }),
]);

// ---------------------------------------------------------------------------------------------- Phasen

export function akt23(M: Menue): { dialogues: DialogueDef[]; talk: TalkDef[]; schedule: ScheduleEntry[]; teil: ContentPart } {
  const p = phasen('dexter', 'dexter-23', M, [
    {
      id: 'master', when: MASTER, ohneMenue: true,
      gruss: [
        D('Nicht chippen! Bitte nicht chippen! Ich zahle! Ich zahle immer! Sofort! Was wollen Sie, Master? Gerlinde? Nehmen Sie Gerlinde!', 'besorgt'),
        erz('Er zieht die Rollläden des Büros herunter, bevor du antworten kannst. Von drinnen meckert Gerlinde. Es klingt wie ein Modem, das weint.'),
      ],
    },
    {
      id: 'ende-3b', when: ENDE_3B, einmal: true,
      gruss: [D('Du bist zurück! Du bist wieder du! Ich hab dir die ganze Zeit einen Kredit freigehalten. Für den Fall, dass du einen Neuanfang brauchst. Zinsen: ein Lächeln. Du lächelst! Abbezahlt!', 'freude')],
    },
    {
      id: 'ende-nexus', when: ENDE_NEXUS, einmal: true,
      gruss: [
        D('Die KI hat mir eine Mahnung geschickt. Nein, warte. Keine Mahnung. Eine Zahlungserinnerung. Mit Smiley. Ist das schlimmer? Das fühlt sich schlimmer an.', 'besorgt'),
        D('Sie hat gefragt, ob sie mir beim Haushaltsbuch helfen darf. Ich hab Ja gesagt. Sie hat geweint. Also, nicht echt. Aber die Lüftung hat geschluchzt.'),
      ],
    },
    {
      id: 'ende-meer', when: ENDE_MEER, einmal: true,
      gruss: [
        D('Blade ist im Knast! Weißt du, was das heißt? Quantum schuldet mir noch drei Drohnen-Rückkaufprämien. Ich hab einen Anwalt. Er heißt Gerlinde.', 'freude'),
        D('Und ich war am Meer! Mit Kiki! Ich hab Muscheln gesammelt und sie als Pfand angenommen. Im Leihhaus. Die Leute zahlen jetzt in Muscheln. Das ist eine Währung. Sagt Jakko.'),
      ],
    },
    {
      id: 'epilog', when: EPILOG_FREI, taeglich: true,
      gruss: [D('Leihhaus läuft! Vierzehn Kunden, dreizehn haben gezahlt, einer hat Suppe gekriegt. Ich bin das erste Kreditinstitut der Stadt mit Rückzahlungsquote. Hunter hat geweint. Er sagt, Staub.', 'freude')],
      plausch: [D('Manchmal sitz ich abends da und hab keine Schulden. Einfach so. Ich hör’s richtig still werden. Es ist … unheimlich. Ich hab mir zur Beruhigung eine Ziege gekauft. Eine zweite. Sie heißt Inkasso.', 'signatur')],
    },
    {
      id: 'akt3', when: AKT3_NACHT,
      gruss: [D('Heute Nacht? Die Party? Ich drück die Daumen. Alle. Auch die von Gerlinde. Sie hat keine, aber sie gibt sich Mühe.', 'besorgt')],
    },
    {
      id: 'party', when: PARTY_VORB, taeglich: true,
      gruss: [D('Releaseparty! Ich hab gehört, es gibt Buffet. Kannst du mir was mitbringen? Häppchen? Diese kleinen Würstchen? Ich zahl … du weißt schon.', 'signatur')],
      plausch: [D('Ernsthaft. Pass auf da oben. Blade hat Leute, die nicht so nett sind wie Inkasso-Typen. Inkasso-Typen brechen dir nur die Finger. Quantum bricht dir die Gedanken.', 'besorgt')],
    },
    {
      id: 'gerettet', when: { all: [COUNTDOWN_DONE, { notFlag: 'epilog' }] }, einmal: true,
      gruss: [
        D('Aria ist wieder wach? Ehrlich? Oh nein. Ich meine: Oh ja! Oh nein! Beides!', 'besorgt'),
        D('Ich freu mich. Wirklich. Ich versteck mich ab morgen wieder morgens hinter dem Ölfass. Aber ich freu mich. Das ist wie Weihnachten mit Inkasso.'),
      ],
    },
    {
      id: 'chip', when: ARIA_GECHIPPT, taeglich: true,
      gruss: [D('Seit Aria nicht mehr kommt, versteck ich mich trotzdem. Aus Gewohnheit. Und weil ich Angst hab, dass sie zurückkommt und nicht mehr sie ist.', 'besorgt')],
      plausch: [D('Gestern hat mir ein Gechippter seinen Chrome-10-Chip als Pfand angeboten. Er hat gelächelt dabei. Ich hab Nein gesagt. Zum ersten Mal Nein zu Geld. Es hat wehgetan. Im Portemonnaie und woanders.')],
    },
    {
      id: 'akt2-a', when: { all: [AKT2_NUR, { weekday: ['mo', 'mi', 'fr', 'so'] }] }, taeglich: true,
      gruss: [D('Hast du die Drohnen gesehen? Quantum-Drohnen über der Halde! Die zählen meinen Schrott! Eine hat „Inventur abgeschlossen“ gesagt und ist weggeflogen. Mit meinem Toaster!', 'wut')],
      plausch: [D('Ich hab meine Chrome-10-Gutscheine endlich eingelöst. Weißt du, was ich dafür gekriegt hab? Einen Chip. Ich hab ihn Gerlinde gegeben. Sie hat ihn gefressen. Jetzt sagt sie „Master“ beim Meckern.', 'signatur')],
    },
    {
      id: 'akt2-b', when: AKT2_NUR, taeglich: true,
      gruss: [D('Geschäfte laufen! Also, nicht gut. Aber sie laufen. Weg. Die Leute kaufen nur noch Chips. Wer braucht Schrott, wenn er Upgrades kriegt?', 'besorgt')],
      plausch: [D('Ich hab ein Schild gemalt: „HIER GIBT ES KEINE CHIPS. NUR EHRLICHEN SCHROTT.“ Zwei Kunden. Einer hat sich verlaufen. Der andere war Ripper. Er hat nur gelacht.')],
    },
  ]);

  return { dialogues: [...p.dialogues, he8, he10], talk: p.talk, schedule: [], teil: {} };
}
