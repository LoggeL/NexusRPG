// Marla Sand in Akt 2, Akt 3 und im Nachspiel (world.md §4.4, §4.6, §4.7, act23.json he-marla-sand-8/10).
// Kein eigener Inhaltsteil: marla-sand.ts holt Menü-Ergänzung, Phasen, Tagesablauf, Fähigkeit und he-8/10 von hier.
// Romanze nur mit { romance: 'marla-sand' } (Kandidatin, derzeit nicht freigeschaltet): Geständnis ♥10 am Brunnen
// („Frag mich, wenn die Sterne rauskommen“), Kuss und Nacht mit Abblende am Lagerfeuer der Staubstraße, Morgen danach.
import type { ContentPart } from '../../part';
import type { AbilityDef, Condition, CutsceneDef, DialogueDef, ScheduleEntry, TalkDef } from '../../../modules/contracts';
import {
  type Menue, AKT2, AKT2_NUR, AKT3_NACHT, ARIA_GECHIPPT, COUNTDOWN_DONE, ENDE_3B, ENDE_MEER, ENDE_NEXUS, EPILOG_FREI, MASTER,
  NYRA_WEG, PARTY_VORB, abblende, alle, dialog, erz, flag, herz, knoten, nicht, phasen, pruefung, rede, sprecher,
} from './_lib';

const ID = 'marla-sand';
const M_ = sprecher(ID);
const ROM: Condition = { romance: ID };
const ZUSAMMEN: Condition = { flag: 'marla-sand_romanze_zusammen' };

// ---------------------------------------------------------------------------------------------- Fähigkeit

/** Nach ♥10 (marla_wasserstab): Marla findet Wasser, wo keins ist. */
export const WASSERADER: AbilityDef = {
  id: 'marla-wasserader', name: 'Wasserader',
  description: 'Marla schlägt den Wasserstab in den Boden. Irgendwo darunter gluckert es. Ein Verbündeter +14 LP und Geschützt.',
  kind: 'support', ap: 1, target: 'ally', range: 2, heal: 14, status: { id: 'geschuetzt', turns: 1 }, uses: 2,
};

// ---------------------------------------------------------------------------------------------- Menü (ab Akt 2)

export const MENUE_23: Menue = {
  choices: [
    {
      text: 'Wie steht’s draußen? Seit Quantum chippt, meine ich.', next: 'm23-draussen',
      when: alle(AKT2_NUR, { notFlag: 'marla_23_draussen' }), effects: [flag('marla_23_draussen'), herz(ID, 10)],
    },
    {
      text: 'Zeig mir, wie man den Wind liest.', tag: '[Wind]', next: 'm23-wind',
      when: alle(AKT2, { flag: 'marla_wind_gelesen' }, { notFlag: 'woche_marla_wind' }),
      effects: [flag('woche_marla_wind'), { checkBuff: { id: 'marla-windlesen', label: 'Den Wind im Ohr', value: 1, attribute: 'strasse', tags: ['sandsturm', 'beobachten'], forDays: 0, consumes: true } }],
    },
  ],
  nodes: [
    knoten('m23-draussen', [
      M_('Draußen chippt keiner. Draußen hat keiner Geld für Chips. Das ist das erste Mal, dass Armut sich wie Glück anfühlt.', 'signatur'),
      M_('Aber die Drohnen kommen bis zum Hof. Zählen unsere Ziegen. Eine hat Gustav gefragt, ob er „zufrieden“ ist. Gustav hat sie mit der Mistgabel gefragt, ob sie zufrieden ist.', 'freude'),
    ], { next: 'menue' }),
    knoten('m23-wind', [
      erz('Marla stellt sich neben dich, legt dir eine Hand zwischen die Schulterblätter und dreht dich langsam, bis der Wind dir genau ins linke Ohr pfeift.'),
      M_('Da. Spürst du’s? Das ist Westen. Der Westen lügt nie. Der Osten schon. Der Osten ist wie die Oberstadt.', 'zaertlich'),
    ], { next: 'menue' }),
  ],
};

// ---------------------------------------------------------------------------------------------- Herz-Ereignis 8

/** ♥8 (Staubstraße, Konvoi-Halt, tags Mo/Do, act2 nach ♥6): Eskorte durch das Staubfalken-Gebiet. */
const he8 = dialog('he-marla-sand-8', [
  knoten('start', [
    erz('Konvoi-Halt an der Staubstraße. Drei Karawanenwagen, zwölf Ziegen, ein Wassertank, der lauter gluckert als ein betrunkener Rostzahn. Marla zieht den Gurt fest und schiebt das Kopftuch über die Nase.'),
    M_('Wir müssen durch die Senke. Wasser zum Hof, Filter in die Stadt. Ohne die Ladung kommt Elsa nicht durch die Woche.', 'besorgt'),
    erz('Über den Dünen kreisen Schatten. Gleitschirme aus Planen, Rostklingen, Schutzbrillen. Die Staubfalken.'),
    M_('Wenn wir umdrehen, kommen wir ohne Ware heim. Wenn wir weiterfahren, kommen wir vielleicht gar nicht heim. Ich mag beide Möglichkeiten nicht.', 'besorgt'),
  ], {
    choices: [
      { text: '„Wir fahren. Ich halt sie dir vom Leib.“', next: 'kampf' },
      {
        text: '„Verhandeln. Jeder hat Durst, auch Plünderer.“', next: 'verhandeln',
        check: pruefung('he-marla-8-verhandeln', 'ausstrahlung', 6, ['verhandeln']), effects: [herz(ID, 60)],
      },
      {
        text: 'Den Konvoi durch die alten Pistenrinnen führen, wo kein Schirm landen kann.', next: 'rinnen',
        check: pruefung('he-marla-8-rinnen', 'strasse', 6, ['sandsturm', 'orientierung']), effects: [herz(ID, 60)],
      },
      { text: '„Wir zahlen Wegzoll. Zwei Kanister. Lieber durstig als tot.“', next: 'zoll', effects: [herz(ID, 40)] },
    ],
  }),
  knoten('verhandeln', [
    erz('Du gehst allein auf die Düne zu, die Hände oben, einen Kanister unterm Arm. Der Anführer der Staubfalken landet vor dir, Rostklinge auf der Schulter. Ihr redet über Wasser, über Quantum-Drohnen, die auch über ihre Lager fliegen, über Durst.'),
    M_('Wasser gegen Durchfahrt. Und sie haben sich bedankt. Du hast mit Staubfalken gefeilscht, und sie haben sich bedankt. Draußen nennen sie dich ab heute „die Zunge“. Gewöhn dich dran.', 'freude'),
  ], { next: 'ankunft' }),
  knoten('rinnen', [
    erz('Du kennst die Rinnen nicht. Aber du liest den Wind, wie Marla es dir gezeigt hat: Wo er pfeift, ist der Boden fest, wo er brummt, sackt er weg. Die Wagen schaukeln durch die Senke, unter den Schirmen hindurch, die keinen Landeplatz finden.'),
    M_('Du hast sie ausgefahren. Mit meinem eigenen Trick. Ich weiß nicht, ob ich stolz bin oder beleidigt. Stolz. Ich bin stolz.', 'freude'),
  ], { next: 'ankunft' }),
  knoten('zoll', [
    erz('Marla rollt zwei Kanister an den Straßenrand. Die Staubfalken landen, nehmen sie und salutieren mit den Klingen. Einer wirft euch dafür eine Schutzbrille zu. Sie ist zerkratzt, aber sie hält Sand ab.'),
    M_('Zwei Kanister. Das ist eine Woche Durst. Aber alle sind noch dran. Hände, Füße, Ziegen. Das ist die Rechnung, die zählt.', 'neutral'),
  ], { next: 'ankunft' }),
  knoten('ankunft', [
    erz('Gegen Abend taucht der Hof auf, die Solarsegel glitzern. Gustav winkt mit der Mistgabel. Die Ziegen rennen vor, als hätten sie den ganzen Weg allein geschafft.'),
    M_('Wenn wir ankommen, koch ich dir was, das nicht nach Konserve schmeckt. Hab ich dir versprochen. Ich halt das.', 'signatur'),
  ], { effects: [flag('marla_eskorte'), { xp: 160 }, { rep: 'aussiedler', delta: 5 }, { give: 'hofhonig' }] }),
  knoten('kampf', [
    M_('Dann fahren wir. Halt den Kopf unten und schieß nur auf das, was eine Klinge hat. Die Ziegen gehören zu uns.', 'wut'),
    erz('Die erste Rostklinge kracht in die Plane des Wagens. Dann fallen die Staubfalken vom Himmel wie schlechtes Wetter.'),
  ], {
    effects: [
      herz(ID, 60), flag('marla_eskorte'), { xp: 160 }, { rep: 'aussiedler', delta: 5 },
      // Nach dem Sieg kommt der Konvoi am Hof an (wie im Knoten „ankunft“).
      { battle: 'enc-oednis-staubfalken', win: [{ give: 'hofhonig' }] },
    ],
  }),
]);

// ---------------------------------------------------------------------------------------------- Herz-Ereignis 10

/** ♥10 (Aussiedlerhof, Brunnen, morgens, act2 nach ♥8): der dritte Brunnen, der Wasserstab, das Versprechen. */
const he10 = dialog('he-marla-sand-10', [
  knoten('start', [
    erz('Morgengrauen am Brunnen des Aussiedlerhofs. Nebel liegt über den Beeten, die Ziegenroboter schlafen im Stand. Marla hält einen Stab aus gebogenem Kupferdraht in der Hand, so vorsichtig, als könnte er weglaufen.'),
    M_('Mein Wasserstab. Mein Vater hat damit den ersten Brunnen gefunden. Ich den zweiten. Den dritten findest du. Heute.', 'zaertlich'),
    erz('Sie drückt ihn dir in die Hände. Er ist warm. Er zittert nicht. Noch nicht.'),
  ], {
    choices: [
      {
        text: 'Den Boden lesen: Pflanzen, Risse, wo der Tau zuerst trocknet.', next: 'gelesen',
        check: pruefung('he-marla-10-boden', 'strasse', 6, ['beobachten', 'spuren']), effects: [herz(ID, 40)],
      },
      {
        text: 'Den Stab mit einem Feuchtesensor aus Elsas Werkstatt koppeln.', next: 'sensor',
        check: pruefung('he-marla-10-sensor', 'technik', 5, ['basteln', 'reparieren']), effects: [herz(ID, 30)],
      },
      { text: 'Augen zu und dem Stab folgen.', next: 'blind', effects: [herz(ID, 40)] },
    ],
  }),
  knoten('gelesen', [
    erz('Hinter dem Zaun Ost steht ein Büschel Wüstenrose, grüner als die anderen. Der Tau hängt dort länger. Du gehst hin, und der Stab zieht nach unten, als hätte jemand an ihm gerissen.'),
    M_('Da. Genau da. Du hast nicht geraten. Du hast gelesen. Mein Vater hätte dich adoptiert. Und dann hättest du Ziegen melken müssen.', 'freude'),
  ], { next: 'wasser' }),
  knoten('sensor', [
    erz('Ein Draht, ein Lötpunkt, ein Piepen. Der Sensor schlägt aus, fünf Schritte hinter dem Ziegenstall. Marla schaut zwischen Stab und Display hin und her.'),
    M_('Mein Vater dreht sich gerade im Sand um. Aber das Ding hat recht. Das ist das Schlimmste daran.', 'signatur'),
  ], { next: 'wasser' }),
  knoten('blind', [
    erz('Du schließt die Augen. Läufst. Stolperst über eine Ziege, die sich das sehr verbittet. Läufst weiter. Rennst fast in die Wäscheleine. Und dann, mitten auf dem Hof, zuckt der Stab so heftig nach unten, dass du ihn fast fallen lässt.'),
    M_('Mitten auf dem Hof. Wo Elsa seit zwanzig Jahren ihre Hühner füttert. Natürlich. Das Wasser hat einen Sinn für Humor.', 'freude'),
  ], { next: 'wasser' }),
  knoten('wasser', [
    erz('Gustav bringt die Schaufel, Elsa den Bohrkopf, die Kinder ihr Geschrei. Am Mittag spritzt es. Klares, kaltes, echtes Wasser. Die Ziegen tanzen. Marla nicht. Sie steht nur da und weint, ohne das Gesicht zu verziehen.'),
    M_('Behalt ihn. Den Stab. Und wenn du je am Meer stehst und einen alten Mann mit Ziegenbart siehst, sag ihm, Marla hat nicht vergessen, wie es atmet.', 'zaertlich'),
  ], {
    effects: [{ give: 'marlas-wasserstab' }, flag('marla_wasserstab'), flag('marla_dritter_brunnen'), { xp: 200 }, { rep: 'aussiedler', delta: 10 }],
    choices: [
      { text: '„Ich sag es ihm. Versprochen.“', next: 'ende', effects: [herz(ID, 50)] },
      { text: '„Sag es ihm selbst. Komm mit.“', tag: '[Romanze]', when: ROM, next: 'romanze', effects: [herz(ID, 60)] },
    ],
  }),
  knoten('ende', [M_('Gut. Dann weiß ich, dass es jemand hört.', 'freude')]),
  knoten('romanze', [
    M_('Mitkommen. Ans Meer. Mit dir.', 'zaertlich'),
    erz('Sie lacht leise und lehnt die Stirn an deine Schulter. Der Wind dreht sich und bringt den Geruch von Regen, irgendwo weit weg.'),
    M_('Ich bin vierzig, ich hab Sand in jeder Falte und zwölf Ziegen, die mich lieben. Ich hab nicht gedacht, dass noch einer dazukommt. Und dann kommst du und liest den Wind.', 'verlegen'),
    M_('Frag mich nochmal, wenn die Sterne rauskommen. Am Feuer an der Staubstraße. Dann sag ich ja. Bis dahin tun wir so, als müssten wir noch überlegen.'),
  ], { effects: [flag('marla_sterne_frage')] }),
]);

// ---------------------------------------------------------------------------------------------- Romanze: Sterne

const sterne = dialog('marla-23-sterne', [
  knoten('start', [
    erz('Lagerfeuer an der Staubstraße. Der Himmel ist so voll mit Sternen, dass es fast laut ist. Marla sitzt allein am Feuer und hat zwei Becher hingestellt.'),
    M_('Die Sterne sind draußen. Alle. Ich hab nachgezählt.', 'zaertlich'),
  ], {
    choices: [
      { text: '„Kommst du mit ans Meer, Marla?“', next: 'ja', effects: [herz(ID, 40)] },
      { text: 'Sich neben sie setzen und nichts fragen.', next: 'still', effects: [herz(ID, 20)] },
    ],
  }),
  knoten('ja', [
    M_('Ja.', 'zaertlich'),
    erz('Sie küsst dich. Langsam, mit Sand auf den Lippen und Rauch im Haar. Irgendwo bei den singenden Masten pfeift der Wind ein Lied, das er sonst nur für Karawanen pfeift.'),
    M_('Das war jetzt kein Überlegen mehr.', 'freude'),
  ], {
    effects: [flag('marla-sand_romanze_zusammen'), flag('marla_romanze_kuss')],
    choices: [
      { text: '„Bleib heute Nacht bei mir.“', next: 'nacht' },
      { text: '„Lass uns einfach hier sitzen bleiben.“', next: 'sitzen' },
    ],
  }),
  knoten('still', [M_('Du fragst nicht. Gut. Dann frag ich nächste Nacht wieder, ob du fragst.', 'signatur')]),
  knoten('nacht', [M_('Der Wohnwagen hat ein Dachfenster. Man sieht die Sterne. Die Ziegen sehen nichts. Hab ich abgeklebt.', 'verlegen')], {
    effects: [flag('marla_nacht'), { cutscene: 'szene-marla-nacht' }], next: 'morgen',
  }),
  knoten('morgen', [
    erz('Morgen danach. Ziegengemecker, Kaffee aus Wüstenbohnen, Sand im Bett, der dort nichts verloren hat. Marla sitzt auf der Treppe des Wohnwagens und flicht sich das Haar, als wäre nichts. Dann lacht sie, als wäre doch was.'),
    M_('Gustav hat gefragt, warum ich singe. Ich hab gesagt, wegen dem Wetter. Er hat in den Himmel geguckt. Wolkenlos. Er ist nicht blöd, der Gustav.', 'freude'),
  ], { effects: [{ advanceTime: 480 }, herz(ID, 20), { checkBuff: { id: 'marla-morgen', label: 'Sand in den Haaren, Sonne im Kopf', value: 1, attribute: 'koerper', forDays: 0, consumes: false } }] }),
  knoten('sitzen', [
    erz('Ihr sitzt, bis das Feuer nur noch glimmt. Sie erzählt dir die Namen der Sterne, die ihr Vater erfunden hat. Einer heißt „Ziegenarsch“. Er ist sehr hell.'),
  ], { effects: [herz(ID, 20)] }),
]);

const cutscenes: CutsceneDef[] = [
  {
    id: 'szene-marla-nacht', title: 'Dachfenster',
    beats: [
      { image: 'black', fade: 'in', lines: [M_('Mach die Augen zu. Nein, warte. Mach sie auf. Guck nach oben. Da. Jetzt zu.', 'zaertlich')], hold: 1200 },
      abblende('Draußen pfeift der Wind von Westen. Der Westen lügt nie.'),
    ],
    gallery: false,
  },
];

// ---------------------------------------------------------------------------------------------- Phasen und Fahrplan

export function akt23(M: Menue): { dialogues: DialogueDef[]; talk: TalkDef[]; schedule: ScheduleEntry[]; teil: ContentPart } {
  const p = phasen(ID, 'marla-sand-23', M, [
    {
      id: 'master', when: MASTER, ohneMenue: true,
      gruss: [
        M_('Die Ödnis vergisst nicht, wer ihr den Himmel zugemacht hat.', 'wut'),
        erz('Sie dreht dir den Rücken zu und treibt die Ziegen in den Wagen. Keine einzige meckert. Sogar die Ziegen schweigen dich an.'),
      ],
    },
    {
      id: 'ende-3b', when: ENDE_3B, einmal: true,
      gruss: [
        M_('Du bist zurückgekommen. Durch den eigenen Sturm. Das schaffen nicht viele. Die meisten bleiben drin und nennen es Zuhause.', 'zaertlich'),
        M_('Der Konvoi zum Meer fährt Sonntag. Ich hab dir einen Platz freigehalten. Neben dem Wassertank. Der beste Platz. Gluckert beim Einschlafen.'),
      ],
    },
    {
      id: 'ende-nexus', when: ENDE_NEXUS, einmal: true,
      gruss: [
        M_('Die neue Stadt schickt Wasser raus. Kostenlos. Ich hab erst gedacht, das ist eine Falle. Dann hab ich’s getrunken. Es schmeckt nach nichts. Das ist bei Stadtwasser das größte Lob.', 'ueberrascht'),
        M_('Die Drohnen über dem Hof pflanzen jetzt Samen. Eine hat Gustav gefragt, ob er zufrieden ist. Er hat Ja gesagt. Ich hab ihn noch nie Ja sagen hören.'),
      ],
    },
    {
      id: 'ende-meer', when: ENDE_MEER, einmal: true, effects: [herz(ID, 30)],
      gruss: [
        M_('Ich hab ihn gefunden. Am Meer. Einen alten Mann mit Ziegenbart, der Muscheln sortiert und mit einer Krabbe redet. Er hat mich angeguckt und gesagt: „Du bist spät, Marla. Die Ziegen?“', 'trauer'),
        M_('Dann hat er geweint. Und ich auch. Und die Krabbe hat uns in die Zehen gezwickt. Danke, {name}. Du hast es ihm gesagt. Ich war nur dabei.', 'freude'),
      ],
    },
    {
      id: 'epilog-rom', when: alle(EPILOG_FREI, ZUSAMMEN), taeglich: true,
      gruss: [M_('Da bist du. Ich hab dir einen Becher hingestellt. Der steht da seit heute früh. Ich wusste, dass du kommst. Der Wind hat’s gesagt.', 'zaertlich')],
      plausch: [M_('Wenn die Sterne rauskommen, frag ich dich was. Nichts Großes. Nur, ob du bleibst. Du kannst schon mal üben, Ja zu sagen.', 'verlegen')],
    },
    {
      id: 'epilog', when: EPILOG_FREI, taeglich: true,
      gruss: [M_('Der Hof wächst. Drei Brunnen, ein Feld mehr, neue Leute aus der Stadt, die noch nie eine Ziege gemolken haben. Ich lach jeden Morgen. Dann helf ich ihnen.', 'freude')],
      plausch: [M_('Weißt du, was das Seltsamste ist? Ich plane. Für nächstes Jahr. Draußen plant keiner für nächstes Jahr. Draußen plant man bis zum nächsten Brunnen.', 'neutral')],
    },
    {
      id: 'akt3', when: AKT3_NACHT, einmal: true, effects: [{ give: 'hofhonig' }, { checkBuff: { id: 'marla-wind-akt3', label: 'Marlas Wind im Rücken', value: 1, attribute: 'reflexe', forDays: 0, consumes: true } }],
      gruss: [
        M_('Heute Nacht gehst du in den Turm. Ich sag dir, was ich jedem sage, der in einen Sturm geht: Augen zu, hör hin, und wenn es still wird, lauf.', 'besorgt'),
        M_('Und nimm den Honig. Wer mit süßem Mund kämpft, kämpft nicht so verbissen. Sagt meine Mutter. Die hat nie gekämpft. Aber sie hatte gute Zähne.'),
      ],
    },
    {
      id: 'akt3-nach', when: AKT3_NACHT,
      gruss: [M_('Lauf jetzt. Ich halt die Ziegen fest. Und die Daumen. Beides gleichzeitig ist schwer.', 'besorgt')],
    },
    {
      id: 'party', when: PARTY_VORB, taeglich: true,
      gruss: [M_('Eine Party im Turm. Ich war noch nie auf einer Party, bei der man nicht selbst das Feuer machen muss. Klingt verdächtig.', 'signatur')],
      plausch: [M_('Merk dir die Ausgänge. Alle. In der Ödnis stirbt keiner, der weiß, wo die Ausgänge sind. In Türmen wahrscheinlich auch nicht.', 'neutral')],
    },
    {
      id: 'gerettet', when: alle(COUNTDOWN_DONE, { notFlag: 'epilog' }), einmal: true,
      gruss: [M_('Ich hab gehört, ihr habt die Laute zurückgeholt. Die mit den Fäusten. Gut. Die Ödnis braucht Leute, die zurückhauen. Die Stadt auch.', 'freude')],
    },
    {
      id: 'nyra', when: NYRA_WEG, taeglich: true,
      gruss: [M_('Das Mädchen, das ihr zurücklassen musstet. Draußen sagen wir: Wer zurückbleibt, ist nicht verloren. Nur noch nicht abgeholt.', 'trauer')],
      plausch: [M_('Hol sie ab. Ich weiß, wie es ist, wenn man jemanden zurücklässt und sich jahrelang einredet, dass es richtig war.', 'trauer')],
    },
    {
      id: 'chip', when: ARIA_GECHIPPT, taeglich: true,
      gruss: [M_('Die Wilde aus deiner Crew. Die sie gechippt haben. Ich hab Gechippte gesehen, die sich nach Monaten erinnert haben. Am Geruch von Regen. An einem Lied. An einer Faust.', 'besorgt')],
      plausch: [M_('Gib nicht auf. Der Mensch ist wie ein Brunnen. Man muss manchmal nur tiefer graben.', 'zaertlich')],
    },
    {
      id: 'akt2', when: AKT2_NUR, taeglich: true,
      gruss: [M_('Na? Hast du Sand in den Stiefeln? Gut. Dann bist du richtig hier. Wer keinen Sand in den Stiefeln hat, ist nur zu Besuch.', 'freude')],
      plausch: [M_('Der Wasserpreis in der Stadt hat sich verdoppelt, seit Quantum „optimiert“. Draußen kostet’s, was es immer gekostet hat: einen Eimer und einen guten Rücken.', 'signatur')],
    },
  ]);

  // act23.json marla-sand „ersetzt“: Sa in der Stadt, sonst ab act2 Hof und Staubstraße.
  const schedule: ScheduleEntry[] = [
    { slot: 'tag', days: ['so'], when: ENDE_MEER, place: { map: 'das-meer', at: 'wagenplatz' } },
    { slot: ['morgen', 'tag'], days: ['sa'], place: { map: 'schrottmarkt', at: 'karawanenstand' } },
    { slot: 'abend', days: ['sa'], place: { map: 'high-voltage', at: 'oldie-ecke' } },
    { when: nicht(AKT2), place: 'away' },
    { slot: 'nacht', place: { map: 'staubstrasse', at: 'lagerfeuer' } },
    { slot: 'morgen', place: { map: 'aussiedlerhof', at: 'brunnen' } },
    { slot: 'tag', days: ['mo', 'do'], place: { map: 'staubstrasse', at: 'konvoi-halt' } },
    { slot: 'tag', place: { map: 'aussiedlerhof', at: 'marlas-wohnwagen' } },
    { slot: 'abend', place: { map: 'aussiedlerhof', at: 'lagerfeuer-hof' } },
  ];

  const talk: TalkDef[] = [
    rede('marla-23-sterne', alle(ROM, { flag: 'marla_sterne_frage' }, { notFlag: 'marla_romanze_kuss' }, { time: 'nacht' }, nicht(MASTER), { notFlag: 'heute_marla_sterne' })),
    ...p.talk,
  ];
  // „Still sitzen“ darf nicht jede Minute wiederkommen: einmal pro Nacht.
  sterne.nodes[0].effects = [flag('heute_marla_sterne')];

  return {
    dialogues: [...p.dialogues, he8, he10, sterne], talk, schedule,
    teil: { abilities: { [WASSERADER.id]: WASSERADER }, cutscenes: Object.fromEntries(cutscenes.map((c) => [c.id, c])) },
  };
}
