// Stadtereignisse ab Akt 2 (world.md §10.6, §10.7): Chrome-10-Verteilung (Di/Do, Glasarkaden und Stufenplatz),
// Stromausfall (einmal pro Woche, Unterstadt), Razzia (nach main-2-bruch bei Fahndung ≥ 1, Neon-Gasse),
// Sandsturm (Ödnis), Neonnacht unter Drohnen bzw. ohne Werbung, Sonnenfest und Meerestag am Meer (Nachspiel),
// Plakat „Bus ans Meer“ an der Hafenkante.
// Die Gratis-Chip-Stände in Neon-Gasse, Schrottmarkt und Bahnhof baut quest-main-2/freie-phase.ts; hier nur die
// Verteilaktionen an den Wochentagen aus §10.6 in Mittelring/Glasarkaden.
// Belohnungen pro Tag über `heute_*`-Flags (fallen jeden Morgen, gaps-done.md §1).
import type { DialogueDef, EncounterDef, NpcDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import {
  ABEND_NACHT, EPILOG, FREI, MASTER, MEERESTAG, NACH_BRUCH, NEONNACHT, NUR_AKT2, NUR_AKT3, QUANTUM_LAGE, SANDSTURM, STROMAUSFALL_TAG,
  all, any, byId, ch, day, dlg, flag, give, herz, ich, msg, nar, node, not, passant, rep, say, setFlag, wcheck23, xp,
} from './_w23';

const PROMOTERIN = 'welt23-promoterin';
const VERTEILUNG = all(NUR_AKT2, day(['di', 'do']), { time: ['morgen', 'tag', 'abend'] });
const STROMAUSFALL = all(QUANTUM_LAGE, STROMAUSFALL_TAG, ABEND_NACHT);
const RAZZIA = all(NACH_BRUCH, flag('fahndung_1'));
const OEDNIS_SCHUTZ = any({ item: 'outfit-oednis' }, { item: 'staubmaske' }, { cyberware: 'haut-filtermembran' });

// --------------------------------------------------------------------------------------------- Chrome-10-Verteilung

function verteilung(ort: string, ortName: string): DialogueDef {
  const heute = `heute_chrome10_${ort}`;
  const frei = { notFlag: heute };
  return dlg(`welt23-chrome10-${ort}`, [
    node('start', [
      nar(`Ein weißer Pavillon mitten in ${ortName}, violettes Logo, Konfettikanone im Leerlauf. Daneben eine Kiste voller kleiner Chips in Geschenkfolie. Die Schlange davor reicht bis zur nächsten Ecke.`),
      say(PROMOTERIN, 'Chrome 10! Heute gratis! Ein kleiner Klick hinters Ohr, und Sie müssen nie wieder entscheiden. Das ist eine ausgezeichnete Entscheidung, Master!', 'freude'),
      say(PROMOTERIN, 'Oh, Verzeihung. Noch sind Sie ja kein … Möchten Sie einen?', 'neutral'),
    ], {
      choices: [
        ch('Einen Chip einstecken. Und ganz sicher nicht einsetzen.', 'eingesteckt', {
          when: frei, effects: [setFlag(heute), give('quantum-chip-schrott')],
        }),
        ch('Die Verteilerkiste unauffällig auf „Demo-Modus“ stellen.', 'demo', {
          when: frei, check: wcheck23(`chrome10-demo-${ort}`, 'technik', 6, { tags: ['hacken', 'maschine'] }),
          effects: [setFlag(heute), rep('unterstadt', 3), rep('quantum', -5), xp(30)],
        }),
        ch('Laut in die Schlange rufen: „Das Ding sagt euch irgendwann, wann ihr pinkeln dürft!“', 'gewarnt', {
          when: frei, check: wcheck23(`chrome10-warnen-${ort}`, 'ausstrahlung', 6, { tags: ['ueberreden', 'buehne'] }),
          effects: [setFlag(heute), rep('unterstadt', 2), xp(25)],
        }),
        ch('Eine ganze Kiste mitgehen lassen.', 'geklaut', {
          when: frei, check: wcheck23(`chrome10-kiste-${ort}`, 'reflexe', 6, { tags: ['geschick', 'flucht'] }),
          effects: [setFlag(heute), give('quantum-chip-schrott', 3), { wanted: 1 }],
        }),
        ch('Flugblätter verteilen: „NICHT ANFASSEN. Fragt Oma Volt, warum.“', 'flyer', {
          when: frei, effects: [setFlag(heute), { advanceTime: 45 }, rep('unterstadt', 1), herz('oma-volt', 5)],
        }),
        ch('(Aria nicken lassen.)', 'aria', {
          tag: '[Aria]', when: all(frei, { companion: 'aria' }),
          effects: [setFlag(heute), { wanted: 1 }, herz('aria', 15), rep('quantum', -5)],
        }),
        ch('Nein danke. Ich entscheide noch gern selbst. Meistens falsch, aber selbst.', 'nein'),
      ],
    }),
    node('eingesteckt', [
      nar('Die Promoterin drückt dir den Chip in die Hand und lächelt zu lange. Du steckst ihn ein. Er ist warm. Chips sollten nicht warm sein.'),
      say(PROMOTERIN, 'Einfach hinters Ohr drücken. Ganz einfach. Ganz ruhig. Ganz …', 'freude'),
      ich('Ja, ja. Mach ich. Später. Nie.'),
    ], { effects: [msg('Quantum-Chip-Schrott: Dante kann daraus Chip-Blocker bauen.')] }),
    node('demo', [
      nar('Zwei Handgriffe am Kabelstrang unter dem Tisch. Ein Lämpchen wechselt von Violett auf Gelb. Die Promoterin merkt nichts. Sie merkt generell wenig.'),
      nar('Die nächsten zweihundert Leute bekommen einen Chip, der nichts tut außer leise „Demo“ zu flüstern. Ein Mann ruft: „Ich fühl mich so … unverändert!“ Er klingt erleichtert.'),
    ]),
    node('gewarnt', [
      ich('Leute! Das Ding sagt euch irgendwann, wann ihr pinkeln dürft! Und wann nicht! Wollt ihr das? WOLLT IHR DAS?'),
      nar('Stille. Dann tritt eine Frau aus der Schlange. Dann noch einer. Dann löst sich die Schlange auf wie Zucker im Regen.'),
      say(PROMOTERIN, 'Das … war eine ausgezeichnete Entscheidung, M… nein. Nein, das war es nicht.', 'besorgt'),
    ]),
    node('geklaut', [
      nar('Die Promoterin dreht sich zur Konfettikanone. Drei Sekunden. Mehr brauchst du nicht. Die Kiste ist leicht, der Pavillon hat keine Rückwand, und die Schlange schaut in die andere Richtung.'),
      nar('Eine Kamera am Pavillon dreht sich träge zu dir. Zu spät. Aber nicht ganz.'),
    ], { effects: [msg('Drei Quantum-Chips im Rucksack. Die Kamera hat dich halb erwischt: Fahndung +1.')] }),
    node('flyer', [
      nar('Du drückst jedem in der Schlange ein Blatt in die Hand. Die meisten lesen es nicht. Ein paar schon. Eine Oma zerreißt ihren Gutschein und spuckt drauf. Im Vorbeigehen nickt sie dir zu.'),
    ]),
    node('aria', [
      say('aria', 'Endlich. Ich dachte schon, du fragst nie.', 'signatur'),
      nar('Ein Tritt, und der Pavillon kippt. Chips regnen auf den Boden, die Konfettikanone geht los, die Schlange jubelt. Die Promoterin lächelt weiter. Das ist das Unheimlichste daran.'),
      say('aria', 'Lauf. Und grins nicht so. Doch, grins. Steht dir.', 'freude'),
    ]),
    node('nein', [
      say(PROMOTERIN, 'Wie Sie meinen! Wir sehen uns bei der Releaseparty! Oder danach! Danach sehen wir alle alles!', 'freude'),
    ]),
  ]);
}

const chrome10Arkaden = verteilung('glasarkaden', 'den Glasarkaden');
const chrome10Stufen = verteilung('stufenplatz', 'den Stufenplatz');

// --------------------------------------------------------------------------------------------- Stromausfall

const stromausfall: DialogueDef = dlg('welt23-stromausfall', [
  node('start', [
    nar('Die Neon-Gasse ist schwarz. Nicht dunkel, schwarz. Keine Laterne, kein Schild, nur ein paar Feuerzeuge und das rote Auge einer Drohne, die als einzige noch Strom hat. Am Stellwerkskasten flucht Opa Blech.'),
    say('oma-volt', 'Jede Woche dasselbe, seit Quantum die Leitungen „optimiert“ hat. Optimiert! Ich optimier denen gleich was!', 'wut'),
  ], {
    choices: [
      ch('Den Notstromkasten am Stellwerk überbrücken.', 'technik', {
        when: { notFlag: 'heute_stromausfall' }, check: wcheck23('strom-ueberbruecken', 'technik', 5, { tags: ['reparieren', 'maschine'] }),
        effects: [setFlag('heute_stromausfall'), rep('unterstadt', 3), xp(25)],
      }),
      ch('Den alten Dieselgenerator hinter dem Kiosk von Hand ankurbeln.', 'kurbeln', {
        when: { notFlag: 'heute_stromausfall' }, check: wcheck23('strom-kurbeln', 'koerper', 6, { tags: ['kraft'] }),
        effects: [setFlag('heute_stromausfall'), rep('unterstadt', 3), xp(25)],
      }),
      ch('Ein Reparaturset opfern.', 'set', {
        when: { notFlag: 'heute_stromausfall' }, requires: { item: 'reparaturset' },
        effects: [{ take: 'reparaturset' }, setFlag('heute_stromausfall'), rep('unterstadt', 2)],
      }),
      ch('Oma Volts Kerzen in der Gasse verteilen.', 'kerzen', {
        when: { notFlag: 'heute_stromausfall' },
        effects: [setFlag('heute_stromausfall'), { advanceTime: 40 }, rep('unterstadt', 1), herz('oma-volt', 10)],
      }),
      ch('Weitergehen. Im Dunkeln ist gut munkeln.'),
    ],
  }),
  node('technik', [
    nar('Zwei Kabel, eine Brücke aus einem Kaugummipapier und ein Funke, der dir die Augenbrauen ansengt. Dann: Licht. Pink, Cyan, Violett, alles auf einmal. Die Gasse jubelt.'),
    say('oma-volt', 'Kind, du hast goldene Finger. Und angekokelte Augenbrauen. Beides steht dir.', 'freude'),
  ]),
  node('kurbeln', [
    nar('Der Generator hustet, spuckt, verweigert, hustet noch mal. Beim zwölften Zug springt er an und brüllt wie ein beleidigter Bär. Die Laternen flackern, dann leuchten sie.'),
    say('oma-volt', 'So hat mein dritter Mann den auch immer angeworfen. Der hatte danach Rückenschmerzen. Du siehst stabiler aus.', 'freude'),
  ]),
  node('set', [
    nar('Isolierband, Ersatzsicherung, ein Gebet an den Gott der Kurzschlüsse. Das Reparaturset ist leer, die Gasse ist hell.'),
  ]),
  node('kerzen', [
    nar('Kerzen in Flaschenhälsen, Kerzen auf Mülltonnen, Kerzen auf dem Kiosk. Es ist nicht hell, aber es ist warm. Jemand spielt Gitarre. Für eine Stunde ist die Neon-Gasse ein Dorf.'),
    say('oma-volt', 'Siehst du. Wir brauchen deren Strom nicht. Wir brauchen nur Wachs und schlechte Lieder.', 'freude'),
  ]),
]);

const kanalRatten: EncounterDef = {
  id: 'enc-welt23-stromausfall-ratten',
  name: 'Ratten im Stromausfall',
  arena: 'arena-kanal',
  enemies: [{ enemy: 'rattenschwarm' }, { enemy: 'kanalratte', count: 2 }],
  intro: [nar('Die Notbeleuchtung im Kanal ist aus. Aus der Dunkelheit kommt ein Rascheln, das viel zu viele Beine hat.')],
  reward: { xp: 30 },
};

// --------------------------------------------------------------------------------------------- Razzia

const razzia: EncounterDef = {
  id: 'enc-welt23-razzia',
  name: 'Razzia in der Neon-Gasse',
  arena: 'arena-strasse',
  enemies: [{ enemy: 'ordnungshueter', count: 2 }],
  intro: [
    nar('Blaulicht im Neon. Zwei Ordnungshüter mit Tablet, auf dem Tablet ein unscharfes Bild, auf dem Bild – na ja. Du, ungefähr.'),
    nar('„Bleiben Sie stehen! Sie entsprechen der Beschreibung!“ – „Welcher Beschreibung?“ – „Mensch mit Kleidung!“'),
  ],
  reward: { xp: 35 },
  onWin: [{ wanted: 1 }, msg('Die Ordnungshüter humpeln zum Wagen und funken Verstärkung. Fahndung +1. Im Crew-Quartier bist du sicher.')],
};

// --------------------------------------------------------------------------------------------- Neonnacht ab Akt 2

const neonnacht23: DialogueDef = dlg('welt23-neonnacht', [
  node('start', [
    nar('Neonnacht. Über der Gasse kreisen Drohnen, aber die Gasse leuchtet trotzdem: Leuchtfarbe auf jeder Laterne, auf jedem Mülleimer, auf Bruno. Bruno hat es nicht gemerkt.'),
    say('oma-volt', 'Dieses Jahr leuchten wir trotzdem. Gerade deswegen. Zehn Credits der Topf, für Haare, Jacke, Gesicht. Und für Drohnen. Vor allem für Drohnen.', 'freude'),
  ], {
    choices: [
      ch('Leuchtfarbe kaufen (10 Cr) und sich anmalen.', 'farbe', {
        requires: { credits: 10 },
        effects: [{ credits: -10 }, { checkBuff: { id: 'neonnacht23-farbe', label: 'Neonfarbe', value: 1, attribute: 'ausstrahlung', forDays: 0 } }, { sfx: 'coin' }],
      }),
      ch('Mit einem Farbtopf auf die Feuerleiter und die Drohnenkamera zukleistern.', 'drohne', {
        when: all(NUR_AKT2, { notFlag: 'heute_neonnacht_drohne' }),
        check: wcheck23('neonnacht-drohne', 'reflexe', 6, { tags: ['klettern', 'werfen'] }),
        effects: [setFlag('heute_neonnacht_drohne'), rep('unterstadt', 3), xp(30)],
      }),
      ch('Tanzen. Mitten in der Gasse. Zwischen Drohnen und Pfützen.', undefined, {
        when: { notFlag: 'heute_neonnacht_tanz' },
        effects: [setFlag('heute_neonnacht_tanz'), { minigame: 'akt-tanz', level: 2, key: 'welt23-neonnacht-tanz', label: 'Neonnacht-Tanz', win: [xp(25), rep('unterstadt', 2), msg('Die Gasse tobt. Eine Drohne filmt mit. Sie wackelt im Takt. Vielleicht ist sie auf deiner Seite.')], lose: [msg('Ein Kabel, eine Pfütze, ein Ausrutscher. Die Gasse klatscht trotzdem. Mitleid ist auch eine Währung.')] }],
      }),
      ch('Mit der Crew anstoßen.', 'crew', {
        when: all(EPILOG, not(MASTER), { notFlag: 'heute_neonnacht_crew' }),
        effects: [setFlag('heute_neonnacht_crew'), rep('crew-hunter', 2), herz('hunter', 10), herz('dante', 10), { advanceTime: 45 }],
      }),
      ch('Nur zuschauen.', 'zuschauen'),
    ],
  }),
  node('farbe', [
    nar('Oma Volt malt dir einen Blitz auf die Wange und, weil du stillhältst, einen zweiten auf die Stirn.'),
    say('oma-volt', 'So. Jetzt siehst du aus wie jemand, dem man was glaubt. Und wie jemand, den die Drohnen nicht erkennen. Doppelt gut.', 'freude'),
  ], { effects: [msg('Neonfarbe: +1 Ausstrahlung bei Checks bis Mitternacht.')] }),
  node('drohne', [
    nar('Drei Sprossen, ein Schwung, ein satter Klatsch: Die Drohne über der Gasse hat jetzt ein pinkes Auge. Sie dreht sich hilflos im Kreis und spielt eine Werbemelodie rückwärts.'),
    nar('Unten bricht die Gasse in Jubel aus. Jemand ruft deinen Namen. Jemand anderes ruft „Arschloch!“, aber liebevoll.'),
  ]),
  node('crew', [
    nar('Hunter hat einen Tisch vor den Club gestellt, ohne zu fragen. Dante verteilt Kekse mit Leuchtfarbe („Nur außen! Glaube ich!“), Vega zählt Sterne statt Drohnen, und Aria malt Raven einen Schnurrbart, während Raven so tut, als würde sie es nicht merken.'),
    say('hunter', 'Auf die Gasse. Und auf alle, die noch in ihr wohnen.', 'zaertlich'),
  ]),
  node('zuschauen', [
    nar('Pink, Cyan, Violett. Die Drohnen sind da, aber die Gasse ist lauter. Dieses Jahr fühlt sich Neonnacht an wie ein Mittelfinger aus Licht.'),
  ], { effects: [{ heal: 10 }] }),
]);

// --------------------------------------------------------------------------------------------- Sonnenfest und Meerestag

const sonnenfest: DialogueDef = dlg('welt23-sonnenfest', [
  node('start', [
    nar('Am Strand brennt ein Feuer aus Treibholz und alten Quantum-Plakaten. Jemand hat Lichterketten an den Steg gehängt, jemand anderes einen Lautsprecher in den Sand gegraben. Die halbe Unterstadt ist mit dem Sechs-Uhr-Bus gekommen und hat beschlossen, nie wieder zu gehen.'),
    say('hunter', 'Sonnenfest. Kein Eintritt, keine Gästeliste, kein Chip. Wer sich prügelt, schwimmt nach Hause.', 'freude'),
  ], {
    choices: [
      ch('Am Feuer sitzen und Geschichten hören.', 'feuer', {
        when: { notFlag: 'heute_sonnenfest_feuer' },
        effects: [setFlag('heute_sonnenfest_feuer'), { advanceTime: 60 }, herz('hunter', 10), herz('raven', 10), herz('vega', 10), herz('dante', 10), herz('aria', 10)],
      }),
      ch('Barfuß tanzen.', undefined, {
        when: { notFlag: 'heute_sonnenfest_tanz' },
        effects: [setFlag('heute_sonnenfest_tanz'), { minigame: 'akt-tanz', level: 2, key: 'welt23-sonnenfest-tanz', label: 'Tanz im Sand', win: [xp(30), msg('Sand in den Schuhen, Sand in den Haaren, Sand in Stellen, über die man nicht spricht. Perfekt.')], lose: [msg('Du stolperst über eine Muschel. Die Muschel sagt „Hallo“. Oder das war Karl.')] }],
      }),
      ch('Ein Wettrennen bis zur Wasserlinie.', undefined, {
        when: { notFlag: 'heute_sonnenfest_lauf' },
        effects: [setFlag('heute_sonnenfest_lauf'), { minigame: 'akt-strandlauf', level: 2, key: 'welt23-sonnenfest-lauf', label: 'Wer zuerst am Wasser ist', win: [xp(30), herz('aria', 15), msg('Erste am Wasser! Aria behauptet, sie hätte dich gewinnen lassen. Sie lügt. Sie ist stolz.')], lose: [herz('aria', 5), msg('Aria ist zuerst im Wasser und brüllt vor Kälte. Sie hat trotzdem gewonnen.')] }],
      }),
      ch('Meerestag: Beim Wettschwimmen zur Boje antreten.', 'schwimmen', {
        tag: '[Meerestag]', when: all(MEERESTAG, { notFlag: 'heute_meerestag' }),
        check: wcheck23('meerestag-boje', 'koerper', 6, { tags: ['kraft'] }),
        effects: [setFlag('heute_meerestag'), give('muschel-frisch'), xp(50), rep('unterstadt', 3)],
      }),
      ch('Meerestag: Algen-Chips an alle verteilen, die zum ersten Mal am Meer sind.', 'chips', {
        tag: '[Meerestag]', when: all(MEERESTAG, { notFlag: 'heute_meerestag' }),
        effects: [setFlag('heute_meerestag'), { advanceTime: 30 }, rep('unterstadt', 2), xp(20)],
      }),
      ch('Einfach aufs Wasser schauen.', 'wasser'),
    ],
  }),
  node('feuer', [
    nar('Dante erzählt, wie er mal einen Toaster geheiratet hätte, wenn das legal wäre. Vega erzählt von einem Schuss über drei Dächer, der nie passiert ist. Raven erzählt nichts und sitzt dabei so nah an Dante, dass es auch eine Geschichte ist.'),
    say('aria', 'Und du? Erzähl was. Was Peinliches. Was richtig Peinliches.', 'signatur'),
    ich('Ich hab mal einem Plüschhasen eine Couch abgekauft.'),
    say('aria', 'Das ist nicht peinlich. Das ist Geschäft. Captain Kuschel ist der härteste Verhandler der Stadt.', 'freude'),
  ]),
  node('schwimmen', [
    nar('Das Wasser ist kalt genug, um einem das Leben zu erklären. Du schwimmst bis zur Boje, tippst sie an und kommst als Erste zurück. Am Strand jubelt jemand. Am Strand jubeln alle.'),
    nar('Salzige Grete hängt dir eine frische Muschel an einer Schnur um den Hals. „Meerestag-Gewinnerin. Oder Gewinner. Mir egal, ihr seid alle nass.“'),
  ]),
  node('chips', [
    nar('Ein Junge aus der Rohrsiedlung hält die Tüte, als wäre sie aus Gold. Ein alter Mann aus dem Eisenhof weint, weil es nach Salz schmeckt. Eine Frau, die vor zwei Wochen noch „Master“ gesagt hat, sagt „Danke“. Sie wiederholt es, nur um zu hören, dass sie es kann.'),
  ]),
  node('wasser', [
    nar('Wellen. Keine Werbung, keine Drohnen, keine violetten Augen. Nur Wellen, die nicht wissen, wer Blade Nocturne war. Das Meer hat noch nie jemandem gehört. Vielleicht ist es deswegen so schön.'),
  ], { effects: [{ heal: 'full' }] }),
]);

// --------------------------------------------------------------------------------------------- Figuren

const npcs: NpcDef[] = [
  passant(PROMOTERIN, 'Chrome-10-Promoterin', 'passant-anzug-walk',
    'Verteilt Gratis-Chips mit einem Lächeln, das vor drei Wochen festgeschraubt wurde. Nennt alle „Master“. Fast alle.'),
];

// --------------------------------------------------------------------------------------------- Platzierung

const SANDSTURM_ON_ENTER = (map: string) => [
  {
    id: `welt23-sandsturm-${map}`, when: all(SANDSTURM, OEDNIS_SCHUTZ),
    effects: [msg('Sandsturm! Die Sicht reicht bis zur eigenen Nase. Dein Staubschutz hält, der Rest der Welt knirscht.')],
  },
  {
    id: `welt23-sandsturm-${map}-ohne`, when: all(SANDSTURM, not(OEDNIS_SCHUTZ)),
    effects: [{ damage: 5 }, msg('Sandsturm! Ohne Staubmantel oder Maske schmirgelt dir der Wind die Haut ab (−5 LP). Rudi verkauft Masken. Marla auch.')],
  },
];

export const part: ContentPart = {
  dialogues: byId([chrome10Arkaden, chrome10Stufen, stromausfall, neonnacht23, sonnenfest]),
  encounters: byId([kanalRatten, razzia]),
  npcs: byId(npcs),
  mapAdditions: {
    glasarkaden: {
      npcs: [
        { id: 'welt23-promoterin-arkaden', npc: PROMOTERIN, at: 'chrome-10-werbestand', facing: 's', dialogue: chrome10Arkaden.id, when: VERTEILUNG },
      ],
      onEnter: [
        { id: 'welt23-chrome10-arkaden-hinweis', when: all(VERTEILUNG, { notFlag: 'heute_hinweis_chrome10_arkaden' }), effects: [setFlag('heute_hinweis_chrome10_arkaden'), msg('Chrome-10-Verteilung am Werbestand! Die Schlange ist lang, die Promoterin lächelt. Ununterbrochen.')] },
      ],
    },
    stufenplatz: {
      npcs: [
        { id: 'welt23-promoterin-stufen', npc: PROMOTERIN, at: 'stufen-rechts', facing: 'w', dialogue: chrome10Stufen.id, when: VERTEILUNG },
      ],
    },
    'neon-gasse': {
      hotspots: [
        { id: 'welt23-stromausfall', at: 'stellwerk-kasten', radius: 64, label: 'Stromausfall: Licht zurückholen', kind: 'talk', dialogue: stromausfall.id, when: STROMAUSFALL },
        { id: 'welt23-neonnacht', at: 'gassenmitte', radius: 80, label: 'Neonnacht feiern', kind: 'talk', dialogue: neonnacht23.id, when: all(NEONNACHT, ABEND_NACHT, { act: 2 }, not(NUR_AKT3), not(MASTER)) },
      ],
      encounters: [
        {
          id: 'welt23-razzia', encounter: razzia.id, at: 'gassenmitte', sprite: 'ordnungshueter-walk',
          patrol: [[780, 560], [520, 424], [1000, 476]], radius: 56, when: RAZZIA,
          avoid: wcheck23('razzia-untertauchen', 'strasse', 5, { tags: ['verstecke', 'schleichen'] }),
        },
      ],
      onEnter: [
        { id: 'welt23-stromausfall-hinweis', when: all(STROMAUSFALL, { notFlag: 'heute_hinweis_strom' }), effects: [setFlag('heute_hinweis_strom'), msg('Stromausfall in der Unterstadt! Läden dunkel, Laternen tot. Am Stellwerkskasten flucht jemand.')] },
        { id: 'welt23-razzia-hinweis', when: all(RAZZIA, { notFlag: 'heute_hinweis_razzia' }), effects: [setFlag('heute_hinweis_razzia'), msg('Razzia! Ordnungshüter durchkämmen die Gasse. Über die Hintertreppe ins Crew-Quartier kommen sie nicht.')] },
      ],
    },
    schrottmarkt: {
      onEnter: [
        { id: 'welt23-stromausfall-markt', when: all(STROMAUSFALL, { notFlag: 'heute_hinweis_strom' }), effects: [setFlag('heute_hinweis_strom'), msg('Stromausfall! Die Marktstände leuchten mit Kerzen und Taschenlampen. Babette kocht auf Gas weiter. Natürlich.')] },
      ],
    },
    rohrsiedlung: {
      onEnter: [
        { id: 'welt23-stromausfall-rohr', when: all(STROMAUSFALL, { notFlag: 'heute_hinweis_strom' }), effects: [setFlag('heute_hinweis_strom'), msg('Stromausfall! In der Rohrsiedlung brennen nur die Kerzen der Suppenküche. Die Kinder finden das großartig.')] },
      ],
    },
    'kanal-sammler': {
      encounters: [
        {
          id: 'welt23-stromausfall-ratten', encounter: kanalRatten.id, at: 'magnetangel-stelle', sprite: 'kanalratte-walk',
          patrol: [[780, 540], [860, 578], [700, 600]], radius: 52, when: STROMAUSFALL,
          avoid: wcheck23('stromausfall-ratten', 'reflexe', 5, { tags: ['schleichen'] }),
        },
      ],
      onEnter: [
        { id: 'welt23-stromausfall-kanal', when: all(STROMAUSFALL, { notFlag: 'heute_hinweis_strom_kanal' }), effects: [setFlag('heute_hinweis_strom_kanal'), msg('Stromausfall: Die Notbeleuchtung im Kanal ist aus. Irgendwo raschelt es mit zu vielen Beinen.')] },
      ],
    },
    hafenkante: {
      hotspots: [
        {
          id: 'welt23-plakat-bus', at: 'kai-mitte', radius: 48, label: 'Plakat „Bus ans Meer“', kind: 'look', when: FREI,
          lines: [nar('Handgemalt, mit Muscheln beklebt: „BUS ANS MEER – TÄGLICH 06:00 – FAHRER: KÄPT’N NEBELHORN – HUPEN IST INKLUSIVE“. Darunter hat jemand eine Welle gemalt. Mit Kuli.')],
        },
      ],
    },
    'das-meer': {
      hotspots: [
        { id: 'welt23-sonnenfest', at: 'lagerfeuer', radius: 80, label: 'Sonnenfest', kind: 'talk', dialogue: sonnenfest.id, when: all(FREI, day('so'), ABEND_NACHT) },
      ],
      onEnter: [
        { id: 'welt23-sonnenfest-hinweis', when: all(FREI, day('so'), ABEND_NACHT, { notFlag: 'heute_hinweis_sonnenfest' }), effects: [setFlag('heute_hinweis_sonnenfest'), msg('Sonnenfest! Am Lagerfeuer feiert die halbe Unterstadt.')] },
        { id: 'welt23-meerestag-hinweis', when: all(FREI, MEERESTAG, { notFlag: 'heute_hinweis_meerestag' }), effects: [setFlag('heute_hinweis_meerestag'), msg('Meerestag! Wettschwimmen zur Boje, Algen-Chips für alle, abends Sonnenfest am Lagerfeuer.')] },
      ],
    },
    staubstrasse: { onEnter: SANDSTURM_ON_ENTER('staubstrasse') },
    aussiedlerhof: { onEnter: SANDSTURM_ON_ENTER('aussiedlerhof') },
    'funkturm-ruine': { onEnter: SANDSTURM_ON_ENTER('funkturm-ruine') },
    glasduenen: { onEnter: SANDSTURM_ON_ENTER('glasduenen') },
  },
};
