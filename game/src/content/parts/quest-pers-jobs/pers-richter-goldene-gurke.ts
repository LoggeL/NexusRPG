// pers-richter-goldene-gurke · Wer hat die Preisgurke angeknabbert? (world.md §6.5; Start in richter.ts ab ♥2). Bolzen war’s.
// Wege: Spuren lesen (Ölspur, ohne Check), `[Straße 4]` die Kantinenköchin ausfragen, oder gestehen (für Bolzen den Kopf hinhalten).
import type { QuestDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import {
  type Beitrag, L, N, P, active, all, any, beitrag, bye, byId, c, chk, cr, dlg, done, flag, hearts, node, noFlag, rel, set,
  schritt, spotUse, zeit,
} from './_lib';

const Q = 'pers-richter-goldene-gurke';
const AKTIV = active(Q);
const RI = 'richter';
const BOLZEN_DA = done('side-hunde-der-brackbucht');

const quest: QuestDef = {
  id: Q, kind: 'personal', act: 1, giver: RI,
  title: 'Die goldene Gurke',
  summary: 'Die Preisgurke des Richters – „Die Goldene“, 41 Zentimeter – wurde angeknabbert. Kleine, kreisrunde, metallische Zahnspuren. Der Richter will einen Täter.',
  autoStart: hearts(RI, 3),
  steps: [
    {
      id: 'spuren', text: 'Untersuch die Gemüsebeete im Gerichtsgarten (Eisenhof).',
      done: any(flag('gg_spuren'), flag('gg_taeter')), marker: { map: 'eisenhof' },
    },
    schritt('taeter', 'Find heraus, wem die Zahnspuren gehören.', 'gg_taeter', { when: flag('gg_spuren'), marker: { map: 'eisenhof' } }),
    schritt('urteil', 'Berichte dem Richter (Gerichtssaal morgens, Gerichtsgarten tagsüber, Eisenhof abends).', 'gg_fertig',
      { when: flag('gg_taeter'), marker: { map: 'eisenhof' } }),
  ],
  reward: { xp: 120, relations: { richter: 80 } },
};

// ------------------------------------------------------------------------------------------- Spuren
const beet = dlg('pj-gg-beet', [
  node('start', [
    N('Zwischen Tomaten und Zucchini: kleine, runde Abdrücke im Beet, vier pro Schritt, mit Metallkanten. Daneben ein Tropfen Öl, der nach Hafen riecht. Und unter einem Kürbisblatt eine abgekaute Quietsche-Mutter.'),
    P('Vier Beine. Öl. Zähne aus Metall. Und er mag Spielzeug.'),
  ], {
    effects: [set('gg_spuren')],
    choices: [
      c('Der Ölspur folgen.', 'oel'),
      c('Die Köchin der Gerichtskantine fragen. Die sieht alles, was hier rumläuft.', 'koechin', { check: chk('gg-koechin', 'strasse', 4, ['geruecht']) }),
      bye('Erst mal nachdenken.'),
    ],
  }),
  node('oel', [
    N('Die Ölspur führt quer über den Hof, unter dem Zaun durch, an der Kantine vorbei und hinaus Richtung Flutmauer. Alle zehn Meter ein Tropfen. Einmal ein Kreis aus Tropfen, als hätte sich jemand nach seinem Schwanz gedreht.'),
    P('Ein Roboterhund aus der Brackbucht. Und er war stolz auf sich.', 'freude'),
  ], { effects: [zeit(30), set('gg_taeter')] }),
  node('koechin', [
    L('narrator', 'Die Köchin wischt sich die Hände an einer Schürze ab, auf der „SCHULDIG AN ALLEM“ steht.'),
    N('„Na, der Blechköter! Silbern, ein Bein schief, Funken am Schwanz. Hat hier zweimal Wurst geklaut und einmal einen Wachtmeister. Also, den Schuh von einem. Die Gurke hat er angebellt, als wär sie ein Feind.“'),
  ], { effects: [set('gg_taeter')] }),
]);

// ------------------------------------------------------------------------------------------- Urteil
const urteil = beitrag(RI, all(AKTIV, flag('gg_taeter'), noFlag('gg_fertig')), '„Euer Ehren. Ich kenne den Gurkentäter.“', [
  node('gg-r-start', [
    L(RI, 'Endlich! Name! Adresse! Motiv! Ich will alles. Ich hab schon ein Urteil vorgeschrieben. Es ist sehr lang. Es hat Fußnoten.', 'wut'),
  ], {
    choices: [
      c('„Ein Roboterhund aus der Brackbucht. Bolzen. Er hält Gurken für Feinde.“', 'gg-r-bolzen'),
      c('„Ich war’s. Ich hatte Hunger. Und die Gurke sah mich an.“', 'gg-r-gestehen'),
    ],
  }),
  node('gg-r-bolzen', [
    L(RI, 'Ein … HUND. Ein Roboterhund. Mit Zähnen aus Edelstahl. Der meine Gurke für einen Feind hält.', 'ueberrascht'),
  ], {
    choices: [
      c('Bolzen pfeifen. Er kommt mit wedelndem Funkenschwanz.', 'gg-r-hund', { when: BOLZEN_DA }),
      c('„Er wohnt in der Brackbucht. Wollen Sie ihn vorladen?“', 'gg-r-vorladen', { when: { not: BOLZEN_DA } }),
    ],
  }),
  node('gg-r-hund', [
    N('Bolzen setzt sich vor den Richter, legt den Kopf schief und lässt eine Quietsche-Mutter vor seine Füße fallen. Ein Friedensangebot. Oder ein Beweisstück.'),
    L(RI, 'Angeklagter Bolzen. Sie werden beschuldigt, eine Gurke … Hören Sie auf, so zu gucken. Das ist Missachtung des Gerichts. Mit den Augen.', 'verlegen'),
    L(RI, 'Urteil: Freispruch mangels Vorsatz. Und weil er … Paragraf … irgendwas. Schuldig ist nur die Gurke. Weil sie so verlockend war.', 'freude'),
  ], { effects: [rel('bolzen', 40)], next: 'gg-r-ende' }),
  node('gg-r-vorladen', [
    L(RI, 'Einen Hund vorladen. Das Protokoll würde mich auslachen. Kessel würde mich auslachen. Und sie hat eine Strichliste.', 'besorgt'),
    L(RI, 'Nein. Ein Hund ist kein Täter, er ist ein Naturereignis. Wie Rostregen. Ich baue einen Zaun. Schuldig ist der Zaun, der nicht da war.'),
  ], { next: 'gg-r-ende' }),
  node('gg-r-gestehen', [
    L(RI, 'Sie. Sie haben meine Goldene angeknabbert. Mit Ihren … Zähnen.', 'wut'),
    N('Er mustert dein Gebiss. Lange. Er holt ein Lineal. Er misst. Er seufzt.'),
    L(RI, 'Ihre Zähne sind nicht rund. Sie lügen, um jemanden zu schützen. Das ist … Behinderung der Justiz. Und es ist das Anständigste, was ich diese Woche gesehen habe.', 'ueberrascht'),
    L(RI, 'Zwanzig Credits Strafe. Für die Lüge. Und meinen Respekt. Für die Lüge.'),
  ], { effects: [cr(-20), rel(RI, 40)], next: 'gg-r-ende' }),
  node('gg-r-ende', [
    L(RI, 'Fall geschlossen. Nächstes Jahr wird sie größer. Zweiundvierzig Zentimeter. Und ein Zaun. Mit Strom.', 'signatur'),
  ], { effects: [set('gg_fertig')] }),
]);

export const beitraege: Beitrag[] = [urteil];

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: byId(beet),
  mapAdditions: {
    eisenhof: {
      hotspots: [spotUse('pj-gg-beet', 'gemuesebeete', 'Spuren im Beet untersuchen', beet.id, all(AKTIV, noFlag('gg_taeter')))],
    },
  },
};

