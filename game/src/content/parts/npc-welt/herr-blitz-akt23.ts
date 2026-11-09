// Herr Blitz in Akt 2, Akt 3 und im Nachspiel (world.md §5.3–5.5). Akt 2: Nexus fährt die U-Bahn pünktlich, Quantum
// schickt Drohnentaxis, Gesuchte zahlen Gefahrenzulage; je nach side-uebliche-verspaetung ehrlich oder nicht.
// Partynacht (Taxis vor dem Campus), Nachspiel je Ende, Master-Modus („Für dich: besetzt“).
// Wird von herr-blitz.ts in NpcDef.talk eingehängt.
import type { ContentPart } from '../../part';
import type { Condition, TalkDef } from '../../../modules/contracts';
import { dialog, erz, herz, knoten, rede, sammle, sprecher } from './_welt';
import {
  A2_PARTY, ENDE_3B, ENDE_MEER, ENDE_NEXUS, GESUCHT, MASTER, NACHSPIEL, NUR_AKT2, PARTYNACHT, einmal, folge, gesehen, kurz,
} from './akt23-phasen';

const ID = 'herr-blitz';
const B = sprecher(ID);
const ALT = 'blitz-tag-standard';
const ERWISCHT: Condition = { any: [{ flag: 'takt_blitz_erledigt' }, { quest: 'side-uebliche-verspaetung', state: 'done' }] };

const a2 = folge('blitz-a2', [
  erz('Am Taxistand parkt nur noch ein Schwebetaxi. Daneben schweben drei weiße Drohnen-Kabinen mit lila Streifen: „CHROME CAB – fahrerlos, kostenlos, gedankenlos“. Herr Blitz poliert seinen Wagen und flucht in den Lappen.'),
  B('Die U-Bahn ist pünktlich. Auf die Sekunde. Und Quantum schickt Taxis ohne Fahrer. Ohne Duftbaum! Ohne Stimmung! Wer will denn so fahren?'),
  B('… Alle. Alle wollen so fahren. Ich bin erledigt.', 'trauer'),
], B('Sonst noch was? Das Taxameter läuft. Es läuft ins Leere.'), [
  { id: 'cab', text: '„Was ist so schlimm an den Drohnentaxis?“', zeilen: [
    B('Die fragen nicht, wohin. Die wissen es. Ein Kunde wollte zum Bahnhof, die Kabine hat ihn zum Schauraum in den Glasarkaden gefahren. „Basierend auf Ihren Interessen.“ Er kam mit einem Chip hinterm Ohr zurück.'),
    B('Ich hab Leute betrogen, ja. Aber ich hab sie immer da abgesetzt, wo sie hinwollten. Zu teuer. Aber da.'),
  ] },
  { id: 'gesucht', text: '„Fährst du auch Leute, die gesucht werden?“', when: GESUCHT, zeilen: [
    B('Gefahrenzulage. Fünfzig. Plus Duftbaum. Plus Kofferraum, wenn die Drohnen tief fliegen. Der Kofferraum riecht nach Vanille. Es gibt schlimmere Verstecke.'),
    B('Seit dem Campus fahr ich jeden Tag einen. Ich frag nicht, was die gemacht haben. Ich frag nur, ob sie Kleingeld haben.', 'signatur'),
  ] },
  { id: 'ehrlich', text: '„Und? Immer noch ehrlich?“', when: ERWISCHT, zeilen: [
    B('Ja! Leider! Ich hab überlegt, wieder Störsender aufzustellen. Gegen Quantum. Das wär sogar gut. Das wär Widerstand. Frau Takt hat gesagt, sie bricht mir die Stoppuhr ins Gesicht.'),
    B('Ich bleib ehrlich. Aus Angst. Das ist auch eine Tugend.'),
  ] },
  { id: 'party', text: '„Fährst du uns zur Releaseparty?“', when: A2_PARTY, zeilen: [
    B('Zum Campus? In meinem Taxi? Mit dem Blitz an der Tür? Da stehen nur Limousinen. Und Chrome Cabs. Ich wär das einzige Fahrzeug mit Charakter.'),
    B('… Ich mach’s. Aber ihr steigt hinten aus. Und ich hab euch nie gesehen. Ich hab heute Abend Grippe. Schwere Grippe. Mit Duftbaum.'),
  ], effects: [herz(ID, 10)] },
], ALT, 'Gute Fahrt.');

const partynacht = kurz('blitz-partynacht', [
  erz('Der Taxistand ist leer. Herr Blitz sitzt in seinem Wagen, Fenster unten, und hört Radio. Auf dem Armaturenbrett tanzt ein Wackelblitz.'),
  B('Alle Chrome Cabs sind am Campus. Für die Gäste. Und ich? Ich hab heute drei Fahrten gehabt. Alle drei wollten zum Campus. Alle drei wollten nur gucken.'),
  B('Wenn ihr da wieder rauskommt und schnell weg müsst: Ich steh hier. Mit Motor an. Den Duftbaum zahl ich.'),
]);

const nachspiel = dialog('blitz-nachspiel', [
  knoten('start', [
    erz('Die Chrome Cabs stehen am Rand des Taxistands, abgeschaltet, mit Kreide beschmiert. Auf einer steht: „GEDANKENLOS“. Herr Blitz lehnt an seinem Taxi und hat einen neuen Duftbaum. „Meeresbrise“.'),
    B('Taxi? Taxi! Für dich heute gratis. Einmal. Ich hab’s mir vorgenommen. Es tut weh, aber ich zieh’s durch.'),
  ], {
    effects: [gesehen('blitz-nachspiel'), herz(ID, 20)],
    choices: [
      { text: '„Fährst du jetzt auch ans Meer?“', when: ENDE_MEER, next: 'meer' },
      { text: '„Nexus macht die U-Bahn pünktlich. Wieder.“', when: ENDE_NEXUS, next: 'nexus' },
      { text: '„Früher hättest du mich nicht gratis gefahren.“', when: ENDE_3B, next: 'dreib' },
    ],
  }),
  knoten('meer', [
    B('Ans Meer! Ich hab eine neue Linie: Bahnhof Mitte – Strand. Über die Ödnis. Drei Stunden. Achthundert Credits. Mit Lied.', 'freude'),
    B('Ich sing selber. Den ganzen Weg. Die Leute zahlen inzwischen extra, damit ich aufhöre. Das ist ein Geschäftsmodell.'),
  ]),
  knoten('nexus', [
    B('Pünktlich! Und freundlich! Die U-Bahn sagt jetzt „Guten Morgen“ und „Bitte“. Und die Chrome Cabs fahren die Leute dahin, wo sie hinwollen. Ohne Umweg über den Schauraum.'),
    B('Ich bin erledigt. Endgültig. Ich überlege, Duftbäume zu verkaufen. An die Drohnen. Die haben gefragt, wie Vanille riecht. Sie können nicht riechen. Sie wollen es trotzdem wissen.', 'verlegen'),
  ]),
  knoten('dreib', [
    B('Nein. Hätte ich nicht. In der Woche hab ich ein Schild ins Fenster gehängt. „FÜR MASTER BESETZT“. Ich hab es nachts gedruckt. Mit Rahmen.', 'wut'),
    B('Das Schild ist weg. Steig ein. Gratis. Einmal. Danach wieder Duftbaumzuschlag.'),
  ], { effects: [herz(ID, 40)] }),
]);

const nachspielTag = folge('blitz-nachspiel-tag', [
  B('Taxi? Taxi! Heute mit Meeresbrise. Kostet drei Credits mehr. Es riecht nach Fisch. Das ist authentisch.'),
], B('Sonst noch was? Das Taxameter läuft. Jetzt wieder in die richtige Richtung.'), [
  { id: 'geschaeft', text: 'Wie läuft das Geschäft?', zeilen: [
    B('Ehrlich. Langsam. Ich hab Stammkunden. Frau Klingel fährt jeden Sonntag zum Markt. Sie zahlt in Glöckchen. Ich hab hundertvierzig Glöckchen. Mein Taxi klingt bei jeder Kurve wie ein Weihnachtsmarkt.'),
  ] },
], ALT, 'Gute Fahrt.');

const master = kurz('blitz-master', [
  erz('Im Fenster des Schwebetaxis hängt ein gedrucktes Schild mit Rahmen: „FÜR MASTER BESETZT“. Herr Blitz sitzt dahinter und tut, als würde er telefonieren. Das Telefon ist eine Banane.'),
  B('Besetzt. Für dich: besetzt. Für immer besetzt. Ich hab dafür extra ein Schild drucken lassen. Mit Rahmen.', 'wut'),
  B('Nimm ein Chrome Cab. Die fahren dich, wohin du willst. Du bist ja jetzt deren Chef. Viel Spaß ohne Duftbaum.'),
]);

const dialogues = sammle(a2, partynacht, nachspiel, nachspielTag, master);

/** Talk-Einträge vor dem alten Tagesgespräch (nach Rivale und Erstbegegnung). */
export const TALK_23: TalkDef[] = [
  rede('blitz-master', MASTER),
  rede('blitz-nachspiel', einmal('blitz-nachspiel', NACHSPIEL)),
  rede('blitz-nachspiel-tag', NACHSPIEL),
  rede('blitz-partynacht', PARTYNACHT),
  rede('blitz-a2', NUR_AKT2),
];

export const part: ContentPart = { dialogues };
