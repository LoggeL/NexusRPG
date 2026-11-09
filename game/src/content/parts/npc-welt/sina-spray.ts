// Sina Spray – Graffiti-Künstlerin an der Wand der Freiheit, Flutmauer (world.md §4.5). Ihre Quest
// side-wand-der-freiheit (quest-side-c) läuft über den Hotspot wand-sina; hier Tagesgespräche, freies Sprühen
// (akt-graffiti) und zwei Herz-Ereignisse.
import type { ContentPart } from '../../part';
import type { DialogueChoice, DialogueNode } from '../../../modules/contracts';
import {
  type Menue, dialog, erz, flag, geschenke, gespraech, herz, ich, knoten, nichtGetroffen, ort, pruefung, rede, sammle,
  sprecher, weg, weltfigur, zurueck,
} from './_welt';
import { akt23 } from './sina-spray-akt23';

const ID = 'sina-spray';
const QUEST = 'side-wand-der-freiheit';
const S = sprecher(ID);
const Z = zurueck('Noch was, Sina.', 'Bleib bunt.');

const choices: DialogueChoice[] = [
  { text: 'Was malst du da?', next: 'bild' },
  {
    text: 'Selbst was an die Mauer sprühen.', tag: '[Graffiti]', when: { quest: QUEST, state: 'done' }, next: 'spruehen',
    effects: [{
      minigame: 'akt-graffiti', level: 1, key: 'sina-frei', label: 'Freies Sprühen an der Flutmauer',
      win: [herz(ID, 10), { xp: 20 }, { message: 'Sina: „Nicht schlecht. Noch ein bisschen schief. Schief ist gut. Gerade ist Quantum.“' }],
      lose: [{ message: 'Sina: „Das ist … mutig. Ich übermal es. Liebevoll.“' }],
    }],
  },
  { text: 'Warum „Wand der Freiheit“?', once: true, id: 'si-name', next: 'name' },
  { text: '„Kurt vom Bahnhof malt auch. Heimlich.“', when: { flag: 'kurt_malt_mit_sina' }, once: true, id: 'si-kurt', next: 'kurt' },
  { text: 'Bleib bunt.' },
];

const nodes: DialogueNode[] = [
  knoten('bild', [
    erz('Auf der Mauer: ein riesiger Wal aus Neonfarben, der durch eine Stadt aus Schrott schwimmt. Auf seinem Rücken sitzen Kinder und winken.'),
    S('Das Meer kommt zurück. Irgendwann. Und wenn, dann soll es wissen, dass wir auf es gewartet haben.'),
  ], { choices: Z }),
  knoten('spruehen', [S('Dose schütteln, bis die Kugel lacht. Dann los. Und nicht denken. Denken ist was für Leute mit Pinsel.')]),
  knoten('name', [
    S('Weil die Flutmauer uns einsperrt. Vom Meer. Von der Welt da draußen. Also hab ich angefangen, sie anzumalen. Wenn sie uns schon einsperrt, dann soll sie wenigstens schön dabei aussehen.'),
    S('Quantum übermalt alles. Ich mal es wieder an. Wir sind bei Runde zweiundvierzig. Ich gewinne. Die haben keine Kreativität. Nur Grau.'),
  ], { choices: Z }),
  knoten('kurt', [S('Kurt! Der große Kerl mit den Tauben! Der hat mehr Talent im kleinen Finger als die ganze Oberstadt im Kunstmuseum.'), S('Ich hab ihm einen Platz an der Mauer reserviert. Er traut sich noch nicht. Er kommt.')], { choices: Z, effects: [herz(ID, 15)] }),
];

const M: Menue = { zeile: S('Noch was? Die Farbe trocknet. Und die Kamera dreht sich gleich wieder her.'), choices, nodes };

const T = {
  rivale: dialog('sina-tag-rivale', [knoten('start', [S('Du stehst vor meinem Bild.'), S('Und vor meiner Laune. Verpiss dich, bevor ich dich grau sprühe.')])]),
  erstes: gespraech('sina-tag-erstes', [
    erz('Die Flutmauer, grau und endlos. Nur hier explodiert sie in Farben: Wale, Sterne, Gesichter, Worte. Davor eine junge Frau mit Atemmaske um den Hals, Farbe bis zu den Ellbogen, eine Dose in jeder Hand.'),
    S('Sina. Spray. Wie das, was ich mache. Bin ich so geboren? Nein. Hab ich mir den Namen gegeben? Auch nein. Das war meine Oma. Die war cool.'),
  ], M),
  nacht: gespraech('sina-tag-nacht', [
    erz('Nachts an der Mauer. Sina sprüht im Licht einer Stirnlampe. Neben ihr steht ein Kofferradio, aus dem Kabelbrand läuft.'),
    S('Nachts ist die beste Zeit. Die Kamera sieht nichts, die Wache schläft, und die Farbe riecht nach Freiheit. Und Lösungsmittel.'),
  ], M),
  standard: gespraech('sina-tag-standard', [S('Hey! Du schon wieder! Gut. Ich brauch jemanden, der „wow“ sagt. Sag „wow“.')], M),
};

/** ♥2: Quantum hat über Nacht ein Bild übermalt. */
const he2 = dialog('he-sina-spray-2', [
  knoten('start', [
    erz('Ein Stück der Mauer ist grau. Frisch, glatt, perfekt. Darauf ein kleines Quantum-Logo. Sina steht davor und zittert vor Wut.'),
    S('Das war Mutter Brühes Bild. Mit der Suppe. Ich hab drei Nächte dafür gebraucht. Die haben es in zehn Minuten weggemacht.'),
  ], {
    choices: [
      { text: 'Gemeinsam das Bild neu sprühen. Besser als vorher.', tag: '[Graffiti]', next: 'neu',
        effects: [{
          minigame: 'akt-graffiti', level: 1, key: 'he-sina-spray-2', label: 'Mutter Brühes Bild neu sprühen',
          win: [herz(ID, 45), { xp: 40 }, { dialogue: 'he-sina-spray-2-ende' }],
          lose: [herz(ID, 30), { xp: 25 }, { dialogue: 'he-sina-spray-2-ende' }],
        }],
      },
      { text: 'Das Quantum-Logo in eine Suppenschüssel ummalen.', tag: '[Technik 4]', check: pruefung('he-sina-2-logo', 'technik', 4), next: 'logo' },
      { text: '„Lass es grau. Und schreib drunter: ‚Hier war Kunst. Quantum hatte Angst.‘“', next: 'grau' },
    ],
  }),
  knoten('neu', [S('Los. Du die Suppe, ich die Brühe.')]),
  knoten('logo', [erz('Drei Striche, eine Kurve, ein Dampfwölkchen. Das Quantum-Logo ist jetzt eine Suppenschüssel. Mit Löffel.'), S('Das ist das Beste, was diesem Logo je passiert ist.', 'freude')], { effects: [herz(ID, 50), { xp: 40 }, { dialogue: 'he-sina-spray-2-ende' }] }),
  knoten('grau', [erz('Sina schreibt es. Groß. In Neonpink. Am nächsten Tag stehen zwanzig Leute davor und machen Fotos. Quantum übermalt es nicht. Es wäre ein Geständnis.')], { effects: [herz(ID, 40), { xp: 30 }, { dialogue: 'he-sina-spray-2-ende' }] }),
]);

const he2Ende = dialog('he-sina-spray-2-ende', [
  knoten('start', [S('Weißt du was? Du bist jetzt offiziell Mitglied der Wand-Crew. Wir sind zu zweit. Mit Kurt bald zu dritt. Weltherrschaft ist nah.')], { effects: [flag('sina_crew')] }),
]);

/** ♥4: Sina malt die Spielfigur. */
const he4 = dialog('he-sina-spray-4', [
  knoten('start', [
    erz('Nacht. Sina hat eine freie Stelle an der Mauer grundiert, groß wie ein Garagentor. Sie dreht dich an den Schultern ins Licht der Stirnlampe.'),
    S('Halt still. Ich mal dich. Nicht so, wie du aussiehst. So, wie du bist.'),
    S('Was soll drauf? Sag mir eine Sache, die du willst. Nicht brauchst. Willst.'),
  ], {
    choices: [
      { text: '„Das Meer. Einmal das Meer sehen.“', next: 'meer' },
      { text: '„Eine Familie. Leute, die bleiben.“', next: 'familie' },
      { text: '„Frei sein. Ohne Schulden, ohne Chef, ohne Chip.“', tag: '[Ausstrahlung 5]', check: pruefung('he-sina-4-frei', 'ausstrahlung', 5), next: 'frei' },
    ],
  }),
  knoten('meer', [erz('Stunden später: du, von hinten, am Rand der Flutmauer. Davor kein Grau. Davor Wellen, blau und unmöglich.')], { next: 'ende', effects: [herz(ID, 55)] }),
  knoten('familie', [erz('Stunden später: du, an einem langen Tisch, umgeben von Silhouetten. Manche erkennst du. Eine hat einen Baseballschläger. Eine eine Lederjacke. Eine Stoppuhren.')], { next: 'ende', effects: [herz(ID, 55)] }),
  knoten('frei', [erz('Stunden später: du, im Sprung zwischen zwei Dächern, ohne Boden darunter. Um deine Füße flattern zerrissene Ketten aus Rechnungen.'), S('Das ist das Beste, was ich je gemalt hab. Sag’s keinem. Ich hab einen Ruf als unzufriedene Künstlerin.')], { next: 'ende', effects: [herz(ID, 60)] }),
  knoten('ende', [
    ich('Was passiert, wenn Quantum es übermalt?'),
    S('Dann mal ich’s wieder. Und wieder. Bis die keine graue Farbe mehr haben. Ich hab mehr Farbe als die. Ich hab sie geklaut.'),
  ], { effects: [{ xp: 60 }, flag('sina_portrait'), { rep: 'unterstadt', delta: 2 }] }),
]);

// Akt 2, Partynacht und Nachspiel: sina-spray-akt23.ts.
const A23 = akt23(M);

const sina = weltfigur({
  id: ID,
  name: 'Sina Spray',
  unknownName: 'Sprayerin an der Flutmauer',
  faction: 'unterstadt',
  bio: 'Graffiti-Künstlerin an der Flutmauer, Schöpferin der „Wand der Freiheit“. Atemmaske um den Hals, Farbe bis zu den Ellbogen. Malt Wale und Meere gegen das Grau von Quantum.',
  gifts: geschenke({
    loves: ['neonkreide', 'stickerbogen', 'bandshirt'],
    likes: ['schweissbrille-gelb', 'vinyl-platte', 'samenbombe', 'volt-limo'],
    dislikes: ['planungsbrett-glas', 'seidentuch-blau'],
    hates: ['waschpulver', 'peilsender'],
  }),
  schedule: [...A23.schedule, ort('T,N', 'flutmauer', 'wand-der-freiheit'), weg('M,A')],
  heartEvents: [
    { id: 'he-sina-spray-2', hearts: 2, map: 'flutmauer', time: 'tag', dialogue: 'he-sina-spray-2' },
    { id: 'he-sina-spray-4', hearts: 4, map: 'flutmauer', time: 'nacht', when: { seen: 'he-sina-spray-2' }, dialogue: 'he-sina-spray-4' },
  ],
  talk: [
    rede('sina-tag-rivale', { rival: ID }),
    rede('sina-tag-erstes', nichtGetroffen(ID)),
    ...A23.talk,
    rede('sina-tag-nacht', { time: 'nacht' }),
    rede('sina-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: sina },
  dialogues: sammle(T.rivale, T.erstes, T.nacht, T.standard, he2, he2Ende, he4, ...A23.dialogues),
};
