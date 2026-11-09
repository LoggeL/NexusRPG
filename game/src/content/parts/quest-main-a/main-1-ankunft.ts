// Hauptquest `main-1-ankunft` · „Neu in Noxius“ (world.md §5.2): Tag 1, 16:30, Bahnhof Mitte → (Schrottmarkt) → Neon-Gasse.
// Auslöser: Ende des Prologs (`prolog_done`; prolog-verrat stellt die Uhr per `setClock` auf 16:30). Am Bahnhof laufen die
// Ankunftsszene (Hunters Nachricht) und die Abzieher-Brüder Knut und Kurt (gc-01/02/03, [Gosse], Vex, zahlen, Kampf).
// Danach freier Weg: Stadt-TV und Kinder am Schrottmarkt, Oma Volt am Kiosk, Ziel High Voltage um 18 Uhr.
import type { Condition } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import { KINDERZEIT, L, N, NICHT_VEX, UHR, VEX, node } from './_dsl';

const Q = 'main-1-ankunft';
const ANKUNFT = UHR(16, 30);
const VOR_PROBEZEIT: Condition = { not: { quest: 'main-1-probezeit', state: 'done' } };
const ABZIEHER_OFFEN: Condition = {
  all: [{ flag: 'prolog_done' }, { notFlag: 'ankunft_abzieher_geloest' }, { not: { won: 'enc-bahnhof-abzieher' } }, { notFlag: 'abzieher_verloren' }],
};

const geloest = { setFlag: 'ankunft_abzieher_geloest' } as const;

export const part: ContentPart = {
  quests: {
    [Q]: {
      id: Q,
      kind: 'main',
      title: 'Neu in Noxius',
      summary: 'Hunter will dich um 18 Uhr im High Voltage sehen. Pünktlich. Die U-Bahn hatte 47 Minuten Verspätung, und am Bahnsteig warten schon zwei Typen mit Kapuzen.',
      giver: 'hunter',
      act: 1,
      autoStart: { flag: 'prolog_done' },
      steps: [
        {
          id: 'abzieher',
          text: 'Werd die Abzieher-Brüder am Bahnsteig los – mit Worten, Beinen, Credits oder Fäusten.',
          done: { any: [{ flag: 'ankunft_abzieher_geloest' }, { won: 'enc-bahnhof-abzieher' }, { flag: 'abzieher_verloren' }] },
          marker: { map: 'bahnhof-mitte', at: 'bahnsteig-2' },
        },
        {
          id: 'weg',
          text: 'Finde den Weg in die Neon-Gasse.',
          when: { questStep: Q, step: 'abzieher' },
          done: { visited: 'neon-gasse' },
          marker: { map: 'neon-gasse' },
        },
        {
          id: 'oma-volt',
          text: 'Frag Oma Volt am Kiosk in der Neon-Gasse nach Hunter.',
          when: { flag: 'ankunft_oma_tipp' },
          done: { flag: 'ankunft_oma_volt' },
          optional: true,
          marker: { map: 'neon-gasse', at: 'kiosk' },
        },
        {
          id: 'stadt-tv',
          text: 'Wirf einen Blick auf das Stadt-TV am Schrottmarkt.',
          when: { questStep: Q, step: 'abzieher' },
          done: { flag: 'ankunft_tv' },
          optional: true,
          marker: { map: 'schrottmarkt', at: 'stadt-tv' },
        },
        {
          id: 'kinder',
          text: 'Die Kinder am Botenstand des Schrottmarkts wollen etwas über Ripper wissen.',
          when: { all: [{ questStep: Q, step: 'abzieher' }, KINDERZEIT] },
          done: { flag: 'ankunft_kinder' },
          optional: true,
          marker: { map: 'schrottmarkt', at: 'botenstand' },
        },
        {
          id: 'tuer',
          text: 'Sei um 18 Uhr im High Voltage. Pünktlich.',
          when: { visited: 'neon-gasse' },
          done: { any: [{ flag: 'hv_einlass' }, { visited: 'high-voltage' }] },
          marker: { map: 'neon-gasse', at: 'hv-eingang' },
        },
      ],
      reward: { xp: 60, credits: 50 },
    },
  },

  phone: {
    'ph-hunter-18-uhr': {
      id: 'ph-hunter-18-uhr',
      from: 'hunter',
      text: 'Sei um 18 Uhr im High Voltage. Pünktlich. – H.',
      effects: [{ setFlag: 'hunter_nachricht' }],
      replies: [
        { text: 'Bin unterwegs.' },
        { text: 'Und wenn die U-Bahn wieder zu spät ist?', effects: [{ message: 'Hunter: „Dann lauf.“' }] },
      ],
    },
    'ph-hunter-tick': {
      id: 'ph-hunter-tick',
      from: 'hunter',
      text: 'Viertel vor. Ich seh auf die Uhr, Neuling.',
      auto: { all: [{ quest: Q, state: 'active' }, { clockBetween: [UHR(17, 45), UHR(18)] }] },
    },
    'ph-hunter-zu-spaet': {
      id: 'ph-hunter-zu-spaet',
      from: 'hunter',
      text: 'Halb sieben. Du bist zu spät. Das merk ich mir.',
      auto: { all: [{ quest: Q, state: 'active' }, { clockBetween: [UHR(18, 30), UHR(20)] }] },
    },
  },

  cutscenes: {
    'main-1-ankunft-intro': {
      id: 'main-1-ankunft-intro',
      title: 'Bahnhof Mitte',
      beats: [
        {
          image: 'cut-ankunft-bahnhof', pan: 'in', caption: 'Noxius, 2086. Montag, 16:30.', fade: 'in', hold: 1600,
          lines: [
            N('Die U-Bahn-Linie 4 schleift sich mit siebenundvierzig Minuten Verspätung in den Bahnhof Mitte. Die Durchsage entschuldigt sich „bei allen Fahrgästen, die noch leben“.'),
            N('Die Türen klemmen. Jemand tritt dagegen. Sie gehen auf. Es riecht nach Bremsstaub, Frittierfett und nassem Beton.'),
          ],
        },
        {
          image: 'cut-ankunft-bahnhof', sfx: 'phone',
          lines: [
            N('Dein Telefon brummt. Eine Nachricht von einer Nummer, die du nur von einem zerknitterten Zettel kennst.'),
            L('hunter', 'Sei um 18 Uhr im High Voltage. Pünktlich. – H.'),
            N('Hunter. Chef einer Crew, die gerade jemand Neues sucht. Und du bist jemand Neues.'),
          ],
        },
      ],
      effects: [{ phone: 'ph-hunter-18-uhr' }],
      gallery: false,
    },
  },

  dialogues: {
    'main-1-ankunft-abzieher': {
      id: 'main-1-ankunft-abzieher',
      start: 'start',
      nodes: [
        node('start', [
          N('Bahnsteig 3. Die U-Bahn faucht davon. Zwei Kapuzen schieben sich zwischen dich und die Treppe, breitbeinig wie Türsteher ohne Tür.'),
          L('knut', 'Na, wen haben wir denn da? Frischfleisch mit Gepäck.'),
          L('kurt', 'Bahnsteiggebühr, Neuling. Fünfzig Credits. Oder alles, was in deinen Taschen klimpert.'),
          L('knut', 'Und keine Zicken, sonst sag ich’s meiner Mama! … Ich mein: Sonst gibt’s auf die Fresse.'),
        ], {
          choices: [
            { check: 'gc-01', text: '„Das hier ist Rostzahn-Revier. Wissen die Rostzähne, dass ihr hier abkassiert?“', next: 'revier' },
            { check: 'gc-02', text: '„Ich bin mit Hunter verabredet. Vom High Voltage. Wollt ihr ihm erklären, warum ich zu spät komme?“', next: 'hunter' },
            { check: 'gc-03', text: 'Von der Bahnsteigkante springen und über die Gleise abhauen.', next: 'gleise' },
            {
              tag: '[Gosse]', when: { origin: 'origin-gossenkind' },
              text: '„Knut? Knut aus der Suppenküche? Du hast mir mal den Nachtisch geklaut, du Pfeife.“', next: 'gosse',
            },
            { when: VEX, text: '„Knut. Ich hab dir letzten Monat dein Paket gebracht. Das mit den Plüschsocken.“', next: 'vex' },
            { requires: { credits: 10 }, text: '„Zehn Credits. Mehr kriegt ihr nicht, und das ist schon Mitleid.“', next: 'zahlen', effects: [{ credits: -10 }] },
            { text: '„Versucht’s doch.“', next: 'kampf' },
          ],
        }),
        node('revier', [
          L('knut', 'Rostzahn-Revier? Seit wann?'),
          L('kurt', 'Seit … äh … Knut, seit wann?'),
          L('knut', 'Woher soll ich das wissen? Ich bin nicht der, der die Karte hat!'),
          N('Die beiden schauen sich um, als würden gleich drei Typen mit Rostzähnen aus dem Lüftungsschacht springen. Dann rennen sie. Knut verliert dabei eine Nougatbombe.'),
          L('kurt', 'Das sag ich meiner Mama!'),
        ], { effects: [geloest, { give: 'nougatbombe' }], next: 'danach' }),
        node('hunter', [
          L('knut', 'Hunter? DER Hunter? Mit der Sonnenbrille und den Seidenhemden?'),
          L('kurt', 'Der hat uns letztes Jahr aus dem Club geworfen. Mit Schwung. Ich bin auf einem Mülleimer gelandet. Im Mülleimer.'),
          L('knut', 'Okay, okay. Grüß ihn nicht von uns. Und wenn du den Weg suchst: Frag Oma Volt am Kiosk in der Neon-Gasse. Die kennt jeden. Die kennt sogar unsere Mama.'),
        ], { effects: [geloest, { setFlag: 'ankunft_oma_tipp' }], next: 'danach' }),
        node('gleise', [
          N('Du springst von der Kante. Erste Schiene, zweite Schiene, die Stromschiene lieber nicht. Hinter dir zetern die Brüder.'),
          L('knut', 'Das ist gegen die Hausordnung!'),
          L('kurt', 'Wir haben eine Hausordnung?'),
          N('Ein Wartungstunnel, ein loses Gitter, dann frische Luft, die nach Salz und Diesel stinkt: die Hafenkante. Gut zu wissen, dass die Gleise eine Abkürzung sind. Vom Hafen geht es über den Schrottmarkt in die Neon-Gasse.'),
        ], {
          effects: [geloest, { setFlag: 'gleis_abkuerzung' }, { travel: 'hafenkante', entry: 'von-bahnhof-mitte' }],
        }),
        node('gosse', [
          L('knut', '… Scheiße. Du bist das.'),
          L('kurt', 'Wer?'),
          L('knut', 'Die aus der Suppenküche! Die mir den Nachtisch wieder abgenommen hat! Vor allen! Mit Vanillesoße!'),
          L('kurt', 'Wir gehen. Wir gehen einfach. Ganz würdevoll.'),
          L('knut', 'Das sag ich meiner Mama!'),
        ], { effects: [geloest], next: 'danach' }),
        node('vex', [
          L('knut', 'Psst! Nicht so laut!'),
          L('kurt', 'Plüschsocken?'),
          L('knut', 'Die sind für Mama! Die hat kalte Füße! … Okay, Schrapnell. Du hast uns nicht gesehen, wir haben dich nicht gesehen.'),
          L('player', 'Ich seh euch jeden Tag. Leider.', 'neutral'),
        ], { effects: [geloest], next: 'danach' }),
        node('zahlen', [
          L('knut', 'Zehn? … Zehn ist ein Anfang.'),
          L('kurt', 'Zehn ist eine Beleidigung.'),
          L('knut', 'Eine bezahlte Beleidigung, Kurt. Das ist Wirtschaft. Komm.'),
        ], { effects: [geloest], next: 'danach' }),
        node('kampf', [
          N('Knut lässt die Fingerknöchel knacken. Kurt auch, verzieht das Gesicht und schüttelt die Hand aus.'),
          L('kurt', 'Au. Okay. Jetzt bin ich sauer.'),
        ], {
          effects: [{
            battle: 'enc-bahnhof-abzieher',
            win: [{ dialogue: 'main-1-ankunft-nach-kampf' }],
            lose: [{ dialogue: 'main-1-ankunft-verloren' }],
          }],
        }),
        node('danach', [
          N('Bahnhof Mitte. Kacheln, Rauch, ein Musiker auf einer Kiste. Auf der Treppe zur Neon-Gasse hat jemand „SCHNELLER ALS DIE U-BAHN: LAUFEN“ gesprayt.'),
          N('Das High Voltage liegt in der Neon-Gasse, 18 Uhr. Bis dahin ist Zeit: Auf dem Schrottmarkt läuft das Stadt-TV, und die Kinder am Botenstand wissen sowieso alles.'),
        ]),
      ],
    },

    // Nach dem Kampf am Bahnsteig (Folgedialog des battle-Effekts; die Begegnung bleibt bei Niederlage vor Ort).
    'main-1-ankunft-nach-kampf': {
      id: 'main-1-ankunft-nach-kampf',
      start: 'start',
      nodes: [
        node('start', [
          N('Knut sitzt auf dem Hosenboden und hält sich die Nase. Kurt hält sich Knut. Beide schniefen im Takt.'),
          L('knut', 'Das war unfair! Du hast zurückgehauen!'),
          L('kurt', 'Komm, Knut. Mama macht Fischstäbchen.'),
          N('Sie humpeln die Treppe hoch, und irgendwo auf halber Strecke fängt einer an zu heulen. Du tippst auf Kurt.'),
        ], { next: 'weiter' }),
        node('weiter', [
          N('Das High Voltage liegt in der Neon-Gasse, 18 Uhr. Bis dahin ist Zeit: Auf dem Schrottmarkt läuft das Stadt-TV, und die Kinder am Botenstand wissen sowieso alles.'),
        ]),
      ],
    },

    'main-1-ankunft-verloren': {
      id: 'main-1-ankunft-verloren',
      start: 'start',
      nodes: [
        node('start', [
          N('Kacheln. Kalte Kacheln an der Wange. Über dir zwei Kapuzen, die sich gegenseitig auf die Schulter klopfen.'),
          L('kurt', 'Wir haben gewonnen! Knut, wir haben echt mal gewonnen!'),
          L('knut', 'Psst! Benimm dich wie ein Profi!'),
          N('Knut durchwühlt deine Jackentasche, findet einen alten Kaugummi und eine Fahrkarte von letzter Woche und guckt so enttäuscht, als hätte er dich adoptieren wollen.'),
          L('knut', 'Nix drin. Du bist ja ärmer als wir. Das ist … das ist echt traurig, ey.'),
          L('kurt', 'Gib ihm wenigstens einen Tipp. Mama sagt, man tritt nicht nach, wenn einer schon liegt.'),
          L('knut', 'Na gut. Wenn du Hunter suchst: Neon-Gasse. Frag Oma Volt am Kiosk. Und erzähl keinem, dass wir nett waren!'),
        ], { effects: [{ setFlag: 'ankunft_oma_tipp' }], next: 'weiter' }),
        node('weiter', [
          N('Sie trollen sich. Du rappelst dich auf, klopfst dir den Bahnsteig von der Hose und beschließt, dass Noxius dich gerade nur getestet hat.'),
          N('Das High Voltage liegt in der Neon-Gasse, 18 Uhr. Pünktlich. Mit Nasenbluten zählt auch.'),
        ]),
      ],
    },

    'main-1-ankunft-oma-volt': {
      id: 'main-1-ankunft-oma-volt',
      start: 'start',
      nodes: [
        node('start', [
          L('oma-volt', 'Kindchen, du guckst wie jemand, der Hunter sucht. Alle, die so gucken, suchen Hunter. Oder einen Kredit. Oder ein Klo.', 'signatur'),
        ], {
          effects: [{ setFlag: 'ankunft_oma_volt' }],
          choices: [
            { when: NICHT_VEX, text: '„Wo ist das High Voltage?“', next: 'wo', once: true },
            { when: VEX, text: '„Hunter will mich sehen. Mich. Nicht mein Paket.“', next: 'vex', once: true },
            { text: '„Wie ist Hunter so?“', next: 'hunter', once: true },
            { text: '„Haben Sie was gegen Nerven?“', next: 'limo', once: true },
            { text: '„Danke, Oma Volt.“' },
          ],
        }),
        node('wo', [
          L('oma-volt', 'Direkt da drüben, wo’s blinkt wie ein Weihnachtsbaum mit Stromschlag. Bruno an der Tür lässt abends nur rein, wer Stil hat.'),
          L('oma-volt', 'Oder wer Hunters Nachricht vorzeigt. Oder zwanzig Credits. Stil ist teuer, Kindchen.'),
        ], { next: 'start' }),
        node('vex', [
          L('oma-volt', 'Vex, Kindchen! Sonst bringst du mir nur Pakete und klaust Kaugummi. Hunter heuert dich an? Na, das wurde Zeit.', 'freude'),
          L('oma-volt', 'Und lass Ripper mal wieder an deinen Arm. Der quietscht wie mein Opa Blech.'),
          L('player', 'Ripper fasst den Arm erst wieder an, wenn er mir die Raten erlässt.', 'neutral'),
        ], { next: 'start' }),
        node('hunter', [
          L('oma-volt', 'Pünktlich. Er hasst Leute, die zu spät kommen, mehr als Leute, die ihm Geld schulden. Und das will was heißen, frag mal Dexter.'),
          L('oma-volt', 'Er brummt viel und sagt wenig. Wenn er dich „Neuling“ nennt, ist das ein Kompliment. Wenn er gar nichts sagt, lauf.'),
        ], { next: 'start' }),
        node('limo', [
          L('oma-volt', 'Hier. Volt-Limo, Großmutters Rezept, nur mit mehr Volt. Geht aufs Haus. Beim zweiten Mal nicht mehr.', 'freude'),
        ], { effects: [{ give: 'volt-limo' }], next: 'start' }),
      ],
    },

    'main-1-ankunft-kinder': {
      id: 'main-1-ankunft-kinder',
      start: 'start',
      nodes: [
        node('start', [
          L('daria', 'He, du! Neu hier? Neue brauchen Boten. Boten kosten. Aber nicht viel. Für dich Neukundenrabatt.', 'signatur'),
          L('freya', 'Einspruch! Erst prüfen wir, ob die Person vertrauenswürdig ist. Das steht so in den Regeln.'),
          L('jakko', 'Hast du Hunger? Ich hab immer Hunger. Babettes Dampfnudeln sind wie Wolken mit Füllung.', 'freude'),
          L('daria', 'Sag mal. Kennst du Ripper? Den Schrauber mit dem grünen Kreuz?'),
        ], {
          effects: [{ setFlag: 'ankunft_kinder' }],
          choices: [
            { text: '„Nie gehört. Sollte ich?“', next: 'ripper' },
            { when: VEX, text: '„Ripper hat mir den Arm verkauft. Auf Raten. Was ist mit ihm?“', next: 'ripper-vex' },
            { tag: '[Gosse]', when: { origin: 'origin-gossenkind' }, text: '„Ich hab früher auch Implantate aus Mülltonnen gezogen. Was habt ihr gefunden?“', next: 'gosse' },
          ],
        }),
        node('ripper-vex', [
          L('daria', 'Du bist doch die Kurierin! Schrapnell! Nimmst du Lehrlinge? Ich bin schnell und ich lüge gut.', 'freude'),
          L('freya', 'Lügen ist kein Qualifikationsmerkmal, Daria.'),
        ], { next: 'ripper' }),
        node('gosse', [
          L('jakko', 'Echt?! Dann bist du eine von uns! Fast. Du bist größer.', 'freude'),
        ], { effects: [{ relation: 'daria', delta: 20 }, { relation: 'freya', delta: 20 }, { relation: 'jakko', delta: 20 }], next: 'ripper' }),
        node('ripper', [
          L('daria', 'Wir haben ein Implantat gefunden. Ein echt gutes. Ripper kauft heute Abend im High Voltage, an seinem Ecktisch.'),
          L('daria', 'Er zahlt immer nur zehn Credits. Zehn! Für drei Leute!', 'wut'),
          L('freya', 'Das ist Ausbeutung. Ich hab das Wort nachgeschlagen.'),
          L('jakko', 'Zehn Credits sind drei Dampfnudeln. Und eine halbe, wenn Babette gute Laune hat.'),
        ], {
          choices: [
            {
              text: '„Ich bin heute Abend auch im High Voltage. Ich pass auf.“', next: 'versprochen',
              effects: [{ setFlag: 'ankunft_kinder_versprochen' }, { relation: 'daria', delta: 20 }, { relation: 'freya', delta: 20 }, { relation: 'jakko', delta: 20 }],
            },
            { text: '„Viel Glück. Ernsthaft.“', next: 'tschuess' },
          ],
        }),
        node('versprochen', [
          L('freya', 'Das ist ein mündlicher Vertrag. Ich hab Zeugen.', 'signatur'),
          L('daria', 'Achtzehn Uhr. Sei nicht zu spät, sonst ist Hunter sauer und Ripper weg.'),
        ]),
        node('tschuess', [
          L('jakko', 'Wenn du Hunger kriegst: Babette! Sag, Jakko schickt dich. Dann kriegst du nichts extra, aber sie lächelt.'),
        ]),
      ],
    },
  },

  mapAdditions: {
    'bahnhof-mitte': {
      onEnter: [
        // Sicherheitsnetz (Sprünge, alte Stände): Wer nach dem Prolog ohne gestellte Uhr ankommt, landet um 16:30.
        { id: 'ankunft-uhr', when: { all: [{ flag: 'prolog_done' }, { notFlag: 'ankunft_uhr' }] }, effects: [{ setClock: ANKUNFT }, { setFlag: 'ankunft_uhr' }] },
        { id: 'ankunft-intro', when: ABZIEHER_OFFEN, cutscene: 'main-1-ankunft-intro', dialogue: 'main-1-ankunft-abzieher' },
      ],
    },
    schrottmarkt: {
      hotspots: [
        {
          id: 'ankunft-stadt-tv', at: 'stadt-tv', label: 'Stadt-TV: „Sieben Jahre Quantum“', kind: 'look', once: true,
          when: { all: [{ flag: 'prolog_done' }, { notFlag: 'ankunft_tv' }] },
          lines: [
            L('collin-charleston', 'Sieben Jahre Quantum Industries, Noxius! Sieben Jahre Fortschritt, sieben Jahre Glanz, sieben Jahre Gratis-Sticker zu jedem Upgrade!', 'freude'),
            L('delya-delloraine', 'Und sieben Jahre, seit Digitech pleiteging. Zufall, sagt Quantum.', 'neutral'),
            L('blade', 'Wir teilen unseren Erfolg mit der ganzen Stadt. Ehrlich. Ich liebe es zu teilen.', 'signatur'),
            N('Ein Rentner neben dir spuckt in einen Blumenkübel. Der Blumenkübel ist aus Plastik und hat schon Schlimmeres gesehen.'),
          ],
          effects: [{ setFlag: 'ankunft_tv' }],
        },
        {
          id: 'ankunft-kinder', at: 'botenstand', label: 'Die Kinder am Botenstand', kind: 'talk', dialogue: 'main-1-ankunft-kinder',
          when: { all: [{ flag: 'prolog_done' }, { notFlag: 'ankunft_kinder' }, VOR_PROBEZEIT, { time: ['tag', 'abend'] }, KINDERZEIT] },
        },
      ],
    },
    'neon-gasse': {
      hotspots: [{
        id: 'ankunft-oma-volt', at: 'kiosk', label: 'Oma Volt nach Hunter fragen', kind: 'talk', dialogue: 'main-1-ankunft-oma-volt',
        when: { all: [{ flag: 'prolog_done' }, { notFlag: 'ankunft_oma_volt' }, VOR_PROBEZEIT, { time: ['morgen', 'tag', 'abend'] }] },
      }],
    },
  },
};
