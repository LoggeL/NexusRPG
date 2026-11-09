// job-kurier · Kurierfahrt (world.md §6.6) mit drei Varianten: normal (Rang 1), zerbrechlich ×1,3 (Rang 1),
// heiße Ware ×1,6 (Rang 3, Drohnen). Am Ziel: `[Straße 5]` Route, `[Ausstrahlung 5]` Kontrolle durchreden, Kampf oder
// ein langer Umweg ohne Check.
import type { DialogueDef, ItemDef, JobTemplateDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import { type Ziel, fertig, kampf, vorlage, ziele, zielSpot, zusatz } from './_auftrag';
import { N, P, abRang, all, byId, c, chk, dlg, item, job, node, take, zeit } from './_lib';

const PAKET = 'pj-kurierpaket';
const KISTE = 'pj-kurierkiste-zerbrechlich';
const HEISS = 'pj-kurierpaket-heiss';

const ZIELE: Ziel[] = [
  { map: 'loetgassen', spot: 'auftrag-a', label: 'Lötgassen, Hinterhof' },
  { map: 'bahnhof-mitte', spot: 'paketausgabe', label: 'Bahnhof Mitte, Paketausgabe' },
  { map: 'rohrsiedlung', spot: 'auftrag-a', label: 'Rohrsiedlung, Rohrbogen 4' },
  { map: 'neon-gasse', spot: 'auftrag-a', label: 'Neon-Gasse, Hintertür' },
  { map: 'stufenplatz', spot: 'auftrag-a', label: 'Stufenplatz, Lieferhof' },
];
const ZIELE_HEISS: Ziel[] = [
  { map: 'hafenkante', spot: 'auftrag-a', label: 'Hafenkante, Container 12' },
  { map: 'glasarkaden', spot: 'auftrag-a', label: 'Glasarkaden, Lieferanteneingang' },
  { map: 'digitech-areal', spot: 'auftrag-a', label: 'Digitech-Areal, Bauzaun' },
];

const items: ItemDef[] = [
  { id: PAKET, name: 'Kurierpaket', category: 'quest', icon: 'kurierpaket', price: 0, sellable: false,
    description: 'Braunes Packpapier, viel Klebeband, kein Absender. Es wiegt genau so viel, dass man nicht fragen will.' },
  { id: KISTE, name: 'Kiste „ZERBRECHLICH“', category: 'quest', icon: 'kurierpaket', price: 0, sellable: false,
    description: 'Eine Holzkiste, auf jeder Seite „ZERBRECHLICH“, auf dem Deckel „WIRKLICH“. Drinnen klirrt es, wenn du atmest.' },
  { id: HEISS, name: 'Heißes Paket', category: 'quest', icon: 'kurierpaket', price: 0, sellable: false,
    description: 'Ein Paket mit Quantum-Siegel, das jemand sehr schlecht überklebt hat. Es piept alle dreißig Sekunden. Über dir piept es zurück.' },
];

const T: JobTemplateDef[] = [
  vorlage({
    id: 'job-kurier', kind: 'kurier', title: 'Kurierfahrt: {ziel}',
    text: 'Ein Paket, eine Adresse, Frist bis 02:00. Unterwegs lauern gern Leute, die das Paket mehr wollen als du. Hunter will, dass es ankommt. Wie, ist ihm egal. {credits} Cr.',
    boards: ['auftragstafel'], targets: ziele(ZIELE), item: PAKET,
    reward: { credits: [70, 90], xp: 50, rep: { 'crew-hunter': 3 } },
  }),
  vorlage({
    id: 'job-kurier-zerbrechlich', kind: 'kurier', title: 'Zerbrechlich: {ziel}',
    text: 'Eine Kiste, auf der „ZERBRECHLICH“ steht. Nicht rennen, nicht prügeln, nicht niesen. {credits} Cr, wenn alles heil ankommt.',
    boards: ['auftragstafel'], targets: ziele(ZIELE), item: KISTE,
    reward: { credits: [95, 115], xp: 55, rep: { 'crew-hunter': 3 } },
  }),
  vorlage({
    id: 'job-kurier-heiss', kind: 'kurier', title: 'Heiße Ware: {ziel}',
    text: 'Quantum sucht das Paket. Mit Drohnen. Du bringst es trotzdem hin. Hunter sagt: „Nicht fragen, was drin ist. Ich weiß es auch nicht. Ich will es nicht wissen.“ {credits} Cr.',
    boards: ['auftragstafel'], when: abRang(3), targets: ziele(ZIELE_HEISS), item: HEISS,
    reward: { credits: [120, 140], xp: 80, rep: { 'crew-hunter': 4 } },
  }),
];

const abfang = kampf('pj-enc-kurier-abfang', 'Abfangtrupp am Ziel', {
  arena: 'arena-strasse', enemies: [{ enemy: 'rostzahn-schlaeger', count: 2 }], start: 'hinterhalt', reward: { xp: 20 },
  intro: [{ speaker: 'narrator', text: '„Das Paket. Jetzt. Wir quittieren auch.“ Die Quittung ist ein Schlagring.' }],
}, [fertig('job-kurier'), take(PAKET)]);
const drohnen = kampf('pj-enc-kurier-heiss', 'Heiße Ware', {
  arena: 'arena-strasse', enemies: [{ enemy: 'spaeherdrohne', count: 2 }, { enemy: 'quantum-wachmann' }], reward: { xp: 30 },
  intro: [{ speaker: 'narrator', text: 'Das Paket piept. Über dir piept es zurück. Ein Quantum-Wachmann winkt mit dem Schockgewehr: „Paket abstellen, Hände hoch, lächeln für die Kamera.“' }],
}, [fertig('job-kurier-heiss'), take(HEISS)]);

const zustellung = (z: Ziel, i: number): DialogueDef => dlg(`pj-kurier-${z.map}`, [
  node('start', [N(`${z.label}. Ein Briefschlitz, eine Klingel, ein Name, der nicht an der Tür steht.`)], {
    choices: [
      c('Das Kurierpaket abgeben.', 'normal', { when: all(job('job-kurier'), item(PAKET)) }),
      c('Die zerbrechliche Kiste abgeben.', 'kiste', { when: all(job('job-kurier-zerbrechlich'), item(KISTE)) }),
      c('Gehen.'),
    ],
  }),
  node('normal', [N('Zwei Typen lehnen an der Ecke, verdächtig unauffällig. Einer zählt seine Finger. Der andere guckt auf dein Paket wie auf ein Steak.')], {
    choices: [
      c('Hintenrum: über den Hof, durchs Treppenhaus, zur anderen Tür.', 'zugestellt', { check: chk(`kurier-route-${i}`, 'strasse', 5, ['route']), effects: [fertig('job-kurier'), take(PAKET)] }),
      c('„Pizza für den Bürgermeister. Ihr wollt nicht, dass die kalt wird.“', 'zugestellt', { check: chk(`kurier-reden-${i}`, 'ausstrahlung', 5, ['ueberreden']), effects: [fertig('job-kurier'), take(PAKET)] }),
      c('Gerade durch. Wenn sie wollen, sollen sie kommen.', undefined, { effects: [{ battle: abfang.id }] }),
      c('Umdrehen und den langen Weg durch die Kanalgitter nehmen.', 'umweg', { effects: [zeit(60), fertig('job-kurier'), take(PAKET)] }),
    ],
  }),
  node('umweg', [N('Eine Stunde Kanal. Deine Schuhe sind jetzt Geschichte. Das Paket ist trocken. Die zwei Typen stehen immer noch an der Ecke und warten auf jemanden, der nie kommt.')], { next: 'zugestellt' }),
  node('kiste', [N('Die Treppe zur Tür ist nass, steil und hat ein Geländer, das nur noch aus Hoffnung besteht. Drinnen klirrt die Kiste.')], {
    choices: [
      c('Die Kiste auf der Schulter balancieren und hochsteigen.', 'zugestellt', { check: chk(`kurier-kiste-${i}`, 'reflexe', 4, ['balance']), effects: [fertig('job-kurier-zerbrechlich'), take(KISTE)] }),
      c('Stufe für Stufe. Kiste absetzen, Luft holen, weiter.', 'langsam', { effects: [zeit(30), fertig('job-kurier-zerbrechlich'), take(KISTE)] }),
    ],
  }),
  node('langsam', [N('Eine halbe Stunde für zwölf Stufen. Oben öffnet eine alte Dame, nimmt die Kiste und sagt: „Endlich. Mein Porzellan-Einhorn.“ Es ist heil. Du auch, fast.')], { next: 'zugestellt' }),
  node('zugestellt', [N('Ein Kopf, eine Hand, eine Unterschrift, die aussieht wie ein Erdbeben. Tür zu. Auftrag erledigt. Hunter kriegt es mit, bevor du zurück bist. Wie, weiß keiner.')]),
], 'start');

const heiss = (z: Ziel, i: number): DialogueDef => dlg(`pj-kurier-heiss-${z.map}`, [
  node('start', [N(`${z.label}. Das Paket piept. Irgendwo über dem Dach piept etwas zurück, dann noch etwas.`)], {
    choices: [
      c('Die Drohnen mit einem Störimpuls aus dem Kommunikator blenden.', 'zugestellt', { check: chk(`kurier-heiss-stoeren-${i}`, 'technik', 5, ['drohne', 'elektronik']), effects: [fertig('job-kurier-heiss'), take(HEISS)] }),
      c('Stehen bleiben und die Ankunft der Drohnen abwarten.', undefined, { effects: [{ battle: drohnen.id }] }),
      c('Zurück zur U-Bahn, eine Station unter der Erde, dann von unten wieder hoch.', 'umweg', { effects: [zeit(90), fertig('job-kurier-heiss'), take(HEISS)] }),
      c('Gehen.'),
    ],
  }),
  node('umweg', [N('Anderthalb Stunden Tunnel, Rolltreppen, Lüftungsschacht. Die Drohnen kreisen über einem leeren Platz und melden „Ziel verloren“. Du klopfst von der anderen Seite.')], { next: 'zugestellt' }),
  node('zugestellt', [N('Ein Mann ohne Gesicht – also mit Gesicht, nur mit Sturmhaube – nimmt das Paket, sagt nichts und zieht die Tür zu. Das Piepen hört auf. Erleichterung riecht nach Ozon.'), P('Nie wieder. Bis morgen.')]),
]);

const DIALOGE = [...ZIELE.map(zustellung), ...ZIELE_HEISS.map(heiss)];

export const part: ContentPart = {
  items: byId(...items),
  jobs: byId(...T),
  encounters: byId(abfang, drohnen),
  dialogues: byId(...DIALOGE),
  mapAdditions: zusatz([
    ...ZIELE.map((z) => zielSpot(`pj-kurier-${z.map}`, z, 'Kurierziel', `pj-kurier-${z.map}`,
      { any: [all(job('job-kurier'), item(PAKET)), all(job('job-kurier-zerbrechlich'), item(KISTE))] })),
    ...ZIELE_HEISS.map((z) => zielSpot(`pj-kurier-heiss-${z.map}`, z, 'Kurierziel (heiße Ware)', `pj-kurier-heiss-${z.map}`,
      all(job('job-kurier-heiss'), item(HEISS)), 40, -36)),
  ]),
};
