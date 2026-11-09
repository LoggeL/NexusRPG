// Der Kameramann in Akt 2, Akt 3 und im Nachspiel – nur Visier-Anzeigen (world.md §4.4, §5.3–5.5).
// Keine Inhaltsdatei: kameramann.ts baut daraus Figur und Teil.
// - he-kameramann-8: Premiere „Ungeschminkt“ als Freiluftkino an der Hafenkante, eine Quantum-Drohne will abschalten,
// - he-kameramann-10: die letzte Szene seines Films am Filmposten, Andenken kameradrohne-mini,
// - Tagesgespräche zu Drohnen, Chips (Helm aus zwei Toastern), Nyra, Aria, Party, Partynacht, Enden, Master-Modus,
// - Tagesablauf: Presse-Ecke im Foyer und Presse-Podest im Himmelsgarten (act23.json, vorangestellt),
//   im Nachspiel am Wochenende Sonnenuntergang filmen am Meer.
import type { Condition, DialogueDef, PhoneMessageDef, ScheduleEntry, TalkDef } from '../../../modules/contracts';
import {
  type Menu, ARIA_WEG, ARIA_ZURUECK, ENDE_3B, ENDE_NEXUS, EPILOG, MASTER, MEER_ENDE, NACH_BRUCH, NYRA_WEG, PARTYNACHT,
  PARTY_PLAN, VEX, all, chk, daily, dlg, erz, ich, noFlag, node, not, rel, rep, set, sp, talk, weiter, xp,
} from './_util';

const K = sp('kameramann');
const A = sp('aria');
const H = sp('hunter');
const R = sp('ripper');
const C = sp('collin-charleston');

const ARIA_DA: Condition = { not: ARIA_WEG };
const EINLASS_OFFEN: Condition = { not: { quest: 'main-3-einlass', state: 'done' } };

// ------------------------------------------------------------------------------------------- he-kameramann-8

const he8 = dlg('he-kameramann-8', [
  node('start', [
    erz('Ein Bettlaken, an zwei Kränen der Hafenkante aufgespannt. Ein Projektor auf einem Ölfass. Davor: die halbe Unterstadt auf Kisten, Fässern und Klappstühlen. Auf dem Laken, in krakeliger Schrift: „UNGESCHMINKT – ein Film ohne Ton“.'),
    K('[PREMIERE. PUBLIKUM: 212.]'),
    K('[NERVOSITÄT: 400 %.]', 'besorgt'),
    erz('Dann ein Summen über dem Kai. Eine Quantum-Drohne, weiß, glatt, mit einem Scheinwerfer, der die Menge abtastet wie eine Zunge.'),
    sp('narrator')('„Nicht genehmigte Versammlung. Nicht genehmigtes Bildmaterial. Bitte kehren Sie in Ihre Wohnungen zurück. Chrome 10 gilt auch für Ihre Heimfahrt.“'),
    K('[ NEIN ]', 'wut'),
  ], {
    choices: [
      { text: 'Die Drohne mit ihrem eigenen Wartungscode in den Begrüßungsmodus schicken.', check: chk('he-kameramann-8-drohne', 'technik', 6, ['drohnen', 'hacken']), next: 'technik' },
      { text: 'Ein Stück Schrott werfen. Genau auf die Linse.', check: chk('he-kameramann-8-wurf', 'reflexe', 6, ['werfen', 'zielen']), next: 'wurf' },
      { text: 'Zur Menge: „Alle mal kurz lächeln! Die filmt uns doch eh!“', check: chk('he-kameramann-8-menge', 'ausstrahlung', 5, ['menge', 'ueberreden']), next: 'menge' },
      { text: 'Dich vor den Projektor stellen und das Laken mit deinem Schatten verdecken, bis sie weg ist.', next: 'schatten' },
    ],
  }),
  node('technik', [
    erz('Du findest den Wartungsport unter dem Scheinwerfer, tippst drei Ziffern, die jeder Quantum-Techniker am Kiosk ausplaudert, und die Drohne verbeugt sich. „Willkommen bei Quantum! Darf ich Ihnen den Weg zum nächsten Shop zeigen?“'),
    erz('Sie bleibt. Ihr Scheinwerfer bleibt auch. Er strahlt jetzt aufs Laken. Heller als der Projektor.'),
    K('[ : D ]'),
  ], { effects: [rel('kameramann', 20)], next: 'film' }),
  node('wurf', [
    erz('Eine verbogene Schraube, ein Bogen, ein Klack. Die Linse splittert, die Drohne dreht sich zweimal um sich selbst, sagt „Auf Wiedersehen“ und landet im Hafenbecken. Die Menge johlt.'),
    R('Das war eine Quantum-Drohne. Weißt du, was die Teile wert sind? Ich hol die raus. Später. Wenn keiner guckt.', 'freude'),
  ], { effects: [rel('kameramann', 20), rep('unterstadt', 3)], next: 'film' }),
  node('menge', [
    ich('Sie filmt uns! Dann geben wir ihr was zu filmen! Alle: Lächeln! Winken! Zeigt ihr, wie die Unterstadt aussieht, wenn sie Spaß hat!'),
    erz('Zweihundert Leute winken der Drohne. Einer zeigt ihr den Mittelfinger, sehr freundlich. Die Drohne zögert, rechnet, kommt zu dem Schluss, dass das hier keine Versammlung ist, sondern ein Werbespot, und fliegt weiter.'),
  ], { effects: [rel('kameramann', 20), rep('unterstadt', 5)], next: 'film' }),
  node('schatten', [
    erz('Du stellst dich vor den Projektor. Dein Schatten frisst das halbe Laken. Die Drohne tastet das Laken ab, findet nur eine schwarze Gestalt mit verschränkten Armen und wird nicht schlau daraus.'),
    erz('Nach einer Minute summt sie davon. Hinter dir tippt dir jemand auf die Schulter: der Kameramann. Sein Visier zeigt dein Schattenbild. Er hat es gefilmt.'),
    K('[DAS KOMMT REIN.]'),
  ], { effects: [rel('kameramann', 20)], next: 'film' }),
  node('film', [
    erz('Das Licht geht aus. Der Projektor rattert. Und der Film beginnt.'),
    erz('Babettes Hände, die Teig falten. Gustavs Kran im Morgennebel. Darias Taube auf einem Stromkabel. Hunter, der heimlich Trinkgeld zurück in eine Jackentasche schiebt. Deine acht Fotos. Ein alter Mann an der Flutmauer, der dem Meer zuprostet. Und am Ende ein Standbild der Stadt bei Nacht, die atmet.'),
    erz('Kein Ton. Keine Musik. Nur der Hafen, der gluckert, und zweihundertzwölf Leute, die ganz leise werden.'),
  ], { choices: weiter([[all(VEX, ARIA_DA), 'aria-vex'], [ARIA_DA, 'aria'], [null, 'hunter']]) }),
  node('aria-vex', [
    A('Ich heul nicht. ICH HEUL NICHT. Das ist Rost im Auge. Vex, sag denen, dass das Rost ist.', 'trauer'),
    ich('Das ist Rost.'),
    A('Danke. … Halt meine Hand. Wegen dem Rost.', 'zaertlich'),
  ], { next: 'ende' }),
  node('aria', [A('Ich heul nicht. ICH HEUL NICHT. Das ist Rost im Auge. Wer hat hier Rost hingemacht?!', 'trauer')], { next: 'ende' }),
  node('hunter', [
    H('Wer hat das gefilmt? Das mit dem Trinkgeld? Das ist … das ist Rufmord. Ich bin ein harter Hund.', 'besorgt'),
    erz('Er setzt die Sonnenbrille auf. Nachts. Unter einem Bettlaken. Niemand sagt was.'),
  ], { next: 'ende' }),
  node('ende', [
    K('[ : ) ]'),
    K('[PUBLIKUM: 212. HEULEND: 211.]'),
    K('[DER 212. IST RIPPER. ER BEHAUPTET, ES IST LÖTDAMPF.]'),
    R('Es IST Lötdampf. Hier dampft’s überall. Das ist ein Hafen.', 'trauer'),
    erz('Der Kameramann dreht sich zu dir um. Auf seinem Visier läuft ganz klein, wie ein Abspann: „KAMERA: K. – FOTOS: {name}“.'),
  ], {
    choices: [
      { text: '„Das ist dein Film. Nicht meiner.“', next: 'deiner' },
      { text: 'Ihn umarmen. Helm und alles.', next: 'umarmen' },
      { text: 'Applaudieren. Laut. Als Allererstes.', next: 'applaus' },
    ],
  }),
  node('deiner', [K('[OHNE DEINE FOTOS: 80 MINUTEN KRÄNE.]'), K('[UNSER FILM.]')], { next: 'schluss' }),
  node('umarmen', [K('[ !!! ]', 'ueberrascht'), K('[KÖRPERKONTAKT. UNERWARTET.]'), K('[NICHT LOSLASSEN. NOCH 3 SEKUNDEN.]')], { effects: [rel('kameramann', 20)], next: 'schluss' }),
  node('applaus', [erz('Du klatschst. Dann klatscht der Kai. Dann der halbe Hafen, und irgendwo hupt ein Taxi dreimal.'), K('[ : ) ]')], { next: 'schluss' }),
  node('schluss', [], { effects: [xp(80), rel('kameramann', 40), rep('unterstadt', 10), set('kameramann_premiere')] }),
]);

// ------------------------------------------------------------------------------------------- he-kameramann-10

const he10 = dlg('he-kameramann-10', [
  node('start', [
    erz('Der Filmposten am Schrottmarkt, Sonnenuntergang. Der Kameramann hat sein Stativ aufgebaut, aber keine Kamera drauf. Stattdessen sitzt da, winzig wie eine Hummel, eine Drohne mit einer Linse so groß wie ein Stecknadelkopf.'),
    K('[MEIN FILM HAT KEINE LETZTE SZENE.]'),
    K('[ICH WEISS JETZT, WARUM.]'),
    K('[ICH BIN NIE IM BILD.]', 'besorgt'),
  ], {
    choices: [
      { text: '„Dann stell dich hin. Ich film dich.“', next: 'filmen' },
      { text: 'Die Drohne so programmieren, dass sie euch beide im Bild hält.', check: chk('he-kameramann-10-drohne', 'technik', 5, ['drohnen', 'kamera']), next: 'beide' },
      { text: '„Nimm den Helm ab. Nur einmal. Für die Szene.“', next: 'helm' },
    ],
  }),
  node('filmen', [
    erz('Du nimmst die Drohne. Er stellt sich vor den Markt, ganz steif, die Arme gerade, wie jemand, der zum ersten Mal ein Passfoto macht.'),
    K('[WAS MACH ICH MIT DEN HÄNDEN?]', 'besorgt'),
    ich('Was du immer machst. Guck dir die Stadt an.'),
    erz('Er dreht sich um. Zur Stadt. Zum Markt, zu Babette, zum Kran, zu den Kindern, die Konfetti von einer Plane klauen. Und du filmst einen Mann, der eine Stadt ansieht, als wär sie ein Mensch, den er liebt.'),
  ], { next: 'szene' }),
  node('beide', [
    erz('Ein paar Handgriffe, ein Wackeln, und die Drohne steigt auf, dreht eine Runde und schwebt dann eine Armlänge vor euch, ruhig wie ein Kolibri.'),
    K('[ZWEI IM BILD.]', 'ueberrascht'),
    K('[DAS IST NEU.]'),
    erz('Ihr sitzt auf der Kiste am Filmposten, der Markt leuchtet orange, und keiner von euch sagt was. Das muss man auch nicht. Die Drohne hat keinen Ton.'),
  ], { effects: [rel('kameramann', 20)], next: 'szene' }),
  node('helm', [
    K('[ … ]'),
    erz('Lange passiert nichts. Dann greift er nach dem Helm. Er hebt ihn ein kleines Stück an, gerade so weit, dass du ein Kinn siehst, einen Mundwinkel, ein bisschen sehr unordentliches Haar.'),
    erz('Der Mundwinkel lächelt. Dann ist der Helm wieder unten.'),
    K('[DAS WAR DIE SZENE.]'),
    K('[FRISUR: IMMER NOCH KATASTROPHE.]', 'ueberrascht'),
  ], { effects: [rel('kameramann', 20), set('kameramann_laecheln_gesehen')], next: 'szene' }),
  node('szene', [
    K('[LETZTE SZENE: GEDREHT.]'),
    K('[DER FILM IST FERTIG.]'),
    erz('Er nimmt die Drohne vom Stativ und legt sie dir in die Hand. Auf ihrer Unterseite klebt ein Sticker: „[ : ) ]“.'),
    K('[DAMIT DU AUCH HINTER DEM BILD SEIN KANNST.]'),
    K('[MANCHMAL.]'),
    K('[DANKE. DAS IST DAS ERSTE MAL, DASS ICH ES SCHREIBE.]'),
  ], { effects: [{ give: 'kameradrohne-mini' }, xp(120), rel('kameramann', 50), set('kameramann_film_fertig')] }),
]);

// ------------------------------------------------------------------------------------------- Tagesgespräche Akt 2/3

function gespraeche(M: Menu): DialogueDef[] {
  const drohnen = daily('kameramann-tag-akt2-drohnen',
    [K('[QUANTUM-DROHNEN: 14 HEUTE.]', 'wut'), K('[SIE FILMEN DIE STADT. ICH FILME SIE BEIM FILMEN.]')],
    [
      K('[EINE HAT MEINE SPEICHERKARTE VERLANGT.]'),
      K('[ICH HAB IHR EINE GEGEBEN. DARAUF: 3 STUNDEN TAUBEN.]', 'ueberrascht'),
      K('[SIE HAT SICH BEDANKT.]'),
    ],
    M);
  const chips = daily('kameramann-tag-akt2-chips',
    [K('[CHIP? NEIN.]'), K('[HELM AUS ZWEI TOASTERN = ABSCHIRMUNG.]'), K('[ZUFALL. ABER ICH NEHM’S.]', 'ueberrascht')],
    [
      K('[DIE GECHIPPTEN LÄCHELN ALLE GLEICH.]'),
      K('[ICH HAB 40 GESICHTER ÜBEREINANDERGELEGT. ES IST EIN LÄCHELN.]', 'besorgt'),
      K('[DAS LÄCHELN VON BLADE.]'),
    ],
    M);
  const chrome = daily('kameramann-tag-akt2-chrome',
    [K('[CHROME 10: 312 WERBESPOTS HEUTE.]'), K('[ICH HABE 312 MAL „AUFNAHME LÄUFT“ GEZEIGT. AUS PROTEST.]')],
    [K('[COLLIN MUSS JEDEN SPOT ANMODERIEREN.]'), K('[ER HAT HEUTE ZWEIMAL „CHROME 9“ GESAGT. ABSICHTLICH.]', 'ueberrascht'), C('Ein Versprecher! Ein VERSPRECHER! … Sag’s keinem.', 'verlegen')], M);
  const nyra = daily('kameramann-tag-nyra',
    [K('[NYRA.]', 'besorgt'), K('[LETZTE AUFNAHME: LABORFENSTER, 87. STOCK, 02:14 UHR.]'), K('[SIE HAT GEWUNKEN.]')],
    [K('[ICH HAB DAS BILD VERGRÖSSERT. 400 %.]'), K('[SIE TRÄGT NOCH DEN KOPFHÖRER.]'), K('[SIE HÖRT NOCH MEERESRAUSCHEN. GLAUB ICH.]')],
    M, { effects: [set('kameramann_nyra_gezeigt')] });
  const ariaWeg = daily('kameramann-tag-aria-weg',
    [K('[ARIA.]', 'besorgt'), K('[KANALKAMERA 7, 05:40 UHR: EINE TRAGE. EIN MANN MIT KRALLEN.]')],
    [K('[RICHTUNG: PUMPWERK SIEBEN.]'), K('[ICH HAB NICHTS GESENDET. ABER ICH HAB ES DIR GEZEIGT.]')],
    M, { effects: [set('kameramann_aria_spur')] });
  const ariaZurueck = daily('kameramann-tag-aria-zurueck',
    [K('[ARIA LACHT WIEDER.]'), K('[GEFILMT. VON WEITEM. 4 STUNDEN.]', 'ueberrascht')],
    [K('[SIE HAT MICH ERWISCHT UND MIR DEN HELM GEKLOPFT.]'), K('[ZWEIMAL. FREUNDLICH. GLAUB ICH.]')],
    M, { effects: [set('kameramann_aria_zurueck')] });
  const party = daily('kameramann-tag-party',
    [K('[RELEASEPARTY: AKKREDITIERT.]'), K('[ICH. KAMERA 2. COLLIN. DELYA.]')],
    [
      K('[WENN ES KNALLT: ICH FILME.]'),
      K('[DANN SIEHT ES DIE STADT. LIVE. UNGESCHNITTEN.]', 'besorgt'),
      K('[ICH HAB EIN ZWEITES KABEL. FALLS JEMAND DAS ERSTE ZIEHT.]'),
    ],
    M);
  const partyFoyer = daily('kameramann-tag-partynacht-foyer',
    [K('[AUFNAHME LÄUFT.]'), K('[HÄNDE: ZITTERN. BILD: STABIL. BILDSTABILISATOR: HELD DES ABENDS.]', 'besorgt')],
    [K('[COLLIN HAT DREIMAL DIE FRISUR GEPRÜFT. IN MEINER LINSE.]'), K('[DELYA HAT EINE FRAGE AUFGESCHRIEBEN. SIE ZEIGT SIE KEINEM.]')],
    M);
  const partyPodest = daily('kameramann-tag-partynacht',
    [K('[AUFNAHME LÄUFT.]'), K('[DIESMAL: ALLES.]')],
    [K('[BLADE HAT MICH ANGELÄCHELT.]', 'besorgt'), K('[ICH HAB DAS BILD UNSCHARF GESTELLT. AUS NOTWEHR.]')],
    M);
  const endeErst = dlg('kameramann-tag-ende', [
    node('start', [K('[ : ) ]')], { choices: weiter([[ENDE_NEXUS, 'nexus'], [ENDE_3B, 'dreib'], [null, 'meer']]) }),
    node('meer', [
      K('[TURM: DUNKEL. STADT: WACH.]'),
      K('[MEINE AUFNAHMEN VON DER PARTY: 11 STUNDEN.]'),
      K('[NX-1 HAT ALLES GESENDET. ZUM ERSTEN MAL OHNE SCHNITT.]', 'ueberrascht'),
    ], { next: 'schluss' }),
    node('nexus', [
      K('[NEXUS WILL MEINEN FILM SEHEN.]'),
      K('[ICH HAB JA GESAGT. ES HAT DANACH 4 MINUTEN NICHTS GESAGT.]'),
      K('[DANN: „DANKE, KOLLEGE.“]', 'ueberrascht'),
      K('[ICH GLAUB, ES HAT GEWEINT. KÖNNEN KIS WEINEN? ICH HAB ES GEFILMT. MAN SIEHT NICHTS. NUR EIN FLACKERN.]'),
    ], { next: 'schluss' }),
    node('dreib', [K('[WILLKOMMEN ZURÜCK.]'), K('[ICH HAB DICH 3 WOCHEN NICHT GEFILMT. JETZT WIEDER.]'), K('[NUR VON DER GUTEN SEITE.]')], { next: 'schluss' }),
    node('schluss', [], {
      choices: [{ text: '„Was filmst du jetzt?“', next: 'jetzt' }, { text: 'Bis dann. Nicht winken.' }],
      effects: [set('kameramann_ende_kommentar'), xp(30), rel('kameramann', 20)],
    }),
    node('jetzt', [K('[DAS MEER.]'), K('[ES BEWEGT SICH DIE GANZE ZEIT. ICH KRIEG ES NIE SCHARF.]'), K('[PERFEKT.]')]),
  ]);
  const strand = daily('kameramann-tag-strand',
    [K('[SONNENUNTERGANG NR. 9.]'), K('[JEDER IST ANDERS. DER HIER IST ZU ORANGE. ICH LIEBE IHN.]')],
    [K('[DIE CREW AM LAGERFEUER: GEFILMT.]'), K('[DANTE HAT EINEN WITZ ERZÄHLT. ICH HAB DIE PAUSE DANACH BEHALTEN.]'), K('[SIE WAR LÄNGER ALS DER WITZ.]')],
    M);
  const epilog = daily('kameramann-tag-epilog',
    [K('[ : ) ]'), K('[NX-1 SENDET JETZT DIENSTAGS „UNGESCHMINKT“. 15 MINUTEN. OHNE TON.]')],
    [K('[EINSCHALTQUOTE: HÖHER ALS COLLIN.]', 'ueberrascht'), K('[ICH HAB ES IHM NICHT GESAGT.]'), K('[DELYA SCHON.]')],
    M);
  const master = dlg('kameramann-tag-master', [
    node('start', [K('[AUFNAHME GESTOPPT.]'), K('[ ]'), erz('Das Visier bleibt leer. Kein Smiley, kein Fragezeichen. Nur das schwache Glimmen eines Bildschirms, der auf etwas wartet.')], {
      choices: [
        { text: '„Film mich. Den neuen Master.“', next: 'filmen' },
        { text: '„Du hast keinen Chip, oder?“', next: 'chip' },
        { text: 'Gehen.' },
      ],
    }),
    node('filmen', [K('[NEIN.]'), K('[ICH FILME DICH NICHT MEHR.]'), K('[DU BIST JETZT DAS BILD, DAS SIE SENDEN WOLLEN.]')]),
    node('chip', [K('[HELM. ZWEI TOASTER.]'), K('[ICH HAB NOCH DEN FILM. ALLE 8 FOTOS. AUCH DEINE.]'), K('[FALLS DU DICH ERINNERN WILLST, WER DU WARST.]', 'besorgt')], {
      effects: [set('kameramann_master_film')],
    }),
  ]);
  return [drohnen, chips, chrome, nyra, ariaWeg, ariaZurueck, party, partyFoyer, partyPodest, endeErst, strand, epilog, master];
}

// ------------------------------------------------------------------------------------------- Bausteine für kameramann.ts

export const KAMERAMANN_TALK_MASTER: TalkDef = talk('kameramann-tag-master', MASTER);
export const KAMERAMANN_TALK_23: TalkDef[] = [
  talk('kameramann-tag-ende', all(EPILOG, MEER_ENDE, noFlag('kameramann_ende_kommentar'))),
  talk('kameramann-tag-strand', all(EPILOG, MEER_ENDE, { weekday: ['sa', 'so'] }, { time: 'abend' })),
  talk('kameramann-tag-epilog', EPILOG),
  talk('kameramann-tag-partynacht-foyer', all(PARTYNACHT, EINLASS_OFFEN)),
  talk('kameramann-tag-partynacht', PARTYNACHT),
  talk('kameramann-tag-aria-weg', all(NACH_BRUCH, ARIA_WEG, noFlag('kameramann_aria_spur'))),
  talk('kameramann-tag-aria-zurueck', all(ARIA_ZURUECK, { flag: 'aria_gechippt' }, noFlag('kameramann_aria_zurueck'))),
  talk('kameramann-tag-nyra', all(NYRA_WEG, ARIA_ZURUECK, noFlag('kameramann_nyra_gezeigt'))),
  talk('kameramann-tag-party', PARTY_PLAN),
  talk('kameramann-tag-akt2-drohnen', all(NACH_BRUCH, { weekday: ['mo', 'mi', 'fr'] })),
  talk('kameramann-tag-akt2-chips', all(NACH_BRUCH, { weekday: ['di', 'do', 'sa'] })),
  talk('kameramann-tag-akt2-chrome', NACH_BRUCH),
];

/** act23.json: Presse-Ecke im Foyer bis zum Einlass, dann Presse-Podest; Nachspiel am Wochenende am Meer. */
export const KAMERAMANN_SCHEDULE_23: ScheduleEntry[] = [
  { when: all(PARTYNACHT, EINLASS_OFFEN), place: { map: 'quantum-foyer', at: 'presse-ecke' }, pose: 'filmen' },
  { when: PARTYNACHT, place: { map: 'himmelsgarten', at: 'presse-podest' }, pose: 'filmen' },
  // Premiere (he-kameramann-8): abends am Kai, solange sie fällig ist.
  {
    slot: 'abend', place: { map: 'hafenkante', at: 'kai-mitte' }, pose: 'filmen',
    when: all(NACH_BRUCH, { quest: 'pers-kameramann-ungeschminkt', state: 'done' }, not({ seen: 'he-kameramann-8' }), { hearts: 'kameramann', min: 8 }),
  },
  { slot: 'abend', days: ['sa', 'so'], when: all(EPILOG, MEER_ENDE, not(MASTER)), place: { map: 'das-meer', at: 'duenengras' }, pose: 'filmen' },
];

export const KAMERAMANN_PHONE: PhoneMessageDef[] = [
  {
    id: 'tel-kameramann-meer', from: 'kameramann',
    text: '[ ]\n[FOTO: DAS MEER. ZU ORANGE. UNSCHARF. PERFEKT.]\n[SAMSTAG. DÜNENGRAS. SONNENUNTERGANG. KOMMST DU?]',
    auto: all(EPILOG, MEER_ENDE, { hearts: 'kameramann', min: 6 }, noFlag('tel_kameramann_meer')),
    effects: [set('tel_kameramann_meer')],
    replies: [{ text: '„Ich bring Brezeln mit.“', effects: [rel('kameramann', 10)] }, { text: '[ : ) ]' }],
  },
];

export function kameramann23(M: Menu): DialogueDef[] {
  return [he8, he10, ...gespraeche(M)];
}
