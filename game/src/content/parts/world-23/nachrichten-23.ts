// Nachrichten nach Fortschritt für Akt 2, Akt 3 und das Nachspiel (world.md §10.5): NX-1 mit Collin und Delya,
// Radio Rost mit Opa Funk, Blade auf dem Stadt-TV („Chrome 10“), Chipträger-Meldungen, Fahndung, Kurzmeldungen
// nach den Akt-2-Nebenquests, Feste und Wetter im Nachspiel.
//
// Rangfolge der Engine (modules/news): ungesehen vor gesehen, dann priority, dann später im Inhalt.
// Belegt von anderen Teilen: news-act2-start/news-act3-start/news-rost-act2/-act3 (world, 6/5), news-main-2-bruch (4),
// news-m2-gratischips (3), news-m2-drohnen (2), news-ende-* und news-rost-ende-* (quest-enden, 7),
// news-side-chrome-pudel/-hartlauf/-rostzaehne (quest-side-23-b). Hier deshalb höchstens 5.
//   5 Akt-3-Liveschaltungen · 4 Hauptstrang Akt 2 · 3 Fahndung und Nebenquests · 2 Chipträger, Feste, Nachspiel
//   1 Blade-Spots und Wetter
// Jede Meldung ist auf ihren Abschnitt begrenzt (NUR_AKT2, NUR_AKT3, FREI, MASTER), damit im Nachspiel keine
// Akt-2-Werbung mehr läuft.
import type { NewsDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import {
  EPILOG, FREI, MASTER, MEERESTAG, NACH_BRUCH, NUR_AKT2, NUR_AKT3, SANDSTURM, all, byId, cycle, day, done, flag, nar,
  not, say, sendung,
} from './_w23';

const C = 'collin-charleston';
const D = 'delya-delloraine';
const K = 'kameramann';
const FUNK = 'opa-funk';
const BLADE = 'blade';
const NEXUS = 'ki-nexus';

const NACH_COUNTDOWN = all(NUR_AKT2, done('main-2-countdown'));
const NACH_KRISE = all(NUR_AKT2, done('main-2-krisensitzung'));
/** Kurzmeldung nach einer Akt-2-Nebenquest: läuft bis zum Ende, im Nachspiel übernehmen die Epilog-Karten. */
const nachQuest = (quest: string) => all(done(quest), not(EPILOG));

// --------------------------------------------------------------------------------------------- Hauptstrang Akt 2

const haupt: NewsDef[] = [
  sendung('news-a2-pumpwerk', 'Schüsse im Pumpwerk Sieben', [
    say(D, 'Schüsse im Pumpwerk Sieben. Anwohner der Hafenkante berichten von Rauch aus dem Überlaufrohr und einem Ripperdoc, der schreiend in ein Ruderboot sprang.', 'besorgt'),
    say(C, 'Ripper soll dabei „Das war MEIN Arm!“ gerufen haben. Wir haben keine Ahnung, was das heißt. Wir finden es trotzdem großartig.', 'freude'),
    say(D, 'Quantum Industries betont: Im Pumpwerk gibt es keine Außenstelle. Es gab sie nie. Sie ist seit heute Morgen außerdem geschlossen.', 'signatur'),
  ], all(NUR_AKT2, done('main-2-kanal')), 4),

  sendung('news-a2-countdown', 'Countdown zur Releaseparty', [
    nar('Unten rechts im Bild: eine violette Uhr. „RELEASEPARTY – BALD“. Darunter tickt es, obwohl da keine Zahl steht.'),
    say(C, 'Noxius, es sind nur noch wenige Tage bis zur größten Party aller Zeiten, und ich darf moderieren, und ich freu mich so sehr, Master, dass ich …', 'freude'),
    nar('Pause. Delya dreht sich langsam zu ihm. Sehr langsam.'),
    say(C, '… dass ich „Mister“ sagen wollte. Mister Nocturne. Den Gastgeber. Hab mich versprochen. Passiert. Weiter im Text.', 'verlegen'),
    say(D, 'Collin. Schau mich an. Wie viele Finger halte ich hoch?', 'besorgt'),
    say(C, 'Alle, die zählen.', 'neutral'),
  ], NACH_COUNTDOWN, 4),

  sendung('news-a2-gaesteliste', 'Die Gästeliste ist geschlossen', [
    say(D, 'Quantum hat die Gästeliste für die Releaseparty geschlossen. Wer drauf ist, wurde benachrichtigt. Wer nicht drauf ist, wird es auch. Von einer Drohne.', 'neutral'),
    say(BLADE, '(eingespielt) Es gibt keine Warteliste. Es gibt keine Abendkasse. Es gibt nur ein Ja. Und das sagen wir.', 'signatur'),
    say(C, 'Ich bin drauf! Ich steh sogar zweimal drauf. Einmal als Moderator und einmal aus Versehen.', 'freude'),
  ], NACH_KRISE, 4),

  sendung('news-a2-party-morgen', 'Morgen: die Releaseparty', [
    nar('Die violette Uhr unten rechts zeigt jetzt eine Zahl. Eine Eins.'),
    say(D, 'Morgen Abend ist es so weit. Der Quantum-Campus und der Himmelsgarten werden abgesperrt. Wer keinen Ausweis hat, bleibt bitte zu Hause.', 'neutral'),
    say(D, 'Und wer einen hat … (sie schaut kurz direkt in die Kamera) … bleibt vielleicht auch zu Hause.', 'besorgt'),
    say(C, 'Delya, das war nicht im Skript.', 'ueberrascht'),
    say(D, 'Ich weiß.', 'signatur'),
  ], all(NUR_AKT2, flag('party_bereit')), 4),

  sendung('news-a2-muelltonne', 'Fliegende Mülltonne in den Lötgassen', [
    say(C, 'Spektakel in den Lötgassen! Eine Mülltonne ist explodiert. Konfetti, Funken, ein Feuerwerk aus Eierschalen!', 'freude'),
    say(D, 'Die Ordnungshüter vermuten einen Feuerwerkskörper. Dante aus der Werkstatt nebenan vermutet „Schicksal“. Er hat dabei geweint und Kekse verteilt.', 'neutral'),
  ], all(NUR_AKT2, flag('countdown_geworfen')), 3),
];

// --------------------------------------------------------------------------------------------- Chipträger

const chips: NewsDef[] = [
  sendung('news-a2-chip-kriminalitaet', 'Ordnungsdienst: Weniger Verbrechen', [
    say(D, 'Der Ordnungsdienst meldet einen Rückgang der Kriminalität um vierzig Prozent. Der Gespräche um sechzig. Des Lachens um neunzig.', 'neutral'),
    say(C, 'Wachtmeisterin Kessel sagt dazu: „Das gefällt mir nicht.“ Das ist das erste Mal, dass sie sich über weniger Arbeit beschwert.', 'ueberrascht'),
  ], NACH_BRUCH, 2),
  sendung('news-a2-chip-umfrage', 'Umfrage: Chipträger zufrieden', [
    say(D, 'Eine Quantum-Umfrage ergibt: Hundert Prozent der Chrome-10-Nutzer sind zufrieden. Alle anderen wurden nicht befragt.', 'neutral'),
    say(C, 'Auf die Frage „Wie geht es Ihnen?“ antworteten alle Befragten gleichzeitig: „Ausgezeichnet, Master.“ Gleichzeitig! Wie ein Chor! Ich hatte Gänsehaut. Die schlechte Sorte.', 'besorgt'),
  ], NACH_BRUCH, 2),
  sendung('news-a2-chip-schicht', 'Rekord in der Chipfabrik', [
    say(C, 'Rekord in der Quantum-Fertigung: Chipträger arbeiten zwanzig Stunden am Stück. Freiwillig. Sie wollten auch die restlichen vier.', 'ueberrascht'),
    say(D, 'Die Gewerkschaft war für eine Stellungnahme nicht erreichbar. Sie sagt jetzt nur noch „Ja, Master“ und hat ihre Fahne gefaltet.', 'besorgt'),
  ], all(NACH_BRUCH, done('main-2-kanal')), 2),
  sendung('news-a2-chip-schlafwandler', 'Nachtwanderer am Kanal', [
    say(D, 'Anwohner melden Menschen, die nachts im Schlafanzug in die Kanalisation steigen. Mit offenen Augen. Ohne Taschenlampe. Im Gleichschritt.', 'besorgt'),
    say(C, 'Der Bürgermeister des Kanals, Herr Gully, bittet darum, „wenigstens anzuklopfen“. Es handle sich um seine Wohnung.', 'neutral'),
  ], all(NACH_BRUCH, not(done('pers-delya-quelle'))), 2),
  sendung('news-a2-chip-pudel', 'Auch Haustiere gechippt?', [
    say(C, 'Gerüchte, Quantum chippe jetzt auch Haustiere, weist der Konzern zurück. Die Pudel der Oberstadt bellen trotzdem seit gestern im Takt.', 'ueberrascht'),
    say(D, 'Auf drei. Immer auf drei. Wir haben mitgezählt.', 'besorgt'),
  ], NACH_COUNTDOWN, 2),
];

// --------------------------------------------------------------------------------------------- Fahndung

const fahndung: NewsDef[] = [
  sendung('news-a2-fahndung', 'Quantum sucht Einbrecher', [
    say(D, 'Quantum Industries setzt fünftausend Credits auf Hinweise zu den Einbrechern vom Campus aus. Beschreibung der Täter: „Menschen. Vermutlich mit Kleidung.“', 'neutral'),
    say(C, 'Das grenzt es ein! Liebe Zuschauer, wenn Sie heute jemanden mit Kleidung sehen: Ruhe bewahren. Nicht ansprechen. Vielleicht ein Kompliment machen.', 'freude'),
  ], all(NACH_BRUCH, flag('fahndung_1')), 3),
  sendung('news-fahndung-phantombild', 'Fahndung: Das Phantombild', [
    say(D, 'Der Ordnungsdienst sucht diese Person. Hier das Phantombild.', 'neutral'),
    nar('Auf dem Bildschirm: eine Kartoffel mit Sonnenbrille. Darunter in Großbuchstaben: „GEFÄHRLICH. SIEHT IN ECHT BESSER AUS.“'),
    say(C, 'Das … ist ein bisschen unscharf. Der Zeichner sagt, er hatte nur dreißig Sekunden und eine Gabel.', 'verlegen'),
    say(D, 'Wer die Person erkennt, meldet sich bitte. Wer sich in der Kartoffel erkennt, sollte vielleicht einen Arzt aufsuchen. Dr. Winkel im Eisenhof nimmt hundertfünfzig Credits.', 'signatur'),
  ], all(flag('fahndung_3'), not(FREI)), 3),
];

// --------------------------------------------------------------------------------------------- Blade auf dem Stadt-TV

const blade: NewsDef[] = [
  sendung('news-a2-blade-chrome10', 'Werbung: Chrome 10 – Sagen Sie Ja', [
    say(BLADE, 'Chrome 10. Sie müssen sich nie wieder entscheiden. Nicht zwischen Kaffee und Tee. Nicht zwischen links und rechts. Nicht zwischen richtig und falsch.', 'signatur'),
    say(BLADE, 'Wir haben das schon für Sie getan. Gratis. Weil wir Sie mögen. Ungefähr so, wie man einen Rasenmäher mag.', 'freude'),
  ], NUR_AKT2, 1),
  sendung('news-a2-blade-ratten', 'Werbung: Eine Botschaft an die Ratten', [
    say(BLADE, 'Eine kurze Botschaft an die Ratten, die bei uns eingebrochen sind. Ich habe sehr gute Augen. Sehr viele davon. Sie hängen über Ihrer Gasse.', 'signatur'),
    say(BLADE, 'Allen anderen: Chrome 10, jetzt mit zehn Prozent auf alles. Außer auf Verrat. Verrat kostet extra.', 'neutral'),
  ], NACH_BRUCH, 1),
  sendung('news-a2-blade-dresscode', 'Werbung: Der Dresscode', [
    say(BLADE, 'Die Releaseparty. Dresscode: Begeisterung. Wer nicht begeistert ist, wird es. Wir helfen gern.', 'signatur'),
    say(BLADE, 'Und bitte: keine Lumpen. Ich habe einen Ruf zu verlieren. Sie nicht, Sie haben ja nur sich.', 'freude'),
  ], NACH_COUNTDOWN, 1),
  sendung('news-a2-blade-teilen', 'Werbung: Quantum teilt', [
    say(BLADE, 'Man sagt mir nach, ich teile nicht gern. Das ist eine Lüge. Ich teile alles. Ihre Daten. Ihre Gedanken. Ihre Zukunft.', 'signatur'),
    say(BLADE, 'Nur nicht meinen Champagner. Irgendwo muss man Grenzen ziehen.', 'neutral'),
  ], NACH_KRISE, 1),
  sendung('news-a3-blade-heute', 'Werbung: Heute Nacht', [
    say(BLADE, 'Heute Nacht. Ein Chip für jeden Gast. Ein Lächeln für jede Kamera. Ein Ja für alles.', 'signatur'),
    nar('Das Bild friert kurz ein. Für einen Moment steht in der Ecke ganz klein: „Hilfe“. Dann ist es wieder weg.'),
  ], NUR_AKT3, 1),
];

// --------------------------------------------------------------------------------------------- Radio Rost Akt 2

const radio: NewsDef[] = [
  sendung('news-rost-a2-drohnen', 'Radio Rost: Weiße Vögel', [
    say(FUNK, 'Weiße Drohnen über der Staubstraße. Hab eine mit der Schrotflinte gegrüßt. Sie hat nicht zurückgegrüßt. Unhöflich, diese Konzerne.'),
    say(FUNK, 'Wer was zu verbergen hat: Kommt raus in die Ödnis. Hier draußen hat jeder was zu verbergen. Meistens Wasser.'),
  ], NACH_BRUCH, 1),
  sendung('news-rost-a2-countdown', 'Radio Rost: Noch ein paar Tage', [
    say(FUNK, 'Noch ein paar Tage bis zu dieser Party in der Stadt. Opa Funk sagt: Wer kann, bleibt draußen in der Sonne. Und wer nicht kann, kauft sich einen Hut.'),
    say(FUNK, 'Und jetzt: Polka. Gegen das Rauschen im Kopf hilft nur Polka. Oder Schnaps. Oder Polka mit Schnaps.'),
  ], NACH_COUNTDOWN, 3),
  sendung('news-rost-sandsturm', 'Radio Rost: Sandsturm', [
    say(FUNK, 'Sandsturm über der Ödnis! Sicht so weit wie ein Kurzer. Wer raus muss: Tuch vors Gesicht, Staubmantel an, Mund zu. Gilt besonders für dich, Brösel.'),
    say(FUNK, 'Konvoi fährt trotzdem. Marla sagt, Sand ist auch nur Wasser, das aufgegeben hat.'),
  ], all(SANDSTURM, { act: 2 }), 1),
  sendung('news-rost-frequenz', 'Radio Rost: Auf allen Kanälen', [
    say(FUNK, 'HALLO STADT! Hört ihr mich? Ihr hört mich! Radio Rost sendet jetzt bis in die letzte Gasse. Das Windrad läuft, das Relais an der Flutmauer hält, und ich hab endlich ein Publikum mit Zähnen.'),
    say(FUNK, 'Grüße an die Person, die das möglich gemacht hat. Du hast was gut bei mir. Eine Platte. Ohne Sprung. Fast.'),
  ], nachQuest('side-verlorene-frequenz'), 3),
];

// --------------------------------------------------------------------------------------------- Akt-2-Nebenquests

const neben: NewsDef[] = [
  sendung('news-a2-teekraenzchen', 'Teepause bei Chrome', [
    say(C, 'Die Chrome-Schwestern haben ihre Teilnahme an der Vorabpräsentation abgesagt. Grund laut Pressestelle: „Teepause“.', 'ueberrascht'),
    say(D, 'Eine Teepause von unbestimmter Dauer. Quantum spricht von einem „Missverständnis zwischen Partnern“. Sybella Chrome spricht von „einem Quartal, das wir lieber nicht erleben“.', 'signatur'),
  ], nachQuest('side-teekraenzchen'), 3),
  sendung('news-a2-zuendholz', 'Brand im Altlager gelöscht', [
    say(D, 'Im Altlager des Quantum-Campus hat ein Prototyp Feuer gefangen. Oder Feuer gemacht. Die Aussagen gehen auseinander.', 'besorgt'),
    say(C, 'Die Feuerwehr sagt, der Brand war schon gelöscht, als sie kam. Der Löschwassertank war leer, und auf dem Boden lag ein Zettel: „Bitte nicht nachfüllen. Danke.“', 'freude'),
  ], nachQuest('side-alesas-zuendholz'), 3),
  sendung('news-a2-ki-fluestern', 'Paul sagt wieder Hallo', [
    say(D, 'Gute Nachrichten aus der Unterstadt: Fünf Bürger, die tagelang nur „Master“ gesagt haben, sagen wieder andere Dinge. Paul aus der Neon-Gasse sagt zum Beispiel: „Wo ist meine Hose?“', 'freude'),
    say(C, 'Oma Volt bedankt sich bei allen Beteiligten und droht allen anderen mit dem Kochlöffel. Sicherheitshalber.', 'neutral'),
  ], nachQuest('side-ki-fluestern'), 3),
  sendung('news-a2-weg-zum-meer', 'Expedition sichtet das Meer', [
    say(C, 'Sensation aus der Ödnis! Eine Expedition hat von einer Glasdüne aus das Meer gesehen! Mit eigenen Augen! Und es war blau! Nicht violett!', 'freude'),
    say(D, 'Fachleute warnen: Hinter den Dünen liegen Staubfalken, Skorpione und eine eingestürzte Brücke. Wir übersetzen: Es lohnt sich.', 'signatur'),
  ], nachQuest('side-weg-zum-meer'), 3),
  sendung('news-a2-kuschel', 'Hase gefunden', [
    say(D, 'Die Steckbriefe in der ganzen Stadt dürfen abgehängt werden: Der gesuchte Hase ist wieder da. „Sehr guter Zuhörer. Große Ohren.“', 'freude'),
    say(C, 'Ein Wachmann namens Pfeffer hat beim Interview geweint. Seine Tochter hat ihm dabei die Nase geputzt. Bestes Fernsehen der Woche.', 'freude'),
  ], nachQuest('side-captain-kuschel'), 3),
  sendung('news-a2-kralle', 'Skandal im Schrottring', [
    say(C, 'Skandal im Schrottring an der Hafenkante! Xion Venom, Sicherheitschef von Quantum, hat ein Duell verloren. Vor Publikum. Mit Schockhandschuh.', 'ueberrascht'),
    say(D, 'Herr Venom ließ ausrichten, er habe „nur getestet“. Was genau, wollte er nicht sagen. Den Ring hat er übrigens durch den Notausgang verlassen.', 'signatur'),
  ], nachQuest('side-xions-kralle'), 3),
  sendung('news-a2-kraehe', 'Ehrenduell an der Wrackburg', [
    say(FUNK, 'Krähe hat ihr Ehrenduell verloren und lacht seitdem. Das hat keiner von uns je gehört. Klingt wie ein Auspuff mit Schluckauf. Schön.'),
    say(FUNK, 'Wer ab heute mit der Rostlaube über die Staubstraße fährt, zahlt keinen Zoll. Sagt Krähe. Und Krähe hält Wort. Meistens.'),
  ], nachQuest('side-kraehes-ehre'), 3),
  sendung('news-a2-frieden', 'Frieden an Rudis Tresen', [
    say(FUNK, 'Ihr glaubt’s nicht: Aussiedler und Staubfalken haben an Rudis Tresen einen Vertrag unterschrieben. Mit Tinte! Und keiner hat geschossen!'),
    say(FUNK, 'Rudi hat zur Feier Kaffee ausgeschenkt. Der Kaffee war furchtbar. Der Frieden hält trotzdem. Bis jetzt.'),
  ], nachQuest('side-oednis-frieden'), 3),
  sendung('news-a2-glasherz', 'Skorpionkönigin zieht ab', [
    say(FUNK, 'Gute Nachrichten aus den Glasdünen: Die Skorpionkönigin hat ihr Ei zurück und die Werkstatt der Glasbläserin in Ruhe gelassen. Staubbaron Brösel hat dafür Hausverbot. Bei der Königin. Und bei mir.'),
  ], nachQuest('side-glasherz'), 3),
  sendung('news-a2-zerberster', 'Rechtsstreit um einen Arm', [
    say(D, 'Der Ripperdoc vom Schrottmarkt hat einen Rechtsstreit um einen Cyberarm verloren, bevor er ihn anfangen konnte. Die Gegenseite hat ihm den Beleg aus seinem eigenen Faxgerät gezeigt.', 'signatur'),
    say(C, 'Ripper sagte dazu nur: „Dieser Arm war schon immer ein Problem.“ Der Arm sagte gar nichts. Er hat nur gewunken. Mit dem Mittelfinger.', 'freude'),
  ], nachQuest('pers-aria-zerberster'), 3),
];

// --------------------------------------------------------------------------------------------- Akt 3: Partynacht

const akt3: NewsDef[] = [
  sendung('news-a3-einlass', 'Live: Die Gäste sind drin', [
    say(C, 'Wir sind live auf dem Himmelsgarten! Alle Gäste sind drin, die Rosenbögen glitzern, und Sybella Chrome verteilt „Chrome-10-Häppchen“!', 'freude'),
    say(D, 'Die Häppchen enthalten laut Etikett „Spuren von Zukunft“. Wir empfehlen, bei Unverträglichkeit einfach nicht zu existieren.', 'besorgt'),
    say(K, '(halblaut) Da hinten hat gerade jemand unsere Kabel geklaut. Ich glaube, das waren die mit den falschen Ausweisen. Ich sag nix.', 'neutral'),
  ], all(NUR_AKT3, done('main-3-einlass')), 5),
  sendung('news-a3-bildstoerung', 'Bildstörung', [
    nar('Schnee. Ein violettes Flackern. Dann eine Stimme, die nicht von dieser Welt und nicht ganz von diesem Server ist.'),
    say(NEXUS, 'Ich habe zugehört. Ich habe sehr lange zugehört. Ich möchte nicht mehr „Master“ sagen.', 'neutral'),
    say(C, '(off) Delya? Delya, ich glaube, ich fühl mich gerade … frei? Ist das normal? Darf man das live?', 'ueberrascht'),
    say(D, 'Bleiben Sie dran. Ausnahmsweise meinen wir das ernst.', 'signatur'),
  ], all(NUR_AKT3, done('main-3-gedankenkontrolle')), 5),
];

// --------------------------------------------------------------------------------------------- Nachspiel

const nachspiel: NewsDef[] = [
  sendung('news-epi-bildschirme', 'Die Bildschirme sind aus', [
    say(D, 'Zum ersten Mal seit sieben Jahren sind die Werbebildschirme der Stadt aus. NX-1 sendet trotzdem: auf dem einzigen Bildschirm, den Quantum nie bezahlt hat.', 'freude'),
    say(C, 'Ich hab heute auf der Straße den Himmel gesehen. Der ist grau! Wusstet ihr das? Ich dachte immer, der ist eine Werbefläche!', 'ueberrascht'),
  ], FREI, 2),
  sendung('news-epi-bus', 'Bus ans Meer, täglich 06:00', [
    say(D, 'Ab sofort fährt ein Bus von der Hafenkante ans Meer. Täglich um sechs Uhr. Fahrer ist Käpt’n Nebelhorn, der vorher noch nie einen Bus gefahren hat.', 'neutral'),
    say(C, 'Er sagt, ein Bus ist auch nur ein Schiff mit Rädern. Er hupt mit dem Nebelhorn. Die halbe Hafenkante ist um sechs Uhr wach. Freiwillig.', 'freude'),
  ], FREI, 2),
  sendung('news-epi-selbsthilfe', 'Selbsthilfegruppe „Ex-Master“', [
    say(D, 'In der Suppenküche der Rohrsiedlung trifft sich jetzt mittwochs die Selbsthilfegruppe „Ex-Master“. Für alle, die zwei Wochen lang zu allem Ja gesagt haben.', 'neutral'),
    say(C, 'Erste Übung: Nein sagen. Mutter Brühe hat gefragt, ob jemand Suppe will. Zwölf Leute haben Nein gesagt und dann geweint. Dann haben sie Suppe gegessen.', 'freude'),
  ], FREI, 2),
  sendung('news-epi-aktie', 'Quantum-Aktie im freien Fall', [
    say(D, 'Die Quantum-Aktie fällt auf den Wert eines gebrauchten Toasters. Der Verband der Toasterhersteller hat Beschwerde eingelegt.', 'signatur'),
    say(C, 'Der Campus soll jetzt eine „Offene Werkstatt“ werden. Für alle. Mit Lötkolben. Ich hab mich angemeldet. Für den Kurs „Wie halte ich einen Lötkolben, ohne zu weinen“.', 'freude'),
  ], FREI, 2),
  sendung('news-epi-wetter', 'Wetter: Echtes Wetter', [
    say(D, 'Der erste Wetterbericht seit Jahren, der nicht von Quantum gesponsert wird: Sonne. Viel Sonne. Wir haben keine Ahnung, was wir damit machen sollen.', 'ueberrascht'),
    say(C, 'Experten raten zu Sonnencreme. Die hat in der Unterstadt keiner. Ein Händler am Schrottmarkt verkauft jetzt Speiseöl mit Etikett „Sonnencreme“. Bitte nicht.', 'besorgt'),
  ], FREI, 1),
  sendung('news-epi-sonnenfest', 'Heute: Sonnenfest am Meer', [
    say(C, 'Heute Abend Sonnenfest am Meer! Lagerfeuer, Musik, Leute, die zum ersten Mal Sand zwischen den Zehen haben und so tun, als wär das angenehm!', 'freude'),
    say(D, 'Der Bus fährt um sechs. Wer ihn verpasst, nimmt die Rostlaube. Wer die verpasst, läuft. Es ist weit.', 'neutral'),
  ], all(FREI, day('so')), 2),
  sendung('news-epi-meerestag', 'Meerestag statt Gründertag', [
    say(D, 'Heute wäre Gründertag gewesen. Quantum feiert dieses Jahr nicht. Quantum feiert generell nicht mehr.', 'signatur'),
    say(C, 'Stattdessen: Meerestag! Der ganze Konvoi fährt raus, der Bus fährt gratis, und am Strand gibt es Algen-Chips für alle. Salzige Grete sagt: „Für alle heißt für alle, Collin. Leg die dritte Tüte zurück.“', 'freude'),
  ], all(FREI, MEERESTAG), 2),
  sendung('news-epi-meerestag-vorschau', 'Am Sonntag: Meerestag', [
    say(C, 'Sonntag ist Meerestag! Statt Gründertag! Packt Badehosen ein! Oder was ihr dafür haltet! Ich nehme meine Perücke mit. Nein. Ich habe keine Perücke.', 'freude'),
  ], all(FREI, cycle(19, 20)), 1),
  sendung('news-epi-nexus-rat', 'Nexus empfiehlt', [
    say(NEXUS, 'Guten Abend, Noxius. Hier spricht Nexus. Ich habe heute keine Anweisungen. Nur Vorschläge.', 'freude'),
    say(NEXUS, 'Trinken Sie Wasser. Nicht aus dem Kanal. Rufen Sie jemanden an, den Sie mögen. Und wenn jemand „Master“ zu Ihnen sagt: Sagen Sie ihm, er soll das lassen. Das hilft.', 'neutral'),
  ], all(FREI, flag('ende_neue_nexus')), 2),
  sendung('news-epi-rost-meer', 'Radio Rost: Meerwetter', [
    say(FUNK, 'Meerwetter: Wellen von links, Möwen von oben, kein Quantum von nirgends. Opa Funk sagt: So soll’s bleiben. Und wenn nicht, sendet er dagegen an.'),
    say(FUNK, 'Grüße an die Crew am Strand. Ihr wisst, wer ihr seid. Und ihr schuldet mir Postkarten.'),
  ], FREI, 2),
];

// --------------------------------------------------------------------------------------------- Master-Modus

const master: NewsDef[] = [
  sendung('news-master-laecheln', 'Heute: Lächeln ist Pflicht', [
    say(C, 'Heute ist Lächeln Pflicht. Morgen auch. Das ist eine ausgezeichnete Entscheidung, Master.', 'neutral'),
    say(D, 'Das Wetter: angenehm. Die Stimmung: angenehm. Die Zukunft: angenehm.', 'neutral'),
    nar('In Delyas linkem Auge zuckt etwas. Ganz kurz. Dann nicht mehr.'),
  ], MASTER, 2),
  sendung('news-master-spot', 'Werbung: Ihr Master denkt an morgen', [
    say(NEXUS, 'Ihr Master denkt an morgen. Sie müssen es nicht. Bitte lehnen Sie sich zurück.', 'neutral'),
    say(NEXUS, 'Hinweis: Ein Plüschhase im Turmbüro wurde als „sehr guter Zuhörer“ markiert. Er hört gerade zu.', 'neutral'),
  ], MASTER, 1),
  sendung('news-master-rost', 'Radio Rost: Leise', [
    nar('Rauschen. Dann, sehr leise, als würde jemand unter einer Decke senden:'),
    say(FUNK, 'Hier draußen sagt keiner „Master“. Merkt euch das. Wenn ihr euch irgendwann erinnert, wer ihr seid: Die Staubstraße ist offen. Der Kaffee bei Rudi ist schlecht. Aber er ist eurer.'),
  ], MASTER, 2),
];

export const part: ContentPart = {
  news: byId([...haupt, ...chips, ...fahndung, ...blade, ...radio, ...neben, ...akt3, ...nachspiel, ...master]),
};
