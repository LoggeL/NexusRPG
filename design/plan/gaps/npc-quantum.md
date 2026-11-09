# Lücken und Absprachen: Figuren Quantum und Oberstadt (npc-quantum)

Dateien: `game/src/content/parts/npc-quantum/{blade,alesa-zero,xion-venom,ki-nexus,seraphina-chrome,sybella-chrome,serenity-chrome,leutnant-nadel,pfeffer,mila,stylistin-gina,fraeulein-pixel,portier-albert,bijou}.ts`. Die Hilfen liegen in `_q.ts`, einer Kopie von `npc-welt/_welt.ts` mit Akt-Bedingungen `AKT2`, `AKT3`, `EPILOG`, `PARTYNACHT`, `NUR_AKT2` und weiteren.

## ersetzt

Gleiche IDs (NpcDef und Akt-1-Dialoge). Diese 13 Dateien bitte bei der Integration löschen:

- `npc-welt/blade.ts`
- `npc-welt/alesa-zero.ts`
- `npc-welt/xion-venom.ts`
- `npc-welt/ki-nexus.ts`
- `npc-welt/seraphina-chrome.ts`
- `npc-welt/sybella-chrome.ts`
- `npc-welt/serenity-chrome.ts`
- `npc-welt/pfeffer.ts`
- `npc-welt/mila.ts`
- `npc-welt/stylistin-gina.ts`
- `npc-welt/fraeulein-pixel.ts`
- `npc-welt/portier-albert.ts`
- `npc-welt/bijou.ts`

Solange sie da sind, gewinnt `npc-welt` (es kommt alphabetisch später). Dann entstehen 72 „überschreibt“-Warnungen in `PART_WARNINGS`. Die Akt-1-Sätze sind unter denselben Dialog-IDs übernommen, zum Beispiel `blade-tag-oberstadt`, `nexus-tag-*`, `serenity-tag-oednis/-morgen/-nacht/-standard` und `he-pfeffer-2/4`.

`leutnant-nadel` ist eine neue Figur. Bild und Laufsprite gibt es schon (`portraits/leutnant-nadel`, `sprites/leutnant-nadel-walk`).

## ersetzt Platzhalter

Keine.

## Engine

- **Rabatte und Aufschläge im Shop:** Es gibt keinen Rabatt-Mechanismus. Diese Flags und Gegenstände sind gesetzt, wirken aber noch nicht:
  - `seraphina_rabatt` (Chrome-Boutique −10 %)
  - `sybella_aufschlag` (Rivalität: +20 % bei Chrome-Läden)
  - `sybella_boykott` (Rivalität −5: Chrome-Läden verkaufen nicht)
  - `sybella_flohmarkt_partner` (außerhalb von `akt-flohmarkt`)
  - Gegenstand `goldene-kundenkarte`

  Vorschlag: `ShopDef.priceMod: { when, factor }[]`.
- **`once` gilt je Dialog-ID:** Geteilte Menüs laufen in mehreren Gesprächsvarianten. Gelöst in `_q.ts`: `gespraech()` setzt für jede `once`-Wahl das Flag `q_einmal_<id>` und blendet die Wahl danach überall aus.
- **Fahndung:** `{ wanted: 1 }` gibt es in
  - `re-blade-5`
  - `re-alesa-zero-2`
  - `re-seraphina-chrome-5`
  - `nadel-tag-patrouille` (Wahl „Sterne“)

## Karten (Kartenpakete)

- **`blades-buero`:** Das Geheimfach soll mit `{ flag: 'blade_geheimfach_code' }` aufgehen. Der Code 0706 kommt aus `he-blade-10`.
- **`chrome-penthouse`:** Der Spot `balkon-blau` aus act23.json fehlt. Seraphina steht tags vorläufig an `seraphinas-spiegel`. Wenn der Spot dazukommt, in `seraphina-chrome.ts` (schedule, Kommentar „Plan: balkon-blau“) umstellen.
- **`chrome-boulevard`:** `he-portier-albert-4` setzt `albert_laesst_rein`. Das liest `ALBERT_LAESST_REIN` schon, die Penthouse-Tür geht damit also auf.
- **`himmelsgarten`:** `he-serenity-chrome-6` schaltet den Turmaufzug frei. Die Karte prüft das schon über `{ seen: 'he-serenity-chrome-6' }`. Zusätzlich gibt es das Flag `serenity_himmelsgarten`.
- **`pkg-chrome-himmel`:** Die Notizen dort nennen dieselben Herz-Ereignisse. Sie liegen jetzt in den NpcDefs hier, bitte keine zweiten mit denselben IDs anlegen.

## Quests (Quest-Agenten)

`startQuest` aus Gesprächen und Herz-Ereignissen, bitte mit diesen IDs anlegen und `giver` setzen:

| Quest | Auslöser |
|---|---|
| `pers-blade-teddymantel` | `he-blade-8`, Nachspiel |
| `pers-alesa-wasserfilter` | Alesa-Menü, Nachspiel ab ♥4 |
| `pers-xion-umschulung` | `he-xion-venom-8`; `he-xion-venom-10` setzt sie als erledigt voraus |
| `side-xions-kralle` | Xion-Menü, nur Akt 2 |
| `pers-ki-nexus-seele` | `he-ki-nexus-8`, Nachspiel nach `ende_neue_nexus` |
| `pers-seraphina-plan-b` | Seraphina-Menü, Akt 2 ab ♥3 |
| `pers-sybella-schnaeppchen` | Sybella-Menü, Akt 2 ab ♥3 |
| `pers-serenity-gewaechshaus` | Serenity-Menü, Akt 2 ab ♥3 |

Gelesene Queststände:

- `kopfgeld-leutnant-nadel`: done heißt, Nadel ist weg; active zeigt das Gespräch `nadel-tag-kopfgeld`. Den Kampf `enc-kopfgeld-leutnant-nadel` baut der Kopfgeld-Teil.
- `side-chrome-pudel`: Bijous Spuren über `bijou_spur_1..3`, dazu Alberts Gespräche `albert-tag-pudel` und `albert-tag-dankbar`. Der Start bleibt am Quest-Hotspot `q-pudel-albert`.
- `side-captain-kuschel`: done heißt, Mila sitzt donnerstags abends am `eins-tisch` in Dantes Werkstatt.
- `prep-outfits` und `prep-ausweise`: Sie liefern nur Hinweis-Gespräche, `gina-tag-outfits` und `pixel-tag-ausweise`. Die Anprobe und die Fälschung baut der Quest-Teil.
- `side-alte-gewohnheiten` (Einbruch) und `main-3-einlass`, wie in Akt 1.

Flags, die Quests und Finale lesen sollten:

- `nexus_freundschaft` (`he-ki-nexus-6`): Im Finale sollte Nexus Türen offen halten. Vorschlag: Variante in `main-3-nexus`.
- `pfeffer_gewarnt`: Er nimmt in der Partynacht die Treppe Ost.
- `albert_etikette_geuebt`: Vorschlag für `side-teekraenzchen`: leichtere Stufe oder ein Zusatzweg.
- `nadel_schichtluecke`: Lücke am Brückenkopf um 03:12, ein möglicher Weg in `prep-*` und auf dem Campus.

## Kampf (neu in diesem Ordner)

- **Gegner:**
  - `rivale-blade` (Stufe 10)
  - `golddrohne`
  - `drohne-q7`
- **Begegnungen:**
  - `enc-rival-blade-golddrohnen` (arena-dach-terrasse, Belohnung `goldknauf-replik`)
  - `enc-rival-alesa-q7` (arena-labor-ruine)
  - `enc-rival-xion-hinterhalt` (arena-hafen, 2× `venom-rekrut`)
  - `enc-rival-xion-boss` (`boss-xion`)
- **Genutzt aus anderen Teilen:**
  - `enc-campus-patrouille` (Nadel, Wahl „Rennen“)
  - Begleiterfähigkeiten `alesa-*` und `xion-venom-*` aus `combat/abilities.ts`

## Begleiter (§4.6)

- Alesa: `recruit` im Nachspiel ab ♥6. Fähigkeiten `alesa-prototyp-werfen` und `alesa-kalibrieren`, ab ♥8 `alesa-schwarmstoerer`.
- Xion: `recruit` im Nachspiel ab ♥8. Ab ♥10 `xion-venom-kenn-ich-war-ich`.

## Romanze

Nur Alesa (`romance.ts`). Flirtzeilen gibt es im Nachspiel mit `romanceEnabled` ab ♥6. Das ♥10-Ende setzt `alesa_romanze` und blendet aus, bevor es weitergeht. Alle anderen hier sind ohne Romanze, Mila ist nur Freundschaft (`child`).

## Minispiele

- `akt-flohmarkt`, Schlüssel `sybella-flohmarkt` (`he-sybella-chrome-8`)
- `akt-gaertnern`, Schlüssel `serenity-hofgarten`, Label „Serenitys Hofgarten“ (enthält „Hof“, zeigt also Marla) (`he-serenity-chrome-10`)
- `akt-etikette` Stufe 1, Schlüssel `albert-etikette-uebung` (`he-portier-albert-2`)

Jeder dieser Knoten hat auch einen Weg ohne Minispiel.

## Bilder

Keine neuen Bilder erzeugt. Fehlende Fotos werden als Platzhalter angezeigt:

- Pfeffer, Mila, Gina, Pixel, Albert und Bijou haben nur Porträts oder Sprites, keine Ausdrucksfotos.
- ki-nexus hat nur neutral, freude, signatur und wut.

## Flags für andere

- **Blade:** `blade_visitenkarte`, `blade_fuehrung_zahlen`, `blade_zweifel`, `blade_gestaendnis`, `blade_geheimfach_code`, `blade_wachen_mehr`, `blade_kopfgeld`
- **Alesa:** `alesa_rede`, `alesa_wachschicht_tipp`, `alesa_zweifel`, `alesa_hintertuer`, `alesa_wahrheit`, `alesa_sozialstunden`, `alesa_romanze`, `alesa_gemeldet`
- **Xion:** `xion_taube`, `xion_ripper_geheimnis`, `xion_rechentrick`, `xion_durchsuchung`
- **Nexus:** `nexus_neugier`, `nexus_name_selbst|_siggi|_kollege`, `nexus_freundschaft`, `nexus_zeichnung`, `nexus_tueren_klemmen`, `nexus_werbung_verfolgt`, `nexus_rebellion_angedeutet`
- **Seraphina:** `seraphina_plan_kanal|_dach|_schwarm`, `seraphina_zweifel`, `seraphina_rabatt`, `seraphina_entschuldigt`, `seraphina_hausverbot`, `seraphina_klage`, `seraphina_tauben`
- **Sybella:** `sybella_enttarnt`, `sybella_schwarm_beweis`, `sybella_buecher`, `sybella_flohmarkt_partner`, `sybella_partnerschaft`, `sybella_aufschlag`, `sybella_boykott`, `sybella_feilschduell`
- **Serenity:** `serenity_orchidee`, `serenity_vorgelesen`, `serenity_sendung_mut`, `serenity_himmelsgarten`, `serenity_wunsch`, `serenity_garten`, `serenity_geruechte`, `serenity_roman_boesewicht`
- **Nadel:** `nadel_schichtluecke`, `nadel_zweifel`
- **Pfeffer:** `pfeffer_gewarnt`
- **Albert:** `albert_etikette_geuebt`, `albert_laesst_rein`, `albert_blade_groll`
- **Bijou:** `bijou_apportiert`, `bijou_versteck`
