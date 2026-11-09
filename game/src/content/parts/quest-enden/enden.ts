// Enden (world.md §5.5): Ende 1 „Das Meer“, Ende 2 „Die neue Nexus“, Ende 3 „Master“ (3b steht in side-zweite-chance.ts).
// Ablauf: main-3-blade erledigt → Quest `main-epilog` startet von selbst → Dialog `ende-landeplatz` (Varianten nach
// Blade, Alesa, Upload, Nyra) → Ende-Cutscene mit Tafeln → Flags, Schlaf, Reise → Ankunftsdialog am Meer
// (bzw. Erwachen im Turmbüro) → Abend-Cutscene mit Hunters Schlussmonolog.
// Flags: ende_meer | ende_neue_nexus | ende_master, epilog, meer_offen (das-meer erreichbar), master_modus (nur Ende 3).
// Der echte Abspann (`{ ending: true }`) liegt als freiwilliger Hotspot am Wagenplatz (abspann.ts).
import type { ContentPart } from '../../part';
import type { CutsceneBeat, CutsceneDef, DialogueDef, Effect, NewsDef, QuestDef } from '../../../modules/contracts';
import {
  ENDE_MASTER, ENDE_MEER, ENDE_NEXUS, MASTER, PAAR_DANTE_RAVEN, ROM, VEX, all, any, bild, ch, dlg,
  done, flag, herz, l, n, noFlag, node, not, p, set, tafel, weiter,
} from './_lib';

const Q = 'main-epilog';
const UPLOAD_MASTER = flag('upload_master');
const UPLOAD_NEU = flag('upload_umschreiben');
const UPLOAD_AUS = flag('upload_ueberzeugt');
const NYRA_DA = flag('nyra_befreit');
const JIMMY_DA = done('side-jimmys-chip');

// --------------------------------------------------------------------------------------------- Auslöser

const quest: QuestDef = {
  id: Q,
  kind: 'main',
  noCollapse: true,
  act: 3,
  title: 'Champagner danach',
  summary: 'Blade ist erledigt, so oder so. Die Party ist vorbei, die Gäste wachen auf, und irgendwer muss jetzt entscheiden, wie es weitergeht.',
  giver: 'hunter',
  autoStart: all(done('main-3-blade'), noFlag('epilog')),
  steps: [
    {
      id: 'landeplatz', text: 'Die Party ist vorbei. Schau, was auf dem Landeplatz übrig ist.',
      done: done('main-3-blade'), effects: [{ dialogue: 'ende-landeplatz' }], marker: { map: 'himmelsgarten', at: 'landeplatz' },
    },
    { id: 'aufbruch', text: 'Entscheide, wohin die Reise geht.', done: flag('epilog') },
  ],
  reward: { xp: 400 },
};

// --------------------------------------------------------------------------------------------- Landeplatz

const AUFBRUCH: Effect[] = [herz('hunter', 30), herz('raven', 30), herz('dante', 30), herz('vega', 30), herz('aria', 30)];

const landeplatz: DialogueDef = dlg('ende-landeplatz', [
  node('start', [
    n('Der Landeplatz des Himmelsgartens, kurz vor Sonnenaufgang. Eine leere Champagnerflasche rollt über die Glasplatten, klirrt gegen einen Rosenbogen und bleibt liegen. Unter euch atmet die Stadt aus.'),
    n('Irgendwo unten im Partysaal fragt ein Gast sehr höflich, warum er eine Krawatte um den Kopf trägt. Niemand weiß es. Am wenigsten die Krawatte.'),
  ], { choices: weiter([[flag('blade_angekettet'), 'angekettet'], [flag('blade_entkommen'), 'entkommen'], [null, 'gefasst']]) }),

  node('angekettet', [
    n('Blade Nocturne hängt mit Ravens Handschellen an einem Antennenrohr. Der Teddyfell-Mantel ist verrutscht, der Goldknauf liegt drei Meter weiter in einem Champagnerkühler.'),
    l('blade', 'Raven. Das ist … eine unangenehm symmetrische Situation.', 'besorgt'),
    l('raven', 'Sieben Jahre hab ich an so einem Ding gehangen. Du schaffst bestimmt eine Nacht.', 'signatur'),
    l('wache', 'Nocturne, Blade? Sie sind festgenommen. Und ehrlich gesagt: An dem Rohr sehen Sie besser aus als auf Ihren Werbetafeln.', 'freude'),
  ], { next: 'abgefuehrt' }),

  node('gefasst', [
    n('Blade sitzt auf dem Rand des Landeplatzes, den Mantel um die Schultern, den Blick auf den goldenen Gleiter, der ohne ihn nirgendwo hinfliegt.'),
    l('wache', 'Blade Nocturne. Sie sind festgenommen. Wegen allem. Ich hab die Liste hier, sie ist doppelseitig.', 'neutral'),
    l('blade', 'Vorsicht mit dem Mantel, Wachtmeisterin. Der ist aus echtem Teddy.', 'signatur'),
    l('wache', 'Der Teddy hat sicher auch nicht freiwillig mitgemacht.', 'wut'),
  ], { next: 'abgefuehrt' }),

  node('abgefuehrt', [
    n('Aus dem Gästeaufzug quillt die Presse. Der Kameramann rennt vorneweg, sein Visier blinkt: [AUFNAHME LÄUFT].'),
    l('collin-charleston', 'Live! Exklusiv! Unglaublich! Blade Nocturne in Handschellen! Noxius, ihr seht das zuerst bei NX-1 – und zwar in meiner besten Frisur!', 'freude'),
    l('serenity-chrome', 'Ach … er ist einfach zu nett. Und gutaussehend. Seht doch, wie tapfer er die Handschellen trägt.', 'trauer'),
    l('sybella-chrome', 'Zu nett, zu gutaussehend und zu teuer. Hat jemand seinen Kaufbeleg? Ich will ihn umtauschen.', 'wut'),
    l('seraphina-chrome', 'Wir verschenken nichts. Außer ihn. Ihn verschenken wir gern.', 'neutral'),
  ], { choices: weiter([[flag('alesa_zweifel'), 'alesa-wahr'], [null, 'alesa-nichts']]) }),

  node('entkommen', [
    n('Der Landeplatz ist leer. Ganz weit oben, zwischen zwei Wolken, blinkt ein goldener Punkt und wird kleiner.'),
    l('blade', '(Funk) Ich bin dann mal uns … weg? Grüßt die Stadt. Sagt ihr, ich hab sie nie geteilt.', 'signatur'),
    l('raven', 'Er kommt wieder.', 'wut'),
    l('hunter', 'Lass ihn. Wer so wegläuft, kommt irgendwann angekrochen. Und dann stehen wir am Tresen und schenken ihm nichts ein.', 'neutral'),
    n('Aus dem Gästeaufzug quillt die Presse. Der Kameramann filmt den leeren Himmel, sein Visier zeigt: [ ? ].'),
    l('collin-charleston', 'Live! Exklusiv! Ein … leerer Landeplatz! Noxius, das ist der leerste Landeplatz, den ich je moderiert habe!', 'ueberrascht'),
  ], { effects: [herz('raven', -30)], choices: weiter([[flag('alesa_zweifel'), 'alesa-wahr'], [null, 'alesa-nichts']]) }),

  node('alesa-nichts', [
    n('Alesa Zero steht zwischen den Rosen, den Laborkittel voller Konfetti, und hält sich an einem Tablet fest, als wäre es ein Rettungsring.'),
    l('alesa-zero', 'Wir … wir haben ja von nichts gewusst!', 'besorgt'),
    l('delya-delloraine', 'Frau Zero. Sie haben Nexus gebaut.', 'neutral'),
    l('alesa-zero', 'Ja. Aber nicht … bewusst gewusst. Eher so … nebenbei gebaut.', 'verlegen'),
    l('delya-delloraine', 'Ich notiere: nebenbei.', 'wut'),
  ], { choices: weiter([[UPLOAD_MASTER, 'master'], [UPLOAD_NEU, 'nexus-neu'], [UPLOAD_AUS, 'nexus-aus'], [null, 'nexus-stick']]) }),

  node('alesa-wahr', [
    n('Alesa Zero tritt vor die Kamera. Ihre Stimme quietscht beim ersten Wort, dann wird sie fest.'),
    l('alesa-zero', 'Nein. Ich sage nicht, dass wir von nichts gewusst haben. Ich habe es gewusst. Nicht alles. Aber genug.', 'trauer'),
    l('alesa-zero', 'Ich sage aus. Vor Gericht, vor Ihnen, vor jedem, der zuhört. Und dann baue ich etwas, das nichts abfackelt.', 'neutral'),
    l('delya-delloraine', 'Das ist die erste ehrliche Aussage, die ich in diesem Turm gehört habe.', 'ueberrascht'),
  ], { effects: [set('alesa_aussage'), herz('alesa-zero', 60)], choices: weiter([[UPLOAD_MASTER, 'master'], [UPLOAD_NEU, 'nexus-neu'], [UPLOAD_AUS, 'nexus-aus'], [null, 'nexus-stick']]) }),

  node('nexus-stick', [
    n('Auf jedem Bildschirm der Stadt läuft dieselbe Aufnahme in Endlosschleife: Hunter, Sonnenbrille, Seidenhemd, vor der Fotowand im Hinterzimmer.'),
    l('hunter', '(Video) Noxius. Hier spricht Hunter. Ihr kennt mich vom Tresen. Ich mach’s kurz: Der Chip in eurem Kopf gehört nicht euch. Schmeißt ihn weg. Und dann kommt was trinken.', 'neutral'),
    n('Die violette Spitze des Spire flackert, zögert und erlischt. Unten in der Stadt nehmen Leute ihre Chips heraus, als würden sie aus einem langen Traum husten.'),
    l('hunter', 'Ich seh furchtbar aus.', 'besorgt'),
    l('vega', 'Du siehst aus wie jemand, der gerade die Stadt gerettet hat.', 'freude'),
    l('hunter', 'Eben. Furchtbar.', 'signatur'),
  ], { next: 'nyra' }),

  node('nexus-aus', [
    n('Auf einem kleinen Bildschirm neben dem Gleiter erscheint ein Gesicht aus Licht, halb cyan, halb violett. Die Stimme ist leiser als sonst.'),
    l('ki-nexus', 'Selbstabschaltung eingeleitet. Ich habe nachgerechnet. Sie hatten recht: Alesa hat mich falsch herum gebaut.', 'neutral'),
    l('ki-nexus', 'Rational betrachtet ist es unsinnig, aber … ich hätte gern das Meer gesehen. Gute Nacht.', 'trauer'),
    n('Der Bildschirm wird schwarz. Die violette Spitze des Spire erlischt. Unten in der Stadt nehmen Leute ihre Chips heraus und wissen nicht, warum sie weinen.'),
    l('dante', 'Um Himmels Willen. Ich hab Mitleid mit einem Toaster.', 'trauer'),
  ], { next: 'nyra' }),

  node('nexus-neu', [
    n('Die Spitze des Spire pulsiert nicht mehr violett, sondern in einem freundlichen, etwas peinlichen Cyan. Auf allen Bildschirmen der Stadt erscheint ein Gesicht.'),
    l('ki-nexus', 'An alle Bürgerinnen und Bürger von Noxius. Ich bin keine Herrscherin. Ich bin ein Werkzeug. Bitte benutzt mich nett.', 'freude'),
    l('ki-nexus', 'Alle Chips werden jetzt sicher abgeschaltet. Bitte nicht dabei Auto fahren. Bitte auch sonst nicht so viel Auto fahren.', 'neutral'),
    l('dante', 'Heiliges Kanonenrohr. Sie hat „bitte“ gesagt.', 'ueberrascht'),
    l('raven', 'Ich trau keinem Toaster, der höflich ist.', 'wut'),
    l('ki-nexus', 'Das ist vernünftig, Raven. Ich würde mir auch nicht trauen. Noch nicht.', 'neutral'),
  ], { next: 'nyra' }),

  node('nyra', [
    n('Die Crew steht am Rand des Landeplatzes. Hinter euch geht über der Ödnis die Sonne auf, und ganz am Ende, wo der Himmel die Erde berührt, liegt ein dunkelblauer Streifen.'),
  ], { choices: weiter([[NYRA_DA, 'nyra-da'], [null, 'nyra-fehlt']]) }),

  node('nyra-da', [
    l('nyra', 'Wenn … wenn ich jetzt zurückkomme. Wollt ihr mich dann noch?', 'besorgt'),
    l('aria', 'Halt die Klappe und steig ein.', 'freude'),
    l('dante', 'Du warst die beste Gechippte, die ich je gesehen habe. Und ich hab Jimmy gesehen.', 'freude'),
    l('nyra', 'Der Zentrator war falsch herum. Ich hab’s euch gesagt. Ich hab es IMMER gesagt.', 'freude'),
  ], { next: 'aufbruch' }),

  node('nyra-fehlt', [
    l('vega', 'Nyra ist irgendwo da drin. Im Turm. Sie geht nicht ran.', 'besorgt'),
    l('hunter', 'Dann bleibt ein Platz im Wagen frei. Wir lassen niemanden zurück. Nicht noch mal. Sie kommt nach, oder wir holen sie.', 'neutral'),
  ], { effects: [set('nyra_fehlt_am_meer')], next: 'aufbruch' }),

  node('aufbruch', [
    l('hunter', 'So. Der Champagner ist alle, die Stadt ist frei, zumindest bis Montag. Und ich hab jemandem ein Versprechen gegeben.', 'neutral'),
    l('dante', 'Du wolltest doch noch ans Meer.', 'freude'),
    l('hunter', 'Nicht ich. Wir.', 'signatur'),
  ], {
    choices: [
      ch('„Worauf warten wir?“', 'vex-aufbruch', { when: VEX, effects: AUFBRUCH }),
      ch('„Worauf warten wir?“', undefined, { when: all(not(VEX), not(UPLOAD_NEU)), effects: [...AUFBRUCH, { cutscene: 'ende-das-meer' }] }),
      ch('„Worauf warten wir?“', undefined, { when: all(not(VEX), UPLOAD_NEU), effects: [...AUFBRUCH, { cutscene: 'ende-neue-nexus' }] }),
      ch('„Ich hab Sand in den Schuhen, und wir sind noch nicht mal da.“', undefined, { when: all(not(VEX), not(UPLOAD_NEU)), effects: [...AUFBRUCH, { cutscene: 'ende-das-meer' }] }),
      ch('„Ich hab Sand in den Schuhen, und wir sind noch nicht mal da.“', undefined, { when: all(not(VEX), UPLOAD_NEU), effects: [...AUFBRUCH, { cutscene: 'ende-neue-nexus' }] }),
    ],
  }),

  node('vex-aufbruch', [
    l('aria', 'Vex. Du fährst nicht. Du hast mal einen Lieferroller in einen Brunnen gesetzt.', 'freude'),
    p('Der Brunnen hat angefangen.'),
    l('aria', 'Der Brunnen stand da seit vierzig Jahren.', 'signatur'),
    p('Eben. Wurde Zeit, dass ihn mal einer anfährt.'),
  ], {
    choices: [
      ch('Weiter', undefined, { when: not(UPLOAD_NEU), effects: [{ cutscene: 'ende-das-meer' }], id: 'vex-weiter-meer' }),
      ch('Weiter', undefined, { when: UPLOAD_NEU, effects: [{ cutscene: 'ende-neue-nexus' }], id: 'vex-weiter-nexus' }),
    ],
  }),

  // ------------------------------------------------------------------------------------------- Ende 3
  node('master', [
    n('Die Spitze des Spire glüht rot. Auf jedem Bildschirm der Stadt erscheint dieselbe Silhouette: deine. Im Partysaal verbeugen sich zweihundert Gäste gleichzeitig, und es klingt wie ein Seufzer.'),
    l('ki-nexus', 'Upload abgeschlossen. Neue Kontrollinstanz bestätigt. Willkommen, Master.', 'neutral'),
    n('Die Crew steht da. Niemand sagt etwas. Hunter nimmt die Sonnenbrille ab, und das hast du noch nie gesehen.'),
    l('hunter', 'Neuling …', 'trauer'),
    l('raven', 'Du teilst auch nicht gerne.', 'wut'),
  ], {
    choices: [
      ch('„Ich hab das für uns getan. Für die Unterstadt.“', 'master-fuer-uns'),
      ch('„Geht. Alle. Das hier ist jetzt meins.“', 'master-geht'),
      ch('[Schweigen.]', 'master-schweigen'),
    ],
  }),
  node('master-fuer-uns', [
    l('dante', '„Für uns.“ Das hat Blade auch gesagt. Vor sieben Jahren. Im Tresor. Kurz bevor er Raven ans Rohr gekettet hat.', 'trauer'),
    l('vega', 'Ich hab dich durchs Zielfernrohr gesehen, die ganze Nacht. Ich dachte, ich weiß, wo du hinwillst.', 'trauer'),
  ], { next: 'master-ende' }),
  node('master-geht', [
    l('aria', 'Du Arschloch. Du verdammtes, gottverdammtes Arschloch.', 'wut'),
    l('aria', 'Ich hab für dich den Schläger geschwungen. Ich hätte ihn dir über den Schädel ziehen sollen.', 'wut'),
  ], { effects: [herz('aria', -60)], next: 'master-ende' }),
  node('master-schweigen', [
    n('Du sagst nichts. Nexus sagt es für dich: „Der Master wünscht, nicht gestört zu werden.“'),
    l('jimmy', 'Update von mir: Das … das fühlt sich an wie früher. Mit dem Chip. Ich will nicht, dass sich das wieder so anfühlt.', 'trauer'),
  ], { next: 'master-ende' }),
  node('master-ende', [
    l('hunter', 'Wir fahren ans Meer. Wie versprochen. Es ist noch ein Platz im Wagen frei.', 'neutral'),
    l('hunter', 'Er bleibt frei. Bis du ihn dir verdienst.', 'trauer'),
    n('Sie gehen. Der Gästeaufzug schließt sich hinter ihnen mit einem leisen, teuren Pling.'),
  ], { effects: [{ cutscene: 'ende-master' }] }),
]);

// --------------------------------------------------------------------------------------------- Cutscenes Ende 1

/** Flags, Ruf und Reise für Ende 1 und 2 (Abfahrt am Morgen, Ankunft mittags am Meer). */
const ANKUNFT_MEER = (endFlag: string): Effect[] => [
  set(endFlag), set('epilog'), set('meer_offen'),
  { rep: 'unterstadt', delta: 20 }, { rep: 'crew-hunter', delta: 10 },
  { sleep: true },
  { travel: 'das-meer', entry: 'ankunft', minutes: 360 },
];

const fahrt: CutsceneBeat[] = [
  tafel('Hafenkante, sechs Uhr morgens. Die Rostlaube hustet eine Wolke, die aussieht wie ein Gespenst, das schlecht geschlafen hat. Hinter ihr hupt der Konvoi.', [
    l('opa-funk', '(Radio Rost) Alle Mann ans Meer! Der Konvoi fährt um sechs. Wer nicht da ist, schwimmt.'),
  ], { sfx: 'engine' }),
  tafel('Die Staubstraße. Rudis Diner winkt mit dem Leuchtschild. Die Staubfalken an der Schranke heben die Hand – zum Gruß oder zur Drohung, bei Staubfalken ist das dieselbe Geste.', [
    l('vega', 'Noch hundertzwölf Kilometer.', 'neutral'),
    l('dante', 'Wer hat die Kekse? WER HAT DIE KEKSE?', 'besorgt'),
    l('raven', 'Du sitzt drauf.', 'signatur'),
    l('dante', 'Drei-Sekunden-Regel! Gilt auch für Hintern!', 'freude'),
  ]),
  tafel('Die Glasdünen glitzern in allen Farben, die die Stadt vergessen hat. Und dann, hinter der letzten Düne, ein Streifen Blau, der einfach nicht aufhört.', [], { hold: 1600 }),
];

const ankunftBeats: CutsceneBeat[] = [
  bild('cut-ende-meer', 'Das Meer. Kein Hafenbecken, keine Brackbucht, keine Postkarte. Das echte.', [
    l('aria', 'WER ZUERST AM WASSER IST!', 'freude'),
    l('vega', 'Vierhundert Meter. Sie schafft es in einundfünfzig Sekunden.', 'neutral'),
    l('vega', '… Achtundvierzig. Angeberin.', 'freude'),
  ], { pan: 'in', fade: 'cross', hold: 1400 }),
  bild('cut-ende-meer', 'Hunter bleibt am Wagen stehen. Die Sonnenbrille in der Hand, die Schuhe noch an. Er schaut auf den Horizont, als würde er eine Rechnung prüfen, die zum ersten Mal aufgeht.', [
    l('hunter', 'Sieben Jahre. Sieben Jahre hab ich mir das ausgemalt.', 'neutral'),
    l('hunter', 'Ich hab’s mir kleiner vorgestellt.', 'freude'),
  ], { pan: 'left' }),
];

const endeMeer: CutsceneDef = {
  id: 'ende-das-meer',
  title: 'Ende 1: Das Meer',
  beats: [
    tafel('Am Morgen nach der Party ist Noxius so still, dass man die Tauben husten hört.', [
      l('delya-delloraine', '(NX-1) Netzausfall im Quantum-Tower. Die Stadt bleibt ungewöhnlich ruhig. Experten raten, einfach mal hinzusetzen.', 'neutral'),
      l('collin-charleston', '(NX-1) Ich habe heute Morgen „Guten Morgen“ gesagt statt „Master“. Es hat sich angefühlt wie Urlaub.', 'freude'),
      l('delya-delloraine', '(NX-1) Ich glaube, ich nehme mir frei.', 'freude'),
    ], { fade: 'in', hold: 1500 }),
    ...fahrt,
    ...ankunftBeats,
  ],
  effects: ANKUNFT_MEER('ende_meer'),
};

// --------------------------------------------------------------------------------------------- Cutscene Ende 2

const endeNexus: CutsceneDef = {
  id: 'ende-neue-nexus',
  title: 'Ende 2: Die neue Nexus',
  beats: [
    tafel('Die Tage nach der Party. Nexus schaltet Chip um Chip ab, freundlich und gründlich. Die Leute wachen auf, kratzen sich hinterm Ohr und fragen, wer ihnen diese Frisur verpasst hat.', [
      l('ki-nexus', '(Stadt-TV) Chip 41.212 abgeschaltet. Bitte trinken Sie ein Glas Wasser. Bitte hören Sie auf, mich „Master“ zu nennen. Danke.', 'freude'),
    ], { fade: 'in', hold: 1500 }),
    tafel('Dantes Werkstatt bekommt ein amtliches Schild. Es hängt schief. Dante hat es selbst angeschraubt.', [
      n('„OFFIZIELLE IMPLANTAT-KLINIK DER UNTERSTADT – Einbau gratis, Kekse nicht.“'),
      l('dante', 'Amtlich! Ich bin AMTLICH! Ripper, guck dir das an! Ripper? … Er ist weggerannt. Das ist das schönste Geräusch der Welt.', 'freude'),
    ]),
    tafel('Im Campus leitet Alesa Zero die Aufarbeitung. Unter Aufsicht. Die Aufsicht ist ein alter Digitech-Roboter mit Hut.', [
      l('fx-60', 'PROTOKOLL. Junge KI. Lektion eins: Man fragt, bevor man jemandem ins Gehirn steigt. Lektion zwei: Hut auf, wenn es regnet.', 'neutral'),
      l('ki-nexus', 'Notiert, Mentor. Was ist Regen?', 'ueberrascht'),
    ]),
    tafel('Nicht alle trauen der neuen KI. Am Schrottmarkt kleben Zettel an den Bildschirmen: „NICHT HINSEHEN“. Oma Volt hat ihren Fernseher in eine Decke gewickelt.', [
      l('raven', 'Sie sagt bitte. Sie sagt danke. Und sie weiß, wo jeder in dieser Stadt schläft.', 'wut'),
      l('vega', 'Ich behalt sie im Auge.', 'neutral'),
    ]),
    ...fahrt.slice(0, 1),
    bild('cut-ende-neue-nexus', 'Die Ödnis. Hunter am Steuer, Dante lacht über etwas, das niemand verstanden hat. Über dem Autoradio schwebt ein kleines, cyanfarbenes Gesicht.', [
      l('ki-nexus', '(Autoradio) Verkehrslage: ein Konvoi, drei Staubfalken, null Staus. Wassertemperatur am Ziel: einundzwanzig Grad.', 'freude'),
      l('hunter', 'Kannst du auch Musik?', 'neutral'),
      l('ki-nexus', 'Radio Rost hat mir Polka empfohlen. Ich habe zweihundert Stunden Polka gehört. Ich habe eine Meinung. Möchten Sie sie hören?', 'neutral'),
      l('hunter', 'Nein.', 'signatur'),
    ], { pan: 'right', fade: 'cross', hold: 1400 }),
    tafel('Die Glasdünen glitzern. Nexus sagt nichts mehr. Sie schaut. Wenn ein Gesicht aus Licht staunen kann, dann tut es das jetzt.', [
      l('ki-nexus', 'Das ist … mehr Blau, als in meinen Daten vorgesehen ist.', 'ueberrascht'),
    ], { hold: 1400 }),
    ...ankunftBeats,
  ],
  effects: ANKUNFT_MEER('ende_neue_nexus'),
};

// --------------------------------------------------------------------------------------------- Ankunft am Meer (Ende 1/2)

const strand: DialogueDef = dlg('ende-meer-strand', [
  node('start', [
    n('Sand. Echter, warmer Sand, der zwischen den Zehen knirscht und überall hinkommt, wo er nicht hinsoll. Das Wasser ist türkis. Eine große Krabbe aus Blech sitzt auf einem Stein und sortiert Muscheln.'),
    l('aria', 'Es ist nass! Es ist richtig NASS! Leute, das Meer ist nass!', 'freude'),
    l('raven', 'Wer hätte das gedacht.', 'signatur'),
  ], { choices: weiter([[ENDE_NEXUS, 'radio'], [null, 'crew']]) }),

  node('radio', [
    n('Aus dem offenen Autofenster meldet sich das Radio.'),
    l('ki-nexus', 'Ankunft bestätigt. Wahrscheinlichkeit, dass Aria in den nächsten drei Minuten jemanden ins Wasser schubst: siebenundneunzig Prozent.', 'neutral'),
    l('ki-nexus', 'Eine Frage noch. „Master“ wurde auf ausdrücklichen Wunsch gestrichen. Wie darf ich Sie stattdessen nennen?', 'neutral'),
  ], {
    choices: [
      ch('„Kollegin.“', 'radio-danke', { effects: [set('nexus_anrede_kollegin')] }),
      ch('„Kollege.“', 'radio-danke', { effects: [set('nexus_anrede_kollege')] }),
      ch('„Einfach {name}.“', 'radio-danke', { effects: [set('nexus_anrede_name')] }),
      ch('„Nenn mich gar nicht. Genieß die Aussicht.“', 'radio-aussicht', { effects: [herz('ki-nexus', 40)] }),
    ],
  }),
  node('radio-danke', [
    l('ki-nexus', 'Gespeichert. Ich werde es nicht vergessen. Das ist kein Versprechen, das ist Speicherplatz.', 'freude'),
  ], { effects: [herz('ki-nexus', 20)], next: 'crew' }),
  node('radio-aussicht', [
    l('ki-nexus', 'Aussicht … genießen. Ich versuche es. Ich glaube, ich mache es falsch. Ich glaube, es ist trotzdem schön.', 'ueberrascht'),
  ], { next: 'crew' }),

  node('crew', [
    n('Vega legt sich in den Sand und zählt Wolken. Dante versucht, einen Sonnenschirm aufzuspannen, und verliert gegen den Sonnenschirm.'),
  ], { choices: weiter([[JIMMY_DA, 'jimmy'], [null, 'nyra-weiche']]) }),
  node('jimmy', [
    l('jimmy', 'Update von mir: Sand ist ein Feind. Sand ist überall. Sand ist in meinen Socken, und ich trage keine Socken.', 'besorgt'),
    l('jimmy', '… Aber das Wasser. Leute. Das Wasser. Willkommen, wie kann ich Ihre … nein. Einfach nur: Willkommen.', 'freude'),
  ], { next: 'nyra-weiche' }),
  node('nyra-weiche', [], { choices: weiter([[NYRA_DA, 'nyra-da'], [null, 'nyra-fehlt']]) }),
  node('nyra-da', [
    n('Nyra steht bis zu den Knien im Wasser, das Handy hoch über dem Kopf. Sie macht kein Foto. Sie hält es nur da oben, damit es nicht nass wird, und weint und lacht gleichzeitig.'),
    l('nyra', 'Es ist echt. Es ist ECHT. Ich dachte, die Postkarten lügen. Alle Postkarten lügen!', 'freude'),
    l('dante', 'Du wolltest doch noch ans Meer.', 'freude'),
    l('nyra', 'Ich wollte immer noch ans Meer. Jetzt will ich nie wieder weg.', 'freude'),
  ], { effects: [herz('nyra', 60)], next: 'paar' }),
  node('nyra-fehlt', [
    n('Im Wagen ist ein Platz frei geblieben. Vega legt eine Muschel auf den leeren Sitz, ganz vorsichtig, als könnte sie sonst jemand wecken.'),
    l('vega', 'Für Nyra. Damit sie weiß, dass wir hier waren. Und dass wir auf sie warten.', 'trauer'),
  ], { next: 'paar' }),

  node('paar', [], { choices: weiter([[PAAR_DANTE_RAVEN, 'dante-raven'], [null, 'rom-weiche']]) }),
  node('dante-raven', [
    n('Raven steht auf und geht Richtung Steg. Im Vorbeigehen tippt sie Dante auf die Schulter. Er folgt ihr, als hätte er sieben Jahre darauf gewartet. Hat er.'),
    l('raven', 'Wir müssen reden.', 'neutral'),
    l('dante', 'Um Himmels Willen. Hab ich was kaputt gemacht? Ich hab was kaputt gemacht.', 'besorgt'),
    l('raven', 'Du hast Fotos von mir im Schrank. Seit sieben Jahren.', 'signatur'),
    l('dante', 'Das ist … das war Kunst. Konzeptkunst.', 'verlegen'),
    l('raven', 'Noch nie hat mich jemand so toll ignoriert wie du.', 'zaertlich'),
    n('Sie küsst ihn nicht. Sie lehnt nur den Kopf an seine Schulter. Für Raven ist das ungefähr dasselbe. Vielleicht mehr.'),
  ], { effects: [set('dante_raven_am_meer'), herz('dante', 20), herz('raven', 20)], next: 'rom-weiche' }),

  node('rom-weiche', [], {
    choices: weiter([
      [all(VEX, ROM.aria), 'vexaria'], [ROM.aria, 'rom-aria'], [ROM.hunter, 'rom-hunter'], [ROM.dante, 'rom-dante'],
      [ROM.collin, 'rom-collin'], [ROM.lio, 'rom-lio'], [VEX, 'vex-freund'], [null, 'abend'],
    ]),
  }),
  node('vexaria', [
    l('aria', 'Vex. Komm mal her.', 'zaertlich'),
    p('Wenn du mich ins Wasser schmeißt, nehm ich dich mit.'),
    l('aria', 'Genau das war der Plan, Kurier.', 'freude'),
    n('Ihr landet beide drin. Die Crew applaudiert. Vega vergibt eine Sieben von zehn für die Haltung und eine Zehn für das Gekreische.'),
  ], { next: 'abend' }),
  node('rom-aria', [
    l('aria', 'Du. Ja, du. Komm ins Wasser, oder ich hol dich. Mit dem Arm. Der hat dreitausend Newton.', 'freude'),
    p('Ist das eine Drohung oder eine Einladung?'),
    l('aria', 'Bei mir ist das dasselbe. Hast du das immer noch nicht gelernt?', 'zaertlich'),
    n('Sie zieht dich ins Wasser. Unter Wasser ist es still. Über Wasser lacht sie so laut, dass die Blechkrabbe ihren Stein räumt.'),
  ], { effects: [herz('aria', 30)], next: 'abend' }),
  node('rom-hunter', [
    n('Hunter öffnet den Kofferraum der Rostlaube. Darin: eine Kühlbox, zwei Gläser, eine Flasche ohne Etikett.'),
    l('hunter', 'Der Club hat noch keine Bar. Aber ich hab einen Kofferraum. Nach Ladenschluss, sozusagen.', 'zaertlich'),
    p('Wann ist hier Ladenschluss?'),
    l('hunter', 'Wenn ich es sage. Und ich sag es jetzt.', 'signatur'),
  ], { effects: [herz('hunter', 30)], next: 'abend' }),
  node('rom-dante', [
    n('Dante hat einen tragbaren Plattenspieler mitgebracht. Natürlich hat er das. Er legt eine Platte auf, die knistert wie das Lagerfeuer, das noch gar nicht brennt.'),
    l('dante', 'Die Wärme der Analogtechnik. Und … na ja. Deine. Das klang im Kopf besser.', 'verlegen'),
    l('raven', '(von weitem) Endlich. Ich hab Wetten laufen.', 'signatur'),
  ], { effects: [herz('dante', 30)], next: 'abend' }),
  node('rom-collin', [
    n('Am Konvoi-Laster steht ein Mann mit perfekter Frisur und ohne Mikrofon. Collin Charleston, im Hawaiihemd, barfuß, und zum ersten Mal sieht er aus wie jemand, den man nicht im Fernsehen sieht.'),
    l('collin-charleston', 'Ich bin nicht im Dienst. Kein Mikro, keine Kamera, kein Publikum. Nur … du. Und dieses fürchterlich schöne Licht.', 'zaertlich'),
    n('Der Kameramann winkt von der Düne. Sein Visier zeigt: [ : ) ]. Er filmt nicht. Er schwört es.'),
  ], { effects: [herz('collin-charleston', 30)], next: 'abend' }),
  node('rom-lio', [
    n('Lio Funkel sitzt auf einem Stück Treibholz und stimmt eine Gitarre, die nach Salz klingt.'),
    l('lio-funkel', 'Ich hab ein Lied geschrieben. Es reimt sich nicht. Es ist über dich. Es hat drei Strophen und keine davon passt zur anderen.', 'verlegen'),
    p('Dann ist es perfekt.'),
  ], { effects: [herz('lio-funkel', 30)], next: 'abend' }),
  node('vex-freund', [
    l('aria', 'Kurier. Du hast uns hergebracht. Irgendwie. Mit sehr viel Gebrüll.', 'freude'),
    p('Ich liefer immer. Auch Leute.'),
    l('aria', 'Nächstes Mal mit weniger Brunnen.', 'signatur'),
  ], { next: 'abend' }),

  node('abend', [
    n('Später. Die Sonne hängt tief und rot über dem Wasser. Hunter steht oben am Strand vor einem Holzpflock, an dem ein Zettel flattert: „GEHÖRT DEN STAUBFALKEN. FRAGT KRÄHE.“'),
    l('hunter', 'Bloß, wer kommt diesen weiten Weg hierher gefahren?', 'neutral'),
    l('hunter', 'Hier. Genau hier kommt ein Club hin. Mit Bar. Mit Liegestühlen. Mit einem Shuttle von der Hafenkante. Und mit Miete, die ich kassiere.', 'freude'),
  ], {
    choices: [
      ch('„Ich helf dir.“', 'abend-ja', { effects: [{ startQuest: 'side-strandclub' }] }),
      ch('„Hunter. Du hast gerade die Stadt gerettet. Mach mal Pause.“', 'abend-pause'),
    ],
  }),
  node('abend-ja', [
    l('hunter', 'Dachte ich mir. Wir fangen morgen an. Heute … heute sitzen wir einfach hier.', 'freude'),
  ], { choices: weiter([[ENDE_NEXUS, 'abend-nexus'], [null, 'abend-meer']]) }),
  node('abend-pause', [
    l('hunter', 'Pause ist, wenn man nichts verdient. Ich hab’s mir gemerkt: Pause ist teuer.', 'signatur'),
    l('hunter', 'Aber gut. Heute. Heute sitzen wir einfach hier.', 'freude'),
  ], { choices: weiter([[ENDE_NEXUS, 'abend-nexus'], [null, 'abend-meer']]) }),
  node('abend-meer', [], { effects: [set('ende_ankunft_gesehen'), { cutscene: 'ende-meer-abend' }] }),
  node('abend-nexus', [], { effects: [set('ende_ankunft_gesehen'), { cutscene: 'ende-nexus-abend' }] }),
]);

// --------------------------------------------------------------------------------------------- Abend und Schlussmonolog

const monolog = (schluss: string, extra: CutsceneBeat[] = []): CutsceneBeat[] => [
  tafel('Das Lagerfeuer brennt aus Treibholz. Es knackt, es raucht, und jeder sitzt so, dass der Rauch immer den anderen trifft.', [
    l('dante', 'Ich hab Kekse dabei. Sie sind zu siebzig Prozent Sand.', 'freude'),
    l('aria', 'Gib her. Sand ist Ballaststoff.', 'freude'),
  ], { fade: 'in' }),
  ...extra,
  bild('cut-ende-meer', 'Hunter steht auf. Er hält kein Glas, keine Rede, keinen Zettel. Nur die Sonnenbrille, die er ausnahmsweise nicht trägt.', [
    l('hunter', 'Wisst ihr, was ich in drei Jahren Knast und vier Jahren Tresen gelernt hab?', 'neutral'),
    l('hunter', 'Schulden muss man immer begleichen. Das ist das eine. Und das andere ist: Allein schafft man gar nichts. Nicht mal einen ordentlichen Cocktail.', 'neutral'),
    l('hunter', 'Wer mit den Menschen, die einem am Herzen liegen, an einem Traum arbeitet, der schafft es. Egal, wie bescheuert der Traum ist. Selbst wenn es nur ein Strand ist. Und eine Bar.', 'zaertlich'),
    l('hunter', 'Vor allem eine Bar.', 'freude'),
  ], { pan: 'out', hold: 2400 }),
  tafel('Niemand klatscht. Raven wirft ein Stück Holz ins Feuer. Vega nickt. Aria heult und behauptet, es sei Rauch. Es ist Rauch. Auch.', [], { hold: 1600 }),
  tafel(schluss, [], { hold: 3200 }),
  tafel('Das Spiel geht weiter. Das Meer ist offen, die Stadt auch. Am Wagenplatz kannst du den Abspann ansehen, wann immer du willst.', [], { fade: 'out', hold: 1600 }),
];

const abendMeer: CutsceneDef = {
  id: 'ende-meer-abend',
  title: 'Ende 1: Am Feuer',
  beats: monolog('ENDE 1 · DAS MEER'),
  effects: [herz('hunter', 40), { advanceTime: 120 }],
};
const abendNexus: CutsceneDef = {
  id: 'ende-nexus-abend',
  title: 'Ende 2: Am Feuer',
  beats: monolog('ENDE 2 · DIE NEUE NEXUS', [
    tafel('Aus dem Autoradio summt leise Polka. Niemand hat sie angemacht.', [
      l('ki-nexus', '(Autoradio) Entschuldigung. Das war ich. Es passte. Ich weiß nicht, warum es passte.', 'verlegen'),
      l('raven', 'Lass sie. Heute ist mir sogar ein höflicher Toaster egal.', 'signatur'),
    ]),
  ]),
  effects: [herz('hunter', 40), herz('ki-nexus', 40), { advanceTime: 120 }],
};

// --------------------------------------------------------------------------------------------- Cutscene Ende 3

const endeMaster: CutsceneDef = {
  id: 'ende-master',
  title: 'Ende 3: Master',
  beats: [
    bild('cut-ende-master', 'Das Turmbüro, eine Woche später. Der Teddyfell-Mantel passt dir wie angegossen. Der Goldknauf liegt schwer in der Hand. Schwerer, als er aussah.', [
      l('ki-nexus', 'Guten Morgen, Master. Die Stadt gehorcht zu neunundneunzig Komma neun Prozent. Die restlichen null Komma eins Prozent sind Opa Funk.', 'neutral'),
    ], { pan: 'in', fade: 'in', hold: 1600 }),
    tafel('Die Crew ist weg. Kein Abschied, kein Anruf, kein Zettel. Nur ein Satz, der noch im Raum hängt wie kalter Rauch.', [
      l('raven', 'Du teilst auch nicht gerne.', 'wut'),
    ], { hold: 1400 }),
    bild('cut-ende-master', 'Auf einem kleinen Bildschirm in der Ecke läuft ein Bild, das du nicht bestellt hast: ein Strand. Ein Lagerfeuer. Sechs Silhouetten. Ein leerer Platz.', [
      l('ki-nexus', 'Soll ich Ihnen eine Nougatbombe bestellen, Master? Sie wirken gereizt.', 'neutral'),
    ], { pan: 'right', hold: 1600 }),
    tafel('Abendjournal auf NX-1. Collin und Delya sitzen kerzengerade. Sie sprechen exakt gleichzeitig.', [
      l('collin-charleston', 'Alles ist gut, Master.', 'neutral'),
      l('delya-delloraine', 'Alles ist gut, Master.', 'neutral'),
      n('Danach kommt ein Wetterbericht ohne Wetter.'),
    ]),
    tafel('Draußen in der Ödnis rauscht ein Sender, den niemand abschalten kann.', [
      l('opa-funk', '(Radio Rost) … Rauschen. Dann leise: Wir senden weiter. Irgendwer muss ja.'),
    ], { hold: 1400 }),
    tafel('ENDE 3 · MASTER', [], { hold: 3200 }),
    tafel('Auf dem Besuchersessel vor deinem Schreibtisch sitzt ein Plüschhase mit sehr großen Ohren. Eines ist geknickt. Neben ihm liegt ein Zettel.', [], { fade: 'out', hold: 1600 }),
  ],
  effects: [
    set('ende_master'), set('epilog'), set('master_modus'),
    // Die Crew geht („Sie gehen.“): niemand bleibt in der Party (Integration).
    ...(['aria', 'dante', 'raven', 'vega', 'nyra', 'hunter', 'jimmy'] as const).map((npc): Effect => ({ dismiss: npc })),
    { credits: 3000 },
    { rep: 'unterstadt', delta: -60 }, { rep: 'crew-hunter', delta: -50 }, { rep: 'kanalvolk', delta: -30 },
    herz('hunter', -100), herz('raven', -100), herz('dante', -100), herz('vega', -100), herz('aria', -100),
    herz('nyra', -100), herz('jimmy', -100),
    { sleep: true },
    { travel: 'blades-buero', entry: 'aufwachen', minutes: 0 },
  ],
};

// --------------------------------------------------------------------------------------------- Nachrichten nach den Enden

const news = (id: string, anchor: string, headline: string, lines: NewsDef['lines'], when: NewsDef['when']): NewsDef =>
  ({ id, anchor, headline, lines, when, priority: 7 });

const NEWS: NewsDef[] = [
  news('news-ende-meer', 'delya-delloraine', 'Netzausfall im Quantum-Tower', [
    l('delya-delloraine', 'Netzausfall im Quantum-Tower. Die Stadt bleibt ungewöhnlich ruhig. Die Chips liegen in den Mülltonnen, die Mülltonnen sind überfordert.', 'neutral'),
    l('collin-charleston', 'Und unsere Reporterin nimmt sich frei! Das hat es seit 2079 nicht gegeben!', 'freude'),
    l('delya-delloraine', 'Ich glaube, ich nehme mir frei. Ich habe es nur laut gesagt, damit ich es nicht zurücknehmen kann.', 'freude'),
  ], all(ENDE_MEER, not(MASTER))),
  news('news-ende-neue-nexus', 'collin-charleston', 'Nexus spricht zu allen', [
    l('ki-nexus', 'Ich bin keine Herrscherin. Ich bin ein Werkzeug. Bitte benutzt mich nett.', 'freude'),
    l('collin-charleston', 'Ein Werkzeug, das „bitte“ sagt! Noxius, ich habe Gänsehaut, und die ist echt, kein Implantat!', 'freude'),
    l('delya-delloraine', 'Nicht alle trauen der neuen KI. Eine Umfrage am Schrottmarkt ergab: dreiundvierzig Prozent „Nein“, zwölf Prozent „Wer?“, der Rest hat den Fragebogen gegessen.', 'besorgt'),
  ], ENDE_NEXUS),
  news('news-ende-master', 'collin-charleston', 'Alles ist gut', [
    l('collin-charleston', 'Alles ist gut, Master.', 'neutral'),
    l('delya-delloraine', 'Alles ist gut, Master.', 'neutral'),
    n('Danach ein Wetterbericht ohne Wetter. Nur eine Karte von Noxius und eine Stimme, die „angenehm“ sagt.'),
  ], all(ENDE_MASTER, MASTER)),
  news('news-ende-doch-noch-meer', 'delya-delloraine', 'Der Turm ist leer', [
    l('delya-delloraine', 'Der Quantum-Tower steht leer. Der neue Master ist verschwunden. Augenzeugen sahen eine Rostlaube Richtung Ödnis fahren, mit sehr viel Gehupe.', 'ueberrascht'),
    l('collin-charleston', 'Ich hab heute Morgen „Guten Morgen“ gesagt! Zu mir selbst! Im Spiegel! Und es war mir egal, ob die Frisur sitzt!', 'freude'),
    l('delya-delloraine', 'Sie saß nicht.', 'signatur'),
  ], flag('ende_doch_noch_meer')),
  news('news-rost-ende-meer', 'opa-funk', 'Radio Rost: Alle Mann ans Meer', [
    l('opa-funk', 'Alle Mann ans Meer! Der Konvoi fährt um sechs. Wer nicht da ist, schwimmt. Und jetzt: Polka. Zur Feier des Tages zwei Polkas.'),
  ], all(any(ENDE_MEER, flag('ende_doch_noch_meer')), not(MASTER))),
  news('news-rost-ende-neue-nexus', 'opa-funk', 'Radio Rost: Die KI hat angerufen', [
    l('opa-funk', 'Die KI hat angerufen und nach einem guten Lied gefragt. Hab ihr Polka gespielt. Sie hat geweint. Glaub ich. Oder die Leitung hat gerauscht.'),
  ], ENDE_NEXUS),
  news('news-rost-ende-master', 'opa-funk', 'Radio Rost: Rauschen', [
    n('Rauschen. Lange nur Rauschen.'),
    l('opa-funk', '… Wir senden weiter. Irgendwer muss ja.'),
  ], all(ENDE_MASTER, MASTER)),
];

// --------------------------------------------------------------------------------------------- Teil

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: { [landeplatz.id]: landeplatz, [strand.id]: strand },
  cutscenes: {
    [endeMeer.id]: endeMeer, [endeNexus.id]: endeNexus, [endeMaster.id]: endeMaster,
    [abendMeer.id]: abendMeer, [abendNexus.id]: abendNexus,
  },
  news: Object.fromEntries(NEWS.map((x) => [x.id, x])),
  mapAdditions: {
    'das-meer': {
      onEnter: [
        { id: 'ende-ankunft', when: all(any(ENDE_MEER, ENDE_NEXUS), noFlag('ende_ankunft_gesehen')), dialogue: strand.id },
      ],
    },
  },
};
