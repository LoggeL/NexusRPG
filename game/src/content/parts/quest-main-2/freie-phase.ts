// Freie Phase Akt 2 (world.md §5.3): erste Chipträger („Das ist eine ausgezeichnete Entscheidung, Master.“),
// Quantum-Drohnen in der Unterstadt, „Chrome 10“-Rabatte überall, Glasarkaden und Datentunnel offen, Ödnis offen.
// Hier: Sendungen, Telefon-Hinweise, Gratis-Chip-Stände (neon-gasse, schrottmarkt, bahnhof-mitte; je einmal ein
// quantum-chip-schrott für prep-gegenmittel), Drohnen und Rabattplakate, Marlas Konvoi in die Ödnis (ohne Rostlaube).
// Die Nebenquests der freien Phase (pers-nyra-silent-angel, side-teekraenzchen …) gehören anderen Paketen.
import type { ContentPart } from '../../part';
import type { DialogueDef, NewsDef, PhoneMessageDef } from '../../../modules/contracts';
import { ACT2, ACT3, all, dlg, done, flag, l, msg, nar, node, not, pruef, set } from './_lib';

/** Nach dem Bruch und vor der Party. */
const FREI = all(ACT2, not(ACT3), done('main-2-bruch'));
const NACH_KANAL = all(FREI, done('main-2-kanal'));

const drohneTreffer = pruef('m2-frei-drohne', 'reflexe', 6, ['werfen', 'schiessen']);

// ---------------------------------------------------------------------------------------------- Chip-Stände

type Stand = { map: string; at: string; key: string; ort: string };
const STAENDE: Stand[] = [
  { map: 'neon-gasse', at: 'werbestand', key: 'neon', ort: 'Neon-Gasse' },
  { map: 'schrottmarkt', at: 'marktplatz-mitte', key: 'markt', ort: 'Schrottmarkt' },
  { map: 'bahnhof-mitte', at: 'kiosk-bahnhof', key: 'bahnhof', ort: 'Bahnhof Mitte' },
];

function standDialog(s: Stand): DialogueDef {
  const fertig = `chipstand_${s.key}_erledigt`;
  return dlg(`m2-chipstand-${s.key}`, [
    node('start', [
      nar(`Ein weißer Stand mit violettem Logo, mitten auf dem ${s.ort}. „CHROME 10 – GRATIS-TESTCHIP – HEUTE NUR FÜR SIE!“ Davor eine Schlange. Dahinter eine Promoterin mit violetten Augen.`),
      l('narrator', '„Ein Klick hinters Ohr, und Sie müssen nie wieder entscheiden! Das ist eine ausgezeichnete Entscheidung, Master.“'),
      nar('Der Mann vor dir lässt sich chippen. Er dreht sich um, lächelt und sagt zu niemand Bestimmtem: „Ja, Master.“'),
    ], {
      choices: [
        { text: '(Einen Chip nehmen. Und nicht einsetzen.)', effects: [{ give: 'quantum-chip-schrott' }, set(fertig)], next: 'genommen' },
        {
          text: '(Den Stand-Terminal hacken. Ausschuss auswerfen.)',
          effects: [{
            minigame: 'akt-hacken', level: 2, key: `m2-chipstand-${s.key}`, label: 'Chip-Stand: Ausschuss auswerfen',
            win: [{ give: 'quantum-chip-schrott', qty: 2 }, set(fertig), { xp: 25 }, msg('Der Stand spuckt zwei Chips aus und zeigt dann ein Testbild. Die Schlange löst sich auf. Verwirrt. Ungechippt.')],
            lose: [msg('Der Stand piept. Die Promoterin dreht den Kopf. Langsam. Zu langsam für einen Menschen.')],
          }],
        },
        { text: '(Weitergehen.)' },
      ],
    }),
    node('genommen', [
      nar('Die Promoterin lächelt. „Bitte setzen Sie ihn bald ein. Er wird sonst traurig.“ Der Chip in deiner Hand ist warm. Er ist leicht verbogen. Ausschuss.'),
    ]),
  ]);
}

const standDialoge = STAENDE.map(standDialog);

// ---------------------------------------------------------------------------------------------- Ödnis

const konvoi: DialogueDef = dlg('m2-konvoi', [
  node('start', [
    l('marla-sand', 'Der Konvoi fährt raus in die Ödnis. Staubstraße, dann weiter. Platz ist auf der Ladefläche zwischen Wasserfiltern und einer Ziege. Die Ziege beißt.', 'neutral'),
  ], {
    choices: [
      { text: '„Ich komm mit.“', effects: [{ travel: 'staubstrasse', entry: 'von-hafenkante', minutes: 90 }] },
      { text: '„Ein andermal.“' },
    ],
  }),
]);

// ---------------------------------------------------------------------------------------------- Sendungen und Telefon

const newsChips: NewsDef = {
  id: 'news-m2-gratischips',
  anchor: 'collin-charleston',
  headline: 'Chrome 10: Gratis für alle!',
  priority: 3,
  when: FREI,
  lines: [
    l('collin-charleston', 'Quantum verschenkt Testchips! An jeder Ecke! Ich hab mir auch einen geholt. Ich trag ihn aber in der Tasche. Für den Look.', 'freude'),
    l('delya-delloraine', 'Erste Nutzer berichten von großer Zufriedenheit. Sie berichten eigentlich nur noch das. Wortgleich.', 'besorgt'),
    l('collin-charleston', 'Und die Releaseparty ist ausverkauft! Wer nicht auf der Liste steht, kommt nicht rein. Ich steh auf der Liste. Ich bin die Liste.', 'signatur'),
  ],
};

const newsDrohnen: NewsDef = {
  id: 'news-m2-drohnen',
  anchor: 'delya-delloraine',
  headline: 'Drohnen über der Unterstadt',
  priority: 2,
  when: NACH_KANAL,
  lines: [
    l('delya-delloraine', 'Seit dem Einbruch patrouillieren Quantum-Drohnen über der Unterstadt. Quantum spricht von „Kundenservice aus der Luft“.', 'neutral'),
    l('delya-delloraine', 'Die Polizei sucht weiterhin nach den Tätern. Hinweise bitte an … ach, die Drohnen hören eh mit.', 'besorgt'),
  ],
};

const phone: PhoneMessageDef[] = [
  {
    id: 'tel-m2-raven-arkaden', from: 'raven', auto: NACH_KANAL,
    text: 'Die Glasarkaden lassen jetzt jeden rein, der lächelt. Quantum will Kundschaft. Hintereingang beim Feinkostladen geht auch ohne Lächeln.',
  },
  {
    id: 'tel-m2-dante-tunnel', from: 'dante', auto: all(FREI, flag('dante_beigetreten')),
    text: 'Unter dem Digitech-Areal ist der Kabelschacht frei. Datentunnel. Da hängt Nexus’ Altlast in den Leitungen. Und Chip-Splitter. Bring mir welche.',
  },
  {
    id: 'tel-m2-marla-konvoi', from: 'marla-sand', auto: NACH_KANAL,
    text: 'Konvoi fährt raus in die Ödnis, ab Karawanenstand Schrottmarkt. Wer mal aus der Stadt raus muss, weil die halbe Stadt ihn sucht: Ladefläche ist frei.',
  },
];

// ---------------------------------------------------------------------------------------------- Karten

const drohne = (id: string, at: string | [number, number]) => ({
  id, at, radius: 48, label: 'Quantum-Drohne', kind: 'look' as const, when: NACH_KANAL,
  lines: [
    nar('Eine weiße Drohne mit violettem Auge schwebt über der Gasse und scannt Gesichter. Unter ihr ein Lautsprecher: „Bitte lächeln Sie. Lächeln ist kostenlos. Noch.“'),
  ],
});

const drohneWerfen = (id: string, at: string | [number, number]) => ({
  id, at, radius: 48, label: 'Drohne mit einer Dose abwerfen', kind: 'check' as const, check: drohneTreffer, once: true, when: NACH_KANAL,
  altText: 'Die Dose fliegt knapp vorbei. Die Drohne guckt beleidigt. Lass es lieber.',
  effects: [{ give: 'quantum-chip-schrott' }, { wanted: 1 }, msg('Treffer. Die Drohne trudelt in einen Müllcontainer. Im Wrack: ein Quantum-Chip. Irgendwo piept ein Alarm.')],
});

const rabatt = (id: string, at: string | [number, number]) => ({
  id, at, radius: 44, label: '„Chrome 10“-Plakat', kind: 'look' as const, when: FREI,
  lines: [nar('„CHROME 10 – JETZT MIT 10 % AUF ALLES, WAS SIE NICHT BRAUCHEN!“ Darunter, mit Edding: „Und 100 % auf dein Hirn.“')],
});

export const part: ContentPart = {
  dialogues: Object.fromEntries([...standDialoge, konvoi].map(d => [d.id, d])),
  news: { [newsChips.id]: newsChips, [newsDrohnen.id]: newsDrohnen },
  phone: Object.fromEntries(phone.map(p => [p.id, p])),
  checks: { [drohneTreffer.id]: drohneTreffer },
  mapAdditions: {
    'neon-gasse': {
      hotspots: [
        { id: 'm2-chipstand-neon', at: 'werbestand', label: 'Gratis-Chip-Stand', kind: 'talk', dialogue: 'm2-chipstand-neon', when: all(FREI, not(flag('chipstand_neon_erledigt'))) },
        drohne('m2-drohne-neon', 'vordach'),
        drohneWerfen('m2-drohne-neon-wurf', 'feuerleiter'),
        rabatt('m2-rabatt-neon', 'stadt-tv'),
      ],
    },
    schrottmarkt: {
      hotspots: [
        { id: 'm2-chipstand-markt', at: 'marktplatz-mitte', label: 'Gratis-Chip-Stand', kind: 'talk', dialogue: 'm2-chipstand-markt', when: all(FREI, not(flag('chipstand_markt_erledigt'))) },
        rabatt('m2-rabatt-markt', 'marktstaende'),
        {
          id: 'm2-konvoi', at: 'karawanenstand', label: 'Marlas Konvoi in die Ödnis', kind: 'talk', dialogue: konvoi.id,
          when: all(ACT2, done('main-2-kanal'), not(flag('epilog'))),
        },
      ],
    },
    'bahnhof-mitte': {
      hotspots: [
        { id: 'm2-chipstand-bahnhof', at: 'kiosk-bahnhof', label: 'Gratis-Chip-Stand', kind: 'talk', dialogue: 'm2-chipstand-bahnhof', when: all(FREI, not(flag('chipstand_bahnhof_erledigt'))) },
        rabatt('m2-rabatt-bahnhof', 'wartehaeuschen'),
      ],
    },
    loetgassen: {
      hotspots: [
        drohne('m2-drohne-loet', 'funkmast'),
      ],
    },
  },
};
