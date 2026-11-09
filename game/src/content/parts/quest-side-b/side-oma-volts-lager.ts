// side-oma-volts-lager „Oma Volts Lager“ (world.md §6.2 Nr. 18) · Oma Volt · neon-gasse (Kiosk), Hinterhof-Lager am
// schrottmarkt · T, Kassieren am Abend. Der Plan-Hotspot `oma-volts-lager` (Spot gleichen Namens) gehört dieser Quest.
// Wege: Kampf enc-markt-rostzaehne (arena-hinterhof) · gc-78 „Dieser Stand steht unter Hunters Schutz.“ (+1 bei Ruf
// crew-hunter 20, in checks.ts) · gc-79 Opa Blech reaktivieren (Wasserschlauch) · [Hunter ♥4] Hunter kommt persönlich.
import type { ContentPart } from '../../part';
import type { CutsceneDef, DialogueDef, QuestDef } from '../../../modules/contracts';
import {
  L, N, P, VEXARIA, active, all, any, bye, done, flag, hearts, inactive, msg, node, noFlag, not, rel, set, tafel, time,
} from './_lib';

const Q = 'side-oma-volts-lager';
const O = 'oma-volt';

const GELOEST = any({ won: 'enc-markt-rostzaehne' }, flag('ov_schutz'), flag('ov_opa_blech'), flag('ov_hunter'));

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: 'Oma Volts Lager',
  summary: 'Die Rostzähne verlangen von Oma Volt Schutzgeld „für die Leuchtreklame“. Heute Abend kommen sie kassieren. Oma Volt hat Stricknadeln. Und einen eingemotteten Roboter.',
  giver: O,
  act: 1,
  steps: [
    {
      id: 'opa-blech', text: 'Optional: Tagsüber im Lager hinterm Schrottmarkt Opa Blech wieder in Gang bringen.',
      done: flag('ov_blech_wach'), optional: true, marker: { map: 'schrottmarkt', at: [1440, 768] },
    },
    {
      id: 'abend', text: 'Abends am Lager im Hinterhof des Schrottmarkts auf die Rostzähne warten – und sie loswerden.',
      done: GELOEST, marker: { map: 'schrottmarkt', at: [1440, 768] },
    },
    {
      id: 'oma', text: 'Oma Volt am Kiosk in der Neon-Gasse Bescheid sagen.',
      done: flag('ov_abgeschlossen'), when: GELOEST, marker: { map: 'neon-gasse', at: [250, 480] },
    },
  ],
  reward: {
    xp: 200,
    items: { 'opa-blech-fernbedienung': 1 },
    rep: { unterstadt: 10 },
    effects: [set('oma_volt_rabatt'), msg('Oma Volt gibt dir ab sofort 15 % Familienrabatt. „Nicht weitersagen, Kindchen.“')],
  },
};

const auftrag: DialogueDef = {
  id: 'ov-oma-auftrag',
  start: 'start',
  nodes: [
    node('start', [
      N('Oma Volt sitzt hinter ihrem Kiosk und strickt so schnell, dass die Nadeln Funken schlagen. Vor ihr liegt ein Zettel, mit Klebeband an die Theke gepappt: „SCHUTZGELD FÜR DIE LEUCHTREKLAME. 200 CR. HEUTE ABEND. – DIE ROSTZÄHNE“.'),
      L(O, 'Kindchen. Lies das. Lies das und sag mir, dass ich nicht verrückt bin.'),
      L(O, 'Für die LEUCHTREKLAME. Meine Leuchtreklame ist ein einzelnes „V“, das flackert. Das „O“, das „L“ und das „T“ sind 2074 im Rostregen gestorben. Ich zahl doch keinen Schutz für ein V!'),
    ], {
      choices: [
        { text: '„Wo und wann kommen die?“', next: 'wo' },
        { text: '„Zahlen Sie einfach. Ist sicherer.“', next: 'zahlen' },
        bye('„Ich hab selbst genug Ärger.“'),
      ],
    }),
    node('zahlen', [
      L(O, 'Zahlen? ICH? Kindchen, ich hab den Rostregen überlebt, drei Ehemänner und eine Steuerprüfung. Ich zahl nicht. Ich hab noch nie gezahlt. Nicht mal beim Arzt.'),
    ], { next: 'wo' }),
    node('wo', [
      L(O, 'Heute Abend. Am Lager hinterm Schrottmarkt, im Hinterhof. Da steht mein Vorrat. Und Opa Blech.'),
      P('Opa Blech?'),
      L(O, 'Mein Sicherheitsroboter. Eingemottet seit 2077. Er hat einen Wasserschlauch statt einer Waffe, weil ich keine Waffen im Haus will. Er war sehr effektiv gegen Tauben. Gegen Männer auch. Dann ist sein Akku gestorben und ich hatte kein Geld für einen neuen.'),
      L(O, 'Vielleicht kriegt ihn einer wieder wach. Vielleicht kriegst du die Rotzlöffel auch anders weg. Du siehst aus wie jemand, der Leute anders wegkriegt.'),
    ], { effects: [{ startQuest: Q }], choices: [{ text: '„Ich bin heute Abend da.“' }] }),
  ],
};

// ------------------------------------------------------------------------------------------- Das Lager
const lager: DialogueDef = {
  id: 'ov-lager',
  start: 'start',
  nodes: [
    node('start', [
      N('Ein Rolltor mit Graffiti, dahinter Oma Volts Lager: Kisten mit Brausepulver, Strickgarn, Kassetten, Synth-Kaffee. In der Ecke unter einer Plastikplane: eine Gestalt in Kühlschrankgröße, mit Kopf wie ein Eimer und einem aufgerollten Gartenschlauch als Arm.'),
    ], {
      choices: [
        { text: 'Die Plane runterziehen und Opa Blech wachkriegen.', when: all(noFlag('ov_blech_wach'), time('morgen', 'tag')), next: 'blech' },
        { text: 'Auf die Rostzähne warten.', when: all(time('abend'), not(GELOEST)), next: 'kassieren' },
        { text: '„Die kommen erst abends. Ich komm wieder.“', when: all(not(time('abend')), not(GELOEST)) },
        bye('Gehen.'),
      ],
    }),
    node('blech', [
      N('Opa Blech. Lackiert in verblasstem Mintgrün, ein Aufkleber auf der Brust: „BITTE NICHT FÜTTERN“. Die Wartungsklappe am Rücken klemmt. Darin: ein toter Akku, ein Nest aus Strickgarn und ein Spinnennetz, in dem eine sehr alte Spinne wohnt.'),
    ], {
      choices: [
        { text: 'Den Akku überbrücken, die Kontakte putzen, die Spinne umsiedeln.', check: 'gc-79', next: 'blech-wach' },
        { text: '„Den kriegt keiner mehr wach.“ Plane drüber.' },
      ],
    }),
    node('blech-wach', [
      N('Funken. Ein Brummen. Opa Blechs Eimerkopf dreht sich mit dem Geräusch einer rostigen Gartentür einmal um die eigene Achse.'),
      L('opa-blech', 'SICHERHEITSPROTOKOLL. AKTIV. GUTEN MORGEN. DAS WETTER: ROSTREGEN. EMPFEHLUNG: SCHAL.'),
      L('opa-blech', 'BEDROHUNG ERKANNT: KEINE. BEDROHUNG ERWARTET: HEUTE ABEND. SCHLAUCH: GELADEN.'),
      N('Er hebt den Gartenschlauch und lässt einen Probestrahl gegen die Wand zischen. Eine Taube, zwanzig Meter entfernt, fällt vor Schreck vom Dach.'),
    ], { effects: [set('ov_blech_wach')] }),
    node('kassieren', [
      N('Das Licht im Hinterhof flackert. Drei Rostzähne kommen um die Ecke: rote Bandanas, Drahtzahnspangen, und einer trägt tatsächlich eine Leuchtreklame als Halskette. Ein einzelnes „S“.'),
      N('Der mit dem „S“ grinst. „Na? Bist du Omas Enkel? Zweihundert für den Schutz. Sonst gibt’s bald keine Reklame mehr. Und keinen Kiosk.“'),
    ], {
      choices: [
        { text: '„Dieser Stand steht unter Hunters Schutz. Fragt ihn mal, wie er Schutzgeld findet.“', check: 'gc-78', next: 'schutz' },
        { text: 'Pfeifen. „Opa! Kundschaft!“', when: flag('ov_blech_wach'), next: 'blech-schlauch' },
        { text: 'Opa Blech in letzter Sekunde unter der Plane hochfahren.', when: noFlag('ov_blech_wach'), check: 'gc-79', next: 'blech-schlauch' },
        { text: 'Hunter anrufen. „Boss. Hinterhof Schrottmarkt. Jetzt.“', tag: '[Hunter ♥4]', requires: hearts('hunter', 4), next: 'hunter' },
        { text: '„Schutz? Ich zeig euch Schutz.“', next: 'kampf' },
        { text: 'Rückzug. Die Rostzähne lachen.', next: 'rueckzug' },
      ],
    }),
    node('rueckzug', [N('Der mit dem „S“ ruft dir nach: „Morgen wieder, Enkelchen! Gleiche Zeit, gleicher Preis!“')]),
    node('kampf', [N('Der mit dem „S“ zieht eine Kette aus der Jacke. Die anderen zwei verteilen sich im Hinterhof, zwischen Mülltonnen und Kisten. Irgendwo hinter dir summt Opa Blech im Standby.')], {
      effects: [{ battle: 'enc-markt-rostzaehne' }],
    }),
    node('schutz', [
      P('Ihr wollt Schutzgeld in Hunters Revier kassieren? Bei der Frau, die seine Nougatbomben-Vorräte verwaltet? Viel Glück. Ich halt eure Zähne.'),
      N('Der mit dem „S“ zögert. Einer der anderen flüstert ihm was ins Ohr. Man hört „Hunter“, „drei Jahre Knast“ und „der Barkeeper mit der Klinge“.'),
      N('„… War eh nur ’ne Anfrage. Höflich. Kein Ding.“ Sie ziehen ab. Der mit dem „S“ lässt sogar den Zettel da, auf dem sein Name steht. Er heißt Siegfried.'),
    ], { effects: [set('ov_schutz'), { rep: 'rostzaehne', delta: -5 }] }),
    node('blech-schlauch', [
      L('opa-blech', 'BEDROHUNG ERKANNT. SCHLAUCH: ENTSICHERT. GUTEN ABEND.'),
      N('Ein Wasserstrahl mit dem Druck einer Feuerwehrspritze trifft den mit dem „S“ mitten auf die Brust und spült ihn rückwärts in eine Mülltonne. Der Zweite rutscht aus. Der Dritte rennt, bevor Opa Blech den Eimerkopf überhaupt zu ihm dreht.'),
      L('opa-blech', 'BEDROHUNG: NASS. EMPFEHLUNG: HANDTUCH.'),
      N('Die drei verschwinden triefend in der Nacht. Opa Blech rollt zurück unter die Plane und summt zufrieden.'),
    ], { effects: [set('ov_opa_blech'), set('ov_blech_wach')] }),
    node('hunter', [
      N('Zwölf Minuten später biegt Hunter in den Hinterhof. Sonnenbrille, Seidenhemd, ein Zahnstocher im Mundwinkel. Er hat sich nicht beeilt. Er beeilt sich nie.'),
      L('hunter', 'Siegfried.'),
      N('Der mit dem „S“ wird sehr blass.'),
      L('hunter', 'Schutzgeld. Bei Oma Volt. In meiner Gegend. Du schuldest mir noch vierzig Credits von deinem Geburtstag, Siegfried. Und jetzt willst du kassieren?'),
      L('hunter', 'Schulden muss man immer begleichen. Vierzig. Jetzt. Und dann gehst du nach Hause und denkst nach. Über dein Leben. Über das „S“.'),
      N('Siegfried zahlt. Siegfried geht. Hunter steckt das Geld ein und dreht sich zu dir um.'),
      L('hunter', 'Du hättest auch selbst was machen können, Neuling. Aber … gut, dass du angerufen hast.', 'signatur'),
    ], { effects: [set('ov_hunter'), rel('hunter', 30)] }),
  ],
};

// ------------------------------------------------------------------------------------------- Abschluss
const abschluss: DialogueDef = {
  id: 'ov-oma-abschluss',
  start: 'start',
  nodes: [
    node('start', [L(O, 'Und? Und? Lebt mein Lager noch? Leben die Rotzlöffel noch? In der Reihenfolge ist es mir wichtig.')], {
      choices: [
        { text: '„Ich hab ihnen Hunters Namen um die Ohren gehauen. Sie sind gerannt.“', when: flag('ov_schutz'), next: 'gut' },
        { text: '„Opa Blech hat sie weggespült. Komplett.“', when: flag('ov_opa_blech'), next: 'blech' },
        { text: '„Hunter kam persönlich.“', when: flag('ov_hunter'), next: 'hunter' },
        { text: '„Sie haben verloren. Hinterhof-Boxen.“', when: { won: 'enc-markt-rostzaehne' }, next: 'gut' },
      ],
    }),
    node('blech', [
      L(O, 'Mein Opa Blech! Er lebt! Oh, ich hab ihm so oft gesagt, er soll nicht so viel Wasser auf einmal … ach, egal. Er hat es verdient. Und die auch.', 'freude'),
    ], { next: 'ende' }),
    node('hunter', [L(O, 'Hunter? Der Hunter? Der war früher so ein dürrer Bengel, der bei mir Brausepulver geklaut hat. Jetzt kommt er mich retten. So ist das Leben, Kindchen. Man füttert sie, und eines Tages beißen sie für dich.')], { next: 'ende' }),
    node('gut', [L(O, 'Gut. Sehr gut. Wenn sie wiederkommen, sag ich, mein Enkel ist da. Du bist ab heute mein Enkel. Keine Widerrede.')], { next: 'ende' }),
    node('ende', [
      L(O, 'Hier. Die Fernbedienung von Opa Blech. Wenn du mal in der Klemme steckst, drückst du den roten Knopf, und er kommt. Er ist langsam. Aber er kommt. Wie alle guten Männer.'),
      L(O, 'Und ab sofort zahlst du bei mir weniger. Familienpreis. Nicht weitersagen.'),
    ], { effects: [set('ov_abgeschlossen'), rel(O, 80), { completeQuest: Q }] }),
  ],
};

// Für Vex mit Aria in der Romanzefassung: Aria hat davon gehört (kleiner Nachschlag, kein eigener Strang-Schritt).
const ariaNachschlag: CutsceneDef = {
  id: 'ov-aria-nachschlag',
  title: 'Schutzgeld',
  beats: [
    tafel('Später am Abend. Neon-Gasse. Aria lehnt am Kiosk, den Schläger über der Schulter, eine Brause in der Hand, die Oma Volt ihr nie berechnet.', undefined, 'in'),
    tafel('„Ich hab gehört, du hast Schutzgeld abgelehnt.“', [
      L('aria', 'Siegfried? Der mit dem S? Den hab ich letztes Jahr in eine Mülltonne gefaltet. Der hat noch nicht genug, oder?'),
      L('aria', 'Und du warst ganz allein da hinten, ja? Ohne mich. Ohne Schläger. Rennsemmel, das ist entweder mutig oder dumm.', 'zaertlich'),
      P('Was davon macht dich mehr an?'),
      L('aria', 'Halt die Klappe.'),
      L('aria', '… Beides. Scheiße. Beides.', 'verlegen'),
    ]),
    tafel('Sie greift dir in den Gurtriemen und zieht dich einen halben Schritt näher. Ihr Daumen fährt über die Schnalle, langsam, als müsste sie prüfen, ob du echt bist. Dann lässt sie los, als hätte sie sich verbrannt.', [
      L('aria', 'Nächstes Mal rufst du mich an. Nicht Hunter. Mich. Ich will auch mal wen nass machen.'),
    ]),
  ],
  effects: [rel('aria', 20), { markSeen: 'ov-aria-nachschlag' }],
};

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: { [auftrag.id]: auftrag, [lager.id]: lager, [abschluss.id]: abschluss },
  cutscenes: { [ariaNachschlag.id]: ariaNachschlag },
  mapAdditions: {
    'neon-gasse': {
      hotspots: [
        { id: 'ov-oma-auftrag', at: 'kiosk', label: 'Oma Volt: Schutzgeld?', kind: 'talk', dialogue: auftrag.id, when: all(inactive(Q), time('morgen', 'tag')) },
        { id: 'ov-oma-abschluss', at: 'kiosk', label: 'Oma Volt: Bericht', kind: 'talk', dialogue: abschluss.id, when: all(active(Q), GELOEST, time('morgen', 'tag', 'abend')) },
      ],
      onEnter: [
        {
          id: 'ov-aria-nachschlag', once: true,
          when: all(done(Q), VEXARIA, time('abend', 'nacht'), any(flag('ov_hunter'), flag('ov_schutz'), flag('ov_opa_blech'), { won: 'enc-markt-rostzaehne' })),
          cutscene: 'ov-aria-nachschlag',
        },
      ],
    },
    schrottmarkt: {
      hotspots: [
        { id: 'oma-volts-lager', at: 'oma-volts-lager', label: 'Oma Volts Lager', kind: 'use', dialogue: lager.id, when: active(Q) },
      ],
    },
  },
};
