// Herr Blitz – Besitzer „Schwebetaxi Blitz“, Bahnhof Mitte (world.md §4.5). Im Hintergrund der Störsender-Halunke aus
// side-uebliche-verspaetung (Flag takt_blitz_erledigt, siehe quest-side-a). Hier: Tagesgespräche und zwei Herz-Ereignisse.
import type { ContentPart } from '../../part';
import type { DialogueChoice, DialogueNode } from '../../../modules/contracts';
import {
  type Menue, dialog, erz, flag, geschenke, gespraech, herz, ich, knoten, nichtGetroffen, ort, pruefung, rede, sammle,
  sprecher, weg, weltfigur, zurueck,
} from './_welt';
import { TALK_23 } from './herr-blitz-akt23';

const ID = 'herr-blitz';
const QUEST = 'side-uebliche-verspaetung';
const ERWISCHT = { any: [{ flag: 'takt_blitz_erledigt' }, { quest: QUEST, state: 'done' as const }] };
const B = sprecher(ID);
const Z = zurueck('Noch was, Blitz.', 'Gute Fahrt.');

const choices: DialogueChoice[] = [
  { text: 'Was kostet eine Fahrt?', next: 'preis' },
  { text: 'Wie läuft das Geschäft?', next: 'geschaeft' },
  { text: '„Komisch, dass die U-Bahn immer genau dann ausfällt, wenn deine Taxis bereitstehen.“', tag: '[Straße 4]', check: pruefung('blitz-verdacht', 'strasse', 4), when: { quest: QUEST, state: 'active' }, once: true, id: 'b-verdacht', next: 'verdacht' },
  { text: 'Gute Fahrt.' },
];

const nodes: DialogueNode[] = [
  knoten('preis', [
    B('Grundgebühr zwanzig, dann fünf pro Kilometer, dann zehn für die Höhe, dann drei für die Duftbäume, dann zwei für meine Stimmung.'),
    B('Heute ist meine Stimmung teuer.'),
  ], { choices: Z }),
  knoten('geschaeft', [
    B('Brummt! Seit die U-Bahn ständig ausfällt, fahren die Leute Taxi. Ein Wunder. Ein technisches Wunder. Ich danke dem Himmel. Und der Elektrik.'),
    erz('Er zwinkert nicht. Er zwinkert sehr bewusst nicht.'),
  ], { choices: Z }),
  knoten('verdacht', [
    B('Komisch? Das ist kein Zufall, das ist … Marktwirtschaft! Angebot! Nachfrage! Ich bin nur sehr, sehr pünktlich zur Stelle.', 'verlegen'),
    B('Und jetzt steig ein oder geh weiter, du verunsicherst meine Duftbäume.'),
  ], { choices: Z, effects: [flag('blitz_verdacht')] }),
];

const M: Menue = { zeile: B('Sonst noch was? Das Taxameter läuft schon. Es läuft immer.'), choices, nodes };

const T = {
  rivale: dialog('blitz-tag-rivale', [knoten('start', [B('Für dich: besetzt.'), B('Für immer besetzt. Ich hab dafür extra ein Schild drucken lassen.')])]),
  erstes: gespraech('blitz-tag-erstes', [
    erz('Ein rotes Schwebetaxi, frisch poliert. Auf der Tür ein Blitz und der Schriftzug „BLITZ – Wir sind schon da, bevor Sie warten“. Daneben ein Mann in Lederhandschuhen mit Schnauzer wie ein Scheibenwischer.'),
    B('Blitz. Herr Blitz. Schwebetaxi Blitz. Ich hab drei Wagen, zwei Fahrer und einen Duftbaum pro Sitz. Wohin soll’s gehen?'),
  ], M),
  erwischt: gespraech('blitz-tag-erwischt', [
    erz('Herr Blitz poliert sein Taxi mit einer Wut, als wollte er den Lack abtragen. Er sieht dich an. Er poliert noch fester.'),
    B('Oh. Du. Du hast mir das Geschäft ruiniert. Die U-Bahn fährt wieder pünktlich. Es ist eine Tragödie.'),
    B('… Ich fahr jetzt ehrlich. Es bringt die Hälfte. Ich schlafe doppelt so gut. Ich hasse es.'),
  ], M),
  standard: gespraech('blitz-tag-standard', [B('Taxi? Taxi! Ich seh’s dir an, du willst Taxi fahren. Alle wollen Taxi fahren. Sie wissen es nur noch nicht.')], M),
};

/** ♥2: Der Wagen springt nicht an, ein Fahrgast wartet. */
const he2 = dialog('he-herr-blitz-2', [
  knoten('start', [
    erz('Herr Blitz tritt gegen sein Taxi. Es schwebt drei Zentimeter über dem Boden und weigert sich, mehr zu tun. Hinten sitzt eine alte Dame mit Einkaufsnetz und Engelsgeduld.'),
    B('Der Auftrieb hängt. Ausgerechnet jetzt. Frau Grünkohl muss um vier beim Arzt sein. Ich hab Frau Grünkohl noch nie warten lassen. Na gut. Einmal. Es war ein Desaster.'),
  ], {
    choices: [
      { text: 'Die Auftriebsspule neu justieren.', tag: '[Technik 4]', check: pruefung('he-blitz-2-spule', 'technik', 4, ['maschine']), next: 'repariert' },
      { text: 'Das Taxi mit Muskelkraft anschieben.', tag: '[Körper 4]', check: pruefung('he-blitz-2-schieben', 'koerper', 4, ['kraft']), next: 'geschoben' },
      { text: 'Frau Grünkohl zur U-Bahn bringen.', next: 'ubahn' },
    ],
  }),
  knoten('repariert', [erz('Ein Klick, ein Summen, und das Taxi steigt einen halben Meter. Frau Grünkohl applaudiert mit dem Einkaufsnetz.')], { next: 'ende', effects: [herz(ID, 45), { xp: 40 }] }),
  knoten('geschoben', [erz('Du schiebst. Das Taxi gleitet wie ein Schlitten über den Bahnhofsvorplatz und springt mit einem Ruck an. Du landest auf dem Hosenboden. Frau Grünkohl winkt.')], { next: 'ende', effects: [herz(ID, 40), { xp: 40 }] }),
  knoten('ubahn', [
    erz('Du bringst Frau Grünkohl zur U-Bahn. Die Linie 1 kommt pünktlich. Ausgerechnet.'),
    B('Pünktlich? Heute? Ich … gratuliere. Ganz ehrlich. Glaub ich.'),
  ], { next: 'ende', effects: [herz(ID, 25), { xp: 20 }] }),
  knoten('ende', [B('Du hast was gut bei mir. Eine Fahrt. Eine kurze. Eine sehr kurze.')], { effects: [flag('blitz_gefallen')] }),
]);

/** ♥4: Herr Blitz erzählt, warum er das Taxi so liebt. */
const he4 = dialog('he-herr-blitz-4', [
  knoten('start', [
    erz('Herr Blitz sitzt auf der Motorhaube und isst eine Brezel. Er bietet dir die Hälfte an. Das ist bei ihm ungefähr ein Heiratsantrag.'),
    B('Weißt du, was das hier ist? Das ist das erste Schwebetaxi der Unterstadt. 2071. Mein Vater hat es aus einem Polizeigleiter gebaut. Mit einer Rohrzange. Und Wut.'),
    B('Ich hab jahrelang gedacht, ich muss viel Geld damit verdienen, damit er stolz ist. Dabei ist er nur gern gefahren.'),
  ], {
    choices: [
      { text: '„Dann fahr mit mir eine Runde. Ohne Taxameter.“', next: 'runde' },
      { text: '„Du hast die U-Bahn sabotiert, um Geld zu machen. Ist er darauf stolz?“', tag: '[Ausstrahlung 5]', check: pruefung('he-blitz-4-gewissen', 'ausstrahlung', 5), when: ERWISCHT, next: 'gewissen' },
      { text: '„Die Brezel ist trocken.“', next: 'brezel' },
    ],
  }),
  knoten('runde', [erz('Ihr gleitet über die Dächer der Unterstadt. Herr Blitz pfeift. Kein Taxameter tickt. Unten winkt Frau Takt mit einer Stoppuhr. Sie misst euch. Natürlich.')], { next: 'ende', effects: [herz(ID, 55)] }),
  knoten('gewissen', [
    B('… Nein. Er hätte mir eine geknallt. Mit der Rohrzange.', 'trauer'),
    B('Ich fahr ab morgen Frau Takt gratis zum Stellwerk. Jeden Tag. Sie wird es hassen. Das ist meine Buße.'),
  ], { next: 'ende', effects: [herz(ID, 60), herz('frau-takt', 20), flag('blitz_busse')] }),
  knoten('brezel', [B('Trocken? Die ist von gestern. Die ist erfahren! Ach, gib her.'), erz('Er lacht zum ersten Mal ehrlich. Es klingt wie ein Anlasser.')], { next: 'ende', effects: [herz(ID, 40)] }),
  knoten('ende', [
    ich('Dein Vater hätte das Taxi heute gemocht.'),
    B('Ja. Er hätte die Duftbäume rausgeschmissen. Aber gemocht.'),
  ], { effects: [{ xp: 60 }, { give: 'taxi-duftbaum' }] }),
]);

const blitz = weltfigur({
  id: ID,
  name: 'Herr Blitz',
  unknownName: 'Mann am Schwebetaxi',
  faction: 'unterstadt',
  bio: 'Besitzer von „Schwebetaxi Blitz“ am Bahnhof Mitte. Schnauzer, Lederhandschuhe, Duftbäume. Verdient verdächtig gut, seit die U-Bahn ständig ausfällt.',
  gifts: geschenke({
    loves: ['taxi-duftbaum', 'oelkaennchen', 'brezel'],
    likes: ['synth-kaffee', 'sonnenbrille-gold', 'zeitung-papier'],
    dislikes: ['planungsbrett-glas', 'stempelkissen'],
    hates: ['magnet-stoerer', 'kanalschlamm'],
  }),
  schedule: [ort('T', 'bahnhof-mitte', 'taxistand-blitz'), weg()],
  heartEvents: [
    { id: 'he-herr-blitz-2', hearts: 2, map: 'bahnhof-mitte', time: 'tag', dialogue: 'he-herr-blitz-2' },
    { id: 'he-herr-blitz-4', hearts: 4, map: 'bahnhof-mitte', time: 'tag', when: { seen: 'he-herr-blitz-2' }, dialogue: 'he-herr-blitz-4' },
  ],
  talk: [
    rede('blitz-tag-rivale', { rival: ID }),
    rede('blitz-tag-erstes', nichtGetroffen(ID)),
    ...TALK_23,
    rede('blitz-tag-erwischt', ERWISCHT),
    rede('blitz-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: blitz },
  dialogues: sammle(T.rivale, T.erstes, T.erwischt, T.standard, he2, he4),
};
