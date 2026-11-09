// Opa Funk – sendet Radio Rost aus dem Bunker unter der Funkturm-Ruine (world.md §3.5 funkturm-ruine, §4.5, §6.3
// side-verlorene-frequenz, §10.5 „Opa Funk sagt …“; act23.json npcSchedules/events). Laden `radio-rost`
// (maps-23/shops-staubstrasse.ts), Minispiel akt-radio-rost über den Karten-Hotspot. Questdialoge: Quest-Pakete.
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode } from '../../../modules/contracts';
import {
  type Menue, dialog, erz, flag, geschenke, gespraech, herz, ich, knoten, nichtGetroffen, ort, pruefung, rede, sammle,
  sprecher, weltfigur, zurueck,
} from './_oednis';

const ID = 'opa-funk';
const F = sprecher(ID);
const Z = zurueck('Noch was, Opa Funk.', 'Over and out.');

const FREQUENZ_LAEUFT: Condition = { quest: 'side-verlorene-frequenz', state: 'active' };
const FREQUENZ: Condition = { quest: 'side-verlorene-frequenz', state: 'done' };

const choices: DialogueChoice[] = [
  { text: 'Was hast du an Platten?', next: 'platten', effects: [{ shop: 'radio-rost' }] },
  { text: 'Wer hört Radio Rost überhaupt?', next: 'hoerer' },
  { text: 'Erzähl mir was über die Ödnis.', next: 'oednis' },
  { text: 'Was ist mit dem Windrad?', when: { not: FREQUENZ }, next: 'windrad' },
  {
    text: 'Einen Gruß in die Sendung schicken: „Grüße an die Crew im High Voltage.“', when: { all: [FREQUENZ, { notFlag: 'heute_funk_gruss' }] }, next: 'gruss',
    effects: [flag('heute_funk_gruss'), herz(ID, 10), { rep: 'aussiedler', delta: 1 }],
  },
  { text: '„Sag mal einen deiner Sprüche.“', next: 'spruch' },
  { text: '„Warum sendest du, wenn keiner zuhört?“', tag: '[Opa Funk ♥3]', requires: { hearts: ID, min: 3 }, once: true, id: 'funk-warum', next: 'warum' },
  { text: '„Mein Vater hatte ein Kofferradio. Er hat dich jeden Abend gehört.“', tag: '[Ödnis]', when: { origin: 'origin-oednis' }, once: true, id: 'funk-oednis', next: 'vater' },
  { text: 'Over and out.' },
];

const nodes: DialogueNode[] = [
  knoten('platten', [F('Vinyl, Kind. Echtes Vinyl. Kratzt, knistert, lebt. Die Stadt hört Musik aus der Cloud. Ich hör Musik aus dem Staub. Rate mal, was länger hält.')]),
  knoten('hoerer', [
    F('Konvoi-Fahrer. Aussiedler. Die Falken, wenn Krähe gute Laune hat. Ein Glasskorpion, glaub ich. Der kommt jeden Abend an die Antenne und wackelt.'),
    F('Früher hat mich die halbe Unterstadt gehört. Bis Quantum die Frequenzen aufgekauft hat. Jetzt dudelt da „Chrome-Radio“, zwölf Stunden Werbung und ein Lied. Das Lied ist auch Werbung.', 'wut'),
  ], { choices: Z }),
  knoten('oednis', [
    F('Die Ödnis ist ehrlich. Wenn sie dich umbringen will, merkst du’s. In der Stadt merkst du’s erst, wenn die Rechnung kommt.'),
    F('Hör auf die singenden Masten an der Straße. Wenn sie hoch singen, kommt Sand. Wenn sie tief singen, kommt Krähe. Wenn sie gar nicht singen, lauf.'),
  ], { choices: Z }),
  knoten('windrad', [
    F('Das Windrad gibt mir den Strom für den großen Sender. Seit die Drohnen drin nisten, dreht es nur noch, wenn es Lust hat. Es hat selten Lust. Wie ich.', 'besorgt'),
    F('Ohne Windrad reicht mein Signal bis zur Staubstraße. Mit Windrad und einem Relais an der Flutmauer hört mich die ganze Stadt. Aber ich bin zu alt zum Klettern. Und die Drohnen sind zu jung zum Verhandeln.'),
  ], { choices: Z }),
  knoten('gruss', [
    erz('Opa Funk zieht das Mikrofon heran, ein Ding aus Chrom und Klebeband.'),
    F('Und hier ein Gruß an die Crew im High Voltage! Von jemandem, der in der Ödnis Sand frisst und an euch denkt. Hunter, du schuldest der Person ein Bier. Ich weiß nicht, wer Hunter ist. Aber er schuldet es.', 'freude'),
  ], { choices: Z }),
  knoten('spruch', [
    F('Opa Funk sagt: Was nix kostet, kostet am Ende alles.'),
    F('Opa Funk sagt: Wer laut ist, muss nicht recht haben. Aber es hilft.'),
    F('Opa Funk sagt: Ein Rabe in der Oberstadt? Die kommen immer zurück.'),
    F('Opa Funk sagt: Kauf dir was Schönes. Am besten eine Platte. Von mir.', 'signatur'),
  ], { choices: Z }),
  knoten('warum', [
    F('Weil es nicht ums Zuhören geht. Es geht drum, dass einer redet. Solange einer redet, ist da draußen noch wer. Verstehst du?', 'trauer'),
    F('Meine Frau hat die Sendung erfunden. 2049. Damals war ich der Techniker, sie die Stimme. Sie ist seit fünfzehn Jahren tot. Ich rede für zwei. Darum klingt es manchmal, als würde ich mit mir selbst streiten.'),
  ], { choices: Z, effects: [herz(ID, 25)] }),
  knoten('vater', [
    F('Mit dem roten Koffer? Der jede Nacht um zehn angerufen hat und nur „Wetter!“ gebrüllt hat? Das war dein Vater?', 'ueberrascht'),
    F('Kind, dein Vater war mein treuester Hörer. Und mein nervigster. Grüß ihn. Und wenn er nicht mehr lebt, grüß ich ihn heute Abend selbst. Über Funk. Die Toten haben auch Antennen.'),
  ], { choices: Z, effects: [herz(ID, 40)] }),
];

const M: Menue = { zeile: F('Noch was auf dem Herzen, oder soll ich wieder auflegen?'), choices, nodes };

const T = {
  rivale: dialog('opa-funk-tag-rivale', [knoten('start', [
    F('Ah. Du. Weißt du was? Du bist auf meiner Frequenz nicht mehr erwünscht.', 'wut'),
    F('Geh mir aus dem Signal, du verdammtes Störrauschen. Ich hab schon bessere Leute aus der Leitung geworfen.'),
  ])]),
  erstes: gespraech('opa-funk-tag-erstes', [
    erz('Im Eingang des Bunkers, umgeben von Antennen wie ein Wald aus Draht, sitzt ein uralter Mann mit riesigen Kopfhörern und einem Bart, in dem Lötzinn glitzert. Vor ihm ein Pult voller Regler, Lämpchen und Kaffeeflecken.'),
    F('Psst! Wir sind auf Sendung!', 'ueberrascht'),
    erz('Er drückt einen Knopf. Ein Rotlicht geht aus.'),
    F('Jetzt nicht mehr. Willkommen bei Radio Rost, Kind. Ich bin Opa Funk. Der letzte freie Sender zwischen der Stadt und dem Meer. Eigentlich der einzige. Darum auch der beste.'),
  ], M),
  laeuft: gespraech('opa-funk-tag-frequenz', [
    F('Und? Läuft das Windrad? Steht das Relais? Ich hab schon die erste Sendung geplant. Ein Lied, ein Gruß, und dann schimpf ich zwanzig Minuten über Quantum. Das ist das Wichtigste.', 'besorgt'),
  ], M),
  frequenz: gespraech('opa-funk-tag-sendung', [
    erz('Über dem Bunker blinken jetzt Lämpchen am umgeknickten Mast. Das Windrad dreht sich, die Stoffbänder flattern. Aus jedem Lautsprecher im Antennenwald kommt Musik.'),
    F('Sie hören uns, Kind! In der Stadt! Gestern hat einer aus der Rohrsiedlung angerufen. Er wollte nur sagen, dass das Lied scheiße war. Aber er hat angerufen! Ich hab geheult.', 'freude'),
  ], M),
  nacht: gespraech('opa-funk-tag-nacht', [
    erz('Nacht vor dem Bunker. Opa Funk sitzt auf einem Klappstuhl, die Kopfhörer um den Hals, und schaut in den Himmel. Über der Ödnis sind mehr Sterne als in der ganzen Stadt Leuchtreklamen.'),
    F('Nachts sendet die Automatik. Platten in Endlosschleife. Ich hör den Sternen zu. Die senden auch. Nur sehr, sehr langsam.'),
  ], M),
  freund: gespraech('opa-funk-tag-freund', [F('Da ist ja meine Lieblingshörerin! Oder mein Lieblingshörer. Ich seh schlecht, ich hör nur gut. Setz dich, ich leg was auf.', 'freude')], M),
  epilog: gespraech('opa-funk-tag-epilog', [
    F('Hast du’s gehört? Das Meer! Ich hab einen Kanal bis an den Strand. Jeden Samstag Sendung vom Lagerfeuer. Wellenrauschen live, das macht keiner nach. Nicht mal Quantum. Die haben ja jetzt andere Sorgen.', 'freude'),
  ], M),
  standard: gespraech('opa-funk-tag-standard', [F('Hier Radio Rost. Bitte sprechen Sie nach dem Knistern.')], M),
};

/** ♥2: Abends darf man den Wetterbericht vorlesen (Minispiel akt-radio-rost oder ohne). */
const he2 = dialog('he-opa-funk-2', [
  knoten('start', [
    erz('Abendsendung. Opa Funk hustet sich die Seele aus dem Leib, das Rotlicht leuchtet, und auf dem Pult liegt ein handgeschriebener Zettel: „Wetter Ödnis“.'),
    F('Verdammt, meine Stimme! Ausgerechnet jetzt. Kind, du liest das Wetter. Los. Du bist auf Sendung. Ganz natürlich. Keiner hört zu. Außer allen.', 'besorgt'),
  ], {
    choices: [
      {
        text: 'Ans Mikrofon und den Wetterbericht live einsprechen.', tag: '[Radio]', next: 'live',
        effects: [{
          minigame: 'akt-radio-rost', level: 1, key: 'he-opa-funk-2-wetter', label: 'Wetterbericht auf Radio Rost',
          win: [herz(ID, 20), { dialogue: 'he-opa-funk-2-danach' }],
          lose: [{ dialogue: 'he-opa-funk-2-danach' }],
        }],
      },
      { text: 'Den Bericht mit Wüstenlyrik aufpeppen.', tag: '[Ausstrahlung 4]', check: pruefung('he-opa-funk-2-lyrik', 'ausstrahlung', 4, ['buehne']), next: 'lyrik' },
      { text: 'Den Zettel einfach ablesen. Wort für Wort.', next: 'ablesen' },
    ],
  }),
  knoten('live', [F('Rotlicht! Und … los!')]),
  knoten('lyrik', [
    ich('Guten Abend, Ödnis. Der Wind kommt aus Westen und hat schlechte Laune. Morgen dreißig Grad, Sand von links, Skorpione von unten. Und für alle Verliebten: Die Sterne sind gratis.'),
    F('„Die Sterne sind gratis“! Das schreib ich mir auf. Das klau ich dir. Das sag ich ab jetzt jeden Abend.', 'freude'),
  ], { next: 'ende', effects: [herz(ID, 45), { xp: 40 }] }),
  knoten('ablesen', [
    ich('Wetter Ödnis. Heiß. Wind. Sand. Nachts kalt. Ende.'),
    F('Kurz. Präzise. Ohne Gefühl. Klingt wie die Nachrichten auf NX-1. Aber ehrlicher.'),
  ], { next: 'ende', effects: [herz(ID, 30), { xp: 25 }] }),
  knoten('ende', [
    erz('Das Telefon am Pult klingelt. Ein Konvoi-Fahrer: „Wer war das? Neue Stimme? Behalten!“'),
    F('Hörst du? Die wollen dich behalten. Ich nehm dich nicht. Ich bin zu eitel. Aber du darfst wiederkommen.'),
  ], { effects: [flag('funk_wetter_gelesen'), { rep: 'aussiedler', delta: 3 }] }),
]);

/** Fortsetzung nach dem Minispiel in he-opa-funk-2. */
const he2Danach = dialog('he-opa-funk-2-danach', [
  knoten('start', [
    erz('Das Rotlicht geht aus. Opa Funk nimmt die Kopfhörer ab und sieht dich an, als hättest du gerade ein Kind entbunden. Oder einen Sender.'),
    F('Nicht schlecht für das erste Mal! Ein bisschen Zittern in der Stimme. Das mögen die Leute. Klingt nach Mensch.', 'freude'),
  ], { next: 'ende' }),
  ...he2.nodes.filter((n) => n.id === 'ende'),
]);

/** ♥4 (nach side-verlorene-frequenz): An der Plattenleine schenkt er seine Lieblingsplatte und schickt Grüße an die Stadt. */
const he4 = dialog('he-opa-funk-4', [
  knoten('start', [
    erz('Mittag an der Funkturm-Ruine. An einer Wäscheleine zwischen zwei Antennen hängen Schallplatten zum Trocknen. Opa Funk nimmt eine nach der anderen ab und hält sie gegen die Sonne.'),
    F('Seit die Stadt uns hört, kommen Briefe. Echte Briefe! Mit Konvoi, mit Tauben, einer kam in einer Flasche. Leute wünschen sich Lieder. Leute erzählen, was sie vermissen.', 'freude'),
    F('Eine Frau aus der Neon-Gasse schreibt, sie hat das erste Mal seit Jahren geweint. Wegen einem Lied. Nicht wegen der Miete. Das ist ein Fortschritt.'),
    F('Ich will dir was geben. Meine Lieblingsplatte. Aber erst musst du mir sagen, welche das ist. Rate.'),
  ], {
    choices: [
      { text: 'Die mit dem abgegriffensten Cover nehmen.', tag: '[Straße 4]', check: pruefung('he-opa-funk-4-cover', 'strasse', 4, ['beobachten']), next: 'treffer' },
      { text: 'Die Platten an der Leine nach Kratzern abhören.', tag: '[Technik 4]', check: pruefung('he-opa-funk-4-rillen', 'technik', 4, ['funk']), next: 'treffer' },
      { text: '„Keine Ahnung. Erzähl’s mir.“', next: 'erzaehl' },
    ],
  }),
  knoten('treffer', [
    F('Die! Genau die. „Funkstille“ von den Kupferkehlen, 2049. Das erste Lied, das wir je gesendet haben. Meine Frau hat sie angesagt. Man hört sie am Anfang lachen, wenn du ganz laut drehst.', 'zaertlich'),
  ], { next: 'ende', effects: [herz(ID, 20)] }),
  knoten('erzaehl', [
    F('„Funkstille“ von den Kupferkehlen, 2049. Das erste Lied, das wir je gesendet haben. Meine Frau hat sie angesagt. Man hört sie lachen, ganz am Anfang. Ich hab sie seit fünfzehn Jahren nicht mehr gespielt.', 'trauer'),
  ], { next: 'ende' }),
  knoten('ende', [
    erz('Er drückt dir die Platte in die Hände. Sie ist warm von der Sonne.'),
    F('Nimm sie. Ich brauch sie nicht mehr. Ich hab sie im Kopf. Und heute Abend sag ich in der Sendung: Grüße an die Stadt. Von der Ödnis. Von einem alten Mann, der wieder Leute zum Reden hat.'),
    ich('Ich hör zu. Versprochen.'),
    F('Das weiß ich, Kind. Das weiß ich.'),
  ], { effects: [herz(ID, 50), { give: 'vinyl-platte' }, { xp: 60 }, flag('funk_lieblingsplatte')] }),
]);

const opaFunk = weltfigur({
  id: ID,
  name: 'Opa Funk',
  unknownName: 'Alter Mann mit Kopfhörern',
  faction: 'aussiedler',
  bio: 'Sendet seit 2049 Radio Rost aus dem Bunker unter der Funkturm-Ruine, früher mit seiner Frau als Stimme, heute allein. Kopfhörer, Lötzinn im Bart, ein Spruch für jede Lage („Opa Funk sagt …“).',
  gifts: geschenke({
    loves: ['vinyl-platte', 'akkordeon-balg', 'retro-tastatur'],
    likes: ['zeitung-papier', 'synth-kaffee', 'faxpapier', 'sternkarte', 'haiku-buechlein'],
    dislikes: ['teleprompter-chip', 'mikrofon-puschel'],
    hates: ['magnet-stoerer', 'raubkopie-stick'],
  }),
  schedule: [
    ort('N', 'funkturm-ruine', 'bunker-eingang'),
    ort('*', 'funkturm-ruine', 'radio-rost-pult'),
  ],
  heartEvents: [
    { id: 'he-opa-funk-2', hearts: 2, map: 'funkturm-ruine', time: 'abend', dialogue: 'he-opa-funk-2' },
    { id: 'he-opa-funk-4', hearts: 4, map: 'funkturm-ruine', time: 'tag', when: { all: [{ seen: 'he-opa-funk-2' }, FREQUENZ] }, dialogue: 'he-opa-funk-4' },
  ],
  talk: [
    rede('opa-funk-tag-rivale', { rival: ID }),
    rede('opa-funk-tag-erstes', nichtGetroffen(ID)),
    rede('opa-funk-tag-epilog', { flag: 'epilog' }),
    rede('opa-funk-tag-frequenz', FREQUENZ_LAEUFT),
    rede('opa-funk-tag-nacht', { time: 'nacht' }),
    rede('opa-funk-tag-sendung', FREQUENZ),
    rede('opa-funk-tag-freund', { hearts: ID, min: 4 }),
    rede('opa-funk-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: opaFunk },
  dialogues: sammle(T.rivale, T.erstes, T.laeuft, T.frequenz, T.nacht, T.freund, T.epilog, T.standard, he2, he2Danach, he4),
};
