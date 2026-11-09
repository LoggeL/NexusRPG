# Lücken und Absprachen: Figuren Unterstadt (npc-unterstadt)

Dateien: `game/src/content/parts/npc-unterstadt/{lio-funkel,marla-sand,pim-pinzette,kaeptn-nebelhorn,buergermeister-gully,bolzen}.ts`, Hilfen in `_lib.ts`.

## Engine

- **Flirt ab ♥6:** Die Bedingung `romance` verlangt ≥ 8 Herzen. Es gibt keine Bedingung „romanzierbar und freigeschaltet, Herzen egal“. Deshalb kommen Lios Flirtzeilen erst ab ♥8 (in Akt 1 möglich, weil 899 Punkte = ♥8). Vorschlag: Bedingung `romanceEligible: NpcId` (Schalter + Kennzeichen, ohne Herzen), dann ab ♥6 mit `{ all: [{ romanceEligible }, { hearts: 6 }] }`.
- **Täglicher Fund (Bolzen ♥2, `bolzens-marke`):** Es gibt keinen Tageswechsel-Mechanismus für Hotspots oder Dialogwahlen. Notbehelf: sieben einmalige Morgenfunde, einer je Wochentag (`bolzen-fund-mo` … `-so`, Flags `bolzen_fund_<tag>`). Vorschlag: `HotspotDef.daily` oder Bedingung `notToday: <schlüssel>` plus Effekt `markToday`.
- **Haustier:** Bolzen ist als `companion` angelegt (`recruit` sobald da), belegt damit aber einen der zwei Party-Plätze und kämpft normal. world.md will: kämpft nicht, 1× pro Kampf **Bellen** (ein Gegner verliert „Überwachung“), passiv **Schnüffeln** (Gefahrenfelder markiert). Vorschlag: eigener Haustier-Platz (`CompanionDef.pet: true`, zählt nicht gegen die 2) und Fähigkeiten `bolzen-bellen`/`bolzen-schnueffeln` beim Kampf-Agenten. `maps/kanal-sammler.ts` prüft schon `{ companion: 'bolzen' }`.
- **`once` gilt je Dialog-ID:** Geteilte Menüs in mehreren Tagesgesprächen hätten Belohnungen je Variante erneut ausgezahlt. Gelöst in `_lib.ts` (`einmalig`: Flag `<npc>_<wahl-id>`). Andere Figuren-Agenten haben vermutlich dasselbe Problem.

## Quests (Quest-Agent)

- `side-zweite-hand`: Lios Auslieferung steckt in Lios Tagesgespräch (Wahl „Dante schickt dich was“, nur solange Quest aktiv). Setzt `zweite_hand_lio`, beim Selbstzahlen (60 Cr) zusätzlich `zweite_hand_lio_bezahlt` (+40 Lio). Schritt bitte mit `done: { flag: 'zweite_hand_lio' }`.
- Auftakt per `startQuest` im Gespräch (Quests bitte mit diesen IDs anlegen, `giver` setzen): `pers-lio-album` (nach `he-lio-funkel-4`), `side-rostlaube` und `pers-nebelhorn-letzte-faehre` (nach `he-kaeptn-nebelhorn-4`), `side-rattenkoenig`, `side-strom-fuer-die-rohre` (Gully), `pers-bolzen-bein` (Bolzen). `startQuest` ist idempotent, ein zusätzlicher eigener Auslöser schadet nicht.
- `pers-pim-kleine-schrift` (act2): `he-pim-pinzette-6` setzt nur `pim_labornotizen` (und `geruecht_master_pim`). Vorschlag: `autoStart: { all: [{ act: 2 }, { flag: 'pim_labornotizen' }] }`.
- `side-hunde-der-brackbucht`: Bolzen gilt als da bei Quest erledigt **oder** Flag `bolzen_umprogrammiert`. Der Kampfweg („später verletzt an der Halde“) ist nicht abgebildet – bitte im Questabschluss/Henks Dialog lösen.
- `he-lio-funkel-10` setzt `pers-lio-album` erledigt voraus; `he-kaeptn-nebelhorn-10` setzt `pers-nebelhorn-letzte-faehre` erledigt voraus.

## Karten

- **Geheimer Gullyweg** (`he-buergermeister-gully-4`, Flag `gully_geheimweg`): Hotspots per `mapAdditions` – `kanal-sammler` Spot `trockendock` (Dialog `gully-geheimweg-kanal` → `neon-gasse`, Einstieg `station`) und `neon-gasse` Spot `pfandflaschen-ecke` (→ `kanal-sammler`, Einstieg `aufwachen`). Vorschlag an Zone neon-gasse: Einstieg `gullyweg` am Pfandflaschen-Eck, dann Ziel umstellen. Vorschlag an Zone kanal-sammler: Schnellweg-Gitter könnten zusätzlich `{ flag: 'gully_geheimweg' }` akzeptieren.
- **Marla Akt 2:** `he-marla-sand-4/6/8/10` liegen vorläufig auf `schrottmarkt` (Sa) mit `{ act: 2 }`. Mit den Ödnis-Karten auf `aussiedlerhof` (4, 10) bzw. `staubstrasse` (6, 8) umhängen und den Tagesablauf (Mo–Fr/So Hof, N Staubstraße-Lagerfeuer) ergänzen.

## Gegenstände/Händler

- Shop `marla-karawane` fehlt noch (Marlas Menü „Was hast du heute auf dem Wagen?“ öffnet ihn).

## Begleiter

- Lio und Marla: world.md §4.6 „ab ♥6“, §11.2 nennt beide nicht unter den Akt-1-Begleitern → `recruit` mit `{ act: 2 }`. Lio sagt in Akt 1 bei ♥6 „bald“. Wenn Lio schon in Akt 1 mitkommen soll: in `lio-funkel.ts` nur `AKT2` aus `recruit` und den Menüwahlen nehmen.

## Bilder

- Plates fehlen (Platzhalter): `cut-he-lio-funkel-6` (Dachterrasse, Lichterketten, Block mit Zeilen, Lio mit Akkordeon von hinten), `cut-he-kaeptn-nebelhorn-10` (Fähre in der Hafenausfahrt, Blick aufs offene Meer). `cut-rom-lio-dach` ist vorhanden.

## Flags für andere

`lio_lied_ueber_dich`, `lio_demo`, `lio_stadthit`, `lio_hit_rost|lio_hit_meer|lio_hit_tuer` (gewählter Titel des Stadthits, für Passantensprüche/Radio), `lio-funkel_romanze_zusammen`, `lio-funkel_nacht` (Crew-Frühstückskommentare), `marla_filter_repariert`, `pim_schachtel`, `pim_mikroinsekt`, `pim_labor_null`, `pim_labornotizen`, `nebelhorn_horn_erlaubt`, `nebelhorn_flaschenpost`, `nebelhorn_koje`, `nebelhorn_pakt`, `ehrenbuerger_der_rohre`, `gully_geheimweg`, `gully_roestzwiebel_tipp` (für `side-rattenkoenig`-Lösung `[Gosse]`), `bolzen_findet`, `bolzen_apportiert`, `bolzen_kuschel_freunde`.

## Akt 2/3 und Nachspiel (Lio, Marla, Pim, Nebelhorn, Gully, Bolzen)

Aufbau wie npc-ordnung-markt: `<figur>-akt23.ts` mit `MENUE_23`, `akt23(menü)`, Phasen (Master → 3b → Neue Nexus → Meer → Nachspiel → Akt 3 → Party → gerettet → Nyra → gechippt → Akt 2), he-8/he-10, Fahrplan, Fähigkeiten. Gully (max. 5 Herzen) nur Menü und Phasen.

- **Doppelte Plätze:** npc-oednis/folgen.ts stellt Marla (Hof/Staubstraße), Lio (Funkturm, Strandbühne) und Nebelhorn (das-meer:steg) schon per Platz auf. Marlas Tagesablauf ist jetzt trotzdem vollständig „ersetzt“ (act23.json), Nebelhorns Steg-Eintrag steht auch im Tagesablauf; Plätze gewinnen, das ist harmlos. Lios Funkturm/Strandbühne nur in folgen.ts, im Tagesablauf zusätzlich Wochenende abends `das-meer:lagerfeuer` (Ende Meer).
- **Marla umgehängt:** he-4 aussiedlerhof abends (Veranda), he-6 staubstrasse tags, he-8 staubstrasse tags Mo/Do (Eskorte: Kampf `enc-oednis-staubfalken`, `[Ausstrahlung 6]`, `[Straße 6]` oder Wegzoll ohne Check), he-10 aussiedlerhof morgens (Wasserstab, dritter Brunnen; Flags `marla_wasserstab`, `marla_dritter_brunnen`). Fähigkeit `marla-wasserader` nach dem Wasserstab. Romanze nur mit `{ romance: 'marla-sand' }`: he-10 → `marla_sterne_frage` → nachts Gespräch `marla-23-sterne` (Kuss, `marla-sand_romanze_zusammen`, Nacht `szene-marla-nacht` mit Abblende, Morgen danach). Der Kampf in he-8 beendet das Gespräch; die Ankunft am Hof wird dann nicht erzählt (Engine: Effekt nach `battle` fehlt).
- **Lio:** he-8 mit Stromsperre/Protestlied (Flags `lio_protestlied`, `lio_romanze_gestanden`), he-10 mit Blackout-Check. Wochenfrage `lio-23-hoch` (`woche_lio_hoch`) nach `lio-funkel_romanze_zusammen` nutzt `szene-lio-nacht`. Fähigkeit `lio-stadthit` nach `lio_album_fertig`; Duo `duo-lagerfeuerlied` trägt Lio, wenn Marla in der Party ist und beide ♥8 haben. Akt 3: `lio_ablenkung` (Lio spielt vor dem Turm) – bitte im Einlass/Finale auswerten. Crew-Frühstückskommentare zu Lio-Nächten weiterhin offen (Crew-Ordner).
- **Pim:** Tagesablauf ersetzt (Akt 2 tags `quantum-labor:pims-werkbank`, Akt-3-Nacht dort, Nachspiel tags `digitech-areal:glasfassade`). he-8 Aussage am Eisenhof gegen Anwaltsdrohne (Flag `pim_ausgesagt`), he-10 nicht nach Master-Ende (Nullpunkt, `pim_nullpunkt`, `pim_duzt`). Akt 3: `pim_labortuer_offen` – bitte im Labor/Finale auswerten. prep-turm-plan spricht von Pim als „er“ (quest-main-2), Pim ist „sie“.
- **Nebelhorn:** he-8 Logbuch mit Route (`nebelhorn_route`) und Kartenabgleich mit `kuestenkarte-fragment` (`nebelhorn_karte_passt`) – passt zu side-weg-zum-meer. Akt 3: `nebelhorn_faehre_bereit` (Fluchtweg übers Wasser).
- **Gully:** Akt 2 `gully_zuflucht` (Kanalvolk gewährt Asyl vor Chrome 10).
- **Bolzen:** Tagesfunde ab Akt 2 über `heute_bolzen_fund` (je Wochentag ein Fund, u. a. `quantum-chip-schrott` am Dienstag; mit `bolzens-marke` am Zyklustag 7/21 `alte-euromuenze`; Ende Meer `muschel-glas`). Fähigkeiten `bolzen-bellen` (ab Akt 2, 1× pro Kampf) und `bolzen-schnueffeln` (♥8) – damit ist die Akt-1-Lücke „Bellen/Schnüffeln“ für Akt 2 ersetzt; „kämpft nicht“ (nur Hilfsaktionen) bleibt Engine-Lücke. he-8 Digitech-Kiste mit Nyras Praktikantinnenausweis und Kinderzeichnung (`bolzen_nyra_zeichnung`, `bolzen_datenwuerfel_vega`).
- **Bilder:** `szene-marla-nacht` nur Schwarzblende; Plate wäre schön (ohne Gesichter, Wohnwagen-Dachfenster mit Sternen).
