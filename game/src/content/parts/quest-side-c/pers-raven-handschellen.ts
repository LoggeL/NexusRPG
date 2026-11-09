// pers-raven-handschellen · „Handschellen“ (world.md §6.2 Nr. 24). Start: Ravens Tagesgespräch (npc-crew-a/raven.ts, ab ♥3).
// Raven hat die Handschelle von damals als „persönlichen Besitz“ zurückbekommen → Seriennummer → Sonderanfertigung für
// die Chrome-Familie: Blade kannte die Schwestern schon vor dem Bruch.
// Wege: gc-85 [Straße 6] Hehler über Fräulein Pixel (oder 80 Cr Vermittlung) · behoerdenkarte am Behördenterminal im
// Eisenhof (Hotspot der Zone setzt handschellen_seriennummer) · presseausweis bzw. Nougatbombe bei der Chrome-Haushälterin.
import type { ContentPart } from '../../part';
import type { DialogueDef, QuestDef } from '../../../modules/contracts';
import { active, all, any, ch, dlg, flag, herz, item, l, n, noFlag, node, not, p, set } from './_q';

const Q = 'pers-raven-handschellen';
const RA = 'raven';
const HH = 'chrome-haushaelterin';
const SPUR = any(flag('handschellen_seriennummer'), flag('handschellen_hehler'), flag('handschellen_haushaelterin'));
const WEISS = 'handschellen_raven_weiss';
const SUCHE = all(active(Q), not(SPUR));
const ERZAEHLEN = all(active(Q), SPUR, noFlag(WEISS));

/** Ist Raven in der Party, hört sie gleich mit. */
const ENDE = [
  ch('Raven steht neben dir. Ihr sofort sagen.', 'wahrheit', { when: { companion: RA } }),
  ch('Gehen. Raven muss das erfahren.', undefined, { when: not({ companion: RA }) }),
];

const quest: QuestDef = {
  id: Q,
  kind: 'personal',
  title: 'Handschellen',
  summary: 'Raven hat ihre Handschelle von damals zurück. In einer Tüte, mit Quittung. Innen eine Seriennummer: Sonderanfertigung. Für wen?',
  giver: RA,
  act: 1,
  steps: [
    { id: 'spur', text: 'Finde heraus, für wen die Handschelle maßgefertigt wurde.', done: SPUR },
    {
      id: 'weg-hehler', optional: true, when: not(SPUR),
      text: 'Weg: Fräulein Pixel im Fotoautomaten am Bahnhof Mitte (abends, nachts) kennt jeden Hehler der Stadt.',
      done: flag('handschellen_hehler'), marker: { map: 'bahnhof-mitte', at: [450, 290] },
    },
    {
      id: 'weg-behoerde', optional: true, when: not(SPUR),
      text: 'Weg: Mit einer Behördenkarte die Seriennummer am Behördenterminal im Eisenhof prüfen.',
      done: flag('handschellen_seriennummer'), marker: { map: 'eisenhof', at: [872, 345] },
    },
    {
      id: 'weg-haushaelterin', optional: true, when: not(SPUR),
      text: 'Weg: Die Haushälterin der Chrome-Schwestern macht tags Pause auf einer Bank im Glaspark der Glasarkaden. Sie redet gern. Mit den richtigen Leuten.',
      done: flag('handschellen_haushaelterin'), marker: { map: 'glasarkaden', at: [365, 528] },
    },
    {
      id: 'raven', text: 'Sag Raven, was du herausgefunden hast (abends an der Bar im High Voltage, morgens und nachts auf der Dachterrasse).',
      when: SPUR, done: flag(WEISS), marker: { map: 'high-voltage', at: [250, 470] },
    },
  ],
  reward: {
    xp: 200,
    relations: { [RA]: 100 },
    effects: [set('blade_kannte_chrome'), set('raven_handschellen_trick_plus')],
  },
};

// ---------------------------------------------------------------------------------------------- Fräulein Pixel

const pixel: DialogueDef = dlg('handschellen-pixel', [
  node('start', [
    n('Der Fotoautomat summt. Hinter dem Vorhang sitzt Fräulein Pixel zwischen Laminiergerät, Stempelkissen und siebzehn falschen Personalausweisen, die zum Trocknen an einer Wäscheleine hängen.'),
    l('fraeulein-pixel', 'Vier Fotos, zehn Credits. Ein neues Leben, verhandelbar. Was darf’s sein, Schätzchen?', 'neutral'),
    p('Eine Seriennummer. HS-0815-C. Handschellen, Sonderanfertigung. Ich will wissen, wer die bestellt hat.'),
    l('fraeulein-pixel', 'Handschellen. Maßgefertigt. Uuuh. Da will jemand jemanden ganz persönlich festhalten.', 'freude'),
  ], {
    choices: [
      ch('„Du kennst jemanden, der jemanden kennt. Und der kennt den Schlosser.“', 'strasse', { check: 'gc-85' }),
      ch('„Was kostet ein Name?“ (80 Cr)', 'zahlen', { requires: { credits: 80 }, effects: [{ credits: -80 }] }),
      ch('„Vergiss es.“'),
    ],
  }),
  node('strasse', [
    l('fraeulein-pixel', 'Du redest wie jemand, der schon mal hinter einem Vorhang gesessen hat. Gefällt mir.', 'signatur'),
  ], { next: 'anruf' }),
  node('zahlen', [
    n('Sie zählt die Credits zweimal, faltet einen Schein zu einem kleinen Kranich und stellt ihn auf das Laminiergerät.'),
  ], { next: 'anruf' }),
  node('anruf', [
    n('Fräulein Pixel tippt eine Nummer in ein Telefon, das älter ist als du. Sie flüstert. Sie lacht. Sie sagt „Nein, DU bist ein Schlitzohr“ und legt auf.'),
    l('fraeulein-pixel', 'Der alte Schlosser Lindqvist aus dem Mittelring. Feinmechanik, nur Maßarbeit, nur für ganz oben. Vor sieben Jahren: ein Paar Handschellen mit Chrome-Monogramm innen im Ring.', 'neutral'),
    l('fraeulein-pixel', 'Bestellt vom Haushalt Chrome. Abgeholt von einem Charmeur mit Lächeln wie ein Rasiermesser. Unterschrift: ein großes, schwungvolles B.', 'signatur'),
    p('Blade.'),
    l('fraeulein-pixel', 'Ich nenne keine Namen. Ich fälsche sie nur.', 'freude'),
  ], { effects: [set('handschellen_hehler'), herz('fraeulein-pixel', 10)], choices: ENDE }),
]);

// ---------------------------------------------------------------------------------------------- Chrome-Haushälterin

const haushaelterin: DialogueDef = dlg('handschellen-haushaelterin', [
  node('start', [
    n('Auf der Bank im Glaspark sitzt eine Frau in gestärkter Schürze, isst ein Gurkensandwich ohne Rinde und wirft den Tauben die Rinde zu. Die Tauben hier fangen sie im Flug. Mit Haltung.'),
    l(HH, 'Ich rede nicht mit Leuten mit solchen Schuhen. Die gnädigen Frauen merken das. Die riechen Unterstadt durch drei Etagen Marmor.', 'neutral'),
  ], {
    choices: [
      ch('Den Presseausweis zücken. „NX-1. Reportage: Die stillen Heldinnen der Oberstadt.“', 'presse', { tag: '[Presseausweis]', requires: item('presseausweis') }),
      ch('Eine Nougatbombe neben sie auf die Bank legen.', 'nougat', { requires: item('nougatbombe'), effects: [{ take: 'nougatbombe' }] }),
      ch('Gehen.'),
    ],
  }),
  node('presse', [
    l(HH, 'Presse? Heldinnen? Ich?', 'ueberrascht'),
    n('Sie richtet sich die Schürze, als stünde schon die Kamera vor ihr. Die Tauben rücken zusammen, falls sie mit aufs Bild kommen.'),
    l(HH, 'Dreißig Jahre Haus Chrome. Drei Schwestern, drei Farben, drei Mal am Tag die Teppichfransen gekämmt. Fragen Sie. Ich weiß ALLES.', 'freude'),
  ], { next: 'frage' }),
  node('nougat', [
    l(HH, 'Eine Nougatbombe? Ich darf das nicht. Die gnädige Frau Serenity zählt meine Kalorien. Mit einer App.', 'besorgt'),
    n('Sie isst sie in zwei Bissen. Mit geschlossenen Augen. Danach sieht sie dich an wie eine Verbündete.'),
    l(HH, 'Na gut. Was wollen Sie wissen? Aber schnell. Meine Pause dauert noch sieben Minuten und dreißig Sekunden.', 'signatur'),
  ], { next: 'frage' }),
  node('frage', [
    p('Vor sieben Jahren. Maßgefertigte Handschellen, Chrome-Monogramm. Für wen?'),
    l(HH, 'Ach, DIE. Daran erinnere ich mich. Ich musste das Monogramm vorher absegnen lassen. Blaues C, nicht rotes. Gab einen Riesenstreit.', 'neutral'),
    l(HH, 'Bestellt hat sie die gnädige Frau Seraphina. „Ein Geschenk für einen Geschäftsfreund“, hat sie gesagt. So ein Charmanter. Kam immer durch den Lieferanteneingang, nie durch die Tür. Hat mir einmal die Hand geküsst. Ich hab sie drei Tage nicht gewaschen.', 'freude'),
    l(HH, 'Blade, haben ihn die Schwestern genannt. Er wusste damals schon, wie man in der Oberstadt lächelt. Er war oft da. Sehr oft. Lange vor dieser hässlichen Sache bei Digitech.', 'besorgt'),
    l(HH, 'Und jetzt muss ich gehen. Die Fransen kämmen sich nicht von allein. Erwähnen Sie mich nicht in der Reportage. Oder doch. Mit gutem Foto.', 'signatur'),
  ], { effects: [set('handschellen_haushaelterin'), herz(HH, 10)], choices: ENDE }),
]);

// ---------------------------------------------------------------------------------------------- Raven erfährt es

const wahrheitNodes = [
  node('wahrheit', [
    p('Die Handschelle. Sonderanfertigung für Haus Chrome. Bestellt von Seraphina. Abgeholt von Blade. Vor dem Bruch.'),
    n('Raven sagt erst mal nichts. Sie nimmt die Handschelle aus der Jackentasche und dreht sie im Licht. Innen, im Ring, ganz fein graviert: ein blaues C.'),
    l(RA, 'Ein Geschenk. Für einen Geschäftsfreund.', 'wut'),
    l(RA, 'Blade hat nicht improvisiert. Der hatte die Dinger schon in der Tasche, als er mit uns den Plan durchgegangen ist. Als er mir den Kaffee geholt hat. Als er „Wir sind eine Familie“ gesagt hat.', 'wut'),
    l(RA, 'Er wusste, dass er mich an das Rohr kettet. Wochen vorher. Und die Chrome-Schwestern wussten es auch.', 'trauer'),
  ], {
    choices: [
      ch('„Das war nicht deine Schuld.“', 'schuld'),
      ch('„Dann statten wir den Schwestern mal einen Besuch ab.“', 'besuch'),
      ch('Nichts sagen. Neben ihr stehen bleiben.', 'stehen'),
    ],
  }),
  node('schuld', [
    l(RA, 'Doch. Ich hab ihm vertraut. Das ist der zweihundertste Fehler auf der Liste. Der wichtigste.', 'trauer'),
    l(RA, '… Aber danke. Billige Lüge. Aber eine nette.', 'zaertlich'),
  ], { next: 'schluss' }),
  node('besuch', [
    l(RA, 'Nicht jetzt. Nicht so. Wenn ich in die Oberstadt geh, dann nicht wütend. Wütende Leute machen Fehler. Und ich hab genug Fehler gemacht für drei Leben.', 'signatur'),
    l(RA, 'Aber irgendwann. Und dann wird Seraphina sich wünschen, sie hätte rotes C genommen.', 'signatur'),
  ], { next: 'schluss' }),
  node('stehen', [
    n('Du bleibst einfach da. Eine Minute. Zwei. Raven atmet aus, so lange, als hätte sie sieben Jahre die Luft angehalten.'),
    l(RA, 'Du redest nicht. Das ist gut. Die meisten reden.', 'zaertlich'),
  ], { effects: [herz(RA, 20)], next: 'schluss' }),
  node('schluss', [
    n('Raven lässt die Handschelle aufschnappen und wieder zu. Klick. Klick. Dann steckt sie sie weg, mit einer Bewegung, die du nicht kommen siehst.'),
    l(RA, 'Weißt du, was ich mit dem Ding mach? Ich lern es auswendig. Jeden Mechanismus. Jede Feder.', 'signatur'),
    l(RA, 'Wenn Blade mir je wieder Handschellen anlegen will, sind sie offen, bevor er „Tut mir leid“ sagen kann. Und dann liegen sie an ihm.', 'freude'),
  ], { effects: [set(WEISS), { message: 'Ravens Handschellen-Trick ist jetzt stärker.' }] }),
];

const raven: DialogueDef = dlg('handschellen-raven', [
  node('start', [
    l(RA, 'Du guckst, als hättest du was gefunden. Raus damit.', 'neutral'),
  ], { next: 'wahrheit' }),
  ...wahrheitNodes,
]);

pixel.nodes.push(...wahrheitNodes);
haushaelterin.nodes.push(...wahrheitNodes);

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: { [pixel.id]: pixel, [haushaelterin.id]: haushaelterin, [raven.id]: raven },
  mapAdditions: {
    'bahnhof-mitte': {
      hotspots: [{
        id: 'handschellen-pixel', at: 'fotoautomat', label: 'Fräulein Pixel nach der Seriennummer fragen', kind: 'talk',
        dialogue: pixel.id, when: all(SUCHE, { time: ['abend', 'nacht'] }),
      }],
    },
    glasarkaden: {
      hotspots: [{
        id: 'handschellen-haushaelterin', at: 'glaspark-bank', label: 'Die Chrome-Haushälterin ansprechen', kind: 'talk',
        dialogue: haushaelterin.id, when: all(SUCHE, { time: 'tag' }),
      }],
    },
    'high-voltage': {
      hotspots: [{
        id: 'handschellen-raven-bar', at: 'bar-hocker', label: 'Raven von der Handschelle erzählen', kind: 'talk',
        dialogue: raven.id, when: all(ERZAEHLEN, any({ time: 'abend' }, { companion: RA })),
      }],
    },
    'neon-gasse': {
      hotspots: [{
        id: 'handschellen-raven-dach', at: 'dachterrasse', label: 'Raven von der Handschelle erzählen', kind: 'talk',
        dialogue: raven.id, when: all(ERZAEHLEN, any({ time: ['morgen', 'nacht'] }, { companion: RA })),
      }],
    },
  },
};
