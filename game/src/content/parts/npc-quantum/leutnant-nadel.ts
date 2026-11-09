// Leutnant Nadel – Xions Stellvertreterin für „unangenehme Dinge“, Quantum-Sicherheit (world.md §4.3, Kopfgeld Stufe 3).
// Neue Weltfigur ab Akt 2: tags in der Sicherheitszentrale des Foyers, nachts auf dem Patrouillenweg am Campus.
// Weg, sobald kopfgeld-leutnant-nadel erledigt ist oder im Nachspiel (act23.json npcSchedules.leutnant-nadel).
// Das Kopfgeld selbst (enc-kopfgeld-leutnant-nadel) baut der Quest-Teil; hier Figur, Tagesgespräche und die
// Herz-Ereignisse he-leutnant-nadel-2 (Kaffeeautomat Ostseite, Foyer, tags) und -4 (die Liste, Patrouillenweg, nachts).
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode } from '../../../modules/contracts';
import {
  type Menue, AKT2, EPILOG, alle, dialog, erz, eins, flag, geschenke, gespraech, herz, ich, knoten, meldung, nicht,
  nichtGetroffen, ort, pruefung, queststand, rede, rivale, sammle, sprecher, weg, weltfigur, xp, zurueck,
} from './_q';

const ID = 'leutnant-nadel';
const N = sprecher(ID);
const Z = zurueck('Noch eine Frage, Leutnant.', 'Ich geh dann mal. Freiwillig.');

const ERLEDIGT: Condition = queststand('kopfgeld-leutnant-nadel', 'done');
const KOPFGELD: Condition = queststand('kopfgeld-leutnant-nadel', 'active');

const choices: DialogueChoice[] = [
  { text: '„Wie ist Xion so als Chef?“', once: true, id: 'na-xion', next: 'xion' },
  { text: '„Warum Nadel?“', once: true, id: 'na-name', next: 'name' },
  {
    text: '„Ich hab acht Jahre Nachtschicht geschoben. Du hast ein Leck im Schichtplan, Kollegin.“', tag: '[Ex-Wache]',
    when: { origin: 'origin-ex-wache' }, once: true, id: 'na-wache', next: 'wache', effects: [herz(ID, 40)],
  },
  {
    text: '„Die Leute im Labor sagen „Ja, Master“. Stört dich das nicht?“', tag: '[Straße 6]',
    check: pruefung('leutnant-nadel-master', 'strasse', 6, ['durchschauen']), once: true, id: 'na-master', next: 'master',
    effects: [herz(ID, 30)],
  },
  { text: 'Ich geh dann mal. Freiwillig.' },
];

const nodes: DialogueNode[] = [
  knoten('xion', [
    N('Xion ist ein Hammer. Für jedes Problem. Auch für Schrauben. Auch für Suppe.'),
    N('Ich bin die Nadel. Ich mach die Stellen, wo der Hammer nicht hinkommt. Ohne Lärm. Ohne Formulare. Ohne Zeugen, wenn’s sein muss.'),
  ], { choices: Z }),
  knoten('name', [
    erz('Sie zieht einen Handschuh straff. Finger für Finger. Es dauert sehr lange und klingt wie Leder, das droht.'),
    N('Weil ich klein bin, spitz, und keiner merkt, dass ich drin war, bis es wehtut.'),
    N('Und weil meine Mutter Schneiderin war. Such dir eins aus. Beides stimmt.'),
  ], { choices: Z }),
  knoten('wache', [
    N('Acht Jahre. Dann weißt du, dass das Leck nicht im Plan ist. Das Leck sind die Leute, die den Plan lesen.', 'ueberrascht'),
    N('Wechsel um drei Uhr zwölf. Zwei Minuten Lücke am Brückenkopf, weil der Kaffeeautomat auf der Ostseite kaputt ist. Ich hab das dreimal gemeldet.'),
    N('Hab ich dir nicht gesagt. Und jetzt verschwinde, bevor ich mich daran erinnere, dass ich es dir nicht gesagt hab.'),
  ], { choices: Z, effects: [flag('nadel_schichtluecke'), meldung('Campus: Schichtwechsel 03:12, Lücke am Brückenkopf.')] }),
  knoten('master', [
    erz('Ihr Blick bleibt an deinem hängen. Eine Sekunde zu lang. Für eine Nadel ist eine Sekunde eine Ewigkeit.'),
    N('Es stört mich, dass sie dabei lächeln. Leute, die bei der Arbeit lächeln, haben entweder Drogen genommen oder was Schlimmeres.'),
    N('Ich hab Xion gefragt. Er hat gesagt, ich soll nicht fragen. Xion sagt sonst nie, dass man nicht fragen soll. Xion sagt sonst nur „Kralle raus“.'),
  ], { choices: Z, effects: [flag('nadel_zweifel'), xp(40)] }),
];

const M: Menue = { zeile: N('Noch was? Du hast zwanzig Sekunden. Neunzehn. Achtzehn.'), choices, nodes };

const T = {
  rivale: dialog('nadel-tag-rivale', [knoten('start', [
    N('Du. Dein Gesicht hängt bei mir an der Wand. Mit Kreis drum. Rot.', 'wut'),
    erz('Sie tippt auf das Funkgerät an ihrer Schulter. Sie drückt nicht. Noch nicht.'),
  ])]),
  erstes: gespraech('nadel-tag-erstes', [
    erz('Hinter dem Panzerglas der Sicherheitszentrale: eine kleine Frau in Quantum-Weiß mit Leutnantsstreifen, die Haare so straff gebunden, dass es wehtut beim Hinsehen. Zwölf Bildschirme. Sie sieht auf alle gleichzeitig.'),
    N('Leutnant Nadel. Sicherheit. Sie haben keinen Termin, kein Abzeichen und Schuhe, die nach Unterstadt riechen.'),
    N('Reden Sie. Schnell. Ich zähle mit.'),
  ], M),
  zentrale: gespraech('nadel-tag-zentrale', [
    erz('Die Sicherheitszentrale summt. Nadel trinkt Tee aus einem Becher mit der Aufschrift „WELTBESTE STELLVERTRETERIN“. Er ist von ihr selbst.'),
    N('Sie schon wieder. Ich hab Sie auf Kamera vier, sieben und elf. Auf elf sehen Sie dicker aus.'),
  ], M),
  kopfgeld: dialog('nadel-tag-kopfgeld', [knoten('start', [
    N('Ich weiß, wer du bist. Ich weiß, was auf dem Zettel am Kopfgeldbrett steht. Mein Name. In einer hässlichen Schrift.', 'wut'),
    N('Nicht hier. Nicht vor den Kameras. Wenn du was von mir willst: Patrouillenweg, nachts. Ich warte. Ich warte gern.'),
  ])]),
  patrouille: dialog('nadel-tag-patrouille', [knoten('start', [
    erz('Patrouillenweg, Nacht. Taschenlampenkegel. Dann ein zweiter, dann ein dritter. In der Mitte, ohne Taschenlampe, weil sie keine braucht: Leutnant Nadel.'),
    N('Nachts auf dem Campus. Ohne Abzeichen. Erklär mir, warum ich nicht jetzt gleich Alarm drücke. Ich hab heute noch keinen gedrückt. Ich vermisse es.'),
  ], {
    choices: [
      {
        text: '„Ich bin von der Spätschicht im Labor. Dr. Winkel braucht seine Brille. Er sieht ohne nichts.“', tag: '[Ausstrahlung 6]',
        check: pruefung('leutnant-nadel-bluff', 'ausstrahlung', 6, ['ueberreden', 'luegen']), next: 'bluff',
      },
      {
        text: 'Einen Credit-Chip über den Zaun schnippen. „Für die Kaffeekasse. Ostseite.“',
        when: { credits: 200 }, next: 'kaffeekasse', effects: [{ credits: -200 }],
      },
      { text: '„Ich wollte nur die Sterne sehen. Ihr habt hier oben welche.“', next: 'sterne' },
      { text: 'Rennen.', next: 'rennen' },
    ],
  }), knoten('bluff', [
    N('Winkel. Brille. Der sieht auch MIT Brille nichts. Das stimmt sogar.', 'ueberrascht'),
    N('Fünf Minuten. Dann bist du weg, oder du bist ein Fall für die Akte. Ich mag Akten. Akten mögen mich nicht.'),
  ], { effects: [xp(30)] }),
  knoten('kaffeekasse', [
    erz('Nadel fängt den Chip, ohne hinzusehen. Steckt ihn ein.'),
    N('Ich hab nichts gesehen. Das kostet beim nächsten Mal das Doppelte. Inflation.'),
  ]),
  knoten('sterne', [
    erz('Sie sieht nach oben. Über der Kuppel ist Smog. Kein einziger Stern.'),
    N('Hier oben gibt’s keine Sterne. Nur Satelliten. Und die gehören uns.'),
    N('Mitkommen. Du kriegst ein Protokoll und einen Kaffee. Der Kaffee ist schlimmer.'),
  ], { effects: [{ wanted: 1 }, meldung('Leutnant Nadel hat dich protokolliert. Fahndung +1.')] }),
  knoten('rennen', [
    N('Oh, bitte. Bitte renn. Bitte.', 'freude'),
  ], { effects: [{ battle: 'enc-campus-patrouille' }] })]),
  standard: gespraech('nadel-tag-standard', [N('Was. Ich hab drei Alarme, zwei Idioten und einen Xion. Sie sind Nummer sieben auf meiner Liste.')], M),
};

/** Herz-Ereignisse nur in Akt 2, solange das Kopfgeld weder läuft noch erledigt ist und kein Nachspiel ist. */
const HE_FREI: Condition = alle(AKT2, nicht(eins(ERLEDIGT, KOPFGELD, EPILOG)));

/** ♥2: Der Kaffeeautomat auf der Ostseite – das Leck im Schichtplan. */
const he2 = dialog('he-leutnant-nadel-2', [
  knoten('start', [
    erz('Foyer, Ostseite. Neben der Sicherheitszentrale steht ein Kaffeeautomat mit einem Zettel: „DEFEKT. GEMELDET. 3×.“ Darunter, kleiner: „4×.“ Darunter, noch kleiner: „IHR WICHSER.“'),
    erz('Leutnant Nadel steht davor und starrt ihn an. Der Automat starrt zurück. Er blinkt rot. Er verliert.'),
    N('Du. Gut. Du bist nicht von der Haustechnik. Die Haustechnik kommt nicht. Die Haustechnik ist ein Gerücht.', 'wut'),
    N('Zwei Minuten Lücke am Brückenkopf, jede Nacht, weil sich die Ostschicht ihren Kaffee auf der Westseite holt. Wegen DIESEM Ding. Ich hab Akten über das Ding. Es hat eine Personalnummer.'),
  ], {
    choices: [
      {
        text: 'Die Frontklappe abschrauben und das Brühventil neu setzen.', tag: '[Technik 4]',
        check: pruefung('he-leutnant-nadel-2-ventil', 'technik', 4, ['reparieren', 'maschine']), next: 'repariert',
      },
      {
        text: 'Einmal ordentlich gegen die Seite treten. Da, wo der Aufkleber „NICHT TRETEN“ klebt.', tag: '[Körper 4]',
        check: pruefung('he-leutnant-nadel-2-tritt', 'koerper', 4, ['kraft', 'maschine']), next: 'tritt',
      },
      { text: 'Ihr einen Synth-Kaffee aus der Tasche hinhalten.', when: { item: 'synth-kaffee' }, effects: [{ take: 'synth-kaffee' }], next: 'kaffee' },
      { text: '„Ich bin nicht dein Hausmeister, Leutnant.“', next: 'nein' },
    ],
  }),
  knoten('repariert', [
    erz('Die Klappe fällt dir auf den Fuß. Drinnen: ein Ventil, verklebt mit drei Jahren Zucker. Du kratzt, drehst, fluchst. Dann gurgelt es, und braune Brühe läuft in einen Becher, der seit dem Frühjahr da steht.'),
    N('Er … läuft.', 'ueberrascht'),
    N('Drei Meldungen. Vier. Eine mit Beleidigung. Und dann kommt einer ohne Abzeichen, mit Unterstadtschuhen, und macht es in vier Minuten. Ich hasse diese Firma.'),
  ], { next: 'ende', effects: [herz(ID, 50), xp(40), flag('nadel_automat_repariert')] }),
  knoten('tritt', [
    erz('KLONG. Der Automat hustet, spuckt einen Becher aus, dann noch einen, dann sieben. Alle voll. Einer mit Milch, obwohl er keine Milch hat.'),
    N('Das war Sachbeschädigung an Firmeneigentum.', 'wut'),
    N('… Mach’s nochmal. Für die Nachtschicht.', 'freude'),
  ], { next: 'ende', effects: [herz(ID, 40), xp(30), flag('nadel_automat_repariert')] }),
  knoten('kaffee', [
    N('Synth-Kaffee. Aus der Unterstadt. Aus einer Tasche. Warm von deinem Bein.', 'ueberrascht'),
    erz('Sie trinkt ihn in einem Zug. Sie verzieht keine Miene. Dann verzieht sie doch eine.'),
    N('Scheußlich. Bester Kaffee seit Wochen. Das bleibt unter uns, oder ich lass dich in der Drehtür verhungern.'),
  ], { next: 'ende', effects: [herz(ID, 40), xp(20)] }),
  knoten('nein', [
    N('Nein. Du bist ein Sicherheitsrisiko mit Händen. Aber gut. Ich merk mir, dass du Nein sagen kannst. Das können hier nur noch drei Leute. Einer davon ist der Automat.', 'neutral'),
  ], { next: 'ende', effects: [herz(ID, 20)] }),
  knoten('ende', [
    N('Hör zu. Ich sag das einmal. Wenn du hier was willst, dann komm tags. Nachts bin ich nicht nett. Tags bin ich auch nicht nett, aber ich hab Zeugen.'),
  ], { effects: [flag('nadel_vertraut')] }),
]);

/** ♥4: Die Liste mit dem roten Kreis. */
const he4 = dialog('he-leutnant-nadel-4', [
  knoten('start', [
    erz('Patrouillenweg, kurz nach Mitternacht. Keine Taschenlampen. Nadel sitzt auf der Brüstung über dem Campus, die Beine baumeln über vierzig Metern Nichts. Neben ihr ein Klemmbrett.'),
    N('Setz dich. Oder bleib stehen. Ist mir egal. Wenn du runterfällst, ist das ein Unfall, und Unfälle machen weniger Papierkram als Festnahmen.'),
    erz('Auf dem Klemmbrett: eine Liste. Namen, Fotos, Häkchen. Ganz oben dein Gesicht. Roter Kreis. Darunter, ohne Kreis: ein Mann im Laborkittel, der lächelt. Darunter noch einer. Alle lächeln.'),
    N('Die Leute aus dem Labor. Ich soll aufschreiben, wann sie kommen und wann sie gehen. Sie kommen nicht mehr. Sie gehen nicht mehr. Sie stehen. Und lächeln. Und sagen „Ja, Master“ zu einem Getränkeautomaten.', 'besorgt'),
  ], {
    choices: [
      {
        text: '„Du schreibst Listen für Leute, die keine Leute mehr sind. Und du weißt das.“', tag: '[Straße 5]',
        check: pruefung('he-leutnant-nadel-4-wahrheit', 'strasse', 5, ['durchschauen']), next: 'wahrheit',
      },
      { text: '„Streich meinen Namen. Nur für heute Nacht.“', next: 'streichen' },
      { text: '„Gib mir die Liste. Ich bring sie Collin Charleston. Dann liest sie die ganze Stadt.“', tag: '[Ausstrahlung 6]', check: pruefung('he-leutnant-nadel-4-presse', 'ausstrahlung', 6, ['ueberzeugen']), next: 'presse' },
    ],
  }),
  knoten('wahrheit', [
    N('…', 'neutral'),
    N('Ich weiß das. Natürlich weiß ich das. Ich bin klein, nicht blöd.', 'wut'),
    N('Xion sagt: nicht fragen. Also frag ich nicht. Ich schreib nur auf. Wer aufschreibt, ist nicht schuld. Hab ich mir so gebaut. Hält nicht gut. Wie der Automat.', 'trauer'),
  ], { next: 'ende', effects: [herz(ID, 50), flag('nadel_zweifel')] }),
  knoten('streichen', [
    erz('Sie sieht dich lange an. Dann nimmt sie einen Stift und malt einen zweiten Kreis um dein Gesicht. Einen grünen. Über den roten.'),
    N('Grün heißt: Sicherheitsrisiko, aber unterhaltsam. Die Kategorie hab ich gerade erfunden. Du bist der Einzige drin.', 'signatur'),
  ], { next: 'ende', effects: [herz(ID, 40)] }),
  knoten('presse', [
    N('Charleston. Der mit dem Kinn. Der mit den Haaren, die man von der Kuppel aus sieht.', 'ueberrascht'),
    N('Nein. Die Liste bleibt bei mir. Aber …'),
    erz('Sie reißt die unterste Seite ab und schiebt sie dir hin. Keine Namen. Nur Uhrzeiten. Laboraufzug, jede Nacht, immer zwischen zwei und drei.'),
    N('Das hast du nicht von mir. Das hast du von einem Automaten. Der redet neuerdings. Ich hab ihn verhört.'),
  ], { next: 'ende', effects: [herz(ID, 50), flag('nadel_laborzeiten'), meldung('Nadels Zettel: Der Laboraufzug fährt jede Nacht zwischen 02:00 und 03:00.')] }),
  knoten('ende', [
    ich('Und jetzt?'),
    N('Jetzt stehst du auf und gehst, bevor die Drohne um eins vorbeikommt. Und ich sitz hier und zähl Lampen. Das beruhigt. Es sind immer zweihundertzwölf.'),
    N('Wenn das alles mal kracht, Unterstadt … dann will ich nicht auf der falschen Seite der Liste stehen. Merk dir das. Ich merk mir alles. Das ist mein Problem.', 'trauer'),
  ], { effects: [xp(60), flag('nadel_liste_gesehen')] }),
]);

const nadel = weltfigur({
  id: ID,
  name: 'Leutnant Nadel',
  unknownName: 'Kleine Frau mit Leutnantsstreifen',
  faction: 'quantum',
  bio: 'Xion Venoms Stellvertreterin bei der Quantum-Sicherheit. Klein, spitz, unbestechlich, außer für die Kaffeekasse. Tags in der Sicherheitszentrale, nachts auf dem Patrouillenweg. Auf ihren Kopf ist ein Kopfgeld ausgesetzt.',
  gifts: geschenke({
    loves: ['synth-kaffee'],
    likes: ['zeitung-papier', 'nanogel'],
    dislikes: ['plueschmoehre', 'neonkreide'],
    hates: ['handschellen'],
  }),
  schedule: [
    weg('*', { when: eins(ERLEDIGT, EPILOG) }),
    ort('N', 'quantum-campus', 'patrouillenweg', { when: AKT2 }),
    ort('T', 'quantum-foyer', 'sicherheitszentrale', { when: AKT2 }),
    weg(),
  ],
  heartEvents: [
    { id: 'he-leutnant-nadel-2', hearts: 2, map: 'quantum-foyer', time: 'tag', when: HE_FREI, dialogue: 'he-leutnant-nadel-2' },
    {
      id: 'he-leutnant-nadel-4', hearts: 4, map: 'quantum-campus', time: 'nacht',
      when: alle(HE_FREI, { seen: 'he-leutnant-nadel-2' }), dialogue: 'he-leutnant-nadel-4',
    },
  ],
  talk: [
    rede('nadel-tag-rivale', rivale(ID)),
    rede('nadel-tag-patrouille', { time: 'nacht' }),
    rede('nadel-tag-kopfgeld', KOPFGELD),
    rede('nadel-tag-erstes', nichtGetroffen(ID)),
    rede('nadel-tag-zentrale', alle({ time: 'tag' }, { met: ID })),
    rede('nadel-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: nadel },
  dialogues: sammle(T.rivale, T.erstes, T.zentrale, T.kopfgeld, T.patrouille, T.standard, he2, he4),
};
