// Bijou – Roboterpudel der Chrome-Schwestern (world.md §4.5, Zone chrome-boulevard = Akt 2, side-chrome-pudel).
// Volle Fassung; ersetzt npc-welt/bijou.ts (gleiche ID, bijou-tag-schlaf übernommen).
// Tagesablauf nach act23.json: während side-chrome-pudel an der jeweils nächsten Spur (bijou_spur_1..3, Hotspots baut
// der Quest-Teil), sonst tags auf der Pudelwiese, morgens/abends an der Portierloge, nachts auf dem Penthouse-Sofa.
// he-bijou-2 (Apportieren auf der Pudelwiese) und he-bijou-4 (Schraubenversteck). Kein rauer Ton: Bijou ist ein Hund.
import type { ContentPart } from '../../part';
import type { Condition } from '../../../modules/contracts';
import {
  AKT2, alle, dialog, einSatz, erz, flag, gesehen, geschenk, geschenke, herz, knoten, meldung, nicht, ort, pruefung,
  queststand, rede, rivale, sammle, sprecher, weltfigur, xp,
} from './_q';

const ID = 'bijou';
const AL = sprecher('portier-albert');

const PUDEL: Condition = queststand('side-chrome-pudel', 'active');
const EINBRUCH: Condition = queststand('side-alte-gewohnheiten', 'active');

const T = {
  // Akt-1-Satz aus npc-welt/bijou.ts (gleiche ID).
  schlaf: einSatz('bijou-tag-schlaf', [
    erz('Auf dem Samtsofa liegt ein Pudel aus poliertem Chrom, die Locken aus feinen Federn. Er schnarcht elektrisch. Bei jedem Atemzug blinkt ein kleines Herz auf seinem Halsband.'),
    erz('Ein Ohr zuckt. Bijou träumt. Vermutlich von Schrauben. Besser, er wacht nicht auf.'),
  ]),
  spur: einSatz('bijou-tag-spur', [
    erz('Bijou steht wie angewurzelt und starrt nach oben, wo eine Werbedrohne einen Hologramm-Knochen kreisen lässt. Sein Schwanz rotiert so schnell, dass er leise pfeift.'),
    erz('Er nimmt dich nicht wahr. Für ihn gibt es gerade nur den Knochen. Wer ihn einfangen will, muss es richtig anstellen.'),
  ]),
  wiese: dialog('bijou-tag-wiese', [knoten('start', [
    erz('Auf der Pudelwiese des Boulevards, einem Rasenstück, das jeden Morgen mit der Nagelschere geschnitten wird, jagt Bijou seinen eigenen Schatten. Er verliert. Er ist trotzdem glücklich.'),
  ], {
    choices: [
      { text: 'In die Hocke gehen und pfeifen.', next: 'pfeifen' },
      { text: 'Eine Schraube werfen.', when: { item: 'rostige-schraube' }, next: 'schraube', effects: [{ take: 'rostige-schraube' }, herz(ID, 20)] },
      { text: 'Weitergehen.' },
    ],
  }), knoten('pfeifen', [
    erz('Bijou kommt angeschossen, bremst zu spät und rutscht dir auf poliertem Chrom gegen die Schienbeine. Dann setzt er sich, ganz brav, und blinkt mit dem Halsband: ein Herz.'),
  ], { effects: [herz(ID, 5)] }), knoten('schraube', [
    erz('Die Schraube fliegt, Bijou fliegt hinterher. Er bringt sie nicht zurück. Er frisst sie. Mit einem Geräusch wie ein Mixer, der glücklich ist.'),
  ])]),
  loge: einSatz('bijou-tag-loge', [
    erz('Bijou liegt zu Füßen der Portierloge und lässt sich von Albert mit dem Staubwedel die Federlocken bürsten. Er brummt dabei wie ein kleiner Kühlschrank.'),
    AL('Er wird morgens gebürstet und abends gebürstet. Dazwischen macht er sich wieder schmutzig. Wir haben eine Abmachung.'),
  ]),
  vertraut: einSatz('bijou-tag-vertraut', [
    erz('Bijou erkennt dich von weitem. Er kommt angetrabt, legt dir eine angekaute Schraube vor die Füße und sieht dich erwartungsvoll an. Das Herz auf dem Halsband blinkt im Doppeltakt.'),
  ]),
  rivale: einSatz('bijou-tag-rivale', [
    erz('Bijou sieht dich, knurrt elektrisch und versteckt sich hinter dem Blumenkübel. Ein Pudel aus Chrom hinter Begonien. Es ist würdelos. Für euch beide.'),
  ]),
};

/** ♥2 (Pudelwiese, tags, Akt 2): Apportieren. [Reflexe 4] oder einfach mitlaufen. */
const he2 = dialog('he-bijou-2', [
  knoten('start', [
    erz('Bijou steht vor dir auf der Pudelwiese, einen Gummiknochen im Maul, der aussieht, als hätte er schon drei Kriege überstanden. Er lässt ihn fallen. Er sieht dich an. Er sieht den Knochen an. Er sieht dich an.'),
  ], {
    choices: [
      {
        text: 'Werfen, hinterhersprinten und ihn vor Bijou fangen.', tag: '[Reflexe 4]',
        check: pruefung('he-bijou-2-fangen', 'reflexe', 4, ['fangen']), next: 'gefangen', effects: [herz(ID, 50)],
      },
      { text: 'Werfen und zuschauen.', next: 'zuschauen', effects: [herz(ID, 40)] },
      { text: 'Den Knochen nehmen und so tun, als hättest du ihn geworfen.', next: 'trick', effects: [herz(ID, 25)] },
    ],
  }),
  knoten('gefangen', [
    erz('Du hechtest. Bijou hechtet. Ihr landet beide im frisch geschnittenen Rasen, du mit dem Knochen in der Hand, Bijou mit dem Knochen im Maul, weil er ihn dir sofort wieder abnimmt. Er wedelt. Es war offenbar ein Unentschieden.'),
  ], { next: 'ende' }),
  knoten('zuschauen', [
    erz('Der Knochen fliegt in hohem Bogen. Bijou fliegt hinterher, mit allen vier Beinen gleichzeitig in der Luft, und landet in einem Springbrunnen. Er taucht wieder auf. Er hat den Knochen. Er hat auch einen Goldfisch.'),
    erz('Er spuckt den Goldfisch zurück ins Wasser. Gentleman.'),
  ], { next: 'ende' }),
  knoten('trick', [
    erz('Bijou rast los, sucht, sucht, kommt zurück und starrt auf deine Hand. Das Herz am Halsband blinkt rot. Dann gelb. Dann wieder rot. Er ist beleidigt. Und er verzeiht dir trotzdem, sobald du wirklich wirfst.'),
  ], { next: 'ende' }),
  knoten('ende', [
    erz('Danach legt er sich auf deine Füße. Er wiegt so viel wie ein kleiner Kühlschrank. Du kannst dich eine Weile nicht bewegen. Es ist in Ordnung.'),
  ], { effects: [flag('bijou_apportiert'), xp(30)] }),
]);

/** ♥4 (Pudelwiese, tags, nach ♥2): Bijou zeigt dir sein Schraubenversteck. */
const he4 = dialog('he-bijou-4', [
  knoten('start', [
    erz('Bijou zupft dich am Hosenbein. Er zieht dich quer über die Wiese zu einem Blumenkübel, schaut sich um, als würde er gleich einen Staatsstreich anzetteln, und gräbt.'),
    erz('Unter den Begonien: ein Schatz. Schrauben, Muttern, ein Lippenstift von Sybella, eine Manschette von Blade und ein kleiner, silberner Schlüssel.'),
  ], {
    choices: [
      { text: 'Den Schlüssel nehmen.', next: 'schluessel' },
      { text: 'Bijou eine Schraube aus deiner Tasche dazulegen.', when: { item: 'rostige-schraube' }, next: 'beitrag', effects: [{ take: 'rostige-schraube' }, herz(ID, 20)] },
      { text: 'Alles wieder zuschaufeln. Das ist sein Geheimnis.', next: 'geheim' },
    ],
  }),
  knoten('schluessel', [
    erz('Bijou knurrt nicht. Er wedelt. Den Schlüssel will er offenbar loswerden. Auf dem Anhänger steht: „Musikdose S.“'),
    AL('Ach. Fräulein Serenitys Spieldose. Die sucht sie seit Jahren. Ich sage nicht, woher Sie das haben. Ich weiß es nicht. Ich sehe den Hund nicht. Ich sehe die Erde nicht.'),
  ], { next: 'ende', effects: [herz('serenity-chrome', 30), meldung('Serenity freut sich über ihren wiedergefundenen Spieldosenschlüssel.')] }),
  knoten('beitrag', [
    erz('Bijou betrachtet die Schraube lange. Dann schiebt er sie mit der Nase in die Mitte des Schatzes, genau neben Blades Manschette. Ein Ehrenplatz.'),
  ], { next: 'ende' }),
  knoten('geheim', [
    erz('Du schaufelst die Erde zurück. Bijou sieht dir zu und klopft am Ende mit der Pfote zweimal drauf. Abgemacht.'),
  ], { next: 'ende', effects: [herz(ID, 20)] }),
  knoten('ende', [
    erz('Als du gehst, folgt er dir bis zum Rand der Wiese. Dort bleibt er sitzen, weil Albert ruft. Er sieht dir nach, bis du um die Ecke bist.'),
  ], { effects: [flag('bijou_versteck'), geschenk('quietsche-mutter'), xp(40)] }),
]);

const bijou = weltfigur({
  id: ID,
  name: 'Bijou',
  unknownName: 'Chrompudel',
  faction: 'chrome-haus',
  bio: 'Roboterpudel der Chrome-Schwestern, poliertes Chrom, Federlocken, Herz am Halsband. Liebt Schrauben-Leckerli, hasst Waschmaschinen. Haut gern ab, vergräbt Schätze unter Begonien.',
  gifts: geschenke({
    loves: ['quietsche-mutter', 'rostige-schraube', 'teddyfell-buerste'],
    likes: ['oelkaennchen', 'murmelbeutel', 'plueschmoehre'],
    dislikes: ['seidentuch-rot', 'parfuem-ozon'],
    hates: ['waschpulver', 'magnet-stoerer'],
  }),
  schedule: [
    ort('*', 'glasarkaden', 'springbrunnen', { when: alle(PUDEL, { notFlag: 'bijou_spur_1' }) }),
    ort('*', 'stufenplatz', 'windkante', { when: alle(PUDEL, { notFlag: 'bijou_spur_2' }) }),
    ort('*', 'neon-gasse', 'gassenmitte', { when: alle(PUDEL, { notFlag: 'bijou_spur_3' }) }),
    ort('N', 'chrome-penthouse', 'sofa-bijou', { when: EINBRUCH }),
    ort('T', 'chrome-boulevard', 'pudelwiese'),
    ort('M,A', 'chrome-boulevard', 'portierloge'),
    ort('N', 'chrome-penthouse', 'sofa-bijou'),
  ],
  heartEvents: [
    { id: 'he-bijou-2', hearts: 2, map: 'chrome-boulevard', time: 'tag', when: alle(AKT2, nicht(PUDEL)), dialogue: 'he-bijou-2' },
    { id: 'he-bijou-4', hearts: 4, map: 'chrome-boulevard', time: 'tag', when: alle(AKT2, nicht(PUDEL), gesehen('he-bijou-2')), dialogue: 'he-bijou-4' },
  ],
  talk: [
    rede('bijou-tag-rivale', rivale(ID)),
    rede('bijou-tag-spur', alle(PUDEL, { not: { all: [{ flag: 'bijou_spur_1' }, { flag: 'bijou_spur_2' }, { flag: 'bijou_spur_3' }] } })),
    rede('bijou-tag-schlaf', { time: 'nacht' }),
    rede('bijou-tag-vertraut', undefined, 3),
    rede('bijou-tag-wiese', { time: 'tag' }),
    rede('bijou-tag-loge'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: bijou },
  dialogues: sammle(T.schlaf, T.spur, T.wiese, T.loge, T.vertraut, T.rivale, he2, he4),
};
