// Nebenquest 5 `side-eins-turnier` „Vier ziehen!“ (world.md §6.2 Nr. 5). Daria, sonntags tagsüber.
// Start: Darias Sonntagsgespräch (npc-kinder-alte/daria.ts) oder hier am Botenstand.
// Drei Runden Eins! am Botenstand (Schrottmarkt): Freya & Jakko · Dante & Oma Volt (gc-57 [Ausstrahlung 5] „Atme in die
// Tüte, Dante.“, Dante ♥ +60) · Vega → Finale gegen Daria in Dantes Werkstatt am Eins!-Tisch ([Jakko ♥4] Tipp zu
// Darias „+4“ = leichteres Finale). Fair gewinnen → goldene-plus-vier; mit Anstand verlieren → Daria ♥ +60, Quest
// trotzdem erledigt (Plus-Vier später per Revanche). Danach wöchentliches Turnier.
import type { ContentPart } from '../../part';
import type { DialogueDef, Effect, QuestDef } from '../../../modules/contracts';
import { active, all, any, dlg, done, flag, hearts, inactive, l, msg, nar, node, noFlag, not, set, time, tschuess } from './_lib';

const Q = 'side-eins-turnier';
const D = 'daria';
const DA = 'dante';
const SONNTAG = all({ weekday: 'so' }, time('morgen', 'tag'));
const SONNTAG_FINALE = all({ weekday: 'so' }, time('morgen', 'tag', 'abend'));
const FINALE = any(flag('eins_finale_sieg'), flag('eins_finale_anstand'));

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: 'Vier ziehen!',
  summary: 'Darias Eins!-Turnier: drei Runden, dann das Finale gegen die ungeschlagene Meisterin. Startgeld: deine Würde.',
  giver: D,
  act: 1,
  steps: [
    { id: 'runde-1', text: 'Runde 1 am Botenstand: Freya und Jakko (sonntags tagsüber).', done: flag('eins_r1'), marker: { map: 'schrottmarkt' } },
    { id: 'runde-2', text: 'Runde 2: Dante und Oma Volt. Halt Dante bei Laune.', when: flag('eins_r1'), done: flag('eins_r2'), marker: { map: 'schrottmarkt' } },
    { id: 'runde-3', text: 'Runde 3: Vega. Sie zählt Karten wie Meter.', when: flag('eins_r2'), done: flag('eins_r3'), marker: { map: 'schrottmarkt' } },
    {
      id: 'tipp', text: 'Optional: Jakko (♥4) weiß etwas über Darias „+4“.', optional: true,
      when: all(flag('eins_r3'), hearts('jakko', 4), not(FINALE)), done: flag('eins_jakko_tipp'), marker: { map: 'schrottmarkt' },
    },
    { id: 'finale', text: 'Finale gegen Daria am Eins!-Tisch in Dantes Werkstatt (Sonntag).', when: flag('eins_r3'), done: FINALE, marker: { map: 'dantes-werkstatt' } },
  ],
  reward: {
    xp: 100,
    relations: { daria: 40, freya: 40, jakko: 40 },
    effects: [msg('Ab jetzt jeden Sonntag: Eins!-Turnier am Botenstand. Daria hat ein Schild gemalt. Es ist größer als der Stand.')],
  },
};

const eins = (level: number, key: string, label: string, win: Effect[], lose: Effect[]): Effect =>
  ({ minigame: 'akt-eins', level, key, label, win, lose });

// ---------------------------------------------------------------------------------------------- Runden am Botenstand

const runden: DialogueDef = dlg('side-eins-turnier-runden', [
  node('start', [
    nar('Am Botenstand stehen drei Obstkisten im Kreis, darauf ein Kartenstapel, so abgegriffen, dass die Zahlen nur noch Gerüchte sind. Daria hat ein Schild aufgestellt: „TURNIER · KEIN GEJAMMER · KEINE AUSREDEN · DANTE: KEINE TÜTE“.'),
    l(D, 'Willkommen zum Turnier! Ich bin Veranstalterin, Schiedsrichterin und Titelverteidigerin. Interessenkonflikt? Nie gehört.', 'signatur'),
  ], {
    choices: [
      { text: '„Ich will mitspielen.“', when: inactive(Q), effects: [{ startQuest: Q }], next: 'angemeldet' },
      { text: 'Runde 1: Freya und Jakko.', when: all(active(Q), noFlag('eins_r1')), next: 'r1' },
      { text: 'Runde 2: Dante und Oma Volt.', when: all(active(Q), flag('eins_r1'), noFlag('eins_r2')), next: 'r2' },
      { text: 'Runde 3: Vega.', when: all(active(Q), flag('eins_r2'), noFlag('eins_r3')), next: 'r3' },
      { text: '„Jakko, du guckst so. Weißt du was?“', tag: '[Jakko ♥4]', when: all(active(Q), flag('eins_r3'), noFlag('eins_jakko_tipp'), not(FINALE)), requires: hearts('jakko', 4), next: 'tipp' },
      { text: '„Wann ist das Finale?“', when: all(active(Q), flag('eins_r3'), not(FINALE)), next: 'finale-info' },
      tschuess('„Ich wärm mich noch auf.“'),
    ],
  }),
  node('angemeldet', [l(D, 'Angemeldet. Dein Startplatz: ganz unten. Arbeite dich hoch. Oder geh unter. Beides ist gut für die Quote.', 'freude')]),
  node('r1', [
    l('freya', 'Ich spiele streng nach Regelwerk. Ich habe das Regelwerk mitgebracht. Es ist handgeschrieben.', 'neutral'),
    l('jakko', 'Und ich spiele nach Hunger! Wer verliert, gibt eine Dampfnudel aus!', 'freude'),
  ], {
    choices: [
      {
        text: 'Karten mischen.', effects: [eins(1, 'eins-turnier-r1', 'Turnier, Runde 1: Freya und Jakko',
          [set('eins_r1'), { relation: 'freya', delta: 10 }, msg('Runde 1 gewonnen! Freya verkündet feierlich: „Das Urteil ist rechtskräftig.“ Jakko verlangt trotzdem eine Dampfnudel.')],
          [msg('Verloren. Freya: „Das Gericht empfiehlt Revanche.“ Jakko kaut zufrieden. Du darfst gleich noch mal.')])],
      },
      tschuess('„Gleich.“'),
    ],
  }),
  node('r2', [
    nar('Dante sitzt schon. Er hat die Ärmel hochgekrempelt und sein Gesicht zu einer Maske der Konzentration verzogen. Oma Volt neben ihm strickt.'),
    l(DA, 'Elf Wochen. Elf Wochen kein Sieg. Heute nicht. HEUTE NICHT!', 'wut'),
    l('oma-volt', 'Dante, Kindchen, du hyperventilierst schon beim Mischen.'),
    nar('Nach der zweiten Karte, die Daria als Schiedsrichterin „leider nicht zulässig“ nennt, steht Dante auf, setzt sich wieder hin und atmet in eine Papiertüte, die er offenbar dabeihatte.'),
  ], {
    choices: [
      { text: '„Atme in die Tüte, Dante. Ein. Aus. Es ist nur ein Kartenspiel. Mit Kindern. Die dich hassen.“', check: 'gc-57', next: 'r2-ruhig' },
      { text: 'Weiterspielen und hoffen, dass er nicht explodiert.', next: 'r2-spiel' },
    ],
  }),
  node('r2-ruhig', [
    nar('Dante atmet. Die Tüte bläht sich und fällt zusammen. Bläht sich. Fällt zusammen. Captain Kuschel, auf seinem Schoß, stellt ein Ohr auf.'),
    l(DA, '… Danke. Das war … Danke. Ich hab eine Atemübung gebraucht und einen Freund. Du bist beides.', 'zaertlich'),
  ], { effects: [{ relation: DA, delta: 60 }], next: 'r2-spiel' }),
  node('r2-spiel', [l('oma-volt', 'Gib die Karten, Kindchen. Ich hab noch einen Kuchen im Ofen. Er wartet nicht, und ich auch nicht.')], {
    choices: [
      {
        text: 'Ausspielen.', effects: [eins(2, 'eins-turnier-r2', 'Turnier, Runde 2: Dante und Oma Volt',
          [set('eins_r2'), msg('Runde 2 gewonnen! Oma Volt nickt anerkennend. Dante legt die Karten sehr ruhig hin und geht kurz um die Ecke. Man hört gedämpftes Fluchen. Dann kommt er lächelnd zurück.')],
          [msg('Verloren – gegen Oma Volt, die nebenbei eine Reihe Socken fertig gestrickt hat. Revanche jederzeit.')])],
      },
    ],
  }),
  node('r3', [
    nar('Vega sitzt mit geradem Rücken auf einer Kiste und hält ihre Karten so dicht vor die Brust, dass sie praktisch tätowiert sind.'),
    l('vega', 'Vierzig Karten im Stapel. Du hast sieben. Daria hat dir eben eine Plus-Zwei untergeschoben. Ich hab’s gesehen. Ich sehe alles.', 'signatur'),
    l(D, 'Verleumdung!', 'wut'),
  ], {
    choices: [
      {
        text: 'Spielen. Und nicht blinzeln.', effects: [eins(3, 'eins-turnier-r3', 'Turnier, Runde 3: Vega',
          [set('eins_r3'), { relation: 'vega', delta: 20 }, msg('Runde 3 gewonnen! Vega: „Gut geschossen.“ Das ist bei ihr ein Orden.')],
          [msg('Verloren. Vega sammelt die Karten ein, ohne eine Miene zu verziehen. „Nächstes Mal guck auf ihre Hände. Nicht auf ihr Gesicht.“')])],
      },
      tschuess('„Ich brauch erst einen Kaffee.“'),
    ],
  }),
  node('tipp', [
    nar('Jakko zieht dich an der Jacke hinter den Stand. Er flüstert, obwohl Daria drei Meter weg ist und alles hört.'),
    l('jakko', 'Daria hat eine Plus-Vier im Ärmel. Immer. Die legt sie, wenn du nur noch zwei Karten hast. Dann schreit sie „EINS!“ für dich, damit du dich erschreckst.', 'besorgt'),
    l('jakko', 'Sag ihr nicht, dass ich das gesagt hab. Sonst krieg ich nie wieder Nachtisch.'),
  ], { effects: [set('eins_jakko_tipp'), { relation: 'jakko', delta: 20 }] }),
  node('finale-info', [l(D, 'Das Finale ist bei Dante. Am großen Tisch. Sonntag. Ich spiele nur auf heiligem Boden. Dante hat da mal einen Keks fallen lassen, das zählt.', 'signatur')]),
]);

// ---------------------------------------------------------------------------------------------- Finale (Dantes Werkstatt)

const sieg: Effect[] = [set('eins_finale_sieg'), { give: 'goldene-plus-vier' }, { dialogue: 'side-eins-turnier-sieg' }];
const niederlage: Effect[] = [{ dialogue: 'side-eins-turnier-verloren' }];

const finale: DialogueDef = dlg('side-eins-turnier-finale', [
  node('start', [
    nar('Dantes Werkstatt. Der Eins!-Tisch ist mit einem Bettlaken als „Ehrentuch“ bedeckt. Freya hält eine Taschenlampe als Scheinwerfer, Jakko macht Trommelwirbel auf einem Kochtopf.'),
    l(D, 'Das Finale. Ich habe noch nie ein Finale verloren. Weil ich noch nie ein Finale gespielt habe. Das ist mein erstes Turnier. Aber ich hätte es nicht verloren.', 'signatur'),
  ], {
    choices: [
      {
        text: 'Spielen. Fair.', when: noFlag('eins_jakko_tipp'),
        effects: [eins(4, 'eins-turnier-finale', 'Finale gegen Daria', sieg, niederlage)],
      },
      {
        text: 'Spielen. Und auf ihren Ärmel achten.', tag: '[Jakkos Tipp]', when: flag('eins_jakko_tipp'),
        effects: [eins(3, 'eins-turnier-finale', 'Finale gegen Daria (mit Jakkos Tipp)', sieg, niederlage)],
      },
      tschuess('„Ich brauch noch eine Minute.“'),
    ],
  }),
]);

const siegDlg: DialogueDef = dlg('side-eins-turnier-sieg', [
  node('start', [
    nar('Letzte Karte. Du legst sie hin. Daria starrt darauf. Es ist eine Plus-Vier. In Gold umrandet, weil Freya sie vorher bemalt hat, „für den Sieger“.'),
    l(D, 'Du … hast … gewonnen.', 'ueberrascht'),
    l(D, 'Okay. Okay okay okay. Das ist gut. Das ist gut fürs Turnier. Das zeigt, dass es fair ist. Ich wollte, dass du gewinnst. Strategisch.', 'verlegen'),
    l('freya', 'Das Gericht erkennt den Sieg an. Die Goldene Plus-Vier geht an den Herausforderer.', 'freude'),
    l(DA, 'JEMAND HAT DARIA GESCHLAGEN! Ich bin nicht mehr der Einzige, der verliert! Ich bin GERETTET!', 'freude'),
  ], {
    choices: [
      { text: '„Revanche nächsten Sonntag?“', next: 'revanche' },
      { text: '„Gutes Spiel, Daria.“', next: 'revanche' },
      { text: '„Heul nicht, Kleine. Du warst gut. Ich war besser.“', next: 'revanche' },
    ],
  }),
  node('revanche', [l(D, 'Revanche nächsten Sonntag. Und dann hol ich mir mein Gold zurück. Mit Zinsen.', 'signatur')]),
]);

const verlorenDlg: DialogueDef = dlg('side-eins-turnier-verloren', [
  node('start', [
    nar('Daria legt ihre letzte Karte. Plus-Vier. Natürlich. „EINS!“ ruft sie dabei für dich, und du zuckst zusammen.'),
    l(D, 'Gewonnen! Natürlich! Ungeschlagen! Seit drei Wochen!', 'freude'),
  ], {
    choices: [
      { text: 'Aufstehen, ihr die Hand geben. „Glückwunsch, Meisterin. Verdient.“', next: 'anstand' },
      { text: '„Plus-Vier aus dem Ärmel. Schummlerin.“', next: 'motzen' },
      { text: '„Revanche. Nächsten Sonntag.“', next: 'spaeter' },
    ],
  }),
  node('anstand', [
    nar('Daria sieht deine Hand an, als wäre sie ein Vertrag mit Kleingedrucktem. Dann schlägt sie ein.'),
    l(D, 'Du bist ein guter Verlierer. Das ist selten. Die meisten sind Dante.', 'zaertlich'),
    l(DA, 'Hey!', 'wut'),
    l('freya', 'Das Gericht vermerkt: vorbildlicher Sportsgeist. Ehrenurkunde folgt. Mit Buntstift.', 'freude'),
  ], { effects: [set('eins_finale_anstand'), { relation: D, delta: 60 }] }),
  node('motzen', [
    l(D, 'Beweise? Hast du Beweise? Ein Ärmel ist ein Ärmel.', 'wut'),
    l('freya', 'Einspruch abgelehnt. Mangels Ärmelinspektion.'),
  ], { effects: [{ relation: D, delta: -10 }] }),
  node('spaeter', [l(D, 'Gerne. Ich liebe Revanchen. Die bringen Publikum.', 'signatur')]),
]);

// ---------------------------------------------------------------------------------------------- Wöchentliches Turnier

const woche: DialogueDef = dlg('side-eins-turnier-woche', [
  node('start', [
    l(D, 'Sonntag! Turnier! Neue Saison! Startgeld: Würde. Du hast ja noch welche übrig.', 'freude'),
  ], {
    choices: [
      {
        text: 'Mitspielen.', effects: [eins(3, 'eins-turnier-woche', 'Sonntagsturnier',
          [{ credits: 40 }, { relation: D, delta: 10 }, msg('Sonntagsturnier gewonnen: 40 Credits Preisgeld aus Darias Kasse. Sie zählt es dreimal nach. Dann gibt sie es dir. Mit Schmerzen.')],
          [{ relation: D, delta: 15 }, msg('Verloren, aber mit Haltung. Daria: „Du bist mein Lieblingsgegner. Weil du wiederkommst.“')])],
      },
      {
        text: 'Revanche um die Goldene Plus-Vier.', when: all(noFlag('eins_finale_sieg'), { noItem: 'goldene-plus-vier' }),
        effects: [eins(4, 'eins-turnier-finale', 'Revanche gegen Daria', sieg, [msg('Wieder Plus-Vier. Wieder „EINS!“. Daria grinst. „Nächsten Sonntag.“')])],
      },
      tschuess('„Heute nicht.“'),
    ],
  }),
]);

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: { [runden.id]: runden, [finale.id]: finale, [siegDlg.id]: siegDlg, [verlorenDlg.id]: verlorenDlg, [woche.id]: woche },
  mapAdditions: {
    schrottmarkt: {
      hotspots: [
        {
          id: 'q-eins-turnier', at: 'botenstand', radius: 64, label: 'Eins!-Turnier', kind: 'talk', dialogue: runden.id,
          when: all(SONNTAG, any(inactive(Q), all(active(Q), not(FINALE)))),
        },
        {
          id: 'q-eins-turnier-woche', at: 'botenstand', radius: 64, label: 'Sonntagsturnier (Eins!)', kind: 'talk', dialogue: woche.id,
          when: all(SONNTAG, done(Q)),
        },
      ],
    },
    'dantes-werkstatt': {
      hotspots: [
        {
          id: 'q-eins-turnier-finale', at: 'eins-tisch', radius: 60, label: 'Finale gegen Daria', kind: 'talk', dialogue: finale.id,
          when: all(active(Q), flag('eins_r3'), not(FINALE), SONNTAG_FINALE),
        },
      ],
    },
  },
};

