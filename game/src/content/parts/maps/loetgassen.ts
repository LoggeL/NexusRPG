// Zone Lötgassen (world.md §3.5, Plan design/plan/act1.json maps.loetgassen, Paket pkg-loetgassen).
// Werkstattgassen mit Dantes Werkstatt, Lötzinns Laden, Kurierbude, Dach mit Taubenschlag und Funkmast.
// Kurierbude, Kurierbude-Dach, Funkmast und Taubenschlag sind Spots (Vex × Aria-Stationen 1, 4, 7, 10–12, Ziel von 2).
import type { Condition, DialogueDef, DialogueLine, HotspotDef, MapDef, NpcId } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const V: Condition = { playerIs: 'vex' };
const NICHT_V: Condition = { not: V };
const OFFEN: Condition = { time: ['morgen', 'tag', 'abend'] };
const ABENDS: Condition = { time: ['abend', 'nacht'] };
const n = (text: string): DialogueLine => ({ speaker: 'narrator', text });
const ich = (text: string, expr?: DialogueLine['expr']): DialogueLine => ({ speaker: 'player', text, ...(expr ? { expr } : {}) });

/** Sprungkraft ohne Check: Sprungfedern, Greifhaken oder Vex' Dachläuferin. */
const SPRUNGKRAFT: Condition = {
  any: [{ cyberware: 'beine-sprungfedern' }, { cyberware: 'arme-greifhaken' }, { perk: 'dachlaeuferin' }],
};
/** Wäschehof offen: ab Tag 2, Gossenkinder, oder per Gespräch mit dem Wäsche-Typen (Flag). */
const WAESCHEHOF_OFFEN: Condition = { any: [{ dayAtLeast: 2 }, { flag: 'waeschehof_offen' }, { origin: 'origin-gossenkind' }] };

// ---------------------------------------------------------------------------------------------------- Sammelobjekte

function loot(id: string, at: readonly [number, number], label: string, text: string, extra: Partial<HotspotDef> = {}): HotspotDef {
  return {
    id, at, label, kind: 'loot', once: true, radius: 44,
    lines: [n(text)],
    effects: [{ give: id }, { setFlag: `gefunden_${id}` }],
    ...extra,
  };
}

// ---------------------------------------------------------------------------------------------------- Kurierbude

/** Deko-Stufen der Kurierbude für Vex (world.md Vex × Aria „Quartier und Bude“); die späteste erfüllte Stufe ist sichtbar. */
const BUDE_STUFEN: { id: string; when: Condition; lines: DialogueLine[] }[] = [
  {
    id: 'kurierbude-stufe-13',
    when: { seen: 'rom-vexaria-konzert' },
    lines: [
      n('Zwei Kronkorken, zwei Becher, ein Foto vom Funkmast, ein Nähkissen mit schiefem Stern. Und jetzt hängt da ein Konzertbändchen neben dem Kabelbrand-Pass, festgetackert mit einem Nagel aus deiner eigenen Pistole.'),
      ich('Hier wohnt jetzt einer. … Zwei. Hier wohnen jetzt zwei. Scheiße.', 'freude'),
    ],
  },
  {
    id: 'kurierbude-stufe-stirn',
    when: { seen: 'rom-aria-stirn' },
    lines: [
      n('Auf der Paketkiste liegt ein Nähkissen. Der rote Stern drauf ist so schief gestickt, dass er fast ein Blitz ist. Arias Handschrift, nur mit Garn.'),
      ich('Sie hat sich zweimal in den Daumen gestochen. Hat sie gesagt. Mindestens viermal, sag ich.', 'neutral'),
    ],
  },
  {
    id: 'kurierbude-stufe-12',
    when: { seen: 'rom-vexaria-funkmast' },
    lines: [
      n('Über der Kiste klemmt jetzt ein Foto am Rolltor: der Funkmast im Sonnenuntergang, zwei Silhouetten auf der Plattform. Eine davon hält die andere an der Schnalle fest. Unscharf. Absichtlich, behauptet Aria.'),
      ich('Kas hätte das Foto gehasst. Viel zu kitschig. … Er hätte es trotzdem aufgehängt.', 'trauer'),
    ],
  },
  {
    id: 'kurierbude-stufe-11',
    when: { seen: 'rom-vexaria-morgen' },
    lines: [
      n('Zwei Kronkorken auf der Kiste. Daneben zwei leere Kiosk-Becher, einer mit Lippenstift am Rand, einer mit Zahnabdrücken. Die Matratze riecht nach Motoröl und Kirschkaugummi. Das Rolltor hat oben eine neue Delle, ungefähr in Hüfthöhe von jemandem, der dagegen gedrückt wurde.'),
      ich('Pakete bleiben eine Nacht. … Die hier ist geblieben.', 'neutral'),
    ],
  },
  {
    id: 'kurierbude-stufe-4',
    when: { flag: 'vexaria_kronkorken' },
    lines: [
      n('Auf der Paketkiste liegt ein einzelner Kronkorken, plattgebissen. Aria hat ihn da vergessen. Oder hingelegt. Bei der weiß man das nie.'),
      ich('Ich schmeiß den weg. Morgen. Vielleicht.', 'ueberrascht'),
    ],
  },
];

function kurierbudeHotspots(): HotspotDef[] {
  const at = [1290, 490] as const;
  const out: HotspotDef[] = [];
  // Für Spielende, die nicht Vex sind: Bude der Schrapnell-Kuriere.
  out.push({
    id: 'kurierbude', at, radius: 64, label: 'Kurierbude', kind: 'look', when: NICHT_V,
    lines: [
      n('Ein Rolltor aus Wellblech, zugeklebt mit Kurier-Aufklebern. Drinnen: Pakete bis unter die Decke, ein Lastenrad mit drei verschiedenen Reifen und ein Funkgerät, das ununterbrochen rauscht.'),
      n('Auf einem Pappschild steht: „Schrapnell-Kuriere. Wir liefern alles. Fragen kostet extra.“ Darunter, kleiner: „Ticken ist normal.“'),
    ],
  });
  // Vex: Unterschlupf, leere Grundstufe, dann die Deko-Stufen (nur die jüngste sichtbar).
  const stufenIds = BUDE_STUFEN.map((s) => s.when);
  out.push({
    id: 'kurierbude-vex', at, radius: 64, label: 'Deine Kurierbude', kind: 'look',
    when: { all: [V, { not: { any: stufenIds } }] },
    lines: [
      n('Deine Bude. Eine Matratze, eine Paketkiste als Tisch, ein Funkgerät auf Kanal 4. Nichts an der Wand. Nichts, was man vermissen könnte, wenn man morgen woanders pennt.'),
      ich('Pakete bleiben eine Nacht. Ich auch.', 'neutral'),
    ],
  });
  BUDE_STUFEN.forEach((stufe, i) => {
    const spaeter = BUDE_STUFEN.slice(0, i).map((s) => s.when);
    out.push({
      id: stufe.id, at, radius: 64, label: 'Deine Kurierbude', kind: 'look',
      when: { all: [V, stufe.when, ...(spaeter.length ? [{ not: { any: spaeter } }] : [])] },
      lines: stufe.lines,
    });
  });
  out.push({
    id: 'kurierbude-schlafen', at: [1350, 495], radius: 40, label: 'Auf der Matratze pennen', kind: 'sleep',
    when: { all: [V, ABENDS] },
    lines: [n('Gurtzeug ab, Handschuh bleibt an. Das Funkgerät rauscht dich in den Schlaf.')],
  });
  return out;
}

// ---------------------------------------------------------------------------------------------------- Dialoge

const TAUBEN_EMPFAENGER: [NpcId, string, string][] = [
  ['hunter', 'Hunter', 'Die Taube kommt zurück mit einem Kronkorken im Schnabel. Hunter hat ihn als Antwort reingesteckt. Heißt wohl: gelesen.'],
  ['raven', 'Raven', 'Die Taube kommt mit einer schwarzen Feder zurück, die eindeutig keine Taubenfeder ist. Raven hat geantwortet. Irgendwie.'],
  ['dante', 'Dante', 'Die Taube kommt zurück, voller Krümel. Dante hat sie gefüttert. Mit Keksen. Sie fliegt jetzt etwas tiefer.'],
  ['vega', 'Vega', 'Die Taube kommt mit einem Zettel zurück: „Brief erhalten. Rechtschreibung: 6 von 10. Inhalt: 9 von 10. – V.“'],
  ['aria', 'Aria', 'Die Taube kommt zerzaust zurück. Aria hat sie offenbar geknuddelt. Oder geboxt. Bei Aria ist das dasselbe.'],
  ['nyra', 'Nyra', 'Die Taube kommt mit einer Kinderzeichnung zurück: eine Welle, so groß wie die Taube. Mindestens.'],
  ['vex-schrapnell', 'Vex', 'Die Taube kommt zurück und sieht beleidigt aus. Vex hat sie überholt. Zu Fuß.'],
];

const taubenpost: DialogueDef = {
  id: 'dlg-loetgassen-taubenpost',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        { speaker: 'opa-gurrmann', text: 'Taubenpost! Schneller als das Netz, ehrlicher als das Netz, und sie scheißt dir nicht ins Postfach. Nur aufs Auto. Drei Credits.' },
        n('Im Schlag gurren zwei Dutzend Taubendrohnen. Eine hat eine Antenne als Schwanzfeder, eine andere nur ein Auge, das rot blinkt.'),
      ],
      choices: [
        ...TAUBEN_EMPFAENGER.map(([npc, name, antwort]): NonNullable<DialogueDef['nodes'][number]['choices']>[number] => ({
          text: `Brief an ${name} schicken (3 Cr)`,
          // Ein Brief pro Tag (Tagesflag der Engine, fällt jeden Morgen).
          when: { all: [{ met: npc }, { notFlag: 'heute_taubenpost' }, ...(npc === 'vex-schrapnell' ? [NICHT_V] : [])] },
          requires: { credits: 3 },
          effects: [
            { credits: -3 },
            { setFlag: 'heute_taubenpost' },
            {
              minigame: 'akt-taubenpost', level: 1, key: `taubenpost-${npc}`, label: `Taubenpost an ${name}`,
              win: [{ relation: npc, delta: 10 }, { message: antwort }],
              lose: [{ message: 'Die Taube dreht eine Ehrenrunde, setzt sich auf den Funkmast und denkt nicht dran. Opa Gurrmann zuckt mit den Schultern: „Montag. Die hat Montag.“' }],
            },
          ],
        })),
        { text: 'Wie funktioniert das überhaupt?', next: 'wie' },
        { text: 'Kein Brief heute.' },
      ],
    },
    {
      id: 'wie',
      lines: [
        { speaker: 'opa-gurrmann', text: 'Brief rein, Adresse in die Taube flüstern, loslassen. Die alten Modelle hören nur auf Plattdeutsch und Schimpfwörter. Also schimpf ordentlich.' },
        { speaker: 'opa-gurrmann', text: 'Und schreib nix Wichtiges. Die Tauben lesen mit. Die Hälfte vom Klatsch in den Lötgassen kommt von denen.' },
      ],
      next: 'start',
    },
  ],
};

const waeschehof: DialogueDef = {
  id: 'dlg-loetgassen-waeschehof',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        n('Zwischen den Wäscheleinen steht ein Kerl im Unterhemd, eine Rohrzange über der Schulter wie ein Gewehr. Hinter ihm tropfen zweihundert Overalls auf den Durchgang zur Rohrsiedlung.'),
        { speaker: 'narrator', text: '„Heute wird hier getrocknet, Frischling. Wer durchläuft, nimmt Wasser mit. Und Wasser gehört der Rohrsiedlung.“' },
      ],
      choices: [
        {
          text: 'Ich bin von hier. Lass mich durch, sonst erzähl ich deiner Mutter, wo du deine Unterhosen trocknest.',
          tag: '[Gosse]', when: { origin: 'origin-gossenkind' },
          effects: [{ setFlag: 'waeschehof_offen' }], next: 'gosse',
        },
        {
          text: 'Hör zu, Zangenmann: Ich hab Freunde in der Rohrsiedlung, die deine Wäsche gern mal anzünden würden.',
          check: { id: 'gc-loet-waeschehof', attribute: 'strasse', threshold: 4, tags: ['einschuechtern', 'welt'] },
          effects: [{ setFlag: 'waeschehof_offen' }], next: 'strasse',
        },
        {
          text: 'Ich helf dir beim Aufhängen. Dafür lässt du mich durch.',
          effects: [{ advanceTime: 30 }, { setFlag: 'waeschehof_offen' }, { rep: 'unterstadt', delta: 1 }], next: 'helfen',
        },
        { text: 'Dann eben morgen.', next: 'morgen' },
      ],
    },
    {
      id: 'gosse',
      lines: [{ speaker: 'narrator', text: '„… Woher weißt du von meinen Unterhosen? Geh. GEH einfach.“ Er hebt eine Leine für dich an.' }],
    },
    {
      id: 'strasse',
      lines: [{ speaker: 'narrator', text: '„Wer redet denn von anzünden. Hier, unter der Leine durch. Und grüß Mutter Brühe. Nicht von mir.“' }],
    },
    {
      id: 'helfen',
      lines: [
        n('Eine halbe Stunde später hast du Wäscheklammern an den Fingern, nasse Ärmel und ein überraschend gutes Gefühl.'),
        { speaker: 'narrator', text: '„Du hängst Overalls auf wie ein Profi. Ehrlich. Komm wieder, wenn du Arbeit suchst.“ Er hebt die Leine.' },
      ],
    },
    {
      id: 'morgen',
      lines: [{ speaker: 'narrator', text: '„Morgen ist trocken. Morgen ist alles trocken, Frischling.“' }],
    },
  ],
};

const ankunft: DialogueDef = {
  id: 'dlg-loetgassen-ankunft',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        n('Die Lötgassen. Hier riecht alles nach heißem Zinn, Kaffee und verschmortem Plastik. Aus jedem zweiten Rolltor fliegen Funken, aus jedem dritten Flüche.'),
        n('Mitten drin ein schmales Haus mit einer Tür voller Aufkleber. Hinter dem Fenster stapeln sich Schallplatten wie Pfannkuchen. Und oben auf dem Dach gurrt etwas, das zur Hälfte Taube und zur Hälfte Antenne ist.'),
      ],
    },
  ],
};

const ankunftVex: DialogueDef = {
  id: 'dlg-loetgassen-ankunft-vex',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        n('Die Lötgassen. Dein Revier. Zinn, Kaffee, Funkenflug, und aus der Kurierbude rauscht Kanal 4.'),
        ich('Alles da, wo ich’s liegen gelassen hab. Sogar der Dreck.', 'neutral'),
      ],
    },
  ],
};

// ---------------------------------------------------------------------------------------------------- Karte

const loetgassen: MapDef = {
  id: 'loetgassen',
  name: 'Lötgassen',
  subtitle: 'Unterstadt',
  size: [1536, 1024],
  district: 'unterstadt',
  lighting: 'outdoor',
  bg: 'bg-loetgassen',
  walk: [
    // Nordgasse, Durchgang hinter Dantes Haus (Gully), Platz, Hinterhof-Studio, Wäschehof
    [[425, 0], [500, 0], [500, 300], [485, 300], [485, 480], [840, 480], [840, 150], [905, 150], [905, 470], [1536, 470], [1536, 650], [1480, 650], [1480, 1010], [20, 1010], [20, 650], [40, 650], [40, 300], [425, 300]],
    // Feuertreppe vom Platz aufs Dach
    [[1440, 115], [1505, 115], [1505, 350], [1470, 490], [1400, 490], [1440, 350]],
    // Dach über Lötzinn und Kurierbude: Taubenschlag, Funkmast, Plattform oben an der Treppe
    [[905, 45], [1480, 45], [1480, 125], [1440, 125], [1435, 205], [905, 205]],
  ],
  block: [
    // Hinterhof-Studio: Mauern rundum, Lücke unten (x 165–235)
    [[60, 330], [355, 330], [355, 350], [60, 350]],
    [[330, 340], [355, 340], [355, 640], [330, 640]],
    [[60, 570], [165, 570], [165, 640], [60, 640]],
    [[235, 570], [355, 570], [355, 640], [235, 640]],
    [[40, 330], [80, 330], [80, 650], [40, 650]],
    // Kisten und Pflanze vor Dantes Fenster
    [[695, 470], [800, 470], [800, 492], [695, 492]],
    // Lötkolben-Lolas Bastelstand mit Gasflaschen
    [[0, 705], [370, 705], [370, 1024], [0, 1024]],
    [[355, 790], [420, 790], [420, 960], [355, 960]],
    // Stellwerk-Kasten mit Kisten
    [[715, 690], [845, 690], [845, 850], [715, 850]],
    [[555, 850], [940, 850], [940, 1024], [555, 1024]],
    // Kabeltrommeln, Kisten und Ölfässer unten rechts
    [[1245, 860], [1385, 860], [1385, 700], [1536, 700], [1536, 1024], [1245, 1024]],
    [[1290, 745], [1385, 745], [1385, 860], [1290, 860]],
    // Dach: Satellitenschüsseln, Taubenschlag, Funkmast
    [[955, 45], [1040, 45], [1040, 140], [955, 140]],
    [[1045, 45], [1250, 45], [1250, 152], [1045, 152]],
    [[1310, 45], [1405, 45], [1405, 190], [1310, 190]],
  ],
  foreground: [
    // Wäscheleinen voller Overalls (Figuren gehen dahinter durch)
    { rect: [1350, 420, 186, 200], baseY: 625 },
    // Funkmast auf dem Dach
    { rect: [1300, 0, 115, 190], baseY: 192 },
  ],
  exits: [
    { id: 'nach-neon-gasse', rect: [425, 0, 75, 36], to: 'neon-gasse', entry: 'von-loetgassen', label: 'Zur Neon-Gasse' },
    {
      id: 'nach-rohrsiedlung', rect: [1496, 470, 40, 165], to: 'rohrsiedlung', entry: 'von-loetgassen',
      label: 'Wäschehof-Durchgang zur Rohrsiedlung', when: WAESCHEHOF_OFFEN,
      lockedText: 'Wäscheleinen voller Overalls, dahinter ein Typ mit Rohrzange: „Morgen vielleicht, Frischling. Heute wird hier getrocknet.“',
    },
    {
      id: 'nach-dantes-werkstatt', rect: [570, 450, 70, 45], to: 'dantes-werkstatt', entry: 'von-loetgassen',
      label: 'Dantes Werkstatt', interact: true,
      when: { any: [OFFEN, { hearts: 'dante', min: 4 }, { quest: 'main-1-dante', state: 'active' }] },
      lockedText: 'Drinnen schnarcht jemand im Takt eines Plattenspielers. Klopfen bringt nichts.',
    },
    {
      id: 'nach-loetzinn-laden', rect: [985, 440, 90, 45], to: 'loetzinn-laden', entry: 'von-loetgassen',
      label: 'Lötzinns Laden', interact: true, when: OFFEN,
      lockedText: 'Rolltor unten. Ein Zettel: „Lötzinn schläft. Lötzinn beißt.“',
    },
    { id: 'gully', rect: [842, 408, 54, 52], to: 'kanal-sammler', entry: 'von-loetgassen', label: 'Gully hinter Dantes Werkstatt', interact: true },
    {
      id: 'kanalgitter', rect: [1075, 860, 90, 60], to: 'kanal-sammler', entry: 'gitter-loetgassen', label: 'Kanalgitter (Schnellweg)',
      interact: true, when: { quest: 'side-rattenkoenig', state: 'done' },
      lockedText: 'Ein Gitter mit Kronkorken-Siegel. Bürgermeister Gully lässt nur Freunde der Rohre durch.',
    },
    {
      id: 'dachsprung-neon-gasse', rect: [905, 140, 30, 65], to: 'neon-gasse', entry: 'dachkante', label: 'Dachsprung zur Neon-Gasse',
      interact: true, when: { not: SPRUNGKRAFT }, check: 'gc-150',
      lockedText: 'Von hier sieht die Neon-Gasse sehr weit weg aus. Und sehr hart.',
    },
    {
      id: 'dachsprung-neon-gasse-frei', rect: [905, 140, 30, 65], to: 'neon-gasse', entry: 'dachkante', label: 'Dachsprung zur Neon-Gasse',
      interact: true, when: SPRUNGKRAFT,
    },
  ],
  entries: {
    'von-neon-gasse': { at: [462, 70], facing: 's' },
    'von-rohrsiedlung': { at: [1440, 560], facing: 'w' },
    'von-dantes-werkstatt': { at: [605, 520], facing: 's' },
    'von-loetzinn-laden': { at: [1030, 520], facing: 's' },
    'von-kanal-sammler': { at: [872, 495], facing: 's' },
    kanalgitter: { at: [1120, 820], facing: 'n' },
    'dach-taubenschlag': { at: [965, 175], facing: 'e' },
    taxi: { at: [700, 620], facing: 'n' },
    aufwachen: { at: [1290, 510], facing: 's' },
  },
  spots: {
    'werkstatt-tuer': { at: [605, 515], facing: 'n' },
    'werkstatt-fenster': { at: [725, 510], facing: 'n' },
    'loetzinn-tor': { at: [1030, 510], facing: 'n' },
    taubenschlag: { at: [1150, 180], facing: 'n' },
    'dach-taubenschlag': { at: [965, 175], facing: 'e' },
    funkmast: { at: [1280, 178], facing: 'e' },
    kurierbude: { at: [1290, 505], facing: 'n' },
    'kurierbude-dach': { at: [1420, 185], facing: 's' },
    'hinterhof-studio': { at: [200, 470], facing: 'n' },
    gully: { at: [872, 470], facing: 'n' },
    waeschehof: { at: [1430, 580], facing: 'e' },
    'lola-werkbank': { at: [200, 680], facing: 's' },
    'stellwerk-loet': { at: [780, 670], facing: 's' },
    kabelweg: { at: [960, 520], facing: 'w' },
    kabeltrommeln: { at: [1420, 680], facing: 's' },
    'auftrag-a': { at: [560, 600], facing: 's' },
  },
  hotspots: [
    // --- Dach: Taubenschlag, Funkmast, Aussicht, Dachfirst
    {
      id: 'taubenpost', at: [1150, 165], radius: 60, label: 'Taubenpost bei Opa Gurrmann', kind: 'use', when: OFFEN,
      dialogue: 'dlg-loetgassen-taubenpost',
    },
    {
      id: 'taubenschlag-nachts', at: [1150, 165], radius: 60, label: 'Taubenschlag', kind: 'look', when: { time: 'nacht' },
      lines: [n('Der Schlag ist zu. Drinnen gurrt es im Schlaf, und eine Drohne murmelt „Rucke-di-gu, Akku leer“. Opa Gurrmann kommt morgen früh wieder.')],
    },
    {
      id: 'entflogene-taube', at: [1265, 195], radius: 56, label: 'Entflogene Taubendrohne fangen', kind: 'check', check: 'gc-153',
      when: { all: [OFFEN, { not: { item: 'schrott-ersatzteil' } }] }, hideWhen: { flag: 'taube_gefangen' },
      lines: [n('Eine Taubendrohne hockt auf der Dachkante über der Kurierbude und surrt beleidigt. Opa Gurrmann ruft von hinten: „Das ist Erna! Erna haut immer ab!“')],
      altText: 'Erna ist schneller als du. Mit einem Schrott-Ersatzteil als Futter ließe sie sich anlocken – Tauben aus Blech fressen alles, was klappert.',
      effects: [
        { setFlag: 'taube_gefangen' }, { relation: 'opa-gurrmann', delta: 40 }, { setFlag: 'taubenpost_frueh' },
        { message: 'Erna sitzt wieder im Schlag. Opa Gurrmann: „Du hast Hände wie ein Taubenflüsterer. Ein dreckiger Taubenflüsterer.“' },
      ],
    },
    {
      id: 'entflogene-taube-futter', at: [1265, 195], radius: 56, label: 'Taubendrohne mit Ersatzteil anlocken', kind: 'use',
      when: { all: [OFFEN, { item: 'schrott-ersatzteil' }] }, hideWhen: { flag: 'taube_gefangen' },
      lines: [n('Du hältst ein klapperndes Ersatzteil hin. Erna legt den Kopf schief, überlegt kurz, ob sie Würde hat, und entscheidet sich dagegen.')],
      effects: [
        { take: 'schrott-ersatzteil' }, { setFlag: 'taube_gefangen' }, { relation: 'opa-gurrmann', delta: 40 }, { setFlag: 'taubenpost_frueh' },
        { message: 'Erna frisst das Ersatzteil und hüpft in den Schlag. Opa Gurrmann: „Bestechung. Gute Methode. Hab ich bei meiner Frau auch gemacht.“' },
      ],
    },
    {
      id: 'aussicht-taubenschlag', at: [1445, 85], radius: 60, label: 'Aussicht vom Taubenschlag', kind: 'look', once: true,
      lines: [
        n('Von hier oben sind die Lötgassen ein Gewirr aus Rolltoren, Funken und Wäscheleinen. Im Norden glüht die Neon-Gasse pink, im Osten dampfen die Rohre der Siedlung, und ganz hinten, über allem, hängt der Quantum-Tower im Smog wie ein Mittelfinger aus Glas.'),
        n('Die Tauben sehen das jeden Tag. Kein Wunder, dass sie überall hinkacken.'),
      ],
      effects: [{ xp: 20 }, { setFlag: 'aussicht_loetgassen' }, { markSeen: 'aussicht-loetgassen' }],
    },
    {
      id: 'aussicht-taubenschlag-blick', at: [1445, 85], radius: 60, label: 'Aussicht', kind: 'look', when: { seen: 'aussicht-taubenschlag' },
      lines: [n('Rolltore, Funken, Wäsche, Tower. Die Aussicht ist dieselbe. Du bist ein bisschen weniger neu.')],
    },
    {
      id: 'funkmast', at: [1290, 160], radius: 56, label: 'Funkmast', kind: 'look', when: NICHT_V,
      lines: [
        n('Ein dünner Stahlmast mit Leiter und einer winzigen Wartungsplattform. An den Streben flattern Stoffarmbänder, Dutzende, ausgeblichen in allen Farben.'),
        n('Aus einem Lautsprecher am Fuß rauscht Kanal 9 des Kurierfunks. Zwischen dem Rauschen eine Männerstimme, immer wieder dieselbe Schleife: „… nicht anhalten. Nicht umdrehen. Wir sehen uns im Ziel.“'),
      ],
    },
    {
      id: 'funkmast-vex', at: [1290, 160], radius: 56, label: 'Funkmast', kind: 'look', when: V,
      lines: [
        n('Die Armbänder an den Streben. Jedes gehörte einem Kurier, der aufgehört hat. Aus Gründen. Ganz oben, am höchsten Knoten, ein rotes. Das hat keiner außer dir je angefasst.'),
        n('Kanal 9 rauscht. Dann seine Stimme: „Schrapnell eins an alle: Nicht anhalten. Nicht umdrehen. Wir sehen uns im Ziel.“'),
        ich('Ja, ja. Ich hab’s gehört, Kas. Jeden verdammten Tag.', 'trauer'),
      ],
    },
    {
      id: 'kurierbude-dach-ansehen', at: [1410, 195], radius: 50, label: 'Dach über der Kurierbude', kind: 'look',
      lines: [n('Wellblech, eine alte Sofadecke, drei Kippen in einer Konservendose. Jemand sitzt hier oben öfter und schaut auf den Funkmast. Von hier aus hört man jedes Wort, das unten in der Bude gesagt wird. Jedes.')],
    },
    // Dachfirst mit schallplatte-03: frei mit Sprungkraft, sonst gc-150 [Reflexe 7]
    loot('schallplatte-03', [925, 70], 'Platte am Dachfirst', 'Am Dachfirst, eingeklemmt zwischen zwei Ziegeln, steckt eine Schallplatte in einer Plastikhülle: „Die Lötkolben – Heiße Spitze“. Jemand hat sie hier versteckt. Jemand mit sehr gutem Musikgeschmack und sehr schlechtem Gleichgewicht.', {
      when: SPRUNGKRAFT, hideWhen: { flag: 'gefunden_schallplatte-03' },
    }),
    {
      id: 'schallplatte-03-first', at: [925, 70], radius: 44, label: 'Auf den Dachfirst klettern', kind: 'check', check: 'gc-150',
      when: { not: SPRUNGKRAFT }, hideWhen: { flag: 'gefunden_schallplatte-03' },
      lines: [n('Am Dachfirst, zwischen zwei Ziegeln, glänzt eine Plastikhülle. Der First ist glitschig, steil und hat schon bessere Leute als dich gesehen. Von unten.')],
      altText: 'Zu glatt, zu steil. Mit Reflexe 7, Sprungfedern in den Beinen oder einem Greifhaken im Arm kämst du hin.',
      effects: [{ give: 'schallplatte-03' }, { setFlag: 'gefunden_schallplatte-03' }, { message: 'Gefunden: „Die Lötkolben – Heiße Spitze“. Du balancierst zurück, ohne zu sterben. Applaus von den Tauben.' }],
    },
    // --- Gasse: Werkstatt, Läden, Wäschehof
    {
      id: 'werkstatt-fenster-ansehen', at: [725, 495], radius: 44, label: 'Werkstattfenster', kind: 'look',
      lines: [n('Hinter dem Fenster stapeln sich Schallplatten, VHS-Kassetten und ein Faxgerät, das aussieht, als hätte es den Krieg gewonnen. Ein Zettel klebt innen an der Scheibe: „Kekse nur für Freunde. Freunde sind alle mit Keksen.“')],
    },
    {
      id: 'aufkleber-tuer', at: [545, 495], radius: 36, label: 'Aufkleber an der Tür', kind: 'look',
      lines: [n('Hunderte Aufkleber. „Analog ist kein Fehler“, „Drei-Sekunden-Regel“, ein Kabelbrand-Logo, ein Herz mit „R“ drin, halb überklebt mit einem Keks. Der Keks wurde eindeutig später draufgeklebt. Schnell. Panisch.')],
    },
    {
      id: 'loetzinn-schaufenster', at: [945, 490], radius: 40, label: 'Schaufenster von Lötzinns Laden', kind: 'look',
      lines: [n('Neue Augen, neue Finger, neue Nerven, alles glänzend, alles mit Preisschild. Ein Schild: „Nur Neuware. Gebrauchtes gibt’s bei Ripper. Zusammen mit Tetanus.“')],
    },
    {
      id: 'waescheleinen', at: [1395, 520], radius: 50, label: 'Wäscheleinen', kind: 'look',
      lines: [n('Overalls, Overalls, Overalls. Ein einzelner Glitzer-BH dazwischen, mit Würde. Das Wasser tropft genau in den Kragen, egal, wie du dich drehst.')],
    },
    {
      id: 'waeschehof-typ', at: [1455, 600], radius: 56, label: 'Mit dem Wäsche-Typen reden', kind: 'talk',
      when: { not: WAESCHEHOF_OFFEN }, dialogue: 'dlg-loetgassen-waeschehof',
    },
    {
      id: 'hinterhof-studio-ansehen', at: [245, 440], radius: 56, label: 'Hinterhof-Studio', kind: 'look',
      lines: [
        n('Grüne Matten, ein Papierlampion, ein Gong und drei Topfpflanzen, die in diesem Smog eigentlich tot sein müssten. Ein Schild aus Pappe: „Innere Mitte. Dienstags geschlossen. Die Mitte auch.“'),
        n('Auf der Matte liegt ein Abdruck, groß, breit, eindeutig Stiefel Größe 46. Hunter hat Stiefel Größe 46. Rein zufällig.'),
      ],
    },
    {
      id: 'stellwerk-kasten', at: [780, 670], radius: 44, label: 'Stellwerkkasten', kind: 'look',
      when: { not: { quest: 'side-uebliche-verspaetung', state: 'active' } },
      lines: [n('Ein grauer Kasten der U-Bahn-Signaltechnik, der hier oben eigentlich nichts verloren hat. Er blinkt im Takt von „Ich bin wichtig“. Jemand hat „NICHT TRETEN“ draufgeschrieben, und jemand anderes hat reingetreten.')],
    },
    {
      id: 'lola-stand-ansehen', at: [200, 690], radius: 50, label: 'Bastelstand', kind: 'look',
      lines: [n('Ein Stand voller selbstgelöteter Implantate: ein Ohr mit Kassettenschlitz, ein Finger mit Feuerzeug, ein Auge, das offenbar Radio empfängt. Daneben ein Schild: „Garantie: bis zur Haustür“. Die Haustür ist zwei Meter entfernt.')],
    },
    {
      id: 'kabeltrommeln-ansehen', at: [1440, 685], radius: 50, label: 'Kabeltrommeln', kind: 'look',
      lines: [n('Kabeltrommeln so groß wie Autoreifen, gewickelt mit Kupfer, das jeder hier klauen würde, wenn es nicht allen gehören würde. Unterstadt-Logik.')],
    },
    {
      id: 'schweissfunken', at: [300, 315], radius: 60, label: 'Werkstatt mit Funkenflug', kind: 'look',
      lines: [n('Hinter einem halboffenen Rolltor schweißt jemand ohne Maske an einem Motorrad, das mehr Teile hat als ein Motorrad haben sollte. Funken prasseln auf deine Stiefel. „Weitergehen! Oder halt mal die Lampe.“')],
    },
    // --- Sammelobjekte (world.md §3.5 Lötgassen)
    loot('datenwuerfel-03', [1235, 850], 'Datenwürfel in der Kabeltrommel', 'Zwischen zwei Kabelwindungen steckt ein Datenwürfel, eingewickelt in Isolierband. Wer hier was versteckt, will, dass es keiner findet. Pech gehabt.', { hideWhen: { flag: 'gefunden_datenwuerfel-03' } }),
    loot('neon-tag-03', [478, 330], 'Neon-Tag an der Hauswand', 'An der Hauswand leuchtet ein Graffiti-Tag in Neonfarbe: ein Stern mit Sprühdosenkopf. Sina Spray war hier. Du fotografierst ihn mit dem Telefon – zählt als gefunden.', { hideWhen: { flag: 'gefunden_neon-tag-03' } }),
    loot('glueckstern-04', [1160, 485], 'Glücksstern an der Laterne', 'An der Laterne am Wäschehof baumelt ein ausgeschnittener Blechstern. Die Leute sagen, wer zwanzig davon findet, hat Glück. Wer einen findet, hat einen Blechstern.', { hideWhen: { flag: 'gefunden_glueckstern-04' } }),
    // --- Vex: Kurierbude mit Deko-Stufen, Schlafplatz
    ...kurierbudeHotspots(),
  ],
  shelter: { entry: 'aufwachen', when: V },
  lights: [
    { at: [720, 380], radius: 130, color: '#ffc861', intensity: 0.9, slots: ['abend', 'nacht'] },
    { at: [715, 270], radius: 110, color: '#ff3fa4', intensity: 0.8, slots: ['abend', 'nacht'] },
    { at: [545, 340], radius: 70, color: '#ffc861', intensity: 0.7, slots: ['abend', 'nacht'] },
    { at: [1050, 255], radius: 120, color: '#3ef2ff', intensity: 0.8, slots: ['abend', 'nacht'] },
    { at: [1030, 400], radius: 140, color: '#3ef2ff', intensity: 0.6, slots: ['abend', 'nacht'] },
    { at: [1165, 330], radius: 80, color: '#ffc861', intensity: 0.7, slots: ['abend', 'nacht'] },
    { at: [1420, 290], radius: 70, color: '#ffc861', intensity: 0.6, slots: ['abend', 'nacht'] },
    { at: [1405, 12], radius: 70, color: '#ffc861', intensity: 0.7, slots: ['abend', 'nacht'] },
    { at: [1360, 30], radius: 50, color: '#ff2a2a', intensity: 0.9, slots: ['abend', 'nacht'] },
    { at: [1150, 120], radius: 90, color: '#ffc861', intensity: 0.4, slots: ['abend'] },
    { at: [160, 385], radius: 110, color: '#ff9a3c', intensity: 0.7, slots: ['abend', 'nacht'] },
    { at: [300, 225], radius: 110, color: '#ffb347', intensity: 0.8, slots: ['tag', 'abend'] },
    { at: [130, 150], radius: 90, color: '#ff3fa4', intensity: 0.6, slots: ['abend', 'nacht'] },
    { at: [330, 150], radius: 90, color: '#ff3fa4', intensity: 0.6, slots: ['abend', 'nacht'] },
    { at: [1450, 470], radius: 110, color: '#3ef2ff', intensity: 0.5, slots: ['abend', 'nacht'] },
    { at: [1490, 735], radius: 70, color: '#ffc861', intensity: 0.6, slots: ['abend', 'nacht'] },
    { at: [780, 750], radius: 60, color: '#52ff8a', intensity: 0.6, slots: ['abend', 'nacht'] },
    { at: [160, 790], radius: 110, color: '#ff3fa4', intensity: 0.6, slots: ['abend', 'nacht'] },
    { at: [462, 40], radius: 130, color: '#ff3fa4', intensity: 0.6, slots: ['abend', 'nacht'] },
  ],
  ambient: {
    count: 8,
    bySlot: { morgen: 5, tag: 9, abend: 8, nacht: 4 },
    sprites: [
      'passant-arbeiterin-walk', 'passant-schrotti-walk', 'passant-kurier-walk', 'passant-punk-walk',
      'passant-strassenhaendler-walk', 'passant-oma-walk',
    ],
    routes: [
      [[462, 40], [462, 320], [600, 560], [1000, 560], [1400, 560]],
      [[440, 650], [900, 640], [1150, 800], [1000, 560]],
      [[1030, 520], [870, 520], [600, 540], [470, 420], [462, 60]],
      [[1180, 600], [950, 660], [480, 620], [420, 330], [100, 320]],
      [[1290, 520], [1440, 560], [1440, 620], [1200, 600], [960, 520]],
      [[560, 620], [700, 640], [1000, 720], [1050, 600], [560, 620]],
    ],
    barks: [
      { text: 'Wer hat schon wieder die Laterne geklaut? Die war festgeschraubt!' },
      { text: 'Mutter Brühe sagt, heute gibt’s Suppe. Gestern gab\'s auch Suppe.' },
      { text: 'Die Rostzähne haben gestern meinen Schatten erpresst.' },
      { text: 'Spielt jemand Eins? Ich hab nur noch Plus-Vier-Karten.' },
      { text: 'Hast du Lötzinn? Nicht die Frau, das Zeug. Die Frau hat mich rausgeworfen.' },
      { text: 'Dante backt wieder. Riechst du das? Das ist Hoffnung mit Schokostückchen.' },
      { text: 'Funken im Haar sind kein Modetrend, Kalle! Mach die Scheißmaske auf!' },
      { text: 'Meine Taube hat mir ’nen Brief gebracht. Von mir. Den hab ich letzte Woche verschickt.' },
      { text: 'Kaffee. Kaffee. Wer lebt, braucht Kaffee.', when: { time: 'morgen' } },
      { text: 'Mein Rolltor klemmt. Mein Rücken auch. Alles klemmt, scheiße nochmal.', when: { time: 'morgen' } },
      { text: 'Feierabend! Wer kommt mit ins High Voltage? Ich zahl nicht.', when: { time: 'abend' } },
      { text: 'Hörst du das? Dante legt wieder Platten auf. Gleich tanzt die ganze Gasse. Oder heult.', when: { time: 'abend' } },
      { text: 'Die Kurierin ist wieder da. Pass auf deine Füße auf, die fährt über alles.', when: { all: [{ time: 'abend' }, NICHT_V] } },
      { text: 'Psst. Die Rostzähne laufen heute Streife. Rolltor runter, Licht aus.', when: { time: 'nacht' } },
      { text: 'Ich schlaf nicht, ich lausch nur meinem Implantat. Es spielt Polka.', when: { time: 'nacht' } },
      { text: 'Na, Chefin? Schon wieder nicht gepennt?', when: { all: [V, { time: ['morgen', 'nacht'] }] } },
      { text: 'Die Kurierbude hat heut Nacht gescheppert. Ich sag nix. Ich sag nur: Wellblech ist dünn.', when: { all: [V, { seen: 'rom-vexaria-morgen' }] } },
    ],
  },
  ambience: 'unterstadt',
  onEnter: [
    { id: 'loetgassen-erstbesuch', once: true, when: NICHT_V, dialogue: 'dlg-loetgassen-ankunft', effects: [{ markSeen: 'loetgassen-erstbesuch' }] },
    { id: 'loetgassen-erstbesuch-vex', once: true, when: V, dialogue: 'dlg-loetgassen-ankunft-vex', effects: [{ markSeen: 'loetgassen-erstbesuch' }] },
  ],
};

export const part: ContentPart = {
  maps: { loetgassen },
  dialogues: {
    [taubenpost.id]: taubenpost,
    [waeschehof.id]: waeschehof,
    [ankunft.id]: ankunft,
    [ankunftVex.id]: ankunftVex,
  },
};
