// side-wand-der-freiheit · „Wand der Freiheit“ (world.md §6.2 Nr. 31). Sina Spray, flutmauer, T (Fortsetzung in jedem Akt).
// Ein Bild für jede Crew-Figur → Motive sammeln (wer eine Figur gut genug kennt, ab ♥3, erzählt Sina davon) → Farbe
// besorgen (gc-126 Rostzähne-Lager an der Hafenkante oder 90 Cr) → Kamera am Mauerweg ausschalten (Hack-Minispiel der
// Zone, [Technik 5] am Wartungskasten oder Kessel ablenken) → nachts sprühen (akt-graffiti je Bild, 60 XP).
// Nach 6 Bildern: Ruf unterstadt +15, Sina ♥ +60, Abspannbild (Flag abspann_wand_der_freiheit). Weitere Bilder bleiben möglich.
// Akt 2 (Fortsetzung `side-wand-der-freiheit-grau`): Ist die Akt-1-Quest erledigt, hat Quantum die Wand beim nächsten
// Besuch der Flutmauer übermalt (onEnter `wand-quantum-grau`, Flag `wand_uebermalt`, Sina ruft vorher an). Jedes gemalte
// Bild wird grau (`wand_grau_<npc>`, `wand_bild_<npc>` aus), `abspann_wand_der_freiheit` fällt weg. Neue Farbe (Hehler 150 Cr,
// Quantums Farbwagen [Straße 6] oder – nach side-rostzaehne-ende – Bolles Malerbetrieb im alten Rostzahn-Lager), neue
// Kamera blind machen (Hack, [Technik 7], [Reflexe 6] Linse zusprühen), dann nachts neu sprühen (`wand_neu_<npc>` setzt
// auch `wand_bild_<npc>` wieder). Nach 6 neuen Bildern gilt `abspann_wand_der_freiheit` wieder.
import type { ContentPart } from '../../part';
import type {
  Condition, DialogueChoice, DialogueDef, DialogueNode, NewsDef, PhoneMessageDef, QuestDef,
} from '../../../modules/contracts';
import {
  VEX, VEXARIA_ROM, active, all, any, atLeast, ch, chk, dlg, done, flag, hearts, herz, inactive, item, l, msg, n, noFlag,
  node, not, p, set,
} from './_q';

const Q = 'side-wand-der-freiheit';
const SI = 'sina-spray';
const FARBE = 'wand_farbe';
const KAMERA_AUS = any(flag('mauer_kamera_gehackt'), flag('wand_kamera_technik'), flag('wand_kessel_abgelenkt'));
const LAEUFT = any(active(Q), done(Q));

// Akt 2: Quantum übermalt, Neumalen.
const Q2 = 'side-wand-der-freiheit-grau';
const ABSPANN = 'abspann_wand_der_freiheit';
const UEBERMALT = 'wand_uebermalt';
const FARBE2 = 'wand2_farbe';
const KAMERA2_AUS = any(flag('wand2_kamera_gehackt'), flag('wand2_kamera_technik'), flag('wand2_kamera_zugesprueht'));
const LAEUFT2 = any(active(Q2), done(Q2));
/** Genau Akt 2 ({ act } heißt „mindestens“). */
const NUR_AKT2: Condition = all({ act: 2 }, not({ act: 3 }));
const GRAU_FAELLIG: Condition = all(NUR_AKT2, done(Q), noFlag(UEBERMALT), noFlag('epilog'));
const ROSTZ_WEG = flag('rostzaehne_aufgeloest');

interface Motiv {
  npc: string;
  name: string;
  /** Wann Sina das Motiv aufnimmt (Standard ♥3 bei der Figur). */
  kennt?: Condition;
  tag: string;
  frage: string;
  wahl: [string, string][];
}

const MOTIVE: Motiv[] = [
  {
    npc: 'hunter', name: 'Hunter', tag: '[Hunter ♥3]',
    frage: 'Hunter? Der Chef vom High Voltage? Ich hab ihn einmal lächeln sehen. Es war ein Gerücht. Was soll an die Wand?',
    wahl: [
      ['„Hunter auf einem Barhocker wie auf einem Thron. Sonnenbrille. Seidenhemd. Und darunter: SCHULDEN MUSS MAN BEGLEICHEN.“', 'Thron. Schriftzug. Mit Goldrand. Er wird es hassen und jeden Tag hingehen und gucken.'],
      ['„Hunter mit einer Nougatbombe in der Hand. Und einem Gesicht, als würde er gerade die Liebe seines Lebens treffen.“', 'Hunter als Diva. Ha! Das ist Hochverrat. Ich liebe Hochverrat.'],
    ],
  },
  {
    npc: 'raven', name: 'Raven', tag: '[Raven ♥3]',
    kennt: any(hearts('raven', 3), done('side-alte-gewohnheiten')),
    frage: 'Raven. Die Einbrecherin. Ich hab sie mal auf dem Dach gesehen. Sie hat mich angeschaut, als wüsste sie, wo ich meine Dosen verstecke. Wusste sie.',
    wahl: [
      ['„Ein schwarzer Rabe, der eine Handschelle sprengt. Die Kette fliegt in Stücke wie Konfetti.“', 'Rabe, Kette, Konfetti. Schwarz auf Beton, und die Kette in Silber. Oh, das wird gut.'],
      ['„Ein kleiner Rabe aus Lippenstift. Drei Striche. Elegant. Frech. Kussecht.“', 'Wie auf dem Spiegel im Penthouse? Ja, ich hab davon gehört. Die ganze Unterstadt hat davon gehört. Das MUSS an die Wand.'],
    ],
  },
  {
    npc: 'dante', name: 'Dante', tag: '[Dante ♥3]',
    frage: 'Dante? Der Plattenmann mit den Keksen? Ich hab mal ein Graffiti von ihm gesehen. Da stand „Ich war hier“, aber in Morsecode.',
    wahl: [
      ['„Dante an einem Plattenteller. Die Platte ist ein riesiger Keks. Drei-Sekunden-Regel.“', 'Ein Keks als Schallplatte. Mit Krümeln, die wie Noten fliegen. Das ist so dumm, dass es genial ist.'],
      ['„Ein Faxgerät mit Flügeln, das über die Stadt fliegt und Herzen faxt.“', 'Ein fliegendes Faxgerät. Ich weiß nicht mal, wie ein Faxgerät aussieht. Ich mal einfach einen Toaster mit Gefühlen.'],
    ],
  },
  {
    npc: 'vega', name: 'Vega', tag: '[Vega ♥3]',
    frage: 'Vega, die Scharfschützin. Die hat mir mal aus hundert Metern die Dose aus der Hand geschossen. Ich hab mich bedankt. Sie hat genickt.',
    wahl: [
      ['„Vega mit Fernrohr. Und durch das Fernrohr: die Stadt als Sternbild.“', 'Die Stadt als Sternbild. Die Neonreklamen als Sterne. Das wird das schönste Bild an der Wand.'],
      ['„Ein einzelnes Fadenkreuz. Und darin eine kleine Pflanze.“', 'Fadenkreuz mit Pflanze. Klein. Leise. Präzise. Genau wie sie.'],
    ],
  },
  {
    npc: 'aria', name: 'Aria', tag: '[Aria ♥3]',
    frage: 'Aria! Die Brecherin! Die hat letzte Woche einem Rostzahn mit dem Schläger die Mütze vom Kopf gehauen, ohne den Kopf zu treffen. Kunst. Reine Kunst.',
    wahl: [
      ['„Aria, wie sie schreit. Schläger hoch, roter Stern auf der Brust. So laut, dass die Farbe wackelt.“', 'Schrei in Rot. Schläger in Silber. Die Zöpfe als Blitze. Ja. JA.'],
      ['„Der Zerberster, zur Faust geballt. Und um die Faust herum: lauter kleine Kabelbrand-Sterne.“', 'Eine Faust aus Stahl, umringt von Sternen. Stark und zärtlich gleichzeitig. Sag ihr nicht, dass ich zärtlich gesagt hab.'],
    ],
  },
  {
    npc: 'nyra', name: 'Nyra', tag: '[Nyra ♥3]',
    frage: 'Nyra, die kleine Hackerin? Die sitzt abends hier auf der Bank und guckt aufs Meer. Ich glaub, sie hat mir mal das Telefon gehackt. Ich hatte danach nur noch Meeresrauschen als Klingelton.',
    wahl: [
      ['„Nyra mit Laptop auf den Knien. Hinter ihr das Meer. Das echte. Blau.“', 'Blau. Ich hab kaum noch Blau. Für Nyra krieg ich es irgendwie hin.'],
      ['„Ein Engel aus Leiterbahnen. Mit Flügeln aus Code.“', 'Silent-Angel. Natürlich weiß ich, wer Silent-Angel ist. Jeder hier weiß das. Nur sie glaubt, es sei geheim.'],
    ],
  },
  {
    npc: 'jimmy', name: 'Jimmy', tag: '[Jimmy ♥3]',
    frage: 'Jimmy? Der Jimmy? Mit dem Chip? Die Leute sagen, der ist durch. Vega sagt, der berappelt sich. Was sagst du?',
    wahl: [
      ['„Jimmy, wie er lacht. Aus seinem Kopf sprühen Funken. Darunter: ER BERAPPELT SICH.“', 'Funken und ein Lachen. Und ein Satz, den man hier unten öfter sagen sollte.'],
      ['„Ein kaputter Chip, aus dem eine Blume wächst.“', 'Chip mit Blume. Das versteht hier jeder. Und keiner sagt es laut.'],
    ],
  },
  {
    npc: 'captain-kuschel', name: 'Captain Kuschel', tag: '[Captain Kuschel ♥3]',
    frage: 'Captain Kuschel. Der Hase. Mit Kapitänsmütze. Ich hab gehört, er ist der eigentliche Chef der Crew. Stimmt das?',
    wahl: [
      ['„Captain Kuschel am Steuer eines Floßes aus Nougatbomben. Kurs: Horizont.“', 'Ein Hase auf einem Floß aus Süßkram. Das Meer ist aus Limo. Wer sagt, Kunst muss ernst sein?'],
      ['„Captain Kuschel, riesengroß, wie er die Stadt umarmt.“', 'Ein Hase, so groß wie das Viertel, der alle festhält. Gott, ich werd sentimental. Gib mir eine Dose.'],
    ],
  },
];

const motivFlag = (npc: string) => `wand_motiv_${npc}`;
const bildFlag = (npc: string) => `wand_bild_${npc}`;
const kennt = (m: Motiv): Condition => m.kennt ?? hearts(m.npc, 3);
const BILDER = MOTIVE.map(m => flag(bildFlag(m.npc)));
const EIN_MOTIV = any(...MOTIVE.map(m => flag(motivFlag(m.npc))));
const SECHS = atLeast(6, BILDER);
const grauFlag = (npc: string) => `wand_grau_${npc}`;
const neuFlag = (npc: string) => `wand_neu_${npc}`;
const SECHS_NEU = atLeast(6, MOTIVE.map(m => flag(neuFlag(m.npc))));

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: 'Wand der Freiheit',
  summary: 'Sina Spray will ein Bild für jede Figur aus Hunters Crew an die Wand der Freiheit sprühen. Sie braucht Motive, Farbe und eine blinde Kamera.',
  giver: SI,
  act: 1,
  steps: [
    {
      id: 'motive', text: 'Erzähl Sina von den Leuten aus der Crew (wer dich gut genug kennt, ab ♥3, gibt ein Motiv her).',
      done: EIN_MOTIV, marker: { map: 'flutmauer', at: [1150, 245] },
    },
    {
      id: 'farbe', text: 'Besorg Farbe: im Lager der Rostzähne an der Hafenkante oder für 90 Cr bei Sina.',
      done: flag(FARBE), marker: { map: 'hafenkante', at: [82, 760] },
    },
    {
      id: 'kamera', text: 'Schalte die Ordnungsdienst-Kamera am Mauerweg aus – hacken, kurzschließen oder Wachtmeisterin Kessel (abends am Bahnhofskiosk) ablenken.',
      done: KAMERA_AUS, marker: { map: 'flutmauer', at: [1350, 240] },
    },
    {
      id: 'bilder', text: 'Sprüh nachts mit Sina sechs Bilder an die Wand der Freiheit.',
      when: all(EIN_MOTIV, flag(FARBE), KAMERA_AUS), done: SECHS, marker: { map: 'flutmauer', at: [1150, 245] },
    },
  ],
  reward: {
    rep: { unterstadt: 15 }, relations: { [SI]: 60 },
    effects: [set(ABSPANN), { message: 'Sechs Bilder an der Wand der Freiheit. Wer an der Flutmauer vorbeigeht, bleibt stehen.' }],
  },
};

const quest2: QuestDef = {
  id: Q2,
  kind: 'side',
  title: 'Wand der Freiheit: Grau ist keine Farbe',
  summary: 'Quantum hat die Wand der Freiheit „neutralisiert“. Alles grau, bis in die letzte Fuge. Sina will die Crew zurück an die Wand. Größer.',
  giver: SI,
  act: 2,
  steps: [
    {
      id: 'farbe', text: 'Besorg neue Farbe: Sinas Hehler (150 Cr), Quantums Farbwagen auf der Mauerkrone (tagsüber) oder – wenn die Rostzähne Geschichte sind – Bolles Malerbetrieb im alten Lager an der Hafenkante.',
      done: flag(FARBE2), marker: { map: 'flutmauer', at: [1250, 262] },
    },
    {
      id: 'kamera', text: 'Mach die neue Quantum-Kamera am Mauerweg blind: hacken, [Technik 7] am Kasten oder [Reflexe 6] die Linse zusprühen (mit Farbe).',
      done: KAMERA2_AUS, marker: { map: 'flutmauer', at: [1350, 240] },
    },
    {
      id: 'bilder', text: 'Sprüh nachts mit Sina sechs Bilder neu an die Wand der Freiheit. Größer als vorher.',
      when: all(flag(FARBE2), KAMERA2_AUS), done: SECHS_NEU, marker: { map: 'flutmauer', at: [1150, 245] },
    },
  ],
  reward: {
    xp: 250, rep: { unterstadt: 10 }, relations: { [SI]: 40 },
    effects: [set(ABSPANN), { message: 'Sechs neue Bilder an der Wand der Freiheit. Quantum hat gestrichen. Die Wand hat zurückgeschrien.' }],
  },
};

// ---------------------------------------------------------------------------------------------- Sina

function motivNodes(): { choices: DialogueChoice[]; nodes: DialogueNode[] } {
  const choices: DialogueChoice[] = [];
  const nodes: DialogueNode[] = [];
  for (const m of MOTIVE) {
    choices.push(ch(`Von ${m.name} erzählen.`, `motiv-${m.npc}`, {
      tag: m.tag, requires: kennt(m), when: noFlag(motivFlag(m.npc)),
    }));
    const wahl: DialogueChoice[] = m.wahl.map(([text], i) => ch(text, `motiv-${m.npc}-${i}`, {
      effects: [set(motivFlag(m.npc)), set(`${motivFlag(m.npc)}_${i + 1}`)],
    }));
    if (m.npc === 'aria') {
      wahl.push(ch('„Zwei Zöpfe und ein Kurierriemen. Ineinander verheddert. Und keiner von beiden will sich losmachen.“', 'motiv-aria-vex', {
        when: VEXARIA_ROM, effects: [set(motivFlag('aria')), set(`${motivFlag('aria')}_vex`)],
      }));
    }
    nodes.push(node(`motiv-${m.npc}`, [l(SI, m.frage, 'neutral')], { choices: wahl }));
    m.wahl.forEach(([, antwort], i) => nodes.push(node(`motiv-${m.npc}-${i}`, [l(SI, antwort, 'freude')], { next: 'menue' })));
  }
  nodes.push(node('motiv-aria-vex', [
    l(SI, 'Oh. OH. Ich seh schon. Und ich seh, wie du dabei guckst.', 'freude'),
    l(SI, 'Ich sprüh es klein. Ganz unten links, wo Liebespaare ihre Namen hinschreiben. Nur wer genau hinschaut, sieht, wer da verheddert ist.', 'signatur'),
    p('Wenn Aria fragt: Das war deine Idee.'),
    l(SI, 'Wenn Aria fragt, sag ich, die Wand hat es sich gewünscht.', 'freude'),
  ], { next: 'menue' }));
  return { choices, nodes };
}

const motive = motivNodes();

const sina: DialogueDef = dlg('wand-sina', [
  node('start', [
    n('Vor der Wand der Freiheit steht eine Frau mit Atemmaske um den Hals, Farbe bis zu den Ellbogen und einem Eimer voller leerer Dosen. Sie tritt drei Schritte zurück, legt den Kopf schief und seufzt.'),
    l(SI, 'Hier unten malt man, was man oben nicht sagen darf. Und keiner hat mehr was zu sagen. Alle starren nur noch auf Chrome-Werbung.', 'trauer'),
    l(SI, 'Sina. Sina Spray. Ja, das ist mein echter Name. Nein, ist er nicht.', 'signatur'),
  ], {
    choices: [
      ch('„Was willst du malen?“', 'idee'),
      ch('„Viel Spaß beim Malen.“'),
    ],
  }),
  node('idee', [
    l(SI, 'Die Leute von Hunter. Die Crew. Die sind die einzigen hier unten, die noch so tun, als könnten sie was ändern. Jeder kriegt ein Bild. Groß. Bunt. Illegal.', 'freude'),
    l(SI, 'Aber ich kenn sie nicht. Nicht richtig. Du schon, oder? Erzähl mir von ihnen. Was soll an die Wand? Das, was sie sind, nicht das, was sie zeigen.', 'neutral'),
    l(SI, 'Dann brauch ich Farbe. Meine ist alle. Und die Kamera am Mauerweg muss blind sein, sonst sitz ich morgen bei Kessel. Schon wieder.', 'besorgt'),
  ], { effects: [{ startQuest: Q }], next: 'menue' }),
  node('menue', [l(SI, 'Und? Wen hast du mir mitgebracht?', 'neutral')], {
    choices: [
      ...motive.choices,
      ch('Farbe kaufen (90 Cr).', 'farbe-kauf', { when: noFlag(FARBE), requires: { credits: 90 }, effects: [{ credits: -90 }, set(FARBE)] }),
      ch('„Wie läuft’s mit der Wand?“', 'stand'),
      ch('„Bis später, Sina.“'),
    ],
  }),
  node('farbe-kauf', [
    l(SI, 'Neunzig Credits für einen Eimer Dosen. Du hast gerade die Kunst finanziert. Dein Name kommt auf keine Liste. Aber in mein Herz.', 'freude'),
  ], { next: 'menue' }),
  node('stand', [
    l(SI, 'Motive sammeln, Farbe besorgen, Kamera blenden. Und dann nachts: sprühen. Ich bin nachts immer hier. Die Wand schläft nie, und ich auch nicht.', 'signatur'),
  ], { next: 'menue' }),
  ...motive.nodes,
]);

// ---------------------------------------------------------------------------------------------- Sprühen

const spruehen: DialogueDef = dlg('wand-spruehen', [
  node('start', [
    n('Nacht an der Flutmauer. Das Meer rauscht im Dunst, die Kamera am Mauerweg zeigt ins Leere. Sina schüttelt zwei Dosen gleichzeitig, wie Rasseln.'),
    l(SI, 'Wen malen wir heute?', 'freude'),
  ], {
    choices: [
      ...MOTIVE.map(m => ch(`${m.name}.`, undefined, {
        when: all(flag(motivFlag(m.npc)), noFlag(bildFlag(m.npc))),
        effects: [{
          minigame: 'akt-graffiti', level: 2, key: `wand-bild-${m.npc}`, label: `Wand der Freiheit: ${m.name}`,
          win: [set(bildFlag(m.npc)), { xp: 60 }, herz(SI, 10), herz(m.npc, 20), { advanceTime: 60 },
            { message: `${m.name} prangt jetzt an der Wand der Freiheit. Morgen bleiben die Leute davor stehen.` }],
          lose: [{ advanceTime: 30 }, { message: 'Tropfnasen, schiefer Schwung, ein Gesicht wie eine Kartoffel. Sina rollt mit den Augen. „Übermalen. Morgen noch mal.“' }],
        }],
      })),
      ch('Heute nicht.'),
    ],
  }),
]);

// ---------------------------------------------------------------------------------------------- Farbe, Kamera, Kessel

const lager: DialogueDef = dlg('wand-rostzaehne-lager', [
  node('start', [
    n('Hinter einem Container hat die Rostzähne-Gang ein Lager: Kanister, gestohlene Reifen, ein Sofa ohne Beine. Und eine Kiste Sprühdosen, die sie für ihre Revier-Tags benutzen.'),
  ], {
    choices: [
      ch('Rausfinden, wann hier keiner aufpasst, und die Kiste mitnehmen.', 'geklaut', { check: 'gc-126' }),
      ch('Lieber Farbe bei Sina kaufen.'),
    ],
  }),
  node('geklaut', [
    n('Ein Rostzahn am Kai erzählt jedem, der zuhört, dass der Lagerwächter um diese Zeit immer am Fischstand Krabben klaut. Du wartest, bis er da ist.'),
    n('Die Kiste ist schwer. Die Farben: Neonpink, Giftgrün, Rostzahn-Rot, ein einziges Blau. Morgen sprühen die Rostzähne mit Kreide.'),
  ], { effects: [set(FARBE), { rep: 'rostzaehne', delta: -5 }] }),
]);

const kessel: DialogueDef = dlg('wand-kessel', [
  node('start', [
    n('Wachtmeisterin Kessel steht am Bahnhofskiosk, einen Becher Synth-Kaffee in der Hand und die Strichliste unter dem Arm. Sie macht einen Strich. Für den Kaffee.'),
    l('wache', 'Feierabend ist, wenn die Liste voll ist. Die Liste ist nie voll. Was wollen Sie?', 'neutral'),
  ], {
    choices: [
      ch('Ihr eine signierte Autogrammkarte von Collin Charleston schenken.', 'collin', {
        requires: item('autogrammkarte-collin'), effects: [{ take: 'autogrammkarte-collin' }],
      }),
      ch('Ihr eine Nougatbombe hinstellen. „Für die Nachtschicht.“', 'nougat', {
        requires: item('nougatbombe'), effects: [{ take: 'nougatbombe' }],
      }),
      ch('„Nichts. Schönen Abend.“'),
    ],
  }),
  node('collin', [
    l('wache', 'Ist das … „Für meine liebe Wachtmeisterin“? Er hat meinen Namen … er hat …', 'ueberrascht'),
    n('Kessel drückt die Karte an die Brust. Dann räuspert sie sich dienstlich.'),
    l('wache', 'Die Kamera an der Flutmauer ist übrigens seit Wochen auf Wartung. Steht in meiner Liste. Wenn da nachts jemand malt, seh ich das erst nächsten Monat. Vorschrift.', 'signatur'),
  ], { effects: [set('wand_kessel_abgelenkt'), herz('wache', 30)] }),
  node('nougat', [
    l('wache', 'Bestechung im Dienst ist verboten.', 'neutral'),
    n('Sie isst die Nougatbombe. Langsam. Mit geschlossenen Augen. Danach macht sie einen Strich auf der Liste.'),
    l('wache', 'Ich hab gerade beschlossen, dass ich heute Nacht die Kamera an der Flutmauer nicht kontrolliere. Und morgen auch nicht. Ich hoffe, wir sehen uns nicht wieder.', 'freude'),
  ], { effects: [set('wand_kessel_abgelenkt'), herz('wache', 15)] }),
]);

// ---------------------------------------------------------------------------------------------- Akt 2: Quantum übermalt

const telGrau: PhoneMessageDef = {
  id: 'tel-sina-wand-grau',
  from: SI,
  text: 'Sina hier. Die Wand. Die haben die Wand grau gemacht. ALLES. Hunter, Captain Kuschel, alle weg. Komm zur Flutmauer. Bring Wut mit, ich hab genug für zwei.',
  auto: GRAU_FAELLIG,
  replies: [{ text: 'Bin unterwegs.' }, { text: 'Diese Wichser.' }],
};

const grau: DialogueDef = dlg('wand-grau', [
  node('start', [
    n('Die Wand der Freiheit ist grau. Nicht dreckig-grau, nicht Beton-grau. Quantum-Grau: matt, gleichmäßig, mit der Rolle bis in die letzte Fuge gestrichen. Zwanzig Meter Nichts.'),
    n('Mitten auf dem Grau klebt ein weißes Schild mit Q-Logo: „SAUBERE STADT, SAUBERE KÖPFE. Diese Fläche wurde im Rahmen von Chrome 10 kostenfrei für Sie neutralisiert. Quantum dankt für Ihr Verständnis.“'),
    n('Davor sitzt Sina Spray auf einem leeren Eimer und kratzt mit dem Fingernagel an der Farbe. Darunter ist nichts mehr. Die haben erst abgestrahlt und dann gestrichen.'),
    l(SI, '„Neutralisiert.“ Hunter. Raven. Captain Kuschel. Alle neutralisiert. Mit der Rolle. Wie einen Rotweinfleck auf der Tischdecke.', 'wut'),
    l(SI, 'Und weißt du, was das Schlimmste ist? Die Leute bleiben nicht mehr stehen. Die gucken auf ihr Handy, wo Chrome 10 läuft, und latschen weiter.', 'trauer'),
  ], {
    choices: [
      ch('„Dann malen wir sie neu. Größer.“', 'neu'),
      ch('„Quantum hat dir gerade eine Kriegserklärung geschickt. Mit Rolle.“', 'neu'),
      ch('„Gib mir eine Dose. Ich sprüh denen ihr Logo auf den eigenen Arsch.“', 'neu', { when: VEX }),
    ],
  }),
  node('neu', [
    l(SI, 'Größer. Ja. Größer und lauter und so bunt, dass es denen in den Augen brennt.', 'freude'),
    l(SI, 'Aber die haben meinen Vorrat kassiert. Alles. Sogar das eine Blau. Und am Mauerweg hängt jetzt eine neue Kamera. Weiß, rund, mit Gesichtserkennung. Die erkennt sogar mich mit Maske. Ich hab’s ausprobiert. Sie hat „Guten Abend, Sina“ gesagt.', 'besorgt'),
    l(SI, 'Farbe krieg ich bei einem Hehler, aber der Halsabschneider will hundertfünfzig. Oder wir nehmen Quantums eigene: Deren Putzkolonne lässt tagsüber ihren Farbwagen hier oben stehen. Grau ist nur Weiß mit schlechter Laune. Ich misch da was rein.', 'signatur'),
  ], {
    choices: [
      ch('„Und die Rostzähne? Die hatten doch Farbe.“', 'maler', { when: ROSTZ_WEG }),
      ch('„Wir holen sie zurück. Alle.“', 'ende'),
    ],
  }),
  node('maler', [
    l(SI, 'Die Rostzähne gibt’s nicht mehr. Dank dir, hab ich gehört. Aber Bolle, der Vize, hat mit drei von den Jungs im alten Lager einen Malerbetrieb aufgemacht. Ganz legal. Fast.', 'freude'),
    l(SI, 'Die streichen jetzt Wohnungen und sind ziemlich stolz drauf. Frag die. Die schulden dem Hafen was. Und dir sowieso.', 'signatur'),
  ], { next: 'ende' }),
  node('ende', [
    l(SI, 'Hol Farbe. Mach die Kamera blind. Und dann, eines Nachts, gehört die Wand wieder uns.', 'signatur'),
  ]),
]);

const sina2Choices: DialogueChoice[] = [
  ...motive.choices,
  ch('Farbe vom Hehler kaufen (150 Cr).', 'farbe-kauf', {
    when: all(active(Q2), noFlag(FARBE2)), requires: { credits: 150 }, effects: [{ credits: -150 }, set(FARBE2)],
  }),
  ch('„Wo krieg ich sonst Farbe her?“', 'farbe-wege', { when: all(active(Q2), noFlag(FARBE2)) }),
  ch('„Und die neue Kamera?“', 'kamera', { when: all(active(Q2), not(KAMERA2_AUS)) }),
  ch('„Wie viele noch?“', 'stand', { when: active(Q2) }),
  ch('„Und? Wie fühlt sich die Wand an?“', 'fertig', { when: done(Q2) }),
  ch('„Bis später, Sina.“'),
];

const sina2: DialogueDef = dlg('wand2-sina', [
  node('start', [
    n('Sina steht vor der Wand, eine Dose in jeder Hand, und starrt das Grau an, als könnte sie es mit Blicken abkratzen.'),
    l(SI, 'Grau. Ich träum schon in Grau. Sag mir was Buntes.', 'neutral'),
  ], { choices: sina2Choices }),
  node('menue', [l(SI, 'Noch was? Wen holen wir zurück?', 'neutral')], { choices: sina2Choices }),
  node('farbe-kauf', [
    n('Sina tippt eine Nummer ins Handy, sagt „Das Übliche“ und „Nein, nicht Grau, du Pfeife“ und legt auf. Eine Stunde später steht ein Karton hinter der Bank.'),
    l(SI, 'Hundertfünfzig. Der Typ ist ein Halsabschneider. Aber er hat Blau. ZWEI Blau.', 'freude'),
  ], { next: 'menue' }),
  node('farbe-wege', [
    l(SI, 'Quantums Putzkolonne parkt tagsüber ihren Farbwagen hier oben auf der Mauerkrone. Die gucken nur auf ihre Pause. Wer flinke Finger hat, hat Grundierung.', 'signatur'),
    l(SI, 'Und wenn die Rostzähne wirklich weg sind: Bolle streicht jetzt im alten Lager an der Hafenkante. Mit Rechnung und allem.', 'neutral'),
  ], { next: 'menue' }),
  node('kamera', [
    l(SI, 'Die neue ist schlauer als die alte. Gesichtserkennung, Funk, ein Gehäuse wie ein Ei. Der Kasten unten am Mast ist trotzdem derselbe Schrott wie immer.', 'besorgt'),
    l(SI, 'Hacken, kurzschließen, oder du sprühst ihr einfach die Linse zu. Schnell. Bevor sie „Guten Abend“ sagt.', 'signatur'),
  ], { next: 'menue' }),
  node('stand', [
    l(SI, 'Sechs. Mindestens. Und diesmal so groß, dass die Putzkolonne eine Leiter braucht. Eine lange. Mit Höhenangst.', 'freude'),
  ], { next: 'menue' }),
  node('fertig', [
    l(SI, 'Die Leute bleiben wieder stehen. Gestern hat ein Quantum-Typ in weißer Jacke eine Viertelstunde vor Captain Kuschel gestanden. Dann hat er sein Namensschild abgemacht und ist gegangen.', 'freude'),
    l(SI, 'Die streichen wieder. Ganz sicher. Und ich mal wieder. Runde dreiundvierzig. Ich gewinne.', 'signatur'),
  ], { next: 'menue' }),
  ...motive.nodes,
]);

const spruehen2: DialogueDef = dlg('wand2-spruehen', [
  node('start', [
    n('Nacht an der grauen Wand. Die neue Kamera am Mauerweg schaut ins Leere. Sina klopft auf den Quantum-Anstrich wie auf ein frisch gespanntes Fell.'),
    l(SI, 'Saubere Grundierung. Danke, Quantum, ihr Arschlöcher. Wen holen wir zurück?', 'freude'),
  ], {
    choices: [
      ...MOTIVE.map(m => ch(`${m.name}.`, undefined, {
        when: all(flag(motivFlag(m.npc)), noFlag(neuFlag(m.npc))),
        effects: [{
          minigame: 'akt-graffiti', level: 3, key: `wand-neu-${m.npc}`, label: `Wand der Freiheit: ${m.name}, größer`,
          win: [set(neuFlag(m.npc)), set(bildFlag(m.npc)), set(grauFlag(m.npc), false), { xp: 60 }, herz(SI, 10), herz(m.npc, 15),
            { advanceTime: 60 }, { message: `${m.name} ist zurück an der Wand. Größer als vorher. Quantum hat ein Problem mehr.` }],
          lose: [{ advanceTime: 30 }, { message: 'Zu hastig, zu dünn, zu grau. Sina rollt drüber. „Morgen. Und diesmal mit Gefühl.“' }],
        }],
      })),
      ch('Heute nicht.'),
    ],
  }),
]);

const malerbetrieb: DialogueDef = dlg('wand2-malerbetrieb', [
  node('start', [
    n('Wo früher das Rostzahn-Lager war, hängt ein frisch gestrichenes Schild: „BOLLE & JUNGS – MALERBETRIEB. Wir streichen alles. Außer Schutzgeld.“'),
    n('Bolle, der ehemalige Vize, steht in einem Overall voller Farbspritzer vor einer Palette Eimer. Neonpink, Giftgrün, Rostzahn-Rot. Und Blau.'),
    n('„Du. Scheiße. Du bist das.“ Er wischt sich die Hände an der Hose ab. „Was willst du? Wir sind jetzt ehrlich. Mit Rechnung. Ich hab sogar einen Stempel.“'),
  ], {
    choices: [
      ch('„Farbe. Für die Wand der Freiheit. Quantum hat sie grau gemacht.“', 'wand'),
      ch('„Nichts. Schöner Stempel.“'),
    ],
  }),
  node('wand', [
    n('„Grau? Die ganze Wand?“ Bolle starrt dich an. „Da war unser Zahn drauf. Ganz unten rechts. Den haben die auch weg?“'),
    n('Er schiebt dir zwei Eimer und einen Karton Dosen rüber. „Nimm. Geht aufs Haus. Sag Sina, unten rechts ist noch Platz für einen kleinen Zahn. Einen netten. Mit Pinsel.“'),
  ], { effects: [set(FARBE2), herz(SI, 5), { rep: 'unterstadt', delta: 3 }, msg('Farbe von Bolles Malerbetrieb. Gratis. Mit Stempel.')] }),
]);

const news2: NewsDef = {
  id: 'news-side-wand-grau',
  anchor: 'delya-delloraine',
  headline: 'Graue Wand, bunte Antwort',
  when: done(Q2),
  priority: 2,
  lines: [
    l('delya-delloraine', 'Quantum hat die Wand der Freiheit an der Flutmauer „neutralisiert“. Drei Nächte später war sie wieder bunt. Größer. Lauter. Die Kamera daneben zeigt seitdem nur eine Möwe.', 'freude'),
    l('collin-charleston', 'Ein Quantum-Sprecher nennt die Bilder „visuelle Verschmutzung“. Die Verschmutzung hat inzwischen einen eigenen Fanclub.', 'signatur'),
  ],
};

const farbwagen = chk('wand2-farbwagen', 'strasse', 6, ['verstecke', 'geruecht']);
const kamera2Technik = chk('wand2-kamera-kurzschluss', 'technik', 7, ['hacken', 'drohne']);
const kamera2Spruehen = chk('wand2-kamera-zuspruehen', 'reflexe', 6, ['schleichen']);

const kameraTechnik = chk('wand-kamera-kurzschluss', 'technik', 5, ['hacken', 'drohne']);

export const part: ContentPart = {
  quests: { [Q]: quest, [Q2]: quest2 },
  dialogues: {
    [sina.id]: sina, [spruehen.id]: spruehen, [lager.id]: lager, [kessel.id]: kessel,
    [grau.id]: grau, [sina2.id]: sina2, [spruehen2.id]: spruehen2, [malerbetrieb.id]: malerbetrieb,
  },
  phone: { [telGrau.id]: telGrau },
  news: { [news2.id]: news2 },
  mapAdditions: {
    flutmauer: {
      onEnter: [
        // Quantum übermalt: erst die Szene, dann wird jedes gemalte Bild grau (Auslöser laufen nacheinander).
        { id: 'wand-quantum-grau', when: GRAU_FAELLIG, effects: [set(UEBERMALT), set(ABSPANN, false), { startQuest: Q2 }], dialogue: grau.id },
        ...MOTIVE.map(m => ({
          id: `wand-grau-${m.npc}`,
          when: all(flag(UEBERMALT), flag(bildFlag(m.npc)), noFlag(neuFlag(m.npc))),
          effects: [set(grauFlag(m.npc)), set(bildFlag(m.npc), false)],
        })),
      ],
      barks: [
        { text: 'Wer hat die Wand grau gemacht? Sieht aus wie mein Kontoauszug.', when: all(flag(UEBERMALT), not(done(Q2))) },
        { text: 'Quantum nennt das „neutralisiert“. Ich nenn das Kunstraub mit Rolle.', when: all(flag(UEBERMALT), not(done(Q2))) },
        { text: 'Die Wand ist wieder bunt! Größer als vorher! Quantum kann einpacken. Mit Folie.', when: done(Q2) },
      ],
      hotspots: [
        {
          id: 'wand2-grau-ansehen', at: [1040, 225], radius: 70, label: 'Graue Wand', kind: 'look',
          when: all(flag(UEBERMALT), not(done(Q2)), { not: { time: 'nacht' } }),
          lines: [
            n('Zwanzig Meter Quantum-Grau. Nur ganz unten links, wo Liebespaare ihre Namen hinschreiben, hat jemand mit Kuli „NICHT MIT UNS“ in die frische Farbe geritzt.'),
          ],
        },
        {
          id: 'wand2-sina', at: 'wand-der-freiheit', label: 'Sina Spray', kind: 'talk', dialogue: sina2.id,
          when: all(flag(UEBERMALT), { time: ['tag', 'nacht'] }),
        },
        {
          id: 'wand2-spruehen', at: 'wand-der-freiheit', label: 'Mit Sina ein Bild neu sprühen', kind: 'use', dialogue: spruehen2.id,
          when: all(LAEUFT2, flag(FARBE2), KAMERA2_AUS, { time: 'nacht' }),
        },
        {
          id: 'wand2-farbwagen', at: [1250, 262], label: 'Quantums Farbwagen', kind: 'check', check: farbwagen,
          when: all(active(Q2), noFlag(FARBE2), { time: ['morgen', 'tag'] }),
          lines: [n('Ein weißer Elektrokarren mit Q-Logo, beladen mit Eimern „NEUTRALGRAU 7“ und einem Karton Abtönpaste. Die Putzkolonne sitzt zwanzig Meter weiter auf der Bank und diskutiert, ob Möwen Steuern zahlen.')],
          effects: [set(FARBE2), { message: 'Zwei Eimer Grundierung und die ganze Abtönpaste. Sina wird daraus Farbe machen. Quantum hat gerade die Kunst finanziert.' }],
          altText: 'Einer von der Putzkolonne schaut immer wieder rüber. Sinas Hehler verkauft auch – oder, wenn die Rostzähne weg sind, Bolles Malerbetrieb an der Hafenkante.',
        },
        {
          id: 'wand2-kamera-hacken', at: 'kamera-mauerweg', label: 'Neue Kamera hacken', kind: 'use',
          when: all(active(Q2), not(KAMERA2_AUS)),
          lines: [n('Weißes Gehäuse, rund wie ein Ei, ein grünes Auge, das jedem Gesicht folgt. Unten am Mast hängt derselbe rostige Wartungskasten wie früher. Quantum hat das Ei getauscht, nicht den Schrott darunter.')],
          effects: [{
            minigame: 'akt-hacken', level: 4, key: 'wand2-kamera', label: 'Gesichtserkennung auf Möwe stellen',
            win: [set('wand2_kamera_gehackt'), { xp: 50 }, { message: 'Die Kamera erkennt jetzt jedes Gesicht als „Möwe, harmlos“. Auch deins.' }],
            lose: [{ message: 'Das Ei piept beleidigt und sperrt den Zugang für eine Weile. Anders rangehen – oder später nochmal.' }],
          }],
        },
        {
          id: 'wand2-kamera-technik', at: 'kamera-mauerweg', label: 'Wartungskasten kurzschließen', kind: 'check', check: kamera2Technik,
          when: all(active(Q2), not(KAMERA2_AUS)),
          lines: [n('Du klemmst zwei Kabel um, die nicht zusammengehören. Das Ei zuckt, sagt „Guten Ab–“ und schaltet auf Standbild.')],
          effects: [set('wand2_kamera_technik'), { message: 'Die neue Kamera zeigt nur noch ein Standbild der grauen Wand.' }],
          altText: 'Neue Sicherung, neue Kabelfarben. Hacken geht – oder der Linse eine Ladung Farbe verpassen.',
        },
        {
          id: 'wand2-kamera-zuspruehen', at: 'kamera-mauerweg', label: 'Linse zusprühen', kind: 'check', check: kamera2Spruehen,
          when: all(active(Q2), not(KAMERA2_AUS), flag(FARBE2)),
          lines: [n('Ein Sprung auf den Mastfuß, ein Zischen, ein Schwung Neonpink über das grüne Auge. Die Kamera dreht sich verwirrt im Kreis und sucht die Welt.')],
          effects: [set('wand2_kamera_zugesprueht'), { message: 'Die Kamera sieht jetzt alles in Pink. Also nichts.' }],
          altText: 'Das Ei dreht sich zu schnell mit. Erst hacken oder den Kasten kurzschließen – oder ein andermal schneller sein.',
        },

        {
          id: 'wand-sina', at: 'wand-der-freiheit', label: 'Sina Spray', kind: 'talk', dialogue: sina.id,
          when: all(any(inactive(Q), LAEUFT), noFlag(UEBERMALT), { time: ['tag', 'nacht'] }),
        },
        {
          id: 'wand-spruehen', at: 'wand-der-freiheit', label: 'Mit Sina ein Bild sprühen', kind: 'use', dialogue: spruehen.id,
          when: all(LAEUFT, noFlag(UEBERMALT), flag(FARBE), KAMERA_AUS, EIN_MOTIV, { time: 'nacht' }),
        },
        {
          id: 'wand-kamera-technik', at: 'kamera-mauerweg', label: 'Wartungskasten kurzschließen', kind: 'check',
          check: kameraTechnik, when: all(active(Q), not(KAMERA_AUS)),
          lines: [n('Zwei Drähte, ein Funke, ein Fluch. Die Kamera nickt einmal und bleibt mit gesenktem Kopf hängen, als würde sie schlafen. Sie schläft.')],
          effects: [set('wand_kamera_technik'), { message: 'Die Kamera am Mauerweg ist blind.' }],
          altText: 'Zu viele Drähte. Das Hack-Modul am Kasten hilft – oder jemand redet mit Wachtmeisterin Kessel.',
        },
      ],
    },
    hafenkante: {
      hotspots: [
        {
          id: 'rostzaehne-farbe', at: 'rostzaehne-lager', label: 'Lager der Rostzähne', kind: 'use', dialogue: lager.id,
          when: all(active(Q), noFlag(FARBE), not(ROSTZ_WEG)),
        },
        {
          id: 'wand2-malerbetrieb', at: 'rostzaehne-lager', label: 'Bolle & Jungs – Malerbetrieb', kind: 'talk', dialogue: malerbetrieb.id,
          when: all(active(Q2), noFlag(FARBE2), ROSTZ_WEG),
        },
      ],
    },
    'bahnhof-mitte': {
      hotspots: [{
        id: 'wand-kessel', at: 'kiosk-bahnhof', label: 'Wachtmeisterin Kessel', kind: 'talk', dialogue: kessel.id,
        when: all(active(Q), not(KAMERA_AUS), { time: 'abend' }),
      }],
    },
  },
};

