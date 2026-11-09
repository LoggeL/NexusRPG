# Lücken · quest-side-c (Akt-1-Nebenquests §6.2 Nr. 23–31, 50)

Ordner: `game/src/content/parts/quest-side-c/` (eine Datei je Quest, `_q.ts` = Schreibhilfen ohne Teil-Export).

## Fehlende Figuren / Inhalte (Integration)

- **Neue Figuren ohne NpcDef:** `kabelbrand-roadie` (Roadie „Schrammel“, Schrottmarkt Merchstand, Nr. 23), `chrome-haushaelterin` (Glaspark-Bank, Nr. 24). Bitte als einfache Statisten anlegen (Name, Porträt-Platzhalter), sonst schlägt die Sprecher-Prüfung an.
- **Fremde Figuren, auf die die Dialoge verweisen** (laut Lint noch nicht definiert): `vinyl-vincent`, `hafen-hannes`, `fluss-frieda`, `sina-spray`, `stylistin-gina`. Die IDs folgen world.md; sobald die NPC-Agenten liefern, ist das erledigt.
- `schallplatte-08` (Lohn Nr. 28) ist als Item-ID gesetzt; die Plattenreihe gehört side-schallplatten. Falls die Nummer schon vergeben ist, dort umbiegen.

## Engine-Lücken (Umgehungen)

- **Wetter-Bedingung fehlt** (`{ weather: 'rostregen' }` o. ä.). Nr. 30 (Rettung am Rechen) und Nr. 27 hätten Regen-Varianten; jetzt nur über Wochentage/Uhrzeit.
- **Relative Tage fehlen** („am nächsten Morgen“). Nr. 27 (Strom für die Rohre) baut das über eine Schrittkette Nacht → Morgen (optionale Schritte `nacht`/`eingebaut`).
- **Kein `meinung`-Mechanismus** für NX-1/Öffentlichkeit: Nr. 29 setzt `meinung_plus_collin_glatze` als Flag.
- **Fahndung als Flag:** Nr. 26/50 setzen `fahndung_1` (wie side-keksalarm); ein echter Zähler fehlt.
- **Quest-Marker nur als Punkt:** Marker nutzen Koordinaten statt Spot-Namen; verschiebt eine Karte ihre Spots, wandern die Marker nicht mit.
- **„Mindestens k von n“** fehlt als Bedingung: Nr. 31 nutzt `atLeast()` aus `_q.ts` (alle k-Teilmengen, bei 6 aus 8 = 28 Zweige). Ein `{ count: [...], min: k }` wäre sauberer.

## Abhängigkeiten zu Karten (Flags, die die Karten setzen)

- flutmauer: `mauer_kamera_gehackt` (Hack-Minispiel `mauer-kamera`), generischer Sprüh-Hotspot `graffiti-wand` bleibt bestehen (setzt `wand_gesprueht`, unabhängig von Nr. 31).
- glasarkaden / chrome-penthouse: `alte-gewohnheiten-getarnt`, `-rabe-gemalt`, `-tuch`, `-entkommen`; Drohnenkampf `enc-penthouse-drohnen`. Nr. 50 ergänzt nur Start, Kiki-Weg (Einstieg `dach`), Schritt-Flags `alte-gewohnheiten-im-lieferhof` / `-im-penthouse` und den Abschluss. Seidentücher kosten laut Karte je −4 `chrome-haus` (world.md: −10 gesamt) – bei drei Tüchern −12, akzeptiert.
- kanal-sammler: Generator-Flags `kanal_generator_laeuft` / `kanal_generator_teile` (Nr. 27), Rechen-Dialog setzt `rechen_geborgen` (Nr. 30).
- eisenhof: Terminal-Flag für die Handschellen-Seriennummer (Nr. 24). digitech-tresor: Beute `rostlaube-batterie` (Nr. 25).

## Offen / später

- Nr. 31 Wand der Freiheit: „Fortsetzung in jedem Akt“ und Quantum-Übermalung in Akt 2 sind nicht gebaut; Flags `wand_bild_<npc>` und `abspann_wand_der_freiheit` stehen bereit. Abspannbild braucht eine Platte (Art).
- Nr. 50: Akt-2-Haken („Sie waren doch die Blumenlieferung!“ bei Sybella) über `done('side-alte-gewohnheiten')` bzw. Flag `alte-gewohnheiten-blumenlieferung` – Sache von side-teekraenzchen.
- Opa Funks Route (Nr. 29/50 Erwähnung) ist Akt 2.
- Cutscenes (`rostlaube-probefahrt`, `strom-licht-im-kanal`, `peruecke-sendung`, `lumo-dante-legt-auf`) laufen mit Bild `black` + Untertiteln; Platten fehlen (Art).
- Vex-/Romanze-Varianten: Arias Shirt (Nr. 23) hat Vex-Romanze-, Romanze-, Vex-Freundschafts- und Freundschaftsübergabe; Nr. 31 hat ein verstecktes Vex×Aria-Motiv, Nr. 50 einen Raven-Kommentar zu Vex×Aria. Kein Kuss vor Station 9.
