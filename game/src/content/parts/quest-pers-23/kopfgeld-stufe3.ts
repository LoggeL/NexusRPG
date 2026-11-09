// Kopfgelder Stufe 3 (world.md §6.7) an Hunters Auftragstafel ab Rang 5 (Ruf crew-hunter 80), ab Akt 2:
// kopfgeld-faxfaelscher, kopfgeld-staubbaron-broesel, kopfgeld-leutnant-nadel (kopfgeld-blech-schwestern: maps-23/chrome-auftraege.ts)
// und die erzeugte Vorlage job-kopfgeld-3 (wechselnde Ziele in den neuen Zonen).
// Ablauf wie Stufe 1–2 (quest-pers-jobs/_kopfgeld.ts): Ziel stellen (Check, Weg ohne Check oder Kampf) → im Gerichtssaal am
// Kopfgeld-Schalter abliefern (voller Lohn) · laufen lassen gegen Information (halber Lohn) · Selbstanzeige/Seitenwechsel (voll).
// Flags kg_<key>_gestellt/_erledigt (Brösels Tagesablauf in npc-oednis/staubbaron-broesel.ts liest genau diese).
// Zu jedem benannten Kopfgeld gibt es eine gleichnamige Quest (kind 'job'), weil Figuren und Karten den Queststatus abfragen
// (npc-quantum/leutnant-nadel.ts, maps-23/rudis-diner.ts, maps-23/staubstrasse.ts).
import type {
  AttributeId, Condition, DialogueChoice, DialogueDef, DialogueLine, EncounterDef, Effect, JobTemplateDef, QuestDef,
} from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import { vorlage as hunterTafel } from '../quest-pers-jobs/_auftrag';
import type { Hotspot } from './_lib';
import {
  ACT2, L, N, abRang, all, any, byId, c, chk, cr, dlg, done, fight, flag, job, karten, msg, node, noFlag, not, nutze, rep,
  schritt, set, spiel, time, won, zeit,
} from './_lib';

const LOHN = 700;
const XP = 320;
const fertig = (id: string): Effect => ({ completeJob: id });
const ABGABE: [number, number] = [820, 372];

interface Weg {
  text: string;
  check?: [AttributeId, number, string[]];
  when?: Condition;
  tag?: string;
  effects?: Effect[];
  ergebnis: 'gestellt' | 'selbst';
  zeilen: DialogueLine[];
  /** Ergebnis kommt aus den Effekten (Minispiel), kein Folgeknoten. */
  direkt?: boolean;
}

interface Kopfgeld {
  key: string;
  name: string;
  ziele: { map: string; spot: string; label: string; wann: Condition }[];
  encounter: string;
  steckbrief: string;
  auftritt: DialogueLine[];
  wege: Weg[];
  kampfText: string;
  info: DialogueLine[];
  abgabe: string;
  /** Zusätzliche Bedingung fürs Angebot an der Tafel. */
  extra?: Condition;
  /** Zusätzliche Hotspots (Vorbereitung ohne Check, Hilfe von Dritten). */
  hilfe?: [string, Hotspot][];
  hilfeDialoge?: DialogueDef[];
}

const id = (k: Kopfgeld) => `kopfgeld-${k.key}`;
const snake = (k: Kopfgeld) => k.key.replace(/-/g, '_');
const gestellt = (k: Kopfgeld) => `kg_${snake(k)}_gestellt`;
const erledigt = (k: Kopfgeld) => `kg_${snake(k)}_erledigt`;
const istGestellt = (k: Kopfgeld): Condition => any(flag(gestellt(k)), won(k.encounter));

function vorlage(k: Kopfgeld): JobTemplateDef {
  return {
    id: id(k), kind: 'kopfgeld', title: `Kopfgeld: ${k.name}`,
    text: `${k.steckbrief} Lebend beim Richter abliefern. {credits} Cr.`,
    boards: ['auftragstafel'], when: all(ACT2, abRang(5), noFlag(erledigt(k)), ...(k.extra ? [k.extra] : [])),
    targets: k.ziele.map((z) => ({ map: z.map, label: z.label })),
    reward: { credits: [LOHN, LOHN], xp: XP, rep: { 'crew-hunter': 5 } },
  };
}

function zielDialog(k: Kopfgeld): DialogueDef {
  const J = id(k);
  const wege: DialogueChoice[] = k.wege.map((w, i) => c(w.text, w.direkt ? undefined : `weg-${i}`, {
    ...(w.check ? { check: chk(`kg3-${k.key}-${i}`, w.check[0], w.check[1], w.check[2]) } : {}),
    ...(w.when ? { when: w.when } : {}),
    ...(w.tag ? { tag: w.tag } : {}),
    ...(w.effects ? { effects: w.effects } : {}),
  }));
  return dlg(`p23-kg-${k.key}`, [
    node('start', k.auftritt, {
      choices: [
        ...wege,
        c(k.kampfText, undefined, { effects: [fight(k.encounter)] }),
        c('„Erzähl mir was Nützliches, dann hab ich dich nie gesehen.“', 'laufen'),
        c('Später.'),
      ],
    }),
    ...k.wege.flatMap((w, i) => (w.direkt ? [] : [node(`weg-${i}`, w.zeilen, {
      effects: w.ergebnis === 'gestellt'
        ? [set(gestellt(k)), msg(`${k.name} ist gestellt. Abliefern: Gerichtssaal, Kopfgeld-Schalter.`)]
        : [fertig(J), rep('unterstadt', 5), set(erledigt(k))],
    })])),
    node('laufen', k.info, {
      effects: [fertig(J), cr(-LOHN / 2), set(erledigt(k)), set(`kontakt_${snake(k)}`),
        msg('Laufen lassen: halber Lohn. Dafür schuldet dir jetzt jemand etwas.')],
    }),
  ]);
}

/** Begleitquest mit derselben ID: läuft, solange der Auftrag läuft; erledigt mit dem Flag. */
const begleitquest = (k: Kopfgeld): QuestDef => ({
  id: id(k), kind: 'job', act: 2, giver: 'hunter', title: `Kopfgeld: ${k.name}`,
  summary: `${k.steckbrief} Stufe 3, ${LOHN} Credits. Lebend.`,
  autoStart: job(id(k)),
  steps: [
    schritt('stellen', `Stell ${k.name} (${k.ziele.map((z) => z.label).join(' oder ')}).`, any(istGestellt(k), flag(erledigt(k))), [k.ziele[0].map, k.ziele[0].spot]),
    schritt('abliefern', 'Liefere das Ziel im Gerichtssaal am Kopfgeld-Schalter ab.', erledigt(k), ['gerichtssaal', 'kopfgeld-abgabe'], { when: istGestellt(k) }),
  ],
  reward: {},
});

// ------------------------------------------------------------------------------------------- Der Faxfälscher
const FX_HILFT = flag('kg_faxfaelscher_fx60');
const fx60 = dlg('p23-kg-fx60', [
  node('start', [
    L('fx-60', 'JEMAND. BENUTZT. MEINE. LEITUNG. ER. FAXT. RECHNUNGEN. MIT. MEINEM. BRIEFKOPF. DAS. IST. IDENTITÄTSDIEBSTAHL.', 'wut'),
    L('fx-60', 'ICH. KANN. IHM. DEN. TON. ABDREHEN. SAGEN. SIE. BESCHEID. WENN. SIE. VOR. IHM. STEHEN.', 'signatur'),
  ], { choices: [c('„Abgemacht, Kollege.“', undefined, { effects: [set('kg_faxfaelscher_fx60'), msg('FX-60 hilft beim Faxfälscher.')] }), c('Später.')] }),
]);

const FAX: Kopfgeld = {
  key: 'faxfaelscher', name: 'Der Faxfälscher', encounter: 'enc-kopfgeld-faxfaelscher',
  extra: done('side-eingehendes-fax'),
  ziele: [{ map: 'digitech-areal', spot: 'notstrom-terminal', label: 'Digitech-Areal, Notstrom-Terminal', wann: time('abend', 'nacht') }],
  steckbrief: 'Ein Mann im Anzug zapft FX-60s alte Leitung an und faxt gefälschte Mahnungen an halb Nexus. Mit Briefkopf. Mit Stempel. Mit Erfolg.',
  auftritt: [
    N('Am Notstrom-Terminal sitzt ein Mann im grauen Anzug und tippt. Neben ihm stapeln sich Faxe: „LETZTE MAHNUNG“, „ALLERLETZTE MAHNUNG“, „DIESMAL WIRKLICH“. Er sieht dich und lächelt wie ein Versicherungsvertreter.'),
    L('narrator', '„Sie wünschen? Eine Mahnung? Ich hätte da eine mit Ihrem Namen. Ganz frisch.“'),
  ],
  wege: [
    {
      text: 'Die Leitung zurückverfolgen, seine Konten sperren, ihm seinen eigenen Briefkopf faxen.', check: ['technik', 8, ['hacken', 'netz']], ergebnis: 'gestellt',
      zeilen: [N('Auf seinem Bildschirm erscheint ein Fax: „MAHNUNG an den Faxfälscher. Zahlbar sofort. In Handschellen.“ Er starrt es lange an. Dann legt er die Hände auf den Tisch.')],
    },
    {
      text: '„FX-60. Jetzt.“', when: FX_HILFT, ergebnis: 'gestellt', tag: '[FX-60]',
      zeilen: [N('Das Terminal piept, das Licht geht aus, und aus allen Lautsprechern dröhnt: „ICH. BIN. FX-60. SIE. SIND. GEKÜNDIGT.“ Der Faxfälscher hebt die Hände, bevor du es sagen musst.')],
    },
    {
      text: '„Stell dich. Mit Anwalt, mit Anzug, mit Würde. Ohne Mahnung.“', check: ['ausstrahlung', 7, ['ueberreden']], ergebnis: 'selbst',
      zeilen: [N('Er richtet die Krawatte, packt seine Faxe in eine Aktentasche und geht zu Fuß zum Eisenhof. Am nächsten Tag steht in der Zeitung: „Faxfälscher stellt sich. Bittet um Ratenzahlung.“')],
    },
  ],
  kampfText: 'Den Stecker ziehen. Und dann ihn.',
  info: [
    N('Er schiebt dir eine Liste rüber: Adressen in der Oberstadt, die seine Mahnungen bezahlt haben, ohne zu fragen.'),
    L('narrator', '„Wer zahlt, ohne zu fragen, hat was zu verbergen. Damit lässt sich arbeiten. Grüßen Sie FX-60. Er hat so eine schöne Schrift.“'),
  ],
  abgabe: 'Die Saalwache liest seinen Namen, liest dann sein Fax, auf dem „UNSCHULDIG“ steht, und knüllt es zusammen. „Netter Versuch.“',
  hilfe: [['digitech-tresor', nutze('p23-kg-fx60', 'fx-60-terminal', 'FX-60 um Hilfe bitten', 'p23-kg-fx60',
    all(job('kopfgeld-faxfaelscher'), noFlag('kg_faxfaelscher_fx60'), noFlag('kg_faxfaelscher_erledigt')))]],
  hilfeDialoge: [fx60],
};

// ------------------------------------------------------------------------------------------- Staubbaron Brösel
const BRUNNEN_TIEF = any(done('pers-marla-brunnen'), flag('kg_staubbaron_broesel_brunnen'));
const brunnen = dlg('p23-kg-broesel-brunnen', [
  node('start', [
    N('Der Brunnen am Aussiedlerhof. An der Seite, kaum zu sehen: ein frisch geschweißtes Rohr, das unter dem Zaun verschwindet. Richtung Staubstraße. Richtung Brösel.'),
  ], {
    choices: [
      c('Das Rohr abklemmen und die Leitung zurück in den Brunnen legen.', 'zu', { check: chk('kg3-broesel-rohr', 'technik', 7, ['reparieren']) }),
      c('Marla und die Aussiedler holen. Mit Schaufeln. Den ganzen Tag graben.', 'zu', { effects: [zeit(360), rep('aussiedler', 5)] }),
      c('Später.'),
    ],
  }),
  node('zu', [N('Ein Zischen, ein Gurgeln, dann läuft das Wasser wieder dahin, wo es hingehört. Draußen an der Staubstraße hört man einen Mann mit Kunstlederhut sehr laut fluchen.')], {
    effects: [set('kg_staubbaron_broesel_brunnen'), msg('Brösels Leitung ist gekappt. Sein Wasser ist alle.')],
  }),
]);

const BROESEL: Kopfgeld = {
  key: 'staubbaron-broesel', name: 'Staubbaron Brösel', encounter: 'enc-kopfgeld-staubbaron-broesel',
  ziele: [{ map: 'staubstrasse', spot: 'broesel-wasserstand', label: 'Staubstraße, Brösels Wasserstand', wann: time('morgen', 'tag') }],
  steckbrief: 'Verkauft an der Staubstraße Wasser zu Wucherpreisen, das er vorher den Aussiedlern abgezapft hat. Kunstlederhut, zu großer Mantel, kein Gewissen.',
  auftritt: [
    N('Unter dem Sonnenschirm mit Fransen schwitzt Brösel über seinen Kanistern. Er sieht deinen Blick, dann das Kopfgeldformular in deiner Tasche, und rückt den Hut zurecht.'),
    L('staubbaron-broesel', 'Ah. Die Justiz. Durstig? Für Beamte mache ich einen Sonderpreis. Doppelt.', 'besorgt'),
  ],
  wege: [
    {
      text: 'Die Aussiedler und Fahrer an der Straße zusammentrommeln. Keiner kauft mehr. Alle stehen um ihn rum.', check: ['strasse', 7, ['organisieren', 'einschuechtern']], ergebnis: 'gestellt',
      zeilen: [N('Zwanzig Leute, verschränkte Arme, kein Wort. Brösel sieht von einem zum anderen. Dann setzt er sich auf seinen Kanister und hält dir die Handgelenke hin. „Na gut. Aber ich will einen Becher Wasser in der Zelle. Gratis.“')],
    },
    {
      text: '„Deine Leitung ist gekappt, Brösel. Der Brunnen läuft wieder. Dein Geschäft ist tot.“', when: BRUNNEN_TIEF, ergebnis: 'gestellt',
      zeilen: [
        L('staubbaron-broesel', 'Tot? TOT? Ein ehrlicher Geschäftsmann, ruiniert von … von Wasser, das umsonst ist!', 'wut'),
        N('Er kippt einen Kanister aus, sieht zu, wie der Staub ihn schluckt, und gibt auf. Er hat noch nie so traurig ausgesehen. Er hat noch nie so ehrlich ausgesehen.'),
      ],
    },
    {
      text: '„Zahl den Aussiedlern zurück, was du ihnen geklaut hast. Dann sagt der Richter vielleicht ,Bewährung‘.“', check: ['ausstrahlung', 7, ['ueberreden']], ergebnis: 'selbst',
      zeilen: [N('Brösel rechnet. Lange. Dann zahlt er. Kanister für Kanister zurück an den Aussiedlerhof, und läuft selbst zum Eisenhof, mit Hut. „Ein Geschäftsmann weiß, wann der Markt dreht.“')],
    },
  ],
  kampfText: 'Den Sonnenschirm umtreten. Brösel hat Krähen. Du hast Fäuste.',
  info: [
    L('staubbaron-broesel', 'Information? Ich hab Information! Die Staubfalken haben am Wegzoll einen Tresor unter der Schranke. Mit dem Zoll von drei Jahren. Sag nicht, dass du es von mir hast. Sag es aber laut.', 'besorgt'),
  ],
  abgabe: 'Brösel steht vor der Saalwache, nimmt den Hut ab und fragt, ob das Wasser in der Zelle im Preis inbegriffen ist. Es ist.',
  hilfe: [['aussiedlerhof', nutze('p23-kg-broesel-brunnen', 'brunnen', 'Seltsames Rohr am Brunnen', brunnen.id,
    all(job('kopfgeld-staubbaron-broesel'), not(BRUNNEN_TIEF), noFlag('kg_staubbaron_broesel_erledigt')))]],
  hilfeDialoge: [brunnen],
};

// ------------------------------------------------------------------------------------------- Leutnant Nadel
const NADEL: Kopfgeld = {
  key: 'leutnant-nadel', name: 'Leutnant Nadel', encounter: 'enc-kopfgeld-leutnant-nadel',
  ziele: [{ map: 'quantum-campus', spot: 'patrouillenweg', label: 'Quantum-Campus, Patrouillenweg (nachts)', wann: time('nacht') }],
  steckbrief: 'Xions Stellvertreterin. Hat in der Partynacht die Hälfte der Unterstadt-Gäste ohne Grund festsetzen lassen und führt eine Liste. Mit rotem Kreis um dein Gesicht.',
  auftritt: [
    N('Patrouillenweg, Nacht. Taschenlampen, dann eine Stimme ohne Taschenlampe. Leutnant Nadel tritt aus dem Schatten des Wachhäuschens, die Hand am Funkgerät.'),
    L('leutnant-nadel', 'Du. Ich hab gewusst, dass du kommst. Ich weiß alles. Ich hab es aufgeschrieben.', 'wut'),
  ],
  wege: [
    {
      text: 'Ins Dunkle zurücktreten, um sie herum, von hinten das Funkgerät abziehen.', ergebnis: 'gestellt', tag: '[Schleichen]', direkt: true,
      effects: [spiel('akt-schleichen', 4, 'p23-kg3-nadel-schleichen', 'Patrouillenweg', [set('kg_leutnant_nadel_gestellt'),
        msg('Leutnant Nadel ist gestellt. Abliefern: Gerichtssaal, Kopfgeld-Schalter.')], [msg('Eine Taschenlampe erwischt dich. Nadel lacht. „Nochmal. Ich hab Zeit.“')])],
      zeilen: [N('Du verschwindest zwischen den Lichtkegeln.')],
    },
    {
      text: 'Den Schichtwechsel um 03:12 abwarten, wenn sie allein ist.', when: any(flag('nadel_schichtluecke'), flag('pim_weniger_wachen')), ergebnis: 'gestellt',
      effects: [zeit(120)],
      zeilen: [N('03:12. Die Lampen gehen aus, die Drohne dockt an. Nadel steht allein am Brückenkopf und sieht auf die Uhr. Als sie sich umdreht, ist das Funkgerät schon in deiner Hand.')],
    },
    {
      text: '„Xion steht jetzt an einer Tür in der Neon-Gasse. Freiwillig. Die Firma, für die du Listen schreibst, gibt es so nicht mehr.“', check: ['ausstrahlung', 8, ['ueberreden']], ergebnis: 'selbst',
      zeilen: [
        L('leutnant-nadel', 'Xion. An einer Tür. Freiwillig.', 'ueberrascht'),
        N('Sie nimmt die Liste aus der Brusttasche. Sieht sie an. Zerreißt sie, sehr ordentlich, in gleich große Stücke. Dann geht sie zum Eisenhof, im Gleichschritt. Allein.'),
      ],
    },
  ],
  kampfText: 'Bevor sie den Alarm drückt: zuschlagen.',
  info: [
    L('leutnant-nadel', 'Information. Gut. Die Kameras auf Mast Ost sind seit Wochen Attrappen. Budgetkürzung. Ich hab mich beschwert. Keiner hört auf mich. Jetzt du.', 'neutral'),
  ],
  abgabe: 'Nadel steht vor der Saalwache so gerade wie ein Zaunpfahl. Sie korrigiert die Schreibweise ihres Namens auf dem Formular. Zweimal.',
};

const KOPFGELDER = [FAX, BROESEL, NADEL];

// ------------------------------------------------------------------------------------------- Erzeugte Stufe-3-Vorlage
const G3 = 'job-kopfgeld-3';
const G3_ZIELE = [
  { map: 'chrome-boulevard', spot: 'auftrag-a', label: 'Chrome-Boulevard, Lieferanteneingang' },
  { map: 'staubstrasse', spot: 'auftrag-a', label: 'Staubstraße, alte Tankstelle' },
  { map: 'glasduenen', spot: 'auftrag-a', label: 'Glasdünen, Wrack am Pistenrand' },
  { map: 'pumpwerk-sieben', spot: 'auftrag-a', label: 'Pumpwerk Sieben, Wartungsgang' },
];
const g3vorlage: JobTemplateDef = {
  id: G3, kind: 'kopfgeld', title: 'Gesucht (Stufe 3): {ziel}',
  text: 'Hunter hat einen Steckbrief ohne Foto, aber mit Vermerk: „Bewaffnet, gelangweilt, gefährlich.“ Lebend abliefern, Gerichtssaal. {credits} Cr.',
  boards: ['auftragstafel'], when: all(ACT2, abRang(5)), targets: G3_ZIELE.map((z) => ({ map: z.map, label: z.label })),
  reward: { credits: [550, 650], xp: 260, rep: { 'crew-hunter': 4 } },
};
const g3kampf: EncounterDef = {
  id: 'p23-enc-kopfgeld-3', name: 'Gesucht: Stufe 3', arena: 'arena-duenen',
  enemies: [{ enemy: 'staubfalke', count: 2 }, { enemy: 'rostzahn-schlaeger' }],
  intro: [{ speaker: 'narrator', text: 'Drei Leute, ein Steckbrief, null Geduld. Der in der Mitte klopft auf seinen Helm: „Hunter schickt dich? Hunter schuldet mir noch Geld.“' }],
  reward: { xp: 60 },
  onWin: [set('kg3_gesucht_gestellt'), msg('Gestellt. Abliefern: Gerichtssaal, Kopfgeld-Schalter.')],
};
const g3ziel = dlg('p23-kg3-gesucht', [
  node('start', [
    N('Am angegebenen Ort lehnt jemand an der Wand, der genau so aussieht wie der Steckbrief ohne Foto: bewaffnet, gelangweilt, gefährlich. Zwei Kumpel. Ein Funkgerät.'),
  ], {
    choices: [
      c('„Hunter schickt mich. Wir können das leise machen.“', 'leise', { check: chk('kg3-gesucht-reden', 'ausstrahlung', 7, ['einschuechtern', 'ueberreden']) }),
      c('Die Kumpel ablenken, das Funkgerät klauen, den Rest überraschen.', 'leise', { check: chk('kg3-gesucht-trick', 'strasse', 7, ['tricks']) }),
      c('Draufgehen.', undefined, { effects: [fight(g3kampf.id)] }),
      c('Abwarten, bis die Kumpel Feierabend machen. Das kann dauern.', 'warten', { effects: [zeit(180)] }),
      c('Später.'),
    ],
  }),
  node('leise', [N('Keine Prügelei, kein Alarm. Am Ende sitzt die Person mit dem Steckbrief auf dem Bordstein und wartet, dass du sie mitnimmst. Gelangweilt, aber festgenommen.')], { effects: [set('kg3_gesucht_gestellt')] }),
  node('warten', [N('Drei Stunden. Die Kumpel gehen essen und kommen nicht wieder. Der Gesuchte schläft ein. Du weckst ihn mit Handschellen.')], { effects: [set('kg3_gesucht_gestellt')] }),
]);

// ------------------------------------------------------------------------------------------- Kopfgeld-Schalter (Abgabe)
const abgabe = dlg('p23-kg3-abgabe', [
  node('start', [N('Hinter dem Kopfgeld-Schalter sitzt die Saalwache mit Stempel, Kaffee und dem Gesicht eines Menschen, der schon alles gesehen hat. Zweimal.')], {
    choices: [
      ...KOPFGELDER.map((k) => c(`${k.name} abliefern.`, `ab-${k.key}`, {
        when: all(job(id(k)), istGestellt(k), noFlag(erledigt(k))), effects: [fertig(id(k)), set(erledigt(k))],
      })),
      c('Die gesuchte Person abliefern.', 'ab-gesucht', { when: all(job(G3), flag('kg3_gesucht_gestellt')), effects: [fertig(G3), set('kg3_gesucht_gestellt', false)] }),
      c('Gehen.'),
    ],
  }),
  ...KOPFGELDER.map((k) => node(`ab-${k.key}`, [N(k.abgabe)], { next: 'start' })),
  node('ab-gesucht', [N('Stempel, Unterschrift, Kaffee. „Wieder einer. Hunter soll aufhören, mir Arbeit zu schicken. Nein. Soll er nicht. Ich hab sonst nichts zu tun.“')], { next: 'start' }),
]);

const zielHotspots = (k: Kopfgeld): [string, Hotspot][] => k.ziele.map((z, i) => [z.map, nutze(`p23-kg-${k.key}-${i}`, z.spot, `Gesucht: ${k.name}`,
  `p23-kg-${k.key}`, all(job(id(k)), z.wann, not(istGestellt(k)), noFlag(erledigt(k))))]);

export const part: ContentPart = {
  jobs: { ...Object.fromEntries(KOPFGELDER.map((k) => [id(k), hunterTafel(vorlage(k))])), [G3]: hunterTafel(g3vorlage) },
  quests: Object.fromEntries(KOPFGELDER.map((k) => [id(k), begleitquest(k)])),
  encounters: { [g3kampf.id]: g3kampf },
  dialogues: byId(...KOPFGELDER.map(zielDialog), ...KOPFGELDER.flatMap((k) => k.hilfeDialoge ?? []), g3ziel, abgabe),
  mapAdditions: karten([
    ...KOPFGELDER.flatMap(zielHotspots),
    ...KOPFGELDER.flatMap((k) => k.hilfe ?? []),
    ...G3_ZIELE.map((z, i): [string, Hotspot] => [z.map, nutze(`p23-kg3-gesucht-${i}`, z.spot, 'Gesucht: Stufe 3', g3ziel.id,
      all(job(G3), noFlag('kg3_gesucht_gestellt')))]),
    ['gerichtssaal', nutze('p23-kg3-abgabe', ABGABE, 'Kopfgeld Stufe 3 abliefern', abgabe.id, any(
      ...KOPFGELDER.map((k) => all(job(id(k)), istGestellt(k), noFlag(erledigt(k)))),
      all(job(G3), flag('kg3_gesucht_gestellt')),
    ))],
  ]),
};
