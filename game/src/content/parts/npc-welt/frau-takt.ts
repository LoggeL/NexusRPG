// Frau Takt – Stationsvorsteherin mit 14 Stoppuhren, Bahnhof Mitte (world.md §4.5).
// Ihre Quest side-uebliche-verspaetung startet über den Zonen-Hotspot der Quest (quest-side-a), hier nur Tagesgespräche.
import type { ContentPart } from '../../part';
import type { DialogueChoice, DialogueNode } from '../../../modules/contracts';
import {
  type Menue, dialog, erz, flag, geschenke, gespraech, herz, ich, knoten, nichtGetroffen, ort, pruefung, rede, sammle,
  sprecher, weg, weltfigur, zurueck,
} from './_welt';
import { TALK_23, SCHEDULE_23 } from './frau-takt-akt23';

const ID = 'frau-takt';
const QUEST = 'side-uebliche-verspaetung';
const T_ = sprecher(ID);
const Z = zurueck('Noch eine Frage. Ich mach schnell.', 'Ich will Sie nicht aufhalten.');

const choices: DialogueChoice[] = [
  { text: 'Wozu vierzehn Stoppuhren?', once: true, id: 't-uhren', next: 'uhren' },
  { text: 'Wie pünktlich ist die U-Bahn heute?', next: 'heute' },
  { text: '„Das Stellwerk spinnt immer noch, oder?“', when: { quest: QUEST, state: 'active' }, next: 'quest' },
  { text: 'Wie haben Sie das früher ohne Störsender ausgehalten?', tag: '[Takt ♥3]', requires: { hearts: ID, min: 3 }, once: true, id: 't-frueher', next: 'frueher' },
  { text: 'Ich will Sie nicht aufhalten.' },
];

const nodes: DialogueNode[] = [
  knoten('uhren', [
    T_('Eine für jede Linie, eine für den Gesamtbetrieb, eine für meine Mittagspause, eine für meinen Puls.'),
    T_('Und eine, die drei Sekunden nachgeht. Absichtlich. Damit ich mich jeden Tag über etwas aufregen kann, das ich im Griff habe.'),
  ], { choices: Z }),
  knoten('heute', [
    erz('Frau Takt drückt vier Stoppuhren gleichzeitig, ohne hinzusehen.'),
    T_('Linie 1: zwei Minuten zu spät. Linie 2: ausgefallen. Linie 3: fährt, aber rückwärts. Linie 4 gibt es nicht, und sie ist trotzdem pünktlicher als Linie 1.'),
  ], { choices: Z }),
  knoten('quest', [T_('Drei Stellwerke, drei Störsender. Und irgendwer verdient daran. Ich hab die Zeiten notiert. Auf die Hundertstel. Finden Sie den Halunken.')], { choices: Z }),
  knoten('frueher', [
    T_('Früher? Früher hatte die Stadt einen Fahrplan. Gedruckt. Mit Rand. Ich hab ihn auswendig gelernt, vorwärts und rückwärts.'),
    T_('Mein Mann ist um 7:14 Uhr in die Linie 3 gestiegen und nie angekommen. Nicht tot. Er ist in der Oberstadt ausgestiegen und geblieben. Seitdem messe ich Zeit. Die bleibt wenigstens.'),
  ], { choices: Z, effects: [herz(ID, 25)] }),
];

const M: Menue = { zeile: T_('Weiter. Sie haben noch sechsundvierzig Sekunden.'), choices, nodes };

const T = {
  rivale: dialog('takt-tag-rivale', [knoten('start', [T_('Sie sind eine Verspätung auf zwei Beinen.'), T_('Gehen Sie. Zügig. Ohne Halt.')])]),
  erstes: gespraech('takt-tag-erstes', [
    erz('Im Stellwerk steht eine kleine Frau in Uniform. Um ihren Hals: Stoppuhren. Viele. Sie tickt leise wie ein Bienenstock.'),
    T_('Takt. Stationsvorsteherin. Sie sind um 16:31 Uhr angekommen. Ihr Zug war für 16:28 Uhr angesetzt. Das wird nicht Ihre Schuld gewesen sein. Diesmal.'),
  ], M),
  puenktlich: gespraech('takt-tag-puenktlich', [
    erz('Frau Takt lächelt. Es sieht ungewohnt aus, als hätte ihr Gesicht diese Bewegung lange nicht geübt.'),
    T_('Neunzehn Tage ohne Störung. Die Linie 1 ist zweimal zu FRÜH gekommen. Ich musste mich hinsetzen.'),
  ], M),
  standard: gespraech('takt-tag-standard', [T_('Sie haben fünfzig Sekunden. Ab jetzt. Neunundvierzig.')], M),
};

/** ♥2: Ein Rennen gegen die Stoppuhr quer durch die Halle. */
const he2 = dialog('he-frau-takt-2', [
  knoten('start', [
    erz('Frau Takt hält dir eine Stoppuhr hin. Die Nummer 9. Ihre Hand zittert ein winziges bisschen.'),
    T_('Die Kollegin von der Ansage schwört, man kommt vom Stellwerk bis zum Fundbüro nicht unter dreißig Sekunden. Ich sage: siebenundzwanzig. Beweisen Sie es.'),
  ], {
    choices: [
      { text: 'Loslaufen. Über Gepäckwagen, unter Absperrband durch.', tag: '[Reflexe 4]', check: pruefung('he-takt-2-lauf', 'reflexe', 4, ['flucht']), next: 'schnell' },
      { text: 'Die Abkürzung durch den Wartungsgang nehmen.', tag: '[Straße 4]', check: pruefung('he-takt-2-abkuerzung', 'strasse', 4), next: 'schnell' },
      { text: 'Ganz normal hingehen, ohne zu rennen.', next: 'normal' },
    ],
  }),
  knoten('schnell', [
    erz('Du schlitterst vor Gerdas Schalter zum Stehen. Gerda reicht dir ohne aufzusehen einen Keks.'),
    T_('Sechsundzwanzig Komma vier. Ich hatte recht. Ich hatte RECHT.', 'freude'),
  ], { next: 'ende', effects: [herz(ID, 45), { xp: 40 }] }),
  knoten('normal', [
    erz('Du schlenderst. Du bleibst an einem Automaten stehen. Du kaufst eine Volt-Limo.'),
    T_('Einhundertzwölf Sekunden. Das ist so schlecht, dass es schon wieder eine Leistung ist. Ich trage es ein. Unter „Rekorde, negativ“.'),
  ], { next: 'ende', effects: [herz(ID, 25), { xp: 20 }] }),
  knoten('ende', [T_('Ab heute stehen Sie in meinem Buch. Ich führe ein Buch über Leute, die sich Mühe geben. Es ist sehr dünn.')], { effects: [flag('takt_buch')] }),
]);

/** ♥4: Frau Takt schenkt die Stoppuhr Nummer 14. */
const he4 = dialog('he-frau-takt-4', [
  knoten('start', [
    erz('Frau Takt sitzt auf einer Bank am Bahnsteig. Die Stoppuhren liegen neben ihr, alle angehalten. Das ist noch nie passiert.'),
    T_('Heute vor zwanzig Jahren, 7:14 Uhr, Linie 3. Ich hab um 7:14 Uhr alle Uhren angehalten. Ich will einmal im Jahr eine Minute haben, die niemandem gehört.'),
  ], {
    choices: [
      { text: 'Sich daneben setzen und schweigen. Eine Minute lang.', next: 'schweigen' },
      { text: '„Soll ich die Minute für Sie zählen? Dann müssen Sie nicht.“', tag: '[Ausstrahlung 4]', check: pruefung('he-takt-4-zaehlen', 'ausstrahlung', 4, ['trost']), next: 'zaehlen' },
      { text: '„Er war ein Idiot, wenn er da oben geblieben ist.“', next: 'idiot' },
    ],
  }),
  knoten('schweigen', [erz('Eine U-Bahn fährt ein. Eine fährt aus. Frau Takt atmet aus, als hätte sie zwanzig Jahre die Luft angehalten.')], { next: 'ende', effects: [herz(ID, 50)] }),
  knoten('zaehlen', [
    ich('Eins. Zwei. … Achtundfünfzig. Neunundfünfzig.'),
    T_('Sie waren zwei Sekunden zu langsam. Das war die schönste Minute seit Jahren.', 'freude'),
  ], { next: 'ende', effects: [herz(ID, 60)] }),
  knoten('idiot', [T_('Ein Idiot. Ja. Ein pünktlicher Idiot, er hatte nie Verspätung. Das war das Problem. Er ist pünktlich gegangen.'), T_('… Danke. Das musste jemand sagen, der kein Fahrplan ist.')], { next: 'ende', effects: [herz(ID, 45)] }),
  knoten('ende', [
    erz('Sie drückt dir die Stoppuhr Nummer 14 in die Hand. Messinggehäuse. Sie geht drei Sekunden nach.'),
    T_('Die regt mich jeden Tag auf. Jetzt soll sie Sie aufregen. Ich brauche sie nicht mehr.'),
  ], { effects: [{ xp: 60 }, { give: 'stoppuhr-takt' }] }),
]);

const takt = weltfigur({
  id: ID,
  name: 'Frau Takt',
  unknownName: 'Frau mit Stoppuhren',
  faction: 'unterstadt',
  bio: 'Stationsvorsteherin am Bahnhof Mitte. Trägt 14 Stoppuhren um den Hals, misst alles, verzeiht nichts – außer Leuten, die sich Mühe geben.',
  gifts: geschenke({
    loves: ['planungsbrett-glas', 'synth-kaffee', 'rechenfibel'],
    likes: ['zeitung-papier', 'stempelkissen', 'kraeuter-gebaeck'],
    dislikes: ['glitzerschrott', 'kartendeck'],
    hates: ['magnet-stoerer', 'volt-limo'],
  }),
  schedule: [...SCHEDULE_23, ort('M,T', 'bahnhof-mitte', 'stellwerk'), weg('A,N')],
  heartEvents: [
    { id: 'he-frau-takt-2', hearts: 2, map: 'bahnhof-mitte', time: ['morgen', 'tag'], dialogue: 'he-frau-takt-2' },
    { id: 'he-frau-takt-4', hearts: 4, map: 'bahnhof-mitte', time: 'morgen', when: { seen: 'he-frau-takt-2' }, dialogue: 'he-frau-takt-4' },
  ],
  talk: [
    rede('takt-tag-rivale', { rival: ID }),
    rede('takt-tag-erstes', nichtGetroffen(ID)),
    ...TALK_23,
    rede('takt-tag-puenktlich', { quest: QUEST, state: 'done' }),
    rede('takt-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: takt },
  dialogues: sammle(T.rivale, T.erstes, T.puenktlich, T.standard, he2, he4),
};
