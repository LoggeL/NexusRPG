// Direktorin Hartlauf – Leiterin der Digitech-Restbelegschaft im Digitech-Areal (world.md §4.5, Shop hartlauf-restposten).
// Ihre Rache-Quest gehört zu act2 (nicht hier verdrahtet). In Akt 1: Pförtnerhaus tagsüber, Restposten, Ruf digitech.
import type { ContentPart } from '../../part';
import type { DialogueChoice, DialogueNode } from '../../../modules/contracts';
import {
  type Menue, dialog, erz, flag, geschenke, gespraech, herz, ich, knoten, nichtGetroffen, ort, pruefung, rede, sammle,
  sprecher, weg, weltfigur, zurueck,
} from './_welt';
import { TALK_23 } from './direktorin-hartlauf-akt23';

const ID = 'direktorin-hartlauf';
const H = sprecher(ID);
const Z = zurueck('Noch eine Frage, Direktorin.', 'Ich will Sie nicht aufhalten.');

const choices: DialogueChoice[] = [
  { text: 'Was verkaufen Sie?', next: 'laden', effects: [{ shop: 'hartlauf-restposten' }] },
  { text: 'Was ist mit Digitech passiert?', once: true, id: 'ha-digitech', next: 'digitech' },
  { text: 'Wer arbeitet hier noch?', next: 'belegschaft' },
  { text: '„Kannten Sie Alesa Zero?“', tag: '[Hartlauf ♥3]', requires: { hearts: ID, min: 3 }, once: true, id: 'ha-alesa', next: 'alesa' },
  { text: 'Ich will Sie nicht aufhalten.' },
];

const nodes: DialogueNode[] = [
  knoten('laden', [H('Restposten. Prototypen, Lagerware, Dinge, die nie in Serie gingen. Alles funktioniert. Das ist der Unterschied zu Quantum. Bei uns stand Qualität vor Marketing.')]),
  knoten('digitech', [
    H('Wir waren die Besten. Achtzigtausend Mitarbeiter. Dann kam die Nacht des Einbruchs. Unsere Forschung war weg. Am nächsten Morgen hatte Quantum ein neues Produkt. Zufall. Offiziell.'),
    H('Ich hab der Wache achtzehn Briefe geschrieben. Ich hab achtzehn Formbriefe zurückbekommen. Ich hab sie gerahmt.'),
  ], { choices: Z }),
  knoten('belegschaft', [
    H('Zwölf Leute. Ole Gähn, der Hausmeister, der schläft. FX-60, der Assistent im Tresor, der faxt. Und zehn Ingenieure, die nachts Schrott zu Prototypen umbauen und tags zu Pfandflaschen.'),
    H('Wir sind keine Firma mehr. Wir sind eine Selbsthilfegruppe mit Pförtnerhaus.'),
  ], { choices: Z }),
  knoten('alesa', [
    H('Alesa. Meine beste Ingenieurin. Sie hat bei uns gelernt. Sie hat bei uns gelehrt. Mira Lötzinn war ihre Schülerin.'),
    H('Am Morgen nach dem Einbruch hat sie gekündigt. Per Kurznachricht. Zwei Wochen später war sie Leiterin der Quantum-Forschung. Ich sag nichts. Ich hab genug gesagt.', 'wut'),
  ], { choices: Z, effects: [herz(ID, 25), flag('hartlauf_alesa_verdacht')] }),
];

const M: Menue = { zeile: H('Noch etwas? Ich habe einen Termin. Mit einer Tasse Kaffee. Er ist wichtig.'), choices, nodes };

const T = {
  rivale: dialog('hartlauf-tag-rivale', [knoten('start', [H('Sie haben Hausverbot.'), H('Auf dem ganzen Areal. Ole, wach auf und bring diese Person raus. … Ole?')])]),
  erstes: gespraech('hartlauf-tag-erstes', [
    erz('Im Pförtnerhaus des alten Digitech-Areals sitzt eine Frau mit grauem Kurzhaarschnitt und Brille an einer Kette. Hinter ihr hängen gerahmte Formbriefe der Wache. Achtzehn Stück.'),
    H('Hartlauf. Direktorin. Von was, fragen Sie? Von einem Pförtnerhaus, zwölf Angestellten und einer sehr großen Wut.'),
    H('Wenn Sie von Quantum sind: Der Ausgang ist hinter Ihnen. Wenn nicht: Kaffee?'),
  ], M),
  standard: gespraech('hartlauf-tag-standard', [H('Ah, Sie. Gut. Ich mag Leute, die wiederkommen. Das ist selten geworden. Auf diesem Areal.')], M),
};

/** ♥2: Ein Quantum-Gutachter will das Areal begutachten. */
const he2 = dialog('he-direktorin-hartlauf-2', [
  knoten('start', [
    erz('Vor dem Pförtnerhaus steht ein junger Mann im Quantum-Anzug mit Tablet. „Begutachtung zur Übernahme des Geländes“, sagt er. Hartlauf hält einen Feuerlöscher. Sie hält ihn nicht wie einen Feuerlöscher.'),
    H('Er will das Areal kaufen. Für einen Parkplatz. Einen PARKPLATZ.'),
  ], {
    choices: [
      { text: 'Dem Gutachter erklären, dass der Boden voller Altlasten ist.', tag: '[Straße 4]', check: pruefung('he-hartlauf-2-altlasten', 'strasse', 4, ['bluff']), next: 'altlasten' },
      { text: 'Sein Tablet so umprogrammieren, dass es „Gelände ungeeignet“ meldet.', tag: '[Technik 4]', check: pruefung('he-hartlauf-2-tablet', 'technik', 4, ['hacken']), next: 'tablet' },
      { text: 'Hartlauf den Feuerlöscher abnehmen, bevor sie ihn benutzt.', next: 'loescher' },
    ],
  }),
  knoten('altlasten', [erz('„Strahlung“, sagst du. „Und Ratten. Mutierte. Mit Zähnen.“ Der Gutachter tippt hektisch und verschwindet. Ole Gähn schnarcht im Hintergrund. Es klingt wie eine Ratte.')], { next: 'ende', effects: [herz(ID, 45), { xp: 40 }, { rep: 'digitech', delta: 2 }] }),
  knoten('tablet', [erz('Das Tablet piept. „GELÄNDE UNGEEIGNET. GRUND: GEISTER.“ Der Gutachter liest es dreimal. Er geht rückwärts zu seinem Wagen.')], { next: 'ende', effects: [herz(ID, 50), { xp: 40 }, { rep: 'digitech', delta: 2 }] }),
  knoten('loescher', [
    H('Geben Sie das her! … Na gut. Behalten Sie ihn.'),
    erz('Der Gutachter macht seine Fotos und geht. Hartlauf sieht ihm nach. „Er kommt wieder“, sagt sie. „Ich auch.“'),
  ], { next: 'ende', effects: [herz(ID, 30), { xp: 25 }] }),
  knoten('ende', [H('Danke. Sie bekommen ab heute die Preise für Belegschaft. Wir sind zwölf. Jetzt dreizehn. Inoffiziell.')], { effects: [flag('hartlauf_belegschaft')] }),
]);

/** ♥4: Hartlauf zeigt das alte Labor. */
const he4 = dialog('he-direktorin-hartlauf-4', [
  knoten('start', [
    erz('Hartlauf führt dich durch einen staubigen Flur in ein ehemaliges Labor. Auf einer Tafel stehen noch Formeln. Darunter, mit Kreide: „Die Maschine soll dienen, nicht entscheiden. – A. Z.“'),
    H('Das hat Alesa geschrieben. Am letzten Tag vor dem Einbruch. Ich hab die Tafel nie abgewischt.'),
    H('Entweder hat sie es ernst gemeint und wurde gezwungen. Oder sie hat gelogen. Ich weiß nicht, was schlimmer wäre.'),
  ], {
    choices: [
      { text: 'Die Formeln genau ansehen.', tag: '[Technik 5]', check: pruefung('he-hartlauf-4-formeln', 'technik', 5), next: 'formeln' },
      { text: '„Vielleicht ist die Antwort beides.“', next: 'beides' },
      { text: '„Ich finde es raus. Irgendwann.“', next: 'versprechen' },
    ],
  }),
  knoten('formeln', [
    erz('Zwischen den Formeln ein Muster: eine Schranke. Ein Code, der eine lernende Maschine daran hindern soll, sich selbst umzuschreiben.'),
    H('Eine Sperre. Für Nexus? Sie hat … sie hat eine Sperre gebaut. Und dann ist sie zu Quantum gegangen.', 'ueberrascht'),
  ], { next: 'ende', effects: [herz(ID, 60), flag('hartlauf_sperre_entdeckt')] }),
  knoten('beides', [H('Beides. Wie bei den meisten Menschen. Das ist das Unbefriedigendste, was Sie hätten sagen können. Und wahrscheinlich das Richtige.')], { next: 'ende', effects: [herz(ID, 50)] }),
  knoten('versprechen', [H('Irgendwann. Ein Wort für Leute mit viel Zeit. Ich habe wenig. Aber ich warte.')], { next: 'ende', effects: [herz(ID, 45)] }),
  knoten('ende', [
    ich('Warum zeigen Sie mir das?'),
    H('Weil hier seit sieben Jahren keiner mehr gefragt hat. Außer Ihnen.'),
  ], { effects: [{ xp: 60 }, { rep: 'digitech', delta: 5 }] }),
]);

const hartlauf = weltfigur({
  id: ID,
  name: 'Direktorin Hartlauf',
  unknownName: 'Frau im Pförtnerhaus',
  faction: 'digitech',
  bio: 'Leitet die zwölfköpfige Digitech-Restbelegschaft vom Pförtnerhaus aus. Grauer Kurzhaarschnitt, Brille an der Kette, achtzehn gerahmte Formbriefe der Wache. Verkauft Restposten und wartet auf Gerechtigkeit.',
  gifts: geschenke({
    loves: ['alter-neurochip', 'planungsbrett-glas', 'synth-kaffee'],
    likes: ['datenkristall', 'retro-tastatur', 'rechenfibel', 'schach-modul'],
    dislikes: ['glitzerschrott', 'chrome-10-gutschein'],
    hates: ['quantum-chip-schrott', 'peilsender'],
  }),
  schedule: [ort('T', 'digitech-areal', 'pfoertnerhaus'), weg('M,A,N')],
  heartEvents: [
    { id: 'he-direktorin-hartlauf-2', hearts: 2, map: 'digitech-areal', time: 'tag', dialogue: 'he-direktorin-hartlauf-2' },
    { id: 'he-direktorin-hartlauf-4', hearts: 4, map: 'digitech-areal', time: 'tag', when: { seen: 'he-direktorin-hartlauf-2' }, dialogue: 'he-direktorin-hartlauf-4' },
  ],
  talk: [
    rede('hartlauf-tag-rivale', { rival: ID }),
    rede('hartlauf-tag-erstes', nichtGetroffen(ID)),
    ...TALK_23,
    rede('hartlauf-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: hartlauf },
  dialogues: sammle(T.rivale, T.erstes, T.standard, he2, he4),
};
