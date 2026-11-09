// side-weg-zum-meer · „Der Weg zum Meer“ (world.md §6.3 Nr. 35). Marla Sand, angestoßen durch Nyras Traum ·
// staubstrasse, glasduenen · T.
// Start: Marla am Wohnwagen (aussiedlerhof, T) oder samstags am Karawanenstand (schrottmarkt). Sie gibt eine Staubmaske,
// falls keine da ist; [Ödnis] startet mit einem Fragment.
// Schritte: vier kuestenkarte-fragment (Quellen außerhalb: he-marla-sand-4, he-opa-gustav-4, Digitech-Archiv gc-112,
// he-kaeptn-nebelhorn-4, he-nyra-4; hier zusätzlich ohne Check: Brösel 150 Cr, Rudis Pfannkuchen-Wette) → Karte in
// Rudis Diner zusammenlegen → Singende Masten (gc-92 [Straße 6], [Ödnis] automatisch, oder einen Tag warten, oder
// [Marla ♥6]) → Wegzoll der Staubfalken (gc-93 [Ausstrahlung 6], 300 Cr, Kampf enc-oednis-staubfalken, frei mit
// side-kraehes-ehre/side-oednis-frieden) → eingestürzte Brücke (Glasdünen: Seilwinde gc-94 / Hangeln gc-103, Hotspots
// in maps-23/glasduenen.ts) → von der Aussichtsdüne das Meer sehen (meer_von_duene_gesehen) → zurück zu Marla.
// Belohnung: 350 XP, muschel-frisch, meer-foto (nur wenn keins da), wagenweg_meer_bekannt.
import type { ContentPart } from '../../part';
import type { Condition, DialogueDef, QuestDef } from '../../../modules/contracts';
import {
  active, AKT2, all, any, byId, ch, COUNTDOWN, done, dlg, flag, hearts, herz, inactive, item, l, msg, n, noFlag, node,
  noItem, origin, phone, seen, set, won, zeit,
} from './_lib';

const Q = 'side-weg-zum-meer';
const M = 'marla-sand';
const FRAG = 'kuestenkarte-fragment';

const KARTE: Condition = flag('meer_karte_komplett');
const MASTEN: Condition = flag('meer_masten_durch');
const ZOLL: Condition = any(flag('meer_zoll_bezahlt'), won('enc-oednis-staubfalken'));
const BRUECKE: Condition = any(flag('glasduenen_bruecke_gespannt'), seen('aussicht-glasduenen'));
const MEER: Condition = any(flag('meer_von_duene_gesehen'), seen('aussicht-glasduenen'));
const FALKEN_FREUNDLICH: Condition = any(done('side-kraehes-ehre'), done('side-oednis-frieden'), flag('kraehe_geleit'));

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: 'Der Weg zum Meer',
  summary: 'Marla Sand kennt den Weg zum Meer. Fast. Ihr Vater ist dort geblieben, und die Karte liegt in vier Stücken über die ganze Stadt verteilt.',
  giver: M,
  act: 2,
  steps: [
    {
      id: 'fragmente', text: 'Sammle vier Küstenkarten-Fragmente. Wer in dieser Stadt hat ein Stück vom Meer in der Schublade?',
      done: any(item(FRAG, 4), KARTE),
    },
    {
      id: 'broesel', optional: true, text: 'Tipp: Staubbaron Brösel verkauft angeblich „echte Seekarten“ am Wasserstand der Staubstraße.',
      done: any(flag('meer_broesel_fragment'), KARTE), marker: { map: 'staubstrasse', at: 'broesel-wasserstand' },
    },
    {
      id: 'rudi', optional: true, text: 'Tipp: Rudi im Diner hat ein Kartenstück hinterm Tresen. Er rückt es nur für eine Wette raus.',
      done: any(flag('meer_rudi_fragment'), KARTE), marker: { map: 'rudis-diner', at: 'tresen-vorne' },
    },
    {
      id: 'karte', text: 'Leg die vier Stücke in Rudis Diner auf dem Verhandlungstisch zusammen.',
      when: item(FRAG, 4), done: KARTE, marker: { map: 'rudis-diner', at: 'verhandlungstisch' },
    },
    {
      id: 'masten', text: 'Durch die Singenden Masten an der Staubstraße. Der Sandsturm dort hat ein eigenes Lied.',
      when: KARTE, done: MASTEN, marker: { map: 'staubstrasse', at: 'singende-masten' },
    },
    {
      id: 'zoll', text: 'Die Staubfalken wollen Wegzoll an der Schranke: 300 Cr, eine Geschichte oder deine Schuhe.',
      when: MASTEN, done: ZOLL, marker: { map: 'staubstrasse', at: 'wegzoll-schranke' },
    },
    {
      id: 'bruecke', text: 'In den Glasdünen ist die Brücke eingestürzt. Seilwinde reparieren oder rüberhangeln.',
      when: ZOLL, done: BRUECKE, marker: { map: 'glasduenen', at: 'seilwinde' },
    },
    {
      id: 'meer', text: 'Steig auf die Aussichtsdüne. Von da sieht man es. Angeblich.',
      when: ZOLL, done: MEER, marker: { map: 'glasduenen', at: 'aussichtsduene' },
    },
    {
      id: 'marla', text: 'Erzähl Marla davon. Am Wohnwagen auf dem Aussiedlerhof (tagsüber) oder samstags am Karawanenstand.',
      when: all(ZOLL, MEER), done: flag('meer_abschluss'), marker: { map: 'aussiedlerhof', at: 'marlas-wohnwagen' },
    },
  ],
  reward: { xp: 350, items: { 'muschel-frisch': 1 }, relations: { [M]: 100 }, effects: [set('wagenweg_meer_bekannt')] },
};

// ---------------------------------------------------------------------------------------------- Marla: Auftakt

const auftakt: DialogueDef = dlg('wzm-marla-start', [
  node('start', [
    n('Marla sitzt auf den Stufen ihres Wohnwagens und flickt ein Segel. Der Wind spielt mit den Windspielen am Dach, und eines davon klingt wie eine Möwe, obwohl hier seit fünfzig Jahren keine mehr war.'),
    l(M, 'Die Kleine mit den Kabeln im Kopf. Nyra. Die hat mir mal erzählt, sie träumt jede Nacht vom Meer. Dass sie es noch nie gesehen hat. Nur auf Postkarten. Und die sind gelogen, sagt sie, die Farben sind zu blau.', 'besorgt'),
    l(M, 'Die Farben sind nicht zu blau. Die sind zu wenig blau. Das Meer ist blauer, als du dir das vorstellen kannst. Ich weiß das. Ich war da. Einmal.'),
    l(M, 'Und jetzt sitzt die Kleine bei Quantum im Keller und träumt da weiter. Und ich sitz hier und flick Segel. Das ist doch Scheiße.', 'wut'),
  ], {
    choices: [
      ch('„Dann zeig mir den Weg. Ich mach ein Foto. Für Nyra.“', 'zusage'),
      ch('„Ich hab gerade andere Sorgen.“'),
    ],
  }),
  node('zusage', [
    l(M, 'Den Weg. Ha. Den Weg kenn ich nur halb. Mein Vater hatte eine Karte. Seekarte, alt, aus der Zeit, als hier noch Boote gefahren sind. Er hat sie in vier Stücke gerissen und verteilt. „Damit keiner allein hinfährt“, hat er gesagt. Typisch.', 'signatur'),
    l(M, 'Eins hab ich. Eins hat ein alter Schrotthändler. Eins liegt irgendwo bei Digitech im Archiv, frag mich nicht, wie. Und eins ist mit der Flaschenpost gekommen. Zu einem Kapitän im Hafen, der nie zur See gefahren ist.'),
    l(M, 'Und wenn du die nicht kriegst: Brösel verkauft alles. Rudi wettet um alles. Einer von denen hat bestimmt was.'),
  ], { effects: [{ startQuest: Q }], next: 'maske' }),
  node('maske', [
    l(M, 'Und hinter der Staubstraße kommen die Glasdünen. Glasstaub. Der frisst dir die Lunge, wenn du ihn einatmest.'),
  ], {
    choices: [
      ch('Weiter.', 'maske-geben', { when: noItem('staubmaske') }),
      ch('„Ich hab eine Maske.“', 'oednis', { when: item('staubmaske') }),
    ],
  }),
  node('maske-geben', [
    l(M, 'Hier. Meine alte. Riecht nach Ziege. Ziege ist besser als Glas in der Lunge.', 'freude'),
  ], { effects: [{ give: 'staubmaske' }], next: 'oednis' }),
  node('oednis', [
    l(M, 'Und jetzt hau ab. Ich muss das Segel fertig kriegen, bevor der Wind dreht.'),
  ], {
    choices: [
      ch('„Warte. Ich hab auch so ein Stück. Von meinen Leuten.“', 'oednis-fragment', { tag: '[Ödnis]', when: origin('origin-oednis'), once: true, id: 'wzm-oednis' }),
      ch('Gehen.'),
    ],
  }),
  node('oednis-fragment', [
    n('Du ziehst es aus dem Futter deiner Jacke: ein Stück Seekarte, salzfleckig, mit einer Boje und dem Wort „SÜD“. Es war immer da. Du hast nie gefragt, warum.'),
    l(M, 'Ach du Scheiße. Das ist von seiner Karte. Von SEINER. Wo hast du das her? Nein. Sag nichts. Die Ödnis gibt manchmal Sachen zurück.', 'ueberrascht'),
  ], { effects: [{ give: FRAG }, herz(M, 30)] }),
]);

// ---------------------------------------------------------------------------------------------- Brösel und Rudi

const broesel: DialogueDef = dlg('wzm-broesel', [
  node('start', [
    l('staubbaron-broesel', 'Seekarte? Hab ich. Echte. Uralt. Mit Wasser drauf. Gezeichnetem Wasser. Hundertfünfzig.', 'signatur'),
    n('Er zieht ein Stück vergilbtes Papier aus einem Stapel, der hauptsächlich aus Comicheften und Rechnungen besteht. Eine Küstenlinie, eine Boje, ein Leuchtturm. Es sieht tatsächlich echt aus. Leider.'),
  ], {
    choices: [
      ch('150 Credits rüberschieben.', 'kauf', { effects: [{ credits: -150 }] }),
      ch('„Hundertfünfzig für einen Zettel? Du spinnst.“'),
    ],
  }),
  node('kauf', [
    l('staubbaron-broesel', 'Gute Wahl. Kein Umtausch. Keine Garantie. Kein Meer.', 'freude'),
  ], { effects: [{ give: FRAG }, set('meer_broesel_fragment')] }),
]);

const rudi: DialogueDef = dlg('wzm-rudi', [
  node('start', [
    l('rudi', 'Das Kartenstück? Das hängt seit zwanzig Jahren hinterm Tresen. Ein Fernfahrer hat damit seine Rechnung bezahlt. Er hat auch zwölf Pfannkuchen gegessen. Auf einmal.', 'signatur'),
    l('rudi', 'Wette: Du isst zwölf. Mit Sirup. Ohne aufzustehen. Dann gehört’s dir. Wenn nicht, zahlst du die Pfannkuchen. Und wischst den Boden.', 'freude'),
  ], {
    choices: [
      ch('„Her mit den Pfannkuchen.“', 'essen', { when: zeit('morgen', 'abend') }),
      ch('„Ich komm wieder, wenn ich Hunger hab.“'),
    ],
  }),
  node('essen', [
    n('Pfannkuchen eins bis vier: köstlich. Fünf bis acht: Arbeit. Neun: eine Nahtoderfahrung mit Ahornsirup. Zehn: Rudi zählt laut mit, und die Trucker in den Nischen klatschen im Takt. Elf: Du siehst deine Ahnen. Sie essen auch Pfannkuchen.'),
    n('Zwölf.'),
    l('rudi', 'Heiliger Diesel. Das hat seit dem Fernfahrer keiner mehr geschafft. Hier. Und geh langsam. Wirklich langsam.', 'ueberrascht'),
  ], { effects: [{ give: FRAG }, set('meer_rudi_fragment'), { advanceTime: 60 }, { heal: 'full' }, msg('Satt bis Donnerstag.')] }),
]);

// ---------------------------------------------------------------------------------------------- Karte zusammenlegen

const karte: DialogueDef = dlg('wzm-karte', [
  node('start', [
    n('Vier Stücke auf dem Verhandlungstisch zwischen Ketchupflasche und Serviettenhalter. Sie passen nicht sofort. Dann dreht Rudi eins um, ohne etwas zu sagen, und plötzlich ist da eine Küste.'),
    n('Die Staubstraße nach Westen, die Masten, die Schranke der Falken, die Glasdünen mit einer eingezeichneten Brücke. Und dahinter, in Bleistift, mit zitternder Hand: ein Strich. Darunter: „Hier ist es gut, Marla.“'),
    l('rudi', 'Ich hab die Karte zwanzig Jahre lang falsch rum aufgehängt. Ich glaub, ich brauch einen Schnaps.', 'besorgt'),
  ], { effects: [set('meer_karte_komplett'), msg('Die Küstenkarte ist komplett. Der Weg führt durch die Singenden Masten.')] }),
]);

// ---------------------------------------------------------------------------------------------- Singende Masten

const masten: DialogueDef = dlg('wzm-masten', [
  node('start', [
    n('Die Singenden Masten. Der Wind kommt in Böen, und die Blechdosen an den Funkmasten heulen einen Akkord, der dir die Zähne lockert. Dahinter: eine braune Wand. Sandsturm. Er kommt nicht näher. Er wartet.'),
  ], {
    choices: [
      ch('Hinhören. Welcher Mast heult zuerst? Von da kommt der Wind.', 'lesen', { check: 'gc-92' }),
      ch('Marlas Trick: Hand auf den Mast, Augen zu, dem Ton folgen.', 'marla', { tag: '[Marla ♥6]', requires: hearts(M, 6) }),
      ch('Warten, bis sich der Sturm legt. Morgen.', 'warten', { when: noFlag('meer_sturm_warten') }),
      ch('Umkehren.'),
    ],
  }),
  node('lesen', [
    n('Der dritte Mast von links heult einen Tick früher als die anderen. Dann der fünfte. Der Sturm dreht, und zwischen den Böen öffnet sich eine Gasse, schmal wie ein Flur. Du gehst durch, ohne zu rennen. Rennen ist, wie man im Sturm stirbt.'),
  ], { effects: [set('meer_masten_durch'), { xp: 40 }] }),
  node('marla', [
    n('Das Metall vibriert unter deiner Hand. Du hörst den Ton, dann den nächsten, dann siehst du ihn fast: einen Weg aus Lücken. Marla hat gesagt, die Masten erzählen, wer hier schon gegangen ist. Sie erzählen viel.'),
  ], { effects: [set('meer_masten_durch'), { xp: 40 }] }),
  node('warten', [
    n('Du setzt dich hinter einen Reifenstapel und wartest. Der Sturm singt. Irgendwann singst du mit. Das hilft nicht, aber es vertreibt die Zeit.'),
  ], { effects: [set('meer_sturm_warten'), msg('Der Sturm legt sich bis morgen. Komm dann wieder.')] }),
]);

const mastenRuhig: DialogueDef = dlg('wzm-masten-ruhig', [
  node('start', [
    n('Die Masten summen nur noch leise. Die braune Wand ist weg, der Himmel dahinter so weit, dass dir schwindelig wird. Der Weg nach Westen liegt offen.'),
  ], { effects: [set('meer_masten_durch'), set('meer_sturm_warten', false)] }),
]);

// ---------------------------------------------------------------------------------------------- Wegzoll

const zoll: DialogueDef = dlg('wzm-zoll', [
  node('start', [
    n('Die Wegzoll-Schranke: ein rot-weißes Rohr auf einem Reifenstapel. In der Blechbude dahinter sitzt ein Staubfalke mit Fliegerbrille und einer Krähenfeder hinterm Ohr und feilt sich die Fingernägel mit einem Messer.'),
    l('narrator', 'Zöllner: „Wegzoll. Dreihundert Credits. Oder eine Geschichte, die mir gefällt. Oder deine Schuhe. Wir haben schon viele Schuhe.“'),
  ], {
    choices: [
      ch('„Krähe schickt mich.“', 'frei', { when: FALKEN_FREUNDLICH }),
      ch('Eine Geschichte erzählen. Die vom Meer. Und von dem Mann, der dort geblieben ist.', 'geschichte', { check: 'gc-93' }),
      ch('300 Credits auf den Tresen knallen.', 'zahlen', { effects: [{ credits: -300 }] }),
      ch('„Meine Schuhe behalt ich. Deine Zähne vielleicht nicht.“', 'kampf'),
      ch('Umkehren.'),
    ],
  }),
  node('frei', [
    l('narrator', 'Zöllner: „Krähe? Na dann. Freund von Krähe zahlt nicht. Feind von Krähe zahlt doppelt. Du bist kein Feind. Glaub ich.“'),
    n('Die Schranke geht hoch. Der Zöllner salutiert mit dem Messer.'),
  ], { effects: [set('meer_zoll_bezahlt')] }),
  node('geschichte', [
    n('Du erzählst. Von Marla, die als Kind mit ihrem Vater bis ans Meer gefahren ist. Von dem Satz „Hier ist es gut“. Von einer Karte in vier Stücken. Von einem Mädchen bei Quantum, das vom Meer träumt und nicht weiß, ob es noch da ist.'),
    n('Der Zöllner hört auf, sich die Nägel zu feilen. Hinter der Bude kommen zwei weitere Falken hervor. Einer schnieft.'),
    l('narrator', 'Zöllner: „Scheiße, Mann. Das war gut. Das war RICHTIG gut. Geh durch. Und erzähl der Kleinen, dass es noch da ist.“'),
  ], { effects: [set('meer_zoll_bezahlt'), { rep: 'staubfalken', delta: 10 }] }),
  node('zahlen', [
    l('narrator', 'Zöllner: „Bar. Gut. Langweilig, aber gut.“ Die Schranke geht hoch.'),
  ], { effects: [set('meer_zoll_bezahlt')] }),
  node('kampf', [
    l('narrator', 'Zöllner: „Oh, eine Kundin mit Meinung.“ Er pfeift. Zwei Falken springen von ihren Maschinen.'),
  ], { effects: [{ battle: 'enc-oednis-staubfalken' }] }),
]);

// ---------------------------------------------------------------------------------------------- Abschluss bei Marla

const abschluss: DialogueDef = dlg('wzm-marla-ende', [
  node('start', [
    l(M, 'Und? Und? Sag schon. Nein, sag nichts. Doch. Sag.', 'besorgt'),
  ], {
    choices: [
      ch('„Es ist blauer, als du gesagt hast.“', 'blau'),
      ch('„Es ist grau. Und laut. Und riesig. Und ich will sofort wieder hin.“', 'grau'),
      ch('Ihr einfach das Foto zeigen.', 'foto', { when: item('meer-foto') }),
    ],
  }),
  node('blau', [
    l(M, 'Ha. Ich hab’s gewusst. Ich hab’s doch gewusst.', 'freude'),
  ], { next: 'ende' }),
  node('grau', [
    l(M, 'Grau ist es nur, wenn es schlechte Laune hat. Hat es oft. Wie ich.', 'freude'),
  ], { next: 'ende' }),
  node('foto', [
    n('Marla nimmt das Foto mit beiden Händen. Sie sieht es lange an. Dann wischt sie sich mit dem Handrücken über die Augen und tut so, als wäre es Sand.'),
    l(M, 'Verdammter Glasstaub.', 'trauer'),
  ], { next: 'ende' }),
  node('ende', [
    l(M, 'Hier. Die hab ich damals mitgenommen. Eine Muschel. Die riecht noch nach Salz, nach vierzig Jahren. Die gehört nicht mir. Die gehört der Kleinen. Gib sie ihr, wenn sie wieder da ist.', 'zaertlich'),
    l(M, 'Und jetzt weißt du den Wagenweg. Wenn das hier alles vorbei ist, fahren wir hin. Alle. Mit Ziegen.', 'signatur'),
  ], {
    choices: [
      ch('„Ich hab kein Foto gemacht.“', 'kein-foto', { when: noItem('meer-foto') }),
      ch('Nicken.', 'schluss', { when: item('meer-foto') }),
    ],
  }),
  node('kein-foto', [
    l(M, 'Dann nimm meins. Das hat mein Vater gemacht. Mit einer Kamera, die so groß war wie ein Brotkasten. Es ist vergilbt. Das Meer ist trotzdem drauf.', 'trauer'),
  ], { effects: [{ give: 'meer-foto' }], next: 'schluss' }),
  node('schluss', [
    n('Marla dreht sich zu ihrem Segel um und flickt weiter. Diesmal summt sie dabei. Es klingt wie die Masten.'),
  ], { effects: [set('meer_abschluss')] }),
]);

// ---------------------------------------------------------------------------------------------- Telefon

const phones = [
  phone('wzm-marla-nachricht', M, 'Hier Marla. Komm mal zum Hof. Es geht ums Meer. Und um die Kleine mit den Kabeln. Bring Zeit mit. Und Durst.', {
    auto: all(AKT2, COUNTDOWN, inactive(Q), zeit('morgen')),
  }),
];

const START: Condition = all(AKT2, COUNTDOWN, inactive(Q));
const ENDE: Condition = all(active(Q), ZOLL, MEER, noFlag('meer_abschluss'));

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: byId([auftakt, broesel, rudi, karte, masten, mastenRuhig, zoll, abschluss]),
  phone: byId(phones),
  daily: byId([
    { id: 'wzm-sturm-vorbei', when: flag('meer_sturm_warten'), effects: [set('meer_sturm_vorbei')] },
  ]),
  mapAdditions: {
    aussiedlerhof: {
      hotspots: [
        {
          id: 'wzm-marla-start', at: [110, 640], radius: 50, label: 'Marla Sand am Wohnwagen', kind: 'talk', dialogue: auftakt.id,
          when: all(START, zeit('morgen', 'tag')),
        },
        {
          id: 'wzm-marla-ende', at: [110, 640], radius: 50, label: 'Marla Sand: vom Meer erzählen', kind: 'talk', dialogue: abschluss.id,
          when: all(ENDE, zeit('morgen', 'tag', 'abend')),
        },
      ],
    },
    schrottmarkt: {
      hotspots: [
        {
          id: 'wzm-marla-stand', at: [1010, 250], radius: 48, label: 'Marla Sand am Karawanenstand', kind: 'talk', dialogue: auftakt.id,
          when: all(START, { weekday: 'sa' }, zeit('morgen', 'tag')),
        },
        {
          id: 'wzm-marla-stand-ende', at: [1010, 250], radius: 48, label: 'Marla Sand: vom Meer erzählen', kind: 'talk', dialogue: abschluss.id,
          when: all(ENDE, { weekday: 'sa' }, zeit('morgen', 'tag')),
        },
      ],
    },
    staubstrasse: {
      hotspots: [
        {
          id: 'wzm-broesel', at: 'broesel-wasserstand', label: 'Brösel: „Echte Seekarten!“', kind: 'talk', dialogue: broesel.id,
          when: all(active(Q), noFlag('meer_broesel_fragment'), { not: KARTE }, zeit('tag')),
        },
        {
          id: 'wzm-masten', at: 'singende-masten', label: 'Singende Masten im Sandsturm', kind: 'use', dialogue: masten.id,
          when: all(active(Q), KARTE, { not: MASTEN }, noFlag('meer_sturm_vorbei')),
        },
        {
          id: 'wzm-masten-ruhig', at: 'singende-masten', label: 'Singende Masten (ruhig)', kind: 'use', dialogue: mastenRuhig.id,
          when: all(active(Q), KARTE, { not: MASTEN }, flag('meer_sturm_vorbei')),
        },
        {
          id: 'wzm-zoll', at: 'wegzoll-schranke', label: 'Wegzoll der Staubfalken', kind: 'talk', dialogue: zoll.id,
          when: all(active(Q), MASTEN, { not: ZOLL }),
        },
      ],
    },
    'rudis-diner': {
      hotspots: [
        {
          id: 'wzm-rudi', at: 'tresen-vorne', label: 'Rudi: Kartenstück hinterm Tresen', kind: 'talk', dialogue: rudi.id,
          when: all(active(Q), noFlag('meer_rudi_fragment'), { not: KARTE }, zeit('morgen', 'abend')),
        },
        {
          id: 'wzm-karte', at: 'verhandlungstisch', label: 'Küstenkarte zusammenlegen', kind: 'use', dialogue: karte.id,
          when: all(active(Q), item(FRAG, 4), { not: KARTE }),
        },
      ],
    },
  },
};

