// side-chrome-pudel · „Bijou ist weg“ (world.md §6.3 Nr. 40). Portier Albert, chrome-boulevard, tagsüber, Akt 2.
// Roboterpudel Bijou folgt einer Werbedrohne (Hologramm-Knochen) durch drei Zonen in die Unterstadt:
// Glasarkaden-Springbrunnen → Stufenplatz-Windkante → Neon-Gasse (Gassenmitte; dort ist der Drohnen-Akku leer).
// Spots und Spur-Flags wie Bijous Tagesablauf in act23.json (bijou_spur_1..3). An jeder Sichtung:
//   gc-129 [Reflexe 6] einfangen · leckerli-schraube · Bolzen spielt mit ihm · Werbedrohne hacken [Technik 5] (Drohne fliegt
//   heim, Bijou hinterher) · Vex mit dachlaeuferin kürzt über die Dächer ab · sonst entwischt er zur nächsten Zone.
//   In der Neon-Gasse gibt es zusätzlich den Weg ohne alles: hinsetzen und warten, bis er von selbst kommt.
// Zurück zu Albert (Portierloge), Seraphina kommt dazu. Belohnung 180 XP, 400 Cr, chrome-haus +15, Seraphina ♥ +40.
import type { ContentPart } from '../../part';
import type { CutsceneDef, DialogueChoice, DialogueDef, Effect, NewsDef, QuestDef } from '../../../modules/contracts';
import {
  ACT2, VEX, WACH, active, all, any, bild, ch, chk, companion, dlg, flag, herz, inactive, item, l, msg, n, node, noFlag, not, p,
  set,
} from './_lib';

const Q = 'side-chrome-pudel';
const AL = 'portier-albert';
const SE = 'seraphina-chrome';
const BO = 'bolzen';

const SPUR1 = 'bijou_spur_1';
const SPUR2 = 'bijou_spur_2';
const SPUR3 = 'bijou_spur_3';
const GEFANGEN = 'bijou_gefangen';
const HEIMGEFLOGEN = 'bijou_drohne_gehackt';
const ABGEGEBEN = 'bijou_abgegeben';

/** Gefangen setzt alle Spur-Flags, damit Bijous Tagesablauf ihn wieder auf den Boulevard stellt. */
const FANG: Effect[] = [set(SPUR1), set(SPUR2), set(SPUR3), set(GEFANGEN)];
const DROHNE_HACKEN = chk('pudel-werbedrohne-hacken', 'technik', 5, ['hacken', 'drohne']);

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: 'Bijou ist weg',
  summary: 'Bijou, der Roboterpudel der Chrome-Schwestern, ist einer Werbedrohne hinterher in die Unterstadt abgehauen. Portier Albert ist der Verzweiflung nahe. Höflich nahe.',
  giver: AL,
  act: 2,
  steps: [
    {
      id: 'glasarkaden', text: 'Folge der Werbedrohne: Bijou wurde zuletzt am Springbrunnen der Glasarkaden gesehen.',
      done: any(flag(SPUR1), flag(GEFANGEN)), marker: { map: 'glasarkaden', at: 'springbrunnen' },
    },
    {
      id: 'stufenplatz', text: 'Bijou ist der Drohne zum Stufenplatz gefolgt. Er steht an der Windkante. Natürlich an der Windkante.',
      when: flag(SPUR1), done: any(flag(SPUR2), flag(GEFANGEN)), marker: { map: 'stufenplatz', at: 'windkante' },
    },
    {
      id: 'neon-gasse', text: 'Die Drohne ist in die Neon-Gasse abgestürzt. Bijou bewacht sie. Schnapp ihn dir.',
      when: flag(SPUR2), done: flag(GEFANGEN), marker: { map: 'neon-gasse', at: 'gassenmitte' },
    },
    {
      id: 'zurueck', text: 'Bring Bijou zu Portier Albert in die Portierloge am Chrome-Boulevard (morgens bis abends).',
      when: flag(GEFANGEN), done: flag(ABGEGEBEN), marker: { map: 'chrome-boulevard', at: 'portierloge' },
    },
  ],
  reward: { xp: 180, credits: 400, rep: { 'chrome-haus': 15 }, relations: { [SE]: 40 } },
};

// ---------------------------------------------------------------------------------------------- Auftakt

const start: DialogueDef = dlg('pudel-albert-start', [
  node('start', [
    n('Portier Albert steht vor seiner Loge, die weißen Handschuhe so fest ineinander verkrallt, dass die Nähte knirschen. Er hält eine leere Leine. Am Ende der Leine: ein Halsband mit Herz. Ohne Hund.'),
    l(AL, 'Verzeihen Sie. Ich bin sonst nicht so. Ich bin sonst gar nicht. Das ist der Sinn eines Portiers.', 'besorgt'),
    l(AL, 'Bijou ist fort. Der Pudel der gnädigen Damen. Chrom, Federlocken, ein Stammbaum länger als Ihre Straße. Er hat eine Werbedrohne gesehen. Mit einem Knochen-Hologramm. Und dann hat er das getan, was Hunde ohne Erziehung tun.', 'besorgt'),
  ], {
    choices: [
      ch('„Er ist abgehauen.“', 'weg'),
      ch('„Ein Hund aus Chrom, der einem Werbeknochen hinterherrennt. Die Oberstadt in einem Satz.“', 'spott'),
      ch('„Nicht mein Köter, nicht mein Problem.“', 'nein'),
    ],
  }),
  node('spott', [
    l(AL, 'Ich würde Ihnen widersprechen, wenn ich nicht in der Livree stünde. In der Livree widerspreche ich niemandem. Ich warte, bis man von selbst merkt, dass man unrecht hat.', 'neutral'),
  ], { next: 'weg' }),
  node('weg', [
    l(AL, 'Er ist der Drohne über die Brüstung gefolgt. Den Lastenaufzug hinunter. In die … Mittelschicht.', 'besorgt'),
    l(AL, 'Wenn Madame Seraphina erfährt, dass Bijou durch die Glasarkaden streunt, wird sie mich nicht entlassen. Das wäre ja ein Gefühl. Sie wird mich einfach nicht mehr ansehen. Vierzig Jahre Dienst, und dann ein Blick durch mich hindurch.', 'trauer'),
    l(AL, 'Die Drohne fliegt eine Werberoute. Glasarkaden, Stufenplatz, dann tiefer. Bitte. Bringen Sie ihn mir zurück, bevor er etwas … Unterstädtisches tut. Sich wälzen. Bellen. Glücklich sein.', 'besorgt'),
  ], {
    choices: [
      ch('„Ich hol ihn dir. Was springt raus?“', 'lohn', { effects: [{ startQuest: Q }] }),
      ch('„Ich hol ihn dir. Atme mal, Albert.“', 'atmen', { effects: [{ startQuest: Q }, herz(AL, 20)] }),
      ch('„Ich überleg’s mir.“'),
    ],
  }),
  node('lohn', [
    l(AL, 'Vierhundert Credits aus meiner Portokasse, die ich gleich darauf als „Gartenpflege“ verbuche. Und die Dankbarkeit des Hauses Chrome, die man nicht ausgeben kann, die aber sehr gut aussieht.', 'neutral'),
  ], { next: 'tipp' }),
  node('atmen', [
    n('Albert atmet. Einmal. Es klingt, als hätte er es seit 2062 nicht getan.'),
    l(AL, 'Danke. Das war … unerwartet freundlich. Ich werde es niemandem erzählen.', 'verlegen'),
  ], { next: 'tipp' }),
  node('tipp', [
    l(AL, 'Ein Rat, falls Sie ihn finden: Bijou liebt Schrauben-Leckerli. Und er hasst es, gejagt zu werden. Er rennt nur dann nicht weg, wenn er glaubt, es sei seine eigene Idee.', 'signatur'),
  ], {
    choices: [
      ch('„Vex fängt keine Pudel. Vex liefert Pakete. … Ist der Pudel ein Paket?“', 'vex', { when: VEX }),
      ch('Los.'),
    ],
  }),
  node('vex', [
    l(AL, 'Wenn es Ihnen hilft, betrachten Sie ihn als Expresssendung mit Federlocken. Zustellung an die Portierloge. Unterschrift bei mir.', 'neutral'),
    p('Nicht anhalten, nicht umdrehen. Und nicht vom Köter beißen lassen. Geht klar.', 'signatur'),
  ]),
  node('nein', [
    l(AL, 'Selbstverständlich. Verzeihen Sie die Belästigung. Ich werde dann … hier stehen. Und warten. Das kann ich am besten.', 'trauer'),
  ]),
]);

const mast: DialogueDef = dlg('pudel-werbemast', [
  node('start', [
    n('Der Werbedrohnen-Mast ist leer. Am Ladebügel blinkt eine Anzeige: „Route 7 – Oberstadt-Premium-Knochen. Nächster Halt: Glasarkaden, Springbrunnen. Danach: Stufenplatz. Danach: Zielgruppe erschließen.“'),
    p('Zielgruppe erschließen. Die Drohne fliegt in die Unterstadt, und der Pudel rennt hinterher. Werbung, die funktioniert. Gruselig.'),
  ]),
]);

// ---------------------------------------------------------------------------------------------- Sichtungen

/** Gemeinsame Fangwege an jeder Sichtung. */
function fangWege(ort: string): DialogueChoice[] {
  return [
    ch('Hechtsprung! Den Pudel aus der Luft pflücken.', 'reflexe', { check: 'gc-129', effects: FANG }),
    ch('Ein Schrauben-Leckerli hinhalten und nichts tun. Gar nichts. Er soll denken, es war seine Idee.', 'leckerli', {
      requires: item('leckerli-schraube'), effects: [{ take: 'leckerli-schraube' }, ...FANG],
    }),
    ch('„Bolzen. Spielen.“', 'bolzen', { tag: '[Bolzen]', when: companion(BO), effects: [...FANG, herz(BO, 10)] }),
    ch('Die Werbedrohne hacken und auf Heimflug schicken.', 'hack', { check: DROHNE_HACKEN, effects: [...FANG, set(HEIMGEFLOGEN)] }),
    ch('Über die Dächer abkürzen und ihm von oben in den Weg springen.', 'dach', {
      tag: '[Dachläuferin]', when: all(VEX, { perk: 'dachlaeuferin' }, flag(`pudel_dach_${ort}`)), effects: FANG,
    }),
  ];
}

const fangKnoten = [
  node('reflexe', [
    n('Du springst. Bijou springt auch, nur in die falsche Richtung: in deine Arme. Ihr landet zusammen auf dem Boden, er mit gespitzten Ohren, du mit dem Gesicht in Federlocken, die nach teurem Öl riechen.'),
    n('Er leckt dir über die Nase. Seine Zunge ist aus Silikon und erstaunlich warm.'),
    p('Hab dich, du verwöhnter Toaster.'),
  ], { next: 'gefangen' }),
  node('leckerli', [
    n('Du hockst dich hin, das Leckerli auf der flachen Hand, und schaust demonstrativ woanders hin. Bijou schaut die Drohne an. Dann das Leckerli. Dann die Drohne. Ein Kampf, den kein Hund gewinnt.'),
    n('Er trottet heran, nimmt das Leckerli mit spitzen Zähnen, und während er kaut, hast du schon die Leine am Halsband. Er hat nichts gemerkt. Er hält es für seine Idee.'),
  ], { next: 'gefangen' }),
  node('bolzen', [
    l(BO, 'WUFF! *Funkenschwanz-Wedeln*', 'freude'),
    n('Bolzen stürmt los, macht eine Verbeugung mit dem Hintern in der Luft, und Bijou vergisst die Drohne auf der Stelle. Zwei Roboterhunde jagen sich im Kreis, bis einer umfällt. Es ist der mit dem Stammbaum.'),
    n('Bijou liegt auf dem Rücken und lässt sich von Bolzen den Bauch abschnüffeln. Du klickst die Leine ein. Niemand protestiert.'),
  ], { next: 'gefangen' }),
  node('hack', [
    n('Du holst die Werbedrohne aufs Display: Route 7, Zielgruppe Unterstadt, Akku 12 %. Ein paar Zeilen umgeschrieben, und das Ding dreht ab: „Heimflug. Zielgruppe: Oberstadt. Grund: Akku.“'),
    n('Die Drohne steigt auf, der Knochen im Hologramm wackelt fröhlich, und Bijou trabt hinterher, Richtung Chrome-Boulevard. Er schaut sich nicht einmal nach dir um. Undankbarer Haufen Chrom.'),
    p('Der läuft jetzt allein nach Hause. Und ich lauf hinterher und sag, ich war’s. War ich ja auch.'),
  ]),
  node('dach', [
    n('Du kennst die Dächer. Zwei Sätze über ein Vordach, ein Hechtsprung über einen Lüftungsschacht, und du landest genau vor dem Pudel, in einer Wolke aus Taubendreck und Selbstbewusstsein.'),
    n('Bijou bleibt so abrupt stehen, dass seine Federlocken nach vorn kippen. Er sieht dich an wie einen Geist. Dann setzt er sich. Gutes Hündchen.'),
    p('Kurierregel eins: Wer schneller ist, hat recht.'),
  ], { next: 'gefangen' }),
  node('gefangen', [
    n('Bijou hängt unter deinem Arm wie ein sehr teurer Einkauf. Er knurrt leise, als die Drohne über ihm wegsurrt, und gibt dann auf. Sein Herz am Halsband blinkt rosa.'),
  ], { effects: [msg('Bijou eingefangen. Zurück zu Portier Albert.')] }),
];

const glasarkaden: DialogueDef = dlg('pudel-glasarkaden', [
  node('start', [
    n('Im Springbrunnen der Glasarkaden steht ein Pudel aus Chrom bis zu den Knien im Wasser und bellt die Spiegelung einer Werbedrohne an. Über ihm dreht sich ein goldener Hologramm-Knochen. Drei Touristen filmen. Einer weint vor Rührung.'),
    n('Bijou. Er hat dich noch nicht gesehen.'),
  ], {
    choices: [
      ...fangWege('glasarkaden'),
      ch('Ganz normal hingehen und „Bijou, komm!“ rufen.', 'flucht'),
      ch('Erst mal nur zusehen.'),
    ],
  }),
  ...fangKnoten,
  node('flucht', [
    n('Bijou dreht sich um, sieht dich, und sieht einen Menschen, der ihm etwas wegnehmen will. Er springt aus dem Brunnen, schüttelt sich über eine Dame in Pelz und rast der Drohne hinterher. Richtung Stufenplatz.'),
    l('narrator', 'Die Dame in Pelz schaut dich an. „Ist das Ihrer?“ – „Nein.“ – „Dann ist es ja gut.“'),
  ], { effects: [set(SPUR1), set('pudel_dach_stufenplatz'), msg('Bijou ist zum Stufenplatz entwischt.')] }),
]);

const stufenplatz: DialogueDef = dlg('pudel-stufenplatz', [
  node('start', [
    n('An der Windkante des Stufenplatzes steht Bijou auf der Brüstung, die Ohren im Wind, und starrt die Werbedrohne an, die zwei Meter vor ihm über dem Nichts schwebt. Darunter: dreißig Meter, dann Unterstadt.'),
    n('Er wackelt mit dem Hintern. Er überlegt, ob er springen soll. Er ist ein Pudel. Er wird springen.'),
  ], {
    choices: [
      ...fangWege('stufenplatz'),
      ch('„BIJOU! NEIN! SITZ!“', 'flucht'),
      ch('Erst mal nur zusehen.'),
    ],
  }),
  ...fangKnoten,
  node('flucht', [
    n('Bijou springt. Nicht in den Abgrund, zum Glück, sondern auf die Treppe, die Stufen hinunter, fünf auf einmal, und weg ist er. Die Drohne trudelt hinterher. Ihr Akku piept. Tiefer in die Stadt, Richtung Neon-Gasse.'),
    l('narrator', 'Ein Kameramann von NX-1 hat alles gefilmt. Er hebt den Daumen. Du hebst einen anderen Finger.'),
  ], { effects: [set(SPUR2), set('pudel_dach_neon-gasse'), msg('Bijou ist in die Neon-Gasse entwischt.')] }),
]);

const neonGasse: DialogueDef = dlg('pudel-neon-gasse', [
  node('start', [
    n('Mitten in der Neon-Gasse liegt die Werbedrohne in einer Pfütze, den Akku leer, der Hologramm-Knochen flackert nur noch als trauriges Strichmännchen. Davor sitzt Bijou wie ein Wachhund vor dem Schatz. Er knurrt jeden an, der näher als drei Meter kommt.'),
    n('Ein Betrunkener versucht es trotzdem. Bijou knurrt lauter. Der Betrunkene entschuldigt sich bei der Pfütze.'),
  ], {
    choices: [
      ...fangWege('neon-gasse'),
      ch('Dich drei Meter entfernt auf den Boden setzen. Warten. Ihn nicht anschauen.', 'warten', { effects: [{ advanceTime: 60 }, ...FANG] }),
      ch('Später wiederkommen.'),
    ],
  }),
  ...fangKnoten,
  node('warten', [
    n('Du sitzt. Die Neon-Gasse rauscht an dir vorbei: Lieferroller, ein Streit über Nudeln, irgendwo ein Lied. Bijou beobachtet dich. Du beobachtest das Pflaster.'),
    n('Nach einer Stunde merkt Bijou, dass eine tote Drohne kein Freund ist. Er steht auf, trottet zu dir, legt sich neben dein Bein und seufzt elektrisch. Er war einsam. Auch in der Oberstadt, wahrscheinlich.'),
    p('Ja, ich weiß, Kumpel. Ich weiß.'),
  ], { next: 'gefangen' }),
]);

// ---------------------------------------------------------------------------------------------- Rückgabe

const rueckgabe: DialogueDef = dlg('pudel-albert-rueckgabe', [
  node('start', [
    n('Albert sieht Bijou und vergisst für einen Moment, ein Portier zu sein. Er geht in die Knie, in der Livree, auf dem Marmor, und Bijou springt ihm an die Brust. Die weißen Handschuhe sind sofort grau.'),
    l(AL, 'Du ungezogener, verantwortungsloser, wunderbarer Blechhaufen.', 'freude'),
  ], { next: 'wie' }),
  node('wie', [
    l(AL, 'Wo war er? Nein. Sagen Sie es mir nicht. Ich will es nicht wissen. Ich sehe Neonstaub in seinen Locken. Ich rieche … Nudeln?', 'ueberrascht'),
  ], {
    choices: [
      ch('„Er kam von allein heim. Ich hab nur die Drohne umgeleitet.“', 'drohne', { when: flag(HEIMGEFLOGEN) }),
      ch('„Glasarkaden, Stufenplatz, Neon-Gasse. Er hat die Stadt gesehen. Die Stadt hat ihn gesehen.“', 'stadt', { when: noFlag(HEIMGEFLOGEN) }),
      ch('„Ein Gentleman schweigt.“', 'schweigen'),
    ],
  }),
  node('drohne', [
    l(AL, 'Er stand plötzlich auf der Pudelwiese, nass, stolz und mit einer Drohne über dem Kopf, als hätte er sie erlegt. Das waren Sie? Raffiniert. Unterstädtisch, aber raffiniert.', 'signatur'),
  ], { next: 'seraphina' }),
  node('stadt', [
    l(AL, 'Die Neon-Gasse. Bijou. In der Neon-Gasse. Ich werde das mit ins Grab nehmen. Und dort wird es mir peinlich sein.', 'verlegen'),
  ], { next: 'seraphina' }),
  node('schweigen', [
    l(AL, 'Ein Gentleman schweigt. Hm. Ich habe Sie unterschätzt. Das passiert mir sonst nur bei Weinjahrgängen.', 'neutral'),
  ], { next: 'seraphina' }),
  node('seraphina', [
    n('Hinter dir klackt ein Absatz auf Marmor. Einer, nicht zwei. Eine Frau in Blau, kühl wie ein Kühlschrank in einem Museum, steht in der Tür der Loge. Seraphina Chrome.'),
    l(SE, 'Albert. Warum ist mein Hund nass und warum riecht er nach Armut?', 'neutral'),
    l(AL, 'Ein … Spaziergang, Madame. Ein Bildungsspaziergang. Diese Person hat ihn begleitet.', 'besorgt'),
    n('Seraphina mustert dich. Von den Stiefeln bis zum Haar. Es dauert, und es fühlt sich an wie eine Steuerprüfung.'),
    l(SE, 'Sie haben ihn zurückgebracht, statt ihn zu verkaufen. In Ihrer Gehaltsklasse ist das entweder Dummheit oder Charakter. Ich bin mir nicht sicher, was mir lieber ist.', 'signatur'),
  ], {
    choices: [
      ch('„Charakter. Den kann man nicht kaufen. Nicht mal hier oben.“', 'charakter'),
      ch('„Dummheit. Ich hab den Schwarzmarktpreis nicht gekannt.“', 'dumm'),
      ch('„Ihr Hund mag die Unterstadt. Nur so als Hinweis.“', 'hinweis'),
    ],
  }),
  node('charakter', [
    l(SE, 'Man kann alles kaufen. Aber man muss nicht. Das ist der Unterschied zwischen Geld und Klasse. Ich werde mir Ihr Gesicht merken. Das ist ein Kompliment. Selten.', 'neutral'),
  ], { next: 'schluss' }),
  node('dumm', [
    l(SE, 'Dreißigtausend. Für den Fall, dass Sie es noch einmal versuchen wollen. Tun Sie es nicht.', 'signatur'),
    n('Ein Mundwinkel bewegt sich. Einen Millimeter. Bei Seraphina Chrome ist das ein Lachanfall.'),
  ], { next: 'schluss' }),
  node('hinweis', [
    l(SE, 'Er mag alles, was er nicht haben kann. Das hat er von meiner Schwester.', 'neutral'),
    n('Sie krault Bijou genau einmal hinter dem Ohr. Mit einem Finger. Er schmilzt.'),
  ], { next: 'schluss' }),
  node('schluss', [
    l(SE, 'Albert, zahlen Sie die Person. Aus meiner Kasse, nicht aus Ihrer. Ich weiß, wo Sie Ihre „Gartenpflege“ verbuchen.', 'neutral'),
    n('Sie geht. Albert schaut ihr nach und atmet zum zweiten Mal in diesem Jahrzehnt.'),
    l(AL, 'Vierhundert. Und, wenn ich das sagen darf: Sie sind auf meiner Liste. Auf der guten. Sie ist sehr kurz.', 'freude'),
  ], { effects: [set(ABGEGEBEN), herz(AL, 40), { cutscene: 'side-chrome-pudel-wiese' }] }),
]);

const wiese: CutsceneDef = {
  id: 'side-chrome-pudel-wiese',
  title: 'Bijou ist wieder da',
  gallery: false,
  beats: [
    bild('bg-chrome-boulevard', { pan: 'left', fade: 'in', caption: 'Am Abend liegt Bijou auf der Pudelwiese, frisch poliert, und träumt mit zuckenden Pfoten.', hold: 1600 }),
    bild('bg-chrome-boulevard', { pan: 'in', caption: 'Wer genau hinsieht, sieht in seinen Federlocken noch ein bisschen Neon. Albert hat es nicht herausgebürstet. Mit Absicht.', fade: 'out', hold: 1800 }),
  ],
};

// ---------------------------------------------------------------------------------------------- Nachricht

const news: NewsDef = {
  id: 'news-side-chrome-pudel',
  anchor: 'collin-charleston',
  headline: 'Pudel auf Abwegen',
  when: { quest: Q, state: 'done' },
  priority: 3,
  lines: [
    l('collin-charleston', 'Pudel in der Oberstadt gewinnt Schönheitswettbewerb zum zwölften Mal! Die Konkurrenz: weitere Pudel.', 'freude'),
    l('delya-delloraine', 'Pikant: Unser Kameramann hat denselben Pudel vor drei Tagen am Stufenplatz gefilmt. Kurz vor einer Flucht in die Neon-Gasse.', 'signatur'),
    l('collin-charleston', 'Ein Champion mit Vergangenheit! Ich liebe ihn. Ich will seine Frisur.', 'freude'),
  ],
};

// ---------------------------------------------------------------------------------------------- Karten

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: {
    [start.id]: start, [mast.id]: mast, [glasarkaden.id]: glasarkaden, [stufenplatz.id]: stufenplatz,
    [neonGasse.id]: neonGasse, [rueckgabe.id]: rueckgabe,
  },
  cutscenes: { [wiese.id]: wiese },
  news: { [news.id]: news },
  mapAdditions: {
    'chrome-boulevard': {
      hotspots: [
        {
          id: 'q-pudel-albert', at: 'portierloge', radius: 64, label: 'Portier Albert (ohne Hund)', kind: 'talk', dialogue: start.id,
          when: all(ACT2, inactive(Q), WACH),
        },
        {
          id: 'q-pudel-rueckgabe', at: 'portierloge', radius: 64, label: 'Bijou zu Albert bringen', kind: 'talk', dialogue: rueckgabe.id,
          when: all(active(Q), flag(GEFANGEN), noFlag(ABGEGEBEN), WACH),
        },
        {
          id: 'q-pudel-mast', at: 'werbedrohne-start', radius: 50, label: 'Leerer Werbedrohnen-Mast', kind: 'look', dialogue: mast.id,
          when: all(active(Q), not(flag(GEFANGEN))),
        },
      ],
    },
    glasarkaden: {
      hotspots: [{
        id: 'q-pudel-brunnen', at: 'springbrunnen', radius: 70, label: 'Bijou im Springbrunnen', kind: 'use', dialogue: glasarkaden.id,
        when: all(active(Q), noFlag(SPUR1), noFlag(GEFANGEN)),
      }],
    },
    stufenplatz: {
      hotspots: [{
        id: 'q-pudel-windkante', at: 'windkante', radius: 70, label: 'Bijou an der Windkante', kind: 'use', dialogue: stufenplatz.id,
        when: all(active(Q), flag(SPUR1), noFlag(SPUR2), noFlag(GEFANGEN)),
      }],
    },
    'neon-gasse': {
      hotspots: [{
        id: 'q-pudel-gasse', at: 'gassenmitte', radius: 70, label: 'Bijou bewacht die Drohne', kind: 'use', dialogue: neonGasse.id,
        when: all(active(Q), flag(SPUR2), noFlag(GEFANGEN)),
      }],
    },
  },
};
