// Nachrichten nach Fortschritt (world.md §10.5): NX-1 mit Collin und Delya, Radio Rost mit Opa Funk,
// Quantum-Spots mit Blade auf dem Stadt-TV, Kurzmeldungen nach Nebenquests, Wochen- und Festtagsmeldungen.
//
// Rangfolge der Engine (modules/news): ungesehen vor gesehen, dann priority, dann später im Inhalt.
//   6 Aktwechsel · 4 Hauptquest-Meldungen · 3 Nebenquest-Meldungen · 2 Fest/Wochentag · 1 Blade-Spots · 0 Kurzmeldungen
// Schon belegt: news-main-1-raven (quest-main-b, 3), news-main-1-der-plan (quest-main-b, 5).
// Enden (Ende 1–3) und main-2-countdown fehlen noch: Akt-2/3-Quests und End-Flags existieren nicht (gaps/world.md).
import type { NewsDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import {
  AKT1, AKT2, AKT3, GRUENDERTAG, KARTEN_TURNIER, NEONNACHT, SCHROTTPARADE, WETTER_KLAR, WETTER_NEONSCHAUER,
  WETTER_ROSTREGEN, WETTER_SMOG, all, any, byId, cycle, day, done, nar, say, sendung,
} from './_w';

const C = 'collin-charleston';
const D = 'delya-delloraine';
const K = 'kameramann';
const FUNK = 'opa-funk';
const BLADE = 'blade';

// --------------------------------------------------------------------------------------------- NX-1 Hauptmeldungen

const nx1: NewsDef[] = [
  sendung('news-prolog-digitech', 'Digitech ist pleite', [
    say(D, 'Guten Abend, Noxius. Digitech meldet Insolvenz. Quantum Industries übernimmt freundlich.', 'neutral'),
    say(C, 'Sehr freundlich. Die Wachleute haben beim Übernehmen sogar gelächelt. Glaube ich. Die hatten Helme auf.', 'freude'),
    say(D, 'Die Belegschaft war für eine Stellungnahme nicht erreichbar. Die Belegschaft war generell nicht erreichbar.', 'besorgt'),
  ], { quest: 'main-0-digitech', state: 'done' }, 0),

  sendung('news-act1-start', 'Die größte Releaseparty aller Zeiten', [
    say(C, 'Noxius, haltet eure Implantate fest! Quantum kündigt die größte Releaseparty aller Zeiten an!', 'freude'),
    say(D, 'Gäste: alle, die zählen. Wer nicht zählt, darf zuschauen. Im Fernsehen. Bei uns.', 'signatur'),
    say(C, 'Ich bin eingeladen. Ich zähle. Ich zähle sogar bis zehn, wenn es sein muss.', 'freude'),
    say(D, 'Collin, das war live.', 'neutral'),
  ], AKT1, 2),

  sendung('news-main-1-probezeit', 'Höflichkeit im High Voltage', [
    say(D, 'Schlägerei im High Voltage? Augenzeugen berichten von einer neuen, sehr höflichen Person.', 'ueberrascht'),
    say(C, 'Höflich? Im High Voltage? Da wird man sonst mit dem Barhocker begrüßt. Und mit dem zweiten verabschiedet.', 'ueberrascht'),
    say(D, 'Der Türsteher bestätigt: „Die hat Bitte gesagt. Dann hat sie zugeschlagen. Aber vorher Bitte.“', 'freude'),
  ], done('main-1-probezeit'), 4),

  sendung('news-main-1-dexter', 'Das Wunder der Lötgassen', [
    say(C, 'Eilmeldung aus dem Schrottmarkt: Ein Schuldner zahlt! Freiwillig!', 'ueberrascht'),
    say(D, 'Experten sprechen vom Wunder der Lötgassen. Dexter selbst sagt nur: „Ich hatte eh vor zu zahlen. Irgendwann. Heute zum Beispiel.“', 'neutral'),
    say(C, 'Dexter, wenn du zuschaust: Ich hab noch deinen Schraubenschlüssel. Ich geb ihn nicht zurück.', 'signatur'),
  ], done('main-1-dexter'), 4),

  sendung('news-alte-gewohnheiten', 'Einbruch bei den Chromes?', [
    say(D, 'Einbruch im Chrome-Penthouse? Die Familie Chrome dementiert.', 'besorgt'),
    say(C, 'Zitat: „Uns fehlt nichts. Außer Geschmack bei den Tätern. Wer malt denn Vögel auf Spiegel?“', 'freude'),
    say(D, 'Der Ordnungsdienst ermittelt. Der Ordnungsdienst hat eine Taube festgenommen. Die Taube schweigt.', 'neutral'),
  ], done('side-alte-gewohnheiten'), 4),

  sendung('news-act2-start', 'Innere Ruhe für alle', [
    say(D, 'Erste Chrome-10-Nutzer berichten von „innerer Ruhe“ und dem Wunsch, „Master“ zu sagen.', 'neutral'),
    say(C, 'Ich hab’s auch probiert. Es ist wie Urlaub im Kopf, Master.', 'freude'),
    nar('Delya schaut Collin sehr lange an. Die Regie blendet zum Wetter über. Das Wetter ist leer.'),
  ], AKT2, 6),

  sendung('news-act3-start', 'Live von der Releaseparty', [
    say(C, 'Wir sind live von der Releaseparty! Heute zeigt Nexus allen Gästen die Zukunft!', 'freude'),
    say(D, 'Und allen anderen auch. Ob sie wollen oder nicht. Bleiben Sie dran. Sie haben eh keine Wahl.', 'besorgt'),
  ], AKT3, 6),
];

// --------------------------------------------------------------------------------------------- Radio Rost

const radio: NewsDef[] = [
  sendung('news-rost-act1', 'Radio Rost: 30 Grad im Schatten', [
    say(FUNK, 'Hier ist Radio Rost, der einzige Sender, der noch mit Röhren und Wut läuft. Heute wieder 30 Grad im Schatten.'),
    say(FUNK, 'Schatten gibt’s leider keinen. Der wurde letzte Woche von den Rostzähnen geklaut. Und jetzt: Polka.'),
  ], AKT1, 1),
  sendung('news-rost-probezeit', 'Radio Rost grüßt die Neuen', [
    say(FUNK, 'Grüße an die Neuen bei Hunter. Haltet die Ohren steif und die Fäuste locker. Oder umgekehrt, ich verwechsel das immer.'),
  ], done('main-1-probezeit'), 3),
  sendung('news-rost-rabe', 'Radio Rost: Ein Rabe in der Oberstadt', [
    say(FUNK, 'Ein Rabe in der Oberstadt? Opa Funk sagt: Die kommen immer zurück. Wie Schulden. Und Herpes.'),
  ], done('side-alte-gewohnheiten'), 3),
  sendung('news-rost-gratis', 'Radio Rost: Was nix kostet', [
    say(FUNK, 'Gratis-Chips für alle? Opa Funk sagt: Was nix kostet, kostet am Ende alles. Und zwar dich.'),
    say(FUNK, 'Ich bleib bei meinem Röhrenradio. Das sagt mir wenigstens nicht, was ich denken soll. Nur, was ich hören soll.'),
  ], done('main-1-der-plan'), 4),
  sendung('news-rost-act2', 'Radio Rost: Chor aus Toastern', [
    say(FUNK, 'Komische Stimmen auf Kanal 9. Klingt wie ein Chor aus Toastern. Ein Toaster sagt „Master“. Ich hab ihn ausgesteckt.'),
  ], AKT2, 5),
  sendung('news-rost-act3', 'Radio Rost: Funkstille', [
    nar('Rauschen. Eine Platte mit Sprung. Dann wieder Rauschen. Irgendwo dahinter atmet jemand und hält die Antenne fest.'),
  ], AKT3, 5),
];

// --------------------------------------------------------------------------------------------- Blade auf dem Stadt-TV

const blade: NewsDef[] = [
  sendung('news-blade-spot-zukunft', 'Werbung: Quantum denkt an morgen', [
    say(BLADE, 'Ich bin Blade Nocturne. Quantum Industries denkt an morgen. Sie müssen es nicht.', 'signatur'),
    say(BLADE, 'Lehnen Sie sich zurück. Die Zukunft ist schon bezahlt. Von Ihnen. Rückwirkend.', 'neutral'),
  ], AKT1, 1),
  sendung('news-blade-spot-party', 'Werbung: Die Gästeliste', [
    say(BLADE, 'Die Releaseparty. Ein Abend, an den sich die Stadt erinnern wird. Dafür sorgen wir.', 'signatur'),
    say(BLADE, 'Sie stehen nicht auf der Liste? Keine Sorge. Wir wissen trotzdem, wo Sie wohnen.', 'freude'),
  ], any(done('main-1-probezeit'), { dayAtLeast: 3 }), 1),
  sendung('news-blade-spot-glas', 'Werbung: Glasarkaden', [
    say(BLADE, 'Die Glasarkaden. Einkaufen, wo das Licht sauber ist. Drehkreuz bitte nur mit ordentlicher Kleidung passieren.', 'neutral'),
    say(BLADE, 'Unterstadt-Bewohner sind herzlich willkommen. Am Lieferanteneingang. Mit Ware.', 'signatur'),
  ], { visited: 'stufenplatz' }, 1),
  sendung('news-blade-spot-chrome10', 'Werbung: Chrome 10', [
    say(BLADE, 'Chrome 10. Für alle. Gratis. Weil Sie es verdient haben.', 'freude'),
    say(BLADE, 'Nebenwirkungen: Ruhe. Zufriedenheit. Gelegentliche Höflichkeit gegenüber Vorgesetzten. Sagen Sie Ja.', 'signatur'),
  ], done('main-1-der-plan'), 2),
];

// --------------------------------------------------------------------------------------------- Kurzmeldungen

const kurz: NewsDef[] = [
  sendung('news-kurz-pudel', 'Pudel gewinnt zum elften Mal', [
    say(D, 'Pudel in der Oberstadt gewinnt Schönheitswettbewerb zum elften Mal. Die Konkurrenz: weitere Pudel.', 'neutral'),
    say(C, 'Ich war auch angemeldet. Ich bin Zwölfter. Hinter einem Pudel mit Brille.', 'trauer'),
  ]),
  sendung('news-kurz-gully', 'Gully dementiert', [
    say(C, 'Bürgermeister Gully weist Gerüchte zurück, er sei „nur ein Mann mit Krone im Abwasser“.', 'neutral'),
    say(D, 'Zitat Gully: „Ich bin ein Mann mit Krone im Abwasser UND einem Rattenrat. Das ist ein Unterschied.“', 'freude'),
  ]),
  sendung('news-kurz-tilda', 'Rennen in Halle 9', [
    say(D, 'Rennen in Halle 9: Turbo-Tilda siegt. Zweiter ist ein Einkaufswagen. Dritter ein anderer Einkaufswagen.', 'neutral'),
  ]),
  sendung('news-kurz-laterne', 'Laterne gestohlen', [
    say(C, 'In der Neon-Gasse wurde eine Laterne gestohlen. Sie war festgeschraubt. Die Polizei bewundert die Arbeit.', 'ueberrascht'),
  ]),
  sendung('news-kurz-suppe', 'Suppenküche meldet Suppe', [
    say(D, 'Die Suppenküche der Rohrsiedlung meldet: Heute gibt es Suppe. Gestern gab es auch Suppe. Mutter Brühe: „Und morgen? Rate mal.“', 'freude'),
  ]),
  sendung('news-kurz-xion', 'Neuer Werbestand in der Neon-Gasse', [
    say(C, 'In der Neon-Gasse steht ein neuer Werbestand von Quantum. Der Mann dahinter lächelt. Ununterbrochen. Seit drei Tagen.', 'besorgt'),
  ], { dayAtLeast: 2 }),
];

// --------------------------------------------------------------------------------------------- Wetter (Stadtwetter des Tages)

const wetter: NewsDef[] = [
  sendung('news-wetter-smog', 'Wetter: Smog', [
    say(D, 'Das Wetter: dichter Smog über der Unterstadt. Sichtweite eine Armlänge. Bitte nicht in fremde Arme laufen.', 'neutral'),
    say(C, 'Die Luft schmeckt heute nach Montag. Auch wenn keiner ist.', 'trauer'),
  ], WETTER_SMOG),
  sendung('news-wetter-neonschauer', 'Wetter: Neonschauer', [
    say(D, 'Gegen Abend Neonschauer. Die Neon-Tags an den Wänden leuchten heute heller als sonst – wer sammelt, sollte raus.', 'freude'),
    say(C, 'Smogfreiheit am Wochenende bleibt fraglich. Meine Frisur auch.', 'besorgt'),
  ], WETTER_NEONSCHAUER),
  sendung('news-wetter-rostregen', 'Wetter: Rostregen', [
    say(D, 'Rostregen, ganztägig. Regenschirme auf, Garküchen voll, Angler glücklich. Der Fang ist heute deutlich besser.', 'neutral'),
  ], WETTER_ROSTREGEN),
  sendung('news-wetter-klar', 'Wetter: Klar', [
    say(D, 'Klare Sicht bis zum Meer. An der Flutmauer wird es voll. Nachts gute Sicht auf die Sterne – zumindest auf die, die nicht Werbung sind.', 'freude'),
  ], WETTER_KLAR),
];

// --------------------------------------------------------------------------------------------- Woche und Feste

const woche: NewsDef[] = [
  sendung('news-woche-collin-live', 'Heute 12 Uhr: Collin live', [
    say(C, 'Heute um zwölf bin ich live am Stufenplatz! Kommt vorbei, winkt in die Kamera, aber nicht zu doll. Ich bin der Star.', 'freude'),
    say(K, '… und bringt keine Schilder mit Rechtschreibfehlern mit. Ich muss die dann rausschneiden.', 'neutral'),
  ], all(day(['mo', 'mi', 'fr']), { time: ['morgen', 'tag'] }), 2),
  sendung('news-woche-karaoke', 'Heute: Karaoke im High Voltage', [
    say(C, 'Heute Nacht Karaoke im High Voltage! Wer „Kabelbrand“ singt, singt auf eigene Gefahr. Der Barhocker fliegt nicht von allein.', 'freude'),
  ], day(['di', 'fr']), 2),
  sendung('news-woche-bagatell', 'Mittwoch: Bagatellgericht', [
    say(D, 'Mittwochs von zehn bis vierzehn tagt im Eisenhof das Bagatellgericht. Heute auf der Liste: ein Toaster. Er plädiert auf unschuldig.', 'neutral'),
    say(C, 'Ich glaube ihm. Der hat ehrliche Schlitze.', 'freude'),
  ], all(day('mi'), { time: ['morgen', 'tag'] }), 2),
  sendung('news-woche-eins', 'Donnerstag: Eins! bei Dante', [
    say(D, 'Donnerstagabend wird in Dantes Werkstatt wieder Eins! gespielt. Eine Zuschauerin berichtet von Keksen, Tränen und einer umgeworfenen Lötstation.', 'freude'),
  ], day('do'), 2),
  sendung('news-woche-flohmarkt', 'Sonntag: Flohmarkt', [
    say(D, 'Sonntag ist Flohmarkt auf dem Schrottmarkt, zehn bis siebzehn Uhr. Heute ist alles antik. Seit gestern.', 'freude'),
    say(C, 'Ich verkaufe meine alten Perücken. Gebraucht, aber mit Charakter.', 'signatur'),
  ], all(day('so'), { time: ['morgen', 'tag'] }), 2),

  sendung('news-fest-neonnacht', 'Neonnacht in der Unterstadt', [
    say(C, 'Heute ist Neonnacht! Die ganze Unterstadt leuchtet, die Bars zahlen doppelte Trinkgelder, und ich trage Glitzer. Freiwillig!', 'freude'),
    say(D, 'Feiern Sie in der Neon-Gasse. Feiern Sie verantwortungsvoll. Feiern Sie nicht auf dem Dach. Wir meinen dich, Unterstadt.', 'signatur'),
  ], all(NEONNACHT, AKT1), 2),
  sendung('news-fest-neonnacht-vorschau', 'Am Sonntag: Neonnacht', [
    say(C, 'Sonntag ist Neonnacht! Leuchtfarbe kaufen, Tanzschuhe putzen, Ausreden für Montag üben.', 'freude'),
  ], cycle(5, 6), 1),
  sendung('news-fest-karten-turnier', 'Stadtmeisterschaft Eins!', [
    say(D, 'Heute Abend: die Stadtmeisterschaft Eins! im High Voltage. Antreten darf jede und jeder mit einem Kartenspiel und ohne Ärmel.', 'neutral'),
    say(C, 'Letztes Jahr gewann ein Kind mit nur Plus-Vier-Karten. Seitdem nennt man es „die Schlächterin“.', 'ueberrascht'),
  ], KARTEN_TURNIER, 2),
  sendung('news-fest-karten-vorschau', 'Am Sonntag: Stadtmeisterschaft Eins!', [
    say(D, 'Sonntag Stadtmeisterschaft Eins! im High Voltage. Üben Sie. Und sagen Sie rechtzeitig „Eins!“.', 'neutral'),
  ], cycle(12, 13), 1),
  sendung('news-fest-gruendertag', 'Gründertag am Stufenplatz', [
    say(C, 'Heute ist Gründertag! Quantum feiert sich am Stufenplatz, und ich bin live! Gratis-Häppchen für alle, die nicht drängeln.', 'freude'),
    say(D, 'Wer genau gegründet wurde, konnte uns bis Redaktionsschluss niemand sagen. Die Häppchen sind trotzdem gut.', 'neutral'),
  ], GRUENDERTAG, 2),
  sendung('news-fest-gruendertag-vorschau', 'Am Sonntag: Gründertag', [
    say(C, 'Sonntag ist Gründertag am Stufenplatz. Ich moderiere. Bitte klatschen, wenn das Schild „Klatschen“ leuchtet.', 'freude'),
  ], cycle(19, 20), 1),
  sendung('news-fest-schrottparade', 'Die Schrottparade', [
    say(D, 'Heute zieht die Schrottparade über den Schrottmarkt. Schrottbots, Konfetti, Opa Gustav am Kran und ein Wagen, der hoffentlich bremst.', 'freude'),
    say(C, 'Der Ordnungsdienst rät: Zehen einziehen. Die Bots lieben Zehen.', 'besorgt'),
  ], SCHROTTPARADE, 2),
  sendung('news-fest-schrottparade-vorschau', 'Am Sonntag: Schrottparade', [
    say(D, 'Sonntag Schrottparade auf dem Schrottmarkt. Wer einen Bot hat, darf mitlaufen. Wer keinen hat, darf mitschieben.', 'neutral'),
  ], cycle(26, 27), 1),
];

// --------------------------------------------------------------------------------------------- Nach Nebenquests

const neben: NewsDef[] = [
  sendung('news-side-verspaetung', 'U-Bahn pünktlich!', [
    say(D, 'U-Bahn pünktlich! Fahrgäste verunsichert. Mehrere Pendler stiegen aus Misstrauen nicht ein.', 'ueberrascht'),
  ], done('side-uebliche-verspaetung'), 3),
  sendung('news-side-rattenkoenig', 'Rattenparade im Kanal', [
    say(C, 'Rattenparade im Kanal! Der Ordnungsdienst rät, freundlich zu winken. Die Ratten winken zurück. Das ist neu.', 'ueberrascht'),
  ], done('side-rattenkoenig'), 3),
  sendung('news-side-strom', 'Licht in der Kanalisation', [
    say(D, 'In der Kanalisation brennt wieder Licht. Bürgermeister Gully spricht von einer „Erleuchtung“. Wir auch.', 'freude'),
  ], done('side-strom-fuer-die-rohre'), 3),
  sendung('news-side-rechen', 'Rettung am Rechen', [
    say(D, 'Am großen Rechen der Kanalisation wurde ein Floß samt Besatzung gerettet. Die Besatzung: eine Frau, zwei Kinder, eine sehr nasse Katze.', 'freude'),
  ], done('side-rettung-am-rechen'), 3),
  sendung('news-side-hunde', 'Hunde der Brackbucht', [
    say(C, 'Ruhe in der Brackbucht: Die Robohunde jagen keine Spaziergänger mehr. Einer apportiert jetzt Schrauben. Freiwillig.', 'freude'),
  ], done('side-hunde-der-brackbucht'), 3),
  sendung('news-side-drohnenrennen', 'Rostkai-Rallye', [
    say(D, 'Rostkai-Rallye: Ein Neuling fliegt allen davon. Turbo-Tilda kündigt Revanche an. Ein Einkaufswagen auch.', 'ueberrascht'),
  ], done('side-drohnenrennen'), 3),
  sendung('news-side-wand', 'Neue Bilder an der Flutmauer', [
    say(C, 'An der Wand der Freiheit leuchten neue Bilder. Die Stadtreinigung sagt: „Zu schön zum Abwaschen. Leider.“', 'freude'),
  ], done('side-wand-der-freiheit'), 3),
  sendung('news-side-live-dabei', 'Drohne geborgen', [
    say(K, 'Die Kameradrohne ist zurück. Nass, aber im Dienst. Danke an den Menschen, der reingesprungen ist.', 'freude'),
    say(C, 'Und danke an mich, der zugesehen hat! Moralische Unterstützung ist auch Unterstützung.', 'signatur'),
  ], done('side-live-dabei'), 3),
  sendung('news-side-peruecke', 'Collins Haare sind zurück', [
    say(D, 'Collins Perücke ist wieder aufgetaucht. Collin dementiert, je eine Perücke getragen zu haben.', 'signatur'),
    say(C, 'Das ist mein natürliches Haar. Es war nur kurz verreist.', 'verlegen'),
  ], done('side-collins-peruecke'), 3),
  sendung('news-side-kessel', 'Feierabend im Eisenhof', [
    say(D, 'Wachtmeisterin Kessel hat zum ersten Mal seit elf Jahren pünktlich Feierabend gemacht. Kolleginnen und Kollegen stehen unter Schock.', 'ueberrascht'),
  ], done('side-feierabend-fuer-kessel'), 3),
  sendung('news-side-richter', 'Der Richter hat ein Hobby', [
    say(C, 'Gerüchte, der Richter habe zehntausend Stunden Seifenoper im Dienst gestreamt, sind laut Gericht „vollständig gelöscht“. Also falsch. Also gelöscht.', 'ueberrascht'),
  ], done('side-streaming-suenden'), 3),
  sendung('news-side-container', 'Container 77', [
    say(D, 'Am Hafen ist ein Container mit „Ersatzteilen“ aufgetaucht. Woher die Teile stammen, will niemand wissen. Am wenigsten die Teile.', 'besorgt'),
  ], done('side-container-77'), 3),
  sendung('news-side-chrome10', 'Gefälschte Chips', [
    say(C, 'Auf dem Schrottmarkt kursierten gefälschte Chrome-10-Chips. Der Händler zahlt das Geld zurück. Mit verdächtig blauem Auge.', 'neutral'),
  ], done('side-chrome-10'), 3),
  sendung('news-side-eins-turnier', 'Eins!-Turnier der Kinder', [
    say(D, 'Die Kinder der Rohrsiedlung haben ein Eins!-Turnier veranstaltet. Ein Erwachsener hat geweint. Er sagt, es war der Staub.', 'freude'),
  ], done('side-eins-turnier'), 3),
  sendung('news-side-digitech-geist', 'Der Geist von Digitech', [
    say(D, 'Im Digitech-Areal soll es spuken. Eine anonyme Quelle sagt: „Das war kein Geist. Das war Schichtplanung.“', 'besorgt'),
  ], done('side-digitech-geist'), 3),
  sendung('news-side-lumo', 'DJ Lumos Platte', [
    say(C, 'DJ Lumo spielt wieder seine Lieblingsplatte. Die Kratzer sind weg. Die Tanzfläche bebt. Die Decke auch.', 'freude'),
  ], done('side-lumos-platte'), 3),
  sendung('news-side-oma-volt', 'Oma Volts Lager', [
    say(D, 'Oma Volts Lager ist wieder in Familienhand. Die Rostzähne sprechen von „einem Missverständnis“. Ihre Zähne auch.', 'signatur'),
  ], done('side-oma-volts-lager'), 3),
];


export const part: ContentPart = {
  news: byId([...nx1, ...radio, ...blade, ...kurz, ...wetter, ...woche, ...neben]),
};
