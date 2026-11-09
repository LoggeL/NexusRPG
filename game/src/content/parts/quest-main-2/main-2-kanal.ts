// Hauptquest main-2-kanal „Unter der Stadt“ (world.md §5.3). Start am Morgen nach dem Bruch (m2b-morgen).
//
// Ablauf: Kanal-Sammler → Tunnel Ost (Stirnlampe/Restlicht-Augen, siehe Ausgang der Karte) → Pumpwerk Sieben,
// OP-Nische. Xion verkauft „die Ware“ an Ripper:
//   Variante A (aria_gechippt): Aria, bewusstlos, 600 Cr für den Zerberster.
//   Variante B (aria_entkommen): Jimmy (jimmy_gechippt) bzw. Proband 47 (proband_gechippt) – eigene Begegnungen unten,
//   weil die Fassungen aus combat-23 Aria als Schutzperson führen.
// Wege: Kampf (mit prep-fluchtweg ohne Verstärkung) · gc-31 [Straße 6] 700 bieten · 900 bar (ohne Check) ·
// arme-zerberster-attrappe tauschen · gc-32 [Ausstrahlung 7] Virus-Bluff (automatisch nach gc-05) · gc-33 [Körper 7]
// Xion überraschen (Kampf mit Überrumpelung) · Schleichen mit kaeseecke (akt-schleichen).
// Folgen: Fahndung +2, Plate cut-main-2-kanal, Weg zu Dante (main-2-countdown beginnt in der Werkstatt).
import type { ContentPart } from '../../part';
import type { CutsceneDef, DialogueChoice, DialogueDef, Effect, EncounterDef, QuestDef } from '../../../modules/contracts';
import {
  NOT_VEX, VEX, active, all, any, dlg, done, flag, herz, item, l, msg, nar, noFlag, node, not, set, won,
} from './_lib';

const Q = 'main-2-kanal';
const AKTIV = active(Q);
const BEFREIT = flag('kanal_befreit');
const BEI_DANTE = flag('kanal_bei_dante');

/** Wer liegt auf der Trage? */
const VAR_JIMMY = flag('jimmy_gechippt');
const VAR_PROBAND = all(flag('proband_gechippt'), noFlag('jimmy_gechippt'));
const VAR_ARIA = all(noFlag('jimmy_gechippt'), noFlag('proband_gechippt'));
/** Kanalvolk blockiert die Verstärkung (Bedingung der Begegnung „…-fluchtweg“). */
const FLUCHTWEG = done('prep-fluchtweg');
const MIT_FLUCHTWEG = any(FLUCHTWEG, flag('fluchtweg_gesichert'));

// ---------------------------------------------------------------------------------------------- Begegnungen Variante B

const kern = [
  { enemy: 'boss-xion-kanal' },
  { enemy: 'boss-ripper-kanal' },
  { enemy: 'zerleger', count: 2 },
];

type Fassung = 'std' | 'fluchtweg' | 'ueberrumpelt';
type Ware = 'jimmy' | 'proband';

const WARE_NAME: Record<Ware, string> = { jimmy: 'Jimmy', proband: 'Proband 47' };
/** Schutzperson im Kampf: Jimmy als Figur; der Proband als Zivilperson mit Passanten-Laufblatt. */
const WARE_UNIT: Record<Ware, string> = { jimmy: 'jimmy', proband: 'passant-anzug' };

function encB(ware: Ware, fassung: Fassung): EncounterDef {
  const name = WARE_NAME[ware];
  const ziel = `Ziel: alle Gegner besiegen. ${name} liegt auf der Trage neben dir – fällt er, ist der Kampf verloren.`;
  const intro = fassung === 'ueberrumpelt'
    ? [
      nar('Du kommst von hinten über den Gitterboden, während Xion noch zählt. Vierhundert. Vierhundertzehn. Vierhundert…'),
      l('player', 'Verzählt, Kralle.', 'signatur'),
      l('xion-venom', 'Ich hab mich nicht verzählt! Ich hab mich ERSCHROCKEN! Das ist was anderes!'),
      nar(`Überrumpelt: Ihr seid zuerst dran, der erste Angriff bekommt +15. ${ziel}`),
    ]
    : [
      nar(`Pumpwerk Sieben. Auf einer Rolltrage zwischen zwei Pumpen: ${name}. Violette Augen, Lächeln wie eingefroren. Mit Preisschild.`),
      l('ripper', 'Vierhundert für den Frischling, Xion. Mit Chip. Ohne Chip zahl ich nix, ohne Chip ist das nur ein Mensch.', 'signatur'),
      l('xion-venom', 'Fünfhundert. Blade sagt, ich soll verhandeln. Ich kann verhandeln.'),
      l('player', 'Die Ware ist nicht zu verkaufen, ihr Leichenfledderer.', 'wut'),
      ...(fassung === 'fluchtweg'
        ? [
          l('xion-venom', 'Funkruf! Alle Mann ins … Warum antwortet keiner? Wieso liegt da eine Ratte mit Krone auf meinem Funkgerät?!'),
          nar('Hinten an der Engstelle klirren Kronkorken: Das Kanalvolk hat dichtgemacht. Keine Verstärkung.'),
        ]
        : [l('xion-venom', 'Funkruf! Alle Mann ins Pumpwerk! … Ja, ALLE. Auch du, Gerd. Zieh dir was an.')]),
      nar(ziel),
    ];
  return {
    id: `enc-kanal-b-${ware}${fassung === 'std' ? '' : `-${fassung}`}`,
    name: `Unter der Stadt: Xion und Ripper (${name})`,
    arena: 'arena-rohre',
    enemies: fassung === 'std' ? [...kern, { enemy: 'venom-rekrut', count: 2 }] : fassung === 'ueberrumpelt' ? [...kern, { enemy: 'venom-rekrut' }] : [...kern],
    objective: { kind: 'rescue', unit: WARE_UNIT[ware], cell: [1, 3], ...(ware === 'proband' ? { name: name } : {}) },
    ...(fassung === 'ueberrumpelt' ? { start: 'ueberrumpelt' as const } : {}),
    canFlee: false,
    when: fassung === 'fluchtweg' ? all({ act: 2 }, FLUCHTWEG) : { act: 2 },
    intro,
    reward: { xp: 150, credits: 100 },
    onWin: [msg(`Ripper ist durch ein Abflussrohr verschwunden, Xion humpelt fluchend davon. ${name} atmet.`)],
  };
}

const B_ENCS: EncounterDef[] = (['jimmy', 'proband'] as const).flatMap(w =>
  (['std', 'fluchtweg', 'ueberrumpelt'] as const).map(f => encB(w, f)));

/** Begegnung je Ware und Fassung. */
function encId(ware: Ware | 'aria', fassung: Fassung): string {
  if (ware === 'aria') return fassung === 'std' ? 'enc-kanal-xion-ripper' : `enc-kanal-xion-ripper-${fassung}`;
  return `enc-kanal-b-${ware}${fassung === 'std' ? '' : `-${fassung}`}`;
}
const ALLE_KAEMPFE = (['aria', 'jimmy', 'proband'] as const).flatMap(w =>
  (['std', 'fluchtweg', 'ueberrumpelt'] as const).map(f => encId(w, f)));
const GEWONNEN = any(...ALLE_KAEMPFE.map(won));

const WARE_WHEN = { aria: VAR_ARIA, jimmy: VAR_JIMMY, proband: VAR_PROBAND } as const;

/** Kampf-Wahlen: genau eine ist sichtbar (Ware × Kanalvolk-Sperre). */
function kampf(text: string, fassung: 'std' | 'ueberrumpelt', extra: Partial<DialogueChoice> = {}, vorher: Effect[] = []): DialogueChoice[] {
  return (['aria', 'jimmy', 'proband'] as const).flatMap(w => {
    if (fassung === 'ueberrumpelt') {
      return [{ ...extra, text, when: WARE_WHEN[w], effects: [...vorher, { battle: encId(w, 'ueberrumpelt'), stay: true }, { dialogue: 'm2k-nach-kampf' }] }];
    }
    return [
      { ...extra, text, when: all(WARE_WHEN[w], FLUCHTWEG), effects: [...vorher, { battle: encId(w, 'fluchtweg'), stay: true }, { dialogue: 'm2k-nach-kampf' }] },
      { ...extra, text, when: all(WARE_WHEN[w], not(FLUCHTWEG)), effects: [...vorher, { battle: encId(w, 'std'), stay: true }, { dialogue: 'm2k-nach-kampf' }] },
    ];
  });
}

// ---------------------------------------------------------------------------------------------- Quest

const quest: QuestDef = {
  id: Q,
  kind: 'main',
  title: 'Unter der Stadt',
  summary: 'Xion verkauft, was er im Labor eingesammelt hat, an Ripper. Pumpwerk Sieben, unter dem Kanal-Sammler. Wir holen es uns zurück. – Raven',
  giver: 'raven',
  act: 2,
  autoStart: done('main-2-bruch'),
  steps: [
    {
      id: 'tunnel',
      text: 'Runter in den Kanal-Sammler und durch Tunnel Ost ins Pumpwerk Sieben. Ohne Licht geht da nichts.',
      done: any({ visited: 'pumpwerk-sieben' }, BEFREIT),
      marker: { map: 'kanal-sammler', at: [1470, 245] },
    },
    {
      id: 'handel',
      text: 'Xion und Ripper verhandeln in der OP-Nische. Mach den Deal kaputt – mit Geld, Worten, Käse oder Fäusten.',
      done: BEFREIT,
      marker: { map: 'pumpwerk-sieben', at: 'op-nische' },
    },
    {
      id: 'dante',
      text: 'Ab zu Dante in die Lötgassen. Der Einzige, der Quantum-Chips rausholt, ohne dass hinterher was fehlt.',
      when: BEFREIT,
      done: BEI_DANTE,
      marker: { map: 'loetgassen', at: 'werkstatt-tuer' },
    },
  ],
  reward: {
    xp: 300,
    credits: 150,
    rep: { kanalvolk: 5 },
    effects: [{ wanted: 2 }, msg('Pumpwerk Sieben: Ripper und Xion haben euch gesehen. Die halbe Stadt sucht jetzt nach euch.')],
  },
};

// ---------------------------------------------------------------------------------------------- Kanal-Sammler

/** Mit prep-fluchtweg: Gully wartet am Notausgang und führt die Abkürzung (world.md: „main-2-kanal kürzer“). */
const gully: DialogueDef = dlg('m2k-gully', [
  node('start', [
    nar('Am geölten Notausgang lehnt Bürgermeister Gully, die Kronkorkenkrone schief, eine Fackel in der Hand.'),
    l('buergermeister-gully', 'Freunde der Rohre! Meine Ratten haben’s gesehen: Die Kralle schleppt eine Trage ins Pumpwerk. Mit Preisschild. In MEINEM Kanal.'),
    l('buergermeister-gully', 'Ehrenschuld ist Ehrenschuld. Meine Leute machen die Engstelle dicht. Keine Verstärkung für den Lackaffen. Und hier: Proviant.'),
    nar('Er drückt dir zwei Käseecken in die Hand. Sie sind warm. Du fragst nicht, wo er sie aufbewahrt hat.'),
  ], {
    effects: [{ give: 'kaeseecke', qty: 2 }, set('kanal_gully_hilft')],
    choices: [
      { text: '„Zeig mir die Abkürzung.“', effects: [{ travel: 'pumpwerk-sieben', entry: 'von-kanal-sammler', minutes: 0 }] },
      { text: '„Danke, Gully. Ich find den Weg.“' },
    ],
  }),
]);

// ---------------------------------------------------------------------------------------------- Pumpwerk

const ankunft: DialogueDef = dlg('m2k-ankunft', [
  node('start', [
    nar('Pumpwerk Sieben. Die Räder mahlen, irgendwo quietscht Gisela. Unten links, hinter einem Plastikvorhang, brennt eine OP-Lampe.'),
    nar('Stimmen. Ripper, weich wie Butter auf einem Skalpell. Xion, laut wie jemand, der beweisen muss, dass er rechnen kann.'),
  ], {
    choices: [
      { text: 'Weiter.', when: VAR_ARIA, next: 'aria' },
      { text: 'Weiter.', when: VAR_JIMMY, next: 'jimmy' },
      { text: 'Weiter.', when: VAR_PROBAND, next: 'proband' },
    ],
  }),
  node('aria', [
    l('ripper', 'Sechshundert für den Zerberster, Xion. Den Rest kannst du behalten, ich hab keinen Platz im Kühlfach.'),
    l('vega', 'Die reden über ihren Arm wie über ein Ersatzrad. Ich schieß gleich jemandem in die Kniescheibe. Beide Kniescheiben.', 'wut'),
  ], { next: 'sperre' }),
  node('jimmy', [
    l('ripper', 'Vierhundert für den Frischling. Mit Chip. Gechippte Nieren sind die besten, die halten still.'),
    l('aria', 'Jimmy. Die reden über JIMMY. Ich reiß dem Lackaffen die Kralle ab und kratz ihm damit den Rücken.', 'wut'),
  ], { next: 'sperre' }),
  node('proband', [
    l('ripper', 'Vierhundert für Nummer siebenundvierzig. Er hat ja freiwillig unterschrieben. Ich respektiere Freiwilligkeit.'),
    l('aria', 'Der Typ hat sich für ’nen Gutschein verkauft, und jetzt verkaufen sie ihn weiter. Das ist ja wie bei Dexter.', 'wut'),
  ], { next: 'sperre' }),
  node('sperre', [], {
    choices: [
      { text: '(Zur OP-Nische, Laufsteg Süd.)', when: MIT_FLUCHTWEG, next: 'kanalvolk' },
      { text: '(Zur OP-Nische, Laufsteg Süd.)', when: not(MIT_FLUCHTWEG) },
    ],
  }),
  node('kanalvolk', [
    nar('Oben an der Engstelle stapeln Gullys Leute leise Fässer, Bretter und einen Kühlschrank. Xions Verstärkung bleibt heute auf der anderen Seite.'),
  ], { effects: [set('kanal_sperre_kanalvolk')] }),
]);

const handel: DialogueDef = dlg('m2k-handel', [
  node('start', [
    nar('Hinter dem Plastikvorhang: Ripper im frisch gebügelten Kittel, Xion mit Kralle und Klemmbrett, zwei Zerleger mit Kühlboxen. Auf der Rolltrage dazwischen …'),
  ], {
    choices: [
      { text: '…', when: VAR_ARIA, next: 'trage-aria' },
      { text: '…', when: VAR_JIMMY, next: 'trage-jimmy' },
      { text: '…', when: VAR_PROBAND, next: 'trage-proband' },
    ],
  }),
  node('trage-aria', [
    nar('… Aria. Augen zu, Lippen bewegen sich. „Ja, Master. Ja, Master.“ Ihr Zerberster-Arm ist mit Kabelbindern an die Trage gezurrt. Daran ein Preisschild: 600.'),
  ], { next: 'wahl' }),
  node('trage-jimmy', [
    nar('… Jimmy. Lieferkappe, violette Augen, ein Lächeln wie ein Werbeplakat. Er summt die Quantum-Hymne. Daran ein Preisschild: 400.'),
  ], { next: 'wahl' }),
  node('trage-proband', [
    nar('… Proband 47. Krankenhaushemd, violette Augen, die Hände brav auf dem Bauch gefaltet. Am Zeh ein Preisschild: 400.'),
  ], { next: 'wahl' }),
  node('wahl', [
    nar('Noch hat dich keiner bemerkt. Unter dem Gitterboden rascheln die Ratten des Kanals.'),
  ], {
    choices: [
      { text: 'Hingehen und den Deal platzen lassen. Mit Worten.', next: 'reden' },
      ...kampf('Über den Gitterboden von hinten ran und Xion umhauen, bevor er zählt.', 'ueberrumpelt', { check: 'gc-33' }, [set('kanal_ueberrumpelt')]),
      {
        text: 'Eine Käseecke durchs Gitter werfen und im Rattengewimmel die Trage wegrollen.', requires: item('kaeseecke'),
        tag: '[Käseecke]', next: 'kaese',
      },
      ...kampf('Kein Gerede. Drauf.', 'std'),
    ],
  }),
  // --- Schleichen mit Käse
  node('kaese', [
    nar('Die Käseecke fällt durchs Gitter. Einen Herzschlag lang Stille. Dann kocht der Boden: hundert Ratten, die alle gleichzeitig Hunger haben.'),
    l('xion-venom', 'RATTEN! Wer hat die Ratten bestellt?! Ich hab keine Ratten bestellt!'),
    l('ripper', 'Die Kühlboxen! Haltet die Kühlboxen hoch, die riechen Leber!'),
  ], {
    choices: [{
      text: 'Jetzt. Die Trage schnappen.',
      effects: [
        { take: 'kaeseecke' },
        {
          minigame: 'akt-schleichen', level: 2, key: 'kanal-trage', label: 'Die Trage durchs Rattengewimmel schieben',
          win: [set('kanal_geschlichen'), set('kanal_befreit'), { dialogue: 'm2k-danach' }],
          lose: [msg('Ein Rad quietscht. Xion dreht sich um. Scheiße.'), { dialogue: 'm2k-erwischt' }],
        },
      ],
    }],
  }),
  // --- Reden
  node('reden', [
    nar('Du trittst durch den Vorhang. Xion reißt die Kralle hoch, Ripper die Augenbrauen.'),
    l('ripper', 'Schätzchen. Man klopft, bevor man in ein Geschäftsgespräch platzt. Das hier ist eine Auktion.', 'signatur'),
    l('xion-venom', 'Die gehört MIR. Ich hab sie gefunden. Im Labor. Auf dem Boden. Das ist wie Fundsache.'),
  ], {
    choices: [
      {
        text: '„Siebenhundert. Bar. Und du fragst nicht, woher.“', check: 'gc-31', requires: { credits: 700 },
        effects: [{ credits: -700 }, set('kanal_freigekauft')], next: 'gekauft',
      },
      {
        text: '„Neunhundert. Dafür halt ihr beide die Klappe.“', requires: { credits: 900 },
        effects: [{ credits: -900 }, set('kanal_freigekauft')], next: 'gekauft',
      },
      {
        text: '(Den Zerberster-Toaster aus der Tasche ziehen.) „Tausch. Original Zerberster, kaum gebraucht.“', tag: '[Attrappe]',
        when: item('arme-zerberster-attrappe'),
        effects: [{ take: 'arme-zerberster-attrappe' }, set('kanal_attrappe')], next: 'attrappe',
      },
      {
        text: '(Den Zerberster-Toaster ausbauen.) „Tausch. Original Zerberster. Noch warm.“', tag: '[Attrappe]',
        when: all({ cyberware: 'arme-zerberster-attrappe' }, not(item('arme-zerberster-attrappe'))),
        effects: [{ removeCyberware: 'arme' }, { take: 'arme-zerberster-attrappe' }, set('kanal_attrappe')], next: 'attrappe',
      },
      {
        text: '„Ripper, guck dir den Chip mal genauer an. Da ist ein Virus drauf. Derselbe wie bei deinen Kinder-Implantaten.“',
        check: 'gc-32', effects: [set('kanal_bluff')], next: 'bluff',
      },
      ...kampf('„Ich hab’s im Guten versucht.“', 'std'),
      { text: '„Ich überleg’s mir.“ (Zurückziehen.)' },
    ],
  }),
  node('gekauft', [
    nar('Du zählst die Scheine auf den OP-Tisch. Xion zählt mit, bewegt die Lippen, verzählt sich und fängt nochmal an.'),
    l('xion-venom', '… sechshundertneunzig, siebenhundert. Siebenhundert! Ripper, sie bietet mehr. Das ist Marktwirtschaft. Ich bin nicht dumm.'),
    l('ripper', 'Nein, Xion. Du bist arm. Und ab jetzt mein Feind.', 'wut'),
    nar('Ripper rafft seine Kühlboxen und verschwindet durch ein Abflussrohr. Xion stopft das Geld in die Hose und rennt in die andere Richtung, bevor du es dir anders überlegst.'),
  ], { effects: [set('kanal_befreit'), { dialogue: 'm2k-danach' }] }),
  node('attrappe', [
    nar('Ripper nimmt den Toaster, als hätte man ihm ein Neugeborenes gereicht. Er klopft dagegen. Unten fällt eine verkohlte Brotscheibe heraus.'),
    l('ripper', 'Ein Zerberster. Hier. Original. Mit … Krümelschublade.', 'ueberrascht'),
    l('ripper', 'Weißt du was? Den nehm ich. Den stell ich ins Schaufenster. Xion, behalt deinen Kram.', 'freude'),
    l('xion-venom', 'Aber … aber das ist doch nur ein …', 'wut'),
    l('ripper', 'Das ist Kunst, Xion. Davon verstehst du nix. Wiedersehen.', 'signatur'),
    nar('Ripper geht. Xion steht allein mit seiner Ware und deinen Fäusten. Er rechnet. Dann rennt er.'),
  ], { effects: [set('kanal_befreit'), { dialogue: 'm2k-danach' }] }),
  node('bluff', [
    nar('Ripper beugt sich über die Trage, Lupe vor dem Auge. Du siehst, wie er an den Montag denkt, an dem ihm ein Virus fast die Praxis gefressen hat.'),
    l('ripper', 'Das … riecht tatsächlich komisch. Xion, du verkaufst mir verseuchte Ware?', 'besorgt'),
    l('xion-venom', 'Das ist ein QUANTUM-Chip! Quantum ist sauber! Blade sagt …'),
    l('ripper', 'Blade sagt viel. Kein Deal. Und wenn du mir nochmal so was anbietest, verkauf ich DICH. Stückweise.', 'wut'),
    nar('Ripper geht. Xion sieht dich an, dann die Trage, dann wieder dich. Er hat keine Lust auf Mathe mit Fäusten und verdrückt sich.'),
  ], { effects: [set('kanal_befreit'), { dialogue: 'm2k-danach' }] }),
]);

/** Schleichen verpatzt: Kampf. */
const erwischt: DialogueDef = dlg('m2k-erwischt', [
  node('start', [
    l('xion-venom', 'DU! Schon wieder du! Wieso bist du immer da, wo ich bin?!', 'wut'),
    l('ripper', 'Na, Schätzchen. Erst die Ratten, dann der Diebstahl. Du hast Manieren wie ein Kanalrohr.'),
  ], { choices: kampf('Dann eben so.', 'std') }),
]);

const nachKampf: DialogueDef = dlg('m2k-nach-kampf', [
  node('start', [], {
    choices: [
      { text: 'Weiter.', when: GEWONNEN, effects: [set('kanal_kampf'), set('kanal_befreit'), { dialogue: 'm2k-danach' }] },
      { text: 'Weiter.', when: not(GEWONNEN), next: 'verloren' },
    ],
  }),
  node('verloren', [
    nar('Du liegst auf dem Gitterboden und zählst die Pumpenräder. Es sind mehr als drei. Das ist ein schlechtes Zeichen.'),
    l('xion-venom', 'Und bleib liegen! … Ripper, hilf mir, die Trage klemmt.'),
    l('ripper', 'Ich helfe nicht, ich kaufe. Mach du mal.'),
    nar('Sie streiten. Die Trage steht noch da. Du hast noch eine Chance.'),
  ], {
    choices: [
      ...kampf('Aufstehen. Nochmal.', 'std'),
      { text: 'Erst mal durchatmen. (Später wiederkommen.)' },
    ],
  }),
]);

// ---------------------------------------------------------------------------------------------- Danach

const DANACH_ENDE: Effect[] = [{ cutscene: 'main-2-kanal' }];

const danach: DialogueDef = dlg('m2k-danach', [
  node('start', [
    nar('Plötzlich ist es still im Pumpwerk. Nur Gisela quietscht, als wollte sie applaudieren.'),
  ], {
    choices: [
      { text: 'Zur Trage.', when: all(VAR_ARIA, NOT_VEX), next: 'aria' },
      { text: 'Zur Trage.', when: all(VAR_ARIA, VEX), next: 'aria-vex' },
      { text: 'Zur Trage.', when: VAR_JIMMY, next: 'jimmy' },
      { text: 'Zur Trage.', when: VAR_PROBAND, next: 'proband' },
    ],
  }),
  // --- Aria
  node('aria', [
    nar('Du schneidest die Kabelbinder durch. Aria öffnet die Augen. Violett. Sie lächelt dich an, freundlich und leer.'),
    l('aria', 'Guten Abend, Master. Soll ich etwas für Sie zerbrechen?', 'neutral'),
    l('vega', 'Nein, Schatz. Heute nicht. Heute zerbrechen wir nix.', 'trauer'),
    l('raven', 'Dante. Der Einzige in der Stadt, der so ein Ding rausholt, ohne dass hinterher das halbe Hirn fehlt.', 'neutral'),
    l('raven', 'Er hat Nein gesagt. Zu mir. Mal sehen, ob er zu ihr auch Nein sagt.', 'wut'),
  ], { effects: [herz('aria', 40), herz('vega', 30)], next: 'chip' }),
  node('aria-vex', [
    nar('Du schneidest die Kabelbinder durch. Aria öffnet die Augen. Violett. Sie lächelt dich an, freundlich und leer.'),
    l('aria', 'Guten Abend, Master. Soll ich etwas für Sie zerbrechen?', 'neutral'),
    l('player', 'Zöpfe. Ich bin’s. Ich hab angehalten. Hörst du? Zum ersten Mal in meinem Leben hab ich angehalten.', 'trauer'),
    nar('Für einen halben Atemzug flackert etwas hinter dem Violett. Ihre Hand, die nicht gefesselt ist, schließt sich um zwei deiner Finger. Dann ist es wieder weg.'),
    l('raven', 'Dante. Lötgassen. Jetzt. Du schiebst, ich mach den Weg frei.', 'neutral'),
  ], { effects: [herz('aria', 80), set('vex_trage_angehalten')], next: 'chip' }),
  // --- Jimmy
  node('jimmy', [
    nar('Du löst die Gurte. Jimmy setzt sich auf, rückt seine Kappe gerade und sieht dich mit violetten Augen an.'),
    l('jimmy', 'Danke für Ihre Bestellung. Ich muss jetzt los. Der Master ruft. Lieferung ist Lieferung.', 'neutral'),
    l('aria', 'Jimmy, nein! Jimmy, bleib hier, du Idiot!', 'wut'),
    nar('Er ist schneller, als ein gechippter Lieferjunge sein dürfte. Ein Satz übers Geländer, ein zweiter ins Überlaufrohr, weg. Richtung Oberstadt. Richtung Quantum.'),
    l('vega', 'Er läuft zurück. Zu denen. Weil der Chip es sagt.', 'trauer'),
    l('aria', 'Dann holen wir ihn da raus. Und vorher reißen wir dem Ding, das ihm das sagt, den Stecker raus.', 'wut'),
  ], { effects: [set('jimmy_zurueck_zu_quantum'), herz('aria', 30)], next: 'chip' }),
  // --- Proband
  node('proband', [
    nar('Du löst die Gurte. Proband 47 setzt sich auf und faltet die Hände. Violette Augen. Er sieht aus wie ein Buchhalter, der aus Versehen in einen Horrorfilm geraten ist.'),
    l('ki-nexus', 'Proband 47 bedankt sich für Ihre Hilfe. Proband 47 ist bereit für den nächsten Testlauf.', 'neutral'),
    l('aria', 'Proband 47 hält jetzt die Klappe und kommt mit. Wir bringen dich zu jemandem, der Chips rausholt. Ohne Gutschein.', 'neutral'),
  ], { effects: [set('proband_gerettet'), herz('aria', 20)], next: 'chip' }),
  // --- Der Chip in der Tasse
  node('chip', [
    nar('Da fängt es in deiner Tasche an zu piepen. Der Chip aus dem Labor. Ein winziges blaues Licht blinkt, im Takt eines sehr ungeduldigen Herzens.'),
    l('ki-nexus', 'Unbefugte Entfernung bestätigt. Rückholung fehlgeschlagen. Ich leite Protokoll Abschied ein. Das ist nicht persönlich gemeint.', 'neutral'),
    l('raven', 'Was heißt „Protokoll Abschied“? Warum klingt das wie „bumm“?', 'besorgt'),
    l('player', 'Lötgassen. Sofort. Dante weiß, was das heißt.', 'besorgt'),
  ], {
    choices: [
      { text: 'Los.', effects: DANACH_ENDE },
    ],
  }),
]);

// ---------------------------------------------------------------------------------------------- Cutscene

const kanalSzene: CutsceneDef = {
  id: 'main-2-kanal',
  title: 'Unter der Stadt',
  beats: [
    {
      image: 'cut-main-2-kanal',
      pan: 'left',
      fade: 'in',
      caption: 'Unter der Stadt',
      lines: [
        nar('Ihr schiebt die Trage durch die Rohre. Gully läuft mit der Fackel voraus, seine Ratten sichern die Abzweige. Das Wasser reicht bis zu den Knöcheln, dann bis zu den Knien.'),
        nar('Das Piepen in deiner Tasche wird schneller. Niemand sagt was. Alle zählen mit.'),
      ],
      hold: 1200,
    },
    {
      image: 'cut-main-2-kanal',
      pan: 'in',
      caption: 'Lötgassen · Hintertür',
      lines: [
        l('raven', 'Dante! Mach auf! Ich weiß, dass du da bist, ich hör deine Platten!', 'wut'),
        nar('Drinnen läuft Jazz. Und jemand flucht leise über ein Kartenspiel.'),
      ],
    },
  ],
  effects: [
    { travel: 'dantes-werkstatt', entry: 'von-loetgassen', minutes: 30 },
    set('kanal_bei_dante'),
    { startQuest: 'main-2-countdown' },
    { dialogue: 'm2c-start' },
  ],
};

// ---------------------------------------------------------------------------------------------- Karten

export const part: ContentPart = {
  quests: { [Q]: quest },
  encounters: Object.fromEntries(B_ENCS.map(e => [e.id, e])),
  dialogues: Object.fromEntries([gully, ankunft, handel, erwischt, nachKampf, danach].map(d => [d.id, d])),
  cutscenes: { [kanalSzene.id]: kanalSzene },
  mapAdditions: {
    'kanal-sammler': {
      hotspots: [
        {
          id: 'm2k-gully-notausgang', at: 'fluchtweg-tuer', label: 'Bürgermeister Gully', kind: 'talk', dialogue: gully.id,
          when: all(AKTIV, MIT_FLUCHTWEG, not(BEFREIT), noFlag('kanal_gully_hilft')),
        },
        {
          id: 'm2k-gully-abkuerzung', at: 'fluchtweg-tuer', label: 'Gullys Abkürzung ins Pumpwerk', kind: 'use',
          when: all(AKTIV, flag('kanal_gully_hilft'), not(BEFREIT)),
          lines: [nar('Gully hat mit Kreide Pfeile an die Wand gemalt. Und Totenköpfe an die falschen Abzweige. Sehr hilfreich.')],
          effects: [{ travel: 'pumpwerk-sieben', entry: 'von-kanal-sammler', minutes: 0 }],
        },
        {
          id: 'm2k-tunnel-ost-hinweis', at: [1440, 250], radius: 50, label: 'Tunnel Ost', kind: 'look',
          when: all(AKTIV, not(BEFREIT)),
          lines: [
            nar('Tunnel Ost. Dahinter ist es so dunkel, dass die Dunkelheit selbst eine Taschenlampe bräuchte. Irgendwo da hinten: Pumpwerk Sieben.'),
            l('raven', 'Ohne Licht kommst du da nicht durch. Stirnlampe auf, oder du hast Augen mit Restlicht.', 'neutral'),
          ],
        },
      ],
    },
    'pumpwerk-sieben': {
      onEnter: [
        { id: 'm2k-ankunft', once: true, when: all(AKTIV, not(BEFREIT)), dialogue: ankunft.id },
      ],
      hotspots: [
        {
          id: 'm2k-op-nische', at: 'op-nische', radius: 64, label: 'OP-Nische: Xion und Ripper', kind: 'talk', dialogue: handel.id,
          when: all(AKTIV, not(BEFREIT)),
        },
        {
          id: 'm2k-trage', at: 'op-nische', radius: 64, label: 'Die Trage', kind: 'talk', dialogue: danach.id,
          when: all(AKTIV, BEFREIT, not(BEI_DANTE)),
        },
        {
          id: 'm2k-sperre-wache', at: 'kanalvolk-sperre', radius: 44, label: 'Venom-Rekruten an der Engstelle', kind: 'look',
          when: all(AKTIV, not(BEFREIT), not(MIT_FLUCHTWEG)),
          lines: [
            nar('An der Engstelle rauchen zwei Venom-Rekruten und spielen Schnick-Schnack-Schnuck um Zigaretten. Xions Verstärkung. Wenn es knallt, sind die in zehn Sekunden unten.'),
            nar('Mit dem Kanalvolk auf deiner Seite stünde hier jetzt ein Kühlschrank.'),
          ],
        },
      ],
      npcs: [
        { id: 'm2k-gully-sperre', npc: 'buergermeister-gully', at: 'kanalvolk-sperre', when: all(AKTIV, MIT_FLUCHTWEG, not(BEFREIT)) },
      ],
    },
  },
};
