// Portier Albert – Portier am Chrome Tower, seit vierzig Jahren im Dienst der Familie Chrome (world.md §4.5, §4.3 Oberstadt).
// Volle Fassung ab Akt 2; ersetzt npc-welt/portier-albert.ts (gleiche ID, Akt-1-Sätze albert-tag-oberstadt/-runde übernommen).
// Tagesablauf nach act23.json: nachts Penthouse-Runde (side-alte-gewohnheiten), sonst morgens bis abends in der Portierloge.
// Den Einlass am Boulevard (chrome-albert-einlass, gc-108) und side-chrome-pudel starten Karten- und Quest-Teil; hier:
// Tagesgespräche, he-portier-albert-2 (Etikette-Übung, akt-etikette) und he-portier-albert-4 (Handschuh-Sammlung;
// setzt albert_laesst_rein, das die Karte für den Penthouse-Einlass liest).
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode } from '../../../modules/contracts';
import {
  type Menue, AKT2, EPILOG, alle, dialog, einSatz, erz, flag, gesehen, geschenke, gespraech, herz, ich, knoten, meldung,
  nichtGetroffen, ort, pruefung, queststand, rede, rivale, sammle, sprecher, weg, weltfigur, xp, zurueck,
} from './_q';

const ID = 'portier-albert';
const A = sprecher(ID);
const Z = zurueck('Noch eine Frage, Albert.', 'Ich empfehle mich.');

const EINBRUCH: Condition = queststand('side-alte-gewohnheiten', 'active');
const PUDEL_LAEUFT: Condition = queststand('side-chrome-pudel', 'active');
const PUDEL_DONE: Condition = queststand('side-chrome-pudel', 'done');

const choices: DialogueChoice[] = [
  { text: '„Vierzig Jahre an derselben Tür. Wird das nicht langweilig?“', once: true, id: 'al-tuer', next: 'tuer' },
  { text: '„Wie sind die Chrome-Schwestern so, als Chefinnen?“', once: true, id: 'al-schwestern', next: 'schwestern' },
  {
    text: '„Ich hab gesehen, wie Blade dich behandelt. Du hast was Besseres verdient.“', tag: '[Straße 5]',
    check: pruefung('portier-albert-blade', 'strasse', 5, ['durchschauen']), once: true, id: 'al-blade', next: 'blade',
    effects: [herz(ID, 30)],
  },
  {
    text: '„Mein Vater hatte auch einen Portier. Er hieß nicht Albert. Er war schlechter.“', tag: '[Oberstadt]',
    when: { origin: 'origin-oberstadt' }, once: true, id: 'al-oberstadt', next: 'oberstadt', effects: [herz(ID, 40)],
  },
  { text: 'Ich empfehle mich.' },
];

const nodes: DialogueNode[] = [
  knoten('tuer', [
    A('Langweilig? Diese Tür hat drei Präsidenten, zwei Revolutionen und einen Hund gesehen, der in den Aufzug gepinkelt hat. Ich habe ihn persönlich hinausbegleitet. Den Hund. Und den Präsidenten.'),
    A('Eine Tür ist nie langweilig. Nur die Leute, die durch sie gehen, sind es manchmal.'),
  ], { choices: Z }),
  knoten('schwestern', [
    A('Fräulein Seraphina grüßt nicht, aber sie merkt sich, wenn ich krank bin. Fräulein Sybella grüßt mit Rabatt. Fräulein Serenity grüßt die Blumen vor mir, und dann mich. Ich bin dankbar für die Reihenfolge. Die Blumen waren zuerst da.'),
    A('Ich habe sie alle drei in Windeln gesehen. Ich sage das nur Leuten, die es nicht weitererzählen.', 'signatur'),
  ], { choices: Z }),
  knoten('blade', [
    erz('Albert richtet seinen rechten Handschuh. Es ist eine Geste, die bei ihm wie ein Fluch klingt.'),
    A('Herr Blade nennt mich „Alfred“. Seit elf Jahren. Ich habe ihn nie korrigiert. Ein Portier korrigiert nicht. Ein Portier wartet.'),
    A('Und eines Tages, wenn Herr Blade mit seinem Teddyfell im Regen steht und die Tür nicht aufgeht, werde ich mich sehr genau daran erinnern, dass ich Alfred heiße.'),
  ], { choices: Z, effects: [flag('albert_blade_groll')] }),
  knoten('oberstadt', [
    A('Ach. Dann kennen Sie die Kunst des Nicht-Sehens. Die Hauptsache in meinem Beruf.', 'freude'),
    A('Ich habe in vierzig Jahren zweitausend Dinge nicht gesehen. Darauf bin ich stolz. Auf manche mehr als auf andere.'),
  ], { choices: Z }),
];

const M: Menue = { zeile: A('Sonst noch etwas? Ich habe eine Tür zu bewachen, und sie wird ungeduldig.'), choices, nodes };

const T = {
  // Akt-1-Sätze aus npc-welt/portier-albert.ts (gleiche IDs).
  oberstadt: einSatz('albert-tag-oberstadt', [
    A('Oh. Verzeihung. Ich habe Sie nicht erkannt, in diesem … Aufzug. Darf ich Ihnen den Dienstboteneingang zeigen? Er ist diskreter. Für alle.'),
  ]),
  runde: einSatz('albert-tag-runde', [
    erz('Ein älterer Herr in Livree mit weißen Handschuhen und einer Taschenlampe, die er hält wie einen Kerzenleuchter. Er bleibt stehen. Er schnuppert.'),
    A('Sie stehen nicht auf meiner Liste. Niemand, der nicht auf meiner Liste steht, steht um diese Uhrzeit in diesem Flur. Also stehen Sie hier nicht.'),
    A('Ich drehe mich jetzt um und zähle bis zehn. Wenn ich mich wieder umdrehe, habe ich mich geirrt. Eins.'),
  ]),
  erstes: gespraech('albert-tag-erstes', [
    erz('Vor dem Chrome Tower, in einer Loge aus Messing und Glas: ein älterer Herr in Livree, weiße Handschuhe, ein Schnurrbart, der vermutlich eigene Personalakten hat.'),
    A('Albert. Portier. Seit vierzig Jahren. Sie riechen nach Unterstadt, aber Sie stehen gerade. Das ist mehr, als die meisten Besucher schaffen.'),
  ], M),
  loge: gespraech('albert-tag-loge', [
    A('Guten Tag. Sie wieder. Ich habe Ihren Namen auf meine Liste geschrieben. Mit Bleistift. Bleistift ist ein Zeichen von Hoffnung.'),
  ], M),
  morgen: gespraech('albert-tag-morgen', [
    erz('Albert poliert die Messingklinke der Turmtür. Sie glänzt schon. Er poliert trotzdem.'),
    A('Morgens ist die Klinke am ehrlichsten. Da hat sie noch keiner angefasst, der etwas will.'),
  ], M),
  pudel: gespraech('albert-tag-pudel', [
    A('Haben Sie ihn? Nein. Ich sehe es an Ihren Händen. Keine Federn, keine Kratzer, kein Pudel.', 'besorgt'),
    A('Die Drohne ist Richtung Glasarkaden geflogen. Er folgt ihr. Er folgt immer allem, was blinkt. Ein Familienzug.'),
  ], M),
  dankbar: gespraech('albert-tag-dankbar', [
    erz('Bijou liegt zu Alberts Füßen in der Loge und kaut auf einer Schraube. Albert tut so, als sähe er es nicht. Er sieht es.'),
    A('Sie schon wieder. Der Hund mag Sie. Ich habe beschlossen, das als Referenz gelten zu lassen.', 'freude'),
  ], M),
  vertraut: gespraech('albert-tag-vertraut', [
    A('Ah. Die Person mit dem Handschuh-Gedächtnis. Treten Sie näher. Nicht zu nah. Ein Portier hat einen Radius.', 'freude'),
  ], M),
  epilog: gespraech('albert-tag-epilog', [
    erz('Die Turmtür steht offen. Albert steht trotzdem davor. Gewohnheit ist das Einzige, was nach der Party übrig geblieben ist.'),
    A('Herr Blade ist nicht mehr da. Die Tür ist jetzt offen. Ich weiß nicht, ob ich das gut finde. Ich weiß, dass ich es nicht schlecht finde.'),
  ], M),
  rivale: dialog('albert-tag-rivale', [knoten('start', [
    A('Sie stehen auf einer anderen Liste. Mit Tinte. Ich bitte Sie, den Gehweg nicht weiter abzunutzen.', 'wut'),
  ])]),
};

/** ♥2 (Portierloge, morgens, Akt 2): Albert bringt dir Etikette bei. akt-etikette mit Weg ohne Spiel. */
const he2 = dialog('he-portier-albert-2', [
  knoten('start', [
    erz('Morgens vor dem Chrome Tower. Albert hat auf dem Messingpult der Loge eine weiße Serviette ausgebreitet. Darauf: sieben Gabeln, vier Löffel und eine Zange.'),
    A('Sie werden früher oder später da oben Tee trinken. Alle tun das irgendwann. Die meisten blamieren sich. Ich möchte nicht, dass Sie zu den meisten gehören.'),
    A('Die Zange ist für Zucker. Nicht für Hummer. Nicht für Gegner. Fangen wir an.'),
  ], {
    choices: [
      {
        text: 'Mitmachen. Gabel für Gabel.',
        effects: [{
          minigame: 'akt-etikette', level: 1, key: 'albert-etikette-uebung', label: 'Etikette-Stunde bei Albert',
          win: [{ dialogue: 'he-portier-albert-2-gut' }, herz(ID, 20)],
          lose: [{ dialogue: 'he-portier-albert-2-fauxpas' }],
        }],
      },
      {
        text: '„Von außen nach innen. Gabel links, Messer rechts, und nie über den Tisch greifen.“', tag: '[Ausstrahlung 4]',
        check: pruefung('he-portier-albert-2-regeln', 'ausstrahlung', 4, ['haltung']), next: 'regeln', effects: [herz(ID, 40)],
      },
      { text: '„Albert. Ich ess mit den Fingern. Das wird nichts mehr.“', next: 'finger', effects: [herz(ID, 25)] },
    ],
  }),
  knoten('regeln', [
    A('Von außen nach innen. Sie haben das gelernt. Oder gelesen. Beides ist besser als geraten.', 'ueberrascht'),
    A('Dann nur noch eine Sache: Wenn Fräulein Sybella Ihnen Milch anbietet, lehnen Sie ab. Die Milch ist ein Test.'),
  ], { next: 'ende' }),
  knoten('finger', [
    A('Mit den Fingern.'),
    erz('Er zieht einen Handschuh aus. Seine Hand ist alt, sehr sauber und hat eine Narbe quer über den Rücken.'),
    A('Das war 2051. Ein Hummer. Ein Botschafter. Ein Missverständnis. Seitdem esse ich auch mit den Fingern, wenn keiner hinsieht. Lassen Sie es uns trotzdem versuchen.'),
  ], { next: 'ende' }),
  knoten('ende', [
    A('Für heute genug. Sie dürfen die Serviette behalten. Nein, dürfen Sie nicht. Aber ich sehe nicht hin.'),
  ], { effects: [flag('albert_etikette_geuebt'), xp(40)] }),
]);

const he2Gut = dialog('he-portier-albert-2-gut', [knoten('start', [
  A('Keine Gabel verwechselt. Den Zucker mit der Zange. Kein Finger abgespreizt, der nicht abgespreizt gehört.', 'freude'),
  A('Wenn ich noch Kinder hätte, wären Sie jetzt eins. Sagen Sie es niemandem.'),
], { effects: [flag('albert_etikette_geuebt'), xp(60)] })]);

const he2Fauxpas = dialog('he-portier-albert-2-fauxpas', [knoten('start', [
  erz('Der Zuckerwürfel liegt auf dem Gehweg. Die Zange steckt im Blumenkübel. Ein Passant applaudiert ironisch.'),
  A('Nun. Das war ein Fauxpas. Ein ehrlicher. Die ehrlichen sind die schlimmsten, aber die einzigen, aus denen man lernt.'),
], { effects: [flag('albert_etikette_geuebt'), xp(30)] })]);

/** ♥4 (Portierloge, abends, Akt 2): Albert zeigt seine Sammlung verlorener Handschuhe; danach lässt er dich rein. */
const he4 = dialog('he-portier-albert-4', [
  knoten('start', [
    erz('Abend. Albert hat eine Schublade unter dem Pult aufgezogen. Darin, sorgfältig gefaltet und beschriftet: Handschuhe. Dutzende. Seide, Leder, Spitze, ein einzelner Boxhandschuh.'),
    A('Verlorene Handschuhe. Vierzig Jahre. Jeder hat einen Zettel: wer, wann, welche Hand. Keiner ist je abgeholt worden.'),
    A('Die Menschen hier oben verlieren Handschuhe wie andere Leute Kleingeld. Sie merken es nicht einmal. Ich merke es.', 'trauer'),
  ], {
    choices: [
      { text: '„Welcher ist dein liebster?“', next: 'liebster', effects: [herz(ID, 50)] },
      {
        text: 'Einen Zettel lesen und den Besitzer erraten. „Die Spitze da. Serenity, mit sechzehn, linke Hand.“', tag: '[Straße 5]',
        check: pruefung('he-portier-albert-4-raten', 'strasse', 5, ['durchschauen']), next: 'geraten', effects: [herz(ID, 60)],
      },
      { text: '„Die könnte man auf dem Schrottmarkt für ein Vermögen verkaufen.“', next: 'verkaufen', effects: [herz(ID, 15)] },
    ],
  }),
  knoten('liebster', [
    erz('Er zieht einen kleinen, fleckigen Kinderhandschuh hervor. Grün. Erde in den Nähten.'),
    A('Fräulein Serenity, mit sechs. Sie hat ihn im Blumenbeet vor der Tür vergraben, „damit er wächst“. Ich habe ihn wieder ausgegraben. Ich habe ihr nie gesagt, dass er nicht gewachsen ist.'),
  ], { next: 'ende' }),
  knoten('geraten', [
    A('Fräulein Serenity, sechzehn, linke Hand, nach ihrem ersten Ball.', 'ueberrascht'),
    A('Sie haben die Erde in den Nähten gesehen. Das sieht sonst nur sie. Und ich.'),
  ], { next: 'ende' }),
  knoten('verkaufen', [
    A('Für ein Vermögen. Ja. Und dann hätte ich ein Vermögen und keine Handschuhe. Ich habe schon ein Vermögen. Es heißt Pension, und es ist sehr klein.'),
    A('Nein. Die bleiben. Irgendwann holt sie einer ab. Und dann bin ich da.'),
  ], { next: 'ende' }),
  knoten('ende', [
    erz('Er schiebt die Schublade zu. Langsam. Dann holt er einen Bleistift heraus und schreibt etwas auf seine Liste.'),
    A('Ich habe Sie auf die Liste gesetzt. Die richtige. Wenn Sie hinauf wollen, öffne ich. Nicht für Herrn Blade. Für Sie.'),
    ich('Danke, Albert.'),
    A('Danken Sie mir nicht. Verlieren Sie einfach nie einen Handschuh. Ich habe keinen Platz mehr.'),
  ], { effects: [flag('albert_laesst_rein'), meldung('Albert lässt dich jetzt ins Chrome-Penthouse.'), xp(80)] }),
]);

const albert = weltfigur({
  id: ID,
  name: 'Portier Albert',
  unknownName: 'Herr in Livree',
  faction: 'chrome-haus',
  bio: 'Portier am Chrome Tower, seit vierzig Jahren im Dienst der Familie Chrome. Livree, weiße Handschuhe, Etikette als Waffe. Sammelt verlorene Handschuhe. Blade nennt ihn seit elf Jahren „Alfred“.',
  gifts: geschenke({
    loves: ['samtfliege', 'goldknauf-replik', 'zeitung-papier'],
    likes: ['kraeuter-gebaeck', 'taschenspiegel-gold', 'edelbrause'],
    dislikes: ['chips-tuete', 'glitzerschrott'],
    hates: ['kanalschlamm', 'rostige-schraube'],
  }),
  schedule: [
    ort('N', 'chrome-penthouse', 'portier-runde', { when: EINBRUCH }),
    ort('M,T,A', 'chrome-boulevard', 'portierloge'),
    weg(),
  ],
  heartEvents: [
    { id: 'he-portier-albert-2', hearts: 2, map: 'chrome-boulevard', time: 'morgen', when: alle(AKT2, { notFlag: 'epilog' }), dialogue: 'he-portier-albert-2' },
    { id: 'he-portier-albert-4', hearts: 4, map: 'chrome-boulevard', time: 'abend', when: alle(AKT2, gesehen('he-portier-albert-2')), dialogue: 'he-portier-albert-4' },
  ],
  talk: [
    rede('albert-tag-rivale', rivale(ID)),
    rede('albert-tag-runde', { time: 'nacht' }),
    rede('albert-tag-epilog', EPILOG),
    rede('albert-tag-pudel', PUDEL_LAEUFT),
    rede('albert-tag-oberstadt', alle(nichtGetroffen(ID), { origin: 'origin-oberstadt' })),
    rede('albert-tag-erstes', nichtGetroffen(ID)),
    rede('albert-tag-dankbar', PUDEL_DONE),
    rede('albert-tag-vertraut', undefined, 4),
    rede('albert-tag-morgen', { time: 'morgen' }),
    rede('albert-tag-loge'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: albert },
  dialogues: sammle(
    T.oberstadt, T.runde, T.erstes, T.loge, T.morgen, T.pudel, T.dankbar, T.vertraut, T.epilog, T.rivale,
    he2, he2Gut, he2Fauxpas, he4,
  ),
};
