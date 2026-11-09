// side-rattenkoenig „Seine Majestät Nagbert“ (world.md §6.2 Nr. 14) · Auftraggeber Bürgermeister Gully · kanal-sammler · jederzeit.
// Die Zone legt Thronsaal-Tor (Dialog `kanal-thronsaal-tor`), Rattenwachen `rattennest-1..3` und den Boss `nagbert` an
// (design/plan/gaps/maps-kanal-sammler.md). Hier: Auftrag, Schritte, Captain Kuschel von Dante leihen, Abschluss bei Gully.
// Wege: Boss enc-kanal-nagbert · gc-73 Lebendfalle mit Käseköder · Captain Kuschel (Dantes Erlaubnis oder Nyra mit
// nyra_hat_kuschel) · [Gosse] Röstzwiebeln.
import type { ContentPart } from '../../part';
import type { CutsceneDef, DialogueDef, QuestDef } from '../../../modules/contracts';
import { L, N, P, active, all, any, bye, flag, inactive, item, msg, node, noFlag, not, rel, set, tafel, time } from './_lib';

const Q = 'side-rattenkoenig';
const G = 'buergermeister-gully';

const GELOEST = any(flag('nagbert_geloest'), { won: 'enc-kanal-nagbert' });
const wache = (n: number) => any({ won: `enc-kanal-rattenwache-${n}` }, { seen: `avoid:kanal-sammler:rattennest-${n}` });

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: 'Seine Majestät Nagbert',
  summary: 'Ein Rattenkönig mit Kronkorken-Krone frisst dem Kanalvolk die Ersatzteile weg. Bürgermeister Gully ruft den Notstand aus. Schon wieder.',
  giver: G,
  act: 1,
  steps: [
    { id: 'wache-1', text: 'Rattenwache am Weststeg: vorbeischleichen oder verjagen.', done: wache(1), optional: true, marker: { map: 'kanal-sammler', at: [262, 556] } },
    { id: 'wache-2', text: 'Rattenwache an der Brücke: vorbeischleichen oder verjagen.', done: wache(2), optional: true, marker: { map: 'kanal-sammler', at: [1133, 420] } },
    { id: 'wache-3', text: 'Rattenwache vor dem Thronsaal: vorbeischleichen oder verjagen.', done: wache(3), optional: true, marker: { map: 'kanal-sammler', at: [1098, 668] } },
    {
      id: 'kuschel', text: 'Idee: Dante fragen, ob Captain Kuschel einen diplomatischen Einsatz übernimmt.',
      done: any(item('captain-kuschel'), flag('rk_kuschel_geliehen'), flag('nagbert_verliebt')), optional: true,
      when: flag('rk_idee_kuschel'), marker: { map: 'dantes-werkstatt', at: [600, 290] },
    },
    {
      id: 'nagbert', text: 'Nagbert vom Thron holen: Kampf, Lebendfalle mit Käseköder, ein Hase mit großen Ohren – oder Röstzwiebeln.',
      done: GELOEST, marker: { map: 'kanal-sammler', at: [1300, 860] },
    },
    {
      id: 'bericht', text: 'Bürgermeister Gully Bericht erstatten (morgens und tags im Rathaus, abends am Rechen, nachts an der Thronsaal-Grenze).',
      done: flag('rk_bericht'), when: GELOEST, marker: { map: 'kanal-sammler', at: [700, 272] },
    },
  ],
  reward: {
    xp: 260,
    credits: 300,
    items: { kronkorkenkrone: 1 },
    rep: { kanalvolk: 25 },
    effects: [msg('Die Kanal-Schnellwege sind offen. Das Kanalvolk winkt dir jetzt mit allen Händen. Und einer Ratte.')],
  },
};

const auftrag: DialogueDef = {
  id: 'rk-gully-auftrag',
  start: 'start',
  nodes: [
    node('start', [
      N('Bürgermeister Gully steht auf einer umgedrehten Kiste, die Schärpe aus Absperrband quer über dem Bademantel, und hält eine Rede. Das Publikum besteht aus zwei Kindern, einem Eimer und einer sehr dicken Ratte. Die Ratte geht gerade.'),
      L(G, 'Bürger! Besucher! Sie da! Kraft meines Amtes als Oberhaupt der Rohre rufe ich hiermit den NOTSTAND aus! Den kleinen! Den mit Sirene!'),
      N('Er drückt auf eine Fahrradhupe. Es macht „möp“.'),
    ], {
      choices: [
        { text: '„Was ist denn los, Herr Bürgermeister?“', next: 'los' },
        { text: '„Schon wieder Notstand? Hattet ihr nicht letzte Woche einen?“', next: 'wieder' },
        bye('Langsam rückwärts gehen.'),
      ],
    }),
    node('wieder', [L(G, 'Das war der mittlere Notstand. Wegen Schimmel. Der ist abgelaufen. Also der Notstand, nicht der Schimmel.')], { next: 'los' }),
    node('los', [
      L(G, 'Nagbert.'),
      N('Er sagt den Namen, wie andere „Steuerprüfung“ sagen.'),
      L(G, 'Eine Ratte. Nein: DIE Ratte. Groß wie ein Kühlschrank, Krone aus zweihundertvierzehn Kronkorken, Manieren wie ein Oberstädter. Er hat sich im Thronsaal eingenistet. Unten rechts. In MEINEM Thronsaal.'),
      L(G, 'Er frisst unsere Ersatzteile. Dichtungen, Schrauben, ein komplettes Getriebe. Gestern meinen Amtsstempel. Ich kann keine Gesetze mehr erlassen! Ich muss alles mündlich regeln! Wie ein Tier!'),
      L(G, 'Und auf dem Weg dorthin hat er Wachen aufgestellt. Ratten mit Haltung. Man kann an ihnen vorbei, wenn man leise ist, oder klug, oder sehr laut.'),
    ], {
      choices: [
        { text: '„Ich hol ihn runter von Ihrem Thron.“', next: 'ja' },
        { text: '„Was zahlt das Kanalvolk für einen toten König?“', next: 'geld' },
        bye('„Ich hab Angst vor Ratten. Ernsthaft.“'),
      ],
    }),
    node('geld', [
      L(G, 'Tot? Wer sagt denn tot? Wir sind ein zivilisiertes Volk! Wir werfen Leute nur in Ausnahmefällen in den Kanal!'),
      L(G, 'Die Staatskasse zahlt dreihundert Credits. Das ist die ganze Staatskasse. Sie liegt in einer Keksdose. Und die Krone dürfen Sie behalten. Ich will sie nicht. Sie riecht nach ihm.'),
    ], { next: 'ja' }),
    node('ja', [
      L(G, 'Ein Held! Ein Held aus der Oberwelt! Ich verleihe Ihnen hiermit vorläufig den Titel „Kammerjäger ehrenhalber“!'),
      L(G, 'Nagbert liebt drei Dinge: Käse, Röstzwiebeln und sich selbst. Fluss-Frieda verkauft Käse. Röstzwiebeln … das ist eine Gossensache, das wissen die von unten. Und sich selbst – da kann man nichts machen.'),
      L(G, 'Ach, und er ist einsam. Glaube ich. Er singt nachts. Schief.'),
    ], {
      effects: [{ startQuest: Q }],
      choices: [
        { text: '„Einsam? … Ich kenn da einen Hasen.“', next: 'hase' },
        { text: '„Ich mach mich auf den Weg.“' },
      ],
    }),
    node('hase', [
      L(G, 'Einen Hasen? Einen echten? Mit Fell?'),
      P('Plüsch. Große Ohren. Gehört Dante. Er heißt Captain Kuschel.'),
      L(G, 'Ein Hauptmann! Diplomatie auf Offiziersebene! Kraft meines Amtes genehmige ich das. Fragen Sie den Besitzer. Ich will keinen internationalen Zwischenfall.'),
    ], { effects: [set('rk_idee_kuschel')] }),
  ],
};

const danteKuschel: DialogueDef = {
  id: 'rk-dante-kuschel',
  start: 'start',
  nodes: [
    node('start', [
      P('Dante. Ich brauch Captain Kuschel. Für einen diplomatischen Einsatz im Kanal. Bei einer Ratte. Einem König. Einem Rattenkönig.'),
      L('dante', 'Um Himmels Willen. Du willst meinen Captain zu NAGBERT schicken?', 'ueberrascht'),
      N('Captain Kuschel sitzt auf der Werkbank. Ein Ohr knickt ein. Skeptisch.'),
      L('dante', 'Er sagt, er ist Hauptmann, kein Heiratsschwindler.'),
    ], {
      choices: [
        { text: '„Nagbert ist einsam. Nur ein Kaffeeklatsch. Ich bring ihn heil zurück.“', next: 'ja' },
        { text: '„Er wäre ein Held. Ein Held des Kanalvolks. Mit Orden.“', next: 'orden' },
        bye('„Vergiss es. Ich regel das anders.“'),
      ],
    }),
    node('orden', [
      N('Beide Ohren gehen hoch. Steil.'),
      L('dante', 'Na toll. Jetzt will er einen Orden. Er hat nie einen Orden gekriegt. Ich hab ihm mal einen aus Kronkorken gebastelt, aber er wusste, dass der gefälscht war.'),
    ], { next: 'ja' }),
    node('ja', [
      L('dante', 'Okay. Okay! Aber: Er kommt heil zurück. Kein Kanalwasser in die Ohren. Und wenn diese Ratte ihn anfasst, dann nur mit sauberen Pfoten. Drei-Sekunden-Regel gilt NICHT für Hasen.'),
      N('Dante drückt Captain Kuschel einen Abschiedskuss zwischen die Ohren und reicht ihn dir mit beiden Händen, wie ein Ehrenamtlicher eine Spendenurne.'),
      L('dante', 'Pass auf ihn auf. Er ist alles, was ich habe. Also, außer der Werkstatt. Und den Platten. Und dem Fax. Aber emotional ist er alles.', 'besorgt'),
    ], { effects: [{ give: 'captain-kuschel' }, set('rk_kuschel_geliehen'), rel('dante', 10)] }),
  ],
};

const bericht: DialogueDef = {
  id: 'rk-gully-bericht',
  start: 'start',
  nodes: [
    node('start', [L(G, 'Kammerjäger! Sprechen Sie! Ist der Thron frei? Ist die Monarchie gestürzt? Darf ich wieder stempeln?')], {
      choices: [
        { text: '„Nagbert hat den Kampf verloren. Er ist Geschichte.“', when: { won: 'enc-kanal-nagbert' }, next: 'kampf' },
        { text: '„Nagbert sitzt in der Lebendfalle. Ab in die Brackbucht mit ihm.“', when: all(flag('nagbert_umgesiedelt'), not({ won: 'enc-kanal-nagbert' })), next: 'falle' },
        { text: '„Nagbert ist verliebt. In einen Hasen. Es ist kompliziert.“', when: all(flag('nagbert_verliebt'), not({ won: 'enc-kanal-nagbert' })), next: 'liebe' },
        { text: '„Ich hab ihm eine Spur aus Röstzwiebeln gelegt. Er ist jetzt … woanders.“', when: all(flag('nagbert_weggelockt'), not({ won: 'enc-kanal-nagbert' })), next: 'zwiebeln' },
        bye('„Ich arbeite dran.“'),
      ],
    }),
    node('kampf', [
      L(G, 'Gestürzt! Durch das Schwert! Also den Schläger! Oder was auch immer Sie da haben!'),
      N('Gully läutet die Glocke über dem Zelt. Aus allen Rohren kriechen Kanalleute, jubeln, schwenken Lumpen. Irgendwer spielt auf einem Eimer den Rhythmus einer Nationalhymne, die es nicht gibt.'),
      L(G, 'Er wird sich erholen, sagt Frieda. Im Schlick. Ratten wie er sterben nie, sie ziehen nur um.'),
    ], { next: 'lohn' }),
    node('falle', [
      L(G, 'Lebend! Gefangen! Und umgesiedelt! Das ist die humanste Rattenpolitik seit Menschengedenken!'),
      N('Über dir rattert ein Lastenkarren. Darauf, in einem Eimerkäfig mit Toasterfeder, thront Nagbert und guckt beleidigt. Vier Kanalkinder ziehen ihn singend Richtung Brackbucht.'),
      L(G, 'Dort hat er Schlick, Fischreste und keine Steuern. Er wird glücklich sein. Oder wenigstens woanders unglücklich.'),
    ], { next: 'lohn' }),
    node('liebe', [
      L(G, 'Verliebt? In den HAUPTMANN?'),
      P('Er hat ihn gesehen und die Krone abgenommen. Dann hat er gesungen. Schief. Captain Kuschel hat die Ohren hängen lassen. Das hat Nagbert als Ja verstanden.'),
      L(G, 'Und jetzt?'),
      P('Jetzt lässt er ihn nicht mehr los.'),
      N('Hinter dir taucht Oma Volt auf, Nähkorb unterm Arm, Brille auf der Nasenspitze. Woher sie weiß, dass sie gebraucht wird, sagt sie nicht. Sie weiß es einfach immer.'),
      L('oma-volt', 'Kindchen, gib mir eine Stunde und einen alten Kissenbezug. Ich näh der Ratte einen eigenen Hasen. Mit noch größeren Ohren. Männer merken den Unterschied nie.'),
    ], {
      next: 'liebe-ende',
    }),
    node('liebe-ende', [
      N('Eine Stunde später sitzt Nagbert auf seinem Thron, eine Kissenhasen-Kopie im Arm, und schnarcht selig. Er hat aufgehört zu fressen. Liebe macht satt, sagt Gully, und notiert das als Gesetz.'),
    ], {
      effects: [{ advanceTime: 60 }],
      choices: [
        { text: 'Captain Kuschel wieder einpacken. Dante wartet.', when: item('captain-kuschel'), effects: [{ take: 'captain-kuschel' }, set('rk_kuschel_zurueck'), msg('Captain Kuschel ist auf dem Rückweg zu Dante. Mit leicht verwirrten Ohren.')], next: 'lohn' },
        { text: 'Weiter.', when: not(item('captain-kuschel')), next: 'lohn' },
      ],
    }),
    node('zwiebeln', [
      L(G, 'Röstzwiebeln! Natürlich! Die alte Gossen-Methode! Meine Großmutter hat damit drei Rattenkriege gewonnen und einen Ehemann!'),
      N('Aus der Ferne, irgendwo hinter dem Rechen, hört man ein zufriedenes Schmatzen. Und ein schiefes Lied.'),
      L(G, 'Er ist jetzt im alten Überlaufbecken. Dort ist Platz für einen König. Und für seinen Mundgeruch.'),
    ], { next: 'lohn' }),
    node('lohn', [
      L(G, 'Kraft meines Amtes: Hiermit überreiche ich Ihnen die Staatskasse! Dreihundert Credits! In einer Keksdose! Die Dose will ich zurück.'),
      L(G, 'Und die Krone. Zweihundertvierzehn Kronkorken. Riecht nach Ratte, sieht aus nach Königin.'),
      L(G, 'Die Schnellweg-Gitter sind ab heute für Sie offen. Von hier bis zum Schrottmarkt, zur Hafenkante, zu den Lötgassen. Sie sind jetzt ein Freund der Rohre!'),
    ], { effects: [set('rk_bericht'), rel(G, 60), { completeQuest: Q }], next: 'fanfare' }),
    node('fanfare', [], { effects: [{ cutscene: 'rk-kroenung' }] }),
  ],
};

const kroenung: CutsceneDef = {
  id: 'rk-kroenung',
  title: 'Freund der Rohre',
  beats: [
    tafel('Trockendock, Kanal-Sammler. Die Leuchtpilze glimmen heller als sonst. Das Kanalvolk hat sich versammelt.', undefined, 'in'),
    tafel('Gully stempelt mit einem neuen Amtsstempel – geschnitzt aus einer Kartoffel – einen Zettel und klebt ihn dir auf die Brust: „FREUND DER ROHRE. DARF ÜBERALL DURCH.“', [
      L(G, 'Das Kanalvolk vergisst nie. Außer Geburtstage. Und wo die Dose mit der Staatskasse steht.'),
    ]),
    tafel('Irgendwo in der Dunkelheit singt eine Ratte schief. Es klingt fast zufrieden.'),
  ],
};

const KUSCHEL_FEHLT = all(not(item('captain-kuschel')), noFlag('nyra_hat_kuschel'), noFlag('rk_kuschel_geliehen'));
const RK_OFFEN = all(active(Q), not(GELOEST));

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: { [auftrag.id]: auftrag, [danteKuschel.id]: danteKuschel, [bericht.id]: bericht },
  cutscenes: { [kroenung.id]: kroenung },
  mapAdditions: {
    'kanal-sammler': {
      hotspots: [
        { id: 'rk-gully-auftrag', at: 'gullys-rathaus', label: 'Bürgermeister Gully: Notstand', kind: 'talk', dialogue: auftrag.id, when: all(inactive(Q), time('morgen', 'tag')) },
        { id: 'rk-gully-auftrag-rechen', at: 'rechen', label: 'Bürgermeister Gully: Notstand', kind: 'talk', dialogue: auftrag.id, when: all(inactive(Q), time('abend')) },
        { id: 'rk-gully-bericht', at: 'gullys-rathaus', label: 'Bürgermeister Gully: Bericht', kind: 'talk', dialogue: bericht.id, when: all(active(Q), GELOEST, time('morgen', 'tag')) },
        { id: 'rk-gully-bericht-rechen', at: 'rechen', label: 'Bürgermeister Gully: Bericht', kind: 'talk', dialogue: bericht.id, when: all(active(Q), GELOEST, time('abend')) },
        { id: 'rk-gully-bericht-grenze', at: 'thronsaal-grenze', label: 'Bürgermeister Gully: Bericht', kind: 'talk', dialogue: bericht.id, when: all(active(Q), GELOEST, time('nacht')) },
        {
          id: 'rk-gully-grenze', at: 'thronsaal-grenze', label: 'Bürgermeister Gully', kind: 'look', when: all(RK_OFFEN, time('nacht')),
          lines: [
            N('Gully hockt an der Thronsaal-Grenze, eine Taschenlampe in der Hand, und starrt ins Dunkel. Er zittert ein bisschen.'),
            L(G, 'Ich halte Wache. Für das Volk. Und weil ich nicht schlafen kann, wenn er singt.'),
          ],
        },
      ],
    },
    'dantes-werkstatt': {
      hotspots: [
        {
          id: 'rk-dante-kuschel', at: 'werkbank', label: 'Dante: Captain Kuschel ausleihen', kind: 'talk', dialogue: danteKuschel.id,
          when: all(RK_OFFEN, flag('rk_idee_kuschel'), KUSCHEL_FEHLT, { not: { act: 2 } }, time('tag')),
        },
      ],
    },
  },
};

