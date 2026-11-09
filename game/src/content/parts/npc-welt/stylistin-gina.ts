// Stylistin Gina – Salon am Stufenplatz (world.md §4.5, Shop salon-gina). Rettet in side-collins-peruecke (quest-side-c)
// Collins Sendung (Flag peruecke_gina). Looks/Frisuren über den Shop; Umstyling-Szenen als Herz-Ereignisse.
import type { ContentPart } from '../../part';
import type { DialogueChoice, DialogueNode } from '../../../modules/contracts';
import {
  type Menue, dialog, erz, flag, geschenke, gespraech, herz, ich, knoten, nichtGetroffen, ort, pruefung, rede, sammle,
  sprecher, weg, weltfigur, zurueck,
} from './_welt';

const ID = 'stylistin-gina';
const G = sprecher(ID);
const Z = zurueck('Noch was, Gina.', 'Ciao, Schätzchen.');

const choices: DialogueChoice[] = [
  { text: 'Was kannst du für mich tun?', next: 'laden', effects: [{ shop: 'salon-gina' }] },
  { text: 'Wen hast du schon alles frisiert?', once: true, id: 'gi-kunden', next: 'kunden' },
  { text: '„Wie findest du meinen Look?“', next: 'look' },
  { text: '„Collins Haarteil … war das echt deine Rettung?“', when: { flag: 'peruecke_gina' }, once: true, id: 'gi-collin', next: 'collin' },
  { text: 'Ciao, Schätzchen.' },
];

const nodes: DialogueNode[] = [
  knoten('laden', [G('Setz dich. Nein, nicht da, da sitzt Bijou, wenn sie zu Besuch ist. Da. Und jetzt halt still und vertrau mir. Das sagen alle Chirurgen.')]),
  knoten('kunden', [
    G('Hunter. Einmal. Seitenscheitel. Er hat drei Tage nicht mit mir geredet. Dann kam er wieder und wollte ihn nochmal.'),
    G('Collin, natürlich. Jeden Montag. Was unter dem Haarteil ist, nehme ich mit ins Grab. Und das Grab wird sehr gepflegt aussehen.'),
    G('Und einmal Ripper. Er wollte die Augenbrauen „chirurgisch präzise“. Ich hab sie präzise gemacht. Er hat mir Trinkgeld in Zähnen gegeben.'),
  ], { choices: Z }),
  knoten('look', [
    erz('Gina tritt einen Schritt zurück, kneift ein Auge zu, legt den Kopf schief.'),
    G('Ehrlich? Als hätte ein Schrottplatz versucht, sich zu verlieben. Aber mit Potenzial. Ich sehe Potenzial. Viel. Unter viel Dreck.'),
  ], { choices: Z }),
  knoten('collin', [G('Rettung? Ich hab ihm eine Mütze aus seinem eigenen Brusthaar gemacht. Das war keine Rettung. Das war Kunst. Mit Haarspray.')], { choices: Z, effects: [herz(ID, 20)] }),
];

const M: Menue = { zeile: G('Noch was, Schätzchen? Mein Föhn wird kalt.'), choices, nodes };

const T = {
  rivale: dialog('gina-tag-rivale', [knoten('start', [G('Für dich: kein Termin. Nie.'), G('Selbst mein Föhn weigert sich, du zerzauste Katastrophe.')])]),
  erstes: gespraech('gina-tag-erstes', [
    erz('Ein Salon in Pink und Gold, Spiegel bis unter die Decke, Lockenwickler in Neonfarben. Eine Frau mit hochtoupierter Silbermähne dreht sich auf einem Barhocker zu dir. Lange Nägel, längere Wimpern.'),
    G('Oh. OH. Komm rein, bevor dich jemand so sieht. Gina. Stylistin. Ich mache aus Menschen Ereignisse.'),
  ], M),
  standard: gespraech('gina-tag-standard', [G('Schätzchen! Wieder da? Dein Spliss hat mich vermisst.')], M),
  vertraut: gespraech('gina-tag-vertraut', [G('Da ist ja mein Lieblingsprojekt! Weißt du, dass du jetzt schon fast vorzeigbar bist? Das ist mein Werk. Sag’s allen.')], M),
};

/** ♥2: Gina braucht ein Modell für eine Frisurenschau. */
const he2 = dialog('he-stylistin-gina-2', [
  knoten('start', [
    erz('Vor dem Salon ist eine kleine Bühne aufgebaut. Ein Plakat: „GINAS FRISURENSCHAU – Stufenplatz trägt Stil“. Gina rauft sich die Silbermähne.'),
    G('Mein Modell ist abgesprungen. Ehefrau. Eifersucht. Lange Geschichte, mit Lockenstab. Du! Du gehst raus!'),
  ], {
    choices: [
      { text: 'Rausgehen und mit voller Überzeugung posieren.', tag: '[Ausstrahlung 4]', check: pruefung('he-gina-2-buehne', 'ausstrahlung', 4, ['buehne']), next: 'auftritt' },
      { text: 'Rausgehen und so tun, als wäre das alles Absicht.', next: 'absicht' },
    ],
  }),
  knoten('auftritt', [erz('Du läufst über die Bühne, als hättest du nie etwas anderes getan. Die Menge johlt. Collin Charleston, zufällig auf dem Platz, filmt mit. Gina weint in ihr Haarspray.')], { next: 'ende', effects: [herz(ID, 50), { xp: 40 }] }),
  knoten('absicht', [erz('Du stolperst über ein Kabel, fängst dich, drehst dich, stolperst wieder. Das Publikum hält es für moderne Kunst. Es applaudiert verwirrt.'), G('Genial. Avantgarde. Ich nenne es „Schrottplatz verliebt sich“.')], { next: 'ende', effects: [herz(ID, 40), { xp: 30 }] }),
  knoten('ende', [G('Ab heute kriegst du zehn Prozent. Und Kaffee. Echten. Nicht diese Synthbrühe.')], { effects: [flag('gina_modell')] }),
]);

/** ♥4: Gina erzählt, warum sie nach unten gezogen ist. */
const he4 = dialog('he-stylistin-gina-4', [
  knoten('start', [
    erz('Nach Ladenschluss. Gina hat die Perücke abgenommen. Darunter: kurzes graues Haar. Sie sieht zehn Jahre jünger aus und gleichzeitig zehn älter.'),
    G('Ich hatte mal einen Salon in den Glasarkaden. Madame Satin war meine beste Kundin. Und meine beste Freundin. Dann hat Quantum den Laden gekauft. Für ein Hologramm-Studio.'),
    G('Satin hat nichts gesagt. Sie hätte was sagen können. Sie hat nichts gesagt.'),
  ], {
    choices: [
      { text: '„Hast du sie mal gefragt, warum?“', next: 'gefragt' },
      { text: '„Ich rede mit Madame Satin.“', tag: '[Ausstrahlung 5]', check: pruefung('he-gina-4-satin', 'ausstrahlung', 5, ['ueberreden']), when: { met: 'madame-satin' }, next: 'satin' },
      { text: '„Ohne Perücke siehst du besser aus. Ehrlich.“', next: 'ohne' },
    ],
  }),
  knoten('gefragt', [G('Gefragt? Nein. Ich bin runtergezogen und hab einen pinken Salon aufgemacht. Das war meine Frage.'), G('… Vielleicht sollte ich eine richtige stellen.')], { next: 'ende', effects: [herz(ID, 50)] }),
  knoten('satin', [
    erz('Madame Satin hört dir zu, ohne mit der Wimper zu zucken. Dann holt sie einen Umschlag aus der Schublade. Darin: ein Scheck, nie eingelöst. „Für Gina. Für den neuen Salon.“ Datiert vor sieben Jahren.'),
    G('Sieben Jahre? Diese stolze alte Schachtel. Diese … Ach, verdammt.', 'trauer'),
  ], { next: 'ende', effects: [herz(ID, 60), herz('madame-satin', 20), flag('gina_satin_versoehnt')] }),
  knoten('ohne', [G('Besser? Ich sehe aus wie eine pensionierte Lehrerin.'), G('… Eine pensionierte Lehrerin mit sehr gutem Knochenbau. Ja. Danke, Schätzchen.')], { next: 'ende', effects: [herz(ID, 50)] }),
  knoten('ende', [
    ich('Und jetzt?'),
    G('Jetzt setz ich die Perücke wieder auf. Weil ich sie mag. Nicht weil ich sie brauch. Das ist ein Unterschied.'),
  ], { effects: [{ xp: 60 }, { give: 'haarspray-deluxe' }] }),
]);

const gina = weltfigur({
  id: ID,
  name: 'Stylistin Gina',
  unknownName: 'Frau mit Silbermähne',
  faction: 'unterstadt',
  bio: 'Betreibt den Salon Gina am Stufenplatz, pink und gold. Silbermähne (Perücke), lange Nägel, Föhn als Zepter. Hatte früher einen Salon in den Glasarkaden. „Ich mache aus Menschen Ereignisse.“',
  gifts: geschenke({
    loves: ['haarspray-deluxe', 'seidentuch-rot', 'taschenspiegel-gold'],
    likes: ['liebesroman', 'perlenkette', 'parfuem-ozon', 'schwarzer-lippenstift'],
    dislikes: ['rostige-schraube', 'zerberster-oel'],
    hates: ['kanalschlamm', 'waschpulver'],
  }),
  schedule: [ort('T,A', 'stufenplatz', 'salon-gina'), weg('M,N')],
  heartEvents: [
    { id: 'he-stylistin-gina-2', hearts: 2, map: 'stufenplatz', time: 'tag', dialogue: 'he-stylistin-gina-2' },
    { id: 'he-stylistin-gina-4', hearts: 4, map: 'stufenplatz', time: 'abend', when: { seen: 'he-stylistin-gina-2' }, dialogue: 'he-stylistin-gina-4' },
  ],
  talk: [
    rede('gina-tag-rivale', { rival: ID }),
    rede('gina-tag-erstes', nichtGetroffen(ID)),
    rede('gina-tag-vertraut', undefined, 4),
    rede('gina-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: gina },
  dialogues: sammle(T.rivale, T.erstes, T.standard, T.vertraut, he2, he4),
};
