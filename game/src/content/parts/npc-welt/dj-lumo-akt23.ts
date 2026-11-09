// DJ Lumo in Akt 2, Akt 3 und im Nachspiel (world.md §5.3–5.5). Akt 2: Er sampelt die Chip-Sprüche zum „Master-Mix“,
// Party-Vorbereitung, Partynacht (Kabelbrand, solange Aria weg ist), Nachspiel je Ende, samstagnachts am Strandclub
// (side-strandclub erledigt), Master-Modus. Wird von dj-lumo.ts in NpcDef.talk/schedule eingehängt.
import type { ContentPart } from '../../part';
import type { ScheduleEntry, TalkDef } from '../../../modules/contracts';
import { dialog, erz, herz, knoten, ort, rede, sammle, sprecher } from './_welt';
import {
  A2_PARTY, ARIA_GECHIPPT, CLUB_OFFEN, ENDE_3B, ENDE_MEER, ENDE_NEXUS, MASTER, NACHSPIEL, NUR_AKT2, PARTYNACHT, einmal, folge,
  gesehen, kurz,
} from './akt23-phasen';

const ID = 'dj-lumo';
const L = sprecher(ID);
const ALT = 'lumo-tag-standard';
const AM_STRAND = { all: [NACHSPIEL, CLUB_OFFEN] };

const a2 = folge('lumo-a2', [
  erz('Aus Lumos Mülltonnen-Lautsprecher wummert ein Beat. Darüber, zerhackt und verzerrt, eine glatte Stimme: „Das ist eine – aus-ge-zeich-ne-te – Ent-schei-dung – MASTER.“ Die Gasse grölt mit: „MASTER?!“'),
  L('Yo! Der Master-Mix. Hab die Chip-Leute am Bahnhof aufgenommen. Wenn die schon reden wie Werbung, dann tanzen wir wenigstens drauf. Das ist Widerstand mit Bass.'),
], L('Noch was? Zwanzig Sekunden bis zum Drop.'), [
  { id: 'chip', text: '„Ist das nicht ein bisschen fies?“', zeilen: [
    L('Fies? Die sollen das hören. Wenn einer von denen das im Club hört und lacht, dann ist da drin noch wer. Letzte Woche hat einer gelacht. Dann hat er geheult. Dann hat er „Scheiße“ gesagt. Bester Abend des Jahres.'),
  ] },
  { id: 'hv', text: '„Wie läuft’s im Club seit dem Bruch?“', zeilen: [
    L('Voller als je. Die Leute haben Angst. Wer Angst hat, tanzt. Wer tanzt, hat keine Angst. Das ist Physik.'),
    L('Nur Hunter steht hinter der Bar und guckt ins Leere. Ich spiel dann was Altes. Er klopft mit. Ganz leise. Mit einem Finger.'),
  ] },
  { id: 'aria', text: '„Spielst du jetzt Kabelbrand?“', when: ARIA_GECHIPPT, zeilen: [
    L('Nein. Nicht, solange sie weg ist. Ich spiel’s erst wieder, wenn sie mir ihren Schläger an den Kopf wirft, weil ich’s spiele. Das ist der Deal. Sie weiß nichts davon.', 'trauer'),
  ] },
  { id: 'party', text: '„Wir gehen auf die Releaseparty.“', when: A2_PARTY, zeilen: [
    L('Da legt so ein Oberstadt-Typ auf. DJ Platin. Spielt nur Remixe von Firmenjingles. Ich hab ihn mal gehört. Ich musste mich hinlegen.'),
    L('Wenn ihr da oben was kaputt macht: Fangt beim Mischpult an. Tut der Welt einen Gefallen.', 'signatur'),
  ] },
], ALT, 'Bleib laut.');

const partynacht = kurz('lumo-partynacht', [
  erz('Das High Voltage ist halb leer, die andere Hälfte steht vor dem Bildschirm über der Bar. Lumo legt trotzdem auf. Gerade läuft etwas mit verzerrten Gitarren.'),
  L('Kabelbrand. Ja. Heute ausnahmsweise. Für die da oben. Wenn das hier eine Nacht für Lieder mit Sprung ist, dann ist es diese.', 'besorgt'),
  L('Und wenn ihr wieder runterkommt, spiel ich die ganze Nacht. Und ihr tanzt. Auch Hunter. Auch Bruno. Das ist ein Befehl. Vom Pult.'),
]);

const nachspiel = dialog('lumo-nachspiel', [
  knoten('start', [
    erz('Lumo sitzt auf einer Lautsprecherbox vor dem High Voltage, die Kopfhörer zum ersten Mal ganz auf. Als er dich sieht, reißt er sie runter.'),
    L('DA! Da ist der Mensch, der die beste Party des Jahres gecrasht hat! Und ich war nicht mal da! Ich hab ein Set für dich gebaut. Es heißt „Absturz“. Es ist acht Minuten lang. Es hat keinen Drop. Es IST der Drop.', 'freude'),
  ], {
    effects: [gesehen('lumo-nachspiel'), herz(ID, 20)],
    choices: [
      { text: '„Spielst du jetzt am Meer?“', when: ENDE_MEER, next: 'meer' },
      { text: '„Nexus ist jetzt eine Helfer-KI. Hört sie Musik?“', when: ENDE_NEXUS, next: 'nexus' },
      { text: '„Ich war eine Weile nicht so beliebt hier.“', when: ENDE_3B, next: 'dreib' },
      { text: '„Spiel’s ab.“', next: 'abspielen' },
    ],
  }),
  knoten('meer', [
    L('Am Meer? Mann. Das Meer hat den besten Bass der Welt. Die Wellen machen Kick, Kick, Zisch. Ich hab drei Stunden davor gesessen und nichts aufgelegt. Nur zugehört. Ich hab geheult. Sag’s keinem.', 'verlegen'),
  ], { next: 'abspielen' }),
  knoten('nexus', [
    L('Sie wünscht sich Sachen. Per Drohne, mit Zettel: „Könnten Sie bitte Kabelbrand spielen?“ Ich hab Nein gesagt. Sie hat „Verstanden“ geschrieben. Und am nächsten Tag: „Darf ich fragen, warum nicht?“', 'ueberrascht'),
    L('Ich hab ihr erklärt, dass manche Lieder einem Menschen gehören. Sie hat sich entschuldigt. Jetzt wünscht sie sich Möwengeräusche. Ich mach ihr einen Remix.'),
  ], { next: 'abspielen' }),
  knoten('dreib', [
    L('Nicht so beliebt? Ich hab dein Lied aus der Rotation genommen. Dein Lied! Das, auf das du immer so peinlich tanzt.', 'wut'),
    L('Es ist wieder drin. Seit gestern. Mit extra Bass. Du darfst so peinlich tanzen wie du willst.'),
  ], { next: 'abspielen', effects: [herz(ID, 40)] }),
  knoten('abspielen', [
    erz('Lumo drückt einen Knopf. Aus dem Lautsprecher kommt Rauschen. Dann Glas. Dann eine Stimme, die „Champagner ist alle“ sagt. Dann ein Bass, der die ganze Gasse hochhebt.'),
    L('Gefällt’s dir? Sag ja. Du sagst ja. Ich seh’s dir an.'),
  ]),
]);

const nachspielTag = folge('lumo-nachspiel-tag', [
  L('Yo. Was geht. Was läuft. Was tanzt. Alles. Endlich.'),
], L('Noch was? Ich hab vierzig Sekunden. Und dann noch vierzig. Ich hab jetzt alle Zeit der Welt.'), [
  { id: 'strand', text: '„Legst du am Strandclub auf?“', when: CLUB_OFFEN, zeilen: [
    L('Samstags. Nachts. An der Bar. Lio hat die Bühne, ich hab die Bar. Wir haben ausgemacht, dass wir uns nicht ins Gehege kommen. Wir kommen uns jede Woche ins Gehege. Es klingt fantastisch.'),
  ] },
  { id: 'kabelbrand', text: '„Spielst du wieder Kabelbrand?“', zeilen: [
    L('Einmal pro Nacht. Wenn Aria da ist, dreht sie sich um und guckt mich an. Ich hör auf. Sie sagt: „Weiter.“ Ich spiel weiter. Das ist neu.', 'zaertlich'),
  ] },
], ALT, 'Bleib laut.');

const master = kurz('lumo-master', [
  erz('Lumo sieht dich kommen und dreht einen Regler. Aus dem Lautsprecher dudelt Fahrstuhlmusik. Mit Werbung dazwischen. „Chrome 10. Für Master.“'),
  L('Für dich. Exklusiv. Läuft auf Dauerschleife, solange du hier stehst.', 'wut'),
  L('Wenn du je wieder tanzen willst wie ein Mensch, sag Bescheid. Bis dahin: Fahrstuhl. Abwärts.'),
]);

const dialogues = sammle(a2, partynacht, nachspiel, nachspielTag, master);

/** Talk-Einträge vor dem alten Tagesgespräch (nach Rivale und Erstbegegnung). */
export const TALK_23: TalkDef[] = [
  rede('lumo-master', MASTER),
  rede('lumo-nachspiel', einmal('lumo-nachspiel', NACHSPIEL)),
  rede('lumo-nachspiel-tag', NACHSPIEL),
  rede('lumo-partynacht', PARTYNACHT),
  rede('lumo-a2', NUR_AKT2),
];

/** Nachspiel: samstagnachts an der Strandclub-Bar (vor dem alten Tagesablauf). */
export const SCHEDULE_23: ScheduleEntry[] = [
  ort('N', 'das-meer', 'strandclub-bar', { days: ['sa'], when: AM_STRAND }),
];

export const part: ContentPart = { dialogues };
