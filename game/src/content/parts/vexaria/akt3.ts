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
    v('Gina guckt.', 'verlegen'),
    a('Soll sie.', 'zaertlich'),
    n('Sie küsst dich. Mitten im Salon, vor zwölf Spiegeln, sodass du es zwölfmal siehst: wie ihre Zöpfe über deine Schultern fallen, wie deine Metallhand sich in ihren Rücken legt, wie sie sich auf die Zehenspitzen stellt, obwohl sie gar nicht muss.'),
    s('stylistin-gina', 'Nicht am Revers ziehen! Das ist Seide! Das sitzt! Ich hab drei Stunden – ach, macht doch, was ihr wollt.', 'wut'),
    a('Machen wir. Später. Wenn du das noch anhast.', 'verlegen'),
  ], { effects: [herz(40), BESCHWINGT], next: 'aria-dran' }),
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
    n('Am Ende trägt Aria ein schwarzes, ärmelloses Kleid, das Gina „Abrissbirne in Abendgarderobe“ nennt, den Zerberster frei, glänzend wie ein Schmuckstück. Und drunter, unsichtbar, ihr Kabelbrand-Shirt. Nur der rote Stern blitzt am Ausschnitt hervor.'),
  ], {
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
    a('Die Party ist morgen. Heute Nacht ist … heute Nacht.', 'verlegen'),
  ], {
    choices: [
      ch('„Bude.“', undefined, { effects: [herz(20), ERMUTIGT, set('aria_stirn'), set('vexaria_nacht_woche'), { cutscene: 'rom-aria-stirn-vex' }] }),
      ch('„Hier. Bis der Regen aufhört.“', undefined, { effects: [herz(20), ERMUTIGT, set('aria_stirn'), BESCHWINGT, { cutscene: 'rom-aria-stirn' }] }),
    ],
  }),
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
    n('Sie packt dich an den Riemen und küsst dich gegen das Rosenspalier. Ein paar Dornen. Egal.'),
  ], { effects: [set('vexaria_liebe'), herz(40), BESCHWINGT], next: 'ende' }),
  node('nochmal', [
    v('Ich lieb dich.', 'zaertlich'),
    a('Ich weiß. Sag\'s noch mal, wenn wir oben sind. Und noch mal am Meer. Ich führ Buch.', 'zaertlich'),
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
    { image: 'black', fade: 'out', hold: 1800, caption: 'Rolltor runter. Glühbirne aus. Die Party ist morgen.' },
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

