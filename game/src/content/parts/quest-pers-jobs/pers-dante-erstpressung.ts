// pers-dante-erstpressung · „Samstagnacht im Neon“ (world.md §6.5, Start in he-dante-4 über dante.ts).
// Kette: Gustav → Dexter → Collin → Barkeeper (will einen Dreizeiler). Wege: Tauschen, [Straße 5] Abkürzung bei Dexter,
// eigener Dreizeiler [Ausstrahlung 5], Dreizeiler-Rätsel ohne Check, `haiku-buechlein` als Tausch.
// Die Gespräche hängen als Beiträge an den Sammelgesprächen der Figuren (figuren.ts).
import type { QuestDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import {
  type Beitrag, L, N, P, VEX, active, all, any, beitrag, byId, bye, c, chk, cr, dlg, flag, give, hearts, item, node, noFlag,
  nochWas, rel, set, schritt, szene, tafel, take, xp, zeit,
} from './_lib';

const Q = 'pers-dante-erstpressung';
const PLATTE = 'erstpressung-samstagnacht';
const AKTIV = active(Q);

const quest: QuestDef = {
  id: Q, kind: 'personal', act: 1, giver: 'dante',
  title: 'Samstagnacht im Neon',
  summary: 'Dante sucht die Erstpressung von „Samstagnacht im Neon“ – mit seinem einzigen Gitarrensolo, aufgenommen im Knast. Die Platte ist durch vier Hände gewandert.',
  autoStart: hearts('dante', 5),
  steps: [
    schritt('gustav', 'Frag Opa Gustav am Schrottmarkt nach der Platte (Stand tagsüber, Wohnwagen abends).', 'ep_gustav', { marker: { map: 'schrottmarkt' } }),
    schritt('dexter', 'Gustav hat die Platte Dexter gegeben. Such ihn in seinem Wellblechbüro.', 'ep_dexter', { when: flag('ep_gustav'), marker: { map: 'schrottmarkt' } }),
    schritt('collin', 'Dexter hat sie gegen einen Werbespot bei Collin Charleston getauscht (NX-1-Studio morgens, Café Sahnehaube abends).', 'ep_collin',
      { when: all(flag('ep_dexter'), noFlag('ep_abkuerzung')), marker: { map: 'nx1-studio' } }),
    {
      id: 'barkeeper', text: 'Der Barkeeper im High Voltage hat die Platte. Er will dafür einen Dreizeiler.',
      done: any(item(PLATTE), flag('ep_fertig')), when: flag('ep_collin'), marker: { map: 'high-voltage' },
    },
    schritt('dante', 'Bring Dante die Platte in die Werkstatt.', 'ep_fertig', { when: any(item(PLATTE), flag('ep_fertig')), marker: { map: 'dantes-werkstatt' } }),
  ],
  reward: { xp: 200, relations: { dante: 120 } },
};

// ------------------------------------------------------------------------------------------- Gustav
const G = 'opa-gustav';
const gustav = beitrag(G, all(AKTIV, noFlag('ep_gustav')), '„Samstagnacht im Neon“. Erstpressung. Dante sucht sie.', [
  node('ep-g-platte', [
    L(G, '„Samstagnacht im Neon“ … Ach du grüne Neune. Die hatte ich. Fünfzig Stück wurden gepresst, und eine davon lag bei mir zwischen Schrauben und Weihnachtsbaumkugeln.'),
    L(G, 'Früher war hier alles grün, weißt du. Und früher hatte ich auch noch Platz im Wohnwagen. Da kam Dexter. „Opa Gustav, ich geb dir ein Ölkännchen und mein Ehrenwort.“'),
    L(G, 'Das Ölkännchen hab ich noch. Das Ehrenwort ist irgendwo zwischen dem Kran und seinem Büro verdunstet.', 'signatur'),
  ], {
    choices: [
      c('„Danke, Gustav. Dann quetsch ich Dexter aus.“', 'ep-g-ende', { effects: [set('ep_gustav'), rel(G, 15)] }),
      c('„Hast du sie mal gehört? Das Solo?“', 'ep-g-solo', { once: true, id: 'ep-g-solo' }),
    ],
  }),
  node('ep-g-solo', [
    L(G, 'Einmal. Nachts, Radio aus, Platte drauf. Da ist ein Gitarrensolo, das klingt, als würde jemand zum ersten Mal im Leben laut lachen und dabei die Treppe runterfallen.'),
    L(G, 'Ich hab geheult wie ein Schlosshund. Erzähl das keinem. Schon gar nicht Knurri. Der ist nachtragend.', 'trauer'),
  ], { next: 'ep-g-platte' }),
  node('ep-g-ende', [L(G, 'Und sag Dante, er schuldet mir immer noch einen Keks. Einen ganzen. Nicht so einen vom Boden.')], { choices: [nochWas(), bye()] }),
]);

// ------------------------------------------------------------------------------------------- Dexter
const D = 'dexter';
const dexter = beitrag(D, all(AKTIV, flag('ep_gustav'), noFlag('ep_dexter')), '„Gustavs Platte. Samstagnacht im Neon. Wo ist sie?“', [
  node('ep-d-frage', [
    L(D, 'Die Platte? Die hab ich … investiert. Strategisch. In meine Marke. In die Zukunft. In …', 'besorgt'),
    N('Er wedelt mit den Händen, als würde er eine Drohne steuern, die gerade abstürzt.'),
    L(D, 'Ich sag’s dir, aber du musst verstehen: Informationen sind Ware. Und Ware kostet. Ich bin Geschäftsmann!'),
  ], {
    choices: [
      c('Eine alte Euromünze auf den Tisch legen.', 'ep-d-zahlt', { when: item('alte-euromuenze'), effects: [take('alte-euromuenze'), rel(D, 60)] }),
      c('„Fünfzig Credits. Und du hältst die Klappe über den Rest deiner Strategie.“', 'ep-d-zahlt', { requires: { credits: 50 }, effects: [cr(-50)] }),
      c('„Dexter. Du lügst, wenn du atmest. Wem hast du sie gegeben – und wer hat sie jetzt?“', 'ep-d-durchschaut',
        { check: chk('ep-dexter-luege', 'strasse', 5, ['geruecht', 'einschuechtern']) }),
      c('„Ich reparier dir die Drohne da. Und du redest.“', 'ep-d-drohne'),
    ],
  }),
  node('ep-d-zahlt', [
    L(D, 'Okay, okay. Ich hab sie Collin gegeben. Collin Charleston. NX-1! Dafür hab ich einen Werbespot bekommen. Dreißig Sekunden! Um drei Uhr nachts! Zwischen Teleshopping und Testbild!', 'freude'),
    L(D, 'Hat genau null Kunden gebracht. Aber einen Anruf von meiner Mutter. Sie war stolz. Glaub ich.'),
  ], { effects: [set('ep_dexter')], next: 'ep-d-ende' }),
  node('ep-d-drohne', [
    N('Die Drohne hat einen Rotor aus einem Küchenmixer und eine Seele aus Klebeband. Du schraubst eine Stunde. Am Ende fliegt sie. Rückwärts, aber sie fliegt.'),
    L(D, 'SIE FLIEGT! Du bist ein Genie! Okay, Deal ist Deal: Ich hab die Platte Collin Charleston gegeben, für einen Werbespot. Frag ihn.', 'freude'),
  ], { effects: [zeit(60), set('ep_dexter'), rel(D, 30)], next: 'ep-d-ende' }),
  node('ep-d-durchschaut', [
    L(D, '… Woher weißt du, dass ich lüge? Ich hab doch noch gar nicht angefangen!', 'ueberrascht'),
    L(D, 'Na gut. Collin hat sie gekriegt, für einen Werbespot. Und Collin schuldet dem Barkeeper im High Voltage eine Rechnung, so lang wie Gustavs Kran. Fünfzehn Edelbrausen. Die Platte steht jetzt da. Hinterm Tresen. Ich hab sie gesehen und fast geweint.', 'trauer'),
  ], { effects: [set('ep_dexter'), set('ep_collin'), set('ep_abkuerzung')], next: 'ep-d-ende' }),
  node('ep-d-ende', [L(D, 'Und wenn Dante fragt: Ich war das nicht. Ich war nie da. Ich bin ein Gerücht.')], { choices: [nochWas(), bye()] }),
]);

// ------------------------------------------------------------------------------------------- Collin
const C = 'collin-charleston';
const collin = beitrag(C, all(AKTIV, flag('ep_dexter'), noFlag('ep_collin')), '„Dexter hat dir eine Platte gegeben. Samstagnacht im Neon.“', [
  node('ep-c-platte', [
    L(C, 'Die Platte! Ja! Hatte ich! Furchtbares Cover, großartige Rillen. Ich hab sie …', 'ueberrascht'),
    L(C, '… hm. Dem Barkeeper gegeben. Im High Voltage. Ich hatte da eine kleine Rechnung offen. Fünfzehn Edelbrausen. Und einen Abend, an den ich mich nicht erinnern will. Die Platte war mein Pfand.', 'besorgt'),
    L(C, 'Der gute Mann redet nur in Dreizeilern. Ich wollte verhandeln. Er hat mich angesehen und gesagt: „Moderator spricht viel / doch nichts davon reimt sich je / zahl deine Brause.“ Das saß.', 'trauer'),
    L(C, 'Ich kann ihm sagen, dass du kommst. Aber eine Hand wäscht die andere, Schätzchen. Showbusiness.'),
  ], {
    choices: [
      c('Haarspray Deluxe überreichen. „Für die Frisur, die nie liegt.“', 'ep-c-haarspray', { when: item('haarspray-deluxe'), effects: [take('haarspray-deluxe'), rel(C, 60)] }),
      c('„Was willst du?“', 'ep-c-wunsch'),
    ],
  }),
  node('ep-c-wunsch', [
    L(C, 'Eine Stimme der Straße! Für meine Morgensendung! Du sagst einen Satz ins Mikro, ehrlich, ungeschminkt, und ich mach daraus Gold. Was ist das Beste an der Unterstadt?'),
  ], {
    choices: [
      c('„Dass hier keiner so tut, als wär er was Besseres. Außer dir.“', 'ep-c-sendung', { effects: [rel(C, 20), { rep: 'unterstadt', delta: 2 }] }),
      c('„Die Dampfnudeln von Babette. Schreib das auf. Gold.“', 'ep-c-sendung', { effects: [rel(C, 10), rel('babette-bao', 15)] }),
      c('„Dass man hier noch Platten findet, die mehr wert sind als die ganze Oberstadt.“', 'ep-c-sendung', { effects: [rel(C, 15), rel('dante', 10)] }),
    ],
  }),
  node('ep-c-sendung', [
    N('Collin drückt auf den roten Knopf, hält dir das Mikro hin und nickt ernst, als würdest du gerade einen Friedensvertrag verlesen. Dann: Applaus vom Band.'),
    L(C, 'Grandios! Ich schick dem Barkeeper eine Nachricht. Anrufen bringt nichts. Er antwortet in Silben.', 'freude'),
  ], { effects: [set('ep_collin')], choices: [nochWas(), bye()] }),
  node('ep-c-haarspray', [
    L(C, 'Oh. Oh! Das gute Zeug! Das hält sogar bei Rostregen! Du verstehst Fernsehen, {name}.', 'freude'),
    L(C, 'Geh zum Barkeeper. Sag ihm, Collin schickt dich. Er wird nicht lächeln. Er lächelt nie. Aber er wird zuhören.'),
  ], { effects: [set('ep_collin')], choices: [nochWas(), bye()] }),
]);

// ------------------------------------------------------------------------------------------- Barkeeper
const B = 'barkeeper';
const barkeeper = beitrag(B, all(AKTIV, flag('ep_collin'), { noItem: PLATTE }, noFlag('ep_fertig')), 'Auf die Plattenhülle hinter dem Tresen zeigen.', [
  node('ep-b-start', [
    N('Zwischen Edelbrause und einer Flasche ohne Etikett lehnt eine Plattenhülle. „Samstagnacht im Neon“. Der Barkeeper folgt deinem Blick.'),
    L(B, 'Schwarze Rille dreht / Collins Schuld in meiner Hand / was gibst du dafür?'),
  ], {
    choices: [
      c('Selbst einen Dreizeiler dichten.', 'ep-b-eigen', { check: chk('ep-dreizeiler', 'ausstrahlung', 5, ['ueberreden', 'kunst']) }),
      c('Das Haiku-Büchlein über den Tresen schieben.', 'ep-b-buch', { when: item('haiku-buechlein'), effects: [take('haiku-buechlein'), rel(B, 60)] }),
      c('Einen Dreizeiler zusammensetzen. Zeile für Zeile.', 'ep-b-v1'),
      bye('Ich komm wieder. Mit Silben.'),
    ],
  }),
  node('ep-b-eigen', [
    P('Dante sitzt im Knast / spielt Gitarre ohne Ton / heut hört er sich selbst.', 'zaertlich'),
    N('Stille. Der Barkeeper stellt das Glas ab, das er seit einer Minute poliert. Er nickt. Einmal. Für ihn ist das eine stehende Ovation.'),
    L(B, 'Der Vers ist bezahlt / nimm die Platte mit nach Haus / sag ihm: dreh lauter.'),
  ], { effects: [give(PLATTE), rel(B, 50), xp(40)] }),
  node('ep-b-buch', [
    L(B, 'Fremde Verse, fein / hundert Jahre in Papier / das reicht mir für eins.'),
    N('Er reicht dir die Platte, ohne hinzusehen. Das Büchlein steckt schon in seiner Westentasche.'),
  ], { effects: [give(PLATTE)] }),
  node('ep-b-v1', [N('Er legt drei Bierdeckel hin und zählt mit den Fingern mit. Erste Zeile, fünf Silben:')], {
    choices: [c('„Nadel auf Vinyl“', 'ep-b-v2'), c('„Eine Platte aus Schwarz und Licht“', 'ep-b-falsch'), c('„Platte“', 'ep-b-falsch')],
  }),
  node('ep-b-v2', [N('Ein Finger, zwei, drei, vier, fünf. Er nickt. Zweite Zeile, sieben Silben:')], {
    choices: [c('„Dante tanzt“', 'ep-b-falsch'), c('„das Solo kommt nach Hause“', 'ep-b-v3'), c('„ein Knastchor singt im Keller der ganzen Stadt“', 'ep-b-falsch')],
  }),
  node('ep-b-v3', [N('Sieben. Er hebt eine Augenbraue, was bei ihm ungefähr einem Freudentanz entspricht. Dritte Zeile, fünf Silben:')], {
    choices: [c('„Kuschel hebt ein Ohr“', 'ep-b-richtig'), c('„und alle Nachbarn beschweren sich“', 'ep-b-falsch'), c('„laut“', 'ep-b-falsch')],
  }),
  node('ep-b-falsch', [
    N('Er zählt. Er zählt noch mal. Er schiebt den Bierdeckel zurück.'),
    L(B, 'Zu viel oder kurz / Silben stolpern übers Glas / fang von vorne an.'),
  ], { choices: [c('Noch mal von vorn.', 'ep-b-v1'), bye('Später. Mein Kopf zählt gerade nur bis drei.')] }),
  node('ep-b-richtig', [
    P('Nadel auf Vinyl / das Solo kommt nach Hause / Kuschel hebt ein Ohr.'),
    L(B, 'Kein großer Dichter / aber ehrlich bis ins Mark / die Platte gehört dir.'),
  ], { effects: [give(PLATTE), rel(B, 30)] }),
]);

// ------------------------------------------------------------------------------------------- Dante
const DA = 'dante';
const dante = beitrag(DA, all(AKTIV, item(PLATTE), noFlag('ep_fertig')), '„Samstagnacht im Neon. Erstpressung. Für dich.“', [
  node('ep-da-auflegen', [
    L(DA, 'Was hast du da? Ist das … Um Himmels Willen. Eine Plattenhülle mit Kaffeerand? Mit DEM Kaffeerand?', 'ueberrascht'),
    L(DA, 'Wo … wie … wer … Weißt du was, ist egal. Heiliges Kanonenrohr. Captain Kuschel, Ohren hoch, das ist ein historischer Moment!', 'freude'),
  ], { effects: [take(PLATTE), { cutscene: 'pj-ep-solo' }] }),
]);

const solo = szene('pj-ep-solo', 'Samstagnacht im Neon', [
  tafel('Die Nadel senkt sich. Knistern. Dann ein Chor aus vierzig Männern in Anstaltsgrau, die singen, als wäre die Mauer schon gefallen.'),
  tafel('Und mittendrin eine Gitarre. Drei Akkorde, alle falsch. Ein Solo, das stolpert, lacht, hinfällt und wieder aufsteht.', [
    L(DA, 'Das bin ich. Das bin ICH! Zehntausend Stunden, und so klingt das!', 'freude'),
  ]),
  tafel('Dante tanzt. Er tanzt wie jemand, dem nie einer gesagt hat, dass er nicht tanzen kann. Captain Kuschel stellt beide Ohren steil nach oben.', [
    L(DA, 'Es ist schrecklich. Es ist das Schönste, was ich je gehört hab. Danke, {name}. Wirklich.', 'zaertlich'),
  ]),
], [set('ep_fertig')]);

const danteVex = dlg('pj-ep-dante-vex', [
  node('start', [
    L(DA, 'Sag mal, Vex. Lieferst du so was eigentlich auch professionell? Platten, die durch vier Hände gehen?', 'freude'),
    P('Ich liefer, was nicht explodiert. Deine Platte war knapp dran.', 'signatur'),
    L(DA, 'Ha! Die Kuriere aus den Lötgassen. Ich wusste, ihr habt ein Herz. Irgendwo unter dem ganzen Klebeband.'),
  ]),
]);

export const beitraege: Beitrag[] = [gustav, dexter, collin, barkeeper, dante];

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: byId(danteVex),
  cutscenes: byId(solo),
  mapAdditions: {
    'dantes-werkstatt': { onEnter: [{ id: 'pj-ep-dante-vex', when: all(flag('ep_fertig'), VEX), dialogue: danteVex.id, once: true }] },
  },
};
