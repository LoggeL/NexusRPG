// Knut – der ältere der Abzieher-Brüder vom Bahnhof Mitte (world.md §4.5, side-abzieher in quest-side-b).
// Nach dem Türsteher-Weg (Flag ab_tuersteher) steht er abends und nachts am High Voltage; nach dem Lockvogel-Weg
// (ab_lockvogel) ist er weg („Ihre Mama ist unterwegs“). Gossenkinder kennen ihn aus Mutter Brühes Suppenküche.
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode } from '../../../modules/contracts';
import {
  type Menue, dialog, erz, flag, geschenke, gespraech, herz, ich, knoten, nichtGetroffen, ort, pruefung, rede, sammle,
  sprecher, weg, weltfigur, zurueck,
} from './_welt';
import { TALK_23, SCHEDULE_23 } from './knut-akt23';

const ID = 'knut';
const KN = sprecher(ID);
const KU = sprecher('kurt');
const TUERSTEHER: Condition = { flag: 'ab_tuersteher' };
const Z = zurueck('Noch was, Knut.', 'Grüß deine Mama.');

const choices: DialogueChoice[] = [
  { text: '„Knut? Knut aus der Suppenküche? Du hast mir immer das Brot geklaut.“', tag: '[Gosse]', when: { origin: 'origin-gossenkind' }, once: true, id: 'kn-gosse', next: 'gosse' },
  { text: 'Wie läuft das Abziehen so?', when: { not: TUERSTEHER }, next: 'abziehen' },
  { text: 'Wie ist das Türsteherleben?', when: TUERSTEHER, next: 'tuer' },
  { text: 'Erzähl mir von deiner Mama.', once: true, id: 'kn-mama', next: 'mama' },
  { text: 'Grüß deine Mama.' },
];

const nodes: DialogueNode[] = [
  knoten('gosse', [
    KN('… Scheiße. Du bist das. Die mit dem Löffel. Du hast mir mit dem Löffel auf die Finger gehauen. Ich hab drei Tage nicht greifen können.', 'ueberrascht'),
    KN('Kurt! Das ist die mit dem Löffel!'),
    KU('Das sag ich meiner Mama!'),
    KN('Die kennt sie doch auch, du Hohlbrot.'),
  ], { choices: Z, effects: [herz(ID, 40)] }),
  knoten('abziehen', [
    KN('Schlecht. Die Leute haben keine Implantate mehr, nur noch Schulden. Letzte Woche hab ich einem Typen das Ohr abgeschwatzt. Es war aus Plastik. Es war ein Kinderohr. Von einer Puppe.'),
    KN('Kurt hat geweint. Ich auch. Ein bisschen.'),
  ], { choices: Z }),
  knoten('tuer', [
    KN('Bruno hat uns angelernt. Er sagt, wir haben „Präsenz“. Ich glaub, das heißt, dass wir breit sind.'),
    KN('Und wir kriegen Lohn. Echten. Mama hat geweint. Vor Freude. Und weil sie uns jetzt nicht mehr aus der Zelle holen muss.'),
  ], { choices: Z }),
  knoten('mama', [
    KN('Mama ist eins fünfzig groß und hat mehr Kraft als ein Gabelstapler. Sie hat einen Hafenarbeiter mit dem Nudelholz aus der Wohnung getragen. Er hat sich bedankt.'),
    KN('Wenn wir was falsch machen, sagt Kurt es ihr. Und sie kommt. Immer. Es gibt kein Versteck vor Mama.'),
  ], { choices: Z, effects: [herz(ID, 15)] }),
];

const M: Menue = { zeile: KN('Sonst noch was? Kurt wird nervös, wenn wir zu lang reden. Er denkt dann, es geht um ihn.'), choices, nodes };

const T = {
  rivale: dialog('knut-tag-rivale', [knoten('start', [KN('Geh weiter, oder ich zieh dir die Schuhe ab.'), KU('Und die Socken!'), KN('Die Socken nicht, Kurt. Die riechen.')])]),
  erstes: gespraech('knut-tag-erstes', [
    erz('Zwei Kerle wie zwei Kühlschränke in Trainingsanzügen. Der Größere kaut Kaugummi mit offenem Mund. Der andere schaut, was der Größere macht, und macht es nach.'),
    KN('Na, Frischling? Ich bin Knut. Das ist Kurt. Wir sind die Bahnhofsaufsicht. Inoffiziell. Sehr inoffiziell.'),
    KU('Das sag ich meiner Mama!'),
    KN('Was denn? Ich hab doch gar nichts gemacht. Noch nicht.'),
  ], M),
  tuer: gespraech('knut-tag-tuer', [
    erz('Knut steht am Eingang des High Voltage in einem Sakko, das an den Schultern um Gnade fleht.'),
    KN('Nur Gäste mit Stil. Du bist drin. Bruno hat gesagt, für dich ist das Ehrensache.'),
  ], M),
  standard: gespraech('knut-tag-standard', [KN('Na? Hübsches Ohr. Behalt’s. Heute bin ich gut drauf.')], M),
};

/** ♥2: Knut braucht Hilfe beim Geburtstagsgeschenk für Mama. */
const he2 = dialog('he-knut-2', [
  knoten('start', [
    erz('Knut steht vor einem Schaufenster und drückt die Nase ans Glas. Drinnen: eine Porzellankatze, die winkt.'),
    KN('Mama hat morgen Geburtstag. Sie will die Katze. Die kostet achtzig. Ich hab neun. Und einen Knopf.'),
    KN('Normalerweise würd ich jemandem die achtzig abziehen. Aber das wär irgendwie … falsch. Für Mama.'),
  ], {
    choices: [
      { text: '„Ich leg was dazu.“ (70 Cr)', requires: { credits: 70 }, effects: [{ credits: -70 }], next: 'geld' },
      { text: 'Mit dem Händler über einen fairen Preis reden.', tag: '[Ausstrahlung 4]', check: pruefung('he-knut-2-feilschen', 'ausstrahlung', 4, ['feilschen']), next: 'gefeilscht' },
      { text: '„Mal ihr was. Mamas lieben selbstgemalte Sachen.“', next: 'malen' },
    ],
  }),
  knoten('geld', [KN('Echt jetzt? Du gibst mir Geld? Freiwillig? Ich … weiß nicht, wie man das annimmt. Ich kenn nur die andere Richtung.', 'ueberrascht')], { next: 'ende', effects: [herz(ID, 50), { xp: 30 }] }),
  knoten('gefeilscht', [erz('Der Händler bekommt Knuts neun Credits, den Knopf und das Versprechen, dass Knut nie wieder vor seinem Laden steht. Alle sind zufrieden.')], { next: 'ende', effects: [herz(ID, 45), { xp: 40 }] }),
  knoten('malen', [
    erz('Knut malt mit Kurts Kugelschreiber auf eine Serviette. Es ist eine Katze. Vielleicht. Sie winkt. Ganz sicher.'),
    KN('Das ist … gar nicht schlecht. Oder? Sag, dass das nicht schlecht ist.'),
  ], { next: 'ende', effects: [herz(ID, 35), { xp: 25 }] }),
  knoten('ende', [KU('Das sag ich meiner Mama!'), KN('Ja, Kurt. Diesmal darfst du.')], { effects: [flag('knut_mama_geschenk')] }),
]);

/** ♥4: Knut will etwas Ehrliches werden. */
const he4 = dialog('he-knut-4', [
  knoten('start', [
    erz('Knut sitzt allein am Bahnsteig, ohne Kurt. Das ist so ungewohnt, dass es fast unheimlich ist. Er hält einen zerknitterten Zettel: „Ausbildung Gleisbau. Bewerbungsschluss Freitag.“'),
    KN('Kurt kann nicht lesen. Also, er kann schon, aber er liest alles wie einen Einkaufszettel. Ich will mich bewerben. Für uns beide.'),
    KN('Aber wer nimmt zwei Abzieher? Was schreib ich da rein? „Besondere Fähigkeiten: Ohren abschwatzen“?'),
  ], {
    choices: [
      { text: '„Schreib: belastbar, teamfähig, bringt eigene Mama mit.“', next: 'bewerbung' },
      { text: 'Frau Takt fragen, ob sie zwei kräftige Kerle brauchen kann.', tag: '[Straße 5]', check: pruefung('he-knut-4-takt', 'strasse', 5), when: { met: 'frau-takt' }, next: 'takt' },
      { text: '„Du musst gar nichts werden. Du bist schon okay.“', tag: '[Ausstrahlung 5]', check: pruefung('he-knut-4-okay', 'ausstrahlung', 5, ['trost']), next: 'okay' },
    ],
  }),
  knoten('bewerbung', [KN('„Bringt eigene Mama mit.“ Das ist gut. Das ist eine Drohung und ein Vorteil gleichzeitig.', 'freude')], { next: 'ende', effects: [herz(ID, 50)] }),
  knoten('takt', [
    erz('Frau Takt mustert die Brüder mit drei Stoppuhren gleichzeitig. Dann nickt sie. „Gepäckwagen. Ab Montag. Zu spät heißt gefeuert.“'),
    KN('Wir haben einen Job. Kurt! Wir haben einen JOB!'),
    KU('Das sag ich meiner Mama!', 'freude'),
  ], { next: 'ende', effects: [herz(ID, 60), herz('kurt', 30), herz('frau-takt', 15), flag('knut_kurt_gepaeck')] }),
  knoten('okay', [KN('… Hat mir noch keiner gesagt. Außer Mama. Und die zählt nicht, die muss das sagen.'), erz('Er wischt sich mit dem Ärmel übers Gesicht. Du hast es nicht gesehen.')], { next: 'ende', effects: [herz(ID, 55)] }),
  knoten('ende', [
    ich('Und wenn es nicht klappt?'),
    KN('Dann klappt es eben beim nächsten Mal. Mama sagt, Brecher geben nicht auf. Wir heißen nicht Brecher. Aber wir sind welche.'),
  ], { effects: [{ xp: 60 }] }),
]);

const knut = weltfigur({
  id: ID,
  name: 'Knut',
  unknownName: 'Großer Kerl im Trainingsanzug',
  faction: 'rostzaehne',
  bio: 'Der ältere Abzieher-Bruder vom Bahnhof Mitte. Breit wie ein Kühlschrank, Herz wie ein Kaugummi. Fürchtet nichts außer seiner Mama.',
  gifts: geschenke({
    loves: ['nougatbombe', 'kapuzenpulli', 'bruehes-suppe'],
    likes: ['chips-tuete', 'volt-limo', 'comic-heft', 'boxbandagen'],
    dislikes: ['gesetzbuch', 'haiku-buechlein'],
    hates: ['handschellen', 'tai-chi-tee'],
  }),
  schedule: [
    ...SCHEDULE_23,
    weg('*', { when: { flag: 'ab_lockvogel' } }),
    ort('A,N', 'neon-gasse', 'hv-eingang', { when: TUERSTEHER }),
    ort('A', 'bahnhof-mitte', 'bahnsteig'),
    ort('N', 'ubahn-wagen', 'abzieher-lager'),
    weg('M,T'),
  ],
  heartEvents: [
    { id: 'he-knut-2', hearts: 2, map: 'bahnhof-mitte', time: 'abend', dialogue: 'he-knut-2' },
    { id: 'he-knut-4', hearts: 4, map: 'bahnhof-mitte', time: 'abend', when: { seen: 'he-knut-2' }, dialogue: 'he-knut-4' },
  ],
  talk: [
    rede('knut-tag-rivale', { rival: ID }),
    rede('knut-tag-erstes', nichtGetroffen(ID)),
    ...TALK_23,
    rede('knut-tag-tuer', TUERSTEHER),
    rede('knut-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: knut },
  dialogues: sammle(T.rivale, T.erstes, T.tuer, T.standard, he2, he4),
};
