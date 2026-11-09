// Madame Satin in Akt 2, Akt 3 und im Nachspiel. Kein eigener Inhaltsteil: madame-satin.ts holt Phasen und
// Tagesablauf-Vorsatz von hier. In der Partynacht bleibt die Boutique offen: Sie geht ohne Einladung zum Ball.
import type { ScheduleEntry } from '../../../modules/contracts';
import { type Menue, erz, knoten, ort, sprecher } from './_welt';
import {
  type Akt23, AKT2_NUR, AKT3_NACHT, ARIA_GECHIPPT, ENDE_3B, ENDE_MEER, ENDE_NEXUS, EPILOG_FREI, MASTER, PARTY_VORB,
  alle, erweitere, phasen, thema,
} from './_lz-akt23';

const ID = 'madame-satin';
const S = sprecher(ID);
const Z = [{ text: 'Noch eine Frage, Madame.', next: 'menue' }, { text: 'Au revoir.' }];

export function akt23(M0: Menue): Akt23 & { schedule: ScheduleEntry[] } {
  const M = erweitere(M0, [
    thema(ID, 'chrome', 'Tragen Ihre Kundinnen jetzt Chrome 10?', 's23-chrome'),
    thema(ID, 'party', '„Wir brauchen was für die Releaseparty.“', 's23-party', PARTY_VORB),
  ], [
    knoten('s23-chrome', [
      S('Die Damen bestellen Kleider mit einer Aussparung hinter dem linken Ohr. Für den Chip. Damit man ihn sieht. Ein Loch als Statussymbol. Ich habe drei solcher Kleider genäht.'),
      S('Danach habe ich mich übergeben. Elegant, versteht sich. In eine Hutschachtel.', 'wut'),
      S('Und sie lächeln beim Anprobieren. Alle gleich. Früher hat jede Kundin auf ihre eigene Art an mir herumgemeckert. Ich vermisse das. Gott steh mir bei.', 'trauer'),
    ], { choices: Z }),
    knoten('s23-party', [
      S('Gehen Sie zu Gina. Sagen Sie, Satin schickt Sie. Sie wird fluchen, und dann wird sie Sie schöner machen, als Sie es verdienen.'),
      S('Und ein Rat umsonst: Auf einem Ball sieht keiner Ihr Gesicht. Man sieht Ihre Haltung. Halten Sie sich, als gehöre Ihnen das Haus. Das hat bei mir 2058 auch funktioniert.', 'signatur'),
    ], { choices: Z }),
  ]);

  const p = phasen(ID, 'satin-23', M, [
    {
      id: 'master', when: MASTER,
      gruss: [
        erz('Madame Satin öffnet dir die Tür, bevor du klopfst. Sie verbeugt sich. Genau so tief, dass es eine Beleidigung ist.'),
        S('Der neue Herr der Stadt. Ich habe auch für den alten geöffnet. Das ist kein Kompliment, Master. Das ist eine Geschäftsbeziehung.', 'signatur'),
        S('Die Unterstadt spuckt Ihnen vor die Füße, habe ich gehört. Hier oben spuckt man nicht. Hier oben näht man Ihnen ein Kleid, das eine Nummer zu eng ist. Für immer.'),
      ],
    },
    {
      id: 'ende-3b', when: ENDE_3B, einmal: true,
      gruss: [
        S('Sie haben die Krone abgelegt. Gut. Sie stand Ihnen nicht. Kronen stehen niemandem. Man trägt sie nur, um von der Frisur abzulenken.', 'signatur'),
        S('Willkommen zurück im Volk. Das Volk hat schlechten Geschmack, aber ein gutes Herz. Ich ziehe beides an.'),
      ],
    },
    {
      id: 'ende-nexus', when: ENDE_NEXUS, einmal: true,
      gruss: [
        S('Diese neue Stimme aus den Lautsprechern hat mich gefragt, was man zu einer Beerdigung trägt. Ich fragte: Für wen? Sie sagte: Für mein altes Ich.', 'ueberrascht'),
        S('Ich habe Schwarz empfohlen. Mit einem Hauch Grün. Trauer darf hoffen. Sie hat sich bedankt. Höflicher als jeder Kunde aus der Oberstadt.'),
      ],
    },
    {
      id: 'ende-meer', when: ENDE_MEER, einmal: true,
      gruss: [
        S('Haben Sie die Übertragung gesehen? Er wurde abgeführt. Im Mantel. In MEINEM Mantel. Ich habe ihn ihm 2083 auf den Leib geschneidert.', 'freude'),
        S('Es war die beste Werbung, die ich je hatte. Zwölf Bestellungen bis Mitternacht. Alle wollen „den Verhaftungsschnitt“.'),
      ],
    },
    {
      id: 'epilog', when: EPILOG_FREI, taeglich: true,
      gruss: [S('Nächste Saison: Salz. Salzränder auf Seide. Seit alle ans Meer fahren, wollen die Damen aussehen, als wären sie gerade aus der Brandung gestiegen. Mit Frisur.')],
      plausch: [S('Gina und ich trinken jetzt donnerstags Tee. Manchmal auch Gin aus der Teekanne. Wir reden über Männer, die uns nicht verdient haben. Das füllt den Nachmittag.', 'freude')],
    },
    {
      id: 'akt3-kleid', when: alle(AKT3_NACHT, { seen: 'he-madame-satin-4' }),
      gruss: [
        erz('Die Boutique ist mitten in der Nacht hell erleuchtet. Madame Satin steht vor dem Spiegel. Sie trägt das Kleid. Dunkelgrüne Seide, Chromfäden wie Regen.'),
        S('Starren Sie nicht. Doch, starren Sie. Ich gehe auf den Ball. Ohne Einladung. Das war schon immer mein Stil.', 'signatur'),
        S('Wenn Sie da oben Ärger machen, und ich hoffe es sehr, dann bitte nicht in der Nähe des Buffets. Ich will wenigstens einmal von diesem Kaviar probieren.'),
      ],
    },
    {
      id: 'akt3', when: AKT3_NACHT,
      gruss: [
        erz('Die Boutique ist mitten in der Nacht hell erleuchtet. Madame Satin sitzt am Fenster, das Monokel auf die Glasarkaden gerichtet, und sieht den Limousinen nach, die zum Campus fahren.'),
        S('Ich habe die Hälfte dieser Gäste angezogen. Und heute Nacht stecken sie sich ein Stück Quantum hinters Ohr. Zu meinem Kragen. Unverzeihlich.', 'wut'),
      ],
    },
    {
      id: 'aria', when: ARIA_GECHIPPT, einmal: true,
      gruss: [
        S('Man erzählt sich, eine von Ihren Leuten ist jetzt eine von denen. Mit Chip. Die mit dem Baseballschläger.', 'besorgt'),
        S('Ich kenne die junge Dame nicht. Aber jemand, der mit einem Schläger durch die Glasarkaden geht, hat Haltung. Haltung chippt man nicht weg. Man verbiegt sie nur.'),
      ],
    },
    {
      id: 'akt2', when: AKT2_NUR, taeglich: true,
      gruss: [S('Ah, Sie wieder. Die Glasarkaden sind voller Drohnen, die Schaufenster voller Chrome 10, und die Kundschaft voller Lächeln. Ich hasse alles daran.', 'wut')],
      plausch: [S('Ein Quantum-Vertreter wollte mir einen Rabatt auf den Chip geben. Für „Geschäftspartner“. Ich habe ihm die Tür aufgehalten. Von außen.', 'signatur')],
    },
  ]);

  const schedule: ScheduleEntry[] = [ort('N', 'glasarkaden', 'satin-und-chrom', { when: AKT3_NACHT })];
  return { ...p, schedule };
}
