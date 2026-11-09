// Turbo-Tilda in Akt 2, Akt 3 und im Nachspiel. Kein eigener Inhaltsteil: turbo-tilda.ts holt die Phasen von hier.
// Fluchtwagen für die Party: prep-fahrzeug (quest-main-2); Rennnächte in der Rennhalle 9: npc-oednis/folgen.ts.
import { type Menue, erz, knoten, sprecher } from './_welt';
import {
  type Akt23, AKT2_NUR, AKT3_NACHT, ENDE_3B, ENDE_MEER, ENDE_NEXUS, EPILOG_FREI, MASTER, erweitere, phasen, thema,
} from './_lz-akt23';

const ID = 'turbo-tilda';
const T_ = sprecher(ID);
const Z = [{ text: 'Noch was, Champ.', next: 'menue' }, { text: 'Wir sehen uns auf der Strecke.' }];

export function akt23(M0: Menue): Akt23 {
  const M = erweitere(M0, [
    thema(ID, 'drohnen', 'Fliegen die Quantum-Drohnen auch über deine Strecke?', 't23-drohnen'),
  ], [
    knoten('t23-drohnen', [
      T_('Jeden Abend. Die fliegen wie Behördenfahrer. Schnurgerade, Blinker an, keine Seele.', 'wut'),
      T_('Ich hab eine zum Rennen herausgefordert. Über die Kräne. Sie hat abgelehnt. „Anfrage außerhalb des Leistungsumfangs.“ Feiglinge. Mit Kamera.'),
      T_('Dann bin ich ihr hinterhergeflogen und hab sie in einen Container gedrängelt. Ohne Absicht. Mit sehr viel Absicht.', 'signatur'),
    ], { choices: Z }),
  ]);

  return phasen(ID, 'tilda-23', M, [
    {
      id: 'master', when: MASTER, ohneMenue: true,
      gruss: [
        erz('Tilda schweißt an „Oma“. Als dein Schatten auf die Werkbank fällt, schweißt sie weiter. Funken fliegen in deine Richtung. Zufällig. Sehr zufällig.'),
        T_('Ich red nicht mit Leuten, die anderen Leuten Chips in den Kopf schieben. Kas hätte dir eine reingehauen. Ich bin nicht Kas. Ich flieg dir nur in den Hinterkopf.', 'wut'),
        T_('Flieg gegen einen Kran, Master.'),
      ],
    },
    {
      id: 'ende-3b', when: ENDE_3B, einmal: true,
      gruss: [
        T_('Du bist wieder da. Echt da. Gut.', 'neutral'),
        T_('Du bist abgestürzt und hast die Kiste trotzdem noch ins Ziel gebracht. Das zählt. Bei mir zählt das. Ich zähl ja auch das Rennen mit, bei dem alle anderen abgestürzt sind.', 'freude'),
      ],
    },
    {
      id: 'ende-nexus', when: ENDE_NEXUS, einmal: true,
      gruss: [
        T_('Die neue KI hat mich gefragt, ob sie an einem Rennen teilnehmen darf. Als Pilotin. Ich hab Ja gesagt.', 'ueberrascht'),
        T_('Sie ist Dritte geworden. Absichtlich. Weil sie „niemanden kränken“ wollte. Ich hab sie disqualifiziert. Wer absichtlich verliert, hat auf meiner Strecke nichts zu suchen.', 'wut'),
      ],
    },
    {
      id: 'ende-meer', when: ENDE_MEER, einmal: true,
      gruss: [
        T_('Ihr seid durch die Ödnis bis ans Meer. Mit der Karre. Ich hab die Strecke nachgerechnet. Ihr wart langsam. Aber ihr seid angekommen.', 'signatur'),
        T_('Ich flieg die Strecke nächsten Monat mit „Oma“. Ans Meer. Für Kas. Er wollte da immer hin. Er hat’s nur nie gesagt, weil er dachte, es gibt keins.', 'trauer'),
      ],
    },
    {
      id: 'epilog', when: EPILOG_FREI, taeglich: true,
      gruss: [T_('Na, Nachwuchspilot? Freitag ist wieder Rennen. Ohne Drohnen von oben, ohne Werbebanner. Nur wir, die Kräne und mein Ego.', 'freude')],
      plausch: [T_('Ich plan ein Rennen bis zum Strand. Durch die Ödnis. Die Staubfalken wollen mitmachen. Ich hab gesagt: Nur, wenn ihr nicht schießt. Sie haben gelacht. Ich hab nicht gelacht.')],
    },
    {
      id: 'akt3', when: AKT3_NACHT,
      gruss: [
        erz('Tilda sitzt auf dem Dach ihrer Box, „Oma“ im Schoß, und schaut zur Oberstadt. Das Funkgerät neben ihr knistert.'),
        T_('Heute Nacht, oder? Ich hab’s im Bauch. Wie vor einem Rennen, das man nicht gewinnen kann.', 'besorgt'),
        T_('Wenn ihr schnell weg müsst: Ich bin wach. Ruf an, und ich bin da, bevor ihr „Scheiße“ sagen könnt. Ich hab’s geübt.'),
      ],
    },
    {
      id: 'akt2', when: AKT2_NUR, taeglich: true,
      gruss: [T_('Noch was? Mach schnell. Seit dem Einbruch im Campus kontrollieren die jede Drohne am Hafen. Ich muss „Oma“ jeden Abend als Toaster tarnen.', 'signatur')],
      plausch: [T_('Zwei aus meinem Team haben sich Chrome 10 geholt. Fliegen jetzt saubere Linien. Perfekt. Langweilig. Die haben nie wieder gegen einen Kran gekracht. Die haben nie wieder gelacht.', 'trauer')],
    },
  ]);
}
