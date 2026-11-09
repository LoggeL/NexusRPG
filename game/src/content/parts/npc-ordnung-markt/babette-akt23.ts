// Babette Bao in Akt 2, Akt 3 und im Nachspiel (world.md §4.4, act23.json he-babette-bao-8/10).
// Kein eigener Inhaltsteil: babette-bao.ts holt Menü-Ergänzung, Phasen, Fahrplan-Vorsatz und he-8/10 von hier.
import type { ContentPart } from '../../part';
import type { DialogueDef, ScheduleEntry, TalkDef } from '../../../modules/contracts';
import {
  type Menue, AKT2_NUR, AKT3_NACHT, ARIA_GECHIPPT, COUNTDOWN_DONE, ENDE_3B, ENDE_MEER, ENDE_NEXUS, EPILOG_FREI, MASTER,
  NYRA_WEG, PARTY_VORB, dialog, erz, flag, herz, ich, knoten, phasen, pruefung, sprecher,
} from './_helfer';

const B = sprecher('babette-bao');
const A = sprecher('aria');
const RI = sprecher('richter');
const DX = sprecher('dexter');
const JA = sprecher('jakko');
const FR = sprecher('freya');

// ---------------------------------------------------------------------------------------------- Menü (ab Akt 2)

export const MENUE_23: Menue = {
  choices: [
    {
      text: 'Brauchst du Hilfe in der Notküche?', tag: '[Suppenküche]', next: 'b23-notkueche',
      when: { all: [AKT2_NUR, { time: ['morgen', 'tag'] }, { notFlag: 'heute_babette_notkueche' }] },
      effects: [
        flag('heute_babette_notkueche'),
        {
          minigame: 'akt-suppenkueche', level: 2, key: 'babette-notkueche', label: 'Notküche bei Babette',
          win: [herz('babette-bao', 20), { credits: 30 }, { rep: 'unterstadt', delta: 1 }, { message: 'Babette: „Siebzig Teller, kein einziger zurück. Du bist eingestellt. Unbezahlt. Mit Nachschlag.“' }],
          lose: [herz('babette-bao', 5), { message: 'Babette: „Die Hälfte auf dem Boden, die andere Hälfte in den Kindern. Zählt trotzdem.“' }],
        },
      ],
    },
    {
      text: 'Warum essen die Gechippten eigentlich nichts mehr?', next: 'b23-chippen',
      when: { all: [AKT2_NUR, { notFlag: 'babette_23_chippen' }] }, effects: [flag('babette_23_chippen'), herz('babette-bao', 10)],
    },
  ],
  nodes: [
    knoten('b23-notkueche', [
      erz('Babette drückt dir eine Kelle und einen Kessel Ingwerbrühe in die Hand. Die Schlange reicht bis zur Waage.'),
      B('Erst die Kinder, dann die Alten, dann die, die Ärger machen. Die kriegen den Rest. Mit Extrapfeffer.', 'signatur'),
    ], { next: 'menue' }),
    knoten('b23-chippen', [
      B('Chrome 10 sagt ihnen, wann sie satt sind. Und es sagt’s zu früh. Die vergessen einfach das Essen. Stehen da und lächeln, bis sie umkippen.', 'wut'),
      B('Also stell ich ihnen die Schüssel direkt unter die Nase. Riechen tun sie noch. Den Geruch kriegt Quantum nicht weggechippt. Noch nicht.'),
    ], { choices: [{ text: 'Noch was, Babette.', next: 'menue' }, { text: 'Danke, Babette. Bis später.' }] }),
  ],
};

// ---------------------------------------------------------------------------------------------- Herz-Ereignis 8

/** ♥8 (Garküche, 4 Uhr früh, act2): das ganze Rezept – und eine Hygienedrohne. */
const he8 = dialog('he-babette-bao-8', [
  knoten('start', [
    erz('Vier Uhr morgens. Die Garküche ist dunkel bis auf eine Lampe. Über dem Schrottmarkt sirrt eine Quantum-Drohne ihre Runde. Babette hat dich herbestellt und reicht dir eine Schürze.'),
    B('Heute lernst du es. Das ganze Rezept. Auch den Teil, den ich niemandem sage.', 'neutral'),
    ich('Warum gerade jetzt?'),
    B('Weil sie draußen Leute chippen und die Leute danach nicht mehr wissen, wie Ingwer riecht. Wenn mir was passiert, muss einer wissen, wie das geht. Und Dexter verbrennt Wasser.', 'trauer'),
    B('Teig dreimal falten. Ruhen lassen, bis er dich ansieht. Füllung mit den Händen, nicht mit dem Löffel.'),
  ], {
    choices: [
      {
        text: 'Den Teig selbst machen, unter ihren Augen.', tag: '[Kochen]', next: 'gekocht',
        effects: [{
          minigame: 'akt-kochen', level: 3, key: 'babette-rezept', label: 'Das ganze Rezept',
          win: [herz('babette-bao', 30), { message: 'Babette: „Der Teig hat dich angesehen. Und er war zufrieden.“' }],
          lose: [herz('babette-bao', 10), { message: 'Babette: „Klebt. An dir, am Tisch, an der Decke. Mutter hätte gelacht.“' }],
        }],
      },
      { text: 'Zuschauen und jeden Handgriff mitschreiben.', next: 'zugeschaut', effects: [herz('babette-bao', 20)] },
      { text: '„Ich hab ihn schon mal gemacht. Bei Rudi.“', when: { wonMinigame: 'rudi-kochen' }, next: 'rudi', effects: [herz('babette-bao', 20)] },
    ],
  }),
  knoten('gekocht', [
    erz('Mehl überall. In deinen Haaren, in Babettes Augenbrauen, auf der Katze, die nicht euch gehört. Aber auf dem Blech liegen zwölf Dampfnudeln, und elf davon sehen aus wie Dampfnudeln.'),
  ], { next: 'geheimnis' }),
  knoten('zugeschaut', [
    erz('Du schreibst mit. Drei Seiten. Babette liest sie, streicht die Hälfte durch und schreibt am Rand: „Gefühl! GEFÜHL!“ Dann gibt sie sie dir zurück.'),
  ], { next: 'geheimnis' }),
  knoten('rudi', [
    B('Rudi? Der Rudi aus der Ödnis? Der seine Pfannkuchen an die Decke wirft? Hm.', 'signatur'),
    B('Gut. Dann weißt du schon, wie man Fehler macht. Das ist die halbe Küche.'),
  ], { next: 'geheimnis' }),
  knoten('geheimnis', [
    erz('Sie beugt sich vor und flüstert dir das Geheimnis ins Ohr. Es ist absurd einfach. Es ist genial. Es hat mit Salzpflaumen und Geduld zu tun, und mit beidem mehr als gedacht.'),
    B('Wenn du das weitersagst, finde ich dich. Überall. Ich habe Kontakte bis in die Oberstadt. Über die Küchen.', 'signatur'),
    erz('In dem Moment schwebt eine weiße Drohne durch den Vorhang. Ein grünes Licht tastet über die Bleche. „HYGIENEKONTROLLE QUANTUM. UNREGISTRIERTE NAHRUNG. BESCHLAGNAHME IN DREISSIG SEKUNDEN.“'),
    B('Beschlagnahme? MEINE NUDELN? Du fliegender Klodeckel!', 'wut'),
  ], {
    choices: [
      {
        text: 'Die Drohne von hinten aufschrauben.', next: 'gehackt',
        check: pruefung('he-babette-bao-8-drohne', 'technik', 5, ['hacken', 'reparieren']), effects: [herz('babette-bao', 30)],
      },
      {
        text: '„Das ist eine Testküche. Zertifiziert. Lies das Siegel.“ Auf den Mehlsack zeigen.', next: 'gelabert',
        check: pruefung('he-babette-bao-8-siegel', 'ausstrahlung', 5, ['luegen', 'ueberzeugen']), effects: [herz('babette-bao', 30)],
      },
      { text: 'Der Drohne eine Dampfnudel als „Probe“ geben.', next: 'probe', effects: [herz('babette-bao', 20)] },
    ],
  }),
  knoten('gehackt', [
    erz('Zwei Schrauben, ein Kabel, ein Funke. Die Drohne zirpt, dreht sich einmal um sich selbst und meldet: „NAHRUNG ZERTIFIZIERT. LECKER.“ Dann schwebt sie hinaus und erzählt es dem ganzen Markt.'),
    B('Lecker. Die Maschine hat lecker gesagt. Das hänge ich mir an die Wand.', 'freude'),
  ], { next: 'ende' }),
  knoten('gelabert', [
    erz('Die Drohne scannt den Mehlsack. „Weizen Typ 550“. Sie überlegt hörbar. Dann: „SIEGEL ANERKANNT. ENTSCHULDIGUNG FÜR DIE STÖRUNG.“ Sie verbeugt sich, so gut eine Kugel sich verbeugen kann.'),
    B('Typ 550. Ein Siegel. Du hast einer Quantum-Drohne Mehl verkauft. Ich bin so stolz, ich könnte dich panieren.', 'freude'),
  ], { next: 'ende' }),
  knoten('probe', [
    erz('Die Drohne saugt die Dampfnudel in ein Probenfach. Es knirscht. Lange Pause. „PROBE … POSITIV. WEITERE PROBEN ERFORDERLICH.“ Sie fliegt nicht weg. Sie wartet.'),
    B('Jetzt haben wir eine Stammkundin. Ohne Mund. Und ohne Geld. Herzlichen Glückwunsch, Schätzchen, du hast Dexter in Drohnenform erschaffen.', 'signatur'),
  ], { next: 'ende' }),
  knoten('ende', [
    B('So. Jetzt weißt du alles. Koch es für die, die du magst. Und für die, die vergessen haben, wie es schmeckt.', 'neutral'),
  ], {
    effects: [flag('rezept_dampfnudel_babette'), { give: 'bao-dampfnudel', qty: 3 }, { xp: 120 }, herz('babette-bao', 20)],
    choices: [
      { text: '„Ich nehm’s mit ins Grab, Babette.“', next: 'grab' },
      { text: '„Dir passiert nichts. Dafür sorg ich.“', next: 'schutz', effects: [herz('babette-bao', 10)] },
    ],
  }),
  knoten('grab', [B('Ins Grab nicht. Ins Leben. Und jetzt raus, die Schlange wird lang.', 'freude')]),
  knoten('schutz', [B('Große Worte für jemanden mit Mehl auf der Nase. … Danke, Schätzchen. Ich hab’s gehört.', 'trauer')]),
]);

// ---------------------------------------------------------------------------------------------- Herz-Ereignis 10

/** ♥10 (Garküche, Ruhetag-Abend, act2 nach ♥8): Familienessen, Trinkspruch, der Löffel der Mutter. */
const he10 = dialog('he-babette-bao-10', [
  knoten('start', [
    erz('Montagabend. Ruhetag, aber die Garküche ist voll. Babette hat die Tische an der Garküchenbank zusammengeschoben: der Richter, Dexter, die Kinder aus dem Nest, Leute aus der Crew. Eine Lichterkette, drei Töpfe, ein Kessel Ingwerbrühe, so groß wie ein Mülleimer.'),
    B('Familienessen. Jeder, der heute hier sitzt, hat mir irgendwann geholfen, nicht aufzugeben. Also esst. Das ist ein Befehl.', 'freude'),
    RI('Schuldig. Der Völlerei schuldig. Ich beantrage Nachschlag.'),
    DX('Ich hab Nachtisch mitgebracht! Gekauft! Mit Geld! Mit meinem eigenen!', 'freude'),
  ], {
    choices: [
      { text: 'Auf den leeren Stuhl am Kopfende sehen.', when: ARIA_GECHIPPT, next: 'stuhl' },
      { text: 'Aria an den Kopf des Tisches winken.', when: { any: [COUNTDOWN_DONE, { flag: 'aria_entkommen' }] }, next: 'aria' },
      { text: 'Zugreifen. Mit beiden Händen.', next: 'trinkspruch' },
    ],
  }),
  knoten('stuhl', [
    erz('Ein Stuhl am Kopfende bleibt leer. Babette hat einen Teller hingestellt, ein Glas, eine Serviette, auf der in Lippenstift „A.“ steht.'),
    B('Der bleibt frei. Bis sie wieder isst. Bis sie wieder flucht und ihre Nudeln aus der Hand isst, wie ein Tier.', 'trauer'),
  ], { next: 'trinkspruch' }),
  knoten('aria', [
    A('Babette. Ich hab Hunger. Ich hab tagelang nichts Richtiges gegessen und Leuten wehgetan. Wo ist die große Schüssel?'),
    B('Am Kopfende, Kind. Wo sonst.', 'freude'),
  ], { next: 'trinkspruch' }),
  knoten('trinkspruch', [
    erz('Irgendwann klopft Babette mit dem Löffel gegen ihren Becher. Dann sieht sie dich an. Alle sehen dich an.'),
    B('Du sagst was, Schätzchen. Ich hab heute schon genug geweint. Ins Essen.', 'signatur'),
  ], {
    choices: [
      {
        text: 'Einen Trinkspruch halten, bei dem keiner trocken bleibt.', next: 'rede',
        check: pruefung('he-babette-bao-10-trinkspruch', 'ausstrahlung', 6, ['ueberzeugen', 'auftreten']), effects: [herz('babette-bao', 40), { rep: 'unterstadt', delta: 2 }],
      },
      { text: '„Auf Babette. Und auf Möwenhafen.“ Und dann trinken.', next: 'kurz', effects: [herz('babette-bao', 30)] },
      { text: 'Freya den Trinkspruch halten lassen.', next: 'freya', effects: [herz('babette-bao', 30), herz('freya', 20)] },
    ],
  }),
  knoten('rede', [
    ich('Auf eine Frau, die ihren Herd aufs Dach getragen hat. Die das Wasser nicht gewinnen ließ. Die Quantum-Drohnen mit Kochlöffeln vertreibt und uns allen das Gefühl gibt, dass irgendwo jemand eine Schüssel für uns warmhält.'),
    ich('Auf Babette. Und darauf, dass wir alle irgendwann am Meer sitzen und uns von Möwen beklauen lassen.'),
    erz('Stille. Dann schnieft der Richter. Dann Dexter. Dann alle. Babette schlägt die Schürze vors Gesicht.'),
  ], { next: 'loeffel' }),
  knoten('kurz', [erz('„Auf Babette!“ – „AUF BABETTE!“ Dexter verschluckt sich am Nachtisch. Jakko klopft ihm auf den Rücken, bis ein Keks herausfliegt und in der Brühe landet. Niemand sagt etwas. Es ist ein guter Abend.')], { next: 'loeffel' }),
  knoten('freya', [
    FR('Ähm. Also. Babette hat uns jeden Tag was gegeben, auch wenn wir nicht bezahlt haben. Und auch wenn wir geklaut haben. Und Jakko hat oft geklaut.'),
    JA('Hey!'),
    FR('Darum. Auf Babette. Sie ist die beste Mama von allen, die nicht unsere Mama ist.'),
    erz('Babette steht auf, geht um den Tisch herum und drückt Freya so fest, dass ihr der Becher aus der Hand fällt.'),
  ], { next: 'loeffel' }),
  knoten('loeffel', [
    erz('Als alle satt sind und Dexter unter dem Tisch eingeschlafen ist, nimmt Babette den alten schwarzen Holzlöffel vom Haken über dem Herd und drückt ihn dir in die Hand.'),
    B('Der Löffel meiner Mutter. Er hat die Möwen verjagt und mich großgezogen. Jetzt passt er auf dich auf.', 'trauer'),
  ], {
    effects: [{ give: 'babettes-kochloeffel' }, flag('babette_familienessen'), { xp: 200 }],
    choices: [
      { text: '„Ich halt ihn in Ehren, Babette.“', next: 'ehren' },
      { text: '„Und wenn wir das Meer finden, bringe ich ihn zurück. Damit du da kochst.“', when: { flag: 'babette_meer_versprochen' }, next: 'meer' },
    ],
  }),
  knoten('ehren', [B('In Ehren? Du sollst damit kochen, Schätzchen! Und Leute verhauen, die schlecht über meine Nudeln reden.', 'signatur')], { effects: [herz('babette-bao', 50)] }),
  knoten('meer', [B('Du hast es nicht vergessen. Du dummes, wunderbares Kind. Dann halt’s auch.', 'trauer')], { effects: [herz('babette-bao', 50), flag('babette_meer_zweimal')] }),
]);

// ---------------------------------------------------------------------------------------------- Phasen und Fahrplan

export function akt23(M: Menue): { dialogues: DialogueDef[]; talk: TalkDef[]; schedule: ScheduleEntry[]; teil: ContentPart } {
  const p = phasen('babette-bao', 'babette-bao-23', M, [
    {
      id: 'master', when: MASTER, ohneMenue: true,
      gruss: [
        B('Setz dich. Iss. Ich koch für jeden. Auch für den, der die Stadt eingesperrt hat.', 'trauer'),
        erz('Sie stellt eine Schüssel hin und sieht dich nicht an. Die Brühe ist perfekt. Sie hat kein Salz hineingetan. Du weißt genau, warum.'),
        B('Und dann geh. Bevor die Kinder dich sehen.'),
      ],
    },
    {
      id: 'ende-3b', when: ENDE_3B, einmal: true, effects: [{ give: 'bao-dampfnudel', qty: 2 }],
      gruss: [
        B('Komm her. Nein, nicht reden. Herkommen. Drücken. Essen. In der Reihenfolge.', 'freude'),
        B('Du warst weg, obwohl du da warst. Das kenn ich von den Gechippten. Aber du bist zurückgekommen. Du hast dich selbst zurückgeholt. Das kriegt eine Extraportion.'),
      ],
    },
    {
      id: 'ende-nexus', when: ENDE_NEXUS, einmal: true,
      gruss: [
        B('Die Stadt hat mich gefragt, ob sie mir beim Einkauf helfen kann. Die Stadt! Ich hab gesagt: Lern erstmal, wie Ingwer riecht. Sie hat gesagt, sie arbeitet dran.', 'signatur'),
        B('Die Notküche ist zu. Keiner braucht sie mehr. Ich hab geweint. Vor Freude. Und ein bisschen, weil ich keinen mehr füttern darf, der’s nicht will.'),
      ],
    },
    {
      id: 'ende-meer', when: ENDE_MEER, einmal: true,
      gruss: [
        B('Ich war am Meer. Am echten. Es ist blau, Schätzchen. Blau! Und die Möwen klauen. Genau wie früher.', 'freude'),
        B('Ich stell montags einen Topf an die Wasserlinie. Ruhetag am Meer. Komm vorbei. Bring Hunger mit. Und den Löffel.'),
      ],
    },
    {
      id: 'epilog', when: EPILOG_FREI, taeglich: true,
      gruss: [B('Na, Schätzchen? Siehst gut aus. Zu dünn, aber gut. Was darf’s sein? Ich hab eine neue Füllung. Krabbe. Karl weiß nichts davon.', 'freude')],
      plausch: [B('Die Kinder aus dem Nest gehen jetzt zur Schule. Jakko kocht in der Pause für alle. Er macht den Teig falsch. Ich sag’s ihm nicht. Noch nicht.', 'signatur')],
    },
    {
      id: 'akt3', when: AKT3_NACHT, einmal: true, effects: [{ give: 'bao-dampfnudel', qty: 3 }, { heal: 20 }],
      gruss: [
        B('Heute Nacht, hm? Ich seh’s dir an. Du hast den Blick von jemandem, der nicht weiß, ob er morgen frühstückt.', 'trauer'),
        B('Hier. Drei Stück. Eine für dich, eine für die Crew, eine für den, der dich da oben am meisten nervt. Mit vollem Mund schreit es sich schlecht.'),
      ],
    },
    {
      id: 'party', when: PARTY_VORB, taeglich: true,
      gruss: [B('Releaseparty, ja? Häppchen aus der Oberstadt. Lachs, der nie im Wasser war. Iss vorher bei mir. Sonst fällst du um, bevor’s spannend wird.', 'signatur')],
      plausch: [B('Wenn dich jemand fragt, wer du bist: lächeln, nicken, nichts essen, was blinkt. Oben blinkt das Essen. Das ist kein Witz.', 'neutral')],
    },
    {
      id: 'gerettet', when: { all: [COUNTDOWN_DONE, { notFlag: 'epilog' }] }, einmal: true, effects: [herz('babette-bao', 20)],
      gruss: [
        B('Sie war hier. Aria. Hat drei Schüsseln gegessen, ohne Luft zu holen, und mich „Mama Bao“ genannt. Dann hat sie sich geschämt und Dexter bedroht.', 'freude'),
        B('Ich hab ihr den Stuhl wieder hingestellt. Den am Kopfende. Danke, {name}.'),
      ],
    },
    {
      id: 'nyra', when: NYRA_WEG, taeglich: true,
      gruss: [B('Das Mädchen mit den Haarnadeln. Die immer die Dampfnudel mit Pflaume genommen hat. Nyra. Ich leg jeden Morgen eine zurück. Falls.', 'trauer')],
      plausch: [B('Hol sie raus, Schätzchen. Ich wärm sie so lange.', 'trauer')],
    },
    {
      id: 'chip', when: ARIA_GECHIPPT, taeglich: true,
      gruss: [B('Aria kommt nicht mehr. Sie stand gestern auf der anderen Straßenseite und hat gelächelt. Aria lächelt nicht so. Aria grinst. Mit Zähnen.', 'trauer')],
      plausch: [B('Ich hab ihr eine Schüssel rübergestellt. Sie hat sie nicht angefasst. Aber sie hat gerochen. Ich hab’s gesehen. Ganz innen ist sie noch da.', 'neutral')],
    },
    {
      id: 'akt2', when: AKT2_NUR, taeglich: true,
      gruss: [B('Nicht jetzt, Schätzchen, ich hab siebzig Leute in der Schlange und eine Drohne über dem Topf. Was brauchst du? Schnell!', 'wut')],
      plausch: [B('Quantum will meine Garküche „registrieren“. Ich hab dem Herrn im Anzug eine Dampfnudel gegeben. Er hat sie nicht gegessen. Ich trau keinem, der nicht isst.', 'signatur')],
    },
  ]);

  const schedule: ScheduleEntry[] = [
    // Nachspiel: Ruhetag am Meer (vor den Montagseinträgen aus Akt 1).
    { slot: ['morgen', 'tag'], days: ['mo'], when: EPILOG_FREI, place: { map: 'das-meer', at: 'wasserlinie' } },
  ];

  return { dialogues: [...p.dialogues, he8, he10], talk: p.talk, schedule, teil: {} };
}
