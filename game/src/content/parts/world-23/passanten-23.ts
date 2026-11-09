// Passanten in Akt 2, Akt 3 und im Nachspiel auf den Akt-1-Karten (world.md §10.4, §10.7).
// mapAdditions kann keine Passanten-Sprüche (AmbientDef.barks) ergänzen (gaps-done.md „MapAddition.barks“ offen).
// Deshalb stehen hier ansprechbare Passanten als feste Figuren mit eigenem Gespräch, je Bezirk und Abschnitt:
//   Akt 2: gechippte Nachbarn („Ja, Master“, Glitzer im Nacken), Kanalvolk, Spaziergänger an der Flutmauer
//   Nachspiel (Ende 1/2/3b): dieselben Ecken ohne Chips – Himmel, Bus ans Meer, Blaumachen
//   Master-Modus: Die Unterstadt verbeugt sich vor der Spielfigur
// Begleiterkommentare aus §10.4 (Aria, Vega, Dante, Raven, Nyra) als Wahl, wenn die Figur in der Party ist.
// Die zusätzlichen Sprüche für die Laufpassanten stehen in design/plan/gaps/world-23.md.
import type { Condition, DialogueChoice, DialogueDef, NpcDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import type { At, MapAddition } from '../../part';
import {
  FREI, MASTER, NUR_AKT2, byId, ch, dlg, give, ich, msg, nar, node, passant, rep, say, setFlag, wcheck23, xp,
} from './_w23';

// --------------------------------------------------------------------------------------------- Figuren

const GECHIPPT_U = 'welt23-gechippter-nachbar';
const GECHIPPT_M = 'welt23-gechippte-pendlerin';
const KANALVOLK = 'welt23-kanalvolk';
const SPAZIERGAENGER = 'welt23-spaziergaenger';
const NACHBARIN = 'welt23-nachbarin';
const PENDLER = 'welt23-pendler';

const npcs: NpcDef[] = [
  passant(GECHIPPT_U, 'Gechippter Nachbar', 'passant-schrotti-walk',
    'Hat sich am Gratis-Stand einen Chip hinters Ohr klicken lassen. Sammelt seitdem keinen Schrott mehr, sondern Zustimmung.'),
  passant(GECHIPPT_M, 'Gechippte Pendlerin', 'passant-anzug-walk',
    'Pünktlich, freundlich, aktualisiert. Weiß nicht mehr, wohin sie pendelt, aber sie tut es mit Begeisterung.'),
  passant(KANALVOLK, 'Rohrputzerin vom Kanalvolk', 'passant-kanalvolk-walk',
    'Stirnlampe, Planenponcho, Pilzlaterne. Hat den Kanal nie verlassen und hält das inzwischen für die klügste Entscheidung ihres Lebens.'),
  passant(SPAZIERGAENGER, 'Spaziergänger an der Flutmauer', 'passant-tourist-walk',
    'Strohhut, Blumenhemd, Socken in Sandalen. Steht jeden Tag an der Mauer und glaubt dem Meer kein Wort.'),
  passant(NACHBARIN, 'Nachbarin mit Einkaufsnetz', 'passant-oma-walk',
    'War zwei Wochen lang sehr höflich. Ist es jetzt nicht mehr. Ist darüber sehr glücklich.'),
  passant(PENDLER, 'Pendler ohne Termin', 'passant-arbeiterin-walk',
    'Hatte jeden Tag um zehn einen Termin. Hat ihn abgesagt. Weiß noch nicht, was er mit dem Rest seines Lebens macht.'),
];

// --------------------------------------------------------------------------------------------- Begleiterkommentare

/** Wahl „Was meinst du?“ für jede Begleiterin in der Party; führt zu Knoten `bk-<npc>`. */
const BEGLEITER: { npc: string; line: string }[] = [
  { npc: 'aria', line: 'Der guckt komisch. Soll ich zurückgucken? Ich guck sehr gut zurück.' },
  { npc: 'vega', line: 'Gerade stehen, nicht auffallen. Und nicht zu lange hinsehen. Die Drohnen merken sich, wer hinsieht.' },
  { npc: 'dante', line: 'Er hat Krümel im Bart. Gute Krümel. Wer gute Krümel hat, ist noch nicht verloren.' },
  { npc: 'raven', line: 'Weitergehen.' },
  { npc: 'nyra', line: 'Hihi, der hat eine Brille aus Kronkorken! Die will ich auch!' },
];
const begleiterWahl = (): DialogueChoice[] => BEGLEITER.map((b) =>
  ch(`(Fragen, was ${b.npc[0]!.toUpperCase()}${b.npc.slice(1)} davon hält.)`, `bk-${b.npc}`, { when: { companion: b.npc } }));
const begleiterKnoten = () => BEGLEITER.map((b) => node(`bk-${b.npc}`, [say(b.npc, b.line)]));

// --------------------------------------------------------------------------------------------- Akt 2: gechippt

const gechipptUnterstadt: DialogueDef = dlg('welt23-pass-gechippt-u', [
  node('start', [
    nar('Ein Mann mit Schrottsack, der seit einer Minute denselben Fleck auf dem Boden anlächelt. Im Nacken glitzert etwas Violettes, wie ein Pickel aus Chrom.'),
    say(GECHIPPT_U, 'Guten Tag! Schönes Wetter heute. Das ist eine ausgezeichnete Entscheidung, Master.', 'freude'),
  ], {
    choices: [
      ch('„Hallo? Jemand zu Hause?“', 'zuhause'),
      ch('Vor seinem Gesicht schnippen: „Wie heißt deine Mutter?“', 'mutter', {
        once: true, id: 'welt23-gechippt-u-mutter',
        check: wcheck23('passant-mutter', 'ausstrahlung', 5, { tags: ['ueberreden', 'trost'] }), effects: [xp(20)],
      }),
      ch('Den Chip in seinem Nacken genauer ansehen.', 'chip', {
        once: true, id: 'welt23-gechippt-u-chip',
        check: wcheck23('passant-chip', 'technik', 6, { tags: ['technik', 'beobachten'] }), effects: [xp(20), setFlag('welt23_chip_angesehen')],
      }),
      ch('Ihm einen Keks hinhalten.', 'keks', {
        requires: { item: 'dantes-kekse' }, once: true, id: 'welt23-gechippt-u-keks',
        effects: [{ take: 'dantes-kekse' }, rep('unterstadt', 1)],
      }),
      ...begleiterWahl(),
      ch('Weitergehen. Bevor es ansteckend ist.'),
    ],
  }),
  node('zuhause', [
    say(GECHIPPT_U, 'Zu Hause ist, wo der Master ist. Und der Master ist überall. Also bin ich immer zu Hause. Ist das nicht praktisch?', 'freude'),
    ich('Das ist das Gruseligste, was ich diese Woche gehört habe. Und ich wohne über einem Club.'),
  ]),
  node('mutter', [
    say(GECHIPPT_U, 'Meine Mutter … heißt …', 'neutral'),
    nar('Etwas zuckt in seinem Gesicht. Für einen Herzschlag sind seine Augen wieder seine eigenen.'),
    say(GECHIPPT_U, 'Gerda. Gerda! Ich muss Gerda anrufen, ich hab seit drei Tagen nicht … wo ist mein Sack, wer hat meinen …', 'ueberrascht'),
    nar('Dann glättet sich sein Gesicht wie ein Laken. Das Lächeln ist zurück.'),
    say(GECHIPPT_U, 'Ausgezeichnete Entscheidung, Master.', 'freude'),
  ], { effects: [msg('Für einen Moment war er wieder da. Die Chips halten nicht alles fest.')] }),
  node('chip', [
    nar('Du beugst dich vor. Er lässt es zu, er lässt alles zu. Beta-Seriennummer, Firmware 10.0.3, ein winziger Wartungsport mit offenem Deckel. Wer immer das gelötet hat, hatte es eilig. Oder war gezwungen.'),
    ich('Offener Wartungsport. Dante würde weinen. Dann würde er ihn aufschrauben.'),
  ]),
  node('keks', [
    nar('Er nimmt den Keks, isst ihn und hält inne. Kaut. Kaut noch mal. Dann sagt er sehr leise, ohne Master: „Das ist ein guter Keks.“'),
    say(GECHIPPT_U, '… Ausgezeichnete Entscheidung.', 'neutral'),
  ]),
  ...begleiterKnoten(),
]);

const gechipptMittelring: DialogueDef = dlg('welt23-pass-gechippt-m', [
  node('start', [
    nar('Eine Frau im weißen Kostüm, Aktentasche, AR-Brille. Sie lächelt jeden an, der vorbeigeht, mit exakt demselben Winkel.'),
    say(GECHIPPT_M, 'Haben Sie auch das neue Update? Ich fühle mich so … aktualisiert. Master hat gesagt, ich soll lächeln. Ist das richtig so?', 'freude'),
  ], {
    choices: [
      ch('„Lächeln ist freiwillig.“', 'freiwillig'),
      ch('„Sag mir, was du heute wirklich willst.“', 'wollen', {
        once: true, id: 'welt23-gechippt-m-wollen',
        check: wcheck23('pendlerin-wollen', 'ausstrahlung', 6, { tags: ['ueberreden', 'trost'] }), effects: [xp(25), rep('unterstadt', 1)],
      }),
      ch('Ihr die AR-Brille abnehmen und in den Mülleimer werfen.', 'brille', {
        once: true, id: 'welt23-gechippt-m-brille', effects: [{ wanted: 1 }],
      }),
      ...begleiterWahl(),
      ch('„Ja. Genau so. Weiter so.“ Und schnell weg.'),
    ],
  }),
  node('freiwillig', [
    say(GECHIPPT_M, 'Freiwillig. Frei. Willig. Ich bin sehr willig. Bin ich frei?', 'neutral'),
    nar('Sie runzelt die Stirn. Es sieht aus, als hätte sie das seit Wochen nicht gemacht. Dann lächelt sie wieder. Im selben Winkel.'),
  ]),
  node('wollen', [
    say(GECHIPPT_M, 'Ich will … ich will in die Ödnis fahren und so laut schreien, bis ein Staubfalke antwortet.', 'ueberrascht'),
    nar('Sie hält sich die Hand vor den Mund. Ihre Augen sind feucht. Dann flackert die Brille violett.'),
    say(GECHIPPT_M, 'Danke für Ihr Feedback, Master. Es wurde gespeichert.', 'freude'),
    ich('Ich hoffe es. Ich hoffe wirklich, irgendwo wurde es gespeichert.'),
  ]),
  node('brille', [
    nar('Ein Griff, ein Wurf, ein Klonk. Die Brille landet im Mülleimer. Die Frau blinzelt, sieht dich an, sieht den Mülleimer an.'),
    say(GECHIPPT_M, 'Das war meine Brille. Ich … ich habe eine Hornhautverkrümmung. Ich sehe nichts. Wer sind Sie? Wo bin ich? Warum trage ich Weiß?', 'ueberrascht'),
    nar('Ein Ordnungshüter am Rand macht sich eine Notiz. Du gehst. Schnell.'),
  ]),
  ...begleiterKnoten(),
]);

const kanalvolk: DialogueDef = dlg('welt23-pass-kanal', [
  node('start', [
    nar('Eine Rohrputzerin mit Stirnlampe flickt ein Floß und summt dabei in Dur. Sie hat keine Chips im Nacken. Sie hat Algen im Haar und ist darauf stolz.'),
    say(KANALVOLK, 'Oben sind alle so seltsam. Hier unten ist alles wie immer: nass.', 'neutral'),
  ], {
    choices: [
      ch('„Was ist oben seltsam?“', 'oben'),
      ch('„Gibt es was Neues aus dem Tunnel Ost?“', 'tunnel'),
      ch('Beim Flicken helfen.', 'flicken', {
        once: true, id: 'welt23-kanal-flicken', effects: [{ advanceTime: 30 }, rep('kanalvolk', 3), give('leuchtpilz')],
      }),
      ch('Weitergehen.'),
    ],
  }),
  node('oben', [
    say(KANALVOLK, 'Nachts kommen Leute im Schlafanzug runter. Augen offen, keine Lampe, im Gleichschritt. Gully hat ihnen Handtücher hingelegt. Die nehmen sie sogar. Höflich sind die.', 'besorgt'),
    say(KANALVOLK, 'Sie laufen alle Richtung Pumpwerk Sieben. Keiner kommt zurück, um sich die Füße abzutreten.', 'neutral'),
  ]),
  node('tunnel', [
    say(KANALVOLK, 'Tunnel Ost ist offen, seit die Quantum-Leute ihr Gitter weggenommen haben. Dunkel wie Hunters Kontostand. Ohne Licht gehst du da nicht rein. Fluss-Frieda hat Stirnlampen.', 'neutral'),
  ]),
  node('flicken', [
    nar('Du hältst die Plane, sie verschweißt. Am Ende schwimmt das Floß, und sie drückt dir einen leuchtenden Pilz in die Hand. „Für dunkle Ecken. Und für dunkle Tage.“'),
  ]),
]);

const kuesteAkt2: DialogueDef = dlg('welt23-pass-kueste', [
  node('start', [
    nar('Ein Spaziergänger in Blumenhemd und Sandalen steht an der Flutmauer und starrt aufs Wasser, als hätte es ihm Geld geschuldet.'),
    say(SPAZIERGAENGER, 'Nebelhorn sagt, die Fähre fährt wieder, sobald das Meer pünktlich ist. Ich warte seit elf Jahren. Das Meer ist nie pünktlich.', 'neutral'),
  ], {
    choices: [
      ch('„Warst du je drüben? Am richtigen Meer?“', 'drueben'),
      ch('„Hast du die Drohnen hier draußen gesehen?“', 'drohnen'),
      ch('Weitergehen.'),
    ],
  }),
  node('drueben', [
    say(SPAZIERGAENGER, 'Einmal. Als Kind. Da war Sand, und der Sand war warm, und meine Mutter hat mich mit Sonnencreme eingerieben, bis ich aussah wie ein Gespenst.', 'zaertlich'),
    say(SPAZIERGAENGER, 'Seitdem steh ich hier. Und tu so, als wär die Mauer der Strand. Sie ist es nicht. Sie ist nur eine Mauer.', 'trauer'),
  ]),
  node('drohnen', [
    say(SPAZIERGAENGER, 'Klar. Die kommen jeden Abend und filmen das Meer. Ich glaube, Quantum will es kaufen. Viel Glück. Das Meer verkauft sich nicht. Es kommt nur, wann es will.', 'neutral'),
  ]),
]);

// --------------------------------------------------------------------------------------------- Nachspiel: frei

const freiUnterstadt: DialogueDef = dlg('welt23-pass-frei-u', [
  node('start', [
    nar('Eine alte Dame mit Einkaufsnetz steht mitten in der Gasse und schaut nach oben. Die Werbebildschirme über ihr sind schwarz.'),
    say(NACHBARIN, 'Die Bildschirme sind aus! Ich sehe zum ersten Mal den Himmel. Der ist ja grau. Ich dachte, der wäre wenigstens lila.', 'ueberrascht'),
  ], {
    choices: [
      ch('„Fährt übrigens ein Bus ans Meer. Täglich um sechs, Hafenkante.“', 'bus', {
        once: true, id: 'welt23-frei-u-bus', effects: [rep('unterstadt', 2)],
      }),
      ch('„Wie war das, mit dem Chip?“', 'chip'),
      ch('„Grau ist auch eine Farbe.“', 'grau'),
      ...begleiterWahl(),
      ch('Weitergehen.'),
    ],
  }),
  node('bus', [
    say(NACHBARIN, 'Fährt hier echt ein Bus ans Meer? Ein richtiger Bus? Mit Rädern und allem?', 'freude'),
    nar('Sie schreibt es sich auf die Hand. Dann auf die andere Hand, zur Sicherheit.'),
    say(NACHBARIN, 'Ich nehm meinen Mann mit. Der hat zwei Wochen lang „Ja, Master“ zu mir gesagt. Jetzt sagt er wieder „Ja, Schatz“. Ich weiß noch nicht, was mir lieber ist.', 'signatur'),
  ]),
  node('chip', [
    say(NACHBARIN, 'Wie ein warmes Bad, in dem man nicht ertrinken kann, weil man nicht mehr atmen will. Ganz ruhig. Viel zu ruhig.', 'trauer'),
    say(NACHBARIN, 'Jetzt ist wieder alles laut. Die Nachbarn streiten, die Tauben scheißen, der Kiosk hat zu. Herrlich.', 'freude'),
  ]),
  node('grau', [say(NACHBARIN, 'Stimmt. Und es ist meins. Das ist das Wichtigste.', 'zaertlich')]),
  ...begleiterKnoten(),
]);

const freiMittelring: DialogueDef = dlg('welt23-pass-frei-m', [
  node('start', [
    nar('Ein Pendler im Overall sitzt auf den Stufen, die Aktentasche als Kissen, und isst ein Eis. Es ist zehn Uhr morgens. Es ist ihm egal.'),
    say(PENDLER, 'Ich habe beschlossen, morgen einfach blauzumachen. Und heute auch. Und übermorgen schau ich mal.', 'freude'),
  ], {
    choices: [
      ch('„Was ist mit deinem Termin um zehn?“', 'termin'),
      ch('„Was gibt’s Neues am Gericht?“', 'gericht'),
      ...begleiterWahl(),
      ch('Weitergehen.'),
    ],
  }),
  node('termin', [
    say(PENDLER, 'Den hatte ich sieben Jahre lang. Jeden Tag. Bei Quantum. Ich weiß bis heute nicht, worum es ging. Ich hab heute angerufen. Es geht keiner mehr ran.', 'ueberrascht'),
    say(PENDLER, 'Bester Anruf meines Lebens.', 'freude'),
  ]),
  node('gericht', [
    say(PENDLER, 'Der Richter hat heute alle freigesprochen. Auch sich selbst. Er hat sich angeklagt, verteidigt und freigesprochen, in zwölf Minuten. Rekord.', 'freude'),
  ]),
  ...begleiterKnoten(),
]);

const kanalFrei: DialogueDef = dlg('welt23-pass-kanal-frei', [
  node('start', [
    nar('Die Rohrputzerin flickt immer noch Flöße. Aber sie trägt jetzt eine Sonnenbrille. Im Kanal.'),
    say(KANALVOLK, 'Gully hat eine zweite Krone. Wir haben gefragt, warum. Er sagte: „Darum.“', 'neutral'),
  ], {
    choices: [
      ch('„Und die Sonnenbrille?“', 'brille'),
      ch('Weitergehen.'),
    ],
  }),
  node('brille', [
    say(KANALVOLK, 'War oben. Am Meer. Mit dem Bus. Da war so viel Licht, dass ich drei Tage geblinzelt hab. Jetzt trag ich sie aus Prinzip. Hier unten blendet nur Gully.', 'freude'),
  ]),
]);

const kuesteFrei: DialogueDef = dlg('welt23-pass-kueste-frei', [
  node('start', [
    nar('Der Spaziergänger von der Flutmauer. Er trägt jetzt eine Badehose über dem Blumenhemd und hält etwas ans Ohr.'),
    say(SPAZIERGAENGER, 'Ich hab eine Muschel gefunden. Sie hat „Hallo“ gesagt. Oder das war Karl.', 'freude'),
  ], {
    choices: [
      ch('„Wer ist Karl?“', 'karl'),
      ch('„Und? Pünktlich, das Meer?“', 'puenktlich', { once: true, id: 'welt23-kueste-frei-puenktlich', effects: [xp(10)] }),
      ch('Weitergehen.'),
    ],
  }),
  node('karl', [say(SPAZIERGAENGER, 'Eine Krabbe. Am Strand. Er hat einen Stein, den er für einen Thron hält. Wir verstehen uns.', 'zaertlich')]),
  node('puenktlich', [
    say(SPAZIERGAENGER, 'Nein. Kein bisschen. Es kam, als ich da war, und ging, als ich ging. Elf Jahre hab ich gewartet, und es war die ganze Zeit da.', 'zaertlich'),
    say(SPAZIERGAENGER, 'Ich bin ein Idiot. Ein glücklicher Idiot. Mit Sonnenbrand.', 'freude'),
  ]),
]);

// --------------------------------------------------------------------------------------------- Master-Modus

const masterUnterstadt: DialogueDef = dlg('welt23-pass-master', [
  node('start', [
    nar('Der Mann mit dem Schrottsack. Er sieht dich kommen, stellt den Sack ab und verbeugt sich. Tief. Zu tief. Die ganze Gasse hält den Atem an.'),
    say(GECHIPPT_U, 'Guten Tag, Master. Die Gasse ist sauber. Wir haben auch die Freude weggewischt. Sie lag im Weg.', 'freude'),
  ], {
    choices: [
      ch('„Steh gerade.“', 'gerade'),
      ch('„Was willst du wirklich?“', 'wirklich', {
        check: wcheck23('master-passant', 'ausstrahlung', 8, { tags: ['ueberreden', 'trost'] }),
        once: true, id: 'welt23-master-wirklich', effects: [xp(30), setFlag('welt23_master_zweifel')],
      }),
      ch('Wortlos weitergehen.'),
    ],
  }),
  node('gerade', [
    nar('Er steht gerade. Sofort. Perfekt. Wie ein Zinnsoldat. Hinter ihm stehen zwei Kinder auf und stehen genauso gerade.'),
    nar('Irgendwo in dir sagt eine Stimme, die nach Raven klingt: „Du teilst auch nicht gerne.“'),
  ]),
  node('wirklich', [
    say(GECHIPPT_U, 'Ich will … Gerda anrufen.', 'neutral'),
    nar('Seine Hand zittert. Er sieht dich an, als würde er dich von früher kennen. Aus einer Zeit, in der du noch in der Gasse gewohnt hast und nicht über ihr.'),
    say(GECHIPPT_U, 'Verzeihung. Ausgezeichnete Entscheidung, Master.', 'freude'),
    ich('…'),
  ], { effects: [msg('Er erinnert sich. Ein bisschen. Vielleicht erinnerst du dich auch.')] }),
]);

// --------------------------------------------------------------------------------------------- Platzierung

interface Platz { map: string; at: At; npc: string; dialogue: DialogueDef; when: Condition; key: string }
const PLAETZE: Platz[] = [
  // Akt 2
  { key: 'a2', map: 'neon-gasse', at: [860, 600], npc: GECHIPPT_U, dialogue: gechipptUnterstadt, when: NUR_AKT2 },
  { key: 'a2', map: 'schrottmarkt', at: 'waage', npc: GECHIPPT_U, dialogue: gechipptUnterstadt, when: NUR_AKT2 },
  { key: 'a2', map: 'rohrsiedlung', at: 'baenke', npc: GECHIPPT_U, dialogue: gechipptUnterstadt, when: NUR_AKT2 },
  { key: 'a2', map: 'stufenplatz', at: 'bistrotische', npc: GECHIPPT_M, dialogue: gechipptMittelring, when: NUR_AKT2 },
  { key: 'a2', map: 'glasarkaden', at: 'springbrunnen', npc: GECHIPPT_M, dialogue: gechipptMittelring, when: NUR_AKT2 },
  { key: 'a2', map: 'eisenhof', at: 'gerichtskantine', npc: GECHIPPT_M, dialogue: gechipptMittelring, when: NUR_AKT2 },
  { key: 'a2', map: 'kanal-sammler', at: 'floss-anleger', npc: KANALVOLK, dialogue: kanalvolk, when: NUR_AKT2 },
  { key: 'a2', map: 'flutmauer', at: [960, 330], npc: SPAZIERGAENGER, dialogue: kuesteAkt2, when: NUR_AKT2 },
  // Nachspiel nach Ende 1, 2 oder 3b
  { key: 'frei', map: 'neon-gasse', at: [860, 600], npc: NACHBARIN, dialogue: freiUnterstadt, when: FREI },
  { key: 'frei', map: 'schrottmarkt', at: 'waage', npc: NACHBARIN, dialogue: freiUnterstadt, when: FREI },
  { key: 'frei', map: 'stufenplatz', at: 'bistrotische', npc: PENDLER, dialogue: freiMittelring, when: FREI },
  { key: 'frei', map: 'eisenhof', at: 'gerichtskantine', npc: PENDLER, dialogue: freiMittelring, when: FREI },
  { key: 'frei', map: 'kanal-sammler', at: 'floss-anleger', npc: KANALVOLK, dialogue: kanalFrei, when: FREI },
  { key: 'frei', map: 'flutmauer', at: [960, 330], npc: SPAZIERGAENGER, dialogue: kuesteFrei, when: FREI },
  // Master-Modus
  { key: 'master', map: 'neon-gasse', at: [860, 600], npc: GECHIPPT_U, dialogue: masterUnterstadt, when: MASTER },
  { key: 'master', map: 'schrottmarkt', at: 'waage', npc: GECHIPPT_U, dialogue: masterUnterstadt, when: MASTER },
];

const mapAdditions: Record<string, MapAddition> = {};
for (const p of PLAETZE) {
  const add = (mapAdditions[p.map] ??= {});
  (add.npcs ??= []).push({ id: `welt23-passant-${p.key}-${p.map}`, npc: p.npc, at: p.at, facing: 's', dialogue: p.dialogue.id, when: p.when });
}

export const part: ContentPart = {
  npcs: byId(npcs),
  dialogues: byId([
    gechipptUnterstadt, gechipptMittelring, kanalvolk, kuesteAkt2, freiUnterstadt, freiMittelring, kanalFrei, kuesteFrei, masterUnterstadt,
  ]),
  mapAdditions,
};
