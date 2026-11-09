// Dexter – Schrotthändler und Drohnenbastler auf der Halde, schuldet Hunter 1200 Credits (world.md §4.4, §11.2).
// Tagesablauf nach design/plan/act1.json (npcSchedules.dexter). Herz-Ereignisse he-dexter-2/4/6 in Akt 1,
// he-dexter-8/10 angelegt und an act2 gebunden. Kein Begleiter, keine Romanze.
// Quests nur als Verweis/Start: main-1-dexter (Hauptstrang), pers-dexter-schuldenfrei, side-chrome-10, side-drohnenrennen.
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode, NpcDef } from '../../../modules/contracts';
import {
  type Menue, AB_AKT2, NICHT_AKT2, VEX, ZEIT_HINWEIS, dialog, erz, flag, herz, ich, knoten, neu, pruefung, rede, sammle,
  sprecher, tagesgespraech,
} from './_helfer';

const D = sprecher('dexter');
const H = sprecher('hunter');
const A = sprecher('aria');

const HAUPT = 'main-1-dexter';
const HAUPT_DONE: Condition = { quest: HAUPT, state: 'done' };
const SCHULDENFREI = 'pers-dexter-schuldenfrei';
/** Mittwoch früh im Gerichtssaal, solange he-richter-4 (Ziegenroboter) offen ist. */
const ZIEGEN_PROZESS: Condition = { all: [{ hearts: 'richter', min: 4 }, neu('he-richter-4'), { weekday: 'mi' }] };

// ---------------------------------------------------------------------------------------------- Menü

function menue(): Menue {
  const zurueck: DialogueChoice[] = [{ text: 'Noch was, Dexter.', next: 'menue', id: 'zurueck' }, { text: 'Bis dann. Zahl deine Schulden.' }];

  const choices: DialogueChoice[] = [
    { text: 'Zeig mal, was du so verkaufst.', when: { all: [HAUPT_DONE, { time: ['tag', 'abend'] }] }, effects: [{ shop: 'dexters-schrott' }] },
    { text: 'Was bastelst du da eigentlich?', next: 'drohnen', once: true, id: 'd-drohnen' },
    { text: '„Ist das ein Sechsrotor mit Lötbrücke? Gewagt.“', tag: '[Schrott]', when: { origin: 'origin-schrott' }, once: true, id: 'd-schrott', next: 'schrott' },
    { text: 'Wem schuldest du eigentlich alles?', tag: '[Dexter ♥3]', requires: { hearts: 'dexter', min: 3 }, once: true, id: 'd-schulden', next: 'schulden' },
    {
      text: 'Diese Chrome-10-Gutscheine. Wo hast du die her?', next: 'chrome10',
      when: { all: [HAUPT_DONE, { quest: 'side-chrome-10', state: 'inactive' }] }, effects: [{ startQuest: 'side-chrome-10' }],
    },
    {
      text: 'Ich hab gehört, du baust Renndrohnen.', next: 'rennen',
      when: { all: [HAUPT_DONE, { quest: 'side-drohnenrennen', state: 'inactive' }] }, effects: [{ startQuest: 'side-drohnenrennen' }],
    },
    {
      text: 'Wie läuft’s mit deinen Gläubigern?', when: { quest: SCHULDENFREI, state: 'active' }, next: 'glaeubiger',
    },
    { text: 'Du und Aria. Was ist da eigentlich los?', when: HAUPT_DONE, once: true, id: 'd-aria', next: 'aria' },
    { text: 'Bis dann. Zahl deine Schulden.' },
  ];

  const nodes: DialogueNode[] = [
    knoten('menue', [D('Noch was? Ich hab Zeit! Ich hab immer Zeit! Zeit ist das Einzige, was mir keiner pfänden kann!', 'freude')], { choices }),
    knoten('drohnen', [
      D('Das hier ist Hildegard. Kameradrohne, Baujahr 2072, aus drei Staubsaugern und einem Ventilator. Sie sieht alles. Sie sagt nichts. Die perfekte Frau.', 'signatur'),
      D('Und das ist Hildegard zwei. Die kann fliegen. Hildegard eins kann nur gucken und schwebt manchmal aus Versehen.'),
      D('Wenn ich je reich werde, bau ich eine Drohne, die für mich Schulden bezahlt. Mit Geld, das sie selber findet. Auf dem Boden. Da liegt viel.'),
    ], { choices: zurueck }),
    knoten('schrott', [
      D('Gewagt? GEWAGT? Das ist Kunst! Endlich jemand, der Lötbrücken versteht!', 'ueberrascht'),
      D('Du kommst vom Platz, hm? Man sieht’s an den Fingerkuppen. Ölschwarz bis unter die Nägel. Ehrliche Hände.', 'freude'),
      D('Komm mal zum Fachsimpeln vorbei. Ich hab einen Motor, der summt in Fis-Dur. Keiner weiß warum. Ich auch nicht.'),
    ], { choices: zurueck, effects: [herz('dexter', 20)] }),
    knoten('schulden', [
      D('Alles? Puh. Hunter: zwölfhundert. Minus vierhundert. Plus Zinsen, aber die streiten wir ab.', 'besorgt'),
      D('Oma Volt: sechs Nougatbomben und ein Knopf. Gustav: ein Kran-Seil, lang. Ripper: frag nicht. Die Rostzähne: frag noch weniger. Und Babette: ein Lächeln. Das zahle ich jeden Tag ab.'),
      D('Ich zahle immer! Irgendwann! Irgendwann ist ein ganz konkreter Zeitpunkt, er hat nur noch kein Datum.', 'signatur'),
    ], { choices: zurueck }),
    knoten('chrome10', [
      D('Gutschein-Gerd! Steht am Marktplatz, hat einen Anzug und ein Zertifikat! Das Zertifikat glänzt!', 'freude'),
      D('„Chrome 10, das Upgrade zum Glück. Wertanlage, Dexter, die steigen.“ Ich hab gekauft. Achthundert. Also … alles.'),
      D('… Die steigen nicht, oder?', 'besorgt'),
      ich('Nein, Dexter.'),
      D('Kannst du … kannst du mal mit Gerd reden? Freundlich? Oder unfreundlich? Hauptsache mit Geld am Ende?'),
    ], { choices: zurueck }),
    knoten('rennen', [
      D('Renndrohnen! Rostkai-Rallye, freitags, an den Kränen! Turbo-Tilda gewinnt immer, und sie lacht dabei. Das Lachen ist das Schlimmste.', 'signatur'),
      D('Ich hab einen Rahmen. Ich hab Träume. Mir fehlt ein Motor, ein Steuerchip und jemand, der nicht beim Start in Panik den Joystick fallen lässt.'),
      D('Gustav hat Motoren. Den Chip findest du. Und du fliegst. Gewinn teilen wir. Fair. Sechzig-vierzig. Für mich. Okay, fünfzig-fünfzig. Okay, wie du willst!', 'freude'),
    ], { choices: zurueck }),
    knoten('glaeubiger', [
      D('Sechs Namen. Sechs! Ich hab sie an die Wand gepinnt und jeden Morgen gucke ich sie an. Und sie gucken zurück.', 'besorgt'),
      D('Aber weißt du was? Das erste Mal seit Jahren hab ich das Gefühl, dass irgendwann wirklich ein Datum hat.', 'freude'),
    ], { choices: zurueck }),
    knoten('aria', [
      D('Aria? Aria ist eine Naturgewalt mit Pferdeschwanz. Hunter schickt sie, wenn ich nicht zahle. Ich zahle nie. Also kommt sie oft.', 'besorgt'),
      D('Morgens versteck ich mich hinter der Waschmaschinenpyramide. Sie weiß das. Ich weiß, dass sie das weiß. Es ist ein Ritual. Wie Yoga, nur mit Baseballschläger.'),
      D('Unter uns: Sie hat mir mal Suppe gebracht, als ich krank war. Und dann den Schreibtisch zerlegt. In der Reihenfolge. Ich mag sie.', 'signatur'),
    ], { choices: zurueck }),
  ];
  return { choices, nodes };
}

const M = menue();

/** Rivalität: Er verkauft der Spielfigur Schrott als Ware; Versöhnung über Essen, Geld oder Verhandlung. */
const RIVALE: Menue = {
  choices: [
    { text: 'Ihm eine Dampfnudel von Babette hinhalten.', when: { item: 'bao-dampfnudel' }, next: 'nudel', effects: [{ take: 'bao-dampfnudel' }, { reconcile: 'dexter' }] },
    { text: 'Ihm 25 Credits leihen. Ohne Schuldschein.', requires: { credits: 25 }, next: 'leihen', effects: [{ credits: -25 }, { reconcile: 'dexter' }] },
    {
      text: '„Wir zwei sind die einzigen ehrlichen Lügner auf dem Markt. Lass uns das nicht verschwenden.“', next: 'deal',
      check: pruefung('dexter-versoehnung-deal', 'strasse', 5, ['verhandeln']), effects: [{ reconcile: 'dexter' }],
    },
    { text: 'Vergiss es.' },
  ],
  nodes: [
    knoten('nudel', [
      D('Ist die … mit Füllung?', 'ueberrascht'),
      erz('Er isst sie in zwei Bissen und mit geschlossenen Augen.'),
      D('Okay. Okay! Frieden. Ich verkauf dir nie wieder einen Toaster als Mikrowelle. Oder nur noch einen.', 'freude'),
    ]),
    knoten('leihen', [
      D('Ohne Schuldschein? Das … das hat noch nie jemand gemacht.', 'ueberrascht'),
      D('Ich zahle! Ich zahle immer! Und dir zahle ich zuerst. Das ist ein Versprechen. Ein echtes. Mit Datum. … Das Datum kommt noch.'),
    ]),
    knoten('deal', [
      D('Ehrliche Lügner. Ha!', 'freude'),
      D('Du hast recht. Ich hab dir die Drohne ohne Rotor verkauft. Du hast mir den Fünfziger mit dem aufgeklebten Hologramm gegeben. Wir sind quitt.', 'signatur'),
    ]),
  ],
};

// ---------------------------------------------------------------------------------------------- Tagesgespräche

const T = {
  rivale: tagesgespraech('dexter-tag-rivale',
    [D('Ah! Kundschaft! Für dich: Sonderangebot! Ein original Quantum-Toaster, fast ohne Rauch! Nur heute! Nur für dich! Doppelter Preis!', 'signatur')],
    [D('Was? Ich bin nicht nachtragend. Ich bin nur … preislich nachtragend.', 'neutral')],
    RIVALE),
  herkunft: tagesgespraech('dexter-tag-schrott',
    [
      D('Moment, Moment. Diese Hände. Dieser Gang. Diese Ölflecken an genau der richtigen Stelle. Du bist vom Platz!', 'ueberrascht'),
      D('Ein Kollege! Endlich! Jemand, der weiß, dass ein Kühlschrank nur ein Schrank mit Ambitionen ist!', 'freude'),
    ],
    [D('Für Leute vom Platz gibt’s bei mir den Kollegenrabatt. Der Rabatt ist, dass ich dich nicht anlüge. Meistens.', 'signatur')],
    M, { effects: [herz('dexter', 100), flag('dexter_herkunft')] }),
  versteckt: tagesgespraech('dexter-tag-versteckt',
    [
      D('Psssst! Runter! Ist sie weg? Ist Aria weg? Siehst du einen Pferdeschwanz? Einen Schläger? Einen Schatten mit Wut?', 'besorgt'),
      erz('Dexter hockt hinter einer Pyramide aus Waschmaschinen und hält sich eine Radkappe vors Gesicht.'),
    ],
    [D('Jeden Morgen um sieben kommt sie. Jeden Morgen um sieben bin ich nicht da. Wir haben ein System. Das System heißt Angst.', 'besorgt')],
    M),
  versteckAria: tagesgespraech('dexter-tag-versteck-aria',
    [
      D('AAAH! Aria! Guten Morgen! Schönes Wetter! Schöner Schläger! Ich zahle! Ich zahle immer!', 'ueberrascht'),
      A('Entspann dich, Dexter. Ich bin heute privat hier.'),
      D('Privat ist schlimmer! Privat hat keine Vorschriften!', 'besorgt'),
    ],
    [D('Sag ihr, sie soll den Schläger runternehmen. Nein, sag’s ihr nicht, dann nimmt sie ihn hoch.', 'besorgt')],
    M),
  vexaria: tagesgespraech('dexter-tag-vexaria',
    [
      D('Vex! Vex, Vex, Vex. Ich muss dir was sagen. Unter Geschäftsleuten.', 'signatur'),
      D('Seit Aria mit dir rumläuft, haut sie nur noch halb so fest zu. Gestern hat sie meine Tür nur EINGEDRÜCKT. Nicht eingetreten. Eingedrückt! Mit Gefühl!', 'freude'),
    ],
    [D('Liebe ist gut fürs Inkasso. Ich sollte ein Buch schreiben. Oder dir einen Rabatt geben. Okay, das Buch. Rabatt hab ich keinen.', 'signatur')],
    M, { effects: [flag('dexter_kommentar_vexaria')] }),
  hauptquest: tagesgespraech('dexter-tag-hauptquest',
    [D('Ich bin nicht da! Ich bin eine Aufnahme! Bitte hinterlassen Sie eine Nachricht nach dem … nach dem Gejammer!', 'besorgt')],
    [D('Hunter schickt euch, oder? Hunter schickt immer jemanden. Ich hab doch vierhundert gezahlt! Vierhundert ist ein Drittel! Das ist fast die Hälfte!', 'besorgt')],
    M),
  zeit: tagesgespraech('dexter-tag-zeit',
    [
      D('Ich hab was vor. Was Großes. Es hat mit Hunter zu tun. Und mit Geld. Echtem. Nicht in Gutscheinform.', 'signatur'),
      erz(ZEIT_HINWEIS),
    ],
    [D('Wenn das klappt, kauf ich mir einen Anzug. Einen, bei dem die Ärmel dranbleiben. Und dann zahle ich. Alles. Auf einmal. Mit Trommelwirbel.', 'freude')],
    M),
  chrome10: tagesgespraech('dexter-tag-chrome10',
    [D('Hast du Gerd gesehen? Hat er gezahlt? Hat er geweint? Ich will, dass er weint. Ein bisschen. Dann kriegt er ein Taschentuch. Gebraucht.', 'besorgt')],
    [D('Ich hab die Gutscheine unter meiner Matratze. Achthundert Credits Papier. Ich schlaf drauf wie ein König. Ein sehr armer König.')],
    M),
  rennen: tagesgespraech('dexter-tag-rennen',
    [D('Freitag! Kräne! Tilda! Wir zerlegen sie! Also, nicht sie. Ihre Drohne. Rechtlich ist das ein Unterschied.', 'freude')],
    [D('Hildegard drei ist fast fertig. Sie hat einen Turbo, ein Herz aus Kupfer und Angst vor Möwen. Wie ich.', 'signatur')],
    M),
  hv: tagesgespraech('dexter-tag-hv',
    [D('Im High Voltage! Ich! Als Gast! Hunter hat mir einen Tisch gegeben. Ganz hinten. Neben dem Klo. Aber MEINEN!', 'freude')],
    [D('Ich trinke Leitungswasser mit Strohhalm. Der Strohhalm kostet extra. Ich hab angeschrieben. Hunter hat gelächelt. Das war das Unheimlichste, was ich je gesehen hab.', 'besorgt')],
    M),
  nacht: tagesgespraech('dexter-tag-nacht',
    [
      erz('Dexter liegt auf einer Couch aus Autositzen, eine Decke aus Werbebannern bis zum Kinn. Hildegard schwebt summend über ihm wie ein Nachtlicht.'),
      D('Zzz … ich zahle … irgendwann … Hildegard … nicht die Mahnung … zzz …', 'neutral'),
    ],
    [D('Wer? Was? Ist es sieben? Ist es Aria? … Ach, du. Gute Nacht. Mach die Tür zu. Die Tür ist ein Vorhang. Mach den Vorhang zu.', 'ueberrascht')],
    M, { plauschText: 'Ihn sanft anstupsen.' }),
  vertraut: tagesgespraech('dexter-tag-vertraut',
    [D('{name}! Mein Lieblingsmensch! Du bist der einzige, dem ich nichts schulde! … Oder? Schulde ich dir was? Sag nein.', 'freude')],
    [D('Weißt du, was das Schönste an dir ist? Du guckst mich an, als wäre ich nicht nur Schulden. Als wäre ich Schulden mit Persönlichkeit.', 'signatur')],
    M),
  buero: tagesgespraech('dexter-tag-buero',
    [D('Willkommen in Dexters Imperium! Achtung, die Stufe. Die Stufe ist ein Kühlschrank. Der Kühlschrank ist auch das Lager.', 'signatur')],
    [
      D('Heute im Angebot: eine Drohne ohne Propeller – ideal für Bodenaufnahmen. Ein Navi, das nur nach links abbiegt. Und ein Sofa, das ein Auto war.'),
      D('Alles original. Alles mit Geschichte. Die meisten Geschichten sind Lügen, aber gute Lügen!', 'freude'),
    ],
    M),
  standard: tagesgespraech('dexter-tag-standard',
    [D('Ich zahle immer! Irgendwann! … Ach, du willst gar kein Geld? Gott sei Dank. Hallo!', 'ueberrascht')],
    [D('Weißt du, was das Problem mit Geld ist? Es ist immer bei den anderen. Ich hab’s mal gesehen. Kurz. Es sah glücklich aus.', 'neutral')],
    M),
};

// ---------------------------------------------------------------------------------------------- Herz-Ereignisse

const he2 = dialog('he-dexter-2', [
  knoten('start', [
    erz('Das Wellblechbüro auf der Halde. Dexter sitzt hinter einem Schreibtisch, der früher eine Tür war, und strahlt dich an wie eine Bank, die zum ersten Mal Zinsen zahlt.'),
    D('{name}! Komm rein! Ich hab heute was vor. Was Historisches. Ich werde … ein Gläubiger!', 'freude'),
    erz('Er legt mit großer Geste eine Zehn-Credit-Münze auf den Tisch. Poliert. Mit Schleifchen.'),
    D('Ich leihe dir zehn Credits. Einfach so. Weil ich kann! Weil ich es MAL kann! Ein Schuldschein ist nicht nötig. Okay, ein kleiner. Nur für mein Gefühl.', 'signatur'),
  ], {
    choices: [
      { text: 'Die Münze nehmen. „Danke, Herr Bankdirektor.“', next: 'genommen', effects: [{ credits: 10 }, herz('dexter', 20)] },
      { text: '„Behalt sie, Dexter. Du brauchst sie mehr.“', next: 'abgelehnt', effects: [herz('dexter', 10)] },
    ],
  }),
  knoten('genommen', [
    D('Bankdirektor. BANKDIREKTOR. Ich lass mir eine Visitenkarte drucken.', 'freude'),
  ], { next: 'mahnung' }),
  knoten('abgelehnt', [
    D('Ich brauche sie mehr? Ich? Pff. Ich bin flüssig! Ich bin quasi ein Fluss! … Nimm sie. Bitte. Es ist wichtig für mich.', 'besorgt'),
    erz('Er drückt dir die Münze in die Hand und schließt deine Finger darum. Seine Hände zittern ein bisschen.'),
  ], { next: 'mahnung', effects: [{ credits: 10 }] }),
  knoten('mahnung', [
    erz('Da surrt Hildegard durchs Fenster. Im Greifarm: ein Zettel. Dexter liest. Er wird blass. Dann noch blasser. Dann grün.'),
    D('Gustav. Das Kran-Seil. Zehn Credits Mahngebühr. Bis heute Abend. Sonst … sonst baut er Knurri einen zweiten Kiefer.', 'besorgt'),
    D('Sag mal … rein theoretisch … könntest du mir zehn Credits leihen?'),
  ], {
    choices: [
      { text: 'Ihm seine eigenen zehn Credits zurückgeben.', requires: { credits: 10 }, next: 'zurueck', effects: [{ credits: -10 }, herz('dexter', 30)] },
      {
        text: 'Die Mahnung genauer ansehen. Gustav schreibt nie „Mahngebühr“.', next: 'faelschung', tag: '[Straße 4]',
        check: pruefung('he-dexter-2-mahnung', 'strasse', 4, ['spuren', 'faelschung']), effects: [herz('dexter', 40)],
      },
      {
        text: 'Hildegards Drucker reparieren. Der druckt doch nur Mist.', next: 'drucker',
        check: pruefung('he-dexter-2-drucker', 'technik', 4, ['reparieren']), effects: [herz('dexter', 40)],
      },
      { text: '„Geschenkt ist geschenkt, Dexter.“', next: 'geschenkt', effects: [herz('dexter', -10)] },
    ],
  }),
  knoten('zurueck', [
    D('Danke! Danke! Ich zahle dir das zurück! Sofort! Jetzt! Mit Zinsen!', 'freude'),
    erz('Er wühlt in einer Kiste und hält dir eine VHS-Kassette hin. Aufschrift: „HOCHZEIT 2049 – NICHT ÜBERSPIELEN“. Jemand hat es überspielt.'),
    D('Eine Antiquität! Mehr wert als zehn Credits! Viel mehr! Wahrscheinlich! Ich bin jetzt offiziell schuldenfrei. Bei dir. Das ist ein Anfang!', 'signatur'),
  ], { next: 'ende', effects: [{ give: 'vhs-kassette' }] }),
  knoten('faelschung', [
    ich('Gustav schreibt mit Bleistift. Das hier ist gedruckt. Und „Mahngebühr“ ist falsch geschrieben. Mit H vorne.'),
    D('„Hmahngebühr“. Das … das sind die Rostzähne! Die drucken Mahnungen und hängen sie an Leute, die Angst haben! Also an mich!', 'ueberrascht'),
    D('Du hast mich gerettet! Hier! Deine Belohnung! Eine Antiquität!', 'freude'),
    erz('Eine VHS-Kassette. „HOCHZEIT 2049 – NICHT ÜBERSPIELEN“. Jemand hat es überspielt.'),
  ], { next: 'ende', effects: [{ give: 'vhs-kassette' }, flag('dexter_mahnung_falsch')] }),
  knoten('drucker', [
    erz('Du klappst Hildegards Bauch auf. Ein winziger Thermodrucker, der seit Wochen jede Nachricht mit „MAHNUNG“ überschreibt, weil ein Kontakt verbogen ist. Ein Fingertipp, und Hildegard druckt die Nachricht neu.'),
    erz('„Lieber Dexter, das Seil eilt nicht. Komm mal auf ein Radio vorbei. – Gustav“'),
    D('Er … er lädt mich ein. Zum Radio. Mich!', 'ueberrascht'),
    D('Hier. Du hast meine Drohne geheilt. Das ist unbezahlbar. Also bezahl ich mit was Unbezahlbarem.', 'freude'),
    erz('Eine VHS-Kassette. „HOCHZEIT 2049 – NICHT ÜBERSPIELEN“. Jemand hat es überspielt.'),
  ], { next: 'ende', effects: [{ give: 'vhs-kassette' }, herz('opa-gustav', 10)] }),
  knoten('geschenkt', [
    D('Geschenkt ist … ja. Ja, natürlich. Hab ich ja selbst gesagt.', 'besorgt'),
    D('Ich hab sowieso noch was. Irgendwo. Unter einer Platte. Oder in einer Platte. Ich krieg das hin. Ich krieg das immer hin. Irgendwann.'),
    erz('Beim Rausgehen siehst du, wie er seine Waschmaschinenpyramide nach Kleingeld abklopft.'),
  ], { next: 'ende' }),
  knoten('ende', [
    D('Weißt du was? Das war der beste Tag meiner Finanzkarriere. Ich war zehn Minuten lang ein Gläubiger. Es fühlte sich an wie Fliegen.', 'freude'),
  ], { effects: [{ xp: 40 }, herz('dexter', 20), flag('dexter_glaeubiger_fuer_10_minuten')] }),
]);

const he4 = dialog('he-dexter-4', [
  knoten('start', [
    erz('Mitten auf dem Marktplatz hat Dexter einen Klapptisch aufgebaut, mit Samtdecke und Schreibtischlampe. Darauf: ein grauer, poröser Brocken unter einer umgedrehten Salatschüssel. Ein Schild: „ECHTES MONDGESTEIN – 1x VORHANDEN“.'),
    D('Psst! {name}! Komm her! Ich brauch einen Partner! Da hinten steht ein Tourist aus der Oberstadt. Seidenschal. Sonnenbrille. Guckt sich „echte Unterstadt“ an. Der hat Geld, das ihn langweilt!', 'signatur'),
    ich('Dexter. Das ist Schlacke vom Hochofen.'),
    D('Es ist Schlacke vom MOND-Hochofen! Das ist praktisch dasselbe! Komm schon. Fünfzig-fünfzig.', 'freude'),
    erz('Der Tourist schlendert näher, die Hände auf dem Rücken, und beäugt die Salatschüssel.'),
  ], {
    choices: [
      {
        text: 'Die große Show: Mondlandung, Schmuggel, letztes Stück der Welt.', next: 'show',
        check: pruefung('he-dexter-4-show', 'ausstrahlung', 5, ['verkaufen', 'luegen']), effects: [{ credits: 75 }, herz('dexter', 40)],
      },
      {
        text: 'Marktschreierin anheuern, Echtheitszertifikat improvisieren, Gedränge machen.', next: 'gedraenge',
        check: pruefung('he-dexter-4-gedraenge', 'strasse', 5, ['geruecht', 'verkaufen']), effects: [{ credits: 75 }, herz('dexter', 40), { rep: 'unterstadt', delta: 2 }],
      },
      { text: '„Mondgestein, sagt man in der Oberstadt nicht mehr. Man sagt ‚Regolith-Statement‘.“', tag: '[Oberstadt]', when: { origin: 'origin-oberstadt' }, next: 'oberstadt', effects: [{ credits: 100 }, herz('dexter', 40)] },
      { text: 'Ehrlich sein: „Das ist Schlacke. Aber echte Unterstadt-Schlacke.“', next: 'ehrlich', effects: [{ credits: 15 }, herz('dexter', 30)] },
      { text: 'Den Touristen warnen und gehen.', next: 'warnen', effects: [herz('dexter', -20), { rep: 'unterstadt', delta: -1 }] },
    ],
  }),
  knoten('show', [
    ich('Apollo 19. Nie offiziell. Ein Astronaut, ein Sack, ein Rückflug. Seine Enkelin hat den Stein in der Unterstadt versetzt, weil sie Schulden hatte. Genau wie wir alle.'),
    erz('Der Tourist nimmt die Sonnenbrille ab. Seine Augen glänzen. Er zahlt einhundertfünfzig Credits, ohne zu feilschen, und trägt die Salatschüssel weg wie eine Krone.'),
    D('Apollo NEUNZEHN? Woher hast du das? Das war … ich hab Gänsehaut. Ich glaub’s selber!', 'ueberrascht'),
  ], { next: 'ende' }),
  knoten('gedraenge', [
    erz('Zwei Minuten später schreit eine Marktfrau „LETZTES STÜCK! LETZTES STÜCK!“, drei Kinder drängeln sich ehrfürchtig, und auf dem Tisch liegt ein Zertifikat mit Briefkopf „Mondbehörde Noxius“ und dem Stempel einer Bäckerei.'),
    erz('Der Tourist will nicht leer ausgehen, wenn alle drängeln. Hundertfünfzig Credits. Er lächelt, als hätte er gewonnen.'),
    D('Das ist Marketing! Das ist richtiges Marketing! Ich hab dafür immer nur geweint!', 'freude'),
  ], { next: 'ende' }),
  knoten('oberstadt', [
    erz('Du sprichst den Touristen in der Sprache der Glastürme an: Statement, Narrativ, kuratiert, limitiert. Er nickt bei jedem Wort, als würde es ihn massieren.'),
    erz('Zweihundert Credits. Und er bedankt sich.'),
    D('„Regolith-Statement.“ Ich weiß nicht, was das heißt, aber ich will es auf meinen Grabstein.', 'ueberrascht'),
  ], { next: 'ende' }),
  knoten('ehrlich', [
    erz('Der Tourist hebt die Augenbrauen. Dann lacht er, ehrlich überrascht.'),
    erz('„Schlacke! Authentische Schlacke! Wie erfrischend.“ Er kauft sie für dreißig Credits. Als Briefbeschwerer. „Für die Ehrlichkeit.“'),
    D('Ehrlich. Hm. Ehrlich bringt weniger. Aber ich hab nicht dieses Kribbeln im Nacken, das ich sonst hab.', 'neutral'),
    D('Ist das … Gewissen? Ist das Gewissen? Geht das wieder weg?', 'besorgt'),
  ], { next: 'ende' }),
  knoten('warnen', [
    ich('Das ist Schlacke. Kaufen Sie nichts unter Salatschüsseln.'),
    erz('Der Tourist nickt dir dankbar zu und geht weiter. Dexter sieht ihm nach wie einem abfahrenden Zug.'),
    D('Okay. Okay. Du hast ja recht. Das war … ich hätte ihn betrogen. Das ist mies.', 'besorgt'),
    D('Ich bin nicht sauer. Ich bin nur arm. Das sieht ähnlich aus.'),
  ], { effects: [{ xp: 30 }] }),
  knoten('ende', [
    D('Partner! Wir sind Partner! Ich lass Visitenkarten drucken. „Dexter und Partner, Mondhandel.“ Du stehst klein drunter. Aber du stehst drauf!', 'freude'),
  ], { effects: [{ xp: 60 }, herz('dexter', 20), flag('dexter_mondgestein')] }),
]);

const he6 = dialog('he-dexter-6', [
  knoten('start', [
    erz('Abend auf der Halde. Im Wellblechbüro brennt nur die Schreibtischlampe. Dexter sitzt davor und hält ein dickes, fleckiges Notizbuch in beiden Händen, als wäre es aus Glas.'),
    D('Oh. Du. Komm rein. Mach die Tür zu. Den Vorhang. Egal.', 'besorgt'),
    D('Das ist mein Gläubigerbuch. Da steht drin, wem ich was schulde. Ich hab’s heute zum ersten Mal seit Jahren aufgemacht.'),
    erz('Er schlägt es auf. Neben jedem Betrag stehen kleine Notizen. Hunter: „Hat mir im Winter 2079 Suppe gebracht. Zahl ihm zuerst.“ Oma Volt: „Hat meinen Mantel geflickt, umsonst. Bring Nougat.“ Babette: „Kein Geld. Nur danke sagen. Jeden Tag.“ Gustav: „Lieber Mann. Seil zurück. Radio hören.“'),
    D('Ich schulde allen was. Und alle waren nett zu mir. Das ist das Schlimmste daran. Wären sie fies, könnte ich mich wenigstens drüber aufregen.', 'besorgt'),
  ], {
    choices: [
      { text: '„Dann zahlen wir es zurück. Einen nach dem anderen.“', next: 'plan', effects: [herz('dexter', 40)] },
      {
        text: '„Bei manchen reicht ein Gespräch statt Geld. Ich verhandle für dich.“', next: 'verhandeln',
        check: pruefung('he-dexter-6-verhandeln', 'ausstrahlung', 5, ['verhandeln']), effects: [herz('dexter', 50)],
      },
      {
        text: '„Die Rostzähne stehen auch drin. Die regeln wir anders.“', next: 'rostzaehne',
        check: pruefung('he-dexter-6-rostzaehne', 'strasse', 5, ['einschuechtern', 'geruecht']), effects: [herz('dexter', 50)],
      },
      { text: '„Du bist ein guter Kerl, Dexter. Nur ein mieser Buchhalter.“', next: 'guter-kerl', effects: [herz('dexter', 35)] },
    ],
  }),
  knoten('plan', [
    D('Zurückzahlen. Wirklich zurückzahlen. Nicht „irgendwann“. Sondern … mit Datum?', 'ueberrascht'),
    ich('Mit Datum.'),
    D('Mir wird schlecht. Das ist gut. Das ist die gute Art von schlecht.', 'besorgt'),
  ], { next: 'ende' }),
  knoten('verhandeln', [
    ich('Babette will Dank, kein Geld. Gustav will Gesellschaft. Oma Volt will Nougat. Das kriegst du hin. Bei Hunter und Ripper geh ich mit.'),
    D('Du hast recht. Die Hälfte meiner Schulden sind gar keine Credits. Sie sind … Gefühle mit Zinsen.', 'ueberrascht'),
  ], { next: 'ende' }),
  knoten('rostzaehne', [
    ich('Die Rostzähne kassieren Wucherzinsen ohne Vertrag. Wenn wir das öffentlich machen, verlieren sie mehr Gesicht als du Credits.'),
    D('Öffentlich? Gegen die Rostzähne? Du bist verrückt. Du bist großartig verrückt. Ich mag verrückt.', 'freude'),
  ], { next: 'ende' }),
  knoten('guter-kerl', [
    D('Mieser Buchhalter. Ha.', 'neutral'),
    D('Das ist das Netteste, was mir je jemand gesagt hat. Die meisten sagen nur „mieser Kerl“ und lassen den Buchhalter weg.', 'freude'),
  ], { next: 'ende' }),
  knoten('ende', [
    erz('Dexter reißt eine leere Seite aus dem Buch und schreibt mit zitternder Hand sechs Namen darauf. Dann pinnt er den Zettel an die Wellblechwand, genau über dem Schreibtisch.'),
    D('Sechs Gläubiger. Sechs. Und ich will, dass jeder einzelne einmal sagt: „Dexter? Der hat gezahlt.“', 'signatur'),
    D('Hilfst du mir? Bitte. Ich zahle immer. Und diesmal mein ich’s.'),
  ], { effects: [{ startQuest: SCHULDENFREI }, { xp: 80 }, herz('dexter', 20), flag('dexter_glaeubigerbuch')] }),
]);

// ♥8 und ♥10: angelegt, erst ab act2 (world.md §11.2).
const he8 = dialog('he-dexter-8', [
  knoten('start', [
    erz('High Voltage, früher Abend. Dexter in einem Anzug, dessen Ärmel tatsächlich dranbleiben, marschiert zum Tresen. In der Hand: ein Umschlag. Dick.'),
    D('Hunter. Zwölfhundert. Minus vierhundert. Minus Gutscheine, die wir nicht erwähnen. Plus Zinsen, die wir erwähnen. Alles da.', 'signatur'),
    H('…'),
    erz('Hunter zählt. Zweimal. Dann nimmt er die Sonnenbrille ab.'),
    H('Dexter. Du hast gezahlt.'),
    D('ICH HAB GEZAHLT! ICH ZAHLE IMMER! UND JETZT IST IRGENDWANN!', 'freude'),
  ], {
    choices: [
      { text: 'Applaudieren. Laut.', next: 'applaus' },
      { text: '„Runde aufs Haus, Hunter?“', next: 'runde' },
    ],
  }),
  knoten('applaus', [erz('Der Club klatscht mit. Dexter verbeugt sich so tief, dass ihm ein Ärmel doch abfällt.')], { effects: [herz('dexter', 40), flag('dexter_hunter_bezahlt'), { xp: 120 }] }),
  knoten('runde', [H('Eine Runde. Leitungswasser. Mit Strohhalm. Der Strohhalm geht aufs Haus.')], { effects: [herz('dexter', 40), herz('hunter', 20), flag('dexter_hunter_bezahlt'), { xp: 120 }] }),
]);

const he10 = dialog('he-dexter-10', [
  knoten('start', [
    erz('Auf der Halde hängt ein neues Schild über dem Wellblechbüro: „DEXTERS LEIHHAUS – Kredit für alle, die keinen kriegen. Zinsen: ein Lächeln.“'),
    D('Ich leih jetzt Geld. Kleine Beträge. An Leute wie mich. Und ich schreib nette Notizen dazu. Und wenn einer nicht zahlen kann, bring ich Suppe.', 'freude'),
    erz('Er drückt dir sein altes Gläubigerbuch in die Hand. Jede Zeile ist durchgestrichen. Neben jeder steht: „Bezahlt.“'),
    D('Das ist für dich. Mein Schuldbuch. Das Einzige, was ich nie wieder brauche.', 'signatur'),
  ], {
    effects: [{ give: 'dexters-schuldbuch' }, flag('dexter_leihhaus'), { xp: 200 }],
    choices: [{ text: '„Ich bin stolz auf dich, Dexter.“', next: 'stolz' }],
  }),
  knoten('stolz', [D('Sag das nicht so laut. Sonst muss ich weinen. Und Weinen kostet bei mir jetzt Gebühren.', 'besorgt')], { effects: [herz('dexter', 50)] }),
]);

// ---------------------------------------------------------------------------------------------- Figur

const dexter: NpcDef = {
  id: 'dexter',
  name: 'Dexter',
  portrait: 'dexter',
  sprite: 'dexter-walk',
  faction: 'unterstadt',
  bio: 'Schrotthändler und Drohnenbastler mit Wellblechbüro auf der Halde. Schuldet Hunter 1200 Credits und hat den Rest in „Chrome 10“-Gutscheine „investiert“. Gutmütig, chaotisch, ewig pleite. „Ich zahle immer! Irgendwann.“',
  gifts: {
    loves: ['alte-euromuenze', 'beglichener-schuldschein', 'bao-dampfnudel'],
    likes: ['glitzerschrott', 'sonnenbrille-gold', 'chips-tuete', 'volt-limo', 'echtobst-apfel', 'hofhonig'],
    dislikes: ['kassenbuch', 'rechenfibel'],
    hates: ['griffband-schlaeger', 'handschellen', 'rostige-dose', 'virus-implantat'],
  },
  schedule: [
    // he-richter-4: Mittwoch früh sitzt er wegen seines Ziegenroboters im Gerichtssaal.
    { slot: 'morgen', when: ZIEGEN_PROZESS, place: { map: 'gerichtssaal', at: 'zeugenstand' } },
    // Während main-1-dexter verbarrikadiert er sich im Büro (Quest-Hotspots an der Bürotür).
    { when: { quest: HAUPT, state: 'active' }, place: 'away' },
    { slot: 'morgen', place: { map: 'schrottmarkt', at: 'dexter-versteck' } },
    { slot: 'tag', place: { map: 'schrottmarkt', at: 'dexter-buero' } },
    { slot: 'abend', when: HAUPT_DONE, place: { map: 'high-voltage', at: 'dexter-tisch' } },
    { slot: 'abend', place: { map: 'schrottmarkt', at: 'dexter-buero' } },
    { slot: 'nacht', place: { map: 'schrottmarkt', at: 'dexter-buero' } },
  ],
  heartEvents: [
    { id: 'he-dexter-2', hearts: 2, map: 'schrottmarkt', time: 'tag', when: { not: { quest: HAUPT, state: 'active' } }, dialogue: 'he-dexter-2' },
    { id: 'he-dexter-4', hearts: 4, map: 'schrottmarkt', time: 'tag', when: { not: { quest: HAUPT, state: 'active' } }, dialogue: 'he-dexter-4' },
    // Abends sitzt er nach main-1-dexter im High Voltage; das Gläubigerbuch liegt aber im Büro – er geht dafür heim.
    { id: 'he-dexter-6', hearts: 6, map: 'schrottmarkt', time: 'abend', when: { not: { quest: HAUPT, state: 'active' } }, dialogue: 'he-dexter-6' },
    { id: 'he-dexter-8', hearts: 8, map: 'high-voltage', time: 'abend', when: { all: [AB_AKT2, { seen: 'he-dexter-6' }] }, dialogue: 'he-dexter-8' },
    { id: 'he-dexter-10', hearts: 10, map: 'schrottmarkt', time: 'tag', when: { all: [AB_AKT2, { seen: 'he-dexter-8' }] }, dialogue: 'he-dexter-10' },
  ],
  talk: [
    rede('dexter-tag-rivale', { rival: 'dexter' }),
    rede('dexter-tag-hauptquest', { quest: HAUPT, state: 'active' }),
    rede('dexter-tag-schrott', { all: [{ origin: 'origin-schrott' }, { notFlag: 'dexter_herkunft' }] }),
    rede('dexter-tag-vexaria', { all: [VEX, { flag: 'aria_romanze_zusammen' }, { notFlag: 'dexter_kommentar_vexaria' }] }),
    rede('dexter-tag-zeit', NICHT_AKT2, 8),
    rede('dexter-tag-nacht', { time: 'nacht' }),
    rede('dexter-tag-versteck-aria', { all: [{ time: 'morgen' }, { companion: 'aria' }] }),
    rede('dexter-tag-versteckt', { time: 'morgen' }),
    rede('dexter-tag-chrome10', { quest: 'side-chrome-10', state: 'active' }),
    rede('dexter-tag-rennen', { quest: 'side-drohnenrennen', state: 'active' }),
    rede('dexter-tag-hv', { all: [{ time: 'abend' }, HAUPT_DONE] }),
    rede('dexter-tag-vertraut', undefined, 6),
    rede('dexter-tag-buero', { time: 'tag' }),
    rede('dexter-tag-standard'),
  ],
};

export const part: ContentPart = {
  npcs: { dexter },
  dialogues: sammle(
    T.rivale, T.herkunft, T.versteckt, T.versteckAria, T.vexaria, T.hauptquest, T.zeit, T.chrome10, T.rennen, T.hv,
    T.nacht, T.vertraut, T.buero, T.standard,
    he2, he4, he6, he8, he10,
  ),
};
