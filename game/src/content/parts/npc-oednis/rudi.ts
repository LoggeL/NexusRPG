// Rudi – Wirt von Rudis Diner an der Staubstraße (world.md §3.5 staubstrasse, §4.5, act23.json npcSchedules/events).
// Ex-Pilot, sein abgestürzter Passagierflieger ist heute der Diner. Laden `rudis-diner` (maps-23/shops-staubstrasse.ts),
// Rezept für pers-jakko-kochbuch (`rezeptzettel-rudi`), Friedenstisch für side-oednis-frieden (Questdialoge: Quest-Pakete).
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode } from '../../../modules/contracts';
import {
  type Menue, dialog, erz, flag, geschenke, gespraech, herz, ich, knoten, nichtGetroffen, ort, pruefung, rede, sammle,
  sprecher, weg, weltfigur, zurueck,
} from './_oednis';

const ID = 'rudi';
const R = sprecher(ID);
const Z = zurueck('Noch was, Rudi.', 'Danke fürs Essen.');

const FRIEDEN: Condition = { quest: 'side-oednis-frieden', state: 'done' };
const FRIEDEN_LAEUFT: Condition = { quest: 'side-oednis-frieden', state: 'active' };
const KOCHBUCH: Condition = {
  all: [{ quest: 'pers-jakko-kochbuch', state: 'active' }, { noItem: 'rezeptzettel-rudi' }, { notFlag: 'jk_fertig' }],
};

const choices: DialogueChoice[] = [
  { text: 'Was gibt’s zu essen?', next: 'karte', effects: [{ shop: 'rudis-diner' }] },
  { text: 'Wie kommt ein Flugzeug in die Wüste?', next: 'flugzeug' },
  { text: 'Was ist mit den Staubfalken und den Aussiedlern?', next: 'streit', when: { not: FRIEDEN } },
  { text: 'Der Friedenstisch hält?', next: 'frieden', when: FRIEDEN },
  { text: 'Wer ist hier draußen wichtig?', next: 'leute' },
  {
    text: '„Lass mich mal an den Herd. Ich koch dir was.“', tag: '[Kochen]', next: 'kochen', once: true, id: 'rudi-kochen',
    effects: [{
      minigame: 'akt-kochen', level: 2, key: 'rudi-kochen', label: 'Eine Schicht in Rudis Küche',
      win: [herz(ID, 30), { credits: 40 }, { give: 'hofhonig-pfannkuchen' }, { message: 'Rudi: „Nicht schlecht. Du darfst wiederkommen. Als Gast.“' }],
      lose: [herz(ID, 5), { message: 'Rudi kratzt deinen Pfannkuchen von der Decke. „Kommt vor. Meistens bei mir.“' }],
    }],
  },
  { text: '„Jakko sammelt Rezepte. Hast du eins für ihn?“', when: KOCHBUCH, next: 'jakko' },
  { text: '„Wie war der Absturz wirklich?“', tag: '[Rudi ♥3]', requires: { hearts: ID, min: 3 }, once: true, id: 'rudi-wirklich', next: 'wirklich' },
  { text: '„Ich bin hier draußen aufgewachsen. Kennst du noch die alte Karawane von den Brunnenleuten?“', tag: '[Ödnis]', when: { origin: 'origin-oednis' }, once: true, id: 'rudi-oednis', next: 'oednis' },
  { text: 'Danke fürs Essen.' },
];

const nodes: DialogueNode[] = [
  knoten('karte', [R('Pfannkuchen. Kaffee. Pflaster für danach. Und Staubmasken, weil die Hälfte meiner Gäste weiter will zu den Glasdünen und die andere Hälfte da schon war und hustet.')]),
  knoten('flugzeug', [
    R('Schlecht geparkt. Ganz einfach.'),
    R('Linienflug 404 von der Oberstadt zur Küste, 2061. Ich vorne links, zweihundert Leute hinten. Triebwerk zwei sagt „Tschüss“, Triebwerk eins sagt „Ich auch“. Ich such mir die weichste Stelle der Ödnis.'),
    R('Gibt keine weiche Stelle. Aber alle haben überlebt. Die Airline hat mich gefeuert. Wegen „unkonventioneller Landung“. Ich hab den Rumpf behalten. Als Abfindung. Hat keiner widersprochen.'),
  ], { choices: Z }),
  knoten('streit', [
    R('Die Falken wollen Zoll für die Straße. Die Aussiedler wollen ihr Wasser behalten. Beide frühstücken bei mir. An getrennten Enden.', 'besorgt'),
    R('Wenn ich die zwei mal an einen Tisch kriege, back ich Pfannkuchen, bis die Pfanne glüht. Marla redet seit Jahren davon. Marla redet viel, wenn der Wind weht.'),
  ], { choices: Z }),
  knoten('frieden', [
    R('Hält. Seit dem Vertrag sitzen Krähe und Marla am selben Tisch. Nicht nebeneinander. Aber am selben Tisch. Für die Ödnis ist das quasi eine Hochzeit.', 'freude'),
    R('Und wer Streit anfängt, spült eine Woche. Steht da hinten am Zettel. Krähe hat schon zwei Tage gespült. Sie behauptet, das war Absicht. Wegen der Geschichten in der Küche.'),
  ], { choices: Z }),
  knoten('leute', [
    R('Marla Sand vom Aussiedlerhof. Kennt jeden Weg, jede Düne, jeden Mistkerl. Krähe drüben in der Wrackburg. Hat mehr Narben als ich Rechnungen.'),
    R('Opa Funk oben im Bunker an der Funkturm-Ruine. Der sendet Radio Rost. Hört keiner mehr in der Stadt, seit das Windrad kaputt ist. Und die Glasbläserin in den Dünen. Die kommt nie her. Ich schick ihr Pfannkuchen mit dem Konvoi.'),
    R('Und Brösel. Staubbaron Brösel. Verkauft Wasser an die Durstigen zum Dreifachen. Wenn du den triffst: nicht die Hand geben. Die hat er geklaut.'),
  ], { choices: Z }),
  knoten('kochen', [R('Schürze, da. Pfanne, da. Feuerlöscher, da. In der Reihenfolge brauchst du sie meistens auch.')]),
  knoten('jakko', [
    R('Ein Kind will Rezepte? Von mir? Das ist das Netteste, was hier draußen seit dem Absturz passiert ist.', 'freude'),
    erz('Rudi reißt ein Blatt aus dem Bestellblock und kritzelt. Er schreibt lange. Dann streicht er fast alles wieder durch.'),
    R('Rudis Eintopf. Was da ist. Mehr davon. Salz nicht vergessen. Und die Pfannkuchen als Nachtisch, das geheime Teil steht unten. Sag ihm: Wer’s verrät, kriegt Hausverbot. Lebenslang.'),
  ], { choices: Z, effects: [{ give: 'rezeptzettel-rudi' }, herz(ID, 20)] }),
  knoten('wirklich', [
    R('Wirklich? Ich hab geheult wie ein Baby. Die ganze Landung lang. Über Lautsprecher. Die Leute haben gedacht, das ist die Sicherheitsansage.', 'trauer'),
    R('Danach hab ich zwei Wochen im Rumpf gesessen, bis alle abgeholt waren. Ich hab gekocht, mit dem, was im Bordküchenwagen war. Pfannkuchenteig für zweihundert. Die Leute haben gesagt: Das Beste am Flug war das Essen.'),
    R('Da wusste ich, wo ich hingehöre. Nicht ins Cockpit. Hinter die Durchreiche.'),
  ], { choices: Z, effects: [herz(ID, 25)] }),
  knoten('oednis', [
    R('Die Brunnenleute? Mit den blauen Kanistern und dem singenden Lastwagen? Dann warst du das Kind, das mir die Zuckerdose geklaut hat!', 'ueberrascht'),
    R('Ich hab zwanzig Jahre auf dich gewartet, du kleiner Dreckskerl. Hier. Pfannkuchen. Aufs Haus. Und die Zuckerdose bleibt diesmal da.'),
  ], { choices: Z, effects: [herz(ID, 40), { give: 'hofhonig-pfannkuchen' }] }),
];

const M: Menue = { zeile: R('Noch was? Die Pfanne ist heiß, ich bin’s auch.'), choices, nodes };

const T = {
  rivale: dialog('rudi-tag-rivale', [knoten('start', [
    R('Du kriegst hier nichts mehr. Kein Kaffee, kein Pfannkuchen, kein Wasser aus der Leitung.', 'wut'),
    R('Und jetzt raus aus meinem Flugzeug, bevor ich den Schleudersitz finde. Ich weiß, dass es keinen gibt. Ich such trotzdem.'),
  ])]),
  erstes: gespraech('rudi-tag-erstes', [
    erz('Hinter dem Tresen ein breiter Mann mit Pilotenmütze, Schürze und Unterarmen wie Ölfässer. Er wendet drei Pfannkuchen gleichzeitig, ohne hinzusehen.'),
    R('Willkommen an Bord. Ich bin Rudi, euer Kapitän und Koch. Bitte stellen Sie das Rumjammern ein, wir befinden uns im Sinkflug in Richtung Frühstück.'),
    R('Neu hier draußen? Sieht man. Du hast noch beide Augenbrauen und keinen Sand in den Ohren. Setz dich.'),
  ], M),
  morgen: gespraech('rudi-tag-morgen', [
    erz('Der Diner ist voll mit Konvoi-Fahrern, die ihre Augen noch suchen. Rudi schenkt Kaffee nach, bevor jemand fragt.'),
    R('Morgen. Der Kaffee ist stark genug, um einen Laster anzuschieben. Hab ich ausprobiert. Hat geklappt. Der Laster war auch überrascht.'),
  ], M),
  kueche: gespraech('rudi-tag-kueche', [
    erz('Rudi steht hinten in der Küche. Durch die Durchreiche siehst du nur seine Arme, die Pfannen schwenken wie Signalkellen.'),
    R('Bestellung durch die Durchreiche! Ich hab keine Hände frei, nur Meinungen.'),
  ], M),
  abend: gespraech('rudi-tag-abend', [
    erz('Abends dimmt Rudi die Neonröhren. Die Jukebox spielt leise, ein Staubfalke und ein Aussiedler sitzen drei Hocker auseinander und tun so, als würden sie sich nicht kennen.'),
    R('Abendflug. Ruhig, warm, wenig Turbulenzen. Außer der Falke da drüben fängt wieder an zu singen.'),
  ], M),
  frieden: gespraech('rudi-tag-frieden', [
    erz('Über dem Tresen hängen jetzt zwei Wimpel nebeneinander: eine Krähenfeder und ein blauer Wasserkanister. Rudi hat sie selbst angenagelt. Schief.'),
    R('Da ist ja unser Friedensengel! Pfannkuchen gibt’s für dich zum halben Preis. Nein, war gelogen. Aber ich lächle dabei.', 'freude'),
  ], M),
  verhandlung: gespraech('rudi-tag-verhandlung', [
    R('Der Friedenstisch ist gedeckt. Ich hab extra das gute Besteck rausgeholt. Das Besteck ohne Kerben. Wenn’s losgeht, sag Bescheid. Ich bleib in der Nähe, mit der Pfanne.', 'besorgt'),
  ], M),
  freund: gespraech('rudi-tag-freund', [
    R('Da kommt mein Lieblingspassagier! Setz dich auf 1A. Da hat schon der Bürgermeister von der Küste gesessen. Und ein Hund. Der Hund war netter.', 'freude'),
  ], M),
  epilog: gespraech('rudi-tag-epilog', [
    erz('An der Kasse klebt ein Foto: das Meer, blau, unscharf, mit einem Daumen in der Ecke. Darunter steht „Endziel erreicht“.'),
    R('Ihr habt’s geschafft, hab ich gehört. Bis ans Meer. Ich sag ja: Jede Landung, nach der man noch Pfannkuchen essen kann, ist eine gute Landung.'),
  ], M),
  standard: gespraech('rudi-tag-standard', [R('Na, Reisende? Hunger, Durst oder einfach nur Angst vor dem Sand? Gegen alles drei hab ich Pfannkuchen.')], M),
};

/** ♥2: Rudi erzählt, wie Flug 404 zum Diner wurde. Pfannkuchen aufs Haus. */
const he2 = dialog('he-rudi-2', [
  knoten('start', [
    erz('Früh am Morgen, der Diner ist leer. Rudi poliert eine Tasse, auf der „Bester Pilot der Welt“ steht. Das „Bester“ ist durchgestrichen, darunter steht mit Kuli „zweitbester“.'),
    R('Weißt du, was das Schlimmste an einem Absturz ist? Nicht der Absturz. Das Danach. Wenn alle weg sind und du sitzt da mit einem kaputten Flugzeug und denkst: Und jetzt?'),
    R('Ich hab mir damals gesagt: Rudi, du kannst nicht fliegen. Aber du kannst Pfannkuchen. Also mach Pfannkuchen. Und guck mal, wer reinkommt.'),
  ], {
    choices: [
      { text: '„Triebwerk zwei, Hydraulik, oder?“ Auf die Fotos im Cockpit zeigen.', tag: '[Technik 4]', check: pruefung('he-rudi-2-hydraulik', 'technik', 4, ['maschine']), next: 'technik' },
      { text: '„Zweitbester? Wer war denn der Beste?“', tag: '[Ausstrahlung 3]', check: pruefung('he-rudi-2-bester', 'ausstrahlung', 3, ['buehne']), next: 'bester' },
      { text: 'Einfach zuhören und den Kaffee austrinken.', next: 'zuhoeren' },
    ],
  }),
  knoten('technik', [
    R('Hydraulikleitung, ja! Endlich mal jemand, der’s versteht. Die Airline hat gesagt: Pilotenfehler. Ich hab gesagt: Leitungsfehler. Wir haben uns auf Pfannkuchen geeinigt.', 'ueberrascht'),
    R('Die Leitung hängt übrigens hinten an der Wand. Eingerahmt. Mein schlimmster Feind, mein bester Freund.'),
  ], { next: 'ende', effects: [herz(ID, 45), { xp: 40 }] }),
  knoten('bester', [
    R('Meine Ausbilderin. Kapitänin Ingrid. Die hätte die Kiste auf einem Bierdeckel gelandet. Hat sie mir auf die Tasse geschrieben, vor dem Flug. Als Witz.', 'freude'),
    R('Nach dem Absturz hat sie das „Bester“ selbst durchgestrichen. Und „zweitbester“ drunter. Sie meinte, auf dem Platz bin ich gut aufgehoben. Hinter ihr.'),
  ], { next: 'ende', effects: [herz(ID, 45), { xp: 40 }] }),
  knoten('zuhoeren', [
    erz('Du sagst nichts. Rudi redet trotzdem weiter, über Triebwerke und Teig, über Sand und Salz, bis die ersten Konvoi-Fahrer reinkommen.'),
    R('Danke. Hier draußen hört einem selten einer zu. Die Leute hier reden lieber mit dem Wind. Der widerspricht nicht.'),
  ], { next: 'ende', effects: [herz(ID, 35), { xp: 25 }] }),
  knoten('ende', [
    erz('Rudi stellt dir einen Teller hin: drei Pfannkuchen, so groß wie Radkappen, im Hofhonig ertränkt.'),
    R('Aufs Haus. Für alle, die sich meine Geschichte bis zum Ende anhören. Bisher drei Leute. Mit dir vier.'),
  ], { effects: [{ give: 'hofhonig-pfannkuchen' }, flag('rudi_absturz_erzaehlt')] }),
]);

/** ♥4: In der Küche verrät Rudi das Pfannkuchen-Rezept (und hat einen Zettel für Jakko, falls der sammelt). */
const he4 = dialog('he-rudi-4', [
  knoten('start', [
    erz('Rudi winkt dich durch die Schwingtür in die Küche. Es ist heiß, es ist laut, und es riecht so gut, dass dein Magen kurz vor Rührung weint.'),
    R('Komm rein, mach die Tür zu. Was ich dir jetzt zeige, weiß sonst keiner. Nicht mal der Konvoi. Und der weiß alles.'),
    R('Das Geheimnis meiner Pfannkuchen. Seit 2061. Pass auf.'),
  ], {
    choices: [
      { text: 'Mitmachen: Teig rühren, Pfanne schwenken, wenden.', tag: '[Kochen]', next: 'mitmachen' },
      { text: 'Die Zutaten erraten: „Hofhonig. Und … Kaktusfrucht?“', tag: '[Straße 4]', check: pruefung('he-rudi-4-zutat', 'strasse', 4, ['geruecht']), next: 'erraten' },
      { text: 'Daneben stehen, zusehen, Mund halten.', next: 'zusehen' },
    ],
  }),
  knoten('mitmachen', [R('Rühren, nicht schlagen! Der Teig hat Gefühle!')], {
    effects: [{
      minigame: 'akt-kochen', level: 2, key: 'he-rudi-4-kochen', label: 'Rudis Pfannkuchen',
      win: [herz(ID, 20), { dialogue: 'he-rudi-4-rezept' }],
      lose: [{ dialogue: 'he-rudi-4-rezept' }],
    }],
  }),
  knoten('erraten', [
    R('Kaktusfrucht! Woher …? Hat Marla gequatscht? Nein, Marla quatscht nur über den Wind. Du hast eine Nase wie ein Spürhund. Ein verfressener Spürhund.', 'ueberrascht'),
  ], { next: 'rezept', effects: [herz(ID, 20)] }),
  knoten('zusehen', [erz('Rudi arbeitet wie ein Pilot im Landeanflug: konzentriert, schnell, mit kleinen Flüchen bei jedem Handgriff. Am Ende liegt ein perfekter Pfannkuchen auf dem Teller. Er sieht aus wie eine Sonne.')], { next: 'rezept' }),
  knoten('rezept', [
    R('Also: Mehl, Hofhonig, eine zerdrückte Kaktusfrucht. Eine Prise Salz aus dem Tank vom Flug 404. Das ist das Wichtigste. Den Tank hab ich noch. Halb voll. Reicht für die nächsten zweihundert Jahre.'),
    R('Und dann, das eigentliche Geheimnis: Du redest mit dem Teig. Laut. Ich erzähl ihm immer, wie die Landung war. Er wird jedes Mal fluffiger. Der Teig mag Drama.'),
    ich('Du erzählst deinem Teig vom Absturz?'),
    R('Jeden Morgen. Er ist ein besserer Zuhörer als die meisten Gäste. Außer dir.', 'freude'),
  ], {
    choices: [
      { text: '„Darf ich das an Jakko weitergeben? Er sammelt Rezepte.“', when: KOCHBUCH, next: 'jakko' },
      { text: '„Ich nehm das Geheimnis mit ins Grab.“', next: 'ende' },
    ],
  }),
  knoten('jakko', [
    R('Für ein Kind? Klar. Aber nur die Hälfte. Die andere Hälfte muss er sich verdienen. Mit Pfannkuchen, die er mir selbst bringt.'),
    erz('Er schreibt das Rezept auf einen Bestellzettel. Unten, sehr klein: „Mit dem Teig reden. Ehrlich jetzt.“'),
  ], { next: 'ende', effects: [{ give: 'rezeptzettel-rudi' }] }),
  knoten('ende', [
    R('Ab heute bist du kein Gast mehr. Du bist Crew. Das heißt: Du kriegst Kaffee umsonst. Und du spülst, wenn’s voll ist.', 'freude'),
  ], { effects: [herz(ID, 50), { xp: 60 }, flag('rudi_rezept'), { rep: 'aussiedler', delta: 5 }] }),
]);

/** Abschluss nach dem Koch-Minispiel in he-rudi-4 (startet über `{ dialogue }` im win/lose). */
const he4Rezept = dialog('he-rudi-4-rezept', [
  knoten('start', [erz('Der Pfannkuchen ist rund, golden und nur ein bisschen angekokelt. Rudi hält ihn ins Licht wie einen Edelstein.')], { next: 'rezept' }),
  ...he4.nodes.filter((n) => ['rezept', 'jakko', 'ende'].includes(n.id)),
]);

const rudi = weltfigur({
  id: ID,
  name: 'Rudi',
  unknownName: 'Wirt mit Pilotenmütze',
  faction: 'aussiedler',
  bio: 'Ex-Pilot von Linienflug 404, der 2061 in der Ödnis notlanden musste. Aus dem Rumpf wurde Rudis Diner. Pfannkuchen so groß wie Radkappen, Kaffee wie Diesel, Herz wie ein Bordküchenwagen.',
  gifts: geschenke({
    loves: ['kaktusfrucht', 'vinyl-platte', 'zeitung-papier'],
    likes: ['frisches-gemuese', 'postkarte-meer', 'synth-kaffee', 'hofhonig', 'kassenbuch'],
    dislikes: ['synth-nudeln', 'algen-chips'],
    hates: ['kanalschlamm', 'plastikpflanze'],
  }),
  schedule: [
    ort('M', 'rudis-diner', 'tresen'),
    ort('T', 'rudis-diner', 'kueche'),
    ort('A', 'rudis-diner', 'tresen'),
    weg('N'),
  ],
  heartEvents: [
    { id: 'he-rudi-2', hearts: 2, map: 'rudis-diner', time: 'morgen', dialogue: 'he-rudi-2' },
    { id: 'he-rudi-4', hearts: 4, map: 'rudis-diner', time: 'tag', when: { seen: 'he-rudi-2' }, dialogue: 'he-rudi-4' },
  ],
  talk: [
    rede('rudi-tag-rivale', { rival: ID }),
    rede('rudi-tag-erstes', nichtGetroffen(ID)),
    rede('rudi-tag-epilog', { flag: 'epilog' }),
    rede('rudi-tag-verhandlung', FRIEDEN_LAEUFT),
    rede('rudi-tag-frieden', FRIEDEN),
    rede('rudi-tag-freund', { hearts: ID, min: 4 }),
    rede('rudi-tag-morgen', { time: 'morgen' }),
    rede('rudi-tag-kueche', { time: 'tag' }),
    rede('rudi-tag-abend', { time: 'abend' }),
    rede('rudi-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: rudi },
  dialogues: sammle(
    T.rivale, T.erstes, T.morgen, T.kueche, T.abend, T.frieden, T.verhandlung, T.freund, T.epilog, T.standard,
    he2, he4, he4Rezept,
  ),
};
