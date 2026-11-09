// Kämpfe im Aria-Strang „Zerberster-Herz“ und Vex × Aria (world.md §4.7, Station 5 „Wem gehört der Arm?“,
// `pers-aria-zerberster`, Akt 2): Kampf in Rippers Praxis – gemeinsam mit Aria oder im Alleingang (ohne Begleiter).
// Je eine Fassung mit eigenen Zeilen für die Spielfigur Vex (`…-vex`); die Quest wählt per { playerIs: 'vex' }.
// Arena: Rippers Praxis als weißes Labor (Variante „Praxis“ wäre schöner, siehe gaps/combat.md).
import type { EncounterDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import { byId } from './_foe';

const ripperPraxis = [{ enemy: 'boss-ripper-praxis' }, { enemy: 'zerleger', count: 2 }] as const;

const list: EncounterDef[] = [
  {
    id: 'enc-praxis-ripper',
    name: 'Rippers Praxis: Wir holen ihn uns',
    arena: 'arena-labor',
    enemies: [...ripperPraxis],
    canFlee: false,
    when: { act: 2 },
    intro: [
      { speaker: 'ripper', expr: 'signatur', text: 'Na sieh mal einer an. Die Brecherin und ihr Schatz. Kommt ihr den Arm abholen oder den Rest von ihr abgeben?' },
      { speaker: 'aria', expr: 'wut', text: 'Ich hab noch einen Arm, der funktioniert, Ripper. Rate mal, welcher dir gleich die Zähne nachzählt.' },
      { speaker: 'ripper', text: 'Gekauft ist gekauft, Schätzchen. Der Kern war nie bezahlt. Ich hol mir nur, was mir gehört.' },
      { speaker: 'aria', expr: 'wut', text: 'Du hast mir ’nen Arm mit Ausschalter verkauft, du Wichser. Heute schalt ich DICH aus.' },
    ],
    reward: { xp: 120, credits: 100 },
    onWin: [{ message: 'Ripper liegt hinter der Behandlungsliege. In der obersten Schublade: ein Zettel mit einem Code und einem Kaffeefleck.' }],
  },
  {
    id: 'enc-praxis-ripper-vex',
    name: 'Rippers Praxis: Wir holen ihn uns',
    arena: 'arena-labor',
    enemies: [...ripperPraxis],
    canFlee: false,
    when: { all: [{ act: 2 }, { playerIs: 'vex' }] },
    intro: [
      { speaker: 'ripper', expr: 'signatur', text: 'Und mein Ratenarm kommt auch zu Besuch. Montag ist erst in vier Tagen, Schätzchen.' },
      { speaker: 'player', expr: 'wut', text: 'Code. Jetzt. Oder ich zahl die nächste Rate in Zähnen. Deinen.' },
      { speaker: 'aria', expr: 'signatur', text: 'Hörst du, Ripper? Die Postbotin liefert heute selbst aus. Ich halt nur die Tür auf.' },
      { speaker: 'ripper', text: 'Rührend. Zwei Blecharme und ein halbes Hirn. Jungs, Inventur!' },
      { speaker: 'player', expr: 'signatur', text: 'Zöpfe. Links oder rechts?' },
      { speaker: 'aria', expr: 'freude', text: 'Mitte. Immer Mitte.' },
    ],
    reward: { xp: 120, credits: 100 },
    onWin: [{ message: 'Aria hält den Code-Zettel hoch wie eine Trophäe. „Zugestellt.“ – Vex: „Das ist mein Spruch.“' }],
  },
  {
    id: 'enc-praxis-ripper-allein',
    name: 'Rippers Praxis: Alleingang',
    arena: 'arena-labor',
    enemies: [...ripperPraxis],
    solo: true,
    // Nachts reingeschlichen: Ziel ist die Schublade mit dem Code (2 AP daneben), nicht Rippers Kopf.
    start: 'ueberrumpelt',
    objective: { kind: 'hack', cell: [10, 4], ap: 2 },
    canFlee: false,
    when: { act: 2 },
    intro: [
      { speaker: 'ripper', expr: 'signatur', text: 'Allein? Nachts? In meiner Praxis? Schätzchen, das ist entweder Mut oder eine Organspende.' },
      { speaker: 'narrator', text: 'Zwei Zerleger schieben sich vor die Schublade mit dem Code. Ihre Zangen klicken im Takt. Du brauchst nur die Schublade – nicht den Sieg.' },
      { speaker: 'ripper', text: 'Was haben wir denn da? Hübsche Cyberware. Ich nehm sie gern in Zahlung. Stück für Stück.' },
    ],
    reward: { xp: 140, credits: 100 },
    onWin: [{ message: 'Du hast den Code. Und eine Platzwunde, die du Aria erklären musst.' }],
  },
  {
    id: 'enc-praxis-ripper-allein-vex',
    name: 'Rippers Praxis: Alleingang',
    arena: 'arena-labor',
    enemies: [...ripperPraxis],
    solo: true,
    // Nachts reingeschlichen: Ziel ist die Schublade mit dem Code (2 AP daneben), nicht Rippers Kopf.
    start: 'ueberrumpelt',
    objective: { kind: 'hack', cell: [10, 4], ap: 2 },
    canFlee: false,
    when: { all: [{ act: 2 }, { playerIs: 'vex' }] },
    intro: [
      { speaker: 'ripper', expr: 'signatur', text: 'Vex. Allein. Nachts. Ohne deine Brecherin. Wer passt denn jetzt auf dich auf, Schätzchen?' },
      { speaker: 'player', expr: 'neutral', text: 'Keiner. Darum geht’s ja. Sie muss das nicht sehen.' },
      { speaker: 'ripper', text: 'Wie romantisch. Ich schick ihr nachher ein Foto. Von deinem Arm. In meiner Vitrine.' },
      { speaker: 'player', expr: 'wut', text: 'Du kriegst deine Raten, Ripper. Aber ihren Arm kriegst du nicht.' },
    ],
    reward: { xp: 140, credits: 100 },
    onWin: [{ message: 'Der Code liegt in deiner Metallhand. Die ist ruhig wie immer. Die andere zittert.' }],
  },
];

export const ENCOUNTERS_ARIA: Record<string, EncounterDef> = byId(list);

export const part: ContentPart = { encounters: ENCOUNTERS_ARIA };
