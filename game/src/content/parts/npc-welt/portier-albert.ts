// Portier Albert – Portier am Chrome Tower (world.md §4.5, Zone chrome-boulevard = Akt 2). In Akt 1 laut Plan nur
// nachts im Chrome-Penthouse auf seiner Runde, solange side-alte-gewohnheiten läuft (Abwimmeln: gc-144 an der Karte).
// Herz-Ereignisse 2/4 gehören zu seiner Zone chrome-boulevard und folgen mit Akt 2 (gaps/npc-welt.md).
import type { ContentPart } from '../../part';
import { einSatz, erz, geschenke, ort, rede, sammle, sprecher, weg, weltfigur } from './_welt';

const ID = 'portier-albert';
const A = sprecher(ID);

const T = {
  oberstadt: einSatz('albert-tag-oberstadt', [
    A('Oh. Verzeihung. Ich habe Sie nicht erkannt, in diesem … Aufzug. Darf ich Ihnen den Dienstboteneingang zeigen? Er ist diskreter. Für alle.'),
  ]),
  runde: einSatz('albert-tag-runde', [
    erz('Ein älterer Herr in Livree mit weißen Handschuhen und einer Taschenlampe, die er hält wie einen Kerzenleuchter. Er bleibt stehen. Er schnuppert.'),
    A('Sie stehen nicht auf meiner Liste. Niemand, der nicht auf meiner Liste steht, steht um diese Uhrzeit in diesem Flur. Also stehen Sie hier nicht.'),
    A('Ich drehe mich jetzt um und zähle bis zehn. Wenn ich mich wieder umdrehe, habe ich mich geirrt. Eins.'),
  ]),
};

const albert = weltfigur({
  id: ID,
  name: 'Portier Albert',
  unknownName: 'Herr in Livree',
  faction: 'chrome-haus',
  bio: 'Portier am Chrome Tower, seit vierzig Jahren im Dienst der Familie Chrome. Livree, weiße Handschuhe, Etikette als Waffe. Dreht nachts seine Runde durchs Penthouse.',
  gifts: geschenke({
    loves: ['samtfliege', 'goldknauf-replik', 'zeitung-papier'],
    likes: ['kraeuter-gebaeck', 'taschenspiegel-gold', 'edelbrause'],
    dislikes: ['chips-tuete', 'glitzerschrott'],
    hates: ['kanalschlamm', 'rostige-schraube'],
  }),
  schedule: [
    ort('N', 'chrome-penthouse', 'portier-runde', { when: { quest: 'side-alte-gewohnheiten', state: 'active' } }),
    weg(),
  ],
  talk: [
    rede('albert-tag-oberstadt', { origin: 'origin-oberstadt' }),
    rede('albert-tag-runde'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: albert },
  dialogues: sammle(T.oberstadt, T.runde),
};
