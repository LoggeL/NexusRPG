// Hauptquest `main-1-probezeit` · „Probezeit im High Voltage“ (world.md §5.2).
// Auslöser: `main-1-ankunft` erledigt (man steht vor oder im High Voltage). Ablauf:
//   Türsteher Bruno (gc-04, Nachricht zeigen, 20 Cr; vor 17 Uhr offen) → High Voltage ab 18 Uhr: Ripper und die Kinder
//   (gc-05/06/07, [Gosse], Vex, selbst zahlen, Kampf enc-hv-ripper-tisch, nichts tun) → Hinterzimmer: Bewerbungsgespräch,
//   Jimmys Schicksal, Vega und Aria mit Dexters Beutel, Nyra im Lüftungsschacht (gc-08, [Schrott]) → Probezeit bestanden.
// Zu früh: an der Bar bis 18 Uhr warten. Nach 18:30: Hunter ♥ −20. Nach 20 Uhr (Kinder schon zu Hause): morgen wiederkommen.
import type { Condition, DialogueChoice } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import { L, N, UHR, VEX, NICHT_VEX, node, waitChoices } from './_dsl';

const Q = 'main-1-probezeit';
const KINDER = (delta: number) => [
  { relation: 'daria', delta }, { relation: 'freya', delta }, { relation: 'jakko', delta },
] as const;

/** Die Ripper-Szene ist offen, bis sie auf irgendeinem Weg gelöst ist (unabhängig vom Queststatus prüfbar). */
const SZENE_OFFEN: Condition = {
  all: [
    { flag: 'prolog_done' }, { notFlag: 'probezeit_ripper_geloest' },
    { not: { won: 'enc-hv-ripper-tisch' } }, { notFlag: 'ripper_kampf_verloren' },
  ],
};

const geloest = [{ setFlag: 'probezeit_ripper_geloest' }, { setFlag: 'probezeit_gespraech' }] as const;

/** Urteil im Hinterzimmer: je gewähltem Weg eine eigene Antwort (nur die passende ist sichtbar). */
const URTEILE: { when: DialogueChoice['when']; text: string; hunter: string; id: string }[] = [
  { id: 'u-virus', when: { flag: 'probezeit_virus_entfernt' }, text: '„Der Virus war ein Billig-Wurm. Drei Handgriffe.“', hunter: 'Drei Handgriffe, und Ripper zahlt das Dreifache. Ich hab Ripper noch nie freiwillig zahlen sehen. Schönes Gefühl. Wie Sonnenaufgang.' },
  { id: 'u-waffe', when: { flag: 'probezeit_waffe' }, text: '„Er hat mit der Pistole angefangen.“', hunter: 'Und du hast aufgehört. Gut. Aber Ripper vergisst so was nicht. Pass auf deine Implantate auf, der weiß, wo die Schrauben sitzen.' },
  { id: 'u-ersatz', when: { flag: 'probezeit_ersatzteile' }, text: '„Ich weiß, was in seinen Containern liegt.“', hunter: 'Dann weißt du mehr, als gesund ist. Behalt’s für dich. Und für mich.' },
  { id: 'u-gosse', when: { flag: 'probezeit_gosse' }, text: '„Ripper war selbst mal ein Straßenkind. Er hat’s nur vergessen.“', hunter: 'Wir waren alle mal irgendwas. Gut, dass du ihn erinnert hast. Der braucht das ab und zu, wie ein Ölwechsel.' },
  { id: 'u-vex', when: { flag: 'probezeit_vex' }, text: '„Ripper schuldet mir noch eine Garantie.“', hunter: 'Der schuldet halb Noxius eine Garantie. Schön, dass mal einer kassiert.' },
  { id: 'u-selbst', when: { flag: 'probezeit_selbst_bezahlt' }, text: '„Ich hab den Kindern das Ding abgekauft.“', hunter: 'Mit deinem eigenen Geld. Am ersten Tag. Entweder bist du ein guter Mensch oder schlecht im Rechnen. Ich hoffe, beides.' },
  { id: 'u-hunter', when: { flag: 'probezeit_hunter_regelt' }, text: '„Ich wollte sehen, wie du das regelst.“', hunter: 'Ich weiß, wie ich das regle. Ich wollte sehen, wie DU das regelst. Nächstes Mal stehst du auf, Neuling. Sonst stehst du draußen.' },
  { id: 'u-kampf', when: { won: 'enc-hv-ripper-tisch' }, text: '„Ripper ist durch die Hintertür.“', hunter: 'Und mein Ecktisch hat jetzt einen Sprung. Ich zieh ihn dir nicht vom Lohn ab. Diesmal.' },
  { id: 'u-verloren', when: { flag: 'ripper_kampf_verloren' }, text: '„Ripper hat einen verdammt harten Kühlschrank dabei.“', hunter: 'Du hast dich trotzdem hingestellt. Mehr wollt ich nicht sehen. Das Liegen üben wir noch.' },
];

/** Herkunftsantworten auf „Warum willst du in meine Crew?“. */
const WARUM: { id: string; tag?: string; when?: DialogueChoice['when']; text: string; hunter: string }[] = [
  { id: 'w-gosse', tag: '[Gosse]', when: { origin: 'origin-gossenkind' }, text: '„Weil ich hier aufgewachsen bin. Die Unterstadt schuldet mir was. Oder ich ihr.“', hunter: 'Beides. Immer beides. Darum bleibt man.' },
  { id: 'w-oberstadt', tag: '[Oberstadt]', when: { origin: 'origin-oberstadt' }, text: '„Weil ich da oben fast erstickt wäre. In Goldperle und Lügen.“', hunter: 'Goldperle gibt’s hier nicht. Lügen schon, aber billiger. Und ehrlicher gelogen.' },
  { id: 'w-oednis', tag: '[Ödnis]', when: { origin: 'origin-oednis' }, text: '„Weil mich in der Ödnis keiner mehr bezahlt. Und weil ich irgendwann das Meer sehen will.“', hunter: 'Das Meer. Du redest schon wie die Kleine mit dem Laptop. Die kommt bestimmt auch noch.' },
  { id: 'w-wache', tag: '[Ex-Wache]', when: { origin: 'origin-ex-wache' }, text: '„Weil ich weiß, wie die Wachen denken. Und keinen Bock mehr hab, so zu denken.“', hunter: 'Ein Ex-Bulle in meinem Laden. Raven wird begeistert sein. Halt Abstand, wenn sie zum ersten Mal lächelt.' },
  { id: 'w-schrott', tag: '[Schrott]', when: { origin: 'origin-schrott' }, text: '„Weil ich alles reparieren kann. Außer meinen Kontostand.“', hunter: 'Da sind wir schon zwei. Dante wird dich mögen. Oder hassen. Bei Dante ist das dasselbe Gesicht.' },
  { id: 'w-knast', tag: '[Knast]', when: { origin: 'origin-knastvogel' }, text: '„Weil ich draußen niemanden kenne. Außer Leuten, die wieder reinwollen.“', hunter: 'Ich hab drei Jahre gesessen. Ich weiß, wie der erste Morgen draußen schmeckt. Nach Rost. Gewöhn dich dran, das wird besser.' },
  { id: 'w-vex', when: VEX, text: '„Kuriere fragen nicht warum. Kuriere fragen: wie viel.“', hunter: 'Ehrlich. Gefällt mir. Wie viel: fünfzig pro Auftrag, mehr, wenn du nicht dabei draufgehst. Und deine Dächer bleiben deine Sache.' },
  { id: 'w-geld', text: '„Weil ich Geld brauche. Ganz einfach.“', hunter: 'Ehrlich. Gefällt mir. Ehrlich ist hier selten, das halten die meisten für eine Krankheit.' },
  { id: 'w-heim', text: '„Weil ich nirgendwo sonst hingehöre.“', hunter: 'Willkommen im Club. Wörtlich.' },
];

export const part: ContentPart = {
  quests: {
    [Q]: {
      id: Q,
      kind: 'main',
      title: 'Probezeit im High Voltage',
      summary: 'Hunter sucht Ersatz für Jimmy. Wer im High Voltage anfangen will, muss erst mal zeigen, was er tut, wenn alle auf ihn schauen.',
      giver: 'hunter',
      act: 1,
      autoStart: { quest: 'main-1-ankunft', state: 'done' },
      steps: [
        {
          id: 'einlass',
          text: 'Komm am Türsteher des High Voltage vorbei.',
          done: { any: [{ flag: 'hv_einlass' }, { visited: 'high-voltage' }] },
          marker: { map: 'neon-gasse', at: 'hv-eingang' },
        },
        {
          id: 'szene',
          text: 'Warte im High Voltage auf Hunter. 18 Uhr.',
          when: { questStep: Q, step: 'einlass' },
          done: { any: [{ flag: 'probezeit_ripper_geloest' }, { won: 'enc-hv-ripper-tisch' }, { flag: 'ripper_kampf_verloren' }] },
          marker: { map: 'high-voltage', at: 'tresen-ende' },
          effects: [{ setFlag: 'probezeit_gespraech' }],
        },
        {
          id: 'gespraech',
          text: 'Bewerbungsgespräch: Hunter wartet im Hinterzimmer.',
          when: { questStep: Q, step: 'szene' },
          done: { flag: 'probezeit_bestanden' },
          marker: { map: 'hv-hinterzimmer', at: 'schreibtisch' },
        },
      ],
      reward: {
        xp: 150,
        credits: 100,
        rep: { 'crew-hunter': 10 },
        effects: [
          { unlockStation: 'station-stufenplatz' },
          { message: 'Freigeschaltet: Crew-Quartier über dem High Voltage, Hunters Auftragstafel im Hinterzimmer.' },
        ],
      },
    },
  },

  cutscenes: {
    // Standbild vor der Ripper-Szene (nur wenn man zwischen 17:55 und 20 Uhr hereinkommt; wer früh kommt und wartet, sieht es nicht).
    'main-1-probezeit-ecktisch': {
      id: 'main-1-probezeit-ecktisch',
      title: 'Der Ecktisch',
      beats: [{
        image: 'cut-probezeit-ecktisch', pan: 'in', fade: 'in', hold: 1800,
        caption: 'High Voltage, Ecktisch. Drei Kinder, ein Implantat, das blinkt, und ein Mann mit grünem Kreuz auf der Jacke.',
      }],
    },
  },

  dialogues: {
    'main-1-probezeit-bruno': {
      id: 'main-1-probezeit-bruno',
      start: 'start',
      nodes: [
        node('start', [
          N('Vor der Samtkordel steht ein Mann, der breiter ist als die Tür hinter ihm. Auf seinem Namensschild steht BRUNO, darunter in kleiner Schrift: „Nein.“'),
          L('bruno-brecher', 'Nur Gäste mit Stil.'),
        ], {
          choices: [
            { check: 'gc-04', text: '„Stil? Ich bin der Stil. Du bist nur der Rahmen, Großer.“', next: 'stil' },
            { requires: { flag: 'hunter_nachricht' }, text: 'Hunters Nachricht auf dem Telefon zeigen.', next: 'nachricht' },
            { requires: { credits: 20 }, text: 'Zwanzig Credits in seine Brusttasche stecken.', next: 'geld', effects: [{ credits: -20 }] },
            { when: VEX, text: '„Expresslieferung für Hunter. Ich bin das Paket.“', next: 'vex' },
            { text: '„Schon gut. Ich komm später wieder.“' },
          ],
        }),
        node('stil', [L('bruno-brecher', '… Das war frech. Frech ist Stil. Rein mit dir, bevor ich’s mir anders überlege.')], { effects: [{ setFlag: 'hv_einlass' }] }),
        node('nachricht', [
          L('bruno-brecher', '„Pünktlich“, steht da. Bist du pünktlich?'),
          L('bruno-brecher', 'Egal. Hunter wartet nicht gern. Rein.'),
        ], { effects: [{ setFlag: 'hv_einlass' }] }),
        node('geld', [L('bruno-brecher', 'Stil ist teuer. Du hast gerade welchen gekauft.')], { effects: [{ setFlag: 'hv_einlass' }] }),
        node('vex', [
          L('bruno-brecher', 'Schrapnell. Kuriere gehen hinten rein.'),
          L('bruno-brecher', '… Ach, scheiß drauf. Vorne. Aber wisch dir die Stiefel ab, du kommst von den Dächern.'),
        ], { effects: [{ setFlag: 'hv_einlass' }] }),
      ],
    },

    'main-1-probezeit-szene': {
      id: 'main-1-probezeit-szene',
      start: 'start',
      nodes: [
        node('start', [
          N('Das High Voltage. Bass, den man im Magen spürt, ein Tresen voller Kratzer, Lichterketten wie verirrte Glühwürmchen. Es riecht nach Limo, Schweiß und frisch geschnittenen Kabeln.'),
        ], {
          choices: [
            { id: 'z-frueh', text: 'Weiter.', when: { clockBetween: [UHR(6), UHR(17, 55)] }, next: 'frueh' },
            { id: 'z-puenktlich', text: 'Weiter.', when: { clockBetween: [UHR(17, 55), UHR(18, 30)] }, next: 'puenktlich' },
            { id: 'z-spaet', text: 'Weiter.', when: { clockBetween: [UHR(18, 30), UHR(20)] }, next: 'spaet', effects: [{ setFlag: 'probezeit_spaet' }] },
            { id: 'z-zu-spaet', text: 'Weiter.', when: { clockBetween: [UHR(20), UHR(26)] }, next: 'zu-spaet', effects: [{ setFlag: 'probezeit_spaet' }] },
          ],
        }),
        node('frueh', [
          L('barkeeper', 'Die Uhr ist noch jung / Hunter zählt im Hinterzimmer / setz dich. Trink. Und wart.'),
          N('Vom Chef keine Spur. Der Ecktisch ist leer. Die Tür zum Hinterzimmer ist zu.'),
        ], {
          choices: [
            ...waitChoices('An die Bar setzen und bis sechs warten.', UHR(6), UHR(18), 'puenktlich'),
            { text: '„Ich komm um sechs wieder.“' },
          ],
        }),
        node('puenktlich', [
          N('Punkt sechs. Hunter tritt aus dem Hinterzimmer: Seidenhemd, Sonnenbrille, ein Gesicht wie ein abgeschlossener Tresor. Er wirft einen Blick auf die Uhr, dann auf dich.'),
          L('hunter', 'Pünktlich. Gefällt mir. Setz dich, Neuling, und guck zu. Das hier ist die Prüfung. Du weißt es nur noch nicht.'),
        ], { next: 'szene' }),
        node('spaet', [
          N('Hunter lehnt am Tresenende und schaut auf die Uhr über der Bar. Dann schaut er dich an. Dann wieder die Uhr. Es ist eine sehr lange Uhr.'),
          L('hunter', 'Ich hab gesagt: pünktlich. Wir reden später darüber. Jetzt setz dich und guck zu.', 'wut'),
        ], { next: 'szene' }),
        node('zu-spaet', [
          L('hunter', 'Acht durch. Die Kinder sind zu Hause, Ripper ist im Kanal, und du bist da. Toll.', 'wut'),
          L('hunter', 'Komm morgen um sechs. Und wenn du da zu spät bist, brauchst du gar nicht mehr zu kommen.'),
          N('Morgen, ab 18 Uhr, gibt es eine zweite Chance. Hunter verteilt nicht viele davon.'),
        ]),
        node('szene', [
          N('Am Ecktisch sitzt ein hagerer Mann mit grünem Leuchtkreuz auf der Lederjacke: Ripper. Vor ihm stehen drei Kinder, Daria, Freya und Jakko. Auf dem Tisch ein Implantat, verkrustet, aber es blinkt.'),
          L('daria', 'Zehn ist zu wenig! Das Ding ist original! Guck doch, es blinkt!', 'wut'),
          L('ripper', 'Es blinkt, weil da ein Virus drauf ist! Da ist ein Virus drauf! Zehn Credits. Oder ihr nehmt euren verseuchten Schrott wieder mit.', 'signatur'),
          L('jakko', 'Aber gestern hast du gesagt, du zahlst zwanzig für gute Sachen!'),
          L('ripper', 'Gestern war ich großzügig. Heute bin ich Geschäftsmann.'),
          L('freya', 'Einspruch! Das ist Nötigung! Ich hab das Wort nachgeschlagen!'),
          N('Ripper greift unter die Jacke. Eine kurzläufige Pistole landet auf dem Tisch, der Lauf zur Decke. Ein Argument, kein Angriff. Noch nicht.'),
          N('Die Musik bricht ab. Der Barkeeper hält ein Glas mitten in der Luft. Hunter, am Tresenende, schiebt die Sonnenbrille ein Stück runter und schaut. Nicht auf Ripper. Auf dich.'),
        ], {
          choices: [
            { check: 'gc-05', text: '„Zeig mal her.“ Das Implantat nehmen und den Virus runterputzen.', next: 'virus' },
            { check: 'gc-06', text: 'Rippers Hand auf den Tisch drücken und ihm die Pistole abnehmen.', next: 'waffe' },
            { check: 'gc-07', text: '„Schöne Ersatzteile hast du in deinem Kanallager, Ripper. Weiß die Wache eigentlich, woher die kommen?“', next: 'ersatzteile' },
            {
              tag: '[Gosse]', when: { origin: 'origin-gossenkind' },
              text: '„Du warst selbst mal einer von denen, Ripper. Wer hat dir damals mehr als zehn gezahlt? Keiner.“', next: 'gosse',
            },
            { when: VEX, text: '„Mein Arm. Dein Werk. Ruckelt seit Dienstag. Soll ich hier allen erzählen, was deine Garantie wert ist?“', next: 'vex' },
            { requires: { credits: 10 }, text: '„Ich kauf euch das Implantat ab. Zehn Credits, und Ripper kriegt einen Scheiß.“', next: 'selbst', effects: [{ credits: -10 }] },
            { text: 'Nichts tun. Hunter anschauen. Sein Laden, seine Regeln.', next: 'hunter' },
            { text: '„Die Pistole ist ein Argument. Meine Fäuste auch.“', next: 'kampf' },
          ],
        }),
        node('virus', [
          N('Du drehst das Implantat ins Licht. Ein Billig-Wurm, der sich in den Bootsektor gefressen hat. Kontakt überbrücken, Reset halten, bis drei zählen. Die LED springt von Rot auf Grün.'),
          L('ripper', '… Was hast du da gerade gemacht?', 'ueberrascht'),
          N('Ein sauberes Implantat ist das Dreifache wert. Das weiß hier jeder. Jetzt auch Ripper, und es tut ihm sichtlich weh.'),
          L('ripper', 'Dreißig. Dreißig Credits, und kein Wort mehr. Kein. Wort.', 'wut'),
          L('daria', 'Dreißig! Zehn für jeden! Das ist … das ist Mathematik!', 'freude'),
        ], { effects: [{ setFlag: 'probezeit_virus_entfernt' }, ...KINDER(60), { relation: 'hunter', delta: 20 }, ...geloest], next: 'aufloesung' }),
        node('waffe', [
          N('Deine Hand liegt auf seiner, bevor er merkt, dass sie da ist. Ein Druck, ein Knacken im Tisch, und die Pistole liegt bei dir.'),
          L('ripper', 'Au! Au, verdammte Scheiße, das ist meine Schraubhand!', 'wut'),
          L('ripper', 'Okay! Zwanzig! Zwanzig für die Gören! Und die Knarre will ich wiederhaben, die ist geleast!'),
          N('Du nimmst das Magazin raus und legst ihm die Pistole hin. Das Magazin wandert zum Barkeeper, der es wortlos in ein Bierglas fallen lässt.'),
        ], { effects: [{ setFlag: 'probezeit_waffe' }, { relation: 'ripper', delta: -120 }, ...KINDER(40), ...geloest], next: 'aufloesung' }),
        node('ersatzteile', [
          L('ripper', 'Kanal? Wer redet hier vom Kanal? Niemand redet hier vom Kanal.', 'besorgt'),
          N('Er beugt sich vor, so nah, dass du sein Mundwasser riechst. Es ist Motoröl.'),
          L('ripper', 'Du hast Ohren an den richtigen Stellen. Das merk ich mir. Im Guten. Vielleicht.', 'signatur'),
          L('ripper', 'Zwanzig für die Gören. Und du kommst mal in meine Praxis. Hinterzimmer. Ich hab da Sachen, die nicht jeder sehen darf.'),
        ], { effects: [{ setFlag: 'probezeit_ersatzteile' }, { setFlag: 'ripper_kennt_dich' }, { relation: 'ripper', delta: 20 }, ...KINDER(40), ...geloest], next: 'aufloesung' }),
        node('gosse', [
          L('ripper', '… Keiner. Ich hab im Kanal gepennt und Ratten verkauft. Als Haustiere. Mit Schleifchen.', 'trauer'),
          L('ripper', 'Zwanzig. Weil heute ein sentimentaler Tag ist. Morgen wieder zehn, sagt’s keinem.'),
        ], { effects: [{ setFlag: 'probezeit_gosse' }, { relation: 'ripper', delta: -20 }, ...KINDER(40), ...geloest], next: 'aufloesung' }),
        node('vex', [
          L('ripper', 'Psst! Nicht so laut! Der Arm ist ein Premiummodell! Mit … mit Charakter!', 'besorgt'),
          L('player', 'Charakter. Er salutiert, wenn ich niese.', 'neutral'),
          L('ripper', 'Zwanzig für die Gören. Und du kommst nächste Woche zur Wartung. Gratis. Einmal. Und du erzählst niemandem vom Salutieren.'),
        ], { effects: [{ setFlag: 'probezeit_vex' }, { relation: 'ripper', delta: -20 }, ...KINDER(40), ...geloest], next: 'aufloesung' }),
        node('selbst', [
          N('Du legst zehn Credits auf den Tisch und schiebst das Implantat zu dir rüber.'),
          L('ripper', 'Was soll das denn werden?', 'ueberrascht'),
          L('daria', 'Ein Geschäft! Mit einer Person, die nicht stinkt!', 'freude'),
          L('ripper', 'Ich stinke nicht. Ich rieche nach Arbeit.'),
        ], { effects: [{ setFlag: 'probezeit_selbst_bezahlt' }, { give: 'virus-implantat' }, ...KINDER(40), { relation: 'hunter', delta: 20 }, ...geloest], next: 'aufloesung' }),
        node('hunter', [
          N('Du schaust Hunter an. Hunter schaut zurück. Ein langer Moment, in dem selbst die Kühlschränke leiser brummen.'),
          L('hunter', 'Ripper.'),
          L('ripper', 'Hunter.'),
          L('hunter', 'Zahl die Kinder. Oder zahl ab heute doppelt für dein Wasser.'),
          L('ripper', '… Zehn. Und das ist mein letztes Wort.'),
          L('hunter', 'Fünfzehn.'),
          L('ripper', 'Fünfzehn.', 'wut'),
        ], { effects: [{ setFlag: 'probezeit_hunter_regelt' }, { relation: 'hunter', delta: -20 }, ...KINDER(20), ...geloest], next: 'aufloesung' }),
        node('kampf', [
          L('hunter', 'Kinder. Raus. Sofort.'),
          L('freya', 'Einspruch!'),
          L('hunter', 'Abgelehnt.'),
          N('Die drei verschwinden zur Tür, Jakko mit einer Handvoll Erdnüsse vom Tresen. Ripper steht auf. Hinter ihm erhebt sich ein Kerl, der aussieht wie ein Kühlschrank mit Kapuze.'),
          L('ripper', 'Was haben wir denn da? Ein Held. Helden haben die schönsten Ersatzteile.', 'signatur'),
        ], {
          effects: [{
            battle: 'enc-hv-ripper-tisch',
            win: [{ dialogue: 'main-1-probezeit-nach-kampf' }],
            lose: [{ dialogue: 'main-1-probezeit-nach-niederlage' }],
          }],
        }),
        node('aufloesung', [
          N('Die Kinder ziehen ab, Daria zählt die Credits zweimal, Freya notiert etwas in ein Heft. Ripper verzieht sich an seinen Ecktisch, beleidigt wie eine nasse Katze.'),
          N('Die Musik setzt wieder ein. Der Barkeeper stellt das Glas ab.'),
          L('barkeeper', 'Lärm am Ecktisch / dann wird’s still, und alle schaun / jetzt schaut Hunter dich.'),
          L('hunter', 'Hinterzimmer. Jetzt.'),
        ]),
      ],
    },

    // Falls der Kampf die Szene beendet hat: kurzer Übergang zurück ins Gespräch.
    'main-1-probezeit-nach-kampf': {
      id: 'main-1-probezeit-nach-kampf',
      start: 'start',
      nodes: [
        node('start', [
          N('Ein umgekippter Stuhl, Erdnüsse auf dem Boden, ein Sprung im Ecktisch. Ripper ist weg, sein Kühlschrank auch.'),
          L('barkeeper', 'Glas ist ganz geblieben / der Tisch nicht, der Stolz auch nicht / Hunter winkt dir zu.'),
          L('hunter', 'Hinterzimmer. Jetzt.'),
        ], { effects: [{ setFlag: 'probezeit_nach_kampf' }, { setFlag: 'probezeit_gespraech' }] }),
      ],
    },

    // Niederlage am Ecktisch: Man bleibt im Club (stayOnLose), Hunter sammelt einen auf.
    'main-1-probezeit-nach-niederlage': {
      id: 'main-1-probezeit-nach-niederlage',
      start: 'start',
      nodes: [
        node('start', [
          N('Decke. Lichterketten. Ein Glühwürmchen davon flackert. Oder das bist du.'),
          N('Ripper steht über dir, wischt sich die Schraubhand an der Jacke ab und zählt mit den Lippen seine Zähne. Alle noch da. Deine wahrscheinlich auch, aber du würdest jetzt nicht wetten.'),
          L('ripper', 'Helden. Immer dasselbe. Große Klappe, weiche Rippen.', 'signatur'),
          L('hunter', 'Ripper. Du hast deinen Spaß gehabt. Die Kinder kriegen zwanzig, und du gehst jetzt, bevor ich mir dein Gesicht merke.'),
          L('ripper', '… Zwanzig. Wegen der Unterhaltung.', 'wut'),
          N('Er zieht ab, sein Kühlschrank mit Kapuze hinterher. Eine Hand packt dich am Kragen und stellt dich auf die Füße, als wärst du ein umgefallener Barhocker.'),
          L('barkeeper', 'Boden ist frisch gewischt / jetzt hat er einen Abdruck / sieht fast aus wie Kunst.'),
          L('hunter', 'Hinterzimmer. Jetzt. Du kannst humpeln, das ist erlaubt.'),
        ], { effects: [{ setFlag: 'probezeit_nach_kampf' }, { setFlag: 'probezeit_gespraech' }, ...KINDER(20)] }),
      ],
    },

    'main-1-probezeit-gespraech': {
      id: 'main-1-probezeit-gespraech',
      start: 'start',
      nodes: [
        node('start', [
          N('Das Hinterzimmer. Ein Schreibtisch voller Kassenbücher, ein Sofa mit Brandloch, eine Pinnwand voller Aufträge und ein altes Crewfoto, auf dem jemand ein Gesicht mit Edding geschwärzt hat.'),
          L('hunter', 'Setz dich.'),
        ], {
          choices: [
            { id: 'g-spaet', text: 'Hinsetzen.', when: { flag: 'probezeit_spaet' }, next: 'spaet', effects: [{ relation: 'hunter', delta: -20 }] },
            { id: 'g-puenktlich', text: 'Hinsetzen.', when: { notFlag: 'probezeit_spaet' }, next: 'puenktlich', effects: [{ relation: 'hunter', delta: 20 }] },
          ],
        }),
        node('spaet', [
          L('hunter', 'Du warst zu spät. Ich sag das einmal: In meinem Laden ist sechs Uhr sechs Uhr. Nicht sechs Uhr plus U-Bahn plus Ausrede.', 'wut'),
        ], { next: 'urteil' }),
        node('puenktlich', [
          L('hunter', 'Du warst pünktlich. Das ist mehr, als die meisten hier hinkriegen. Jimmy war nie pünktlich. Jimmy war zweimal gleichzeitig unpünktlich.'),
        ], { next: 'urteil' }),
        node('urteil', [
          L('hunter', 'Also. Ripper. Erzähl.'),
        ], {
          choices: [
            ...URTEILE.map((u): DialogueChoice => ({ id: u.id, text: u.text, when: u.when, next: u.id })),
            { text: '„Frag lieber, was ich als Nächstes mache.“', next: 'u-naechstes' },
          ],
        }),
        ...URTEILE.map((u) => node(u.id, [L('hunter', u.hunter)], { next: 'warum' })),
        node('u-naechstes', [L('hunter', 'Frag ich gleich. Selbstbewusst. Notiert. Ob das gut ist, sehen wir noch.')], { next: 'warum' }),
        node('warum', [
          L('hunter', 'Warum willst du in meine Crew?'),
        ], {
          choices: WARUM.map((w): DialogueChoice => ({
            id: w.id, text: w.text, next: w.id,
            ...(w.tag ? { tag: w.tag } : {}), ...(w.when ? { when: w.when } : {}),
            ...(w.tag ? { effects: [{ relation: 'hunter', delta: 10 }] } : {}),
          })),
        }),
        ...WARUM.map((w) => node(w.id, [L('hunter', w.hunter)], { next: 'jimmy' })),
        node('jimmy', [
          L('hunter', 'Du kriegst Jimmys Platz. Jimmy hat zwei Jobs gleichzeitig gemacht. Einen für mich, einen für irgendwen, der Gratis-Chips verteilt.'),
          L('hunter', 'Hat sich so ein Ding einsetzen lassen, an Xions Werbestand draußen in der Gasse. „Freiwillige gesucht, Snacks inklusive.“'),
          L('hunter', 'Jetzt hat er einen Virus auf dem Neurochip und hält sich für den Kundenservice von morgen. Baut nachts Türme aus Ölfässern an der Hafenkante. Total durchgedreht.', 'trauer'),
        ], {
          choices: [
            { text: '„Kann man ihm helfen?“', next: 'jimmy-hilfe' },
            { text: '„Und was heißt das für mich?“', next: 'jimmy-ich' },
          ],
        }),
        node('jimmy-hilfe', [
          L('hunter', 'Vega glaubt das. Vega glaubt auch, dass Tauben Gefühle haben.'),
          L('hunter', '… Vielleicht haben sie die ja. Frag Vega. Aber nicht heute.'),
        ], { next: 'beutel' }),
        node('jimmy-ich', [
          L('hunter', 'Dass du keine Gratis-Chips anfasst. Nie. Auch nicht, wenn sie glitzern. Vor allem nicht, wenn sie glitzern.'),
        ], { next: 'beutel' }),
        node('beutel', [
          N('Die Tür fliegt auf. Eine Frau mit Baseballschläger und einem Arm aus Chrom und Spiralfedern stapft rein, Zöpfe, Bandshirt mit rotem Stern. Hinter ihr eine zweite, ruhig, Gewehrkoffer auf dem Rücken.'),
          L('aria', 'Hunter! Dexter hat gezahlt. Also, so halb. Also, eher so ein Drittel.', 'signatur'),
          N('Sie wirft einen Beutel auf den Schreibtisch. Credits klimpern. Darunter rutscht ein Stapel glänzender Zettel hervor: „CHROME 10 – IHR UPGRADE ZUM GLÜCK“.'),
          L('vega', 'Vierhundert in bar. Der Rest in Gutscheinen. Ich hab ihm gesagt, das zählt nicht. Er hat gesagt, das ist die Zukunft.'),
          L('hunter', 'Die Zukunft kann mich mal. Zwölfhundert schuldet er. Vierhundert sind da. Bleiben achthundert.', 'wut'),
          L('aria', 'Ich kann zurückgehen und ihm die Zukunft aus dem Schädel prügeln.', 'wut'),
          L('hunter', 'Nicht du. Ihr.'),
          N('Er nickt in deine Richtung. Aria dreht den Kopf und mustert dich von oben bis unten wie ein Möbelstück, das sie vielleicht mitnehmen will.'),
        ], {
          choices: [
            { id: 'b-normal', text: 'Weiter.', when: NICHT_VEX, next: 'aria-hallo' },
            { id: 'b-vex', text: 'Weiter.', when: VEX, next: 'aria-vex' },
          ],
        }),
        node('aria-hallo', [
          L('aria', 'Und wer ist das? Der neue Jimmy? Hoffentlich mit weniger Chip und mehr Hirn.'),
          L('vega', 'Vega. Das ist Aria. Sie ist netter, als sie klingt.'),
          L('aria', 'Bin ich nicht.'),
          L('vega', 'Ist sie.'),
        ], { next: 'nyra' }),
        // Vex × Aria, Erstkontakt (Rivalinnen-Vorspiel, world.md §4.7: Sticheleien, kein ausdrücklicher Flirt).
        node('aria-vex', [
          L('aria', 'Moment. Die Postbotin? Hunter, du stellst die Postbotin ein?', 'ueberrascht'),
          L('player', 'Kurierin, Zöpfe. Postboten klingeln.', 'neutral'),
          L('aria', 'Ach. Und du nicht?'),
          L('player', 'Ich komm durchs Fenster.'),
          L('aria', 'Durchs Fenster. Na klar. Und wenn’s zu ist?', 'signatur'),
          L('player', 'Dann ist es danach offen.'),
          L('vega', 'Vega. Hallo. Und ihr zwei hört jetzt auf, euch anzustarren. Das hier ist kein Schießstand.'),
          L('aria', 'Ich starr nicht. Ich schätz ab, wo ich hinhaue.'),
          L('player', 'Links. Rechts ist aus Metall. Ripper-Ware, Großmaul. Tut nur dir weh.', 'signatur'),
          L('aria', 'Ripper-Ware! Ich hör’s quietschen bis hier. Meiner ist von Dante. Meiner quietscht nur, wenn ich will.', 'freude'),
          L('player', 'Gut zu wissen.'),
          L('aria', '… Was soll das jetzt heißen?'),
          L('player', 'Nichts. Fahr dein Großmaul wieder ein.'),
          N('Vega seufzt so leise, dass nur der Gewehrkoffer es hört.'),
        ], { effects: [{ relation: 'aria', delta: 20 }, { setFlag: 'vexaria_erstkontakt' }], next: 'nyra' }),
        node('nyra', [
          N('Plötzlich wirbelt Aria herum, schneller, als man es bei dem Arm erwarten würde, und greift in den Lüftungsschacht neben der Tür. Sie zieht eine junge Frau mit Kapuze und Laptop heraus, am Kragen, wie eine Katze aus dem Wäschekorb.'),
          L('aria', 'Und wen haben wir DA? Lauscht die hier schon die ganze Zeit, oder was?', 'wut'),
          L('nyra', 'Ich – ich hab nur – das ist ein öffentlicher Lüftungsschacht!', 'besorgt'),
          L('aria', 'Der ist in UNSERER Wand, du kleine Ratte!'),
        ], {
          choices: [
            { check: 'gc-08', text: '„Aria. Lass sie los. Wer so gut lauscht, ist mehr wert als zehn Türsteher.“', next: 'nyra-los' },
            {
              tag: '[Schrott]', when: { origin: 'origin-schrott' },
              text: '„Das an ihrem Gürtel ist ein Netzwerkscanner. Eigenbau, Kühlrippen aus einer Toasterplatine. Die hat Talent.“', next: 'nyra-scanner',
            },
            { text: 'Abwarten, was Hunter macht.', next: 'nyra-hunter' },
          ],
        }),
        node('nyra-los', [
          L('aria', '… Pfff. Na gut. Weil du so nett fragst. Aber wenn sie noch mal in meiner Wand wohnt, wohnt sie danach in der Mülltonne.'),
          L('nyra', 'Danke. Ich bin Nyra. Silent-Angel. Vielleicht habt ihr schon von mir gehört.', 'freude'),
          L('vega', 'Nein.'),
          L('nyra', 'Noch nicht.'),
        ], { effects: [{ relation: 'nyra', delta: 80 }, { setFlag: 'nyra_probezeit_geholfen' }], next: 'nyra-ende' }),
        node('nyra-scanner', [
          L('nyra', 'Du – du erkennst die Kühlrippen?! NIEMAND erkennt die Kühlrippen!', 'ueberrascht'),
          L('aria', 'Was sind Kühlrippen? Klingt nach Grillgut.'),
          L('nyra', 'Ich bin Nyra. Silent-Angel. Und du bist offiziell mein Lieblingsmensch in diesem Raum.', 'freude'),
          L('aria', 'Hey!'),
        ], { effects: [{ relation: 'nyra', delta: 80 }, { setFlag: 'nyra_probezeit_geholfen' }], next: 'nyra-ende' }),
        node('nyra-hunter', [
          L('hunter', 'Lass sie, Aria.'),
          L('aria', 'Die hat gelauscht!'),
          L('hunter', 'Jeder lauscht. Die hier macht’s wenigstens gut.'),
          N('Aria lässt los. Die junge Frau stolpert, fängt ihren Laptop auf und macht an der Tür noch schnell ein Foto von euch allen.'),
        ], { next: 'nyra-ende' }),
        node('nyra-ende', [
          L('hunter', 'Der Schacht wird zugeschweißt. Und du, Kleine, kommst wieder, wenn du was zu verkaufen hast, statt was zu klauen.'),
          L('nyra', 'Ich klau nicht. Ich … archiviere!'),
          N('Und weg ist sie. Durch die Tür diesmal.'),
        ], { next: 'probezeit' }),
        node('probezeit', [
          L('hunter', 'Gut. Hör zu, Neuling. Probezeit. Eine Woche. Du schläfst oben im Crew-Quartier. Das Bett ist hart, die Decke ist sauber. Meistens.'),
          L('hunter', 'Da an der Wand hängt die Auftragstafel. Wer arbeitet, isst. Wer nicht arbeitet, isst bei Babette und zahlt selbst.'),
          L('hunter', 'Und dein erster richtiger Job: Dexter. Schrottmarkt, oben auf der Halde. Achthundert. Vega und Aria gehen mit.'),
          L('aria', 'Endlich. Ich hab den Schläger schon frisch geölt.', 'freude'),
          L('vega', 'Man ölt keine Baseballschläger.'),
          L('aria', 'Ich schon.'),
          L('hunter', 'Noch was. Diese Woche kommt Raven raus. Wenn du ihr begegnest: Sei höflich. Sie war sieben Jahre nicht höflich. Da hat sie Nachholbedarf. In die andere Richtung.'),
        ], {
          choices: [
            { text: '„Ich bin dabei.“', effects: [{ setFlag: 'probezeit_bestanden' }] },
            { text: '„Und wenn ich die Probezeit verkacke?“', next: 'verkacken', once: true },
          ],
        }),
        node('verkacken', [
          L('hunter', 'Dann bist du Gast. Gäste zahlen. Und Gäste fliegen raus, wenn Bruno schlechte Laune hat. Bruno hat immer schlechte Laune.'),
        ], {
          choices: [{ text: '„Ich bin dabei.“', effects: [{ setFlag: 'probezeit_bestanden' }] }],
        }),
      ],
    },
  },

  mapAdditions: {
    'neon-gasse': {
      hotspots: [{
        id: 'probezeit-bruno', at: 'hv-eingang', label: 'Mit dem Türsteher reden', kind: 'talk', dialogue: 'main-1-probezeit-bruno',
        when: { all: [{ flag: 'prolog_done' }, { notFlag: 'hv_einlass' }, { time: ['abend', 'nacht'] }, { not: { quest: Q, state: 'done' } }] },
      }],
    },
    'high-voltage': {
      onEnter: [
        {
          id: 'probezeit-ecktisch-bild', when: { all: [SZENE_OFFEN, { clockBetween: [UHR(17, 55), UHR(20)] }] },
          cutscene: 'main-1-probezeit-ecktisch',
        },
        { id: 'probezeit-szene', once: false, when: SZENE_OFFEN, dialogue: 'main-1-probezeit-szene' },
        {
          id: 'probezeit-nach-kampf', when: { all: [{ won: 'enc-hv-ripper-tisch' }, { notFlag: 'probezeit_bestanden' }, { notFlag: 'probezeit_nach_kampf' }] },
          dialogue: 'main-1-probezeit-nach-kampf',
        },
        {
          id: 'probezeit-nach-niederlage',
          when: { all: [{ flag: 'ripper_kampf_verloren' }, { notFlag: 'probezeit_bestanden' }, { notFlag: 'probezeit_nach_kampf' }] },
          dialogue: 'main-1-probezeit-nach-niederlage',
        },
      ],
    },
    'hv-hinterzimmer': {
      onEnter: [{
        id: 'probezeit-gespraech', once: false,
        when: { all: [{ flag: 'probezeit_gespraech' }, { notFlag: 'probezeit_bestanden' }] },
        dialogue: 'main-1-probezeit-gespraech',
      }],
    },
  },
};
