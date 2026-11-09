// Kanal-Sammler (world.md §3.5, §3.8/§3.9, §6.2 Nr. 14/27/30, §8.7, §10.4/§10.7; Plan design/plan/act1.json,
// Paket pkg-kanal-sammler). Zone 1536×1024, gemalte Draufsicht (bg-kanal-sammler).
// Aufbau: Waagerecht durch die Mitte der Hauptkanal (nicht begehbar) mit zwei Stegen. Oben der Laufsteg Nord:
// Leiter zu den Lötgassen (links oben), Trockendock des Kanalvolks (Generator, Bett, Gullys Rathaus-Zelt,
// Kanalbrett), drei Schnellweg-Gitter mit Ventilen, Rippers Lager, Schott (rechts oben), Tunnel Ost (rechter Rand).
// Links der große Rechen mit dem Versteck dahinter. Unten der Laufsteg Süd: Kanalvolk-Garten (links unten),
// Fluss-Friedas Floßladen mit Anleger, Gang zum Rohrschacht (Rohrsiedlung), Ausschuss-Stelle (nur von oben über
// das Geländer), Thronsaal aus Kronkorken (rechts unten). Legt den Bezirk `kanalisation` an.
// Quest-Hotspots setzen sprechende Flags (design/plan/gaps/maps-kanal-sammler.md); die Quest-Agenten werten sie aus.
import type { CheckDef, Condition, DialogueDef, MapDef, Point, Polygon, Rect } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const N = 'narrator';
const P = 'player';
const box = ([x, y, w, h]: Rect): Polygon => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];

/** Benannte Punkte (Plan-IDs, exakt wie in act1.json). */
const S = {
  trockendock: [560, 285],
  'gullys-rathaus': [700, 272],
  'trockendock-bett': [470, 272],
  notgenerator: [320, 275],
  'kabelweg-ende': [240, 272],
  'friedas-stand': [578, 704],
  rechen: [205, 300],
  'rechen-versteck': [118, 300],
  'kanalvolk-garten': [250, 885],
  thronsaal: [1300, 860],
  'thronsaal-grenze': [1100, 600],
  'rattennest-1': [262, 556],
  'rattennest-2': [1133, 420],
  'rattennest-3': [1098, 668],
  'rippers-lager': [1300, 262],
  'ausschuss-stelle': [860, 578],
  'ventil-stelle': [1010, 265],
  'floss-anleger': [605, 735],
  'graf-gully-thron': [1380, 560],
  'magnetangel-stelle': [780, 540],
  kanalbrett: [795, 272],
  'fluchtweg-tuer': [1478, 556],
} satisfies Record<string, Point>;

// --- Bedingungen ---------------------------------------------------------------------------------------------------
const RK_AKTIV: Condition = { quest: 'side-rattenkoenig', state: 'active' };
const RK_DONE: Condition = { quest: 'side-rattenkoenig', state: 'done' };
/** Nagbert sitzt noch auf dem Thron (weder besiegt noch umgesiedelt, verliebt oder weggelockt). */
const NAGBERT_OFFEN: Condition = { all: [RK_AKTIV, { notFlag: 'nagbert_geloest' }, { not: { won: 'enc-kanal-nagbert' } }] };
const NAGBERT_WEG: Condition = { any: [RK_DONE, { flag: 'nagbert_geloest' }, { won: 'enc-kanal-nagbert' }] };
const STROM_AKTIV: Condition = { quest: 'side-strom-fuer-die-rohre', state: 'active' };
const STROM_DONE: Condition = { quest: 'side-strom-fuer-die-rohre', state: 'done' };
const RECHEN_AKTIV: Condition = { quest: 'side-rettung-am-rechen', state: 'active' };
/** prep-fluchtweg (quest-main-b): offen, solange der Rückweg nicht gesichert ist. */
const FLUCHT_OFFEN: Condition = { all: [{ quest: 'prep-fluchtweg', state: 'active' }, { notFlag: 'fluchtweg_gesichert' }] };
const LIMO_AKTIV: Condition = { quest: 'side-neon-limo', state: 'active' };
const KUSCHEL: Condition = { any: [{ item: 'captain-kuschel' }, { all: [{ companion: 'nyra' }, { flag: 'nyra_hat_kuschel' }] }] };
const BRETT_OFFEN: Condition = { rep: 'kanalvolk', min: 10 };
const AKT1: Condition = { not: { act: 2 } };
const AKT2: Condition = { all: [{ act: 2 }, { not: { act: 3 } }] };

// --- Eingebettete Welt-Checks (world.md nennt keine gc-ID) ----------------------------------------------------------
const seilwinde: CheckDef = {
  id: 'kanal-seilwinde', attribute: 'technik', threshold: 4, tags: ['maschine', 'reparieren', 'welt'], label: '[Technik 4]',
};
const wache1Schleichen: CheckDef = {
  id: 'kanal-rattenwache-1-schleichen', attribute: 'reflexe', threshold: 4, tags: ['schleichen', 'welt'], label: '[Reflexe 4]',
};
const wache2Ventil: CheckDef = {
  id: 'kanal-rattenwache-2-ventil', attribute: 'technik', threshold: 5, tags: ['maschine', 'welt'], label: '[Technik 5]',
};
const wache3Bluff: CheckDef = {
  id: 'kanal-rattenwache-3-bluff', attribute: 'ausstrahlung', threshold: 5, tags: ['einschuechtern', 'bluff'], label: '[Ausstrahlung 5]',
};

// --- Dialoge der Zone -----------------------------------------------------------------------------------------------
const dialogues: Record<string, DialogueDef> = {
  'kanal-sammler-ankunft': {
    id: 'kanal-sammler-ankunft',
    start: 'start',
    nodes: [{
      id: 'start',
      lines: [
        { speaker: N, text: 'Der Kanal-Sammler. Ein Gewölbe so groß wie eine Kathedrale – nur dass hier keiner betet, sondern alle hoffen, dass der Wasserstand hält.' },
        { speaker: N, text: 'Leuchtpilze, Lichterketten, ein Trockendock voller Hängematten. Und ein Geruch, der dich am Kragen packt und dir ins Gesicht atmet.' },
        { speaker: P, text: 'Okay. Durch den Mund atmen. Nur durch den Mund. Scheiße, jetzt schmeck ich’s.' },
      ],
    }],
  },

  'kanal-thronsaal-tor': {
    id: 'kanal-thronsaal-tor',
    start: 'start',
    nodes: [
      {
        id: 'start',
        lines: [{ speaker: N, text: 'Ein Tor aus Paletten, Fahrradschläuchen und sehr viel Selbstbewusstsein. Dahinter der Thronsaal. Es riecht nach Käse, Altöl und Monarchie.' }],
        choices: [
          { text: 'Nagbert loswerden – aber wie?', when: NAGBERT_OFFEN, next: 'plan' },
          { text: 'Den leeren Thron bewundern.', when: NAGBERT_WEG, next: 'leer' },
          { text: 'Durchs Tor linsen.', when: { not: { any: [RK_AKTIV, NAGBERT_WEG] } }, next: 'linsen' },
          { text: 'Gehen.' },
        ],
      },
      {
        id: 'plan',
        lines: [
          { speaker: N, text: 'Hinten auf dem Kronkorken-Thron hockt Nagbert der Rohrkönig: Ratte im Kühlschrankformat, Krone schief, Blick wie ein Steuerprüfer. Er kaut an einem Getriebe und furzt dabei königlich.' },
          { speaker: N, text: 'Du kannst reinmarschieren und ihm eine aufs Maul geben. Oder du bist schlauer als ein Nagetier. Theoretisch.' },
        ],
        choices: [
          {
            text: 'Lebendfalle bauen, Käseecke als Köder.', check: 'gc-73', requires: { item: 'kaeseecke' }, next: 'falle',
            effects: [{ take: 'kaeseecke' }, { setFlag: 'nagbert_umgesiedelt' }, { setFlag: 'nagbert_geloest' }],
          },
          {
            text: 'Captain Kuschel vorschicken.', tag: '[Captain Kuschel]', when: KUSCHEL, next: 'kuschel',
            effects: [{ setFlag: 'nagbert_verliebt' }, { setFlag: 'nagbert_geloest' }],
          },
          {
            text: 'Röstzwiebeln streuen. Kein Nagetier der Welt widersteht Röstzwiebeln.', tag: '[Gosse]', when: { origin: 'origin-gossenkind' },
            requires: { item: 'roestzwiebeln' }, next: 'zwiebeln',
            effects: [{ take: 'roestzwiebeln' }, { setFlag: 'nagbert_weggelockt' }, { setFlag: 'nagbert_geloest' }],
          },
          { text: 'Scheiß drauf. Tor auf, Tyrann runter vom Thron.', next: 'kampf' },
          { text: 'Erst mal vorbereiten.' },
        ],
      },
      {
        id: 'kampf',
        lines: [{ speaker: N, text: 'Du trittst das Tor auf. Nagbert hebt den Kopf. In den Rinnen gehen hundert kleine rote Augen an.' }],
        effects: [{ battle: 'enc-kanal-nagbert' }],
      },
      {
        id: 'falle',
        lines: [
          { speaker: N, text: 'Draht, ein Eimer, die Feder aus einem Toaster und die Käseecke als Köder. Nagbert schnüffelt, zögert, denkt an seine Würde – und hüpft rein. Klack.' },
          { speaker: N, text: 'Er quiekt empört, aber nicht gefährlich. Das Kanalvolk trägt ihn in feierlicher Prozession zur Brackbucht. Dort gibt es viel Schlick und keine Steuern.' },
          { speaker: P, text: 'Lang lebe der Ex-König. Woanders.' },
        ],
      },
      {
        id: 'kuschel',
        lines: [
          { speaker: N, text: 'Du setzt Captain Kuschel vors Tor. Er hoppelt rein, setzt sich vor den Thron und guckt. Einfach nur guckt.' },
          { speaker: N, text: 'Nagbert lässt das Getriebe fallen. Das Fell sträubt sich. Dann wird er weich. Ein Rattenkönig hat sich verknallt, und zwar hoffnungslos.' },
          { speaker: N, text: 'Gegen das Versprechen einer Kopie von Captain Kuschel – Oma Volt strickt, du zahlst die Wolle – räumt er den Thron. Liebe macht dumm. Und kompromissbereit.' },
          { speaker: P, text: 'Kuschel, du alter Herzensbrecher.' },
        ],
      },
      {
        id: 'zwiebeln',
        lines: [
          { speaker: N, text: 'Du reißt die Tüte auf und streust eine Spur über den Steg bis in den Überlauf. Der Duft: Kirmes, Imbissbude, Sünde.' },
          { speaker: N, text: 'Erst kommt eine Ratte. Dann zehn. Dann die ganze verdammte Horde, Nagbert vorneweg, Krone auf halb acht. Sie folgen der Spur bis raus in die Brackbucht.' },
          { speaker: P, text: 'Gossenwissen schlägt Waffengewalt. Steht so in keinem Buch.' },
        ],
      },
      {
        id: 'leer',
        lines: [{ speaker: N, text: 'Der Thron steht leer. Jemand vom Kanalvolk hat ein Pappschild drangelehnt: „Museum. Eintritt: ein Kronkorken.“ Daneben eine Dose. Sie ist voll.' }],
      },
      {
        id: 'linsen',
        lines: [
          { speaker: N, text: 'Ganz hinten glitzert ein Thron aus Kronkorken. Davor angenagte Zahnräder, zerbissene Kabel, ein halbes Fahrrad. Hier frisst jemand Ersatzteile – im großen Stil.' },
          { speaker: N, text: 'Frag mal Bürgermeister Gully. Der hat dazu bestimmt eine Meinung. Und eine Rede. Mit Fußnoten.' },
        ],
      },
    ],
  },

  'kanal-rechen': {
    id: 'kanal-rechen',
    start: 'start',
    nodes: [
      {
        id: 'start',
        lines: [{ speaker: N, text: 'Der große Rechen: ein Eisengitter quer durch den Kanal. Was die Stadt wegspült, bleibt hier hängen. Reifen, Flaschen, eine Gummiente mit Kampfgeist.' }],
        choices: [
          { text: 'Da hängt jemand fest!', when: { all: [RECHEN_AKTIV, { notFlag: 'rechen_geborgen' }] }, next: 'notfall' },
          { text: 'Im Treibgut stochern.', next: 'stochern' },
          { text: 'Weiter.' },
        ],
      },
      {
        id: 'notfall',
        lines: [
          { speaker: N, text: 'Zwischen Reifen und Plastik zappelt ein Kanalvolk-Kind, die Hosenträger im Gitter verhakt. Das Wasser drückt. Das Kind flucht wie ein Hafenarbeiter. Respekt.' },
          { speaker: N, text: '„Glotz nicht so blöd, hol mich hier raus, du Pfeife!“' },
        ],
        choices: [
          { text: 'Das Gitter aufstemmen und halten, bis es rausrutscht.', check: 'gc-125', next: 'koerper', effects: [{ setFlag: 'rechen_geborgen' }] },
          { text: 'Die verrostete Seilwinde flicken und das Kind rauskurbeln.', check: seilwinde, next: 'winde', effects: [{ setFlag: 'rechen_geborgen' }] },
          { text: 'Bolzen, apport!', tag: '[Bolzen]', when: { companion: 'bolzen' }, next: 'bolzen', effects: [{ setFlag: 'rechen_geborgen' }] },
          { text: 'Ein Floß schnappen und rüberstaken.', next: 'floss' },
          { text: 'Halt durch, ich hol was!' },
        ],
      },
      {
        id: 'koerper',
        lines: [{ speaker: N, text: 'Du packst zwei Stäbe und ziehst. Das Gitter ächzt, du ächzt lauter. Das Kind rutscht frei, spuckt Kanalwasser und sagt: „Hat ja ewig gedauert.“' }],
      },
      {
        id: 'winde',
        lines: [{ speaker: N, text: 'Ein Splint, ein Stück Draht, sehr viel Fluchen. Die Winde rattert los, und das Kind schwebt am Haken raus wie ein extrem wütendes Paket.' }],
      },
      {
        id: 'bolzen',
        lines: [{ speaker: N, text: 'Bolzen springt, schnappt die Hosenträger und zieht. Das Kind landet auf dem Steg und gibt Bolzen einen Kuss auf die Schnauze. Du kriegst nur einen nassen Ärmel.' }],
      },
      {
        id: 'floss',
        lines: [{ speaker: N, text: 'Ein Floß aus Kanistern, eine Stange, null Gleichgewicht. Los geht’s.' }],
        effects: [{
          minigame: 'akt-floss', level: 2, key: 'kanal-rechen-rettung', label: 'Floßfahrt zum Rechen',
          win: [{ setFlag: 'rechen_geborgen' }, { message: 'Kind geborgen. Es beißt dich zum Dank in den Daumen. Liebevoll.' }],
          lose: [{ damage: 3 }, { message: 'Umgekippt. Das Kind lacht sich am Rechen schlapp. Nochmal.' }],
        }],
      },
      {
        id: 'stochern',
        lines: [
          { speaker: N, text: 'Du stocherst. Du findest: einen Schuh (links), eine Zahnbürste (benutzt), ein Foto von jemandem, der sehr glücklich mit einem Kühlschrank posiert.' },
          { speaker: N, text: 'Nichts davon willst du anfassen. Unten am Rechen dümpeln allerdings ein paar Flaschen, die nach mehr aussehen.' },
        ],
      },
    ],
  },

  'kanal-rechen-versteck': {
    id: 'kanal-rechen-versteck',
    start: 'start',
    nodes: [
      {
        id: 'start',
        lines: [
          { speaker: N, text: 'Hinter dem Rechen klafft eine trockene Nische. Davor schießt der Kanal über die Rechenkante, hüfthoch und mit dem Selbstbewusstsein eines Besoffenen um vier Uhr früh.' },
          { speaker: N, text: 'In der Nische blinkt etwas Rotes. Datenwürfel-Rot. Oder ein Rattenauge. Fifty-fifty.' },
          { speaker: N, text: 'Oben am Trockendock quietschen die Ventile. Wer die richtig dreht, kriegt hier vermutlich trockene Füße.' },
        ],
        choices: [
          { text: 'Gegen die Strömung rüberwaten.', check: 'gc-147', next: 'waten', effects: [{ setFlag: 'kanal_versteck_erreicht' }] },
          {
            text: 'Das Wasser steht niedriger – jetzt rüber, bevor es sich’s anders überlegt.', when: { flag: 'kanal_ventil_gedrosselt' },
            next: 'niedrig', effects: [{ setFlag: 'kanal_versteck_erreicht' }],
          },
          { text: 'Ein Floß leihen. Also, nehmen. Und rüberstaken.', next: 'floss' },
          { text: 'Nö. Ich hab nur die eine Hose.' },
        ],
      },
      {
        id: 'waten',
        lines: [{ speaker: N, text: 'Du stemmst dich gegen die Brühe. Die Brühe stemmt zurück. Du gewinnst – knapp, nass bis zum Bauchnabel und um eine Erfahrung reicher, die kein Mensch braucht.' }],
      },
      {
        id: 'niedrig',
        lines: [{ speaker: N, text: 'Das Wasser plätschert nur noch knöcheltief über die Kante. Du spazierst rüber wie eine Touristin im Freibad.' }],
      },
      {
        id: 'floss',
        lines: [{ speaker: N, text: 'Gegen die Strömung staken. Was soll schon schiefgehen.' }],
        effects: [{
          minigame: 'akt-floss', level: 3, key: 'kanal-rechen-versteck', label: 'Floßfahrt zum Rechen-Versteck',
          win: [{ setFlag: 'kanal_versteck_erreicht' }, { message: 'Du legst an der Nische an. Trocken. Fast.' }],
          lose: [{ damage: 3 }, { message: 'Die Strömung spuckt dich samt Floß an den Steg zurück. Der Kanal: 1, du: 0.' }],
        }],
      },
    ],
  },

  'kanal-notgenerator': {
    id: 'kanal-notgenerator',
    start: 'start',
    nodes: [
      {
        id: 'start',
        lines: [{ speaker: N, text: 'Der Notgenerator des Trockendocks. Vor zwanzig Jahren gelb lackiert, heute rostrot mit gelben Erinnerungen.' }],
        choices: [
          {
            text: 'Zündung, Kabelbaum, ein beherzter Tritt. Reparieren.', check: 'gc-119',
            when: { all: [STROM_AKTIV, { notFlag: 'kanal_generator_laeuft' }] }, next: 'repariert',
            effects: [{ setFlag: 'kanal_generator_laeuft' }],
          },
          {
            text: 'Drei Ersatzteile reinstopfen und das Kanalvolk den Rest machen lassen.',
            when: { all: [STROM_AKTIV, { notFlag: 'kanal_generator_laeuft' }, { notFlag: 'kanal_generator_teile' }] },
            requires: { item: 'schrott-ersatzteil', min: 3 }, next: 'teile',
            effects: [{ take: 'schrott-ersatzteil', qty: 3 }, { setFlag: 'kanal_generator_teile' }],
          },
          { text: 'Dem Ding beim Brummen zuhören.', when: { flag: 'kanal_generator_laeuft' }, next: 'brummt' },
          { text: 'Mal dran rumschrauben?', when: { all: [{ not: STROM_AKTIV }, { notFlag: 'kanal_generator_laeuft' }] }, next: 'ohne-auftrag' },
          { text: 'Lass gut sein.' },
        ],
      },
      {
        id: 'repariert',
        lines: [
          { speaker: N, text: 'Der Generator hustet, spuckt, furzt eine schwarze Wolke – und läuft. Ringsum zucken die Leuchtpilze, als hätte jemand den Club aufgesperrt.' },
          { speaker: P, text: 'Wer braucht schon ein Diplom.' },
        ],
      },
      {
        id: 'teile',
        lines: [{ speaker: N, text: 'Ein Kanalvolk-Typ mit drei Stirnlampen nimmt die Teile, nickt feierlich und sagt: „Morgen läuft er. Oder übermorgen. Oder er explodiert. Morgen, wahrscheinlich.“' }],
      },
      {
        id: 'brummt',
        lines: [{ speaker: N, text: 'Er brummt. Gleichmäßig, fast meditativ. Du merkst, dass du seit einer Minute mitsummst. In Dur.' }],
      },
      {
        id: 'ohne-auftrag',
        lines: [{ speaker: N, text: 'Ohne Ersatzteile und ohne dass dich wer drum bittet? Du bist doch nicht bescheuert. Frag Bürgermeister Gully – der hat zu allem eine Rede.' }],
      },
    ],
  },

  'kanal-spendenkiste': {
    id: 'kanal-spendenkiste',
    start: 'start',
    nodes: [
      {
        id: 'start',
        lines: [
          { speaker: N, text: 'Eine Blechkiste mit Schlitz. Draufgemalt: ein Rohr mit Herz. Darunter eine Ratte, dick durchgestrichen.' },
          { speaker: N, text: 'Das Kanalvolk sammelt Ersatzteile – für Pumpen, Generatoren und, so wie’s aussieht, für Gullys zweite Krone.' },
        ],
        choices: [
          {
            // prep-fluchtweg: zählt wie die Spende bei Gully (Flags aus quest-main-b/prep-fluchtweg.ts).
            text: 'Drei Ersatzteile spenden – für die Pumpen und einen Notausgang, der offen bleibt.', when: FLUCHT_OFFEN,
            requires: { item: 'schrott-ersatzteil', min: 3 }, next: 'danke-fluchtweg',
            effects: [
              { take: 'schrott-ersatzteil', qty: 3 }, { rep: 'kanalvolk', delta: 15 },
              { setFlag: 'kanal_spende_gegeben' }, { setFlag: 'fluchtweg_spende' }, { setFlag: 'fluchtweg_gesichert' },
            ],
          },
          {
            text: 'Drei Ersatzteile spenden.', when: { all: [{ not: FLUCHT_OFFEN }, { notFlag: 'kanal_spende_gegeben' }] },
            requires: { item: 'schrott-ersatzteil', min: 3 }, next: 'danke',
            effects: [{ take: 'schrott-ersatzteil', qty: 3 }, { rep: 'kanalvolk', delta: 15 }, { setFlag: 'kanal_spende_gegeben' }],
          },
          { text: 'Ich hab selber nix. Nächstes Mal.' },
        ],
      },
      {
        id: 'danke-fluchtweg',
        lines: [
          { speaker: N, text: 'Es scheppert dreimal. Eine Hand mit Stirnlampe am Gelenk fischt die Teile sofort raus und verschwindet Richtung Notausgang.' },
          { speaker: N, text: 'Kurz darauf quietscht hinten eine Tür. Dann quietscht sie nicht mehr. Jemand ölt. Der Rückweg gehört dir.' },
        ],
      },
      {
        id: 'danke',
        lines: [{ speaker: N, text: 'Es scheppert dreimal. Aus dem Dunkel ruft jemand: „Freund der Rohre!“ Dann ein Zweiter. Dann klatscht einer. Ein bisschen peinlich. Ein bisschen schön.' }],
      },
    ],
  },
};

// --- Karte ------------------------------------------------------------------------------------------------------------
const kanalSammler: MapDef = {
  id: 'kanal-sammler',
  name: 'Kanal-Sammler',
  subtitle: 'Kanalisation',
  size: [1536, 1024],
  district: 'kanalisation',
  lighting: 'underground',
  bg: 'bg-kanal-sammler',
  walk: [
    box([105, 196, 105, 70]), // Leiter-Nische links oben
    box([105, 248, 1290, 74]), // Laufsteg Nord inkl. Trockendock-Boden
    box([840, 240, 550, 82]), // vor Gittern, Ventilen und Rippers Lager
    box([1380, 210, 156, 64]), // rechts oben bis Schott und Tunnel Ost
    box([398, 316, 80, 208]), // Steg West
    box([1094, 316, 78, 208]), // Steg Ost
    box([30, 516, 1476, 76]), // Laufsteg Süd
    box([168, 580, 66, 128]), // Durchgang zum Garten
    box([40, 700, 226, 205]), // Kanalvolk-Garten links
    box([266, 768, 179, 137]), // Kanalvolk-Garten rechts (oben Rohrwand, dahinter Friedas Floß)
    box([558, 684, 100, 72]), // Floß-Anleger
    box([655, 580, 72, 190]), // Gang zum Rohrschacht
    box([618, 760, 112, 160]), // Rohrschacht-Vorplatz
    box([1040, 580, 125, 125]), // Zugang Thronsaal
    box([1040, 700, 450, 205]), // Thronsaal
  ],
  block: [
    box([95, 768, 95, 57]), // Badewanne links
    box([62, 808, 105, 58]), // Kräuterkiste links
    box([192, 722, 44, 98]), // Topfpflanze
    box([236, 806, 100, 60]), // Badewanne Mitte
    box([362, 792, 72, 74]), // Kisten rechts (links Platz für den Weg zum unteren Gartenstreifen)
    box([35, 700, 62, 165]), // Pilzfels Garten
    box([1236, 645, 158, 165]), // Kronkorken-Thron
    box([1120, 738, 116, 112]), // Schrottberg links
    box([1366, 700, 124, 185]), // Schrottberg rechts
    box([1036, 806, 44, 99]), // Holztor
  ],
  exits: [
    {
      id: 'leiter-loetgassen', rect: [112, 150, 88, 100], to: 'loetgassen', entry: 'von-kanal-sammler',
      label: 'Leiter zu den Lötgassen', interact: true,
    },
    {
      id: 'rohrschacht', rect: [625, 880, 100, 40], to: 'rohrsiedlung', entry: 'von-kanal-sammler',
      label: 'Rohrschacht zur Rohrsiedlung', interact: true,
    },
    {
      id: 'gitter-schrottmarkt', rect: [890, 168, 82, 92], to: 'schrottmarkt', entry: 'kanalgitter',
      label: 'Schnellweg: Schrottmarkt', interact: true, when: RK_DONE,
      lockedText: 'Ein Gitter mit Kronkorken-Siegel. Bürgermeister Gully lässt nur Freunde der Rohre durch.',
    },
    {
      id: 'gitter-loetgassen', rect: [975, 168, 82, 92], to: 'loetgassen', entry: 'kanalgitter',
      label: 'Schnellweg: Lötgassen', interact: true, when: RK_DONE,
      lockedText: 'Ein Gitter mit Kronkorken-Siegel. Bürgermeister Gully lässt nur Freunde der Rohre durch.',
    },
    {
      id: 'gitter-hafenkante', rect: [1060, 168, 82, 92], to: 'hafenkante', entry: 'kanalgitter',
      label: 'Schnellweg: Hafenkante', interact: true, when: RK_DONE,
      lockedText: 'Ein Gitter mit Kronkorken-Siegel. Bürgermeister Gully lässt nur Freunde der Rohre durch.',
    },
    {
      id: 'tunnel-ost', rect: [1500, 212, 36, 60], to: 'pumpwerk-sieben', entry: 'von-kanal-sammler',
      label: 'Tunnel Ost zum Pumpwerk Sieben',
      when: { all: [{ act: 2 }, { any: [{ cyberware: 'augen-restlicht' }, { item: 'stirnlampe' }] }] },
      lockedText: 'Gitter: „Wartung bis auf Weiteres.“ Dahinter Dunkelheit und ein Geräusch, das nach sehr großen Rohren klingt.',
    },
    {
      // world.md §3.2: act2 und (schottschluessel oder gc-110). Den Check macht der Hotspot „Drehrad“ (setzt schott_offen),
      // damit der Ausgang selbst ohne Check bleibt.
      id: 'schott', rect: [1398, 110, 112, 120], to: 'datentunnel', entry: 'von-kanal-sammler',
      label: 'Schott mit Drehrad', interact: true,
      when: { any: [{ item: 'schottschluessel' }, { flag: 'schott_offen' }] },
      lockedText: 'Ein Schott mit Drehrad, festgerostet. Mit genug Technik wüsstest du, wo man drehen müsste – oder mit dem passenden Schlüssel.',
    },
  ],
  entries: {
    'von-loetgassen': { at: [155, 252], facing: 's' },
    'von-rohrsiedlung': { at: [672, 850], facing: 'n' },
    'gitter-schrottmarkt': { at: [930, 290], facing: 's' },
    'gitter-loetgassen': { at: [1015, 290], facing: 's' },
    'gitter-hafenkante': { at: [1100, 290], facing: 's' },
    'von-pumpwerk-sieben': { at: [1478, 250], facing: 'w' },
    'von-datentunnel': { at: [1430, 248], facing: 's' },
    aufwachen: { at: [478, 290], facing: 's' },
  },
  spots: Object.fromEntries(Object.entries(S).map(([k, at]) => [k, { at, facing: 's' as const }])),
  hotspots: [
    {
      id: 'schott-drehrad', at: [1454, 236], radius: 56, label: 'Drehrad am Schott', kind: 'check', check: 'gc-110',
      when: { act: 2 }, hideWhen: { any: [{ item: 'schottschluessel' }, { flag: 'schott_offen' }] },
      altText: 'Ohne Technik bleibt nur der Schottschlüssel – oder der Kabelschacht im Digitech-Areal.',
      effects: [{ setFlag: 'schott_offen' }, { travel: 'datentunnel', entry: 'von-kanal-sammler' }],
    },
    // --- Trockendock ---------------------------------------------------------------------------------------------
    {
      id: 'gullys-rathaus', at: [700, 246], radius: 50, label: 'Gullys Rathaus ansehen', kind: 'look',
      lines: [
        { speaker: N, text: 'Gullys Rathaus: ein Zelt aus Planen, eine Messingglocke, ein Wimpel. An der Plane hängen die Sprechzeiten: „Immer. Außer wenn nicht.“' },
        { speaker: N, text: 'Daneben ein Zettel: „Beschwerden bitte schriftlich. Papier bitte selbst mitbringen. Ratten bitte draußen lassen.“' },
      ],
    },
    {
      id: 'kanalbrett', at: [795, 250], radius: 50, label: 'Gullys Kanalbrett', kind: 'board', board: 'gullys-kanalbrett', when: BRETT_OFFEN,
    },
    {
      id: 'kanalbrett-zu', at: [795, 250], radius: 50, label: 'Gullys Kanalbrett', kind: 'look', hideWhen: BRETT_OFFEN,
      lines: [{ speaker: N, text: 'Gullys Kanalbrett: Aufträge vom Kanalvolk, für Fremde zugeklappt. Erst wer den Rohren was Gutes tut, darf reingucken. Spenden, helfen, Ratten verscheuchen – sowas.' }],
    },
    { id: 'notgenerator', at: [320, 250], radius: 52, label: 'Notgenerator', kind: 'use', dialogue: 'kanal-notgenerator' },
    {
      id: 'trockendock-bett', at: [470, 246], radius: 50, label: 'Im Trockendock schlafen', kind: 'sleep', when: STROM_DONE,
      lines: [{ speaker: N, text: 'Die Matratze ist warm vom Generator, die Lichterketten summen. Bürgermeister Gully hat dir ein Kissen hingelegt. Es ist mit Kronkorken bestickt. Es piekst. Es ist perfekt.' }],
    },
    {
      id: 'trockendock-bett-klamm', at: [470, 246], radius: 50, label: 'Auf der klammen Matratze schlafen', kind: 'use', hideWhen: STROM_DONE,
      lines: [{ speaker: N, text: 'Die Matratze ist klamm, der Generator tot, die Pilze welken. Schlafen geht. Erholen eher nicht.' }],
      effects: [{ sleep: true }, { damage: 20 }, { message: 'Du wachst mit Rücken auf. Und mit einem Pilz im Ohr.' }],
    },
    {
      id: 'kabelweg-ende', at: [235, 250], radius: 50, label: 'Kabelende ansehen', kind: 'look', hideWhen: STROM_DONE,
      lines: [{ speaker: N, text: 'Hier endet ein halbes Kabel, sauber abgeknabbert. Das andere Ende hängt angeblich irgendwo bei Lötzinn in den Lötgassen. Strom kommt so jedenfalls keiner an.' }],
    },
    {
      id: 'kabelweg-ende-an', at: [235, 250], radius: 50, label: 'Kabel ansehen', kind: 'look', when: STROM_DONE,
      lines: [{ speaker: N, text: 'Das Kabel aus den Lötgassen kommt hier an und summt zufrieden. Die Pilze saufen Strom wie andere Leute Schnaps.' }],
    },
    { id: 'spende-ersatzteile', at: [628, 250], radius: 50, label: 'Spendenkiste des Kanalvolks', kind: 'use', dialogue: 'kanal-spendenkiste', when: { any: [FLUCHT_OFFEN, { notFlag: 'kanal_spende_gegeben' }] } },
    {
      id: 'ventil', at: [1010, 242], radius: 52, label: 'Ventile drehen', kind: 'use',
      lines: [{ speaker: N, text: 'Sechs Handräder, vier Manometer, null Beschriftung. Wer das gebaut hat, hasste Menschen. Eins der Rohre führt runter zum Rechen.' }],
      effects: [{
        minigame: 'akt-ventil', level: 2, key: 'kanal-ventil', label: 'Ventilrätsel: Wasser am Rechen drosseln',
        win: [{ setFlag: 'kanal_ventil_gedrosselt' }, { rep: 'kanalvolk', delta: 2 }, { message: 'Es gurgelt, es rumpelt – unten am Rechen sinkt das Wasser. Irgendwo jubelt jemand mit Stirnlampe.' }],
        lose: [{ message: 'Ventil drei quietscht in Moll. Das ist kein gutes Zeichen. Nochmal.' }],
      }],
    },
    {
      id: 'neon-tag-08', at: [872, 244], radius: 44, label: 'Leuchtzeichen an der Wand', kind: 'loot', once: true,
      effects: [{ give: 'neon-tag-08' }, { message: 'Neon-Tag 08: ein leuchtendes Rohr mit Krönchen. Jemand hier unten hat Humor. Und Sprühdosen.' }],
    },
    {
      id: 'rippers-lager', at: [1225, 244], radius: 50, label: 'Rippers Lager ansehen', kind: 'look',
      lines: [
        { speaker: N, text: 'Kühlboxen, Medizinkoffer, ein Maschendraht mit drei Vorhängeschlössern. Wer hier unten so ordentlich lagert, verkauft garantiert nichts Legales.' },
        { speaker: N, text: 'Aus einer Box kommt ein leises Summen. Du willst nicht wissen, was da drin noch zuckt.' },
      ],
    },
    // --- Rechen ----------------------------------------------------------------------------------------------------
    { id: 'rechen', at: [205, 322], radius: 50, label: 'Der große Rechen', kind: 'use', dialogue: 'kanal-rechen' },
    {
      id: 'rechen-versteck', at: [96, 300], radius: 44, label: 'Nische hinter dem Rechen', kind: 'use', dialogue: 'kanal-rechen-versteck',
      hideWhen: { flag: 'kanal_versteck_erreicht' },
    },
    {
      id: 'datenwuerfel-18', at: [80, 312], radius: 52, label: 'In die Nische greifen', kind: 'loot', once: true,
      when: { flag: 'kanal_versteck_erreicht' },
      effects: [{ give: 'datenwuerfel-18' }, { message: 'Ein Datenwürfel mit Rattenbissen. Glück gehabt: Es war kein Auge.' }],
    },
    {
      id: 'flaschenpost-02', at: [90, 504], radius: 48, label: 'Flasche am Rechen', kind: 'loot', once: true,
      effects: [{ give: 'flaschenpost-02' }, { message: 'Eine Flasche mit Korken und Zettel drin. Sie hat sich am Rechen verfangen wie alles hier unten.' }],
    },
    {
      id: 'leuchtpilze', at: [62, 640], radius: 64, label: 'Leuchtpilze ansehen', kind: 'look', hideWhen: STROM_DONE,
      lines: [{ speaker: N, text: 'Die Leuchtpilze welken, ihr Blau ist ganz blass. Ohne Strom vom Generator glimmen sie wie eine Kippe im Regen.' }],
    },
    {
      id: 'leuchtpilze-hell', at: [62, 640], radius: 64, label: 'Leuchtpilze ansehen', kind: 'look', when: STROM_DONE,
      lines: [{ speaker: N, text: 'Die Pilze leuchten so satt, dass du deinen eigenen Schatten siehst. Das Kanalvolk nennt das „Sommer“.' }],
    },
    // --- Laufsteg Süd ----------------------------------------------------------------------------------------------
    { id: 'fluss-frieda', at: [452, 606], radius: 60, label: 'Fluss-Friedas Floßladen', kind: 'shop', shop: 'fluss-frieda' },
    {
      id: 'floss', at: [605, 742], radius: 44, label: 'Floßfahrt', kind: 'use',
      lines: [{ speaker: N, text: 'Ein Floß aus Ölkanistern und Türblättern. Die Stange hat jemand mit „Kapitän“ beschriftet. Die Stange lügt.' }],
      effects: [{
        minigame: 'akt-floss', level: 2, key: 'kanal-floss', label: 'Floßfahrt durch den Sammler',
        win: [{ give: 'schrott-ersatzteil', qty: 2 }, { message: 'Treibgut eingesammelt: zwei Ersatzteile und eine Gummiente, die du großzügig zurück ins Wasser setzt.' }],
        lose: [{ message: 'Du kommst triefend zurück. Fluss-Frieda hält dir wortlos ein Handtuch hin. Es ist auch nass.' }],
      }],
    },
    {
      id: 'angeln-kanal', at: [780, 512], radius: 48, label: 'Mit der Magnetangel fischen', kind: 'use', when: { item: 'magnetangel' },
      effects: [{
        minigame: 'akt-angeln', level: 2, key: 'kanal-angeln', label: 'Magnetangeln im Kanal',
        win: [{ give: 'schrott-ersatzteil' }, { message: 'Am Magneten: ein Ersatzteil. Brauchbar. Fast sauber.' }],
        lose: [{ give: 'rostige-dose' }, { message: 'Am Magneten: eine rostige Dose. Innen bewegt sich was. Gratuliere.' }],
      }],
    },
    {
      id: 'angeln-kanal-ohne', at: [780, 512], radius: 48, label: 'Ins Wasser schauen', kind: 'look', hideWhen: { item: 'magnetangel' },
      lines: [{ speaker: N, text: 'Im Kanal glitzert Metall. Mit einer Magnetangel könnte man hier fischen. Mit der Hand eher nicht – außer du hängst nicht an deinen Fingern.' }],
    },
    {
      id: 'ausschuss', at: [905, 598], radius: 52, label: 'Übers Geländer in den Ausschuss schauen', kind: 'look', when: AKT1,
      lines: [{ speaker: N, text: 'Unter dir eine Rutsche aus der Oberstadt, die Elektroschrott in eine Kammer spuckt. Platinen, Chips, Kabelsalat, alles leuchtet ein bisschen lila. Gesund ist was anderes.' }],
    },
    {
      id: 'ausschuss-quantum', at: [905, 598], radius: 52, label: 'Übers Geländer in den Ausschuss schauen', kind: 'look', when: { act: 2 },
      lines: [
        { speaker: N, text: 'Seit Neuestem liegen da unten Quantum-Chips. Hunderte. Manche zucken noch, als würden sie träumen.' },
        { speaker: N, text: 'Genau so einer steckte in Jimmys Nacken. Jemand entsorgt hier Beweise – und zwar schlampig.' },
      ],
    },
    {
      id: 'jimmy-spur-07', at: [800, 598], radius: 50, label: 'Etwas hängt am Geländer', kind: 'loot', once: true,
      effects: [{ give: 'jimmy-spur-07' }, { message: 'Ein Fetzen Overall mit Ölflecken, am Geländer hängengeblieben. Jimmy war hier unten. Und hatte es eilig.' }],
    },
    {
      // Nach dem Sichern zeigt quest-main-b/prep-fluchtweg.ts den geölten Notausgang (prep-fluchtweg-tuer).
      id: 'fluchtweg-tuer', at: [1478, 556], radius: 50, label: 'Notausgang', kind: 'look', hideWhen: { flag: 'fluchtweg_gesichert' },
      lines: [{ speaker: N, text: 'Eine rostige Notausgangstür, zugestellt mit Kisten. Dahinter geht’s angeblich Richtung Pumpwerk. Angeblich. Ohne das Kanalvolk räumt das hier keiner frei.' }],
    },
    // --- Garten ------------------------------------------------------------------------------------------------------
    {
      id: 'kanalvolk-garten', at: [140, 900], radius: 50, label: 'Kanalvolk-Garten', kind: 'look',
      lines: [{ speaker: N, text: 'Badewannen voller Minze, Kisten voller Pilze, eine Gießkanne mit Delle. Das Kanalvolk nennt es Garten. Das Gesundheitsamt würde es Tatort nennen.' }],
    },
    {
      id: 'kanalminze', at: [290, 820], radius: 72, label: 'Kanalminze pflücken', kind: 'loot',
      when: { all: [LIMO_AKTIV, { noItem: 'kanalminze' }] },
      effects: [{ give: 'kanalminze' }, { message: 'Kanalminze, frisch gezupft. Riecht nach Pfefferminz mit einer Note Kanal. Der Barkeeper wird das lieben. Oder verfluchen.' }],
    },
    // --- Thronsaal ---------------------------------------------------------------------------------------------------
    { id: 'thronsaal-tor', at: [1150, 598], radius: 50, label: 'Tor zum Thronsaal', kind: 'use', dialogue: 'kanal-thronsaal-tor' },
    {
      id: 'kronkorken-thron', at: [1312, 830], radius: 50, label: 'Kronkorken-Thron', kind: 'look', when: { not: NAGBERT_OFFEN },
      lines: [{ speaker: N, text: 'Ein Thron aus Tausenden Kronkorken, verklebt mit etwas, das du lieber nicht identifizierst. Die Sitzfläche ist noch warm.' }],
    },
    {
      id: 'glueckstern-15', at: [1470, 896], radius: 44, label: 'Glitzern hinterm Schrottberg', kind: 'loot', once: true,
      effects: [{ give: 'glueckstern-15' }, { message: 'Ein Glücksstern zwischen Leuchtpilzen. Nagbert hatte ihn gehortet. Er hat einen kleinen Zahnabdruck.' }],
    },
  ],
  encounters: [
    // side-rattenkoenig: drei umgehbare Rattenwachen (Nest 1 und 2 liegen abseits des Hauptwegs, Nest 3 vor dem Thronsaal).
    {
      id: 'rattennest-1', encounter: 'enc-kanal-rattenwache-1', at: S['rattennest-1'], sprite: 'kanalratte-walk',
      patrol: [[230, 556], [330, 556]], when: NAGBERT_OFFEN, avoid: wache1Schleichen,
    },
    {
      // Rattenbrücke von prep-fluchtweg (quest-main-b) steht auf demselben Spot; die Wache patrouilliert nördlich davon.
      id: 'rattennest-2', encounter: 'enc-kanal-rattenwache-2', at: [1133, 370], sprite: 'kanalratte-walk',
      patrol: [[1133, 345], [1133, 395]], when: NAGBERT_OFFEN, avoid: wache2Ventil,
    },
    {
      id: 'rattennest-3', encounter: 'enc-kanal-rattenwache-3', at: S['rattennest-3'], sprite: 'kanalratte-walk',
      when: NAGBERT_OFFEN, avoid: wache3Bluff,
    },
    { id: 'nagbert', encounter: 'enc-kanal-nagbert', at: [1300, 852], sprite: 'kanalratte-walk', radius: 60, when: NAGBERT_OFFEN },
    // job-kanal (wiederholbar) und Kopfgeld Graf Gully II. (Akt 2).
    { id: 'job-kanal', encounter: 'enc-job-kanal', at: [150, 560], sprite: 'kanalratte-walk', when: { job: 'job-kanal' }, once: false },
    {
      id: 'graf-gully', encounter: 'enc-kopfgeld-graf-gully-zwei', at: S['graf-gully-thron'], sprite: 'passant-kanalvolk-walk',
      when: { job: 'kopfgeld-graf-gully-zwei' }, once: false,
    },
  ],
  foreground: [
    { rect: [1236, 640, 158, 120], baseY: 805 }, // Thronlehne
  ],
  lights: [
    { at: [460, 110], radius: 230, color: '#ffc86a', intensity: 0.8 }, // Lichterketten Trockendock
    { at: [720, 170], radius: 120, color: '#ffb347' }, // Glocke am Rathaus
    { at: [490, 185], radius: 100, color: '#ffb347' }, // Lampe überm Bett
    { at: [1300, 85], radius: 160, color: '#dff6ff', intensity: 0.7 }, // Rippers Kaltlicht
    { at: [1440, 60], radius: 110, color: '#ffc86a' }, // Lampe am Schott
    { at: [85, 150], radius: 110, color: '#ff3fa4' }, // Neonröhre Leiter
    { at: [390, 40], radius: 130, color: '#ff3fa4' },
    { at: [640, 40], radius: 130, color: '#3ef2ff' },
    { at: [1130, 70], radius: 120, color: '#3ef2ff' },
    { at: [355, 655], radius: 110, color: '#ffb347' }, // Friedas Laternen
    { at: [545, 655], radius: 110, color: '#ffb347' },
    { at: [845, 710], radius: 130, color: '#b04bff' }, // Ausschuss
    { at: [1290, 650], radius: 220, color: '#ffc86a', intensity: 0.7 }, // Lichterkette Thronsaal
    { at: [45, 215], radius: 90, color: '#5fd9ff' }, // Leuchtpilze
    { at: [38, 330], radius: 80, color: '#5fd9ff' },
    { at: [40, 670], radius: 110, color: '#5fd9ff' },
    { at: [85, 780], radius: 90, color: '#7dffb2' },
    { at: [420, 800], radius: 80, color: '#5fd9ff' },
    { at: [1500, 650], radius: 90, color: '#5fd9ff' },
    { at: [1480, 885], radius: 80, color: '#7dffb2' },
    { at: [160, 710], radius: 90, color: '#ffb347' }, // Gartenlaterne
  ],
  ambient: {
    count: 4,
    sprites: ['passant-kanalvolk-walk', 'passant-schrotti-walk', 'passant-arbeiterin-walk'],
    routes: [
      [[150, 292], [1360, 292]],
      [[60, 560], [1480, 560]],
      [[438, 296], [438, 552], [1133, 552], [1133, 296]],
      [[230, 288], [820, 288]],
    ],
    bySlot: { morgen: 4, tag: 5, abend: 4, nacht: 2 },
    barks: [
      { text: 'Psst. Nicht so laut, die Ratten haben heute Ratsversammlung.', when: AKT1 },
      { text: 'Ventil drei quietscht in Dur. Das ist ein gutes Zeichen.', when: AKT1 },
      { text: 'Oben sind alle so seltsam. Hier unten ist alles wie immer: nass.', when: AKT2 },
      { text: 'Gully hat eine zweite Krone. Wir haben gefragt, warum. Er sagte: „Darum.“', when: { act: 3 } },
      { text: 'Wer in den Kanal pisst, kriegt Hausverbot. Wer reinfällt, kriegt Applaus.' },
      { text: 'Hörst du das? Gully probt wieder eine Rede vorm Echo. Das Echo hat die besseren Argumente.' },
      { text: 'Da vorn hat eine Ratte eine Brezel geklaut. Jetzt sitzt sie da und guckt schuldbewusst. Fast tut sie mir leid.' },
      { text: 'Da treibt Kalle auf’m Floß vorbei. Schnarcht in Dur, der alte Sack.' },
      { text: 'Guten Morgen. Also, wir nennen das so. Hier unten sieht’s um sechs genauso scheiße aus wie um zwölf.', when: { time: 'morgen' } },
      { text: 'Nachts kommt der Doc mit den kalten Händen und holt seine Kisten. Wir gucken dann alle woanders hin.', when: { time: 'nacht' } },
      { text: 'Die Pilze welken. Wenn die Pilze welken, welkt das Kanalvolk. Steht in keinem Buch, ist aber so.', when: { not: STROM_DONE } },
      { text: 'Seit der Generator läuft, glühen die Pilze wie die Reklame vom High Voltage. Ich hab heute zum ersten Mal meine Füße gesehen.', when: STROM_DONE },
      { text: 'Nagbert hat mein Fahrrad gefressen. Mit Klingel. Die Klingel hör ich nachts noch aus seinem Bauch.', when: NAGBERT_OFFEN },
      { text: 'Der König ist weg, es lebe … äh, keiner. Endlich bleiben die Ersatzteile da, wo man sie hinlegt!', when: NAGBERT_WEG },
    ],
  },
  shelter: { entry: 'aufwachen', heal: 30 },
  ambience: 'kanal',
  music: 'kanalisation',
  onEnter: [
    { id: 'kanal-erstbesuch', once: true, dialogue: 'kanal-sammler-ankunft', effects: [{ markSeen: 'kanal-sammler-ankunft' }] },
  ],
};

export const part: ContentPart = {
  maps: { [kanalSammler.id]: kanalSammler },
  districts: {
    kanalisation: { id: 'kanalisation', name: 'Kanalisation', ambience: 'kanal', music: 'kanalisation' },
  },
  dialogues,
};
