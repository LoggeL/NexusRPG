// Die Glasbläserin – Glaswerkstatt in den Glasdünen (world.md §3.5 glasduenen, §4.5, §6.3 side-glasherz;
// act23.json npcSchedules/events). Laden `glaswerkstatt` (maps-23/shops-oednis-hof.ts). Questdialoge (gestohlenes
// Skorpion-Ei, Königin, Brösel) bauen die Quest-Pakete. Eigene Erfindung: Sie hat früher das Glas der Oberstadt gemacht.
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode } from '../../../modules/contracts';
import {
  type Menue, dialog, erz, flag, geschenke, gespraech, herz, knoten, nichtGetroffen, ort, pruefung, rede, sammle,
  sprecher, weg, weltfigur, zurueck,
} from './_oednis';

const ID = 'glasblaeserin';
const G = sprecher(ID);
const Z = zurueck('Noch was.', 'Ich lass dich arbeiten.');

const GLASHERZ_LAEUFT: Condition = { quest: 'side-glasherz', state: 'active' };
const GLASHERZ: Condition = { quest: 'side-glasherz', state: 'done' };

const choices: DialogueChoice[] = [
  { text: 'Was verkaufst du?', next: 'laden', effects: [{ shop: 'glaswerkstatt' }] },
  { text: 'Woher kommt das ganze Glas hier?', next: 'duenen' },
  { text: 'Wie heißt du eigentlich?', next: 'name' },
  { text: 'Was ist mit den Skorpionen?', next: 'skorpione' },
  { text: 'Wo ist das Ei jetzt? Hast du eine Spur?', when: GLASHERZ_LAEUFT, next: 'ei' },
  { text: '„Kommst du nie in die Stadt?“', tag: '[Glasbläserin ♥3]', requires: { hearts: ID, min: 3 }, once: true, id: 'glas-stadt', next: 'stadt' },
  { text: '„Meine Großmutter hat aus Dünenglas Perlen gemacht. Mit Kaktussaft als Kleber.“', tag: '[Ödnis]', when: { origin: 'origin-oednis' }, once: true, id: 'glas-oednis', next: 'oma' },
  { text: 'Ich lass dich arbeiten.' },
];

const nodes: DialogueNode[] = [
  knoten('laden', [G('Muscheln aus Glas, für Leute, die das Meer nicht sehen können. Perlen, für Leute, die was Glänzendes in der Tasche brauchen. Und Glück. Glück ist gratis, man muss es nur heil nach Hause bringen.')]),
  knoten('duenen', [
    G('Hier stand mal eine Testanlage. Oberstadt-Energie, 2058. Irgendwas mit Sonnenspiegeln und zu viel Ehrgeiz. Ein Mittag lang war es hier heißer als in der Sonne. Danach war der Sand Glas.'),
    G('Keiner hat sich entschuldigt. Aber jetzt ist es schön. So läuft das mit den meisten Katastrophen. Wenn man lange genug wartet.'),
  ], { choices: Z }),
  knoten('name', [
    G('Hab keinen mehr. Hab ihn in der Stadt gelassen, zusammen mit dem Rest. Hier draußen sagen alle „die Glasbläserin“. Das reicht. Ich bin die Einzige.'),
    G('Wenn du mich rufen willst, klopf an ein Glas. Ich hör das. Ich hör jedes Glas, das klingt.'),
  ], { choices: Z }),
  knoten('skorpione', [
    G('Glasskorpione. Durchsichtige Panzer, giftige Laune. Sie nisten in den warmen Dünen hinter der Werkstatt. Wir haben eine Abmachung: Ich mach keinen Lärm, sie stechen mich nicht.'),
    G('Die Königin ist so groß wie ein Kleinwagen. Wenn du sie siehst, dreh dich nicht um, renn nicht, sing nicht. Am besten: Sei woanders.', 'besorgt'),
  ], { choices: Z }),
  knoten('ei', [
    G('Einer hat ihr Ei aus dem Nest geklaut. Einer mit Stiefeln, die nach Wasser riechen. Wer hier draußen riecht nach Wasser? Nur einer. Der, der es verkauft.', 'wut'),
    G('Brösel. Sein Stand ist an der Staubstraße. Und wenn er das Ei hat, hat er es nicht bei sich. Er versteckt Sachen in den Dünen. Wie ein Hund. Ein Hund mit Hut.'),
  ], { choices: Z }),
  knoten('stadt', [
    G('Nein. In der Stadt sieht man durch kein Fenster mehr durch. Man sieht nur sich selbst. Und dahinter sitzt einer und schaut zurück.'),
    G('Frag mich nicht weiter. Noch nicht.', 'trauer'),
  ], { choices: Z, effects: [herz(ID, 20)] }),
  knoten('oma', [
    G('Kaktussaft! Das hält nicht. Das klebt drei Tage, dann fällt alles ab, und die Perlen rollen in den Sand.', 'ueberrascht'),
    G('Darum findet man hier draußen überall Perlen. Deine Großmutter hat die halbe Ödnis geschmückt, ohne es zu wollen. Das gefällt mir. Nimm. Eine von mir. Mit echtem Kleber.'),
  ], { choices: Z, effects: [herz(ID, 40), { give: 'glasperlen' }] }),
];

const M: Menue = { zeile: G('Noch was? Das Glas wird kalt, wenn ich zu viel rede.'), choices, nodes };

const T = {
  rivale: dialog('glasblaeserin-tag-rivale', [knoten('start', [
    G('Du. Du zerbrichst Dinge. Das sieht man dir an.', 'wut'),
    G('Raus aus meiner Werkstatt, du Scherbenhaufen, bevor ich dich in den Ofen schiebe und eine Vase aus dir mache.'),
  ])]),
  erstes: gespraech('glasblaeserin-tag-erstes', [
    erz('Die Hütte ist aus Treibholz und bunten Glasflaschen gebaut. Die Sonne bricht sich in tausend Farben auf dem Boden. Am Ofen steht eine hagere Frau mit verbrannten Unterarmen und einem Blasrohr, das länger ist als sie.'),
    G('Nicht reden. Moment.', 'neutral'),
    erz('Sie bläst. Am Ende des Rohrs wächst eine glühende Kugel, dann eine Muschel, fein wie ein Atemzug. Erst dann sieht sie dich an.'),
    G('Jetzt. Wer bist du, und warum hast du keine Maske auf? Ah, doch. Gut. Ohne Maske stirbst du hier und schmeckst dabei Regenbögen.'),
  ], M),
  angriff: gespraech('glasblaeserin-tag-glasherz', [
    erz('Die Werkstatt ist zerschrammt. Drei Fenster aus Flaschen sind zersprungen, in der Wand stecken Glasstacheln. Die Glasbläserin fegt Scherben, mit sehr ruhigen, sehr wütenden Bewegungen.'),
    G('Die Königin war hier. Zweimal. Sie sucht ihr Ei, und sie denkt, ich hab es. Das nächste Mal kommt sie nicht wegen der Fenster. Dann kommt sie wegen mir.', 'besorgt'),
  ], M),
  frieden: gespraech('glasblaeserin-tag-frieden', [
    erz('Am Fenster der Werkstatt hängt jetzt eine kleine Glaskugel. Darin, wie eingefroren, ein Glasstachel der Königin.'),
    G('Sie ist wieder in ihrem Nest. Mit Ei. Gestern kam sie bis zum Zaun, hat geschaut und ist wieder gegangen. Ich glaub, das war ein Danke. Oder eine Drohung. Bei Königinnen weiß man das nie.'),
  ], M),
  abend: gespraech('glasblaeserin-tag-abend', [
    erz('Abends glühen die Dünen rot, als hätte jemand den Ofen offen gelassen. Die Glasbläserin sitzt vor der Hütte und schaut nach Westen, wo ein dunkelblauer Streifen den Horizont teilt.'),
    G('Das Meer. Man kann es von hier sehen, wenn die Luft klar ist. Vierzig Kilometer. Ich war nie dort. Ich mach nur Muscheln, die so aussehen, als wäre ich dort gewesen.'),
  ], M),
  freund: gespraech('glasblaeserin-tag-freund', [G('Ah, du. Komm rein. Fass nichts an, das glüht. Fass alles andere an, wenn du willst. Bei dir geht nichts kaputt.', 'freude')], M),
  epilog: gespraech('glasblaeserin-tag-epilog', [
    G('Die Wagenpiste ist offen. Leute fahren jetzt zum Meer. Und auf dem Rückweg halten sie bei mir und erzählen, wie es war. Ich mach daraus Muscheln. Erinnerungsmuscheln. Die laufen besser als alles andere.', 'freude'),
  ], M),
  standard: gespraech('glasblaeserin-tag-standard', [G('Leise eintreten. Glas hat Ohren.')], M),
};

/** ♥2: Die Glasbläserin lässt einen selbst eine Kugel blasen. */
const he2 = dialog('he-glasblaeserin-2', [
  knoten('start', [
    erz('Mittag in der Glaswerkstatt. Der Ofen brummt wie ein schlafender Drache. Die Glasbläserin hält dir das Blasrohr hin, das Ende glüht orange.'),
    G('Du kommst oft. Du fasst nichts an. Du redest nicht, wenn ich blase. Das ist mehr, als die meisten schaffen. Also darfst du. Einmal.'),
    G('Langsam pusten. Gleichmäßig. Drehen, nicht aufhören zu drehen. Wenn du aufhörst, tropft dir die Kugel auf die Schuhe. Und dann hast du Glasschuhe. Nicht die schöne Sorte.'),
  ], {
    choices: [
      { text: 'Ruhig atmen und gleichmäßig drehen.', tag: '[Reflexe 4]', check: pruefung('he-glas-2-drehen', 'reflexe', 4, ['geschick']), next: 'kugel' },
      { text: 'Mit voller Lunge in das Rohr blasen.', tag: '[Körper 4]', check: pruefung('he-glas-2-lunge', 'koerper', 4, ['kraft']), next: 'gross' },
      { text: '„Zeig du’s mir. Ich halte nur das Rohr.“', next: 'gemeinsam' },
    ],
  }),
  knoten('kugel', [
    erz('Die Kugel wächst, rund und fast ohne Blasen. Als sie abkühlt, wird sie grün mit einem blauen Faden darin, wie ein kleiner Planet.'),
    G('Hm. Ein Planet. Gute Lunge, ruhige Hände. Du könntest das lernen. Du wirst es nicht. Aber du könntest.', 'freude'),
  ], { next: 'ende', effects: [herz(ID, 45), { xp: 40 }] }),
  knoten('gross', [
    erz('Die Kugel bläht sich auf, wird groß wie ein Kopf, dünn wie Seifenhaut und platzt mit einem fröhlichen Klirren in tausend Funken. Ihr steht beide in einem Regen aus Glasstaub.'),
    G('Zu viel Lunge, zu wenig Geduld. Aber laut. Laut kann man hier draußen gebrauchen. Die Skorpione mögen keine Lauten.', 'ueberrascht'),
  ], { next: 'ende', effects: [herz(ID, 40), { xp: 35 }] }),
  knoten('gemeinsam', [
    erz('Sie legt ihre Hände über deine. Ihre Haut ist rau und heiß wie Sandstein. Sie dreht, du hältst, sie bläst. Am Ende hängt am Rohr eine Kugel, so klar, dass die ganze Werkstatt darin auf dem Kopf steht.'),
    G('Zu zweit wird’s immer besser. Das hab ich lange vergessen.'),
  ], { next: 'ende', effects: [herz(ID, 35), { xp: 25 }] }),
  knoten('ende', [
    G('Behalt sie nicht. Verschenk sie. Glas, das man behält, wird trüb. Glas, das man verschenkt, bleibt klar. Und das hier nimmst du auch mit.'),
    erz('Sie drückt dir eine Handvoll bunter Glasperlen in die Hand.'),
  ], { effects: [{ give: 'glasperlen' }, flag('glas_kugel_geblasen')] }),
]);

/** ♥4 (nach side-glasherz): Am Glasofen erzählt sie, warum sie nie in die Stadt geht. */
const he4 = dialog('he-glasblaeserin-4', [
  knoten('start', [
    erz('Abend. Der Ofen ist fast aus, die Glut färbt die Werkstatt rot. Die Glasbläserin sitzt davor, in der Hand eine alte Glasscheibe, mattsilbern auf einer Seite.'),
    G('Du hast der Königin ihr Ei wiedergegeben. Keiner hätte das gemacht. Die meisten hätten es verkauft. Oder gegessen.'),
    G('Darum erzähl ich dir jetzt, warum ich hier bin. Ein einziges Mal.'),
    G('Ich hab das Glas der Oberstadt gemacht. Die Kuppel vom Himmelsgarten. Die Fenster am Chrome-Boulevard. Die Fassaden von Quantum. Zwanzig Jahre lang. Das schönste Glas der Stadt.'),
    G('Und dann wollten sie ein neues. Eins, durch das man von außen nur sich selbst sieht. Und von innen alles. Für jedes Fenster in der Unterstadt. „Sicherheitsverglasung“.', 'wut'),
  ], {
    choices: [
      { text: '„Und du hast abgelehnt.“', next: 'abgelehnt' },
      { text: '„Du hast es gebaut. Und bist danach weggelaufen.“', tag: '[Straße 5]', check: pruefung('he-glas-4-wahrheit', 'strasse', 5, ['beobachten']), next: 'gebaut' },
      { text: 'Die matte Scheibe nehmen und ins Licht halten.', next: 'scheibe' },
    ],
  }),
  knoten('abgelehnt', [
    G('Ich hab abgelehnt. Sie haben jemand anderen gefunden. Jemand findet sich immer. Ich hab gekündigt und bin so weit gegangen, bis das Glas unter meinen Füßen nicht mehr ihres war.'),
    G('Hier ist das Glas von niemandem. Es ist einfach passiert. Das ist das ehrlichste Glas der Welt.'),
  ], { next: 'ende', effects: [herz(ID, 50)] }),
  knoten('gebaut', [
    G('…', 'trauer'),
    G('Ja. Ich hab den ersten Prototyp gebaut. Diese Scheibe hier. Weil es schwer war. Weil ich wissen wollte, ob ich es kann. Ich konnte.'),
    G('Dann hab ich gesehen, wofür. Und bin gegangen. Den Prototyp hab ich mitgenommen, damit sie ihn nicht nachbauen können. Sie haben ihn trotzdem nachgebaut. Aber nicht mit meinen Händen.'),
    G('Du bist der erste Mensch, dem ich das sage. Und der erste, der mich nicht anschaut, als wäre ich ein Fenster.'),
  ], { next: 'ende', effects: [herz(ID, 60)] }),
  knoten('scheibe', [
    erz('Du hältst die Scheibe ins Glutlicht. Von deiner Seite siehst du nur dein eigenes Gesicht, rot und müde. Du drehst sie um. Plötzlich siehst du die ganze Werkstatt, die Glasbläserin, das Feuer.'),
    G('Siehst du? Von der einen Seite bist du allein. Von der anderen siehst du alles. So sieht die Stadt die Unterstadt. Ich hab das erfunden. Mehr muss man über mich nicht wissen.', 'trauer'),
  ], { next: 'ende', effects: [herz(ID, 50)] }),
  knoten('ende', [
    erz('Sie wirft die Scheibe in die Glut. Sie schmilzt nicht sofort. Aber sie schmilzt.'),
    G('So. Jetzt ist es weg. Morgen mach ich daraus eine Muschel. Eine, durch die man durchschauen kann. Von beiden Seiten.'),
  ], { effects: [{ xp: 60 }, flag('glas_geschichte'), { rep: 'aussiedler', delta: 5 }] }),
]);

const glasblaeserin = weltfigur({
  id: ID,
  name: 'Die Glasbläserin',
  unknownName: 'Frau am Glasofen',
  faction: 'aussiedler',
  bio: 'Lebt allein in einer Hütte aus Treibholz und Flaschen in den Glasdünen und bläst Muscheln, Perlen und Kugeln. Hat früher das Glas der Oberstadt gemacht und ihren Namen dort gelassen. Kommt nie in die Stadt.',
  gifts: geschenke({
    loves: ['fossile-muschel', 'sandflasche', 'muschel-frisch'],
    likes: ['treibholz', 'kaktusfrucht', 'tai-chi-tee', 'haiku-buechlein', 'meer-foto'],
    dislikes: ['glitzerschrott', 'goldknauf-replik', 'muschel-glas'],
    hates: ['plastikpflanze', 'parfuem-ozon'],
  }),
  schedule: [ort('T,A', 'glasduenen', 'glaswerkstatt'), weg('*')],
  heartEvents: [
    { id: 'he-glasblaeserin-2', hearts: 2, map: 'glasduenen', time: 'tag', dialogue: 'he-glasblaeserin-2' },
    { id: 'he-glasblaeserin-4', hearts: 4, map: 'glasduenen', time: 'abend', when: { all: [{ seen: 'he-glasblaeserin-2' }, GLASHERZ] }, dialogue: 'he-glasblaeserin-4' },
  ],
  talk: [
    rede('glasblaeserin-tag-rivale', { rival: ID }),
    rede('glasblaeserin-tag-erstes', nichtGetroffen(ID)),
    rede('glasblaeserin-tag-glasherz', GLASHERZ_LAEUFT),
    rede('glasblaeserin-tag-epilog', { flag: 'epilog' }),
    rede('glasblaeserin-tag-frieden', { all: [GLASHERZ, { notFlag: 'heute_glas_frieden_gesagt' }] }),
    rede('glasblaeserin-tag-freund', { hearts: ID, min: 4 }),
    rede('glasblaeserin-tag-abend', { time: 'abend' }),
    rede('glasblaeserin-tag-standard'),
  ],
});

// Die Frieden-Begrüßung soll nicht jedes Mal kommen: einmal am Tag, danach die üblichen Varianten.
T.frieden.nodes[0].effects = [flag('heute_glas_frieden_gesagt')];

export const part: ContentPart = {
  npcs: { [ID]: glasblaeserin },
  dialogues: sammle(T.rivale, T.erstes, T.angriff, T.frieden, T.abend, T.freund, T.epilog, T.standard, he2, he4),
};
