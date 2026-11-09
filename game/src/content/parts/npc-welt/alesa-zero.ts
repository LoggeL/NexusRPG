// Alesa Zero – Leiterin der Quantum-Forschung (world.md §4.3). In Akt 1 Hintergrundfigur (§11.2): Mo–Fr 07–09 Uhr
// am Fenstertisch im Café Sahnehaube, mittwochs tagsüber an der Lieferzone des Digitech-Areals (holt Prototypen).
import type { ContentPart } from '../../part';
import { einSatz, erz, hintergrundfigur, ort, rede, sammle, sprecher, weg } from './_welt';

const ID = 'alesa-zero';
const A = sprecher(ID);

const T = {
  schrott: einSatz('alesa-tag-schrott', [
    A('Du hast … Rückkopplungsschutz am Zentrator? Selbst gebaut? Das ist … nein. Keine Zeit. Ich hab keine Zeit. Leider.'),
  ]),
  digitech: einSatz('alesa-tag-digitech', [
    erz('Alesa schiebt einen Rollwagen voller Kisten Richtung Campus. Eine Kiste raucht leicht.'),
    A('Nicht anfassen! Das ist … Inventur. Ganz legal. Wir haben ja von nichts gewusst. Ich meine: Das ist alles abgesprochen.'),
  ]),
  standard: einSatz('alesa-tag-standard', [
    erz('Eine Frau im Laborkittel liest drei Tablets gleichzeitig, schwarzer Kaffee, kein Blick hoch.'),
    A('Ich bin nicht im Dienst. Ich bin nie nicht im Dienst. Bitte gehen Sie, bevor mein Kaffee kalt wird. Er ist das Einzige, was heute funktioniert.'),
  ]),
};

const alesa = hintergrundfigur({
  id: ID,
  name: 'Alesa Zero',
  unknownName: 'Frau im Laborkittel',
  portrait: 'alesa',
  sprite: 'alesa-walk',
  faction: 'quantum',
  bio: 'Leiterin der Quantum-Forschung, hat Nexus gebaut. Brillant, nervös, Laborkittel, Prototypen mit Hang zum Abfackeln. Morgens im Café Sahnehaube, mittwochs im Digitech-Areal.',
  gifts: {
    loves: ['laborkittel-neu', 'pinzetten-set', 'datenkristall', 'sahnetorte-stueck'],
    likes: ['synth-kaffee', 'logik-raetsel-modul', 'alter-neurochip', 'nexi-pluesch'],
    dislikes: ['synth-nudeln', 'taschenspiegel-gold'],
    hates: ['feuerloescher-mini', 'defekter-neurochip'],
  },
  schedule: [
    ort('M', 'cafe-sahnehaube', 'fenstertisch', { days: ['mo', 'di', 'mi', 'do', 'fr'], when: { clockBetween: [420, 540] } }),
    ort('T', 'digitech-areal', 'lieferzone', { days: ['mi'] }),
    weg(),
  ],
  talk: [
    rede('alesa-tag-schrott', { origin: 'origin-schrott' }),
    rede('alesa-tag-digitech', { time: 'tag' }),
    rede('alesa-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: alesa },
  dialogues: sammle(T.schrott, T.digitech, T.standard),
};
