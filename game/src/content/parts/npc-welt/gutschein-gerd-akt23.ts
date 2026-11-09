// Gutschein-Gerd in Akt 2, Akt 3 und im Nachspiel (world.md §5.3–5.5). Akt 2: Chrome 10 ist plötzlich echt und gratis,
// sein Betrug wird wertlos; je nach side-chrome-10 (gerd_erledigt) verkauft er „Anti-Chrome-Gutscheine“ oder warnende
// Glückskekse. Partynacht, Nachspiel je Ende, Master-Modus (er versucht dir „Vergebung“ anzudrehen).
// Wird von gutschein-gerd.ts in NpcDef.talk eingehängt.
import type { ContentPart } from '../../part';
import type { Condition, TalkDef } from '../../../modules/contracts';
import { dialog, erz, herz, knoten, rede, sammle, sprecher } from './_welt';
import {
  A2_PARTY, ENDE_3B, ENDE_MEER, ENDE_NEXUS, MASTER, NACHSPIEL, NUR_AKT2, PARTYNACHT, einmal, folge, gesehen, kurz,
} from './akt23-phasen';

const ID = 'gutschein-gerd';
const G = sprecher(ID);
const ALT = 'gerd-tag-standard';
const ENTLARVT: Condition = { any: [{ flag: 'gerd_erledigt' }, { quest: 'side-chrome-10', state: 'done' }] };

const a2 = folge('gerd-a2', [
  erz('Gerds Klapptisch steht noch. Daneben, zehn Meter weiter, ein echter Chrome-10-Stand mit lila Ballons, Promoter in Pastell und einem Schild: „GRATIS“. Gerd starrt hinüber wie ein Wolf, dem ein größerer Wolf das Schaf weggefressen hat.'),
  G('Weißt du, was das ist? Das ist Konkurrenz. Unlautere Konkurrenz. Die verschenken das, was ich verkauft hab, ohne dass es das gab. Das ist … das ist Betrug!', 'wut'),
], G('Noch was? Ich muss gleich wieder neidisch gucken.'), [
  { id: 'anti', text: '„Und was verkaufst du jetzt?“', when: { not: ENTLARVT }, zeilen: [
    G('Anti-Chrome-Gutscheine! Zehn Prozent Rabatt aufs Nicht-Chippen! Du sparst das Geld, das der Chip dich nicht kostet, und kriegst zehn Prozent davon zurück!'),
    G('Zehn Prozent von null ist … Moment. Nicht rechnen. Rechnen ist der Feind des Verkaufs.', 'verlegen'),
  ] },
  { id: 'kekse', text: '„Und die Glückskekse?“', when: ENTLARVT, zeilen: [
    G('Laufen wie verrückt. Ich hab neue Sprüche. „Wer dir was gratis gibt, will dich ganz.“ „Wenn dich einer Master nennt: renn.“ „Heute ist ein guter Tag, um nichts hinters Ohr zu kleben.“'),
    G('Die Leute lesen das, gucken rüber zum Chrome-Stand und gehen nach Hause. Ich bin der erste Betrüger der Stadtgeschichte, der Leute vor Betrug rettet. Ich hasse es. Ich bin stolz.', 'signatur'),
  ] },
  { id: 'chip', text: '„Hast du dir selbst einen Chip geholt? Ist ja gratis.“', zeilen: [
    G('Ich? Ich hab dreißig Jahre lang Leuten Zeug angedreht. Ich weiß, wie es aussieht, wenn einer was gratis anbietet. Es sieht aus wie ich. Nur in Pastell.'),
    G('Nein. Ich trau keinem, der lächelt. Ich lächle ja selber. Ich weiß, was dahinter ist. Meistens nichts Gutes. Manchmal Hunger.'),
  ] },
  { id: 'party', text: '„Wir gehen auf die Releaseparty.“', when: A2_PARTY, zeilen: [
    G('Eintrittskarte? Hab ich! Echte! Mit Hologramm! Fünfzig Credits!'),
    G('… Das Hologramm ist von einer Müslipackung. Du weißt das. Ich weiß das. Behalt dein Geld. Nimm das hier: ein Gratis-Tipp. Am Einlass gucken sie auf die Karte, nicht ins Gesicht. Darum guck ich immer allen ins Gesicht. Das verwirrt.'),
  ], effects: [herz(ID, 10)] },
], ALT, 'Ich überleg’s mir.');

const partynacht = kurz('gerd-partynacht', [
  erz('Der Chrome-10-Stand ist leer, die Promoter sind weg. Gerd steht davor, allein, und lässt einen lila Ballon nach dem anderen platzen. Mit einer Stecknadel. Sehr langsam.'),
  G('Die sind alle auf der Party. Ich nicht. Ich bin nie eingeladen. Ich hab mir eine eigene Party gemacht. Mit Ballons. Mit deren Ballons.', 'signatur'),
  G('Wenn du da oben was abstaubst: Gold, Champagner, Würde, bring mir was mit. Ich mach Gutscheine draus.'),
]);

const nachspiel = dialog('gerd-nachspiel', [
  knoten('start', [
    erz('Auf Gerds Klapptisch liegen neue Karten. Bunt, glänzend, mit deinem Gesicht drauf. Darunter in Goldschrift: „ICH WAR DABEI – Erinnerungsgutschein, limitiert“.'),
    G('Ah! Das Gesicht auf meinem Bestseller! Zwanzig Credits das Stück. Ich hab dreihundert verkauft. Du kriegst nichts davon. Das ist Lizenzrecht. Hab ich gerade erfunden.', 'freude'),
  ], {
    effects: [gesehen('gerd-nachspiel'), herz(ID, 20)],
    choices: [
      { text: '„Du verkaufst mein Gesicht?“', next: 'gesicht' },
      { text: '„Nexus prüft jetzt Betrug, hab ich gehört.“', when: ENDE_NEXUS, next: 'nexus' },
      { text: '„Ohne Werbung sieht der Markt ganz anders aus.“', when: ENDE_MEER, next: 'meer' },
      { text: '„Ich war die Woche über kein Bestseller, oder?“', when: ENDE_3B, next: 'dreib' },
    ],
  }),
  knoten('gesicht', [
    G('Verkaufen? Ehren! Ich ehre dich. Gegen Geld. Das ist die höchste Form der Ehre. Frag die Kirche.', 'signatur'),
    G('Hier, einer gratis. Ehrlich gratis. Der hat einen Druckfehler. Du schielst drauf. Ist trotzdem gut getroffen.'),
  ], { effects: [herz(ID, 10)] }),
  knoten('nexus', [
    G('Hat sie! Eine Drohne kam, hat einen Gutschein gescannt und gesagt: „Das ist kein gültiges Zahlungsmittel. Aber es ist kreativ.“', 'ueberrascht'),
    G('Kreativ! Ich hab mir das auf die Visitenkarte drucken lassen. „Gutschein-Gerd. Von der KI als kreativ eingestuft.“ Die Leute kaufen jetzt doppelt.'),
  ]),
  knoten('meer', [
    G('Ganz anders. Ehrlicher. Furchtbar. Ohne Werbung glauben die Leute nur noch, was sie anfassen. Ich muss jetzt Gutscheine verkaufen, die man anfassen kann.'),
    G('Ich hab Gutscheine aus Holz gemacht. Treibholz. Vom Meer. Gutschein für einen Tag am Strand. Der ist sogar echt. Ich weiß nicht, was mit mir los ist.', 'verlegen'),
  ]),
  knoten('dreib', [
    G('Nein. In der Woche hab ich deine Karten verbrannt. Alle dreihundert. Im Hinterhof. Es hat gestunken. Nach Müsli.', 'wut'),
    G('Jetzt druck ich neue. Mit einem Zusatz: „Zweite Auflage. Verbessert.“ Das bist du. Verbessert. Zwanzig Credits.'),
  ], { effects: [herz(ID, 40)] }),
]);

const nachspielTag = folge('gerd-nachspiel-tag', [
  G('Mein Lieblingsinvestor! Das Portfolio? Großartig. Ich besitze jetzt dreihundert Bilder von dir. Und einen Stand. Und fast ein Gewissen.'),
], G('Noch was? Die Gutscheine werden nicht billiger. Die werden auch nicht teurer. Die sind jetzt fair. Ich bin krank.'), [
  { id: 'neu', text: 'Was gibt’s Neues im Sortiment?', zeilen: [
    G('Gutscheine für Umarmungen. Einlösbar bei Oma Volt. Sie weiß nichts davon. Sie löst sie trotzdem ein. Sie umarmt jeden. Ich hab das Geschäftsmodell der Zukunft gefunden: alte Damen.'),
  ] },
], ALT, 'Ich überleg’s mir.');

const master = dialog('gerd-master', [
  knoten('start', [
    erz('Gerd sieht dich kommen, wird blass und schiebt hastig einen Stapel Karten unter die Glitzerdecke. Dann zieht er sie wieder hervor. Geschäft ist Geschäft.'),
    G('Der … Master. Persönlich. An meinem bescheidenen Stand. Darf ich Ihnen einen Gutschein anbieten? Gutschein für Vergebung. Dreißig Credits. Einlösbar in der ganzen Unterstadt.'),
    G('… Nirgends. Einlösbar nirgends. Keiner nimmt den an. Ich hab’s probiert. Für dich.'),
  ], {
    choices: [
      { text: '„Gib her. Dreißig Credits.“', requires: { credits: 30 }, effects: [{ credits: -30 }, herz(ID, 5)], next: 'gekauft' },
      { text: '(Gehen.)' },
    ],
  }),
  knoten('gekauft', [
    G('Herzlichen Glückwunsch. Du bist jetzt Besitzer eines wertlosen Stücks Papier. Wie früher alle meine Kunden. Willkommen zurück bei den Betrogenen.', 'trauer'),
    G('Wenn du ihn je einlösen willst: Man erzählt sich, oben im Turmbüro liegt ein Plüschhase mit einem Zettel dran. Der Gutschein ist nichts wert. Der Weg dahin vielleicht schon.'),
  ]),
]);

const dialogues = sammle(a2, partynacht, nachspiel, nachspielTag, master);

/** Talk-Einträge vor dem alten Tagesgespräch (nach Rivale und Erstbegegnung). */
export const TALK_23: TalkDef[] = [
  rede('gerd-master', MASTER),
  rede('gerd-nachspiel', einmal('gerd-nachspiel', NACHSPIEL)),
  rede('gerd-nachspiel-tag', NACHSPIEL),
  rede('gerd-partynacht', PARTYNACHT),
  rede('gerd-a2', NUR_AKT2),
];

export const part: ContentPart = { dialogues };
