// Bolzen – ausgemusterter Quantum-Wachhund, Alpha der Brackbucht, danach Haustier (world.md §4.4, §6.2 #20, §11.2).
// Erscheint erst nach side-hunde-der-brackbucht (Flag bolzen_umprogrammiert von maps/flutmauer oder Quest erledigt);
// vorher ist der Alpha Teil der Begegnung an der Flutmauer, daher hier away. Danach Hundekorb im Crew-Quartier,
// tagsüber auf den Dächern der Neon-Gasse. Herz-Ereignisse he-bolzen-2/4/6, 8/10 ab act2 (bolzen-akt23.ts).
// Morgenfunde: eine Woche lang je Wochentag ein Fund im Tagesgespräch (echter Tagesfund fehlt in der Engine, siehe Lücken).
// Persönliche Quest pers-bolzen-bein baut der Quest-Agent; hier nur der Auftakt.
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode, NpcDef, Weekday } from '../../../modules/contracts';
import {
  type Menue, einmalig, AKT2, VOR_AKT2, alle, dialog, eins, erz, flag, herz, herzEreignis, ich, knoten, nicht, pruefung, rede,
  sammle, sprecher, tagesgespraech, ZEIT_HINWEIS, erweitere,
} from './_lib';
import { BELLEN, MENUE_23, SCHNUEFFELN, akt23 } from './bolzen-akt23';

const ID = 'bolzen';
const B = sprecher(ID);
const V = sprecher('vega');
const D = sprecher('dante');
const K = sprecher('captain-kuschel');

/** Bolzen gehört zur Crew (gleiche Bedingung wie maps/crew-quartier.ts, plus Umprogrammier-Flag). */
const DA: Condition = eins({ quest: 'side-hunde-der-brackbucht', state: 'done' }, { flag: 'bolzen_umprogrammiert' });

// ---------------------------------------------------------------------------------------------- Menü

function menue(): Menue {
  const zurueck: DialogueChoice[] = [{ text: 'Noch was, Bolzen.', next: 'menue', id: 'zurueck' }, { text: 'Braver Hund.' }];
  const choices0: DialogueChoice[] = [
    { text: 'Bolzen, bei Fuß! Du kommst mit.', when: alle(DA, nicht({ companion: ID })), next: 'mit', effects: [{ recruit: ID }] },
    { text: 'Bolzen, Platz. Korb.', when: { companion: ID }, next: 'korb', effects: [{ dismiss: ID }] },
    { text: 'Hinter den Ohren kraulen.', next: 'kraulen', id: 'b-kraulen' },
    { text: 'Bolzen, Sitz!', next: 'sitz', id: 'b-sitz' },
    { text: 'Was ist mit deinem Hinterbein?', when: alle(DA, { quest: 'pers-bolzen-bein', state: 'inactive' }), next: 'bein', id: 'b-bein' },
    { text: 'Den Wartungsport hinterm Ohr checken.', check: pruefung('bolzen-wartung', 'technik', 5, ['drohne', 'maschine']), once: true, id: 'b-wartung', next: 'wartung' },
    { text: 'Braver Hund.' },
  ];
  const choices = einmalig(ID, choices0);
  const nodes: DialogueNode[] = [
    knoten('menue', [B('Wuff? (Das heißt: Noch was? Ich hab Zeit. Hunde haben immer Zeit. Und Hunger.)', 'freude')], { choices }),
    knoten('mit', [
      erz('Bolzen springt auf, dreht sich dreimal im Kreis und sprüht dabei Funken aus dem Schwanz-Servo. Eine Socke fängt Feuer. Er tritt sie aus. Stolz.'),
      B('WUFF! (Das heißt: Endlich! Wohin? Egal! Ich beiß, wen du willst! Also, ich bell. Beißen ist nicht mehr erlaubt. Steht in meinem neuen Code.)', 'freude'),
    ]),
    knoten('korb', [
      B('Wuff. (Das heißt: Okay. Aber ich bin beleidigt. Für genau zwölf Sekunden.)', 'neutral'),
      erz('Er trottet zum Korb, dreht sich viermal und legt sich mit dem Hinterteil zu dir. Nach zwölf Sekunden wedelt er.'),
    ]),
    knoten('kraulen', [
      erz('Du kraulst Bolzen hinter dem Ohr. Sein Hinterbein trommelt auf den Boden. Aus seinem Lautsprecher kommt ein Geräusch zwischen Brummen und Modem.'),
      B('Brrrrrrmmmmpiiiiiep. (Das heißt nichts. Das ist reines Glück in Hexadezimal.)', 'freude'),
    ], { choices: zurueck }),
    knoten('sitz', [
      erz('Bolzen setzt sich. Sofort. Kerzengerade. Seine Augen leuchten blau, und aus dem Lautsprecher kommt eine alte Stimme: „EINHEIT 7-B BEREIT. ZIEL BENENNEN.“'),
      erz('Dann schüttelt er sich, niest Funken und legt sich auf den Rücken. Bauch kraulen. Jetzt.'),
      B('Wuff. (Das heißt: Entschuldige. Alte Gewohnheit. Ich war mal ein Wachhund. Jetzt bin ich ein Kraulhund.)'),
    ], { choices: zurueck }),
    knoten('bein', [
      erz('Bolzens linkes Hinterbein knirscht bei jedem Schritt. Ein Gelenk ist mit Klebeband geflickt, das Servo heult wie ein Wasserkocher kurz vorm Platzen.'),
      B('Wuff … (Das heißt: Tut nicht weh. Okay, ein bisschen. Okay, sehr. Ich bin ein tapferer Hund.)', 'neutral'),
      ich('Gustav und Dante kriegen das bestimmt hin. Oder Dexter hat was auf der Halde.'),
    ], {
      choices: [
        { text: 'Wir besorgen dir ein neues Bein.', next: 'bein-ja', effects: [{ startQuest: 'pers-bolzen-bein' }] },
        { text: 'Halt durch, Kumpel.', next: 'menue' },
      ],
    }),
    knoten('bein-ja', [B('WUFF! WUFF! (Das heißt: Ein NEUES Bein! Ein schnelles! Mit Raketen! Bitte mit Raketen!)', 'freude')], { choices: zurueck }),
    knoten('wartung', [
      erz('Du klappst die Wartungsbuchse auf. Auf dem Mini-Display scrollen Zeilen: „SCHNÜFFELMODUL: AKTIV. GEFAHRENERKENNUNG: AKTIV. LIEBLINGSMENSCH: {name}.“'),
      erz('Darunter, frisch eingetragen und mit Ausrufezeichen: „KANALSCHLAMM: LECKER!“'),
      B('Wuff. (Das heißt: Nicht lesen! Das ist privat!)', 'wut'),
    ], { choices: zurueck, effects: [herz(ID, 20), flag('bolzen_wartung_gesehen')] }),
  ];
  return { choices, nodes };
}

const M = erweitere(menue(), MENUE_23);

// ---------------------------------------------------------------------------------------------- Morgenfunde (Notbehelf)

/** Nach he-bolzen-2: Je Wochentag einmal ein Fund, insgesamt eine Woche lang (world.md §4.4 „Jeden Morgen ein kleiner Fund“). */
const FUNDE: { tag: Weekday; item: string; text: string }[] = [
  { tag: 'mo', item: 'rostige-schraube', text: 'Eine rostige Schraube, sorgfältig abgeleckt. Sie glänzt. Ein bisschen. Vor allem ist sie nass.' },
  { tag: 'di', item: 'glitzerschrott', text: 'Ein Klumpen Glitzerschrott, der aussieht wie ein Stern, wenn man blinzelt. Bolzen blinzelt. Du sollst auch blinzeln.' },
  { tag: 'mi', item: 'murmelbeutel', text: 'Ein Beutel Murmeln. Am Beutel klebt ein Zettel in Kinderschrift: „JAKKO“. Bolzen guckt sehr unschuldig.' },
  { tag: 'do', item: 'leckerli-schraube', text: 'Eine Tüte Leckerli-Schrauben. Halb leer. Die andere Hälfte ist in Bolzen. Er rülpst Funken.' },
  { tag: 'fr', item: 'quietsche-mutter', text: 'Eine Quietsche-Mutter. Er legt sie dir hin, nimmt sie wieder weg, legt sie hin, nimmt sie weg. Am Ende lässt er sie liegen. Das ist Liebe.' },
  { tag: 'sa', item: 'comic-heft', text: 'Ein Comic-Heft, leicht angekaut. „Robo-Rex gegen die Müllmafia“. Bolzen hat Seite drei markiert. Mit Sabber.' },
  { tag: 'so', item: 'oelkaennchen', text: 'Ein Ölkännchen. Halb voll. Bolzen hat die andere Hälfte schon getrunken und ist jetzt sehr, sehr geschmeidig.' },
];

const fundGespraech = (f: { tag: Weekday; item: string; text: string }) => tagesgespraech(`bolzen-fund-${f.tag}`,
  [
    erz('Bolzen wartet schon. Er sitzt vor deinem Bett, Schwanz-Servo auf Anschlag, und legt dir etwas vor die Füße.'),
    erz(f.text),
    B('WUFF! (Das heißt: Für dich! Gefunden! Draußen! Nicht geklaut! Fast nicht geklaut!)', 'freude'),
  ],
  [B('Wuff wuff. (Das heißt: Morgen find ich was Besseres. Was Größeres. Vielleicht einen Toaster. Toaster sind gut.)')],
  M, { effects: [{ give: f.item }, flag(`bolzen_fund_${f.tag}`)] });

const FUND_DIALOGE = FUNDE.map(fundGespraech);

// ---------------------------------------------------------------------------------------------- Tagesgespräche

const T = {
  wild: tagesgespraech('bolzen-tag-wild',
    [
      erz('Ein großer Robohund mit verbeultem Kopf und einem Quantum-Logo, das jemand mit Kratzern unkenntlich gemacht hat. Er knurrt. Sein Schwanz-Servo wedelt trotzdem, verräterisch.'),
      B('GRRRRRR. (Das heißt: Geh weg. Oder bring Netze. Oder Schrauben. Eigentlich: Bring Schrauben.)', 'wut'),
    ],
    [B('Grrr … wuff? (Das heißt: Du bist immer noch da. Komisch. Die anderen rennen weg.)')],
    { choices: [{ text: 'Langsam zurückgehen.' }], nodes: [] }),
  erstes: tagesgespraech('bolzen-tag-erstes',
    [
      erz('Der ehemalige Alpha der Brackbucht sitzt vor dir, kerzengerade, mit leuchtenden Augen. Auf seiner Brust klebt ein Zettel in Henks krakeliger Schrift: „Er heißt Bolzen. Er gehört jetzt dir. Viel Glück. – H.“'),
      B('Piep. Wuff. (Das heißt: Hallo. Ich bin Bolzen. Ich bin jetzt deiner. Wo ist mein Korb? Wo ist mein Futter? Wo bist du die ganze Zeit gewesen?)', 'freude'),
    ],
    [B('Wuff. (Das heißt: Ich hab dich gerochen, bevor du gekommen bist. Du riechst nach Freund. Und nach Pommes. Hauptsächlich Pommes.)')],
    M),
  zeit: tagesgespraech('bolzen-tag-zeit',
    [
      erz('Bolzen gräbt im Korb. Er gräbt und gräbt, als würde er etwas Großes suchen, das noch nicht da ist. Dann guckt er dich an und legt den Kopf schief.'),
      erz(ZEIT_HINWEIS),
    ],
    [B('Wuff. (Das heißt: Irgendwann grab ich was Großes aus. Was richtig Großes. Mit Digitech-Logo. Wart’s ab.)')],
    M, { effects: [flag('bolzen_zeit_hinweis')] }),
  party: tagesgespraech('bolzen-tag-party',
    [B('WUFF WUFF! (Das heißt: Wir sind unterwegs! Abenteuer! Ich schnüffle schon! Da vorne riecht’s nach Ärger. Oder nach Wurst. Gleich weiß ich’s.)', 'freude')],
    [
      erz('Bolzen schnüffelt an einer Pfütze, an einem Laternenmast, an einem Rostzahn. Der Rostzahn guckt sehr nervös.'),
      B('Wuff. (Das heißt: Der riecht nach Angst. Gut. Ich mag es, wenn Leute vor mir Angst haben, die vor dir keine haben.)'),
    ],
    M),
  kuschel: tagesgespraech('bolzen-tag-kuschel',
    [
      erz('Bolzen liegt im Korb. Zwischen seinen Vorderpfoten, eingerollt wie ein Brötchen: Captain Kuschel. Der Hase schläft. Bolzen bewegt sich nicht. Er atmet nicht mal. Er bewacht.'),
      B('wff. (Das heißt, ganz leise: Psst. Er schläft. Weck ihn nicht. Er hat schlecht geträumt. Von Möhren ohne Grün.)', 'freude'),
    ],
    [B('wff. (Das heißt: Ich war mal ein Wachhund. Jetzt bin ich ein Hasenwachhund. Das ist eine Beförderung.)')],
    M),
  morgen: tagesgespraech('bolzen-tag-morgen',
    [B('Wuff! (Das heißt: Guten Morgen! Ich hab heute nix gefunden! Doch! Dich! Du warst die ganze Nacht da! Ich hab dich gefunden!)', 'freude')],
    [erz('Bolzen schleckt dir einmal quer übers Gesicht. Seine Zunge ist aus Silikon und schmeckt nach Maschinenöl. Es ist trotzdem süß.')],
    M),
  tag: tagesgespraech('bolzen-tag-daecher',
    [
      erz('Bolzen springt von Dach zu Dach, als gäbe es keine Schwerkraft. Er landet vor dir, schliddert, rutscht und bleibt mit dem Hintern in einer Regenrinne hängen.'),
      B('Wuff. (Das heißt: Absicht. Das war Absicht. Ich wollte hier sitzen.)', 'neutral'),
    ],
    [V('Dein Hund hat mir heute dreimal die Schussbahn gekreuzt. Beim dritten Mal hab ich ihm ein Leckerli zugeworfen. Sag’s keinem.')],
    M),
  nacht: tagesgespraech('bolzen-tag-nacht',
    [
      erz('Bolzen schläft im Korb. Seine Pfoten zucken. Er träumt. Aus dem Lautsprecher kommt leises Fiepen, dann ein gedämpftes „EINHEIT 7-B … KEINE FEINDE … NUR FREUNDE …“'),
      B('Wff. (Das heißt, im Schlaf: Schraube. Schraube. Kanalschlamm. Du.)'),
    ],
    [erz('Du deckst ihn mit einer alten Jacke zu. Er seufzt, ein langes, elektronisches Seufzen, und rollt sich enger zusammen.')],
    M),
  freund: tagesgespraech('bolzen-tag-freund',
    [B('WUFF! (Das heißt: DU! DU BIST DA! DU WARST WEG UND JETZT BIST DU DA! DAS IST DER BESTE TAG!)', 'freude')],
    [B('Wuff. (Das heißt: Jeder Tag, an dem du wiederkommst, ist der beste Tag. Ich hab viele beste Tage. Ich bin ein reicher Hund.)')],
    M),
  standard: tagesgespraech('bolzen-tag-standard',
    [B('Wuff? (Das heißt: Spielen? Futter? Kraulen? Alles drei? In der Reihenfolge?)')],
    [erz('Bolzen legt dir den Kopf aufs Knie und guckt dich mit seinen leuchtenden Augen an, bis du ihn kraulst. Das dauert nie lange.')],
    M),
};

// ---------------------------------------------------------------------------------------------- Herz-Ereignisse

/** ♥2 (Crew-Quartier, morgens): Der erste Fund – ab jetzt ein Fund pro Morgen. */
const he2 = dialog('he-bolzen-2', [
  knoten('start', [
    erz('Du wachst auf, weil dir etwas Kaltes ins Gesicht tropft. Bolzen steht auf deinem Bett. Mit allen vier Pfoten. Im Maul: ein Stromkabel, das noch irgendwo angeschlossen ist.'),
    B('Mmmpf! Mmmpf wuff! (Das heißt: Guck! Gefunden! Für dich! Es summt!)', 'freude'),
    erz('Das Kabel funkt. Bolzens Schnauze funkt. Deine Bettdecke funkt.'),
  ], {
    choices: [
      { text: 'Das Kabel vorsichtig rausziehen und abklemmen.', check: pruefung('he-bolzen-2-kabel', 'technik', 3, ['maschine']), next: 'kabel', effects: [herz(ID, 40)] },
      { text: '„AUS! Bolzen, AUS!“', next: 'aus', effects: [herz(ID, 20)] },
      { text: 'Ihn loben. Ganz doll. Das Kabel ignorieren.', next: 'loben', effects: [herz(ID, 40), { damage: 3 }] },
    ],
  }),
  knoten('kabel', [
    erz('Ein Griff, ein Ruck, ein Klick. Das Kabel ist tot, Bolzen ist ganz, die Decke riecht nur ein bisschen verbrannt.'),
    B('Wuff? (Das heißt: Hast du es kaputt gemacht? Mein Geschenk? … Egal, du hast mich angefasst! Bestes Geschenk!)', 'freude'),
  ], { next: 'ende' }),
  knoten('aus', [
    erz('Bolzen lässt sofort los. Das Kabel klatscht auf den Boden und erlischt. Bolzen legt die Ohren an und guckt dich an, als hättest du ihm das Herz gebrochen. Für drei Sekunden. Dann wedelt er wieder.'),
  ], { next: 'ende' }),
  knoten('loben', [
    erz('„Braver Hund! Der BESTE Hund!“ Bolzen wedelt so heftig, dass er das Kabel fallen lässt. Es trifft deinen Fuß. Du hast jetzt einen interessanten neuen Haarschnitt.'),
    B('WUFF! (Das heißt: Ich bin der beste Hund! Sie hat es gesagt! Er hat es gesagt! Es wurde gesagt!)', 'freude'),
  ], { next: 'ende' }),
  knoten('ende', [
    erz('Bolzen springt vom Bett, trabt zur Tür und guckt zurück. Dann bellt er einmal und rennt los, irgendwohin, wo es Dinge zu finden gibt.'),
    erz('Ab jetzt bringt Bolzen dir morgens Funde. Sprich ihn im Crew-Quartier an.'),
  ], { effects: [flag('bolzen_findet'), { xp: 30 }] }),
]);

/** ♥4 (Neon-Gasse, Dächer, tagsüber): Apportieren auf den Dächern. */
const he4 = dialog('he-bolzen-4', [
  knoten('start', [
    erz('Dachterrasse über der Neon-Gasse. Bolzen hat ein Stück Rohr im Maul und legt es dir vor die Füße. Dann geht er drei Schritte zurück, geht in Position und zittert vor Vorfreude.'),
    B('Wuff. Wuff. WUFF. (Das heißt: Wirf. Wirf. WIRF ES!)', 'freude'),
  ], {
    choices: [
      { text: 'Die Quietsche-Mutter werfen. Weit.', when: { item: 'quietsche-mutter' }, next: 'mutter', effects: [herz(ID, 50)] },
      { text: 'Das Rohr werfen. Richtig weit, übers nächste Dach.', next: 'rohr' },
      { text: 'So tun, als würdest du werfen.', next: 'finte', effects: [herz(ID, 20)] },
    ],
  }),
  knoten('mutter', [
    erz('Die Quietsche-Mutter fliegt quietschend über zwei Dächer. Bolzen fliegt hinterher, ohne nachzudenken, springt, landet, schnappt sie aus der Luft und kommt quietschend zurück. Er quietscht mit. Freiwillig.'),
    B('QUIETSCH! WUFF! QUIETSCH! (Das heißt: NOCHMAL! NOCHMAL! FÜR IMMER NOCHMAL!)', 'freude'),
  ], { next: 'ende' }),
  knoten('rohr', [
    erz('Das Rohr fliegt. Bolzen auch. Er springt, erwischt das Rohr – und rutscht auf dem nassen Blech des Nachbardachs Richtung Kante. Seine Krallen kreischen.'),
  ], {
    choices: [
      { text: 'Hinterher und ihn am Halsband packen.', check: pruefung('he-bolzen-4-fangen', 'reflexe', 4, ['dach', 'springen']), next: 'gefangen', effects: [herz(ID, 50)] },
      { text: 'Pfeifen. Laut.', next: 'pfeifen', effects: [herz(ID, 30)] },
    ],
  }),
  knoten('gefangen', [
    erz('Ein Sprung übers Gassenloch, eine Landung, die deinen Knien gar nicht gefällt, ein Griff ins Halsband. Bolzen hängt halb über der Kante, das Rohr immer noch im Maul. Er lässt es nicht los. Er wird es NIE loslassen.'),
    B('Mmpf. (Das heißt: Danke. Und: Ich hab es noch! Wirf nochmal!)', 'freude'),
  ], { next: 'ende' }),
  knoten('pfeifen', [
    erz('Du pfeifst. Bolzen hört es mitten im Rutschen, stemmt alle vier Pfoten ins Blech, dreht sich um – und rennt zu dir zurück, als wäre nichts gewesen. Die Kante bleibt einsam zurück.'),
  ], { next: 'ende' }),
  knoten('finte', [
    erz('Du holst aus. Bolzen rennt los. Du hast nicht geworfen. Bolzen rennt bis zum anderen Ende des Dachs, sucht, findet nichts, kommt zurück und guckt dich an. Lange. Enttäuscht. Dann bellt er und lacht. Hunde können lachen. Dieser jedenfalls.'),
    B('Wuff. (Das heißt: Gut gespielt. Nächstes Mal beiß ich dir in den Schuh. Liebevoll.)'),
  ], { next: 'ende' }),
  knoten('ende', [
    V('Hab ich vom Ausguck gesehen. Das war nicht schlecht. Für einen Hund und einen Menschen.'),
    erz('Vega steht oben am Ausguck, Gewehr über der Schulter, und wirft Bolzen etwas zu. Er fängt es. Es ist ein Leckerli. Vega dreht sich weg, bevor jemand was sagen kann.'),
  ], { effects: [flag('bolzen_apportiert'), herz('vega', 10), { xp: 50 }] }),
]);

/** ♥6 (Das Nest, tagsüber): Bolzen bringt Captain Kuschel zurück. */
const he6 = dialog('he-bolzen-6', [
  knoten('start', [
    erz('Bolzen zerrt an deinem Ärmel. Er zieht dich ins Nest, wo die Straßenkinder schlafen, wenn sie nicht unterwegs sind. Jetzt ist es leer. Fast.'),
    erz('Im Kuschelwinkel, zwischen Kissen und geklauten Plüschtieren, sitzt Captain Kuschel. Der Hase. Dantes Hase. Mit einer Puppenmütze auf dem Kopf und einer Möhre, die eindeutig nicht seine ist.'),
    K('…'),
    B('Wuff. (Das heißt: Gefunden! Er war weg! Dante hat geweint! Also, Dante hat „Ich weine nicht, ich hab Rauch im Auge“ gesagt. Er hat geweint.)', 'freude'),
  ], {
    choices: [
      { text: 'Die Spuren lesen. Wie ist der Hase hergekommen?', check: pruefung('he-bolzen-6-spuren', 'strasse', 3, ['beobachten']), next: 'spuren', effects: [herz(ID, 40)] },
      { text: 'Bolzen machen lassen.', next: 'bolzen-macht', effects: [herz(ID, 50)] },
    ],
  }),
  knoten('spuren', [
    erz('Kleine Kinderschuhe, ein Haufen Möhrengrün, eine Zeichnung an der Wand: Ein Hase mit Krone, darunter „KÖNIG KUSCHEL“. Die Kinder haben ihn nicht geklaut. Sie haben ihn gekrönt.'),
    ich('Die haben ihn „geliehen“. Und ihm eine Krone gemalt.'),
    B('Wuff. (Das heißt: Ich mag die Kinder. Aber Hasen gehören nach Hause. Das steht in meinem Code. Hab ich gerade reingeschrieben.)'),
  ], { next: 'heim' }),
  knoten('bolzen-macht', [
    erz('Bolzen geht langsam auf den Hasen zu. Ganz langsam. Er legt sich hin, schiebt die Schnauze vor und stupst Captain Kuschel an. Der Hase guckt ihn an. Lange. Dann klettert er auf Bolzens Rücken, als wäre das schon immer so gewesen.'),
    K('…'),
    B('wff. (Das heißt, sehr leise: Er sitzt auf mir. Er SITZT auf mir. Ich beweg mich nie wieder.)', 'freude'),
  ], { next: 'heim' }),
  knoten('heim', [
    erz('Ihr bringt Captain Kuschel zurück in die Werkstatt. Bolzen trägt ihn – auf dem Rücken, im Schritttempo, mit einer Würde, die man einem Robohund nicht zugetraut hätte.'),
    D('KUSCHEL! Heiliges Kanonenrohr! Wo warst du? WO WARST DU? Hast du gegessen? Hast du was Falsches gegessen? Hat dir jemand eine MÜTZE aufgesetzt?', 'ueberrascht'),
    D('Ich hab nicht geweint. Ich hatte nur Lötrauch im Auge. Drei Tage lang. Ununterbrochen.'),
    erz('Dante drückt Bolzen einen Kuss auf den Metallkopf. Bolzen guckt, als wüsste er nicht, was mit ihm passiert. Dann wedelt er so heftig, dass eine Werkbank wackelt.'),
  ], {
    choices: [
      { text: '„Bolzen hat ihn gefunden. Nicht ich.“', next: 'ende', effects: [herz(ID, 20)] },
      { text: '„Die Kinder haben ihn gekrönt. Sei nicht sauer.“', next: 'kinder' },
    ],
  }),
  knoten('kinder', [
    D('Gekrönt? König Kuschel? … Okay. Okay, das ist süß. Sie dürfen ihn besuchen. Mit Aufsicht. MIT AUFSICHT. Und ohne Mütze. Okay, mit Mütze. Die steht ihm.', 'freude'),
  ], { next: 'ende' }),
  knoten('ende', [
    erz('Ab heute schläft Captain Kuschel manchmal in Bolzens Korb. Dante tut so, als wäre er nicht eifersüchtig. Er ist eifersüchtig.'),
  ], { effects: [flag('bolzen_kuschel_freunde'), herz('dante', 30), herz('captain-kuschel', 30), { xp: 80 }] }),
]);

// ♥8 und ♥10 samt Tagesfunden, Akt-2/3- und Nachspiel-Gesprächen: bolzen-akt23.ts.
const A23 = akt23(M);

// ---------------------------------------------------------------------------------------------- Figur

const bolzen: NpcDef = {
  id: ID,
  name: 'Bolzen',
  unknownName: 'Alpha der Brackbucht',
  portrait: ID,
  sprite: `${ID}-walk`,
  bio: 'Ausgemusterter Quantum-Wachhund, früher Alpha eines Robohund-Rudels in der Brackbucht, jetzt Haustier der Crew. Piept, bellt, wedelt mit Funken und bringt jeden Morgen etwas mit, das er „gefunden“ hat.',
  gifts: {
    loves: ['quietsche-mutter', 'oelkaennchen', 'kanalschlamm'],
    likes: ['rostige-schraube', 'glitzerschrott', 'murmelbeutel', 'leckerli-schraube'],
    dislikes: ['waschpulver', 'tai-chi-tee'],
    hates: ['magnet-stoerer', 'feuerloescher-mini', 'virus-implantat'],
  },
  schedule: [
    { when: nicht(DA), place: 'away' },
    ...A23.schedule,
    { slot: 'tag', when: { not: { companion: ID } }, place: { map: 'neon-gasse', at: 'apportier-strecke' } },
    { place: { map: 'crew-quartier', at: 'hundekorb' } },
  ],
  heartEvents: [
    herzEreignis('he-bolzen-2', 2, 'crew-quartier', 'morgen', DA),
    herzEreignis('he-bolzen-4', 4, 'neon-gasse', 'tag', DA),
    herzEreignis('he-bolzen-6', 6, 'das-nest', 'tag', DA),
    herzEreignis('he-bolzen-8', 8, 'schrottmarkt', 'tag', alle(AKT2, DA)),
    herzEreignis('he-bolzen-10', 10, 'crew-quartier', 'morgen', alle(AKT2, DA, { seen: 'he-bolzen-8' })),
  ],
  companion: {
    // Haustier (world.md §4.4, §8 „+ Haustier Bolzen ohne Feld“): belegt keinen Party-Platz (pet) und kämpft nicht als
    // eigene Einheit. Seine Kommandos hält die Spielfigur (duo, holder 'player'): Bellen ab Akt 2, Schnüffeln ab ♥8.
    recruit: DA,
    pet: true,
    stats: {
      hp: 30, armor: 3, morale: 100,
      attributes: { technik: 1, koerper: 5, reflexe: 7, ausstrahlung: 3, strasse: 4 },
      weapon: { kind: 'nahkampf', damage: 3, range: 1, hit: 5 },
      abilities: [],
    },
    duo: [
      { ability: BELLEN.id, holder: 'player', when: AKT2 },
      { ability: SCHNUEFFELN.id, holder: 'player', when: { hearts: ID, min: 8 } },
    ],
    callMinutes: 10,
  },
  partyCheckBonus: [
    { tags: ['beobachten', 'verstecke', 'einschuechtern'], value: 1, label: 'Bolzen schnüffelt' },
  ],
  talk: [
    rede('bolzen-tag-wild', nicht(DA)),
    rede('bolzen-tag-erstes', { not: { met: ID } }),
    rede('bolzen-tag-zeit', alle(VOR_AKT2, { notFlag: 'bolzen_zeit_hinweis' }), 8),
    ...A23.talk,
    rede('bolzen-tag-party', { companion: ID }),
    ...FUNDE.map(f => rede(`bolzen-fund-${f.tag}`, alle(
      { seen: 'he-bolzen-2' }, { time: 'morgen' }, { weekday: f.tag }, { notFlag: `bolzen_fund_${f.tag}` },
    ))),
    rede('bolzen-tag-kuschel', alle({ seen: 'he-bolzen-6' }, { time: ['abend', 'nacht'] })),
    rede('bolzen-tag-nacht', { time: 'nacht' }),
    rede('bolzen-tag-morgen', { time: 'morgen' }),
    rede('bolzen-tag-daecher', { time: 'tag' }),
    rede('bolzen-tag-freund', undefined, 5),
    rede('bolzen-tag-standard'),
  ],
};

export const part: ContentPart = {
  npcs: { [ID]: bolzen },
  dialogues: sammle(
    T.wild, T.erstes, T.zeit, T.party, T.kuschel, T.morgen, T.tag, T.nacht, T.freund, T.standard,
    ...FUND_DIALOGE,
    he2, he4, he6, ...A23.dialogues,
  ),
  ...A23.teil,
};
