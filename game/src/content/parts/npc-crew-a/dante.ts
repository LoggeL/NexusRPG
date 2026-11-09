// Dante – Genie und Wahnsinn, Schrauber mit Werkstatt voller Platten (world.md §4.2, §4.6, §4.7 „Die Wärme der
// Analogtechnik“ und Paar-Strang Dante/Raven, §11.2). Tagesablauf nach design/plan/act1.json (npcSchedules.dante),
// Herz-Ereignisse he-dante-2/4/6 in Akt 1, he-dante-8/10 ab Akt 2 (Flohmarkt, Werkstatt). Begleiter ab main-2-countdown.
// Akt 2/3/Nachspiel-Gespräche, Plan und Telefon in _dante23.ts; Wingman-Quest Dante/Raven in paar.ts.
// Dazu die Arm-Wartung aus dem Strang Vex × Aria (world.md §4.7 „Status zusammen“, beide Fassungen).
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode, NpcDef, Weekday } from '../../../modules/contracts';
import {
  type Menue, AKT2, COUNTDOWN_DONE, EPILOG_FREI, NICHT_MASTER, RUHIG, abblende, dialog, erz, flag, frei, herz, ich, knoten,
  neu, pruefung, rede, sammle, sammleSzenen, sprecher, tagesgespraech, und, ZEIT_HINWEIS,
} from './_helfer';
import { DANTE_PLAN_23, DANTE_TEL_23, dante23 } from './_dante23';

const D = sprecher('dante');
const A = sprecher('aria');
const R = sprecher('raven');
const H = sprecher('hunter');
const RP = sprecher('ripper');

const ROM: Condition = { romance: 'dante' };
/** Flirtzeilen ab ♥6, sobald die Romanze freigeschaltet ist (Engine: romanceEnabled); Kuss/Nacht bleiben an ROM (♥8). */
const FLIRT: Condition = { all: [{ romanceEnabled: 'dante' }, { hearts: 'dante', min: 6 }] };
const VEX: Condition = { playerIs: 'vex' };
const KENNT: Condition = { quest: 'main-1-dante', state: 'done' };
/** Konvention `heute_flirt_<npc>` (Tagesflag, morgens zurückgesetzt), siehe design/plan/gaps/npc-crew-a.md. */
const FLIRT_FREMD = ['heute_flirt_hunter', 'heute_flirt_aria', 'heute_flirt_collin-charleston', 'heute_flirt_lio-funkel'];
const HAT_FREMD_GEFLIRTET: Condition = { any: FLIRT_FREMD.map((f): Condition => ({ flag: f })) };
const ZUSAMMEN: Condition = { all: [ROM, { flag: 'dante_romanze_zusammen' }] };
/** Dante ist in der Crew: Beitritt im Countdown (main-2-countdown setzt dante_beigetreten). */
const IN_CREW: Condition = { any: [{ flag: 'dante_beigetreten' }, COUNTDOWN_DONE] };

// ---------------------------------------------------------------------------------------------- Menü

function menue(): Menue {
  const zurueck: DialogueChoice[] = [{ text: 'Noch was, Dante.', next: 'menue', id: 'zurueck' }, { text: 'Bis später.' }];
  const flirt = (n: number, tage: Weekday[]): DialogueChoice => ({
    text: 'Mit Dante flirten.', tag: '[Romanze]', next: `flirt-${n}`, id: `flirt-${n}`, when: { all: [FLIRT, { weekday: tage }] },
    effects: [flag('heute_flirt_dante')],
  });
  const antworten: DialogueChoice[] = [
    { text: '„Dann verbrenn dich halt. Ich puste.“', check: pruefung('dante-flirt-frech', 'ausstrahlung', 6, ['flirt']), next: 'flirt-a' },
    { text: '„Sieben Sekunden? Ich zähl weiter.“', next: 'flirt-b' },
    { text: '„Dante. Atmen.“', next: 'flirt-c' },
  ];

  const choices: DialogueChoice[] = [
    { text: '„Hübsch hier. Fast wie zu Hause. Nur mit mehr Rost.“', tag: '[Oberstadt]', when: { origin: 'origin-oberstadt' }, once: true, id: 'd-oberstadt', next: 'd-oberstadt' },
    { text: '„Kennst du Radio Rost? Draußen läuft das den ganzen Tag.“', tag: '[Ödnis]', when: { origin: 'origin-oednis' }, once: true, id: 'd-oednis', next: 'd-oednis', effects: [herz('dante', 20)] },
    {
      text: '„Der Zentrator da hinten – ist das ein Siebziger mit Doppelspule?“', tag: '[Schrott]', once: true, id: 'd-schrott', next: 'd-schrott',
      when: { all: [{ origin: 'origin-schrott' }, { noItem: 'wissen-zentrator' }] }, effects: [{ give: 'wissen-zentrator' }, herz('dante', 20)],
    },
    { text: 'Was kannst du bei mir einbauen?', when: KENNT, next: 'laden', effects: [{ shop: 'dantes-werkstatt' }] },
    {
      text: 'Eine Runde Eins!?', next: 'eins', when: { all: [KENNT, { weekday: 'do' }, { time: 'abend' }] },
      effects: [{
        minigame: 'akt-eins', level: 1, key: 'dante-eins', label: 'Eins! bei Dante',
        win: [{ message: 'Gewonnen. Hinter der Werkstatttür flucht jemand. Gedämpft. Lange. Sehr kreativ.' }],
        lose: [{ message: 'Dante gewinnt und tanzt einen Siegestanz, der in drei Bezirken verboten wäre.' }],
      }],
    },
    {
      text: 'Keksalarm?', next: 'keksalarm', when: { all: [{ seen: 'he-dante-2' }, { time: ['morgen', 'abend'] }] },
      effects: [{
        minigame: 'akt-keksalarm', level: 2, key: 'dante-keksalarm', label: 'Keksalarm',
        win: [{ give: 'dantes-kekse', qty: 2 }, { message: 'Zwei Tüten Kekse für die Crew. Dante weint ein bisschen.' }],
        lose: [{ message: 'Halb verkohlt, halb am Boden. Drei-Sekunden-Regel. Ihr esst sie trotzdem.' }],
      }],
    },
    { text: 'Erzähl vom Knast.', tag: '[Dante ♥3]', requires: { hearts: 'dante', min: 3 }, when: KENNT, once: true, id: 'd-knast', next: 'knast' },
    { text: 'Komm mit, Dante. Wir brauchen dich für den Bruch.', when: { all: [KENNT, { not: { act: 2 } }] }, next: 'ruhestand' },
    { text: 'Wie geht’s Captain Kuschel?', when: { notFlag: 'nyra_hat_kuschel' }, next: 'kuschel' },
    { text: 'Vermisst du Captain Kuschel?', when: { flag: 'nyra_hat_kuschel' }, next: 'kuschel-nyra' },
    { text: 'Dein Geheimnis ist sicher bei mir.', when: { all: [{ flag: 'dante_geheimnis_versprochen' }, { notFlag: 'dante_geheimnis_gebrochen' }] }, once: true, id: 'd-geheimnis', next: 'geheimnis' },
    { text: 'Kannst du nochmal nach dem Arm sehen, Doc?', when: { all: [VEX, { flag: 'vexaria_armwartung' }] }, next: 'arm-kurz' },
    // Akt 2: Rekrutierung als Rückfall, falls der Countdown ihn nicht schon mitgenommen hat.
    {
      text: 'Kommst du mit raus, Dante? Ohne Sekunde. Versprochen.', next: 'tour', id: 'd-tour',
      when: { all: [AKT2, IN_CREW, NICHT_MASTER, { not: { recruited: 'dante' } }] }, effects: [{ recruit: 'dante' }],
    },
    { text: 'Was ist mit dem Modem vom Flohmarkt?', when: { seen: 'he-dante-8' }, once: true, id: 'd-modem', next: 'modem' },
    // Paar-Strang Dante/Raven (world.md §4.7): Wingman-Quest nach dem Finale.
    {
      text: 'Das Date mit Raven. Wird Zeit, oder?', tag: '[Paar]', next: 'wingman', id: 'd-wingman',
      when: {
        all: [
          EPILOG_FREI, { notFlag: 'paar_dante_raven_gestoert' }, { notFlag: 'dante_romanze_zusammen' }, { notFlag: 'dante_nacht' },
          { any: [{ flag: 'paar_dante_raven_geholfen' }, { flag: 'dante_raven_am_meer' }] },
          { not: { quest: 'pers-wingman-sonnenuntergang', state: 'active' } }, { not: { quest: 'pers-wingman-sonnenuntergang', state: 'done' } },
        ],
      },
      effects: [{ startQuest: 'pers-wingman-sonnenuntergang' }],
    },
    {
      text: 'Wie weit ist das Diagramm?', tag: '[Paar]', next: 'wingman-stand', id: 'd-wingman-stand',
      when: { quest: 'pers-wingman-sonnenuntergang', state: 'active' },
    },
    {
      text: '„Röhren an, Strom aus?“', tag: '[Romanze]', next: 'nacht-frage', id: 'd-nacht-frage',
      when: { all: [ZUSAMMEN, frei('dante'), NICHT_MASTER, { notFlag: 'woche_dante_nacht' }, { time: ['abend', 'nacht'] }] },
    },
    flirt(1, ['mo', 'fr']),
    flirt(2, ['di', 'sa']),
    flirt(3, ['mi', 'so']),
    flirt(4, ['do']),
    { text: 'Bis später.' },
  ];

  const nodes: DialogueNode[] = [
    knoten('menue', [D('Noch was? Frag! Frag alles! Außer nach dem Schrank. Welcher Schrank. Es gibt keinen Schrank.')], { choices }),
    knoten('d-oberstadt', [
      D('Du riechst nach Glasreiniger. Komm rein, aber fass nichts an.', 'signatur'),
      D('Das da ist ein Faxgerät von 2060. Das ist älter als dein Selbstwertgefühl. Und es funktioniert noch.'),
    ], { choices: zurueck }),
    knoten('d-oednis', [
      D('RADIO ROST! Heiliges Kanonenrohr! Der Typ mit der Stimme wie ein Kiesweg? Spielt der noch die Sonntags-Platten?', 'ueberrascht'),
      D('Wenn du je wieder rausfährst: Nimm einen Rekorder mit. Ich zahl in Keksen. In sehr vielen Keksen.', 'freude'),
    ], { choices: zurueck }),
    knoten('d-schrott', [
      D('Ein Siebziger mit Doppelspule! Du siehst das! Um Himmels Willen, endlich jemand, der was SIEHT!', 'freude'),
      D('Pass auf. Hier. Serviette.', 'signatur'),
      erz('Dante kritzelt in einer Minute einen Zentrator aufs Papier, mit Pfeilen, Totenköpfen und einem kleinen Keks an der verwundbaren Stelle.'),
      D('Das ist die Schwachstelle. Quantum baut die alle gleich. Faul! Faul und reich. Die schlimmste Sorte.'),
    ], { choices: zurueck }),
    knoten('laden', [D('Liege ist frei, Lötkolben ist heiß, Captain Kuschel hat Bereitschaft. Leg dich hin. Nein, nicht auf den Hasen.')]),
    knoten('eins', [D('Eins! Daria mischt, Freya zählt, Jakko schummelt. Ich verliere. Mit Würde. Meistens.', 'signatur')], { choices: zurueck }),
    knoten('keksalarm', [D('KEKSALARM! Topflappen an! Blech kommt!', 'freude')], { choices: zurueck }),
    knoten('knast', [
      D('Drei Jahre. Weißt du, was das Schlimmste war? Nicht die Wand. Nicht das Essen. Obwohl das Essen … Um Himmels Willen, das Essen.'),
      D('Das Schlimmste: Kein Strom. Nichts zum Schrauben. Ich hab einen Toaster aus Löffeln gebaut. Er hat nicht getoastet. Aber er hat geklickt. Das war genug.', 'trauer'),
      D('Nimm, was du kriegen kannst, und hau ab. Hab ich mir auf die Pritsche geritzt. Und dann bin ich nicht abgehauen. Ich hab gebacken. Hier.'),
    ], { choices: zurueck, effects: [herz('dante', 20)] }),
    knoten('ruhestand', [
      D('Nein. Nein nein nein. Ich bin im Ruhestand. Ich hab einen Rentnerausweis. Den hab ich selbst gedruckt, aber er ist gültig.', 'besorgt'),
      D('Letztes Mal hab ich gesagt: „Gib mir noch eine Sekunde.“ Und dann war Raven sieben Jahre weg. Ich krieg keine Sekunde mehr. Ich will keine.', 'trauer'),
      D('Aber wenn ihr verletzt seid: Werkstatt ist offen. Kekse auch. Das ist meine Art zu helfen. Die einzige, die keinen erwischt.'),
    ], { choices: zurueck }),
    knoten('kuschel', [
      D('Er schläft. Er schläft immer. Er ist ein Hase mit Burnout.'),
      D('Captain Kuschel hat mehr Einsätze erlebt als Hunter. Er war beim Digitech-Bruch. Im Rucksack. Er hat nie darüber geredet.', 'signatur'),
    ], { choices: zurueck }),
    knoten('kuschel-nyra', [
      D('Nyra hat ihn. Er hat sie ausgesucht. Hasen wissen so was.', 'besorgt'),
      D('Wenn du sie siehst, sag ihr: Er mag Karottenschalen und Vinyl-Knistern. Und er beißt, wenn man „Quantum“ sagt. Sehr guter Hase.'),
    ], { choices: zurueck }),
    knoten('geheimnis', [
      D('Pssst! Nicht so laut! Die Wände haben Ohren. Die Ohren sind Captain Kuschels.', 'besorgt'),
      D('… Danke. Wirklich. Du bist der einzige Mensch, der den Schrank gesehen hat und nicht gelacht hat. Außer Ripper. Ripper hat gelacht. Ripper lacht über alles.'),
    ], { choices: zurueck, effects: [herz('dante', 15)] }),
    knoten('arm-kurz', [
      erz('Dante klopft mit dem Schraubenzieher gegen deinen Metallarm und hält das Ohr dran wie an eine Melone.'),
      D('Summt wie ein Kühlschrank. Ein glücklicher Kühlschrank. Raus mit dir. Und grüß die Zöpfe.', 'signatur'),
    ], { choices: zurueck }),
    // Flirt (Romanzefassung, nur mit { romance: 'dante' })
    knoten('tour', [
      D('Mit raus. Ich. Der Mann mit dem Rentnerausweis.', 'besorgt'),
      D('… Ich pack Kekse ein. Und den Feuerlöscher. Und wenn ich „Gib mir noch eine Sekunde“ sage, darfst du mich hauen. Fest. Mit der Zange.', 'signatur'),
    ], { choices: zurueck }),
    knoten('modem', [
      D('Das Modem! Es pfeift! Es kreischt! Es ruft das Faxgerät an, und das Faxgerät antwortet! Sie reden miteinander! Analog!', 'freude'),
      D('Ich hab ihnen zugehört. Eine Stunde. Ich glaub, sie verstehen sich besser als die meisten Leute in diesem Laden.'),
    ], { choices: zurueck }),
    knoten('wingman', [
      D('Zeit. Ja. Zeit ist … sieben Jahre zu spät, und jetzt ist sie auf einmal pünktlich. Das ist unheimlich.', 'besorgt'),
      erz('Dante zieht ein Blatt aus der Schublade. Ein Diagramm. Es hat Farben. Es hat Pfeile. Ein Pfeil zeigt auf einen Keks, der „Notfall“ heißt.'),
      D('Der Plan: Sonnenuntergang. Flutmauer. Picknick. Musik. Und Raven, die freiwillig kommt. Das ist der schwierigste Teil. Raven tut nie was freiwillig, außer Leute verprügeln.'),
    ], {
      choices: [
        { text: '„Picknick besorg ich. Babettes Garküche.“', next: 'wingman-plan', effects: [flag('wingman_plan')] },
        { text: '„Und Musik? Dein Koffer-Plattenspieler.“', next: 'wingman-musik', effects: [flag('wingman_plan'), flag('wingman_musik'), herz('dante', 20)] },
        { text: '„Ich krieg Raven an die Mauer. Lass das meine Sorge sein.“', next: 'wingman-plan', effects: [flag('wingman_plan')] },
      ],
    }),
    knoten('wingman-musik', [
      D('Der Koffer! Ja! Batteriebetrieben! Analog! Kein Lio, der dazwischenquatscht! Ich nehm die Platte mit dem Meeresrauschen. Nein. Doch. Nein, die mit dem Liebeslied. Beide. Ich nehm beide.', 'freude'),
    ], { next: 'wingman-plan' }),
    knoten('wingman-plan', [
      D('Picknick, Musik, Raven. Drei Punkte. Ich hab sie dreimal unterstrichen. Das sind neun Striche. Das ist viel Strich.', 'signatur'),
      D('Wenn alles steht: abends an Nyras Bank. Und du bist in der Nähe. Nicht zu nah. So nah, dass du mich auffängst, wenn ich rückwärts in die Flut laufe.'),
    ], { choices: zurueck }),
    knoten('wingman-stand', [
      D('Das Diagramm hat jetzt vier Farben. Die vierte heißt „Panik“. Sie ist überall.', 'besorgt'),
      D('Was fehlt? Picknick bei Babette. Musik, Koffer oder Lio. Und Raven an die Mauer. Abends, an Nyras Bank. Ich bin bereit. Ich bin nicht bereit. Ich bin bereit.'),
    ], { choices: zurueck }),
    knoten('nacht-frage', [
      D('Röhren an, Strom aus. Ich hab den Sicherungskasten schon präpariert. Rein zufällig. Mit Zettel dran: „Nur im Notfall“.', 'verlegen'),
      D('Ist das ein Notfall? Sag, dass das ein Notfall ist.', 'zaertlich'),
    ], {
      choices: [
        { text: '„Das ist ein Notfall.“', effects: [flag('dante_nacht'), flag('woche_dante_nacht'), { cutscene: 'szene-dante-nacht-woche' }] },
        { text: '„Ein andermal, Kekskönig.“', next: 'nacht-andermal' },
      ],
    }),
    knoten('nacht-andermal', [D('Ein andermal. Ich lass den Zettel hängen. Für alle Fälle. Für den Fall aller Fälle.', 'signatur')], { choices: zurueck }),
    knoten('flirt-1', [D('Du riechst nach Lötzinn. Das ist … ehrlich gesagt das Schärfste, was ich seit Jahren gerochen hab.', 'verlegen')], { choices: antworten }),
    knoten('flirt-2', [D('Heiliges Kanonenrohr, steh nicht so nah am Ofen, sonst verbrenn ich mir die Kekse. Oder dich. Oder mich.', 'verlegen')], { choices: antworten }),
    knoten('flirt-3', [D('Ich hab zehntausend Stunden auf meiner Pritsche geübt. Für Gitarre! Für Gitarre, um Himmels Willen!', 'ueberrascht')], { choices: antworten }),
    knoten('flirt-4', [D('Drei-Sekunden-Regel gilt übrigens auch für Blicke. Du bist bei sieben.', 'signatur')], { choices: antworten }),
    knoten('flirt-a', [D('Du … pustest. Okay. Okay okay okay. Ich muss mich kurz an die Werkbank lehnen. Die Werkbank braucht das.', 'verlegen')], { choices: zurueck }),
    knoten('flirt-b', [D('Acht. Neun. Hör auf zu zählen! Nein! Zähl weiter!', 'freude')], { choices: zurueck }),
    knoten('flirt-c', [D('Atmen. Ja. Gute Idee. Ich atme. Siehst du? Ich atme sehr gut. Wie ein Blasebalg. Ein verliebter Blasebalg. Hab ich das laut gesagt?', 'verlegen')], { choices: zurueck }),
  ];
  return { choices, nodes };
}

const M = menue();

const RIVALE: Menue = {
  choices: [
    {
      text: '„Lass uns Eins! spielen. Und ich verlier. Absichtlich.“', next: 'versoehnung',
      when: { all: [{ weekday: 'do' }, { time: 'abend' }] }, effects: [{ reconcile: 'dante' }, { advanceTime: 45 }],
    },
    { text: 'Schon gut. Ich geh.' },
  ],
  nodes: [
    knoten('versoehnung', [
      erz('Du spielst so schlecht, dass sogar Jakko Mitleid kriegt. Am Ende legt Dante seine letzte Karte, brüllt „EINS!“ und dann „GEWONNEN!“ und dann noch mal „EINS!“, weil es so schön war.'),
      D('Ich hab gewonnen. Ich hab GEWONNEN. Zum ersten Mal seit … Moment. Du hast mich gewinnen lassen.', 'ueberrascht'),
      D('… Das ist das Netteste und Gemeinste, was je einer für mich getan hat. Wir sind quitt. Kekse?', 'freude'),
    ]),
  ],
};

// ---------------------------------------------------------------------------------------------- Tagesgespräche

const T = {
  rivale: tagesgespraech('dante-tag-rivale',
    [D('Oh. Du. Die Preise haben sich verdoppelt. Für dich. Gerade eben. Inflation.', 'wut')],
    [D('Ich hab dir einen Klingelton gemacht. Er heißt „Verräter“. Er ist sehr laut, und er hat ein Saxofon-Solo.', 'wut')],
    RIVALE),
  verpetzt: tagesgespraech('dante-tag-verpetzt',
    [
      D('Du hast es ihr gesagt. DU HAST ES IHR GESAGT.', 'wut'),
      D('Raven hat heute „Hallo“ zu mir gesagt. „Hallo“! Mit Augenkontakt! Weißt du, was das mit einem Mann macht?'),
    ],
    [D('… Okay. Okay okay okay. Vielleicht war das gut. Ich weiß es nicht. Ich bin wütend und glücklich gleichzeitig, und das ist sehr schlecht für meinen Kreislauf.', 'besorgt')],
    M, { effects: [flag('dante_reagierte_verpetzt')] }),
  muellsack: tagesgespraech('dante-tag-vexaria-muellsack',
    [
      D('Ich hab nichts gesehen. Ich war ein Müllsack. Müllsäcke haben keine Augen.', 'verlegen'),
      D('… Sie hatte dich an der GÜRTELSCHLAUFE! Heiliges Kanonenrohr! An der Gürtelschlaufe!', 'ueberrascht'),
    ],
    [D('Hunter sagt, ich soll nicht drüber reden. Ich rede nicht drüber. Ich hab nur ein Lied darüber geschrieben. Es hat elf Strophen. Willst du die dritte hören?', 'freude')],
    M, { effects: [flag('dante_kommentar_vexaria_muellsack')] }),
  vexariaZusammen: tagesgespraech('dante-tag-vexaria-zusammen',
    [D('Heiliges Kanonenrohr, ich hab’s GEWUSST! Seit dem Müllsack! Ich WAR der Müllsack!', 'freude')],
    [D('Ich back euch was. Herzförmig. Nein, das ist kitschig. Schlagerförmig! Nein. Zerberster-förmig. Ja. Das mag sie.', 'signatur')],
    M, { effects: [flag('dante_kommentar_vexaria_zusammen')] }),
  ariaRomanze: tagesgespraech('dante-tag-aria-romanze',
    [D('Du und Aria! Um Himmels Willen! Das ist, als würde man einen Vorschlaghammer mit einem Plattenspieler verkuppeln!', 'ueberrascht')],
    [D('Ich mein das nett! Plattenspieler sind toll! Vorschlaghammer auch! Nur nicht gleichzeitig auf der Werkbank. Bitte.', 'freude')],
    M, { effects: [flag('dante_kommentar_aria_romanze')] }),
  fremd: tagesgespraech('dante-tag-fremd',
    [D('Heiliges Kanonenrohr, ein Kunde! Nein. Kein Kunde. Wir haben zu. Für immer. Also bis morgen früh.', 'ueberrascht')],
    [D('Ich bin im Ruhestand. Ich schraub nur noch. Und backe. Und hör Platten. Und schraube. Das ist ein sehr voller Ruhestand.')],
    M),
  zeit: tagesgespraech('dante-tag-zeit',
    [D('Du schon wieder! Ich mein: Du! Schon wieder! Das ist gut. Das ist sehr gut.', 'freude'), erz(ZEIT_HINWEIS)],
    [D('Ich hab eine Platte, die spiel ich erst, wenn alles vorbei ist. Wenn wir alle noch da sind. Frag nicht, welche. Doch, frag. Nein. Später.', 'besorgt')],
    M),
  eins: tagesgespraech('dante-tag-eins',
    [D('Eins!-Abend! Daria mischt, Freya zählt, Jakko schummelt, ich verliere. Tradition!', 'signatur')],
    [D('Wenn ich verliere, geh ich kurz raus. Wenn du hinter der Tür Geräusche hörst: Das ist das Faxgerät. Es flucht. Faxgeräte fluchen. Das ist bekannt.', 'verlegen')],
    M),
  plattenkiste: tagesgespraech('dante-tag-plattenkiste',
    [D('Pssst! Die Kiste hier ist Gold. Vinyl-Vincent hat keine Ahnung, was er da verkauft. Ich schon. Um Himmels Willen, ich schon.', 'freude')],
    [D('Eine Pressung von „Kabelbrand – Live im Keller“! Mit Kaffeefleck! Der Kaffeefleck ist original! Von der Band! Wahrscheinlich!')],
    M),
  ofen: tagesgespraech('dante-tag-ofen',
    [D('Nicht reinkommen! Doch, reinkommen! Tür zu! Der Teig mag keine Zugluft!', 'ueberrascht')],
    [D('Das Geheimnis guter Kekse? Butter. Und Zeit. Und dass man sie nicht fallen lässt. Und wenn doch: Drei-Sekunden-Regel!', 'signatur')],
    M),
  werkbank: tagesgespraech('dante-tag-werkbank',
    [D('Halt das mal. Nein, das andere. Das, das nicht raucht.')],
    [
      D('Ich hab hier einen Zentrator von 2071, der mich seit drei Tagen anlügt. Zentratoren lügen nicht. Dieser schon. Er ist besonders.'),
      D('Digital ist kalt. Alles, was ich anfasse, wird wieder warm. Das ist mein Trick. Und Lötzinn.', 'freude'),
    ],
    M),
  tanzflaeche: tagesgespraech('dante-tag-tanzflaeche',
    [D('SAMSTAG! Du bist hier! Ich bin hier! Die Musik ist hier! Heiliges Kanonenrohr, tanz!', 'freude')],
    [D('Ich tanze wie ein kaputter Mixer, ich weiß. Aber ein kaputter Mixer hat mehr Spaß als ein heiler. Frag Mixi.')],
    M),
  vertraut: tagesgespraech('dante-tag-vertraut',
    [D('{name}! Ich hab Kekse gebacken. Für dich. Also, für alle. Aber deine sind die mit den meisten Schokostückchen. Zufall.', 'freude')],
    [D('Weißt du, was das Schlimmste am Knast war? Dass keiner „Gute Nacht“ gesagt hat. Du sagst immer „Bis später“. Das ist fast dasselbe.', 'besorgt')],
    M),
  platten: tagesgespraech('dante-tag-platten',
    [D('Psst. Hör mal. Das Knistern am Anfang. Hörst du’s? Das ist die Seele. Digital hat keine Seele. Nur Bits. Bits knistern nicht.')],
    [D('Nimm, was du kriegen kannst, und hau ab. Hab ich im Knast gedacht. Draußen hab ich dann Platten gekriegt. Und bin geblieben.', 'signatur')],
    M),
};

/** Arm-Wartung im Strang Vex × Aria (einmalig, danach Kurzoption im Menü). */
const armwartung = dialog('dante-tag-armwartung', [
  knoten('start', [
    erz('Werkbank. Dante beugt sich mit Lupenbrille über deinen Metallarm. Aria sitzt daneben auf der Werkbank, die Beine baumeln, der Schläger lehnt an der Wand.'),
    D('Wer hat das zusammengeklebt? Ripper? Natürlich Ripper. Das ist kein Arm, das ist ein Ratenvertrag mit Fingern.', 'wut'),
    A('Mach ihn heil. Ich hab ihn verbogen. … Ein bisschen.', 'verlegen'),
    erz('Dante öffnet die Abdeckung. Drähte, Öl, ein Zahnrad mit Bissspuren. Aria beugt sich vor und verzieht das Gesicht.'),
    A('Ich hab bei meinem nie zugeguckt. Ist ekliger als gedacht. Mach weiter.', 'freude'),
    D('Ich bau dir was Gescheites. Umsonst. Dafür verlier ich halt zweimal im Monat gegen Ripper beim Eins!.'),
  ], {
    choices: [
      { text: '„Nee. Ich zahl, was ich schulde.“', next: 'zahlen' },
      { text: 'Nichts sagen. Nur den Kopf schütteln.', next: 'kopf' },
    ],
  }),
  knoten('zahlen', [ich('Nee. Ich zahl, was ich schulde.', 'neutral')], { next: 'leise' }),
  knoten('kopf', [erz('Du schüttelst den Kopf. Dante seufzt. Aria guckt dich lange an.')], { next: 'leise' }),
  knoten('leise', [
    A('Ich hab damals nein gesagt zu dem Ding. Du konntest nicht.', 'trauer'),
    ich('Ich hab nicht mal gefragt.'),
    erz('Eine Weile hört man nur den Lötkolben. Dann klickt die Abdeckung zu. Der Arm summt statt zu zischen.'),
    D('Läuft jetzt leiser. Sag’s Ripper nicht. Und sag ihr nicht, dass ich weich bin.', 'verlegen'),
    A('Zu spät, Bäcker. Ich hab’s gesehen.', 'signatur'),
  ], { effects: [herz('aria', 20), herz('dante', 20), flag('vexaria_armwartung')] }),
]);

// ---------------------------------------------------------------------------------------------- Herz-Ereignisse

const he2 = dialog('he-dante-2', [
  knoten('start', [
    erz('Es riecht nach Zimt, Butter und Panik. Dante tanzt mit zwei Topflappen zwischen Ofen und Werkbank.'),
    D('Heiliges Kanonenrohr, du kommst genau richtig! Erstes Blech! Das erste Blech ist heilig! Das erste Blech –', 'freude'),
    erz('Das Blech rutscht ihm aus den Topflappen. Zwölf Kekse fliegen in Zeitlupe durch die Werkstatt.'),
  ], {
    choices: [
      { text: 'Hechten und das Blech fangen.', check: pruefung('he-dante-2-hechten', 'reflexe', 5, ['fangen']), next: 'gefangen', effects: [herz('dante', 40)] },
      {
        text: 'Die Kekse im Flug einsammeln!', next: 'flug',
        effects: [{
          minigame: 'akt-keksalarm', level: 1, key: 'he-dante-2-keksalarm', label: 'Das erste Blech',
          win: [{ give: 'dantes-kekse', qty: 2 }, herz('dante', 20)], lose: [{ message: 'Die Hälfte landet auf dem Boden. Dante zählt laut: „Eins! Zwei!“' }],
        }],
      },
      { text: 'Zu spät. Einen vom Boden aufheben und reinbeißen.', next: 'boden', effects: [herz('dante', 50)] },
    ],
  }),
  knoten('gefangen', [
    erz('Du schlitterst über den Boden und fängst das Blech zwei Zentimeter über den Fliesen. Heiß. Sehr heiß.'),
    D('DU HAST ES GEFANGEN! Das erste Blech! Weißt du, wie lange keiner mehr mein erstes Blech gefangen hat? Sieben Jahre! Weil ich sieben Jahre keins gebacken hab!', 'freude'),
  ], { next: 'regel' }),
  knoten('flug', [erz('Kekse fliegen, du fängst, Dante brüllt Zahlen, Captain Kuschel versteckt sich hinter dem Faxgerät.')], { next: 'regel' }),
  knoten('boden', [
    ich('Drei-Sekunden-Regel.'),
    D('DREI-SEKUNDEN-REGEL! Du kennst die Drei-Sekunden-Regel! Um Himmels Willen, ich hab einen Seelenverwandten!', 'ueberrascht'),
  ], { next: 'regel' }),
  knoten('regel', [
    D('Die Drei-Sekunden-Regel ist das wichtigste Gesetz der Unterstadt. Wichtiger als „Schulden muss man immer begleichen“. Sag das nicht Hunter.'),
    D('Hier. Der da. Der ist dreimal runtergefallen und immer unter drei Sekunden. Das ist ein Glückskeks. Ein Drei-Sekunden-Keks.', 'signatur'),
    erz('Er drückt dir einen leicht zerbröselten Keks in die Hand, so feierlich, als wär’s ein Orden.'),
    D('Und ab heute: Einbau gratis. Für dich. Keine Widerrede. Bezahlung nur in Kekskrümeln.', 'freude'),
  ], { effects: [{ give: 'drei-sekunden-keks' }, herz('dante', 20), { xp: 40 }, flag('dante_keks_freund'), { message: 'Cyberware-Einbau bei Dante ist ab jetzt kostenlos.' }] }),
]);

const he4 = dialog('he-dante-4', [
  knoten('start', [
    erz('Abend. Die Werkstatt glüht im Licht der Röhrenverstärker. Dante steht vor dem Plattenspieler und hält eine Platte, als wär sie ein Neugeborenes.'),
    D('Kabelbrand. Erste Tour. Vinyl-Vincent hatte sie unter einem Stapel Schlager. SCHLAGER. Das ist, als würde man einen Diamanten in Kartoffelsalat verstecken.', 'freude'),
    D('Du tanzt jetzt mit mir. Das ist keine Frage. Das ist ein Plattenspieler-Gesetz.', 'signatur'),
  ], {
    choices: [
      {
        text: 'Mitreißen lassen.', next: 'tanz',
        effects: [{
          minigame: 'akt-tanz', level: 1, key: 'he-dante-4-tanz', label: 'Werkstatt-Disco',
          win: [herz('dante', 30)], lose: [herz('dante', 10), { message: 'Du trittst ihm zweimal auf den Fuß. Er bedankt sich jedes Mal.' }],
        }],
      },
      { text: 'Dante in eine Drehung ziehen.', check: pruefung('he-dante-4-drehung', 'reflexe', 5, ['tanz']), next: 'drehung', effects: [herz('dante', 40)] },
      { text: 'Wie ein Kühlschrank wippen.', next: 'kuehlschrank', effects: [herz('dante', 25)] },
    ],
  }),
  knoten('tanz', [erz('Captain Kuschel sitzt auf dem Regal und sieht euch mit der Würde eines Hasen zu, der schon alles gesehen hat.')], { next: 'knast' }),
  knoten('drehung', [erz('Dante dreht sich, stolpert, fängt sich an der Werkbank und kreischt vor Glück.'), D('NOCHMAL!', 'freude')], { next: 'knast' }),
  knoten('kuehlschrank', [D('Wippen ist auch Tanzen! Wippen ist der Anfang von allem! Ich hab im Knast drei Jahre gewippt!', 'freude')], { next: 'knast' }),
  knoten('knast', [
    erz('Die Platte läuft aus. Ihr lasst euch aufs durchgesessene Sofa fallen. Es quietscht wie ein Akkordeon.'),
    D('Drei Jahre. Weißt du, was ich da gemacht hab? Gitarre gelernt. Ohne Gitarre.'),
    D('Ich hab mir das Griffbrett mit einem Löffel in die Pritsche geritzt. Sechs Saiten aus Zahnseide. Zehntausend Stunden. Jeden Tag. Akkorde ohne Ton.', 'trauer'),
    D('Als ich rauskam, hab ich mir eine echte gekauft. Und weißt du was? Ich konnte alles spielen. Und es klang … schrecklich. Weil ich nie gehört hatte, wie es klingen soll.', 'freude'),
    D('Seitdem sammle ich Platten. Damit ich weiß, wie’s klingen soll.'),
  ], {
    choices: [
      { text: '„Spiel mir was. Schrecklich ist okay.“', check: pruefung('he-dante-4-spielen', 'ausstrahlung', 5, ['ueberzeugen']), next: 'spiel', effects: [herz('dante', 40)] },
      { text: '„Zehntausend Stunden für nichts?“', next: 'nichts', effects: [herz('dante', 10)] },
      { text: '„Das ist das Traurigste und Schönste, was ich je gehört hab.“', next: 'schoen', effects: [herz('dante', 30)] },
    ],
  }),
  knoten('spiel', [
    erz('Er holt eine verbeulte Gitarre unter dem Sofa hervor und spielt drei Akkorde. Sie sind falsch. Sie sind wunderschön. Captain Kuschel legt die Ohren an.'),
    D('Siehst du? Schrecklich! Ich liebe es!', 'freude'),
  ], { next: 'erstpressung' }),
  knoten('nichts', [D('Für nichts? Um Himmels Willen, nein! Für die Hände! Die Hände wissen es jetzt. Das Ohr muss nur noch nachkommen.', 'ueberrascht')], { next: 'erstpressung' }),
  knoten('schoen', [
    D('… Das ist das Netteste, was einer seit dem Knast zu mir gesagt hat. Außer Captain Kuschel. Der sagt nichts, aber er meint es.', 'ueberrascht'),
  ], { next: 'erstpressung' }),
  knoten('erstpressung', [
    D('Es gibt eine Platte. „Samstagnacht im Neon“. Erstpressung, nur fünfzig Stück. Auf einer ist mein Gitarrensolo. Mein einziges. Aufgenommen mit dem Gefängnischor, über einen geschmuggelten Rekorder.', 'besorgt'),
    D('Ich hab sie nie gehört. Sie ist irgendwo da draußen. Gustav weiß vielleicht was. Oder Dexter. Oder sonst wer, der Sachen hat, die er nicht haben sollte.'),
    D('Wenn du sie findest … Heiliges Kanonenrohr. Wenn du sie findest.'),
  ], {
    choices: [
      { text: '„Ich such sie dir.“', when: { quest: 'pers-dante-erstpressung', state: 'inactive' }, next: 'ende', effects: [{ startQuest: 'pers-dante-erstpressung' }] },
      { text: '„Ich halt die Augen offen.“', when: { not: { quest: 'pers-dante-erstpressung', state: 'inactive' } }, next: 'ende' },
    ],
  }),
  knoten('ende', [
    D('Und das Sofa hier: Wenn du mal nicht heimkommst, schläfst du da. Captain Kuschel teilt. Meistens. Er tritt nachts.', 'freude'),
  ], { effects: [{ xp: 60 }, herz('dante', 20), flag('dante_sofa'), { message: 'Dantes Sofa ist jetzt ein Notschlafplatz.' }] }),
]);

const he6 = dialog('he-dante-6', [
  knoten('start', [
    erz('Tagsüber. Dante liegt halb unter der Werkbank, nur seine Beine schauen raus.'),
    D('Sicherung! Ich brauch eine Zehner-Sicherung! Im Schrank! Der linke! Nein, der rechte! NEIN, NICHT DER LINKE –', 'ueberrascht'),
    erz('Zu spät. Die linke Schranktür schwingt auf, und ein Schwall Fotos rutscht dir entgegen. Polaroids, Ausdrucke, ein zerknickter Besucherausweis vom Eisenhof. Auf jedem: Raven.'),
    erz('Raven lachend auf einem Dach. Raven mit einer Sonnenbrille, die eindeutig Hunter gehört. Raven schlafend auf genau diesem Sofa, vor sieben Jahren.'),
    D('Um Himmels Willen.', 'ueberrascht'),
    erz('Dante kriecht hervor, knallt mit dem Kopf gegen die Werkbank und sammelt die Fotos ein, als wären sie glühende Kohlen.'),
    D('Das ist … ein Archiv. Ein historisches Archiv. Für die Crew-Chronik. Ich bin der Crew-Chronist.', 'besorgt'),
    D('… Okay. Nein. Das ist kein Archiv.', 'trauer'),
    D('Ich hab ihr jeden Monat ein Foto geschickt. Damit sie die Stadt sieht. Die hier hab ich behalten. Damit ich sie seh.'),
    D('Bitte. Sag’s keinem. Vor allem nicht ihr. Ich krieg das selbst hin. Irgendwann. In zehntausend Stunden.'),
  ], {
    choices: [
      { text: '„Ich hab nichts gesehen. Großes Ehrenwort.“', next: 'versprechen', effects: [flag('dante_geheimnis_versprochen'), flag('dante_vertraut'), herz('dante', 50)] },
      {
        text: '„Sie ist frei, Dante. Du nicht. Sag’s ihr selbst.“', check: pruefung('he-dante-6-mut', 'ausstrahlung', 6, ['ueberzeugen']), next: 'mut',
        effects: [flag('dante_geheimnis_versprochen'), flag('dante_vertraut'), flag('paar_dante_raven_ermutigt'), herz('dante', 60)],
      },
      {
        text: '„Was ist dir mein Schweigen wert?“', check: pruefung('he-dante-6-erpressen', 'strasse', 5, ['einschuechtern']), next: 'erpressen',
        effects: [flag('dante_geheimnis_versprochen'), { give: 'dantes-kekse', qty: 3 }, herz('dante', -10)],
      },
      { text: '„Raven? Die ist über dich weg. Sieben Jahre, Dante.“', next: 'entmutigen', effects: [flag('paar_dante_raven_entmutigt'), herz('dante', -20)] },
      {
        text: '„Und wenn jemand anderes will, dass du ihn ansiehst?“', tag: '[Romanze]', when: ROM, next: 'romanze',
        effects: [flag('dante_geheimnis_versprochen'), flag('dante_romanze_angedeutet'), herz('dante', 30)],
      },
    ],
  }),
  knoten('versprechen', [
    D('Großes Ehrenwort. Mit Spucke?'),
    ich('Ohne Spucke.'),
    D('Ohne Spucke. Okay. Das ist ernster. Ohne Spucke ist viel ernster.', 'freude'),
  ], { next: 'ende' }),
  knoten('mut', [
    D('Frei. Ich bin … nicht frei. Heiliges Kanonenrohr, du hast recht. Ich sitz immer noch. In dem Schrank da.', 'trauer'),
    D('Irgendwann sag ich’s ihr. Mit Keksen. Und einer Platte. Und vielleicht einem Plan. Hast du einen Plan? Nein? Ich mach einen. Mit Diagramm.'),
  ], { next: 'ende' }),
  knoten('erpressen', [
    D('Erpressung! In meiner eigenen Werkstatt! Bei meinen eigenen Fotos!', 'wut'),
    D('… Drei Kekse. Mehr hab ich nicht. Die sind frisch. Fast. Einer war kurz auf dem Boden. Unter drei Sekunden.'),
  ], { next: 'ende' }),
  knoten('entmutigen', [
    D('Ja. Ja, wahrscheinlich. Sieben Jahre.', 'trauer'),
    erz('Er legt die Fotos zurück. Eins nach dem anderen, sehr sorgfältig, als würde er eine Platte in die Hülle schieben.'),
    D('Nimm, was du kriegen kannst, und hau ab. Hab ich nie gekonnt.'),
  ], { next: 'ende' }),
  knoten('romanze', [
    D('Jemand … anderes? Wer? Du? Um Himmels Willen.', 'verlegen'),
    D('Ich hab gerade einen Schrank voller Fotos aufgemacht, und du … Das ist zu viel Information für einen Werktag. Frag mich das nochmal. Wenn ich nicht zwischen Polaroids sitze.', 'verlegen'),
  ], { next: 'ende' }),
  knoten('ende', [
    erz('Die Schranktür geht zu. Klick. Dante lehnt sich mit dem Rücken dagegen, als könnte sie sonst wieder aufspringen.'),
    D('Zehner-Sicherung. Rechter Schrank. Bitte.', 'besorgt'),
  ], { effects: [{ xp: 100 }, herz('dante', 20)] }),
]);

// ♥8 und ♥10 ab Akt 2 (nach dem Countdown oder im Nachspiel), world.md §4.2, §4.7 „Die Wärme der Analogtechnik“.
// Paar-Strang: Bei `paar_dante_raven_geholfen` ist die Romanze gesperrt (Dante ist vergeben).
const ROMANZE_FREI: Condition = { all: [ROM, frei('dante'), { notFlag: 'paar_dante_raven_geholfen' }] };

const he8 = dialog('he-dante-8', [
  knoten('start', [
    erz('Sonntag, Flohmarkt. Zwischen Ständen mit rostigen Toastern, einbeinigen Schaufensterpuppen und einem Mann, der „echte Luft von 2040“ in Dosen verkauft, sitzt Dante auf einer Plattenkiste und leuchtet.'),
    D('DA bist du! Guck! GUCK! Ein Modem. Ein echtes Akustikmodem. Mit Gummimuscheln! Für den Telefonhörer!', 'freude'),
    erz('Der Händler daneben, ein Mann mit Schnurrbart und sehr wenig Geduld, verschränkt die Arme. „Achtzig Credits. Und er hat es schon dreimal abgeleckt.“'),
    D('Einmal! Einmal abgeleckt! Um die Kontakte zu prüfen!', 'wut'),
  ], {
    choices: [
      { text: 'Runterhandeln. „Achtzig? Für einen Briefbeschwerer?“', check: pruefung('he-dante-8-feilschen', 'strasse', 5, ['feilschen', 'verhandeln']), next: 'feilschen', effects: [herz('dante', 30)] },
      { text: 'Dem Händler seinen kaputten Plattenspieler reparieren. Im Tausch.', check: pruefung('he-dante-8-reparieren', 'technik', 5, ['reparieren']), next: 'reparieren', effects: [herz('dante', 30)] },
      { text: 'Achtzig Credits hinlegen.', when: { credits: 80 }, next: 'kaufen', effects: [{ credits: -80 }, herz('dante', 30)] },
      { text: '„Dante. Du hast kein Telefon mit Hörer.“', next: 'kein-telefon', effects: [herz('dante', 15)] },
    ],
  }),
  knoten('feilschen', [
    erz('Fünf Minuten, zwei Beleidigungen und ein Vergleich mit Rippers Preisen später geht das Modem für fünfundzwanzig über den Tisch. Der Händler sieht aus, als hätte er gerade ein Familienmitglied verkauft.'),
    D('Fünfundzwanzig! Du bist ein Monster! Ein wunderbares, sparsames Monster!', 'freude'),
  ], { next: 'warum', effects: [{ credits: -25 }] }),
  knoten('reparieren', [
    erz('Der Plattenspieler des Händlers hat einen gerissenen Riemen. Ein Haargummi, eine Büroklammer, zwei Minuten. Er dreht wieder. Der Händler legt eine Schlagerplatte auf und weint vor Glück.'),
    D('Mit einem HAARGUMMI! Analog! Das ist Analogtechnik in ihrer reinsten Form! Ich bin so stolz, ich könnte backen!', 'freude'),
  ], { next: 'warum' }),
  knoten('kaufen', [D('Du hast … für mich … achtzig Credits. Für ein Modem, das ich abgeleckt habe. Das ist das Romantischste, was je – ich meine Freundschaftlichste. Freundlichste. Um Himmels Willen.', 'verlegen')], { next: 'warum' }),
  knoten('kein-telefon', [
    D('… Ich hab kein Telefon mit Hörer.', 'ueberrascht'),
    D('ICH BAU EINS! Aus dem Modem! Rückwärts! Heiliges Kanonenrohr, das ist der beste Tag seit Wochen!'),
    erz('Der Händler gibt es ihm für zehn. Aus Mitleid. Dante zahlt mit Keksen.'),
  ], { next: 'warum' }),
  knoten('warum', [
    erz('Später. Dante sitzt zwischen zwei Kisten Platten und einem Karton VHS. Das Modem liegt auf seinem Schoß wie eine Katze. Er wird ruhig. Bei Dante ist ruhig ein Ereignis.'),
    D('Weißt du, warum ich aufgehört hab? Mit dem Hacken?', 'besorgt'),
    D('Digitech. Raven am Rohr, Blade weg, Alarm. Und ich im Funk: „Gib mir noch eine Sekunde.“ Ich hab die Tür nicht aufgekriegt. Eine Sekunde zu spät. Und das System hat es nicht mal gemerkt. Es hat einfach weitergesummt.', 'trauer'),
    D('Digital ist kalt. Du hackst ein System, und es merkt nicht mal, dass du da warst. Eine Platte merkt es. Jeder Kratzer erzählt, wer sie gehört hat.'),
    D('Ich will Sachen, die sich an mich erinnern. Das ist die Wärme der Analogtechnik.', 'zaertlich'),
  ], {
    choices: [
      { text: '„Und Nexus? Die hat dich gemerkt.“', when: { any: [{ flag: 'nexus_erwacht' }, { quest: 'main-2-bruch', state: 'done' }] }, next: 'nexus' },
      { text: '„Ich erinnere mich an dich, Dante. Ohne Kratzer.“', next: 'deck' },
    ],
  }),
  knoten('nexus', [
    D('Ja. Ja, hat sie. Das ist ja das Furchtbare. Zum ersten Mal hat ein System gemerkt, dass ich da war.', 'besorgt'),
    D('Und sie hat sich nicht gewehrt. Sie hat sich gewundert. Wie ein Kind, das zum ersten Mal einen Kratzer an sich findet.'),
    D('Vielleicht ist nicht alles Digitale kalt. Vielleicht hat es nur noch keiner gewärmt. … Sag das nicht laut. Sonst muss ich meine ganze Lebensphilosophie neu löten.', 'verlegen'),
  ], { next: 'deck', effects: [flag('dante_nexus_warm'), herz('dante', 10)] }),
  knoten('deck', [
    erz('Er greift in die Jackentasche und hält dir ein abgegriffenes Kartendeck hin. Die Ecken weich wie Stoff, auf der Schachtel mit Kuli: „EINS! – NICHT VERLIEREN (DAS DECK) (AUCH NICHT DAS SPIEL)“.'),
    D('Mein erstes Eins!-Deck. Damit hab ich im Knast gespielt. Gegen mich selbst. Dreitausend Runden. Ich hab dreitausend Mal verloren.', 'besorgt'),
    D('Ich hasse Eins!. Ich liebe dieses Deck. Du kriegst es. Weil du dich erinnerst. Ohne Kratzer. Das ist fast unmöglich, und du machst es einfach.'),
  ], {
    effects: [{ give: 'dantes-altes-deck' }],
    choices: [
      { text: '„Dann eine Runde. Hier. Mit dem Deck.“', next: 'runde' },
      { text: '„Danke, Dante. Ich pass drauf auf.“', next: 'freund', effects: [herz('dante', 30)] },
      { text: '„Dann leg eine Platte auf. Für uns.“', tag: '[Romanze]', when: ROMANZE_FREI, next: 'tanz' },
    ],
  }),
  knoten('runde', [D('Eine Runde! Auf einer Plattenkiste! Mitten auf dem Flohmarkt! Heiliges Kanonenrohr, ja!', 'freude')], {
    effects: [{
      minigame: 'akt-eins', level: 2, key: 'he-dante-8-eins', label: 'Eins! auf dem Flohmarkt',
      win: [herz('dante', 20), { message: 'Du gewinnst. Dante flucht nicht. Er lacht. Zum ersten Mal lacht er über eine Niederlage.' }],
      lose: [herz('dante', 40), { message: 'Dante gewinnt. Er steht auf, hebt die Arme und schreit „EINS!“ über den ganzen Flohmarkt. Drei Leute klatschen.' }],
    }],
    next: 'freund',
  }),
  knoten('freund', [
    D('Ohne Kratzer. Ha! Gib mir Zeit. Ich krieg dich noch zerkratzt. Im guten Sinn!', 'freude'),
    D('Freunde sind die einzigen Platten, die mit jedem Kratzer besser klingen. Das hab ich mir gerade ausgedacht. Ich schreib’s auf eine Hülle.'),
  ], { effects: [{ xp: 150 }, herz('dante', 20)] }),
  knoten('tanz', [
    erz('Er sieht dich an. Lange. Dann legt er eine Platte auf den Koffer-Plattenspieler – eine, die er seit dem Knast nicht mehr gehört hat. Ein altes Liebeslied mit zu viel Hall.'),
    erz('Zwischen den Kisten tanzt ihr. Er tritt dir dreimal auf den Fuß.'),
    D('Das ist Absicht. Taktik. Damit du näher kommst.', 'verlegen'),
    erz('Es funktioniert. Der Händler mit dem Schnurrbart dreht seinen Schlager leiser. Aus Respekt.'),
    D('Flutmauer. Ein Abend. Ich bring den Plattenspieler. Du bringst … dich. Und vielleicht Schuhe mit Stahlkappen.', 'zaertlich'),
  ], { effects: [flag('dante_romanze_tanz'), flag('dante_date_geplant'), herz('dante', 50), { xp: 150 }] }),
]);

/** Romanze-Station zwischen ♥8 und ♥10: Spaziergang auf der Flutmauer (world.md §4.7 „Ablauf“). */
const date = dialog('rom-dante-date', [
  knoten('start', [
    erz('Flutmauer, Abend. Der Wind riecht nach Salz und Öl. Dante sitzt auf Nyras Bank, den Koffer-Plattenspieler auf den Knien, eine Tüte Kekse daneben, einen Feuerlöscher zu seinen Füßen.'),
    D('Du bist da! Du bist echt da! Ich hab zwei Szenarien geplant. In einem kommst du. In dem anderen ess ich alle Kekse und heul in den Feuerlöscher.', 'freude'),
    D('Szenario eins. Sehr gut. Ich hab nur für Szenario zwei geübt.', 'verlegen'),
  ], {
    choices: [
      { text: 'Neben ihn setzen und einen Keks klauen.', next: 'keks', effects: [herz('dante', 20)] },
      { text: '„Was ist mit dem Feuerlöscher, Dante?“', next: 'loescher' },
    ],
  }),
  knoten('keks', [D('Drei-Sekunden-Regel gilt auch fürs Klauen! Du hattest ihn schon drei Sekunden in der Hand, er gehört dir! … Ich hab die Regel gerade geändert. Für dich.', 'freude')], { next: 'meer' }),
  knoten('loescher', [D('Für den Fall, dass ich etwas Romantisches versuche und dabei was anzünde. Statistisch: achtundsechzig Prozent. Ich hab Tabellen.', 'signatur')], { next: 'meer' }),
  knoten('meer', [
    erz('Hinter der Mauer liegt das Wasser, grau und weit und unruhig. Dante legt eine Platte auf: Meeresrauschen, aufgenommen irgendwann vor dem Smog. Es knistert.'),
    D('Nyra hat mir das mal gegeben. „Damit du weißt, wie es klingen soll.“ So wie ich mit der Gitarre. Man muss wissen, wie es klingen soll, bevor man es selbst macht.', 'besorgt'),
    D('Ich weiß nicht, wie das hier klingen soll. Das mit uns. Ich hab keine Platte davon.'),
  ], {
    choices: [
      { text: 'Seine Hand nehmen. „Dann nehmen wir’s auf. Jetzt.“', next: 'hand', effects: [herz('dante', 40)] },
      { text: '„Es klingt nach dir. Laut, schief und warm.“', check: pruefung('rom-dante-date-warm', 'ausstrahlung', 6, ['flirt']), next: 'warm', effects: [herz('dante', 50)] },
      { text: 'Den Kopf an seine Schulter legen und nichts sagen.', next: 'schulter', effects: [herz('dante', 40)] },
    ],
  }),
  knoten('hand', [
    erz('Seine Hand ist warm und riecht nach Flussmittel. Sie zittert kurz, dann hält sie fest, als hätte sie sich gerade entschieden.'),
    D('Aufnahme läuft. Rotes Licht. Nicht wackeln. Um Himmels Willen, nicht wackeln.', 'zaertlich'),
  ], { next: 'ende' }),
  knoten('warm', [
    D('Laut, schief und warm.', 'ueberrascht'),
    D('Das ist … das ist die schönste Rezension, die ich je gekriegt hab. Und ich hab mal fünf Sterne von einem Toaster gekriegt. Selbstgebaut, aber trotzdem.', 'verlegen'),
    erz('Er nimmt deine Hand, ganz vorsichtig, als könnte sie springen wie eine Nadel auf der Platte.'),
  ], { next: 'ende' }),
  knoten('schulter', [
    erz('Dante erstarrt. Er hört auf zu reden. Zehn Sekunden. Zwanzig. Ein neuer Rekord.'),
    D('… Ich sag jetzt nichts. Ich sag jetzt GAR nichts. Siehst du? Ich kann das.', 'zaertlich'),
  ], { next: 'ende' }),
  knoten('ende', [
    erz('Die Platte läuft aus. Das Knistern bleibt. Ihr bleibt auch, bis die Lichter der Kräne angehen und der Wind kalt wird und keiner von euch der Erste sein will, der loslässt.'),
    D('Nächstes Mal bring ich zwei Feuerlöscher. Ich glaub, ich brauch sie. Für mich.', 'verlegen'),
  ], { effects: [flag('dante_date'), { cutscene: 'szene-rom-dante-date' }, herz('dante', 30), { xp: 80 }] }),
]);

const he10 = dialog('he-dante-10', [
  knoten('start', [
    erz('Werkstatt, spät in der Nacht. Die Röhrenverstärker glimmen, auf dem Plattenspieler dreht sich etwas Leises. Dante hält Captain Kuschel im Arm wie einen Pokal. Der Hase ist heute Ehrengast und sieht aus, als hätte er der Zeremonie nicht zugestimmt.'),
    D('Captain Kuschel braucht einen Paten. Falls mir was passiert. Oder falls ich backe und vergess, ihn zu füttern. Das passiert öfter, als ich zugeben will.'),
    D('Wir hatten einen Bruch, einen Countdown und einen Chip, der in meiner Mülltonne explodiert ist. Ich will, dass er jemanden hat. Jemanden, der zurückkommt.', 'besorgt'),
  ], {
    choices: [
      { text: '„Ich werd sein Pate. Versprochen.“', next: 'pate', effects: [herz('dante', 30)] },
      { text: 'Captain Kuschel feierlich die Pfote schütteln.', next: 'pfote', effects: [herz('dante', 40)] },
    ],
  }),
  knoten('pate', [D('Versprochen! Mit Spucke? Ohne Spucke. Ohne Spucke ist ernster. Das weißt du noch.', 'freude')], { next: 'rezept' }),
  knoten('pfote', [
    erz('Captain Kuschel lässt sich die Pfote schütteln. Dann niest er dir auf die Hand. Dante bricht in Tränen aus.'),
    D('Er hat geniest! Das ist ein JA! Das ist ein Hasen-Ja! Um Himmels Willen!', 'freude'),
  ], { next: 'rezept' }),
  knoten('rezept', [
    erz('Dante setzt den Hasen aufs Regal und holt einen Zettel aus der Keksdose. Mehrfach gefaltet, fettfleckig, mit einer Zimtspur quer über der Schrift.'),
    D('Und das hier. Das Original. Mit Fettflecken. Wer das Rezept hat, gehört zur Familie. Das ist ein Gesetz. Ich hab’s grad erlassen.', 'freude'),
    D('Die geheime Zutat steht unten. Nicht lesen, bevor du allein bist. Okay, ich sag’s dir: Es ist Salz. Eine Prise. Gegen die Traurigkeit. Hat meine Oma gesagt.', 'zaertlich'),
  ], {
    effects: [{ give: 'kekse-rezept' }, flag('dante_kuschel_pate'), { xp: 200 }],
    choices: [
      { text: '„Und Raven?“', next: 'raven', when: { all: [{ notFlag: 'paar_dante_raven_geholfen' }, { notFlag: 'paar_dante_raven_gestoert' }] } },
      { text: '„Und Raven? Wir haben einen Plan, oder?“', next: 'raven-plan', when: { flag: 'paar_dante_raven_geholfen' } },
      { text: '„Hey. Raven ist nicht das Ende der Welt.“', next: 'raven-gestoert', when: { flag: 'paar_dante_raven_gestoert' } },
      { text: '„Dante. Und wir?“', tag: '[Romanze]', when: { all: [ROMANZE_FREI, { flag: 'dante_romanze_tanz' }] }, next: 'wir' },
    ],
  }),
  knoten('raven', [
    D('Raven. Ich … brauch Hilfe. Ein Date. Ein richtiges. Mit Kerzen. Ohne Feuerlöscher. Na gut, mit Feuerlöscher.', 'besorgt'),
    D('Ich hab ein Diagramm. Es hat Farben. Es hat Pfeile. Es endet bei „Und dann sagt sie was“, und dann weiß ich nicht weiter. Hilfst du mir?'),
  ], {
    choices: [
      { text: '„Ich helf dir. Wir machen das richtig.“', next: 'helfen', effects: [flag('paar_dante_raven_geholfen'), flag('paar_dante_raven_gestoert', false), herz('dante', 60)] },
      {
        text: '„Wirf das Diagramm weg. Sag ihr einfach, was im Schrank ist.“', check: pruefung('he-dante-10-schrank', 'ausstrahlung', 7, ['ueberzeugen']),
        next: 'schrank', effects: [flag('paar_dante_raven_geholfen'), flag('paar_dante_raven_gestoert', false), herz('dante', 70)],
      },
      { text: '„Lass das, Dante. Das wird nichts.“', next: 'stoeren', effects: [flag('paar_dante_raven_gestoert'), herz('dante', -30)] },
      { text: '„Das musst du allein schaffen.“', next: 'allein', effects: [herz('dante', 10)] },
    ],
  }),
  knoten('helfen', [
    D('Richtig! Mit Plan! Mit Diagramm! Ich hab schon ein Diagramm! Es hat Farben!', 'freude'),
    D('Aber erst holen wir die Stadt zurück. Und dann … dann das Date. Am Wasser. Mit Sonnenuntergang. Lio soll spielen. Nein, Lio redet zu viel. Doch, Lio. Ich red ja auch zu viel.'),
  ], { next: 'ende' }),
  knoten('schrank', [
    D('Was im Schrank ist. Sie. Sieben Jahre sie.', 'trauer'),
    D('… Okay. Kein Diagramm. Nur Wahrheit. Wahrheit hat keine Farben. Wahrheit hat nur einen Pfeil, und der zeigt auf mich.'),
    D('Wenn das hier vorbei ist. Wenn wir alle noch da sind. Dann sag ich’s ihr. Am Wasser. Und du stehst hinter mir und hältst mich fest, wenn ich rückwärts laufe.', 'zaertlich'),
  ], { next: 'ende' }),
  knoten('raven-plan', [
    D('Einen Plan! Ja! Raven hat dir auch … sie hat dich gefragt? Sie hat DICH gefragt? Wegen MIR?', 'ueberrascht'),
    D('Heiliges Kanonenrohr. Ich muss mich hinsetzen. Ich sitze schon. Ich muss mich tiefer hinsetzen.'),
    D('Nach alldem. Am Wasser. Sonnenuntergang. Ich bring den Plattenspieler, du bringst sie, und keiner bringt Blade mit.', 'freude'),
  ], { next: 'ende', effects: [herz('dante', 40)] }),
  knoten('raven-gestoert', [
    D('Nein. Ist sie nicht. Sie ist nur … woanders. Wie eine Platte, die man verliehen hat und nicht zurückkriegt.', 'trauer'),
    D('Na gut. Ich hab’s wenigstens versucht. Fast. In Gedanken. Sehr oft.'),
  ], { next: 'ende' }),
  knoten('stoeren', [D('… Na gut. Ich hab’s wenigstens versucht. Fast.', 'trauer')], { next: 'ende' }),
  knoten('allein', [D('Allein. Ja. Zehntausend Stunden allein. Ich kann das. Glaub ich. Ich übe auf der Pritsche. Ohne Pritsche.', 'besorgt')], { next: 'ende' }),
  knoten('ende', [
    erz('Captain Kuschel hoppelt vom Regal und legt sich auf deine Füße. Dante sieht das und muss sich sehr schnell zum Plattenspieler umdrehen.'),
    D('Er mag dich. Er mag nie jemanden. Er mag mich nur, weil ich die Karotten habe.', 'zaertlich'),
  ]),
  knoten('wir', [
    D('Wir? Ich … Raven … du … Heiliges Kanonenrohr, ich hab zwei Herzen, und eins davon ist ein Röhrenverstärker.', 'verlegen'),
    D('Ich hab sieben Jahre an jemanden gedacht, der nie geantwortet hat. Und dann kommst du und antwortest einfach. Jeden Tag. Mit Keksen.', 'besorgt'),
    erz('Ein Knall im Sicherungskasten. Stromausfall. Nur die Röhren glimmen noch orange. Dante redet weiter. Über Kondensatoren. Über Spannungsspitzen. Über die Frage, ob Röhren nachglühen, wenn man sie liebt. Ohne Punkt und Komma.'),
  ], {
    choices: [
      { text: 'Ihn küssen.', next: 'kuss', effects: [{ cutscene: 'szene-rom-dante-werkstatt' }, herz('dante', 60)] },
      { text: '„Dante. Halt die Klappe.“', check: pruefung('he-dante-10-klappe', 'ausstrahlung', 7, ['flirt']), next: 'kuss', effects: [{ cutscene: 'szene-rom-dante-werkstatt' }, herz('dante', 70)] },
    ],
  }),
  knoten('kuss', [
    erz('Er verstummt mitten im Wort „Elektrolyt“. Seine Hände sind warm vom Lötkolben und zittern ein bisschen. Er schmeckt nach Zimt und einer Prise Salz.'),
    D('… Okay. Das war besser als jede Erstpressung. Und ich hab eine Erstpressung.', 'zaertlich'),
    D('Raven … Raven muss das wissen. Von mir. Nicht von Ripper, nicht vom Stadt-TV. Ich sag’s ihr. Morgen. Sanft. Mit Keksen.', 'besorgt'),
  ], {
    effects: [flag('dante_romanze_zusammen'), flag('paar_dante_raven_entschieden')],
    choices: [
      { text: '„Sag’s ihr sanft. Sie hat’s verdient.“', next: 'nacht', effects: [herz('raven', 10)] },
      { text: '„Ich sag’s ihr. Heute noch. Und nicht sanft.“', next: 'nacht', effects: [flag('raven_eifersucht_ausgeloest')] },
    ],
  }),
  knoten('nacht', [
    erz('Die Röhren glimmen. Captain Kuschel sitzt auf dem Regal und sieht euch an wie ein Anstandswauwau mit Hasenohren.'),
    D('Willst du … also, nur wenn du willst … der Strom ist eh weg … bleiben?', 'verlegen'),
  ], {
    choices: [
      { text: 'Bleiben.', effects: [flag('dante_nacht'), flag('woche_dante_nacht'), { cutscene: 'szene-dante-nacht' }] },
      { text: '„Ein andermal, Kekskönig.“', next: 'andermal' },
    ],
  }),
  knoten('andermal', [D('Ein andermal. Ich back schon mal vor. Für den Fall der Fälle. Für alle Fälle.', 'signatur')]),
]);

/** Morgen danach (world.md §4.7): Dante in Schürze am Ofen, dann Frühstück im High Voltage. */
const morgenDanach = dialog('dante-morgen-danach', [
  knoten('start', [
    erz('Morgen. Die Werkstatt riecht nach Zimt, Butter und Panik. Der Strom ist wieder da. Dante steht in Unterhose und Schürze am Ofen und schiebt das dritte Blech rein.'),
    D('Drei Bleche. Ich war motiviert.', 'verlegen'),
    D('Captain Kuschel hat die Nacht im Faxgerät verbracht. Er ist beleidigt. Er hat mir ein Fax geschickt. Es ist leer. Das ist schlimmer als jede Beleidigung.'),
  ], {
    choices: [
      { text: 'Einen Keks vom Blech klauen.', next: 'fruehstueck', effects: [herz('dante', 10)] },
      { text: '„Hose, Dante. Hose.“', next: 'fruehstueck', effects: [herz('dante', 15)] },
    ],
  }),
  knoten('fruehstueck', [
    erz('Frühstück im High Voltage. Dante bringt die Kekse mit. Alle drei Bleche. Er hat sich angezogen. Fast.'),
    R('Hätte nicht gedacht, dass du ihn zum Schweigen kriegst. Respekt.', 'signatur'),
    H('Wenn ich noch einmal Kekskrümel in seinem Bett find … warte, warum weiß ich das?', 'besorgt'),
    RP('Alle Implantate noch dran? Bei ihm ist nichts dran, was ich verkauft hab. Schade eigentlich.'),
    D('Ich hab euch alle lieb und ihr seid alle furchtbar!', 'freude'),
  ], { effects: [{ checkBuff: { id: 'beschwingt-dante', label: 'Beschwingt', value: 1, attribute: 'ausstrahlung', forDays: 0, consumes: false } }, { message: 'Beschwingt: +1 Ausstrahlung bis Mitternacht.' }] }),
]);

const morgenWoche = dialog('dante-morgen-woche', [
  knoten('start', [
    erz('Morgen. Auf dem Kissen liegt ein Keks in Herzform. Er ist leicht verbrannt. Daneben ein Fax: „HAB MIR DIE FINGER VERBRANNT. HAT SICH GELOHNT. – D.“'),
  ], { effects: [{ give: 'dantes-kekse' }, { checkBuff: { id: 'beschwingt-dante', label: 'Beschwingt', value: 1, attribute: 'ausstrahlung', forDays: 0, consumes: false } }, { message: 'Beschwingt: +1 Ausstrahlung bis Mitternacht.' }, herz('dante', 10)] }),
]);

/** Eifersucht und Trennung (world.md §4.7), Gegenstück zu Hunter. */
const eifersucht = dialog('dante-eifersucht', [
  knoten('start', [
    D('Ich hab gesehen, wie du geguckt hast. Noch einmal und ich zieh dir die Ohren lang. Mit der Zange. Der kleinen. Die tut mehr weh.', 'wut'),
    D('… Ich hab noch nie jemandem gedroht. Fühlt sich komisch an. Ich mach’s trotzdem. Weil ich dich mag. Sehr. Um Himmels Willen.', 'besorgt'),
  ], {
    effects: [flag('dante_eifersucht_gewarnt'), ...FLIRT_FREMD.map((f) => flag(f, false))],
    choices: [
      { text: '„Nur Gerede, Dante. Versprochen.“', next: 'gerede' },
      { text: '„Eifersüchtig siehst du süß aus.“', check: pruefung('dante-eifersucht-frech', 'ausstrahlung', 7, ['flirt']), next: 'suess' },
    ],
  }),
  knoten('gerede', [D('Gerede. Okay. Ich glaub dir. Ich glaub dir, weil ich’s will. Das ist die schlechteste Art zu glauben. Und die einzige, die ich kann.', 'trauer')]),
  knoten('suess', [D('Süß. SÜSS. Ich bin ein gefährlicher Ex-Hacker mit Vorstrafe! … Sag’s noch mal.', 'verlegen')]),
]);
const trennung = dialog('dante-trennung', [
  knoten('start', [
    erz('Die Werkstatt ist still. Kein Plattenspieler, kein Ofen. Nur Dante an der Werkbank, mit dem Rücken zu dir.'),
    D('Zweimal. Weißt du, was eine Platte macht, wenn man zweimal an derselben Stelle kratzt? Sie springt. Immer an der Stelle. Für immer.', 'trauer'),
    D('Ich will das nicht. Ich will nicht, dass wir springen. Also hör ich auf. Bevor es kaputt ist.'),
  ], {
    effects: [
      herz('dante', -150), flag('dante_romanze_zusammen', false), flag('dante_nacht', false), flag('dante_getrennt'),
      ...FLIRT_FREMD.map((f) => flag(f, false)),
    ],
    choices: [
      { text: '„Es tut mir leid, Dante.“', next: 'leid' },
      { text: '„Dann eben nicht.“', next: 'nicht' },
    ],
  }),
  knoten('leid', [D('Ich weiß. Ich back trotzdem weiter für dich. Nur ohne Herzform. Herzform ist jetzt … zu.', 'trauer')]),
  knoten('nicht', [D('Dann eben nicht. Drei-Sekunden-Regel. Was zu lange liegt, ist weg.', 'wut')]),
]);

/** Rivalitätsereignis, nur wenn die Spielfigur Dante bewusst die Romanze mit Raven unter die Nase reibt (world.md §4.7). */
const reEifersucht = dialog('re-dante-eifersucht', [
  knoten('start', [
    D('„Zu spät.“ Hat sie gesagt. Raven. Dass du gesagt hast, ich bin zu spät.', 'wut'),
    D('Sieben Jahre bin ich zu spät. Eine Sekunde bei Digitech, sieben Jahre danach. Das weiß ich selbst. Das musst du mir nicht ausrichten lassen.', 'trauer'),
  ], {
    effects: [herz('dante', -120), flag('dante_eifersucht_gesehen')],
    choices: [
      { text: '„Das war mies von mir. Tut mir leid.“', check: pruefung('re-dante-eifersucht-entschuldigen', 'ausstrahlung', 7, ['trost']), next: 'leid', effects: [herz('dante', 60)] },
      { text: '„Ich hätt’s dir selbst sagen sollen.“', next: 'selbst', effects: [herz('dante', 30)] },
      { text: '„Dann sei halt pünktlich.“', next: 'hart', effects: [herz('dante', -60)] },
    ],
  }),
  knoten('leid', [D('… Okay. Ich glaub dir. Ich bin zu weich. Raven sagt das auch. Pass auf sie auf. Sie verbrennt sich nie. Das macht mir Sorgen.', 'besorgt')]),
  knoten('selbst', [D('Ja. Hättest du. Mit Keksen. Schlechte Nachrichten immer mit Keksen. Das ist ein Gesetz. Ich hab’s nicht erlassen, das war schon da.', 'trauer')]),
  knoten('hart', [D('Pünktlich. Ja. Ich stell mir einen Wecker. Für die nächsten sieben Jahre.', 'wut'), erz('Er dreht dir den Rücken zu und legt eine Platte auf. Laut. Sehr laut.')]),
]);

// ---------------------------------------------------------------------------------------------- Figur

const A23 = dante23(M);

const dante: NpcDef = {
  id: 'dante',
  name: 'Dante',
  unknownName: 'Mann mit Plattenkiste',
  portrait: 'dante',
  sprite: 'dante-walk',
  faction: 'crew-hunter',
  romanceable: true,
  bio: 'Ehemaliger Hacker, seit dem Knast „im Ruhestand“. Schrauber mit Werkstatt voller Platten, VHS und einem Faxgerät von 2060. Backt Kekse, verliert beim Eins!, versteckt Fotos im Schrank.',
  gifts: {
    loves: ['vinyl-platte', 'vhs-kassette', 'faxpapier', 'nougatbombe'],
    likes: ['chips-tuete', 'comic-heft', 'loetkolben-gold', 'plueschmoehre', 'retro-tastatur', 'echtobst-apfel', 'hofhonig'],
    dislikes: ['datenkristall', 'seltenes-implantat'],
    hates: ['kartendeck', 'goldknauf-replik', 'nexi-pluesch', 'rostige-dose', 'virus-implantat'],
  },
  schedule: [
    // Akt 2/3/Nachspiel vorangestellt (design/plan/act23.json npcSchedules.dante); Partynacht vor dem Flohmarkt.
    ...DANTE_PLAN_23,
    // he-dante-8 (act2): Sonntag auf dem Flohmarkt.
    { slot: 'tag', days: ['so'], when: { act: 2 }, place: { map: 'schrottmarkt', at: 'flohmarkt' } },
    { slot: 'morgen', days: ['mo', 'do'], place: { map: 'schrottmarkt', at: 'plattenkiste-dante' } },
    { slot: 'morgen', place: { map: 'dantes-werkstatt', at: 'ofen' } },
    { slot: 'tag', place: { map: 'dantes-werkstatt', at: 'werkbank' } },
    { slot: 'abend', days: ['do'], place: { map: 'dantes-werkstatt', at: 'eins-tisch' } },
    { slot: 'abend', place: { map: 'dantes-werkstatt', at: 'plattenspieler' } },
    { slot: 'nacht', days: ['sa'], place: { map: 'high-voltage', at: 'tanzflaeche' } },
    { place: 'away' },
  ],
  heartEvents: [
    { id: 'he-dante-2', hearts: 2, map: 'dantes-werkstatt', time: ['morgen', 'abend'], when: KENNT, dialogue: 'he-dante-2' },
    { id: 'he-dante-4', hearts: 4, map: 'dantes-werkstatt', time: 'abend', when: { all: [KENNT, { not: { weekday: 'do' } }] }, dialogue: 'he-dante-4' },
    { id: 'he-dante-6', hearts: 6, map: 'dantes-werkstatt', time: 'tag', when: KENNT, cutscene: 'szene-he-dante-6', dialogue: 'he-dante-6' },
    { id: 'he-dante-8', hearts: 8, map: 'schrottmarkt', time: 'tag', when: und(RUHIG, { weekday: 'so' }), dialogue: 'he-dante-8' },
    // Romanze-Station Date (zwischen ♥8 und ♥10): Flutmauer, abends.
    {
      id: 'rom-dante-date', hearts: 8, map: 'flutmauer', time: 'abend',
      when: und(RUHIG, ROM, { flag: 'dante_date_geplant' }, { notFlag: 'paar_dante_raven_geholfen' }), dialogue: 'rom-dante-date',
    },
    {
      id: 'he-dante-10', hearts: 10, map: 'dantes-werkstatt', time: 'nacht',
      // Läuft die Romanze (Tanz bei ♥8), wartet der Höhepunkt auf das Date.
      when: und(RUHIG, { seen: 'he-dante-8' }, { any: [{ not: ROM }, { notFlag: 'dante_romanze_tanz' }, { seen: 'rom-dante-date' }, { flag: 'paar_dante_raven_geholfen' }] }),
      dialogue: 'he-dante-10',
    },
  ],
  companion: {
    // world.md §4.6/§11.2: Dante kämpft ab main-2-countdown (dort { recruit: 'dante' }). Im Master-Modus nicht.
    recruit: { all: [{ act: 2 }, IN_CREW, NICHT_MASTER] },
    stats: {
      hp: 42, armor: 1, morale: 70,
      attributes: { technik: 8, koerper: 3, reflexe: 5, ausstrahlung: 5, strasse: 4 },
      weapon: { kind: 'smart', damage: 4, range: 6, hit: 5 },
      abilities: ['dante-nougatbomben-wurf', 'dante-heiliges-kanonenrohr'],
    },
    // Wächst mit der Stufe (Akt 2/3).
    statsByLevel: [
      { minLevel: 6, hp: 52, armor: 2, morale: 75, attributes: { technik: 9, reflexe: 6, ausstrahlung: 6 }, weapon: { damage: 6, range: 6, hit: 6 } },
      { minLevel: 9, hp: 62, armor: 2, morale: 85, attributes: { technik: 10, reflexe: 7, koerper: 4 }, weapon: { damage: 8, range: 7, hit: 7 } },
    ],
    heartAbilities: [{ hearts: 6, ability: 'dante-kuschel-ablenkung' }],
    // Duo „Meister und Fan“ (world.md §4.6): Dante + Nyra, beide ♥6.
    duo: [{ ability: 'duo-meister-und-fan', when: { all: [{ companion: 'nyra' }, { hearts: 'dante', min: 6 }, { hearts: 'nyra', min: 6 }] } }],
  },
  partyCheckBonus: [
    { attribute: 'technik', tags: ['hacken', 'reparieren'], value: 1, label: 'Dante quasselt dir ins Ohr' },
  ],
  talk: [
    ...A23.talkFirst,
    rede('re-dante-eifersucht', und({ flag: 'dante_eifersucht_ausgeloest' }, { notFlag: 'dante_eifersucht_gesehen' })),
    rede('dante-tag-rivale', { rival: 'dante' }),
    rede('dante-trennung', und(ZUSAMMEN, HAT_FREMD_GEFLIRTET, { flag: 'dante_eifersucht_gewarnt' })),
    rede('dante-eifersucht', und(ZUSAMMEN, HAT_FREMD_GEFLIRTET)),
    rede('dante-tag-verpetzt', { all: [{ flag: 'dante_geheimnis_gebrochen' }, { notFlag: 'dante_reagierte_verpetzt' }] }),
    rede('dante-tag-armwartung', { all: [VEX, { seen: 'rom-vexaria-armdruecken' }, { notFlag: 'vexaria_armwartung' }, { time: ['tag', 'abend'] }] }),
    rede('dante-tag-vexaria-muellsack', { all: [VEX, { flag: 'vexaria_knutsch' }, { notFlag: 'dante_kommentar_vexaria_muellsack' }] }),
    rede('dante-tag-vexaria-zusammen', { all: [VEX, { flag: 'aria_kuss' }, { notFlag: 'dante_kommentar_vexaria_zusammen' }] }),
    rede('dante-tag-aria-romanze', { all: [{ not: VEX }, { flag: 'aria_romanze_zusammen' }, { notFlag: 'dante_kommentar_aria_romanze' }] }),
    rede('dante-tag-fremd', { not: KENNT }),
    ...A23.talk,
    rede('dante-tag-zeit', { not: { act: 2 } }, 8),
    rede('dante-tag-eins', { all: [{ weekday: 'do' }, { time: 'abend' }] }),
    rede('dante-tag-plattenkiste', { all: [{ weekday: ['mo', 'do'] }, { time: 'morgen' }] }),
    rede('dante-tag-ofen', { time: 'morgen' }),
    rede('dante-tag-werkbank', { time: 'tag' }),
    rede('dante-tag-tanzflaeche', { all: [{ weekday: 'sa' }, { time: 'nacht' }] }),
    ...A23.talkLate,
    rede('dante-tag-vertraut', undefined, 6),
    rede('dante-tag-platten'),
  ],
};

export const part: ContentPart = {
  npcs: { dante },
  dialogues: sammle(
    T.rivale, T.verpetzt, T.muellsack, T.vexariaZusammen, T.ariaRomanze, T.fremd, T.zeit, T.eins, T.plattenkiste,
    T.ofen, T.werkbank, T.tanzflaeche, T.vertraut, T.platten, armwartung,
    he2, he4, he6, he8, date, he10, morgenDanach, morgenWoche, eifersucht, trennung, reEifersucht,
    ...A23.dialogues,
  ),
  cutscenes: sammleSzenen(
    {
      id: 'szene-he-dante-6', title: 'Der Schrank',
      beats: [
        { image: 'cut-he-dante-6', pan: 'in', fade: 'in', caption: 'Dantes Werkstatt. Der linke Schrank. Der falsche Schrank.', hold: 1400 },
        { image: 'cut-he-dante-6', pan: 'left', lines: [D('Nicht hingucken! Doch, hingucken! Nein! Augen zu! Um Himmels Willen!', 'ueberrascht')] },
      ],
    },
    {
      id: 'szene-rom-dante-werkstatt', title: 'Die Wärme der Analogtechnik',
      beats: [{ image: 'cut-rom-dante-werkstatt', pan: 'in', fade: 'in', caption: 'Stromausfall. Nur die Röhren glimmen. Und zum ersten Mal sagt Dante nichts.', hold: 2200 }],
    },
    {
      id: 'szene-dante-nacht', title: 'Nicht jugendfrei für Hasen', gallery: false,
      beats: [
        { image: 'cut-rom-dante-werkstatt', pan: 'out', lines: [D('Captain Kuschel, raus. Ja, du auch. Der Rest der Nacht ist … nicht jugendfrei für Hasen. Oder Hunde. Was auch immer du bist.', 'verlegen')] },
        abblende('Die Röhren glimmen weiter. Irgendwo knistert eine Platte, die keiner mehr umdreht.'),
      ],
      effects: [{ sleep: true }, { dialogue: 'dante-morgen-danach' }],
    },
    {
      id: 'szene-dante-nacht-woche', title: 'Nur im Notfall', gallery: false,
      beats: [
        { image: 'black', fade: 'in', lines: [D('Notfall! Sicherung raus! Captain Kuschel, Faxgerät! Sofort!', 'verlegen')] },
        abblende('Klick. Die Werkstatt wird dunkel. Nur die Röhren nicht.'),
      ],
      effects: [{ sleep: true }, { dialogue: 'dante-morgen-woche' }],
    },
    {
      id: 'szene-rom-dante-date', title: 'Laut, schief und warm',
      beats: [{ image: 'cut-rom-dante-date', pan: 'in', fade: 'in', caption: 'Flutmauer. Ein Koffer-Plattenspieler, eine Tüte Kekse, ein Feuerlöscher. Und zwei Hände, die nicht loslassen.', hold: 2000 }],
    },
  ),
  phone: {
    ...DANTE_TEL_23,
    'tel-dante-kekse': {
      id: 'tel-dante-kekse', from: 'dante',
      text: 'KEKSALARM! Morgens oder abends, Werkstatt! Bring Hunger mit! Und Schuhe, der Boden ist heiß!',
      auto: { all: [{ hearts: 'dante', min: 2 }, KENNT, neu('he-dante-2')] },
    },
    'tel-dante-platte': {
      id: 'tel-dante-platte', from: 'dante',
      text: 'Hab eine Platte gefunden. DIE Platte. Komm heute Abend vorbei. Nicht donnerstags, da verlier ich beim Eins!. Um Himmels Willen, komm!',
      auto: { all: [{ hearts: 'dante', min: 4 }, neu('he-dante-4')] },
    },
    'tel-dante-sicherung': {
      id: 'tel-dante-sicherung', from: 'dante',
      text: 'Brauch tagsüber deine Hilfe in der Werkstatt. Sicherungskasten. Fass bloß nicht den linken Schrank an. Da ist nichts drin. Wirklich gar nichts.',
      auto: { all: [{ hearts: 'dante', min: 6 }, neu('he-dante-6')] },
    },
  },
};
