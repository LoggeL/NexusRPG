// Vex × Aria „Über die Lücke“, „Elf Schnallen“, „Bin gleich zurück. Echt jetzt.“ (world.md §4.7, Stationen 9–11).
//
// Station 9 ersetzt für Vex `rom-aria-kuss` und (Freundschaft) `he-aria-10`. Kanon: ♥10, pers-aria-zerberster erledigt,
// Akt 2. Akt-1-Weg (gaps/vexaria.md): ♥8, Station 8 gesehen und `aria_versoehnung_verdient` (Vordach-Schluss von Station 8).
// Station 10 und 11 zählen zusammen als eine Station: 10 endet mit Abblende und Schlafen, 11 läuft direkt beim Tagesstart.
import type { ContentPart } from '../../part';
import type { Condition, CutsceneDef, DialogueDef, Effect, HeartEventDef, PhoneMessageDef } from '../../../modules/contracts';
import {
  a, all, ANGEBAHNT, any, byId, ch, chk, cut, dlg, flag, herz, HEUTE_FREI, n, node, noFlag, not, R, s, seen, set,
  STATION_START, twin, V, v, ZWEI_TAGE, ZUSAMMEN,
} from './_util';

const BESCHWINGT: Effect = { checkBuff: { id: 'beschwingt-aria', label: 'Beschwingt', value: 1, attribute: 'ausstrahlung' } };
const KAS_FUNK = 'KANAL 9 · Kas, knisternd: „Schrapnell eins an alle: Nicht anhalten. Nicht umdrehen. Wir sehen uns im Ziel.“';

// ---------------------------------------------------------------------------
// Station 9 · rom-vexaria-kuss · „Über die Lücke“

// Kanon zusätzlich ♥10 und `{ quest: 'pers-aria-zerberster', state: 'done' }` (Akt 2); die Quest gibt es noch nicht,
// deshalb gilt vorerst der Akt-1-Weg für alle Akte (gaps/vexaria.md).
const KUSS_BASIS: Condition = all(
  V, HEUTE_FREI, seen('rom-vexaria-umdrehen'), flag('aria_versoehnung_verdient'), { hearts: 'aria', min: 8 },
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

/** Die Nacht in der Kurierbude; auch Wiederholung über das Tagesgespräch, solange Station 11 fehlt. */
const lichtBude: DialogueDef = dlg('rom-vexaria-licht-bude', [
  node('start', [
    n('Die Lötgassen. Ihr lauft nebeneinander, nicht über die Dächer, unten durch die Gasse, wie normale Leute. Aria redet die ganze Zeit. Über Kabelbrand, über Kiki, über einen Hund, den sie mal fast geklaut hätte. Ihre Hand stößt bei jedem Schritt an deine.'),
    n('Das Rolltor. Die Glühbirne an der Kette. Du schließt auf.'),
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
    n('Sie küsst sie. Die Narben, eine nach der anderen. Dann, ohne Witz, ohne Grinsen, auch die schwarzen Metallknöchel deiner rechten.'),
    v('Der spürt nix.', 'neutral'),
    a('Weiß ich. Ist trotzdem deiner.', 'zaertlich'),
    n('Du nimmst ihre Metallhand. Den Zerberster, kühl und schwer. Du legst ihn dir auf die Brust, über dem Top, aufs Herz.'),
    a('Ich spür nix. Nicht mal, ob\'s klopft.', 'trauer'),
    v('Es klopft. Ich spür\'s für zwei.', 'zaertlich'),
    a('Okay. Das war das Kitschigste, was du je gesagt hast, und ich bin komplett hinüber. Halt die Klappe und küss mich, Rennsemmel.', 'zaertlich'),
    n('Das Rolltor scheppert, als dein Rücken dagegen stößt. Aria küsst dich, als hätte sie seit der Gasse auf nichts anderes gewartet, die echte Hand unter deinem Gurtzeug flach auf deinem Rücken, die Metallfinger an den Riemen. Dein Herz hämmert gegen ihre Silberschale. Dann flucht sie gegen deinen Mund.'),
    a('Wie viele Schnallen hat das Scheißding?', 'wut'),
    v('Elf. Diebstahlsicher.', 'signatur'),
    a('Ich bin Brecherin.', 'signatur'),
    v('Dachte, das bist du nicht mehr.'),
    a('Heute Nacht bin ich, was ich will.', 'zaertlich'),
    n('Eine Schnalle reißt im Zerberster-Griff ab. Klirrt auf den Betonboden.'),
    a('Ups. Zehn.', 'verlegen'),
    n('Du lachst. Laut. Es hallt im Wellblech. Aria drückt das Gesicht in deinen Hals, ihr Atem heiß auf deiner Haut.'),
    a('Zieh das Ding aus. … Ich will wissen, wie du ohne die ganzen Riemen bist.', 'verlegen'),
  ], {
    choices: [
      ch('„Ich bin schneller.“', 'schneller', { check: chk('vexaria-licht-reflexe', 'reflexe', 6, ['flirt']), effects: [herz(20)] }),
      ch('„Lass. Ich guck dir gern beim Kämpfen zu.“', 'kaempfen', { effects: [herz(10)] }),
      ch('„Der Handschuh war der einfache Teil.“', 'handschuh-satz', { check: chk('vexaria-licht-strasse', 'strasse', 5, ['flirt']), effects: [herz(20)] }),
    ],
  }),
  node('schneller', [
    n('Zehn Schnallen. Zwei Sekunden. Klick klick klick, deine Finger kennen jede einzelne im Dunkeln. Das Gurtzeug rutscht dir von den Schultern und fällt mit einem dumpfen Klatschen auf den Boden. Das Gurtzeug liegt nie auf dem Boden.'),
    a('… Okay. Das war heiß.', 'verlegen'),
  ], { next: 'schluss' }),
  node('kaempfen', [
    n('Du lässt die Arme hängen. Aria knurrt und macht sich über die Schnallen her, eine nach der anderen, mit der echten Hand, die Zunge zwischen den Zähnen, wie bei einem Schloss, das nicht aufgehen will.'),
    a('Das Gurtzeug und ich, wir haben was zu klären.', 'signatur'),
    n('Es dauert. Es dauert lange. Keine von euch beschwert sich.'),
  ], { next: 'schluss' }),
  node('handschuh-satz', [
    a('Ich hasse dich. Ich hasse dich so sehr. Komm her.', 'verlegen'),
    n('Sie wird rot. Bis in die Zöpfe. Du hättest nicht gedacht, dass das geht.'),
  ], { next: 'schluss' }),
  node('schluss', [
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

const morgen: DialogueDef = dlg('rom-vexaria-morgen', [
  node('start', [
    n('05:40. Du wachst auf, wie immer. Vor dem Wecker, vor dem Licht, vor allen anderen.'),
    n('Aria schläft noch. Quer über die Matratze, die Decke halb auf dem Boden. Ihre Metallhand hängt über die Mattenkante, ein Zopf ist halb offen. Sie trägt dein Top. Du weißt nicht mehr genau, wann das passiert ist.'),
    n('Paketausgabe ist um sieben. Ich bin immer um sieben da. Ich war immer weg, bevor einer aufwacht.'),
    n('Sie atmet wie ein Kompressor. Ich will nicht, dass das aufhört.'),
    n('Ihr Arm liegt auf meinem. Klackt, wenn sie atmet. Zwei Kühlschränke auf einer Matte.'),
    n('Dein Reflex: aufstehen. Gurtzeug an, zehn Schnallen, eine fehlt. Du bist an der Tür, bevor du nachgedacht hast. Am Gürtel rauscht der Funk.'),
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
    n('Du legst ihn auf die Kiste. Dann gehst du. Das Rolltor quietscht. Aria grunzt im Schlaf und dreht sich um.'),
    n('Paketausgabe. Drei Lieferungen, zwei Dächer, eine Treppe. Du arbeitest wie immer. Du denkst an nichts. Du denkst die ganze Zeit an was.'),
  ], { effects: [set('vexaria_morgen_gegangen'), herz(10), { advanceTime: 180 }, ...MORGEN_ENDE, { travel: 'high-voltage', entry: 'von-neon-gasse' }] }),
  node('kaffee', [
    n('Du schreibst auf die Ecke eines Paketscheins:'),
    n('„Bin Kaffee holen. Bin gleich zurück. Echt jetzt. – V.“'),
    n('Du unterstreichst „Echt jetzt“. Zweimal. Dann gehst du.'),
    n('Kiosk Volt-Eck. Die Jalousie ist halb oben. Oma Volt sortiert Kaugummis nach Farben.'),
    s('oma-volt', 'Einen Schwarzen, wie immer, Kindchen?', 'neutral'),
    v('Zwei.'),
    s('oma-volt', 'Zwei? DU kaufst zwei?', 'ueberrascht'),
    s('oma-volt', 'Ich hab dir die letzten drei Jahre jeden Morgen einen verkauft. Einen. Ich dachte schon, du hättest nur einen Mund.', 'freude'),
    v('Zwei. Und halt die Klappe.', 'verlegen'),
    s('oma-volt', 'Geht aufs Haus. Den zweiten. Den ersten zahlst du, ich bin ja nicht verrückt.', 'freude'),
  ], { effects: [{ credits: -4 }, { cutscene: 'rom-vexaria-morgen' }] }),
  node('liegen', [
    n('Du bleibst an der Tür stehen. Die Hand am Rolltor. Der Funk rauscht. Kas sagt seinen Satz.'),
    n('Du drehst den Funk leiser. Dann ganz aus. Dann legst du dich wieder hin, mit Gurtzeug, mit Stiefeln, und schaust an die Decke. Wellblech. Ein Rostfleck, der aussieht wie die Stadt.'),
    n('Eine Stunde. Vielleicht zwei. Irgendwann bewegt sich die Metallhand auf deinem Bauch.'),
    a('Du bist ja noch da.', 'ueberrascht'),
    n('Sie stemmt sich auf den Ellbogen. Die Zöpfe ein einziges Chaos, Abdrücke vom Kissen auf der Wange.'),
    a('Du bist ja NOCH DA.', 'zaertlich'),
    a('Hab deine Nudeln gegessen. Gestern. Und dich geklaut. Nicht sorry.', 'freude'),
    v('Hab mich krankgemeldet. Bei mir selbst. Chefin war verständnisvoll.', 'signatur'),
    n('Die Morgenlieferung geht ohne dich raus. Kurier Zwölf übernimmt sie und flucht auf Kanal 4 darüber. Es ist dir egal. Es ist dir zum ersten Mal komplett egal.'),
  ], { effects: [set('vexaria_morgen_geblieben'), BESCHWINGT, herz(40), { advanceTime: 120 }, ...MORGEN_ENDE, { travel: 'high-voltage', entry: 'von-neon-gasse' }] }),
]);

const morgenZurueck: DialogueDef = dlg('rom-vexaria-morgen-zurueck', [
  node('start', [
    n('Aria sitzt auf der Matratze, die Decke um die Schultern, und hält den Zettel hoch wie eine Trophäe.'),
    a('„Echt jetzt.“ Du hast „echt jetzt“ geschrieben. Ich lass den rahmen.', 'freude'),
    a('Und du hast UNTERSTRICHEN. Zweimal. Vex. Du hast unterstrichen.', 'zaertlich'),
    v('Kaffee wird kalt.', 'verlegen'),
    n('Sie nimmt den Becher mit der Metallhand und zieht dich mit der echten an der fehlenden Schnalle zu sich runter. Der Kaffee wird kalt.'),
  ], { effects: [set('vexaria_morgen_zurueck'), BESCHWINGT, herz(30), { advanceTime: 90 }, ...MORGEN_ENDE, { travel: 'high-voltage', entry: 'von-neon-gasse' }] }),
]);

const fruehstueck: DialogueDef = dlg('rom-vexaria-fruehstueck', [
  node('start', [
    n('Das High Voltage am Morgen. Stühle auf den Tischen, Kaffeemaschine röchelt. Aria sitzt am Tresen in deinem viel zu großen Pulli, dem grauen aus der Kiste, für kalte Nächte auf dem Dach. Die Ärmel über den Händen, nur die Silberfinger schauen raus.'),
    n('Du trägst das Gurtzeug über ihrem schwarzen Bandshirt. Mit dem roten Stern. Es ist dir zu weit an den Schultern. Es riecht nach ihr.'),
    a('Was? Der ist warm. Und er riecht nach dir. Das Zweite ist Zufall.', 'verlegen'),
    v('Gib den zurück.', 'signatur'),
    a('Hol ihn dir.', 'signatur'),
    v('Nicht vor Hunter.'),
    s('hunter', 'Danke.', 'neutral'),
    n('An Arias Gürtel, neben der runden Silberschnalle, baumelt eine zweite. Kleiner, schwarz. Deine.'),
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
    n('Du greifst nach dem Ärmel. Sie duckt sich weg, so schnell, dass sie fast vom Hocker fällt.'),
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
    n('Aria vergräbt das Gesicht in deinem Pulli-Ärmel. Du siehst trotzdem, dass sie grinst.'),
  ], { effects: [set('vexaria_fruehstueck', false), { relation: 'hunter', delta: 10 }] }),
]);

// Wiederholung der Nacht (Tagesgespräch, höchstens einmal pro Woche).
const nachtWieder: DialogueDef = dlg('vexaria-nacht-wieder', [
  node('start', [
    a('Bude oder Quartier? … Bring keine Nudeln. Doch. Bring Nudeln.', 'verlegen'),
  ], {
    choices: [
      ch('„Bleiben.“', undefined, { when: not(seen('rom-vexaria-morgen')), effects: [{ dialogue: 'rom-vexaria-licht-bude' }] }),
      ch('„Bleiben.“', undefined, { when: seen('rom-vexaria-morgen'), effects: [set('vexaria_nacht_woche'), { cutscene: 'vexaria-nacht-kurz' }] }),
      ch('„Ein andermal.“', 'andermal'),
    ],
  }),
  node('andermal', [a('Gut. Ich zähl die Schnallen trotzdem. In Gedanken. Elf. Zehn. Neun …', 'signatur')]),
]);

const morgenKurz: DialogueDef = dlg('vexaria-morgen-kurz', [
  node('start', [
    n('05:40. Kronkorken an der Tür, zwei Becher auf der Kiste, eine Brecherin quer über der Matratze. Sie schnarcht. Du bleibst noch fünf Minuten liegen. Dann zehn.'),
    a('… Du bist ja noch da. Gut. Bleib. Fünf Minuten. Zehn.', 'zaertlich'),
  ], { effects: [BESCHWINGT, herz(10)] }),
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
  ], [{ sleep: true }, { dialogue: 'rom-vexaria-morgen' }], false),
  cut('rom-vexaria-morgen', 'Bin gleich zurück', [
    { image: 'cut-rom-vexaria-morgen', pan: 'in', fade: 'in', hold: 2600, caption: 'Zwei Becher. Ein Zettel. Echt jetzt.' },
  ], [{ dialogue: 'rom-vexaria-morgen-zurueck' }]),
  cut('vexaria-nacht-kurz', 'Bude', [
    { image: 'black', fade: 'out', hold: 1600, caption: 'Rolltor runter. Glühbirne aus.' },
  ], [{ sleep: true }, { dialogue: 'vexaria-morgen-kurz' }], false),
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
    licht, lichtBude, morgen, morgenZurueck, fruehstueck, nachtWieder, morgenKurz,
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

