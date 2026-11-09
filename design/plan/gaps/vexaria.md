# Lücken: vexaria (Vex × Aria „Nicht anhalten“ und Aria / „Zerberster-Herz“ Akt 1)

Dateien: `game/src/content/parts/vexaria/*.ts`. Ablauf und Debug-Sprünge: `design/plan/vexaria.md`.

## Abweichungen vom Kanon (world.md §4.7), damit alles in Akt 1 spielbar ist

1. **Bruch ohne Akt 2.** Kanon: `rom-aria-ausfall` → `rom-aria-streit` → 7 → `rom-aria-vega` → 8 → `rom-aria-regen`, alles Akt 2 mit Zerberster-Sperre. Akt-1-Weg:
   - `rom-vexaria-ripperdeal`: Rippers Paket, drei Raten. Allein gehen oder Aria mitnehmen; mit Aria dreht Vex sich nicht um.
   - `rom-vexaria-streit(-fs)`: Kurzfassung von `rom-aria-streit`, Weg `alleingang`. Setzt `aria_streit_alleingang` plus `aria_romanze_streit` bzw. `aria_krach`.
   - Station 7 Funkstille, dann Vegas Anruf `vega-vex-anruf` / `vexaria-vega-rat` statt `rom-aria-vega`.
   - Station 8 Umdrehen. Ihr Akt-1-Schluss unter dem Vordach ist die Vex-Fassung von `rom-aria-regen` und setzt `aria_versoehnung_verdient`.

   In Akt 2 hören 7/8 schon auf `rom-aria-streit` bzw. `rom-aria-vega`. Wer `pers-aria-zerberster` baut, sollte `ripperdeal`/`streit` nur bei `{ not: { act: 2 } }` laufen lassen; das ist schon so gebaut.
2. **Station 9 ab ♥8 statt ♥10, ohne `pers-aria-zerberster`.** Die Quest existiert noch nicht. Eine Referenz würde den Inhaltstest brechen. Sobald sie da ist, `KUSS_BASIS` in `hoehepunkt.ts` um `{ any: [AKT1, { quest: 'pers-aria-zerberster', state: 'done' }] }` erweitern; ♥10 wäre in Akt 1 nicht erreichbar. `aria_versoehnung_spaet` (Epilog) ist nicht gebaut.
3. **Herzstufen in Akt 1:** Alle Stationen ab 4 tragen `hearts: 8`, weil Akt 1 bei ♥8 deckelt. Die Reihenfolge erzwingen `seen`-Ketten, Tagessperre und Wartetage.
4. **Station 13 Konzert ohne Nachspiel:**
   - Statt `das-meer` / `side-strandclub` / nach `rom-aria-meer` lädt Aria zwei Tage nach Station 12 per Telefon ein (`aria-vex-konzert`).
   - Das Konzert ist ein Geheimkonzert am Schlickstrand unter der `flutmauer` (A/N).
   - Die Tafel `rom-vexaria-konzert` zeigt einen Strandclub am Meer und passt auch hier.
   - Wenn `das-meer` kommt: Der Dialog `rom-vexaria-konzert` kann wiederverwendet werden; nur der Einstiegsknoten nennt den Schlickstrand.
5. **Station 6 Oberlicht** läuft an der `hafenkante` (A/N); die `rennhalle-9` gibt es nicht als Karte.
6. **Albtraum (A4)** läuft 23:00–02:00 statt um 03:00, weil die Nacht um 02:00 endet.
7. **Station 7 Ödnis-Lieferung:** Es gibt keinen Auftrag `job-oednis-paket`. Notbehelf: zweimal Schlafen, +200 Cr, Flag `vexaria_funkstille_ferne`.
8. **„Liegen bleiben“ (Station 11)** verfällt keinen echten Morgenauftrag: Es gibt kein `failJob` auf einen angenommenen Kurierauftrag und keinen Ruf bei den Kurieren. Nur Text.
9. **Station 10/11:** Die Nacht beginnt vor dem Club (`neon-gasse`), die Bude ist erzählt (kein Kartenwechsel nach `loetgassen`), dann `sleep` aus der Abblende-Cutscene. Der Morgen endet mit Reise ins `high-voltage`; das Frühstück startet dort über den onEnter-Auslöser `vexaria-fruehstueck`.
10. **Arm-Wartung bei Dante** gehört `npc-crew-a/dante.ts` (`dante-tag-armwartung`, Flag `vexaria_armwartung`). Hier nicht doppelt gebaut; Arias „Dein Arm summt“ und Dantes Werkbank-Kommentar hören auf dieses Flag.

## Engine / System

1. **Tageswechsel ohne Bedingung.** Es gibt keine Bedingung „heute schon“ oder „seit Tag X“. `system.ts` behilft sich mit onEnter-Auslösern auf 19 Karten (`aria_abend` → morgens Reset von `aria_heute`, Wartezähler `aria_warte2/1`, Wochen-Reset montags). Wer einen ganzen Tag ohne Kartenwechsel am Abend verbringt, verliert einen Zähltag.
   - **Vorschlag:** Bedingungen `{ seenToday: id }` und `{ daysSince: [id, n] }`, oder ein Effekt `setFlagUntilDay`.
2. **Wochenwiederholung.** „1× pro Woche“ ist über Flags gebaut, die montags fallen. Gleiches Problem wie 1.
3. **Tagesgespräch zufällig.** Die Pools wechseln nach `cycleDay`, eine Zeile pro Kalendertag, wie bei den anderen NPC-Agenten. Flirt-Antworten geben nur beim ersten bestandenen Check XP. ♥ gibt es bewusst nur bei einmaligen Wahlen, sonst ließe sich farmen.
4. **Eifersucht.** Konvention: Flirt-Wahlen anderer freigegebener Figuren setzen `flirt_<npc>` (hunter, dante, collin-charleston, lio-funkel, raven, kiki-karbon, delya-delloraine, marla-sand). Arias Warnung löscht diese Flags; ein neues `flirt_*` nach der Warnung löst die Trennung aus (♥ −200, `aria_romanze_freundschaft`).
   - **Bitte an die NPC-Agenten:** In Flirt-Wahlen `{ setFlag: 'flirt_<id>' }` setzen.
   - **Engine-Vorschlag:** ein Ereignis „Flirt mit X“.
5. **Puffer „Beschwingt“** ist ein `checkBuff` ohne `untilDay` (verbraucht beim nächsten Ausstrahlung-Check), wie bei Hunter.
6. **Ohne Wetterbedingung.** Der Regen in Station 8 und „kein Regen“ in 9/12 stehen nur im Text.
7. **Herz-Ereignisse nur beim Betreten.** Wer schon im Club steht, muss einmal raus und wieder rein.
8. **Duo-Aktionen.**
   - „Express-Zustellung“ (♥6, Aria in der Party, nicht bei `aria_romanze_streit`/`aria_krach`) und „Rückendeckung“ (`vexaria_rueckendeckung`, gesetzt in Station 12 der Romanze) gehören dem Kampf-Agenten (`duo-express-zustellung`, `duo-rueckendeckung`).
   - Ebenso „Express-Inkasso“ (+10 % auf Kurieraufträge mit Aria) und „Kanal neun!“ (Duo-Ruf mit `funk-kanal-neun` in Akt 3). Hier nur die Flags.
9. **`callMinutes` 15** gilt immer (CompanionDef kennt keine Bedingung). Kanon: 15 nur im Status zusammen, sonst 30.
10. **Lücke als Sprungpunkt.** Nach `vexaria_luecke_gesprungen` soll die Lücke ein normaler Sprungpunkt sein („Hey, Kas.“). Der Hotspot gehört dem Karten-Agenten `neon-gasse`.

## Andere Agenten

- **Fehlende Sprecher:** `kiki-karbon`, `opa-gurrmann` und `delya-delloraine` werden als Sprecher genutzt. Kiki: Stationen 3/5, Taxi; Gurrmann: Mast; Delya: Konzert. Solange es ihre NpcDefs nicht gibt, meldet der Inhaltstest „unbekannter Verweis npcs“.
- **Herkunfts-IDs:** `origin-gossenkind`, `origin-knastvogel`, `origin-oberstadt`, `origin-oednis` und `origin-schrott` werden wie bei allen anderen Agenten benutzt. `content/character.ts` kennt bisher nur `gosse`/`tueftler` (Testinhalt).
- **Kartenspots:** benutzt werden `high-voltage/fruehstueckstisch`, `vega-aria-tisch`, `tanzflaeche`, `schrottmarkt/inkasso-gasse`, `dantes-werkstatt/einbau-liege`, `neon-gasse/gassenmitte`. Reiseziele: `loetgassen/dach-taubenschlag`, `neon-gasse/von-high-voltage`, `high-voltage/von-neon-gasse`, `flutmauer/von-hafenkante`.
- **Kurierbude-Deko** baut `maps/loetgassen.ts` (`kurierbude-stufe-*`). Die Stufen hören auf `vexaria_kronkorken`, `rom-vexaria-morgen`, `rom-vexaria-funkmast`, `rom-aria-stirn` und `rom-vexaria-konzert`; alle werden hier gesetzt bzw. gesehen (außer `rom-aria-stirn`, Akt 3).
- **Hunter/Dante/Vega-Tagesgespräche** zu Vex × Aria stehen bei npc-crew-a/b. Die hier gebauten Crew-Kommentare sind einmalige Kartenauslöser und doppeln deren Zeilen nicht.
- **Kanon-Herzereignis `he-aria-8`** (Zerberster-Beleg, Akt 2) und `pers-aria-zerberster` fehlen. `he-aria-10` ist für Vex durch Station 9 (Freundschaft) ersetzt; für andere Spielfiguren fehlen `rom-aria-kuss`/`he-aria-10` (Akt 2).
- **Vex-Fotos** `photo-vex-verlegen` und `photo-vex-zaertlich` fehlen. `VEX_HAS_ROMANCE_PHOTOS = false` in `_util.ts` ersetzt sie durch `ueberrascht`/`neutral`.
- **Galerie:** `cut.json` hat `player: "vex"` und `romanceOnly`; der Galerie-Code liest beide noch nicht (world.md, offen). Die Abblende-Cutscenes `rom-vexaria-licht` und `vexaria-nacht-kurz` stehen auf `gallery: false`.

## Inhaltsprüfung

- `tsc` über die Projekt-Konfiguration bricht derzeit an `npc-kinder-alte/daria.ts` ab (fremder Syntaxfehler); `vitest src/content` aus demselben Grund.
- Die Vexaria-Dateien wurden mit einer eigenen tsconfig (nur `vexaria/*`) fehlerfrei geprüft.
- `findContentProblems` ohne `daria.ts` zeigt für die eigenen IDs nur die oben genannten fremden Verweise (Sprecher, Herkunft).
