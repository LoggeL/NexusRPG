// Akt-2/3- und Nachspiel-Folgen vorhandener Figuren, ohne deren Dateien anzufassen (act23.json npcSchedules,
// scheduleMode „ersetzt“/„vorangestellt“). Mittel: feste Platzierungen per mapAdditions mit `when` (Tageszeit, Wochentag,
// Fortschritt). Eine aktive Platzierung geht dem Tagesablauf vor (modules/time/schedule.ts), die Figur steht also nie
// doppelt. Ohne `dialogue` gilt das normale Tagesgespräch der Figur; mit `dialogue` ein Akt-2-Gespräch, das am Ende in
// das alte Menü der Figur weiterleitet.
//
// Figuren: Hafen-Hannes (hafenkante), Fluss-Frieda (kanal-sammler), Ole Gähn und Direktorin Hartlauf (digitech-areal),
// Marla Sand (Ödnis statt „away“ in Akt 2), Opa Gustav (aussiedlerhof, quantum-campus), Lio Funkel (funkturm-ruine,
// das-meer), Käpt'n Nebelhorn (das-meer), Turbo-Tilda (rennhalle-9).
import type { ContentPart, MapAddition } from '../../part';
import type { Condition, DialogueChoice, DialogueDef, DialogueLine, TimeSlot, Weekday } from '../../../modules/contracts';
import { dialog, erz, flag, knoten, sammle, sprecher } from './_oednis';

// ------------------------------------------------------------------------------------------- Bausteine

const zeit = (...slots: TimeSlot[]): Condition => ({ time: slots });
const tag = (...days: Weekday[]): Condition => ({ weekday: days });
const nicht = (c: Condition): Condition => ({ not: c });
const alle = (...c: Condition[]): Condition => ({ all: c });
const AKT2: Condition = { act: 2 };
const EPILOG: Condition = { flag: 'epilog' };
const quest = (id: string, state: 'active' | 'done'): Condition => ({ quest: id, state });

type Platz = NonNullable<MapAddition['npcs']>[number];
const platz = (id: string, npc: string, at: string, when: Condition, dialogue?: string): Platz =>
  (dialogue ? { id, npc, at, when, dialogue } : { id, npc, at, when });

/** Schlusswahl, die ins alte Tagesgespräch der Figur weiterleitet (Laden, Fragen, Minispiele aus Akt 1). */
const weiter = (text: string, alt: string): DialogueChoice => ({ text, effects: [{ dialogue: alt }] });

/** Akt-2-Gespräch: Begrüßung, Fragen, Weiterleitung ins alte Menü. */
function folge(id: string, gruss: DialogueLine[], fragen: { text: string; when?: Condition; zeilen: DialogueLine[]; id: string; effects?: DialogueDef['nodes'][number]['effects'] }[], alt: string, ende: string): DialogueDef {
  const wahl: DialogueChoice[] = [
    ...fragen.map((f): DialogueChoice => (f.when ? { text: f.text, when: f.when, next: f.id } : { text: f.text, next: f.id })),
    weiter('Was anderes.', alt),
    { text: ende },
  ];
  return dialog(id, [
    knoten('start', gruss, { choices: wahl }),
    knoten('menue', [gruss[gruss.length - 1]], { choices: wahl }),
    ...fragen.map((f) => knoten(f.id, f.zeilen, f.effects ? { next: 'menue', effects: f.effects } : { next: 'menue' })),
  ]);
}

// ------------------------------------------------------------------------------------------- Hafen-Hannes

const H = sprecher('hafen-hannes');
const ROSTZAEHNE = 'side-rostzaehne-ende';

const hannesAkt2 = folge('hannes-akt2', [
  erz('Hannes steht am Kai, den Greifarm um einen Poller gelegt, als müsste er ihn festhalten. Drei Kollegen hinter ihm zählen Münzen in eine Blechdose. Auf der Dose steht „SCHUTZ“.'),
  H('Weißt du, was das ist? Das ist unser Wochenlohn. Für die Rostzähne. Seit Funzel weiß, dass Quantum am Hafen nachts Laster abfertigt, will er von jedem was. Von uns, von Grete, von der Möwe.', 'wut'),
], [
  { id: 'funzel', text: 'Wer ist dieser Funzel?', zeilen: [
    H('Rostzahn-Chef. Neonpeitsche, Goldzahn, Ego wie ein Containerschiff. Sitzt in ihrem Lager hinten im Labyrinth und lässt sich Hafenblut bringen. Unser Hafenblut.'),
    H('Er hat drei Leute, die für ihn prügeln, und dreißig, die Angst haben. Wenn die dreißig mal keine Angst mehr hätten … aber das sagt sich leicht.'),
  ] },
  { id: 'helfen', text: '„Was kann ich tun?“', when: nicht(quest(ROSTZAEHNE, 'active')), zeilen: [
    H('Erst mal: Die Leute hier müssen dich kennen. Wer am Hafen nicht bekannt ist, dem folgt keiner. Mach dir einen Namen in der Unterstadt. Dann reden wir.'),
    H('Und wenn’s so weit ist, sprich mich am Kai an. Ich hab dann einen Plan. Er ist nicht gut. Aber er ist laut.'),
  ] },
  { id: 'piet', text: '„Was ist mit Piet?“', when: { flag: 'hannes_piet_rostzahn' }, zeilen: [
    H('Piet treibt jetzt für Funzel ein. Gestern stand er vor mir mit der Dose. Er konnte mir nicht in die Augen sehen. Ich hab ihm trotzdem gezahlt. Für ihn, nicht für Funzel.', 'trauer'),
  ] },
], 'hannes-tag-standard', 'Mast- und Schotbruch.');

const hannesFrei = folge('hannes-hafen-frei', [
  erz('Am Kai hängt die Blechdose mit der Aufschrift „SCHUTZ“ jetzt umgedreht an einem Haken. Möwen nisten darin. Hannes grinst so breit, dass ihm fast die Mütze vom Kopf fällt.'),
  H('Da ist ja unser Held! Seit die Rostzähne weg sind, zahlen wir nur noch für Hafenblut. Und das zahlen wir gern. Na ja. Wir zahlen es.', 'freude'),
], [
  { id: 'piet', text: '„Und Piet?“', when: { flag: 'hannes_piet_rostzahn' }, zeilen: [
    H('Steht wieder am Kran. Hat sich entschuldigt. Bei mir, bei Grete, sogar bei der Möwe. Die Möwe hat ihm das Frühstück geklaut. Das ist bei ihr Vergebung.', 'freude'),
  ] },
  { id: 'kaffee', text: '„Kriege ich ein Hafenblut aufs Haus?“', zeilen: [
    H('Für dich? Immer. Hier. Doppelt stark. Damit du heute Nacht die Möwen nicht nur hörst, sondern verstehst.'),
  ], effects: [{ give: 'synth-kaffee' }] },
], 'hannes-tag-standard', 'Mast- und Schotbruch.');

const hannesEpilog = folge('hannes-epilog', [
  erz('Am Fähranleger hängt ein neues Schild, handgemalt: „Strand-Shuttle. Abfahrt, wenn voll. Oder wenn Hannes Feierabend hat.“'),
  H('Ihr habt’s also bis ans Meer geschafft. Die halbe Hafenkante redet von nichts anderem. Ich war gestern da. Mit dem Shuttle. Ich hab den Arm ins Wasser gehalten. Er hat gequietscht vor Glück.', 'freude'),
], [
  { id: 'meer', text: '„Und? Wie war’s?“', zeilen: [
    H('Salzig. Laut. Größer als jeder Containerhafen. Ich hab geheult. Ich sag, das war Salz im Auge. Es war kein Salz.', 'trauer'),
  ] },
], 'hannes-tag-standard', 'Mast- und Schotbruch.');

// ------------------------------------------------------------------------------------------- Fluss-Frieda

const F = sprecher('fluss-frieda');

const friedaAkt2 = folge('frieda-akt2', [
  erz('Friedas Floß ist schwer beladen. Zwischen Fässern und Türen liegen Säcke voller kaputter Chips, die schwach blau glimmen. Frieda trägt Handschuhe. Das hat sie früher nie.'),
  F('Seit ein paar Wochen spült die Oberstadt Chips runter. Tonnenweise. Quantum-Ausschuss. Die Ratten fressen sie nicht. Die Ratten! Das sagt doch alles.', 'besorgt'),
], [
  { id: 'chips', text: 'Was ist mit den Chips?', zeilen: [
    F('Chrome 10, kaputte Charge. Hinten an der Ausschuss-Stelle türmen sie sich. Nachts summen sie. Ich schwör’s dir, die summen ein Lied. Immer dasselbe. Wie Werbung.'),
    F('Gully hat die Stelle abgesperrt und ein Schild aufgestellt: „Betreten verboten. Außer für den Bürgermeister. Und auch für den nicht.“'),
  ] },
  { id: 'pumpwerk', text: '„Wie komme ich ins Pumpwerk Sieben?“', zeilen: [
    F('Durch den Tunnel Ost. Aber da drin ist es dunkler als in Gullys Seele. Ohne Licht siehst du nicht mal deine eigenen Fehler. Ich verkauf Stirnlampen. Rein zufällig.'),
    F('Und da hinten hat sich Quantum eine Außenstelle in den Dreck gebaut. Weiße Container. Das Kanalvolk hat eine Sperre davor. Sag denen, Frieda schickt dich. Hilft nicht, aber sie lachen dann.'),
  ] },
  { id: 'wandler', text: '„Hast du nachts hier unten Leute gesehen? Leute, die schlafwandeln?“', when: quest('pers-delya-quelle', 'active'), zeilen: [
    F('Einen. Im Pyjama. Steht nachts am Floßanleger und verkauft Ratten Fahrkarten. Ich hab ihm Suppe hingestellt. Er hat sie nicht angerührt. Aber er hat „Danke für Ihren Einkauf“ gesagt.', 'besorgt'),
    F('Und im Pumpwerk soll eine Oma die Rohre streicheln. Und im Datentunnel einer Kabeln die Hand schütteln. Irgendwas ruft die Leute da runter. Und es ist nicht das Meer.'),
  ] },
], 'frieda-tag-standard', 'Gute Strömung.');

const friedaEpilog = folge('frieda-epilog', [
  erz('Auf Friedas Floß steht jetzt ein Gartenstuhl, ein Sonnenschirm und eine Flasche, in der Sand ist. Echter Strandsand.'),
  F('Ich war am Meer. Zum ersten Mal. Ich hab mich ans Wasser gestellt und gerochen. Es riecht genau wie am Gitter einmal im Monat. Nur jeden Tag.', 'freude'),
], [
  { id: 'meer', text: '„Ziehst du hin?“', zeilen: [
    F('Nee. Einer muss hier unten bleiben und das Zeug rausfischen, das die da oben wegwerfen. Aber ich fahr jeden Sonntag hin. Mit Gully. Er trägt eine Badehose mit Krone drauf. Frag nicht.'),
  ] },
], 'frieda-tag-standard', 'Gute Strömung.');

// ------------------------------------------------------------------------------------------- Ole Gähn (digitech-areal)

const O = sprecher('ole-gaehn');

const oleAkt2 = folge('ole-akt2', [
  erz('Ole sitzt auf der Bank am Pförtnerhaus, den Besen im Arm. Er schläft nicht. Das ist neu. Er starrt auf den Gully vor dem Bauzaun, als würde der gleich reden.'),
  O('Hast du das gehört? Nachts. Unter dem Areal. Die Kabel singen. Seit Wochen. Ich kann nicht schlafen. Ich. Nicht schlafen. Das ist wie ein Fisch, der nicht schwimmen kann.', 'besorgt'),
], [
  { id: 'kabel', text: 'Welche Kabel?', zeilen: [
    O('Der Kabelschacht hinter dem Archiv. Geht runter in den Datentunnel, quer unter der Stadt bis zum Campus. Hab ich früher gefegt. Ja, man kann Kabel fegen. Man muss nur sehr gelangweilt sein.'),
    O('Seit Nexus wach ist, leuchten die da unten. In Wellen. Wie ein Herzschlag. Und manchmal, ganz leise, sagt eine Stimme: „Danke für Ihre Geduld.“ Ich hab keine Geduld. Ich hab nur Müdigkeit.'),
  ] },
  { id: 'koloss', text: '„Was ist mit dem Wachkoloss da hinten?“', zeilen: [
    O('Der? Schläft. Wie ich früher. Wenn Hartlauf ihn weckt, wacht er nicht freundlich auf. Hab ich bei mir auch nie.'),
    O('Es gibt einen Abschaltcode. Ich kenn ihn. Glaub ich. Er liegt irgendwo zwischen „gestern“ und „eingeschlafen“.'),
  ] },
], 'ole-tag-standard', 'Schlaf gut, Ole.');

// ------------------------------------------------------------------------------------------- Platzierungen

/** Kein Rivale und schon einmal angesprochen (die Vorstellung läuft über das alte Erstgespräch der Figur). */
const KEIN_RIVALE = (npc: string): Condition => alle(nicht({ rival: npc }), { met: npc });
const MTA = zeit('morgen', 'tag', 'abend');
const NICHT_SA = nicht(tag('sa'));

const mapAdditions: Record<string, MapAddition> = {
  hafenkante: {
    npcs: [
      platz('oednis-hannes-epilog', 'hafen-hannes', 'kai-mitte', alle(EPILOG, MTA, KEIN_RIVALE('hafen-hannes')), 'hannes-epilog'),
      platz('oednis-hannes-frei', 'hafen-hannes', 'kai-mitte', alle(quest(ROSTZAEHNE, 'done'), MTA, KEIN_RIVALE('hafen-hannes')), 'hannes-hafen-frei'),
      platz('oednis-hannes-akt2', 'hafen-hannes', 'kai-mitte', alle(AKT2, MTA, KEIN_RIVALE('hafen-hannes')), 'hannes-akt2'),
    ],
  },
  'kanal-sammler': {
    npcs: [
      platz('oednis-frieda-epilog', 'fluss-frieda', 'friedas-stand', alle(EPILOG, MTA, KEIN_RIVALE('fluss-frieda')), 'frieda-epilog'),
      platz('oednis-frieda-akt2', 'fluss-frieda', 'friedas-stand', alle(AKT2, MTA, KEIN_RIVALE('fluss-frieda')), 'frieda-akt2'),
    ],
  },
  'digitech-areal': {
    npcs: [
      // act23: Hartlauf T im Archiv, solange side-hartlaufs-rache läuft (vorangestellt).
      platz('oednis-hartlauf-archiv', 'direktorin-hartlauf', 'archiv', alle(quest('side-hartlaufs-rache', 'active'), zeit('tag'))),
      platz('oednis-ole-akt2', 'ole-gaehn', 'pfoertnerhaus-bank',
        alle(AKT2, nicht(EPILOG), MTA, KEIN_RIVALE('ole-gaehn'), nicht({ flag: 'gerda_brief_ole' })), 'ole-akt2'),
    ],
  },
  // act23 marla-sand „ersetzt“: Sa bleibt in der Stadt (eigener Tagesablauf), sonst ab act2 in der Ödnis.
  staubstrasse: {
    npcs: [
      platz('oednis-marla-lagerfeuer', 'marla-sand', 'lagerfeuer', alle(AKT2, zeit('nacht'))),
      platz('oednis-marla-konvoi', 'marla-sand', 'konvoi-halt', alle(AKT2, zeit('tag'), tag('mo', 'do'))),
    ],
  },
  aussiedlerhof: {
    npcs: [
      platz('oednis-marla-brunnen', 'marla-sand', 'brunnen', alle(AKT2, zeit('morgen'), NICHT_SA)),
      platz('oednis-marla-wohnwagen', 'marla-sand', 'marlas-wohnwagen', alle(AKT2, zeit('tag'), NICHT_SA, nicht(tag('mo', 'do')))),
      platz('oednis-marla-feuer', 'marla-sand', 'lagerfeuer-hof', alle(AKT2, zeit('abend'), NICHT_SA)),
      // act23 opa-gustav „vorangestellt“: sonntagabends bei Elsa auf der Bank.
      platz('oednis-gustav-bank', 'opa-gustav', 'gustav-bank', alle(quest('pers-gustav-alte-liebe', 'done'), zeit('abend'), tag('so'))),
    ],
  },
  'quantum-campus': {
    npcs: [platz('oednis-gustav-werkstatt', 'opa-gustav', 'campus-wiese', alle(quest('side-offene-werkstatt', 'done'), zeit('tag'), tag('sa')))],
  },
  'funkturm-ruine': {
    npcs: [
      // act23 lio-funkel „vorangestellt“: erste Sendung mit Opa Funk.
      platz('oednis-lio-sendung', 'lio-funkel', 'radio-rost-pult',
        alle(quest('side-verlorene-frequenz', 'active'), { flag: 'frequenz_relais' }, zeit('abend'))),
    ],
  },
  'das-meer': {
    npcs: [
      platz('oednis-lio-strandbuehne', 'lio-funkel', 'strandclub-buehne', alle(EPILOG, quest('side-strandclub', 'done'), zeit('nacht'), tag('fr'))),
      platz('oednis-nebelhorn-steg', 'kaeptn-nebelhorn', 'steg', alle(EPILOG, { seen: 'he-kaeptn-nebelhorn-10' }, zeit('tag'), tag('so'))),
    ],
  },
  'rennhalle-9': {
    npcs: [platz('oednis-tilda-rennnacht', 'turbo-tilda', 'boxengasse', alle({ flag: 'rennhalle-9-geoeffnet' }, zeit('nacht'), tag('mi', 'sa')))],
  },
};

// Kleiner Gruß, den Hannes nach der Befreiung des Hafens einmal loswird (Flag für Querverweise anderer Teile).
hannesFrei.nodes[0].effects = [flag('hannes_hafen_frei_gesehen')];

export const part: ContentPart = {
  dialogues: sammle(hannesAkt2, hannesFrei, hannesEpilog, friedaAkt2, friedaEpilog, oleAkt2),
  mapAdditions,
};
