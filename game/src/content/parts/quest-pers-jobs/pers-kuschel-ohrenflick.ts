// pers-kuschel-ohrenflick · Captain Kuschels Ohr ist gerissen, Oma Volt flickt (world.md §6.5).
// Wege: `nadel-und-faden` mitbringen, 30 Cr zahlen oder eine Stunde im Kiosk helfen (ohne Check).
import type { QuestDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import {
  type Beitrag, L, N, P, active, all, beitrag, bye, byId, c, cr, dlg, flag, hearts, item, node, noFlag, nochWas, rel, set,
  schritt, spotUse, take, tel, zeit,
} from './_lib';

const Q = 'pers-kuschel-ohrenflick';
const AKTIV = active(Q);
const BEI_NYRA = flag('nyra_hat_kuschel');
const DA = 'dante';
const OV = 'oma-volt';

const quest: QuestDef = {
  id: Q, kind: 'personal', act: 1, giver: 'captain-kuschel',
  title: 'Großes Ohr, kleiner Riss',
  summary: 'Captain Kuschels linkes Ohr ist gerissen. Dante ist in Panik. Oma Volt näht alles – sogar Würde.',
  autoStart: hearts(DA, 3),
  steps: [
    schritt('abholen', 'Hol Captain Kuschel ab (Dantes Werkstatt – oder bei Nyra im Netzcafé, falls er dort wohnt).', 'ok_dabei',
      { marker: { map: 'dantes-werkstatt' } }),
    schritt('flicken', 'Bring Captain Kuschel zu Oma Volt ins Volt-Eck (Neon-Gasse, morgens bis abends).', 'ok_geflickt',
      { when: flag('ok_dabei'), marker: { map: 'neon-gasse' } }),
    schritt('zurueck', 'Bring Captain Kuschel geflickt nach Hause.', 'ok_fertig', { when: flag('ok_geflickt'), marker: { map: 'dantes-werkstatt' } }),
  ],
  reward: { xp: 60, relations: { 'captain-kuschel': 100, dante: 30 } },
};

const notruf = tel('pj-ok-notruf', DA,
  'NOTFALL!!! Captain Kuschel hat sich beim Keksalarm am Blech verfangen. Das linke Ohr. Es hängt. ES HÄNGT, {name}! Ich kann nicht hingucken, ich muss mich hinsetzen. Oma Volt kann nähen. Bring ihn hin. Bitte. Er sagt, es tut nicht weh. Er lügt.',
  {
    auto: all(AKTIV, noFlag('ok_dabei')),
    replies: [
      { text: 'Bin unterwegs. Atme, Dante.', effects: [rel(DA, 10)] },
      { text: 'Ist doch nur ein Plüschhase.', effects: [rel(DA, -20), rel('captain-kuschel', -20)] },
    ],
  });

// ------------------------------------------------------------------------------------------- Abholen
const abholen = dlg('pj-ok-abholen', [
  node('start', [
    N('Captain Kuschel sitzt auf seinem Kissen, sehr aufrecht, sehr würdevoll. Das linke Ohr hängt an drei Fäden. Das rechte steht senkrecht – das heißt: „Alles im Griff.“ Es ist nicht alles im Griff.'),
  ], {
    choices: [
      c('Ihn vorsichtig hochnehmen.', 'dante', { when: not_nyra() }),
      c('Ihn vorsichtig hochnehmen.', 'nyra', { when: BEI_NYRA }),
    ],
  }),
  node('dante', [
    L(DA, '(aus der Küche, mit einem nassen Lappen auf der Stirn) Halt seinen Kopf! Nicht das Ohr! Den Kopf! Er ist empfindlich am Kopf!', 'besorgt'),
    P('Ich hab ihn. Er ist ruhig.'),
    L(DA, 'ER ist ruhig. Ich nicht. Geh. Geh, bevor ich wieder hinsehe.', 'trauer'),
  ], { effects: [set('ok_dabei')] }),
  node('nyra', [
    L('nyra', 'Pass auf. Er beißt nicht, aber er guckt so, dass man sich entschuldigt.', 'besorgt'),
    L('nyra', 'Ich hätte es selbst genäht. Aber ich nähe nur Code. Und der hält auch nicht.'),
  ], { effects: [set('ok_dabei'), rel('nyra', 10)] }),
]);

function not_nyra() { return { not: BEI_NYRA }; }

const zurueck = dlg('pj-ok-zurueck', [
  node('start', [
    N('Du setzt Captain Kuschel zurück auf sein Kissen. Das linke Ohr hat jetzt eine Naht aus rotem Garn, wie ein Blitz. Er hebt es, langsam. Es bleibt oben.'),
  ], {
    choices: [
      c('Weiter.', 'dante', { when: not_nyra() }),
      c('Weiter.', 'nyra', { when: BEI_NYRA }),
    ],
  }),
  node('dante', [
    L(DA, 'Ist er … ist er … HEILIGES KANONENROHR, ER HAT EINE NARBE! Er sieht aus wie ein Pirat! Ein Kampfhase! Captain Kuschel, du bist jetzt offiziell der härteste Hase der Unterstadt!', 'freude'),
    N('Am nächsten Morgen liegt ein Zettel auf deinem Platz in der Werkstatt, mit Wachsmalstift: „Danke. Das Ohr hört jetzt besser. – C. K.“'),
  ], { effects: [set('ok_fertig')] }),
  node('nyra', [
    L('nyra', 'Rot. Gute Wahl. Sieht aus wie ein Fehlerbalken, den man nicht wegklicken will.', 'freude'),
    N('Später findest du in deiner Jackentasche einen Zettel, mit Wachsmalstift: „Danke. Das Ohr hört jetzt besser. – C. K.“'),
  ], { effects: [set('ok_fertig'), rel('nyra', 15)] }),
]);

// ------------------------------------------------------------------------------------------- Oma Volt
const omaVolt = beitrag(OV, all(AKTIV, flag('ok_dabei'), noFlag('ok_geflickt')), 'Captain Kuschel auf den Tresen setzen. „Notfall, Oma.“', [
  node('ok-ov-start', [
    L(OV, 'Ach du liebes bisschen. Kindchen, was habt ihr mit dem Hasen gemacht? Der guckt ja, als hätt man ihm das Taschengeld gestrichen.', 'besorgt'),
    L(OV, 'Das krieg ich hin. Ich hab schon Lederjacken geflickt, Fallschirme und einmal einen Polizisten. Aber Garn kostet, Nadeln kosten, und meine Augen kosten am meisten.'),
  ], {
    choices: [
      c('Nadel und Faden aus der Tasche holen. „Hab alles dabei.“', 'ok-ov-naht', { when: item('nadel-und-faden'), effects: [take('nadel-und-faden'), rel(OV, 40)] }),
      c('„Dreißig Credits. Für die Augen.“', 'ok-ov-naht', { requires: { credits: 30 }, effects: [cr(-30)] }),
      c('„Ich helf dir eine Stunde im Kiosk. Dafür nähst du.“', 'ok-ov-helfen'),
    ],
  }),
  node('ok-ov-helfen', [
    N('Du schleppst Kisten mit Blitzbrause, sortierst Kaugummi nach Haltbarkeitsdatum (manche nach Jahrzehnt) und verkaufst einem Abzieher eine Zeitung. Er wollte keine. Er hat trotzdem bezahlt.'),
    L(OV, 'Na also. Du hast Talent, Kindchen. Zum Schleppen. Jetzt halt den Kopf von dem Kerl.'),
  ], { effects: [zeit(60), rel(OV, 20)], next: 'ok-ov-naht' }),
  node('ok-ov-naht', [
    N('Oma Volt setzt die Brille auf, dann eine zweite darüber. Sie fädelt roten Faden ein, ohne hinzusehen. Captain Kuschel hält still. Er hält so still, wie nur ein Plüschhase stillhalten kann, der weiß, dass er gerettet wird.'),
    L(OV, 'So. Rotes Garn. Damit jeder sieht, dass er was erlebt hat. Wer keine Narben hat, hat nicht gelebt. Sag das Dante. Und sag ihm, er soll sein Backblech entgraten.', 'freude'),
  ], { effects: [set('ok_geflickt')], choices: [nochWas(), bye('Danke, Oma.')] }),
]);

export const beitraege: Beitrag[] = [omaVolt];

const rueckWann = all(AKTIV, flag('ok_geflickt'), noFlag('ok_fertig'));

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: byId(abholen, zurueck),
  phone: byId(notruf),
  mapAdditions: {
    'dantes-werkstatt': {
      hotspots: [
        spotUse('pj-ok-kuschel-holen', 'kuschel-regal', 'Captain Kuschel einpacken', abholen.id, all(AKTIV, noFlag('ok_dabei'), not_nyra())),
        spotUse('pj-ok-kuschel-bringen', 'kuschel-regal', 'Captain Kuschel zurücksetzen', zurueck.id, all(rueckWann, not_nyra())),
      ],
    },
    'netzcafe-datenkruemel': {
      hotspots: [
        spotUse('pj-ok-kuschel-holen-nyra', 'nyras-platz', 'Captain Kuschel einpacken', abholen.id, all(AKTIV, noFlag('ok_dabei'), BEI_NYRA)),
        spotUse('pj-ok-kuschel-bringen-nyra', 'nyras-platz', 'Captain Kuschel zurücksetzen', zurueck.id, all(rueckWann, BEI_NYRA)),
      ],
    },
  },
};

