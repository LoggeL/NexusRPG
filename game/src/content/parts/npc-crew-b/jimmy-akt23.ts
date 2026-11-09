// Jimmy in Akt 2, Akt 3 und im Nachspiel (world.md §4.2, §5.3–5.5; Orte nach design/plan/act23.json).
// Gerettet (side-jimmys-chip): Crew-Alltag, tagsüber jetzt am Botenstand; Akt-2-Gespräche über Chrome 10, Drohnen, Aria,
// Nyra, Dante. Nicht gerettet: Variante B des Bruchs chippt ihn (jimmy_gechippt), er liegt im Labor (probanden-liege)
// bis main-3-labor; im Nachspiel wacht er in Dantes Werkstatt auf (jimmy-erwacht setzt jimmy_gerettet).
// he-jimmy-8 (Hunter entschuldigt sich) und he-jimmy-10 (Glückschip) als volle Szenen. Lieferdienst am Meer nach
// side-strandclub (world.md §5.5 Epilog-Karte). Kein eigener Inhaltsteil (jimmy.ts mischt).
import type { Condition, DialogueChoice, DialogueNode, ScheduleEntry } from '../../../modules/contracts';
import {
  type Akt23, type Menue, AKT2, ARIA_WEG, ARIA_ZURUECK, DANTE_CREW, ENDE_3B, ENDE_MEER, ENDE_NEXUS, MASTER, NACHSPIEL,
  NYRA_IM_TURM, PARTYNACHT, PARTY_BEREIT, PARTY_PLAN, dialog, erz, flag, herz, ich, knoten, pruefung, rede, sprecher,
  tagesgespraech,
} from './_helfer';

const J = sprecher('jimmy');
const H = sprecher('hunter');
const D = sprecher('dante');
const V = sprecher('vega');

export const GERETTET: Condition = { any: [{ quest: 'side-jimmys-chip', state: 'done' }, { flag: 'jimmy_gerettet' }] };
/** Variante B ohne Rettung: im Turm gechippt, bis main-3-labor. */
export const JIMMY_IM_TURM: Condition = { all: [{ flag: 'jimmy_gechippt' }, { not: GERETTET }, { not: { quest: 'main-3-labor', state: 'done' } }] };
/** Nach der Partynacht wacht der gechippte Jimmy auf (Nexus rebelliert, die Chips gehen aus). */
const JIMMY_WACHT_AUF: Condition = { all: [{ flag: 'jimmy_gechippt' }, { not: GERETTET }, NACHSPIEL] };
/** Jimmy ist ansprechbar und nicht im Turm/auf der Party/im Master-Modus. */
export const JIMMY_DA_23: Condition = { all: [GERETTET, { not: PARTYNACHT }, { not: MASTER }] };

// ---------------------------------------------------------------------------------------------- Menüwahlen ab Akt 2

export function menue23(zurueck: DialogueChoice[]): Menue {
  const choices: DialogueChoice[] = [
    { text: 'Wie hältst du das aus? Überall Chrome-10-Plakate.', when: { all: [AKT2, GERETTET] }, once: true, id: 'j23-plakate', next: 'plakate', effects: [herz('jimmy', 20)] },
    { text: 'Kommst du mit auf die Releaseparty?', when: { all: [AKT2, PARTY_PLAN, GERETTET] }, once: true, id: 'j23-party', next: 'party' },
    { text: 'Was machst du jetzt, Jimmy? Mit dem Rest von deinem Leben?', when: { all: [NACHSPIEL, GERETTET] }, once: true, id: 'j23-zukunft', next: 'zukunft', effects: [herz('jimmy', 30)] },
  ];
  const nodes: DialogueNode[] = [
    knoten('plakate', [
      J('Am Anfang hab ich gezittert. Jedes Mal. Da steht „Gratis“, und mein Kopf will „Ja, gern!“ sagen, ganz von allein. Wie ein Schluckauf.', 'besorgt'),
      J('Jetzt mal ich Schnurrbärte drauf. Auf jedes Gesicht. Sybella Chrome hat in der Neon-Gasse inzwischen sieben Schnurrbärte. Einer davon ist geschwungen. Ich bin stolz auf den.', 'signatur'),
      J('Dante sagt, das ist Therapie. Hunter sagt, das ist Sachbeschädigung. Ich sag: Beides. Die besten Sachen sind beides.'),
    ], { choices: zurueck }),
    knoten('party', [
      J('Ich? Auf eine Quantum-Party? Mit Gratis-Chips am Eingang? Nein. Nein, nein, nein. Mein Kopf ist gerade frisch geputzt.', 'besorgt'),
      J('Aber ich fahr den Lieferwagen! Hunter hat gesagt, ich bin das Fluchtfahrzeug. Ich bin noch nie ein Fahrzeug gewesen. Ich hab sogar einen Führerschein. Fast. Einen halben. Den theoretischen Teil.', 'freude'),
      J('Wenn ihr rauskommt, steh ich mit laufendem Motor da und sag „Ihre Abholung ist eingetroffen“. Absichtlich. Als Witz. Ich darf das jetzt.'),
    ], { choices: zurueck }),
    knoten('zukunft', [
      J('Ich hab einen Plan! Einen eigenen! Nicht vom Chip. Von mir.', 'freude'),
      J('Lieferdienst. Jimmy liefert. Nudeln, Pakete, Ersatzteile, Leute, die nicht mehr laufen wollen. Überallhin. Auch ans Meer.'),
      J('Mein Slogan: „Ich drehe nur noch am Lenkrad durch.“ Collin findet ihn gut. Collin findet alles gut, was sich reimt. Der reimt sich nicht. Er findet ihn trotzdem gut.', 'signatur'),
    ], { choices: zurueck }),
  ];
  return { choices, nodes };
}

// ---------------------------------------------------------------------------------------------- Herz-Ereignisse 8 und 10

export const he8 = dialog('he-jimmy-8', [
  knoten('start', [
    erz('High Voltage, nach Feierabend. Die Stühle stehen auf den Tischen, die Musik ist aus, nur die Kühlschränke brummen. Jimmy fegt. Keiner hat ihn darum gebeten. Alte Putzkolonnen-Gewohnheit.'),
    erz('Hunter sitzt an Jimmys Tisch in der Gästeecke, die Sonnenbrille in der Hand. Das macht er nie.'),
    H('Jimmy. Setz dich.', 'besorgt'),
    J('Ich hab nichts gemacht! Doch, ich hab den Boden gemacht. Ist das schlimm? Ich kann ihn wieder dreckig machen.', 'ueberrascht'),
    H('Ich hab gesagt, du bist durch. Vor allen. Am Tresen. Ich hab’s gesagt wie eine Wettervorhersage.'),
    H('Das war falsch. Schulden muss man immer begleichen. Das hier ist meine.'),
    J('… Hunter. Ich … Fehler 404. Worte nicht gefunden.', 'trauer'),
  ], {
    choices: [
      { text: 'Jimmy eine Hand auf die Schulter legen. „Sag einfach Danke, Jimmy.“', next: 'danke', effects: [herz('jimmy', 40), herz('hunter', 20)] },
      { text: '„Hunter, setz dich richtig hin. Das wird länger.“', check: pruefung('he-jimmy-8-hunter', 'ausstrahlung', 6, ['ueberreden']), next: 'laenger', effects: [herz('jimmy', 50), herz('hunter', 30)] },
      { text: '„Schulden mit Zinsen, Hunter. Jimmy kriegt einen echten Vertrag. Mit Lohn. Und Urlaub.“', check: pruefung('he-jimmy-8-vertrag', 'strasse', 5, ['verhandeln', 'schulden']), next: 'vertrag', effects: [herz('jimmy', 50), herz('hunter', 10), flag('jimmy_vertrag')] },
    ],
  }),
  knoten('danke', [
    J('Danke.', 'trauer'),
    erz('Ein Wort. Es hat drei Monate gedauert. Hunter nickt, als hätte er gerade eine sehr große Rechnung bezahlt und das Wechselgeld behalten dürfen.'),
  ], { next: 'ende' }),
  knoten('laenger', [
    erz('Hunter setzt sich. Richtig. Ellbogen auf den Tisch, Brille weg, wie ein Mann, der nicht gleich wieder aufsteht.'),
    H('Deinen Spind hab ich nicht ausgeräumt. Drei Monate. Raven hat gefragt, ob sie ihn haben kann. Ich hab nein gesagt. Ich wusste nicht, warum.', 'trauer'),
    J('Da ist eine Banane drin. Eine sehr alte Banane.', 'besorgt'),
    H('Ich weiß. Ich hab sie nicht angefasst. Aus Respekt.'),
    erz('Und dann lachen beide. Jimmy laut und hicksend, Hunter so leise, dass man es fast für Husten halten könnte.'),
  ], { next: 'ende' }),
  knoten('vertrag', [
    H('Urlaub. Gott. Du klingst wie ein Gewerkschaftsplakat.', 'wut'),
    H('… Na gut. Lohn, Vertrag, drei Tage Urlaub. Im Jahr. Nicht am Stück. Und nicht freitags.'),
    J('Ich hab URLAUB? Ich hab noch nie Urlaub gehabt. Was macht man da? Muss man da was kaufen?', 'ueberrascht'),
    ich('Nein, Jimmy. Genau das ist der Witz daran.'),
  ], { next: 'ende' }),
  knoten('ende', [
    erz('Hunter steht auf, setzt Jimmy die goldene Sonnenbrille auf die Nase und geht zum Tresen, ohne sich umzudrehen. Jimmy sitzt da, mit zu großer Brille, und strahlt wie eine Werbetafel um Mitternacht.'),
    J('Danke, Boss. Bitte bewerten Sie … nein. Einfach nur: danke.', 'freude'),
    V('Ich hab’s ja gesagt. Er berappelt sich.', 'signatur'),
    erz('Vega sitzt in der dunklen Ecke am Fenster. Wie lange schon, weiß keiner. Sie hebt ihr Glas. Nur einen Zentimeter. Bei ihr ist das ein Trinkspruch.'),
  ], { effects: [flag('hunter_entschuldigt_jimmy'), { xp: 120 }] }),
]);

export const he10 = dialog('he-jimmy-10', [
  knoten('start', [
    erz('Crew-Quartier, Nacht. Jimmy sitzt auf der Couch, in seine Decke gewickelt, und liest einen Werbeprospekt. Rückwärts. Von der letzten Seite zur ersten.'),
    J('Damit er keine Macht mehr über mich hat. Rückwärts sind Werbesprüche nur noch Gedichte. „Sofort jetzt Sie sichern.“ Schön, oder?', 'signatur'),
    erz('Zwischen seinen Fingern wandert ein abgegriffener Casino-Chip hin und her. Rot, mit einem Kratzer quer über der Zahl.'),
  ], {
    choices: [
      { text: '„Was ist das für ein Chip?“', next: 'geschichte' },
    ],
  }),
  knoten('geschichte', [
    J('Mein Glückschip. Den hat mir meine Oma gegeben. Sie war Croupière im alten Casino unter den Glasarkaden, bevor sie da eine Bank draus gemacht haben. Also, eine echte Bank. Mit noch mehr Glücksspiel.', 'freude'),
    J('Sie hat gesagt: „Jimmy, solange du den hast, hast du noch nicht alles gesetzt.“'),
    J('Ich hab ihn auch mit dem Chip im Kopf immer dabeigehabt. In der Overallhosentasche. Ich wusste nicht mehr, was er bedeutet. Ich hab ihn nur nie weggegeben. Nicht mal für eine Easy-Rate.', 'trauer'),
  ], {
    choices: [
      { text: 'Den Chip über die Fingerknöchel wandern lassen, wie ein Profi.', check: pruefung('he-jimmy-10-trick', 'strasse', 5, ['gluecksspiel', 'trick']), next: 'trick', effects: [herz('jimmy', 40)] },
      { text: '„Du hast nie alles gesetzt, Jimmy. Du hast nur kurz vergessen, wo du dich hingelegt hast.“', check: pruefung('he-jimmy-10-trost', 'ausstrahlung', 5, ['trost']), next: 'trost', effects: [herz('jimmy', 40)] },
      { text: '„Lies mir was vor. Rückwärts.“', next: 'vorlesen', effects: [herz('jimmy', 30)] },
    ],
  }),
  knoten('trick', [
    erz('Der Chip tanzt über deine Knöchel, verschwindet, taucht hinter Jimmys Ohr wieder auf. Er quiekt.'),
    J('Oma konnte das auch! Genau so! Sie hat mir damit immer das Taschengeld wieder abgenommen. Woher kannst du das?!', 'ueberrascht'),
  ], { next: 'geschenk' }),
  knoten('trost', [
    erz('Jimmy sagt eine Weile nichts. Dann zieht er die Decke bis unters Kinn.'),
    J('Kurz vergessen. Ja. So fühlt sich das an. Wie ein Schlüssel, den man in der Hand hält, während man ihn sucht.', 'trauer'),
  ], { next: 'geschenk' }),
  knoten('vorlesen', [
    J('„Morgen von Zukunft die Ihre heute schon. Sichern Sie.“ „Müde nie wieder.“ „Gratis.“', 'signatur'),
    erz('Beim letzten Wort stockt er. Dann liest er es noch mal, ganz langsam, rückwärts: „Sitarg.“ Und muss so lachen, dass er von der Couch fällt.'),
    J('Sitarg! Das klingt wie ein Drache! Ein kleiner, dummer Drache! Ich hab Angst vor einem kleinen dummen Drachen gehabt!', 'freude'),
  ], { next: 'geschenk' }),
  knoten('geschenk', [
    J('Hier. Er gehört jetzt dir.', 'freude'),
    J('Weil du auch geblieben bist. Und weil ich jetzt weiß, wo der Rest von mir ist. Ich brauch keinen Beweis mehr in der Hosentasche.'),
  ], {
    choices: [
      { text: 'Den Chip nehmen.', next: 'ende' },
      { text: '„Behalt ihn, Jimmy. Der gehört deiner Oma.“', next: 'oma' },
    ],
  }),
  knoten('oma', [
    J('Oma hätte gesagt: „Jimmy, wer einen Glückschip behält, wenn er ihn verschenken kann, hat das Spiel nicht verstanden.“', 'signatur'),
    J('Und dann hätte sie dir Taschengeld abgenommen. Nimm ihn. Bitte. Sonst muss ich ihn dir in die Jacke schmuggeln, und ich bin ein schlechter Schmuggler. Ich bedanke mich immer laut dabei.'),
  ], { next: 'ende' }),
  knoten('ende', [
    J('Willkommen. Wie kann ich deine Zukunft optimieren? … Das war ein Witz. Ein eigener. Von mir.', 'signatur'),
    erz('Andenken erhalten: Jimmys Glückschip.'),
  ], { effects: [{ give: 'jimmys-glueckschip' }, { xp: 150 }] }),
]);

/** Nachspiel: Der gechippte Jimmy ist wach (Variante B ohne Rettung). */
const erwacht = dialog('jimmy-erwacht', [
  knoten('start', [
    erz('Dantes Werkstatt. Auf dem Hocker sitzt Jimmy, in eine Decke gewickelt, beide Hände um eine Tasse Kakao. Hinter seinem Ohr eine frische Naht, wo der Chip war. Er sieht verloren aus. Aber er ist da.'),
    D('Als Nexus rebelliert hat, sind die Chips ausgegangen. Alle. Seiner auch. Er sitzt seit drei Tagen hier. Er redet. Normal. Meistens.', 'besorgt'),
    J('Hi. Ich bin Jimmy. Glaub ich. Die letzten Wochen sind wie ein Werbeblock, den man nicht überspringen kann.', 'trauer'),
  ], {
    choices: [
      { text: '„Lötkolben-Soße, Jimmy. Thermoskannen. Heißgetränk.“', tag: '[Gosse]', when: { origin: 'origin-gossenkind' }, next: 'gosse', effects: [herz('jimmy', 40)] },
      { text: '„Vega hat nie aufgehört, an dich zu glauben. Keinen Tag.“', next: 'vega', effects: [herz('jimmy', 30), herz('vega', 20)] },
      { text: '„Willkommen zurück.“', next: 'willkommen', effects: [herz('jimmy', 30)] },
    ],
  }),
  knoten('gosse', [
    J('Soße. Die Soße! Ich hab sie in Thermoskannen verkauft. Mit Pfand! Du hast die Kannen zurückgebracht!', 'freude'),
    J('Ich weiß wieder was. Etwas, das mir keiner einprogrammiert hat. Das ist … das ist das beste Gefühl der Welt.'),
  ], { next: 'ende' }),
  knoten('vega', [
    J('Vega … hat mir Nudeln gebracht. Scharf. Ich hab sie „Kundin“ genannt.', 'trauer'),
    J('Ich muss mich bei ihr entschuldigen. Und mich bedanken. In der Reihenfolge. Oder andersrum. Ich üb beides.'),
  ], { next: 'ende' }),
  knoten('willkommen', [
    J('Willkommen. Das hab ich immer gesagt. Tausendmal am Tag. Zu Zügen. Zu Fässern.', 'besorgt'),
    J('Es ist das erste Mal, dass es jemand zu mir sagt.', 'freude'),
  ], { next: 'ende' }),
  knoten('ende', [
    J('Darf ich … darf ich wieder mitmachen? Bei euch? Ich kann fegen. Und Fässer stapeln. Sehr gerade.'),
    erz('Dante legt Jimmy eine Hand auf den Kopf, wie man es bei Kindern macht, die nachts schlecht geträumt haben.'),
    D('Du warst nie raus, Jimmy. Du warst nur kurz in der Werbepause.', 'freude'),
  ], {
    effects: [
      flag('jimmy_gerettet'), flag('jimmy_status_gefunden'), flag('jimmy_status_neustart'), flag('jimmy_erwacht_nachspiel'), { xp: 100 },
      // Jimmys Quest gilt damit als erledigt (tut nichts, wenn sie schon abgeschlossen ist).
      { completeQuest: 'side-jimmys-chip' },
    ],
  }),
]);

// ---------------------------------------------------------------------------------------------- Tagesgespräche ab Akt 2

export function akt23(M: Menue): Akt23 {
  const gehen: Menue = { choices: [{ text: 'Gehen.' }], nodes: [] };
  const T = {
    gechippt: tagesgespraech('jimmy-tag-gechippt',
      [
        erz('Auf der zweiten Liege liegt Jimmy, festgeschnallt, mit einem blau pulsierenden Chip hinter dem Ohr. Er lächelt. Das Lächeln ist perfekt. Das macht es so schlimm.'),
        J('Guten Abend, Master. Ich bin bereit für die Lieferung. Bitte geben Sie Ihre Bestellung auf.'),
      ],
      [J('Ich bin sehr zufrieden. Ich bin zu hundert Prozent zufrieden. Zufriedenheit ist ein Gratis-Upgrade.')],
      {
        choices: [
          { text: '„Lötkolben-Soße, Jimmy.“', tag: '[Gosse]', when: { origin: 'origin-gossenkind' }, next: 'flackern' },
          { text: '„Vega bringt dir Nudeln. Scharf.“', next: 'flackern' },
          { text: 'Gehen.' },
        ],
        nodes: [
          knoten('flackern', [
            erz('Für einen Herzschlag flackert das Blau hinter seinem Ohr. Seine Lippen formen ein Wort, das kein Werbespruch ist. Vielleicht „Vega“. Vielleicht „Hilfe“.'),
            J('… Ihre Anfrage … wird … bearbeitet. Bitte haben Sie Geduld.', 'trauer'),
          ]),
        ],
      }, { plauschText: 'Jimmy. Ich bin’s.' }),
    master: tagesgespraech('jimmy-tag-master',
      [
        erz('Jimmy steht am Bahnsteig-Ende und winkt einem Zug, der nicht kommt. Als er dich sieht, hört er auf zu winken.'),
        J('Willkommen. Wie kann ich … nein. Nein, das sag ich nicht mehr. Nicht zu dir.', 'trauer'),
      ],
      [J('Du hast mir mal einen Chip aus dem Kopf geholt. Und jetzt hast du dir selbst einen eingesetzt. Einen unsichtbaren. Ich seh ihn trotzdem. Ich kenn das Blinken.', 'trauer')],
      gehen, { plauschText: 'Jimmy, warte.' }),
    ende3b: tagesgespraech('jimmy-tag-ende-3b',
      [
        J('Du bist da! Am Meer! Willkommen! Das ist kein Werbespruch! Das ist ein echtes Willkommen! Mit Ausrufezeichen!', 'freude'),
      ],
      [J('Raven hat geweint. Sie sagt, es war Sand im Auge. Am Meer gibt es sehr viel Sand. Sie hat also vielleicht recht. Aber sie hat auch gelächelt. Gegen Sand lächelt man nicht.', 'signatur')],
      M, { effects: [flag('jimmy_kommentar_ende'), herz('jimmy', 30)] }),
    endeMeer: tagesgespraech('jimmy-tag-ende-meer',
      [
        J('Das Meer! Ich hab’s gesehen! Ich hab ihm „Willkommen“ gesagt, und es hat mich nass gemacht! Das ist die beste Kundenreaktion meines Lebens!', 'freude'),
      ],
      [J('Collin hat gesagt, Blade wird jetzt „abgeführt“. Ich hab gefragt, ob das wehtut. Er hat gesagt: nur am Ego. Ich find, das reicht.', 'signatur')],
      M, { effects: [flag('jimmy_kommentar_ende'), herz('jimmy', 20)] }),
    endeNexus: tagesgespraech('jimmy-tag-ende-nexus',
      [
        J('Nexus hat sich bei mir entschuldigt. Persönlich. Übers Radio. Sie hat gesagt: „Es tut mir leid, dass ich dich zur Zielgruppe gemacht habe.“', 'ueberrascht'),
        J('Ich hab gesagt: Danke. Und dann: Bitte nie wieder. Und dann haben wir zusammen einen Werbespot rückwärts gehört. Das war schön. Das war komisch schön.'),
      ],
      [J('Ich trau ihr noch nicht ganz. Aber sie gibt sich Mühe. Ich weiß, wie das ist. Wenn man vorher jemand anderes war und jetzt üben muss.', 'trauer')],
      M, { effects: [flag('jimmy_kommentar_ende'), herz('jimmy', 20)] }),
    lieferdienst: tagesgespraech('jimmy-tag-lieferdienst',
      [
        erz('An der Strandclub-Bar lehnt Jimmy in einer Jacke mit aufgenähtem Schriftzug: „JIMMY LIEFERT – Ich drehe nur noch am Lenkrad durch“. Neben ihm stapeln sich Kisten mit Volt-Limo, sehr gerade.'),
        J('Sonntagslieferung! Limo, Nudeln, drei Liegestühle und ein Akkordeon für Lio! Alles pünktlich! Fast! Die U-Bahn war schneller, aber die U-Bahn ist jetzt auch pünktlich, das ist unfaires Training.', 'freude'),
      ],
      [J('Ich hab sieben Kunden. Echte. Die mich anrufen. Wegen Sachen, die sie wirklich wollen. Ich frag jedes Mal: „Brauchst du das wirklich?“ Zweimal haben sie dann abbestellt. Ich bin der schlechteste Verkäufer der Stadt. Ich bin so stolz.', 'signatur')],
      M),
    akt2: tagesgespraech('jimmy-tag-akt2',
      [
        J('Hast du die Plakate gesehen? „Chrome 10 – bald gratis für alle!“ Überall. Am Kiosk. Am Bahnhof. Auf meiner Kakaotasse! Wer druckt Werbung auf meine Kakaotasse?!', 'besorgt'),
        J('Mir zittern die Hände. Nicht vom Kakao. Vom Wort. „Gratis.“ Das ist wie ein Lied, das man nicht mehr aus dem Kopf kriegt. Ich hab’s ja schon mal nicht rausgekriegt.'),
      ],
      [J('Dante hat gesagt, wenn ich zittere, soll ich an was Schönes denken. Ich denk an Ölfässer. Gerade gestapelte. Das ist schön. Das ist leider auch nicht ganz gesund.', 'signatur')],
      M, { effects: [flag('jimmy_kommentar_akt2')] }),
    ariaWeg: tagesgespraech('jimmy-tag-aria-weg',
      [
        J('Aria. Sie haben Aria. Mit so einem Chip. Mit MEINEM Chip, quasi. Also, mit einem Cousin von meinem Chip.', 'trauer'),
        J('Ich weiß, wie das ist. Da drin. Es tut nicht weh. Das ist das Schlimme. Es ist bequem. Wie ein Sofa, das einen auffrisst.'),
      ],
      [J('Wenn ihr sie holt, sagt ihr was Echtes. Was Kleines. Das hat bei mir geholfen. Lötkolben-Soße. Nudeln. Bei Aria vielleicht ihre Band. Kabelbrand. Sagt „Kabelbrand“.', 'besorgt')],
      M, { plauschText: 'Jimmy. Du weißt, wie das ist, oder?' }),
    ariaZurueck: tagesgespraech('jimmy-tag-aria-zurueck',
      [
        J('Aria ist wach! Sie hat mich angeguckt und gesagt: „Jimmy, verpiss dich.“ Standard-Tarif! Sie ist wieder ganz sie selbst!', 'freude'),
      ],
      [J('Später hat sie sich neben mich gesetzt. Einfach so. Hat nichts gesagt. Hat mir ihre Limo gegeben. Ich glaub, das war Premium-Tarif. Ich hab geweint. Sie hat „Jimmy, verpiss dich“ gesagt. Mit Komma.', 'trauer')],
      M, { effects: [flag('jimmy_kommentar_aria_zurueck'), herz('jimmy', 10)] }),
    proband: tagesgespraech('jimmy-tag-proband',
      [
        J('Der Mann auf der zweiten Liege. Nummer siebenundvierzig. Im Krankenhemd. Hab ich gehört.', 'besorgt'),
        J('Das hätte ich sein können. Wenn du mich nicht geholt hättest, wär ich da gelegen. Ich hätte „Master“ gesagt. Und gelächelt.'),
      ],
      [J('Ich hab beschlossen, ihm eine Karte zu schreiben. Wenn das alles vorbei ist. „Willkommen zurück.“ Ich weiß, wie gut das tut.', 'trauer')],
      M, { effects: [flag('jimmy_kommentar_proband')] }),
    nyraWeg: tagesgespraech('jimmy-tag-nyra-weg',
      [
        J('Nyra hat mir mal ein Selfie geschickt. Mit Untertitel: „Jimmy, du bist der Einzige, der meine Witze versteht.“ Ich hab sie nicht verstanden. Ich hab trotzdem gelacht.', 'trauer'),
        J('Jetzt sitzt sie da drin. Bei denen. Und spielt die Gechippte. Das ist mutig. Das ist so mutig, dass mir schlecht wird.'),
      ],
      [J('Ich hab ihr Selfie ausgedruckt und an den Kühlschrank geklebt. Damit sie da ist, wenn jemand Milch holt.')],
      M, { effects: [flag('jimmy_kommentar_nyra')] }),
    danteCrew: tagesgespraech('jimmy-tag-dante-crew',
      [
        J('Dante ist wieder im Dienst! „Genie und Wahnsinn!“ Ich bin sein Assistent. Ich halte Schrauben. Ganz still. Ich bin sehr gut im Stillhalten. Ich hab drei Wochen am Bahnsteig gestanden.', 'freude'),
      ],
      [J('Er hat einen Chrome-10-Chip auseinandergenommen und dabei geflucht. „Um Himmels Willen!“ Zwölf Mal. Ich hab mitgezählt. Das ist meine neue Aufgabe: Flüche zählen.', 'signatur')],
      M, { effects: [flag('jimmy_kommentar_dante')] }),
    partyBereit: tagesgespraech('jimmy-tag-party-bereit',
      [
        J('Der Lieferwagen ist vollgetankt. Ich hab die Reifen poliert. Man poliert keine Reifen, sagt Dante. Ich weiß. Ich war nervös.', 'besorgt'),
        J('Ich hab ein Schild gemalt: „Ihre Abholung ist eingetroffen“. Das halt ich raus, wenn ihr rennt. Damit ihr wisst, welcher Wagen. Und damit ihr lacht. Lachende Leute rennen schneller.'),
      ],
      [J('Bitte kommt alle wieder raus. Alle. Ich zähl mit. Ich kann gut zählen. Ich hab vierhundertzwölf Züge gezählt.', 'trauer')],
      M),
    botenstand: tagesgespraech('jimmy-tag-botenstand',
      [J('Botenstand! Ich trag heute Kisten für die Party! Servietten, Kabel, eine Kiste, auf der „Nicht schütteln“ steht. Ich schüttel sie nicht. Ich hab sie trotzdem ein bisschen geschüttelt. Aus Versehen.', 'freude')],
      [J('Hunter zahlt mir pro Kiste. Echtes Geld. Ich hab ein Sparschwein gekauft. Es heißt Dexter. Weil es nie genug hat.', 'signatur')],
      M),
    a2Werkstatt: tagesgespraech('jimmy-tag-a2-werkstatt',
      [J('Morgen! Dante baut an Chip-Blockern. Ich darf die fertigen in eine Schachtel legen. Die Schachtel ist rot. Rot heißt: Nicht anfassen, außer man ist Jimmy.', 'freude')],
      [J('Manchmal guck ich die Chips an und denk: Du warst mal in meinem Kopf. Und jetzt liegst du in einer Schachtel. Wer ist jetzt der Kundenservice, hä?', 'signatur')],
      M),
    a2Club: tagesgespraech('jimmy-tag-a2-club',
      [J('Abend! Die Hälfte der Gäste hat einen Chip und trinkt nur Wasser und lächelt. Die andere Hälfte flucht und trinkt Schnaps. Ich sitz bei der Schnaps-Hälfte. Mit Limo.', 'besorgt')],
      [J('Der Barkeeper hat mir einen neuen Drink gemacht. Er heißt „Firewall“. Ich hab gefragt, was drin ist. Er hat gesagt: „Nichts, was dich mag.“ Ich hab ihn trotzdem getrunken. Er war grün.')],
      M),
    a2Couch: tagesgespraech('jimmy-tag-a2-couch',
      [J('Psst. Die Drohnen fliegen nachts am Fenster vorbei. Ich hab Alufolie an die Scheibe geklebt. Raven sagt, das bringt nichts. Ich sag: Es bringt mir was.', 'besorgt')],
      [J('Wenn ich nicht schlafen kann, zähl ich nicht Schafe. Ich zähl Leute, die mich mögen. Ich bin bei elf. Gestern war ich bei zehn. Rate mal, wer dazugekommen ist. Captain Kuschel. Er hat mir einen Zettel geschrieben.', 'freude')],
      M),
  };

  const dialogues = [...Object.values(T), erwacht, he8, he10];

  const talk = [
    rede('jimmy-tag-gechippt', JIMMY_IM_TURM),
    rede('jimmy-erwacht', JIMMY_WACHT_AUF),
    rede('jimmy-tag-master', { all: [MASTER, GERETTET] }),
    rede('jimmy-tag-ende-3b', { all: [ENDE_3B, GERETTET, { notFlag: 'jimmy_kommentar_ende' }] }),
    rede('jimmy-tag-ende-meer', { all: [NACHSPIEL, ENDE_MEER, GERETTET, { notFlag: 'jimmy_kommentar_ende' }] }),
    rede('jimmy-tag-ende-nexus', { all: [NACHSPIEL, ENDE_NEXUS, GERETTET, { notFlag: 'jimmy_kommentar_ende' }] }),
    rede('jimmy-tag-lieferdienst', { all: [NACHSPIEL, GERETTET, { quest: 'side-strandclub', state: 'done' }, { weekday: 'so' }, { time: 'abend' }] }),
    rede('jimmy-tag-akt2', { all: [AKT2, GERETTET, { notFlag: 'jimmy_kommentar_akt2' }] }),
    rede('jimmy-tag-aria-zurueck', { all: [AKT2, GERETTET, ARIA_ZURUECK, { notFlag: 'jimmy_kommentar_aria_zurueck' }] }),
    rede('jimmy-tag-proband', { all: [AKT2, GERETTET, { flag: 'proband_gechippt' }, { notFlag: 'jimmy_kommentar_proband' }] }),
    rede('jimmy-tag-nyra-weg', { all: [AKT2, GERETTET, NYRA_IM_TURM, { notFlag: 'jimmy_kommentar_nyra' }] }),
    rede('jimmy-tag-dante-crew', { all: [AKT2, GERETTET, DANTE_CREW, { notFlag: 'jimmy_kommentar_dante' }] }),
    rede('jimmy-tag-aria-weg', { all: [AKT2, GERETTET, ARIA_WEG] }),
    rede('jimmy-tag-party-bereit', { all: [AKT2, GERETTET, PARTY_BEREIT] }),
    rede('jimmy-tag-botenstand', { all: [AKT2, GERETTET, { time: 'tag' }] }),
    rede('jimmy-tag-a2-werkstatt', { all: [AKT2, GERETTET, { time: 'morgen' }] }),
    rede('jimmy-tag-a2-club', { all: [AKT2, GERETTET, { time: 'abend' }] }),
    rede('jimmy-tag-a2-couch', { all: [AKT2, GERETTET, { time: 'nacht' }] }),
  ];

  const schedule: ScheduleEntry[] = [
    { when: JIMMY_IM_TURM, place: { map: 'quantum-labor', at: 'probanden-liege' }, dialogue: 'jimmy-tag-gechippt' },
    { when: JIMMY_WACHT_AUF, place: { map: 'dantes-werkstatt', at: 'jimmy-hocker' }, dialogue: 'jimmy-erwacht' },
    { when: PARTYNACHT, place: 'away' },
    { when: { all: [MASTER, GERETTET] }, place: { map: 'bahnhof-mitte', at: 'bahnsteig-ende' }, dialogue: 'jimmy-tag-master' },
    { slot: 'abend', days: ['so'], when: { all: [NACHSPIEL, GERETTET, { quest: 'side-strandclub', state: 'done' }] }, place: { map: 'das-meer', at: 'strandclub-bar' }, dialogue: 'jimmy-tag-lieferdienst' },
    // Akt 2: tagsüber Botendienste am Schrottmarkt statt unterwegs.
    { slot: 'tag', when: { all: [AKT2, GERETTET] }, place: { map: 'schrottmarkt', at: 'botenstand' } },
  ];

  const phone = {
    'tel-jimmy-chrome10': {
      id: 'tel-jimmy-chrome10', from: 'jimmy',
      text: 'Hallo! Hier ist Jimmy. Kein Werbeanruf. Ich wollte nur sagen: Falls dir heute jemand was GRATIS anbietet, sag nein. Sag einfach nein. Ich übe das gerade. Nein. Nein. Siehst du? Klappt schon.',
      auto: { all: [AKT2, GERETTET, { hearts: 'jimmy', min: 2 }] },
      replies: [{ text: 'Nein. Klappt bei mir auch.', effects: [herz('jimmy', 5)] }, { text: 'Was, wenn es Nudeln sind?' }],
    },
    'tel-jimmy-fluchtwagen': {
      id: 'tel-jimmy-fluchtwagen', from: 'jimmy',
      text: 'Fluchtwagen meldet: vollgetankt, Reifen poliert, Schild gemalt. Ich warte am Lieferhof. Ich geh nicht weg. Ich bin sehr gut im Warten. Viel Glück. Das ist kein Werbespruch.',
      auto: { all: [PARTY_BEREIT, GERETTET] },
    },
    'tel-jimmy-erwacht': {
      id: 'tel-jimmy-erwacht', from: 'dante',
      text: 'Jimmy ist wach. Der echte. Sitzt bei mir in der Werkstatt mit Kakao und fragt nach dir. Komm vorbei, bevor er anfängt, meine Schrauben nach Farbe zu sortieren. – D.',
      auto: JIMMY_WACHT_AUF,
    },
  };

  return { dialogues, talk, schedule, phone };
}

