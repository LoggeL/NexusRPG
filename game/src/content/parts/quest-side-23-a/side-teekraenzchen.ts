// side-teekraenzchen · „Das Teekränzchen“ (world.md §6.3 Nr. 32). Sybella Chrome (Anzeige: „diskrete Beraterin für
// Marktanalysen“) · chrome-boulevard, chrome-penthouse · tagsüber, bis zur Vorabpräsentation drei Tage nach main-2-countdown.
// Zutritt: Ruf chrome-haus 20 / ausweis-oberstadt (Aufzug ist dann offen), presseausweis, [Oberstadt], Keks-Lieferung
// (dantes-kekse) – dazu Vex als Kurierin und ein teures Trinkgeld als Weg ohne Check und ohne Gegenstand.
// Teekränzchen im Salon mit dem Etikette-Minispiel (akt-etikette, Schlüssel teekraenzchen-etikette; [Oberstadt] überspringt).
// Lösungen: gc-86 [Ausstrahlung 7] · nexus-forschungsdaten oder nexus-chip-defekt vorzeigen · [Serenity ♥3] ·
// gc-87 [Technik 6] Termin in Alesas Kalender verschieben (Sybellas Tablet unter dem schlafenden Bijou → schwestern_ohne_chip).
// Belohnung: 260 XP, Ruf chrome-haus +20, chrome-einladung, schwestern_gewarnt (Seraphina nimmt trotzdem einen Chip,
// außer mit schwestern_ohne_chip; Sybella kappt im Finale den Partystrom für eine Runde).
// Frist: Tageswechsel-Regeln tee_frist_1 → _2 → tee_vorab_vorbei (Quest scheitert, Sybella schreibt).
import type { ContentPart } from '../../part';
import type { Condition, DialogueDef, DialogueNode, QuestDef } from '../../../modules/contracts';
import {
  active, all, any, byId, ch, COUNTDOWN, dlg, flag, hearts, herz, inactive, item, l, msg, n, noFlag, node, not, origin, p,
  phone, set, VEX, zeit,
} from './_lib';

const Q = 'side-teekraenzchen';
const SY = 'sybella-chrome';
const SE = 'seraphina-chrome';
const SR = 'serenity-chrome';
const AL = 'portier-albert';

const VORBEI = 'tee_vorab_vorbei';
const NOCH_ZEIT: Condition = noFlag(VORBEI);
const GETROFFEN = 'tee_sybella_getroffen';
const TEE = 'tee_tee_getrunken';
const GEWARNT = 'schwestern_gewarnt';
const OHNE_CHIP = 'schwestern_ohne_chip';
const GELOEST: Condition = any(flag(GEWARNT), flag(OHNE_CHIP));
const ABSCHIED = 'tee_abschied';
const BOULEVARD_OFFEN: Condition = any(item('ausweis-oberstadt'), { rep: 'chrome-haus', min: 20 }, flag('liftboy_ueberredet'));
const LADEN: Condition = zeit('tag');
const TEEZEIT: Condition = zeit('tag', 'abend');

const AUF_BOULEVARD = [{ travel: 'chrome-boulevard', entry: 'von-glasarkaden', minutes: 5 }] as const;

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: 'Das Teekränzchen',
  summary: 'Eine „diskrete Beraterin für Marktanalysen“ will wissen, was die Unterstadt von Chrome 10 hält. In drei Tagen lassen sich die Chrome-Schwestern bei der Vorabpräsentation live chippen. Werbewirksam. Tödlich langweilig. Und gefährlich.',
  giver: SY,
  act: 2,
  fail: flag(VORBEI),
  steps: [
    {
      id: 'zutritt', text: 'Komm auf den Chrome-Boulevard: Oberstadt-Ausweis, Ruf beim Chrome-Haus, Presseausweis, gute Kinderstube – oder der Liftboy am Panoramaaufzug lässt sich etwas einfallen (Keks-Lieferung?).',
      done: { visited: 'chrome-boulevard' }, marker: { map: 'glasarkaden', at: 'panoramaaufzug' },
    },
    {
      id: 'boutique', text: 'Triff die „diskrete Beraterin“ in der Boutique Chrome & Co. (tagsüber).',
      when: { visited: 'chrome-boulevard' }, done: flag(GETROFFEN), marker: { map: 'chrome-boulevard', at: 'boutique-chrome' },
    },
    {
      id: 'salon', text: 'Teekränzchen im Salon des Chrome-Penthouse: kleiner Finger hoch, Mund zu, Augen auf (tagsüber oder abends).',
      when: flag(GETROFFEN), done: flag(TEE), marker: { map: 'chrome-penthouse', at: 'salon' },
    },
    {
      id: 'warnen', text: 'Bring die Schwestern davon ab, sich bei der Vorabpräsentation chippen zu lassen.',
      when: flag(TEE), done: GELOEST, marker: { map: 'chrome-penthouse', at: 'salon' },
    },
    {
      id: 'kalender', optional: true, text: 'Optional: Sybellas Tablet liegt unter dem schlafenden Bijou. Wer Alesas Kalender umschreibt, sorgt dafür, dass keine Schwester einen Chip kriegt.',
      when: flag(TEE), done: flag(OHNE_CHIP), marker: { map: 'chrome-penthouse', at: 'sofa-bijou' },
    },
    {
      id: 'abschied', text: 'Lass dich von Sybella verabschieden. Sie rechnet noch.',
      when: GELOEST, done: flag(ABSCHIED), marker: { map: 'chrome-penthouse', at: 'salon' },
    },
  ],
  reward: { xp: 260, rep: { 'chrome-haus': 20 }, items: { 'chrome-einladung': 1 }, effects: [set(GEWARNT)] },
};

// ---------------------------------------------------------------------------------------------- Auftakt am Schrottmarkt

const verkleidet: DialogueDef = dlg('tee-sybella-verkleidet', [
  node('start', [
    n('Zwischen Akkuständen und Kabelkisten steht eine Frau mit Kopftuch, Sonnenbrille und einer Handtasche, die mehr kostet als der ganze Gang. Sie feilscht mit einem Händler um eine Schraube. Sie gewinnt.'),
    l(SY, 'Sie da. Ja, Sie. Sie sehen aus wie jemand, der weiß, was die Leute hier unten wirklich denken. Statistisch gesehen.', 'neutral'),
    l(SY, 'Ich bin … Beraterin. Diskret. Für Marktanalysen. Ich brauche eine ehrliche Meinung zu einem Produkt. Chrome 10. Honorar inklusive, Diskretion inklusive, Tee inklusive.', 'signatur'),
  ], {
    choices: [
      ch('„Chrome 10 macht aus Leuten Fußabtreter mit Lächeln. Da ist meine Meinung. Gratis.“', 'meinung'),
      ch('„Du bist Sybella Chrome. Die Handtasche hat ein Preisschild im Gesicht.“', 'erkannt'),
      ch('„Ich hab zu tun.“', 'spaeter'),
    ],
  }),
  node('meinung', [
    l(SY, 'Gratis? Niemand gibt etwas gratis. Das ist gegen jede Regel der Betriebswirtschaft.', 'ueberrascht'),
  ], { next: 'karte' }),
  node('erkannt', [
    l(SY, 'Psst! Sind Sie wahnsinnig? Hier kostet eine Dampfnudel achtzig Cent. Wenn die Händler wissen, wer ich bin, kostet sie neunzehn Credits.', 'wut'),
    l(SY, 'Gut. Ja. Ich bin es. Und genau deshalb brauche ich Sie.', 'besorgt'),
  ], { next: 'karte' }),
  node('karte', [
    l(SY, 'In drei Tagen ist die Vorabpräsentation. Meine Schwestern und ich lassen uns dort als Erste chippen. Live. Werbewirksam. Seraphinas Idee. Die Zahlen sagen: großartig.', 'neutral'),
    l(SY, 'Mein Bauch sagt etwas anderes. Und mein Bauch hat mich noch nie zwanzig Prozent zu viel bezahlen lassen.', 'besorgt'),
    n('Sie drückt dir eine Visitenkarte in die Hand. Rot, schwer, mit Goldrand. „Chrome & Co. – Boutique & Beratung. Chrome-Boulevard.“'),
    l(SY, 'Kommen Sie tagsüber in die Boutique. Wie Sie raufkommen, ist Ihr Problem. Ich rechne nur.', 'signatur'),
  ], { effects: [{ startQuest: Q }] }),
  node('spaeter', [
    l(SY, 'Zeit ist Geld. Ihres ist offenbar billig. Drei Tage. Dann ist es egal.', 'neutral'),
  ]),
]);

// ---------------------------------------------------------------------------------------------- Liftboy

const liftboy: DialogueDef = dlg('tee-liftboy', [
  node('start', [
    n('Der Liftboy am Panoramaaufzug trägt eine Uniform mit mehr Knöpfen als Gedanken. Er mustert dich von den Schuhen aufwärts und hört auf, als es ihm zu wehtut.'),
    n('„Der Aufzug fährt nur für Anwohner, Gäste und Lieferungen. Sie sind keins davon. Ich sehe so etwas.“'),
  ], {
    choices: [
      ch('Den Presseausweis zeigen. „NX-1. Reportage über … Aufzüge.“', 'presse', { when: item('presseausweis') }),
      ch('„Sei so gut und ruf oben an. Sag, ein Kind aus gutem Hause kommt zum Tee.“', 'oberstadt', { tag: '[Oberstadt]', when: origin('origin-oberstadt') }),
      ch('„Keks-Lieferung fürs Penthouse. Frisch. Für die Damen Chrome.“ (Dantes Kekse)', 'kekse', { when: item('dantes-kekse') }),
      ch('„Kurier. Paket für Chrome & Co. Unterschrift oben.“', 'kurier', { when: VEX }),
      ch('Achtzig Credits Trinkgeld in die Brusttasche stecken. „Für die Knöpfe.“', 'trinkgeld', { effects: [{ credits: -80 }] }),
      ch('„Schon gut. Ich nehm die Treppe.“ (Es gibt keine Treppe.)'),
    ],
  }),
  node('presse', [
    n('Er liest den Ausweis zweimal. Dann zupft er seine Uniform zurecht und lächelt in eine Kamera, die es nicht gibt.'),
    n('„Erwähnen Sie mich. Ferdinand. Mit F. Bitte nur von links fotografieren.“'),
  ], { effects: [...AUF_BOULEVARD] }),
  node('oberstadt', [
    n('Er sieht dich an, und irgendetwas an deiner Haltung macht, dass er sich verbeugt, bevor er es merkt. Hinterher ärgert er sich sichtbar.'),
    n('„Selbstverständlich. Grüßen Sie Ihre Frau Mutter.“'),
  ], { effects: [...AUF_BOULEVARD] }),
  node('kekse', [
    n('Du hältst ihm die Dose hin. Der Duft von Zimt und Dantes Ofen breitet sich in der Glaskabine aus. Der Liftboy schluckt.'),
    n('„Lieferungen ans Penthouse … sind gestattet.“ Er nimmt sich einen Keks. „Zur Qualitätskontrolle.“ Er nimmt sich einen zweiten. „Stichprobe.“'),
  ], { effects: [{ take: 'dantes-kekse' }, set('teekraenzchen_keks_lieferung'), ...AUF_BOULEVARD] }),
  node('kurier', [
    n('Du hältst ihm einen leeren Lieferschein unter die Nase, so schnell und so gelangweilt, wie nur jemand, der das zwanzigmal am Tag macht. Er unterschreibt, bevor er merkt, dass er gar nichts zu unterschreiben hat.'),
    n('„Lieferanten bitte nicht in die Spiegel schauen. Die sind für Anwohner.“'),
  ], { effects: [set('teekraenzchen_keks_lieferung'), ...AUF_BOULEVARD] }),
  node('trinkgeld', [
    n('Die Scheine verschwinden so schnell, dass du dich fragst, ob er Cyberware in den Fingern hat. Die Tür gleitet auf.'),
    n('„Willkommen in der Oberstadt. Atmen Sie flach, die Luft hier ist teuer.“'),
  ], { effects: [...AUF_BOULEVARD] }),
]);

// ---------------------------------------------------------------------------------------------- Boutique

const boutiqueDlg = (id: string, starten: boolean): DialogueDef => dlg(id, [
  node('start', [
    n('Chrome & Co. Weißer Marmor, rote Seide, Preisschilder, die man nur mit Sonnenbrille lesen kann. Hinter der Theke rechnet eine Frau mit Brille und einem Taschenrechner aus Gold. Dieselbe Frau wie auf dem Schrottmarkt. Ohne Kopftuch sieht sie teurer aus.'),
    l(SY, 'Pünktlich. Na ja. Fast. Ich ziehe Ihnen drei Prozent vom Honorar ab.', 'signatur'),
  ], {
    choices: [
      ch('„Diskrete Beraterin, ja? Sybella Chrome, Erfinderin von Chrome 10.“', 'name', { when: noFlag('tee_name_erkannt'), effects: [set('tee_name_erkannt')] }),
      ch('„Was willst du von mir wissen?“', 'auftrag'),
      ch('„Du hast doch sicher einen Gutschein für mich?“', 'gutschein', { tag: '[Oberstadt]', when: origin('origin-oberstadt'), once: true, id: 'tee-gutschein' }),
      ch('„Drei Prozent? Ich zieh dir gleich zehn ab. Wegen Stil.“', 'feilschen', { tag: '[Gosse]', when: origin('origin-gossenkind'), once: true, id: 'tee-gosse', effects: [herz(SY, 50)] }),
    ],
  }),
  node('name', [
    l(SY, 'Erfinderin ist ein großes Wort. Ich habe einen Rabatt erfunden. Zehn Prozent auf alles, wenn man sich einen Chip einsetzen lässt. Das war ein Geniestreich.', 'freude'),
    l(SY, 'Dachte ich. Dann habe ich die Rückgabequote gesehen. Sie liegt bei null. Null! Niemand gibt etwas zurück. Kein Kunde beschwert sich. Kein einziger.', 'besorgt'),
    l(SY, 'Wissen Sie, wie unnatürlich das ist? Ich habe noch nie einen Kunden gehabt, der sich nicht beschwert. ICH beschwere mich über alles.', 'wut'),
  ], { next: 'auftrag' }),
  node('gutschein', [
    l(SY, 'Natürlich. Ein Kind aus gutem Hause erkennt man daran, dass es nie den vollen Preis zahlt. Ich mag Sie. Ein bisschen. Um fünf Prozent.', 'freude'),
  ], { effects: [herz(SY, 20), { give: 'chrome-10-gutschein' }], next: 'auftrag' }),
  node('feilschen', [
    l(SY, 'Zehn? Für Stil? … Das ist ja Markenpiraterie! Wunderbar. Endlich jemand, der verhandelt, statt zu lächeln.', 'freude'),
  ], { next: 'auftrag' }),
  node('auftrag', [
    l(SY, 'Ich brauche jemanden, der meinen Schwestern ins Gesicht sagt, was da unten passiert. Jemand von unten. Seraphina hört mir nicht zu. Ich bin für sie ein Taschenrechner mit Lippenstift.', 'besorgt'),
    l(SY, 'Und Serenity hört niemandem zu, der keine Rosen in der Hand hat.', 'neutral'),
    l(SY, 'Heute ist Teekränzchen. Im Salon. Seraphina glaubt nur, was sie zwischen zwei Tassen hört. Benehmen Sie sich. Oder tun Sie es nicht, aber dann tun Sie es mit Absicht.', 'signatur'),
  ], {
    choices: [
      ch('„Was springt für mich raus?“', 'honorar'),
      ch('„Ich komm. Für den Tee. Und für die Leute unten.“', 'zusage'),
    ],
  }),
  node('honorar', [
    l(SY, 'Endlich eine vernünftige Frage. Eine Einladung zur Releaseparty. Echt, mit Siegel. Die kriegt man nicht mal mit Rabatt.', 'signatur'),
  ], { next: 'zusage' }),
  node('zusage', [
    l(SY, 'Albert weiß Bescheid. Penthouse, Salon. Und wenn Sie den Pudel wecken, rechne ich Ihnen den Therapeuten an.', 'neutral'),
  ], { effects: [...(starten ? [{ startQuest: Q }] : []), set(GETROFFEN), msg('Das Penthouse steht dir offen. Portier Albert ist informiert, leider.')] }),
]);
const boutique = boutiqueDlg('tee-boutique', false);
const boutiqueStart = boutiqueDlg('tee-boutique-start', true);

// ---------------------------------------------------------------------------------------------- Teekränzchen

const HALTUNG = { checkBuff: { id: 'tee-haltung', label: 'Haltung beim Tee', value: 1, attribute: 'ausstrahlung' as const, tags: ['etikette'], forDays: 0 } };

/** Das eigentliche Gespräch über Chrome 10 (im ersten Besuch und in der Fortsetzung). */
const themaNodes = (): DialogueNode[] => [
  node('thema', [
    l(SE, 'Nun. Sybella sagt, Sie hätten uns etwas über Chrome 10 mitzuteilen. Ich höre. Fünf Minuten. Der Tee wird kalt, und kalter Tee ist ein Zeichen von Schwäche.', 'neutral'),
  ], {
    choices: [
      ch('„Ein Produkt, das seine Kundschaft steuert, hat keine Kundschaft mehr, sondern Geiseln. Schlecht fürs Quartal.“', 'fakten', { check: 'gc-86' }),
      ch('Die Nexus-Forschungsdaten auf den Teetisch legen.', 'daten', { when: item('nexus-forschungsdaten') }),
      ch('Den zerbrochenen Nexus-Chip in Seraphinas Untertasse legen.', 'chip', { when: item('nexus-chip-defekt') }),
      ch('„Serenity. Erzähl deinen Schwestern, wie Blade mit dir redet, seit die Chips raus sind.“', 'serenity', { tag: '[Serenity ♥3]', requires: hearts(SR, 3) }),
      ch('Sybella zuzwinkern und auf den schlafenden Pudel deuten. (Ihr Tablet. Alesas Kalender.)', 'kalender-plan', { when: noFlag(OHNE_CHIP) }),
      ch('„Ihr seid drei reiche Schnepfen, die sich freiwillig das Hirn verkabeln lassen. Viel Spaß.“', 'raus'),
    ],
  }),
  node('fakten', [
    n('Stille. Eine Teetasse klirrt. Seraphina stellt sie sehr langsam ab, als hätte sie Angst, sie könnte sonst etwas sagen.'),
    l(SY, 'Geiseln zahlen nicht wiederholt. Geiseln empfehlen nicht weiter. Das … stimmt. Das stimmt sogar mathematisch.', 'ueberrascht'),
    l(SE, 'Wir verschenken nichts. Schon gar nicht unseren Verstand.', 'besorgt'),
  ], { next: 'gewarnt' }),
  node('daten', [
    n('Protokolle. Testpersonen. Fehlerraten. Sybella liest schneller als jeder Mensch, den du kennst. Ihr Gesicht wird mit jeder Seite eine Spur blasser, bis es zu den Wänden passt.'),
    l(SY, 'Fehlerrate dreizehn Prozent. Dreizehn Prozent Menschen, die „Master“ zu Blade sagen und dann nicht mehr aufhören. Das ist keine Fehlerrate. Das ist eine Belegschaft.', 'wut'),
    l(SR, 'Wie in Kapitel neunzehn. Als sich herausstellt, dass der Prinz die ganze Zeit … oh. Oh nein.', 'trauer'),
  ], { next: 'gewarnt' }),
  node('chip', [
    n('Der Chip klackt auf das Porzellan. Zwei Hälften, die nicht mehr miteinander reden. Seraphina beugt sich darüber wie über ein totes Insekt.'),
    p('Den hat Nexus selbst gesprengt. In einer Werkstatt in der Unterstadt. Mit zehn Sekunden Vorlauf. Fragt euch mal, warum ein Produkt einen Selbstzerstörungsknopf braucht.'),
    l(SE, 'Weil es Beweise vernichten will. Natürlich. Ich hätte es genauso gebaut.', 'besorgt'),
  ], { next: 'gewarnt' }),
  node('serenity', [
    l(SR, 'Er … er hat letzte Woche zu mir gesagt: „Wenn du erst gechippt bist, Schnuckelchen, musst du nie wieder entscheiden.“', 'trauer'),
    l(SR, 'Und ich dachte, das sei romantisch. Aber in keinem einzigen Roman will der Held, dass die Heldin nicht mehr entscheidet. Nicht in einem. Ich hab sie alle gelesen.', 'wut'),
    l(SY, 'Das ist das Klügste, was du je gesagt hast, Serenity.', 'ueberrascht'),
  ], { effects: [herz(SR, 40)], next: 'gewarnt' }),
  node('gewarnt', [
    l(SY, 'Ich sage den Termin ab. Für mich. Und für Serenity. Seraphina?', 'neutral'),
    l(SE, 'Eine Chrome kneift nicht. Wenn ich jetzt absage, sinkt die Aktie um neun Prozent. Ich lasse mich chippen. Lächelnd. Ich werde das Lächeln hassen.', 'signatur'),
    l(SY, 'Dann rechne ich für uns beide. Ich habe Zugriff auf die Stromversorgung der Party. Eine Runde Dunkelheit, wenn es drauf ankommt. Das ist in meinem Budget.', 'signatur'),
  ], { effects: [set(GEWARNT), herz(SY, 60), { xp: 40 }] }),
  node('kalender-plan', [
    n('Sybella folgt deinem Blick zum Sofa. Ihr Tablet. Darunter, oder vielmehr darauf: Bijou, eingerollt, ein Ohr zuckt im Traum.'),
    l(SY, '(leise) Alesas Termine laufen über mein Tablet. Wenn der Kalender sagt, die Chips sind nächste Woche … dann sind sie nächste Woche. Aber Bijou darf nicht aufwachen. Sie beißt. Mit Absicht.', 'besorgt'),
  ], { next: 'thema' }),
  node('raus', [
    n('Seraphina klingelt mit einem Silberglöckchen. Albert erscheint, als hätte er hinter der Tür gewartet. Er hat hinter der Tür gewartet.'),
    l(AL, 'Ich darf Sie zur Tür begleiten. Und durch sie hindurch. Und weiter.', 'neutral'),
    l(SY, '(zischt im Vorbeigehen) Morgen. Gleiche Zeit. Und dann mit Zahlen, nicht mit Schnepfen.', 'wut'),
  ], { effects: [set('heute_tee_rauswurf'), herz(SE, -40), { travel: 'chrome-boulevard', entry: 'von-chrome-penthouse' }] }),
];

const salon: DialogueDef = dlg('tee-salon', [
  node('start', [
    n('Der Salon des Chrome-Penthouse. Ein Raum so weiß, dass dein Schatten sich schämt. Drei Sessel, drei Farben: blau, rot, grün. Ein vierter Stuhl, eilig dazugestellt, aus Plexiglas. Deiner.'),
    n('Auf dem Sofa schläft ein Roboterpudel auf einem Tablet. Er schnarcht in Dur.'),
    l(SE, 'Das ist also die Stimme der Straße. Wie … authentisch. Setzen Sie sich. Nicht so. So. Ja. Fast.', 'neutral'),
    l(SR, 'Oh, wie aufregend! Ein Gast aus der Unterstadt! Wie in „Herz aus Chrom“, Kapitel sieben, als der Schornsteinfeger zum Ball kommt und alle Kronleuchter klirren!', 'freude'),
    l(SY, 'Kapitel sieben endet damit, dass er das Silber klaut, Serenity.', 'neutral'),
    n('Ein Butlerdroid schiebt einen Wagen herein. Sieben Gabeln. Vier Löffel. Eine Zange, deren Zweck niemand kennt. Das Teekränzchen beginnt.'),
  ], {
    choices: [
      ch('Haltung annehmen und mitspielen.', undefined, {
        effects: [{
          minigame: 'akt-etikette', level: 3, key: 'teekraenzchen-etikette', label: 'Teekränzchen bei den Chrome-Schwestern',
          win: [HALTUNG, herz(SE, 40), herz(SR, 20), set('tee_etikette_gut'), set(TEE), msg('Haltung bewahrt. Die Schwestern warten auf deine Meinung.')],
          lose: [set('tee_etikette_fauxpas'), set(TEE), msg('Fauxpas. Aber du sitzt noch. Die Schwestern warten auf deine Meinung.')],
        }],
      }),
      ch('Die Zange nehmen, ohne hinzusehen. Man lernt so etwas mit sechs.', 'oberstadt', { tag: '[Oberstadt]', when: origin('origin-oberstadt'), effects: [HALTUNG, herz(SE, 40), set('tee_etikette_gut')] }),
      ch('Die Tasse mit beiden Händen nehmen und schlürfen. Laut.', 'ruppig', { effects: [set('tee_etikette_ruppig'), herz(SR, 20)] }),
    ],
  }),
  node('oberstadt', [
    n('Zuckerzange, Kuchengabel, Tasse am Henkel, kleiner Finger auf halbmast. Seraphina hebt eine Augenbraue. Dann die zweite. Das ist bei ihr Applaus.'),
    l(SE, 'Sie wurden erzogen. Wie bedauerlich, dass Sie es weggeworfen haben.', 'signatur'),
  ], { next: 'warnen' }),
  node('ruppig', [
    n('Das Schlürfen hallt durch den Salon wie ein Abfluss in einer Kathedrale. Seraphina erstarrt. Sybella notiert etwas. Serenity kichert in ihre Serviette.'),
    l(SR, 'Wie verwegen! Wie in Kapitel zwölf, als der Pirat mit den Händen isst!', 'freude'),
    l(SE, 'Kapitel zwölf, Serenity, endet am Galgen.', 'wut'),
  ], { next: 'warnen' }),
  node('warnen', [], { effects: [set(TEE)], next: 'thema' }),
  ...themaNodes(),
]);

/** Fortsetzung: nach dem Minispiel (Reaktion einmal) oder bei einem weiteren Besuch. */
const salonWieder: DialogueDef = dlg('tee-salon-wieder', [
  node('start', [], {
    choices: [
      ch('Weiter.', 'gut', { when: all(flag('tee_etikette_gut'), noFlag('tee_reaktion')), id: 'tee-w-gut' }),
      ch('Weiter.', 'fauxpas', { when: all(flag('tee_etikette_fauxpas'), noFlag('tee_etikette_gut'), noFlag('tee_reaktion')), id: 'tee-w-fauxpas' }),
      ch('Weiter.', 'nochmal', { when: any(flag('tee_reaktion'), all(noFlag('tee_etikette_gut'), noFlag('tee_etikette_fauxpas'))), id: 'tee-w-nochmal' }),
    ],
  }),
  node('gut', [
    n('Die letzte Gabel liegt richtig, die letzte Bemerkung über das Wetter in der Oberstadt („stets heiter, nicht wahr?“) sitzt. Serenity klatscht. Seraphina nicht. Aber sie hört auf, auf deine Schuhe zu sehen.'),
    l(SE, 'Passabel. Für jemanden, der vermutlich mit einer Gabel geboren wurde, die man auch als Dietrich benutzen kann.', 'signatur'),
  ], { effects: [set('tee_reaktion')], next: 'thema' }),
  node('fauxpas', [
    n('Die Zuckerzange fliegt. Sie fliegt sehr schön, in einem silbernen Bogen, und landet auf dem Sofa. Auf Bijou. Bijou öffnet ein Auge. Ein rotes. Dann schließt sie es wieder. Alle atmen aus.'),
    l(SR, 'Wie in Kapitel drei! Der Fauxpas, der alles ins Rollen bringt!', 'freude'),
    l(SE, 'Kapitel drei, Serenity, ist das mit der Pest.', 'wut'),
  ], { effects: [set('tee_reaktion')], next: 'thema' }),
  node('nochmal', [
    n('Der Salon. Frischer Tee, frische Gabeln, dieselben drei Sessel. Seraphina sieht auf die Uhr, bevor du richtig sitzt.'),
    l(SE, 'Sie schon wieder. Gut. Dann hören wir uns die Fortsetzung an. Hoffentlich mit weniger Schlürfen.', 'neutral'),
  ], { next: 'thema' }),
  ...themaNodes(),
]);

// ---------------------------------------------------------------------------------------------- Tablet unter Bijou (gc-87)

const tablet: DialogueDef = dlg('tee-tablet', [
  node('start', [
    n('Bijou liegt auf dem Tablet wie eine Glucke auf einem sehr teuren Ei. Ihr Fell ist aus Chromfäden, ihre Krallen aus etwas, das man in der Unterstadt verbieten würde. Eine Ecke des Bildschirms schaut unter ihrem Bauch hervor.'),
  ], {
    choices: [
      ch('Mit zwei Fingern unter den Bauch, Kalender auf, Termin „Chrome 10 – Schwestern“ um eine Woche schieben.', 'geschafft', { check: 'gc-87' }),
      ch('Lieber nicht. Pudel mit roten Augen weckt man nicht.'),
    ],
  }),
  node('geschafft', [
    n('Bijou seufzt im Schlaf und rollt sich ein Stück zur Seite, genau so weit, dass du an den Kalender kommst. Du schiebst den Termin. Dann noch einen, aus Prinzip: „Blade – Maniküre“, auf drei Uhr morgens.'),
    n('Der Kalender synchronisiert sich mit Alesas Labor. Irgendwo im Spire piept ein Terminal und sagt ihr, die Chrome-Schwestern kämen erst nächste Woche. Bis dahin ist Party.'),
    l(SY, '(von hinten, ganz leise) Ich habe nichts gesehen. Ich habe es nur in meine Bücher geschrieben. Unter „Investition“.', 'freude'),
  ], { effects: [set(OHNE_CHIP), herz(SY, 30), { xp: 30 }] }),
]);

// ---------------------------------------------------------------------------------------------- Abschied

const abschied: DialogueDef = dlg('tee-abschied', [
  node('start', [
    n('Sybella begleitet dich bis zur Tür. Sie hat ihren goldenen Taschenrechner dabei. Er rechnet noch.'),
  ], {
    choices: [
      ch('Weiter.', 'ohne', { when: flag(OHNE_CHIP), id: 'tee-ab-ohne' }),
      ch('Weiter.', 'mit', { when: noFlag(OHNE_CHIP), id: 'tee-ab-mit' }),
    ],
  }),
  node('ohne', [
    l(SY, 'Keine von uns hat einen Termin. Seraphina tobt. Sie glaubt, Alesa hat sie vergessen. Sie hat Alesa einen Strauß Rosen mit einer Drohung geschickt.', 'freude'),
    l(SY, 'Ich habe ihr nicht gesagt, wer es war. Ich habe auch nicht gelogen. Ich habe nur geschwiegen. Schweigen ist steuerfrei.', 'signatur'),
  ], { next: 'einladung' }),
  node('mit', [
    l(SY, 'Seraphina nimmt trotzdem einen. Sie sagt, eine Chrome kneift nicht. Ich habe ihr gesagt, eine Chrome rechnet.', 'besorgt'),
    l(SY, 'Wenn es bei der Party ernst wird, kappe ich den Strom. Eine Runde. Mehr nicht. Ich will die Rechnung für den Rest nicht sehen.', 'signatur'),
  ], { next: 'einladung' }),
  node('einladung', [
    n('Sie legt dir einen Umschlag auf die Hand. Büttenpapier, Chrome-Siegel. Unverschämt schwer für ein Stück Papier.'),
    l(SY, 'Ihre Einladung. Echt. Nicht gefälscht, nicht rabattiert. Damit kommen Sie durch den Haupteingang wie jemand, der dort hingehört.', 'neutral'),
    l(SY, 'Und wenn Sie mal wieder ehrlich sein wollen: Ich zahle für Ehrlichkeit. Nicht viel. Aber pünktlich.', 'freude'),
  ], {
    choices: [
      ch('„Pass auf deine Schwester auf.“', 'ende'),
      ch('„Zehn Prozent Rabatt auf die nächste Ehrlichkeit?“', 'ende', { effects: [herz(SY, 20)] }),
    ],
  }),
  node('ende', [
    l(SY, 'Ich passe auf alles auf. Das ist mein Problem. Gehen Sie, bevor Bijou aufwacht.', 'neutral'),
  ], { effects: [set(ABSCHIED)] }),
]);

// ---------------------------------------------------------------------------------------------- Telefon

const phones = [
  phone('tee-anzeige', SY, 'ANZEIGE · Diskrete Beraterin für Marktanalysen sucht ehrliche Stimmen „von unten“ zu einem neuen Oberstadt-Produkt. Honorar. Tee. Diskretion. Chrome & Co., Chrome-Boulevard, tagsüber. Nur noch drei Tage.', {
    auto: all(COUNTDOWN, inactive(Q), NOCH_ZEIT),
    replies: [
      { text: '„Ich komm vorbei.“', effects: [{ startQuest: Q }] },
      { text: '(Ignorieren.)' },
    ],
  }),
  phone('tee-zu-spaet', SY, 'Vorabpräsentation war heute. Seraphina hat gelächelt wie ein Werbeplakat. Serenity auch. Ich habe nachgezählt: Sie haben siebenmal „Master“ gesagt. Zu MIR. Ich war nicht gechippt. Ich war nur feige. – S.', {
    auto: all(flag(VORBEI), { quest: Q, state: 'failed' }),
  }),
];

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: byId([verkleidet, liftboy, boutique, boutiqueStart, salon, salonWieder, tablet, abschied]),
  phone: byId(phones),
  daily: {
    // Reihenfolge zählt: erst die höchste Stufe, damit pro Morgen nur ein Schritt passiert.
    'tee-frist-3': { id: 'tee-frist-3', when: flag('tee_frist_2'), effects: [set('tee_frist_2', false), set(VORBEI)] },
    'tee-frist-2': { id: 'tee-frist-2', when: flag('tee_frist_1'), effects: [set('tee_frist_1', false), set('tee_frist_2')] },
    'tee-frist-1': {
      id: 'tee-frist-1', when: all(COUNTDOWN, noFlag('tee_frist_gestartet')),
      effects: [set('tee_frist_gestartet'), set('tee_frist_1')],
    },
  },
  mapAdditions: {
    schrottmarkt: {
      hotspots: [{
        id: 'tee-sybella-verkleidet', at: 'sybella-verkleidet', label: 'Frau mit zu teurer Handtasche', kind: 'talk',
        dialogue: verkleidet.id, when: all(COUNTDOWN, inactive(Q), NOCH_ZEIT, zeit('abend'), { weekday: ['di', 'sa'] }),
      }],
    },
    glasarkaden: {
      hotspots: [{
        id: 'tee-liftboy', at: 'panoramaaufzug', label: 'Liftboy am Panoramaaufzug', kind: 'talk', dialogue: liftboy.id,
        when: all(active(Q), not(BOULEVARD_OFFEN)),
      }],
    },
    'chrome-boulevard': {
      hotspots: [
        {
          id: 'tee-boutique-start', at: 'boutique-chrome', label: 'Sybella Chrome', kind: 'talk', dialogue: boutiqueStart.id,
          when: all(COUNTDOWN, inactive(Q), NOCH_ZEIT, LADEN),
        },
        {
          id: 'tee-boutique', at: 'boutique-chrome', label: 'Sybella Chrome (Beratung)', kind: 'talk', dialogue: boutique.id,
          when: all(active(Q), noFlag(GETROFFEN), LADEN),
        },
      ],
    },
    'chrome-penthouse': {
      hotspots: [
        {
          id: 'tee-salon', at: 'salon', label: 'Teekränzchen', kind: 'talk', dialogue: salon.id,
          when: all(active(Q), flag(GETROFFEN), noFlag(TEE), TEEZEIT, noFlag('heute_tee_rauswurf')),
        },
        {
          id: 'tee-salon-wieder', at: 'salon', label: 'Teekränzchen (Fortsetzung)', kind: 'talk', dialogue: salonWieder.id,
          when: all(active(Q), flag(TEE), not(GELOEST), TEEZEIT, noFlag('heute_tee_rauswurf')),
        },
        {
          id: 'tee-tablet', at: 'sofa-bijou', label: 'Sybellas Tablet (unter Bijou)', kind: 'use', dialogue: tablet.id,
          when: all(active(Q), flag(TEE), noFlag(OHNE_CHIP)),
        },
        {
          id: 'tee-abschied', at: 'salon', label: 'Sybella', kind: 'talk', dialogue: abschied.id,
          when: all(active(Q), GELOEST, noFlag(ABSCHIED)),
        },
      ],
    },
  },
};
