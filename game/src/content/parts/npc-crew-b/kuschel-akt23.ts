// Captain Kuschel in Akt 2, Akt 3 und im Nachspiel (world.md §4.2, §5.3–5.5, §6.3 #36, §6.4 #48; Orte nach act23.json).
// Wo er ist: mit nyra_hat_kuschel bei Nyra im Turm (quantum-labor:kuschel-ablage) bis main-3-labor; sonst nach dem
// Bruch im Quantum-Fundbüro, dann bei Mila (kuschel_bei_mila, side-captain-kuschel vom Quest-Agenten), danach wieder
// in der Werkstatt (mit kuschel_sorgerecht sonntags bei Mila). Master-Modus: im Turmbüro (Start side-zweite-chance).
// he-captain-kuschel-8 (Babette will ihn waschen) und -10 (Talisman „Große Ohren“) als volle Szenen.
// Kein eigener Inhaltsteil (captain-kuschel.ts mischt).
import type { Condition, DialogueChoice, DialogueNode, ScheduleEntry } from '../../../modules/contracts';
import {
  type Akt23, type Menue, AKT2, ENDE_3B, ENDE_MEER, ENDE_NEXUS, IRGENDEINE_NACHT, MASTER, NACHSPIEL, PARTYNACHT, PARTY_PLAN,
  dialog, erz, flag, herz, ich, knoten, pruefung, rede, sprecher, tagesgespraech,
} from './_helfer';

const K = sprecher('captain-kuschel');
const D = sprecher('dante');
const N = sprecher('nyra');
const B = sprecher('babette-bao');

const BEI_NYRA: Condition = { flag: 'nyra_hat_kuschel' };
const QUEST = 'side-captain-kuschel';
const QUEST_DONE: Condition = { quest: QUEST, state: 'done' };
const NACH_BRUCH: Condition = { flag: 'nyra_zurueckgelassen' };

/** Mit Nyra im Turm (seit main-2-bruch bis main-3-labor). */
export const KUSCHEL_IM_TURM: Condition = { all: [NACH_BRUCH, BEI_NYRA, { not: { quest: 'main-3-labor', state: 'done' } }] };
/** Beim Bruch im Labor verloren, liegt im Quantum-Fundbüro. */
export const KUSCHEL_FUNDBUERO: Condition = { all: [NACH_BRUCH, { not: BEI_NYRA }, { notFlag: 'kuschel_bei_mila' }, { not: QUEST_DONE }] };
/** Wachmann Pfeffer hat ihn für seine Tochter Mila mitgenommen (side-captain-kuschel). */
export const KUSCHEL_BEI_MILA: Condition = { all: [{ flag: 'kuschel_bei_mila' }, { not: QUEST_DONE }] };
/** Er ist erreichbar (für Akt-1-Herz-Ereignisse, Telefon und Akt-2-Gespräche). */
export const KUSCHEL_FREI: Condition = {
  all: [{ not: KUSCHEL_IM_TURM }, { not: KUSCHEL_FUNDBUERO }, { not: KUSCHEL_BEI_MILA }, { not: MASTER }, { not: PARTYNACHT }],
};

// ---------------------------------------------------------------------------------------------- Menüwahlen ab Akt 2

export function menue23(zurueck: DialogueChoice[]): Menue {
  const choices: DialogueChoice[] = [
    { text: 'Wo warst du die ganze Zeit, Captain?', when: { all: [NACH_BRUCH, KUSCHEL_FREI] }, once: true, id: 'k23-wo', next: 'wo-warst-du', effects: [herz('captain-kuschel', 20)] },
    { text: 'Hast du Angst vor der Party?', when: { all: [AKT2, PARTY_PLAN, KUSCHEL_FREI] }, once: true, id: 'k23-party', next: 'party-angst' },
    { text: 'Und? Wie war das Meer, Captain?', when: { all: [NACHSPIEL, { flag: 'meer_offen' }] }, once: true, id: 'k23-meer', next: 'meer', effects: [herz('captain-kuschel', 20)] },
  ];
  const nodes: DialogueNode[] = [
    knoten('wo-warst-du', [
      K('(Ein Ohr hoch. Das andere zeigt, sehr langsam, Richtung Oberstadt.)'),
    ], {
      choices: [
        { text: '(Weiter.)', when: BEI_NYRA, next: 'wo-turm' },
        { text: '(Weiter.)', when: { not: BEI_NYRA }, next: 'wo-mila' },
      ],
    }),
    knoten('wo-turm', [
      erz('Unter seiner Pfote steckt ein Zettel, eng beschrieben, mit sehr kleiner Schrift, als wäre das Papier knapp gewesen: „Turm. Weißes Licht. Schlechter Kaffee. Sie hat jeden Abend mit mir geredet, wenn keiner geguckt hat. Ich hab zugehört. Das ist mein Job. – C. K.“'),
      K('(Beide Ohren hoch. Dienst erfüllt.)', 'freude'),
    ], { choices: zurueck }),
    knoten('wo-mila', [
      erz('Ein Zettel, mit Wachsmalstift überkritzelt. Zwischen Blumen und einem sehr schiefen Pferd steht: „Fundbüro. Dann bei Mila. Acht Jahre. Hat Albträume, wie Jakko. Ich hab aufgepasst. Ich heiße da Herr Flausch. Sag es keinem. – C. K.“'),
      K('(Ein Ohr knickt verlegen ab.)'),
    ], { choices: zurueck }),
    knoten('party-angst', [
      K('(Beide Ohren hoch. Dann, ganz leicht, zittert das linke.)'),
      erz('Ein Zettel: „Ich hab keine Angst. Ich hab eine Fliege. Samt. Dante hat sie mir umgebunden. Er hat gesagt, wer gut aussieht, hat weniger Angst. Er hatte selbst sehr viel Angst. Ich hab nichts gesagt. – C. K.“'),
    ], { choices: zurueck }),
    knoten('meer', [
      erz('Aus Captain Kuschels Fell rieselt Sand. Sehr viel Sand. Mehr Sand, als in einen Plüschhasen passen dürfte.'),
      erz('Ein Zettel, leicht gewellt, als wäre er nass geworden: „Salz. Wie gedacht. Ich war schon mal da. Damals, mit Dante, bevor er ins Gefängnis kam. Er weiß es nicht mehr. Ich schon. – C. K.“'),
      K('(Beide Ohren im Wind. Obwohl hier gar kein Wind ist.)', 'freude'),
    ], { choices: zurueck }),
  ];
  return { choices, nodes };
}

// ---------------------------------------------------------------------------------------------- Herz-Ereignisse 8 und 10

export const he8 = dialog('he-captain-kuschel-8', [
  knoten('start', [
    erz('Schrottmarkt, Mittag. Dante hat Captain Kuschel auf der Bank vor der Garküche abgesetzt und ist „nur kurz“ Nudeln holen gegangen. Kurz ist bei Dante eine dehnbare Einheit.'),
    erz('Babette Bao steht vor der Bank. In der einen Hand ein Eimer Lauge, in der anderen Captain Kuschel, am Ohr hochgehalten wie ein Kohlkopf.'),
  ], {
    choices: [
      { text: '(Weiter.)', when: { all: [BEI_NYRA, NACH_BRUCH] }, next: 'geruch-turm' },
      { text: '(Weiter.)', when: { all: [{ not: { all: [BEI_NYRA, NACH_BRUCH] } }, { flag: 'kuschel_bei_mila' }] }, next: 'geruch-mila' },
      { text: '(Weiter.)', when: { all: [{ not: { all: [BEI_NYRA, NACH_BRUCH] } }, { notFlag: 'kuschel_bei_mila' }] }, next: 'geruch-werkstatt' },
    ],
  }),
  knoten('geruch-turm', [B('Der Hase riecht nach Desinfektionsmittel, Laborkaffee und Angst. Wo war der? Im Krankenhaus? Der kommt jetzt in die Wäsche. Neunzig Grad. Mit Bleiche.', 'wut')], { next: 'panik' }),
  knoten('geruch-mila', [B('Der Hase riecht nach Kinderzimmer, Erdbeerkaugummi und Glitzer. Überall Glitzer. Der kommt jetzt in die Wäsche. Neunzig Grad. Mit Bleiche.', 'wut')], { next: 'panik' }),
  knoten('geruch-werkstatt', [B('Der Hase riecht nach Keksen, Hund und Werkstatt. Und ein bisschen nach Dante. Der kommt jetzt in die Wäsche. Neunzig Grad. Mit Bleiche.', 'wut')], { next: 'panik' }),
  knoten('panik', [
    K('(Beide Ohren in blanker Panik flach nach hinten.)', 'trauer'),
    D('BABETTE! NEIN! NICHT DIE LAUGE!', 'ueberrascht'),
    erz('Dante ist dreißig Meter entfernt, mit zwei Nudelschalen in den Händen und einem Gesicht, als sähe er einen Unfall in Zeitlupe. Er wird es nicht rechtzeitig schaffen. Du schon.'),
  ], {
    choices: [
      { text: '„Babette. Der Captain wird nicht gewaschen. Nie. Das ist Gesetz. Frag Freya, die hat es aufgeschrieben.“', check: pruefung('he-kuschel-8-babette', 'ausstrahlung', 6, ['ueberreden']), next: 'gesetz', effects: [herz('captain-kuschel', 60)] },
      { text: 'Den Captain schnappen und rennen.', check: pruefung('he-kuschel-8-rennen', 'reflexe', 6, ['flucht']), next: 'rennen', effects: [herz('captain-kuschel', 60)] },
      { text: '„Wenn der Hase in die Lauge geht, erzähl ich dem ganzen Markt, was in deiner Hausmacher-Brühe schwimmt.“', check: pruefung('he-kuschel-8-bruehe', 'strasse', 5, ['einschuechtern', 'geruecht']), next: 'bruehe', effects: [herz('captain-kuschel', 50), herz('babette-bao', -20)] },
      { text: '„Nur Trockenreinigung. Mit der Bürste. Ich mach das. Hier, vor deinen Augen.“', next: 'buerste', effects: [herz('captain-kuschel', 40)] },
    ],
  }),
  knoten('gesetz', [
    B('… Freya hat das aufgeschrieben?', 'ueberrascht'),
    ich('Mit Unterschrift. Und Stempel. Der Stempel ist eine Kartoffel.'),
    B('Mit Kartoffelstempel. Na dann. Gegen Kartoffelstempel komm ich nicht an. Das ist Familienrecht.'),
  ], { next: 'babette' }),
  knoten('rennen', [
    erz('Ein Griff, ein Ruck, und Captain Kuschel ist frei. Du schlägst einen Haken um den Nudeltopf, springst über eine Kiste Synth-Kohl und bist hinter dem Kabelstand, bevor Babette „Bleiche“ zu Ende gesagt hat.'),
    erz('Als du vorsichtig zurückkommst, steht sie mit verschränkten Armen da. Und lacht. Laut. Über den ganzen Markt.'),
  ], { next: 'babette' }),
  knoten('bruehe', [
    erz('Babette wird erst rot, dann blass, dann wieder rot. Sie setzt den Captain sehr behutsam auf der Bank ab und streicht ihm die Ohren glatt.'),
    B('Das war Erpressung. Das war gemein. Und es war gut. Du kriegst nie wieder eine Extraportion.', 'wut'),
    B('… Bis Donnerstag. Donnerstags vergess ich so was.'),
  ], { next: 'babette' }),
  knoten('buerste', [
    erz('Babette reicht dir eine Gemüsebürste. Du bürstest. Ganz vorsichtig. Krümel fallen heraus, Glitzer, ein Stück Laborkabel, ein Kronkorken, eine Murmel. Mehr Geschichte, als ein Hase tragen sollte.'),
    B('Hm. Sieht besser aus. Riecht immer noch nach Abenteuer. Aber besser.'),
  ], { next: 'babette' }),
  knoten('babette', [
    B('Weißt du, ich hatte als Kind ein Plüschschwein. Herr Schnitzel. Meine Mutter hat ihn gewaschen. Neunzig Grad. Herr Schnitzel kam als Filzball zurück.', 'trauer'),
    B('Ich wollte ihm das ersparen. Dem Hasen. Ich hab nur vergessen, dass man es ihm erspart, indem man’s lässt.'),
  ], {
    choices: [
      { text: '„Herr Schnitzel lebt in unseren Herzen weiter.“', next: 'ende', effects: [herz('babette-bao', 20)] },
      { text: '„Ein Filzball ist auch ein Freund. Ein runder.“', next: 'ende', effects: [herz('babette-bao', 10)] },
      { text: 'Babette den Captain kurz hinhalten. „Einmal streicheln. Ohne Lauge.“', next: 'streicheln', effects: [herz('babette-bao', 30), herz('captain-kuschel', 10)] },
    ],
  }),
  knoten('streicheln', [
    erz('Babette streichelt Captain Kuschel einmal über den Kopf, mit der Hand, die sonst Teig knetet. Er hält still. Ein Ohr legt sich gnädig nach hinten.'),
    B('Weich. Natürlich ist der weich. Verdammt.', 'freude'),
  ], { next: 'ende' }),
  knoten('ende', [
    erz('Dante kommt angehetzt, verschüttet die halben Nudeln und drückt den Captain an sich, als wäre er drei Jahre weg gewesen.'),
    D('Ich hab dich keine fünf Minuten allein gelassen! Fünf! Um Himmels Willen, Captain!', 'trauer'),
    erz('Später findest du einen Zettel in deiner Tasche: „Du hast mir das Leben gerettet. Und meine Ohren. Babette darf mich einmal streicheln. Einmal. – C. K.“'),
  ], { effects: [{ xp: 120 }, flag('kuschel_nicht_gewaschen')] }),
]);

export const he10 = dialog('he-captain-kuschel-10', [
  knoten('start', [
    erz('Crew-Quartier, spät. Auf deinem Kopfkissen sitzt Captain Kuschel. Um ihn herum, sorgfältig aufgefächert wie ein Kartenspiel: jeder Zettel, den er dir je dagelassen hat.'),
    erz('„Du schaffst das. Heute noch.“ „Gutes Kränzchen. Nächstes Mal ohne Kleckern.“ „Bin nicht entführt. Bin auf Urlaub.“ „Du schläfst zu wenig. Du isst zu viel Mist. Du bist trotzdem okay.“'),
    erz('In der Mitte liegt ein neuer. Und darauf ein winziger Anhänger aus Plüschstoff, geknotet aus dem Faden seiner alten Ohrnaht. In Form zweier sehr großer Ohren.'),
    erz('„Für dich. Damit du siehst, was sich versteckt. Und merkst, wenn jemand traurig ist. Das ist alles, was ich kann. Jetzt kannst du es auch. – C. K.“'),
  ], {
    choices: [
      { text: 'Den Anhänger umbinden.', next: 'umbinden' },
      { text: '„Behalt ihn, Captain. Du brauchst deine Ohren mehr als ich.“', next: 'zurueck' },
      { text: 'Den Knoten mit einem Rest Leuchtfaden nachnähen, damit er nachts glimmt.', check: pruefung('he-kuschel-10-leuchtfaden', 'technik', 4, ['reparieren', 'naehen']), next: 'leuchtfaden', effects: [flag('kuschel_talisman_leuchtet'), herz('captain-kuschel', 20)] },
      { text: 'Einen Zettel zurückschreiben: „Danke, Captain. – {name}“', next: 'zettel', effects: [herz('captain-kuschel', 30)] },
    ],
  }),
  knoten('zurueck', [
    K('(Beide Ohren flach. Sehr flach. Beleidigt flach.)'),
    erz('Du drehst dich kurz weg. Als du wieder hinsiehst, liegt da ein neuer Zettel, obwohl kein Stift in Sicht ist: „Ich hab zwei. Du hast keine. Nimm. – C. K.“'),
  ], { next: 'umbinden' }),
  knoten('leuchtfaden', [
    erz('Ein Stich, zwei Stiche, ein Knoten. Im Dunkeln glimmen die winzigen Ohren jetzt schwach grün, wie ein Nachtlicht für sehr kleine Albträume.'),
    K('(Ein Ohr hoch. Anerkennend.)', 'freude'),
  ], { next: 'umbinden' }),
  knoten('zettel', [
    erz('Du schreibst. Du legst den Zettel unter seine Pfote. Er sitzt eine Weile darauf, als würde er ihn ausbrüten.'),
  ], { next: 'umbinden' }),
  knoten('umbinden', [
    erz('Der Anhänger hängt an deinem Hals, federleicht. Irgendwo in Captain Kuschels Füllwatte knistert es. Es klingt verdächtig nach Schnurren.'),
    K('(Beide Ohren hoch. Für immer.)', 'freude'),
    erz('Talisman „Große Ohren“ erhalten: +1 Ausstrahlung, wenn jemand traurig ist; +1 beim Aufspüren von Verstecktem.'),
  ], { effects: [{ give: 'talisman-grosse-ohren' }, flag('kuschel_talisman'), { xp: 150 }] }),
]);

// ---------------------------------------------------------------------------------------------- Tagesgespräche ab Akt 2

export function akt23(M: Menue): Akt23 {
  const kurz: Menue = { choices: [{ text: 'Tschüss, Captain.' }], nodes: [] };
  const T = {
    master: tagesgespraech('kuschel-tag-master',
      [
        erz('Im Besuchersessel von Blades Büro sitzt Captain Kuschel, viel zu klein für das weiße Leder. Neben ihm liegt ein Zettel in Dantes Handschrift: „Er ist ein sehr guter Zuhörer. – D.“'),
        K('(Beide Ohren schlapp. Er guckt dich an. Nur an.)', 'trauer'),
      ],
      [erz('Ein zweiter Zettel, diesmal mit „– C. K.“: „Ich bin nicht enttäuscht. Ich warte. Das ist was anderes.“')],
      {
        choices: [
          { text: 'Ihm erzählen, was passiert ist. Alles.', when: { quest: 'side-zweite-chance', state: 'inactive' }, next: 'erzaehlen', effects: [{ startQuest: 'side-zweite-chance' }] },
          { text: 'Ihm erzählen, wie weit du bist.', when: { quest: 'side-zweite-chance', state: 'active' }, next: 'weiter' },
          { text: 'Tschüss, Captain.' },
        ],
        nodes: [
          knoten('erzaehlen', [
            erz('Du redest. Lange. Über den Kern, den Upload, das Wort „Master“, das so leicht über die Lippen ging. Captain Kuschel hört zu. Seine Ohren bewegen sich nicht, nicht ein einziges Mal.'),
            erz('Als du fertig bist, rutscht ein Ohr langsam nach vorn, bis es deine Hand berührt. Darunter: ein Zettel. „Dann mach es wieder gut. Fang bei Dante an. – C. K.“'),
          ]),
          knoten('weiter', [K('(Ein Ohr hoch. Weiter so.)'), erz('Unter seiner Pfote: „Nicht aufhören. Das Meer ist geduldig. Ich auch. – C. K.“')]),
        ],
      }, { plauschText: 'Hallo, Captain.' }),
    turm: tagesgespraech('kuschel-tag-turm',
      [
        erz('Captain Kuschel sitzt auf einer Ablage im Labor, eingeklemmt zwischen Pipetten und einem Behälter mit der Aufschrift „Probe 47“. Auf seinem Bauch klebt ein Inventaraufkleber: „Laborbedarf, Plüsch, 1 Stk.“'),
        K('(Ein Ohr steht. Es zeigt auf Nyra.)'),
      ],
      [erz('Unter ihm, kaum sichtbar: „Sie spielt nur. Ich hab aufgepasst. Holt sie. – C. K.“')],
      kurz, { plauschText: 'Captain. Alles klar?' }),
    fundbuero: tagesgespraech('kuschel-tag-fundbuero',
      [
        erz('Im Regal des Quantum-Fundbüros, zwischen einem einzelnen Designerschuh und drei verwaisten Regenschirmen, sitzt Captain Kuschel. Am Ohr ein Anhänger: „Fundsache 0047 – Plüsch, Ohren übergroß, Herkunft unbekannt“.'),
        K('(Beide Ohren schlapp. Dann, als er dich sieht, eins halb hoch.)', 'trauer'),
      ],
      [erz('Auf der Rückseite des Fundzettels hat jemand mit sehr ungelenker Schrift geschrieben: „Sag Dante, er soll nicht weinen. Ich komme. – C. K.“')],
      kurz, { plauschText: 'Captain! Da bist du.' }),
    mila: tagesgespraech('kuschel-tag-mila',
      [
        erz('Ein kleines Mädchen mit Zahnlücke sitzt in der Marktecke auf einer Decke und hält Captain Kuschel so fest, dass seine Ohren senkrecht nach oben stehen. Sie hat ihm eine Krone aus Alufolie gebastelt.'),
        erz('„Das ist Herr Flausch“, sagt Mila, ohne aufzusehen. „Mein Papa hat ihn gefunden. Bei der Arbeit. Er passt nachts auf, dass keine Drohnen ins Fenster gucken.“'),
        K('(Ein Ohr zuckt in deine Richtung. Ein Zwinkern. Ganz bestimmt ein Zwinkern.)'),
      ],
      [erz('In der Alufolienkrone steckt ein winziger Zettel: „Mir geht’s gut. Sie braucht mich gerade mehr. Sag Dante, er soll sie kennenlernen. – C. K.“')],
      kurz, { plauschText: 'Hallo, Herr Flausch.' }),
    sorgerecht: tagesgespraech('kuschel-tag-sorgerecht',
      [
        erz('Sonntag. Captain Kuschel sitzt auf Milas Decke in der Marktecke, mit Alufolienkrone und frisch gebürstetem Fell. Mila liest ihm aus einem Comic vor. Falsch herum. Er scheint es nicht zu stören.'),
        K('(Beide Ohren hoch. Wochenenddienst.)', 'freude'),
      ],
      [erz('Ein Zettel, mit Wachsmalstift: „Sonntags bin ich Herr Flausch. Montags bin ich Captain. Das nennt man Karriere. – C. K.“')],
      M),
    zurueck: tagesgespraech('kuschel-tag-zurueck',
      [
        K('(Beide Ohren steil hoch. Sehr steil. Er ist zurück, und alle sollen es wissen.)', 'freude'),
        erz('Ein Zettel: „Ich war im Urlaub. Es war lehrreich. Ich habe Glitzer an Stellen, die ich nicht beschreiben werde. – C. K.“'),
      ],
      [D('Er ist seit gestern zurück und hat mich noch nicht einmal angeguckt. Er schmollt, weil ich ihn auf der Party-Liste vergessen hab. Captain, ich hab dich nicht VERGESSEN, du stehst ganz oben!', 'besorgt')],
      M, { effects: [flag('kuschel_kommentar_zurueck'), herz('captain-kuschel', 20)] }),
    endeMeer: tagesgespraech('kuschel-tag-ende-meer',
      [
        K('(Beide Ohren hoch. Aus dem linken rieselt Sand.)', 'freude'),
        erz('Ein Zettel, leicht salzig: „Wir haben es geschafft. Ich hab es gewusst. Ich weiß immer alles. Ich sage nur nie was. – C. K.“'),
      ],
      [erz('Darunter, kleiner: „Blade hat geweint, als sie ihn abgeführt haben. Ich hab ihm nicht gewinkt. Ich hab ein Ohr gesenkt. Aus Höflichkeit. – C. K.“')],
      M, { effects: [flag('kuschel_kommentar_ende')] }),
    endeNexus: tagesgespraech('kuschel-tag-ende-nexus',
      [
        K('(Ein Ohr hoch, eins geknickt. Skeptisch, aber freundlich.)'),
        erz('Ein Zettel: „Nexus hat mich gefragt, ob ich auch eine KI bin. Ich habe nicht geantwortet. Soll sie ruhig rätseln. – C. K.“'),
      ],
      [erz('„Sie hat sich entschuldigt. Bei allen. Auch bei mir. Ich hab ihr verziehen. Waschmaschinen nicht. – C. K.“')],
      M, { effects: [flag('kuschel_kommentar_ende')] }),
    ende3b: tagesgespraech('kuschel-tag-ende-3b',
      [
        K('(Beide Ohren hoch. Und dann wackeln sie. Beide. Gleichzeitig.)', 'freude'),
        erz('Ein Zettel, sehr kurz: „Ich wusste es. – C. K.“'),
      ],
      [erz('Und auf der Rückseite: „Ich bin ein sehr guter Zuhörer. Du warst ein sehr guter Erzähler. Wir sind quitt. – C. K.“')],
      M, { effects: [flag('kuschel_kommentar_ende'), herz('captain-kuschel', 30)] }),
    nacht: tagesgespraech('kuschel-tag-morgen-danach',
      [
        K('(Beide Ohren fest an den Kopf gelegt. Demonstrativ.)'),
        erz('Ein Zettel: „Ich habe nichts gehört. Ich habe sehr große Ohren. Ich habe nichts gehört. – C. K.“'),
      ],
      [erz('Darunter, nachträglich: „Gratuliere. – C. K.“')],
      M, { effects: [flag('kuschel_kommentar_nacht')] }),
    strand: tagesgespraech('kuschel-tag-strand',
      [
        erz('Captain Kuschel sitzt neben Nyras Eimer im Sand, die Ohren voller Wind, und guckt aufs Wasser. Ein Krebs krabbelt an ihm vorbei. Sie mustern sich. Respektvoll.'),
        N('Er und Karl verstehen sich. Karl ist der Krebs. Beide sagen nie was. Perfekte Freundschaft.', 'freude'),
      ],
      [erz('Ein Zettel, im Sand halb vergraben: „Hier ist es gut. Ich bleibe bis Mittag. Dann muss ich nach Dante sehen. Er vergisst sonst zu essen. – C. K.“')],
      M),
    a2Werkstatt: tagesgespraech('kuschel-tag-a2-werkstatt',
      [
        erz('In der Werkstatt läuft keine Platte. Stattdessen surrt der Schraubstock: Dante hat einen Chrome-10-Chip eingespannt und starrt ihn durch eine Lupe an, als wollte er ihn hypnotisieren.'),
        K('(Ein Ohr geknickt. Sehr skeptisch. Richtung Chip.)'),
        D('Ich weiß, Captain. Ich fass ihn nur mit der Zange an. Ich bin ja nicht verrückt. Nur ein bisschen. Für den guten Zweck.', 'besorgt'),
      ],
      [D('Er hat mir heute Morgen einen Zettel hingelegt: „Iss was.“ Er hat recht. Er hat immer recht. Das ist das Anstrengende an ihm.')],
      M),
    party: tagesgespraech('kuschel-tag-party',
      [
        erz('Captain Kuschel sitzt auf der Werkbank und trägt eine winzige Fliege aus schwarzem Samt. Dante zupft sie zum siebten Mal gerade.'),
        D('Für die Releaseparty. Wer auf eine Quantum-Gala geht, braucht eine Fliege. Er hat sich beschwert. Mit den Ohren. Ich hab’s überhört.', 'freude'),
        K('(Beide Ohren hoch. Er findet die Fliege offensichtlich großartig.)', 'freude'),
      ],
      [D('Ich weiß nicht mal, ob er mitkommt. Aber er soll gut aussehen, falls doch. Man muss vorbereitet sein. Das hat mir der Knast beigebracht. Und Hunter. Hauptsächlich Hunter.')],
      M),
  };

  const dialogues = [...Object.values(T), he8, he10];

  const talk = [
    rede('kuschel-tag-master', MASTER),
    rede('kuschel-tag-turm', KUSCHEL_IM_TURM),
    rede('kuschel-tag-fundbuero', KUSCHEL_FUNDBUERO),
    rede('kuschel-tag-mila', KUSCHEL_BEI_MILA),
    rede('kuschel-tag-sorgerecht', { all: [{ flag: 'kuschel_sorgerecht' }, { weekday: 'so' }, { time: 'tag' }] }),
    rede('kuschel-tag-ende-3b', { all: [ENDE_3B, { notFlag: 'kuschel_kommentar_ende' }] }),
    rede('kuschel-tag-ende-meer', { all: [NACHSPIEL, ENDE_MEER, { notFlag: 'kuschel_kommentar_ende' }] }),
    rede('kuschel-tag-ende-nexus', { all: [NACHSPIEL, ENDE_NEXUS, { notFlag: 'kuschel_kommentar_ende' }] }),
    rede('kuschel-tag-morgen-danach', { all: [IRGENDEINE_NACHT, { notFlag: 'kuschel_kommentar_nacht' }, { time: ['morgen', 'tag'] }, KUSCHEL_FREI] }),
    rede('kuschel-tag-zurueck', { all: [QUEST_DONE, { notFlag: 'kuschel_kommentar_zurueck' }, KUSCHEL_FREI] }),
    rede('kuschel-tag-strand', { all: [NACHSPIEL, BEI_NYRA, { time: ['morgen', 'tag'] }] }),
    rede('kuschel-tag-party', { all: [AKT2, PARTY_PLAN, KUSCHEL_FREI] }),
    rede('kuschel-tag-a2-werkstatt', { all: [AKT2, KUSCHEL_FREI, { time: ['tag', 'abend'] }] }),
  ];

  const schedule: ScheduleEntry[] = [
    { when: MASTER, place: { map: 'blades-buero', at: 'kuschel-sessel' } },
    { when: KUSCHEL_IM_TURM, place: { map: 'quantum-labor', at: 'kuschel-ablage' } },
    { when: KUSCHEL_FUNDBUERO, place: { map: 'quantum-foyer', at: 'fundbuero-quantum' } },
    { slot: 'tag', when: KUSCHEL_BEI_MILA, place: { map: 'schrottmarkt', at: 'mila-ecke' } },
    { when: KUSCHEL_BEI_MILA, place: 'away' },
    { slot: 'tag', days: ['so'], when: { flag: 'kuschel_sorgerecht' }, place: { map: 'schrottmarkt', at: 'mila-ecke' }, dialogue: 'kuschel-tag-sorgerecht' },
    // Nachspiel: morgens und tagsüber neben Nyra am Meer (wenn sie ihn hat und er nicht mit ihr unterwegs ist).
    { slot: ['morgen', 'tag'], when: { all: [NACHSPIEL, BEI_NYRA, { not: { companion: 'nyra' } }] }, place: { map: 'das-meer', at: [470, 712] }, dialogue: 'kuschel-tag-strand' },
  ];

  const phone = {
    'tel-kuschel-zettel-party': {
      id: 'tel-kuschel-zettel-party', from: 'dante',
      text: 'Foto im Anhang: Captain Kuschel mit Samtfliege. Er sieht besser aus als ich. Ich trag trotzdem meine. Wir gehen als Partnerlook. Sag nichts. – D.',
      auto: { all: [AKT2, PARTY_PLAN, KUSCHEL_FREI, { hearts: 'captain-kuschel', min: 4 }] },
      replies: [{ text: 'Zum Knutschen, ihr beide.', effects: [herz('captain-kuschel', 10), herz('dante', 10)] }, { text: 'Geht so.' }],
    },
  };

  return { dialogues, talk, schedule, phone };
}
