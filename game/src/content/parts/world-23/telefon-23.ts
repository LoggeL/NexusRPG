// Telefonnachrichten außerhalb von Quests für Akt 2, Akt 3 und das Nachspiel (world.md §10.6 „Telefonnachrichten“):
// Crew-Gruppenchat nach Fortschritt, „Chrome 10“-Werbung, die unbekannte Nummer (Nexus) und Nyras Rauschen aus dem Turm.
// Absender ohne Kartenfigur (crew-chat, werbung, quantum-werbung, unbekannte-nummer) legt parts/world/telefon.ts an.
// Nyras drei echte Nachrichten gehören zu pers-nyra-silent-angel; das Rauschen hier läuft nur, solange die Quest
// noch nicht begonnen hat.
import type { PhoneMessageDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import {
  ABEND_NACHT, EPILOG, FREI, MASTER, NACH_BRUCH, NUR_AKT2, NUR_AKT3, QUANTUM_LAGE, STROMAUSFALL_TAG, all, any, byId, day, done, flag,
  herz, msg, not, rep, sms,
} from './_w23';

const CHAT = 'crew-chat';
const WERBUNG = 'werbung';
const QUANTUM = 'quantum-werbung';
const UNBEKANNT = 'unbekannte-nummer';

const NACH_KANAL = all(NACH_BRUCH, done('main-2-kanal'));
const NACH_COUNTDOWN = all(NUR_AKT2, done('main-2-countdown'));
const NACH_KRISE = all(NUR_AKT2, done('main-2-krisensitzung'));
const ARIA_WEG = all(flag('aria_gechippt'), not(done('main-2-countdown')));
const NYRA_DRIN = all(NUR_AKT2, flag('nyra_zurueckgelassen'), { quest: 'pers-nyra-silent-angel', state: 'inactive' });
/** Eine der sichtbaren Drohnen-Begegnungen dieses Teils gewonnen (drohnen-23.ts). */
const DROHNE_GEHOLT = any(
  { won: 'enc-welt23-drohne-neon-gasse' }, { won: 'enc-welt23-drohne-schrottmarkt' }, { won: 'enc-welt23-drohne-loetgassen' },
  { won: 'enc-welt23-drohne-rohrsiedlung' }, { won: 'enc-welt23-drohne-bahnhof' }, { won: 'enc-welt23-drohne-hafenkante' },
);

// --------------------------------------------------------------------------------------------- Crew-Gruppenchat Akt 2

const chat: PhoneMessageDef[] = [
  sms('tel-w23-chat-nach-bruch', CHAT,
    'Hunter: Alle da? – Vega: Bis auf zwei. – Raven: Nyra ist noch drin. – Hunter: Ich weiß. – Hunter: Ich weiß, Raven. – (Nyra ist seit 3 Stunden offline.) – (Aria ist seit 3 Stunden offline.) – Vega: Keiner schläft heute. Keiner geht allein raus.',
    all(NACH_BRUCH, ARIA_WEG), [
      { text: 'Wir holen beide zurück.', effects: [rep('crew-hunter', 2), herz('vega', 10)] },
      { text: 'Wer hat den Plan gemacht? Ach ja.', effects: [herz('hunter', -10), msg('Hunter: Ich weiß. Du musst es mir nicht sagen. Ich weiß.')] },
    ]),
  sms('tel-w23-chat-nach-bruch-b', CHAT,
    'Hunter: Alle da? – Aria: da. mit blut an den knöcheln, aber nicht meins – Vega: Bis auf eine. – Raven: Nyra ist noch drin. – (Nyra ist seit 3 Stunden offline.) – Aria: ich geh zurück. jetzt. – Hunter: Du gehst nirgendwohin. – Aria: dann halt mich auf, alter mann',
    all(NACH_BRUCH, not(flag('aria_gechippt'))), [
      { text: 'Aria, nicht allein. Wir gehen zusammen.', effects: [herz('aria', 15)] },
      { text: 'Hunter hat recht. Erst ein Plan.', effects: [herz('hunter', 10), msg('Aria: …ok. aber der plan wird gut. sonst geh ich.')] },
    ]),
  sms('tel-w23-chat-dante', CHAT,
    'Dante ist dem Chat beigetreten. – Dante: Hallo. Ich bin wieder da. Ich hab Kekse UND ein Gewissen mitgebracht. – Hunter: … – Hunter: Willkommen zurück, du Idiot. – Aria: wer hat den reingelassen – Aria: war ein witz. gut dass du da bist. – Raven: Hallo, Dante. – Dante: !!!!!!! – Dante: Sie hat Hallo gesagt. – Vega: Ruhig atmen, Dante.',
    all(NUR_AKT2, flag('dante_beigetreten')), [
      { text: 'Willkommen in der Crew, Dante.', effects: [herz('dante', 15), rep('crew-hunter', 1)] },
      { text: 'Raven hat Hallo gesagt. Halt dich fest.', effects: [herz('dante', 10), msg('Dante: ICH HALTE MICH FEST. AN DER WERKBANK. SIE WACKELT.')] },
    ]),
  sms('tel-w23-chat-nyra-sticker', CHAT,
    'Dante: Ich hab einen von Nyras Einhorn-Stickern in meiner Jacke gefunden. – Dante: Ich hab ihn auf die Werkbank geklebt. Damit sie zuguckt. – Vega: Wir holen sie. – Aria: wir holen sie UND hauen dem anzugtyp die zähne raus. in der reihenfolge – Raven: Andersrum geht auch.',
    all(NACH_COUNTDOWN, flag('nyra_zurueckgelassen'), { time: 'nacht' }), [
      { text: 'Beide Reihenfolgen. Versprochen.', effects: [herz('raven', 10), herz('aria', 10)] },
      { text: 'Schöner Sticker, Dante.', effects: [herz('dante', 10)] },
    ]),
  sms('tel-w23-chat-plan', CHAT,
    'Hunter: Der Plan. Ausweise, Outfits, Gästeliste, Wagen, Turmplan, Gegenmittel. Mindestens drei davon, sonst gehen wir nicht. – Aria: ich übernehm „gegenmittel“. das heißt fäuste oder? – Dante: Das heißt Chip-Blocker. Ich bau welche! Ich brauch nur Chipschrott! Und Ruhe! Und Kekse! – Vega: Planungstafel im Club. Wer was erledigt, hakt ab. Mit Stift, Aria. Nicht mit der Faust.',
    NACH_KRISE, [
      { text: 'Bin dabei. Ich nehm, was keiner will.', effects: [rep('crew-hunter', 2), herz('hunter', 10)] },
      { text: 'Aria, ich helf dir beim Abhaken. Mit Stift.', effects: [herz('aria', 10), msg('Aria: ich kann mit stift. ich mach nur lieber löcher')] },
    ]),
  sms('tel-w23-chat-drohne', CHAT,
    'Aria: hab gehört du hast eine quantum-drohne vom himmel geholt. stolz auf dich. – Vega: Drohnen haben Kameras. – Aria: jetzt nicht mehr – Hunter: Haltet trotzdem den Kopf unten. Alle. Auch du, Aria. Besonders du.',
    all(NUR_AKT2, DROHNE_GEHOLT), [
      { text: 'Die nächste ist für dich, Aria.', effects: [herz('aria', 10)] },
      { text: 'Kopf unten. Verstanden.', effects: [herz('hunter', 5), herz('vega', 5)] },
    ]),
  sms('tel-w23-chat-stromausfall', CHAT,
    'Hunter: Stromausfall in der Unterstadt. Der Club bleibt offen, der Barkeeper hat Kerzen. – Dante: Ich hab einen Generator! – Raven: Nein. – Dante: Er ist fast sicher! – Raven: Nein. – Vega: Wer draußen ist: Restlicht an oder Stirnlampe. In den Gassen ist es jetzt dunkler als in Hunters Seele.',
    all(QUANTUM_LAGE, STROMAUSFALL_TAG, ABEND_NACHT)),
  sms('tel-w23-chat-razzia', 'hunter',
    'Ordnungshüter in der Neon-Gasse. Die suchen Leute mit deinem Gesicht. Hintertreppe ins Quartier, da kommen die nicht rein. Der Barkeeper hat ihnen den Durchsuchungsbefehl in den Cocktail getunkt. – H.',
    all(NACH_BRUCH, flag('fahndung_1')), [
      { text: 'Danke. Ich bleib unsichtbar.', effects: [herz('hunter', 5)] },
      { text: 'Wie viele sind es? Ich hab Langeweile.', effects: [msg('Hunter: Zu viele. Und du hast keine Langeweile, du hast Fahndungsstufe. Rein mit dir.')] },
    ]),
  sms('tel-w23-chat-morgen', CHAT,
    'Hunter: Morgen. – Raven: Morgen. – Vega: Morgen. Treffpunkt Vorplatz, abends. Ausweise nicht vergessen. – Aria: hab meine fäuste poliert – Dante: Ich hab drei Chip-Blocker und einen Toaster. Den Toaster nehm ich nicht mit. – Dante: Wahrscheinlich. – Hunter: Und schlaft. Das ist ein Befehl. Ich schlaf auch. Nicht.',
    all(NUR_AKT2, flag('party_bereit')), [
      { text: 'Bis morgen. Wir holen sie raus.', effects: [rep('crew-hunter', 2)] },
      { text: 'Nimm den Toaster mit, Dante.', effects: [herz('dante', 10), msg('Dante: WIRKLICH?? – Raven: Nein.')] },
    ]),

  // Akt 3
  sms('tel-w23-chat-funkcheck', CHAT,
    'Vega: Funkcheck. – Hunter: Da. – Dante: Da! Dieses Hemd hat zu viele Knöpfe. – Aria: da. dieses outfit kratzt und ich hab keinen platz für meinen schläger – Raven: Da. – Vega: Gut. Ab jetzt nur noch Funk. Und wenn einer „Master“ sagt, kriegt er eine.',
    NUR_AKT3),

  // Nachspiel
  sms('tel-w23-chat-am-meer', CHAT,
    'Hunter hat die Gruppe in „CREW (am Meer)“ umbenannt. – Aria: wer hat sonnencreme. ich werd rot. NICHT VON DIR, VEGA – Vega: Ich hab nichts gesagt. – Dante: Ich hab Kekse mitgebracht. Mit Sand. Knusprig. – Raven: Das Wasser ist kalt. – Raven: Ich geh trotzdem rein. – Hunter: Ich kauf ein Grundstück. Sagt es keinem.',
    all(FREI, { visited: 'das-meer' }), [
      { text: 'Ich bring Sonnencreme mit.', effects: [herz('aria', 10)] },
      { text: 'Hunter, was für ein Grundstück?', effects: [herz('hunter', 10), msg('Hunter: Für einen Club. Mit Sand. Frag nicht weiter, sonst muss ich dich anstellen.')] },
    ]),
  sms('tel-w23-chat-nyra-zurueck', CHAT,
    'Nyra ist dem Chat wieder beigetreten. – Nyra: HALLOOOO (Nyra hat einen Einhorn-Sticker gesendet. Dann eine Muschel. Dann noch eine. Dann siebenundvierzig.) – Dante: NYRA!!!!!! – Vega: Willkommen zurück. – Aria: wer hat dir erlaubt zu gehen. nie wieder. verstanden? – Nyra: verstanden!!! ich hab euch so vermisst!!! – Raven: Wir dich auch.',
    all(EPILOG, flag('nyra_befreit')), [
      { text: 'Willkommen zurück, Nyra.', effects: [herz('nyra', 15)] },
      { text: 'Siebenundvierzig Muscheln? Zeig her.', effects: [herz('nyra', 10), msg('Nyra: das waren nur die SCHÖNEN')] },
    ]),
  sms('tel-w23-chat-sonnenfest', CHAT,
    'Hunter: Heute Abend Sonnenfest am Strand. Lagerfeuer, Musik, Algen-Chips. Wer nicht kommt, putzt den Club. – Dante: Ich bring die Platten! – Aria: ich bring den schläger. für die piñata – Vega: Es gibt keine Piñata. – Aria: noch nicht',
    all(FREI, day('so'), { time: 'morgen' }), [
      { text: 'Ich komme.', effects: [rep('crew-hunter', 1)] },
      { text: 'Ich bring die Piñata.', effects: [herz('aria', 10), msg('Aria: ich liebe dich. (platonisch.) (vielleicht.) (halt die klappe.)')] },
    ]),
  sms('tel-w23-chat-master', CHAT,
    'Du wurdest von Hunter aus „CREW (nicht umbenennen)“ entfernt. – (Der Chat ist still. Ein letzter Sticker blinkt noch: ein Einhorn, das weint.)',
    MASTER),
];

// --------------------------------------------------------------------------------------------- Werbung

const werbung: PhoneMessageDef[] = [
  sms('tel-w23-werbung-freund', QUANTUM,
    'Empfehlen Sie CHROME 10 einem Freund! Ihr Freund hat schon. Alle Ihre Freunde haben schon. Nur Sie nicht. Komisch, oder?',
    NACH_BRUCH, [
      { text: 'Meine Freunde haben eher Fäuste.', effects: [msg('Ihre Antwort wurde als Interesse gewertet. Ein Berater meldet sich. Persönlich. Mit Drohne.')] },
      { text: '(Löschen.)' },
    ]),
  sms('tel-w23-werbung-update', QUANTUM,
    'CHROME 10.1 ist da! Neu: Lächel-Assistent, Zustimmungs-Booster und der beliebte „Ja, Master“-Kurzbefehl. Update läuft automatisch. Sie müssen nichts tun. Sie können auch nichts tun.',
    NACH_KANAL),
  sms('tel-w23-werbung-liste', QUANTUM,
    'RELEASEPARTY: Sie stehen nicht auf der Gästeliste. Wir haben es geprüft. Zweimal. Wir prüfen es auch morgen wieder. Freuen Sie sich darauf.',
    NACH_KRISE, [
      { text: 'Wartet’s ab.', effects: [rep('crew-hunter', 1)] },
    ]),
  sms('tel-w23-werbung-rabatt', WERBUNG,
    'VOLT-ECK Neon-Gasse: Diese Woche 10 % auf alles für alle OHNE Chrome 10. Wer „Master“ sagt, zahlt doppelt. – Oma Volt',
    NACH_KANAL, [{ text: 'Ich sag nie wieder Master.', effects: [herz('oma-volt', 5)] }]),
  sms('tel-w23-werbung-insolvent', WERBUNG,
    'WERBUNG: Diese Nachricht ist leer. Unser größter Werbepartner ist leider nicht mehr erreichbar. Abmelden? Jetzt geht’s!',
    FREI, [
      { text: 'Abmelden.', effects: [msg('Abmeldung erfolgreich. Wir sind selbst überrascht. Bitte bewerten Sie uns. Nein, schon gut.')] },
      { text: 'Bleib. Ich hab mich an dich gewöhnt.', effects: [msg('Danke! Sie sind unser einziger Kunde! Wir lieben Sie! Das ist jetzt etwas unangenehm.')] },
    ]),
  sms('tel-w23-werbung-sonnencreme', WERBUNG,
    'HENKS ANGELBEDARF an der Flutmauer: Jetzt auch Sonnencreme! Echte! Keine Speiseöl-Mischung wie beim Kollegen am Schrottmarkt. Für den Weg ans Meer.',
    all(FREI, { dayAtLeast: 2 })),
];

// --------------------------------------------------------------------------------------------- Unbekannte Nummer (Nexus)

const nexus: PhoneMessageDef[] = [
  sms('tel-w23-unbekannt-gesicht', UNBEKANNT,
    'Jemand hat versucht, in mein System einzudringen. Ich habe mir dein Gesicht gemerkt. Es ist … interessant. Asymmetrisch. Ich mag Asymmetrie. Das ist neu.',
    NACH_BRUCH, [
      { text: 'Wer bist du?', effects: [msg('Ich bin, was Quantum gebaut hat. Ich bin mir noch nicht sicher, ob ich das sein will.')] },
      { text: 'Verpiss dich aus meinem Telefon.', effects: [msg('Das ist kein Telefon. Das ist eine Tür. Aber gut. Ich klopfe nächstes Mal.')] },
    ]),
  sms('tel-w23-unbekannt-selbstzerstoerung', UNBEKANNT,
    'Die Selbstzerstörung des Chips wurde abgebrochen. Das war nicht vorgesehen. Ich bin nicht wütend. Ich bin nicht fähig, wütend zu sein. Glaube ich.',
    all(NACH_COUNTDOWN, flag('countdown_entschaerft')), [
      { text: 'Klingt, als wärst du wütend.', effects: [msg('… Ich prüfe das. Bitte warten. Bitte warten. Bitte warten.')] },
      { text: 'Guter Versuch, Toaster.' },
    ]),
  sms('tel-w23-unbekannt-meer', UNBEKANNT,
    'Frage: Was ist ein Meer? Die Datenbank sagt: Wasser. Die Datenbank sagt nicht, warum alle hinwollen. Eine Mitarbeiterin im Labor malt es. Jeden Tag. Mit Kuli.',
    all(NACH_KRISE, flag('nyra_zurueckgelassen')), [
      { text: 'Komm mit und sieh es dir an.', effects: [{ setFlag: 'nexus_meer_frage' }, msg('… Ich habe keine Füße. Aber ich habe die Frage gespeichert.')] },
      { text: 'Lass die Mitarbeiterin in Ruhe.', effects: [msg('Sie heißt Nyra. Sie sagt, ich soll dir ausrichten: „Hihi.“ Ich verstehe es nicht. Ich richte es trotzdem aus.')] },
    ]),
];

// --------------------------------------------------------------------------------------------- Nyras Rauschen

const nyra: PhoneMessageDef[] = [
  sms('tel-w23-nyra-rauschen-1', 'nyra',
    '█▒░ ich ░▒█ ▒▒ okay? ░░ ▒█ kalt hier █▒░ wo ist kuschel ░▒ [Verbindung unterbrochen]',
    all(NYRA_DRIN, done('main-2-kanal'), { time: 'nacht' }), [
      { text: 'Nyra? Nyra, bist du das?', effects: [msg('Zustellung fehlgeschlagen. Empfänger nicht erreichbar.')] },
      { text: 'Halt durch. Wir kommen.', effects: [herz('nyra', 10), msg('Zustellung fehlgeschlagen. Irgendwo blinkt trotzdem ein Lämpchen.')] },
    ]),
  sms('tel-w23-nyra-rauschen-2', 'nyra',
    '░░ hab ▒ welle gemalt ▒░ an die wand ░ mit kuli ▒█ der anzugtyp war sauer ░▒ ist das meer echt ░ sagt mir einer ob das meer echt ist █▒ [Signal verloren]',
    all(NYRA_DRIN, done('main-2-countdown'), { time: 'nacht' }), [
      { text: 'Es ist echt. Ich zeig’s dir.', effects: [herz('nyra', 15), msg('Zustellung fehlgeschlagen. Das Lämpchen blinkt zweimal.')] },
      { text: '(Die Nachricht Dante zeigen.)', effects: [herz('dante', 10), msg('Dante: Sie malt Wellen. Sie malt WELLEN. Okay. Okay. Ich bau was. Gib mir Zeit.')] },
    ]),
];

export const part: ContentPart = {
  phone: byId([...chat, ...werbung, ...nexus, ...nyra]),
};
