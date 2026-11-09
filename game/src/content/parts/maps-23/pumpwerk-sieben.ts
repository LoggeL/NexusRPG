// Pumpwerk Sieben (world.md §3.5, §3.8/§3.9, §5.3 main-2-kanal, §8.7, §10.4/§10.7; Plan design/plan/act23.json,
// Paket pkg-kanal-tief). Zone 1536×1024, gemalte Draufsicht (bg-pumpwerk-sieben, Variante bg-pumpwerk-sieben-op
// solange main-2-kanal läuft: OP-Nische beleuchtet).
// Aufbau: Oben drei Pumpenräder in ihren Gruben, rechts daneben der Ventilstand; davor der obere Laufsteg. Rechts oben
// die Quantum-Außenstelle (weiße Container), nur durch die Engstelle (kanalvolk-sperre) zu erreichen. Mitte: offener
// Hauptschacht, überquert von der Rohrbrücke. Links der Gitterboden mit dem Tunnel West (Rückweg Kanal-Sammler).
// Unten der Laufsteg Süd mit OP-Nische (links unten), Kabelmolch-Nest (Mitte unten), alter Hilfspumpe und dem
// Überlaufrohr zur Hafenkante (rechts unten, erst nach dem Handrad offen, Flag ueberlaufrohr_offen).
// Quest-Hotspots von main-2-kanal (op-nische, Kanalvolk-Sperre), pers-delya-quelle, prep-gegenmittel, job-* und
// sonder-pumpwerk-pegel legen die Quest-Pakete per mapAdditions an (Spots unten); die Zone hält nur Welt-Hotspots.
import type { CheckDef, Condition, DialogueDef, EncounterDef, MapDef, Point, Polygon, Rect } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const N = 'narrator';
const P = 'player';
const box = ([x, y, w, h]: Rect): Polygon => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];

/** Benannte Punkte (Plan-IDs, exakt wie in act23.json). */
const S = {
  'tunnel-west': [60, 530],
  'pumpenrad-1': [265, 320],
  'pumpenrad-2': [470, 320],
  'pumpenrad-3': [840, 320],
  'ventil-stand': [1085, 268],
  gitterboden: [190, 560],
  'quantum-aussenstelle': [1440, 300],
  'aussenstelle-terminal': [1385, 290],
  'op-nische': [270, 830],
  'kanalvolk-sperre': [1205, 320],
  'molch-nest': [630, 880],
  rohrbruecke: [560, 520],
  'schlafwandler-pumpe': [1170, 880],
  ueberlaufrohr: [1295, 860],
  'auftrag-a': [190, 720],
} satisfies Record<string, Point>;

// --- Bedingungen ---------------------------------------------------------------------------------------------------
const KANAL_AKTIV: Condition = { quest: 'main-2-kanal', state: 'active' };
const KANAL_DONE: Condition = { quest: 'main-2-kanal', state: 'done' };
const DRUCK_WEG: Condition = { flag: 'pumpwerk_druck_abgelassen' };
const ROHR_OFFEN: Condition = { flag: 'ueberlaufrohr_offen' };
/** prep-fluchtweg (quest-main-b): Das Kanalvolk hilft, sobald der Fluchtweg gesichert ist. */
const KANALVOLK_HILFT: Condition = { any: [{ flag: 'fluchtweg_gesichert' }, { quest: 'prep-fluchtweg', state: 'done' }] };
const CONTAINER_OFFEN: Condition = { flag: 'aussenstelle_offen' };
const ROSTLAUBE_PUMPE: Condition = {
  all: [
    { quest: 'side-rostlaube', state: 'active' }, { noItem: 'rostlaube-kuehlerpumpe' }, { notFlag: 'rostlaube_eingebaut' },
    { notFlag: 'pumpwerk_kuehlerpumpe_ausgebaut' },
  ],
};
const MOLCHE_WEG: Condition = { won: 'enc-pumpwerk-molchnest' };
const AKT2: Condition = { all: [{ act: 2 }, { not: { act: 3 } }] };
const EPILOG: Condition = { flag: 'epilog' };

// --- Eingebettete Welt-Checks (world.md nennt hier keine gc-ID) -----------------------------------------------------
const ventilLesen: CheckDef = {
  id: 'pumpwerk-ventil-lesen', attribute: 'technik', threshold: 6, tags: ['maschine', 'welt'], label: '[Technik 6]',
};
const handradKraft: CheckDef = {
  id: 'pumpwerk-handrad-kraft', attribute: 'koerper', threshold: 8, tags: ['kraft', 'welt'], label: '[Körper 8]',
};
const containerKurzschluss: CheckDef = {
  id: 'pumpwerk-container-kurzschluss', attribute: 'technik', threshold: 7, tags: ['hacken', 'schloss', 'welt'], label: '[Technik 7]',
};
const containerBluff: CheckDef = {
  id: 'pumpwerk-container-bluff', attribute: 'ausstrahlung', threshold: 6, tags: ['bluff', 'luegen'], faction: 'quantum',
  label: '[Ausstrahlung 6]',
};
const pumpeAusbau: CheckDef = {
  id: 'pumpwerk-kuehlerpumpe-ausbau', attribute: 'technik', threshold: 5, tags: ['maschine', 'reparieren', 'welt'], label: '[Technik 5]',
};
/** „Kurzschluss“ macht Kabelmolche zahm (world.md §8.4). */
const molchKurzschluss: CheckDef = {
  id: 'pumpwerk-molch-kurzschluss', attribute: 'technik', threshold: 6, tags: ['maschine', 'tiere', 'welt'], label: '[Technik 6]',
};

// --- Begegnung: Kabelmolch-Nest (feste Gruppe, umgehbar) ------------------------------------------------------------
const molchnest: EncounterDef = {
  id: 'enc-pumpwerk-molchnest',
  name: 'Pumpwerk Sieben: Kabelmolch-Nest',
  arena: 'arena-rohre',
  enemies: [{ enemy: 'kabelmolch', count: 2 }, { enemy: 'kanalratte' }],
  when: { act: 2 },
  intro: [
    { speaker: N, text: 'Das Nest glitzert. Dann glitzert es zurück. Zwei Kabelmolche heben die Köpfe, die Haut voller Funken, die Zungen voller Strom.' },
    { speaker: N, text: 'Tipp: Kabelmolche sind gegen Strom immun. Kurzschluss-Hacks machen sie zahm, alles mit Klinge macht sie wütend.' },
  ],
  reward: { xp: 70, items: { 'schrott-ersatzteil': 2 } },
  onWin: [{ message: 'Die Molche verkriechen sich zischend in die Rohre. Im Nest glitzert es weiter. Diesmal ohne Zähne.' }],
};

// --- Dialoge der Zone -----------------------------------------------------------------------------------------------
const ventilMinigame = (level: number) => ({
  minigame: 'akt-ventil' as const, level, key: 'pumpwerk-ventil', label: 'Ventilrätsel: Druck aus dem Überlaufrohr ablassen',
  win: [
    { setFlag: 'pumpwerk_druck_abgelassen' }, { rep: 'kanalvolk', delta: 3 }, { xp: 40 },
    { message: 'Es zischt, es gurgelt, ganz hinten im Überlaufrohr seufzt etwas erleichtert. Das Handrad sollte jetzt nachgeben.' },
  ],
  lose: [{ damage: 2 }, { message: 'Ein Rohr spuckt dir rostige Brühe ins Gesicht. Die Nadeln zittern vor Lachen. Nochmal.' }],
});

const dialogues: Record<string, DialogueDef> = {
  'pumpwerk-ankunft': {
    id: 'pumpwerk-ankunft',
    start: 'start',
    nodes: [{
      id: 'start',
      lines: [
        { speaker: N, text: 'Pumpwerk Sieben. Eine Halle so groß, dass dein Echo erst nach Feierabend zurückkommt.' },
        { speaker: N, text: 'Drei Pumpenräder, jedes so hoch wie ein Wohnblock, stehen still in ihren Gruben. Notlicht in Rot. Es riecht nach Rost, Altöl und nach einer Entscheidung, die du gleich bereuen wirst.' },
        { speaker: N, text: 'Und mittendrin, blitzsauber und völlig fehl am Platz: weiße Container mit Quantum-Logo. Wie ein Brautkleid in der Jauchegrube.' },
        { speaker: P, text: 'Gemütlich. Wenn man auf Horrorfilme steht. Und auf Tetanus.' },
      ],
    }],
  },

  'pumpwerk-ventilstand': {
    id: 'pumpwerk-ventilstand',
    start: 'start',
    nodes: [
      {
        id: 'start',
        lines: [{ speaker: N, text: 'Der Ventilstand: zwölf Handräder, sieben Manometer, ein Hebel mit eingeritztem Totenkopf. Sehr beruhigend. Danke, unbekannter Pumpwart.' }],
        choices: [
          { text: 'Auf die Nadeln schauen.', when: { not: DRUCK_WEG }, next: 'druck' },
          { text: 'Den Nadeln beim Ruhigsein zusehen.', when: DRUCK_WEG, next: 'ruhig' },
          { text: 'Das Logbuch am Haken durchblättern.', next: 'logbuch' },
          { text: 'Finger weg. Das Ding sieht aus, als hätte es schon Leute gefressen.' },
        ],
      },
      {
        id: 'druck',
        lines: [
          { speaker: N, text: 'Drei Nadeln stehen tief im Roten. Irgendwo im Überlaufrohr staut sich der Druck wie Wut bei einem Rentner an der Supermarktkasse.' },
          { speaker: N, text: 'Solange das so bleibt, rührt sich das Handrad da hinten keinen Millimeter. Wer hier richtig dreht, kriegt es auf. Wer falsch dreht, kriegt eine Dusche.' },
        ],
        choices: [
          { text: 'Erst die Leitungen verfolgen, dann drehen.', check: ventilLesen, next: 'gelesen' },
          { text: 'Nach Gefühl drehen. Was soll schon passieren.', next: 'gefuehl' },
          { text: 'Lieber nicht.' },
        ],
      },
      {
        id: 'gelesen',
        lines: [
          { speaker: N, text: 'Du fährst mit dem Finger die Rohre entlang. Rad vier speist Pumpe zwei, Rad neun ist nur Deko, Rad zwölf ist mit Kaugummi festgeklebt. Plötzlich ergibt der Wahnsinn ein Muster.' },
          { speaker: P, text: 'Ha. Wer das gebaut hat, war ein Arschloch. Aber ein ordentliches Arschloch.' },
        ],
        effects: [ventilMinigame(2)],
      },
      {
        id: 'gefuehl',
        lines: [{ speaker: N, text: 'Du spuckst in die Hände, packst das erstbeste Rad und hörst ganz tief in die Rohre hinein. Die Rohre hören zurück.' }],
        effects: [ventilMinigame(3)],
      },
      {
        id: 'ruhig',
        lines: [{ speaker: N, text: 'Alle Nadeln im Grünen. Pumpe zwei brummt zufrieden. Irgendwo im Kanalvolk lobt dich gerade jemand, ohne deinen Namen zu kennen.' }],
      },
      {
        id: 'logbuch',
        lines: [
          { speaker: N, text: 'Ein Klemmbrett, aufgequollen vom Dampf. Die letzten Einträge in krakeliger Schrift:' },
          { speaker: N, text: '„14.03.79: Pumpe 2 quietscht wieder. Ich nenne sie jetzt Gisela.“ · „02.04.79: Gisela hat einen Molch gefressen. Er hat überlebt. Gisela nicht beeindruckt.“' },
          { speaker: N, text: '„11.06.79: Quantum hat das Werk gekauft. Die schicken einen Container. Mit Kaffeemaschine. Für mich ist keiner drin.“ · „12.06.79: Ich kündige.“' },
          { speaker: N, text: 'Ganz hinten im Klemmbrett klemmt etwas Hartes. Ein Datenwürfel, sorgfältig versteckt – oder vergessen.' },
        ],
      },
    ],
  },

  'pumpwerk-handrad': {
    id: 'pumpwerk-handrad',
    start: 'start',
    nodes: [
      {
        id: 'start',
        lines: [
          { speaker: N, text: 'Das Überlaufrohr: so dick wie ein Haus, verschlossen mit einem Rundgitter und einem Handrad, an dem man einen Lastwagen aufhängen könnte.' },
          { speaker: N, text: 'Durchs Gitter zieht es kalt herein. Es riecht nach Salz, Diesel und Möwenkacke. Nach Hafen. Nach Freiheit, sozusagen.' },
        ],
        choices: [
          { text: 'Drehen. Jetzt, wo kein Druck mehr draufliegt.', when: DRUCK_WEG, next: 'auf', effects: [{ setFlag: 'ueberlaufrohr_offen' }] },
          {
            text: 'Zweimal kurz pfeifen. Das Kanalvolk schuldet dir einen Gefallen.', tag: '[Kanalvolk]',
            when: { all: [KANALVOLK_HILFT, { not: DRUCK_WEG }] }, next: 'kanalvolk',
            effects: [{ setFlag: 'ueberlaufrohr_offen' }, { rep: 'kanalvolk', delta: 2 }],
          },
          {
            text: 'Öl in die Spindel kippen, warten, dann mit Hebel ziehen.', when: { not: DRUCK_WEG },
            requires: { item: 'oelkaennchen' }, next: 'oel', effects: [{ advanceTime: 30 }, { setFlag: 'ueberlaufrohr_offen' }],
          },
          {
            text: 'Mit roher Gewalt dagegenstemmen.', when: { not: DRUCK_WEG }, check: handradKraft, next: 'kraft',
            effects: [{ damage: 4 }, { setFlag: 'ueberlaufrohr_offen' }],
          },
          { text: 'Dran rütteln.', when: { not: DRUCK_WEG }, next: 'klemmt' },
          { text: 'Lassen.' },
        ],
      },
      {
        id: 'auf',
        lines: [
          { speaker: N, text: 'Das Rad dreht sich so leicht, als hätte es nur darauf gewartet, dass endlich mal jemand nett fragt. Das Gitter schwingt auf.' },
          { speaker: N, text: 'Dahinter: ein endloses Rohr, Rinnsal am Boden, ganz am Ende ein Fleck Hafenlicht. Ab jetzt ist das hier ein Weg. In beide Richtungen.' },
        ],
      },
      {
        id: 'kanalvolk',
        lines: [
          { speaker: N, text: 'Aus dem Dunkel tauchen vier Stirnlampen auf. Dann vier Leute vom Kanalvolk, ein Brecheisen, ein Seil und ein Lied über einen Wal, der sich verlaufen hat.' },
          { speaker: N, text: 'Sie hängen sich zu viert ans Rad und singen im Takt. Beim dritten Refrain gibt das Rad nach. Beim vierten das Gitter. Beim fünften fängt einer an zu weinen. Wegen des Wals.' },
          { speaker: P, text: 'Danke, Leute. Ich schulde euch ein Bier. Oder vier. Oder einen Wal.' },
        ],
      },
      {
        id: 'oel',
        lines: [
          { speaker: N, text: 'Du gießt das halbe Kännchen in die Spindel und wartest. Das Öl kriecht, du wartest, eine Ratte schaut zu und wartet auch.' },
          { speaker: N, text: 'Dann ein Rohrstück als Hebel, ein Ruck – und das Rad knirscht herum wie ein Großvater, der aus dem Sessel aufsteht. Das Gitter ist offen.' },
        ],
      },
      {
        id: 'kraft',
        lines: [
          { speaker: N, text: 'Du stemmst die Füße gegen das Rohr, packst die Speichen und ziehst, bis dir Sterne vor den Augen tanzen. Das Rad stöhnt. Du stöhnst lauter.' },
          { speaker: N, text: 'Mit einem Knall gibt es nach, und eine Druckwelle aus Brackwasser haut dich auf den Hintern. Das Gitter steht offen. Deine Würde nicht ganz.' },
        ],
      },
      {
        id: 'klemmt',
        lines: [
          { speaker: N, text: 'Nichts. Nicht mal ein Knarzen. Hinter dem Gitter drückt das Wasser so stur dagegen wie ein Türsteher am Samstag.' },
          { speaker: N, text: 'Am Ventilstand oben könnte man den Druck ablassen. Oder du findest Leute mit mehr Armen als du. Das Kanalvolk zum Beispiel.' },
        ],
      },
    ],
  },

  'pumpwerk-container': {
    id: 'pumpwerk-container',
    start: 'start',
    nodes: [
      {
        id: 'start',
        lines: [
          { speaker: N, text: 'Drei weiße Container, Kanten gerundet, poliert bis zum Erbrechen. Auf der Tür ein Quantum-Logo und ein Kartenleser, der dich mit einem roten Auge anstarrt.' },
          { speaker: N, text: 'Durchs Bullauge: Regale voller Chips in Folie, ein Kühlschrank mit Proben und eine Kaffeemaschine, die mehr gekostet hat als dein ganzes Leben.' },
          { speaker: N, text: 'Drinnen sitzt eine Technikerin im Overall und rührt in einer Tasse. Sie sieht aus, als hätte sie seit drei Wochen kein Tageslicht gesehen. Weil sie seit drei Wochen kein Tageslicht gesehen hat.' },
        ],
        choices: [
          { text: 'Den Kartenleser kurzschließen.', check: containerKurzschluss, next: 'kurzschluss', effects: [{ setFlag: 'aussenstelle_offen' }] },
          {
            text: 'Dietrich-Chip in den Schlitz und hoffen.', requires: { item: 'dietrich-chip' }, next: 'dietrich',
            effects: [{ take: 'dietrich-chip' }, { setFlag: 'aussenstelle_offen' }],
          },
          { text: 'Klopfen: „Wartung! Ihr Filter muss getauscht werden!“', check: containerBluff, next: 'bluff', effects: [{ setFlag: 'aussenstelle_offen' }] },
          {
            text: 'Klopfen und einen Kaffee spendieren. Also, das Geld dafür.', requires: { credits: 60 }, next: 'kaffee',
            effects: [{ credits: -60 }, { setFlag: 'aussenstelle_offen' }],
          },
          { text: 'Das Terminal draußen steuert bestimmt die Tür.', next: 'terminal' },
          { text: 'Gehen.' },
        ],
      },
      {
        id: 'kurzschluss',
        lines: [
          { speaker: N, text: 'Zwei Drähte, ein Kaugummipapier, ein beherzter Stoß. Der Kartenleser blinkt grün, rot, grün, dann gibt er auf und klickt.' },
          { speaker: N, text: 'Die Technikerin blickt nicht mal hoch. „Wenn du was klaust, nimm bitte nicht meinen Joghurt.“' },
        ],
      },
      {
        id: 'dietrich',
        lines: [{ speaker: N, text: 'Der Chip surrt, der Leser seufzt, die Tür springt auf. Die Technikerin seufzt auch. „Schon wieder. Ich schreib das nicht mehr ins Protokoll. Das Protokoll hasst mich eh.“' }],
      },
      {
        id: 'bluff',
        lines: [
          { speaker: N, text: 'Die Tür geht auf. „Endlich! Ich hab vor drei Wochen angerufen!“ Sie drückt dir einen Filter in die Hand, der aussieht wie ein gebrauchter Kaffeefilter. Er ist ein gebrauchter Kaffeefilter.' },
          { speaker: N, text: '„Mach, was du machen musst. Ich geh rauchen. Seit drei Wochen.“ Sie verschwindet Richtung Engstelle.' },
          { speaker: P, text: 'Wartung. Klar. Ich warte. Auf nichts Bestimmtes.' },
        ],
      },
      {
        id: 'kaffee',
        lines: [
          { speaker: N, text: 'Du klopfst und wedelst mit den Credits. Die Technikerin öffnet einen Spalt, guckt auf das Geld, guckt auf dich, guckt wieder aufs Geld.' },
          { speaker: N, text: '„Für sechzig Credits darfst du dich zehn Minuten umsehen, und ich hab dich nie gesehen. Ich hab hier unten eh seit Wochen niemanden gesehen. Nicht mal mich selbst.“' },
        ],
      },
      {
        id: 'terminal',
        lines: [{ speaker: N, text: 'Links neben dem Container hängt ein Terminal mit leuchtendem Bildschirm. Ein Kabel führt direkt ins Türschloss. Wer hacken kann, braucht keinen Schlüssel.' }],
      },
    ],
  },

  'pumpwerk-hilfspumpe': {
    id: 'pumpwerk-hilfspumpe',
    start: 'start',
    nodes: [
      {
        id: 'start',
        lines: [{ speaker: N, text: 'Eine kleine Hilfspumpe mit Kurbel, neben ihren riesigen Schwestern ein Zwerg. An der Seite hängt ein verschraubter Block mit zwei Schlauchstutzen.' }],
        choices: [
          { text: 'Moment. Das ist eine Kühlerpumpe. Die passt in die Rostlaube!', when: ROSTLAUBE_PUMPE, next: 'kuehler' },
          { text: 'Kurbeln.', next: 'kurbeln' },
          { text: 'Weitergehen.' },
        ],
      },
      {
        id: 'kuehler',
        lines: [{ speaker: N, text: 'Gleiches Modell wie in Nebelhorns Kombi, nur dreckiger. Vier Schrauben, zwei Schläuche, ein Flansch voller Rost. Kann man ausbauen. Muss man nur wollen.' }],
        choices: [
          {
            text: 'Sauber ausbauen: Schläuche ab, Flansch lösen, fertig.', check: pumpeAusbau, next: 'sauber',
            effects: [{ give: 'rostlaube-kuehlerpumpe' }, { setFlag: 'pumpwerk_kuehlerpumpe_ausgebaut' }],
          },
          {
            text: 'Mit Schraubenschlüssel und viel Gefühl. Also ohne Gefühl.', next: 'brachial',
            effects: [{ advanceTime: 45 }, { damage: 3 }, { give: 'rostlaube-kuehlerpumpe' }, { setFlag: 'pumpwerk_kuehlerpumpe_ausgebaut' }],
          },
          { text: 'Später.' },
        ],
      },
      {
        id: 'sauber',
        lines: [{ speaker: N, text: 'Ein paar Handgriffe, und die Pumpe liegt in deinen Armen wie ein frisch geborenes Ersatzteil. Käpt’n Nebelhorn wird weinen. Vor Freude, hoffentlich.' }],
      },
      {
        id: 'brachial',
        lines: [
          { speaker: N, text: 'Eine Dreiviertelstunde, zwei abgerutschte Schlüssel und ein Fluch, bei dem eine Ratte errötet. Dann hast du das Ding draußen.' },
          { speaker: N, text: 'Dein Daumen ist blau, die Pumpe heil. Prioritäten.' },
        ],
      },
      {
        id: 'kurbeln',
        lines: [
          { speaker: N, text: 'Die Kurbel quietscht, die Pumpe röchelt, aus dem Auslass flutscht eine Gummiente. Sie landet vor deinen Füßen und guckt vorwurfsvoll.' },
          { speaker: P, text: 'Was? Ich hab dich nicht da reingesteckt.' },
        ],
      },
    ],
  },
};

// --- Karte ------------------------------------------------------------------------------------------------------------
const pumpwerk: MapDef = {
  id: 'pumpwerk-sieben',
  name: 'Pumpwerk Sieben',
  subtitle: 'Kanalisation',
  size: [1536, 1024],
  district: 'kanalisation',
  lighting: 'underground',
  bg: 'bg-pumpwerk-sieben',
  bgVariants: [{ when: KANAL_AKTIV, bg: 'bg-pumpwerk-sieben-op' }],
  walk: [
    box([0, 480, 85, 100]), // Tunnel West
    box([80, 285, 1095, 65]), // oberer Laufsteg vor den Pumpenrädern
    box([1010, 235, 160, 55]), // Podest am Ventilstand
    box([1170, 295, 75, 50]), // Engstelle (kanalvolk-sperre)
    box([1240, 240, 275, 100]), // Vorplatz der Quantum-Außenstelle
    box([1240, 335, 70, 30]), // Ausbuchtung vor dem Geländer
    box([75, 285, 235, 505]), // Gitterboden links
    box([525, 345, 70, 350]), // Rohrbrücke über den Hauptschacht
    box([75, 690, 1395, 100]), // Laufsteg Süd
    box([80, 785, 335, 190]), // OP-Nische
    box([435, 785, 60, 190]), // Gitterstreifen
    box([505, 785, 250, 190]), // Kabelmolch-Nest
    box([765, 785, 70, 190]), // Gitterstreifen
    box([845, 785, 405, 190]), // Nische der Hilfspumpe
    box([1260, 740, 70, 240]), // vor dem Überlaufrohr
  ],
  block: [
    box([205, 865, 105, 85]), // OP-Tisch
    box([118, 885, 57, 85]), // Kühlboxen
    box([160, 865, 50, 55]), // Schränkchen mit grünem Glas
    box([305, 890, 50, 60]), // Instrumentenwagen
    box([860, 830, 230, 120]), // Hilfspumpe
    box([1360, 225, 60, 45]), // Terminal-Pult
    box([1455, 235, 60, 45]), // Kisten an der Außenstelle
  ],
  exits: [
    {
      id: 'tunnel-west', rect: [0, 480, 22, 100], to: 'kanal-sammler', entry: 'von-pumpwerk-sieben',
      label: 'Tunnel West zum Kanal-Sammler',
    },
    {
      id: 'ueberlaufrohr', rect: [1330, 770, 120, 190], to: 'hafenkante', entry: 'ueberlaufrohr',
      label: 'Überlaufrohr zur Hafenkante', interact: true, when: ROHR_OFFEN,
      lockedText: 'Ein Rohr, so dick wie ein Haus, mit einem Handrad. Es klemmt. Dahinter riecht es nach Hafen und Freiheit.',
    },
  ],
  entries: {
    'von-kanal-sammler': { at: [100, 530], facing: 'e' },
    'von-hafenkante': { at: [1295, 900], facing: 'n' },
  },
  spots: Object.fromEntries(Object.entries(S).map(([k, at]) => [k, { at, facing: 's' as const }])),
  hotspots: [
    // --- Pumpenräder und Ventilstand -----------------------------------------------------------------------------
    {
      id: 'pumpenrad-1', at: [265, 300], radius: 60, label: 'Pumpenrad 1', kind: 'look',
      lines: [
        { speaker: N, text: 'Pumpenrad 1: rostrot, zwölf Speichen, ein Durchmesser wie ein Kirchturm liegend. In die Nabe hat jemand „Hier war Kalle“ geritzt. Ganz oben. Wie zur Hölle?' },
        { speaker: N, text: 'Es dreht sich nicht. Es denkt nur darüber nach.' },
      ],
    },
    {
      id: 'pumpenrad-2', at: [470, 300], radius: 60, label: 'Pumpenrad 2', kind: 'look',
      lines: [
        { speaker: N, text: 'Pumpenrad 2. Laut Logbuch heißt sie Gisela. Gisela quietscht, wenn Druck auf der Leitung ist, und schweigt beleidigt, wenn nicht.' },
        { speaker: N, text: 'Zwischen zwei Speichen klemmt ein Schuh. Kein Fuß drin. Du checkst das zweimal.' },
      ],
    },
    {
      id: 'pumpenrad-3', at: [840, 300], radius: 60, label: 'Pumpenrad 3', kind: 'look',
      lines: [
        { speaker: N, text: 'Pumpenrad 3, das größte. Unten in der Grube schwappt schwarzes Wasser, in dem sich das Notlicht spiegelt wie ein sehr schlechtes Omen.' },
        { speaker: N, text: 'Wenn hier jemand reinfällt, findet ihn keiner. Ripper weiß das garantiert.' },
      ],
    },
    { id: 'ventilraetsel', at: [1075, 255], radius: 58, label: 'Ventilstand', kind: 'use', dialogue: 'pumpwerk-ventilstand' },
    {
      id: 'datenwuerfel-19', at: [1150, 250], radius: 40, label: 'Etwas Hartes im Logbuch', kind: 'loot', once: true,
      effects: [{ give: 'datenwuerfel-19' }, { message: 'Datenwürfel 19, ins Klemmbrett geklemmt. Darauf: „Beweise. Falls mir was passiert. Oder falls mir langweilig wird.“' }],
    },
    // --- Gitterboden, Rohrbrücke, Engstelle ------------------------------------------------------------------------
    {
      id: 'gitterboden', at: [190, 560], radius: 64, label: 'Gitterboden', kind: 'look',
      lines: [
        { speaker: N, text: 'Gitterböden über Schächten. Unter deinen Füßen geht es zwanzig Meter runter ins Dunkle, und da unten bewegt sich was. Gleichmäßig. Hungrig.' },
        { speaker: N, text: 'Die Platten klappern bei jedem Schritt. Wer hier ungesehen rüber will, braucht leise Sohlen. Oder Ratten, die gerade woanders hinschauen.' },
      ],
    },
    {
      id: 'rohrbruecke', at: [560, 520], radius: 56, label: 'Rohrbrücke', kind: 'look',
      lines: [
        { speaker: N, text: 'Ein Rohr, so dick wie ein U-Bahn-Wagen, quer über den Hauptschacht, oben ein Gitter zum Drüberlaufen. Das Geländer wackelt, wenn man es ansieht.' },
        { speaker: N, text: 'Von hier oben siehst du die ganze Halle: die Pumpenräder, die weißen Container, die rote Nische unten links. Und tief unter dir ein Glitzern, das sich bewegt.' },
      ],
    },
    {
      id: 'kanalvolk-sperre', at: [1205, 320], radius: 44, label: 'Engstelle', kind: 'look', hideWhen: KANALVOLK_HILFT,
      lines: [
        { speaker: N, text: 'Eine Engstelle zwischen einem Riesenrohr und dem Schacht, gerade breit genug für eine Person. Der einzige Weg von den Quantum-Containern in die Halle.' },
        { speaker: N, text: 'Wer hier ein paar Fässer und einen Kühlschrank hinstellt, hält eine ganze Armee auf. Zumindest eine schlecht motivierte.' },
      ],
    },
    {
      id: 'kanalvolk-sperre-gebaut', at: [1205, 320], radius: 44, label: 'Barrikade des Kanalvolks', kind: 'look', when: KANALVOLK_HILFT,
      lines: [
        { speaker: N, text: 'Ölfässer, Bretter, ein Einkaufswagen und ein Kühlschrank mit einem Herz aus Kronkorken drauf: Das Kanalvolk hat die Engstelle verrammelt. Ein Spalt bleibt für Freunde.' },
        { speaker: N, text: 'Am Kühlschrank hängt ein Zettel in Gully-Schrift: „Durchgang nur für Ehrenrohre. Alle anderen: Pech.“' },
      ],
    },
    // --- Quantum-Außenstelle ---------------------------------------------------------------------------------------
    {
      id: 'aussenstelle-terminal', at: [1390, 290], radius: 46, label: 'Terminal der Außenstelle hacken', kind: 'use', hideWhen: CONTAINER_OFFEN,
      lines: [{ speaker: N, text: 'Ein Quantum-Terminal, regenfest, rattenfest, idiotensicher. Zwei von drei stimmen.' }],
      effects: [{
        minigame: 'akt-hacken', level: 3, key: 'pumpwerk-aussenstelle', label: 'Außenstelle: Türsteuerung hacken',
        win: [{ setFlag: 'aussenstelle_offen' }, { xp: 30 }, { message: 'Zugang gewährt. Die Containertür zischt auf. Drinnen fällt jemandem vor Schreck der Löffel in den Joghurt.' }],
        lose: [{ damage: 3 }, { message: 'Der Bildschirm zeigt einen Totenkopf mit Quantum-Krawatte. Dann gibt er dir einen Schlag. Nochmal.' }],
      }],
    },
    {
      id: 'aussenstelle-protokoll', at: [1390, 290], radius: 46, label: 'Protokolle lesen', kind: 'look', when: CONTAINER_OFFEN,
      lines: [
        { speaker: N, text: 'Produktionsprotokoll „Chrome 10, Charge 7“: Ausschussquote 31 %. Vermerk: „Fehlerhafte Einheiten über den Kanal entsorgen. Bitte nicht in den Fluss. Fluss ist Presse.“' },
        { speaker: N, text: 'Darunter eine Notiz von A. Zero: „Rücklauf aus der Testgruppe: ‚Ja, Master‘-Reflex stabil. Nebenwirkungen: keine messbaren.“ Wer misst denn hier?' },
      ],
    },
    { id: 'aussenstelle-container', at: [1310, 260], radius: 50, label: 'Container der Außenstelle', kind: 'use', dialogue: 'pumpwerk-container', hideWhen: CONTAINER_OFFEN },
    {
      id: 'chip-fragment-04', at: [1310, 260], radius: 50, label: 'Probenkühlschrank durchsuchen', kind: 'loot', once: true, when: CONTAINER_OFFEN,
      effects: [{ give: 'chip-fragment-04' }, { message: 'Chip-Fragment 04, in Folie, beschriftet mit „Defekt. Trotzdem behalten. – A.“ Danke, A.' }],
    },
    {
      id: 'aussenstelle-ausschuss', at: [1485, 295], radius: 44, label: 'Ausschusskiste', kind: 'loot', daily: true, when: { all: [CONTAINER_OFFEN, { act: 2 }] },
      effects: [{ give: 'quantum-chip-schrott' }, { message: 'Ein Quantum-Chip aus der Ausschusskiste. Er zuckt noch ein bisschen. Wie ein Fisch auf dem Trockenen. Ein Fisch, der „Master“ sagen will.' }],
    },
    // --- Laufsteg Süd ----------------------------------------------------------------------------------------------
    {
      id: 'op-nische-blick', at: [270, 830], radius: 60, label: 'Nische hinter dem Vorhang', kind: 'look', when: { not: { any: [KANAL_AKTIV, KANAL_DONE] } },
      lines: [
        { speaker: N, text: 'Hinter einem Vorhang aus Plastikstreifen: ein OP-Tisch, eine runde Lampe, Kühlboxen mit Biohazard-Aufklebern. Alles sauberer als der Rest der Halle. Das macht es schlimmer.' },
        { speaker: N, text: 'Auf einem Tablett liegen Werkzeuge in Reih und Glied. Daneben ein Zettel: „Nicht anfassen. – R.“ Der Zettel ist mit Blut unterschrieben. Oder mit Ketchup. Fifty-fifty.' },
      ],
    },
    {
      id: 'op-nische-danach', at: [270, 830], radius: 60, label: 'OP-Nische', kind: 'look', when: KANAL_DONE,
      lines: [
        { speaker: N, text: 'Der OP-Tisch liegt auf der Seite, die Lampe baumelt an einem Kabel, die Kühlboxen sind weg. Hier ist jemandem ein Geschäft geplatzt. Mit Ansage.' },
        { speaker: N, text: 'Am Boden zwischen den Scherben glitzert noch was. Ripper hatte es eilig.' },
      ],
    },
    {
      id: 'chip-fragment-03', at: [385, 945], radius: 44, label: 'Glitzern zwischen den Scherben', kind: 'loot', once: true, when: KANAL_DONE,
      effects: [{ give: 'chip-fragment-03' }, { message: 'Chip-Fragment 03, aus einem Probenröhrchen gekullert. Ripper hat geforscht. Oder geklaut. Bei Ripper ist das dasselbe.' }],
    },
    {
      id: 'molch-nest', at: [630, 920], radius: 60, label: 'Kabelmolch-Nest', kind: 'look', hideWhen: MOLCHE_WEG,
      lines: [
        { speaker: N, text: 'Ein Nest aus Kabelresten, abgenagten Chips und Isolierband. Wenn Licht drauffällt, glitzert es wie eine Disco. Kleine Kristalle aus geschmolzenem Silizium.' },
        { speaker: N, text: 'Und es atmet. Was auch immer da drin schläft, frisst Strom zum Frühstück. Und vermutlich Leute zum Nachtisch.' },
      ],
    },
    {
      id: 'molch-nest-glitzer', at: [630, 920], radius: 60, label: 'Im Nest wühlen', kind: 'loot', once: true, when: MOLCHE_WEG,
      effects: [{ give: 'schrott-ersatzteil', qty: 2 }, { give: 'datenkristall' }, { message: 'Im Nest: zwei Ersatzteile und ein Datenkristall, angekaut, aber heil. Die Molche hatten Geschmack.' }],
    },
    { id: 'alte-hilfspumpe', at: [975, 805], radius: 54, label: 'Alte Hilfspumpe', kind: 'use', dialogue: 'pumpwerk-hilfspumpe' },
    { id: 'ueberlaufrohr-rad', at: [1300, 840], radius: 64, label: 'Handrad am Überlaufrohr', kind: 'use', dialogue: 'pumpwerk-handrad', hideWhen: ROHR_OFFEN },
    {
      id: 'tunnel-west-blick', at: [110, 470], radius: 40, label: 'Tunnel West', kind: 'look',
      lines: [{ speaker: N, text: 'Der Tunnel zurück zum Kanal-Sammler. Hinten glimmen die Leuchtpilze des Kanalvolks. Von hier aus wirken sie fast wie Zuhause. Das sagt viel über dein Leben.' }],
    },
  ],
  encounters: [
    { id: 'molch-nest', encounter: 'enc-pumpwerk-molchnest', at: [630, 870], patrol: [[560, 870], [700, 870]], radius: 56, when: { act: 2 }, avoid: molchKurzschluss },
  ],
  foreground: [
    { rect: [60, 800, 115, 175], baseY: 975 }, // Plastikvorhang links
    { rect: [350, 800, 75, 175], baseY: 975 }, // Plastikvorhang rechts
  ],
  lights: [
    { at: [185, 268], radius: 90, color: '#ff3b3b' }, // Notlicht an den Pumpengruben
    { at: [488, 268], radius: 90, color: '#ff3b3b' },
    { at: [790, 268], radius: 90, color: '#ff3b3b' },
    { at: [178, 60], radius: 80, color: '#ff3b3b' },
    { at: [473, 60], radius: 80, color: '#ff3b3b' },
    { at: [760, 60], radius: 80, color: '#ff3b3b' },
    { at: [83, 312], radius: 80, color: '#ff3b3b' },
    { at: [308, 440], radius: 90, color: '#ff3b3b' }, // Schachtkante
    { at: [1143, 438], radius: 90, color: '#ff3b3b' },
    { at: [310, 645], radius: 90, color: '#ff3b3b' },
    { at: [1143, 645], radius: 90, color: '#ff3b3b' },
    { at: [83, 735], radius: 80, color: '#ff3b3b' },
    { at: [1120, 120], radius: 110, color: '#ff4a3a' }, // Käfiglampe am Ventilstand
    { at: [1075, 820], radius: 100, color: '#ff4a3a' }, // Lampe der Hilfspumpe
    { at: [336, 815], radius: 70, color: '#ff3b3b' },
    { at: [1300, 75], radius: 120, color: '#e8f4ff', intensity: 0.8 }, // Flutlicht Außenstelle
    { at: [1440, 75], radius: 120, color: '#e8f4ff', intensity: 0.8 },
    { at: [1430, 180], radius: 130, color: '#e8f4ff', intensity: 0.8 },
    { at: [1385, 215], radius: 60, color: '#3ef2ff' }, // Terminal
    { at: [245, 840], radius: 110, color: '#d8ffe8', intensity: 0.7, when: KANAL_AKTIV }, // OP-Lampe (nur während Rippers OP)
    { at: [185, 860], radius: 50, color: '#5dff7a', when: KANAL_AKTIV }, // grünes Glas
    { at: [540, 920], radius: 60, color: '#5fd9ff' }, // Kristalle im Molch-Nest
    { at: [710, 885], radius: 60, color: '#5fd9ff' },
    { at: [730, 945], radius: 50, color: '#5fd9ff' },
    { at: [70, 195], radius: 60, color: '#7dffb2' }, // Leuchtpilze
    { at: [35, 940], radius: 60, color: '#7dffb2' },
  ],
  ambient: {
    count: 2,
    sprites: ['passant-kanalvolk-walk', 'passant-arbeiterin-walk'],
    routes: [
      [[100, 318], [1160, 318]],
      [[100, 740], [1450, 740]],
      [[190, 320], [190, 760]],
      [[560, 318], [560, 740]],
    ],
    bySlot: { morgen: 1, tag: 2, abend: 2, nacht: 1 },
    barks: [
      { text: 'Pssst. Wenn Gisela nachts quietscht, ist alles gut. Wenn sie nicht quietscht, lauf.' },
      { text: 'Die Weißkittel da oben trinken Kaffee mit Milchschaum. HIER UNTEN. Mit Milchschaum! Ich könnt kotzen.' },
      { text: 'Fass die Molche nicht an. Die beißen nicht. Die entladen. Das ist schlimmer, glaub mir.' },
      { text: 'Oben sind alle so seltsam. Hier unten ist alles wie immer: nass.', when: AKT2 },
      { text: 'Gully hat eine zweite Krone. Wir haben gefragt, warum. Er sagte: „Darum.“', when: { all: [{ act: 3 }, { not: EPILOG }] } },
      { text: 'Nachts hören die Rohre auf zu tropfen und fangen an zu atmen. Dann atme ich leiser.', when: { time: 'nacht' } },
      { text: 'Hier unten hat’s ordentlich geknallt, hab ich gehört. Ripper soll jetzt eine Delle im Ego haben. Und im Kittel.', when: KANAL_DONE },
      { text: 'Wer hat das Überlaufrohr aufgemacht? Jetzt zieht’s hier wie Hechtsuppe. Riecht aber nach Meer. Ich beschwer mich nicht.', when: ROHR_OFFEN },
      { text: 'Seit oben die Bildschirme aus sind, kommen Leute runter, um sich die Pumpen anzugucken. Touristen! Im Pumpwerk! Mit Kamera!', when: EPILOG },
    ],
  },
  ambience: 'kanal',
  music: 'kanalisation',
  onEnter: [
    { id: 'pumpwerk-erstbesuch', once: true, dialogue: 'pumpwerk-ankunft', effects: [{ markSeen: 'pumpwerk-ankunft' }] },
  ],
};

export const part: ContentPart = {
  maps: { [pumpwerk.id]: pumpwerk },
  dialogues,
  encounters: { [molchnest.id]: molchnest },
  mapAdditions: {
    // Rückweg durchs Überlaufrohr, sobald es von innen geöffnet wurde (mapAdditions kann keine Ausgänge anlegen).
    hafenkante: {
      hotspots: [{
        id: 'ueberlaufrohr-einstieg', at: [1440, 470], radius: 46, label: 'Ins Überlaufrohr klettern', kind: 'use', when: ROHR_OFFEN,
        lines: [{ speaker: N, text: 'Das Gitter steht offen, seit du es von innen aufgedreht hast. Das Rohr schluckt dich wie ein sehr langer, sehr feuchter Witz.' }],
        effects: [{ travel: 'pumpwerk-sieben', entry: 'von-hafenkante' }],
      }],
    },
  },
};
