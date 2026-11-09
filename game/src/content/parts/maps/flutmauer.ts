// Flutmauer (world.md §3.5, §3.8/§3.9, §8.7, §10.4/§10.7; Plan design/plan/act1.json, Paket pkg-flutmauer).
// Zone 1536×1024: oben die Mauerkrone (Promenade mit Geländer, Leuchtturm-Bastion links, Wand der Freiheit rechts,
// Münzfernrohr und Bank), eine breite Treppe hinunter in die Brackbucht (Schlick, zwei gestrandete Kutter,
// Drohnenwrack, Hundebau rechts), unten das Meer im Dunst. Einziger Ausgang: Rampe Nord zur Hafenkante.
// Legt den Bezirk `kueste` an. mauer-ziel = Ziel des Dächerrennens (rom-aria-kuss, rom-vexaria-kuss, he-aria-10).
// Quest-Hotspots setzen sprechende Flags (siehe design/plan/gaps/maps-flutmauer.md); Quest-Agenten werten sie aus.
import type { CheckDef, Condition, MapDef, Point, Polygon, Rect } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const N = 'narrator';
const box = ([x, y, w, h]: Rect): Polygon => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];

/** Benannte Punkte (Plan-IDs). */
const S = {
  leuchtturm: [372, 312],
  'leuchtturm-oben': [46, 352],
  'wand-der-freiheit': [1150, 245],
  muenzfernrohr: [880, 330],
  'nyra-bank': [1022, 330],
  laufstrecke: [1215, 300],
  'mauer-ziel': [1290, 335],
  brackbucht: [1150, 815],
  schlickstrand: [360, 690],
  drohnenwrack: [560, 792],
  hundespuren: [860, 775],
  hunderudel: [1265, 765],
  treibgutnetz: [270, 770],
  'kamera-mauerweg': [1350, 240],
  'auftrag-a': [700, 640],
} satisfies Record<string, Point>;

// --- Bedingungen ---------------------------------------------------------------------------------------------------
const nacht: Condition = { time: 'nacht' };
const nichtNacht: Condition = { not: nacht };
const ebbe: Condition = { time: ['morgen', 'abend'] };
const hatAngel: Condition = { any: [{ item: 'angel-einfach' }, { item: 'angel-profi' }, { item: 'magnetangel' }] };
const hundeQuest: Condition = { quest: 'side-hunde-der-brackbucht', state: 'active' };
const hundeGeloest: Condition = {
  any: [{ quest: 'side-hunde-der-brackbucht', state: 'done' }, { flag: 'bolzen_umprogrammiert' }, { won: 'enc-bucht-hunde' }],
};
const drohnenQuest: Condition = { quest: 'side-live-dabei', state: 'active' };
const wandQuest: Condition = { quest: 'side-wand-der-freiheit', state: 'active' };
const ariaDabei: Condition = { companion: 'aria' };
const ariaGekuesst: Condition = { flag: 'aria_kuss' };
const vex: Condition = { playerIs: 'vex' };

/** Rudel umgehen: leise über den Schlick (kein world.md-Check genannt, daher eingebettet). */
const rudelUmgehen: CheckDef = {
  id: 'flutmauer-rudel-umgehen', attribute: 'reflexe', threshold: 5, tags: ['schleichen', 'welt'], label: '[Reflexe 5]',
};
/** Münzfernrohr ohne Münze überreden. */
const fernrohrHauen: CheckDef = {
  id: 'flutmauer-fernrohr-hauen', attribute: 'koerper', threshold: 4, tags: ['kraft', 'welt'], label: '[Körper 4]',
};

const flutmauer: MapDef = {
  id: 'flutmauer',
  name: 'Flutmauer',
  subtitle: 'Küste · Brackbucht',
  size: [1536, 1024],
  district: 'kueste',
  lighting: 'outdoor',
  bg: 'bg-flutmauer',
  walk: [
    // Rampe nach Norden (Hafenkante)
    [[688, 0], [802, 0], [840, 200], [645, 200]],
    // Mauerkrone / Promenade
    [
      [222, 192], [645, 192], [840, 196], [850, 218], [1395, 220], [1395, 314], [1468, 316], [1468, 334], [1312, 336],
      [1308, 352], [560, 352], [548, 372], [385, 372], [378, 352], [222, 352],
    ],
    // Leuchtturm-Bastion (um den Turmfuß herum)
    [[12, 312], [70, 296], [70, 388], [214, 388], [214, 340], [272, 340], [272, 372], [240, 398], [165, 418], [80, 412], [26, 386]],
    // Treppe hinunter in die Brackbucht
    [[390, 360], [544, 360], [544, 604], [390, 604]],
    // Bootsrampe mit Winde (endet an der Mauer)
    [[1082, 452], [1198, 452], [1196, 604], [1048, 604]],
    // Brackbucht (Schlick bis zur Wasserkante)
    [[0, 600], [360, 590], [560, 562], [1420, 562], [1415, 796], [1536, 806], [1536, 838], [0, 838]],
  ],
  block: [
    box([68, 0, 146, 390]), // Leuchtturm
    box([214, 205, 148, 140]), // Henks Stand (Ruten, Schild, Kühlbox)
    box([900, 296, 46, 66]), // Münzfernrohr
    box([1396, 222, 74, 92]), // Ölfass-Türmchen
    [[44, 636], [270, 660], [262, 736], [56, 736]], // Kutter links
    [[900, 660], [1095, 690], [1090, 750], [915, 745]], // Kutter rechts
    box([498, 722, 118, 40]), // Drohnenwrack
    box([772, 622, 112, 38]), // Netzpfähle Mitte
    box([1300, 650, 116, 70]), // Netze und Schrott am Hundebau
    [[1420, 520], [1536, 520], [1536, 800], [1418, 792]], // Bretterbude rechts
  ],
  foreground: [
    { rect: [40, 590, 240, 148], baseY: 736 },
    { rect: [896, 590, 214, 162], baseY: 750 },
    { rect: [1392, 220, 80, 94], baseY: 314 },
    { rect: [898, 270, 50, 94], baseY: 362 },
  ],
  exits: [
    { id: 'nach-hafenkante', rect: [684, 0, 122, 26], to: 'hafenkante', entry: 'von-flutmauer', label: 'Rampe zur Hafenkante' },
  ],
  entries: {
    'von-hafenkante': { at: [745, 222], facing: 's' },
    aufwachen: { at: [165, 402], facing: 's' },
    taxi: { at: [600, 290], facing: 's' },
  },
  spots: Object.fromEntries(Object.entries(S).map(([id, at]) => [id, {
    at,
    facing: (['wand-der-freiheit', 'kamera-mauerweg', 'drohnenwrack'].includes(id) ? 'n'
      : id === 'leuchtturm' ? 'w' : 's') as 'n' | 'w' | 's',
  }])),
  hotspots: [
    // --- Leuchtturm und Henk ---------------------------------------------------------------------------------------
    {
      id: 'henk-angler', at: [300, 330], radius: 60, label: 'Henks Anglerbedarf', kind: 'shop', shop: 'henk-angler', when: nichtNacht,
      lines: [{ speaker: N, text: 'Ruten, Köder in Dosen, die sich bewegen, und ein handgemaltes Fischschild. Ein Zettel unter der Kühlbox: „Anschreiben nur für Leute, die schon mal was gefangen haben.“' }],
    },
    {
      id: 'henk-stand-zu', at: [300, 330], radius: 60, label: 'Henks Stand (zu)', kind: 'look', when: nacht,
      lines: [{ speaker: N, text: 'Plane drüber, Kühlbox abgeschlossen. Oben im Leuchtturm brennt Licht, und jemand pfeift schief ein Seemannslied. Henk hat Feierabend, die Fische auch.' }],
    },
    {
      id: 'aussicht-leuchtturm', at: [110, 398], radius: 44, label: 'Leuchtturm hochsteigen', kind: 'use', dialogue: 'flutmauer-aussicht',
    },
    {
      id: 'leuchtturm-bett', at: [205, 392], radius: 40, label: 'Auf Henks Notpritsche schlafen', kind: 'sleep',
      when: { hearts: 'henk-angler', min: 3 },
      lines: [{ speaker: N, text: 'Henks Ersatzpritsche im Turmfuß: eine Wolldecke, die nach Tang riecht, und das Brummen der Lampe über dir. Besser als jede Parkbank. Schlechter als alles andere.' }],
    },
    {
      id: 'leuchtturm-tuer', at: [205, 392], radius: 40, label: 'Leuchtturm-Tür', kind: 'look',
      when: { not: { hearts: 'henk-angler', min: 3 } },
      lines: [{ speaker: N, text: 'Eine Eisentür mit drei Schlössern und einem Aufkleber: „Wer hier pennen will, fängt erst mal einen Fisch.“ Henk lässt nur Leute rein, die er mag. Das ist eine kurze Liste.' }],
    },
    // --- Mauerkrone ------------------------------------------------------------------------------------------------
    {
      id: 'wand-der-freiheit-ansehen', at: [1040, 225], radius: 70, label: 'Wand der Freiheit', kind: 'look', when: nichtNacht,
      lines: [
        { speaker: N, text: 'Die Wand der Freiheit: zwanzig Meter Beton, vollgesprüht mit Gesichtern, Sternen, einer Welle so groß wie ein Mietshaus und einem Herz, über das jemand „Quantum lutscht“ gekritzelt und jemand anderes wieder übersprüht hat.' },
        { speaker: N, text: 'Hier unten malt man, was man oben nicht sagen darf. Unten links ist noch Platz. Sina hält ihn frei, für Leute mit Geschichten.' },
      ],
    },
    {
      id: 'graffiti-wand', at: [1150, 230], radius: 60, label: 'Sprühen', kind: 'use', when: nacht,
      lines: [{ speaker: N, text: 'Dosen klappern im Eimer. Die Kamera am Mauerweg dreht sich träge. Ein Stück Wand, so groß wie ein Garagentor, wartet nur auf dich.' }],
      effects: [{
        minigame: 'akt-graffiti', level: 2, key: 'graffiti-wand', label: 'Wand der Freiheit',
        win: [{ setFlag: 'wand_gesprueht' }, { xp: 20 }, { relation: 'sina-spray', delta: 10 }, { advanceTime: 30 },
          { message: 'Frische Farbe auf altem Beton. Morgen bleiben die Leute davor stehen.' }],
        lose: [{ advanceTime: 20 }, { message: 'Das sieht aus wie ein Pferd. Es sollte keins werden. Sina wird lachen.' }],
      }],
    },
    {
      id: 'mauer-kamera', at: S['kamera-mauerweg'], radius: 56, label: 'Kamera am Mauerweg hacken', kind: 'use',
      when: { all: [wandQuest, { notFlag: 'mauer_kamera_gehackt' }] },
      lines: [{ speaker: N, text: 'Eine Ordnungsdienst-Kamera auf einem Mast, rot blinkend, schräg auf die Wand gerichtet. Wer hier nachts sprüht, landet morgen bei Kessel. Der Wartungskasten hängt auf Hüfthöhe. Wie nett.' }],
      effects: [{
        minigame: 'akt-hacken', level: 3, key: 'mauer-kamera', label: 'Kamera auf Endlosschleife',
        win: [{ setFlag: 'mauer_kamera_gehackt' }, { xp: 40 }, { message: 'Die Kamera zeigt jetzt in Dauerschleife eine leere Wand und eine Möwe. Kessel wird sich wundern, warum die Möwe nie wegfliegt.' }],
        lose: [{ message: 'Der Kasten faucht und spuckt Funken. Probier es nochmal, oder lenk Kessel anders ab.' }],
      }],
    },
    {
      id: 'muenzfernrohr', at: [922, 340], radius: 50, label: 'Münzfernrohr', kind: 'use', dialogue: 'flutmauer-fernrohr',
    },
    {
      id: 'bank', at: S['nyra-bank'], radius: 44, label: 'Bank', kind: 'look',
      lines: [{ speaker: N, text: 'Eine Holzbank mit Blick aufs Meer. In die Lehne sind dreißig Jahre Liebesschwüre geritzt, die Hälfte durchgestrichen. Ganz klein, ganz neu: eine Welle und ein Kringel, der ein Hase sein könnte.' }],
    },
    {
      id: 'mauer-ziel', at: S['mauer-ziel'], radius: 52, label: 'Am Geländer', kind: 'use', dialogue: 'flutmauer-mauerziel',
    },
    // --- Brackbucht ------------------------------------------------------------------------------------------------
    {
      id: 'angeln-brackbucht', at: S.brackbucht, radius: 70, label: 'Angeln', kind: 'use', when: { all: [hatAngel, nichtNacht] },
      effects: [{
        minigame: 'akt-angeln', level: 2, key: 'angeln-brackbucht', label: 'Angeln in der Brackbucht',
        win: [{ give: 'muschel-frisch' }, { xp: 10 }, { advanceTime: 20 }, { message: 'Am Haken: eine Muschel, die noch nach Meer riecht. Und ein Stück Tang, das du großzügig zurückwirfst.' }],
        lose: [{ give: 'rostige-dose' }, { advanceTime: 20 }, { message: 'Eine rostige Dose. Innen bewegt sich was. Glückwunsch, du hast eine WG gegründet.' }],
      }],
    },
    {
      id: 'angeln-brackbucht-nacht', at: S.brackbucht, radius: 70, label: 'Nachtangeln', kind: 'use', when: { all: [hatAngel, nacht] },
      effects: [{
        minigame: 'akt-angeln', level: 3, key: 'angeln-brackbucht', label: 'Nachtangeln zwischen Leuchtalgen',
        win: [{ give: 'treibholz' }, { give: 'muschel-frisch' }, { xp: 15 }, { advanceTime: 30 }, { message: 'Die Schnur leuchtet grün vom Algenschleim. Am Haken: Treibholz und eine Muschel. Das Meer schickt Geschenke, nur nie die, die man will.' }],
        lose: [{ advanceTime: 30 }, { message: 'Etwas zieht, etwas reißt, etwas lacht im Wasser. Wahrscheinlich ein Fisch. Hoffentlich ein Fisch.' }],
      }],
    },
    {
      id: 'angeln-ohne-angel', at: S.brackbucht, radius: 70, label: 'Wasserkante', kind: 'look', when: { not: hatAngel },
      lines: [{ speaker: N, text: 'Graues Wasser schwappt gegen den Schlick. Da unten zappelt Abendessen, aber mit bloßen Händen fängst du hier nur Tetanus. Henk am Leuchtturm verkauft Angeln.' }],
    },
    {
      id: 'leuchtalge', at: [720, 820], radius: 56, label: 'Leuchtalge pflücken', kind: 'loot',
      when: nacht, hideWhen: { item: 'leuchtalge' },
      lines: [{ speaker: N, text: 'Im Flachwasser glimmen Algen in Giftgrün, als hätte jemand die Neon-Gasse ins Meer gekippt. Du pflückst eine Handvoll. Sie leuchtet dir durch die Finger und riecht nach Batterie.' }],
      effects: [{ give: 'leuchtalge' }],
    },
    {
      id: 'leuchtalge-tags', at: [720, 820], radius: 56, label: 'Flachwasser', kind: 'look', when: nichtNacht,
      lines: [{ speaker: N, text: 'Tagsüber nur grauer Schleim im Flachwasser. Nachts, sagt Henk, leuchtet der wie ein Clubklo.' }],
    },
    {
      id: 'treibgutnetz', at: S.treibgutnetz, radius: 60, label: 'Treibgutnetz hochziehen', kind: 'check', check: 'gc-149', once: true,
      when: ebbe,
      lines: [{ speaker: N, text: 'Ein altes Schleppnetz, halb im Schlick versunken, schwer von Muscheln, Dosen und etwas Flachem, Eckigem. Bei Ebbe kommt man ran. Ob man es auch hochkriegt, ist eine andere Frage.' }],
      altText: 'Das Netz bewegt sich keinen Zentimeter, der Schlick saugt zurück. Mit mehr Körper geht es, oder mit einer Magnetangel von Oma Volt.',
      effects: [{ setFlag: 'treibgutnetz_gezogen' }, { message: 'Mit einem Schmatzen gibt der Schlick das Netz frei. Zwischen Dosen und Seetang: eine Plattenhülle, eingeschweißt.' }],
    },
    {
      id: 'treibgutnetz-flut', at: S.treibgutnetz, radius: 60, label: 'Treibgutnetz', kind: 'look',
      when: { all: [{ not: ebbe }, { notFlag: 'treibgutnetz_gezogen' }] },
      lines: [{ speaker: N, text: 'Flut. Vom Netz sieht man nur die Schwimmer. Morgens oder abends, bei Ebbe, liegt es frei.' }],
    },
    {
      id: 'schallplatte-07', at: [300, 800], radius: 46, label: 'Plattenhülle aufheben', kind: 'loot', once: true,
      when: { flag: 'treibgutnetz_gezogen' },
      lines: [{ speaker: N, text: 'In Folie eingeschweißt, als hätte jemand gewusst, dass sie mal ins Meer fällt. Die Platte ist heil. Das Cover zeigt einen Sonnenuntergang, den es so nie gab.' }],
      effects: [{ give: 'schallplatte-07' }],
    },
    {
      id: 'drohnenwrack', at: [556, 740], radius: 72, label: 'Notfallprotokoll starten', kind: 'check', check: 'gc-66',
      when: drohnenQuest, hideWhen: { flag: 'kameradrohne_geborgen' },
      lines: [{ speaker: N, text: 'Die NX-1-Kameradrohne liegt halb im Schlick, ein Rotor abgebrochen, das Lämpchen blinkt im Takt von „Hilfe, Hilfe“. Am Bauch: eine Wartungsklappe mit Notfallprotokoll.' }],
      altText: 'Das Protokoll fragt nach einem Wartungscode, den du nicht hast. Andere Wege: reintauchen und sie rausholen, eine Magnetangel – oder erst mal das Rudel loswerden und in Ruhe graben.',
      effects: [{ setFlag: 'kameradrohne_geborgen' }, { xp: 20 }, { message: 'Die Drohne fährt hoch, schüttelt den Schlamm ab und schwebt dir nach wie ein beleidigter Wellensittich.' }],
    },
    {
      id: 'drohnenwrack-tauchen', at: [600, 790], radius: 50, label: 'In den Schlick tauchen', kind: 'check', check: 'gc-65',
      when: drohnenQuest, hideWhen: { flag: 'kameradrohne_geborgen' },
      altText: 'Der Schlick zieht dich bis zur Hüfte runter, und du ziehst dich gerade so wieder raus. Für den Tauchgang fehlt dir Körper. Probier das Notfallprotokoll oder eine Magnetangel.',
      effects: [
        { setFlag: 'kameradrohne_geborgen' }, { setFlag: 'schmutzig' }, { xp: 20 },
        { message: 'Du tauchst, greifst, ziehst. Die Drohne ist gerettet. Du riechst jetzt wie der Boden eines Fischkutters. Heute flirtest du besser mit niemandem.' },
      ],
    },
    {
      id: 'drohnenwrack-magnet', at: [500, 790], radius: 50, label: 'Mit der Magnetangel angeln', kind: 'use',
      when: { all: [drohnenQuest, { item: 'magnetangel' }] }, hideWhen: { flag: 'kameradrohne_geborgen' },
      effects: [{ setFlag: 'kameradrohne_geborgen' }, { xp: 15 }, { message: 'Klonk. Der Magnet sitzt. Du kurbelst die Drohne aus dem Schlick wie einen sehr teuren Fisch.' }],
    },
    {
      id: 'drohnenwrack-blinken', at: [556, 740], radius: 72, label: 'Rotes Blinken', kind: 'look',
      when: { all: [{ not: drohnenQuest }, { notFlag: 'kameradrohne_geborgen' }] },
      lines: [{ speaker: N, text: 'Halb im Schlick blinkt etwas rot: eine Kameradrohne mit NX-1-Aufkleber, ein Rotor ab. Irgendwer beim Sender vermisst die bestimmt. Oder ist froh, dass sie weg ist.' }],
    },
    {
      id: 'hundespuren', at: S.hundespuren, radius: 56, label: 'Spuren im Schlick', kind: 'look', once: true,
      when: { not: hundeGeloest },
      lines: [
        { speaker: N, text: 'Pfotenabdrücke im Schlick. Zu tief für Hunde aus Fleisch, zu gleichmäßig für Panik. Dazwischen Schleifspuren: Hier wurde ein ganzes Fischernetz weggezerrt.' },
        { speaker: N, text: 'Die Spur führt nach rechts, zu der Bretterbude mit den Netzen. Nachts, sagt man, leuchten dort Augen. Viele.' },
      ],
      effects: [{ setFlag: 'hundespuren_gefunden' }, { markSeen: 'flutmauer-hundespuren' }],
    },
    {
      id: 'alpha-hund', at: [1340, 735], radius: 64, label: 'Alpha umprogrammieren', kind: 'check', check: 'gc-81', once: true,
      when: { all: [hundeQuest, { flag: 'hundespuren_gefunden' }] }, hideWhen: hundeGeloest,
      lines: [{ speaker: N, text: 'Der Alpha liegt auf einem Haufen geklauter Netze, ein ausgemusterter Quantum-Wachhund mit verbeultem Kopf. Er knurrt, aber sein Schwanz-Servo wedelt verräterisch. Hinterm Ohr: eine offene Wartungsbuchse.' }],
      altText: 'Quantum-Code, dreifach verschlüsselt und schlecht kommentiert. Ohne mehr Technik bleibt: kämpfen, oder Henk fünf Ersatzteile bringen und der Spur zu Dexters Halde folgen.',
      effects: [
        { setFlag: 'bolzen_umprogrammiert' }, { xp: 40 },
        { message: 'Ein letzter Piepton, dann setzt sich der Alpha hin und legt dir ein Netz vor die Füße. Das Rudel trägt die anderen zu Henk. Der große Hund bleibt bei dir. Sieht aus, als hätte er einen Namen gefunden: Bolzen.' },
      ],
    },
    {
      id: 'schlickstrand', at: S.schlickstrand, radius: 56, label: 'Schlickstrand', kind: 'look',
      lines: [{ speaker: N, text: 'Ein Streifen festerer Schlick, auf dem Kinder manchmal mit Stöcken nach Kronkorken stochern. Mit einem Metalldetektor wäre das hier ein Goldstrand. Ein ziemlich hässlicher.' }],
    },
    {
      id: 'bootsrampe', at: [1120, 520], radius: 50, label: 'Bootsrampe', kind: 'look',
      lines: [{ speaker: N, text: 'Eine Rampe, die zu einer Mauer ohne Tür führt. Die Winde daneben hat zuletzt ein Boot gezogen, als es noch Fische gab, die sich das gefallen ließen.' }],
    },
    {
      id: 'kutter-links', at: [160, 760], radius: 50, label: 'Gestrandeter Kutter', kind: 'look',
      lines: [{ speaker: N, text: 'Ein Fischkutter auf der Seite, blaue Farbe, Rost wie Sommersprossen. Am Bug steht noch ein Name, den das Salz unlesbar gefressen hat. Das Boot liegt hier wie jemand, der auf den Bus wartet, der nie kommt.' }],
    },
    // --- Sammelobjekte ---------------------------------------------------------------------------------------------
    {
      id: 'glueckstern-19', at: [40, 350], radius: 60, label: 'Etwas glitzert am Geländer', kind: 'loot', once: true,
      lines: [{ speaker: N, text: 'Zwischen Geländerpfosten und Turmfuß klemmt ein Glücksstern, festgefroren in Möwenkacke. Glück hat seinen Preis.' }],
      effects: [{ give: 'glueckstern-19' }],
    },
    {
      id: 'glueckstern-20', at: [1000, 790], radius: 44, label: 'Glitzern unterm Kutter', kind: 'loot', once: true,
      lines: [{ speaker: N, text: 'Unter dem Heck des Kutters, wo der Schlick trocken ist, liegt ein Glücksstern. Der Kutter hatte offensichtlich keinen.' }],
      effects: [{ give: 'glueckstern-20' }],
    },
    {
      id: 'neon-tag-11', at: [905, 232], radius: 44, label: 'Kleines Leuchtzeichen', kind: 'loot', once: true,
      lines: [{ speaker: N, text: 'Unten an der Wand, kaum handgroß, leuchtet ein Neon-Tag zwischen den großen Bildern. Jemand wollte nicht laut sein, nur da.' }],
      effects: [{ give: 'neon-tag-11' }],
    },
    {
      id: 'neon-tag-12', at: [600, 584], radius: 44, label: 'Leuchtzeichen an der Mauer', kind: 'loot', once: true,
      lines: [{ speaker: N, text: 'Am Fuß der Flutmauer, zwischen Seepocken, leuchtet ein Neon-Tag. Wer das gesprüht hat, stand bis zu den Knien im Schlick. Respekt.' }],
      effects: [{ give: 'neon-tag-12' }],
    },
    {
      id: 'flaschenpost-05', at: [1125, 470], radius: 44, label: 'Flasche in der Rampe', kind: 'loot', once: true,
      lines: [{ speaker: N, text: 'Zwischen den Gitterrosten der Bootsrampe klemmt eine grüne Flasche mit Korken. Innen ein Zettel, eng beschrieben, mit einer gezeichneten Insel und einer Boje.' }],
      effects: [{ give: 'flaschenpost-05' }],
    },
    {
      id: 'jimmy-spur-08', at: [1385, 300], radius: 46, label: 'Ölfass-Türmchen', kind: 'loot', once: true,
      lines: [{ speaker: N, text: 'Auf dem obersten Ölfass: ein Kronkorken-Smiley, sorgfältig gelegt, wie Jimmy es überall macht. Darunter ein Zettel mit seiner krakeligen Schrift.' }],
      effects: [{ give: 'jimmy-spur-08' }],
    },
  ],
  encounters: [
    {
      id: 'rudel-brackbucht', encounter: 'enc-bucht-hunde', at: S.hunderudel, sprite: 'robohund-walk', radius: 60,
      patrol: [[1265, 765], [1120, 800], [1240, 610]],
      when: { all: [hundeQuest, { not: hundeGeloest }] },
      avoid: rudelUmgehen,
    },
  ],
  lights: [
    { at: [140, 95], radius: 230, color: '#ffd27a', intensity: 0.9, slots: ['abend', 'nacht'] },
    { at: [165, 320], radius: 90, color: '#ffb35c', intensity: 0.7, slots: ['abend', 'nacht'] },
    { at: [310, 235], radius: 80, color: '#ffc46b', intensity: 0.6, slots: ['abend', 'nacht'] },
    { at: [455, 75], radius: 140, color: '#ff3fa4', intensity: 0.6, slots: ['abend', 'nacht'] },
    { at: [1022, 50], radius: 120, color: '#ff3fa4', intensity: 0.5, slots: ['abend', 'nacht'] },
    { at: [665, 110], radius: 110, color: '#33e6ff', intensity: 0.55, slots: ['abend', 'nacht'] },
    { at: [825, 110], radius: 110, color: '#33e6ff', intensity: 0.55, slots: ['abend', 'nacht'] },
    { at: [1150, 160], radius: 260, color: '#b45cff', intensity: 0.35, slots: ['nacht'] },
    { at: [604, 722], radius: 50, color: '#ff2a3a', intensity: 0.7, slots: ['abend', 'nacht'] },
    { at: [720, 830], radius: 180, color: '#4dff9a', intensity: 0.6, slots: ['nacht'] },
    { at: [300, 830], radius: 140, color: '#4dff9a', intensity: 0.4, slots: ['nacht'] },
    { at: [1505, 220], radius: 90, color: '#ffd27a', intensity: 0.5, slots: ['abend', 'nacht'] },
  ],
  ambient: {
    count: 7,
    bySlot: { morgen: 4, tag: 8, abend: 8, nacht: 3 },
    sprites: [
      'passant-tourist-walk', 'passant-oma-walk', 'passant-arbeiterin-walk', 'passant-punk-walk',
      'passant-kurier-walk', 'passant-schrotti-walk', 'passant-anzug-walk',
    ],
    routes: [
      [[745, 30], [745, 250], [500, 300], [256, 355]],
      [[256, 354], [700, 280], [1000, 270], [1340, 300]],
      [[1340, 260], [1000, 250], [760, 230], [745, 40]],
      [[860, 330], [600, 330], [470, 380], [467, 590], [700, 680], [1000, 610]],
      [[1150, 600], [800, 700], [420, 650], [330, 780]],
      [[1200, 330], [880, 300], [560, 280]],
    ],
    barks: [
      { text: 'Das Meer gibt es wirklich? Dann will ich mein Geld zurück für die Postkarte.' },
      { text: 'Die Flutmauer hält. Meistens.' },
      { text: 'Nebelhorn sagt, die Fähre fährt wieder, sobald das Meer pünktlich ist.', when: { act: 2 } },
      { text: 'Ich hab eine Muschel gefunden. Sie hat „Hallo“ gesagt. Oder das war Karl.', when: { act: 3 } },
      { text: 'Scheißmöwe! Die hat meinen Köder gefressen. Und meinen Hotdog. Und meine Würde.' },
      { text: 'Ich werf jeden Tag ’ne Flaschenpost rein. Zurück kam bisher nur eine. Meine eigene.' },
      { text: 'Verpiss dich vom Fernrohr, Kumpel. Das ist mein Meer, ich hab dafür bezahlt.' },
      { text: 'Henk sagt, der Leuchtturm leuchtet nur noch für ihn. Und für Leute, die zu besoffen für die Rampe sind.' },
      { text: 'Die Schwarzhaarige rennt hier Runden, als würd sie vor wem abhauen. Oder hinter wem her.', when: { all: [{ time: 'morgen' }, { weekday: ['di', 'do'] }] } },
      { text: 'Nicht hingucken. Die zwei auf der Bank knutschen seit Sonnenuntergang. Respekt eigentlich.', when: { time: ['abend', 'nacht'] } },
      { text: 'Siehst du das Grüne im Schlick? Entweder Leuchtalgen, oder ich hab wieder Kanalwasser getrunken.', when: nacht },
      { text: 'Da unten leuchten Augen. Viele. Ich geh jetzt sehr unauffällig sehr schnell.', when: { all: [nacht, { not: hundeGeloest }] } },
      { text: 'Die Robohunde haben mir ’n Netz geklaut. Und ’nen Schuh. Den linken. Was wollen die mit ’nem linken Schuh?', when: { not: hundeGeloest } },
      { text: 'Seit die Robohunde Ruhe geben, klauen nur noch die Möwen. Die sind wenigstens ehrlich dabei.', when: hundeGeloest },
      { text: 'Hast du die Wand gesehen? Da ist ein neues Bild. Wer malt denn sowas Schönes in so ’ner Drecksgegend?', when: { flag: 'wand_gesprueht' } },
      { text: 'Heute schmeckt die Luft nach Salz und Montag.', when: { time: 'morgen' } },
    ],
  },
  ambience: 'meer',
  music: 'flutmauer',
  shelter: { entry: 'aufwachen', when: { hearts: 'henk-angler', min: 3 } },
  onEnter: [
    { id: 'flutmauer-erstbesuch', once: true, dialogue: 'flutmauer-ankunft', effects: [{ markSeen: 'flutmauer-betreten' }] },
    {
      id: 'flutmauer-aria-abend', once: true, when: { all: [ariaDabei, { time: 'abend' }, { seen: 'flutmauer-betreten' }] },
      dialogue: 'flutmauer-aria-abend',
    },
  ],
};

// --- Dialoge -------------------------------------------------------------------------------------------------------
const dialogues: NonNullable<ContentPart['dialogues']> = {
  'flutmauer-ankunft': {
    id: 'flutmauer-ankunft',
    start: 'a',
    nodes: [{
      id: 'a',
      lines: [
        { speaker: N, text: 'Die Rampe spuckt dich auf die Flutmauer: zwanzig Meter Beton zwischen der Stadt und allem, was nass ist. Oben ein Spazierweg mit rostigem Geländer, links ein Leuchtturm, der aussieht wie ein Lolli mit Alkoholproblem.' },
        { speaker: N, text: 'Unten die Brackbucht, grauer Schlick, gestrandete Kutter, ein Blinken im Dreck. Und dahinter, im Dunst, wirklich und wahrhaftig: das Meer. Es riecht nach Salz, Diesel und einer Freiheit, die keiner hier bezahlen kann.' },
      ],
    }],
  },
  'flutmauer-aussicht': {
    id: 'flutmauer-aussicht',
    start: 'a',
    nodes: [
      {
        id: 'a',
        lines: [{ speaker: N, text: 'Eine Wendeltreppe aus Gusseisen, hundertzwölf Stufen, jede quietscht in einer anderen Tonart. Henk hat die Tür offen gelassen. Henk lässt immer die Tür offen, nur nicht für Fremde, die pennen wollen.' }],
        choices: [
          { text: 'Hochsteigen.', next: 'oben', when: { not: { seen: 'aussicht-leuchtturm-oben' } } },
          { text: 'Nochmal hoch, nur gucken.', next: 'nochmal', when: { seen: 'aussicht-leuchtturm-oben' } },
          { text: 'Lieber unten bleiben.' },
        ],
      },
      {
        id: 'oben',
        lines: [
          { speaker: N, text: 'Oben pfeift der Wind durch die Galerie. Unter dir die ganze Küste: die Brackbucht, die Kutter, die Kräne der Hafenkante, die Neon-Gasse als rosa Fleck, und ganz hinten der Chrome Tower, der glänzt, als hätte er es nicht nötig.' },
          { speaker: N, text: 'Und auf der anderen Seite: Wasser bis zum Ende der Welt. Irgendwo da draußen, sagt die Flaschenpost, gibt es Sand, der nicht giftig ist. Von hier oben glaubst du es fast.' },
        ],
        effects: [{ markSeen: 'aussicht-leuchtturm-oben' }, { markSeen: 'aussicht-flutmauer' }, { xp: 20 }, { message: 'Aussichtspunkt entdeckt: Leuchtturm (+20 XP)' }],
      },
      {
        id: 'nochmal',
        lines: [{ speaker: N, text: 'Das Meer ist noch da. Die Stadt leider auch. Du bleibst eine Weile, bis der Wind dir das Hirn durchgepustet hat.' }],
        effects: [{ advanceTime: 15 }],
      },
    ],
  },
  'flutmauer-fernrohr': {
    id: 'flutmauer-fernrohr',
    start: 'a',
    nodes: [
      {
        id: 'a',
        lines: [{ speaker: N, text: 'Ein Münzfernrohr aus Messing, grünspanig, mit einem Schlitz für Münzen, die seit zwanzig Jahren keiner mehr prägt. Ein Kronkorken passt auch. Angeblich.' }],
        choices: [
          { text: 'Einen Credit-Chip reinfummeln (1 Cr).', next: 'blick', effects: [{ credits: -1 }] },
          { text: 'Mit der Faust draufhauen, wie es die Alten machen.', check: fernrohrHauen, next: 'blick' },
          { text: 'Lass gut sein.' },
        ],
      },
      {
        id: 'blick',
        lines: [
          { speaker: N, text: 'Klack. Das Bild springt scharf: graue Wellen, eine Boje mit einem Möwenhaufen drauf, und weit draußen, im Dunst, ein Streifen, der heller ist als der Rest. Sand vielleicht. Oder Hoffnung mit schlechter Auflösung.' },
          { speaker: N, text: 'Nach dreißig Sekunden klappt die Blende zu. Das Meer ist vorbei. Bitte zahlen Sie erneut, wenn Sie weiter träumen möchten.' },
        ],
        effects: [{ markSeen: 'fernblick-meer' }],
      },
    ],
  },
  'flutmauer-mauerziel': {
    id: 'flutmauer-mauerziel',
    start: 'a',
    nodes: [
      {
        id: 'a',
        lines: [{ speaker: N, text: 'Das Ende der Mauerkrone. Rechts der Laufsteg zu den Hallendächern, unter dir zwanzig Meter Beton, vor dir das Meer. Das Geländer ist warm vom Tag und klebrig vom Salz.' }],
        choices: [
          { text: 'Aufs Meer schauen.', next: 'meer' },
          { text: 'Die Stelle am Geländer ansehen.', next: 'erinnerung', when: { all: [ariaGekuesst, { not: vex }] } },
          { text: 'Die Stelle am Geländer ansehen.', next: 'erinnerung-vex', when: { all: [ariaGekuesst, vex] } },
          { text: 'Aria ans Geländer ziehen.', next: 'aria', when: { all: [ariaDabei, ariaGekuesst, { not: vex }] } },
          { text: '„Revanche, Stern? Wer zuerst die Schnallen aufhat.“', next: 'aria-vex', when: { all: [ariaDabei, ariaGekuesst, vex] } },
          { text: 'Einen Kronkorken ins Meer schnippen. Für Kas.', next: 'kas', when: { all: [vex, { flag: 'vexaria_luecke_gesprungen' }] } },
          { text: 'Weitergehen.' },
        ],
      },
      {
        id: 'meer',
        lines: [{ speaker: N, text: 'Der Wind riecht nach Salz und Diesel. Unten frisst die Flut den Schlick, Stück für Stück, ganz ohne Eile. Wer hier lange genug steht, merkt, wie klein die Stadt eigentlich ist. Und wie laut.' }],
      },
      {
        id: 'erinnerung',
        lines: [
          { speaker: N, text: 'Da, am Pfosten: Vier Kratzer im Lack, wo Arias Zerberster-Finger sich festgekrallt haben, während sie dich geküsst hat. Gezittert hat sie. Gesagt hat sie, es war der Wind.' },
          { speaker: N, text: 'Dein Mund erinnert sich an Salz und Kirschkaugummi. Dein Rücken an das Geländer. Du ertappst dich beim Grinsen wie ein Vollidiot.' },
        ],
      },
      {
        id: 'erinnerung-vex',
        lines: [
          { speaker: N, text: 'Vier frische Kratzer im Rost, genau da, wo Aria sich festgehalten hat, als sie zum zweiten Mal zugepackt hat. Länger. Ungeduldiger. Deine Metallhand hat das Geländer fast verbogen.' },
          { speaker: 'player', expr: 'verlegen', text: '… Halbwegs gut. Ich brauch mehr Daten.' },
          { speaker: N, text: 'Du sagst es zu niemandem. Dem Meer ist es egal. Den Möwen auch. Dein Herz hält trotzdem die Klappe nicht.' },
        ],
      },
      {
        id: 'aria',
        lines: [
          { speaker: 'aria', expr: 'verlegen', text: 'Hier? Echt jetzt? Da unten hockt Henk mit seinem Fernglas, und der Typ hat seit dreißig Jahren nix Spannenderes gesehen als ’ne Möwe.' },
          { speaker: N, text: 'Sie lässt sich trotzdem ziehen. Rücken ans Geländer, deine Hände an ihrer Jacke, ihre echte Hand flach auf deiner Brust, als wollte sie nachmessen, wie schnell da drin was klopft.' },
          { speaker: 'aria', expr: 'zaertlich', text: 'Scheiße, du bist warm. Komm her. Näher. Noch näher, ich beiß nicht. … Doch, tu ich.' },
          { speaker: N, text: 'Der Kuss ist nicht kurz und nicht vorsichtig. Er schmeckt nach Salz und Kirschkaugummi, und als sie dich in die Unterlippe beißt, lacht sie dir dabei in den Mund. Die Zerberster-Finger haken sich in deinen Gürtel und halten fest, als wäre das Geländer nicht genug.' },
          { speaker: 'aria', expr: 'signatur', text: 'Okay. Wir gehen jetzt. Sofort. Bevor ich hier oben was mach, wofür Kessel uns einsperren müsste.' },
        ],
        effects: [{ relation: 'aria', delta: 10 }],
      },
      {
        id: 'aria-vex',
        lines: [
          { speaker: 'aria', expr: 'freude', text: 'Revanche? Du hast die Schnallen-Wette letzte Nacht schon verloren, Postbotin. Elf. Ich hab mitgezählt.' },
          { speaker: 'player', expr: 'signatur', text: 'Zehn. Eine hast du abgerissen.' },
          { speaker: 'aria', expr: 'verlegen', text: 'Die zählt doppelt. Für Leidenschaft.' },
          { speaker: N, text: 'Sie schiebt dich rückwärts gegen das Geländer, genau an die Stelle mit den Kratzern. Ihre Metallfinger wandern die Gurtschnallen hoch, eine nach der anderen, ganz langsam, als würde sie ein Schloss knacken, das sie längst geknackt hat. Ihre echte Hand liegt warm in deinem Nacken.' },
          { speaker: 'player', expr: 'verlegen', text: 'Öffentlicher Ort, Stern.' },
          { speaker: 'aria', expr: 'zaertlich', text: 'Dann schau halt nicht hin. Ich schau nur dich an.' },
          { speaker: N, text: 'Sie küsst dich, bis die Möwen das Interesse verlieren. Deine echte Hand rutscht in ihre Zöpfe, die Metallhand hält das Geländer fest, und diesmal traust du ihr. Als ihr euch löst, ist dein Gurt drei Schnallen lockerer als vorher, und Aria grinst wie eine, die gerade einen Tresor ausgeräumt hat.' },
          { speaker: 'aria', expr: 'signatur', text: 'Drei. Auf dem Heimweg schaff ich den Rest. Lauf, Rennsemmel. Wer zuerst in der Bude ist, darf bestimmen.' },
        ],
        effects: [{ relation: 'aria', delta: 10 }],
      },
      {
        id: 'kas',
        lines: [
          { speaker: N, text: 'Der Kronkorken dreht sich im Gegenlicht, blitzt einmal und ist weg. Kein Platschen, das man hört. Nur Wind.' },
          { speaker: 'player', expr: 'zaertlich', text: 'Hey, Kas. Ich hab jetzt jemanden, der an der Kante wartet. Du hättest sie gemocht. Sie hätte dich verprügelt. Dann hättest du sie gemocht.' },
        ],
      },
    ],
  },
  'flutmauer-aria-abend': {
    id: 'flutmauer-aria-abend',
    start: 'a',
    nodes: [{
      id: 'a',
      lines: [
        { speaker: 'aria', expr: 'freude', text: 'Ey. Guck dir das an. Die Sonne geht im Smog unter wie ’n Spiegelei in der Pfanne. Kitschig. Ich hasse es. Ich bleib hier stehen, bis sie weg ist.' },
        { speaker: 'aria', expr: 'neutral', text: 'Von den Dächern aus bis hierher, das wär ’ne Strecke. Neon-Gasse, Hafenkante, Mauer. Ich wette, ich wär schneller als du. Irgendwann rennen wir das.' },
      ],
    }],
  },
};

export const part: ContentPart = {
  maps: { [flutmauer.id]: flutmauer },
  districts: {
    kueste: { id: 'kueste', name: 'Küste', ambience: 'meer', music: 'flutmauer' },
  },
  dialogues,
};
