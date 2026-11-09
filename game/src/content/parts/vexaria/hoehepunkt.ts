// Vex × Aria „Über die Lücke“, „Elf Schnallen“, „Bin gleich zurück. Echt jetzt.“ (world.md §4.7, Stationen 9–11).
//
// Station 9 ersetzt für Vex `rom-aria-kuss` und (Freundschaft) `he-aria-10`. Kanon: ♥10, pers-aria-zerberster erledigt,
// Akt 2. Akt-1-Weg (gaps/vexaria.md): ♥8, Station 8 gesehen und `aria_versoehnung_verdient` (Vordach-Schluss von Station 8).
// Station 10 und 11 zählen zusammen als eine Station: 10 endet mit Abblende und Schlafen, 11 läuft direkt beim Tagesstart.
import type { ContentPart } from '../../part';
import type { Condition, CutsceneDef, DialogueDef, Effect, HeartEventDef, PhoneMessageDef } from '../../../modules/contracts';
import {
  a, all, ANGEBAHNT, any, byId, ch, chk, cut, dlg, flag, herz, HEUTE_FREI, n, node, noFlag, not, R, s, seen, set,
  poolDays, STATION_START, twin, V, v, ZWEI_TAGE, ZUSAMMEN,
} from './_util';

const BESCHWINGT: Effect = { checkBuff: { id: 'beschwingt-aria', label: 'Beschwingt', value: 1, attribute: 'ausstrahlung', forDays: 0, consumes: false } };
const KAS_FUNK = 'KANAL 9 · Kas, knisternd: „Schrapnell eins an alle: Nicht anhalten. Nicht umdrehen. Wir sehen uns im Ziel.“';

// ---------------------------------------------------------------------------
// Station 9 · rom-vexaria-kuss · „Über die Lücke“

// Kanon zusätzlich ♥10 und `pers-aria-zerberster` erledigt (Akt 2). Mit Akt-1-Brücke darf der Kuss schon in Akt 1 kommen
// (gaps/vexaria.md); im Kanonweg (versoehnung.ts) liegt die Quest ohnehin vor `rom-aria-regen`. Zweiter Weg: `spaet` im
// Nachspiel nach `rom-aria-stirn` b) (akt3.ts).
const KUSS_BASIS: Condition = all(
  V, HEUTE_FREI, seen('rom-vexaria-umdrehen'),
  any(flag('aria_versoehnung_verdient'), all({ flag: 'epilog' }, flag('aria_versoehnung_spaet'))), { hearts: 'aria', min: 8 },
);
const KUSS_ROM: Condition = all(R, any(ANGEBAHNT, ZUSAMMEN));

/** Dachterrasse bis zur Lücke; identisch für Romanze und Freundschaft bis auf den Sprung-Cutscene-Schlüssel. */
const kussStart = (id: string, rom: boolean): DialogueDef => dlg(id, [
  node('start', [
    n('Die Dachterrasse über der Neon-Gasse. Die Sonne hängt tief und orange über dem Dunst, die Lichterketten sind noch aus. Es regnet nicht. Zum ersten Mal seit Tagen regnet es nicht.'),
    n('Aria sitzt auf dem Geländer, die Beine über neun Stockwerken, und kaut auf einem Kronkorken. Neben ihr steht eine Sporttasche, aus der der Griff eines zweiten Schlägers ragt.'),
    a('Da bist du ja. Pünktlich. Natürlich pünktlich. Du bist so pünktlich, dass es wehtut.', 'freude'),
    a('Rennen. Von hier bis zur Flutmauer. Über die Dächer. Wer zuerst am Geländer ist.', 'signatur'),
    rom
      ? a('Und, Postbotin? Ich will dich schnaufen sehen. Hab ich dir versprochen. Unterm Vordach. Ich halt meine Versprechen.', 'verlegen')
      : a('Wer verliert, zahlt das Bier. Wer gewinnt, zahlt auch das Bier, weil du nie Kleingeld hast.', 'freude'),
    v('Ich schnauf nie.', 'signatur'),
    a('Dann streng dich mehr an. Auf drei. Eins –', 'signatur'),
    n('Sie rennt bei eins los. Natürlich rennt sie bei eins los.'),
  ], {
    effects: STATION_START,
    choices: [
      ch('Hinterher. Übers Wellblech, über die Wäscheleinen.', 'rennen'),
      ch('Abkürzung über den Lüftungsschacht.', 'rennen', { check: chk(`vexaria-kuss-reflexe${rom ? '' : '-fs'}`, 'reflexe', 6, ['dach', 'rennen']), effects: [herz(10)] }),
    ],
  }),
  node('rennen', [
    n('Drei Dächer. Du holst sie ein, als sie über eine Satellitenschüssel stolpert und lachend weiterrennt, den Schläger im Rucksack klappernd. Zwei Dächer. Du bist vorn. Du hörst sie hinter dir fluchen. Es klingt wie Musik.'),
    n('Dann die Lücke.'),
    n('Viereinhalb Meter. Neun Stockwerke. Zwei Jahre. Du wirst langsamer, ohne es zu wollen. Deine Beine wissen, wo sie sind.'),
    n('Aria rennt an dir vorbei. Sie rennt nicht drüber weg. Sie bleibt an der Kante stehen, genau an der Kante, dreht sich um und streckt dir die Hand hin. Die echte.'),
    a('Nicht wegen Gewinnen. Scheiß aufs Gewinnen.', 'neutral'),
    a(rom ? 'Zusammen. Auf drei. Ich zähl schlecht, also auf zwei.' : 'Zusammen. Auf drei. Ich zähl schlecht, also auf zwei.', rom ? 'zaertlich' : 'neutral'),
    v('… Wenn ich fall, bist du schuld.', 'besorgt'),
    a('Wenn du fällst, spring ich hinterher und hau dich unten nochmal um. Zwei.', 'signatur'),
  ], {
    choices: [
      ch('Springen. Mit ihr.', 'sprung', { requires: flag('vexaria_kas_erzaehlt'), tag: '[Kas]' }),
      ch('Den langen Weg.', 'lang'),
    ],
  }),
  node('sprung', [
    n('Du nimmst ihre Hand. Nicht die echte. Deine schwarze Metallhand in ihren silbernen Zerberster, Metall in Metall, genau über der Stelle, an der dein echter Arm geblieben ist.'),
    n('Zwei.'),
  ], { effects: [set('vexaria_luecke_gesprungen'), { cutscene: rom ? 'rom-vexaria-sprung' : 'rom-vexaria-sprung-fs' }] }),
  node('lang', [
    v('Den langen Weg.'),
    n('Aria sieht dich an. Lange. Dann nickt sie.'),
    a('Ich wart drüben. Ich lauf nicht weg.', 'neutral'),
    n('Sie springt allein, schlecht und laut, landet auf allen vieren und rappelt sich auf. Du rennst die Feuertreppe runter, durch die Gasse, die andere Feuertreppe hoch. Vier Minuten.'),
    n('Sie steht wirklich an der Kante, als du oben ankommst. Sie hat sich nicht vom Fleck bewegt. Dann schlägt sie dir auf die Schulter und rennt los, und diesmal holst du sie nicht mehr ein.'),
  ], { effects: [set('vexaria_luecke_lang'), { advanceTime: 4 }, { dialogue: rom ? 'rom-vexaria-kuss-mauer' : 'rom-vexaria-kuss-mauer-fs' }] }),
]);

const kussMauer: DialogueDef = dlg('rom-vexaria-kuss-mauer', [
  node('start', [
    n('Die Flutmauer. Der letzte Laufsteg, das Geländer, dahinter das Meer im Dunst und eine Sonne, die aussieht, als würde sie gleich ins Wasser fallen.'),
  ], {
    choices: [
      ch('Ans Geländer.', 'patt', { when: flag('vexaria_luecke_gesprungen') }),
      ch('Ans Geländer.', 'verloren', { when: noFlag('vexaria_luecke_gesprungen') }),
    ],
  }),
  node('patt', [
    n('Ihr schlagt gleichzeitig ans Geländer. Gleichzeitig. Auf den Zentimeter. Ihre Hand hat deine nicht losgelassen, seit drei Dächern nicht.'),
    a('Unentschieden zählt nicht.', 'freude'),
    v('Zählt nie.', 'freude'),
  ], { next: 'mauer' }),
  node('verloren', [
    n('Sie hängt schon am Geländer, als du ankommst, die Arme ausgebreitet wie eine Siegerin auf einem Plakat.'),
    a('GEWONNEN! Ich hab GEWONNEN! Gegen DICH!', 'freude'),
  ], { next: 'mauer' }),
  node('mauer', [
    n('Ihr klettert aufs Geländer. Nebeneinander, die Beine über dem Schlick, das Meer vor euch.'),
    a('Du schnaufst ja nicht mal. Das ist widerlich. Ich steh drauf. Das ist auch widerlich.', 'freude'),
    n('Sie zieht etwas aus der Hosentasche, eingeschweißt, an den Ecken weich gerieben. Ein Backstage-Pass. „KABELBRAND – ABSCHIEDSTOUR 2083“.'),
    a('Den Pass schlepp ich seit drei Jahren mit mir rum. In der Nacht lagst du auf dem Dach, ohne Ticket. Jetzt hast du eins. Backstage. Lebenslang. Ich bin die Ausstellerin, ich darf das.', 'verlegen'),
    v('Kas hatte auch so einen. Fake. Selbst laminiert. Hat nie funktioniert.', 'freude'),
    a('Der hier ist echt.', 'zaertlich'),
    n('Dann holt sie den zweiten Schläger aus der Tasche. Alt, verbeult, das Griffband in drei Farben geflickt.'),
    a('Mein Ersatzschläger. Der war vor dem Zerberster. Ich hab mit dem hier Dexters Tonne getroffen. Und Hunters Geländer. Pass drauf auf.', 'neutral'),
    a('Weißt du, dass du mich nie Brecherin nennst? Nicht ein Mal. Ich hab drauf gewartet.', 'zaertlich'),
    v('Brecherin ist \'n Job. Du bist Stern. Klappe jetzt, ist mir peinlich.', 'verlegen'),
    n('Sie legt die Zerberster-Hand in deine. Die silbernen Finger, schwer und kühl.'),
    a('Ich spür nix mit der Hand. Aber ich weiß, dass du sie hältst.', 'zaertlich'),
  ], {
    effects: [
      { give: 'arias-ersatzschlaeger' }, { give: 'kabelbrand-pass' },
      set('aria_romanze_zusammen'), set('aria_romanze_angebahnt', false), set('aria_romanze_streit', false),
      ...ZWEI_TAGE, herz(80),
    ],
    choices: [
      ch('Sie ansehen.', 'knutsch', { when: flag('vexaria_knutsch') }),
      ch('Sie ansehen.', 'abgeschlagen', { when: noFlag('vexaria_knutsch') }),
    ],
  }),
  node('knutsch', [a('In der Gasse war\'s geklaut. Das hier ist bezahlt.', 'verlegen')], { next: 'wahl' }),
  node('abgeschlagen', [a('Ich hab in der Gasse abgeschlagen. Du bist immer noch dran. Seit Wochen, Postbotin.', 'verlegen')], { next: 'wahl' }),
  node('wahl', [
    n('Der Wind zerrt an ihren Zöpfen. Ihre Lippe hat noch eine kleine Kruste von den Rostzähnen. Sie sieht auf deinen Mund und tut nicht mal so, als würde sie woanders hinsehen.'),
  ], {
    choices: [
      ch('Sie küssen.', 'kuss'),
      ch('Warten.', 'warten'),
      ch('Nur ihre Hand halten. Noch nicht.', 'hand'),
    ],
  }),
  node('warten', [
    a('Gott, du rennst schneller, als du küsst. Komm her.', 'verlegen'),
  ], { next: 'kuss' }),
  node('kuss', [
    n('Kein Abschlagen, keine Wand, kein Dante. Die Zerberster-Finger haken sich in den Silberring an deinem Brustriemen, so vorsichtig, als könnte sie dich kaputtmachen. Ein kurzer Kuss.'),
    n('Salz. Kirschkaugummi. Ihr Atem, der zittert.'),
    v('… Okay. Okay. Das war nicht komplett scheiße.', 'verlegen'),
    a('NICHT KOMPLETT SCHEISSE?', 'ueberrascht'),
    n('Sie lacht, packt dich mit beiden Händen an den Gurtriemen und küsst dich noch einmal, diesmal länger und ungeduldiger. Sie zieht dich am Gurtzeug zu sich, bis das Geländer unter dir knarzt und du nicht mehr weißt, ob das Herzklopfen deins ist oder ihrs.'),
    n('Deine linke Hand, die echte, rutscht an ihren Nacken, in die Zöpfe, in die warmen, schweren Locken. Die Metallhand bleibt am Geländer, als würdest du ihr das hier nicht zutrauen. Die Möwen schreien. Keine von euch hört hin.'),
    a('Und? Immer noch nicht komplett scheiße?', 'zaertlich'),
    v('Halbwegs gut. Ich brauch mehr Daten.', 'signatur'),
    a('Scheiße. Ich hab gezittert. Sag\'s keinem.', 'verlegen'),
    v('… Du hast auch gezittert.'),
    a('Wind.', 'verlegen'),
    v('Klar. Wind.', 'freude'),
  ], { effects: [set('aria_kuss'), herz(40), { cutscene: 'rom-vexaria-kuss' }] }),
  node('hand', [
    v('Nur deine Hand. Noch nicht.'),
    a('Okay. Ich lauf nicht weg. Diesmal nicht.', 'zaertlich'),
    n('Sie lehnt sich an deine Schulter. Die Sonne fällt ins Meer. Ihr seht zu, bis nichts mehr von ihr übrig ist als ein roter Strich.'),
  ], { effects: [{ travel: 'flutmauer', entry: 'von-hafenkante', minutes: 30 }] }),
]);

const kussNachher: DialogueDef = dlg('rom-vexaria-kuss-nachher', [
  node('start', [
    n('Irgendwann ist die Sonne weg. Ihr sitzt immer noch auf dem Geländer. Ihre Stirn an deiner Schläfe. Dein Funk knackt.'),
    n('KANAL 4 · Kurier Sieben-Neun: „Chefin knutscht auf der Flutmauer. Wiederhole: Chefin knutscht.“'),
    v('Kanal. WECHSELN.', 'wut'),
    a('Lass sie. Ich will, dass es alle wissen. Ich will, dass es Ripper weiß. Ich will, dass es MÖWEN wissen.', 'freude'),
  ], { effects: [{ travel: 'flutmauer', entry: 'von-hafenkante', minutes: 30 }] }),
]);

const kussMauerFs: DialogueDef = dlg('rom-vexaria-kuss-mauer-fs', [
  node('start', [
    n('Die Flutmauer. Das Meer im Dunst, die Sonne kurz vorm Absaufen.'),
  ], {
    choices: [
      ch('Ans Geländer.', 'patt', { when: flag('vexaria_luecke_gesprungen') }),
      ch('Ans Geländer.', 'verloren', { when: noFlag('vexaria_luecke_gesprungen') }),
    ],
  }),
  node('patt', [
    n('Gleichzeitig. Ihre Hand und deine knallen im selben Moment aufs Geländer.'),
    a('Unentschieden zählt nicht.', 'freude'),
    v('Zählt nie.', 'freude'),
  ], { next: 'mauer' }),
  node('verloren', [a('GEWONNEN! Gegen die Postbotin! Schreib\'s auf, Vega!', 'freude')], { next: 'mauer' }),
  node('mauer', [
    n('Ihr hockt euch aufs Geländer. Aria wühlt in der Tasche und drückt dir einen alten Schläger in die Hand, das Griffband in drei Farben geflickt.'),
    a('Mein Ersatzschläger. Von vor dem Zerberster. Ist jetzt deiner. Wenn du ihn verlierst, verlier ich dich. Kapiert?', 'freude'),
    n('Dann fischt sie zwei Kronkorken aus der Hosentasche und gibt dir einen. Ihr werft sie gleichzeitig. Weit draußen machen sie zwei winzige Ringe im Wasser.'),
    v('Und noch einen.'),
    n('Du ziehst einen dritten aus deiner Weste. Platt, alt, mit einem Zickzack-Dach eingeritzt. Du wirfst ihn allein. Für Kas.'),
    a('Wir sind quitt. Nee, sind wir nicht. Ich schulde dir \'n Umdrehen. Du mir \'n Konzert.', 'freude'),
  ], {
    effects: [{ give: 'arias-ersatzschlaeger' }, set('aria_romanze_freundschaft'), ...ZWEI_TAGE, herz(80), { travel: 'flutmauer', entry: 'von-hafenkante', minutes: 30 }],
  }),
]);

// ---------------------------------------------------------------------------
// Station 10 · rom-vexaria-licht · „Elf Schnallen“ (ohne Tafel, Abblende)

const licht: DialogueDef = dlg('rom-vexaria-licht', [
  node('start', [
    n('Vor dem High Voltage. Du kommst gerade raus, die Tür fällt hinter dir zu und schneidet die Musik ab. Aria lehnt am Türrahmen. Die Leuchtreklame macht ihre Zöpfe rot und blau.'),
    a('Wo pennst du heute, Postbotin?', 'verlegen'),
    v('Bude. Zweite Nacht am Stück. Hab ich noch nie gemacht.', 'neutral'),
    n('Zwei Nächte am selben Ort. Dafür braucht man einen Grund. Du hast nie einen gehabt.'),
    a('Allein?', 'verlegen'),
    a('Sag nein. Sag einfach nein, dann muss ich nicht noch mehr reden. Ich bin scheiße im Reden, wenn ich will, dass was passiert.', 'verlegen'),
  ], {
    effects: STATION_START,
    choices: [
      ch('„Komm mit.“', undefined, { effects: [{ dialogue: 'rom-vexaria-licht-bude' }] }),
      ch('„Ein andermal.“', 'andermal'),
    ],
  }),
  node('andermal', [
    a('Gut. Dann hab ich mehr Zeit, mir auszudenken, was ich mit dir mach. Ich komm wieder. Mit Brecheisen.', 'signatur'),
    n('Sie stößt sich vom Türrahmen ab, küsst dich im Vorbeigehen auf den Mundwinkel und ist weg, bevor du was sagen kannst.'),
  ], { effects: [set('vexaria_licht_spaeter')] }),
]);

/**
 * Die Nacht in der Kurierbude; auch Wiederholung über das Tagesgespräch, solange Station 11 fehlt.
 * Ablauf: Gasse (Hand / zuhören / Hauseingang) → Rolltor (Kronkorken) → Handschuh → wer führt (Vex am Rolltor / Aria am
 * Rolltor / langsam auf der Matratze) → elf Schnallen (eine reißt) → Haut → was gesagt wird → Schluss mit „Klick“.
 * Alle Wege münden in `schluss` (Flags `aria_nacht`, `vexaria_nacht`, `vexaria_nacht_woche`, Abblende `rom-vexaria-licht`).
 */
const lichtBude: DialogueDef = dlg('rom-vexaria-licht-bude', [
  node('start', [
    n('Die Lötgassen. Ihr lauft nebeneinander, nicht über die Dächer, unten durch die Gasse, wie normale Leute. Aria redet die ganze Zeit. Über Kabelbrand, über Kiki, über einen Hund, den sie mal fast geklaut hätte. Ihre Hand stößt bei jedem Schritt an deine.'),
    n('Es ist die echte Hand. Sie stößt nicht aus Versehen an. Beim fünften Mal hakt sie den kleinen Finger in deinen und tut so, als wäre nichts.'),
    a('… und dann sagt Kiki, der Hund wär \'n Wolf, und ich sag, Kiki, das ist \'n Pudel mit Kettenhemd, und – warum guckst du so?', 'verlegen'),
    v('Du redest.', 'signatur'),
    a('Ich red, wenn ich nervös bin. Ich bin nicht nervös. Ich red einfach gern. Halt die Klappe.', 'verlegen'),
  ], {
    choices: [
      ch('Ihre Hand nehmen. Ganz, nicht nur den Finger.', 'gasse-hand', { effects: [herz(10)] }),
      ch('Sie weiterreden lassen. Zuhören.', 'gasse-reden', { effects: [herz(10)] }),
      ch('Sie in den nächsten Hauseingang ziehen.', 'gasse-eingang', { effects: [herz(10)] }),
    ],
  }),
  node('gasse-hand', [
    n('Du nimmst ihre Hand. Ganz. Finger zwischen Finger, die Narben in deiner Handfläche an ihrer warmen Haut. Aria verstummt mitten im Satz. Mitten im Wort „Kettenhemd“.'),
    a('… Okay. Das ist neu.', 'verlegen'),
    v('Ich halt Hände. Manchmal.', 'verlegen'),
    a('Seit wann?', 'ueberrascht'),
    v('Seit grad.'),
    n('Sie sagt den Rest des Weges kein Wort mehr. Aber ihr Daumen fährt über deinen Handrücken, hin und her, hin und her, als müsste sie nachprüfen, ob du noch da bist. Du bist da.'),
  ], { next: 'tor' }),
  node('gasse-reden', [
    n('Du sagst nichts. Du hörst zu. Der Hund. Kikis Taxi. Ein Konzert, auf dem sie nie war. Der Hund nochmal. Irgendwann, unter der einzigen Laterne der Lötgassen, die noch brennt, geht ihr der Text aus.'),
    a('Ich red Scheiße.', 'verlegen'),
    v('Ja.', 'zaertlich'),
    a('Und du lässt mich.', 'verlegen'),
    v('Ich mag, wie du Scheiße redest. Du wirst laut, wenn\'s dir wichtig ist. Bei dem Hund warst du sehr laut.', 'signatur'),
    a('Ich hab den Hund GELIEBT, Vex.', 'wut'),
    n('Sie lacht, schubst dich mit der Schulter gegen eine Mülltonne und hält dich am Gurtzeug fest, bevor du fällst. Danach lässt sie nicht mehr los.'),
  ], { next: 'tor' }),
  node('gasse-eingang', [
    n('Ein Hauseingang, drei Meter tief, eine kaputte Klingelleiste. Du ziehst sie am Handgelenk rein, und sie lässt sich ziehen, und das ist das Erstaunlichste an der ganzen Sache.'),
    n('Kein Wort. Ihr Rücken an den Briefkästen, deine Hand an ihrer Hüfte, und du küsst sie, als hättest du dich den ganzen Weg zusammengerissen. Hast du ja auch. Sie schmeckt nach dem letzten Bier im High Voltage und nach Kirschkaugummi. Sie macht ein Geräusch, tief in der Kehle, und die Briefkästen klappern.'),
    a('Postbotin. Wir sind. Fünfzig Meter. Von deiner Tür.', 'verlegen'),
    v('Weiß ich.', 'signatur'),
    a('Dann lauf, du Arschloch. Lauf, bevor ich\'s mir hier gemütlich mach.', 'verlegen'),
    n('Über euch geht ein Fenster auf. Jemand brüllt was von Polizei. Aria brüllt was zurück, das man nicht auf eine Klingelleiste schreiben würde. Ihr rennt die letzten fünfzig Meter. Lachend.'),
  ], { next: 'tor' }),
  node('tor', [
    n('Das Rolltor. Die Glühbirne an der Kette, die durch den Spalt oben ins Wellblech hängt. Du suchst den Schlüssel. Deine Finger sind auf einmal eine Spur zu langsam, und diesmal liegt es nicht am Ratenarm.'),
    a('Zitterst du?', 'signatur'),
    v('Kalt.', 'verlegen'),
    a('Es sind vierzehn Grad, Rennsemmel.', 'freude'),
    n('Das Schloss klickt. Du schließt auf.'),
  ], {
    choices: [
      ch('Rein.', 'kronkorken', { when: noFlag('vexaria_kronkorken') }),
      ch('Rein.', 'handschuh', { when: flag('vexaria_kronkorken') }),
    ],
  }),
  node('kronkorken', [
    n('Aria bleibt am Rolltor stehen. Da, wo der Kronkorken war, ist nur noch ein heller Fleck im Rost. Sie sagt nichts. Sie kramt einen neuen aus der Hosentasche, beißt ihn platt und drückt ihn mit dem Zerberster-Daumen an dieselbe Stelle. Fest. Er bleibt.'),
    a('So. Und jetzt kratz den mal ab.', 'signatur'),
  ], { effects: [set('vexaria_kronkorken'), { give: 'aria-kronkorken' }], next: 'handschuh' }),
  node('handschuh', [
    n('Drinnen riecht es nach Kettenöl und Pappe. Aria nimmt deine linke Hand. Den Handschuh. Sie zieht ihn dir aus, Finger für Finger, den ersten mit den Zähnen. Dann lacht sie über sich selbst, laut, und hört nicht auf.'),
    n('Dann hört sie auf. Sie sieht die Narben in deiner Handfläche. Weiß, wulstig, kreuz und quer, Dachpappe und Glas.'),
    a('Die versteckst du? Du läufst mit \'nem ganzen Ripper-Arm rum, und DIE versteckst du?', 'zaertlich'),
    n('Sie küsst sie. Die Narben, eine nach der anderen. Ihr Atem ist warm in deiner offenen Hand, und du merkst, dass du die Luft anhältst. Dann, ohne Witz, ohne Grinsen, küsst sie auch die schwarzen Metallknöchel deiner rechten.'),
    v('Der spürt nix.', 'neutral'),
    a('Weiß ich. Ist trotzdem deiner.', 'zaertlich'),
    n('Du nimmst ihre Metallhand. Den Zerberster, kühl und schwer. Du legst ihn dir aufs Brustbein, über das Top, da, wo es klopft.'),
    a('Ich spür nix. Nicht mal, ob\'s klopft.', 'trauer'),
    v('Es klopft. Ich spür\'s für zwei.', 'zaertlich'),
    a('Okay. Das war das Kitschigste, was du je gesagt hast, und ich bin komplett hinüber. Halt die Klappe und küss mich, Rennsemmel.', 'zaertlich'),
  ], {
    choices: [
      ch('Sie umdrehen. Mit dem Rücken ans Rolltor.', 'vex-tor', { effects: [herz(10)] }),
      ch('Sie machen lassen.', 'aria-tor', { effects: [herz(10)] }),
      ch('„Langsam. Ich will mir das merken.“', 'langsam', { effects: [herz(15)] }),
    ],
  }),
  // Vex führt, stürmisch.
  node('vex-tor', [
    n('Eine Drehung, ein Schritt, und jetzt ist es ihr Rücken, der gegen das Rolltor scheppert. Das Wellblech singt. Irgendwo in den Lötgassen bellt ein Hund.'),
    a('Oh. Okay. OKAY. So läuft das.', 'ueberrascht'),
    v('So läuft das.', 'signatur'),
    n('Du küsst sie. Nicht wie auf der Flutmauer. Nicht vorsichtig. Deine echte Hand in ihrem Nacken, unter den Zöpfen, wo die Haut warm ist und noch ein bisschen feucht vom Rennen. Die Metallhand liegt neben ihrem Kopf flach am Tor, still, damit sie nichts kaputtmacht.'),
    n('Ihr Mundwinkel. Ihr Kinn. Die Stelle unter dem Ohr. Sie atmet scharf durch die Zähne ein. Ihr Puls schlägt dir gegen die Lippen, schnell, schneller als deiner. Nein. Genauso schnell.'),
    a('Vex. Vex. Wenn du da weitermachst, hab ich morgen \'nen Fleck, und Vega sieht den. Vega sieht ALLES.', 'verlegen'),
    v('Soll ich aufhören?', 'zaertlich'),
    a('Hab ich das gesagt? Hab ich irgendwas von Aufhören gesagt?', 'verlegen'),
    n('Sie packt dich am Gurtzeug. Die Zerberster-Finger haken sich in die Riemen, und dann hält sie inne. Das Silber summt, ganz leise. Sie sieht auf ihre eigene Hand, als gehörte sie wem anders.'),
    a('Wenn ich zu fest zudrück, sag\'s. Echt jetzt. Der Arm weiß nicht, wo du aufhörst. Ich hab mal \'nen Türgriff aus \'nem Auto gerissen, weil ich mich gefreut hab.', 'besorgt'),
    v('Du drückst nicht zu fest. Du drückst genau richtig.', 'zaertlich'),
    a('Okay. Okay. Gut. … Wie viele Schnallen hat das Scheißding?', 'wut'),
  ], { next: 'schnallen' }),
  // Aria führt, stürmisch.
  node('aria-tor', [
    n('Weiter kommst du nicht. Das Rolltor scheppert, als dein Rücken dagegen stößt. Aria küsst dich, als hätte sie seit der Gasse auf nichts anderes gewartet, die echte Hand unter deinem Gurtzeug flach auf deinem Rücken, die Metallfinger an den Riemen. Dein Herz hämmert gegen ihre Silberschale.'),
    n('Sie führt. Natürlich führt sie. Sie küsst, wie sie rennt: zu früh los, zu laut, mit vollem Einsatz. Ihre Zähne an deiner Unterlippe. Ihre Hand, die unter dem Leder über deine Wirbelsäule nach oben wandert, Wirbel für Wirbel, bis zu den Schulterblättern, und wieder runter.'),
    n('Dann streift ihr Daumen die Naht an deiner rechten Schulter. Da, wo das Schwarz anfängt. Du zuckst.'),
    a('Tut das weh?', 'besorgt'),
    v('Nein. Das … spür ich nur sehr.', 'verlegen'),
    a('Gut zu wissen.', 'signatur'),
    n('Sie macht es nochmal. Langsamer. Du hörst dich selbst ausatmen, und es klingt nicht wie du.'),
    a('Und wenn ich mit dem Ding zu fest zudrück, sag\'s. Ich mein\'s ernst. Ich zerbrech Schläger, ohne\'s zu merken.', 'besorgt'),
    v('Ich bin kein Schläger.', 'signatur'),
    a('Nee. Du bist schlimmer. Du bist verschnallt. Wie viele Schnallen hat das Scheißding?', 'wut'),
  ], { next: 'schnallen' }),
  // Gemeinsam, langsam, auf der Matratze.
  node('langsam', [
    n('Aria hält inne. Ihre Stirn sinkt gegen deine. Ihr Atem geht schnell, und sie zwingt ihn langsamer, du hörst es. Ein. Aus. Wie vor einem Schlag.'),
    a('Merken. Okay. Du Kitschbombe.', 'zaertlich'),
    n('Du ziehst sie zur Matratze. Ihr setzt euch hin, Knie an Knie, zwischen euch die Kiste mit dem Edding und den Paketscheinen. Du schiebst die Kiste weg. Mit dem Fuß. Sie lacht.'),
    n('Dann küsst ihr euch. Langsam, wie du gesagt hast. So langsam, dass jeder Kuss ein eigener ist. Einer auf den Mund. Einer auf die kleine Stelle an ihrer Lippe, wo die Rostzähne sie erwischt haben. Einer, der aus Versehen auf der Nase landet. Ihre echte Hand an deinem Kiefer. Deine in ihrem Haar. Du löst einen Zopf. Ganz. Gummi für Gummi.'),
    a('Weißt du, wie lang ich für die brauch?', 'verlegen'),
    v('Ich flecht sie dir morgen.', 'zaertlich'),
    a('Du kannst nicht flechten.', 'freude'),
    v('Ich lern\'s. Ich hab Zeit. Hab ich gehört.', 'signatur'),
    n('Ihr Atem stolpert. Sie legt die Zerberster-Hand an deine Hüfte, ganz vorsichtig, die Handfläche zuerst, als würde sie ein rohes Ei anfassen.'),
    a('Wenn ich zu fest zudrück, sag\'s. Ich spür\'s ja nicht. Du musst es mir sagen. Versprich\'s.', 'besorgt'),
    v('Versprochen. Und du sagst, wenn ich zu langsam bin.', 'zaertlich'),
    a('Du bist zu langsam.', 'verlegen'),
    v('Gelogen.', 'signatur'),
    a('Gelogen. Hör nicht auf. … Wie viele Schnallen hat das Scheißding eigentlich?', 'verlegen'),
  ], { next: 'schnallen' }),
  node('schnallen', [
    v('Elf. Diebstahlsicher.', 'signatur'),
    a('Ich bin Brecherin.', 'signatur'),
    v('Dachte, das bist du nicht mehr.'),
    a('Heute Nacht bin ich, was ich will.', 'zaertlich'),
    n('Ihre Zerberster-Finger schließen sich um den Brustriemen. Eine Spur zu fest. Es knackt. Eine Schnalle reißt ab und klirrt auf den Betonboden, hüpft zweimal und bleibt unter der Kiste liegen.'),
    a('Ups. Zehn.', 'verlegen'),
    n('Dann wird sie blass. Richtig blass, im Streifen Gassenlicht unter dem Rolltor.'),
    a('Scheiße. Scheiße, Vex, das ist Kas\' Gurtzeug. Ich hab Kas\' Gurtzeug kaputtgemacht. Ich –', 'besorgt'),
    n('Du lachst. Laut. Es hallt im Wellblech. Du lachst, bis sie mitlacht, erst unsicher, dann richtig, das Gesicht an deinem Hals, ihr Atem heiß auf deiner Haut.'),
    v('Die war locker, seit er damit vom Taubenschlag gerutscht ist. Er hätt\'s witzig gefunden. Er hätt gesagt: Endlich kriegt das Ding mal eine auf.', 'zaertlich'),
    a('… Zieh das Ding aus. Ich will wissen, wie du ohne die ganzen Riemen bist.', 'verlegen'),
    a('Wenn du willst. Nur wenn du willst.', 'zaertlich'),
  ], {
    choices: [
      ch('„Ich bin schneller.“', 'schneller', { check: chk('vexaria-licht-reflexe', 'reflexe', 6, ['flirt']), effects: [herz(20)] }),
      ch('„Lass. Ich guck dir gern beim Kämpfen zu.“', 'kaempfen', { effects: [herz(10)] }),
      ch('„Der Handschuh war der einfache Teil.“', 'handschuh-satz', { check: chk('vexaria-licht-strasse', 'strasse', 5, ['flirt']), effects: [herz(20)] }),
      ch('Ihre Hand nehmen. Jede Schnalle zusammen aufmachen.', 'zusammen', { effects: [herz(20)] }),
    ],
  }),
  node('schneller', [
    n('Zehn Schnallen. Zwei Sekunden. Klick klick klick, deine Finger kennen jede einzelne im Dunkeln. Das Gurtzeug rutscht dir von den Schultern und fällt mit einem dumpfen Klatschen auf den Boden. Das Gurtzeug liegt nie auf dem Boden.'),
    a('… Okay. Das war heiß.', 'verlegen'),
    a('Mach das nochmal. Nee. Mach das nie wieder vor anderen Leuten. Sonst bring ich wen um.', 'verlegen'),
  ], { next: 'haut' }),
  node('kaempfen', [
    n('Du lässt die Arme hängen. Aria knurrt und macht sich über die Schnallen her, eine nach der anderen, mit der echten Hand, die Zunge zwischen den Zähnen, wie bei einem Schloss, das nicht aufgehen will.'),
    a('Das Gurtzeug und ich, wir haben was zu klären.', 'signatur'),
    n('Bei jeder Schnalle, die aufgeht, küsst sie die Stelle darunter. Schlüsselbein. Schulter. Die Kuhle am Hals. Erst durchs Top, dann daneben, auf die Haut. Bei der siebten weißt du nicht mehr, wie Zählen geht.'),
    n('Es dauert. Es dauert lange. Keine von euch beschwert sich.'),
  ], { next: 'haut' }),
  node('handschuh-satz', [
    a('Ich hasse dich. Ich hasse dich so sehr. Komm her.', 'verlegen'),
    n('Sie wird rot. Bis in die Zöpfe. Du hättest nicht gedacht, dass das geht.'),
    n('Sie zieht dich an den Riemen zu sich, und während ihr euch küsst, findet sie die Schnallen blind. Eine. Zwei. Bei der fünften flucht sie dir in den Mund. Bei der zehnten lacht sie.'),
  ], { next: 'haut' }),
  node('zusammen', [
    n('Du nimmst ihre echte Hand und legst sie auf die oberste Schnalle. Deine Finger über ihre. Ihr macht sie zusammen auf. Klick.'),
    v('Die hat Kas immer zuerst zugemacht. Die da klemmt bei jedem Regen. Die hier hab ich mit \'nem Kronkorken geflickt.', 'zaertlich'),
    n('Schnalle für Schnalle. Zu jeder sagst du einen Satz. Du hast noch nie so viel über das Gurtzeug geredet. Du hast überhaupt noch nie so viel geredet. Aria sagt kein Wort. Sie hört zu, die Stirn an deiner Schulter, und bei der letzten zittern ihre Finger mehr als deine.'),
    n('Das Gurtzeug rutscht dir von den Schultern. Sie fängt es auf, bevor es den Boden berührt, und legt es auf die Kiste. Ordentlich. Wie was Kostbares.'),
    a('Liegt nie auf dem Boden. Hab ich mir gemerkt.', 'zaertlich'),
  ], { next: 'haut' }),
  node('haut', [
    n('Ohne die Riemen bist du leichter. Das merkst du erst jetzt. Zwei Jahre hast du das Gewicht getragen, und jetzt liegt es da, und deine Schultern wissen nicht, wohin mit sich.'),
    n('Aria weiß es. Sie legt die echte Hand auf deine linke Schulter und fährt den Weg nach, den die Riemen jeden Tag drücken. Rote Striemen, in die Haut gedrückt. Sie küsst jeden einzelnen. Ihr Atem kitzelt, und du kriegst Gänsehaut bis in den Nacken.'),
    a('Die tun weh, oder? Jeden Abend.', 'besorgt'),
    v('Jetzt nicht.', 'verlegen'),
    n('Dann die andere Seite. Die Naht, wo das Schwarz anfängt. Sie küsst sie nicht wie eine Wunde. Sie küsst sie wie den Rest von dir.'),
    n('Du ziehst ihr das Gummi aus dem letzten Zopf. Die Locken fallen über das Silber an ihrer Schulter, dahin, wo der Zerberster in die Haut übergeht und eine helle, gezackte Naht unter dem Shirtkragen verschwindet. Du legst den Mund drauf. Sie hält die Luft an. Ganz.'),
    a('Da … da hat noch keine. Da lass ich keine hin.', 'verlegen'),
    v('Soll ich aufhören?', 'zaertlich'),
    a('Wenn du aufhörst, hau ich dich.', 'zaertlich'),
    n('Ihr Herz schlägt unter deiner Hand. Schnell und ungleichmäßig, wie ein Motor, der nicht anspringen will. Deins macht dasselbe. Die Zerberster-Hand liegt an deiner Hüfte, schwer und kühl auf der Haut über dem Gürtel, und sie bewegt sie keinen Millimeter, so sehr passt sie auf. Nur der Daumen. Hin und her. Er zittert.'),
  ], {
    choices: [
      ch('„Du zitterst ja, Großmaul. Wind?“', 'necken', { effects: [herz(10)] }),
      ch('„Ich hab Schiss. Nicht vor dir. Davor, dass ich morgen abhau.“', 'ehrlich', { effects: [herz(20)] }),
      ch('„Das Gurtzeug. Ich hab\'s noch nie für wen ausgezogen.“', 'kas', { effects: [herz(20)] }),
      ch('„Zeig mir die Narbe. Die ganze.“', 'narbe', { effects: [herz(20)] }),
    ],
  }),
  node('necken', [
    a('Hier drin ist kein Wind, du Arschloch.', 'verlegen'),
    a('Ich zitter, weil ich seit der Flutmauer an nix anderes denk, und jetzt bist du da und hast kein Gurtzeug an, und ich weiß nicht, wo ich zuerst hinfassen soll. Zufrieden?', 'verlegen'),
    v('Sehr.', 'signatur'),
    a('Du grinst. Du grinst nie, und jetzt grinst du, und ich hasse dich.', 'freude'),
    v('Du hasst mich ziemlich oft heute.', 'freude'),
    a('Ich bin sehr gründlich.', 'signatur'),
    n('Sie beißt dir in die Schulter. Nicht fest. Fest genug. Du lachst, sie lacht, und irgendwie landet ihr beide auf der Matratze, sie halb auf dir, und die Matratze quietscht so laut, dass ihr gleich nochmal lachen müsst.'),
  ], { next: 'schluss' }),
  node('ehrlich', [
    n('Es rutscht dir raus. Du wolltest es nicht sagen. Aber jetzt ist es draußen und hängt zwischen euch in der Luft wie die Glühbirne.'),
    n('Aria sagt nichts. Sie nimmt dein Gesicht in beide Hände. Die echte warm, die silberne kühl. Rechts und links, wie ein Schraubstock. Ein sehr vorsichtiger.'),
    a('Dann hau ab. Morgen. Wenn du musst.', 'zaertlich'),
    a('Und dann komm wieder. Das ist alles, was ich will. Nicht, dass du bleibst. Dass du wiederkommst.', 'zaertlich'),
    v('… Ich kann das nicht gut. Wiederkommen.', 'trauer'),
    a('Du bist über die Lücke. Du kannst alles. Und jetzt küss mich, bevor ich heul. Ich heul beim Küssen echt scheiße.', 'verlegen'),
    n('Du küsst sie. Lange. Ihr Atem zittert gegen deinen, und dann nicht mehr.'),
  ], { next: 'schluss' }),
  node('kas', [
    n('Du siehst rüber zur Kiste. Zum Gurtzeug. Zehn Schnallen, eine Lücke.'),
    v('Nur zum Pennen. Allein. Seit zwei Jahren schlaf ich in Kas\' Riemen ein und wach in Kas\' Riemen auf.', 'trauer'),
    v('Er hätt dich gemocht. Er hätt dich auch gewarnt. Vor mir. Ich schnarch nicht, aber ich tret.', 'zaertlich'),
    a('Ich tret auch. Ich tret wie \'n Pferd. Wir treten uns gegenseitig aus dem Bett, dann ist\'s fair.', 'freude'),
    n('Dann wird sie ernst. Sie legt die Stirn an deine.'),
    a('Danke. Dass du\'s für mich ausziehst. Ich weiß, was das ist. Ich pass drauf auf. Auf dich und auf das Ding.', 'zaertlich'),
    n('Sie küsst dich, und es ist anders als vorhin am Tor. Kein Kampf mehr. Als würde sie etwas versprechen.'),
  ], { next: 'schluss' }),
  node('narbe', [
    n('Aria erstarrt. Eine Sekunde. Zwei. Du siehst, wie sie überlegt, einen Witz zu machen. Sie macht keinen.'),
    a('Die ist hässlich. Die geht ziemlich weit. Dante hat gesagt, die wird nie schön.', 'trauer'),
    v('Ich hab elf Schnallen aufgemacht. Zehn. Für dich. Zeig sie mir.', 'zaertlich'),
    n('Sie zieht das Bandshirt über den Kopf. Der rote Stern landet auf dem Schläger. Sie dreht dir die linke Schulter zu, wo das Silber anfängt, und sieht weg, an die Wand, an den Rostfleck, der aussieht wie die Stadt.'),
    n('Die Naht läuft vom Schlüsselbein über die Schulter nach hinten, gezackt und wulstig, drei Nächte Dante. Du fährst sie mit den Fingern nach. Dann mit dem Mund, bis zum Schulterblatt, wo sie aufhört. Aria atmet aus, lang und zitternd, als hätte sie die Luft seit drei Jahren angehalten.'),
    a('Du bist die Erste, die da hinguckt, ohne wegzugucken.', 'zaertlich'),
    v('Ich guck nirgends mehr weg.', 'zaertlich'),
  ], { next: 'schluss' }),
  node('schluss', [
    n('Irgendwann landet ihr auf der Matratze, falls ihr da nicht schon seid. Die Stiefel sind das Problem. Deine Kampfstiefel haben achtzehn Ösen pro Seite, und Aria flucht über jede einzelne, bis du ihr hilfst, und dann fliegen sie, einer gegen das Rolltor, einer in die Kiste.'),
    n('Dein Top landet auf dem Gurtzeug. Ihr Shirt auf dem Schläger, falls es da nicht schon liegt. Keine von euch guckt, wo was landet.'),
    n('Ihr Atem. Deiner. Ihr Herz unter deiner Hand, deins unter ihrer. Die Metallhand liegt still neben deinem Kopf, die Finger halb offen, und du verschränkst deine schwarzen mit ihren silbernen. Metall in Metall. Wie über der Lücke.'),
    a('Okay?', 'zaertlich'),
    v('Okay. Du?', 'zaertlich'),
    a('So okay war ich noch nie. Mach das Licht aus, bevor ich was Kitschiges sag.', 'verlegen'),
    n('Du greifst nach der Kette der Glühbirne.'),
    v('Wenn du erzählst, dass ich „bitte“ gesagt hab, bist du tot.', 'signatur'),
    a('Du hast noch gar nicht – oh.', 'verlegen'),
    a('Und wenn du erzählst, dass ich gekichert hab …', 'verlegen'),
    n('Klick.'),
  ], { effects: [set('aria_nacht'), set('vexaria_nacht'), set('vexaria_nacht_woche'), { cutscene: 'rom-vexaria-licht' }] }),
]);

// ---------------------------------------------------------------------------
// Station 11 · rom-vexaria-morgen · „Bin gleich zurück. Echt jetzt.“

const MORGEN_ENDE: Effect[] = [
  { markSeen: 'rom-vexaria-morgen' }, ...ZWEI_TAGE, set('vexaria_fruehstueck'),
];
const ZUM_FRUEHSTUECK: Effect = { travel: 'high-voltage', entry: 'von-neon-gasse' };

const morgen: DialogueDef = dlg('rom-vexaria-morgen', [
  node('start', [
    n('05:40. Du wachst auf, wie immer. Vor dem Wecker, vor dem Licht, vor allen anderen.'),
    n('Aria schläft noch. Quer über die Matratze, die Decke halb auf dem Boden. Ihre Metallhand hängt über die Mattenkante, die Zöpfe sind beide offen, ein einziges Chaos aus Locken auf deinem Kissen. Sie trägt dein Top. Du weißt nicht mehr genau, wann das passiert ist. Irgendwann gegen drei. Glaubst du.'),
    n('An ihrem Hals, knapp unter dem Ohr, da, wo sonst der Zopf drüberhängt: ein dunkler Fleck. Ziemlich groß. Ziemlich eindeutig. Vega wird ihn sehen. Vega sieht alles.'),
    n('Auf ihrem echten Unterarm ein feiner roter Kratzer, vom Handgelenk bis fast zum Ellbogen. Die gerissene Schnalle, irgendwann in der Nacht. Die Schnalle selbst liegt immer noch unter der Kiste. Du siehst sie glänzen.'),
    n('Paketausgabe ist um sieben. Ich bin immer um sieben da. Ich war immer weg, bevor einer aufwacht.'),
    n('Sie atmet wie ein Kompressor. Ich will nicht, dass das aufhört.'),
    n('Ihr Arm liegt auf meinem. Klackt, wenn sie atmet. Zwei Kühlschränke auf einer Matte.'),
    n('Dein Reflex: aufstehen. Ihr Bandshirt, weil deins ja an ihr hängt. Gurtzeug drüber, zehn Schnallen, eine fehlt, der Brustriemen hängt schief. Dein Hals pocht an einer Stelle, an die du lieber nicht denkst. Du bist an der Tür, bevor du nachgedacht hast. Am Gürtel rauscht der Funk.'),
    n(KAS_FUNK),
  ], {
    choices: [
      ch('Gehen. Wie immer.', 'gehen'),
      ch('Kaffee holen. Und zurückkommen.', 'kaffee'),
      ch('Liegen bleiben.', 'liegen'),
    ],
  }),
  node('gehen', [
    n('Du reißt eine Ecke von einem Paketschein ab und schreibst mit dem Edding, den du hinterm Ohr trägst:'),
    n('„Paketausgabe. – V.“'),
    n('Du legst ihn auf die Kiste. Dann gehst du. Das Rolltor quietscht. Aria grunzt im Schlaf, tastet nach der leeren Stelle neben sich und dreht sich um.'),
    n('Paketausgabe. Kurier Zwölf guckt dir bei der Übergabe auf den Hals. Dann auf das Bandshirt mit dem roten Stern. Dann wieder auf den Hals. Er sagt nichts. Er sagt so laut nichts, dass es wehtut.'),
    n('Drei Lieferungen, zwei Dächer, eine Treppe. Du arbeitest wie immer. Du denkst an nichts. Du denkst die ganze Zeit an was.'),
  ], { effects: [set('vexaria_morgen_gegangen'), herz(10), { advanceTime: 180 }, ...MORGEN_ENDE, ZUM_FRUEHSTUECK] }),
  node('kaffee', [
    n('Du schreibst auf die Ecke eines Paketscheins:'),
    n('„Bin Kaffee holen. Bin gleich zurück. Echt jetzt. – V.“'),
    n('Du unterstreichst „Echt jetzt“. Zweimal. Dann gehst du.'),
    n('Kiosk Volt-Eck. Die Jalousie ist halb oben. Oma Volt sortiert Kaugummis nach Farben.'),
    s('oma-volt', 'Einen Schwarzen, wie immer, Kindchen?', 'neutral'),
    v('Zwei.'),
    s('oma-volt', 'Zwei? DU kaufst zwei?', 'ueberrascht'),
    n('Ihr Blick wandert über das fremde Bandshirt, bleibt an deinem Hals hängen und wird sehr, sehr zufrieden.'),
    s('oma-volt', 'Ich hab dir die letzten drei Jahre jeden Morgen einen verkauft. Einen. Ich dachte schon, du hättest nur einen Mund.', 'freude'),
    s('oma-volt', 'Und den Fleck da, den deckst du ab. Oder nicht. Steht dir.', 'freude'),
    v('Zwei. Und halt die Klappe.', 'verlegen'),
    s('oma-volt', 'Geht aufs Haus. Den zweiten. Den ersten zahlst du, ich bin ja nicht verrückt.', 'freude'),
  ], { effects: [{ credits: -4 }, { cutscene: 'rom-vexaria-morgen' }] }),
  node('liegen', [
    n('Du bleibst an der Tür stehen. Die Hand am Rolltor. Der Funk rauscht. Kas sagt seinen Satz.'),
    n('Du drehst am Funk. Leiser. Aus, glaubst du. Dann legst du dich wieder hin, mit Gurtzeug, mit Stiefeln, und schaust an die Decke. Wellblech. Ein Rostfleck, der aussieht wie die Stadt.'),
    n('Eine Stunde. Vielleicht zwei. Irgendwann bewegt sich die Metallhand auf deinem Bauch.'),
    a('Du bist ja noch da.', 'ueberrascht'),
    n('Sie stemmt sich auf den Ellbogen. Die Locken ein einziges Chaos, Abdrücke vom Kissen auf der Wange, dein Top schief über der Schulter.'),
    a('Du bist ja NOCH DA.', 'zaertlich'),
    a('Mit Gurtzeug. Und Stiefeln. Im Bett. Du bist so ein Psycho. Komm her.', 'freude'),
  ], {
    choices: [
      ch('Ein Guten-Morgen-Kuss. Einer. Nur einer.', 'liegen-kuss', { effects: [herz(10)] }),
      ch('„Du schnarchst wie \'n Kompressor.“', 'liegen-necken', { effects: [herz(10)] }),
      ch('Den Kratzer an ihrem Arm küssen.', 'liegen-kratzer', { effects: [herz(10)] }),
    ],
  }),
  node('liegen-kuss', [
    n('Einer. Du küsst sie. Ihr Mund ist warm und verschlafen und schmeckt nach nichts, nach Morgen. Sie seufzt und hält dich am Brustriemen fest, als du dich zurückziehen willst.'),
    a('Das war einer. Ich hab gezählt. Jetzt der zweite.', 'verlegen'),
    n('Der zweite. Der dritte. Beim vierten liegt sie halb auf dir, die Locken fallen dir ins Gesicht wie ein Vorhang, und du hörst auf zu zählen. Ihre Finger schieben sich unter den Brustriemen, auf ihr eigenes Shirt an dir, genau über dein Herz, und bleiben da.'),
    a('Klopft ja schon wieder.', 'signatur'),
    v('Tut\'s meistens. Wenn du da bist.', 'verlegen'),
  ], { next: 'liegen-nochmal' }),
  node('liegen-necken', [
    a('ICH schnarch?', 'wut'),
    a('Du hast um vier geredet. Im Schlaf. „Links, links, Paket links.“ Du hast mich ausgeliefert, Vex. Im Schlaf.', 'freude'),
    v('Und wer hat wen bis vier wachgehalten?', 'signatur'),
    a('… Du mich. Ich dich. Wir uns. Halt die Klappe.', 'verlegen'),
    n('Sie zieht sich die Decke über den Kopf. Darunter kichert sie. Du ziehst die Decke weg, und sie zieht dich drunter, und unter der Decke ist es warm und dunkel und riecht nach ihr, und ihre Nase stupst gegen deine.'),
    a('Hier drunter gibt\'s keinen Funk. Keine Paketausgabe. Hier drunter gibt\'s nur mich.', 'zaertlich'),
  ], { next: 'liegen-nochmal' }),
  node('liegen-kratzer', [
    n('Du nimmst ihren echten Arm. Der rote Kratzer zieht sich vom Handgelenk fast bis zum Ellbogen. Du küsst ihn. Vom Handgelenk aufwärts. Langsam. Sie bekommt Gänsehaut, und sie tut nicht mal so, als wär\'s die Kälte.'),
    a('Das war die Schnalle. Kas\' Schnalle hat sich gewehrt.', 'verlegen'),
    v('Kas hat sich immer gewehrt.', 'zaertlich'),
    a('Du hast auch was abgekriegt. Hier.', 'zaertlich'),
    n('Ihre Finger an deinem Hals. Die Stelle, die pocht. Sie drückt nicht drauf. Sie legt nur die Fingerspitzen hin und grinst. Ein bisschen stolz. Ziemlich stolz.'),
    v('Du hast mich markiert.', 'signatur'),
    a('Wie \'n Paket. „Gehört Aria. Nicht knicken.“', 'freude'),
  ], { next: 'liegen-nochmal' }),
  node('liegen-nochmal', [
    n('Ihre echte Hand liegt auf deinem Bauch. Sie malt Kreise, und die Kreise werden größer, und dann hält sie inne und sieht dich an. Von unten. Mit diesem Blick.'),
    a('… Nochmal?', 'verlegen'),
    v('Nochmal.', 'verlegen'),
    n('Sie greift nach der ersten Schnalle. Du nach ihrer Hüfte. Und dann knackt es. Laut. Direkt unter ihrem Ellbogen.'),
    n('Der Funk. Du hast ihn nicht ausgeschaltet. Du hast ihn auf Kanal 4 gedreht. Und Aria liegt mit dem Ellbogen auf der Sprechtaste. Seit einer Weile.'),
    n('KANAL 4 · Kurier Zwölf: „… äh. Chefin? Wir hören euch. Schon länger. Die Morgenlieferung übernehm ich. Bitte, BITTE lass die Taste los.“'),
    n('KANAL 4 · Kurier Sieben-Neun: „Nochmal, sagt sie. NOCHMAL.“'),
    a('SCHEISSE.', 'ueberrascht'),
    n('Aria pfeffert den Funk ans andere Ende der Bude. Er knallt gegen das Rolltor. Dann lacht sie, so sehr, dass sie von der Matratze rutscht, und du lachst mit, mit Gurtzeug, mit Stiefeln, bis dir der Bauch wehtut.'),
    v('Hab mich krankgemeldet. Bei mir selbst. Chefin war verständnisvoll.', 'signatur'),
    a('Chefin hat grad ganz Kanal 4 ins Bett geholt.', 'freude'),
    a('Hab deine Nudeln gegessen. Gestern. Und dich geklaut. Nicht sorry. Und jetzt Frühstück, bevor ich auf dumme Ideen komm. Hunter macht Rührei. Hunter macht NIE Rührei. Ich wette, Vega hat ihn angerufen.', 'freude'),
    n('Die Morgenlieferung geht ohne dich raus. Kurier Zwölf flucht auf Kanal 4 darüber, sehr ausführlich und sehr kreativ. Es ist dir egal. Es ist dir zum ersten Mal komplett egal.'),
  ], { effects: [set('vexaria_morgen_geblieben'), BESCHWINGT, herz(40), { advanceTime: 120 }, ...MORGEN_ENDE, ZUM_FRUEHSTUECK] }),
]);

const morgenZurueck: DialogueDef = dlg('rom-vexaria-morgen-zurueck', [
  node('start', [
    n('Aria sitzt auf der Matratze, die Decke um die Schultern, darunter dein Top, und hält den Zettel hoch wie eine Trophäe.'),
    a('„Echt jetzt.“ Du hast „echt jetzt“ geschrieben. Ich lass den rahmen.', 'freude'),
    a('Und du hast UNTERSTRICHEN. Zweimal. Vex. Du hast unterstrichen.', 'zaertlich'),
    v('Kaffee wird kalt.', 'verlegen'),
    a('Warte. Komm mal her. Ins Licht.', 'signatur'),
    n('Sie zieht dich am Brustriemen runter, legt den Kopf schief und betrachtet deinen Hals wie ein Kunstwerk. Dann grinst sie. Breit. Unverschämt.'),
    a('Oma Volt hat das gesehen, oder? Sag mir, dass Oma Volt das gesehen hat.', 'freude'),
    v('Sie hat gesagt, steht mir.', 'verlegen'),
    a('Steht dir. Ich hab Talent.', 'signatur'),
    v('Du hast auch einen. Größer.', 'signatur'),
    a('WAS?', 'ueberrascht'),
    n('Sie greift sich an den Hals, findet die Stelle und wird rot bis in die offenen Locken.'),
  ], {
    choices: [
      ch('Die Becher abstellen. Zu ihr unter die Decke.', 'decke', { effects: [herz(10)] }),
      ch('Ihr einen Becher in die Metallhand drücken. „Trink. Wir haben zwanzig Minuten.“', 'becher', { effects: [herz(10)] }),
    ],
  }),
  node('decke', [
    n('Du stellst die Becher auf die Kiste, neben das Gurtzeug, und kriechst zu ihr unter die Decke. Mit Stiefeln. Sie beschwert sich nicht. Sie zieht die Decke über euch beide und küsst dich, langsam und verschlafen, die echte Hand an deiner Wange, die Daumenkuppe an deinem Mundwinkel.'),
    n('Der Kaffee dampft auf der Kiste. Dann dampft er nicht mehr.'),
    a('… Nochmal?', 'verlegen'),
  ], { next: 'uhr' }),
  node('becher', [
    n('Sie nimmt den Becher mit der Metallhand, vorsichtig, als könnte die Pappe unter dem Silber explodieren. Tut sie nicht. Sie trinkt, verzieht das Gesicht, trinkt weiter.'),
    a('Zwanzig Minuten. Weißt du, was ich mit zwanzig Minuten alles anstellen kann?', 'verlegen'),
    v('Kaffee trinken.', 'signatur'),
    n('Sie stellt den Becher weg und zieht dich mit der echten Hand an der fehlenden Schnalle zu sich runter. Der Kaffee wird kalt.'),
    a('… Nochmal?', 'verlegen'),
  ], { next: 'uhr' }),
  node('uhr', [
    v('… Nochmal.', 'verlegen'),
    n('Dann piept der Wecker. Deiner. 06:45. Du stellst ihn seit zwei Jahren auf 06:45, und er hat dich nie geweckt, weil du immer vorher wach warst. Heute klingt er wie eine Sirene.'),
    a('Nein. Nein, nein, nein. Paketausgabe?', 'wut'),
    v('Paketausgabe.', 'trauer'),
    a('Die Pakete haben Zeit. Die Pakete sind PAKETE, Vex.', 'wut'),
    n('Dann summt ihr Handy. Hunter: „Frühstück. Beide. Ich weiß Bescheid. Ganz Nexus weiß Bescheid.“'),
    a('Woher WEISS der das?', 'ueberrascht'),
    v('Vega.'),
    a('Vega.', 'wut'),
    n('Sie lässt sich rückwärts auf die Matratze fallen und zieht sich die Decke übers Gesicht. Darunter lacht sie.'),
    a('Bald. Und dann stellst du den Scheißwecker ab. Für immer.', 'verlegen'),
  ], { effects: [set('vexaria_morgen_zurueck'), BESCHWINGT, herz(30), { advanceTime: 90 }, ...MORGEN_ENDE, ZUM_FRUEHSTUECK] }),
]);

const fruehstueck: DialogueDef = dlg('rom-vexaria-fruehstueck', [
  node('start', [
    n('Das High Voltage am Morgen. Stühle auf den Tischen, Kaffeemaschine röchelt. Aria sitzt am Tresen in deinem viel zu großen Pulli, dem grauen aus der Kiste, für kalte Nächte auf dem Dach. Die Ärmel über den Händen, nur die Silberfinger schauen raus. Den Kragen hat sie bis zum Kinn hochgezogen. Hilft nichts.'),
    n('Du trägst das Gurtzeug über ihrem schwarzen Bandshirt. Mit dem roten Stern. Es ist dir zu weit an den Schultern. Es riecht nach ihr. Zehn Schnallen. Der Brustriemen hängt schief, und jeder, der hinguckt, weiß, warum.'),
    a('Was? Der ist warm. Und er riecht nach dir. Das Zweite ist Zufall.', 'verlegen'),
    v('Gib den zurück.', 'signatur'),
    a('Hol ihn dir.', 'signatur'),
    v('Nicht vor Hunter.'),
    s('hunter', 'Danke.', 'neutral'),
    n('An Arias Gürtel, neben der runden Silberschnalle, baumelt eine zweite. Kleiner, schwarz, mit einem abgerissenen Stück Leder dran. Deine. Kas\'. Sie hat sie unter der Kiste rausgefischt.'),
    a('Kriegsbeute. Die erste Schnalle, die ich je geknackt hab, ohne dass einer die Bullen ruft.', 'signatur'),
    v('War nicht komplett scheiße.', 'zaertlich'),
    a('Das ist das Romantischste, was du je gesagt hast. Ich lass es mir tätowieren. Auf den Metallarm, da hält\'s länger.', 'freude'),
  ], {
    choices: [
      ch('„Behalt ihn.“', 'behalten'),
      ch('Pulli zurückholen.', 'zurueck'),
    ],
  }),
  node('behalten', [
    a('Dann behältst du mein Shirt. Fair ist fair. Wasch\'s nicht. Doch, wasch\'s.', 'freude'),
  ], { effects: [set('vexaria_pulli')], next: 'crew' }),
  node('zurueck', [
    n('Du greifst nach dem Ärmel. Sie duckt sich weg, so schnell, dass sie fast vom Hocker fällt. Der Kragen rutscht runter. Für eine Sekunde sieht das ganze High Voltage ihren Hals.'),
    a('Später. Mit Rolltor.', 'signatur'),
  ], { next: 'crew' }),
  node('crew', [
    s('hunter', 'Keine Turteleien an meinem Tresen. Und kein Pulli-Tausch. Ich verlier den Überblick, wer wer ist.', 'neutral'),
    s('hunter', 'Zwei von meinen Leuten. Ich hätte Regeln machen sollen. … Ich hätte mich nicht dran gehalten. Weitermachen.', 'freude'),
    n('Ripper schiebt sich vom Ecktisch hoch und kommt rüber, die Kaffeetasse in der Hand, die er nie bezahlt.'),
    s('ripper', 'Na, ihr zwei. Sind alle Implantate noch dran?', 'signatur'),
    a('Alle. Eine Schnalle fehlt.', 'freude'),
    s('ripper', 'Und meiner, Schätzchen? Der ist noch nicht abbezahlt. Pfleg ihn.', 'signatur'),
    v('Montag.', 'signatur'),
    s('dante', 'Heiliges Kanonenrohr, ich hab\'s GEWUSST! Seit dem Müllsack! Ich WAR der Müllsack!', 'freude'),
    s('vega', 'Kurierbude. Rolltor, Wellblech, drei Millimeter. Die Lötgassen haben alles gehört. Ich meine: alles.', 'neutral'),
    s('vega', 'Und Kanal 4 ist noch dünner.', 'signatur'),
    s('dante', 'Also. Unter Freunden. Ganz ehrlich. Wer hat wen wachgehalten?', 'signatur'),
    n('Aria zeigt auf dich. Du zeigst auf Aria. Gleichzeitig. Auf den Zentimeter.'),
    s('dante', 'Unentschieden!', 'freude'),
    a('Unentschieden zählt nicht.', 'verlegen'),
  ], {
    choices: [
      ch('„Sie. Eindeutig sie.“', 'sie', { effects: [herz(10)] }),
      ch('Sie über den Tresen hinweg küssen. Vor allen.', 'tresen', { effects: [herz(20)] }),
      ch('Kein Kommentar. Kaffee trinken.', 'still', { effects: [herz(5)] }),
    ],
  }),
  node('sie', [
    v('Sie. Eindeutig sie. Um drei hat sie angefangen, Kabelbrand zu singen.', 'signatur'),
    a('DAS WAR UM VIER. Und du hast mitgesungen!', 'wut'),
    s('vega', 'Falsch. Beide. Die Lötgassen haben es bestätigt.', 'neutral'),
  ], { next: 'ende' }),
  node('tresen', [
    n('Du lehnst dich über den Tresen und küsst sie. Vor Hunter. Vor Ripper. Vor Dante, der ein Geräusch macht wie ein Wasserkessel. Kurz. Nicht so kurz. Ihre Silberfinger krallen sich in deinen Brustriemen, genau in die Lücke, wo die Schnalle fehlt.'),
    s('hunter', 'TRESEN. Mein TRESEN.', 'wut'),
    a('… Okay. Okay, hab\'s kapiert. Du hast mich wachgehalten. Ich geb auf.', 'verlegen'),
  ], { next: 'ende' }),
  node('still', [
    n('Du sagst nichts. Du trinkst deinen Kaffee. Schwarz, wie immer. Aria trinkt ihren. Unter dem Tresen findet ihr Fuß deinen Stiefel und bleibt da.'),
    s('ripper', 'Diskret. Gefällt mir. Diskretion ist gut fürs Geschäft.', 'signatur'),
    s('dante', 'Ihr Hals ist nicht diskret, Doc.', 'freude'),
  ], { next: 'ende' }),
  node('ende', [
    n('Aria vergräbt das Gesicht in deinem Pulli-Ärmel. Du siehst trotzdem, dass sie grinst.'),
  ], { effects: [set('vexaria_fruehstueck', false), { relation: 'hunter', delta: 10 }] }),
]);

// ---------------------------------------------------------------------------
// Wiederholung der Nacht (Tagesgespräch, höchstens einmal pro Woche). Nach Station 11 wählt Vex die Art der Nacht:
// wild / zärtlich / albern, je eigene Abblende und eigener Morgen. `vexaria-nacht-kurz` (Akt 2, Dachgespräch) wechselt
// die Variante nach Kalendertag, `vexaria-morgen-kurz` ebenso.

const nachtWieder: DialogueDef = dlg('vexaria-nacht-wieder', [
  node('start', [
    a('Bude oder Quartier? … Bring keine Nudeln. Doch. Bring Nudeln.', 'verlegen'),
  ], {
    choices: [
      ch('„Bleiben.“', undefined, { when: not(seen('rom-vexaria-morgen')), effects: [{ dialogue: 'rom-vexaria-licht-bude' }] }),
      ch('„Bleiben.“', 'wie', { when: seen('rom-vexaria-morgen') }),
      ch('„Ein andermal.“', 'andermal'),
    ],
  }),
  node('wie', [
    n('Sie steht schon ziemlich nah. Dann noch näher. Ihre Zerberster-Finger haken sich in deinen Brustriemen, in die Lücke, wo die Schnalle fehlt. Da hängen sie inzwischen immer.'),
    a('Und? Wie willst du mich heute, Rennsemmel?', 'signatur'),
  ], {
    choices: [
      ch('„Schnell. Rolltor runter, bevor ich\'s mir anders überleg.“', 'wild'),
      ch('„Langsam. Ganz langsam. Wir haben die ganze Nacht.“', 'zart'),
      ch('„Erst Nudeln. Dann sehen wir weiter.“', 'albern'),
    ],
  }),
  node('wild', [
    n('Ihr rennt. Natürlich rennt ihr. Über die Dächer diesmal, die Feuerleiter runter, sie zuerst, du hinterher, und am Rolltor bist du schneller, weil du den Schlüssel schon in der Hand hast.'),
    n('Das Tor ist noch nicht ganz unten, da hat sie dich schon dagegen gedrückt. Das Wellblech kracht. Sie küsst dich, als hätte sie dich eine Woche nicht gesehen, dabei war es heute Mittag. Ihre Zähne an deinem Ohrläppchen. Ihr Atem an deinem Hals, schnell und heiß.'),
    a('Schnallen. Jetzt. Ich hab heute keine Geduld.', 'verlegen'),
    v('Hattest du nie.', 'signatur'),
    n('Du drehst den Spieß um. Ihr Rücken am Tor, deine Hand in ihren Locken, und sie lacht dir atemlos in den Mund. Ihre Metallhand liegt flach am Wellblech, und du siehst, wie die Finger sich ins Blech drücken. Dellen, eine nach der anderen. Dich fasst sie an wie Glas.'),
    a('Ich zahl die Dellen. Ich zahl alle Dellen. Mach weiter.', 'verlegen'),
    n('Klick, klick, klick. Das Gurtzeug fällt. Ihr Shirt fällt. Irgendwer tritt die Kiste um.'),
  ], { effects: [set('vexaria_nacht_woche'), { cutscene: 'vexaria-nacht-wild' }] }),
  node('zart', [
    n('Ihr geht. Ganz normal, unten durch die Gasse, ihre Hand in deiner, und keine von euch hat es eilig. In der Bude zündest du die Kerze an, die Dante dir mal angedreht hat, „für Atmosphäre“. Sie riecht nach Motoröl. Aria findet das perfekt.'),
    n('Ihr sitzt auf der Matratze. Sie lehnt mit dem Rücken an dir, zwischen deinen Knien, und du löst ihre Zöpfe. Gummi für Gummi. Strähne für Strähne. Flechten kannst du inzwischen. Lösen kannst du besser.'),
    a('Wenn du das jeden Abend machst, schneid ich sie nie ab.', 'zaertlich'),
    n('Du küsst ihren Nacken. Da, wo sie empfindlich ist. Dann die Naht an der Schulter, die sie vor dir nicht mehr versteckt. Sie lehnt den Kopf an deine Schulter und atmet aus, lang, und ihre Silberfinger tasten nach deiner Metallhand und verhaken sich mit ihr.'),
    a('Sag was. Irgendwas.', 'zaertlich'),
    v('Du bist das Einzige, wofür ich anhalt.', 'zaertlich'),
    a('… Scheiße. Okay. Kerze aus. Sofort. Bevor ich heul.', 'verlegen'),
  ], { effects: [set('vexaria_nacht_woche'), { cutscene: 'vexaria-nacht-zart' }] }),
  node('albern', [
    n('Nudeln. Aus dem Automaten am Kanal, zwei Becher, Schärfegrad „Bitte unterschreiben Sie hier“. Ihr esst sie auf der Matratze, das Rolltor halb offen, und Aria erzählt die Geschichte mit dem Hund. Zum vierten Mal. Er ist inzwischen ein Wolf.'),
    a('Du hast Soße am Kinn.', 'freude'),
    v('Wo?'),
    a('Da. Nein. Da. Warte.', 'signatur'),
    n('Sie küsst sie weg. Dann eine Stelle, an der keine Soße war. Dann die nächste. Du lachst mit vollem Mund, verschluckst dich, sie haut dir mit der echten Hand auf den Rücken und mit der silbernen aus Versehen gegen die Glühbirne, die wild an der Kette schaukelt.'),
    a('Ups. Schnalle Nummer eins, ich komme!', 'freude'),
    n('Sie stürzt sich auf das Gurtzeug wie auf eine Piñata. Sie verheddert sich. In deinen Riemen. Mit dem Zerberster. Ihr kippt beide von der Matratze, sie oben, du unten, ein Knäuel aus Leder, Silber und Gelächter.'),
    v('Du steckst fest.', 'freude'),
    a('Ich steck nicht fest. Ich hab dich gefangen. Das ist ein Unterschied.', 'verlegen'),
    n('Du befreist sie. Schnalle für Schnalle, Kuss für Kuss. Ihr lacht so laut, dass nebenan jemand gegen die Wand hämmert. Aria hämmert zurück. Mit dem Zerberster. Die Wand gewinnt knapp.'),
  ], { effects: [set('vexaria_nacht_woche'), { cutscene: 'vexaria-nacht-albern' }] }),
  node('andermal', [a('Gut. Ich zähl die Schnallen trotzdem. In Gedanken. Elf. Zehn. Neun …', 'signatur')]),
]);

const MORGEN_KURZ_ENDE: Effect[] = [BESCHWINGT, herz(10)];

const morgenWild: DialogueDef = dlg('vexaria-morgen-wild', [
  node('start', [
    n('05:40. Das Rolltor hat drei neue Dellen, alle auf Hüfthöhe, alle in Form von vier Fingern. Das Gurtzeug hängt am Lüftungsrohr. Wie es da hingekommen ist, weißt du nicht mehr.'),
    n('Aria schläft auf dem Bauch, quer, ein Bein über deinem. Auf ihrer Schulter, da, wo das Silber anfängt, ein roter Abdruck. Deine Zähne. Ups.'),
    a('… Ich zahl die Dellen. Hab ich gesagt. Ich zahl in Raten. Bei dir.', 'verlegen'),
    v('Ripper wär stolz.', 'signatur'),
    a('Sag nie wieder Ripper im Bett. Nie wieder. Komm her.', 'wut'),
  ], { effects: MORGEN_KURZ_ENDE }),
]);

const morgenZart: DialogueDef = dlg('vexaria-morgen-zart', [
  node('start', [
    n('05:40. Die Kerze ist runtergebrannt bis auf einen Fleck Wachs auf der Kiste. Aria schläft mit dem Kopf auf deiner Schulter, die offenen Locken überall. Eine Strähne ist schief geflochten. Du hast im Halbschlaf damit angefangen.'),
    a('… Du flechtest mich im Schlaf? Das ist das Gruseligste und Süßeste, was mir je passiert ist.', 'zaertlich'),
    v('Bleib liegen. Fünf Minuten.', 'zaertlich'),
    a('Zehn. Und du flechtest weiter.', 'zaertlich'),
  ], { effects: MORGEN_KURZ_ENDE }),
]);

const morgenAlbern: DialogueDef = dlg('vexaria-morgen-albern', [
  node('start', [
    n('05:40. Ein Nudelbecher klebt am Rolltor. Keine Ahnung, wie. Aria schläft quer, einen Arm im Gurtzeug verheddert, das sie in der Nacht offenbar als Kissen benutzt hat. Nebenan hämmert schon wieder jemand gegen die Wand. Oder immer noch.'),
    a('… Ich hab geträumt, der Hund war ein Wolf.', 'freude'),
    v('Der Hund IST ein Wolf. Seit gestern.', 'signatur'),
    a('Siehst du. Du hörst mir zu. Ich behalt dich.', 'zaertlich'),
  ], { effects: MORGEN_KURZ_ENDE }),
]);

/** Morgen nach `vexaria-nacht-kurz` (Akt 2) und der Stirn-Nacht (akt3.ts); drei Fassungen nach Kalendertag. */
const morgenKurz: DialogueDef = dlg('vexaria-morgen-kurz', [
  node('start', [
    n('05:40. Kronkorken an der Tür, zwei Becher auf der Kiste, eine Brecherin quer über der Matratze. Sie schnarcht.'),
  ], {
    choices: [
      ch('Liegen bleiben. Fünf Minuten.', 'zart', { when: { cycleDay: poolDays(0, 3) } }),
      ch('Liegen bleiben. Fünf Minuten.', 'necken', { when: { cycleDay: poolDays(1, 3) } }),
      ch('Liegen bleiben. Fünf Minuten.', 'albern', { when: { cycleDay: poolDays(2, 3) } }),
    ],
  }),
  node('zart', [
    n('Du bleibst noch fünf Minuten liegen. Dann zehn. Ihr Atem an deinem Hals, die Metallhand schwer auf deiner Hüfte. Sie hat dich im Schlaf festgehalten. Vorsichtig. Die ganze Nacht.'),
    a('… Du bist ja noch da. Gut. Bleib. Fünf Minuten. Zehn.', 'zaertlich'),
  ], { effects: MORGEN_KURZ_ENDE }),
  node('necken', [
    n('Nach fünf Minuten willst du aufstehen. Ihre echte Hand packt dich am Handgelenk, ohne dass sie die Augen aufmacht.'),
    a('Wenn du jetzt gehst, erzähl ich Vega, was du um drei gesagt hast.', 'signatur'),
    v('Ich hab um drei nichts gesagt.', 'verlegen'),
    a('Doch. Zweimal. Und dann nochmal lauter. Leg dich hin.', 'freude'),
  ], { effects: MORGEN_KURZ_ENDE }),
  node('albern', [
    n('Dein Top hängt an der Kette der Glühbirne. Ihr Shirt am Lüftungsrohr. Eine Socke von dir liegt im Nudelbecher. Du hast keine Erklärung. Du willst auch keine.'),
    a('… Guck nicht so. Die Socke war schon da.', 'verlegen'),
    v('Die Socke war nie da.', 'signatur'),
    a('Dann komm her und beweis es.', 'zaertlich'),
  ], { effects: MORGEN_KURZ_ENDE }),
]);

// ---------------------------------------------------------------------------
// Cutscenes

const cutscenes: CutsceneDef[] = [
  cut('rom-vexaria-sprung', 'Über die Lücke', [
    { image: 'cut-rom-vexaria-sprung', pan: 'right', fade: 'in', hold: 1600, caption: 'Zwei.' },
    {
      image: 'cut-rom-vexaria-sprung', pan: 'in',
      lines: [
        n('Ihr springt. Neun Stockwerke unter euch, viereinhalb Meter vor euch, Metall in Metall. Für einen Moment ist da nichts. Kein Dach, kein Kas, kein Knacken. Nur ihre Hand.'),
        n('Ihr landet. Du fällst auf die Knie, aufs warme Blech, und dann lachst du. Laut. Zum ersten Mal seit zwei Jahren lachst du laut, und du kannst nicht aufhören.'),
        a('Siehst du? SIEHST DU? Du Rennsemmel! Wir sind drüben!', 'freude'),
        v('Hey, Kas.', 'trauer'),
      ],
    },
  ], [{ dialogue: 'rom-vexaria-kuss-mauer' }]),
  cut('rom-vexaria-sprung-fs', 'Über die Lücke', [
    { image: 'cut-rom-vexaria-sprung', pan: 'right', fade: 'in', hold: 1600, caption: 'Zwei.' },
    {
      image: 'cut-rom-vexaria-sprung', pan: 'in',
      lines: [
        n('Ihr springt. Metall in Metall. Ihr landet. Du fällst auf die Knie und lachst. Laut. Du kannst nicht aufhören.'),
        a('Wir sind DRÜBEN, du Idiotin! Hör auf zu lachen, du machst mir Angst!', 'freude'),
        v('Hey, Kas.', 'trauer'),
      ],
    },
  ], [{ dialogue: 'rom-vexaria-kuss-mauer-fs' }]),
  cut('rom-vexaria-kuss', 'Wind', [
    { image: 'cut-rom-vexaria-kuss', pan: 'out', fade: 'cross', hold: 3200, caption: 'Kein Ton. Nur Wind und Möwen.' },
  ], [{ dialogue: 'rom-vexaria-kuss-nachher' }]),
  // Abblende Station 10 → Schlafen → Station 11.
  cut('rom-vexaria-licht', 'Elf Schnallen', [
    { image: 'black', fade: 'out', hold: 1800, caption: 'Regen auf dem Wellblech.' },
    { image: 'black', lines: [n('Irgendwo im Dunkeln fällt ein Schläger um. Dumpf. Keine von euch hebt ihn auf.')], hold: 1600 },
    { image: 'black', lines: [n('Viel später. Jemand kichert. Jemand flüstert: „Psst. Die Lötgassen.“ Jemand flüstert zurück: „Scheiß auf die Lötgassen.“')], hold: 1600 },
    { image: 'black', caption: 'Die Glühbirne bleibt aus bis zum Morgen.', hold: 1400 },
  ], [{ sleep: true }, { dialogue: 'rom-vexaria-morgen' }], false),
  cut('rom-vexaria-morgen', 'Bin gleich zurück', [
    { image: 'cut-rom-vexaria-morgen', pan: 'in', fade: 'in', hold: 2600, caption: 'Zwei Becher. Ein Zettel. Echt jetzt.' },
  ], [{ dialogue: 'rom-vexaria-morgen-zurueck' }]),
  // Kurze Abblende (Akt 2, Dachgespräch „Bude“): Fassung nach Kalendertag – wild, zärtlich, albern.
  cut('vexaria-nacht-kurz', 'Bude', [
    { when: { cycleDay: poolDays(0, 3) }, image: 'black', fade: 'out', hold: 1600, caption: 'Feuerleiter runter. Rolltor runter. Keine Geduld.' },
    { when: { cycleDay: poolDays(0, 3) }, image: 'black', lines: [n('Das Wellblech scheppert, als würde einer dagegen rennen. Zweimal. Ein Fluch, ein atemloses Lachen, eine Schnalle, die auf den Boden klirrt. Dann geht die Glühbirne aus.')], hold: 1400 },
    { when: { cycleDay: poolDays(1, 3) }, image: 'black', fade: 'out', hold: 1600, caption: 'Rolltor runter. Glühbirne aus.' },
    { when: { cycleDay: poolDays(1, 3) }, image: 'black', lines: [n('Regen auf dem Wellblech. Ein Zopf nach dem anderen geht auf. Keine von euch hat es eilig. Die Nacht ist lang, und sie gehört euch.')], hold: 1400 },
    { when: { cycleDay: poolDays(2, 3) }, image: 'black', fade: 'out', hold: 1600, caption: 'Rolltor runter. Glühbirne aus. Glühbirne wieder an.' },
    { when: { cycleDay: poolDays(2, 3) }, image: 'black', lines: [a('Wo ist die Scheißkette?', 'verlegen'), v('Du hängst dran.', 'freude'), a('… Oh.', 'verlegen'), n('Gekicher. Klick.')], hold: 1200 },
  ], [{ sleep: true }, { dialogue: 'vexaria-morgen-kurz' }], false),
  // Abblenden der Wiederholung „Bleiben“ (vexaria-nacht-wieder), je mit eigenem Morgen.
  cut('vexaria-nacht-wild', 'Bude', [
    { image: 'black', fade: 'out', hold: 1600, caption: 'Rolltor runter. Ganz runter. Gerade so.' },
    { image: 'black', lines: [n('Im Dunkeln kracht das Wellblech. Nochmal. Nebenan dreht jemand das Radio lauter. Es hilft nichts.')], hold: 1400 },
  ], [{ sleep: true }, { dialogue: 'vexaria-morgen-wild' }], false),
  cut('vexaria-nacht-zart', 'Bude', [
    { image: 'black', fade: 'out', hold: 1800, caption: 'Eine Kerze, die nach Motoröl riecht. Dann keine mehr.' },
    { image: 'black', lines: [n('Regen auf dem Wellblech. Irgendwann flüstert eine „Stern“. Irgendwann antwortet die andere.')], hold: 1600 },
  ], [{ sleep: true }, { dialogue: 'vexaria-morgen-zart' }], false),
  cut('vexaria-nacht-albern', 'Bude', [
    { image: 'black', fade: 'out', hold: 1400, caption: 'Glühbirne aus. Glühbirne an. Wer hat die Nudeln umgeworfen?' },
    { image: 'black', lines: [n('Gekicher im Dunkeln. Ein Fluch. Mehr Gekicher. Nebenan hämmert es gegen die Wand. Von dieser Seite hämmert es zurück.')], hold: 1400 },
  ], [{ sleep: true }, { dialogue: 'vexaria-morgen-albern' }], false),
];

// ---------------------------------------------------------------------------
// Telefon

const phone: PhoneMessageDef[] = [
  {
    id: 'aria-vex-abgehauen', from: 'aria', text: 'Du bist abgehauen.',
    auto: all(V, flag('vexaria_morgen_gegangen'), { time: 'tag' }),
    replies: [{ text: '…', effects: [{ phone: 'aria-vex-abgehauen-2' }] }],
  },
  {
    id: 'aria-vex-abgehauen-2', from: 'aria',
    text: 'Aber du hast \'n Zettel dagelassen. Das ist mehr als letztes Mal. Knapp.',
  },
];

// ---------------------------------------------------------------------------
// Herz-Ereignisse

export const HOEHEPUNKT_EVENTS: HeartEventDef[] = [
  ...twin({
    id: 'rom-vexaria-kuss', hearts: 8, map: 'neon-gasse', time: 'abend', when: KUSS_BASIS,
  }, KUSS_ROM, { dialogue: 'rom-vexaria-kuss' }, { dialogue: 'rom-vexaria-kuss-fs' }),
  {
    id: 'rom-vexaria-licht', hearts: 8, map: 'neon-gasse', time: ['abend', 'nacht'],
    when: all(V, R, flag('aria_kuss'), HEUTE_FREI, not(seen('rom-vexaria-licht'))),
    dialogue: 'rom-vexaria-licht',
    effects: [{ setFlag: 'aria_heute' }, { xp: 25 }],
  },
];

export const part: ContentPart = {
  dialogues: byId([
    kussStart('rom-vexaria-kuss', true), kussStart('rom-vexaria-kuss-fs', false), kussMauer, kussNachher, kussMauerFs,
    licht, lichtBude, morgen, morgenZurueck, fruehstueck, nachtWieder, morgenKurz, morgenWild, morgenZart, morgenAlbern,
  ]),
  cutscenes: byId(cutscenes),
  phone: byId(phone),
  mapAdditions: {
    'high-voltage': {
      onEnter: [{
        id: 'vexaria-fruehstueck', once: false, when: all(V, flag('vexaria_fruehstueck')),
        dialogue: 'rom-vexaria-fruehstueck',
      }],
    },
  },
};

