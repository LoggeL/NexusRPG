// Hauptquest main-2-countdown „Zehn, neun, acht …“ (world.md §5.3). dantes-werkstatt, direkt nach main-2-kanal.
//
// Dante verliert gerade beim Eins! gegen sich selbst („Nicht fluchen!“). Nexus startet die Selbstzerstörung des Chips:
//   gc-34 [Technik 6] richtige Leitung → nexus-chip-defekt · akt-countdown (Stufe 3, Schlüssel countdown-chip,
//   +3 s mit dante_notfall im Minispiel) → nexus-chip-defekt · sonst Wurf in die Gasse (Mülltonne fliegt, Konfetti-
//   Funken; in der Tonne bleibt ein quantum-chip-schrott liegen).
// Danach: Variante A Aria erwacht auf der Einbau-Liege (Dante zieht den Chip → quantum-chip-schrott) · Variante B mit
// Proband 47: Dante zieht dessen Chip · Variante B mit Jimmy: Jimmy ist schon zurück bei Quantum.
// Anker: Dante tritt bei (Freeze „Genie und Wahnsinn. Ab heute wieder im Dienst.“). Hunter ruft zur Krisensitzung.
// Die Zerberster-Folgen (pers-aria-zerberster, rom-aria-ausfall) gehören den Paketen vexaria/npc-crew.
import type { ContentPart } from '../../part';
import type { CutsceneDef, DialogueDef, Effect, PhoneMessageDef, QuestDef } from '../../../modules/contracts';
import {
  CREW_HERZEN, VEX, NOT_VEX, active, all, any, dlg, done, flag, herz, item, l, msg, nar, noFlag, node, noItem, not, set,
} from './_lib';

const Q = 'main-2-countdown';
const AKTIV = active(Q);
const ENTSCHAERFT = flag('countdown_entschaerft');
const GEWORFEN = flag('countdown_geworfen');
const CHIP_ERLEDIGT = any(ENTSCHAERFT, GEWORFEN);
const BEIGETRETEN = flag('dante_beigetreten');

const VAR_ARIA = all(noFlag('jimmy_gechippt'), noFlag('proband_gechippt'));
const VAR_PROBAND = all(flag('proband_gechippt'), noFlag('jimmy_gechippt'));
const VAR_JIMMY = flag('jimmy_gechippt');

/** Chip aus dem Inventar nehmen, falls noch da (take würde sonst die ganze Liste ablehnen). */
const ENTSCHAERFT_FX: Effect[] = [set('countdown_entschaerft'), { give: 'nexus-chip-defekt' }, xpFx(60)];
function xpFx(n: number): Effect { return { xp: n }; }

// ---------------------------------------------------------------------------------------------- Quest

const quest: QuestDef = {
  id: Q,
  kind: 'main',
  title: 'Zehn, neun, acht …',
  summary: 'Der Chip aus dem Labor zählt runter. Dante sitzt am Eins!-Tisch und verliert gegen sich selbst. Wir brauchen ihn. Jetzt.',
  giver: 'raven',
  act: 2,
  autoStart: done('main-2-kanal'),
  steps: [
    {
      id: 'chip',
      text: 'Der Chip zählt runter. Richtige Leitung kappen – oder das Ding loswerden.',
      done: CHIP_ERLEDIGT,
      marker: { map: 'dantes-werkstatt', at: 'eins-tisch' },
    },
    {
      id: 'dante',
      text: 'Dante hat gesehen, was der Chip anrichtet. Rede mit ihm an der Einbau-Liege.',
      when: CHIP_ERLEDIGT,
      done: BEIGETRETEN,
      marker: { map: 'dantes-werkstatt', at: 'einbau-liege' },
    },
  ],
  reward: {
    xp: 250,
    relations: { dante: 60 },
    effects: [{ phone: 'tel-m2c-hunter-krise' }],
  },
};

// ---------------------------------------------------------------------------------------------- Dialoge

const start: DialogueDef = dlg('m2c-start', [
  node('start', [
    nar('Dantes Werkstatt. Jazz vom Plattenspieler, Lötdampf, zwölf Uhren, die alle eine andere Zeit zeigen. Am Eins!-Tisch sitzt Dante und spielt gegen sich selbst. Er verliert.'),
    l('dante', 'Plus vier. Natürlich. Natürlich plus vier. Nicht fluchen. Nicht fluchen, Dante.', 'wut'),
    l('raven', 'Dante.', 'neutral'),
    l('dante', 'Raven. Ich hab Nein gesagt. Das war ein vollständiger Satz.', 'neutral'),
  ], {
    choices: [
      { text: 'Weiter.', when: VAR_ARIA, next: 'trage' },
      { text: 'Weiter.', when: VAR_PROBAND, next: 'trage-proband' },
      { text: 'Weiter.', when: VAR_JIMMY, next: 'chipcheck' },
    ],
  }),
  node('trage', [
    nar('Vega schiebt die Trage herein. Aria liegt darauf, die Augen offen, violett. „Guten Abend, Master“, sagt sie zur Deckenlampe.'),
    l('dante', '…', 'besorgt'),
    l('dante', 'Leg sie auf die Liege. Vorsichtig mit dem Arm. Der ist mehr wert als mein Haus.', 'neutral'),
  ], { next: 'chipcheck' }),
  node('trage-proband', [
    nar('Aria schiebt Proband 47 herein. Er bleibt mitten im Raum stehen und lächelt das Faxgerät an.'),
    l('dante', 'Wer ist das?', 'neutral'),
    l('aria', 'Nummer 47. Hat sich für ’nen Gutschein chippen lassen. Xion wollte ihn an Ripper verscherbeln.', 'wut'),
    l('dante', 'Setz ihn auf die Liege. Und fass nichts an, was summt.', 'neutral'),
  ], { next: 'chipcheck' }),
  // Hat die Spielfigur den Chip noch im Inventar? (take würde sonst die ganze Effektliste ablehnen.)
  node('chipcheck', [], {
    choices: [
      { text: 'Weiter.', when: item('quest-nexus-chip'), next: 'piep' },
      { text: 'Weiter.', when: noItem('quest-nexus-chip'), next: 'piep-ohne' },
    ],
  }),
  node('piep', [
    nar('Das Piepen in deiner Tasche wird zu einem Pfeifen. Du legst den Chip auf den Eins!-Tisch, mitten auf die Plus-vier-Karte. Das blaue Licht wird rot.'),
    l('ki-nexus', 'Protokoll Abschied. Selbstzerstörung in zehn Sekunden. Vielen Dank, dass Sie Quantum gewählt haben.', 'neutral'),
    l('ki-nexus', 'Zehn.', 'neutral'),
    l('dante', 'Ach du heilige Vinylscheiße.', 'ueberrascht'),
    l('ki-nexus', 'Neun.', 'neutral'),
  ], {
    choices: [
      {
        text: 'Gehäuse auf. Die blaue Leitung geht zum Akku, die rote zum Speicher, die schwarze … die schwarze ist der Zünder.',
        check: 'gc-34', effects: [{ take: 'quest-nexus-chip' }, ...ENTSCHAERFT_FX], next: 'leitung',
      },
      {
        text: '„Dante! Seitenschneider!“ (Selbst knipsen.)',
        effects: [{
          minigame: 'akt-countdown', level: 3, key: 'countdown-chip', label: 'Zehn, neun, acht …',
          win: [{ take: 'quest-nexus-chip' }, ...ENTSCHAERFT_FX, { dialogue: 'm2c-geschafft' }],
          lose: [{ take: 'quest-nexus-chip' }, set('countdown_geworfen'), { dialogue: 'm2c-wurf' }],
        }],
      },
      { text: 'Chip schnappen. Fenster. Wurf.', effects: [{ take: 'quest-nexus-chip' }, set('countdown_geworfen')], next: 'wurf' },
    ],
  }),
  node('piep-ohne', [
    nar('Das Piepen in deiner Tasche wird zu einem Pfeifen. Hunter hat den Chip in einer Kaffeetasse mitgegeben. Du kippst ihn auf den Eins!-Tisch, mitten auf die Plus-vier-Karte. Das blaue Licht wird rot.'),
    l('ki-nexus', 'Protokoll Abschied. Selbstzerstörung in zehn Sekunden. Vielen Dank, dass Sie Quantum gewählt haben.', 'neutral'),
    l('ki-nexus', 'Zehn.', 'neutral'),
    l('dante', 'Ach du heilige Vinylscheiße.', 'ueberrascht'),
    l('ki-nexus', 'Neun.', 'neutral'),
  ], {
    choices: [
      { text: 'Gehäuse auf. Die schwarze Leitung ist der Zünder.', check: 'gc-34', effects: ENTSCHAERFT_FX, next: 'leitung' },
      {
        text: '„Dante! Seitenschneider!“ (Selbst knipsen.)',
        effects: [{
          minigame: 'akt-countdown', level: 3, key: 'countdown-chip', label: 'Zehn, neun, acht …',
          win: [...ENTSCHAERFT_FX, { dialogue: 'm2c-geschafft' }],
          lose: [set('countdown_geworfen'), { dialogue: 'm2c-wurf' }],
        }],
      },
      { text: 'Chip schnappen. Fenster. Wurf.', effects: [set('countdown_geworfen')], next: 'wurf' },
    ],
  }),
  node('leitung', [
    l('ki-nexus', 'Drei. Zw…', 'neutral'),
    nar('Knips. Das rote Licht geht aus. Im Gehäuse knistert es, dann ist Ruhe. Zwei Chiphälften, die nicht mehr miteinander reden.'),
    l('dante', 'Schwarz. Natürlich schwarz. Wer baut denn einen Zünder in Schwarz? Das ist ja wie ein Witz ohne Pointe.', 'ueberrascht'),
    l('dante', 'Gute Hände. Ruhige Hände. Die sieht man nicht oft hier unten.', 'neutral'),
  ], { effects: [herz('dante', 40)], next: 'patient' }),
  node('wurf', [
    l('ki-nexus', 'Vier. Drei.', 'neutral'),
    nar('Du reißt das Fenster auf und wirfst. Der Chip fliegt in hohem Bogen über die Lötgassen und landet mit einem Klong in einer Mülltonne.'),
    l('ki-nexus', 'Eins. Es war mir eine Ehre, Master.', 'neutral'),
    nar('Die Mülltonne hebt ab. Einen Meter, zwei, drei. Sie dreht sich in der Luft und regnet Konfetti-Funken über die halbe Gasse. Irgendwo applaudiert ein Kind.'),
    l('dante', 'Das war meine Tonne. Die hatte einen Namen.', 'trauer'),
  ], { effects: [herz('dante', 20)], next: 'patient' }),
  node('patient', [], {
    choices: [
      { text: 'Weiter.', when: VAR_ARIA, next: 'aria' },
      { text: 'Weiter.', when: VAR_PROBAND, next: 'proband' },
      { text: 'Weiter.', when: VAR_JIMMY, next: 'jimmy' },
    ],
  }),
  // --- Variante A: Aria
  node('aria', [
    nar('Dante dreht die Lampe über der Einbau-Liege. Er sagt nichts, er arbeitet. Pinzette. Ein feiner Schnitt hinter Arias Ohr. Ein Klicken. Ein Chip, kleiner als ein Fingernagel, fällt in eine Schale.'),
    nar('Arias Augen werden braun. Sie blinzelt. Sie blinzelt nochmal.'),
    l('aria', 'Wo … warum riecht’s hier nach Lötzinn und alten Platten? Bin ich tot? Ist das der Himmel? Der Himmel ist hässlich.', 'verlegen'),
    l('aria', 'Mein Arm. Warum spür ich meinen Arm nicht. DANTE. WARUM SPÜR ICH MEINEN ARM NICHT.', 'besorgt'),
    l('dante', 'Weil der Chip ihn als Erstes abgeschaltet hat. Dein Zerberster lebt. Er schläft nur sehr tief. Wir reden darüber, wenn du nicht mehr schreist.', 'neutral'),
  ], {
    effects: [{ give: 'quantum-chip-schrott' }, set('aria_chip_entfernt'), herz('aria', 60), { recruit: 'aria' }],
    choices: [
      { text: '„Willkommen zurück, Schläger.“', when: NOT_VEX, effects: [herz('aria', 20)], next: 'dante' },
      { text: '„Hey, Zöpfe. Ich hab angehalten.“', when: VEX, effects: [herz('aria', 40)], next: 'aria-vex' },
    ],
  }),
  node('aria-vex', [
    l('aria', 'Du … hast was?', 'ueberrascht'),
    l('player', 'Angehalten. Im Pumpwerk. Ist mir noch nie passiert. Fühlt sich scheiße an. Mach das nie wieder.', 'verlegen'),
    l('aria', 'Postbotin. Du bist so ein Arschloch. Komm her.', 'zaertlich'),
    nar('Sie zieht dich mit dem Arm, der noch geht, in eine Umarmung, die ein bisschen wehtut. Ihr lasst beide nicht los, bis Raven sich räuspert.'),
  ], { next: 'dante' }),
  // --- Variante B: Proband
  node('proband', [
    nar('Dante dreht die Lampe über der Einbau-Liege. Pinzette, ein feiner Schnitt hinter dem Ohr, ein Klicken. Proband 47 blinzelt.'),
    l('dante', 'Name?', 'neutral'),
    nar('„Bernd“, sagt Proband 47. Dann: „Wo ist mein Gutschein?“ Dann rennt er weg, mit Krankenhaushemd, ohne Schuhe, quer durch die Lötgassen.'),
    l('aria', 'Gern geschehen, Bernd!', 'freude'),
  ], { effects: [{ give: 'quantum-chip-schrott' }, set('proband_frei'), xpFx(30)], next: 'dante' }),
  // --- Variante B: Jimmy
  node('jimmy', [
    l('aria', 'Jimmy ist zurück zu denen. Der Chip hat gepfiffen, und er ist gerannt. Wie ein Hund.', 'trauer'),
    l('dante', 'Dann holen wir ihn. Mit den Händen da. Und dem Kopf hier. Aber nicht heute Nacht.', 'neutral'),
  ], { next: 'dante' }),
  // --- Dante tritt bei
  node('dante', [
    nar('Dante sitzt lange da und guckt in die Schale mit dem Chip. Dann auf das Foto an der Wand: Hunter, Raven, Vega, Blade und er, jünger, dümmer, glücklicher.'),
    l('dante', 'Sieben Jahre hab ich mir gesagt, das geht mich nichts mehr an. Und jetzt kommt das Zeug durch meine Tür. Auf einer Trage.', 'trauer'),
    l('raven', 'Also?', 'neutral'),
    l('dante', 'Also hol ich meine Tasche.', 'neutral'),
  ], { effects: [{ cutscene: 'main-2-dante-freeze' }] }),
]);

/** Nach gewonnenem Minispiel. */
const geschafft: DialogueDef = dlg('m2c-geschafft', [
  node('start', [
    nar('Knips. Das rote Licht geht aus. Eine Sekunde vor null. Die Uhr an der Wand bleibt vor Schreck stehen.'),
    l('dante', 'Na also. Sie kann mehr als Fluchen.', 'freude'),
  ], { effects: [herz('dante', 40)], choices: [{ text: 'Weiter.', effects: [{ dialogue: 'm2c-patient' }] }] }),
]);

/** Minispiel verloren: Wurf in letzter Sekunde. */
const wurf: DialogueDef = dlg('m2c-wurf', [
  node('start', [
    l('ki-nexus', 'Zwei.', 'neutral'),
    nar('Falsche Leitung. Dante reißt dir den Chip aus der Hand und wirft. Durchs offene Fenster, über die Gasse, in eine Mülltonne.'),
    nar('Die Tonne hebt ab, dreht sich in der Luft und regnet Konfetti-Funken über die Lötgassen.'),
    l('dante', 'Das war meine Tonne. Die hatte einen Namen. Sie hieß Gertrud.', 'trauer'),
  ], { effects: [herz('dante', 20)], choices: [{ text: 'Weiter.', effects: [{ dialogue: 'm2c-patient' }] }] }),
]);

/** Gemeinsamer Rest nach Minispiel (Patient, dann Dante). */
const patient: DialogueDef = dlg('m2c-patient', start.nodes.filter(n => ['patient', 'aria', 'aria-vex', 'proband', 'jimmy', 'dante'].includes(n.id)), 'patient');

/** Falls der Dialog abgebrochen wurde: Dante an der Liege führt den Rest fort. */
const liege: DialogueDef = dlg('m2c-liege', [
  node('start', [l('dante', 'Lampe ist an. Bringt mir, wen ihr mitgebracht habt.', 'neutral')], {
    choices: [{ text: 'Weiter.', effects: [{ dialogue: 'm2c-patient' }] }],
  }),
]);

// ---------------------------------------------------------------------------------------------- Freeze

const freeze: CutsceneDef = {
  id: 'main-2-dante-freeze',
  title: 'Dante tritt bei',
  beats: [
    {
      image: 'cut-main-2-countdown',
      pan: 'in',
      fade: 'in',
      sfx: 'success',
      caption: 'DANTE · Genie und Wahnsinn. Ab heute wieder im Dienst.',
      hold: 1800,
    },
    {
      image: 'cut-main-2-countdown',
      pan: 'none',
      lines: [
        l('vega', 'Und so kam Dante zurück. Nicht wegen Hunter. Nicht wegen Raven. Wegen einer Tonne, die Gertrud hieß, und eines Chips auf einer Plus-vier-Karte.'),
        l('dante', 'Eine Bedingung. Keiner fasst meine Platten an. Und wir spielen Eins! nach meinen Regeln.', 'signatur'),
        l('raven', 'Deine Regeln sind Schummeln.', 'signatur'),
        l('dante', 'Meine Regeln sind Kunst.', 'freude'),
      ],
    },
  ],
  effects: [
    set('dante_beigetreten'), { recruit: 'dante' }, ...CREW_HERZEN(10), { markSeen: 'main-2-dante-freeze' },
    msg('Dante gehört jetzt zur Crew. Seine Werkstatt heilt, baut ein und baut aus.'),
  ],
};

// ---------------------------------------------------------------------------------------------- Telefon

const hunterKrise: PhoneMessageDef = {
  id: 'tel-m2c-hunter-krise',
  from: 'hunter',
  text: 'Hinterzimmer. Alle. Sofort. Bringt Kekse mit, ich hab keine mehr. Ich hab gar nichts mehr.',
};

// ---------------------------------------------------------------------------------------------- Karten

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: Object.fromEntries([start, geschafft, wurf, patient, liege].map(d => [d.id, d])),
  cutscenes: { [freeze.id]: freeze },
  phone: { [hunterKrise.id]: hunterKrise },
  mapAdditions: {
    'dantes-werkstatt': {
      onEnter: [
        { id: 'm2c-start-auto', when: all(AKTIV, not(CHIP_ERLEDIGT), flag('kanal_bei_dante'), noFlag('m2c_gestartet')), dialogue: start.id, effects: [set('m2c_gestartet')] },
      ],
      hotspots: [
        { id: 'm2c-eins-tisch', at: 'eins-tisch', label: 'Dante am Eins!-Tisch', kind: 'talk', dialogue: start.id, when: all(AKTIV, not(CHIP_ERLEDIGT)) },
        { id: 'm2c-liege', at: 'einbau-liege', label: 'Einbau-Liege', kind: 'talk', dialogue: liege.id, when: all(AKTIV, CHIP_ERLEDIGT, not(BEIGETRETEN)) },
      ],
    },
    loetgassen: {
      hotspots: [
        {
          id: 'm2c-tonne-gertrud', at: 'werkstatt-fenster', label: 'Verkohlte Mülltonne', kind: 'loot', once: true, when: GEWORFEN,
          lines: [nar('Gertrud, die Mülltonne, liegt auf dem Rücken wie ein Käfer. Rundherum Konfetti. Im Ruß glitzert ein Rest des Chips, verschmort, aber noch quantumblau.')],
          effects: [{ give: 'quantum-chip-schrott' }],
        },
      ],
    },
  },
};
