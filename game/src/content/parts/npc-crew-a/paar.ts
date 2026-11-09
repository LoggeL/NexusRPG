// Paar-Strang Dante/Raven (world.md §4.7): persönliche Quest „Sonnenuntergang“ im Nachspiel.
// Start in Dantes Menü (dante.ts, „Das Date mit Raven…“), nur ohne Störung und ohne Dante-Romanze, wenn die Spielfigur
// in he-dante-10 / he-raven-10 geholfen hat oder die beiden im Ende am Meer zusammen standen (dante_raven_am_meer).
// Schritte: Plan (Dante) → Picknick (Babettes Garküche) → Musik (Koffer-Plattenspieler oder Lio) → Raven locken
// (raven.ts) → Date abends an Nyras Bank. Epilog-Karte „sonnenuntergang“ (quest-enden/epilog-karten.ts) hängt am Abschluss.
import type { ContentPart } from '../../part';
import type { Condition, QuestDef } from '../../../modules/contracts';
import { EPILOG_FREI, dialog, erz, flag, herz, knoten, pruefung, sammle, sammleSzenen, sprecher, und } from './_helfer';

const D = sprecher('dante');
const R = sprecher('raven');
const BB = sprecher('babette-bao');

const Q = 'pers-wingman-sonnenuntergang';
const AKTIV: Condition = { quest: Q, state: 'active' };
const BEREIT: Condition = und(AKTIV, { flag: 'wingman_picknick' }, { flag: 'wingman_musik' }, { flag: 'wingman_raven' }, { notFlag: 'wingman_date' });

const quest: QuestDef = {
  id: Q, kind: 'personal', act: 3, giver: 'dante',
  title: 'Sonnenuntergang',
  summary: 'Sieben Jahre, ein Schrank voller Fotos und ein Diagramm mit vier Farben. Dante will Raven endlich sagen, was Sache ist. Am Wasser, bei Sonnenuntergang. Und du sorgst dafür, dass er nicht rückwärts in die Flut läuft.',
  steps: [
    { id: 'plan', text: 'Geh mit Dante sein Diagramm durch (Werkstatt).', done: { flag: 'wingman_plan' }, marker: { map: 'dantes-werkstatt', at: 'werkbank' } },
    { id: 'picknick', text: 'Besorg einen Picknickkorb bei Babettes Garküche (Schrottmarkt).', done: { flag: 'wingman_picknick' }, marker: { map: 'schrottmarkt', at: 'garkueche-bank' }, when: { flag: 'wingman_plan' } },
    { id: 'musik', text: 'Sorg für Musik: Dantes Koffer-Plattenspieler oder Lio Funkel.', done: { flag: 'wingman_musik' }, when: { flag: 'wingman_plan' } },
    { id: 'raven', text: 'Lock Raven abends an die Flutmauer, ohne dass sie Lunte riecht.', done: { flag: 'wingman_raven' }, when: { flag: 'wingman_plan' } },
    {
      id: 'date', text: 'Abends an Nyras Bank: Halt dich bereit, falls Dante umfällt.', done: { flag: 'wingman_date' },
      marker: { map: 'flutmauer', at: 'nyra-bank' }, when: und({ flag: 'wingman_picknick' }, { flag: 'wingman_musik' }, { flag: 'wingman_raven' }),
    },
  ],
  reward: { xp: 300, relations: { dante: 100, raven: 100 }, effects: [flag('dante_raven_paar')] },
};

// ------------------------------------------------------------------------------------------- Picknickkorb
const korb = dialog('wingman-korb', [
  knoten('start', [
    erz('Babettes Garküche. Dampf, Sojasoße und eine Frau mit Schöpfkelle, die aussieht, als hätte sie schon Ripper aus dem Laden geworfen. Zweimal.'),
    BB('Picknick? Für wen? Für Dante? DANTE hat ein Date?', 'ueberrascht'),
    BB('Mit wem? Nein, sag nichts. Mit der mit dem Messer und der Lederjacke. Ich hab Augen, Schätzchen. Die sitzen jeden Freitag zwei Hocker auseinander und gucken sich nicht an. So sehr, dass es wehtut.'),
  ], {
    choices: [
      { text: 'Vierzig Credits hinlegen. „Das Beste, was du hast.“', when: { credits: 40 }, next: 'gekauft', effects: [{ credits: -40 }] },
      { text: '„Das ist Liebe, Babette. Liebe zahlt nicht. Liebe isst.“', check: pruefung('wingman-korb-charme', 'ausstrahlung', 5, ['ueberzeugen']), next: 'charme', effects: [herz('babette-bao', 20)] },
      { text: 'Eine Tüte Dantes Kekse tauschen.', when: { item: 'dantes-kekse' }, next: 'tausch', effects: [{ take: 'dantes-kekse' }, herz('babette-bao', 10)] },
      { text: 'Später.' },
    ],
  }),
  knoten('gekauft', [BB('Vierzig. Für Dante mach ich die Dampfnudeln extra fluffig. Er hat mir mal den Herd repariert. Mit einem Löffel. Ich hab nicht gefragt.', 'freude')], { next: 'korb' }),
  knoten('charme', [BB('Liebe isst. Hach. Das stick ich auf eine Schürze. Geht aufs Haus. Und wenn er’s versaut, kriegt er die Schürze um die Ohren.', 'freude')], { next: 'korb' }),
  knoten('tausch', [BB('Seine Kekse? Die mit dem Salz? Gib her. Die sind besser als meine. Wenn du das jemandem erzählst, verkauf ich dich als Füllung.', 'signatur')], { next: 'korb' }),
  knoten('korb', [
    erz('Ein Korb mit karierter Decke: Dampfnudeln, zwei Flaschen Limo, eingelegte Gurken und ein Zettel: „Nicht reden. Füttern. – B.“'),
  ], { effects: [flag('wingman_picknick'), { message: 'Picknickkorb besorgt.' }] }),
]);

// ------------------------------------------------------------------------------------------- Das Date
const date = dialog('wingman-sonnenuntergang', [
  knoten('start', [
    erz('Flutmauer, Abend. Die Sonne hängt tief über dem Wasser und färbt den Smog orange, als hätte jemand Rost poliert. Du hockst hinter einem Poller, zehn Meter entfernt. Nah genug, nicht zu nah.'),
    erz('Dante sitzt auf Nyras Bank. Der Picknickkorb steht offen, die Musik läuft leise. Er hat sich die Haare gekämmt. Es hat nichts gebracht.'),
    R('Was soll das, Dante? „Training“, hat’s geheißen.', 'signatur'),
    D('Ja! Training! Herztraining! Für … also … setz dich. Bitte. Da ist eine Dampfnudel. Die ist fluffig. Extra fluffig.', 'verlegen'),
    erz('Raven setzt sich. Mit einer Handbreit Abstand. Sie nimmt die Dampfnudel. Sie isst sie nicht.'),
    D('Ich hab dir was zu sagen. Ich hab ein Diagramm. Ich hab es nicht dabei. Absichtlich. Hab ich jemandem versprochen.'),
    erz('Dante steht auf, um etwas Großes zu sagen, und tritt dabei gegen den Korb. Die Limoflasche kippt, rollt, und die Platte springt mit einem Kreischen aus der Rille. Er erstarrt. Seine Lippen formen „Gib mir noch eine Sekunde“.'),
  ], {
    choices: [
      {
        text: 'Hinter dem Poller vor, Flasche fangen, Nadel zurücksetzen, wieder weg. Zwei Sekunden.', check: pruefung('wingman-sonnenuntergang-fangen', 'reflexe', 6, ['schnell', 'schleichen']),
        next: 'gefangen',
      },
      {
        text: 'Leise rüberrufen: „Nicht die Sekunde. Den Schrank.“', check: pruefung('wingman-sonnenuntergang-zuruf', 'ausstrahlung', 7, ['ueberzeugen']),
        next: 'zuruf',
      },
      { text: 'Einen Keks werfen. Er trifft Dante am Hinterkopf.', next: 'keks' },
    ],
  }),
  knoten('gefangen', [
    erz('Eine Hand am Hals der Flasche, eine an der Nadel. Die Musik läuft weiter, als wär nichts gewesen. Du bist wieder hinterm Poller, bevor Raven sich umdreht. Fast.'),
    R('… Ich hab dich gesehen.', 'signatur'),
    R('Mach weiter, Dante. Dein Schutzengel hat gute Reflexe.'),
  ], { next: 'schrank', effects: [herz('raven', 20)] }),
  knoten('zuruf', [
    erz('Dante dreht sich zu dir. Dann zu ihr. Er setzt sich wieder hin. Die Platte kratzt vor sich hin. Er lässt sie kratzen.'),
    D('Keine Sekunde. Okay. Nur der Schrank.', 'besorgt'),
  ], { next: 'schrank', effects: [herz('dante', 20)] }),
  knoten('keks', [
    D('AU! Was – ist das ein Keks? Ist das MEIN Keks?', 'ueberrascht'),
    R('Drei-Sekunden-Regel. Iss ihn. Und dann red.', 'freude'),
    erz('Raven lacht. Kurz, rau, als wär’s ihr aus Versehen passiert. Dante hört das Lachen und vergisst, dass er Angst hat.'),
  ], { next: 'schrank' }),
  knoten('schrank', [
    D('Ich hab einen Schrank. In der Werkstatt. Der linke. Da hängen Fotos. Von dir. Sieben Jahre Fotos.', 'besorgt'),
    D('Das klingt gruselig. Das ist gruselig. Aber jedes davon ist ein Tag, an dem ich gedacht hab: Hätte ich die Tür aufgekriegt. Eine Sekunde früher.', 'trauer'),
    R('Ich weiß von dem Schrank, Dante.', 'signatur'),
    D('Du … WAS?', 'ueberrascht'),
    R('Ich bin Einbrecherin. Ich bin seit Wochen in deiner Werkstatt ein und aus. Du hast ein Schloss von 2041. Ich hab’s mit einer Haarnadel aufgekriegt. Aus Langeweile.', 'freude'),
    R('Und die Tür bei Digitech. Ich hab nie dir die Schuld gegeben. Nur dir selbst hab ich’s nicht ausreden können. Das war dein Job. Ich hab nur gewartet, dass du fertig wirst.', 'zaertlich'),
    erz('Die Sonne berührt das Wasser. Raven rutscht die Handbreit rüber. Dante hält sehr still, wie jemand, auf dessen Hand ein Schmetterling gelandet ist.'),
    D('Sieben Jahre. Und du hast einfach … gewartet.', 'zaertlich'),
    R('Ich hab mit einer Handschelle an einem Rohr gewartet. Da lernt man das. Halt jetzt die Klappe.', 'zaertlich'),
    erz('Sie küsst ihn. Er redet nicht. Zum zweiten Mal in seinem Leben redet Dante nicht.'),
  ], { effects: [{ cutscene: 'szene-wingman-sonnenuntergang' }], next: 'danach' }),
  // Ausgang des Dates und Rückmeldung an die Spielfigur.
  knoten('danach', [
  erz('Später. Die Sonne ist weg, die Kräne leuchten. Die beiden sitzen auf der Bank, ihre Schulter an seiner. Dante winkt dir hinter dem Poller zu. Mit beiden Armen. Raven zieht ihm einen davon wieder runter.'),
  D('DANKE! Danke danke danke! Du bist der beste Wingman der Geschichte! Ich back dir einen Keks so groß wie ein Lenkrad!', 'freude'),
  R('Wenn du das irgendwem erzählst, find ich dich. Ich find dich immer.', 'signatur'),
  R('… Danke.', 'zaertlich'),
], {
  choices: [
    { text: '„Hab nichts gesehen. Ich war nie hier.“', effects: [herz('raven', 20)] },
    { text: '„Jetzt hat der Schrank endlich ein Ende.“', effects: [herz('dante', 20)] },
    { text: 'Daumen hoch. Und abhauen, bevor einer heult.' },
  ],
    effects: [flag('wingman_date'), flag('dante_raven_paar_flutmauer'), { xp: 100 }],
  }),
]);

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: sammle(korb, date),
  cutscenes: sammleSzenen({
    id: 'szene-wingman-sonnenuntergang', title: 'Sonnenuntergang',
    beats: [{
      image: 'cut-wingman-sonnenuntergang', pan: 'in', fade: 'in', hold: 2200,
      caption: 'Flutmauer. Ein Picknickkorb, eine kratzende Platte, zwei Silhouetten vor orangem Wasser. Sieben Jahre zu spät, genau pünktlich.',
    }],
  }),
  mapAdditions: {
    schrottmarkt: {
      hotspots: [{
        id: 'wingman-korb', at: 'garkueche-bank', label: 'Babette nach einem Picknickkorb fragen', kind: 'talk', dialogue: 'wingman-korb',
        when: und(AKTIV, { flag: 'wingman_plan' }, { notFlag: 'wingman_picknick' }, { time: ['tag', 'abend'] }, { not: { weekday: 'mo' } }),
      }],
    },
    flutmauer: {
      hotspots: [{
        id: 'wingman-sonnenuntergang', at: 'nyra-bank', label: 'Hinter dem Poller in Stellung gehen', kind: 'use', dialogue: 'wingman-sonnenuntergang',
        when: und(BEREIT, { time: 'abend' }),
      }],
    },
  },
  phone: {
    'tel-wingman-lio': {
      id: 'tel-wingman-lio', from: 'lio-funkel',
      text: 'Hab gehört, jemand braucht Sonnenuntergangsmusik an der Flutmauer? Ich hab ein Set. Es heißt „Hafenbecken der Sehnsucht“. Akustik. Kein Gerede. Fast kein Gerede.',
      auto: und(EPILOG_FREI, AKTIV, { flag: 'wingman_plan' }, { notFlag: 'wingman_musik' }),
      replies: [
        { text: 'Gebucht. Aber wirklich kein Gerede.', effects: [flag('wingman_musik'), flag('wingman_musik_lio'), herz('lio-funkel', 20)] },
        { text: 'Danke, Dante bringt seinen Plattenspieler.', effects: [flag('wingman_musik')] },
      ],
    },
  },
};
