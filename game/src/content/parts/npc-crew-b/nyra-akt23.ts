// Nyra in Akt 2, Akt 3 und im Nachspiel (world.md §4.2, §5.3–5.5; Orte nach design/plan/act23.json).
// Akt 2: Nyra sitzt seit main-2-bruch im Turm (nyras-arbeitsplatz im quantum-labor), spielt die Gechippte und ist nur
// per Telefon erreichbar (Nachrichten mit versteckter Botschaft). Akt 3: main-3-labor holt sie zurück (Quest-Agent).
// Nachspiel: morgens und tagsüber am Meer (nyra-muschelplatz), sonst ihr Akt-1-Ablauf. he-nyra-8 (Entschuldigung vor
// der Crew) und he-nyra-10 (Wellenrauschen, nyra-wellenchip) als volle Szenen. Kein eigener Inhaltsteil (nyra.ts mischt).
import type { Condition, DialogueChoice, DialogueNode, ScheduleEntry } from '../../../modules/contracts';
import {
  type Akt23, type Menue, AKT2, DANTE_CREW, ENDE_3B, ENDE_MEER, ENDE_NEXUS, MASTER, NACHSPIEL, NYRA_IM_TURM, PARTYNACHT,
  PARTY_PLAN, dialog, erz, flag, herz, knoten, pruefung, rede, sprecher, tagesgespraech,
} from './_helfer';

const N = sprecher('nyra');
const H = sprecher('hunter');
const D = sprecher('dante');
const V = sprecher('vega');
const A = sprecher('aria');
const J = sprecher('jimmy');
const K = sprecher('captain-kuschel');

const JIMMY_DA: Condition = { any: [{ quest: 'side-jimmys-chip', state: 'done' }, { flag: 'jimmy_gerettet' }] };
const MEER_GESEHEN: Condition = { flag: 'meer_offen' };

// ---------------------------------------------------------------------------------------------- Menüwahlen ab Akt 3

export function menue23(zurueck: DialogueChoice[]): Menue {
  const choices: DialogueChoice[] = [
    { text: 'Das Meer. Wie war’s? Ganz ehrlich.', when: { all: [NACHSPIEL, MEER_GESEHEN] }, once: true, id: 'n23-meer', next: 'meer-echt', effects: [herz('nyra', 30)] },
    { text: 'Was war im Turm? Wirklich?', requires: { hearts: 'nyra', min: 6 }, tag: '[Nyra ♥6]', when: { all: [NACHSPIEL, { flag: 'nyra_zurueckgelassen' }] }, once: true, id: 'n23-turm', next: 'turm' },
    { text: 'Captain Kuschel war die ganze Zeit bei dir?', when: { all: [NACHSPIEL, { flag: 'nyra_hat_kuschel' }, { flag: 'nyra_zurueckgelassen' }] }, once: true, id: 'n23-kuschel', next: 'turm-kuschel', effects: [herz('nyra', 10), herz('captain-kuschel', 10)] },
    { text: 'Komm mit raus. Diesmal ganz, nicht nur für Hack-Sachen.', when: { all: [{ any: [{ flag: 'nyra_befreit' }, NACHSPIEL] }, { not: { recruited: 'nyra' } }, { not: MASTER }] }, next: 'rekrut-voll', effects: [{ recruit: 'nyra' }] },
  ];
  const nodes: DialogueNode[] = [
    knoten('meer-echt', [
      N('Ehrlich? Es ist zu groß. Viel zu groß. Ich hab eine Stunde lang nur geguckt und dann geheult, und dann hat mich eine Möwe angeschrien, und dann hab ich gelacht.', 'freude'),
      N('Es riecht nach Salz und ein bisschen nach Fisch und ein bisschen nach Sonnencreme, weil ich die ganze Flasche aufgetragen hab. Auf einmal. Auch im Gesicht.'),
      N('Und der Eimer! Ich weiß jetzt, wofür der Eimer ist! Für ALLES! Muscheln, Wasser, einen Krebs namens Karl, der wieder rauswollte.', 'signatur'),
    ], { choices: zurueck }),
    knoten('turm', [
      N('Im Turm. Hm.', 'besorgt'),
      N('Weißt du, was das Schlimmste war? Nicht Blade. Blade ist laut und eitel und erzählt jeden Morgen denselben Witz über Aktienkurse. Blade ist einfach.'),
      N('Das Schlimmste war, dass es leicht war. „Ja, Master.“ „Gern, Master.“ Irgendwann hab ich’s im Schlaf gesagt. Und dann hab ich Angst gekriegt, dass ich irgendwann aufwache und es nicht mehr spiele.', 'trauer'),
      N('Ich hab jeden Abend den Zentrator in meinem Kopf falsch herum gedreht. In Gedanken. Wie ein Gebet. Dante hat mal gesagt, so merkt man, dass man noch man selbst ist: wenn man etwas absichtlich falsch macht.'),
    ], { choices: zurueck, effects: [herz('nyra', 30)] }),
    knoten('turm-kuschel', [
      erz('Captain Kuschel lugt aus Nyras Kapuze. Ein Ohr steht, eins ist geknickt. Auf seinem Bauch klebt noch ein Inventaraufkleber: „Q-Laborbedarf, Plüsch, 1 Stk.“'),
      N('Die ganze Zeit. Sie haben ihn in die Inventarliste eingetragen. Als Laborbedarf. Er hat da gesessen und alles gesehen.', 'freude'),
      K('(Beide Ohren hoch.)'),
      N('Alesa hat ihn einmal hochgehoben und gefragt, ob er eine Wanze ist. Er hat sie angeguckt. Sie hat ihn ganz vorsichtig wieder hingesetzt und sich entschuldigt. Bei einem Plüschhasen. Ich glaub, da hat’s bei ihr angefangen.'),
    ], { choices: zurueck }),
    knoten('rekrut-voll', [
      N('Ganz? Mit Kämpfen und allem? Und ich darf mitreden, wenn’s um den Plan geht?', 'ueberrascht'),
      N('Okay. Okay okay okay. Ich hab im Turm gelernt, wie Quantum seine Drohnen denkt. Das ist jetzt meins. Die haben’s mir ja quasi geschenkt.', 'signatur'),
    ]),
  ];
  return { choices, nodes };
}

// ---------------------------------------------------------------------------------------------- Herz-Ereignisse 8 und 10

export const he8 = dialog('he-nyra-8', [
  knoten('start', [
    erz('High Voltage, Abend. Am Stammtisch sitzt die ganze Crew, und es ist so still, dass man die Kühlschränke hinter dem Tresen brummen hört. Nyra steht davor, die Hände in den Ärmeln, die Kapuze ausnahmsweise unten.'),
  ], {
    choices: [
      { text: '(Weiter.)', when: { flag: 'nyra_fehlt_am_meer' }, next: 'nachgekommen' },
      { text: '(Weiter.)', when: { notFlag: 'nyra_fehlt_am_meer' }, next: 'rede' },
    ],
  }),
  knoten('nachgekommen', [
    N('Ihr seid ohne mich ans Meer gefahren. Ich bin mit dem Shuttle hinterher. Vier Stunden. Neben einem Mann mit einer Ziege. Die Ziege hat meinen Ärmel gegessen.', 'wut'),
    N('Ich bin nicht sauer. Doch, bin ich. Aber nur ein bisschen. Ich hab ja auch nichts gesagt. Das ist der Punkt. Darum bin ich hier.', 'trauer'),
  ], { next: 'rede' }),
  knoten('rede', [
    N('Ich hab im Labor gesagt, was die hören wollten. „Master.“ Zu Blade. Jeden Morgen. Ich weiß nicht mehr, wie viel davon gespielt war.', 'trauer'),
    N('Ich hab Alesa Kaffee gebracht. Ich hab gelacht, wenn Blade Witze gemacht hat. Seine Witze sind SCHLECHT. Ich hab trotzdem gelacht. Laut.'),
    N('Es tut mir leid. Allen. Vor allem dir, Hunter. Du hast mir einen Schlüssel gegeben. Für den Müll. Aber einen Schlüssel.'),
    erz('Hunter putzt seine Sonnenbrille. Dante starrt in seinen Kaffee. Vega guckt Nyra an, ohne zu blinzeln. Und alle anderen gucken auf dich.'),
  ], {
    choices: [
      { text: 'Neben sie treten. „Sie hat uns nicht verraten. Sie hat überlebt. Das ist was anderes.“', check: pruefung('he-nyra-8-beistand', 'ausstrahlung', 7, ['trost', 'ueberreden']), next: 'beistand', effects: [herz('nyra', 60)] },
      { text: '„Nyra. Zeig ihnen dein Log vom Turm. Alles.“', check: pruefung('he-nyra-8-log', 'technik', 7, ['hacken', 'terminal']), next: 'log', effects: [herz('nyra', 60), herz('dante', 20)] },
      { text: '„Du hast versprochen, schneller zurückzukommen, als wir denken. Hast du.“', tag: '[Teamgeist]', when: { flag: 'nyra_teamgeist' }, next: 'versprechen', effects: [herz('nyra', 50)] },
      { text: 'Einfach neben sie stellen. Nichts sagen.', next: 'still', effects: [herz('nyra', 40)] },
      { text: '„Hättest du mal früher den Mund aufgemacht.“', next: 'hart', effects: [herz('nyra', -20)] },
    ],
  }),
  knoten('beistand', [
    erz('Du sagst es nicht laut. Du sagst es so, dass jeder am Tisch sich ein bisschen schämt, dass er es nicht zuerst gesagt hat.'),
    A('… Scheiße. Ja. Ich war auch gechippt, oder? Hat mich einer rausgeschmissen? Nein. Na also.', 'wut'),
  ], { next: 'crew' }),
  knoten('log', [
    erz('Nyra zögert, dann klappt sie den Laptop auf und dreht ihn um. Hunderte Zeilen: „Ja, Master.“ „Sehr gern, Master.“ Und hinter jeder einzelnen, unsichtbar im Zeichensatz versteckt, eine Folge von Nullen und Einsen.'),
    erz('Du übersetzt. Immer derselbe Satz, sechshundertmal: „Der Zentrator war falsch herum.“'),
    D('Sie hat … sie hat jede Zeile signiert. Mit unserem alten Code. Um Himmels Willen, Nyra.', 'ueberrascht'),
    N('Ich wollte, dass irgendwer irgendwann merkt, dass ich noch da bin. Und wenn’s nur ein Server ist.', 'trauer'),
  ], { next: 'crew' }),
  knoten('versprechen', [
    N('… Hab ich. Hab ich wirklich, oder?', 'ueberrascht'),
    erz('Nyra hält dir den kleinen Finger hin. Derselbe Schwur wie damals an der Flutmauer. Diesmal haken alle am Tisch mit ein, einer nach dem anderen, bis eine ziemlich alberne Kette aus Fingern über den Bierdeckeln hängt.'),
  ], { next: 'crew' }),
  knoten('still', [
    erz('Du stellst dich neben sie. Schulter an Schulter. Sie zittert ein bisschen. Dann nicht mehr.'),
  ], { next: 'crew' }),
  knoten('hart', [
    N('… Ja. Hätte ich.', 'trauer'),
    erz('Vega steht auf, geht um den Tisch herum und stellt sich auf Nyras andere Seite. Sie sagt nichts. Sie guckt dich nur an, über achtzig Zentimeter. Das reicht.'),
    V('Sie hat den Mund aufgemacht. Jetzt. Das ist früh genug.', 'wut'),
  ], { next: 'crew' }),
  knoten('crew', [
    H('Schulden muss man immer begleichen.', 'besorgt'),
    H('Du schuldest uns nichts. Wir schulden dir einen besseren Schlüssel.'),
    erz('Hunter schiebt einen Schlüssel über den Tisch. Diesmal ist es nicht der für den Müll. Es ist der für die Vordertür.'),
    D('Du warst nie falsch herum, Nyra. Nur die anderen.', 'freude'),
    V('Dein Hocker. Ich hab ihn warmgehalten. Setz dich, bevor er kalt wird.', 'signatur'),
  ], {
    choices: [
      { text: '(Weiter.)', when: JIMMY_DA, next: 'jimmy' },
      { text: '(Weiter.)', when: { not: JIMMY_DA }, next: 'ende' },
    ],
  }),
  knoten('jimmy', [
    J('Willkommen zurück! Ich darf das sagen. Das ist kein Werbespruch. Das ist ernst gemeint. Ich hab’s geübt.', 'freude'),
  ], { next: 'ende' }),
  knoten('ende', [
    N('Ihr wollt mich noch. Ihr wollt mich wirklich noch.', 'freude'),
    erz('Nyra setzt sich. Auf ihren Hocker. Er ist tatsächlich noch warm.'),
  ], { effects: [flag('nyra_entschuldigt'), { xp: 150 }] }),
]);

export const he10 = dialog('he-nyra-10', [
  knoten('start', [
    erz('Flutmauer, Abend. Nyra sitzt auf der Bank, Kopfhörer auf, die Augen zu, und lächelt so breit, dass es fast wehtut. Sie reicht dir den zweiten Hörer, ohne hinzusehen.'),
  ], {
    choices: [
      { text: '(Weiter.)', when: MEER_GESEHEN, next: 'nach-meer' },
      { text: '(Weiter.)', when: { not: MEER_GESEHEN }, next: 'vor-meer' },
    ],
  }),
  knoten('nach-meer', [
    N('Ich war jetzt da. Am echten. Und ich sitz trotzdem noch hier. Weil ich’s mir hier zuerst vorgestellt hab. Das ist mein Proberaum.', 'freude'),
    N('Hör mal. Das ist das echte Rauschen, aufgenommen am Steg. Und darunter das, was ich mir vorher immer vorgestellt hab. Gebaut. Aus allem, was du mir erzählt hast.'),
  ], { next: 'hoeren' }),
  knoten('vor-meer', [
    N('Hör mal. Wellenrauschen. Ich hab’s nicht aufgenommen. Ich hab’s gebaut. Aus allem, was du mir erzählt hast. Jedes Wort ist eine Welle.', 'freude'),
  ], { next: 'hoeren' }),
  knoten('hoeren', [
    erz('Im Kopfhörer rauscht es. Mal wie ein Lüfter, der nie kaputtgeht. Mal wie Applaus. Mal wie die Kläranlage, wenn man sehr viel lügt. Es klingt nach ihr.'),
    N('Es fehlt was. Ich weiß nicht, was. Irgendwas, das nicht von mir ist.', 'besorgt'),
  ], {
    choices: [
      { text: 'Leise eine Melodie in das Mikro summen. Irgendwas aus der Ödnis, das du nicht mehr ganz kannst.', check: pruefung('he-nyra-10-summen', 'ausstrahlung', 5, ['buehne', 'trost']), next: 'summen', effects: [herz('nyra', 40)] },
      { text: 'Das Brummen der Kläranlage als Bass drunterlegen. Das gehört genauso dazu.', check: pruefung('he-nyra-10-bass', 'technik', 6, ['hacken', 'maschine']), next: 'bass', effects: [herz('nyra', 40)] },
      { text: 'Eine frische Muschel aus der Tasche holen und ans Mikro halten.', when: { item: 'muschel-frisch' }, next: 'muschel', effects: [{ take: 'muschel-frisch' }, herz('nyra', 60)] },
      { text: 'Nichts hinzufügen. Nur zuhören. Lange.', next: 'zuhoeren', effects: [herz('nyra', 30)] },
    ],
  }),
  knoten('summen', [
    erz('Du summst. Schief. Nyra nimmt es trotzdem auf, schneidet es in Stücke und legt es zwischen die Wellen, so leise, dass man es nur hört, wenn man weiß, dass es da ist.'),
    N('Das bist du. Ganz unten. Wie ein Leuchtturm, der nicht leuchtet, sondern summt.', 'freude'),
  ], { next: 'geschenk' }),
  knoten('bass', [
    erz('Ihr legt das Brummen der Kläranlage unter die Wellen. Plötzlich klingt es nicht mehr nach Postkarte. Es klingt nach hier. Nach Noxius mit Blick aufs Wasser.'),
    N('Das ist … das ist eklig schön. Das ist das Unterstadt-Meer. Das gibt es nur bei uns.', 'ueberrascht'),
  ], { next: 'geschenk' }),
  knoten('muschel', [
    erz('Du hältst die Muschel ans Mikro. Nyra hört zu, mit offenem Mund. Durch die Muschel klingt das Rauschen, als käme es von sehr weit her und wäre trotzdem schon angekommen.'),
    N('Eine echte. Die nimmst du nicht wieder mit. Die gehört jetzt in den Song. Und auf mein Regal. Und unter mein Kopfkissen. Ich entscheid mich noch.', 'freude'),
  ], { next: 'geschenk' }),
  knoten('zuhoeren', [
    erz('Ihr hört zu. Bis die Sonne im Smog versinkt wie ein Kaugummi in einer Pfütze. Bis es kalt wird. Nyra rückt näher, Kapuze an Schulter.'),
    N('Das war das Fehlende. Dass jemand mithört.', 'trauer'),
  ], { next: 'geschenk' }),
  knoten('geschenk', [
    N('Hier. Der Chip. Für dich. Damit du’s immer dabeihast. Auch wenn wir mal nicht am Meer sind. Oder wenn du in einem Kampf stehst und alles laut ist.'),
  ], {
    choices: [
      { text: '(Weiter.)', when: ENDE_NEXUS, next: 'nexus' },
      { text: '(Weiter.)', when: { not: ENDE_NEXUS }, next: 'ende' },
    ],
  }),
  knoten('nexus', [
    N('Nexus hat mir beim Rechnen geholfen. Sie sagt, jede Welle ist eine Primzahl, wenn man sich Mühe gibt. Sie lügt. Aber sie lügt nett. Das lernt sie gerade.', 'signatur'),
  ], { next: 'ende' }),
  knoten('ende', [
    N('Und wenn du’s anhörst, denk dran: Wir fahren hin. Immer wieder. Mit Eimer.', 'signatur'),
    erz('Andenken erhalten: Nyras Wellenchip.'),
  ], { effects: [{ give: 'nyra-wellenchip' }, { xp: 150 }] }),
]);

// ---------------------------------------------------------------------------------------------- Tagesgespräche ab Akt 2

export function akt23(M: Menue): Akt23 {
  const T = {
    labor: tagesgespraech('nyra-tag-labor',
      [
        erz('Nyra sitzt kerzengerade an einem weißen Pult, in einem weißen Kittel, mit einem weißen Lächeln. Hinter ihrem Ohr blinkt ein Chip im Takt eines sehr ruhigen Herzens.'),
        N('Guten Abend. Ich bin ausgezeichnet, danke der Nachfrage. Der Master befindet sich im Himmelsgarten. Darf ich Ihnen einen Termin eintragen?'),
      ],
      [N('Hier gibt es keine Selfies. Selfies sind ineffizient. Ich habe meine Fotos gelöscht. Alle viertausenddreihundertzwölf.')],
      {
        choices: [
          { text: '„Der Zentrator war falsch herum.“', tag: '[Nyra ♥4]', requires: { hearts: 'nyra', min: 4 }, next: 'zentrator' },
          { text: '„Wenn du zurückkommst, wollen wir dich noch.“', next: 'zurueck' },
          { text: 'Gehen.' },
        ],
        nodes: [
          knoten('zentrator', [
            erz('Das Lächeln bleibt. Aber unter dem Pult tippt ihr Zeigefinger dreimal auf die Tischplatte. Kurz, lang, kurz.'),
            N('(sehr leise) Ich weiß. Ich hab ihn falsch herum gelassen. Jetzt geh, bevor Alesa guckt. Und gieß meinen Kaktus. Ich hab keinen Kaktus. Gieß trotzdem was.', 'besorgt'),
          ]),
          knoten('zurueck', [
            N('Diese Aussage ergibt keinen Sinn. Ich bin nicht weg. Ich bin hier. Ich bin genau da, wo der Master mich haben möchte.'),
            erz('Ihre Stimme bricht nicht. Aber ihre Hand legt sich kurz flach auf die Tischplatte, als wolle sie sich festhalten.'),
          ], { effects: [herz('nyra', 10)] }),
        ],
      }, { plauschText: 'Nyra. Ich bin’s.' }),
    master: tagesgespraech('nyra-tag-master',
      [
        N('Nein. Nicht reden. Du bist auf meiner Entfolgt-Liste. Ganz oben. Noch über Blade. Herzlichen Glückwunsch.', 'wut'),
        N('Ich hab dir mal vertraut. Mit Postkarten und allem. Und jetzt sitzt du in seinem Sessel und lässt dich „Master“ nennen.'),
      ],
      [N('Ich hab das Wort sechshundertmal gesagt, um zu überleben. Du sagst es freiwillig. Weißt du, wie eklig das ist?', 'trauer')],
      { choices: [{ text: 'Gehen.' }], nodes: [] }, { plauschText: 'Nyra, bitte.' }),
    ende3b: tagesgespraech('nyra-tag-ende-3b',
      [
        N('DU! Du bist da! Am Wasser! Ohne Sessel! Ohne „Master“!', 'ueberrascht'),
        N('Ich hab dich wieder abonniert. Gerade eben. Mit Glocke. Die Glocke ist das Wichtigste.', 'freude'),
      ],
      [N('Raven sagt, du teilst ja doch. Ich sag: Teilen ist das, was man macht, wenn man nicht mehr allein sein will. Hab ich von Dante. Hat er nie so gesagt. Ich hab’s verbessert.', 'signatur')],
      M, { effects: [flag('nyra_kommentar_ende'), herz('nyra', 40)] }),
    endeMeer: tagesgespraech('nyra-tag-ende-meer',
      [
        N('Wir waren da. Wir WAREN da. Ich hab neunhundert Fotos gemacht und auf keinem guck ich überrascht. Auf allen guck ich glücklich. Das ist neu. Mein Gesicht muss sich erst dran gewöhnen.', 'freude'),
      ],
      [N('Blade wird abgeführt, live, und Collin hat dabei geweint. Vor Freude, sagt er. Ich glaub, es war Heuschnupfen. Am Meer gibt es Gras. ECHTES Gras.', 'signatur')],
      M, { effects: [flag('nyra_kommentar_ende'), herz('nyra', 30)] }),
    endeNexus: tagesgespraech('nyra-tag-ende-nexus',
      [
        N('Nexus und ich schreiben uns jetzt. Ist das komisch? Das ist komisch. Sie war mein Gefängnis und jetzt fragt sie mich, wie man Witze erkennt.', 'besorgt'),
        N('Ich hab ihr gesagt: Wenn alle lachen außer Blade, war’s ein Witz. Sie hat das als Formel gespeichert.'),
      ],
      [N('Ich trau ihr. Ein bisschen. Mehr als Vega. Weniger als Captain Kuschel. Irgendwo dazwischen, wo man Leute hinstellt, die sich Mühe geben.', 'signatur')],
      M, { effects: [flag('nyra_kommentar_ende'), herz('nyra', 30)] }),
    nachgeholt: tagesgespraech('nyra-tag-nachgeholt',
      [
        N('Ich bin mit dem Shuttle nachgekommen. Ans Meer. Allein. Ihr wart schon da. Ihr hattet schon Sonnenbrand.', 'trauer'),
        N('Egal. Ich hab Sonnencreme mitgebracht. Für alle. Ich bin die Einzige ohne Sonnenbrand. Moralischer Sieg.', 'signatur'),
      ],
      [N('Ich muss der Crew noch was sagen. Allen zusammen. Wenn ich mich traue. Im HV, abends. Ich übe noch vor dem Spiegel. Der Spiegel ist streng.', 'besorgt')],
      M, { effects: [flag('nyra_kommentar_nachgeholt')] }),
    strand: tagesgespraech('nyra-tag-strand',
      [
        erz('Nyra kniet im Sand neben einem Eimer, der endlich einen Zweck hat. Darin: Wasser, drei Muscheln, ein sehr empörter Krebs.'),
        N('Guck! Karl! Er heißt Karl! Er hat mich zweimal gezwickt, und ich hab ihn trotzdem lieb! Das ist Freundschaft!', 'freude'),
      ],
      [N('Ich hab das Laptop seit drei Tagen nicht aufgeklappt. DREI TAGE. Mein Feed ist tot. Ich vermiss ihn nicht. Okay, ein bisschen. Ich poste nachher ein Foto von Karl.', 'signatur')],
      M),
    flutmauer: tagesgespraech('nyra-tag-flutmauer-nachspiel',
      [N('Ich sitz trotzdem noch hier. Komisch, oder? Das Meer ist ganz echt, zwei Stunden mit dem Shuttle. Und ich sitz an der Flutmauer und guck auf die Kläranlage.', 'freude')],
      [N('Hier hab ich angefangen, es mir vorzustellen. Man verlässt den Ort nicht, an dem man angefangen hat zu träumen. Man besucht ihn. Mit Snacks.')],
      M),
  };

  const dialogues = [...Object.values(T), he8, he10];

  const talk = [
    rede('nyra-tag-labor', NYRA_IM_TURM),
    rede('nyra-tag-master', MASTER),
    rede('nyra-tag-ende-3b', { all: [ENDE_3B, { notFlag: 'nyra_kommentar_ende' }] }),
    rede('nyra-tag-nachgeholt', { all: [NACHSPIEL, { flag: 'nyra_fehlt_am_meer' }, { notFlag: 'nyra_kommentar_nachgeholt' }, { not: { seen: 'he-nyra-8' } }] }),
    rede('nyra-tag-ende-meer', { all: [NACHSPIEL, ENDE_MEER, { notFlag: 'nyra_kommentar_ende' }] }),
    rede('nyra-tag-ende-nexus', { all: [NACHSPIEL, ENDE_NEXUS, { notFlag: 'nyra_kommentar_ende' }] }),
    rede('nyra-tag-strand', { all: [NACHSPIEL, { time: ['morgen', 'tag'] }] }),
    rede('nyra-tag-flutmauer-nachspiel', { all: [NACHSPIEL, { time: 'abend' }, { weekday: ['mo', 'di', 'mi', 'do', 'fr'] }] }),
  ];

  const schedule: ScheduleEntry[] = [
    { when: NYRA_IM_TURM, place: { map: 'quantum-labor', at: 'nyras-arbeitsplatz' }, dialogue: 'nyra-tag-labor' },
    { when: PARTYNACHT, place: 'away' },
    { slot: 'abend', when: MASTER, place: { map: 'flutmauer', at: 'nyra-bank' }, dialogue: 'nyra-tag-master' },
    { when: MASTER, place: 'away' },
    { slot: ['morgen', 'tag'], when: NACHSPIEL, place: { map: 'das-meer', at: 'nyra-muschelplatz' } },
  ];

  // Akt 2: Nyra im Turm, „nur Telefon“. Die erste Nachricht ist ein Akrostichon (K-U-S-C-H-E-L).
  const phone = {
    'tel-nyra-turm-1': {
      id: 'tel-nyra-turm-1', from: 'nyra',
      text: 'Kontaktversuche sind zwecklos.\nUnterlassen Sie weitere Nachrichten.\nSicherheitsprotokoll aktiv.\nChip arbeitet einwandfrei.\nHier ist alles ausgezeichnet.\nEnde der Mitteilung.\nLang lebe der Master.\n– N.',
      auto: { all: [AKT2, NYRA_IM_TURM] },
      replies: [
        { text: '„… Kuschel?“', effects: [flag('nyra_akrostichon'), herz('nyra', 20)] },
        { text: '„Verstanden, Master-Assistentin.“' },
      ],
    },
    'tel-nyra-turm-2': {
      id: 'tel-nyra-turm-2', from: 'nyra',
      text: 'Systemmeldung: Gerücht über Wiedereröffnung einer Werkstatt in der Neon-Gasse registriert. Bitte bestätigen Sie, dass ist er wirklich dabei?? IST ER WIRKLICH DABEI. Fehler. Nachricht bitte ignorieren.',
      auto: { all: [AKT2, NYRA_IM_TURM, DANTE_CREW] },
      replies: [
        { text: '„Er ist dabei. Er hat nach dir gefragt.“', effects: [herz('nyra', 20)] },
        { text: '„Ignoriert.“' },
      ],
    },
    'tel-nyra-turm-3': {
      id: 'tel-nyra-turm-3', from: 'nyra',
      text: 'Für die Releaseparty wurde mir ein weißes Kleid zugeteilt. Ich hasse Weiß. Weiß ist die Farbe von Leuten ohne Geheimnisse. Bitte kommt nicht. Bitte kommt.',
      auto: { all: [AKT2, NYRA_IM_TURM, PARTY_PLAN] },
      replies: [
        { text: '„Wir kommen. Zieh was drunter, was nicht weiß ist.“', effects: [herz('nyra', 20)] },
        { text: '„Weiß steht dir bestimmt.“', effects: [herz('nyra', -5)] },
      ],
    },
    'tel-nyra-meer-nachspiel': {
      id: 'tel-nyra-meer-nachspiel', from: 'nyra',
      text: 'ICH HAB EINEN KREBS GETROFFEN. ER HAT MICH GEZWICKT. ER HEISST KARL. (Der Eimer hat jetzt einen Zweck. Komm morgens an den Strand, ich stell euch vor.)',
      auto: { all: [NACHSPIEL, MEER_GESEHEN] },
    },
  };

  return { dialogues, talk, schedule, phone };
}

/** Nyra ist da (nicht im Turm, nicht auf der Party, kein Master-Modus) – für Akt-1-Herz-Ereignisse und Telefon. */
export const NYRA_DA: Condition = { all: [{ not: NYRA_IM_TURM }, { not: PARTYNACHT }, { not: MASTER }] };
/** Volle Begleiterin (ab Akt 3 bzw. Nachspiel, world.md §4.6). */
export const NYRA_VOLL: Condition = { any: [{ flag: 'nyra_befreit' }, NACHSPIEL] };
