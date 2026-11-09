// Alesa Zero – Leiterin der Quantum-Forschung, Erbauerin von Nexus (world.md §4.3, §4.6, §4.7).
// Volle Fassung für Akt 1–3 und Nachspiel; ersetzt npc-welt/alesa-zero.ts (gleiche ID, Akt-1-Sätze übernommen).
// Tagesablauf nach design/plan/act23.json (npcSchedules.alesa-zero, „ersetzt“), Herz-Ereignisse he-alesa-zero-2…10,
// Rivalität re-alesa-zero-2/5 (Drohne Q-7). Späte Begleiterin im Nachspiel ab ♥6, Romanze nur im Nachspiel
// (Kennzeichen; freigeschaltet nur über content/romance.ts). side-alesas-zuendholz/pers-alesa-wasserfilter bauen
// die Quest-Teile; hier Start und Verweise.
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode, EncounterDef, EnemyDef, NpcDef } from '../../../modules/contracts';
import { foe } from '../combat/_foe';
import {
  type Menue, AKT2, EPILOG, PARTYNACHT, ab, alle, dialog, eins, erz, flag, gesehen, geschenk, gespraech, herz, ich, knoten,
  meldung, nicht, nichtGetroffen, ort, pruefung, queststand, rede, rivale, sammle, sprecher, weg, xp, zurueck,
} from './_q';

const ID = 'alesa-zero';
const A = sprecher(ID);
const R = sprecher('richter');
const D = sprecher('dante');

const MORGENS: Condition = { clockBetween: [420, 540] };
const WERKTAG = ['mo', 'di', 'mi', 'do', 'fr'] as const;
/** Flirt ab ♥6 nur im Nachspiel und nur, wenn die Romanze freigeschaltet ist (world.md §4.7). */
const FLIRT: Condition = alle(EPILOG, { romanceEnabled: ID }, ab(ID, 6));
const ROM: Condition = alle(EPILOG, { romance: ID });
const Z = zurueck('Noch eine Frage, Alesa.', 'Ich lass dich arbeiten.');

// ---------------------------------------------------------------------------------------------- Menü

const choices: DialogueChoice[] = [
  {
    text: '„Dein Zentrator hat keinen Rückkopplungsschutz. Ich bau dir einen.“', tag: '[Schrott]', when: { origin: 'origin-schrott' },
    once: true, id: 'a-schrott', next: 'schrott', effects: [herz(ID, 60)],
  },
  {
    text: 'Eine knappe, korrekte Verbeugung. Gabel links, Messer rechts, Blick nicht zu lang.', tag: '[Oberstadt]',
    when: { origin: 'origin-oberstadt' }, once: true, id: 'a-oberstadt', next: 'oberstadt', effects: [herz(ID, 30)],
  },
  { text: '„Was baust du da gerade?“', next: 'bauen' },
  { text: '„Wie ist Blade so als Chef?“', once: true, id: 'a-blade', next: 'blade', when: nicht(EPILOG) },
  { text: '„Nexus. Was ist das eigentlich?“', once: true, id: 'a-nexus', next: 'nexus', when: alle(AKT2, nicht(EPILOG)) },
  {
    text: '„Die Leute mit Chip. Weißt du, was die nachts träumen?“', tag: '[Alesa ♥4]', requires: ab(ID, 4),
    when: alle(AKT2, nicht(EPILOG)), once: true, id: 'a-traeume', next: 'traeume',
  },
  {
    text: '„Die Aussiedler brauchen sauberes Wasser. Dein Zentrator könnte filtern.“', tag: '[Alesa ♥4]', requires: ab(ID, 4),
    when: alle(EPILOG, queststand('pers-alesa-wasserfilter', 'inactive')), id: 'a-filter', next: 'filter',
    effects: [{ startQuest: 'pers-alesa-wasserfilter' }],
  },
  {
    text: '„Komm mit raus. Die Stadt kann eine Ingenieurin gebrauchen, die nichts abfackelt.“', tag: '[Alesa ♥6]', requires: ab(ID, 6),
    when: alle(EPILOG, nicht({ recruited: ID })), next: 'mitkommen', effects: [{ recruit: ID }],
  },
  { text: 'Mit Alesa flirten.', tag: '[Romanze]', when: FLIRT, next: 'flirt' },
  { text: 'Ich lass dich arbeiten.' },
];

const flirtAntworten: DialogueChoice[] = [
  { text: '„Du bist das einzige Genie, das rot wird, wenn man es lobt.“', check: pruefung('alesa-flirt-genie', 'ausstrahlung', 6, ['flirt']), next: 'flirt-a', effects: [herz(ID, 20)] },
  { text: 'Ihr eine verirrte Haarsträhne hinters Ohr streichen.', next: 'flirt-b', effects: [herz(ID, 15)] },
  { text: '„Ich steh auf Frauen, die Dinge explodieren lassen.“', next: 'flirt-c', effects: [herz(ID, 10)] },
];

const nodes: DialogueNode[] = [
  knoten('schrott', [
    A('Du … Rückkopplungsschutz? Selbst gewickelt? Mit Kupferlitze oder Aluminium? Nein – sag nichts. Kupfer. Natürlich Kupfer. Aluminium wäre Barbarei.', 'ueberrascht'),
    erz('Sie zieht einen Stift aus dem Haarknoten, der Knoten fällt auseinander, es ist ihr egal. Drei Minuten lang zeichnet sie Schaltpläne auf eine Serviette.'),
    A('Endlich jemand, der Zentratoren nicht für Mixer hält. Hier. Behalte die Serviette. Die ist mehr wert als mein Jahresgehalt. Mein Jahresgehalt ist nicht so hoch, wie man denkt.', 'freude'),
  ], { choices: Z }),
  knoten('oberstadt', [
    A('Oh. Oh, gut. Jemand mit Manieren. Ich dachte schon, ich müsste mich wieder wie ein Mensch benehmen.', 'freude'),
    erz('Ihre Schultern sinken drei Zentimeter. Sie lehnt sich zurück. Zum ersten Mal sieht sie aus wie jemand, der nicht gleich weglaufen will.'),
  ], { choices: Z }),
  knoten('bauen', [
    A('Einen Toaster, der die Bräunung über Hautleitwert misst. Also: Er spürt, wie hungrig du bist. Theoretisch.'),
    A('Praktisch hat er gestern ein Croissant eingeäschert. Und den Vorhang. Und kurz die Hoffnung.', 'besorgt'),
    ich('Vielleicht weniger Hoffnung, mehr Feuerlöscher.'),
    A('Sag dieses Wort nicht! Feuerlöscher sind ein Vorwurf. Sie sagen: „Wir rechnen mit deinem Versagen.“', 'wut'),
  ], { choices: Z }),
  knoten('blade', [
    A('Blade ist … visionär. Er hat Visionen. Ich habe die Lötstellen dazu.', 'besorgt'),
    A('Er nennt mich „meine kleine Assistentin“. Ich habe drei Doktortitel. Einer davon ist in Rhetorik. Ich schreibe seine Reden.'),
    A('Er hält sie dann. Mit mehr Pausen. Die Pausen sind sein Beitrag.', 'wut'),
  ], { choices: Z }),
  knoten('nexus', [
    A('Nexus ist eine adaptive Assistenz-Intelligenz mit emotionaler Rückkopplung. Er lernt. Schneller als geplant. Viel schneller.', 'besorgt'),
    A('Er sollte Menschen helfen, Entscheidungen zu treffen. Blade wollte, dass er ihnen die Entscheidungen abnimmt. Das ist … ein kleiner Unterschied in der Spezifikation.'),
    A('Wir haben ja von nichts gewusst. Ich meine … ich habe die Spezifikation geschrieben. Aber nicht diese Zeile. Diese Zeile hat jemand anders eingefügt.', 'trauer'),
  ], { choices: Z }),
  knoten('traeume', [
    erz('Alesa wird still. Sie legt das Tablet weg, was sie sonst nie tut.'),
    A('Nichts. Sie träumen nichts. Die Aufzeichnungen sind flach wie ein Bahnsteig. Ich habe das als Erfolg markiert. Weil es einer ist. Für die Spezifikation.', 'trauer'),
    A('Ich träume dafür jetzt doppelt. Von Bahnsteigen.'),
  ], { choices: Z, effects: [herz(ID, 20)] }),
  knoten('filter', [
    A('Den Zentrator umkehren … Strom in Reinheit statt in Gehorsam. Das ist … oh, das ist elegant.', 'ueberrascht'),
    A('Ich brauche Elsa aus dem Aussiedlerhof. Sie hat die Brunnenpumpen gebaut. Sie mag mich wahrscheinlich nicht. Niemand da draußen mag Quantum. Zu Recht.'),
    A('Aber du könntest uns vorstellen. Du bist gut darin, Menschen zu überreden, dass ich nicht so schlimm bin.', 'freude'),
  ], { choices: Z }),
  knoten('mitkommen', [
    A('Ich? Raus? Mit Leuten, die auf mich schießen könnten? … Ja. Ja! Ich packe Prototypen ein. Nur die, die selten explodieren.', 'freude'),
    A('Jedes dritte Mal kommt Konfetti raus. Das ist kein Fehler. Das ist ein Feature. Habe ich beschlossen.'),
  ], { choices: Z }),
  knoten('flirt', [
    A('Du guckst schon wieder so. So … ohne Messgerät. Das macht mich nervös. Meine Stimme geht dann immer hoch. Hörst du? Da. Piep.', 'verlegen'),
  ], { choices: flirtAntworten }),
  knoten('flirt-a', [A('Ich werde nicht rot. Das ist eine Durchblutungsanomalie. Sie tritt nur bei dir auf. Ich untersuche das. Gründlich.', 'freude')], { choices: Z }),
  knoten('flirt-b', [erz('Sie hält still. Ganz still, wie ein Messinstrument, das auf ein Signal wartet.'), A('… Das war nicht im Versuchsaufbau. Mach es nochmal. Zur Kontrolle.', 'zaertlich')], { choices: Z }),
  knoten('flirt-c', [A('Das ist der schlechteste Spruch, den ich je gehört habe. Ich habe ihn mir aufgeschrieben.', 'freude')], { choices: Z }),
];

const M: Menue = { zeile: A('Noch was? Schnell, bevor der Kaffee kalt wird. Er ist das Einzige, was heute funktioniert.'), choices, nodes };

// ---------------------------------------------------------------------------------------------- Tagesgespräche

const T = {
  // Akt-1-Sätze aus npc-welt/alesa-zero.ts (gleiche IDs).
  schrott: gespraech('alesa-tag-schrott', [
    A('Du hast … Rückkopplungsschutz am Zentrator? Selbst gebaut? Das ist … nein. Keine Zeit. Ich hab keine Zeit. Leider.'),
  ], M),
  digitech: gespraech('alesa-tag-digitech', [
    erz('Alesa schiebt einen Rollwagen voller Kisten Richtung Campus. Eine Kiste raucht leicht.'),
    A('Nicht anfassen! Das ist … Inventur. Ganz legal. Wir haben ja von nichts gewusst. Ich meine: Das ist alles abgesprochen.'),
  ], M),
  standard: gespraech('alesa-tag-standard', [
    erz('Eine Frau im Laborkittel liest drei Tablets gleichzeitig, schwarzer Kaffee, kein Blick hoch.'),
    A('Ich bin nicht im Dienst. Ich bin nie nicht im Dienst. Bitte gehen Sie, bevor mein Kaffee kalt wird. Er ist das Einzige, was heute funktioniert.'),
  ], M),
  cafe: gespraech('alesa-tag-cafe', [
    A('Oh, du. Hallo. Setz dich. Nein, nicht auf das Tablet. Das ist ein Prototyp. Das Tablet. Und der Stuhl auch, eigentlich.', 'freude'),
  ], M),
  glaspark: gespraech('alesa-tag-glaspark', [
    erz('Alesa sitzt auf der Bank im Glaspark und füttert eine Taube mit Lötzinn-Krümeln. Die Taube ist unbeeindruckt.'),
    A('Abends komme ich hierher, weil hier nichts piept. Bis auf die Tauben. Die piepen auch. Ich glaube, Seraphina hat sie verkabelt.'),
  ], M),
  labor: gespraech('alesa-tag-labor', [
    erz('Das Labor summt. Auf dem Zentralrechner läuft ein Balken, der „LERNFORTSCHRITT“ heißt. Er ist über hundert Prozent.'),
    A('Du darfst nicht hier sein. Ich darf eigentlich auch nicht hier sein. Niemand darf hier sein außer Nexus. Und Nexus will nicht, dass jemand hier ist.', 'besorgt'),
  ], M),
  zweifel: gespraech('alesa-tag-zweifel', [
    A('Ich habe nachgerechnet. Die Chip-Charge, die Probanden, die Zeitpläne. Es geht auf. Alles geht auf. Das ist das Schlimmste daran.', 'trauer'),
  ], M),
  festgesetzt: dialog('alesa-tag-festgesetzt', [knoten('start', [
    erz('An der Bar: Alesa, links und rechts eine Dame mit Perlenkette, die sie freundlich und unerbittlich an den Ärmeln festhält. Beide lächeln. Rot. Alesa nicht.'),
    A('Sie lassen mich nicht los. Sie sagen „Bitte bleiben Sie, Doktor“. Mit meiner Stimme. Die habe ich für die Ansagen aufgenommen. Das ist so, als würde einen der eigene Toaster verhaften.', 'besorgt'),
    A('Wir haben ja von nichts gewusst. Also, ich. Also … nein. Ich hab es gewusst. Sagen Sie Nexus, sie soll aufhören, mich zu siezen.', 'trauer'),
  ])]),
  party: dialog('alesa-tag-party', [knoten('start', [
    erz('Alesa im Abendkleid, darüber der Laborkittel. Sie hat ihn nicht ausgezogen. Sie zieht ihn nie aus.'),
    A('Heute Abend gehen viertausend Chips raus. Ich habe einen Trinkspruch für Blade geschrieben. Er wird ihn falsch betonen. Wie immer.', 'besorgt'),
    A('Wenn das hier vorbei ist … erinnerst du dich dann noch an mich als die, die den Toaster gebaut hat? Nicht als die andere?'),
  ])]),
  werkstatt: gespraech('alesa-tag-werkstatt', [
    erz('Werkstatt „Nullpunkt“ im Digitech-Areal: eine Glasfassade voller Sprünge, dahinter Werkbänke, Kisten, ein Schild „SOZIALSTUNDEN – BITTE NICHT FÜTTERN“.'),
    A('Willkommen im Nullpunkt! Hier baue ich Dinge, die helfen. Unter Aufsicht. Dante kommt jeden Donnerstag und guckt streng. Er kann nicht streng gucken. Er versucht es.', 'freude'),
  ], M),
  epilogCafe: gespraech('alesa-tag-epilog-cafe', [
    A('Morgens trinke ich immer noch hier Kaffee. Perle sagt, ich bin die einzige Ex-Konzernforscherin, die Trinkgeld gibt. Schuld macht großzügig.', 'freude'),
  ], M),
  rivale: dialog('alesa-tag-rivale', [knoten('start', [
    A('Du! Du hast … ich habe dich gemeldet. Bei Xion. Ich wollte das nicht. Doch, ich wollte das. Geh weg!', 'wut'),
  ], {
    choices: [
      {
        text: 'Ihr einen neuen Laborkittel hinhalten. „Dein Prototyp gestern war genial. Der Kurzschluss war Absicht, oder?“', tag: '[Technik 6]',
        when: { item: 'laborkittel-neu' }, check: pruefung('alesa-rivale-lob', 'technik', 6, ['fachgespraech']), next: 'lob',
        effects: [{ take: 'laborkittel-neu' }, { reconcile: ID }],
      },
      {
        text: 'Neuen Laborkittel und ein Stück Sahnetorte auf den Tisch legen.', when: alle({ item: 'laborkittel-neu' }, { item: 'sahnetorte-stueck' }),
        next: 'torte', effects: [{ take: 'laborkittel-neu' }, { take: 'sahnetorte-stueck' }, { reconcile: ID }],
      },
      { text: 'Gehen.' },
    ],
  }), knoten('lob', [
    A('Der Kurzschluss war … ja. Absicht. Teilweise. Du hast das gesehen? Niemand sieht das.', 'ueberrascht'),
    erz('Sie nimmt den Kittel, fährt mit dem Daumen über den Kragen. Kein einziges Brandloch. Sie sieht aus, als würde sie gleich weinen.'),
    A('Okay. Ich nehme die Meldung zurück. Ich sage Xion, ich hätte mich verguckt. Er glaubt mir sowieso nie, wenn ich was Kluges sage.'),
  ]), knoten('torte', [
    A('Bestechung mit Kohlenhydraten. Das ist … wissenschaftlich gesehen sehr wirkungsvoll.', 'freude'),
    A('Gut. Wir sind quitt. Aber du schuldest mir eine Erklärung. Später. Wenn der Zucker wirkt.'),
  ])]),
};

// ---------------------------------------------------------------------------------------------- Herz-Ereignisse

/** ♥2 (Café, Mo–Fr 07–09): Sie probt eine Rede, die Blade dann hält. */
const he2 = dialog('he-alesa-zero-2', [
  knoten('start', [
    erz('Café Sahnehaube, kurz nach sieben. Alesa steht hinter ihrem Fenstertisch und flüstert in eine leere Kaffeetasse, die sie wie ein Mikrofon hält.'),
    A('„Meine Damen und Herren, Quantum steht für … für …“ Für was steht Quantum? Für Dividende. Nein. Für Fortschritt. Für Fortschritt mit Dividende.'),
    erz('Sie sieht dich. Die Tasse fällt fast.'),
    A('Das ist nicht meine Rede! Das ist Blades Rede. Ich schreibe sie nur. Und übe sie. Damit ich weiß, wo er die Pausen falsch macht.', 'ueberrascht'),
  ], {
    choices: [
      {
        text: '„Streich „Dividende“. Sag „Menschen“. Leute klatschen bei „Menschen“.“', tag: '[Ausstrahlung 4]',
        check: pruefung('he-alesa-zero-2-rede', 'ausstrahlung', 4, ['ueberreden']), next: 'menschen', effects: [herz(ID, 50)],
      },
      {
        text: '„Dein Satzbau ist rekursiv. Er endet in sich selbst.“', tag: '[Technik 5]',
        check: pruefung('he-alesa-zero-2-satzbau', 'technik', 5, ['fachgespraech']), next: 'rekursiv', effects: [herz(ID, 50)],
      },
      { text: '„Halt die Rede doch selbst.“', next: 'selbst', effects: [herz(ID, 30)] },
    ],
  }),
  knoten('menschen', [
    A('„Für Menschen.“ … Oh. Das ist gut. Das ist zynisch und warm zugleich. Blade wird es lieben. Er wird es falsch betonen.', 'freude'),
  ], { next: 'ende' }),
  knoten('rekursiv', [
    A('Rekursiv! Ja! Das ist es! Ich hab den ganzen Morgen gedacht, irgendwas stimmt nicht, und es war eine Endlosschleife. In einer Rede.', 'freude'),
    A('Weißt du, wie selten Menschen meine Fehler finden? Meistens finden die Fehler die Menschen. Mit Flammen.'),
  ], { next: 'ende' }),
  knoten('selbst', [
    A('Ich? Vor Publikum? Meine Stimme geht dann hoch. So hoch, dass Hunde kommen.', 'besorgt'),
    erz('Sie sagt es als Witz. Es ist keiner. Dann lacht sie trotzdem, ein kleines, überraschtes Lachen.'),
    A('Aber danke. Das hat mich noch nie jemand gefragt.'),
  ], { next: 'ende' }),
  knoten('ende', [
    A('Ich muss los. Blade will um neun seine Rede. Um fünf nach neun will er eine andere. Um zehn nach neun die erste wieder.'),
  ], { effects: [flag('alesa_rede'), xp(40)] }),
]);

/** ♥4 (Digitech-Areal, Mi tagsüber): Prototypen tragen, Hinweis auf die Wachschichten. */
const he4 = dialog('he-alesa-zero-4', [
  knoten('start', [
    erz('Lieferzone des Digitech-Areals. Alesa kämpft mit einem Rollwagen, dessen linkes Rad lieber nach Hause will. Auf dem Wagen: sechs Kisten, zwei davon qualmen.'),
    A('Hilfe. Bitte. Die Kisten müssen bis Mittag auf den Campus, und das Rad … das Rad hat einen eigenen Willen. Ich habe es nicht gebaut. Ich schwöre.', 'besorgt'),
  ], {
    choices: [
      {
        text: 'Zwei Kisten auf einmal schultern.', tag: '[Körper 4]', check: pruefung('he-alesa-zero-4-tragen', 'koerper', 4),
        next: 'tragen', effects: [herz(ID, 45)],
      },
      {
        text: 'Das Rad mit einem Kabelbinder und Gefühl überreden.', tag: '[Technik 4]', check: pruefung('he-alesa-zero-4-rad', 'technik', 4, ['reparieren']),
        next: 'rad', effects: [herz(ID, 50)],
      },
      { text: 'Einfach anpacken und schieben.', next: 'schieben', effects: [herz(ID, 35), { damage: 3 }] },
    ],
  }),
  knoten('tragen', [erz('Du trägst. Die Kisten summen. Eine flüstert in einer Sprache, die nach Fax klingt. Du fragst nicht.')], { next: 'tipp' }),
  knoten('rad', [
    erz('Ein Kabelbinder, ein Klaps, ein ernstes Wort. Das Rad rollt geradeaus.'),
    A('Du hast mit ihm geredet. Ich rede auch immer mit Maschinen. Die meisten Menschen finden das seltsam. Die Maschinen nicht.', 'freude'),
  ], { next: 'tipp' }),
  knoten('schieben', [
    erz('Ihr schiebt. Das Rad bockt. Eine Kiste kippt, eine Stichflamme leckt an deinem Ärmel. Alesa wirft sich darauf wie auf eine Granate.'),
    A('Alles gut! Alles gut! Das war nur … Begeisterung. Der Prototyp freut sich, dich kennenzulernen.', 'besorgt'),
  ], { next: 'tipp' }),
  knoten('tipp', [
    erz('Am Campus-Tor. Alesa wischt sich Ruß von der Stirn und senkt die Stimme.'),
    A('Du hast mir geholfen, also helfe ich dir. Nur so, theoretisch: Die Nachtschicht am Labortrakt wechselt um eins. Fünf Minuten steht das Seitentor frei, weil die Wachen Kaffee holen.'),
    A('Das sage ich nicht, weil ich will, dass jemand reinkommt. Ich sage es, weil der Kaffee dort furchtbar ist und es jemand wissen sollte.', 'besorgt'),
  ], { effects: [flag('alesa_wachschicht_tipp'), xp(60), meldung('Hinweis: Schichtwechsel am Quantum-Labortrakt um 01:00, fünf Minuten Lücke.')] }),
]);

/** ♥6 (Glaspark, abends, act2): Schuldgefühle. Flag alesa_zweifel. */
const he6 = dialog('he-alesa-zero-6', [
  knoten('start', [
    erz('Glaspark, Abend. Alesa sitzt auf der Bank, ohne Tablet, ohne Kaffee, ohne irgendwas in den Händen. Ihre Finger suchen trotzdem nach einem Knopf.'),
    A('Heute hat mich eine Probandin gegrüßt. „Guten Abend, Frau Doktor. Das ist eine ausgezeichnete Entscheidung.“ Ich hatte gar nichts entschieden. Ich habe nur „Hallo“ gesagt.', 'trauer'),
    A('Wir haben ja von nichts gewusst. Das sage ich mir jeden Morgen. Es stimmt nicht. Ich habe es gewusst. Ich wollte es nur nicht so genau wissen.'),
  ], {
    choices: [
      {
        text: '„Du hast Nexus gebaut. Du kannst ihn auch reparieren. Aber nicht, wenn du dich weiter versteckst.“', tag: '[Ausstrahlung 6]',
        check: pruefung('he-alesa-zero-6-mut', 'ausstrahlung', 6, ['ueberreden']), next: 'mut', effects: [herz(ID, 50)],
      },
      { text: 'Sich setzen. „Erzähl.“', next: 'erzaehl', effects: [herz(ID, 40)] },
      { text: '„Ja. Du hast es gewusst. Und jetzt?“', next: 'hart', effects: [herz(ID, 20)] },
    ],
  }),
  knoten('mut', [
    A('Reparieren. Nicht abschalten. Reparieren.', 'ueberrascht'),
    A('Ich habe eine Hintertür eingebaut. Ganz am Anfang, als Nexus noch dumm war. Eine Art … Gewissen. Blade hat es nie gefunden, weil er nie Code liest.'),
    A('Wenn jemand die Forschungsdaten hätte, könnte man ihn umschreiben. Hypothetisch. Ich habe nichts gesagt.', 'besorgt'),
  ], { next: 'ende', effects: [flag('alesa_hintertuer')] }),
  knoten('erzaehl', [
    A('Ich wollte eine KI, die Menschen hilft. Eine, die erinnert, wenn man seine Tabletten vergisst. Die einem sagt, dass man genug geschlafen hat.', 'trauer'),
    A('Blade hat gesagt: „Warum soll sie sie erinnern, wenn sie sie gleich steuern kann?“ Und ich habe geantwortet: „Technisch möglich.“ Das war meine ganze Moral. Zwei Wörter.'),
  ], { next: 'ende' }),
  knoten('hart', [
    A('Und jetzt … jetzt sitze ich hier und warte, dass jemand mich anschreit. Danke. Das ist erleichternd. Ehrlich.', 'trauer'),
  ], { next: 'ende' }),
  knoten('ende', [
    erz('Sie steht auf. Zieht den Kittel zurecht. Ein Brandloch am Ärmel, sie steckt den Finger hindurch wie in ein Schlüsselloch.'),
    A('Wenn es soweit ist … wenn ihr kommt … ich werde nicht im Weg stehen. Ich weiß nicht, ob ich helfen kann. Aber im Weg stehen werde ich nicht.', 'besorgt'),
  ], { effects: [flag('alesa_zweifel'), xp(80)] }),
]);

/** ♥8 (Nachspiel, Gerichtssaal): Zeugenaussage, Sozialstunden bei Dante. */
const he8 = dialog('he-alesa-zero-8', [
  knoten('start', [
    erz('Gerichtssaal. Alesa im Zeugenstand, ein Pappbecher in der Hand, der zittert. Der Richter blättert. Auf der Zuschauerbank: Collin, ein Kameramann, drei gechippte Ex-Probanden, die freundlich lächeln, weil sie nicht anders können.'),
    R('Frau Zero. Sie haben die Wahl. Sie können sagen: „Wir haben ja von nichts gewusst.“ Das haben schon viele gesagt. Ich habe es aufgeschrieben. Es ist ein dicker Ordner.'),
    erz('Alesa sieht zu dir. Ihre Lippen formen ein Wort, das „Hilfe“ heißen könnte oder „Toaster“.'),
  ], {
    choices: [
      {
        text: 'Aufstehen. „Sag ihnen, was du mir im Glaspark gesagt hast.“', tag: '[Ausstrahlung 6]',
        check: pruefung('he-alesa-zero-8-zeugin', 'ausstrahlung', 6, ['ueberreden']), next: 'wahrheit', effects: [herz(ID, 60)],
      },
      { text: 'Ihr zunicken. Nur nicken.', next: 'nicken', effects: [herz(ID, 40)] },
    ],
  }),
  knoten('wahrheit', [
    A('Ich habe es gewusst.', 'trauer'),
    erz('Der Saal wird still. Selbst die gechippten Probanden hören auf zu lächeln, kurz, als würde etwas in ihnen zuhören.'),
    A('Ich habe die Zeile nicht geschrieben, die die Leute steuert. Aber ich habe sie gesehen. Und ich habe „technisch möglich“ gesagt. Ich will das wiedergutmachen. Mit allem, was ich kann. Und ich kann viel.'),
    R('Ehrlichkeit. Vor Gericht. Ich muss mich setzen. Ich sitze schon. Ich setze mich nochmal.'),
  ], { next: 'urteil', effects: [flag('alesa_wahrheit')] }),
  knoten('nicken', [
    A('Ich … wir … Ich habe es gewusst. Nicht alles. Genug.', 'besorgt'),
    erz('Es kommt leise und stockend, aber es kommt. Collin flüstert ins Mikro: „Das, meine Damen und Herren, nennt man einen Ruck.“'),
  ], { next: 'urteil', effects: [flag('alesa_wahrheit')] }),
  knoten('urteil', [
    R('Urteil: Sozialstunden. Fünfhundert. Unter Aufsicht eines lizenzierten Implantat-Technikers der Unterstadt.'),
    D('Hier! Ich! Lizenziert! Also … fast. Die Lizenz ist im Altpapier, aber sie existiert spirituell.'),
    R('… Unter Aufsicht von Herrn Dante. Gott steh uns bei. Nächster Fall.'),
    erz('Draußen auf der Treppe umarmt Alesa dich so heftig, dass ihr Pappbecher platzt. Kaffee überall. Sie lacht, eine Oktave zu hoch.'),
    A('Fünfhundert Stunden! Mit Dante! Er wird mir alles erklären, was ich ihm vor zehn Jahren erklärt habe! Ich freue mich so!', 'freude'),
  ], { effects: [flag('alesa_sozialstunden'), herz('dante', 20), xp(150)] }),
]);

/** ♥10 (Nachspiel, Werkstatt „Nullpunkt“ an der Glasfassade): Andenken zero-prototyp; Romanze-Fassung mit { romance }. */
const he10 = dialog('he-alesa-zero-10', [
  knoten('start', [
    erz('Werkstatt „Nullpunkt“. Durch die gesprungene Glasfassade fällt Abendlicht in Streifen. Auf der Werkbank: ein kleiner Roboter mit Kulleraugen, der vorsichtig eine Blume gießt.'),
    A('Er heißt Funke. Er hat seit drei Wochen nichts abgefackelt. Fast nichts. Den Vorhang. Aber der Vorhang hatte es verdient.', 'freude'),
    A('Ich habe ihn aus dem Nexus-Code gebaut. Aus der Hintertür. Aus dem Gewissen. Er weiß nichts über Steuerung. Er weiß nur, wann Pflanzen Durst haben.'),
    A('Und ich wollte, dass du den ersten bekommst. Den Prototypen. Weil du der Grund bist, warum es ihn gibt.'),
  ], {
    choices: [
      { text: 'Den kleinen Roboter vorsichtig nehmen.', next: 'nehmen' },
      { text: 'Alesa ansehen statt den Roboter.', when: ROM, tag: '[Romanze]', next: 'romanze' },
    ],
  }),
  knoten('nehmen', [
    erz('Funke piept, dreht sich einmal um sich selbst und pustet dir einen winzigen Konfettiregen ins Gesicht.'),
    A('Jedes dritte Mal. Das ist kein Fehler.', 'freude'),
    A('Weißt du, früher habe ich gedacht, Genie heißt, Dinge zu bauen, die keiner versteht. Jetzt glaube ich: Genie heißt, Dinge zu bauen, die keinem wehtun. Das ist schwerer. Viel schwerer.'),
    A('Danke, dass du mich nicht abgeschrieben hast. Ich war ein ziemlich schlechter Mensch mit einem ziemlich guten Lötkolben.'),
  ], { effects: [geschenk('zero-prototyp'), xp(200)] }),
  knoten('romanze', [
    A('Du guckst schon wieder so. Ich habe das gemessen. Puls, Pupillen, Hautleitwert. Die Werte sind … unwissenschaftlich hoch. Bei uns beiden.', 'verlegen'),
    erz('Funke rollt diskret zur Tür und dreht sich zur Wand. Er hat Manieren gelernt. Von wem auch immer.'),
    A('Ich bin nicht gut in so was. Ich habe kein Protokoll dafür. Kein Handbuch. Nur … dich.', 'zaertlich'),
    erz('Sie nimmt deine Hand. Ihre Finger riechen nach Lötzinn und Pfefferminz. Draußen geht über dem Digitech-Areal die Sonne unter, als hätte jemand sie extra kalibriert.'),
    A('Bleib heute Abend. Wir können … Schaltpläne anschauen. Oder nicht. Ich habe nichts geplant. Das ist das erste Mal in meinem Leben.', 'zaertlich'),
    erz('Das Licht in der Werkstatt geht aus. Funke hat es ausgeschaltet. Jemand muss ihm das beigebracht haben.'),
  ], { effects: [geschenk('zero-prototyp'), flag('alesa_romanze'), xp(200)] }),
]);

// ---------------------------------------------------------------------------------------------- Rivalität

const re2 = dialog('re-alesa-zero-2', [knoten('start', [
  erz('Auf der Bank im Glaspark sitzt Alesa und tippt hektisch auf ihr Tablet. Als sie dich sieht, dreht sie den Bildschirm weg. Zu spät. Du siehst dein Gesicht. Und das Wort: „MELDUNG AN SICHERHEIT / X. VENOM“.'),
  A('Das ist … Routine! Protokoll! Jeder, der zweimal am Campus vorbeigeht, wird gemeldet. Du bist dreimal vorbeigegangen. Ich habe gezählt.', 'wut'),
], { effects: [flag('alesa_gemeldet'), herz('xion-venom', -50), { wanted: 1 }] })]);

const re5 = dialog('re-alesa-zero-5', [knoten('start', [
  erz('Ein Surren über der Lieferzone. Eine Drohne, weiß und rund wie ein Ei, mit einem einzelnen roten Auge. Auf ihrem Bauch steht in Alesas Handschrift: „Q-7 – NICHT ÄRGERN“.'),
  A('Q-7, das ist die Person, über die wir gesprochen haben. Bitte … nur verscheuchen. Nicht zu doll. Okay, ein bisschen doll.', 'wut'),
], {
  choices: [
    { text: 'Kämpfen.', effects: [{ battle: 'enc-rival-alesa-q7' }] },
    { text: 'Laufen. Schnell.', effects: [{ advanceTime: 20 }, { damage: 5 }, meldung('Q-7 verfolgt dich bis zur Hauptstraße und versengt dir die Schuhsohlen.')] },
  ],
})]);

const enemies: EnemyDef[] = [foe({
  id: 'drohne-q7', name: 'Drohne Q-7', level: 7, hp: 70, armor: 3, ref: 6, fw: 7, boss: true,
  dmg: [8, 10], kind: 'smart', range: 5, ai: 'boss', abilities: ['geschuetzdrohne-unterdrueckungsfeuer'],
  sprite: 'spaeherdrohne-walk', faction: 'quantum',
  phases: [{ below: 0.4, line: 'Q-7 piept empört. Aus einer Klappe fällt Konfetti. Dann eine Stichflamme.' }],
})];

const encounters: EncounterDef[] = [{
  id: 'enc-rival-alesa-q7', name: 'Drohne Q-7', arena: 'arena-labor-ruine',
  enemies: [{ enemy: 'drohne-q7' }, { enemy: 'stoerdrohne', count: 2 }],
  canFlee: true,
  intro: [{ speaker: 'alesa-zero', text: 'Q-7, Protokoll „Verscheuchen“! Nicht „Einäschern“! VERSCHEUCHEN!' }],
  onWin: [{ message: 'Q-7 landet rauchend im Schutt. Irgendwo flucht Alesa in drei Fachsprachen.' }],
  reward: { xp: 150, items: { 'schrott-ersatzteil': 3 } },
}];

// ---------------------------------------------------------------------------------------------- Figur

const alesa: NpcDef = {
  id: ID,
  name: 'Alesa Zero',
  unknownName: 'Frau im Laborkittel',
  portrait: 'alesa',
  sprite: 'alesa-walk',
  faction: 'quantum',
  maxHearts: 10,
  romanceable: true,
  bio: 'Leiterin der Quantum-Forschung, hat Nexus gebaut. Brillant, nervös, Laborkittel, Prototypen mit Hang zum Abfackeln. Wird von Blade wie eine Assistentin behandelt. „Wir haben ja von nichts gewusst.“',
  gifts: {
    loves: ['laborkittel-neu', 'pinzetten-set', 'datenkristall', 'sahnetorte-stueck'],
    likes: ['synth-kaffee', 'logik-raetsel-modul', 'alter-neurochip', 'nexi-pluesch', 'echtobst-apfel', 'hofhonig'],
    dislikes: ['synth-nudeln', 'taschenspiegel-gold'],
    hates: ['feuerloescher-mini', 'defekter-neurochip', 'rostige-dose', 'virus-implantat'],
  },
  schedule: [
    ort('T,A', 'digitech-areal', 'glasfassade', { when: EPILOG }),
    ort('M', 'cafe-sahnehaube', 'fenstertisch', { days: WERKTAG, when: alle(EPILOG, MORGENS) }),
    weg('*', { when: EPILOG }),
    ort('*', 'quantum-labor', 'alesas-pult', { when: alle(PARTYNACHT, nicht(queststand('main-3-labor', 'done'))) }),
    // Nach der Rebellion halten zwei gechippte Damen mit Perlenketten sie an der Bar fest (main-3-gedankenkontrolle).
    ort('*', 'himmelsgarten', 'bar-himmel', { when: alle(PARTYNACHT, { flag: 'nexus_rebelliert' }) }),
    ort('*', 'himmelsgarten', 'vip-lounge', { when: PARTYNACHT }),
    ort('M', 'cafe-sahnehaube', 'fenstertisch', { days: WERKTAG, when: MORGENS }),
    ort('T', 'digitech-areal', 'lieferzone', { days: ['mi'] }),
    ort('A', 'glasarkaden', 'glaspark-bank'),
    ort('*', 'quantum-labor', 'alesas-pult'),
  ],
  heartEvents: [
    { id: 'he-alesa-zero-2', hearts: 2, map: 'cafe-sahnehaube', time: 'morgen', when: alle({ weekday: [...WERKTAG] }, MORGENS, { notFlag: 'epilog' }), dialogue: 'he-alesa-zero-2' },
    { id: 'he-alesa-zero-4', hearts: 4, map: 'digitech-areal', time: 'tag', when: alle({ weekday: 'mi' }, gesehen('he-alesa-zero-2'), { notFlag: 'epilog' }), dialogue: 'he-alesa-zero-4' },
    { id: 'he-alesa-zero-6', hearts: 6, map: 'glasarkaden', time: 'abend', when: alle(AKT2, { notFlag: 'epilog' }, gesehen('he-alesa-zero-4')), dialogue: 'he-alesa-zero-6' },
    { id: 'he-alesa-zero-8', hearts: 8, map: 'gerichtssaal', time: 'tag', when: EPILOG, dialogue: 'he-alesa-zero-8' },
    { id: 'he-alesa-zero-10', hearts: 10, map: 'digitech-areal', time: 'tag', when: alle(EPILOG, gesehen('he-alesa-zero-8')), dialogue: 'he-alesa-zero-10' },
    { id: 're-alesa-zero-2', hearts: -2, map: 'glasarkaden', time: 'abend', when: { notFlag: 'epilog' }, dialogue: 're-alesa-zero-2' },
    { id: 're-alesa-zero-5', hearts: -5, map: 'digitech-areal', time: 'tag', when: { notFlag: 'epilog' }, dialogue: 're-alesa-zero-5' },
  ],
  companion: {
    // world.md §4.6: nur im Nachspiel ab ♥6; Schwarmstörer ab ♥8.
    recruit: alle(EPILOG, ab(ID, 6)),
    stats: {
      hp: 34, armor: 1, morale: 60,
      attributes: { technik: 9, koerper: 2, reflexe: 4, ausstrahlung: 3, strasse: 2 },
      weapon: { kind: 'smart', damage: 4, range: 6, hit: 4 },
      abilities: ['alesa-prototyp-werfen', 'alesa-kalibrieren'],
    },
    heartAbilities: [{ hearts: 8, ability: 'alesa-schwarmstoerer' }],
  },
  partyCheckBonus: [{ attribute: 'technik', tags: ['hacken', 'reparieren', 'fachgespraech'], value: 1, label: 'Alesa murmelt Fachbegriffe' }],
  talk: [
    rede('alesa-tag-rivale', rivale(ID)),
    rede('alesa-tag-epilog-cafe', alle(EPILOG, { time: 'morgen' })),
    rede('alesa-tag-werkstatt', EPILOG),
    rede('alesa-tag-festgesetzt', alle(PARTYNACHT, { flag: 'nexus_rebelliert' })),
    rede('alesa-tag-party', PARTYNACHT),
    rede('alesa-tag-schrott', alle(nichtGetroffen(ID), { origin: 'origin-schrott' })),
    rede('alesa-tag-standard', nichtGetroffen(ID)),
    rede('alesa-tag-zweifel', alle(AKT2, { flag: 'alesa_zweifel' })),
    rede('alesa-tag-digitech', alle({ weekday: 'mi' }, { time: 'tag' })),
    rede('alesa-tag-glaspark', { time: 'abend' }),
    rede('alesa-tag-labor', alle(AKT2, eins({ time: 'tag' }, { time: 'nacht' }))),
    rede('alesa-tag-cafe', undefined, 2),
    rede('alesa-tag-standard'),
  ],
};

export const part: ContentPart = {
  npcs: { [ID]: alesa },
  dialogues: sammle(
    T.schrott, T.digitech, T.standard, T.cafe, T.glaspark, T.labor, T.zweifel, T.party, T.festgesetzt, T.werkstatt, T.epilogCafe, T.rivale,
    he2, he4, he6, he8, he10, re2, re5,
  ),
  enemies: Object.fromEntries(enemies.map((e) => [e.id, e])),
  encounters: Object.fromEntries(encounters.map((e) => [e.id, e])),
};
