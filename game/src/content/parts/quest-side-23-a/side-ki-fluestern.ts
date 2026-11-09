// side-ki-fluestern · „Master?“ (world.md §6.3 Nr. 34). Oma Volt · Unterstadt, glasarkaden · T/A.
// Ersetzt den Platzhalter aus parts/integration/luecken.ts (gleiche Quest-ID).
// Fünf Beta-Chip-Träger reden synchron und sagen „Master“: Paul (neon-gasse), Frau Klingel (schrottmarkt),
// Gerda Gleis (fundbuero), Bruder Kabellos (stufenplatz), Barista Perle (cafe-sahnehaube). Jede Person einzeln befreien:
// gc-90 [Technik 5] Wartungsmodus · gc-91 [Ausstrahlung 6] persönliche Erinnerung · chip-blocker · Dantes Kekse
// („Wissenschaft!“) · bei Paul zusätzlich Kampf enc-markt-betreuer (Betäuben/Hacken).
// Start: Oma Volts Gespräch `oma-volt-paul` (npc-kinder-alte, ab he-oma-volt-6) oder hier der Hotspot am Kiosk / ihr Anruf.
// Belohnung: 280 XP, Ruf unterstadt +15, 5 × quantum-chip-schrott, meinung_plus_ki_fluestern, oma_volt_rabatt_5.
import type { ContentPart } from '../../part';
import type { Condition, DialogueDef, DialogueLine, QuestDef, QuestStepDef } from '../../../modules/contracts';

type Spot = NonNullable<NonNullable<ContentPart['mapAdditions']>[string]['hotspots']>[number];
import {
  active, AKT2, all, byId, ch, COUNTDOWN, dlg, flag, herz, inactive, item, l, msg, n, noFlag, node, p, phone, set,
  VEX, won, zeit,
} from './_lib';

const Q = 'side-ki-fluestern';
const OMA = 'oma-volt';

type Slot = 'morgen' | 'tag' | 'abend' | 'nacht';

interface Traeger {
  npc: string;
  key: string;
  name: string;
  map: string;
  spot: string;
  zeiten: Slot[];
  stepText: string;
  intro: DialogueLine[];
  /** Text der Erinnerungs-Wahl (gc-91). */
  erinnerungWahl: string;
  erinnerung: DialogueLine[];
  frei: DialogueLine[];
}

const frei = (t: Traeger): string => `ki_fluestern_${t.key}_frei`;

const TRAEGER: Traeger[] = [
  {
    npc: 'paul', key: 'paul', name: 'Paul', map: 'neon-gasse', spot: 'paul-ecke', zeiten: ['tag'],
    stepText: 'Paul an seiner Ecke in der Neon-Gasse. Er fegt. Ohne dass es einer verlangt hat.',
    intro: [
      n('Paul fegt die Neon-Gasse. Gründlich. Den Gully, die Wand, eine Taube, die nicht schnell genug war. Hinter seinem linken Ohr blinkt ein Chip, klein wie ein Hustenbonbon, im Takt von irgendwas.'),
      l('paul', 'Guten Tag. Das ist eine ausgezeichnete Entscheidung, Master. Möchten Sie gefegt werden?'),
      p('Paul. Ich bin’s.'),
      l('paul', 'Selbstverständlich sind Sie das, Master. Alle sind Master. Ich bin sehr zufrieden.'),
    ],
    erinnerungWahl: '„Paul. Dreiundvierzig Bewerbungen. Eine Antwort von deiner Tante: Hast du gegessen?“',
    erinnerung: [
      l('paul', 'Ich … habe gegessen. Master. Ich habe … Tante Volt hat Nudeln gemacht. Mit Ketchup. Weil ich keine Soße mag.'),
      n('Der Besen fällt. Paul starrt auf seine Hände.'),
      l('paul', 'Ich mag keine Soße. Das weiß nur sie. Das weiß kein Chip.'),
    ],
    frei: [
      l('paul', 'Au. AU. Was – warum steh ich hier? Warum hab ich einen Besen? Ich HASSE fegen!', 'ueberrascht'),
      l('paul', 'Die Snacks waren nicht mal gut. Es waren Reiswaffeln. Reiswaffeln mit Firmenlogo drauf.', 'wut'),
      l('paul', 'Sag Tante Volt nichts. Sag ihr alles. Nein. Doch. Ich sag’s ihr selbst. Morgen. Oder nachher.', 'verlegen'),
    ],
  },
  {
    npc: 'frau-klingel', key: 'klingel', name: 'Frau Klingel', map: 'schrottmarkt', spot: 'klingel-stand', zeiten: ['tag', 'abend'],
    stepText: 'Frau Klingel am Glockenstand auf dem Schrottmarkt. Ihr Radio im Ohr spielt nur noch Werbung.',
    intro: [
      n('Am Glockenstand ist es still. Zum ersten Mal, seit es den Schrottmarkt gibt. Frau Klingel poliert eine Kuhglocke, ohne sie anzuschlagen. Hinterm Ohr: der Chip.'),
      l('frau-klingel', 'Willkommen, Master. Heute im Angebot: Ruhe. Ruhe ist eine ausgezeichnete Entscheidung.'),
      l('frau-klingel', 'Mein Radio spielt jetzt nur noch Chrome 10. Das ist praktisch. Ich muss mir keine Lieblingslieder mehr merken.'),
    ],
    erinnerungWahl: 'Die größte Glocke am Stand nehmen und einmal kräftig draufhauen.',
    erinnerung: [
      n('BONNNNG. Der ganze Markt dreht sich um. Babette lässt einen Dampfkorb fallen. Irgendwo bellt Bolzen zurück.'),
      l('frau-klingel', 'Das ist … die Domglocke von Sankt Lötkolben. Die hab ich 2061 aus dem Schutt gezogen. Mit meinem Mann. Er hat gesagt, sie klingt wie ich, wenn ich wütend bin.'),
      l('frau-klingel', 'Ich BIN wütend.'),
    ],
    frei: [
      l('frau-klingel', 'Wer hat mir dieses Ding ins Ohr gesteckt? Wer? Ich will NAMEN! Ich hab hier hundertzwölf Glocken und zu jeder einen Hammer!', 'wut'),
      l('frau-klingel', 'Und warum ist mein Stand so ordentlich? Das ist kein Stand mehr, das ist ein Museum. Furchtbar.', 'besorgt'),
    ],
  },
  {
    npc: 'gerda-gleis', key: 'gerda', name: 'Gerda Gleis', map: 'fundbuero', spot: 'schalter', zeiten: ['morgen', 'tag'],
    stepText: 'Gerda Gleis im Fundbüro am Bahnhof. Sie gibt alles zurück. Auch Sachen, die keinem gehören.',
    intro: [
      n('Das Fundbüro ist leer. Nicht aufgeräumt: leer. Die Regale, sonst bis zur Decke voll mit Schirmen, Gebissen und einem ausgestopften Dachs, sind abgeräumt. Gerda Gleis steht am Schalter und lächelt.'),
      l('gerda-gleis', 'Willkommen im Fundbüro, Master. Alle Gegenstände wurden ihren Besitzern zurückgegeben. Die übrigen wurden Quantum Dynamics zur Optimierung übergeben.'),
      l('gerda-gleis', 'Auch der Dachs. Der Dachs ist jetzt Teil eines größeren Ganzen.'),
    ],
    erinnerungWahl: '„Gerda. Wo ist Herbert?“ (Der Dachs hieß Herbert. Das weiß jeder, der zweimal hier war.)',
    erinnerung: [
      l('gerda-gleis', 'Herbert ist … Herbert war seit 2071 im Fundbüro. Niemand hat ihn abgeholt. Fünfzehn Jahre. Ich hab ihm jeden Freitag den Staub aus dem Fell geföhnt.'),
      n('Ihr Lächeln verrutscht. Darunter: eine sehr, sehr alte Wut. Die Wut einer Frau, die vierzig Jahre lang Leuten erklärt hat, dass ihre Brille nicht „einfach weg“ ist.'),
      l('gerda-gleis', 'Die haben meinen Dachs.'),
    ],
    frei: [
      l('gerda-gleis', 'Die haben meinen DACHS genommen! Und meine Schirme! Und das Gebiss von Herrn Pölzig, der kommt seit neun Jahren jeden Dienstag gucken, ob es noch da ist!', 'wut'),
      l('gerda-gleis', 'Ich hol mir das zurück. Alles. Notfalls mit Formular. Ich hab sehr fiese Formulare.', 'signatur'),
    ],
  },
  {
    npc: 'bruder-kabellos', key: 'kabellos', name: 'Bruder Kabellos', map: 'stufenplatz', spot: 'prediger-kiste', zeiten: ['tag'],
    stepText: 'Bruder Kabellos auf seiner Kiste am Stufenplatz. Er predigt jetzt das Gegenteil von Funkstille.',
    intro: [
      n('Bruder Kabellos steht auf seiner Kiste, wie immer. Aber das Schild ist neu. Statt „FUNKSTILLE IST GOTTES STILLE“ steht da in Chrome-Schrift: „VERBINDUNG IST ALLES“.'),
      l('bruder-kabellos', 'Brüder! Schwestern! Master! Lasst euch verbinden! Der Chip hört zu! Der Chip versteht! Der Chip hat Updates!'),
      l('bruder-kabellos', 'Ich war blind. Ich war offline. Jetzt sehe ich: Das ist eine ausgezeichnete Entscheidung.'),
    ],
    erinnerungWahl: 'Sein altes Schild aus dem Müll ziehen und ihm vor die Nase halten.',
    erinnerung: [
      n('Das alte Pappschild, durchweicht, mit Tesafilm geflickt. „FUNKSTILLE IST GOTTES STILLE.“ Darunter, klein, in seiner Handschrift: „Und meine auch.“'),
      l('bruder-kabellos', 'Das hab ich … das hab ich in der Nacht geschrieben, als mein Telefon mir gesagt hat, wann ich traurig sein soll. Ich hab es in den Kanal geworfen. Das Telefon. Nicht das Schild.'),
      l('bruder-kabellos', 'Etwas summt in meinem Kopf. Etwas, das nicht ich ist.', 'besorgt'),
    ],
    frei: [
      l('bruder-kabellos', 'STILLE! Ah. Ah, da ist sie. Die gute Stille. Die Stille, in der man seine eigenen Gedanken hört. Meine sind gerade alle sehr laut und sehr unanständig.', 'wut'),
      l('bruder-kabellos', 'Die haben mir einen Sender ins Hirn gebaut. MIR. Ich hab seit zwölf Jahren kein Display angefasst. Das ist, als würde man einem Veganer heimlich Wurst in den Schlaf stopfen.', 'wut'),
    ],
  },
  {
    npc: 'barista-perle', key: 'perle', name: 'Barista Perle', map: 'cafe-sahnehaube', spot: 'theke', zeiten: ['morgen', 'tag', 'abend'],
    stepText: 'Barista Perle im Café Sahnehaube. Sie macht jedem denselben Kaffee. Und sie tratscht nicht mehr.',
    intro: [
      n('Café Sahnehaube. Perle steht hinter der Theke und schäumt Milch. Jede Tasse bekommt dasselbe Muster: das Logo von Quantum Dynamics. Sie lächelt dabei, als hätte jemand ihr das Lächeln eingestellt.'),
      l('barista-perle', 'Willkommen, Master. Heute empfehle ich: Kaffee. Kaffee ist eine ausgezeichnete Entscheidung.'),
      l('barista-perle', 'Ich habe nichts gehört. Ich habe nichts gesehen. Ich erzähle nichts. Es gibt nichts zu erzählen.'),
    ],
    erinnerungWahl: '„Perle. Der Typ am Ecktisch. Der mit der Perücke. Was ist mit dem?“',
    erinnerung: [
      n('Ihre Augen wandern zum Ecktisch. Es sitzt niemand dort. Aber Perle sieht trotzdem hin. Sie hat dreißig Jahre lang hingesehen.'),
      l('barista-perle', 'Der … der Kerl kommt jeden Donnerstag. Die Perücke ist nicht seine. Die gehört seiner Exfrau. Er trägt sie, damit sie ihn nicht erkennt, wenn er ihr Café beobachtet. Das hier. Es ist ihr Café. Er weiß nicht, dass ICH sie bin.'),
      l('barista-perle', 'Oh. Oh, das ist eine GUTE Geschichte. Warum hab ich die niemandem erzählt?'),
    ],
    frei: [
      l('barista-perle', 'Weil mir irgendein Mistkerl ein Ding in den Kopf geschraubt hat, das ist warum! Ich hab drei Wochen lang nicht getratscht! Weißt du, wie viel ich verpasst hab?', 'wut'),
      l('barista-perle', 'Setz dich. Kaffee geht aufs Haus. Und dann erzählst du mir alles, und ich erzähl dir, wer letzte Woche mit wem in der Damentoilette war. Nein, du willst es wissen. Glaub mir.', 'freude'),
    ],
  },
];

// ---------------------------------------------------------------------------------------------- Dialog je Träger

const traegerDlg = (t: Traeger): DialogueDef => dlg(`ki-${t.key}`, [
  node('start', t.intro, {
    choices: [
      ch('Hinter dem Ohr den Chip abtasten und den Wartungsmodus suchen.', 'wartung', { check: 'gc-90' }),
      ch(t.erinnerungWahl, 'erinnerung', { check: 'gc-91' }),
      ch('Den Chip-Blocker hinters Ohr kleben.', 'blocker', { requires: item('chip-blocker'), effects: [{ take: 'chip-blocker' }] }),
      ch('„Wissenschaft!“ – und einen von Dantes Keksen in den Mund stopfen.', 'kekse', { requires: item('dantes-kekse'), effects: [{ take: 'dantes-kekse' }] }),
      ch('Später. Mit Werkzeug.'),
    ],
  }),
  node('wartung', [
    n('Unter dem Chip ist eine Fuge, kaum breiter als ein Fingernagel. Dreimal drücken, kurz, lang, kurz. Der Chip piept beleidigt und zeigt eine winzige Zeile: „WARTUNGSMODUS. BITTE NICHT DAS GERÄT AUSSCHALTEN.“'),
    n('Du schaltest das Gerät aus. Der Chip fällt in deine Hand, warm und klebrig wie ein ausgespuckter Kaugummi.'),
  ], { next: 'frei' }),
  node('erinnerung', t.erinnerung, {
    effects: [msg(`${t.name} reißt sich den Chip selbst vom Ohr.`)],
    next: 'frei',
  }),
  node('blocker', [
    n('Der Blocker ist ein graues Pflaster mit einer Kupferspule. Du klebst ihn über den Chip. Ein Knistern, ein Geruch nach verschmortem Haar, dann rutscht der Chip einfach ab.'),
  ], { next: 'frei' }),
  node('kekse', [
    n('Dantes Kekse. Hart wie Pflastersteine, und man weiß nie genau, was drin ist. Diesmal: offenbar irgendwas, das Chips nicht mögen. Es kracht, es kaut, es hustet.'),
    n('Der Chip springt vom Ohr wie ein Floh, der beschlossen hat, auszuwandern.'),
  ], { next: 'frei' }),
  node('frei', t.frei, {
    effects: [set(frei(t)), herz(t.npc, 40), msg(`${t.name} ist den Chip los.`)],
  }),
]);

const TRAEGER_DLG = TRAEGER.map(traegerDlg);
const ALLE_FREI: Condition = all(...TRAEGER.map((t) => flag(frei(t))));
const PAUL_FREI: Condition = flag(frei(TRAEGER[0]));

// ---------------------------------------------------------------------------------------------- Auftakt bei Oma Volt

const auftakt: DialogueDef = dlg('ki-oma-auftakt', [
  node('start', [
    l(OMA, 'Kindchen. Komm her. Nein, näher. Ich will nicht, dass die Wände mithören. Die Wände hier haben neuerdings Werbung.', 'besorgt'),
    l(OMA, 'Paul. Mein Paul. Der hat heut Morgen mein Kiosk gefegt. Freiwillig. Und dann hat er zu einem Besen „Master“ gesagt.'),
    l(OMA, 'Und der ist nicht allein. Die Klingel vom Markt. Gerda vom Fundbüro. Der verrückte Prediger, der vorher gegen Telefone gepredigt hat. Und Perle, die Kaffeetante in den Glasarkaden. Alle so … höflich. Wie Schaufensterpuppen mit Manieren.'),
    l(OMA, 'Die waren alle am Werbestand. Chrome 10. „Kostenloser Chip-Test, fünfzig Credits und Snacks.“ Snacks! Für Snacks verkaufen die ihr Hirn!', 'wut'),
  ], {
    choices: [
      ch('„Ich hol sie dir zurück. Alle fünf.“', 'zusage'),
      ch('„Hab grad keine Zeit, Oma.“'),
    ],
  }),
  node('zusage', [
    l(OMA, 'Gut. Dante sagt, man kriegt die Dinger mit Technik raus. Oder mit einem Blocker. Oder mit seinen Keksen, aber das sagt Dante über alles.', 'signatur'),
    l(OMA, 'Und manchmal reicht es, wenn man sie an was erinnert. An was Echtes. Das hat Opa Blech gesagt. Opa Blech ist eine Maschine. Der muss es wissen.'),
    l(OMA, 'Und wenn du den findest, der das macht, hau ihm eine. Von mir. Mit Schwung.', 'wut'),
  ], { effects: [{ startQuest: Q }] }),
]);

// ---------------------------------------------------------------------------------------------- Paul über den Kampf

const betreuer: DialogueDef = dlg('ki-betreuer', [
  node('start', [
    n('Mitten auf dem Markt: zwei Quantum-Kundenbetreuer in Pastell, mit Lächeln wie Kühlschranklicht. Zwischen ihnen Paul, der ein Tablett mit Gratis-Chips trägt und jedem „Master“ zuruft.'),
    l('paul', 'Das ist eine ausgezeichnete Entscheidung, Master. Nehmen Sie zwei. Einer ist für die Tante.'),
  ], {
    choices: [
      ch('Die Betreuer weghauen. Paul nur betäuben.', 'kampf'),
      ch('Erst mal nur gucken.'),
    ],
  }),
  node('kampf', [
    n('Der linke Betreuer sieht dich kommen und lächelt noch breiter. „Ah! Ein Neukunde!“'),
  ], { effects: [{ battle: 'enc-markt-betreuer' }] }),
]);

const paulNachKampf: DialogueDef = dlg('ki-paul-nachkampf', [
  node('start', [
    n('Paul sitzt auf einem umgekippten Gemüsekorb und hält sich den Kopf. Der Chip liegt neben ihm im Dreck, zertreten.'),
  ], { next: 'frei' }),
  node('frei', TRAEGER[0].frei, { effects: [set(frei(TRAEGER[0])), herz('paul', 40)] }),
]);

// ---------------------------------------------------------------------------------------------- Werbestand (optional)

const werbestand: DialogueDef = dlg('ki-werbestand', [
  node('start', [
    n('Der Chrome-10-Werbestand in den Glasarkaden. Ein Tisch, ein Banner „Freiwillige gesucht! 50 Cr + Snacks!“, eine Schale Reiswaffeln mit Firmenlogo. Hinter dem Tisch: niemand. Nur ein Tablet, das auf „Nächster Proband: bitte lächeln“ steht.'),
    n('Unterm Tisch: ein Karton mit Beta-Chips. Mindestens fünfzig. Daneben ein Ausdruck: „Zielgruppe Unterstadt. Geringe Beschwerdewahrscheinlichkeit.“'),
  ], {
    choices: [
      ch('Den Karton in den Springbrunnen kippen. Das Tablet hinterher.', 'kippen'),
      ch('Das Tablet so umprogrammieren, dass es jedem rät, die Finger davon zu lassen.', 'tablet', { check: 'gc-90' }),
      ch('In Ruhe lassen.'),
    ],
  }),
  node('kippen', [
    n('Platsch. Platsch. Die Chips sinken wie silberne Fischchen. Ein Wachmann der Glasarkaden sieht zu, sagt „Hab nix gesehen“ und isst eine Reiswaffel.'),
  ], { effects: [set('ki_werbestand_zerlegt'), { xp: 40 }] }),
  node('tablet', [
    n('Das Tablet zeigt jetzt in großen Buchstaben: „FREIWILLIGE GESUCHT. ZUM DAVONLAUFEN. JETZT.“ Darunter ein Pfeil Richtung Ausgang.'),
    n('Eine Frau mit Einkaufstüten bleibt stehen, liest, nickt und geht schneller.'),
  ], { effects: [set('ki_werbestand_zerlegt'), { xp: 40 }, { rep: 'unterstadt', delta: 5 }] }),
]);

// ---------------------------------------------------------------------------------------------- Abschluss

const abschluss: DialogueDef = dlg('ki-oma-abschluss', [
  node('start', [
    n('Vor dem Volt-Eck stehen sie alle fünf. Paul mit Pflaster hinterm Ohr. Frau Klingel mit einer Glocke unterm Arm, als wäre es eine Waffe. Gerda mit einem Formular. Bruder Kabellos mit seinem alten Schild. Perle mit einer Thermoskanne und sehr vielen Neuigkeiten.'),
    l(OMA, 'Da ist es ja. Mein dummes, gutes Kind.', 'freude'),
    l('paul', 'Tante Volt. Ich … es tut mir leid. Es gab Snacks.', 'verlegen'),
    l(OMA, 'Es gibt immer Snacks, Paul. Darum sagt man nicht Ja. Darum sagt man: Was ist der Haken?', 'wut'),
    l(OMA, 'Und jetzt alle rein. Ich mach Blitzbrause. Und du kriegst ab heute fünf Prozent. Bei mir. Bis an mein Lebensende. Oder deins.', 'signatur'),
  ], {
    choices: [
      ch('„Die Chips hab ich behalten. Dante kann damit was anfangen.“', 'chips'),
      ch('„Den, der das macht, hau ich noch. Versprochen.“', 'hauen'),
      ch('„Dein Paul, Oma. Der war tapfer.“', 'paul'),
    ],
  }),
  node('chips', [
    l(OMA, 'Gut. Gib sie Dante. Der soll die auseinandernehmen und dann wieder zusammensetzen, aber falsch herum.'),
  ], { next: 'ende' }),
  node('hauen', [
    l(OMA, 'Mit Schwung. Und von unten. Von unten tut’s mehr weh.', 'signatur'),
  ], { next: 'ende' }),
  node('paul', [
    l('paul', 'War ich das? Echt?', 'freude'),
    l(OMA, 'Nein. Aber wir tun so. Das macht man in Familien.', 'zaertlich'),
  ], { effects: [herz('paul', 20)], next: 'ende' }),
  node('ende', [
    l('barista-perle', 'Und JETZT erzähl ich euch, wer letzten Donnerstag mit einer Perücke im Café saß.', 'freude'),
    l('frau-klingel', 'BONG!'),
  ], { effects: [set('ki_abschluss'), herz(OMA, 60)] }),
]);

// ---------------------------------------------------------------------------------------------- Quest

const traegerStep = (t: Traeger): QuestStepDef => ({
  id: t.key,
  text: t.stepText,
  done: t.key === 'paul' ? { any: [flag(frei(t)), won('enc-markt-betreuer')] } : flag(frei(t)),
  marker: { map: t.map, at: t.spot },
});

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: 'Master?',
  summary: 'Oma Volts Neffe Paul ist „so komisch höflich“. Und er ist nicht der Einzige: Fünf Leute aus der Unterstadt tragen Beta-Chips aus dem Chrome-10-Werbestand und nennen alle „Master“.',
  giver: OMA,
  act: 2,
  steps: [
    ...TRAEGER.map(traegerStep),
    {
      id: 'werbestand', optional: true,
      text: 'Optional: Den Chrome-10-Werbestand in den Glasarkaden lahmlegen, damit keiner nachrückt.',
      done: flag('ki_werbestand_zerlegt'), marker: { map: 'glasarkaden', at: 'chrome-10-werbestand' },
    },
    {
      id: 'oma', text: 'Alle fünf sind frei. Zurück zu Oma Volt an den Kiosk.',
      when: ALLE_FREI, done: flag('ki_abschluss'), marker: { map: 'neon-gasse', at: 'kiosk' },
    },
  ],
  reward: {
    xp: 280,
    rep: { unterstadt: 15 },
    items: { 'quantum-chip-schrott': 5 },
    effects: [set('meinung_plus_ki_fluestern'), set('oma_volt_rabatt_5')],
  },
};

// ---------------------------------------------------------------------------------------------- Hotspots

const traegerHotspot = (t: Traeger, dlgId: string): Spot => ({
  id: `ki-${t.key}`,
  at: t.spot,
  label: `${t.name} (gechippt)`,
  kind: 'talk',
  dialogue: dlgId,
  when: all(active(Q), noFlag(frei(t)), zeit(...t.zeiten), ...(t.key === 'paul' ? [{ not: won('enc-markt-betreuer') }] : [])),
});

const additions: NonNullable<ContentPart['mapAdditions']> = {};
const add = (map: string, hotspot: Spot): void => {
  additions[map] ??= { hotspots: [] };
  additions[map].hotspots = [...(additions[map].hotspots ?? []), hotspot];
};

TRAEGER.forEach((t, i) => add(t.map, traegerHotspot(t, TRAEGER_DLG[i].id)));
add('neon-gasse', {
  id: 'ki-oma-auftakt', at: 'kiosk', label: 'Oma Volt winkt dich heran', kind: 'talk',
  dialogue: auftakt.id, when: all(AKT2, COUNTDOWN, inactive(Q), zeit('morgen', 'tag', 'abend')),
});
add('neon-gasse', {
  id: 'ki-oma-abschluss', at: 'kiosk', label: 'Oma Volt und die Befreiten', kind: 'talk',
  dialogue: abschluss.id, when: all(active(Q), ALLE_FREI, noFlag('ki_abschluss'), zeit('morgen', 'tag', 'abend')),
});
add('schrottmarkt', {
  id: 'ki-betreuer', at: 'marktplatz-mitte', label: 'Kundenbetreuer mit Paul', kind: 'talk',
  dialogue: betreuer.id, when: all(active(Q), { not: PAUL_FREI }, { not: won('enc-markt-betreuer') }, zeit('tag', 'abend')),
});
add('schrottmarkt', {
  id: 'ki-paul-nachkampf', at: 'marktplatz-mitte', label: 'Paul auf dem Gemüsekorb', kind: 'talk',
  dialogue: paulNachKampf.id, when: all(active(Q), won('enc-markt-betreuer'), { not: PAUL_FREI }),
});
add('glasarkaden', {
  id: 'ki-werbestand', at: 'chrome-10-werbestand', label: 'Chrome-10-Werbestand (unbesetzt)', kind: 'use',
  dialogue: werbestand.id, when: all(active(Q), noFlag('ki_werbestand_zerlegt')),
});

// ---------------------------------------------------------------------------------------------- Telefon

const phones = [
  phone('ki-oma-anruf', OMA, 'Kindchen, komm am Kiosk vorbei. Paul ist komisch. Er hat „Master“ zu mir gesagt. Ich bin nicht sein Master. Ich bin seine TANTE. Großtante. Irgendwas mit Tante.', {
    auto: all(AKT2, COUNTDOWN, inactive(Q), noFlag('paul_komisch'), zeit('tag')),
    replies: [
      { text: '„Bin unterwegs.“' },
      { text: '„Vielleicht ist er einfach höflich geworden.“', effects: [{ phone: 'ki-oma-anruf-2' }] },
    ],
  }),
  phone('ki-oma-anruf-2', OMA, 'Höflich. PAUL. Komm her, bevor ich durchs Telefon greife.'),
  phone('ki-vex', 'paul', 'Hallo, Master. Sie haben eine ausgezeichnete Entscheidung getroffen. Tante Volt sagt, Sie tragen auch eine Uniform. Möchten Sie gefegt werden?', {
    auto: all(VEX, active(Q), noFlag(frei(TRAEGER[0])), zeit('abend')),
  }),
];

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: byId([...TRAEGER_DLG, auftakt, betreuer, paulNachKampf, werbestand, abschluss]),
  phone: byId(phones),
  mapAdditions: additions,
};
