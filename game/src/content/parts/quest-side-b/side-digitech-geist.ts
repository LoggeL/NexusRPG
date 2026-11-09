// side-digitech-geist „Warum war niemand da?“ (world.md §6.2 Nr. 17) · Raven (in der Party) · digitech-areal, hafenkante
// · nach main-1-auf-raven. Die Zone legt `notstrom-terminal` (gc-76 → dienstplan-2079), `notstrom-terminal-hack` und die
// Gegnergruppe `pluenderer` (enc-ruine-pluenderer) an. Hier: Auftrag, gc-77 Hafenarbeiter, Beute der Plünderer,
// [Raven ♥3] Herz-Szene am Rohr im Tresor, Abschluss mit der Wahl, Xion zu konfrontieren (Xion −200).
import type { ContentPart } from '../../part';
import type { CutsceneDef, DialogueDef, PhoneMessageDef, QuestDef } from '../../../modules/contracts';
import { L, N, P, active, all, any, bye, done, flag, hearts, inactive, item, msg, node, noFlag, not, rel, set, tafel, time } from './_lib';

const Q = 'side-digitech-geist';
const R = 'raven';

const BEWEIS = item('dienstplan-2079');
const MIT_RAVEN = { companion: R } as const;

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: 'Warum war niemand da?',
  summary: 'Sieben Jahre lang hing Raven an einem Rohr im Digitech-Tresor. Sie hat geschrien. Niemand kam. In einem Gebäude, das sonst nachts voller Wachen war.',
  giver: R,
  act: 1,
  steps: [
    {
      id: 'ruine', text: 'In der Digitech-Ruine nach Spuren der Nachtschicht suchen. Nimm Raven mit.',
      done: any(BEWEIS, flag('dg_raven_zelle'), { won: 'enc-ruine-pluenderer' }, flag('dg_hafen_gefragt')),
      marker: { map: 'digitech-areal', at: [1068, 350] },
    },
    {
      id: 'beweis', text: 'Einen Beweis finden: Notstrom-Logs im Areal, die Plünderer mit ihren Aktenbergen, alte Hafenarbeiter an der Kai-Mitte – oder Ravens Erinnerung.',
      done: BEWEIS, marker: { map: 'digitech-areal', at: [1068, 350] },
    },
    {
      id: 'zelle', text: 'Mit Raven an das Rohr im Tresor gehen (Raven ♥3, in der Party).',
      done: flag('dg_raven_zelle'), optional: true, when: hearts(R, 3), marker: { map: 'digitech-tresor' },
    },
    {
      id: 'raven', text: 'Raven zeigen, was du gefunden hast (abends im High Voltage, tags am Schrottmarkt).',
      done: flag('dg_abgeschlossen'), when: BEWEIS, marker: { map: 'high-voltage', at: [250, 470] },
    },
  ],
  reward: { xp: 240, relations: { [R]: 60 } },
};

// ------------------------------------------------------------------------------------------------ Auftakt
const auftrag: DialogueDef = {
  id: 'dg-raven-auftrag',
  start: 'start',
  nodes: [
    node('start', [
      N('Raven sitzt am Tresen, vor sich einen Kaffee, den sie nicht trinkt. Sie dreht die Tasse, eine Vierteldrehung, noch eine.'),
      L(R, 'Kann ich dich was fragen?'),
      P('Seit wann fragst du vorher?'),
      L(R, 'Seit jetzt.'),
      L(R, 'Die Nacht im Digitech-Tresor. Blade hat mich ans Rohr gekettet und ist gegangen. Ich hab geschrien. Stundenlang. Das Gebäude hatte eine Nachtschicht. Zwölf Wachen. Hunde. Drohnen.'),
      L(R, 'Niemand kam. Bis morgens um sechs. Und dann kamen sie alle auf einmal, mit Kameras.', 'trauer'),
      L(R, 'Warum war niemand da?'),
    ], {
      choices: [
        { text: '„Wir finden es raus. Zusammen.“', next: 'ja' },
        { text: '„Vielleicht war es einfach Pech.“', next: 'pech' },
        bye('„Das ist sieben Jahre her, Raven.“'),
      ],
    }),
    node('pech', [
      L(R, 'Billige Lüge. Pech hat keine Dienstpläne.'),
    ], { choices: [{ text: '„Okay. Dann suchen wir den Dienstplan.“', next: 'ja' }, bye('„Ich kann das nicht.“')] }),
    node('ja', [
      L(R, 'Die Ruine steht noch. Digitech-Areal, hinter dem Bauzaun. Ich war seitdem nicht da.'),
      L(R, 'Ich komm mit. Ich will es sehen. Und wenn ich auf dem Weg einen Plünderer verprügle, dann ist das Therapie.', 'signatur'),
    ], { effects: [{ startQuest: Q }, rel(R, 20)] }),
  ],
};

// ------------------------------------------------------------------------------------------------ Hafenarbeiter (gc-77)
const hafen: DialogueDef = {
  id: 'dg-hafenarbeiter',
  start: 'start',
  nodes: [
    node('start', [
      N('An der Kai-Mitte sitzen ein paar alte Hafenarbeiter auf umgedrehten Kisten und spielen Karten um Schrauben. Hafen-Hannes ist dabei, sein Greifarm mischt.'),
      L('hafen-hannes', 'Digitech? Die Nacht mit dem Kabelbrand? Da hatten wir Sonderschicht. Nicht wir. Die Wachleute vom Areal. Die kamen alle hier runter. Mitten in der Nacht.'),
    ], {
      choices: [
        { text: '„Wer hat sie geschickt? Ihr kennt die Kuriercodes, ihr kennt die Laster. Wer hat unterschrieben?“', check: 'gc-77', next: 'erinnerung' },
        { text: '„Warum kamen die runter?“', next: 'warum' },
        bye('„Danke. Ich hör mich weiter um.“'),
      ],
    }),
    node('warum', [
      L('hafen-hannes', 'Angeblich ein „Notfall-Löschzug“ am Hafen. Brannte aber nix. Die standen drei Stunden rum, haben geraucht und auf Befehle gewartet. Dann hieß es: zurück. Um sechs.'),
      L('hafen-hannes', 'Wer’s war, weiß ich nicht mehr. Ist lang her. Da brauchst du schon jemand, der sich in Gerüchten auskennt.'),
    ], { effects: [set('dg_hafen_gefragt')] }),
    node('erinnerung', [
      N('Die alten Männer sehen sich an. Einer legt die Karten weg. Ein anderer spuckt ins Hafenbecken.'),
      L('hafen-hannes', 'Der Typ mit der Kralle.'),
      P('Der Typ mit der was?'),
      L('hafen-hannes', 'Quantum-Mann. Anzug, Sonnenbrille, an der rechten Hand so ein Metallding mit drei Krallen. Kam mit einem Wagen, hat dem Schichtleiter einen Zettel unter die Nase gehalten. „Nachtschicht abgezogen, auf Anweisung.“ Unterschrift: X. Venom.'),
      L('hafen-hannes', 'Der alte Piet hat eine Kopie davon behalten. Wollte damals klagen, weil sie nicht bezahlt wurden. Piet ist tot. Aber seine Kiste hab ich noch.'),
      N('Hannes klappt mit dem Greifarm eine Werkzeugkiste auf und holt einen vergilbten, gefalteten Zettel heraus. Er riecht nach Diesel und alten Ausreden.'),
    ], { effects: [{ give: 'dienstplan-2079' }, set('dg_hafen_gefragt'), msg('Erhalten: Dienstplan 2079. Ein Name: X. Venom.')] }),
  ],
};

// ------------------------------------------------------------------------------------------------ Ravens Erinnerung am Rohr
const zelle: CutsceneDef = {
  id: 'dg-zelle',
  title: 'Das Rohr',
  beats: [
    tafel('Digitech-Tresor. Das Rohr ist noch da. Die Farbe drumherum ist abgeschabt, in Handbreite. Sieben Jahre Staub, und trotzdem sieht man, wo jemand gezerrt hat.', undefined, 'in'),
    tafel('Raven bleibt zwei Schritte davor stehen. Sie fasst es nicht an.', [
      L(R, 'Hier. Ich konnte bis zur Tür sehen, wenn ich den Kopf gedreht hab. Ich hab sie die ganze Nacht angestarrt.'),
      L(R, 'Am Anfang hab ich geschrien. Dann hab ich gezählt. Bis zehntausend. Dann rückwärts.'),
    ]),
    tafel('Sie geht in die Hocke, auf Augenhöhe mit der abgeschabten Stelle.', [
      L(R, 'Gegen vier hab ich ein Auto gehört. Unten. Eine Tür. Jemand hat gelacht. Ich dachte: Endlich. Jetzt kommen sie.'),
      L(R, 'Sie kamen nicht. Und der Pförtner – der alte Ole, der immer gepennt hat – der hat seine Dienstpläne ausgedruckt und unter den Kaffeebecher im Pförtnerhaus geklemmt. Ich hab sie damals gelesen, bevor wir reingegangen sind. Ich wusste, wie viele Wachen da sein sollten.'),
      L(R, 'Ich wusste es. Und hab mir sieben Jahre lang eingeredet, ich hätte mich verzählt.', 'trauer'),
    ]),
    tafel('Sie steht auf. Ihre Hand liegt einen Moment lang auf deinem Arm. Nur einen Moment.', [
      L(R, 'Pförtnerhaus. Die Ablage. Wenn Ole so ist wie damals, hat er nie was weggeworfen.'),
    ]),
  ],
  effects: [set('dg_raven_zelle'), rel(R, 60), { markSeen: 'dg-zelle' }],
};

const pfoertner: DialogueDef = {
  id: 'dg-pfoertner-ablage',
  start: 'start',
  nodes: [
    node('start', [
      N('Die Ablage im Pförtnerhaus: ein Stapel Papier, eine Ewigkeit hoch, gekrönt von einem Kaffeebecher mit Kalkrand. Ole Gähn hat wirklich nie etwas weggeworfen.'),
      N('Du blätterst. Lottoscheine. Speisepläne. Ein Liebesbrief, nie abgeschickt. Und dann: „DIENSTPLAN NACHTSCHICHT, 14.03.2079“. Alle zwölf Namen durchgestrichen. Am Rand, mit Kugelschreiber: „ABGEZOGEN – AUF ANWEISUNG X. VENOM“.'),
    ], { effects: [{ give: 'dienstplan-2079' }, msg('Erhalten: Dienstplan 2079.')], choices: [{ text: 'Einstecken.' }] }),
  ],
};

// ------------------------------------------------------------------------------------------------ Abschluss mit Raven
const bericht: DialogueDef = {
  id: 'dg-raven-bericht',
  start: 'start',
  nodes: [
    node('start', [
      N('Du legst den Dienstplan vor Raven hin. Sie liest ihn einmal. Dann noch mal. Ihr Finger bleibt auf dem Namen am Rand liegen.'),
      L(R, 'Xion Venom.'),
      L(R, 'Blade hat mich ans Rohr gekettet. Und Xion hat dafür gesorgt, dass mich keiner losmacht. Damit sie mich morgens schön präsentieren konnten. Mit Kameras. Frisch gefangen.'),
      N('Sie faltet den Zettel zusammen, sehr ordentlich, Kante auf Kante.'),
      L(R, 'Ich dachte, ich bin wütend, wenn ich’s weiß. Bin ich nicht. Ich bin … leichter.', 'zaertlich'),
    ], {
      choices: [
        { text: '„Schicken wir ihm ein Foto davon. Er soll wissen, dass wir’s wissen.“', next: 'xion' },
        { text: '„Behalten wir’s für den richtigen Moment.“', next: 'warten' },
        { text: '„Du warst nicht allein da drin. Nicht wirklich. Jetzt weißt du, dass es Absicht war.“', next: 'trost' },
      ],
    }),
    node('xion', [
      N('Raven zückt ihr Telefon, fotografiert den Dienstplan und tippt. Nur zwei Wörter. Sie zeigt sie dir nicht. Sie drückt auf Senden.'),
      L(R, 'Jetzt weiß er, dass jemand zählt.', 'signatur'),
    ], { effects: [rel('xion-venom', -200), set('dg_xion_konfrontiert'), { phone: 'dg-xion-antwort' }], next: 'ende' }),
    node('warten', [
      L(R, 'Gut. Rache wird kalt serviert. Wie Hunters Kaffee.'),
    ], { effects: [set('dg_xion_spaeter')], next: 'ende' }),
    node('trost', [
      L(R, '…'),
      L(R, 'Kitschig.'),
      N('Sie stößt dir mit der Schulter gegen die Schulter. Nicht fest.'),
      L(R, 'Aber nicht falsch.'),
    ], { effects: [rel(R, 20)], next: 'ende' }),
    node('ende', [L(R, 'Danke. Sag’s keinem, dass ich danke gesagt hab.')], { effects: [set('dg_abgeschlossen'), { completeQuest: Q }] }),
  ],
};

const xionAntwort: PhoneMessageDef = {
  id: 'dg-xion-antwort',
  from: 'xion-venom',
  text: 'Interessantes Stück Papier. Altpapier, um genau zu sein. Grüß Raven. Sag ihr, Rohre sind heutzutage viel bequemer. – X.',
};

const OFFEN = all(active(Q), not(BEWEIS));

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: { [auftrag.id]: auftrag, [hafen.id]: hafen, [pfoertner.id]: pfoertner, [bericht.id]: bericht },
  cutscenes: { [zelle.id]: zelle },
  phone: { [xionAntwort.id]: xionAntwort },
  mapAdditions: {
    'high-voltage': {
      hotspots: [
        { id: 'dg-raven-auftrag', at: 'bar-hocker', label: 'Raven: Warum war niemand da?', kind: 'talk', dialogue: auftrag.id, when: all(inactive(Q), done('main-1-auf-raven'), time('abend')) },
        { id: 'dg-raven-bericht', at: 'bar-hocker', label: 'Raven den Dienstplan zeigen', kind: 'talk', dialogue: bericht.id, when: all(active(Q), BEWEIS, time('abend')) },
      ],
    },
    schrottmarkt: {
      hotspots: [
        { id: 'dg-raven-bericht-tag', at: 'raven-ecke', label: 'Raven den Dienstplan zeigen', kind: 'talk', dialogue: bericht.id, when: all(active(Q), BEWEIS, time('tag')) },
      ],
    },
    hafenkante: {
      hotspots: [
        { id: 'dg-hafenarbeiter', at: 'kai-mitte', label: 'Alte Hafenarbeiter fragen', kind: 'talk', dialogue: hafen.id, when: all(OFFEN, time('morgen', 'tag', 'abend')) },
      ],
    },
    'digitech-areal': {
      hotspots: [
        {
          id: 'dg-pluenderer-beute', at: 'pluenderer-lager', label: 'Aktenberg der Plünderer durchsuchen', kind: 'loot', once: true,
          when: all(OFFEN, { won: 'enc-ruine-pluenderer' }),
          lines: [N('Die Plünderer haben alte Digitech-Akten als Brennholz gehortet. Zwischen halb verkohlten Quartalsberichten: ein Dienstplan, Nachtschicht 2079. Ein Name am Rand, mit Kugelschreiber.')],
          effects: [{ give: 'dienstplan-2079' }, msg('Erhalten: Dienstplan 2079.')],
        },
        {
          id: 'dg-pfoertner-ablage', at: [392, 856], label: 'Oles Ablage durchwühlen', kind: 'use', dialogue: pfoertner.id,
          when: all(OFFEN, flag('dg_raven_zelle')),
        },
      ],
    },
    'digitech-tresor': {
      hotspots: [
        {
          id: 'dg-raven-rohr', at: 'tresor-rohr', label: 'Mit Raven ans Rohr gehen', kind: 'use', once: true,
          when: all(active(Q), MIT_RAVEN, hearts(R, 3), noFlag('dg_raven_zelle'), flag('prolog_done')),
          effects: [{ cutscene: 'dg-zelle' }],
        },
      ],
    },
  },
};
