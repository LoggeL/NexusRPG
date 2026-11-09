// Neue Auftragsvorlagen für die Zonen aus Akt 2 (world.md §6.6, act23.json questLocations job-*) und Marlas Wegezettel
// (Tafel 'marlas-wegezettel', Hotspot in maps-23/aussiedlerhof.ts). Die Engine zeigt Auftragsziele nicht an
// (quest-pers-jobs/_auftrag.ts), deshalb bekommt jedes Ziel einen eigenen Hotspot mit `{ job }`.
// Jedes Ziel: mindestens ein Check, ein Kampf (eigene Begegnung, Sieg schließt ab) und ein Weg ohne Check.
import type { AttributeId, Condition, DialogueDef, DialogueLine, EncounterDef, Effect, ItemDef, JobTemplateDef } from '../../../modules/contracts';
import type { JobBoardDef } from '../../../modules/jobs';
import type { ContentPart } from '../../part';
import type { Hotspot } from './_lib';
import {
  ACT2, N, abRang, all, byId, c, chk, cr, credits, dlg, ding, fahndung, fight, flag, item, job, karten, msg, node, noFlag,
  nutze, rep, set, spiel, take, time, zeit,
} from './_lib';

interface Ziel { map: string; spot: string; label: string; wann?: Condition }
interface Weg {
  text: string;
  check?: [AttributeId, number, string[]];
  requires?: Condition;
  tag?: string;
  /** Zusätzliche Effekte vor dem Abschluss (Kosten, Zeit, Fahndung). */
  effects?: Effect[];
  zeilen: DialogueLine[];
  /** Ergebnis über ein Minispiel (Gewinn schließt ab, Verlust nicht). */
  minispiel?: [string, number];
}
interface Auftrag {
  def: JobTemplateDef;
  ziele: Ziel[];
  ort: DialogueLine[];
  wege: Weg[];
  kampf: { name: string; arena: string; enemies: EncounterDef['enemies']; intro: string; text: string };
  /** Abholung vor dem Ziel (Eskorte): setzt ein Flag, das die Ziele freischaltet. */
  abholen?: Ziel & { zeilen: DialogueLine[] };
}

const abschluss = (a: Auftrag): Effect[] => [
  { completeJob: a.def.id }, ...(a.def.item ? [take(a.def.item)] : []), ...(a.abholen ? [set(dabei(a), false)] : []),
];
const dabei = (a: Auftrag) => `p23_${a.def.id.replace(/-/g, '_')}_dabei`;

function zielDialog(a: Auftrag): DialogueDef {
  const fertig = abschluss(a);
  return dlg(`p23-${a.def.id}`, [
    node('start', a.ort, {
      choices: [
        ...a.wege.map((w, i) => c(w.text, w.minispiel ? undefined : `weg-${i}`, {
          ...(w.check ? { check: chk(`${a.def.id}-${i}`, w.check[0], w.check[1], w.check[2]) } : {}),
          ...(w.requires ? { requires: w.requires } : {}),
          ...(w.tag ? { tag: w.tag } : {}),
          effects: w.minispiel
            ? [...(w.effects ?? []), spiel(w.minispiel[0], w.minispiel[1], `p23-${a.def.id}-${i}`, a.def.title.replace(/: \{ziel\}/, ''),
              [...fertig, msg('Auftrag erledigt.')], [msg('Daneben. Nochmal, oder ein anderer Weg.')])]
            : [...(w.effects ?? []), ...fertig],
        })),
        c(a.kampf.text, undefined, { effects: [fight(`p23-enc-${a.def.id}`)] }),
        c('Später.'),
      ],
    }),
    ...a.wege.filter((w) => !w.minispiel).map((w) => node(`weg-${a.wege.indexOf(w)}`, w.zeilen)),
  ]);
}

const kampf = (a: Auftrag): EncounterDef => ({
  id: `p23-enc-${a.def.id}`, name: a.kampf.name, arena: a.kampf.arena, enemies: a.kampf.enemies,
  intro: [{ speaker: 'narrator', text: a.kampf.intro }], reward: { xp: 25 }, onWin: [...abschluss(a), msg('Auftrag erledigt.')],
});

function hotspots(a: Auftrag): [string, Hotspot][] {
  const frei = a.abholen ? all(job(a.def.id), flag(dabei(a))) : job(a.def.id);
  const out: [string, Hotspot][] = a.ziele.map((z, i) => [z.map, nutze(`p23-${a.def.id}-${i}`, z.spot, `Auftrag: ${z.label}`, `p23-${a.def.id}`,
    z.wann ? all(frei, z.wann) : frei)]);
  if (a.abholen) {
    const h = a.abholen;
    out.push([h.map, nutze(`p23-${a.def.id}-abholen`, h.spot, `Auftrag: ${h.label}`, `p23-${a.def.id}-abholen`, all(job(a.def.id), noFlag(dabei(a))))]);
  }
  return out;
}

const abholDialog = (a: Auftrag): DialogueDef[] => (a.abholen ? [dlg(`p23-${a.def.id}-abholen`, [
  node('start', a.abholen.zeilen, { effects: [set(dabei(a)), msg(`Unterwegs: ${a.ziele.map((z) => z.label).join(' oder ')}.`)] }),
])] : []);

// ------------------------------------------------------------------------------------------- Gegenstände
const PAKET = 'p23-oednis-paket';
const WASSER = 'p23-wasserlieferung';
const items: Record<string, ItemDef> = {
  [PAKET]: ding(PAKET, 'Ödnis-Paket', 'Ein Paket in Plane gewickelt, mit Draht verschnürt, darauf in Kreide: „HOFLADEN – NICHT WERFEN – NICHT ÖFFNEN – NICHT FRAGEN“. Es riecht nach Saatgut und Motoröl.'),
  [WASSER]: ding(WASSER, 'Wasserlieferung', 'Zwei Kanister Brunnenwasser vom Aussiedlerhof, mit Marlas Kreidezeichen auf dem Deckel. Schwer. Kostbar. Hier draußen kostbarer als Chrom.', 'wasserkanister'),
};

// ------------------------------------------------------------------------------------------- Hunters Tafel: neue Zonen
const OEDNIS_PAKET: Auftrag = {
  def: {
    id: 'job-oednis-paket', kind: 'kurier', title: 'Ödnis-Lieferung: {ziel}',
    text: 'Ein Paket für die Ödnis. Hunter sagt: „Raus aus der Stadt, über die Staubstraße, an den Staubfalken vorbei. Nimm Wasser mit. Und nimm keinen Anhalter mit.“ {credits} Cr.',
    boards: ['auftragstafel'], when: all(ACT2, abRang(2)), item: PAKET,
    targets: [{ map: 'aussiedlerhof', label: 'Aussiedlerhof, Hofladen' }, { map: 'staubstrasse', label: 'Staubstraße, alte Tankstelle' }],
    reward: { credits: [180, 220], xp: 90, rep: { 'crew-hunter': 3, aussiedler: 2 } },
  },
  ziele: [
    { map: 'aussiedlerhof', spot: 'hofladen', label: 'Aussiedlerhof, Hofladen' },
    { map: 'staubstrasse', spot: 'auftrag-a', label: 'Staubstraße, alte Tankstelle' },
  ],
  ort: [
    N('Fast da. Auf der Piste davor stehen zwei Staubfalken neben einem Motorrad mit Schranke, die sie offenbar selbst gebaut haben. Ein Schild: „WEGZOLL. HEUTE IM ANGEBOT.“'),
  ],
  wege: [
    { text: 'Über die Dünenkante, hinter dem Wrack entlang, abseits der Piste.', check: ['strasse', 6, ['route', 'schleichen']], zeilen: [N('Glasstaub in den Schuhen, Sonne im Nacken, aber kein Zoll. Am Ziel nimmt jemand das Paket, ohne zu fragen, und gibt dir einen Becher Wasser, ohne zu fragen.')] },
    { text: '„Das ist für den Hof. Wenn ihr das aufhaltet, fragt Marla, warum.“', check: ['ausstrahlung', 6, ['ueberreden']], zeilen: [N('Bei „Marla“ hebt sich die Schranke von selbst. Einer der Falken murmelt „Grüß sie“. Der andere tut so, als hätte er nichts gesagt.')] },
    { text: 'Dreißig Credits Wegzoll zahlen.', requires: credits(30), effects: [cr(-30)], zeilen: [N('Die Falken quittieren mit einem Stempel auf deiner Hand. Er zeigt einen Vogel. Oder eine Wurst. Das Paket kommt an.')] },
  ],
  kampf: {
    name: 'Wegzoll', arena: 'arena-duenen', enemies: [{ enemy: 'staubfalke', count: 2 }], text: 'Die Schranke umfahren. Mit dem Gesicht eines Falken als Polster.',
    intro: '„Wegzoll!“ – „Für was?“ – „Für den Weg!“ – „Der Weg gehört euch nicht.“ – „Jetzt schon.“',
  },
};

const KURIER_OBEN: Auftrag = {
  def: {
    id: 'job-kurier-oberstadt', kind: 'kurier', title: 'Kurier Oberstadt: {ziel}',
    text: 'Ein Päckchen für jemanden in der Oberstadt, der keine Unterstadt-Kuriere mag. Pünktlich, sauber, ohne Fingerabdrücke. {credits} Cr.',
    boards: ['auftragstafel'], when: ACT2, item: 'pj-kurierpaket',
    targets: [{ map: 'chrome-boulevard', label: 'Chrome-Boulevard, Lieferanteneingang' }, { map: 'das-meer', label: 'Strandclub, Hintereingang' }],
    reward: { credits: [100, 130], xp: 60, rep: { 'crew-hunter': 3 } },
  },
  ziele: [
    { map: 'chrome-boulevard', spot: 'auftrag-a', label: 'Chrome-Boulevard, Lieferanteneingang' },
    { map: 'das-meer', spot: 'auftrag-a', label: 'Strandclub, Hintereingang' },
  ],
  ort: [N('Ein Portier in Livree steht vor dem Eingang wie eine Mauer mit Manschettenknöpfen. Er sieht deine Schuhe an. Dann das Paket. Dann wieder die Schuhe.')],
  wege: [
    { text: '„Lieferung für die Herrschaften. Express. Sie wollen nicht der sein, der sie aufgehalten hat.“', check: ['ausstrahlung', 6, ['ueberreden']], zeilen: [N('Der Portier nimmt das Paket mit zwei Fingern, als wäre es ansteckend, und nickt dir zu. Fast höflich.')] },
    { text: 'Hintenrum über die Lieferrampe, an den Mülltonnen vorbei.', check: ['strasse', 6, ['route']], zeilen: [N('Die Lieferrampe riecht nach Kaviar und Bleiche. Ein Koch nimmt das Paket und gibt dir ein Canapé. Es schmeckt nach nichts. Teuer.')] },
    { text: 'Warten, bis der Portier Pause macht. Er macht genau eine. Um Viertel nach.', effects: [zeit(60)], zeilen: [N('Eine Stunde später geht der Portier rauchen. Du gehst rein, legst das Paket auf den Empfangstresen, gehst wieder. Keiner merkt was.')] },
  ],
  kampf: {
    name: 'Livrierter Ärger', arena: 'arena-strasse', enemies: [{ enemy: 'ordnungshueter' }, { enemy: 'spaeherdrohne' }], text: 'Am Portier vorbei. Mit Nachdruck.',
    intro: 'Der Portier pfeift. Ein Ordnungshüter und eine Drohne kommen um die Ecke. „Lieferanten bitte hinten. Und Sie bitte gar nicht.“',
  },
};

const SCHULDEN_23: Auftrag = {
  def: {
    id: 'job-schulden-23', kind: 'schulden', title: 'Schulden eintreiben: {ziel}',
    text: 'Jemand schuldet dem High Voltage Geld. Diesmal nicht in der Unterstadt, sondern da, wo die Leute denken, Geld sei ein Gefühl. {credits} Cr.',
    boards: ['auftragstafel'], when: all(ACT2, abRang(2)),
    targets: [{ map: 'chrome-boulevard', label: 'Chrome-Boulevard, Promenade' }, { map: 'staubstrasse', label: 'Staubstraße, Lagerfeuer' }],
    reward: { credits: [120, 150], xp: 70, rep: { 'crew-hunter': 3 } },
  },
  ziele: [
    { map: 'chrome-boulevard', spot: 'promenade', label: 'Chrome-Boulevard, Promenade', wann: time('tag', 'abend') },
    { map: 'staubstrasse', spot: 'lagerfeuer', label: 'Staubstraße, Lagerfeuer', wann: time('abend', 'nacht') },
  ],
  ort: [N('Der Schuldner sieht dich kommen und weiß sofort Bescheid. Er hat das Gesicht von jemandem, der zu oft „nächste Woche“ gesagt hat und es jedes Mal ernst meinte.')],
  wege: [
    { text: '„Hunter vergisst nichts. Ich auch nicht. Aber ich bin netter.“', check: ['ausstrahlung', 6, ['einschuechtern', 'ueberreden']], zeilen: [N('Er zahlt. In kleinen Scheinen, mit zitternden Händen und einem „Grüßen Sie Hunter“, das nach Angst klingt und nach Respekt.')] },
    { text: 'Den Tisch anheben. Langsam. Mit ihm drauf.', check: ['koerper', 6, ['kraft', 'einschuechtern']], zeilen: [N('Er zahlt, bevor der Tisch wieder auf dem Boden steht.')] },
    { text: 'Einen Ratenplan auf eine Serviette schreiben und ihn unterschreiben lassen.', effects: [zeit(45)], zeilen: [N('Er unterschreibt. Die erste Rate zahlt er sofort, der Rest steht auf der Serviette. Hunter wird die Serviette einrahmen.')] },
  ],
  kampf: {
    name: 'Zahlungsunwillig', arena: 'arena-strasse', enemies: [{ enemy: 'schuldner' }, { enemy: 'rostzahn-schlaeger' }], text: '„Dann eben anders.“',
    intro: 'Der Schuldner pfeift. Sein „Buchhalter“ hat Schlagringe und kann nicht rechnen.',
  },
};

const DATEN_23: Auftrag = {
  def: {
    id: 'job-datenraub-23', kind: 'datenraub', title: 'Datenraub: {ziel}',
    text: 'Ein Kunde will Daten von Quantum. Welche, sagt er nicht. Wofür, auch nicht. Wie viel, schon: {credits} Cr.',
    boards: ['auftragstafel'], when: all(ACT2, abRang(3)),
    targets: [
      { map: 'quantum-campus', label: 'Quantum-Campus, Pausenpavillon (nachts)' },
      { map: 'datentunnel', label: 'Datentunnel, Netzknoten' },
      { map: 'pumpwerk-sieben', label: 'Pumpwerk Sieben, Quantum-Außenstelle' },
    ],
    reward: { credits: [170, 200], xp: 100, rep: { 'crew-hunter': 4 } },
  },
  ziele: [
    { map: 'quantum-campus', spot: 'pausenraum', label: 'Quantum-Campus, Pausenpavillon', wann: time('nacht') },
    { map: 'datentunnel', spot: 'netzknoten', label: 'Datentunnel, Netzknoten' },
    { map: 'pumpwerk-sieben', spot: 'aussenstelle-terminal', label: 'Pumpwerk Sieben, Außenstelle' },
  ],
  ort: [N('Ein Quantum-Terminal, weiß, glatt, mit einem Logo, das freundlich lächelt. Auf dem Bildschirm: „Bitte authentifizieren Sie sich. Wir vertrauen Ihnen. Nicht.“')],
  wege: [
    { text: 'Die Authentifizierung umgehen, die Daten ziehen, die Spuren löschen.', check: ['technik', 7, ['hacken']], zeilen: [N('Download abgeschlossen. Im Log steht jetzt: „Wartung durch Techniker Kurt“. Kurt gibt es nicht. Kurt hat heute frei.')] },
    { text: 'Ins System, Paket für Paket.', tag: '[Hacken]', minispiel: ['akt-hacken', 3], zeilen: [] },
    { text: 'Den Speicherkern ausbauen und einfach mitnehmen.', effects: [zeit(30), fahndung(1)], zeilen: [N('Kein Hacken, nur ein Schraubenzieher und schlechtes Benehmen. Irgendwo piept ein Alarm, aber da bist du schon weg. Mit dem Kern unterm Arm.')] },
  ],
  kampf: {
    name: 'Sicherheitsprotokoll', arena: 'arena-labor-quantum', enemies: [{ enemy: 'quantum-wachmann' }, { enemy: 'stoerdrohne', count: 2 }], text: 'Den Alarm auslösen und durch die Wachen durch.',
    intro: 'Das Terminal sagt „Unbefugter Zugriff“. Dann sagt es nichts mehr, weil eine Wache es für dich ausspricht. Mit Schockstab.',
  },
};

const ESKORTE_OEDNIS: Auftrag = {
  def: {
    id: 'job-eskorte-oednis', kind: 'eskorte', title: 'Eskorte in die Ödnis: {ziel}',
    text: 'Eine Händlerin aus der Oberstadt will zum Aussiedlerhof, Honig kaufen. Sie hat Geld, Hut und keine Ahnung. Bring sie heil hin. {credits} Cr.',
    boards: ['auftragstafel'], when: all(ACT2, abRang(3)),
    targets: [{ map: 'aussiedlerhof', label: 'Aussiedlerhof, Hofladen' }],
    reward: { credits: [150, 180], xp: 90, rep: { 'crew-hunter': 3, aussiedler: 2 } },
  },
  abholen: {
    map: 'chrome-boulevard', spot: 'auftrag-a', label: 'Händlerin abholen (Chrome-Boulevard)',
    zeilen: [N('Die Händlerin trägt einen Sonnenhut so groß wie ein Schirm und einen Koffer mit Rollen, der für Sand nicht gebaut wurde. „Ist es weit? Gibt es dort WLAN? Gibt es dort Kaffee?“ Du sagst „Ja“ zu allem. Ihr geht los.')],
  },
  ziele: [{ map: 'aussiedlerhof', spot: 'hofladen', label: 'Aussiedlerhof, Hofladen' }],
  ort: [N('Am Hoftor steigen zwei Glasskorpione aus dem Sand, als hätten sie auf den Koffer gewartet. Die Händlerin hält dir ihren Hut hin, als wäre er eine Waffe.')],
  wege: [
    { text: 'Die Händlerin hinter dich, langsam rückwärts, die Skorpione mit Licht blenden.', check: ['reflexe', 6, ['schnell']], zeilen: [N('Die Skorpione klicken, zögern, verschwinden. Die Händlerin kauft im Hofladen alles, was nach Honig riecht, und gibt dir Trinkgeld in einer Währung, die es nicht mehr gibt.')] },
    { text: 'Laut nach den Aussiedlern rufen.', zeilen: [N('Juna kommt mit einer Schaufel und einem sehr gelangweilten Gesicht. Zwei Schläge, zwei Skorpione weniger. „Die mögen Koffer. Keine Ahnung, warum.“')] },
  ],
  kampf: {
    name: 'Skorpione am Hoftor', arena: 'arena-duenen', enemies: [{ enemy: 'glasskorpion', count: 2 }], text: 'Den Hut zurückgeben und die Fäuste nehmen.',
    intro: 'Zwei Glasskorpione, ein Koffer mit Rollen und eine Händlerin, die schreit: „Die haben keine AUGEN!“',
  },
};

const KANAL_PUMPWERK: Auftrag = {
  def: {
    id: 'job-kanal-pumpwerk', kind: 'kopfgeld', title: 'Pumpwerk Sieben: {ziel}',
    text: 'Kabelmolche nisten in den Pumpen von Pumpwerk Sieben. Gully sagt: „Raus damit. Freundlich, wenn’s geht. Unfreundlich, wenn’s muss.“ {credits} Cr.',
    boards: ['auftragstafel', 'gullys-kanalbrett'], when: ACT2,
    targets: [{ map: 'pumpwerk-sieben', label: 'Pumpwerk Sieben, alte Pumpe' }],
    reward: { credits: [80, 100], xp: 60, rep: { kanalvolk: 4 } },
  },
  ziele: [{ map: 'pumpwerk-sieben', spot: 'pumpenrad-2', label: 'Pumpwerk Sieben, Pumpenrad zwei' }],
  ort: [N('Das Pumpenrad steht still. Im Gehäuse glitzern Augen, viele Augen, und ein langes, nasses Kabel, das kein Kabel ist. Es atmet.')],
  wege: [
    { text: 'Das Spülventil öffnen und die Molche mit einem Schwall in den Abfluss treiben.', check: ['technik', 5, ['reparieren']], zeilen: [N('Ein Rauschen, ein Quieken, dann ein beleidigtes Schweigen weiter unten im Kanal. Das Pumpenrad dreht sich wieder.')] },
    { text: 'Am Ventil drehen, bis der Druck passt.', tag: '[Ventil]', minispiel: ['akt-ventil', 2], zeilen: [] },
    { text: 'Kanalminze ins Gehäuse streuen. Molche hassen Minze.', requires: item('kanalminze'), effects: [take('kanalminze')], zeilen: [N('Die Molche niesen. Dann ziehen sie aus, beleidigt und frisch duftend.')] },
  ],
  kampf: {
    name: 'Molchnest', arena: 'arena-kanal', enemies: [{ enemy: 'kabelmolch', count: 3 }], text: 'Mit der Rohrzange ins Nest.',
    intro: 'Drei Kabelmolche, ein Nest aus Draht und eine Pumpe, die du gerade zur Kampfzone erklärt hast.',
  },
};

// ------------------------------------------------------------------------------------------- Marlas Wegezettel
const BERGUNG_OEDNIS: Auftrag = {
  def: {
    id: 'job-bergung-oednis', kind: 'kurier', title: 'Bergung: {ziel}',
    text: 'Draußen liegt ein Wrack mit brauchbaren Teilen. Bevor die Krähen oder die Falken drankommen: holen. {credits} Cr und ein Anteil am Fund.',
    boards: ['auftragstafel', 'marlas-wegezettel'], when: ACT2,
    targets: [{ map: 'staubstrasse', label: 'Wrackburg, Hof' }, { map: 'glasduenen', label: 'Glasdünen, eingestürzte Brücke' }],
    reward: { credits: [110, 140], xp: 70, rep: { aussiedler: 3 } },
  },
  ziele: [
    { map: 'staubstrasse', spot: 'wrackburg-hof', label: 'Wrackburg, Hof' },
    { map: 'glasduenen', spot: 'eingestuerzte-bruecke', label: 'Glasdünen, eingestürzte Brücke' },
  ],
  ort: [N('Das Wrack liegt halb im Sand, halb in der Vergangenheit: ein Lieferwagen ohne Räder, die Ladefläche voller Kisten. Darauf sitzt eine Schrottkrähe und tut, als gehöre ihr das alles.')],
  wege: [
    { text: 'Die Achse anheben und die Kisten rauszerren.', check: ['koerper', 6, ['kraft']], zeilen: [N('Die Achse knirscht, deine Schultern auch. Drei Kisten, ein Akku, ein Satz Zündkerzen. Die Krähe guckt beleidigt.')] },
    { text: 'Mit der Seilwinde und einem Flaschenzug arbeiten.', check: ['technik', 6, ['bauen', 'reparieren']], zeilen: [N('Ein Flaschenzug aus Leitplanke und Lieferwagengurt. Elegant ist anders, aber die Kisten kommen raus.')] },
    { text: 'Kiste für Kiste, mit Pausen, bis es dunkel wird.', effects: [zeit(180)], zeilen: [N('Drei Stunden Schleppen. Am Ende hast du alles und Sand an Orten, von denen du nicht wusstest, dass du sie hast.')] },
  ],
  kampf: {
    name: 'Krähen am Wrack', arena: 'arena-duenen-wrackburg', enemies: [{ enemy: 'schrottkraehe', count: 3 }], text: 'Die Krähe verscheuchen. Und ihre Freunde.',
    intro: 'Die Krähe krächzt. Zwei weitere landen. Eine trägt eine Mutter im Schnabel, als wäre es ein Messer.',
  },
};

const ESKORTE_KARAWANE: Auftrag = {
  def: {
    id: 'job-wegezettel-karawane', kind: 'eskorte', title: 'Karawane begleiten: {ziel}',
    text: 'Marlas Zettel: „Zwei Wagen Gemüse zur Staubstraße. Brauchen jemanden mit Augen hinten am Kopf. Zahle in Credits und Honig.“ {credits} Cr.',
    boards: ['marlas-wegezettel'], when: ACT2,
    targets: [{ map: 'staubstrasse', label: 'Staubstraße, Konvoi-Halt' }],
    reward: { credits: [90, 120], xp: 70, rep: { aussiedler: 4 } },
  },
  abholen: {
    map: 'aussiedlerhof', spot: 'hoftor', label: 'Karawane am Hoftor abholen',
    zeilen: [N('Zwei Karren, ein Ziegenroboter als Zugtier, eine Aussiedlerin mit Schrotflinte, die „nur für Schlangen“ ist. Ihr zieht los, Richtung Staubstraße.')],
  },
  ziele: [{ map: 'staubstrasse', spot: 'konvoi-halt', label: 'Staubstraße, Konvoi-Halt' }],
  ort: [N('Kurz vor dem Konvoi-Halt: drei Staubfalken auf Motorrädern, die neben den Karren herrollen. „Schönes Gemüse. Wär schade, wenn’s Staub fängt.“')],
  wege: [
    { text: '„Das Gemüse ist für Rudis Diner. Wenn ihr es klaut, kriegt ihr nie wieder Pfannkuchen.“', check: ['strasse', 6, ['einschuechtern', 'ueberreden']], zeilen: [N('Pfannkuchen. Das wirkt. Die Falken drehen ab und reihen sich hinten ein, als Ehrengeleit. Einer kauft sogar eine Gurke.')] },
    { text: 'Jedem Falken eine Möhre zuwerfen. Als Wegzoll in Naturalien.', zeilen: [N('Die Falken fangen die Möhren, gucken sich an, beißen rein. „Die sind … gut?“ Sie fahren weiter. Eine Möhre pro Falke. Marla wird es verschmerzen.')] },
  ],
  kampf: {
    name: 'Falken an der Karawane', arena: 'arena-duenen', enemies: [{ enemy: 'staubfalke', count: 3 }], text: 'Vom Karren springen.',
    intro: 'Der erste Falke greift nach einem Kohlkopf. Die Aussiedlerin mit der Schrotflinte sagt: „Schlange.“',
  },
};

const WASSER_ZETTEL: Auftrag = {
  def: {
    id: 'job-wegezettel-wasser', kind: 'kurier', title: 'Wasser bringen: {ziel}',
    text: 'Marlas Zettel: „Zwei Kanister Wasser für Leute, die Brösel nicht bezahlen können. Umsonst. Nicht verhandelbar.“ {credits} Cr aus der Hofkasse.',
    boards: ['marlas-wegezettel'], when: ACT2, item: WASSER,
    targets: [{ map: 'staubstrasse', label: 'Staubstraße, Lagerfeuer' }, { map: 'glasduenen', label: 'Glaswerkstatt' }],
    reward: { credits: [40, 60], xp: 50, rep: { aussiedler: 5, unterstadt: 1 } },
  },
  ziele: [
    { map: 'staubstrasse', spot: 'lagerfeuer', label: 'Staubstraße, Lagerfeuer' },
    { map: 'glasduenen', spot: 'glaswerkstatt', label: 'Glaswerkstatt' },
  ],
  ort: [N('Ein paar Leute am Feuer, Fahrer, Tramper, eine Familie mit Kinderwagen voller Werkzeug. Die Becher sind leer. Einer starrt auf deine Kanister, als wären sie aus Gold.')],
  wege: [
    { text: 'Die Kanister abstellen. „Von Marla. Umsonst.“', zeilen: [N('Keiner sagt was. Dann sagt jemand „Danke“, und dann alle. Die Familie füllt drei Flaschen und den Kinderwagen gleich mit.')] },
    { text: 'Gerecht einteilen: jeder einen Becher, Kinder zwei, Brösels Spitzel keinen.', check: ['ausstrahlung', 5, ['organisieren']], effects: [rep('aussiedler', 2)], zeilen: [N('Ein Mann im Mantel, der zu viel nach Kunstleder fragt, geht leer aus. Alle anderen nicht. Am Ende ist sogar noch ein Rest übrig.')] },
  ],
  kampf: {
    name: 'Brösels Leute', arena: 'arena-duenen', enemies: [{ enemy: 'schrottkraehe', count: 2 }, { enemy: 'rostzahn-schlaeger' }], text: 'Brösels Aufpasser vertreiben, bevor sie die Kanister umkippen.',
    intro: '„Kostenloses Wasser schadet dem Markt!“, ruft ein Mann mit Schlagstock. Hinter ihm flattern zwei Krähen. Sie sind auch gegen den freien Markt.',
  },
};

const AUFTRAEGE = [OEDNIS_PAKET, KURIER_OBEN, SCHULDEN_23, DATEN_23, ESKORTE_OEDNIS, KANAL_PUMPWERK, BERGUNG_OEDNIS, ESKORTE_KARAWANE, WASSER_ZETTEL];

const wegezettel: JobBoardDef = {
  name: 'Marlas Wegezettel', faction: 'aussiedler', slots: 2, failRep: 1, expiresAfterDays: 2,
  ranks: [{ min: 0, title: 'Fremde Hand' }, { min: 20, title: 'Gast am Feuer' }, { min: 40, title: 'Nachbarschaft' }, { min: 60, title: 'Hofmitglied' }],
};

export const part: ContentPart = {
  items,
  jobs: Object.fromEntries(AUFTRAEGE.map((a) => [a.def.id, a.def])),
  jobBoards: { 'marlas-wegezettel': wegezettel },
  encounters: Object.fromEntries(AUFTRAEGE.map((a) => [`p23-enc-${a.def.id}`, kampf(a)])),
  dialogues: byId(...AUFTRAEGE.map(zielDialog), ...AUFTRAEGE.flatMap(abholDialog)),
  mapAdditions: karten(AUFTRAEGE.flatMap(hotspots)),
};
