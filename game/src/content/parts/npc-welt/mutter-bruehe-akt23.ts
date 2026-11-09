// Mutter Brühe in Akt 2, Akt 3 und im Nachspiel. Kein eigener Inhaltsteil: mutter-bruehe.ts holt Phasen und
// Tagesablauf-Vorsatz von hier. In der Partynacht kocht sie durch; im Master-Modus gibt es Suppe, aber kein Wort.
import type { ScheduleEntry } from '../../../modules/contracts';
import { type Menue, erz, knoten, ort, sprecher } from './_welt';
import {
  type Akt23, AKT2_NUR, AKT3_NACHT, ARIA_GECHIPPT, ENDE_3B, ENDE_MEER, ENDE_NEXUS, EPILOG_FREI, MASTER, erweitere, phasen, thema,
} from './_lz-akt23';

const ID = 'mutter-bruehe';
const B = sprecher(ID);
const Z = [{ text: 'Noch was, Mutter Brühe.', next: 'menue' }, { text: 'Danke für die Suppe.' }];

export function akt23(M0: Menue): Akt23 & { schedule: ScheduleEntry[] } {
  const M = erweitere(M0, [
    thema(ID, 'gechippte', 'Essen die Gechippten bei dir?', 'b23-gechippte'),
    thema(ID, 'genug', 'Reicht die Suppe noch für alle?', 'b23-genug'),
  ], [
    knoten('b23-gechippte', [
      B('Die stellen sich an, kriegen ihre Schüssel, sagen „ausgezeichnete Entscheidung“ und lassen sie stehen. Bis sie kalt ist. Bis sie umkippen.', 'wut'),
      B('Ich hab angefangen, ihnen den Löffel in den Mund zu stecken. Wie bei Babys. Schmecken tun sie noch. Das sieht man an den Augen. Da drin ist noch jemand, der Hunger hat.'),
    ], { choices: Z }),
    knoten('b23-genug', [
      B('Quantum gibt Rabatt auf Chrome 10. Auf Zwiebeln gibt keiner Rabatt. Rate mal, was teurer geworden ist.'),
      B('Aber die Leute bringen was. Einer eine Kartoffel, einer einen Kohlkopf, einer eine Socke. Die Socke hab ich nicht reingetan. Fast.', 'signatur'),
    ], { choices: Z }),
  ]);

  const p = phasen(ID, 'bruehe-23', M, [
    {
      id: 'master', when: MASTER,
      gruss: [
        erz('Mutter Brühe sieht dich kommen. Sie füllt eine Schüssel, stellt sie auf den Tresen und dreht sich weg. Die Schlange hinter dir wird ganz still.'),
        B('Suppe kriegt jeder. Sogar du. Das hab ich mir vor dreißig Jahren geschworen, und ich brech keinen Schwur wegen einem, der sich ’ne Krone aufsetzt.', 'wut'),
        B('Aber reden tu ich nicht mit dir. Iss und geh.'),
      ],
    },
    {
      id: 'ende-3b', when: ENDE_3B, einmal: true,
      gruss: [
        B('Komm her. Näher. Lass dich ansehen.'),
        erz('Sie packt dein Gesicht mit beiden Händen, dreht es nach links, nach rechts, wie eine Kartoffel, bei der man nicht weiß, ob sie noch gut ist.'),
        B('Ja. Da bist du wieder. Iss. Doppelte Portion. Und dann entschuldigst du dich bei der Schlange. Bei jedem einzeln.', 'zaertlich'),
      ],
    },
    {
      id: 'ende-nexus', when: ENDE_NEXUS, einmal: true,
      gruss: [
        B('Die neue Stimme im Radio hat angerufen. Bei MIR. Sie wollte wissen, wie viel Suppe die Rohrsiedlung am Tag braucht. Ich hab gesagt: Mehr.', 'ueberrascht'),
        B('Gestern kam ein Laster. Zwiebeln. Kartoffeln. Lorbeer. Kein Absender. Nur ein Zettel: „Mit freundlichen Grüßen, Ihre Kollegin.“ Ich trau ihr nicht. Aber die Zwiebeln sind gut.'),
      ],
    },
    {
      id: 'ende-meer', when: ENDE_MEER, einmal: true,
      gruss: [
        B('Ihr habt den Anzugheini drangekriegt. Die ganze Siedlung hat vor dem Stadt-TV gestanden. Mit Schüsseln. Ich hab Nachschlag ausgegeben, bis der Kessel leer war. Zum ersten Mal seit dem Rohrbruch.', 'freude'),
        B('Und jetzt fahrt ihr ans Meer. Nehmt was zu essen mit. Am Meer gibt’s nur Fisch, und Fisch ist keine Suppe.'),
      ],
    },
    {
      id: 'epilog', when: EPILOG_FREI, taeglich: true,
      gruss: [B('Heute gibt’s Suppe. Mit Einlage. Ja, guck nicht so, EINLAGE. Die Leute bringen wieder was. Die Welt wird besser. Langsam. Wie eine gute Brühe.', 'freude')],
      plausch: [B('Babette kommt jetzt nicht mehr nur montags. Auch donnerstags. Wir reden immer noch über Männer, die wir nicht geheiratet haben. Die Liste wird nicht kürzer.')],
    },
    {
      id: 'akt3', when: AKT3_NACHT,
      gruss: [
        erz('Mitten in der Nacht dampft der Kessel. Vor dem kleinen Stadt-TV unter der Plane hockt die halbe Rohrsiedlung, Schüsseln auf den Knien. Live aus dem Himmelsgarten: Champagner.'),
        B('Die da oben trinken Blubberwasser aus Gläsern so dünn wie Eierschalen. Wir trinken Brühe. Rat mal, wer morgen früh noch weiß, wie er heißt.', 'signatur'),
        B('Und wenn du da hochgehst: Iss vorher was. Auf leeren Magen haut einen jeder Chip um.'),
      ],
    },
    {
      id: 'aria', when: ARIA_GECHIPPT, einmal: true,
      gruss: [
        B('Die mit dem Schläger. Die war mal hier, nachts, hat drei Schüsseln gegessen und für vier bezahlt. Ohne ein Wort. Sowas vergess ich nicht.', 'trauer'),
        B('Hol sie zurück. Und wenn sie wieder da ist, bring sie her. Ich koch ihr was, das so stark ist, dass kein Chip dagegen ankommt.'),
      ],
    },
    {
      id: 'akt2', when: AKT2_NUR, taeglich: true,
      gruss: [B('Na, Kindchen. Die Schlange ist länger geworden. Und leiser. Die Hälfte lächelt, die andere Hälfte hat Angst vor der Hälfte, die lächelt.', 'besorgt')],
      plausch: [B('Eine Drohne hat über dem Kessel gehangen und „Ernährungsberatung“ gesagt. Ich hab sie mit der Kelle runtergeholt. Jetzt ist sie Einlage. Spaß. Sie ist Deko.', 'signatur')],
    },
  ]);

  // Partynacht: Sie kocht durch für alle, die vor dem Stadt-TV sitzen.
  const schedule: ScheduleEntry[] = [ort('N', 'suppenkueche', 'kessel', { when: AKT3_NACHT })];
  return { ...p, schedule };
}
