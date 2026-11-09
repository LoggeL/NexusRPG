# Lücken: Zonen-Paket Neon-Gasse (neon-gasse, high-voltage, hv-hinterzimmer, crew-quartier)

Dateien: `game/src/content/parts/maps/{neon-gasse,high-voltage,hv-hinterzimmer,crew-quartier}.ts`

## Engine

- **U-Bahn per Hotspot:** Es gibt keinen Effekt, der die Stadtkarte/U-Bahn öffnet (`openCityMap` hängt nur am HUD). `neon-gasse` Hotspot `ubahn-zugang` ist deshalb ein `look` mit Hinweis auf die Stadtkarte. Vorschlag: Effekt `{ cityMap: true }` oder HotspotKind `'station'`.
- **Quartier-Ausbau (world.md §3.7):** keine Engine-Funktion. Notbehelf: Dialog `cq-ausbau` mit Flags `quartier_stufe_1` (Pinnwand, 150 Cr), `quartier_stufe_2` (Plattenspieler, `side-schallplatten` erledigt), `quartier_stufe_3` (Werkbank, 400 Cr + 5 `schrott-ersatzteil`). Hotspots `pinnwand`, `plattenspieler`, `werkbank`, `kochen` hängen an diesen Flags. Stufen 4–6 (Gästecouch, Dachgarten, Aussicht) fehlen noch; ein Zähler-Flag `quartier_stufe_N` reicht als Vertrag.
- **Truhe als Lager:** kein Lager/Stash im Spielstand. `truhe` ist ein `look`. Vorschlag: `PlayerState.stash` + HotspotKind `'stash'`.
- **Begleiter wechseln:** kein Effekt für die Party-Auswahl. `begleiter-brett` im High Voltage ist ein `look` mit Verweis aufs Crew-Menü. Vorschlag: Effekt `{ partyMenu: true }`.
- **Tägliche Wiederholung:** Hotspots kennen nur `once`. Mülltonne (`muelltonne`) gibt deshalb einmalig `rostige-dose` + `schrott-ersatzteil`; der Plattenspieler-Puffer (`checkBuff` id `quartier-platte`, +1 Ausstrahlung morgens) ist nicht auf einmal pro Tag begrenzt. Vorschlag: `HotspotDef.daily: true` (Schlüssel `seen` mit Tageszahl).
- **Wetter-Bedingung fehlt:** `akt-sternegucken` soll nur bei `klar` laufen; jetzt nur `{ time: 'nacht' }` + `{ met: 'vega' }`.
- **Musik gedämpft nur nachts:** `musicMuffled` ist statisch. Neon-Gasse soll nachts die Club-Musik gedämpft spielen (Plan-Notiz). Jetzt: Bezirksmusik `unterstadt-tag`/`unterstadt-nacht`, Hinterzimmer `high-voltage` gedämpft. Vorschlag: `musicMuffled?: boolean | Condition` oder `musicVariants`.
- **Aussichtspunkt „deckt Zonenkarte auf“:** kein Effekt dafür. `aussicht-dachterrasse` gibt einmalig 20 XP, setzt Flag `aussicht_neon-gasse` und `markSeen('aussicht-neon-gasse')`.
- **Gesprächsradius hinter Theken:** `NPC_RADIUS` 60 px reicht nicht über Theke + Hocker (≈150 px). Spots `tresen`, `tresen-ende`, `kasse`, `dj-pult`, `ecktisch` liegen deshalb auf der Gästeseite vor der Theke bzw. vor dem Pult. Vorschlag: `NpcPlacement.talkRadius` oder Spot-Feld `talkFrom`, dann können Barkeeper und DJ hinter ihren Möbeln stehen.

## Inhalt / Abstimmung

- **Zufallsbegegnungen:** Darstellung als sichtbare Gruppe regelt laut `combat/random.ts` die Engine. Zusätzlich steht auf `neon-gasse` eine feste sichtbare Gruppe `abzieher-werkstattgasse` (`enc-zufall-neon-gasse-abzieher-nacht`, nachts, `avoid` [Straße 4] inline `ng-abzieher-umgehen`).
- **Feste Begegnungen nicht von mir gesetzt:** `enc-gasse-pfeffer` (Quest-Agent, Spot `pfeffer-gasse`), `enc-hv-ripper-tisch` (Quest-Dialog, Spot `ecktisch`), Kopfgelder `kopfgeld-krawall-kalle`/`kopfgeld-neon-nils` (Auftrags-Agent über `JobTemplateDef.targets`, Spots `kalle-ecke`/`nils-reklame`).
- **Bruno-Einlass:** Damit der Club immer erreichbar ist, bietet der Hotspot `samtkordel` (A/N, solange kein Einlass) den Dialog `ng-samtkordel` mit `gc-04`, Hunters Nachricht (während `main-1-probezeit` aktiv) und 20 Cr; alle setzen `hv_einlass`. Der Figuren-Agent für `bruno-brecher` kann denselben Flag setzen.
- **Morgen danach:** Hotspot `fruehstueck-danach` am `fruehstueckstisch` (einmalig, Morgen nach `rom-vexaria-morgen`) zeigt Crew-Kommentare. Falls der Romanze-Agent dieselbe Szene als Cutscene baut, den Hotspot streichen.
- **Zusätzliche Spots** (nicht im Plan): `high-voltage` `vega-aria-tisch-2`, `eingang`, `personaltreppe`; `hv-hinterzimmer` `tresor`; `crew-quartier` `kueche`; `neon-gasse` `auftrag-a`.
- **Innenraumbilder** sind 3:2 gemalt und für 1024×768 mittig auf 4:3 beschnitten (`map_build.py --size=1024x768`).

## Werkzeuge

- `game/src/content/parts/vexaria/_util.ts` enthält den Text „export const part“ in einem Kommentar; `scripts/gen_content_parts.mjs` (Regex ohne Zeilenanfang) nimmt die Datei deshalb in `parts/index.ts` auf → Build und alle Inhaltstests brechen. Fix: Regex `/^export const part\b/m` im Generator oder Kommentar umformulieren.
- `scripts/map_overlay.py` rechnet noch mit 640×360 (alte Kartengröße) und bricht bei Figuren ohne `actor` ab; die Vorschau stimmt für 1536×1024 nicht. Fix: Größe aus dem Hintergrund lesen, `n.get('actor', n.get('npc'))`.
