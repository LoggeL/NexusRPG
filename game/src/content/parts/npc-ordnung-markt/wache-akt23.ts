// Wachtmeisterin Kessel in Akt 2, Akt 3 und im Nachspiel (world.md §4.4, §4.6, §5.4 [Wache ♥8], act23.json).
// Kein eigener Inhaltsteil: wache.ts holt Menü-Ergänzung, Phasen-Gespräche, he-wache-8/10 und Tagesablauf von hier.
// he-wache-8 setzt kessel_einlass_abkuerzung (main-3-einlass prüft [Wache ♥8] über die Herzen).
import type { ContentPart } from '../../part';
import type { AbilityDef, Condition, DialogueDef, ScheduleEntry, TalkDef } from '../../../modules/contracts';
import {
  type Menue, AKT2_NUR, AKT3_NACHT, ARIA_GECHIPPT, COUNTDOWN_DONE, ENDE_3B, ENDE_MEER, ENDE_NEXUS, EPILOG_FREI, MASTER,
  NYRA_WEG, PARTY_VORB, dialog, erz, flag, herz, knoten, phasen, pruefung, sprecher,
} from './_helfer';

const K = sprecher('wache');
const C = sprecher('collin-charleston');

const GEKUENDIGT: Condition = { any: [{ flag: 'kessel_feierabend' }, { quest: 'side-feierabend-fuer-kessel', state: 'done' }] };

// ---------------------------------------------------------------------------------------------- Menü (ab Akt 2)

export const MENUE_23: Menue = {
  choices: [
    {
      text: 'Was machen eigentlich gechippte Ordnungshüter?', next: 'k23-kollegen',
      when: { all: [{ act: 2 }, { notFlag: 'wache_23_kollegen' }] }, effects: [flag('wache_23_kollegen'), herz('wache', 10)],
    },
  ],
  nodes: [
    knoten('k23-kollegen', [
      K('Strafzettel schreiben. An sich selbst. Brenner hat sich gestern wegen Falschparkens angezeigt. Er hat kein Auto. Er hat sich selbst geparkt.', 'neutral'),
      K('Die Dienststelle sagt, das ist effizient. Ich sage, das ist gruselig. Ich habe es auf die Strichliste geschrieben. Unter „Gruselig“. Die Spalte ist neu.', 'ueberrascht'),
    ], { choices: [{ text: 'Noch was, Wachtmeisterin.', next: 'menue' }, { text: 'Schönen Dienst noch.' }] }),
  ],
};

// ---------------------------------------------------------------------------------------------- Herz-Ereignis 8

/** ♥8 (Bahnhofskiosk, abends, act2): Dienstplan der Releaseparty – [Wache ♥8] Abkürzung beim Einlass. */
const he8 = dialog('he-wache-8', [
  knoten('start', [
    erz('Bahnhofskiosk, Feierabend. Kessel sitzt auf ihrem Stammhocker, die Mütze neben dem Kaffeebecher, und starrt auf ein Blatt Papier mit Quantum-Wasserzeichen. Sie sieht aus, als hätte das Papier sie beleidigt.'),
    K('{name}. Setzen. Das hier ist ein Dienstplan. Für eine Feier in einem gewissen Turm. Quantum hat den Ordnungsdienst „angefordert“. Für den Einlass.', 'neutral'),
    K('Ich soll am roten Teppich stehen. Gäste kontrollieren. Und jedem, der rein will, freundlich das hier anbieten.'),
    erz('Sie schiebt dir eine kleine Schachtel zu. Darin liegt, auf Samt gebettet, ein Chrome-10-Chip mit Schleife. Daneben ein Kärtchen: „Ihr persönliches Willkommensgeschenk. Master freut sich.“'),
    K('Zweihundert Stück. Pro Stunde. Ich habe das ausgerechnet. Ich hätte es lieber nicht ausgerechnet.', 'ueberrascht'),
  ], {
    choices: [
      {
        text: '„Kessel. Sie sind keine Türsteherin für Gedankenkontrolle. Sie sind besser als das.“', next: 'ueberzeugt',
        check: pruefung('he-wache-8-gewissen', 'ausstrahlung', 6, ['ueberzeugen', 'behoerde']), effects: [herz('wache', 50)],
      },
      { text: '„Ich war auch mal im Dienst. Manche Befehle führt man nicht aus. Man verlegt sie.“', tag: '[Ex-Wache]', when: { origin: 'origin-ex-wache' }, next: 'ex-wache', effects: [herz('wache', 50)] },
      { text: '„Ich sag Ihnen nicht, was Sie tun sollen. Das entscheiden Sie.“', next: 'selbst', effects: [herz('wache', 40)] },
      { text: '„Kündigen Sie. Heute noch. Ich helf beim Formular.“', when: { not: GEKUENDIGT }, next: 'kuendigen', effects: [herz('wache', 30)] },
    ],
  }),
  knoten('ueberzeugt', [
    K('Besser als das.', 'ueberrascht'),
    erz('Sie nimmt die Schachtel, klappt sie zu und wirft sie mit einem sehr sauberen Bogen in den Mülleimer neben dem Kiosk. Dann holt sie sie wieder raus, weil Mülltrennung, und wirft sie in den richtigen Eimer.'),
    K('Elf Jahre Dienst. Und Sie sind der erste Mensch, der mir das sagt. Meine Mutter sagt immer nur „Iss was“.'),
  ], { next: 'plan' }),
  knoten('ex-wache', [
    K('Verlegt. Ha. Wie die Akte Dexter, Jahrgang 79. Die liegt seit Jahren unter dem Kaffeeautomaten. Sie stabilisiert ihn.', 'neutral'),
    K('Sie waren immer einer von den Guten in der Nachtschicht. Darum fragen Sie sich jetzt, warum Sie gegangen sind. Ich weiß es: wegen genau solcher Zettel.'),
  ], { next: 'plan' }),
  knoten('selbst', [
    erz('Kessel sieht dich an. Lange. Dann die Schachtel. Dann den Kiosk, wo ein Pendler gerade „Das ist eine ausgezeichnete Entscheidung, Master“ zu einem Kaugummiautomaten sagt.'),
    K('Ich entscheide.', 'neutral'),
    K('Ich habe mich entschieden. Ich habe es nur noch nicht laut gesagt. Weil laut dienstlich ist.'),
  ], { next: 'plan' }),
  knoten('kuendigen', [
    K('Heute noch. Mit Formular. Sie klingen wie meine Yogalehrerin. Die sagt auch immer „heute noch“. Und dann atmen wir zwanzig Minuten.', 'ueberrascht'),
    K('Nicht heute. Erst muss ich das hier richtig machen. Falsch richtig.'),
  ], { next: 'plan' }),
  knoten('plan', [
    erz('Sie dreht den Dienstplan um. Auf der Rückseite, in ordentlicher Dienstschrift, eine Skizze: Haupteingang, Seitentür, Gästeaufzug. Ein Kreuz. Eine Uhrzeit.'),
    K('Seiteneingang. Zwischen 22:10 und 22:25 kontrolliere ich sehr gründlich meine Schnürsenkel. Doppelknoten. Dauert.', 'neutral'),
    K('Das habe ich nicht gesagt. Ich habe nur laut über Schnürsenkel nachgedacht. Wenn Sie an meinem Pult stehen, sagen Sie meinen Namen. Dann weiß ich Bescheid.'),
  ], {
    effects: [flag('kessel_einlass_abkuerzung')],
    choices: [
      { text: '„Ihre Schnürsenkel sind mir heilig.“', next: 'heilig' },
      { text: '„Und Collin? Der moderiert die Party.“', next: 'collin' },
      { text: '„Sie riskieren Ihren Job, Kessel.“', next: 'job' },
    ],
  }),
  knoten('heilig', [K('Gut. Doppelknoten. Mit Schleife. Und wenn einer fragt: Ich habe nichts gesehen. Ich sehe nie was. Ich bin Ordnungsdienst.', 'ueberrascht')], { next: 'ende' }),
  knoten('collin', [
    K('Collin.', 'ueberrascht'),
    K('Ich werde zwei Meter von Collin Charleston entfernt stehen. Vier Stunden lang. In Abendgarderobe. Ich habe mir eine Fliege gekauft. Die Fliege ist dienstlich.'),
    K('Wenn er „Unglaublich!“ sagt, falle ich um. Ich habe das vor dem Spiegel geübt. Ich falle schon beim Üben um.'),
  ], { next: 'ende', effects: [herz('wache', 10)] }),
  knoten('job', [K('Welchen Job? Ich bin halb Yogalehrerin. Halb ist genug Risiko. Und die andere Hälfte hat heute einmal Rückgrat. Das ist gut für die Haltung.', 'neutral')], { next: 'ende' }),
  knoten('ende', [
    K('Ich hoffe, wir sehen uns nicht wieder. Auf der Party, meine ich. Da will ich Sie nicht sehen. Offiziell.', 'neutral'),
    erz('Sie macht einen Strich auf ihrer Liste. In einer Spalte, die du noch nie gesehen hast. Oben drüber steht: „Richtig gemacht“.'),
  ], { effects: [{ xp: 120 }, herz('wache', 20)] }),
]);

// ---------------------------------------------------------------------------------------------- Herz-Ereignis 10

const ort = (id: string, text: string, zeile: string): DialogueDef['nodes'][number] =>
  knoten(id, [erz(text), K(zeile, 'neutral')], { next: 'feuerwerk' });

/** ♥10 (Neonnacht bzw. Gründertag, nachts am Bahnhof, act2): Feuerwerk auf dem Stellwerk-Dach, Stadtführung, Strichliste. */
const he10 = dialog('he-wache-10', [
  knoten('start', [
    erz('Nacht über dem Bahnhof. Kessel hat zum ersten Mal in elf Jahren frei. Sie trägt keine Mütze, dafür eine Strickjacke mit Yogakatze, und zieht dich eine Feuerleiter hinauf bis aufs Dach des Stellwerks.'),
    K('Stadtführung. Inoffiziell. Ich zeige Ihnen meine Stadt. Die, die ich elf Jahre bewacht habe. Wohin zuerst?', 'neutral'),
  ], {
    choices: [
      { text: '„Zum Eisenhof. Ihr altes Revier.“', next: 'eisenhof' },
      { text: '„Zum Stufenplatz. Da, wo Collin immer winkt.“', next: 'stufenplatz' },
      { text: '„Zum Turm. Zeigen Sie mir, wo Sie nie wieder hinwollen.“', next: 'turm' },
    ],
  }),
  ort('eisenhof', 'Sie zeigt nach Osten. Der Eisenhof sieht von oben aus wie ein Kuchenblech mit Stacheldraht. Im Gerichtsgarten leuchtet eine einzelne Laterne über den Tomaten.',
    'Da. Das Entlassungstor. Ich habe dort viertausendzweihundertzwölf Menschen gesagt, dass ich sie nicht wiedersehen will. Neunhundert habe ich wiedergesehen. Mit Ihnen sind es neunhunderteins. Sie sind der Einzige, über den ich mich gefreut habe.'),
  ort('stufenplatz', 'Sie zeigt nach Norden. Auf dem Stufenplatz flimmert die große Leinwand, darauf Collins Gesicht in Übergröße, mitten im Satz eingefroren.',
    'Da winkt er. Jeden Montag um zwölf. In meine Richtung. Ich habe einmal zurückgewinkt. Ein Kollege hat es gesehen. Ich habe ihn versetzen lassen. Nach Kanal Nord.'),
  ort('turm', 'Sie zeigt nach oben. Der Quantum-Turm sticht in den Smog, die Spitze rot blinkend wie ein Zeigefinger.',
    'Da. Da oben habe ich gestanden und Chips verteilt. Fast. Ich hätte es fast getan. Ich träume manchmal davon. Dann wache ich auf und mache einen Strich. In der Spalte „Nicht getan“.'),
  knoten('feuerwerk', [
    erz('Dann knallt es. Über der Unterstadt platzen Farben, Rot, Gold, Neongrün, und spiegeln sich in jeder Pfütze bis zur Flutmauer. Unten am Bahnsteig johlen Pendler, irgendwo spielt Lio, die U-Bahn hupt im Takt.'),
    K('Kein Rauch. Diesmal kein Rauch. Kein Alarm. Nur Licht.', 'ueberrascht'),
    erz('Sie sieht eine Weile zu. Dann zieht sie die Strichliste aus der Strickjacke, blättert bis zur längsten Spalte, reißt die Seite heraus und drückt sie dir in die Hand.'),
    K('Die gehört Ihnen. Die Spalte mit Ihrem Namen. Die längste, die ich je geführt habe. Ganz oben: „Kaffee, ungefragt.“ Ganz unten: „Heute.“'),
  ], {
    effects: [{ give: 'wachen-strichliste' }, flag('kessel_feuerwerk'), { xp: 200 }, herz('wache', 50)],
    choices: [
      { text: '„Ich hoffe, wir sehen uns wieder, Kessel.“', next: 'wieder' },
      {
        text: 'Ihr eine Rakete aus der Jackentasche geben. „Jetzt machen Sie mal Krach. Dienstlich.“', next: 'krach',
        when: { item: 'nougatbombe' }, effects: [{ take: 'nougatbombe' }, herz('wache', 30)],
      },
      { text: 'Einfach neben ihr sitzen bleiben, bis das letzte Licht verglüht.', next: 'still' },
    ],
  }),
  knoten('wieder', [
    K('Das ist der falsche Satz.', 'ueberrascht'),
    K('… Es ist der richtige. Ich notiere ihn. Ganz oben auf der neuen Seite. Die Seite heißt „Freunde“. Sie ist sehr kurz. Sie ist sehr gut.'),
  ], { next: 'schluss' }),
  knoten('krach', [
    erz('Es ist keine Rakete. Es ist eine Nougatbombe. Kessel sieht sie an, sieht dich an, und wirft sie mit einem perfekten Dienstwurf vom Dach in Richtung Kiosk. Unten jubelt jemand, der sie fängt.'),
    K('Unerlaubtes Werfen von Süßwaren von einem Gebäude. Strafbar. Ich zeige mich an. Morgen. Heute habe ich frei.', 'ueberrascht'),
  ], { next: 'schluss' }),
  knoten('still', [
    erz('Ihr sitzt da, bis das letzte Funkeln über der Flutmauer verglüht. Kessel atmet ein, vier Takte, und aus, sechs Takte. Irgendwann atmest du mit.'),
    K('Das ist Yoga. Sie haben gerade Yoga gemacht. Auf einem Dach. Mit einer Wachtmeisterin. Das glaubt Ihnen keiner.', 'neutral'),
  ], { next: 'schluss' }),
  knoten('schluss', [
    K('Und {name}: Wenn Sie mich brauchen, draußen, im Ernst … ich komme. Mit Schockstab und Formular. In der Reihenfolge, die nötig ist.', 'neutral'),
  ]),
]);

// ---------------------------------------------------------------------------------------------- Fähigkeit (Begleiterin nach der Kündigung)

export const SONNENGRUSS: AbilityDef = {
  id: 'wache-sonnengruss', name: 'Sonnengruß',
  description: 'Einmal pro Kampf: Kessel atmet laut vor, die Party atmet mit. Alle in der Nähe +8 LP und Geschützt.',
  kind: 'support', ap: 1, target: 'area', range: 0, radius: 3, heal: 8, status: { id: 'geschuetzt', turns: 1 }, uses: 1,
};

// ---------------------------------------------------------------------------------------------- Phasen

export function akt23(M: Menue): { dialogues: DialogueDef[]; talk: TalkDef[]; schedule: ScheduleEntry[]; teil: ContentPart } {
  const p = phasen('wache', 'wache-23', M, [
    {
      id: 'master', when: MASTER, ohneMenue: true,
      gruss: [
        K('Ich hoffe, wir sehen uns nicht wieder.', 'wut'),
        K('Diesmal meine ich es wie früher. Wie ganz früher. Sie haben oben das Licht ausgemacht, und unten müssen wir es ausbaden. Gehen Sie, Master. Bevor ich mich an die Vorschrift erinnere.'),
      ],
    },
    {
      id: 'ende-3b', when: ENDE_3B, einmal: true,
      gruss: [
        K('Da sind Sie ja. Zurück aus dem Turm. Ich habe eine neue Spalte angelegt: „Doch noch richtig“. Sie steht ganz allein. Sie sieht gut aus.', 'neutral'),
        K('Ich hoffe, wir sehen uns wieder. Sehen Sie? Ich kann das jetzt. Ohne zu zucken.'),
      ],
    },
    {
      id: 'ende-nexus', when: ENDE_NEXUS, einmal: true,
      gruss: [
        K('Die KI hat dem Ordnungsdienst eine Mail geschrieben. Eine Entschuldigung. Mit Anhang: Strichliste aller Fehler. Sie ist länger als meine.', 'ueberrascht'),
        K('Ich weiß nicht, ob ich ihr traue. Aber sie hat ordentlich formatiert. Das ist mehr, als ich von den meisten Menschen sagen kann.'),
      ],
    },
    {
      id: 'ende-meer', when: ENDE_MEER, einmal: true,
      gruss: [
        K('Blade Nocturne. Zelle vierzehn. Ich bewache ihn. Persönlich. Er hat heute nach einem Kissen gefragt. In Teddyform. Ich habe es auf die Liste geschrieben. Unter „Nein“.', 'neutral'),
        C('Unglaublich! Wachtmeisterin Kessel, die Frau, die Blade einbuchtete! Ein Wort für unsere Zuschauer?'),
        K('…', 'ueberrascht'),
        erz('Kessel fällt nicht um. Fast nicht. Sie hält sich am Gitter fest und sagt: „Ich hoffe, wir sehen uns wieder.“ In die Kamera. Zu Collin. Er strahlt.'),
      ],
      plausch: [K('Er hat zurückgewinkt. Ich habe es auf Video. Ich habe es elfmal angesehen. Das ist dienstlich. Beweissicherung.', 'verlegen')],
    },
    {
      id: 'epilog-yoga', when: { all: [EPILOG_FREI, GEKUENDIGT] }, taeglich: true,
      gruss: [K('Einatmen. Ausatmen. Und die Schultern runter, {name}, Sie tragen da oben eine ganze Stadt. Die Stadt braucht Sie nicht mehr auf den Schultern. Sie läuft jetzt allein.', 'neutral')],
      plausch: [K('Mein Kurs ist voll. Rostzähne, zwei Ex-Gechippte, Babette und Hunter. Hunter sagt, er ist nur wegen der Matten da. Er macht den herabschauenden Hund besser als alle. Sagen Sie ihm das nicht.')],
    },
    {
      id: 'epilog', when: EPILOG_FREI, taeglich: true,
      gruss: [K('Ruhiger Dienst heute. Keine Gechippten, keine Drohnen. Nur ein Rostzahn, der einen Gartenzwerg zurückgebracht hat. Freiwillig. Ich habe geweint. Innerlich.', 'neutral')],
      plausch: [K('Ich überlege immer noch zu kündigen. Aber jetzt nicht mehr, weil ich weg will. Sondern weil ich darf. Das ist ein Unterschied. Das ist der ganze Unterschied.')],
    },
    {
      id: 'akt3', when: AKT3_NACHT,
      gruss: [
        K('Name. Einladung. … Ach, Sie. Ich kenne Sie nicht. Ich habe Sie nie gesehen. Gehen Sie weiter, Sie blockieren den Teppich.', 'neutral'),
        erz('Leiser, ohne die Lippen zu bewegen: „Seitentür, Gästeaufzug, zweiter Knopf. Und kommen Sie heil wieder raus. Ich habe keine Lust auf Papierkram.“'),
      ],
      plausch: [K('Collin ist da drin. Zwei Meter. Ich zähle meine Atemzüge. Ich bin bei dreihundert. Das ist zu viel für eine Party.', 'ueberrascht')],
    },
    {
      id: 'party', when: PARTY_VORB, taeglich: true,
      gruss: [K('Ich habe die Fliege dreimal gebügelt. Sie ist jetzt flach wie ein Formular. Ist das ein Problem? Das ist ein Problem.', 'besorgt')],
      plausch: [K('Ich träume jede Nacht vom roten Teppich. Ich verteile Chips, und alle sagen „Danke, Master“, und dann stehen Sie da und schauen mich an. Und ich wache auf und mache einen Strich. Wir schaffen das, oder?', 'besorgt')],
    },
    {
      id: 'gerettet', when: { all: [COUNTDOWN_DONE, { notFlag: 'epilog' }] }, einmal: true,
      gruss: [
        K('Gestern Nacht ist in den Lötgassen eine Mülltonne explodiert. Mit Konfetti. Meldung ging an mich. Ich habe sie verlegt. Unter den Kaffeeautomaten.', 'neutral'),
        K('Ihre Kollegin ist wach, höre ich. Die mit dem Arm. Und Dante arbeitet wieder. Gut. Ich mag es, wenn die Akten kürzer werden.'),
      ],
    },
    {
      id: 'nyra', when: NYRA_WEG, einmal: true,
      gruss: [K('Vermisstenmeldung. Unterstadt, weiblich, Hackerin, sehr leise. Ist nie eingegangen. Ich habe trotzdem eine Akte angelegt. Unter „Holen wir zurück“.', 'besorgt')],
    },
    {
      id: 'chip', when: ARIA_GECHIPPT, taeglich: true,
      gruss: [K('Drei Kollegen gechippt. Einer sagt „Master“ zum Dienststellenleiter. Der Dienststellenleiter findet das gut. Ich finde das nicht gut. Ich finde das auf meiner Liste unter „Gruselig“.', 'wut')],
      plausch: [K('Man hört, dass bei Ihnen in der Crew jemand fehlt. Wenn ich was hören soll, sagen Sie es. Wenn ich nichts hören soll, sagen Sie es lauter. Dann habe ich Ohrenschützer auf.', 'besorgt')],
    },
    {
      id: 'akt2-a', when: { all: [AKT2_NUR, { weekday: ['mo', 'mi', 'fr', 'so'] }] }, taeglich: true,
      gruss: [K('Quantum-Drohnen auf meiner Strecke. Sie kontrollieren die Kontrolleure. Eine hat meine Strichliste gescannt und „ineffizient“ gesagt. Ich habe ihr einen Strich gegeben.', 'wut')],
      plausch: [K('Am Kiosk verteilen sie Chrome-10-Gutscheine zum Kaffee. Ich trinke meinen jetzt schwarz. Ohne Gutschein. Mit Haltung.')],
    },
    {
      id: 'akt2-b', when: AKT2_NUR, taeglich: true,
      gruss: [K('Razzia, Razzia, Razzia. Die Leute in der Neon-Gasse rennen schon, wenn ich nur huste. Ich huste jetzt in Ärmel. Aus Rücksicht.', 'neutral')],
      plausch: [K('Mein Yoga-Lehrer hat einen Chip. Er sagt jetzt nur noch „Ausgezeichnet, Master“ statt „Atmen“. Ich bin aus dem Kurs raus. Ich atme jetzt allein. Das ist schwerer.')],
    },
  ]);

  const schedule: ScheduleEntry[] = [
    // act23.json (vorangestellt): Partynacht am Einlass, danach Gästeeingang im Himmelsgarten.
    { when: { all: [AKT3_NACHT, { not: { quest: 'main-3-einlass', state: 'done' } }] }, place: { map: 'quantum-campus', at: 'haupteingang' } },
    { when: AKT3_NACHT, place: { map: 'himmelsgarten', at: 'gaesteeingang' } },
    // Nachspiel: Yoga am Strand (nach der Kündigung) bzw. Wache vor Blades Zelle.
    { slot: 'morgen', days: ['sa', 'so'], when: { all: [EPILOG_FREI, GEKUENDIGT] }, place: { map: 'das-meer', at: 'duenengras' } },
    { slot: 'tag', when: { all: [EPILOG_FREI, { not: GEKUENDIGT }, { any: [{ flag: 'blade_gefasst' }, { flag: 'blade_angekettet' }] }] }, place: { map: 'zellentrakt', at: 'besucherraum-tuer' } },
  ];

  return { dialogues: [...p.dialogues, he8, he10], talk: p.talk, schedule, teil: { abilities: { [SONNENGRUSS.id]: SONNENGRUSS } } };
}

