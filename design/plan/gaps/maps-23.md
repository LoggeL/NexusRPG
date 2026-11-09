# Lücken und Absprachen: Paket pkg-staubstrasse (staubstrasse, rudis-diner, funkturm-ruine)

Dateien unter `game/src/content/parts/maps-23/`:
- `staubstrasse.ts`: Karte, Dialog `staubstrasse-ankunft`.
- `rudis-diner.ts`: Karte, Dialoge `rudis-diner-ankunft`, `rudis-jukebox` und `rudis-sitznischen`. Die Sitznischen geben Gerüchte als Wegweiser zu den Ödnis-Quests.
- `funkturm-ruine.ts`: Karte, Dialoge `funkturm-ruine-ankunft` und `funkturm-aussicht` (Aussichtspunkt, 20 XP).
- `shops-staubstrasse.ts`: Händler `rudis-diner`, `konvoi` und `radio-rost` sowie der neue Gegenstand `hofhonig-pfannkuchen` (Verbrauch, +40 LP). Die Ware stammt aus world.md §3.5.

Bilder:
- Hintergründe `bg-staubstrasse`, `bg-rudis-diner` (1024×768) und `bg-funkturm-ruine`.
- Variante `bg-staubstrasse-frieden` (Wimpel beider Seiten, Schranke offen) für `side-oednis-frieden` erledigt.
- Variante `bg-funkturm-ruine-sendet` für `side-verlorene-frequenz` erledigt (siehe unten).

## ersetzt Platzhalter

Keine.

## Für Quest-Agenten: Diese Plan-Hotspots lege ich NICHT an

Sie hängen an Questzuständen. Bitte per `mapAdditions.<karte>` mit genau dieser ID an den genannten Spot setzen. Meine Ansicht-Hotspots daneben haben eigene IDs. Sie verschwinden per `hideWhen`, solange die Quest aktiv ist, damit nichts doppelt am Spot liegt.

| Karte | Hotspot-ID (Plan) | Spot | Quest / Check | mein Ansicht-Hotspot (versteckt bei aktiver Quest) |
| --- | --- | --- | --- | --- |
| staubstrasse | `sprungschanze` | `sprungschanze` (im Rennoval, über die Startlinie erreichbar) | `side-kraehes-ehre`, `gc-134` | `schanze-ansehen` |
| staubstrasse | `singende-masten` | `singende-masten` | `side-weg-zum-meer`, `gc-92` | `masten-ansehen` |
| staubstrasse | `wegzoll` | `wegzoll-schranke` | `side-weg-zum-meer` / `sonder-konvoi-nougat`, `gc-93`, 300 Cr, `enc-oednis-staubfalken` | `schranke-ansehen` (nur ohne Frieden) |
| funkturm-ruine | `windrad` | `windrad` | `side-verlorene-frequenz`, `gc-139` | `windrad-ansehen`, `drohnennest-ansehen` |

Weitere Quest-Orte ohne eigenen Plan-Hotspot (Spots gibt es):
- `wrackburg-tor` und `wrackburg-hof`: Krähe, `side-kraehes-ehre`, `side-strandclub`, `job-bergung`.
- `konvoi-halt`: `he-marla-sand-8`, `pers-gustav-alte-liebe`, `pers-kiki-reichweite`, `sonder-konvoi-nougat`.
- `lagerfeuer`: Marla N, `he-kraehe-4`, `job-schulden`.
- `broesel-wasserstand`: Brösel T, `kopfgeld-staubbaron-broesel`, `side-glasherz`.
- `pisten-kreuz`: `he-marla-sand-6`, `pers-kiki-reichweite`.
- `auftrag-a`: `job-oednis-paket`, `job-kurier`.
- `rudis-diner:verhandlungstisch`: `side-oednis-frieden`. Mein Ansicht-Hotspot `verhandlungstisch-ansehen` ist bei aktiver Quest versteckt.
- `rudis-diner:kueche`: Rudi T, `he-rudi-4`, `pers-jakko-kochbuch`. Die Küche ist begehbar durch die Schwingtür, Rudi steht hinter dem Küchentresen. Mein `durchreiche` ist bei aktiver `pers-jakko-kochbuch` versteckt.
- `rudis-diner:tresen`: Rudi M/A. Der Spot liegt hinter dem Tresen und ist von vorne in Ansprechweite.
- `funkturm-ruine`:
  - `radio-rost-pult`: Opa Funk (*), `he-opa-funk-2`, Lio.
  - `plattenleine`: `he-opa-funk-4`, `schallplatte-06` als Questlohn.
  - `windrad-drohnen-nest`: Kampfweg `enc-funkturm-windraeder`.
  - `bunker-eingang`: Opa Funk N.

Feste Quest-Begegnungen setze ich nicht:
- `enc-wrackburg-kraehe`, `enc-wrackburg-kraehe-duell`
- `enc-oednis-staubfalken`
- `enc-kopfgeld-staubbaron-broesel`
- `enc-funkturm-windraeder`

Die Karten zeigen nur sichtbare Zufallsgruppen mit Ausweich-Check:
- staubstrasse: `enc-zufall-staubstrasse-falken-abend`, `-falken-nacht` (nur ohne Frieden/freies Geleit) und `-kraehen-tag`.
- funkturm-ruine: `enc-zufall-funkturm-ruine-windraeder-tag` und `-gemischt-abend`.

## Für Figuren-Agenten

- Rudi, Krähe, Opa Funk, Brösel und Marla stehen über ihre Tagesabläufe an den Plan-Spots. Ich setze keine `npcs`.
- Kiki-Taxi: Beide Zonen haben den Einstieg `taxi`. `staubstrasse` hat zusätzlich den Hotspot `taxi-funk` am Spot `taxi-landeplatz`. Er öffnet nach `pers-kiki-reichweite` den Dialog `kiki-karbon-taxi`, damit man aus der Ödnis wieder wegkommt, falls man ohne Rostlaube hergeflogen ist. Bitte `TAXI_ZIELE` um `staubstrasse` und `funkturm-ruine` ergänzen (Integrationspunkt 5 in act23.md).

## Entscheidungen

- **Glasdünen-Ausgang:**
  - `when` = `haut-filtermembran` (Cyberware) ODER `staubmaske` im Inventar ODER Flag `glasstaub_abgehaertet`.
  - Das Flag setzt der Check-Hotspot `glasstaub-durchhalten` (`gc-111` [Körper 8]) an der Westkante. Er ist ausgeblendet, sobald man Giftschutz hat.
  - Grund: `ExitDef.check` gilt zusätzlich zu `when`, ein „oder“ geht nur so.
- **Rostlaube zurück** ohne Bedingung (60 Minuten). Wer per Kiki-Taxi kam, soll nicht festsitzen. Die Rostlaube ist ins Bild gemalt.
- **Wrackrennen:**
  - Nur mit Rostlaube (`side-rostlaube` erledigt), T/A, einmal pro Tag.
  - Lohn: Ruf `staubfalken` +3 und 40 Cr, Schlüssel `wrackrennen-staubstrasse`.
  - Krähes Ehrenrennen bitte mit eigenem Schlüssel (`kraehe-wrackrennen`, minigames.md) im Quest-Dialog.
- **Radio Rost:**
  - Gastmoderation abends, einmal pro Tag.
  - Vor `side-verlorene-frequenz` Stufe 2 (Ruf `aussiedler` +3, 25 Cr). Danach Stufe 3 als „Sendung für die Stadt“ (Ruf `aussiedler` +5, `unterstadt` +2, 50 Cr).
- **Konvoi:** Laster sind immer gemalt. Handel ist Mo/Do tagsüber möglich, sonst gibt es nur einen Ansicht-Hotspot. Nach `side-oednis-frieden` kommt Wunschware dazu: `wasserfilter`, `nanogel`, günstigere `vinyl-platte` und `edelbrause`.
- **Lagerfeuer:** abends und nachts einmal pro Tag, volle LP und 30 Minuten. Es ist eine kleine Rast, kein Schlafplatz.

## Engine-Lücken

- **Hintergrundvariante und Musik nach Bedingung:** Die Varianten gehen über `bgVariants`. Lichter mit Bedingung fehlen weiterhin (gaps-done: bewusst offen). Das Lagerfeuer leuchtet abends auch, wenn niemand da ist.
- **Staubmaske verbraucht sich nicht** (world.md: 10 Einsätze). Die Ausgangsbedingung prüft nur den Besitz. Vorschlag: Effekt am Ausgang (`ExitDef.effects`) oder `ItemDef.charges`.
- **Wetter `hitzeglocke`/`sandsturm`** (Ödnis-Wetter) gibt es nicht als Bedingung. Die Singenden Masten und Sandsturm-Szenen hängen deshalb nur an Quests.
