// side-captain-kuschel · „Wo ist Captain Kuschel?“ (world.md §6.3 Nr. 36). Dante · ganze Stadt · nach main-2-countdown.
// Ersetzt den Platzhalter aus parts/integration/luecken.ts (gleiche Quest-ID).
// Ablauf: Dante vermisst Captain Kuschel (nach main-2-bruch entweder im Quantum-Labor liegen geblieben oder mit Nyra
// drin) → Steckbriefe am Schrottmarkt → drei falsche Hinweise (Stadt-TV, Pendlerbank, Container-Labyrinth) → der richtige
// kommt per Telefon von Daria (nach zwei falschen Hinweisen oder am nächsten Morgen) → Wachmann Pfeffer hat den Hasen
// aus dem Quantum-Fundbüro für seine Tochter Mila (8) mitgenommen → eine Lösung, die alle glücklich macht.
// Lösungen (kein Kampf): gc-95 [Ausstrahlung 5] geteiltes Sorgerecht (sonntags bei Mila) · Oma Volt näht „Captain
// Kuschel II“ (nadel-und-faden oder 60 Cr) · [Jakko ♥5] Eins!-Einladung der Kinder · heimlich einstecken.
// Flags: kuschel_bei_mila (während der Quest), kuschel_sorgerecht, kuschel_zwei, kuschel_zurueck, mila_freundin_kinder;
// nyra_hat_kuschel wird beim Start gelöscht (kuschel_war_bei_nyra merkt es), weil der Hase danach in der Tasche steckt.
// Belohnung: 200 XP, Dante ♥ +150, captain-kuschel.
import type { ContentPart } from '../../part';
import type { Condition, DialogueDef, QuestDef } from '../../../modules/contracts';
import {
  active, all, any, atLeast, byId, ch, COUNTDOWN, dlg, flag, hearts, herz, inactive, item, l, msg, n, noFlag, node, p,
  phone, set, zeit,
} from './_lib';

const Q = 'side-captain-kuschel';
const D = 'dante';
const MI = 'mila';
const OMA = 'oma-volt';
const DA = 'daria';

const FALSCH = ['ck_falsch_tv', 'ck_falsch_bank', 'ck_falsch_container'] as const;
const ZWEI_FALSCH: Condition = atLeast(2, FALSCH.map(flag));
const GELOEST: Condition = flag('ck_geloest');

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: 'Wo ist Captain Kuschel?',
  summary: 'Captain Kuschel ist weg. Dante hat seit zwei Tagen keine Kekse gebacken. Das ist ein Notfall.',
  giver: D,
  act: 2,
  steps: [
    {
      id: 'steckbrief', text: 'Hänge Dantes Steckbriefe am Schrottmarkt auf. „Hase gesucht. Sehr guter Zuhörer. Große Ohren.“',
      done: flag('ck_steckbrief'), marker: { map: 'schrottmarkt', at: 'marktplatz-mitte' },
    },
    {
      id: 'tv', optional: true, text: 'Hinweis: „Hase im Stadt-TV gesehen!“ (Neon-Gasse)',
      when: flag('ck_steckbrief'), done: any(flag('ck_falsch_tv'), flag('ck_richtiger_hinweis')), marker: { map: 'neon-gasse', at: 'stadt-tv' },
    },
    {
      id: 'bank', optional: true, text: 'Hinweis: „Ein Pendler kuschelt jeden Morgen mit einem Hasen!“ (Bahnhof Mitte)',
      when: flag('ck_steckbrief'), done: any(flag('ck_falsch_bank'), flag('ck_richtiger_hinweis')), marker: { map: 'bahnhof-mitte', at: 'pendlerbank' },
    },
    {
      id: 'container', optional: true, text: 'Hinweis: „Die Rostzähne haben einen Hasen im Container!“ (Hafenkante)',
      when: flag('ck_steckbrief'), done: any(flag('ck_falsch_container'), flag('ck_richtiger_hinweis')), marker: { map: 'hafenkante', at: 'container-labyrinth' },
    },
    {
      id: 'hinweis', text: 'Warte auf den richtigen Hinweis. Irgendwer in dieser Stadt muss den Hasen doch gesehen haben.',
      when: flag('ck_steckbrief'), done: flag('ck_richtiger_hinweis'),
    },
    {
      id: 'mila', text: 'Mila, die Tochter von Wachmann Pfeffer, hat einen neuen Hasen. Tagsüber an ihrer Ecke am Schrottmarkt.',
      when: flag('ck_richtiger_hinweis'), done: GELOEST, marker: { map: 'schrottmarkt', at: 'mila-ecke' },
    },
    {
      id: 'oma', optional: true, text: 'Oma Volt fragen, ob sie Mila einen eigenen Captain Kuschel näht.',
      when: all(flag('ck_oma_frage'), { not: GELOEST }), done: any(flag('ck_kuschel_zwei_fertig'), GELOEST), marker: { map: 'neon-gasse', at: 'kiosk' },
    },
    {
      id: 'dante', text: 'Bring Dante die gute Nachricht in die Werkstatt.',
      when: GELOEST, done: flag('ck_abschluss'), marker: { map: 'dantes-werkstatt', at: 'kuschel-regal' },
    },
  ],
  reward: { xp: 200, items: { 'captain-kuschel': 1 }, relations: { [D]: 150 } },
};

// ---------------------------------------------------------------------------------------------- Dante: Auftakt

const auftakt: DialogueDef = dlg('ck-dante-start', [
  node('start', [
    n('Dante steht vor dem Regal, in dem sonst das runde Kissen liegt. Das Kissen liegt da. Sonst nichts. Er hält eine Schale Schrauben in der Hand, sortiert nach Geschmack, und weiß offensichtlich nicht, wem er sie geben soll.'),
    l(D, 'Er ist weg. Captain Kuschel. Weg.', 'trauer'),
  ], {
    choices: [
      ch('Weiter.', 'nyra', { when: flag('nyra_hat_kuschel') }),
      ch('Weiter.', 'labor', { when: noFlag('nyra_hat_kuschel') }),
    ],
  }),
  node('nyra', [
    l(D, 'Er war bei Nyra. Das war gut so. Er passt auf. Das ist sein Job.', 'besorgt'),
    l(D, 'Pixel hat in die Quantum-Kameras geguckt. Nyra ist da. Nyra arbeitet. Aber ihr Spind ist leer. Die haben ihr alles abgenommen. Alles. Auch ihn.', 'wut'),
  ], { effects: [set('kuschel_war_bei_nyra'), set('nyra_hat_kuschel', false)], next: 'auftrag' }),
  node('labor', [
    l(D, 'Er ist im Labor liegen geblieben. In der Nacht. Im roten Licht. Und keiner hatte Zeit, ihn aufzuheben. Ich auch nicht. ICH auch nicht.', 'trauer'),
    l(D, 'Pixel hat in die Quantum-Kameras geguckt. Da liegt er nicht mehr. Irgendwer hat ihn mitgenommen.', 'besorgt'),
  ], { next: 'auftrag' }),
  node('auftrag', [
    l(D, 'Ich hab Steckbriefe gemacht. Zwanzig Stück. Mit Foto. Das Foto ist von 2069, da hatte er noch beide Ohren gerade. Er hat sich nicht verändert. Er verändert sich nie. Das ist das Schöne an ihm.', 'besorgt'),
    l(D, 'Häng die am Schrottmarkt auf. Da kommen alle vorbei. Und dann warten wir. Ich kann warten. Ich hab neun Jahre gewartet. Ich kann das.', 'trauer'),
  ], {
    choices: [
      ch('„Ich find ihn, Dante.“', 'zusage'),
      ch('„Ist doch nur ein Stofftier.“', 'stofftier'),
    ],
  }),
  node('stofftier', [
    l(D, 'Sag das nochmal, und ich bau dir einen Toaster in den Arm. Einen, der nur verbrennt.', 'wut'),
    l(D, '… Entschuldigung. Nein. Doch. Häng die Steckbriefe auf.'),
  ], { next: 'zusage' }),
  node('zusage', [
    l(D, 'Danke. Hier. Und wenn du ihn findest: Sag ihm, ich hab nicht gebacken. Er weiß dann, dass es ernst ist.', 'zaertlich'),
  ], { effects: [{ startQuest: Q }, set('kuschel_bei_mila'), msg('Erhalten: 20 Steckbriefe „Hase gesucht“')] }),
]);

// ---------------------------------------------------------------------------------------------- Steckbriefe

const steckbrief: DialogueDef = dlg('ck-steckbrief', [
  node('start', [
    n('Die Litfaßsäule am Marktplatz ist zugekleistert mit „Chrome 10: Jetzt noch zufriedener!“. Du klebst Dantes Steckbriefe drüber. Zwanzig Stück. Ein Hase mit großen Ohren und einem Blick, der sagt: Ich weiß, was du letzten Sommer getan hast.'),
    n('„HASE GESUCHT. Name: Captain Kuschel. Sehr guter Zuhörer. Große Ohren. Ein Ohr leicht geknickt (das ist Absicht). Belohnung: Kekse. Viele. – Dante, Lötgassen.“'),
    l('frau-klingel', 'Hase? Hab ich gesehen! Bestimmt. Irgendwo. Ich seh viele Hasen. Ich bin alt.'),
  ], { effects: [set('ck_steckbrief'), msg('Die Steckbriefe hängen. Jetzt kommen die Hinweise. Viele davon falsch.')] }),
]);

// ---------------------------------------------------------------------------------------------- Falsche Hinweise

const tv: DialogueDef = dlg('ck-falsch-tv', [
  node('start', [
    n('Das Stadt-TV über der Neon-Gasse. Ein Werbespot läuft in Schleife: Ein riesiger Plüschhase im Chrome-Anzug hüpft durch ein Wohnzimmer. „HOPPI 10 – DER CHIP, DER MITKUSCHELT!“'),
    n('Der Hase hat keine Ohren, sondern Antennen. Und er grinst wie ein Versicherungsvertreter.'),
    p('Nein. Das ist nicht er. Captain Kuschel würde sich nie verkaufen. Er hat Prinzipien. Und keine Mundwinkel.'),
  ], { effects: [set('ck_falsch_tv')] }),
]);

const bank: DialogueDef = dlg('ck-falsch-bank', [
  node('start', [
    n('Auf der Pendlerbank schläft ein Mann im Anzug, den Kopf an der Wand. In seinen Armen etwas Graues mit großen Ohren. Es atmet.'),
    n('Es ist ein Hund. Ein sehr alter, sehr müder Hund mit Ohren wie Satellitenschüsseln, der dich ansieht, als wäre es dein Problem, dass er kein Hase ist.'),
    l('narrator', 'Der Mann murmelt im Schlaf: „Noch fünf Minuten, Herr Lampe …“'),
  ], { effects: [set('ck_falsch_bank')] }),
]);

const container: DialogueDef = dlg('ck-falsch-container', [
  node('start', [
    n('Im Container-Labyrinth, hinter dem dritten Rostcontainer links: ein Rostzahn auf einem Ölfass. Er trägt eine Mütze mit Hasenohren, gestrickt, rosa, und hält eine Thermoskanne.'),
    l('narrator', 'Rostzahn: „Was? WAS? Die Mütze hat meine Oma gemacht. Ist warm. Sag noch ein Wort, und ich zeig dir, wie warm meine Faust ist.“'),
  ], {
    effects: [set('ck_falsch_container')],
    choices: [
      ch('„Schicke Mütze.“', 'mutze'),
      ch('Wortlos weitergehen.'),
    ],
  }),
  node('mutze', [
    l('narrator', 'Rostzahn: „… Danke. Echt? Die anderen lachen immer.“ Er sieht auf seine Thermoskanne. „Willst du Tee?“'),
  ]),
]);

// ---------------------------------------------------------------------------------------------- Mila

const mila: DialogueDef = dlg('ck-mila', [
  node('start', [
    n('Milas Ecke am Schrottmarkt. Kreidebilder auf dem Pflaster: ein Haus, eine Sonne mit Sonnenbrille, ein großer Mann mit Schnurrbart. Und ein Hase. Einer mit sehr großen Ohren, eines davon leicht geknickt.'),
    n('Mila sitzt mittendrin. Auf ihrem Schoß, die Ohren in den Wind gedreht: Captain Kuschel. Er sieht zufrieden aus. Er sieht immer zufrieden aus, aber heute irgendwie mehr.'),
    l(MI, 'Das ist Herr Ohr. Papa hat ihn mir mitgebracht. Von der Arbeit. Aus dem Fundbüro. Da hat ihn keiner abgeholt. Drei Wochen lang. Papa sagt, nach drei Wochen darf man.', 'freude'),
    l(MI, 'Er hört sehr gut zu. Ich erzähl ihm alles. Auch die Sachen, die ich Papa nicht erzähl. Weil Papa dann traurig wird. Weil er so viel arbeitet.'),
  ], {
    choices: [
      ch('„Mila. Der Hase heißt eigentlich Captain Kuschel. Und er gehört Dante.“', 'wahrheit'),
      ch('Heimlich einstecken, wenn sie zum Malen wegguckt.', 'heimlich'),
    ],
  }),
  node('wahrheit', [
    n('Mila hält den Hasen fester. Sehr viel fester. Captain Kuschels Ohren gehen erst nach oben, dann eines nach unten. Skeptisch.'),
    l(MI, 'Aber … er war im Fundbüro. Keiner hat ihn abgeholt.', 'trauer'),
    p('Weil Dante nicht wusste, wo er ist. Er hat seit zwei Tagen keine Kekse gebacken.'),
    l(MI, 'Oh. Das ist schlimm. Dante macht die besten Kekse. Die harten. Die kann man auch als Bauklötze nehmen.', 'besorgt'),
  ], { next: 'loesung' }),
  node('loesung', [
    l(MI, 'Aber ich will ihn nicht hergeben. Er ist der Einzige, der mir zuhört, wenn Papa Nachtschicht hat.', 'trauer'),
  ], {
    choices: [
      ch('„Wie wär’s: Sonntags wohnt Captain Kuschel bei dir. Die anderen Tage bei Dante. Und du darfst ihn besuchen, wann du willst.“', 'sorgerecht', { check: 'gc-95' }),
      ch('„Was, wenn du einen eigenen kriegst? Oma Volt kann nähen wie ein Weltmeister.“', 'oma-frage', { when: noFlag('ck_kuschel_zwei_fertig') }),
      ch('Den frisch genähten Captain Kuschel II überreichen.', 'zwei', { when: flag('ck_kuschel_zwei_fertig') }),
      ch('„Jakko und die anderen spielen donnerstags Eins! bei Dante. Die wollen, dass du mitspielst. Dann sind Herr Ohr und du jede Woche da.“', 'eins', { tag: '[Jakko ♥5]', requires: hearts('jakko', 5) }),
      ch('„Ich überleg mir was.“'),
    ],
  }),
  node('sorgerecht', [
    l(MI, 'Sonntags? Jeden Sonntag? Auch wenn es regnet?', 'ueberrascht'),
    p('Besonders, wenn es regnet. Da braucht man einen guten Zuhörer.'),
    n('Mila sieht den Hasen an. Der Hase sieht Mila an. Ein Ohr geht nach oben. Ja.'),
    l(MI, 'Okay. Aber Dante muss mir sagen, was er gern isst. Herr Ohr. Nicht Dante. Dante isst Kekse, das weiß ich schon.', 'freude'),
  ], { effects: [set('kuschel_sorgerecht'), set('ck_geloest'), set('ck_weg_froh'), herz(MI, 80)] }),
  node('oma-frage', [
    l(MI, 'Einen eigenen? Einen, den keiner abholt?', 'ueberrascht'),
    l(MI, 'Einen Piraten! Mit Augenklappe! Und einem Schwert aus Stoff, damit er keinem wehtut!', 'freude'),
  ], { effects: [set('ck_oma_frage'), msg('Oma Volt am Kiosk fragen, ob sie einen Piraten-Hasen näht.')] }),
  node('zwei', [
    n('Du holst ihn aus der Tasche: ein Hase aus Flicken in fünf Farben, mit Augenklappe, Dreispitz und einem Säbel aus Filz. Ein Ohr steht hoch, eines ist umgeschlagen und mit einem Knopf festgenäht. Oma Volts Handschrift auf dem Etikett: „CAPTAIN KUSCHEL II – DER SCHRECKEN DER SIEBEN KANÄLE“.'),
    l(MI, 'EIN PIRAT!', 'freude'),
    n('Sie setzt ihn neben Captain Kuschel aufs Pflaster. Die beiden sehen sich an. Captain Kuschel stellt beide Ohren auf. Respekt, unter Kapitänen.'),
    l(MI, 'Dann ist Herr Ohr … Captain Kuschel … jetzt wieder bei Dante. Und meiner heißt Captain Kuschel der Zweite. Und die beiden sind Freunde. Und ich besuch ihn.', 'freude'),
  ], { effects: [set('kuschel_zwei'), set('ck_geloest'), set('ck_weg_froh'), herz(MI, 80)] }),
  node('eins', [
    l(MI, 'Eins!? Mit Jakko? Und Freya? Freya lässt mich nie mitspielen. Freya sagt, ich bin zu klein für Eins!.', 'besorgt'),
    p('Freya hat gesagt, du darfst. Wenn du die Kreide mitbringst.'),
    l(MI, 'Ich HAB Kreide! Ich hab IMMER Kreide!', 'freude'),
    l(MI, 'Dann nehm ich Captain Kuschel jetzt mit zu Dante. Und dann ist er ja trotzdem bei mir. Jeden Donnerstag. Das ist fast wie meiner.'),
  ], { effects: [set('ck_eins_einladung'), set('ck_geloest'), set('ck_weg_froh'), herz(MI, 80), herz('jakko', 20)] }),
  node('heimlich', [
    n('Mila dreht sich um, um ein Ohr nachzumalen. Du greifst zu. Captain Kuschel lässt beide Ohren hängen, ganz schlaff, und du weißt nicht, ob das Hilfe ist oder ein Vorwurf.'),
    n('Hinter dir malt Mila weiter und erzählt dem leeren Pflaster, was heute Lustiges passiert ist. Sie hat es noch nicht gemerkt.'),
  ], { effects: [set('ck_heimlich'), set('ck_geloest')] }),
]);

// ---------------------------------------------------------------------------------------------- Oma Volt näht

const oma: DialogueDef = dlg('ck-oma-naehen', [
  node('start', [
    l(OMA, 'Einen Hasen nähen? Für die Kleine vom Pfeffer? Kindchen, ich hab im Krieg Fallschirme genäht. Aus Fallschirmen. Ein Hase ist für mich Frühstück.', 'signatur'),
    l(OMA, 'Aber ich brauch Material. Nadel, Faden, Stoff. Oder Geld für Nadel, Faden, Stoff. Ich bin eine alte Frau, keine Wohlfahrt.'),
  ], {
    choices: [
      ch('Nadel und Faden auf den Tresen legen.', 'naehen', { requires: item('nadel-und-faden'), effects: [{ take: 'nadel-und-faden' }] }),
      ch('60 Credits hinlegen.', 'naehen', { effects: [{ credits: -60 }] }),
      ch('„Ich bring dir was.“'),
    ],
  }),
  node('naehen', [
    n('Oma Volt zieht einen Karton unter dem Tresen hervor. Flicken, Knöpfe, Reste von Jacken, die irgendwann mal Paul gehört haben. Sie fädelt ein, ohne hinzusehen. Eine Stunde. Dabei flucht sie leise und sehr kreativ.'),
    l(OMA, 'Augenklappe, Dreispitz, Säbel aus Filz. Und ein eingenähtes Namensschild, falls er verloren geht. Bei Verlust bitte bei Oma Volt abgeben.', 'freude'),
  ], { effects: [{ advanceTime: 60 }, set('ck_kuschel_zwei_fertig'), msg('Erhalten: Captain Kuschel II (für Mila)')] }),
]);

// ---------------------------------------------------------------------------------------------- Dante: Abschluss

const abschluss: DialogueDef = dlg('ck-dante-ende', [
  node('start', [
    n('Du setzt Captain Kuschel auf das runde Kissen im Regal. Er sinkt in seine alte Kuhle, als wäre er nie weg gewesen. Ein Ohr hoch, eines geknickt.'),
    l(D, 'Da bist du ja. Da bist du ja, du alter Sack.', 'zaertlich'),
    n('Dante hebt ihn hoch und drückt die Stirn an das Plüschgesicht. Lange. Niemand sagt etwas. Der Plattenspieler läuft weiter, als wüsste er, dass jetzt keiner etwas sagen soll.'),
  ], {
    choices: [
      ch('Weiter.', 'heimlich', { when: flag('ck_heimlich') }),
      ch('Weiter.', 'froh', { when: noFlag('ck_heimlich') }),
    ],
  }),
  node('froh', [
    l(D, 'Bei Mila? Pfeffers Mila? Die mit der Kreide?', 'ueberrascht'),
    l(D, 'Na. Dann hatte er’s ja gut. Die Kleine hört auch gut zu. Das kann nicht jeder.', 'freude'),
  ], {
    // Nur bei einer Lösung, mit der alle glücklich sind, wird Mila Freundin der Kinder.
    effects: [set('mila_freundin_kinder'), msg('Mila gehört jetzt zur Bande der Kinder.')],
    choices: [
      ch('Weiter.', 'sorgerecht', { when: flag('kuschel_sorgerecht') }),
      ch('Weiter.', 'zwei', { when: flag('kuschel_zwei') }),
      ch('Weiter.', 'eins', { when: flag('ck_eins_einladung') }),
    ],
  }),
  node('sorgerecht', [
    l(D, 'Sonntags bei ihr. Gut. Dann hab ich sonntags Zeit für den Plattenspieler. Und er kommt mit Kreide an den Ohren zurück. Das gefällt ihm. Er mag Farbe.', 'freude'),
  ], { next: 'ende' }),
  node('zwei', [
    l(D, 'Einen Piraten? Oma Volt hat einen PIRATEN genäht? Ich will den sehen. Ich will den UNBEDINGT sehen.', 'freude'),
  ], { next: 'ende' }),
  node('eins', [
    l(D, 'Donnerstags noch ein Kind am Eins!-Tisch. Gut. Dann muss ich mehr backen. Ich muss sowieso mehr backen. Ich hab zwei Tage aufzuholen.', 'freude'),
  ], { next: 'ende' }),
  node('heimlich', [
    l(D, 'Wo war er?', 'neutral'),
    p('Bei einem kleinen Mädchen. Mila. Sie hat ihn „Herr Ohr“ genannt.'),
    n('Dante sieht den Hasen an. Dann dich. Lange.'),
    l(D, 'Und? Ist sie jetzt traurig?', 'besorgt'),
  ], {
    choices: [
      ch('„Ja. Ziemlich.“', 'heimlich-wahr'),
      ch('„Die merkt das gar nicht.“', 'heimlich-luege'),
    ],
  }),
  node('heimlich-wahr', [
    l(D, 'Hm. Danke, dass du’s sagst.', 'trauer'),
    l(D, 'Ich back ihr was. Und ich frag Oma Volt, ob die nähen kann. Die kann alles nähen. Die hat mal meine Hose genäht, während ich drin war.', 'besorgt'),
  ], { effects: [herz(D, -30)], next: 'ende' }),
  node('heimlich-luege', [
    n('Captain Kuschel lässt in Dantes Händen ein Ohr fallen. Langsam. Dante sieht es. Er sagt nichts. Er sagt sehr laut nichts.'),
    l(D, 'Na dann.', 'neutral'),
  ], { effects: [herz(D, -60)], next: 'ende' }),
  node('ende', [
    l(D, 'Hier. Nimm ihn mit. Nicht für immer. Nur wenn’s eng wird. Er passt auf dich auf. Ich weiß, du glaubst das nicht. Aber er hat schon auf mich aufgepasst, und ich bin viel schwieriger als du.', 'zaertlich'),
    l(D, 'Und jetzt raus. Ich muss backen.', 'signatur'),
  ], { effects: [set('kuschel_bei_mila', false), set('kuschel_zurueck'), set('ck_abschluss')] }),
]);

// ---------------------------------------------------------------------------------------------- Telefon

const phones = [
  phone('ck-dante-anruf', D, 'Komm in die Werkstatt. Es ist wegen ihm. Es ist wichtig. Ich hab nicht gebacken.', {
    auto: all(COUNTDOWN, inactive(Q), zeit('morgen', 'tag')),
  }),
  phone('ck-daria-hinweis', DA, 'HEY. Ich hab den Hasen gesehen. Den vom Steckbrief. Bei MILA. Am Schrottmarkt. Die Kleine vom Wachmann. Sie nennt ihn „Herr Ohr“. Herr OHR. Ich hab fast gekotzt vor Süß. Krieg ich die Kekse?', {
    auto: all(active(Q), flag('ck_steckbrief'), noFlag('ck_richtiger_hinweis'), any(ZWEI_FALSCH, flag('ck_tag_1'))),
    effects: [set('ck_richtiger_hinweis')],
    replies: [
      { text: '„Kriegst du. Danke, Daria.“', effects: [herz(DA, 20)] },
      { text: '„Erst wenn er wieder bei Dante ist.“' },
    ],
  }),
];

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: byId([auftakt, steckbrief, tv, bank, container, mila, oma, abschluss]),
  phone: byId(phones),
  daily: byId([
    { id: 'ck-tag-1', when: all(active(Q), flag('ck_steckbrief')), effects: [set('ck_tag_1')] },
  ]),
  mapAdditions: {
    'dantes-werkstatt': {
      hotspots: [
        {
          id: 'ck-dante-start', at: 'kuschel-regal', label: 'Dante vor dem leeren Regal', kind: 'talk', dialogue: auftakt.id,
          when: all(COUNTDOWN, inactive(Q)),
        },
        {
          id: 'ck-dante-ende', at: 'kuschel-regal', label: 'Captain Kuschel heimbringen', kind: 'talk', dialogue: abschluss.id,
          when: all(active(Q), GELOEST, noFlag('ck_abschluss')),
        },
      ],
    },
    schrottmarkt: {
      hotspots: [
        {
          id: 'ck-steckbrief', at: [810, 600], radius: 50, label: 'Litfaßsäule: Steckbriefe aufhängen', kind: 'use', dialogue: steckbrief.id,
          when: all(active(Q), noFlag('ck_steckbrief')),
        },
        {
          id: 'ck-mila', at: 'mila-ecke', label: 'Mila mit einem Hasen', kind: 'talk', dialogue: mila.id,
          when: all(active(Q), flag('ck_richtiger_hinweis'), { not: GELOEST }, zeit('tag')),
        },
      ],
    },
    'neon-gasse': {
      hotspots: [
        {
          id: 'ck-falsch-tv', at: [232, 370], radius: 50, label: 'Hase im Stadt-TV?', kind: 'look', dialogue: tv.id,
          when: all(active(Q), flag('ck_steckbrief'), noFlag('ck_falsch_tv'), noFlag('ck_richtiger_hinweis')),
        },
        {
          id: 'ck-oma-naehen', at: 'kiosk', label: 'Oma Volt: Hasen nähen?', kind: 'talk', dialogue: oma.id,
          when: all(active(Q), flag('ck_oma_frage'), noFlag('ck_kuschel_zwei_fertig'), { not: GELOEST }, zeit('morgen', 'tag', 'abend')),
        },
      ],
    },
    'bahnhof-mitte': {
      hotspots: [
        {
          id: 'ck-falsch-bank', at: 'pendlerbank', label: 'Pendler mit großen Ohren im Arm', kind: 'look', dialogue: bank.id,
          when: all(active(Q), flag('ck_steckbrief'), noFlag('ck_falsch_bank'), noFlag('ck_richtiger_hinweis'), zeit('morgen', 'tag')),
        },
      ],
    },
    hafenkante: {
      hotspots: [
        {
          id: 'ck-falsch-container', at: [330, 600], radius: 50, label: 'Hasenohren hinter dem Container', kind: 'look', dialogue: container.id,
          when: all(active(Q), flag('ck_steckbrief'), noFlag('ck_falsch_container'), noFlag('ck_richtiger_hinweis')),
        },
      ],
    },
  },
};
