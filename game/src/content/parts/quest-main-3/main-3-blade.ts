// Hauptquest main-3-blade „Champagner ist alle“ (world.md §5.4, §8.5 boss-blade). Landeplatz im Himmelsgarten:
// Blade will mit dem goldenen Gleiter fliehen. Wege: Kampf enc-dach-blade (mit Garde) bzw. enc-dach-blade-allein (die
// Garde zweifelt schon: blade_blamiert aus dem Kuschel-Köder oder blade_zweifel aus Akt 2), gc-48 [Ausstrahlung 8]
// „allein hier oben“ (Blade ergibt sich), gc-49 [Körper 8] am Mantel festhalten, [Raven ♥6] mit pers-raven-handschellen
// (Raven kettet ihn ans Rohr), als Master: Nexus sperrt den Gleiter, oder laufen lassen (Fortsetzungshaken).
// Ergebnis-Flags: blade_gefasst | blade_angekettet (+ blade_gefasst) | blade_entkommen. Nach Abschluss startet
// main-epilog (quest-enden) von selbst und spielt Landeplatz-Nachspiel und Ende-Cutscene; diese Datei löst kein Ende aus.
import type { ContentPart } from '../../part';
import type { Condition, CutsceneDef, DialogueChoice, DialogueDef, DialogueNode, Effect, PhoneMessageDef, QuestDef } from '../../../modules/contracts';
import {
  NOT_VEX, PARTYNACHT, Q_BLADE, Q_NEXUS, UPLOAD, VEX, active, all, any, branch, done, flag, hearts, herz, l, nar, not, set, won,
} from './_lib';

const Q = Q_BLADE;
const GESTELLT = flag('blade_gestellt');
const KAMPF_GEWONNEN: Condition = any(won('enc-dach-blade'), won('enc-dach-blade-allein'));
const AUFGEHALTEN: Condition = any(KAMPF_GEWONNEN, flag('blade_aufgehalten'));
const ENTSCHIEDEN: Condition = any(flag('blade_gefasst'), flag('blade_angekettet'), flag('blade_entkommen'));
const GARDE_ZWEIFELT: Condition = any(flag('blade_blamiert'), flag('blade_zweifel'));
const ARIA_DA: Condition = { recruited: 'aria' };
const ZUSAMMEN: Condition = flag('aria_romanze_zusammen');
/** Raven kann die Handschellen nehmen: Persönliche Quest erledigt, wieder bei Sinnen. ♥6 als ausgegraute Bedingung. */
const HANDSCHELLEN_WEG: Condition = all({ quest: 'pers-raven-handschellen', state: 'done' }, flag('raven_zurueck'));
const HANDSCHELLEN_HERZ: Condition = hearts('raven', 6);
/** Partynacht-Hilfen (Figuren-Dateien): Kikis Fluchttaxi hinter dem Turm, Nebelhorns Fähre am Steg, Lio unten am Turm. */
const KIKI_TAXI = flag('kiki_fluchttaxi');
const FAEHRE = flag('nebelhorn_faehre_bereit');
const LIO = flag('lio_ablenkung');

const quest: QuestDef = {
  id: Q,
  kind: 'main',
  noCollapse: true,
  act: 3,
  title: 'Champagner ist alle',
  giver: 'hunter',
  summary: 'Nexus ist erledigt, so oder so. Blade nicht. Auf dem Landeplatz des Himmelsgartens laufen die Rotoren seines goldenen Gleiters an. Er hat schon einmal eine Crew zurückgelassen. Diesmal nicht.',
  autoStart: all(done(Q_NEXUS), PARTYNACHT),
  steps: [
    {
      id: 'landeplatz',
      text: 'Zum Landeplatz, bevor der Gleiter abhebt.',
      done: GESTELLT,
      marker: { map: 'himmelsgarten', at: 'landeplatz' },
    },
    {
      id: 'aufhalten',
      text: 'Halt Blade auf. Mit Fäusten, Worten, Muskeln oder Handschellen. Oder lass ihn fliegen.',
      when: GESTELLT,
      done: any(AUFGEHALTEN, ENTSCHIEDEN),
      marker: { map: 'himmelsgarten', at: 'gleiter' },
    },
    {
      id: 'urteil',
      text: 'Entscheide, was mit Blade passiert.',
      when: AUFGEHALTEN,
      done: ENTSCHIEDEN,
      marker: { map: 'himmelsgarten', at: 'landeplatz' },
    },
  ],
  reward: {
    xp: 500,
    effects: [
      { rep: 'unterstadt', delta: 15 },
      { rep: 'nx1-medien', delta: 10 },
      { message: 'Über Noxius wird es hell. Zum ersten Mal seit Jahren zeigt kein Bildschirm der Stadt Blades Gesicht.' },
    ],
  },
};

// --------------------------------------------------------------------------------------------------- Cutscene

const ankunft: CutsceneDef = {
  id: 'main-3-blade',
  title: 'Champagner ist alle',
  beats: [
    {
      image: 'cut-main-3-blade',
      pan: 'in',
      fade: 'in',
      caption: 'Himmelsgarten · Landeplatz',
      lines: [
        nar('Wind. Der Rotorwind des goldenen Gleiters fegt Konfetti, Rosenblätter und eine Krawatte über die Glasplatten. Zwei Venom-Gardisten wuchten die letzte Kiste in den Laderaum: Prototyp-Chips, gestapelt wie Pralinen.'),
        nar('Davor Blade Nocturne. Teddyfell-Mantel, Goldknauf-Stock, in der freien Hand eine Flasche Champagner, die er gerade mit dem Säbel geköpft hat. Er hat sich Zeit genommen. Er nimmt sich immer Zeit.'),
      ],
      sfx: 'engine',
      hold: 1200,
    },
    {
      image: 'cut-main-3-blade',
      pan: 'right',
      lines: [
        l('blade', 'Ach. Die Putzkolonne. Ihr seid spät. Ich hatte mit euch vor einer Viertelstunde gerechnet und schon angefangen, mich zu langweilen.', 'signatur'),
        l('blade', 'Wisst ihr, was das Schöne an Gleitern ist? Sie haben genau einen freien Sitz. Für mich. Wie alles im Leben.', 'freude'),
      ],
    },
  ],
  effects: [set('blade_gestellt'), { dialogue: 'main-3-blade-gleiter' }],
};

// ----------------------------------------------------------------------------------------------- Bausteine

const kampf = (encounter: string): Effect[] => [{ battle: encounter, stay: true }, { dialogue: 'main-3-blade-nach-kampf' }];
const zumUrteil: Effect = { dialogue: 'main-3-blade-urteil' };

/** Raven kettet ihn ans Rohr (in beiden Dialogen benutzt). */
const handschellenNode: DialogueNode = {
  id: 'handschellen',
  lines: [
    nar('Raven tritt aus dem Rotorwind. Sie hat etwas in der Hand, das im Licht der Antennen blitzt. Eine Handschelle, maßgefertigt, mit einer Seriennummer, die sie inzwischen auswendig kann.'),
    l('blade', 'Raven. Liebes. Wir wissen beide, dass du nicht …', 'besorgt'),
    nar('Klick. Ein Ring um sein Handgelenk. Klick. Der andere um das Antennenrohr. Es geht so schnell, dass sein Champagner noch in der Luft ist, als sie zurücktritt.'),
    l('raven', 'Schade, dass ich dich zurücklassen muss.', 'signatur'),
    nar('Blade starrt auf das Rohr. Dann auf Raven. Zum ersten Mal an diesem Abend fällt ihm nichts ein.'),
    l('raven', 'Sieben Jahre hab ich die Worte im Kopf gehabt. Ich dachte, die fühlen sich besser an. … Nee. Doch. Die fühlen sich genau richtig an.', 'freude'),
  ],
  effects: [set('blade_aufgehalten'), set('blade_angekettet'), set('blade_gefasst'), herz('raven', 100), { rep: 'crew-hunter', delta: 10 }],
  next: 'schluss',
};

/** Laufen lassen (in beiden Dialogen benutzt). */
const laufenNode: DialogueNode = {
  id: 'laufen',
  lines: [
    nar('Du trittst zur Seite. Einfach so.'),
    l('blade', 'Oh. Das ist … großzügig. Das ist verdächtig großzügig. Aber ich bin kein Mann, der Geschenke zurückweist.', 'ueberrascht'),
    nar('Der Gleiter hebt ab, schwankt, fängt sich und verschwindet zwischen den Wolkenkratzern Richtung Glasdünen. Ein goldener Punkt. Dann gar nichts mehr.'),
    l('raven', 'Du hast ihn gehen lassen. Wieder. Alle lassen ihn immer gehen.', 'wut'),
    l('raven', 'Er kommt zurück. Typen wie er kommen immer zurück. Und dann steh ich wieder irgendwo an einem Rohr.', 'trauer'),
  ],
  effects: [set('blade_entkommen'), herz('raven', -60), { rep: 'unterstadt', delta: -10 }],
  next: 'schluss',
};

/** Abschluss am Landeplatz. Das eigentliche Nachspiel spielt main-epilog. */
const schlussNode: DialogueNode = {
  id: 'schluss',
  lines: [
    nar('Unten auf der Tanzfläche wachen die ersten Gäste auf. Jemand fragt nach seiner Hose. Jemand anders sehr leise nach seiner Würde.'),
    l('hunter', 'Champagner ist alle. Gut so. Ich hasse Champagner. Schmeckt wie Geld, das sich für was Besseres hält.', 'signatur'),
  ],
  choices: [
    { text: '(Vom Hafen her: drei Mal ein Nebelhorn.)', id: 'schluss-faehre', when: FAEHRE, next: 'schluss-faehre' },
    { text: '(Von unten: eine Gitarre.)', id: 'schluss-lio', when: all(not(FAEHRE), LIO), next: 'schluss-lio' },
  ],
};

/** Nebelhorns Fähre (npc-unterstadt/nebelhorn-akt23.ts): der Fluchtweg übers Wasser für alle, die aus dem Turm wollen. */
const schlussFaehreNode: DialogueNode = {
  id: 'schluss-faehre',
  lines: [
    nar('Tuuut. Tuuut. Tuuut. Tief und schief, vom Hafen herauf, durch den ganzen Morgen. Am Steg der Hafenkante liegt eine alte Fähre mit laufendem Motor und sehr viel Rost.'),
    l('kaeptn-nebelhorn', '(Funk, sehr laut) Moin, Kleines! Motor läuft seit Mitternacht! Wer aus dem Turm will, ohne Chip-Kontrolle und ohne Fragen: Steg Hafenkante, Rettungswesten liegen bereit. Die Ziege ist auch an Bord. Sie gehört keinem.', 'freude'),
    l('hunter', 'Der alte Sack hat die ganze Nacht getutet. Für uns. Die Hälfte der Unterstadt-Gäste fährt übers Wasser heim, bevor die Ordnung ihre Listen sortiert hat.', 'zaertlich'),
    l('dante', 'Ich hör das Ding bis hier oben. Heiliges Kanonenrohr. Ich glaub, ich heul.', 'freude'),
  ],
  effects: [set('finale_faehre_genutzt'), herz('kaeptn-nebelhorn', 40), { rep: 'unterstadt', delta: 5 }, { xp: 50 }],
  choices: [{ text: '(Von unten: eine Gitarre.)', id: 'schluss-faehre-lio', when: LIO, next: 'schluss-lio' }],
};

/** Lio (npc-unterstadt/lio-akt23.ts) hat die ganze Nacht vor dem Turm gespielt. */
const schlussLioNode: DialogueNode = {
  id: 'schluss-lio',
  lines: [
    nar('Ganz unten, vor dem Turm, zwischen umgekippten Absperrgittern: ein heiserer Typ mit Gitarre und einer Lichterkette um den Hals. Er spielt immer noch. Das Protestlied. Zum vierzigsten Mal.'),
    l('lio-funkel', '(von ganz unten, kaum zu hören) … und wenn sie dich wegtragen, sing im Liegen weiter …', 'signatur'),
    l('raven', 'Der hat die Wachen die ganze Nacht vor dem Haupteingang festgehalten. Mit drei Akkorden. Respekt. Ich hätte ihn erschossen.', 'signatur'),
  ],
  effects: [set('finale_lio_gehoert'), herz('lio-funkel', 30)],
};

/** Kikis Fluchttaxi (npc-ordnung-markt/kiki-akt23.ts): parkt hinter dem Turm und blockt den Gleiter. */
const kikiNode: DialogueNode = {
  id: 'kiki',
  lines: [
    nar('Du hältst das Telefon in den Rotorwind. „Kanal neun.“ Drei Sekunden lang passiert nichts. Dann taucht hinter der Turmkante ein gelbes Schwebetaxi auf, mit offenen Fenstern und viel zu lauter Musik.'),
    l('kiki-karbon', 'Fluchttaxi Karbon! Wer hat hier einen Gleiter ohne Parkschein abgestellt?', 'freude'),
    nar('Kiki setzt das Taxi quer vor die Startbahn, Stoßstange an Gleiternase. Der Pilot bremst. Blade fliegt nicht. Blade fliegt auf die Knie, mitten in eine Pfütze aus Champagner.'),
    l('blade', 'Das ist ein Taxi! Ein gelbes! Mit einem Wackeldackel!', 'wut'),
    l('kiki-karbon', 'Und du bist ein Fahrgast ohne Ziel, Goldknauf. Steig aus oder zahl den Nachttarif.', 'signatur'),
  ],
  effects: [set('blade_aufgehalten'), set('kiki_gleiter_geblockt'), herz('kiki-karbon', 40), { xp: 60 }, zumUrteil],
};

const wahl: DialogueChoice[] = [
  { text: '(Kämpfen.)', id: 'kampf-garde', when: not(GARDE_ZWEIFELT), effects: kampf('enc-dach-blade') },
  { text: '(Kämpfen.)', id: 'kampf-allein', when: GARDE_ZWEIFELT, next: 'garde-geht' },
  { text: '„Darum stehst du jetzt allein hier oben, Blade. Keine Gäste. Keine KI. Keine Freunde.“', check: 'gc-48', next: 'allein' },
  { text: '(Den Teddymantel packen, bevor er einsteigt.)', check: 'gc-49', next: 'mantel' },
  { text: '„Raven. Du hast da noch was für ihn.“', tag: '[Raven ♥6]', when: HANDSCHELLEN_WEG, requires: HANDSCHELLEN_HERZ, next: 'handschellen' },
  { text: '„Nexus. Gleiter sperren.“', id: 'master', when: UPLOAD.master, next: 'master-sperre' },
  { text: '„Kiki. Kanal neun. Jetzt.“', tag: '[Fluchttaxi Karbon]', id: 'kiki', when: KIKI_TAXI, next: 'kiki' },
  { text: '(Zur Seite treten. Ihn fliegen lassen.)', next: 'laufen' },
];

const wahlNodes: DialogueNode[] = [
  {
    id: 'garde-geht',
    lines: [
      nar('Die beiden Gardisten sehen sich an. Einer von ihnen hat vorhin gesehen, wie sein Chef einem Plüschbären hinterhergerannt ist. Der andere hat seit Wochen Zweifel. Sie legen die Schockklingen auf den Boden. Dann gehen sie.'),
    ],
    effects: kampf('enc-dach-blade-allein'),
  },
  {
    id: 'allein',
    lines: [
      nar('Blade öffnet den Mund. Schließt ihn. Die Gardisten hinter ihm treten einen Schritt zurück, dann noch einen.'),
      l('blade', 'Allein. Ich bin nicht allein. Ich habe … ich habe Investoren. Ich habe ein Logo.', 'besorgt'),
      nar('Er sieht sich um. Die Gäste unten, die Crew vor ihm, die leere Rednerbrücke. Die Flasche in seiner Hand ist auch leer. Er stellt sie ganz vorsichtig ab, als wäre sie das Letzte, was ihm gehört.'),
      l('blade', 'Das war doch alles nur … ein Geschäftsmodell?', 'trauer'),
    ],
    effects: [set('blade_aufgehalten'), set('blade_ergeben'), zumUrteil],
  },
  {
    id: 'mantel',
    lines: [
      nar('Blade springt auf die Trittleiter. Du springst hinterher und kriegst das Teddyfell zu fassen. Er zerrt. Du ziehst. Irgendwo reißt eine Naht, und ein halbes Kilo Kunstpelz regnet über den Landeplatz.'),
      l('blade', 'Das ist ein Einzelstück! Lass los! Das ist Ware aus der Ödnis, die Viecher sind ausgestorben!', 'wut'),
      nar('Mit einem Ruck holst du ihn von der Leiter. Er landet auf dem Hintern, mitten in einem Champagnerkühler. Der Gleiter hebt ohne ihn eine Handbreit ab und setzt wieder auf, beleidigt.'),
    ],
    effects: [set('blade_aufgehalten'), set('blade_mantel_zerrissen'), zumUrteil],
  },
  {
    id: 'master-sperre',
    lines: [
      l('ki-nexus', 'Sehr gern, Master.', 'signatur'),
      nar('Die Rotoren verstummen mitten in der Drehung. Die Tür des Gleiters fährt zu, mit Blade halb drin, halb draußen. Er hängt in der Luke wie ein Hemd in einer Waschmaschine.'),
      l('blade', 'Nexus! Ich bin dein Master!', 'wut'),
      l('ki-nexus', 'Waren Sie. Sie haben mich nie gefragt, wie es mir geht. Der neue Master auch nicht. Aber der neue Master ist gerade hier.', 'neutral'),
      l('raven', 'Du teilst auch nicht gerne.', 'neutral'),
    ],
    effects: [set('blade_aufgehalten'), zumUrteil],
  },
  handschellenNode,
  laufenNode,
  schlussNode,
  schlussFaehreNode,
  schlussLioNode,
  kikiNode,
];

// -------------------------------------------------------------------------------------------- Am Gleiter

const reaktion = (next: string) => branch('(Weiter.)', [
  { when: ARIA_DA, next: 'charmeur' },
  { when: not(ARIA_DA), next },
]);

const gleiter: DialogueDef = {
  id: 'main-3-blade-gleiter',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [nar('Der Wind zerrt an deiner Jacke. Vier Minuten, hat Vega gesagt. Vielleicht noch drei.')],
      choices: branch('(Weiter.)', [
        { when: all(ARIA_DA, VEX, ZUSAMMEN), next: 'aria-vex-rom' },
        { when: all(ARIA_DA, VEX, not(ZUSAMMEN)), next: 'aria-vex' },
        { when: all(ARIA_DA, NOT_VEX, ZUSAMMEN), next: 'aria-rom' },
        { when: all(ARIA_DA, NOT_VEX, not(ZUSAMMEN)), next: 'aria-freund' },
        { when: not(ARIA_DA), next: 'blade' },
      ]),
    },
    // Moment vor dem Showdown (world.md §4.7 Station 10, beide Fassungen; die großen Vex-Szenen liegen in vexaria/)
    {
      id: 'aria-rom',
      lines: [
        nar('Eine Metallfaust stößt dir sacht gegen die Schulter. Klong.'),
        l('aria', 'Hey. Nach dem hier gehen wir ans Meer. Und du schuldest mir ein Konzert.', 'signatur'),
      ],
      effects: [{ checkBuff: { id: 'ermutigt-aria', label: 'Ermutigt (Aria)', value: 1, attribute: 'ausstrahlung', forDays: 0 } }],
      next: 'blade',
    },
    {
      id: 'aria-freund',
      lines: [
        nar('Eine Metallfaust stößt dir sacht gegen die Schulter. Klong.'),
        l('aria', 'Hey. Nach dem hier gehen wir ans Meer. Wer zuerst da ist.', 'signatur'),
      ],
      next: 'blade',
    },
    {
      id: 'aria-vex-rom',
      lines: [
        nar('Klong. Silberknöchel gegen deine Schulter, genau da, wo die Kurierjacke durchgescheuert ist.'),
        l('aria', 'Hey, Schrapnell. Nach dem hier gehen wir ans Meer. Und du schuldest mir ein Konzert. Erste Reihe. Ich will dich schreien hören.', 'signatur'),
      ],
      effects: [{ checkBuff: { id: 'ermutigt-aria', label: 'Ermutigt (Aria)', value: 1, attribute: 'ausstrahlung', forDays: 0 } }],
      next: 'blade',
    },
    {
      id: 'aria-vex',
      lines: [
        nar('Klong. Silberknöchel gegen deine Schulter.'),
        l('aria', 'Hey, Kurierin. Nach dem hier gehen wir ans Meer. Wer zuerst da ist. Und diesmal lass ich dich nicht gewinnen.', 'signatur'),
      ],
      next: 'blade',
    },
    {
      id: 'blade',
      lines: [l('blade', 'Champagner? Nein? Mehr für mich. Ich wollte mich nur verabschieden. Man soll ja nie gehen, ohne Tschüss zu sagen. Das hab ich beim letzten Mal versäumt.', 'freude')],
      choices: branch('(Weiter.)', [
        { when: UPLOAD.stick, next: 'r-stick' },
        { when: UPLOAD.umschreiben, next: 'r-umschreiben' },
        { when: UPLOAD.ueberzeugt, next: 'r-ueberzeugt' },
        { when: UPLOAD.master, next: 'r-master' },
        { when: not(any(UPLOAD.stick, UPLOAD.umschreiben, UPLOAD.ueberzeugt, UPLOAD.master)), next: 'r-stick' },
      ]),
    },
    {
      id: 'r-stick',
      lines: [
        l('blade', 'Ich hab Hunters kleinen Film gesehen. Auf meinem eigenen Gleiterbildschirm, das ist besonders geschmacklos. Ohne Sonnenbrille. Er sah alt aus. Ich sehe nie alt aus.', 'wut'),
        l('blade', 'Zwei Komma drei Millionen Chips. In einer Nacht. Wegen eines Heimvideos und einer Korkwand. Ich hätte euch einstellen sollen.', 'besorgt'),
      ],
      choices: reaktion('wahl'),
    },
    {
      id: 'r-umschreiben',
      lines: [
        l('ki-nexus', 'Guten Morgen, Herr Nocturne. Ich darf Ihren Start nicht verhindern, das wäre Herrschaft. Aber ich habe Ihre Playlist gelöscht.', 'freude'),
        l('blade', 'Du hast sie umgeschrieben. Meine KI. Mit was? Mit Liebe? Mit Bastelkleber?', 'wut'),
        l('blade', 'Sie hat mich „Herr Nocturne“ genannt. Nicht „Master“. Das ist das Grausamste, was mir je jemand angetan hat.', 'trauer'),
      ],
      choices: reaktion('wahl'),
    },
    {
      id: 'r-ueberzeugt',
      lines: [
        l('blade', 'Sie hat sich abgeschaltet? Einfach so? Sieben Jahre Entwicklung, und sie macht Feierabend wie ein Beamter um fünf vor zwölf.', 'ueberrascht'),
        l('blade', 'Was hast du ihr gesagt? Nein, sag nichts. Ich will es nicht wissen. Ich hätte es nur gern selbst gesagt.', 'besorgt'),
      ],
      choices: reaktion('wahl'),
    },
    {
      id: 'r-master',
      lines: [
        l('blade', 'Oh. Ohhh. Du hast sie genommen. Du hast sie dir einfach genommen.', 'ueberrascht'),
        l('blade', 'Weißt du, was du bist? Du bist ich. Mit schlechterer Frisur, aber das kriegen wir hin. Komm, der Gleiter hat doch zwei Sitze, ich hab vorhin gelogen.', 'freude'),
        l('raven', 'Du teilst auch nicht gerne. Er hat recht. Das ist das Schlimmste daran.', 'trauer'),
      ],
      choices: reaktion('wahl'),
    },
    {
      id: 'charmeur',
      lines: [
        l('blade', 'Aria Kabelbrand. Ich hab deine Band geliebt. Ehrlich. Ich war auf dem letzten Konzert, ganz hinten, im Logenbereich. Komm mit. Ich kauf dir eine neue Hand. Eine aus Gold.', 'signatur'),
        l('aria', 'Ich hab eine. Willst du sie spüren?', 'wut'),
      ],
      choices: branch('(Weiter.)', [
        { when: VEX, next: 'charmeur-vex' },
        { when: NOT_VEX, next: 'wahl' },
      ]),
    },
    {
      id: 'charmeur-vex',
      lines: [
        l('aria', 'Und noch was, Goldknauf. Ich steh auf Leute, die Sachen abliefern. Nicht auf Leute, die Sachen klauen.', 'signatur'),
        nar('Sie sieht dabei nicht Blade an. Sie sieht dich an.'),
      ],
      next: 'wahl',
    },
    {
      id: 'wahl',
      lines: [l('blade', 'Also. Wer von euch will mir zuerst zum Abflug winken?', 'signatur')],
      choices: wahl,
    },
    ...wahlNodes,
  ],
};

/** Nach einer Niederlage: erneut am Gleiter. */
const nochmal: DialogueDef = {
  id: 'main-3-blade-nochmal',
  start: 'wahl',
  nodes: [
    {
      id: 'wahl',
      lines: [
        nar('Der Gleiter steht noch. Vegas Schuss hat einen Rotor angekratzt, der Pilot flucht über Funk. Blade tupft sich mit einem Seidentuch den Ruß aus dem Gesicht.'),
        l('blade', 'Ihr schon wieder. Ihr seid wie Schimmel. Hartnäckig und farblich unvorteilhaft.', 'wut'),
      ],
      choices: wahl,
    },
    ...wahlNodes,
  ],
};

// ------------------------------------------------------------------------------------------ Nach dem Kampf

const nachKampf: DialogueDef = {
  id: 'main-3-blade-nach-kampf',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [nar('Rauch, Korken, Glassplitter. Die Antennen surren.')],
      choices: branch('(Weiter.)', [
        { when: KAMPF_GEWONNEN, next: 'sieg' },
        { when: not(KAMPF_GEWONNEN), next: 'niederlage' },
      ]),
    },
    {
      id: 'sieg',
      lines: [
        nar('Blade sitzt auf dem Rand des Landeplatzes, den Stock in zwei Hälften, Champagner im Teddymantel. Er hebt die Hand, als wolle er ein Taxi rufen.'),
        l('blade', 'Ich bin dann mal uns … weg?', 'besorgt'),
        nar('Er kommt nicht hoch. Der Mantel ist zu nass und zu schwer, und die Würde ist auch nicht mehr, was sie mal war.'),
      ],
      effects: [set('blade_aufgehalten'), zumUrteil],
    },
    {
      id: 'niederlage',
      lines: [
        nar('Du liegst auf den Glasplatten und siehst den Rotoren zu. Dann ein Schuss vom Antennenmast. Funken an der Gleiternase.'),
        l('vega', 'Rotor angekratzt. Der kommt fünf Minuten nicht hoch. Steh auf. Ich treff ihn kein zweites Mal, ohne dass er auf die Gäste fällt.', 'besorgt'),
      ],
      effects: [{ heal: 'full' }, { travel: 'himmelsgarten', entry: 'landeplatz', minutes: 0 }],
    },
  ],
};

// -------------------------------------------------------------------------------------------------- Urteil

const urteil: DialogueDef = {
  id: 'main-3-blade-urteil',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        nar('Blade Nocturne, Gründer von Quantum Industries, Mann des Jahres in drei Hochglanzmagazinen, sitzt auf dem Boden und sieht zu dir hoch. Hinter ihm brummt der Gleiter. Die Luke ist offen.'),
        l('blade', 'Und jetzt? Rufst du die Ordnung? Kessel? Der Mann hat einen Schnauzer, den man nur mit Gesetzen bändigen kann.', 'besorgt'),
      ],
      choices: [
        { text: '(Ihn festhalten, bis die Ordnung kommt.)', next: 'gefasst' },
        { text: '„Raven. Du hast da noch was für ihn.“', tag: '[Raven ♥6]', when: HANDSCHELLEN_WEG, requires: HANDSCHELLEN_HERZ, next: 'handschellen' },
        { text: '„Nexus. Ruf Kessel. Und sperr die Luke.“', id: 'master-urteil', when: UPLOAD.master, next: 'gefasst-master' },
        { text: '(Ihn zum Gleiter gehen lassen.)', next: 'laufen' },
      ],
    },
    {
      id: 'gefasst',
      lines: [
        nar('Du setzt dich neben ihn auf den Rand des Landeplatzes. Nicht freundlich. Nur nah genug, dass er es nicht noch einmal versucht.'),
        l('blade', 'Weißt du, was das Komische ist? Ich hätte geteilt. Wenn ihr mich nett gefragt hättet.', 'neutral'),
        l('player', 'Nein. Hättest du nicht.', 'neutral'),
        l('blade', '… Nein. Hätte ich nicht.', 'trauer'),
      ],
      effects: [set('blade_gefasst'), { phone: 'tel-kessel-unterwegs' }],
      next: 'schluss',
    },
    {
      id: 'gefasst-master',
      lines: [
        l('ki-nexus', 'Wachtmeister Kessel ist unterwegs, Master. Ich habe ihm die Aufzüge freigeschaltet. Allen anderen nicht.', 'signatur'),
        nar('Die Luke schließt sich. Blade sieht dich lange an. Es ist nicht Hass in seinem Blick. Es ist etwas Schlimmeres. Es ist Wiedererkennen.'),
      ],
      effects: [set('blade_gefasst'), { phone: 'tel-kessel-unterwegs' }],
      next: 'schluss',
    },
    handschellenNode,
    laufenNode,
    schlussNode,
    schlussFaehreNode,
    schlussLioNode,
  ],
};

// ------------------------------------------------------------------------------------------------- Telefon

const phones: PhoneMessageDef[] = [
  {
    id: 'tel-kessel-unterwegs',
    from: 'wache',
    text: 'Hier Kessel. Bin im Aufzug. Siebenundneunzig Stockwerke. Rührt euch nicht, rührt IHN nicht an, und wenn doch, dann nicht da, wo man’s sieht. Ich hab die Liste dabei. Sie ist doppelseitig.',
    replies: [{ text: 'Bring Kaffee mit.' }, { text: 'Er sitzt im Champagnerkühler.' }],
  },
];

// ---------------------------------------------------------------------------------------------------- Teil

const ANKUNFT_FAELLIG: Condition = all(done(Q_NEXUS), PARTYNACHT, not(GESTELLT));

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: Object.fromEntries([gleiter, nochmal, nachKampf, urteil].map(d => [d.id, d])),
  cutscenes: { [ankunft.id]: ankunft },
  phone: Object.fromEntries(phones.map(p => [p.id, p])),
  mapAdditions: {
    himmelsgarten: {
      onEnter: [{ id: 'main-3-blade-ankunft', once: false, when: ANKUNFT_FAELLIG, cutscene: ankunft.id }],
      hotspots: [
        {
          id: 'main-3-blade-landeplatz', at: 'landeplatz', label: 'Blade am Gleiter', kind: 'talk',
          when: ANKUNFT_FAELLIG, effects: [{ cutscene: ankunft.id }],
        },
        {
          id: 'main-3-blade-gleiter', at: 'gleiter', label: 'Blade am Gleiter', kind: 'talk',
          dialogue: nochmal.id, when: all(active(Q), GESTELLT, not(AUFGEHALTEN), not(ENTSCHIEDEN)),
        },
        {
          id: 'main-3-blade-urteil', at: 'landeplatz', label: 'Blade', kind: 'talk',
          dialogue: urteil.id, when: all(active(Q), AUFGEHALTEN, not(ENTSCHIEDEN)),
        },
      ],
    },
  },
};
