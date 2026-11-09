// Nebenquest 4 `side-keksalarm` „Keksalarm“ (world.md §6.2 Nr. 4). Dante, ab Dante ♥2. Freya hat Samstag Geburtstag.
// Zutaten: Mehl (Oma Volt, neon-gasse) · Zucker (Barkeeper, high-voltage) · echte Butter (Feinkost Glasarkaden, auch über
// den Lieferanteneingang ohne Drehkreuz; gc-55 [Ausstrahlung 4] „abgelaufen“, kaufen 60 Cr, aus dem Lieferwagen am
// Stufenplatz „leihen“ = Fahndung +1, oder Dexters Schmierfett, essbar, Freya nur +40) · Schokostückchen (Babette oder
// eine Nougatbombe zerhacken) → Ofen-Minispiel (Keksalarm geht IMMER los; gc-56 [Körper 3] Ofen-Tritt = perfekt)
// → Feier am Samstagabend am Geburtstagstisch in Dantes Werkstatt.
import type { ContentPart } from '../../part';
import type { CutsceneDef, DialogueDef, QuestDef } from '../../../modules/contracts';
import {
  active, all, any, dlg, flag, hearts, ich, inactive, item, l, msg, nar, node, noFlag, not, set, time, tschuess, VEX,
} from './_lib';

const Q = 'side-keksalarm';
const DA = 'dante';

const MEHL = flag('keks_mehl');
const ZUCKER = flag('keks_zucker');
const BUTTER = any(flag('keks_butter'), flag('keks_schmierfett'));
const SCHOKO = flag('keks_schoko');
const ZUTATEN = all(MEHL, ZUCKER, BUTTER, SCHOKO);
const GEBACKEN = any(flag('keks_gebacken'), flag('keks_perfekt'));
const SAMSTAGABEND = all({ weekday: 'sa' }, time('abend', 'nacht'));

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: 'Keksalarm',
  summary: 'Freya hat Samstag Geburtstag. Dante will Kekse backen. Echte. Mit Butter. Dafür braucht er dich, einen Plan und starke Nerven.',
  giver: DA,
  act: 1,
  steps: [
    { id: 'mehl', text: 'Mehl: Oma Volt am Kiosk in der Neon-Gasse.', done: MEHL, marker: { map: 'neon-gasse' } },
    { id: 'zucker', text: 'Zucker: der Barkeeper im High Voltage.', done: ZUCKER, marker: { map: 'high-voltage' } },
    {
      id: 'butter', text: 'Echte Butter: Feinkost in den Glasarkaden (Lieferanteneingang hinten am Stufenplatz) – oder kreativ werden.',
      done: BUTTER, marker: { map: 'glasarkaden' },
    },
    { id: 'schoko', text: 'Schokostückchen: Babette hat eine Notreserve. Oder du zerhackst eine Nougatbombe.', done: SCHOKO, marker: { map: 'schrottmarkt' } },
    { id: 'backen', text: 'Backe die Kekse in Dantes Ofen. Der Keksalarm wird losgehen. Er geht immer los.', when: ZUTATEN, done: GEBACKEN, marker: { map: 'dantes-werkstatt' } },
    { id: 'feier', text: 'Feiert Freyas Geburtstag am Samstagabend in Dantes Werkstatt.', when: GEBACKEN, done: flag('keks_feier'), marker: { map: 'dantes-werkstatt' } },
  ],
  reward: {
    xp: 160,
    items: { 'rezept-dantes-kekse': 1 },
    relations: { daria: 50, jakko: 50, dante: 80 },
  },
};

// ---------------------------------------------------------------------------------------------- Dante: Auftrag und Backen

const dante: DialogueDef = dlg('side-keksalarm-dante', [
  node('start', [
    nar('Dante steht am Ofen und hält ein Backblech wie ein Schild. Auf dem Blech: ein Zettel. „FREYA · SAMSTAG · KEKSE · NICHT VERKACKEN“.'),
    l(DA, 'Du! Du hast Hände! Und Beine! Und keine Vorstrafe wegen Brandstiftung in einer Bäckerei! Oder?', 'freude'),
  ], {
    choices: [
      { text: '„Was soll das werden?“', when: inactive(Q), next: 'auftrag' },
      { text: '„Ich hab alles. Mehl, Zucker, Butter, Schoko.“', when: all(active(Q), ZUTATEN, not(GEBACKEN)), next: 'backen' },
      { text: '„Was fehlt noch mal?“', when: all(active(Q), not(ZUTATEN)), next: 'liste' },
      { text: '„Schokostückchen? Ich hack dir eine Nougatbombe klein.“', when: all(active(Q), noFlag('keks_schoko')), requires: item('nougatbombe'), next: 'hacken' },
      tschuess(),
    ],
  }),
  node('auftrag', [
    l(DA, 'Freya hat Samstag Geburtstag. Die kleine Richterin. Sie hat sich gewünscht, und ich zitiere: „Kekse, die nicht vom Boden sind. Rechtsverbindlich.“', 'verlegen'),
    l(DA, 'Also brauche ich echte Zutaten. Mehl von Oma Volt. Zucker vom Barkeeper, der hortet das Zeug für seine Cocktails. Schokostückchen. Und Butter. ECHTE Butter. Nicht dieses Synthzeug, das nach Kerzenwachs schmeckt.', 'signatur'),
    l(DA, 'Echte Butter gibt es nur in der Feinkost in den Glasarkaden. Oberstadt-Preise. Aber hinten am Stufenplatz ist ein Lieferanteneingang, da kommt man ohne Drehkreuz rein. Ich weiß das nicht von mir. Ich weiß das von … mir.'),
    l(DA, 'Und dann backen wir. Und der Keksalarm geht los. Er geht IMMER los. Der Ofen hat Lampenfieber.'),
  ], {
    choices: [
      { text: '„Für Freya? Klar.“', next: 'zusage' },
      { text: '„Ich klau Sachen. Ich back keine.“', next: 'zusage-ruppig' },
    ],
  }),
  node('zusage-ruppig', [l(DA, 'Wo ist da der Unterschied? Beide arbeiten nachts, beide machen sich die Hände schmutzig, beide rennen vor Alarmen weg.', 'freude')], { next: 'zusage' }),
  node('zusage', [l(DA, 'Wunderbar! Samstagabend, hier! Ich deck schon mal den Tisch. Ich hab einen Tisch extra dafür. Der stand früher im Gericht.', 'freude')], {
    effects: [{ startQuest: Q }],
  }),
  node('liste', [
    l(DA, 'Mehl bei Oma Volt, Zucker beim Barkeeper, Butter in den Glasarkaden, Schoko bei Babette. Oder irgendwo, wo Schoko ist. Schoko ist überall, wenn man an sich glaubt.'),
  ]),
  node('hacken', [
    nar('Du legst eine Nougatbombe auf die Werkbank und zerhackst sie mit Dantes Seitenschneider. Dante sieht weg. Es ist ihm zu brutal.'),
    l(DA, 'Ich hab sie gekannt. Sie war ein guter Riegel.', 'trauer'),
  ], { effects: [{ take: 'nougatbombe' }, set('keks_schoko')] }),
  node('backen', [
    nar('Teig. Kneten. Dante summt. Du knetest. Dante summt lauter. Das Blech kommt in den Ofen, die Ofentür schließt mit einem Geräusch, als hätte sie Angst.'),
    nar('Drei Minuten später: PIEP. PIEEEP. PIEEEEEEP. Der Keksalarm. Natürlich.'),
    l(DA, 'DA IST ER! Er geht immer los! Er geht immer viel zu früh los! Er hat ein Problem mit Timing!', 'ueberrascht'),
  ], {
    choices: [
      { text: 'Dem Ofen einen gezielten Tritt verpassen. Genau da, wo’s klemmt.', check: 'gc-56', next: 'tritt' },
      {
        text: 'Ofen aufreißen, Blech retten!', effects: [{
          minigame: 'akt-keksalarm', level: 2, key: 'keksalarm-freya', label: 'Freyas Geburtstagskekse',
          win: [set('keks_gebacken'), msg('Blech gerettet! Knusprig, golden, nur ein Keks leicht schwarz. Den isst Dante sofort, aus Prinzip.')],
          lose: [set('keks_gebacken'), msg('Das Blech fällt. Dante, schon in der Hocke: „DREI-SEKUNDEN-REGEL!“ Zwölf Kekse gerettet, alle mit Staub-Akzent. Geht trotzdem.')],
        }],
      },
    ],
  }),
  node('tritt', [
    nar('Du trittst. Der Ofen hustet, das Piepen erstirbt, die Temperaturanzeige springt auf genau die richtige Zahl. Zwölf perfekte Kekse.'),
    ich('So hat das meine Oma auch gemacht.'),
    l(DA, 'Deine Oma war ein Genie. Und ein Schläger. Ich hätte sie geliebt.', 'freude'),
  ], { effects: [set('keks_perfekt')] }),
]);

// ---------------------------------------------------------------------------------------------- Mehl, Zucker, Schoko

const oma: DialogueDef = dlg('side-keksalarm-oma', [
  node('start', [
    l('oma-volt', 'Mehl? Für Dante? Für Freyas Geburtstag?', 'neutral'),
    l('oma-volt', 'Kindchen, für Freya geb ich dir das Mehl, den Sack und meinen Segen. Aber sag Dante: Wenn er wieder ein Blech fallen lässt, nehme ich ihn persönlich in die Mangel.', 'freude'),
  ], {
    choices: [
      { text: '„Danke, Oma.“', next: 'gib' },
      { text: '„Willst du nicht mitfeiern?“', next: 'mitfeiern' },
    ],
  }),
  node('mitfeiern', [l('oma-volt', 'Ich? Bei Dante? Da wird gesungen. Ich singe nicht. Ich hab 2062 gesungen, danach gab’s einen Stromausfall. Seitdem nicht mehr.', 'signatur')], { next: 'gib' }),
  node('gib', [nar('Oma Volt wuchtet einen Sack Mehl auf die Theke. „Sorte 405 – NICHT FÜR WAFFEN“ steht darauf.')], { effects: [set('keks_mehl')] }),
]);

const barkeeper: DialogueDef = dlg('side-keksalarm-barkeeper', [
  node('start', [
    nar('Der Barkeeper poliert ein Glas. Du fragst nach Zucker. Er hört auf zu polieren. Das ist bei ihm das Äquivalent zu einem Wutanfall.'),
    l('barkeeper', 'Zucker für ein Kind / das am Samstag älter wird / nimm. Doch sag es nicht.'),
  ], {
    choices: [
      { text: '„Wem soll ich es nicht sagen?“', next: 'wem' },
      { text: '„Danke. Du bist ein Weichei mit Klinge.“', next: 'gib' },
    ],
  }),
  node('wem', [l('barkeeper', 'Hunter zählt den Zucker / jeden Abend, jedes Korn / heute zählt er falsch.')], { next: 'gib' }),
  node('gib', [nar('Er schiebt dir eine Dose Zucker über den Tresen. Auf dem Deckel steht in Kinderschrift „FÜR NOTFELLE“. Das ist offensichtlich ein Notfell.')], {
    effects: [set('keks_zucker')],
  }),
]);

const babette: DialogueDef = dlg('side-keksalarm-babette', [
  node('start', [
    l('babette-bao', 'Schokostückchen? Für Freya? Komm her, Schätzchen.', 'freude'),
    nar('Babette verschwindet unter der Theke und kommt mit einer Blechdose wieder hoch. Sie öffnet sie wie eine Schatzkiste.'),
    l('babette-bao', 'Meine Notreserve. Aus der alten Küstenstadt. Die hab ich gerettet, als das Wasser kam. Die Schokolade und meine Oma. In der Reihenfolge.'),
    l('babette-bao', 'Für das Mädchen. Und sag Dante: Wenn die Kekse nicht schmecken, hört er von mir.'),
  ], { effects: [set('keks_schoko')] }),
]);

// ---------------------------------------------------------------------------------------------- Butter

const rampe: DialogueDef = dlg('side-keksalarm-rampe', [
  node('start', [
    nar('An der Feinkost-Rampe stapelt ein junger Mann im weißen Kittel Kühlboxen. Auf einer steht „BUTTER · ECHT · KUH · 2086“. Sie glänzt, als wäre sie aus Gold.'),
    l('narrator', '„Lieferanten? Kunden? Diebe?“, fragt der Mann, ohne aufzusehen.'),
  ], {
    choices: [
      {
        text: '„Die Packung da hat einen Knick. Die könnt ihr oben eh nicht mehr verkaufen. Abgelaufen, quasi. Ich nehm sie euch ab, aus reiner Nächstenliebe.“',
        check: 'gc-55', next: 'abgelaufen',
      },
      { text: 'Die Butter kaufen (60 Credits).', requires: { credits: 60 }, effects: [{ credits: -60 }], next: 'gekauft' },
      tschuess('„Nur geguckt.“'),
    ],
  }),
  node('abgelaufen', [
    nar('Der Mann sieht die Packung an. Er sieht dich an. Er sieht wieder die Packung an. Er knickt sie, ganz leicht, mit dem Daumen.'),
    l('narrator', '„Abgelaufen. Eindeutig. Schrecklich. Weg damit.“ Er zwinkert nicht. Er muss nicht.'),
  ], { effects: [set('keks_butter')] }),
  node('gekauft', [nar('Sechzig Credits für ein Stück Butter. Du hältst es in der Hand wie ein rohes Ei aus Gold. In der Unterstadt wäre das eine Mitgift.')], {
    effects: [set('keks_butter')],
  }),
]);

const lieferwagen: DialogueDef = dlg('side-keksalarm-lieferwagen', [
  node('start', [
    nar('Hinterm Tor am Lieferhof parkt ein Feinkost-Lieferwagen. Die Hecktür steht einen Spalt offen. Kühle Luft. Butterduft. Kein Fahrer.'),
  ], {
    choices: [
      { text: 'Eine Packung Butter „leihen“. (Fahndung +1)', next: 'geliehen' },
      tschuess('(Nicht heute.)'),
    ],
  }),
  node('geliehen', [
    nar('Du greifst rein, steckst eine Packung ein und schließt die Tür sehr leise. Hinter dir piept etwas. Eine Kamera. Natürlich. Die Oberstadt hat für alles eine Kamera.'),
    ich('Ich geb sie zurück. Als Keks.'),
  ], { effects: [set('keks_butter'), { wanted: 1 }, msg('Eine Kamera am Lieferhof hat dich erwischt. Ein Butterdieb. Peinlicher geht’s nicht.')] }),
]);

const dexter: DialogueDef = dlg('side-keksalarm-dexter', [
  node('start', [
    l('dexter', 'Butter? Für Kekse? Ich hab was Besseres! Schmierfett! Lebensmittelecht! Steht drauf! Ich hab’s draufgeschrieben!', 'freude'),
    nar('Dexter hält eine Dose hoch. „FETT (ESSBAR?)“, mit Edding.'),
  ], {
    choices: [
      { text: 'Das Schmierfett nehmen. Freya merkt das nie. Hoffentlich.', next: 'nehmen' },
      tschuess('„Ich glaub, ich such weiter.“'),
    ],
  }),
  node('nehmen', [l('dexter', 'Sehr gute Wahl! Das schmiert. Auch innerlich. Das ist eine Eigenschaft!', 'freude')], {
    effects: [set('keks_schmierfett'), msg('Dexters Schmierfett, angeblich essbar. Die Kekse werden … interessant.')],
  }),
]);

// ---------------------------------------------------------------------------------------------- Feier

const feier: DialogueDef = dlg('side-keksalarm-feier', [
  node('start', [
    nar('Dantes Werkstatt, Samstagabend. Lichterketten zwischen den Röhrenmonitoren, eine Platte mit Geburtstagsliedern in Moll, ein Tisch mit Tischdecke. Auf der Tischdecke: die Kekse.'),
    l('daria', 'Wir sind hier, weil das Essen gratis ist. Und wegen Freya. In der Reihenfolge.', 'signatur'),
    l('jakko', 'Das riecht so gut wie … wie … ich hab keinen Vergleich. Das riecht wie das Beste, was ich je gerochen hab.', 'freude'),
    l('freya', 'Ich habe beantragt, dass heute niemand flucht. Der Antrag ist angenommen. Mit einer Stimme. Meiner.', 'neutral'),
    l(DA, 'HAPPY BIRTHDAY, FRAU RICHTERIN! Wir haben echte Kekse! Von keinem Boden! Rechtsverbindlich!', 'freude'),
  ], {
    choices: [
      { text: 'Freya den ersten Keks reichen.', when: all(flag('keks_perfekt'), noFlag('keks_schmierfett')), next: 'perfekt' },
      { text: 'Freya den ersten Keks reichen.', when: all(flag('keks_gebacken'), noFlag('keks_perfekt'), noFlag('keks_schmierfett')), next: 'gut' },
      { text: 'Freya den ersten Keks reichen. Und beten.', when: flag('keks_schmierfett'), next: 'schmierfett' },
    ],
  }),
  node('perfekt', [
    nar('Freya beißt ab. Sie kaut. Sie schließt die Augen. Sie öffnet sie wieder, und darin steht ein Urteil.'),
    l('freya', 'Freispruch. In allen Punkten. Und Dante bekommt Bewährung für den Keks von 2084.', 'freude'),
  ], { effects: [{ relation: 'freya', delta: 100 }], next: 'kerzen' }),
  node('gut', [
    l('freya', 'Leichte Staubnote. Mildernde Umstände. Ich erkläre die Kekse für köstlich.', 'freude'),
  ], { effects: [{ relation: 'freya', delta: 100 }], next: 'kerzen' }),
  node('schmierfett', [
    nar('Freya beißt ab. Sie kaut. Sehr lange. Ihr Gesicht macht Geräusche, die ein Gesicht nicht machen sollte.'),
    l('freya', 'Das … schmeckt nach Zahnrad.', 'besorgt'),
    l('freya', 'Aber es ist der Gedanke, der zählt. Juristisch gesehen ist der Gedanke sogar das Einzige, was zählt. Danke.', 'verlegen'),
  ], { effects: [{ relation: 'freya', delta: 40 }], next: 'kerzen' }),
  node('kerzen', [
    nar('Dante steckt eine Kerze in den größten Keks. Sie ist eigentlich eine Glühbirne mit Batterie. Brandschutz.'),
    l(DA, 'Wünsch dir was! Aber nichts Teures, wir sind arm!', 'freude'),
    nar('Freya pustet. Die Glühbirne geht aus, weil Dante heimlich den Schalter drückt. Alle klatschen. Jakko klatscht mit einem Keks in jeder Hand.'),
  ], {
    choices: [
      { text: '„Alles Gute, Freya.“', next: 'schluss' },
      { text: '„Was hast du dir gewünscht?“', next: 'wunsch' },
      { text: '[Vex] „Wenn du mal ein Paket ausliefern willst, ohne dass einer meckert: Schrapnell-Kuriere. Für dich gratis.“', when: VEX, next: 'vex' },
    ],
  }),
  node('wunsch', [l('freya', 'Dass alle hier nächstes Jahr wieder da sind. Das ist kein Wunsch. Das ist eine Anordnung.', 'zaertlich')], { next: 'schluss' }),
  node('vex', [
    l('freya', 'Ich nehme das Angebot an. Unter Vorbehalt. Kuriere fluchen viel.', 'neutral'),
    ich('Ich fluche nie. Scheiße. Okay, einmal.'),
    l('freya', 'Fluchdose.', 'signatur'),
  ], { next: 'schluss' }),
  node('schluss', [
    nar('Später. Die Kinder schlafen auf dem Sofa, auf Dantes Mantel, auf einander. Captain Kuschel liegt auf Freyas Bauch, die Ohren hoch.'),
    l(DA, 'Weißt du, was das Beste an Keksen ist? Man kann sie nicht digitalisieren.', 'zaertlich'),
  ], { effects: [set('keks_feier'), { cutscene: 'side-keksalarm-nacht' }] }),
]);

const nacht: CutsceneDef = {
  id: 'side-keksalarm-nacht',
  title: 'Keksalarm',
  beats: [
    { image: 'black', caption: 'Lötgassen, kurz nach Mitternacht. In Dantes Werkstatt brennt noch Licht.', fade: 'in', hold: 1400 },
    { image: 'black', caption: 'Auf dem Sofa schlafen drei Kinder. Auf dem Tisch liegt ein letzter Keks. Niemand traut sich, ihn zu essen.', hold: 1600 },
    { image: 'black', caption: 'Der Ofen piept einmal, ganz leise. Diesmal ohne Grund. Vielleicht vor Glück.', fade: 'out', hold: 1600 },
  ],
};

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: {
    [dante.id]: dante, [oma.id]: oma, [barkeeper.id]: barkeeper, [babette.id]: babette,
    [rampe.id]: rampe, [lieferwagen.id]: lieferwagen, [dexter.id]: dexter, [feier.id]: feier,
  },
  cutscenes: { [nacht.id]: nacht },
  mapAdditions: {
    'dantes-werkstatt': {
      hotspots: [
        {
          id: 'q-keksalarm-dante', at: 'ofen', radius: 60, label: 'Dante und das Backblech', kind: 'talk', dialogue: dante.id,
          when: all(hearts(DA, 2), any(all(inactive(Q), time('morgen', 'tag', 'abend')), all(active(Q), not(GEBACKEN)))),
        },
        {
          id: 'q-keksalarm-feier', at: 'geburtstagstisch', radius: 64, label: 'Freyas Geburtstag feiern', kind: 'talk', dialogue: feier.id,
          when: all(active(Q), GEBACKEN, noFlag('keks_feier'), SAMSTAGABEND),
        },
        {
          id: 'q-keksalarm-tisch', at: 'geburtstagstisch', radius: 64, label: 'Geburtstagstisch', kind: 'look',
          when: all(active(Q), GEBACKEN, noFlag('keks_feier'), not(SAMSTAGABEND)),
          lines: [nar('Ein Tisch, gedeckt mit einer Tischdecke aus einem Gerichtssaal. Ein Schild: „SAMSTAG ABEND · FREYA · BITTE PÜNKTLICH (FREYA BESTEHT DARAUF)“.')],
        },
      ],
    },
    'neon-gasse': {
      hotspots: [
        {
          id: 'q-keksalarm-oma', at: 'kiosk', radius: 60, label: 'Oma Volt: Mehl für Freya', kind: 'talk', dialogue: oma.id,
          when: all(active(Q), not(MEHL), time('morgen', 'tag', 'abend')),
        },
      ],
    },
    'high-voltage': {
      hotspots: [
        {
          id: 'q-keksalarm-zucker', at: 'tresen', radius: 60, label: 'Barkeeper: Zucker für Freya', kind: 'talk', dialogue: barkeeper.id,
          when: all(active(Q), not(ZUCKER)),
        },
      ],
    },
    schrottmarkt: {
      hotspots: [
        {
          id: 'q-keksalarm-babette', at: 'garkueche', radius: 60, label: 'Babette: Schokostückchen', kind: 'talk', dialogue: babette.id,
          when: all(active(Q), not(SCHOKO), time('morgen', 'tag', 'abend')),
        },
        {
          id: 'q-keksalarm-dexter', at: 'dexter-buero', radius: 60, label: 'Dexter: „Butter“', kind: 'talk', dialogue: dexter.id,
          when: all(active(Q), not(BUTTER), time('tag', 'abend', 'nacht')),
        },
      ],
    },
    glasarkaden: {
      hotspots: [
        {
          id: 'q-keksalarm-rampe', at: 'feinkost-rampe', radius: 60, label: 'Butter an der Feinkost-Rampe', kind: 'talk', dialogue: rampe.id,
          when: all(active(Q), not(BUTTER), time('morgen', 'tag')),
        },
      ],
    },
    stufenplatz: {
      hotspots: [
        {
          id: 'q-keksalarm-lieferwagen', at: 'lieferhof-tor', radius: 60, label: 'Feinkost-Lieferwagen', kind: 'talk', dialogue: lieferwagen.id,
          when: all(active(Q), not(BUTTER)),
        },
      ],
    },
  },
};
