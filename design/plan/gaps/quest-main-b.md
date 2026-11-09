# Lücken – quest-main-b (Hauptquest Teil 2: Raven → Plan → Vorbereitungen → Cliffhanger)

Ordner: `game/src/content/parts/quest-main-b/`

## Engine / Effekte
- **Kein Fahndungs-Effekt.** Der Pfeffer-Kampf (`enc-gasse-pfeffer`) und das Feuerwerk bei Oma Volt sollen laut §5.2 Fahndung +1 geben. Im Moment gibt es dort nur eine `message`. Sobald es einen Effekt `{ wanted: +1 }` o. ä. gibt, gehört er in `prep-zugangskarte` (Schritt `weg-kampf`) und in `prep-ablenkung` (Knoten `gekauft`).
- **Kein Speicherpunkt-/Reload-Effekt (§11.8).** `planungstafel` → `los` setzt `act1_done` und `losschlagen_bestaetigt` und spielt die Cutscene `akt1-cliffhanger` ab. `setAct 2`, `act2` und der feste Morgen im Crew-Quartier fehlen absichtlich, damit die offene Welt nach „Fortsetzung folgt“ spielbar bleibt. Akt 2 soll das ergänzen und als Einstieg `act1_done` verwenden.
- **Quest-Marker ohne `at`.** Spot-Namen sind keine Marker-Punkte, deshalb zeigen die Marker nur auf `map`. Wünschenswert wäre, dass `marker.at` Spot-Namen auflöst.
- **Die NpcPlacement für Raven am Eisenhof `[1235,505]` ist nicht auf Begehbarkeit geprüft.** Sie ist versetzt, damit sie nicht auf Kessel am `entlassungstor` liegt. Bitte im Spiel ansehen.

## Fremde Dateien / Zonen
- **Board-Hotspots der Zone:** `hv-hinterzimmer` hat den Hotspot `planungstafel` (kind `board`, board `planungstafel`), `crew-quartier` den Hotspot `pinnwand` (ebenfalls board `planungstafel`). Ich lege daneben eigene Hotspots `planungstafel-plan` und `planungstafel-quartier` mit dem Dialog `planungstafel` an. Die Zone sollte ihre beiden Hotspots auf `kind: 'use'` + `dialogue: 'planungstafel'` umstellen oder entfernen, damit es keine doppelten Klickziele gibt.
- **Item-Text `partyfoto-raven`** („kurz vor Ravens Verhaftung“) passt nicht zur Zeitlinie: Das Foto entsteht auf der Willkommensparty nach der Entlassung. Der Text sollte z. B. „am Abend ihrer Rückkehr“ heißen.
- **Fehlende NPCs (Registry):** `quantum-fahrer` (Party, High Voltage), `wachmann-brezel` („Gernot“, Brezel-Imbiss), `pfeffer` (Wachmann Pfeffer). Fehlende Sprites: `quantum-wachmann-walk` für das Pfeffer-Encounter.
- **Fehlende Begegnungen:** `enc-markt-raven` (Ringkampf Aria vs. Raven), `enc-gasse-pfeffer`, `enc-kanal-ratten` (müssen im Kampf-Content existieren).
- **Fremde Quests als Bedingung:** `main-1-probezeit` (Auto-Start von main-1-raven, quest-main-a), `side-live-dabei`, `main-1-dexter`. `side-eingehendes-fax` wird über `startQuest` in einem eigenen Knoten gestartet (Dantes Werkstatt, Knoten `fax-quest`).
- **Fraktion `crew-hunter`** (Rep beim Toast) muss registriert sein.

## Tests
- `vitest run src/content` scheitert nicht an diesem Ordner, sondern an `parts/vexaria/_util`. Diese Datei wird vom Generator eingebunden, exportiert aber kein `part` (undefined). Der Generator sollte `_`-Dateien überspringen.
