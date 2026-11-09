// side-hunde-der-brackbucht „Die Hunde der Brackbucht“ (world.md §6.2 Nr. 20) · Henk Angler · flutmauer · M.
// Die Zone legt `hundespuren` (Flag hundespuren_gefunden), `alpha-hund` (gc-81 → bolzen_umprogrammiert) und die Gruppe
// `rudel-brackbucht` (enc-bucht-hunde) an. Hier: Auftrag, Ersatzteil-Spur bis zu Dexters Halde, Abschluss, Haustier Bolzen
// (Flag bolzen_haustier; beim Kampfweg findet man ihn später verletzt an der Halde).
import type { ContentPart } from '../../part';
import type { CutsceneDef, DialogueDef, QuestDef } from '../../../modules/contracts';
import { L, N, P, active, all, any, bye, done, flag, inactive, item, msg, node, noFlag, not, rel, set, tafel, time } from './_lib';

const Q = 'side-hunde-der-brackbucht';
const HE = 'henk-angler';

const GELOEST = any(flag('bolzen_umprogrammiert'), { won: 'enc-bucht-hunde' }, flag('hb_halde'));

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: 'Die Hunde der Brackbucht',
  summary: 'Jemand klaut Henk Angler die Fischernetze. Nachts leuchten in der Brackbucht Augen. Viele. Und sie sind aus Metall.',
  giver: HE,
  act: 1,
  steps: [
    { id: 'spuren', text: 'Die Spuren im Schlick der Brackbucht untersuchen.', done: any(flag('hundespuren_gefunden'), GELOEST), marker: { map: 'flutmauer', at: [860, 775] } },
    {
      id: 'loesen', text: 'Das Robohund-Rudel aufhalten: den Alpha umprogrammieren, das Rudel verjagen – oder mit Ersatzteilen weglocken (Henk hat eine Idee).',
      done: GELOEST, when: any(flag('hundespuren_gefunden'), GELOEST), marker: { map: 'flutmauer', at: [1265, 765] },
    },
    {
      id: 'halde', text: 'Der Ersatzteil-Spur bis zu Dexters Halde folgen.',
      done: flag('hb_dexter'), optional: true, when: flag('hb_halde'), marker: { map: 'schrottmarkt', at: [760, 160] },
    },
    { id: 'henk', text: 'Henk am Leuchtturm Bescheid sagen.', done: flag('hb_abgeschlossen'), when: GELOEST, marker: { map: 'flutmauer', at: [372, 312] } },
  ],
  reward: { xp: 200, credits: 200, rep: { unterstadt: 5 } },
};

const auftrag: DialogueDef = {
  id: 'hb-henk-auftrag',
  start: 'start',
  nodes: [
    node('start', [
      N('Henk Angler sitzt auf einem Klappstuhl am Fuß des Leuchtturms, eine Angel in der einen und einen Becher Kaffee mit Salzwasser in der anderen Hand. Sein Bart hat mehr Knoten als seine Netze. Er hat keine Netze mehr.'),
      L(HE, 'Moin. Hast du meine Netze gesehen? Nein? Keiner hat meine Netze gesehen. Drei Stück. Jede Nacht eins weniger.'),
      L(HE, 'Und nachts, da unten in der Brackbucht, da leuchtet’s. Augen. Rote. Dutzende. Und dann hört man ein Geräusch wie ein Kühlschrank, der bellt.'),
    ], {
      choices: [
        { text: '„Kühlschränke, die bellen? Klingt nach Robohunden.“', next: 'hunde' },
        { text: '„Ich schau mir das an.“', next: 'ja' },
        bye('„Kauf dir neue Netze, Opa.“'),
      ],
    }),
    node('hunde', [
      L(HE, 'Robohunde. Quantum-Ausschuss. Die haben die damals rausgeworfen, als die neuen Modelle kamen. Jetzt leben die in der Bucht und sind schlauer als die Möwen. Was nicht viel heißt.'),
      L(HE, 'Die tun keinem was. Glaub ich. Aber die fressen meine Netze. Oder spielen damit. Ich weiß nicht, was schlimmer ist.'),
    ], { next: 'ja' }),
    node('ja', [
      L(HE, 'Guck dir den Schlick an, unten bei den Pfählen. Da sind Spuren. Und wenn du sie findest – tu ihnen nicht weh, wenn’s nicht sein muss. Ich mag Hunde. Auch die aus Blech.'),
    ], { effects: [{ startQuest: Q }], choices: [{ text: '„Mach ich.“' }] }),
  ],
};

const idee: DialogueDef = {
  id: 'hb-henk-idee',
  start: 'start',
  nodes: [
    node('start', [
      L(HE, 'Du hast die Spuren gefunden? Und? Viele?'),
      P('Ein ganzes Rudel. Und ein Alpha mit Beule im Kopf, der auf deinen Netzen pennt.'),
      L(HE, 'Ach du Scheiße.'),
      L(HE, 'Weißt du, was Robohunde mögen? Teile. Schrauben, Muttern, alles mit Gewinde. Die kauen da drauf rum wie auf Knochen. Wenn man eine Spur legt, mit fünf ordentlichen Ersatzteilen, dann laufen die hinterher. Bis sonst wohin.'),
    ], {
      choices: [
        {
          text: 'Fünf Schrott-Ersatzteile als Spur auslegen – weg von der Bucht.', requires: item('schrott-ersatzteil', 5),
          effects: [{ take: 'schrott-ersatzteil', qty: 5 }, { cutscene: 'hb-spur' }],
        },
        { text: '„Ich regel das anders.“' },
      ],
    }),
  ],
};

const spur: CutsceneDef = {
  id: 'hb-spur',
  title: 'Die Spur',
  beats: [
    tafel('Abenddämmerung. Eine Schraube am Pfahl. Eine Mutter auf dem Steg. Eine Dichtung an der Treppe zur Flutmauer. Und so weiter, quer durch die Unterstadt.', undefined, 'in'),
    tafel('Hinter dir, in sicherem Abstand: rote Augen. Ein Rudel Robohunde, das jede Schraube aufschnappt und schwanzwedelnd weiterzieht. Der Alpha mit der Beule vorneweg.'),
    tafel('Die Spur endet am Schrottmarkt. Auf der Halde. Vor einem Wellblechbüro mit einem Schild: „DEXTER – SCHROTT & DROHNEN – ZAHLUNG IRGENDWANN“.', [
      N('Das Rudel sieht die Halde. Die Halde ist ein Berg aus Gewinde. Das Rudel hat das Paradies gefunden.'),
    ]),
  ],
  effects: [set('hb_halde'), msg('Das Rudel ist umgezogen. Auf Dexters Halde.')],
};

const dexter: DialogueDef = {
  id: 'hb-dexter-halde',
  start: 'start',
  nodes: [
    node('start', [
      N('Auf der Halde wuseln Robohunde. Einer kaut auf einem Auspuff. Einer hat sich in eine Badewanne gelegt. Mittendrin steht Dexter, die Hände über dem Kopf, als würde er überfallen.'),
      L('dexter', 'Was ist DAS? Wo kommen die her? Die fressen meinen Bestand! Das ist Inventar! Das ist meine Altersvorsorge!'),
      L('dexter', 'Wer bezahlt das jetzt? WER BEZAHLT DAS JETZT?'),
    ], {
      choices: [
        { text: '„Kostenlose Wachhunde, Dexter. Kein Mensch klaut dir jetzt mehr was.“', next: 'wache' },
        { text: '„Ich. Irgendwann. Kennst du ja.“', next: 'irgendwann' },
      ],
    }),
    node('wache', [
      L('dexter', 'Wachhunde … Wachhunde. Oh. Oh! Dann kann Aria nicht mehr einfach – dann muss Aria erst an denen vorbei!', 'freude'),
      L('dexter', 'Das ist das beste Geschäft, das ich je gemacht hab, und ich hab nicht mal was bezahlt!'),
    ], { next: 'alpha' }),
    node('irgendwann', [
      L('dexter', 'Irgendwann. Klar. Das sag ich auch immer. Das ist MEIN Spruch!'),
      N('Ein Robohund legt Dexter einen abgekauten Schraubenschlüssel vor die Füße und wedelt. Dexter seufzt. Dexter krault ihn hinter dem Ohr. Dexter ist verloren.'),
    ], { next: 'alpha' }),
    node('alpha', [
      N('Der Alpha mit der Beule löst sich aus dem Rudel. Er trottet zu dir, setzt sich vor deine Füße und sieht hoch. Sein Schwanz-Servo wedelt so schnell, dass Funken fliegen.'),
      L('bolzen', 'Wuff. *piep* Wuff.'),
      L('dexter', 'Ich glaub, der will mit dir. Der Rest bleibt hier. Der eine geht. Wie in einer Familie.'),
    ], {
      choices: [
        { text: '„Na komm. Du heißt ab jetzt Bolzen.“', effects: [set('bolzen_haustier'), rel('bolzen', 100), msg('Bolzen folgt dir jetzt. Er schläft im Crew-Quartier.')], next: 'bolzen' },
        { text: '„Bleib bei Dexter, Kumpel.“', next: 'bleib' },
      ],
    }),
    node('bolzen', [N('Bolzen bellt einmal, piept zweimal und trottet neben dir her, als hätte er nie etwas anderes getan.')], { effects: [set('hb_dexter')] }),
    node('bleib', [
      N('Bolzen legt den Kopf schief. Dann trottet er zurück zum Rudel. Aber er dreht sich noch zweimal um.'),
      N('(Du kannst später wiederkommen. Er wartet.)'),
    ], { effects: [set('hb_dexter')] }),
  ],
};

const bolzenRudel: DialogueDef = { id: 'hb-bolzen-rudel', start: 'alpha', nodes: dexter.nodes };

const bolzenSpaeter: DialogueDef = {
  id: 'hb-bolzen-halde',
  start: 'start',
  nodes: [
    node('start', [
      N('Zwischen zwei Autowracks liegt ein Robohund. Der Alpha aus der Brackbucht, mit Beule im Kopf und einem Bein, das nur noch an einem Kabel hängt. Er hebt den Kopf, als er dich sieht. Sein Schwanz-Servo wedelt einmal. Schwach.'),
      L('bolzen', '*piep*'),
    ], {
      choices: [
        { text: 'Das Bein provisorisch festbinden und ihn mitnehmen.', next: 'mit' },
        { text: 'Ihn liegen lassen.' },
      ],
    }),
    node('mit', [
      N('Du bindest das Bein mit Paketschnur fest. Er leckt dir mit einer Zunge aus Gummi über die Hand. Dann humpelt er neben dir her. Er beschwert sich nicht. Er ist ein guter Hund.'),
      P('Ab jetzt heißt du Bolzen. Und wir zwei sind quitt.'),
    ], { effects: [set('bolzen_haustier'), set('bolzen_verletzt'), rel('bolzen', 60), msg('Bolzen folgt dir jetzt. Gustav und Dante könnten sein Bein richten.')] }),
  ],
};

const bericht: DialogueDef = {
  id: 'hb-henk-bericht',
  start: 'start',
  nodes: [
    node('start', [L(HE, 'Und? Leuchtet’s noch, da unten?')], {
      choices: [
        { text: '„Der Alpha hört jetzt auf mich. Das Rudel hilft dir sogar beim Netzeinholen.“', when: flag('bolzen_umprogrammiert'), next: 'prog' },
        { text: '„Ich hab das Rudel verjagt. War nicht schön.“', when: all({ won: 'enc-bucht-hunde' }, noFlag('bolzen_umprogrammiert')), next: 'kampf' },
        { text: '„Das Rudel wohnt jetzt bei Dexter auf der Halde.“', when: all(flag('hb_halde'), noFlag('bolzen_umprogrammiert'), not({ won: 'enc-bucht-hunde' })), next: 'halde' },
      ],
    }),
    node('prog', [
      N('Unten in der Bucht ziehen vier Robohunde ein Netz aus dem Schlick, die Zähne in die Maschen gehakt, und schleppen es zu Henks Steg. Der Alpha sitzt daneben und bellt Kommandos.'),
      L(HE, 'Na, Donnerwetter. Die arbeiten besser als mein letzter Lehrling. Und die wollen nicht mal Kaffee.'),
      L(HE, 'Und der Dicke mit der Beule, der guckt dich an, als wärst du sein Frauchen. Nimm ihn mit. Der braucht wen. Wie wir alle.'),
    ], { effects: [set('bolzen_haustier'), rel('bolzen', 100), rel(HE, 60), msg('Bolzen folgt dir jetzt. Er schläft im Crew-Quartier.')], next: 'ende' }),
    node('kampf', [
      L(HE, 'Verjagt. Hm. Na ja. Die Netze sind wieder da. Das ist was.'),
      L(HE, 'Der Alpha ist Richtung Stadt gehumpelt. Wenn du ihn siehst … guck mal nach ihm, ja? Ich hab’s nicht so gemeint mit dem Ärger.'),
    ], { effects: [rel(HE, 30), set('hb_alpha_verletzt')], next: 'ende' }),
    node('halde', [
      L(HE, 'Bei DEXTER? Hahaha! Der Mann kann nicht mal seine Schulden bezahlen, jetzt hat er auch noch zwölf Hunde!'),
      L(HE, 'Na, die haben’s gut da. Viel Gewinde, keine Netze. Alle glücklich.'),
    ], { effects: [rel(HE, 50)], next: 'ende' }),
    node('ende', [
      L(HE, 'Hier, für die Mühe. Zweihundert. Hab ich mit Fischen verdient, die mir die Hunde nicht weggefressen haben. Und komm mal abends vorbei. Ich hab ’ne Pritsche oben am Turm, wenn du mal nicht nach Hause kommst.'),
    ], { effects: [set('hb_abgeschlossen'), { completeQuest: Q }] }),
  ],
};

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: { [auftrag.id]: auftrag, [idee.id]: idee, [dexter.id]: dexter, [bolzenRudel.id]: bolzenRudel, [bolzenSpaeter.id]: bolzenSpaeter, [bericht.id]: bericht },
  cutscenes: { [spur.id]: spur },
  mapAdditions: {
    flutmauer: {
      hotspots: [
        { id: 'hb-henk-auftrag', at: 'leuchtturm', label: 'Henk Angler: Netze weg', kind: 'talk', dialogue: auftrag.id, when: all(inactive(Q), time('morgen', 'tag')) },
        {
          id: 'hb-henk-idee', at: 'leuchtturm', label: 'Henk: Wie lockt man Robohunde?', kind: 'talk', dialogue: idee.id,
          when: all(active(Q), flag('hundespuren_gefunden'), not(GELOEST), time('morgen', 'tag', 'abend')),
        },
        { id: 'hb-henk-bericht', at: 'leuchtturm', label: 'Henk Angler: Bericht', kind: 'talk', dialogue: bericht.id, when: all(active(Q), GELOEST, time('morgen', 'tag', 'abend')) },
      ],
    },
    schrottmarkt: {
      hotspots: [
        { id: 'hb-dexter-halde', at: 'halde', label: 'Dexter und das Rudel', kind: 'talk', dialogue: dexter.id, when: all(flag('hb_halde'), noFlag('hb_dexter')) },
        {
          id: 'hb-bolzen-halde', at: 'halde', label: 'Ein Robohund zwischen den Wracks', kind: 'use', dialogue: bolzenSpaeter.id,
          when: all(done(Q), { won: 'enc-bucht-hunde' }, noFlag('bolzen_umprogrammiert'), noFlag('bolzen_haustier')),
        },
        {
          id: 'hb-bolzen-rudel', at: 'halde', label: 'Bolzen auf der Halde', kind: 'use', dialogue: bolzenRudel.id,
          when: all(flag('hb_halde'), flag('hb_dexter'), noFlag('bolzen_haustier'), noFlag('bolzen_umprogrammiert'), not({ won: 'enc-bucht-hunde' })),
        },
      ],
    },
  },
};
