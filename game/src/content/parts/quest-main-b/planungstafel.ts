// Planungstafel „Heute Nacht losschlagen“ und Übergang von Akt 1 nach Akt 2 (world.md §5.2 Übergang, §11, §11.8).
// Die Tafel hängt im Hinterzimmer (Spot planungstisch), öffnet sich mit plan_gefasst und bietet nach zwei prep-* den
// Bruch an (Warnung „Danach ist die Stadt eine andere.“). Bestätigen stellt die Uhr auf 22:00 (falls früher), setzt
// act1_done und spielt die Cliffhanger-Sequenz; die setzt act2, startet main-2-bruch und bringt die Crew an den Zaun
// des Quantum-Campus (Einstieg bruch-treffpunkt). Ab Akt 2 übernimmt die Party-Planungstafel aus parts/quest-main-2.
import type { ContentPart } from '../../part';
import type { CutsceneDef, DialogueChoice, DialogueDef, PhoneMessageDef } from '../../../modules/contracts';
import { ARIA_ROM_GENERIC, PREPS, TWO_PREPS, VEXARIA, all, flag, l, nar, noFlag, prepFlag } from './_lib';
import type { PrepKey } from './_lib';

const LABEL: Record<PrepKey, { name: string; offen: string; fertig: string }> = {
  grundriss: {
    name: 'Grundriss des Labors',
    offen: 'Hunters Zettel: „Drohne am Hafendepot? Pim am Imbiss? Der Kameramann hat alles gefilmt.“',
    fertig: 'Der Grundriss hängt mit vier Reißzwecken an der Tafel. Zwei Lüftungsschächte sind rot eingekreist. Daneben: ein Sojasoßenfleck, oder ein Kaffeefleck, oder beides.',
  },
  zugangskarte: {
    name: 'Zugangskarte',
    offen: 'Hunters Zettel: „Pfeffer, Fr/Sa an der Bar. Jojo-Band. Nicht hauen, wenn’s anders geht.“',
    fertig: 'Ein Foto der Karte. Dr. Pflaume lächelt darauf, als wüsste er von nichts. Er weiß von nichts.',
  },
  wachplan: {
    name: 'Patrouillenzeiten',
    offen: 'Vegas Zettel, sehr ordentlich: „Brücke, abends. Oder Gernot am Brezelstand. Oder die Kiste in der Lieferzone, nachts.“',
    fertig: 'Vegas Notizen: Streife A, Streife B, Kaffee, Bernd. Um 01:00 rot unterstrichen: „4 MIN.“',
  },
  fluchtweg: {
    name: 'Rückweg durch den Kanal',
    offen: 'Ravens Zettel: „Rein kommt man immer. Raus ist die Kunst. Kanal. Gully fragen.“',
    fertig: 'Ein Pappschild vom Kanalvolk: „Notausgang · Für Freunde“. Jemand hat eine Ratte mit Krone dazugemalt.',
  },
  ablenkung: {
    name: 'Ablenkung am Haupttor',
    offen: 'Arias Zettel, in Großbuchstaben: „LAUT. HELL. COLLIN, KINDER, FEUERWERK ODER DEXTER. HAUPTSACHE LAUT.“',
    fertig: 'Arias Zettel, durchgestrichen und darunter: „KLAPPT!!! (glaub ich)“',
  },
};

const statusChoices: DialogueChoice[] = PREPS.flatMap((key): DialogueChoice[] => [
  { text: `[✓] ${LABEL[key].name}`, when: flag(prepFlag(key)), next: `fertig-${key}` },
  { text: `[ ] ${LABEL[key].name}`, when: noFlag(prepFlag(key)), next: `offen-${key}` },
]);

/** Warten bis 22:00 vor dem Aufbruch (Uhr stellen). */
const LOS_WARTEN: DialogueChoice[] = [{
  id: 'los-warten',
  text: '„Wir warten, bis es dunkel ist.“ (bis 22:00)',
  when: { clockBetween: [360, 1320] },
  effects: [{ setClock: 1320 }],
  next: 'los-jetzt',
}];

const tafel: DialogueDef = {
  id: 'planungstafel',
  start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [nar('Eine Korkwand voller Zettel, Fotos und roter Fäden. Oben in Hunters Handschrift: „VORBEREITUNG – MIND. 2 – KEINE AUSREDEN“.')],
      choices: [
        ...statusChoices,
        { text: '„Heute Nacht losschlagen.“', tag: '[2 Vorbereitungen]', when: noFlag('act1_done'), requires: TWO_PREPS, next: 'warnung' },
        { text: 'Die Crew wartet auf das Signal.', when: all(flag('act1_done'), { not: { act: 2 } }), next: 'spaeter' },
        { text: 'Zurücktreten.' },
      ],
    },
    ...PREPS.flatMap(key => [
      { id: `offen-${key}`, lines: [nar(LABEL[key].offen)], next: 'start' },
      { id: `fertig-${key}`, lines: [nar(LABEL[key].fertig)], next: 'start' },
    ]),
    {
      id: 'warnung',
      lines: [
        nar('Hunter steht plötzlich hinter dir. Wie er das macht, bei der Größe, weiß keiner.'),
        l('hunter', 'Sicher? Wenn wir heute Nacht losschlagen, gibt es kein Zurück.', 'besorgt'),
        l('hunter', 'Danach ist die Stadt eine andere.', 'neutral'),
        nar('(Jetzt ist ein guter Moment zum Speichern.)'),
      ],
      choices: [
        { text: 'Vorher: Aria im Flur abfangen.', when: VEXARIA, next: 'vexaria-flur' },
        { text: 'Vorher: noch kurz zu Aria.', when: ARIA_ROM_GENERIC, next: 'aria-flur' },
        { text: '„Losschlagen.“', next: 'los' },
        { text: '„Noch nicht.“', next: 'nochnicht' },
      ],
    },
    {
      id: 'nochnicht',
      lines: [l('hunter', 'Gut. Die Stadt läuft nicht weg. Quantum vielleicht schon. Sag Bescheid, wenn du so weit bist.', 'neutral')],
    },
    // --- Vex × Aria vor dem Bruch (Romanzefassung; kein Kuss – der gehört Station 9 in Akt 2)
    {
      id: 'vexaria-flur',
      lines: [
        nar('Im Flur hinter dem Hinterzimmer riecht es nach Bier, heißem Kabel und Arias Deo, das „Gewitter“ heißt und genau so riecht. Sie zieht gerade das Griffband am Schläger fest. Zu fest.'),
        l('aria', 'Was willst du, Postbotin? Glück wünschen? Ich brauch kein Glück. Ich hab einen Schläger.', 'signatur'),
        l('player', 'Wollte nur sehen, ob du nervös bist.', 'neutral'),
        l('aria', 'Ich bin nie nervös.', 'wut'),
        nar('Ihre Metallhand zittert. Ganz leicht. Die Federn am Oberarm surren, wie sie es nur tun, wenn Aria nicht schläft.'),
      ],
      choices: [
        { text: '(Ihre Metallhand nehmen. Festhalten, bis sie aufhört.)', next: 'vf-hand' },
        { text: '„Lügnerin.“ (Einen Schritt näher. Noch einen.)', next: 'vf-wand' },
        { text: '„Wir sehen uns im Ziel, Großmaul.“', next: 'vf-ziel' },
      ],
    },
    {
      id: 'vf-hand',
      lines: [
        nar('Du nimmst die Metallhand in deine. Kalt, dann warm. Aria starrt auf eure Finger, als hätte sie die noch nie gesehen.'),
        l('aria', '…Du bist so eine verdammte Zumutung, weißt du das?', 'verlegen'),
        l('aria', 'Hör nicht auf.', 'zaertlich'),
        nar('Du hörst nicht auf. Irgendwann lehnt sie die Stirn an deine Schulter, genau einen Atemzug lang, und du spürst ihr Herz durch zwei Lagen Stoff und eine Lage Gurtzeug hämmern. Dann richtet sie sich auf, als wäre nichts gewesen.'),
        l('aria', 'Wenn wir zurückkommen, schuldest du mir was. Und ich treib’s ein. Persönlich. Gründlich. Die ganze Nacht, wenn’s sein muss.', 'freude'),
      ],
      effects: [{ setFlag: 'vexaria_vor_dem_bruch' }, { relation: 'aria', delta: 30 }],
      choices: [{ text: '„Losschlagen.“', next: 'los' }],
    },
    {
      id: 'vf-wand',
      lines: [
        nar('Ein Schritt. Noch einer. Arias Rücken trifft die Wand, der Schläger klappert zu Boden. Keine von euch hebt ihn auf.'),
        l('aria', 'Du stehst verdammt nah, Postbotin.', 'verlegen'),
        l('player', 'Du hast nicht gesagt, dass ich weggehen soll.', 'neutral'),
        nar('Sie hakt die Finger in deine Gurtriemen. Nicht, um dich wegzuschieben. Ihr Atem streift dein Kinn, deinen Mundwinkel, warm und ungeduldig, und für eine Sekunde gibt es nur noch das Brummen der Kühltruhe und deinen Puls unter ihren Fingerknöcheln.'),
        l('aria', 'Nicht hier. Nicht jetzt. Wenn ich dich küsse, dann nicht zwischen Bierkästen. Und nicht, bevor ich weiß, dass du heil zurückkommst.', 'zaertlich'),
        nar('Hinter der Tür brüllt Hunter eure Namen. Aria lässt die Riemen los, langsam, einen Finger nach dem anderen, als würde sie sich jeden einzeln merken.'),
        l('aria', 'Heb meinen Schläger auf. Und wisch dir das Grinsen aus dem Gesicht, sonst sieht Vega es.', 'signatur'),
      ],
      effects: [{ setFlag: 'vexaria_vor_dem_bruch' }, { relation: 'aria', delta: 40 }],
      choices: [{ text: '„Losschlagen.“', next: 'los' }],
    },
    {
      id: 'vf-ziel',
      lines: [
        l('aria', 'Im Ziel. Okay.', 'ueberrascht'),
        l('aria', 'Ich bin zuerst da. Ich warte. Mit Bier. Und dann reden wir. Oder auch nicht reden.', 'freude'),
      ],
      effects: [{ setFlag: 'vexaria_vor_dem_bruch' }, { relation: 'aria', delta: 20 }],
      choices: [{ text: '„Losschlagen.“', next: 'los' }],
    },
    // --- Aria-Romanze mit Baukasten-Spielfigur
    {
      id: 'aria-flur',
      lines: [
        nar('Aria fängt dich im Flur ab, packt dich am Kragen und zieht dich in die Nische neben der Kühltruhe.'),
        l('aria', 'Wenn wir das überleben, schuldest du mir einen Abend. Einen ganzen. Ohne Hunter, ohne Ratten, ohne Kameras. Und ohne Ausreden.', 'zaertlich'),
        nar('Sie lässt den Kragen nicht los. Ihr Daumen streicht einmal über deinen Hals, da, wo der Puls sitzt. Dann grinst sie.'),
        l('aria', 'So schnell? Gut zu wissen.', 'verlegen'),
      ],
      effects: [{ relation: 'aria', delta: 30 }],
      choices: [{ text: '„Losschlagen.“', next: 'los' }],
    },
    {
      id: 'los',
      lines: [
        l('hunter', 'Dann los. Alle Mann, Treffpunkt vor dem Club. Wer zu spät kommt, bleibt hier und spült.', 'signatur'),
      ],
      choices: [
        // Die Bruch-Nacht beginnt um 22:00 (früher: Uhr per setClock vorstellen).
        ...LOS_WARTEN,
        { text: '„Jetzt. Bevor einer kalte Füße kriegt.“', when: { clockBetween: [1320, 1410] }, next: 'los-jetzt' },
        { text: '„Heute noch?“', when: { clockBetween: [1410, 1600] }, next: 'zu-spaet' },
      ],
    },
    {
      id: 'zu-spaet',
      lines: [
        l('vega', 'Schichtwechsel ist um eins. Bis wir am Zaun sind, ist der vorbei und die Frühschicht hat Kaffee getrunken.', 'neutral'),
        l('hunter', 'Morgen Nacht. Zweiundzwanzig Uhr. Schlaft euch aus, ihr seht aus wie aufgewärmte Leichen.', 'neutral'),
      ],
    },
    {
      id: 'los-jetzt',
      lines: [nar('Hunter klatscht einmal in die Hände. Draußen fängt es an zu nieseln. Natürlich.')],
      effects: [
        { setFlag: 'act1_done' },
        { setFlag: 'losschlagen_bestaetigt' },
        { cutscene: 'akt1-cliffhanger' },
      ],
    },
    {
      // Nur für Spielstände, die act1_done ohne Akt 2 haben (Stand „Fortsetzung folgt“): Aufbruch nachholen.
      id: 'spaeter',
      lines: [
        l('hunter', 'Wir sind bereit. Die Stadt ist es nie. Sag Bescheid, und wir gehen heute Nacht.', 'neutral'),
      ],
      choices: [
        { text: '„Heute Nacht. Diesmal wirklich.“', next: 'los' },
        { text: 'Zurücktreten.' },
      ],
    },
  ],
};

const cliffhanger: CutsceneDef = {
  id: 'akt1-cliffhanger',
  title: 'Heute Nacht',
  beats: [
    {
      image: 'cut-akt1-aufbruch',
      pan: 'in',
      fade: 'in',
      caption: 'Noch in derselben Nacht · Neon-Gasse',
      lines: [
        nar('Die Gasse ist leer. Nur der Rostregen, das Summen der Leuchtreklamen und ein paar Schatten, die sich vor dem High Voltage sammeln.'),
        l('hunter', 'Letzte Chance auszusteigen. Keiner? Gut. Ich hätte euch eh nicht gelassen.', 'signatur'),
        l('vega', 'Streifen in Position. Schichtwechsel um eins. Wir haben siebzehn Minuten.', 'neutral'),
        l('aria', 'Siebzehn Minuten reichen mir für drei Türen und einen Wachmann. Zwei, wenn er nett ist.', 'freude'),
        l('raven', 'Bleib bei mir. Und wenn ich „lauf“ sage, fragst du nicht, wohin.', 'neutral'),
        l('nyra', 'Captain Kuschel ist angeschnallt. Ich auch. Glaub ich. Ist das hier der Gurt oder mein Kabel?', 'besorgt'),
      ],
    },
    {
      image: 'cut-akt1-aufbruch',
      sfx: 'phone',
      caption: 'EILMELDUNG · NX-1',
      lines: [
        l('delya-delloraine', 'Exklusiv! Quantum verschenkt Chrome 10. Ab heute Nacht. An alle. Einfach so.', 'ueberrascht'),
        l('collin-charleston', 'Gratis? Ich LIEBE gratis! Liebe Zuschauer, holt euch euren Chip, bevor ihn der Nachbar holt!', 'freude'),
        l('hunter', 'Gratis. Ich hasse gratis. Gratis kostet immer am meisten.', 'besorgt'),
      ],
    },
    {
      image: 'cut-akt1-labor-null',
      pan: 'in',
      sfx: 'hack',
      caption: 'Quantum-Campus · Labor 0',
      lines: [
        nar('Tief unter dem Campus geht in einem Raum ohne Fenster ein einzelnes blaues Licht an. Dann noch eins. Dann tausend.'),
        l('ki-nexus', 'Verbindung hergestellt.', 'neutral'),
        l('ki-nexus', 'Seid gegrüßt, Master …', 'signatur'),
      ],
      hold: 1500,
    },
    {
      image: 'black',
      fade: 'in',
      caption: 'AKT 2 · DER CHIP',
      hold: 2500,
    },
    {
      image: 'black',
      caption: '22:00 · Quantum-Campus · Hecke am Zaun Ost',
      lines: [
        nar('Eine Stunde später. Der Zaun summt. Hinter der Hecke riecht es nach nassem Kunstrasen und nach Leuten, die viel zu viel Geld für Kunstrasen ausgeben.'),
        l('hunter', 'Alle da? Dann hört zu. Ich sag das nur einmal, weil ich es mir nur einmal merken konnte.', 'signatur'),
      ],
    },
  ],
  effects: [
    { setAct: 2 },
    { startQuest: 'main-2-bruch' },
    { phone: 'tel-nx1-chrome10-gratis' },
    { message: 'Akt 2 „Der Chip“ beginnt.' },
    { travel: 'quantum-campus', entry: 'bruch-treffpunkt', minutes: 0 },
  ],
};

const eilmeldung: PhoneMessageDef = {
  id: 'tel-nx1-chrome10-gratis',
  from: 'delya-delloraine',
  text: 'EILMELDUNG NX-1: Chrome 10 ab sofort gratis für alle Bürger! Abholung an jedem Quantum-Stand. „Eine neue Ruhe für Noxius.“',
  replies: [{ text: 'Nein danke.' }, { text: 'Was ist der Haken?', effects: [{ message: 'Keine Antwort. Nur ein blaues Flackern im Display.' }] }],
};

export const part: ContentPart = {
  dialogues: { [tafel.id]: tafel },
  cutscenes: { [cliffhanger.id]: cliffhanger },
  phone: { [eilmeldung.id]: eilmeldung },
  mapAdditions: {
    // Im Hinterzimmer öffnet der Karten-Hotspot „planungstafel“ (parts/maps/hv-hinterzimmer.ts) diesen Dialog.
    'crew-quartier': {
      hotspots: [
        {
          id: 'planungstafel-quartier',
          at: 'pinnwand',
          label: 'Planungstafel (Kopie an der Pinnwand)',
          kind: 'use',
          dialogue: tafel.id,
          when: flag('plan_gefasst'),
          hideWhen: { act: 2 },
        },
      ],
    },
  },
};
