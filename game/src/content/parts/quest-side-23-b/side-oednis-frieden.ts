// side-oednis-frieden · „Frieden in der Ödnis“ (world.md §6.3 Nr. 44). Marla Sand, staubstrasse + aussiedlerhof, Akt 2,
// ab Ruf „Respektiert“ bei aussiedler UND staubfalken (beide vertrauen der Spielfigur, darum kann sie vermitteln).
// Schritte: Konvoi steht an der Wegzoll-Schranke gegen die Falken (Standoff lösen, ohne Check: Einladung an Rudis Tisch)
// → beide Seiten an Rudis Verhandlungstisch → Vertrag. Wege: gc-136 [Ausstrahlung 8] Friedensvertrag · 2 × wasserfilter
// (einer für jede Seite, ohne Check) · gc-137 [Straße 7] bezahlte Falken-Eskorte statt Zoll.
// Belohnung 350 XP, Ruf aussiedler +20 und staubfalken +20, Marla ♥ +100; Konvoi bringt Wunschware (Laden `konvoi`
// prüft side-oednis-frieden erledigt), Hintergrund bg-staubstrasse-frieden über die Karte.
import type { ContentPart } from '../../part';
import type { Condition, CutsceneDef, DialogueDef, NewsDef, PhoneMessageDef, QuestDef } from '../../../modules/contracts';
import {
  ACT2, VEX, WACH, active, all, bild, ch, dlg, done, flag, herz, inactive, item, l, n, noFlag, node, p, set, tafel,
} from './_lib';

const Q = 'side-oednis-frieden';
const MA = 'marla-sand';
const KR = 'kraehe';
const RU = 'rudi';
const EL = 'elsa';

const TISCH = 'fr_an_den_tisch';
const VERTRAG = 'fr_vertrag';
const ESKORTE = 'fr_eskorte';
const FILTER = 'fr_wasserfilter';

const RUF: Condition = all({ repTier: 'aussiedler', min: 'respektiert' }, { repTier: 'staubfalken', min: 'respektiert' });

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: 'Frieden in der Ödnis',
  summary: 'Aussiedler und Staubfalken trauen dir beide. Das ist in der Ödnis seltener als Regen. Marla will das nutzen, bevor es jemand merkt.',
  giver: MA,
  act: 2,
  steps: [
    {
      id: 'schranke', text: 'Der Konvoi steht an der Wegzoll-Schranke, die Falken lassen ihn nicht durch. Geh dazwischen, bevor jemand schießt.',
      done: flag(TISCH), marker: { map: 'staubstrasse', at: 'wegzoll-schranke' },
    },
    {
      id: 'tisch', when: flag(TISCH), text: 'Bring Marla und Krähe in Rudis Diner an den Verhandlungstisch (morgens bis abends) und handle einen Vertrag aus.',
      done: flag(VERTRAG), marker: { map: 'rudis-diner', at: 'verhandlungstisch' },
    },
  ],
  reward: { xp: 350, rep: { aussiedler: 20, staubfalken: 20 }, relations: { [MA]: 100 } },
};

// ---------------------------------------------------------------------------------------------- Auftakt

const tel: PhoneMessageDef = {
  id: 'tel-marla-frieden',
  from: MA,
  text: 'Die Falken sagen, du hast Ehre. Elsa sagt, du hast Hände. Beides zusammen hat hier draußen seit Jahren keiner. Komm auf meine Veranda, ich hab eine Idee, die mir Angst macht. – Marla',
  auto: all(ACT2, RUF, inactive(Q)),
};

const start: DialogueDef = dlg('frieden-marla-start', [
  node('start', [
    n('Marla sitzt auf den Stufen ihrer Veranda und flickt eine Zeltplane. Neben ihr dampft ein Becher Kaktustee, den niemand trinken will, nicht einmal sie.'),
    l(MA, 'Weißt du, warum der Konvoi nur zweimal die Woche fährt? Weil er an der Schranke der Falken Zoll zahlt. Jedes Mal. Wasser, Saatgut, Ersatzteile. Ein Drittel bleibt bei Krähe.', 'neutral'),
    l(MA, 'Und weißt du, warum die Falken Zoll nehmen? Weil sie sonst nichts haben. Keinen Brunnen, keine Felder. Nur Wracks und Stolz. Stolz macht nicht satt.', 'besorgt'),
  ], {
    choices: [
      ch('„Und jetzt willst du Frieden.“', 'frieden'),
      ch('„Warum fragst du mich?“', 'warum'),
    ],
  }),
  node('warum', [
    l(MA, 'Weil dir beide Seiten zuhören. Die Falken nennen dich beim Namen. Die Aussiedler lassen dich an den Brunnen. Das ist hier draußen mehr wert als ein Vertrag auf Papier.', 'neutral'),
    l(MA, 'Wer den Wind liest, verläuft sich nicht. Und gerade weht er in die richtige Richtung. Er dreht sich bald wieder.', 'signatur'),
  ], { next: 'frieden' }),
  node('frieden', [
    l(MA, 'Frieden ist ein großes Wort. Ich will nur, dass der Konvoi fährt, ohne dass jemand ein Drittel abgeben muss. Und dass die Falken trotzdem essen.', 'neutral'),
    l(MA, 'Heute stehen sie wieder an der Schranke. Der Konvoi will durch, ohne zu zahlen. Krähes Leute wollen nicht nachgeben. Wenn da einer nervös wird, haben wir keinen Frieden, sondern Begräbnisse.', 'besorgt'),
  ], {
    choices: [
      ch('„Ich geh hin. Bevor einer abdrückt.“', 'los', { effects: [{ startQuest: Q }] }),
      ch('„Gib mir einen Moment.“'),
    ],
  }),
  node('los', [
    l(MA, 'Danke. Ich komme nach. Und wenn du sie dazu kriegst, an einem Tisch zu sitzen: Rudi hat einen. Er hat ihn „Friedenstisch“ getauft, bevor je einer drangesessen hat. Rudi ist ein Optimist mit Bratpfanne.', 'freude'),
  ]),
]);

// ---------------------------------------------------------------------------------------------- Schranke

const schranke: DialogueDef = dlg('frieden-schranke', [
  node('start', [
    n('An der Wegzoll-Schranke stehen drei Laster des Konvois mit laufenden Motoren. Davor die Fahrer mit Schraubenschlüsseln. Auf der anderen Seite der Schranke: Krähe auf ihrem Pick-up, ein Dutzend Falken mit Bolzenschleudern, alle Augen auf Kopfhöhe.'),
    l(KR, 'Ein Drittel. Wie immer. Oder ihr dreht um. Wie nie.', 'wut'),
    l('narrator', 'Ein Konvoifahrer mit Hut brüllt zurück: „Ein Drittel von nix ist nix! Wir haben nix! Ihr habt uns letzte Woche schon alles genommen!“'),
    n('Jemand lädt eine Bolzenschleuder. Das Klicken ist sehr laut.'),
  ], {
    choices: [
      ch('Zwischen die beiden Gruppen treten. Hände hoch, mitten auf die Straße.', 'mitte'),
      ch('„Krähe! Wer heute schießt, kriegt keine Geschichte. Nur eine Leiche.“', 'kraehe', { when: done('side-kraehes-ehre') }),
    ],
  }),
  node('kraehe', [
    l(KR, 'Du. Mit meiner Feder. Natürlich. Wer sonst stellt sich zwischen zwei Gewehre und redet von Geschichten.', 'signatur'),
    n('Krähe hebt die Hand. Die Falken senken die Schleudern. Nur ein bisschen. Aber ein bisschen ist hier draußen eine Menge.'),
  ], { next: 'mitte' }),
  node('mitte', [
    p('Hört zu. Ihr verhungert beide, wenn ihr so weitermacht. Die einen am Zoll, die anderen ohne. Ich hab eine bessere Idee, und die gibt’s nur mit Pfannkuchen.', 'neutral'),
    p('Rudis Diner. Ein Tisch. Marla für den Hof, Krähe für die Falken. Wer am Tisch eine Waffe zieht, spült eine Woche.', 'signatur'),
    n('Stille. Der Wind trägt Sand über die Straße. Dann lacht Krähe, kurz und rau.'),
    l(KR, 'Rudis Spüle. Das ist die schlimmste Drohung, die ich je gehört hab. Gut. Ich komme. Aber ich bestelle doppelt, und ihr zahlt.', 'freude'),
    l('narrator', 'Der Konvoifahrer mit Hut: „Wir zahlen? WIR? … Gut. Aber nur die Pfannkuchen. Nicht den Sirup.“'),
  ], { effects: [set(TISCH), { message: 'Beide Seiten kommen an Rudis Tisch.' }] }),
]);

// ---------------------------------------------------------------------------------------------- Verhandlung

const tisch: DialogueDef = dlg('frieden-tisch', [
  node('start', [
    n('Am langen Tisch im Heck von Rudis Diner sitzen sich zwei Welten gegenüber. Links Marla und Elsa, Hände um Teetassen. Rechts Krähe und zwei Falken, Stiefel auf dem Tisch. Zwischen ihnen ein Stapel Pfannkuchen, den keiner anrührt. Rudi steht mit verschränkten Armen hinter dem Tresen, die Bratpfanne griffbereit.'),
    l(RU, 'Regeln. Keine Waffen auf dem Tisch. Keine Waffen unter dem Tisch. Wer Sirup verschüttet, wischt. Los.', 'neutral'),
    l(KR, 'Ohne Zoll haben wir nichts. Ihr habt Brunnen, Felder, Solarsegel. Wir haben Sand. Sand kann man nicht essen. Ich hab’s versucht.', 'wut'),
    l(MA, 'Mit Zoll haben wir bald auch nichts. Dann sind wir alle Falken, und keiner zahlt mehr, weil keiner mehr was hat. Das ist kein Plan, Krähe. Das ist ein Sonnenuntergang.', 'besorgt'),
  ], { next: 'wahl' }),
  node('wahl', [
    n('Beide schauen dich an. Rudi auch. Sogar die Pfannkuchen, gefühlt.'),
  ], {
    choices: [
      ch('Einen Vertrag vorschlagen: Die Aussiedler teilen Wasser und Saat, die Falken bewachen die Pisten. Kein Zoll, sondern Arbeit.', 'vertrag', { check: 'gc-136' }),
      ch('Zwei Wasserfilter auf den Tisch stellen. Einen für jede Seite.', 'filter', {
        requires: item('wasserfilter', 2), effects: [{ take: 'wasserfilter', qty: 2 }, set(FILTER)],
      }),
      ch('„Die Falken fahren den Konvoi. Als Eskorte, bezahlt. Keiner überfällt einen Konvoi, auf dem Falken sitzen.“', 'eskorte', { check: 'gc-137' }),
      ch('„Esst erst mal was. Mit leerem Magen verhandelt keiner gut.“', 'essen', { once: true, id: 'frieden-essen' }),
    ],
  }),
  node('essen', [
    n('Krähe nimmt einen Pfannkuchen. Marla nimmt einen. Elsa nimmt drei. Eine Weile ist nur Kauen zu hören, und das Knacken des Ventilators.'),
    l(EL, 'Die sind gut, Rudi. Die sind wirklich gut.', 'freude'),
    l(RU, 'Ich weiß. Sagt das den Leuten, die schießen wollen.', 'neutral'),
    n('Die Stimmung ist nicht besser. Aber sie ist satter.'),
  ], { next: 'wahl' }),
  node('vertrag', [
    p('Hört auf, euch gegenseitig auszurauben, und fangt an, euch zu bezahlen. Ihr habt Wasser. Ihr habt Motorräder. Die Falken passen auf die Pisten auf, auf Konvoi, Brunnen, Felder. Dafür kriegen sie Wasser und Saat. Jeden Monat. Nicht als Zoll. Als Lohn.', 'neutral'),
    p('Dann sind die Falken keine Räuber mehr. Sondern die einzige Truppe in der Ödnis, die Leute beschützt. Krähe, das ist eine Geschichte, die noch keiner erzählt hat.', 'signatur'),
    n('Krähe nimmt die Stiefel vom Tisch. Langsam.'),
    l(KR, 'Beschützer. Wir. Die Mütter würden uns ihre Kinder geben, statt sie vor uns zu verstecken.', 'ueberrascht'),
    l(MA, 'Ich würde dir meine Felder geben. Fürs Bewachen. Nicht für immer. Aber jeden Monat aufs Neue.', 'zaertlich'),
  ], { effects: [set(VERTRAG)], next: 'unterschrift' }),
  node('filter', [
    n('Du stellst zwei Wasserfilter auf den Tisch, zwischen die Pfannkuchen. Kohle und Keramik, aus dem Hofladen. Beide Seiten starren drauf.'),
    p('Einer für den Hof, einer für die Wrackburg. Dann habt ihr beide sauberes Wasser. Dann muss keiner mehr dem anderen das Wasser wegnehmen. Und der Rest ist Verhandlungssache.', 'neutral'),
    l(KR, 'Ein eigener Filter. In der Wrackburg. Wir trinken seit Jahren das, was Brösel uns verkauft. Und das ist Pisse mit Etikett.', 'wut'),
    l(EL, 'Ich kann einen Brunnen für euch bohren. Mit dem Filter dazu. Gegen eine Eskorte für den Konvoi. Vier Wochen Arbeit, und dann habt ihr nie wieder Durst.', 'neutral'),
    n('Krähe schaut Elsa lange an. Dann streckt sie die Hand über den Tisch. Elsa schlägt ein. Rudi lässt die Bratpfanne sinken.'),
  ], { effects: [set(VERTRAG), herz(EL, 40)], next: 'unterschrift' }),
  node('eskorte', [
    p('Ihr wollt Zoll, weil ihr was davon haben wollt. Dann verdient es euch. Die Falken fahren den Konvoi. Vorne, hinten, an der Seite. Bezahlt pro Fahrt. Wer will einen Konvoi überfallen, auf dem zwölf Falken mit Bolzenschleudern sitzen?', 'neutral'),
    l(KR, 'Niemand. Außer uns. Und wir wären ja dann drauf.', 'signatur'),
    p('Genau. Ihr werdet nicht ärmer, ihr werdet Angestellte. Mit Ehre. Und mit Pfannkuchen bei jedem Halt.', 'signatur'),
    l(MA, 'Wir zahlen weniger als den Zoll, und der Konvoi fährt öfter. Jeden Tag statt zweimal die Woche. Das rechnet sich. Ich hab’s gerade im Kopf gerechnet. Das rechnet sich wirklich.', 'freude'),
  ], { effects: [set(VERTRAG), set(ESKORTE)], next: 'unterschrift' }),
  node('unterschrift', [
    l(RU, 'Gut. Dann schreibt’s auf. Hier.', 'neutral'),
    n('Rudi knallt eine Papierserviette auf den Tisch. Eine einzige. Mit Honigfleck.'),
  ], {
    choices: [
      ch('„Und jetzt alle unterschreiben.“', undefined, { effects: [{ cutscene: 'side-oednis-frieden-vertrag' }] }),
      ch('„Vex Schrapnell. Zeugin. Wer den Vertrag bricht, kriegt Besuch.“', undefined, { when: VEX, effects: [{ cutscene: 'side-oednis-frieden-vertrag' }] }),
    ],
  }),
]);

const vertrag: CutsceneDef = {
  id: 'side-oednis-frieden-vertrag',
  title: 'Der Friedenstisch',
  gallery: false,
  beats: [
    bild('bg-rudis-diner', { pan: 'in', fade: 'in', hold: 1400, caption: 'Der Friedensvertrag der Ödnis wird auf eine Serviette geschrieben. Mit Honigfleck.' }),
    tafel('Marla unterschreibt mit Kugelschreiber. Krähe mit dem Kiel einer Feder, in Sirup getaucht. Der Konvoifahrer mit Hut kann nicht schreiben und setzt einen Daumenabdruck. In Bratfett.', { hold: 1800 }),
    tafel('Rudi rahmt die Serviette noch am selben Abend. „Wer hier Streit anfängt, spült eine Woche. Gilt für alle. Besonders für Krähe.“', { hold: 1600 }),
    bild('bg-staubstrasse-frieden', { pan: 'right', hold: 1800, caption: 'Am nächsten Morgen steht die Wegzoll-Schranke offen. Auf dem ersten Laster des Konvois sitzen zwei Falken und winken. Die Aussiedler winken zurück. Zögerlich. Aber sie winken.' }),
    tafel('Brösel verkauft an diesem Tag keinen einzigen Becher Wasser. Er sitzt unter seinem Sonnenschirm und schmollt. Es ist der beste Tag in der Ödnis seit Jahren.', { fade: 'out', hold: 1600 }),
  ],
  effects: [herz(KR, 40), herz(RU, 30)],
};

const danach: DialogueDef = dlg('frieden-marla-danach', [
  node('start', [
    n('Marla steht vor dem Diner und schaut der Staubstraße nach, auf der ein Laster mit Falken obendrauf Richtung Horizont fährt.'),
    l(MA, 'Ich hab dreizehn Jahre gewartet, dass das passiert. Und dann kommt jemand aus der Stadt und macht es an einem Nachmittag. Mit Pfannkuchen.', 'freude'),
    l(MA, 'Danke. Ich weiß nicht, wie lange es hält. Aber heute hält es. Hier draußen ist heute schon viel.', 'zaertlich'),
  ]),
]);

const news: NewsDef = {
  id: 'news-side-oednis-frieden',
  anchor: 'opa-funk',
  headline: 'Radio Rost: Frieden in der Ödnis',
  when: done(Q),
  priority: 3,
  lines: [
    l('opa-funk', 'Hier ist Radio Rost mit einer Meldung, die ich zweimal vorlesen musste, weil ich sie nicht geglaubt hab: Die Schranke an der Staubstraße ist offen. Falken fahren den Konvoi.', 'ueberrascht'),
    l('opa-funk', 'Unterschrieben auf einer Serviette bei Rudi. Wer sie anfasst, spült eine Woche. Und jetzt ein Lied. Ein fröhliches. Ich hab eins gefunden.', 'freude'),
  ],
};

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: { [start.id]: start, [schranke.id]: schranke, [tisch.id]: tisch, [danach.id]: danach },
  cutscenes: { [vertrag.id]: vertrag },
  phone: { [tel.id]: tel },
  news: { [news.id]: news },
  mapAdditions: {
    aussiedlerhof: {
      hotspots: [{
        id: 'q-frieden-marla', at: 'veranda', radius: 64, label: 'Marla auf der Veranda', kind: 'talk', dialogue: start.id,
        when: all(ACT2, RUF, inactive(Q), WACH),
      }],
    },
    staubstrasse: {
      hotspots: [
        {
          id: 'q-frieden-schranke', at: 'wegzoll-schranke', radius: 70, label: 'Konvoi gegen Falken an der Schranke', kind: 'use', dialogue: schranke.id,
          when: all(active(Q), noFlag(TISCH), WACH),
        },
        {
          id: 'q-frieden-danach', at: 'diner-tuer', radius: 56, label: 'Marla vor dem Diner', kind: 'talk', dialogue: danach.id,
          when: all(done(Q), noFlag('fr_danach_gesehen'), WACH), once: true,
          effects: [set('fr_danach_gesehen')],
        },
      ],
    },
    'rudis-diner': {
      hotspots: [{
        id: 'q-frieden-tisch', at: 'verhandlungstisch', radius: 64, label: 'An den Friedenstisch setzen', kind: 'talk', dialogue: tisch.id,
        when: all(active(Q), flag(TISCH), noFlag(VERTRAG), WACH),
      }],
    },
  },
};
