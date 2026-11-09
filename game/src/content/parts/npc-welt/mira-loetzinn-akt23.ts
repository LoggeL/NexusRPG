// Mira Lötzinn in Akt 2, Akt 3 und im Nachspiel. Kein eigener Inhaltsteil: mira-loetzinn.ts holt die Phasen von hier.
// Im Master-Modus feindselig wie die Lötgassen in quest-enden/nachspiel.ts.
import { type Menue, erz, knoten, sprecher } from './_welt';
import {
  type Akt23, AKT2_NUR, AKT3_NACHT, ARIA_GECHIPPT, ENDE_3B, ENDE_MEER, ENDE_NEXUS, EPILOG_FREI, MASTER, alle, erweitere,
  phasen, thema,
} from './_lz-akt23';

const ID = 'mira-loetzinn';
const M_ = sprecher(ID);
const Z = [{ text: 'Noch eine Frage.', next: 'menue' }, { text: 'Danke, Mira.' }];

export function akt23(M0: Menue): Akt23 {
  const M = erweitere(M0, [
    thema(ID, 'rausholen', 'Kannst du so einen Chip rausholen?', 'm23-rausholen'),
    thema(ID, 'alesa', '„Deine Ausbilderin. A. Z. Die baut das Zeug, oder?“', 'm23-alesa', alle(AKT2_NUR, { flag: 'mira_alesa_ausbilderin' }), 20),
  ], [
    knoten('m23-rausholen', [
      M_('Kann ich. Will ich nicht. Chrome 10 ist mit dem Hörnerv verlötet, und zwar schlampig. Wer da reinpfuscht, hört danach nur noch Werbung. Für immer.', 'wut'),
      M_('Dante kann’s. Der hat Hände wie ein Uhrmacher und Nerven wie ein Kühlschrank. Sag ihm nicht, dass ich das gesagt hab. Er wird sonst unerträglich.'),
    ], { choices: Z }),
    knoten('m23-alesa', [
      M_('…', 'trauer'),
      M_('Ja. Ich erkenn ihre Lötstellen. Die macht sie wie Unterschriften. Ich hab einen kaputten Chip aufgeschraubt, und da war sie. Drin. Wie früher, auf meinem Gesellenstück.'),
      M_('Sie hat mir beigebracht, dass man nichts baut, was man nicht reparieren kann. Und jetzt baut sie Zeug, das Leute kaputt macht. Scheiße, ich red schon wieder drüber.', 'wut'),
    ], { choices: Z }),
  ]);

  return phasen(ID, 'mira-23', M, [
    {
      id: 'master', when: MASTER, ohneMenue: true,
      gruss: [
        erz('Mira lässt das Panzerglas runter, bevor du die Theke erreichst. Dann noch ein zweites. Von dem wusstest du nichts.'),
        M_('Ich verkauf dir nicht mal ’ne Schraube, du gekröntes Stück Scheiße. Ich bau nichts in Leute ein, die anderen Leuten Sachen in den Kopf bauen.', 'wut'),
      ],
    },
    {
      id: 'ende-3b', when: ENDE_3B, einmal: true,
      gruss: [
        M_('Du. Hm. Lass mich die Ports sehen.'),
        erz('Sie leuchtet dir mit der Lupenbrille hinters Ohr, lange und gründlich, wie bei einem gebrauchten Arm von Ripper.'),
        M_('Sauber. Gut. Lass das so. Diesmal wirklich.', 'freude'),
      ],
    },
    {
      id: 'ende-nexus', when: ENDE_NEXUS, einmal: true,
      gruss: [
        M_('Dantes Bude ist jetzt „offizielle Implantat-Klinik der Unterstadt“. Mit Stempel. Ich hab ihm meine Ersatz-Lupenbrille geliehen. Er hat sie nicht zurückgegeben. Er hat sie „verbessert“.', 'signatur'),
        M_('Ich schick ihm die schwierigen Fälle. Er schickt mir die langweiligen. Das nennt man Kooperation. Oder Krieg mit Rabatt.'),
      ],
    },
    {
      id: 'ende-meer', when: ENDE_MEER, einmal: true,
      gruss: [
        M_('Ich hatte die halbe Woche Leute auf der Liege, die ihren toten Chip loswerden wollten. Achtzig Credits Ausbau. Ich hab’s für zwanzig gemacht. Sag’s keinem.', 'verlegen'),
        M_('Die Dinger sammle ich. In einem Glas. Eines Tages schmelz ich sie ein und mach eine Hand draus. Eine hässliche. Als Mahnmal.'),
      ],
    },
    {
      id: 'epilog', when: EPILOG_FREI, taeglich: true,
      gruss: [M_('Was brauchst du? Und sag nicht „Chrome 10“. Wer hier noch „Chrome 10“ sagt, kriegt Lötzinn in die Ohren.')],
      plausch: [M_('Ich hab wieder angefangen, Hände zu bauen. Schöne. Nicht billige. Es gibt plötzlich Leute, die dafür sparen. Die Welt ist komisch geworden. Gut komisch.', 'freude')],
    },
    {
      id: 'akt3', when: AKT3_NACHT,
      gruss: [
        erz('Hinter dem Panzerglas brennt noch Licht. Mira hat drei Liegen aufgestellt, Kühlmittel kaltgestellt und das Stadt-TV auf stumm geschaltet. Oben im Bild: Champagner und Chips.'),
        M_('Die chippen heute die halbe Oberstadt. Morgen stehen die bei mir Schlange, damit ich’s rausmache. Ich bin vorbereitet. Ich bin immer vorbereitet.', 'signatur'),
        M_('Verkack’s nicht. Ich hab nur drei Liegen.'),
      ],
    },
    {
      id: 'aria', when: ARIA_GECHIPPT, einmal: true,
      gruss: [
        M_('Die mit dem Schläger. Aria. Die haben ihr was eingesetzt, hör ich. Keine Beta. Das volle Programm.', 'besorgt'),
        M_('Wenn Dante nicht weiterkommt, bring sie her. Ich red nicht drüber, ich mach’s einfach. Und wenn sie danach jemanden schlagen will: Ripper wohnt zwei Gassen weiter.'),
      ],
    },
    {
      id: 'akt2', when: AKT2_NUR, taeglich: true,
      gruss: [M_('Quantum verkauft Chrome 10 zum halben Preis. Ich verkauf Neuteile ohne Hirnwäsche. Rate mal, wer gerade Kundschaft hat.', 'wut')],
      plausch: [M_('Gestern kam einer rein und wollte, dass ich seinen Chip „schneller“ mache. Ich hab ihn mit der Zange rausgejagt. Die Zange war nicht an. Er wusste das nicht.', 'signatur')],
    },
  ]);
}
