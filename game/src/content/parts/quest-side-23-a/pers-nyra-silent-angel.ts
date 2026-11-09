// pers-nyra-silent-angel · „Silent-Angel“ (world.md §6.3 Nr. 38). Nyra (verschlüsselte Nachrichten, nachts) · überall ·
// Akt 2, Nyra in Quantum zurückgelassen (nyra_zurueckgelassen), ab nyra_team ≥ 1 oder Nyra ♥4.
// Ablauf: Nachricht 1 („Ich bin okay. Glaube ich.“) → Nachricht 2 (sie repariert Blades Chips, „Der Zentrator war falsch
// herum.“; als Telefon oder live am Funkpunkt im Datentunnel) → Nachricht 3 („Wenn ich zurückkomme, wollt ihr mich dann
// noch?“) mit Antwortdialog → optionales Treffen auf der Fußgängerbrücke (stufenplatz, nachts).
// Lösungen: gc-37 [Technik 8] Peilsender finden (peilsender_entdeckt → warnen: peilsender_gewarnt, ausnutzen:
// peilsender_ausgenutzt; main-3-labor wertet das aus) · gc-98 [Ausstrahlung 6] „Ein Team, das jemanden zurücklässt, ist
// keins.“ · meer-foto oder muschel-frisch schicken · Treffen ungesehen ([Reflexe 6] oder mit gewarntem Sender), sonst
// enc-bruecke-patrouille.
// nyra_team (Wert-Flags nyra_team_0 … nyra_team_3) steigt je Einheit um eins bis höchstens 3; Nyra ♥ bis etwa +200.
// Scheitert, wenn main-3-labor vorher abgeschlossen ist. Belohnung: 250 XP.
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueDef, DialogueNode, Effect, QuestDef } from '../../../modules/contracts';
import {
  active, AKT2, all, any, byId, ch, chk, COUNTDOWN, dlg, done, flag, hearts, herz, inactive, item, l, msg, n, noFlag, node,
  p, phone, set, VEX, won, zeit,
} from './_lib';

const Q = 'pers-nyra-silent-angel';
const NY = 'nyra';

const NACHT: Condition = zeit('nacht');
const TEAM = [0, 1, 2, 3].map((i) => `nyra_team_${i}`);
const KEIN_TEAM: Condition = all(...TEAM.map(noFlag));

const TREFFEN_OFFEN: Condition = all(flag('nsa_treffen_geplant'), noFlag('nsa_treffen_erledigt'));
const ABSCHLUSS: Condition = any(all(flag('nsa_antwort'), noFlag('nsa_treffen_geplant')), flag('nsa_treffen_erledigt'));

/**
 * Knoten „nyra_team + 1“ (höchstens 3): genau eine „Weiter.“-Wahl ist sichtbar und setzt die neue Stufe.
 * Kein Team-Flag gilt als Stufe 0.
 */
const teamPlus = (id: string, next?: string): DialogueNode => {
  const weiter = (when: Condition, effects: Effect[], key: string): DialogueChoice =>
    ch('Weiter.', next, { when, effects: [...effects, msg('Nyra gehört wieder ein Stück mehr zur Crew.')], id: `${id}-${key}` });
  return node(id, [n('Irgendwo in Quantum lächelt jemand in ein Display, das eigentlich nur Schaltpläne zeigen sollte.')], {
    choices: [
      ch('Weiter.', next, { when: flag(TEAM[3]), id: `${id}-voll` }),
      weiter(flag(TEAM[2]), [set(TEAM[2], false), set(TEAM[3])], '3'),
      weiter(all(flag(TEAM[1]), noFlag(TEAM[2]), noFlag(TEAM[3])), [set(TEAM[1], false), set(TEAM[2])], '2'),
      weiter(all(flag(TEAM[0]), noFlag(TEAM[1]), noFlag(TEAM[2]), noFlag(TEAM[3])), [set(TEAM[0], false), set(TEAM[1])], '1'),
      weiter(KEIN_TEAM, [set(TEAM[1])], '0'),
    ],
  });
};

const quest: QuestDef = {
  id: Q,
  kind: 'personal',
  title: 'Silent-Angel',
  summary: 'Nyra ist noch bei Quantum. Und nachts kommen Nachrichten von einer Nummer, die es nicht gibt. Verschlüsselt. Mit Tippfehlern.',
  giver: NY,
  act: 2,
  fail: done('main-3-labor'),
  steps: [
    { id: 'n1', text: 'Nachricht 1 von Nyra: „Ich bin okay. Glaube ich.“', done: flag('nsa_n1') },
    {
      id: 'n2', text: 'Warte auf Nyras nächste Nachricht. Nachts – oder live am Funkpunkt im Datentunnel.',
      when: flag('nsa_n2_frei'), done: flag('nsa_n2_gelesen'), marker: { map: 'datentunnel', at: 'nyra-funkpunkt' },
    },
    {
      id: 'peilsender', optional: true,
      text: 'Optional: Nyras Signal analysieren. Wer schreibt da noch mit? (Am Fenster im Crew-Quartier oder am Funkpunkt.)',
      when: flag('nsa_n2_gelesen'), done: flag('peilsender_entdeckt'), marker: { map: 'crew-quartier', at: 'fenster' },
    },
    {
      id: 'n3', text: 'Warte auf Nyras dritte Nachricht. Nachts.',
      when: flag('nsa_n3_frei'), done: flag('nsa_n3_gelesen'),
    },
    {
      id: 'antwort', text: 'Antworte Nyra. Was sagt man jemandem, der fragt, ob man ihn noch will?',
      when: flag('nsa_n3_gelesen'), done: flag('nsa_antwort'), marker: { map: 'crew-quartier', at: 'fenster' },
    },
    {
      id: 'treffen', optional: true, text: 'Treffen mit Nyra: Fußgängerbrücke am Stufenplatz, nachts. Ungesehen, wenn’s geht.',
      when: flag('nsa_treffen_geplant'), done: flag('nsa_treffen_erledigt'), marker: { map: 'stufenplatz', at: 'fussgaengerbruecke' },
    },
    { id: 'abschluss', text: 'Nyra weiß, dass sie zurückkommen darf.', when: flag('nsa_antwort'), done: ABSCHLUSS },
  ],
  reward: { xp: 250 },
};

// ---------------------------------------------------------------------------------------------- Nachricht 2 live

const funk: DialogueDef = dlg('nsa-funk', [
  node('start', [
    n('Die Funkecke im Datentunnel. Das alte Gerät knistert, obwohl es niemand eingeschaltet hat. Dann eine Stimme, leise, abgehackt, mit einem Echo, als käme sie aus einer Blechdose am anderen Ende der Stadt.'),
    l(NY, '… hört mich wer? Hallo? Ich hab den Kanal von Dante. Den alten. Den für Notfälle. Ist das ein Notfall? Ich glaub schon.', 'besorgt'),
    l(NY, 'Die lassen mich Blades Chips reparieren. Die Beta-Chips. Für die Unterstadt. Und weißt du was? Der Zentrator war falsch herum. Bei ALLEN. Die haben das monatelang so verbaut. Ich hab’s umgedreht. Ich bin so dumm. Ich hab ihre Scheiße repariert.', 'wut'),
  ], {
    choices: [
      ch('„Du bist nicht dumm. Du bist am Leben. Das zählt.“', 'leben'),
      ch('„Dreh sie wieder falsch rum. Heimlich.“', 'falsch'),
      ch('„Wie geht’s dir? Wirklich?“', 'wirklich'),
    ],
  }),
  node('leben', [
    l(NY, 'Am Leben. Ja. Mit einem Chip im Nacken, der piept, wenn ich lüge. Er piept gerade nicht. Komisch.', 'trauer'),
  ], { next: 'ende' }),
  node('falsch', [
    l(NY, 'Haha. Hahaha. Das … das könnte ich. Bei jedem zehnten. Damit keiner was merkt. Oh Gott, das ist gut. Das ist so gut.', 'freude'),
  ], { effects: [set('nyra_sabotiert_chips')], next: 'ende' }),
  node('wirklich', [
    l(NY, 'Ich schlaf in einem Raum ohne Fenster. Das Licht geht um zehn aus. Ich zähl die Lüftungsgitter. Es sind siebzehn. Gestern waren es achtzehn. Ich glaub, ich zähl falsch.', 'trauer'),
  ], { next: 'ende' }),
  node('ende', [
    l(NY, 'Ich muss weg. Die Schicht wechselt um eins. Ich meld mich. Versprochen. Ich halt Versprechen. Meistens.', 'besorgt'),
    n('Rauschen. Das Funkgerät ist wieder still. Im Staub daneben die gemalte Welle und das Herz.'),
  ], { effects: [set('nsa_n2_gelesen'), herz(NY, 20)] }),
]);

// ---------------------------------------------------------------------------------------------- Peilsender

const signal: DialogueDef = dlg('nsa-signal', [
  node('start', [
    n('Du legst die Mitschnitte von Nyras Nachrichten nebeneinander. Verschlüsselt, mit Dantes altem Notfall-Code. Aber da ist noch etwas: ein zweites Signal, im Takt der Nachrichten, ganz unten im Rauschen. Wie ein Schatten, der zu spät kommt.'),
  ], {
    choices: [
      ch('Das zweite Signal rausfiltern und zurückverfolgen.', 'entdeckt', { check: 'gc-37' }),
      ch('Später, mit mehr Rechenleistung.'),
    ],
  }),
  node('entdeckt', [
    n('Es ist kein Echo. Es ist ein Peilsender. Er sitzt in Nyras Chip, gleich neben dem Lügen-Pieper, und schickt jede ihrer Nachrichten als Kopie an einen Server im Quantum Spire. Nyra weiß nichts davon. Blade weiß alles.'),
    p('Du Arsch. Du lässt sie schreiben, damit sie dich zu uns führt.'),
  ], {
    effects: [set('peilsender_entdeckt'), { xp: 60 }],
    choices: [
      ch('Nyra sofort warnen.', 'warnen'),
      ch('Drin lassen. Blade mit falschen Nachrichten füttern.', 'ausnutzen'),
      ch('Erst mal nichts tun. Später entscheiden.'),
    ],
  }),
  node('warnen', [
    n('Eine kurze Nachricht, verschlüsselt, ohne Namen: „Du hast einen Mitleser. Im Chip. Neben dem Pieper.“'),
  ], { effects: [set('peilsender_gewarnt'), { phone: 'nsa-warnung-antwort' }, herz(NY, 40)] }),
  node('ausnutzen', [
    n('Du lässt den Sender, wo er ist. Ab jetzt steht in jeder Antwort an Nyra etwas, das Blade lesen soll: falsche Treffpunkte, falsche Uhrzeiten, ein Plan, der nie stattfinden wird. Nyra bekommt das Wichtige über einen zweiten Weg mit, verschlüsselt in Dantes Keksrezepten.'),
    p('Lies schön mit, Blade. Lies alles.'),
  ], { effects: [set('peilsender_ausgenutzt')] }),
]);

// ---------------------------------------------------------------------------------------------- Antwort auf Nachricht 3

const antwort: DialogueDef = dlg('nsa-antwort', [
  node('start', [
    n('Nyras dritte Nachricht steht noch auf dem Display. Kein Code diesmal. Nur der Satz. Drei Minuten lang tippst du an der Antwort.'),
    l(NY, '(Nachricht) Wenn ich zurückkomme, wollt ihr mich dann noch? Nach dem, was ich hier mache? Ich hab ihre Chips repariert. Ich hab gesagt, was sie hören wollten. Ich hab „Master“ gesagt. Nicht oft. Aber ich hab’s gesagt.', 'trauer'),
  ], {
    choices: [
      ch('„Ein Team, das jemanden zurücklässt, ist keins. Wir sind eins. Also komm zurück.“', 'team-wort', { check: 'gc-98' }),
      ch('Das Foto vom Meer schicken. Ohne Text.', 'foto', { requires: item('meer-foto'), effects: [{ take: 'meer-foto' }] }),
      ch('Ein Foto der Muschel schicken. „Liegt hier. Für dich. Hol sie ab.“', 'muschel', { requires: item('muschel-frisch') }),
      ch('„Klar wollen wir dich. Hör auf, so einen Scheiß zu fragen.“', 'einfach'),
    ],
  }),
  node('team-wort', [
    l(NY, '(Nachricht) Ihr habt mich zurückgelassen.', 'trauer'),
    l(NY, '(Nachricht) … Und jetzt schreibst du mir, dass das kein Team ist, das sowas macht. Also seid ihr keins. Also müsst ihr eins werden. Also muss ich zurück, damit ihr eins werdet. Das ist eine furchtbare Logik. Ich mag sie.', 'freude'),
  ], { effects: [herz(NY, 60)], next: 'team-1' }),
  teamPlus('team-1', 'treffen'),
  node('foto', [
    n('Du schickst das Foto. Das Meer, ein bisschen schief, ein bisschen zu grau, mit einem Streifen Sonnenlicht in der Mitte. Kein Text.'),
    l(NY, '(Nachricht) …', 'trauer'),
    l(NY, '(Nachricht) Es ist noch da.', 'zaertlich'),
    l(NY, '(Nachricht) Ich hab es auf das Display von meinem Lötkolben gelegt. Wenn die Wachen fragen, sag ich, es ist ein Testbild. Es ist kein Testbild. Es ist das Schönste, was ich je gesehen hab.', 'freude'),
  ], { effects: [herz(NY, 50), set('nyra_meer_foto')], next: 'team-2' }),
  teamPlus('team-2', 'treffen'),
  node('muschel', [
    l(NY, '(Nachricht) Eine MUSCHEL? Eine echte? Vom Meer? Die riecht bestimmt nach Salz. Kannst du riechen, ob sie nach Salz riecht? Riech mal. Riech JETZT.', 'freude'),
    p('Sie riecht nach Salz.'),
    l(NY, '(Nachricht) Okay. Okay. Dann komm ich sie holen. Das ist ein Grund. Ich brauch Gründe.', 'zaertlich'),
  ], { effects: [herz(NY, 50), set('nyra_muschel_versprochen')], next: 'team-3' }),
  teamPlus('team-3', 'treffen'),
  node('einfach', [
    l(NY, '(Nachricht) Okay. Okay. Hör auf, so lieb zu sein, sonst heul ich, und dann piept der Chip, weil Heulen für den eine Lüge ist.', 'verlegen'),
  ], { effects: [herz(NY, 20)], next: 'treffen' }),
  node('treffen', [
    l(NY, '(Nachricht) Ich hab morgen Nacht Spätschicht im Außenlager. Das ist nah am Stufenplatz. Die Fußgängerbrücke. Fünf Minuten. Nur fünf. Kommst du?', 'besorgt'),
  ], {
    choices: [
      ch('„Ich komm.“', 'zusage', { effects: [set('nsa_treffen_geplant')] }),
      ch('„Zu gefährlich. Bleib, wo du sicher bist. Wir kommen dich holen.“', 'absage'),
    ],
  }),
  node('zusage', [
    l(NY, '(Nachricht) Nachts. Brücke. Kapuze. Ich bin die mit der Kapuze. Alle haben Kapuzen. Ich bin die nervöse mit der Kapuze.', 'freude'),
  ], { effects: [set('nsa_antwort')] }),
  node('absage', [
    l(NY, '(Nachricht) Okay. Sicher. Ich bin hier sicher. Sicher wie ein Hamster im Laufrad. Aber okay. Ich wart auf euch. Diesmal wart ICH.', 'trauer'),
  ], { effects: [set('nsa_antwort')] }),
]);

// ---------------------------------------------------------------------------------------------- Treffen auf der Brücke

const treffenNodes = (): DialogueNode[] => [
  node('treffen', [
    n('Mitten auf der Brücke steht sie, die Hände in den Ärmeln, die Kapuze bis zur Nase. Nyra. Dünner. Blasser. Mit einem Pflaster im Nacken, wo der Chip sitzt. Sie sieht dich und hält sich am Geländer fest, als würde die Brücke schwanken.'),
    l(NY, 'Du bist da. Du bist wirklich da. Ich hab gedacht, ich bild mir dich ein. Das passiert mir neuerdings. Ich bild mir Sachen ein. Zum Beispiel Fenster.', 'ueberrascht'),
    n('Sie hat einen Rucksack auf dem Rücken. Voll. Darin: Platinen, Schaltpläne, ein Schlüsselbund mit Quantum-Logo und drei Tafeln Schokolade aus dem Mitarbeiterautomaten.'),
    p('Du … du hast ja gar nicht auf uns gewartet!'),
    l(NY, 'Hab ich doch! Ich hab nur nebenbei schon mal angefangen. Zugangskarten kopiert. Lagepläne fotografiert. Den Chip so umgebaut, dass er nur noch bei richtig großen Lügen piept. Ich bin halb draußen. Die andere Hälfte müsst ihr machen.', 'signatur'),
  ], {
    choices: [
      ch('„Dante hat Captain Kuschel wieder. Er wartet auf dich.“', 'kuschel', { when: done('side-captain-kuschel'), once: true, id: 'nsa-kuschel' }),
      ch('„Komm jetzt mit.“', 'mitkommen'),
      ch('Sie einfach umarmen.', 'umarmen'),
    ],
  }),
  node('kuschel', [
    l(NY, 'Er … sie haben ihn mir abgenommen. Am ersten Tag. Ich hab gedacht, sie haben ihn verbrannt. Ich hab nachts geheult. Leise. Wegen dem Pieper.', 'trauer'),
    l(NY, 'Er ist bei Dante. Gut. Gut, gut, gut.', 'freude'),
  ], { effects: [herz(NY, 20)], next: 'treffen' }),
  node('mitkommen', [
    l(NY, 'Nein. Noch nicht. Wenn ich jetzt verschwinde, wissen die, dass was faul ist. Dann ändern die alle Codes. Dann war alles umsonst.', 'besorgt'),
  ], { next: 'abschied' }),
  node('umarmen', [
    n('Sie ist steif wie ein Brett. Dann nicht mehr. Sie riecht nach Lötzinn und Krankenhaus und, ganz schwach, nach dem Kirschkaugummi, den sie immer kaut. Er ist ihr ausgegangen. Sie kaut trotzdem.'),
    l(NY, 'Fünf Minuten. Ich hab gesagt fünf Minuten. Das sind schon sechs.', 'zaertlich'),
  ], { effects: [herz(NY, 20)], next: 'abschied' }),
  node('abschied', [
    l(NY, 'Hier. Nimm den Rucksack. Das ist für Hunter. Für den Plan. Und sag ihm … sag ihm nichts. Ich sag’s ihm selbst. Wenn ich zurück bin.', 'signatur'),
    n('Dann ist sie weg, die Treppe runter, zwischen den Pendlern der Nachtschicht. Die mit der Kapuze. Die nervöse mit der Kapuze.'),
  ], { effects: [set('nsa_treffen_erledigt'), set('nyra_halb_frei'), herz(NY, 40)], next: 'team' }),
  teamPlus('team'),
];

const bruecke: DialogueDef = dlg('nsa-bruecke', [
  node('start', [
    n('Die Fußgängerbrücke über die Stufen, nachts. Wind, Werbelicht, unten das Rauschen der Hochbahn. In der Mitte eine Gestalt mit Kapuze. Am anderen Ende, auf dem Dach eines Kiosks: ein kurzes weißes Aufblitzen. Ein Visier? Oder nur ein Reflex?'),
  ], {
    choices: [
      ch('Unten an der Brücke entlang, im Schatten der Träger, ungesehen bis zur Mitte.', 'ungesehen', { check: chk('nsa-bruecke-schleichen', 'reflexe', 6, ['schleichen']) }),
      ch('Ganz normal hingehen. Sie hat den Sender abgeklebt.', 'sicher', { when: flag('peilsender_gewarnt') }),
      ch('Einfach hingehen.', 'streife', { when: noFlag('peilsender_gewarnt') }),
      ch('Erst mal nicht. Zu viel Licht.'),
    ],
  }),
  node('ungesehen', [
    n('Von Träger zu Träger, über ein Rohr, unter einer Werbetafel durch, die „Chrome 10 – Jetzt noch näher!“ ruft. Das Aufblitzen auf dem Kioskdach dreht sich weg. Niemand sieht dich.'),
  ], { next: 'treffen' }),
  node('sicher', [
    n('Keine Streife. Kein Visier. Das Aufblitzen auf dem Kioskdach war ein Taubenauge. Nyra hat den Sender abgeklebt. Mit Kaugummi.'),
  ], { next: 'treffen' }),
  node('streife', [
    n('Du gehst los. Nach drei Schritten leuchten hinter Nyra zwei Visiere auf.'),
  ], { effects: [{ battle: 'enc-bruecke-patrouille' }] }),
  ...treffenNodes(),
]);

const brueckeNachKampf: DialogueDef = dlg('nsa-bruecke-nach', [
  node('start', [
    n('Die Streife liegt im Kanal. Nyra hält sich am Geländer fest und atmet, als wäre sie die Treppe hochgerannt.'),
  ], { next: 'treffen' }),
  ...treffenNodes(),
]);

// ---------------------------------------------------------------------------------------------- Telefon

const START: Condition = all(
  AKT2, COUNTDOWN, inactive(Q), flag('nyra_zurueckgelassen'), NACHT,
  any(flag(TEAM[1]), flag(TEAM[2]), flag(TEAM[3]), hearts(NY, 4)),
);

const phones = [
  phone('nsa-nachricht-1', NY, '[verschlüsselt · Dantes alter Notfall-Code] Ich bin okay. Glaube ich. Schreibt nicht zurück, die lesen alles. Ich schreib, wenn ich kann. Nicht suchen. Ich mein’s ernst. Okay, ein bisschen suchen.', {
    auto: START,
    effects: [{ startQuest: Q }, set('nsa_n1')],
    replies: [
      { text: '„Wir holen dich raus.“', effects: [herz(NY, 20)] },
      { text: '„Wo genau bist du?“', effects: [herz(NY, 10)] },
    ],
  }),
  phone('nsa-nachricht-2', NY, '[verschlüsselt] Die lassen mich Blades Chips reparieren. Die für die Unterstadt. Der Zentrator war falsch herum. Bei allen. Ich hab’s umgedreht, bevor ich nachgedacht hab. Jetzt funktionieren sie besser. Ich hasse mich ein bisschen.', {
    auto: all(active(Q), flag('nsa_n2_frei'), noFlag('nsa_n2_gelesen'), NACHT),
    effects: [set('nsa_n2_gelesen')],
    replies: [
      { text: '„Dreh jeden zehnten wieder falsch rum.“', effects: [set('nyra_sabotiert_chips'), herz(NY, 20)] },
      { text: '„Du lebst. Das reicht erst mal.“', effects: [herz(NY, 20)] },
    ],
  }),
  phone('nsa-nachricht-3', NY, 'Wenn ich zurückkomme, wollt ihr mich dann noch?', {
    auto: all(active(Q), flag('nsa_n3_frei'), noFlag('nsa_n3_gelesen'), NACHT),
    effects: [set('nsa_n3_gelesen'), { dialogue: antwort.id }],
  }),
  phone('nsa-warnung-antwort', NY, '[verschlüsselt] SCHEISSE. Okay. Okay okay okay. Gefunden. Ich hab ihn mit Kaugummi abgeklebt. Ab jetzt hört er nur noch, wie ich kaue. Danke. Ernsthaft. DANKE.'),
  phone('nsa-vex', NY, '[verschlüsselt] Die Postbotin. Ausgerechnet du liest mit? Grüß Aria. Sag ihr, ich hab ihren Arm in den Akten gesehen. Sag ihr, sie soll aufpassen.', {
    auto: all(VEX, active(Q), flag('nsa_n2_gelesen'), noFlag('nsa_n3_frei'), NACHT),
  }),
];

const SIGNAL: Condition = all(active(Q), flag('nsa_n2_gelesen'), noFlag('peilsender_entdeckt'));

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: byId([funk, signal, antwort, bruecke, brueckeNachKampf]),
  phone: byId(phones),
  daily: byId([
    // Reihenfolge: zuerst die spätere Stufe, damit pro Morgen nur ein Schritt passiert.
    { id: 'nsa-n3-frei', when: all(active(Q), flag('nsa_n2_gelesen'), flag('nsa_n2_frei'), noFlag('nsa_n3_frei')), effects: [set('nsa_n3_frei')] },
    { id: 'nsa-n2-frei', when: all(active(Q), flag('nsa_n1'), noFlag('nsa_n2_frei')), effects: [set('nsa_n2_frei')] },
  ]),
  mapAdditions: {
    datentunnel: {
      hotspots: [
        {
          id: 'nsa-funk', at: 'nyra-funkpunkt', label: 'Das Funkgerät knistert', kind: 'use', dialogue: funk.id,
          when: all(active(Q), flag('nsa_n2_frei'), noFlag('nsa_n2_gelesen'), zeit('abend', 'nacht')),
        },
        {
          id: 'nsa-signal-tunnel', at: [1250, 770], radius: 44, label: 'Nyras Signal analysieren', kind: 'use', dialogue: signal.id,
          when: SIGNAL,
        },
      ],
    },
    'crew-quartier': {
      hotspots: [
        {
          id: 'nsa-signal', at: [690, 310], radius: 44, label: 'Nyras Signal analysieren', kind: 'use', dialogue: signal.id,
          when: SIGNAL,
        },
        {
          id: 'nsa-antworten', at: 'fenster', label: 'Nyra antworten', kind: 'use', dialogue: antwort.id,
          when: all(active(Q), flag('nsa_n3_gelesen'), noFlag('nsa_antwort')),
        },
      ],
    },
    stufenplatz: {
      hotspots: [
        {
          id: 'nsa-bruecke', at: 'fussgaengerbruecke', label: 'Gestalt mit Kapuze auf der Brücke', kind: 'talk', dialogue: bruecke.id,
          when: all(active(Q), TREFFEN_OFFEN, NACHT, { not: won('enc-bruecke-patrouille') }),
        },
        {
          id: 'nsa-bruecke-nach', at: 'fussgaengerbruecke', label: 'Nyra am Geländer', kind: 'talk', dialogue: brueckeNachKampf.id,
          when: all(active(Q), TREFFEN_OFFEN, won('enc-bruecke-patrouille')),
        },
      ],
    },
  },
};
