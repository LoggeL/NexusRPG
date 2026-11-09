// Wett-Willi in Akt 2, Akt 3 und im Nachspiel. Kein eigener Inhaltsteil: wett-willi.ts holt die Phasen von hier.
// Er nimmt Wetten auf die Crew an – und wettet aus Prinzip dagegen.
import { type Menue, erz, knoten, sprecher } from './_welt';
import {
  type Akt23, AKT2_NUR, AKT3_NACHT, ENDE_3B, ENDE_MEER, ENDE_NEXUS, EPILOG_FREI, MASTER, PARTY_VORB, erweitere, phasen, thema,
} from './_lz-akt23';

const ID = 'wett-willi';
const W = sprecher(ID);
const Z = [{ text: 'Noch was, Willi.', next: 'menue' }, { text: 'Ich spiel lieber Lotto.' }];

export function akt23(M0: Menue): Akt23 {
  const M = erweitere(M0, [
    thema(ID, 'chips', 'Spielen die Gechippten noch Hütchen?', 'w23-chips'),
    thema(ID, 'quote', '„Welche Quote gibst du auf uns?“', 'w23-quote', PARTY_VORB),
  ], [
    knoten('w23-chips', [
      W('Die tippen immer Mitte. Immer. „Mitte ist eine ausgezeichnete Entscheidung, Master.“ Und dann verlieren sie und lächeln.', 'besorgt'),
      W('Ich hab ihnen das Geld zurückgegeben. Alles. Ich. Wett-Willi. Weißt du, wie weh das tut? Aber einen Lächler auszunehmen ist wie einem Baby den Lolli zu klauen. Und das Baby bedankt sich.'),
    ], { choices: Z }),
    knoten('w23-quote', [
      W('Auf euch? Vierzig zu eins. Die halbe Unterstadt hat gesetzt. Babette. Gully. Oma Volt hat ihre Rente gesetzt. Ihre RENTE.', 'ueberrascht'),
      W('Ich hab dagegen gewettet. Aus Prinzip. Einer muss die Bank sein.'),
      W('Bitte lasst mich verlieren. Ich will so sehr verlieren. Das wär der schönste Bankrott meines Lebens.', 'verlegen'),
    ], { choices: Z }),
  ]);

  return phasen(ID, 'willi-23', M, [
    {
      id: 'master', when: MASTER, ohneMenue: true,
      gruss: [
        erz('Willi klappt den Tisch zusammen, als er dich sieht. Die Becher verschwinden in seinen Hosenträgern. Das kann er also auch.'),
        W('Ich hab auf dich gesetzt. Alles. Und jetzt hab ich gewonnen und fühl mich wie der größte Verlierer der Unterstadt.', 'wut'),
        W('Hier gibt’s nichts mehr zu holen für dich, du Falschspieler. Nicht mal Löcher.'),
      ],
    },
    {
      id: 'ende-3b', when: ENDE_3B, einmal: true,
      gruss: [
        W('Ha! Ich hab’s gewusst! Ich hab nach dem ersten Ende auf ein zweites gesetzt. Quote tausend zu eins. Gegen mich selbst.', 'freude'),
        W('Ich hab verloren UND gewonnen. Gleichzeitig. Das ist noch keinem gelungen. Nicht mal Opa.'),
      ],
    },
    {
      id: 'ende-nexus', when: ENDE_NEXUS, einmal: true,
      gruss: [
        W('Die neue KI hat bei mir gespielt. Eine Runde. Sie hat die Kugel sofort gefunden. Zwischen meinen Fingern.', 'ueberrascht'),
        W('Dann hat sie gesagt: „Ich verrate es niemandem. Das ist ein faszinierender Beruf.“ Ich glaub, ich hab eine Schülerin. Oder eine Konkurrentin. Oder einen Albtraum.'),
      ],
    },
    {
      id: 'ende-meer', when: ENDE_MEER, einmal: true,
      gruss: [
        W('Pleite. Komplett pleite. Vierzig zu eins, mal die halbe Unterstadt. Ich musste meine Hosenträger verpfänden. Bei Oma Volt.', 'freude'),
        W('Schönster Tag meines Lebens. Babette hat mir eine Dampfnudel spendiert. Aus Mitleid. Mitleid schmeckt besser als Gewinn. Wer hätte das gedacht.'),
      ],
    },
    {
      id: 'epilog', when: EPILOG_FREI, taeglich: true,
      gruss: [W('Treten Sie näher! Wett-Willi, der ehrlichste Betrüger einer jetzt etwas ehrlicheren Stadt! Drei Becher, eine Kugel, null Garantie, viel Gefühl!')],
      plausch: [W('Die Leute verlieren wieder unterschiedlich. Fluchend, heulend, mit Würde, ohne Würde. Ich hab gar nicht gemerkt, wie sehr mir das gefehlt hat.', 'freude')],
    },
    {
      id: 'akt3', when: AKT3_NACHT,
      gruss: [
        erz('Willi steht mitten in der Nacht am Schrottmarkt, eine Tafel neben sich. Darauf, mit Kreide: „HEUTE NACHT. CREW gegen QUANTUM. Quote 40:1.“ Vor der Tafel eine Schlange.'),
        W('Letzte Einsätze! Die Wetten schließen, wenn der Turm brennt! Oder nicht brennt!', 'signatur'),
        W('Du? Du darfst nicht wetten. Du bist Teil vom Spiel. Geh. Und verlier mir ja nicht.'),
      ],
    },
    {
      id: 'akt2', when: AKT2_NUR, taeglich: true,
      gruss: [W('Na, Glückspilz? Seit dem Einbruch im Campus läuft das Geschäft. Alle wollen wetten, wer’s war. Ich sag nichts. Ich hab dich nie gesehen. Wer bist du überhaupt?', 'signatur')],
      plausch: [W('Quantum hat an jeder Ecke Chrome-10-Rabatte. „Heute 30 % auf Zufriedenheit.“ Das ist der dreckigste Trick, den ich je gesehen hab. Und ich steck Kugeln zwischen meine Finger.')],
    },
  ]);
}
