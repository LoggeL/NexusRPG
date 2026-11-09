// side-container-77 · „Container 77“ (world.md §6.2 Nr. 26). Hafen-Hannes, hafenkante, Di N.
// Nachts verschwinden Hafenarbeiter-Implantate → Container 77 beobachten → Xion und Ripper handeln mit Quantum-Ausschuss.
// Wege: Beweisfoto gc-116 (Di N, Versteck) · Container hacken gc-117 oder Hack-Minispiel (andere Nächte, Ladeliste) ·
// Kampf enc-hafen-container (Di N, Akt 1 ohne Xion) · danach optional Ripper unter vier Augen gc-118
// (Schweigegeld oder Rabatt) oder offen drohen (Ripper wird sauer). Ohne Ripper-Deal zahlt Hannes’ Truppe 200 Cr.
import type { ContentPart } from '../../part';
import type { Condition, DialogueDef, QuestDef } from '../../../modules/contracts';
import { active, all, any, ch, dlg, flag, herz, inactive, l, n, noFlag, node, not, p, set } from './_q';

const Q = 'side-container-77';
const HH = 'hafen-hannes';
const RI = 'ripper';
const DIENSTAG_NACHT: Condition = all({ weekday: 'di' }, { time: 'nacht' });
const BEWEIS = any(flag('c77_beweisfoto'), flag('c77_ladeliste'), { won: 'enc-hafen-container' });
const RIPPER_DEAL = any(flag('c77_ripper_schweigegeld'), flag('c77_ripper_rabatt'));
const RIPPER_ERLEDIGT = any(RIPPER_DEAL, flag('c77_ripper_gedroht'));
const GEMELDET = 'c77_hannes_weiss';

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: 'Container 77',
  summary: 'Nachts verschwinden an der Hafenkante Implantate. Aus Hafenarbeitern. Während sie schlafen. Hafen-Hannes will wissen, wer.',
  giver: HH,
  act: 1,
  steps: [
    {
      id: 'beobachten', text: 'Finde heraus, was nachts in Container 77 passiert (dienstags nachts wird dort gehandelt).',
      done: BEWEIS, marker: { map: 'hafenkante', at: [290, 925] },
      effects: [{ give: 'xion-passierschein' }, { message: 'Im Dreck vor Container 77 liegt ein Passierschein mit grüner Unterschrift. Xion Venom. Eingesteckt.' }],
    },
    {
      id: 'weg-foto', optional: true, when: not(BEWEIS),
      text: 'Weg: Dienstags nachts aus dem Versteck zwischen den Fischkisten ein Beweisfoto schießen.',
      done: flag('c77_beweisfoto'), marker: { map: 'hafenkante', at: [628, 820] },
    },
    {
      id: 'weg-hacken', optional: true, when: not(BEWEIS),
      text: 'Weg: In einer anderen Nacht das Schloss von Container 77 knacken und die Ladeliste ziehen.',
      done: flag('c77_ladeliste'), marker: { map: 'hafenkante', at: [290, 925] },
    },
    {
      id: 'ripper', optional: true, when: all(BEWEIS, noFlag(GEMELDET)),
      text: 'Optional: Ripper in seiner Praxis (tagsüber) unter vier Augen zur Rede stellen – bevor du Hannes Bericht erstattest.',
      done: RIPPER_ERLEDIGT, marker: { map: 'ripper-praxis', at: [392, 494] },
    },
    {
      id: 'hannes', text: 'Erzähl Hafen-Hannes, was in Container 77 läuft (am Kai, morgens bis abends).',
      when: BEWEIS, done: flag(GEMELDET), marker: { map: 'hafenkante', at: [760, 450] },
    },
  ],
  reward: { xp: 220, rep: { unterstadt: 10, zerleger: -10 } },
};

// ---------------------------------------------------------------------------------------------- Auftakt

const start: DialogueDef = dlg('c77-start', [
  node('start', [
    n('Ein Hafenarbeiter mit einem Greifarm so groß wie ein Bagger sitzt auf einem Poller und schält mit der Greifzange einen Apfel. Erstaunlich vorsichtig.'),
    l(HH, 'Du. Du siehst aus, als hättest du nachts nichts Besseres vor. Komm her.', 'neutral'),
    l(HH, 'Hannes. Hafen-Hannes. Dreißig Jahre Kai. Und seit drei Wochen wachen meine Jungs morgens auf und haben weniger Körper als abends.', 'wut'),
    l(HH, 'Pjotr: Greifarm weg. Ab Schulter. Lise: Knieimplantat. Der kleine Ole: Hörchip. Der hört jetzt nur noch Möwen. Alle schlafen sie in den Baracken, alle sagen sie, sie haben nichts gemerkt.', 'wut'),
  ], {
    choices: [
      ch('„Und du hast einen Verdacht.“', 'verdacht'),
      ch('„Klingt nach Ripper.“', 'verdacht'),
      ch('„Nicht mein Hafen.“', 'nein'),
    ],
  }),
  node('verdacht', [
    l(HH, 'Container 77. Ganz hinten am Kai, rostrot, Nummer halb abgeblättert. Dienstags nachts brennt da Licht. Wer hingeht, kriegt eins auf die Mütze.', 'neutral'),
    l(HH, 'Ich bin zu groß zum Schleichen. Und zu alt zum Prügeln. Na ja. Zu alt nicht. Aber die Pension. Du verstehst.', 'signatur'),
    l(HH, 'Schau nach. Bring mir was, das ich Kessel unter die Nase halten kann. Die Jungs legen zusammen.', 'neutral'),
  ], { effects: [{ startQuest: Q }] }),
  node('nein', [
    l(HH, 'Nicht dein Hafen. Klar. Bis du hier einschläfst und mit einem Arm weniger aufwachst.', 'wut'),
    n('Er beißt in den Apfel. Mitsamt der Greifzange, scheint es.'),
  ]),
]);

// ---------------------------------------------------------------------------------------------- Container

const container: DialogueDef = dlg('c77-container', [
  node('start', [
    n('Container 77. Rostrot, die Nummer halb abgeblättert, eine Sieben und ein Gerücht. An der Tür ein Zahlenschloss mit Display. Neu. Viel zu neu für diesen Container.'),
  ], {
    choices: [
      ch('Lauschen.', 'deal', { when: DIENSTAG_NACHT }),
      ch('Das Schloss knacken und die Ladeliste ziehen.', 'hack', { check: 'gc-117', when: not(DIENSTAG_NACHT), effects: [set('c77_ladeliste')] }),
      ch('Das Schloss mit dem Hack-Modul bearbeiten.', undefined, {
        when: not(DIENSTAG_NACHT),
        effects: [{
          minigame: 'akt-hacken', level: 2, key: 'c77-schloss', label: 'Zahlenschloss Container 77',
          win: [set('c77_ladeliste'), { message: 'Das Display zeigt ein Smiley. Dann die Ladeliste. Dann wünschst du dir das Smiley zurück.' }],
          lose: [{ message: 'Das Schloss piept dreimal und sperrt sich für die Nacht. Morgen Nacht ist auch eine Nacht.' }],
        }],
      }),
      ch('Lieber gehen.'),
    ],
  }),
  node('hack', [
    n('Drei Kabel, ein Kurzschluss, das Display flackert. Die Tür schwingt auf. Drinnen: Regale. Auf den Regalen: Kisten. In den Kisten: Arme, Knie, Hörchips, sortiert, beschriftet, in Frischhaltefolie.'),
  ], { next: 'liste' }),
  node('liste', [
    n('An der Wand hängt ein Klemmbrett. Ladeliste, Woche 31: „1 Greifarm (P.), 1 Knie (L.), 1 Hörchip (O.) – Ankauf R., Weiterverkauf an Quantum Ausschuss-Annahme, Abholung X. V.“'),
    p('R. wie Ripper. X. V. wie Xion Venom. Die verkaufen den Hafen an Quantum zurück. Stück für Stück.'),
    n('Du knipst ein Foto von der Liste und schließt die Tür. Das Display lächelt dir hinterher.'),
  ]),
  node('deal', [
    n('Licht unter der Tür. Stimmen. Die eine kennst du: geizig, lauernd. „Was haben wir denn da? Ein Greifarm, Baujahr ’71. Rostig. Zehn Credits.“'),
    n('Die andere ist glatt wie Öl. „Quantum zahlt für Ausschuss pro Kilo, Ripper. Nicht pro Mitleid. Lade ein.“ Durch den Türspalt blitzt etwas Grünes. Eine Kralle.'),
    n('Zwei Zerleger schleppen Kisten. Ein Quantum-Wachmann gähnt. Wenn du was tun willst, dann jetzt.'),
  ], {
    choices: [
      ch('Zurück ins Versteck zwischen den Fischkisten und von dort fotografieren.', 'versteck'),
      ch('Tür auf und dazwischen!', 'kampf'),
      ch('Abhauen.'),
    ],
  }),
  node('versteck', [
    n('Du ziehst dich zurück. Zwischen den Fischkisten riecht es nach Makrele und guten Entscheidungen.'),
  ]),
  node('kampf', [
    n('Du trittst die Tür auf. Drinnen erstarren alle. Ripper lässt einen Greifarm fallen. Die grüne Kralle ist schon weg, ein Schatten zwischen den Containern, der lacht.'),
    l(RI, 'Was haben wir denn da? Einen Kunden ohne Termin. Jungs. Abholen.', 'wut'),
  ], { effects: [{ battle: 'enc-hafen-container' }] }),
]);

// ---------------------------------------------------------------------------------------------- Versteck: Beweisfoto

const versteck: DialogueDef = dlg('c77-versteck', [
  node('start', [
    n('Zwischen den Fischkisten hast du freie Sicht auf Container 77. Licht in der Tür, Silhouetten, Kisten, die von einer Hand in die andere wandern. Die grüne Kralle. Rippers Schweißbrille.'),
  ], {
    choices: [
      ch('Lautlos näher, Kamera an, warten, bis beide im Licht stehen.', 'foto', { check: 'gc-116' }),
      ch('Zu weit weg. Zu dunkel. Zurückziehen.'),
    ],
  }),
  node('foto', [
    n('Du kriechst bis auf drei Meter heran. Ein Zerleger schaut genau in deine Richtung, kratzt sich am Hintern und schaut wieder weg.'),
    n('Klick. Ripper, eine Kiste mit der Aufschrift „P. – Greifarm“, und daneben Xion Venom, der ihm einen Umschlag gibt. Schärfer geht es nicht.'),
    p('Das ist kein Foto. Das ist ein Kündigungsschreiben.'),
  ], { effects: [set('c77_beweisfoto')] }),
]);

// ---------------------------------------------------------------------------------------------- Ripper

const ripper: DialogueDef = dlg('c77-ripper', [
  node('start', [
    l(RI, 'Was haben wir denn da? Eine Kundschaft mit diesem Blick. Diesem „Ich-weiß-was“-Blick. Den mag ich nicht. Der ist schlecht fürs Geschäft.', 'neutral'),
    p('Container 77. Dienstags. Greifarme, Knie, Hörchips. Aus schlafenden Hafenarbeitern.'),
    n('Ripper legt die Pinzette weg. Sehr langsam.'),
  ], {
    choices: [
      ch('„Unter vier Augen: Entweder du hörst auf, oder Kessel und Collin kriegen das Foto. Live.“', 'deal', { check: 'gc-118' }),
      ch('„Ganz Unterstadt erfährt davon. Heute noch.“', 'drohen'),
      ch('Wortlos gehen.'),
    ],
  }),
  node('deal', [
    l(RI, '… Du bist gut. Du bist richtig unangenehm gut.', 'besorgt'),
    l(RI, 'Gut. Keine Hafenarbeiter mehr. Ich kauf woanders ein. Und du vergisst, wer auf dem Foto war. Was willst du? Geld? Oder willst du lieber ein Freund des Hauses sein?', 'signatur'),
  ], {
    choices: [
      ch('Schweigegeld (200 Cr).', 'geld', { effects: [{ credits: 200 }, set('c77_ripper_schweigegeld')] }),
      ch('Rabatt in der Praxis. Auf Dauer.', 'rabatt', { effects: [set('c77_ripper_rabatt'), set('ripper_rabatt')] }),
    ],
  }),
  node('geld', [
    l(RI, 'Zweihundert. Bar. Gezählt. Und ab jetzt sind wir Leute, die sich nicht kennen.', 'neutral'),
  ]),
  node('rabatt', [
    l(RI, 'Freund des Hauses. Hm. Fünfzehn Prozent. Und wenn du mal ein Implantat brauchst, frag ich nicht, wo du es her hast. Ich frag nie.', 'signatur'),
  ], { effects: [herz(RI, 20)] }),
  node('drohen', [
    l(RI, 'Ganz Unterstadt. Oh, ich zittere. Siehst du? Nein. Siehst du nicht.', 'wut'),
    l(RI, 'Dann sind wir ab heute keine Freunde mehr. Hast du dir gut überlegt, wer dir das nächste Mal den Arm wieder dranschraubt?', 'wut'),
  ], { effects: [set('c77_ripper_gedroht'), herz(RI, -150)] }),
]);

// ---------------------------------------------------------------------------------------------- Bericht an Hannes

const bericht: DialogueDef = dlg('c77-bericht', [
  node('start', [
    l(HH, 'Und? Rede. Meine Jungs haben heute Nacht nur mit einem Auge geschlafen. Das andere ist ein Implantat.', 'besorgt'),
  ], {
    choices: [
      ch('Das Beweisfoto zeigen.', 'foto', { when: flag('c77_beweisfoto') }),
      ch('Die Ladeliste zeigen.', 'liste', { when: all(flag('c77_ladeliste'), noFlag('c77_beweisfoto')) }),
      ch('Erzählen, wie du die Bande im Container aufgemischt hast.', 'kampf', { when: all({ won: 'enc-hafen-container' }, noFlag('c77_beweisfoto'), noFlag('c77_ladeliste')) }),
    ],
  }),
  node('foto', [
    n('Hannes hält das Foto mit der Greifzange ins Licht. Ripper. Eine Kiste mit „P.“. Ein Umschlag. Eine grüne Kralle.'),
    l(HH, 'Pjotrs Arm. In einer Kiste. Mit Preisschild.', 'wut'),
  ], { next: 'wer' }),
  node('liste', [
    l(HH, '„Ankauf R. Weiterverkauf an Quantum. Abholung X. V.“ Ich kann lesen. Langsam. Aber ich kann lesen.', 'wut'),
  ], { next: 'wer' }),
  node('kampf', [
    l(HH, 'Du hast die Zerleger aus dem Container geprügelt? Allein? Ha! Das erzählen sie sich morgen in jeder Baracke.', 'freude'),
    l(HH, 'Und drinnen? Kisten voller Implantate. Mit Namen drauf. Unsere Namen.', 'wut'),
  ], { next: 'wer' }),
  node('wer', [
    l(HH, 'Ripper und Quantum. Unser eigener Schrauber verkauft uns an die da oben. Stück für Stück. Und Xion holt ab.', 'trauer'),
  ], {
    choices: [
      ch('„Ripper hört auf. Dafür hab ich gesorgt. Frag nicht, wie.“', 'deal', { when: RIPPER_DEAL }),
      ch('„Ripper weiß, dass wir’s wissen. Er wird nicht freundlicher.“', 'gedroht', { when: flag('c77_ripper_gedroht') }),
      ch('„Was machst du jetzt?“', 'lohn', { when: not(RIPPER_ERLEDIGT) }),
    ],
  }),
  node('deal', [
    l(HH, 'Frag nicht, wie. Hm. Du riechst nach Geschäft. Aber gut. Wenn es aufhört, hört es auf.', 'neutral'),
    l(HH, 'Die Jungs wollten zusammenlegen. Ich sag ihnen, sie sollen das Geld behalten. Du hast deins ja schon, was?', 'signatur'),
  ], { next: 'schluss' }),
  node('gedroht', [
    l(HH, 'Freundlich war der noch nie. Soll er kommen. Ich hab einen Greifarm und vierzig Kollegen.', 'signatur'),
  ], { next: 'lohn' }),
  node('lohn', [
    l(HH, 'Ich bring das zu Kessel. Und Container 77 schweißen wir zu. Heute noch. Mit Ripper drin, wenn er nicht aufpasst.', 'wut'),
    n('Er greift in seine Jacke und drückt dir einen zerknitterten Umschlag in die Hand. Darauf steht in sechs verschiedenen Handschriften: „Danke“.'),
    l(HH, 'Zweihundert. Von allen. Pjotr hat am meisten gegeben. Mit einem Arm.', 'freude'),
  ], { effects: [{ credits: 200 }], next: 'schluss' }),
  node('schluss', [
    l(HH, 'Wenn du mal Hilfe am Hafen brauchst: Frag nach Hannes. Jeder hier kennt mich. Und ab heute kennen sie dich.', 'freude'),
  ], { effects: [set(GEMELDET), herz(HH, 60)] }),
]);

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: {
    [start.id]: start, [container.id]: container, [versteck.id]: versteck, [ripper.id]: ripper, [bericht.id]: bericht,
  },
  mapAdditions: {
    hafenkante: {
      hotspots: [
        {
          id: 'c77-hannes', at: 'kai-mitte', label: 'Hafen-Hannes', kind: 'talk', dialogue: start.id,
          when: all(inactive(Q), { time: ['morgen', 'tag', 'abend'] }),
        },
        {
          id: 'c77-bericht', at: 'kai-mitte', label: 'Hafen-Hannes Bericht erstatten', kind: 'talk', dialogue: bericht.id,
          when: all(active(Q), BEWEIS, noFlag(GEMELDET), { time: ['morgen', 'tag', 'abend'] }),
        },
        {
          id: 'container-77', at: 'container-77', label: 'Container 77', kind: 'use', dialogue: container.id,
          when: all(active(Q), not(BEWEIS), { time: 'nacht' }),
        },
        {
          id: 'beweisfoto', at: 'container-77-versteck', label: 'Versteck zwischen den Fischkisten', kind: 'use', dialogue: versteck.id,
          when: all(active(Q), not(BEWEIS), DIENSTAG_NACHT),
        },
      ],
    },
    'ripper-praxis': {
      hotspots: [{
        id: 'c77-ripper', at: 'behandlungsstuhl', label: 'Ripper auf Container 77 ansprechen', kind: 'talk', dialogue: ripper.id,
        when: all(active(Q), BEWEIS, noFlag(GEMELDET), not(RIPPER_ERLEDIGT), { time: 'tag' }),
      }],
    },
  },
};
