// Party-Vorbereitung prep-outfits „Nicht in diesen Lumpen“ (world.md §5.3). Stylistin Gina, stufenplatz:salon-gina.
// Wege: 300 Cr schlicht (outfit-ordentlich, outfits_schlicht → Ausstrahlung +1 auf der Party) · 1200 Cr Glanz
// (outfit-party, outfits_glanz → +2) · Rabatt auf 800 über gina_modell / peruecke_gina oder einen eigenen
// Ausstrahlung-Check · ohne Geld: Modell stehen für Ginas Schaufenster (Wartezeit, ohne Check).
// Aria trägt ihr Shirt drunter (aria_shirt_drunter). Abschluss-Flag prep_outfits (main-3-einlass wertet es aus).
import type { ContentPart } from '../../part';
import type { DialogueDef, Effect, QuestDef } from '../../../modules/contracts';
import { PLAN_STEHT, active, all, any, dlg, flag, herz, l, msg, nar, node, not, pruef, set } from './_lib';

const Q = 'prep-outfits';
const AKTIV = active(Q);
const FERTIG = flag('prep_outfits');
const RABATT = any(flag('gina_modell'), flag('peruecke_gina'), flag('outfits_rabatt'));

const ginaCharme = pruef('prep-outfits-charme', 'ausstrahlung', 6, ['ueberreden', 'etikette']);

const quest: QuestDef = {
  id: Q,
  kind: 'main',
  title: 'Nicht in diesen Lumpen',
  summary: 'Hunter sagt, wir sehen aus wie ein Unfall im Altkleidercontainer. Stylistin Gina am Stufenplatz macht Wunder. Wunder kosten.',
  giver: 'hunter',
  act: 2,
  autoStart: PLAN_STEHT,
  steps: [
    {
      id: 'gina',
      text: 'Zu Stylistin Gina in den Salon am Stufenplatz. Schlicht für 300 Credits oder Glanz für 1200.',
      done: FERTIG,
      marker: { map: 'stufenplatz', at: 'salon-gina' },
    },
  ],
  reward: { xp: 120, relations: { 'stylistin-gina': 40 } },
};

const ABSCHLUSS: Effect[] = [set('prep_outfits'), set('aria_shirt_drunter')];

const gina: DialogueDef = dlg('m2-prep-gina', [
  node('start', [
    nar('Salon Gina. Spiegel bis zur Decke, Stoffbahnen in Farben, die es in der Unterstadt nicht gibt. Gina umkreist dich mit einem Maßband wie ein Hai mit Diplom.'),
    l('stylistin-gina', 'Hunter hat angerufen. Er hat nicht übertrieben. Wer hat dir das angezogen? Ein Feind?', 'ueberrascht'),
    l('stylistin-gina', 'Also. Schlicht: dreihundert, ihr seht aus wie Leute mit Termin. Glanz: zwölfhundert, ihr seht aus wie Leute, denen der Termin gehört.', 'signatur'),
  ], {
    choices: [
      { text: '„Schlicht. Dreihundert.“', requires: { credits: 300 }, effects: [{ credits: -300 }, { give: 'outfit-ordentlich' }, set('outfits_schlicht')], next: 'schlicht' },
      { text: '„Glanz. Zwölfhundert.“', requires: { credits: 1200 }, effects: [{ credits: -1200 }, { give: 'outfit-party' }, set('outfits_glanz')], next: 'glanz' },
      { text: '„Glanz. Für achthundert. Weil wir Freunde sind.“', tag: '[Rabatt]', when: RABATT, requires: { credits: 800 }, effects: [{ credits: -800 }, { give: 'outfit-party' }, set('outfits_glanz')], next: 'glanz' },
      { text: '„Gina. Du siehst heute aus wie die Oberstadt, nur mit Geschmack. Achthundert für Glanz?“', check: ginaCharme, when: not(RABATT), effects: [set('outfits_rabatt')], next: 'rabatt' },
      { text: '„Ich hab kein Geld. Aber ich hab ein Gesicht.“', next: 'modell' },
      { text: '„Ich komm wieder.“' },
    ],
  }),
  node('rabatt', [
    l('stylistin-gina', 'Schmeichler. Das funktioniert bei mir nie. … Achthundert. Und du erzählst das keinem.', 'verlegen'),
  ], { next: 'start' }),
  node('modell', [
    l('stylistin-gina', 'Ein Gesicht. Hm. Dreh dich. Nochmal. Das linke Profil ist ein Verbrechen, das rechte geht.', 'neutral'),
    l('stylistin-gina', 'Deal. Du stehst einen Nachmittag in meinem Schaufenster und bewegst dich nicht. Dafür kriegst du Schlicht. Umsonst.', 'signatur'),
  ], {
    choices: [
      { text: '(Stillstehen. Vier Stunden.)', effects: [{ advanceTime: 240 }, { give: 'outfit-ordentlich' }, set('outfits_schlicht'), set('gina_modell'), herz('stylistin-gina', 30)], next: 'schaufenster' },
      { text: '„Vier Stunden? Vergiss es.“', next: 'start' },
    ],
  }),
  node('schaufenster', [
    nar('Vier Stunden im Schaufenster. Eine Oma klopft gegen die Scheibe und fragt, ob du echt bist. Ein Kind leckt das Glas ab. Ein Mann im Anzug fotografiert dich und schickt das Bild jemandem mit „Das will ich“.'),
  ], { next: 'schlicht' }),
  node('schlicht', [
    l('stylistin-gina', 'Schlicht. Sauber. Unauffällig. Der Türsteher wird dich vergessen, bevor du an ihm vorbei bist. Das ist auch eine Kunst.', 'neutral'),
  ], { next: 'aria' }),
  node('glanz', [
    l('stylistin-gina', 'Glanz. Seide, Schnitt, ein Hauch Verachtung im Kragen. Damit lächeln dich Leute an, die dich sonst überfahren würden.', 'freude'),
  ], { next: 'aria' }),
  node('aria', [
    nar('Hinter dem Vorhang flucht jemand. Aria kommt heraus, im Partykleid. Darunter, am Ausschnitt deutlich zu sehen: ihr altes Bandshirt.'),
    l('stylistin-gina', 'Was ist DAS?', 'wut'),
    l('aria', 'Glücksshirt. Bleibt drunter. Oder ich geh nackt. Such’s dir aus.', 'signatur'),
    l('stylistin-gina', '… Lass es drunter. Wir nennen es „Statement“.', 'trauer'),
  ], { effects: [...ABSCHLUSS, herz('aria', 20), msg('Outfits für die Releaseparty: erledigt.')] }),
]);

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: { [gina.id]: gina },
  checks: { [ginaCharme.id]: ginaCharme },
  mapAdditions: {
    stufenplatz: {
      hotspots: [
        { id: 'm2-prep-gina', at: 'salon-gina', label: 'Salon Gina: Party-Outfits', kind: 'talk', dialogue: gina.id, when: all(AKTIV, not(FERTIG)) },
      ],
    },
  },
};
