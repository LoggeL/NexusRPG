// Hauptquest main-3-einlass „Auf der Gästeliste“ (world.md §5.4). Akt-3-Start: quantum-campus / party-vorplatz.
// Briefing an der Limousinenvorfahrt (Hunters Stick, Rollen, Vega auf den Antennen), dann einer der Einlasswege.
// Die Wege selbst liegen auf den Karten (maps-23): Haupteingang mit Kessel (gc-38, [Wache ♥8], Chrome-Einladung,
// Party-Ausweis, Kampf enc-einlass-kontrolle → Fahndung 3), Lüftung gc-40 (landet im Labor), im Foyer Gästeliste gc-41
// und Catering gc-39. Sie setzen die Flags einlass_haupteingang/_wache/_kampf/_lueftung/_gaesteliste/_catering.
// Diese Datei ergänzt: Briefing, Presse-Weg für die freie Rolle (party_idee_spieler), Rückweg aus dem Labor nach dem
// Lüftungsweg, Nachspiel des Kampfes und das Live-Interview mit Collin und Delya. Das Interview rechnet die öffentliche
// Meinung `meinung` −3…+3 aus (Flags meinung_m3 … meinung_p3, meinung_positiv/_hoch/_negativ, siehe _lib).
import type { ContentPart } from '../../part';
import type { Condition, CutsceneDef, DialogueChoice, DialogueDef, Effect, PhoneMessageDef, QuestDef } from '../../../modules/contracts';
import {
  MEINUNG_PLUS_FLAGS, NOT_VEX, PARTYNACHT, Q_EINLASS, VEX, VEX_ARIA_ZUSAMMEN, active, all, any, done, flag, herz, item, l,
  nar, noFlag, not, set, visier, waitUntilEvening, won,
} from './_lib';

const Q = Q_EINLASS;
const AKTIV = active(Q);

/** Irgendein Einlassweg ist geschafft (dieselben Flags wie die Karten). */
const DRIN: Condition = any(
  flag('einlass_haupteingang'), flag('einlass_catering'), flag('einlass_lueftung'), flag('einlass_gaesteliste'),
  flag('einlass_wache'), flag('einlass_kampf'), flag('einlass_presse'), won('enc-einlass-kontrolle'),
);
const BRIEFING = flag('einlass_briefing');
/** Vor dem Turm wird Lio Funkel spielen, wenn er in der Partynacht davon erzählt hat. */
const LIO_WAHL: DialogueChoice[] = [{ text: '(Vom Rand der Absperrung: eine verstimmte Gitarre.)', id: 'lio', when: flag('lio_ablenkung'), next: 'lio' }];
/** Outfit-Bonus der Partynacht: gilt für alle Ausstrahlungs-Checks bis zum Ende des nächsten Tages, wird nicht verbraucht. */
const OUTFIT_BUFF = (id: string, label: string, value: number): Effect =>
  ({ checkBuff: { id, label, value, attribute: 'ausstrahlung', forDays: 1, consumes: false } });
const INTERVIEW = flag('interview_gefuehrt');

const quest: QuestDef = {
  id: Q,
  kind: 'main',
  noCollapse: true,
  act: 3,
  title: 'Auf der Gästeliste',
  giver: 'hunter',
  summary: 'Releaseparty im Himmelsgarten. Blade verschenkt Chips, die halbe Oberstadt trinkt Champagner, und irgendwo im Turm sitzt Nyra. Erst mal reinkommen. Am besten ohne dass jemand schießt.',
  autoStart: PARTYNACHT,
  steps: [
    {
      id: 'briefing',
      text: 'Triff Hunter und die Crew an der Limousinenvorfahrt vor dem Quantum-Campus.',
      done: BRIEFING,
      marker: { map: 'quantum-campus', at: 'party-vorplatz' },
    },
    {
      id: 'rein',
      text: 'Komm auf die Party. Haupteingang, Gästeliste, Catering, Lüftung – oder mit Gewalt.',
      when: BRIEFING,
      done: DRIN,
      marker: { map: 'quantum-campus', at: 'haupteingang' },
    },
    {
      id: 'weg-gaesteliste', optional: true,
      text: 'Im Foyer: das Gästelisten-Pult. Eure Namen müssten nur draufstehen.',
      when: all(BRIEFING, not(DRIN)), done: DRIN,
      marker: { map: 'quantum-foyer', at: 'gaesteliste-pult' },
    },
    {
      id: 'weg-catering', optional: true,
      text: 'Im Foyer: der Catering-Durchgang. Wer ein Tablett trägt, wird nicht gefragt.',
      when: all(BRIEFING, not(DRIN)), done: DRIN,
      marker: { map: 'quantum-foyer', at: 'catering-tuer' },
    },
    {
      id: 'weg-lueftung', optional: true,
      text: 'Am Sockel des Spire summt ein Lüftungsgitter.',
      when: all(BRIEFING, not(DRIN)), done: DRIN,
      marker: { map: 'quantum-campus', at: 'lueftungsgitter' },
    },
    {
      id: 'interview',
      text: 'Collin und Delya senden live. Gib ihnen ein Interview – die ganze Stadt sieht zu.',
      when: DRIN,
      done: INTERVIEW,
      marker: { map: 'quantum-foyer', at: 'presse-ecke' },
    },
  ],
  reward: {
    xp: 200,
    rep: { 'nx1-medien': 10 },
    effects: [{ message: 'Ihr seid drin. Noxius hat euer Gesicht gesehen. Jetzt: Nyra holen.' }],
  },
};

// ---------------------------------------------------------------------------------------------------------- Briefing

const briefingWeiter: DialogueChoice[] = [
  { text: '„Und wo ist Nyra?“', id: 'nyra', next: 'nyra', once: true },
  { text: '„Wie kommen wir rein?“', id: 'wege', next: 'wege', once: true },
  {
    text: '„War meine Idee, die Party. Dann such ich mir auch meine Rolle aus.“', tag: '[Deine Party-Idee]',
    when: all(flag('party_idee_spieler'), noFlag('einlass_rolle')), next: 'rolle',
  },
  { text: '(Zu Aria.) „Kabelbrand-Shirt drunter?“', id: 'aria-vex', when: VEX, once: true, next: 'aria-vex' },
  { text: '(Zu Aria.) „Alles klar bei dir?“', id: 'aria', when: all(NOT_VEX, flag('aria_gechippt')), once: true, next: 'aria-generisch' },
  { text: '„Los geht’s.“', next: 'los' },
];

const briefing: DialogueDef = {
  id: 'main-3-einlass-briefing',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        nar('Die Limousinenvorfahrt des Quantum-Campus. Lichterbögen bis zum Spire, ein roter Teppich, der so lang ist, dass er eigentlich eine Straße ist. Drohnen mit Blitzlicht, Gäste mit Gesichtern, die mehr gekostet haben als dein Viertel.'),
        nar('Zwischen zwei Limousinen parkt eine Rostlaube. Daneben: Hunter im Smoking, Sonnenbrille, Nelke. Raven in Schwarz. Dante mit einer Keksdose unterm Arm. Und Aria in einem Kleid, unter dem man, wenn man weiß, wo man hinsehen muss, das Kabelbrand-Logo erkennt.'),
        l('hunter', 'Pünktlich. Fast. Wir reden später drüber.', 'neutral'),
      ],
      choices: [
        ...waitUntilEvening('„Einlass ist um acht. Bis dahin warten wir.“ (Bis zum Abend warten)', 'outfit'),
        { text: '(Weiter.)', id: 'abends', when: { clockBetween: [1170, 2000] }, next: 'outfit' },
      ],
    },
    {
      id: 'outfit',
      lines: [nar('Die Lichterbögen gehen an, einer nach dem anderen. Irgendwo oben im Himmelsgarten setzt der Bass ein. Die Releaseparty hat begonnen.')],
      choices: [
        // Outfit-Bonus (prep-outfits): Glanz +2, schlicht +1 Ausstrahlung für die ganze Partynacht (bis morgen früh).
        {
          text: '(Weiter.)', id: 'outfit-glanz', when: all(flag('prep_outfits'), flag('outfits_glanz')), next: 'outfit-gut',
          effects: [OUTFIT_BUFF('outfit-glanz', 'Partygarderobe: Glanz', 2), { message: 'Glanz-Outfit: Ausstrahlung +2 für die ganze Partynacht.' }],
        },
        {
          text: '(Weiter.)', id: 'outfit-schlicht', when: all(flag('prep_outfits'), flag('outfits_schlicht'), noFlag('outfits_glanz')), next: 'outfit-gut',
          effects: [OUTFIT_BUFF('outfit-schlicht', 'Partygarderobe: schlicht', 1), { message: 'Schlichtes Outfit: Ausstrahlung +1 für die ganze Partynacht.' }],
        },
        { text: '(Weiter.)', id: 'outfit-gut', when: all(flag('prep_outfits'), noFlag('outfits_glanz'), noFlag('outfits_schlicht')), next: 'outfit-gut' },
        { text: '(Weiter.)', id: 'outfit-lumpen', when: noFlag('prep_outfits'), next: 'outfit-lumpen' },
      ],
    },
    {
      id: 'outfit-gut',
      lines: [
        l('hunter', 'Ich hab gesagt: Geht da nicht in diesen Lumpen hin. Und ihr habt zugehört. Ich bin gerührt. Ich zeig’s nur nicht.', 'freude'),
        l('dante', 'Gina hat mir eine Fliege umgebunden und gesagt, ich sehe aus wie ein Mann mit Zukunft. Heiliges Kanonenrohr. Ich hab gar keine Zukunft. Ich hab Kekse.', 'freude'),
        l('raven', 'Du siehst aus wie ein Kellner, der geklaut hat.', 'signatur'),
        l('dante', 'Danke!', 'freude'),
      ],
      choices: LIO_WAHL,
      next: 'plan',
    },
    {
      id: 'outfit-lumpen',
      lines: [
        l('hunter', 'Ich hab gesagt: Geht da nicht in diesen Lumpen hin. Ihr seid trotzdem in Lumpen hier. Ihr seht aus wie ein Insolvenzverfahren mit Beinen.', 'wut'),
        l('aria', 'Und du siehst aus wie ein Pinguin, der einen Club besitzt. Wir haben alle unsere Kreuze.', 'signatur'),
        l('hunter', 'Mein Club hat Stil. Gut. Dann eben mit Charme. Hat ja bei mir auch keiner gedacht.', 'neutral'),
      ],
      choices: LIO_WAHL,
      next: 'plan',
    },
    {
      // lio_ablenkung (npc-unterstadt/lio-akt23.ts): Lio spielt vor dem Turm, die Wachen schauen zu ihm statt zu euch.
      id: 'lio',
      lines: [
        nar('Am Rand der Absperrung, zwischen zwei Blumenkübeln: ein heiserer Typ mit Gitarre, Lichterkette um den Hals und einem Verstärker, der eindeutig aus einer Mülltonne stammt. Er tritt auf den Kübel und dreht voll auf.'),
        l('lio-funkel', 'Guten Abend, Oberstadt! Das hier ist ein Lied über euch. Es reimt sich nicht. Ihr auch nicht.', 'signatur'),
        nar('Drei Eventschutz-Leute drehen sich um. Dann fünf. Kessel am Pult seufzt so laut, dass man es bis zur Vorfahrt hört. Die Seitentür zum Catering steht plötzlich sehr unbewacht da.'),
        l('raven', 'Der Funkel. Nicht schlecht. Wenn die Wachen ihm zuhören, hören sie uns nicht zu. Nutzt das.', 'signatur'),
      ],
      effects: [
        set('einlass_lio_ablenkung'),
        { checkBuff: { id: 'lio-ablenkung', label: 'Lio lenkt die Wachen ab', value: 2, tags: ['schleichen', 'verstecke', 'geruecht', 'klettern', 'etikette', 'ueberreden'], forDays: 0 } },
        { message: 'Lio spielt vor dem Turm: +2 auf den nächsten Einlass-Check (Schleichen, Verstecken, Klettern, Überreden).' },
      ],
      next: 'plan',
    },
    {
      id: 'plan',
      lines: [
        l('hunter', 'Also, letzte Runde. Ich geh mit Raven durch den Haupteingang, als Investoren. Ihr kommt nach, egal wie. Oben im Himmelsgarten treffen wir uns hinter den Hecken.', 'neutral'),
        l('hunter', 'Um Mitternacht hält Blade seine Rede. Bis dahin will ich Nyra raushaben, und bis dahin will ich, dass die Stadt weiß, wer wir sind. Nicht als Einbrecher. Als Gäste mit Meinung.', 'signatur'),
        l('raven', 'Ich geh mit Hunter. Einer muss aufpassen, dass er nicht die Häppchen klaut. Oder die Gastgeberin.', 'neutral'),
      ],
      choices: [
        { text: '(Weiter.)', id: 'stick-geben', when: { noItem: 'stick-hunter' }, next: 'stick' },
        { text: '(Weiter.)', id: 'stick-hat', when: item('stick-hunter'), next: 'stick-schon' },
      ],
    },
    {
      id: 'stick',
      lines: [
        nar('Hunter drückt dir etwas in die Hand. Ein Datenstick, versiegelt mit rotem Nagellack.'),
        l('hunter', 'Mein Stick. Falls ich es nicht bis zum Kern schaffe, steckst du ihn rein. Nicht reinschauen. Ernsthaft, Neuling. Da sind Dinge drauf, die ich nur einmal sagen will.', 'besorgt'),
      ],
      effects: [{ give: 'stick-hunter' }],
      next: 'vega',
    },
    {
      id: 'stick-schon',
      lines: [l('hunter', 'Du hast den Stick noch? Gut. Pass drauf auf wie auf deinen Ruf. Also besser als auf deinen Ruf.', 'neutral')],
      next: 'vega',
    },
    {
      id: 'vega',
      lines: [
        nar('Dein Telefon brummt. Eine Nachricht von Vega, mit einem Foto: die Party von oben, aus vierhundert Metern, gestochen scharf. Auf dem Foto ist ein roter Kreis um Hunters Nelke.'),
        l('hunter', 'Vega liegt auf den Antennen. Wenn was schiefgeht, schießt sie. Wenn nichts schiefgeht, schießt sie vermutlich trotzdem was. Aus Langeweile.', 'neutral'),
      ],
      effects: [set('einlass_briefing'), { phone: 'tel-vega-antennen' }],
      choices: briefingWeiter,
    },
    {
      id: 'nyra',
      lines: [
        l('dante', 'Unten im Turm. Labor, Ebene minus drei. Sie spielt die Gechippte, glaub ich. Hoff ich. Um Himmels Willen, ich hoff’s.', 'besorgt'),
        l('dante', 'Ich hab Werkzeug dabei. In der Keksdose. Unter den Keksen. Unter dem zweiten Boden. Fragt nicht.', 'signatur'),
      ],
      choices: briefingWeiter,
    },
    {
      id: 'wege',
      lines: [
        l('raven', 'Roter Teppich: Kessel macht dort die Kontrolle. Ja, die Kessel. Ausweis, Einladung oder ein sehr gutes Mundwerk.', 'neutral'),
        l('aria', 'Im Foyer steht ein Pult mit der Gästeliste. Und das Catering schleppt Kisten durch die Seitentür. Und am Sockel vom Turm ist ein Lüftungsgitter. Und ich hab einen Schläger.', 'freude'),
        l('hunter', 'Den Schläger nehmen wir nur, wenn alles andere scheitert. Vor laufender Kamera wird aus Prügelei eine Fahndung.', 'wut'),
      ],
      choices: briefingWeiter,
    },
    {
      id: 'rolle',
      lines: [
        l('hunter', 'Deine Idee, deine Bühne. Ich hasse es, wenn andere recht haben. Such dir was aus.', 'neutral'),
      ],
      choices: [
        { text: '„Presse. Collin schuldet mir eine Story.“', next: 'rolle-presse', effects: [set('einlass_rolle'), set('einlass_rolle_presse')] },
        { text: '„Personal. Wer ein Tablett trägt, wird nicht gefragt.“', next: 'rolle-personal', effects: [set('einlass_rolle'), set('einlass_rolle_personal')] },
        { text: '„Gast. Ganz normal. Mit Stil.“', next: 'rolle-gast', effects: [set('einlass_rolle')] },
      ],
    },
    {
      id: 'rolle-presse',
      lines: [l('hunter', 'Dann geh zu Collin in die Presse-Ecke im Foyer. Der nimmt jeden mit, der gut im Bild aussieht. Also fast jeden.', 'neutral')],
      choices: briefingWeiter,
    },
    {
      id: 'rolle-personal',
      lines: [l('hunter', 'Dann zieh die Schultern runter und guck, als hättest du Rückenschmerzen. Das Catering im Foyer nimmt dich ohne Fragen.', 'signatur')],
      choices: briefingWeiter,
    },
    {
      id: 'rolle-gast',
      lines: [l('hunter', 'Mutig. Dann benimm dich, als würde dir der Laden gehören. Das klappt bei mir seit vier Jahren.', 'neutral')],
      choices: briefingWeiter,
    },
    {
      id: 'aria-vex',
      lines: [
        l('aria', 'Logisch. Wenn ich heute draufgehe, dann in Kabelbrand. Und mit Lippenstift. Gina hat drauf bestanden.', 'signatur'),
        l('player', 'Du gehst heute nicht drauf. Ich hab noch Pläne mit dir. Lieferpläne. Wichtige.', 'neutral'),
        l('aria', 'Lieferpläne. Klar. Du bist so eine schlechte Lügnerin, Schrapnell.', 'verlegen'),
      ],
      choices: [
        { text: '(Ihr den Lippenstift aus dem Mundwinkel wischen.)', when: VEX_ARIA_ZUSAMMEN, next: 'aria-vex-zusammen' },
        { text: '(Weiter.)', next: 'aria-vex-chip' },
      ],
    },
    {
      id: 'aria-vex-zusammen',
      lines: [
        nar('Aria hält still. Ganz kurz. Dann knurrt sie, dass Gina sie umbringt, und grinst trotzdem.'),
        l('aria', 'Später. Wenn wir das hier überleben, kriegst du den ganzen Lippenstift. Versprochen.', 'zaertlich'),
      ],
      effects: [herz('aria', 20)],
      next: 'aria-vex-chip',
    },
    {
      id: 'aria-vex-chip',
      lines: [
        l('aria', 'Und Vex? Wenn mir da drin einer einen Chip hinhält …', 'besorgt'),
        l('player', 'Dann halt ich ihm den Schläger hin. Du musst heute nichts allein machen.', 'neutral'),
      ],
      choices: briefingWeiter,
    },
    {
      id: 'aria-generisch',
      lines: [
        l('aria', 'Ich war da drin schon mal. Auf einem Tisch. Mit einem Ding im Kopf, das mir gesagt hat, wie ich lächeln soll.', 'trauer'),
        l('aria', 'Wenn mir da heute einer einen Chip hinhält, steck ich ihn ihm quer rein. Wohin, darfst du raten.', 'wut'),
      ],
      effects: [herz('aria', 10)],
      choices: briefingWeiter,
    },
    {
      id: 'los',
      lines: [
        l('hunter', 'Gut. Dann zeigen wir der Oberstadt, wie die Unterstadt feiert. Mit Manieren. Und notfalls ohne.', 'signatur'),
        nar('Hunter und Raven schreiten über den roten Teppich, als hätten sie ihn bezahlt. Kessel am Pult sieht ihnen nach und schüttelt den Kopf. Dann winkt sie sie durch.'),
      ],
    },
  ],
};

// --------------------------------------------------------------------------------------------- Presse-Weg (freie Rolle)

const presse: DialogueDef = {
  id: 'main-3-einlass-presse',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        l('collin-charleston', 'Du! Ja, du! Du siehst aus wie jemand, der eine Story hat. Und ich sehe aus wie jemand, der eine braucht. Kamera, wir haben einen Praktikanten!', 'freude'),
        visier('PRAKTIKANT?'),
        l('delya-delloraine', 'Collin, wir haben keinen Praktikanten.', 'neutral'),
        l('collin-charleston', 'Jetzt schon. Presseband, Mikro, Lächeln. Ab nach oben, Liebling, die Party wartet nicht. Ich auch nicht.', 'signatur'),
      ],
      effects: [set('einlass_presse'), herz('collin-charleston', 30)],
      next: 'interview',
    },
    {
      id: 'interview',
      lines: [nar('Bevor du „danke“ sagen kannst, hält er dir das Mikro unter die Nase. Das rote Licht der Kamera geht an.')],
      effects: [{ dialogue: 'main-3-einlass-interview' }],
    },
  ],
};

// ------------------------------------------------------------------------------------- Lüftungsweg: Landung im Labor

const lueftungLabor: DialogueDef = {
  id: 'main-3-einlass-lueftung-labor',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        nar('Der Schacht endet nicht im Himmelsgarten. Er endet über einer Labordecke, Ebene minus drei. Das Gitter gibt nach, und du landest auf einem sehr weißen Boden. Leise. Fast.'),
        nar('Am anderen Ende des Raums sitzt jemand mit dem Rücken zu dir an einer Tastatur. Pinkes Haar unter einer Quantum-Haube. Nyra. Daneben eine Frau im Laborkittel, die mit einem Feuerlöscher spricht.'),
        l('nyra', '… der Zentrator war falsch herum …', 'neutral'),
        nar('Sie dreht sich nicht um. Aber ihre Finger hören einen Moment auf zu tippen. Dann tippen sie weiter, schneller. Sie hat dich gehört.'),
      ],
      choices: [
        { text: '(Nicht jetzt. Ohne Dante und Hunter geht das schief. Leise zum Laboraufzug.)', next: 'aufzug' },
        { text: '(Ihr ein Zeichen geben, dass ihr kommt.)', next: 'zeichen' },
      ],
    },
    {
      id: 'zeichen',
      lines: [
        nar('Du klopfst zweimal gegen den Türrahmen. Nyras Schultern zucken. Auf ihrem Bildschirm erscheint für eine halbe Sekunde ein Smiley mit Hasenohren. Dann ist er weg.'),
      ],
      effects: [herz('nyra', 20), set('nyra_weiss_bescheid')],
      next: 'aufzug',
    },
    {
      id: 'aufzug',
      lines: [nar('Der Laboraufzug fährt dich nach oben ins Foyer. Darin läuft Fahrstuhlmusik: eine Panflötenfassung von „Kabelbrand – Nicht anhalten“. Aria würde jemanden umbringen.')],
      effects: [{ travel: 'quantum-foyer', entry: 'von-quantum-labor', minutes: 5 }],
    },
  ],
};

// ------------------------------------------------------------------------------------------- Nach dem Einlasskampf

const nachKampf: DialogueDef = {
  id: 'main-3-einlass-nach-kampf',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        nar('Am roten Teppich liegen zwei Eventschutz-Leute, ein Schildträger und eine Drohne, die leise „Bitte bewerten Sie Ihren Besuch“ sagt. Über euch kreisen Kameradrohnen. Alle Kameras. Alle auf euch.'),
        l('collin-charleston', '… und DAS, liebe Zuschauer, nenne ich einen Auftritt! Wer sind diese Leute? Bleiben Sie dran, nach der Werbung wissen wir mehr!', 'ueberrascht'),
        l('hunter', 'Ich hab gesagt: nur wenn alles andere scheitert. Ihr habt nicht mal gewartet, bis was scheitert.', 'wut'),
      ],
      effects: [set('einlass_kampf')],
      next: 'rein',
    },
    {
      id: 'rein',
      lines: [nar('Die Drehtür ins Foyer steht offen. Drinnen wartet die Presse-Ecke. Collin winkt schon mit dem Mikro.')],
    },
  ],
};

// ------------------------------------------------------------------------------------------------------- Interview

/**
 * Je Frage: positiv setzt iv_qN_a und iv_qN_b, neutral nur iv_qN_a, negativ nichts. Dazu kommt die Vorgeschichte
 * (Kampf am Eingang −1, mindestens zwei `meinung_plus_*` aus Akt 1/2 +1). Summe der Einheiten T = 0…8, Meinung = T − 4.
 */
const PLUS = (q: number) => [set(`iv_q${q}_a`), set(`iv_q${q}_b`)];
const NEUTRAL = (q: number) => [set(`iv_q${q}_a`)];
const VORGESCHICHTE: Condition[] = [
  not(won('enc-einlass-kontrolle')),
  all(not(won('enc-einlass-kontrolle')), { atLeast: MEINUNG_PLUS_FLAGS.map(flag), min: 2 }),
];
const EINHEITEN: Condition[] = [
  ...VORGESCHICHTE,
  ...[1, 2, 3].flatMap(q => [flag(`iv_q${q}_a`), flag(`iv_q${q}_b`)]),
];
const mindestens = (n: number): Condition => ({ atLeast: EINHEITEN, min: n });
const genau = (n: number): Condition => all(mindestens(n), not(mindestens(n + 1)));

const MEINUNG_STUFEN: { flag: string; when: Condition; next: string; extra: string[] }[] = [
  { flag: 'meinung_p3', when: mindestens(7), next: 'ende-jubel', extra: ['meinung_positiv', 'meinung_hoch'] },
  { flag: 'meinung_p2', when: genau(6), next: 'ende-jubel', extra: ['meinung_positiv', 'meinung_hoch'] },
  { flag: 'meinung_p1', when: genau(5), next: 'ende-gut', extra: ['meinung_positiv'] },
  { flag: 'meinung_0', when: genau(4), next: 'ende-mittel', extra: [] },
  { flag: 'meinung_m1', when: genau(3), next: 'ende-schlecht', extra: ['meinung_negativ'] },
  { flag: 'meinung_m2', when: genau(2), next: 'ende-schlecht', extra: ['meinung_negativ'] },
  { flag: 'meinung_m3', when: not(mindestens(2)), next: 'ende-mies', extra: ['meinung_negativ'] },
];

const interview: DialogueDef = {
  id: 'main-3-einlass-interview',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        nar('Scheinwerfer. Ein Mikro mit NX-1-Würfel. Der Kameramann geht in die Knie, als wollte er dich von unten heldenhaft aussehen lassen. Oder von unten in die Nase filmen.'),
        visier('AUFNAHME LÄUFT'),
        l('collin-charleston', 'Liebe Zuschauer, LIVE von der Releaseparty des Jahrzehnts! Ich habe hier jemanden, den keiner kennt, und das ist in dieser Stadt praktisch eine Sensation!', 'freude'),
        l('collin-charleston', 'Also, Liebling, sag Noxius: Wer bist du, und was machst du auf der exklusivsten Party der Stadt?', 'signatur'),
      ],
      choices: [
        { text: '„{name}. Unterstadt. Ich bin hier, weil ich wissen will, was Quantum der Stadt da gratis schenkt.“', next: 'q2', effects: PLUS(1) },
        { text: '„Kurierdienst. Ich liefere heute Abend eine Überraschung. Unterschrift bei Lieferung.“', when: VEX, next: 'q2', effects: PLUS(1) },
        { text: '„Wegen der Häppchen, Collin. Wegen dir bestimmt nicht.“', next: 'q2', effects: NEUTRAL(1) },
        { text: '„Nimm das Mikro aus meinem Gesicht, oder ich steck’s dir dahin, wo deine Quote nicht hinkommt.“', next: 'q2-frech' },
      ],
    },
    {
      id: 'q2-frech',
      lines: [
        l('collin-charleston', 'Ha! HA! Unzensiert! Das, liebe Zuschauer, ist die Unterstadt! Roh, ehrlich, und vermutlich bewaffnet!', 'ueberrascht'),
        visier(': ('),
      ],
      next: 'q2',
    },
    {
      id: 'q2',
      lines: [
        nar('Delya schiebt sich ins Bild. Sie lächelt nicht für die Kamera. Sie lächelt für dich, und das ist gefährlicher.'),
        l('delya-delloraine', 'Quantum verteilt heute Abend Gratis-Chips an alle Gäste. Aus der Unterstadt gibt es Berichte über Menschen, die nachts herumlaufen und „Master“ sagen. Haben Sie dazu etwas zu sagen?', 'neutral'),
      ],
      choices: [
        { text: '„Ich hab die Forschungsdaten gesehen. Fehlerraten. Die Fehlerraten sind Menschen.“', tag: '[Nexus-Forschungsdaten]', when: item('nexus-forschungsdaten'), next: 'q2-beweis', effects: PLUS(2) },
        { text: '„Ein Freund von mir hat so ein Ding gratis gekriegt. Er hat zwei Wochen lang Ölfasstürme gebaut und Leute ‚Kunden‘ genannt.“', tag: '[Jimmy]', when: any(flag('jimmy_gerettet'), done('side-jimmys-chip')), next: 'q2-jimmy', effects: PLUS(2) },
        { text: '„Meine Freundin hatte so einen Chip. Sie hat gelächelt, weil er’s ihr befohlen hat. Fragt sie mal, wie sich das anfühlt.“', tag: '[Aria]', when: flag('aria_gechippt'), next: 'q2-aria', effects: PLUS(2) },
        { text: '„Lest das Kleingedruckte. Und dann verbrennt es.“', next: 'q3', effects: NEUTRAL(2) },
        { text: '„Gratis ist gratis. Prost, Noxius.“', next: 'q2-prost' },
      ],
    },
    {
      id: 'q2-beweis',
      lines: [
        l('delya-delloraine', 'Das … ist eine schwere Anschuldigung. Haben Sie Belege?', 'ueberrascht'),
        l('player', 'Hab ich. Und bevor die Nacht rum ist, hat sie die ganze Stadt.', 'signatur'),
        visier('!!!'),
      ],
      effects: [herz('delya-delloraine', 40)],
      next: 'q3',
    },
    {
      id: 'q2-jimmy',
      lines: [
        l('delya-delloraine', 'Und jetzt?', 'besorgt'),
        l('player', 'Jetzt fährt er wieder Lieferroller. Weil Freunde ihn nicht aufgegeben haben. Nicht, weil Quantum sich entschuldigt hätte.', 'neutral'),
      ],
      effects: [herz('delya-delloraine', 30)],
      next: 'q3',
    },
    {
      id: 'q2-aria',
      lines: [
        nar('Hinter der Kamera steht Aria ganz still. Dann nickt sie. Einmal. Sehr fest.'),
        l('delya-delloraine', 'Danke. Ich nenne keine Namen. Aber ich frage nach.', 'besorgt'),
      ],
      effects: [herz('delya-delloraine', 30), herz('aria', 30)],
      next: 'q3',
    },
    {
      id: 'q2-prost',
      lines: [
        l('delya-delloraine', 'Verstehe. Danke für diese … tiefe Einschätzung.', 'neutral'),
        l('sybella-chrome', 'Exakt! Gratis ist hundert Prozent Rabatt! Mathematisch unschlagbar!', 'freude'),
      ],
      next: 'q3',
    },
    {
      id: 'q3',
      lines: [
        nar('Ein rotes Kleid drängt sich ins Bild, mit einem Chrome-10-Hologramm, das wie eine Krone über ihrem Kopf schwebt. Sybella Chrome.'),
        l('sybella-chrome', 'Chrome 10! Heute Nacht hundert Prozent Rabatt! Morgen wieder neunzig! Das ist ja praktisch geschenkt, und geschenkt ist praktisch!', 'freude'),
        l('collin-charleston', 'Danke, Sybella, wundervoll, ein Applaus für die Wirtschaft! Und du, Liebling: ein letztes Wort an Noxius?', 'signatur'),
      ],
      choices: [
        { text: '„Wer euch was schenkt, will was von euch. Bleibt heute Nacht wach. Alle.“', next: 'auswertung', effects: PLUS(3) },
        { text: '„Kauft nichts, was euch duzt.“', next: 'auswertung', effects: PLUS(3) },
        { text: '„Kein Kommentar.“', next: 'auswertung', effects: NEUTRAL(3) },
        { text: '„Sybella, du würdest deine eigene Oma mit zehn Prozent Rabatt verticken.“', next: 'q3-sybella' },
      ],
    },
    {
      id: 'q3-sybella',
      lines: [
        l('sybella-chrome', 'Fünfzehn! Mindestens fünfzehn! Sie war in sehr gutem Zustand!', 'wut'),
        nar('Halb Noxius lacht. Die andere Hälfte findet, dass man so nicht mit einer Dame redet, die gerade Gratis-Chips verteilt.'),
      ],
      effects: [herz('sybella-chrome', -30)],
      next: 'auswertung',
    },
    {
      id: 'auswertung',
      lines: [
        nar('Die Kamera schwenkt weg. Auf der Monitorwand hinter der Presse-Ecke laufen die Kommentare der Zuschauer durch, schneller, als man lesen kann.'),
      ],
      choices: MEINUNG_STUFEN.map(s => ({
        text: '(Auf die Monitorwand schauen.)',
        id: `meinung-${s.flag}`,
        when: s.when,
        next: s.next,
        effects: [set(s.flag), ...s.extra.map(set), set('interview_gefuehrt')],
      })),
    },
    {
      id: 'ende-jubel',
      lines: [
        nar('„WER IST DAS?“ – „Endlich sagt’s mal einer!“ – „Unterstadt, wir sind bei dir!“ – „Ich hab meinen Chip gerade in den Gully geworfen. Hat jemand meinen Gully gesehen?“'),
        l('delya-delloraine', 'Die Leute glauben Ihnen. Das passiert nicht oft. Machen Sie was draus.', 'freude'),
        visier('♥ ♥ ♥'),
      ],
      effects: [{ rep: 'unterstadt', delta: 10 }, { rep: 'nx1-medien', delta: 10 }],
      next: 'hoch',
    },
    {
      id: 'ende-gut',
      lines: [
        nar('„Mutig.“ – „Ich mag die Frisur.“ – „Hat jemand das mit den Chips verstanden?“ – „Ich ja, und ich hab Angst.“'),
        l('delya-delloraine', 'Ein Anfang. Mehr kriegt man in dieser Stadt selten.', 'neutral'),
      ],
      effects: [{ rep: 'nx1-medien', delta: 5 }],
      next: 'hoch',
    },
    {
      id: 'ende-mittel',
      lines: [
        nar('„Wer?“ – „Gibt’s noch Häppchen?“ – „Ich hab nicht zugehört, weil Sybellas Hologramm so schön war.“'),
        l('collin-charleston', 'Solide! Nicht weltbewegend, aber solide! Wie mein Haaransatz!', 'signatur'),
      ],
      next: 'hoch',
    },
    {
      id: 'ende-schlecht',
      lines: [
        nar('„Was für ein Arschloch.“ – „Wer hat die reingelassen?“ – „Ich nehm den Chip jetzt aus Trotz.“'),
        l('delya-delloraine', 'Ich hoffe, Sie wissen, was Sie tun. Die Stadt weiß es nämlich gerade nicht.', 'besorgt'),
      ],
      next: 'hoch',
    },
    {
      id: 'ende-mies',
      lines: [
        nar('„Festnehmen!“ – „Das ist doch die vom Eingang!“ – „Ich wähl jetzt Blade. Wir wählen hier nichts? Egal. Ich wähl ihn trotzdem.“'),
        l('collin-charleston', 'Uuuh. Das, liebe Zuschauer, war ein Quotenmagnet. Ein sehr, sehr böser Quotenmagnet.', 'besorgt'),
      ],
      effects: [{ rep: 'nx1-medien', delta: -10 }],
      next: 'hoch',
    },
    {
      id: 'hoch',
      lines: [
        l('collin-charleston', 'Und jetzt alle nach oben, Liebling, in den Himmelsgarten! Die Kamera will dich, ich will die Kamera, und das Buffet will uns alle!', 'freude'),
      ],
      choices: [
        { text: '(Mitgehen.)', id: 'hoch-unten', when: noFlag('interview_oben'), next: 'aufzug' },
        { text: '(Ins Getümmel.)', id: 'hoch-oben', when: flag('interview_oben') },
      ],
    },
    {
      id: 'aufzug',
      lines: [nar('Er schiebt dich in den Gästeaufzug. Die Türen schließen sich mit einem Ton, der klingt wie ein teurer Seufzer.')],
      effects: [{ travel: 'himmelsgarten', entry: 'von-quantum-foyer', minutes: 5 }],
    },
  ],
};

// --------------------------------------------------------------------------------------- Ankunft im Himmelsgarten

const ankunft: CutsceneDef = {
  id: 'main-3-einlass',
  title: 'Releaseparty',
  beats: [
    {
      image: 'cut-main-3-einlass',
      pan: 'in',
      fade: 'in',
      caption: 'Himmelsgarten · Releaseparty „Nexus 1.0“',
      lines: [
        nar('Der Himmelsgarten. Ein Park auf dem Dach des Chrome Tower, vierhundert Meter über dem Rostregen. Rosenbögen, ein Boden aus leuchtendem Glas, Champagner in Pyramiden. Die Luft riecht nach Geld und Rosen und ein bisschen nach Ozon.'),
        l('collin-charleston', 'Noxius, schaut euch DAS an! Die Oberstadt feiert die Zukunft, und wir sind mittendrin! Delya, sag was Kluges!', 'freude'),
        l('delya-delloraine', 'Die Zukunft hat Sicherheitspersonal an jedem Rosenbusch. Das ist das Klügste, was mir einfällt.', 'neutral'),
      ],
      hold: 1500,
    },
    {
      image: 'cut-main-3-einlass',
      pan: 'right',
      lines: [
        nar('Vor der Bühne dreht sich ein Hologramm, so groß wie ein Haus: ein Chip, der sich öffnet wie eine Blüte. Darunter steht Sybella und verteilt Gratis-Chips von einem silbernen Tablett wie Pralinen.'),
        l('sybella-chrome', 'Nehmen Sie zwei! Der zweite ist auch gratis! Gratis mal zwei ist immer noch gratis, das hab ich nachgerechnet!', 'freude'),
        nar('Viele nehmen. Ihre Augen schimmern danach ein bisschen violett. Sie lächeln alle gleich.'),
      ],
    },
    {
      image: 'black',
      caption: 'Noch zwei Stunden bis Mitternacht.',
      lines: [nar('Dein Telefon brummt. Hunter: „Hinter den Hecken. Wartungsgang. Jetzt.“')],
    },
  ],
  effects: [{ phone: 'tel-hunter-hecken' }],
};

// ------------------------------------------------------------------------------------------------------- Telefon

const phones: PhoneMessageDef[] = [
  {
    id: 'tel-vega-antennen',
    from: 'vega',
    text: 'Bin oben auf den Antennen. Bis zur Rednerbrücke 340 Meter, Wind von links, zwei Knoten. Ich seh euch. Benehmt euch. Hunter, die Nelke ist schief.',
    replies: [
      { text: 'Danke, Schutzengel.', effects: [herz('vega', 10)] },
      { text: 'Schieß nicht auf die Häppchen.', effects: [{ message: 'Vega: „Keine Versprechen.“' }] },
    ],
  },
  {
    id: 'tel-hunter-hecken',
    from: 'hunter',
    text: 'Hinter den Hecken, Wartungsgang. Jetzt. Und lass das Buffet in Ruhe, ich seh dich.',
    replies: [{ text: 'Bin unterwegs.' }, { text: 'Nur ein Lachshäppchen.', effects: [{ message: 'Hunter: „Neuling.“' }] }],
  },
  {
    id: 'tel-delya-nach-interview',
    from: 'delya-delloraine',
    auto: all(INTERVIEW, PARTYNACHT),
    text: 'Danke für das Interview. Falls Sie heute Nacht noch etwas Größeres vorhaben: Ich nenne keine Namen. Aber ich halte die Kamera drauf. – D.',
    replies: [
      { text: 'Halten Sie sie drauf. Um Mitternacht.', effects: [herz('delya-delloraine', 20), set('delya_kamera_bereit')] },
      { text: 'Lieber nicht.' },
    ],
  },
];

// --------------------------------------------------------------------------------------------------------- Teil

const INTERVIEW_FAELLIG = all(AKTIV, DRIN, not(INTERVIEW));

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: {
    [briefing.id]: briefing,
    [presse.id]: presse,
    [lueftungLabor.id]: lueftungLabor,
    [nachKampf.id]: nachKampf,
    [interview.id]: interview,
  },
  cutscenes: { [ankunft.id]: ankunft },
  phone: Object.fromEntries(phones.map(p => [p.id, p])),
  mapAdditions: {
    'quantum-campus': {
      onEnter: [
        { id: 'main-3-einlass-briefing', when: all(AKTIV, not(BRIEFING)), dialogue: briefing.id },
        {
          id: 'main-3-einlass-nach-kampf',
          when: all(AKTIV, won('enc-einlass-kontrolle'), noFlag('einlass_kampf_nachspiel')),
          dialogue: nachKampf.id, effects: [set('einlass_kampf_nachspiel')],
        },
      ],
      npcs: [
        { id: 'main-3-einlass-hunter', npc: 'hunter', at: 'party-vorplatz', facing: 'w', dialogue: briefing.id, when: all(AKTIV, not(BRIEFING)) },
        { id: 'main-3-einlass-raven', npc: 'raven', at: 'auftrag-a', facing: 's', dialogue: briefing.id, when: all(AKTIV, not(BRIEFING)) },
      ],
      hotspots: [
        {
          id: 'main-3-einlass-nachsehen', at: 'haupteingang', radius: 80, label: 'Nach dem Kampf: Wie geht’s weiter?', kind: 'talk',
          dialogue: nachKampf.id, when: all(AKTIV, won('enc-einlass-kontrolle'), not(INTERVIEW), noFlag('einlass_kampf_nachspiel')),
        },
      ],
    },
    'quantum-foyer': {
      onEnter: [
        // Wer drin ist (Haupteingang, Gästeliste, Kampf, Rückweg aus dem Labor), wird von Collin abgefangen.
        { id: 'main-3-einlass-interview', once: false, when: INTERVIEW_FAELLIG, dialogue: interview.id },
      ],
      hotspots: [
        {
          id: 'main-3-einlass-presse', at: 'presse-ecke', label: 'Collin: „Ich brauch einen Praktikanten!“', kind: 'talk',
          dialogue: presse.id, when: all(AKTIV, BRIEFING, flag('einlass_rolle_presse'), not(DRIN)),
        },
        {
          id: 'main-3-einlass-interview-ecke', at: 'presse-ecke', label: 'Live-Interview mit Collin und Delya', kind: 'talk',
          dialogue: interview.id, when: INTERVIEW_FAELLIG,
        },
      ],
    },
    'quantum-labor': {
      onEnter: [
        {
          id: 'main-3-einlass-lueftung', once: false,
          when: all(AKTIV, flag('einlass_lueftung'), not(INTERVIEW), noFlag('einlass_lueftung_labor')),
          dialogue: lueftungLabor.id, effects: [set('einlass_lueftung_labor')],
        },
      ],
    },
    himmelsgarten: {
      onEnter: [
        // Catering-Weg landet direkt oben: Collin fängt einen am Presse-Podest ab.
        { id: 'main-3-einlass-interview-oben', once: false, when: INTERVIEW_FAELLIG, dialogue: interview.id, effects: [set('interview_oben')] },
        { id: 'main-3-einlass-ankunft', when: all(PARTYNACHT, INTERVIEW), cutscene: ankunft.id },
      ],
      hotspots: [
        {
          id: 'main-3-einlass-interview-podest', at: 'presse-podest', label: 'Live-Interview mit Collin und Delya', kind: 'talk',
          dialogue: interview.id, when: INTERVIEW_FAELLIG, effects: [set('interview_oben')],
        },
      ],
    },
  },
};
