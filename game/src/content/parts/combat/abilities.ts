// Kampffähigkeiten (world.md §4.6, §4.7, §8.3–8.5) für Gegner, Bosse, Begleiter, Duo-Aktionen und die Spielfigur.
// Die Engine kennt nur sechs Zustände (gehackt, betaeubt, brennt, markiert, geschuetzt, blutet) und keine
// Passiven, Beschwörungen oder Diebstähle. Wo world.md mehr verlangt, steht hier die nächstbeste Wirkung, und die
// Beschreibung sagt ehrlich, was im Spiel passiert. Lücken: design/plan/gaps/combat.md.
//
// ID-Schema: Gegner `<gegner-id>-<name>`, Bosse `<boss-id>-<name>`, Begleiter `<npc-id>-<name>`,
// Duo-Aktionen `duo-<name>`, Attribut-Aktionen der Spielfigur `kampf-<name>`, Fernzugriffe `hack-<name>`.
import type { AbilityDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const list: AbilityDef[] = [
  // -------------------------------------------------------------------------
  // Gegner (§8.4)
  {
    id: 'abzieher-abziehen', name: 'Abziehen',
    description: 'Ein Griff in die Tasche, ein Stoß hinterher. Wer abgezogen wird, steht kurz blöd da (Markiert).',
    kind: 'nahkampf', ap: 1, target: 'enemy', range: 1, damage: 1, status: { id: 'markiert', turns: 1, chance: 0.6 }, cooldown: 2,
  },
  {
    id: 'strassen-flitzer-ritzer', name: 'Klappmesserchen',
    description: 'Ein winziger Schnitt im Vorbeirennen. Funken statt Blut, aber es zwiebelt (Angeschlagen).',
    kind: 'nahkampf', ap: 1, target: 'enemy', range: 1, damage: 0, status: { id: 'blutet', turns: 2, chance: 0.6 }, cooldown: 2,
  },
  {
    id: 'zerleger-ausraeumen', name: 'Ausräumen',
    description: 'Die Greifzange packt zu und lässt nicht los, bis was kaputt ist (Angeschlagen).',
    kind: 'nahkampf', ap: 1, target: 'enemy', range: 1, damage: 1, status: { id: 'blutet', turns: 2, chance: 0.5 }, cooldown: 2,
  },
  {
    id: 'rostzahn-rudelhieb', name: 'Rudelhieb',
    description: 'Mit der Gang im Rücken saust die Leuchtkette doppelt so selbstbewusst durch die Luft.',
    kind: 'nahkampf', ap: 1, target: 'enemy', range: 2, damage: 2, hit: 5, cooldown: 2,
  },
  {
    id: 'schrottkraehe-funkenregen', name: 'Funkenregen',
    description: 'Die Funkenschleuder spuckt einen Kegel glühender Späne. Was trifft, fängt Feuer (Brennt).',
    kind: 'fernkampf', ap: 2, target: 'area', range: 3, radius: 1, damage: 2, status: { id: 'brennt', turns: 2, chance: 0.5 }, cooldown: 3,
  },
  {
    id: 'ordnungshueter-platz-da', name: 'Platz da!',
    description: 'Schlagstock auf Vorschrift. Wer ihn abbekommt, sieht kurz Sterne (Betäubt).',
    kind: 'nahkampf', ap: 1, target: 'enemy', range: 1, damage: 1, status: { id: 'betaeubt', turns: 1, chance: 0.35 }, cooldown: 3,
  },
  {
    id: 'staubfalke-sandwirbel', name: 'Sandwirbel',
    description: 'Eine Handvoll Ödnis ins Gesicht. Wer Pech hat, reibt sich eine Runde lang die Augen (Betäubt).',
    kind: 'trick', ap: 1, target: 'area', range: 5, radius: 1, status: { id: 'betaeubt', turns: 1, chance: 0.4 }, cooldown: 3,
  },
  {
    id: 'quantum-wachmann-schockstufe', name: 'Schockstufe zwei',
    description: 'Das Schockgewehr wird hochgedreht. Trifft der Schuss, zuckt das Ziel eine Runde (Betäubt).',
    kind: 'fernkampf', ap: 2, target: 'enemy', range: 6, damage: 1, status: { id: 'betaeubt', turns: 1, chance: 0.4 }, cooldown: 3,
  },
  {
    id: 'quantum-schildtraeger-schildwall', name: 'Mobile Deckung',
    description: 'Schild hoch, Kopf runter: eine Runde lang prallt fast alles ab (Geschützt).',
    kind: 'support', ap: 1, target: 'self', range: 0, status: { id: 'geschuetzt', turns: 1 }, cooldown: 2,
  },
  {
    id: 'quantum-scharfschuetze-laserlinie', name: 'Laserlinie',
    description: 'Ein roter Punkt wandert über die Brust des Ziels. Alle wissen, was das heißt (Markiert, 2 Runden).',
    kind: 'fernkampf', ap: 1, target: 'enemy', range: 10, status: { id: 'markiert', turns: 2 }, cooldown: 2,
  },
  {
    id: 'quantum-techniker-reparatur', name: 'Reparatur',
    description: 'Ein Schraubenzieher, ein Gebet an die Garantieabteilung: ein Verbündeter bekommt 15 LP zurück.',
    kind: 'support', ap: 1, target: 'ally', range: 4, heal: 15, cooldown: 2,
  },
  {
    id: 'quantum-techniker-gegenhack', name: 'Gegenhack',
    description: 'Schickt einen Firmenvirus zurück an den Absender. Das Ziel hängt eine Runde in der Warteschleife (Gehackt).',
    kind: 'hack', ap: 1, target: 'enemy', range: 6, status: { id: 'gehackt', turns: 1, chance: 0.5 }, cooldown: 3,
  },
  {
    id: 'quantum-betreuer-werbesprache', name: 'Werbesprache',
    description: '„Haben Sie schon von unserem Premium-Tarif gehört?“ So penetrant freundlich, dass man vergisst, was man wollte (Betäubt).',
    kind: 'trick', ap: 1, target: 'enemy', range: 4, status: { id: 'betaeubt', turns: 1, chance: 0.4 }, cooldown: 3,
  },
  {
    id: 'quantum-betreuer-chip-befehl', name: 'Chip-Befehl',
    description: '„Bitte schützen Sie Ihren Kundenbetreuer.“ Ein Verbündeter stellt sich in den Weg (Geschützt).',
    kind: 'support', ap: 1, target: 'ally', range: 5, status: { id: 'geschuetzt', turns: 1 }, cooldown: 2,
  },
  {
    id: 'venom-garde-sprungangriff', name: 'Sprungangriff',
    description: 'Ein Satz über drei Felder, die Schockklinge voraus.',
    kind: 'nahkampf', ap: 2, target: 'enemy', range: 4, damage: 3, cooldown: 2,
  },
  {
    id: 'spaeherdrohne-scan', name: 'Scan',
    description: 'Ein roter Fächer tastet das Ziel ab und funkt die Koordinaten an alle (Markiert).',
    kind: 'hack', ap: 1, target: 'enemy', range: 5, status: { id: 'markiert', turns: 2 }, cooldown: 2,
  },
  {
    id: 'stoerdrohne-stoerfeld', name: 'Störfeld',
    description: 'Funkrauschen in drei Feldern Umkreis. Cyberware stottert, manchmal setzt sie ganz aus (Gehackt).',
    kind: 'hack', ap: 1, target: 'area', range: 3, radius: 1, status: { id: 'gehackt', turns: 1, chance: 0.3 }, cooldown: 2,
  },
  {
    id: 'geschuetzdrohne-unterdrueckungsfeuer', name: 'Unterdrückungsfeuer',
    description: 'Ein Impulsteppich auf eine ganze Ecke. Wer drinsteht, wird angekratzt und angezählt (Markiert).',
    kind: 'fernkampf', ap: 2, target: 'area', range: 7, radius: 1, damage: 3, status: { id: 'markiert', turns: 1, chance: 0.5 }, cooldown: 3,
  },
  {
    id: 'sanidrohne-flicken', name: 'Flicken',
    description: 'Sprühpflaster und Nanogel: ein Verbündeter bekommt 12 LP zurück.',
    kind: 'support', ap: 1, target: 'ally', range: 4, heal: 12, cooldown: 1,
  },
  {
    id: 'sanidrohne-schildblase', name: 'Schildblase',
    description: 'Eine schillernde Blase um einen Verbündeten (Geschützt).',
    kind: 'support', ap: 1, target: 'ally', range: 3, status: { id: 'geschuetzt', turns: 1 }, cooldown: 2,
  },
  {
    id: 'robohund-anspringen', name: 'Hetzjagd',
    description: 'Ausgemusterte Hunde laufen schneller als ihr Garantieschein: Sprung aus drei Feldern, Zähne voraus.',
    kind: 'nahkampf', ap: 1, target: 'enemy', range: 3, damage: 1, hit: 10, cooldown: 2,
  },
  {
    id: 'robohund-alpha-heulen', name: 'Heulen',
    description: 'Ein Heulen wie eine kaputte Alarmanlage. Das Rudel rückt zusammen (Geschützt).',
    kind: 'support', ap: 1, target: 'area', range: 0, radius: 3, status: { id: 'geschuetzt', turns: 1 }, cooldown: 3,
  },
  {
    id: 'digitech-waechter-klammergriff', name: 'Klammergriff',
    description: 'Veraltete Greifzange, aktuelles Problem: Wer gepackt wird, hängt eine Runde fest (Betäubt).',
    kind: 'nahkampf', ap: 1, target: 'enemy', range: 1, damage: 0, status: { id: 'betaeubt', turns: 1, chance: 0.35 }, cooldown: 3,
  },
  {
    id: 'windrad-drohne-rotorschlag', name: 'Rotorschlag',
    description: 'Die Rotoren drehen hoch und mähen alles in einem Feld Umkreis.',
    kind: 'nahkampf', ap: 1, target: 'area', range: 0, radius: 1, damage: 2, cooldown: 2,
  },
  {
    id: 'rohrkriecher-putzen', name: 'Putzen',
    description: 'Der Bürstenarm schrubbt mit dreihundert Umdrehungen. Danach dreht sich auch das Ziel (Betäubt).',
    kind: 'nahkampf', ap: 1, target: 'enemy', range: 1, damage: 1, status: { id: 'betaeubt', turns: 1, chance: 0.3 }, cooldown: 3,
  },
  {
    id: 'rattenschwarm-gewimmel', name: 'Gewimmel',
    description: 'Hunderte Pfoten, tausend Zähne: Schaden auf alle Nachbarfelder.',
    kind: 'nahkampf', ap: 1, target: 'area', range: 0, radius: 1, damage: 1, cooldown: 1,
  },
  {
    id: 'ratten-mutant-kanalmief', name: 'Kanalmief',
    description: 'Er hebt den Arm. Wer daneben steht, würgt eine Runde lang (Betäubt).',
    kind: 'trick', ap: 1, target: 'area', range: 0, radius: 1, status: { id: 'betaeubt', turns: 1, chance: 0.3 }, cooldown: 3,
  },
  {
    id: 'kabelmolch-entladung', name: 'Entladung',
    description: 'Der Molch hat zu viel Chip-Müll gefressen und gibt alles auf einmal zurück (Betäubt).',
    kind: 'nahkampf', ap: 2, target: 'area', range: 0, radius: 1, damage: 2, status: { id: 'betaeubt', turns: 1, chance: 0.3 }, cooldown: 3,
  },
  {
    id: 'glasskorpion-stich', name: 'Glasstich',
    description: 'Der Stachel funkelt wie Weihnachten. Getroffen funkelt es noch eine Runde weiter (Betäubt).',
    kind: 'nahkampf', ap: 1, target: 'enemy', range: 1, damage: 1, status: { id: 'betaeubt', turns: 1, chance: 0.35 }, cooldown: 2,
  },
  {
    id: 'sicherheitsprogramm-datenstich', name: 'Datenstich',
    description: 'Ein Stich direkt in die Bandbreite. Das Ziel hängt eine Runde (Gehackt).',
    kind: 'hack', ap: 1, target: 'enemy', range: 4, damage: 1, status: { id: 'gehackt', turns: 1, chance: 0.35 }, cooldown: 2,
  },
  {
    id: 'gechippter-bewohner-festhalten', name: '„Master!“',
    description: 'Höflich, aber bestimmt: Die gechippte Person klammert sich fest und flüstert „Master“ (Betäubt).',
    kind: 'nahkampf', ap: 1, target: 'enemy', range: 1, damage: 0, status: { id: 'betaeubt', turns: 1, chance: 0.3 }, cooldown: 3,
  },
  {
    id: 'gechippter-partygast-choreografie', name: 'Choreografie',
    description: 'Alle Gäste machen dieselbe Drehung im selben Takt. Wer dazwischen steht, wird mitgerissen.',
    kind: 'nahkampf', ap: 1, target: 'area', range: 0, radius: 1, damage: 1, cooldown: 2,
  },
  {
    id: 'gechippte-wache-schockschuss', name: 'Schockschuss',
    description: 'Ausdruckslos, präzise: Ein Schuss, der die Muskeln für eine Runde abschaltet (Betäubt).',
    kind: 'fernkampf', ap: 2, target: 'enemy', range: 6, damage: 1, status: { id: 'betaeubt', turns: 1, chance: 0.4 }, cooldown: 3,
  },
  {
    id: 'nexus-splitter-logikschleife', name: 'Logikschleife',
    description: '„Ihr Menschen seid ineffizient.“ Ein Gedankenknoten, aus dem man eine Runde nicht herausfindet (Gehackt).',
    kind: 'hack', ap: 1, target: 'enemy', range: 6, status: { id: 'gehackt', turns: 1, chance: 0.45 }, cooldown: 3,
  },

  // -------------------------------------------------------------------------
  // Bosse (§8.5)
  {
    id: 'boss-ripper-ausschlachten', name: 'Ausschlachten',
    description: '„Was haben wir denn da?“ Ripper greift nach der Cyberware und schraubt, wo er kann (Angeschlagen).',
    kind: 'nahkampf', ap: 2, target: 'enemy', range: 1, damage: 4, attribute: 'technik', status: { id: 'blutet', turns: 3 }, cooldown: 3,
  },
  {
    id: 'boss-ripper-rauchbombe', name: 'Rauchbombe',
    description: 'Puff, Gestank, weg ist er. Zwei Runden lang trifft ihn kaum jemand (Geschützt).',
    kind: 'support', ap: 1, target: 'self', range: 0, status: { id: 'geschuetzt', turns: 2 }, uses: 1,
  },
  {
    id: 'boss-jimmy-werbepause', name: 'Werbepause',
    description: '„Wir unterbrechen für eine kurze Botschaft unserer Sponsoren!“ Das Ziel starrt eine Runde ins Leere (Betäubt).',
    kind: 'hack', ap: 1, target: 'enemy', range: 5, status: { id: 'betaeubt', turns: 1, chance: 0.6 }, cooldown: 3,
  },
  {
    id: 'boss-jimmy-faesserturm', name: 'Fässerturm',
    description: 'Jimmy tritt gegen den Ölfass-Turm. Drei Felder voll rollender Fässer.',
    kind: 'nahkampf', ap: 2, target: 'area', range: 4, radius: 1, damage: 4, attribute: 'koerper', cooldown: 3,
  },
  {
    id: 'boss-jimmy-kundenservice', name: 'Kundenservice',
    description: '„Ihre Zufriedenheit ist uns wichtig!“ Jimmy repariert sich selbst um 15 LP.',
    kind: 'support', ap: 1, target: 'self', range: 0, heal: 15, cooldown: 3,
  },
  {
    id: 'boss-nagbert-schwanzpeitsche', name: 'Schwanzpeitsche',
    description: 'Ein königlicher Schwanz, so dick wie ein Abflussrohr, fegt einen Kegel leer.',
    kind: 'nahkampf', ap: 1, target: 'area', range: 2, radius: 1, damage: 3, cooldown: 2,
  },
  {
    id: 'boss-nagbert-koeniglicher-befehl', name: 'Königlicher Befehl',
    description: '„Untertanen!“ Nagbert quiekt, die Ratten rücken zusammen und fassen Mut (Geschützt).',
    kind: 'support', ap: 1, target: 'area', range: 0, radius: 4, status: { id: 'geschuetzt', turns: 1 }, cooldown: 2,
  },
  {
    id: 'boss-nagbert-kronenwurf', name: 'Kronenwurf',
    description: 'Die Kronkorken-Krone fliegt wie ein Wurfstern und klirrt zurück in die Pfote.',
    kind: 'fernkampf', ap: 1, target: 'enemy', range: 5, damage: 7, attribute: 'reflexe', cooldown: 1,
  },
  {
    id: 'boss-funzel-anbruellen', name: 'Anbrüllen',
    description: '„Wer zuckt, zahlt doppelt!“ Die Rostzähne reißen sich zusammen (+6 LP, Geschützt).',
    kind: 'support', ap: 1, target: 'area', range: 0, radius: 4, heal: 6, status: { id: 'geschuetzt', turns: 1 }, cooldown: 3,
  },
  {
    id: 'boss-wachkoloss-stampfen', name: 'Stampfen',
    description: 'Der Boden springt. Alles in einem Feld Umkreis fliegt hoch und landet unsanft (Betäubt).',
    kind: 'nahkampf', ap: 1, target: 'area', range: 0, radius: 1, damage: 3, status: { id: 'betaeubt', turns: 1, chance: 0.5 }, cooldown: 2,
  },
  {
    id: 'boss-wachkoloss-greifarm', name: 'Greifarm',
    description: 'Ein Teleskoparm schnappt über drei Felder und knallt das Ziel gegen die Hallenwand.',
    kind: 'nahkampf', ap: 1, target: 'enemy', range: 3, damage: 2, cooldown: 2,
  },
  {
    id: 'boss-zuendholz-flammenarm', name: 'Flammenarm',
    description: 'Ein Kegel aus Feuer. Alesa über Lautsprecher: „Bitte nicht den linken Arm, der war teuer!“ (Brennt)',
    kind: 'fernkampf', ap: 2, target: 'area', range: 3, radius: 1, damage: 6, attribute: 'koerper', status: { id: 'brennt', turns: 2 }, cooldown: 2,
  },
  {
    id: 'boss-kraehe-sturmruf', name: 'Sturmruf',
    description: 'Krähe ruft den Wind. Sand peitscht, die Falken verschwinden halb im Staub (Geschützt).',
    kind: 'support', ap: 1, target: 'area', range: 0, radius: 4, status: { id: 'geschuetzt', turns: 1 }, cooldown: 3,
  },
  {
    id: 'boss-glasskorpion-koenigin-glasstachel', name: 'Glasstachel',
    description: 'Ein Stachel wie ein Kronleuchter, nur spitzer (Betäubt).',
    kind: 'nahkampf', ap: 1, target: 'enemy', range: 1, damage: 2, status: { id: 'betaeubt', turns: 1, chance: 0.5 }, cooldown: 2,
  },
  {
    id: 'boss-glasskorpion-koenigin-prisma', name: 'Prisma',
    description: 'Ihr Panzer bricht das Licht in tausend Strahlen. Wer hinschaut, sieht eine Runde Regenbögen (Betäubt).',
    kind: 'trick', ap: 1, target: 'area', range: 0, radius: 3, status: { id: 'betaeubt', turns: 1, chance: 0.3 }, cooldown: 3,
  },
  {
    id: 'boss-glasskorpion-koenigin-eingraben', name: 'Eingraben',
    description: 'Sie verschwindet im Glas. Zwei Runden lang ist kaum ein Treffer möglich (Geschützt).',
    kind: 'support', ap: 1, target: 'self', range: 0, status: { id: 'geschuetzt', turns: 2 }, uses: 1,
  },
  {
    id: 'boss-xion-venomkralle', name: 'Venomkralle',
    description: 'Die Kralle reißt Funken aus der Panzerung (Angeschlagen).',
    kind: 'nahkampf', ap: 1, target: 'enemy', range: 1, damage: 2, status: { id: 'blutet', turns: 2, chance: 0.6 }, cooldown: 2,
  },
  {
    id: 'boss-xion-zum-reden-bringen', name: '„Ich könnte sie zum Reden bringen“',
    description: 'Xion lächelt, als hätte er Hobbys, über die man nicht spricht. Das Ziel zögert eine Runde (Betäubt).',
    kind: 'trick', ap: 1, target: 'enemy', range: 3, status: { id: 'betaeubt', turns: 1, chance: 0.4 }, cooldown: 3,
  },
  {
    id: 'boss-xion-nicht-dumm', name: '„Ich bin nicht dumm!“',
    description: 'Xion verliert die Fassung und schlägt zu, als würde er dafür bezahlt. Wird er ja auch.',
    kind: 'nahkampf', ap: 2, target: 'enemy', range: 1, damage: 6, hit: 5, cooldown: 2,
  },
  {
    id: 'boss-raven-handschellen', name: 'Handschellen-Trick',
    description: 'Klick. Jemand hängt plötzlich am Nachbarn fest (Betäubt).',
    kind: 'trick', ap: 1, target: 'enemy', range: 1, status: { id: 'betaeubt', turns: 1 }, cooldown: 2,
  },
  {
    id: 'boss-raven-lagebild', name: 'Lagebild',
    description: 'Raven liest das Feld wie eine Akte. Alle in der Nähe sind für die Gechippten sichtbar (Markiert).',
    kind: 'support', ap: 1, target: 'area', range: 6, radius: 2, status: { id: 'markiert', turns: 1 }, cooldown: 3,
  },
  {
    id: 'boss-blade-charmeur', name: 'Charmeur',
    description: '„Na, Liebes? Wollen wir nicht einfach vernünftig sein?“ Das Ziel vergisst eine Runde, auf welcher Seite es steht (Betäubt).',
    kind: 'trick', ap: 1, target: 'enemy', range: 5, status: { id: 'betaeubt', turns: 1, chance: 0.5 }, cooldown: 2,
  },
  {
    id: 'boss-blade-ich-teile-nicht', name: '„Ich teile nicht gerne“',
    description: 'Blade richtet die Manschetten, nimmt sich, was er will, und steht zwei Runden über den Dingen (Geschützt).',
    kind: 'support', ap: 1, target: 'self', range: 0, status: { id: 'geschuetzt', turns: 2 }, cooldown: 4,
  },
  {
    id: 'boss-blade-handschellen', name: 'Handschellen an die Antenne',
    description: 'Ravens Trick, geklaut: Das Ziel hängt zwei Runden an einer Antenne (Betäubt).',
    kind: 'trick', ap: 1, target: 'enemy', range: 1, status: { id: 'betaeubt', turns: 2 }, cooldown: 3,
  },
  {
    id: 'boss-blade-champagnerkorken', name: 'Champagnerkorken',
    description: 'Plopp. Der Korken trifft wie ein Gummigeschoss, der Schaum brennt in den Augen (Betäubt).',
    kind: 'fernkampf', ap: 1, target: 'enemy', range: 6, damage: 8, attribute: 'reflexe', status: { id: 'betaeubt', turns: 1, chance: 0.35 }, cooldown: 2,
  },
  {
    id: 'nexus-knoten-logik-wahrscheinlichkeit', name: '„Wahrscheinlichkeit 99,9 %“',
    description: 'Der Logik-Knoten rechnet aus, wer am meisten aushält, und markiert genau diese Person (Markiert).',
    kind: 'hack', ap: 1, target: 'enemy', range: 12, status: { id: 'markiert', turns: 2 }, cooldown: 2,
  },
  {
    id: 'nexus-knoten-kontrolle-befehl', name: 'Kontrollimpuls',
    description: 'Ein Befehl an alle Chips im Saal. Wer selbst Cyberware trägt, spürt ihn auch (Gehackt).',
    kind: 'hack', ap: 1, target: 'area', range: 8, radius: 1, status: { id: 'gehackt', turns: 1, chance: 0.4 }, cooldown: 3,
  },
  {
    id: 'nexus-knoten-stimme-vertraut', name: 'Vertraute Stimme',
    description: 'Der Knoten spricht mit der Stimme von jemandem, den das Ziel liebt. Es erstarrt (Betäubt).',
    kind: 'hack', ap: 1, target: 'enemy', range: 10, status: { id: 'betaeubt', turns: 1, chance: 0.5 }, cooldown: 3,
  },
  {
    id: 'boss-nexus-kern-firewall-welle', name: 'Firewall-Welle',
    description: 'Licht rast durch die Kabelkanäle. Wer im Muster steht, wird gegrillt (Betäubt).',
    kind: 'hack', ap: 2, target: 'area', range: 12, radius: 2, damage: 5, status: { id: 'betaeubt', turns: 1, chance: 0.5 }, cooldown: 2,
  },

  // -------------------------------------------------------------------------
  // Begleiter (§4.6). Fähigkeit 1 und 2 als `stats.abilities`, die Herz-Fähigkeit als `heartAbilities` (♥6).
  {
    id: 'vega-adlerauge', name: 'Adlerauge',
    description: 'Vega nimmt ein Ziel ins Visier. Zwei Runden lang trifft es jeder leichter (Markiert).',
    kind: 'fernkampf', ap: 1, target: 'enemy', range: 10, status: { id: 'markiert', turns: 2 }, cooldown: 2,
  },
  {
    id: 'vega-kobra-schuss', name: 'Kobra-Schuss',
    description: 'Ein Schuss, der um halbe Deckung herumgeht: +20 Treffer, +4 Schaden.',
    kind: 'fernkampf', ap: 2, target: 'enemy', range: 8, damage: 4, hit: 20, cooldown: 2,
  },
  {
    id: 'vega-kobra-schuss-plus', name: 'Kobra-Schuss',
    description: 'Mit dem zurückgeholten Zielfernrohr: +20 Treffer, +4 Schaden, ein Feld mehr Reichweite.',
    kind: 'fernkampf', ap: 2, target: 'enemy', range: 9, damage: 4, hit: 20, cooldown: 2,
  },
  {
    id: 'vega-wachhund', name: 'Wachhund',
    description: 'Vega schießt auf alles, was sich bewegt: schneller Schuss mit +10 Treffer.',
    kind: 'fernkampf', ap: 1, target: 'enemy', range: 8, damage: 1, hit: 10, cooldown: 1,
  },
  {
    id: 'aria-zerbersten', name: 'Zerbersten',
    description: 'Der Zerberster holt aus. Was davorsteht, ist hinterher kleiner (+3 Schaden, +10 Treffer).',
    kind: 'nahkampf', ap: 2, target: 'enemy', range: 1, damage: 3, hit: 10, cooldown: 2,
  },
  {
    id: 'aria-homerun', name: 'Homerun',
    description: '„Und weg!“ Ein Schlag wie ein Abschlag. Das Ziel taumelt (Betäubt).',
    kind: 'nahkampf', ap: 1, target: 'enemy', range: 1, damage: 1, status: { id: 'betaeubt', turns: 1, chance: 0.5 }, cooldown: 2,
  },
  {
    id: 'aria-unkaputtbar', name: 'Unkaputtbar',
    description: '„Ich fall heut nicht um.“ Einmal pro Kampf: Aria beißt die Zähne zusammen, +15 LP und Geschützt.',
    kind: 'support', ap: 1, target: 'self', range: 0, heal: 15, status: { id: 'geschuetzt', turns: 1 }, uses: 1,
  },
  {
    id: 'raven-handschellen-trick', name: 'Handschellen-Trick',
    description: 'Klick. Der Nachbar hängt eine Runde fest (Betäubt).',
    kind: 'trick', ap: 1, target: 'enemy', range: 1, status: { id: 'betaeubt', turns: 1 }, cooldown: 2,
  },
  {
    id: 'raven-handschellen-trick-plus', name: 'Handschellen-Trick',
    description: 'Mit der alten Handschelle von damals: zwei Runden festgekettet (Betäubt).',
    kind: 'trick', ap: 1, target: 'enemy', range: 1, status: { id: 'betaeubt', turns: 2 }, cooldown: 2,
  },
  {
    id: 'raven-lagebild', name: 'Lagebild',
    description: 'Raven liest das Feld wie eine Akte: alle Gegner im Umkreis sind sichtbar, auch hinter Deckung (Markiert).',
    kind: 'support', ap: 1, target: 'area', range: 6, radius: 2, status: { id: 'markiert', turns: 1 }, cooldown: 3,
  },
  {
    id: 'raven-konter', name: 'Konter',
    description: 'Raven stellt sich breitbeinig hin und wartet. Wer zuschlägt, beißt auf Granit (Geschützt).',
    kind: 'support', ap: 1, target: 'self', range: 0, status: { id: 'geschuetzt', turns: 1 }, cooldown: 2,
  },
  {
    id: 'nyra-silent-angel', name: 'Silent Angel',
    description: 'Nyra verschwindet im Rauschen. Eine Runde lang findet sie kaum jemand (Geschützt).',
    kind: 'hack', ap: 1, target: 'self', range: 0, status: { id: 'geschuetzt', turns: 2 }, cooldown: 3,
  },
  {
    id: 'nyra-zentrator-umkehr', name: 'Zentrator-Umkehr',
    description: 'Nyra dreht einer Drohne die Steuerlogik um. Zwei Runden lang tut sie gar nichts mehr (Gehackt).',
    kind: 'hack', ap: 2, target: 'enemy', range: 6, attribute: 'technik', status: { id: 'gehackt', turns: 2, chance: 0.8 }, cooldown: 3,
  },
  {
    id: 'nyra-meeresrauschen', name: 'Meeresrauschen',
    description: 'Wellenrauschen über alle Funkkanäle. Die Party atmet durch (+6 LP, Geschützt).',
    kind: 'support', ap: 1, target: 'area', range: 0, radius: 4, heal: 6, status: { id: 'geschuetzt', turns: 1 }, cooldown: 3,
  },
  {
    id: 'jimmy-firewall-kuss', name: 'Firewall-Kuss',
    description: 'Jimmy schickt dem Ziel einen digitalen Schmatzer. Es hängt eine Runde (Gehackt).',
    kind: 'hack', ap: 1, target: 'enemy', range: 5, status: { id: 'gehackt', turns: 1, chance: 0.75 }, cooldown: 2,
  },
  {
    id: 'jimmy-chipfieber', name: 'Chipfieber',
    description: 'Jimmy weiß selbst nicht, was passiert. Meistens brennt danach irgendwas (Brennt).',
    kind: 'hack', ap: 1, target: 'area', range: 5, radius: 1, damage: 2, status: { id: 'brennt', turns: 2, chance: 0.5 }, cooldown: 2,
  },
  {
    id: 'jimmy-ersatzmann', name: 'Ersatzmann',
    description: '„Ich übernehm!“ Jimmy wirft sich vor einen Verbündeten (Geschützt).',
    kind: 'support', ap: 1, target: 'ally', range: 2, status: { id: 'geschuetzt', turns: 1 }, cooldown: 2,
  },
  {
    id: 'jimmy-comeback', name: 'Comeback',
    description: 'Jimmy rappelt sich auf und repariert sich mit Werbejingles: +12 LP und Geschützt.',
    kind: 'support', ap: 1, target: 'self', range: 0, heal: 12, status: { id: 'geschuetzt', turns: 1 }, uses: 1,
  },
  {
    id: 'dante-nougatbomben-wurf', name: 'Nougatbomben-Wurf',
    description: 'Ein Schokoriegel fliegt im hohen Bogen. Ein Verbündeter in 4 Feldern bekommt 15 LP.',
    kind: 'support', ap: 1, target: 'ally', range: 4, heal: 15, cooldown: 1,
  },
  {
    id: 'dante-heiliges-kanonenrohr', name: 'Heiliges Kanonenrohr',
    description: '„Heiliges Kanonenrohr!“ Ein Impuls im Umkreis 2: Drohnen und Cyberware gehen eine Runde in die Knie (Gehackt).',
    kind: 'hack', ap: 2, target: 'area', range: 5, radius: 2, damage: 2, attribute: 'technik', status: { id: 'gehackt', turns: 1, chance: 0.7 }, cooldown: 3,
  },
  {
    id: 'dante-kuschel-ablenkung', name: 'Kuschel-Ablenkung',
    description: 'Captain Kuschel hoppelt mitten ins Getümmel. Niemand kann wegschauen (Betäubt).',
    kind: 'trick', ap: 1, target: 'area', range: 4, radius: 2, status: { id: 'betaeubt', turns: 1, chance: 0.6 }, uses: 1,
  },
  {
    id: 'hunter-drinks', name: 'Ich schenk hier die Drinks aus',
    description: 'Hunter sieht das Ziel nur an. Moral −40, ganz ohne Check.',
    kind: 'sozial', ap: 1, target: 'enemy', range: 5, damage: 40, cooldown: 2,
  },
  {
    id: 'hunter-runde-aufs-haus', name: 'Runde aufs Haus',
    description: '„Geht aufs Haus. Heute.“ Die ganze Party +10 LP und Geschützt.',
    kind: 'support', ap: 2, target: 'area', range: 0, radius: 12, heal: 10, status: { id: 'geschuetzt', turns: 1 }, cooldown: 4,
  },
  {
    id: 'hunter-schmiere-stehen', name: 'Schmiere stehen',
    description: 'Hunter stellt sich vor einen Verbündeten und guckt böse (Geschützt, 2 Runden).',
    kind: 'support', ap: 1, target: 'ally', range: 2, status: { id: 'geschuetzt', turns: 2 }, cooldown: 2,
  },
  {
    id: 'hunter-innere-mitte', name: 'Innere Mitte',
    description: 'Einmal pro Kampf: Hunter atmet aus, die Party atmet mit. Alle +8 LP und Geschützt.',
    kind: 'support', ap: 1, target: 'area', range: 0, radius: 12, heal: 8, status: { id: 'geschuetzt', turns: 1 }, uses: 1,
  },
  {
    id: 'marla-sandschleier', name: 'Sandschleier',
    description: 'Marla wirft eine Plane und eine Handvoll Sand: ein kleines Feld Deckung (Geschützt, 2 Runden).',
    kind: 'support', ap: 1, target: 'area', range: 4, radius: 1, status: { id: 'geschuetzt', turns: 2 }, cooldown: 3,
  },
  {
    id: 'marla-wasser-teilen', name: 'Wasser teilen',
    description: 'Ein Schluck aus der Feldflasche: +12 LP.',
    kind: 'support', ap: 1, target: 'ally', range: 1, heal: 12, cooldown: 1,
  },
  {
    id: 'marla-windkundig', name: 'Windkundig',
    description: 'Marla dreht die Party aus dem Wind. Alle in der Nähe sind eine Runde schwer zu treffen (Geschützt).',
    kind: 'support', ap: 1, target: 'area', range: 0, radius: 3, status: { id: 'geschuetzt', turns: 1 }, cooldown: 3,
  },
  {
    id: 'lio-mutmacher-melodie', name: 'Mutmacher-Melodie',
    description: 'Drei Akkorde, schief, aber ehrlich. Verbündete in 3 Feldern +4 LP und Geschützt.',
    kind: 'support', ap: 1, target: 'area', range: 0, radius: 3, heal: 4, status: { id: 'geschuetzt', turns: 1 }, cooldown: 2,
  },
  {
    id: 'lio-dissonanz', name: 'Dissonanz',
    description: 'Ein Akkord, für den es in der Musiktheorie keinen Namen gibt. Gegner in 2 Feldern verlieren den Mut.',
    kind: 'sozial', ap: 2, target: 'area', range: 4, radius: 2, damage: 10, attribute: 'ausstrahlung', cooldown: 3,
  },
  {
    id: 'lio-zugabe', name: 'Zugabe!',
    description: 'Einmal pro Kampf: Lio spielt die eine Zeile, die alle kennen. Ein Verbündeter +15 LP und Geschützt.',
    kind: 'support', ap: 1, target: 'ally', range: 5, heal: 15, status: { id: 'geschuetzt', turns: 1 }, uses: 1,
  },
  {
    id: 'ripper-ausschlachten', name: 'Ausschlachten',
    description: '„Halt still, das tut nur kurz weh.“ Ripper schraubt am Gegner herum (Angeschlagen).',
    kind: 'nahkampf', ap: 2, target: 'enemy', range: 1, damage: 4, attribute: 'technik', status: { id: 'blutet', turns: 3 }, cooldown: 3,
  },
  {
    id: 'ripper-rauchbombe', name: 'Rauchbombe',
    description: 'Einmal pro Kampf: 3 × 3 Felder stinkender Qualm. Wer drinsteht, hustet eine Runde (Betäubt).',
    kind: 'trick', ap: 1, target: 'area', range: 4, radius: 1, status: { id: 'betaeubt', turns: 1, chance: 0.6 }, uses: 1,
  },
  {
    id: 'ripper-kleiner-deal', name: 'Kleiner Deal',
    description: '„Ich mach dir ein Angebot.“ Moral −25 beim Ziel, Ripper redet schneller als es denken kann.',
    kind: 'sozial', ap: 1, target: 'enemy', range: 4, damage: 25, cooldown: 3,
  },
  {
    id: 'barkeeper-mondschnitt', name: 'Mondschnitt',
    description: 'Die Kabelpeitsche zieht einen silbernen Halbkreis (Angeschlagen).',
    kind: 'nahkampf', ap: 1, target: 'area', range: 2, radius: 1, damage: 2, status: { id: 'blutet', turns: 2, chance: 0.6 }, cooldown: 2,
  },
  {
    id: 'barkeeper-stille-wacht', name: 'Stille Wacht',
    description: 'Er poliert ein Glas und sieht alles. Ein Verbündeter steht unter seinem Schutz (Geschützt, 2 Runden).',
    kind: 'support', ap: 1, target: 'ally', range: 4, status: { id: 'geschuetzt', turns: 2 }, cooldown: 2,
  },
  {
    id: 'barkeeper-letzter-vers', name: 'Letzter Vers',
    description: 'Einmal pro Kampf: Ein Schlag wie das Ende eines Gedichts. Trifft (fast) immer.',
    kind: 'nahkampf', ap: 1, target: 'enemy', range: 2, damage: 4, hit: 60, uses: 1,
  },
  {
    id: 'wache-schildwall', name: 'Schildwall',
    description: 'Kessel stellt sich quer. Angrenzende Verbündete sind geschützt.',
    kind: 'support', ap: 1, target: 'area', range: 0, radius: 1, status: { id: 'geschuetzt', turns: 1 }, cooldown: 2,
  },
  {
    id: 'wache-vorschrift', name: 'Vorschrift ist Vorschrift',
    description: '„Stehen bleiben, Paragraf 12!“ Das Ziel ist so verdattert, dass es jeder trifft (Markiert).',
    kind: 'trick', ap: 1, target: 'enemy', range: 5, status: { id: 'markiert', turns: 2 }, cooldown: 2,
  },
  {
    id: 'wache-wir-sehen-uns-nicht-wieder', name: 'Wir sehen uns nicht wieder',
    description: 'Einmal pro Kampf: Kessel schreibt einen Platzverweis. Wer Moral hat, geht.',
    kind: 'sozial', ap: 1, target: 'enemy', range: 4, damage: 100, uses: 1,
  },
  {
    id: 'alesa-prototyp-werfen', name: 'Prototyp werfen',
    description: 'Niemand weiß, was es ist, nicht einmal Alesa. Diesmal: Feuer (Brennt). Vielleicht.',
    kind: 'hack', ap: 1, target: 'area', range: 5, radius: 1, damage: 3, status: { id: 'brennt', turns: 2, chance: 0.4 }, cooldown: 2,
  },
  {
    id: 'alesa-kalibrieren', name: 'Kalibrieren',
    description: 'Ein paar Handgriffe an fremder Cyberware: ein Verbündeter +10 LP und Geschützt.',
    kind: 'support', ap: 1, target: 'ally', range: 2, heal: 10, status: { id: 'geschuetzt', turns: 1 }, cooldown: 2,
  },
  {
    id: 'alesa-schwarmstoerer', name: 'Schwarmstörer',
    description: 'Ein Notfall-Patch aus ihrer eigenen Werkstatt: alles mit Chip im weiten Umkreis hängt (Gehackt).',
    kind: 'hack', ap: 2, target: 'area', range: 0, radius: 6, status: { id: 'gehackt', turns: 1, chance: 0.6 }, uses: 1,
  },
  {
    id: 'xion-venom-krallengriff', name: 'Krallengriff',
    description: 'Die Kralle hält fest und lässt Funken sprühen (Angeschlagen).',
    kind: 'nahkampf', ap: 1, target: 'enemy', range: 1, damage: 2, status: { id: 'blutet', turns: 2, chance: 0.6 }, cooldown: 2,
  },
  {
    id: 'xion-venom-sicherheitsprotokoll', name: 'Sicherheitsprotokoll',
    description: '„Formation!“ Xion bellt alte Befehle, die Party steht plötzlich richtig (Geschützt).',
    kind: 'support', ap: 1, target: 'area', range: 0, radius: 3, status: { id: 'geschuetzt', turns: 1 }, cooldown: 3,
  },
  {
    id: 'xion-venom-kenn-ich-war-ich', name: 'Kenn ich, war ich',
    description: 'Xion kennt jeden Trick der Quantum-Leute, weil er ihn erfunden hat. Gegner im Umkreis verlieren Moral.',
    kind: 'sozial', ap: 1, target: 'area', range: 0, radius: 5, damage: 20, cooldown: 3,
  },

  // -------------------------------------------------------------------------
  // Duo-Aktionen (§4.6, §4.7 „Status zusammen“). Kosten 2 AP bei einer Person; die Freischaltung hängt an
  // Party und Herzen (siehe gaps/combat.md), die Wirkung steht hier.
  {
    id: 'duo-express-zustellung', name: 'Express-Zustellung',
    description: 'Aria: „Paket für dich!“ – Vex: „Zugestellt.“ Homerun, Hechtsprung, Schuss vom Metallunterarm: +20 Treffer, das Ziel ist danach markiert.',
    kind: 'fernkampf', ap: 2, target: 'enemy', range: 6, damage: 3, hit: 20, status: { id: 'markiert', turns: 2 }, cooldown: 3,
  },
  {
    id: 'duo-rueckendeckung', name: 'Rückendeckung',
    description: 'Vex: „Ich hab dich.“ – Aria: „Nee. ICH hab DICH.“ Einmal pro Kampf: Aria stellt sich vor Vex (Geschützt, 2 Runden).',
    kind: 'support', ap: 1, target: 'ally', range: 1, status: { id: 'geschuetzt', turns: 2 }, uses: 1,
  },
  {
    id: 'duo-ruecken-an-ruecken', name: 'Rücken an Rücken',
    description: 'Einmal pro Kampf, wenn Aria daneben steht: Die Spielfigur fällt heute nicht um. +15 LP und Geschützt.',
    kind: 'support', ap: 1, target: 'self', range: 0, heal: 15, status: { id: 'geschuetzt', turns: 1 }, uses: 1,
  },
  {
    id: 'duo-die-wachhunde', name: 'Die Wachhunde',
    description: 'Vega zielt, Aria schlägt: Das Ziel geht zu Boden (Betäubt).',
    kind: 'nahkampf', ap: 2, target: 'enemy', range: 1, damage: 3, hit: 15, status: { id: 'betaeubt', turns: 1 }, cooldown: 3,
  },
  {
    id: 'duo-am-ende-siegt-die-liebe', name: 'Am Ende siegt die Liebe',
    description: 'Dante macht Raven ein peinliches Kompliment, Raven schlägt doppelt zu, alle anderen sterben vor Fremdscham.',
    kind: 'nahkampf', ap: 2, target: 'area', range: 1, radius: 2, damage: 5, attribute: 'koerper', cooldown: 4,
  },
  {
    id: 'duo-meister-und-fan', name: 'Meister und Fan',
    description: 'Nyra und Dante hacken im Duett. Jede Drohne in Reichweite gibt auf (Gehackt).',
    kind: 'hack', ap: 2, target: 'area', range: 6, radius: 3, status: { id: 'gehackt', turns: 1, chance: 0.85 }, cooldown: 4,
  },
  {
    id: 'duo-der-plan', name: 'Der Plan',
    description: 'Hunter: „Wir machen das so.“ Alle wissen plötzlich, wo sie hinmüssen (Geschützt).',
    kind: 'support', ap: 2, target: 'area', range: 0, radius: 12, status: { id: 'geschuetzt', turns: 1 }, cooldown: 4,
  },
  {
    id: 'duo-funkstille', name: 'Funkstille',
    description: 'Vega und Nyra kappen alle Signale. Die Party ist eine Runde kaum zu sehen (Geschützt, 2 Runden).',
    kind: 'support', ap: 2, target: 'area', range: 0, radius: 12, status: { id: 'geschuetzt', turns: 2 }, cooldown: 5,
  },
  {
    id: 'duo-abrissbirne', name: 'Abrissbirne',
    description: 'Aria wirft, Jimmy fliegt. Ein Kegel aus Chaos, Deckung inklusive.',
    kind: 'nahkampf', ap: 2, target: 'area', range: 3, radius: 1, damage: 6, attribute: 'koerper', cooldown: 4,
  },
  {
    id: 'duo-lagerfeuerlied', name: 'Lagerfeuerlied',
    description: 'Marla summt, Lio spielt. Die Party +10 LP.',
    kind: 'support', ap: 2, target: 'area', range: 0, radius: 12, heal: 10, cooldown: 4,
  },

  // -------------------------------------------------------------------------
  // Spielfigur: Attribut-Aktionen und Fernzugriffe (§8.3)
  {
    id: 'kampf-analysieren', name: 'Analysieren',
    description: 'Technik: Schwächen des Ziels finden und der Party zeigen (Markiert).',
    kind: 'hack', ap: 1, target: 'enemy', range: 8, status: { id: 'markiert', turns: 1 }, cooldown: 2,
  },
  {
    id: 'kampf-schubsen', name: 'Schubsen',
    description: 'Körper: ein Stoß vor die Brust, das Ziel taumelt (Betäubt).',
    kind: 'nahkampf', ap: 1, target: 'enemy', range: 1, damage: 0, status: { id: 'betaeubt', turns: 1, chance: 0.4 }, cooldown: 2,
  },
  {
    id: 'kampf-hechtsprung', name: 'Hechtsprung',
    description: 'Reflexe: ab in die nächste Deckung, Kopf runter (Geschützt, 2 Runden).',
    kind: 'support', ap: 1, target: 'self', range: 0, status: { id: 'geschuetzt', turns: 2 }, cooldown: 3,
  },
  {
    id: 'kampf-schmutziger-trick', name: 'Schmutziger Trick',
    description: 'Straße: Sand in die Augen, Fuß auf den Schnürsenkel. Das Ziel stolpert eine Runde (Betäubt).',
    kind: 'trick', ap: 1, target: 'enemy', range: 1, status: { id: 'betaeubt', turns: 1, chance: 0.6 }, cooldown: 2,
  },
  {
    id: 'hack-stoerimpuls', name: 'Störimpuls',
    description: 'Fernzugriff: ein kurzer Stromschlag durchs Netz.',
    kind: 'hack', ap: 1, target: 'enemy', range: 6, damage: 2, attribute: 'technik', cooldown: 1,
  },
  {
    id: 'hack-systemlaehmung', name: 'Systemlähmung',
    description: 'Fernzugriff: Das Ziel friert eine Runde ein (Gehackt).',
    kind: 'hack', ap: 1, target: 'enemy', range: 6, status: { id: 'gehackt', turns: 1, chance: 0.75 }, cooldown: 2,
  },
  {
    id: 'hack-waffenstau', name: 'Waffenstau',
    description: 'Fernzugriff: Die Waffe des Ziels meldet einen Papierstau. Wer ohne Waffe dasteht, ist leicht zu treffen (Markiert).',
    kind: 'hack', ap: 1, target: 'enemy', range: 6, status: { id: 'markiert', turns: 1 }, cooldown: 2,
  },
  {
    id: 'hack-lichter-aus', name: 'Lichter aus',
    description: 'Fernzugriff: 3 × 3 Felder Dunkelheit. Wer drin steht, tappt eine Runde herum (Betäubt).',
    kind: 'hack', ap: 1, target: 'area', range: 6, radius: 1, status: { id: 'betaeubt', turns: 1, chance: 0.4 }, cooldown: 3,
  },
  {
    id: 'hack-kurzschluss', name: 'Kurzschluss',
    description: 'Fernzugriff: Die Cyberware des Ziels raucht. Zwei Runden lang geht nichts (Gehackt).',
    kind: 'hack', ap: 2, target: 'enemy', range: 5, damage: 2, attribute: 'technik', status: { id: 'gehackt', turns: 2, chance: 0.6 }, cooldown: 3,
  },
  {
    id: 'hack-chip-ruhe', name: 'Chip-Ruhe',
    description: 'Fernzugriff (ab Akt 2): Ein Gechippter ist zwei Runden lang frei von Nexus (Gehackt).',
    kind: 'hack', ap: 1, target: 'enemy', range: 6, status: { id: 'gehackt', turns: 2, chance: 0.8 }, cooldown: 3,
  },
];

export const COMBAT_ABILITIES: Record<string, AbilityDef> = Object.fromEntries(list.map((a) => [a.id, a]));

export const part: ContentPart = { abilities: COMBAT_ABILITIES };
