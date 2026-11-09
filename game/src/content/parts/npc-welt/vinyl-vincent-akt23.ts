// Vinyl-Vincent in Akt 2, Akt 3 und im Nachspiel. Kein eigener Inhaltsteil: vinyl-vincent.ts holt die Phasen von hier.
// Lou Lametta bleibt verschwunden: Hier nur Vincents Verdacht, keine Auflösung.
import { type Menue, erz, knoten, sprecher } from './_welt';
import {
  type Akt23, AKT2_NUR, AKT3_NACHT, ENDE_3B, ENDE_MEER, ENDE_NEXUS, EPILOG_FREI, MASTER, alle, erweitere, phasen, thema,
} from './_lz-akt23';

const ID = 'vinyl-vincent';
const V = sprecher(ID);
const Z = [{ text: 'Noch was, Vincent.', next: 'menue' }, { text: 'Keep on spinning.' }];

export function akt23(M0: Menue): Akt23 {
  const M = erweitere(M0, [
    thema(ID, 'melodie', 'Was summen die Gechippten da eigentlich?', 'v23-melodie'),
    thema(ID, 'lou', '„Glaubst du, die haben damals Lou gechippt?“', 'v23-lou', alle(AKT2_NUR, { flag: 'vincent_fass_hinweis' }), 20),
  ], [
    knoten('v23-melodie', [
      V('Dasselbe. Alle dasselbe. Vier Töne, Dur, aufsteigend. Die Chrome-10-Werbemelodie. Ein Jingle, der sich in Köpfen eingenistet hat wie Schimmel in einer B-Seite.', 'wut'),
      V('Ich hab’s aufgenommen. Auf Vinyl. Damit keiner später sagen kann, es war nie da. Platten lügen nicht. Platten springen höchstens.'),
    ], { choices: Z }),
    knoten('v23-lou', [
      V('…', 'trauer'),
      V('Ich hab ihre Testpressung heute Nacht wieder aufgelegt. Bei Regen. Und dann hab ich gehört, was ich all die Jahre überhört hab: Im Outro, ganz leise, singt sie eine Zeile. „Die lächeln nur, weil man’s ihnen sagt.“'),
      V('Sie wusste was. Lange vor allen. Ich weiß nicht, wo sie ist. Aber ich weiß jetzt, warum sie weg ist. Das ist schlimmer.', 'besorgt'),
    ], { choices: Z }),
  ]);

  return phasen(ID, 'vincent-23', M, [
    {
      id: 'master', when: MASTER, ohneMenue: true,
      gruss: [
        erz('Vincent nimmt die Nadel von der Platte, als du kommst. Mitten im Solo. Er hat das noch nie gemacht.'),
        V('Für dich gibt’s nur noch Kassetten. Leere. Und selbst die hast du nicht verdient, du Raubpressung.', 'wut'),
      ],
    },
    {
      id: 'ende-3b', when: ENDE_3B, einmal: true,
      gruss: [
        V('Weißt du, was ich an Vinyl liebe? Wenn’s springt, hebt man die Nadel an und setzt sie neu auf. Und dann läuft’s weiter.', 'neutral'),
        V('Du bist gesprungen. Ziemlich übel. Jemand hat dich neu aufgesetzt. Hör dir jetzt die B-Seite an. Die B-Seiten sind die ehrlichen.', 'freude'),
      ],
    },
    {
      id: 'ende-nexus', when: ENDE_NEXUS, einmal: true,
      gruss: [
        V('Die neue KI hat bei mir eine Platte bestellt. Per Lieferdrohne. Eine Kabelbrand-Erstpressung. Sie wollte wissen, wie „Lärm mit Absicht“ klingt.', 'ueberrascht'),
        V('Ich hab ihr die Platte geschickt. Und eine Notiz: „Nicht streamen. Auflegen.“ Wenn eine KI Musik lernen will, dann wenigstens richtig.'),
      ],
    },
    {
      id: 'ende-meer', when: ENDE_MEER, einmal: true,
      gruss: [
        V('Der Anzugtyp sitzt. Und seine Akten liegen offen, sagt Collin. Ich hab nach einem Namen gesucht. Lametta. Lou. Nichts.', 'trauer'),
        V('Aber in Noxius spielen sie wieder Musik, die keiner verkauft hat. Auf der Straße. Laut. Das hätte ihr gefallen. Ich leg heute ihre Platte auf. Ohne Regen.'),
      ],
    },
    {
      id: 'epilog', when: EPILOG_FREI, taeglich: true,
      gruss: [V('Na? Brauchst du Rillen? Ich hab Rillen. Neue sogar. Die Leute nehmen wieder Musik auf. In Garagen, im Kanal, auf dem Dach. Schief. Herrlich schief.', 'freude')],
      plausch: [V('Ich hab Lio angeboten, seine Demos auf Platte zu pressen. Er hat gefragt, was eine Platte ist. Ich hab mich hingesetzt und eine Stunde geschwiegen.')],
    },
    {
      id: 'akt3', when: AKT3_NACHT,
      gruss: [
        erz('Vincent hat die Lautsprecher bis zum Anschlag aufgedreht. Kabelbrand dröhnt über den leeren Markt. Aus der Oberstadt weht ganz leise der Chrome-10-Jingle herunter. Er geht im Bass unter.'),
        V('Wenn die da oben heute Nacht eine Melodie in die Köpfe schieben, spiel ich lauter. So einfach ist das.', 'signatur'),
        V('Geh. Ich halt die Stellung. Mit dem Bass. Der Bass hat Schulden. Der kämpft für jeden.'),
      ],
    },
    {
      id: 'akt2', when: AKT2_NUR, taeglich: true,
      gruss: [V('Na? Brauchst du Rillen? Die Gechippten kaufen keine Platten mehr. Die haben ja ihr Lied. Ein einziges. Für immer. Das ist die Hölle, Mann.', 'wut')],
      plausch: [V('Eine Quantum-Drohne hat meinen Stand gescannt und „Analoges Medium. Veraltet.“ gesagt. Ich hab ihr eine Polka vorgespielt. Sie ist abgestürzt. Polka wirkt immer.', 'signatur')],
    },
  ]);
}
