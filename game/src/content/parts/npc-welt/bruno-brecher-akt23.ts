// Bruno Brecher in Akt 2, Akt 3 und im Nachspiel (world.md §5.3–5.5). Akt 2: Razzia vor dem High Voltage, Gechippte
// in der Schlange („Kein Stil“), Stilberatung für die Releaseparty (einmaliger Ausstrahlung-Bonus). Partynacht vor der
// leeren Tür, Nachspiel je Ende, Master-Modus. Wird von bruno-brecher.ts in NpcDef.talk eingehängt.
import type { ContentPart } from '../../part';
import type { TalkDef } from '../../../modules/contracts';
import { dialog, erz, herz, ich, knoten, rede, sammle, sprecher } from './_welt';
import {
  A2_CHAOS, A2_PARTY, BLADE_GEFASST, CLUB_OFFEN, ENDE_3B, ENDE_MEER, ENDE_NEXUS, MASTER, NACHSPIEL, NUR_AKT2, PARTYNACHT,
  einmal, folge, gesehen, kurz,
} from './akt23-phasen';

const ID = 'bruno-brecher';
const B = sprecher(ID);
const ALT = 'bruno-tag-standard';

const a2Bruch = dialog('bruno-a2-bruch', [
  knoten('start', [
    erz('Vor dem High Voltage liegen Glasscherben und ein umgekipptes Absperrgitter mit Quantum-Logo. Bruno steht davor, als hätte er es persönlich umgekippt. Hat er.'),
    B('Razzia. Gestern Nacht. Zwölf Glanzjacken, drei Drohnen, ein Hund aus Metall. Wollten rein. Ohne Stil.'),
    B('Ich hab gesagt: „Nur Gäste mit Stil.“ Der Chef hat gesagt: „Ich bin die Ordnung.“ Ich hab gesagt: „Ordnung ist kein Stil.“ Dann hab ich das Gitter umgedreht.'),
  ], {
    effects: [gesehen('bruno-a2-bruch'), herz(ID, 15)],
    choices: [
      { text: '„Und dann?“', next: 'dann' },
      { text: '„Bruno, du bist ein Held.“', next: 'held' },
    ],
  }),
  knoten('dann', [
    B('Dann kam Hunter raus. Hat gegrinst. Hat gesagt: „Bruno, die Herren wollen nur gucken.“ Die Herren haben geguckt. Auf Hunter. Auf mich. Auf den Metallhund. Der Metallhund hat sich hingesetzt.'),
    B('Dann sind sie gegangen. Der Hund wollte nicht. Ich hab ihm einen Keks gegeben. Er hat ihn nicht gegessen. Er hat ihn gescannt. Kein Stil.'),
  ]),
  knoten('held', [B('Nein. Ich bin ein Türsteher. Helden machen Lärm. Ich mach zu.', 'signatur')]),
]);

const a2 = folge('bruno-a2', [
  erz('Vor der Samtkordel steht eine Schlange. Drei Leute darin lächeln ganz gleich, mit einem Glitzern hinterm Ohr. Bruno lässt sie stehen. Seit einer Stunde.'),
  B('Abend. Die drei da? Gechippt. „Das ist eine ausgezeichnete Entscheidung, Master“, haben sie zu mir gesagt. Ich bin kein Master. Ich bin Bruno. Kein Stil. Bleiben draußen.'),
], B('Noch was? Die Schlange hasst dich. Die drei Gechippten nicht. Die hassen gar nichts mehr. Das ist schlimmer.'), [
  { id: 'chip', text: '„Woran erkennst du die Gechippten?“', zeilen: [
    B('Die stellen sich ordentlich an. Keiner drängelt. Keiner flucht. Keiner versucht, mich zu bestechen. Das ist nicht normal. Das ist unheimlich.'),
    B('Normale Leute nennen mich Schrank, Arschgesicht oder Großer. Die nennen mich Master. Ich hätte lieber Arschgesicht.'),
  ] },
  { id: 'drohnen', text: '„Kommen die Glanzjacken wieder?“', when: A2_CHAOS, zeilen: [
    B('Jede Nacht fliegt eine Drohne vorbei und filmt die Tür. Ich hab gelernt, in die Kamera zu gucken, ohne zu blinzeln. Die Drohne blinzelt zuerst. Sie hat ein kleines Licht. Das flackert.'),
  ] },
  { id: 'stil', text: '„Wir gehen auf die Releaseparty. Wie sehe ich aus?“', when: A2_PARTY, once: true, zeilen: [
    erz('Bruno tritt einen Schritt zurück. Dann noch einen. Er mustert dich so lange, dass hinter dir zwei Leute aufgeben und nach Hause gehen.'),
    B('Schultern zurück. Kinn runter. Nicht lächeln. Die da oben lächeln alle. Wer nicht lächelt, ist entweder wichtig oder gefährlich. Beides lässt man rein.'),
    B('Und die Hände. Nicht in die Taschen. Hände in Taschen heißt: Ich hab was zu verstecken. Hast du. Darum: raus damit.'),
  ], effects: [herz(ID, 15), { checkBuff: { id: 'buff-bruno-haltung', label: 'Brunos Türsteherhaltung', value: 1, attribute: 'ausstrahlung', consumes: true } }] },
  { id: 'hunter', text: '„Wie geht’s Hunter?“', zeilen: [
    B('Er redet von der Ödnis. Aussiedeln. Ziegen. Ich hab ihm gesagt: Ziegen haben keinen Stil. Er hat gelacht. Zum ersten Mal seit dem Einbruch.'),
  ] },
], ALT, 'Schönen Abend noch.');

const partynacht = kurz('bruno-partynacht', [
  erz('Das High Voltage ist leer. Bruno steht trotzdem vor der Tür, in Samtjacke, und schaut auf ein kleines Telefon. Auf dem Display: die Releaseparty. Er hält es weit weg, wie einen fremden Hund.'),
  B('Ich steh hier, falls einer reinwill. Keiner will rein. Alle gucken Fernsehen. Ich auch. Sag’s keinem.'),
  B('Die Gäste da oben haben keinen Stil. Gold, Gold, Glitzer, Gold. Das ist kein Stil. Das ist ein Kontoauszug.'),
]);

const nachspiel = dialog('bruno-nachspiel', [
  knoten('start', [
    erz('Bruno steht vor dem High Voltage. Die Kordel hängt lose. Die Tür steht offen. Aus dem Laden dröhnt Lumos Bass.'),
    B('Du. Rein mit dir. Ohne Schlange. Ohne Kordel. Für dich ist die Kordel abgeschafft.'),
    B('Nur für dich. Die anderen stehen an. Ordnung muss sein. Stil auch.'),
  ], {
    effects: [gesehen('bruno-nachspiel'), herz(ID, 20)],
    choices: [
      { text: '„Hast du Blade gesehen? In Handschellen?“', when: BLADE_GEFASST, next: 'blade' },
      { text: '„Nexus ist jetzt eine Helfer-KI. Lässt du die rein?“', when: ENDE_NEXUS, next: 'nexus' },
      { text: '„Ihr wart am Meer, hab ich gehört. Du auch?“', when: ENDE_MEER, next: 'meer' },
      { text: '„Ich war eine Weile nicht willkommen. Ich weiß.“', when: ENDE_3B, next: 'dreib' },
    ],
  }),
  knoten('blade', [
    B('Im Fernsehen. Er hat den Mantelkragen hochgeschlagen, als sie ihn abgeführt haben. Das war das erste Mal, dass er Stil hatte. Zu spät.', 'signatur'),
  ]),
  knoten('nexus', [
    B('Eine Drohne war hier. Hat gefragt: „Darf ich hereinkommen?“ Ich hab gesagt: „Nur Gäste mit Stil.“ Sie hat gefragt, was Stil ist.', 'ueberrascht'),
    B('Ich hab ihr eine Stunde lang Stil erklärt. Sie hat zugehört. Sie hat Notizen gemacht. Dann hat sie gesagt: „Ich glaube, ich habe noch keinen.“ Ehrlich. Das ist der Anfang von Stil. Ich hab sie reingelassen.'),
  ]),
  knoten('meer', [
    B('Ich war nicht am Meer. Das Meer hat Sand. Sand kommt in die Schuhe. Schuhe sind Stil.'),
    B('… Hunter hat mir ein Foto geschickt. Mit Sonnenuntergang. Ich hab es mir hinter die Tür gehängt. Sag’s keinem.', 'verlegen'),
  ]),
  knoten('dreib', [
    B('Nein. Warst du nicht. Ich hab dein Foto an die Tür gehängt. Mit einem Kreuz drüber.', 'wut'),
    B('Das Kreuz ist ab. Gestern. Ich hab es selbst abgekratzt. Mit dem Daumennagel. Rein mit dir.'),
  ], { effects: [herz(ID, 40)] }),
]);

const nachspielTag = folge('bruno-nachspiel-tag', [
  B('Abend. Stil sitzt heute. Ganz.'),
  B('Rein mit dir. Mixi hat einen neuen Cocktail. Er heißt „Kordel“. Er ist rot und schmeckt nach Verbot.'),
], B('Noch was? Die Schlange liebt dich jetzt. Das ist fast schlimmer.'), [
  { id: 'strand', text: '„Kommst du mal mit an den Strandclub?“', when: CLUB_OFFEN, zeilen: [
    B('Ich war einmal da. Ich hab die Schuhe ausgezogen. Barfuß. Im Sand. Vor allen Leuten.'),
    B('Das war mein erster Fehler seit Jahren. Er hat sich gut angefühlt. Ich komm wieder. Mit Schuhen. Zum Ausziehen.', 'verlegen'),
  ] },
  { id: 'ratte', text: '„Noch Ärger mit Ratten?“', when: { seen: 'he-bruno-brecher-4' }, zeilen: [
    B('Bertram kommt jeden Freitag. Bürgermeister Gully hat ihm eine Fliege umgebunden. Jetzt hat er Stil. Ich muss ihn reinlassen. Das ist die Regel.', 'verlegen'),
    B('Er sitzt an der Bar und trinkt Kondensmilch. Ich stehe auf dem Mülleimer. Wir haben uns arrangiert.'),
  ] },
], ALT, 'Schönen Abend noch.');

const master = dialog('bruno-master', [
  knoten('start', [
    erz('Die Samtkordel ist zu. Doppelt. Bruno steht davor, die Arme verschränkt, und sieht durch dich hindurch auf eine Stelle hinter deinem Kopf.'),
    B('Nein.'),
    B('Nur Gäste mit Stil. Stil heißt: Man tritt nicht auf Leute, die einen getragen haben. Du hast keinen mehr.'),
  ], {
    choices: [
      { text: '„Bruno. Ich bin’s.“', next: 'ich' },
      { text: '(Gehen.)' },
    ],
  }),
  knoten('ich', [
    ich('Bruno. Ich bin’s.'),
    B('Ich weiß, wer du bist. Darum steh ich hier. Hunter hat gesagt, wenn du kommst, soll ich dich nicht schlagen. Ich halte mich dran. Knapp.', 'wut'),
  ]),
]);

const dialogues = sammle(a2Bruch, a2, partynacht, nachspiel, nachspielTag, master);

/** Talk-Einträge vor dem alten Tagesgespräch (nach Rivale und Erstbegegnung). */
export const TALK_23: TalkDef[] = [
  rede('bruno-master', MASTER),
  rede('bruno-nachspiel', einmal('bruno-nachspiel', NACHSPIEL)),
  rede('bruno-nachspiel-tag', NACHSPIEL),
  rede('bruno-partynacht', PARTYNACHT),
  rede('bruno-a2-bruch', einmal('bruno-a2-bruch', NUR_AKT2)),
  rede('bruno-a2', NUR_AKT2),
];

export const part: ContentPart = { dialogues };
