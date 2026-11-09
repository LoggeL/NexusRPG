// pers-kinder-wasserturm · Das Dach des Nests (world.md §6.5; alle drei Kinder ♥6, Start über he-daria-6 in daria.ts).
// Material: 200 Cr bei Gustav, `[Gustav ♥4]` Gustav hilft (gratis und packt mit an), `[Straße 5]` Restposten für 100 Cr,
// oder Gustavs Kran entrosten (ohne Check). Flicken: `[Technik 5]`, mit Gustav ohne Check, oder eine lange Nacht mit den Kindern.
import type { QuestDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import {
  type Beitrag, L, N, P, active, all, any, beitrag, bye, byId, c, chk, cr, dlg, flag, give, hearts, item, node, noFlag, nochWas, rel,
  set, schritt, spotUse, szene, tafel, take, zeit,
} from './_lib';

const Q = 'pers-kinder-wasserturm';
const AKTIV = active(Q);
const GU = 'opa-gustav';
const PAPPE = 'dachpappe-paket';

const quest: QuestDef = {
  id: Q, kind: 'personal', act: 1, giver: 'daria',
  title: 'Ein Dach für das Nest',
  summary: 'Das Nest im Wasserturm leckt. Daria, Freya und Jakko schlafen unter einem Eimer. Zeit, das Dach dicht zu machen.',
  autoStart: all(hearts('daria', 6), hearts('freya', 6), hearts('jakko', 6)),
  steps: [
    {
      id: 'material', text: 'Besorg Dachpappe und Blech – Opa Gustav hat welche (Schrottkram-Stand, tagsüber; abends am Wohnwagen).',
      done: any(item(PAPPE), flag('wt_dicht')), marker: { map: 'schrottmarkt' },
    },
    schritt('flicken', 'Flick das Dach des Nests (Wasserturm, Rohrsiedlung).', 'wt_dicht', { when: any(item(PAPPE), flag('wt_dicht')), marker: { map: 'das-nest' } }),
  ],
  reward: { xp: 250, relations: { daria: 100, freya: 100, jakko: 100, 'opa-gustav': 30 }, rep: { unterstadt: 5 } },
};


// ------------------------------------------------------------------------------------------- Gustav
const gustav = beitrag(GU, all(AKTIV, { noItem: PAPPE }, noFlag('wt_dicht')), '„Das Dach vom Nest leckt. Ich brauch Pappe, Blech und Nieten.“', [
  node('wt-g-start', [
    L(GU, 'Das Nest? Wo die drei Rabauken wohnen? Ach herrje. Früher war der Wasserturm grün gestrichen, weißt du. Und dicht.', 'besorgt'),
    L(GU, 'Pappe, Blech, Nieten, Dichtmasse – hab ich alles. Aber Material ist Material. Zweihundert, und das ist der Freundschaftspreis. Für Fremde wär’s ein Herzinfarkt.'),
  ], {
    choices: [
      c('Zweihundert Credits zahlen.', 'wt-g-gekauft', { requires: { credits: 200 }, effects: [cr(-200)] }),
      c('„Gustav. Die Kinder. Du hast doch auch mal unter einem Eimer geschlafen.“', 'wt-g-hilft', { tag: '[Gustav ♥4]', requires: hearts(GU, 4) }),
      c('„Ich nehm die Restposten. Die verbeulten, die keiner will. Hundert.“', 'wt-g-rest',
        { check: chk('wt-restposten', 'strasse', 5, ['feilschen']), requires: { credits: 100 }, effects: [cr(-100)] }),
      c('„Ich zahl mit Arbeit. Dein Kran quietscht seit Wochen.“', 'wt-g-kran'),
    ],
  }),
  node('wt-g-gekauft', [L(GU, 'Gut angelegt. Das beste Geld ist das, das über einem Kinderkopf hängt und nicht runterfällt.', 'freude')], {
    effects: [give(PAPPE)], choices: [nochWas(), bye()],
  }),
  node('wt-g-hilft', [
    L(GU, '… Hab ich. Neunzehnhundert … ach, egal, lange her. Unter einem Eimer, der immer pünktlich um drei voll war.', 'trauer'),
    L(GU, 'Nimm alles. Und ich komm mit. Knurri bleibt hier, der hat Höhenangst. Und ich hab einen Akkuschrauber, der älter ist als du.', 'freude'),
  ], { effects: [give(PAPPE), set('wt_gustav'), rel(GU, 30)], choices: [nochWas(), bye()] }),
  node('wt-g-rest', [
    L(GU, 'Die verbeulten? Ha! Du bist ein Fuchs. Die verbeulten halten am besten. Die haben schon was erlebt.', 'freude'),
  ], { effects: [give(PAPPE)], choices: [nochWas(), bye()] }),
  node('wt-g-kran', [
    N('Drei Stunden auf dem Kran, mit Drahtbürste, Ölkännchen und Aussicht über den ganzen Markt. Unten winkt Jakko. Oben schimpft eine Möwe aus Blech.'),
    L(GU, 'Er quietscht nicht mehr! Er schnurrt! Das ist ein Kran, kein Kater! … Na, nimm das Zeug. Hast es dir verdient.', 'freude'),
  ], { effects: [zeit(180), give(PAPPE), rel(GU, 20)], choices: [nochWas(), bye()] }),
]);

export const beitraege: Beitrag[] = [gustav];

// ------------------------------------------------------------------------------------------- Dach flicken
const flicken = dlg('pj-wt-flicken', [
  node('start', [
    N('Über den Schlafnischen ein Riss im Blech, so breit wie Jakkos Hand. Darunter der Eimer. Daria hält die Leiter. Freya hält ein Protokoll. Jakko hält ein Brot.'),
    L('daria', 'Und? Kriegst du das hin? Ehrlich jetzt. Ich will keinen Trost, ich will ein Dach.', 'besorgt'),
  ], {
    choices: [
      c('Blech zuschneiden, falzen, nieten. Sauber.', 'technik', { check: chk('wt-dach', 'technik', 5, ['reparieren', 'handwerk']) }),
      c('Gustav die Leiter halten und machen, was er sagt.', 'gustav', { when: flag('wt_gustav') }),
      c('„Wir machen das zusammen. Alle. Bis es dicht ist.“', 'nacht'),
    ],
  }),
  node('technik', [
    N('Du arbeitest wie in einer Werkstatt, die dir gehört. Blech, Falz, Niete, Dichtmasse. Jakko reicht Nieten an. Freya zählt sie. Daria flucht, wenn du dir auf den Daumen haust. Freya kassiert einen Keks.'),
  ], { effects: [rel('daria', 20)], next: 'fertig' }),
  node('gustav', [
    L(GU, 'Nicht so! So! Mit Gefühl! Blech ist wie eine alte Dame, das zwingt man nicht, das überredet man.', 'freude'),
    N('Zwei Stunden. Gustav erzählt von früher, die Kinder hören zu, als wär’s ein Märchen. Am Ende ist das Dach dicht und Gustav hat Teer im Bart.'),
  ], { effects: [zeit(120), rel(GU, 20)], next: 'fertig' }),
  node('nacht', [
    N('Es wird eine lange Nacht. Ihr probiert, scheitert, lacht, probiert anders. Um drei Uhr ist der Eimer zum ersten Mal leer geblieben. Um vier schlafen alle drei Kinder auf dem Boden, Werkzeug in den Händen.'),
    P('Dicht. Wahrscheinlich. Ich hab keine Ahnung mehr, wie Schlafen geht.', 'freude'),
  ], { effects: [zeit(300), rel('daria', 20), rel('freya', 20), rel('jakko', 20)], next: 'fertig' }),
  node('fertig', [N('Die letzte Niete sitzt. Draußen grollt es über der Rohrsiedlung.')], { effects: [take(PAPPE), set('wt_dicht'), { cutscene: 'pj-wt-regen' }] }),
]);

const regen = szene('pj-wt-regen', 'Ein Dach für das Nest', [
  tafel('In der nächsten Nacht kommt Rostregen. Er trommelt auf das neue Blech wie ein Schlagzeuger ohne Takt.'),
  tafel('Unter dem Dach steht der Eimer. Er bleibt leer.', [
    L('jakko', 'Hört ihr das? Das ist der schönste Krach der Welt. Schöner als eine Dampfnudel, die ins Wasser fällt.', 'freude'),
    L('freya', 'Hiermit erkläre ich das Dach für dicht. Einstimmig. Keine Einsprüche.', 'freude'),
    L('daria', 'Du kommst auf die Karte. Mit grünem Punkt. Mit dem dicksten.', 'zaertlich'),
  ]),
]);

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: byId(flicken),
  cutscenes: byId(regen),
  mapAdditions: {
    'das-nest': {
      hotspots: [spotUse('pj-wt-dach-flicken', 'undichtes-dach', 'Das Dach flicken', flicken.id, all(AKTIV, item(PAPPE), noFlag('wt_dicht')))],
    },
  },
};

