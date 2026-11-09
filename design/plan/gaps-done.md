# Engine-Lücken: umgesetzt und bewusst offen (Stand 09.11., nach den Inhaltsagenten)

Grundlage: alle Notizen unter `design/plan/gaps/*.md`. Reihenfolge nach Wirkung auf ein gut spielbares Akt 1, Vex × Aria zuerst.
Typprüfung grün, Architekturgrenzen eingehalten. vitest: dieselben 24 Fehlschläge wie vorher (alles Integration:
fehlende fremde IDs, Herkünfte, Begehbarkeit von Karten), keine neuen.

## Umgesetzt

### 1. Tageswechsel, Tages-/Wochenflags (vexaria, world, system, minigames, maps-*, npc-unterstadt …)
- **Flag-Präfixe:** `heute_*` fällt an jedem neuen Morgen, `woche_*` montags, `zyklus_*` an Zyklustag 1
  (`modules/campaign/domains/clock.ts` `startNewDayIn`, aufgerufen von Schlaf und Zusammenbruch).
- **Tageswechsel-Regeln:** `GameContent.daily: Record<id, { when?, effects }>` (neuer Teil-Schlüssel `daily` in
  `content/part.ts`). Läuft nach Schlaf/Zusammenbruch, `when` sieht schon den neuen Tag. Der Lint prüft Bedingungen und Effekte.
- **Hotspot `daily: true`:** einmal pro Spieltag, danach bis zum Morgen ausgeblendet (Flag `heute_hs_<karte>_<hotspot>`,
  Helfer `dailyHotspotFlag`).
- Inhalt umgestellt:
  - `vexaria/system.ts`: 19 Karten × 6 onEnter-Auslöser ersetzt durch 5 Tageswechsel-Regeln (`aria_heute`, `aria_warte2 → 1 → frei`,
    Wochenflags montags, Rippers Rate). Es geht kein Zähltag mehr verloren.
  - `side-eingehendes-fax`: `fax_heute` → `heute_fax`, die beiden Rücksetz-Auslöser sind weg.
  - Neon-Gasse `muelltonne` täglich statt einmal, Crew-Quartier „Morgenplatte“ einmal pro Morgen,
    Taubenpost ein Brief pro Tag, Fundbüro- und Fotoautomat-Minispiel einmal Lohn pro Tag.

### 2. Herz-Ereignisse und onEnter auch ohne Kartenwechsel (vexaria, npc-crew-a)
- `presentation/director.ts`: Wechselt auf derselben Karte die Tageszeit oder der Tag (Laufen, Warten im Dialog, Schlafen),
  laufen die onEnter-Auslöser und ein fälliges Herz-Ereignis erneut. `he-hunter-2` um Mitternacht im Club,
  Arias Nacht-Stationen usw. starten jetzt, ohne dass man raus und wieder rein muss.

### 3. Duo-Aktionen und bedingte Begleiter-Fähigkeiten (combat, vexaria, npc-crew-a/b)
- `CompanionDef.duo?: { ability, when?, holder?: 'player' | 'companion' }[]`, ausgewertet in `partyFromCampaign`
  (nur solange die Figur in der Party ist).
- `CompanionDef.abilityRules?: { when, add?, replace?: [alt, neu], remove? }[]`.
- `CompanionDef.callMinutesWhen?: { when, minutes }[]`.
- Inhalt:
  - **Aria:** Express-Zustellung (Vex, ♥6, nicht im Streit/Krach; bei der Spielfigur) und Rückendeckung (nach Station 12, bei Aria).
    Dazu Rücken an Rücken (zusammen + `kabelbrand-pass`), Wachhunde mit Vega, Abrissbirne mit Jimmy.
    Im Streit fällt „Unkaputtbar“ weg, bei `aria_arm_gesperrt` der Zerberster.
    Anfahrt 15 Minuten nur „zusammen“ oder mit `funk-kanal-neun`, sonst 30.
  - **Andere Begleiter:** Hunter bekommt „Innere Mitte“ nach `side-thai-chi`. Raven bekommt Handschellen-Trick+ nach
    `pers-raven-handschellen`, Vega Kobra-Schuss+ nach `pers-vega-adlerauge`. Jimmy hat mit `jimmy_status_patch`
    „Chipfieber“, Vega + Nyra haben „Funkstille“.

### 4. Flirt ab ♥6 (npc-crew-a, npc-unterstadt, npc-medien-club, npc-ordnung-markt)
- Bedingung `{ romanceEnabled: npc }` (Schalter + `romanceable` + kein Kind, Herzen egal).
- Flirt-Wahlen von Hunter, Dante, Raven, Lio, Collin, Kiki und Marla: `FLIRT = romanceEnabled + ♥6`.
  Kuss, Nacht und Paar-Zeilen bleiben an `{ romance }` (♥8).

### 5. U-Bahn vom Zugang aus (maps-neon-gasse, -hafenkante, -rohrsiedlung, -glasarkaden, -bahnhof-mitte, stufenplatz)
- Effekt `{ cityMap: true }` → Anfrage `cityMap` → `Director.cityMapFlow()` öffnet die Stadtkarte mitten im Ablauf.
- Alle sechs `ubahn-zugang`-Hotspots öffnen jetzt die Stadtkarte (Neon-Gasse von `look` auf `use`).

### 6. Zufallsbegegnungen (combat, maps-hafenkante, maps-kanal-sammler)
- `modules/combat/randomEncounters.ts` `rollRandomEncounter`: höchstens eine je Kartenbesuch.
  - Die Chancen aus `EncounterDef.random` werden summiert. Der Wurf ist fest je Spielstand, Karte, Tag und Uhrzeit, Neuladen würfelt also nicht neu.
  - `when` und Tageszeit werden beachtet. Begegnungen, die die Karte schon als feste Gruppe zeigt, zählen nicht (Hafenkante, Neon-Gasse).
- `ExploreScene` stellt die Gruppe sichtbar und umgehbar auf einen Spot, mindestens 260 px von der Spielfigur und allen Einstiegen.
  Laufblatt: Gegner-`sprite` bzw. `<gegner>-walk`. Nach dem ersten Kontakt ist die Gruppe für diesen Besuch weg (Sieg, Flucht oder Niederlage).

### 7. Fahndung als Effekt (combat, quest-main-b, quest-side-a/c, npc-welt)
- Effekt `{ wanted: ±n }` (Stufe 0–3 auf den Flags `fahndung_1…3`, Meldung „Fahndung 2 (+1)“). Die Bedingung bleibt `{ flag: 'fahndung_n' }` = „≥ n“.
- Inhalt: Pfeffer-Kampf (`prep-zugangskarte` weg-kampf) und Oma Volts Feuerwerk (`prep-ablenkung` gekauft) +1.
  Keksalarm und Penthouse-Drohnen +1, Dr. Winkel −1.

### 8. Kleinere Verträge
- **„Mindestens k von n“:** `{ atLeast: Condition[], min }`. Die kombinatorischen Helfer `mindestens()` (npc-crew-b, quest-side-a)
  und `atLeast()` (quest-side-c) nutzen sie jetzt; vorher bis zu 70 Zweige. Lint und Bonus-Einordnung gehen in `atLeast` hinein.
- **Präfix-Zähler:** `{ itemsOf: 'jimmy-spur-', min, distinct? }` für Sammelreihen (Glückssterne, Datenwürfel, Neon-Tags).
- **Check-Bonus bis Tagesende:** `CheckBuff.forDays` (0 = heute). Alle „Beschwingt“-Puffer (Aria ×2, Hunter, Dante, Lio, Collin)
  gelten jetzt bis Mitternacht für jeden Ausstrahlung-Check (`consumes: false`).
- **Quest-Marker per Spot-Name:** `QuestStepDef.marker.at: Point | string`, aufgelöst in `modules/quests`. Der Lint meldet unbekannte Spots.
- **Telefon:** `.bubble` mit `white-space: pre-line`; Gruppenchats dürfen Zeilenumbrüche nutzen.

## Bewusst offen (mit Grund)

| Lücke | Warum offen | Nächster Schritt |
| --- | --- | --- |
| Wetter (`ClockState.weather`, `{ weather }`) | Der Inhalt hat einen festen 28-Tage-Wetterzyklus über `cycleDay` (`parts/world/_w.ts`), der in Akt 1 trägt | Wetter je Tag würfeln, `_w.ts`-Konstanten durch `{ weather }` ersetzen |
| Auftragsziele (`jobTargetEffects` unverdrahtet, `{ jobTarget }`) | Der Inhalt hat je Ziel eigene Hotspots; Verdrahten würde Ziele doppeln | Engine-Ziele anzeigen und die `pj-*`-Ersatz-Hotspots in einem Zug entfernen |
| Kampf: Zustände (nass, geblendet …), Mehrfachstatus, Beschwören, Passive, Rückstoß, Diebstahl, Aufgeben | Größerer Umbau der Kampfregeln; der Inhalt nutzt die nächstbesten Zustände | eigener Kampf-Durchgang |
| Express-Zustellung in voller Wirkung (Homerun 3 Felder, Hechtsprung, Betäubt bei Aufprall) | braucht Rückstoß/Bewegung durch Fähigkeiten | mit dem Kampf-Durchgang |
| Rückendeckung als echtes Passiv (Treffer abfangen) | `AbilityDef.passive` fehlt | dto. |
| Spielfigur als andere Figur (Prolog als Raven), `setClock`, HUD-Uhr im Prolog | Prolog funktioniert erzählt; kleiner Gewinn | `PlayerState.standIn` |
| Herz-Deckel Akt 1 (899) in `relations.ts` | Der Inhalt sperrt ♥8/♥10-Ereignisse per `{ act: 2 }`; Vex × Aria braucht ♥8 in Akt 1 | Deckel je Figur, falls nötig |
| Geschenk-Sonderreaktionen (`GiftPrefs.special`), Inventar-Passive (`ItemDef.passive`), Händlerrabatte (`ShopDef.discounts`) | Wirkung nur über Text/Dialog-Ersatz; kein Blocker | Ladenrabatt zuerst (Ripper, Dexter, Hunter-Brille) |
| Haustier-Platz (Bolzen), Söldnerlohn pro Tag, Einsatzgrenzen (Barkeeper, Nyra) | Begleiter funktionieren; Regeln stehen im Text | `CompanionDef.pet`, `dailyFee` (jetzt leicht über `daily`-Regeln baubar) |
| Aussichtspunkte „Karte aufdecken“, Kiki-Klatschkarte, Gustavs Kranblick | keine Zonenkarte mit Nebel vorhanden | mit einer Zonenkarte |
| U-Bahn-Ereignisse, Fahrkartenpflicht, Schwebetaxi als System | Taxi läuft als Dialog; U-Bahn ohne Preis | `StationDef.events` bzw. `content.travelEvents` |
| Festnahme (`arrest`), `creditsPercent` | Fahndung ist jetzt ein Effekt; Festnahme lohnt erst mit Streifen-Kontakt | Effekt `arrest` → Zellentrakt |
| Lichter mit Bedingung, `MapAddition.barks`, `musicMuffled` nach Tageszeit, `blockVariants`, `ExitDef.effects/checkOr` | Kosmetik bzw. Notlösungen vorhanden | einzeln nach Bedarf |
| Galerie liest `player`/`romanceOnly` aus `cut.json` noch nicht | Abblende-Szenen stehen auf `gallery: false` | Galerie-Code |
| Quest-Marker in `quest-main-a/b` auf Spot-Namen umstellen | Die Engine kann es jetzt; die Inhalte zeigen noch auf Koordinaten bzw. nur auf die Karte | je Schritt den Spot eintragen |
| Tagesgespräche würfeln (`{ dayMod }`), `DialogueDef.extend`, `next`-Verzweiger | Pools nach `cycleDay`/Wochentag funktionieren | bei Bedarf |

## Akt 2/3 (Stand 09.11., nach den Inhaltsagenten Akt 2/3 und Enden)

Grundlage: die neuen Notizen unter `design/plan/gaps/` (quest-main-2/3, quest-enden, quest-side-23-*, npc-*-akt23,
maps-23, combat-23, world-23, vexaria). Typprüfung grün. vitest 1013/1014: offen ist nur der Zusammenführungs-Test
(doppelte IDs aus der Integration, siehe unten), keine Engine-Ursache.

### Umgesetzt
1. **Finale ohne Zusammenbruch:** `QuestDef.noCollapse`. Solange eine solche Quest aktiv ist, bleibt die Uhr vor 03:00
   stehen (`clockHeld`, `advanceClockIn` klemmt). Gesetzt auf main-2-bruch, main-3-einlass/-labor/-gedankenkontrolle/
   -nexus/-blade und main-epilog.
2. **Kampf-Folgen am Effekt:** `{ battle, win?, lose?, flee?, stay? }` (`BattleFollowUp`) und `EncounterDef.stayOnLose`.
   `stay` = Niederlage ohne Heimreise ins Crew-Quartier („Niederlage – du rappelst dich wieder auf.“), danach läuft
   der Folgedialog vor Ort. `stay: true` gilt für alle Kämpfe in main-3 sowie für main-2-bruch und main-2-kanal.
   `win` ersetzt Ersatz-Flags: Konvoi Nougat setzt `skn_durch`, Marlas he-8 gibt `hofhonig`.
3. **Startzustände im Kampf:** `EncounterDef.startStatus: { when?, target: party|enemies|player|<Gegner>, status, rounds }[]`.
   - Chip genommen ohne Crew-Halt (`chip_gesteuert`): Spielfigur im Turm 2 Runden betäubt.
   - Sybellas Stromschnitt (neues Flag `kern_stromschnitt`): alle Kern-Gegner 1 Runde betäubt.
   - Chip-Blocker im Gepäck: Kontroll-Knoten 2 Runden gehackt.
4. **Begleiter nicht verfügbar:** `CompanionDef.unavailableWhen/unavailableText`. Die Figur fällt beim Abgleich aus der
   Party (`crewSettle` in `SETTLE_HOOKS`), fehlt in `partyFromCampaign` und im Party-Wechsel.
   - Aria ist gechippt bis zum Countdown oder zur Rettung.
   - Nyra wurde zurückgelassen, bis die Freundschaft voll ist.
5. **Begleiter wachsen mit:** `CompanionDef.statsByLevel` (Werte je Mindeststufe). Ohne Tabelle gilt ab Stufe 5 eine
   sanfte Skalierung (+6 % LP je Stufe, +1 Schaden je 3 Stufen). Hunter, Raven und Dante tragen die Tabellenwerte für
   Stufe 6 und 9.
6. **Händlerpreise nach Lage:** `ShopDef.priceRules: { when, discount?, refuse? }[]`.
   - Chrome & Co: Seraphina ♥6 bzw. `seraphina_rabatt` −10 %, `sybella_aufschlag` +20 %, Boykott sperrt den Laden mit Text.
   - Volt-Eck: −5 % mit `oma_volt_rabatt_5`.
   - Die doppelten `lux()`-Einträge sind entfernt.
7. **Bedingte Darstellung:**
   - `CutsceneBeat.when`, `LightDef.when` (OP-Lichter im Pumpwerk nur bei aktivem Kanal), `AmbientDef.when`.
   - `MapDef.musicWhen`: Campus und Foyer schleichen im Bruch, Releaseparty in der Partynacht. Das Labor schleicht,
     Blades Büro spielt im Master-Modus ki-nexus, im Himmelsgarten läuft in der Partynacht die Releaseparty.
   - `MapDef.blockVariants` (zusätzliche Lauf-/Sperrflächen nach Bedingung).
8. **Passantensprüche je Akt:** `MapAddition.barks` hängt Sprüche an fremde Karten. Neu: `world-23/barks-23.ts` mit
   Unterstadt- und Mittelring-Sprüchen für Akt 2, Fahndung, Akt 3, Freiheit und Master-Modus.
9. **Kleinere Verträge:**
   - `ExitDef.effects` (Zustand und Meldungen beim Durchgang).
   - `DialogueChoice.daily` (einmal pro Tag, `heute_wahl_<hash>`).
   - `NpcDef.heartsFrozen` (keine positiven Herzen, solange die Bedingung gilt).
   - Rettungsziel mit `name`/`sprite` (main-2-kanal: „Proband 47“).
   - `ActStart.minutes` (Startuhrzeit des Akts).
10. **Inhalt repariert:**
    - Routenpunkte Himmelsgarten, Rennhalle 9 und Staubstraße sowie Spot `zaun-ost` (Aussiedlerhof) liegen jetzt begehbar.
    - Station Chrome-Allee ist immer erreichbar.
    - Kanal-Sammler: Das Schott braucht `schottschluessel` oder das neue Drehrad (gc-110, Akt 2), setzt `schott_offen`
      und führt in den Datentunnel.
    - Jimmys Erwachen schließt `side-jimmys-chip`.

### Bewusst offen (mit Grund)
| Lücke | Warum offen | Nächster Schritt |
| --- | --- | --- |
| Wetter, `{ chance }` | Zyklus über `cycleDay` trägt; Zufall würde Spielstände ungleich machen | Wetter-Wurf je Tag, fester Seed |
| Kampf: unverwundbar solange (Firewall/Knoten), Gegnerreichweite, Aufgeben, Status „gesteuert“ | Kampfregel-Umbau; `startStatus` deckt die Vorbereitungen ab, „gesteuert“ = betäubt | eigener Kampf-Durchgang |
| Begegnungs-Varianten in einer Def | Quests wählen die Fassung per Bedingung (k1–k4) | `EncounterDef.variants` |
| `meinung` als Zähler | `atLeast` über Flag-Einheiten funktioniert | `counter`-Effekt/-Bedingung |
| HeartEventDef an Spot, `npcAdditions` (Akt-Zeilen an fremde NPC) | Inhalte nutzen eigene Dialoge/onEnter | bei Bedarf |
| Staubmasken-Ladungen, Ripperdoc Oberstadt gratis, Rostzähne-Zufallsbegegnungen nach Auflösung, Crew-Sperren im Master-Modus | Ersatz über Flags/Text; kein Blocker | einzeln |
| Galerie `romanceOnly`, Raven-Romanze | Galerie-Code bzw. `content/romance.ts` (nicht Engine) | Hauptagent |
| Nyra-Herzen im Turm einfrieren | Inhalt gibt ihr dort absichtlich Herzen per Funk | – |

### Für die Integration (Hauptagent)
- 13 Dateien unter `npc-welt` doppeln `npc-quantum` und überschreiben dabei die Akt-2-Starts der pers-Quests:
  fraeulein-pixel, pfeffer, ki-nexus, stylistin-gina, mila, xion-venom, sybella-chrome, serenity-chrome, seraphina-chrome,
  blade, alesa-zero, portier-albert, bijou. Bitte entfernen.
- Den Stub `opa-funk` in world/nachrichten und die Platzhalter in `integration/luecken.ts` (side-ki-fluestern,
  side-captain-kuschel, pers-ripper-taschenuhr, pers-gustav-alte-liebe, pers-delya-quelle, pers-collin-pixel) entfernen.
  Danach ist der Zusammenführungs-Test grün.
