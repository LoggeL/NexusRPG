// Salzige Grete in Akt 2, Akt 3 und im Nachspiel. Kein eigener Inhaltsteil: salzige-grete.ts holt die Phasen von hier.
// Die Rostzähne kassieren am Hafen „Schutz“ (Hafen-Hannes, npc-oednis/folgen.ts, side-rostzaehne-ende).
import { type Menue, erz, knoten, sprecher } from './_welt';
import {
  type Akt23, AKT2_NUR, AKT3_NACHT, ENDE_3B, ENDE_MEER, ENDE_NEXUS, EPILOG_FREI, MASTER, alle, erweitere, nicht, phasen, thema,
} from './_lz-akt23';

const ID = 'salzige-grete';
const G = sprecher(ID);
const Z = [{ text: 'Noch was, Grete.', next: 'menue' }, { text: 'Tschüss, Grete.' }];
const ROSTZAEHNE_WEG = { quest: 'side-rostzaehne-ende', state: 'done' } as const;

export function akt23(M0: Menue): Akt23 {
  const M = erweitere(M0, [
    thema(ID, 'rostzaehne', 'Kassieren die Rostzähne auch bei dir?', 'g23-rostzaehne', alle(AKT2_NUR, nicht(ROSTZAEHNE_WEG))),
    thema(ID, 'laster', 'Was fährt nachts am Hafen?', 'g23-laster'),
  ], [
    knoten('g23-rostzaehne', [
      G('Versucht haben sie’s. Kam so ein Lackaffe mit Goldzahn und Blechdose. „Schutzgeld, Oma.“ OMA!', 'wut'),
      G('Ich hab ihm Bertram ins Gesicht gehauen. Den Aal. Bertram war schon tot, aber er hat nachgetreten. Der Kerl kommt jetzt nur noch mit Schal. Bis über die Nase.'),
      G('Aber die anderen zahlen. Hannes zahlt. Die Möwe zahlt, glaub ich. Irgendwer muss die Bande mal ins Hafenbecken kippen. Mit Steinen in den Taschen. Symbolisch.'),
    ], { choices: Z }),
    knoten('g23-laster', [
      G('Weiße Laster. Ohne Kennzeichen. Mitten in der Nacht. Die laden Kisten aufs Schiff, auf denen „Chrome 10“ steht. Und eine Kiste, die zappelt. Ich hab nicht hingeguckt. Ich hab zwei Wochen nicht hingeguckt.', 'besorgt'),
      G('Ich verkauf Fisch, Schätzchen. Fisch redet nicht. Ich auch nicht. Außer laut.'),
    ], { choices: Z }),
  ]);

  return phasen(ID, 'grete-23', M, [
    {
      id: 'master', when: MASTER, ohneMenue: true,
      gruss: [
        erz('Grete sieht dich und greift unter den Tresen. Sie holt keinen Fisch hervor. Sie holt einen Eimer Fischabfälle hervor.'),
        G('Für dich hab ich nur Gräten. Und die Möwe, die dir gleich auf den Kopf scheißt. Ich hab sie extra gefüttert. Seit Tagen.', 'wut'),
        G('Verzieh dich, du gekrönte Sardine.'),
      ],
    },
    {
      id: 'ende-3b', when: ENDE_3B, einmal: true,
      gruss: [
        G('Na, da ist ja die verlorene Sardine! Zurück im Schwarm!', 'freude'),
        G('Komm her, ich drück dich. Nein, keine Widerrede. Du riechst danach drei Tage nach Fisch. Das ist die Strafe. Und die Vergebung. Bei mir ist das dasselbe.'),
      ],
    },
    {
      id: 'ende-nexus', when: ENDE_NEXUS, einmal: true,
      gruss: [
        G('Die neue KI hat gefragt, ob sie mir beim Fischverkauf helfen kann. Mit Lautsprechern. „Frischer Fisch“, ganz höflich.', 'ueberrascht'),
        G('Ich hab gesagt, das ist mein Job. Höflich verkauft keinen Fisch. Jetzt schreit sie mit. Morgens um sechs. „FISCH!“ Ich glaub, ich mag sie.'),
      ],
    },
    {
      id: 'ende-meer', when: ENDE_MEER, einmal: true,
      gruss: [
        G('Ihr wart am Meer. Am echten. Habt ihr …', 'trauer'),
        G('Habt ihr Hallo gesagt? Zu meinem Vater? Ach, Quatsch. Ich fahr Sonntag selber hin. Mit Hannes’ Shuttle. Ich sing ihm was. Und dann schrei ich ihn an, weil er nicht zurückgekommen ist. Das hat er verdient.'),
      ],
    },
    {
      id: 'epilog', when: EPILOG_FREI, taeglich: true,
      gruss: [G('FISCH! Frischer Fisch! Heute neu: echter Meeresfisch, von Nebelhorn! Er sagt, er hat ihn selbst gefangen. Ich glaub ihm. Meistens.', 'freude')],
      plausch: [G('Am Hafen zahlt keiner mehr für „Schutz“. Die Blechdose hängt am Kai, Möwen nisten drin. Ich verkauf jetzt Nistplätze. Zwei Credits. Die Möwen zahlen nicht.')],
    },
    {
      id: 'akt3', when: AKT3_NACHT,
      gruss: [
        G('FISCH! Auch heute Nacht! Wer auf die feine Party nicht eingeladen ist, kriegt Brathering! Und wer eingeladen ist, kriegt die Gräten!', 'signatur'),
        G('Du gehst da hoch, oder? Ich seh’s dir an. Hier. Ein Hering. Für die Tasche. Wenn einer frech wird, schlag ihn damit. Funktioniert bei Rostzähnen auch.'),
      ],
    },
    {
      id: 'akt2', when: AKT2_NUR, taeglich: true,
      gruss: [G('FISCH! Na, du? Heute im Angebot: Fisch. Und Sorgen. Die Sorgen gibt’s gratis dazu, die hat hier jeder zu viel.', 'besorgt')],
      plausch: [G('Ein Gechippter wollte bei mir einen Fisch kaufen und hat sich bedankt. Beim Fisch. „Ausgezeichnete Entscheidung, Master.“ Der Fisch hat nicht geantwortet. Wenigstens einer, der noch normal ist.')],
    },
  ]);
}
