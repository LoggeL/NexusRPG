// Vex Schrapnell als Figur der Welt (world.md §2.1a „Wenn man nicht Vex spielt“, §4.4, §4.6, §11.2).
// Nur wenn die Spielfigur NICHT Vex ist: erster Tagesablauf-Eintrag `away` bei { playerIs: 'vex' }, alle
// Gespräche und Herz-Ereignisse zusätzlich mit NICHT_VEX. Nur Freundschaft (NEVER_ROMANCE in content/romance.ts).
// Tagesablauf nach design/plan/act1.json (npcSchedules.vex-schrapnell), Herz-Ereignisse 2/4/6 laut events,
// 8/10 angelegt und an act2 gebunden. Begleiterin ab ♥4 (Reflexe, Fernkampf mit Nagelpistole).
// Lieferkette „Schrapnell-Paket“: Vex gibt ein Paket aus (Flag je Ziel), Empfänger sind eigene Weltfiguren
// (Opa Gurrmann, Salzige Grete, Gerda Gleis, Mutter Brühe) – deren Dateien zahlen aus und löschen das Flag.
import type { ContentPart } from '../../part';
import type { AbilityDef, Condition, DialogueChoice, DialogueNode, NpcDef } from '../../../modules/contracts';
import {
  type Menue, NICHT_VEX, VEX, ZEIT_HINWEIS, dialog, erz, flag, gespraech, herz, ich, knoten, nichtGetroffen, ort,
  pruefung, rede, sammle, sprecher, weg, zurueck,
} from './_welt';

const ID = 'vex-schrapnell';
const V = sprecher(ID);
const KAS = sprecher('narrator');

const PAKET_FLAGS = ['vex_paket_gurrmann', 'vex_paket_grete', 'vex_paket_gerda', 'vex_paket_bruehe'] as const;
const HAT_PAKET: Condition = { any: PAKET_FLAGS.map((f) => ({ flag: f })) };
const KEIN_PAKET: Condition = { not: HAT_PAKET };
const PARTNER: Condition = { flag: 'vex_kurier_partner' };

// ---------------------------------------------------------------------------------------------- Menü

function menue(): Menue {
  const Z = zurueck('Noch was, Chefin.', 'Ich roll dann mal.');

  /** Paket-Ausgabe je Wochentag an eine andere Adresse. */
  const paket = (tage: ('mo' | 'di' | 'mi' | 'do' | 'fr' | 'sa' | 'so')[], ziel: typeof PAKET_FLAGS[number], node: string): DialogueChoice => ({
    text: 'Gib mir ein Paket.', tag: '[Kurier]', next: node, id: `paket-${node}`,
    when: { all: [PARTNER, KEIN_PAKET, { weekday: tage }, { time: ['morgen', 'tag', 'abend'] }] },
    effects: [flag(ziel)],
  });

  const choices: DialogueChoice[] = [
    paket(['mo', 'do'], 'vex_paket_gurrmann', 'paket-gurrmann'),
    paket(['di', 'fr'], 'vex_paket_grete', 'paket-grete'),
    paket(['mi', 'sa'], 'vex_paket_gerda', 'paket-gerda'),
    paket(['so'], 'vex_paket_bruehe', 'paket-bruehe'),
    { text: 'Ich hab das Paket noch. Wohin nochmal?', when: HAT_PAKET, next: 'paket-wohin' },
    { text: 'Arbeit? Für mich?', when: { not: PARTNER }, next: 'arbeit-vorher' },
    {
      text: 'Rennen wir? Heute Nacht, übers Dach.', tag: '[Dachrennen]', next: 'rennen',
      when: { all: [{ seen: 'he-vex-schrapnell-4' }, { weekday: ['fr', 'sa'] }, { time: 'nacht' }] },
    },
    {
      text: 'Kommst du mit? Ich könnte Rückendeckung brauchen.', tag: '[Vex ♥4]', next: 'mitkommen',
      requires: { hearts: ID, min: 4 }, when: { not: { recruited: ID } },
      effects: [{ recruit: ID }],
    },
    { text: 'Der Arm. Ripper-Ware, oder?', tag: '[Vex ♥3]', requires: { hearts: ID, min: 3 }, once: true, id: 'v-arm', next: 'arm' },
    { text: 'Wie ist Aria so? Ehrlich.', when: { met: 'aria' }, once: true, id: 'v-aria', next: 'aria' },
    { text: '„Rohrsiedlung. Wasserturm. Du kennst das.“', tag: '[Gosse]', when: { origin: 'origin-gossenkind' }, once: true, id: 'v-gosse', next: 'gosse' },
    { text: '„Ich war mal bei der Wache. Bevor du wegläufst –“', tag: '[Ex-Wache]', when: { origin: 'origin-ex-wache' }, once: true, id: 'v-wache', next: 'wache' },
    { text: '„Oberstadt. Ja. Ich weiß, wie ich aussehe.“', tag: '[Oberstadt]', when: { origin: 'origin-oberstadt' }, once: true, id: 'v-oberstadt', next: 'oberstadt' },
    { text: 'Was ist mit der Lücke? Die markierte Stelle auf dem Dach.', when: { seen: 'he-vex-schrapnell-4' }, once: true, id: 'v-luecke', next: 'luecke' },
    { text: 'Ich roll dann mal.' },
  ];

  const nodes: DialogueNode[] = [
    knoten('paket-gurrmann', [
      erz('Vex wirft dir ein Paket zu, eingewickelt in Panzertape und schlechte Laune. Es gurrt. Leise.'),
      V('Opa Gurrmann. Taubenschlag, Lötgassen. Nicht schütteln. Nicht fragen. Nicht füttern.', 'signatur'),
    ], { choices: Z }),
    knoten('paket-grete', [
      erz('Ein Paket, nass an einer Ecke, riecht nach Ebbe und Diesel.'),
      V('Salzige Grete. Fischstand, Hafenkante. Wenn’s tropft, ist das normal. Wenn’s zappelt, lauf.', 'neutral'),
    ], { choices: Z }),
    knoten('paket-gerda', [
      erz('Ein flaches Paket mit dem Stempel „DRINGEND – SEIT 2079“.'),
      V('Gerda Gleis. Fundbüro, Bahnhof Mitte. Sie will, dass man klingelt. Klingel nicht. Sie redet dann.', 'signatur'),
    ], { choices: Z }),
    knoten('paket-bruehe', [
      erz('Ein Sack, der aussieht wie Kartoffeln und sich anfühlt wie Kartoffeln.'),
      V('Mutter Brühe. Suppenküche, Rohrsiedlung. Sind Kartoffeln. Sonntag ist Kartoffeltag. Frag nicht, wer das entschieden hat.', 'neutral'),
    ], { choices: Z }),
    knoten('paket-wohin', [
      V('Steht drauf, Frischfleisch. Mit Edding. In Großbuchstaben.', 'wut'),
      V('Taubenschlag, Fischstand, Fundbüro oder Suppenküche. Je nachdem, was gurrt, tropft, staubt oder nach Kartoffel riecht.'),
    ], { choices: Z }),
    knoten('arbeit-vorher', [
      V('Ich geb keinem Pakete, den ich nicht rennen gesehen hab.'),
      V('Komm morgens zur Paketausgabe am Bahnhof. Dann sehen wir, ob du Beine hast oder nur Schuhe.', 'signatur'),
    ], { choices: Z }),
    knoten('rennen', [
      V('Freitagnacht. Natürlich renn ich. Ich renn immer.', 'freude'),
      V('Kreidestrich am Lüftungsschacht. Bis zum Taubenschlag. Wer verliert, zahlt die Volt-Limo.'),
    ], {
      choices: [
        {
          text: 'Los!',
          effects: [{
            minigame: 'akt-dachrennen', level: 3, key: 'vex-dachrennen', label: 'Dachrennen gegen Vex',
            win: [{ credits: 40 }, herz(ID, 25), { message: 'Vex: „… Glück. Reines Glück. Revanche.“' }],
            lose: [herz(ID, 15), { credits: -5 }, { message: 'Vex: „Volt-Limo. Kalt. Jetzt.“' }],
          }],
        },
        { text: 'Heute nicht. Meine Knie.', next: 'menue' },
      ],
    }),
    knoten('mitkommen', [
      V('Rückendeckung. Hm.'),
      V('Ich bin schnell, ich treff, und ich red nicht beim Schießen. Wenn du anfängst, Pläne zu erklären, bin ich weg.', 'signatur'),
      V('Ruf mich an. Ich bin in zwanzig Minuten da. Egal wo. Ich kenn die Dächer.'),
    ], { choices: Z }),
    knoten('arm', [
      erz('Der rechte Arm zischt, als sie die Finger beugt. Graphitschwarze Platten, Kratzer, dünne cyanfarbene Nähte. Die Finger kommen eine Spur zu spät.'),
      V('Ripper-Ratenarm. Straßenklinik-Modell. Zischt, wenn’s kalt ist. Und wenn’s warm ist. Und wenn ich lüge.', 'neutral'),
      V('Jeden Montagabend zahl ich bar an seinem Ecktisch. Noch einunddreißig Raten. Ich zahl nie zu spät.'),
      V('Ich schulde keinem was. Außer Ripper. Und der zählt nicht.', 'signatur'),
      ich('Und wenn du nicht zahlst?'),
      V('Dann holt er ihn sich. Steht im Vertrag. Kleingedruckt. Ich hab’s gelesen. Hat zwei Stunden gedauert, die Schrift ist echt klein.', 'wut'),
    ], { choices: Z, effects: [herz(ID, 20)] }),
    knoten('aria', [
      V('Zöpfe? Laut. Flucht wie ein Hafenkran. Haut Mülltonnen durch Wände.', 'neutral'),
      V('Hat mir mal mit ihrem Schläger ein Paket aus der Hand geschlagen, weil sie dachte, es tickt. Es hat getickt. War ein Wecker.'),
      V('… Sie ist okay. Sag’s ihr nicht. Sonst will sie wieder armdrücken, und ihr Arm ist geschenkt und meiner ist geliehen.', 'signatur'),
    ], { choices: Z }),
    knoten('gosse', [
      V('Wasserturm. Das Nest. Klar kenn ich das. Ich hab da mal drei Wochen auf dem Dach geschlafen, bevor die Kinder mich rausgeschmissen haben.', 'freude'),
      V('Daria hat mir eine Rechnung gestellt. Für Übernachtung. Ich hab bezahlt. Die Kleine geht weit.'),
    ], { choices: Z, effects: [herz(ID, 30)] }),
    knoten('wache', [
      V('Wache. Na super.', 'wut'),
      erz('Ihre linke Hand legt sich ganz beiläufig auf die Nagelpistole.'),
      V('Ich lauf nicht weg. Ich renn. Ist ein Unterschied. Rennen mach ich freiwillig.'),
      V('Solang du keine Handschellen dabeihast, reden wir. Hast du Handschellen dabei?'),
      ich('Nein.'),
      V('Dann reden wir. Kurz.', 'signatur'),
    ], { choices: Z }),
    knoten('oberstadt', [
      V('Du siehst aus wie ein Paket, das jemand falsch zugestellt hat.', 'signatur'),
      V('Keine Sorge. Ich stell auch falsche Pakete zu. Gegen Aufpreis.'),
    ], { choices: Z }),
    knoten('luecke', [
      erz('Vex schaut nicht hin, als du auf die Kreidemarkierung zwischen den Dächern zeigst. Sie schaut sehr gründlich nicht hin.'),
      V('Viereinhalb Meter. Neun Stockwerke.', 'besorgt'),
      V('Da springt keiner. Das ist keine Abkürzung, das ist ’ne Regel. Ich nehm die Feuertreppe. Jedes Mal.'),
      V('Frag nicht weiter. Ich hab’s dir gesagt, weil du’s sonst irgendwann probierst. Probier’s nicht.', 'wut'),
    ], { choices: Z, effects: [flag('vex_luecke_erwaehnt')] }),
  ];
  return { zeile: V('Noch was? Mach hin, ich hab Pakete, die älter werden.'), choices, nodes };
}

const M = menue();

// ---------------------------------------------------------------------------------------------- Tagesgespräche

const T = {
  rivale: dialog('vex-tag-rivale', [
    knoten('start', [
      V('Du schon wieder.', 'wut'),
      V('Ich stell dir nichts mehr zu. Nicht mal Rechnungen. Und die stell ich jedem zu.'),
    ], { choices: [{ text: 'Vex, warte –', next: 'warte' }, { text: 'Dann eben nicht.' }] }),
    knoten('warte', [V('Ich warte nie. Das weißt du.', 'signatur')]),
  ]),
  erstes: gespraech('vex-tag-erstes', [
    erz('Eine junge Frau in Schwarz, Gurtzeug über den Schultern, ein graphitschwarzer Metallarm statt des rechten. Sie mustert dich wie ein Paket ohne Absender.'),
    V('Was guckst du, Frischfleisch? Willst du was abholen oder was loswerden?', 'neutral'),
    ich('Ich bin neu hier.'),
    V('Seh ich. Du guckst nach oben, wenn’s klappert. Hier unten guckt man nach oben, wenn’s still wird.', 'signatur'),
    V('Vex. Schrapnell-Kuriere. Wir liefern, was andere nicht anfassen. Pünktlich. Meistens heil.'),
  ], M),
  begleitung: gespraech('vex-tag-begleitung', [
    V('Wir stehen rum. Warum stehen wir rum? Rumstehen ist, wie man geschnappt wird.', 'wut'),
    V('Sag, wohin. Ich lauf vor. Du läufst hinterher. So funktioniert das.'),
  ], M),
  zeit: gespraech('vex-tag-zeit', [
    V('Du kommst echt jeden Tag. Langsam bist du Stammkunde.', 'freude'),
    erz(ZEIT_HINWEIS),
  ], M),
  ariaRomanze: gespraech('vex-tag-aria-romanze', [
    V('Du und Zöpfe. Hm.', 'ueberrascht'),
    V('Ganz Lötgassen redet davon. Die Tauben auch. Opa Gurrmann sagt, eine hat „endlich“ gegurrt.'),
    V('Pass auf sie auf. Sie tut hart. Ist sie auch. Aber nicht überall.', 'signatur'),
  ], M, [flag('vex_kommentar_aria_romanze')]),
  paket: gespraech('vex-tag-paket', [
    V('Das Paket in deiner Tasche wird nicht frischer. Ich riech das von hier.', 'wut'),
  ], M),
  ratentag: gespraech('vex-tag-ratentag', [
    erz('Vex zählt Scheine auf einer Paketkiste. Zweimal. Dann ein drittes Mal, langsamer.'),
    V('Montag. Ratentag. Ripper sitzt um neun am Ecktisch und lächelt, als hätte er mich gebaut.', 'besorgt'),
    V('Hat er ja auch. Teilweise. Der Teil, der zischt.'),
  ], M),
  morgen: gespraech('vex-tag-morgen', [
    erz('Die Paketausgabe am Bahnhof: Kisten, Kartons, ein Sack, der sich bewegt. Vex wirft Pakete in Kurierrucksäcke, ohne hinzusehen. Sie trifft jedes Mal.'),
    V('Morgen. Kaffee hab ich nicht. Zeit auch nicht. Paket vielleicht.', 'neutral'),
  ], M),
  tag: gespraech('vex-tag-dach', [
    erz('Sie sitzt auf der Dachkante, Beine über neun Stockwerken Luft, und isst Synth-Nudeln aus der Dose.'),
    V('Hier oben gibt’s keine Ampeln, keine Wache und keinen Hunter, der auf die Uhr guckt. Das ist der beste Ort der Stadt.', 'freude'),
    V('Setz dich. Nicht so nah an die Kante. Doch, so. Feigling.'),
  ], M),
  abend: gespraech('vex-tag-bude', [
    erz('Das Rolltor der Kurierbude ist halb oben. Drinnen: Paketregale bis zur Decke, eine Kochplatte, ein Funkgerät, das leise rauscht.'),
    V('Feierabend gibt’s nicht. Es gibt nur weniger Pakete.', 'neutral'),
  ], M),
  nachtRennen: gespraech('vex-tag-rennen', [
    erz('Auf den Dächern über der Neon-Gasse stehen Kuriere mit Leuchtstreifen und wetten mit Kronkorken. Vex dehnt die Waden an einem Lüftungsschacht.'),
    V('Rennnacht. Wer zuguckt, wettet. Wer wettet, rennt irgendwann selber.', 'signatur'),
  ], M),
  vertraut: gespraech('vex-tag-vertraut', [
    V('Da bist du ja. Hab dich auf dem Funk gesucht. Nicht gesucht. Gehört. Zufällig.', 'ueberrascht'),
    V('War nicht komplett scheiße, dass du gekommen bist.', 'signatur'),
  ], M),
  standard: gespraech('vex-tag-standard', [
    V('Was. Ich bin beschäftigt. Sag schnell.', 'neutral'),
  ], M),
};

// ---------------------------------------------------------------------------------------------- Herz-Ereignisse

/** ♥2: erste Lieferung zusammen, Abkürzung übers Dach [Reflexe 5] (Bahnhof Mitte, morgens). */
const he2 = dialog('he-vex-schrapnell-2', [
  knoten('start', [
    erz('Paketausgabe, Bahnhof Mitte, sieben Uhr irgendwas. Vex hält ein Paket hoch, das so aussieht, als hätte es schon drei Kurierfirmen überlebt.'),
    V('Frischfleisch. Komm her. Ich hab ein Problem, und du hast Beine.', 'neutral'),
    V('Das Ding muss in zwanzig Minuten an den Taubenschlag in den Lötgassen. Mein Fahrer liegt mit Rostgrippe im Bett. Sagt er. Ich sag, er liegt mit Kiki im Bett.'),
    V('Du kommst mit. Ich zeig dir, wie man liefert. Wenn du mithältst, kriegst du Pakete. Wenn nicht, kriegst du einen Spitznamen.', 'signatur'),
  ], {
    choices: [
      { text: '„Übers Dach. Dir hinterher.“', tag: '[Reflexe 5]', check: pruefung('he-vex-schrapnell-2-dach', 'reflexe', 5, ['klettern', 'sprung']), next: 'dach' },
      { text: '„Ich kenn ’nen Weg durch den Wäschehof. Kein Mensch guckt da.“', tag: '[Straße 4]', check: pruefung('he-vex-schrapnell-2-waesche', 'strasse', 4), next: 'waesche' },
      { text: '„Ich nehm die U-Bahn. Die ist auch schnell.“', next: 'ubahn' },
    ],
  }),
  knoten('dach', [
    erz('Feuerleiter, Wellblech, ein Sprung über einen Spalt, so schmal, dass man ihn fast übersieht. Vex rennt, als wäre die Stadt eine Treppe, die nur für sie gebaut wurde. Du bist zwei Schritte hinter ihr. Dann einen.'),
    erz('Am Taubenschlag landet ihr gleichzeitig. Opa Gurrmann guckt auf die Uhr. Elf Minuten.'),
    V('… Hm.', 'ueberrascht'),
    V('War nicht komplett scheiße.', 'signatur'),
    ich('Ist das ein Kompliment?'),
    V('Das ist das Kompliment. Ein besseres gibt’s nicht. Gewöhn dich nicht dran.', 'freude'),
  ], { next: 'lohn', effects: [herz(ID, 40), { xp: 60 }, { advanceTime: 15 }] }),
  knoten('waesche', [
    erz('Durch den Wäschehof, unter tropfenden Laken, an einer Oma vorbei, die euch mit der Wäscheklammer droht. Ihr kommt raus, Vex hat eine Socke auf der Schulter.'),
    V('Sechzehn Minuten. Nicht übel für jemanden, der unten bleibt.', 'neutral'),
    V('Und die Socke behalt ich. Die ist besser als meine.', 'signatur'),
  ], { next: 'lohn', effects: [herz(ID, 30), { xp: 50 }, { advanceTime: 20 }] }),
  knoten('ubahn', [
    erz('Die U-Bahn kommt. Natürlich zu spät. Natürlich ohne Licht. Als du am Taubenschlag ankommst, sitzt Vex schon auf dem Geländer und isst eine Nougatbombe.'),
    V('Neunundzwanzig Minuten. Das Paket ist trotzdem angekommen. Ich hab’s dir nämlich nicht gegeben.', 'signatur'),
    V('Aber du bist nicht umgedreht. Du bist angekommen. Das zählt auch was. Ein bisschen.'),
  ], { next: 'lohn', effects: [herz(ID, 15), { xp: 30 }, { advanceTime: 30 }] }),
  knoten('lohn', [
    erz('Sie drückt dir zerknitterte Scheine in die Hand und einen Leuchtstreifen, wie ihn die Schrapnell-Kuriere am Rucksack tragen.'),
    V('Dreißig. Dein Anteil. Ab jetzt kannst du dir Pakete bei mir abholen. Paketausgabe morgens, Kurierbude abends.'),
    V('Regel eins: Nicht anhalten. Regel zwei: Nicht reinschauen. Regel drei: Wenn’s gurrt, gehört’s Gurrmann.', 'signatur'),
  ], { effects: [{ credits: 30 }, flag('vex_kurier_partner'), { message: 'Du kannst jetzt bei Vex Pakete abholen.' }] }),
]);

/** ♥4: Dachrennen gegen ihre Crew (Neon-Gasse, Fr/Sa nachts) – verlieren ist ok, aufgeben nicht. */
const he4 = dialog('he-vex-schrapnell-4', [
  knoten('start', [
    erz('Freitagnacht, Dächer über der Neon-Gasse. Unten wummert der Bass aus dem High Voltage, oben stehen sieben Kuriere mit Leuchtstreifen im Kreis. Ein Kreidestrich am Lüftungsschacht. Kronkorken wechseln den Besitzer.'),
    V('Du kommst genau richtig. Meine Leute glauben nicht, dass du mithältst. Ich hab gewettet, dass doch.', 'signatur'),
    V('Wenn du verlierst, bin ich zwölf Kronkorken ärmer. Wenn du aufgibst, red ich nie wieder mit dir. Verlieren ist okay. Aufgeben nicht.'),
    erz('Ein Kurier mit Irokesen grinst: „Die Neue? Die fällt doch schon beim Anlauf vom Dach.“'),
  ], {
    choices: [
      { text: '„Kreidestrich. Los.“', next: 'rennen' },
      { text: '„Ich kürz über die Lücke ab. Da drüben, wo die Kreide ist.“', next: 'luecke' },
      { text: '„Ich … steig lieber aus.“', next: 'aufgeben' },
    ],
  }),
  knoten('luecke', [
    erz('Bevor du einen Schritt machst, sind schwarze Metallfinger um deinen Gurt. Fest. Fester als nötig.'),
    V('Nicht die Lücke.', 'wut'),
    erz('Die Kuriere werden still. Einer schaut auf seine Schuhe.'),
    V('Viereinhalb Meter. Neun Stock. Da springt keiner. Regel. Kapiert?', 'besorgt'),
    ich('Kapiert.'),
    V('Gut. Dann renn. Und renn um die Lücke rum, wie jeder andere auch.'),
  ], { next: 'rennen', effects: [flag('vex_luecke_erwaehnt')] }),
  knoten('rennen', [
    erz('Der Irokese pfeift. Ihr rennt.'),
  ], {
    effects: [{
      minigame: 'akt-dachrennen', level: 2, key: 'he-vex-schrapnell-4', label: 'Dachrennen gegen die Schrapnell-Kuriere',
      win: [herz(ID, 50), { credits: 60 }, { xp: 90 }, flag('vex_rennen_gewonnen'), { dialogue: 'he-vex-schrapnell-4-sieg' }],
      lose: [herz(ID, 35), { xp: 70 }, { dialogue: 'he-vex-schrapnell-4-ziel' }],
    }],
  }),
  knoten('aufgeben', [
    V('…', 'wut'),
    V('Hast du gerade „aussteigen“ gesagt? Auf meinem Dach? Vor meinen Leuten?'),
    erz('Die Kuriere johlen. Vex nicht.'),
  ], {
    choices: [
      { text: '„War ein Witz. Kreidestrich. Jetzt.“', next: 'rennen' },
      { text: '„Ich mein’s ernst. Ich hab heute keine Beine.“', next: 'aufgegeben' },
    ],
  }),
  knoten('aufgegeben', [
    V('Dann geh runter. Die Treppe. Langsam. Wie Leute, die Treppen nehmen.', 'wut'),
    V('Komm wieder, wenn du Beine hast. Freitag ist jede Woche.'),
  ], { effects: [herz(ID, -40)] }),
]);

/** Nachspiel des Rennens: gemeinsames Ende mit Begleiter-Angebot. */
const rennenEnde = (): ReturnType<typeof knoten>[] => [
  knoten('ende', [
    erz('Später sitzt ihr auf dem Dach des Taubenschlags. Unter euch die Lötgassen, Funken aus Dantes Fenster, irgendwo ein Hund, der Saxofon hasst.'),
    V('Hör zu. Wenn du mal Ärger hast – richtigen Ärger, Ripper-Ärger, Rostzahn-Ärger –, dann ruf mich.', 'neutral'),
    V('Ich bin schnell. Ich treff. Und ich red nicht beim Schießen.', 'signatur'),
  ], {
    choices: [
      { text: '„Dann komm mit. Jetzt gleich.“', next: 'dabei', effects: [{ recruit: ID }] },
      { text: '„Ich meld mich.“', next: 'spaeter' },
    ],
  }),
  knoten('dabei', [V('Gut. Ich lauf vor. Versuch, mitzuhalten.', 'freude')], { effects: [{ message: 'Vex kann dich jetzt als Begleiterin unterstützen (Wechsel im High Voltage oder per Telefon).' }] }),
  knoten('spaeter', [V('Meld dich nicht zu spät. Ich hass Leute, die zu spät kommen. Hunter auch. Das ist das Einzige, was wir gemeinsam haben.', 'signatur')]),
];

const he4Sieg = dialog('he-vex-schrapnell-4-sieg', [
  knoten('start', [
    erz('Du schlägst als Erste am Taubenschlag an. Hinter dir fluchen sieben Kuriere in sieben verschiedenen Tonarten. Opa Gurrmanns Tauben flattern empört auf.'),
    V('Zwölf Kronkorken. ZWÖLF.', 'freude'),
    V('Hab ich doch gesagt. Die hat Beine. Die guckt nicht nach unten. Zahlt, ihr Pfeifen.'),
    erz('Sie boxt dir gegen die Schulter. Mit dem Metallarm. Es tut weh. Es ist gemeint als Zuneigung.'),
  ], { next: 'ende' }),
  ...rennenEnde(),
]);

const he4Ziel = dialog('he-vex-schrapnell-4-ziel', [
  knoten('start', [
    erz('Du kommst als Fünfte an, keuchend, ein Knie aufgeschürft, eine Taube auf dem Kopf. Aber du kommst an.'),
    V('Fünfte. Hinter Rotz-Rolf. Peinlich.', 'signatur'),
    V('Aber du bist nicht stehen geblieben. Kein einziges Mal. Hab’s gesehen.'),
    V('War nicht komplett scheiße.', 'freude'),
  ], { next: 'ende' }),
  ...rennenEnde(),
]);

/** ♥6: Lieblingsplatz am Funkmast (Lötgassen, abends). Freundschaftsfassung, die Kas-Geschichte bleibt angedeutet. */
const he6 = dialog('he-vex-schrapnell-6', [
  knoten('start', [
    erz('Über Opa Gurrmanns Taubenschlag steht ein alter Funkmast, rot-weiß, die Farbe abgeblättert. Eine Leiter, eine Wartungsplattform, und an den Streben hängen Dutzende Armbänder: Gummi, Stoff, Leder, verblichen von Jahren Smog.'),
    V('Hier komm ich her, wenn unten alles zu laut ist.', 'neutral'),
    V('Jedes Armband ist ein Kurier. Einer, der aufgehört hat. Oder umgezogen ist. Oder … einfach aufgehört hat.'),
    erz('Ihr Funkgerät knackt. Auf Kanal 9 läuft eine Schleife, eine Männerstimme, rau und gut gelaunt:'),
    KAS('„Schrapnell eins an alle: Nicht anhalten. Nicht umdrehen. Wir sehen uns im Ziel.“'),
    erz('Vex dreht nicht leiser. Sie dreht auch nicht weg.'),
  ], {
    choices: [
      { text: '„Wer ist Schrapnell eins?“', next: 'frage' },
      { text: '(Nichts sagen. Neben ihr sitzen bleiben.)', next: 'schweigen' },
      { text: '„Du musst nichts erzählen. Ich bin einfach hier.“', tag: '[Ausstrahlung 5]', check: pruefung('he-vex-schrapnell-6-da', 'ausstrahlung', 5), next: 'da' },
    ],
  }),
  knoten('frage', [
    V('Frag nicht.', 'wut'),
    V('…'),
    V('Mein Bruder. Hat die Kuriere gegründet. Ich war Schrapnell zwei.', 'trauer'),
    V('Mehr gibt’s heute nicht. Nicht, weil du’s nicht wert bist. Weil ich’s heute nicht kann.'),
  ], { next: 'armband', effects: [herz(ID, 30), flag('vex_bruder_erwaehnt')] }),
  knoten('schweigen', [
    erz('Ihr sitzt. Die Schleife läuft dreimal durch. Unten pfeift ein Teekessel, oben zieht der Smog in rosa Streifen über die Dächer.'),
    V('Danke.', 'ueberrascht'),
    V('Die meisten reden. Wenn’s still wird, reden alle. Du nicht.'),
  ], { next: 'armband', effects: [herz(ID, 40)] }),
  knoten('da', [
    erz('Sie schaut dich an. Lange. Dann lehnt sie sich zurück an die Strebe, den Metallarm locker über dem Knie.'),
    V('Hm. Das war fast nett.', 'ueberrascht'),
    V('Die Stimme da … das ist mein Bruder. Kas. Er hat gesagt, wer anhält, wird geschnappt. Ich halt nie an.', 'trauer'),
    V('Hier oben schon. Nur hier. Komisch, oder?'),
  ], { next: 'armband', effects: [herz(ID, 50), flag('vex_bruder_erwaehnt')] }),
  knoten('armband', [
    erz('Sie zieht ein Funkgerät aus der Hüfttasche, robust, Gummiantenne, Gürtelclip, und drückt es dir gegen die Brust.'),
    V('Hier. Kurierfunk. Kanal 4 bin ich. Kanal 9 lässt du in Ruhe.', 'neutral'),
    V('Wer funkt, verliert sich nicht. Sagen die Kuriere. Ich sag: Wer funkt, kann wenigstens Bescheid sagen, wo er liegt.'),
  ], {
    choices: [
      { text: 'Ein eigenes Armband an die Strebe knoten.', next: 'knoten' },
      { text: '„Danke, Vex.“', next: 'danke' },
    ],
  }),
  knoten('knoten', [
    erz('Du knotest ein Stück Kabelbinder-Gummi an die Strebe. Es ist hässlich. Vex starrt es an.'),
    V('Das ist kein Armband. Das ist Müll an einem Funkmast.', 'signatur'),
    V('… Bleibt hängen. Damit ich weiß, dass du noch rennst.', 'freude'),
  ], { effects: [flag('vex_funkmast'), { give: 'kurier-funk' }, { xp: 100 }, herz(ID, 20)] }),
  knoten('danke', [
    V('Hör auf. Danke ist für Leute, die sich wiedersehen wollen.', 'signatur'),
    V('… Wir sehen uns. Freitag. Dach. Sei pünktlich.'),
  ], { effects: [flag('vex_funkmast'), { give: 'kurier-funk' }, { xp: 100 }] }),
]);

/** ♥8 (act2): Eine Lieferung für Ripper geht schief, man steht ihr bei. */
const he8 = dialog('he-vex-schrapnell-8', [
  knoten('start', [
    erz('Kurierbude, spät. Das Rolltor ist halb unten, darunter Licht. Drinnen: Vex, ein aufgeplatztes Paket und ein Zerleger mit Metzgerschürze, der sehr ruhig dasteht.'),
    sprecher('ripper')('Was haben wir denn da? Mein Paket. Offen. Und leer. Das kostet, Schrapnell. Das kostet eine Rate extra. Oder einen Arm.', 'signatur'),
    V('Ich hab nicht reingeschaut. Das war schon offen. Das war schon leer.', 'wut'),
  ], {
    choices: [
      { text: '„Sie lügt nicht. Ich war dabei.“', tag: '[Ausstrahlung 6]', check: pruefung('he-vex-schrapnell-8-zeuge', 'ausstrahlung', 6), next: 'zeuge' },
      { text: '„Wer hat das Paket vor ihr gehabt, Ripper? Zeig den Lieferschein.“', tag: '[Straße 6]', check: pruefung('he-vex-schrapnell-8-schein', 'strasse', 6), next: 'schein' },
      { text: 'Die Rate aus eigener Tasche zahlen (120 Cr).', requires: { credits: 120 }, effects: [{ credits: -120 }], next: 'zahlen' },
      { text: 'Wortlos zwischen die beiden treten und stehen bleiben.', next: 'stehen' },
    ],
  }),
  knoten('stehen', [
    erz('Du stellst dich vor Vex. Ripper mustert dich von oben bis unten, wie ein Metzger ein Stück Fleisch, das er für zu zäh hält.'),
    sprecher('ripper')('Rührend. Die Rate bleibt. Aber sie bleibt bis nächste Woche. Ich bin heute sentimental.', 'signatur'),
  ], { next: 'danach', effects: [herz(ID, 45), { xp: 100 }] }),
  knoten('zeuge', [
    sprecher('ripper')('Hm. Zwei Lügner sind teurer als einer. Ich schreib’s mir auf.', 'wut'),
    erz('Er geht. Vex lässt die Nagelpistole sinken, die sie die ganze Zeit unter dem Tresen hatte.'),
  ], { next: 'danach', effects: [herz(ID, 60), { xp: 150 }] }),
  knoten('schein', [
    erz('Auf dem Lieferschein steht ein Kürzel, das nicht von Vex ist. Es ist das Kürzel von Rippers eigenem Fahrer.'),
    sprecher('ripper')('… Interessant. Da muss ich wohl mit jemandem reden. Mit jemandem, der morgen weniger Finger hat.', 'signatur'),
  ], { next: 'danach', effects: [herz(ID, 60), { xp: 150 }] }),
  knoten('zahlen', [
    V('Spinnst du? Das ist MEINE Rate.', 'wut'),
    V('… Ich zahl’s dir zurück. Jeden Cent. Ich schulde keinem was.'),
  ], { next: 'danach', effects: [herz(ID, 50), { xp: 120 }, flag('vex_schuldet_spielfigur')] }),
  knoten('danach', [
    V('Du bist geblieben. Die meisten wären abgehauen. Ich wär abgehauen.', 'ueberrascht'),
    V('War nicht komplett scheiße. War sogar … ziemlich gut.', 'freude'),
  ]),
]);

/** ♥10 (act2): Andenken `schrapnell-abzeichen`. */
const he10 = dialog('he-vex-schrapnell-10', [
  knoten('start', [
    erz('Funkmast, Sonnenuntergang, der Smog leuchtet orange. Vex sitzt auf der Plattform und dreht einen Aufnäher zwischen den Metallfingern: ein Schrapnell-Splitter auf schwarzem Stoff, mit der Hand umnäht.'),
    V('Den hat er genäht. Der Erste. Schrapnell eins. Für jeden, der zu uns gehört.', 'trauer'),
    V('Ich hab keinen mehr verteilt, seit … seitdem. Hier.'),
    erz('Sie drückt ihn dir in die Hand und schaut schnell woanders hin.'),
    V('Wenn du ihn verlierst, hol ich ihn mir. Und dich gleich mit.', 'signatur'),
  ], { effects: [{ give: 'schrapnell-abzeichen' }, herz(ID, 60), { xp: 200 }] }),
]);

// ---------------------------------------------------------------------------------------------- Kampf

const abilities: Record<string, AbilityDef> = {
  'vex-nagelsalve': {
    id: 'vex-nagelsalve', name: 'Nagelsalve',
    description: 'Vex entleert das halbe Magazin der Nagelpistole. Trifft nicht hübsch, aber oft. Ziel blutet mit hoher Wahrscheinlichkeit.',
    kind: 'fernkampf', ap: 2, target: 'enemy', range: 4, damage: 3, attribute: 'reflexe', status: { id: 'blutet', turns: 2, chance: 0.5 }, cooldown: 2,
  },
  'vex-ueber-die-kisten': {
    id: 'vex-ueber-die-kisten', name: 'Über die Kisten',
    description: 'Ein Hechtsprung über die nächste Deckung, wie über ein Dach. Vex ist eine Runde lang geschützt.',
    kind: 'trick', ap: 1, target: 'self', range: 0, status: { id: 'geschuetzt', turns: 1 }, cooldown: 2,
  },
  'vex-nicht-anhalten': {
    id: 'vex-nicht-anhalten', name: 'Nicht anhalten!',
    description: '„Weiter, weiter, WEITER!“ Ein Verbündeter in der Nähe rappelt sich auf: +8 LP und zwei Runden geschützt. Einmal pro Kampf.',
    kind: 'support', ap: 1, target: 'ally', range: 3, heal: 8, status: { id: 'geschuetzt', turns: 2 }, uses: 1,
  },
};

// ---------------------------------------------------------------------------------------------- Figur

const vex: NpcDef = {
  id: ID,
  name: 'Vex Schrapnell',
  unknownName: 'Kurierin mit Metallarm',
  portrait: 'vex',
  sprite: 'vex-walk',
  faction: 'unterstadt',
  bio: 'Anfang 20, Kopf der Schrapnell-Kuriere in den Lötgassen. Burschikos, trocken, derb. Fährt illegale Dachrennen, liefert, was andere nicht anfassen. Rechter Arm: Ripper-Ratenarm, noch 31 Raten. Lobt nie direkt.',
  gifts: {
    loves: ['kurier-funk', 'griffband-schlaeger', 'volt-limo'],
    likes: ['synth-nudeln', 'nougatbombe', 'boxbandagen', 'echtobst-apfel', 'hofhonig'],
    dislikes: ['parfuem-ozon', 'seidentuch-blau'],
    hates: ['handschellen', 'rostige-dose', 'virus-implantat'],
  },
  schedule: [
    // Spielt man Vex, ist sie die Spielfigur und fehlt als Figur der Welt.
    { when: VEX, place: 'away' },
    // he-vex-schrapnell-6: abends am Funkmast statt in der Kurierbude.
    ort('A', 'loetgassen', 'funkmast', { when: { all: [{ hearts: ID, min: 6 }, { not: { seen: 'he-vex-schrapnell-6' } }] } }),
    ort('M', 'bahnhof-mitte', 'paketausgabe'),
    ort('T', 'neon-gasse', 'dachkante'),
    ort('A', 'loetgassen', 'kurierbude'),
    ort('N', 'neon-gasse', 'dachkante', { days: ['fr', 'sa'] }),
    weg('N'),
  ],
  heartEvents: [
    { id: 'he-vex-schrapnell-2', hearts: 2, map: 'bahnhof-mitte', time: 'morgen', when: NICHT_VEX, dialogue: 'he-vex-schrapnell-2' },
    { id: 'he-vex-schrapnell-4', hearts: 4, map: 'neon-gasse', time: 'nacht', when: { all: [NICHT_VEX, { weekday: ['fr', 'sa'] }, { seen: 'he-vex-schrapnell-2' }] }, dialogue: 'he-vex-schrapnell-4' },
    { id: 'he-vex-schrapnell-6', hearts: 6, map: 'loetgassen', time: 'abend', when: { all: [NICHT_VEX, { seen: 'he-vex-schrapnell-4' }] }, dialogue: 'he-vex-schrapnell-6' },
    { id: 'he-vex-schrapnell-8', hearts: 8, map: 'loetgassen', time: 'nacht', when: { all: [NICHT_VEX, { act: 2 }, { seen: 'he-vex-schrapnell-6' }] }, dialogue: 'he-vex-schrapnell-8' },
    { id: 'he-vex-schrapnell-10', hearts: 10, map: 'loetgassen', time: 'abend', when: { all: [NICHT_VEX, { act: 2 }, { seen: 'he-vex-schrapnell-8' }] }, dialogue: 'he-vex-schrapnell-10' },
  ],
  companion: {
    recruit: { all: [NICHT_VEX, { hearts: ID, min: 4 }] },
    stats: {
      hp: 46, armor: 1, morale: 80,
      attributes: { technik: 3, koerper: 4, reflexe: 6, ausstrahlung: 3, strasse: 6 },
      weapon: { kind: 'fernkampf', damage: 5, range: 4, hit: 5 },
      abilities: ['vex-nagelsalve', 'vex-ueber-die-kisten'],
    },
    heartAbilities: [{ hearts: 6, ability: 'vex-nicht-anhalten' }],
    callMinutes: 20,
  },
  partyCheckBonus: [
    { tags: ['klettern', 'sprung', 'flucht', 'verfolgung'], value: 1, label: 'Vex kennt die Dächer' },
  ],
  talk: [
    rede('vex-tag-rivale', { all: [NICHT_VEX, { rival: ID }] }),
    rede('vex-tag-erstes', { all: [NICHT_VEX, nichtGetroffen(ID)] }),
    rede('vex-tag-begleitung', { all: [NICHT_VEX, { companion: ID }] }),
    rede('vex-tag-aria-romanze', { all: [NICHT_VEX, { flag: 'aria_romanze_zusammen' }, { notFlag: 'vex_kommentar_aria_romanze' }] }),
    rede('vex-tag-zeit', { all: [NICHT_VEX, { not: { act: 2 } }] }, 8),
    rede('vex-tag-paket', { all: [NICHT_VEX, HAT_PAKET] }),
    rede('vex-tag-ratentag', { all: [NICHT_VEX, { weekday: 'mo' }, { time: 'abend' }] }),
    rede('vex-tag-rennen', { all: [NICHT_VEX, { weekday: ['fr', 'sa'] }, { time: 'nacht' }] }),
    rede('vex-tag-vertraut', NICHT_VEX, 6),
    rede('vex-tag-morgen', { all: [NICHT_VEX, { time: 'morgen' }] }),
    rede('vex-tag-dach', { all: [NICHT_VEX, { time: 'tag' }] }),
    rede('vex-tag-bude', { all: [NICHT_VEX, { time: 'abend' }] }),
    rede('vex-tag-standard', NICHT_VEX),
  ],
};

export const part: ContentPart = {
  npcs: { [ID]: vex },
  abilities,
  dialogues: sammle(
    T.rivale, T.erstes, T.begleitung, T.zeit, T.ariaRomanze, T.paket, T.ratentag, T.morgen, T.tag, T.abend,
    T.nachtRennen, T.vertraut, T.standard,
    he2, he4, he4Sieg, he4Ziel, he6, he8, he10,
  ),
  phone: {
    'tel-vex-paket': {
      id: 'tel-vex-paket', from: ID,
      text: 'Paketausgabe. Morgen früh. Bring Beine mit. – V.',
      auto: { all: [NICHT_VEX, { hearts: ID, min: 2 }, { not: { seen: 'he-vex-schrapnell-2' } }] },
    },
    'tel-vex-rennen': {
      id: 'tel-vex-rennen', from: ID,
      text: 'Freitag. Dach über der Neon-Gasse. Nachts. Wenn du kneifst, weiß es die ganze Gasse.',
      auto: { all: [NICHT_VEX, { hearts: ID, min: 4 }, { not: { seen: 'he-vex-schrapnell-4' } }] },
      replies: [{ text: 'Ich bin da.' }, { text: 'Muss ich?' }],
    },
  },
};
