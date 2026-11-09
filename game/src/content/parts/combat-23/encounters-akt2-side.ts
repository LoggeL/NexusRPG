// Feste Begegnungen der Akt-2-Nebenquests und persönlichen Quests (world.md §6.3, §6.5, §8.7) plus Kopfgeld
// Stufe 3 in der Ödnis (§6.7). Quests starten sie mit { battle } und prüfen { won }; Questbelohnungen (Items wie
// `arme-venomkralle`, Ruf, Herzen) vergibt die Quest, hier steht nur der Kampfbonus.
import type { EncounterDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import { byId } from '../combat/_foe';

const act2 = { act: 2 } as const;

const list: EncounterDef[] = [
  // --- Quantum-Campus (Akt 2 außen) -----------------------------------------------------------
  {
    // Allgemeine Campus-Streife, wenn das Schleichen auffliegt (pers-pim-kleine-schrift, kopfgeld-leutnant-nadel,
    // side-alesas-zuendholz am Zaun, Erkundung).
    id: 'enc-campus-patrouille',
    name: 'Campus-Patrouille',
    arena: 'arena-labor-quantum',
    enemies: [{ enemy: 'quantum-wachmann', count: 2 }, { enemy: 'spaeherdrohne' }],
    when: act2,
    intro: [
      { speaker: 'narrator', text: 'Zwei weiße Rüstungen biegen um die Ecke. Die Drohne zwischen ihnen piept einmal freundlich und dann sehr unfreundlich.' },
      { speaker: 'narrator', text: '„Bitte bleiben Sie stehen. Ihre Anwesenheit wird protokolliert. Ihre Zähne auch, falls nötig.“' },
    ],
    reward: { xp: 40 },
  },

  // --- side-alesas-zuendholz ------------------------------------------------------------------
  {
    id: 'enc-altlager-patrouille',
    name: 'Altlager: Zaunstreife',
    arena: 'arena-labor-altlager',
    enemies: [{ enemy: 'quantum-wachmann', count: 2 }, { enemy: 'spaeherdrohne' }],
    when: act2,
    intro: [
      { speaker: 'narrator', text: 'Hinter dem Zaun des Altlagers flackert es orange. Davor: eine Streife, die so tut, als wäre das normal.' },
      { speaker: 'narrator', text: '„Hier ist nichts. Gar nichts. Und das Nichts brennt nur ein kleines bisschen. Weitergehen!“' },
    ],
    reward: { xp: 40 },
  },
  {
    id: 'enc-altlager-zuendholz',
    name: 'Altlager: Projekt Zündholz',
    arena: 'arena-labor-altlager',
    enemies: [{ enemy: 'boss-zuendholz' }, { enemy: 'spaeherdrohne', count: 2 }],
    canFlee: false,
    when: act2,
    intro: [
      { speaker: 'narrator', text: 'Zwischen verkohlten Regalen richtet sich ein Roboter auf, groß wie ein Lieferwagen, mit einem Arm, aus dem es tropft. Brennend tropft.' },
      { speaker: 'narrator', text: '„PROJEKT ZÜNDHOLZ. AUFGABE: WÄRME SPENDEN. WÄRME WIRD JETZT GESPENDET.“' },
      { speaker: 'alesa-zero', text: 'Hallo? Ist da jemand? Hier spricht … eine anonyme Mitarbeiterin. Bitte nicht den linken Arm. Der war teuer.' },
      { speaker: 'narrator', text: 'Tipp: Die Pfützen am Boden löschen „Brennt“. Der Flammenarm braucht einen Moment zum Nachladen – geh danach rein.' },
    ],
    reward: { xp: 120 },
    onWin: [{ message: 'Zündholz sackt zusammen und pustet ein letztes Rauchwölkchen. Aus dem Lautsprecher: ein erleichtertes, sehr teures Seufzen.' }],
  },
  {
    // Nach dem geöffneten Löschwassertank: „Nass“, Panzerung −3.
    id: 'enc-altlager-zuendholz-loeschtank',
    name: 'Altlager: Projekt Zündholz (gelöscht)',
    arena: 'arena-labor-altlager',
    enemies: [{ enemy: 'boss-zuendholz-nass' }, { enemy: 'spaeherdrohne', count: 2 }],
    canFlee: false,
    when: act2,
    intro: [
      { speaker: 'narrator', text: 'Der Löschwassertank kippt. Eine Flutwelle rauscht durch das Altlager und trifft Zündholz frontal. Es zischt wie tausend beleidigte Katzen.' },
      { speaker: 'narrator', text: '„FLAMMENARM NASS. FLAMMENARM BELEIDIGT. ICH SPENDE TROTZDEM WÄRME. LAUWARM.“' },
      { speaker: 'alesa-zero', text: 'Ihr habt ihn GEDUSCHT? Okay. Okay. Das ist … eigentlich klug. Ich hasse das.' },
    ],
    reward: { xp: 120 },
    onWin: [{ message: 'Zündholz liegt in einer Pfütze und dampft. Irgendwo im Gebäude klatscht eine einzelne Person sehr leise.' }],
  },

  // --- side-ki-fluestern ----------------------------------------------------------------------
  {
    id: 'enc-markt-betreuer',
    name: 'Kundenbetreuung mit Nachdruck',
    arena: 'arena-strasse',
    enemies: [{ enemy: 'quantum-betreuer', count: 2 }, { enemy: 'gechippter-bewohner' }],
    when: act2,
    intro: [
      { speaker: 'narrator', text: 'Zwei Quantum-Kundenbetreuer in Pastell lächeln mit 64 Zähnen. Zwischen ihnen steht ein Mann mit leeren Augen und einem Chip hinterm Ohr.' },
      { speaker: 'narrator', text: '„Herzlichen Glückwunsch zu Ihrer Entscheidung für Chrome 10! Ihr Bekannter hier ist ausgesprochen zufrieden. Nicht wahr, Paul?“' },
      { speaker: 'narrator', text: 'Paul: „Das ist eine ausgezeichnete Entscheidung, Master.“' },
      { speaker: 'narrator', text: 'Tipp: Der Gechippte ist ein Opfer, kein Gegner. Betäuben oder hacken statt umhauen – Dante kriegt den Chip später raus.' },
    ],
    reward: { xp: 60, items: { 'quantum-chip-schrott': 1 } },
    onWin: [{ message: 'Paul blinzelt. „Tante Volt? Warum riecht es hier nach Werbung?“' }],
  },

  // --- pers-nyra-silent-angel -----------------------------------------------------------------
  {
    id: 'enc-bruecke-patrouille',
    name: 'Fußgängerbrücke: Quantum-Streife',
    arena: 'arena-strasse',
    enemies: [{ enemy: 'quantum-wachmann', count: 2 }, { enemy: 'spaeherdrohne' }],
    when: act2,
    intro: [
      { speaker: 'narrator', text: 'Die Fußgängerbrücke. Nyra steht am Geländer, Kapuze tief, Hände zitternd. Dann leuchten hinter ihr zwei weiße Visiere auf.' },
      { speaker: 'nyra', expr: 'besorgt', text: 'Scheiße. Scheiße! Ich hab gesagt, dass mich keiner verfolgt. Ich hab’s ehrlich geglaubt.' },
      { speaker: 'narrator', text: '„Mitarbeiterin Nyra, Ihre Pause ist beendet. Bitte kehren Sie an Ihren Arbeitsplatz zurück. Die anderen Personen kehren … ins Krankenhaus zurück.“' },
    ],
    reward: { xp: 50 },
    onWin: [{ message: 'Die Drohne liegt im Kanal. Nyra hält deinen Ärmel fest. „Noch fünf Minuten. Dann muss ich zurück. Noch.“' }],
  },

  // --- pers-delya-quelle ----------------------------------------------------------------------
  {
    id: 'enc-kanal-schlafwandler',
    name: 'Kanal: Schlafwandler-Eskorte',
    arena: 'arena-kanal',
    enemies: [{ enemy: 'rattenschwarm' }, { enemy: 'rohrkriecher' }, { enemy: 'kanalratte', count: 2 }],
    objective: { kind: 'rescue', unit: 'kanal-schlafwandler', cell: [1, 1] },
    when: act2,
    intro: [
      { speaker: 'narrator', text: 'Der Schlafwandler summt einen Werbejingle und läuft geradewegs auf den Laufsteg zu. Unter dem Steg raschelt es. Sehr viel.' },
      { speaker: 'delya-delloraine', text: 'Bringt ihn heil zu Dante. Ein lebender Zeuge ist eine Geschichte. Ein toter ist eine Fußnote.' },
      { speaker: 'narrator', text: 'Ziel: alle Gegner vertreiben. Fällt der Schlafwandler, ist die Quelle verloren.' },
    ],
    reward: { xp: 60 },
  },

  // --- side-hartlaufs-rache -------------------------------------------------------------------
  {
    id: 'enc-ruine-wachkoloss',
    name: 'Digitech-Halle: Der Wachkoloss',
    arena: 'arena-schrottplatz',
    enemies: [{ enemy: 'boss-wachkoloss' }, { enemy: 'digitech-waechter' }],
    canFlee: false,
    when: act2,
    intro: [
      { speaker: 'narrator', text: 'Im Archiv flackert eine Notbeleuchtung. Dann eine zweite, sieben Meter höher. Es sind Augen.' },
      { speaker: 'narrator', text: '„DIGITECH-WACHKOLOSS. BETRIEBSJAHR 2071. LETZTE WARTUNG: NIE. EINDRINGLINGE WERDEN FREUNDLICH ZERQUETSCHT.“' },
      { speaker: 'direktorin-hartlauf', text: 'Nicht die Akten zertreten, Sie Blechtrottel! Die Patente! DIE PATENTE!' },
      { speaker: 'narrator', text: 'Tipp: Der Koloss ist langsam. Bleib aus seinem Umkreis, sonst stampft er dich platt. Nässe legt veraltete Technik lahm.' },
    ],
    reward: { xp: 150, items: { 'schrott-ersatzteil': 3 } },
    onWin: [{ message: 'Der Koloss setzt sich hin. Langsam. Dann schaltet er sich mit einem Seufzer ab, der nach dreißig Jahren Überstunden klingt.' }],
  },

  // --- side-rostzaehne-ende -------------------------------------------------------------------
  {
    id: 'enc-rostzahn-lager',
    name: 'Rostzahn-Lager',
    arena: 'arena-hafen-oelfaesser',
    enemies: [{ enemy: 'rostzahn-schlaeger', count: 3 }, { enemy: 'zerleger' }],
    when: act2,
    intro: [
      { speaker: 'narrator', text: 'Hinter den Ölfässern: Kisten voller Schutzgeld-Quittungen, Leuchtketten und ein Rostzahn, der gerade sein Pausenbrot auspackt.' },
      { speaker: 'narrator', text: '„Ey! Das ist Privatgelände! Also, unser privates geklautes Gelände! Jungs, Besuch!“' },
    ],
    reward: { xp: 60, credits: 120 },
  },
  {
    id: 'enc-hafen-funzel',
    name: 'Hafen: Funzel und die Rostzähne',
    arena: 'arena-hafen',
    enemies: [{ enemy: 'boss-funzel' }, { enemy: 'rostzahn-schlaeger', count: 4 }],
    canFlee: false,
    when: act2,
    intro: [
      { speaker: 'narrator', text: 'Zwischen den Containern glüht es: Funzel, der Chef der Rostzähne, hat sich in so viele Leuchtketten gewickelt, dass man ihn vom Mond aus sieht.' },
      { speaker: 'narrator', text: 'Funzel: „Ihr wollt meinen Hafen? MEINEN Hafen? Hier zahlt jeder. Sogar die Möwen zahlen. In Fisch.“' },
      { speaker: 'hafen-hannes', text: 'Mach ihn fertig. Meine Rente steckt in seinen bescheuerten Lämpchen.' },
      { speaker: 'narrator', text: 'Tipp: Die Gang hält zusammen, solange Funzel steht. Wird er zu laut, hilft nur, ihn auszuknipsen.' },
    ],
    reward: { xp: 160, credits: 200 },
    onWin: [{ message: 'Funzel liegt zwischen den Containern, seine Leuchtketten flackern aus, eine nach der anderen. Die Rostzähne schauen sich an. Dann rennen sie.' }],
  },

  // --- side-xions-kralle ----------------------------------------------------------------------
  {
    id: 'enc-ring-xion',
    name: 'Schrottring: Duell gegen Xion',
    arena: 'arena-hafen-ring',
    enemies: [{ enemy: 'boss-xion-ring' }],
    solo: true,
    canFlee: false,
    when: act2,
    // Lösungen aus side-xions-kralle mitten im Duell: gc-96 [Reflexe 8] Konter (Kralle 2 Züge weg), dienstplan-2079 vor
    // Publikum (Xion verlässt den Ring = Sieg).
    partyAbilities: [
      { ability: 'ring-konter', when: { attr: 'reflexe', min: 8 } },
      { ability: 'ring-dienstplan', when: { item: 'dienstplan-2079' } },
    ],
    intro: [
      { speaker: 'narrator', text: 'Samstagnacht am Pier. Stromseile knistern um den Ring, die halbe Hafenkante brüllt. Wetten laufen. Auf dich eher nicht.' },
      { speaker: 'xion-venom', text: 'Eins gegen eins. Schockhandschuhe. Keine Freunde, keine Tricks, kein Funk. Ich bin nicht dumm, ich hab die Regeln selbst geschrieben.' },
      { speaker: 'player', expr: 'signatur', text: 'Wie viele Wörter hatten die? Drei?' },
      { speaker: 'xion-venom', text: 'VIER! … Mit Überschrift.' },
      { speaker: 'narrator', text: 'Duell: Nur du kämpfst. Die Stromseile am Rand tun weh – lass dich nicht reindrängen.' },
    ],
    reward: { xp: 150 },
    onWin: [{ message: 'Xion liegt auf den Brettern und starrt in den Himmel. „Ich war abgelenkt. Von … dem Mond.“ Die Hafenkante tobt.' }],
  },

  // --- side-weg-zum-meer ----------------------------------------------------------------------
  {
    id: 'enc-oednis-staubfalken',
    name: 'Wegzoll der Staubfalken',
    arena: 'arena-duenen',
    enemies: [{ enemy: 'staubfalke', count: 3 }],
    when: act2,
    intro: [
      { speaker: 'narrator', text: 'Drei Gestalten mit Staubmasken und Bolzenschleudern stehen auf dem Kamm. Der Wind trägt Glasstaub und schlechte Laune.' },
      { speaker: 'narrator', text: '„Wegzoll. Dreihundert, eine gute Geschichte oder eure Stiefel. Ihr habt hübsche Stiefel.“' },
      { speaker: 'narrator', text: 'Tipp: Staubfalken haben einen Ehrenkodex. Wer genug einsteckt, ergibt sich, statt zu fliehen.' },
    ],
    reward: { xp: 90 },
    onWin: [{ message: 'Der letzte Falke hebt die Hände. „Ehrenkodex. Ihr dürft durch. Erzählt Krähe nicht, wie schnell das ging.“' }],
  },

  // --- side-kraehes-ehre ----------------------------------------------------------------------
  {
    id: 'enc-wrackburg-kraehe',
    name: 'Wrackburg: Krähe und ihre Falken',
    arena: 'arena-duenen-wrackburg',
    enemies: [{ enemy: 'boss-kraehe' }, { enemy: 'staubfalke', count: 2 }],
    canFlee: false,
    when: act2,
    intro: [
      { speaker: 'narrator', text: 'Der Hof der Wrackburg. Mauern aus Autoschrott, eine Feuertonne, zwanzig Staubfalken auf den Dächern. Unten: Krähe mit ihrem Kettenspeer.' },
      { speaker: 'kraehe', text: 'Ich sammle Geschichten. Gute, schlechte, gelogene. Heute schreibe ich eine neue: wie du im Sand gelegen hast.' },
      { speaker: 'kraehe', text: 'Zwei meiner Falken halten dir die Hand, damit es fair bleibt. Fair für mich.' },
      { speaker: 'narrator', text: 'Tipp: Ruft sie den Sturm, treffen Fernwaffen schlechter. Dann rein in den Nahkampf.' },
    ],
    reward: { xp: 140 },
    onWin: [{ message: 'Krähe lacht im Sand, Blut an der Lippe, Federn im Haar. „Gut. Die Geschichte erzähl ich selbst. Ich lüg nur ein bisschen.“' }],
  },
  {
    // Ehrenduell ohne die Falken (wenn die Quest das Duell eins gegen eins wählt).
    id: 'enc-wrackburg-kraehe-duell',
    name: 'Wrackburg: Ehrenduell gegen Krähe',
    arena: 'arena-duenen-wrackburg',
    enemies: [{ enemy: 'boss-kraehe-duell' }],
    solo: true,
    canFlee: false,
    when: act2,
    intro: [
      { speaker: 'kraehe', text: 'Ehrenduell. Du und ich. Keine Freunde, kein Funk, kein Gejammer. Wer zuerst im Sand liegt, kriegt keine Geschichte.' },
      { speaker: 'player', expr: 'signatur', text: 'Und wer gewinnt?' },
      { speaker: 'kraehe', text: 'Kriegt die Geschichte. Und meinen Respekt. Der ist teurer.' },
      { speaker: 'narrator', text: 'Duell: Nur du kämpfst. Die Feuertonne in der Mitte brennt – nicht reintreten.' },
    ],
    reward: { xp: 160 },
    onWin: [{ message: 'Krähe steht auf, klopft sich ab und reicht dir die Hand. „Geschichtenwürdig. Knapp.“' }],
  },

  // --- side-glasherz --------------------------------------------------------------------------
  {
    id: 'enc-duenen-koenigin',
    name: 'Glasdünen: Die Glasskorpion-Königin',
    arena: 'arena-duenen',
    enemies: [{ enemy: 'boss-glasskorpion-koenigin' }, { enemy: 'glasskorpion', count: 2 }],
    canFlee: false,
    when: act2,
    intro: [
      { speaker: 'narrator', text: 'Die Düne bricht auf wie ein Spiegel. Darunter: eine Skorpionkönigin aus Glas, so groß wie ein Bus, und in jedem Glied bricht sich das Licht.' },
      { speaker: 'glasblaeserin', text: 'Sie will ihr Ei! Sie will nur ihr Ei! Und dann will sie, glaube ich, meine Werkstatt essen!' },
      { speaker: 'narrator', text: 'Tipp: Im Licht blendet ihr Prisma alle Angreifer. Die Scherbenfelder schneiden – bleib auf dem Sand.' },
    ],
    reward: { xp: 180 },
    onWin: [{ message: 'Die Königin klirrt ein letztes Mal und gräbt sich tief in die Düne. Aus dem Sand leuchtet es noch lange.' }],
  },

  // --- side-verlorene-frequenz ----------------------------------------------------------------
  {
    id: 'enc-funkturm-windraeder',
    name: 'Funkturm: Windrad-Drohnen',
    arena: 'arena-duenen',
    enemies: [{ enemy: 'windrad-drohne', count: 3 }],
    when: act2,
    intro: [
      { speaker: 'narrator', text: 'Drei Windrad-Drohnen kreisen um den Turm wie verrückt gewordene Ventilatoren. Eine trägt ein Schild: „FREQUENZ GESCHLOSSEN“.' },
      { speaker: 'opa-funk', text: 'Die Biester haben sich mein Windrad als Nest ausgesucht. Hol sie runter, Kind. Radio Rost braucht Wind, keine Mitbewohner.' },
      { speaker: 'narrator', text: 'Tipp: Ihre Böe schiebt dich herum. Nicht nebeneinander stehen.' },
    ],
    reward: { xp: 80, items: { 'schrott-ersatzteil': 2 } },
    onWin: [{ message: 'Die letzte Drohne trudelt in den Sand. Oben am Turm dreht sich das Windrad wieder. Langsam. Knarzend. Frei.' }],
  },

  // --- Kopfgeld Stufe 3 in der Ödnis (§6.7) --------------------------------------------------
  {
    id: 'enc-kopfgeld-staubbaron-broesel',
    name: 'Kopfgeld: Staubbaron Brösel',
    arena: 'arena-duenen',
    enemies: [{ enemy: 'staubbaron-broesel' }, { enemy: 'schrottkraehe', count: 2 }],
    when: act2,
    intro: [
      { speaker: 'narrator', text: 'Staubbaron Brösel sitzt auf einem Wasserkanister wie auf einem Thron. Zwei Schrottkrähen fächeln ihm Staub zu.' },
      { speaker: 'narrator', text: 'Brösel: „Wasser ist ein Luxusgut! Ich bin quasi Sommelier! Drei Credits der Schluck, und ihr wollt mich VERHAFTEN?“' },
    ],
    reward: { xp: 100 },
    onWin: [{ message: 'Brösel sitzt im Sand und weint in seinen Kanister. Rudi wird ihn später zum Spülen einstellen.' }],
  },
];

export const ENCOUNTERS_AKT2_SIDE: Record<string, EncounterDef> = byId(list);

export const part: ContentPart = { encounters: ENCOUNTERS_AKT2_SIDE };
