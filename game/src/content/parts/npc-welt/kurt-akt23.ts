// Kurt in Akt 2, Akt 3 und im Nachspiel (world.md §5.3–5.5). Akt 2: Chip-Leute sagen „Master“ (er sagt’s seiner Mama),
// Kurt malt die Drohnen, Fliege für die Party. Partynacht, Nachspiel je Ende, freitags und samstags abends mit Knut
// am Strandclub (Bedingung KELLNER aus knut-akt23.ts), Master-Modus.
// Wird von kurt.ts in NpcDef.talk/schedule eingehängt.
import type { ContentPart } from '../../part';
import type { ScheduleEntry, TalkDef } from '../../../modules/contracts';
import { dialog, erz, herz, knoten, ort, rede, sammle, sprecher } from './_welt';
import {
  A2_PARTY, ENDE_3B, ENDE_MEER, ENDE_NEXUS, MASTER, NACHSPIEL, NUR_AKT2, PARTYNACHT, einmal, folge, gesehen, kurz,
} from './akt23-phasen';
import { KELLNER } from './knut-akt23';

const ID = 'kurt';
const KU = sprecher(ID);
const KN = sprecher('knut');
const ALT = 'kurt-tag-standard';
const MALT = { flag: 'kurt_freund' } as const;

const a2 = folge('kurt-a2', [
  erz('Kurt sitzt auf einer Bank am Bahnsteig und malt mit einem Kugelschreiber auf eine Serviette. Eine Drohne. Mit Gesicht. Das Gesicht streckt die Zunge raus.'),
  KU('Hallo! Guck mal. Das ist eine Drohne. Die fliegen jetzt überall. Ich mal ihnen Gesichter. Dann sind sie nicht mehr so gruselig.'),
], KU('Noch was? Ich kann mir drei Sachen merken. Eine ist die Drohne.'), [
  { id: 'master', text: '„Hat dich schon mal einer Master genannt?“', zeilen: [
    KU('Ja! Ein Mann mit Chip! Er hat gesagt: „Das ist eine ausgezeichnete Entscheidung, Master.“ Ich hatte nur ein Brötchen gekauft.'),
    KU('Ich hab’s meiner Mama gesagt. Mama hat gesagt: „Kurt, du bist kein Master. Du bist mein Kurt.“ Das ist besser. Glaub ich.'),
  ] },
  { id: 'malen', text: '„Malst du noch heimlich?“', when: MALT, zeilen: [
    KU('Nicht mehr heimlich! Ich mal jetzt Drohnen auf Servietten und verkauf sie an Mutter Brühe. Sie legt sie unter die Suppe. Die Leute lachen beim Essen.'),
    KU('Knut sagt, das ist Kunst. Knut sagt das nur, wenn er Hunger hat. Er hat immer Hunger.'),
  ], effects: [herz(ID, 10)] },
  { id: 'party', text: '„Wir gehen auf die Releaseparty.“', when: A2_PARTY, zeilen: [
    KU('Ich hab eine Fliege! Ich zieh sie an! Ich komm mit!'),
    KN('(von hinten) Du kommst nicht mit, Kurt.'),
    KU('… Dann zieh ich sie hier an. Und denk an dich. Mit Fliege. Das zählt auch.', 'zaertlich'),
  ] },
], ALT, 'Tschüss, Kurt.');

const partynacht = kurz('kurt-partynacht', [
  erz('Kurt sitzt auf der Bank, die Fliege um den Hals geknotet wie eine Krawatte. Falsch, aber mit Liebe. Er starrt auf Knuts Telefon, auf dem die Releaseparty läuft.'),
  KU('Da ist ganz viel Gold. Und der Mann in Schwarz redet die ganze Zeit. Mama sagt, wer so lange redet, hat was zu verstecken.'),
  KU('Pass auf dich auf. Ich hab dich gemalt. Mit Schläger. Du siehst stark aus. Du musst so bleiben, sonst stimmt das Bild nicht.'),
]);

const nachspiel = dialog('kurt-nachspiel', [
  knoten('start', [
    erz('Kurt trägt ein weißes Hemd, die Fliege richtig gebunden. Fast. Er hält dir eine Serviette hin. Darauf: du, mit Krone aus Konfetti, auf einem Turm, der umkippt.'),
    KU('Für dich! Das bist du! Der Turm fällt um, aber du lachst. Ich hab das Lachen dreimal gemalt. Das erste war gruselig.', 'freude'),
  ], {
    effects: [gesehen('kurt-nachspiel'), herz(ID, 20)],
    choices: [
      { text: '„Danke, Kurt. Ich häng’s auf.“', next: 'danke' },
      { text: '„Gibt es keine Drohnen mehr zum Malen?“', when: ENDE_MEER, next: 'meer' },
      { text: '„Malst du Nexus auch?“', when: ENDE_NEXUS, next: 'nexus' },
      { text: '„Bist du noch sauer auf mich?“', when: ENDE_3B, next: 'dreib' },
    ],
  }),
  knoten('danke', [
    KU('Echt? Das sag ich meiner Mama! Im Guten! Sie hängt meine Bilder auch auf. Am Kühlschrank. Jetzt hängt meins auch bei dir. Dann sind wir fast Familie.', 'freude'),
  ]),
  knoten('meer', [
    KU('Nein! Die sind alle weg! Ich mal jetzt Möwen. Möwen haben schon Gesichter. Böse. Ich mal ihnen ein Lächeln. Das sieht komisch aus. Mama sagt, es sieht aus wie Knut.'),
  ]),
  knoten('nexus', [
    KU('Ja! Sie hat gefragt, ob ich sie male. Ich hab gefragt, wie sie aussieht. Sie hat gesagt, sie weiß es nicht. Ich hab sie dann einfach gemalt. Mit Mütze. Weil es kalt ist im Computer.', 'zaertlich'),
    KU('Sie hat gesagt, das ist das erste Bild von ihr, das keiner verkaufen will. Sie hat sich gefreut. Glaub ich. Die Drohne hat gewackelt.'),
  ]),
  knoten('dreib', [
    KU('Ein bisschen. Ich hab dich in der Woche nicht gemalt. Kein einziges Mal. Das war schwer. Meine Hand wollte immer.', 'trauer'),
    KU('Jetzt mal ich dich wieder. Das ist das Bild. Siehst du? Du lachst.'),
  ], { effects: [herz(ID, 40)] }),
]);

const nachspielTag = folge('kurt-nachspiel-tag', [
  KU('Hallo! Ich zieh dich nicht ab. Ich bin jetzt Kellner. Und Künstler. Das sind zwei Sachen. Ich kann mir drei merken.'),
], KU('Noch was? Die dritte Sache ist frei. Für dich.'), [
  { id: 'strand', text: '„Wie ist es am Strand?“', when: KELLNER, zeilen: [
    KU('Groß! Und nass! Ich trag Getränke, und Knut zählt das Wechselgeld. Laut. Damit alle hören, dass es stimmt. Die Leute klatschen manchmal.'),
    KU('Ich mal die Gäste auf die Untersetzer. Die nehmen sie mit nach Hause. Ich bin berühmt. Bei Leuten, die schon was getrunken haben.'),
  ] },
], ALT, 'Tschüss, Kurt.');

const master = kurz('kurt-master', [
  erz('Kurt sieht dich, macht den Mund auf und wieder zu. Dann dreht er sich zur Wand und stellt sich da hin, wo Knut immer steht. Er guckt so wie Knut. Eine Taube landet auf seinem Kopf.'),
  KU('Ich red nicht mit dir. Mama hat gesagt, du bist jetzt ein Master. Master sind doof.', 'trauer'),
  KU('… Das sag ich meiner Mama. Dass ich dich vermiss. Das sag ich ihr auch.'),
]);

const dialogues = sammle(a2, partynacht, nachspiel, nachspielTag, master);

/** Talk-Einträge vor dem alten Tagesgespräch (nach Rivale und Erstbegegnung). */
export const TALK_23: TalkDef[] = [
  rede('kurt-master', MASTER),
  rede('kurt-nachspiel', einmal('kurt-nachspiel', NACHSPIEL)),
  rede('kurt-nachspiel-tag', NACHSPIEL),
  rede('kurt-partynacht', PARTYNACHT),
  rede('kurt-a2', NUR_AKT2),
];

/** Nachspiel: freitags und samstags abends mit Knut am Strandclub. */
export const SCHEDULE_23: ScheduleEntry[] = [
  ort('A', 'das-meer', 'strand', { days: ['fr', 'sa'], when: KELLNER }),
];

export const part: ContentPart = { dialogues };
