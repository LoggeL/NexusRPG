// Vega – Scharfschützin der Crew, Ausguck auf dem Dach, beste Freundin von Aria (world.md §4.2, §4.6, §11.2).
// Tagesablauf nach design/plan/act1.json (npcSchedules.vega). Herz-Ereignisse he-vega-2/4/6 in Akt 1,
// he-vega-8/10 ab Akt 2 als volle Szenen in vega-akt23.ts (dort auch Tagesgespräche, Abläufe, Telefon für Akt 2/3/Nachspiel). Rivalität re-vega-5 (Wettschießen), Versöhnung: Kaffee um 06:00 auf dem Dach.
// Auftraggeberin von side-jimmys-chip und pers-vega-adlerauge (Quests baut der Quest-Agent; hier nur Start und Verweise).
// Romanze: nein (Freundschaft). Für den Strang Vex × Aria kommentiert Vega trocken vom Ausguck aus.
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode, NpcDef } from '../../../modules/contracts';
import {
  type Menue, ARIA_WEG, MASTER, PARTYNACHT, VEX, einmalig, aktiv, dialog, done, erz, flag, herz, knoten, mindestens, neu, offen,
  pruefung, rede, sammle, sammleSzenen, sprecher, tagesgespraech, ZEIT_HINWEIS,
} from './_helfer';
import { akt23, he10, he8, menue23 } from './vega-akt23';
import { VEGA_RE, VEGA_RIVALE, vegaEvents } from './_rivalitaet';

const V = sprecher('vega');
const A = sprecher('aria');

const PROBEZEIT: Condition = done('main-1-probezeit');
const DEXTER: Condition = done('main-1-dexter');
const JIMMY_QUEST = 'side-jimmys-chip';
const ADLERAUGE = 'pers-vega-adlerauge';
const SPUREN = ['01', '02', '03', '04', '05', '06', '07', '08'].map((n) => `jimmy-spur-${n}`);
/** Ab 4 Spuren erscheint Jimmy (Gossenkinder zählen doppelt, world.md §4.2). */
const JIMMY_DA: Condition = {
  any: [
    mindestens(SPUREN, 4),
    { all: [{ origin: 'origin-gossenkind' }, mindestens(SPUREN, 2)] },
    { flag: 'jimmy_spuren_genug' },
  ],
};
const JIMMY_GERETTET: Condition = { any: [done(JIMMY_QUEST), { flag: 'jimmy_gerettet' }] };

// ---------------------------------------------------------------------------------------------- Menü

function menue(): Menue {
  const zurueck: DialogueChoice[] = [{ text: 'Noch was, Vega.', next: 'menue', id: 'zurueck' }, { text: 'Bis später.' }];
  const M23 = menue23(zurueck);

  const choices: DialogueChoice[] = einmalig('vega', [
    { text: '„Schießstand Eisenhof, Bahn drei. Du warst die mit dem Rekord, oder?“', tag: '[Ex-Wache]', when: { origin: 'origin-ex-wache' }, once: true, id: 'v-exwache', next: 'v-exwache', effects: [herz('vega', 50)] },
    { text: '„Jimmy? Der hat immer beim Lötkolben-Imbiss die scharfe Soße geklaut.“', tag: '[Gosse]', when: { origin: 'origin-gossenkind' }, once: true, id: 'v-gosse', next: 'v-gosse', effects: [herz('vega', 30), flag('vega_jimmy_imbiss')] },
    {
      text: 'Was ist eigentlich mit Jimmy passiert?', next: 'jimmy-auftrag', id: 'v-jimmy-auftrag',
      when: { all: [PROBEZEIT, offen(JIMMY_QUEST)] }, effects: [{ startQuest: JIMMY_QUEST }],
    },
    { text: 'Jimmys Spuren. Wo stehe ich?', next: 'spuren-wenig', when: { all: [aktiv(JIMMY_QUEST), { not: JIMMY_DA }] } },
    { text: 'Jimmys Spuren. Wo stehe ich?', next: 'spuren-genug', when: { all: [aktiv(JIMMY_QUEST), JIMMY_DA] } },
    {
      text: 'Du schaust so leer ohne dein Zielfernrohr.', tag: '[Vega ♥3]', requires: { hearts: 'vega', min: 3 }, next: 'adlerauge', id: 'v-adlerauge',
      when: { all: [PROBEZEIT, offen(ADLERAUGE)] }, effects: [{ startQuest: ADLERAUGE }],
    },
    { text: 'Falke. Erzähl mir noch mal, wo der wohnt.', when: aktiv(ADLERAUGE), next: 'falke' },
    { text: 'Komm mit. Ich brauch Augen.', when: { all: [DEXTER, { not: { recruited: 'vega' } }] }, next: 'rekrut', effects: [{ recruit: 'vega' }] },
    { text: 'Erzähl mir von Aria.', requires: { hearts: 'vega', min: 2 }, tag: '[Vega ♥2]', once: true, id: 'v-aria', next: 'aria', when: PROBEZEIT },
    { text: 'Wie liest man noch mal Wind?', when: { seen: 'he-vega-2' }, next: 'wind' },
    { text: 'Hast du mal danebengeschossen?', requires: { hearts: 'vega', min: 4 }, tag: '[Vega ♥4]', once: true, id: 'v-daneben', next: 'daneben' },
    { text: 'Die Planungstafel. Was meinst du?', when: { quest: 'main-1-der-plan', state: ['active', 'done'] }, once: true, id: 'v-plan', next: 'plan' },
    ...M23.choices,
    { text: 'Bis später.' },
  ]);

  const nodes: DialogueNode[] = [
    knoten('menue', [V('Ich hör zu. Mit einem Ohr. Das andere hört den Wind.')], { choices }),
    knoten('v-exwache', [
      V('Bahn drei. Zweihundert Meter, liegend, zehn von zehn.', 'ueberrascht'),
      V('Die Ausbilder haben mich danach rausgeworfen. Ich hätte zu oft auf die Zielscheibe mit dem Gesicht vom Kommandanten geschossen.'),
      V('Die Scheibe war zufällig da. Mein Finger auch.', 'signatur'),
      V('Du hast also auch mal Uniform getragen. Ich vergeb dir. Langsam. In Metern.'),
    ], { choices: zurueck }),
    knoten('v-gosse', [
      V('Die scharfe Soße. Gott. Er hat sie in Thermoskannen abgefüllt und auf dem Bahnsteig verkauft. „Heißgetränk“.', 'freude'),
      V('Wenn du ihn findest, sag „Lötkolben-Soße“. Vielleicht klingelt’s. Bei dem klingelt im Moment nur Werbung.'),
    ], { choices: zurueck }),
    knoten('jimmy-auftrag', [
      V('Jimmy. Hm.', 'besorgt'),
      V('Hat zwei Jobs gemacht. Tagsüber für Hunter, nachts für jeden, der zahlt. Irgendwann hat er an Xions Werbestand einen Gratis-Chip eingesteckt. „Gratis“, verstehst du. Das teuerste Wort der Stadt.'),
      V('Seitdem hält er sich für den Kundenservice von morgen. Er baut Türme aus Ölfässern. Er schläft im Wartehäuschen. Er erkennt keinen mehr.', 'trauer'),
      V('Hunter sagt: „Der Typ ist durch.“ Ich sag: Der berappelt sich wieder. Wenn ihn einer holt.'),
      V('Er hinterlässt Spuren. Werbezettel, Türmchen, Kreidestriche. Schrottmarkt, Rohrsiedlung, Bahnhof, Hafen, sogar unten im Kanal. Sammel genug, dann findest du ihn.'),
      V('Ich zahl dir zweihundert. Aus eigener Tasche. Und wenn du ihn kaputt machst, find ich dich. Auf jede Entfernung.', 'signatur'),
    ], { choices: zurueck }),
    knoten('spuren-wenig', [
      V('Zu wenig. Ein Zettel ist ein Zettel. Vier Zettel sind ein Muster.'),
      V('Schrottmarkt an den Lichterketten, Rohrsiedlung bei den Fässern, Bahnhof im Wartehäuschen und am Bahnsteig-Ende, Hafenkante, Kanal, Flutmauer. Er läuft immer dieselben Runden. Wie ein Uhrzeiger mit Hirnschaden.'),
    ], { choices: zurueck }),
    knoten('spuren-genug', [
      V('Genug. Das Muster steht.', 'freude'),
      V('Morgens pennt er im Wartehäuschen am Bahnhof. Tagsüber steht er am Bahnsteig-Ende und begrüßt Züge. Abends und nachts: Hafenkante, Ölfass-Türme.'),
      V('Geh abends. Da ist er am klarsten. Also: so klar wie ein Werbespot um drei Uhr nachts.'),
      V('Und bring ihn zu Dante. Nicht zu Ripper. Ripper repariert nichts, Ripper verwertet.', 'wut'),
    ], { choices: zurueck }),
    knoten('adlerauge', [
      V('Leer. Ja. Ich fühl mich nackt. Nicht die gute Sorte nackt.', 'wut'),
      V('Mein Zielfernrohr ist weg. Geklaut. Und am Hafen steht ein Quantum-Scharfschütze namens Falke und prahlt mit einem Fernrohr, das genauso aussieht wie meins. Mit meinem Kratzer. Mit meiner Gravur.'),
      V('Er lädt Leute zum Dosenschießen ein. Kran zu Kran. Rostkai. Tagsüber.'),
      V('Ich will es zurück. Sauber, wenn’s geht. Unsportlich, wenn’s muss.', 'signatur'),
    ], { choices: zurueck }),
    knoten('falke', [
      V('Hafenkante. Schießstand an den Rostkai-Kränen, tagsüber. Nachts pennt er im Wohnwagen hinter dem Kran.'),
      V('Wenn du dich nachts reinschleichst: Er schnarcht in B-Moll. Unter B-Moll hört er nichts.'),
    ], { choices: zurueck }),
    knoten('rekrut', [
      V('Augen hab ich. Zwei. Eins davon ist besser als deine beiden zusammen.', 'signatur'),
      V('Geh vor. Ich bleib hinten. Wenn du „Deckung“ hörst, ist es zu spät, aber versuch’s trotzdem.'),
    ]),
    knoten('aria', [
      V('Aria ist laut. Aria ist ehrlich. Aria haut erst und fragt dann, ob du okay bist.'),
      V('Ich hab sie mal getragen. Raus aus einer Halle, die gebrannt hat. Sie war schwerer als jedes Gewehr. Und leichter als alles, was danach kam.', 'trauer'),
      V('Den Rest erzählt sie dir selbst. Wenn sie will. Wenn nicht: frag nicht. Sie hat einen Schläger, und ich hab ein Fernrohr. Wir sehen alles.'),
    ], { choices: zurueck, effects: [herz('vega', 20)] }),
    knoten('wind', [
      V('Guck auf die Wäsche, nicht auf die Fahnen. Fahnen lügen, die hängen zu hoch.'),
      V('Rauch aus dem Gully: der wahre Wind. Lichterketten, die schaukeln: Böen. Tauben, die zu Fuß gehen: Sturm.'),
      V('Und wenn eine Plastiktüte nach oben fliegt, hat die Stadt einen schlechten Tag. Dann schießt man nicht. Dann trinkt man was.', 'signatur'),
    ], { choices: zurueck }),
    knoten('daneben', [
      V('Einmal.', 'besorgt'),
      V('Ein Drohnenrennen, Wette um fünfzig Credits. Die Drohne war ein Pixel groß. Ich hab die Werbetafel dahinter getroffen. Mitten ins Lächeln von Blade Nocturne.'),
      V('Ich zähl das nicht als daneben. Ich zähl das als Kunst.', 'freude'),
    ], { choices: zurueck, effects: [herz('vega', 20)] }),
    knoten('plan', [
      V('Der Plan ist gut. Pläne sind immer gut. Bis jemand anfängt zu improvisieren.', 'besorgt'),
      V('Ich bin auf dem Dach gegenüber. Siebenhundertzwölf Meter. Wenn’s schiefgeht, hörst du mich nicht. Du merkst nur, dass der Typ vor dir plötzlich liegt.'),
    ], { choices: zurueck }),
    ...M23.nodes,
  ];
  return { choices, nodes };
}

const M = menue();
const A23 = akt23(M);

/** Rivalität: Versöhnung mit Kaffee auf dem Dach um 06:00 (world.md §4.2). */
const RIVALE: Menue = {
  choices: [
    {
      text: 'Kaffee hinstellen. Neben das Fernrohr. Nichts sagen.', next: 'versoehnt',
      when: { all: [{ item: 'synth-kaffee' }, { clockBetween: [360, 450] }] },
      effects: [{ take: 'synth-kaffee' }, { reconcile: 'vega' }, { xp: 40 }],
    },
    { text: 'Ich hab Kaffee dabei.', when: { all: [{ item: 'synth-kaffee' }, { not: { clockBetween: [360, 450] } }] }, next: 'falsche-zeit' },
    { text: 'Schon gut.' },
  ],
  nodes: [
    knoten('versoehnt', [
      erz('Vega guckt nicht hin. Zwei Minuten lang. Dann greift sie nach dem Becher, ohne den Blick vom Horizont zu nehmen.'),
      V('Sechs Uhr. Vierzehn Grad. Westwind, leicht.'),
      V('… Danke.', 'trauer'),
      V('Fang nicht an zu reden. Wir trinken. Das reicht.'),
    ]),
    knoten('falsche-zeit', [V('Kaffee. Jetzt. Um diese Uhrzeit. Du verstehst nichts. Gar nichts. Sechs Uhr, Dach. Oder gar nicht.', 'wut')]),
  ],
};

// ---------------------------------------------------------------------------------------------- Tagesgespräche

const T = {
  rivale: tagesgespraech('vega-tag-rivale',
    [V('Du stehst in meinem Schussfeld. Absichtlich, nehm ich an.', 'wut')],
    [V('Ich hab Hunter gesagt, dass du die Lieferung am Bahnhof vergeigt hast. Hast du nicht? Pech. Er hat mir geglaubt. Ich treffe immer.', 'wut')],
    RIVALE),
  vorProbezeit: tagesgespraech('vega-tag-vor-probezeit',
    [V('Eins achtzig Ärger, schätzungsweise. Du bist die Neue. Oder der Neue. Ich hab dich seit dem Bahnhof im Visier.', 'signatur')],
    [V('Kein Grund zur Sorge. Ich hab auch die Taube da drüben im Visier. Und die lebt noch.')],
    { choices: [{ text: 'Bis später.' }], nodes: [] }),
  zeit: tagesgespraech('vega-tag-zeit',
    [V('{name}. Setz dich. Wir gucken einfach. Reden müssen wir nicht.', 'freude'), erz(ZEIT_HINWEIS)],
    [V('Es gibt eine Ausstellung in den Glasarkaden, auf die ich nicht will. Und einen Garten, den es noch nicht gibt. Irgendwann erzähl ich dir beides.')],
    M),
  // --- Vex × Aria (nur als Vex): Vega sieht alles, sagt wenig, misst gern.
  vexariaKnutsch: tagesgespraech('vega-tag-vexaria-knutsch',
    [
      V('Gasse hinterm Club. Gestern Nacht. Entfernung zum Ausguck: siebenundvierzig Meter.', 'signatur'),
      V('Ich hab nicht weggeguckt. Ich bin Scharfschützin. Ich gucke nie weg.'),
      V('Elf Minuten. Der Schläger lag die ganze Zeit auf dem Pflaster. Bei Aria ist das ein Rekord. Normalerweise legt sie ihn nicht mal zum Schlafen weg.', 'freude'),
    ],
    [
      V('Sie hat heute Morgen gesummt. Aria summt nicht. Aria brüllt. Dante hat gefragt, ob sie krank ist.'),
      V('Wenn du ihr wehtust, Postbotin, find ich dich. Das ist keine Drohung. Das ist Ballistik.', 'wut'),
    ],
    M, { effects: [flag('vega_kommentar_vexaria_knutsch'), herz('vega', 10)] }),
  vexariaOberlicht: tagesgespraech('vega-tag-vexaria-oberlicht',
    [
      V('Sie hat mir erzählt, wo du warst. Damals. Auf dem Oberlicht.', 'besorgt'),
      V('Ich war unten. Ich hab sie rausgetragen. Du warst oben und bist gerannt.'),
      V('Keiner von uns konnte was machen. Merk dir das. Ich hab drei Jahre gebraucht, um mir das zu merken.', 'trauer'),
    ],
    [V('Sie nennt dich jetzt anders, wenn du nicht da bist. Nicht „Postbotin“. Ich sag dir nicht, wie. Ich bin nicht ihr Pressesprecher.', 'signatur')],
    M, { effects: [flag('vega_kommentar_vexaria_oberlicht'), herz('vega', 20)] }),
  vexariaWette: tagesgespraech('vega-tag-vexaria-wette',
    [
      V('Ihr zwei wettet um Kurierfahrten und Inkasso. Ich hab mitgewettet.', 'signatur'),
      V('Auf Aria. Nichts Persönliches. Sie hat den längeren Arm. Den aus Metall.'),
    ],
    [V('Und ihr starrt euch an wie zwei Scharfschützen auf demselben Dach. Einer von euch muss zuerst blinzeln. Ich hab Popcorn.', 'freude')],
    M, { effects: [flag('vega_kommentar_vexaria_wette')] }),
  ariaRomanze: tagesgespraech('vega-tag-aria-romanze',
    [V('Aria hat heute dreimal deinen Namen gesagt. Einmal davon nicht als Beleidigung.', 'signatur')],
    [V('Ich hab ihr gesagt, sie soll’s dir selbst sagen. Sie hat gesagt, ich soll mich verpissen. Das heißt bei ihr: „Ja, gleich.“')],
    M, { effects: [flag('vega_kommentar_aria_romanze')] }),
  jimmyDanke: tagesgespraech('vega-tag-jimmy-danke',
    [
      V('Du hast ihn geholt.', 'freude'),
      V('Er hat mir heute Morgen eine Volt-Limo gebracht. Ungefragt. Mit Strohhalm. Und hat „Bitte sehr“ gesagt statt „Ihre Bestellung wird bearbeitet“.'),
      V('Ich hab mich hingesetzt. Ich setz mich sonst nie hin.', 'trauer'),
    ],
    [V('Die zweihundert hast du. Und das hier: Ich schulde dir was. Ich hasse es, was zu schulden. Also lass dir Zeit mit dem Einfordern.')],
    M, { effects: [flag('vega_kommentar_jimmy'), herz('vega', 20)] }),
  bahnhof: tagesgespraech('vega-tag-bahnhof',
    [V('Psst. Ich bring Jimmy Essen. Nudeln, scharf. Stell ich auf die Bank und geh. Wenn er mich sieht, will er mich „beraten“.', 'besorgt')],
    [V('Letzte Woche hat er mir eine Versicherung gegen Regen verkauft. Ich hab unterschrieben. Mit „Vega“. Er hat sich bedankt. Für drei Sekunden war er fast er selbst.', 'trauer')],
    M),
  wachplan: tagesgespraech('vega-tag-wachplan',
    [V('Nicht so laut. Ich zähle Wachen. Campus-Zaun, Schichtwechsel alle neunzig Minuten. Der Dicke am Tor isst um halb acht.', 'signatur')],
    [V('Von hier sieht man alles. Die Brücke ist der beste Platz in der Stadt, um Leute zu beobachten, die sich für wichtig halten.')],
    M),
  morgen: tagesgespraech('vega-tag-morgen',
    [V('Sechs Grad zu kalt, drei Knoten Wind aus Südost. Guter Morgen. Für Tauben.')],
    [V('Siehst du den Kran am Hafen? Vierhundertzwanzig Meter. Da sitzt jeden Morgen eine Möwe und guckt mich an. Wir haben ein Abkommen.', 'signatur')],
    M),
  nacht: tagesgespraech('vega-tag-nacht',
    [V('Smog ist dünn heute. Man sieht drei Sterne. Zwei davon sind Satelliten. Einer ist ein Flugtaxi. Romantik in der Unterstadt.')],
    [V('Ich schlaf hier oben. Unten ist es zu laut. Oben ist es auch laut. Aber oben ist der Lärm weiter weg.')],
    M),
  club: tagesgespraech('vega-tag-club',
    [
      V('Setz dich. Nicht da, da sitzt Aria. Nicht da, da liegt Arias Schläger. Da. Neben dem Untersetzer.'),
      A('Hey! Wer redet da über meinen Schläger?', 'signatur'),
      V('Niemand, Aria. Trink weiter.'),
    ],
    [V('Aria hat heute drei Leute verprügelt und einem die Tür aufgehalten. Ein guter Tag. Für sie ist das Diplomatie.', 'freude')],
    M),
  markt: tagesgespraech('vega-tag-markt',
    [V('Garküche. Bank. Nudeln. Ich sitz hier, weil man von hier alle drei Ausgänge sieht. Und weil die Nudeln gut sind.')],
    [V('Der Typ mit der Hütchen-Nummer schummelt. Kugel im linken Ärmel. Ich sag’s keinem. Ist besser als Fernsehen.', 'signatur')],
    M),
  vertraut: tagesgespraech('vega-tag-vertraut',
    [V('{name}. Ich hab dir einen Platz am Geländer freigehalten. Zweiter von links. Bester Wind.', 'freude')],
    [V('Weißt du, warum ich Scharfschützin geworden bin? Weil man aus der Entfernung niemanden enttäuschen kann. Bei dir klappt das nicht. Du kommst immer so nah ran.')],
    M),
  standard: tagesgespraech('vega-tag-standard',
    [V('Achtzehn Meter, seit du um die Ecke gekommen bist. Jetzt zwei. Was gibt’s?')],
    [V('Ich hab heute einen Typen beobachtet, der viermal an derselben Tür geklingelt hat. Beim fünften Mal hat er gemerkt, dass es seine eigene ist. Die Stadt ist ein Zoo.')],
    M),
};

// ---------------------------------------------------------------------------------------------- Herz-Ereignisse

const WIND_BUFF = { checkBuff: { id: 'vega-wind', label: 'Vegas Windregel', value: 1, attribute: 'reflexe' as const, tags: ['fernkampf'], consumes: true } };

const he2 = dialog('he-vega-2', [
  knoten('start', [
    erz('Dachterrasse. Vega liegt bäuchlings am Geländer, das Gewehr ohne Munition, nur zum Gucken. Neben ihr ein Windmesser, der aussieht wie ein Spielzeug aus Bierdeckeln.'),
    V('Leg dich hin. Nein, nicht da, da liegt mein Windmesser. Da.'),
    V('Siehst du die Lichterkette über dem Kiosk? Sag mir, wohin der Wind geht. Nicht raten. Lesen.'),
  ], {
    choices: [
      { text: '„Die Wäsche im dritten Stock flattert nach Osten. Die Lichterkette lügt, die hängt im Windschatten.“', check: pruefung('he-vega-2-wind', 'reflexe', 5, ['fernkampf', 'beobachten']), next: 'gut', effects: [herz('vega', 40)] },
      { text: '„Dein Windmesser ist verbogen. Der zeigt zwei Grad zu weit links.“', check: pruefung('he-vega-2-windmesser', 'technik', 4, ['reparieren']), next: 'messer', effects: [herz('vega', 35)] },
      { text: '„Ich hab keine Ahnung. Zeig’s mir.“', next: 'lernen', effects: [herz('vega', 25)] },
      { text: '„Nach links. Glaub ich. Oder rechts.“', next: 'falsch', effects: [herz('vega', 10)] },
    ],
  }),
  knoten('gut', [
    V('… Richtig.', 'ueberrascht'),
    V('Die meisten gucken auf die Fahnen. Fahnen lügen. Wäsche lügt nie. Wäsche hat nichts zu verlieren.', 'freude'),
  ], { next: 'jimmy' }),
  knoten('messer', [
    erz('Du drückst die Blechfahne mit dem Daumen gerade. Der Zeiger zittert und springt zwei Striche nach rechts.'),
    V('Zwei Grad. Seit drei Wochen. Ich hab drei Wochen lang zwei Grad danebengezielt und es auf den Smog geschoben.', 'wut'),
    V('Danke. Sag’s keinem. Vor allem nicht Aria. Die macht ein Lied draus.'),
  ], { next: 'jimmy' }),
  knoten('lernen', [
    V('Gut. Wer zugibt, dass er nichts weiß, lebt länger als die, die raten.'),
    V('Guck auf den Gully. Der Dampf. Siehst du, wie er sich legt, nach Osten? Das ist der Wind da unten. Oben ist er anders. Immer.'),
  ], { next: 'jimmy' }),
  knoten('falsch', [
    V('Oder geradeaus, oder in den Himmel. Du hast gerade jede Richtung genannt außer der richtigen.', 'signatur'),
    V('Egal. Hinlegen kannst du schon mal. Das ist die halbe Miete.'),
  ], { next: 'jimmy' }),
  knoten('jimmy', [
    erz('Eine Weile liegt ihr nur da. Unten schreit jemand ein Angebot für gebrauchte Nieren. Vega zielt mit dem leeren Gewehr auf den Bahnhof.'),
    V('Da drüben, am Bahnsteig-Ende. Da steht Jimmy jeden Tag und begrüßt Züge.', 'besorgt'),
    V('Früher hat er hier oben neben mir gelegen. Er konnte keinen Wind lesen. Er hat einfach Witze erzählt, bis ich danebengeschossen hab.'),
    V('Alle sagen, der kommt nicht wieder. Ich sag: Der berappelt sich. Ich bin die Einzige. Ist das dumm?', 'trauer'),
  ], {
    choices: [
      { text: '„Nicht dumm. Loyal. Das ist was anderes.“', next: 'ende-loyal', effects: [herz('vega', 30)] },
      { text: '„Ich hab ihn von früher gekannt. Der ist zäher, als er aussieht.“', tag: '[Gosse]', when: { origin: 'origin-gossenkind' }, next: 'ende-gosse', effects: [herz('vega', 40)] },
      { text: '„Dann holen wir ihn zurück.“', next: 'ende-holen', effects: [herz('vega', 30)] },
      { text: '„Manche kommen nicht wieder, Vega.“', next: 'ende-hart', effects: [herz('vega', 5)] },
    ],
  }),
  knoten('ende-loyal', [V('Loyal. Hm. Klingt besser als dumm. Bleibt aber dasselbe.', 'freude')], { next: 'ende' }),
  knoten('ende-gosse', [
    V('Du kennst ihn? Dann weißt du, dass er mal einen Kanaldeckel mit bloßen Händen hochgehoben hat, um einer Katze zu helfen.', 'ueberrascht'),
    V('Die Katze hat ihn gekratzt. Er hat sich bedankt. So ist Jimmy.', 'freude'),
  ], { next: 'ende' }),
  knoten('ende-holen', [V('„Wir.“ Das sagt sich so leicht. Aber gut. Ich halte dich beim Wort. Ich halte alles beim Wort. Auf jede Entfernung.', 'signatur')], { next: 'ende' }),
  knoten('ende-hart', [V('Kann sein. Dann irre ich mich. Ich irre mich selten. Aber wenn, dann richtig.', 'wut')], { next: 'ende' }),
  knoten('ende', [
    V('Merk dir die Wäsche. Beim nächsten Schuss, den du machst, denk an die Wäsche.'),
    erz('Vegas Windregel: +1 auf deinen nächsten Fernkampf- oder Beobachtungs-Check.'),
  ], {
    effects: [WIND_BUFF, { xp: 40 }, flag('vega_wind_gelernt')],
    choices: [
      { text: 'Was kann ich für Jimmy tun?', when: { all: [PROBEZEIT, offen(JIMMY_QUEST)] }, next: 'auftrag', effects: [{ startQuest: JIMMY_QUEST }] },
      { text: 'Danke, Vega.' },
    ],
  }),
  knoten('auftrag', [
    V('Spuren sammeln. Er hinterlässt welche wie ein Kind Krümel. Werbezettel, Ölfass-Türmchen, Kreide. Ab vier hast du sein Muster.'),
    V('Dann holst du ihn. Ohne ihn kaputt zu machen. Zweihundert Credits, von mir.'),
  ]),
]);

const he4 = dialog('he-vega-4', [
  knoten('start', [
    erz('Nacht. Das zurückgeholte Zielfernrohr sitzt wieder auf dem Gewehr, poliert, bis es spiegelt. Vega winkt dich heran, ohne den Blick zu heben.'),
    V('Komm. Guck durch. Nicht anfassen, nur gucken. Fettfinger, und ich wirf dich runter. Liebevoll.'),
    V('Weißt du, was ich sehe, wenn ich durch das Ding schaue? Nicht Ziele. Die Stadt. Als Sternbild.', 'freude'),
  ], {
    choices: [
      {
        text: 'Durchschauen und die Lichter verbinden.', next: 'bild',
        effects: [{
          minigame: 'akt-sternegucken', level: 2, key: 'he-vega-4-sternbild', label: 'Die Stadt als Sternbild',
          win: [herz('vega', 30), { message: 'Du verbindest Kiosk, Kran und Club zu einem schiefen Stern. Vega nickt. Das ist bei ihr Applaus.' }],
          lose: [herz('vega', 10), { message: 'Du hast ein Flugtaxi und zwei Laternen erwischt. Vega: „Auch ein Sternbild. Heißt Pech.“' }],
        }],
      },
      { text: 'Lieber zuhören, was sie sieht.', next: 'bild', effects: [herz('vega', 20)] },
    ],
  }),
  knoten('bild', [
    V('Da. Die drei Lichter am Hafen sind der Gürtel. Der Club ist das Herz, weil er pulsiert. Der Bahnhof ist der Kopf, weil da nie einer zur Ruhe kommt.'),
    V('Und ganz unten, das blaue Flackern? Das ist die Flutmauer. Nyra sitzt da jeden Abend und wartet aufs Meer. Ich nenn den Stern „Geduld“.', 'trauer'),
    V('Jetzt du. Welcher Stern bist du?'),
  ], {
    choices: [
      { text: '„Der Kanaldeckel da. Jeder tritt drauf, keiner fällt rein.“', check: pruefung('he-vega-4-strasse', 'strasse', 5, ['witz', 'geruecht']), next: 'deckel', effects: [herz('vega', 40)] },
      { text: '„Der Kran. Steht im Weg, hält aber alles.“', next: 'kran', effects: [herz('vega', 30)] },
      { text: '„Die Lichterkette über deinem Ausguck. Damit du nicht allein leuchtest.“', check: pruefung('he-vega-4-ausstrahlung', 'ausstrahlung', 5, ['trost']), next: 'kette', effects: [herz('vega', 50)] },
      { text: '„Gar keiner. Ich bin der Smog.“', next: 'smog', effects: [herz('vega', 15)] },
    ],
  }),
  knoten('deckel', [V('Der Kanaldeckel. Ehrlich, bescheiden, riecht ein bisschen. Passt.', 'freude')], { next: 'ende' }),
  knoten('kran', [V('Der Kran. Rostig, stur, und jeden Morgen sitzt eine Möwe drauf, die ich mag. Okay. Du bist der Kran.', 'signatur')], { next: 'ende' }),
  knoten('kette', [
    erz('Vega sagt eine ganze Weile nichts. Dann rückt sie zwei Zentimeter zur Seite, damit du mehr Platz am Geländer hast.'),
    V('… Das war kitschig. Ich hab’s trotzdem gespeichert.', 'trauer'),
  ], { next: 'ende' }),
  knoten('smog', [V('Der Smog. Überall, keiner mag ihn, und ohne ihn würde man die Sterne nicht so vermissen. Na gut. Du bist der Smog. Mein Lieblingssmog.', 'signatur')], { next: 'ende' }),
  knoten('ende', [
    V('Ich hab das Fernrohr wegen dir zurück. Ich vergess das nicht. Nicht auf achthundert Meter, nicht auf zwei.'),
    erz('Vega trägt dein Sternbild in ihre zerknitterte Sternkarte ein. In Bleistift. Daneben: „{name}“.'),
  ], { effects: [flag('vega_sternbild'), { xp: 80 }] }),
]);

const he6 = dialog('he-vega-6', [
  knoten('start', [
    erz('Der Tisch von Vega und Aria. Zwei Gläser, ein Schläger, eine Stimmung wie kurz vor einem Gewitter. Aria hat einen frischen Verband über dem Echtarm.'),
    A('Es war ein DACH, Vega. Kein Hochhaus. Ein DACH.', 'wut'),
    V('Fünfzehn Meter. Fünfzehn. Ich hab’s gemessen. Du bist gesprungen, ohne zu gucken.', 'wut'),
    A('Ich hab geguckt! Ich hab gesehen, dass der Arsch mit Hunters Kohle wegrennt!'),
    V('Du hast gesehen, was du sehen wolltest. Wie immer. Ich hab dich schon einmal irgendwo rausgetragen.', 'trauer'),
    erz('Aria wird still. Das ist bei Aria lauter als Schreien. Beide drehen sich zu dir.'),
    A('Du. Sag ihr, dass ich recht hab.'),
    V('Sag ihr, dass sie ein Idiot ist.'),
  ], {
    choices: [
      { text: '„Ihr habt beide Angst. Nur in verschiedenen Lautstärken.“', check: pruefung('he-vega-6-vermitteln', 'ausstrahlung', 5, ['trost', 'ueberreden']), next: 'vermittelt', effects: [herz('vega', 50), herz('aria', 30)] },
      { text: '„Zöpfe. Setz dich. Sie hat recht, und du weißt das.“', tag: '[Vex]', when: VEX, next: 'vex', effects: [herz('vega', 40), herz('aria', 20)] },
      { text: 'Den Schläger vom Tisch nehmen und zwischen die beiden legen. „Wer zuerst danach greift, zahlt die Runde.“', check: pruefung('he-vega-6-schlaeger', 'koerper', 5, ['einschuechtern']), next: 'schlaeger', effects: [herz('vega', 40), herz('aria', 30), { credits: -12 }] },
      { text: '„Aria, du bist leichtsinnig.“', next: 'vega-recht', effects: [herz('vega', 30), herz('aria', -20)] },
      { text: '„Vega, lass sie. Sie ist erwachsen.“', next: 'aria-recht', effects: [herz('vega', -10), herz('aria', 20)] },
    ],
  }),
  knoten('vermittelt', [
    erz('Stille. Dann schnaubt Aria. Vega guckt in ihr Glas. Beide gleichzeitig: „Ich hab keine Angst.“'),
    erz('Dann gucken sie sich an. Und lachen. Erst Aria, laut und schief. Dann Vega, ganz leise, wie ein Schuss mit Schalldämpfer.'),
    A('Scheiße. Du bist gut. Das ist unheimlich.', 'freude'),
    V('Ich hab Angst, dass ich dich irgendwann nicht mehr tragen kann.', 'trauer'),
    A('Dann trägst du mich halt nicht. Dann zieh ich dich. Am Ohr. Wie immer.'),
  ], { next: 'ende' }),
  knoten('vex', [
    erz('Aria starrt dich an. Dann setzt sie sich. Sehr langsam. Wie jemand, der sich das nicht vorschreiben lässt und es trotzdem tut.'),
    A('… Ich setz mich, weil ICH mich setzen will. Nicht, weil du’s sagst, Postbotin.', 'wut'),
    V('Interessant. Mir hat sie das noch nie geglaubt.', 'signatur'),
    A('Halt die Klappe, Vega.'),
    V('Fünfzehn Meter, Aria. Nächstes Mal ruf mich an. Oder sie. Die rennt schneller als du fällst.'),
    erz('Unter dem Tisch stößt Arias Stiefel gegen deinen. Bleibt da. Zufall, sagt ihr Gesicht. Kein Zufall, sagt der Stiefel.'),
  ], { next: 'ende' }),
  knoten('schlaeger', [
    erz('Du legst den Schläger quer über den Tisch, genau zwischen die Gläser. Arias Finger zucken. Vegas auch.'),
    A('Das ist mein Schläger.', 'wut'),
    V('Das ist ihr Schläger.'),
    erz('Keine greift zu. Eine Minute. Zwei. Dann prustet Aria los und schiebt dir ihr Glas hin.'),
    A('Okay. Okay! Du zahlst trotzdem. Weil du so dramatisch warst.', 'freude'),
    erz('Du zahlst die Runde. Zwölf Credits für den Frieden. Billiger wird’s nicht.'),
  ], { next: 'ende' }),
  knoten('vega-recht', [
    A('Ach, so ist das. Zwei gegen einen. Toll. Ganz toll.', 'wut'),
    V('Nicht zwei gegen einen. Zwei für einen. Für dich, du Holzkopf.'),
    A('… Holzkopf. Na gut. Holzkopf mit Metallarm. Das ist ein Upgrade.'),
  ], { next: 'ende' }),
  knoten('aria-recht', [
    V('Erwachsen. Klar. Erwachsene springen von Dächern, weil einer mit Geld wegrennt.', 'wut'),
    A('Siehst du? Sie versteht mich!', 'freude'),
    V('Sie versteht gar nichts. Aber gut. Ich halt jetzt die Klappe und mess weiter.'),
  ], { next: 'ende' }),
  knoten('ende', [
    erz('Später, als Aria tanzt, rückt Vega zu dir.'),
    V('Danke. Die meisten gehen, wenn wir so sind. Du bist geblieben.'),
    V('Wenn du mit uns beiden rausgehst, und wir uns mögen … dann sind wir die Wachhunde. Dann hat keiner mehr eine Chance.', 'signatur'),
  ], { effects: [flag('vega_aria_versoehnt'), { xp: 90 }] }),
]);

// ♥8 und ♥10: volle Szenen in vega-akt23.ts.

// Rivalität −5: Wettschießen am Rostkai.
const re5 = dialog('re-vega-5', [
  knoten('start', [
    V('Du. Kran zu Kran. Zehn Dosen. Wer verliert, hält für immer die Klappe in meiner Nähe.', 'wut'),
  ], {
    choices: [
      {
        text: 'Annehmen.', next: 'ende',
        effects: [{
          minigame: 'akt-schiessstand', level: 4, key: 're-vega-5-duell', label: 'Wettschießen gegen Vega',
          win: [herz('vega', 60), { message: 'Neun zu acht. Vega starrt auf die letzte Dose. „Glück.“ Aber ihr Mundwinkel zuckt.' }],
          lose: [herz('vega', 20), { message: 'Zehn zu vier. Vega senkt das Gewehr. „Wenigstens hast du dich getraut.“' }],
        }],
      },
      { text: '„Ich schieß nicht gegen dich, Vega.“', next: 'ablehnen', effects: [herz('vega', 30)] },
    ],
  }),
  knoten('ende', [V('Wir sind nicht quitt. Aber wir sind näher dran. Sechs Uhr. Dach. Du weißt, was das heißt.')]),
  knoten('ablehnen', [V('… Feige. Oder klug. Ich entscheid mich morgen. Sechs Uhr. Dach.', 'besorgt')]),
]);

// ---------------------------------------------------------------------------------------------- Figur

const vega: NpcDef = {
  id: 'vega',
  name: 'Vega',
  portrait: 'vega',
  sprite: 'vega-walk',
  faction: 'crew-hunter',
  bio: 'Scharfschützin der Crew. Ruhig, loyal, beste Freundin von Aria, zählt Entfernungen in Metern. Glaubt als Einzige, dass Jimmy sich wieder berappelt. Wohnt praktisch auf der Dachterrasse der Neon-Gasse.',
  gifts: {
    loves: ['zielfernrohr-linse', 'sternkarte', 'edelbrause'],
    likes: ['neon-limo', 'bao-dampfnudel', 'murmelbeutel', 'kapuzenpulli', 'dantes-kekse', 'echtobst-apfel', 'hofhonig'],
    dislikes: ['liebesroman', 'raubkopie-stick'],
    hates: ['defekter-neurochip', 'rostige-dose', 'virus-implantat'],
  },
  schedule: [
    // Akt 2, Partynacht, Nachspiel (vega-akt23.ts).
    ...A23.schedule,
    // Vorbereitung Wachplan: abends auf der Fußgängerbrücke am Stufenplatz.
    { slot: 'abend', when: aktiv('prep-wachplan'), place: { map: 'stufenplatz', at: 'fussgaengerbruecke' } },
    { slot: 'morgen', place: { map: 'neon-gasse', at: 'vegas-ausguck' } },
    // Mo/Mi/Fr bringt sie Jimmy Essen – bis er gerettet ist.
    { slot: 'tag', days: ['mo', 'mi', 'fr'], when: { all: [{ not: JIMMY_GERETTET }, { notFlag: 'jimmy_gechippt' }] }, place: { map: 'bahnhof-mitte', at: 'bahnsteig-ende' }, dialogue: 'vega-tag-bahnhof' },
    { slot: 'tag', place: { map: 'schrottmarkt', at: 'garkueche-bank' } },
    { slot: 'abend', place: { map: 'high-voltage', at: 'vega-aria-tisch' } },
    { slot: 'nacht', place: { map: 'neon-gasse', at: 'vegas-ausguck' } },
  ],
  heartEvents: [
    { id: 'he-vega-2', hearts: 2, map: 'neon-gasse', time: ['morgen', 'nacht'], when: PROBEZEIT, dialogue: 'he-vega-2' },
    { id: 'he-vega-4', hearts: 4, map: 'neon-gasse', time: 'nacht', when: done(ADLERAUGE), dialogue: 'he-vega-4' },
    { id: 'he-vega-6', hearts: 6, map: 'high-voltage', time: 'abend', when: { all: [PROBEZEIT, { not: ARIA_WEG }, { notFlag: 'aria_weg' }, { not: PARTYNACHT }] }, cutscene: 'szene-he-vega-6', dialogue: 'he-vega-6' },
    { id: 'he-vega-8', hearts: 8, map: 'glasarkaden', time: 'abend', when: { all: [{ act: 2 }, { not: PARTYNACHT }, { not: MASTER }] }, dialogue: 'he-vega-8' },
    { id: 'he-vega-10', hearts: 10, map: 'neon-gasse', time: 'morgen', when: { all: [{ act: 2 }, { seen: 'he-vega-8' }, { not: PARTYNACHT }, { not: MASTER }] }, dialogue: 'he-vega-10' },
    { id: 're-vega-5', hearts: -5, map: 'hafenkante', time: 'tag', when: { not: PARTYNACHT }, dialogue: 're-vega-5' },
    // Rivalität −2 (keine Hinweise mehr) und −8 (petzt bei Hunter): _rivalitaet.ts.
    ...vegaEvents({ all: [PROBEZEIT, { not: PARTYNACHT }, { not: MASTER }] }),
  ],
  companion: {
    // world.md §4.6: ab main-1-dexter (schon während des Einsatzes, damit der Treffpunkt-Dialog sie holt). Fernkampf.
    recruit: { quest: 'main-1-dexter', state: ['active', 'done'] },
    stats: {
      hp: 40, armor: 1, morale: 85,
      attributes: { technik: 4, koerper: 3, reflexe: 7, ausstrahlung: 3, strasse: 5 },
      weapon: { kind: 'fernkampf', damage: 8, range: 8, hit: 5 },
      abilities: ['vega-adlerauge', 'vega-kobra-schuss'],
    },
    heartAbilities: [{ hearts: 6, ability: 'vega-wachhund' }],
    // Nach pers-vega-adlerauge: verstärkter Kobra-Schuss.
    abilityRules: [{ when: { quest: 'pers-vega-adlerauge', state: 'done' }, replace: ['vega-kobra-schuss', 'vega-kobra-schuss-plus'] }],
    // Vega + Nyra: Funkstille (beide in der Party, Spielfigur mit beiden ♥6).
    // Nach he-vega-10: „Die Wachhunde“ mit Doppelschuss (Vega hält die verstärkte Fassung, Aria behält ihre).
    duo: [
      { ability: 'duo-funkstille', when: { all: [{ companion: 'nyra' }, { hearts: 'vega', min: 6 }, { hearts: 'nyra', min: 6 }] } },
      { ability: 'duo-die-wachhunde-plus', when: { all: [{ companion: 'aria' }, { flag: 'vega_wachhunde_verstaerkt' }, { hearts: 'vega', min: 6 }, { hearts: 'aria', min: 6 }] } },
    ],
  },
  // Rivalität: Vega gibt keine Hinweise mehr (world.md §4.2).
  partyCheckBonus: [
    { attribute: 'reflexe', tags: ['fernkampf', 'beobachten'], value: 1, label: 'Vega gibt dir Wind und Meter', when: { not: VEGA_RIVALE } },
    { attribute: 'strasse', tags: ['verstecke'], value: 1, label: 'Vega hat es von oben gesehen', when: { not: VEGA_RIVALE } },
  ],
  talk: [
    rede('vega-tag-rivale', { rival: 'vega' }),
    // Akt 2, Partynacht, Nachspiel (vega-akt23.ts).
    ...A23.talk,
    rede('vega-tag-vor-probezeit', { not: PROBEZEIT }),
    rede('vega-tag-jimmy-danke', { all: [JIMMY_GERETTET, { notFlag: 'vega_kommentar_jimmy' }] }),
    rede('vega-tag-vexaria-knutsch', { all: [VEX, { flag: 'vexaria_knutsch' }, { notFlag: 'vega_kommentar_vexaria_knutsch' }] }),
    rede('vega-tag-vexaria-oberlicht', { all: [VEX, { flag: 'vexaria_oberlicht' }, { notFlag: 'vega_kommentar_vexaria_oberlicht' }] }),
    rede('vega-tag-vexaria-wette', { all: [VEX, { flag: 'vexaria_wette' }, { notFlag: 'vega_kommentar_vexaria_wette' }] }),
    rede('vega-tag-aria-romanze', { all: [{ not: VEX }, { flag: 'aria_romanze_angebahnt' }, { notFlag: 'vega_kommentar_aria_romanze' }] }),
    rede('vega-tag-zeit', { not: { act: 2 } }, 8),
    rede('vega-tag-wachplan', { all: [aktiv('prep-wachplan'), { time: 'abend' }] }),
    rede('vega-tag-bahnhof', { all: [{ not: JIMMY_GERETTET }, { notFlag: 'jimmy_gechippt' }, { weekday: ['mo', 'mi', 'fr'] }, { time: 'tag' }] }),
    rede('vega-tag-vertraut', { time: ['morgen', 'nacht'] }, 6),
    rede('vega-tag-morgen', { time: 'morgen' }),
    rede('vega-tag-nacht', { time: 'nacht' }),
    rede('vega-tag-club', { time: 'abend' }),
    rede('vega-tag-markt', { time: 'tag' }),
    rede('vega-tag-standard'),
  ],
};

export const part: ContentPart = {
  npcs: { vega },
  dialogues: sammle(
    T.rivale, T.vorProbezeit, T.zeit, T.vexariaKnutsch, T.vexariaOberlicht, T.vexariaWette, T.ariaRomanze, T.jimmyDanke,
    T.bahnhof, T.wachplan, T.morgen, T.nacht, T.club, T.markt, T.vertraut, T.standard,
    he2, he4, he6, he8, he10, re5, ...VEGA_RE, ...A23.dialogues.filter((d) => d.id !== he8.id && d.id !== he10.id),
  ),
  cutscenes: sammleSzenen({
    id: 'szene-he-vega-6', title: 'Fünfzehn Meter',
    beats: [
      { image: 'cut-he-vega-6', pan: 'in', fade: 'in', caption: 'High Voltage, Ecktisch. Zwei Freundinnen, ein Schläger, kein Frieden.', hold: 1600 },
    ],
  }),
  phone: {
    ...A23.phone,
    'tel-vega-dach': {
      id: 'tel-vega-dach', from: 'vega',
      text: 'Dach. Morgens oder nachts. Bring nichts mit, was raschelt. – V.',
      auto: { all: [{ hearts: 'vega', min: 2 }, PROBEZEIT, neu('he-vega-2')] },
    },
    'tel-vega-sterne': {
      id: 'tel-vega-sterne', from: 'vega',
      text: 'Fernrohr ist wieder da. Heute Nacht ist der Smog dünn. Komm hoch. Fettfinger bleiben unten.',
      auto: { all: [{ hearts: 'vega', min: 4 }, done(ADLERAUGE), neu('he-vega-4')] },
    },
    'tel-vega-aria': {
      id: 'tel-vega-aria', from: 'vega',
      text: 'Aria und ich haben Krach. Du bist neutral. Komm abends ins HV. Bring Nerven mit. Und Kleingeld.',
      auto: { all: [{ hearts: 'vega', min: 6 }, PROBEZEIT, neu('he-vega-6')] },
      replies: [{ text: 'Bin unterwegs.' }, { text: 'Warum ich?!' }],
    },
  },
};
