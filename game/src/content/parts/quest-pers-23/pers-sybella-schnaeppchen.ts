// pers-sybella-schnaeppchen · „Das Schnäppchen“ (world.md §6.5, Sybella, Akt 2). Start in Sybellas Gespräch
// (npc-quantum/sybella-chrome.ts). Dantes alte Espressomaschine mit Messingadler steht bei Sybellas verkleidetem
// Flohmarktstand (Schrottmarkt, Di/Sa abends, So tagsüber am Flohmarkt). Wege: `[Straße 6]` feilschen, Tausch gegen
// `vinyl-platte`, `[Sybella ♥4]` Selbstkostenpreis, voller Preis 400 Cr oder ohne Geld einen Tag am Stand aushelfen.
import type { QuestDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import {
  L, N, P, active, all, any, bye, byId, c, cc, chk, cr, credits, cut, dlg, ding, flag, give, hearts, item, karten, msg, node,
  noItem, rede, rel, schritt, set, szene, tafel, tage, take, time, zeit,
} from './_lib';

const Q = 'pers-sybella-schnaeppchen';
const SY = 'sybella-chrome';
const DA = 'dante';
const MASCH = 'p23-espressomaschine';
const AKTIV = active(Q);
const HAT = any(item(MASCH), flag('sbs_zurueck'));

const quest: QuestDef = {
  id: Q, kind: 'personal', act: 2, giver: SY,
  title: 'Das Schnäppchen',
  summary: 'Dantes alte Espressomaschine mit dem Messingadler ist bei Sybella Chrome gelandet. Die verkauft sie verkleidet auf dem Schrottmarkt, an einem Stand mit falschem Schnurrbart. Sie verschenkt nichts. Aber sie verkauft alles.',
  steps: [
    schritt('dante', 'Optional: Frag Dante nach seiner alten Espressomaschine (Werkstatt, tagsüber).', 'sbs_dante', ['dantes-werkstatt', 'werkbank'], { optional: true }),
    schritt('kaufen', 'Kauf die Maschine an Sybellas verkleidetem Stand (Schrottmarkt Di/Sa abends, So tagsüber am Flohmarkt).', HAT, ['schrottmarkt', 'sybella-verkleidet']),
    schritt('zurueck', 'Bring Dante die Espressomaschine (Werkstatt, tagsüber).', 'sbs_zurueck', ['dantes-werkstatt', 'werkbank'], { when: HAT }),
  ],
  reward: { xp: 280, relations: { [SY]: 100, [DA]: 60 }, rep: { unterstadt: 3 } },
};

const maschine = ding(MASCH, 'Espressomaschine mit Messingadler', 'Ein Siebträger aus Chrom und Messing, auf dem Deckel ein Adler mit abgebrochener Schwanzfeder. Wiegt so viel wie ein kleiner Mensch. Riecht nach dreißig Jahren Kaffee.', 'schrott-ersatzteil');

// ------------------------------------------------------------------------------------------- Dante (Vorgeschichte)
const danteFrage = dlg('p23-sbs-dante-frage', [
  node('start', [
    L(DA, 'Die Adler-Maschine? Die hab ich versetzt. Vor drei Wintern. Für Ersatzteile und Miete. Ich hab mir gesagt: „Dante, ist nur eine Maschine.“ Dante hat gelogen.', 'trauer'),
    L(DA, 'Die hat jeden Morgen gezischt wie eine wütende Katze. Ich hab mit ihr geredet. Sie hat zurückgezischt. Das war die beste Beziehung, die ich je hatte. Sag das nicht Raven.', 'verlegen'),
  ], { effects: [set('sbs_dante')] }),
]);

// ------------------------------------------------------------------------------------------- Sybellas Stand
const stand = dlg('p23-sbs-stand', [
  node('start', [
    N('Zwischen Kabelrollen und Topfdeckeln: ein Stand mit Samtdecke. Dahinter eine Frau mit Sonnenbrille, Kopftuch und einem angeklebten Schnurrbart, der links abgeht. Auf dem Tisch, ganz vorn, im Licht: ein Siebträger mit Messingadler. Preisschild: „400 Cr. Antik. Kein Umtausch.“'),
    L(SY, 'Willkommen bei … äh … Sybillo! Sybillo Schrott! Hier gibt es Schnäppchen! Für Leute mit Geschmack und ohne Kassenbon!', 'signatur'),
  ], {
    choices: [
      c('„Sybella. Dein Bart geht ab.“', 'bart'),
      cc('Feilschen. Mängel aufzählen. Viele Mängel. Erfundene auch.', 'feilschen', chk('sbs-feilschen', 'strasse', 6, ['feilschen', 'handeln'])),
      c('Die Vinylplatte auf den Tisch legen. „Tausch?“', 'vinyl', { when: item('vinyl-platte'), effects: [take('vinyl-platte'), give(MASCH)] }),
      c('„Für Dante. Selbstkostenpreis?“', 'freundin', { tag: '[Sybella ♥4]', requires: hearts(SY, 4) }),
      c('Vierhundert Credits hinlegen.', 'voll', { requires: credits(400), effects: [cr(-400), give(MASCH)] }),
      c('„Ich hab kein Geld. Aber ich kann verkaufen.“', 'aushilfe'),
      bye('Weitergehen.'),
    ],
  }),
  node('bart', [
    L(SY, 'Der Bart ist ein Statement. Und ich bin nicht Sybella. Sybella würde nie auf einem Schrottmarkt verkaufen. Sybella hat ein Haus mit vier Balkonen.', 'verlegen'),
    L(SY, 'Sybillo dagegen liebt den Schrottmarkt. Hier verhandelt man noch mit Gefühl. Oben verhandelt man mit Anwälten.'),
  ], { next: 'start' }),
  node('feilschen', [
    P('Die Schwanzfeder ist ab. Der Dampfhahn klemmt. Der Adler schielt. Und das Ding wiegt so viel, dass mich die Rückenschmerzen allein hundert Credits kosten.'),
    L(SY, 'Der Adler schielt NICHT. Er … fixiert. Hundertfünfzig. Und du sagst niemandem, dass er schielt.', 'wut'),
  ], {
    choices: [
      c('Hundertfünfzig zahlen.', 'gekauft', { requires: credits(150), effects: [cr(-150), give(MASCH)] }),
      c('„Zu viel. Ich komm wieder.“'),
    ],
  }),
  node('vinyl', [
    L(SY, 'Eine Platte! Echtes Vinyl! Das ist ja … das ist ja Markenpiraterie! Nein. Das ist echt. Oh. Abgemacht. Sag keinem, dass ich gerührt bin.', 'freude'),
  ], { next: 'gekauft' }),
  node('freundin', [
    L(SY, 'Selbstkostenpreis. Für den Typen mit den Keksen. … Ich hab vierzig bezahlt. Ich sag dir das nur, weil mein Bart gerade abfällt und ich verletzlich bin.', 'verlegen'),
  ], {
    choices: [
      c('Vierzig Credits geben.', 'gekauft', { requires: credits(40), effects: [cr(-40), give(MASCH), rel(SY, 20)] }),
      c('„Lass mich erst sparen.“'),
    ],
  }),
  node('aushilfe', [
    L(SY, 'Verkaufen? Du? Gut. Ein Tag hinter dem Stand. Wenn du mehr umsetzt als ich, kriegst du den Adler. Wenn nicht, kriegst du eine Lektion.', 'signatur'),
  ], {
    choices: [
      c('Einen Tag lang Topfdeckel, Kabel und „antike“ Schrauben verkaufen.', 'tag', { effects: [zeit(360), give(MASCH), rel(SY, 20)] }),
      c('„Ein andermal.“'),
    ],
  }),
  node('tag', [
    N('Du verkaufst einer Großmutter drei Topfdeckel, einem Rostzahn eine „Kampfschraube“ und einem Touristen aus der Oberstadt einen Stein mit Aufkleber. Sybella notiert alles in einem Kassenbuch, mit Soll und Haben. Am Abend lacht sie so laut, dass der Bart abfällt.'),
    L(SY, 'Du hast mehr umgesetzt als ich. Mit Steinen. Nimm den Adler. Und komm nie wieder, du bist Konkurrenz.', 'freude'),
  ]),
  node('voll', [L(SY, 'Voller Preis! Ohne zu feilschen! Du bist mein Lieblingskunde und meine größte Enttäuschung zugleich.', 'freude')], { next: 'gekauft' }),
  node('gekauft', [N('Sybella wickelt die Maschine in Zeitungspapier, das „Chrome-Kurier“ heißt, und gibt sie dir mit einer Verbeugung. Der Schnurrbart hängt jetzt nur noch an einer Ecke.')], { effects: [msg('Dantes Espressomaschine eingepackt. Sie ist schwer.')] }),
]);

// ------------------------------------------------------------------------------------------- Rückgabe an Dante
const rueckgabe = dlg('p23-sbs-dante', [
  node('start', [
    N('Du stellst das Paket auf die Werkbank. Dante wickelt aus. Er hört auf zu reden. Das hast du bei Dante noch nie gehört.'),
    L(DA, 'Der Adler. Die Feder ist immer noch ab. Ich hab sie damals abgebrochen, als ich die Maschine nachts um drei zum Laufen bringen wollte. Wo hast du …', 'ueberrascht'),
  ], {
    choices: [
      c('„Sybillo Schrott. Lange Geschichte. Falscher Bart.“', 'sybella'),
      c('„Mach Kaffee. Bitte.“', 'kaffee'),
    ],
  }),
  node('sybella', [L(DA, 'Sybella CHROME? Auf dem Schrottmarkt? Mit Bart? Ich muss sofort ein Gedicht darüber schreiben. Nein, erst Kaffee.', 'freude')], { next: 'kaffee' }),
  node('kaffee', [], { effects: [take(MASCH), set('sbs_zurueck'), cut('p23-sbs-kaffee')] }),
]);

const kaffee = szene('p23-sbs-kaffee', 'Die Adler-Maschine', [
  tafel('Dantes Werkstatt. Die Maschine zischt. Dante zischt zurück.', [
    L(DA, 'Hörst du das? Sie hat mich vermisst.'),
    N('Der erste Espresso schmeckt nach Rost und nach Erinnerung. Der zweite nach Kaffee. Den dritten trinkt Dante nicht, er stellt ihn auf das Fensterbrett, für Jimmy.'),
  ]),
  tafel('Am nächsten Morgen steht vor Sybellas Penthouse ein Paket. Darin: eine Dose Kekse, drei Sekunden alt, und ein Zettel.', [
    N('„Für Sybillo. Der Adler schielt. Danke. – D.“'),
  ], 1600),
], [set('dante_espresso_zurueck'), msg('Dantes Werkstatt hat wieder eine Espressomaschine.')]);

export const part: ContentPart = {
  quests: { [Q]: quest },
  items: { [MASCH]: maschine },
  dialogues: byId(danteFrage, stand, rueckgabe),
  cutscenes: { [kaffee.id]: kaffee },
  mapAdditions: karten([
    ['dantes-werkstatt', rede('p23-sbs-dante-frage', 'werkbank', 'Dante nach der Espressomaschine fragen', danteFrage.id,
      all(AKTIV, { notFlag: 'sbs_dante' }, noItem(MASCH), { notFlag: 'sbs_zurueck' }, time('tag')))],
    ['schrottmarkt', rede('p23-sbs-stand', 'sybella-verkleidet', '„Sybillo Schrott“ ansprechen', stand.id,
      all(AKTIV, { not: HAT }, time('abend'), tage('di', 'sa')))],
    ['schrottmarkt', rede('p23-sbs-stand-so', 'flohmarkt', '„Sybillo Schrott“ ansprechen', stand.id,
      all(AKTIV, { not: HAT }, time('tag'), tage('so')))],
    ['dantes-werkstatt', rede('p23-sbs-dante', 'werkbank', 'Dante die Espressomaschine geben', rueckgabe.id,
      all(AKTIV, item(MASCH), time('morgen', 'tag', 'abend')))],
  ]),
};
