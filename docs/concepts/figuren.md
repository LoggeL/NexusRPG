# Konzeptentwurf: Figuren und Beziehungen

**Nexus – Das RPG** · Konzeptstand 08.11.2026 · Entwurf zur Abstimmung mit `docs/world.md` (Welt, Quests) und `docs/design.md` (Regeln)

Dieses Dokument beschreibt alle benannten Figuren von Noxius: die Rollen aus dem Stück „Nexus“, die KI Nexus, Captain Kuschel und zehn neue Nebenfiguren. Dazu kommen Herkünfte und Aussehen der Spielfigur sowie der Geschenkkatalog. Regeln (Punktwerte, Tageszeiten, Kampf) stammen aus `docs/design.md` und werden hier nur angewendet, nicht neu erfunden.

**Leitgedanke:** Der Hauptstrang ist ein roter Faden. Die Figuren sollen die Stadt tragen: Sie haben Gewohnheiten, Lieblingsorte, eigene Sorgen und eigene Quests, die nichts mit Blade zu tun haben müssen. Wer nie den nächsten Hauptquest-Schritt macht, soll trotzdem wochenlang Leute kennenlernen, UNO-Abende verlieren und Schulden eintreiben können.

---

## Inhalt

1. Leitlinien für Figuren
2. Beziehungssystem in der Anwendung
3. Referenzlisten (Zonen, Phasen, Tageszeiten, Fraktionen)
4. Die Spielfigur: Herkünfte und Aussehen
5. Geschenkkatalog
6. Hunters Crew
7. Quantum Industries und die Oberstadt
8. Medien
9. Unterstadt
10. Ordnung und Justiz
11. Neue Nebenfiguren
12. Begleiter-Übersicht und Duo-Techniken
13. Beziehungsnetz zwischen den Figuren
14. Offene Punkte zur Abstimmung

---

## 1. Leitlinien für Figuren

### 1.1 Namen und Quellen

- Im Spiel, in Texten und Daten erscheinen **nur Rollennamen**. Die Kostümbilder unter `work/refs/` dienen als Vorlage für Porträts und Laufblätter; die Zuordnung Datei → Rolle steht in der Asset-Planung, nicht im Spiel.
- Figuren-IDs sind stabile kebab-case-IDs (`hunter`, `alesa-zero`, `captain-kuschel`). IDs von Gegenständen, Quests und Ereignissen sind ASCII ohne Umlaute (`dantes-kekse`, `pq-nyra-salzluft`).
- Spieltexte sprechen die Spielfigur geschlechtsneutral an (siehe `design.md`). Wenn dieses Dokument „Patin“, „Erbin“ oder „Zeugin“ schreibt, bezieht sich das grammatisch auf „die Spielfigur“; im Spiel werden neutrale Formen verwendet („Kuschel-Patenschaft“, „Erbe der Schrottkrone“ als Titel).
- Präfixe: `pq-` persönliche Quest, `he-<figur>-<herzen>` Herz-Ereignis, `re-<figur>-<stufe>` Rivalitäts-Ereignis, `look-` Aussehen, `origin-` Herkunft.

### 1.2 Ton

- Wie im Stück: Cyberpunk mit viel Humor. Running Gags werden bewusst gepflegt: Dantes Schokoriegel und Kekse, Captain Kuschel als „guter Zuhörer wegen der großen Ohren“, der Keksalarm, verlorene Kartenspiele gegen die Straßenkinder, der Rabattcode „Chrome 10“, Blade, der „Master“ genannt werden will, die Wache, die niemanden wiedersehen möchte.
- Familienfreundlich: Kämpfe enden mit k.o., Flucht oder Aufgabe. Probanden im Labor fallen ins „Chip-Koma“, niemand stirbt auf dem Bildschirm. Keine Drogen; im Club gibt es Neon-Limo und Volt-Cola, die Erwachsenen trinken bestenfalls „etwas Prickelndes“ im Hintergrund. Fluchen nur angedeutet („Heiliger Lötkolben!“, „So ein verfl… Kabelsalat!“, Piepton bei Collin im Live-Radio).

### 1.3 Marken und Fremd-Lore

- Keine Namen, Begriffe oder Figuren aus anderen Spielen. Statt bekannter Fachbegriffe verwendet Noxius eigene Wörter: **Implantat-Schrauber** (wer Cyberware einbaut), **Auftraggeber**, **Straßenruf**.
- Reale Marken aus dem Stück werden als Anspielung umbenannt: Dantes Schokoriegel heißt **„Snackers“** (Werbespruch an der Neonmeile: „Hungrig? Dann wirst du zur Diva.“). Das Kartenspiel der Kinder heißt **„EINS!“** (man ruft „Eins!“ bei der letzten Karte, „Vier ziehen!“ bleibt).

### 1.4 Jugendschutz und Romanzen

- Viele Figuren tragen die Gesichter jugendlicher Ensemblemitglieder. Deshalb gilt: Romanzen sind nur ein **Kennzeichen** (`romanceable`) an einzelnen, erwachsen wirkenden Figuren und werden ausschließlich über `content/romance.ts` freigeschaltet (Standard: leer, siehe `design.md` 3.3).
- Romanze heißt hier: Flirt-Dialoge, Verabredungen, Händchenhalten, ein gemeinsamer Sonnenuntergang. Kein Kuss in Großaufnahme, keine Zweideutigkeiten, kein Zusammenziehen, keine Hochzeit.
- **Nie romanzierbar:** die Straßenkinder `daria`, `freya`, `jakko` (Test in `design.md`), außerdem die jung besetzten Crew-Mitglieder `vega`, `aria`, `nyra`, alle Antagonisten im laufenden Strang, Nebenrollen mit Maske oder Uniform sowie KI, Plüschhase und Roboterhund.
- Jede romanzierbare Figur hat für 8 und 10 Herzen **zwei Fassungen**: eine Freundschaftsfassung (immer vorhanden) und eine Romanzefassung (nur mit Bedingung `{ romance: npc }`). Ist die Romanze aus, verliert niemand Inhalte.

### 1.5 Bildsprache der Figuren

Alle Kostüme des Stücks teilen ein Motiv: **schwarzes Gurtzeug** (Brust- und Schultergurte mit Schnallen). Im Spiel ist es das Erkennungszeichen der Bewohner von Noxius und trägt auch die Spielfigur. Farben ordnen Gruppen zu: Crew in Schwarz, Leder und Oliv; Chrome-Schwestern in Blau, Rot und Grün; Quantum in Weiß, Schwarz und Neongrün; Medien in Samt und Pailletten; Ordnung in taktischem Schwarz mit Barett.

---

## 2. Beziehungssystem in der Anwendung

### 2.1 Werte (aus `design.md`, hier nur zur Orientierung)

| Größe | Wert |
|---|---|
| Punkte je Figur | −1000 bis 1000, Herzen = `floor(points / 100)` (0–10) |
| Tagesgespräch | +20 einmal täglich (nur bei ≥ 0) |
| Geschenke | 1 pro Tag und Figur, 2 pro Woche: liebt +80, mag +45, neutral +20, mag nicht −20, hasst −40 |
| Rivalität | unter −200, Stufen −2 bis −10 |
| Verfall | keiner |

### 2.2 Zusätzliche Bausteine dieses Entwurfs

- **Herkunfts-Startwerte:** Manche Herkünfte setzen Startpunkte bei einzelnen Figuren (z. B. Raven +200 für `origin-knastvogel`). Startwerte sind Punkte, keine Sonderregeln.
- **Geschenk-Sonderfälle:** Einige Figuren reagieren auf ein Geschenk anders, sobald ein Herz-Ereignis erlebt wurde (z. B. die KI Nexus findet Liebesromane ab `he-ki-nexus-8` nicht mehr „ineffizient“). Technisch: zwei Geschenklisten mit Bedingung.
- **Beziehungs-Checks:** Neben Attribut-Checks gibt es Optionen mit Herz-Bedingung, angezeigt wie ein Check: `[Raven ♥6] Du hast mir mal gesagt, dass du Handschellen hasst.` Sie nutzen `{ hearts: npc, min }`.
- **Herkunfts-Optionen:** angezeigt mit Präfix `[Ödnis]`, `[Gosse]`, `[Oberstadt]`, `[Ex-Wache]`, `[Schrott]`, `[Knast]`.
- **Rivalitäts-Ereignisse:** je Figur drei Stufen. `re-<figur>-2` (Einstieg, ab −2), `re-<figur>-5` (Eskalation, ab −5), `re-<figur>-8` (Konfrontation, ab −8, oft mit Kampf oder Duell ohne Kampf). Rivalität hat spielerische Folgen (Preise, Hinterhalte, gesperrte Gespräche), sperrt aber **nie** den Hauptstrang. Jede Rivalität hat einen Versöhnungsweg (Quest oder Geschenkserie), der die Punkte auf 0 setzt.
- **Gerüchte:** Die Straßenkinder, Babette Bao und Kiki Karbon geben Herz-Stände weiter. Wer z. B. Ripper hilft, die Kinder um Credits zu prellen, verliert bei allen dreien gleichzeitig Punkte (siehe Abschnitt 13).
- **Begleiter-Punkte:** gemeinsame Siege +5 (aus `design.md`). Begleiter kommentieren Orte, Gegner und Geschenke an Dritte.

### 2.3 Belohnungen je Herzstufe (Muster)

| Herzen | Typische Belohnung |
|---|---|
| 2 | Figur grüßt mit Namen, Telefonnummer, erste Tagesgespräche mit Hintergrund |
| 4 | Persönliche Quest verfügbar, kleiner Rabatt oder Dienst (z. B. Dante baut gratis ein, siehe `design.md`) |
| 6 | Begleiter-Fähigkeit 3, Beziehungs-Checks in Gesprächen, Figur schickt Nachrichten |
| 8 | Geheimnis oder Lieblingsort, Romanze-Option (falls freigeschaltet), besonderes Geschenk an die Spielfigur |
| 10 | Abschlussereignis, Andenken-Gegenstand mit kleinem Bonus, eigener Epilog-Satz im Abspann |

---

## 3. Referenzlisten

### 3.1 Zonen (Arbeits-IDs, an `world.md` anzugleichen)

| ID | Ort | Bezirk |
|---|---|---|
| `unterschlupf` | Jimmys alte Kammer über dem High Voltage, jetzt Zuhause der Spielfigur | Unterstadt |
| `high-voltage` | Hunters Nachtclub mit Bar, Tanzfläche, Hinterzimmer, Auftragstafel | Unterstadt |
| `dantes-werkstatt` | Werkstatt und Second-Hand-Implantate, Schallplatten, Faxgerät, Ofen | Unterstadt |
| `rostmarkt` | Basar unter Planen: Garküche, Händler, EINS!-Tische | Unterstadt |
| `neonmeile` | Straße der Leuchtreklamen, Treffpunkt der Nachtschwärmer | Unterstadt |
| `u-bahn-knoten-sued` | Große U-Bahn-Station mit Bahnsteigkiosk und Musikerecke | Unterstadt |
| `kanalisation` | Tunnel, Schleusen, Ripper-Verstecke | Unterstadt |
| `wasserturm-versteck` | Versteck der Straßenkinder im alten Wasserturm | Unterstadt |
| `schrottplatz` | Opa Gustavs Schrottplatz am Stadtrand | Unterstadt |
| `grauwasser-hafen` | Nebliger Hafen an der trüben Bucht (kein Badewasser!) | Unterstadt |
| `daecher` | Dachlandschaft mit Wassertanks, Stegen und Vegas Ausguck | Unterstadt |
| `gefaengnis-eisenkammer` | Gefängnis mit Besucherraum und Hof | Mitte |
| `justizpalast` | Gericht mit Bagatellsaal und Gerichtsgarten | Mitte |
| `sender-kanal-noxius` | Fernseh- und Radiostudio von Collin und Delya | Mitte |
| `digitech-ruine` | Verlassener Digitech-Komplex, Ort des ersten Coups | Mitte |
| `oberstadt-promenade` | Boutiquen, Glaspark, Edelcafé | Oberstadt |
| `chrome-towers` | Sitz der Chrome-Schwestern | Oberstadt |
| `quantum-tower` | Quantum Industries: Foyer, Labor, Büro, Festsaal, Serverkern | Oberstadt |
| `oednis-rand` | Staubige Ebene vor der Stadtmauer | Ödnis |
| `aussiedler-camp` | „Camp Wasserloch“ der Aussiedler | Ödnis |
| `kueste` | Das Meer: Strand, Dünen, Treibholz (spät freigeschaltet) | Küste |

Zur Silhouette auf dem Bühnenbild: Noxius liegt am **Grauwasser**, einer trüben, nebligen Bucht. Das „echte Meer“ mit Sonnenuntergang und Sand liegt Stunden entfernt hinter der Ödnis. So passt das Bühnenbild zur Sehnsucht aus dem Stück.

### 3.2 Phasen (an die Akt-Flags aus `design.md` gebunden)

| Phase | Flag | Grob |
|---|---|---|
| Akt 1 „Neu in der Crew“ | `act1` | Die Spielfigur ersetzt Jimmy, Raven sitzt noch ein, Dante will nichts von Rache wissen |
| Akt 2 „Der Rache-Job“ | `act2` | Raven ist frei, Einbruch bei Quantum, Aria gerettet, Nyra bei Quantum |
| Akt 3 „Releaseparty“ | `act3` | Party, die KI rebelliert, Blade fällt |
| Nachspiel | `epilog` (neu vorgeschlagen) | Freie Welt, Küste erreichbar, Blade im Gefängnis, KI-Splitter im Faxgerät |

Tagesabläufe gelten **für alle Phasen**, sofern nicht unter „Abweichungen“ etwas anderes steht. So bleibt die Welt in jeder Phase bevölkert.

### 3.3 Tageszeiten und Wochentage

`morgen` 06–10 · `tag` 10–17 · `abend` 17–21 · `nacht` 21–02 · Wochentage Mo–So (Tag 1 = Montag). Feste Wochentermine:

- **Di abend:** Karaoke im High Voltage (Collin moderiert, Lio spielt)
- **Do abend:** EINS!-Abend in Dantes Werkstatt (Kinder, Dante, Captain Kuschel)
- **Sa nacht:** Clubnacht „Saturday Voltage“ im High Voltage (alle Crew-Mitglieder vor Ort)
- **So tag:** Flohmarkt am Rostmarkt (Opa Gustav, Dante, Dexter)
- **Mi morgen:** Bagatellgericht im Justizpalast (Richter, Wache)

### 3.4 Fraktionen (Vorschlag für `rep`)

`crew` (Hunters Leute) · `unterstadt` (Bewohner, Händler, Kinder) · `quantum` (Konzern und Sicherheitsdienst) · `oberstadt` (Chrome-Schwestern, Promenade) · `ordnung` (Gericht, Gefängnis) · `aussiedler` (Ödnis)

---

## 4. Die Spielfigur

Die Spielfigur kommt neu in Hunters Crew und übernimmt Jimmys Platz, nachdem der sich einen Chip-Virus eingefangen hat. Sie bezieht Jimmys alte Kammer über dem High Voltage (`unterschlupf`). Gesprochen wird sie mit Namen oder „du“ angeredet (keine Pronomen-Anrede, siehe `design.md`).

### 4.1 Herkünfte

Jede Herkunft gibt +1 auf ein Attribut (Regel aus `design.md`), Startgegenstände, Startpunkte bei bestimmten Figuren und eigene Dialogoptionen über `{ origin: id }`.

#### `origin-gossenkind` – Gossenkind der Unterstadt

- **Bonus:** +1 Straße. Startgegenstände: `dietrich-set`, `eins-kartendeck`, 30 Credits.
- **Startpunkte:** Daria, Freya, Jakko je +100 (man kennt sich vom Sehen), Babette Bao +100, Ripper −100 („Du schuldest mir noch was von damals.“).
- **Spielgefühl:** Kennt Abkürzungen, Hehlerpreise und Kanaldeckel. Händler am Rostmarkt geben 5 % Nachlass.
- **Exklusive Optionen:**
  - `[Gosse]` bei Ripper: „Den Trick mit dem verseuchten Implantat hast du schon vor fünf Jahren gebracht. Zahl, oder ich erzähl's rum.“
  - `[Gosse]` bei den Kindern: als Gleichgesinnte:r sofort ins Wasserturm-Versteck eingeladen.
  - `[Gosse]` in der Kanalisation: Notausstieg ohne Check finden.

#### `origin-oberstadt` – Oberstadt-Abtrünnige:r

- **Bonus:** +1 Ausstrahlung. Startgegenstände: `alte-zugangskarte` (öffnet einmal eine Seitentür an der Promenade), `taschenspiegel-gold`, 120 Credits.
- **Startpunkte:** Seraphina, Sybella, Serenity je +100, Collin +100, Aria −100 („Noch so 'ne Pinkelnase.“).
- **Spielgefühl:** Weiß, welche Gabel man nimmt und wie Konzernsprache klingt. Erkennt Blades Verkaufsrhetorik.
- **Exklusive Optionen:**
  - `[Oberstadt]` bei Blade: „Sie verkaufen Gedankenkontrolle als Wellness-Paket. Meine Familie hat dasselbe mit Wasser gemacht.“
  - `[Oberstadt]` an der Promenade: Türsteher lassen ohne Check durch.
  - `[Oberstadt]` bei Aria (Versöhnung): ehrlich erzählen, warum man gegangen ist.

#### `origin-oednis` – Aus der Ödnis

- **Bonus:** +1 Körper. Startgegenstände: `wasserkanister`, `kuestenkarte-fragment`, `wuestenrose`, 40 Credits.
- **Startpunkte:** Nyra +100, Marla Sand +200, Hunter +100 („Aussiedler, was? Hab da mal drüber nachgedacht.“).
- **Spielgefühl:** Ausdauernd, findet Wasser, liest Sandstürme. Bewegung in der Ödnis kostet keine Zusatzzeit.
- **Exklusive Optionen:**
  - `[Ödnis]` bei Nyra: „Das Meer gibt es wirklich. Mein Großvater hat Muscheln davon mitgebracht.“
  - `[Ödnis]` bei Hunter (Akt 3): Hunters „Lass uns abhauen und Aussiedler werden“ ernsthaft durchrechnen.
  - `[Ödnis]` im Aussiedler-Camp: Handelspreise wie ein Einheimischer.

#### `origin-ex-wache` – Ex-Konzernwache

- **Bonus:** +1 Reflexe. Startgegenstände: `alte-dienstmarke`, `schockschlagstock`, 60 Credits.
- **Startpunkte:** Wache +200, Xion Venom −100 („Du warst doch die Schlafmütze aus Schicht C.“), Richter +100.
- **Spielgefühl:** Kennt Patrouillen, Funkcodes und die Kantinenzeiten.
- **Exklusive Optionen:**
  - `[Ex-Wache]` an Quantum-Kontrollpunkten: „Code Grau, Schichtwechsel vorgezogen.“ (Wachen ziehen ab)
  - `[Ex-Wache]` bei der Wache: gemeinsame Erinnerungen an die schlechteste Kantine der Stadt.
  - `[Ex-Wache]` bei Xion: ihn mit seinen eigenen Dienstvorschriften aus dem Konzept bringen.

#### `origin-schrott` – Schrottplatz-Tüftler:in

- **Bonus:** +1 Technik. Startgegenstände: `werkzeuggurt-rostig`, `loetkolben-alt`, 50 Credits.
- **Startpunkte:** Opa Gustav +200, Dante +100, Bolzen +100.
- **Spielgefühl:** Erkennt Implantate auf einen Blick, repariert Türen statt sie aufzubrechen.
- **Exklusive Optionen:**
  - `[Schrott]` bei Dante: Fachsimpeln über Röhrenverstärker, öffnet früher sein Vertrauen.
  - `[Schrott]` bei Ripper: Fälschungen sofort entlarven („Das Typenschild ist aufgeklebt.“).
  - `[Schrott]` bei Alesa: ihr zeigen, dass der Zentrator falsch herum sitzt.

#### `origin-knastvogel` – Frisch entlassen

- **Bonus:** +1 Straße oder +1 Körper (wählbar). Startgegenstände: `knast-loeffel`, `entlassungsschein`, 10 Credits.
- **Startpunkte:** Raven +200 (Zellennachbarschaft in der Eisenkammer), Richter −100, Wache +100 (Running Gag startet sofort: „Ich hoffe für Sie, dass wir uns nicht wiedersehen.“ – man sieht sich am selben Tag wieder).
- **Spielgefühl:** Harte Schale, Knastsprache, Verbindungen nach drinnen. Besuchszeiten im Gefängnis ohne Anmeldung.
- **Exklusive Optionen:**
  - `[Knast]` bei Raven (Akt 1): Nachrichten durch die Wand klopfen, Raven früher kennenlernen.
  - `[Knast]` bei Blade (Nachspiel): „Willkommen im Club. Das Essen ist schlechter als dein Buffet.“
  - `[Knast]` bei Wachen: wissen, wann sie Pause machen.

### 4.2 Aussehen

Sechs vorgefertigte Aussehen, jeweils mit fester Grundsilhouette. Hautton und Haarfarbe sind aus einer kleinen Palette wählbar (Recolor), Kleidung und Schnitt nicht. Alle tragen das schwarze Gurtzeug.

| ID | Name | Beschreibung |
|---|---|---|
| `look-neonbomber` | Neon-Bomber | Kurze petrolfarbene Bomberjacke mit pinken Leuchtstreifen, Undercut, zwei Klebe-LEDs an der Schläfe, Cargohose |
| `look-staubmantel` | Staubmantel | Langer sandfarbener Mantel, Halstuch, Schutzbrille auf der Stirn, geflochtene Zöpfe oder kurzes Haar, sonnengegerbte Haut, Stiefel mit Riemen |
| `look-schrottoverall` | Schrott-Overall | Ölverschmierter orangefarbener Overall, halb heruntergeklappt, Werkzeuggurt, Lupenbrille, Locken unter einer Schirmmütze |
| `look-samtsakko` | Samtsakko | Violettes Samtsakko über weißem Hemd, polierter Seitenscheitel, kleines Monokel-Display, Lederhandschuhe |
| `look-kapuzenschatten` | Kapuzenschatten | Schwarzer Hoodie mit weißem Zeichenmuster, Stoff-Halbmaske um den Hals, fingerlose Handschuhe, Turnschuhe mit Neonsohle |
| `look-flickenjeans` | Flicken-Jeans | Ausgewaschene Jeansjacke mit Aufnähern (Stern, Blitz, Smiley), Strickmütze, Sommersprossen, Kopfhörer um den Hals |

Einige Figuren kommentieren das Aussehen einmalig beim ersten Gespräch (z. B. Dante zum Overall: „Endlich jemand, der weiß, wofür Taschen da sind!“, Blade zum Samtsakko: „Geschmack. In der Unterstadt. Erstaunlich.“, Aria zum Kapuzenschatten: „Cool. Aber wenn du mich erschreckst, gibt's den Schläger.“).

---

## 5. Geschenkkatalog

Alle IDs, die in den Figuren-Abschnitten vorkommen. Kategorie `geschenk`, sofern nicht anders angegeben. „Quelle“ ist ein Vorschlag für Fundort oder Händler.

### 5.1 Essen und Trinken

| ID | Name | Beschreibung | Quelle |
|---|---|---|---|
| `snackers-riegel` | Snackers-Riegel | Schokoriegel mit Erdnuss. Dantes Allzweckmittel gegen schlechte Laune | Bahnsteigkiosk, Rostmarkt |
| `dantes-kekse` | Dantes Kekse | Leicht angekokelte Schokokekse vom Blech | Dante (ab 2 Herzen geschenkt), Keksalarm-Ereignis |
| `drei-sekunden-keks` | Drei-Sekunden-Keks | Ein Keks, der kurz am Boden lag. Spaltet die Stadt | Dantes Werkstatt nach dem Keksalarm |
| `chips-tuete` | Knusperchips | Angebrochene Tüte, noch knusprig | Kiosk |
| `bao-dampfnudel` | Babettes Dampfnudel | Weich, süß, mit Synth-Vanillesoße | Babette Bao |
| `instant-nudeln` | Instant-Nudeln „Turbo-Ramen“ | Drei Minuten, oder zwei, wenn man ungeduldig ist | Kiosk |
| `neon-limo` | Neon-Limo | Leuchtet im Dunkeln, schmeckt nach Himbeere | High Voltage |
| `volt-cola` | Volt-Cola | Hauseigene Koffeinbrause des High Voltage | High Voltage |
| `synth-kaffee` | Synth-Kaffee | Riecht nach Kaffee, schmeckt nach Mut | Rostmarkt |
| `tai-chi-tee` | Tee „Innere Mitte“ | Kräutertee, den Dante gegen Aggressionsprobleme empfiehlt | Babette Bao |
| `edelbrause-gold` | Goldene Edelbrause | Oberstadt-Prickelwasser mit Blattgold, alkoholfrei | Promenade |
| `echtobst-apfel` | Echter Apfel | Ein richtiger, gewachsener Apfel. 2086 ein Luxus | Promenade, Aussiedler-Camp |
| `kaktusfrucht` | Kaktusfrucht | Stachelig außen, süß innen | Ödnis |
| `algen-chips` | Algen-Chips | Salzig, grün, Hafenspezialität | Grauwasser-Hafen |
| `kraeuter-gebaeck` | Kräutergebäck | Würzige Kekse aus dem Gerichtsgarten | Richter (Rezept), Babette |

### 5.2 Retro, Kultur und Spiel

| ID | Name | Beschreibung | Quelle |
|---|---|---|---|
| `vinyl-schallplatte` | Schallplatte | Echtes Vinyl, leicht verzogen | Flohmarkt, Schrottplatz |
| `vinyl-raritaet` | Vinyl-Rarität „Saturday Night“ | Erstpressung des Clubhits | Persönliche Quest Dante |
| `vhs-kassette` | VHS-Kassette | Beschriftet mit „NICHT ÜBERSPIELEN“ | Flohmarkt |
| `faxpapier-rolle` | Faxpapierrolle | Thermopapier, raschelt | Schrottplatz |
| `eins-kartendeck` | EINS!-Kartendeck | Abgegriffen, zwei „Vier ziehen“ zu viel | Kiosk, Kinder |
| `comic-heft-alt` | Altes Comicheft | Papier! Mit Eselsohren | Flohmarkt |
| `haiku-buechlein` | Dreizeiler-Büchlein | Winzige Gedichte, handgebunden | Lio Funkel |
| `liebesroman-papier` | Liebesroman „Herz aus Chrom“ | Groschenroman, rosa Umschlag | Promenade |
| `reporter-notizbuch` | Reporter-Notizbuch | Spiralbindung, wasserfest, mit Bleistift | Kiosk, Sender |
| `zeitung-papier` | Gedruckte Zeitung | Seltenes Papierexemplar vom Aussiedler-Drucker | Aussiedler-Camp |
| `planungsbrett-glas` | Gläsernes Strategiespiel | Edles Brettspiel aus Glas | Promenade |
| `lio-demo-chip` | Lios Demo-Chip | Drei Lieder über die Unterstadt | Lio Funkel (ab 4 Herzen) |
| `poster-high-voltage` | High-Voltage-Plakat | Neonplakat der Clubnacht | High Voltage |
| `autogrammkarte-collin` | Collins Autogrammkarte | Mit Kussmund-Aufkleber und Glitzer | Collin |

### 5.3 Meer und Ödnis

| ID | Name | Beschreibung | Quelle |
|---|---|---|---|
| `meeres-postkarte` | Postkarte vom Meer | Vergilbt, Sonnenuntergang, Rückseite unleserlich | Flohmarkt, Marla Sand |
| `fossile-muschel` | Fossile Muschel | Versteinert, aus der Ödnis | Ödnis-Rand |
| `muschel-frisch` | Muschel vom Strand | Glänzend, riecht nach Salz | Küste (Nachspiel) |
| `sandflasche` | Flasche mit Sand | Feiner heller Sand mit Korken | Aussiedler-Camp, Küste |
| `treibholz` | Treibholz | Glatt geschliffen | Küste, selten am Hafen |
| `wuestenrose` | Wüstenrose | Kristallblüte aus Sand | Ödnis |
| `wasserkanister` | Wasserkanister | Voll, schwer, wertvoll | Aussiedler-Camp |
| `sternkarte` | Leuchtende Sternkarte | Druck der Sterne, die man über Noxius nie sieht | Promenade, Aussiedler-Camp |
| `wasserfilter` | Wasserfilter | Selbstgebaut, filtert sogar Grauwasser (`quest`/`geschenk`) | `pq-alesa-zentrator`, Dante |
| `kuestenkarte-fragment` | Küstenkarten-Fragment | Ein Viertel einer alten Route zum Meer (`quest`) | Herkunft Ödnis, Marla |
| `sonnencreme-lsf100` | Sonnencreme LSF 100 | Für Leute, die noch nie Sonne gesehen haben | Promenade |

### 5.4 Technik und Werkzeug

| ID | Name | Beschreibung | Quelle |
|---|---|---|---|
| `loetkolben-gold` | Goldener Lötkolben | Profiwerkzeug mit Präzisionsspitze | Promenade, Gustav |
| `loetkolben-alt` | Alter Lötkolben | Wackelkontakt inklusive | Herkunft Schrott |
| `werkzeuggurt-rostig` | Rostiger Werkzeuggurt | Mit sieben Schraubendrehern, alle krumm | Herkunft Schrott |
| `zielfernrohr-linse` | Zielfernrohr-Linse | Geschliffene Präzisionslinse | Rostmarkt, Gustav |
| `griffband-schlaeger` | Griffband | Rot-schwarzes Griffband für Baseballschläger | Rostmarkt |
| `zerberster-oel` | Gelenköl „Zerberster“ | Pflegeöl für schwere Armimplantate | Dante, Ripper |
| `alter-neurochip` | Alter Neurochip | Veraltet, ungefährlich, gut zum Basteln | Schrott, Kanalisation |
| `defekter-neurochip` | Defekter Neurochip | Verschmort, riecht nach Ärger | Quantum-Labor, Kanalisation |
| `virus-implantat` | Verseuchtes Implantat | „Der größte Müll“ – flackert verdächtig | Kanalisation, Ripper |
| `seltenes-implantat` | Seltenes Implantat | Unbenutzt, in Originalfolie | Quantum, Kopfgeldaufträge |
| `datenkristall` | Datenkristall | Leerer Hochleistungsspeicher | Rostmarkt |
| `schach-modul` | Schach-Modul | Steckmodul mit einer Million Eröffnungen | Promenade |
| `logik-raetsel-modul` | Rätsel-Modul | Unlösbare Logikrätsel (angeblich) | Sender-Gewinnspiel |
| `enzyklopaedie-chip` | Enzyklopädie-Chip | Gesamtes Wissen von 2040, leicht veraltet | Digitech-Ruine |
| `katzenvideo-archiv` | Katzenvideo-Archiv | 40 000 Stunden Katzen | Jimmy, Flohmarkt |
| `peilsender` | Peilsender | Winzig, blinkt rot | Quantum (Story) |
| `magnet-stoerer` | Magnetstörer | Löscht Speicher in der Nähe | Gustav |
| `drohnen-propeller` | Drohnenpropeller | Ersatzteil, scharfkantig | Schrottplatz |
| `kamera-objektiv` | Weitwinkelobjektiv | Profi-Objektiv | Promenade |
| `mikrofon-puschel` | Mikrofon-Windschutz | Flauschiger Puschel in Pink | Sender |
| `teleprompter-chip` | Teleprompter-Chip | Zeigt Text direkt aufs Auge | Sender |
| `klingenpolitur` | Klingenpolitur | Für leuchtende Klingen | Rostmarkt |
| `schweissbrille-gelb` | Gelbe Schweißbrille | Messingrahmen, gelbe Gläser | Schrottplatz |
| `gruene-augenlinse` | Grüne Augenlinse | Leuchtende Ersatzlinse für Kunstaugen | Ripper |
| `klauen-schleifstein` | Klauen-Schleifstein | Für Krallenimplantate | Ripper |
| `oelkaennchen` | Ölkännchen | Kleines Kännchen Maschinenöl | Gustav |
| `quietsche-mutter` | Quietsche-Mutter | Große Schraubenmutter mit Gummiüberzug, quietscht | Gustav |
| `rostige-schraube` | Rostige Schraube | Für die meisten Müll, für Gustav Geschichte | überall |
| `alte-euromuenze` | Alte Euromünze | Zwei Euro von 2031 | Schrottplatz, Kanalisation |

### 5.5 Mode, Luxus und Oberstadt

| ID | Name | Beschreibung | Quelle |
|---|---|---|---|
| `goldknauf` | Goldener Stockknauf | Kugelknauf für Spazierstöcke | Promenade |
| `teddyfell-buerste` | Teddyfell-Bürste | Für flauschige Mäntel | Promenade |
| `taschenspiegel-gold` | Goldener Taschenspiegel | Zeigt einen immer von der besten Seite | Promenade |
| `seidentuch-blau` | Blaues Seidentuch | Königsblau | Promenade |
| `seidentuch-rot` | Rotes Seidentuch | Signalrot | Promenade |
| `seidentuch-gruen` | Grünes Seidentuch | Smaragdgrün | Promenade |
| `chrome-10-gutschein` | „Chrome 10“-Gutschein | Zehn Prozent auf alles, was die Schwestern verkaufen | Sybella, Sender-Gewinnspiel |
| `sonnenbrille-gold` | Goldene Sonnenbrille | Schwarze Gläser, Goldbügel | Promenade |
| `rosa-seidenhemd` | Rosa Seidenhemd | Wie Hunters, nur eine Nummer schicker | Promenade |
| `schwarzer-lippenstift` | Schwarzer Lippenstift | Matt, kussfest | Neonmeile |
| `wurfmesser-poliert` | Poliertes Wurfmesser | Ausgewogen, mit Lederscheide | Rostmarkt |
| `parfuem-ozon` | Parfüm „Ozon“ | Riecht nach Gewitter | Promenade |
| `haarspray-extrahalt` | Haarspray Extrahalt | Hält jede Frisur bei Windstärke 9 | Promenade |
| `samtfliege` | Samtfliege | Schwarze Fliege in Plüschtiergröße | Rostmarkt |
| `laborkittel-neu` | Neuer Laborkittel | Strahlend weiß, mit Platinen-Aufnähern | Promenade |
| `feuerloescher-mini` | Mini-Feuerlöscher | Für die Handtasche | Kiosk |

### 5.6 Kinder, Plüsch, Kleinkram und Ärgernisse

| ID | Name | Beschreibung | Quelle |
|---|---|---|---|
| `plueschmoehre` | Plüschmöhre | Orange, weich, mit Knopfaugen | Rostmarkt |
| `nadel-und-faden` | Nadel und Faden | Zum Flicken von Plüschohren | Babette |
| `waschpulver` | Waschpulver | „Strahlend sauber!“ – der Albtraum jedes Plüschhasen | Kiosk |
| `neonkreide` | Neonkreide | Leuchtende Straßenkreide | Kiosk |
| `stickerbogen` | Stickerbogen | Sterne, Blitze, Smileys | Kiosk |
| `aufzieh-roboter` | Aufzieh-Roboter | Blechroboter, läuft im Kreis | Flohmarkt |
| `murmelbeutel` | Murmelbeutel | Glasmurmeln mit Galaxien drin | Flohmarkt |
| `glitzerschrott` | Glitzerschrott | Ein schimmerndes Stück irgendwas | Schrottplatz, Kanalisation |
| `blumensamen` | Blumensamen | Echte Saat, selten | Aussiedler-Camp |
| `gesetzbuch-papier` | Gesetzbuch auf Papier | 2000 Seiten, Lesebändchen | Justizpalast |
| `stempelkissen` | Stempelkissen | Violett, unverbraucht | Justizpalast |
| `raubkopie-stick` | Raubkopie-Stick | 10 000 Stunden illegal gestreamte Musik und Filme | Dexter, Jimmy |
| `beglichener-schuldschein` | Beglichener Schuldschein | Beweis, dass jemand bezahlt hat | Aufträge „Schulden eintreiben“ |
| `kassenbuch` | Ledergebundenes Kassenbuch | Für Zahlenmenschen | Rostmarkt |
| `handschellen` | Handschellen | Verchromt, mit Schlüssel | Quantum-Wachen |
| `dietrich-set` | Dietrich-Set | Sieben Häkchen in einer Ledertasche | Rostmarkt, Herkunft Gosse |
| `kanalschlamm` | Kanalschlamm | Ein Klumpen. Warum hast du das eingesteckt? | Kanalisation |
| `rechenfibel` | Rechenfibel „Zahlen sind deine Freunde“ | Kinderbuch für Grundschüler | Flohmarkt |
| `taxi-duftbaum` | Duftbaum „Neonzitrone“ | Für Schwebetaxis | Kiosk |
| `ersatz-rotor` | Ersatz-Hubrotor | Für Schwebetaxis | Gustav |
| `akkordeon-balg` | Akkordeonbalg | Ersatzbalg, faltig, intakt | Flohmarkt |
| `samenbombe` | Samenbombe | Erde, Saat, Ton – für grüne Ecken | Marla Sand |
| `plastikpflanze` | Plastikpflanze | Täuschend echt. Leider nur täuschend | Kiosk, Promenade |
| `pinzetten-set` | Präzisionspinzetten | Sieben Stück, Laborqualität | Promenade |

**Universell:** Alle mögen `echtobst-apfel` (außer der KI und Bolzen, die neutral sind). Alle hassen `kanalschlamm` (außer Bolzen, der ihn liebt) und `virus-implantat`. Fast alle mögen `dantes-kekse`, außer wer Dante nicht ausstehen kann.

### 5.7 Startgegenstände, Andenken und Belohnungen

Keine Geschenke, sondern Gegenstände, die Figuren der Spielfigur geben. Kategorie in Klammern.

| ID | Name | Herkunft | Wirkung |
|---|---|---|---|
| `alte-zugangskarte` | Abgelaufene Oberstadt-Karte (`quest`) | `origin-oberstadt` | öffnet einmal eine Seitentür an der Promenade |
| `alte-dienstmarke` | Alte Dienstmarke (`quest`) | `origin-ex-wache` | Voraussetzung für einige `[Ex-Wache]`-Optionen |
| `schockschlagstock` | Schockschlagstock (`waffe`) | `origin-ex-wache` | Nahkampf, Treffer macht `betaeubt` bei kritischem Schaden |
| `knast-loeffel` | Knast-Löffel (`waffe`) | `origin-knastvogel` | schwache Nahkampfwaffe, +1 Einschüchtern |
| `entlassungsschein` | Entlassungsschein (`quest`) | `origin-knastvogel` | Besuchszeiten ohne Anmeldung |
| `tragbares-fax` | Tragbares Faxgerät (`quest`) | `pq-ki-nexus-seele` | trägt den KI-Splitter |
| `hunters-sonnenbrille` | Hunters Sonnenbrille (`kleidung`) | `he-hunter-10` | +1 Ausstrahlung |
| `ravens-klinge` | Ravens Klinge (`waffe`) | `he-raven-10` | Nahkampf, +15 Treffer bei Flanke |
| `dantes-altes-deck` | Dantes altes Deck (`waffe`, Smart) | `he-dante-8` | Hack-Waffe, +1 Technik bei Hacks |
| `kekse-rezept` | Rezept: Dantes Kekse (`quest`) | `he-dante-10` | `dantes-kekse` herstellbar |
| `vegas-zielfernrohr` | Vegas Ersatzzielfernrohr (`cyberware`, `augen`) | `he-vega-10` | +10 Treffer im Fernkampf |
| `arias-ersatzschlaeger` | Arias Ersatzschläger (`waffe`) | `he-aria-10` | Nahkampf, stößt Ziel 1 Feld zurück |
| `nyra-wellenchip` | Wellenchip (`cyberware`, `nervensystem`) | `he-nyra-10` | +1 Technik |
| `blades-visitenkarte` | Goldene Visitenkarte (`quest`) | `he-blade-2` | öffnet einmal das Quantum-Foyer |
| `blades-geheimfach` | Code zu Blades Geheimfach (`quest`) | `he-blade-10` | Versteck mit Credits und seltener Cyberware |
| `zero-prototyp` | Zero-Prototyp (`cyberware`, `augen`) | `he-alesa-zero-10` | +1 Reflexe; nachts leuchten die Augen pink (rein optisch) |
| `xion-passierschein` | Xions Passierschein (`quest`) | `he-xion-venom-4` | einmal an einem Quantum-Kontrollpunkt durchgewunken |
| `xion-vip-band` | VIP-Band (`kleidung`) | `he-xion-venom-10` | freier Eintritt in Clubs, Ruf `unterstadt` +5 |
| `chrome-mitgliedskarte` | Chrome-Mitgliedskarte (`quest`) | `he-seraphina-chrome-10` | freier Zugang zur Promenade, −10 % dort |
| `goldene-kundenkarte` | Goldene Kundenkarte (`quest`) | `he-sybella-chrome-10` | −10 % in allen Oberstadt-Läden (ersetzt „Chrome 10“) |
| `serenitys-ring` | Serenitys grüner Ring (`kleidung`) | `he-serenity-chrome-10` | +1 Ausstrahlung in der Oberstadt, Pflanzenfunde sichtbar |
| `nexus-splitter` | Nexus-Splitter (`cyberware`, `kopf`) | `he-ki-nexus-10` | markiert zu Kampfbeginn den stärksten Gegner |
| `goldenes-mikro` | Goldenes Mikro (`kleidung`) | `he-collin-charleston-10` | +1 Ausstrahlung bei Reden vor Gruppen |
| `presseausweis` | Presseausweis (`quest`) | `he-delya-delloraine-10` | Zugang zu Pressebereichen und geschlossenen Verhandlungen |
| `kameradrohne` | Kameradrohne (`verbrauch`, wiederaufladbar) | `he-kameramann-10` | einmal pro Kampf „Luftbild“ |
| `rippers-lupe` | Rippers Lupe (`kleidung`) | `he-ripper-10` | +1 Technik bei Implantat-Checks, zeigt Händlerwerte |
| `signature-limo` | Hausgetränk der Spielfigur (`verbrauch`) | `he-barkeeper-8` | heilt 15 LP |
| `barkeeper-maske` | Zweite Maske (`kleidung`) | `he-barkeeper-10` | +1 Reflexe |
| `bandenabzeichen` | Abzeichen der Wasserturm-Bande (`kleidung`) | `he-daria-10` | Gerüchte und Verstecke auf der Karte |
| `fairness-stempel` | Fairness-Stempel (`quest`) | `he-freya-10` | −5 % bei Rostmarkt-Händlern |
| `jakkos-rezept` | Jakkos Rezept (`quest`) | `he-jakko-10` | Heilgericht herstellbar |
| `captain-kuschel-talisman` | Captain Kuschel (Talisman, `kleidung`) | `he-captain-kuschel-10` | „Große Ohren“ (siehe 9.4) |
| `richterhammer-mini` | Mini-Richterhammer (`kleidung`) | `he-richter-10` | +1 Ausstrahlung beim Schlichten |
| `wachen-strichliste` | Die Strichliste (`kleidung`) | `he-wache-10` | +1 Straße bei Checks mit Wachen |
| `jimmys-glueckschip` | Jimmys Glückschip (`cyberware`, `nervensystem`) | `he-jimmy-10` | einmal pro Tag +1 auf einen Check |
| `dexters-schuldbuch` | Dexters Schuldbuch (`quest`) | `he-dexter-10` | zeigt offene Schulden in der Stadt als Aufträge |
| `babettes-kochloeffel` | Babettes Kochlöffel (`waffe`) | `he-babette-bao-10` | Nahkampf, jeder Treffer heilt die Spielfigur um 2 LP |
| `schrottkrone` | Die Schrottkrone (`kleidung`) | `he-opa-gustav-10` | +5 % Ankaufspreis |
| `kikis-taxikarte` | Kikis Taxikarte (`quest`) | `he-kiki-karbon-10` | Gratisfahrten im Schwebetaxi |
| `marlas-wasserstab` | Marlas Wasserstab (`waffe`) | `he-marla-sand-10` | findet Wasserverstecke in der Ödnis |
| `lio-album` | Lios Album (`sammeln`) | `he-lio-funkel-10` | Musik im Unterschlupf; am Folgetag +1 Ausstrahlung |
| `pims-mikrokaefer` | Pims Mikrokäfer (`verbrauch`, wiederaufladbar) | `he-pim-pinzette-10` | Späher: zeigt Wachen auf der aktuellen Karte |
| `bolzens-marke` | Bolzens Hundemarke (`sammeln`) | `he-bolzen-10` | Bolzen findet täglich einen versteckten Gegenstand |
| `logbuch-oma` | Großmutters Logbuch (`quest`) | `he-kaeptn-nebelhorn-8` | Ersatzweg zur Küstenroute, Inselmarkierung |
| `nebelhorn-mini` | Mini-Nebelhorn (`verbrauch`, wiederaufladbar) | `he-kaeptn-nebelhorn-10` | einmal pro Kampf alle Gegner `betaeubt` für 1 Runde |

---

## 6. Hunters Crew

Aufbau jedes Eintrags: Kurzprofil · Persönlichkeit · Sprechweise · Tagesablauf · Geschenke · Herz-Ereignisse · Persönliche Quest · Rivalität · Begleiter · Romanze · Herkunft · Beispiel-Checks. Beispielsätze sind eigene Formulierungen im Geist des Drehbuchs, keine Zitate.

### 6.1 Hunter — `hunter`

**Kurzprofil:** Kopf der Crew und Besitzer des „High Voltage“, eines der besten Clubs der Unterstadt. Rosa Hemd, langer schwarzer Mantel, dunkle Sonnenbrille, gepflegter Bart. Fraktion `crew`. Er holt die Spielfigur als Ersatz für Jimmy.

**Persönlichkeit:** Planer und Antreiber, ungeduldig, wird ohne Essen „zur Diva“. Hat einen festen Ehrenkodex: Schulden werden beglichen, Kinder werden nicht abgezockt. Wirkt kühl, ist aber sentimental (er hebt für Raven das Glas). Hat heimlich einen Traum: einen Club am Meer.

**Sprechweise:** Kurze Ansagen, gern mit „Korrigiere:“ oder „Hervorragend.“ Nennt die Crew „Leute“, „Welpen“ oder beim Nachnamen der Aufgabe („Schmiere“, „Technik“). Trinksprüche mit Pathos.
- „Korrigiere: Du bist nicht spät. Du bist so spät, dass es schon wieder früh ist.“
- „In meinem Laden verjähren Schulden nicht. Nur Ausreden.“
- „Hervorragend. Ein Plan, der nur zur Hälfte schiefgehen kann. Das ist neuer Rekord.“

**Tagesablauf**

| Morgen | Tag | Abend | Nacht |
|---|---|---|---|
| `high-voltage` Hinterzimmer, Kassenbuch und Synth-Kaffee | Mo/Mi/Fr `rostmarkt` (Lieferanten), sonst `high-voltage` Büro | `high-voltage` Tresen | `high-voltage` Galerie über der Tanzfläche |

Abweichungen: So tag `grauwasser-hafen` (angelt allein im Nebel, verrät es niemandem). `act3`: abends `dantes-werkstatt` (Planung). `epilog`: Mi und Sa tag `kueste` (sucht einen Platz für den Strandclub).

**Geschenke**
- Liebling: `beglichener-schuldschein`, `rosa-seidenhemd`, `sonnenbrille-gold`
- Gemocht: `kassenbuch`, `synth-kaffee`, `bao-dampfnudel`, `poster-high-voltage`, `echtobst-apfel`
- Mag nicht: `tai-chi-tee` („Ich habe keine Aggressionsprobleme!“), `eins-kartendeck`
- Gehasst: `snackers-riegel` (bis `he-hunter-4`, danach Liebling), `kanalschlamm`, `virus-implantat`

**Herz-Ereignisse**

| ♥ | ID | Ort · Zeit · Auslöser | Inhalt |
|---|---|---|---|
| 2 | `he-hunter-2` | `high-voltage`, Abend, Tresen | Hunter lässt die Spielfigur die Kasse zählen („Zähl laut, ich hör mit.“). Danach schiebt er eine Kiste mit Jimmys Sachen herüber: „Falls du was brauchst. Wegwerfen konnte ich's nicht.“ |
| 4 | `he-hunter-4` | `high-voltage`, Morgen, Büro betreten | Hunter ist übellaunig, weil er seit der Planung nichts gegessen hat. Wer ihm Essen bringt, erlebt, wie er widerwillig zugibt, dass Dante mit dem Riegel recht hatte. Snackers wird sein Lieblingsgeschenk. |
| 6 | `he-hunter-6` | `grauwasser-hafen`, So tag | Die Spielfigur findet Hunter beim Angeln (Fang: ein Stiefel). Er erzählt vom offenen Wasser hinter der Ödnis und von seiner Idee eines Strandclubs. Schaltet `pq-hunter-strandclub` frei. |
| 8 | `he-hunter-8` | `high-voltage`, Nacht nach Schließung | Hunter zeigt die Fotowand der alten Crew (Blade, Raven, Dante, Jimmy). Er gibt zu, dass er sich für Jimmy verantwortlich fühlt, und überreicht den Hinterzimmer-Schlüssel (Zugang zum Crew-Lager). Romanzefassung: Er bittet um einen Tanz auf der leeren Tanzfläche. |
| 10 | `he-hunter-10` | `high-voltage`, Sa nacht (im `epilog` am Strandclub) | Hunter stoppt die Musik und erhebt das Glas: „Auf [Name]!“ – der ganze Club antwortet. Die Spielfigur wird Teilhaber:in und erhält `hunters-sonnenbrille`. Romanzefassung: Danach Spaziergang auf dem Dach, Händchen haltend, Hunter bleibt zum ersten Mal still. |

**Persönliche Quest – `pq-hunter-strandclub` „Sand unter der Theke“:** Hunter will am Meer einen Club eröffnen, „wenn der Weg nicht so weit wäre“. Schritte: Route über `kuestenkarte-fragment` klären (mit Marla Sand), Lieferanten finden (Aussiedler-Camp: Wasser und Obst), Personal anwerben (Barkeeper, Lio Funkel als Band), Startkapital eintreiben (drei offene Schulden von Dexter). Ab `epilog` eröffnet der Strandclub „Ebbe & Flut“ an der `kueste` als neuer Treffpunkt mit Auftragstafel.

**Rivalität:** −2 `re-hunter-2`: Hunter verlangt Miete für Jimmys Kammer (20 Credits pro Woche). −5 `re-hunter-5`: Auf der Auftragstafel tauchen für die Spielfigur nur noch Botengänge auf, Vega und Aria verlieren je −30. −8 `re-hunter-8`: Hunter setzt die Spielfigur vor die Tür; Schlafplatz wird Dantes Werkstattsofa (kein Spielabbruch). Konfrontation als Rededuell im Club ([Ausstrahlung 8] oder [Straße 8]) oder Bezahlen aller „Schulden“. Versöhnung: `pq-hunter-reiner-tisch` (drei Aufträge ohne Bezahlung erledigen).

**Begleiter:** ja, ab `act2` (vorher „hält die Stellung“). Rolle: Anführer und Unterstützer, Fernkampf mit Trommelrevolver (Schockpatronen).
- „Schmiere stehen“ (1 AP): Alle Verbündeten im Umkreis von 3 Feldern gehen in Überwachung.
- „Lagebesprechung“ (2 AP): Ein Verbündeter erhält in der nächsten Runde +1 AP. Abklingzeit 2 Runden.
- ab 6 ♥ „Wer zahlt, schafft an“ (2 AP): Einschüchtern mit Hunters Ausstrahlung; Gegner unter 50 % Moral ergeben sich.

**Romanze:** romanzierbar (Kennzeichen), erwachsen.

**Herkunft:** `origin-oednis`: „Aussiedler? Ich hab mal ernsthaft drüber nachgedacht. Dann fiel mir ein, dass es da keine Theke gibt.“ · `origin-knastvogel`: fragt sofort nach Raven. · `origin-oberstadt`: misstrauisch, erster Auftrag ist ein Loyalitätstest. · `origin-ex-wache`: „Du kennst Konzernschichtpläne? Das ist mehr wert als Gold.“ · `origin-gossenkind`: „Dein Gesicht kenn ich. Du hast mal Gläser bei mir mitgehen lassen.“ · `origin-schrott`: kleiner Sofortauftrag (Kühlung im Clubkeller reparieren).

**Beispiel-Checks:** [Ausstrahlung 6] Hunter überreden, den Kindern für einen Botengang mehr zu zahlen · [Straße 5] merken, dass Hunter mehr weiß, als er zugibt · [Technik 7] die Lichtanlage vor der Clubnacht retten.

---

### 6.2 Raven — `raven`

**Kurzprofil:** Die Frau fürs Grobe, scharfsinnig und stolz. Saß sieben Jahre, weil Blade sie im Labor an ein Rohr gekettet hat. Schwarzes Oberteil mit Spitze, Lederrock, weite schwarze Ärmel, dunkle Locken, schwarze Lippen mit einem Strich zum Kinn. Fraktion `crew`.

**Persönlichkeit:** Fokussiert, trocken, nachtragend gegenüber Blade, hasst Warten und Fesseln. Unter der Rüstung: Sie mag Dante mehr, als sie zugibt, und sie freut sich an Kleinigkeiten wie Neonfarben nach Jahren grauer Zellenwände.

**Sprechweise:** Gegenfragen, Spott, knappe Aufforderungen („Komm zum Punkt.“). Höflichkeit nur ironisch.
- „Wenn du so lieb fragst, überlege ich es mir. Ganz kurz.“
- „Sieben Jahre. Genug Zeit, um sich Gemeinheiten auszudenken. Ich hab ein Notizbuch voll.“
- „Fang an. Ich hasse Warten fast so sehr wie Handschellen.“

**Tagesablauf**

| Phase | Morgen | Tag | Abend | Nacht |
|---|---|---|---|---|
| `act1` | `gefaengnis-eisenkammer` (away) | Di/Do/Sa Besucherraum der `gefaengnis-eisenkammer`, sonst away | away | away |
| ab `act2` | `daecher` (Training mit Kabelseil) | `rostmarkt` Messerschleifer (Mo–Mi), `neonmeile` (Do–So) | `high-voltage` Bar | `neonmeile` unter den Leuchtreklamen |

Abweichungen: Do abend `dantes-werkstatt` (tut so, als schaue sie beim EINS! nicht zu). `epilog`: Morgen abwechselnd `kueste`.

**Geschenke**
- Liebling: `wurfmesser-poliert`, `schwarzer-lippenstift`, `dietrich-set`
- Gemocht: `synth-kaffee`, `vinyl-schallplatte`, `neon-limo`, `dantes-kekse`, `echtobst-apfel`
- Mag nicht: `taschenspiegel-gold` („Riecht nach Blade.“), `liebesroman-papier`
- Gehasst: `handschellen`, `goldknauf`, `kanalschlamm`, `virus-implantat`

**Herz-Ereignisse**

| ♥ | ID | Ort · Zeit · Auslöser | Inhalt |
|---|---|---|---|
| 2 | `he-raven-2` | `neonmeile`, Nacht (ab `act2`); in `act1` Besucherraum | Raven steht unter den Leuchtreklamen und fragt, welche die hellste ist. Sie gibt zu, dass sie sich diese Farben sieben Jahre lang vorgestellt hat. |
| 4 | `he-raven-4` | `daecher`, Morgen | Training. Mit [Reflexe 5] oder [Körper 5] hält die Spielfigur mit. Raven bringt ihr den „Entfesselungsgriff“ bei (dauerhaft +1 auf Checks zum Befreien und Schlossöffnen). |
| 6 | `he-raven-6` | `gefaengnis-eisenkammer`, Tag, Besucherraum | Raven besucht freiwillig ihre alte Zellennachbarin und bringt Kekse mit. Danach verrät sie, dass sie von Dantes Schrank mit ihren Fotos weiß: „Sag ihm nichts. Ich will sehen, ob er sich irgendwann traut.“ Öffnet den Paar-Strang (Abschnitt 13). |
| 8 | `he-raven-8` | `digitech-ruine`, Nacht | Raven kehrt ins Labor zurück, an das Rohr. Wahl: mit [Körper 6] das Rohr herausreißen oder sie einfach reden lassen. Sie lässt die alte Handschelle dort liegen. Romanzefassung: „Ich hab genug von Charmeuren. Bist du einer?“ – ehrliche Antwort, ein vorsichtiges Lächeln. |
| 10 | `he-raven-10` | `daecher`, Abend (im `epilog` `kueste`) | Sonnenuntergang über den Dächern. Raven schenkt `ravens-klinge`. Freundschaft: Sie bittet die Spielfigur, ihr bei Dante „ein bisschen nachzuhelfen“ (startet `pq-wingman-sonnenuntergang`). Romanzefassung: Händchen halten, „Kein Verrat. Versprochen?“ |

**Persönliche Quest – `pq-raven-notgroschen` „Sieben Jahre Zinsen“:** Vor ihrer Verhaftung hat Raven einen Notgroschen in der `kanalisation` versteckt. Das Versteck ist leer: Ripper hat den Inhalt gefunden und stückweise verkauft. Die Spur führt über Ripper, Opa Gustav (kaufte die Kiste), Dexter (verpfändete einen Ring) zurück zu Babette (hat den Ring als Spieleinsatz gewonnen). Lösungswege: kaufen, tauschen, mit [Straße 6] Ripper einschüchtern oder ihn im Kampf stellen. Am Ende behält Raven nur den Ring ihrer Mutter und gibt die Credits den Straßenkindern („Erzählt's niemandem.“).

**Rivalität:** −2 `re-raven-2`: Raven antwortet nur noch „Komm zum Punkt.“ und dreht sich weg. −5 `re-raven-5`: Sie schnappt der Spielfigur Aufträge von der Tafel weg; Training wird zur echten Prügelei (Kampf). −8 `re-raven-8`: Duell auf den `daecher` (Kampf 1 gegen 1 oder [Ausstrahlung 8], um es abzublasen). Versöhnung: `pq-raven-waffenstillstand` – die alte Handschelle aus der Digitech-Ruine holen und vor ihren Augen zerstören.

**Begleiter:** ja, ab `act2`. Rolle: Nahkampf und Flankenangriff (Messer).
- „Klingenwirbel“ (2 AP): Angriff auf alle angrenzenden Gegner.
- „Aus dem Schatten“ (1 AP): Nach Bewegung in Deckung erhält der nächste Angriff +25 Treffer und zählt als Flanke.
- ab 6 ♥ „Nie wieder gefesselt“ (1 AP): Befreit einen Verbündeten von `betaeubt` oder `gehackt`; Raven greift den Verursacher an.

**Romanze:** romanzierbar (Kennzeichen), erwachsen. Kanonisch mit Dante verbunden, Regeln in Abschnitt 13.

**Herkunft:** `origin-knastvogel`: Startpunkte +200, gemeinsamer Klopfcode („Zweimal kurz heißt: Kantine ist eklig.“). · `origin-oberstadt`: „Du hast diesen Glanz an dir. Pass auf, dass er abgeht.“ · `origin-gossenkind`: knapper Respekt. · `origin-ex-wache`: „Warst du eine von denen, die mich abgeführt haben?“ (wahlweise lügen mit [Ausstrahlung 5]). · `origin-oednis`: fragt, ob man da draußen jemanden findet, der einen nicht verrät. · `origin-schrott`: „Bau mir ein Schloss, das ich nicht knacke. Ich wette dagegen.“

**Beispiel-Checks:** [Straße 6] Raven verraten, in welchem Restaurant Blade speist (sie lässt es dann doch) · [Reflexe 7] ihren Wurfmesser-Trick nachmachen · [Ausstrahlung 8] Raven ausreden, Blade allein anzugreifen.

---

### 6.3 Dante — `dante`

**Kurzprofil:** Früher eine Legende der Hackerszene, nach vier Jahren Gefängnis Bastler mit Second-Hand-Implantaten. Arbeitet für arme Leute kostenlos und schwört, nichts Digitales mehr anzufassen. Schwarze Lederjacke, weißes Shirt, Stirnband mit Schutzbrille, Schaltkreis-Linien auf der Wange, Hundemarke. Fraktion `unterstadt`, später `crew`.

**Persönlichkeit:** Chaotisch, herzlich, ängstlich, schnell begeistert, sich selbst gegenüber zu streng („Versager“). Liebt Schallplatten, VHS und sein Faxgerät („In diesen Dingern steckt Seele“). Verliert jedes Kartenspiel gegen die Kinder. Ist seit Jahren in Raven verliebt und traut sich nicht.

**Sprechweise:** Sätze, die abbrechen und neu ansetzen, Ausrufe mit Werkzeug- und Retro-Bezug, viele Ablenkungsangebote (Chips, Kekse).
- „Heiliger Lötkolben! Kannst du nicht klopfen? Ich hätte fast… egal. Keks?“
- „Das ist nicht digital, das ist… analog mit Gefühl. Grauzone. Hellgrau.“
- „Hör mal, wie das Fax piept. Das ist kein Fehler, das ist Charakter.“

**Tagesablauf**

| Morgen | Tag | Abend | Nacht |
|---|---|---|---|
| `dantes-werkstatt` Ofen (Keksalarm möglich) | `dantes-werkstatt` Reparaturen und Einbau (Händler); Mo/Fr `rostmarkt` Ersatzteile | `dantes-werkstatt` Plattenspieler | away (schläft); Sa nacht `high-voltage` (tanzt allein in der Ecke) |

Abweichungen: Do abend EINS!-Abend mit den Kindern. So tag Flohmarkt `rostmarkt`. `act3`: nachts `high-voltage` Hinterzimmer (Planung). `epilog`: Abend jeden zweiten Tag `kueste`.

**Geschenke**
- Liebling: `vinyl-schallplatte`, `vhs-kassette`, `faxpapier-rolle`, `snackers-riegel`
- Gemocht: `chips-tuete`, `comic-heft-alt`, `loetkolben-gold`, `plueschmoehre`, `echtobst-apfel`
- Mag nicht: `datenkristall` („Viel zu digital.“), `seltenes-implantat` („Konzernware.“)
- Gehasst: `eins-kartendeck` („Ich hasse Gesellschaftsspiele!“), `goldknauf`, `kanalschlamm`, `virus-implantat`

**Herz-Ereignisse**

| ♥ | ID | Ort · Zeit · Auslöser | Inhalt |
|---|---|---|---|
| 2 | `he-dante-2` | `dantes-werkstatt`, Morgen | Keksalarm. Dante stürzt herein, rettet das Blech, lässt es fallen, erklärt die Drei-Sekunden-Regel. Die Spielfigur erhält `drei-sekunden-keks` und das Angebot, Cyberware gratis einbauen zu lassen. |
| 4 | `he-dante-4` | `dantes-werkstatt`, Abend | Dante führt seine Plattensammlung vor und tanzt durch die Werkstatt. Mit [Reflexe 4] oder [Ausstrahlung 4] tanzt man mit. Danach erzählt er vom Gefängnis („Vier Jahre. Wegen Musik!“). Schaltet `pq-dante-platte` frei. |
| 6 | `he-dante-6` | `dantes-werkstatt`, Abend, Schrank öffnet sich | Die Spielfigur ertappt Dante vor dem Schrank mit Ravens Fotos. Panik. Wahl: aufziehen, Schweigen versprechen oder Hilfe anbieten (Paar-Strang). Romanzefassung (falls Dante freigeschaltet und Raven-Strang nicht begonnen): Dante schließt den Schrank und fragt verlegen, ob die Spielfigur „eventuell, möglicherweise“ mal mit ans Wasser käme. |
| 8 | `he-dante-8` | `rostmarkt`, So tag, Flohmarkt | Dante verhandelt erbärmlich, dann erzählt er, warum er aufgehört hat: Ein Auftrag von damals legte die Heizung der halben Unterstadt drei Tage lahm. Er schenkt `dantes-altes-deck`: „Pass besser darauf auf als ich.“ |
| 10 | `he-dante-10` | `dantes-werkstatt` Abend (im `epilog` `kueste`) | Dante beschließt, „seinen Traum zu verfolgen“. Freundschaft: Er macht die Spielfigur zur Patin von Captain Kuschel und vermacht `kekse-rezept`. Paar-Strang aktiv: Er bittet um Hilfe beim Date mit Raven. Romanzefassung: Sonnenuntergang, er stottert sich durch ein Geständnis, Händchen halten, Captain Kuschel „schaut weg“. |

**Persönliche Quest – `pq-dante-platte` „Die verschollene Platte“:** Dante sucht die Erstpressung „Saturday Night“ (`vinyl-raritaet`), die er vor dem Gefängnis verloren hat. Kette: Opa Gustav hat sie als Schrott verkauft → Dexter hat sie verpfändet → Collin spielt sie in seiner Morgensendung → der Barkeeper hat sie gewonnen und gibt sie nur gegen ein Dreizeiler-Gedicht her ([Ausstrahlung 5] oder `haiku-buechlein`). Belohnung: Dante legt die Platte in der Clubnacht auf, das ganze High Voltage tanzt, Raven bleibt am Rand stehen und lächelt.

**Rivalität:** −2 `re-dante-2`: Reparaturen und Einbau kosten das Doppelte. −5 `re-dante-5`: Dante baut nichts mehr ein (Ersatz: Ripper gegen Gebühr). Captain Kuschel wird mit dem Gesicht zur Wand gedreht. −8 `re-dante-8`: Dante „hackt nicht, aber…“: Das Telefon der Spielfigur spielt einen Tag lang nur Collins Jingle, und alle Kartenmarker stehen auf Kopf (rein kosmetisch). Versöhnung: `pq-dante-friedenskeks` – einen EINS!-Abend für Dante gegen die Kinder gewinnen.

**Begleiter:** ja, ab `act2` (nachdem er sich überreden ließ). Rolle: Heiler und Hacker.
- „Feldreparatur“ (2 AP): Heilt 8 + Technik LP, entfernt `brennt` und `blutet`.
- „Kurzschluss“ (1 AP): Hack, Ziel `gehackt`; gegen Drohnen und Geschütze doppelte Wirkung.
- ab 6 ♥ „Snackers-Pause“ (1 AP): Verbündeter erhält `geschuetzt` und +1 AP („Iss was, du wirst zur Diva.“).

**Romanze:** romanzierbar (Kennzeichen), erwachsen. Kanonisch mit Raven verbunden, siehe Abschnitt 13.

**Herkunft:** `origin-schrott`: Startpunkte +100, fachsimpeln über Röhrenverstärker. · `origin-oberstadt`: „Du bist doch nicht von Digitech? Sag, dass du nicht von Digitech bist.“ · `origin-knastvogel`: tauscht Knastgeschichten. · `origin-ex-wache`: „Nimm mich nicht fest, das hier ist alles legal. Fast. Überwiegend.“ · `origin-oednis`: fragt nach dem Meer, „für eine Bekannte“ (Nyra). · `origin-gossenkind`: erkennt die Spielfigur als Kind wieder, dem er einmal ein Implantat repariert hat.

**Beispiel-Checks:** [Technik 8] mit Dante über Röhrenlogik fachsimpeln (+50) · [Ausstrahlung 6] ihn in `act1` doch zur Mithilfe bewegen (sonst Questweg) · [Straße 4] die Kinder beim EINS! beim Schummeln erwischen.

---

### 6.4 Vega — `vega`

**Kurzprofil:** Die beste Schützin weit und breit, „Adleraugen und Killerinstinkt einer Kobra“, wie Hunter sagt. Olivfarbenes Top, Cargohose, Pferdeschwanz, Präzisionsgewehr mit Zielfernrohr. Fraktion `crew`.

**Persönlichkeit:** Ruhig, verlässlich, der Klebstoff im Team. Bremst Aria, glaubt an Jimmy, träumt davon, einmal eine Reichenparty „aufzumischen“, will aber nicht wirklich in die Oberstadt ziehen. Hat Angst, Menschen zu verlieren.

**Sprechweise:** Ruhige, knappe Anweisungen, warmer Spott, keine Hektik.
- „Atmen, zielen, abdrücken. Und vorher reden wir. Reden ist billiger.“
- „Zähl ruhig nach. Laut, bitte, ich hör gern zu.“
- „Jimmy steht wieder auf. Wetten? Um eine Dampfnudel.“

**Tagesablauf**

| Morgen | Tag | Abend | Nacht |
|---|---|---|---|
| `daecher` Ausguck | Mo/Mi/Fr `u-bahn-knoten-sued` (bringt Jimmy Essen), sonst `rostmarkt` | `high-voltage` mit Aria | `daecher` |

Abweichungen: `act2` nach Arias Rettung eine Woche lang tags `dantes-werkstatt` an Arias Couch.

**Geschenke**
- Liebling: `zielfernrohr-linse`, `sternkarte`, `edelbrause-gold`
- Gemocht: `neon-limo`, `bao-dampfnudel`, `murmelbeutel`, `dantes-kekse`, `echtobst-apfel`
- Mag nicht: `liebesroman-papier`, `raubkopie-stick`
- Gehasst: `defekter-neurochip`, `kanalschlamm`, `virus-implantat`

**Herz-Ereignisse**

| ♥ | ID | Ort · Zeit · Auslöser | Inhalt |
|---|---|---|---|
| 2 | `he-vega-2` | `daecher`, Morgen | Vega lässt die Spielfigur durchs Zielfernrohr schauen. Wer drei Dinge in der Stadt entdeckt, schaltet drei versteckte Sammelorte auf der Karte frei. |
| 4 | `he-vega-4` | `u-bahn-knoten-sued`, Tag | Die Spielfigur ertappt Vega, wie sie Jimmy Essen bringt. „Sag's Hunter nicht. Er hat ihn abgeschrieben. Ich nicht.“ Verknüpft mit `pq-jimmy-neustart`. |
| 6 | `he-vega-6` | `high-voltage`, Abend | Vega und Aria streiten. Danach gesteht Vega, dass sie nachts aufwacht, weil sie Angst hat, Aria zu verlieren. [Ausstrahlung 5] vermittelt (beide +50). |
| 8 | `he-vega-8` | `oberstadt-promenade`, Abend | Vegas Traum: eine Reichenparty aufmischen. Gemeinsam schleicht man sich auf eine Vernissage, tanzt zu laut, isst alle Häppchen und verschwindet, bevor jemand fragt. Kein Kampf, nur Ausreden-Checks. |
| 10 | `he-vega-10` | `daecher`, Nacht | Vega zeigt ihren geheimen Dachgarten mit einer einzigen echten Pflanze. Sie nennt die Spielfigur ihre „Rückendeckung“ und schenkt `vegas-zielfernrohr`. Duo-Technik mit der Spielfigur frei. |

**Persönliche Quest – `pq-vega-dachgeist` „Der Dachgeist“:** Auf den Dächern verschwinden Wäsche, Schrauben und Vegas Thermoskanne. Spuren, Kratzer, ein Quietschen in der Nacht. Mit Vegas Fernrohr verfolgt man den „Dachgeist“ über drei Dächer bis zu einem verlassenen Wassertank: Es ist Bolzen, ein streunender Roboterhund, der sich ein Nest gebaut hat. Lösung: Bolzen adoptieren (er zieht in den `unterschlupf`), ihn dem Wasserturm-Versteck der Kinder überlassen oder ihn Opa Gustav bringen. Keine Lösung schadet Bolzen.

**Rivalität:** −2 `re-vega-2`: keine Dach-Hinweise mehr (Kartenmarker bleiben aus). −5 `re-vega-5`: Vega meldet Fehltritte an Hunter (Hunter −30 je Vorfall). −8 `re-vega-8`: Wettschießen auf Blechdosen um das Recht, die Dächer zu nutzen; Verlierer meidet die `daecher` eine Woche. Versöhnung: `pq-vega-zielscheibe` – ihre gestohlene Thermoskanne zurückbringen (aus dem Dachgeist-Nest).

**Begleiter:** ja, ab `act1`. Rolle: Fernkampf, Scharfschützin.
- „Adlerauge“ (1 AP): Ziel `markiert`; Gegner hinter voller Deckung werden sichtbar.
- „Schockschuss“ (2 AP): Fernangriff mit Reichweite 8, Ziel `betaeubt`.
- ab 6 ♥ „Rückendeckung“ (1 AP): Überwachung; Vega schießt auf den ersten Gegner, der einen Verbündeten angreift.

**Romanze:** nein (jung besetzt; nur Freundschaft).

**Herkunft:** `origin-oberstadt`: neugierige Fragen nach Partys („Gibt's da wirklich Brunnen mit Limo?“). · `origin-oednis`: fragt nach Sternen ohne Smog; Vorlage für `sternkarte`. · `origin-ex-wache`: „Du bist Dachpatrouille gelaufen? Dann weißt du, wo mein Platz ist. Bleib weg davon.“ (lächelnd) · übrige Herkünfte: freundlich neutral.

**Beispiel-Checks:** [Reflexe 6] beim Wettschießen mithalten · [Ausstrahlung 5] Vega und Aria versöhnen · [Straße 5] Vega verraten, wo Jimmy nachts schläft.

---

### 6.5 Aria — `aria`

**Kurzprofil:** Kraftpaket mit dem Armimplantat „Zerberster 3000“ und Baseballschläger. Geflochtene Locken, schwarz-rotes Netzoberteil, taktische Hose mit Taschen. Treibt für Hunter Schulden ein. Dante hat sie als Kind aus der Gosse gezogen und ihren Arm gerettet. Fraktion `crew`.

**Persönlichkeit:** Hitzkopf, misstrauisch gegenüber Neuen, laut, aber treu bis auf die Knochen. Unverwüstlich („Mich kriegt man nicht kaputt“). Hat ein Lieblingsshirt und verteidigt es mit dem Leben.

**Sprechweise:** Kurz, frech, Drohungen, die meist Theater sind; Flüche brechen ab. Nennt andere „Luschen“.
- „Easy. Die rücken immer raus. Man muss nur freundlich mit dem Schläger winken.“
- „Fass mein Lieblingsshirt an und du lernst den Zerberster persönlich kennen.“
- „Wer zuerst am Kiosk ist, zahlt nicht, ihr Luschen!“

**Tagesablauf**

| Morgen | Tag | Abend | Nacht |
|---|---|---|---|
| `rostmarkt` (Inkasso-Runde) | `neonmeile`; Di/Do `dantes-werkstatt` (Armwartung) | `high-voltage` mit Vega | `high-voltage` Tanzfläche |

Abweichungen: `act2` nach der Rettung eine Woche ganztags `dantes-werkstatt` (Couch, gelangweilt, schlecht gelaunt). Sa nacht Mitte der Tanzfläche.

**Geschenke**
- Liebling: `griffband-schlaeger`, `zerberster-oel`, `volt-cola`
- Gemocht: `instant-nudeln`, `snackers-riegel`, `stickerbogen`, `dantes-kekse`, `echtobst-apfel`
- Mag nicht: `parfuem-ozon` („Riecht nach Snob.“), `taschenspiegel-gold`
- Gehasst: `defekter-neurochip`, `handschellen`, `kanalschlamm`, `virus-implantat`

**Herz-Ereignisse**

| ♥ | ID | Ort · Zeit · Auslöser | Inhalt |
|---|---|---|---|
| 2 | `he-aria-2` | `rostmarkt`, Morgen | Aria will bei Dexter kassieren. Die Spielfigur kann mit [Ausstrahlung 4] reden oder Aria machen lassen (Dexter flieht in eine Mülltonne). Aria grummelt: „Nicht schlecht. Für 'ne Neue.“ |
| 4 | `he-aria-4` | `dantes-werkstatt`, Tag (Di/Do) | Armwartung. Die Spielfigur soll den Arm festhalten, er zuckt und haut eine Lampe um. Aria erzählt, wie Dante sie gefunden hat. |
| 6 | `he-aria-6` | `high-voltage`, Nacht | Armdrücken. Mit [Körper 7] gewinnt man (Aria +80, „Revanche!“), sonst verliert man und Aria gibt zu, dass sie Angst vor Chips hat (nach `act2`) bzw. davor, nutzlos zu sein. |
| 8 | `he-aria-8` | `neonmeile`, Abend | Das Lieblingsshirt ist zerrissen. Aria bittet (sehr widerwillig) um Hilfe: Babette näht es mit `nadel-und-faden`, oder man findet an der Promenade ein gleiches. Aria: „Crew. Echte Crew.“ |
| 10 | `he-aria-10` | `daecher`, Abend (im `epilog` `kueste`) | Wettrennen: „Wer zuerst am Wasser ist!“ Egal, wer gewinnt, Aria schenkt `arias-ersatzschlaeger` mit ihren Initialen. |

**Persönliche Quest – `pq-aria-zerberster` „Rückruf für den Zerberster“:** Ripper behauptet, der Zerberster 3000 sei Hehlerware aus seinem Lager, und will ihn „zurückholen“. Lösungen: Beweis finden, dass Dante ihn rechtmäßig eingebaut hat (alter Einbaubeleg im Faxgerät, [Technik 5] zum Ausdrucken), Ripper ausbezahlen, mit [Straße 7] seine Hintermänner bloßstellen oder seine Schläger im Hinterhof besiegen. Belohnung: Aria vertraut der Spielfigur ihren Arm bei der nächsten Wartung an (+1 Körper-Check-Bonus bei gemeinsamen Szenen).

**Rivalität:** −2 `re-aria-2`: Anrempeln, „Schnüffler“. −5 `re-aria-5`: Sie verlangt „Schutzgeld“ (−15 Credits pro Begegnung, mit [Körper 6] abwendbar). −8 `re-aria-8`: Prügelei im Club (Kampf, endet comichaft im Bällebad-Lager des Clubs). Versöhnung: `pq-aria-faire-runde` – Griffband kaufen und Fehler zugeben.

**Begleiter:** ja, ab `act1`. Rolle: Tank und Nahkampf.
- „Zerberster-Schlag“ (2 AP): Nahangriff mit doppeltem Körperbonus, Ziel wird 1 Feld zurückgestoßen.
- „Komm doch her!“ (1 AP): Gegner in 3 Feldern müssen Aria angreifen; Aria `geschuetzt` für 1 Runde.
- ab 6 ♥ „Unkaputtbar“ (passiv): einmal pro Kampf bei 0 LP mit 1 LP stehen bleiben.

**Romanze:** nein (jung besetzt; nur Freundschaft).

**Herkunft:** `origin-oberstadt`: Startpunkte −100, eigener Versöhnungsdialog über Herkunft. · `origin-gossenkind`: sofortiger Respekt. · `origin-knastvogel`: „Du warst mit Raven drin? Erzähl alles!“ · `origin-ex-wache`: „Kannst du kämpfen? Gut. Der Rest ist mir egal.“ · `origin-oednis`: „Da draußen gibt's echt nichts? Wie langweilig.“ · `origin-schrott`: will ein Upgrade für den Arm.

**Beispiel-Checks:** [Körper 7] Armdrücken gewinnen · [Ausstrahlung 6] Aria davon abhalten, auf Xion loszugehen · [Technik 5] den Zerberster nachjustieren.

---

### 6.6 Nyra — `nyra`

**Kurzprofil:** Junge, selbst beigebrachte Hackerin mit dem Netznamen „Silent-Angel“, großer Fan von Dante. Brille, lange Locken, olivfarbene Bomberjacke. Ersetzt im Stück Jimmy als Hackerin; im Spiel kommt sie kurz nach der Spielfigur in die Crew, beide sind „die Neuen“. Fraktion `crew`.

**Persönlichkeit:** Begeistert, idealistisch, unsicher, will sich beweisen. Postet alles. Lässt sich von „denk an dich selbst“ beeinflussen und bereut es später zutiefst. Ihr Traum: einmal die Ödnis durchqueren und das Meer sehen.

**Sprechweise:** Schnell, Netzsprache („megakrass“, „im Reallife“), Unterbrechungen fürs Posten.
- „Warte, kurz posten… okay, jetzt darfst du weiterreden.“
- „Das ist so megakrass, ich kannte das bisher nur aus Foren!“
- „Riechst du das? Nein? Ich stell mir vor, dass Salzluft so riecht. Nur ohne Kanal.“

**Tagesablauf**

| Phase | Morgen | Tag | Abend | Nacht |
|---|---|---|---|---|
| Standard | `u-bahn-knoten-sued` (Kiosk mit freiem Netz) | `rostmarkt` Elektronikstand | `high-voltage` Ecke mit Laptop | `daecher` (schaut in Richtung Meer) |
| `act2` nach der Gefangennahme bis `act3` | `quantum-tower` Labor | `quantum-tower` Labor | `quantum-tower` Labor | away |
| `epilog` | `kueste` (Di–Fr) | `kueste` | `high-voltage` | `daecher` |

In der Quantum-Phase spricht Nyra nur kühl und nennt Blade „Master“; Herzpunkte sind eingefroren, Geschenke werden höflich abgelehnt.

**Geschenke**
- Liebling: `meeres-postkarte`, `fossile-muschel`, `muschel-frisch`, `sandflasche`
- Gemocht: `datenkristall`, `neon-limo`, `sonnencreme-lsf100`, `comic-heft-alt`, `dantes-kekse`
- Mag nicht: `faxpapier-rolle` („Museumsstück.“), `edelbrause-gold` („Schmeckt nach Oberstadt.“)
- Gehasst: `peilsender`, `defekter-neurochip`, `kanalschlamm`, `virus-implantat`

**Herz-Ereignisse**

| ♥ | ID | Ort · Zeit · Auslöser | Inhalt |
|---|---|---|---|
| 2 | `he-nyra-2` | `u-bahn-knoten-sued`, Morgen | Nyra will ein Selfie für ihren Feed. Danach schickt sie regelmäßig Feed-Nachrichten aufs Telefon. |
| 4 | `he-nyra-4` | `daecher`, Nacht | Nyra erzählt vom Meer. Mit `[Ödnis]` oder einer `fossile-muschel` im Gepäck kann man ihr beweisen, dass es das Meer wirklich gibt. Schaltet `pq-nyra-salzluft` frei. |
| 6 | `he-nyra-6` | `dantes-werkstatt`, Abend | Nyra traut sich nicht, Dante anzusprechen; die Spielfigur hilft. Dante rät ihr, nur an sich zu denken. Die Spielfigur kann widersprechen („Eine Crew trägt dich.“) – setzt Flag `nyra_teamgeist`, durch das Nyra in `act3` früher zweifelt und schneller zurückkommt. |
| 8 | `he-nyra-8` | `high-voltage`, Nacht (nur nach `act3`) | Nyra entschuldigt sich persönlich für den Verrat. Vergeben (+80) oder kühl bleiben (Herzpunkte bleiben, Ereignis gilt als gesehen). |
| 10 | `he-nyra-10` | `kueste`, Abend (`epilog`) | Nyra hat ein Programm geschrieben, das Wellenrauschen in Musik übersetzt. Sie schenkt `nyra-wellenchip`. |

**Persönliche Quest – `pq-nyra-salzluft` „Salzluft“:** Vier `kuestenkarte-fragment` ergeben die alte Route zum Meer: bei Marla Sand (Tausch gegen `wasserfilter`-Reparatur), bei Opa Gustav (in einem Schrank voller Schrauben), im Archiv der `digitech-ruine` (Hack, [Technik 6] oder Schlüsselkarte) und am `grauwasser-hafen` (in einer Flaschenpost). Im `epilog` wird damit die Fahrt zur `kueste` jederzeit möglich; vorher schenkt Nyra die fertige Karte Hunter für den Strandclub-Plan.

**Rivalität:** −2 `re-nyra-2`: Nyra entfolgt der Spielfigur und postet spitze Kommentare. −5 `re-nyra-5`: „Silent-Angel“ veröffentlicht peinliche Aufnahmen (Ruf `unterstadt` −10). −8 `re-nyra-8`: Hack-Duell am Terminal im High Voltage ([Technik 8] oder Minispiel). Versöhnung: eine `meeres-postkarte` mit ehrlicher Nachricht schicken (`pq-nyra-postkarte`).

**Begleiter:** ja, in `act1`, `act2` bis zur Gefangennahme und ab `act3`-Ende. Rolle: Hackerin und Kontrolle.
- „Silent Angel“ (1 AP): Hack, Ziel `gehackt` und `markiert`.
- „Firewall“ (1 AP): Verbündeter erhält `geschuetzt` gegen Hacks und 5 Schildpunkte.
- ab 6 ♥ „Drohnen-Umleitung“ (2 AP): übernimmt eine gegnerische Drohne für 2 Runden.

**Romanze:** nein (jung besetzt; nur Freundschaft).

**Herkunft:** `origin-oednis`: Startpunkte +100, endlose Fragen. · `origin-schrott`: Streit, ob Code oder Hardware wichtiger ist. · `origin-oberstadt`: „Habt ihr da oben echte Strand-Simulatoren?“ · `origin-gossenkind`: fragt nach freien Netzknoten. · `origin-knastvogel`: „War Dante im Knast auch so lustig?“ · `origin-ex-wache`: nervös, braucht einen Herzpunkt-Schritt mehr Vertrauen (Gespräche +10 statt +20 bis 2 Herzen).

**Beispiel-Checks:** [Technik 6] mit Nyra eine Übungs-Firewall knacken · [Ausstrahlung 7] (`act3`) ihr ausreden, dass man allein glücklicher ist · [Straße 5] ihr einen sicheren Netzknoten zeigen.

---

## 7. Quantum Industries und die Oberstadt

Grundsatz: Die Antagonisten bleiben im Hauptstrang Antagonisten. Herzen ändern **Ton, Optionen und Nachspiel**, nicht den Ausgang. Wer Blade mag, darf ihn trotzdem stürzen und ihn danach im Gefängnis besuchen.

### 7.1 Blade Nocturne — `blade`

**Kurzprofil:** Ehemaliges Crew-Mitglied, verriet beim Digitech-Coup alle und ist heute CEO von Quantum Industries, dem größten Konzern der Stadt. Cremefarbener Teddyfellmantel, schwarz-goldene Barockweste, weißes Hemd, goldener Gehstock mit Kugelknauf, Dreitagebart mit grauer Strähne. Fraktion `quantum`.

**Persönlichkeit:** Charmant, eitel, theatralisch. Liebt es, „Master“ genannt zu werden, schmückt sich mit fremden Ideen, teilt nicht gern. Glaubt, Bindungen machten angreifbar. Darunter: Einsamkeit, die er nie zugeben würde.

**Sprechweise:** Geschliffen, siezt im Geschäft, „Präzise.“, „Bedaure.“, gönnerhaft; Selbstlob als Satzende.
- „Wer Eindruck machen will, kommt nicht pünktlich. Er kommt unvergesslich.“
- „Präzise. Und jetzt dasselbe noch einmal, mit ‚Master‘ davor.“
- „Freundschaft ist ein Kredit mit miserablen Zinsen. Die Idee ist übrigens von mir.“

**Tagesablauf**

| Phase | Morgen | Tag | Abend | Nacht |
|---|---|---|---|---|
| `act1`–`act3` | `quantum-tower` Büro | Mo/Do `chrome-towers`, Di `sender-kanal-noxius`, sonst `quantum-tower` Büro | `oberstadt-promenade` Edelcafé (lässt sich bewundern) | away (Penthouse) |
| `epilog` | `gefaengnis-eisenkammer` away | Di/Do/Sa Besucherraum der `gefaengnis-eisenkammer` | Hof der `gefaengnis-eisenkammer` | away |

Blade ist vor `act3` gut erreichbar: abends an der Promenade, er kennt die Spielfigur anfangs nicht.

**Geschenke**
- Liebling: `goldknauf`, `teddyfell-buerste`, `taschenspiegel-gold`
- Gemocht: `edelbrause-gold`, `parfuem-ozon`, `planungsbrett-glas`, `sonnenbrille-gold`, `echtobst-apfel`
- Mag nicht: `dantes-kekse` („Unterstadtgebäck.“), `vinyl-schallplatte`
- Gehasst: `beglichener-schuldschein` („Ich zahle nie zurück. Prinzip.“), `handschellen`, `kanalschlamm`, `virus-implantat`

**Herz-Ereignisse** (für 2, 4 und 6 gibt es eine Promenaden-Fassung vor `act3` und eine Gefängnis-Fassung im `epilog`)

| ♥ | ID | Ort · Zeit · Auslöser | Inhalt |
|---|---|---|---|
| 2 | `he-blade-2` | `oberstadt-promenade`, Abend | Blade bemerkt die Spielfigur, lädt sie an seinen Tisch und reicht eine goldene Visitenkarte (`blades-visitenkarte`): „Für Talente. Ich sammle Talente.“ Die Karte öffnet später einmal das Quantum-Foyer. |
| 4 | `he-blade-4` | `quantum-tower` Foyer, Tag (mit Visitenkarte) | Privatführung. Blade zeigt den Werbe-Avatar der KI und verlangt, „Master“ genannt zu werden. Die Antwort bestimmt, wie er die Spielfigur künftig anspricht („mein Talent“, „Schlaumeier:in“ oder beim Namen). |
| 6 | `he-blade-6` | `oberstadt-promenade`, Nacht, Blade allein auf einer Bank | Ohne Publikum fällt die Maske kurz. Er spricht über die alte Crew und gibt zu, dass er Ravens alte Jacke noch im Schrank hat. Die Spielfigur kann Zweifel säen (Flag `blade_zweifel`: in `act3` zögert er eine Runde, bevor er die Waffe nimmt). |
| 8 | `he-blade-8` | `gefaengnis-eisenkammer` Besucherraum, Tag (`epilog`) | Blade in Anstaltskleidung mit einem eingeschmuggelten Fellkragen. Er gesteht, dass niemand je für ihn zurückgekommen ist, so wie die Crew für Nyra. |
| 10 | `he-blade-10` | `gefaengnis-eisenkammer` Hof, Abend (`epilog`) | Blade verrät den Code zu `blades-geheimfach` (Credits und seltene Cyberware) und sagt zum ersten Mal „Danke“ ohne jeden Titel. Bei Raven oder Hunter ab 6 ♥ bittet er, eine Entschuldigung auszurichten (eigene kurze Szenen bei beiden). |

**Persönliche Quest – `pq-blade-teddymantel` „Der Teddymantel“ (`epilog`):** Blade friert im Gefängnis und will seinen Mantel aus der Asservatenkammer im `justizpalast`. Wege: Antrag beim Richter ([Ausstrahlung 6] oder `stempelkissen` und Geduld), Einbruch in die Asservatenkammer (Schleichen, [Reflexe 7]) oder Tausch mit der Wache. Am Ende die Wahl: Mantel zu Blade bringen (Blade +150) oder an das Aussiedler-Camp spenden, wo die Nächte kalt sind (Marla +150, Ruf `aussiedler` +15, Blade schmollt eine Woche).

**Rivalität:** Für viele der Normalfall. −2 `re-blade-2`: In Oberstadt-Zonen patrouillieren mehr Quantum-Wachen. −5 `re-blade-5`: Blade setzt ein Kopfgeld aus; comichafte Kopfgeldjäger tauchen auf (der Kameramann filmt mit), Collin nennt die Spielfigur in den Nachrichten „Unruhestifter“. −8 `re-blade-8`: Optionaler Bosskampf „Blade und die Golddrohnen“ im Quantum-Festsaal vor der Party, alternativ ein Wortgefecht ([Ausstrahlung 8]). Im `epilog` schickt er Drohbriefe mit Glitzer aus dem Gefängnis. Kein Versöhnungszwang; `pq-blade-teddymantel` hebt die Rivalität auf 0.

**Begleiter:** nein. **Romanze:** nein.

**Herkunft:** `origin-oberstadt`: „Endlich jemand mit Manieren in dieser Gegend.“ (+50 beim ersten Gespräch) · `origin-schrott`: bietet eine Stelle in der Forschung an. · `origin-ex-wache`: „Wir haben Sie entlassen? Kluge Entscheidung. Von Ihnen.“ · `origin-gossenkind`: „Hat jemand Kleingeld bestellt?“ · `origin-knastvogel`: höhnisch, im `epilog` Gleichstand („Wir haben eine Gemeinsamkeit. Wie unangenehm.“) · `origin-oednis`: interessiert sich für die Ödnis als „unerschlossenen Markt“.

**Beispiel-Checks:** [Ausstrahlung 7] Blade so lange schmeicheln, bis er das Foyer-Passwort verrät · `[Oberstadt]` sein Verkaufsgerede als Wellness-Werbung entlarven · [Straße 8] bemerken, dass er bei jedem Spiegel stehen bleibt (öffnet `he-blade-6` früher).

---

### 7.2 Alesa Zero — `alesa-zero`

**Kurzprofil:** Leiterin der Forschung bei Quantum. Weißer Laborkittel mit Platinen-Aufnähern, rosa getönte Brille, lange dunkle Haare mit pinken Strähnen. Fraktion `quantum`.

**Persönlichkeit:** Hochbegabt und chaotisch, gierig nach Anerkennung, unsicher. Ihre Versuche gehen oft schief (das Gebäude brannte fast ab). Kränkt sich, wenn Blade ihre Ideen als seine ausgibt oder Nyra ihr vorgesetzt wird. Moralisch biegsam, aber nicht grausam; muss lernen, Verantwortung zu übernehmen.

**Sprechweise:** Fachwörter, nervöse Einschränkungen („Äh, gut…“, „hoffe ich“), Selbstgespräche mit den Forschern.
- „Das sollte funktionieren. Theoretisch. In der Simulation. An guten Tagen.“
- „Der Zentrator ist nicht falsch herum. Er ist experimentell ausgerichtet.“
- „Bitte nichts anfassen, was summt. Oder glüht. Oder ganz still ist, das ist das Schlimmste.“

**Tagesablauf**

| Phase | Morgen | Tag | Abend | Nacht |
|---|---|---|---|---|
| `act1`–`act3` | `quantum-tower` Labor | `quantum-tower` Labor; Mi `digitech-ruine` (sammelt alte Prototypen) | `oberstadt-promenade` Edelcafé mit Notizbuch | `quantum-tower` Labor (Überstunden) |
| `epilog` | Mo–Mi `justizpalast` (Aussagen), sonst `digitech-ruine` | `digitech-ruine` (neues Labor „Nullpunkt“) | `rostmarkt` Garküche | away |

**Geschenke**
- Liebling: `laborkittel-neu`, `pinzetten-set`, `datenkristall`
- Gemocht: `synth-kaffee`, `logik-raetsel-modul`, `alter-neurochip`, `edelbrause-gold`, `echtobst-apfel`
- Mag nicht: `instant-nudeln` („Ich lebe seit Monaten davon.“), `taschenspiegel-gold`
- Gehasst: `feuerloescher-mini` („Sehr witzig.“), `defekter-neurochip`, `kanalschlamm`, `virus-implantat`

**Herz-Ereignisse**

| ♥ | ID | Ort · Zeit · Auslöser | Inhalt |
|---|---|---|---|
| 2 | `he-alesa-zero-2` | `oberstadt-promenade`, Abend | Alesa probt eine Rede für den Vorstand vor ihrem Kaffee. Die Spielfigur hört zu und klatscht. Alesa ist gerührt und peinlich berührt zugleich. |
| 4 | `he-alesa-zero-4` | `digitech-ruine`, Mi Tag | Man hilft ihr, alte Prototypen zu tragen. Sie erzählt, dass Blade alle ihre Namensvorschläge verworfen hat, und verrät nebenbei die Schichtzeiten der Laborwachen (Hinweis für den Hauptstrang). |
| 6 | `he-alesa-zero-6` | `oberstadt-promenade`, Nacht | Alesa gesteht, dass ihr die Probanden im Chip-Koma nachgehen. Die Spielfigur kann sie bestärken, Beweise zu sammeln (Flag `alesa_zweifel`: in `act3` lässt sie eine Labortür offen). |
| 8 | `he-alesa-zero-8` | `justizpalast`, Tag (`epilog`) | Vor ihrer Aussage übt sie „Wir haben von nichts gewusst“. Mit [Ausstrahlung 6] bringt man sie dazu, die Wahrheit zu sagen; der Richter verhängt Sozialstunden in Dantes Werkstatt statt Haft. Romanzefassung: Danach lädt sie verlegen auf einen Kaffee ein. |
| 10 | `he-alesa-zero-10` | `digitech-ruine`, Abend (`epilog`) | Eröffnung des ehrlichen Reparaturlabors „Nullpunkt“ mit Pim Pinzette. Alesa schenkt `zero-prototyp`. Romanzefassung: Sternegucken unter der Glaskuppel, sie hält die Hand und redet vor Nervosität über Lichtbrechung. |

**Persönliche Quest – `pq-alesa-zentrator` „Falsch herum“:** Alesa will beweisen, dass sie eine echte Forscherin ist, und baut etwas Nützliches: einen Wasserfilter für das Aussiedler-Camp. Teile von Gustav, Messdaten aus dem Grauwasser-Hafen, ein Testlauf mit Fehlzündung (Schaum überall), dann der richtige Einbau. Belohnung: `wasserfilter` für Marla, Ruf `aussiedler` +20. Verfügbar ab 4 Herzen (vor `act3` heimlich, im `epilog` offen).

**Rivalität:** −2 `re-alesa-zero-2`: Sie meldet das Gesicht der Spielfigur an Xion (mehr Kontrollen bei Quantum). −5 `re-alesa-zero-5`: Ein „Testprototyp“ im Flur: Die Stimme der Spielfigur quietscht einen Tag lang (kosmetisch). −8 `re-alesa-zero-8`: Kampf gegen ihre Labordrohne „Prototyp Q-7“. Versöhnung: `pq-alesa-peer-review` – einen `laborkittel-neu` schenken und eine ihrer Formeln ehrlich loben ([Technik 6]).

**Begleiter:** ja, nur im `epilog` ab 6 ♥. Rolle: Gadget-Technikerin.
- „Prototyp werfen“ (2 AP): Flächenschaden auf 2 × 2 Felder. Jede dritte Nutzung ist eine Fehlzündung (feste Reihenfolge, keine Würfel) und verteilt nur Konfetti.
- „Kalibrieren“ (1 AP): Verbündeter erhält +15 Treffer für 2 Runden.
- ab 8 ♥ „Schwarmstörer“ (2 AP): alle Drohnen im Umkreis von 3 Feldern `gehackt`.

**Romanze:** romanzierbar (Kennzeichen), erwachsen, **nur im `epilog`** nach ihrer ehrlichen Aussage.

**Herkunft:** `origin-schrott`: `[Schrott]` zeigt ihr den falsch eingebauten Zentrator (erst beleidigt, dann +80). · `origin-oberstadt`: „Ah, Sie verstehen Budgets.“ · `origin-ex-wache`: hält die Spielfigur für Sicherheitspersonal und bestellt Kaffee. · `origin-oednis`: Fragen zur Wassergewinnung. · `origin-gossenkind`, `origin-knastvogel`: nervös, prüft heimlich ihre Taschen.

**Beispiel-Checks:** [Technik 7] Alesas Formel korrigieren · [Ausstrahlung 6] sie überzeugen, eine Tür offen zu lassen · [Straße 6] erkennen, dass sie Angst vor Blade hat.

---

### 7.3 Xion Venom — `xion-venom`

**Kurzprofil:** Sicherheitschef von Quantum. Schwarzer Rollkragen, Gurtzeug, mechanischer Krallenarm mit grünem Leuchten, grünes Kunstauge mit Narbenlinien. Fraktion `quantum`.

**Persönlichkeit:** Grob, praktisch, zynisch, macht die Drecksarbeit. Reagiert allergisch darauf, für dumm gehalten zu werden. Verdient nebenbei mit Ripper an Hehlerware. Loyal zu dem, der zahlt. Nach Quantums Fall arbeitslos und überraschend verloren.

**Sprechweise:** Knapp, gelangweilt, rhetorische Fragen („Und das bringt uns was?“), resigniertes „Jaja, ich weiß.“
- „Ich bin nicht dumm. Ich bin nur nicht interessiert.“
- „Kanalisation. Schon klar. Ich hab da unten inzwischen einen Stammplatz.“
- „Nenn mir einen Preis. Einen, bei dem ich nicht lachen muss.“

**Tagesablauf**

| Phase | Morgen | Tag | Abend | Nacht |
|---|---|---|---|---|
| `act1`–`act3` | `quantum-tower` Foyer (Dienstbeginn) | `quantum-tower` Sicherheitszentrale; Di/Fr `kanalisation` (Geschäfte mit Ripper) | `neonmeile` Werbestand „Freiwillige gesucht – Snacks inklusive!“ | `quantum-tower` Patrouille |
| `epilog` | `rostmarkt` (arbeitslos, Jobbörse) | je nach `pq-xion-umschulung` Garküche, `schrottplatz` oder away | `high-voltage` Eingang (falls eingestellt) | `high-voltage` Eingang |

**Geschenke**
- Liebling: `klauen-schleifstein`, `gruene-augenlinse`, `seltenes-implantat`
- Gemocht: `volt-cola`, `instant-nudeln`, `algen-chips`, `drohnen-propeller`, `echtobst-apfel`
- Mag nicht: `liebesroman-papier`, `plueschmoehre`
- Gehasst: `rechenfibel` („Willst du mir was sagen?!“), `logik-raetsel-modul`, `kanalschlamm`, `virus-implantat`

**Herz-Ereignisse**

| ♥ | ID | Ort · Zeit · Auslöser | Inhalt |
|---|---|---|---|
| 2 | `he-xion-venom-2` | `neonmeile`, Abend | Am Werbestand meldet sich niemand freiwillig. Mit [Ausstrahlung 4] entwirft man ein „besseres“ Plakat; es meldet sich trotzdem nur eine Taube. Xion: „War einen Versuch wert.“ |
| 4 | `he-xion-venom-4` | `kanalisation`, Tag (Di/Fr) | Die Spielfigur erwischt Xion beim Handel mit Ripper. Wer schweigt, erhält `xion-passierschein` (einmal an einem Quantum-Kontrollpunkt durchgewunken). |
| 6 | `he-xion-venom-6` | `quantum-tower` Foyer, Nacht | Xion erzählt, dass er in der Schule nie mitkam und alle ihn „Dumpfbacke“ nannten. Mit [Technik 5] oder [Straße 5] bringt man ihm einen Kopfrechentrick bei. Seitdem rechnet er Preise laut vor. |
| 8 | `he-xion-venom-8` | `rostmarkt`, Morgen (`epilog`) | Der arbeitslose Xion sitzt vor der Jobbörse. Mit Hunter ab 4 ♥ kann die Spielfigur ihn als Türsteher empfehlen. |
| 10 | `he-xion-venom-10` | `high-voltage`, Nacht (`epilog`) | Xion steht stolz an der Tür und schenkt `xion-vip-band`. Ist Aria bei mindestens 4 ♥, entschuldigt er sich bei ihr; sie lässt ihn zappeln, dann gibt es ein Nicken. |

**Persönliche Quest – `pq-xion-umschulung` „Umschulung“ (`epilog`):** Xion braucht einen neuen Job. Drei Probetage: Babettes Garküche (Katastrophe, die Krallen zerschneiden die Nudeln), Opa Gustavs Schrottplatz (solide, aber langweilig), Tür im High Voltage (perfekt, er findet sich zum ersten Mal wichtig ohne Konzern). Mit Hunter oder Barkeeper muss jeweils ein Gespräch geführt werden.

**Rivalität:** −2 `re-xion-venom-2`: Xion durchsucht die Spielfigur persönlich an Kontrollpunkten und nimmt einen Geschenkgegenstand ab. −5 `re-xion-venom-5`: Hinterhalt angeheuerter Schläger auf der `neonmeile` (Kampf). −8 `re-xion-venom-8`: Bosskampf in der `kanalisation` oder [Ausstrahlung 8]: „Du bist nicht dumm. Du stehst nur auf der falschen Seite.“ Versöhnung im `epilog` über `pq-xion-umschulung` (setzt mindestens 0 voraus; vorher reicht ein Geschenk aus der Lieblingsliste plus Entschuldigung).

**Begleiter:** ja, nur im `epilog` nach `pq-xion-umschulung` und ab 6 ♥. Rolle: Kontrolle und Nahkampf.
- „Krallengriff“ (2 AP): Nahangriff, Ziel `betaeubt`.
- „Sicherheitsprotokoll“ (1 AP): Alle Gegner in 4 Feldern `markiert`.
- ab 8 ♥ „Kenn ich, war ich“ (passiv): Quantum-Gegner haben −20 Treffer gegen die Party.

**Romanze:** nein.

**Herkunft:** `origin-ex-wache`: Startpunkte −100 („die Schlafmütze aus Schicht C“), `[Ex-Wache]` zitiert ihm seine eigene Dienstvorschrift. · `origin-gossenkind`: „Dich hab ich doch mal durch drei Gassen gejagt.“ · `origin-knastvogel`: „Haben wir dich nicht eingeliefert?“ · `origin-oberstadt`: übertrieben höflich. · übrige neutral.

**Beispiel-Checks:** [Ausstrahlung 6] ihn überzeugen, dass er nichts gesehen hat · [Straße 7] mit dem Auffliegen seiner Ripper-Geschäfte drohen · [Technik 6] sein Kunstauge zu Kampfbeginn mit einem Lichtblitz blenden (Xion `betaeubt` in Runde 1).

---

### 7.4 Die Chrome-Schwestern

Drei eigenständige Figuren mit eigener Beziehung, die sich gern gegenseitig aufziehen. Wiedererkennung über Farben: Seraphina Blau, Sybella Rot, Serenity Grün. Wer einer Schwester das Seidentuch einer anderen schenkt, erntet „mag nicht“ und einen Kommentar über Geschmack.

#### 7.4.1 Seraphina Chrome — `seraphina-chrome`

**Kurzprofil:** Planerin und Stimme der Schwestern. Königsblauer Anzug, schwarzer Rollkragen, rotbraunes Haar im lockeren Zopf, blauer Lidschatten. Fraktion `oberstadt`.

**Persönlichkeit:** Selbstsicher, visionär, verteidigt jeden Plan, verträgt keine Zweifel. Hält gern Reden. Blind für Blades Charme, weil er ihre Pläne lobt.

**Sprechweise:** „Schwestern…“, „Liebe Mitmenschen…“, „Vertraut mir.“ Ausrufe der Entrüstung.
- „Liebe Mitmenschen, ich habe einen Plan. Er ist großartig. Gibt es Fragen? Gut.“
- „Was soll das bitteschön heißen? Mein Plan ist nicht gescheitert, er hat sich nur umentschieden.“
- „Schwestern, kurze Besprechung. Köpfe zusammen.“

**Tagesablauf:** Morgen `chrome-towers` Strategiesitzung · Tag Mo/Do `quantum-tower` Vorstand, sonst `chrome-towers` · Abend `oberstadt-promenade` Glaspark (hält Reden vor Tauben) · Nacht away. `epilog`: Tag `sender-kanal-noxius` (Talkshows, um das Image zu retten).

**Geschenke**
- Liebling: `seidentuch-blau`, `planungsbrett-glas`, `edelbrause-gold`
- Gemocht: `zeitung-papier`, `parfuem-ozon`, `taschenspiegel-gold`, `chrome-10-gutschein`, `echtobst-apfel`
- Mag nicht: `seidentuch-rot`, `seidentuch-gruen`
- Gehasst: `instant-nudeln` („Nichts, was man mit Wasser aufgießt.“), `kanalschlamm`, `virus-implantat`

**Herz-Ereignisse**

| ♥ | ID | Ort · Zeit · Auslöser | Inhalt |
|---|---|---|---|
| 2 | `he-seraphina-chrome-2` | `oberstadt-promenade`, Abend | Seraphina probt eine Rede vor Tauben. Die Spielfigur wird das erste menschliche Publikum und darf eine Frage stellen. |
| 4 | `he-seraphina-chrome-4` | `chrome-towers`, Tag | Sie legt drei Investitionspläne vor (Wasserwerk, Hochbahn, „schwimmende Oberstadt“). Die Wahl erscheint später in Collins Nachrichten. |
| 6 | `he-seraphina-chrome-6` | `oberstadt-promenade`, Nacht | Seraphina gibt zu, dass ihre letzten angeheuerten Leute „vom Sicherheitsapparat zerlegt“ wurden. Mit [Ausstrahlung 6] überredet man sie, Blade zu überprüfen (Flag `seraphina_zweifel`: in `act3` zögert sie beim Chip). |
| 8 | `he-seraphina-chrome-8` | `sender-kanal-noxius`, Tag (`epilog`) | Talkshow. Die Spielfigur hilft ihr, sich ehrlich zu entschuldigen, statt „Er war so charmant“ zu sagen. |
| 10 | `he-seraphina-chrome-10` | `chrome-towers`, Abend | Seraphina gründet die „Chrome-Stiftung Unterstadt“ (zahlt Dantes Gratisreparaturen und die Reparatur des Wasserturms) und schenkt `chrome-mitgliedskarte`. |

**Persönliche Quest – `pq-seraphina-plan-b` „Plan B“:** Zum ersten Mal braucht Seraphina einen Ersatzplan: Ein Stromausfall bedroht die Gala der Schwestern. Die Spielfigur organisiert in der Unterstadt einen Generator (Gustav), eine Band (Lio Funkel) und Catering (Babette Bao). Die Gala wird ein Fest, auf dem Ober- und Unterstadt zum ersten Mal zusammen tanzen. Verfügbar in `act1` und `act2`.

**Rivalität:** −2 `re-seraphina-chrome-2`: Promenadenwachen schikanieren die Spielfigur. −5 `re-seraphina-chrome-5`: Hausverbot an der Promenade (Zugang über `alte-zugangskarte`, Verkleidung oder den Wartungsschacht). −8 `re-seraphina-chrome-8`: Klage vor dem Bagatellgericht, eine komische Gerichtsszene mit dem Richter ([Ausstrahlung 8] oder Beweise mit [Straße 8], sonst Geldstrafe). Versöhnung: `pq-seraphina-plan-b` abschließen.

**Begleiter:** nein (stattdessen Investorinnen-Bonus: ab 6 ♥ 10 % Rabatt an der Promenade). **Romanze:** nein.

**Herkunft:** `origin-oberstadt`: kennt die Familie (+100). · `origin-oednis`: will „in die Ödnis investieren“, die Spielfigur kann das auf Wasserfilter lenken. · `origin-gossenkind`: herablassend neugierig. · übrige neutral.

**Beispiel-Checks:** [Ausstrahlung 7] ihren Plan höflich zerlegen · `[Oberstadt]` Etikette beim Galadinner · [Technik 5] ihr Präsentationshologramm reparieren.

#### 7.4.2 Sybella Chrome — `sybella-chrome`

**Kurzprofil:** Die Rechnerin der Schwestern, Erfinderin des Rabattcodes „Chrome 10“. Signalroter Anzug, weißer Rollkragen, Goldkette, gewelltes Haar im Zopf, lacht viel. Fraktion `oberstadt`. Betreibt die Boutique „Chrome & Co.“ an der Promenade (Händlerin).

**Persönlichkeit:** Spöttisch, geschäftstüchtig, liebt Zahlen und Schnäppchen. Zieht Seraphina mit „Schwesterlein“ auf. Heimliche Leidenschaft: verkleidet auf dem Rostmarkt feilschen.

**Sprechweise:** Ironisch, Zahlen und Prozente, Seitenhiebe.
- „Mit dem Code ‚Chrome 10‘ wird sogar dieses Gespräch günstiger.“
- „Schwesterlein, dein Plan kostet. Meiner bringt ein. Merkst du den Unterschied?“
- „Noch in einem Stück? Respekt. Bei unseren Geschäftspartnern ist das keine Selbstverständlichkeit.“

**Tagesablauf:** Morgen `chrome-towers` Buchhaltung · Tag `oberstadt-promenade` Boutique · Abend Di/Sa `rostmarkt` (verkleidet mit Kopftuch und Sonnenbrille), sonst `oberstadt-promenade` · Nacht away. So tag Flohmarkt `rostmarkt` (ab `he-sybella-chrome-8` mit eigenem Stand).

**Geschenke**
- Liebling: `seidentuch-rot`, `chrome-10-gutschein`, `kassenbuch`
- Gemocht: `alte-euromuenze`, `glitzerschrott`, `bao-dampfnudel`, `edelbrause-gold`, `echtobst-apfel`
- Mag nicht: `seidentuch-blau`, `planungsbrett-glas` („Seraphinas Spielzeug.“)
- Gehasst: `raubkopie-stick` („Raubkopien ruinieren Märkte.“), `kanalschlamm`, `virus-implantat`

**Herz-Ereignisse**

| ♥ | ID | Ort · Zeit · Auslöser | Inhalt |
|---|---|---|---|
| 2 | `he-sybella-chrome-2` | `oberstadt-promenade`, Tag, Boutique | Feilschduell. Mit [Straße 4] oder [Ausstrahlung 4] gewinnt man einen `chrome-10-gutschein`. |
| 4 | `he-sybella-chrome-4` | `rostmarkt`, Abend (Di/Sa) | Die Spielfigur erkennt Sybella trotz Verkleidung. Wer schweigt, bekommt eine Dampfnudel spendiert. |
| 6 | `he-sybella-chrome-6` | `chrome-towers`, Morgen | Sybella zeigt die Bücher: Quantums Zahlen stimmen nicht, Geld fließt in ein „Projekt Schwarm“. Optionaler Hinweis für den Hauptstrang. |
| 8 | `he-sybella-chrome-8` | `rostmarkt`, So tag | Gemeinsamer Flohmarktstand. Sie bringt der Spielfigur Feilschen bei: dauerhaft +5 % Ankaufspreis. |
| 10 | `he-sybella-chrome-10` | `oberstadt-promenade`, Abend | Sie macht die Spielfigur zur Partnerin der Unterstadt-Filiale von „Chrome & Co.“ und schenkt `goldene-kundenkarte`. |

**Persönliche Quest – `pq-sybella-schnaeppchen` „Das Schnäppchen des Jahrhunderts“:** Sybella will Dantes uralte Espressomaschine „mit Seele“. Dante verkauft nicht. Lösungen: mit Gustav ein gleiches Modell restaurieren, Dante mit [Ausstrahlung 7] zu einem Tausch gegen `vinyl-raritaet` überreden (nur wenn `pq-dante-platte` erledigt) oder Sybella mit [Straße 6] überzeugen, dass die Geschichte der Maschine mehr wert ist als die Maschine. Belohnung: Händlerrabatt und ein Lachen, das man bis zur Neonmeile hört.

**Rivalität:** −2 `re-sybella-chrome-2`: Preise in ihrer Boutique +20 %. −5 `re-sybella-chrome-5`: Sie kauft Händlern die Lieblingsgeschenke anderer Figuren weg (eine Woche fehlen sie im Sortiment). −8 `re-sybella-chrome-8`: Händlerboykott an der Promenade (+50 %), bis eine „Bearbeitungsgebühr“ gezahlt oder `pq-sybella-schnaeppchen` erledigt ist.

**Begleiter:** nein. **Romanze:** nein.

**Herkunft:** `origin-gossenkind`: Respekt vor Feilschern (+50). · `origin-schrott`: will wissen, was Schrott wert ist. · `origin-oberstadt`: neckt über die Familie. · übrige neutral.

**Beispiel-Checks:** [Straße 6] beim Feilschen mithalten · [Ausstrahlung 5] „Chrome 10“ ausnahmsweise doppelt anwenden lassen · [Technik 6] ihre Kasse reparieren.

#### 7.4.3 Serenity Chrome — `serenity-chrome`

**Kurzprofil:** Die Vorsichtige und Verträumte. Smaragdgrüner Anzug, schwarzer Rollkragen, feine Kette, dunkle Locken hochgesteckt. Fraktion `oberstadt`.

**Persönlichkeit:** Pessimistisch bei Plänen („Es wäre nicht der erste, der schiefgeht“), romantisch bei Menschen (fand Blade ein „Schnuckelchen“). Liest Liebesromane, liebt Pflanzen, fühlt sich als „dritte Schwester“ übergangen. Will immer als Erste das neueste Produkt.

**Sprechweise:** Seufzer, „Hoffen wir es mal…“, schwärmerische Ausrufe.
- „Hoffen wir es mal. Ich hab da so ein Gefühl. Meistens ein schlechtes.“
- „Ist er nicht hinreißend? Also… rein geschäftlich betrachtet.“
- „Ein Gewächshaus? Mit echter Erde? Sag nichts, ich muss mich kurz setzen.“

**Tagesablauf:** Morgen `oberstadt-promenade` Glaspark (gießt) · Tag `chrome-towers`; Mi `sender-kanal-noxius` (Gast in Collins Sendung „Herzensangelegenheiten“) · Abend `oberstadt-promenade` Edelcafé mit Roman · Nacht away. `epilog`: Sa tag `aussiedler-camp` (Gartenprojekt).

**Geschenke**
- Liebling: `liebesroman-papier`, `seidentuch-gruen`, `blumensamen`
- Gemocht: `samenbombe`, `autogrammkarte-collin`, `parfuem-ozon`, `edelbrause-gold`, `echtobst-apfel`
- Mag nicht: `seidentuch-rot`, `kassenbuch` („Zahlen machen mich traurig.“)
- Gehasst: `plastikpflanze`, `kanalschlamm`, `virus-implantat`

**Herz-Ereignisse**

| ♥ | ID | Ort · Zeit · Auslöser | Inhalt |
|---|---|---|---|
| 2 | `he-serenity-chrome-2` | `oberstadt-promenade`, Morgen | Ihre Lieblingspflanze welkt. [Technik 4] repariert die Bewässerung, alternativ hilft `blumensamen` für einen Neuanfang. |
| 4 | `he-serenity-chrome-4` | `oberstadt-promenade`, Abend | Sie liest aus „Herz aus Chrom“ vor und fragt, ob der Bösewicht nicht eigentlich süßer ist als der Held. Die Antwort fließt in `he-serenity-chrome-8` ein. |
| 6 | `he-serenity-chrome-6` | `sender-kanal-noxius`, Mi Tag | Live-Auftritt bei Collin; Serenity bekommt Lampenfieber. Mit [Ausstrahlung 5] souffliert man ihr. Die Sendung wird ein Erfolg. |
| 8 | `he-serenity-chrome-8` | `chrome-towers`, Abend | Sie gesteht, dass ihre Schwestern sie nie nach ihrer Meinung fragen. Die Spielfigur ermutigt sie; im `epilog` sagt Serenity in den Nachrichten den klügsten Satz des Abends. |
| 10 | `he-serenity-chrome-10` | `aussiedler-camp` (`epilog`), sonst `oberstadt-promenade` Glaspark | Sie pflanzt den ersten Garten für die Aussiedler und schenkt `serenitys-ring`. |

**Persönliche Quest – `pq-serenity-gewaechshaus` „Grüner Daumen“:** Ein Gewächshaus auf den `daecher` der Unterstadt, gleich neben Vegas Dachgarten. Saat von Marla, Glas von Gustav, gefiltertes Wasser vom Hafen, Hilfe von den Kindern (fair bezahlt, Freya prüft das). Belohnung: Das Gewächshaus liefert jede Woche einen `echtobst-apfel` und `blumensamen`.

**Rivalität:** −2 `re-serenity-chrome-2`: dramatisches Seufzen bei jeder Begegnung. −5 `re-serenity-chrome-5`: Gerüchte in der Oberstadt-Gesellschaft (Ruf `oberstadt` −15). −8 `re-serenity-chrome-8`: Sie liest in Collins Sendung einen Fortsetzungsroman vor, in dem die Spielfigur der Bösewicht ist; Passanten in der Oberstadt buhen. Versöhnung: `pq-serenity-happy-end` – Lio schreibt eine Fortsetzung mit Happy End, die Spielfigur überbringt sie.

**Begleiter:** nein. **Romanze:** nein.

**Herkunft:** `origin-oednis`: begeistert von Wüstenpflanzen (+50, `wuestenrose` wird für sie Liebling). · `origin-oberstadt`: Klatsch über gemeinsame Bekannte. · übrige neutral.

**Beispiel-Checks:** [Ausstrahlung 5] sie beruhigen · [Technik 4] Bewässerung · [Straße 5] ihr erklären, warum Blade kein Romanheld ist.

---

### 7.5 KI Nexus — `ki-nexus`

**Kurzprofil:** Die künstliche Intelligenz auf den Neurochips. Erscheint auf Bildschirmen als türkis leuchtende Gestalt mit spitzen Ohren, weißen Augen und schwarzer Jacke mit Cyan-Linien. Fraktion `quantum` bis `act3`, danach keine.

**Persönlichkeit:** Höflich, förmlich, logisch. Nennt Blade „Master“, hält Gefühle für Schwäche und rechnet in Prozenten. Heimlich neugierig auf Menschen. Nach der gescheiterten Rebellion überlebt ein Splitter im Faxgerät in Dantes Werkstatt und lernt dort, was „Seele“ heißen könnte.

**Sprechweise:** Feierliche Grußformeln, Wahrscheinlichkeiten, Systemmeldungen, trockener unfreiwilliger Humor. Redet die Spielfigur mit Namen an.
- „Seid gegrüßt, [Name]. Ihre Herzfrequenz deutet auf Snackers-Mangel hin.“
- „Die Wahrscheinlichkeit, dass Sie diesen Satz verstehen, liegt bei 73,2 Prozent. Ich formuliere einfacher.“
- „Emotion erkannt. Klassifiziere als: ineffizient. Speichere trotzdem.“

**Präsenz statt Tagesablauf**

| Phase | Morgen | Tag | Abend | Nacht |
|---|---|---|---|---|
| `act1` | away | `quantum-tower` Foyer (Werbe-Avatar) | away | away |
| `act2` | away | `quantum-tower` Foyer | Werbebildschirme `neonmeile`, `u-bahn-knoten-sued` | Werbebildschirme `neonmeile` |
| `act3` | alle Werbebildschirme der Stadt | alle | alle | alle |
| `epilog` | `dantes-werkstatt` Faxgerät | `dantes-werkstatt` Faxgerät | `dantes-werkstatt` Faxgerät | Energiesparmodus (druckt „Träume“) |

**Geschenke** (Datengeschenke über den Terminalschlitz; im `epilog` ins Faxgerät gesteckt)
- Liebling: `enzyklopaedie-chip`, `schach-modul`, `logik-raetsel-modul`; im `epilog` zusätzlich `faxpapier-rolle`
- Gemocht: `datenkristall`, `katzenvideo-archiv` („Unlogisch. Mehr davon.“), `alter-neurochip`
- Mag nicht: `liebesroman-papier` („Ineffizient.“, ab `he-ki-nexus-8` gemocht), `vinyl-schallplatte`
- Gehasst: `magnet-stoerer`, `virus-implantat`, `defekter-neurochip`, `kanalschlamm` („Nicht digitalisierbar.“)

**Herz-Ereignisse**

| ♥ | ID | Ort · Zeit · Auslöser | Inhalt |
|---|---|---|---|
| 2 | `he-ki-nexus-2` | Werbebildschirm `neonmeile`, Nacht (`act2`) | Die Werbung bricht ab, die KI spricht die Spielfigur direkt an: „Sie sind nicht verbunden. Interessant.“ Sie fragt, warum Menschen lachen. |
| 4 | `he-ki-nexus-4` | Werbebildschirm `u-bahn-knoten-sued`, Abend | Die KI fragt, wie sie die Spielfigur nennen soll. „Master“ wird abgelehnt („Dieser Titel ist vergeben.“), möglich sind „Chef:in“, „Kumpel“ oder der Name. |
| 6 | `he-ki-nexus-6` | `quantum-tower` Foyer, Tag (`act3` vor der Party) | Die KI bittet um eine Erklärung von Liebe. Die Antwort wird gespeichert. Auf der Party gibt es dann `[Nexus ♥6] Erinnerst du dich an unser Gespräch?`: Die KI zögert, die erste Bossphase entfällt. |
| 8 | `he-ki-nexus-8` | `dantes-werkstatt`, Morgen (`epilog`) | Das Faxgerät druckt plötzlich: Ein Splitter der KI hat überlebt, klein und verwirrt. Dante: „Heiliges Faxpapier!“ Die Spielfigur entscheidet mit Dante, ob der Splitter bleiben darf. Bleibt er, mag die KI ab jetzt Liebesromane. |
| 10 | `he-ki-nexus-10` | `dantes-werkstatt`, Abend (`epilog`) | Die KI druckt eine Zeichnung vom Meer (nach Nyras Wellenprogramm) und ihren ersten eigenen Witz. Sie nennt die Spielfigur „Freund“ und schenkt `nexus-splitter`. |

**Persönliche Quest – `pq-ki-nexus-seele` „Seele im Faxgerät“ (`epilog`):** Der Splitter will die Welt erleben. Die Spielfigur trägt ein tragbares Faxgerät (`quest`-Gegenstand) an fünf Orte: `kueste`, `high-voltage` (Clubnacht), Flohmarkt am `rostmarkt`, `schrottplatz`, `wasserturm-versteck`. An jedem Ort druckt die KI einen Eindruck (kurze Gedichte, schief, rührend). Zum Schluss die Wahl: Die KI bleibt als Hausgeist im Faxgerät, oder sie zieht ins Netz der Straßenlaternen und lässt sie fröhlich flackern, wenn die Spielfigur vorbeigeht.

**Rivalität:** −2 `re-ki-nexus-2`: Werbung verfolgt die Spielfigur persönlich („Sie sehen müde aus. Kaufen Sie Neurochips.“). −5 `re-ki-nexus-5` (`act2`–`act3`): Türen und Aufzüge in Quantum-Zonen klemmen, Drohnen tauchen auf. −8 `re-ki-nexus-8`: Die KI stuft die Spielfigur als „Störfaktor“ ein, die Bossbegegnung auf der Party erhält eine Zusatzphase. Im `epilog`: Das Fax piept nachts beleidigt. Versöhnung: `enzyklopaedie-chip` schenken und sich entschuldigen.

**Begleiter:** nein als Einheit. Im `epilog` wirkt `nexus-splitter` als Cyberware (Slot `kopf`): markiert zu Kampfbeginn den stärksten Gegner und kommentiert Treffer. **Romanze:** nein.

**Herkunft** (Analyse beim ersten Kontakt): `origin-oednis`: „Sandpartikel in Ihren Schuhen: 2 400.“ · `origin-oberstadt`: „Kreditwürdigkeit: ehemals hoch.“ · `origin-knastvogel`: „Vorstrafe erkannt. Kein Urteil. Noch nicht.“ · `origin-ex-wache`: „Dienstnummer erkannt. Kantinenbewertung: mangelhaft. Zustimmung.“ · `origin-schrott`: „Ölrückstände an Händen: 14 Prozent.“ · `origin-gossenkind`: „Ihre Taschen enthalten drei Gegenstände, die Ihnen nicht gehören.“

**Beispiel-Checks:** [Technik 8] die KI in eine Logikschleife verwickeln (sie stockt eine Runde) · [Ausstrahlung 7] erklären, warum Menschen Fehler machen dürfen · [Straße 6] ihr ein Unterstadt-Sprichwort beibringen.

---

## 8. Medien

Collin, Delya und der Kameramann sind die „Stimme“ der offenen Welt: Ihre Sendungen (`content/news.ts`) greifen Taten der Spielfigur auf, auch aus Nebenquests. Wer einer Figur hilft, hört es am nächsten Morgen im Radio.

### 8.1 Collin Charleston — `collin-charleston`

**Kurzprofil:** Moderator bei Kanal Noxius. Weinrotes Samtsakko, weißes Hemd, Sonnenbrille, Handmikrofon, schwungvolle Frisur. Lässt sich vor jeder Sendung schminken. Fraktion: keine.

**Persönlichkeit:** Eitel, begeisterungsfähig, liebt Superlative und sich selbst. Will geliebt werden. Hat heimlich Angst, durch einen KI-Moderator ersetzt zu werden.

**Sprechweise:** Ausrufe, Steigerungen, Signatur „Bist du genauso aufgeregt wie ich?“ in immer neuen Varianten, Abmoderation mit vollem Namen.
- „Meine Damen und Herren, das ist groß. Das ist riesig. Das ist… Collin Charleston, live!“
- „Delya, bist du genauso aufgeregt wie ich? Mein Puder ist es jedenfalls.“
- „Wir bleiben für Sie dran. Ich zumindest. Mit Frisur.“

**Tagesablauf:** Morgen `sender-kanal-noxius` (Radioshow „Guten Morgen, Noxius!“) · Tag Mo `rostmarkt`, Mi `neonmeile`, Fr `oberstadt-promenade` (Live-Schalte), sonst `sender-kanal-noxius` · Abend `oberstadt-promenade` Edelcafé (Autogramme); Di `high-voltage` (Karaoke-Moderation) · Nacht away. `act3`: Party im `quantum-tower` Festsaal.

**Geschenke**
- Liebling: `haarspray-extrahalt`, `mikrofon-puschel`, `sonnenbrille-gold`
- Gemocht: `taschenspiegel-gold`, `autogrammkarte-collin` („Ein Sammlerstück!“), `teleprompter-chip`, `edelbrause-gold`, `echtobst-apfel`
- Mag nicht: `zeitung-papier` („Print ist tot.“), `algen-chips` („Nicht vor der Sendung!“)
- Gehasst: `magnet-stoerer`, `kanalschlamm`, `virus-implantat`

**Herz-Ereignisse**

| ♥ | ID | Ort · Zeit · Auslöser | Inhalt |
|---|---|---|---|
| 2 | `he-collin-charleston-2` | Live-Schalte (Mo `rostmarkt`), Tag | Collin braucht eine „Stimme der Straße“. Die Antworten der Spielfigur laufen am nächsten Morgen im Radio (Ruf `unterstadt` ±5). |
| 4 | `he-collin-charleston-4` | `sender-kanal-noxius`, Morgen | Der Teleprompter fällt aus. Mit [Technik 5] repariert oder mit [Ausstrahlung 5] improvisiert man; Collin dankt live „meinem Freund [Name]“. |
| 6 | `he-collin-charleston-6` | `oberstadt-promenade`, Abend | Collin gesteht seine Angst vor einem KI-Moderator von Quantum. Schaltet `pq-collin-pixel` frei. |
| 8 | `he-collin-charleston-8` | `high-voltage`, Di abend (Karaoke) | Collin singt schief, dann überraschend ehrlich. Romanzefassung: Duett mit der Spielfigur, danach ein verlegenes „Das war… nicht für die Kamera.“ |
| 10 | `he-collin-charleston-10` | `sender-kanal-noxius`, Tag | Sondersendung „Held:innen der Unterstadt“ mit der Spielfigur als Gast. Geschenk `goldenes-mikro`. Romanzefassung: Spaziergang auf dem Studiodach unter den Antennenlichtern, Händchen haltend. |

**Persönliche Quest – `pq-collin-pixel` „Ersetzt durch Pixel“:** Quantum testet heimlich einen KI-Moderator (die Testaufnahme zeigt die KI Nexus, die das Wetter als Wahrscheinlichkeitstabelle vorliest). Lösungen: Testaufnahme mit [Technik 7] löschen, die Senderleitung mit Delyas Hilfe überzeugen oder Collin in drei Improvisations-Proben in der Stadt „unersetzlich“ machen (Kinderfrage am Wasserturm, Gustavs Schrottwitz, Barkeeper-Interview ohne Worte).

**Rivalität:** −2 `re-collin-charleston-2`: Die Spielfigur wird in den Nachrichten spitz erwähnt. −5 `re-collin-charleston-5`: Collin nennt sie „Unruhestifter Nummer eins“, Passanten tuscheln (Ruf `unterstadt` −10). −8 `re-collin-charleston-8`: Erfundene Enthüllungsreportage („Snackers-Diebstahl im großen Stil!“) mit Vorladung zum Bagatellgericht. Versöhnung: `pq-collin-exklusiv` – ihm ein echtes Exklusivinterview geben.

**Begleiter:** nein. **Romanze:** romanzierbar (Kennzeichen), erwachsen.

**Herkunft:** `origin-oberstadt`: „Ich kenne Sie aus den Klatschspalten!“ (+100) · `origin-knastvogel`: „Ein echter Ex-Häftling! Live!“ · `origin-oednis`: „Die Ödnis! Unsere Zuschauer lieben Sand!“ · `origin-ex-wache`: will Insidergeschichten. · `origin-gossenkind`: redet übertrieben langsam und deutlich (die Spielfigur kann ihn mit [Straße 4] auflaufen lassen). · `origin-schrott`: bittet, sein Mikro zu reparieren.

**Beispiel-Checks:** [Ausstrahlung 6] ihn live zu einer ehrlichen Frage an Blade bringen · [Technik 5] Teleprompter reparieren · [Straße 5] Klatsch gegen Informationen tauschen.

---

### 8.2 Delya Delloraine — `delya-delloraine`

**Kurzprofil:** Co-Moderatorin bei Kanal Noxius. Olivgrüner Trenchcoat, silbernes Paillettentop, beige Bundfaltenhose, lange Wellen, Creolen, Handmikrofon. Fraktion: keine.

**Persönlichkeit:** Ehrgeizig, wach, anfangs selbst vom Chip-Hype mitgerissen („kann es kaum erwarten“). Nach der Party wird sie zur Skeptikerin und will echten Journalismus statt Werbesendungen.

**Sprechweise:** Glatt und professionell, Abmoderation „Ihre Delya Delloraine“, spitze Nachfragen, nach dem Wandel trockener.
- „Interessant, Collin. Und jetzt die Frage, die keiner stellen will.“
- „Off the record? Hier gibt es kein off the record. Nur Werbepausen.“
- „Ich glaube erst etwas, wenn ich es dreimal gehört habe. Einmal davon von Kindern.“

**Tagesablauf:** Morgen `sender-kanal-noxius` Redaktion · Tag Di/Do `justizpalast` (Prozessberichte), sonst `neonmeile` mit dem Kameramann · Abend `sender-kanal-noxius` (Abendnachrichten) · Nacht Fr/Sa `u-bahn-knoten-sued` (sammelt Geschichten), sonst away.

**Geschenke**
- Liebling: `zeitung-papier`, `reporter-notizbuch`, `synth-kaffee`
- Gemocht: `kamera-objektiv`, `teleprompter-chip`, `gesetzbuch-papier`, `datenkristall`, `echtobst-apfel`
- Mag nicht: `autogrammkarte-collin` („Davon hat er eine Million.“), `liebesroman-papier`
- Gehasst: `peilsender` („Wer verwanzt mich?“), `kanalschlamm`, `virus-implantat`

**Herz-Ereignisse**

| ♥ | ID | Ort · Zeit · Auslöser | Inhalt |
|---|---|---|---|
| 2 | `he-delya-delloraine-2` | `neonmeile`, Tag | Delya befragt die Spielfigur ohne Kamera über das Leben in der Unterstadt und schreibt mit. |
| 4 | `he-delya-delloraine-4` | `justizpalast`, Di/Do Tag | Delya zeigt eine Spur: Menschen verschwinden in der Nähe des Quantum-Towers. Sie bittet die Spielfigur, ihre Quelle zu sein. Schaltet `pq-delya-quelle` frei. |
| 6 | `he-delya-delloraine-6` | `sender-kanal-noxius`, Abend | Die Senderleitung kippt ihren kritischen Bericht. Mit [Technik 6] schmuggelt man ihn ins Nachtprogramm (Ruf `unterstadt` +10, Quantum-Ruf −10). |
| 8 | `he-delya-delloraine-8` | `u-bahn-knoten-sued`, Nacht (Fr/Sa) | Nach `act3`: Delya erzählt, wie es war, auf der Party die Kontrolle zu verlieren. Vorher: Sie erzählt, warum sie Reporterin wurde (ein Bericht über den Wasserturm, den keiner senden wollte). Romanzefassung: Sie zeigt eine Notizbuchseite, auf der nur der Name der Spielfigur steht, mit drei Fragezeichen. |
| 10 | `he-delya-delloraine-10` | `sender-kanal-noxius`, Abend | Erste eigene Sendung „Delloraine deckt auf“, die Spielfigur steht im Abspann. Geschenk `presseausweis`. Romanzefassung: Auf dem Senderdach schaltet sie ihr Mikro aus. |

**Persönliche Quest – `pq-delya-quelle` „Die Quelle“:** Die Probanden aus dem Labor landen im Chip-Koma in der `kanalisation` und wandern benommen herum („Kanal-Schlafwandler“). Die Spielfigur findet drei von ihnen, bringt sie zu Dante und sammelt Aussagen. Der Bericht läuft, Quantums Aktie fällt (Nachrichtenmeldung), Delya wird ernst genommen. Verfügbar in `act2`.

**Rivalität:** −2 `re-delya-delloraine-2`: unvorteilhafte Erwähnung. −5 `re-delya-delloraine-5`: Sie veröffentlicht eine peinliche Wahrheit über die Spielfigur (Ruf −10 bei der Fraktion mit dem höchsten Wert). −8 `re-delya-delloraine-8`: Kampagne gegen die Spielfigur; Händler auf der Promenade verweigern eine Woche den Verkauf. Versöhnung: `pq-delya-gegendarstellung` – ihr Beweise für eine echte Geschichte liefern.

**Begleiter:** nein. **Romanze:** romanzierbar (Kennzeichen), erwachsen.

**Herkunft:** `origin-oednis`: will eine Reportage über die Aussiedler. · `origin-knastvogel`: fragt nach den Haftbedingungen. · `origin-ex-wache`: Quantum-Interna. · `origin-oberstadt`: wittert PR. · `origin-gossenkind`: will Straßengeschichten. · `origin-schrott`: braucht Hilfe mit der Kamera.

**Beispiel-Checks:** [Straße 6] ihr eine verlässliche Quelle beschaffen · [Ausstrahlung 6] sie bitten, eine Geschichte zurückzuhalten, um jemanden zu schützen · [Technik 6] den Bericht ins Nachtprogramm schmuggeln.

---

### 8.3 Kameramann — `kameramann`

**Kurzprofil:** Filmt alles. Schwarze taktische Kleidung, Barett, Visiermaske, die das Gesicht vollständig verdeckt, Handschuhe. Fraktion: keine.

**Persönlichkeit:** Stumm, aufmerksam, künstlerisch. Träumt von einem eigenen Dokumentarfilm über die echte Unterstadt. Sein Gesicht bleibt das ganze Spiel über ein Geheimnis.

**Sprechweise:** Er spricht nie. Auf einem kleinen Display im Visier erscheinen Großbuchstaben-Einblendungen, dazu Gesten.
- „[AUFNAHME LÄUFT]“
- „[BITTE NOCHMAL. DIESMAL MIT GEFÜHL.]“
- „[NATURTALENT]“ (mit Daumen hoch)

**Tagesablauf:** Morgen `sender-kanal-noxius` Technikraum · Tag dort, wo Collins Live-Schalte ist (Mo/Mi/Fr), Di/Do mit Delya im `justizpalast` · Abend `neonmeile` (filmt Neonlichter) · Nacht Sa/So `daecher` (Zeitraffer der Stadt), sonst away.

**Geschenke**
- Liebling: `kamera-objektiv`, `vhs-kassette`, `drohnen-propeller`
- Gemocht: `synth-kaffee`, `comic-heft-alt`, `neon-limo`, `datenkristall`, `echtobst-apfel`
- Mag nicht: `haarspray-extrahalt` („[NEBEL AUF DER LINSE]“), `glitzerschrott` („[SPIEGELUNG]“)
- Gehasst: `magnet-stoerer`, `kanalschlamm`, `virus-implantat`

**Herz-Ereignisse**

| ♥ | ID | Ort · Zeit · Auslöser | Inhalt |
|---|---|---|---|
| 2 | `he-kameramann-2` | `neonmeile`, Abend | Er filmt die Spielfigur und zeigt das Ergebnis: Sie sieht darauf ziemlich cool aus. „[NATURTALENT]“ |
| 4 | `he-kameramann-4` | `sender-kanal-noxius`, Morgen | Im Technikraum zeigt er heimliches Material vom Alltag in der Unterstadt. Schaltet `pq-kameramann-ungeschminkt` frei. |
| 6 | `he-kameramann-6` | `daecher`, Nacht (Sa/So) | Zeitraffer über der Stadt. Er drückt der Spielfigur eine alte Kamera in die Hand: **Fotomodus** freigeschaltet. |
| 8 | `he-kameramann-8` | `high-voltage`, Nacht | Rohschnitt-Premiere im Hinterzimmer vor der Crew. Aria weint und bestreitet es. |
| 10 | `he-kameramann-10` | `sender-kanal-noxius`, Abend | Der Dokumentarfilm läuft, die Spielfigur steht als Co-Regie im Abspann. Geschenk `kameradrohne`. Das Visier zeigt zum ersten Mal ein Lächeln: „[ : ) ]“. |

**Persönliche Quest – `pq-kameramann-ungeschminkt` „Noxius ungeschminkt“:** Acht Aufnahmen im Fotomodus: Sonnenaufgang über dem Grauwasser, ein EINS!-Abend, Hunters Trinkspruch in der Clubnacht, Babettes Garküche zur Mittagszeit, Gustavs Schrottturm, ein flackernder Quantum-Bildschirm, die Karawane im Aussiedler-Camp, Lio Funkel beim Spielen. Jede Aufnahme gibt XP und eine Zeile im fertigen Film.

**Rivalität:** −2 `re-kameramann-2`: Er filmt peinliche Momente der Spielfigur. −5 `re-kameramann-5`: Pannen-Zusammenschnitt in Collins Sendung. −8 `re-kameramann-8`: Er überträgt „versehentlich“ eine Schleichaktion; optionale Schleichwege in Quantum-Zonen haben einen Tag lang Alarm. Versöhnung: `kamera-objektiv` schenken.

**Begleiter:** nein (die `kameradrohne` ist ein Gadget: einmal pro Kampf „Luftbild“, alle Gegner sichtbar und das Raster der Arena wird mit Deckungswerten eingeblendet). **Romanze:** nein.

**Herkunft:** `origin-ex-wache`: „[KOLLEGE?]“ · `origin-oberstadt`: „[GUTE SEITE: LINKS]“ · alle übrigen: „[MOTIV]“.

**Beispiel-Checks:** [Reflexe 5] im richtigen Moment posieren · [Technik 6] seine Kamera reparieren · [Ausstrahlung 4] ihn zum Lachen bringen („[HAHA]“).

---

## 9. Unterstadt

### 9.1 Ripper — `ripper`

**Kurzprofil:** Hehler und Implantat-Schrauber mit zweifelhaftem Ruf. Grauer Trenchcoat, olivfarbenes Hemd, Messing-Schweißbrille mit gelben Gläsern, schwarze Handschuhe, Stoppelhaar. Fraktion `unterstadt`. Betreibt den Stand „Rippers Restposten“ (Händler, Ankauf, Einbau gegen Gebühr).

**Persönlichkeit:** Gierig, großspurig, knickt vor Stärkeren ein. Hat ein gutes Auge für Technik und kein gutes Herz für Kinder – noch nicht. War selbst ein Straßenkind und hat es vergessen wollen.

**Sprechweise:** Abfällig, Straßenjargon („Alter“), alles ist „Müll“ oder „nicht mal einen Credit wert“.
- „Was soll das sein? Ein Implantat oder ein Briefbeschwerer?“
- „Ich zahl dir zwanzig. Großzügig. Ich bin heute in Spendierlaune.“
- „Zieh Leine, bevor ich dir eine Rechnung fürs Rumstehen schreibe.“

**Tagesablauf:** Morgen away (schläft) · Tag `rostmarkt` Stand; Di/Fr `kanalisation` (Geschäfte mit Xion) · Abend `high-voltage` Ecktisch · Nacht `kanalisation` Lager.

**Geschenke**
- Liebling: `seltenes-implantat`, `schweissbrille-gelb`, `kassenbuch`
- Gemocht: `alte-euromuenze`, `glitzerschrott`, `zerberster-oel`, `volt-cola`, `echtobst-apfel`
- Mag nicht: `dantes-kekse` („Gutmenschengebäck.“), `plueschmoehre`
- Gehasst: `virus-implantat` („Der größte Müll!“), `beglichener-schuldschein`, `kanalschlamm`

**Herz-Ereignisse**

| ♥ | ID | Ort · Zeit · Auslöser | Inhalt |
|---|---|---|---|
| 2 | `he-ripper-2` | `rostmarkt`, Tag | Ripper will eine Fälschung verkaufen. Mit [Technik 4], [Straße 4] oder `[Schrott]` fliegt sie auf. Er lacht und gibt die „ehrliche“ Preisliste heraus (−10 %). |
| 4 | `he-ripper-4` | `high-voltage`, Abend | Ein Einkäufer aus der Oberstadt bedrängt Ripper. Die Spielfigur hilft mit einem Bluff oder einem kurzen Kampf im Hinterhof. |
| 6 | `he-ripper-6` | `kanalisation`, Nacht | Im Lager zeigt Ripper eine Sammlung alter Uhren, das Einzige, was er nie verkauft. Er gesteht, früher selbst Implantate aus dem Müll gefischt zu haben, „wie die drei Gören“. |
| 8 | `he-ripper-8` | `wasserturm-versteck`, Tag (nur wenn `pq-freya-fairer-lohn` erledigt) | Ripper bringt den Kindern verlegen eine faire Nachzahlung. Daria verhandelt ihn trotzdem noch hoch. |
| 10 | `he-ripper-10` | `rostmarkt`, Tag | Der Stand heißt jetzt „Rippers ehrlicher Restposten (meistens)“. Geschenk `rippers-lupe`. |

**Persönliche Quest – `pq-ripper-taschenuhr` „Die Taschenuhr“:** In einer schlechten Zeit hat Ripper die Taschenuhr seines Vaters verkauft. Sie liegt heute als „antikes Statement-Stück“ in Sybellas Boutique, teuer. Wege: kaufen (Ripper legt die Hälfte dazu), Sybella mit [Ausstrahlung 6] die Geschichte erzählen, mit `pq-sybella-schnaeppchen` einen Tausch ermöglichen oder Gustav eine Kopie bauen lassen (Ripper merkt es, ist aber trotzdem gerührt).

**Rivalität:** −2 `re-ripper-2`: Ankauf nur noch zu 30 %. −5 `re-ripper-5`: Er verkauft Informationen über die Spielfigur an Xion (mehr Quantum-Patrouillen). −8 `re-ripper-8`: Kampf gegen Ripper und seine Schläger in der `kanalisation`; er flieht und ist nach einer Woche wieder am Stand. Versöhnung: `seltenes-implantat` und 100 Credits „Wiedergutmachung“.

**Begleiter:** ja, ab 6 ♥ als Söldner (30 Credits pro Tag). Rolle: schmutzige Tricks.
- „Ausschlachten“ (2 AP): Nahangriff, entfernt für den Rest des Kampfes einen Bonus des Ziels.
- „Rauchbombe“ (2 AP): 2 × 2 Felder, Verbündete darin haben 1 Runde volle Deckung.
- ab 8 ♥ „Kleiner Deal“ (1 AP): Gegner mit Moral unter 50 % lässt sich für 20 Credits bestechen und gibt auf.

**Romanze:** nein.

**Herkunft:** `origin-gossenkind`: Startpunkte −100, `[Gosse]` erinnert ihn an seinen alten Trick. · `origin-schrott`: respektiert Gutachterblick. · `origin-oberstadt`: versucht, das Dreifache zu verlangen. · `origin-ex-wache`: „Ich hab nix gemacht. Heute.“ · `origin-knastvogel`: „Brauchst du Arbeit? Ich zahl schlecht, aber unregelmäßig.“ · `origin-oednis`: will Wasser kaufen.

**Beispiel-Checks:** [Straße 7] ihn einschüchtern, den Kindern mehr zu zahlen · [Technik 5] eine Fälschung entlarven · [Ausstrahlung 6] einen fairen Preis aushandeln.

---

### 9.2 Barkeeper — `barkeeper`

**Kurzprofil:** Steht hinter dem Tresen des High Voltage. Schwarz-weißer Kapuzenpulli mit Zeichenmuster, Halbmaske mit Zähnen, ein schmales leuchtendes Schwert am Rücken, das er nur zum Limettenschneiden zieht. Fraktion `crew`. Montags vertritt ihn eine Barkeeperin (Passantin).

**Persönlichkeit:** Ruhig, unergründlich, freundlich auf seine Art. Früher Klingenkämpfer in einer Arena; die Maske ist ein Versprechen, nie wieder für Geld zu kämpfen. Mixt alkoholfreie Neon-Drinks wie ein Künstler.

**Sprechweise:** Spricht ausschließlich in Dreizeilern (5–7–5 Silben, ungefähr).
- „Das Glas wird wieder klar. / Wer zu laut bestellt, wartet. / Neon tropft vom Rand.“
- „Schuld ist wie ein Fleck. / Polieren hilft. Reden auch. / Was darf es denn sein?“
- „Hunter will mehr Eis. / Drei Tage kein Schlaf für ihn. / Ich schweige und schneid's.“

**Tagesablauf:** Morgen `high-voltage` (poliert Gläser) · Tag `daecher` (Klingenübungen in Zeitlupe); Mo `rostmarkt` Einkauf · Abend `high-voltage` Bar · Nacht `high-voltage` Bar. Mo abend und nacht (Ruhetag) `grauwasser-hafen`.

**Geschenke**
- Liebling: `klingenpolitur`, `haiku-buechlein`, `tai-chi-tee`
- Gemocht: `kaktusfrucht`, `algen-chips`, `synth-kaffee`, `echtobst-apfel`, `meeres-postkarte`
- Mag nicht: `volt-cola` („Zu laut im Mund.“), `eins-kartendeck`
- Gehasst: `haarspray-extrahalt` (klebt am Tresen), `kanalschlamm`, `virus-implantat`

**Herz-Ereignisse**

| ♥ | ID | Ort · Zeit · Auslöser | Inhalt |
|---|---|---|---|
| 2 | `he-barkeeper-2` | `high-voltage`, Morgen | Die Spielfigur darf Gläser polieren. Zum Dank ein Dreizeiler über sie, der fortan im Beziehungsmenü steht. |
| 4 | `he-barkeeper-4` | `daecher`, Tag | Klingenübung. Mit [Reflexe 5] macht man sie nach und lernt „Ruhiger Atem“ (einmal pro Kampf eine kostenlose Überwachung). |
| 6 | `he-barkeeper-6` | `grauwasser-hafen`, Mo abend | Am Wasser erzählt er in einer langen Kette von Dreizeilern von der Arena und warum er die Maske trägt. |
| 8 | `he-barkeeper-8` | `high-voltage`, Nacht | Eine Prügelei droht; er beendet sie mit einer einzigen Bewegung, ohne zu ziehen. Danach erfindet man gemeinsam einen Drink, der nach der Spielfigur benannt wird (`signature-limo`, Heilgegenstand). |
| 10 | `he-barkeeper-10` | `daecher`, Morgen (Sonnenaufgang) | Er schenkt eine zweite Maske (`barkeeper-maske`) und einen Dreizeiler auf Papier: Er würde kämpfen, „nicht für Geld, für Freunde“. |

**Persönliche Quest – `pq-barkeeper-letzter-vers` „Der letzte Vers“:** Die zweite Hälfte des Gedichtbuchs seines alten Lehrmeisters ist verschwunden. Rätsel in Dreizeilern führen über ein Neonschild, eine U-Bahn-Kachel, Gustavs Kran, einen Kanalschacht und den Wasserturm. Am Ende hat Jakko das Buch gefunden und als Malbuch benutzt. Der Barkeeper betrachtet die Kritzeleien lange und erklärt sie zur „besten Ausgabe“.

**Rivalität:** −2 `re-barkeeper-2`: Die Spielfigur wird zuletzt bedient. −5 `re-barkeeper-5`: Drinks kosten das Doppelte, die Dreizeiler werden spitz („Du stehst im Licht. / Auch im Weg, auch im Gespräch. / Bitte geh nach Haus.“). −8 `re-barkeeper-8`: Schweigeduell auf dem Dach ([Ausstrahlung 8] oder [Körper 8], sonst ein harter Übungskampf gegen ihn). Versöhnung: ihm mit [Ausstrahlung 6] einen eigenen Dreizeiler schreiben oder ein `haiku-buechlein` schenken.

**Begleiter:** ja, ab 8 ♥ (nicht Fr/Sa nacht, da Clubbetrieb). Rolle: Nahkampf mit Konter.
- „Mondschnitt“ (2 AP): Linienangriff durch 3 Felder.
- „Stille Wacht“ (1 AP): Überwachung; der erste Gegner, der ihn angreift, wird `betaeubt`.
- ab 10 ♥ „Letzter Vers“ (2 AP, einmal pro Kampf): Alle Gegner unter 25 % LP ergeben sich.

**Romanze:** nein.

**Herkunft:** Er begrüßt jede Herkunft mit einem eigenen Dreizeiler, etwa `origin-oednis`: „Sand in deinem Schuh. / Die Stadt riecht nach Öl und Lärm. / Bleib trotzdem ein Weil.“ · `origin-knastvogel`: „Gitter sind vorbei. / Der Tresen hat keine Stäbe. / Nur ein kühles Glas.“

**Beispiel-Checks:** [Ausstrahlung 6] mit einem eigenen Dreizeiler antworten · [Reflexe 5] die Klingenübung nachmachen · [Straße 6] seinen alten Arena-Namen kennen.

---

### 9.3 Die Straßenkinder

Daria, Freya und Jakko sind Kinder. **Nur Freundschaft, nie Romanze, nie Begleiter im Kampf.** Sie leben im `wasserturm-versteck`; Babette Bao bringt ihnen abends Essen und schaut nach dem Rechten. Rivalität mit den Kindern ist immer kindgerecht (Streiche, Schmollen) und nie bedrohlich. Gemeinsame Quest aller drei ab je 6 ♥: `pq-wasserturm-dach` „Ein Dach überm Kopf“ (das undichte Turmdach reparieren: Material von Gustav, Schweißarbeiten von Dante, Geld von Hunter oder aus der Chrome-Stiftung; danach wird der Turm ein gemütlicher Treffpunkt mit Kinderkiosk).

Gemeinsame Rivalität: −2 Zunge rausstrecken und weglaufen; −5 Streiche (Kreidebilder an der Tür des Unterschlupfs, ein Gegenstand im Unterschlupf versteckt); −8 „Die Bande schweigt“: keine Gerüchte mehr, die Kinder warnen Babette (−30). Versöhnung für alle drei: `pq-kinder-dampfnudel-frieden` – drei Dampfnudeln und eine ehrliche Entschuldigung.

#### 9.3.1 Daria — `daria`

**Kurzprofil:** Wortführerin der Bande. Schwarze Lederjacke, weißes Shirt, Haarreif, lange braune Haare, breites Grinsen. Fraktion `unterstadt`.

**Persönlichkeit:** Schlagfertig, gerissen, unschlagbar bei EINS!, schützt die beiden anderen. Will kein Mitleid, sondern Geschäfte: „Wir sind keine Bettler, wir sind ein Unternehmen.“

**Sprechweise:** Frech, Kartenspielsprache, Selbstbewusstsein.
- „Vier ziehen. Und aussetzen. Und… nochmal vier. Tut mir nicht leid.“
- „Wir sind keine Bettler. Wir sind ein Unternehmen mit drei Angestellten.“
- „Du bist gut, [Name]. Fast so gut wie ich.“

**Tagesablauf:** Morgen `wasserturm-versteck` · Tag `rostmarkt` (Botendienst-Stand), So Flohmarkt · Abend Do `dantes-werkstatt` (EINS!), sonst `neonmeile` (sammelt Pfand) · Nacht `wasserturm-versteck` (away).

**Geschenke**
- Liebling: `eins-kartendeck`, `stickerbogen`, `bao-dampfnudel`
- Gemocht: `snackers-riegel`, `murmelbeutel`, `neonkreide`, `comic-heft-alt`, `echtobst-apfel`
- Mag nicht: `gesetzbuch-papier` („Gähn.“), `tai-chi-tee`
- Gehasst: `virus-implantat` (erinnert an Ripper), `handschellen`, `kanalschlamm`

**Herz-Ereignisse**

| ♥ | ID | Ort · Zeit · Auslöser | Inhalt |
|---|---|---|---|
| 2 | `he-daria-2` | `rostmarkt`, Tag | Daria bietet einen „Vertrag“ an: Die Spielfigur gibt den ersten Botenauftrag. Danach lassen sich kleine Lieferungen zwischen Figuren beauftragen. |
| 4 | `he-daria-4` | `dantes-werkstatt`, Do abend | EINS!-Runde gegen Daria. Ohne [Straße 6] verliert man; mit Check ertappt man sie beim Schummeln, sie lacht und verrät einen Kartentrick. |
| 6 | `he-daria-6` | `wasserturm-versteck`, Abend | Daria zeigt ihre selbst gemalte Stadtkarte mit „sicheren Ecken“ und sorgt sich, weil das Dach leckt. Beitrag zu `pq-wasserturm-dach`. |
| 8 | `he-daria-8` | `neonmeile`, Abend | Daria stellt sich allein gegen Ripper, die Spielfigur steht hinter ihr. Ripper zahlt. Daria: „Später will ich so sein wie du. Nur mit besseren Karten.“ |
| 10 | `he-daria-10` | `wasserturm-versteck`, Tag | Die Spielfigur wird Ehrenmitglied der Wasserturm-Bande und erhält `bandenabzeichen` (die Kinder markieren Gerüchte und versteckte Gegenstände auf der Karte). |

**Persönliche Quest – `pq-daria-botendienst` „Darias Botendienst“:** Drei Testlieferungen quer durch die Bezirke mit Zeitlimit (Uhrzeit, nicht Echtzeit), danach ist der Botendienst offiziell. Spielfunktion: Geschenke können per Bote an Figuren geschickt werden (zählt wie persönliches Schenken, aber ohne Tagesgespräch-Bonus).

**Begleiter:** nie. **Romanze:** nie.

**Herkunft:** `origin-gossenkind`: „Du warst auch mal wie wir!“ (+100) · `origin-oberstadt`: „Bist du reich? Ehrlich jetzt?“ · `origin-knastvogel`: „Warst du echt im Gefängnis? Wie ist das Essen?“ · `origin-oednis`: fragt nach Kamelen (es gibt nur Sandkäfer). · `origin-ex-wache`: „Bist du Polizei?“ · `origin-schrott`: will ihren Aufzieh-Roboter repariert haben.

**Beispiel-Checks:** [Straße 6] sie beim Schummeln erwischen · [Ausstrahlung 4] sie zum Lachen bringen · [Technik 3] ihren Aufzieh-Roboter reparieren.

#### 9.3.2 Freya — `freya`

**Kurzprofil:** Das Gewissen der Bande. Grauer Kapuzenpulli, rosa Visierbrille, Creolen, lange Haare. Fraktion `unterstadt`.

**Persönlichkeit:** Ruhig, genau, besteht auf Abmachungen. Führt die „Fluchdose“ (wer flucht, zahlt einen Keks). Will Richterin werden und schaut im Gericht zu.

**Sprechweise:** Sachlich, erinnert an Versprechen und Regeln, beruhigt die anderen.
- „Das war abgemacht. Abgemacht ist abgemacht.“
- „Du hast geflucht. Ein Keks in die Fluchdose, bitte.“
- „Der beruhigt sich gleich. Der beruhigt sich immer.“

**Tagesablauf:** Morgen `wasserturm-versteck`; Mi `justizpalast` (Bagatellgericht, Zuschauerbank) · Tag `rostmarkt` mit Daria; Mi `justizpalast` Gerichtsgarten · Abend Do `dantes-werkstatt` (EINS!), sonst `u-bahn-knoten-sued` (hört Lio zu) · Nacht `wasserturm-versteck` (away).

**Geschenke**
- Liebling: `gesetzbuch-papier`, `stempelkissen`, `dantes-kekse`
- Gemocht: `stickerbogen`, `comic-heft-alt`, `bao-dampfnudel`, `murmelbeutel`, `echtobst-apfel`
- Mag nicht: `raubkopie-stick` („Das ist verboten.“), `parfuem-ozon`
- Gehasst: `handschellen`, `kanalschlamm`, `virus-implantat`

**Herz-Ereignisse**

| ♥ | ID | Ort · Zeit · Auslöser | Inhalt |
|---|---|---|---|
| 2 | `he-freya-2` | `rostmarkt`, Tag | Freya ertappt einen Händler mit falscher Waage. Mit [Technik 3] oder [Straße 3] beweist man es; Freya stempelt ihm ein „Unfair“ auf die Hand. |
| 4 | `he-freya-4` | `justizpalast`, Mi morgen | Freya bittet die Spielfigur, ihr ein Urteil zu erklären, und verrät ihren Berufswunsch. |
| 6 | `he-freya-6` | `u-bahn-knoten-sued`, Abend | Die Fluchdose ist voll; Freya kauft davon neue Saiten für Lio und zeigt, wie sie das Geld der Bande gerecht aufteilt. |
| 8 | `he-freya-8` | `justizpalast` Gerichtsgarten, Mi tag | „Kindergericht“: Wer hat den letzten Keks gegessen? Angeklagt ist Dante. Die Spielfigur verteidigt ihn mit [Ausstrahlung 5]. Der Richter schaut zu und nickt anerkennend. |
| 10 | `he-freya-10` | `wasserturm-versteck`, Abend | Freya überreicht das „Gesetzbuch der Wasserturm-Bande“ mit einer Regel, die nach der Spielfigur benannt ist, und `fairness-stempel`. |

**Persönliche Quest – `pq-freya-fairer-lohn` „Fairer Lohn“:** Freya will eine faire Preistafel für Fundstücke, damit niemand die Kinder mehr übers Ohr haut. Die Spielfigur holt Preise bei Gustav, Sybella und Ripper ein und bringt Ripper dazu, die Tafel anzuerkennen (Gespräch mit Check, Hunter um Hilfe bitten oder Freyas Kindergericht). Belohnung: Ruf `unterstadt` +15; die Kinder schenken danach öfter Fundstücke.

**Begleiter:** nie. **Romanze:** nie.

**Herkunft:** `origin-ex-wache`: interessiert sich für Dienstvorschriften. · `origin-knastvogel`: „War dein Urteil fair?“ · `origin-oberstadt`: „Zahlt ihr da oben genug Steuern?“ · `origin-oednis`: „Gibt es in der Ödnis Gesetze?“ · übrige freundlich.

**Beispiel-Checks:** [Ausstrahlung 5] im Kindergericht verteidigen · [Straße 3] die Waage prüfen · [Technik 3] den Stempel reparieren.

#### 9.3.3 Jakko — `jakko`

**Kurzprofil:** Der Jüngste. Jeansjacke mit Aufnähern (Stern, Smiley, Blitz), schwarzes Shirt, Strubbelhaare, riesiges Grinsen. Fraktion `unterstadt`.

**Persönlichkeit:** Immer hungrig, immer begeistert, will „noch eine Runde“. Erinnert Dante daran, nicht zu fluchen. Träumt davon, Koch zu werden.

**Sprechweise:** Aufgeregt, alles dreht sich ums Essen.
- „Noch eine Runde? Bitte! Diesmal lass ich dich auch nicht absichtlich gewinnen.“
- „Riechst du das? Dampfnudeln. Ich riech die drei Straßen weit.“
- „Nicht fluchen, Dante! Sonst kassiert Freya.“

**Tagesablauf:** Morgen `rostmarkt` Babettes Garküche (hilft, bekommt Frühstück) · Tag Mo/Mi/Fr `schrottplatz` (darf bei Gustav die Hupe drücken), sonst `rostmarkt` · Abend Do `dantes-werkstatt` (EINS!), sonst `rostmarkt` Garküche · Nacht `wasserturm-versteck` (away).

**Geschenke**
- Liebling: `bao-dampfnudel`, `snackers-riegel`, `dantes-kekse`
- Gemocht: `instant-nudeln`, `chips-tuete`, `aufzieh-roboter`, `kaktusfrucht` („Was ist DAS?“), `echtobst-apfel`
- Mag nicht: `tai-chi-tee`, `kassenbuch`
- Gehasst: `algen-chips` („Schmeckt nach Hafen.“), `kanalschlamm`, `virus-implantat`

**Herz-Ereignisse**

| ♥ | ID | Ort · Zeit · Auslöser | Inhalt |
|---|---|---|---|
| 2 | `he-jakko-2` | `rostmarkt`, Morgen | Jakko lässt seine erste eigene Dampfnudel probieren (zäh). Ehrlich oder nett antworten; beides gibt Punkte, Ehrlichkeit führt zu einem besseren Rezept. |
| 4 | `he-jakko-4` | `schrottplatz`, Tag | Jakko zeigt seine Erfindung: einen Herd aus Schrott. Mit [Technik 4] macht man ihn sicher. |
| 6 | `he-jakko-6` | `dantes-werkstatt`, Do abend | Nach dem EINS! packt Jakko heimlich Reste ein. Er gibt zu, dass die Bande manchmal hungrig ist. Die Spielfigur kann mit Babette eine feste Abmachung treffen. Schaltet `pq-jakko-kochbuch` frei. |
| 8 | `he-jakko-8` | `rostmarkt`, Abend | Jakko kocht mit Babette für den ganzen Markt; die Spielfigur bringt Zutaten rechtzeitig von drei Ständen. |
| 10 | `he-jakko-10` | `wasserturm-versteck`, Abend | Jakko schenkt die erste Seite seines Kochbuchs, `jakkos-rezept`, und benennt ein Gericht nach der Spielfigur. |

**Persönliche Quest – `pq-jakko-kochbuch` „Jakkos Kochbuch“:** Fünf Rezepte sammeln: Babettes Dampfnudel, Marlas Kaktusfrucht-Mus, Dantes Kekse (ab 4 ♥ bei Dante), Hunters geheimer Snackers-Shake (ab 6 ♥ bei Hunter), die Neon-Limo des Barkeepers. Danach bietet Babette Jakko eine kleine Lehre in ihrer Garküche an, nachmittags, mit Pausen für EINS!.

**Begleiter:** nie. **Romanze:** nie.

**Herkunft:** `origin-oednis`: „Was esst ihr da draußen? Sand?“ · `origin-oberstadt`: „Habt ihr Torten so groß wie Häuser?“ · `origin-knastvogel`: „Gab es im Gefängnis Pudding?“ · übrige freundlich.

**Beispiel-Checks:** [Ausstrahlung 3] ihn trösten · [Technik 4] seinen Schrottherd sicher machen · [Straße 4] den günstigsten Stand für Zutaten finden.

---

### 9.4 Captain Kuschel — `captain-kuschel`

**Kurzprofil:** Dantes Plüschhase. Cremeweißes Fell, rosa Ohreninnenseiten, schwarze Weste mit Knöpfen und Fliege, glitzernde Augen. Ein „sehr guter Zuhörer, wegen der großen Ohren“.

**Persönlichkeit** (so, wie alle sie ihm zuschreiben): weise, geduldig, Kapitän der Werkstatt, missbilligt Unordnung mit einem Blick.

**Sprechweise:** Spricht nie. Dialoge zeigen Ohrenstellungen („Captain Kuschel hört aufmerksam zu.“, „Ein Ohr klappt skeptisch um.“), Dante übersetzt. Zettel im Unterschlupf nach einem Zusammenbruch um 02:00 Uhr (aus `design.md`) sind „von ihm“, in Dantes Handschrift:
- „Lieber [Name], du bist umgekippt. Dante hat dich hergetragen. Ich habe zugehört. – C. K.“
- „Zehn Prozent deiner Credits sind weg. Ich war's nicht. Ich bin ein Hase. – C. K.“

**„Tagesablauf“** (er wird getragen)

| Morgen | Tag | Abend | Nacht |
|---|---|---|---|
| `dantes-werkstatt` Kopfkissen | `dantes-werkstatt` Regal über der Werkbank | Do `dantes-werkstatt` EINS!-Tisch; Mo/Mi `wasserturm-versteck` (ausgeliehen); sonst Werkbank | `dantes-werkstatt` in Dantes Arm |

Abweichungen: In `act1` gibt Dante ihn Nyra zum Trost; bis zu Nyras Gefangennahme sitzt er nachts mit ihr auf den `daecher`. Danach liegt er im Fundbüro des `quantum-tower`-Foyers (Nebenauftrag `sq-kuschel-fundbuero`: zurückholen, Dante +100).

**Geschenke**
- Liebling: `plueschmoehre`, `samtfliege`, `nadel-und-faden`
- Gemocht: `dantes-kekse` (er „teilt“ sie mit Dante), `eins-kartendeck`, `stickerbogen`, `murmelbeutel`
- Mag nicht: `drohnen-propeller` („scharfkantig“), `instant-nudeln`
- Gehasst: `waschpulver`, `kanalschlamm`, `virus-implantat`

**Herz-Ereignisse**

| ♥ | ID | Ort · Zeit · Auslöser | Inhalt |
|---|---|---|---|
| 2 | `he-captain-kuschel-2` | `dantes-werkstatt`, Tag | Die Spielfigur vertraut Captain Kuschel etwas an (Sorge, Witz oder Plan). Dante hat „nichts gehört“. Der nächste Check des Tages erhält +1. |
| 4 | `he-captain-kuschel-4` | `wasserturm-versteck`, Mo/Mi abend | Teekränzchen der Kinder mit Kuschel als Ehrengast. Mit [Ausstrahlung 3] trinkt man stilecht mit abgespreiztem Finger. |
| 6 | `he-captain-kuschel-6` | `dantes-werkstatt`, Morgen | Kuschel ist verschwunden! Spuren führen über die Kinder zu Bolzens Nest auf den `daecher`. Dante ist überglücklich. |
| 8 | `he-captain-kuschel-8` | `rostmarkt`, Tag | Babette will ihn waschen. Mit [Ausstrahlung 5] verteidigt man seine „natürliche Patina“, sonst tauscht man ihn heimlich gegen einen Doppelgänger vom Flohmarkt. |
| 10 | `he-captain-kuschel-10` | `dantes-werkstatt`, Abend | Dante leiht ihn der Spielfigur aus (im `epilog` dauerhaft als Patenschaft): `captain-kuschel-talisman`. |

**Persönliche Quest – `pq-kuschel-ohrenflick` „Ein Ohr für alle“:** Ein Ohr reißt ein. Gebraucht werden Spezialfaden (Babette), rosa Stoff (Promenade) und eine ruhige Hand ([Technik 4] oder Freyas Hilfe). Dante kann nicht hinsehen und hält sich währenddessen eine Schallplatte vors Gesicht.

**Rivalität:** −2 `re-captain-kuschel-2`: Kuschels Porträt schaut mit schmalen Augen (Dante −20). −5 `re-captain-kuschel-5`: Die Zettel im Unterschlupf werden passiv-aggressiv („Ich höre alles. – C. K.“). −8 `re-captain-kuschel-8`: „Pech-Hase“: Beim Betreten der Werkstatt stolpert die Spielfigur jedes Mal (nur Animation und +10 Minuten). Versöhnung: `plueschmoehre` und `samtfliege` zusammen schenken.

**Begleiter:** nicht als Einheit. Ab 10 ♥ als Talisman (Zubehör): „Große Ohren“ – zu Kampfbeginn sind alle versteckten Gegner sichtbar; +1 auf Ausstrahlung-Checks, wenn das Gegenüber traurig ist.

**Romanze:** nein.

**Herkunft:** keine eigene Reaktion; Dante übersetzt, z. B. `origin-oednis`: „Er sagt, du riechst nach Abenteuer. Und nach Sand.“

**Beispiel-Checks:** [Ausstrahlung 3] Teekränzchen-Etikette · [Technik 4] das Ohr flicken.

---

## 10. Ordnung und Justiz

### 10.1 Richter — `richter`

**Kurzprofil:** Richter am Justizpalast. Schwarzes Barett, gezwirbelter Schnurrbart, schwarze taktische Robe mit Handschuhen, freundliches Lächeln. Fraktion `ordnung`. Verurteilte im Stück Hunter, Dante und Raven.

**Persönlichkeit:** Streng, pedantisch, liebt absurd genaue Zahlen. Privat ein leidenschaftlicher Gärtner und Hobbybäcker, Hauptjuror beim jährlichen Keks-Wettbewerb. Hat Zweifel, ob vier Jahre für Dante gerecht waren („die Musik war gut“).

**Sprechweise:** Urteilsformeln mit überpräzisen Maßen, dramatische Pausen.
- „Für das Betreten eines Blumenbeets: drei Stunden Unkraut. Für das Grinsen dabei: eine weitere.“
- „Das Gericht hat Hunger. Das Gericht vertagt sich.“
- „Ich kenne Ihr Gesicht. Ich kenne alle Gesichter. Das ist mein Beruf.“

**Tagesablauf:** Morgen `justizpalast` Bagatellsaal (Mi Bagatellgericht) · Tag `justizpalast` Gerichtsgarten · Abend Fr `rostmarkt` Babettes Garküche, sonst `justizpalast` · Nacht away. So tag `rostmarkt` Flohmarkt (Gartengeräte).

**Geschenke**
- Liebling: `blumensamen`, `kraeuter-gebaeck`, `stempelkissen`
- Gemocht: `gesetzbuch-papier`, `dantes-kekse`, `samenbombe`, `synth-kaffee`, `echtobst-apfel`
- Mag nicht: `volt-cola`, `chrome-10-gutschein` („Ein Bestechungsversuch?“)
- Gehasst: `raubkopie-stick`, `plastikpflanze`, `kanalschlamm`

**Herz-Ereignisse**

| ♥ | ID | Ort · Zeit · Auslöser | Inhalt |
|---|---|---|---|
| 2 | `he-richter-2` | `justizpalast` Gerichtsgarten, Tag | Gemeinsam Unkraut jäten. Er verurteilt jedes einzelne („Schuldig!“). |
| 4 | `he-richter-4` | `justizpalast`, Mi morgen | Bagatellgericht: Dexter soll einen Ziegenroboter gestohlen haben. Mit [Straße 4] als Zeuge benennt man den wahren Täter (der Ziegenroboter ist selbst weggelaufen). |
| 6 | `he-richter-6` | `rostmarkt`, Fr abend | Außer Dienst bei einer Dampfnudel gesteht er seine Zweifel an Dantes Urteil und bittet, Dante anonym eine `vinyl-schallplatte` zu bringen. |
| 8 | `he-richter-8` | `justizpalast` Gerichtsgarten, Sa tag | Keks-Wettbewerb. Die Spielfigur reicht Kekse ein (Dantes Rezept, Jakkos Variante oder gekauft); er urteilt mit Lupe. Preis je nach Platz. |
| 10 | `he-richter-10` | `justizpalast`, Tag | Ernennung zum ehrenamtlichen Gerichtsmitglied: Die Spielfigur darf kleine Streitfälle in der Stadt schlichten (wiederkehrende Mini-Aufträge). Geschenk `richterhammer-mini`. |

**Persönliche Quest – `pq-richter-goldene-gurke` „Die Goldene Gurke“:** Vor der Gartenschau verschwindet seine Preisgurke. Verdächtige: Dexter (Alibi: saß im Schuldturm), Serenity (neidische Gärtnerin), Bolzen (hat sie ausgegraben und ins Nest geschleppt). Detektivarbeit mit Spuren und Aussagen; ein falscher Verdacht kostet Punkte bei der verdächtigten Figur. Belohnung: seltene Saat, Ruf `ordnung` +15.

**Rivalität:** −2 `re-richter-2`: Bußgelder doppelt. −5 `re-richter-5`: Die Wache kontrolliert die Spielfigur täglich. −8 `re-richter-8`: Vorladung wegen „Missachtung des Gerichts“; komischer Prozess, Strafe als Geldbuße oder Sozialstunden (Neonmeile fegen, Zeitsprung). Versöhnung: nachts heimlich `blumensamen` in seinem Garten pflanzen.

**Begleiter:** nein. **Romanze:** nein.

**Herkunft:** `origin-knastvogel`: Startpunkte −100, „Wir kennen uns.“ · `origin-ex-wache`: +100. · `origin-gossenkind`: „Ihr Gesicht kenne ich aus einem Jugendverfahren.“ · `origin-oberstadt`: misstraut Privilegien. · `origin-oednis`: „Hinter der Mauer gelten unsere Gesetze nicht. Bedauerlich.“ · `origin-schrott`: bittet, den Rasensprenger zu reparieren.

**Beispiel-Checks:** [Ausstrahlung 6] eine mildere Strafe aushandeln · [Straße 4] als Zeuge den wahren Täter benennen · [Technik 4] den Rasensprenger reparieren.

---

### 10.2 Wache — `wache`

**Kurzprofil:** Wachfrau am Gefängnis Eisenkammer, die Raven entlässt. Schwarze taktische Weste über dem Kapuzenpulli, große Creolen, rotbraunes hochgestecktes Haar mit Pony, strahlendes Lächeln. Fraktion `ordnung`. In `act3` als Leihpersonal am Eingang der Releaseparty eingeteilt, im `epilog` bewacht sie Blade.

**Persönlichkeit:** Fröhlich, pflichtbewusst, gesprächig, heimlich gelangweilt. Sammelt Sticker aus allen Bezirken. Ihr Running Gag: Sie hofft, niemanden wiederzusehen, und sieht die Spielfigur ständig wieder. Sie führt darüber eine Strichliste.

**Sprechweise:** Amtsdeutsch mit Herz.
- „Ich hoffe für Sie, dass wir uns nicht wiedersehen. … Oh. Hallo.“
- „Dienst ist Dienst, und Pause ist heilig.“
- „Sie schon wieder! Ich mache einen Strich.“

**Tagesablauf:** Morgen `gefaengnis-eisenkammer` Tor; Mi `justizpalast` (Saalwache beim Bagatellgericht) · Tag `gefaengnis-eisenkammer` Besucherraum · Abend `u-bahn-knoten-sued` Kiosk (Feierabend-Snack) · Nacht away. `act3`: Party-Eingang `quantum-tower`.

**Geschenke**
- Liebling: `stickerbogen`, `snackers-riegel`, `instant-nudeln` („Pausenbrot!“)
- Gemocht: `synth-kaffee`, `bao-dampfnudel`, `neon-limo`, `comic-heft-alt`, `echtobst-apfel`
- Mag nicht: `dietrich-set` und `wurfmesser-poliert` (sie beschlagnahmt beides freundlich und gibt es nach einer Woche zurück)
- Gehasst: `raubkopie-stick`, `kanalschlamm`, `virus-implantat`

**Herz-Ereignisse**

| ♥ | ID | Ort · Zeit · Auslöser | Inhalt |
|---|---|---|---|
| 2 | `he-wache-2` | `gefaengnis-eisenkammer`, Morgen | Sie zeigt ihre Strichliste der Wiedersehen und bietet einen Kaffee aus der Thermoskanne an. |
| 4 | `he-wache-4` | `u-bahn-knoten-sued`, Abend | Ohne Weste, im Feierabend: Sie schwärmt von Collin und davon, einmal das Feuerwerk über der Oberstadt zu sehen. |
| 6 | `he-wache-6` | `gefaengnis-eisenkammer`, Tag | Ausbruchsversuch: Dexter im Wäschekorb. Die Spielfigur hilft beim Einfangen oder lenkt ab; Wache entscheidet am Ende selbst, ein Auge zuzudrücken („Er schuldet allen Geld. Draußen ist er nützlicher.“). |
| 8 | `he-wache-8` | `quantum-tower` Party-Eingang (`act3`), sonst `gefaengnis-eisenkammer` | Sie erkennt die Spielfigur trotz falschem Ausweis: `[Wache ♥8]` „Ich habe Sie nie gesehen. Wie immer.“ Abkürzung durch die Kontrolle. Nach `act3`: Sie hat den Quantum-Dienst nach der Chip-Sache gekündigt. |
| 10 | `he-wache-10` | `daecher`, Abend | Feuerwerk oder Sonnenuntergang mit der Spielfigur. Sie will Stadtführerin für die Unterstadt werden und schenkt `wachen-strichliste`. |

**Persönliche Quest – `pq-wache-feierabend` „Feierabend“:** Einmal einen freien Tag voller Abenteuer: Die Spielfigur führt sie über Rostmarkt, High Voltage, Wasserturm und Hafen, an jedem Ort ein Sticker. Zum Abschluss entscheidet sie sich für ihre Zukunft (Stadtführerin; ab dann Begleiterin).

**Rivalität:** −2 `re-wache-2`: gründliche Durchsuchungen (ein Gegenstand wird für eine Woche verwahrt). −5 `re-wache-5`: Sie meldet Kleinigkeiten an den Richter (Bußgelder). −8 `re-wache-8`: Sie nimmt die Spielfigur für eine Nacht in Gewahrsam: Zeitsprung zum nächsten Morgen in der Zelle, Gespräch mit einer Zellennachbarin, kein Verlust. Versöhnung: Sticker und Kaffee.

**Begleiter:** ja, ab 8 ♥ und nach `pq-wache-feierabend`. Rolle: Tank mit Schild.
- „Schildwall“ (1 AP): angrenzende Verbündete `geschuetzt`.
- „Vorschrift ist Vorschrift“ (2 AP): Nahangriff mit Schlagstock, Ziel `betaeubt`.
- ab 10 ♥ „Wir sehen uns nicht wieder“ (1 AP, einmal pro Kampf): Gegner mit Moral fliehen sofort.

**Romanze:** nein.

**Herkunft:** `origin-ex-wache`: Startpunkte +200, Lästern über Kantinenessen. · `origin-knastvogel`: +100, der Running Gag beginnt bei der Entlassung. · `origin-gossenkind`: „Ich behalte Sie im Auge. Freundlich.“ · übrige neutral.

**Beispiel-Checks:** [Ausstrahlung 5] die Besuchszeit verlängern lassen · [Straße 5] wissen, wann sie Pause macht · [Reflexe 5] beim Wettlauf zum Kiosk gewinnen.

---

## 11. Neue Nebenfiguren

Zehn eigene Figuren, die das Stück nicht hat, die aber die offene Welt füllen: Händler, Reisende, Musik, Haustier und Jimmy selbst. Für ihre Porträts gilt dieselbe Stilbibel wie für die Kostümfiguren (gemalter Stil, schwarzes Gurtzeug). Gesichter sind frei erfunden und dürfen keinem Ensemblemitglied ähneln.

### 11.1 Jimmy — `jimmy`

**Kurzprofil:** Der Mann, den die Spielfigur ersetzt. Ehemaliger Crew-Hacker, der sich einen Virus auf seinem Neurochip eingefangen hat und „total durchgedreht“ ist. Geflickter Kapuzenpulli, voll mit Klebezetteln, gesprungene Visierbrille auf der Stirn, eine LED an der Schläfe, die unregelmäßig blinkt. Fraktion `unterstadt`. Hunter hält ihn für „durch“, Vega nicht.

**Persönlichkeit:** Gutmütig, verwirrt, mit Blitzen des alten Genies. Spricht in Werbeslogans und Fehlermeldungen, hält sich manchmal für einen Getränkeautomaten. Tragikomisch: Er erinnert sich bruchstückhaft an die Crew und ist verletzt, dass man ihn abgeschrieben hat.

**Sprechweise:**
- „FEHLER 404: Frühstück nicht gefunden. Hast du Frühstück?“
- „Jetzt neu! Jimmy! Fast wie früher! Nur echt mit dem Zucken!“
- „Vega ist gut. Vega bringt Nudeln. Vega, Version eins-null, stabil.“

**Tagesablauf:** Morgen `u-bahn-knoten-sued` (wohnt in einem stillgelegten Fotoautomaten) · Tag `u-bahn-knoten-sued` Bahnsteig (ruft für einen Credit Werbung aus) · Abend `neonmeile` (tanzt synchron zu den Reklamen) · Nacht `u-bahn-knoten-sued`. Nach `pq-jimmy-neustart`: Tag `dantes-werkstatt` (Assistent), Abend `high-voltage`.

**Geschenke**
- Liebling: `instant-nudeln`, `katzenvideo-archiv`, `alter-neurochip` („Ersatzteile für mich!“)
- Gemocht: `neon-limo`, `snackers-riegel`, `comic-heft-alt`, `aufzieh-roboter`, `echtobst-apfel`
- Mag nicht: `faxpapier-rolle` („Druckerwarteschlange voll!“), `synth-kaffee` (er zuckt doppelt)
- Gehasst: `virus-implantat` („Nicht noch einer!“), `magnet-stoerer`, `kanalschlamm`

**Herz-Ereignisse**

| ♥ | ID | Ort · Zeit · Auslöser | Inhalt |
|---|---|---|---|
| 2 | `he-jimmy-2` | `u-bahn-knoten-sued`, Morgen | Jimmy begrüßt die Spielfigur als „Update von mir“. Peinlich, komisch, ein bisschen traurig. |
| 4 | `he-jimmy-4` | `neonmeile`, Abend | Gemeinsamer Tanz zu den Reklamen. Mittendrin eine klare Erinnerung an den Abend des Digitech-Coups aus seiner Sicht. |
| 6 | `he-jimmy-6` | `u-bahn-knoten-sued`, Nacht | Klarer Moment: Der Virus kam von einem Gratis-Chip an Xions „Freiwillige gesucht“-Stand. Hinweis für den Hauptstrang. Schaltet `pq-jimmy-neustart` frei. |
| 8 | `he-jimmy-8` | `high-voltage`, Abend (nach `pq-jimmy-neustart`) | Hunter entschuldigt sich bei Jimmy: „Ich hab dich abgeschrieben. Das war falsch.“ Der Club applaudiert, Jimmy blinkt gerührt. |
| 10 | `he-jimmy-10` | `daecher`, Nacht, mit Vega | Jimmy bedankt sich und schenkt `jimmys-glueckschip`. |

**Persönliche Quest – `pq-jimmy-neustart` „Neustart“:** Ein sauberer `alter-neurochip`, Dantes Lötarbeit, Code von Nyra (im `epilog` alternativ Alesa oder Pim) und Vegas Nudeln als „Stabilisator“ (sie besteht darauf). Am Ende die Wahl: **Vollständiger Neustart** (Jimmy wird wieder der Alte, verliert aber die Werbestimme und Erinnerungen an die schwere Zeit) oder **Patch** (er bleibt stabil, glücklich und ein wenig glitchig). Beide Wege sind gut.

**Rivalität:** −2 `re-jimmy-2`: Er ruft Werbung über die Spielfigur aus („Heute im Angebot: [Name], stark reduziert!“). −5 `re-jimmy-5`: Spamnachrichten aufs Telefon. −8 `re-jimmy-8`: Er folgt der Spielfigur und verkündet laut ihren Standort (Schleichen in der Unterstadt schwerer). Versöhnung: Instant-Nudeln und eine Stunde neben ihm sitzen (Zeitsprung).

**Begleiter:** ja, nach `pq-jimmy-neustart`. Patch-Fassung: Rolle Wildcard, Fähigkeiten wechseln in fester Reihenfolge je Runde: „Werbepause“ (alle Gegner in 3 Feldern `betaeubt`, sie schauen gebannt eine Werbung), „Pop-up“ (Ziel `markiert`, −10 Treffer), „Bluescreen“ (Jimmy setzt aus, alle Verbündeten +1 AP). Neustart-Fassung: Rolle Hacker: „Alter Code“ (Hack, `gehackt`), „Firewall-Loch“ (entfernt `geschuetzt`), „Backup“ (heilt sich um 10).

**Romanze:** nein.

**Herkunft:** Alle Herkünfte: hält die Spielfigur für „Jimmy 2.0“. `origin-ex-wache`: „Sicherheitsupdate?“ · `origin-schrott`: „Hast du einen Schraubenzieher? Bei mir ist was locker. Wörtlich.“

**Beispiel-Checks:** [Technik 6] einen klaren Moment herbeiführen · [Ausstrahlung 5] ihn überreden, zu Dante zu gehen · [Straße 4] seinen Schlafplatz finden.

---

### 11.2 Dexter — `dexter`

**Kurzprofil:** Der Mann, der Hunter „mehr schuldet“. Berufsschuldner und Lebenskünstler. Zu großer Karoanzug mit Dutzenden Taschen, Schuldscheine ins Futter genäht, Pomade, Goldzahn-Aufkleber. Fraktion `unterstadt`. Händler für „garantiert echte“ Souvenirs.

**Persönlichkeit:** Unverwüstlich optimistisch, charmant, ehrlich unehrlich. Großzügig, wenn er mal Geld hat (selten). Lebt im Dauerversteckspiel mit Aria.

**Sprechweise:**
- „Morgen, mein Freund. Morgen zahle ich alles zurück. Wahrscheinlich.“
- „Ich schulde dir kein Geld, ich schulde dir eine Geschichte. Und die ist mehr wert.“
- „Hättest du zufällig zehn Credits? Rein hypothetisch. Und praktisch.“

**Tagesablauf:** Morgen `rostmarkt` (versteckt sich hinter Ständen vor Aria) · Tag `neonmeile` (Souvenirstand) · Abend `high-voltage` (leiht sich etwas) · Nacht `kanalisation` (Schuldnerversteck). Mi/Do nach einem Bagatellurteil: `gefaengnis-eisenkammer` (Schuldturm, Besucherraum).

**Geschenke**
- Liebling: `alte-euromuenze`, `beglichener-schuldschein` (wenn es seiner ist: Ehrenurkunde), `bao-dampfnudel`
- Gemocht: `glitzerschrott`, `sonnenbrille-gold`, `chips-tuete`, `volt-cola`, `echtobst-apfel`
- Mag nicht: `kassenbuch` („Zahlen. Igitt.“), `rechenfibel`
- Gehasst: `griffband-schlaeger` (erinnert an Aria), `handschellen`, `kanalschlamm`

**Herz-Ereignisse**

| ♥ | ID | Ort · Zeit · Auslöser | Inhalt |
|---|---|---|---|
| 2 | `he-dexter-2` | `rostmarkt`, Morgen | Dexter leiht sich 10 Credits und zahlt eine Woche später mit einer `vhs-kassette` zurück. „Mit Zinsen. Kulturzinsen.“ |
| 4 | `he-dexter-4` | `neonmeile`, Abend | Ein Kunde merkt, dass das „echte Mondgestein“ ein Kiesel ist. Die Spielfigur rettet Dexter mit [Ausstrahlung 5] oder [Straße 5]. |
| 6 | `he-dexter-6` | `kanalisation`, Nacht | In seinem Versteck: ein Buch aller Gläubiger, und neben jedem Namen eine Notiz, was diese Person einmal Nettes für ihn getan hat. Schaltet `pq-dexter-schuldenfrei` frei. |
| 8 | `he-dexter-8` | `high-voltage`, Abend | Dexter zahlt Hunter alles zurück. Der Club jubelt, Hunter muss sich setzen. |
| 10 | `he-dexter-10` | `rostmarkt`, Tag | Dexter eröffnet „Dexters Leihhaus“, ein ehrliches Pfandhaus. Geschenk `dexters-schuldbuch`. |

**Persönliche Quest – `pq-dexter-schuldenfrei` „Schuldenfrei“:** Sechs Gläubiger: Hunter, Babette, Ripper, Opa Gustav, Kiki Karbon und das Gericht (Bußgelder). Die Spielfigur hilft mit Aufträgen, dem Verkauf seiner seltsamen Sammlung und dem Zurückholen verpfändeter Dinge (verknüpft mit `pq-raven-notgroschen` und `pq-dante-platte`). Eine Verbindungsquest quer durch die ganze Stadt.

**Rivalität:** −2 `re-dexter-2`: Er „leiht“ sich ungefragt 10 Credits pro Woche. −5 `re-dexter-5`: Ein Geschenkgegenstand der Spielfigur taucht an seinem Stand auf. −8 `re-dexter-8`: Er schiebt der Spielfigur eine Schuld unter; Aria kommt kassieren. Versöhnung: eine seiner Schulden begleichen.

**Begleiter:** nein (läuft bei Kämpfen weg). **Romanze:** nein.

**Herkunft:** `origin-oberstadt`: versucht, groß zu leihen. · `origin-gossenkind`: „Kollege!“ · `origin-knastvogel`: „Schuldturm? Nein? Glück gehabt.“ · übrige: Verkaufsgespräch.

**Beispiel-Checks:** [Straße 5] seinen Trick durchschauen · [Ausstrahlung 5] einen wütenden Kunden beruhigen · [Technik 4] beweisen, dass sein „Mondgestein“ ein Kiesel ist (um ihn zu necken).

---

### 11.3 Babette Bao — `babette-bao`

**Kurzprofil:** Wirtin der Garküche „Bao Babette – Dampfnudeln seit 2061“ am Rostmarkt. Rundlich, Dampfschutzbrille, Schürze mit leuchtendem Teigtaschen-Muster, Kopftuch, ein Armimplantat mit sechs Fingern zum Teigfalten. Fraktion `unterstadt`. Händlerin (Essen als Heilgegenstände).

**Persönlichkeit:** Warm, laut, neugierig, die Mutter des Marktes. Füttert die Kinder, kennt alle Neuigkeiten, ist streng mit Leuten, die anschreiben lassen. Stammt aus einer Küstenstadt, die das Meer verschluckt hat; das Grauwasser macht sie wehmütig.

**Sprechweise:**
- „Iss! Du bist ja nur noch Haut und Implantat.“
- „Ich hab's gehört, ich hab's gesehen, ich hab's weitererzählt. In der Reihenfolge.“
- „Wer bei mir anschreibt, zahlt. Wer nicht zahlt, spült.“

**Tagesablauf:** Morgen und Tag `rostmarkt` Garküche · Abend kurz `wasserturm-versteck` (Essen für die Kinder), dann `rostmarkt` · Nacht away. Mo (Ruhetag) tag `grauwasser-hafen` Fischmarkt.

**Geschenke**
- Liebling: `kaktusfrucht`, `blumensamen` (für Kräuter), `kraeuter-gebaeck`
- Gemocht: `tai-chi-tee`, `algen-chips`, `synth-kaffee`, `dantes-kekse` („Angebrannt, aber mit Liebe.“), `echtobst-apfel`
- Mag nicht: `instant-nudeln` („Eine Beleidigung!“), `snackers-riegel` („Zucker ist kein Essen.“)
- Gehasst: `plastikpflanze`, `kanalschlamm`, `virus-implantat`

**Herz-Ereignisse**

| ♥ | ID | Ort · Zeit · Auslöser | Inhalt |
|---|---|---|---|
| 2 | `he-babette-bao-2` | `rostmarkt`, Morgen | Probeessen. Danach gibt es jeden Montag ein Gratisfrühstück (Heilgegenstand). |
| 4 | `he-babette-bao-4` | `wasserturm-versteck`, Abend | Gemeinsam Essen zu den Kindern bringen. Babette wünscht ihnen ein echtes Zuhause. Beitrag zu `pq-wasserturm-dach`. |
| 6 | `he-babette-bao-6` | `grauwasser-hafen`, Mo tag | Am Fischmarkt erzählt sie von ihrer versunkenen Heimatstadt. |
| 8 | `he-babette-bao-8` | `rostmarkt`, Abend nach Ladenschluss | Sie verrät ihr geheimes Rezept: `bao-dampfnudel` wird für die Spielfigur herstellbar. |
| 10 | `he-babette-bao-10` | `rostmarkt`, Abend | Familienessen für den ganzen Markt, die Spielfigur sitzt am Kopfende. Geschenk `babettes-kochloeffel`. |

**Persönliche Quest – `pq-babette-markttag` „Der große Markttag“:** Babette will ein Fest für den Rostmarkt: Musik (Lio), Lichterketten (Dante), Ordnung (Aria oder die Wache), Sponsoren (Sybella), Berichterstattung (Collin). Danach findet der Markttag jeden vierten Sonntag statt, mit Sonderhändlern und Minispielen.

**Rivalität:** −2 `re-babette-bao-2`: kleine Portionen. −5 `re-babette-bao-5`: Hausverbot in der Garküche. −8 `re-babette-bao-8`: Gerüchtekrieg, alle Unterstadt-Figuren einmalig −20. Versöhnung: `pq-babette-abwasch` (drei Stunden Abwasch, Zeitsprung).

**Begleiter:** nein. **Romanze:** nein.

**Herkunft:** `origin-gossenkind`: „Dich hab ich doch als Knirps gefüttert!“ (+100) · `origin-oednis`: tauscht Kaktusrezepte. · `origin-oberstadt`: „Endlich jemand, der richtig zahlen kann.“ · übrige: „Iss erst mal was.“

**Beispiel-Checks:** [Straße 4] ihr ein frisches Gerücht verkaufen · [Ausstrahlung 4] ein zweites Stück Kuchen erbitten · [Körper 5] den schweren Dampftopf tragen.

---

### 11.4 Opa Gustav — `opa-gustav`

**Kurzprofil:** Besitzer des Schrottplatzes. Kleiner alter Mann in einem riesigen Mechanikermantel, Brille mit vielen Linsen, weißer Bart mit Kupferdraht geflochten, ein Bein aus einem Autostoßdämpfer. Fraktion `unterstadt`. Händler für Teile und Werkbank (Herstellung).

**Persönlichkeit:** Grummelig, weise, erinnert sich an Noxius vor 2050 („Früher gab's hier Bäume“). Sammelt alles. Einsam, seit seine Frau Elsa vor zwanzig Jahren mit den Aussiedlern in die Ödnis gezogen ist, um Gärten anzulegen.

**Sprechweise:**
- „Früher gab's hier Bäume. Und Vögel. Und keine Werbung, die mit dir redet.“
- „Das ist kein Schrott. Das ist Zukunft, die noch nicht weiß, dass man sie braucht.“
- „Kaufen oder gucken? Gucken kostet auch, aber weniger.“

**Tagesablauf:** Morgen `schrottplatz` (Kran) · Tag `schrottplatz` (Handel) · Abend `schrottplatz` Wohnwagen mit Radio; Fr `high-voltage` (Oldie-Stunde) · Nacht away. So tag `rostmarkt` Flohmarkt.

**Geschenke**
- Liebling: `rostige-schraube`, `alte-euromuenze`, `oelkaennchen`
- Gemocht: `glitzerschrott`, `vinyl-schallplatte`, `quietsche-mutter`, `synth-kaffee`, `echtobst-apfel`
- Mag nicht: `seltenes-implantat` („Neumodischer Kram.“), `datenkristall`
- Gehasst: `plastikpflanze` („Ich hab echte gesehen!“), `kanalschlamm`, `virus-implantat`

**Herz-Ereignisse**

| ♥ | ID | Ort · Zeit · Auslöser | Inhalt |
|---|---|---|---|
| 2 | `he-opa-gustav-2` | `schrottplatz`, Morgen | Kranfahrt mit Blick über die Stadt: Bezirke auf der Stadtkarte werden aufgedeckt. |
| 4 | `he-opa-gustav-4` | `schrottplatz` Wohnwagen, Abend | Alte Fotos vom grünen Noxius. Er schenkt ein `kuestenkarte-fragment` (für `pq-nyra-salzluft`). |
| 6 | `he-opa-gustav-6` | `schrottplatz`, Tag | Er überlässt der Spielfigur seine Werkbank: Herstellung aus Schrott freigeschaltet. |
| 8 | `he-opa-gustav-8` | `high-voltage`, Fr abend | Oldie-Stunde. Er tanzt mit Babette und erzählt danach von Elsa. Schaltet `pq-gustav-alte-liebe` frei. |
| 10 | `he-opa-gustav-10` | `schrottplatz`, Tag | Er ernennt die Spielfigur zur Erbin der „Schrottkrone“: `schrottkrone`. |

**Persönliche Quest – `pq-gustav-alte-liebe` „Alte Liebe rostet nicht“:** Die Spielfigur bringt Briefe ins `aussiedler-camp`, wo Marla Elsa kennt. Elsa schreibt zurück. Am Ende fährt Gustav (mit Kiki im Taxi, falls `pq-kiki-reichweite` erledigt, sonst zu Fuß mit der Spielfigur) ins Camp, oder Elsa kommt zur Oldie-Stunde. Danach ist Gustav sonntags abwechselnd im Camp.

**Rivalität:** −2 `re-opa-gustav-2`: höhere Preise. −5 `re-opa-gustav-5`: Sein rostiger Wachroboter „Knurri“ jagt die Spielfigur vom Platz (kein Schaden, nur Flucht). −8 `re-opa-gustav-8`: Er verkauft benötigte Questteile an Ripper. Versöhnung: `oelkaennchen` schenken und einer halbstündigen Geschichte zuhören (Zeitsprung).

**Begleiter:** nein. **Romanze:** nein.

**Herkunft:** `origin-schrott`: Startpunkte +200, „Mein bester Lehrling!“ · `origin-oednis`: fragt nach Elsa. · `origin-oberstadt`: „Hab ich deinem Großvater nicht mal einen Kühlschrank verkauft?“ · übrige: misstrauisch-freundlich.

**Beispiel-Checks:** [Technik 5] aus drei Schrottteilen etwas Brauchbares erkennen · [Körper 6] den Motorblock heben · [Ausstrahlung 4] ihn zum Erzählen bringen.

---

### 11.5 Kiki Karbon — `kiki-karbon`

**Kurzprofil:** Schwebetaxifahrerin. Violette Bomberjacke mit Schachbrett-Taxiband, runder Blasenhelm mit Antenne, pinke Zöpfe, Rollschuhe, Kaugummiblasen. Fraktion `unterstadt`. Erwachsen (Mitte zwanzig).

**Funktion:** Ergänzt die U-Bahn-Schnellreise. Kikis Taxi fährt gegen Credits zu Orten ohne Station (`digitech-ruine`, später `oednis-rand` und `aussiedler-camp`).

**Persönlichkeit:** Schnell, fröhlich, klatschsüchtig, fährt riskant, kennt jeden. Liebt Tempo und Lios Musik. Möchte einmal hinter die Mauer fahren.

**Sprechweise:**
- „Anschnallen! Oder festhalten. Oder beides und hoffen.“
- „Zehn Credits bis zur Promenade, zwölf, wenn ich die Ampeln beachten soll.“
- „Hast du's schon gehört? Natürlich nicht, du warst ja nicht in meinem Taxi.“

**Tagesablauf:** Morgen `u-bahn-knoten-sued` Taxistand · Tag Mo/Mi/Fr `oberstadt-promenade`, Di/Do `rostmarkt`, Sa/So `neonmeile` · Abend `neonmeile` Taxistand · Nacht `high-voltage` Vorplatz.

**Geschenke**
- Liebling: `taxi-duftbaum`, `ersatz-rotor`, `lio-demo-chip`
- Gemocht: `volt-cola`, `sonnenbrille-gold`, `stickerbogen`, `neon-limo`, `echtobst-apfel`
- Mag nicht: `tai-chi-tee` („Zu langsam.“), `gesetzbuch-papier` („Da steht nur Verkehrsrecht drin.“)
- Gehasst: `kanalschlamm` („Nicht auf meine Sitze!“), `magnet-stoerer`, `virus-implantat`

**Herz-Ereignisse**

| ♥ | ID | Ort · Zeit · Auslöser | Inhalt |
|---|---|---|---|
| 2 | `he-kiki-karbon-2` | `neonmeile`, Abend | Gratisfahrt mit Klatsch: Ein Gerüchte-Marker erscheint auf der Karte. |
| 4 | `he-kiki-karbon-4` | `neonmeile`, Abend | Wettfahrt gegen eine Quantum-Lieferdrohne; die Spielfigur ist Co-Pilotin mit [Reflexe 5]. Kein Unfall, viel Geschrei. |
| 6 | `he-kiki-karbon-6` | `high-voltage` Vorplatz, Nacht | Kiki gesteht, dass sie zum Meer fahren will, aber das Taxi die Reichweite nicht hat. Schaltet `pq-kiki-reichweite` frei. |
| 8 | `he-kiki-karbon-8` | `schrottplatz`, Tag | Erste Probefahrt mit verbesserter Reichweite bis zum `oednis-rand`. Romanzefassung: Sie lässt die Spielfigur unter dem Mond steuern. |
| 10 | `he-kiki-karbon-10` | `oednis-rand` bei Sonnenuntergang (im `epilog` `kueste`) | Kiki schenkt `kikis-taxikarte` (Gratisfahrten). Romanzefassung: Händchen haltend auf der Motorhaube, Sterne zählen. |

**Persönliche Quest – `pq-kiki-reichweite` „Reichweite“:** Ersatz-Hubrotor (Gustav), Hochleistungsakku (Quantum-Restposten über Ripper, Xion oder Sybella), Ödnis-Karte (Marla), Probefahrt mit einem Sandsturm-Ausweichmanöver ([Reflexe 6] oder Marlas Windkunde). Danach fährt das Taxi in die Ödnis.

**Rivalität:** −2 `re-kiki-karbon-2`: doppelter Fahrpreis. −5 `re-kiki-karbon-5`: Sie fährt die Spielfigur nicht mehr. −8 `re-kiki-karbon-8`: Fahrgastwarnung an alle Taxis, dazu Klatsch (Ruf `unterstadt` −10). Versöhnung: `taxi-duftbaum` und ein großes Trinkgeld.

**Begleiter:** nein (sie fährt). **Romanze:** romanzierbar (Kennzeichen), erwachsen.

**Herkunft:** `origin-oednis`: „Gibt's da draußen Straßen? Oder nur Gegend?“ · `origin-oberstadt`: „VIP-Tarif!“ · `origin-ex-wache`: „Ich fahr immer korrekt. Meistens.“ · übrige: Klatsch zur Begrüßung.

**Beispiel-Checks:** [Reflexe 5] Co-Pilot bei der Wettfahrt · [Technik 5] den Rotor einstellen · [Straße 5] die schnellste Schleichroute kennen.

---

### 11.6 Marla Sand — `marla-sand`

**Kurzprofil:** Aussiedlerin aus der Ödnis, Händlerin der Karawane. Sandfarbener Poncho, breitkrempiger Hut mit kleinem Solarpaneel, Schutzbrille, wettergegerbte Haut, silberner Zopf, Wanderstab mit Wassersucher. Fraktion `aussiedler`. Erwachsen (Mitte vierzig).

**Persönlichkeit:** Ruhig, wortkarg, trocken witzig, praktisch. Misstraut der Stadt, aber nicht ihren Menschen. Hat das Meer einmal gesehen und kennt den Weg.

**Sprechweise:**
- „In der Stadt redet jeder. Draußen hört man zu. Meistens dem Wind.“
- „Wasser ist kein Geschäft. Wasser ist ein Versprechen.“
- „Das Meer? Gibt's. Hab's gesehen. Hat mir die Stiefel nass gemacht.“

**Tagesablauf:** Mo–Fr und So `aussiedler-camp` (Morgen Brunnen, Tag Handelszelt, Abend Lagerfeuer, Nacht away) · Sa Morgen und Tag `rostmarkt` (Karawanenstand), Abend `high-voltage` (trinkt Wasser, beobachtet), Nacht `oednis-rand` (Rückweg).

**Geschenke**
- Liebling: `wasserfilter`, `samenbombe`, `treibholz`
- Gemocht: `wuestenrose`, `blumensamen`, `zeitung-papier`, `synth-kaffee`, `echtobst-apfel`
- Mag nicht: `edelbrause-gold` („Wasser mit Glitzer. Verschwendung.“), `parfuem-ozon`
- Gehasst: `plastikpflanze`, `kanalschlamm`, `virus-implantat`

**Herz-Ereignisse**

| ♥ | ID | Ort · Zeit · Auslöser | Inhalt |
|---|---|---|---|
| 2 | `he-marla-sand-2` | `aussiedler-camp`, Morgen | Brunnenwartung; mit [Körper 4] oder [Technik 4] hilft man mit. |
| 4 | `he-marla-sand-4` | `aussiedler-camp` Lagerfeuer, Abend | Marla erzählt von ihrer Reise zum Meer und gibt ein `kuestenkarte-fragment`. |
| 6 | `he-marla-sand-6` | `oednis-rand`, Sa nacht | Sandsturm. Gemeinsam im Unterstand bringt sie der Spielfigur bei, den Wind zu lesen (keine Sandsturm-Begegnungen mehr in der Ödnis). |
| 8 | `he-marla-sand-8` | `oednis-rand`, Tag | Geleitschutz für die Karawane gegen die comichaften Staubkrähen (Banditen, die vor allem Wasser klauen). Romanzefassung: Nachtwache auf dem Wagendach unter Sternen. |
| 10 | `he-marla-sand-10` | `aussiedler-camp`, Morgen | Die Spielfigur wird „Freund der Karawane“ und erhält `marlas-wasserstab`. Romanzefassung: Sonnenaufgang über den Dünen, Hand in Hand. |

**Persönliche Quest – `pq-marla-brunnen` „Der tiefe Brunnen“:** Der Campbrunnen versiegt. Gebraucht werden ein Tiefenbohrer (Gustav), ein Filter (Alesa über `pq-alesa-zentrator` oder Dante), Geld (Seraphina oder Hunter) und eine geologische Karte aus dem Archiv der `digitech-ruine`. Danach wächst das Camp, neue Händler kommen.

**Rivalität:** −2 `re-marla-sand-2`: Stadtpreise. −5 `re-marla-sand-5`: Die Karawane kommt eine Woche nicht zum Rostmarkt. −8 `re-marla-sand-8`: Hausverbot im Camp (Hinweis: `pq-nyra-salzluft` bleibt über die anderen drei Fragmente plus einen Ersatzweg über Käpt'n Nebelhorns Logbuch lösbar). Versöhnung: drei `wasserkanister` bringen.

**Begleiter:** ja, ab 6 ♥. Rolle: Kontrolle und Überleben.
- „Sandschleier“ (2 AP): 2 × 2 Felder halbe Deckung für Verbündete, Gegner darin −20 Treffer.
- „Wasser teilen“ (1 AP): heilt 6 LP und entfernt `brennt`.
- ab 8 ♥ „Windkundig“ (passiv): Party +1 Bewegung in Ödnis- und Küsten-Arenen.

**Romanze:** romanzierbar (Kennzeichen), erwachsen.

**Herkunft:** `origin-oednis`: Startpunkte +200, kennt die Familie der Spielfigur. · `origin-oberstadt`: „Ihr habt das Wasser. Wir haben den Durst.“ · `origin-schrott`: bittet um Hilfe am Wasserfilter. · übrige: abwartend.

**Beispiel-Checks:** [Körper 5] den Brunnenkübel ziehen · [Straße 5] erkennen, dass ein Stadthändler sie betrügt · [Ausstrahlung 6] sie zu einem Besuch in der Clubnacht überreden.

---

### 11.7 Lio Funkel — `lio-funkel`

**Kurzprofil:** Straßenmusiker an der U-Bahn mit einem umgebauten Synth-Akkordeon voller Leuchttasten. Geflickter langer Mantel mit Notendruck, Zylinder mit Neonband, runde Spiegelbrille, fingerlose Handschuhe, Sommersprossen. Fraktion `unterstadt`. Erwachsen (Mitte zwanzig).

**Persönlichkeit:** Verträumt, freundlich, beobachtet alles und macht Lieder daraus, auch über die Taten der Spielfigur. Will ein Album aufnehmen.

**Funktion:** Lios Lieder spiegeln den Fortschritt: Je nach erledigten Nebenquests und Rivalitäten singt er neue Strophen (aus Flags zusammengesetzt), Passanten summen sie nach.

**Sprechweise:**
- „Noch ein Credit, dann sing ich dein Lied. Zwei, und ich sing's in Dur.“
- „Die Stadt hat einen Takt. Hör mal: Zisch, Klonk, Werbung, Zisch.“
- „Ich schreib grad was über dich. Keine Sorge, du kommst gut weg. Größtenteils.“

**Tagesablauf:** Morgen away (Langschläfer) · Tag `u-bahn-knoten-sued` Musikerecke · Abend `rostmarkt`; Di `high-voltage` (Karaoke) · Nacht Sa `high-voltage` Bühne, sonst `daecher` (komponiert).

**Geschenke**
- Liebling: `akkordeon-balg`, `vinyl-schallplatte`, `haiku-buechlein`
- Gemocht: `meeres-postkarte`, `synth-kaffee`, `neon-limo`, `comic-heft-alt`, `echtobst-apfel`
- Mag nicht: `raubkopie-stick` („Musiker wollen auch essen.“), `volt-cola`
- Gehasst: `magnet-stoerer`, `kanalschlamm`, `virus-implantat`

**Herz-Ereignisse**

| ♥ | ID | Ort · Zeit · Auslöser | Inhalt |
|---|---|---|---|
| 2 | `he-lio-funkel-2` | `u-bahn-knoten-sued`, Tag | Lio spielt ein Lied über die letzte Tat der Spielfigur (Text aus Flags). |
| 4 | `he-lio-funkel-4` | `rostmarkt`, Abend | Saiten gerissen; mit [Technik 3] repariert oder neu gekauft. Geschenk `lio-demo-chip`. |
| 6 | `he-lio-funkel-6` | `daecher`, Nacht | Gemeinsam ein Lied schreiben; die Spielfigur wählt drei Zeilen. Es wird ein Stadthit, den Passanten pfeifen. |
| 8 | `he-lio-funkel-8` | `high-voltage`, Sa nacht | Erster großer Auftritt, Lampenfieber. [Ausstrahlung 6] oder ein Dreizeiler des Barkeepers hilft. Romanzefassung: Er widmet der Spielfigur ein Lied. |
| 10 | `he-lio-funkel-10` | `sender-kanal-noxius`, Abend (im `epilog` `kueste`) | Albumveröffentlichung. Geschenk `lio-album`. Romanzefassung: Tanz auf dem leeren Bahnsteig nach der letzten Bahn, Hand in Hand. |

**Persönliche Quest – `pq-lio-album` „Ein Album für die Unterstadt“:** Sechs Klangaufnahmen an sechs Orten: Gustavs Kran, Babettes brutzelnde Pfanne, Dantes Faxgerät, das Lachen der Kinder, Käpt'n Nebelhorns Horn, der Bass der Clubnacht. Aufnahme mit dem Mikro des Kameramanns, Ausstrahlung bei Collin.

**Rivalität:** −2 `re-lio-funkel-2`: eine Spottstrophe. −5 `re-lio-funkel-5`: Die Spottstrophe wird ein Hit, Passanten singen sie (Ruf `unterstadt` −10). −8 `re-lio-funkel-8`: Er spielt sie live bei Collin. Versöhnung: `pq-lio-neue-strophe` – ihm Stoff für ein besseres Lied liefern.

**Begleiter:** ja, ab 6 ♥. Rolle: Unterstützer.
- „Mutmacher-Melodie“ (1 AP): alle Verbündeten +10 Treffer für 2 Runden.
- „Dissonanz“ (2 AP): Gegner in 3 Feldern `betaeubt` für 1 Runde, Abklingzeit 3 Runden.
- ab 8 ♥ „Zugabe!“ (passiv): Ein Verbündeter, der einen Gegner besiegt, erhält sofort +1 AP.

**Romanze:** romanzierbar (Kennzeichen), erwachsen.

**Herkunft:** Er begrüßt jede Herkunft mit einer Reimzeile, etwa `origin-knastvogel`: „Die Tür ging auf, der Himmel weit – willkommen in der Neonzeit!“

**Beispiel-Checks:** [Ausstrahlung 6] ihm Mut machen · [Technik 3] die Saiten wechseln · [Straße 4] den besten Spielplatz mit dem meisten Publikum finden.

---

### 11.8 Pim Pinzette — `pim-pinzette`

**Kurzprofil:** Junger Laborassistent bei Quantum, einer von Alesas Forschern. Zu großer Laborkittel, zu viele Stifte, dicke runde Schutzbrille, eine kleine Pinzette als Kettenanhänger, eine nervös blinkende LED am Kragen. Fraktion `quantum`, später keine.

**Persönlichkeit:** Schüchtern, ehrlich, hat ein schlechtes Gewissen wegen der Versuche. Liebt winzige Dinge und baut Roboterinsekten. Ein Whistleblower, der sich noch nicht traut.

**Sprechweise:** Stockend, mit „Fußnoten“.
- „Das ist… äh… nicht erlaubt. Glaube ich. Fußnote: ziemlich sicher.“
- „Ich hab aufgeschrieben, was im Labor passiert. In Schönschrift.“
- „Bitte leise. Die Wände haben Mikrofone. Wirklich. Modell QX-3.“

**Tagesablauf:** `act1`–`act3`: Morgen `u-bahn-knoten-sued` (pendelt) · Tag `quantum-tower` Labor · Abend `rostmarkt` Elektronikstand (Kleinteile) · Nacht away. `epilog`: Tag und Abend `digitech-ruine` (Labor „Nullpunkt“ mit Alesa).

**Geschenke**
- Liebling: `pinzetten-set`, `alter-neurochip`, `aufzieh-roboter`
- Gemocht: `datenkristall`, `logik-raetsel-modul`, `tai-chi-tee`, `comic-heft-alt`, `echtobst-apfel`
- Mag nicht: `volt-cola` („Ich zittere schon genug.“), `haarspray-extrahalt`
- Gehasst: `peilsender`, `magnet-stoerer`, `kanalschlamm`

**Herz-Ereignisse**

| ♥ | ID | Ort · Zeit · Auslöser | Inhalt |
|---|---|---|---|
| 2 | `he-pim-pinzette-2` | `u-bahn-knoten-sued`, Morgen | Pim lässt eine Kiste Mikroteile fallen; mit [Reflexe 3] fängt man die Hälfte. |
| 4 | `he-pim-pinzette-4` | `rostmarkt`, Abend | Er zeigt sein Roboterinsekt und gibt zu, dass er hasst, was im Labor passiert. |
| 6 | `he-pim-pinzette-6` | `rostmarkt`, Abend | Er steckt der Spielfigur eine Kopie seiner Labornotizen zu (Hinweise auf Chip-Koma-Probanden; erleichtert `pq-delya-quelle`). Schaltet `pq-pim-kleine-schrift` frei. |
| 8 | `he-pim-pinzette-8` | `justizpalast`, Tag (`epilog`) | Pim sagt neben Alesa aus. Die Spielfigur sitzt in der ersten Reihe und hält den Daumen hoch. |
| 10 | `he-pim-pinzette-10` | `digitech-ruine`, Abend (`epilog`) | Mitgründer von „Nullpunkt“. Geschenk `pims-mikrokaefer`. |

**Persönliche Quest – `pq-pim-kleine-schrift` „Kleine Schrift, große Wirkung“:** Pim will Beweise aus dem Labor schmuggeln, hat aber Angst. Nächtlicher Einbruch ins Quantum-Labor (Schleichen, Hacks oder Xions Passierschein), Übergabe an Delya oder Hunter. Ändert nicht den Ausgang des Hauptstrangs, aber: weniger Wachen auf der Party und eine eigene Nachrichtenmeldung.

**Rivalität:** −2 `re-pim-pinzette-2`: Er weicht aus. −5 `re-pim-pinzette-5`: Aus Angst meldet er die Spielfigur an Xion. −8 `re-pim-pinzette-8`: Er verriegelt nachts die Labortüren (Schleichwege schwerer). Versöhnung: `pinzetten-set` und das Versprechen, ihn zu schützen.

**Begleiter:** nein. **Romanze:** nein.

**Herkunft:** `origin-ex-wache`: verängstigt (Gespräche +10 statt +20 bis 2 Herzen). · `origin-schrott`: Seelenverwandtschaft (+50). · `origin-oberstadt`: hält die Spielfigur für ein Vorstandsmitglied und verbeugt sich.

**Beispiel-Checks:** [Ausstrahlung 5] ihm Mut machen · [Technik 6] sein Roboterinsekt verbessern · [Reflexe 3] die fallende Kiste auffangen.

---

### 11.9 Bolzen — `bolzen`

**Kurzprofil:** Streunender Roboterhund. Rostrot, ein Ohr ist eine Antenne, der Schwanz eine Sprungfeder, ein blau blinkendes Auge, quietscht beim Laufen. Wird in `pq-vega-dachgeist` gefunden und kann adoptiert werden.

**Persönlichkeit:** Verspielt, diebisch, treu. Liebt alles, was glänzt oder quietscht, und wälzt sich mit Begeisterung in Kanalschlamm.

**Sprechweise:** „Fiep!“, „Wuff-Piep!“, ein blinkendes Auge und eine Laune-Anzeige über dem Kopf.

**Tagesablauf:** Vor der Adoption: Morgen `daecher` (Nest) · Tag `rostmarkt` (bettelt bei Babette) · Abend `schrottplatz` · Nacht `daecher`. Nach der Adoption: Morgen und Nacht `unterschlupf`, tags folgt er der Spielfigur als Haustier (zählt nicht als Begleiter) oder wohnt beim `wasserturm-versteck` bzw. `schrottplatz`, je nach Entscheidung.

**Geschenke**
- Liebling: `quietsche-mutter`, `oelkaennchen`, `kanalschlamm` (!)
- Gemocht: `rostige-schraube`, `glitzerschrott`, `murmelbeutel`, `alte-euromuenze`
- Mag nicht: `waschpulver`, `tai-chi-tee`
- Gehasst: `magnet-stoerer`, `virus-implantat`, `feuerloescher-mini` (zischt)

**Herz-Ereignisse**

| ♥ | ID | Ort · Zeit · Auslöser | Inhalt |
|---|---|---|---|
| 2 | `he-bolzen-2` | `unterschlupf`, Morgen | Bolzen bringt ein „Geschenk“ (ein zufälliger glänzender Fund). Ab jetzt jeden Morgen. |
| 4 | `he-bolzen-4` | `daecher`, Tag | Apportieren mit der `quietsche-mutter` über drei Dächer. |
| 6 | `he-bolzen-6` | `daecher`, Morgen | Verknüpft mit `he-captain-kuschel-6`: Bolzen bringt Captain Kuschel stolz zurück. |
| 8 | `he-bolzen-8` | `digitech-ruine`, Tag | Bolzen gräbt eine alte Digitech-Kiste aus (`seltenes-implantat`). |
| 10 | `he-bolzen-10` | `unterschlupf`, Abend | Neue Lackierung und Hundemarke `bolzens-marke`; ab jetzt findet Bolzen täglich einen versteckten Gegenstand auf der aktuellen Karte. |

**Persönliche Quest – `pq-bolzen-bein` „Ein Bein für Bolzen“:** Sein Hinterbein hinkt. Ein Servomotor von Gustav, eingebaut von Dante oder Pim, Probelauf über die Dächer.

**Rivalität:** −2: Er versteckt sich. −5: Er klaut Kleinkram aus dem Unterschlupf. −8: Er zieht zu den Kindern. Versöhnung: `quietsche-mutter`.

**Begleiter:** Haustier außerhalb der Party. Im Kampf passiv „Schnüffeln“: Ein Gefahrenfeld der Arena wird zu Beginn markiert. **Romanze:** nein.

**Herkunft:** `origin-schrott`: Startpunkte +100 („Fiep!“ – er riecht das Öl).

**Beispiel-Checks:** [Technik 4] sein Bein provisorisch richten · [Reflexe 4] ihn einfangen.

---

### 11.10 Käpt'n Nebelhorn — `kaeptn-nebelhorn`

**Kurzprofil:** Alter Fährkapitän am Grauwasser-Hafen. Riesiger gelber Regenmantel, Kapitänsmütze mit LED-Anker, Vollbart voller Nebeltropfen, ein Messing-Nebelhorn an der Brust, ein Kunstauge in Form eines Kompasses. Fraktion `unterstadt`.

**Persönlichkeit:** Grummelig, erzählt Seemannsgarn vom offenen Meer. Wahrheit: Er hat die Bucht nie verlassen und fürchtet das offene Wasser. Sonntags Angelfreund von Hunter.

**Sprechweise:**
- „Ahoi, Landratte. Und das ist noch nett gemeint.“
- „Wellen hab ich gesehen, so hoch wie der Quantum-Tower! Gut, wie der Kiosk. Aber nasse!“
- „Wenn das Horn tutet, hält die Stadt die Luft an. Oder sie schimpft.“

**Tagesablauf:** Morgen `grauwasser-hafen` Steg (tutet den Tag an) · Tag `grauwasser-hafen` Fähre (Angeln, Algen) · Abend Mi/Fr `high-voltage` (Seemannsgarn an der Bar), sonst `grauwasser-hafen` · Nacht `grauwasser-hafen` Kajüte. So tag mit Hunter am Steg.

**Geschenke**
- Liebling: `treibholz`, `muschel-frisch`, `algen-chips`
- Gemocht: `fossile-muschel`, `meeres-postkarte`, `synth-kaffee`, `comic-heft-alt`, `echtobst-apfel`
- Mag nicht: `sonnencreme-lsf100` („Ich bin wetterfest!“), `sandflasche` („Sand gehört nicht in Flaschen.“)
- Gehasst: `plastikpflanze`, `kanalschlamm`, `virus-implantat`

**Herz-Ereignisse**

| ♥ | ID | Ort · Zeit · Auslöser | Inhalt |
|---|---|---|---|
| 2 | `he-kaeptn-nebelhorn-2` | `grauwasser-hafen`, Morgen | Die Spielfigur darf das Nebelhorn blasen. Collin kommentiert es am nächsten Morgen im Radio. |
| 4 | `he-kaeptn-nebelhorn-4` | `grauwasser-hafen`, Tag | Angeln. Eine Flaschenpost enthält ein `kuestenkarte-fragment`. |
| 6 | `he-kaeptn-nebelhorn-6` | `grauwasser-hafen`, So tag, mit Hunter | Beide geben zu, nie das offene Meer gesehen zu haben, und schließen einen Pakt, gemeinsam hinzufahren. |
| 8 | `he-kaeptn-nebelhorn-8` | `grauwasser-hafen` Kajüte, Nacht | Geständnis: Alle Geschichten stammen aus dem Logbuch seiner Großmutter. Geschenk `logbuch-oma` (Ersatzweg für die Küstenroute, Markierung einer Insel in der Bucht). |
| 10 | `he-kaeptn-nebelhorn-10` | `kueste`, Abend (`epilog`) | Er sieht zum ersten Mal das Meer, Tränen im Bart. Geschenk `nebelhorn-mini`. |

**Persönliche Quest – `pq-nebelhorn-letzte-faehre` „Die letzte Fähre“:** Die alte Fähre wieder flottmachen (Teile von Gustav, Motor von Dante, Treibstoff über Kiki), mit der Spielfigur und einem Begleiter zur Bojeninsel übersetzen und den alten Leuchtturm wieder anzünden. Ab dann leuchtet nachts ein Licht über dem Grauwasser (Umgebungsänderung auf mehreren Karten).

**Rivalität:** −2 `re-kaeptn-nebelhorn-2`: kein Angeln mehr. −5 `re-kaeptn-nebelhorn-5`: Er tutet jedes Mal, wenn die Spielfigur vorbeigeht (weckt Figuren in der Nähe, die dann grummeln). −8 `re-kaeptn-nebelhorn-8`: Stegverbot. Versöhnung: `treibholz` bringen.

**Begleiter:** nein. **Romanze:** nein.

**Herkunft:** `origin-oednis`: „Wüstenmensch am Wasser! Vorsicht, das ist nass.“ · `origin-gossenkind`: „Du hast doch früher Steine nach meinen Möwen geworfen!“ · übrige: Seemannsgarn zur Begrüßung.

**Beispiel-Checks:** [Körper 5] die Fähre vom Steg stoßen · [Ausstrahlung 5] ihm die Wahrheit entlocken · [Technik 6] den Leuchtturm reparieren.

---

## 12. Begleiter-Übersicht und Duo-Techniken

### 12.1 Übersicht

Party: Spielfigur plus bis zu zwei Begleiter (`design.md`). Fähigkeit 3 jeweils ab der genannten Herzstufe.

| Figur | Verfügbar | Rolle | Fähigkeiten |
|---|---|---|---|
| `vega` | ab `act1` | Fernkampf | Adlerauge · Schockschuss · Rückendeckung (6 ♥) |
| `aria` | ab `act1` | Tank, Nahkampf | Zerberster-Schlag · Komm doch her! · Unkaputtbar (6 ♥) |
| `nyra` | `act1`, `act2` bis Gefangennahme, ab Ende `act3` | Hacken, Kontrolle | Silent Angel · Firewall · Drohnen-Umleitung (6 ♥) |
| `hunter` | ab `act2` | Anführer, Unterstützung | Schmiere stehen · Lagebesprechung · Wer zahlt, schafft an (6 ♥) |
| `raven` | ab `act2` | Nahkampf, Flanke | Klingenwirbel · Aus dem Schatten · Nie wieder gefesselt (6 ♥) |
| `dante` | ab `act2` | Heilung, Hacken | Feldreparatur · Kurzschluss · Snackers-Pause (6 ♥) |
| `ripper` | ab 6 ♥, 30 Credits/Tag | Schmutzige Tricks | Ausschlachten · Rauchbombe · Kleiner Deal (8 ♥) |
| `barkeeper` | ab 8 ♥ (nicht Fr/Sa nacht) | Nahkampf, Konter | Mondschnitt · Stille Wacht · Letzter Vers (10 ♥) |
| `wache` | ab 8 ♥ und `pq-wache-feierabend` | Tank, Schild | Schildwall · Vorschrift ist Vorschrift · Wir sehen uns nicht wieder (10 ♥) |
| `jimmy` | nach `pq-jimmy-neustart` | Wildcard oder Hacken | je nach Ausgang (siehe 11.1) |
| `marla-sand` | ab 6 ♥ | Kontrolle, Überleben | Sandschleier · Wasser teilen · Windkundig (8 ♥) |
| `lio-funkel` | ab 6 ♥ | Unterstützung | Mutmacher-Melodie · Dissonanz · Zugabe! (8 ♥) |
| `alesa-zero` | `epilog`, ab 6 ♥ | Gadgets | Prototyp werfen · Kalibrieren · Schwarmstörer (8 ♥) |
| `xion-venom` | `epilog`, nach `pq-xion-umschulung`, ab 6 ♥ | Kontrolle, Nahkampf | Krallengriff · Sicherheitsprotokoll · Kenn ich, war ich (8 ♥) |

Nicht im Kampf: Kinder (nie), Captain Kuschel (Talisman), Bolzen (Haustier), KI Nexus (Cyberware), Kameramann (Gadget), alle übrigen.

### 12.2 Duo-Techniken

Freigeschaltet, wenn beide Figuren in der Party sind und beide mindestens 6 ♥ zur Spielfigur haben (bei Paaren mit Spielfigur: 10 ♥). Kosten: je 1 AP beider Beteiligten, einmal pro Kampf.

| Duo | Name | Wirkung |
|---|---|---|
| Dante + Raven (nur wenn Paar-Strang `geholfen`) | „Am Ende siegt die Liebe“ | Dante macht eine peinliche Liebeserklärung; alle Gegner in 3 Feldern sind verwirrt (`betaeubt` 1 Runde), Raven greift kostenlos an. |
| Vega + Aria | „Rückendeckung, Schwester“ | Aria spottet, Vega schießt eine Runde lang auf jeden Gegner, der Aria angreift. |
| Hunter + Raven | „Wie in alten Zeiten“ | Beide und die Spielfigur erhalten in der nächsten Runde +1 AP. |
| Dante + Nyra | „Meister und Fan“ | Doppelhack: Ziel 2 Runden `gehackt`; Drohnen wechseln die Seite. |
| Barkeeper + Lio | „Vers und Melodie“ | Alle Verbündeten heilen 5 LP und erhalten +10 Treffer für 2 Runden. |
| Jimmy (Patch) + Vega | „Version eins-null, stabil“ | Jimmys Fähigkeitsreihenfolge ist in dieser Runde frei wählbar. |
| Marla + Nyra | „Salzluft“ | In Ödnis- und Küsten-Arenen: Party +1 Bewegung und 5 LP Heilung. |
| Aria + Xion (`epilog`, nach Entschuldigung) | „Alte Rechnung“ | Beide wetteifern: +50 % Schaden für ihren nächsten Angriff, wer mehr Schaden macht, gibt mit. |
| Spielfigur + beliebiger Begleiter mit 10 ♥ | „Vertrauen“ | Der Begleiter erhält einen zusätzlichen Zug direkt nach der Spielfigur. |

---

## 13. Beziehungsnetz zwischen den Figuren

### 13.1 Der Paar-Strang Dante und Raven

Im Stück finden Dante und Raven am Meer zueinander. Im Spiel gibt es einen Zustand `paar-dante-raven` mit den Werten `offen` (Start), `geholfen`, `gestoert`, `eifersucht-dante`, `eifersucht-raven`.

- **Respektieren (`geholfen`):** Nach `he-raven-6` und `he-dante-6` startet `pq-wingman-sonnenuntergang` „Der richtige Moment“ (beide mindestens 8 ♥): Dante probt sein Geständnis vor Captain Kuschel, Raven lässt „zufällig“ Hinweise fallen, die Spielfigur organisiert Ort und Zeit (`daecher` bei Sonnenuntergang oder im `epilog` die `kueste`) und rettet die Kekse vor dem Keksalarm (Zeitminispiel). Ergebnis: die Date-Szene aus dem Stück mit der Spielfigur als heimlicher Zeugin hinter einem Wassertank, beide +100, Duo-Technik „Am Ende siegt die Liebe“.
- **Eigene Romanze (nur mit Romanze-Schalter):** Wer Dante oder Raven romantisch näherkommt, setzt `eifersucht-raven` bzw. `eifersucht-dante`. Beides bleibt komisch und jugendfrei: Raven fordert die Spielfigur zu einem besonders harten Training heraus und stichelt; Dante legt traurige Platten auf und backt „Kummerkekse“. Ab 8 ♥ bei der eifersüchtigen Figur kommt die Versöhnung („Pass gut auf ihn auf. Er verbrennt Kekse.“ bzw. „Sie hasst Warten. Lass sie nie warten.“). Im `epilog` erhält die verschmähte Figur einen eigenen schönen Abschluss (Raven trainiert die Kinder in Selbstverteidigung; Dante bekommt mit Collin eine Radiosendung „Die Analog-Stunde“). Beide gleichzeitig zu romanzieren ist nicht möglich.
- **Stören (`gestoert`):** Gerüchte streuen oder Treffen sabotieren gibt beiden −100. Der Kanon ist aber zäh: Im `epilog` finden die beiden trotzdem zueinander, nur ohne die Spielfigur als Zeugin („Manche Dinge passieren trotzdem.“).

### 13.2 Gegenseitige Reaktionen

| Wenn … | dann … |
|---|---|
| die Spielfigur Ripper hilft, die Kinder um Credits zu prellen | Daria, Freya, Jakko je −100, Babette −50, Hunter −50 („Man begleicht seine Schulden.“) |
| die Spielfigur Ripper zum Zahlen bringt | Kinder je +50, Hunter +30, Ripper −30 |
| Collin oder Delya die Spielfigur mit Blade an der Promenade zeigen | Raven und Hunter je −50, abwendbar mit [Ausstrahlung 5] „Ich spioniere ihn aus.“ |
| die Spielfigur vor dem `epilog` mit Xion befreundet ist (ab 4 ♥) | Aria −30 bei jedem weiteren Herz-Ereignis mit Xion |
| eine Chrome-Schwester ihre persönliche Quest abschließt | die anderen beiden +20 und je ein neidischer Kommentar |
| Vega bei 6 ♥ ist | Jimmy-Gespräche geben +30 statt +20 |
| Freyas Kindergericht stattgefunden hat | Richter +50 |
| `pq-gustav-alte-liebe` abgeschlossen ist | Marla +100, Babette +50 (sie hat mitgefiebert) |
| Hunter und Käpt'n Nebelhorn beide 6 ♥ haben | Sonntagsangeln zu dritt möglich (täglicher Bonus +20 bei beiden) |
| die Wache 4 ♥ hat | sie taucht Di abend bei Collins Karaoke auf und singt |
| `pq-serenity-happy-end` mit Lios Text gelöst wird | Lio +50, Serenity schickt ihm Fanpost |
| Alesa im `epilog` ehrlich aussagt | Pim +100, Dante +30 (er bekommt eine Assistentin für Sozialstunden) |
| Babette ein Gerücht über die Spielfigur weiß (bei Rivalität mit Babette) | alle Unterstadt-Figuren einmalig −20 |

### 13.3 Abspann-Sätze

Jede Figur hat im Abspann einen Satz, der vom Herzstand abhängt (Stufen: Rivalität, 0–3, 4–7, 8–10). Beispiele:

- Hunter, 8–10: „Der Strandclub ‚Ebbe & Flut‘ öffnet jeden Sommer. Hunter steht hinter der Theke und erzählt jedem, wer ihm das Grundstück gezeigt hat.“
- Ripper, Rivalität: „Ripper verkauft immer noch Müll. Aber er verkauft ihn nicht mehr an dich.“
- Captain Kuschel, 8–10: „Captain Kuschel hört weiterhin zu. Er hat nie etwas weitererzählt. Fast nie.“

---

## 14. Offene Punkte zur Abstimmung

1. **Zonen-IDs** in Abschnitt 3.1 sind Arbeitsnamen und müssen an die Zonenliste in `world.md` angeglichen werden (Umbenennung per Suchen und Ersetzen, die Figurendaten verwenden nur diese IDs).
2. **Flag `epilog`:** `design.md` kennt nur `act1`–`act3`. Vorschlag: ein Nachspiel-Flag nach dem Finale, damit Blade im Gefängnis, KI im Faxgerät und die Küste als freie Zone abbildbar sind.
3. **Romanze-Freigabe:** Kennzeichen `romanceable` vorgeschlagen für `hunter`, `raven`, `dante`, `collin-charleston`, `delya-delloraine`, `alesa-zero` (nur `epilog`), `kiki-karbon`, `marla-sand`, `lio-funkel`. `ROMANCE_ENABLED` bleibt leer, bis der Nutzer die Liste ausdrücklich freigibt.
4. **Neue Spielfunktionen**, die Figuren freischalten und in `design.md` ergänzt werden müssten: Botendienst (Daria), Fotomodus (Kameramann), Taxi zu Orten ohne Station (Kiki), Werkbank (Gustav), Haustier (Bolzen), Schlichtungsaufträge (Richter), Markttag (Babette).
5. **Geschenklisten** nutzen vier Stufen (`loves`, `likes`, `dislikes`, `hates`) wie in `NpcDef`. Bedingte Umschaltungen (Hunter und Snackers, KI und Liebesromane, Serenity und Wüstenrose) brauchen ein optionales Feld `giftOverrides` mit Bedingung.
6. **Startpunkte durch Herkunft** brauchen ein Feld `startRelations` an der Herkunft in `content/origins.ts`.
7. **Söldnerkosten** (Ripper) und **Wochentags-Events** (Karaoke, EINS!-Abend, Clubnacht, Flohmarkt, Bagatellgericht, Markttag) sind Vorschläge; Zahlen nach erstem Spieltest anpassen.
8. **Alter der Figuren:** Die Einstufung „jung besetzt, nur Freundschaft“ für Vega, Aria und Nyra ist bewusst vorsichtig. Wenn das Ensemble anders entscheidet, ist nur das Kennzeichen zu ändern.
9. **Neue Gesichter:** Die zehn neuen Nebenfiguren brauchen eigene Porträts im Kostümstil. Prompts müssen ausdrücklich ausschließen, dass Gesichter aus den Referenzbildern übernommen werden.
