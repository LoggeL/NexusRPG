// Leutnant Nadel – Xions Stellvertreterin für „unangenehme Dinge“, Quantum-Sicherheit (world.md §4.3, Kopfgeld Stufe 3).
// Neue Weltfigur ab Akt 2: tags in der Sicherheitszentrale des Foyers, nachts auf dem Patrouillenweg am Campus.
// Weg, sobald kopfgeld-leutnant-nadel erledigt ist oder im Nachspiel (act23.json npcSchedules.leutnant-nadel).
// Das Kopfgeld selbst (enc-kopfgeld-leutnant-nadel) baut der Quest-Teil; hier nur Figur und Tagesgespräche.
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode } from '../../../modules/contracts';
import {
  type Menue, AKT2, EPILOG, alle, dialog, erz, eins, flag, geschenke, gespraech, herz, knoten, meldung,
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
  dialogues: sammle(T.rivale, T.erstes, T.zentrale, T.kopfgeld, T.patrouille, T.standard),
};
