// Hauptquest main-3-labor „Nyra holen“ (world.md §5.4). Treffpunkt hinter den Hecken (himmelsgarten:wartungsgang),
// durch den Schacht ins Labor (quantum-labor). Alesa ablenken: Hunter flirtet (Standard, ohne Check), gc-42 Fachgespräch
// (alesa_zweifel), [Alesa ♥4]. Dante zieht Nyras Chip (Tafel cut-main-3-labor). Peilsender-Weichen aus Akt 2:
// peilsender_ausgenutzt → Captain Kuschel als Köder, Blade stürmt einen leeren Raum (blade_blamiert);
// peilsender_gewarnt → Hinterhalt enc-labor-blade-hinterhalt; nur entdeckt → jetzt entscheiden;
// ohne Wissen → Blade und Xion platzen herein: Toiletten-Ausrede scheitert, gc-43 Hubschrauber-Lüge (xion_fehlt),
// enc-labor-blade-vorspiel (3 Runden, danach Gefangennahme) oder ergeben. Ergebnis: labor_frei oder labor_gefangen.
import type { ContentPart } from '../../part';
import type { Condition, CutsceneDef, DialogueChoice, DialogueDef, PhoneMessageDef, QuestDef } from '../../../modules/contracts';
import {
  NOT_VEX, PARTYNACHT, Q_EINLASS, Q_LABOR, VEX, VEX_ARIA_ZUSAMMEN, active, all, any, done, flag, hearts, herz, item, l, nar,
  noFlag, not, set,
} from './_lib';

const Q = Q_LABOR;
const AKTIV = active(Q);
const UNTERWEGS = flag('labor_unterwegs');
const ABGELENKT = flag('alesa_abgelenkt');
const BEFREIT = flag('nyra_befreit');
const AUSGANG = flag('labor_ausgang');
const KUSCHEL_DA: Condition = any(flag('nyra_hat_kuschel'), item('captain-kuschel'));
const ARIA_TISCH: Condition = flag('aria_gechippt');

const quest: QuestDef = {
  id: Q,
  kind: 'main',
  noCollapse: true,
  act: 3,
  title: 'Nyra holen',
  giver: 'hunter',
  summary: 'Nyra sitzt im Labor unter dem Turm und spielt die Gechippte. Alesa weicht ihr nicht von der Seite. Einer muss Alesa beschäftigen, damit Dante an Nyra rankommt.',
  autoStart: all(done(Q_EINLASS), PARTYNACHT),
  steps: [
    {
      id: 'hecken',
      text: 'Triff Hunter hinter den Hecken im Wartungsgang des Himmelsgartens.',
      done: UNTERWEGS,
      marker: { map: 'himmelsgarten', at: 'wartungsgang' },
    },
    {
      id: 'ablenken',
      text: 'Lenk Alesa ab, damit Dante an Nyra rankommt.',
      when: UNTERWEGS,
      done: ABGELENKT,
      marker: { map: 'quantum-labor', at: 'alesas-pult' },
    },
    {
      id: 'chip',
      text: 'Dante zieht Nyras Chip am OP-Tisch.',
      when: ABGELENKT,
      done: BEFREIT,
      marker: { map: 'quantum-labor', at: 'op-tisch' },
    },
    {
      id: 'raus',
      text: 'Blade weiß, wo Nyra ist. Raus aus dem Labor – so oder so.',
      when: BEFREIT,
      done: AUSGANG,
      marker: { map: 'quantum-labor', at: 'labortuer' },
    },
  ],
  reward: {
    xp: 250,
    relations: { nyra: 100, dante: 40 },
    effects: [{ message: 'Nyra ist wieder bei euch. Mit Hasenohren und ohne Chip.' }],
  },
};

// ---------------------------------------------------------------------------------------------- Hinter den Hecken

const hecken: DialogueDef = {
  id: 'main-3-labor-hecken',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        nar('Hinter den Hecken ist der Himmelsgarten plötzlich nur noch Kulisse: Rückseiten von Rosenbögen, Kabelbinder, ein Gärtnerroboter, der sich hinter einer Gießkanne versteckt. Hunter steht da und raucht nicht. Sehr demonstrativ.'),
        l('hunter', 'Da bist du. Wo ist Raven?', 'besorgt'),
        l('dante', 'Ich dachte, die ist bei dir.', 'ueberrascht'),
        l('hunter', 'Sie wollte nur kurz zur Bar. Vor zwanzig Minuten. Seitdem nichts. Raven geht nicht „nur kurz“ irgendwohin. Raven geht entweder gar nicht oder durch die Wand.', 'besorgt'),
        l('dante', 'Erst Nyra. Dann Raven. Eins nach dem anderen, sonst verlieren wir beide. Um Himmels Willen.', 'besorgt'),
      ],
      next: 'plan',
    },
    {
      id: 'plan',
      lines: [
        l('hunter', 'Nyra sitzt unten im Labor, Ebene minus drei. Alesa klebt an ihr wie Kaugummi an einer Schuhsohle. Hinter der Gießkanne geht’s in einen Wartungsschacht, der führt direkt runter.', 'neutral'),
        l('hunter', 'Einer muss Alesa beschäftigen. Ich hab mich freiwillig gemeldet. Also, ich hab mich nicht gewehrt.', 'signatur'),
      ],
      choices: [
        { text: '(Zu Aria.) „Du musst da nicht wieder runter.“', id: 'aria-vex', when: all(VEX, ARIA_TISCH), once: true, next: 'aria-vex' },
        { text: '(Zu Aria.) „Schaffst du das? Da unten?“', id: 'aria', when: all(NOT_VEX, ARIA_TISCH), once: true, next: 'aria' },
        { text: '„Ab in den Schacht.“', next: 'los' },
      ],
    },
    {
      id: 'aria-vex',
      lines: [
        l('aria', 'Doch. Muss ich. Sonst hat das Arschloch auf dem Tisch gewonnen. Und der Tisch.', 'wut'),
        l('player', 'Dann gehst du hinter mir.', 'neutral'),
        l('aria', 'Hinter dir? Ich bin immer vor dir, Schrapnell. Ich hab nur gern, dass du da bist.', 'verlegen'),
      ],
      effects: [herz('aria', 20)],
      choices: [
        { text: '(Ihre Metallhand nehmen. Nur kurz.)', when: VEX_ARIA_ZUSAMMEN, next: 'aria-vex-hand' },
        { text: '„Ab in den Schacht.“', next: 'los' },
      ],
    },
    {
      id: 'aria-vex-hand',
      lines: [nar('Die Finger des Zerberster schließen sich um deine. Vorsichtig, als könnte sie dich zerbrechen. Kann sie. Tut sie nicht.')],
      next: 'los',
    },
    {
      id: 'aria',
      lines: [l('aria', 'Ich schaff alles. Ich hab nur keinen Bock drauf. Das ist ein Unterschied.', 'signatur')],
      effects: [herz('aria', 10)],
      next: 'los',
    },
    {
      id: 'los',
      lines: [nar('Der Schacht ist eng, warm und riecht nach Serverraum. Hunter flucht über seinen Smoking. Dante über seine Keksdose. Nach drei Minuten Kriechen gibt ein Gitter unter dir nach.')],
      effects: [set('labor_unterwegs'), { travel: 'quantum-labor', entry: 'lueftung', minutes: 10 }],
    },
  ],
};

// -------------------------------------------------------------------------------------------------- Alesa ablenken

const wahl: DialogueChoice[] = [
  { text: '„Hunter. Du bist dran.“', next: 'hunter' },
  { text: '„Dr. Zero, Ihr Kern läuft mit Vorwärtskühlung? Bei der Last? Schwingt der nicht über?“', check: 'gc-42', next: 'fach' },
  { text: '„Alesa. Sie wissen, was Blade vorhat. Gehen Sie einen Kaffee holen.“', tag: '[Alesa ♥4]', requires: hearts('alesa-zero', 4), next: 'herz' },
  { text: '(Zu Aria, leise.) „Hey. Du bist nicht mehr auf dem Tisch. Du stehst neben mir.“', id: 'aria-vex', when: all(VEX, ARIA_TISCH), once: true, next: 'aria-vex' },
  { text: '(Zu Aria, leise.) „Alles okay?“', id: 'aria', when: all(NOT_VEX, ARIA_TISCH), once: true, next: 'aria' },
];

const ablenken: DialogueDef = {
  id: 'main-3-labor-ablenken',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        nar('Ebene minus drei. Durch die Decke wummert der Bass der Party. An einem Arbeitsplatz sitzt Nyra im Quantum-Kittel, die Haare unter einer Haube, hinter dem Ohr glimmt ein violettes Licht. Ihre Finger tippen gleichmäßig. Zu gleichmäßig.'),
        nar('Hinten am Pult steht Alesa Zero und spricht mit einem Feuerlöscher. Dann sieht sie euch.'),
        l('alesa-zero', 'Wer sind Sie? Das ist ein Sperrbereich! Ich habe einen Feuerlöscher! Ich weiß nicht genau, wie er funktioniert, aber ich habe ihn!', 'ueberrascht'),
        l('nyra', 'Guten Abend. Sie sind nicht autorisiert. Master wird informiert.', 'neutral'),
        nar('Dann, ganz leise, ohne die Lippen zu bewegen:'),
        l('nyra', '… der Zentrator war falsch herum.', 'signatur'),
        l('dante', 'Sie ist noch drin. Sie ist noch da drin! Heiliges Kanonenrohr.', 'freude'),
      ],
      effects: [set('labor_unterwegs')],
      next: 'wahl',
    },
    {
      id: 'wahl',
      lines: [l('hunter', 'Also. Wer macht die Dame mit dem Feuerlöscher glücklich?', 'neutral')],
      choices: wahl,
    },
    {
      id: 'aria-vex',
      lines: [
        nar('Aria starrt auf den OP-Tisch in der Mitte des Raums. Roboterarme, Gurte, ein Kopfteil mit Kerbe. Ihre Metallhand ist eine Faust.'),
        l('aria', 'Ich weiß. Ich weiß, ich steh neben dir. Sag’s trotzdem noch mal.', 'trauer'),
        l('player', 'Du stehst neben mir. Und keiner fasst dich an, der nicht vorher an mir vorbei muss.', 'neutral'),
        l('aria', '…Okay. Okay. Dann los, bevor ich anfange zu heulen und mir die Wimperntusche ruiniere.', 'verlegen'),
      ],
      effects: [herz('aria', 30)],
      next: 'wahl',
    },
    {
      id: 'aria',
      lines: [
        nar('Aria starrt auf den OP-Tisch in der Mitte des Raums. Ihre Metallhand ist eine Faust.'),
        l('aria', 'Nein. Aber das ist egal. Mach weiter, bevor ich den Tisch zerberste.', 'wut'),
      ],
      effects: [herz('aria', 10)],
      next: 'wahl',
    },
    {
      id: 'hunter',
      lines: [
        nar('Hunter rückt die Nelke zurecht, nimmt die Sonnenbrille ab und wird ein anderer Mensch. Ein sehr charmanter, sehr verdächtiger Mensch.'),
        l('hunter', 'Dr. Zero. Ich hab gelesen, Sie bauen Roboter, die nichts abfackeln.', 'signatur'),
        l('alesa-zero', 'Fast nichts! Fast! Das ist ein wichtiger Unterschied, die Presse lässt das immer weg!', 'ueberrascht'),
        l('hunter', 'Ich führe einen Club, in dem fast nichts brennt. Wir haben viel gemeinsam. Champagner? Oben gibt’s eine Pyramide, die ist fast so schön wie Ihre Laborbrille.', 'freude'),
        l('alesa-zero', 'Ich trinke nicht im Dienst. Ich trinke auch nicht außer Dienst. Ich … einen kleinen. Einen ganz kleinen.', 'freude'),
        nar('Hunter bietet ihr den Arm an. Im Rausgehen dreht er sich um und hält zehn Finger hoch. Dann flüstert er:'),
        l('hunter', 'Zehn Minuten. Danach muss ich anfangen, über Gefühle zu reden. Beeilt euch.', 'besorgt'),
      ],
      effects: [set('alesa_abgelenkt'), set('alesa_hunter_flirt'), herz('alesa-zero', 20), herz('hunter', 20)],
      next: 'op',
    },
    {
      id: 'fach',
      lines: [
        l('alesa-zero', 'Überschwingen? Er schwingt nicht über! Also, nur bei Last, und bei Last schwingt alles über, das ist ja das Wesen von Last!', 'ueberrascht'),
        l('alesa-zero', 'Wobei. Wobei! Blade hat gesagt, die Schlafwandler in der Unterstadt sind ein Kommunikationsproblem. Aber wenn die Kühlung falsch herum … dann wäre das kein Kommunikationsproblem. Dann wäre das ich.', 'besorgt'),
        nar('Sie dreht sich zu ihrem Pult, ruft Kurven auf, murmelt Zahlen. Ihre Stimme wird immer höher. Sie hat vergessen, dass ihr da seid. Und Nyra.'),
        l('alesa-zero', 'Wir haben ja von nichts gewusst. Oder? Haben wir von nichts gewusst?', 'trauer'),
      ],
      effects: [set('alesa_abgelenkt'), set('alesa_zweifel'), herz('alesa-zero', 40)],
      next: 'op',
    },
    {
      id: 'herz',
      lines: [
        nar('Alesa sieht dich lange an. Dann den Feuerlöscher. Dann Nyra.'),
        l('alesa-zero', 'Ich … habe nichts gesehen. Ich sehe nie etwas. Das ist mein Problem. Das war schon immer mein Problem.', 'trauer'),
        l('alesa-zero', 'Der Kaffeeautomat ist im Foyer. Er braucht elf Minuten. Er ist sehr schlecht.', 'neutral'),
        nar('Sie geht. Die Tür schließt sich hinter ihr, und der Feuerlöscher bleibt auf dem Pult stehen wie ein vergessener Hund.'),
      ],
      effects: [set('alesa_abgelenkt'), set('alesa_weggeschaut'), herz('alesa-zero', 30)],
      next: 'op',
    },
    {
      id: 'op',
      lines: [
        l('dante', 'Nyra. Hey. Silent-Angel. Ich bin’s. Du kannst aufhören.', 'besorgt'),
        nar('Nyras Finger hören auf zu tippen. Ihre Schultern sacken. Und dann ist sie einfach wieder ein Mädchen mit zu großem Kittel, das sich umdreht und sehr, sehr laut nicht weint.'),
      ],
      effects: [{ cutscene: 'main-3-labor' }],
    },
  ],
};

const chipRaus: CutsceneDef = {
  id: 'main-3-labor',
  title: 'Du wolltest doch noch ans Meer',
  beats: [
    {
      image: 'cut-main-3-labor',
      pan: 'in',
      fade: 'in',
      lines: [
        nar('Der OP-Tisch. Dante hat die Keksdose aufgeklappt: zweiter Boden, Pinzetten, eine Lupe, ein Lötkolben aus einem Radiowecker. Nyra liegt auf der Seite und zählt Deckenplatten.'),
        l('dante', 'Ganz ruhig. Ist wie ein Splitter. Ein sehr teurer, sehr arroganter Splitter.', 'besorgt'),
        l('nyra', 'Ich hab ihn falsch herum gedreht. Den Zentrator. Gleich am ersten Tag. Damit er mir nicht sagt, was ich denken soll. Aber er hat’s trotzdem versucht. Jede Nacht.', 'trauer'),
      ],
      hold: 1500,
    },
    {
      image: 'cut-main-3-labor',
      pan: 'left',
      sfx: 'hack',
      lines: [
        nar('Ein Klicken. Ein violetter Funke. Dann hält Dante etwas Kleines, Schwarzes zwischen der Pinzette, und es hört auf zu leuchten.'),
        l('dante', 'Hab ihn. Siehst du? Du wolltest doch noch ans Meer.', 'freude'),
        l('nyra', 'Ihr seid gekommen. Ihr seid echt gekommen.', 'freude'),
        l('nyra', 'Wenn ich zurückkomme … wollt ihr mich dann noch?', 'besorgt'),
        l('dante', 'Frag nicht so blöd. Natürlich. Wer soll denn sonst meinen Code korrigieren?', 'freude'),
      ],
    },
  ],
  effects: [set('nyra_befreit'), { dialogue: 'main-3-labor-peilsender' }],
};

// --------------------------------------------------------------------------------------------- Peilsender und Blade

const peilsender: DialogueDef = {
  id: 'main-3-labor-peilsender',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [nar('Dante wirft den Chip in die Keksdose und klappt sie zu. Nyra rutscht vom Tisch, wackelig, aber auf eigenen Beinen.')],
      choices: [
        { text: '(Weiter.)', id: 'w-kuschel', when: flag('peilsender_ausgenutzt'), next: 'kuschel-plan' },
        { text: '(Weiter.)', id: 'w-hinterhalt', when: all(flag('peilsender_gewarnt'), noFlag('peilsender_ausgenutzt')), next: 'hinterhalt-plan' },
        {
          text: '(Weiter.)', id: 'w-entdeckt',
          when: all(flag('peilsender_entdeckt'), noFlag('peilsender_gewarnt'), noFlag('peilsender_ausgenutzt')), next: 'entdeckt',
        },
        {
          text: '(Weiter.)', id: 'w-spaet',
          when: all(noFlag('peilsender_entdeckt'), noFlag('peilsender_gewarnt'), noFlag('peilsender_ausgenutzt')), next: 'zu-spaet',
        },
      ],
    },
    {
      id: 'kuschel-plan',
      lines: [
        l('nyra', 'Okay. Wie besprochen. Der Peilsender sitzt im Ohrläppchen, der kleine Mistkerl. Ich hab ihn drin gelassen, damit sie nichts merken.', 'signatur'),
        nar('Sie pult ihn raus, mit einer Haarnadel und viel Fluchen. Dante klebt ihn mit Kaugummi an ein sehr großes, sehr flauschiges Ohr.'),
        l('dante', 'Captain. Du hast eine Mission. Konferenzraum B. Rohrpost. Sei tapfer.', 'besorgt'),
        nar('Captain Kuschel stellt beide Ohren auf. Dann verschwindet er zischend im Rohrpostschacht. Ihr klettert zurück in die Lüftung und wartet.'),
      ],
      next: 'kuschel',
    },
    {
      id: 'kuschel',
      lines: [
        nar('Durch den Schacht hört ihr Stiefel. Viele Stiefel. Eine Tür, die aufgetreten wird. Dann Stille. Dann eine Stimme, die ihr alle kennt.'),
        l('blade', 'Das kann doch nicht euer Ernst sein!', 'wut'),
        l('xion-venom', 'Der Hase hat geblinkt, Boss. Ich hab gesagt, der Hase blinkt.', 'besorgt'),
        l('blade', 'XION. ES IST EIN HASE.', 'wut'),
        nar('Nyra hält sich beide Hände vor den Mund. Aria beißt in ihren Ärmel. Dante weint ein bisschen vor Stolz.'),
      ],
      effects: [set('labor_frei'), set('blade_blamiert'), set('peilsender_kuschel'), herz('nyra', 30), herz('dante', 30)],
      next: 'raus',
    },
    {
      id: 'hinterhalt-plan',
      lines: [
        l('nyra', 'Ihr habt mich gewarnt. Also hab ich ihn drin gelassen. Den Peilsender. Damit sie kommen.', 'signatur'),
        l('nyra', 'Sie wissen, dass ich hier bin. Sie wissen nicht, dass ihr hier seid. Licht aus, Schätzchen?', 'freude'),
        l('dante', 'Licht aus. Heiliges Kanonenrohr, ich liebe dieses Kind.', 'freude'),
      ],
      choices: [
        { text: '(Hinter der Labortür warten.)', effects: [{ battle: 'enc-labor-blade-hinterhalt', stay: true }, { dialogue: 'main-3-labor-nach-hinterhalt' }] },
      ],
    },
    {
      id: 'entdeckt',
      lines: [
        l('nyra', 'Der Peilsender! Den hab ich gefunden, aber ich hab mich nicht getraut, ihn rauszunehmen. Er sitzt im Ohrläppchen. Sie wissen genau, wo ich bin. Jetzt gerade.', 'besorgt'),
        l('dante', 'Dann sollen sie kommen. Die Frage ist nur, wohin.', 'signatur'),
      ],
      choices: [
        { text: '„Wir warten hinter der Tür. Sollen sie ruhig reinstürmen.“', effects: [{ battle: 'enc-labor-blade-hinterhalt', stay: true }, { dialogue: 'main-3-labor-nach-hinterhalt' }] },
        { text: '„Klebt das Ding an Captain Kuschel und schickt ihn per Rohrpost spazieren.“', when: KUSCHEL_DA, next: 'kuschel-jetzt' },
        { text: '„Zertritt das Ding und lauf.“', next: 'zertreten' },
      ],
    },
    {
      id: 'kuschel-jetzt',
      lines: [
        nar('Dante klebt den Peilsender mit Kaugummi an ein sehr großes, sehr flauschiges Ohr und flüstert dem Hasen etwas zu. Captain Kuschel verschwindet zischend im Rohrpostschacht. Ihr klettert in die Lüftung.'),
      ],
      next: 'kuschel',
    },
    {
      id: 'zertreten',
      lines: [
        nar('Knirsch. Ein winziges rotes Licht geht aus. Zu spät: Auf dem Flur sind schon Stiefel.'),
      ],
      next: 'zu-spaet',
    },
    {
      id: 'zu-spaet',
      lines: [
        nar('Die Labortür fliegt auf. Blade steht im Rahmen, den Goldknauf-Stock lässig über der Schulter, flankiert von Venom-Gardisten. Hinter ihm grinst Xion wie ein Hund, der einen Knochen gefunden hat.'),
        l('blade', 'Na, na, na. Eine Pyjamaparty in meinem Labor? Und keiner hat mich eingeladen? Ich bin gekränkt.', 'signatur'),
        l('xion-venom', 'Ich hab’s gewusst. Der Peilsender. Ich bin nicht dumm. Ich weiß, wer du bist.', 'signatur'),
      ],
      next: 'blade-wahl',
    },
    {
      id: 'blade-wahl',
      lines: [l('blade', 'Also? Erklärt mir, was ihr hier macht. Ich liebe Ausreden. Ich sammle sie.', 'neutral')],
      choices: [
        { text: '„Ich … musste nur aufs Klo. Ist das hier nicht die Toilette?“', next: 'klo' },
        {
          text: '„Xion! Auf dem Landeplatz schrauben Rostzähne gerade euren Hubschrauber ab. Ich hab’s auf dem Weg runter gesehen.“',
          check: 'gc-43', when: noFlag('einlass_kampf'), next: 'hubschrauber',
        },
        {
          text: '„Euer Hubschrauber wird geklaut!“', tag: '[Xion hat euch am Eingang prügeln sehen]',
          when: flag('einlass_kampf'), requires: noFlag('einlass_kampf'), next: 'klo',
        },
        { text: '(Zu Aria.) „Nicht. Noch nicht.“', id: 'aria-vex', when: VEX, once: true, next: 'aria-vex' },
        { text: '„Dann eben so.“ (Kämpfen, bis Dante fertig ist)', effects: [{ battle: 'enc-labor-blade-vorspiel', stay: true }, { dialogue: 'main-3-labor-nach-vorspiel' }] },
        { text: '(Die Hände heben.)', next: 'gefangen' },
      ],
    },
    {
      id: 'aria-vex',
      lines: [
        nar('Aria hat den Schläger schon halb oben. Blade mustert sie wie ein Möbelstück, das er mal besessen hat.'),
        l('blade', 'Ah, die Brecherin. Wie geht’s dem Kopf? Hat er sich gut erholt?', 'signatur'),
        l('aria', 'Willst du’s ausprobieren?', 'wut'),
        nar('Deine Hand auf ihrem Arm. Sie atmet aus. Der Schläger sinkt. Ein bisschen.'),
      ],
      effects: [herz('aria', 20)],
      next: 'blade-wahl',
    },
    {
      id: 'klo',
      lines: [
        l('blade', 'Die Toilette. Auf Ebene minus drei. Hinter einer Sicherheitstür mit drei Schlössern.', 'neutral'),
        l('blade', 'Wisst ihr, was ich an euch mag? Ihr gebt euch nie Mühe. Das ist fast sympathisch. Xion, die Handschellen.', 'freude'),
      ],
      next: 'gefangen',
    },
    {
      id: 'hubschrauber',
      lines: [
        l('xion-venom', 'Mein Hubschrauber? Mein … der ist frisch poliert!', 'ueberrascht'),
        l('blade', 'Xion. Es ist MEIN Hubschrauber.', 'wut'),
        l('xion-venom', 'Ich hab ihn poliert! Er ist emotional meiner!', 'wut'),
        nar('Xion rennt los, die halbe Garde hinterher. Blade sieht ihnen nach, dann euch, dann wieder ihnen. Er schnaubt, dreht sich auf dem Absatz um und folgt ihnen, schon das Telefon am Ohr.'),
        l('blade', 'Wir sehen uns oben. Lauft nicht weg, das ist so unelegant.', 'signatur'),
        nar('Xion kommt an diesem Abend nicht wieder. Später erzählt man sich, er habe drei Stunden lang einen Hubschrauber bewacht, den niemand klauen wollte, und dabei geweint.'),
      ],
      effects: [set('labor_frei'), set('xion_fehlt')],
      next: 'raus',
    },
    {
      id: 'gefangen',
      lines: [
        nar('Klick. Klick. Klick. Xion legt Handschellen an, als würde er Geschenke verteilen. Dante bekommt zwei Paar. Er ist stolz darauf.'),
        l('blade', 'Wunderbar. Und jetzt alle zur Party. Gästebändchen braucht ihr nicht mehr. Ihr seid jetzt Programmpunkt.', 'freude'),
      ],
      effects: [set('labor_gefangen')],
      next: 'raus',
    },
    {
      id: 'raus',
      lines: [nar('Das Labor ist leer bis auf das Brummen der Racks und einen Feuerlöscher, der allein auf einem Pult steht.')],
      effects: [set('labor_ausgang')],
      next: 'nyra-crew',
    },
    {
      // Eigener Knoten: recruit allein, damit eine Ablehnung den Rest nicht zurückrollt.
      id: 'nyra-crew',
      lines: [l('nyra', 'Team. Team Crew. Ich bin wieder Team. Oder? Sagt einfach ja.', 'freude')],
      effects: [{ recruit: 'nyra' }],
      choices: [
        { text: '„Ja.“', id: 'reise-frei', when: noFlag('labor_gefangen'), next: 'reise-frei' },
        { text: '„Ja. Mit Handschellen, aber ja.“', id: 'reise-gefangen', when: flag('labor_gefangen'), next: 'reise-gefangen' },
      ],
    },
    {
      id: 'reise-frei',
      lines: [nar('Ihr nehmt den Laboraufzug. Nyra drückt alle Knöpfe gleichzeitig, aus Prinzip. Oben wartet der Himmelsgarten, und irgendwo schlägt eine Uhr Mitternacht.')],
      effects: [{ travel: 'himmelsgarten', entry: 'von-quantum-foyer', minutes: 10 }],
    },
    {
      id: 'reise-gefangen',
      lines: [nar('Die Garde führt euch durch den Personalgang zum Gästeaufzug. Die Fahrstuhlmusik spielt etwas Fröhliches. Blade summt mit. Oben schlägt eine Uhr Mitternacht.')],
      effects: [{ travel: 'himmelsgarten', entry: 'von-quantum-foyer', minutes: 10 }],
    },
  ],
};

const nachHinterhalt: DialogueDef = {
  id: 'main-3-labor-nach-hinterhalt',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [nar('Staub. Funken. Irgendwo piept ein Gerät beleidigt.')],
      choices: [
        { text: '(Weiter.)', id: 'sieg', when: { won: 'enc-labor-blade-hinterhalt' }, next: 'sieg' },
        { text: '(Weiter.)', id: 'niederlage', when: { not: { won: 'enc-labor-blade-hinterhalt' } }, next: 'niederlage' },
      ],
    },
    {
      id: 'sieg',
      lines: [
        nar('Die Garde liegt gestapelt wie Partystühle. Blade ist nicht dabei. Natürlich nicht. Er lässt kämpfen.'),
        l('nyra', 'Wir haben gewonnen? Wir haben gewonnen! Ich hab noch nie gewonnen! Also, außer Online-Schach. Gegen mich selbst.', 'freude'),
      ],
      effects: [set('labor_frei'), set('labor_hinterhalt_gewonnen'), { dialogue: 'main-3-labor-abgang' }],
    },
    {
      id: 'niederlage',
      lines: [
        nar('Schwarz. Dann Handschellen. Dann Blades Stimme, sehr nah, sehr freundlich:'),
        l('blade', 'Ein Hinterhalt. Wie süß. Wie altmodisch. Garde, bringt sie nach oben. Sie sollen die Show nicht verpassen.', 'signatur'),
      ],
      effects: [set('labor_gefangen'), { heal: 'full' }, { dialogue: 'main-3-labor-abgang' }],
    },
  ],
};

const nachVorspiel: DialogueDef = {
  id: 'main-3-labor-nach-vorspiel',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        nar('Drei Runden. Länger hält keiner gegen die Venom-Garde. Aber drei Runden reichen: Dante hält den Chip hoch, Nyra ist frei, und dann klicken die Handschellen.'),
        l('blade', 'Bravo. Wirklich, bravo. Ihr habt euch die beste Aussicht verdient. Ganz vorne. Auf der Bühne.', 'freude'),
      ],
      effects: [set('labor_gefangen'), { heal: 'full' }, { dialogue: 'main-3-labor-abgang' }],
    },
  ],
};

/** Gemeinsamer Abgang nach einem Laborkampf (Nyra in die Crew, Reise nach oben). */
const abgang: DialogueDef = {
  id: 'main-3-labor-abgang',
  start: 'raus',
  nodes: peilsender.nodes.filter(n => ['raus', 'nyra-crew', 'reise-frei', 'reise-gefangen'].includes(n.id)),
};

// ------------------------------------------------------------------------------------------------------- Telefon

const phones: PhoneMessageDef[] = [
  {
    id: 'tel-nyra-zentrator',
    from: 'nyra',
    auto: all(done(Q_EINLASS), AKTIV, not(BEFREIT)),
    text: 'der zentrator war falsch herum. ebene -3. ich bin noch ich. glaub ich. kommt bitte. nicht anrufen, die hören mit. – N',
    replies: [
      { text: 'Wir kommen. Halt durch.', effects: [herz('nyra', 20)] },
      { text: 'Captain Kuschel auch?', effects: [{ message: 'Nyra: „hasenohren hoch.“' }] },
    ],
  },
];

// --------------------------------------------------------------------------------------------------------- Teil

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: {
    [hecken.id]: hecken,
    [ablenken.id]: ablenken,
    [peilsender.id]: peilsender,
    [nachHinterhalt.id]: nachHinterhalt,
    [nachVorspiel.id]: nachVorspiel,
    [abgang.id]: abgang,
  },
  cutscenes: { [chipRaus.id]: chipRaus },
  phone: Object.fromEntries(phones.map(p => [p.id, p])),
  mapAdditions: {
    himmelsgarten: {
      npcs: [
        { id: 'main-3-labor-hunter-hecken', npc: 'hunter', at: 'wartungsgang', facing: 's', dialogue: hecken.id, when: all(AKTIV, not(UNTERWEGS)) },
      ],
      hotspots: [
        {
          id: 'main-3-labor-schacht', at: 'wartungsgang', label: 'Wartungsschacht hinter der Gießkanne', kind: 'use',
          dialogue: hecken.id, when: all(AKTIV, not(UNTERWEGS)),
        },
      ],
    },
    'quantum-labor': {
      onEnter: [
        // Auch wer über den Laboraufzug kommt, landet hier im Ablenk-Gespräch.
        { id: 'main-3-labor-ablenken', once: false, when: all(AKTIV, not(ABGELENKT)), dialogue: ablenken.id },
      ],
      hotspots: [
        {
          id: 'main-3-labor-alesa', at: 'alesas-pult', label: 'Alesa ablenken', kind: 'talk',
          dialogue: ablenken.id, when: all(AKTIV, not(ABGELENKT)),
        },
        {
          id: 'main-3-labor-op', at: 'op-tisch', label: 'Dante: Nyras Chip ziehen', kind: 'use',
          effects: [{ cutscene: chipRaus.id }], when: all(AKTIV, ABGELENKT, not(BEFREIT)),
        },
        {
          id: 'main-3-labor-tuer', at: 'labortuer', label: 'Zur Labortür', kind: 'use',
          dialogue: peilsender.id, when: all(AKTIV, BEFREIT, not(AUSGANG)),
        },
      ],
    },
  },
};
