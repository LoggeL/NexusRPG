// pers-barkeeper-letzter-vers · Jakko hat das Gedichtbuch bemalt, der letzte Vers fehlt (world.md §6.5; Start in barkeeper.ts).
// Wege: Verse aus den Resten rekonstruieren (Dreizeiler-Rätsel, ohne Check) oder `[Ausstrahlung 5]` neue Verse dichten.
// Jakkos Bilder bleiben drin.
import type { QuestDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import {
  type Beitrag, L, N, P, active, all, beitrag, bye, c, chk, flag, give, hearts, item, node, noFlag, nochWas, rel, set, schritt,
  take,
} from './_lib';

const Q = 'pers-barkeeper-letzter-vers';
const AKTIV = active(Q);
const B = 'barkeeper';
const JK = 'jakko';
const BUCH = 'gedichtbuch-bemalt';

const quest: QuestDef = {
  id: Q, kind: 'personal', act: 1, giver: B,
  title: 'Der letzte Vers',
  summary: 'Jakko hat das Gedichtbuch des Barkeepers als Malbuch benutzt. Über dem letzten Gedicht prangt jetzt ein Hase mit sehr großen Ohren. Der Vers darunter fehlt.',
  autoStart: hearts(B, 4),
  steps: [
    schritt('jakko', 'Frag Jakko an der Garküche nach der letzten Seite.', 'lv_seite', { marker: { map: 'schrottmarkt' } }),
    schritt('vers', 'Bring dem Barkeeper das Buch und den letzten Vers (High Voltage).', 'lv_fertig', { when: flag('lv_seite'), marker: { map: 'high-voltage' } }),
  ],
  reward: { xp: 150, relations: { barkeeper: 120, jakko: 20 } },
};

const jakko = beitrag(JK, all(AKTIV, noFlag('lv_seite')), '„Jakko. Das Notizbuch vom Barkeeper. Du hast reingemalt.“', [
  node('lv-j-start', [
    L(JK, 'Das war ein Notizbuch? Ich dachte, das ist ein Malbuch für Erwachsene! Da waren so wenig Wörter drin! Und so viel Platz!', 'ueberrascht'),
    L(JK, 'Ich hab ihm Raketen gemalt. Und einen Hund mit acht Beinen, damit er schneller ist. Und auf der letzten Seite Captain Kuschel. Die hab ich … rausgerissen. Weil der so schön geworden ist.', 'verlegen'),
  ], {
    choices: [
      c('„Gib mir die Seite. Ich bring sie zurück. Mit dir als Künstler.“', 'lv-j-gibt'),
      c('Eine Dampfnudel hinhalten. „Tausch?“', 'lv-j-gibt', { when: item('bao-dampfnudel'), effects: [take('bao-dampfnudel'), rel(JK, 40)] }),
    ],
  }),
  node('lv-j-gibt', [
    N('Jakko zieht eine zerknitterte Seite aus der Jacke. Ein riesiger Hase in Wachsmalstift, darunter, halb verdeckt, drei Zeilen in winziger Schrift. Man liest nur Fetzen: „… Glas … leer“, „… wartet … Tür“, „… bleibt.“'),
    L(JK, 'Sagst du ihm, dass es mir leidtut? Und dass der Hase ein Geschenk war? Er kann ihn behalten. Ich mal ihm einen neuen.', 'besorgt'),
  ], { effects: [give(BUCH), set('lv_seite')], choices: [nochWas(), bye()] }),
]);

const bar = beitrag(B, all(AKTIV, flag('lv_seite'), noFlag('lv_fertig')), 'Das Buch und Jakkos Seite auf den Tresen legen.', [
  node('lv-b-start', [
    N('Der Barkeeper legt die Seite neben das Buch. Er sieht den Hasen lange an. Dann die drei Fetzen. Dann dich.'),
    L(B, 'Ein Hase, ein Riss / drei Fetzen eines Abschieds / sag mir, was dort stand.'),
  ], {
    choices: [
      c('Die Fetzen lesen und die Zeilen ergänzen.', 'lv-b-r1'),
      c('Neue Verse dichten. Mit dem Hasen drin.', 'lv-b-neu', { check: chk('lv-neue-verse', 'ausstrahlung', 5, ['kunst', 'ueberzeugen']) }),
      bye('Ich muss erst nachdenken.'),
    ],
  }),
  node('lv-b-r1', [N('Erste Zeile. „… Glas … leer“. Fünf Silben.')], {
    choices: [c('„Ein Glas ist halb leer“', 'lv-b-falsch'), c('„Das letzte Glas leer“', 'lv-b-r2'), c('„Glas leer“', 'lv-b-falsch')],
  }),
  node('lv-b-r2', [N('Er nickt fast unmerklich. Zweite Zeile. „… wartet … Tür“. Sieben Silben.')], {
    choices: [c('„einer wartet an der Tür“', 'lv-b-r3'), c('„niemand wartet vor der Tür der Bar“', 'lv-b-falsch'), c('„wartet Tür“', 'lv-b-falsch')],
  }),
  node('lv-b-r3', [N('Er schließt die Augen. Dritte Zeile. „… bleibt.“ Fünf Silben.')], {
    choices: [c('„der Barkeeper bleibt“', 'lv-b-richtig'), c('„und niemand von ihnen bleibt“', 'lv-b-falsch'), c('„er bleibt“', 'lv-b-falsch')],
  }),
  node('lv-b-falsch', [L(B, 'Nicht meine Worte / der Rhythmus stolpert und fällt / lies noch einmal, Freund.')], {
    choices: [c('Noch einmal lesen.', 'lv-b-r1'), bye('Später.')],
  }),
  node('lv-b-richtig', [
    P('Das letzte Glas leer / einer wartet an der Tür / der Barkeeper bleibt.'),
    N('Er nimmt einen Stift und schreibt die Zeilen unter den Hasen. Nicht über ihn. Unter ihn.'),
    L(B, 'Der Vers kehrt zurück / und der Hase darf bleiben / er passt besser so.'),
  ], { next: 'lv-b-ende' }),
  node('lv-b-neu', [
    P('Ein Kind malt Raketen / über Verse voller Nacht / jetzt fliegt auch das Buch.', 'zaertlich'),
    N('Der Barkeeper hört auf zu polieren. Zum ersten Mal, seit du ihn kennst, sieht er aus, als hätte er etwas zu sagen, das nicht in drei Zeilen passt. Er sagt es trotzdem in drei.'),
    L(B, 'Den alten Vers nicht / ich brauche ihn nicht mehr, Freund / dein Vers ist der letzte.'),
  ], { effects: [rel(B, 40)], next: 'lv-b-ende' }),
  node('lv-b-ende', [
    N('Er klebt die Seite mit Jakkos Hasen ins Buch zurück und legt es zu den Flaschen, wo jeder es sehen kann. Dann stellt er dir ein Glas hin. Das Glas ist voll. Er hat nicht gefragt, was du willst. Er wusste es.'),
    L(B, 'Sag dem kleinen Koch / sein Hase hat mir gefehlt / nächstes Mal mit Herz.'),
  ], { effects: [take(BUCH), set('lv_fertig')] }),
]);

export const beitraege: Beitrag[] = [jakko, bar];

export const part: ContentPart = { quests: { [Q]: quest } };
