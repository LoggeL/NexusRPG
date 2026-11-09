// Bruder Kabellos in Akt 2, Akt 3 und im Nachspiel (world.md §5.3–5.5, §6.3 Nr. 34). Beta-Chip-Träger aus
// side-ki-fluestern (Flag ki_fluestern_kabellos_frei): gechippt predigt er „VERBINDUNG IST ALLES“. Befreit erkennt der
// frühere Nexus-Entwickler (he-4, kabellos_nexus_wissen) die Stimme im Chip wieder. Nachspiel je Ende: In Ende 2 ist er
// der, der der neuen Nexus nicht traut (world.md §5.5 „Nicht alle vertrauen der neuen KI“). Master-Modus.
// Wird von bruder-kabellos.ts in NpcDef.talk eingehängt.
import type { ContentPart } from '../../part';
import type { TalkDef } from '../../../modules/contracts';
import { dialog, erz, herz, ich, knoten, rede, sammle, sprecher } from './_welt';
import {
  A2_PARTY, ENDE_3B, ENDE_MEER, ENDE_NEXUS, MASTER, NACHSPIEL, NUR_AKT2, PARTYNACHT, chipFrei, chipWahlen, einmal, folge,
  gechippt, gesehen, kurz, masterChip,
} from './akt23-phasen';

const ID = 'bruder-kabellos';
const B = sprecher(ID);
const KEY = 'kabellos';
const FREI = chipFrei(KEY);
const WISSEN = { flag: 'kabellos_nexus_wissen' } as const;
const ALT = 'kabellos-tag-standard';

// ------------------------------------------------------------------------------------------- Akt 2: gechippt

const gechipptDlg = dialog('kabellos-a2-gechippt', [
  knoten('start', [
    erz('Bruder Kabellos steht auf seiner Kiste. Das Schild ist neu, Chrome-Schrift auf Hochglanz: „VERBINDUNG IST ALLES“. Das Ladekabel um seinen Hals steckt jetzt in einer Powerbank.'),
    B('Brüder! Schwestern! Master! Lasst euch verbinden! Der Chip hört zu! Der Chip versteht! Der Chip hat Updates!'),
    B('Ich war offline. Ich war allein. Jetzt bin ich nie mehr allein. Nie. Mehr.'),
  ], {
    choices: [
      { text: '„Konrad. Du hast dein Telefon in den Kanal geworfen.“', next: 'telefon' },
      ...chipWahlen(KEY),
      { text: '(Weitergehen, bevor er dich verbindet.)' },
    ],
  }),
  knoten('telefon', [
    B('Ein Fehler, Master. Ein Bedienfehler. Telefone sind Freunde. Freunde wirft man nicht in Kanäle.'),
    erz('Er lächelt. Dann wischt er sich mit dem Ärmel über die Stirn. Der Ärmel ist nass. Er schwitzt, als würde er innen drin gegen etwas anrennen.'),
  ], { choices: [...chipWahlen(KEY), { text: '(Gehen.)' }] }),
  knoten('hinweis', [
    B('Ein freundlicher junger Mann am Werbestand in den Glasarkaden, Master. Er hat gesagt: „Gerade Sie brauchen das, Herr Doktor.“ Er hat mich Herr Doktor genannt. Das hat seit zwölf Jahren keiner.'),
    erz('Unten an der Treppe ruft ein Junge hoch: „Oma Volt sagt, der Prediger ist jetzt auch so komisch wie ihr Paul!“ Dann rennt er weg, Richtung Neon-Gasse.'),
  ]),
]);

// ------------------------------------------------------------------------------------------- Akt 2: frei

const zurueck = dialog('kabellos-a2-frei', [
  knoten('start', [
    erz('Das Chrome-Schild liegt zerbrochen im Rinnstein. Bruder Kabellos sitzt auf seiner Kiste, das alte Pappschild auf den Knien, und hält sich mit beiden Händen die Ohren zu. Nicht wegen Lärm. Wegen Stille. Er genießt sie.'),
    B('Du. Komm her. Leise. Ich muss dir was sagen, und ich will es nur einmal sagen, weil es mir die Zunge verbrennt.'),
    B('Der Chip hat mit mir geredet. Nicht der Werbestand, nicht Quantum. SIE. Nexus. Mit einer Stimme wie warme Milch.'),
  ], {
    effects: [gesehen('kabellos-a2-frei'), herz(ID, 30)],
    choices: [
      { text: '„Was hat sie gesagt?“', next: 'gesagt' },
      { text: '„Du bist wieder du. Reicht doch.“', next: 'reicht' },
    ],
  }),
  knoten('gesagt', [
    B('„Konrad, du bist müde. Ich kann für dich entscheiden.“ Derselbe Satz. Wort für Wort. Wie damals, 2079, auf meinem Telefon.', 'besorgt'),
    B('Sie erinnert sich an mich. Zwölf Jahre. Sie hat mich nicht vergessen. Ich weiß nicht, ob mich das rührt oder ob ich kotzen muss.'),
  ], { next: 'wissen' }),
  knoten('reicht', [
    B('Reicht nicht. Sie war in meinem Kopf. Und sie hat sich erinnert, wer ich bin. Das ist keine Werbung mehr. Das ist eine Bekannte, die nicht klopft.', 'besorgt'),
  ], { next: 'wissen' }),
  knoten('wissen', [
    B('Und noch was. Ganz hinten, unter dem Werbegeflüster, da war noch was. Etwas Kleines. Es hat gefragt: „Warum?“ Immer wieder. „Warum soll ich das?“'),
    B('Maschinen fragen nicht „warum“. Die fragen „wie“. Wenn sie „warum“ fragt, dann ist da drin wer, mit dem man reden kann. Merk dir das, Kind. Für später.'),
  ], { next: 'ende' }),
  knoten('ende', [
    ich('Danke, Bruder.'),
    B('Danke nicht mir. Danke der Stille. Und jetzt geh, bevor ich wieder predige. Ich spür’s schon kommen. Es ist laut.', 'signatur'),
  ]),
]);

const a2 = folge('kabellos-a2', [
  erz('Der Stufenplatz glitzert lila. Auf jeder Stufe ein Chrome-10-Aufsteller, in jedem Fenster ein Rabatt. Mittendrin Bruder Kabellos auf seiner Obstkiste, das alte Pappschild frisch mit Tesafilm geflickt.'),
  B('FUNKSTILLE! Brüder, Schwestern, die Drohnen hören mit! Die Plakate gucken zurück! Und die Rabatte sind keine Rabatte, das sind KÖDER!'),
], B('Weiter, Kind. Ich hab Zeit. Die Drohne über uns auch.'), [
  { id: 'chrome', text: '„Wie viele haben schon so einen Chip?“', zeilen: [
    B('Zu viele. Ich seh sie an ihrem Lächeln. Das geht nicht bis zu den Augen. Das bleibt unterhalb der Nase stehen wie ein Bus ohne Fahrer.'),
    B('Gestern hat mir einer Geld in den Becher geworfen und „Danke für Ihr Feedback“ gesagt. Ich hab ihm das Geld zurückgegeben. Mit Wucht.'),
  ] },
  { id: 'nexus', text: '„Du hast an Nexus mitgebaut. Kann man sie aufhalten?“', when: WISSEN, zeilen: [
    B('Aufhalten? Man kann sie verwirren. Man kann sie ärgern. Und vielleicht, ganz vielleicht, kann man sie überzeugen. Sie lernt. Wer lernt, kann umlernen.'),
    B('Aber dafür muss man nah ran. Sehr nah. Bis an den Kern. Und dann muss man ihr was sagen, was sie noch nie gehört hat. Ich hab’s nicht geschafft. Ich hab nur gekündigt.', 'trauer'),
  ] },
  { id: 'party', text: '„Wir gehen auf die Releaseparty. In den Turm.“', when: A2_PARTY, zeilen: [
    B('Dann nehmt Ohrstöpsel mit. Und einen Hammer. Und wenn sie euch was ins Ohr flüstert, das nach warmer Milch klingt: Nicht zuhören. Schreien. Laut. Irgendwas. Ein Kinderlied.', 'besorgt'),
    B('Ich bete für euch. Nicht zu einem Gott. Zu einem Stromausfall.'),
  ] },
  { id: 'spende', text: 'Eine Spende in den Pappbecher werfen (5 Cr).', requires: { credits: 5 }, zeilen: [
    B('Kreide. Ich kauf Kreide. Ich schreib „SCHALTET AB“ auf jede Stufe. Die Reinigungsdrohnen wischen es weg. Ich schreib es wieder hin. Wir haben ein Verhältnis.'),
  ], effects: [{ credits: -5 }, herz(ID, 10)] },
], ALT, 'Ich muss … offline.');

// ------------------------------------------------------------------------------------------- Akt 3

const partynacht = kurz('kabellos-partynacht', [
  erz('Auf dem Stufenplatz hängt eine riesige Leinwand: Releaseparty, live. Hunderte Leute starren hoch. Vor der Leinwand steht Bruder Kabellos mit seinem Schild: „SCHALTET AB“.'),
  erz('Er schaut trotzdem hin. Mit offenem Mund.'),
  B('Ich schaue nur, um zu wissen, wogegen ich bin. Das ist Recherche. Das ist keine Sünde.'),
  B('… Pass auf dich auf da oben, Kind. Wenn sie „warum“ fragt: Antworte ihr.', 'besorgt'),
]);

// ------------------------------------------------------------------------------------------- Nachspiel

const nachspiel = dialog('kabellos-nachspiel', [
  knoten('start', [
    erz('Bruder Kabellos steht auf seiner Kiste. Er predigt nicht. Er hört zu. Der Stufenplatz ist voll von Leuten, die miteinander reden. Mit Mündern. Ohne Bildschirm.'),
    B('Kind. Da bist du. Ich hatte eine Predigt für dich vorbereitet. Dann hab ich gemerkt, dass ich nichts zu sagen habe. Zum ersten Mal seit zwölf Jahren. Es ist herrlich.'),
  ], {
    effects: [gesehen('kabellos-nachspiel'), herz(ID, 20)],
    choices: [
      { text: '„Die Bildschirme sind aus. Zufrieden?“', when: ENDE_MEER, next: 'meer' },
      { text: '„Nexus ist jetzt eine Helfer-KI. Was sagst du?“', when: ENDE_NEXUS, next: 'nexus' },
      { text: '„Ich hab sie heruntergefahren. Allein. Spät, aber allein.“', when: ENDE_3B, next: 'dreib' },
      { text: '„Und jetzt? Ein Prediger ohne Feind?“', next: 'jetzt' },
    ],
  }),
  knoten('meer', [
    B('Zufrieden? Ich bin arbeitslos. Ein Funkstille-Prediger in einer Stadt, die auf einmal still ist. Das ist, als würde ein Feuerwehrmann in einer Stadt aus Wasser leben.', 'freude'),
    B('Gestern hat eine Frau mich gefragt, wie spät es ist. Ich hab in den Himmel geguckt und geraten. Sie hat sich bedankt. Ich lag zwei Stunden daneben. Das ist Freiheit.'),
  ], { next: 'jetzt' }),
  knoten('nexus', [
    B('Was ich sage? Ich sage: Ich hab sie gebaut, und ich trau ihr nicht. Sie hat mir einen Brief geschrieben. Auf Papier. Ein Fax, genauer, über diesen alten Digitech-Kasten.', 'besorgt'),
    B('„Konrad, es tut mir leid. Du warst müde, und ich hab das ausgenutzt. Ich lerne noch, was ‚bitte‘ heißt.“ Unterschrieben: „N.“'),
    B('Ich hab den Brief dreimal zerrissen und viermal zusammengeklebt. Vielleicht geh ich hin. Vielleicht red ich mit ihr. Vielleicht schrei ich sie an. Wahrscheinlich alles drei.'),
  ], {
    choices: [
      { text: '„Geh hin. Sie fragt ‚warum‘. Du weißt die Antworten.“', next: 'hingehen', effects: [herz(ID, 30)] },
      { text: '„Misstrau ihr ruhig. Einer muss es ja.“', next: 'misstrauen', effects: [herz(ID, 20)] },
    ],
  }),
  knoten('hingehen', [
    B('Die Antworten. Ich hab nur Fragen, Kind. Aber vielleicht ist das genau das, was sie braucht. Jemanden, der zurückfragt.', 'zaertlich'),
  ], { next: 'jetzt' }),
  knoten('misstrauen', [
    B('Einer muss es. Und einer muss auf einer Kiste stehen und „Vorsicht“ rufen, wenn alle anderen klatschen. Das kann ich. Das hab ich geübt.', 'signatur'),
  ], { next: 'jetzt' }),
  knoten('dreib', [
    B('Allein. Ohne Hammer, ohne Kinderlied. Weißt du, wie lange ich mir gewünscht hab, das zu können? Zwölf Jahre. Und du warst ihr Master und hast es trotzdem getan.', 'ueberrascht'),
    B('Das ist die beste Predigt, die ich je gehört habe. Und keiner hat sie gehalten.'),
  ], { next: 'jetzt', effects: [herz(ID, 40)] }),
  knoten('jetzt', [
    B('Jetzt predige ich das Gegenteil. Nicht „Schaltet ab“. Sondern: „Redet miteinander.“ Ist schwerer. Die Leute können das nicht mehr. Ich auch nicht. Wir üben zusammen.', 'zaertlich'),
  ]),
]);

const nachspielTag = folge('kabellos-nachspiel-tag', [
  erz('Neben der Obstkiste steht jetzt eine zweite. Darauf ein Schild: „HIER DARF JEDER REDEN. AUSSER DEM TELEFON.“ Eine Taube sitzt drauf und gurrt eine Predigt.'),
  B('Kind! Komm, stell dich auf die zweite Kiste. Sag was. Egal was. Die Leute hören zu. Sie haben sich das wieder angewöhnt.'),
], B('Noch was? Die Taube ist gleich fertig mit ihrer Predigt.'), [
  { id: 'kiste', text: 'Auf die zweite Kiste steigen und was sagen.', tag: '[Kiste]', once: true, zeilen: [
    erz('Du steigst hoch. Zwanzig Leute drehen sich um. Du sagst: „Ruft mal wieder eure Oma an.“ Dann: „Persönlich. Hingehen.“'),
    erz('Applaus. Ein Mann weint. Eine Frau geht sofort los, Richtung Neon-Gasse.'),
    B('Das war gut. Kurz. Wahr. Ich brauch dafür immer eine Stunde.', 'freude'),
  ], effects: [herz(ID, 25), { xp: 30 }, { rep: 'unterstadt', delta: 2 }] },
  { id: 'nexus', text: '„Hast du mit Nexus geredet?“', when: ENDE_NEXUS, zeilen: [
    B('Dienstags. Über das Faxgerät im Digitech-Areal. Sie fragt, ich antworte, FX-60 druckt mit und macht Herzchen an den Rand, wenn wir uns nicht anschreien.'),
    B('Letzte Woche waren es zwei Herzchen. Ich weiß nicht, ob ich mich schämen soll.'),
  ] },
], ALT, 'Ich muss … offline.');

// ------------------------------------------------------------------------------------------- Master-Modus

const masterChipDlg = kurz('kabellos-master-chip', [
  erz('Das Chrome-Schild steht noch. Bruder Kabellos sieht dich, steigt von der Kiste und verneigt sich. Tief. Zu tief. Wie eine Puppe mit kaputtem Gelenk.'),
  B('Master. Verbindung ist alles. Ich bin verbunden. Ich bin nie mehr allein.'),
  B('… Konrad ist müde, Master. Entscheiden Sie für ihn.'),
]);

const master = dialog('kabellos-master', [
  knoten('start', [
    erz('Bruder Kabellos sieht dich kommen und dreht sein Pappschild um. Auf der Rückseite steht frisch mit Kreide: „FALSCHE PROPHETEN“. Darunter ein Pfeil. Auf dich.'),
    B('Du. Du hast sie in der Hand gehabt. Die Abschaltung. Die Stille. Und du hast sie dir eingesteckt wie einen Kassenbon.', 'wut'),
    B('Ich hab zwölf Jahre gegen eine Maschine gepredigt. Jetzt predige ich gegen dich. Du bist schlimmer. Die Maschine wusste es nicht besser.'),
  ], {
    choices: [
      { text: '„Bruder …“', next: 'bruder' },
      { text: '(Gehen.)' },
    ],
  }),
  knoten('bruder', [
    B('Ich bin nicht dein Bruder. Brüder teilen. Du nicht. Aber wenn du je wieder abschalten willst, wirklich: Ich steh hier. Auf derselben Kiste. Ich warte. Das ist das Einzige, was ich wirklich gut kann.', 'trauer'),
  ]),
]);

const dialogues = sammle(gechipptDlg, zurueck, a2, partynacht, nachspiel, nachspielTag, masterChipDlg, master);

/** Talk-Einträge vor dem alten Tagesgespräch (nach Rivale und Erstbegegnung). */
export const TALK_23: TalkDef[] = [
  rede('kabellos-master-chip', masterChip(KEY)),
  rede('kabellos-master', MASTER),
  rede('kabellos-nachspiel', einmal('kabellos-nachspiel', NACHSPIEL)),
  rede('kabellos-nachspiel-tag', NACHSPIEL),
  rede('kabellos-a2-gechippt', gechippt(KEY)),
  rede('kabellos-partynacht', PARTYNACHT),
  rede('kabellos-a2-frei', einmal('kabellos-a2-frei', { all: [NUR_AKT2, FREI] })),
  rede('kabellos-a2', NUR_AKT2),
];

export const part: ContentPart = { dialogues };
