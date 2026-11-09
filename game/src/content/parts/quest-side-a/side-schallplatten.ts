// Nebenquest 9 `side-schallplatten` „Seele aus Vinyl“ (world.md §6.2 Nr. 9). Dante, ab main-1-dante, fortlaufend.
// schallplatte-01…12 finden, kaufen, gewinnen oder tauschen und am Plattenspieler in Dantes Werkstatt abgeben.
// Je Platte 30 XP und Dante ♥ +30; je drei Platten tanzt Dante durch die Werkstatt. Zähler über Flags platten_1…12
// (eine Abgabe-Wahl je Platte und Zählerstand, sichtbar ist immer nur die passende).
// Quellen in Akt 1: 01/02 Vinyl-Vincent (Laden), 03 Lötgassen-Dachfirst, 04 side-drohnenrennen, 05 Digitech-Areal,
// 07 Flutmauer-Treibgut, 08 side-lumos-platte, 09 Pixelpalast; hier zusätzlich: 06 bei Vincent gegen zwei Vinyl-Platten
// tauschen, 10 bei Vincent kaufen (600 Cr; gc-64 [Straße 5] auf ein Drittel). 11/12 kommen aus der Ödnis (Akt 2).
// Belohnung bei 12: plattenspieler-tragbar, Musikwahl im Crew-Quartier (Quest erledigt), Platte „Dante 3“.
import type { ContentPart } from '../../part';
import type { DialogueChoice, DialogueDef, DialogueNode, QuestDef } from '../../../modules/contracts';
import { active, all, any, dlg, done, flag, item, l, msg, nar, node, noFlag, set, time, tschuess } from './_lib';

const Q = 'side-schallplatten';
const DA = 'dante';
const nr = (i: number) => String(i).padStart(2, '0');
const PLATTEN = Array.from({ length: 12 }, (_, i) => `schallplatte-${nr(i + 1)}`);

/** Dantes Kommentar je Platte (Titel siehe parts/system/items-sammeln.ts). */
const KOMMENTAR: Record<string, string> = {
  'schallplatte-01': 'Kabelbrand, „Funken“! Die erste Single! Aria darf das nie sehen, sonst klaut sie die. Okay, sie darf sie sehen. Klauen nicht.',
  'schallplatte-02': 'DJ Fönix! „Smog über Sektor 4“! Das ist Musik für Leute, die nachts aus dem Fenster gucken und rauchen, obwohl sie nicht rauchen.',
  'schallplatte-03': 'Die Lötkolben! Vom DACHFIRST? Du bist da hoch? Für mich? Um Himmels Willen. Ich bin gerührt. Und ein bisschen besorgt um deine Knie.',
  'schallplatte-04': 'Hafenchor Rostkai! Seemannslieder von Leuten, die nie ein Schiff betreten haben. Ich weine bei Strophe drei. Jedes Mal.',
  'schallplatte-05': 'Das Digitech-Werksorchester. Eine Woche vor der Pleite. Hörst du die Trompete? Die weiß schon, was kommt.',
  'schallplatte-06': 'Radio Rost! Opa Funk! Zwischen den Liedern Wetterberichte aus der Ödnis! „Morgen: Sand. Übermorgen: auch Sand.“ Poesie.',
  'schallplatte-07': 'Brackwasser Blues, „Ebbe“! Da sind noch Algen in der Rille! Das ist kein Kratzer, das ist Natur!',
  'schallplatte-08': 'Lumos Neonnacht-Mix! Ab Minute zwölf grölt Hunter mit. Ich werde das nie wieder anders hören können.',
  'schallplatte-09': 'Pixel & Puls, „Highscore“! Chiptune auf Vinyl! Das ist wie Kaviar auf Toast. Falsch, aber göttlich.',
  'schallplatte-10': 'Serenity Chrome. „Glaspark“. Die Auflage wurde vernichtet. Das hier ist … das ist ein Wunder. Ein trauriges kleines Wunder.',
  'schallplatte-11': 'Die Konvoi-Kapelle! Gitarre und Hupe! Mitsingen ist Pflicht! Captain, Ohren hoch, du singst mit!',
  'schallplatte-12': 'Marla Sand. „Wo Wasser war“. Sie spricht nicht gern darüber. Ich werd sie auch nur ganz leise auflegen.',
};

const TANZ: Record<number, string[]> = {
  3: [
    'Dante legt die Platte auf. Er nickt im Takt. Er nickt stärker. Dann gibt es kein Halten mehr: Er tanzt. Durch die Werkstatt, zwischen Röhrenmonitoren und Kabelrollen, mit Captain Kuschel als Tanzpartner.',
    'Es ist der schlechteste Tanz, den du je gesehen hast. Und der ehrlichste.',
  ],
  6: [
    'Sechs Platten. Dante schiebt die Werkbank an die Wand. „Platz! Ich brauche PLATZ!“ Er tanzt etwas, das er „den Lötgassen-Shuffle“ nennt. Es besteht hauptsächlich aus Ellbogen.',
    'Er zieht dich mit. Du hast keine Wahl. Niemand hat bei Dante eine Wahl.',
  ],
  9: [
    'Neun Platten. Dante tanzt nicht mehr. Er schwebt. Er dreht sich mit geschlossenen Augen um die Einbau-Liege, und für einen Moment sieht er aus wie ein junger Mann in einem Club, der nicht weiß, dass er bald ins Gefängnis muss.',
    'Als das Lied endet, bleibt er stehen und sagt sehr leise: „So hat sich das angefühlt. Damals. Bevor alles digital wurde.“',
  ],
  12: [
    'Zwölf. Die Sammlung ist vollständig. Dante legt nichts auf. Er sitzt nur da und sieht die Hüllen an. Dann steht er auf, holt eine Platte aus seinem Schrank, auf der „DANTE 3“ steht, und legt sie auf.',
    'Es ist seine eigene Musik. Aufgenommen in der Zelle, auf einer Gitarre ohne G-Saite. Er tanzt dazu. Mit dir. Und Captain Kuschel hat beide Ohren oben.',
  ],
};

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: 'Seele aus Vinyl',
  summary: 'Zwölf Platten, quer durch die Stadt verstreut. Dante will sie alle. Für jede gibt es Dankbarkeit, für drei einen Tanz.',
  giver: DA,
  act: 1,
  autoStart: done('main-1-dante'),
  steps: [
    { id: 'drei', text: 'Bring Dante drei Schallplatten (Plattenspieler in seiner Werkstatt).', done: flag('platten_3'), marker: { map: 'dantes-werkstatt' } },
    { id: 'sechs', text: 'Sechs Platten.', when: flag('platten_3'), done: flag('platten_6'), marker: { map: 'dantes-werkstatt' } },
    { id: 'neun', text: 'Neun Platten.', when: flag('platten_6'), done: flag('platten_9'), marker: { map: 'dantes-werkstatt' } },
    { id: 'zwoelf', text: 'Alle zwölf Platten.', when: flag('platten_9'), done: flag('platten_12'), marker: { map: 'dantes-werkstatt' } },
    {
      id: 'vincent', text: 'Tipp: Vinyl-Vincent am Schrottmarkt hat seltene Pressungen. Teuer. Wer handeln kann, zahlt weniger.',
      optional: true, done: any(flag('vincent_10_gekauft'), flag('vincent_06_getauscht')), marker: { map: 'schrottmarkt' },
    },
  ],
  reward: {
    xp: 150,
    items: { 'plattenspieler-tragbar': 1 },
    effects: [set('platte_dante_3'), msg('Dante schenkt dir seinen tragbaren Plattenspieler. Im Crew-Quartier kannst du jetzt die Musik wählen. Und „Dante 3“ läuft im Kopf weiter.')],
  },
};


// ---------------------------------------------------------------------------------------------- Abgabe bei Dante

const abgabe: DialogueChoice[] = [];
const nodes: DialogueNode[] = [];
for (const platte of PLATTEN) {
  for (let k = 1; k <= 12; k++) {
    abgabe.push({
      text: `„${titel(platte)}“ abgeben.`,
      when: all(active(Q), item(platte), noFlag(`abgegeben_${platte}`), ...(k > 1 ? [flag(`platten_${k - 1}`)] : []), noFlag(`platten_${k}`)),
      effects: [
        { take: platte }, set(`abgegeben_${platte}`), set(`platten_${k}`), { xp: 30 }, { relation: DA, delta: 30 },
      ],
      next: k % 3 === 0 ? `tanz-${k}-${platte}` : `danke-${platte}`,
    });
  }
  nodes.push(node(`danke-${platte}`, [l(DA, KOMMENTAR[platte], 'freude')], { next: 'start' }));
  for (const k of [3, 6, 9, 12]) {
    nodes.push(node(`tanz-${k}-${platte}`, [l(DA, KOMMENTAR[platte], 'freude'), ...TANZ[k].map(nar)], k === 12 ? {} : { next: 'start' }));
  }
}

function titel(platte: string): string {
  const t: Record<string, string> = {
    'schallplatte-01': 'Kabelbrand – Funken', 'schallplatte-02': 'Smog über Sektor 4', 'schallplatte-03': 'Heiße Spitze',
    'schallplatte-04': 'Ahoi, Beton', 'schallplatte-05': 'Feierabend 2071', 'schallplatte-06': 'Stimmen aus dem Staub',
    'schallplatte-07': 'Ebbe', 'schallplatte-08': 'Neonnacht Mixtape Vol. 3', 'schallplatte-09': 'Highscore',
    'schallplatte-10': 'Glaspark', 'schallplatte-11': 'Sand im Getriebe', 'schallplatte-12': 'Wo Wasser war',
  };
  return t[platte] ?? platte;
}

const dante: DialogueDef = dlg('side-schallplatten-dante', [
  node('start', [
    nar('Dante steht am Plattenspieler und streicht über ein leeres Fach im Regal. Zwölf Fächer, beschriftet mit Edding. Einige sind noch leer.'),
    l(DA, 'Hast du was für mich? Sag ja. Sag bitte ja. Ich hab schon Staub gewischt.', 'freude'),
  ], {
    choices: [
      ...abgabe,
      { text: '„Wo find ich die restlichen?“', when: active(Q), next: 'tipps' },
      { text: '„Die Sammlung ist komplett, Dante.“', when: done(Q), next: 'danach' },
      tschuess('„Noch nicht.“'),
    ],
  }),
  node('tipps', [
    l(DA, 'Überall! Vinyl ist wie Unkraut, es wächst in Ritzen! Vinyl-Vincent am Schrottmarkt hat welche, der Gauner. Auf Dächern liegen welche, weil Leute dort oben Partys feiern und dann ihre Musik vergessen.', 'signatur'),
    l(DA, 'Im Pixelpalast gibt’s eine als Hauptpreis. An der Flutmauer spült das Meer manchmal welche an. Im alten Digitech-Areal hatte die Betriebskapelle ein Lager. Und Opa Funk draußen in der Ödnis hat Pressungen, die keiner sonst hat.'),
    l(DA, 'Und wenn du an einer Platte vorbeigehst, ohne sie mitzunehmen, weine ich. Ich merke das. Ich spüre das im Tonarm.'),
  ]),
  node('danach', [l(DA, 'Zwölf. Ich höre sie jeden Abend. In der richtigen Reihenfolge. Und dann in der falschen, weil das auch schön ist.', 'zaertlich')]),
  ...nodes,
]);

// ---------------------------------------------------------------------------------------------- Vinyl-Vincent

const vincent: DialogueDef = dlg('side-schallplatten-vincent', [
  node('start', [
    nar('Vinyl-Vincent: Hornbrille, Strickjacke, Finger, die Platten so halten, als wären sie Babys aus Glas. Hinter ihm eine Kiste mit der Aufschrift „NICHT FÜR DICH“.'),
    l('vinyl-vincent', 'Du suchst was Bestimmtes. Ich seh das. Leute, die nur stöbern, haben andere Augen. Weichere.', 'signatur'),
  ], {
    choices: [
      { text: '„Was ist in der Kiste?“', when: noFlag('vincent_10_gekauft'), next: 'kiste' },
      {
        text: '„Ich hab zwei Vinyl-Platten zum Tauschen. Hast du was von Radio Rost?“', when: noFlag('vincent_06_getauscht'),
        requires: item('vinyl-platte', 2), next: 'tausch',
      },
      tschuess('„Nur gucken.“'),
    ],
  }),
  node('kiste', [
    nar('Vincent öffnet die Kiste einen Spalt. Darin, in Seidenpapier: „Serenity Chrome – Glaspark“. Das Cover zeigt ein Mädchen an einem Klavier, das in einem Glashaus steht.'),
    l('vinyl-vincent', 'Haus Chrome hat die Auflage vernichtet. Alle. Bis auf drei. Eine hat Serenity selbst, eine liegt in einem Museum in der Oberstadt. Und eine liegt hier.', 'neutral'),
    l('vinyl-vincent', 'Sechshundert.'),
  ], {
    choices: [
      {
        text: '„Sechshundert? Die ist heiß, Vincent. Wenn Haus Chrome erfährt, dass du die hast, bist du morgen Teil der Oberstadt-Kanalisation. Zweihundert, und ich hab sie nie bei dir gesehen.“',
        check: 'gc-64', next: 'drittel',
      },
      { text: 'Sechshundert zahlen.', requires: { credits: 600 }, effects: [{ credits: -600 }, { give: 'schallplatte-10' }, set('vincent_10_gekauft')], next: 'gekauft' },
      tschuess('„Zu teuer.“'),
    ],
  }),
  node('drittel', [
    l('vinyl-vincent', '… Zweihundert. Du bist ein Monster. Ein Monster mit Geschmack.', 'wut'),
  ], {
    choices: [
      { text: 'Zweihundert zahlen.', requires: { credits: 200 }, effects: [{ credits: -200 }, { give: 'schallplatte-10' }, set('vincent_10_gekauft')], next: 'gekauft' },
      tschuess('„Ich hol das Geld.“'),
    ],
  }),
  node('gekauft', [l('vinyl-vincent', 'Halt sie nie in die Sonne. Halt sie nie schief. Und wenn Dante sie auflegt, ruf mich an. Ich will dabei weinen.', 'zaertlich')]),
  node('tausch', [
    l('vinyl-vincent', 'Radio Rost. „Stimmen aus dem Staub“. Opa Funk hat mir die mal gegen eine Kiste Batterien gegeben. Wetterberichte zwischen den Liedern. Ich hab sie nie gehört. Ich hör nur zu, wenn’s regnet.', 'neutral'),
    l('vinyl-vincent', 'Zwei gegen eine. Fair ist das nicht. Für mich. Deal.'),
  ], { effects: [{ take: 'vinyl-platte', qty: 2 }, { give: 'schallplatte-06' }, set('vincent_06_getauscht')] }),
]);

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: { [dante.id]: dante, [vincent.id]: vincent },
  mapAdditions: {
    'dantes-werkstatt': {
      hotspots: [
        { id: 'plattenregal', at: 'plattenspieler', radius: 56, label: 'Dante Platten bringen', kind: 'talk', dialogue: dante.id, when: any(active(Q), done(Q)) },
      ],
    },
    schrottmarkt: {
      hotspots: [
        {
          id: 'q-platten-vincent', at: 'plattenstand-vincent', radius: 56, label: 'Vinyl-Vincent: seltene Pressungen', kind: 'talk', dialogue: vincent.id,
          when: all(active(Q), time('tag', 'abend')),
        },
      ],
    },
  },
};

