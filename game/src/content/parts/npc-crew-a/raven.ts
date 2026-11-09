// Raven – ehemalige Einbrecherin der Crew, sieben Jahre Eisenhof (world.md §4.2, §4.6, §4.7 Paar-Strang, §11.2).
// Tagesablauf nach design/plan/act1.json (npcSchedules.raven), Herz-Ereignisse he-raven-2/4/6 in Akt 1,
// he-raven-8/10 angelegt und an act2 gebunden. Begleiterin ab main-1-auf-raven.
// Dazu die Nebenfigur `zellennachbarin` (Gitter-Gerda, he-raven-6; ID aus design/plan/act1.json notes).
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode, NpcDef, Weekday } from '../../../modules/contracts';
import {
  type Menue, NICHT_MASTER, RUHIG, dialog, erz, flag, herz, ich, knoten, neu, pruefung, rede, sammle, sammleSzenen,
  sprecher, tagesgespraech, und, ZEIT_HINWEIS,
} from './_helfer';
import { RAVEN_PLAN_23, RAVEN_TEL_23, raven23 } from './_raven23';
import { RAVEN_RE, ravenEvents } from './_rivalitaet';

const R = sprecher('raven');
const G = sprecher('zellennachbarin');

const FREI: Condition = { quest: 'main-1-raven', state: 'done' };
const PARTY_VORBEI: Condition = { quest: 'main-1-auf-raven', state: 'done' };
const ROM: Condition = { romance: 'raven' };
/** Flirtzeilen ab ♥6, sobald die Romanze freigeschaltet ist (Engine: romanceEnabled); Kuss/Nacht bleiben an ROM (♥8). */
const FLIRT: Condition = { all: [{ romanceEnabled: 'raven' }, { hearts: 'raven', min: 6 }] };

// ---------------------------------------------------------------------------------------------- Menü

function menue(): Menue {
  const zurueck: DialogueChoice[] = [{ text: 'Noch was.', next: 'menue', id: 'zurueck' }, { text: 'Bis später.' }];
  const flirt = (n: number, tage: Weekday[]): DialogueChoice => ({
    text: 'Mit Raven flirten.', tag: '[Romanze]', next: `flirt-${n}`, id: `flirt-${n}`, when: { all: [FLIRT, { weekday: tage }] },
  });
  const antworten: DialogueChoice[] = [
    { text: '„Ich hab keinen Waffenschein. Ich hab dich.“', check: pruefung('raven-flirt-frech', 'ausstrahlung', 6, ['flirt']), next: 'flirt-a' },
    { text: '„Dann bleib ich, wo ich bin.“', next: 'flirt-b' },
    { text: '„Billig, aber ehrlich.“', next: 'flirt-c' },
  ];

  const choices: DialogueChoice[] = [
    { text: '„Ich komm aus der Rohrsiedlung.“', tag: '[Gosse]', when: { origin: 'origin-gossenkind' }, once: true, id: 'r-gosse', next: 'r-gosse' },
    { text: 'Drei kurz, zwei lang auf den Tresen klopfen.', tag: '[Knast]', when: { origin: 'origin-knastvogel' }, once: true, id: 'r-knast', next: 'r-knast', effects: [herz('raven', 20)] },
    {
      text: '„Ich war mal beim Ordnungsdienst.“', tag: '[Ex-Wache]', once: true, id: 'r-wache', next: 'r-wache',
      when: { all: [{ origin: 'origin-ex-wache' }, { not: { hearts: 'raven', min: 4 } }] }, effects: [herz('raven', -50)],
    },
    {
      text: '„Na? Soll ich dir Handschellen anlegen?“', tag: '[Ex-Wache]', once: true, id: 'r-wache-witz', next: 'r-wache-witz',
      when: { all: [{ origin: 'origin-ex-wache' }, { hearts: 'raven', min: 4 }] },
    },
    {
      text: 'Kommst du mit auf Tour?', next: 'mitkommen', id: 'r-mitkommen',
      when: { all: [PARTY_VORBEI, { not: { recruited: 'raven' } }] }, effects: [{ recruit: 'raven' }],
    },
    { text: 'Erzähl von der Nacht bei Digitech.', tag: '[Raven ♥3]', requires: { hearts: 'raven', min: 3 }, when: FREI, once: true, id: 'r-digitech', next: 'digitech' },
    {
      text: 'Die Handschelle in deiner Jacke – ist das die von damals?', next: 'handschelle', id: 'r-handschelle',
      when: { all: [{ hearts: 'raven', min: 3 }, PARTY_VORBEI, { quest: 'pers-raven-handschellen', state: 'inactive' }] },
      effects: [{ startQuest: 'pers-raven-handschellen' }],
    },
    { text: 'Ravens alte Lederjacke hinhalten.', when: { item: 'ravens-alte-jacke' }, once: true, id: 'r-jacke', next: 'jacke', effects: [{ take: 'ravens-alte-jacke' }, herz('raven', 150)] },
    { text: 'Was ist eigentlich mit dir und Dante?', when: { quest: 'main-1-dante', state: 'done' }, once: true, id: 'r-dante', next: 'dante' },
    { text: 'Du wolltest in den Eisenhof?', when: { all: [{ hearts: 'raven', min: 6 }, neu('he-raven-6')] }, next: 'besuch', effects: [flag('raven_besuch_geplant')] },
    { text: 'Das Partyfoto zeigen.', when: { item: 'partyfoto-raven' }, once: true, id: 'r-partyfoto', next: 'partyfoto' },
    {
      text: 'Komm heute Abend zur Flutmauer. Sonnenuntergang.', next: 'locken', id: 'r-wingman',
      when: { all: [{ quest: 'pers-wingman-sonnenuntergang', state: 'active' }, { flag: 'wingman_plan' }, { notFlag: 'wingman_raven' }] },
    },
    { text: 'Der Tresor. Die Handschelle. Wie geht’s dir damit?', when: { seen: 'he-raven-8' }, once: true, id: 'r-tresor', next: 'tresor' },
    flirt(1, ['mo', 'fr']),
    flirt(2, ['di', 'sa']),
    flirt(3, ['mi', 'so']),
    flirt(4, ['do']),
    { text: 'Bis später.' },
  ];

  const nodes: DialogueNode[] = [
    knoten('menue', [R('Noch was? Kurz.')], { choices }),
    knoten('locken', [R('Flutmauer. Sonnenuntergang. Du.', 'signatur'), R('Wer will das wissen? Und warum guckst du so, als hättest du einen Plan mit Diagramm?')], {
      choices: [
        { text: '„Sonnenuntergangs-Sprint. Training. Hunter will Zeiten.“', check: pruefung('wingman-raven-luege', 'strasse', 6, ['luege']), next: 'locken-luege', effects: [flag('wingman_raven')] },
        { text: '„Jemand will dich sehen. Ohne Schrank dazwischen.“', check: pruefung('wingman-raven-ehrlich', 'ausstrahlung', 6, ['ueberzeugen']), next: 'locken-ehrlich', effects: [flag('wingman_raven'), herz('raven', 20)] },
        { text: '„Vertrau mir einfach.“', next: 'locken-vertrauen', effects: [flag('wingman_raven')] },
      ],
    }),
    knoten('locken-luege', [R('Training. Bei Sonnenuntergang. Hunter. Billige Lüge.', 'signatur'), R('… Ich komm trotzdem. Weil’s eine gute billige Lüge ist.')], { choices: zurueck }),
    knoten('locken-ehrlich', [R('Ohne Schrank.', 'besorgt'), R('… Okay. Ich komm. Wenn ich wegrenn, hältst du mich fest. Wir hatten eine Abmachung.', 'trauer')], { choices: zurueck }),
    knoten('locken-vertrauen', [R('Wer will das wissen?'), R('… Okay. Ich vertrau dir. Siehst du, das klingt immer noch komisch. Ich komm.', 'freude')], { choices: zurueck }),
    knoten('tresor', [
      R('Ich träum nicht mehr vom Rohr. Seit dem Tresor. Ich träum jetzt von Zügen. Von Zügen, die nicht anhalten.', 'besorgt'),
      R('Ist besser. Glaub ich. Frag mich in einem Monat.'),
    ], { choices: zurueck, effects: [herz('raven', 10)] }),
    knoten('r-gosse', [
      R('Die Rohrsiedlung gibt es noch? Dann gibt es Hoffnung.', 'ueberrascht'),
      R('Ich hab da als Kind Kupfer aus den Leitungen gezogen. Der halbe Wasserturm hängt an Kabeln, die ich nicht geklaut hab. Aus Faulheit.'),
    ], { choices: zurueck }),
    knoten('r-knast', [
      erz('Raven erstarrt. Dann klopft sie zurück. Drei kurz, zwei lang.'),
      R('Noch da.', 'freude'),
      R('Wer hat dir das beigebracht? … Nein, sag nichts. Wer’s kennt, hat’s gebraucht.'),
    ], { choices: zurueck }),
    knoten('r-wache', [
      R('Wer will das wissen?', 'wut'),
      R('… Schon gut. Hände, wo ich sie sehen kann. Und dreh mir nie den Rücken zu, wenn du einen Schlagstock trägst.'),
    ], { choices: zurueck }),
    knoten('r-wache-witz', [
      R('Na, Schutzmann? Viel Glück. Ich hab Übung im Rauskommen. Sieben Jahre Übung.', 'signatur'),
      R('Wenn du mich festnehmen willst, bring Kaffee mit. Und eine bessere Ausrede als „Vorschrift ist Vorschrift“.'),
    ], { choices: zurueck }),
    knoten('mitkommen', [
      R('Wer will das wissen?'),
      R('… Ja. Ich komm mit. Aber wenn du rennst, renn ich schneller. Und wenn du lügst, merk ich’s.', 'signatur'),
    ], { choices: zurueck }),
    knoten('digitech', [
      R('Blade hat gelächelt. Dann klick. Rohr, Handgelenk, Alarm. „Ich teile nicht gerne. Tut mir leid.“'),
      R('Drei Stunden hab ich an dem Rohr gehangen, bis die Wache kam. Drei Stunden reichen, um jeden Fehler deines Lebens zu zählen.', 'trauer'),
      R('Ich war bei zweihundert, als die Tür aufging. Der zweihunderterste war, dass ich ihm vertraut hab.'),
    ], { choices: zurueck, effects: [herz('raven', 20)] }),
    knoten('handschelle', [
      R('Persönlicher Besitz, sagt der Eisenhof. Ich hab sie zurückgekriegt. In einer Tüte. Mit Quittung.', 'wut'),
      R('Da ist eine Seriennummer drin. Sonderanfertigung. Wer lässt Handschellen maßanfertigen? Leute mit zu viel Geld und zu wenig Freunden.'),
      R('Ich will wissen, für wen. Hilfst du mir? Gut. Ich hab nicht gefragt.', 'signatur'),
    ], { choices: zurueck }),
    knoten('jacke', [
      erz('Raven nimmt die Jacke, als könnte sie zerfallen. Rissiges Leder, ein Schnitt im linken Ärmel, wo damals das Rohr war.'),
      R('Die Fundkammer. Sieben Jahre hing die da. Kessel hat sie aufbewahrt? … Kessel. Die alte Ziege.', 'trauer'),
      erz('Sie zieht sie an. Zupft am Kragen. Guckt weg.'),
      R('Sitzt noch. Ich nicht ganz. … Danke.', 'freude'),
    ], { choices: zurueck }),
    knoten('dante', [
      R('Wer will das wissen?'),
      ich('Ich.'),
      R('… Nichts. Da ist nichts. Da war mal ein Funkgerät und ein Typ, der zu viel geredet hat. Jetzt ist da eine Werkstatt und ein Typ, der zu viel redet.', 'besorgt'),
      R('Frag ihn nicht. Ich hab nichts gesagt.'),
    ], { choices: zurueck }),
    knoten('besuch', [
      R('Dienstag, Donnerstag, Samstag. Besuchszeit, tagsüber. Gerda sitzt noch. Zelle neben meiner.', 'besorgt'),
      R('Ich will da nicht allein rein. Wenn du mitkommst, trink ich danach nur zwei Schnäpse statt fünf.'),
    ], { choices: zurueck }),
    knoten('partyfoto', [
      R('Lösch das.', 'wut'),
      R('… Nein. Behalt’s. Aber wenn Dante’s sieht, bist du tot. Und wenn Hunter’s an die Wand hängt, ist Hunter tot.'),
    ], { choices: zurueck }),
    // Flirt (nur mit { romance: 'raven' }; Raven steht derzeit nicht in ROMANCE_ENABLED)
    knoten('flirt-1', [R('Hör auf zu lächeln. Das ist eine Waffe, und du hast keinen Waffenschein.', 'signatur')], { choices: antworten }),
    knoten('flirt-2', [R('Du stehst zu nah. … Ich hab nicht gesagt, dass du weggehen sollst.', 'signatur')], { choices: antworten }),
    knoten('flirt-3', [R('Sieben Jahre hat mich keiner angefasst. Ich weiß nicht mehr, wie das geht. Du könntest es mir zeigen. Langsam.', 'besorgt')], { choices: antworten }),
    knoten('flirt-4', [R('Billige Anmache. … Mach weiter.', 'freude')], { choices: antworten }),
    knoten('flirt-a', [R('Frech. Das gibt Ärger. Ich steh auf Ärger.', 'freude')], { choices: zurueck }),
    knoten('flirt-b', [R('Gut. Da kann ich dich sehen.')], { choices: zurueck }),
    knoten('flirt-c', [R('Ehrlich ist selten. Ich merk’s mir.', 'signatur')], { choices: zurueck }),
  ];
  return { choices, nodes };
}

const M = menue();

const ZELLE: Menue = {
  choices: [
    { text: 'Ich bin bei Hunter in der Crew. Er schickt Grüße.', next: 'gruesse', once: true, id: 'z-gruesse' },
    { text: 'Bis bald.' },
  ],
  nodes: [
    knoten('gruesse', [
      R('Hunter. Grüße. Natürlich. Sieben Jahre keine Karte, aber Grüße.', 'wut'),
      R('Sag ihm, ich komm raus. Sag ihm nicht, wann. Er soll ruhig ein bisschen schwitzen.'),
    ]),
  ],
};

const RIVALE: Menue = {
  choices: [
    {
      text: 'Ich hab Handschellen dabei. Lass sie uns im Hafenbecken versenken.', when: { item: 'handschellen' }, next: 'versenken',
      effects: [{ take: 'handschellen' }, { reconcile: 'raven' }, { advanceTime: 30 }],
    },
    { text: 'Schon gut. Ich geh.' },
  ],
  nodes: [
    knoten('versenken', [
      erz('Hafenkante, Kaimauer. Raven hält die Handschellen eine Weile über das ölige Wasser. Dann lässt sie los. Es macht nicht mal Platsch, nur ein müdes Blubb.'),
      R('Blubb. Sieben Jahre, und das Ende klingt nach Blubb.', 'trauer'),
      R('… Okay. Wir sind quitt. Nicht Freunde. Quitt. Fürs Erste.'),
    ]),
  ],
};

// ---------------------------------------------------------------------------------------------- Tagesgespräche

const T = {
  rivale: tagesgespraech('raven-tag-rivale',
    [R('Du. Geh weiter. Ich hab dich nicht gesehen. Ich seh dich auch morgen nicht.', 'wut')],
    [R('Billige Lüge, alles was du sagst. Selbst „Hallo“.', 'wut')],
    RIVALE),
  zelle: tagesgespraech('raven-tag-zelle',
    [R('Wer will das wissen?')],
    [R('Sieben Jahre. Noch ein paar Tage. Ich zähl nicht mehr. Zählen ist was für Leute, die Hoffnung haben.', 'trauer')],
    ZELLE),
  frei: tagesgespraech('raven-tag-frei',
    [R('Sieben Jahre Wand. Und das Erste, was ich draußen seh, ist dein Gesicht. Hätte schlimmer kommen können. Nicht viel.', 'signatur')],
    [
      R('Die Stadt ist lauter geworden. Und bunter. Und keiner hat mich gefragt.'),
      R('Hunter will heute Nacht eine Party. Für mich. Ich hasse Partys. Ich komme.', 'freude'),
    ],
    M),
  dante: tagesgespraech('raven-tag-dante',
    [R('Dante. Hm. Wir gehen zu ihm. Ich red. Du stehst daneben und siehst harmlos aus.', 'besorgt')],
    [R('Er hat damals den Funk gemacht. „Gib mir noch eine Sekunde.“ Die Sekunde dauert jetzt sieben Jahre.', 'trauer')],
    M),
  einbruch: tagesgespraech('raven-tag-einbruch',
    [R('Ein Rabe auf Seraphinas Spiegel. Mit Lippenstift. Ich bin nicht eingerostet.', 'freude')],
    [R('Weißt du, was das Beste war? Der Pudel. Der hat geschnarcht wie Hunter nach drei Gläsern.', 'signatur')],
    M, { effects: [flag('raven_kommentar_einbruch')] }),
  zeit: tagesgespraech('raven-tag-zeit',
    [R('Du bist ja immer noch da. Komisch. Die meisten gehen irgendwann.', 'besorgt'), erz(ZEIT_HINWEIS)],
    [R('Es gibt da was im Digitech-Tresor, das ich zurücklassen muss. Nicht jetzt. Wenn’s soweit ist, kommst du mit. Keine Diskussion.')],
    M),
  handschellen: tagesgespraech('raven-tag-handschellen',
    [R('Die Handschelle. Sonderanfertigung. Ich krieg raus, für wen. Und dann klopf ich da an. Nicht höflich.', 'wut')],
    [R('Seriennummer, Hehler, Behördensystem. Wenn du was findest, sag’s mir. Wenn du nichts findest, lüg nicht. Billige Lügen erkenn ich am Geruch.')],
    M),
  laufen: tagesgespraech('raven-tag-laufen',
    [R('Sechs Kilometer. Halt mit oder halt die Klappe.')],
    [R('Im Eisenhof bin ich im Kreis gelaufen. Zwölf Schritte. Hier ist das Meer im Weg. Ist besser so.', 'freude')],
    M),
  training: tagesgespraech('raven-tag-training',
    [R('Liegestütze. Zwanzig. Dann reden wir. … Das waren elf. Ich hab mitgezählt.', 'signatur')],
    [R('Training ist das Einzige, was mir keiner wegnehmen kann. Muskeln kann man nicht beschlagnahmen. Haben sie versucht.')],
    M),
  markt: tagesgespraech('raven-tag-markt',
    [R('Ich beobachte. Die Hälfte hier klaut, die andere Hälfte lässt sich beklauen. Zu welcher gehörst du?')],
    [R('Der Typ mit dem Hut hat drei Geldbörsen in der Jacke. Keine davon ist seine. Respekt. Wirklich. Saubere Arbeit.', 'signatur')],
    M),
  dachWeich: tagesgespraech('raven-tag-dach-weich',
    [R('Hey. Setz dich. Ich zähl die Farben da drüben. Bist du gekommen, um mitzuzählen?', 'freude')],
    [R('Weißt du, was komisch ist? Sieben Jahre allein, und ich hatte nie Angst. Jetzt hab ich Leute. Und hab ständig Angst. Um euch.', 'trauer')],
    M),
  dach: tagesgespraech('raven-tag-dach',
    [R('Wer will das wissen? … Ach, du. Setz dich. Red nicht.')],
    [R('Nachts ist die Stadt ehrlich. Man sieht nur, was leuchtet. Den Rest kann man sich denken.')],
    M),
  bar: tagesgespraech('raven-tag-bar',
    [R('Setz dich. Nicht so nah. Näher als das. Okay. Genau da.')],
    [R('Hunter hat mir einen Hocker reserviert. Mit Namensschild. Ich hab das Schild abgemacht. Er hat ein neues drangemacht. Wir führen Krieg.', 'signatur')],
    M),
};

// ---------------------------------------------------------------------------------------------- Herz-Ereignisse

const he2 = dialog('he-raven-2', [
  knoten('start', [
    erz('Ein Pfiff von oben. Raven sitzt auf der Dachterrasse, Beine über der Kante, und winkt dich mit zwei Fingern die Feuerleiter hoch.'),
    R('Komm hoch. Leise. Die Tauben schlafen, und die sind nachtragend.'),
    erz('Oben riecht es nach Teer und Regen. Unter euch pumpt der Bass aus dem High Voltage.'),
    R('Weißt du, was mir gefehlt hat? Farben. Echte. Im Eisenhof gibt’s Grau, Dunkelgrau und das Grau von Kantinenpudding.'),
    R('Und erzähl mir nichts von Neon. Neon zählt nicht. Neon ist Farbe, die schreit, weil sie sonst keiner bemerkt.', 'signatur'),
    R('Sag mir eine Farbe. Eine richtige.', 'besorgt'),
  ], {
    choices: [
      { text: '„Das Grün von echtem Moos. Am Wasserturm in der Rohrsiedlung wächst welches.“', next: 'gruen', effects: [herz('raven', 30), flag('raven_farbe_gruen')] },
      { text: '„Das Orange, kurz bevor die Sonne hinter den Kränen verschwindet.“', next: 'orange', effects: [herz('raven', 30), flag('raven_farbe_orange')] },
      { text: '„Das Blau von deinen Augen, wenn du kurz vergisst, böse zu gucken.“', check: pruefung('he-raven-2-blau', 'ausstrahlung', 5, ['flirt']), next: 'augen', effects: [herz('raven', 50)] },
      { text: '„Der Himmel draußen. Nachts, ohne Smog. So viele Sterne, dass es wehtut.“', tag: '[Ödnis]', when: { origin: 'origin-oednis' }, next: 'sterne', effects: [herz('raven', 50), flag('raven_sterne_versprochen')] },
      { text: '„Schwarz. Wie deine Klamotten.“', next: 'schwarz', effects: [herz('raven', 15)] },
    ],
  }),
  knoten('gruen', [
    R('Moos. Am Wasserturm. Echt?', 'ueberrascht'),
    R('Okay. Da geh ich hin. Allein. … Vielleicht nicht allein.'),
  ], { next: 'ende' }),
  knoten('orange', [
    R('Die Kräne. Ja. Die hab ich von der Zelle aus gesehen, nur die oberste Spitze, im Fensterschlitz.', 'trauer'),
    R('Ich wusste nie, welche Farbe der Himmel dahinter hat. Jetzt weiß ich’s.'),
  ], { next: 'ende' }),
  knoten('augen', [
    R('… Billige Anmache.', 'ueberrascht'),
    R('Aber gute. Mach das nicht nochmal. Doch. Nein. Halt die Klappe.', 'freude'),
  ], { next: 'ende' }),
  knoten('sterne', [
    R('Sterne. Hab ich zuletzt auf einem Plakat gesehen. „Quantum – greif nach den Sternen.“', 'signatur'),
    R('Zeig sie mir. Irgendwann. Wenn wir hier rauskommen.', 'trauer'),
  ], { next: 'ende' }),
  knoten('schwarz', [
    R('Schwarz ist keine Farbe. Schwarz ist eine Entscheidung.', 'signatur'),
    R('Aber gut. Du hast hingeguckt. Das zählt.'),
  ], { next: 'ende' }),
  knoten('ende', [
    erz('Eine Weile sitzt ihr schweigend da. Über euch ist nichts als Dunst, unter euch das ganze laute Leben.'),
    R('Das bleibt hier oben. Was ich gesagt hab. Wenn Hunter fragt: Wir haben über Waffen geredet.'),
  ], { effects: [{ xp: 40 }, herz('raven', 10)] }),
]);

const he4 = dialog('he-raven-4', [
  knoten('start', [
    erz('Morgendunst über den Dächern. Raven macht Klimmzüge an einem Lüftungsrohr. Als du oben bist, lässt sie sich fallen und landet lautlos wie eine Katze mit Vorstrafen.'),
    R('Pünktlich. Hunter hat dich verdorben.'),
    R('Handgelenke her. Beide.'),
    erz('Bevor du fragen kannst: Ratsch. Ein Kabelbinder. Deine Hände sind zusammengeschnürt.'),
    R('Raus da. Du hast eine Minute. Danach erklär ich dir, warum du tot bist.', 'signatur'),
  ], {
    choices: [
      { text: 'Daumen einklappen, drehen, rausziehen.', check: pruefung('he-raven-4-reflexe', 'reflexe', 5, ['fessel', 'entfesseln']), next: 'schnell', effects: [herz('raven', 40)] },
      { text: 'Arme hoch, ruckartig runter auf die Hüfte. Sprengen.', check: pruefung('he-raven-4-koerper', 'koerper', 6, ['fessel', 'kraft']), next: 'kraft', effects: [herz('raven', 30)] },
      { text: 'Mit dem Kronkorken aus der Hosentasche durchsägen.', check: pruefung('he-raven-4-strasse', 'strasse', 4, ['fessel', 'trick']), next: 'trick', effects: [herz('raven', 30)] },
      { text: '„Keine Ahnung. Zeig’s mir.“', next: 'zeigen', effects: [herz('raven', 25)] },
    ],
  }),
  knoten('schnell', [
    erz('Der Kabelbinder rutscht über den Daumenballen. Frei.'),
    R('Schnell. Zu schnell. Wer hat dir das beigebracht? … Egal. Jetzt zeig ich dir, wie’s richtig geht.', 'ueberrascht'),
  ], { next: 'griff' }),
  knoten('kraft', [
    erz('Plastik knallt wie ein Schuss. Zwei Tauben verlassen beleidigt das Dach.'),
    R('Brutal. Funktioniert bei Plastik. Bei Stahl brichst du dir das Handgelenk. Pass auf.'),
  ], { next: 'griff' }),
  knoten('trick', [R('Kronkorken als Klinge. Gossentrick. Mag ich. Trotzdem: Pass auf.', 'signatur')], { next: 'griff' }),
  knoten('zeigen', [R('Ehrlich. Selten. Pass auf.')], { next: 'griff' }),
  knoten('griff', [
    erz('Sie nimmt deine Hände, dreht sie, zeigt dir den Winkel, den Druckpunkt, die halbe Drehung. Ihre Finger sind rau und sehr genau. Dreimal. Viermal. Beim fünften Mal bist du frei, bevor sie „jetzt“ sagen kann.'),
    R('Blade hat mich an ein Rohr gekettet. Mit Stahl. Ich kannte den Griff. Hat nichts genützt, weil ich ihm vertraut hab und zu spät angefangen hab.', 'besorgt'),
    R('Fang nie zu spät an. Das ist die ganze Lektion.'),
  ], {
    choices: [
      { text: '„Danke, Raven.“', next: 'danke' },
      { text: '„Hast du Angst, dass es nochmal passiert?“', next: 'angst', effects: [herz('raven', 20)] },
    ],
  }),
  knoten('danke', [R('Bedank dich nicht. Überleb einfach.')], { next: 'ende' }),
  knoten('angst', [
    R('Jeden Tag. Deswegen trainier ich jeden Tag.', 'trauer'),
    R('Angst ist ein Muskel. Wenn du ihn trainierst, wird er Wut.'),
  ], { next: 'ende' }),
  knoten('ende', [
    erz('Raven wirft dir den zerschnittenen Kabelbinder zu. „Andenken.“ Bei Fesseln bist du ab jetzt einen Tick schneller.'),
  ], {
    effects: [
      { checkBuff: { id: 'raven-entfesselungsgriff', label: 'Ravens Entfesselungsgriff', value: 1, tags: ['fessel', 'entfesseln'], consumes: false } },
      flag('raven_entfesselungsgriff'), { xp: 60 },
      { message: 'Gelernt: Ravens Entfesselungsgriff (+1 bei Fessel-Situationen).' },
    ],
  }),
]);

const he6 = dialog('he-raven-6', [
  knoten('start', [
    erz('Besucherraum. Panzerglas, ein Telefonhörer auf jeder Seite, der Geruch von Desinfektion und altem Kaffee. Raven sitzt sehr gerade. Hinter der Scheibe: eine Frau mit grauem Bürstenschnitt und Tätowierungen bis zum Hals.'),
    G('Rabe! Mein Rabe! Sieben Jahre Wand an Wand, und jetzt kommst du mit Begleitung? Ist das dein Liebhaber? Deine Liebhaberin? Ein Bulle?'),
    R('Gerda. Halt die Klappe. Das ist Crew.', 'freude'),
    G('Crew! Hört ihr das? Sie hat Crew!'),
    G('Die hat sieben Jahre nachts an die Wand geklopft. Drei kurz, zwei lang. „Noch da?“ Und ich hab zurückgeklopft. „Noch da.“ Jede verdammte Nacht.'),
  ], {
    choices: [
      { text: 'An die Scheibe klopfen. Drei kurz, zwei lang.', tag: '[Knast]', when: { origin: 'origin-knastvogel' }, next: 'klopfen', effects: [herz('raven', 30), herz('zellennachbarin', 30)] },
      { text: '„Danke, dass du auf sie aufgepasst hast.“', next: 'danke', effects: [herz('zellennachbarin', 20)] },
      { text: '„Ich bin kein Bulle. Versprochen.“', next: 'bulle' },
    ],
  }),
  knoten('klopfen', [
    G('… Noch da. Ha! Ein Knastvogel! Rabe, du hast dir einen von uns gesucht.'),
    R('Hab ich nicht gesucht. Ist mir zugelaufen.', 'signatur'),
  ], { next: 'dante' }),
  knoten('danke', [
    G('Aufgepasst? Die hat auf MICH aufgepasst. Hat einer Wärterin die Schlüsselkarte geklaut, nur um mir Schokolade zu bringen. Und die Karte zurückgelegt! Wer klaut was und legt’s zurück?'),
    R('Profis.', 'signatur'),
  ], { next: 'dante' }),
  knoten('bulle', [G('Sagen sie alle.'), R('Gerda.'), G('Schon gut, schon gut. Der Bulle darf bleiben.')], { next: 'dante' }),
  knoten('dante', [
    G('Und? Hast du ihn gesehen? Den Bäcker?'),
    R('Gerda.', 'wut'),
    G('Jeden Monat kam ein Brief. Kein Absender, nur „D.“ Und ein Foto. Die Stadt. Ein Dach. Der Hafen bei Sonnenuntergang. Damit sie weiß, wie’s draußen aussieht.'),
    G('Und Kekskrümel im Umschlag. Jedes Mal. Die Wache hat sie für Drogen gehalten und dreimal ins Labor geschickt.'),
    R('Ich weiß. Ich weiß auch, dass er einen Schrank voll Fotos hat. Von mir. Von damals. Ripper redet, wenn er betrunken ist, und Ripper ist immer betrunken.', 'besorgt'),
    R('Ich hab nie zurückgeschrieben. Was schreibt man einem, der einen nicht rausgeholt hat? „Danke für die Kekse“?', 'trauer'),
  ], {
    choices: [
      {
        text: '„Ich hab den Schrank gesehen. Der ist voll mit dir.“', next: 'verraten',
        when: { all: [{ seen: 'he-dante-6' }, { flag: 'dante_geheimnis_versprochen' }] },
        effects: [flag('dante_geheimnis_gebrochen'), herz('dante', -40), herz('raven', 20), flag('paar_dante_raven_ermutigt')],
      },
      {
        text: '„Er hat mehr Angst vor dir als vor Blade. Schreib ihm. Oder geh einfach rein.“', check: pruefung('he-raven-6-mut', 'ausstrahlung', 6, ['ueberzeugen']),
        next: 'mut', effects: [herz('raven', 50), flag('paar_dante_raven_ermutigt')],
      },
      { text: '„Rede mit ihm. Nicht über damals. Über jetzt.“', next: 'reden', effects: [herz('raven', 30), flag('paar_dante_raven_ermutigt')] },
      { text: '„Vergiss ihn. Er hat dich damals sitzen lassen.“', next: 'vergiss', effects: [herz('raven', 5), flag('paar_dante_raven_entmutigt')] },
      { text: '„Das geht mich nichts an.“', next: 'neutral', effects: [herz('raven', 20)] },
    ],
  }),
  knoten('verraten', [
    R('Voll? … Der Idiot.', 'ueberrascht'),
    R('Er hat dich schwören lassen, oder? Und du erzählst es mir trotzdem.'),
    R('Gut. Ich hätt’s auch getan.', 'signatur'),
    G('Ha! Der Rabe wird rot!'),
    R('Ich werd nicht rot. Das ist das Licht.'),
  ], { next: 'ende' }),
  knoten('mut', [
    R('Angst vor mir? … Ja. Sollte er auch.'),
    R('Vielleicht geh ich rein. Vielleicht bring ich Kekse mit. Ohne Krümel.', 'freude'),
    G('Mit Krümeln! Krümel sind Liebe, du Trampel!'),
  ], { next: 'ende' }),
  knoten('reden', [
    R('Über jetzt. Hm. Jetzt ist er ein Bäcker mit Plattenspieler und einem Hasen. Und ich bin eine Einbrecherin auf Bewährung. Klingt nach einem schlechten Film.'),
    R('Ich denk drüber nach.', 'besorgt'),
  ], { next: 'ende' }),
  knoten('vergiss', [
    R('Billige Lüge.', 'wut'),
    R('… Nein. Nicht gelogen. Er hat mich sitzen lassen. Und ich ihn. Wir waren beide nicht da.'),
    R('Vielleicht hast du recht. Vielleicht ist es besser so.', 'trauer'),
    G('Rabe …'),
  ], { next: 'ende' }),
  knoten('neutral', [R('Stimmt. Danke, dass du’s sagst.'), G('Feigling!'), R('Gerda.')], { next: 'ende' }),
  knoten('ende', [
    erz('Der Wärter klopft ans Glas. Besuchszeit vorbei. Gerda legt die Hand an die Scheibe, Raven ihre auf die andere Seite. Drei kurz, zwei lang.'),
    G('Noch da?'),
    R('Noch da.', 'trauer'),
  ], { effects: [{ xp: 100 }, herz('raven', 40), flag('raven_gerda_besucht')] }),
]);

// ♥8 und ♥10 ab Akt 2 (nach dem Countdown oder im Nachspiel), world.md §4.2 und Paar-Strang §4.7.
const DANTE_VERGEBEN: Condition = { flag: 'dante_romanze_zusammen' };
const SPIELFIGUR_VERLIEBT: Condition = {
  any: [{ flag: 'hunter_romanze_zusammen' }, { flag: 'aria_romanze_zusammen' }, { flag: 'aria_kuss' }, { flag: 'collin_kuss' }, { flag: 'lio-funkel_romanze_zusammen' }],
};

const he8 = dialog('he-raven-8', [
  knoten('start', [
    erz('Digitech-Tresor. Kalte Luft, Staub auf den Kabelkanälen, das Summen eines Notstromaggregats, das seit sieben Jahren auf jemanden wartet. Das Rohr ist noch da. Rostig, verbeult, an einer Stelle blank gescheuert. Von einem Handgelenk.'),
    R('Hier. Drei Stunden.', 'trauer'),
    erz('Hinter euch schnappt die Panzertür zu. Ein altes Terminal flackert: „WILLKOMMEN ZURÜCK, MITARBEITERIN 0-7. SCHICHTBEGINN: VOR 2.557 TAGEN.“'),
    R('Nein. Nein nein nein. Nicht zu. Nicht die Tür.', 'besorgt'),
    erz('Raven atmet zu schnell. Ihre Hand liegt am Rohr, als hätte jemand sie dort festgeklebt.'),
  ], {
    choices: [
      { text: 'Zum Kartenleser. Die Tür wieder aufkriegen.', check: pruefung('he-raven-8-tuer', 'technik', 6, ['hacken', 'schloss']), next: 'tuer', effects: [herz('raven', 30)] },
      { text: '„Raven. Atme. Ich zähl mit. Eins. Zwei.“', check: pruefung('he-raven-8-atmen', 'ausstrahlung', 6, ['trost']), next: 'atmen', effects: [herz('raven', 30)] },
      { text: 'Ans Rohr klopfen. Drei kurz, zwei lang.', tag: '[Knast]', when: { origin: 'origin-knastvogel' }, next: 'klopfen', effects: [herz('raven', 40)] },
      { text: 'Ihre Hand vom Rohr lösen und festhalten.', next: 'hand', effects: [herz('raven', 25)] },
    ],
  }),
  knoten('tuer', [
    erz('Zwei Kabel, ein Kurzschluss, ein Fluch. Das Terminal piept beleidigt, und die Panzertür fährt zischend wieder auf.'),
    ich('Diesmal geht die Tür auf, wenn wir wollen.'),
    R('… Gut. Gut. Lass sie offen.', 'besorgt'),
  ], { next: 'handschelle' }),
  knoten('atmen', [
    erz('Du zählst. Langsam. Sie zählt mit, erst lautlos, dann leise, dann mit dir. Bei zwölf lässt sie das Rohr los.'),
    R('Zwölf. Im Eisenhof waren es zwölf Schritte. Von Wand zu Wand.', 'trauer'),
    R('Danke. Sag nicht „gern geschehen“. Ich hasse „gern geschehen“.'),
  ], { next: 'handschelle' }),
  knoten('klopfen', [
    erz('Tok-tok-tok. Toook. Toook. Das Rohr singt dumpf durch die ganze Halle.'),
    R('… Noch da.', 'trauer'),
    erz('Sie klopft zurück. Ihre Hand zittert dabei nicht mehr.'),
  ], { next: 'handschelle' }),
  knoten('hand', [
    erz('Du nimmst ihre Hand. Kalt, rau, sehr fest. Sie lässt es zu. Sie lässt es zu und sagt nichts, und bei Raven ist das ungefähr ein Gedicht.'),
  ], { next: 'handschelle' }),
  knoten('handschelle', [
    erz('Sie zieht die alte Handschelle aus der Jacke. Sonderanfertigung, Seriennummer, eine Kerbe vom Rohr.'),
    R('Drei Stunden hab ich gezählt, was ich falsch gemacht hab. Zweihundert Sachen. Und die zweihundertunderste war, dass ich das Ding hier sieben Jahre lang mit mir rumgetragen hab.', 'wut'),
    erz('Sie legt die Handschelle um das Rohr und lässt sie zuschnappen. Klick. Den Schlüssel wirft sie in den Lüftungsschacht. Er klimpert noch eine ganze Weile.'),
    R('Das war’s.'),
  ], {
    choices: [
      { text: '„Wie fühlt sich das an?“', next: 'gefuehl' },
      { text: '„Komm. Wir gehen. Zusammen diesmal.“', next: 'gehen', effects: [herz('raven', 20)] },
      { text: '„Soll ich das Schloss noch mit Kaugummi zukleben? Für alle Fälle?“', next: 'kaugummi', effects: [herz('raven', 15)] },
    ],
  }),
  knoten('gefuehl', [
    R('Leicht. Zu leicht. Als hätt ich sieben Jahre einen Stein getragen, der aus Pappe war.', 'besorgt'),
    R('Gehen wir, bevor ich heul. Ich heul nicht. Gehen wir.'),
  ], { next: 'ende' }),
  knoten('gehen', [R('Zusammen. Ja. Das Wort probier ich noch aus. Es passt noch nicht ganz. Wie eine neue Jacke.', 'freude')], { next: 'ende' }),
  knoten('kaugummi', [
    R('… Mit Kaugummi.', 'ueberrascht'),
    erz('Raven lacht. Kurz, rau, wie ein Motor, der nach sieben Jahren wieder anspringt.'),
    R('Ja. Mach. Grünen. Den ekligsten, den du hast.', 'freude'),
  ], { next: 'ende' }),
  knoten('ende', [
    erz('Hinter euch hängt die Handschelle am Rohr. Sie hält nichts mehr fest.'),
    R('Wenn ich je wieder irgendwo festhäng. An einem Rohr, an einem Chip, an irgendwas. Erinnerst du mich an heute?', 'trauer'),
    R('Nicht antworten. Einfach machen.'),
  ], { effects: [flag('raven_handschelle_zurueckgelassen'), flag('raven_erinnerung_tresor'), herz('raven', 40), { xp: 150 }] }),
]);

const he10 = dialog('he-raven-10', [
  knoten('start', [
    erz('Dachterrasse, Nacht. Unter euch blinkt die Stadt in all den Farben, die Raven nicht zählt. Sie sitzt an der Kante, die Beine über dem Abgrund, und dreht ein schmales schwarzes Messer zwischen den Fingern.'),
    R('Mein erstes. Hab ich mit vierzehn geklaut und nie benutzt. Nur getragen. Damit ich weiß, dass ich könnte.'),
    R('Fang.'),
  ], {
    choices: [
      { text: 'Fangen. Am Griff.', check: pruefung('he-raven-10-fangen', 'reflexe', 6, ['fangen']), next: 'gefangen', effects: [herz('raven', 30)] },
      { text: 'Ausweichen. Sie will mich doch nicht erstechen?', next: 'ausweichen', effects: [herz('raven', 15)] },
    ],
  }),
  knoten('gefangen', [
    erz('Das Messer dreht sich einmal in der Luft. Du fängst es am Griff. Es ist warm von ihrer Hand.'),
    R('Gute Hände. Hab ich gewusst.', 'freude'),
  ], { next: 'klinge' }),
  knoten('ausweichen', [
    erz('Das Messer bleibt zitternd in einem Blumenkübel stecken. Raven sieht dich an. Dann den Kübel.'),
    R('Ich hab nicht geworfen. Ich hab gereicht. Mit Schwung. … Hol’s dir.', 'signatur'),
  ], { next: 'klinge' }),
  knoten('klinge', [
    R('Du kriegst es. Nicht, weil du’s brauchst. Weil ich will, dass du weißt, dass ich dir den Rücken zudrehe.', 'freude'),
    R('Ich hab das bei keinem gemacht. Seit Blade nicht. Seit sieben Jahren hab ich mit dem Rücken zur Wand geschlafen.', 'trauer'),
    R('So. Das war das Geschenk. Jetzt die Frage. Die ist schlimmer.'),
  ], {
    effects: [{ give: 'ravens-klinge' }, { xp: 200 }, herz('raven', 20)],
    choices: [
      { text: '„Frag.“', next: 'frage', when: { not: DANTE_VERGEBEN } },
      { text: '„Es geht um Dante, oder?“', next: 'vergeben', when: DANTE_VERGEBEN },
    ],
  }),
  knoten('frage', [
    R('Dante. Ich will … ich weiß nicht, wie das geht. Rein in die Werkstatt, „Hallo, ich hab gehört, du hast Fotos von mir im Schrank“?', 'besorgt'),
    R('Ich kann Tresore knacken. Ich kann von einem Dach aufs andere springen. Ich kann nicht „Ich hab dich vermisst“ sagen, ohne dabei jemandem eine reinzuhauen.'),
  ], {
    choices: [
      {
        text: '„Ich helf dir. Wir machen das richtig.“', next: 'helfen',
        effects: [flag('paar_dante_raven_geholfen'), flag('paar_dante_raven_gestoert', false), herz('raven', 50)],
      },
      {
        text: '„Du sagst es nicht. Du klopfst. Drei kurz, zwei lang. Er versteht das.“', check: pruefung('he-raven-10-klopfen', 'ausstrahlung', 7, ['ueberzeugen']),
        next: 'klopfrat', effects: [flag('paar_dante_raven_geholfen'), flag('paar_dante_raven_gestoert', false), herz('raven', 70)],
      },
      { text: '„Lass ihn. Er ist nichts für dich.“', next: 'stoeren', effects: [flag('paar_dante_raven_gestoert'), herz('raven', -20)] },
      { text: '„Das musst du selbst wissen.“', next: 'offen', effects: [herz('raven', 20)] },
      { text: '„Sei lieber meine Wingwoman.“', next: 'wingwoman', when: SPIELFIGUR_VERLIEBT },
      { text: '„Und wenn ich dich will, Raven?“', tag: '[Romanze]', when: ROM, next: 'romanze' },
    ],
  }),
  knoten('helfen', [
    R('Richtig. Mit Plan. Wie ein Bruch.', 'freude'),
    R('Gut. Du bist mein Fluchtwagen. Wenn ich zu laufen anfange, hältst du mich fest. Und wenn er zu reden anfängt, hältst du ihn fest. Das wird ein langer Abend.', 'signatur'),
  ], { next: 'ende' }),
  knoten('klopfrat', [
    R('Klopfen. … Ja. Das kann ich. Das hab ich sieben Jahre jede Nacht gemacht.', 'ueberrascht'),
    R('Er hat mir jeden Monat ein Foto geschickt. Ich hab nie geantwortet. Vielleicht klopf ich einfach an seine Werkstatttür. Und wenn er aufmacht, guck ich ihn an, bis er aufhört zu reden.', 'zaertlich'),
    R('Das kann dauern.', 'freude'),
  ], { next: 'ende' }),
  knoten('stoeren', [
    R('… Vielleicht. Vielleicht hast du recht.', 'trauer'),
    R('Oder du willst was anderes. Ich merk mir beides.', 'wut'),
  ], { next: 'ende' }),
  knoten('offen', [R('Weiß ich nicht. Aber danke, dass du mich nicht schubst. Die meisten schubsen.')], { next: 'ende' }),
  knoten('wingwoman', [
    R('Ich hab gesehen, wie du guckst. Ich bin deine Wingwoman. Keine Widerrede.', 'signatur'),
    R('Regel eins: Lügen nur, wenn’s gut aussieht. Regel zwei: Wenn’s ernst wird, bin ich weg. Regel drei: Danach will ich alles wissen.'),
    R('Und Dante? … Später. Eins nach dem anderen. Erst du. Ich hab sieben Jahre gewartet, ich kann noch eine Woche.'),
  ], { effects: [flag('raven_wingwoman')], next: 'ende' }),
  knoten('vergeben', [
    R('Du und der Bäcker.', 'signatur'),
    R('Hab’s gesehen. Er pfeift. Dante pfeift nie. Er pfeift „Samstagnacht im Neon“, falsch, seit drei Tagen.'),
    R('Viel Glück. Er redet beim Küssen.', 'signatur'),
  ], {
    choices: [
      { text: '„Raven … tut mir leid.“', next: 'vergeben-leid', effects: [herz('raven', 20)] },
      { text: '„Er hat sich entschieden. Für mich. Gewöhn dich dran.“', next: 'vergeben-hart', effects: [flag('raven_eifersucht_ausgeloest')] },
      { text: '„Sei meine Wingwoman. Ich brauch eine, die ihn kennt.“', next: 'wingwoman' },
    ],
  }),
  knoten('vergeben-leid', [
    R('Muss es nicht. Ich hab sieben Jahre nicht geschrieben. Wer nicht schreibt, kriegt keine Antwort.', 'trauer'),
    R('Pass auf ihn auf. Er verbrennt sich ständig. An Keksen, an Lötkolben, an Leuten.'),
  ], { next: 'ende' }),
  knoten('vergeben-hart', [
    R('… Gewöhn dich dran.', 'wut'),
    erz('Raven steht auf. Sie sagt nichts mehr. Sie geht nicht weg. Sie steht nur da und guckt in die Stadt, als würde sie zum ersten Mal wieder Wände zählen.'),
  ], { next: 'ende' }),
  knoten('romanze', [
    R('Dann musst du schneller sein als ich. Hat noch keiner geschafft.', 'signatur'),
    erz('Sie steht auf, geht zur Dachkante – und bleibt stehen. Wartet. Zum ersten Mal läuft sie nicht weg.'),
  ], {
    effects: [flag('raven_romanze_angebahnt')],
    choices: [
      { text: 'Hingehen. Neben sie.', next: 'ende' },
      { text: '„Sag Dante, dass er zu spät ist.“', next: 'dante-spaet', effects: [flag('dante_eifersucht_ausgeloest')] },
    ],
  }),
  knoten('dante-spaet', [R('Das sag ich ihm nicht. Das sagst du ihm. Ich hab genug Leuten das Herz gebrochen. Mit Absicht nur einem.', 'signatur')], { next: 'ende' }),
  knoten('ende', [
    erz('Unter euch flackert die Neon-Gasse. Raven lehnt sich zurück, die Hände hinter dem Kopf, mit dem Rücken zu dir. Absichtlich.'),
    R('Das bleibt hier oben. Wie immer.'),
  ]),
]);

/** Rivalitätsereignis, nur wenn die Spielfigur Raven bewusst die Romanze mit Dante unter die Nase reibt (world.md §4.7). */
const reEifersucht = dialog('re-raven-eifersucht', [
  knoten('start', [
    erz('High Voltage. Ravens Hocker. Raven sitzt drauf, mit dem Rücken zur Bar, und sieht dich kommen, als würdest du eine Uniform tragen.'),
    R('„Gewöhn dich dran.“ Hab ich. Drei Tage. Ich hab mich dran gewöhnt, dass du gern trittst, wenn einer schon liegt.', 'wut'),
    R('Ich hab dir mein Messer gegeben. Ich hab dir den Rücken zugedreht. Billige Lüge, oder? War’s das?'),
  ], {
    effects: [herz('raven', -120), flag('raven_eifersucht_gesehen')],
    choices: [
      { text: '„Das war gemein. Es tut mir leid. Wirklich.“', check: pruefung('re-raven-eifersucht-entschuldigen', 'ausstrahlung', 7, ['trost']), next: 'entschuldigt', effects: [herz('raven', 60)] },
      { text: '„Ich war ein Arschloch. Ich weiß.“', next: 'arschloch', effects: [herz('raven', 30)] },
      { text: '„Du hattest sieben Jahre Zeit, Raven.“', next: 'hart', effects: [herz('raven', -60)] },
    ],
  }),
  knoten('entschuldigt', [
    R('… Wirklich.', 'besorgt'),
    R('Okay. Okay. Ich glaub dir. Nicht ganz. Siebzig Prozent. Das ist mehr, als ich Hunter glaub.'),
  ]),
  knoten('arschloch', [R('Weißt du. Gut. Ein Arschloch, das es weiß, ist schon ein halbes. Die andere Hälfte arbeitest du ab.', 'signatur')]),
  knoten('hart', [
    R('Stimmt.', 'trauer'),
    R('Und du hattest drei Sekunden, die Klappe zu halten. Drei-Sekunden-Regel. Hast du gebrochen.', 'wut'),
    erz('Sie dreht sich weg. Am Tresen ist für dich heute kein Platz mehr neben ihr.'),
  ]),
]);

const gerdaTag = tagesgespraech('zellennachbarin-tag',
  [G('Noch da? Natürlich noch da. Wo soll ich hin, Schätzchen? Ich hab noch vier Jahre und einen Kaktus.')],
  [G('Grüß meinen Raben. Und sag ihr, sie soll dem Bäcker endlich schreiben. Mit Krümeln.')],
  { choices: [{ text: 'Mach’s gut, Gerda.' }], nodes: [] });

// ---------------------------------------------------------------------------------------------- Figuren

const A23 = raven23(M);

const raven: NpcDef = {
  id: 'raven',
  name: 'Raven',
  unknownName: 'Frau in Schwarz',
  portrait: 'raven',
  sprite: 'raven-walk',
  faction: 'crew-hunter',
  romanceable: true,
  bio: 'Ehemalige Einbrecherin der Crew. Blade kettete sie beim Digitech-Bruch an ein Rohr, dafür saß sie sieben Jahre. Trocken, scharf, taut langsam auf.',
  gifts: {
    loves: ['wurfmesser-poliert', 'schwarzer-lippenstift', 'dietrich-set', 'ravens-alte-jacke'],
    likes: ['synth-kaffee', 'vinyl-platte', 'neon-limo', 'dantes-kekse', 'echtobst-apfel', 'hofhonig'],
    dislikes: ['taschenspiegel-gold', 'liebesroman'],
    hates: ['handschellen', 'goldknauf-replik', 'rostige-dose', 'virus-implantat'],
  },
  schedule: [
    // Akt 2/3/Nachspiel vorangestellt (design/plan/act23.json npcSchedules.raven).
    ...RAVEN_PLAN_23,
    { slot: 'tag', days: ['di', 'do', 'sa'], when: { not: FREI }, place: { map: 'zellentrakt', at: 'besucherraum' } },
    { when: { not: FREI }, place: { map: 'zellentrakt', at: 'zelle-raven' } },
    // he-raven-6: Besuch bei Gerda (Besuchszeit Di/Do/Sa tagsüber).
    { slot: 'tag', days: ['di', 'do', 'sa'], when: { all: [{ hearts: 'raven', min: 6 }, neu('he-raven-6')] }, place: { map: 'zellentrakt', at: 'besucherraum' } },
    { slot: 'morgen', days: ['di', 'do'], place: { map: 'flutmauer', at: 'laufstrecke' } },
    { slot: 'morgen', place: { map: 'neon-gasse', at: 'dachterrasse' } },
    { slot: 'tag', place: { map: 'schrottmarkt', at: 'raven-ecke' } },
    { slot: 'abend', place: { map: 'high-voltage', at: 'bar-hocker' } },
    { slot: 'nacht', place: { map: 'neon-gasse', at: 'dachterrasse' } },
  ],
  heartEvents: [
    { id: 'he-raven-2', hearts: 2, map: 'neon-gasse', time: 'nacht', when: FREI, dialogue: 'he-raven-2' },
    { id: 'he-raven-4', hearts: 4, map: 'neon-gasse', time: 'morgen', when: { all: [FREI, { not: { weekday: ['di', 'do'] } }] }, dialogue: 'he-raven-4' },
    { id: 'he-raven-6', hearts: 6, map: 'zellentrakt', time: 'tag', when: { all: [FREI, { weekday: ['di', 'do', 'sa'] }] }, cutscene: 'szene-he-raven-6', dialogue: 'he-raven-6' },
    { id: 'he-raven-8', hearts: 8, map: 'digitech-tresor', when: RUHIG, dialogue: 'he-raven-8' },
    { id: 'he-raven-10', hearts: 10, map: 'neon-gasse', time: 'nacht', when: und(RUHIG, { seen: 'he-raven-8' }), dialogue: 'he-raven-10' },
    // Rivalität −2 (Tresen), −5 Duell auf den Dächern, −8 Hafenbecken: _rivalitaet.ts.
    ...ravenEvents(und(FREI, NICHT_MASTER, { not: { all: [{ act: 3 }, { notFlag: 'epilog' }] } })),
  ],
  companion: {
    recruit: { all: [PARTY_VORBEI, NICHT_MASTER] },
    stats: {
      hp: 52, armor: 2, morale: 85,
      attributes: { technik: 2, koerper: 6, reflexe: 6, ausstrahlung: 4, strasse: 5 },
      weapon: { kind: 'nahkampf', damage: 5, range: 1, hit: 5 },
      abilities: ['raven-handschellen-trick', 'raven-lagebild'],
    },
    // Wächst mit der Stufe (Akt 2/3).
    statsByLevel: [
      { minLevel: 6, hp: 64, armor: 3, morale: 90, attributes: { koerper: 7, reflexe: 8, strasse: 6 }, weapon: { damage: 7, range: 1, hit: 6 } },
      { minLevel: 9, hp: 78, armor: 3, morale: 95, attributes: { koerper: 8, reflexe: 9, strasse: 7 }, weapon: { damage: 9, range: 1, hit: 7 } },
    ],
    heartAbilities: [{ hearts: 6, ability: 'raven-konter' }],
    // Nach pers-raven-handschellen hält der Trick 2 Runden.
    abilityRules: [{ when: { quest: 'pers-raven-handschellen', state: 'done' }, replace: ['raven-handschellen-trick', 'raven-handschellen-trick-plus'] }],
    // Duo „Am Ende siegt die Liebe“ (world.md §4.6): Raven + Dante in der Party, Spielfigur mit beiden ♥6.
    duo: [{ ability: 'duo-am-ende-siegt-die-liebe', when: { all: [{ companion: 'dante' }, { hearts: 'raven', min: 6 }, { hearts: 'dante', min: 6 }] } }],
  },
  partyCheckBonus: [
    { tags: ['schloss', 'fessel', 'einbruch', 'schleichen'], value: 1, label: 'Raven zeigt dir, wie' },
  ],
  talk: [
    ...A23.talkFirst,
    rede('re-raven-eifersucht', und({ flag: 'raven_eifersucht_ausgeloest' }, { notFlag: 'raven_eifersucht_gesehen' })),
    rede('raven-tag-rivale', { rival: 'raven' }),
    rede('raven-tag-zelle', { not: FREI }),
    rede('raven-tag-frei', { not: PARTY_VORBEI }),
    rede('raven-tag-dante', { quest: 'main-1-dante', state: 'active' }),
    rede('raven-tag-einbruch', { all: [{ quest: 'side-alte-gewohnheiten', state: 'done' }, { notFlag: 'raven_kommentar_einbruch' }] }),
    rede('raven-tag-handschellen', { quest: 'pers-raven-handschellen', state: 'active' }),
    ...A23.talk,
    rede('raven-tag-zeit', { not: { act: 2 } }, 8),
    rede('raven-tag-laufen', { all: [{ time: 'morgen' }, { weekday: ['di', 'do'] }] }),
    rede('raven-tag-training', { time: 'morgen' }),
    rede('raven-tag-markt', { time: 'tag' }),
    ...A23.talkLate,
    rede('raven-tag-dach-weich', { time: 'nacht' }, 4),
    rede('raven-tag-dach', { time: 'nacht' }),
    rede('raven-tag-bar'),
  ],
};

const zellennachbarin: NpcDef = {
  id: 'zellennachbarin',
  name: 'Gitter-Gerda',
  unknownName: 'Frau aus Zelle 14',
  portrait: 'zellennachbarin',
  sprite: 'zellennachbarin-walk',
  maxHearts: 2,
  bio: 'Ravens Zellennachbarin, sieben Jahre Wand an Wand. Grauer Bürstenschnitt, Tätowierungen bis zum Hals, ein Kaktus und noch vier Jahre.',
  gifts: { loves: ['nougatbombe'], likes: ['chips-tuete', 'synth-kaffee', 'schwarzer-lippenstift'], hates: ['handschellen'] },
  schedule: [{ place: { map: 'zellentrakt', at: 'zellennachbarin' } }],
  talk: [rede('zellennachbarin-tag')],
};

export const part: ContentPart = {
  npcs: { raven, zellennachbarin },
  dialogues: sammle(
    T.rivale, T.zelle, T.frei, T.dante, T.einbruch, T.zeit, T.handschellen, T.laufen, T.training, T.markt,
    T.dachWeich, T.dach, T.bar,
    he2, he4, he6, he8, he10, reEifersucht, gerdaTag, ...RAVEN_RE,
    ...A23.dialogues,
  ),
  cutscenes: sammleSzenen({
    id: 'szene-he-raven-6', title: 'Besuchszeit',
    beats: [
      { image: 'cut-he-raven-6', pan: 'in', fade: 'in', caption: 'Eisenhof, Besucherraum. Panzerglas und sieben Jahre.', hold: 1400 },
      { image: 'cut-he-raven-6', pan: 'right', lines: [R('Ich war seit der Entlassung nicht mehr hier. Ich dachte, ich riech es nicht mehr. Ich riech es.', 'besorgt')] },
    ],
  }),
  phone: {
    ...RAVEN_TEL_23,
    'tel-raven-dach': {
      id: 'tel-raven-dach', from: 'raven',
      text: 'Dach. Heute Nacht. Bring nichts mit. Vor allem keine Fragen.',
      auto: { all: [{ hearts: 'raven', min: 2 }, FREI, neu('he-raven-2')] },
    },
    'tel-raven-training': {
      id: 'tel-raven-training', from: 'raven',
      text: 'Morgen früh, Dach. Training. Nicht Di, nicht Do, da lauf ich. Wer zu spät kommt, macht Liegestütze, bis er Raven buchstabieren kann.',
      auto: { all: [{ hearts: 'raven', min: 4 }, neu('he-raven-4')] },
    },
    'tel-raven-besuch': {
      id: 'tel-raven-besuch', from: 'raven',
      text: 'Dienstag, Donnerstag oder Samstag. Eisenhof, Besuchszeit, tagsüber. Ich will da nicht allein rein. Sag nichts. Komm einfach.',
      auto: { all: [{ hearts: 'raven', min: 6 }, neu('he-raven-6')] },
      effects: [flag('raven_besuch_geplant')],
    },
  },
};
