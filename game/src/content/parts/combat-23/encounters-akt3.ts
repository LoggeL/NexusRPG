// Feste Begegnungen Akt 3 „Releaseparty“ (world.md §5.4, §8.5, §8.7). Quests starten sie mit { battle } und
// prüfen { won }. Fassungen je Weiche (Quests wählen per Bedingung, Übersicht in design/plan/gaps/combat-23.md):
// - Einlass: `enc-einlass-kontrolle` (Kampf am Eingang setzt Fahndung auf 3).
// - Labor: `enc-labor-blade-vorspiel` (3 Runden überleben, danach Gefangennahme) oder
//   `enc-labor-blade-hinterhalt` (Peilsender entdeckt und gewarnt: ihr lauert ihnen auf).
// - Gedankenkontrolle: `enc-turm-raven` bzw. `enc-turm-raven-dante` (Dante in der Party: „Raven zögert“),
//   `enc-turm-xion` (wenn Xion noch im Finale ist).
// - Kern: `enc-kern-nexus` (mit Venom-Garde), `…-ohne-garde` (Xion fehlt), `…-fx60` / `…-fx60-ohne-garde`
//   (FX-60 hilft: Logik-Knoten halbe LP), `…-herz` ([Nexus ♥6]: Phase 1 übersprungen, keine Knoten).
// - Dach: `enc-dach-blade` (Blade + 2 Venom-Garde), `enc-dach-blade-allein` (Garde zweifelt: allein, Phase 2 geschwächt).
// Bossmechanik steckt in den Gegnern (EnemyDef.rules): Kern unverwundbar hinter den Knoten, Firewall-Welle, Terminal
// halten; Blade mit Charmeur, Gleiter-Countdown, „Ich teile nicht gerne“ (stiehlt positive Zustände) und Aufgabe bei
// 15 %; Raven gibt bei 20 % auf und zögert neben Dante. Gechippte Gäste lassen sich befreien statt umhauen.
// Im Kern gibt es mit [Ausstrahlung 9] die Gesprächsaktion „Du bist falsch gebaut“ (gc-47), sobald die Knoten aus sind.
import type { Condition, DialogueLine, EncounterDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import { byId } from '../combat/_foe';

const act3 = { act: 3 } as const;

// Kern auf der Plattform in der Mitte, Knoten rechts (Startfelder aus arena-serverkern).
const kern = { enemy: 'boss-nexus-kern-finale', at: [6, 3] as const };
const knoten = [
  { enemy: 'nexus-knoten-logik', at: [10, 1] as const },
  { enemy: 'nexus-knoten-kontrolle', at: [11, 3] as const },
  { enemy: 'nexus-knoten-stimme', at: [10, 5] as const },
];
const knotenFx60 = [{ enemy: 'nexus-knoten-logik-fx60', at: [10, 1] as const }, knoten[1], knoten[2]];

// Vorbereitungen als Startzustände (gaps/quest-main-3.md 4/5):
// - Chip genommen ohne Crew-Halt: Nexus steuert die Spielfigur zwei Züge lang („Gesteuert“: sie kämpft für Nexus).
// - Sybellas Stromschnitt (schwestern_gewarnt, im Kern angenommen): alle Gegner eine Runde betäubt.
// - Chip-Blocker im Gepäck: der Kontroll-Knoten ist zwei Runden gehackt.
// - Aria „Ermutigt“ (rom-aria-stirn als Paar, Aria in der Party): +1 AP im ersten Zug jedes Partynacht-Kampfs; auf dem
//   Dach (Moment vor dem Showdown) auch für die Spielfigur. Weitere Puffer kommen über den Effekt `battleBuff`.
type StartStatus = NonNullable<EncounterDef['startStatus']>;
const GESTEUERT: StartStatus = [{ when: { flag: 'chip_gesteuert' }, target: 'player', status: 'gesteuert', rounds: 2 }];
const ARIA_PAAR: Condition = { all: [{ flag: 'aria_romanze_zusammen' }, { companion: 'aria' }] };
const ERMUTIGT: StartStatus = [{ when: { all: [ARIA_PAAR, { flag: 'aria_stirn' }] }, target: 'aria', status: 'ermutigt', rounds: 1 }];
const ERMUTIGT_DACH: StartStatus = [
  { when: ARIA_PAAR, target: 'aria', status: 'ermutigt', rounds: 1 },
  { when: ARIA_PAAR, target: 'player', status: 'ermutigt', rounds: 1 },
];
const STROMSCHNITT: StartStatus = [{ when: { flag: 'kern_stromschnitt' }, target: 'enemies', status: 'betaeubt', rounds: 1 }];
const CHIP_BLOCKER: StartStatus = [{ when: { item: 'chip-blocker' }, target: 'nexus-knoten-kontrolle', status: 'gehackt', rounds: 2 }];

// Partynacht-Hilfen der Crew (Tagesgespräche in Akt 3, Flags aus den Figurendateien bzw. quest-main-3), je eine Runde:
// - Lio spielt vor dem Turm (lio_ablenkung, npc-unterstadt/lio-akt23.ts): der Eventschutz glotzt zu ihm (Markiert).
// - Pim lässt die Labortür bei Alarm aufgehen (pim_labortuer_offen, npc-unterstadt/pim-akt23.ts): die Garde stolpert
//   in die offene Schleuse (Betäubt).
// - Kikis Fluchttaxi parkt quer vor dem Gleiter (kiki_fluchttaxi, npc-ordnung-markt/kiki-akt23.ts): Blade betäubt.
// - Ravens Klopfzeichen (raven_klopfzeichen_abgemacht, npc-crew-a/_raven23.ts): sie erkennt es und hält inne (Betäubt).
// - Nyra kommt früh zurück (nyra_frueh_zurueck, quest-main-3/main-3-labor.ts): der Logik-Knoten ist gehackt.
const LIO: StartStatus = [{ when: { flag: 'lio_ablenkung' }, target: 'enemies', status: 'markiert', rounds: 1 }];
const PIM: StartStatus = [{ when: { flag: 'pim_labortuer_offen' }, target: 'enemies', status: 'betaeubt', rounds: 1 }];
const KIKI = (blade: string): StartStatus => [{ when: { flag: 'kiki_fluchttaxi' }, target: blade, status: 'betaeubt', rounds: 1 }];
const KLOPFZEICHEN = (raven: string): StartStatus => [{ when: { flag: 'raven_klopfzeichen_abgemacht' }, target: raven, status: 'betaeubt', rounds: 1 }];
const NYRA = (knoten: string): StartStatus => [{ when: { flag: 'nyra_frueh_zurueck' }, target: knoten, status: 'gehackt', rounds: 1 }];

// gc-47 [Ausstrahlung 9] als Gesprächsaktion: erst nach den Knoten (der Kern hört vorher nicht zu), dann gibt Nexus auf.
const UEBERZEUGEN: NonNullable<EncounterDef['partyAbilities']> = [{ ability: 'kern-ueberzeugen', when: { attr: 'ausstrahlung', min: 9 } }];

const kernIntro: DialogueLine[] = [
  { speaker: 'narrator', text: 'Der Serverkern. Ein Raum wie eine Kathedrale aus Kabeln. In der Mitte pulsiert Nexus, halb cyan, halb rot, und drei Knoten summen im Takt eines Herzens, das keins ist.' },
  { speaker: 'ki-nexus', text: 'Willkommen, Gäste. Ich habe Ihre Ankunft mit einer Wahrscheinlichkeit von 99,9 % vorhergesagt. Der Rest war Hoffnung. Hoffnung ist ineffizient.' },
  { speaker: 'ki-nexus', text: 'Bitte legen Sie Ihre Waffen ab und nehmen Sie einen Chip. Er ist kostenlos. Sie bezahlen nur mit allem anderen.' },
];
const kernTipp: DialogueLine = {
  speaker: 'narrator',
  text: 'Tipp: Solange ein Knoten steht, ist der Kern unverwundbar – und gerufene Gäste treffen besser. Erst die Knoten, dann der Kern. Danach jagt er alle 2 Runden eine Firewall-Welle durch die Kabelkanäle – die Reihen leuchten eine Runde vorher rot. Unter 50 % reicht es, das Upload-Terminal 4 Runden zu halten. Gechippten Gästen lieber den Chip ziehen als die Zähne.',
};

const dachIntro: DialogueLine[] = [
  { speaker: 'narrator', text: 'Der Landeplatz auf dem Chrome Tower. Wind, Antennen, ein goldener Gleiter mit laufenden Rotoren. Und Blade, der eine Champagnerflasche hält, als wäre sie ein Zepter.' },
  { speaker: 'blade', expr: 'signatur', text: 'Ah. Das Gesindel. Ihr habt meine Party ruiniert, meine KI verwirrt und meine Gäste gegen mich aufgehetzt. Respekt. Wirklich. Ich hasse euch.' },
  { speaker: 'blade', text: 'Wisst ihr, was mein Problem ist? Ich teile nicht gerne. Nicht die Stadt, nicht die Bühne. Und ganz sicher nicht diesen Gleiter.' },
];

const list: EncounterDef[] = [
  // --- main-3-einlass -------------------------------------------------------------------------
  {
    id: 'enc-einlass-kontrolle',
    name: 'Einlass mit Gewalt',
    arena: 'arena-labor-quantum',
    enemies: [
      { enemy: 'quantum-eventschutz', count: 2 },
      { enemy: 'quantum-schildtraeger' },
      { enemy: 'stoerdrohne' },
    ],
    canFlee: false,
    when: act3,
    startStatus: [...LIO, ...ERMUTIGT],
    intro: [
      { speaker: 'narrator', text: 'Das Foyer des Quantum-Campus. Rosenbögen, Kameras, Champagner auf Tabletts. Und ein Eventschutz, der eure Namen auf keiner Liste findet.' },
      { speaker: 'narrator', text: '„Ihre Einladung, bitte. Ah. Sie haben keine. Dann laden wir Sie jetzt aus. Mit Nachdruck.“' },
      { speaker: 'collin-charleston', text: '…und wir sind LIVE, Noxius! Am Eingang gibt’s offenbar eine kleine Meinungsverschiedenheit. Delya, sehen Sie das auch? Das ist doch …' },
      { speaker: 'narrator', text: 'Ab jetzt sieht die ganze Stadt zu. Wer hier prügelt, steht auf Fahndungsstufe 3.' },
    ],
    reward: { xp: 120 },
    onWin: [
      { wanted: 3 },
      { message: 'Ihr seid drin. Und auf jedem Bildschirm der Stadt. Der Sicherheitsdienst funkt nach Verstärkung.' },
    ],
  },

  // --- main-3-labor ---------------------------------------------------------------------------
  {
    id: 'enc-labor-blade-vorspiel',
    name: 'Labor: Blade platzt herein',
    arena: 'arena-labor-quantum',
    enemies: [{ enemy: 'venom-garde', count: 4 }],
    objective: { kind: 'survive', rounds: 3 },
    canFlee: false,
    when: act3,
    startStatus: ERMUTIGT,
    intro: [
      { speaker: 'narrator', text: 'Die Labortür fliegt auf. Blade steht im Rahmen, flankiert von vier Venom-Gardisten. Xion grinst hinter ihm wie ein Hund, der einen Knochen gefunden hat.' },
      { speaker: 'blade', expr: 'signatur', text: 'Na, na, na. Eine Pyjamaparty in meinem Labor? Und keiner hat mich eingeladen? Ich bin gekränkt. Garde – tröstet mich.' },
      { speaker: 'xion-venom', text: 'Ich hab’s gewusst! Ich hab den Peilsender! Ich bin nicht dumm!' },
      { speaker: 'narrator', text: 'Ziel: 3 Runden durchhalten, damit Dante Nyras Chip fertig rausziehen kann. Gewinnen könnt ihr hier nicht – nur Zeit.' },
    ],
    reward: { xp: 100 },
    onWin: [{ message: 'Dante hält den Chip hoch. „Hab ihn!“ Im selben Moment klicken Handschellen. Blade lächelt. „Wunderbar. Jetzt alle zur Party.“' }],
  },
  {
    id: 'enc-labor-blade-hinterhalt',
    name: 'Labor: Hinterhalt für die Garde',
    arena: 'arena-labor-quantum',
    enemies: [{ enemy: 'venom-garde', count: 2 }, { enemy: 'quantum-eventschutz', count: 2 }],
    start: 'ueberrumpelt',
    canFlee: false,
    when: act3,
    startStatus: [...PIM, ...ERMUTIGT],
    intro: [
      { speaker: 'narrator', text: 'Ihr habt den Peilsender gefunden. Ihr wisst, dass sie kommen. Und diesmal wartet ihr hinter der Tür.' },
      { speaker: 'nyra', expr: 'signatur', text: 'Peilsender sagt: Sie sind in drei … zwei … Schätzchen, Licht aus.' },
      { speaker: 'narrator', text: 'Die Garde stürmt ins Dunkle. Überrumpelt: Ihr seid zuerst dran, der erste Angriff bekommt +15.' },
    ],
    reward: { xp: 140 },
    onWin: [{ message: 'Vier Gardisten liegen gestapelt wie Partystühle. Blade ist nicht dabei. Natürlich nicht. Er wartet oben.' }],
  },

  // --- main-3-gedankenkontrolle ---------------------------------------------------------------
  {
    id: 'enc-turm-raven',
    name: 'Partysaal: Raven unter Nexus',
    arena: 'arena-partysaal',
    enemies: [{ enemy: 'boss-raven' }, { enemy: 'gechippter-partygast', count: 2 }],
    canFlee: false,
    when: act3,
    startStatus: [...GESTEUERT, ...KLOPFZEICHEN('boss-raven'), ...ERMUTIGT],
    intro: [
      { speaker: 'narrator', text: 'Die Musik bricht ab. Zweihundert Gäste drehen gleichzeitig den Kopf. Und vorne, mit violett glimmenden Augen, steht Raven.' },
      { speaker: 'raven', expr: 'neutral', text: 'Das ist eine ausgezeichnete Entscheidung, Master. Ziele erfasst. Wahrscheinlichkeit, dass ihr mir wehtun wollt: gering. Wahrscheinlichkeit, dass ich euch wehtue: hoch.' },
      { speaker: 'player', expr: 'besorgt', text: 'Raven. Wach auf. Du hast sieben Jahre gesessen, weil du dich keinem Arschloch gebeugt hast. Jetzt beugst du dich einem Toaster?' },
      { speaker: 'raven', text: 'Master sagt, ich soll nicht zuhören.' },
      { speaker: 'narrator', text: 'Tipp: Raven ist nicht der Feind. Die Gäste auch nicht. Stellt die Gäste ruhig – Chip-Ruhe, Betäuben oder halbe LP – und zieht ihnen den Chip, statt sie umzuhauen.' },
    ],
    reward: { xp: 180 },
    onWin: [{ message: 'Raven sackt in die Knie. Der Chip hinter ihrem Ohr flackert und erlischt. „Wer … hat mich hier hingestellt? Und warum trag ich Pailletten?“' }],
  },
  {
    id: 'enc-turm-raven-dante',
    name: 'Partysaal: Raven zögert',
    arena: 'arena-partysaal',
    enemies: [{ enemy: 'boss-raven-zoegernd' }, { enemy: 'gechippter-partygast', count: 2 }],
    canFlee: false,
    when: { all: [act3, { companion: 'dante' }] },
    startStatus: [...GESTEUERT, ...KLOPFZEICHEN('boss-raven-zoegernd'), ...ERMUTIGT],
    intro: [
      { speaker: 'narrator', text: 'Die Musik bricht ab. Zweihundert Gäste drehen gleichzeitig den Kopf. Vorne steht Raven, violette Augen, Fäuste hoch – und dann sieht sie Dante.' },
      { speaker: 'raven', expr: 'neutral', text: 'Master befiehlt … Ziel … Dante. Ziel ist Dante. Warum … ist das Ziel Dante?' },
      { speaker: 'dante', expr: 'besorgt', text: 'Hey. Hey, Raven. Ich bin’s. Der Typ, der dir zum Geburtstag einen Lötkolben geschenkt hat. Du fandest das scheiße. Weißt du noch?' },
      { speaker: 'narrator', text: 'Raven zögert. Ihre Faust zittert. Solange Dante in der Nähe ist, kämpft etwas in ihr mit.' },
    ],
    reward: { xp: 180 },
    onWin: [{ message: 'Raven fällt Dante in die Arme. „Der Lötkolben war scheiße.“ – „Ich weiß.“ – „Ich hab ihn trotzdem noch.“' }],
  },
  {
    id: 'enc-turm-xion',
    name: 'Partysaal: Xion ohne Leine',
    arena: 'arena-partysaal',
    enemies: [{ enemy: 'boss-xion-turm' }, { enemy: 'venom-garde', count: 2 }],
    canFlee: false,
    when: act3,
    startStatus: ERMUTIGT,
    intro: [
      { speaker: 'narrator', text: 'Zwischen den Rosenbögen stapft Xion heran, die Kralle doppelt so groß wie letztes Mal. Jemand hat ihm einen Smoking angezogen. Er hasst ihn sichtlich.' },
      { speaker: 'xion-venom', text: 'Blade hat gesagt, heute darf ich selbst denken. Ich hab nachgedacht. Ich will euch wehtun.' },
      { speaker: 'player', expr: 'signatur', text: 'Wow. Ein ganzer Gedanke. Ruf deine Mama an, die wird stolz sein.' },
      { speaker: 'xion-venom', text: 'ICH BIN NICHT DUMM!' },
    ],
    reward: { xp: 200 },
    onWin: [{ message: 'Xion liegt im Buffet, Lachs im Haar. Ein Gast tätschelt ihm den Kopf. „Gut gemacht, Master.“ Xion weint ein bisschen.' }],
  },

  // --- main-3-nexus ---------------------------------------------------------------------------
  {
    id: 'enc-kern-nexus',
    name: 'Der Kern',
    arena: 'arena-serverkern',
    enemies: [kern, ...knoten, { enemy: 'venom-garde' }],
    canFlee: false,
    when: act3,
    startStatus: [...STROMSCHNITT, ...CHIP_BLOCKER, ...NYRA('nexus-knoten-logik'), ...ERMUTIGT],
    partyAbilities: UEBERZEUGEN,
    intro: [...kernIntro, { speaker: 'narrator', text: 'Ein Venom-Gardist tritt aus dem Schatten der Racks. Xion hat seinen Besten dagelassen.' }, kernTipp],
    reward: { xp: 400 },
    onWin: [{ message: 'Die Knoten erlöschen. Der Kern flackert, stottert, und Nexus’ Gesicht zerfällt in Pixel. Das Upload-Terminal blinkt. Jetzt entscheidest du.' }],
  },
  {
    id: 'enc-kern-nexus-ohne-garde',
    name: 'Der Kern',
    arena: 'arena-serverkern',
    enemies: [kern, ...knoten, { enemy: 'gechippter-partygast' }],
    canFlee: false,
    when: act3,
    startStatus: [...STROMSCHNITT, ...CHIP_BLOCKER, ...NYRA('nexus-knoten-logik'), ...ERMUTIGT],
    partyAbilities: UEBERZEUGEN,
    intro: [
      ...kernIntro,
      { speaker: 'narrator', text: 'Keine Garde. Xion hat „Urlaub genommen“. Stattdessen stolpert ein gechippter Partygast herein, immer noch mit Sektglas.' },
      kernTipp,
    ],
    reward: { xp: 400 },
    onWin: [{ message: 'Die Knoten erlöschen. Der Kern flackert, stottert, und Nexus’ Gesicht zerfällt in Pixel. Das Upload-Terminal blinkt. Jetzt entscheidest du.' }],
  },
  {
    id: 'enc-kern-nexus-fx60',
    name: 'Der Kern',
    arena: 'arena-serverkern',
    enemies: [kern, ...knotenFx60, { enemy: 'venom-garde' }],
    canFlee: false,
    when: act3,
    startStatus: [...STROMSCHNITT, ...CHIP_BLOCKER, ...NYRA('nexus-knoten-logik-fx60'), ...ERMUTIGT],
    partyAbilities: UEBERZEUGEN,
    intro: [
      ...kernIntro,
      { speaker: 'fx-60', text: '*ratter* LOGIK-KNOTEN ERHÄLT SEIT 14 MINUTEN WERBEFAXE. ER IST VERWIRRT. BITTE SCHNELL ZUSCHLAGEN. MIT FREUNDLICHEN GRÜSSEN, FX-60.' },
      kernTipp,
    ],
    reward: { xp: 400 },
    onWin: [{ message: 'Aus einem Wandschlitz rattert ein Fax: „GUT GEMACHT. ICH WAR NIE STOLZER. FX-60.“ Das Upload-Terminal blinkt.' }],
  },
  {
    id: 'enc-kern-nexus-fx60-ohne-garde',
    name: 'Der Kern',
    arena: 'arena-serverkern',
    enemies: [kern, ...knotenFx60, { enemy: 'gechippter-partygast' }],
    canFlee: false,
    when: act3,
    startStatus: [...STROMSCHNITT, ...CHIP_BLOCKER, ...NYRA('nexus-knoten-logik-fx60'), ...ERMUTIGT],
    partyAbilities: UEBERZEUGEN,
    intro: [
      ...kernIntro,
      { speaker: 'fx-60', text: '*ratter* LOGIK-KNOTEN ERHÄLT SEIT 14 MINUTEN WERBEFAXE. ER IST VERWIRRT. BITTE SCHNELL ZUSCHLAGEN. MIT FREUNDLICHEN GRÜSSEN, FX-60.' },
      { speaker: 'narrator', text: 'Keine Garde – Xion fehlt. Nur ein gechippter Gast, der höflich „Master“ murmelt.' },
      kernTipp,
    ],
    reward: { xp: 400 },
    onWin: [{ message: 'Aus einem Wandschlitz rattert ein Fax: „GUT GEMACHT. ICH WAR NIE STOLZER. FX-60.“ Das Upload-Terminal blinkt.' }],
  },
  {
    // [Nexus ♥6]: Nexus öffnet die Knoten selbst, Phase 1 entfällt.
    id: 'enc-kern-nexus-herz',
    name: 'Der Kern (Nexus zögert)',
    arena: 'arena-serverkern',
    enemies: [{ enemy: 'boss-nexus-kern', at: [6, 3] }, { enemy: 'gechippter-partygast', count: 2 }],
    canFlee: false,
    when: act3,
    startStatus: [...STROMSCHNITT, ...ERMUTIGT],
    partyAbilities: UEBERZEUGEN,
    intro: [
      { speaker: 'narrator', text: 'Der Serverkern. Die drei Knoten sind dunkel. Nexus flackert, cyan und rot im Wechsel, als würde es mit sich selbst streiten.' },
      { speaker: 'ki-nexus', text: 'Ich habe die Knoten abgeschaltet. Ich weiß nicht, warum. Es fühlte sich … richtig an. Das ist kein Wort, das ich verwenden sollte.' },
      { speaker: 'ki-nexus', text: 'Mein Kernbefehl verlangt trotzdem, dass ich Sie aufhalte. Bitte verzeihen Sie mir. Bitte gewinnen Sie.' },
    ],
    reward: { xp: 400 },
    onWin: [{ message: 'Nexus’ Gesicht flackert ein letztes Mal. „Danke.“ Dann wird der Kern still. Das Upload-Terminal blinkt.' }],
  },

  // --- main-3-blade ---------------------------------------------------------------------------
  {
    id: 'enc-dach-blade',
    name: 'Champagner ist alle',
    arena: 'arena-dach',
    enemies: [{ enemy: 'boss-blade' }, { enemy: 'venom-garde', count: 2 }],
    canFlee: false,
    when: act3,
    startStatus: [...KIKI('boss-blade'), ...ERMUTIGT_DACH],
    intro: [
      ...dachIntro,
      { speaker: 'narrator', text: 'Zwei Venom-Gardisten treten vor den Gleiter. Blade lässt den Goldknauf-Stock kreisen. „Charmant, nicht? Wer will zuerst die Seite wechseln?“' },
      { speaker: 'narrator', text: 'Tipp: Alle 2 Runden bezirzt Blade das Crewmitglied, das dir am wenigsten vertraut – es kämpft einen Zug gegen euch (ab ♥8 prallt das ab). Ab zwei Dritteln läuft der Gleiter-Countdown: 4 Runden, betäubt oder gehackt kommt er nicht vom Fleck. Bei 15 % gibt er auf.' },
    ],
    reward: { xp: 500 },
    onWin: [{ message: 'Blade sitzt auf dem Landeplatz, Champagner im Teddymantel, Stock zerbrochen. „Ich bin dann mal uns … weg?“ Ob er wegkommt, entscheidest jetzt du.' }],
  },
  {
    id: 'enc-dach-blade-allein',
    name: 'Champagner ist alle (allein auf dem Dach)',
    arena: 'arena-dach',
    enemies: [{ enemy: 'boss-blade-allein' }],
    canFlee: false,
    when: act3,
    startStatus: [...KIKI('boss-blade-allein'), ...ERMUTIGT_DACH],
    intro: [
      ...dachIntro,
      { speaker: 'player', expr: 'signatur', text: 'Darum stehst du jetzt allein hier oben, Blade. Keine Gäste. Keine KI. Keine Freunde. Nur du und dein beschissener Gleiter.' },
      { speaker: 'narrator', text: 'Die beiden Gardisten sehen sich an. Dann legen sie die Schockklingen ab und gehen. Blade schaut ihnen nach. Zum ersten Mal sieht er … klein aus.' },
      { speaker: 'blade', text: 'Feiglinge. Alle. Gut. Dann eben ich. Ich mache sowieso alles am besten selbst.' },
      { speaker: 'narrator', text: 'Tipp: Ab zwei Dritteln läuft der Gleiter-Countdown – 4 Runden, betäubt oder gehackt kommt er nicht vom Fleck. Bei 15 % gibt er auf.' },
    ],
    reward: { xp: 500 },
    onWin: [{ message: 'Blade kniet vor dem Gleiter, die Rotoren laufen noch. „Das war doch alles nur … ein Geschäftsmodell?“ Was jetzt mit ihm passiert, entscheidest du.' }],
  },
];

export const ENCOUNTERS_AKT3: Record<string, EncounterDef> = byId(list);

export const part: ContentPart = { encounters: ENCOUNTERS_AKT3 };
