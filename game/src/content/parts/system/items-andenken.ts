// Andenken bei 10 Herzen und Romanze-Andenken (world.md §9.5 „Andenken“, §4.7 Aria-Strang und Vex × Aria).
// Unikate, nicht verkäuflich. Kleine Passivboni: Check-Boni wirken über `checkBonus`, solange das Andenken im
// Inventar liegt; alle anderen Boni (Rabatte, Moral, Kampfregeln) brauchen noch eine Engine-Stütze
// (design/plan/gaps/system.md) und stehen bis dahin im Text.
import type { CheckBonusRule, ItemDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const A = (id: string, name: string, description: string, extra: Partial<ItemDef> = {}): ItemDef => ({
  id, name, category: 'geschenk', icon: id, price: 0, sellable: false, giftTags: ['andenken'], description, ...extra,
});
const bonus = (label: string, rule: Omit<CheckBonusRule, 'label'>): Partial<ItemDef> => ({ checkBonus: [{ ...rule, label }] });

const list: ItemDef[] = [
  // --- Crew ------------------------------------------------------------------------------------------------
  A('hunters-sonnenbrille', 'Hunters Sonnenbrille', 'Hunters goldene Pilotenbrille, die er „für die wichtigen Momente“ trägt. Er hat sie dir gegeben. Händler in der Unterstadt geben dir 5 % Rabatt – sie erkennen die Brille.',
    { inspect: 'Innen am Bügel eingraviert: „Crew ist Familie. Familie zahlt nicht.“' }),
  A('ravens-klinge', 'Ravens Klinge', 'Ravens erstes Messer, schmal, schwarz, mit abgegriffenem Griff. Schleichangriffe +2 Schaden.',
    { inspect: 'Auf der Klinge ein winziger Kratzer in Herzform. Raven würde abstreiten, dass das Absicht war.' }),
  A('kekse-rezept', 'Dantes Keksrezept', 'Das Original. Mit Fettflecken, Zimtspuren und dem Satz „Nie mehr als drei Sekunden“. Beim Keksalarm wird das Zeitfenster größer.',
    { ...bonus('Dantes Keksrezept', { tags: ['kochen', 'backen'], value: 1 }) }),
  A('vegas-zielfernrohr', 'Vegas Zielfernrohr', 'Vegas altes Zielfernrohr, poliert, mit Sternkarte im Deckel. +1 Reflexe bei Ziel- und Schuss-Checks.',
    { ...bonus('Vegas Zielfernrohr', { attribute: 'reflexe', tags: ['fernkampf'], value: 1 }) }),
  A('nyra-wellenchip', 'Nyras Wellenchip', 'Ein Chip, auf dem Nyra Meeresrauschen gespeichert hat – Aufnahmen, die sie nie gemacht haben kann. +1 Technik bei Hacks.',
    { ...bonus('Nyras Wellenchip', { attribute: 'technik', tags: ['hacken'], value: 1 }) }),
  A('jimmys-glueckschip', 'Jimmys Glückschip', 'Ein Casino-Chip, den Jimmy seit seiner Kindheit mit sich trägt. Angeblich hat er noch nie verloren. +1 beim Bluffen.',
    { ...bonus('Jimmys Glückschip', { tags: ['bluff'], value: 1 }) }),


  // --- Quantum und Oberstadt -------------------------------------------------------------------------------
  A('zero-prototyp', 'Zeros Prototyp', 'Alesas erster Funke, ein Heizelement in einer Glaskugel. Warm in der Hand, nie heiß. +1 Technik bei Maschinen-Checks.',
    { ...bonus('Zeros Prototyp', { attribute: 'technik', tags: ['maschine'], value: 1 }) }),
  A('xion-vip-band', 'Xions VIP-Band', 'Ein grünes Stoffband mit „VIP – XION“. Quantum-Wachen werden sehr höflich, wenn sie es sehen. +1 Ausstrahlung gegenüber Quantum.',
    { ...bonus('Xions VIP-Band', { attribute: 'ausstrahlung', factions: ['quantum'], value: 1 }) }),
  A('chrome-mitgliedskarte', 'Chrome-Mitgliedskarte', 'Eine schwere Karte aus gebürstetem Chrom: lebenslanges Mitglied im Haus Chrome. Seraphina hat unterschrieben. Oberstadt-Händler −20 %, +1 Ausstrahlung in der Oberstadt.',
    { ...bonus('Chrome-Mitgliedskarte', { attribute: 'ausstrahlung', districts: ['oberstadt'], value: 1 }) }),
  A('goldene-kundenkarte', 'Goldene Kundenkarte', 'Sybellas goldene Kundenkarte für alle Läden der Familie. Sie hat sie „aus Versehen“ zweimal ausgestellt. +1 Ausstrahlung beim Verhandeln.',
    { ...bonus('Goldene Kundenkarte', { attribute: 'ausstrahlung', tags: ['verhandeln', 'feilschen'], value: 1 }) }),
  A('serenitys-ring', 'Serenitys Ring', 'Ein schlichter Ring aus grünem Glas. Serenity hat ihn nie getragen, nur aufbewahrt. Jetzt du. +1 Ausstrahlung beim Überreden und Trösten.',
    { ...bonus('Serenitys Ring', { attribute: 'ausstrahlung', tags: ['ueberreden', 'trost'], value: 1 }) }),

  // --- Medien, Unterstadt, Ordnung -------------------------------------------------------------------------
  A('goldenes-mikro', 'Goldenes Mikro', 'Collins Moderationsmikro, vergoldet, ein Zahnabdruck am Griff. Live und unzensiert. +1 Ausstrahlung vor Publikum und Kamera.',
    { ...bonus('Goldenes Mikro', { attribute: 'ausstrahlung', tags: ['buehne'], value: 1 }) }),
  A('presseausweis-gold', 'Goldener Presseausweis', 'Delyas alter Presseausweis aus ihrer ersten Woche, Foto mit Zahnspange. +1 Straße bei Gerüchte-Checks.',
    { ...bonus('Goldener Presseausweis', { attribute: 'strasse', tags: ['geruecht'], value: 1 }) }),
  A('kameradrohne-mini', 'Mini-Kameradrohne', 'Eine Kameradrohne so groß wie eine Hummel. Kameramann hat sie gebaut und nie benutzt. +1 Technik bei Drohnen-Checks.',
    { ...bonus('Mini-Kameradrohne', { attribute: 'technik', tags: ['drohne'], value: 1 }) }),
  A('rippers-lupe', 'Rippers Lupe', 'Rippers Juwelierlupe, mit der er Implantate prüft. Er hat sie dir in die Hand gedrückt und gesagt: „Nicht weinen.“ +1 Technik bei Cyberware- und Reparatur-Checks.',
    { ...bonus('Rippers Lupe', { attribute: 'technik', tags: ['cyberware', 'reparieren'], value: 1 }) }),
  A('barkeeper-maske', 'Maske des Barkeepers', 'Die Ersatzmaske des Barkeepers. Niemand weiß, wer darunter steckt. Du jetzt ein bisschen. +1 Ausstrahlung im High Voltage.',
    { ...bonus('Maske des Barkeepers', { attribute: 'ausstrahlung', maps: ['high-voltage'], value: 1 }) }),
  A('bandenabzeichen', 'Bandenabzeichen', 'Darias selbst geprägtes Abzeichen der „Nest-Bande“, Blechdeckel mit Nagel. Ehrenmitglied auf Lebenszeit. +1 Straße beim Einschüchtern.',
    { ...bonus('Bandenabzeichen', { attribute: 'strasse', tags: ['einschuechtern'], value: 1 }) }),
  A('fairness-stempel', 'Fairness-Stempel', 'Freyas Kartoffelstempel mit einem schiefen Herz. Sie stempelt damit alles, was gerecht ist. +1 Ausstrahlung beim Überreden.',
    { ...bonus('Fairness-Stempel', { attribute: 'ausstrahlung', tags: ['ueberreden'], value: 1 }) }),
  A('jakkos-rezept', 'Jakkos Rezept', 'Jakkos Kochbuch-Seite, mit Buntstift geschrieben: „Eintopf für Leute, die man mag“. Kochen und Werkbank brauchen weniger Zutaten, und wer tröstet, findet die richtigen Worte (+1 beim Trösten).',
    { ...bonus('Jakkos Rezept', { tags: ['trost'], value: 1 }) }),
  A('richterhammer-mini', 'Mini-Richterhammer', 'Ein Richterhammer in Spielzeuggröße. Der Richter hat ihn für Bagatellfälle. +1 Ausstrahlung gegenüber dem Ordnungsdienst.',
    { ...bonus('Mini-Richterhammer', { attribute: 'ausstrahlung', factions: ['ordnungsdienst'], value: 1 }) }),
  A('wachen-strichliste', 'Kessels Strichliste', 'Wachtmeisterin Kessels Strichliste aller Ausbrüche, die sie verhindert hat. Dein Name steht nicht drauf. Du weißt jetzt, wie man es nicht macht: +1 bei Flucht und Verstecken.',
    { ...bonus('Kessels Strichliste', { tags: ['flucht', 'verstecke'], value: 1 }) }),
  A('dexters-schuldbuch', 'Dexters Schuldbuch', 'Dexters Schuldbuch, alle Seiten durchgestrichen. Auf der letzten: „Danke.“ +1 Ausstrahlung beim Verhandeln.',
    { ...bonus('Dexters Schuldbuch', { attribute: 'ausstrahlung', tags: ['verhandeln', 'schulden'], value: 1 }) }),
  A('babettes-kochloeffel', 'Babettes Kochlöffel', 'Babettes Bambuslöffel, schwarz vom Dampf. „Damit habe ich drei Ehemänner überlebt.“ Garküchen-Essen heilt dich ein bisschen mehr.'),
  A('schrottkrone', 'Schrottkrone', 'Opa Gustavs Krone aus Schrauben und Fahrradketten, König der Halde. +1 Technik bei Schrott- und Reparatur-Checks.',
    { ...bonus('Schrottkrone', { attribute: 'technik', tags: ['reparieren', 'maschine'], value: 1 }) }),
  A('kikis-taxikarte', 'Kikis Taxikarte', 'Eine abgegriffene Plastikkarte: „Kiki fährt dich. Immer. Gratis. Halt die Klappe beim Fahren.“ Kiki-Taxi kostet nichts mehr.'),
  A('lio-album', 'Lios Album', 'Lios erstes ganzes Album auf Kassette. Track 7 heißt wie du. +1 Ausstrahlung auf der Bühne.',
    { ...bonus('Lios Album', { attribute: 'ausstrahlung', tags: ['buehne'], value: 1 }) }),
  A('marlas-wasserstab', 'Marlas Wasserstab', 'Marlas Wünschelrute aus Kupferdraht. Sie findet Wasser. Meistens. +1 Körper in der Ödnis.',
    { ...bonus('Marlas Wasserstab', { attribute: 'koerper', districts: ['oednis'], value: 1 }) }),
  A('pims-mikrokaefer', 'Pims Mikrokäfer', 'Ein Robokäfer, so groß wie ein Fingernagel, der auf Befehl in Schlösser und Ritzen krabbelt. +1 beim Beobachten und bei Schlössern.',
    { ...bonus('Pims Mikrokäfer', { tags: ['beobachten', 'schloss'], value: 1 }) }),
  A('nebelhorn-mini', 'Mini-Nebelhorn', 'Ein Nebelhorn zum Umhängen. Wenn du hineinbläst, drehen sich am ganzen Kai die Köpfe. +1 beim Tauchen und Angeln.',
    { ...bonus('Mini-Nebelhorn', { tags: ['tauchen', 'angeln'], value: 1 }) }),
  A('bolzens-marke', 'Bolzens Marke', 'Bolzens Hundemarke aus einer Unterlegscheibe, mit Zahnabdrücken. Bolzens täglicher Fund ist ab jetzt garantiert selten.',
    { giftTags: ['andenken', 'tier'] }),
  A('schrapnell-abzeichen', 'Schrapnell-Aufnäher', 'Ein abgewetzter Stoffaufnäher: Zickzack-Blitz, darunter „SCHRAPNELL“. Kas hat ihn auf sein Gurtzeug genäht, schief, mit dickem Faden. Wer ihn trägt, gehört zur Crew, die nicht anhält. +1 Reflexe bei Dach-, Sprung- und Flucht-Checks.',
    { ...bonus('Schrapnell-Aufnäher', { attribute: 'reflexe', tags: ['dach', 'springen', 'flucht'], value: 1 }), inspect: 'Die Naht hat jemand einmal aufgetrennt und neu gesetzt. Innen ins Futter, über dem Herzen. Schief. Mit Absicht.' }),

  // --- Romanze-Andenken: Aria ------------------------------------------------------------------------------
  A('zerberster-gravur', 'Zerberster-Gravur', 'Eine Abdeckplatte von Arias Arm. Sie hat mit dem Lötkolben ein kleines Zeichen hineingeritzt, während du die Platte gehalten hast – eure Hände ziemlich nah beieinander. Ist Aria in der Party: +1 Moral.',
    { inspect: 'Das Zeichen ist krumm. Aria sagt, das sei ein Blitz. Du sagst, das sei ein Herz. Ihr habt beide recht.' }),
  A('kabelbrand-pass', 'Kabelbrand-Backstagepass', 'Arias Backstage-Pass vom Abend des Unfalls, eingeschweißt, ein Riss in der Ecke. Sie hat ihn dir auf der Flutmauer in die Hand gedrückt und deine Finger darum geschlossen. Rücken an Rücken: Steht Aria neben dir, wirkt ihr „Unkaputtbar“ einmal pro Kampf auch für dich.',
    { inspect: 'Auf der Rückseite, frisch mit Edding: „Erste Reihe. Du. Versprochen. – A.“' }),
  A('arias-ersatzschlaeger', 'Arias Ersatzschläger', 'Arias zweiter Baseballschläger, mit Stickern, Kronkorken und Isolierband zugekleistert. „Falls der erste mal bricht. Oder ich.“ Schaden 6–9.',
    { weapon: { kind: 'nahkampf', damage: 7, range: 1, hit: 5, ability: 'waffe-homerun' }, giftTags: ['andenken', 'waffe'],
      inspect: 'Am Griff klebt ein Zettel: „Nicht verkaufen, sonst brech ich dir was. Liebe Grüße.“' }),
  A('aria-kronkorken', 'Arias Kronkorken', 'Der Kronkorken, den Aria mit dem Daumen an die Tür deiner Bude gepresst hat. „Damit du weißt, dass ich hier war.“ Er hängt jetzt an der Tür – und irgendwie auch an dir.',
    { giftTags: ['andenken', 'deko'] }),
  A('kas-armband', 'Kas\' Armband', 'Eines von Kas\' schwarzen Kurier-Armbändern. Das andere hängt jetzt am Funkmast. Dieses hier trägt Aria am rechten Handgelenk – „Nicht unter der Dusche ab. Auch nicht, wenn’s stinkt.“',
    { inspect: 'Ein Knoten, den nur Kuriere binden. Aria hat ihn dreimal geübt, bis er hält.' }),
  A('funk-kanal-neun', 'Funk auf Kanal neun', 'Ein verbeultes Kurierfunkgerät, fest auf Kanal 9 gelötet. Kas\' Kanal. Jetzt eurer. Ist Aria in Akt 3 nicht in der Party, kannst du sie einmal für eine Duo-Aktion rufen: „Kanal neun!“',
    { inspect: 'Wenn du den Knopf drückst, rauscht es kurz. Dann ihre Stimme, verschlafen: „Ja. Bin da. Immer.“' }),
];

const items: Record<string, ItemDef> = Object.fromEntries(list.map((item) => [item.id, item]));

export const part: ContentPart = { items };
