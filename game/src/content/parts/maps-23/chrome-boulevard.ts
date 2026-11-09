// Zone Chrome-Boulevard (world.md §3.5, ID-Plan design/plan/act23.json · pkg-chrome-himmel).
// Oberstadt-Prunk über den Wolken: Penthouse mit drei Balkonen, Boutique „Chrome & Co.“, Juwelier Glanzstück,
// Portierloge, Aufzug Chrome Tower (Himmelsgarten), Café-Terrasse „Le Nuage“, Pudelwiese, U-Bahn station-chrome-allee.
// Händler: shops-chrome-himmel.ts · Concierge-Tafel und Kopfgeld Blech-Schwestern: chrome-auftraege.ts.
// Herz-/Rivalitätsereignisse (Blade, Seraphina, Sybella, Serenity, Albert) legen die Figuren-Agenten an; die Spots stehen hier.
import type { Condition, DialogueDef, DialogueLine, MapDef, Polygon, Rect, StationDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const box = ([x, y, w, h]: Rect): Polygon => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const say = (...texts: string[]): DialogueLine[] => texts.map(text => ({ speaker: 'narrator', text }));

const ACT2: Condition = { act: 2 };
const ACT3: Condition = { act: 3 };
const EPILOG: Condition = { flag: 'epilog' };
const NICHT_EPILOG: Condition = { notFlag: 'epilog' };
const PARTYNACHT: Condition = { all: [ACT3, NICHT_EPILOG] };
const LADENZEIT: Condition = { clockBetween: [600, 1140] }; // 10–19 Uhr
const ALBERT_DIENST: Condition = { time: ['morgen', 'tag', 'abend'] };

/** Portier Albert lässt dich ins Penthouse (act23.json: Einladung, Teekränzchen, Herzen, Keks-Lieferung, gc-108, Nachspiel). */
const ALBERT_LAESST_REIN: Condition = {
  any: [
    { item: 'chrome-einladung' },
    { quest: 'side-teekraenzchen', state: 'active' },
    { hearts: 'seraphina-chrome', min: 4 },
    { hearts: 'sybella-chrome', min: 4 },
    { flag: 'teekraenzchen_keks_lieferung' },
    { flag: 'albert_laesst_rein' },
  ],
};
const PENTHOUSE_OFFEN: Condition = { any: [EPILOG, { all: [ACT2, ALBERT_LAESST_REIN] }] };

/** Aufzug Chrome Tower: Akt 3 erst nach dem Einlass (sonst Abkürzung am Gästeeingang vorbei), vorher nur als Besuch nach he-serenity-chrome-6. */
const TURM_OFFEN: Condition = {
  any: [
    EPILOG,
    { all: [ACT3, { quest: 'main-3-einlass', state: 'done' }] },
    { all: [{ not: ACT3 }, { seen: 'he-serenity-chrome-6' }, { time: ['morgen', 'tag'] }] },
  ],
};

const CONCIERGE_OFFEN: Condition = { all: [ACT2, { rep: 'chrome-haus', min: 30 }] };

const chromeBoulevard: MapDef = {
  id: 'chrome-boulevard',
  name: 'Chrome-Boulevard',
  subtitle: 'Oberstadt',
  size: [1536, 1024],
  district: 'oberstadt',
  lighting: 'outdoor',
  bg: 'bg-chrome-boulevard',
  bgVariants: [
    // Nexus-Ende: Banner mit dem Gesicht, Drohnen über dem Pflaster, alles in Violett.
    { when: { flag: 'ende_master' }, bg: 'bg-chrome-boulevard-master' },
    // Nachspiel mit Seraphinas Stiftung: Herzhaus-Banner, Suppenküche vor dem Café.
    { when: { all: [{ flag: 'epilog' }, { seen: 'he-seraphina-chrome-10' }] }, bg: 'bg-chrome-boulevard-stiftung' },
  ],
  walk: [
    // Boulevard von der Aufzugkuppel (links) bis zur Café-Terrasse (rechts), roter Teppich vor dem Penthouse,
    // Gasse hinter dem Juwelier, Campusstraße nach Norden.
    [[0, 330], [500, 330], [500, 300], [598, 300], [598, 330], [1070, 330], [1070, 215], [1140, 215], [1140, 330],
      [1400, 330], [1400, 0], [1520, 0], [1520, 380], [1536, 380], [1536, 868], [0, 868]],
  ],
  block: [
    // Aufzugkuppel (Panoramaaufzug), Laternen
    box([0, 360, 85, 250]), box([118, 315, 26, 90]), box([10, 615, 30, 130]),
    // Kordelpfosten am Penthouse, Concierge-Tafel vor der Portierloge
    box([480, 300, 22, 48]), box([598, 300, 22, 48]), box([755, 312, 50, 50]),
    // Mülleimer in der Gasse
    box([1072, 240, 30, 50]),
    // Pudelwiese: Heckenwürfel, Wasserspender, Werbedrohnen-Mast
    box([262, 505, 45, 55]), box([395, 605, 50, 65]), box([330, 560, 55, 65]), box([395, 560, 30, 35]),
    // Goldene Rolltreppe zur U-Bahn mit Bäumchen
    box([30, 680, 245, 190]), box([0, 750, 60, 118]), box([250, 750, 60, 118]),
    // Brunnen mit Blumenkübeln, Wolkenbank
    [[580, 720], [630, 690], [740, 690], [790, 720], [790, 840], [740, 852], [630, 852], [578, 840]],
    box([505, 750, 65, 70]), box([800, 750, 70, 70]), box([840, 765, 115, 90]),
    // Café-Terrasse „Le Nuage“ (erhöhtes Deck, Hecken, Laternen)
    box([1140, 640, 30, 150]), box([1165, 660, 371, 208]),
    box([1505, 600, 31, 100]),
  ],
  exits: [
    {
      id: 'nach-glasarkaden', rect: [0, 380, 112, 220], to: 'glasarkaden', entry: 'von-chrome-boulevard',
      label: 'Panoramaaufzug nach unten', interact: true, minutes: 5,
    },
    {
      id: 'penthouse-tuer', rect: [500, 240, 100, 90], to: 'chrome-penthouse', entry: 'von-chrome-boulevard',
      label: 'Chrome-Penthouse (Portierloge)', interact: true, when: PENTHOUSE_OFFEN,
      lockedText: 'Portier Albert hebt eine behandschuhte Hand: „Das Haus Chrome empfängt heute nicht. Und Sie, mit Verlaub, empfängt es nie.“',
    },
    {
      id: 'nach-quantum-campus', rect: [1400, 0, 120, 26], to: 'quantum-campus', entry: 'von-chrome-boulevard',
      label: 'Zum Quantum-Campus (Außengelände)', when: ACT2,
      lockedText: 'Eine Schranke mit Goldrand. Ein Schild: „Quantum-Campus · Nur für Mitarbeitende, Investoren und die Zukunft.“',
    },
    {
      id: 'turmaufzug', rect: [1200, 240, 90, 112], to: 'himmelsgarten', entry: 'von-chrome-boulevard',
      label: 'Aufzug Chrome Tower (Himmelsgarten)', interact: true, when: TURM_OFFEN, minutes: 5,
      lockedText: 'Der Aufzug hat keinen Knopf, nur ein Ohr aus Messing. Es hört dir zu und sagt: „Nein.“',
    },
  ],
  entries: {
    'von-glasarkaden': { at: [130, 500], facing: 'e' },
    'von-chrome-penthouse': { at: [550, 350], facing: 's' },
    'von-quantum-campus': { at: [1460, 90], facing: 's' },
    'von-himmelsgarten': { at: [1243, 350], facing: 's' },
    station: { at: [150, 650], facing: 'n' },
  },
  spots: {
    'aufzug-ankunft': { at: [130, 500], facing: 'e' },
    portierloge: { at: [728, 360], facing: 's' },
    'penthouse-eingang': { at: [550, 360], facing: 's' },
    'balkone-blick': { at: [420, 380], facing: 'n' },
    'boutique-chrome': { at: [260, 350], facing: 's' },
    'juwelier-glanzstueck': { at: [918, 350], facing: 's' },
    'boulevard-mitte': { at: [765, 520], facing: 's' },
    wolkenbank: { at: [895, 745], facing: 's' },
    promenade: { at: [420, 840], facing: 's' },
    'cafe-terrasse': { at: [1290, 630], facing: 's' },
    pudelwiese: { at: [310, 600], facing: 's' },
    'werbedrohne-start': { at: [455, 580], facing: 'w' },
    turmaufzug: { at: [1243, 345], facing: 'n' },
    'campus-schranke': { at: [1460, 70], facing: 'n' },
    'blech-schwestern-ecke': { at: [1112, 232], facing: 'n' },
    'ubahn-abgang': { at: [150, 655], facing: 's' },
    'auftrag-a': { at: [1050, 600], facing: 's' },
  },
  hotspots: [
    // --- Obere Reihe: Boutique, Penthouse, Portierloge, Juwelier, Turm ----------------------------------------
    { id: 'chrome-und-co', at: [260, 335], radius: 70, label: 'Chrome & Co.', kind: 'shop', shop: 'chrome-und-co', when: LADENZEIT },
    {
      id: 'chrome-und-co-zu', at: [260, 335], label: 'Chrome & Co. (geschlossen)', kind: 'look', when: { not: LADENZEIT },
      lines: say('Hinter der Scheibe tragen die Schaufensterpuppen Seidentücher in Blau, Rot und Grün. Ein Schild (eine goldene Uhr, Zeiger auf zehn) verrät: Hier wird erst geöffnet, wenn reiche Leute wach sind.'),
    },
    {
      id: 'boutique-schaufenster', at: [110, 335], label: 'Schaufenster ansehen', kind: 'look',
      lines: say('Drei Schaufensterpuppen, drei Seidentücher: Blau trägt die Nase hoch, Rot hält ein Preisschild, Grün schaut verträumt aus dem Fenster.',
        'Das Preisschild ist so klein gedruckt, dass man einen Juwelier zum Lesen bräuchte. Praktischerweise ist einer nebenan.'),
    },
    {
      id: 'balkone', at: [420, 370], radius: 56, label: 'Zu den Balkonen hochsehen', kind: 'look',
      lines: [
        { speaker: 'narrator', text: 'Drei Balkone, drei Farben, drei Meinungen. Blau: ein Stehpult und ein Fernglas Richtung Börse. Rot: eine Rechenmaschine mit Sonnenschirm. Grün: so viele Pflanzen, dass der Balkon langsam zum Dschungel wird.' },
        { speaker: 'narrator', text: 'Ein Passant flüstert: „Die drei reden nur per Hauspost miteinander. Mit Durchschlag.“' },
        { speaker: 'player', text: 'Und ich dachte, meine Familie wär kaputt.' },
      ],
    },
    {
      id: 'albert-bitte', at: [672, 350], radius: 56, label: 'Portier Albert um Einlass bitten', kind: 'talk',
      when: { all: [ACT2, ALBERT_DIENST, NICHT_EPILOG, { not: ALBERT_LAESST_REIN }] }, dialogue: 'chrome-albert-einlass',
    },
    {
      id: 'concierge-tafel', at: [780, 380], radius: 48, label: 'Concierge-Tafel', kind: 'board', board: 'concierge-chrome',
      when: CONCIERGE_OFFEN,
    },
    {
      id: 'concierge-tafel-zu', at: [780, 380], label: 'Concierge-Tafel', kind: 'look', when: { all: [ACT2, { not: CONCIERGE_OFFEN }] },
      lines: say('Eine Messingtafel mit Aufträgen, hinter Glas. Darunter, in Schönschrift: „Für Freunde des Hauses.“ (Ruf Haus Chrome 30)',
        'Du bist kein Freund des Hauses. Du bist bestenfalls ein Bekannter der Fußmatte.'),
    },
    {
      id: 'portierloge-nacht', at: [728, 345], label: 'Portierloge', kind: 'look', when: { time: 'nacht' },
      lines: say('Die Portierloge ist dunkel. Auf dem Pult liegen weiße Handschuhe, ordentlich gefaltet, wie zwei schlafende Tauben. Daneben ein Zettel: „Bin um sechs zurück. Ich sehe alles. – A.“'),
    },
    { id: 'glanzstueck', at: [918, 335], radius: 64, label: 'Juwelier Glanzstück', kind: 'shop', shop: 'glanzstueck', when: LADENZEIT },
    {
      id: 'glanzstueck-hologramm', at: [1010, 345], label: 'Diamant-Hologramm', kind: 'look',
      lines: say('Über dem Eingang dreht sich ein Diamant aus Licht, so groß wie ein Kühlschrank. Er wirft Regenbögen auf den Marmor und auf die Gesichter von Leuten, die ihn nie bezahlen könnten.',
        'Ein Wachmann steht daneben und bewacht ein Hologramm. Irgendwer hat für diesen Job studiert.'),
    },
    {
      id: 'datenwuerfel-11', at: [1092, 300], radius: 44, label: 'Mülleimer mit Goldrand (Schloss knacken)', kind: 'use',
      hideWhen: { wonMinigame: 'chrome-muelleimer-schloss' },
      lines: say('Ein Mülleimer mit Goldrand und Zahlenschloss. In der Oberstadt wird sogar der Abfall weggeschlossen. Durch den Schlitz blinkt etwas.'),
      effects: [{
        minigame: 'akt-schloss', level: 3, key: 'chrome-muelleimer-schloss', label: 'Mülleimer mit Goldrand',
        win: [{ give: 'datenwuerfel-11' }, { message: 'Zwischen Kaviardosen und einem einzelnen Seidenhandschuh: ein Datenwürfel.' }],
        lose: [{ message: 'Das Schloss klickt beleidigt zu. Selbst der Müll hier hat bessere Sicherheit als die Unterstadt-Bank.' }],
      }],
    },
    {
      id: 'juwelier-hintertuer', at: [1110, 225], label: 'Hintertür des Juweliers', kind: 'look', when: { not: { job: 'kopfgeld-blech-schwestern' } },
      lines: say('Eine schmale Stahltür mit drei Schlössern und einem Aufkleber: „Lieferanten bitte klingeln. Diebinnen bitte nicht.“ Jemand hat „Diebinnen“ mit Glitzerstift unterstrichen.'),
    },
    {
      id: 'turm-ohr', at: [1325, 340], label: 'Messing-Ohr am Chrome Tower', kind: 'look',
      lines: [
        { speaker: 'narrator', text: 'Neben der Aufzugtür hängt ein riesiges Ohr aus Messing. Es zuckt, wenn du näher kommst.' },
        { speaker: 'narrator', text: '„Himmelsgarten. Privat. Nur auf Einladung der Familie, nur mit Termin, nur mit Schuhen, die nicht quietschen.“' },
        { speaker: 'player', text: 'Meine quietschen nicht. Die schreien.' },
      ],
    },
    {
      id: 'turm-party-hinweis', at: [1243, 335], label: 'Aufzug Chrome Tower', kind: 'look',
      when: { all: [ACT3, NICHT_EPILOG, { not: { quest: 'main-3-einlass', state: 'done' } }] },
      lines: say('Heute Nacht trägt das Messing-Ohr eine Fliege. „Releaseparty? Gäste bitte über den Haupteingang des Quantum-Campus. Wer hier klingelt, steht nicht auf der Liste. Wer nicht auf der Liste steht, existiert heute Nacht nicht.“'),
    },
    {
      id: 'campus-schranke', at: [1460, 50], label: 'Schranke zum Quantum-Campus', kind: 'look', when: { not: ACT2 },
      lines: say('Eine Schranke mit Goldrand, dahinter ein Glasturm, dessen Spitze violett pulsiert. Ein Schild: „Quantum-Campus · Nur für Mitarbeitende, Investoren und die Zukunft.“'),
    },
    // --- Boulevard-Mitte, Pudelwiese, Werbedrohne -------------------------------------------------------------
    {
      id: 'goldmosaik', at: [765, 520], radius: 70, label: 'Goldmosaik im Boden', kind: 'look',
      lines: say('Im Marmor glänzt ein Mosaik aus echtem Gold: das Wappen der Familie Chrome, drei Kreise, die sich nicht berühren.',
        'Ein Putzroboter poliert es im Kreis. Er hat einen Rentenvertrag. Du nicht.'),
    },
    {
      id: 'pudelwiese', at: [300, 610], radius: 50, label: 'Pudelwiese', kind: 'look',
      lines: say('Ein Quadrat aus perfektem Kunstrasen. Jeder Halm ist gleich lang, jeder Halm ist grün, jeder Halm ist aus Plastik.',
        'Ein Schild (ein Pudel mit Krone) erklärt: Nur für Hunde mit Stammbaum. Und Implantaten. Und Anwalt.'),
    },
    {
      id: 'wasserspender', at: [358, 645], label: 'Goldener Hundewasserspender', kind: 'use', daily: true,
      lines: say('Das Wasser im goldenen Napf ist gefiltert, mineralisiert und leicht gekühlt. Besser als alles, was in der Unterstadt aus dem Hahn kommt.',
        'Du trinkst einen Schluck. Ein Pudel schaut dich an, als hättest du sein Testament gelesen.'),
      effects: [{ heal: 10 }, { message: 'Hundewasser, Premiumqualität. +10 LP.' }],
    },
    {
      id: 'werbedrohnen-mast', at: [455, 600], label: 'Werbedrohnen-Mast', kind: 'look',
      when: { not: { quest: 'side-chrome-pudel', state: 'active' } },
      lines: say('Auf einem schlanken Mast hängt eine goldene Werbedrohne und lädt. Auf ihrem Bauch blinkt ein Hologramm: ein Knochen aus Chrom. Jeder Pudel auf dem Boulevard starrt sie an wie eine Religion.'),
    },
    // --- Unten: Brunnen, Wolkenbank, Promenade, Café ------------------------------------------------------------
    {
      id: 'brunnen', at: [685, 678], radius: 60, label: 'Marmorbrunnen', kind: 'look',
      lines: say('Der Brunnen klatscht Applaus, wenn jemand eine Münze hineinwirft. Für Scheine gibt es stehende Ovationen.',
        'Du wirfst nichts hinein. Der Brunnen buht leise.'),
    },
    {
      id: 'glueckstern-12', at: [805, 722], label: 'Etwas funkelt am Brunnenrand', kind: 'loot', once: true,
      lines: say('Zwischen Wunschmünzen und einem verlorenen Manschettenknopf klemmt ein ausgeschnittener Blechstern. Ein Glücksstern aus der Unterstadt, hier oben. Irgendwer hat sich weit hochgewünscht.'),
      effects: [{ give: 'glueckstern-12' }],
    },
    {
      id: 'wolkenkante', at: [600, 862], radius: 70, label: 'Über die Glasbrüstung schauen', kind: 'look',
      lines: [
        { speaker: 'narrator', text: 'Unter der Glasbrüstung liegt ein Meer aus Wolken, weiß und weich wie ein Kissen, das man nicht anfassen darf.' },
        { speaker: 'narrator', text: 'Durch ein Loch in den Wolken siehst du tief unten die Unterstadt: Neon wie verschüttete Limo, Rauch wie schlechte Laune. Irgendwo da unten ist deine Wohnung. Von hier oben sieht sie aus wie ein Krümel.' },
        { speaker: 'player', text: 'Die schauen jeden Tag runter auf uns. Kein Wunder, dass die sich für was Besseres halten.' },
      ],
    },
    {
      id: 'wolkenbank', at: [895, 750], radius: 50, label: 'Bank an der Wolkenkante', kind: 'look',
      lines: say('Eine geschwungene Bank aus weißem Marmor, beheizt. Auf der Lehne eine Messingplakette ohne Namen. Hier sitzen nachts Liebespaare und tagsüber Leute, die so tun, als hätten sie Gefühle.'),
    },
    {
      id: 'cafe-terrasse', at: [1290, 640], radius: 64, label: 'Terrasse „Le Nuage“: lauschen', kind: 'look',
      when: { time: ['morgen', 'tag', 'abend'] }, dialogue: 'chrome-boulevard-klatsch',
    },
    {
      id: 'hochstapeln', at: [1095, 770], radius: 56, label: 'Hochstapeln: als reiche Person durchgehen', kind: 'use',
      when: { time: ['tag', 'abend'] }, daily: true,
      lines: say('Sonnenbrille auf, Kinn hoch, Hände in die Taschen, als wären da Aktien drin. Zeit, sich unter die Reichen zu mischen. Wer hier nicht auffällt, kassiert Trinkgeld. Wer auffällt, kassiert die Ordnungshüter.'),
      effects: [{
        minigame: 'akt-hochstapeln', level: 2, key: 'hochstapeln-chrome', label: 'Hochstapeln auf dem Boulevard',
        win: [{ rep: 'chrome-haus', delta: 1 }, { xp: 25 }, { message: 'Niemand hat etwas gemerkt. Eine Dame hat dir sogar ihre Visitenkarte gegeben. Mit Parfüm.' }],
        lose: [{ message: 'Aufgeflogen. Ein Pudel hat dich verraten. Pudel riechen Unterstadt durch drei Lagen Parfüm.' }],
      }],
    },
    {
      id: 'hochstapeln-profi', at: [1420, 640], radius: 50, label: 'Hochstapeln für Fortgeschrittene', kind: 'use',
      when: { all: [{ time: ['tag', 'abend'] }, { wonMinigame: 'hochstapeln-chrome' }] }, daily: true,
      lines: say('Heute ist ein Yachtclub-Empfang auf der Terrasse. Mehr Geld, mehr Fragen, mehr Fallen. Und ein Kellner, der dich schon zweimal komisch angesehen hat.'),
      effects: [{
        minigame: 'akt-hochstapeln', level: 3, key: 'hochstapeln-chrome-profi', label: 'Hochstapeln: Yachtclub-Empfang',
        win: [{ rep: 'chrome-haus', delta: 2 }, { xp: 40 }, { message: 'Du hast drei Leuten eine Yacht ausgeredet, die du nicht besitzt. Sie wollen trotzdem mit dir segeln.' }],
        lose: [{ message: '„Sektor 4? Da wohnt doch keiner mit Yacht.“ Der Kellner lächelt. Du gehst. Schnell, aber mit Würde.' }],
      }],
    },
    {
      id: 'werbe-hologramm', at: [440, 470], label: 'Werbe-Hologramm (Nachrichten)', kind: 'screen', when: NICHT_EPILOG,
    },
    {
      id: 'stiftungsbanner', at: [440, 470], label: 'Banner der Chrome-Stiftung', kind: 'look', when: { all: [EPILOG, { seen: 'he-seraphina-chrome-10' }] },
      lines: say('Wo früher das Werbe-Hologramm lief, hängt ein Banner aus blauer Seide: „Chrome-Stiftung für die Unterstadt“. Darunter eine Spendenbox aus Glas, randvoll. Ganz oben liegt ein Kronkorken. Von dir? Vielleicht.'),
    },
    // --- U-Bahn ---------------------------------------------------------------------------------------------------
    {
      id: 'ubahn-zugang', at: [150, 668], radius: 70, label: 'U-Bahn Chrome-Allee', kind: 'use',
      lines: say('Eine goldene Rolltreppe führt hinunter zur Station Chrome-Allee. Die Stufen sind beheizt. Für den Fall, dass jemand mit nackten Füßen U-Bahn fährt. Was hier niemand tut.'),
      effects: [{ unlockStation: 'station-chrome-allee' }, { cityMap: true }],
    },
    { id: 'ticketautomat', at: [300, 700], label: 'Ticketautomat', kind: 'shop', shop: 'ticketautomat' },
  ],
  foreground: [
    // Café-Schirme, Brunnenspitze, Werbedrohnen-Mast
    { rect: [1195, 615, 130, 75], baseY: 760 }, { rect: [1360, 625, 125, 80], baseY: 760 },
    { rect: [640, 660, 90, 70], baseY: 790 }, { rect: [365, 410, 100, 70], baseY: 590 },
  ],
  lights: [
    { at: [170, 220], radius: 140, color: '#ffe2a6', slots: ['abend', 'nacht'] },
    { at: [550, 170], radius: 170, color: '#ffd27a', slots: ['abend', 'nacht'] },
    { at: [728, 265], radius: 90, color: '#fff1c4', slots: ['abend', 'nacht'] },
    { at: [918, 135], radius: 170, color: '#a8f4ff', intensity: 0.9 },
    { at: [1243, 200], radius: 130, color: '#ffcf7a', slots: ['abend', 'nacht'] },
    { at: [1460, 40], radius: 100, color: '#c58bff', slots: ['abend', 'nacht'] },
    { at: [685, 760], radius: 150, color: '#bff6ff', intensity: 0.6, slots: ['abend', 'nacht'] },
    { at: [1350, 740], radius: 190, color: '#ffc98a', slots: ['abend', 'nacht'] },
    { at: [150, 710], radius: 130, color: '#ffd27a', slots: ['abend', 'nacht'] },
    { at: [40, 480], radius: 120, color: '#9ff0ff', slots: ['abend', 'nacht'] },
    { at: [430, 470], radius: 80, color: '#ff6af0', slots: ['abend', 'nacht'] },
    { at: [130, 330], radius: 80, color: '#ffe8b0', slots: ['abend', 'nacht'] },
    { at: [25, 630], radius: 80, color: '#ffe8b0', slots: ['abend', 'nacht'] },
    { at: [1155, 655], radius: 80, color: '#ffe8b0', slots: ['abend', 'nacht'] },
    { at: [1515, 615], radius: 80, color: '#ffe8b0', slots: ['abend', 'nacht'] },
  ],
  ambient: {
    count: 8,
    sprites: ['passant-anzug-walk', 'passant-tourist-walk', 'passant-oma-walk', 'passant-kurier-walk'],
    bySlot: { morgen: 4, tag: 10, abend: 8, nacht: 3 },
    routes: [
      [[140, 420], [700, 420], [1300, 400], [1470, 400]],
      [[1460, 60], [1460, 420], [900, 600], [520, 480]],
      [[330, 850], [500, 700], [1000, 660], [1100, 850], [1000, 850]],
      [[500, 470], [765, 440], [1000, 520], [765, 620], [500, 470]],
      [[260, 400], [230, 470], [470, 680], [1050, 760]],
      [[1290, 620], [1100, 460], [918, 380]],
    ],
    barks: [
      { text: 'Unterstadt? Das klingt wie eine Erkältung.' },
      { text: 'Mein Pudel hat mehr Implantate als du.' },
      { text: 'Riechst du das? Das ist Erfolg. Oder der neue Bodenreiniger.' },
      { text: 'Schatz, nicht hinsehen. Das da hat Schuhe mit Schnürsenkeln.' },
      { text: 'Wer hat dich denn hier hochgelassen? Der Wind?' },
      { text: 'Ich habe heute schon dreimal Personal gewechselt. Das Personal hat geweint. Ich auch, aus Mitgefühl.' },
      { text: 'Geh weiter, du Rostgurke. Du stehst in meinem Selfie.' },
      { text: 'Sag mal, sind das echte Narben? Wie … authentisch.' },
      { text: 'Die Wolken sind heute wieder so … weich. Ich hasse weich.' },
      { text: 'Bonjour! Oder wie man hier sagt: Platz da!' },
      { text: 'Morgens um sieben ist die Welt noch in Ordnung. Ab acht kommt das Personal.', when: { time: 'morgen' } },
      { text: 'Die Boutiquen schließen um sieben. Danach muss man sich mit sich selbst beschäftigen. Grauenhaft.', when: { time: 'abend' } },
      { text: 'Liebling, lass uns noch auf der Bank sitzen. Das kostet nichts. Glaube ich.', when: { time: 'nacht' } },
      { text: 'Ich kann die Releaseparty kaum erwarten. Ich weiß nur nicht mehr, warum.', when: { all: [ACT2, NICHT_EPILOG] } },
      { text: 'Blade sagt, Teilen ist was für Leute ohne Personal.', when: { all: [ACT2, NICHT_EPILOG] } },
      { text: 'Chrome 10 hat mein Leben verändert. Wie, weiß ich nicht. Aber es ist jetzt ruhiger da oben.', when: { all: [ACT2, NICHT_EPILOG] } },
      { text: 'Ja, Master. Natürlich, Master. Zwei Croissants, Master.', when: { all: [ACT2, NICHT_EPILOG] } },
      { text: 'Heute ist die Party! Ich hab mir extra einen Chip zum Kleid gekauft.', when: PARTYNACHT },
      { text: 'Ich habe heute selbst Kaffee gekocht. Er war furchtbar. Ich bin so stolz.', when: EPILOG },
      { text: 'Seraphina gibt Geld an die Unterstadt? Freiwillig? Ruft einen Arzt!', when: EPILOG },
      { text: 'Ich war gestern zum ersten Mal unten. Die haben da Suppe. Für drei Credits. Ich habe geweint.', when: EPILOG },
      { text: 'Blade sitzt? Na endlich. Er hat nie bezahlt im Café.', when: { all: [EPILOG, { flag: 'blade_gefasst' }] } },
    ],
  },
  ambience: 'oberstadt',
  music: 'oberstadt',
  station: 'station-chrome-allee',
  onEnter: [
    { id: 'chrome-boulevard-ankunft', once: true, dialogue: 'chrome-boulevard-ankunft' },
    { id: 'chrome-boulevard-party', once: true, when: PARTYNACHT, dialogue: 'chrome-boulevard-partynacht' },
    { id: 'chrome-boulevard-nachspiel', once: true, when: EPILOG, dialogue: 'chrome-boulevard-nachspiel' },
  ],
};

const DIALOGUES: Record<string, DialogueDef> = {
  'chrome-boulevard-ankunft': {
    id: 'chrome-boulevard-ankunft', start: 'a',
    nodes: [{
      id: 'a',
      lines: [
        { speaker: 'narrator', text: 'Die Aufzugtüren gleiten auf, und die Luft schmeckt nach Sonne. Echter Sonne. Hier oben gibt es keinen Smog, nur Wolken, und die liegen unter dir.' },
        { speaker: 'narrator', text: 'Weißer Marmor, goldene Kanten, Pudel mit Schleifen und Menschen, die aussehen, als hätten sie noch nie eine Tür selbst geöffnet.' },
        { speaker: 'player', text: 'Der Chrome-Boulevard. Ich glaub, ich bin gerade allergisch auf Geld geworden.' },
      ],
    }],
  },
  'chrome-boulevard-partynacht': {
    id: 'chrome-boulevard-partynacht', start: 'a',
    nodes: [{
      id: 'a',
      lines: [
        { speaker: 'narrator', text: 'Heute Nacht leuchtet der ganze Boulevard violett. Über dem Chrome Tower kreisen Lichterkugeln, und ganz oben, im Himmelsgarten, wummert Musik.' },
        { speaker: 'narrator', text: 'Die Passanten lächeln alle gleich. Zu gleich.' },
      ],
    }],
  },
  'chrome-boulevard-nachspiel': {
    id: 'chrome-boulevard-nachspiel', start: 'a',
    nodes: [{
      id: 'a',
      lines: [
        { speaker: 'narrator', text: 'Der Boulevard ist derselbe und doch nicht. Die Werbehologramme sind aus. Ein Pudel trägt eine Sonnenbrille. Ein Mann im Maßanzug trägt eine Thermoskanne mit Suppe aus der Unterstadt.' },
        { speaker: 'player', text: 'Sieh an. Die Oberstadt hat gelernt, selbst Kaffee zu kochen.' },
      ],
    }],
  },
  'chrome-albert-einlass': {
    id: 'chrome-albert-einlass', start: 'start',
    nodes: [
      {
        id: 'start',
        lines: [
          { speaker: 'portier-albert', text: 'Guten Tag. Sie wünschen? Nein, sagen Sie es nicht. Sie wünschen hinein. Das wünschen alle. Die Familie Chrome wünscht dagegen, nicht gestört zu werden. Raten Sie, wessen Wunsch hier zählt.' },
        ],
        choices: [
          {
            text: '„Albert. Ein Mann mit Ihrer Haltung erkennt doch auf den ersten Blick, wer hierher gehört.“',
            check: 'gc-108', next: 'charme',
          },
          {
            text: '„Meine Familie hat auf dem Boulevard gewohnt, als Sie noch Handschuhe zum Wachsen hatten.“',
            tag: '[Oberstadt]', when: { origin: 'origin-oberstadt' }, next: 'oberstadt',
          },
          {
            text: 'Ihm die Papierzeitung von heute reichen.',
            requires: { item: 'zeitung-papier' }, next: 'zeitung',
          },
          { text: '„Ich hätte da fünfzig Credits Trinkgeld.“', requires: { credits: 50 }, next: 'trinkgeld' },
          { text: '„Wie komme ich denn sonst zu den Schwestern?“', next: 'wege' },
          { text: 'Gehen.' },
        ],
      },
      {
        id: 'charme',
        lines: [
          { speaker: 'portier-albert', text: 'Hm. Sie stehen gerade. Sie haben „Albert“ gesagt und nicht „Alter“. Und Sie haben, das gebe ich zu, einen gewissen … Schliff. Wie ein Schraubenschlüssel mit Krawatte.' },
          { speaker: 'portier-albert', text: 'Treten Sie ein. Füße abtreten. Beide. Und wenn der Pudel knurrt, war das nicht meine Schuld.' },
        ],
        effects: [{ setFlag: 'albert_laesst_rein' }, { relation: 'portier-albert', delta: 20 }, { message: 'Albert lässt dich ins Penthouse.' }],
      },
      {
        id: 'oberstadt',
        lines: [
          { speaker: 'portier-albert', text: 'Oh. OH. Sie sind … aus einer dieser Familien. Ich erinnere mich an Ihr Kinn. Es war damals kleiner und hat mich mit Erbsen beworfen.' },
          { speaker: 'portier-albert', text: 'Bitte. Eintreten. Und richten Sie Ihrer Mutter nichts aus.' },
        ],
        effects: [{ setFlag: 'albert_laesst_rein' }, { relation: 'portier-albert', delta: 10 }],
      },
      {
        id: 'zeitung',
        lines: [
          { speaker: 'narrator', text: 'Albert nimmt die Zeitung mit zwei Fingern. Dann mit allen zehn. Er riecht daran. Er schließt die Augen.' },
          { speaker: 'portier-albert', text: 'Papier. Echtes Papier. Mit Druckerschwärze, die abfärbt. Wissen Sie, wie lange ich mir nicht mehr die Finger schmutzig gemacht habe? Vierzig Jahre.' },
          { speaker: 'portier-albert', text: 'Gehen Sie hinein, bevor ich sentimental werde. Ich werde nie sentimental. Gehen Sie.' },
        ],
        effects: [{ take: 'zeitung-papier' }, { setFlag: 'albert_laesst_rein' }, { relation: 'portier-albert', delta: 40 }],
      },
      {
        id: 'trinkgeld',
        lines: [
          { speaker: 'narrator', text: 'Albert nimmt die fünfzig Credits, faltet den Chip in ein Taschentuch und steckt ihn ein.' },
          { speaker: 'portier-albert', text: 'Vielen Dank. Das spende ich dem Verein für verwaiste Handschuhe. Die Antwort bleibt nein. Bestechung ist etwas für Leute ohne Stil. Sie haben eben bewiesen, dass Sie einer sind.' },
          { speaker: 'player', text: 'Du gieriger alter Sack.' },
          { speaker: 'portier-albert', text: 'Gieriger alter Sack mit Pension. Guten Tag.' },
        ],
        effects: [{ credits: -50 }, { relation: 'portier-albert', delta: -10 }],
      },
      {
        id: 'wege',
        lines: [
          { speaker: 'portier-albert', text: 'Sie könnten eingeladen werden. Das passiert Menschen wie Ihnen ungefähr so oft wie Regen hier oben. Also nie.' },
          { speaker: 'portier-albert', text: 'Oder Sie werden eine Freundin, ein Freund der Damen. Lady Seraphina mag Menschen mit Visionen. Lady Sybella mag Menschen mit Rabatten. Lady Serenity mag … alle. Das ist ihr Problem.' },
          { speaker: 'portier-albert', text: 'Und ich, falls es Sie interessiert, mag Papier. Echtes. Nicht diese leuchtenden Dinger.' },
        ],
        next: 'start',
      },
    ],
  },
  'chrome-boulevard-klatsch': {
    id: 'chrome-boulevard-klatsch', start: 'start',
    nodes: [
      {
        id: 'start',
        lines: say('Auf der Terrasse „Le Nuage“ trinken Leute Tee aus Tassen, die mehr kosten als dein Bett. Sie reden laut, weil sie nie leise sein mussten.'),
        choices: [
          { text: 'Dem Tisch mit den Perlenketten lauschen.', next: 'perlen' },
          { text: 'Dem Tisch mit den Anzügen lauschen.', next: 'anzuege', when: ACT2 },
          { text: 'Den Kellner fragen, was es Neues gibt.', next: 'kellner' },
          { text: 'Weitergehen.' },
        ],
      },
      {
        id: 'perlen',
        lines: [
          { speaker: 'narrator', text: '„… und dann sagt Seraphina, sie hält jetzt Reden vor Tauben, weil die wenigstens nicht widersprechen.“ – „Tauben widersprechen nie. Deshalb sind sie so beliebt im Vorstand.“' },
          { speaker: 'narrator', text: '„Habt ihr gehört? Sybella war wieder auf dem Schrottmarkt. Verkleidet. Mit Schnurrbart.“ – „Schon wieder? Das arme Schnurrbart-Personal.“' },
        ],
        next: 'start',
      },
      {
        id: 'anzuege',
        lines: [
          { speaker: 'narrator', text: '„Die Releaseparty im Himmelsgarten wird gigantisch. Blade hat versprochen, dass danach alle viel … entspannter sind.“ – „Ich bin jetzt schon entspannt. Seit dem Update.“ – „Was für ein Update?“ – „Weiß ich nicht mehr.“' },
          { speaker: 'narrator', text: '„Sybella sucht übrigens eine diskrete Beratung für Marktanalysen. Steht in der Boutique am Schaufenster. Sie will wohl wissen, was die Unterstadt so denkt. Als ob die denkt.“' },
          { speaker: 'player', text: 'Die Unterstadt denkt sehr viel. Meistens über euch. Und selten was Nettes.' },
        ],
        effects: [{ setFlag: 'klatsch-chrome-einladung' }],
        next: 'start',
      },
      {
        id: 'kellner',
        lines: [
          { speaker: 'narrator', text: 'Der Kellner mustert dich von den Schuhen aufwärts. Er kommt nicht weit.' },
          { speaker: 'narrator', text: '„Neues? Der Pudel von Madame Pompadura hat einen Instagram-Vertrag, der Brunnen klatscht jetzt auch für Schecks, und die Schranke zum Campus wird nachts von einer Drohne mit Schlafstörungen bewacht.“' },
          { speaker: 'narrator', text: '„Ach, und für Sie? Wasser. Ohne Glas. Zum Mitnehmen.“' },
        ],
        next: 'start',
      },
    ],
  },
};

const station: StationDef = {
  id: 'station-chrome-allee', name: 'Chrome-Allee', map: 'chrome-boulevard', entry: 'station', cityPos: [0.69, 0.1],
  // Kein `when`: Die Station wird erst beim Besuch (MapDef.station) bzw. am U-Bahn-Zugang freigeschaltet.
};

export const part: ContentPart = {
  maps: { 'chrome-boulevard': chromeBoulevard },
  stations: { 'station-chrome-allee': station },
  dialogues: DIALOGUES,
};
