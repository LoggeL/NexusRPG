# Lücken: Welt-Systeme Akt 1 (game/src/content/parts/world/)

## Bezirke und Stationen

- **Doppelte Stationen (Absicht):** `parts/world/bezirke-fraktionen.ts` definiert alle sechs Akt-1-Stationen noch einmal, weil `cityPos` zum gemalten Bild `assets/ui/city-map.webp` passen muss (Metro-Knoten, Blitz-Schild, Kai, Rohr-Station, Treppe, Glasdach). Die Zonen-Dateien (`maps/neon-gasse.ts`, `bahnhof-mitte.ts`, `hafenkante.ts`, `rohrsiedlung.ts`, `stufenplatz.ts`, `glasarkaden.ts`) haben die Planwerte aus `act1.json`. `world/` sortiert hinter `maps/` und gewinnt; das erzeugt sechs PART_WARNINGS „überschreibt“. **Integration:** `stations` aus den Zonen-Dateien entfernen (oder dort die neuen cityPos eintragen) und `design/plan/act1.json` nachziehen:
  `station-bahnhof-mitte [0.417, 0.45]`, `station-neon-gasse [0.285, 0.49]`, `station-hafenkante [0.72, 0.5]`, `station-rohrbogen [0.455, 0.665]`, `station-stufenplatz [0.4, 0.33]`, `station-glasarkaden [0.55, 0.22]`.
- **Ödnis-Bezirk** (`oednis`) angelegt; die übrigen fünf Bezirke kommen aus den Zonen-Paketen (keine Doppelung).
- **`station-chrome-allee`** (Ausweis, Akt 2) fehlt: Der Lint verlangt eine existierende Karte samt Einstieg. Mit `chrome-boulevard` anlegen, Vorschlag `cityPos [0.62, 0.12]` (Boulevard rechts neben dem Ring-Turm auf der Stadtkarte).
- **Gesperrte Stationen auf der Stadtkarte:** Die Karte zeigt nur Stationen, die es als StationDef gibt. Für „Gesperrt (sichtbar)“ (world.md §11.1) wäre ein Feld `StationDef.teaser?: true` hilfreich, das die Station als „?“ zeigt, ohne dass ihre Karte existieren muss.

## Wetter (world.md §3.4, §10.7)

- Die Engine kennt kein Wetter (`GameState.seed` erwähnt es nur). Bis dahin läuft eine **feste Wetterlage im 28-Tage-Zyklus** über `cycleDay` (`parts/world/_w.ts`: `WETTER_SMOG` 2/9/16/23, `WETTER_NEONSCHAUER` 3/10/17/24, `WETTER_ROSTREGEN` 5/12/19/26, `WETTER_KLAR` 1/8/15/22). Wetterberichte (`news-wetter-*`) und Crew-Chat-Nachrichten nutzen sie.
- **Vorschlag:** `ClockState.weather: 'klar' | 'smog' | 'rostregen' | 'neonnebel' | …` je Tag aus dem Startwert gewürfelt, Bedingung `{ weather }`, Effekte im Kampf (Sicht −1, Nass) und bei Passanten. Dann die Konstanten in `_w.ts` durch `{ weather: … }` ersetzen.
- Neonschauer „Neon-Tags leuchten“ ist nur Text; eine Hervorhebung der `neon-tag-*`-Hotspots bräuchte `{ weather: 'neonnebel' }` in der Darstellung.

## Tages- und Zyklus-Flags

- Es gibt keine Flags, die sich täglich oder je 28-Tage-Zyklus zurücksetzen. Folge: Festbelohnungen (Neonnacht, Schrottparade, Abendjournal) hängen an `once`-Wahlen und gibt es nur beim **ersten** Fest; danach sind die Szenen Stimmung. Das Turnier hat einen Wiederholungsweg mit kleinem Preis und kostet 20 Cr + 60 Minuten.
- Ebenso werden Telefonnachrichten mit `auto` nur **einmal im Spiel** zugestellt (Festankündigungen, Wetter-Chat).
- **Vorschlag:** Flag-Präfixe `heute_` (Reset beim Tageswechsel) und `zyklus_` (Reset an Zyklustag 1), oder `DialogueChoice.oncePer?: 'day' | 'cycle'`. Dasselbe brauchen `aria_heute` (parts/vexaria) und Wett-Willis 50-Cr-Grenze.

## Feste (world.md §3.4)

- **Neonnacht** (Zyklustag 7, Sonntag): Hotspot `welt-neonnacht` in der Gassenmitte, Dialog mit Oma Volt (Leuchtfarbe = +1 Ausstrahlung-Buff, Menge anheizen `[Ausstrahlung 5]`, Tanz-Minispiel, Aria-Szene für Vex mit Romanze). **Fehlt:** „Unterstadt leuchtet“ (Lichter mit Bedingung – `LightDef` kennt nur `slots`, Vorschlag `LightDef.when?: Condition`), „doppelte Trinkgelder“ bei `akt-barschicht` (Vorschlag: Minispiel-Belohnung mit Multiplikator oder zweite Barschicht-Variante im High-Voltage-Paket mit `when: { cycleDay: 7 }`).
- **Stadtmeisterschaft Eins!** (Tag 14): Hotspot `welt-eins-stadtmeisterschaft` am Stammtisch im High Voltage, `akt-eins` Stufe 4 bzw. 5 (Titelverteidigung).
- **Gründertag** (Tag 21): vom Stufenplatz-Paket gebaut (Buffet, Passanten); hier nur Nachrichten.
- **Schrottparade** (Tag 28): Hotspot `welt-schrottparade` in der Marktmitte, Dialog mit Opa Gustav, drei Lösungswege mit und ohne Check.
- **Meerestag** (`epilog`): fehlt mit der Küste/dem Meer.
- Passanten-Sprüche zu Festen können nur die Kartenbesitzer setzen (`AmbientDef.barks` ist über `mapAdditions` nicht erweiterbar). **Vorschlag:** `MapAddition.barks`.

## Stadtereignisse (world.md §10.6)

- **Abendjournal live** (täglich 19–20 Uhr, Stufenplatz): Hotspot `welt-abendjournal` + Dialog; Aussagen der Spielfigur schalten eigene Kurzmeldungen frei (`news-passant-*` über Flags `tv_passant_*`). Delya und Kameramann stehen dort nicht als Figuren, weil ihre Tagesabläufe den Figuren-Agenten gehören – **Vorschlag an Figuren-Agenten:** `kameramann` und `delya-delloraine` täglich 19:00–20:00 an Spot `kamerakran` bzw. `buehne` des Stufenplatzes.
- **U-Bahn-Ereignisse** (20 % pro Fahrt: Lio, Kontrolle, Abzieher, Oma Volt, Datenwürfel, Panne) und **Schwarzfahren**: Die Stationsreise hat keinen Ereignis-Haken. **Vorschlag:** `StationDef.events?: { id, chance, when?, dialogue?|battle?|effects? }[]` oder global `content.travelEvents`, ausgewürfelt in der Kampagne bei `travel` mit U-Bahn.
- **Rennnacht** (Mi/Sa, `rennhalle-9`): folgt mit der Rennhalle; Plakatsäule erwähnt „verschoben“.
- **Stromausfall, Razzia, Chrome-10-Verteilung, Sandsturm, Sonnenfest:** Akt 2+/Epilog. Nachrichten für Akt-2/3-Start sind angelegt (`news-act2-start`, `news-act3-start`, `news-rost-act2/3`), die Ereignisse selbst nicht.

## Nachrichten (world.md §10.5)

- Angelegt: Prolog, `act1`-Start, `main-1-probezeit`, `main-1-dexter`, `side-alte-gewohnheiten`, `act2`, `act3`, Radio Rost zu allen Akt-1-Stufen, vier Blade-Spots fürs Stadt-TV, Kurzmeldungen, Wetter, Wochen- und Festmeldungen, 17 Nebenquest-Meldungen. `main-1-raven` und `main-1-der-plan` liegen bei quest-main-b.
- **Fehlt:** `main-2-countdown` (Countdown in Tagen bis zur Party – braucht die Akt-2-Quest und eine Zahl im Text, Vorschlag Platzhalter `{countdown}` in NewsDef-Zeilen) und **Ende 1/2/3** (End-Flags existieren noch nicht).
- **Radio Rost vs. NX-1:** Die Engine zeigt überall dieselbe Hauptmeldung (`campaign.currentNews()` ohne Filter). `NewsFilter.anchors` existiert, wird aber nicht genutzt. **Vorschlag:** `HotspotDef.channel?: 'nx1' | 'radio-rost' | 'stadt-tv'` → Filter auf Anker (`collin-charleston`/`delya-delloraine`, `opa-funk`, `blade`).
- **`opa-funk`** ist hier als schlanke NpcDef (nur Name/Porträt, ohne Laufblatt) angelegt, damit Radio Rost einen Sprechernamen hat. Der Figuren-Agent für Akt 2 (`funkturm-ruine`) übernimmt die Figur und löscht den Eintrag in `parts/world/nachrichten.ts`.

## Telefon

- Schlanke Absender ohne Kartenfigur: `crew-chat` (Gruppenchat, Porträt hunter), `werbung` (Porträt fehlt → Platzhalter), `quantum-werbung` (Porträt blade), `unbekannte-nummer` (Porträt ki-nexus, ab `act2`). Sie tauchen nicht in der Beziehungsansicht auf, solange niemand ihnen Herzpunkte gibt.
- Gruppenchat-Verläufe stehen als eine Nachricht, Sprecher getrennt durch „ – “ („Hunter: … – Aria: …“), weil `.bubble` Zeilenumbrüche zusammenzieht. **Vorschlag Darstellung:** `white-space: pre-line` für `.bubble` und Chat-Verläufe als `lines: { from, text }[]` in `PhoneMessageDef`.
- Bild `portrait-werbung` fehlt (kleines Megafon-Symbol im Kartenstil reicht).

## Crew-Quartier-Ausbau (world.md §3.7)

- Stufen 0–3 baut `parts/maps/crew-quartier.ts` (Flags `quartier_stufe_1..3`, Dialog `cq-ausbau`). Von hier: Telefon-Hinweise von Captain Kuschel, sobald eine Stufe bezahlbar ist, und Crew-Chat-Reaktionen (`parts/world/quartier.ts`).
- **Stufen 4–6** (Gästecouch +10 Herzpunkte am Morgen, Dachgarten mit `akt-gaertnern`, Aussicht mit Captain-Kuschel-Besuch sonntags) folgen ab Akt 2. Die Gästecouch braucht einen Morgen-Haken (Begleiter, die übernachtet haben → `relation +10`), Vorschlag: `MapDef.onWake?: { when, effects }[]`.
- „Crew-Quartier Stufe 6 gratis“ bei `crew-hunter` Verehrt: als Wahl im Ausbau-Dialog mit `requires: { repTier: 'crew-hunter', min: 'verehrt' }`, sobald Stufe 6 existiert.

## Fraktionen

- Alle zwölf Fraktionen aus §10.1 sind angelegt. Die Grundinhalt-Fraktion `unterstadt` wird überschrieben (eine PART_WARNING, verschwindet mit dem Testinhalt); `crew` aus dem Testinhalt heißt kanonisch `crew-hunter`.
- „Verehrt“-Belohnungen (Rabatte, Unikate, Gratis-Einbau, Ehrenrohr) und Fraktions-Angriffe bei „Verhasst“ sind nicht über Daten abbildbar, solange `FactionDef` nur Name und Beschreibung hat. **Vorschlag:** `FactionDef.tiers?: Partial<Record<RepTierId, { effects?: Effect[]; message?: string }>>`, einmalig beim Erreichen der Stufe.
