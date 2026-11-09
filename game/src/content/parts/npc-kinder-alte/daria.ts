// Daria (Straßenkind, Anführerin der drei): NpcDef, Tagesgespräche, Herz-Ereignisse he-daria-2…6 (world.md §4.4).
// Akt 2/3, Nachspiel, he-daria-8/10: daria-akt23.ts.
// Nur Freundschaft (child: true). Kein Begleiter. Persönliche Quests (pers-daria-botendienst, pers-kinder-wasserturm,
// side-eins-turnier) baut der Quest-Agent; hier wird nur darauf verwiesen bzw. gestartet.
import type { Condition, NpcDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import {
  GOSSE, KINDERZEIT, L, N, VEX, chk, dialogs, dlg, herz, node, zeitHinweis, zeitHinweisWann,
} from './_dsl';
import { DARIA_HE_23, DARIA_SCHEDULE_23, DARIA_TALK_FRUEH, DARIA_TALK_POOL } from './daria-akt23';

const D = 'daria';
const ALLE_SECHS: Condition = { all: [{ hearts: 'daria', min: 6 }, { hearts: 'freya', min: 6 }, { hearts: 'jakko', min: 6 }] };
const NICHT_ALLE_SECHS: Condition = { not: ALLE_SECHS };
const FEILSCHEN = chk('he-daria-2-feilschen', 'strasse', 4, ['feilschen', 'verhandeln']);

const npc: NpcDef = {
  id: D,
  name: 'Daria',
  unknownName: 'Mädchen mit Pappschild',
  portrait: 'daria',
  sprite: 'daria-walk',
  faction: 'unterstadt',
  child: true,
  bio: 'Anführerin der drei Straßenkinder. Ungeschlagene Eins!-Meisterin, verhandelt alles, plant ihren eigenen Botendienst.',
  gifts: {
    loves: ['kartendeck', 'stickerbogen', 'bao-dampfnudel'],
    likes: ['nougatbombe', 'murmelbeutel', 'neonkreide', 'comic-heft', 'echtobst-apfel', 'hofhonig'],
    dislikes: ['gesetzbuch', 'tai-chi-tee'],
    hates: ['virus-implantat', 'handschellen', 'rostige-dose'],
  },
  schedule: [
    ...DARIA_SCHEDULE_23,
    { slot: 'morgen', place: { map: 'das-nest', at: 'schlafnischen' } },
    { slot: 'tag', place: { map: 'schrottmarkt', at: 'botenstand' } },
    { slot: 'abend', days: ['do'], place: { map: 'dantes-werkstatt', at: 'eins-tisch' } },
    { slot: 'abend', when: KINDERZEIT, place: { map: 'neon-gasse', at: 'pfandflaschen-ecke' } },
    { slot: ['abend', 'nacht'], place: { map: 'das-nest', at: 'schlafnischen' } },
  ],
  heartEvents: [
    { id: 'he-daria-2', hearts: 2, map: 'schrottmarkt', time: 'tag', dialogue: 'dlg-he-daria-2', effects: [{ xp: 25 }] },
    {
      id: 'he-daria-4', hearts: 4, map: 'dantes-werkstatt', time: 'abend', when: { weekday: 'do' },
      dialogue: 'dlg-he-daria-4', effects: [{ xp: 35 }],
    },
    { id: 'he-daria-6', hearts: 6, map: 'das-nest', time: 'morgen', dialogue: 'dlg-he-daria-6', effects: [{ xp: 45 }] },
    ...DARIA_HE_23,
    // Rivalität kindgerecht: ein Streich (world.md §4.4); Versöhnung über das Tagesgespräch (drei Dampfnudeln).
    { id: 're-daria-2', hearts: -2, map: 'schrottmarkt', time: 'tag', dialogue: 'dlg-re-daria-2' },
  ],
  talk: [
    { dialogue: 'daria-schweigen', when: { rival: D } },
    { dialogue: 'daria-zeit', minHearts: 8, when: zeitHinweisWann('daria-zeit') },
    ...DARIA_TALK_FRUEH,
    { dialogue: 'daria-zehn-credits', when: { quest: 'side-zehn-credits', state: 'active' } },
    { dialogue: 'daria-morgen', when: { time: 'morgen' } },
    { dialogue: 'daria-eins-dante', when: { all: [{ time: 'abend' }, { weekday: 'do' }] } },
    { dialogue: 'daria-pfand', when: { time: 'abend' } },
    { dialogue: 'daria-sonntag', when: { weekday: 'so' } },
    ...DARIA_TALK_POOL,
    { dialogue: 'daria-tag-6', minHearts: 6 },
    { dialogue: 'daria-tag-2', minHearts: 2 },
    { dialogue: 'daria-tag-0' },
  ],
};

const dialogues = dialogs(
  // ------------------------------------------------------------------------------------------- Tagesgespräche
  dlg('daria-tag-0', [
    node('a', [
      N('Daria sitzt hinter einer umgedrehten Obstkiste. Pappschild: „DARIA & CO. – SCHNELL, BILLIG, MEISTENS EHRLICH“.'),
      L(D, 'Paket? Brief? Rache? Wir liefern alles unter fünf Kilo. Über fünf Kilo liefert Jakko, der braucht dann aber Pause.', 'signatur'),
    ], {
      choices: [
        { text: '„Was kostet ein Brief?“', next: 'preis' },
        { text: '[Gosse] „Daria. Wir kennen uns. Rohrleiter, Suppenküche, der Winter mit dem Eis.“', tag: '[Gosse]', when: GOSSE, next: 'gosse', once: true, id: 'gosse' },
        { text: '[Vex] „Konkurrenz, hm? Ich bin Kurierin.“', when: VEX, next: 'vex' },
        { text: '„Nur gucken.“' },
      ],
    }),
    node('preis', [
      L(D, 'Fünf Credits. Für dich sieben. Du siehst aus wie jemand, der Trinkgeld gibt.'),
      L(D, 'Ich verhandle nicht. Doch, ich verhandle. Aber nicht heute. Doch, heute auch. Mach ein Angebot!', 'freude'),
    ]),
    node('gosse', [
      L(D, '…Du bist das? Echt? Du hast mir mal deine Mütze geliehen. Ich hab sie noch. Die kriegst du nicht wieder.', 'ueberrascht'),
      L(D, 'Okay. Für dich Stammkundenpreis. Der ist genau wie der normale Preis, aber ich lächle dabei.', 'freude'),
    ], { effects: [herz(D, 20)] }),
    node('vex', [
      L(D, 'Du fährst die großen Pakete. Wir laufen die kleinen. Wir sind wie Ratten, du bist wie ein Laster. Beide nützlich.'),
      L(D, 'Und wenn du mal eine Lieferung versaust, sag Bescheid. Wir übernehmen. Gegen Aufpreis. Und Schadenfreude gratis.', 'signatur'),
    ]),
  ]),

  dlg('daria-tag-2', [
    node('a', [
      L(D, 'Da ist ja meine Lieblingskundschaft. Also, Nummer zwei. Nummer eins ist Babette, die zahlt in Dampfnudeln.', 'freude'),
      L(D, 'Heute schon drei Lieferungen. Eine davon war ein Liebesbrief an Wachtmeisterin Kessel. Absender geheim. Absender war Dexter.'),
    ], {
      choices: [
        { text: '„Dexter? Und Kessel? Das wird blutig.“', next: 'dexter' },
        { text: '„Läuft das Geschäft?“', next: 'geschaeft' },
        { text: '„Bis später, Chefin.“', effects: [herz(D, 5)] },
      ],
    }),
    node('dexter', [
      L(D, 'Nee. Sie hat ihn auf ihre Strichliste gesetzt. Unter „Belästigung, harmlos“. Er war total stolz.'),
    ]),
    node('geschaeft', [
      L(D, 'Läuft wie eine Ratte mit Raketenantrieb. Freya macht die Bücher, Jakko isst die Gewinne.', 'signatur'),
      L(D, 'Wenn wir genug haben, kaufen wir ein Dreirad. Mit Kiste hinten. Dann sind wir offiziell ein Fuhrpark.'),
    ]),
  ]),

  dlg('daria-tag-6', [
    node('a', [
      L(D, 'He. Du. Komm her, ich hab was für dich.', 'freude'),
      N('Sie drückt dir einen zerknickten Zettel in die Hand. Darauf: eine Strichliste mit der Überschrift „LEUTE, DIE OK SIND“. Drei Namen. Babette, Captain Kuschel und deiner.'),
    ], {
      choices: [
        { text: '„Nur drei? Und einer davon ist ein Plüschhase?“', next: 'hase' },
        { text: '„Ich fühl mich geehrt, Chefin.“', next: 'ehre' },
      ],
    }),
    node('hase', [
      L(D, 'Captain Kuschel hat noch nie gelogen. Kann er nicht, er hat keinen Mund. Das ist die höchste Form von Ehrlichkeit.', 'signatur'),
      L(D, 'Hunter steht auf der Warteliste. Er muss erst aufhören, mich „Kleine“ zu nennen.'),
    ]),
    node('ehre', [
      L(D, 'Solltest du auch. Die Liste ist schwerer reinzukommen als ins High Voltage. Bruno lässt jeden rein, der zwanzig Credits hat. Ich nicht.', 'freude'),
      L(D, 'Und jetzt geh, du hältst die Kundschaft auf. Da steht keine, aber die könnte kommen.'),
    ]),
  ]),

  dlg('daria-morgen', [
    node('a', [
      N('Daria liegt quer in ihrer Schlafnische, eine Decke bis zur Nase, ein Kartendeck unterm Kopfkissen.'),
      L(D, 'Es ist zu früh für Kundschaft. Es ist zu früh für alles. Ich bin erst ab zehn geschäftsfähig.', 'besorgt'),
    ], {
      choices: [
        { text: '„Ich hab Frühstück dabei.“', when: { any: [{ item: 'bao-dampfnudel' }, { item: 'nougatbombe' }] }, next: 'fruehstueck' },
        { text: '„Schlaf weiter, Chefin.“', next: 'schlaf' },
      ],
    }),
    node('fruehstueck', [
      L(D, '…Okay, ich bin jetzt doch geschäftsfähig. Leg’s auf die Kiste. Nein, nicht da, da sitzt Jakko gleich drauf.', 'freude'),
      N('(Wenn du es ihr wirklich gibst, nutz das Geschenk-Menü. Daria nimmt keine Versprechen an, nur Ware.)'),
    ]),
    node('schlaf', [
      L(D, 'Mach ich. Und wenn Freya fragt: Ich hab schon längst gearbeitet. Im Traum. Sehr hart.'),
    ]),
  ]),

  dlg('daria-pfand', [
    node('a', [
      N('In der Ecke hinter den Mülltonnen klappern Flaschen. Daria sortiert sie nach Farbe, Pfandwert und „Eklig“.'),
      L(D, 'Pfandflaschen sind das ehrlichste Geschäft der Stadt. Die Flasche lügt nicht. Die Flasche ist leer und will zurück.', 'signatur'),
    ], {
      choices: [
        { text: '(Eine Flasche aus der Tonne fischen und ihr geben.)', effects: [herz(D, 5)], next: 'flasche' },
        { text: '„Um acht bist du im Nest, ja?“', next: 'acht' },
        { text: '„Bis dann.“' },
      ],
    }),
    node('flasche', [
      L(D, 'Die ist von der Quantum-Feier. Auf denen ist kein Pfand. Die sind zu reich für Pfand. …Ich nehm sie trotzdem. Als Trophäe.'),
    ]),
    node('acht', [
      L(D, 'Jaha. Um acht ist die Gasse nicht mehr für Kinder. Um acht kommen die Leute mit den Glitzerjacken und den schlechten Ideen.', 'besorgt'),
      L(D, 'Babette guckt sowieso, ob wir da sind. Die zählt uns wie Dampfnudeln.'),
    ]),
  ]),

  dlg('daria-eins-dante', [
    node('a', [
      N('Eins!-Abend bei Dante. Daria hat sich auf zwei Kissen gesetzt, damit sie über den Tisch gucken kann, und fächert ihre Karten wie eine Pokerspielerin aus einem alten Film.'),
      L(D, 'Setz dich. Ich zieh dich ab. Nimm’s nicht persönlich, nimm’s als Lehrgeld.', 'signatur'),
      L('dante', 'Sie hat mich gestern viermal hintereinander „Vier ziehen“ lassen. Ich hab jetzt eine Allergie gegen die Zahl Vier.'),
    ], {
      choices: [
        {
          text: '(Eine Runde Eins! spielen.)',
          effects: [{
            minigame: 'akt-eins', level: 2, key: 'eins-daria', label: 'Eins! gegen Daria',
            win: [herz(D, 10), { message: 'Daria: „Glück. Pures Glück. … Revanche nächsten Sonntag!“' }],
            lose: [herz(D, 10), { message: 'Daria: „Nicht traurig sein. Gegen mich verlieren ist keine Schande. Gegen Dante verlieren, DAS ist eine Schande.“' }],
          }],
        },
        { text: '„Ich guck nur zu.“', next: 'zugucken' },
      ],
    }),
    node('zugucken', [
      L(D, 'Feigling. Aber ein schlauer Feigling. Die leben länger.'),
    ]),
  ]),

  dlg('daria-sonntag', [
    node('a', [
      L(D, 'Sonntag! Flohmarkt, Turniertag, Abrechnungstag. Ich hab heute schon zwei Leute über den Tisch gezogen. Einer davon war ein Tisch.', 'freude'),
    ], {
      choices: [
        { text: '„Was für ein Turnier?“', when: { quest: 'side-eins-turnier', state: 'inactive' }, next: 'turnier' },
        { text: '„Wie läuft das Turnier?“', when: { quest: 'side-eins-turnier', state: ['active', 'done'] }, next: 'laeuft' },
        { text: '„Revanche?“', next: 'revanche' },
      ],
    }),
    node('turnier', [
      L(D, 'Das Eins!-Turnier! Drei Runden, dann das Finale. Gegen mich. Weil ich immer im Finale bin. Das ist Tradition. Seit drei Wochen.', 'signatur'),
      L(D, 'Meld dich an. Startgeld: deine Würde.'),
    ], {
      choices: [
        { text: '„Ich bin dabei.“', effects: [{ startQuest: 'side-eins-turnier' }], next: 'dabei' },
        { text: '„Ich behalt meine Würde lieber.“' },
      ],
    }),
    node('dabei', [L(D, 'Super. Ich hab schon einen Platz für dein Bild an der Verliererwand frei gemacht.', 'freude')]),
    node('laeuft', [L(D, 'Läuft. Dante hat nach der zweiten Runde in eine Tüte geatmet. Das war das Spannendste seit der Rattenplage.')]),
    node('revanche', [L(D, 'Revanche nächsten Sonntag! …Moment, heute IST Sonntag. Dann Revanche jetzt. Oder nächsten. Ich entscheide spontan.', 'signatur')]),
  ]),

  dlg('daria-zehn-credits', [
    node('a', [
      L(D, 'Zehn Credits für drei Leute. Das ist kein Lohn, das ist eine Beleidigung mit Kleingeld.', 'wut'),
      L(D, 'Wir wollen nicht betteln. Wir wollen arbeiten. Ich bin gut im Arbeiten. Ich bin gut in allem, außer im Stillsitzen.'),
    ], {
      choices: [
        { text: '„Ich red mit Oma Volt. Die braucht Boten.“', next: 'oma' },
        { text: '„Ich lass mir was einfallen.“' },
      ],
    }),
    node('oma', [L(D, 'Oma Volt? Die ist streng. Die zählt nach. …Okay, das ist eigentlich gut. Wer nachzählt, zahlt auch.', 'besorgt')]),
  ]),

  dlg('daria-schweigen', [
    node('a', [
      N('Daria dreht dir den Rücken zu. Auf ihrem Rücken klebt ein Zettel: „NICHT MIT {name} REDEN“.'),
      L(D, 'Hörst du was? Ich hör nix. Nur so ein Rauschen. Wie von Leuten, die Versprechen brechen.', 'wut'),
    ], {
      choices: [
        {
          text: '„Drei Dampfnudeln. Eine für jeden von euch. Frieden?“',
          requires: { item: 'bao-dampfnudel', min: 3 },
          effects: [{ take: 'bao-dampfnudel', qty: 3 }, { reconcile: D }, herz('freya', 10), herz('jakko', 10)],
          next: 'frieden',
        },
        { text: '„Ich hab’s verbockt. Tut mir leid.“', next: 'sorry' },
        { text: '(Gehen.)' },
      ],
    }),
    node('sorry', [L(D, 'Tut-mir-leid kann man nicht essen. Drei Dampfnudeln. Dann reden wir. Vielleicht.')]),
    node('frieden', [
      N('Daria dreht sich langsam um, guckt auf die Dampfnudeln, guckt dich an, guckt wieder auf die Dampfnudeln.'),
      L(D, 'Frieden. Aber nur, weil Jakko sonst weint. Und den Zettel behalte ich. Für schlechte Zeiten.', 'freude'),
    ]),
  ]),

  zeitHinweis('daria-zeit', [
    L(D, 'Weißt du, was komisch ist? Ich hab keine Angst mehr, dass du abhaust. Das ist neu. Das muss ich erst mal kalkulieren.', 'besorgt'),
  ]),

  // ------------------------------------------------------------------------------------------- Herz-Ereignisse
  dlg('dlg-he-daria-2', [
    node('a', [
      N('Am Botenstand winkt Daria dich heran. Vor ihr liegt ein Pappdeckel, eng beschrieben, mit einem Kaugummi als Siegel. Freya sitzt daneben und spitzt einen Bleistift mit einem Küchenmesser.'),
      L(D, 'Da bist du ja. Setz dich. Nicht auf die Kiste, die Kiste ist das Büro.', 'signatur'),
      L(D, 'Ich mach’s kurz, Zeit ist Geld und du hast von beidem zu wenig: Botendienst. Wir drei, die ganze Unterstadt. Pakete, Briefe, Geschenke, Drohungen.'),
      L(D, 'Du bist unser erster Großkunde. Großkunde heißt: Du unterschreibst, du zahlst, du erzählst es rum. Steht alles hier.'),
    ], {
      choices: [
        { text: '„Lies mir erst das Kleingedruckte vor.“', next: 'klein', once: true, id: 'klein' },
        { text: '„Gib her, ich unterschreib.“', next: 'unterschrift' },
        {
          text: '„Fünfzig Prozent Provision? Kind, so dreist zockt nicht mal Ripper ab.“',
          check: FEILSCHEN,
          next: 'verhandelt',
        },
        { text: '„Kaugummi als Siegel. Hab ich früher auch so gemacht. Hat nie gehalten.“', tag: '[Gosse]', when: GOSSE, next: 'gosse' },
        { text: '„Ich bin Kurierin, Daria. Du machst mir Konkurrenz.“', tag: '[Vex]', when: VEX, next: 'vex' },
        { text: '„Ich unterschreib nichts, was klebt.“', next: 'absage' },
      ],
    }),
    node('klein', [
      L(D, 'Paragraf eins: Daria hat immer recht. Paragraf zwei: Wenn Daria nicht recht hat, gilt Paragraf eins.'),
      L('freya', 'Einspruch! Paragraf eins ist sittenwidrig. Ich hab das Wort nachgeschlagen.', 'signatur'),
      L(D, 'Freya hat den Vertrag geschrieben. Ich hab nur die guten Stellen reingeschmuggelt.'),
      L(D, 'Paragraf drei: Wer nicht zahlt, kriegt Jakko vor die Tür. Jakko isst dann deinen Kühlschrank leer. Mit Kühlschrank.'),
    ], { next: 'a' }),
    node('verhandelt', [
      L(D, '…Wer hat dir das beigebracht? Freya? FREYA!', 'wut'),
      L('freya', 'Ich bin neutral. Ich bin die Justiz. Die Justiz hat nur zufällig genickt.'),
      L(D, 'Na gut. Zwanzig Prozent. Und du sagst keinem, dass ich nachgegeben hab. Ich hab einen Ruf. Der ist hart erarbeitet und klebt.', 'freude'),
    ], { effects: [herz(D, 40), { setFlag: 'daria_vertrag' }, { setFlag: 'daria_vertrag_fair' }], next: 'ende' }),
    node('gosse', [
      L(D, 'Moment. Du bist … von der Rohrleiter! Du hast im Winter die Suppe für die Kleinen geklaut! Für mich auch!', 'ueberrascht'),
      L(D, 'Mann. Und jetzt guck dich an. Fast seriös. Fast.'),
    ], { effects: [herz(D, 30)], next: 'unterschrift' }),
    node('vex', [
      L(D, 'Konkurrenz? Du bist eine Person. Wir sind drei. Und Jakko zählt doppelt, so viel wie der frisst.'),
      L(D, 'Aber weißt du was? Du machst die großen Pakete, wir die kleinen. Kartell nennt man das.', 'signatur'),
      L('freya', 'Ich hab „Kooperation“ nachgeschlagen. „Kartell“ hast du gesagt. Das ist ein Unterschied von ungefähr zehn Jahren Haft.'),
    ], {
      choices: [
        { text: '„Kartell klingt gut. Wo unterschreib ich?“', next: 'unterschrift' },
        {
          text: '„Kartell heißt aber: Ich krieg Prozente. Zehn. Auf alles.“',
          check: FEILSCHEN,
          next: 'verhandelt',
        },
      ],
    }),
    node('unterschrift', [
      N('Du kritzelst deinen Namen neben den Kaugummi. Daria pustet drauf, als wäre es frische Tinte.'),
      L(D, 'Glückwunsch. Du bist jetzt Kundschaft Nummer eins. Die erste Lieferung geht aufs Haus. Die zweite nicht. Die dritte erst recht nicht.', 'freude'),
    ], { effects: [herz(D, 20), herz('freya', 10), { setFlag: 'daria_vertrag' }], next: 'ende' }),
    node('absage', [
      L(D, 'Der klebt nicht. Ist nur … Kaugummi.', 'trauer'),
      N('Einen Moment sieht sie aus wie das, was sie ist: ein Kind hinter einer Obstkiste. Dann reckt sie das Kinn.'),
      L(D, 'Dann eben ohne Papier. Handschlag. Aber ein richtiger, kein labbriger Oberstadt-Handschlag.'),
    ], { effects: [herz(D, 10), { setFlag: 'daria_vertrag' }], next: 'ende' }),
    node('ende', [
      L(D, 'So. Wenn du jemandem was schicken willst – Geschenk, Liebesbrief, Drohung –, kommst du zu uns. Wir finden jeden.', 'signatur'),
      L(D, 'Fast jeden. Hunter nicht. Hunter findet uns.'),
    ], { next: 'quest' }),
    // Eigener Knoten, damit ein fehlender Quest-Eintrag die Herz-Effekte oben nicht verschluckt.
    node('quest', [N('Darias Botendienst ist eröffnet. Drei Testlieferungen, dann können Geschenke per Kinderkurier reisen.')], {
      effects: [{ startQuest: 'pers-daria-botendienst' }],
    }),
  ]),

  dlg('dlg-he-daria-4', [
    node('a', [
      N('Donnerstag, Eins!-Abend. Dantes Werkstatt riecht nach Lötzinn und Keksen. Um den Tisch: Daria, Freya, Jakko, Dante – und ein Mann im Glitzerjackett, der beim Mischen pfeift. Wett-Willi. Ausgerechnet.'),
      L('dante', 'Willi wollte „nur mal zugucken“. Seit einer Stunde gewinnt er. Ich verliere. Ich verliere immer, aber heute verliere ich anders. Persönlicher.'),
      L(D, 'Der hat schon dreimal „Plus Vier“ gelegt. Es gibt nur vier im Deck. Und eine hab ICH.', 'wut'),
      L('wett-willi', 'Glück, Kleine. Pures Glück. Manche haben’s, manche sitzen auf Kisten.'),
    ], {
      choices: [
        {
          text: '„Willi, dein Ärmel raschelt, wenn du atmest.“',
          check: chk('he-daria-4-schummler', 'strasse', 6, ['beobachten', 'bluff']),
          next: 'entlarvt',
        },
        {
          text: '(Willi beim Mischen blitzschnell am Handgelenk packen.)',
          check: chk('he-daria-4-griff', 'reflexe', 5, ['taschendiebstahl']),
          next: 'griff',
        },
        { text: '(Daria zuflüstern: „Zähl mal mit, was er ablegt.“)', next: 'zaehlen' },
        { text: '„Lass gut sein. Ist doch nur ein Spiel.“', next: 'wegsehen' },
      ],
    }),
    node('griff', [
      N('Du packst zu, bevor er die nächste Karte ziehen kann. Willi quiekt wie ein Wasserkessel. Aus seinem Ärmel segeln fünf Karten auf den Tisch.'),
    ], { effects: [herz(D, 50)], next: 'urteil' }),
    node('entlarvt', [
      N('Willi erstarrt. Dann raschelt es. Fünf Karten rutschen aus seinem Ärmel auf den Tisch, alles „Plus Vier“. Eine davon hat noch ein Preisschild.'),
    ], { effects: [herz(D, 60)], next: 'urteil' }),
    node('zaehlen', [
      N('Daria kneift die Augen zusammen. Ihre Lippen bewegen sich. Zwei Runden lang sagt sie gar nichts, was bei Daria ungefähr so selten ist wie Sonnenschein im Smog.'),
      L(D, 'Siebzehn rote Karten abgelegt. Im Deck sind zwölf. Willi. Zeig. Deine. Ärmel.', 'signatur'),
      N('Willi zeigt seine Ärmel nicht. Jakko zeigt sie für ihn. Fünf Karten fallen raus.'),
    ], { effects: [herz(D, 50), herz('jakko', 10)], next: 'urteil' }),
    node('wegsehen', [
      L(D, 'Nur ein Spiel. Klar. Für dich.', 'trauer'),
      N('Sie spielt weiter, aber sie lacht nicht mehr. Willi gewinnt den Topf: drei Kekse und einen Knopf. Freya schreibt etwas in ihr Notizbuch und unterstreicht es zweimal.'),
    ], {
      effects: [herz(D, 5)],
      choices: [
        { text: '„…Nee. Warte. Willi, Ärmel hoch.“', next: 'zaehlen' },
        { text: '(Schweigen.)' },
      ],
    }),
    node('urteil', [
      L('freya', 'Einspruch! Und Urteil: schuldig! Strafe: Er zahlt jedem hier eine Dampfnudel. Und Dante zwei, wegen seelischer Grausamkeit.', 'signatur'),
      L('wett-willi', 'Das … das sind Glücksbringer! Die gehören zu meiner Religion!'),
      L('jakko', 'Fünf Dampfnudeln! Das ist wie ein ganzer Sonntag!', 'freude'),
      L(D, 'Du hast ihn gesehen. Den hat noch keiner erwischt. Nicht mal ich, und ich seh alles.', 'freude'),
      L(D, 'Ab heute bist du an diesem Tisch Ehrenmischer. Heißt: Du darfst mischen. Sonst darf hier keiner mischen. Nicht mal Dante.'),
      L('dante', 'Ich hab nie gemischt. Ich hab gebetet.'),
    ], {
      effects: [{ setFlag: 'daria_ehrenmischer' }, herz('freya', 20), herz('jakko', 20), herz('dante', 10)],
      choices: [
        {
          text: '(Eine ehrliche Runde Eins! spielen.)',
          effects: [{
            minigame: 'akt-eins', level: 2, key: 'eins-daria', label: 'Eins! – ehrliche Runde',
            win: [herz(D, 10), { message: 'Daria: „Glück. Pures Glück. … Revanche nächsten Sonntag!“' }],
            lose: [herz(D, 10), { message: 'Daria: „Siehste. Ohne Schummeln gewinn ich trotzdem. Das ist Talent.“' }],
          }],
        },
        { text: '„Revanche nächsten Sonntag, Chefin.“', next: 'revanche' },
      ],
    }),
    node('revanche', [L(D, 'Das ist MEIN Spruch. Den hab ich mir schützen lassen. Bei Freya.', 'signatur')]),
  ]),

  dlg('dlg-he-daria-6', [
    node('a', [
      N('Morgens im Nest. Es regnet durchs Dach. Nicht viel, nur genau da, wo es wehtut: auf die große Karte an der Wand. Daria steht davor, in der einen Hand einen Eimer, in der anderen einen Filzstift.'),
      L(D, 'Nicht gucken. Die ist noch nicht fertig.', 'besorgt'),
      N('Die Karte ist aus zusammengeklebten Flyern: die ganze Unterstadt in Darias Handschrift. Rote Kreuze: „Hier jagen sie uns weg.“ Grüne Punkte: „Hier gibt’s Reste.“ Ein Herz über Babettes Garküche. Ein Totenkopf über Rippers Praxis.'),
      N('Und über dem High Voltage ein kleiner Stern. Daneben, mit Bleistift: „{name}?“'),
      L(D, 'Jede Ecke, wo wir mal gepennt haben. Jede, wo’s sicher war. Wenn mir was passiert, wissen die zwei, wo sie hinmüssen.'),
    ], {
      choices: [
        { text: '„Dir passiert nichts.“', next: 'versprechen' },
        { text: '„Warum steht bei mir ein Fragezeichen?“', next: 'fragezeichen' },
        {
          text: '(Das Leck mit Plane und Kabelbindern flicken.)',
          check: chk('he-daria-6-flicken', 'technik', 4, ['reparieren', 'welt']),
          next: 'flicken',
        },
        { text: '(Ihr den Eimer abnehmen und unters Leck halten.)', next: 'eimer' },
      ],
    }),
    node('fragezeichen', [
      L(D, 'Weil ich noch nicht weiß, ob du sicher bist. Leute kommen, Leute gehen. Meistens gehen sie.', 'besorgt'),
    ], {
      choices: [
        { text: '„Mach das Fragezeichen weg. Ich bleib.“', next: 'stern' },
        { text: '„Fair. Lass es noch ’ne Weile stehen.“', effects: [herz(D, 20)], next: 'dach' },
      ],
    }),
    node('versprechen', [
      L(D, 'Das sagen alle. Die Frau vom Lastwagen hat’s gesagt. Der Mann mit der Decke hat’s gesagt. Dann kam die Quantum-Streife, und alle waren weg.', 'wut'),
      L(D, 'Ich bin die Älteste. Ich darf nicht glauben, was Erwachsene sagen. Das ist Paragraf null. Den hat nicht mal Freya.', 'trauer'),
    ], {
      choices: [
        { text: '„Dann glaub mir nicht. Guck einfach zu.“', next: 'stern' },
        { text: '„Okay. Dann beweis ich’s halt.“', effects: [herz(D, 20)], next: 'dach' },
      ],
    }),
    node('stern', [
      N('Sie zögert. Dann radiert sie das Fragezeichen weg, so fest, dass das Papier dünn wird, und malt ein Ausrufezeichen hin. Dann noch eins.'),
      L(D, 'Zwei. Weil eins aussieht wie ein Zufall.', 'freude'),
    ], { effects: [herz(D, 50), { setFlag: 'daria_karte_stern' }], next: 'dach' }),
    node('flicken', [
      N('Plane, drei Kabelbinder und ein Kaugummi aus Darias Vertragsbestand. Das Tropfen hört auf. Für heute.'),
      L(D, 'Du kannst ja was. Außer reden.', 'ueberrascht'),
    ], { effects: [herz(D, 40), { setFlag: 'nest_dach_notdicht' }], next: 'dach' }),
    node('eimer', [
      N('Du hältst den Eimer. Er ist schon halb voll. Daria guckt dich an, als hättest du ihr gerade ein Haus geschenkt. Mit Dach.'),
    ], { effects: [herz(D, 30)], next: 'dach' }),
    node('dach', [
      L(D, 'Das Dach ist hin. Richtig hin. Gustav sagt, mit Blech und Teer und jemandem, der was kann, kriegt man das dicht. Kostet aber.'),
      L(D, 'Freya hat schon gerechnet. Jakko hat schon Hunger. Und ich hab … keine Ahnung. Ich hab nie keine Ahnung. Das ist scheiße.', 'besorgt'),
      L('freya', '(aus der Nachbarnische, verschlafen) Das macht einen Keks, Daria.'),
    ], {
      choices: [
        { text: '„Wir machen das Dach dicht. Wir alle zusammen.“', when: ALLE_SECHS, next: 'quest' },
        { text: '„Wir machen das Dach dicht. Sobald Freya und Jakko mir auch trauen.“', when: NICHT_ALLE_SECHS, next: 'warten' },
      ],
    }),
    node('warten', [
      L(D, 'Dann musst du dich bei den zweien noch einschleimen. Viel Glück. Freya nimmt keine Bestechung. Außer Kekse. Und Jakko nimmt alles.', 'signatur'),
    ], { effects: [{ setFlag: 'kinder_dach_versprochen' }], next: 'schluss' }),
    node('quest', [
      L(D, 'Abgemacht. Und wenn du’s versaust, kommst du mit rotem Kreuz auf die Karte. Mit dickem.', 'freude'),
    ], { effects: [{ setFlag: 'kinder_dach_versprochen' }, { startQuest: 'pers-kinder-wasserturm' }], next: 'schluss' }),
    node('schluss', [
      N('Daria malt einen grünen Punkt über das Nest. Daneben, ganz klein: „Zuhause.“'),
    ]),
  ]),

  // he-daria-8 und he-daria-10: daria-akt23.ts

  dlg('dlg-re-daria-2', [
    node('a', [
      N('Du trittst auf etwas Klebriges. Es ist ein Kaugummi. Es ist an deinem Schuh. Daneben ein Zettel in Darias Schrift: „DAS WAR KEIN UNFALL.“'),
      N('Hinter dem Botenstand kichert es. Dann ist es still. Sehr demonstrativ still.'),
    ]),
  ]),
);

export const part: ContentPart = {
  npcs: { [D]: npc },
  dialogues,
};
