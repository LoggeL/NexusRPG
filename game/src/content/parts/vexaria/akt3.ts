// Vex × Aria und „Zerberster-Herz“ an der Schwelle zu Akt 3 und in der Partynacht:
//   `rom-vexaria-outfit` (Hotspot Salon Gina, stufenplatz, Akt 2): Partyvorbereitung als Paar, Gurtzeug-Streit mit Gina,
//     Aria sieht Vex im Outfit. Setzt bei Bezahlung `prep_outfits` (dasselbe Flag wie die Gina-Vorbereitung).
//   `rom-aria-stirn` / `-fs` (Station 10, N, neon-gasse, Akt 2 → 3): a) zusammen (Kanon + Vex-Fassung mit Aufnäher),
//     b) zweiter Weg nach `aria_versoehnung_gescheitert` → `spaet`, Freundschaft. Einladung per Telefon `aria-ruf-stirn`.
//   `rom-vexaria-himmelsgarten` (Hotspot tanzflaeche-glas, Partynacht): ein Tanz auf dem Glas.
//   `vexaria-gedanken-sorge` (Hotspot partysaal, während `main-3-gedankenkontrolle`): Arias Angst vor dem Tablett.
//   `vexaria-gestaendnis` (Hotspot rosenboegen, nach `raven_zurueck`): Vex sagt es zum ersten Mal.
// Der Moment am Landeplatz und Arias Blade-Zeile stehen schon in quest-main-3/main-3-blade.ts (aria-vex-rom / aria-vex).
import type { ContentPart } from '../../part';
import type { Condition, CutsceneDef, DialogueDef, Effect, HeartEventDef, PhoneMessageDef } from '../../../modules/contracts';
import {
  a, AKT2, AKT3, all, ANGEBAHNT, any, BESCHWINGT, byId, ch, chk, cut, dlg, EPILOG, flag, herz, HEUTE_FREI, msg, n, node,
  noFlag, not, NOT_V, p, R, s, seen, set, STATION_START, V, v, ZUSAMMEN,
} from './_util';

const PARTYNACHT: Condition = all(AKT3, not(EPILOG));
const PAAR: Condition = all(R, ZUSAMMEN);
const GESCHEITERT: Condition = all(R, flag('aria_versoehnung_gescheitert'), noFlag('aria_romanze_zusammen'), noFlag('aria_romanze_freundschaft'));
const VOR_PARTY: Condition = all(AKT2, not(AKT3));
/** Mindestens drei Party-Vorbereitungen (world.md §5.3) oder die Planungstafel meldet `party_bereit`. */
const PREP_IDS = ['prep-outfits', 'prep-ausweise', 'prep-gaesteliste', 'prep-fahrzeug', 'prep-turm-plan', 'prep-gegenmittel'];
const PARTY_NAH: Condition = any(
  flag('party_bereit'),
  { atLeast: PREP_IDS.map((q): Condition => ({ quest: q, state: 'done' })), min: 3 },
  { atLeast: [flag('prep_outfits'), flag('prep_ausweise'), flag('prep_gaesteliste'), flag('prep_fahrzeug'), flag('prep_turm_plan'), flag('prep_gegenmittel')], min: 3 },
);
const ERMUTIGT: Effect = { checkBuff: { id: 'ermutigt-aria-stirn', label: 'Ermutigt (Aria)', value: 1, attribute: 'ausstrahlung', forDays: 1, consumes: false } };

// ---------------------------------------------------------------------------
// rom-vexaria-outfit · „Das Gurtzeug bleibt“

const outfit: DialogueDef = dlg('rom-vexaria-outfit', [
  node('start', [
    n('Salon Gina am Stufenplatz. Spiegel bis zur Decke, Kleiderstangen wie Barrikaden, ein Geruch nach Haarspray und Selbstbewusstsein. Gina umrundet dich dreimal, mit einem Maßband um den Hals und einem Blick wie ein Chirurg.'),
    s('stylistin-gina', 'Schätzchen. Das Gurtzeug. Muss weg.', 'signatur'),
    v('Das Gurtzeug bleibt. Oder ich bleib.', 'neutral'),
    s('stylistin-gina', 'Du bleibst? Wo? Hier? Auf meinem Teppich? Mit DEM?', 'wut'),
    v('Elf Schnallen. Alle bleiben.', 'signatur'),
    n('Aria lümmelt auf dem Samtsofa am Fenster, ein Glas Sekt in der echten Hand, den Zerberster über der Lehne, und lacht so sehr, dass sie sich verschluckt.'),
    a('Gib auf, Gina. Ich hab\'s ihr mal mit \'nem Brecheisen versucht. Im Spaß. Fast.', 'freude'),
  ], {
    choices: [
      ch('„Mach was drumherum. Schwarz. Und schnell.“', 'kompromiss'),
      ch('„Ich hab \'ne Idee, Gina. Gurtzeug ÜBER dem Anzug.“', 'idee', { check: chk('vexaria-outfit-ausstrahlung', 'ausstrahlung', 5, ['stil']) }),
    ],
  }),
  node('idee', [
    s('stylistin-gina', '… Über. Dem. Anzug.', 'ueberrascht'),
    s('stylistin-gina', 'Das ist entweder das Hässlichste, was ich je gehört hab, oder die nächste Saison. Komm her. Arme hoch. Nicht atmen.', 'freude'),
  ], { next: 'kabine', effects: [{ xp: 20 }] }),
  node('kompromiss', [
    s('stylistin-gina', 'Schwarz, sagt sie. Als hätte ich was anderes. Arme hoch. Nicht atmen. Nicht widersprechen.', 'signatur'),
  ], { next: 'kabine' }),
  node('kabine', [
    n('Zwanzig Minuten hinter einem Samtvorhang. Gina flucht auf Italienisch, das sie nicht kann. Stoff raschelt, Nadeln stechen, einmal sagt sie „Herrgott, die Schultern“, und es klingt nicht wie ein Vorwurf.'),
    n('Dann zieht sie den Vorhang auf.'),
    n('Ein schwarzer Anzug, eng geschnitten, die Jacke kurz und hoch in der Taille, darunter ein schwarzes Top. Und darüber, wie eine zweite Wirbelsäule, dein Gurtzeug. Poliert. Jede Schnalle glänzt. Der Metallarm blitzt aus dem aufgekrempelten Ärmel, Gina hat ihn nicht versteckt, sie hat ihn ausgestellt.'),
    n('Aria lässt das Sektglas sinken. Es kippt. Sie merkt es nicht.'),
  ], {
    choices: [
      ch('…', 'paar', { when: PAAR }),
      ch('…', 'angebahnt', { when: all(R, ANGEBAHNT) }),
      ch('…', 'crew', { when: not(all(R, any(ZUSAMMEN, ANGEBAHNT))) }),
    ],
  }),
  node('paar', [
    a('…', 'ueberrascht'),
    a('Ich … du … Gina, kannst du kurz rausgehen? Ganz kurz. Zehn Minuten. Eine Stunde.', 'verlegen'),
    s('stylistin-gina', 'Das ist MEIN Salon.', 'wut'),
    a('Dann guck weg.', 'verlegen'),
    n('Sie steht auf. Langsam. Sie kommt auf dich zu, und jeder Schritt dauert länger als der davor. Vor dir bleibt sie stehen, so nah, dass ihre Stiefelspitzen deine berühren. Ihr Blick wandert. Schnallen. Kragen. Hals. Mund. Wieder runter.'),
    a('Du siehst aus wie ein Verbrechen. Wie eins, für das ich gern sitzen würde.', 'verlegen'),
    n('Ihre echte Hand greift das Revers deiner Jacke. Sie zieht dich daran zu sich, einen Zentimeter, noch einen. Ihr Atem riecht nach Sekt. Ihr Daumen fährt unter den Brustriemen, über den Stoff, und bleibt da liegen, wo dein Herz gegen ihre Fingerkuppe hämmert.'),
    a('Hörst du das? Das bist du. Das geht wie \'n Presslufthammer, Rennsemmel.', 'verlegen'),
    v('Gina guckt.', 'verlegen'),
    a('Soll sie.', 'zaertlich'),
    n('Sie küsst dich. Mitten im Salon, vor zwölf Spiegeln, sodass du es zwölfmal siehst: wie ihre Zöpfe über deine Schultern fallen, wie deine Metallhand sich in ihren Rücken legt, wie sie sich auf die Zehenspitzen stellt, obwohl sie gar nicht muss.'),
    n('Erst ist es ein Kuss für Gina, laut und frech, zum Angeben. Dann vergisst sie Gina. Ihr Mund wird langsamer. Weicher. Sie schmeckt nach Sekt und nach dem Kirschkaugummi, den sie seit heute Mittag kaut, und sie atmet durch die Nase, als wollte sie nicht mal dafür aufhören.'),
    n('Der Zerberster liegt flach zwischen deinen Schulterblättern, kühl durch den Anzugstoff, und zieht dich näher. Jede Schnalle des Gurtzeugs drückt sich durch ihr Bandshirt. Sie lacht in deinen Mund, weil eine davon klimpert.'),
  ], {
    effects: [herz(40), BESCHWINGT],
    choices: [
      ch('Sie herumdrehen. Rücken an den Spiegel. Jetzt du.', 'paar-spiegel'),
      ch('Ihr ins Ohr: „Später. Elf Schnallen. Eine nach der anderen.“', 'paar-ohr'),
      ch('Stillhalten. Sie machen lassen.', 'paar-still'),
    ],
  }),
  node('paar-spiegel', [
    n('Eine Drehung, wie auf dem Dach, wenn du einem Schornstein ausweichst. Plötzlich ist hinter ihr Glas und vor ihr du. Der Spiegel beschlägt da, wo ihre Schultern ihn berühren.'),
    n('Du küsst sie unter dem Ohr, da, wo der Kiefer aufhört. Dann tiefer, am Hals entlang, langsam, und deine Metallhand stützt sich neben ihrem Kopf ans Glas, ganz leise, damit nichts reißt. Aria macht ein Geräusch, das du von ihr noch nie gehört hast. Kein Lachen. Kein Fluch. Irgendwas dazwischen.'),
    a('Du … das ist … unfair. Du läufst ja auch immer vorne. Du Miststück, du –', 'verlegen'),
    n('Den Rest verschluckt sie, weil du sie wieder küsst.'),
  ], { next: 'paar-gina' }),
  node('paar-ohr', [
    n('Du lehnst dich vor, die Lippen an ihrem Ohr. Ihre Zöpfe kitzeln dich an der Nase. Du sagst es leise, sehr leise, damit nur sie es hört.'),
    v('Später. Elf Schnallen. Eine nach der anderen. Du machst sie auf. Ich zähl mit.', 'verlegen'),
    n('Aria wird rot. Nicht ein bisschen. Vom Ausschnitt bis zum Haaransatz, als hätte jemand den Dimmer hochgedreht. Ihre echte Hand krallt sich ins Revers.'),
    a('Du sagst drei Wörter am Tag, und dann sowas. Ich hasse dich. Ich hasse dich so sehr. Wie lang dauert „später“?', 'verlegen'),
    v('Lang.', 'signatur'),
    a('Du bist ein Monster.', 'verlegen'),
  ], { next: 'paar-gina' }),
  node('paar-still', [
    n('Du lässt die Arme hängen. Du lässt sie. Aria merkt es und hört auf, eine Sekunde lang, und sieht dich an, als hätte sie gerade einen Schlüssel geschenkt bekommen.'),
    a('Oh. Oh, so ist das. Die schnellste Frau der Stadt hält still. Für mich.', 'zaertlich'),
    n('Sie nimmt sich Zeit. Ihr Daumen fährt deine Unterlippe nach. Ihre Nase streift deine. Sie küsst deinen Mundwinkel, dann den anderen, dann ganz kurz die Mitte und zieht sich zurück, bevor du nachkommen kannst. Zweimal. Dreimal. Beim vierten Mal kommst du nach. Sie lässt dich.'),
    a('Siehst du. Geduld. Hab ich dir beigebracht.', 'verlegen'),
  ], { next: 'paar-gina' }),
  node('paar-gina', [
    s('stylistin-gina', 'Nicht am Revers ziehen! Das ist Seide! Das sitzt! Ich hab drei Stunden – nicht an den Spiegel! Fingerabdrücke! Ach, macht doch, was ihr wollt.', 'wut'),
    a('Machen wir. Später. Wenn du das noch anhast.', 'verlegen'),
  ], { next: 'aria-dran' }),
  node('angebahnt', [
    a('…', 'ueberrascht'),
    a('Okay. Okay. Das ist … unfair. Das ist richtig unfair, Postbotin.', 'verlegen'),
    n('Sie steht auf, umrundet dich wie Gina vorhin, nur langsamer. Hinter dir bleibt sie stehen. Du spürst sie, bevor sie dich anfasst: Ihre Finger gleiten unter den Rückenriemen und ziehen ihn gerade, obwohl er gerade war.'),
    a('Saß schief.', 'verlegen'),
    v('Saß nicht schief.', 'neutral'),
    a('Jetzt sitzt er gar nicht mehr schief. Siehst du. Gern geschehen.', 'verlegen'),
  ], { effects: [herz(30)], next: 'aria-dran' }),
  node('crew', [
    a('HA! Die Postbotin in Schick! Gina, mach ein Foto! Mach zehn! Ich häng sie im Club auf!', 'freude'),
    a('… Nee, im Ernst. Du siehst gut aus. Richtig gut. Sag\'s keinem, dass ich das gesagt hab.', 'neutral'),
  ], { effects: [herz(20)], next: 'aria-dran' }),
  node('aria-dran', [
    s('stylistin-gina', 'Und jetzt du, Brecherin. Und wehe, du sagst Bandshirt.', 'signatur'),
    a('Bandshirt.', 'signatur'),
  ], {
    choices: [
      ch('…', 'kleid-paar', { when: PAAR }),
      ch('…', 'kleid', { when: not(PAAR) }),
    ],
  }),
  node('kleid-paar', [
    n('Diesmal ist es Aria hinter dem Samtvorhang, und Gina, die flucht. Dann, nach einer Weile, Gina, die mit einem Nadelkissen in der Hand rauskommt und dich ansieht.'),
    s('stylistin-gina', 'Der Reißverschluss. Hinten. Sie lässt mich nicht. Sagt, ich hab kalte Finger. Ich hab keine kalten Finger. Du hast kalte Finger. Geh rein.', 'signatur'),
    n('Hinter dem Vorhang ist es eng und warm und riecht nach Stoff und ihr. Aria steht mit dem Rücken zu dir, das Kleid vorn festgehalten mit der echten Hand, die Zöpfe über eine Schulter gezogen. Der Reißverschluss ist offen bis zur Taille. Darunter nur das Kabelbrand-Shirt, schwarz, ausgewaschen, und dein Blick, der nicht weiß, wohin.'),
    a('Mach. Bevor ich\'s mir anders überleg und im Bandshirt geh.', 'verlegen'),
    n('Deine Metallhand findet den Schieber. Du ziehst. Langsam, weil die Zähne haken, sagst du dir. Die Knöchel deiner schwarzen Finger streifen über ihr Rückgrat, Wirbel für Wirbel, durch den dünnen Stoff, und bei jedem hält sie kurz die Luft an.'),
    a('Das ist kalt.', 'verlegen'),
    v('Soll ich die andere –', 'verlegen'),
    a('Nein. Die. Mach weiter. Langsamer.', 'zaertlich'),
    n('Oben angekommen legst du ihr die Hand in den Nacken, unter die Zöpfe. Sie lehnt sich zurück, gegen dich, gegen die Schnallen, und im Spiegel vor ihr seht ihr beide aus wie ein Verbrechen, das gleich passiert.'),
    a('Morgen Abend machst du den wieder auf. Genauso langsam. Das ist kein Wunsch. Das ist ein Auftrag. Zustellung garantiert, oder?', 'verlegen'),
    s('stylistin-gina', '(von draußen) Das dauert VERDÄCHTIG lang!', 'wut'),
    n('Als sie rauskommt, ist das schwarze, ärmellose Kleid perfekt. Gina nennt es „Abrissbirne in Abendgarderobe“. Der Zerberster liegt frei, glänzend wie ein Schmuckstück. Nur der rote Stern vom Shirt blitzt am Ausschnitt hervor, und Aria hat sehr rote Ohren.'),
  ], { effects: [herz(10)], next: 'kasse' }),
  node('kleid', [
    n('Am Ende trägt Aria ein schwarzes, ärmelloses Kleid, das Gina „Abrissbirne in Abendgarderobe“ nennt, den Zerberster frei, glänzend wie ein Schmuckstück. Und drunter, unsichtbar, ihr Kabelbrand-Shirt. Nur der rote Stern blitzt am Ausschnitt hervor.'),
  ], { next: 'kasse' }),
  node('kasse', [], {
    choices: [
      ch('Gina bezahlen. 600 Credits.', 'bezahlt', { when: { credits: 600 }, effects: [{ credits: -600 }, set('prep_outfits'), set('vexaria_outfit_bezahlt')] }),
      ch('„Ich zahl nächste Woche.“', 'anschreiben'),
    ],
  }),
  node('bezahlt', [
    s('stylistin-gina', 'Bar. Wie romantisch. Und jetzt raus, bevor ihr mir die Spiegel beschlagt.', 'freude'),
  ], { effects: [set('vexaria_outfit'), msg('Party-Outfits sind fertig.')] }),
  node('anschreiben', [
    s('stylistin-gina', 'Nächste Woche. Dann liegen die Sachen hier. Und die Brecherin schaut sie jeden Tag an und seufzt. Ich kenn das.', 'signatur'),
    n('Die Outfits bleiben im Salon, bis du bezahlst. Gina hängt sie gut sichtbar ins Schaufenster.'),
  ], { effects: [set('vexaria_outfit'), set('vexaria_outfit_offen')] }),
]);

const outfitZahlen: DialogueDef = dlg('vexaria-outfit-zahlen', [
  node('start', [
    s('stylistin-gina', 'Ah. Die Schnallen-Kundin. Sechshundert. Und ich hab die Jacke noch mal enger gemacht. Weil ich\'s kann.', 'signatur'),
  ], {
    choices: [
      ch('600 Credits hinlegen.', undefined, { when: { credits: 600 }, effects: [{ credits: -600 }, set('prep_outfits'), set('vexaria_outfit_bezahlt'), set('vexaria_outfit_offen', false), msg('Party-Outfits sind fertig.')] }),
      ch('„Später.“'),
    ],
  }),
]);

// ---------------------------------------------------------------------------
// Station 10 · rom-aria-stirn · „Komm einfach zurück“

const stirn: DialogueDef = dlg('rom-aria-stirn', [
  node('start', [
    n('Die Nacht vor der Party. Regen auf der Dachterrasse über der Neon-Gasse, leiser Regen, der mehr fällt als prasselt. Vega packt gerade ihren Windmesser ein.'),
    s('vega', 'Ich geh mal Wind messen. Woanders.', 'neutral'),
    n('Aria sitzt unter dem Vordach der Treppenhaustür, die Knie hochgezogen. Sie hat ihr Telefon in der Hand und tut so, als würde sie draufgucken.'),
  ], {
    effects: STATION_START,
    choices: [
      ch('…', 'zusammen-vex', { when: all(V, PAAR) }),
      ch('…', 'zusammen', { when: all(NOT_V, PAAR) }),
      ch('…', 'spaet', { when: GESCHEITERT }),
    ],
  }),
  node('zusammen', [
    a('Kann nicht schlafen. Setz dich. Nicht reden. Doch, reden. Egal.', 'neutral'),
    n('Sie nimmt deine Hand in beide Hände, die echte und die silberne, und lehnt die Stirn gegen deine, fast. Ein Fingerbreit Regenluft dazwischen. Sie macht die Augen zu.'),
    a('Morgen ziehen wir uns schick an und gehen zu Leuten, die uns hassen. Klingt wie ein Familienfest.', 'freude'),
    a('Wenn dir einer was tut, kriegt er\'s mit dem Zerberster zu tun. Und dann mit mir. Ich bin schlimmer.', 'zaertlich'),
    a('Versprich mir nix. Komm einfach zurück.', 'besorgt'),
  ], {
    choices: [
      ch('„Ich komm zurück.“', 'zusammen-ende'),
      ch('Die letzte Lücke schließen. Stirn an Stirn.', 'zusammen-ende', { effects: [herz(10)] }),
    ],
  }),
  node('zusammen-ende', [
    n('Ihr bleibt so sitzen. Der Regen wird nicht stärker und nicht schwächer. Irgendwann lacht sie, weil dein Magen knurrt, und dann ist es fast ein normaler Abend.'),
  ], { effects: [herz(20), ERMUTIGT, set('aria_stirn'), { cutscene: 'rom-aria-stirn' }] }),
  node('zusammen-vex', [
    a('Kann nicht schlafen. Setz dich. Hier. Zwischen meine Knie. Ich hab was für dich.', 'verlegen'),
    n('Du setzt dich vor sie auf die nassen Fliesen, mit dem Rücken an ihre Brust. Sie zieht etwas aus der Jackentasche: ein kleines Nähkissen, rosa, mit Kätzchen drauf. Darin steckt eine Nadel, schon eingefädelt, roter Faden.'),
    v('Woher hast du das?', 'ueberrascht'),
    a('Gina. Geklaut. Sie weiß es. Halt still.', 'signatur'),
    n('Sie hat einen Aufnäher dabei. Ein roter Stern, ausgeschnitten aus einem alten Bandshirt, die Ränder ausgefranst. Sie näht ihn dir auf den Schulterriemen des Gurtzeugs. Einhändig mit der echten, der Zerberster hält den Riemen fest, ganz sacht, die silbernen Finger auf deinem Schlüsselbein.'),
    n('Die Nadel geht durchs Leder. Jeder Stich dauert. Ihr Atem streift deinen Nacken, warm unter dem kalten Regen, und manchmal, wenn sie den Faden festzieht, berühren ihre Lippen deine Haut. Aus Versehen. Jedes Mal aus Versehen.'),
    a('Morgen ziehen wir uns schick an und gehen zu Leuten, die uns hassen. Klingt wie ein Familienfest.', 'freude'),
    a('So. Jetzt gehörst du zur Band. Kabelbrand-Crew. Erste Reihe. Wenn dir einer was tut, kriegt er\'s mit dem Zerberster zu tun. Und dann mit mir. Ich bin schlimmer.', 'zaertlich'),
    n('Sie beißt den Faden ab. Dann lehnt sie die Stirn gegen deinen Hinterkopf. Ihre Arme schlingen sich um dich, beide, und halten fest.'),
    a('Versprich mir nix. Komm einfach zurück.', 'besorgt'),
  ], {
    effects: [set('vexaria_aufnaeher')],
    choices: [
      ch('Umdrehen. Zu ihr. „Ich lieb dich.“', 'liebe', { when: noFlag('vexaria_liebe') }),
      ch('„Ich halt nicht an. Aber ich komm immer zurück. Das ist meine Route.“', 'route'),
      ch('Umdrehen. Sie küssen. Kein Wort.', 'kuss'),
    ],
  }),
  node('liebe', [
    n('Du drehst dich um. Auf den Knien, im Regen, ihr Gesicht zwischen deinen Händen, der echten und der schwarzen.'),
    v('Ich lieb dich.', 'zaertlich'),
    n('Aria blinzelt. Einmal. Zweimal. Der Regen läuft ihr übers Gesicht, und du siehst trotzdem, dass da noch was anderes läuft.'),
    a('Du … das … du sagst NIE was. Du sagst drei Wörter am Tag, und dann sind\'s DIE?', 'ueberrascht'),
    v('Hab gespart.', 'verlegen'),
    a('Ich lieb dich auch, du Arschloch. Schon ewig. Seit dem Armdrücken. Seit du mir zehn Prozent abgeknöpft hast. Ich lieb dich so sehr, dass ich dir eine reinhauen will.', 'zaertlich'),
  ], { effects: [set('vexaria_liebe'), herz(40)], next: 'kuss' }),
  node('route', [
    a('Deine Route. Das ist das Romantischste, was je einer zu mir gesagt hat, und es klingt wie ein Lieferschein.', 'zaertlich'),
  ], { next: 'kuss' }),
  node('kuss', [
    n('Sie küsst dich. Im Regen, auf den Knien, mit der Nadel noch zwischen den Fingern. Langsam. Gründlich. Als hätte sie sich jede Sekunde davon gemerkt und wollte sie jetzt alle auf einmal zurück. Ihre Zöpfe kleben nass an deinem Hals. Deine Metallfinger finden den Reißverschluss ihrer Jacke und bleiben da, ohne zu ziehen.'),
    n('Der Regen läuft euch in die Münder. Sie schmeckt nach Regen und nach dem Bier von vorhin und nach etwas, das nur sie ist. Als sie Luft holt, holt sie sie an deiner Lippe, und du spürst, dass ihr Kinn zittert. Nicht vor Kälte.'),
    v('Du zitterst.', 'zaertlich'),
    a('Du auch. Deine Hand. Die echte. Die zittert seit der Nadel.', 'zaertlich'),
    n('Stimmt. Du hast es nicht gemerkt. Sie nimmt deine Hand, die mit dem fingerlosen Handschuh, und legt sie sich flach an den Hals, unter den Kragen, auf die nasse, warme Haut, wo ihr Puls galoppiert.'),
    a('Fühl mal. Das machst du. Seit Wochen. Ich kann nicht schlafen, weil mein eigenes Herz so laut ist.', 'verlegen'),
    a('Die Party ist morgen. Heute Nacht ist … heute Nacht.', 'verlegen'),
  ], {
    choices: [
      ch('„Bude.“', 'bude'),
      ch('„Hier. Bis der Regen aufhört.“', 'hier'),
    ],
  }),
  node('hier', [
    n('Ihr bleibt. Unter dem Vordach, auf den nassen Fliesen, sie mit dem Rücken an der Tür, du halb auf ihr, ihre Beine um deine Hüfte, weil es da wärmer ist, sagt sie. Ihr küsst euch, bis der Regen leiser wird. Dann küsst ihr euch, weil er leiser wird.'),
    a('Ich will nicht, dass morgen kommt. Ich will, dass es immer genau jetzt ist. Nass und kalt und du.', 'zaertlich'),
  ], { effects: [herz(20), ERMUTIGT, set('aria_stirn'), BESCHWINGT, { cutscene: 'rom-aria-stirn' }] }),
  node('bude', [
    n('Ihr rennt. Durch die Neon-Gasse, durch die Pfützen, die das Pink der Leuchtreklamen spiegeln, Hand in Hand, und sie lacht die ganze Zeit, atemlos und ein bisschen hysterisch. Zweimal bleibt ihr unter einem Vordach stehen, weil sie dich küssen muss. Einmal, weil du es musst.'),
    n('Die Lötgassen. Die Kurierbude. Du ziehst das Rolltor hoch, sie duckt sich drunter durch, du ziehst es runter. Es rattert. Die Kronkorken an der Innenseite klimpern. Dann ist es still bis auf den Regen auf dem Wellblech und das Tropfen von euch beiden auf den Beton.'),
    n('Eine Glühbirne an einem Kabel. Eine Matratze. Eine Kiste mit zwei Bechern. Aria steht mitten drin, klitschnass, die Zöpfe tropfen, die Jacke klebt an ihr, und sie sieht auf einmal gar nicht mehr laut aus.'),
    a('Okay. Okay. Ich sag jetzt was, und du lachst nicht.', 'verlegen'),
    a('Ich will dich. Nicht so wie sonst, nicht schnell, nicht zwischen zwei Jobs. Ich will, dass es dauert. Ich will mich morgen da oben an jede einzelne Schnalle erinnern, wenn mir einer ein Tablett unter die Nase hält. Ich will was haben, das mir keiner aus dem Kopf schneiden kann.', 'zaertlich'),
    n('Sie sagt es mit fester Stimme. Ihre Hände sagen was anderes. Sie versucht, mit dem Zerberster den Reißverschluss ihrer Jacke zu greifen, und die silbernen Finger rutschen vom nassen Metall ab. Einmal. Zweimal. Sie flucht leise.'),
  ], {
    choices: [
      ch('„Dann zeig mir, wo.“', 'bude-sie'),
      ch('Ihre Jacke. Reißverschluss. Zahn für Zahn.', 'bude-du'),
      ch('„Wir müssen nicht. Wir können auch nur nass rumliegen.“', 'bude-frage'),
    ],
  }),
  node('bude-sie', [
    v('Dann zeig mir, wo.', 'zaertlich'),
    n('Sie sieht dich an. Lange. Dann nimmt sie deine echte Hand und führt sie. An den Reißverschluss, und den macht ihr zusammen auf, ihre Finger auf deinen. An ihren Hals, wo der Kragen nass ist. An ihre Hüfte, unter die Jacke, auf das klamme Shirt, das an ihr klebt. Sie führt, du folgst. Zum ersten Mal überhaupt folgst du.'),
    a('Da. Und da. Und – nein, da. Genau da. Du lernst schnell, Postbotin.', 'verlegen'),
    n('Die Jacke fällt. Klatscht nass auf den Beton. Keine von euch guckt hin.'),
  ], { effects: [herz(10)], next: 'bude-gurt' }),
  node('bude-du', [
    n('Du nimmst den Zipper zwischen zwei Metallfinger. Ganz langsam ziehst du. Zahn für Zahn, und jeder klickt, und bei jedem atmet sie aus, als hättest du was Wichtigeres geöffnet als eine Jacke.'),
    n('Du schiebst ihr die Jacke von den Schultern. Erst rechts, die echte Schulter, warm unter dem nassen Shirt. Dann links, vorsichtiger, über die Stelle, wo der Zerberster anfängt. Wo Haut in Metall übergeht. Die Narbe da ist breit und glatt und du küsst sie, bevor du nachdenkst.'),
    a('… Das hat noch nie einer gemacht. Die Naht. Alle gucken weg. Oder hin, aber so, als wär\'s ein Unfall.', 'zaertlich'),
    v('Ist kein Unfall. Ist da, wo du anfängst.', 'zaertlich'),
    n('Die Jacke fällt. Aria legt dir die echte Hand in den Nacken und zieht dich hoch, und der Kuss danach ist nicht mehr langsam.'),
  ], { effects: [herz(10)], next: 'bude-gurt' }),
  node('bude-frage', [
    n('Sie hält inne. Die silbernen Finger noch am Reißverschluss.'),
    a('… Du fragst mich das? Jetzt? Du?', 'ueberrascht'),
    v('Ich frag dich das immer. Auch morgen. Auch in zehn Jahren.', 'zaertlich'),
    n('Aria lacht, ein nasses, wackliges Lachen, und lehnt die Stirn gegen deine. Ganz. Kein Fingerbreit Luft.'),
    a('Ja. Ja, verdammt. Frag mich noch mal, und ich sag noch mal ja. Frag mich hundertmal. Ich will\'s hundertmal sagen.', 'zaertlich'),
    v('Sicher?', 'verlegen'),
    a('Ja. Zweiundneunzig fehlen noch. Mach mir die Jacke auf, du Rennsemmel, meine Hand ist zu blöd dafür.', 'verlegen'),
    n('Du machst ihr die Jacke auf. Sie fällt nass auf den Beton.'),
  ], { effects: [herz(10)], next: 'bude-gurt' }),
  node('bude-gurt', [
    n('Dann ist sie dran. Sie stellt sich vor dich, so nah, dass das Wasser von ihren Zöpfen auf dein Gurtzeug tropft, und legt den Zeigefinger der echten Hand auf die erste Schnalle. Unten links.'),
    a('Eins.', 'verlegen'),
    n('Sie zählt. Bei jeder Schnalle ein Wort, bei jedem Wort ein Kuss irgendwohin. Kinn. Schlüsselbein. Die Stelle am Hals, wo der Riemen sonst scheuert. Bei sechs lacht sie, weil der Dorn klemmt, und beißt dich zur Strafe sanft in die Schulter. Bei neun zittern ihre Finger so, dass du ihr hilfst.'),
    n('Bei elf bleibt sie am Schulterriemen hängen. Am roten Stern. Ihr Daumen fährt die schiefen Stiche nach, die sie vor einer Stunde gemacht hat.'),
    a('Den lassen wir dran. Nicht das Gurtzeug. Den Stern. Für immer, okay? Egal, was morgen ist.', 'zaertlich'),
    n('Das Gurtzeug rutscht dir von den Schultern und fällt auf die Jacke. Leder auf nassem Stoff. Elf Schnallen, die auf dem Beton klimpern. Darunter dein Top, nass bis auf die Haut, und Aria sieht dich an, als hätte sie die ganze Zeit nur darauf gewartet, dass du nicht mehr gepanzert bist.'),
    n('Deine Metallhand an ihrem Rücken, unter dem nassen Shirt, flach auf der Wirbelsäule. Sie zuckt.'),
    a('Kalt. Gott, ist das kalt.', 'verlegen'),
    v('Soll ich –', 'verlegen'),
    a('Wehe. Lass sie da. Ich gewöhn mich dran. Ich will mich dran gewöhnen. An alles von dir.', 'zaertlich'),
  ], {
    choices: [
      ch('„Ich hab Angst vor morgen.“', 'bude-angst'),
      ch('Ihr den nassen Zopfgummi rausziehen. Den ersten.', 'bude-zopf'),
      ch('Nichts sagen. Nur ihre Stirn an deine.', 'bude-stirn'),
    ],
  }),
  node('bude-angst', [
    v('Ich hab Angst vor morgen.', 'trauer'),
    n('Aria hält still. Ihre Hand liegt flach auf deinem Herzen, auf dem nassen Top. Sie nickt. Sie sagt nicht „brauchst du nicht“. Dafür liebst du sie gleich noch mal.'),
    a('Ich auch. Scheißangst. Also machen wir\'s so: Heute Nacht hab ich keine. Und du auch nicht. Die holen wir morgen wieder ab. Die läuft nicht weg.', 'zaertlich'),
  ], { next: 'bude-ende' }),
  node('bude-zopf', [
    n('Der Gummi ist nass und klemmt. Du ziehst vorsichtig, mit der echten Hand, und der Zopf geht auf, und ihr Haar fällt dir schwer und nass über das Handgelenk. Sie schließt die Augen.'),
    a('Den anderen auch. Und dann … dann red nicht mehr so viel.', 'verlegen'),
    v('Ich red nie.', 'signatur'),
    a('Heute schon. Mit den Händen. Halt die Klappe.', 'verlegen'),
  ], { next: 'bude-ende' }),
  node('bude-stirn', [
    n('Du lehnst die Stirn an ihre. Sie atmet. Du atmest. Irgendwann im selben Takt. Das Wasser tropft von euch beiden auf den Beton, und unter der Glühbirne glänzt alles: ihre Schultern, deine Narben, der Zerberster, dein schwarzer Arm.'),
    a('Weißt du, was das hier ist? Der leise Teil. Den hatten wir noch nie. Ich mag den leisen Teil.', 'zaertlich'),
  ], { next: 'bude-ende' }),
  node('bude-ende', [
    n('Sie zieht sich das nasse Shirt über den Kopf und lässt es fallen, ohne hinzusehen, wohin. Sie sieht nur dich. Dann greift sie nach dem Saum deines Tops und wartet. Fragt mit den Augen. Du nickst.'),
    a('Glühbirne.', 'verlegen'),
    n('Du greifst nach oben. Deine schwarzen Finger finden die heiße Birne und drehen. Einmal. Klick.'),
  ], { effects: [herz(20), ERMUTIGT, set('aria_stirn'), set('vexaria_nacht_woche'), { cutscene: 'rom-aria-stirn-vex' }] }),
  node('spaet', [
    n('Sie sieht dich kommen und steht auf. Sie hat gewartet. Das sieht man an den nassen Schultern.'),
    a('Morgen kann alles vorbei sein, und das Letzte, was ich zu dir gesagt hab, war „verpiss dich“. So lass ich das nicht stehen.', 'trauer'),
  ], {
    choices: [
      ch('„Es tut mir leid. Alles. Wirklich alles.“', 'spaet-ok'),
      ch('„Ich hab dich vermisst. Jeden Tag. Auch die, an denen wir geredet haben.“', 'spaet-ok'),
      ch('„Ich hab Angst. Vor morgen. Vor dir. Vor allem.“', 'spaet-ok'),
      ch('„Ich hab mich umgedreht, Zöpfe. Ich dreh mich immer noch um. Jede Nacht.“', 'spaet-ok', { when: V }),
      ch('„Lass gut sein.“', 'spaet-freund'),
    ],
  }),
  node('spaet-ok', [
    n('Sie hört zu. Dann macht sie zwei Schritte. Dann ist ihre Stirn an deiner, ganz, ohne Fingerbreit dazwischen, und ihre Augen sind zu.'),
    a('Okay. Okay. Das reicht. Für heute. Und wenn wir morgen nicht draufgehen … dann will ich auf die Mauer. Mit Rennen. Und allem.', 'zaertlich'),
    a('Versprich mir nix. Komm einfach zurück.', 'besorgt'),
  ], {
    effects: [
      set('aria_versoehnung_spaet'), set('aria_versoehnung_gescheitert', false), set('aria_romanze_angebahnt'),
      set('aria_romanze_streit', false), herz(60), ERMUTIGT, set('aria_stirn'), { cutscene: 'rom-aria-stirn' },
    ],
  }),
  node('spaet-freund', [
    a('Okay. Lass gut sein. Crew?', 'trauer'),
    p('Crew.'),
    n('Sie haut dir die Metallfaust gegen die Schulter. Sanft. Dann geht sie die Treppe runter und lässt die Tür offen.'),
  ], { effects: [set('aria_romanze_freundschaft'), set('aria_versoehnung_gescheitert', false), set('aria_stirn')] }),
]);

const stirnFs: DialogueDef = dlg('rom-aria-stirn-fs', [
  node('start', [
    n('Die Nacht vor der Party. Leiser Regen auf der Dachterrasse. Aria sitzt mit zwei Bier unter dem Vordach der Treppenhaustür und schiebt dir eins rüber.'),
    a('Morgen. Schicke Klamotten, böse Leute, Champagner. Ich trink den aus der Flasche, nur damit du\'s weißt.', 'freude'),
    a('Versprich mir, dass du zurückkommst. Nicht für mich. Für die Crew. Na gut. Auch für mich.', 'besorgt'),
  ], {
    effects: STATION_START,
    choices: [ch('„Versprochen.“', 'ende'), ch('„Wer zuerst zurück ist.“', 'ende')],
  }),
  node('ende', [
    n('Sie stößt dir die Metallfaust gegen die Schulter. Sanft. Für Zerberster-Verhältnisse.'),
  ], { effects: [herz(20), set('aria_stirn')] }),
]);

const phone: PhoneMessageDef[] = [
  {
    id: 'aria-ruf-stirn', from: 'aria', text: 'dach. heute nacht. kann nicht schlafen. bring nix mit außer dich.',
    auto: all(R, VOR_PARTY, PARTY_NAH, any(ZUSAMMEN, flag('aria_versoehnung_gescheitert')), not(seen('rom-aria-stirn')), { time: ['abend', 'nacht'] }),
  },
];

// ---------------------------------------------------------------------------
// Partynacht

const tanz: DialogueDef = dlg('rom-vexaria-himmelsgarten', [
  node('start', [
    n('Die Tanzfläche aus Glas, hoch über der Stadt. Unter euren Füßen leuchten die Straßen der Unterstadt wie ein Schaltplan. Das Streichquartett spielt etwas, das man eigentlich nur zu zweit hören darf.'),
    n('Aria taucht neben dir auf. Das schwarze Kleid, der Zerberster wie Schmuck, ein Champagnerglas, das sie ganz offensichtlich vom Tablett eines bewusstlosen Kellners genommen hat.'),
    a('Tanz mit mir. Bevor wir alles kaputthauen. Einmal. Wie normale Leute.', 'verlegen'),
  ], {
    choices: [
      ch('Ihre Hand nehmen. Tanzen.', 'tanz', { when: PAAR }),
      ch('Tanzen. Mit Abstand. Kurz.', 'tanz-fs', { when: not(PAAR) }),
      ch('Zur Musik antreten. Richtig.', undefined, {
        effects: [{
          minigame: 'akt-tanz', level: 2, key: 'vexaria-himmelsgarten-tanz', label: 'Tanz auf dem Glas',
          win: [herz(30), BESCHWINGT, { dialogue: 'vexaria-himmelsgarten-gut' }],
          lose: [herz(10), { dialogue: 'vexaria-himmelsgarten-patzer' }],
        }],
      }),
    ],
  }),
  node('tanz', [
    n('Ihre echte Hand in deiner, die silberne auf deinem Rücken, flach über dem Gurtriemen. Du führst. Natürlich führst du, du läufst ja auch immer vorne. Nach drei Takten führt sie. Natürlich führt sie.'),
    n('Ihr dreht euch langsam über das Glas. Die Gäste starren, weil zwei Frauen aus der Unterstadt in Gurtzeug und Zerberster besser tanzen als jeder hier. Aria lehnt die Wange an deine. Ihr Atem an deinem Ohr, ruhig, zum ersten Mal an diesem Abend ruhig.'),
    a('Unter uns ist die Gasse. Siehst du? Die Leuchtreklame vom High Voltage. Der kleine rote Punkt.', 'zaertlich'),
    v('Seh ich.', 'zaertlich'),
    a('Da hab ich dich zum ersten Mal angeschrien. Und jetzt tanz ich mit dir auf dem Dach von dem Arschloch, das uns allen den Kopf verdreht hat. Wenn das kein Fortschritt ist.', 'freude'),
    n('Am Ende des Stücks küsst sie dich. Kurz, weil Leute gucken. Dann noch mal, länger, weil ihr das egal ist.'),
  ], { effects: [herz(30), BESCHWINGT, set('vexaria_himmelsgarten')] }),
  node('tanz-fs', [
    n('Ihr tanzt wie zwei Leute, die es nie gelernt haben: zu weit auseinander, zu oft auf den Füßen des anderen, und mit sehr viel Gelächter. Ein Gast im Smoking flüchtet vor dem Zerberster.'),
    a('Wir sind schrecklich. Wir sind so schrecklich. Ich liebe es.', 'freude'),
  ], { effects: [herz(20), set('vexaria_himmelsgarten')] }),
]);

const tanzGut: DialogueDef = dlg('vexaria-himmelsgarten-gut', [
  node('start', [
    n('Die letzte Drehung sitzt. Das Glas unter euch summt. Irgendwer klatscht, dann klatschen alle, auch die Gechippten, mit diesem leeren, höflichen Lächeln.'),
    a('Wir haben sie umgehauen. Ohne Schläger. Das muss ich Hunter erzählen.', 'freude'),
  ], { effects: [set('vexaria_himmelsgarten')] }),
]);
const tanzPatzer: DialogueDef = dlg('vexaria-himmelsgarten-patzer', [
  node('start', [
    n('Du trittst ihr auf den Fuß. Sie dir auf beide. Ihr landet fast im Champagnerbrunnen.'),
    a('Das war Absicht. Das war Kunst. Das ist jetzt ein Tanz, der heißt „Unterstadt“.', 'freude'),
  ], { effects: [set('vexaria_himmelsgarten')] }),
]);

const sorge: DialogueDef = dlg('vexaria-gedanken-sorge', [
  node('start', [
    n('Am Rand des Partysaals, hinter einer Säule voller Rosen. Die Droiden mit den Tabletts gehen durch die Reihen, und jeder Gast nimmt sich einen Chip, als wär\'s ein Häppchen. Aria hat sich gegen die Säule gedrückt. Ihr Zerberster summt nicht. Er brummt, tief und unruhig.'),
    a('Ich kann da nicht hingucken. Ich guck trotzdem hin. Jedes Mal, wenn einer den Chip nimmt, spür ich das Klicken hinterm Ohr.', 'besorgt'),
    a('Wenn sie dich kriegen, Vex. Wenn du gleich „Ja, Master“ sagst, mit deinem Mund, und ich steh daneben …', 'trauer'),
  ], {
    choices: [
      ch('„Dann holst du mich raus. Wie ich dich.“', 'raus', { when: flag('vexaria_gerettet') }),
      ch('„Mich kriegt keiner. Ich bin zu schnell. Und zu unfreundlich.“', 'schnell'),
      ch('Ihr die Hand auf den Nacken legen. Da, wo der Chip saß. Daumen über die Narbe.', 'narbe', { when: flag('aria_gechippt') }),
    ],
  }),
  node('raus', [
    a('Mit Erinnerungen. Wie du. Was soll ich denn sagen? „Weißt du noch, wie du mir zehn Prozent abgeknöpft hast?“', 'trauer'),
    v('Würd funktionieren.', 'signatur'),
    a('… Würd\'s, oder? Scheiße. Okay.', 'zaertlich'),
  ], { effects: [herz(20)], next: 'ende' }),
  node('schnell', [
    a('Unfreundlich bist du. Das stimmt. Das ist das Beruhigendste, was ich heute gehört hab.', 'freude'),
  ], { effects: [herz(10)], next: 'ende' }),
  node('narbe', [
    n('Die Haut hinter ihrem Ohr ist glatt und warm, und darunter fühlst du die kleine, harte Kante, wo Dante den Chip rausgeschnitten hat. Sie lehnt den Kopf in deine Hand. Ihre Augen schließen sich.'),
    a('Da. Genau da. Lass sie da.', 'zaertlich'),
  ], { effects: [herz(20)], next: 'ende' }),
  node('ende', [
    a('Geh. Mach das Ding kaputt. Ich pass auf, dass dir keiner ein Tablett unter die Nase hält. Und wenn doch, hau ich ihm das Tablett in die Nase.', 'signatur'),
  ], { effects: [set('vexaria_gedanken_sorge')] }),
]);

const gestaendnis: DialogueDef = dlg('vexaria-gestaendnis', [
  node('start', [
    n('Unter den Rosenbögen, kurz nachdem Raven wieder Raven ist. Die Musik ist aus, irgendwo schreit Blade jemanden an, und Aria lehnt am Spalier und atmet, als wäre sie gerannt.'),
    a('Du hast gesehen, wie Dante sie angeguckt hat? Wie er „Raven“ gesagt hat, als wär das das einzige Wort, das er kennt?', 'zaertlich'),
    a('Sieben Jahre. Sieben Jahre hat er das nicht gesagt.', 'trauer'),
  ], {
    choices: [
      ch('„Ich lieb dich.“ Sofort. Bevor sieben Jahre um sind.', 'liebe', { when: noFlag('vexaria_liebe') }),
      ch('„Ich hab\'s dir schon gesagt. Ich sag\'s noch mal. Jeden Tag, wenn\'s sein muss.“', 'nochmal', { when: flag('vexaria_liebe') }),
      ch('Ihre Hand nehmen. Nichts sagen.', 'hand'),
    ],
  }),
  node('liebe', [
    v('Ich lieb dich.', 'zaertlich'),
    n('Aria starrt dich an. Mitten in Blades Garten, zwischen Rosen, die nach Geld riechen, mit einem halben Kampf hinter euch und einem ganzen vor euch.'),
    a('Jetzt? JETZT? Hier? Wo gleich irgendwas explodiert?', 'ueberrascht'),
    v('Wollt nicht warten. Sieben Jahre ist zu lang.', 'verlegen'),
    a('… Ich lieb dich auch. Du Idiotin. Du schnelle, dumme, wunderschöne Idiotin.', 'zaertlich'),
    n('Sie packt dich an den Riemen und küsst dich gegen das Rosenspalier. Ein paar Dornen. Egal. Das Holz knarzt in deinem Rücken, Blütenblätter regnen euch in die Haare, und ihr Kuss ist nicht höflich, nicht für Leute, die gucken könnten. Er ist hungrig. Sie küsst wie sie Türen eintritt.'),
    n('Ihre echte Hand gräbt sich in deinen Nacken, unter die Haare. Der Zerberster liegt an deiner Hüfte, über dem Gurt, und drückt dich ins Spalier, gerade so fest, dass du merkst, wie viel Kraft da drin ist. Und wie viel davon sie zurückhält. Für dich. Immer für dich.'),
  ], {
    effects: [set('vexaria_liebe'), herz(40), BESCHWINGT],
    choices: [
      ch('Zurückküssen. Gleich fest. Die Hände in ihre Zöpfe.', 'spalier-fest'),
      ch('Ihr einen Dorn aus der Schulter zupfen. Die Stelle küssen.', 'spalier-dorn'),
    ],
  }),
  node('spalier-fest', [
    n('Du drehst sie nicht um. Du hältst nur dagegen. Deine Finger in ihren Zöpfen, deine Zähne an ihrer Unterlippe, und sie macht ein Geräusch, das irgendwo zwischen Lachen und Knurren landet. Eine Rose bricht ab. Ein Gast im Smoking sieht um die Ecke und geht sehr schnell rückwärts wieder weg.'),
    a('Wenn wir das hier überleben, Schrapnell … ich schwör\'s dir, ich lass dich eine Woche nicht aus der Bude.', 'verlegen'),
    v('Zwei.', 'signatur'),
    a('Zwei. Abgemacht. Ich bring Bier mit. Und \'nen Schraubenzieher für die Schnallen.', 'verlegen'),
  ], { next: 'ende' }),
  node('spalier-dorn', [
    n('Ein Dorn steckt in ihrer bloßen Schulter, gleich neben dem Kleidträger. Du ziehst ihn raus, mit zwei Metallfingern, ganz vorsichtig. Ein winziger roter Punkt. Du legst die Lippen drauf.'),
    n('Aria hält still. Die Brecherin, mitten im Feind, mit einem halben Kampf hinter sich und einem ganzen vor sich, hält still und lässt sich eine Dornenstelle küssen.'),
    a('Du bist so … du bist so weich. Wer hätte das gedacht. Unter dem ganzen Leder. Sag\'s keinem.', 'zaertlich'),
    v('Wem denn.', 'zaertlich'),
    a('Blade. Dem würd das wehtun.', 'freude'),
  ], { next: 'ende' }),
  node('nochmal', [
    v('Ich lieb dich.', 'zaertlich'),
    a('Ich weiß. Sag\'s noch mal, wenn wir oben sind. Und noch mal am Meer. Ich führ Buch.', 'zaertlich'),
    n('Dann zieht sie dich an der Hand hinter das Spalier, zwei Schritte, in den Schatten zwischen Rosen und Mauer, und küsst dich. Kurz. Dann nicht mehr kurz. Ihr Atem an deinem Ohr, als sie aufhört.'),
    a('Nachtrag fürs Buch: Jeden Tag reicht nicht. Zweimal. Morgens und nachts. Nachts lauter.', 'verlegen'),
  ], { effects: [herz(20)], next: 'ende' }),
  node('hand', [
    n('Ihre Finger schließen sich um deine. Fest. Sie sieht zu Dante und Raven rüber und lächelt, und es ist das erste Lächeln an diesem Abend, das nichts verbergen muss.'),
  ], { effects: [herz(10)], next: 'ende' }),
  node('ende', [], { effects: [set('vexaria_gestaendnis_party')] }),
]);

// ---------------------------------------------------------------------------
// Cutscenes, Ereignisse

const cutscenes: CutsceneDef[] = [
  cut('rom-aria-stirn', 'Komm einfach zurück', [
    { image: 'cut-rom-aria-stirn', pan: 'in', fade: 'in', hold: 2800, caption: 'Regen. Ein Fingerbreit Luft. Dann keiner mehr.' },
  ]),
  cut('rom-aria-stirn-vex', 'Komm einfach zurück', [
    { image: 'cut-rom-aria-stirn', pan: 'in', fade: 'in', hold: 2400, caption: 'Ein roter Stern auf dem Schulterriemen.' },
    { image: 'black', fade: 'out', hold: 1800, caption: 'Rolltor unten. Glühbirne aus. Die Party ist morgen.' },
    { image: 'black', lines: [n('Im Dunkeln klimpern elf Schnallen, als jemand mit dem Fuß dagegenstößt. Ein Fluch, ein Lachen, ein „Psst“. Dann nur noch Regen auf dem Wellblech.')], hold: 1800 },
  ], [{ sleep: true }, { dialogue: 'vexaria-morgen-kurz' }], false),
];

const STIRN_BASIS: Condition = all(VOR_PARTY, PARTY_NAH, HEUTE_FREI, { quest: 'pers-aria-zerberster', state: 'done' });

export const AKT3_EVENTS: HeartEventDef[] = [
  {
    id: 'rom-aria-stirn', hearts: 8, map: 'neon-gasse', time: 'nacht',
    when: all(STIRN_BASIS, any(PAAR, GESCHEITERT), not(seen('rom-aria-stirn'))),
    dialogue: 'rom-aria-stirn',
    effects: [{ setFlag: 'aria_heute' }, { xp: 25 }],
  },
  {
    id: 'rom-aria-stirn-fs', hearts: 6, map: 'neon-gasse', time: 'nacht',
    when: all(STIRN_BASIS, not(any(PAAR, GESCHEITERT)), noFlag('aria_romanze_streit'), noFlag('aria_krach'), not(seen('rom-aria-stirn'))),
    dialogue: 'rom-aria-stirn-fs',
    effects: [{ setFlag: 'aria_heute' }, { xp: 25 }, { markSeen: 'rom-aria-stirn' }],
  },
];

export const part: ContentPart = {
  dialogues: byId([outfit, outfitZahlen, stirn, stirnFs, tanz, tanzGut, tanzPatzer, sorge, gestaendnis]),
  cutscenes: byId(cutscenes),
  phone: byId(phone),
  mapAdditions: {
    stufenplatz: {
      hotspots: [
        {
          id: 'rom-vexaria-outfit', at: 'salon-gina', label: 'Mit Aria zu Gina', kind: 'talk',
          when: all(V, VOR_PARTY, flag('aria_arm_frei'), noFlag('vexaria_outfit'), noFlag('prep_outfits'), { time: ['tag', 'abend'] }),
          dialogue: 'rom-vexaria-outfit',
        },
        {
          id: 'vexaria-outfit-zahlen', at: 'salon-gina', label: 'Gina die Outfits bezahlen', kind: 'talk',
          when: all(V, flag('vexaria_outfit_offen'), noFlag('vexaria_outfit_bezahlt'), { time: ['tag', 'abend'] }),
          dialogue: 'vexaria-outfit-zahlen',
        },
      ],
    },
    himmelsgarten: {
      hotspots: [
        {
          id: 'rom-vexaria-himmelsgarten', at: 'tanzflaeche-glas', label: 'Mit Aria tanzen', kind: 'talk',
          when: all(V, PARTYNACHT, { recruited: 'aria' }, noFlag('vexaria_himmelsgarten'), { quest: 'main-3-einlass', state: 'done' }),
          dialogue: 'rom-vexaria-himmelsgarten',
        },
        {
          id: 'vexaria-gedanken-sorge', at: 'rosenboegen', label: 'Aria hinter der Säule', kind: 'talk',
          when: all(V, PARTYNACHT, { quest: 'main-3-gedankenkontrolle', state: 'active' }, noFlag('vexaria_gedanken_sorge'), noFlag('raven_zurueck')),
          dialogue: 'vexaria-gedanken-sorge',
        },
        {
          id: 'vexaria-gestaendnis', at: 'rosenboegen', label: 'Kurz mit Aria', kind: 'talk',
          when: all(V, PAAR, PARTYNACHT, flag('raven_zurueck'), noFlag('vexaria_gestaendnis_party')),
          dialogue: 'vexaria-gestaendnis',
        },
      ],
    },
  },
};

