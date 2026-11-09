// Wachmann Pfeffer – Quantum-Wachmann, Fr/Sa im High Voltage, Vater von Mila (world.md §4.5, §5.2 prep-zugangskarte).
// Taschendiebstahl (gc-23) und Karaoke-Wette (gc-24) baut prep-zugangskarte; hier: Figur, Tagesgespräche, he-2/he-4.
// Volle Fassung; ersetzt npc-welt/pfeffer.ts (gleiche IDs). Akt 2 tags am Wachhäuschen des Campus, Partynacht am
// Gästeeingang des Himmelsgartens, Nachspiel wieder Fr/Sa im High Voltage (act23.json npcSchedules.pfeffer).
import type { ContentPart } from '../../part';
import type { DialogueChoice, DialogueNode } from '../../../modules/contracts';
import {
  type Menue, AKT2, EPILOG, PARTYNACHT, alle, dialog, erz, flag, geschenke, gespraech, herz, knoten, nicht,
  nichtGetroffen, ort, pruefung, rede, rivale, sammle, sprecher, weg, weltfigur, zurueck,
} from './_q';

const MI = sprecher('mila');

const ID = 'pfeffer';
const P = sprecher(ID);
const Z = zurueck('Noch was, Pfeffer.', 'Schönen Feierabend.');

const choices: DialogueChoice[] = [
  { text: 'Wie ist es so bei Quantum?', once: true, id: 'p-quantum', next: 'quantum' },
  { text: 'Erzähl von deiner Tochter.', next: 'mila' },
  { text: 'Was machst du eigentlich in einem Unterstadt-Club?', once: true, id: 'p-club', next: 'club' },
  { text: '„Ich war auch mal Wache. Ich kenn die Nachtschichten.“', tag: '[Ex-Wache]', when: { origin: 'origin-ex-wache' }, once: true, id: 'p-wache', next: 'wache' },
  { text: '„Wer ist eigentlich Leutnant Nadel?“', when: alle(AKT2, nicht(EPILOG)), once: true, id: 'p-nadel', next: 'nadel' },
  { text: '„Und, wie ist das Leben ohne Master?“', when: EPILOG, once: true, id: 'p-danach', next: 'danach' },
  { text: 'Schönen Feierabend.' },
];

const nodes: DialogueNode[] = [
  knoten('quantum', [
    P('Sicher. Sauber. Weiß. Alles ist weiß. Die Wände, die Böden, die Kaffeebecher. Sogar der Kaffee ist irgendwie weiß.'),
    P('Neuerdings sagen ein paar Leute im Labor „Ja, Master“, wenn der Chef vorbeiläuft. Ich dachte erst, das ist ein Witz. Keiner lacht.'),
    P('Aber das Gehalt kommt pünktlich. Und Mila braucht Schuhe. Kinderfüße wachsen schneller als Aktienkurse.'),
  ], { choices: Z }),
  knoten('mila', [
    erz('Er holt ein zerknicktes Bild aus der Brusttasche – die linke, die mit der Zugangskarte, die er sofort wieder zuknöpft. Ein Hase mit riesigen Ohren und Polizeimütze.'),
    P('Mila. Acht. Malt nur Hasen. Der hier ist Polizist. Der Hase. Nicht Mila. Mila will Raketenbäckerin werden.'),
    P('Sie sagt, ich soll mehr lachen. Ich sag, ich lach doch. Sie sagt, das ist kein Lachen, das ist Zähnezeigen.'),
  ], { choices: Z, effects: [herz(ID, 10)] }),
  knoten('club', [
    P('Freitags darf ich ein Mensch sein. Mocktail, Karaoke, keiner salutiert. Bruno lässt mich rein, weil ich Trinkgeld gebe und nicht zuhaue.'),
    P('Und wenn mich einer vom Campus hier sieht, sag ich, ich ermittle. Ich ermittle, wie viele Mocktails ich schaffe.'),
  ], { choices: Z }),
  knoten('wache', [
    P('Dann weißt du, wie die Stunde um drei Uhr nachts schmeckt. Nach Kaltkaffee und Selbstmitleid.'),
    P('Prost, Kollegin. Kollege. Ex. Wie auch immer.'),
  ], { choices: Z, effects: [herz(ID, 30)] }),
  knoten('nadel', [
    P('Nadel? Meine Chefin. Also, Xions Chefin für alles, was Xion zu laut macht. Sie ist so groß wie ein Feuerlöscher und doppelt so gefährlich.', 'besorgt'),
    P('Sie zählt die Kaffeebecher. Sie weiß, wer wie viel Zucker nimmt. Ich nehme vier. Sie hat es in meine Akte geschrieben. Unter „Schwächen“.'),
  ], { choices: Z }),
  knoten('danach', [
    P('Ohne Master. Komisch. An meinem letzten Tag bei Quantum haben die Leute im Labor wieder schlecht gelaunt geguckt. Ich hab nie gedacht, dass ich mich mal über schlechte Laune freue.'),
    P('Mila sagt, ich lache jetzt richtig. Mit Geräusch. Ich hab’s aufgenommen. Es klingt wie ein Wal, der niest. Sie sagt, das ist gut.', 'freude'),
  ], { choices: Z, effects: [herz(ID, 20)] }),
];

const M: Menue = { zeile: P('Noch was? Mein Mocktail wird warm. Mocktails werden schnell warm. Wie Gefühle.'), choices, nodes };

const T = {
  rivale: dialog('pfeffer-tag-rivale', [knoten('start', [P('Ich bin im Dienst. Ab jetzt. Für dich.'), P('Verzieh dich, bevor ich meinen Ausweis zücke.')])]),
  erstes: gespraech('pfeffer-tag-erstes', [
    erz('Ein Mann in Quantum-Weiß mit gelockerter Krawatte, am Ecktisch hinten, vor ihm ein knallgrüner Mocktail mit Schirmchen.'),
    P('Pfeffer. Wachmann. Quantum. Ja, ich weiß. Hier unten mögen sie uns nicht. Hier unten mögen sie aber Trinkgeld.'),
    P('Ich bin heute nicht im Dienst. Heute bin ich nur ein Vater mit zu viel Eis im Glas.'),
  ], M),
  karaoke: gespraech('pfeffer-tag-karaoke', [
    P('Heute ist Karaoke. Ich sing „Leuchtturm im Smog“. Jedes Mal. Jedes Mal weine ich beim Refrain.'),
    P('Bruno sagt, ich darf das. Weil’s Stil hat. Ich glaub, er hat Mitleid.'),
  ], M),
  vertraut: gespraech('pfeffer-tag-vertraut', [
    P('Da bist du ja. Mila hat dich gemalt. Als Hase. Mit Lederjacke. Du siehst gut aus als Hase.'),
  ], M),
  campus: gespraech('pfeffer-tag-campus', [
    erz('Im Wachhäuschen am Campustor sitzt Pfeffer, die Mütze schief, die Krawatte straff, ein Kreuzworträtsel auf dem Knie. Er versteckt es nicht schnell genug.'),
    P('Ich bin im Dienst. Offiziell kenn ich dich nicht. Inoffiziell: Sieben senkrecht, „Gefühl ohne Chip“, fünf Buchstaben?'),
  ], M),
  party: dialog('pfeffer-tag-party', [knoten('start', [
    erz('Am Gästeeingang des Himmelsgartens, zwischen zwei Rosenbögen und einem Scanner, steht Pfeffer in Galauniform. Sie ist ihm eine Nummer zu klein. Er schwitzt Haltung.'),
    P('Einladung, bitte. Oder Gesicht auf der Liste. Oder …', 'besorgt'),
    erz('Er sieht genauer hin. Sein Schnurrbart zuckt.'),
    P('Ach du Scheiße. Du. Ich hab dich nicht gesehen. Ich sehe heute niemanden. Ich bin eine Statue. Statuen sehen nichts. Geh rein, bevor ich mich bewege.'),
  ], {
    choices: [
      { text: '„Danke, Pfeffer. Grüß Mila.“', effects: [herz(ID, 10)] },
      {
        text: '„Wenn’s heute Nacht knallt: Nimm die Treppe Ost, nicht den Aufzug.“', tag: '[Ausstrahlung 5]',
        check: pruefung('pfeffer-party-warnung', 'ausstrahlung', 5, ['ueberreden']), next: 'warnung', effects: [herz(ID, 30)],
      },
    ],
  }), knoten('warnung', [
    P('Treppe Ost. Nicht der Aufzug. Ich frag nicht warum. Ich will’s nicht wissen. Ich will nach Hause zu meiner Tochter.', 'besorgt'),
  ], { effects: [flag('pfeffer_gewarnt')] })]),
  epilog: gespraech('pfeffer-tag-epilog', [
    erz('Das High Voltage, ein Freitag nach allem. Pfeffer sitzt am Ecktisch. Statt Mocktail: ein echtes Bier. Neben ihm, auf einem Barhocker, viel zu hoch für sie, Mila mit Limo und Kreide.'),
    P('Darf sie eigentlich nicht. Bruno hat gesagt: bis neun. Wegen Ausnahmezustand. Er meint die Stadt. Ich mein die Woche.'),
    MI('Papa hat gekündigt. Er macht jetzt Nachtwache bei Dante. Da sagt keiner „Master“. Da sagt man nur „Pass auf, das ist heiß“.'),
  ], M),
  standard: gespraech('pfeffer-tag-standard', [P('Abend. Setz dich. Oder steh. Hauptsache, du salutierst nicht.')], M),
};

/** ♥2: Pfeffer zeigt Milas Bild und braucht einen Rat. */
const he2 = dialog('he-pfeffer-2', [
  knoten('start', [
    erz('Pfeffer sitzt allein, das Hasenbild vor sich auf dem Tisch. Der Mocktail ist unangetastet. Das Schirmchen hängt.'),
    P('Mila hat Geburtstag nächste Woche. Sie will „was Echtes“. Was heißt „was Echtes“? Ich hab ihr ein Hologramm gekauft. Sie hat geweint.'),
  ], {
    choices: [
      { text: '„Echt heißt: Du. Ohne Uniform. Ein Nachmittag auf dem Schrottmarkt.“', tag: '[Ausstrahlung 4]', check: pruefung('he-pfeffer-2-rat', 'ausstrahlung', 4), next: 'rat' },
      { text: '„Die Straßenkinder am Schrottmarkt spielen jeden Donnerstag Eins!. Nimm sie mit.“', tag: '[Straße 3]', check: pruefung('he-pfeffer-2-kinder', 'strasse', 3), next: 'kinder' },
      { text: '„Kauf ihr einen Aufzieh-Roboter. Die fallen um. Kinder lieben das.“', next: 'roboter' },
    ],
  }),
  knoten('rat', [
    P('Ohne Uniform. Ich hab keine Hosen ohne Uniform. Ich hab nur Uniformhosen.', 'ueberrascht'),
    P('… Dann kauf ich mir eine Hose. Eine echte. Mit Taschen, in die keine Zugangskarte passt.'),
  ], { next: 'ende', effects: [herz(ID, 40), { xp: 40 }] }),
  knoten('kinder', [
    P('Straßenkinder. Mit Mila. Beim Kartenspiel. Meine Kollegen würden kotzen.'),
    P('Gut. Sehr gut. Dann machen wir das.'),
  ], { next: 'ende', effects: [herz(ID, 40), { xp: 40 }, flag('mila_eingeladen')] }),
  knoten('roboter', [
    P('Fällt um. Steht nicht wieder auf. Klingt nach meiner Karriere. Sie wird ihn lieben.'),
  ], { next: 'ende', effects: [herz(ID, 25), { xp: 25 }] }),
  knoten('ende', [
    P('Danke. Ehrlich. Ich red nie mit wem. Bei Quantum redet man mit dem Bildschirm, und der Bildschirm redet zurück. Das ist nicht dasselbe.'),
  ], { effects: [flag('pfeffer_vertraut')] }),
]);

/** ♥4: Nach der Schicht – Pfeffer erzählt, was er im Labor gesehen hat. */
const he4 = dialog('he-pfeffer-4', [
  knoten('start', [
    erz('Spät nachts. Pfeffer hat drei Mocktails getrunken, was für ihn ungefähr so viel ist wie für Hunter eine Flasche Rum. Er beugt sich zu dir.'),
    P('Darf ich dir was sagen? Unter uns? Ich hab keinen, dem ich das sagen kann. Mila ist acht. Die Hasen hören nicht zu.'),
  ], {
    choices: [
      { text: '„Ich hör zu.“', next: 'erzaehlt' },
      { text: '„Lass mich raten: weiße Wände, komische Kollegen.“', tag: '[Straße 4]', check: pruefung('he-pfeffer-4-raten', 'strasse', 4), next: 'geraten' },
    ],
  }),
  knoten('geraten', [P('Woher weißt du das? Bist du bei der Konkurrenz? Bist du bei der Presse? Bist du …', 'ueberrascht'), P('Egal. Ja. Genau das.')], { next: 'erzaehlt', effects: [herz(ID, 10)] }),
  knoten('erzaehlt', [
    P('Im Labor wird nachts operiert. Nicht offiziell. Die Leute kommen rein, so mit Taschen und Sorgen, und gehen raus und sind … zufrieden. Total zufrieden. Das ist das Unheimliche.'),
    P('Einer hat mir „Guten Morgen, Master“ gesagt. Mir. Ich bin Wachmann. Ich bin niemandes Master. Ich bin nicht mal der Master von meinem Hamster.'),
  ], {
    choices: [
      { text: '„Pass auf dich auf. Und auf Mila.“', next: 'ende', effects: [herz(ID, 40)] },
      { text: '„Wenn du was hörst – erzähl es mir.“', tag: '[Ausstrahlung 5]', check: pruefung('he-pfeffer-4-quelle', 'ausstrahlung', 5), next: 'quelle' },
    ],
  }),
  knoten('quelle', [
    P('Ich soll petzen? Gegen meinen Arbeitgeber? Der mir die Schuhe für meine Tochter bezahlt?'),
    P('… Ja. Okay. Aber nur das, was keinem wehtut. Außer denen, die’s verdient haben.'),
  ], { next: 'ende', effects: [herz(ID, 50), flag('pfeffer_quelle'), { give: 'exklusiv-tipp' }] }),
  knoten('ende', [
    erz('Er wischt sich mit dem Schirmchen die Augen. Dann steckt er es in die Brusttasche. Die rechte.'),
    P('Du bist ein guter Mensch. Für die Unterstadt. Für die Oberstadt auch. Ach, für überall.'),
  ], { effects: [{ xp: 60 }] }),
]);

const pfeffer = weltfigur({
  id: ID,
  name: 'Wachmann Pfeffer',
  unknownName: 'Quantum-Wachmann mit Mocktail',
  faction: 'quantum',
  bio: 'Quantum-Wachmann, Vater der achtjährigen Mila. Freitags und samstags im High Voltage mit Mocktail und Karaoke („Leuchtturm im Smog“). Trägt die Zugangskarte links.',
  gifts: geschenke({
    loves: ['aufzieh-roboter', 'plueschmoehre', 'kuehlmittel-mocktail'],
    likes: ['synth-kaffee', 'bao-dampfnudel', 'comic-heft', 'neon-limo'],
    dislikes: ['zeitung-papier', 'chrome-10-gutschein'],
    hates: ['handschellen', 'raubkopie-stick'],
  }),
  schedule: [
    ort('*', 'himmelsgarten', 'gaesteeingang', { when: PARTYNACHT }),
    ort('A,N', 'high-voltage', 'pfeffer-tisch', { days: ['fr', 'sa'] }),
    ort('T', 'quantum-campus', 'wachhaeuschen-campus', { when: alle(AKT2, nicht(EPILOG)) }),
    weg(),
  ],
  heartEvents: [
    { id: 'he-pfeffer-2', hearts: 2, map: 'high-voltage', time: 'abend', when: { weekday: ['fr', 'sa'] }, dialogue: 'he-pfeffer-2' },
    { id: 'he-pfeffer-4', hearts: 4, map: 'high-voltage', time: 'nacht', when: { all: [{ weekday: ['fr', 'sa'] }, { seen: 'he-pfeffer-2' }] }, dialogue: 'he-pfeffer-4' },
  ],
  talk: [
    rede('pfeffer-tag-rivale', rivale(ID)),
    rede('pfeffer-tag-party', PARTYNACHT),
    rede('pfeffer-tag-campus', alle(AKT2, nicht(EPILOG), { time: 'tag' })),
    rede('pfeffer-tag-epilog', EPILOG),
    rede('pfeffer-tag-erstes', nichtGetroffen(ID)),
    rede('pfeffer-tag-vertraut', undefined, 4),
    rede('pfeffer-tag-karaoke', { all: [{ weekday: 'fr' }, { time: 'nacht' }] }),
    rede('pfeffer-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: pfeffer },
  dialogues: sammle(T.rivale, T.erstes, T.karaoke, T.vertraut, T.campus, T.party, T.epilog, T.standard, he2, he4),
};

