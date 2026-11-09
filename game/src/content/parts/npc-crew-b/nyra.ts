// Nyra – junge Hackerin „Silent-Angel“, Dantes größter Fan, träumt vom Meer (world.md §4.2, §4.6, §11.2).
// Tagesablauf nach design/plan/act1.json (npcSchedules.nyra). Herz-Ereignisse he-nyra-2/4/6 in Akt 1,
// he-nyra-8/10 angelegt und an act3 gebunden („nach Akt 3“). Rivalität re-nyra-5 (Hack-Duell), Versöhnung: Postkarte vom Meer.
// Begleiterin in Akt 1 nur eingeschränkt (Hack-Aufträge, Hack-Nebenquests). Romanze: nein (Freundschaft).
// Persönliche Quests (pers-nyra-silent-angel, side-weg-zum-meer) baut der Quest-Agent; hier nur Verweise.
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode, NpcDef } from '../../../modules/contracts';
import {
  type Menue, VEX, einmalig, dialog, done, erz, flag, herz, knoten, neu, pruefung, rede, sammle, sammleSzenen, sprecher,
  tagesgespraech, ZEIT_HINWEIS,
} from './_helfer';

const N = sprecher('nyra');
const K = sprecher('captain-kuschel');

const PROBEZEIT: Condition = done('main-1-probezeit');
const DANTE_DONE: Condition = done('main-1-dante');
const KUSCHEL: Condition = { flag: 'nyra_hat_kuschel' };

// ---------------------------------------------------------------------------------------------- Menü

function menue(): Menue {
  const zurueck: DialogueChoice[] = [{ text: 'Noch was, Nyra.', next: 'menue', id: 'zurueck' }, { text: 'Bis später.' }];

  const choices: DialogueChoice[] = einmalig('nyra', [
    { text: '„Ich komm aus der Ödnis. Hinter den Glasdünen riecht der Wind nach Salz.“', tag: '[Ödnis]', when: { origin: 'origin-oednis' }, once: true, id: 'n-oednis', next: 'n-oednis', effects: [herz('nyra', 40)] },
    { text: '„Dein Scanner. Selbstbau, Toaster-Kühlrippen, Antenne aus einem Schneebesen?“', tag: '[Schrott]', when: { origin: 'origin-schrott' }, once: true, id: 'n-schrott', next: 'n-schrott', effects: [herz('nyra', 30)] },
    {
      text: 'Was hackst du da gerade?', next: 'uebung', once: true, id: 'n-uebung', when: PROBEZEIT,
      effects: [{
        minigame: 'akt-hacken', level: 2, key: 'nyra-uebungshack', label: 'Nyras Übungsserver',
        win: [{ credits: 30 }, herz('nyra', 20), { message: 'Grün auf ganzer Linie. Nyra kreischt leise und überweist dir 30 Cr „Finderlohn“.' }],
        lose: [herz('nyra', 5), { message: 'Der Server schickt dir ein Bild von einem weinenden Toaster. Nyra: „Passiert den Besten. Mir nie, aber den Besten.“' }],
      }],
    },
    { text: 'Erzähl mir vom Meer.', requires: { hearts: 'nyra', min: 2 }, tag: '[Nyra ♥2]', next: 'meer' },
    { text: 'Was findest du eigentlich an Dante?', next: 'dante', once: true, id: 'n-dante', when: PROBEZEIT },
    { text: 'Wie geht’s Captain Kuschel?', when: KUSCHEL, next: 'kuschel' },
    {
      text: 'Ich hab eine fossile Muschel. Für deine Karte.', when: { all: [{ item: 'fossile-muschel' }, { seen: 'he-nyra-4' }, { notFlag: 'nyra_kuestenkarte' }] },
      next: 'muschel', effects: [{ take: 'fossile-muschel' }, { give: 'kuestenkarte-fragment' }, flag('nyra_kuestenkarte'), herz('nyra', 60)],
    },
    {
      text: 'Ich brauch eine Hackerin.', when: { all: [PROBEZEIT, { not: { recruited: 'nyra' } }] }, next: 'rekrut',
      effects: [{ recruit: 'nyra' }],
    },
    { text: '„Wenn ich zurückkomme …“ – Was meinst du damit immer?', requires: { hearts: 'nyra', min: 4 }, tag: '[Nyra ♥4]', once: true, id: 'n-zurueck', next: 'zurueckkommen' },
    { text: 'Bis später.' },
  ]);

  const nodes: DialogueNode[] = [
    knoten('menue', [N('Ja? Ich hab drei Fenster offen und einen Gedanken. Der Gedanke bist du. Schieß los.')], { choices }),
    knoten('n-oednis', [
      N('Salz. SALZ? Du hast Salz gerochen? Echtes, das vom Meer kommt?', 'ueberrascht'),
      N('Okay. Okay okay okay. Ich mach ein Dokument auf. „Zeugenaussagen Meer“. Du bist Eintrag Nummer eins. Bisher der einzige.', 'freude'),
      N('Wie laut ist es? Rauscht es wie ein Lüfter oder wie ein Applaus? Nein, sag nichts. Ich will’s mir noch vorstellen dürfen.'),
    ], { choices: zurueck }),
    knoten('n-schrott', [
      N('SCHNEEBESEN. Ja! Niemand erkennt den Schneebesen! Der Schneebesen ist das Genie an der Sache!', 'freude'),
      N('Dante sagt, so was macht nur, wer entweder sehr arm oder sehr verrückt ist. Ich bin beides. Er hat’s als Kompliment gemeint. Glaub ich. Hoff ich.'),
    ], { choices: zurueck }),
    knoten('uebung', [
      N('Übungsserver. Ein Freund von mir hat ihn gebaut. Also, ich. Ich hab ihn gebaut. Freunde hab ich eher theoretisch.', 'besorgt'),
      N('Wenn du durchkommst, zahl ich dir was. Wenn nicht, mach ich ein Selfie mit deinem Gesicht beim Scheitern. Für die Kunst.'),
    ], { choices: zurueck }),
    knoten('meer', [
      N('Ich war nie da. Keiner war je da. Also, fast keiner. Aber es gibt Postkarten. Alte. Von 2031. Da ist das Wasser blau. Nicht braun. Nicht batteriefarben. BLAU.', 'freude'),
      N('Ich hab ausgerechnet, wie weit es ist. Hinter der Ödnis, hinter den Glasdünen. Vier Tage zu Fuß, wenn einen nichts frisst. Zwei mit Auto. Null mit Fantasie.'),
      N('Irgendwann geh ich. Mit Sonnencreme und einem Eimer. Ich weiß nicht, wofür der Eimer ist. Aber auf allen Postkarten hat einer einen Eimer.', 'signatur'),
    ], { choices: zurueck }),
    knoten('dante', [
      N('Dante? DANTE? Du fragst, was ich an DANTE finde?', 'ueberrascht'),
      N('Der Mann hat mit sechzehn den Stadtrat-Server so umgeschrieben, dass jede Sitzung mit einem Katzenvideo anfing. Drei Jahre lang hat’s keiner gemerkt. DREI JAHRE.'),
      N('Und dann hat er einfach aufgehört. Werkstatt, Platten, Kekse. Ich will wissen, warum. Ich will alles wissen. Ich hab einen Ordner. Sag’s ihm nicht. Der Ordner hat Unterordner.', 'besorgt'),
    ], { choices: zurueck }),
    knoten('kuschel', [
      erz('Captain Kuschel sitzt in Nyras Kapuze und lugt über ihre Schulter. Ein Ohr steht, eins ist geknickt.'),
      K('(Ein Ohr hoch, eins geknickt.)'),
      N('Er sagt: „Gut, aber skeptisch.“ Er ist immer skeptisch, wenn ich Energy-Drinks trinke. Er findet, das passt nicht zu meinem Puls.'),
      N('Dante hat ihn MIR gegeben. Verstehst du? Mir. Ich schlaf seitdem mit ihm im Arm und trau mich nicht, mich umzudrehen.', 'freude'),
    ], { choices: zurueck }),
    knoten('muschel', [
      N('Eine … das ist eine echte fossile Muschel. Die war mal im Meer. IM MEER.', 'ueberrascht'),
      erz('Nyra dreht sie im Licht. Auf der Innenseite ist eine eingeritzte Linie, fein wie ein Haar: ein Stück Küste, zwei Kreise, ein Kreuz. Jemand hat hier vor langer Zeit eine Karte versteckt.'),
      N('Das ist ein Stück Küstenkarte. Das erste. Wir haben das erste Stück.', 'freude'),
    ], { choices: zurueck }),
    knoten('rekrut', [
      N('Ich? Echt? Okay. Aber nur für Hack-Sachen. Terminals, Drohnen, Türen, die beleidigt sind.', 'ueberrascht'),
      N('Wenn’s knallt, bin ich Hintergrundrauschen. Ich bin keine Schlägerin. Ich bin eine Schlägerinnen-Unterstützungs-Einheit.'),
    ]),
    knoten('zurueckkommen', [
      N('Hm? Ach so. Das sag ich einfach so. Ist so ein Spruch.', 'besorgt'),
      N('… Wenn man irgendwo neu ist, denkt man immer, man ist nur auf Probe. Dass man kurz weggeht, und wenn man wiederkommt, ist der Platz schon weg. Jemand anderes sitzt auf deinem Hocker.'),
      N('Wenn ich zurückkomme … wollt ihr mich dann noch?', 'trauer'),
    ], {
      choices: [
        { text: '„Dein Hocker bleibt frei. Ich setz mich drauf, damit keiner anderes kommt.“', next: 'z-hocker', effects: [herz('nyra', 40), flag('nyra_versprechen')] },
        { text: '„Du gehst nirgendwohin.“', next: 'z-nirgends', effects: [herz('nyra', 20)] },
        { text: '„Kommt drauf an, wie lang du wegbleibst.“', next: 'z-kalt', effects: [herz('nyra', -10)] },
      ],
    }),
    knoten('z-hocker', [N('Du würdest … okay. Ich mach ein Selfie. Mit dir auf meinem Hocker. Als Beweis. Falls ich’s vergesse.', 'freude')], { choices: zurueck }),
    knoten('z-nirgends', [N('Stimmt. Ich hab ja nicht mal einen Eimer. Ohne Eimer geh ich nirgends hin.', 'signatur')], { choices: zurueck }),
    knoten('z-kalt', [N('… Ja. Klar. Logisch. Ich hab nur gefragt. War ein Witz. Haha. Ich lach später.', 'trauer')], { choices: zurueck }),
  ];
  return { choices, nodes };
}

const M = menue();

/** Rivalität: Versöhnung mit einer Postkarte vom Meer (world.md §4.2). */
const RIVALE: Menue = {
  choices: [
    {
      text: 'Eine Postkarte vom Meer hinlegen. Auf die Rückseite hast du geschrieben: „Für den Eimer. Ich komm mit.“', next: 'versoehnt',
      when: { item: 'postkarte-meer' }, effects: [{ take: 'postkarte-meer' }, { reconcile: 'nyra' }, { xp: 40 }],
    },
    { text: 'Schon gut.' },
  ],
  nodes: [
    knoten('versoehnt', [
      erz('Nyra liest die Rückseite. Zweimal. Dreimal. Dann zieht sie die Kapuze ins Gesicht.'),
      N('Das ist unfair. Mit Postkarten kämpft man nicht. Das ist … das ist wie ein Hack direkt ins Herz.', 'trauer'),
      N('Ich folg dir wieder. Und ich lösch die Aufnahmen vom Stadt-TV. Die meisten. Die mit dem Niesen bleibt. Die ist zu gut.', 'freude'),
    ]),
  ],
};

// ---------------------------------------------------------------------------------------------- Tagesgespräche

const T = {
  rivale: tagesgespraech('nyra-tag-rivale',
    [N('Oh. Du. Ich hab dich entfolgt. Überall. Auch auf Plattformen, auf denen du gar nicht bist.', 'wut')],
    [N('Das Stadt-TV hat übrigens heute Morgen ein Video gezeigt. Jemand, der aussieht wie du, rutscht auf einer Nudel aus. Zeitlupe. Mit Musik. Rein zufällig.', 'wut')],
    RIVALE),
  zeit: tagesgespraech('nyra-tag-zeit',
    [N('{name}! Du bist da. Gut. Ich wollt dir was sagen, aber ich hab’s vergessen. Nein, hab ich nicht. Ich trau mich nur noch nicht.', 'besorgt'), erz(ZEIT_HINWEIS)],
    [N('Manche Sachen erzählt man erst, wenn man sicher ist, dass der andere nicht wegrennt. Ich bin noch nicht sicher. Bei mir. Nicht bei dir.')],
    M),
  kuschelNeu: tagesgespraech('nyra-tag-kuschel-neu',
    [
      N('GUCK. Guck, guck, guck.', 'freude'),
      erz('Aus Nyras Kapuze ragen zwei sehr große Plüschohren.'),
      N('Dante hat mir Captain Kuschel gegeben. DANTE. MIR. Er hat gesagt: „Pass auf ihn auf. Er passt auf dich auf.“ Ich hab geheult. Vor Dante. Ich bin quasi tot vor Scham.'),
    ],
    [K('(Beide Ohren hoch.)'), N('Er sagt, ich soll aufhören, so zu quietschen. Das ist Ohren-Sprache für „Ich hab dich lieb“. Glaub ich.')],
    M, { effects: [flag('nyra_kommentar_kuschel'), herz('nyra', 10)] }),
  team: tagesgespraech('nyra-tag-team',
    [N('Ich gehör jetzt richtig dazu, oder? Hunter hat mir einen Schlüssel gegeben. Für den Hintereingang. Für den MÜLL. Aber trotzdem! Ein Schlüssel!', 'freude')],
    [N('Ich hab mir ausgerechnet, wie viele Leute in der Crew sind. Mit mir sind’s mehr als ohne mich. Mathematisch ist das ein Riesenschritt.')],
    M, { effects: [flag('nyra_kommentar_team')] }),
  zweifel: tagesgespraech('nyra-tag-zweifel',
    [N('Hi. Ich bin noch da. Falls jemand gefragt hat. Hat keiner gefragt. Egal.', 'trauer')],
    [N('Dante hat gesagt, er will nicht mehr. Und ich hab gedacht, wenn nicht mal Dante will, warum sollte dann irgendwer … ach, egal. Ich hab Code zu schreiben.', 'besorgt')],
    M),
  vexaria: tagesgespraech('nyra-tag-vexaria',
    [
      N('Ich hab kein Video. Von dir und Aria. In der Gasse. Hab ich nicht.', 'besorgt'),
      N('… Ich hab’s gelöscht. Fast. Es liegt im Papierkorb. Der Papierkorb ist verschlüsselt. Mit deinem Geburtstag. Den kenn ich nicht. Ich hab geraten.'),
    ],
    [N('Ihr seid wie ein Hack, der eigentlich nicht funktionieren dürfte. Zwei inkompatible Systeme, und trotzdem leuchtet alles grün. Das ist das Romantischste, was ich je gesagt hab. Vergiss es.', 'freude')],
    M, { effects: [flag('nyra_kommentar_vexaria')] }),
  flutmauer: tagesgespraech('nyra-tag-flutmauer',
    [N('Pssst. Hörst du das? Das ist das Meer. Okay, das ist die Kläranlage. Aber wenn man die Augen zumacht und sehr viel lügt, ist es das Meer.', 'freude')],
    [N('Das Münzfernrohr zeigt bis zur Bojeninsel, wenn man fünf Credits reinwirft und den Smog wegwünscht. Ich hab schon dreihundert Credits reingeworfen. Wünschen klappt noch nicht.', 'signatur')],
    M),
  netzcafe: tagesgespraech('nyra-tag-netzcafe',
    [N('Morgen! Ich bin seit vier Uhr hier. Oder seit gestern. Kaffee Nummer sieben. Ich seh Geräusche.', 'freude')],
    [N('Das Netzcafé ist der einzige Ort, wo keiner fragt, warum man um fünf Uhr morgens mit drei Laptops gleichzeitig tippt. Hier ist das normal. Hier bin ich normal. Herrlich.')],
    M),
  markt: tagesgespraech('nyra-tag-markt',
    [N('Elektronikstand. Ich such einen Zentrator. Der Typ hier hat einen, aber er will dafür meine Seele. Ich hab gesagt, die ist schon an Dante vergeben.', 'signatur')],
    [N('Guck mal, ein Netzwerkkabel von 2061. Das ist älter als ich. Ich kauf’s. Nicht, weil ich’s brauch. Aus Respekt.')],
    M),
  club: tagesgespraech('nyra-tag-club',
    [N('Wochenende! Laptop-Ecke! Ich überwach hier offiziell die Musikanlage. Inoffiziell guck ich Leuten beim Tanzen zu und benote sie.', 'freude')],
    [N('Aria kriegt eine Zehn. Der Richter eine Zwei. Hunter hat noch nie getanzt. Hunter kriegt ein Fragezeichen.')],
    M),
  dach: tagesgespraech('nyra-tag-dach',
    [N('Selfie mit Sternen? Es sind keine Sterne zu sehen. Ich mach trotzdem eins. Die Sterne kommen in der Bearbeitung.', 'signatur')],
    [N('Vega schläft da drüben. Mit offenem Auge. Ich schwör, sie schläft mit einem offenen Auge. Ich hab ein Foto davon. Sie hat mich angeguckt, während ich’s gemacht hab.', 'besorgt')],
    M),
  vertraut: tagesgespraech('nyra-tag-vertraut',
    [N('{name}! Ich hab dich in meiner Kontaktliste umbenannt. Vorher: „Die Neue mit dem Gesicht“. Jetzt: „Familie (Beta)“.', 'freude')],
    [N('Beta, weil wir noch Fehler haben. Aber Beta heißt auch: Wir sind schon drin. Man wirft Betas nicht weg. Man patcht sie.')],
    M),
  standard: tagesgespraech('nyra-tag-standard',
    [N('Hi! Hallo! Ich bin gar nicht hier, ich bin quasi Hintergrundrauschen. Mit Laptop.')],
    [N('Ich hab heute ausgerechnet, dass ich in meinem Leben schon 4.312 Selfies gemacht hab. Auf 4.000 davon guck ich überrascht. Ich arbeite dran.', 'ueberrascht')],
    M),
};

// ---------------------------------------------------------------------------------------------- Herz-Ereignisse

const he2 = dialog('he-nyra-2', [
  knoten('start', [
    erz('Dachterrasse, Nacht. Nyra hockt auf der Lichterketten-Bank, das Handy auf Armlänge, die Zunge zwischen den Zähnen.'),
    N('Halt still. Halt STILL. Ich brauch ein Foto von uns für den Feed. Mein Feed ist tot. Drei Follower. Einer davon ist mein Toaster.', 'besorgt'),
    N('Und einer ist ein Fan-Account von Dante. Den hab ich gemacht. Okay, alle drei hab ich gemacht.'),
  ], {
    choices: [
      { text: 'Eine Pose wie aus einem Werbespot reißen. Kinn hoch, Blick in die Ferne.', check: pruefung('he-nyra-2-pose', 'ausstrahlung', 4, ['buehne']), next: 'pose', effects: [herz('nyra', 40)] },
      { text: 'Daumen hoch. Klassisch.', next: 'daumen', effects: [herz('nyra', 30)] },
      { text: '„Ich hasse Fotos.“', next: 'kein-foto', effects: [herz('nyra', 10)] },
    ],
  }),
  knoten('pose', [
    N('Oh. Oh wow. Du siehst aus wie ein Plakat. Wie ein BÖSES Plakat. Das wird viral. In meinem Feed. Also bei drei Leuten. Aber VIRAL.', 'ueberrascht'),
  ], { next: 'kommentar' }),
  knoten('daumen', [N('Daumen hoch. Sehr ehrlich. Sehr Unterstadt. Ich nenn’s „Zwei Idioten gegen den Smog“.', 'freude')], { next: 'kommentar' }),
  knoten('kein-foto', [
    N('Okay. Dann nur ich. Und du im Hintergrund, unscharf. Unscharf zählt nicht als Foto. Rechtlich.', 'signatur'),
  ], { next: 'kommentar' }),
  knoten('kommentar', [
    erz('Nyra tippt. Schnell. Sehr schnell. Dann dreht sie dir den Bildschirm hin.'),
    erz('„Abendlicht mit Crew-Mitglied. #Silent-Angel #NichtAllein. PS @DantesWerkstatt-Fanclub: Dante, falls du das liest – deine Kekse sind die zweitbeste Erfindung nach dem Zentrator. ICH HAB DAS NICHT GESCHRIEBEN.“'),
  ], {
    choices: [
      { text: '„Das hast du sehr wohl geschrieben.“', next: 'ende-ehrlich', effects: [herz('nyra', 20)] },
      { text: '„Schreib dazu, dass der Zentrator falsch herum eingebaut war.“', check: pruefung('he-nyra-2-zentrator', 'technik', 5, ['hacken']), next: 'ende-technik', effects: [herz('nyra', 40)] },
      { text: '„Schick ab.“', next: 'ende' },
    ],
  }),
  knoten('ende-ehrlich', [N('Hab ich nicht! Mein Daumen. Der ist Fan. Ich nicht. Ich bin ganz normal. Ich hab nur einen Ordner.', 'besorgt')], { next: 'ende' }),
  knoten('ende-technik', [
    N('„Der Zentrator war falsch herum.“ Das ist … das ist ein Insider aus Dantes alter Hacker-Zeit. Woher weißt du das?!', 'ueberrascht'),
    N('Okay. Du bist jetzt offiziell Mitglied im Fanclub. Ehrenmitglied. Du kriegst einen Ausweis. Ich druck ihn auf Kassenzettel.', 'freude'),
  ], { next: 'ende' }),
  knoten('ende', [
    erz('Ping. Ein Like. Dann noch einer. Von einem Account namens „ploetzlich_kekse_2060“.'),
    N('… Das ist er. Das ist DANTE. Er hat geliked. Er hat MICH geliked.', 'ueberrascht'),
    N('Ich geh jetzt schlafen. Ich werd nie wieder schlafen. Gute Nacht!', 'freude'),
  ], { effects: [flag('nyra_selfie'), { phone: 'tel-nyra-selfie' }, { xp: 40 }] }),
]);

const he4 = dialog('he-nyra-4', [
  knoten('start', [
    erz('Flutmauer, Abend. Die Sonne sackt in den Smog wie ein Kaugummi in eine Pfütze. Nyra steht am Münzfernrohr und wirft eine Münze nach der anderen ein.'),
    N('Komm, guck. Da hinten. Die rote Boje. Dahinter wird’s heller. Das ist kein Smog. Das ist Horizont. Ich schwör’s.', 'freude'),
    N('Ich will da hin. Nicht irgendwann. Bald. Aber man braucht eine Karte. Eine echte. Die alten Küstenkarten sind alle weg. Quantum hat das Archiv „bereinigt“.', 'wut'),
  ], {
    choices: [
      { text: '„Ich kenn den Weg ein Stück. Hinter den Glasdünen biegt die Küste nach Süden ab, da steht ein alter Leuchtturm.“', tag: '[Ödnis]', when: { origin: 'origin-oednis' }, next: 'oednis', effects: [herz('nyra', 50), { give: 'kuestenkarte-fragment' }, flag('nyra_kuestenkarte')] },
      { text: 'Die fossile Muschel aus der Tasche holen.', when: { item: 'fossile-muschel' }, next: 'muschel', effects: [{ take: 'fossile-muschel' }, herz('nyra', 50), { give: 'kuestenkarte-fragment' }, flag('nyra_kuestenkarte')] },
      { text: 'Das Münzfernrohr hacken. Die alten Dinger haben einen Bildspeicher.', check: pruefung('he-nyra-4-fernrohr', 'technik', 6, ['hacken', 'maschine']), next: 'speicher', effects: [herz('nyra', 40), { give: 'kuestenkarte-fragment' }, flag('nyra_kuestenkarte')] },
      { text: '„Erzähl mir, wie du dir’s vorstellst.“', next: 'vorstellen', effects: [herz('nyra', 30)] },
    ],
  }),
  knoten('oednis', [
    N('Ein Leuchtturm. Ein LEUCHTTURM. Warte, warte, ich zeichne mit.', 'ueberrascht'),
    erz('Nyra kritzelt auf die Rückseite einer Postkarte, während du erzählst: Dünen, Knick nach Süden, Turm, eine Bucht, die aussieht wie ein Biss in einen Keks.'),
    N('Das ist das erste Stück. Das erste echte Stück Karte. Von dir.', 'freude'),
  ], { next: 'ende' }),
  knoten('muschel', [
    erz('Nyra hält die Muschel gegen das letzte Licht. Auf der Innenseite: eine feine eingeritzte Linie, eine Küste, zwei Kreise, ein Kreuz.'),
    N('Das ist eine Karte. Jemand hat in eine Muschel eine Karte geritzt. Vor hundert Jahren. Für uns.', 'ueberrascht'),
    N('Ich weine nicht. Das ist Salzwasser. Thematisch passend.', 'trauer'),
  ], { next: 'ende' }),
  knoten('speicher', [
    erz('Hinter der Münzklappe sitzt ein Speicherchip, so alt, dass er noch Staub sammelt. Du überbrückst zwei Kontakte. Das Fernrohr spuckt ein Bild aus: eine Testaufnahme von 2049. Die Küste, gestochen scharf. Mit Bojennummern.'),
    N('Du hast … aus einem MÜNZFERNROHR … eine Küstenkarte gehackt.', 'ueberrascht'),
    N('Ich hab dreihundert Credits da reingeworfen. Dreihundert. Und du drückst zwei Drähte zusammen.', 'wut'),
    N('Ich liebe es. Ich hasse dich. Ich liebe es.', 'freude'),
  ], { next: 'ende' }),
  knoten('vorstellen', [
    N('Wie ich’s mir vorstelle? Okay. Augen zu.', 'freude'),
    N('Es ist laut, aber nicht wie die Stadt. Es ist laut wie … wie ein Lüfter, der nie kaputtgeht. Es riecht nach Salz und nach nichts anderem. Kein Öl. Keine Nudeln. Kein Ripper.'),
    N('Und keiner fragt, wo du herkommst. Das Meer ist allen egal. Das find ich das Schönste daran.', 'trauer'),
    N('Wenn du je was findest, Muscheln, Karten, irgendwas … bring’s mir. Bitte.'),
  ], { next: 'ende' }),
  knoten('ende', [
    N('Danke. Dass du mitguckst. Die meisten lachen, wenn ich vom Meer rede.'),
    N('Du lachst auch. Aber anders. Mit mir, nicht über mich.', 'freude'),
  ], { effects: [flag('nyra_meer_gespraech'), { xp: 60 }] }),
]);

const he6 = dialog('he-nyra-6', [
  knoten('start', [
    erz('Flutmauer, auf der Bank. Nyra hat die Knie angezogen und das Laptop zugeklappt. Das hat sie noch nie getan.'),
    N('Weißt du, was Dante zu mir gesagt hat? Durchs Fenster. Er dachte, ich hör’s nicht. Ich hör immer alles. Silent-Angel, schon vergessen?', 'besorgt'),
    N('Er hat gesagt: „Nimm, was du kriegen kannst, und hau ab. Und wenn du nichts mehr kriegen kannst, dann such dir Leute, bei denen du bleiben willst.“'),
    N('Ich hab mein ganzes Leben nur den ersten Teil gemacht. Nehmen. Abhauen. Ich weiß nicht, wie der zweite Teil geht.', 'trauer'),
  ], {
    choices: [
      { text: '„Allein ist man nicht frei. Nur allein.“', check: pruefung('he-nyra-6-frei', 'ausstrahlung', 6, ['trost']), next: 'frei', effects: [herz('nyra', 50)] },
      { text: '„Ich war am Fenster. Ich hab’s auch gehört. Er hat dich gemeint. Uns.“', tag: '[Dantes Rat]', when: { flag: 'dantes_rat_gehoert' }, next: 'fenster', effects: [herz('nyra', 50)] },
      { text: '„Der zweite Teil geht so: Du sitzt hier. Ich sitz hier. Keiner haut ab.“', next: 'sitzen', effects: [herz('nyra', 40)] },
      { text: '„Dante redet viel, wenn der Tag lang ist.“', next: 'abwinken', effects: [herz('nyra', 10)] },
    ],
  }),
  knoten('frei', [
    N('… Das ist gut. Das ist richtig gut. Darf ich das klauen? Für meine Signatur? Unter jede Mail?', 'ueberrascht'),
    N('Nein. Das ist zu wertvoll für Mails. Das schreib ich mir auf den Arm. Mit Edding. Und dann mit Tinte. Irgendwann.', 'freude'),
  ], { next: 'ende' }),
  knoten('fenster', [
    N('Du warst AUCH da? Wir haben beide am Fenster gelauscht? Wie zwei Einbrecher?', 'ueberrascht'),
    N('Okay, das ist offiziell unsere Sache jetzt. Wir sind die Fenster-Bande. Mitglieder: zwei. Plus Captain Kuschel. Der war auch dabei. Der hat’s auch gehört.', 'freude'),
  ], { next: 'ende' }),
  knoten('sitzen', [
    erz('Ihr sitzt. Der Wind zerrt an Nyras Kapuze. Unten schlägt das Wasser gegen die Mauer, braun und träge, als hätte es schlechte Laune.'),
    N('Das ist … okay. Das ist eigentlich voll okay. Sitzen. Kann ich.', 'freude'),
  ], { next: 'ende' }),
  knoten('abwinken', [
    N('Ja. Vielleicht. Wahrscheinlich hat er’s nur so gesagt.', 'trauer'),
    N('Aber ich behalt’s trotzdem. Ich behalt alles. Ich bin ein Datenspeicher mit Kapuze.'),
  ], { next: 'ende' }),
  knoten('ende', [
    N('Wenn ich mal weg bin … ich mein, nur so … dann komm ich zurück. Schneller, als ihr denkt. Versprochen.', 'besorgt'),
    erz('Nyra hält dir den kleinen Finger hin. Ein Schwur, wie ihn Kinder machen. Sie meint ihn sehr erwachsen.'),
  ], {
    effects: [flag('nyra_teamgeist'), { xp: 90 }],
    choices: [
      { text: 'Einhaken. „Versprochen.“', effects: [herz('nyra', 20)] },
      { text: '„Du gehst nicht weg, Nyra.“' },
    ],
  }),
]);

// ♥8 und ♥10: angelegt, erst nach Akt 3 (world.md §4.2).
const he8 = dialog('he-nyra-8', [
  knoten('start', [
    erz('High Voltage. Die ganze Crew sitzt da. Nyra steht vor ihnen, die Hände in den Ärmeln, die Kapuze ausnahmsweise unten.'),
    N('Ich hab im Labor gesagt, was die hören wollten. „Master“. Ich hab das gesagt. Zu Blade. Ich weiß nicht, wie viel davon gespielt war.', 'trauer'),
    N('Es tut mir leid. Allen. Auch dir, Hunter. Vor allem dir. Du hast mir einen Schlüssel für den Müll gegeben.'),
  ], {
    choices: [
      { text: 'Neben sie treten. „Sie hat uns nicht verraten. Sie hat überlebt. Das ist was anderes.“', check: pruefung('he-nyra-8-beistand', 'ausstrahlung', 7, ['trost', 'ueberreden']), next: 'ende', effects: [herz('nyra', 60)] },
      { text: 'Einfach neben sie stellen. Nichts sagen.', next: 'ende', effects: [herz('nyra', 40)] },
    ],
  }),
  knoten('ende', [N('Ihr wollt mich noch. Ihr wollt mich wirklich noch.', 'freude')], { effects: [flag('nyra_entschuldigt'), { xp: 150 }] }),
]);

const he10 = dialog('he-nyra-10', [
  knoten('start', [
    erz('Flutmauer, Abend. Nyra hat Kopfhörer auf und lächelt mit geschlossenen Augen. Sie reicht dir einen.'),
    N('Hör mal. Wellenrauschen. Ich hab’s nicht aufgenommen. Ich hab’s gebaut. Aus allem, was du mir erzählt hast. Jedes Wort ist eine Welle.', 'freude'),
    N('Für dich. Damit du’s immer dabeihast. Auch wenn wir mal nicht am Meer sind.'),
  ], { choices: [{ text: 'Den Chip nehmen. „Wir fahren hin. Zusammen.“', next: 'ende' }, { text: 'Zuhören. Lange.', next: 'ende' }] }),
  knoten('ende', [N('Mit Eimer.', 'signatur')], { effects: [{ give: 'nyra-wellenchip' }, herz('nyra', 40), { xp: 150 }] }),
]);

// Rivalität −5: Hack-Duell im Netzcafé.
const re5 = dialog('re-nyra-5', [
  knoten('start', [
    erz('Netzcafé. Auf allen Bildschirmen gleichzeitig: dein Gesicht, in Zeitlupe, beim Niesen. Nyra sitzt mittendrin, Arme verschränkt.'),
    N('Hack-Duell. Jetzt. Wer zuerst die Firewall knackt, entscheidet, was das Stadt-TV heute Abend zeigt.', 'wut'),
  ], {
    choices: [
      {
        text: 'Annehmen.', next: 'ende',
        effects: [{
          minigame: 'akt-hacken', level: 4, key: 're-nyra-5-duell', label: 'Hack-Duell gegen Nyra',
          win: [herz('nyra', 60), { message: 'Grün. Vor ihr. Nyra starrt auf den Bildschirm. „Wie … WIE?“ Dann, leise: „Respekt.“' }],
          lose: [herz('nyra', 20), { message: 'Nyra ist schneller. Viel schneller. Aber sie löscht das Niesvideo trotzdem. „Du hast dich wenigstens getraut.“' }],
        }],
      },
      { text: '„Ich will nicht gegen dich hacken. Ich will, dass du wieder mit mir redest.“', next: 'ende', effects: [herz('nyra', 30)] },
    ],
  }),
  knoten('ende', [N('Wir sind nicht quitt. Aber … Postkarten. Ich mag Postkarten. Nur so als Info.', 'besorgt')]),
]);

// ---------------------------------------------------------------------------------------------- Figur

const nyra: NpcDef = {
  id: 'nyra',
  name: 'Nyra',
  portrait: 'nyra',
  sprite: 'nyra-walk',
  faction: 'crew-hunter',
  bio: 'Junge Hackerin, Rufname „Silent-Angel“. Dantes größter Fan, macht Selfies von allem und träumt vom Meer, das keiner je gesehen hat. Fragt gern: „Wenn ich zurückkomme, wollt ihr mich dann noch?“',
  gifts: {
    loves: ['postkarte-meer', 'fossile-muschel', 'muschel-frisch', 'muschel-glas', 'sandflasche', 'meer-foto'],
    likes: ['datenkristall', 'neon-limo', 'sonnencreme', 'comic-heft', 'retro-tastatur', 'echtobst-apfel', 'hofhonig'],
    dislikes: ['faxpapier', 'edelbrause'],
    hates: ['peilsender', 'defekter-neurochip', 'rostige-dose', 'virus-implantat'],
  },
  schedule: [
    { slot: 'morgen', place: { map: 'netzcafe-datenkruemel', at: 'nyras-platz' } },
    { slot: 'tag', place: { map: 'schrottmarkt', at: 'elektronikstand' } },
    { slot: 'abend', days: ['sa', 'so'], place: { map: 'high-voltage', at: 'laptop-ecke' } },
    { slot: 'abend', place: { map: 'flutmauer', at: 'muenzfernrohr' } },
    { slot: 'nacht', place: { map: 'neon-gasse', at: 'dachterrasse' } },
  ],
  heartEvents: [
    { id: 'he-nyra-2', hearts: 2, map: 'neon-gasse', time: 'nacht', when: PROBEZEIT, dialogue: 'he-nyra-2' },
    { id: 'he-nyra-4', hearts: 4, map: 'flutmauer', time: 'abend', when: { weekday: ['mo', 'di', 'mi', 'do', 'fr'] }, cutscene: 'szene-he-nyra-4', dialogue: 'he-nyra-4' },
    { id: 'he-nyra-6', hearts: 6, map: 'flutmauer', time: 'abend', when: { all: [{ weekday: ['mo', 'di', 'mi', 'do', 'fr'] }, DANTE_DONE] }, dialogue: 'he-nyra-6' },
    { id: 'he-nyra-8', hearts: 8, map: 'high-voltage', time: 'abend', when: { act: 3 }, dialogue: 'he-nyra-8' },
    { id: 'he-nyra-10', hearts: 10, map: 'flutmauer', time: 'abend', when: { all: [{ act: 3 }, { seen: 'he-nyra-8' }] }, dialogue: 'he-nyra-10' },
    { id: 're-nyra-5', hearts: -5, map: 'netzcafe-datenkruemel', dialogue: 're-nyra-5' },
  ],
  companion: {
    // world.md §4.6/§11.2: Akt 1 eingeschränkt (Hack-Aufträge, Hack-Nebenquests), ab Akt 3 voll. Die Einschränkung
    // kennt die Engine nicht (Lücke notiert); Nyra stellt sie im Dialog klar.
    recruit: PROBEZEIT,
    stats: {
      hp: 36, armor: 0, morale: 65,
      attributes: { technik: 8, koerper: 2, reflexe: 6, ausstrahlung: 4, strasse: 4 },
      weapon: { kind: 'smart', damage: 4, range: 6, hit: 5 },
      abilities: ['nyra-silent-angel', 'nyra-zentrator-umkehr'],
    },
    heartAbilities: [{ hearts: 6, ability: 'nyra-meeresrauschen' }],
  },
  partyCheckBonus: [
    { attribute: 'technik', tags: ['hacken', 'terminal', 'drohne'], value: 1, label: 'Nyra flüstert dir Befehle zu' },
  ],
  talk: [
    rede('nyra-tag-rivale', { rival: 'nyra' }),
    rede('nyra-tag-kuschel-neu', { all: [KUSCHEL, { notFlag: 'nyra_kommentar_kuschel' }] }),
    rede('nyra-tag-vexaria', { all: [VEX, { flag: 'vexaria_knutsch' }, { notFlag: 'nyra_kommentar_vexaria' }] }),
    rede('nyra-tag-team', { all: [{ any: [{ flag: 'nyra_team_2' }, { flag: 'nyra_team_3' }] }, { notFlag: 'nyra_kommentar_team' }] }),
    rede('nyra-tag-zweifel', { all: [{ any: [{ flag: 'nyra_team_0' }, { flag: 'dante_abgelehnt' }] }, { not: DANTE_DONE }] }),
    rede('nyra-tag-zeit', { not: { act: 3 } }, 8),
    rede('nyra-tag-flutmauer', { all: [{ time: 'abend' }, { weekday: ['mo', 'di', 'mi', 'do', 'fr'] }] }),
    rede('nyra-tag-club', { all: [{ time: 'abend' }, { weekday: ['sa', 'so'] }] }),
    rede('nyra-tag-vertraut', undefined, 6),
    rede('nyra-tag-netzcafe', { time: 'morgen' }),
    rede('nyra-tag-markt', { time: 'tag' }),
    rede('nyra-tag-dach', { time: 'nacht' }),
    rede('nyra-tag-standard'),
  ],
};

export const part: ContentPart = {
  npcs: { nyra },
  dialogues: sammle(
    T.rivale, T.zeit, T.kuschelNeu, T.team, T.zweifel, T.vexaria, T.flutmauer, T.netzcafe, T.markt, T.club, T.dach,
    T.vertraut, T.standard,
    he2, he4, he6, he8, he10, re5,
  ),
  cutscenes: sammleSzenen({
    id: 'szene-he-nyra-4', title: 'Die rote Boje',
    beats: [
      { image: 'cut-he-nyra-4', pan: 'right', fade: 'in', caption: 'Flutmauer, Abend. Fünf Credits für drei Minuten Horizont.', hold: 1600 },
    ],
  }),
  phone: {
    'tel-nyra-selfie': {
      id: 'tel-nyra-selfie', from: 'nyra',
      text: 'DU BIST IN MEINEM FEED!!! 4 Likes!!! Einer ist von Dante!!! (Ich glaub, einer ist von Vega. Sie hat nur „Smog.“ kommentiert. Ich werte das als Herz.)',
      replies: [{ text: '„Ich will das Foto auch.“', effects: [herz('nyra', 5)] }, { text: '„Lösch es.“' }],
    },
    'tel-nyra-meer': {
      id: 'tel-nyra-meer', from: 'nyra',
      text: 'Flutmauer heute Abend? Ich hab fünf Credits fürs Fernrohr. Du bringst Fantasie mit. (Unter der Woche, am WE hab ich Club-Dienst.)',
      auto: { all: [{ hearts: 'nyra', min: 4 }, neu('he-nyra-4')] },
    },
    'tel-nyra-dante': {
      id: 'tel-nyra-dante', from: 'nyra',
      text: 'Kann ich dir was erzählen? Nicht am Telefon. Flutmauer, auf der Bank. Abends. Bitte bring keine Witze mit. Doch. Einen.',
      auto: { all: [{ hearts: 'nyra', min: 6 }, DANTE_DONE, neu('he-nyra-6')] },
    },
  },
};

