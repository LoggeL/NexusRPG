// Feste Begegnungen der Akt-2-Hauptgeschichte (world.md §5.3): der Bruch im Quantum-Campus und der Verkauf im
// Pumpwerk Sieben. Die Quests starten sie mit { battle } und prüfen { won }.
//
// Fassungen (Quests wählen per Bedingung, IDs in design/plan/gaps/combat-23.md):
// - `enc-labor-xion`: 5 Runden überleben (Ausgang = Ziel der Quest danach). Xion zieht sich bei 50 % zurück.
// - `enc-bruch-overwatch`: Rolle „auf der Brücke“ (Raven + Vega): Brücke 4 Runden halten, bis drinnen alle durch sind.
// - `enc-kanal-xion-ripper`: Xion, Ripper, Zerleger; Xion funkt ab Runde 2 Venom-Rekruten herbei (höchstens 2).
//   `…-fluchtweg` mit `prep-fluchtweg`: das Kanalvolk blockiert die Verstärkung.
//   `…-ueberrumpelt` nach `gc-33` [Körper 7]: Xion überrascht (Spielerseite zuerst, +15 auf den ersten Angriff).
import type { DialogueLine, EncounterDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import { byId } from '../combat/_foe';

const kanalKern = [
  { enemy: 'boss-xion-kanal' },
  { enemy: 'boss-ripper-kanal' },
  { enemy: 'zerleger', count: 2 },
] as const;

const kanalIntro: DialogueLine[] = [
  { speaker: 'narrator', text: 'Pumpwerk Sieben. Die Räder mahlen, das Wasser stinkt nach Chip-Müll. Auf einer Rolltrage zwischen zwei Pumpen: Aria. Bewusstlos. Mit Preisschild.' },
  { speaker: 'ripper', expr: 'signatur', text: 'Sechshundert für den Zerberster, Xion. Der Rest kann bei dir bleiben, ich hab keinen Platz im Kühlfach.' },
  { speaker: 'xion-venom', text: 'Siebenhundert. Blade sagt, ich soll verhandeln. Ich kann verhandeln. Ich bin nicht dumm.' },
  { speaker: 'ripper', text: 'Ach du Scheiße. Besuch. Schätzchen, man klopft, bevor man in ein Geschäftsgespräch platzt.' },
  { speaker: 'player', expr: 'wut', text: 'Die Ware ist nicht zu verkaufen. Die gehört zur Crew. Finger weg, ihr Leichenfledderer.' },
];

const list: EncounterDef[] = [
  // --- main-2-bruch ---------------------------------------------------------------------------
  {
    id: 'enc-labor-xion',
    name: 'Der Bruch: Xion im Labor',
    arena: 'arena-labor-quantum',
    enemies: [
      { enemy: 'boss-xion-labor' },
      { enemy: 'quantum-wachmann', count: 2 },
      { enemy: 'geschuetzdrohne' },
    ],
    objective: { kind: 'survive', rounds: 5 },
    canFlee: false,
    when: { act: 2 },
    intro: [
      { speaker: 'ki-nexus', text: 'Alarm. Jemand versucht, in mein System einzudringen. Wie unhöflich. Ich hätte Tee angeboten.' },
      { speaker: 'narrator', text: 'Rotlicht. Die Labortür fährt auf. Xion Venom steht im Rahmen und lässt die Kralle aufschnappen, als hätte er auf genau diesen Moment gewartet.' },
      { speaker: 'xion-venom', text: 'Ich wusste es. Ich bin nicht dumm. Ich weiß, wer ihr seid. Ihr seid … Einbrecher!' },
      { speaker: 'aria', expr: 'signatur', text: 'Bravo, Sherlock. Willst du ’n Keks dafür oder gleich eine aufs Maul?' },
      { speaker: 'nyra', expr: 'besorgt', text: 'Ich brauch fünf Runden am Terminal. Fünf! Haltet ihn mir vom Hals, sonst schreibt Nexus unsere Namen in sein Tagebuch.' },
      { speaker: 'narrator', text: 'Ziel: 5 Runden überleben. Die Geschützdrohne mag keine Deckungslücken – bleib hinter den Laborbänken.' },
    ],
    reward: { xp: 120 },
    onWin: [{ message: 'Nyras Terminal piept grün. Hinter euch kracht die Brandschutztür runter – zwischen euch und Nyra.' }],
  },
  {
    id: 'enc-bruch-overwatch',
    name: 'Der Bruch: Overwatch auf der Brücke',
    arena: 'arena-dach',
    enemies: [
      { enemy: 'quantum-scharfschuetze' },
      { enemy: 'quantum-wachmann', count: 2 },
      { enemy: 'spaeherdrohne', count: 2 },
    ],
    objective: { kind: 'survive', rounds: 4 },
    canFlee: false,
    when: { act: 2 },
    intro: [
      { speaker: 'narrator', text: '„Die Brücke“: das Landedeck über dem Labortrakt, Antennen, Kameras, Wind. Unten schleichen die anderen durch den Innenhof. Oben bist du die einzige Kamera, die auf ihrer Seite steht.' },
      { speaker: 'vega', expr: 'neutral', text: 'Laserlinie auf Turm zwei. Ein Scharfschütze. Wenn der den Innenhof sieht, sind die da unten Konfetti.' },
      { speaker: 'raven', expr: 'signatur', text: 'Dann sieht er eben uns. Licht aus, Funk aus, Fresse auf. Vier Runden. Wir sind die Ablenkung, Süße.' },
      { speaker: 'narrator', text: 'Ziel: 4 Runden die Brücke halten. Lichter ausschießen und Funk stören hilft: „Gehackt“ hält die Wachen vom Funkgerät fern.' },
    ],
    reward: { xp: 100 },
    onWin: [{ message: 'Funk tot, Turm dunkel, Drohnen im Gebüsch. Von unten kommt ein leises „Danke, ihr Irren“ über den Kanal.' }],
  },

  // --- main-2-kanal ---------------------------------------------------------------------------
  {
    id: 'enc-kanal-xion-ripper',
    name: 'Unter der Stadt: Xion und Ripper',
    arena: 'arena-rohre',
    enemies: [{ enemy: 'boss-xion-kanal-funk' }, ...kanalKern.slice(1)],
    objective: { kind: 'rescue', unit: 'aria', cell: [1, 3] },
    canFlee: false,
    when: { act: 2 },
    intro: [
      ...kanalIntro,
      { speaker: 'xion-venom', text: 'Funkruf! Alle Mann ins Pumpwerk! … Ja, ALLE. Auch du, Gerd. Zieh dir was an.' },
      { speaker: 'narrator', text: 'Ziel: alle Gegner besiegen. Aria liegt auf der Trage neben dir – fällt sie, ist der Kampf verloren. Xion funkt nach Verstärkung; gehackt oder betäubt kriegt er keinen Ton raus.' },
    ],
    reward: { xp: 150, credits: 100 },
    onWin: [{ message: 'Ripper ist durch ein Abflussrohr verschwunden, Xion humpelt fluchend davon. Aria atmet. Ihr Arm summt.' }],
  },
  {
    id: 'enc-kanal-xion-ripper-fluchtweg',
    name: 'Unter der Stadt: Xion und Ripper (ohne Verstärkung)',
    arena: 'arena-rohre',
    enemies: [...kanalKern],
    objective: { kind: 'rescue', unit: 'aria', cell: [1, 3] },
    canFlee: false,
    when: { all: [{ act: 2 }, { quest: 'prep-fluchtweg', state: 'done' }] },
    intro: [
      ...kanalIntro,
      { speaker: 'xion-venom', text: 'Funkruf! Alle Mann ins … Warum antwortet keiner? Wieso liegt da ein Rattenbürgermeister auf meinem Funkgerät?!' },
      { speaker: 'narrator', text: 'Weit hinten im Rohr klirren Kronkorken: Das Kanalvolk hat die Zugänge dichtgemacht. Keine Verstärkung. Nur ihr, die beiden und ein sehr verärgerter Pumpenrhythmus.' },
      { speaker: 'narrator', text: 'Ziel: alle Gegner besiegen. Aria liegt auf der Trage neben dir – fällt sie, ist der Kampf verloren.' },
    ],
    reward: { xp: 150, credits: 100 },
    onWin: [{ message: 'Gully schickt eine Ratte mit Grußkarte: „Ehrensache. Kanalvolk vergisst nicht.“ Aria atmet. Ihr Arm summt.' }],
  },
  {
    id: 'enc-kanal-xion-ripper-ueberrumpelt',
    name: 'Unter der Stadt: Xion überrascht',
    arena: 'arena-rohre',
    enemies: [...kanalKern, { enemy: 'venom-rekrut' }],
    objective: { kind: 'rescue', unit: 'aria', cell: [1, 3] },
    start: 'ueberrumpelt',
    canFlee: false,
    when: { act: 2 },
    intro: [
      { speaker: 'narrator', text: 'Du kommst von hinten über den Gitterboden, während Xion noch zählt. Sechshundert. Sechshundertzehn. Sechshundert…' },
      { speaker: 'player', expr: 'signatur', text: 'Verzählt, Kralle.' },
      { speaker: 'xion-venom', text: 'Ich hab mich nicht verzählt! Ich hab mich ERSCHROCKEN! Das ist was anderes!' },
      { speaker: 'ripper', text: 'Und das, meine Lieben, nennt man einen schlechten Verhandlungsabschluss.' },
      { speaker: 'narrator', text: 'Überrumpelt: Ihr seid zuerst dran, der erste Angriff bekommt +15. Aria liegt auf der Trage neben dir – fällt sie, ist der Kampf verloren.' },
    ],
    reward: { xp: 150, credits: 100 },
    onWin: [{ message: 'Xion hat seine Kralle im Gitterboden verkeilt und muss sie stehen lassen. Er kommt zurück. Später. Mit Handschuh.' }],
  },
];

export const ENCOUNTERS_AKT2_MAIN: Record<string, EncounterDef> = byId(list);

export const part: ContentPart = { encounters: ENCOUNTERS_AKT2_MAIN };
