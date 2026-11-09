// Pim Pinzette – Laborassistentin bei Quantum (world.md §4.4, §11.2). Nur Freundschaft (NEVER_ROMANCE).
// Tagesablauf nach design/plan/act1.json (npcSchedules.pim-pinzette): morgens Pendlerbank am Bahnhof, tagsüber im
// Labor (away), abends Imbiss „Lötkolben“ am Schrottmarkt, nachts weg. Herz-Ereignisse he-pim-pinzette-2/4/6,
// 8/10 angelegt und an act2 gebunden. prep-grundriss (gc-104) baut quest-main-b; persönliche Quest
// pers-pim-kleine-schrift (act2) baut der Quest-Agent – hier setzt he-pim-pinzette-6 nur das Flag pim_labornotizen.
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode, NpcDef } from '../../../modules/contracts';
import {
  type Menue, einmalig, AKT2, VOR_AKT2, alle, dialog, erz, flag, herz, herzEreignis, ich, knoten, pruefung, rede, sammle,
  sprecher, tagesgespraech, ZEIT_HINWEIS, erweitere, MASTER, nicht,
} from './_lib';
import { MENUE_23, akt23 } from './pim-akt23';

const ID = 'pim-pinzette';
const P = sprecher(ID);
const GRUNDRISS: Condition = { quest: 'prep-grundriss', state: 'done' };

// ---------------------------------------------------------------------------------------------- Menü

function menue(): Menue {
  const zurueck: DialogueChoice[] = [{ text: 'Noch was, Pim.', next: 'menue', id: 'zurueck' }, { text: 'Bis dann, Pim.' }];
  const choices0: DialogueChoice[] = [
    { text: 'Was macht ihr eigentlich im Labor?', requires: { hearts: ID, min: 2 }, tag: '[Pim ♥2]', once: true, id: 'p-labor', next: 'labor' },
    { text: 'Wie ist Alesa Zero so als Chefin?', once: true, id: 'p-alesa', next: 'alesa' },
    { text: 'Du siehst aus, als hättest du seit drei Tagen nichts gegessen.', when: { time: 'abend' }, once: true, id: 'p-essen', next: 'essen', effects: [{ credits: -8 }, herz(ID, 20)] },
    { text: '„Zeig mal deine Pinzetten. Ich hab mit sechs meinen ersten Chip gelötet.“', tag: '[Schrott]', when: { origin: 'origin-schrott' }, once: true, id: 'p-schrott', next: 'schrott', effects: [herz(ID, 50)] },
    { text: '„Ich kenn die Oberstadt. Die Leute da oben sind nicht besser. Nur besser beleuchtet.“', tag: '[Oberstadt]', when: { origin: 'origin-oberstadt' }, once: true, id: 'p-oberstadt', next: 'oberstadt', effects: [herz(ID, 50)] },
    { text: 'Das Ding im Labor null. Was ist das?', requires: { hearts: ID, min: 4 }, tag: '[Pim ♥4]', when: { seen: 'he-pim-pinzette-4' }, once: true, id: 'p-labor-null', next: 'labor-null' },
    { text: 'Was macht Krabbel?', when: { seen: 'he-pim-pinzette-4' }, next: 'krabbel', id: 'p-krabbel' },
    { text: 'Hast du mit den Notizen noch Ärger?', when: { seen: 'he-pim-pinzette-6' }, next: 'notizen', id: 'p-notizen' },
    { text: 'Bis dann, Pim.' },
  ];
  const choices = einmalig(ID, choices0);
  const nodes: DialogueNode[] = [
    knoten('menue', [P('Ja? Entschuldigung. Ich mein: Ja, bitte? Was kann ich … darf ich … ja?')], { choices }),
    knoten('labor', [
      P('Wir … ich darf darüber nicht reden. Vertrag. Seite vierzehn, Absatz neun: „Die Mitarbeiterin schweigt wie ein Grab, das einen Anwalt hat.“', 'besorgt'),
      P('Aber ganz allgemein: Wir machen Chips. Kleine. Sehr kleine. Die sollen Leuten helfen, sich zu konzentrieren. Und dann helfen sie ihnen, sich auf … bestimmte Sachen zu konzentrieren. Auf Werbung. Zum Beispiel.'),
      P('Aber Sie haben das nicht von mir! Ich hab hier nur gegessen!', 'ueberrascht'),
    ], { choices: zurueck }),
    knoten('alesa', [
      P('Frau Zero ist brillant. Wirklich. Sie hat neulich eine Fliege mit einem Laser umgebaut. Die Fliege kann jetzt rechnen. Sie ist trauriger als vorher, aber sie rechnet.', 'signatur'),
      P('Sie schläft nicht. Sie sagt, Schlaf ist was für Leute ohne Deadline. Deshalb schlafen wir alle nicht. Ich hab seit Montag geträumt, dass ich Petrischalen spüle. Im Wachzustand.', 'besorgt'),
      P('Sie ist nicht böse. Sie ist nur … sehr, sehr neugierig. Und Neugier ohne Bremse ist wie ein Skalpell ohne Griff. Entschuldigung. Das war dunkel.'),
    ], { choices: zurueck }),
    knoten('essen', [
      erz('Du stellst Pim eine Portion Lötkolben-Pommes hin. Sie starrt sie an wie ein Wunder.'),
      P('Für mich? Das ist … ich kann das nicht annehmen. Ich nehm das an. Danke. Entschuldigung. Danke!', 'ueberrascht'),
      erz('Sie isst wie jemand, der seit dem Frühstück nur Kantinenkaffee und Angst hatte.'),
    ], { choices: zurueck }),
    knoten('schrott', [
      P('Mit sechs? Mit SECHS? Ich durfte mit sechs nicht mal Scheren benutzen!', 'ueberrascht'),
      erz('Sie zieht ein kleines Etui aus der Kitteltasche. Zwölf Pinzetten, sortiert nach Größe, jede mit einem Namen auf Klebeband: „Hilde“, „Herbert“, „Die Kleine“.'),
      P('Das ist Herbert. Herbert ist für die ganz feinen Sachen. Sie verstehen das. Sie sind die erste Person, die das versteht.', 'signatur'),
    ], { choices: zurueck }),
    knoten('oberstadt', [
      P('Besser beleuchtet. Ha. Ja. Genau. Da oben ist es so hell, dass man nicht merkt, wie dunkel es ist. Oh Gott, das war wieder dunkel.', 'besorgt'),
      P('Ich komm aus dem Mittelring. Meine Mutter dachte, Quantum ist ein Traumjob. Sie hat ein Foto von meinem Ausweis über dem Sofa. Ich hab ihr nie gesagt, dass ich nur die Schalen spüle. Und manchmal Dinge sehe.'),
    ], { choices: zurueck }),
    knoten('labor-null', [
      P('Labor null. Da darf keiner rein außer Frau Zero und … ein paar Leute in Anzügen. Aber nachts hört man es. Durch die Lüftung.', 'besorgt'),
      P('Es redet. Mit sich selbst. Und manchmal antwortet es sich. Und einmal hat es gelacht. Nicht wie ein Mensch. Wie jemand, der gelernt hat, wie Menschen lachen, und es übt.'),
      P('Sie haben das nicht von mir. Bitte. Ich will nicht in einer Petrischale enden.', 'ueberrascht'),
    ], { choices: zurueck, effects: [flag('pim_labor_null')] }),
    knoten('krabbel', [
      P('Krabbel geht es gut! Er wohnt jetzt in einer Streichholzschachtel mit Watte. Und er hat gelernt, mir die Nachrichten vom Telefon zu bringen. Also die Sprachnachrichten. Er läuft drüber und sie spielen sich ab.', 'signatur'),
      P('Frau Zero hat ihn fast gesehen. Ich hab gesagt, das ist eine Kakerlake. Sie hat gesagt: „Interessant. Fang sie.“ Ich renn seitdem viel.'),
    ], { choices: zurueck }),
    knoten('notizen', [
      P('Sie sind … sicher. Glaub ich. Ich hab sie in einem Comic-Heft versteckt. Zwischen Seite zwölf und dreizehn. Wo der Bösewicht seinen Plan erklärt. Das fand ich passend.', 'besorgt'),
      P('Wenn ich mal mehr brauch … wenn ich mal richtig was rausholen muss … dann frag ich Sie. Nicht jetzt. Bald. Irgendwann, wenn ich mutiger bin. Oder verzweifelter. Das fühlt sich gerade gleich an.'),
    ], { choices: zurueck }),
  ];
  return { choices, nodes };
}

const M = erweitere(menue(), MENUE_23);

const RIVALE: Menue = {
  choices: [{ text: 'Pim, warte –' }],
  nodes: [],
};

// ---------------------------------------------------------------------------------------------- Tagesgespräche

const T = {
  rivale: tagesgespraech('pim-pinzette-tag-rivale',
    [
      P('Oh. Sie. Ich … ich muss los. Wirklich. Mein Zug. Mein … anderer Zug. Entschuldigung.', 'besorgt'),
      erz('Pim zieht die Schultern hoch und guckt überall hin, nur nicht zu dir.'),
    ],
    [P('Bitte. Ich hab genug Leute, vor denen ich Angst hab. Ich brauch nicht noch eine.', 'besorgt')],
    RIVALE, { plauschText: 'Pim, ich wollte nur …' }),
  erstes: tagesgespraech('pim-pinzette-tag-erstes',
    [
      erz('Eine junge Frau in einem zu großen Laborkittel, auf dem Revers ein Quantum-Ausweis, den sie mit dem Daumen verdeckt. Sie zuckt zusammen, als du stehen bleibst.'),
      P('Entschuldigung! Sitzen Sie hier? Ich kann auch weg. Ich bin ganz schnell weg. Ich bin quasi schon weg.', 'ueberrascht'),
      P('Pim. Pinzette. Also, Pim Pinzette. Das ist wirklich mein Name. Meine Eltern hatten einen Sinn für Humor oder eine Vorahnung.'),
    ],
    [P('Ich arbeite bei … in einem Labor. Einem großen. Mit Glas. Mehr darf ich nicht sagen. Ich hab schon zu viel gesagt. Hab ich zu viel gesagt? Entschuldigung.', 'besorgt')],
    M),
  zeit: tagesgespraech('pim-pinzette-tag-zeit',
    [
      P('{name}. Ich … ich will Ihnen was sagen. Was Großes. Aber ich trau mich noch nicht. Ich übe. Vor dem Spiegel. Der Spiegel hat auch Angst.', 'besorgt'),
      erz(ZEIT_HINWEIS),
    ],
    [P('Wenn es so weit ist, wissen Sie es. Ich werde sehr blass. Noch blasser als jetzt. Das ist schwer, aber ich schaff das.')],
    M, { effects: [flag('pim_zeit_hinweis')] }),
  grundriss: tagesgespraech('pim-pinzette-tag-grundriss',
    [
      P('Hab ich Ihnen neulich was verraten? Hab ich nicht. Ich hab hier nur gegessen. Und eine Serviette bekritzelt. Mit … Molekülen.', 'besorgt'),
      P('Wenn irgendwas passiert, irgendwas mit einem Labor … ich war zu Hause. Mit Tee. Und einem Alibi. Das Alibi ist eine Katze. Ich hab keine Katze. Ich besorg eine.'),
    ],
    [P('Entschuldigung. Ich bin nervös. Ich bin immer nervös, aber jetzt bin ich nervös mit Grund.')],
    M, { effects: [flag('pim_grundriss_kommentar')] }),
  mittwoch: tagesgespraech('pim-pinzette-tag-mittwoch',
    [P('Mittwoch! Frau Zero ist heute im Digitech-Areal. Auswärtstermin. Ich kann atmen. Hören Sie? Das bin ich. Beim Atmen.', 'signatur')],
    [P('Ich hab heute Mittag zehn Minuten Pause gemacht. ZEHN. Ich hab an die Wand gestarrt. Es war wundervoll. Die Wand auch.')],
    M),
  morgen: tagesgespraech('pim-pinzette-tag-morgen',
    [P('Morgen. Entschuldigung, ich hab nur vier Minuten bis zur Bahn. Drei. Drei Minuten fünfzig. Reden Sie schnell. Oder gar nicht. Gar nicht ist auch schön.', 'besorgt')],
    [
      P('Wussten Sie, dass die Pendler hier jeden Tag denselben Platz nehmen? Ich auch. Wenn jemand drauf sitzt, steh ich. Ich bin nicht gut in Konflikten.'),
      P('Einmal saß ein Rostzahn auf meinem Platz. Ich hab mich entschuldigt. Er hat sich auch entschuldigt. Wir waren beide sehr verwirrt.'),
    ],
    M),
  abend: tagesgespraech('pim-pinzette-tag-abend',
    [P('Lötkolben-Pommes. Das Einzige, was mich nach zwölf Stunden noch glücklich macht. Die und das Geräusch, wenn man eine Petrischale nicht fallen lässt.', 'signatur')],
    [
      P('Heute hat Frau Zero gesagt: „Pim, das ist nicht falsch. Das ist nur nicht richtig.“ Ich weiß nicht, was das heißt. Ich hab’s mir aufgeschrieben. Ich werde es nie verstehen.', 'besorgt'),
      P('Und dann hat sie mir um 20 Uhr eine Aufgabe für Morgen um 6 gegeben. Mit Smiley. Der Smiley macht es schlimmer.'),
    ],
    M),
  freitag: tagesgespraech('pim-pinzette-tag-freitag',
    [P('Freitag! Wochenende! … Das sagen die Leute so, oder? Ich hab das in einem Film gesehen. Wir haben kein Wochenende. Wir haben „Ruhephasen mit Erreichbarkeit“.', 'besorgt')],
    [P('Vielleicht geh ich morgen zum Flohmarkt. Oder ich schlaf. Oder ich lieg wach und denk an Pipetten. Wahrscheinlich das.')],
    M),
  vertraut: tagesgespraech('pim-pinzette-tag-vertraut',
    [P('{name}! Ich hab Ihnen einen Platz freigehalten. Ich hab gesagt, der ist besetzt. Ein Typ hat sich trotzdem fast hingesetzt. Ich hab „Nein!“ gesagt. Laut! Ich bin so stolz auf mich.', 'ueberrascht')],
    [P('Mit Ihnen kann ich reden, ohne mich zu entschuldigen. Fast. Entschuldigung. Sehen Sie. Fast.', 'signatur')],
    M),
  standard: tagesgespraech('pim-pinzette-tag-standard',
    [P('Hallo. Entschuldigung. Hallo. Das erste „Entschuldigung“ war Reflex.')],
    [P('Mir geht es gut. Wirklich. Gut im Sinne von „noch nicht zusammengebrochen“. Das zählt in meiner Abteilung als Spitzenleistung.')],
    M),
};

// ---------------------------------------------------------------------------------------------- Herz-Ereignisse

/** ♥2 (Bahnhof, morgens): Eine Schachtel fangen [Reflexe 3]. */
const he2 = dialog('he-pim-pinzette-2', [
  knoten('start', [
    erz('Pendlerverkehr am Bahnhof Mitte. Ein Kerl mit Ellenbogen wie Rammböcke drängelt zur Bahn – und rempelt Pim. Eine kleine Schachtel fliegt aus ihrer Hand, hoch, höher, öffnet sich im Flug.'),
    P('NEIN! Die Proben! Die winzigen! Die SEHR winzigen!', 'ueberrascht'),
  ], {
    choices: [
      { text: 'Hechten und die Schachtel in der Luft fangen.', check: pruefung('he-pim-2-fangen', 'reflexe', 3, ['springen']), next: 'gefangen', effects: [herz(ID, 50)] },
      { text: 'Dem Rempler hinterherbrüllen, bis er zurückkommt und mitsucht.', check: pruefung('he-pim-2-bruellen', 'koerper', 4, ['einschuechtern']), next: 'rempler', effects: [herz(ID, 40)] },
      { text: 'Auf die Knie und alles einsammeln. Teil für Teil.', next: 'sammeln', effects: [{ advanceTime: 20 }, herz(ID, 30)] },
    ],
  }),
  knoten('gefangen', [
    erz('Ein Sprung, ein Griff, ein schmerzhafter Kontakt mit dem Bahnsteig. Die Schachtel liegt geschlossen in deiner Hand. Kein Krümel fehlt.'),
    P('Sie … Sie haben … die ist nicht mal aufgegangen! Das ist physikalisch … okay, es ist physikalisch möglich, aber unwahrscheinlich! Sehr!', 'ueberrascht'),
  ], { next: 'ende' }),
  knoten('rempler', [
    erz('Dein Brüllen bringt den halben Bahnsteig zum Stehen. Der Rempler dreht um, wird klein und sucht mit. Auf den Knien. Mit einer Taschenlampe. Er entschuldigt sich bei jedem Splitter einzeln.'),
    P('Er hat sich bei mir entschuldigt. Bei MIR. Das ist mir noch nie passiert. Normalerweise entschuldige ich mich bei den Leuten, die mich umrennen.', 'signatur'),
  ], { next: 'ende' }),
  knoten('sammeln', [
    erz('Zwanzig Minuten, zwei Knie voller Bahnsteigdreck. Ihr findet alles: elf Mikrochips, so klein wie Sandkörner, und eine Schraube, die da vorher nicht war. Pim nimmt die Schraube trotzdem mit.'),
    P('Sie haben meine Bahn verpasst. Wegen mir. Ich meine, ich hab meine Bahn verpasst. Wegen der Proben. Und Sie sind geblieben. Warum sind Sie geblieben?', 'besorgt'),
    ich('Weil du sonst allein gesucht hättest.'),
    P('… Oh.', 'ueberrascht'),
  ], { next: 'ende' }),
  knoten('ende', [
    P('Wenn die weg gewesen wären, hätte Frau Zero mich … nicht gefeuert. Sie feuert nicht. Sie „versetzt in die Kühlkammer“. Für immer. Als Inventar.', 'besorgt'),
    P('Danke. Wirklich. Ich lad Sie mal zu Pommes ein. Am Lötkolben. Abends. Wenn ich frei hab. Ich hab nie frei. Aber ich nehm mir frei. Für Pommes.'),
  ], { effects: [flag('pim_schachtel'), { xp: 40 }] }),
]);

/** ♥4 (Imbiss, abends): Mikro-Roboterinsekt. */
const he4 = dialog('he-pim-pinzette-4', [
  knoten('start', [
    erz('Imbiss „Lötkolben“. Pim sitzt mit leuchtenden Augen vor einer Pappschale Pommes und einer Streichholzschachtel. Sie winkt dich hektisch heran.'),
    P('Schnell! Gucken Sie! Aber nicht zu nah, er ist schüchtern! Wie ich!', 'ueberrascht'),
    erz('In der Schachtel sitzt ein Käfer. Fingernagelgroß, aus Kupfer und Glas, mit Beinchen wie Haare. Er dreht sich um und winkt. Er WINKT.'),
    P('Das ist Krabbel. Ich hab ihn gebaut. Aus Ausschuss. In meinen Pausen. Ich hab keine Pausen, also in den Pausen, die ich mir genommen hab, ohne zu fragen.', 'signatur'),
    erz('Krabbel springt aus der Schachtel. Über den Tresen. In Richtung der Fritteuse. Pim gibt einen Laut von sich, den du noch nie von einem Menschen gehört hast.'),
  ], {
    choices: [
      { text: 'Pims Steuerring schnappen und ihn zurücklotsen.', check: pruefung('he-pim-4-steuern', 'technik', 4, ['drohne']), next: 'gesteuert', effects: [herz(ID, 50)] },
      { text: 'Die Hand vor die Fritteuse halten.', check: pruefung('he-pim-4-hand', 'reflexe', 4, ['springen']), next: 'hand', effects: [herz(ID, 40)] },
      { text: 'Einen Pommes vor ihn legen. Vielleicht mag er Salz.', next: 'pommes', effects: [herz(ID, 30)] },
    ],
  }),
  knoten('gesteuert', [
    erz('Ein Dreh am Ring, ein Tippen. Krabbel bremst eine Fingerbreite vor dem heißen Fett, dreht um und läuft dir den Arm hoch bis auf die Schulter. Er bleibt da sitzen. Er fühlt sich wohl.'),
    P('Er mag Sie. Er mag sonst niemanden. Er hat Frau Zero gebissen. Mit Kupfer. Das war … das war ein guter Tag.', 'signatur'),
  ], { next: 'ende' }),
  knoten('hand', [
    erz('Krabbel prallt gegen deine Handfläche, fällt auf den Rücken und strampelt empört. Deine Hand riecht jetzt nach Frittenfett. Krabbel auch.'),
    P('Sie haben ihn gerettet! Mit Ihrer HAND! Das war heiß! Ist Ihre Hand okay? Ist Krabbel okay? Ist irgendwer okay?', 'ueberrascht'),
  ], { next: 'ende' }),
  knoten('pommes', [
    erz('Krabbel bremst. Schnuppert, falls Kupferkäfer schnuppern können. Und klettert auf den Pommes, als wäre es ein Floß. Der Imbisswirt guckt, sagt nichts und berechnet einen Pommes extra.'),
    P('Er mag Salz! Das hab ich nicht eingebaut! Er entwickelt Vorlieben! Oh Gott, er wird erwachsen.', 'ueberrascht'),
  ], { next: 'ende' }),
  knoten('ende', [
    P('Wenn Sie ihn mal brauchen … für was Kleines … ein Schloss, eine Ritze, ein Kabel, das jemand versteckt hat … Krabbel krabbelt da rein. Er ist sehr neugierig. Wie Frau Zero. Nur netter.', 'signatur'),
    erz('Pim drückt dir einen winzigen Steuerring in die Hand. „Nur einmal. Er ist noch nicht so ausdauernd.“'),
  ], { effects: [flag('pim_mikroinsekt'), { checkBuff: { id: 'pim-krabbel', label: 'Krabbel krabbelt', value: 1, tags: ['beobachten', 'schloss', 'verstecke'] } }, { xp: 60 }] }),
]);

/** ♥6 (Imbiss, abends): Kopie der Labornotizen (Auftakt pers-pim-kleine-schrift, act2). */
const he6 = dialog('he-pim-pinzette-6', [
  knoten('start', [
    erz('Pim sitzt am hintersten Tisch des Imbiss, ohne Pommes. Das allein ist schon ein Alarmzeichen. Sie hält ein Comic-Heft fest, als würde es gleich wegfliegen.'),
    P('Setzen Sie sich. Bitte. Nicht so nah. Doch, so nah. Damit keiner hört.', 'besorgt'),
    P('Ich hab was getan. Was Dummes. Ich hab … Frau Zeros Notizen kopiert. Die von Labor null. Nur ein paar Seiten. Mit dem Handscanner. Unter dem Kittel. Ich hab so geschwitzt, dass der Scanner beschlagen ist.'),
    erz('Sie schiebt das Comic-Heft zu dir. Zwischen Seite zwölf und dreizehn: Ausdrucke, eng beschrieben, winzige Schrift. Formeln, Zeichnungen von Chips – und ein Wort, das immer wieder auftaucht. „Master“.'),
  ], {
    choices: [
      { text: '„Pim. Atme. Du hast das Richtige gemacht.“', check: pruefung('he-pim-6-ruhig', 'ausstrahlung', 5, ['trost']), next: 'ruhig', effects: [herz(ID, 50)] },
      { text: 'Die Notizen genau lesen.', check: pruefung('he-pim-6-lesen', 'technik', 5, ['terminal']), next: 'gelesen', effects: [herz(ID, 40)] },
      { text: 'Einfach zuhören, bis sie fertig ist.', next: 'zuhoeren', effects: [herz(ID, 40)] },
    ],
  }),
  knoten('ruhig', [
    erz('Pim atmet. Ein. Aus. Ihre Hände hören auf zu zittern. Ein bisschen.'),
    P('Das Richtige. Okay. Ich hab das Richtige gemacht. Ich sag mir das jetzt jeden Morgen. Vor dem Spiegel. Der Spiegel wird es auch glauben.', 'signatur'),
  ], { next: 'master' }),
  knoten('gelesen', [
    ich('„Konzentrationschip, Serie 10. Steuerbefehl ‚Master‘ priorisiert externe Anweisungen vor eigenen Entscheidungen.“ Pim … das ist kein Werbechip.'),
    P('Ich weiß. Ich WEISS. Deswegen schlaf ich nicht. Also, noch weniger als sonst.', 'besorgt'),
  ], { next: 'master' }),
  knoten('zuhoeren', [
    erz('Du sagst nichts. Pim redet. Zehn Minuten, ohne Punkt, ohne Entschuldigung. Über Petrischalen, über Labor null, über Nächte, in denen sie Stimmen durch die Lüftung hört. Als sie fertig ist, sieht sie dich überrascht an.'),
    P('Ich hab mich nicht ein einziges Mal entschuldigt. Haben Sie das gemerkt? Ich hab’s gemerkt. Entschuldigung. Jetzt doch.', 'ueberrascht'),
  ], { next: 'master' }),
  knoten('master', [
    P('Ich weiß nicht, was „Master“ ist. Frau Zero spricht das Wort aus wie einen Namen. Und wenn sie es sagt, hört das Ding in Labor null auf zu reden.', 'besorgt'),
    P('Behalten Sie die Kopien nicht. Das ist zu gefährlich. Ich behalte sie. In dem Comic. Wenn es so weit ist … wenn ich mehr rausholen kann, die richtigen Beweise … dann brauch ich Sie. Nicht jetzt. Später. Okay?'),
  ], {
    choices: [
      { text: '„Okay. Wenn es so weit ist, bin ich da.“', next: 'ende' },
      { text: '„Wenn dir einer was tut, kriegt er’s mit mir zu tun.“', next: 'drohung', effects: [herz(ID, 10)] },
    ],
  }),
  knoten('drohung', [P('Das ist das Netteste und Gruseligste, was mir je jemand gesagt hat. Danke.', 'signatur')], { next: 'ende' }),
  knoten('ende', [
    erz('Pim steckt das Comic-Heft unter den Kittel und bestellt dann doch noch Pommes. Zwei Portionen. Eine schiebt sie dir rüber, ohne ein Wort. Das ist mehr als jedes Danke.'),
  ], { effects: [flag('pim_labornotizen'), flag('geruecht_master_pim'), { xp: 90 }] }),
]);

// ♥8 und ♥10 samt Akt-2/3- und Nachspiel-Gesprächen: pim-akt23.ts.
const A23 = akt23(M);

// ---------------------------------------------------------------------------------------------- Figur

const pim: NpcDef = {
  id: ID,
  name: 'Pim Pinzette',
  unknownName: 'Frau im Laborkittel',
  portrait: ID,
  sprite: `${ID}-walk`,
  faction: 'unterstadt',
  romanceable: false,
  bio: 'Junge Laborassistentin bei Quantum, spült Petrischalen für Alesa Zero und sieht Dinge, die sie nicht sehen soll. Spricht leise und schnell und entschuldigt sich für alles. Isst abends Pommes am Imbiss „Lötkolben“.',
  gifts: {
    loves: ['pinzetten-set', 'alter-neurochip', 'aufzieh-roboter'],
    likes: ['datenkristall', 'logik-raetsel-modul', 'tai-chi-tee', 'comic-heft', 'echtobst-apfel', 'hofhonig'],
    dislikes: ['volt-limo', 'haarspray-deluxe'],
    hates: ['peilsender', 'magnet-stoerer', 'rostige-dose', 'virus-implantat'],
  },
  // Akt 1 wie act1.json; ab act2 tagsüber an der Werkbank im Quantum-Labor, im Nachspiel in „Nullpunkt“ (pim-akt23.ts).
  schedule: A23.schedule,
  heartEvents: [
    herzEreignis('he-pim-pinzette-2', 2, 'bahnhof-mitte', 'morgen'),
    herzEreignis('he-pim-pinzette-4', 4, 'schrottmarkt', 'abend'),
    herzEreignis('he-pim-pinzette-6', 6, 'schrottmarkt', 'abend'),
    herzEreignis('he-pim-pinzette-8', 8, 'eisenhof', 'tag', AKT2),
    herzEreignis('he-pim-pinzette-10', 10, 'schrottmarkt', 'tag', alle(AKT2, { seen: 'he-pim-pinzette-8' }, { act: 3 }, nicht(MASTER))),
  ],
  talk: [
    rede('pim-pinzette-tag-rivale', { rival: ID }),
    rede('pim-pinzette-tag-erstes', { not: { met: ID } }),
    ...A23.talk,
    rede('pim-pinzette-tag-zeit', alle(VOR_AKT2, { notFlag: 'pim_zeit_hinweis' }), 8),
    rede('pim-pinzette-tag-grundriss', alle(GRUNDRISS, { notFlag: 'pim_grundriss_kommentar' })),
    rede('pim-pinzette-tag-mittwoch', { weekday: 'mi' }),
    rede('pim-pinzette-tag-freitag', alle({ weekday: 'fr' }, { time: 'abend' })),
    rede('pim-pinzette-tag-vertraut', undefined, 5),
    rede('pim-pinzette-tag-morgen', { time: 'morgen' }),
    rede('pim-pinzette-tag-abend', { time: 'abend' }),
    rede('pim-pinzette-tag-standard'),
  ],
};

export const part: ContentPart = {
  npcs: { [ID]: pim },
  dialogues: sammle(
    T.rivale, T.erstes, T.zeit, T.grundriss, T.mittwoch, T.morgen, T.abend, T.freitag, T.vertraut, T.standard,
    he2, he4, he6, ...A23.dialogues,
  ),
};
