// Verbrauchsgüter, Werkzeuge und Rezepte (world.md §9.3). Heilung über `use.heal` (im Kampf nutzbar), Würfe über
// `use.battle` (abilities-items.ts). Wirkungen ohne Engine-Stütze (Initiative, Lauftempo, Statusentfernung,
// Lichtkreis …) stehen im Text und in design/plan/gaps/system.md.
import type { ItemDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const V = (def: Omit<ItemDef, 'category' | 'icon'> & { icon?: string }): ItemDef => ({ category: 'verbrauch', icon: def.icon ?? def.id, ...def });
/** Werkzeug: bleibt im Inventar, wird von Hotspots und Dialogen per `{ item }` abgefragt. */
const T = (def: Omit<ItemDef, 'category' | 'icon'> & { icon?: string }): ItemDef => ({ category: 'verbrauch', icon: def.icon ?? def.id, giftTags: ['werkzeug'], ...def });

const items: Record<string, ItemDef> = {
  // --- Heilung und Essen -----------------------------------------------------------------------------------
  medipflaster: V({
    id: 'medipflaster', name: 'Medipflaster', price: 25, giftTags: ['medizin'],
    description: 'Selbstklebendes Gel-Pflaster mit Smiley. Hilft gegen Schnitte, Schürfwunden und gegen Oma Volts Blick. +25 LP.',
    use: { label: 'Aufkleben', heal: 25, text: 'Es kribbelt. Dann ist es besser.' },
  }),
  nanogel: V({
    id: 'nanogel', name: 'Nanogel', price: 90, giftTags: ['medizin', 'technik'],
    description: 'Silbriges Gel voller winziger Reparaturroboter. Verschließt Wunden und richtet Funkenschäden. +60 LP, entfernt „Angeschlagen“.',
    use: { label: 'Auftragen', heal: 60, text: 'Das Gel kriecht von allein in jeden Kratzer. Unheimlich. Wirksam.' },
  }),
  nougatbombe: V({
    id: 'nougatbombe', name: 'Nougatbombe', price: 6, giftTags: ['essen', 'suess', 'snack'],
    description: 'Der Schokoriegel der Unterstadt: 40 % Nougat, 40 % Karamell, 20 % schlechte Entscheidungen. +10 LP, entfernt „Diva“. Außerhalb des Kampfs +1 auf den nächsten Ausstrahlung-Check.',
    use: {
      label: 'Essen', heal: 10, text: 'Zucker schießt dir ins Hirn. Du fühlst dich unwiderstehlich.',
      effects: [{ checkBuff: { id: 'nougatbombe', label: 'Nougatbombe', value: 1, attribute: 'ausstrahlung' } }],
    },
    inspect: 'Werbespruch auf der Packung: „Hunger? Bombe!“',
  }),
  'dantes-kekse': V({
    id: 'dantes-kekse', name: 'Dantes Kekse', price: 0, sellable: false, giftTags: ['essen', 'suess', 'selbstgemacht'],
    description: 'Frisch aus Dantes Ofen. Je nach Keksalarm verbrannt (+15), gut (+30) oder perfekt (+45 LP). Mit Rezept: ganze Gruppe +10, „Zuckerschock“.',
    use: { label: 'Essen', heal: 30, text: 'Butter, Zimt und ein Hauch Lötzinn. Schmeckt nach Zuhause.' },
  }),
  'drei-sekunden-keks': V({
    id: 'drei-sekunden-keks', name: 'Drei-Sekunden-Keks', price: 0, sellable: false, giftTags: ['essen', 'suess'],
    description: 'Fiel aufs Blech, lag keine drei Sekunden am Boden. Zählt also nicht. +20 LP, „Ermutigt“.',
    use: { label: 'Essen', heal: 20, text: 'Drei-Sekunden-Regel. Dante hat es geschworen.' },
  }),
  'synth-nudeln': V({
    id: 'synth-nudeln', name: 'Synth-Nudeln', price: 8, giftTags: ['essen', 'warm'],
    description: 'Babettes Nudeln aus Algenprotein in scharfer Brühe. Wärmt bis in die Cyberware. +20 LP (nicht im Kampf – Stäbchen und Granaten vertragen sich nicht).',
    use: { label: 'Schlürfen', effects: [{ heal: 20 }], text: 'Die Brühe brennt im Hals. Großartig.' },
  }),
  'bao-dampfnudel': V({
    id: 'bao-dampfnudel', name: 'Bao-Dampfnudel', price: 5, giftTags: ['essen', 'warm', 'suess'],
    description: 'Fluffig, dampfend, mit roter Bohnenpaste. Seit 2061 das beliebteste Geschenk der Unterstadt. +12 LP.',
    use: { label: 'Essen', heal: 12, text: 'Weich wie ein Kissen. Ein Kissen mit Füllung.' },
  }),
  pilzsuppe: V({
    id: 'pilzsuppe', name: 'Pilzsuppe', price: 10, giftTags: ['essen', 'warm', 'kanal'],
    description: 'Fluss-Friedas Suppe aus Leuchtpilzen. Schmeckt erdig, leuchtet leicht. +20 LP, eine Stunde größerer Lichtkreis unter Tage.',
    use: { label: 'Löffeln', heal: 20, text: 'Deine Zunge leuchtet jetzt blau. Für eine Stunde siehst du im Dunkeln mehr.' },
  }),
  'bruehes-suppe': V({
    id: 'bruehes-suppe', name: 'Brühes Tagessuppe', price: 3, giftTags: ['essen', 'warm'],
    description: 'Mutter Brühes Suppe aus dem großen Kessel. Was drin ist, weiß nur sie, und sie sagt es nicht. +15 LP.',
    use: { label: 'Löffeln', heal: 15, text: 'Heiß, salzig, ehrlich. Wie ein Schlag auf die Schulter.' },
  }),
  'jakkos-eintopf': V({
    id: 'jakkos-eintopf', name: 'Jakkos Eintopf', price: 0, sellable: false, giftTags: ['essen', 'warm', 'selbstgemacht', 'kinder'],
    description: 'Jakkos erstes eigenes Rezept: alles, was der Markt übrig hatte, plus eine geheime Prise Zimt. Ganze Gruppe +25 LP (außerhalb des Kampfs).',
    use: { label: 'Austeilen', effects: [{ heal: 25 }], world: true, text: 'Alle essen. Alle sind still. Das ist das größte Lob.' },
  }),
  hofhonig: V({
    id: 'hofhonig', name: 'Hofhonig', price: 30, giftTags: ['essen', 'suess', 'oednis', 'natur'],
    description: 'Echter Honig von echten Bienen vom Aussiedlerhof. Fast alle mögen ihn. +30 LP.',
    use: { label: 'Naschen', heal: 30, text: 'Er schmeckt nach Sonne. Du wusstest nicht, dass Sonne einen Geschmack hat.' },
  }),
  'synth-kaffee': V({
    id: 'synth-kaffee', name: 'Synth-Kaffee', price: 4, giftTags: ['getraenk', 'kaffee', 'warm'],
    description: 'Schmeckt nach Kaffee. Fast. +5 LP, eine Stunde Lauftempo +10 %.',
    use: { label: 'Trinken', heal: 5, text: 'Dein Herz schlägt im Takt einer Nähmaschine. Du bist wach.' },
  }),

  // --- Getränke --------------------------------------------------------------------------------------------
  'volt-limo': V({
    id: 'volt-limo', name: 'Volt-Limo', price: 12, giftTags: ['getraenk', 'suess'],
    description: 'Oma Volts Hauslimo in der Bügelflasche, kribbelt wie eine Steckdose. +2 Initiative im nächsten Kampf.',
    use: { label: 'Trinken', heal: 3, text: 'Es zischt in der Nase. Deine Finger zucken. Komm her, Welt.' },
  }),
  'neon-limo': V({
    id: 'neon-limo', name: 'Neon-Limo', price: 15, giftTags: ['getraenk', 'suess'],
    description: 'Die leuchtende Hauslimo des High Voltage nach dem Originalrezept. +20 LP, „Ermutigt“ für eine Runde, entfernt „Betäubt“.',
    use: { label: 'Trinken', heal: 20, text: 'Sie leuchtet im Hals. Und irgendwie auch hinter den Augen.' },
  }),
  'kuehlmittel-mocktail': V({
    id: 'kuehlmittel-mocktail', name: 'Kühlmittel-Mocktail', price: 15, giftTags: ['getraenk', 'suess'],
    description: 'Blau, eiskalt, garantiert ohne Kühlmittel. Behauptet jedenfalls der Barkeeper. +10 LP.',
    use: { label: 'Trinken', heal: 10, text: 'Brain-Freeze. Herrlich.' },
  }),

  // --- Kampf und Schleichen --------------------------------------------------------------------------------
  stoergranate: V({
    id: 'stoergranate', name: 'Störgranate', price: 45, giftTags: ['technik', 'waffe'],
    description: 'Ein faustgroßer Störimpuls. Drohnen und Gechippte in 3 × 3 Feldern sind „Gehackt“.',
    use: { label: 'Werfen', battle: 'gegenstand-stoergranate', world: false },
  }),
  rauchtopf: V({
    id: 'rauchtopf', name: 'Rauchtopf', price: 30, giftTags: ['waffe'],
    description: 'Gustavs Konservendose voller Qualm. Zwei Runden Deckung für alle in der Wolke; vor einem Kampf auch zur Flucht (nicht bei Questkämpfen).',
    use: { label: 'Zünden', battle: 'gegenstand-rauchtopf', world: false },
  }),
  klebegranate: V({
    id: 'klebegranate', name: 'Klebegranate', price: 40, giftTags: ['waffe'],
    description: 'Gustavs Spezialkleber im Wurfbeutel. Das Ziel klebt eine Runde fest („Betäubt“). Abwaschen dauert länger.',
    use: { label: 'Werfen', battle: 'gegenstand-klebegranate', world: false },
  }),
  'chip-blocker': V({
    id: 'chip-blocker', name: 'Chip-Blocker', price: 0, sellable: false, giftTags: ['technik', 'medizin'],
    description: 'Das Gegenmittel: ein Nasenspray, das Chrome 10 für eine Weile zum Schweigen bringt. Befreit Gechippte für eine Runde, im Finale die Gäste.',
  }),
  'dietrich-chip': V({
    id: 'dietrich-chip', name: 'Dietrich-Chip', price: 40, giftTags: ['technik', 'gauner'],
    description: 'Ein Einweg-Chip, der in jedes Schloss bis Schwelle 6 kriecht und es von innen aufdreht. Ersetzt das Schlossknacken und verbraucht sich dabei.',
    inspect: 'Fräulein Pixels Markenzeichen: ein winziger Smiley im Lötpunkt.',
  }),
  reparaturset: V({
    id: 'reparaturset', name: 'Reparaturset', price: 35, giftTags: ['werkzeug', 'technik'],
    description: 'Kabelbinder, Lötzinn, Klebeband und Gebete. Repariert Bots, Ventile und die Rostlaube.',
  }),
  staubmaske: T({
    id: 'staubmaske', name: 'Staubmaske', price: 45, charges: 10,
    description: 'Filtermaske mit zwei Patronen. Zehn Einsätze Giftschutz in Kanal und Ödnis, eine Ladung je Sandsturm. Danach ist sie Müll.',
  }),
  stirnlampe: T({
    id: 'stirnlampe', name: 'Stirnlampe', price: 60,
    description: 'LED-Lampe mit Gummiband. Licht unter Tage, ohne dass du eine Hand verschwendest.',
  }),

  // --- Köder ----------------------------------------------------------------------------------------------
  kaeseecke: V({
    id: 'kaeseecke', name: 'Käseecke', price: 4, giftTags: ['essen', 'ekelig'],
    description: 'Ein Stück Käse, das schon bessere Zeiten gesehen hat. Ratten lieben es. Nagbert verehrt es.',
  }),
  roestzwiebeln: V({
    id: 'roestzwiebeln', name: 'Röstzwiebeln', price: 6, giftTags: ['essen', 'snack'],
    description: 'Eine Tüte knuspriger Röstzwiebeln vom Imbiss. Ein Rattenschwarm hält drei Felder Abstand – niemand weiß, warum.',
  }),
  koeder: V({
    id: 'koeder', name: 'Köder', price: 3, giftTags: ['angeln', 'ekelig'],
    description: 'Eine Dose Würmer von der Hafenkante. Einige leuchten. Das ist normal. Wird beim Angeln verbraucht.',
  }),

  // --- Fahrkarten ------------------------------------------------------------------------------------------
  'u-bahn-ticket': V({
    id: 'u-bahn-ticket', name: 'U-Bahn-Ticket', price: 5, giftTags: ['alltag'],
    description: 'Eine Fahrt mit der U-Bahn, beliebige Strecke. Gilt nicht für Sitzplätze mit Kaugummi.',
  }),
  monatskarte: T({
    id: 'monatskarte', name: 'Monatskarte', price: 120, giftTags: ['alltag'],
    description: '28 Tage freie Fahrt im ganzen Netz. Das Passfoto zeigt dich mit geschlossenen Augen. Wie immer.',
  }),

  // --- Werkzeuge -------------------------------------------------------------------------------------------
  'angel-einfach': T({
    id: 'angel-einfach', name: 'Einfache Angel', price: 30, giftTags: ['werkzeug', 'angeln'],
    description: 'Teleskopangel aus Henks Restekiste. Fängt Fisch, Treibholz und hin und wieder einen Stiefel.',
  }),
  'angel-profi': T({
    id: 'angel-profi', name: 'Profi-Angel', price: 220, giftTags: ['werkzeug', 'angeln'],
    description: 'Henks zweitbeste Angel. Carbon, Freilaufrolle, leuchtende Schnur. +30 % seltene Fänge.',
  }),
  magnetangel: T({
    id: 'magnetangel', name: 'Magnetangel', price: 80, giftTags: ['werkzeug', 'technik'],
    description: 'Ein Neodym-Magnet am Seil. Angelt Metall aus Kanälen, Brunnen und fremden Taschen.',
  }),
  metalldetektor: T({
    id: 'metalldetektor', name: 'Metalldetektor', price: 200, giftTags: ['werkzeug', 'technik'],
    description: 'Piept bei Münzen, Schrauben und vergrabenen Geheimnissen. Und bei deinem Gürtel.',
  }),

  // --- Material und Belohnungen ----------------------------------------------------------------------------
  'leckerli-schraube': V({
    id: 'leckerli-schraube', name: 'Schrauben-Leckerli', price: 10, giftTags: ['tier', 'schrott'],
    description: 'Eine Tüte geölter Messingschrauben. Bolzen dreht durch, Bijou macht Männchen.',
  }),
  'schrott-ersatzteil': V({
    id: 'schrott-ersatzteil', name: 'Schrott-Ersatzteil', price: 8, giftTags: ['schrott', 'technik'],
    description: 'Ein Klumpen aus Platine, Zahnrad und Hoffnung. Bastelmaterial für die Werkbank, gern gesehene Spende beim Kanalvolk.',
  }),

  // --- Rezepte ---------------------------------------------------------------------------------------------
  'rezept-notfallriegel': T({
    id: 'rezept-notfallriegel', name: 'Rezept: Notfallriegel', price: 0, sellable: false, giftTags: ['rezept'],
    description: 'Ein fettfleckiger Zettel. An der Werkbank wird aus Hafer und Honig eine Nougatbombe. Fast.',
  }),
  'rezept-dantes-kekse': T({
    id: 'rezept-dantes-kekse', name: 'Rezept: Dantes Kekse', price: 0, sellable: false, giftTags: ['rezept'],
    description: 'Dantes Keksrezept auf der Rückseite einer Plattenhülle. Werkbank: Dantes Kekse. Die Zimtmenge ist dreimal unterstrichen.',
  }),
};

export const part: ContentPart = { items };
