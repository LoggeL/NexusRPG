// side-strom-fuer-die-rohre · „Strom für die Rohre“ (world.md §6.2 Nr. 27). Bürgermeister Gully, kanal-sammler + loetgassen.
// Die Leuchtpilze welken, der Notgenerator des Trockendocks ist kaputt → Ersatzteile und Kabel → Leitung von Lötzinn
// bis in den Kanal. Wege: gc-119 Generator (Zonen-Dialog kanal-notgenerator setzt kanal_generator_laeuft) ·
// 3 schrott-ersatzteil und eine Nacht warten (Zonen-Dialog setzt kanal_generator_teile, die Nacht bildet diese Quest ab) ·
// gc-120 Mira Lötzinn gibt das Kabel gratis (sonst 80 Cr) · Kanalratten am Kabelweg vertreiben (enc-job-kanal) oder
// das Kabel ohne Kampf an die Decke hängen.
import type { ContentPart } from '../../part';
import type { CutsceneDef, DialogueDef, QuestDef } from '../../../modules/contracts';
import { active, all, any, ch, dlg, flag, herz, inactive, l, n, noFlag, node, not, p, set } from './_q';

const Q = 'side-strom-fuer-die-rohre';
const GU = 'buergermeister-gully';
const MI = 'mira-loetzinn';
const LAEUFT = 'kanal_generator_laeuft';
const TEILE = 'kanal_generator_teile';
const KABEL = 'strom_kabel';
const VERLEGT = 'strom_kabel_verlegt';
const ANGESCHLOSSEN = 'strom_angeschlossen';
const EINGESCHALTET = 'strom_eingeschaltet';
const RATTEN_WEG = any(flag('strom_kabel_aufgehaengt'), { won: 'enc-job-kanal' });

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: 'Strom für die Rohre',
  summary: 'Die Leuchtpilze des Kanalvolks welken. Ohne Licht kein Leben im Kanal, sagt Bürgermeister Gully. Und ohne Leben keine Wähler.',
  giver: GU,
  act: 1,
  steps: [
    {
      id: 'generator', text: 'Bring den Notgenerator im Trockendock wieder zum Laufen (reparieren oder Ersatzteile spenden).',
      done: any(flag(LAEUFT), flag(TEILE)), marker: { map: 'kanal-sammler', at: [320, 275] },
    },
    {
      id: 'nacht', optional: true, text: 'Das Kanalvolk baut die Ersatzteile ein. Das dauert eine Nacht.',
      when: all(flag(TEILE), noFlag(LAEUFT)), done: any(flag(LAEUFT), all(flag(TEILE), { time: 'nacht' })),
    },
    {
      id: 'eingebaut', optional: true, text: 'Am nächsten Morgen sollte der Generator laufen.',
      when: all({ questStep: Q, step: 'nacht' }, noFlag(LAEUFT)),
      done: any(flag(LAEUFT), all({ questStep: Q, step: 'nacht' }, { time: 'morgen' })),
      effects: [set(LAEUFT), { message: 'Bürgermeister Gully lässt ausrichten: Der Generator brummt. „Kraft meines Amtes erkläre ich ihn für gesund.“' }],
    },
    {
      id: 'kabel', text: 'Besorg bei Mira Lötzinn in den Lötgassen eine Kabelrolle, lang genug bis in den Kanal.',
      done: flag(KABEL), marker: { map: 'loetzinn-laden', at: [235, 365] },
    },
    {
      id: 'leitung', text: 'Leg die Leitung: oben am Kabelweg in den Lötgassen ansetzen, unten am Kabelende im Kanal anschließen.',
      when: flag(KABEL), done: flag(ANGESCHLOSSEN), marker: { map: 'loetgassen', at: [960, 520] },
    },
    {
      id: 'ratten', text: 'Die Kanalratten nagen am frischen Kabel. Vertreib sie – oder häng das Kabel außer Reichweite.',
      when: flag(VERLEGT), done: RATTEN_WEG, marker: { map: 'kanal-sammler', at: [240, 272] },
    },
    {
      id: 'einschalten', text: 'Sag Bürgermeister Gully, dass alles bereit ist. Er will den Schalter selbst umlegen.',
      when: all(flag(LAEUFT), flag(ANGESCHLOSSEN), RATTEN_WEG), done: flag(EINGESCHALTET), marker: { map: 'kanal-sammler', at: [700, 272] },
    },
  ],
  reward: { xp: 180, rep: { kanalvolk: 20 }, items: { leuchtpilz: 1 } },
};

// ---------------------------------------------------------------------------------------------- Gully

const gully: DialogueDef = dlg('strom-gully', [
  node('start', [
    n('Bürgermeister Gully steht vor seinem Planenzelt auf einer umgedrehten Kiste. Schärpe aus Absperrband, Krone aus Kronkorken, Mikrofon aus einer Klopapierrolle. Vor ihm: drei Ratten und ein Kind mit Stirnlampe.'),
    l(GU, 'Bürgerinnen und Bürger der Rohre! Kraft meines Amtes als Oberhaupt der Rohre erkläre ich den Notstand! Die Pilze welken!', 'wut'),
    n('Er entdeckt dich und winkt dich heran, ohne vom Podest zu steigen.'),
    l(GU, 'Ah! Ein Bürger von oben! Ein Oberbürger! Sie kommen wie gerufen. Ich habe niemanden gerufen. Aber Sie kommen trotzdem wie gerufen.', 'freude'),
  ], {
    choices: [
      ch('„Was ist mit den Pilzen?“', 'pilze'),
      ch('„Ich bin nur auf der Durchreise.“', 'durchreise'),
    ],
  }),
  node('durchreise', [
    l(GU, 'Niemand ist im Kanal auf der Durchreise. Hier kommt man an. Manchmal zum Bleiben. Manchmal als Treibgut.', 'signatur'),
  ], { next: 'pilze' }),
  node('pilze', [
    l(GU, 'Die Leuchtpilze sind unser Licht, unser Essen, unser Stolz! Ohne Licht welken sie. Und der Notgenerator im Trockendock ist tot. Mausetot. Rattentot.', 'besorgt'),
    l(GU, 'Wir brauchen den Generator. Und ein Kabel bis rauf in die Lötgassen, zu Mira Lötzinns Laden, die hat uns einen Anschluss versprochen. Vor vier Jahren. Sie wartet auf das Kabel. Wir warten auf sie. So ist Politik.', 'neutral'),
  ], {
    choices: [
      ch('„Ich kümmere mich drum.“', 'ja', { effects: [{ startQuest: Q }] }),
      ch('„Was springt für mich raus?“', 'lohn'),
      ch('„Später, Herr Bürgermeister.“'),
    ],
  }),
  node('lohn', [
    l(GU, 'Ruhm! Ehre! Eine Erwähnung in der nächsten Rede! Ein Bett im Trockendock, das nicht mehr klamm ist! Und ein Pilz. Ein ganz besonderer Pilz.', 'freude'),
  ], { choices: [ch('„Abgemacht.“', 'ja', { effects: [{ startQuest: Q }] }), ch('„Ich überleg’s mir.“')] }),
  node('ja', [
    l(GU, 'Hiermit ernenne ich Sie zum Sonderbeauftragten für Licht und Leitungen! Vorübergehend! Ehrenamtlich! Unbezahlt!', 'freude'),
    l(GU, 'Der Generator steht dort hinten. Wer schrauben kann, schraubt. Wer nicht schrauben kann, spendet drei Ersatzteile, und wir schrauben über Nacht. Wir haben Zeit. Wir haben sonst nichts.', 'signatur'),
  ]),
]);

const schalter: DialogueDef = dlg('strom-schalter', [
  node('start', [
    l(GU, 'Alles bereit? Generator? Kabel? Ratten diplomatisch verabschiedet?', 'ueberrascht'),
    p('Alles bereit. Der Schalter gehört Ihnen, Herr Bürgermeister.'),
    l(GU, 'Endlich jemand, der Protokoll versteht!', 'freude'),
  ], { effects: [{ cutscene: 'strom-licht-im-kanal' }] }),
]);

const licht: CutsceneDef = {
  id: 'strom-licht-im-kanal',
  title: 'Licht im Kanal',
  beats: [
    {
      image: 'black', fade: 'in',
      caption: 'Das ganze Kanalvolk hat sich im Trockendock versammelt. Vierzig Stirnlampen, zwei Dutzend Ratten, ein Kind auf einer Kiste.',
      lines: [l(GU, 'Bürgerinnen und Bürger! Ratten! Pilze! Heute endet die Dunkelheit! Kraft meines Amtes …', 'signatur')],
    },
    {
      image: 'black', sfx: 'switch',
      caption: 'Er legt den Schalter um. Nichts passiert. Eine Sekunde. Zwei. Ein Kind hustet.',
      lines: [l(GU, '… kraft meines Amtes … bitte, bitte, bitte …', 'besorgt')],
    },
    {
      image: 'black', sfx: 'engine',
      caption: 'Dann brummt der Generator. Die Lampen am Kabel flackern, eine nach der anderen, bis hoch zur Leiter. Und an den Wänden, ganz langsam, fangen die Pilze an zu glühen. Blau. Grün. Ein bisschen Pink.',
      lines: [n('Das Kanalvolk jubelt. Die Ratten quieken. Jemand weint. Es ist Gully.')],
    },
    {
      image: 'black', fade: 'out',
      caption: 'Gully pflückt den hellsten Pilz von der Wand und legt ihn dir in die Hand, als wäre es ein Orden.',
      lines: [l(GU, 'Für den Sonderbeauftragten. Er leuchtet die ganze Nacht. Wie Ihr Name in den Annalen der Rohre.', 'freude')],
    },
  ],
  effects: [set(EINGESCHALTET), herz(GU, 60), { advanceTime: 30 }],
  gallery: false,
};

// ---------------------------------------------------------------------------------------------- Mira Lötzinn

const mira: DialogueDef = dlg('strom-mira', [
  node('start', [
    n('Mira Lötzinn sitzt hinter einer Lupe, die größer ist als ihr Kopf, und lötet einem Augenimplantat die Wimpern an. Hinter ihr an der Wand: eine Kabelrolle, so dick wie ein Autoreifen.'),
    l(MI, 'Wenn du was kaufen willst: Ich hab neu. Nicht gebraucht, nicht „fast neu“, nicht „vom Laster gefallen“. NEU. Das ist hier unten ein Fremdwort.', 'neutral'),
    p('Die Kabelrolle. Für Gully. Für den Kanal.'),
    l(MI, 'Gully. Der Bürgermeister der Ratten. Er schuldet mir noch eine Antwort auf meine Anfrage von vor vier Jahren. Die Kabelrolle kostet achtzig.', 'signatur'),
  ], {
    choices: [
      ch('„Ohne Licht welken die Pilze. Ohne Pilze kein Kanalvolk. Ohne Kanalvolk keine Kundschaft für dich, die sich deine Neuware leisten will.“', 'gratis', { check: 'gc-120' }),
      ch('Kaufen (80 Cr).', 'kauf', { requires: { credits: 80 }, effects: [{ credits: -80 }] }),
      ch('„Ich komm wieder.“'),
    ],
  }),
  node('gratis', [
    l(MI, 'Hm. Das ist … betriebswirtschaftlich gar nicht so dumm.', 'ueberrascht'),
    l(MI, 'Nimm sie. Gratis. Und sag Gully, wenn er mir den Anschluss nicht bis zum Monatsende freigibt, löte ich seine Krone an seinen Kopf.', 'freude'),
  ], { effects: [set(KABEL), herz(MI, 20)], next: 'rolle' }),
  node('kauf', [
    l(MI, 'Achtzig. Gezählt. Neu. Du riechst nach jemandem, der zu viel Gutes tut. Pass auf, das ist ansteckend.', 'neutral'),
  ], { effects: [set(KABEL)], next: 'rolle' }),
  node('rolle', [
    n('Die Kabelrolle wiegt so viel wie ein schlechtes Gewissen. Du rollst sie vor dir her, raus in die Lötgassen.'),
  ]),
]);

// ---------------------------------------------------------------------------------------------- Kabelweg

const kabelweg: DialogueDef = dlg('strom-kabelweg', [
  node('start', [
    n('Der Kabelweg: eine Rinne zwischen Hauswand und Kanaldeckel, in der schon ein Dutzend toter Kabel liegt. Ein Schild: „Kabel Lötzinn → Kanal. Irgendwann.“ Darunter jemand anderes: „Nie.“'),
  ], {
    choices: [
      ch('Die neue Leitung einziehen und durch den Schacht in den Kanal hinablassen.', 'verlegen', { effects: [set(VERLEGT), { advanceTime: 30 }] }),
      ch('Später.'),
    ],
  }),
  node('verlegen', [
    n('Du ziehst das Kabel durch die Rinne, fädelst es an drei Tauben und einem Wäschetrockner vorbei und lässt es in den Schacht gleiten. Unten ruft jemand: „KABEL! KABEL IST DA!“ Dann: „AU.“'),
  ]),
]);

const kabelende: DialogueDef = dlg('strom-kabelende', [
  node('start', [
    n('Das Kabel hängt aus dem Schacht über dem Trockendock. Am Ende: drei Kanalratten, die daran nagen wie an Lakritz. Sie schauen dich an. Sie nagen weiter.'),
  ], {
    choices: [
      ch('Die Ratten verscheuchen. Mit Nachdruck.', 'kampf', { when: not(RATTEN_WEG) }),
      ch('Das Kabel mit Rohrschellen an die Decke hängen. Dauert, aber da kommt keine Ratte hin.', 'haengen', {
        when: not(RATTEN_WEG), effects: [set('strom_kabel_aufgehaengt'), { advanceTime: 60 }],
      }),
      ch('Das Kabel am Generator anschließen.', 'anschliessen', { when: all(RATTEN_WEG, noFlag(ANGESCHLOSSEN)), effects: [set(ANGESCHLOSSEN)] }),
      ch('Gehen.'),
    ],
  }),
  node('kampf', [
    n('Die Ratten richten sich auf. Aus dem Rohr dahinter kommen noch mehr. Viel mehr. Eine trägt einen Kronkorken als Helm.'),
  ], { effects: [{ battle: 'enc-job-kanal' }] }),
  node('haengen', [
    n('Rohrschelle, Schraube, nächste Rohrschelle. Eine Stunde später hängt das Kabel unter der Decke wie eine sehr lange, sehr beleidigte Schlange. Die Ratten schauen hoch. Sie pfeifen enttäuscht.'),
  ], { next: 'start' }),
  node('anschliessen', [
    n('Plus an Plus, Minus an Minus, Spucke auf den Kontakt für Glück. Das Kabel ist dran. Jetzt fehlt nur noch jemand mit Schärpe, der den Schalter umlegt.'),
  ]),
]);

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: {
    [gully.id]: gully, [schalter.id]: schalter, [mira.id]: mira, [kabelweg.id]: kabelweg, [kabelende.id]: kabelende,
  },
  cutscenes: { [licht.id]: licht },
  mapAdditions: {
    'kanal-sammler': {
      hotspots: [
        {
          id: 'strom-gully', at: 'gullys-rathaus', label: 'Bürgermeister Gully', kind: 'talk', dialogue: gully.id,
          when: all(inactive(Q), { time: ['morgen', 'tag'] }),
        },
        {
          id: 'strom-schalter', at: 'gullys-rathaus', label: 'Gully: Der große Schalter', kind: 'talk', dialogue: schalter.id,
          when: all(active(Q), flag(LAEUFT), flag(ANGESCHLOSSEN), RATTEN_WEG, noFlag(EINGESCHALTET)),
        },
        {
          id: 'strom-kabelende', at: 'kabelweg-ende', label: 'Das neue Kabel', kind: 'use', dialogue: kabelende.id,
          when: all(active(Q), flag(VERLEGT), noFlag(ANGESCHLOSSEN)),
        },
      ],
    },
    'loetzinn-laden': {
      hotspots: [{
        id: 'strom-kabelrolle', at: 'kabelrolle', label: 'Mira nach der Kabelrolle fragen', kind: 'talk', dialogue: mira.id,
        when: all(active(Q), noFlag(KABEL), { clockBetween: [480, 1140] }),
      }],
    },
    loetgassen: {
      hotspots: [{
        id: 'strom-kabelweg', at: 'kabelweg', label: 'Kabel in den Kanal legen', kind: 'use', dialogue: kabelweg.id,
        when: all(active(Q), flag(KABEL), noFlag(VERLEGT)),
      }],
    },
  },
};
