// Nebenquest 3 `side-riegel-krise` „Die Riegel-Krise“ (world.md §6.2 Nr. 3). Dante, tagsüber, nach main-1-dante.
// Keine Nougatbomben mehr in der Unterstadt, Hunter wird zur Diva (Flag hunter_diva; Herzgewinne halbieren kann die
// Engine nicht → gaps) → Oma Volt weiß: Quantum hat alles für „Energie-Tests“ gekauft → zurückholen oder Ersatz.
// Wege: gc-54 [Straße 5] Schmuggler Knuspi (150 Cr oder Gefallen) · Laster nachts am Quantum-Depot ausrauben
// (enc-hafen-laster; Schleichen [Reflexe 5]) · Oma Volts Rezept „Notfallriegel“ + Koch-Minispiel bei Babette.
import type { ContentPart } from '../../part';
import type { CheckDef, DialogueDef, QuestDef } from '../../../modules/contracts';
import {
  active, all, any, dlg, done, flag, ich, inactive, l, msg, nar, node, noFlag, not, set, time, tschuess,
  VEXARIA_DABEI,
} from './_lib';

const Q = 'side-riegel-krise';
const DA = 'dante';
const RIEGEL = any(flag('riegel_knuspi'), flag('riegel_laster'), { won: 'enc-hafen-laster' }, flag('riegel_notfallriegel'));

/** world.md nennt fürs Schleichen am Laster keine gc-ID: eingebettet. */
const SCHLEICHEN: CheckDef = { id: 'riegel-laster-schleichen', attribute: 'reflexe', threshold: 5, tags: ['schleichen'] };

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: 'Die Riegel-Krise',
  summary: 'In der ganzen Unterstadt gibt es keine Nougatbomben mehr. Dante zittert. Hunter wird zur Diva. Das ist ein Notstand.',
  giver: DA,
  act: 1,
  steps: [
    {
      id: 'ursache', text: 'Finde heraus, wo die Nougatbomben geblieben sind. Oma Volt weiß alles, was in der Unterstadt verkauft wird.',
      done: flag('riegel_ursache'), marker: { map: 'neon-gasse' },
    },
    {
      id: 'riegel', text: 'Beschaff Nougatbomben – zurückholen, schmuggeln oder selbst backen.',
      when: flag('riegel_ursache'), done: RIEGEL, marker: { map: 'hafenkante' },
    },
    {
      id: 'weg-knuspi', text: 'Weg: Ein Schmuggler namens Knuspi soll abends an der Hafenkante Riegel verticken.',
      optional: true, when: all(flag('riegel_ursache'), not(RIEGEL)), done: flag('riegel_knuspi'), marker: { map: 'hafenkante' },
    },
    {
      id: 'weg-laster', text: 'Weg: Nachts liefern Quantum-Laster am Depot der Hafenkante. Ohne Licht. Mit Riegeln.',
      optional: true, when: all(flag('riegel_ursache'), not(RIEGEL)),
      done: any(flag('riegel_laster'), { won: 'enc-hafen-laster' }), marker: { map: 'hafenkante' },
    },
    {
      id: 'weg-rezept', text: 'Weg: Mit Oma Volts Notfallriegel-Rezept bei Babettes Garküche selbst kochen.',
      optional: true, when: all(flag('riegel_rezept'), not(RIEGEL)), done: flag('riegel_notfallriegel'), marker: { map: 'schrottmarkt' },
    },
    {
      id: 'dante', text: 'Bring Dante die Riegel. Schnell. Bevor er anfängt, Lötzinn zu lutschen.',
      when: RIEGEL, done: flag('riegel_abgegeben'), marker: { map: 'dantes-werkstatt' },
    },
  ],
  reward: {
    xp: 150,
    items: { nougatbombe: 10, 'rezept-notfallriegel': 1 },
    relations: { hunter: 60, dante: 40 },
    effects: [set('hunter_diva', false), set('riegel_krise_vorbei'), msg('Die Nougatbomben sind zurück. Hunter ist wieder Hunter. Das heißt: schlecht gelaunt, aber nicht mehr dramatisch.')],
  },
};

// ---------------------------------------------------------------------------------------------- Dante (Auftakt + Abgabe)

const dante: DialogueDef = dlg('side-riegel-dante', [
  node('start', [
    nar('Dante sitzt an der Werkbank und lötet. Seine Hand zittert. Das Lötzinn tropft auf einen Keks. Er isst den Keks trotzdem.'),
    l(DA, 'Ah! Du! Gut! Schlecht! Beides!', 'besorgt'),
  ], {
    choices: [
      { text: '„Was ist los? Du siehst aus wie ein Toaster kurz vorm Durchbrennen.“', when: inactive(Q), next: 'krise' },
      { text: '„Ich hab Nougatbomben.“', when: all(active(Q), RIEGEL), next: 'abgabe' },
      { text: '„Ich such noch.“', when: all(active(Q), not(RIEGEL)), next: 'warten' },
      tschuess('„Ich lass dich lieber.“'),
    ],
  }),
  node('krise', [
    l(DA, 'Keine Nougatbomben. NIRGENDS. Nicht am Imbiss, nicht bei Oma Volt, nicht in Hunters Geheimschublade. Ich hab nachgesehen. Mit Dietrich.', 'besorgt'),
    l(DA, 'Ohne Nougatbomben kann ich nicht denken! Ohne Denken kann ich nicht löten! Ohne Löten bin ich nur ein Mann mit sehr vielen Schallplatten!'),
    l(DA, 'Und Hunter … Um Himmels Willen, Hunter. Hunter ist seit gestern eine Diva. Er hat den Barkeeper angeschrien, weil das Eis „zu eckig“ war.', 'ueberrascht'),
    ich('Und was soll ich da machen?'),
    l(DA, 'Rausfinden, wer die Unterstadt leergekauft hat. Und sie zurückholen. Oder Ersatz. Oder irgendwas mit Nougat. Ich nehm auch Nougat ohne Bombe. Ich nehm sogar nur die Bombe.', 'freude'),
    l(DA, 'Frag Oma Volt. Die weiß, wer was kauft, bevor die Leute es selbst wissen.'),
  ], { effects: [{ startQuest: Q }, set('hunter_diva')] }),
  node('warten', [
    l(DA, 'Ich halte durch. Ich bin stark. Ich hab einmal drei Tage ohne Kaffee in Einzelhaft gesessen.', 'trauer'),
    l(DA, 'Okay, es war ein Tag. Und ich hab geweint. Beeil dich.'),
  ]),
  node('abgabe', [
    nar('Du stellst die Riegel auf die Werkbank. Dante starrt sie an, als wären sie eine Erstpressung mit Unterschrift.'),
    l(DA, 'Heiliges Kanonenrohr.', 'ueberrascht'),
    nar('Er reißt eine Packung auf, beißt ab, schließt die Augen. Im Hintergrund knistert eine Platte. Es ist sehr still.'),
    l(DA, 'Ich kann wieder denken. Ich denke gerade: Danke. Und: Ich sollte Vorräte anlegen. Und: Hunter kriegt die Hälfte, sonst stirbt die Crew an seiner Laune.', 'freude'),
    l(DA, 'Nimm, was du kriegen kannst, und hau ab. Das ist eine Lebensweisheit. Aber nicht heute. Heute nimm zehn Riegel und bleib zum Essen.'),
  ], {
    choices: [
      { text: '„Gern.“', next: 'schluss' },
      { text: '„Ich geh Hunter erlösen.“', next: 'schluss' },
      {
        text: '„Aria hat mir unterwegs zwei geklaut. Und mir dafür … na ja. Was anderes gegeben.“', when: VEXARIA_DABEI,
        once: true, id: 'riegel-vexaria-dante', next: 'vexaria',
      },
    ],
  }),
  node('vexaria', [
    l('aria', 'Ich hab gar nichts gegeben. Ich hab nur … Schokolade weggewischt. Mit dem Mund. War ein Unfall.', 'verlegen'),
    l(DA, 'Ich will das nicht hören. Ich will das sehr, sehr dringend nicht hören.', 'ueberrascht'),
    l(DA, '… War es wenigstens Vollmilch?'),
  ], { effects: [{ relation: 'aria', delta: 10 }], next: 'schluss' }),
  node('schluss', [nar('Dante legt eine Platte auf, die nach Sommer klingt. Zum ersten Mal seit Tagen zittert seine Hand nur noch vor Begeisterung.')], {
    effects: [set('riegel_abgegeben')],
  }),
]);

// ---------------------------------------------------------------------------------------------- Oma Volt (Ursache, Rezept)

const oma: DialogueDef = dlg('side-riegel-oma', [
  node('start', [
    l('oma-volt', 'Nougatbomben? Kindchen, frag mich nicht. Alle fragen mich. Ich hab drei Kunden heute rausgeworfen, einer hat geweint, einer war Hunter.', 'wut'),
  ], {
    choices: [
      { text: '„Wer hat die alle gekauft?“', when: noFlag('riegel_ursache'), next: 'quantum' },
      { text: '„Gibt’s keinen Ersatz?“', when: all(flag('riegel_ursache'), noFlag('riegel_rezept')), next: 'rezept' },
      tschuess('„Danke, Oma.“'),
    ],
  }),
  node('quantum', [
    l('oma-volt', 'Quantum. Wer sonst. Vor drei Tagen kam so ein Weißkittel mit Klemmbrett und hat die ganze Großhandelslieferung aufgekauft. Für „Energie-Tests“.', 'wut'),
    l('oma-volt', 'Energie-Tests! Mit Nougat! Die stopfen das ihren Testpersonen rein, damit die beim Chip-Test nicht umkippen. Ich hab’s gehört. Ich hör alles.'),
    l('oma-volt', 'Die Kisten stehen am Quantum-Depot an der Hafenkante. Nachts kommen Laster, die Nachschub bringen. Ohne Licht. Wie Diebe. Nur mit Rechnung.'),
    l('oma-volt', 'Und an der Hafenkante treibt sich abends einer rum, der sich Knuspi nennt. Schmuggler. Der hat garantiert noch was. Wenn man ihn findet. Man findet ihn nur, wenn man weiß, wie man guckt.'),
  ], { effects: [set('riegel_ursache')], next: 'rezept-frage' }),
  node('rezept-frage', [l('oma-volt', 'Oder du machst es wie meine Großmutter im Krieg. Die hat Notfallriegel gebacken. Aus Haferflocken, Kakao und Verzweiflung.')], {
    choices: [
      { text: '„Erzähl. Wie geht das Rezept?“', next: 'rezept' },
      tschuess('„Ich schau mal am Hafen.“'),
    ],
  }),
  node('rezept', [
    l('oma-volt', 'Haferflocken, Kakao, Honig, eine Prise Salz und eine Nougatbombe zum Andenken. Fällt die Bombe weg, nimmst du Liebe. Liebe ist teurer.', 'signatur'),
    l('oma-volt', 'Geh zu Babette an die Garküche. Die hat einen Herd, der was taugt. Sag ihr, Oma Volt schickt dich. Dann verlangt sie nur die Hälfte.'),
  ], { effects: [set('riegel_rezept'), msg('Rezept gemerkt: Oma Volts Notfallriegel. Kochen kannst du bei Babettes Garküche.')] }),
]);

// ---------------------------------------------------------------------------------------------- Knuspi (gc-54)

const knuspi: DialogueDef = dlg('side-riegel-knuspi', [
  node('start', [
    nar('Hinter einem Stapel Reifen am Kai riecht es nach Karamell. Niemand ist zu sehen. Zu sehen ist nur ein Fischernetz, das sich sehr unauffällig bewegt.'),
  ], {
    choices: [
      { text: 'Auf die Zeichen achten: Das Netz hat einen Schokofleck, die Reifen sind frisch gestapelt. „Komm raus, Knuspi.“', check: 'gc-54', next: 'gefunden' },
      { text: '„Hallo? Ist hier jemand?“', next: 'niemand' },
      tschuess('(Weitergehen.)'),
    ],
  }),
  node('niemand', [
    nar('Das Netz hält sehr still. Eine Möwe landet darauf und sieht dich mitleidig an.'),
    ich('Okay. Dann eben anders. Laster, Rezept, irgendwas.'),
  ]),
  node('gefunden', [
    nar('Das Netz seufzt. Ein Mann mit Mütze und sehr klebrigen Fingern kriecht hervor. Auf seiner Jacke: zwölf eingenähte Innentaschen. Alle beulen.'),
    l('knuspi', 'Mist. Die Schokoflecken. Ich sag mir jedes Mal: Knuspi, wisch die Finger ab. Und jedes Mal: Knuspi leckt sie ab.', 'verlegen'),
    l('knuspi', 'Also. Du willst Bomben. Alle wollen Bomben. Ich hab eine Kiste. Original, nicht aus Quantum-Testbeständen. Hundertfünfzig.'),
  ], {
    choices: [
      { text: '150 Credits zahlen.', requires: { credits: 150 }, effects: [{ credits: -150 }], next: 'kauf' },
      { text: '„Ich hab nicht so viel. Aber ich schulde dir einen Gefallen.“', next: 'gefallen' },
      { text: '„Hundertfünfzig? Verpiss dich, du Karamell-Kakerlake.“', next: 'beleidigt' },
    ],
  }),
  node('beleidigt', [
    l('knuspi', 'Karamell-Kakerlake. Das schreib ich mir auf. Das ist gut.', 'freude'),
    l('knuspi', 'Der Preis bleibt trotzdem. Oder ein Gefallen. Gefallen sind die Währung der Zukunft. Und der Vergangenheit.'),
  ], {
    choices: [
      { text: '150 Credits zahlen.', requires: { credits: 150 }, effects: [{ credits: -150 }], next: 'kauf' },
      { text: '„Gut. Ein Gefallen.“', next: 'gefallen' },
      tschuess('„Vergiss es.“'),
    ],
  }),
  node('gefallen', [
    l('knuspi', 'Ein Gefallen. Irgendwann. Irgendwo. Vielleicht muss jemand mal für mich in einen Kühlwagen kriechen. Vielleicht muss jemand mal eine Tante von mir anlügen.', 'signatur'),
    l('knuspi', 'Gilt. Hier.'),
  ], { effects: [set('knuspi_gefallen_offen')], next: 'kauf' }),
  node('kauf', [
    nar('Knuspi zieht aus einer Innentasche eine flache Holzkiste, beschriftet mit „SCHRAUBEN“. Darin: Nougatbomben. Echte. Mit Glitzerpapier.'),
    l('knuspi', 'Wir haben uns nie gesehen. Ich bin ein Netz.'),
  ], { effects: [set('riegel_knuspi'), { relation: 'knuspi', delta: 20 }] }),
]);

// ---------------------------------------------------------------------------------------------- Laster am Depot (nachts)

const laster: DialogueDef = dlg('side-riegel-laster', [
  node('start', [
    nar('Ein weißer Laster rollt ohne Licht ans Depot. Zwei Quantum-Wachleute laden Kisten aus. „ENERGIE-TEST · NOUGAT · NICHT ESSEN“ steht drauf. Einer der beiden kaut.'),
  ], {
    choices: [
      { text: 'Im Schatten der Container an den Laster schleichen und eine Kiste mitnehmen.', check: SCHLEICHEN, next: 'geschlichen' },
      { text: 'Rausspringen und den Laster ausräumen. Mit Gewalt.', next: 'kampf' },
      tschuess('(Abwarten. Ein andermal.)'),
    ],
  }),
  node('geschlichen', [
    nar('Du duckst dich hinter einen Reifen, wartest, bis der Kauende sich umdreht, um zu kauen, und greifst. Die Kiste ist schwer. Sie riecht nach Glück.'),
  ], {
    effects: [set('riegel_laster'), msg('Eine Kiste „Energie-Test“ Nougatbomben. Quantum wird sie nicht vermissen. Quantum vermisst nur Geld.')],
    choices: [
      { text: 'Abhauen.', when: not(VEXARIA_DABEI) },
      { text: '(Aria zieht dich hinter einen Container, als die Wache sich umdreht.)', when: VEXARIA_DABEI, next: 'vexaria' },
    ],
  }),
  node('vexaria', [
    nar('Zwischen zwei Containern ist es eng. Sehr eng. Arias Atem in deinem Nacken, ihr Zerberster an deiner Hüfte, warm vom Laufen. Die Taschenlampe der Wache streift das Metall über euch.'),
    l('aria', 'Wenn du jetzt lachst, bring ich dich um.', 'verlegen'),
    ich('Ich lach nicht. Ich atme. Du stehst auf meinem Fuß und auf meinem Verstand.'),
    l('aria', 'Gut. Dann sind wir quitt. Du klebst nämlich seit dreißig Sekunden an meinem Mund und hast es nicht mal gemerkt.', 'zaertlich'),
    nar('Die Schritte entfernen sich. Keine von euch beiden bewegt sich weg. Irgendwann rollt der Laster davon, und die Kiste Nougat steht vergessen im Dunkeln.'),
  ], { effects: [{ relation: 'aria', delta: 15 }, set('vexaria_laster_container')] }),
  node('kampf', [
    nar('Der Kauende lässt die Kiste fallen. „Halt! Das ist Forschungsmaterial! Das ist … hmpf … sehr lecker, aber Forschungsmaterial!“'),
  ], { effects: [{ battle: 'enc-hafen-laster' }] }),
]);

// ---------------------------------------------------------------------------------------------- Kochen bei Babette

const kochen: DialogueDef = dlg('side-riegel-kochen', [
  node('start', [
    l('babette-bao', 'Oma Volt schickt dich? Mit dem Notfallriegel? Ach du lieber Fisch. Den hat meine Mutter auch gekannt. Jede Küste hatte ihren.', 'freude'),
    l('babette-bao', 'Herd ist heiß. Haferflocken stehen da. Kakao da. Honig da. Verzweiflung bringst du mit, die seh ich dir an.'),
  ], {
    choices: [
      {
        text: 'Mitkochen.', effects: [{
          minigame: 'akt-kochen', level: 2, key: 'notfallriegel', label: 'Oma Volts Notfallriegel',
          win: [set('riegel_notfallriegel'), msg('Ein Blech goldbrauner Notfallriegel. Babette probiert, nickt, probiert noch mal. „Die sind besser als die echten. Sag’s keinem.“')],
          lose: [msg('Die Riegel kleben am Blech wie Rostzähne an einem Gratisbier. Babette: „Noch mal. Geduld ist auch eine Zutat.“')],
        }],
      },
      tschuess('„Gleich.“'),
    ],
  }),
]);

// ---------------------------------------------------------------------------------------------- Hunter als Diva

const diva: DialogueDef = dlg('side-riegel-diva', [
  node('start', [
    nar('Hunter steht am Tresen und mustert ein Glas Wasser, als hätte es ihn beleidigt.'),
    l('hunter', 'Das Wasser ist zu nass. Die Musik ist zu laut. Die Luft riecht nach Pfennigen. Und DU guckst, als würdest du mir gleich etwas Positives sagen. Lass es.', 'wut'),
  ], {
    choices: [
      { text: '„Ich arbeite an den Nougatbomben, Chef.“', next: 'nougat' },
      { text: '„Du bist unerträglich, weißt du das?“', next: 'unertraeglich' },
      tschuess('(Langsam rückwärts gehen.)'),
    ],
  }),
  node('nougat', [l('hunter', 'Ich esse nichts, was nach Kindheit schmeckt. Aber ich hab Hunger. Und wenn ich Hunger hab, ist alles Kindheit. Beeil dich.', 'trauer')]),
  node('unertraeglich', [
    l('hunter', 'Ja. Ich weiß. Ich hasse es. Ich hasse mich. Ich hasse dieses Glas.', 'trauer'),
    nar('Der Barkeeper stellt kommentarlos ein neues Glas hin. Es ist das gleiche Glas.'),
    l('barkeeper', 'Der Chef ist leer / leerer als sein Lieblingsglas / Nougat füllt beides.'),
  ]),
]);

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: { [dante.id]: dante, [oma.id]: oma, [knuspi.id]: knuspi, [laster.id]: laster, [kochen.id]: kochen, [diva.id]: diva },
  mapAdditions: {
    'dantes-werkstatt': {
      hotspots: [
        {
          id: 'q-riegel-dante', at: 'werkbank', radius: 60, label: 'Dante wirkt unterzuckert', kind: 'talk', dialogue: dante.id,
          when: all(done('main-1-dante'), noFlag('riegel_abgegeben'), any(active(Q), all(inactive(Q), time('morgen', 'tag')))),
        },
      ],
    },
    'neon-gasse': {
      hotspots: [
        {
          id: 'q-riegel-oma', at: 'kiosk', radius: 60, label: 'Oma Volt: Nougatbomben?', kind: 'talk', dialogue: oma.id,
          when: all(active(Q), any(noFlag('riegel_ursache'), noFlag('riegel_rezept')), time('morgen', 'tag', 'abend')),
        },
      ],
    },
    hafenkante: {
      hotspots: [
        {
          id: 'q-riegel-knuspi', at: 'knuspi-versteck', radius: 60, label: 'Reifenstapel, riecht nach Karamell', kind: 'talk', dialogue: knuspi.id,
          when: all(active(Q), flag('riegel_ursache'), not(RIEGEL), time('abend', 'nacht')),
        },
        {
          id: 'q-riegel-laster', at: 'quantum-depot', radius: 64, label: 'Laster am Depot beobachten', kind: 'talk', dialogue: laster.id,
          when: all(active(Q), flag('riegel_ursache'), not(RIEGEL), time('nacht')),
        },
      ],
    },
    schrottmarkt: {
      hotspots: [
        {
          id: 'q-riegel-kochen', at: 'garkueche', radius: 60, label: 'Notfallriegel mit Babette kochen', kind: 'talk', dialogue: kochen.id,
          when: all(active(Q), flag('riegel_rezept'), not(RIEGEL), time('morgen', 'tag', 'abend')),
        },
      ],
    },
    'high-voltage': {
      hotspots: [
        {
          id: 'q-riegel-hunter-diva', at: 'tresen-ende', radius: 56, label: 'Hunter (schlecht gelaunt)', kind: 'talk', dialogue: diva.id,
          when: all(active(Q), flag('hunter_diva'), time('abend', 'nacht')),
        },
      ],
    },
  },
};

