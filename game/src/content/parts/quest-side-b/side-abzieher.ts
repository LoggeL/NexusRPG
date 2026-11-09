// side-abzieher „Die zwei Typen“ (world.md §6.2 Nr. 15) · Auftraggeber Dante (er sei nicht gerannt; er ist gerannt)
// · bahnhof-mitte, ubahn-wagen · A/N.
// Wege: Kampf enc-ubahn-abzieher (Gegnergruppe `rostzahn-wache` der Zone im Wagen) · gc-74 ehrliche Arbeit (Türsteher,
// danach kein Eintritt im High Voltage) · Lockvogel mit Fake-Implantat und Kessel · [Dante ♥3] Dante gesteht.
import type { ContentPart } from '../../part';
import type { CutsceneDef, DialogueDef, ItemDef, QuestDef } from '../../../modules/contracts';
import { L, N, P, active, all, any, bye, flag, hearts, inactive, item, msg, node, noFlag, not, rel, set, tafel, time } from './_lib';

const Q = 'side-abzieher';
const D = 'dante';

const GESTOPPT = any(
  { won: 'enc-ubahn-abzieher' }, flag('ab_tuersteher'), flag('ab_lockvogel'), flag('ab_dante_gestaendnis'),
);
const ABEND_NACHT = time('abend', 'nacht');

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: 'Die zwei Typen',
  summary: 'Knut und Kurt ziehen am Bahnhof Neuankömmlinge ab. Dante behauptet, er habe es den beiden „gezeigt“. Dante ist gerannt.',
  giver: D,
  act: 1,
  steps: [
    {
      id: 'beobachten', text: 'Abends am Bahnsteig von Bahnhof Mitte nach Knut und Kurt Ausschau halten.',
      done: any(flag('ab_spur'), GESTOPPT), marker: { map: 'bahnhof-mitte', at: [900, 548] },
    },
    {
      id: 'stoppen', text: 'Die Brüder hausen im stillgelegten U-Bahn-Wagen. Stoppt sie: mit Worten, mit Fäusten oder mit einer Falle.',
      done: GESTOPPT, marker: { map: 'ubahn-wagen', at: [200, 420] },
    },
    {
      id: 'lockvogel', text: 'Weg: Lockvogel spielen – mit Dantes Fake-Implantat und Wachtmeisterin Kessel (abends am Bahnhofskiosk).',
      done: flag('ab_lockvogel'), optional: true, when: item('fake-implantat'), marker: { map: 'bahnhof-mitte', at: [196, 420] },
    },
    {
      id: 'bericht', text: 'Dante erzählen, wie es wirklich gelaufen ist.',
      done: flag('ab_abgeschlossen'), when: GESTOPPT, marker: { map: 'dantes-werkstatt', at: [600, 290] },
    },
  ],
  reward: { xp: 180, credits: 250, rep: { unterstadt: 10 } },
};

// --------------------------------------------------------------------------------------------- Dante
const auftrag: DialogueDef = {
  id: 'ab-dante-auftrag',
  start: 'start',
  nodes: [
    node('start', [
      L(D, 'Hast du die zwei Typen am Bahnhof gesehen? Knut und Kurt? Pilzköpfe, Muskeln, Hirn in Erbsengröße? Die ziehen Neuankömmlinge ab. Jeden Abend.'),
      L(D, 'Ich hab’s denen gezeigt. Letzte Woche. Bin hin, hab mich aufgebaut, hab gesagt: „Nicht mit mir, Freunde.“ Und dann hab ich … sie … sehr energisch stehen lassen.'),
      N('Captain Kuschel lässt beide Ohren hängen. Ein sehr eindeutiges Ohrensignal.'),
      L(D, 'Er sagt gar nichts. Er hat nichts gesehen. Er war in meiner Jackentasche.'),
    ], {
      choices: [
        { text: '„Du bist gerannt, oder?“', next: 'gerannt' },
        { text: '„Ich kümmer mich um die zwei.“', next: 'ja' },
        bye('„Klingt, als hättest du alles im Griff.“'),
      ],
    }),
    node('gerannt', [
      L(D, 'Ich bin … taktisch zurückgewichen! In hohem Tempo! Mit Kurswechseln! Das ist eine anerkannte Kampfkunst, um Himmels Willen!', 'verlegen'),
      L(D, 'Okay. Ja. Ich bin gerannt. Bis zur Rohrsiedlung. Ich hab noch zwei Tage Seitenstechen gehabt.'),
    ], { next: 'ja' }),
    node('ja', [
      L(D, 'Die hängen abends auf dem Bahnsteig rum und schlafen im alten U-Bahn-Wagen. Wenn du mit denen redest, sag ihnen nicht, dass ich dich geschickt hab. Oder sag es. Sag es laut. Sag, dass ich gefährlich bin.'),
    ], {
      effects: [{ startQuest: Q }],
      choices: [
        { text: '„Hast du was, das aussieht wie ein teures Implantat? Für einen Köder.“', next: 'koeder' },
        { text: '„Bis später, Kampfsportler.“' },
      ],
    }),
    node('koeder', [
      L(D, 'Ein KÖDER! Heiliges Kanonenrohr, ein Lockvogel-Plan! Wie im Film!', 'freude'),
      N('Dante wühlt in einer Kiste und klebt in neunzig Sekunden aus einem Fahrradlicht, zwei Kondensatoren und einem Aufkleber „QUANTUM PREMIUM“ ein glänzendes Ding zusammen, das sehr teuer und sehr nutzlos aussieht.'),
      L(D, 'Das Fake-Implantat. Leuchtet blau, piept, macht absolut gar nichts. Wie die Oberstadt. Allein schaffst du das aber nicht – nimm jemanden mit Handschellen mit. Kessel ist abends am Bahnhofskiosk und kauft Kreuzworträtsel.'),
    ], { effects: [{ give: 'fake-implantat' }] }),
  ],
};

// --------------------------------------------------------------------------------------------- Bahnsteig
const bahnsteig: DialogueDef = {
  id: 'ab-bahnsteig',
  start: 'start',
  nodes: [
    node('start', [
      N('Ein Zug spuckt Pendler aus. Mittendrin ein Junge mit Rucksack und dem Blick eines Menschen, der zum ersten Mal in der Unterstadt ist und es schon bereut.'),
      N('Zwei Brüder lösen sich von der Wand. Pilzköpfe, Muskelshirts, identische Gesichter, nur einer hat einen Schnurrbart, der aussieht wie aufgeklebt.'),
      L('knut', 'Na, Frischling? Hübsches Implantat am Ohr. Willst du’s behalten oder willst du lieber gesund bleiben?'),
      L('kurt', 'Beides geht nicht. Das ist Mathe.'),
    ], {
      choices: [
        { text: 'Dazwischengehen. „Verpisst euch, ihr zwei Champignons.“', next: 'dazwischen' },
        { text: 'Beobachten, wohin sie danach verschwinden.', next: 'beobachten' },
      ],
    }),
    node('dazwischen', [
      N('Die Brüder drehen sich um. Langsam. Synchron. Der Junge nutzt die Sekunde und rennt.'),
      L('knut', 'Champignons? CHAMPIGNONS?'),
      L('kurt', 'Das sag ich meiner Mama!'),
      N('Die beiden ziehen ab, nicht ohne dir dreimal über die Schulter mit dem Finger zu drohen. Sie verschwinden durch die rostige Tür zum alten U-Bahn-Wagen am Ende des Bahnsteigs.'),
    ], { effects: [set('ab_spur'), rel('kurt', -20), rel('knut', -20)] }),
    node('beobachten', [
      N('Sie nehmen dem Jungen das Ohrimplantat ab, klopfen ihm auf die Schulter und geben ihm zwei Credits für die Rückfahrt. Abzieher mit Kundenservice.'),
      N('Dann schlurfen sie durch die rostige Tür zum stillgelegten U-Bahn-Wagen. Drinnen geht eine Lichterkette an.'),
    ], { effects: [set('ab_spur')] }),
  ],
};

// --------------------------------------------------------------------------------------------- Brüder im Wagen
const brueder: DialogueDef = {
  id: 'ab-brueder',
  start: 'start',
  nodes: [
    node('start', [
      N('Der alte Wagen ist eingerichtet wie ein Jugendzimmer, das nie erwachsen wurde: Kerzen, Matratzen, eine Kiste mit geklauten Implantaten. Am Mini-Kühlschrank ein Foto ihrer Mutter mit Lockenwicklern.'),
      L('knut', 'Ey. Das ist privat hier. Wer hat dich reingelassen?'),
      L('kurt', 'Die Tür. Die Tür hat ihn reingelassen, Knut. Die Tür ist kaputt.'),
      N('Hinter ihnen lehnen zwei Rostzähne an der Wand, angeheuerte Muskeln, die gelangweilt mit Ketten spielen.'),
    ], {
      choices: [
        { text: '„Ihr zwei seht aus wie Türsteher. Ehrliche Arbeit. Festes Geld. Und eure Mama wäre stolz.“', check: 'gc-74', next: 'arbeit' },
        {
          text: 'Dante anrufen und auf Lautsprecher stellen. „Erzähl den beiden, wie das letzte Woche war.“', tag: '[Dante ♥3]',
          requires: hearts(D, 3), next: 'gestaendnis',
        },
        { text: '„Ihr gebt die Implantate zurück. Jetzt. Oder ich hol sie mir.“', next: 'kampf' },
        bye('„Schönes Foto von eurer Mama. Ich geh dann mal.“'),
      ],
    }),
    node('kampf', [
      L('knut', 'Holen? Du? Jungs!'),
      N('Die Rostzähne stoßen sich von der Wand ab. Knut knackt mit den Fingern. Kurt knackt mit den Fingern und jault leise, weil er sich einen verstaucht hat.'),
    ], { effects: [{ battle: 'enc-ubahn-abzieher' }] }),
    node('arbeit', [
      L('knut', 'Türsteher?'),
      P('Ihr steht doch eh den ganzen Abend irgendwo rum und guckt böse. Im High Voltage kriegt ihr dafür Geld. Und eine Jacke mit „Security“ drauf.'),
      L('kurt', 'Eine JACKE?'),
      L('knut', 'Mit Aufdruck?'),
      P('Hinten. Groß. Damit jeder weiß, dass ihr wichtig seid.'),
      N('Die Brüder sehen sich an. Ein ganzes Leben voller Entscheidungen, die immer falsch waren, zieht durch diesen Blick.'),
      L('knut', 'Mama sagt immer, wir sollen was Anständiges machen.'),
      L('kurt', 'Mama sagt auch, wir sehen wenigstens gefährlich aus.'),
      L('knut', 'Das stimmt. Wir sehen wenigstens gefährlich aus.'),
      N('Knut schiebt dir die Kiste mit den geklauten Implantaten hin. Kurt winkt den Rostzähnen, die schulterzuckend abziehen. Wer zahlt, bestimmt.'),
      L('kurt', 'Sag dem Chef da im Club, wir fangen morgen an. Und sag ihm, wir wollen Mitarbeiterrabatt.'),
    ], { effects: [set('ab_tuersteher'), set('hv_eintritt_frei'), rel('knut', 60), rel('kurt', 60), msg('Knut und Kurt sind ab sofort Türsteher am High Voltage. Für dich: freier Eintritt.')] }),
    node('gestaendnis', [
      N('Es klingelt zweimal. Dann Dantes Stimme, blechern und zu laut aus dem Telefon.'),
      L(D, 'Hallo? Hallo! Ja, ich weiß, wer da ist, ich höre das Atmen! Hört zu, ihr zwei, letzte Woche, ich will ehrlich sein –'),
      L(D, 'Ich bin gerannt. Ich bin so schnell gerannt, dass ich meinen linken Schuh verloren habe. Der liegt noch irgendwo in der Rohrsiedlung. Ich hab mich in einer Mülltonne versteckt. Zwei Stunden. Mit einer Ratte. Die Ratte hat mich getröstet.'),
      N('Stille. Dann prustet Kurt. Dann Knut. Dann liegen beide auf den Matratzen und heulen vor Lachen. Einer der Rostzähne lacht mit, bis er nicht mehr kann und sich am Haltegriff festhält.'),
      L('knut', 'Die RATTE! Die Ratte hat ihn GETRÖSTET!'),
      L('kurt', 'Wir haben gedacht, du bist so ein Kampfmönch! Du warst so SCHNELL!'),
      L(D, 'Ich war auch schnell! Das war das Beeindruckende daran!'),
      L('knut', 'Okay. Okay, hör auf, ich krieg keine Luft. Wer so ehrlich ist, dem tun wir nix. Und seinen Leuten auch nicht. Wir lassen das. Das Abziehen. Ist eh peinlich geworden.'),
      L('kurt', 'Wir geben die Sachen zurück. Aber erzähl das mit der Ratte noch mal. Für Mama. Die muss das hören.'),
    ], { effects: [set('ab_dante_gestaendnis'), rel(D, 40), rel('knut', 40), rel('kurt', 40)] }),
  ],
};

// --------------------------------------------------------------------------------------------- Lockvogel
const kessel: DialogueDef = {
  id: 'ab-kessel',
  start: 'start',
  nodes: [
    node('start', [
      N('Wachtmeisterin Kessel steht am Bahnhofskiosk, Feierabendgesicht, ein Kreuzworträtselheft in der einen und einen Synth-Kaffee in der anderen Hand.'),
      L('wache', 'Dienstschluss. Ich bin nicht im Dienst. Ich sehe nur zufällig noch aus wie im Dienst.'),
    ], {
      choices: [
        { text: '„Zwei Abzieher am Bahnsteig. Ich spiel den Köder, Sie klicken die Handschellen.“', next: 'plan' },
        bye('„Schönen Feierabend.“'),
      ],
    }),
    node('plan', [
      L('wache', 'Knut und Kurt. Natürlich. Ich habe eine eigene Strichliste nur für die beiden. Siebenundvierzig Striche. Bei fünfzig kriegen sie einen Kaffeebecher.'),
      L('wache', 'Vorschrift sagt: keine Lockvögel ohne richterliche Anordnung. Mein Kreuzworträtsel sagt: „Zivilcourage, elf Buchstaben“. Ich nehm das als Anordnung.'),
      L('wache', 'Stellen Sie sich mit dem Ding an die Bahnsteigkante. Gucken Sie dumm. Das können Sie bestimmt. Ich steh hinter der Säule.'),
    ], { effects: [set('ab_kessel_dabei'), rel('wache', 20)] }),
  ],
};

const lockvogel: CutsceneDef = {
  id: 'ab-lockvogel',
  title: 'Der Lockvogel',
  beats: [
    tafel('Bahnsteig, Bahnhof Mitte. Du stehst an der Kante, das Fake-Implantat blinkt blau am Ohr. Es piept alle zehn Sekunden. Unauffälliger geht es nicht.', undefined, 'in'),
    tafel('Knut und Kurt lösen sich von der Wand wie zwei Schatten mit Pilzfrisur.', [
      L('knut', 'Na, Frischling? Was ist DAS denn? Quantum Premium?'),
      L('kurt', 'Das ist so teuer, das muss wehtun.'),
      P('Bitte nicht. Das hat mir meine Oma geschenkt.'),
    ]),
    tafel('Knut greift zu. Zwei Klicks. Die Handschellen sitzen, bevor er das Ding überhaupt in der Hand hat.', [
      L('wache', 'Knut und Kurt. Strich achtundvierzig und neunundvierzig. Glückwunsch. Ich hoffe, wir sehen uns nicht wieder. Wir sehen uns aber wieder. Morgen. Beim Bagatellgericht.'),
      L('kurt', 'Das sag ich meiner Mama!'),
      L('wache', 'Ich hab sie schon angerufen. Sie kommt. Mit Lockenwicklern.'),
    ]),
    tafel('Die Brüder werden blass. Zum ersten Mal sehen sie wirklich gefährlich aus. Vor Angst.'),
  ],
  effects: [set('ab_lockvogel'), rel('wache', 40), msg('Knut und Kurt sind aus dem Verkehr gezogen. Ihre Mama ist unterwegs. Das ist die eigentliche Strafe.')],
};

const bericht: DialogueDef = {
  id: 'ab-dante-bericht',
  start: 'start',
  nodes: [
    node('start', [L(D, 'Und? Und? Erzähl! Hast du ihnen gesagt, dass ich gefährlich bin?')], {
      choices: [
        { text: '„Sie sind jetzt Türsteher im High Voltage. Mit Jacke.“', when: flag('ab_tuersteher'), next: 'tuer' },
        { text: '„Du hast ihnen das mit der Ratte erzählt. Sie lieben dich jetzt.“', when: flag('ab_dante_gestaendnis'), next: 'ratte' },
        { text: '„Kessel hat sie einkassiert. Und ihre Mama angerufen.“', when: flag('ab_lockvogel'), next: 'mama' },
        { text: '„Ich hab sie verprügelt. Und ihre zwei Rostzähne gleich mit.“', when: { won: 'enc-ubahn-abzieher' }, next: 'kampf' },
      ],
    }),
    node('tuer', [
      L(D, 'TÜRSTEHER? Die zwei? Bei Hunter? Heiliges Kanonenrohr, jetzt muss ich jedes Mal an denen vorbei, wenn ich tanzen will!', 'ueberrascht'),
      L(D, '… Glaubst du, die lassen mich umsonst rein? Als, du weißt schon. Ehemaliger Gegner? Ehrenwerter Feind?'),
    ], { next: 'ende' }),
    node('ratte', [
      L(D, 'Sie lachen immer noch. Ich hab heute schon drei Anrufe bekommen. Ihre Mama hat angerufen. Sie will die Ratte kennenlernen.', 'verlegen'),
      L(D, 'Weißt du was? Es war befreiend. Ehrlichkeit. Ich sollte das öfter machen. Nein. Ich sollte das manchmal machen.'),
    ], { next: 'ende' }),
    node('mama', [
      L(D, 'Ihre MAMA? Um Himmels Willen. Ich hab die mal gesehen. Die Frau ist ein Naturereignis. Die Lockenwickler sind gepanzert.'),
      L(D, 'Das ist grausam. Das ist genial. Das ist grausam genial.'),
    ], { next: 'ende' }),
    node('kampf', [
      L(D, 'Verprügelt? Mit Fäusten? So richtig?', 'ueberrascht'),
      L(D, 'Erzähl’s keinem, aber ich hab mir genau das vorgestellt. In der Mülltonne. Zwei Stunden lang. Mit der Ratte.'),
    ], { next: 'ende' }),
    node('ende', [
      L(D, 'Hier. Die Brüder hatten eine Kiste mit Implantaten. Die Hälfte hab ich schon den Leuten zurückgegeben, die andere verkauf ich für dich, und das hier ist dein Anteil. Ehrliche Arbeit! Fast.'),
    ], { effects: [set('ab_abgeschlossen'), rel(D, 30), { completeQuest: Q }] }),
  ],
};

const koeder: DialogueDef = { id: 'ab-dante-koeder', start: 'koeder', nodes: auftrag.nodes };

const fakeImplantat: ItemDef = {
  id: 'fake-implantat',
  name: 'Fake-Implantat',
  category: 'quest',
  icon: 'fake-implantat',
  price: 0,
  sellable: false,
  description: 'Fahrradlicht, zwei Kondensatoren, ein Aufkleber „QUANTUM PREMIUM“. Leuchtet blau, piept, macht absolut gar nichts. Wie die Oberstadt.',
};

const WAGEN = all(active(Q), not(GESTOPPT), ABEND_NACHT);

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: { [auftrag.id]: auftrag, [koeder.id]: koeder, [bahnsteig.id]: bahnsteig, [brueder.id]: brueder, [kessel.id]: kessel, [bericht.id]: bericht },
  cutscenes: { [lockvogel.id]: lockvogel },
  items: { [fakeImplantat.id]: fakeImplantat },
  mapAdditions: {
    'dantes-werkstatt': {
      hotspots: [
        { id: 'ab-dante-auftrag', at: 'werkbank', label: 'Dante: Die zwei Typen', kind: 'talk', dialogue: auftrag.id, when: all(inactive(Q), { met: D }, time('tag')) },
        { id: 'ab-dante-auftrag-abend', at: 'plattenspieler', label: 'Dante: Die zwei Typen', kind: 'talk', dialogue: auftrag.id, when: all(inactive(Q), { met: D }, time('abend')) },
        { id: 'ab-dante-bericht', at: 'werkbank', label: 'Dante: Bericht', kind: 'talk', dialogue: bericht.id, when: all(active(Q), GESTOPPT, time('tag')) },
        { id: 'ab-dante-bericht-abend', at: 'plattenspieler', label: 'Dante: Bericht', kind: 'talk', dialogue: bericht.id, when: all(active(Q), GESTOPPT, time('abend')) },
        {
          id: 'ab-dante-koeder', at: 'werkbank', label: 'Dante: Köder bauen lassen', kind: 'talk', dialogue: koeder.id,
          when: all(active(Q), not(GESTOPPT), { noItem: 'fake-implantat' }, noFlag('ab_lockvogel'), time('tag')),
        },
      ],
    },
    'bahnhof-mitte': {
      hotspots: [
        {
          id: 'ab-bahnsteig', at: 'bahnsteig', label: 'Knut und Kurt beobachten', kind: 'look', dialogue: bahnsteig.id,
          when: all(active(Q), noFlag('ab_spur'), not(GESTOPPT), time('abend')),
        },
        {
          id: 'ab-kessel', at: 'kiosk-bahnhof', label: 'Kessel: Lockvogel-Plan', kind: 'talk', dialogue: kessel.id,
          when: all(active(Q), item('fake-implantat'), noFlag('ab_kessel_dabei'), not(GESTOPPT), time('abend')),
        },
        {
          id: 'ab-lockvogel', at: 'bahnsteig', label: 'Lockvogel spielen', kind: 'use', once: true,
          when: all(active(Q), item('fake-implantat'), flag('ab_kessel_dabei'), not(GESTOPPT), time('abend')),
          effects: [{ take: 'fake-implantat' }, { cutscene: 'ab-lockvogel' }],
        },
      ],
    },
    'ubahn-wagen': {
      hotspots: [
        { id: 'ab-brueder', at: 'abzieher-lager', label: 'Mit Knut und Kurt reden', kind: 'talk', dialogue: brueder.id, when: WAGEN },
      ],
    },
  },
};
