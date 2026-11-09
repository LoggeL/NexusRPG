// Abspann (world.md §5.5): läuft über GameContent.ending.cutscenes, sobald `{ ending: true }` fällt.
// Den Auslöser am Strand besitzt die Karte das-meer (Hotspot `abspann` → Dialog `das-meer-abspann`, Warnung + { ending }).
// Im Master-Modus (Ende 3 ohne 3b) ist das Meer zu: Der Auslöser liegt dann am Panoramafenster in blades-buero
// (Hotspot `abspann-master` per mapAdditions unten). Der Abspann zeigt dann „die Crew am Meer ohne die Spielfigur“
// (world.md §5.5) über die Beat-Bedingungen.
// Wand der Freiheit: Mit `abspann_wand_der_freiheit` folgt ein Wandbild-Beat (Bild 'cut-wand-der-freiheit'), dazu je ein
// Satz pro gemaltem Crew-Bild (`wand_bild_<npc>`) und einer für übermalte, grau gebliebene Bilder (`wand_grau_<npc>`).
// Nur Rollennamen, keine Darstellernamen.
import type { ContentPart } from '../../part';
import type { Condition, CutsceneBeat, CutsceneDef, DialogueDef } from '../../../modules/contracts';
import { all, any, bild, flag, l, n, noFlag, not, tafel } from './_lib';

/** Master-Modus ohne Rückweg ans Meer (3b hebt ihn auf). */
const MASTER_ABSPANN: Condition = all(flag('ende_master'), noFlag('ende_doch_noch_meer'));
const NORMAL: Condition = not(MASTER_ABSPANN);
const WAND = flag('abspann_wand_der_freiheit');

const nur = (when: Condition, beat: CutsceneBeat): CutsceneBeat => ({ ...beat, when: beat.when ? all(when, beat.when) : when });

/** Ein Satz pro Crew-Bild an der Wand (side-wand-der-freiheit). */
const WANDBILDER: readonly [string, string][] = [
  ['hunter', 'Hunter in Sprühfarbe, Sonnenbrille, Liegestuhl. Jemand hat einen Cocktail dazugemalt. Mit Schirmchen.'],
  ['raven', 'Raven, wie sie eine Handschelle durchbeißt. Die Handschelle sieht verdammt beleidigt aus.'],
  ['dante', 'Dante mit einem Keks so groß wie ein Gullydeckel. Darunter: DREI SEKUNDEN.'],
  ['vega', 'Vega, ein Auge zu, das andere auf euch alle. Der Kringel um ihr Zielfernrohr ist ein Herz.'],
  ['aria', 'Aria mit erhobener Faust. Aus der Faust wachsen Blitze. Oder Kabel. Bei Aria ist das dasselbe.'],
  ['nyra', 'Nyra mit Kopfhörern und einer Welle dahinter, so groß wie ein Haus.'],
  ['jimmy', 'Jimmy, lachend, Funken aus dem Kopf. ER BERAPPELT SICH.'],
  ['captain-kuschel', 'Captain Kuschel mit Kapitänsmütze. Ein Ohr geknickt. Skeptisch, aber an Bord.'],
];

const abspann: CutsceneDef = {
  id: 'ende-abspann',
  title: 'Abspann',
  gallery: false,
  beats: [
    nur(NORMAL, bild('cut-ende-meer', 'Die Sonne setzt sich aufs Wasser. Irgendwo dreht jemand Radio Rost lauter.', [
      l('opa-funk', '(Radio Rost) Und jetzt, für alle, die angekommen sind: die Polka der Woche. Und für alle anderen auch. Ich bin da nicht kleinlich.'),
    ], { pan: 'right', fade: 'in', hold: 1600 })),
    // Ende 3: Turmbüro, der kleine Bildschirm in der Ecke, die Crew am Meer – ohne dich.
    nur(MASTER_ABSPANN, bild('cut-ende-master', 'Das Turmbüro, spät. Auf dem kleinen Bildschirm in der Ecke läuft wieder das Bild, das du nicht bestellt hast.', [
      l('ki-nexus', 'Ein Störsender aus der Ödnis, Master. Ich kann ihn nicht abschalten. Ich habe es … nicht sehr energisch versucht.', 'neutral'),
    ], { pan: 'in', fade: 'in', hold: 1600 })),
    nur(MASTER_ABSPANN, bild('cut-ende-meer', 'Ein Strand. Ein Lagerfeuer aus Treibholz. Sechs Leute, ein Hase mit Kapitänsmütze und ein Platz im Sand, auf dem niemand sitzt.', [
      l('dante', 'Ich hab Kekse dabei. Einer ist übrig. Den lass ich da liegen. Nur so.', 'trauer'),
      l('raven', 'Iss ihn, Dante. Wer nicht kommt, kriegt keinen Keks. So einfach ist das.', 'wut'),
      l('aria', 'Lass ihn liegen. Das Arschloch soll wenigstens wissen, dass er da gewesen wär.', 'trauer'),
    ], { pan: 'right', hold: 2200 })),
    nur(MASTER_ABSPANN, bild('cut-ende-meer', 'Hunter steht auf, schaut kurz in die Kamera der Drohne, die über ihnen kreist, und hebt die Flasche.', [
      l('hunter', 'Falls du zuschaust: Schulden muss man immer begleichen. Deine stehen noch offen. Der Platz auch.', 'neutral'),
    ], { pan: 'out', hold: 2000 })),
    tafel('NEXUS – DAS RPG', [], { hold: 2200 }),
    tafel('Die Crew', [], { hold: 900 }),
    tafel('HUNTER · Clubbesitzer, Planer, Mann mit Liegestuhl'),
    tafel('RAVEN · Einbrecherin. Ohne Handschellen.'),
    tafel('DANTE · Techniker, Bäcker, Erfinder der Drei-Sekunden-Regel'),
    tafel('VEGA · Scharfschützin. Hat mitgezählt.'),
    tafel('ARIA · Faust, Herz, Kabelbrand'),
    tafel('NYRA alias SILENT-ANGEL · Hackerin. Hatte recht mit dem Zentrator.'),
    tafel('JIMMY · Kundenservice von gestern, Lieferdienst von morgen'),
    tafel('CAPTAIN KUSCHEL · Zuhörer'),
    tafel('Live aus dem Studio', [], { hold: 900 }),
    tafel('COLLIN CHARLESTON · Moderator. Unersetzlich.'),
    tafel('DELYA DELLORAINE · Reporterin. Wach.'),
    tafel('DER KAMERAMANN · [ : ) ]'),
    tafel('Die Oberstadt', [], { hold: 900 }),
    tafel('BLADE NOCTURNE · Schurke im Teddyfell'),
    tafel('ALESA ZERO · Erfinderin. Hat es gewusst.'),
    tafel('XION VENOM · Sicherheitschef. Wartet noch auf den Hubschrauber.'),
    tafel('NEXUS · Eine KI mit Hang zu Nougatbomben'),
    tafel('SERAPHINA, SYBELLA und SERENITY CHROME · Die Familie, der die Hälfte gehört'),
    tafel('Die Unterstadt', [], { hold: 900 }),
    tafel('DEXTER · Schrotthändler. Bestreitet alles.'),
    tafel('DARIA, FREYA und JAKKO · Die Kinder vom Schrottmarkt. Trinkgeld nicht optional.'),
    tafel('LIO FUNKEL · Lied ohne Reim'),
    tafel('FRAU TAKT · Null Sekunden'),
    tafel('KNUT und KURT · Fast ehrlich'),
    tafel('KÄPT’N NEBELHORN · Mit Schwimmweste'),
    tafel('KIKI KARBON · Schwebetaxi, Fenster als Klimaanlage'),
    tafel('BÜRGERMEISTER GULLY · Krone aus Rohr'),
    tafel('OPA FUNK · Radio Rost, Polka von früh bis spät'),
    tafel('FX-60 · PROTOKOLL. Freundschaft. Ende.'),
    tafel('Die Ödnis', [], { hold: 900 }),
    tafel('KRÄHE · Staubfalken. Ehre statt Gewinn.'),
    tafel('MARLA SAND · Hat den Weg ausgeschildert.'),
    tafel('OPA GUSTAV · Bester Stand, eigener Schweißbrenner'),
    tafel('KRABBE KARL · Saß schon da.'),
    tafel('Und', [], { hold: 900 }),
    nur(NORMAL, tafel('DU · Neu in Noxius. Nicht mehr neu.', [], { hold: 1800 })),
    nur(MASTER_ABSPANN, tafel('DU · Master von Noxius. Fragt keiner mehr nach.', [], { hold: 1800 })),
    // Wand der Freiheit (side-wand-der-freiheit): das Wandbild an der Flutmauer, dazu jedes gemalte Crew-Bild.
    nur(WAND, bild('cut-wand-der-freiheit', 'Die Wand der Freiheit an der Flutmauer. Sina Spray hat signiert, so groß, dass man es vom Hafen aus lesen kann.', [
      l('sina-spray', 'Wer hier vorbeigeht, bleibt stehen. Das war der Plan. Der einzige Plan in dieser Stadt, der aufgegangen ist.', 'freude'),
    ], { pan: 'right', fade: 'cross', hold: 1800 })),
    ...WANDBILDER.map(([npc, text]) => nur(all(WAND, flag(`wand_bild_${npc}`)), tafel(text, [], { hold: 1100 }))),
    // Akt 2 übermalt und nicht neu gesprüht (`wand_grau_<npc>`, side-wand-der-freiheit): ein Satz für die grauen Lücken.
    nur(all(WAND, any(...WANDBILDER.map(([npc]) => flag(`wand_grau_${npc}`)))), tafel('Dazwischen ein paar graue Flecken, wo Quantum drübergerollt hat und keiner nachgesprüht hat. Sina lässt sie so. „Damit man sieht, dass die Arschlöcher es versucht haben.“', [], { hold: 1400 })),
    nur(all(WAND, MASTER_ABSPANN), tafel('Ganz am Rand der Wand ist ein Stück frei geblieben. Sina hat nur einen Umriss gesprüht. Er hat deine Frisur.', [], { hold: 1600 })),
    nur(NORMAL, bild('cut-ende-meer', 'Kein Mensch mit Chip im Kopf wurde für diesen Abspann gezwungen, irgendwas zu klatschen.', [
      l('hunter', 'Schulden muss man immer begleichen. Und die hier sind beglichen.', 'freude'),
    ], { pan: 'in', hold: 1800 })),
    nur(MASTER_ABSPANN, bild('cut-ende-master', 'Der Bildschirm geht aus. Im Glas spiegelt sich nur noch einer.', [
      l('ki-nexus', 'Alles ist gut, Master.', 'neutral'),
    ], { pan: 'in', hold: 1800 })),
    nur(NORMAL, tafel('Noxius leuchtet weiter.', [], { fade: 'out', hold: 2400 })),
    nur(MASTER_ABSPANN, tafel('Noxius leuchtet weiter. Weil du es befiehlst.', [], { fade: 'out', hold: 2400 })),
  ],
};

/** Auslöser im Master-Modus: am Panoramafenster des Turmbüros (das Meer ist zu). */
const masterAbspann: DialogueDef = {
  id: 'blades-buero-abspann',
  start: 'a',
  nodes: [
    {
      id: 'a',
      lines: [
        n('Auf dem kleinen Bildschirm neben dem Fenster flackert wieder der Strand. Das Feuer. Der leere Platz. Nexus behauptet, es sei ein Störsender.'),
        n('Wenn du hier hinsiehst, läuft der Abspann. Danach geht es zurück zum Titel. Speichere vorher, wenn du als Master weiterspielen willst. Oder doch noch einen anderen Weg suchen.'),
      ],
      choices: [
        { text: 'Abspann ansehen.', next: 'los' },
        { text: 'Noch nicht. Die Stadt gehört dir. Noch.' },
      ],
    },
    {
      id: 'los',
      lines: [n('Du setzt dich vor den Bildschirm. Der Chefsessel knarzt. Er klingt wie Blade, wenn er gelacht hat.')],
      effects: [{ ending: true }],
    },
  ],
};

export const part: ContentPart = {
  cutscenes: { [abspann.id]: abspann },
  dialogues: { [masterAbspann.id]: masterAbspann },
  mapAdditions: {
    'blades-buero': {
      hotspots: [{
        id: 'abspann-master', at: [200, 205], radius: 50, label: 'Abspann ansehen', kind: 'use',
        when: all(flag('master_modus'), MASTER_ABSPANN), dialogue: masterAbspann.id,
      }],
    },
  },
};
