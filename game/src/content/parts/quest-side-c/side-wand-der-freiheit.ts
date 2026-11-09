// side-wand-der-freiheit · „Wand der Freiheit“ (world.md §6.2 Nr. 31). Sina Spray, flutmauer, T (Fortsetzung in jedem Akt).
// Ein Bild für jede Crew-Figur → Motive sammeln (wer eine Figur gut genug kennt, ab ♥3, erzählt Sina davon) → Farbe
// besorgen (gc-126 Rostzähne-Lager an der Hafenkante oder 90 Cr) → Kamera am Mauerweg ausschalten (Hack-Minispiel der
// Zone, [Technik 5] am Wartungskasten oder Kessel ablenken) → nachts sprühen (akt-graffiti je Bild, 60 XP).
// Nach 6 Bildern: Ruf unterstadt +15, Sina ♥ +60, Abspannbild (Flag abspann_wand_der_freiheit). Weitere Bilder bleiben möglich.
// Quantum übermalt in act2 (Flag/Bildvariante der Zone, siehe gaps).
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueDef, DialogueNode, QuestDef } from '../../../modules/contracts';
import {
  VEX, VEXARIA_ROM, active, all, any, atLeast, ch, chk, dlg, done, flag, hearts, herz, inactive, item, l, n, noFlag, node,
  not, p, set,
} from './_q';

const Q = 'side-wand-der-freiheit';
const SI = 'sina-spray';
const FARBE = 'wand_farbe';
const KAMERA_AUS = any(flag('mauer_kamera_gehackt'), flag('wand_kamera_technik'), flag('wand_kessel_abgelenkt'));
const LAEUFT = any(active(Q), done(Q));

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
    effects: [set('abspann_wand_der_freiheit'), { message: 'Sechs Bilder an der Wand der Freiheit. Wer an der Flutmauer vorbeigeht, bleibt stehen.' }],
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

const kameraTechnik = chk('wand-kamera-kurzschluss', 'technik', 5, ['hacken', 'drohne']);

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: { [sina.id]: sina, [spruehen.id]: spruehen, [lager.id]: lager, [kessel.id]: kessel },
  mapAdditions: {
    flutmauer: {
      hotspots: [
        {
          id: 'wand-sina', at: 'wand-der-freiheit', label: 'Sina Spray', kind: 'talk', dialogue: sina.id,
          when: all(any(inactive(Q), LAEUFT), { time: ['tag', 'nacht'] }),
        },
        {
          id: 'wand-spruehen', at: 'wand-der-freiheit', label: 'Mit Sina ein Bild sprühen', kind: 'use', dialogue: spruehen.id,
          when: all(LAEUFT, flag(FARBE), KAMERA_AUS, EIN_MOTIV, { time: 'nacht' }),
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
      hotspots: [{
        id: 'rostzaehne-farbe', at: 'rostzaehne-lager', label: 'Lager der Rostzähne', kind: 'use', dialogue: lager.id,
        when: all(active(Q), noFlag(FARBE)),
      }],
    },
    'bahnhof-mitte': {
      hotspots: [{
        id: 'wand-kessel', at: 'kiosk-bahnhof', label: 'Wachtmeisterin Kessel', kind: 'talk', dialogue: kessel.id,
        when: all(active(Q), not(KAMERA_AUS), { time: 'abend' }),
      }],
    },
  },
};

// Vex hat für Arias Motiv eine eigene Zeile (VEXARIA_ROM); VEX bleibt für weitere Varianten importiert.
void VEX;
