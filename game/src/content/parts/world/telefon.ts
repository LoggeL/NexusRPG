// Telefonnachrichten ohne Quest (world.md §10.5 „Telefonnachrichten“): Crew-Gruppenchat, Crew-Sprüche nach
// Fortschritt, Wetter und Herzen, Werbung, Kiki Karbon und ab Akt 2 die unbekannte Nummer.
// `auto` liefert jede Nachricht genau einmal, sobald die Bedingung gilt (modules/news duePhoneMessages).
// Absender ohne Kartenfigur (Gruppenchat, Werbung, unbekannte Nummer) sind schlanke NpcDefs ohne Laufblatt.
import type { NpcDef, PhoneMessageDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import {
  AKT1, AKT2, GRUENDERTAG, KARTEN_TURNIER, NEONNACHT, SCHROTTPARADE, VEX, WETTER_NEONSCHAUER, WETTER_ROSTREGEN, WETTER_SMOG,
  all, byId, day, done, flag, herz, msg, not, rep, sms,
} from './_w';

const CHAT = 'crew-chat';
const WERBUNG = 'werbung';
const UNBEKANNT = 'unbekannte-nummer';

const PROBEZEIT = done('main-1-probezeit');
const ARIA_ZUSAMMEN = flag('aria_romanze_zusammen');

// --------------------------------------------------------------------------------------------- Crew-Gruppenchat

const chat: PhoneMessageDef[] = [
  sms('tel-chat-willkommen', CHAT,
    'Hunter hat dich zu „CREW (nicht umbenennen)“ hinzugefügt. – Hunter: Neue Nummer. Benehmt euch. – Aria: wer ist das – Vega: Unser Neuzugang, Aria. Hat heute deinen Job gemacht. – Aria: … – Aria: willkommen. arschloch. – Nyra: HALLOOOO (Nyra hat einen Einhorn-Sticker gesendet. Dann noch einen. Dann elf.) – Dante: Gibt’s heute Kekse? Wer ist neu? Gibt’s Kekse für Neue?',
    PROBEZEIT, [
      { text: 'Hi. Ich bring Kekse mit.', effects: [herz('dante', 10), rep('crew-hunter', 1)] },
      { text: 'Aria, dein Job war offensichtlich zu schwer für dich.', effects: [herz('aria', 5), msg('Aria: …ok das war gut. aber pass auf.')] },
      { text: '(Chat stummschalten)' },
    ]),
  sms('tel-chat-plan-b', CHAT,
    'Vega: Plan B steht. – Hunter: Und Plan A? – Vega: Plan A auch noch nicht. – Aria: plan c: ich hau einfach drauf – Vega: Plan C ist immer dein Plan. – Aria: und er funktioniert IMMER',
    done('main-1-dexter'), [
      { text: 'Ich bin für Plan C.', effects: [herz('aria', 10)] },
      { text: 'Vega, ich helf dir mit Plan A.', effects: [herz('vega', 10)] },
    ]),
  sms('tel-chat-raven', CHAT,
    'Raven ist dem Chat wieder beigetreten. – Nyra: RAVEN!!!!!!!! – Dante: Raven! Ich hab dir einen Keks aufgehoben. Er ist eine Woche alt. Drei-Sekunden-Regel gilt pro Tag, oder? – Raven: Hallo. – Hunter: Ein Wort. Wie früher. Ich hab Gänsehaut.',
    done('main-1-raven'), [
      { text: 'Willkommen zurück, Raven.', effects: [herz('raven', 10)] },
      { text: 'Gilt die Drei-Sekunden-Regel pro Tag, Dante?', effects: [herz('dante', 5), msg('Dante: Pro Woche. Ich hab nachgerechnet.')] },
    ]),
  sms('tel-chat-dante', CHAT,
    'Dante: Ich hab euch was zu sagen. – Dante: … – Dante: Morgen. Ich sag’s morgen. – Vega: Dante. – Dante: Es ist nichts Schlimmes. Es ist nur … wichtig. Mit Hinterzimmer und so. – Aria: wenn du wieder einen schrottroboter adoptiert hast schwör ich',
    done('main-1-dante')),
  sms('tel-chat-hunter-vernuenftig', 'hunter',
    'Hast du heute schon was Vernünftiges gemacht? Nein? Gut. Komm in den Club. – H.',
    all(PROBEZEIT, { time: 'abend' }, { dayAtLeast: 3 }), [
      { text: 'Bin unterwegs.', effects: [herz('hunter', 5)] },
      { text: 'Ich hab heute sogar zweimal was Vernünftiges gemacht.', effects: [msg('Hunter: Lüg mich nicht an. Komm trotzdem.')] },
    ]),
  sms('tel-chat-dante-kekse', 'dante', 'Kekse fertig. Drei Sekunden. Komm schnell.',
    all(PROBEZEIT, { hearts: 'dante', min: 2 }, { time: ['morgen', 'abend'] }), [
      { text: 'Bin in zwei Sekunden da!', effects: [herz('dante', 10)] },
      { text: 'Die sind doch wieder angebissen.', effects: [msg('Dante: Nur einer. Pro Keks.')] },
    ]),
  sms('tel-chat-aria-boxsack', 'aria', 'Hab einen Boxsack gefunden. Er hat sich nicht gewehrt.',
    all(PROBEZEIT, { hearts: 'aria', min: 2 }), [
      { text: 'Feigling.', effects: [herz('aria', 10)] },
      { text: 'Wo ist der Boxsack jetzt?', effects: [msg('Aria: in der rohrsiedlung. teilweise.')] },
    ]),
  sms('tel-chat-nyra-welle', 'nyra', 'Hab eine Welle gemalt. Die ist so groß wie du!',
    all(PROBEZEIT, { hearts: 'nyra', min: 2 }), [
      { text: 'Zeig her!', effects: [herz('nyra', 10)] },
      { text: 'Ich bin aber größer als eine Welle.', effects: [msg('Nyra: Nicht diese Welle!!! Die hat Zähne!!!')] },
    ]),
  sms('tel-chat-vega-sterne', 'vega', 'Klarer Himmel heute Nacht. Dachterrasse. Nur wenn du still sein kannst.',
    all(PROBEZEIT, { hearts: 'vega', min: 3 }, { cycleDay: [1, 8, 15, 22] }), [
      { text: 'Ich kann still sein.', effects: [herz('vega', 10)] },
      { text: 'Ich kann es versuchen.', effects: [herz('vega', 5)] },
    ]),

  // Wetter (fester Zyklus, bis die Engine Wetter kennt)
  sms('tel-chat-smog', CHAT,
    'Raven: Smog. – Nyra: man sieht nix!!!! ich hab mich in der eigenen gasse verlaufen – Vega: Du stehst vor dem Club, Nyra. Ich seh dich vom Ausguck. – Nyra: STALKERIN',
    all(PROBEZEIT, WETTER_SMOG, { time: 'morgen' })),
  sms('tel-chat-rostregen', CHAT,
    'Hunter: Rostregen. Wer heute die Bar volltropft, wischt sie auch. – Aria: wer heute meine jacke volltropft, stirbt. – Dante: Ich hab einen Regenschirm gebaut! Er ist aus Toastern. Er ist schwer.',
    all(PROBEZEIT, WETTER_ROSTREGEN, { time: 'morgen' })),
  sms('tel-chat-neonschauer', CHAT,
    'Nyra: NEONSCHAUER HEUTE ABEND!!! die tags an den wänden leuchten, wer sammelt muss RAUS – Vega: Nicht aufs Dach bei Nässe. – Aria: doch',
    all(PROBEZEIT, WETTER_NEONSCHAUER, { time: ['morgen', 'tag'] })),

  // Feste
  sms('tel-chat-neonnacht', CHAT,
    'Hunter: Neonnacht. Doppelte Trinkgelder. Wer heute nicht hinterm Tresen steht, steht davor und zahlt. – Aria: ich tanz. wer nicht tanzt kriegt eine – Dante: Ich tanze! Ich hab geübt! Mit dem Kühlschrank!',
    all(PROBEZEIT, NEONNACHT, AKT1), [
      { text: 'Ich nehm eine Barschicht.', effects: [herz('hunter', 5)] },
      { text: 'Aria, ich tanz mit dir.', effects: [herz('aria', 10)] },
    ]),
  sms('tel-chat-turnier', CHAT,
    'Dante: STADTMEISTERSCHAFT EINS! HEUTE! IM CLUB! – Vega: Dante, du hast letztes Jahr den Tisch umgeworfen. – Dante: Der Tisch hat zuerst geworfen.',
    all(PROBEZEIT, KARTEN_TURNIER)),
  sms('tel-chat-gruendertag', 'vega',
    'Gründertag am Stufenplatz. Quantum-Leute überall. Halt dich bedeckt, iss die Häppchen, steck dir welche ein.',
    all(PROBEZEIT, GRUENDERTAG)),
  sms('tel-gustav-parade', 'opa-gustav',
    'HEUTE SCHROTTPARADE. Ich fahr den Kran. Wer drunter steht, ist selber schuld. Komm vorbei, Kind. – Gustav',
    SCHROTTPARADE, [{ text: 'Ich komme!', effects: [herz('opa-gustav', 10)] }]),

  // Vex × Aria: Die Crew merkt es (Strang world.md §4.7, Flags aus parts/vexaria). Andeutung, nie ausgeschrieben.
  sms('tel-chat-vexaria-waende', CHAT,
    'Hunter: Kurze Durchsage. Die Containerwand zwischen Quartier und Lager ist vier Millimeter Blech. – Hunter: Vier. – Dante: Ich hab Ohrstöpsel gekauft. Für alle. Liegen im Kühlschrank, weil da sonst nix liegt. – Nyra: wieso ohrstöpsel??? was war denn – Vega: Nichts, Nyra. – Aria: hört auf zu tippen. ALLE. – Raven: Glückwunsch.',
    all(VEX, ARIA_ZUSAMMEN, AKT1), [
      { text: 'Kein Kommentar.', effects: [rep('crew-hunter', 1)] },
      { text: 'Hunter, bau halt dickere Wände.', effects: [herz('aria', 15), msg('Aria: …ich mag dich. und jetzt halt die fresse.')] },
      { text: '(Den Chat für immer stummschalten. Für immer.)' },
    ]),
  sms('tel-chat-vexaria-jacke', 'nyra',
    'warum hat vex arias jacke an??? und warum hat aria vex’ jacke an??? habt ihr getauscht??? ich will auch tauschen!!!',
    all(VEX, ARIA_ZUSAMMEN, { dayAtLeast: 2 }, { time: 'morgen' }), [
      { text: 'Wir haben … getauscht. Genau.', effects: [herz('nyra', 5)] },
      { text: 'Frag Aria.', effects: [msg('Nyra: hab ich. sie hat mich in den müll gesetzt. liebevoll.')] },
    ]),
];

// --------------------------------------------------------------------------------------------- Kiki Karbon

const kiki: PhoneMessageDef[] = [
  sms('tel-kiki-taxi', 'kiki-karbon',
    'Kiki hier. Ab jetzt fliegst du mit mir. Taxistand Bahnhof Mitte, 20 Cr pro Fahrt, jede Zone, die du schon kennst. Regeln: nicht kotzen, nicht reden, nicht ans Lenkrad. Na gut, reden darfst du.',
    { hearts: 'kiki-karbon', min: 2 }, [
      { text: 'Deal. Ich kotz nur auf Rückflügen.', effects: [herz('kiki-karbon', 5)] },
      { text: 'Was kostet’s mit Reden?', effects: [msg('Kiki: 25. Mit Singen 40. Mit Schweigen umsonst, das gibt’s aber nie.')] },
    ]),
  sms('tel-kiki-rennen', 'kiki-karbon',
    'Quantum hat ’ne neue Lieferdrohne. Angeblich die schnellste der Stadt. ANGEBLICH. Heute Nacht, Neon-Gasse, Vorplatz. Bring Popcorn.',
    all({ hearts: 'kiki-karbon', min: 3 }, { time: ['abend', 'nacht'] })),
  sms('tel-kiki-smog', 'kiki-karbon',
    'Bei Smog flieg ich nach Gefühl. Mein Gefühl sagt: links. Mein Gefühl hatte schon drei Unfälle. Steig trotzdem ein.',
    all({ hearts: 'kiki-karbon', min: 2 }, WETTER_SMOG)),
];

// --------------------------------------------------------------------------------------------- Werbung

const werbung: PhoneMessageDef[] = [
  sms('tel-werbung-willkommen', WERBUNG,
    'WILLKOMMEN IN NOXIUS! Ihr Telefon wurde für 3.912 Werbepartner freigeschaltet. Abmelden? Haha. Nein.',
    { dayAtLeast: 1 }, [{ text: 'Abmelden.', effects: [msg('Abmeldung fehlgeschlagen. Neuer Werbepartner hinzugefügt.')] }]),
  sms('tel-werbung-pixelpalast', WERBUNG,
    'PIXELPALAST GLASARKADEN: Drohnenjagd, Neon-Schlange, Chipstapler! Heute: Plüschmöhre zu gewinnen! Nur für ordentlich Gekleidete. Und für Leute mit Credits. Vor allem für die.',
    { dayAtLeast: 2 }),
  sms('tel-werbung-kabelbrand', WERBUNG,
    'KABELBRAND – NEUE SHIRTS am Merch-Stand Schrottmarkt! Totenkopf, zwei Blitze, null Kompromisse. Riecht nach Bühne. (Wurde nie gewaschen.)',
    { dayAtLeast: 2 }),
  sms('tel-werbung-babette', 'babette-bao',
    'Babettes Garküche: Dampfkörbe, Nudeln, heute Fischbällchen. Montag Ruhetag. Wer drängelt, kriegt den Kochlöffel. – B.',
    all({ dayAtLeast: 3 }, not(day('mo')), { time: 'morgen' })),
  sms('tel-werbung-pixel', WERBUNG,
    'Fotoautomat FRÄULEIN PIXEL, Bahnhof Mitte: Passfotos, Ausweisfotos, „Ausweis“-Fotos. Diskretion inklusive. Abends und nachts geöffnet.',
    all({ dayAtLeast: 3 }, { time: ['abend', 'nacht'] })),
  sms('tel-werbung-quantum-party', 'quantum-werbung',
    'QUANTUM INDUSTRIES lädt ein: die größte Releaseparty aller Zeiten. Sie sind nicht eingeladen. Bleiben Sie trotzdem dran. – Ihr Quantum-Team',
    all(PROBEZEIT, AKT1)),
  sms('tel-werbung-ripper', 'ripper',
    'Frühlingsangebot bei Ripper: Augen, Arme, Beine – gebraucht wie neu. Herkunft? Unwichtig. Garantie? Lustig. Schrottmarkt, hinterer Durchgang.',
    { dayAtLeast: 4 }),
  sms('tel-werbung-chrome10', 'quantum-werbung',
    'CHROME 10 – jetzt GRATIS. Abholung an jedem Quantum-Stand. Sagen Sie Ja zur Ruhe. Sagen Sie Ja zu Quantum. Sagen Sie einfach Ja.',
    done('main-1-der-plan'), [
      { text: 'Nein.', effects: [msg('Ihre Antwort wurde als „Ja“ gewertet. Danke!')] },
      { text: 'Verpisst euch.', effects: [msg('Ihre Antwort wurde als „Ja, gern“ gewertet. Danke!')] },
    ]),
  sms('tel-werbung-flohmarkt', WERBUNG,
    'SONNTAG FLOHMARKT am Schrottmarkt, 10–17 Uhr. Eigener Stand gratis! Ware nicht gratis. Gute Laune nicht garantiert.',
    all(day('sa'), { dayAtLeast: 6 })),
];

// --------------------------------------------------------------------------------------------- Akt 2: unbekannte Nummer

const akt2: PhoneMessageDef[] = [
  sms('tel-unbekannt-upgrade', UNBEKANNT,
    'Möchtest du ein kostenloses Upgrade? Antworte mit „Ja, Master“.',
    AKT2, [
      { text: 'Ja, Master.', effects: [msg('Das Display flackert blau. Für eine Sekunde fühlt sich alles sehr, sehr ruhig an. Zu ruhig.')] },
      { text: 'Fick dich, Toaster.', effects: [rep('crew-hunter', 2), msg('Keine Antwort. Nur ein leises Summen im Lautsprecher.')] },
    ]),
  sms('tel-chat-akt2-collin', CHAT,
    'Vega: Hat noch jemand gesehen, wie Collin in der Sendung „Master“ gesagt hat? – Hunter: Gesehen. Getrunken. Vergessen. – Aria: ich hau jeden der master sagt. auch mich. – Raven: Wir reden heute Abend.',
    all(AKT2, { dayAtLeast: 2 })),
];

// --------------------------------------------------------------------------------------------- Absender ohne Kartenfigur

const npcs: NpcDef[] = [
  { id: CHAT, name: 'Crew-Chat', portrait: 'hunter', faction: 'crew-hunter', maxHearts: 1, bio: 'Gruppenchat „CREW (nicht umbenennen)“. Wurde elfmal umbenannt.' },
  { id: WERBUNG, name: 'Werbung', portrait: 'werbung', maxHearts: 1, bio: 'Lässt sich nicht abbestellen. Hat es nie. Wird es nie.' },
  { id: 'quantum-werbung', name: 'Quantum Industries', portrait: 'blade', faction: 'quantum', maxHearts: 1, bio: 'Wir denken an morgen. Sie müssen es nicht.' },
  { id: UNBEKANNT, name: 'Unbekannte Nummer', portrait: 'ki-nexus', maxHearts: 1, bio: 'Kein Absender. Nur ein blaues Flackern.' },
];

export const part: ContentPart = {
  phone: byId([...chat, ...kiki, ...werbung, ...akt2]),
  npcs: byId(npcs),
};
