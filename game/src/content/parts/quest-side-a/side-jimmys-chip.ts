// Nebenquest 6 `side-jimmys-chip` „Jimmys Chip“ (world.md §6.2 Nr. 6). Auftraggeberin Vega; Start in Vegas Gespräch
// (npc-crew-b/vega.ts) bzw. per Telefon. jimmy-spur-01…08 liegen auf den Zonenkarten; ab 4 (Gossenkind: 2) erscheint
// Jimmy abends/nachts an den Ölfass-Türmen der Hafenkante.
// Beruhigen: gc-58 [Technik 7] Ruhemodus · [Vega ♥4] Vega redet ihn herunter (Vega ♥ +100) · Lieblingsplatte
// „Kabelbrand – Live im Keller“ mit plattenspieler-tragbar · Kampf enc-hafen-jimmy (nicht-tödlich).
// Dante (auch vor Akt 2: „nur Reparatur“) → Wahl Neustart / Patch → Herkunft: gc-59 [Straße 6] Ripper-Seriennummer ·
// [Dante ♥3] Quantum-Logo unter dem Lack · he-jimmy-6 Xions Werbestand · ohne Check: Werbestand in der Neon-Gasse ansehen.
import type { ContentPart } from '../../part';
import type { CutsceneDef, DialogueDef, PhoneMessageDef, QuestDef } from '../../../modules/contracts';
import { active, all, any, dlg, done, flag, hearts, ich, inactive, item, l, mindestens, msg, nar, node, noFlag, not, set, time, tschuess, VEX } from './_lib';

const Q = 'side-jimmys-chip';
const JI = 'jimmy';
const VE = 'vega';
const DA = 'dante';

const SPUREN = ['01', '02', '03', '04', '05', '06', '07', '08'].map((n) => `jimmy-spur-${n}`);
/** Ab 4 Spuren erscheint Jimmy (Gossenkinder zählen doppelt) – gleiche Regel wie in Vegas Gespräch. */
const JIMMY_DA = any(mindestens(SPUREN, 4), all({ origin: 'origin-gossenkind' }, mindestens(SPUREN, 2)), flag('jimmy_spuren_genug'));
const BERUHIGT = any(flag('jimmy_beruhigt'), { won: 'enc-hafen-jimmy' });
const WAHL = any(flag('jimmy_neustart'), flag('jimmy_patch'));
const HERKUNFT = any(flag('jimmy_herkunft_ripper'), flag('jimmy_herkunft_quantum'), flag('jimmy_herkunft_xion'));

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: 'Jimmys Chip',
  summary: 'Jimmy war Crew. Dann hat er an Xions Werbestand einen Gratis-Chip eingesteckt. Jetzt hält er sich für den Kundenservice von morgen. Vega will ihn zurück.',
  giver: VE,
  act: 1,
  steps: [
    {
      id: 'spuren', text: 'Sammle Jimmys Spuren: Werbezettel, Ölfass-Türmchen, Kreidestriche (Schrottmarkt, Rohrsiedlung, Bahnhof, Hafen, Kanal, Flutmauer). Ab vier zeigt sich ein Muster.',
      done: JIMMY_DA, marker: { map: 'bahnhof-mitte' },
    },
    {
      id: 'finden', text: 'Finde Jimmy an den Ölfass-Türmen der Hafenkante. Abends und nachts ist er am „klarsten“.',
      when: JIMMY_DA, done: any(flag('jimmy_gefunden'), BERUHIGT), marker: { map: 'hafenkante' },
    },
    {
      id: 'beruhigen', text: 'Beruhige Jimmy – mit Technik, mit Vega, mit Musik oder mit sanfter Gewalt.',
      when: flag('jimmy_gefunden'), done: BERUHIGT, marker: { map: 'hafenkante' },
    },
    {
      id: 'dante', text: 'Bring Jimmy zu Dante in die Werkstatt (Lötgassen).',
      when: BERUHIGT, done: WAHL, marker: { map: 'dantes-werkstatt' },
    },
    {
      id: 'herkunft', text: 'Finde heraus, woher der Virus kam.',
      when: WAHL, done: HERKUNFT, marker: { map: 'dantes-werkstatt' },
    },
    {
      id: 'vega', text: 'Bring Vega die Nachricht. Sie sitzt abends an ihrem Tisch im High Voltage.',
      when: HERKUNFT, done: flag('jimmy_abschluss'), marker: { map: 'high-voltage' },
    },
  ],
  reward: {
    xp: 300,
    credits: 200,
    items: { 'jimmys-jacke': 1 },
    relations: { vega: 60 },
    effects: [msg('Hinweis: Jimmy erzählt, dass am Kanal-Sammler kistenweise Quantum-Chips im Ausschuss landen. „Wie Konfetti. Nur böse.“')],
  },
};

// ---------------------------------------------------------------------------------------------- Telefon (Auftakt)

const tel: PhoneMessageDef = {
  id: 'tel-vega-jimmy',
  from: VE,
  text: 'Hast du kurz? Es geht um Jimmy. Ehemals Crew. Jetzt Werbespot. Ich bin tagsüber am Bahnsteig-Ende, abends im HV. Ich zahl. – V.',
  auto: all(done('main-1-probezeit'), inactive(Q), { dayAtLeast: 3 }),
  replies: [
    { text: 'Erzähl.', effects: [{ startQuest: Q }] },
    { text: 'Später.' },
  ],
};

// ---------------------------------------------------------------------------------------------- Jimmy am Bahnsteig (tags)

const bahnsteig: DialogueDef = dlg('side-jimmy-bahnsteig', [
  node('start', [
    nar('Am Bahnsteig-Ende steht ein junger Mann im ölverschmierten Overall und verbeugt sich vor jedem einfahrenden Zug. Er hat ein Schild aus Pappe: „SERVICE“.'),
    l(JI, 'Willkommen, wie kann ich Ihre Zukunft optimieren? Unser Angebot heute: Fahrt. Optional: Ankunft.', 'freude'),
  ], {
    choices: [
      { text: '„Jimmy? Ich bin von der Crew. Vega schickt mich.“', next: 'vega' },
      tschuess('(Weitergehen.)'),
    ],
  }),
  node('vega', [
    l(JI, 'Vega. Vega. Kundennummer … Fehler 404. Bitte versuchen Sie es später. Bitte versuchen Sie es heute Abend. Bitte am Hafen. Warum sage ich das?', 'besorgt'),
    nar('Er blinzelt. Für eine Sekunde sieht er dich an wie jemand, der aus einem tiefen Traum gerissen wird. Dann lächelt er wieder sein Verkäuferlächeln.'),
    l(JI, 'Ihre Zufriedenheit ist uns wichtig!'),
  ], { effects: [set('jimmy_bahnsteig_gesehen')] }),
]);

// ---------------------------------------------------------------------------------------------- Ölfass-Türme (abends/nachts)

const tuerme: DialogueDef = dlg('side-jimmy-tuerme', [
  node('start', [
    nar('Zwischen den Containern am Kai-Ende stehen Türme aus Ölfässern, mannshoch, sorgfältig ausgerichtet, jeder mit einem Kronkorken obendrauf. Dazwischen: Jimmy, mit einem weiteren Fass auf der Schulter.'),
    l(JI, 'Willkommen im Turmcenter! Heute im Angebot: Türme. Morgen im Angebot: mehr Türme. Übermorgen: Systemabsturz!', 'freude'),
    l(JI, 'Moment. Sie sind nicht im System. Sie sind … ein Gesicht. Ich kenne Gesichter. Gesichter sind … Fehler 418, ich bin eine Teekanne.', 'besorgt'),
  ], {
    choices: [
      { text: 'An seinem Nacken die Wartungsbuchse finden und den Neurochip in den Ruhemodus schicken.', check: 'gc-58', next: 'ruhemodus' },
      { text: '„Vega, sag du was. Er hört auf dich.“', tag: '[Vega ♥4]', requires: hearts(VE, 4), next: 'vega' },
      {
        text: 'Den tragbaren Plattenspieler aufstellen. „Kabelbrand – Live im Keller“. Seine Lieblingsplatte.', tag: '[Plattenspieler]',
        requires: item('plattenspieler-tragbar'), next: 'platte',
      },
      { text: '„Tut mir leid, Jimmy.“ (Ihn außer Gefecht setzen, so sanft wie möglich.)', next: 'kampf' },
      { text: '„Ich komm wieder.“' },
    ],
  }),
  node('ruhemodus', [
    nar('Du greifst in seinen Nacken. Jimmy erstarrt. Auf seiner Netzhaut flackert ein Ladebalken, dann ein Werbespot für Zahnpasta, dann – nichts.'),
    l(JI, 'Ruhemodus … aktiviert. Ich bin so müde. Ich bin seit Wochen müde. Darf ich mich hinsetzen?', 'trauer'),
    nar('Er setzt sich auf ein Ölfass, legt den Kopf auf die Knie und atmet. Zum ersten Mal ganz normal.'),
  ], { effects: [set('jimmy_gefunden'), set('jimmy_beruhigt')], next: 'weg' }),
  node('vega', [
    nar('Vega löst sich aus dem Schatten der Container. Du hast nicht gewusst, dass sie dir gefolgt ist. Niemand weiß das je.'),
    l(VE, 'Jimmy. Ich bin’s.', 'besorgt'),
    l(JI, 'Willkommen, wie kann ich – ', 'freude'),
    l(VE, 'Nein. Kein Service. Du hast mir mal beigebracht, wie man Dosenravioli auf einem Heizkörper warm macht. Weißt du noch? Zwölfter Stock. Sektor 4. Es hat geregnet.', 'trauer'),
    nar('Jimmy lässt das Fass sinken. Sein Lächeln zerbricht und wird zu etwas Echtem.'),
    l(JI, 'Vega? … Vega. Die Ravioli waren kalt. Du hast trotzdem gesagt, sie wären gut.', 'trauer'),
    l(VE, 'Sie waren scheiße. Komm nach Hause.', 'zaertlich'),
  ], { effects: [set('jimmy_gefunden'), set('jimmy_beruhigt'), { relation: VE, delta: 100 }], next: 'weg' }),
  node('platte', [
    nar('Knistern. Dann Bass, der durch die Container rollt, und eine Stimme, die schreit, als hätte sie das Recht dazu.'),
    l(JI, 'Das ist … Track drei. Mit dem verpatzten Einsatz. Ich hab da gestanden. Ganz vorne. Ich hab mir den Ellbogen gebrochen.', 'ueberrascht'),
    nar('Jimmy wippt mit dem Fuß. Dann mit dem Kopf. Dann setzt er sich hin und weint, ohne aufzuhören zu wippen.'),
  ], { effects: [set('jimmy_gefunden'), set('jimmy_beruhigt')], next: 'weg' }),
  node('kampf', [
    l(JI, 'Kundenbeschwerde erkannt! Eskalation an die Abteilung Türme!', 'wut'),
  ], { effects: [set('jimmy_gefunden'), { battle: 'enc-hafen-jimmy' }] }),
  node('weg', [
    ich('Komm. Wir bringen dich zu Dante. Der repariert alles. Sogar Leute.'),
    l(JI, 'Dante. Der Mann mit den Keksen. Ist er im System?', 'neutral'),
    ich('Dante ist das System.'),
  ]),
]);

// Nach dem Kampf: Jimmy liegt zwischen den Fässern und schnarcht Jingles.
const schnarcht: DialogueDef = dlg('side-jimmy-schnarcht', [
  node('start', [
    nar('Jimmy liegt zwischen den Fässern und schnarcht. Jedes Schnarchen ist ein Werbejingle. „Volt-Limo – die Brause mit Stromschlag“ in Endlosschleife.'),
    ich('Okay, Großer. Ab zu Dante.'),
    nar('Du lädst ihn dir auf die Schulter. Er ist leichter, als er aussieht. Leute, die zu lange nicht gegessen haben, sind das immer.'),
  ], { effects: [set('jimmy_getragen')] }),
]);

// ---------------------------------------------------------------------------------------------- Dante: Reparatur, Wahl, Herkunft

const dante: DialogueDef = dlg('side-jimmy-dante', [
  node('start', [
    nar('Jimmy sitzt auf dem Hocker an der Werkbank. Dante leuchtet ihm mit einer Lupenlampe in den Nacken und pfeift durch die Zähne.'),
    l(DA, 'Um Himmels Willen. Wer hat dir das eingebaut, Junge? Ein Schimpanse mit Lötkolben?', 'ueberrascht'),
    l(JI, 'Gratis-Chip! Nur heute! Snacks inklusive!', 'freude'),
    l(DA, 'Ich darf offiziell nichts mehr hacken. Ich bin im Ruhestand. Das hier ist keine Hackerei. Das ist … Reparatur. Nur Reparatur. Wenn jemand fragt.', 'signatur'),
    l(DA, 'Zwei Möglichkeiten. Neustart: Ich mach den Chip platt, Jimmy ist stabil, aber er vergisst einiges. Die letzten Monate sicher. Vielleicht mehr. Oder Patch: Ich flick drüber, er behält alles. Aber er bleibt … Jimmy mit Extras. Chipfieber. Werbesprüche bei Vollmond.', 'besorgt'),
  ], {
    choices: [
      { text: '„Neustart. Er soll wieder er selbst sein. Auch wenn er was verliert.“', next: 'neustart' },
      { text: '„Patch. Er soll nichts vergessen. Auch das Chaos gehört zu ihm.“', next: 'patch' },
      { text: '„Jimmy, was willst du?“', next: 'fragen' },
    ],
  }),
  node('fragen', [
    l(JI, 'Ich will … ich will Ihre Zukunft optimieren.', 'neutral'),
    l(JI, 'Nein. Ich will wissen, was ich vergessen hab. Und ich will vergessen, was ich weiß. Geht beides? Es geht nicht beides. Ihre Entscheidung ist uns wichtig.', 'trauer'),
  ], {
    choices: [
      { text: '„Neustart.“', next: 'neustart' },
      { text: '„Patch.“', next: 'patch' },
    ],
  }),
  node('neustart', [
    nar('Dante dreht an drei Schrauben, tippt auf einer Tastatur von 2049 und zieht einen Stecker. Jimmy zuckt. Seine Augen werden leer. Dann füllen sie sich wieder.'),
    l(JI, 'Wo … bin ich? Warum riecht es hier nach Vanille und Lötzinn? Warum hab ich Öl unter den Fingernägeln?', 'ueberrascht'),
    l(DA, 'Willkommen zurück, Junge. Du hast ein paar Monate verpasst. Keine guten. Iss einen Keks.', 'zaertlich'),
  ], { effects: [set('jimmy_neustart')], next: 'herkunft' }),
  node('patch', [
    nar('Dante lötet einen winzigen Draht über den Chip. Jimmy blinzelt, grinst, und für einen Moment flackert ein Werbebanner in seinem Blick.'),
    l(JI, 'Ich bin wieder da! Ich erinnere mich an alles! An die Türme! An die Fässer! Ich hab mit einer Möwe einen Mobilfunkvertrag abgeschlossen!', 'freude'),
    l(DA, 'Er bleibt ein bisschen … laut. Aber er ist ganz. Das ist mehr, als ich von mir sagen kann.', 'signatur'),
  ], { effects: [set('jimmy_patch')], next: 'herkunft' }),
  node('herkunft', [
    l(DA, 'Jetzt die Frage, die mich wirklich ankotzt: Wo kommt der Mist her? So ein Virus wächst nicht auf Bäumen. Hier gibt’s eh keine Bäume.', 'wut'),
    nar('Der ausgebaute Chip liegt auf der Werkbank. Eine Seriennummer am Rand, abgekratzter Lack, ein kleiner Aufkleber: „GRATIS!“.'),
  ], {
    choices: [
      { text: 'Die Seriennummer lesen. Das Muster kennst du.', check: 'gc-59', next: 'ripper' },
      { text: '„Dante, kratz mal den Lack weg. Du guckst schon die ganze Zeit hin.“', tag: '[Dante ♥3]', requires: hearts(DA, 3), next: 'quantum' },
      { text: '„Jimmy hat mir von Xions Werbestand erzählt. Der Gratis-Chip kam von dort.“', tag: '[Jimmys Erinnerung]', when: { seen: 'he-jimmy-6' }, next: 'xion' },
      { text: '„Ich schau mir Xions Werbestand in der Neon-Gasse selbst an.“', next: 'spaeter' },
    ],
  }),
  node('ripper', [
    ich('ZR-0-irgendwas. Zerleger-Nummerierung. Das ist Rippers Ware. Ausschuss, frisch lackiert.'),
    l(DA, 'Ripper. Natürlich. Der kauft Quantum-Schrott aus dem Kanal und verkauft ihn als „gebraucht wie neu“. Der Kanal-Sammler, da landet der ganze Ausschuss.', 'wut'),
  ], { effects: [set('jimmy_herkunft_ripper'), set('spur_chip_muell_kanal')], next: 'ende' }),
  node('quantum', [
    nar('Dante kratzt mit dem Fingernagel über den Lack. Darunter: ein Q. Weiß, sauber, arrogant.'),
    l(DA, 'Quantum. Die verschenken Chips mit Virus an Leute, die nichts haben. Um Himmels Willen, das ist kein Fehler, das ist ein Feldversuch.', 'wut'),
  ], { effects: [set('jimmy_herkunft_quantum'), { relation: DA, delta: 20 }], next: 'ende' }),
  node('xion', [
    l(JI, 'Ein Mann in Weiß mit einer Kralle statt Hand. „Freiwillige gesucht – Snacks inklusive!“ Ich hab einen Snack genommen. Und einen Chip. Der Chip war der Snack.', 'besorgt'),
    l(DA, 'Xion Venom. Quantums Sicherheitschef mit Verkaufsstand. Der Mann hat eine Kralle und kein Gewissen. Beides ist aus Metall.', 'wut'),
  ], { effects: [set('jimmy_herkunft_xion'), set('xion_werbestand_beweis')], next: 'ende' }),
  node('spaeter', [l(DA, 'Mach das. Aber lass dir keinen Snack andrehen.', 'signatur')]),
  node('ende', [l(DA, 'Erzähl’s Vega. Die sitzt bestimmt schon im High Voltage und tut so, als würde sie nicht warten.', 'zaertlich')]),
]);

// Ohne Check: Werbestand ansehen.
const werbestand: DialogueDef = dlg('side-jimmy-werbestand', [
  node('start', [
    nar('Xions Werbestand. Weiße Decke, Gratis-Snacks, ein Korb voller kleiner Chips in Glitzerfolie. „TESTE DIE ZUKUNFT – GRATIS!“'),
    nar('Auf jedem Chip derselbe Aufkleber wie auf Jimmys: „GRATIS!“. Daneben eine Liste mit Namen. Ganz oben, durchgestrichen: „Jimmy (Hafen)“.'),
  ], {
    choices: [
      { text: 'Die Liste abfotografieren.', next: 'foto' },
      tschuess('(Nichts anfassen.)'),
    ],
  }),
  node('foto', [ich('Freiwillige. Snacks inklusive. Ihr Arschlöcher.')], { effects: [set('jimmy_herkunft_xion'), set('xion_werbestand_beweis')] }),
]);

// ---------------------------------------------------------------------------------------------- Vega (Abschluss)

const vega: DialogueDef = dlg('side-jimmy-vega', [
  node('start', [
    nar('Vega sitzt an ihrem Tisch, ein Glas Wasser vor sich, den Blick auf der Tür. Als du dich setzt, sieht sie dich nicht an. Sie sieht auf deinen Mund. Auf die Nachricht.'),
    l(VE, 'Und?', 'besorgt'),
  ], {
    choices: [
      { text: '„Er ist wieder da. Ganz. Und er weiß, wer ihm das angetan hat.“', next: 'gerettet' },
    ],
  }),
  node('gerettet', [
    nar('Vega atmet aus. Ganz langsam. Wie jemand, der sehr lange einen Schuss gehalten hat.'),
    l(VE, 'Danke.', 'zaertlich'),
    l(VE, 'Zweihundert. Wie versprochen. Und die Jacke hier. Seine alte. Hat er mir gegeben, bevor er weg war. Er will, dass du sie trägst. Hat er gerade per Nachricht geschrieben. Mit vier Ausrufezeichen und einem Werbebanner.', 'freude'),
    nar('Aus der Tür zum Hinterzimmer steckt Jimmy den Kopf und winkt. Hinter ihm brüllt Hunter: „Wer hat den Typen reingelassen?“ Und dann, leiser: „… Gut. Bleib.“'),
  ], { effects: [set('jimmy_gerettet'), set('jimmy_abschluss')], next: 'crew' }),
  // Eigener Knoten: recruit allein, damit eine fehlende Begleiter-Definition den Abschluss nicht zurückrollt.
  node('crew', [l(JI, 'Update von mir: Jimmy gefunden! Jimmy wieder an Bord! Bitte bewerten Sie Ihre Erfahrung mit fünf Sternen!', 'freude')], {
    effects: [{ recruit: JI }],
    choices: [
      { text: '„Fünf Sterne, Jimmy.“' },
      { text: '[Vex] „Vier. Einen Stern zieh ich ab für die Fässer.“', when: VEX },
    ],
  }),
]);

const fund: CutsceneDef = {
  id: 'side-jimmy-tuerme',
  title: 'Turmcenter',
  beats: [
    { image: 'cut-side-jimmy-tuerme', caption: 'Hafenkante, Kai-Ende. Zwischen den Containern stehen Türme aus Ölfässern.', fade: 'in', hold: 1400 },
    { image: 'cut-side-jimmy-tuerme', caption: 'Jeder Turm trägt einen Kronkorken wie eine Krone. Jeder ist gerade. Jeder ist ein Hilferuf.', hold: 1600 },
    { image: 'cut-side-jimmy-tuerme', caption: 'Und mittendrin singt jemand einen Werbejingle. Ganz leise. Ganz allein.', fade: 'out', hold: 1600 },
  ],
};

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: {
    [bahnsteig.id]: bahnsteig, [tuerme.id]: tuerme, [schnarcht.id]: schnarcht, [dante.id]: dante,
    [werbestand.id]: werbestand, [vega.id]: vega,
  },
  cutscenes: { [fund.id]: fund },
  phone: { [tel.id]: tel },
  mapAdditions: {
    'bahnhof-mitte': {
      hotspots: [
        {
          id: 'q-jimmy-bahnsteig', at: 'bahnsteig-ende', radius: 60, label: 'Mann mit Pappschild „SERVICE“', kind: 'talk', dialogue: bahnsteig.id,
          when: all(not(BERUHIGT), not(done(Q)), time('tag')),
        },
      ],
    },
    hafenkante: {
      hotspots: [
        {
          id: 'q-jimmy-tuerme', at: 'oelfass-tuerme', radius: 64, label: 'Jimmy bei den Ölfass-Türmen', kind: 'talk', dialogue: tuerme.id,
          when: all(active(Q), JIMMY_DA, not(BERUHIGT), time('abend', 'nacht')),
        },
        {
          id: 'q-jimmy-schnarcht', at: 'oelfass-tuerme', radius: 64, label: 'Jimmy schnarcht Jingles', kind: 'talk', dialogue: schnarcht.id,
          when: all(active(Q), { won: 'enc-hafen-jimmy' }, noFlag('jimmy_getragen'), not(WAHL)),
        },
      ],
      onEnter: [
        { id: 'side-jimmy-tuerme', when: all(active(Q), JIMMY_DA, time('abend', 'nacht')), cutscene: fund.id, once: true },
      ],
    },
    'dantes-werkstatt': {
      hotspots: [
        {
          id: 'q-jimmy-dante', at: 'jimmy-hocker', radius: 60, label: 'Dante und Jimmy', kind: 'talk', dialogue: dante.id,
          when: all(active(Q), BERUHIGT, not(HERKUNFT)),
        },
      ],
    },
    'neon-gasse': {
      hotspots: [
        {
          id: 'q-jimmy-werbestand', at: 'werbestand', radius: 60, label: 'Xions Gratis-Chips ansehen', kind: 'talk', dialogue: werbestand.id,
          when: all(active(Q), WAHL, not(HERKUNFT)),
        },
      ],
    },
    'high-voltage': {
      hotspots: [
        {
          id: 'q-jimmy-vega', at: 'vega-aria-tisch', radius: 60, label: 'Vega: Neuigkeiten über Jimmy', kind: 'talk', dialogue: vega.id,
          when: all(active(Q), HERKUNFT, noFlag('jimmy_abschluss')),
        },
      ],
    },
  },
};

