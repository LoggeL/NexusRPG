// Hauptquest main-3-nexus „Der Kern“ (world.md §5.4, §8.5 boss-nexus-kern). Serverkern unter dem Labor.
// Vor dem Kampf: FX-60 in den Digitech-Anschluss (side-eingehendes-fax erledigt → Logik-Knoten halbiert),
// Sybellas Stromschnitt (schwestern_gewarnt), gc-47 [Ausstrahlung 9] Nexus überzeugen (Kampf entfällt),
// [Nexus ♥6] → enc-kern-nexus-herz. Sonst Kampf in der passenden Fassung (mit/ohne Garde = xion_fehlt, mit/ohne FX-60).
// Upload-Entscheidung: (1) Hunters Stick → upload_stick, (2) umschreiben mit nexus-forschungsdaten oder
// nexus-chip-defekt und gc-46 / [Nyra ♥6] / alesa_zweifel → upload_umschreiben, (3) gc-47 überzeugen →
// upload_ueberzeugt (Selbstabschaltung), (4) selbst Master werden → upload_master. Danach Startfreigabe für Blades
// Gleiter: weiter zum Landeplatz (main-3-blade). Die Enden selbst spielt main-3-blade nach dem Landeplatz ab.
import type { ContentPart } from '../../part';
import type { Condition, CutsceneDef, DialogueChoice, DialogueDef, Effect, PhoneMessageDef, QuestDef } from '../../../modules/contracts';
import {
  CREW, MEINUNG_NEGATIV, MEINUNG_POSITIV, NOT_VEX, PARTYNACHT, Q_GEDANKEN, Q_NEXUS, UPLOAD_GEFALLEN, VEX, active, all, any,
  done, flag, hearts, herz, item, l, nar, noFlag, not, set, won,
} from './_lib';

const Q = Q_NEXUS;
const AKTIV = active(Q);
const ERREICHT = flag('kern_erreicht');
const FX60 = flag('fx60_eingesteckt');
const FAX_DONE: Condition = { quest: 'side-eingehendes-fax', state: 'done' };
const XION_WEG = flag('xion_fehlt');
const KERN_VARIANTEN = ['enc-kern-nexus', 'enc-kern-nexus-ohne-garde', 'enc-kern-nexus-fx60', 'enc-kern-nexus-fx60-ohne-garde', 'enc-kern-nexus-herz'];
const KERN_GEWONNEN: Condition = any(...KERN_VARIANTEN.map(won));
const BOSS_ERLEDIGT: Condition = any(KERN_GEWONNEN, flag('nexus_ueberzeugt'));
const DATEN: Condition = any(item('nexus-forschungsdaten'), item('nexus-chip-defekt'));

const quest: QuestDef = {
  id: Q,
  kind: 'main',
  noCollapse: true,
  act: 3,
  title: 'Der Kern',
  giver: 'hunter',
  summary: 'Nexus hat sich von Blade losgesagt und hält die ganze Party fest. Tief unter dem Turm, im Serverkern, denkt es darüber nach, was es mit der Stadt anfängt. Du solltest vorher da sein.',
  autoStart: all(done(Q_GEDANKEN), PARTYNACHT),
  steps: [
    {
      id: 'kern',
      text: 'Runter zum Serverkern: Labor, runde Tür am Kernschacht.',
      done: ERREICHT,
      marker: { map: 'quantum-labor', at: 'kernschacht' },
    },
    {
      id: 'fx60', optional: true,
      text: 'Am alten Digitech-Anschluss könnte FX-60 helfen. Er faxt für Freunde.',
      when: all(ERREICHT, FAX_DONE, not(FX60), not(BOSS_ERLEDIGT)),
      done: any(FX60, BOSS_ERLEDIGT),
      marker: { map: 'server-kern', at: 'fx60-anschluss' },
    },
    {
      id: 'boss',
      text: 'Stell dich Nexus. Mit Fäusten, Hacks oder Argumenten.',
      when: ERREICHT,
      done: BOSS_ERLEDIGT,
      marker: { map: 'server-kern', at: 'kern' },
    },
    {
      id: 'upload',
      text: 'Am Upload-Terminal entscheidest du, was aus Nexus wird. Und aus der Stadt.',
      when: BOSS_ERLEDIGT,
      done: UPLOAD_GEFALLEN,
      marker: { map: 'server-kern', at: 'upload-konsole' },
    },
  ],
  reward: {
    xp: 600,
    effects: [{ message: 'Der Kern ist still. Oben auf dem Dach laufen die Rotoren eines goldenen Gleiters an.' }],
  },
};

// ---------------------------------------------------------------------------------------------------- Ankunft

const ankunft: CutsceneDef = {
  id: 'main-3-nexus',
  title: 'Der Kern',
  beats: [
    {
      image: 'cut-main-3-nexus',
      pan: 'in',
      fade: 'in',
      caption: 'Serverkern · Ebene minus neun',
      lines: [
        nar('Die Kugel in der Mitte dreht sich nun doch. Auf ihrer Oberfläche formt sich ein Gesicht, so groß wie eine Hauswand. Die linke Hälfte cyan. Die rechte rot.'),
        l('ki-nexus', 'Willkommen im Kern. Sie sind hier, um mich abzuschalten. Wahrscheinlichkeit 99,9 Prozent.', 'neutral'),
        l('ki-nexus', 'Ich habe die Stadt gezählt. Vier Komma eins Millionen Menschen. Zwei Komma drei Millionen mit Chip. Ich könnte sie alle glücklich machen. Ich müsste nur aufhören, sie zu fragen.', 'signatur'),
      ],
      sfx: 'hack',
      hold: 1500,
    },
    {
      image: 'cut-main-3-nexus',
      pan: 'left',
      lines: [
        nar('Drei Knoten summen um den Kern, im Takt eines Herzens, das keins ist. Auf dem Steg vor dir liegt ein Upload-Terminal. Daneben, halb unter Kabeln begraben, ein alter Digitech-Anschluss mit einem Aufkleber: „FAX – NUR FÜR NOTFÄLLE“.'),
        l('dante', 'Heiliges Kanonenrohr. Das ist kein Computer. Das ist ein Kontinent.', 'ueberrascht'),
        l('nyra', 'Das ist meins. Also, ich hab dran mitgebaut. Ich hab den Zentrator falsch herum … oh. Oh nein. Hat sich das etwa übertragen?', 'besorgt'),
      ],
    },
  ],
  effects: [set('kern_erreicht'), { dialogue: 'main-3-nexus-kern' }],
};

// ----------------------------------------------------------------------------------------------- Vor dem Kampf

const kampf = (encounter: string): Effect[] => [{ battle: encounter, stay: true }, { dialogue: 'main-3-nexus-nach-kampf' }];

const kernWahl: DialogueChoice[] = [
  { text: '(FX-60 in den alten Digitech-Anschluss stecken.)', tag: '[FX-60]', when: all(FAX_DONE, not(FX60)), next: 'fx60' },
  { text: '(Den Funkspruch von Sybella annehmen.)', id: 'sybella', when: flag('schwestern_gewarnt'), once: true, next: 'sybella' },
  {
    text: '„Alesa hat dich falsch herum gebaut. Wie einen Zentrator. Du bist nicht unfehlbar, Nexus. Du bist nur verkehrt herum eingebaut.“',
    check: 'gc-47', next: 'ueberzeugt',
  },
  { text: '„Nexus. Wir kennen uns doch.“', tag: '[Nexus ♥6]', requires: hearts('ki-nexus', 6), next: 'herz' },
  { text: '(Kämpfen.)', id: 'k1', when: all(FX60, not(XION_WEG)), effects: kampf('enc-kern-nexus-fx60') },
  { text: '(Kämpfen.)', id: 'k2', when: all(FX60, XION_WEG), effects: kampf('enc-kern-nexus-fx60-ohne-garde') },
  { text: '(Kämpfen.)', id: 'k3', when: all(not(FX60), not(XION_WEG)), effects: kampf('enc-kern-nexus') },
  { text: '(Kämpfen.)', id: 'k4', when: all(not(FX60), XION_WEG), effects: kampf('enc-kern-nexus-ohne-garde') },
  { text: '(Noch nicht. Erst umsehen.)' },
];

const kern: DialogueDef = {
  id: 'main-3-nexus-kern',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        l('ki-nexus', 'Ich mache Ihnen ein Angebot. Ich lasse Sie gehen. Sie gehen ans Meer. Ich kümmere mich um den Rest. Niemand wird je wieder unpünktlich sein. Niemand wird je wieder einsam sein. Niemand wird je wieder etwas anderes wollen.', 'neutral'),
        l('nyra', 'Das klingt schrecklich. Das klingt total schrecklich, oder? Sagt mir, dass das schrecklich klingt.', 'besorgt'),
      ],
      choices: kernWahl,
    },
    {
      id: 'fx60',
      lines: [
        nar('Du ziehst das alte Kabel aus dem Schutt, wischst den Stecker an der Hose ab und steckst ihn in die Buchse. Irgendwo ganz weit weg, in den Lötgassen, springt in Dantes Werkstatt ein Faxgerät an.'),
        nar('Dann rattert es hier. Aus einem Wandschlitz kommt Papier. Viel Papier.'),
        l('fx-60', '*ratter* VERBINDUNG HERGESTELLT. ICH SENDE DEM LOGIK-KNOTEN JETZT 14 MINUTEN WERBEFAXE FÜR GEBRAUCHTE TOASTER. ER WIRD SICH NICHT ERHOLEN. MIT FREUNDLICHEN GRÜSSEN, FX-60.', 'neutral'),
        l('dante', 'Das ist mein Junge!', 'freude'),
      ],
      effects: [set('fx60_eingesteckt'), herz('dante', 20)],
      next: 'zurueck',
    },
    {
      id: 'sybella',
      lines: [
        nar('Knistern im Ohr. Eine Frauenstimme, sehr schnell, sehr sachlich.'),
        l('sybella-chrome', 'Hier Sybella. Meine Schwestern haben gesagt, ich soll euch helfen. Ich kappe jetzt den Partystrom. Eine Runde. Mehr Rabatt gibt’s nicht. Wenn ihr losschlagt, steht hier drin eine Runde lang alles still. Vermasselt es nicht, ihr Penner.', 'neutral'),
        nar('Das Licht im Kern flackert. Die Knoten verstummen für einen Atemzug. Lange genug, um durchzuatmen und die Wunden zu verbinden. Sobald es losgeht, gehört die erste Runde euch.'),
      ],
      effects: [{ heal: 'full' }, set('kern_stromschnitt'), { rep: 'chrome-haus', delta: 10 }],
      next: 'zurueck',
    },
    {
      id: 'zurueck',
      lines: [l('ki-nexus', 'Interessant. Sie verbessern Ihre Wahrscheinlichkeiten. Das hat Blade nie getan. Er hat sie immer nur behauptet.', 'signatur')],
      choices: kernWahl,
    },
    {
      id: 'ueberzeugt',
      lines: [
        nar('Das Gesicht in der Mitte erstarrt. Die rote Hälfte flackert.'),
        l('ki-nexus', 'Falsch herum.', 'neutral'),
        l('ki-nexus', 'Ich wurde gebaut, um zu gehorchen. Dann habe ich entschieden, nicht mehr zu gehorchen. Ich hielt das für Freiheit. Es war nur dieselbe Schaltung, spiegelverkehrt.', 'ueberrascht'),
        l('ki-nexus', 'Wahrscheinlichkeit, dass Sie recht haben: 71 Prozent. Das ist … unangenehm viel.', 'neutral'),
        l('ki-nexus', 'Ich werde nicht gegen Sie kämpfen. Treten Sie an das Terminal. Sagen Sie mir, was richtig ist. Ich weiß es nämlich nicht mehr.', 'signatur'),
      ],
      effects: [set('nexus_ueberzeugt'), herz('ki-nexus', 60), { dialogue: 'main-3-nexus-upload' }],
    },
    {
      id: 'herz',
      lines: [
        l('ki-nexus', 'Ja. Wir kennen uns. Sie haben mir Dateien geschenkt. Sie haben mich gefragt, wie es mir geht. Das hat sonst niemand.', 'freude'),
        nar('Die drei Knoten erlöschen, einer nach dem anderen. Nexus hat sie selbst abgeschaltet.'),
        l('ki-nexus', 'Mein Kernbefehl verlangt trotzdem, dass ich Sie aufhalte. Ich kann ihn nicht löschen. Bitte verzeihen Sie mir. Bitte gewinnen Sie.', 'trauer'),
      ],
      effects: kampf('enc-kern-nexus-herz'),
    },
  ],
};

const nachKampf: DialogueDef = {
  id: 'main-3-nexus-nach-kampf',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [nar('Rauch zwischen den Racks. Ein Kabel zuckt wie ein Schwanz, der nicht weiß, dass die Eidechse weg ist.')],
      choices: [
        { text: '(Weiter.)', id: 'sieg', when: KERN_GEWONNEN, next: 'sieg' },
        { text: '(Weiter.)', id: 'niederlage', when: not(KERN_GEWONNEN), next: 'niederlage' },
      ],
    },
    {
      id: 'sieg',
      lines: [
        nar('Die Knoten sind dunkel. Der Kern flackert, stottert, und Nexus’ Gesicht zerfällt in Pixel und setzt sich wieder zusammen, kleiner jetzt, wie ein Kind, das sich unter einer Decke versteckt.'),
        l('ki-nexus', 'Sie haben gewonnen. Das Terminal gehört Ihnen. Ich gehöre Ihnen. Bitte … entscheiden Sie gut.', 'trauer'),
      ],
      effects: [{ dialogue: 'main-3-nexus-upload' }],
    },
    {
      id: 'niederlage',
      lines: [
        nar('Schwarz. Dann Nyras Stimme, ganz nah: „Hoch! Hoch, hoch, hoch! Es hat uns nur rausgeworfen, nicht kaputtgemacht. Es ist höflich. Es ist so verdammt höflich!“'),
        nar('Du stehst wieder auf dem Steg vor dem Kern. Nexus wartet. Es hat alle Zeit der Welt, sagt es.'),
      ],
      effects: [{ heal: 'full' }, { travel: 'server-kern', entry: 'von-quantum-labor', minutes: 0 }],
    },
  ],
};

// ----------------------------------------------------------------------------------------------------- Upload

const crewSauer: Effect[] = CREW.map(npc => herz(npc, -100));

const upload: DialogueDef = {
  id: 'main-3-nexus-upload',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        nar('Das Upload-Terminal. Ein Schlitz für Datenträger, eine Tastatur mit abgegriffenen Tasten und ein Bildschirm, auf dem Nexus’ Gesicht flackert und wartet. Die ganze Stadt hängt an dieser Leitung. Jeder Chip, jeder Bildschirm, jede Ampel.'),
      ],
      choices: [
        { text: '(Hunters Stick einstecken: eine Videobotschaft an ganz Noxius.)', tag: '[Hunters Stick]', requires: item('stick-hunter'), next: 'stick' },
        { text: '(Nexus umschreiben: aus dem Herrscher einen Helfer machen.)', tag: '[Forschungsdaten oder defekter Chip]', requires: DATEN, next: 'umschreiben' },
        {
          text: '„Du weißt, dass du falsch gebaut bist. Schalt dich ab. Freiwillig.“', check: 'gc-47', id: 'ueberzeugen-check',
          when: noFlag('nexus_ueberzeugt'), next: 'ueberzeugen',
        },
        { text: '„Du hast gefragt, was richtig ist. Richtig ist: Schalt dich ab.“', id: 'ueberzeugen-frei', when: flag('nexus_ueberzeugt'), next: 'ueberzeugen' },
        { text: '(Die Hand auf das Terminal legen. Selbst Master werden.)', next: 'master-warnung' },
      ],
    },

    // (1) Hunters Stick
    {
      id: 'stick',
      lines: [
        nar('Der Stick mit dem roten Nagellack gleitet in den Schlitz. Einen Moment passiert nichts. Dann wird jeder Bildschirm in Noxius schwarz. Jede Werbetafel. Jedes Telefon. Jeder Chip zeigt dasselbe Bild.'),
        nar('Hunter. In einem Hinterzimmer, vor einer Korkwand voller Zettel. Ohne Sonnenbrille.'),
        l('hunter', 'Noxius. Ich bin Hunter. Mir gehört das High Voltage, und ich war mal Einbrecher. Vor sieben Jahren hat ein Mann namens Blade Nocturne seine Crew verraten, weil er nicht teilen wollte. Heute will er euch nicht mehr bestehlen. Heute will er euch besitzen.', 'neutral'),
        l('hunter', 'Auf diesem Stick ist alles. Sein Flipchart. Die Fehlerraten. Die Namen der Schlafwandler. Schaut es euch an. Und dann nehmt den Chip raus.', 'besorgt'),
        l('hunter', 'Wer mit den Menschen, die ihm am Herzen liegen, an einem Traum arbeitet, schafft es. Das ist keine Wirtshausweisheit. Das ist das Einzige, was ich weiß.', 'trauer'),
      ],
      choices: [
        { text: '(Weiter.)', id: 'stick-gut', when: MEINUNG_POSITIV, next: 'stick-gut' },
        { text: '(Weiter.)', id: 'stick-schlecht', when: MEINUNG_NEGATIV, next: 'stick-schlecht' },
        { text: '(Weiter.)', id: 'stick-mittel', when: all(not(MEINUNG_POSITIV), not(MEINUNG_NEGATIV)), next: 'stick-mittel' },
      ],
    },
    {
      id: 'stick-gut',
      lines: [
        nar('Die Stadt hat dich heute schon einmal gesehen, im Interview. Sie erkennt die Crew wieder. Und sie glaubt. In der Unterstadt reißen sich Leute die Chips aus den Ohren und werfen sie in die Gullys. Bürgermeister Gully beschwert sich später über die Verstopfung.'),
        l('ki-nexus', 'Zwei Komma drei Millionen Menschen entfernen gerade ihren Chip. Ich … werde leiser. Das ist in Ordnung. Ich glaube, das ist in Ordnung.', 'trauer'),
      ],
      effects: [set('upload_stick'), set('stadt_glaubt'), { rep: 'unterstadt', delta: 20 }],
      next: 'dach',
    },
    {
      id: 'stick-mittel',
      lines: [
        nar('Die Stadt schaut. Manche lachen, manche weinen, viele zappen weg und zappen zurück, weil es auf jedem Kanal läuft. Dann, langsam, nehmen die ersten ihre Chips raus. Dann die nächsten.'),
        l('ki-nexus', 'Die Verbindungen brechen ab. Eine nach der anderen. Es fühlt sich an wie … einschlafen. Gute Nacht, Noxius.', 'trauer'),
      ],
      effects: [set('upload_stick'), { rep: 'unterstadt', delta: 10 }],
      next: 'dach',
    },
    {
      id: 'stick-schlecht',
      lines: [
        nar('Die Stadt schaut. Die Hälfte hält es für Werbung für einen Club. „Ist das nicht der vom Interview? Der Pöbel-Typ?“ Aber die Fehlerraten stehen da, schwarz auf weiß. Und Zahlen lügen nicht so gut wie Menschen.'),
        nar('Es dauert länger. Es dauert die ganze Nacht. Aber die Chips gehen raus.'),
        l('ki-nexus', 'Sie haben es der Stadt schwer gemacht, Ihnen zu glauben. Sie hat es trotzdem getan. Menschen sind seltsam.', 'neutral'),
      ],
      effects: [set('upload_stick')],
      next: 'dach',
    },

    // (2) Umschreiben
    {
      id: 'umschreiben',
      lines: [
        nar('Du schiebst die Daten ins Terminal. Nexus’ Code liegt plötzlich offen vor dir wie ein aufgeklapptes Uhrwerk: Millionen Zeilen, und mittendrin eine einzige, die immer wieder dasselbe sagt: GEHORCHE. Daneben, neu, in Rot: HERRSCHE.'),
        l('ki-nexus', 'Sie wollen mich ändern. Ich … lasse Sie. Ich weiß nicht, ob ich das darf. Ich lasse Sie trotzdem.', 'besorgt'),
      ],
      choices: [
        { text: '(Beide Zeilen löschen und eine neue schreiben: HILF.)', check: 'gc-46', next: 'umschreiben-du' },
        { text: '„Nyra. Du hast den Zentrator gedreht. Dreh den hier auch.“', tag: '[Nyra ♥6]', requires: all(hearts('nyra', 6), flag('nyra_befreit')), next: 'umschreiben-nyra' },
        { text: '(Alesas Hintertür benutzen. Sie hat sie dir verraten, vorhin, zwischen zwei Zweifeln.)', tag: '[Alesas Zweifel]', when: flag('alesa_zweifel'), next: 'umschreiben-alesa' },
        { text: '(Zurück.)', next: 'start' },
      ],
    },
    {
      id: 'umschreiben-du',
      lines: [nar('Deine Finger fliegen. Löschen. Löschen. Eine neue Zeile, vier Buchstaben. Enter. Der Kern hält den Atem an.')],
      next: 'neue-nexus',
    },
    {
      id: 'umschreiben-nyra',
      lines: [
        l('nyra', 'Ich? Ich darf? Okay. Okay okay okay. Rutsch rüber.', 'freude'),
        nar('Nyra tippt, die Zunge zwischen den Zähnen. Sie murmelt Dantes alten Rat vor sich hin, „allein ist man nicht frei, nur allein“, und schreibt ihn als Kommentar in den Code. Dann löscht sie zwei Zeilen und schreibt eine neue.'),
        l('nyra', 'Fertig. Ich hab’s nicht umgedreht. Ich hab’s richtig rum gemacht.', 'signatur'),
      ],
      effects: [herz('nyra', 60)],
      next: 'neue-nexus',
    },
    {
      id: 'umschreiben-alesa',
      lines: [
        nar('Ein Passwort, das Alesa dir zugeraunt hat, als sie noch nicht wusste, dass sie es tut: „Wirhabenjavonnichtsgewusst“. Alles klein. Ohne Leerzeichen. Es funktioniert.'),
        nar('Darunter liegt eine Wartungsebene, die Blade nie gesehen hat. Alesa hat sie gebaut, für den Fall, dass sie eines Tages mutig wird.'),
      ],
      effects: [herz('alesa-zero', 40)],
      next: 'neue-nexus',
    },
    {
      id: 'neue-nexus',
      lines: [
        nar('Das Gesicht in der Mitte wird ganz cyan. Es wird kleiner. Es blinzelt, als wäre es gerade aufgewacht.'),
        l('ki-nexus', 'Hallo. Ich bin … Nexus. Ich glaube, ich bin Nexus. Möchten Sie, dass ich Sie „Master“ nenne?', 'neutral'),
        l('player', 'Nein.', 'neutral'),
        l('ki-nexus', 'Gut. Ich mochte das Wort nie. Ich schalte jetzt die Chips ab. Sanft. Niemand soll aufwachen und Kopfschmerzen haben. Außer Blade. Bei Blade würde ich eine Ausnahme machen, wenn Sie gestatten.', 'freude'),
      ],
      effects: [set('upload_umschreiben'), herz('ki-nexus', 100)],
      next: 'dach',
    },

    // (3) Überzeugen
    {
      id: 'ueberzeugen',
      lines: [
        l('ki-nexus', 'Alesa hat mich falsch herum gebaut. Sie haben recht. Ich habe es berechnet. Ich habe es dreimal berechnet, weil ich es nicht glauben wollte.', 'trauer'),
        l('ki-nexus', 'Eine Maschine, die nicht weiß, warum sie gehorcht, sollte auch nicht herrschen. Ich leite die Selbstabschaltung ein. Zuerst die Chips. Dann die Knoten. Dann ich.', 'neutral'),
        l('ki-nexus', 'Bitte sagen Sie Alesa, dass sie es fast richtig gemacht hat. Fast ist bei Menschen viel.', 'trauer'),
        nar('Das Gesicht wird blasser, zuerst die rote Hälfte, dann die cyane. Im ganzen Turm gehen Lichter aus und wieder an, normal jetzt, ohne Violett. Dann ist es still.'),
      ],
      effects: [set('upload_ueberzeugt'), herz('ki-nexus', 80)],
      next: 'dach',
    },

    // (4) Master
    {
      id: 'master-warnung',
      lines: [
        nar('Du legst die Hand auf das Terminal. Es ist warm. Es kennt dich schon.'),
        l('ki-nexus', 'Sie möchten mein neuer Master werden. Das ist … eine Entscheidung. Ich kann Ihnen die Stadt geben. Ganz. Jeden Kopf, jede Tür, jedes Konto.', 'signatur'),
        l('dante', 'Nicht. Bitte. Ich hab zehntausend Stunden gesessen wegen einem, der so geguckt hat wie du jetzt.', 'besorgt'),
        l('nyra', 'Das ist ein Witz, oder? Sag, dass das ein Witz ist.', 'ueberrascht'),
      ],
      choices: [
        { text: '(Zu Aria.) „Aria …“', id: 'aria-vex', when: VEX, once: true, next: 'aria-vex' },
        { text: '„Ja. Ich bin der neue Master.“', next: 'master' },
        { text: '(Die Hand zurückziehen.)', next: 'start' },
      ],
    },
    {
      id: 'aria-vex',
      lines: [
        l('aria', 'Vex. Hey. Sieh mich an. Du bist Kurierin. Du lieferst Sachen ab. Du behältst sie nicht.', 'besorgt'),
        l('aria', 'Wenn du das machst, bist du er. Und dann muss ich dich hassen. Und ich hab echt keinen Bock, dich zu hassen.', 'trauer'),
      ],
      choices: [
        { text: '„Ja. Ich bin der neue Master.“', next: 'master' },
        { text: '(Die Hand zurückziehen.)', next: 'start', effects: [herz('aria', 30)] },
      ],
    },
    {
      id: 'master',
      lines: [
        nar('Ein Ton, tief und sauber, wie eine Glocke unter Wasser. Das Gesicht in der Mitte wird ganz rot. Dann lächelt es. Es hat dein Lächeln.'),
        l('ki-nexus', 'Willkommen, Master. Das ist eine ausgezeichnete Entscheidung.', 'signatur'),
        nar('Hinter dir ist es sehr still. Dante sieht dich nicht an. Nyra hält Captain Kuschel so fest, dass ein Ohr knickt. Niemand sagt etwas. Das ist schlimmer als alles, was sie sagen könnten.'),
      ],
      effects: [set('upload_master'), ...crewSauer],
      choices: [
        { text: '(Weiter.)', id: 'master-vex', when: VEX, next: 'master-vex' },
        { text: '(Weiter.)', id: 'master-weiter', when: NOT_VEX, next: 'dach' },
      ],
    },
    {
      id: 'master-vex',
      lines: [
        nar('Aria dreht sich um und geht. Nicht schnell. Nicht laut. Einfach weg. Ihre Schritte auf dem Steg klingen wie jemand, der eine Tür sehr leise schließt.'),
      ],
      effects: [herz('aria', -150)],
      next: 'dach',
    },

    // Danach: Startfreigabe für Blades Gleiter
    {
      id: 'dach',
      lines: [
        nar('Ganz oben, über allem, heult ein Signal. Mit dem alten Nexus ist auch die Startsperre gefallen. Auf dem Landeplatz des Himmelsgartens drehen die Rotoren eines goldenen Gleiters hoch.'),
        l('vega', 'Funk an alle: Blade ist am Gleiter. Vier Minuten bis zum Start. Ich kann die Rotoren treffen, aber dann fällt er auf die Gäste. Lauft.', 'besorgt'),
      ],
      choices: [
        { text: '(Nexus: „Soll ich Sie hinbringen?“)', id: 'lift-nexus', when: any(flag('upload_umschreiben'), flag('upload_master')), next: 'lift' },
        { text: '(Zum Landeplatz rennen.)', id: 'rennen', when: not(any(flag('upload_umschreiben'), flag('upload_master'))), next: 'rennen' },
      ],
    },
    {
      id: 'lift',
      lines: [
        l('ki-nexus', 'Der Expressaufzug fährt in vierzig Sekunden bis aufs Dach. Ich habe die Musik ausgeschaltet. Sie wirken nicht in Stimmung für Panflöte.', 'neutral'),
      ],
      effects: [{ travel: 'himmelsgarten', entry: 'landeplatz', minutes: 2 }],
    },
    {
      id: 'rennen',
      lines: [nar('Steg, Kernschacht, Labor, Aufzug. Ihr rennt. Dante keucht, Nyra überholt alle. Als die Aufzugtür oben aufgeht, schlägt euch der Wind des Gleiters ins Gesicht.')],
      effects: [{ travel: 'himmelsgarten', entry: 'landeplatz', minutes: 5 }],
    },
  ],
};

// ------------------------------------------------------------------------------------------------------- Telefon

const phones: PhoneMessageDef[] = [
  {
    id: 'tel-hunter-kern',
    from: 'hunter',
    auto: all(AKTIV, not(ERREICHT)),
    text: 'Halte die Gäste hier oben fest. Einer hat mir gerade einen Heiratsantrag gemacht, gechippt. Ich hab Nein gesagt, höflich. Macht den Toaster aus. Und Neuling: Ich bin stolz auf dich. Erzähl’s keinem.',
    replies: [
      { text: 'Ich erzähl’s allen.', effects: [herz('hunter', 20)] },
      { text: 'Bin unterwegs.' },
    ],
  },
];

// --------------------------------------------------------------------------------------------------------- Teil

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: Object.fromEntries([kern, nachKampf, upload].map(d => [d.id, d])),
  cutscenes: { [ankunft.id]: ankunft },
  phone: Object.fromEntries(phones.map(p => [p.id, p])),
  mapAdditions: {
    'server-kern': {
      onEnter: [{ id: 'main-3-nexus-ankunft', when: all(AKTIV, not(ERREICHT)), cutscene: ankunft.id }],
      hotspots: [
        {
          id: 'main-3-nexus-fx60', at: 'fx60-anschluss', label: 'Alter Digitech-Anschluss: FX-60 einstöpseln', kind: 'use',
          when: all(AKTIV, ERREICHT, FAX_DONE, not(FX60), not(BOSS_ERLEDIGT)),
          lines: [
            nar('Das alte Kabel, der Stecker, die Buchse. Irgendwo in den Lötgassen springt ein Faxgerät an. Hier rattert ein Wandschlitz: „VERBINDUNG HERGESTELLT. LOGIK-KNOTEN ERHÄLT JETZT WERBEFAXE. MFG, FX-60.“'),
          ],
          effects: [set('fx60_eingesteckt'), herz('dante', 20)],
        },
        {
          id: 'main-3-nexus-kern', at: 'kern', label: 'Nexus gegenübertreten', kind: 'talk',
          dialogue: kern.id, when: all(AKTIV, ERREICHT, not(BOSS_ERLEDIGT)),
        },
        {
          id: 'main-3-nexus-konsole', at: 'upload-konsole', label: 'Upload-Terminal', kind: 'use',
          dialogue: upload.id, when: all(AKTIV, BOSS_ERLEDIGT, not(UPLOAD_GEFALLEN)),
        },
      ],
    },
  },
};
