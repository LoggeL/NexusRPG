// side-collins-peruecke · „Die Perücke“ (world.md §6.2 Nr. 29). Collin, stufenplatz / nx1-studio, Mo/Mi/Fr vor 12:00.
// Collins Haarteil ist weg, Sendung um zwölf → Spuren: Wind (Windkante), Tauben von Opa Gurrmann, ein Kind mit neuem „Hut“
// am Botenstand. Wege: gc-122 Gerücht verfolgen · gc-123 Taubendrohne umleiten · Spuren ablaufen und dem Kind den Hut
// abschwatzen (ohne Check) · Stylistin Gina improvisiert (100 Cr) · gc-124 ehrlich ohne Perücke auf Sendung (meinung +1).
// Wer um 12:00 nichts hat, verliert die Quest: Collin moderiert mit Handtuch.
import type { ContentPart } from '../../part';
import type { CutsceneDef, DialogueDef, NewsDef, PhoneMessageDef, QuestDef } from '../../../modules/contracts';
import { active, all, any, ch, dlg, flag, herz, inactive, item, l, n, noFlag, node, not, p, set } from './_q';

const Q = 'side-collins-peruecke';
const CO = 'collin-charleston';
const GEFUNDEN = 'peruecke_gefunden';
const KIND = 'peruecke_spur_kind';
const LOESUNG = any(flag('peruecke_zurueck'), flag('peruecke_gina'), flag('peruecke_ehrlich'));
const VOR_ZWOELF = { clockBetween: [360, 720] as const };
const SUCHE = all(active(Q), not(LOESUNG), noFlag(GEFUNDEN), VOR_ZWOELF);

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: 'Die Perücke',
  summary: 'Collin Charlestons Haarteil ist weg. Die Sendung ist um zwölf. Live. Exklusiv. Unglaublich. Und ohne Haare.',
  giver: CO,
  act: 1,
  fail: all({ clockBetween: [720, 1560] }, not(LOESUNG)),
  steps: [
    {
      id: 'loesung', text: 'Rette Collins Sendung um 12:00 – mit Perücke, mit neuer Frisur oder ganz ohne.',
      done: LOESUNG, marker: { map: 'nx1-studio', at: [200, 530] },
    },
    {
      id: 'spur-wind', optional: true, when: all(not(LOESUNG), noFlag(GEFUNDEN)),
      text: 'Spur: An der Windkante am Stufenplatz hat Collin heute früh geprobt. Und dann kam der Wind.',
      done: any(flag('peruecke_spur_wind'), flag(KIND), flag(GEFUNDEN)), marker: { map: 'stufenplatz', at: [1252, 470] },
    },
    {
      id: 'spur-tauben', optional: true, when: all(not(LOESUNG), noFlag(GEFUNDEN)),
      text: 'Spur: Opa Gurrmanns Tauben in den Lötgassen fangen alles, was fliegt. Auch Haar.',
      done: any(flag('peruecke_spur_tauben'), flag(KIND), flag(GEFUNDEN)), marker: { map: 'loetgassen', at: [965, 175] },
    },
    {
      id: 'spur-kind', optional: true, when: all(not(LOESUNG), noFlag(GEFUNDEN)),
      text: 'Spur: Am Botenstand auf dem Schrottmarkt läuft ein Kind mit einem sehr seltsamen neuen Hut herum.',
      done: flag(GEFUNDEN), marker: { map: 'schrottmarkt', at: [530, 470] },
    },
    {
      id: 'zurueck', optional: true, when: all(flag(GEFUNDEN), not(LOESUNG)),
      text: 'Bring Collin die Perücke, bevor er um 12:00 auf Sendung geht (Studio oder Bühne am Stufenplatz).',
      done: flag('peruecke_zurueck'), marker: { map: 'nx1-studio', at: [200, 530] },
    },
  ],
  reward: { xp: 120, credits: 100, relations: { [CO]: 80 }, rep: { 'nx1-medien': 10 } },
};

// ---------------------------------------------------------------------------------------------- Auftakt

const start: DialogueDef = dlg('peruecke-start', [
  node('start', [
    n('Collin Charleston sitzt vor dem Schminkspiegel. Er trägt eine Baseballkappe. Collin Charleston trägt NIE eine Baseballkappe. Unter der Kappe: nichts. Absolut nichts. Eine glänzende, sehr überraschte Glatze.'),
    l(CO, 'Schau nicht hin! Schau nicht hin! Live! Exklusiv! Katastrophe!', 'besorgt'),
    l(CO, 'Mein Haarteil ist weg. Mein HAARTEIL! Ich hab heute früh an der Windkante am Stufenplatz die Moderation geprobt, ein Windstoß, und – fffft. Weg. Wie meine Würde.', 'trauer'),
    l(CO, 'In zwei Stunden bin ich live. Um zwölf. Auf der großen Bühne. Vor allen. Mit DEM HIER.', 'besorgt'),
  ], {
    choices: [
      ch('„Ich find deine Haare.“', 'ja'),
      ch('„Ohne steht dir eigentlich auch.“', 'ohne'),
      ch('„Eine Glatze ist live mindestens genauso exklusiv.“', 'ohne', { tag: '[Romanze]', when: { romance: CO } }),
      ch('„Viel Glück, Glatzkopf.“', 'nein'),
    ],
  }),
  node('ohne', [
    l(CO, 'Ohne? OHNE? Weißt du, was die Leute sagen? „Collin, der Mann mit den perfekten Haaren.“ Nicht „Collin, der Mann mit dem perfekten Schädel“!', 'wut'),
    n('Er schaut in den Spiegel. Er tastet seinen Kopf ab. Er schaut noch mal.'),
    l(CO, '… Er ist allerdings schön rund. Das muss man ihm lassen.', 'ueberrascht'),
  ], { next: 'ja' }),
  node('nein', [
    l(CO, 'GLATZKOPF? Das schneid ich raus! Das schneiden wir alles raus! Regie! REGIE!', 'wut'),
    n('Niemand antwortet. Die Regie ist Kaffee holen.'),
  ]),
  node('ja', [
    l(CO, 'Du bist ein Engel. Ein Engel mit … schau mal, mit echten Haaren. Neidisch. Ich bin neidisch.', 'freude'),
    l(CO, 'Die Windkante am Stufenplatz. Da ist es passiert. Und wenn du sie bis zwölf nicht findest … ich weiß nicht. Ich moderiere unter einem Eimer. Ich moderiere als Hologramm. Ich wandere aus!', 'besorgt'),
  ], { effects: [{ startQuest: Q }] }),
]);

// ---------------------------------------------------------------------------------------------- Spuren

const windkante: DialogueDef = dlg('peruecke-windkante', [
  node('start', [
    n('Die Windkante am Stufenplatz: Hier pfeift der Wind von der Oberstadt herunter, als hätte er etwas gegen die Unterstadt. Es riecht nach Brezeln und nach Collins Haarspray. „Deluxe Halt Extrem“.'),
    n('Auf dem Geländer klebt ein einzelnes, perfektes, glänzendes Haar. Der Wind weht in Richtung Lötgassen. Dort, wo die Taubenschläge sind.'),
  ], {
    effects: [set('peruecke_spur_wind')],
    choices: [
      ch('Den Brezelverkäufer fragen. Der sieht alles, was hier vorbeifliegt.', 'geruecht', { check: 'gc-122' }),
      ch('Der Spur nach. Richtung Lötgassen, zu den Tauben.'),
    ],
  }),
  node('geruecht', [
    n('Der Brezelverkäufer lacht so sehr, dass ihm eine Brezel vom Haken fällt.'),
    n('„Das Ding? Ist hier vorbeigeflogen wie ein beleidigter Hamster. Eine von Gurrmanns Tauben hat’s geschnappt und am Schrottmarkt fallen lassen. Am Botenstand. Seitdem trägt der kleine Flo da so einen … Hut.“'),
  ], { effects: [set(KIND)] }),
]);

const tauben: DialogueDef = dlg('peruecke-tauben', [
  node('start', [
    n('Opa Gurrmanns Taubenschlag: Holz, Draht und vierzig Tauben, die Hälfte davon aus Fleisch, die andere aus Blech und Propellern.'),
    l('opa-gurrmann', 'Gurr. Ich meine: Guten Tag. Man gewöhnt sich das an.', 'neutral'),
    p('Eine Ihrer Tauben hat Collin Charlestons Perücke geklaut.'),
    l('opa-gurrmann', 'Gertrud! Das war Gertrud. Gertrud bringt mir immer Geschenke. Gestern eine Socke, heute Haare. Sie hat sie über dem Schrottmarkt fallen lassen, weil sie zu schwer waren. Von dem Spray.', 'freude'),
    l('opa-gurrmann', 'Am Botenstand, glaub ich. Der kleine Flo hat sie gefunden. Der trägt sie jetzt als Hut. Steht ihm.', 'signatur'),
  ], {
    effects: [set('peruecke_spur_tauben'), set(KIND)],
    choices: [
      ch('Gertruds Flugdrohne umprogrammieren: Hin zu Flo, Perücke schnappen, zurück zum Studio.', 'drohne', { check: 'gc-123' }),
      ch('„Danke, Opa. Ich geh zu Flo.“'),
    ],
  }),
  node('drohne', [
    n('Gertrud ist zur Hälfte Taube und zur Hälfte Lieferdrohne. Du findest den Steuerchip unter einer Feder, tippst die Koordinaten vom Schrottmarkt ein und dann die des NX-1-Studios.'),
    n('Gertrud startet mit einem empörten Gurren. Zwanzig Minuten später kommt sie zurück und lässt dir etwas Haariges auf den Kopf fallen. Es riecht nach Haarspray und nach Kind.'),
    l('opa-gurrmann', 'Gute Gertrud. Brave Gertrud. Der kleine Flo weint jetzt bestimmt. Gib ihm was Süßes, wenn du vorbeikommst.', 'besorgt'),
  ], { effects: [set(GEFUNDEN), set('peruecke_drohne'), { advanceTime: 20 }, herz('opa-gurrmann', 10)] }),
]);

const kind: DialogueDef = dlg('peruecke-kind', [
  node('start', [
    n('Am Botenstand sitzt ein Junge, vielleicht sieben, mit einem Stapel Pakete und einem Gesichtsausdruck wie ein Firmenchef. Auf seinem Kopf: Collin Charlestons Perücke. Verkehrt herum. Mit einem Kronkorken als Brosche.'),
    n('„Das ist mein Hut. Den hat mir der Himmel geschenkt. Der Himmel hat gesagt: Flo, du bist jetzt wichtig.“'),
  ], {
    choices: [
      ch('Eine Nougatbombe gegen den Hut tauschen.', 'tausch', { requires: item('nougatbombe'), effects: [{ take: 'nougatbombe' }] }),
      ch('20 Credits für den Hut bieten.', 'tausch', { requires: { credits: 20 }, effects: [{ credits: -20 }] }),
      ch('„Das sind Collin Charlestons Haare. Wenn du sie ihm zurückgibst, sagt er deinen Namen im Fernsehen.“', 'ehrlich'),
      ch('Gehen.'),
    ],
  }),
  node('tausch', [
    n('Flo überlegt lange. Er rechnet mit den Fingern. Dann nimmt er den Hut ab und hält ihn dir hin, wie ein König, der eine Krone abgibt.'),
    n('„Der Himmel schenkt mir bestimmt bald einen neuen.“'),
  ], { effects: [set(GEFUNDEN)] }),
  node('ehrlich', [
    n('Flo reißt die Augen auf. „Im FERNSEHEN? Mein Name? Flo? Mit F?“'),
    n('Er nimmt die Perücke ab, klopft sie aus, rückt sie gerade und überreicht sie dir mit beiden Händen.'),
    n('„Sag ihm, Flo vom Botenstand. Und dass ich sie gekämmt hab. Mit den Fingern.“'),
  ], { effects: [set(GEFUNDEN), set('peruecke_flo_im_fernsehen')] }),
]);

// ---------------------------------------------------------------------------------------------- Lösung bei Collin

const loesung: DialogueDef = dlg('peruecke-collin', [
  node('start', [
    l(CO, 'Und? Und? Sag was! Sag nichts! Doch, sag was!', 'besorgt'),
  ], {
    choices: [
      ch('Die Perücke hinhalten.', 'perucke', { when: flag(GEFUNDEN) }),
      ch('„Ich hol Gina. Die zaubert dir was.“ (100 Cr)', 'gina', { when: noFlag(GEFUNDEN), requires: { credits: 100 }, effects: [{ credits: -100 }] }),
      ch('„Collin. Geh ohne. Die Leute lieben dich nicht wegen der Haare. Sondern trotz.“', 'ehrlich', { check: 'gc-124' }),
      ch('„Ich such weiter.“'),
    ],
  }),
  node('perucke', [
    n('Collin reißt dir das Haarteil aus der Hand, presst es an die Brust, riecht daran und verzieht das Gesicht.'),
    l(CO, 'Es riecht nach … Taube? Und nach Kind? Egal! Haarspray drüber! Deluxe Halt Extrem! Niemand wird es merken!', 'freude'),
    n('Er setzt es auf. Verkehrt herum. Du drehst es um. Er strahlt dich an wie ein Scheinwerfer.'),
  ], {
    choices: [
      ch('„Flo vom Botenstand lässt grüßen. Er hat sie gekämmt. Mit den Fingern.“', 'flo', { when: flag('peruecke_flo_im_fernsehen') }),
      ch('„Viel Glück bei der Sendung.“', 'zurueck'),
    ],
  }),
  node('flo', [
    l(CO, 'Flo? Mit F? Er bekommt einen Gruß. Einen GROSSEN Gruß. Live! Exklusiv! „Für Flo, den Retter meiner Frisur!“', 'freude'),
  ], { effects: [herz(CO, 20)], next: 'zurueck' }),
  node('zurueck', [
    l(CO, 'Du hast meine Sendung gerettet. Meine Karriere. Meinen Kopf. Ich schulde dir was. Ich schulde dir alles. Ich schulde dir hundert Credits, das ist alles, was ich gerade dabeihab.', 'freude'),
  ], { effects: [set('peruecke_zurueck')] }),
  node('gina', [
    n('Zwanzig Minuten später steht Stylistin Gina im Studio. Sie trägt drei Kämme im Haar, zwei Föhne am Gürtel und schaut auf Collins Glatze wie eine Bildhauerin auf einen Marmorblock.'),
    l('stylistin-gina', 'Schätzchen. Atme. Ich hab schon Schlimmeres gerettet. Ich hab Hunter mal einen Seitenscheitel gemacht.', 'signatur'),
    n('Sie arbeitet mit Haarteilen aus ihrer Notfalltasche, Klebeband, Spray und purem Willen. Am Ende sieht Collin aus wie Collin. Nur etwas höher.'),
    l(CO, 'Das ist … das bin ja ICH! Nur mit zwei Zentimetern mehr! Gina, du bist eine Göttin!', 'freude'),
  ], { effects: [set('peruecke_gina'), { advanceTime: 30 }, herz('stylistin-gina', 20)] }),
  node('ehrlich', [
    l(CO, 'Trotz?', 'ueberrascht'),
    p('Du bist laut, du duzt alle, du sagst „unglaublich“ zu Wetterberichten. Die Leute lieben das. Die Haare sind nur Deko.'),
    n('Collin schaut in den Spiegel. Lange. Dann nimmt er die Baseballkappe ab und legt sie auf den Schminktisch, wie man eine Waffe niederlegt.'),
    l(CO, 'Live. Exklusiv. Unglaublich. Und ehrlich.', 'signatur'),
  ], { effects: [{ cutscene: 'peruecke-sendung' }] }),
]);

const sendung: CutsceneDef = {
  id: 'peruecke-sendung',
  title: 'Collin, ehrlich',
  beats: [
    {
      image: 'cut-peruecke-sendung', fade: 'in',
      caption: 'Zwölf Uhr. Die Bühne am Stufenplatz. Die Kamera schwenkt auf Collin Charleston. Auf seinen Kopf. Der Stufenplatz hält die Luft an.',
      lines: [l(CO, 'Meine Damen und Herren! Live! Exklusiv! Und heute zum ersten Mal: ohne Haare!', 'signatur')],
    },
    {
      image: 'cut-peruecke-sendung',
      caption: 'Stille. Eine Taube landet auf dem Geländer. Dann lacht jemand. Dann klatscht jemand. Dann klatscht der ganze Platz.',
      lines: [l(CO, 'Das hier bin ich. Glänzend. Rund. Unglaublich. Und wer mich nicht mag, schaltet um. Auf Pixel-Pete. Der hat nicht mal einen Kopf!', 'freude')],
    },
    {
      image: 'cut-peruecke-sendung', fade: 'out',
      caption: 'Die Einschaltquote steigt um vierzig Prozent. Am Abend tragen in der Unterstadt drei Leute stolz eine Glatze. Einer davon ist Opa Gustav, aber der hatte schon eine.',
      lines: [l(CO, 'Danke. Ich mein das ehrlich. Zum ersten Mal in meiner Karriere mein ich was ehrlich.', 'zaertlich')],
    },
  ],
  effects: [set('peruecke_ehrlich'), set('meinung_plus_collin_glatze'), herz(CO, 30)],
  gallery: false,
};

const news: NewsDef = {
  id: 'news-collin-glatze',
  anchor: 'delya-delloraine',
  headline: 'Collin Charleston zeigt Kopf',
  priority: 3,
  when: flag('peruecke_ehrlich'),
  lines: [
    l('delya-delloraine', 'Mein Kollege Collin Charleston hat heute live auf sein Haarteil verzichtet. Die Quote: Rekord. Die Zuschauer: begeistert.', 'neutral'),
    l('delya-delloraine', 'Ich frage mich seit zwölf Jahren, was er darunter versteckt. Jetzt weiß ich es. Ich bin enttäuscht. Es ist nur ein Kopf.', 'signatur'),
  ],
};

const handtuch: PhoneMessageDef = {
  id: 'peruecke-handtuch',
  from: CO,
  text: 'Ich hab mit einem HANDTUCH auf dem Kopf moderiert. Einem Handtuch, auf dem „Sauna Glück“ steht. Die Quote war gut. Ich bin trotzdem tot. Innerlich. Danke für nichts. Kuss, Collin.',
  auto: { quest: Q, state: 'failed' },
  replies: [
    { text: 'Tut mir leid, Collin.', effects: [herz(CO, 10)] },
    { text: 'Sauna Glück klingt doch nett.' },
  ],
};

const MOMIFR = { weekday: ['mo', 'mi', 'fr'] } as const;

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: {
    [start.id]: start, [windkante.id]: windkante, [tauben.id]: tauben, [kind.id]: kind, [loesung.id]: loesung,
  },
  cutscenes: { [sendung.id]: sendung },
  news: { [news.id]: news },
  phone: { [handtuch.id]: handtuch },
  mapAdditions: {
    'nx1-studio': {
      hotspots: [
        {
          id: 'peruecke-start', at: 'schminkspiegel', label: 'Collin mit Baseballkappe', kind: 'talk', dialogue: start.id,
          when: all(inactive(Q), MOMIFR, { clockBetween: [360, 600] }),
        },
        {
          id: 'peruecke-collin', at: 'schminkspiegel', label: 'Collin Bescheid geben', kind: 'talk', dialogue: loesung.id,
          when: all(active(Q), not(LOESUNG), VOR_ZWOELF),
        },
      ],
    },
    stufenplatz: {
      hotspots: [
        {
          id: 'peruecke-windkante', at: 'windkante', label: 'Hier hat Collin geprobt', kind: 'use', dialogue: windkante.id,
          when: SUCHE,
        },
        {
          id: 'peruecke-buehne', at: 'buehne', label: 'Collin vor der Bühne', kind: 'talk', dialogue: loesung.id,
          when: all(active(Q), not(LOESUNG), { clockBetween: [660, 720] }),
        },
      ],
    },
    loetgassen: {
      hotspots: [{
        id: 'peruecke-tauben', at: 'taubenschlag', label: 'Opa Gurrmann nach Gertrud fragen', kind: 'talk', dialogue: tauben.id,
        when: SUCHE,
      }],
    },
    schrottmarkt: {
      hotspots: [{
        id: 'peruecke-flo', at: 'botenstand', label: 'Junge mit seltsamem Hut', kind: 'talk', dialogue: kind.id,
        when: SUCHE,
      }],
    },
  },
};
