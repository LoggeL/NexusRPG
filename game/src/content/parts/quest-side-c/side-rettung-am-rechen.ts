// side-rettung-am-rechen · „Rettung am Rechen“ (world.md §6.2 Nr. 30). Fluss-Frieda, kanal-sammler, jederzeit.
// Nach Rostregen hängen Dinge und manchmal Kanalvolk-Kinder am großen Rechen fest → bergen.
// Erster Einsatz: Zonen-Dialog kanal-rechen (gc-125, Seilwinde [Technik 4], Bolzen, Floß-Minispiel) setzt rechen_geborgen.
// „Wiederholbar nach Regen“: Es gibt keine Wetterbedingung (gaps/quest-side-c.md). Darum drei weitere Einsätze, die Frieda
// nach dem ersten an verschiedenen Wochentagen meldet („Heute Nacht hat’s Rost geregnet“), je 80 XP, Ruf kanalvolk +5, Treibgut.
import type { ContentPart } from '../../part';
import type { Condition, DialogueDef, Effect, HotspotDef, QuestDef, Weekday } from '../../../modules/contracts';
import type { MapAddition } from '../../part';
import { active, all, ch, chk, dlg, done, flag, herz, inactive, l, n, noFlag, node, set } from './_q';

const Q = 'side-rettung-am-rechen';
const FR = 'fluss-frieda';
const GEBORGEN = 'rechen_geborgen';
const GEMELDET = 'rechen_gemeldet';
const FRIEDA_DA: Condition = { time: ['morgen', 'tag', 'abend'] };

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: 'Rettung am Rechen',
  summary: 'Nach dem Rostregen schwemmt der Kanal alles an den großen Rechen. Heute: ein Kind. Fluss-Frieda kommt mit dem Floß nicht nah genug ran.',
  giver: FR,
  act: 1,
  steps: [
    {
      id: 'bergen', text: 'Hol das Kanalvolk-Kind vom großen Rechen (links am Laufsteg Nord).',
      done: flag(GEBORGEN), marker: { map: 'kanal-sammler', at: [205, 300] },
    },
    {
      id: 'frieda', text: 'Gib Fluss-Frieda Bescheid.',
      when: flag(GEBORGEN), done: flag(GEMELDET), marker: { map: 'kanal-sammler', at: [578, 704] },
    },
  ],
  reward: { xp: 80, rep: { kanalvolk: 5 }, items: { treibholz: 1, 'schrott-ersatzteil': 2 } },
};

// ---------------------------------------------------------------------------------------------- Erster Einsatz

const start: DialogueDef = dlg('rechen-start', [
  node('start', [
    n('Fluss-Frieda steht auf ihrem Floß und stochert mit einer langen Stange in Richtung Rechen. Sie flucht in einer Sprache, die zur Hälfte aus Seemannsgarn und zur Hälfte aus Kanalgurgeln besteht.'),
    l(FR, 'Du! Hast du Arme? Hast du Beine? Gut. Heute Nacht hat’s Rost geregnet, der Kanal hat alles runtergespült, was oben nicht festgeschraubt war.', 'besorgt'),
    l(FR, 'Am Rechen hängt die kleine Muck. Neun Jahre, Stirnlampe, Klappe größer als der Kanal. Sie wollte Treibgut fischen. Jetzt fischt der Rechen sie.', 'besorgt'),
    l(FR, 'Mein Floß kommt nicht nah genug ran, die Strömung drückt es weg. Hol sie da raus. Schnell. Das Wasser steigt.', 'wut'),
  ], {
    choices: [
      ch('„Bin unterwegs.“', 'los', { effects: [{ startQuest: Q }] }),
      ch('„Was krieg ich dafür?“', 'lohn'),
    ],
  }),
  node('lohn', [
    l(FR, 'Was du kriegst? Ein Kind, das noch lebt. Und meinetwegen das Treibgut, das ich heute rausfische. Und meine ewige Dankbarkeit. Die ist nicht viel wert. Aber sie ist ewig.', 'wut'),
  ], { choices: [ch('„Schon gut, schon gut.“', 'los', { effects: [{ startQuest: Q }] })] }),
  node('los', [
    l(FR, 'Links. Am Laufsteg Nord. Wo es am lautesten gurgelt. Du kannst es nicht verfehlen. Und wenn doch: Folge dem Geschrei.', 'signatur'),
  ]),
]);

const bericht: DialogueDef = dlg('rechen-bericht', [
  node('start', [
    n('Muck sitzt triefend auf Friedas Floß, in eine Decke gewickelt, und erzählt jedem, der nicht schnell genug wegläuft, dass sie den Rechen fast allein besiegt hätte.'),
    l(FR, 'Du hast sie rausgeholt. Ich hab’s gesehen. Ich hab nichts gesagt, weil ich sonst geheult hätte. Ich heule nicht. Das ist Kanalwasser.', 'freude'),
    l(FR, 'Hier. Das hat der Regen gebracht. Treibholz, Schrauben, ein Ersatzteil, das noch zuckt. Nimm. Und komm wieder, wenn’s regnet. Es regnet immer wieder.', 'signatur'),
  ], { effects: [set(GEMELDET), herz(FR, 40)] }),
]);

// ---------------------------------------------------------------------------------------------- Weitere Einsätze

interface Einsatz {
  nr: number;
  tage: Weekday[];
  meldung: string[];
  rechen: string;
  koerper: string;
  winde: string;
  bolzen: string;
  floss: string;
  dank: string;
}

const EINSAETZE: Einsatz[] = [
  {
    nr: 2, tage: ['mo', 'di'],
    meldung: [
      'Heute Nacht hat’s wieder Rost geregnet. Am Rechen hängt eine Quantum-Lieferdrohne. Sie piept. Sie hat eine Pizza geladen.',
      'Ich will die Pizza. Ich meine: Die Drohne verstopft den Rechen. Hol sie runter. Die Pizza teilen wir.',
    ],
    rechen: 'Eine Quantum-Lieferdrohne hängt kopfüber im Rechen, die Rotoren im Gitter verkeilt. „IHRE LIEFERUNG VERSPÄTET SICH“, sagt sie. Seit Stunden.',
    koerper: 'Du stemmst das Gitter auf, die Drohne rutscht dir in die Arme und bedankt sich mit einem Gutschein über 0,5 % Rabatt.',
    winde: 'Du kurbelst die Drohne an der Seilwinde hoch. Sie dreht sich langsam im Kreis und spielt dabei Wartemusik.',
    bolzen: 'Bolzen springt, schnappt die Drohne am Landebein und bringt sie apportiert zurück. Die Pizza auch. Die Pizza fast.',
    floss: 'Am Rechen gebremst, Drohne geschnappt. Die Pizza ist nass, aber Frieda sagt, das nennt man hier „Kanalstil“.',
    dank: 'Pizza Funghi. Wie passend. Ich ess den Rand, du kriegst das Treibgut. Gerecht ist gerecht.',
  },
  {
    nr: 3, tage: ['mi', 'do'],
    meldung: [
      'Es hat geregnet. Und jetzt rate, wer am Rechen hängt.',
      'Der Bürgermeister. Gully. Er wollte den Rechen inspizieren und hat sich mit der Schärpe im Gitter verheddert. Er hält da gerade eine Rede. An die Strömung.',
    ],
    rechen: 'Bürgermeister Gully hängt am Rechen, die Absperrband-Schärpe im Gitter verheddert, die Kronkorkenkrone schief. Er hält eine Rede. „Bürgerinnen und Bürger der Strömung! Lasst mich los!“',
    koerper: 'Du hältst das Gitter, Gully strampelt sich frei und ernennt dich noch im Wasser zum „Ehrenretter erster Klasse“.',
    winde: 'Du kurbelst Gully an der Seilwinde hoch wie einen nassen Sack voller Würde. Er winkt dabei der Menge. Die Menge sind zwei Ratten.',
    bolzen: 'Bolzen packt Gully an der Schärpe und zieht. Die Schärpe reißt. Gully nicht. Er ist frei. Und tief gekränkt, aber frei.',
    floss: 'Du bremst am Rechen, Gully plumpst aufs Floß und erklärt den Rest der Fahrt, wie man ein Floß richtig steuert.',
    dank: 'Der Bürgermeister hat gesagt, das kommt in die Annalen der Rohre. Ich hab gesagt, du kriegst lieber das Treibgut. Er hat zugestimmt. Widerwillig.',
  },
  {
    nr: 4, tage: ['fr', 'sa', 'so'],
    meldung: [
      'Rostregen. Am Rechen hängt ein Korb. Und in dem Korb … quiekt was.',
      'Rattenbabys. Sieben Stück. Ich mag keine Ratten. Aber Babys. Hol sie da raus, bevor ich weich werde.',
    ],
    rechen: 'Ein Wäschekorb hängt am Rechen, halb untergetaucht. Darin sieben nasse, sehr wütende Rattenbabys. Eins trägt einen winzigen Kronkorken als Helm.',
    koerper: 'Du hältst das Gitter und angelst den Korb mit dem Fuß heraus. Sieben Rattenbabys beißen dir dankbar in die Schnürsenkel.',
    winde: 'Die Seilwinde hebt den Korb aus dem Wasser. Sieben kleine Köpfe schauen dich an. Sie quieken im Chor. Es klingt wie Applaus.',
    bolzen: 'Bolzen nimmt den Korb vorsichtig ins Maul, trägt ihn ans Ufer und legt sich daneben. Die Rattenbabys klettern auf ihn. Er lässt es zu.',
    floss: 'Am Rechen gebremst, Korb geschnappt, sieben Babys an Bord. Frieda sagt, wenn du jemandem davon erzählst, ist dein Floß-Abo gekündigt.',
    dank: 'Die Babys bleiben erst mal bei mir. Ich hab sie nach den Wochentagen benannt. Sonntag beißt. Nimm das Treibgut, bevor ich sentimental werde.',
  },
];

function einsatz(e: Einsatz): { dialogues: DialogueDef[]; hotspots: (Omit<HotspotDef, 'at'> & { at: string })[] } {
  const offen = `rechen_einsatz_${e.nr}`;
  const fertig = `rechen_einsatz_${e.nr}_fertig`;
  const vorher: Condition = e.nr === 2 ? done(Q) : flag(`rechen_einsatz_${e.nr - 1}_fertig`);
  const lohn: Effect[] = [{ xp: 80 }, { rep: 'kanalvolk', delta: 5 }, { give: 'treibholz' }, { give: 'schrott-ersatzteil' }, set(fertig)];
  const meldung = dlg(`rechen-meldung-${e.nr}`, [
    node('start', e.meldung.map(text => l(FR, text, 'besorgt')), {
      choices: [
        ch('„Bin schon unterwegs.“', undefined, { effects: [set(offen)] }),
        ch('„Heute nicht, Frieda.“'),
      ],
    }),
  ]);
  const rettung = dlg(`rechen-einsatz-${e.nr}`, [
    node('start', [n(e.rechen)], {
      choices: [
        ch('Das Gitter aufstemmen und halten.', 'koerper', { check: 'gc-125' }),
        ch('Die rostige Seilwinde flicken und hochkurbeln.', 'winde', { check: chk('rechen-seilwinde-wieder', 'technik', 4, ['maschine', 'reparieren']) }),
        ch('Bolzen, apport!', 'bolzen', { tag: '[Bolzen]', when: { companion: 'bolzen' } }),
        ch('Mit Friedas Floß rüber.', undefined, {
          effects: [{
            minigame: 'akt-floss', level: 2, key: `rechen-einsatz-${e.nr}`, label: 'Floßfahrt zum Rechen',
            win: [...lohn, { message: e.floss }],
            lose: [{ message: 'Die Strömung dreht dich einmal im Kreis und spuckt dich am Anleger wieder aus. Noch mal.' }],
          }],
        }),
        ch('Später.'),
      ],
    }),
    node('koerper', [n(e.koerper)], { effects: lohn }),
    node('winde', [n(e.winde)], { effects: lohn }),
    node('bolzen', [n(e.bolzen)], { effects: lohn }),
  ]);
  const dank = dlg(`rechen-dank-${e.nr}`, [
    node('start', [l(FR, e.dank, 'freude')], { effects: [set(`${fertig}_bedankt`), herz(FR, 10)] }),
  ]);
  return {
    dialogues: [meldung, rettung, dank],
    hotspots: [
      {
        id: `rechen-meldung-${e.nr}`, at: 'friedas-stand', label: 'Fluss-Frieda winkt aufgeregt', kind: 'talk', dialogue: meldung.id,
        when: all(vorher, noFlag(offen), { weekday: e.tage }, FRIEDA_DA),
      },
      {
        id: `rechen-einsatz-${e.nr}`, at: 'rechen', label: 'Am Rechen hängt was', kind: 'use', dialogue: rettung.id,
        when: all(flag(offen), noFlag(fertig)),
      },
      {
        id: `rechen-dank-${e.nr}`, at: 'friedas-stand', label: 'Frieda Bescheid geben', kind: 'talk', dialogue: dank.id,
        when: all(flag(fertig), noFlag(`${fertig}_bedankt`), FRIEDA_DA),
      },
    ],
  };
}

const runden = EINSAETZE.map(einsatz);

const kanal: MapAddition = {
  hotspots: [
    {
      id: 'rechen-frieda-start', at: 'friedas-stand', label: 'Fluss-Frieda stochert im Wasser', kind: 'talk', dialogue: start.id,
      when: all(inactive(Q), FRIEDA_DA),
    },
    {
      id: 'rechen-frieda-bericht', at: 'friedas-stand', label: 'Frieda Bescheid geben', kind: 'talk', dialogue: bericht.id,
      when: all(active(Q), flag(GEBORGEN), noFlag(GEMELDET), FRIEDA_DA),
    },
    ...runden.flatMap(r => r.hotspots),
  ],
};

const dialogues: Record<string, DialogueDef> = { [start.id]: start, [bericht.id]: bericht };
for (const r of runden) for (const d of r.dialogues) dialogues[d.id] = d;

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues,
  mapAdditions: { 'kanal-sammler': kanal },
};

