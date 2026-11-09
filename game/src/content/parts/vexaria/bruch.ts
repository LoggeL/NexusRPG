// Vex × Aria „Weglaufen, Umdrehen“ (world.md §4.7, Stationen 7–8) plus Akt-1-Brücke.
//
// Im Kanon liegt der Bruch in Akt 2 (rom-aria-ausfall → rom-aria-streit → rom-aria-vega → rom-aria-regen, Zerberster-
// Sperre). Damit der Strang schon im Akt-1-Stand komplett spielbar ist (Nutzerwunsch), gibt es einen Akt-1-Weg:
//   rom-vexaria-ripperdeal (Rippers Paket, Vex rennt allein bzw. dreht sich nicht um)
//   → rom-vexaria-streit (Kurzfassung von rom-aria-streit, Weg `alleingang`)
//   → Station 7 Funkstille (dieselbe Nacht) → Vegas Anruf (statt rom-aria-vega)
//   → Station 8 Umdrehen, deren Schluss unter dem Vordach die Vex-Fassung von rom-aria-regen enthält (Versöhnung).
// In Akt 2 übernimmt der Kanonweg (Stationen 7/8 hören dann auf rom-aria-streit/rom-aria-vega). Siehe gaps/vexaria.md.
import type { ContentPart } from '../../part';
import type { Condition, DialogueDef, HeartEventDef, PhoneMessageDef } from '../../../modules/contracts';
import {
  a, AKT1, all, any, BRUECKE, byId, ch, chk, cut, dlg, flag, herz, HEUTE_FREI, msg, n, node, noFlag, not, R, ROM_AN, s, seen,
  set, STATION_START, STREIT, twin, V, v,
} from './_util';

const kanal = (who: string, text: string) => n(`${who}: „${text}“`);
const KAS = (text: string) => n(`KANAL 9 · Kas' Stimme, knisternd: „${text}“`);

// ---------------------------------------------------------------------------
// Brücke 1 · rom-vexaria-ripperdeal · „Drei Raten“ (Akt-1-Weg)

const ripperdeal: DialogueDef = dlg('rom-vexaria-ripperdeal', [
  node('start', [
    n('Ripper winkt dich mit zwei Fingern an seinen Ecktisch. Es ist nicht Montag. Das ist nie gut.'),
    s('ripper', 'Setz dich, Schätzchen. Ich hab ein Paket, das keiner anfassen will. Also deins.', 'signatur'),
    s('ripper', 'Rostzähne-Lager an der Hafenkante, heute Nacht. Die Rostzähne haben was von mir, und ich will\'s zurück, bevor sie merken, dass es fehlt.'),
    s('ripper', 'Dafür streich ich dir drei Raten. Drei Montage, an denen du mein hübsches Gesicht nicht sehen musst.'),
    v('Drei Raten.'),
    n('Einunddreißig Montage. Achtundzwanzig wären immer noch viele. Aber weniger. Ein Arm, der dir ein bisschen mehr gehört.'),
    s('ripper', 'Allein, versteht sich. Die Rostzähne mögen keine Brecherinnen. Und die Brecherin mag keine Rostzähne. Das gibt nur Sauerei auf meinem Paket.'),
    n('Drüben am Tisch bei Vega lacht Aria über irgendwas. Laut, den Kopf in den Nacken, ein Zopf im Bierglas. Sie sieht nicht her.'),
  ], {
    effects: STATION_START,
    choices: [
      ch('„Allein. Ich bin schneller.“', 'allein'),
      ch('„Ich nehm Aria mit. Oder du kannst dein Paket selber holen.“', 'mit'),
    ],
  }),
  node('allein', [
    s('ripper', 'Das ist meine Kurierin. Mitternacht, Schätzchen. Sei pünktlich. Du bist ja immer pünktlich.', 'freude'),
    n('Mitternacht. Übers Dach, wie immer. Kein Funk, keine Crew. Allein ist schneller. Das hat Kas immer gesagt.'),
    n('Das Lager ist ein Containerturm mit Stacheldraht und drei Rostzähnen, die Rohrzangen wie Spazierstöcke tragen. Du bist drin, bevor einer gähnt. Das Paket ist klein und schwerer, als es sein dürfte.'),
  ], {
    choices: [
      ch('Ungesehen raus. Über die Containerkante.', 'allein-sauber', { check: chk('vexaria-ripperdeal-reflexe', 'reflexe', 6, ['schleichen', 'dach']) }),
      ch('Einfach rennen. Durch.', 'allein-dreckig'),
    ],
  }),
  node('allein-sauber', [
    n('Raus, ohne dass einer es merkt. Fast. Auf dem Rückweg, drei Dächer vor der Neon-Gasse, gibt eine Dachrinne nach. Du fängst dich mit dem Ratenarm an einer Mauer ab. Der Ellbogen kreischt. Etwas darin bricht.'),
  ], { next: 'allein-ende' }),
  node('allein-dreckig', [
    n('Einer sieht dich. Dann alle. Eine Rohrzange erwischt dich an der Augenbraue, eine zweite am Ellbogen des Ratenarms. Du rennst trotzdem. Du rennst immer.'),
  ], { next: 'allein-ende' }),
  node('allein-ende', [
    n('Um halb zwei liegt das Paket auf Rippers Tisch. Dein Arm zischt wieder, schlimmer als je zuvor, und über deinem Auge klebt getrocknetes Blut.'),
    s('ripper', 'Drei Raten, gestrichen. Und, Schätzchen: Lass den Ellbogen nachsehen. Der gehört noch mir.', 'signatur'),
  ], { effects: [set('vexaria_deal_allein'), set('vexaria_raten_gestrichen'), { damage: 10 }, { advanceTime: 150 }] }),
  node('mit', [
    s('ripper', 'Dann ist der Deal halb so viel wert. Anderthalb Raten. Wenn sie mir was kaputtmacht, null.', 'wut'),
    n('Du gehst rüber zu Vegas Tisch. Aria sieht hoch, den Zopf noch im Bier.'),
    v('Job. Heute Nacht. Rostzähne.'),
    a('Ein Job? Mit dir? Nachts? Auf Dächern?', 'ueberrascht'),
    a('Ich hol meinen Schläger.', 'freude'),
    n('Mitternacht. Ihr lauft zusammen. Sie ist laut, du bist leise, und zum ersten Mal seit Jahren hörst du hinter dir Schritte, die dir folgen, statt dich zu jagen. Es ist ungewohnt. Es ist schön.'),
    n('Das Lager. Drei Rostzähne. Du bist drin, schnappst das Paket, Aria deckt dir den Rücken. Dann geht alles schief. Ein Scheinwerfer. Ein Schrei. Du rennst. Du rennst, weil man rennt, wenn das Licht angeht.'),
    n('Hinter dir knackt es.'),
    n('Du kennst dieses Geräusch. Du kennst es von einem anderen Dach.'),
  ], {
    choices: [
      ch('Umdrehen.', 'mit-weiter', { tag: '[Kann nicht]', requires: { flag: 'vexaria_umgedreht' } }),
      ch('Weiterrennen. Nie umdrehen.', 'mit-weiter'),
    ],
  }),
  node('mit-weiter', [
    n('Du drehst dich nicht um. Deine Beine laufen einfach. Hinter dir hörst du, wie Aria deinen Namen schreit. Deinen echten Namen. Dann das Krachen von Metall auf Metall und einen sehr langen, sehr wütenden Fluch.'),
    n('Du bist zuerst am Treffpunkt. Natürlich. Du bist immer zuerst da.'),
    n('Zehn Minuten später kommt Aria. Sie humpelt. Ihre Lippe ist aufgeplatzt, am Zerberster ist eine tiefe Schramme quer über die Silberschale, ihr Shirt ist am Ärmel zerrissen. Sie sagt nichts. Sie sieht dich nur an. Dann geht sie.'),
    s('ripper', 'Anderthalb Raten, Schätzchen. Das Paket hat einen Kratzer. Die Brecherin auch, hab ich gehört.', 'signatur'),
  ], { effects: [set('vexaria_deal_mitgenommen'), set('vexaria_raten_gestrichen'), herz(-30), { advanceTime: 150 }] }),
]);

// ---------------------------------------------------------------------------
// Brücke 2 · rom-vexaria-streit · „Verpiss dich“ (Akt-1-Fassung von rom-aria-streit, Weg alleingang)

const streit = (id: string, rom: boolean): DialogueDef => dlg(id, [
  node('start', [
    n('Neon-Gasse, vor dem Eingang des High Voltage. Aria steht unter der Leuchtreklame, als hätte sie dort gewartet. Hat sie.'),
  ], {
    effects: STATION_START,
    choices: [
      ch('Hingehen.', 'allein', { when: flag('vexaria_deal_allein') }),
      ch('Hingehen.', 'mit', { when: flag('vexaria_deal_mitgenommen') }),
    ],
  }),
  node('allein', [
    a('Dante hat deinen Ellbogen gesehen. Und die Augenbraue. Dante redet. Dante redet IMMER.', 'wut'),
    a('Bist du komplett bescheuert? Allein? Zu den Rostzähnen? Die hätten dich ausgeschlachtet und deine Nieren am Schrottmarkt verhökert!', 'wut'),
    a('Für drei RATEN?', 'wut'),
    ...(rom ? [a('Ich hab schon einen Arm verloren. Ich will nicht auch noch … vergiss es.', 'trauer')] : []),
  ], { next: 'kern' }),
  node('mit', [
    a('Ich lag da. Mit \'nem Rostzahn auf\'m Rücken und \'ner Rohrzange am Hals. Und du bist WEITERGERANNT.', 'wut'),
    a('Ich hab deinen Namen geschrien. Du hast es gehört. Ich weiß, dass du\'s gehört hast. Deine Schultern haben gezuckt.', 'wut'),
    ...(rom ? [
      a('Weißt du, wie sich das anfühlt? Wenn einer wegläuft, während du da liegst? Ich weiß es. Ich weiß es seit drei Jahren. Und du weißt, dass ich\'s weiß.', 'trauer'),
    ] : [
      a('Crew lässt Crew nicht liegen. Das ist die einzige Regel, die Hunter hat, die ich nicht scheiße finde.', 'wut'),
    ]),
  ], { next: 'kern' }),
  node('kern', rom ? [
    a('Du rennst immer allein, oder? Und wer dreht sich nach DIR um, du Idiotin?', 'wut'),
    n('Du willst was sagen. Es kommt nichts. Dein Daumen reibt an der Schnalle. Sie sieht es. Es macht sie noch wütender.'),
    a('Lass mich in Ruhe. Verpiss dich einfach.', 'wut'),
  ] : [
    a('Was fällt dir ein, ey? Du rennst allein, du lässt Leute liegen, du redest nicht. Was BIST du, ein Paket?', 'wut'),
    a('Lass mich in Ruhe. Verpiss dich einfach. Für heute.', 'wut'),
  ], {
    choices: [
      ch('„Ich weiß, wie man abhaut. Ich will das nicht mehr.“', 'gehoert', { check: chk(`vexaria-streit-strasse${rom ? '' : '-fs'}`, 'strasse', 5, ['trost']), effects: [set('aria_streit_gehoert')] }),
      ch('Umdrehen. Gehen. Nicht umgucken.', 'gehen'),
      ch('Hinterherlaufen und sie am Arm festhalten.', 'festhalten', { effects: [herz(-40)] }),
      ch('„Ich hab\'s für uns gemacht. Drei Raten weniger!“', 'zurueck', { effects: [herz(-60)] }),
    ],
  }),
  node('gehoert', [
    v('Ich weiß, wie man abhaut. Ich will das nicht mehr.'),
    n('Sie bleibt stehen. Mit dem Rücken zu dir. Sie hört zu. Du siehst es daran, wie ihre Schultern stillhalten.'),
    n('Dann geht sie trotzdem. Aber langsamer.'),
  ], { next: 'ende' }),
  node('gehen', [
    n('Du drehst dich um und gehst. Du guckst nicht zurück.'),
    n('Wie immer.'),
  ], { next: 'ende' }),
  node('festhalten', [
    n('Du packst ihren Arm. Den falschen. Der Zerberster reißt sich los, so heftig, dass dein Metallarm gegen die Hauswand knallt.'),
    a('FASS. MICH. NICHT. AN.', 'wut'),
  ], { next: 'ende' }),
  node('zurueck', [
    a('Für UNS? Es gibt kein uns, das man in Raten abstottert, du –', 'wut'),
    n('Sie spricht den Satz nicht zu Ende. Sie geht.'),
  ], { next: 'ende' }),
  node('ende', [
    n(rom ? 'Drinnen, durchs Fenster, siehst du, wie sie sich zu Vega setzt. Mit dem Rücken zur Tür.' : 'Drinnen setzt sie sich zu Vega. Vega sieht durchs Fenster zu dir raus. Lange.'),
  ], {
    effects: rom
      ? [set('aria_streit_alleingang'), set('aria_romanze_streit'), set('aria_romanze_angebahnt', false), msg('Aria ist sauer. Richtig.')]
      : [set('aria_streit_alleingang'), set('aria_krach'), msg('Krach mit Aria.')],
  }),
]);

// ---------------------------------------------------------------------------
// Station 7 · rom-vexaria-funkstille · „Kanal vier war offen“ (ohne Tafel)

const funkstille = (id: string, rom: boolean): DialogueDef => dlg(id, [
  node('start', [
    n('Das Dach über der Kurierbude. Kurz vor Mitternacht. Die Glühbirne unten ist aus. Du sitzt auf dem Wellblech, den Kurierfunk auf dem Knie, und drehst am Wahlschalter, ohne hinzusehen.'),
    n('Kanal 9. Die Schleife. Du hast sie nie gelöscht.'),
    KAS('Schrapnell eins an alle: Nicht anhalten. Nicht umdrehen. Wir sehen uns im Ziel.'),
    KAS('Schrapnell eins an alle: Nicht anhalten. Nicht umdrehen. Wir sehen uns im Ziel.'),
    n('Du drückst die Sprechtaste. Zum ersten Mal seit zwei Jahren.'),
    v('Hey, Großer. Ich weiß, du hörst nicht zu. Gut. Dann kann ich\'s ja sagen.', 'trauer'),
  ], {
    choices: [
      ch('„Ich hab sie ausgeliefert. Wie \'n Paket. Sie hat recht. Ich kann nur Sachen von A nach B bringen.“', 'block2', { when: flag('aria_streit_deal') }),
      ch('„Ich bin allein rein. Wie immer. Allein ist schneller, sagst du. Du bist tot, Kas. So schnell war das.“', 'block2', { when: all(flag('aria_streit_alleingang'), noFlag('vexaria_deal_mitgenommen')) }),
      ch('„Hinter mir hat\'s geknackt, Kas. Schon wieder. Und ich hab mich nicht umgedreht. Schon wieder.“', 'block2', { when: flag('vexaria_deal_mitgenommen') }),
      ch('„Sie will nicht, dass einer hinguckt. Ich kann nicht weggucken. Also bin ich gegangen. Ich bin gut im Gehen. Ich bin scheiße im Wiederkommen.“', 'block2', { when: flag('aria_streit_scham') }),
      ch('„Ich hab\'s verkackt, Großer.“', 'block2', { when: all(noFlag('aria_streit_deal'), noFlag('aria_streit_alleingang'), noFlag('aria_streit_scham')) }),
    ],
  }),
  node('block2', [
    n('Die Schleife läuft weiter, unter deiner Stimme. Nicht anhalten. Nicht umdrehen.'),
  ], {
    choices: [
      ch('„Sie war\'s, Kas. Der Schrei in der Halle. Wir sind abgehauen, und sie hört seit drei Jahren jede Nacht das Klappern. Ich auch. Wusste nicht, dass wir dasselbe hören. Ist irgendwie … weniger allein.“', rom ? 'block3' : 'knacken', { when: flag('vexaria_oberlicht') }),
      ch('„Da ist eine, Kas. Laut. Flucht wie du. Ich hab\'s verkackt.“', rom ? 'block3' : 'knacken', { when: noFlag('vexaria_oberlicht') }),
    ],
  }),
  ...(rom ? [
    node('block3', [
      n('Du hörst auf zu reden. Die Schleife nicht. Der Wind schiebt eine Plastiktüte über das Dach. Unten bellt ein Hund. Du drückst noch einmal die Taste.'),
    ], {
      choices: [
        ch('„Ich bin scheiße mit Worten. Also nur das: Ich will sie. Nicht ihren Arm. Nicht ihren Schläger. Sie. Die laute, fluchende … Scheiße. Okay. Ende.“', 'knacken', { check: chk('vexaria-funkstille-ausstrahlung', 'ausstrahlung', 3, ['ehrlich']), effects: [set('vexaria_funk_gefuehl')] }),
        ch('„Ich will einmal stehen bleiben. Bei ihr. Ist das okay, Großer?“', 'knacken'),
      ],
    }),
  ] : []),
  node('knacken', [
    n('Dann knackt es im Funk. Nicht Kas. Etwas Lebendiges.'),
    n('Du siehst auf den Wahlschalter. Er steht nicht auf 9. Er steht auf 4. Dem Sammelkanal. Allen Schrapnell-Kurieren der Stadt.'),
    kanal('Kurier Sieben-Neun', '… Chefin? Das war Kanal 4. Ganze Flotte. Wir haben alle … also. Respekt.'),
    kanal('Kurier Zwölf', 'Ich sitz an der Kreuzung und heul.'),
    s('vega', 'Vega hier. Ich scanne alle Kanäle. Aus beruflichen Gründen. … Gute Rede, Kurierin.', 'neutral'),
    v('Fickt euch. Alle. Kanal wechseln. SOFORT.', 'wut'),
    n('Rauschen. Dann Stille. Echte Stille. Du sitzt allein auf dem Dach, und die ganze Unterstadt weiß, was in dir drin ist.'),
    v('… Scheiße.', rom ? 'verlegen' : 'ueberrascht'),
    n('Dein Telefon summt. Dann noch mal. Dann noch mal.'),
    s('dante', '(Telefon) Um Himmels Willen, sie sitzt bei Vega und schweigt. ARIA SCHWEIGT. Das ist ein Notfall!', 'besorgt'),
    s('vega', '(Telefon) Du läufst. Ich hab Leute durchs Zielfernrohr laufen sehen. Die halten alle irgendwann an. Die Frage ist nur, wo.', 'neutral'),
    s('hunter', '(Telefon) Eine Lieferung in die Ödnis ist frei. Zahlt gut. Ich biete sie dir nicht an. Ich sag nur, dass sie da ist.', 'neutral'),
    n('Von Aria kommt nichts.'),
  ], {
    choices: [
      ch('Die Ödnis-Lieferung nehmen. Zwei Tage Staub, kein Funk.', 'ferne', { when: R }),
      ch('Auf dem Dach bleiben. Funk aus.', 'dach'),
      ch('Zum High Voltage. Draußen sitzen. Nicht reingehen.', 'tuer'),
    ],
  }),
  node('ferne', [
    n('Du nimmst die Lieferung. Natürlich nimmst du sie. Wegrennen ist das, was du kannst.'),
    n('Zwei Tage Staubstraße. Zwei Nächte unter einem Wellblechdach, das nicht deins ist. Das Paket kommt an. Du auch. Zurück kommst du trotzdem.'),
  ], { effects: [set('vexaria_funkstille_ferne'), { credits: 200 }, { sleep: true }, { sleep: true }, msg('Zwei Tage in der Ödnis. +200 Cr.')] }),
  node('dach', [
    n('Du schaltest den Funk aus. Du bleibst sitzen, bis die Kälte durchs Gurtzeug kriecht. Dann arbeitest du. Pakete, Dächer, Pakete. Gegen das Denken anarbeiten. Das konntest du immer.'),
  ], { effects: [set('vexaria_funkstille_dach')] }),
  node('tuer', [
    n('Du gehst zum High Voltage. Du gehst nicht rein. Du setzt dich auf die Bordsteinkante gegenüber, unter die kaputte Laterne, und wartest. Auf nichts. Auf sie. Bis es hell wird.'),
    n('Am Morgen stupst dich ein Stiefel an. Vega, mit Thermoskanne. Sie sagt nichts. Sie gießt dir nur einen Becher ein.'),
  ], { effects: [set('vexaria_funkstille_tuer'), { relation: 'vega', delta: 20 }] }),
]);

// ---------------------------------------------------------------------------
// Vegas Anruf (Akt-1-Weg statt rom-aria-vega)

const vegaRat: DialogueDef = dlg('vexaria-vega-rat', [
  node('start', [
    n('Vega ruft an. Sie redet, als würde sie dich durch ein Zielfernrohr ansehen. Wahrscheinlich tut sie das.'),
    s('vega', 'Setz dich. Egal wo du bist. Setz dich hin.', 'neutral'),
    s('vega', 'Ich hab sie damals aus der Rennhalle getragen. Ich trag sie nicht nochmal irgendwo raus, verstanden?', 'besorgt'),
    s('vega', 'Du läufst, weil du glaubst, wer stehen bleibt, verliert jemanden. Sie bleibt stehen, weil sie glaubt, wer läuft, ist weg. Ihr habt beide unrecht. Und ihr seid beide Idioten.', 'neutral'),
  ], {
    choices: [
      ch('„Kanal 4, was?“', 'kanal4', { when: flag('vexaria_kanal4') }),
      ch('Zuhören.', 'rat'),
    ],
  }),
  node('kanal4', [
    s('vega', 'Kanal 4. Ich hab mitgeschrieben. Willst du\'s ausgedruckt?', 'signatur'),
    s('vega', 'Ich droh dir trotzdem. 800 Meter. Ist Tradition.', 'signatur'),
  ], { next: 'rat' }),
  node('rat', [
    s('vega', 'Sie hat keine Angst um sich. Sie hat Angst, dass noch jemand wegen ihr was verliert. Und dass einer wegrennt, wenn sie liegt.', 'besorgt'),
  ], {
    choices: [
      ch('„Ich hab sie damals nicht rausgetragen. Ich lag auf dem Glas und bin gerannt. Diesmal bleib ich.“', 'oberlicht', { when: flag('vexaria_oberlicht'), check: chk('vexaria-vega-strasse', 'strasse', 5, ['ehrlich']) }),
      ch('„Ich weiß nicht, wie ich das reparieren soll.“', 'ehrlich', { effects: [{ relation: 'vega', delta: 20 }] }),
      ch('„Geht dich nichts an.“', 'abwimmeln', { effects: [{ relation: 'vega', delta: -40 }, set('vexaria_vega_abgewimmelt')] }),
    ],
  }),
  node('oberlicht', [
    n('Lange Stille in der Leitung. Nur Wind. Vega steht irgendwo sehr hoch.'),
    s('vega', 'Ihr wart die zwei auf dem Oberlicht? Ich hab euch gesehen. Ich hab gedacht, ihr fallt durch.', 'besorgt'),
    s('vega', '… Okay. Okay, Kurierin.', 'neutral'),
  ], { effects: [{ relation: 'vega', delta: 40 }], next: 'schluss' }),
  node('ehrlich', [
    s('vega', 'Gut. Das ist der erste ehrliche Satz, den ich von dir hör. Fang damit an.', 'neutral'),
  ], { next: 'schluss' }),
  node('abwimmeln', [
    s('vega', 'Wie du willst.', 'wut'),
    n('Aufgelegt. Eine Stunde später kommt eine Nachricht, drei Wörter und ein Ortsname.'),
  ]),
  node('schluss', [], {
    choices: [
      ch('„Und jetzt?“', 'schluss-rom', { when: all(R, STREIT) }),
      ch('„Und jetzt?“', 'schluss-fs', { when: not(all(R, STREIT)) }),
    ],
  }),
  node('schluss-rom', [s('vega', 'Sie sucht dich. Nachts. Auf den Dächern. Sie kennt die Wege nicht, Vex.', 'besorgt')], { effects: [set('aria_vega_rat')] }),
  node('schluss-fs', [s('vega', 'Sie will dich heute Nacht zum Bier abholen. Über die Dächer. Sie kennt die Wege nicht, Vex.', 'besorgt')], { effects: [set('aria_vega_rat')] }),
]);

// ---------------------------------------------------------------------------
// Station 8 · rom-vexaria-umdrehen · „Nie umdrehen“ (Tafel)

const umdrehen1 = (id: string, rom: boolean): DialogueDef => dlg(id, [
  node('start', [
    n('Nacht. Nieselregen, fein wie Staub. Du kommst über die Feuertreppe auf das Dach diesseits der Lücke, nass bis auf die Knochen, das Gurtzeug schwer vom Wasser.'),
    n('Drüben steht Aria. Im Regen, ohne Kapuze, den Schläger auf dem Rücken, die Zöpfe schwarz und schwer. Sie hat dich gesehen. Sie geht drei Schritte zurück.'),
    n('Sie nimmt Anlauf.'),
    n('Viereinhalb Meter. Neun Stockwerke. Nasses Blech. Sie kennt die Wege nicht.'),
    n('Und zum ersten Mal seit zwei Jahren drehst du dich zu jemandem um. Und du brüllst.'),
    v('STOPP! ARIA! BLEIB, WO DU BIST!', 'besorgt'),
    n('Sie bleibt stehen. An der Kante. Mit den Stiefelspitzen über dem Nichts.'),
    ...(rom ? [
      a('ICH WILL DICH ANSCHREIEN! DAFÜR MUSS ICH DICH ERST MAL KRIEGEN, DU ARSCHLOCH!', 'wut'),
    ] : [
      a('ICH HAB BIER DABEI! ZWEI! EINS IST SCHON OFFEN!', 'freude'),
    ]),
  ], {
    effects: STATION_START,
    choices: [
      ch('Springen. Zu ihr.', 'springen'),
      ch('Den langen Weg rennen.', 'rennen'),
    ],
  }),
  node('springen', [
    n('Du trittst an die Kante. Du willst. Du willst es so sehr, dass dir schlecht wird.'),
    n('Deine Beine machen nicht mit. Sie stehen einfach da, wie sie vor zwei Jahren dagestanden haben, nur andersrum.'),
    v('… Ich kann nicht.', 'trauer'),
    a('Dann bleib da! Ich komm –', rom ? 'besorgt' : 'besorgt'),
    v('NEIN. Bleib. Ich komm zu dir. Bleib einfach, wo du bist.', 'besorgt'),
  ], { next: 'rennen' }),
  node('rennen', [
    n('Du rennst. Den langen Weg. Feuertreppe runter, drei Stufen auf einmal. Die Gasse, Pfützen bis zu den Knöcheln. Die andere Feuertreppe hoch, Rost unter den Handflächen.'),
    n('Vier Minuten. Die Uhr zählt mit. Es sind die längsten vier Minuten deines Lebens, und du hast schon mal einhändig eine Hauswand runtergeklettert.'),
    n('Oben. Sie steht immer noch an der Kante. Sie hat sich nicht bewegt. Du packst ihre echte Hand, mit deiner echten, und mit der schwarzen gleich dazu, und ziehst sie weg von der Kante. Weit weg.'),
  ], { effects: [{ advanceTime: 4 }, { cutscene: rom ? 'rom-vexaria-umdrehen' : 'rom-vexaria-umdrehen-fs' }] }),
]);

const umdrehen2 = (id: string, rom: boolean): DialogueDef => dlg(id, [
  node('start', [
    v('Nicht. Springen. Nicht hier.', 'trauer'),
    a('Was ist mit dir und dem Scheißloch? Du zitterst. Du zitterst ja mehr als ich.', 'besorgt'),
    n('Du ziehst sie weiter, bis zur Lüftung, bis eure Rücken am kalten Blech sind und die Lücke nur noch ein schwarzer Strich im Regen ist. Dann erzählst du. Alles. Auf dem Dach, von dem er gefallen ist.'),
    v('Kas war mein Bruder. Er hat die Kuriere gemacht. Das Gurtzeug ist seins. Die Pistole auch. „Nie umdrehen, nie anhalten.“ Das war seine Regel.'),
    v('Wir sind hier gerannt. Ich war vorn. Hinter mir hat\'s geknackt. Ich hab mich nicht umgedreht. Weil man das nicht macht. Ich hab gewonnen.', 'trauer'),
    v('Er lag da unten. Ich bin runtergeklettert. Deshalb der Handschuh.', 'trauer'),
    n('Du ziehst ihn nicht aus. Aber du drehst die linke Hand um, die Handfläche nach oben, und im Licht der Reklame sieht sie den Rand der Narben unter dem Leder.'),
    v('Auf halber Höhe kam ein Lüftungskasten runter. Der Arm ist da geblieben. Bei ihm.'),
    n('Du sagst es zu ruhig. Viel zu ruhig. Aria sieht auf den schwarzen Arm. Dann auf ihren eigenen.'),
    a('Ripper. Der Ratenarm. Den hat er mir auch angeboten.', 'besorgt'),
    v('Ich weiß. Du hattest Dante. Ich hatte \'ne Feuertreppe.', 'trauer'),
    v('Wenn ich mich umdreh, fällt einer. Das ist alles, was ich weiß.'),
    n('Aria sagt sehr lange nichts. Der Regen trommelt auf die Lüftung. Dann, ganz leise:'),
    a('Du hast dich grad umgedreht. Wegen mir.', 'ueberrascht'),
    a('Und keiner ist gefallen.', rom ? 'zaertlich' : 'neutral'),
    ...(rom ? [
      a('Ich bin immer noch sauer. Richtig sauer. Ich will dir immer noch eine reinhauen.', 'wut'),
      a('Aber ich bin lieber sauer auf dich, wenn du lebst. Kapiert?', 'trauer'),
    ] : [
      a('Ich wollt dir nur \'n Bier bringen, und du erzählst mir dein ganzes Leben. Im Regen. Das ist das Meiste, was du je geredet hast.', 'trauer'),
    ]),
  ], {
    choices: [
      ch('„Ich bin weggelaufen, weil ich dachte, das ist das Einzige, was ich kann. Ich will was anderes können.“', 'weggelaufen', { when: flag('vexaria_oberlicht'), effects: [herz(60), ...(rom ? [set('aria_streit_gehoert')] : [])] }),
      ch('„Hau mir eine rein. Ich halt still.“', 'reinhauen', { effects: [herz(50), ...(rom ? [set('aria_streit_gehoert')] : [])] }),
      ch('„Kas hätte dich gemocht. Er mochte Leute, die zu laut sind.“', 'kas', { check: chk(`vexaria-umdrehen-strasse${rom ? '' : '-fs'}`, 'strasse', 5, ['trost']), effects: [herz(50)] }),
      ch('„Ich hab\'s für dich gemacht.“', 'rechtfertigen', { when: { flag: 'aria_romanze_streit' } }),
    ],
  }),
  node('weggelaufen', [
    v('Ich bin weggelaufen, weil ich dachte, das ist das Einzige, was ich kann. Ich will was anderes können.'),
    n('Aria lehnt den Kopf gegen das nasse Blech und schließt die Augen. Ihre echte Hand liegt immer noch in deiner. Sie drückt zu.'),
  ], { next: 'kanal4' }),
  node('reinhauen', [
    v('Hau mir eine rein. Ich halt still.'),
    n('Aria hebt die Metallfaust. Sie holt aus. Du hältst still. Die Faust stoppt zwei Zentimeter vor deinem Gesicht, genau wie beim Training, und dann tippt sie dir mit einem Silberknöchel sacht gegen die Stirn.'),
    a('Siehst du. Ich kann bremsen.', rom ? 'zaertlich' : 'freude'),
  ], { next: 'kanal4' }),
  node('kas', [
    a('… Halt die Klappe. Sonst heul ich, und dann sieht\'s wie Regen aus, und das ist geschummelt.', 'trauer'),
    n('Sie heult trotzdem. Es sieht aus wie Regen. Es ist geschummelt.'),
  ], { next: 'kanal4' }),
  node('rechtfertigen', [
    a('Ich weiß. Genau das ist ja das Problem.', 'trauer'),
    n('Aber sie lässt deine Hand nicht los.'),
  ], { next: 'kanal4' }),
  node('kanal4', [], {
    choices: [
      ch('Weiter im Regen sitzen.', 'kanal4-text', { when: all(flag('vexaria_kanal4'), any(STREIT, flag('aria_romanze_streit'))) }),
      ch('Weiter im Regen sitzen.', 'schluss', { when: not(all(flag('vexaria_kanal4'), any(STREIT, flag('aria_romanze_streit')))) }),
    ],
  }),
  node('kanal4-text', [
    a('Und du hast deinem toten Bruder erzählt, was du von mir willst. Auf Kanal 4. Die Kuriere grüßen mich jetzt mit HERZCHEN, Vex. Ich hab \'nen Ruf!', 'wut'),
    n('Sie lacht dabei. Unter Tränen, im Regen, mit dem Gesicht an deiner nassen Schulter.'),
  ], { next: 'schluss' }),
  node('schluss', [
    n('Irgendwann wird der Regen stärker. Richtig stark. Ihr sitzt da wie zwei nasse Katzen.'),
  ], {
    choices: [
      ch('Runter. Unter das Vordach.', 'vordach-rom', { when: all(BRUECKE, R, STREIT) }),
      ch('Runter. Unter das Vordach.', 'vordach-fs', { when: all(BRUECKE, not(all(R, STREIT))) }),
      ch('Aufstehen.', 'ende', { when: not(BRUECKE) }),
    ],
  }),
  // Akt-1-Weg: Vex-Fassung von rom-aria-regen (Versöhnung) direkt im Anschluss.
  node('vordach-rom', [
    n('Das Vordach in der Neon-Gasse. Der Regen fällt wie ein Vorhang davor. Du ziehst deine Lieferweste aus der Hüfttasche, die mit den Reflexstreifen, die du nur bei Lieferungen überziehst. Aria nimmt sie dir aus der Hand und hält sie über euch beide, obwohl das Vordach reicht.'),
    a('Deine Weste hat Reflexstreifen. Jetzt sieht jeder Taxifahrer, wie ich heul. Danke auch.', 'freude'),
    a('Was willst du? Sag\'s. Jetzt. Bevor ich wieder sauer werd.', 'besorgt'),
  ], {
    choices: [
      ch('„Kas hat gesagt, wer anhält, wird geschnappt. Ich will, dass du mich schnappst.“', 'versoehnt'),
      ch('Frei reden. Irgendwie. Ohne Worte, die du kannst.', 'versoehnt', { check: chk('vexaria-regen-ausstrahlung', 'ausstrahlung', 4, ['ehrlich']), effects: [herz(20)] }),
      ch('„Wo ich herkomm, verzeiht keiner. Man vergisst nur. Ich will nicht, dass du vergisst. Ich will, dass du verzeihst.“', 'versoehnt', { tag: '[Gosse]' }),
    ],
  }),
  node('versoehnt', [
    a('Das ist das Dümmste und Schönste, was mir je einer unterm Vordach gesagt hat.', 'ueberrascht'),
    a('Mach das nie wieder. Und wenn doch, nimm mich mit.', 'zaertlich'),
    a('Komm her. Näher. Noch näher. Da ist kein Regen mehr, ich weiß, ich will nur –', 'zaertlich'),
    n('Ihre Stirn an deiner. Ihre Nase streift deine. Du spürst ihren Atem, schnell und warm, und den Regen von ihren Zöpfen auf deinem Hals. Eure Lippen sind so nah, dass ein Wort sie berühren würde.'),
    n('Aria beißt sich auf die Unterlippe. Fest.'),
    a('Nein. Nicht unterm Vordach. Ich will\'s richtig. Auf der Mauer.', 'verlegen'),
    v('Auf der Mauer.', 'verlegen'),
    a('Bei Sonnenuntergang. Mit Rennen vorher. Ich will dich schnaufen sehen.', 'signatur'),
    v('Ich schnauf nie.'),
    a('Dann streng dich mehr an.', 'verlegen'),
  ], {
    effects: [
      set('aria_versoehnung_verdient'), set('aria_romanze_streit', false), set('aria_romanze_angebahnt'), herz(120),
      msg('Versöhnt. Aria wartet auf der Flutmauer – bei Sonnenuntergang, nach einem Rennen.'),
    ],
    next: 'ende',
  }),
  node('vordach-fs', [
    n('Das Vordach. Aria macht das zweite Bier auf, mit dem Zerberster, der Kronkorken fliegt in hohem Bogen in eine Pfütze. Sie reicht es dir. Es ist warm und schmeckt nach Regen.'),
    a('Du bist \'ne Idiotin. Aber du bist meine Crew-Idiotin.', 'freude'),
    v('War nicht komplett scheiße. Das Bier.'),
    a('Das Bier war SCHEISSE. Der Rest nicht.', 'freude'),
  ], { effects: [set('aria_versoehnung_verdient'), set('aria_krach', false), herz(80)], next: 'ende' }),
  node('ende', [
    n('Die Lücke liegt hinter euch im Regen. Zum ersten Mal sieht sie aus wie das, was sie ist: ein Loch zwischen zwei Häusern.'),
  ], { effects: [set('vexaria_umgedreht'), set('vexaria_kas_erzaehlt')] }),
]);

// ---------------------------------------------------------------------------
// Cutscenes

const cutscenes = [
  cut('rom-vexaria-umdrehen', 'Nie umdrehen', [
    { image: 'cut-rom-vexaria-umdrehen', pan: 'in', fade: 'in', hold: 2400, caption: 'Die Lücke. Regen. Vier Minuten.' },
    {
      image: 'cut-rom-vexaria-umdrehen', pan: 'out',
      lines: [
        n('Deine Hände um ihre. Beide. Die echte und die schwarze. Ihr silberner Arm hängt nass zwischen euch. Sie ist so wütend, dass sie zittert, und du zitterst so sehr, dass es keinen Unterschied mehr macht.'),
        a('Du bist den ganzen Weg gerannt.', 'ueberrascht'),
        v('Vier Minuten.', 'besorgt'),
      ],
    },
  ], [{ dialogue: 'rom-vexaria-umdrehen-dach' }]),
  cut('rom-vexaria-umdrehen-fs', 'Nie umdrehen', [
    { image: 'cut-rom-vexaria-umdrehen', pan: 'in', fade: 'in', hold: 2400, caption: 'Die Lücke. Regen. Vier Minuten.' },
    {
      image: 'cut-rom-vexaria-umdrehen', pan: 'out',
      lines: [a('Du bist den ganzen Weg gerannt. Für \'n Bier.', 'ueberrascht'), v('Vier Minuten.', 'besorgt')],
    },
  ], [{ dialogue: 'rom-vexaria-umdrehen-dach-fs' }]),
];

// ---------------------------------------------------------------------------
// Telefon

const phone: PhoneMessageDef[] = [
  {
    id: 'aria-vex-kanal4', from: 'aria', text: 'hab\'s gehört. alle haben\'s gehört. arschloch.',
    auto: all(V, flag('vexaria_kanal4'), flag('aria_romanze_streit'), { time: 'morgen' }),
  },
  {
    id: 'aria-vex-kanal4-2', from: 'aria', text: 'nicht löschen.',
    auto: all(V, flag('vexaria_kanal4'), flag('aria_romanze_streit'), { time: ['morgen', 'tag'] }),
  },
  {
    id: 'aria-vex-kanal4-fs', from: 'aria', text: 'hab\'s gehört. idiot. bier morgen.',
    auto: all(V, flag('vexaria_kanal4'), flag('aria_krach'), { time: ['morgen', 'tag'] }),
    effects: [set('aria_krach', false)],
  },
  {
    id: 'vega-vex-anruf', from: 'vega', text: 'Vega hier. Geh ran. Jetzt.',
    auto: all(V, BRUECKE, seen('rom-vexaria-funkstille'), not(seen('rom-vexaria-umdrehen')), HEUTE_FREI, { time: 'abend' }),
    replies: [
      { text: 'Rangehen.', effects: [{ dialogue: 'vexaria-vega-rat' }] },
      { text: 'Wegdrücken.', effects: [set('vexaria_vega_abgewimmelt')] },
    ],
  },
  {
    id: 'vega-vex-luecke', from: 'vega', text: 'Neon-Gasse. Die Lücke. Beweg dich.',
    auto: all(V, seen('rom-vexaria-funkstille'), flag('vexaria_vega_abgewimmelt'), not(seen('rom-vexaria-umdrehen')), { time: 'nacht' }),
  },
];

// Dante am Tag nach der Funkstille.
const danteGluehbirne: DialogueDef = dlg('vexaria-dante-gluehbirne', [
  node('start', [
    s('dante', 'Die Glühbirne in deiner Bude war aus. Die ist sonst nie aus. Ich bin extra vorbeigelaufen. Zweimal. Ich schlaf nicht gut.', 'besorgt'),
    s('dante', 'Ich hab dir Kekse vors Rolltor gelegt. Captain Kuschel hat sie gegessen. Es ist die Geste, die zählt.', 'verlegen'),
  ]),
]);

// ---------------------------------------------------------------------------
// Herz-Ereignisse

const STREIT_GESEHEN: Condition = any(seen('rom-aria-streit'), seen('rom-vexaria-streit'));
const ROM_STREIT_NOW: Condition = all(V, R, STREIT);

export const BRUCH_EVENTS: HeartEventDef[] = [
  {
    id: 'rom-vexaria-ripperdeal', hearts: 8, map: 'high-voltage', time: 'abend',
    when: all(V, AKT1, HEUTE_FREI, seen('rom-vexaria-oberlicht'), not(seen('rom-vexaria-ripperdeal'))),
    dialogue: 'rom-vexaria-ripperdeal',
    effects: [{ setFlag: 'aria_heute' }, { xp: 25 }],
  },
  ...twin({
    id: 'rom-vexaria-streit', hearts: 8, map: 'neon-gasse', time: 'abend',
    when: all(V, HEUTE_FREI, seen('rom-vexaria-ripperdeal')),
  }, ROM_AN, { dialogue: 'rom-vexaria-streit' }, { dialogue: 'rom-vexaria-streit-fs' }),
  // Station 7: dieselbe Nacht wie der Streit (keine Tagessperre).
  ...twin({
    id: 'rom-vexaria-funkstille', hearts: 8, map: 'loetgassen', time: 'nacht',
    when: all(V, STREIT_GESEHEN, { clockBetween: [1380, 1560] }, any(flag('aria_romanze_streit'), flag('aria_krach'), BRUECKE)),
    effects: [set('vexaria_kanal4')],
  }, ROM_STREIT_NOW, { dialogue: 'rom-vexaria-funkstille' }, { dialogue: 'rom-vexaria-funkstille-fs' }),
  ...twin({
    id: 'rom-vexaria-umdrehen', hearts: 8, map: 'neon-gasse', time: 'nacht',
    when: all(V, HEUTE_FREI, seen('rom-vexaria-funkstille'), any(BRUECKE, seen('rom-aria-vega'))),
  }, ROM_STREIT_NOW, { dialogue: 'rom-vexaria-umdrehen' }, { dialogue: 'rom-vexaria-umdrehen-fs' }),
];

export const part: ContentPart = {
  dialogues: byId([
    ripperdeal, streit('rom-vexaria-streit', true), streit('rom-vexaria-streit-fs', false),
    funkstille('rom-vexaria-funkstille', true), funkstille('rom-vexaria-funkstille-fs', false),
    vegaRat,
    umdrehen1('rom-vexaria-umdrehen', true), umdrehen1('rom-vexaria-umdrehen-fs', false),
    umdrehen2('rom-vexaria-umdrehen-dach', true), umdrehen2('rom-vexaria-umdrehen-dach-fs', false),
    danteGluehbirne,
  ]),
  cutscenes: byId(cutscenes),
  phone: byId(phone),
  mapAdditions: {
    'loetgassen': {
      onEnter: [{
        id: 'vexaria-dante-gluehbirne', when: all(V, flag('vexaria_kanal4'), noFlag('aria_heute'), { time: ['tag', 'abend'] }, not(seen('rom-vexaria-umdrehen'))),
        dialogue: 'vexaria-dante-gluehbirne',
      }],
    },
  },
};
