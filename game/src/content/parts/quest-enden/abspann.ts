// Abspann (world.md §5.5): läuft über GameContent.ending.cutscenes, sobald `{ ending: true }` fällt.
// Den Auslöser am Strand besitzt die Karte das-meer (Hotspot `abspann` → Dialog `das-meer-abspann`, Warnung + { ending }).
// Nur Rollennamen, keine Darstellernamen.
import type { ContentPart } from '../../part';
import type { CutsceneDef } from '../../../modules/contracts';
import { bild, l, tafel } from './_lib';

const abspann: CutsceneDef = {
  id: 'ende-abspann',
  title: 'Abspann',
  gallery: false,
  beats: [
    bild('cut-ende-meer', 'Die Sonne setzt sich aufs Wasser. Irgendwo dreht jemand Radio Rost lauter.', [
      l('opa-funk', '(Radio Rost) Und jetzt, für alle, die angekommen sind: die Polka der Woche. Und für alle anderen auch. Ich bin da nicht kleinlich.'),
    ], { pan: 'right', fade: 'in', hold: 1600 }),
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
    tafel('DU · Neu in Noxius. Nicht mehr neu.', [], { hold: 1800 }),
    bild('cut-ende-meer', 'Kein Mensch mit Chip im Kopf wurde für diesen Abspann gezwungen, irgendwas zu klatschen.', [
      l('hunter', 'Schulden muss man immer begleichen. Und die hier sind beglichen.', 'freude'),
    ], { pan: 'in', hold: 1800 }),
    tafel('Noxius leuchtet weiter.', [], { fade: 'out', hold: 2400 }),
  ],
};

export const part: ContentPart = {
  cutscenes: { [abspann.id]: abspann },
};
