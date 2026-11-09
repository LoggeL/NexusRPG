// Lio Funkel – Straßenmusiker mit Synth-Akkordeon (world.md §4.4, §4.6, §4.7 „Lied ohne Reim“, §11.2).
// Tagesablauf nach design/plan/act1.json (npcSchedules.lio-funkel), Herz-Ereignisse he-lio-funkel-2/4/6 in Akt 1,
// he-lio-funkel-8/10 angelegt und an act2 gebunden. Begleiter ab ♥6, laut §11.2 aber erst ab act2.
// Romanze nur über { romance: 'lio-funkel' } (content/romance.ts, ab ♥8). Persönliche Quest pers-lio-album baut der
// Quest-Agent; hier nur der Auftakt. Lieder ändern sich nach Questfortschritt (Menü „Spiel mir was“).
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode, NpcDef, Weekday } from '../../../modules/contracts';
import {
  type Menue, einmalig, AKT2, VOR_AKT2, abblende, alle, dialog, eins, erz, flag, herz, herzEreignis, knoten, nicht,
  pruefung, rede, sammle, sammleSzenen, sprecher, tagesgespraech, ZEIT_HINWEIS, erweitere,
} from './_lib';
import { MENUE_23, STADTHIT, akt23 } from './lio-akt23';
import { fremdFlirtLoeschen, fremdGeflirtet, geflirtet } from '../npc-crew-a/_helfer';

const ID = 'lio-funkel';
const L = sprecher(ID);
const A = sprecher('aria');

const ROM: Condition = { romance: ID };
/** Flirtzeilen ab ♥6, sobald die Romanze freigeschaltet ist (Engine: romanceEnabled); Kuss/Nacht bleiben an ROM (♥8). */
const FLIRT: Condition = { all: [{ romanceEnabled: ID }, { hearts: ID, min: 6 }] };
const AUGE: Condition = { quest: 'side-zweite-hand', state: 'done' };
/** Paar (Kuss unter der Lichterkette) und heute mit einer anderen freigegebenen Figur geflirtet (world.md §4.7). */
const ZUSAMMEN: Condition = { all: [ROM, { flag: 'lio-funkel_romanze_zusammen' }] };
const FREMD: Condition = fremdGeflirtet(ID);
const done = (quest: string): Condition => ({ quest, state: 'done' });

// ---------------------------------------------------------------------------------------------- Menü

function menue(): Menue {
  const zurueck: DialogueChoice[] = [{ text: 'Noch was, Lio.', next: 'menue', id: 'zurueck' }, { text: 'Bis später.' }];

  const flirt = (n: number, tage: Weekday[]): DialogueChoice => ({
    text: 'Mit Lio flirten.', tag: '[Romanze]', next: `flirt-${n}`, id: `flirt-${n}`,
    when: alle(FLIRT, { weekday: tage }), effects: [geflirtet(ID)],
  });
  const antworten: DialogueChoice[] = [
    { text: '„Reim auf göttlich? ‚Verboten köstlich.‘ Gern geschehen.“', check: pruefung('lio-flirt-frech', 'ausstrahlung', 6, ['flirt']), next: 'flirt-a' },
    { text: '„Dann spiel in Moll. Ich mag gefährlich.“', next: 'flirt-b' },
    { text: '„Spiel einfach, Funkel.“', next: 'flirt-c' },
  ];

  const choices0: DialogueChoice[] = [
    { text: 'Spiel mir was.', next: 'lieder', id: 'lieder' },
    { text: 'Warum kneifst du beim Spielen die Augen zusammen?', when: nicht(AUGE), once: true, id: 'l-augen', next: 'augen' },
    {
      // side-zweite-hand (Dante): Lio bekommt sein Augenimplantat. Die Quest zählt den Schritt über zh_lio
      // (zh_lio_bezahlt, wenn die Spielfigur zahlt); zweite_hand_lio bleibt als alter Name mitgesetzt.
      text: 'Dante schickt dich was. Dein Augenimplantat.', next: 'implantat', id: 'l-implantat',
      when: alle({ quest: 'side-zweite-hand', state: 'active' }, { item: 'augenimplantat-lio' }, { notFlag: 'zh_lio' }, { notFlag: 'zweite_hand_lio' }),
    },
    { text: '„Läuft hier eigentlich noch Radio Rost? Draußen haben wir das jeden Abend gehört.“', tag: '[Ödnis]', when: { origin: 'origin-oednis' }, once: true, id: 'l-oednis', next: 'oednis' },
    { text: 'Wovon lebst du eigentlich?', once: true, id: 'l-leben', next: 'leben' },
    {
      text: 'Du wolltest doch ein Album machen.', next: 'album', id: 'l-album',
      when: alle({ seen: 'he-lio-funkel-4' }, { quest: 'pers-lio-album', state: 'inactive' }),
    },
    { text: 'Wie läuft das Album?', when: { quest: 'pers-lio-album', state: 'active' }, next: 'album-stand', id: 'l-album-stand' },
    { text: 'Hast du Lust, mal mitzukommen? Musik im Rücken kann ich brauchen.', requires: { hearts: ID, min: 6 }, tag: '[Lio ♥6]', when: alle(VOR_AKT2, { seen: 'he-lio-funkel-6' }), next: 'mit-bald', id: 'l-mit-bald' },
    { text: 'Komm mit. Wir haben Arbeit.', requires: { hearts: ID, min: 6 }, tag: '[Lio ♥6]', when: alle(AKT2, nicht({ recruited: ID })), next: 'mit', effects: [{ recruit: ID }] },
    { text: 'Bleib heute hier, Lio.', when: { companion: ID }, next: 'weg', effects: [{ dismiss: ID }] },
    flirt(1, ['mo', 'fr']),
    flirt(2, ['di', 'sa']),
    flirt(3, ['mi', 'so']),
    flirt(4, ['do']),
    { text: 'Bis später.' },
  ];

  // Lieder nach Fortschritt (world.md §4.4: „die Lieder ändern sich nach Flags“). Neueste zuerst.
  const lieder0: DialogueChoice[] = [
    { text: 'Spiel „Rost und Rosen“.', when: { flag: 'lio_hit_rost' }, next: 'hit-rost' },
    { text: 'Spiel „Kein Ticket ans Meer“.', when: { flag: 'lio_hit_meer' }, next: 'hit-meer' },
    { text: 'Spiel „Tritt die Tür ein“.', when: { flag: 'lio_hit_tuer' }, next: 'hit-tuer' },
    { text: 'Das Lied über Jimmy.', when: done('side-jimmys-chip'), next: 'lied-jimmy-da' },
    { text: 'Das Lied über Jimmy.', when: nicht(done('side-jimmys-chip')), next: 'lied-jimmy-weg' },
    { text: 'Das mit dem Rattenkönig.', when: done('side-rattenkoenig'), next: 'lied-nagbert' },
    { text: 'Das vom Hund, der Netze klaut.', when: done('side-hunde-der-brackbucht'), next: 'lied-bolzen' },
    { text: 'Das über Raven.', when: done('main-1-auf-raven'), next: 'lied-raven' },
    { text: 'Das über den Neuen bei Hunter.', when: done('main-1-probezeit'), next: 'lied-probezeit' },
    { text: 'Irgendwas. Was Altes.', next: 'lied-rostregen' },
    { text: 'Einen Zehner in den Hut werfen.', once: true, id: 'l-hut', next: 'hut', effects: [{ credits: -10 }, herz(ID, 10)] },
    { text: 'Lass gut sein.', next: 'menue' },
  ];

  const lieder = einmalig(ID, lieder0);
  const nachLied: DialogueChoice[] = [{ text: 'Noch eins!', next: 'lieder' }, ...zurueck];

  const choices = einmalig(ID, choices0);
  const nodes: DialogueNode[] = [
    knoten('menue', [L('Noch was? Ich hab Zeit. Musiker haben immer Zeit. Nur kein Geld. Zeit und kein Geld, das reimt sich nicht mal.')], { choices }),
    knoten('lieder', [L('Wünsch dir was. Aber nicht „Wonderwall“. Wer „Wonderwall“ will, kriegt das Akkordeon über die Rübe.', 'signatur')], { choices: lieder }),
    knoten('lied-rostregen', [
      erz('Lio zieht das Akkordeon auf. Es klingt wie eine Kirchenorgel, die man in einen Koffer gestopft hat.'),
      L('„Rostregen, Rostregen, auf meinem Hut, / die Stadt ist ein Arschloch, doch heute geht’s gut …“', 'signatur'),
      L('Das ist alt. Das hab ich mit sechzehn geschrieben. Damals fand ich das Wort „Arschloch“ revolutionär.'),
    ], { choices: nachLied }),
    knoten('lied-probezeit', [
      L('„Kam einer runter mit leerer Tasche, / Hunter sprach: Zahl oder wasch die Flasche …“', 'freude'),
      L('Das bist übrigens du. Die Leute am Bahnsteig lieben die Strophe, wo du die Kasse zählst. Ich hab sie erfunden. Die Strophe, nicht die Kasse.'),
    ], { choices: nachLied }),
    knoten('lied-raven', [
      L('„Sieben Jahre Eisen, sieben Jahre Wand, / jetzt läuft sie durch den Regen mit dem Messer in der Hand …“', 'trauer'),
      L('Raven hat’s gehört. Sie hat nichts gesagt. Sie hat mir nur einen Zwanziger in den Hut gelegt und mich angeguckt, als würde sie mich gleich filetieren. Bestes Feedback ever.'),
    ], { choices: nachLied }),
    knoten('lied-jimmy-weg', [
      L('„Wo ist Jimmy, wo ist Jimmy, wo ist der Typ mit der Jacke? / Er sang mal schiefer als ich, jetzt singt er Werbung für Kacke …“', 'trauer'),
      L('Ich spiel das jeden Tag. Vielleicht hört er’s ja irgendwo. Und kommt rüber und sagt, dass ich den Akkord falsch greife. Das sagt er nämlich immer.'),
    ], { choices: nachLied }),
    knoten('lied-jimmy-da', [
      L('„Jimmy ist wieder da, Jimmy ist zurück, / er schuldet allen Kohle, aber hey – zum Glück!“', 'freude'),
      L('Er hat gesagt, ich greif den Akkord falsch. Ich hab geheult. Vor Freude. Und weil ich den Akkord tatsächlich falsch greife.'),
    ], { choices: nachLied }),
    knoten('lied-nagbert', [
      L('„Unten im Kanal, da regiert eine Ratte, / mit Krone aus Kronkorken und null Krawatte …“', 'freude'),
      L('Bürgermeister Gully hat mir eine Urkunde geschickt. „Hofbarde der Rohre“. Sie riecht. Ich hab sie trotzdem eingerahmt.'),
    ], { choices: nachLied }),
    knoten('lied-bolzen', [
      L('„Er klaute Netze, er klaute Leinen, / jetzt pinkelt er Funken an fremde Beine …“', 'signatur'),
      L('Der Hund heißt Bolzen? Gut. Bolzen reimt sich auf „holzen“. Und auf „Stolzen“. Ich hab noch nicht entschieden, welche Richtung das Lied nimmt.'),
    ], { choices: nachLied }),
    knoten('hit-rost', [
      erz('Kaum spielt Lio die ersten Takte, singen zwei Pendler und ein Rostzahn mit. Der Rostzahn kann den Text. Den GANZEN Text.'),
      L('„Rost und Rosen, Rost und Rosen …“ Unser Lied. Die Kinder am Schrottmarkt singen es falsch. Das ist der Moment, wo man weiß: Es ist ein Hit.', 'freude'),
    ], { choices: nachLied }),
    knoten('hit-meer', [
      erz('Lio spielt leise. Eine alte Frau am Bahnsteig wischt sich über die Augen und tut so, als wäre es Smog.'),
      L('„Kein Ticket ans Meer …“ Die Leute schreiben mir, dass sie dabei an ihre Mütter denken. Oder an ihre Ex. Hauptsache, sie denken was.', 'zaertlich'),
    ], { choices: nachLied }),
    knoten('hit-tuer', [
      erz('Beim Refrain stampft der halbe Bahnhof. Ein Ordnungshüter klopft mit dem Schlagstock den Takt und schämt sich danach.'),
      L('„Tritt die Tür ein!“ Das brüllen die jetzt bei Schlägereien. Ich weiß nicht, ob ich stolz sein soll. Ich bin stolz.', 'signatur'),
    ], { choices: nachLied }),
    knoten('hut', [
      L('Ein Zehner! Echt? Das ist … das ist eine Mahlzeit. Oder zwei Saiten. Oder eine Mahlzeit, die nach Saiten schmeckt.', 'ueberrascht'),
      L('Danke. Ehrlich. Für dich spiel ich die nächste Strophe richtig herum.'),
    ], { choices: nachLied }),
    knoten('augen', [
      L('Ach, das. Meine Augen sind Mist. Die Noten sehen aus wie Ameisen auf Speed.', 'verlegen'),
      L('Ich spiel nach Gehör. Das geht. Nur wenn ich was Neues lernen will, kleb ich mit der Nase am Papier und die Leute denken, ich riech an Notenblättern. Was ich manchmal auch tu. Die riechen gut.'),
      L('Dante meinte, er hätte ein altes Augenimplantat rumliegen. „Repariert, fast neu, nur einmal explodiert.“ Wenn du ihn siehst … frag mal. Bitte.'),
    ], { choices: zurueck }),
    knoten('implantat', [
      erz('Du gibst Lio die kleine Dose. Darin liegt ein Augenimplantat, poliert, mit Dantes Zettel: „Nicht reinsehen, während es lädt. Doch, du wirst. Okay. Dann blinzeln.“'),
      L('Oh. Oh Scheiße. Das ist … das ist echt?', 'ueberrascht'),
      L('Was kostet das? Ich hab … warte … elf Credits und einen Knopf.', 'verlegen'),
    ], {
      choices: [
        {
          text: 'Ich leg die 60 Credits für Dante aus.', next: 'implantat-bezahlt', requires: { credits: 60 },
          effects: [{ credits: -60 }, { take: 'augenimplantat-lio' }, flag('zh_lio'), flag('zh_lio_bezahlt'), flag('zweite_hand_lio'), flag('zweite_hand_lio_bezahlt'), herz(ID, 40)],
        },
        {
          text: '„Dante sagt, das ist gratis. Er sagt das immer.“', next: 'implantat-gratis',
          effects: [{ take: 'augenimplantat-lio' }, flag('zh_lio'), flag('zweite_hand_lio')],
        },
      ],
    }),
    knoten('implantat-bezahlt', [
      L('Du … hast bezahlt. Für mich. Ich schreib dir ein Lied. Nein, zwei. Eins davon wird peinlich, das ist versprochen.', 'zaertlich'),
    ], { next: 'implantat-ende' }),
    knoten('implantat-gratis', [
      L('Gratis. Natürlich. Dante würde auch sein letztes Hemd verschenken, wenn er eins hätte, das nicht nach Lötzinn riecht.', 'freude'),
    ], { next: 'implantat-ende' }),
    knoten('implantat-ende', [
      erz('Lio klickt das Implantat ein, blinzelt, blinzelt nochmal – und starrt auf ein Notenblatt, als hätte es ihm gerade einen Heiratsantrag gemacht.'),
      L('Das ist ein Fis. Das war die ganze Zeit ein Fis. Ich spiel seit zwölf Jahren ein G. Ich muss mich bei so vielen Leuten entschuldigen.', 'ueberrascht'),
    ], { choices: zurueck }),
    knoten('oednis', [
      L('Radio Rost! Du kennst Radio Rost? Das ist der Sender mit dem Typen, der nur alte Lieder spielt und dazwischen das Wetter vorliest! Immer „Sand“!', 'ueberrascht'),
      L('Ich bin auch von draußen, weißt du. Aussiedlerhof, dritter Brunnen links. Ich hab mit acht Lieder aus dem Radio nachgesungen, bis mein Vater das Radio im Brunnen versenkt hat.'),
      L('Wenn du je ein Band mit Radio-Rost-Liedern siehst – bring’s mir. Ich zahl dich in Strophen aus.', 'freude'),
    ], { choices: zurueck, effects: [herz(ID, 50)] }),
    knoten('leben', [
      L('Vom Hut. Vom Hut und von Babettes Resten. Und manchmal spiel ich auf Beerdigungen. Beerdigungen zahlen gut, und keiner beschwert sich über falsche Töne.', 'signatur'),
      L('Dienstags Karaoke im High Voltage. Samstags darf ich nachts auf die Bühne, wenn Hunter gute Laune hat. Hunter hat nie gute Laune. Ich spiel trotzdem.'),
    ], { choices: zurueck }),
    knoten('album', [
      L('Ja. Ja! Ein ganzes Album. Aber nicht so ein glattes Oberstadt-Ding. Ich will die Stadt drauf. Wie sie wirklich klingt.', 'freude'),
      L('Sechs Klänge. Das Nebelhorn am Hafen. Dantes Keksalarm. Die Rennhalle. Der Kanalrechen. Die Tauben am Taubenschlag. Und Applaus. Echter Applaus. Für mich. Das wird das Schwerste.'),
      L('Hilfst du mir? Ich hab ein Aufnahmegerät, das nur manchmal brennt.', 'verlegen'),
    ], {
      choices: [
        { text: 'Klar. Wir nehmen die Stadt auf.', next: 'album-ja', effects: [{ startQuest: 'pers-lio-album' }] },
        { text: 'Später, Lio.', next: 'menue' },
      ],
    }),
    knoten('album-ja', [L('Ja! Okay! Ich mach dir eine Liste. Mit Sternchen. Die Sternchen bedeuten „wahrscheinlich gefährlich“.', 'freude')], { choices: zurueck }),
    knoten('album-stand', [
      L('Ich hör mir die Aufnahmen jede Nacht an. Das Nebelhorn klingt wie ein trauriger Wal. Perfekt. Der Kanalrechen klingt wie meine Ex beim Frühstück. Auch perfekt.', 'signatur'),
      L('Wenn wir alle sechs haben, mach ich daraus was. Was Großes. Vielleicht. Wenn das Gerät nicht vorher brennt.'),
    ], { choices: zurueck }),
    knoten('mit-bald', [
      L('Mitkommen? Mit dir? Wo’s knallt und Leute schreien und keiner zahlt Eintritt?', 'ueberrascht'),
      L('… Ja. Irgendwann ja. Aber noch nicht. Ich muss erst lernen, wie man spielt, während jemand auf einen schießt. Ich übe mit Bruno. Bruno wirft Kronkorken.'),
      erz('Lio wird später Begleiter. (Ab Akt 2.)'),
    ], { choices: zurueck }),
    knoten('mit', [
      L('Ich hol nur Berta. Berta ist das Akkordeon. Berta kommt immer mit. Berta hat schon Schlimmeres gesehen als Quantum.', 'freude'),
    ]),
    knoten('weg', [L('Okay. Ich spiel hier. Wenn du mich brauchst, ruf. Ich komm. Mit Berta. Und mit einem neuen Lied über die letzte Schlägerei.', 'signatur')]),
    // Flirt (Romanzefassung, nur mit { romance: 'lio-funkel' }, world.md §4.7)
    knoten('flirt-1', [L('Ich schreib grad ein Lied über deinen Hintern. Ich finde nur keinen Reim auf „göttlich“.', 'verlegen')], { choices: antworten }),
    knoten('flirt-2', [L('Du bist wie ein falscher Ton. Man kriegt dich nicht mehr aus dem Kopf.', 'zaertlich')], { choices: antworten }),
    knoten('flirt-3', [L('Mein Akkordeon ist eifersüchtig. Es hat recht.', 'signatur')], { choices: antworten }),
    knoten('flirt-4', [L('Wenn du mich so anguckst, spiel ich in Moll. Und in Moll bin ich gefährlich.', 'verlegen')], { choices: antworten }),
    knoten('flirt-a', [
      L('„Verboten köstlich.“ Oh. Oh nein. Das ist besser als alles, was ich die ganze Woche geschrieben hab.', 'ueberrascht'),
      L('Ich klau dir das. Und dann widme ich dir das Lied. Und dann laufe ich rot an, mitten auf der Bühne. Wie immer.', 'zaertlich'),
    ], { choices: zurueck }),
    knoten('flirt-b', [L('Gefährlich. Okay. Ich hab gerade alle Moll-Akkorde vergessen. Alle. Gib mir eine Minute. Oder deine Hand. Hand geht auch.', 'verlegen')], { choices: zurueck }),
    knoten('flirt-c', [L('„Spiel einfach.“ Das sagst du so. Wenn du zuguckst, ist nichts einfach. Aber okay. Für dich: einfach.', 'zaertlich')], { choices: zurueck }),
  ];
  return { choices, nodes };
}

const M = erweitere(menue(), MENUE_23);

/** Rivalität: Spottlied (world.md §4.4). */
const RIVALE: Menue = {
  choices: [
    { text: 'Hör auf mit dem Scheißlied.', next: 'spott' },
    { text: 'Schon gut.' },
  ],
  nodes: [
    knoten('spott', [
      L('„Da läuft {name}, so wichtig, so groß, / im Kopf ist nur Luft und im Herzen ist bloß … nix.“', 'signatur'),
      L('Das Publikum mag’s. Ich mag’s nicht mal. Aber das Publikum. Und das Publikum zahlt.'),
    ]),
  ],
};

// ---------------------------------------------------------------------------------------------- Tagesgespräche

const T = {
  rivale: tagesgespraech('lio-tag-rivale',
    [L('Oh, guckt mal, wer da kommt. Moment, ich hab ein Lied für dich. Es ist nicht nett.', 'signatur')],
    [L('Ich bin nicht nachtragend. Ich bin nachsingend. Das ist schlimmer, das bleibt im Ohr.')],
    RIVALE),
  erstes: tagesgespraech('lio-tag-erstes',
    [
      erz('Ein dünner Typ mit Wollmütze und einem Akkordeon, das blinkt wie ein Spielautomat. Vor ihm ein Hut mit drei Kronkorken und einem Knopf.'),
      L('Hallo! Du bist neu. Ich seh das. Du guckst nach oben. Leute, die schon länger hier sind, gucken nach unten. Wegen der Pfützen. Und der Ratten.', 'freude'),
      L('Lio. Lio Funkel. Musiker. Das Ding hier heißt Berta. Berta ist ein Synth-Akkordeon und hat mehr Kabel als ich Nerven.'),
      L('Ich sing über die Stadt. Was passiert, wer wen verdroschen hat, wer verschwunden ist. Wie Nachrichten, nur ehrlicher. Und mit Reim. Manchmal ungewollt. Das hat sich gerade gereimt. Entschuldigung.', 'verlegen'),
    ],
    [L('Wenn du was erlebst, was ein Lied wert ist – sag Bescheid. Wenn du was erlebst, was zwei Lieder wert ist, sag’s keinem anderen. Exklusivrecht.')],
    M),
  zeit: tagesgespraech('lio-tag-zeit',
    [
      L('{name}. Ich hab da ein Lied. Ein großes. Aber es ist noch nicht fertig. Und ich bin auch noch nicht fertig. Mit mir, meine ich.', 'verlegen'),
      erz(ZEIT_HINWEIS),
    ],
    [L('Manche Lieder brauchen einen Sommer. Manche einen Winter. Das hier braucht, glaub ich, einen ganz großen Knall.')],
    M, { effects: [flag('lio_zeit_hinweis')] }),
  vexaria: tagesgespraech('lio-tag-vexaria',
    [
      L('Schrapnell! Bleib stehen! Ich muss dich was fragen, und zwar künstlerisch.', 'ueberrascht'),
      L('Du und Aria. Auf dem Dach. Die halbe Neon-Gasse hat’s gesehen, die andere Hälfte hat’s gehört. Darf ich darüber ein Lied schreiben? Ich hab schon den Refrain: „Nicht anhalten, nicht anhalten …“', 'freude'),
      A('Wenn du das singst, Funkel, schieb ich dir Berta quer in den Arsch. Mit allen Tasten.'),
      L('… Das ist ein Nein. Das ist ganz klar ein Nein. Ich sing’s nur noch in der Dusche. Ganz leise. Mit Gänsehaut.', 'verlegen'),
    ],
    [L('Ehrlich, ich freu mich für euch. Ihr zwei seid wie ein Lied, das zu laut ist für das Radio. Genau die Sorte, die man nie vergisst.', 'zaertlich')],
    M, { effects: [flag('lio_kommentar_vexaria')] }),
  karaoke: tagesgespraech('lio-tag-karaoke',
    [L('Karaoke-Abend! Ich bin heute Profi-Begleitung. Das heißt: Ich spiele, wenn Collin falsch singt. Also die ganze Zeit.', 'freude')],
    [
      L('Gerade hat ein Rostzahn „Mein Herz ist ein Schweißgerät“ gesungen und dabei geheult. Hunter hat ihm ein Bier hingestellt. Gratis. Hunter! Gratis!', 'ueberrascht'),
      L('Willst du auch? Ich begleite dich. Ich versprech nichts, aber ich spiel lauter als dein Fehler.'),
    ],
    M),
  buehne: tagesgespraech('lio-tag-buehne',
    [L('Samstag. Die Bühne. Meine Bühne. Okay, Hunters Bühne, aber heute Nacht riecht sie nach mir.', 'signatur')],
    [L('Wenn ich da oben steh und die Lichter angehen, vergess ich, dass ich elf Credits hab. Dann bin ich reich. Für drei Minuten und vierzig Sekunden.', 'freude')],
    M),
  nacht: tagesgespraech('lio-tag-nacht',
    [L('Pssst. Hier oben unter den Lichterketten schreib ich. Die Stadt ist nachts leiser. Nur die Reklame summt. Die summt in B-Dur. Hast du das gewusst?', 'zaertlich')],
    [
      L('Manchmal sitz ich hier bis zwei und schreib eine Zeile. Eine einzige. Und am nächsten Morgen ist sie Müll.', 'trauer'),
      L('Aber in der Nacht war sie gut. Das zählt doch auch, oder? Dass sie mal gut war.'),
    ],
    M),
  sehen: tagesgespraech('lio-tag-sehen',
    [
      L('{name}! Ich seh dich! Also, ich hab dich vorher auch gesehen, aber jetzt SEH ich dich. Du hast Sommersprossen. Oder Dreck. Egal, schön!', 'freude'),
      L('Ich les seit drei Tagen alles. Speisekarten. Werbetafeln. Kloschmierereien. Weißt du, was im Klo am Bahnsteig 3 steht? Nein. Willst du nicht wissen.'),
    ],
    [L('Und Noten! Ich hab gestern ein Stück vom Blatt gespielt. Zum ersten Mal. Es war schrecklich. Es war das Schönste, was ich je gemacht hab.', 'zaertlich')],
    M, { effects: [flag('lio_sehen_gesagt')] }),
  abend: tagesgespraech('lio-tag-abend',
    [L('Abendschicht am Schrottmarkt. Hier zahlen sie schlechter als am Bahnhof, aber sie werfen mit besserem Zeug. Gestern: eine Zwiebel. Heute: eine Schraube. Die Zwiebel war besser.', 'signatur')],
    [L('Freya hört mir manchmal zu. Sie sitzt da auf der Kiste und sagt nichts. Dann sagt sie: „War okay.“ Das ist das härteste Lob der Unterstadt.', 'freude')],
    M),
  verliebt: tagesgespraech('lio-tag-verliebt',
    [L('Da bist du. Ich hab den ganzen Tag einen Akkord geübt, der genau so klingt wie du, wenn du lachst. Ich krieg ihn nicht hin. Du musst öfter lachen. Für die Wissenschaft.', 'zaertlich')],
    [L('Hunter hat gesagt, ich soll aufhören, so zu grinsen. Das schreckt die Gäste ab. Ich hab gesagt, das ist kein Grinsen, das ist Kunst. Er hat mir trotzdem den Strom abgedreht.', 'verlegen')],
    M),
  freunde: tagesgespraech('lio-tag-freunde',
    [L('{name}! Setz dich auf die Kiste. Nein, die andere, die da hat einen Nagel. Der Nagel ist für Leute, die „Wonderwall“ wollen.', 'freude')],
    [L('Weißt du, was du bist? Du bist eine Strophe, die man nicht streichen kann. Das ist ein Kompliment. Unter Musikern ist das das größte.', 'zaertlich')],
    M),
  tag: tagesgespraech('lio-tag-bahnhof',
    [L('Bahnhof Mitte, Musikerecke. Die beste Akustik der Unterstadt. Die U-Bahn singt im Bass mit. Sie kann nur einen Ton, aber den richtig.', 'freude')],
    [
      L('Heute lief’s gut. Eine Frau hat mir einen Apfel geschenkt. Einen echten! Ich hab ihn noch nicht gegessen. Ich guck ihn nur an. Er guckt zurück.', 'ueberrascht'),
      L('Ein Typ von Quantum hat mir einen Gutschein für „Chrome 10“ in den Hut gelegt. Ich hab ihn zu Konfetti verarbeitet. Konfetti ist ehrlicher.', 'signatur'),
    ],
    M),
  standard: tagesgespraech('lio-tag-standard',
    [L('Hey, {name}. Ich hab gerade nichts zu tun. Also, ich spiel, aber das ist nicht „was tun“, das ist atmen.')],
    [L('Wenn du nichts vorhast: Hör einfach zu. Leute, die einfach zuhören, sind seltener als echte Äpfel.')],
    M),
};

// ---------------------------------------------------------------------------------------------- Herz-Ereignisse

/** ♥2: Ein Lied über die Spielfigur (Strophe nach Herkunft, Vex mit eigener Strophe). */
const VEX: Condition = { playerIs: 'vex' };
const strophe = (origin: string): Condition => alle(nicht(VEX), { origin });
const KEINE_BEKANNTE: Condition = alle(nicht(VEX), nicht(eins(
  { origin: 'origin-gossenkind' }, { origin: 'origin-oberstadt' }, { origin: 'origin-oednis' },
  { origin: 'origin-ex-wache' }, { origin: 'origin-schrott' }, { origin: 'origin-knastvogel' },
)));

const reaktionen: DialogueChoice[] = [
  { text: 'Beim Refrain mitsingen.', check: pruefung('he-lio-2-mitsingen', 'ausstrahlung', 4, ['buehne']), next: 'mitsingen', effects: [herz(ID, 40)] },
  { text: 'Einen Zwanziger in den Hut legen.', next: 'hut', effects: [{ credits: -20 }, herz(ID, 30)] },
  { text: '„Ehrlich? Der Reim in Zeile drei war Mist.“', next: 'ehrlich', effects: [herz(ID, 30)] },
  { text: 'Klatschen.', next: 'klatschen', effects: [herz(ID, 20)] },
];

const he2 = dialog('he-lio-funkel-2', [
  knoten('start', [
    erz('Musikerecke, Bahnhof Mitte. Lio sieht dich, reißt die Augen auf und zieht Berta auseinander, dass die Pendler zusammenzucken.'),
    L('Stopp! Nicht weitergehen! Ich hab was. Für dich. Über dich. Ich hab drei Nächte nicht geschlafen. Okay, eine. Die anderen zwei war ich nur müde.', 'freude'),
    L('Es heißt … „Neu in der Stadt“. Sei nett. Oder nicht. Hauptsache, du bleibst stehen.', 'verlegen'),
  ], {
    choices: [
      { text: 'Zuhören.', when: VEX, next: 'vers-vex' },
      { text: 'Zuhören.', when: strophe('origin-gossenkind'), next: 'vers-gosse' },
      { text: 'Zuhören.', when: strophe('origin-oberstadt'), next: 'vers-oberstadt' },
      { text: 'Zuhören.', when: strophe('origin-oednis'), next: 'vers-oednis' },
      { text: 'Zuhören.', when: strophe('origin-ex-wache'), next: 'vers-wache' },
      { text: 'Zuhören.', when: strophe('origin-schrott'), next: 'vers-schrott' },
      { text: 'Zuhören.', when: strophe('origin-knastvogel'), next: 'vers-knast' },
      { text: 'Zuhören.', when: KEINE_BEKANNTE, next: 'vers-allgemein' },
    ],
  }),
  knoten('vers-vex', [
    L('„Sie fährt, wo keiner fährt, über Dächer und Draht, / mit ’nem Arm, der mehr kostet als die halbe Stadt …“', 'signatur'),
    L('„Sie lobt dich nie, sie sagt nur: Läuft, / und wer ihr Paket klaut, der wird ersäuft.“'),
  ], { next: 'refrain' }),
  knoten('vers-gosse', [
    L('„Aufgewachsen zwischen Pfandflaschen und Kippen, / {name} hat Narben und freche Lippen …“', 'signatur'),
    L('„Die Gosse hat dich gemacht, doch nicht kleingekriegt, / weil Gossenkind immer zuletzt noch siegt.“'),
  ], { next: 'refrain' }),
  knoten('vers-oberstadt', [
    L('„Kam runter aus Glas mit polierten Schuh’n, / jetzt watet {name} durch Schlamm und hat was zu tun …“', 'signatur'),
    L('„Die Oberstadt hat dich ausgespuckt wie Kaugummi, / hier unten schmeckst du endlich mal nach … irgendwie.“ Ich arbeite noch an der Zeile.', 'verlegen'),
  ], { next: 'refrain' }),
  knoten('vers-oednis', [
    L('„Aus dem Sand gekommen mit ’nem Kanister voll Hoffnung, / die Stadt sagt: Willkommen, hier gibt’s nur Verkokung …“', 'signatur'),
    L('„Doch wer den Wind kennt, verläuft sich nicht, / {name} hat Staub in den Haaren und Glut im Gesicht.“'),
  ], { next: 'refrain' }),
  knoten('vers-wache', [
    L('„Hat mal Uniform getragen, jetzt nicht mehr, / {name} schaut jedem Gauner hinterher …“', 'signatur'),
    L('„Die Marke ist weg, doch der Blick ist geblieben, / Kessel sagt, sie vermisst dich. Hat sie nicht geschrieben.“'),
  ], { next: 'refrain' }),
  knoten('vers-schrott', [
    L('„Zwischen Schrott und Schrauben ging die Kindheit vorbei, / {name} lötet dir ’nen Toaster zu ’nem Papagei …“', 'signatur'),
    L('„Gustav sagt, du hattest schon mit fünf ’nen Kolben in der Hand, / und hast mit sechs den halben Markt abgebrannt.“'),
  ], { next: 'refrain' }),
  knoten('vers-knast', [
    L('„Drei Jahre gezählt an der Zellenwand, / {name} kam raus mit ’nem Löffel in der Hand …“', 'signatur'),
    L('„Der Eisenhof hat dich nicht weich gekocht, / nur der Kaffee da drin hat dich fast gekillt. Und gepocht.“ Gepocht! Ich weiß. Ich weiß!', 'verlegen'),
  ], { next: 'refrain' }),
  knoten('vers-allgemein', [
    L('„Kam einer an mit nichts als ’nem Plan, / und die Stadt hat gelacht und dann weitergetan …“', 'signatur'),
    L('„Doch {name} lacht zurück, und das klingt ziemlich laut, / wie ’ne Tür, die man eintritt, wenn keiner sich traut.“'),
  ], { next: 'refrain' }),
  knoten('refrain', [
    erz('Beim Refrain bleiben Leute stehen. Ein Kind wippt mit. Ein Ordnungshüter tut so, als würde er nicht mitwippen, und wippt.'),
    L('„Neu in der Stadt, neu in der Stadt, / die Stadt frisst dich auf – doch du machst sie satt!“', 'freude'),
    L('… Und? Sag was. Nein, sag nichts. Doch. Sag was.', 'verlegen'),
  ], { choices: reaktionen }),
  knoten('mitsingen', [
    erz('Du steigst beim zweiten Refrain ein. Laut, schief genug, um ehrlich zu klingen. Der halbe Bahnsteig singt mit, die U-Bahn hupt im Takt.'),
    L('DAS! Das ist es! Weißt du, was du gerade gemacht hast? Du hast meinen Song zu einem Hit gemacht. Für dreißig Sekunden. Das sind die besten dreißig Sekunden des Monats!', 'ueberrascht'),
  ], { next: 'ende' }),
  knoten('hut', [
    L('Ein Zwanziger. Für ein Lied über dich. Das ist … das ist ein bisschen, als würdest du dich selbst bezahlen. Aber ich nehm ihn. Ich hab Hunger.', 'freude'),
  ], { next: 'ende' }),
  knoten('ehrlich', [
    L('… Ja. Ja! Danke! Alle sagen immer „schön, schön“. Keiner sagt „Zeile drei ist Mist“. Zeile drei IST Mist!', 'ueberrascht'),
    L('Ehrliche Leute sind selten. Ehrliche Leute mit Geschmack sind ausgestorben. Du bist ein Fossil. Ein schönes.'),
  ], { next: 'ende' }),
  knoten('klatschen', [L('Applaus! Echter! Ich nehm ihn auf. In meinem Kopf. Da ist ein Ordner, der heißt „Gute Tage“. Er ist sehr dünn. Jetzt ist er etwas dicker.', 'zaertlich')], { next: 'ende' }),
  knoten('ende', [
    L('Ich spiel das jetzt öfter. Wenn die Leute dich auf der Straße erkennen, ist das meine Schuld. Und dein Ruhm. Teilen wir uns.', 'signatur'),
  ], { effects: [flag('lio_lied_ueber_dich'), { xp: 40 }, { rep: 'unterstadt', delta: 2 }] }),
]);

/** ♥4: Neue Saiten [Technik 3] → lio-demo-chip, Auftakt pers-lio-album. */
const he4 = dialog('he-lio-funkel-4', [
  knoten('start', [
    erz('Mitten im Lied ein metallisches PLONK. Berta jault, Lio flucht. Aus dem Bauch des Akkordeons hängt eine gerissene Resonanzsaite wie ein toter Regenwurm.'),
    L('Nein. Nein, nein, nein. Nicht heute. Heute ist der Typ vom Tonstudio im Bahnhof. Er hat gesagt, er hört vielleicht zu. VIELLEICHT!', 'trauer'),
    L('Ohne die Saite klingt Berta wie eine Katze im Mixer. Ich hab keine Ersatzsaite. Ich hab elf Credits und einen Knopf. Der Knopf ist nicht leitfähig.'),
  ], {
    choices: [
      { text: 'Lass mich mal. Ich spann die Saite neu, mit dem Rest von der alten.', check: pruefung('he-lio-4-saite', 'technik', 3, ['reparieren']), next: 'repariert', effects: [herz(ID, 40)] },
      { text: 'Den Akkordeon-Balg aus meiner Tasche nehmen. Der hat Ersatzsaiten.', when: { item: 'akkordeon-balg' }, next: 'balg', effects: [{ take: 'akkordeon-balg' }, herz(ID, 60)] },
      { text: 'Ich renn zu Gustav und hol eine Saite. Halt durch.', next: 'gustav', effects: [{ advanceTime: 30 }, { credits: -15 }, herz(ID, 30)] },
      { text: '„Spiel ohne. Katze im Mixer ist auch ein Sound.“', next: 'ohne', effects: [herz(ID, 20)] },
    ],
  }),
  knoten('repariert', [
    erz('Zwei Knoten, ein Stück Draht aus deiner Tasche, ein beherzter Dreh am Wirbel. Berta brummt, dann singt sie. Sauberer als vorher.'),
    L('Wie … wie hast du das gemacht? Die klingt besser als neu! Die klingt wie damals, als ich sie aus dem Container gezogen hab!', 'ueberrascht'),
  ], { next: 'auftritt' }),
  knoten('balg', [
    L('Ein Balg! Ein echter, mit Ledernaht! Weißt du, was so was kostet? Nein? Gut. Ich sag’s dir nicht, sonst willst du ihn zurück.', 'ueberrascht'),
    erz('Lio baut in zwei Minuten um, mit zitternden Fingern und einem Gesichtsausdruck wie an Weihnachten.'),
  ], { next: 'auftritt' }),
  knoten('gustav', [
    erz('Opa Gustav sucht die Saite in einer Kiste mit der Aufschrift „Saiten, Sehnen, Sonstiges“. Fünfzehn Credits, „Freundschaftspreis, weil du rennst wie ein Idiot“. Du kommst gerade rechtzeitig zurück.'),
    L('Du bist gerannt? Für eine Saite? Für MICH? Okay, nicht weinen. Lio, nicht weinen. Später weinen.', 'zaertlich'),
  ], { next: 'auftritt' }),
  knoten('ohne', [
    erz('Lio spielt ohne Saite. Es klingt furchtbar. Es klingt so furchtbar, dass es schon wieder gut ist. Der Studiotyp bleibt stehen, legt den Kopf schief – und grinst.'),
    L('Er hat „roh“ gesagt. Roh! Roh ist gut! Roh ist, was die Oberstadt nicht hat!', 'ueberrascht'),
  ], { next: 'auftritt' }),
  knoten('auftritt', [
    erz('Lio spielt das Lied zu Ende. Der Studiotyp, ein Kerl mit Hornbrille und Kopfhörern um den Hals, nickt und drückt Lio eine Visitenkarte in die Hand. Dann geht er. Lio steht da wie vom Blitz getroffen.'),
    L('Er will eine Demo. Eine DEMO. Ich hab eine. Also, ich hab eine Aufnahme. Auf einem Chip. Von einem Abend, wo ich betrunken war und der Bahnsteig mitgesungen hat.', 'ueberrascht'),
    L('Hier. Die zweite Kopie. Für dich. Wenn ich berühmt werde, ist die was wert. Wenn nicht, ist es halt ein Chip mit einem traurigen Typen drauf.', 'verlegen'),
  ], {
    effects: [{ give: 'lio-demo-chip' }],
    choices: [
      { text: '„Du brauchst ein ganzes Album, Lio. Nicht nur eine Demo.“', next: 'album' },
      { text: '„Ich heb ihn auf. Versprochen.“', next: 'ende' },
    ],
  }),
  knoten('album', [
    L('Ein Album. Mit … mit der ganzen Stadt drauf. Den Geräuschen. Dem Nebelhorn, dem Kanal, den Tauben …', 'zaertlich'),
    L('Du hast recht. Ich hab Angst, aber du hast recht. Frag mich nochmal, wenn ich nicht mehr zittere. Morgen. Oder übermorgen. Oder frag einfach.'),
  ], { next: 'ende' }),
  knoten('ende', [L('Danke. Wirklich. Heute war ein Tag für den Ordner „Gute Tage“. Ich muss einen zweiten anlegen.', 'freude')], { effects: [flag('lio_demo'), { xp: 60 }] }),
]);

/** ♥6: Gemeinsam ein Lied schreiben (drei Zeilen wählen) – es wird ein Stadthit. */
const zeile = (n: number, text: string, next: string, opts: Partial<DialogueChoice> = {}): DialogueChoice =>
  ({ text, next, id: `zeile-${n}-${next}`, ...opts });

const he6 = dialog('he-lio-funkel-6', [
  knoten('start', [
    erz('Nacht. Dachterrasse über der Neon-Gasse. Die Lichterketten summen, unten pocht der Bass aus dem High Voltage. Lio sitzt auf der Bank, Berta auf den Knien, einen Block voller durchgestrichener Zeilen neben sich.'),
    L('Du bist da. Gut. Ich hab ein Problem. Ich hab eine Melodie, die ist so gut, dass sie mich nachts weckt. Und keinen Text. Kein einziges Wort.', 'trauer'),
    L('Ich will, dass du mitschreibst. Nicht „hilfst“. Mitschreibst. Dein Name steht drauf. Neben meinem. Kleiner, aber er steht drauf.', 'verlegen'),
    L('Erste Zeile. Wie fängt es an?'),
  ], {
    choices: [
      zeile(1, '„Unter Neon schlafen die Ratten nie …“', 'z1-neon', { check: pruefung('he-lio-6-zeile-strasse', 'strasse', 4, ['geruecht']), effects: [herz(ID, 15)] }),
      zeile(1, '„Wir haben nichts, außer uns und den Schulden …“', 'z1-schulden', { effects: [herz(ID, 10)] }),
      zeile(1, '„Irgendwo hinter der Mauer ist es blau …“', 'z1-blau', { effects: [herz(ID, 10)] }),
    ],
  }),
  knoten('z1-neon', [L('„Unter Neon schlafen die Ratten nie“ – ja! Das ist Straße! Das riecht nach Pfützen! Weiter!', 'ueberrascht')], { next: 'zeile-2' }),
  knoten('z1-schulden', [L('„Außer uns und den Schulden.“ Oh, Hunter wird das hassen. Hunter wird das so hassen. Perfekt.', 'freude')], { next: 'zeile-2' }),
  knoten('z1-blau', [L('„Irgendwo hinter der Mauer ist es blau.“ … Okay, ich muss kurz in die andere Richtung gucken. Das hat mich erwischt.', 'trauer')], { next: 'zeile-2' }),
  knoten('zeile-2', [L('Zweite Zeile. Die muss wehtun. Ein bisschen. Wie ein Zeh am Bettpfosten.')], {
    choices: [
      zeile(2, '„… und Quantum verkauft uns Glück in Raten.“', 'z2-quantum', { effects: [herz(ID, 10)] }),
      zeile(2, '„… und wer fällt, steht wieder auf, und wenn nicht, dann trinkt er.“', 'z2-fallen', { effects: [herz(ID, 10)] }),
      zeile(2, '„… und ich halt deine Hand, auch wenn sie nach Lötzinn riecht.“', 'z2-hand', { check: pruefung('he-lio-6-zeile-herz', 'ausstrahlung', 5, ['buehne']), effects: [herz(ID, 20)] }),
    ],
  }),
  knoten('z2-quantum', [L('„Glück in Raten.“ Die Rostzähne werden das an Wände sprühen. Und Quantum wird mir eine Anwaltsdrohne schicken. Ich freu mich drauf.', 'signatur')], { next: 'zeile-3' }),
  knoten('z2-fallen', [L('„Und wenn nicht, dann trinkt er.“ Das ist die ehrlichste Zeile, die ich je gehört hab. Barkeeper wird nicken. Barkeeper nickt nie.', 'freude')], { next: 'zeile-3' }),
  knoten('z2-hand', [
    L('„… auch wenn sie nach Lötzinn riecht.“', 'zaertlich'),
    erz('Lio schreibt die Zeile auf und guckt dich dabei nicht an. Sehr konzentriert nicht an. Seine Ohren werden rot unter der Mütze.'),
    L('Das ist … gut. Das ist sehr gut. Das ist so gut, dass ich kurz vergessen hab, wie Atmen geht.', 'verlegen'),
  ], { next: 'zeile-3' }),
  knoten('zeile-3', [L('Und jetzt der Refrain. Der Titel. Das, was der ganze Bahnhof grölt, wenn er betrunken ist. Das Wichtigste. Kein Druck.', 'signatur')], {
    choices: [
      zeile(3, '„Rost und Rosen“', 'z3-rost', { effects: [flag('lio_hit_rost')] }),
      zeile(3, '„Kein Ticket ans Meer“', 'z3-meer', { effects: [flag('lio_hit_meer')] }),
      zeile(3, '„Tritt die Tür ein“', 'z3-tuer', { effects: [flag('lio_hit_tuer')] }),
    ],
  }),
  knoten('z3-rost', [L('„Rost und Rosen.“ Das ist kitschig. Das ist so kitschig, dass es gegen den Kitsch wieder rum ist. Das ist Kunst.', 'freude')], { next: 'probe' }),
  knoten('z3-meer', [L('„Kein Ticket ans Meer.“ … Das wird die Leute fertigmachen. Alle hier unten wollen ans Meer. Keiner kommt hin. Das ist unser Lied.', 'trauer')], { next: 'probe' }),
  knoten('z3-tuer', [L('„Tritt die Tür ein!“ JA! Das ist ein Refrain zum Faustschütteln! Hunter wird mir verbieten, das zu spielen. Weil die Leute dabei Stühle werfen!', 'ueberrascht')], { next: 'probe' }),
  knoten('probe', [
    erz('Lio spielt es einmal durch. Leise erst, dann lauter. Unten in der Gasse bleibt jemand stehen. Dann noch jemand. Ein Fenster geht auf, eine Frau ruft „NOCHMAL!“ – und Lio spielt es nochmal.'),
    L('Hörst du das? Die singen den Refrain. Die kennen ihn seit dreißig Sekunden und singen ihn. Das ist … das passiert nicht. Das passiert anderen Leuten.', 'ueberrascht'),
    L('{name}, wir haben einen Hit. Einen kleinen, dreckigen Unterstadt-Hit. Unseren.', 'zaertlich'),
  ], {
    choices: [
      { text: '„Unseren. Klingt gut.“', next: 'unseren', effects: [herz(ID, 20)] },
      { text: '„Ich will Tantiemen. Zehn Prozent. In Äpfeln.“', next: 'tantiemen', effects: [herz(ID, 20)] },
      { text: 'Lio auf die Schulter klopfen. Ganz kurz die Hand liegen lassen.', tag: '[Romanze]', when: ROM, next: 'nah', effects: [herz(ID, 30)] },
    ],
  }),
  knoten('unseren', [L('Unseren. Ja. Ich schreib’s mir auf die Hand, damit ich’s morgen noch glaube.', 'freude')], { next: 'ende' }),
  knoten('tantiemen', [L('Zehn Prozent in Äpfeln. Das ist mehr Obst, als die Unterstadt im Jahr sieht. Deal. Ich zahl in Raten. Glück in Raten. Ha!', 'signatur')], { next: 'ende' }),
  knoten('nah', [
    erz('Deine Hand auf seiner Schulter. Er hält ganz still, wie jemand, der einen Vogel nicht verscheuchen will. Unten singen sie den Refrain zum dritten Mal.'),
    L('Wenn du die Hand da noch länger liegen lässt, schreib ich ein zweites Lied. Und das wird nicht jugendfrei.', 'verlegen'),
  ], { next: 'ende' }),
  knoten('ende', [
    L('Und wenn du mal jemanden brauchst, der hinter dir steht und laut ist … ich kann laut. Berta kann sehr laut.', 'signatur'),
    erz('Am nächsten Morgen pfeifen sie das Lied am Bahnhof. Am Abend singen es die Rostzähne. Lio hat einen Stadthit – und dein Name steht drauf.'),
  ], { effects: [flag('lio_stadthit'), { rep: 'unterstadt', delta: 5 }, { xp: 90 }, { message: 'Lios Lied wird ein Stadthit. Die Unterstadt summt mit.' }, { checkBuff: { id: 'lio-stadthit', label: 'Stadthit im Ohr', value: 1, attribute: 'ausstrahlung', tags: ['buehne'] } }] }),
]);

// ♥8 und ♥10 samt Romanze, Wochenfrage, Akt-2/3- und Nachspiel-Gesprächen: lio-akt23.ts.
const A23 = akt23(M);

// ---------------------------------------------------------------------------------------------- Figur

const lio: NpcDef = {
  id: ID,
  name: 'Lio Funkel',
  unknownName: 'Typ mit Akkordeon',
  portrait: ID,
  sprite: `${ID}-walk`,
  faction: 'unterstadt',
  romanceable: true,
  bio: 'Straßenmusiker Ende zwanzig mit Synth-Akkordeon „Berta“. Singt über alles, was in der Stadt passiert, reimt ungewollt und meint es immer ehrlich. Kommt aus der Ödnis, lebt vom Hut.',
  gifts: {
    loves: ['akkordeon-balg', 'vinyl-platte', 'haiku-buechlein'],
    likes: ['postkarte-meer', 'synth-kaffee', 'neon-limo', 'comic-heft', 'echtobst-apfel', 'hofhonig'],
    dislikes: ['raubkopie-stick', 'volt-limo'],
    hates: ['magnet-stoerer', 'rostige-dose', 'virus-implantat'],
  },
  schedule: [
    ...A23.schedule,
    { slot: 'morgen', place: 'away' },
    { slot: 'tag', place: { map: 'bahnhof-mitte', at: 'musikerecke' } },
    { slot: 'abend', days: ['di'], place: { map: 'high-voltage', at: 'buehne' } },
    { slot: 'abend', place: { map: 'schrottmarkt', at: 'lio-ecke' } },
    { slot: 'nacht', days: ['sa'], place: { map: 'high-voltage', at: 'buehne' } },
    { slot: 'nacht', place: { map: 'neon-gasse', at: 'lichterketten-bank' } },
  ],
  heartEvents: [
    herzEreignis('he-lio-funkel-2', 2, 'bahnhof-mitte', 'tag'),
    herzEreignis('he-lio-funkel-4', 4, 'bahnhof-mitte', 'tag'),
    herzEreignis('he-lio-funkel-6', 6, 'neon-gasse', 'nacht', { not: { weekday: 'sa' } }, 'szene-he-lio-funkel-6'),
    herzEreignis('he-lio-funkel-8', 8, 'high-voltage', 'nacht', alle(AKT2, { weekday: 'sa' })),
    herzEreignis('he-lio-funkel-10', 10, 'neon-gasse', 'nacht', alle(AKT2, { seen: 'he-lio-funkel-8' }, { quest: 'pers-lio-album', state: 'done' })),
  ],
  companion: {
    // world.md §4.6: ab ♥6; §11.2 nennt Lio nicht unter den Akt-1-Begleitern → erst ab act2.
    recruit: alle(AKT2, { hearts: ID, min: 6 }),
    stats: {
      hp: 38, armor: 1, morale: 65,
      attributes: { technik: 4, koerper: 3, reflexe: 6, ausstrahlung: 7, strasse: 4 },
      weapon: { kind: 'smart', damage: 4, range: 4, hit: 5 },
      abilities: ['lio-mutmacher-melodie', 'lio-dissonanz'],
    },
    heartAbilities: [{ hearts: 8, ability: 'lio-zugabe' }],
    abilityRules: [{ when: { flag: 'lio_album_fertig' }, add: STADTHIT.id }],
    // Marla summt, Lio spielt (Fähigkeit aus combat/abilities.ts); nur Lio trägt sie, damit es sie einmal gibt.
    duo: [{ ability: 'duo-lagerfeuerlied', when: { all: [{ companion: 'marla-sand' }, { hearts: ID, min: 8 }, { hearts: 'marla-sand', min: 8 }] } }],
  },
  partyCheckBonus: [
    { attribute: 'ausstrahlung', tags: ['buehne', 'ueberreden'], value: 1, label: 'Lio spielt im Hintergrund' },
  ],
  talk: [
    rede('lio-tag-rivale', { rival: ID }),
    // Eifersucht: heute mit einer anderen freigegebenen Figur geflirtet, während Lio und die Spielfigur zusammen sind.
    rede('lio-trennung', alle(ZUSAMMEN, FREMD, { flag: 'lio_eifersucht_gewarnt' })),
    rede('lio-eifersucht', alle(ZUSAMMEN, FREMD)),
    rede('lio-tag-erstes', { not: { met: ID } }),
    rede('lio-tag-zeit', alle(VOR_AKT2, { notFlag: 'lio_zeit_hinweis' }), 8),
    rede('lio-tag-vexaria', alle({ playerIs: 'vex' }, { flag: 'aria_kuss' }, { notFlag: 'lio_kommentar_vexaria' })),
    ...A23.talk,
    rede('lio-tag-sehen', alle(AUGE, { notFlag: 'lio_sehen_gesagt' })),
    rede('lio-tag-karaoke', alle({ weekday: 'di' }, { time: 'abend' })),
    rede('lio-tag-buehne', alle({ weekday: 'sa' }, { time: 'nacht' })),
    rede('lio-tag-verliebt', ROM),
    rede('lio-tag-nacht', { time: 'nacht' }),
    rede('lio-tag-abend', { time: 'abend' }),
    rede('lio-tag-freunde', undefined, 4),
    rede('lio-tag-bahnhof', { time: 'tag' }),
    rede('lio-tag-standard'),
  ],
};

// ---------------------------------------------------------------------------------------------- Eifersucht

/** Erste Annäherung an eine andere Figur, während Lio und die Spielfigur zusammen sind. */
const eifersucht = dialog('lio-eifersucht', [
  knoten('start', [
    erz('Lio spielt. Falsch. Absichtlich falsch, in einer Tonart, die es nicht gibt. Dann bricht er ab.'),
    L('Ich hab gesehen, wie du geguckt hast. Noch einmal und ich zieh dir die Ohren lang. Und schreib ein Lied drüber. In Moll.', 'wut'),
    L('Berta ist auch sauer. Hör mal, wie sie atmet.', 'trauer'),
    erz('Das Akkordeon gibt ein langes, beleidigtes Pfeifen von sich.'),
  ], {
    effects: [flag('lio_eifersucht_gewarnt'), ...fremdFlirtLoeschen(ID)],
    choices: [
      { text: '„Das war nichts, Lio. Wirklich.“', next: 'nichts' },
      { text: '„Spiel mir das Moll-Lied. Ich will hören, wie eifersüchtig du klingst.“', check: pruefung('lio-eifersucht-frech', 'ausstrahlung', 7, ['flirt']), next: 'moll' },
    ],
  }),
  knoten('nichts', [L('„Nichts“ reimt sich auf „Gesicht“. Und deins hat gerade was anderes gesagt. Okay. Einmal. Ich hab’s notiert.', 'besorgt')]),
  knoten('moll', [L('… Du bist unmöglich. Komm her. Strophe eins ist eh über dich. Alle sind über dich.', 'verlegen')]),
]);

/** Zweite Annäherung: Trennungsgespräch, −150. Keine Rivalität. */
const trennung = dialog('lio-trennung', [
  knoten('start', [
    erz('Lio sitzt am Bahnsteigende, das Akkordeon zu, die Riemen fest. Er sieht dich kommen und spielt keinen Ton.'),
    L('Ich hab ein Lied ohne Reim geschrieben. Über dich. Du reimst dich auf nichts, hab ich gesagt. Ich dachte, das ist was Gutes.', 'trauer'),
    L('Ich bin raus. Wir sind raus. Ich such mir eine neue letzte Strophe.', 'trauer'),
  ], {
    effects: [
      herz(ID, -150), flag('lio-funkel_romanze_zusammen', false), flag('lio-funkel_nacht', false),
      flag('lio_eifersucht_gewarnt', false), flag('lio_getrennt'), ...fremdFlirtLoeschen(ID),
    ],
    choices: [
      { text: '„Es tut mir leid, Lio.“', next: 'leid' },
      { text: '„Dann schreib halt was anderes.“', next: 'anders' },
    ],
  }),
  knoten('leid', [L('Weiß ich. Ich glaub dir. Das macht’s nicht leiser.', 'trauer')]),
  knoten('anders', [L('Mach ich. Es wird ein Hit. Und du wirst jedes Mal zuhören müssen, wenn es im Radio läuft.', 'wut')]),
]);

export const part: ContentPart = {
  npcs: { [ID]: lio },
  dialogues: sammle(
    T.rivale, T.erstes, T.zeit, T.vexaria, T.karaoke, T.buehne, T.nacht, T.sehen, T.abend, T.verliebt, T.freunde,
    T.tag, T.standard,
    he2, he4, he6, eifersucht, trennung, ...A23.dialogues,
  ),
  abilities: A23.teil.abilities,
  cutscenes: sammleSzenen(
    {
      id: 'szene-he-lio-funkel-6', title: 'Ein Lied für zwei',
      beats: [
        { image: 'cut-he-lio-funkel-6', pan: 'in', fade: 'in', caption: 'Nacht über der Neon-Gasse. Lichterketten, ein Block voller durchgestrichener Zeilen – und eine Melodie ohne Worte.', hold: 1800 },
      ],
    },
    {
      id: 'szene-rom-lio-dach', title: 'Lied ohne Reim',
      beats: [{ image: 'cut-rom-lio-dach', pan: 'in', fade: 'in', caption: 'Lichterkette. Gegenlicht. Ein Akkordeon, das leise seufzt.', hold: 2200 }],
    },
    {
      id: 'szene-lio-nacht', title: 'Ganz leise',
      beats: [
        { image: 'cut-rom-lio-dach', pan: 'out', lines: [L('Berta, Augen zu. Ja, ich weiß, du hast keine. Trotzdem.', 'verlegen')] },
        abblende('Die Lichterketten gehen eine nach der anderen aus. Das Akkordeon spielt nicht mehr. Niemand vermisst es.'),
      ],
      gallery: false,
    },
  ),
};
