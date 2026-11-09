// Der Kameramann – NX-1, spricht nie, nur Visier-Anzeigen in eckigen Klammern (world.md §4.4, §11.2).
// Tagesablauf nach design/plan/act1.json (npcSchedules.kameramann), Herz-Ereignisse he-kameramann-2/4/6 (plan events),
// he-kameramann-8/10 angelegt und an act2 gebunden. Kein Begleiter, keine Romanze.
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode, NpcDef } from '../../../modules/contracts';
import {
  type Menu, AKT1, AKT2, VEX, VEXARIA, ZEIT_HINWEIS, all, byId, chk, daily, dlg, erz, hearts, ich, noFlag, node, rel,
  rep, seen, set, sp, talk, xp,
} from './_util';

const K = sp('kameramann');
const C = sp('collin-charleston');
const A = sp('aria');

const PROBEZEIT: Condition = { quest: 'main-1-probezeit', state: 'done' };

// ------------------------------------------------------------------------------------------- Menü

function menu(): Menu {
  const zurueck: DialogueChoice[] = [{ text: 'Noch was.', next: 'menue', id: 'zurueck' }, { text: 'Bis dann. Nicht winken.' }];

  const herkunft = (origin: string, label: string, visier: string, nachsatz: string): [DialogueChoice, DialogueNode] => [
    { text: 'Auf das Symbol in seinem Visier zeigen.', tag: label, when: { origin }, once: true, id: `k-${origin}`, next: `k-${origin}` },
    node(`k-${origin}`, [K(visier, 'ueberrascht'), K(nachsatz)], { choices: zurueck, effects: [rel('kameramann', 20)] }),
  ];
  const origins = [
    herkunft('origin-gossenkind', '[Gosse]', '[ ⌂ ]', '[STRASSE. ICH AUCH. BAHNHOF MITTE, BANK 3.]'),
    herkunft('origin-oberstadt', '[Oberstadt]', '[ ↑ ]', '[OBEN SIEHT MAN WENIGER. DAS LICHT IST ZU GUT.]'),
    herkunft('origin-oednis', '[Ödnis]', '[ ~~~ ]', '[SAND IM OBJEKTIV. SCHÖNSTES BILD MEINES LEBENS.]'),
    herkunft('origin-ex-wache', '[Ex-Wache]', '[ ★ ]', '[DU HAST MICH MAL VERHAFTET. ICH HAB DICH GEFILMT. QUITT.]'),
    herkunft('origin-schrott', '[Schrott]', '[ +-+ ]', '[DIESER HELM: SELBST GEBAUT. AUS ZWEI TOASTERN.]'),
    herkunft('origin-knastvogel', '[Knast]', '[ |||| ]', '[ICH FILME ZELLENFENSTER. VON AUSSEN. DAS IST NETTER.]'),
  ];

  const choices: DialogueChoice[] = [
    ...origins.map(([c]) => c),
    {
      text: 'Du siehst aus, als hättest du was verloren.', id: 'k-live', next: 'live-dabei',
      when: all(PROBEZEIT, { quest: 'side-live-dabei', state: 'inactive' }), effects: [{ startQuest: 'side-live-dabei' }],
    },
    { text: 'Was filmst du eigentlich, wenn keiner zuguckt?', tag: '[Kameramann ♥3]', requires: hearts('kameramann', 3), once: true, id: 'k-heimlich', next: 'heimlich' },
    { text: '„Du hast mich auf den Dächern gefilmt, oder?“', when: VEX, once: true, id: 'k-vex', next: 'vex' },
    { text: 'Zeig mir, wie der Fotomodus geht.', when: seen('he-kameramann-6'), next: 'foto' },
    { text: 'Nimmst du den Helm eigentlich nie ab?', once: true, id: 'k-helm', next: 'helm' },
    { text: 'Bis dann. Nicht winken.' },
  ];

  const nodes: DialogueNode[] = [
    node('menue', [K('[ ? ]')], { choices }),
    ...origins.map(([, n]) => n),
    node('live-dabei', [
      K('[DROHNE: ABGESTÜRZT]', 'wut'),
      K('[ORT: BRACKBUCHT. UNTER DER FLUTMAUER.]'),
      K('[DARAUF: 3 WOCHEN MATERIAL. COLLIN WEISS NICHTS.]'),
      K('[COLLIN DARF NICHTS WISSEN.]'),
      K('[HILFE? ]'),
    ], { choices: zurueck }),
    node('heimlich', [
      K('[DAS HIER.]'),
      erz('Auf dem Visier läuft ein Clip: Babette, die einem Kind heimlich eine zweite Dampfnudel in die Tasche steckt. Dann Opa Gustav, der auf seinem Kran mit einer Taube tanzt. Dann ein alter Mann, der allein an der Flutmauer sitzt und dem Meer zuprostet.'),
      K('[NX-1 SENDET DAS NIE.]'),
      K('[ZU ECHT. KEINE WERBEPAUSE MÖGLICH.]'),
    ], { choices: zurueck }),
    node('vex', [
      K('[ JA ]'),
      K('[NEUN STOCKWERKE. ZWEI SEKUNDEN. DU BIST SCHNELLER ALS MEIN FOKUS.]'),
      K('[AN DER LÜCKE DREHST DU IMMER UM. ICH HAB ES NIE GESENDET.]', 'ueberrascht'),
      K('[WERDE ICH AUCH NICHT.]'),
    ], { choices: zurueck, effects: [rel('kameramann', 20)] }),
    node('foto', [
      K('[1. TASTE F. 2. RAHMEN. 3. WARTEN.]'),
      K('[WARTEN IST DER WICHTIGSTE TEIL.]'),
      K('[NIE AUF DAS LÄCHELN DRÜCKEN. AUF DIE SEKUNDE DANACH.]'),
    ], { choices: zurueck }),
    node('helm', [
      K('[ NEIN ]'),
      K('[WENN ICH IHN ABNEHME, SEHEN DIE LEUTE MICH AN.]'),
      K('[DANN BIN ICH IM BILD. ICH WILL HINTER DEM BILD SEIN.]'),
      K('[AUSSERDEM: FRISUR. KATASTROPHE.]', 'ueberrascht'),
    ], { choices: zurueck }),
  ];
  return { choices, nodes };
}

const M = menu();

// ------------------------------------------------------------------------------------------- Tagesgespräche

const T = {
  rivale: daily('kameramann-tag-rivale',
    [K('[AUFNAHME LÄUFT]', 'wut'), K('[DEIN SCHLECHTESTER TAG. IN 4K.]')],
    [K('[ZEITLUPE. DIE STELLE, WO DU STOLPERST. DREIMAL.]', 'wut'), K('[MIT MUSIK.]')],
    { choices: [{ text: 'Schalt das aus.' }], nodes: [] }),
  vexaria: daily('kameramann-tag-vexaria',
    [
      K('[ ♥ ♥ ]', 'ueberrascht'),
      K('[FLUTMAUER. SONNENUNTERGANG. ZWEI SILHOUETTEN.]'),
      K('[AUFNAHME GELÖSCHT.]'),
      K('[FÜR EUCH.]'),
    ],
    [
      K('[ … ]'),
      K('[OKAY. EINE KOPIE. FÜR MICH. BESTES LICHT DES JAHRES.]'),
      K('[DAS GURTZEUG AUF DEM BODEN DER BUDE: NICHT GEFILMT. EHRENWORT.]', 'ueberrascht'),
      K('[ABER GEHÖRT. WELLBLECH. DIE GANZEN LÖTGASSEN.]'),
    ],
    M, { effects: [set('kameramann_kommentar_vexaria')] }),
  zeit: daily('kameramann-tag-zeit',
    [K('[ : ) ]'), K('[MEIN FILM IST NOCH NICHT FERTIG.]'), erz(ZEIT_HINWEIS)],
    [K('[ES FEHLT DIE LETZTE SZENE.]'), K('[DIE PASSIERT ERST NOCH.]')],
    M),
  live: daily('kameramann-tag-live',
    [K('[LIVE IN 3 … 2 …]'), K('[BITTE NICHT WINKEN]')],
    [
      erz('Du winkst. Natürlich winkst du. Hinter dir dreht Collin sich zur Kamera, die Zähne zuerst.'),
      C('Und hier sehen Sie: das VOLK! Live! Unzensiert! Winkend! Unglaublich!', 'freude'),
      K('[ … ]'),
      K('[DANKE. JETZT HAB ICH DAS FÜR DIE WIEDERHOLUNG.]'),
    ],
    M),
  regie: daily('kameramann-tag-regie',
    [K('[REGIE. 07:12. KAFFEE: LEER.]'), K('[COLLIN: 3 MIN VERSPÄTUNG. WIE IMMER.]')],
    [K('[16 MONITORE. 15 ZEIGEN WERBUNG.]'), K('[DER 16. ZEIGT DIE STRASSE. DEN HAB ICH UMGESTECKT.]')],
    M),
  stadttv: daily('kameramann-tag-stadttv',
    [K('[STADT-TV-WAND. WARTUNG.]'), K('[DIE WERBUNG FLIMMERT. ICH LASS SIE FLIMMERN.]')],
    [
      erz('Auf der Riesenwand über dem Markt läuft ein Chrome-10-Spot. Für eine halbe Sekunde springt das Bild: ein Kind, das in eine Pfütze springt. Dann wieder Werbung.'),
      K('[ : ) ]'),
      K('[DAS WAR ICH NICHT.]'),
    ],
    M),
  filmposten: daily('kameramann-tag-filmposten',
    [K('[AUFNAHME LÄUFT]'), K('[ABENDLICHT. DAS BESTE LICHT. ALLE SEHEN MÜDE UND EHRLICH AUS.]')],
    [K('[DA DRÜBEN: WETT-WILLI LÄSST EIN KIND GEWINNEN.]'), K('[ER DENKT, KEINER SIEHT ES.]'), K('[ICH SEHE ES.]')],
    M),
  dach: daily('kameramann-tag-dach',
    [K('[ZEITRAFFER. 1 BILD ALLE 4 SEKUNDEN.]'), K('[NICHT VORS STATIV TRETEN. DU BIST JETZT 80 BILDER.]')],
    [K('[VEGA SCHAUT DA DRÜBEN STERNE.]'), K('[ICH SCHAUE LICHTER. ZUSAMMEN SIND WIR EIN PLANETARIUM.]')],
    M),
  vertraut: daily('kameramann-tag-vertraut',
    [K('[ : ) ]'), K('[DU BIST IN 31 MEINER AUFNAHMEN.]'), K('[IN 29 SIEHST DU GUT AUS.]')],
    [K('[DIE ANDEREN ZWEI SIND MEINE LIEBLINGE.]')],
    M),
  fremd: daily('kameramann-tag-fremd',
    [K('[ ? ]'), K('[NEUES GESICHT. GUTER WINKEL. LINKS BESSER.]')],
    [K('[ICH REDE NICHT.]'), K('[DAS HIER IST KEIN REDEN. DAS IST UNTERTITEL.]')],
    M),
  standard: daily('kameramann-tag-standard',
    [K('[ : ) ]'), K('[HALLO.]')],
    [K('[DIE STADT HAT HEUTE 14 SCHÖNE MOMENTE GEHABT.]'), K('[ICH HAB 3. DU WARST IN EINEM.]')],
    M),
};

// ------------------------------------------------------------------------------------------- he-kameramann-2

const he2 = dlg('he-kameramann-2', [
  node('start', [
    erz('Stufenplatz, mittags. Collins Bühne, Scheinwerfer, ein Kamerakran, der über die Menge schwenkt. Collin spricht gerade über „die unglaubliche Reinheit der Oberstadt-Luft“. Du willst nur über den Platz.'),
    erz('Der Kran dreht sich. Das rote Licht der Kamera zeigt genau auf dich. Du stehst mitten im Bild, auf jedem Bildschirm der Stadt.'),
    K('[ ! ]', 'ueberrascht'),
  ], {
    choices: [
      { text: 'Stehen bleiben. Kinn hoch. Ein Blick in die Linse, der Steuern zahlen sollte.', check: chk('he-kameramann-2-pose', 'ausstrahlung', 4, ['auftritt']), next: 'pose' },
      { text: 'Hinter Collin treten und ihm Hasenohren machen.', next: 'hasenohren' },
      { text: 'Einfach weitergehen, als wäre nichts. Du hast einen Weg.', next: 'echt' },
      { text: 'Ducken und hinter einen Brezelstand hechten.', next: 'ducken' },
    ],
  }),
  node('pose', [
    erz('Du bleibst stehen und siehst in die Kamera, als würdest du sie gleich um Geld bitten und es auch bekommen. Der Kran hält an. Drei Sekunden. Vier. Collin redet weiter, aber keiner hört ihm zu.'),
    K('[NATURTALENT]'),
    C('… und wer ist DAS? Meine Damen und Herren, ein Star von der Straße! Exklusiv! Unglaublich! Wer auch immer das ist!', 'ueberrascht'),
  ], { effects: [rel('kameramann', 30), rep('nx1-medien', 5)], next: 'nachher' }),
  node('hasenohren', [
    erz('Zwei Finger, Collins perfekte Frisur, sechzigtausend Zuschauer. Collin merkt nichts. Er sagt gerade: „Seriosität ist das Fundament dieses Senders.“'),
    K('[ :D ]'),
    K('[ZOOM.]'),
    erz('Die Kamera fährt näher. Auf der Stadt-TV-Wand sieht man nur noch Collins Kopf und deine Finger. Unten am Platz lacht ein Kind so laut, dass es sich hinsetzen muss.'),
  ], { effects: [rel('kameramann', 30), rep('nx1-medien', -3), rep('unterstadt', 5), set('collin_hasenohren')], next: 'nachher' }),
  node('echt', [
    erz('Du gehst weiter. Nicht schneller, nicht langsamer. Die Kamera folgt dir über den ganzen Platz, ruhig, wie ein Blick, der dir nachsieht. Du kaufst eine Brezel. Du beißt rein. Du gehst.'),
    K('[NATURTALENT]'),
    K('[KEINE POSE. DAS KANN KEINER.]'),
  ], { effects: [rel('kameramann', 40)], next: 'nachher' }),
  node('ducken', [
    erz('Du hechtest. Der Brezelstand wackelt. Drei Brezeln rollen über den Platz. Die Kamera folgt ihnen, eine nach der anderen, als wären sie die eigentliche Nachricht.'),
    K('[ : ) ]'),
    K('[BREZELN SIND AUCH NATURTALENTE.]'),
  ], { effects: [rel('kameramann', 20), { credits: -5 }, { give: 'brezel' }], next: 'nachher' }),
  node('nachher', [
    erz('Nach der Sendung, während Collin seine Frisur vor einem Handspiegel nachjustiert, kommt der Kameramann zu dir. Sein Visier blinkt.'),
    K('[DU WARST 11 SEKUNDEN IM BILD.]'),
    K('[DIE BESTEN 11 SEKUNDEN DER WOCHE.]'),
    K('[MONTAG, MITTWOCH, FREITAG. 12:00. KOMM WIEDER. NICHT WINKEN.]'),
  ], { effects: [xp(30), set('kameramann_naturtalent')] }),
]);

// ------------------------------------------------------------------------------------------- he-kameramann-4

const he4 = dlg('he-kameramann-4', [
  node('start', [
    erz('Abends am Schrottmarkt. Der Kameramann hockt auf einem Ölfass, die Kamera auf dem Knie, und filmt. Nicht die Stadt-TV-Wand. Die Leute darunter.'),
    K('[SETZ DICH.]'),
    erz('Er dreht das Visier zu dir. Ein Clip läuft: Mutter Brühe, die Suppe an eine Schlange verteilt, die um drei Ecken reicht. Ein Junge, der Oma Volt über eine Pfütze hilft und dafür eine Kopfnuss kriegt. Daria, die einer Taube das Lesen beibringt.'),
    K('[NX-1 WILL DAS NICHT.]'),
    K('[NX-1 WILL: CHROME 10. LÄCHELNDE LEUTE. KEIN ROST.]'),
    erz('Der Clip springt. Bildrauschen. Dann ein graues Standbild mit dem Senderlogo: „Inhalt entfernt – Qualitätsstandard.“'),
    K('[SIE LÖSCHEN MEINE SPEICHERKARTEN. JEDEN FREITAG.]', 'wut'),
  ], {
    choices: [
      { text: 'Die Karte retten. Gelöscht heißt nur: überschrieben.', check: chk('he-kameramann-4-karte', 'technik', 5, ['daten', 'hacken']), next: 'technik' },
      { text: '„Ich weiß, wo’s echte Momente gibt. Wett-Willi verliert absichtlich.“', check: chk('he-kameramann-4-tipp', 'strasse', 4, ['geruecht', 'beobachten']), next: 'strasse' },
      { text: '„Dann drehen wir’s neu. Was brauchst du?“', next: 'helfen' },
      { text: '„Ist halt Fernsehen. Wird überall gelöscht.“', next: 'egal' },
    ],
  }),
  node('technik', [
    erz('Du steckst die Karte in deinen Scanner, umgehst den Löschbefehl und ziehst die Fragmente zusammen, die NX-1 vergessen hat. Ein Bild kommt zurück. Dann noch eins: Collin, abgeschminkt, um vier Uhr morgens, wie er einem Obdachlosen sein Sakko gibt.'),
    K('[ !!! ]', 'ueberrascht'),
    K('[DAS HATTE ICH VERGESSEN. DAS IST DAS BESTE.]'),
  ], { effects: [rel('kameramann', 40), set('kameramann_collin_clip')], next: 'auftrag' }),
  node('strasse', [
    ich('Jeden Abend um sieben. Ein kleines Mädchen, immer dieselbe, und Willi lässt sie jedes Mal gewinnen. Dann tut er so, als wär er pleite, und kauft ihr ein Eis vom Gewinn.'),
    K('[ … ]'),
    K('[WIE LANGE WEISST DU DAS SCHON?]'),
    K('[DU BIST AUCH EINE KAMERA.]'),
  ], { effects: [rel('kameramann', 30)], next: 'auftrag' }),
  node('helfen', [K('[ : ) ]'), K('[ICH HABE AUF DICH GEWARTET.]')], { effects: [rel('kameramann', 20)], next: 'auftrag' }),
  node('egal', [
    K('[ … ]'),
    K('[JA.]'),
    K('[ABER NICHT ÜBERALL WIRD ES VORHER GEFILMT.]'),
    erz('Er sieht wieder auf den Markt. Du bleibst trotzdem sitzen. Nach einer Weile blinkt sein Visier.'),
  ], { next: 'auftrag' }),
  node('auftrag', [
    K('[MEIN FILM: „UNGESCHMINKT“.]'),
    K('[ICH BRAUCHE 8 FOTOS. ECHTE MOMENTE. KEINE POSEN.]'),
    K('[DU KOMMST ÜBERALL HIN. ICH NUR DAHIN, WO COLLIN STEHT.]'),
    erz('Er drückt dir eine alte Sofortbildkamera in die Hand. Auf dem Gehäuse steht in Edding: „NICHT WINKEN“.'),
  ], {
    choices: [
      { text: 'Die Kamera nehmen. „Acht Momente. Kein Problem.“', next: 'ende', effects: [{ startQuest: 'pers-kameramann-ungeschminkt' }] },
      { text: '„Ich überleg’s mir.“', next: 'spaeter' },
    ],
  }),
  node('spaeter', [K('[OKAY.]'), K('[DIE KAMERA BLEIBT BEI MIR. SIE WARTET. ICH AUCH.]')], {
    effects: [xp(40), set('kameramann_film_angeboten')],
  }),
  node('ende', [K('[AUFNAHME LÄUFT]'), K('[ : ) ]')], { effects: [xp(50), rep('unterstadt', 3), set('kameramann_film_angeboten')] }),
]);

// ------------------------------------------------------------------------------------------- he-kameramann-6

const he6 = dlg('he-kameramann-6', [
  node('start', [
    erz('Nacht auf der Dachterrasse über der Neon-Gasse. Ein Stativ, eine Thermoskanne, zwei Klappstühle. Einer ist besetzt. Der andere wartet offensichtlich auf dich.'),
    K('[ZEITRAFFER. 2 STUNDEN. 1800 BILDER.]'),
    K('[DIE STADT ATMET. MAN SIEHT ES NUR SCHNELL.]'),
    erz('Unter euch gehen Reklamen an und aus, Schwebetaxis ziehen Lichtfäden, ein Kran an der Hafenkante dreht sich wie ein Uhrzeiger.'),
  ], {
    choices: [
      { text: 'Das Intervall nachstellen. Bei Neon flackert vier Sekunden.', check: chk('he-kameramann-6-intervall', 'technik', 5, ['kamera', 'reparieren']), next: 'technik' },
      { text: 'Sich setzen. Kaffee nehmen. Zwei Stunden still sein.', next: 'still', effects: [{ advanceTime: 120 }] },
      { text: '„Darf ich mal durchgucken?“', next: 'durchgucken' },
    ],
  }),
  node('technik', [
    erz('Drei Komma sieben Sekunden statt vier. Das Flackern der Reklamen fällt jetzt genau zwischen die Bilder. Auf der Vorschau fließt die Neon-Gasse wie ein Fluss aus Licht.'),
    K('[ !!! ]', 'ueberrascht'),
    K('[DAS HAB ICH ZWEI JAHRE FALSCH GEMACHT.]'),
  ], { effects: [rel('kameramann', 30), { advanceTime: 60 }], next: 'film' }),
  node('still', [
    erz('Zwei Stunden. Kein Wort, natürlich. Ab und zu blinkt sein Visier: „[ KAFFEE? ]“ – „[ SCHAU, DA. ]“ – „[ DAS TAXI HAT GEHUPT. DREIMAL. ]“. Einmal fällt eine Sternschnuppe, oder eine Drohne stürzt ab. Ihr einigt euch auf Sternschnuppe.'),
  ], { effects: [rel('kameramann', 30)], next: 'film' }),
  node('durchgucken', [
    erz('Du beugst dich zum Sucher. Er tritt einen Schritt zurück. Durch die Linse sieht die Stadt nicht kaputt aus. Nur müde. Und ein bisschen wunderschön.'),
    K('[SO SEHE ICH SIE.]'),
    K('[IMMER.]'),
  ], { effects: [rel('kameramann', 20), { advanceTime: 60 }], next: 'film' }),
  node('film', [
    erz('Er spielt dir den fertigen Zeitraffer ab. Zwei Stunden in zwanzig Sekunden. Und mittendrin, auf dem Dach, zwei Klappstühle, auf denen zwei Gestalten ganz still sitzen, während um sie herum die Stadt rast.'),
    K('[DU BIST JETZT IM FILM.]'),
    K('[ICH NICHT. ICH BIN DER STUHL.]'),
  ], {
    choices: [
      { text: '„Und die Flutmauer-Aufnahme? Die mit uns beiden?“', when: VEXARIA, next: 'flutmauer' },
      { text: '„Zeig mir, wie du das machst.“', next: 'ende' },
    ],
  }),
  node('flutmauer', [
    K('[ … ]'),
    K('[ICH HAB SIE NIE GESENDET.]'),
    K('[COLLIN HAT GEFRAGT. ICH HAB GESAGT: SPEICHER VOLL.]'),
    K('[SPEICHER WAR NICHT VOLL.]'),
    erz('Er schickt dir eine Datei aufs Telefon. Ein einziges Bild. Gegenlicht, Sonnenuntergang, zwei Umrisse, die sich so nah sind, dass sie einer werden.'),
  ], { effects: [set('vexaria_foto_kameramann'), rel('kameramann', 20)], next: 'ende' }),
  node('ende', [
    K('[FOTOMODUS: FREIGESCHALTET.]'),
    K('[TASTE F. NIE AUF DAS LÄCHELN DRÜCKEN. AUF DIE SEKUNDE DANACH.]'),
    K('[ : ) ]'),
  ], { effects: [xp(60), set('fotomodus'), { message: 'Fotomodus freigeschaltet.' }] }),
]);

// ------------------------------------------------------------------------------------------- he-kameramann-8/10 (act2)

const he8 = dlg('he-kameramann-8', [
  node('start', [
    erz('Ein Bettlaken, an zwei Kränen der Hafenkante aufgespannt. Ein Projektor auf einem Ölfass. Davor: die halbe Unterstadt auf Kisten, Fässern und Klappstühlen. Auf dem Laken: „UNGESCHMINKT – ein Film ohne Ton“.'),
    erz('Der Film zeigt Babettes Hände, Gustavs Kran, Darias Taube, Hunter, der heimlich Trinkgeld zurück in eine Jackentasche schiebt. Deine acht Fotos. Und am Ende ein Standbild der Stadt bei Nacht, die atmet.'),
    A('Ich heul nicht. ICH HEUL NICHT. Das ist Rost im Auge. Wer hat hier Rost hingemacht?!', 'trauer'),
    K('[ : ) ]'),
    K('[PREMIERE. PUBLIKUM: 212. HEULEND: 211.]'),
    K('[DER 212. IST RIPPER. ER BEHAUPTET, ES IST LÖTDAMPF.]'),
  ], { effects: [xp(80), rel('kameramann', 40), rep('unterstadt', 10)] }),
]);

const he10 = dlg('he-kameramann-10', [
  node('start', [
    erz('Er gibt dir eine winzige Drohne, kaum größer als ein Kronkorken, mit einer Linse wie ein Stecknadelkopf. Auf ihrer Unterseite klebt ein Sticker: „[ : ) ]“.'),
    K('[DAMIT DU AUCH HINTER DEM BILD SEIN KANNST.]'),
    K('[MANCHMAL.]'),
    K('[DANKE. DAS IST DAS ERSTE MAL, DASS ICH ES SCHREIBE.]'),
  ], { effects: [{ give: 'kameradrohne-mini' }, xp(120), rel('kameramann', 50)] }),
]);

// ------------------------------------------------------------------------------------------- Figur

const kameramann: NpcDef = {
  id: 'kameramann',
  name: 'Der Kameramann',
  portrait: 'kameramann',
  sprite: 'kameramann-walk',
  faction: 'nx1-medien',
  bio: 'Spricht nie. Sein Helmvisier zeigt Texte in eckigen Klammern. Filmt für NX-1 – und heimlich die echte Stadt.',
  gifts: {
    loves: ['kamera-objektiv', 'vhs-kassette', 'brezel'],
    likes: ['synth-kaffee', 'comic-heft', 'neon-limo', 'datenkristall', 'echtobst-apfel', 'hofhonig'],
    dislikes: ['haarspray-deluxe', 'glitzerschrott'],
    hates: ['magnet-stoerer', 'rostige-dose', 'virus-implantat'],
  },
  schedule: [
    { slot: 'morgen', place: { map: 'nx1-studio', at: 'regie' } },
    { slot: 'tag', days: ['mo', 'mi', 'fr'], place: { map: 'stufenplatz', at: 'kamerakran' }, pose: 'filmen' },
    { slot: 'tag', place: { map: 'schrottmarkt', at: 'stadt-tv' } },
    { slot: 'abend', place: { map: 'schrottmarkt', at: 'filmposten' }, pose: 'filmen' },
    { slot: 'nacht', days: ['sa', 'so'], place: { map: 'neon-gasse', at: 'kamera-stativ' }, pose: 'filmen' },
    { slot: 'nacht', place: 'away' },
  ],
  heartEvents: [
    { id: 'he-kameramann-2', hearts: 2, map: 'stufenplatz', time: 'tag', when: { weekday: ['mo', 'mi', 'fr'] }, dialogue: 'he-kameramann-2' },
    { id: 'he-kameramann-4', hearts: 4, map: 'schrottmarkt', time: 'abend', when: seen('he-kameramann-2'), dialogue: 'he-kameramann-4' },
    { id: 'he-kameramann-6', hearts: 6, map: 'neon-gasse', time: 'nacht', when: all(seen('he-kameramann-4'), { weekday: ['sa', 'so'] }), dialogue: 'he-kameramann-6' },
    {
      id: 'he-kameramann-8', hearts: 8, map: 'hafenkante', time: 'abend',
      when: all(AKT2, seen('he-kameramann-6'), { quest: 'pers-kameramann-ungeschminkt', state: 'done' }), dialogue: 'he-kameramann-8',
    },
    { id: 'he-kameramann-10', hearts: 10, map: 'schrottmarkt', time: 'abend', when: all(AKT2, seen('he-kameramann-8')), dialogue: 'he-kameramann-10' },
  ],
  talk: [
    talk('kameramann-tag-rivale', { rival: 'kameramann' }),
    talk('kameramann-tag-vexaria', all(VEXARIA, noFlag('kameramann_kommentar_vexaria'))),
    talk('kameramann-tag-zeit', AKT1, 8),
    talk('kameramann-tag-fremd', { not: { met: 'kameramann' } }),
    talk('kameramann-tag-live', all({ weekday: ['mo', 'mi', 'fr'] }, { time: 'tag' })),
    talk('kameramann-tag-regie', { time: 'morgen' }),
    talk('kameramann-tag-dach', { time: 'nacht' }),
    talk('kameramann-tag-vertraut', undefined, 5),
    talk('kameramann-tag-stadttv', { time: 'tag' }),
    talk('kameramann-tag-filmposten', { time: 'abend' }),
    talk('kameramann-tag-standard'),
  ],
};

export const part: ContentPart = {
  npcs: { kameramann },
  dialogues: byId([
    T.rivale, T.vexaria, T.zeit, T.live, T.regie, T.stadttv, T.filmposten, T.dach, T.vertraut, T.fremd, T.standard,
    he2, he4, he6, he8, he10,
  ]),
};
