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
