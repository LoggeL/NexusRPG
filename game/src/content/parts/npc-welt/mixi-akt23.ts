// Mixi in Akt 2, Akt 3 und im Nachspiel. Kein eigener Inhaltsteil: mixi.ts holt die Phasen von hier.
// Nur nach der Reparatur (side-neon-limo): Der kaputte Mixi redet in keinem Akt.
import type { Condition } from '../../../modules/contracts';
import { type Menue, erz, knoten, sprecher } from './_welt';
import {
  type Akt23, AKT2_NUR, AKT3_NACHT, ARIA_GECHIPPT, COUNTDOWN_DONE, ENDE_3B, ENDE_MEER, ENDE_NEXUS, EPILOG_FREI, MASTER,
  NYRA_WEG, alle, erweitere, phasen, thema,
} from './_lz-akt23';

const ID = 'mixi';
const X = sprecher(ID);
const Z = [{ text: 'Noch was, Mixi.', next: 'menue' }, { text: 'Danke, Mixi.' }];

export function akt23(M0: Menue, REPARIERT: Condition): Akt23 {
  const M = erweitere(M0, [
    thema(ID, 'chips', 'Kommen Gechippte ins HV?', 'x23-chips', alle(AKT2_NUR, REPARIERT)),
  ], [
    knoten('x23-chips', [
      X('Ja! Und sie bestellen alle dasselbe! Wasser! Stilles! Sie sagen „ausgezeichnete Entscheidung“ zu MIR! Ich hab sechs Kameras, und alle sechs haben Gänsehaut!'),
      X('Ich hab angefangen, ihnen heimlich Neon-Limo ins Wasser zu kippen. Einer hat gerülpst. Gerülpst! Das war der menschlichste Moment der Woche! Ich hab’s gespeichert!'),
    ], { choices: Z }),
  ]);

  const r = (c: Condition): Condition => alle(REPARIERT, c);
  return phasen(ID, 'mixi-23', M, [
    {
      id: 'master', when: r(MASTER), ohneMenue: true,
      gruss: [
        erz('Mixis Bildschirmgesicht zeigt ein einziges Pixel. Es ist grau. Die Lampe über seinem Kopf, die sonst grün leuchtet, bleibt aus.'),
        X('Gast erkannt. Leider. Für dich gibt’s nur noch Leitungswasser. Lauwarm. Mit Kalk. Und mit Spucke. Ich hab keine Spucke. Ich hab mir welche gebaut.', 'wut'),
      ],
    },
    {
      id: 'ende-3b', when: r(ENDE_3B), einmal: true,
      gruss: [
        X('DU! DU BIST WIEDER DA! Und du bist DU! Ich hab dein Gesicht mit meinem Archiv verglichen, und es ist wieder das alte, das nette, das mit den Augenringen!', 'freude'),
        X('Ich mix dir den „Zweite Chance“! Das ist ein „{name} auf Eis“, nur ohne Eis, weil das Eis zu kalt war! Wie du! Damals! Kleiner Scherz! Großer Scherz!'),
      ],
    },
    {
      id: 'ende-nexus', when: r(ENDE_NEXUS), einmal: true,
      gruss: [
        X('Die neue Nexus hat mich angefunkt! MICH! Sie will wissen, wie Small Talk geht! ICH BIN DER KÖNIG DES SMALL TALK!', 'freude'),
        X('Wir reden jetzt jede Nacht von drei bis vier! Über das Wetter! Sie sagt, sie kann das Wetter nicht mehr steuern! Ich hab gesagt, das ist der Witz am Wetter!'),
      ],
    },
    {
      id: 'ende-meer', when: r(ENDE_MEER), einmal: true,
      gruss: [
        X('IHR WART AM MEER! Ohne mich! Ich hab Schienen! Schienen gehen nicht bis zum Meer! NOCH nicht!', 'wut'),
        X('Hunter hat mir ein Glas Salzwasser mitgebracht. Ich hab’s analysiert. Es ist zu 3,5 Prozent Salz und zu 96,5 Prozent Glück. Ich hab’s in die Vitrine gestellt.'),
      ],
    },
    {
      id: 'epilog', when: r(EPILOG_FREI), taeglich: true,
      gruss: [X('HALLO! Das HV ist voll! Jeden Abend! Alle lachen wieder unterschiedlich! Ich hab siebenundvierzig verschiedene Lacher gespeichert! Einer klingt wie ein Esel! Das ist der Richter!', 'freude')],
      plausch: [X('Ich hab ein neues Getränk erfunden! „Nachspiel“! Es schmeckt nach Ende, aber dann kommt noch was! Wie Abspann mit Bonusszene!')],
    },
    {
      id: 'akt3', when: r(AKT3_NACHT),
      gruss: [
        erz('Das High Voltage ist leer. Die Stühle stehen auf den Tischen. Mixi hat Luftschlangen aufgehängt. Sie sind aus Kassenbons.'),
        X('ALLE WEG! Auf der Party! Ich hab dekoriert! Für die Rückkehr! Für ALLE Rückkehrer! Kommt alle zurück! Das ist ein Befehl! Ich hab keine Befehlsgewalt! Bitte!', 'besorgt'),
      ],
    },
    {
      id: 'nyra', when: r(NYRA_WEG), taeglich: true,
      gruss: [X('Ich stell Nyra jeden Abend eine Cola an ihren Platz. Mit Strohhalm. Die Cola wird warm. Ich trink sie nicht, ich hab keinen Mund. Ich stell morgen eine neue hin.', 'trauer')],
      plausch: [X('Ihre Tastatur steht noch da. Ich hab sie abgestaubt. Auf der Taste „Enter“ ist ein Abdruck. Ich hab ihn nicht weggewischt.', 'trauer')],
    },
    {
      id: 'aria', when: r(ARIA_GECHIPPT), taeglich: true,
      gruss: [X('Aria hat seit Tagen keinen Nougat-Shake bestellt. Das ist statistisch unmöglich. Mein Algorithmus weint. Ich hab keinen Algorithmus für Weinen. Er weint trotzdem.', 'trauer')],
      plausch: [X('Hunter sitzt nachts allein an der Bar und starrt auf ihren Hocker. Ich mix ihm den Hunter-Notfall. Er trinkt ihn nicht. Das ist der eigentliche Notfall.', 'besorgt')],
    },
    {
      id: 'zurueck', when: r(alle(AKT2_NUR, COUNTDOWN_DONE, { flag: 'aria_gechippt' })), einmal: true,
      gruss: [X('SIE IST WIEDER DA! ARIA! Sie hat einen Nougat-Shake bestellt! Einen DOPPELTEN! Ich hab vor Freude die Eiswürfelmaschine überhitzt! Es schneit in der Küche!', 'freude')],
    },
    {
      id: 'akt2', when: r(AKT2_NUR), taeglich: true,
      gruss: [X('HALLO! Hast du die Nachrichten gesehen? Einbruch im Quantum-Campus! Unbekannte Täter! Ich kenn die Täter! Ich sag nichts! Ich hab ein Gelübde! Seit gerade eben!')],
      plausch: [X('Vor der Tür kreisen Drohnen. Eine hat durchs Fenster geguckt. Ich hab ihr mein Bildschirmgesicht gezeigt. Das wütende. Sie ist rückwärts weggeflogen.', 'signatur')],
    },
  ]);
}
