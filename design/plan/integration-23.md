# Integration Akt 2, Akt 3, Enden und Nachspiel – Stand 09.11.

Akt 1 läuft jetzt nahtlos in Akt 2 „Der Chip“ und Akt 3 „Releaseparty“ weiter. Danach kommen vier Enden (Upload Stick, Umschreiben, Überzeugt, Master), Ende 3b „Doch noch ans Meer“ und das Nachspiel am Meer. „Fortsetzung folgt“ gibt es nicht mehr.

## Was geändert ist

- **Platzhalter entfernt**
  - Die 6 Akt-2-Platzhalterquests in `parts/integration/luecken.ts` sind gelöscht. Echt gebaut sind sie in `quest-pers-23` (`pers-collin-pixel`, `pers-delya-quelle`, `pers-ripper-taschenuhr`, `pers-gustav-alte-liebe`) und in `quest-side-23-a` (`side-ki-fluestern`, `side-captain-kuschel`).
  - Von 13 Figuren gab es eine Akt-1-Fassung, die npc-quantum neu gebaut hat. Diese Dateien in `parts/npc-welt/` sind gelöscht: blade, alesa-zero, xion-venom, ki-nexus, seraphina-chrome, sybella-chrome, serenity-chrome, pfeffer, mila, stylistin-gina, fraeulein-pixel, portier-albert, bijou.
  - Der Opa-Funk-Stub in `parts/world/nachrichten.ts` ist entfernt. Es gilt `npc-oednis/opa-funk`.
  - Die Cutscene `ende-fortsetzung-folgt` und die Datei `parts/integration/ende.ts` sind gelöscht.
  - **`PART_WARNINGS` ist leer** (vorher 79 Einträge).
- **`content/world.ts`**
  - `ACT_STARTS[2]` folgt `act23.json`:
    - Start `quantum-campus/bruch-treffpunkt`, 22:00, Tag 10, Stufe 6.
    - Erledigt sind Akt 1 und `prep-grundriss`, `-wachplan`, `-fluchtweg`; `main-2-bruch` läuft.
    - Crew ohne Dante, Party Aria und Nyra.
  - `ACT_STARTS[3]` folgt `act23.json`:
    - Start `quantum-campus/party-vorplatz`, 20:00, Tag 30, Stufe 11.
    - Erledigt ist der Akt-2-Hauptstrang (Variante A: Aria war gechippt, Dante hat den Chip gezogen), dazu `prep-outfits`, `-ausweise`, `-gaesteliste` und `party_bereit`. Im Gepäck: Party-Ausweis, `stick-hunter` und `outfit-ordentlich`.
    - `main-3-einlass` läuft. Party Aria und Dante; Nyra ist nicht in der Crew.
  - `ENDING` = Cutscene `ende-abspann` plus `ENDING_EPILOGUE` aus `quest-enden/epilog-karten.ts` (design/plan/ending.md).
- **Übergänge** (gebaut von den Paketen, hier geprüft)
  - Akt 1 → 2: Planungstafel „los“ → `akt1-cliffhanger` → `setAct 2`, `startQuest main-2-bruch`, Reise zum Bruch-Treffpunkt.
  - Akt 2 → 3: Planungstafel `m2p-tafel` „Releaseparty starten“ (ab 3 Vorbereitungen, 20:00–21:30) → `setAct 3`, Reise zum Party-Vorplatz.
  - Enden: `main-3-blade` erledigt → `main-epilog` → Dialog `ende-landeplatz` → Ende-Cutscene → das-meer bzw. blades-buero.
- **Geparkte Ausgänge**: Keine mehr. Alle 16 Akt-2/3-Karten existieren, also sind alle Ausgänge von Akt 1 dorthin wieder echt.
- **Fehler behoben**
  - **`main-2-bruch` ließ sich nie abschließen.** Die Schritte der beiden Rollen (drinnen/Brücke) waren Pflicht, aber nur eine Rolle ist sichtbar.
    - Jetzt sind `eingang`, `labor`, `chip`, `xion`, `overwatch` und `runter` optional.
    - Pflicht bleiben `treffpunkt`, `aria` und `raus`.
  - **Dante trat nie bei.** In `main-2-dante-freeze` stand `recruit dante` vor `setFlag dante_beigetreten`. Die Anwerbebedingung schlug fehl, und weil Effekte transaktional laufen, verfiel die ganze Effektliste samt Flag. `main-2-countdown` blieb damit hängen. Die Reihenfolge ist jetzt getauscht.
  - **Ende 3 (Master): Die Crew blieb in der Party.**
    - `ende-master` entlässt jetzt alle Begleiter.
    - Aria ist im Master-Modus nicht verfügbar (`unavailableWhen` … `master_modus`). Raven und Dante sperrt schon ihre Anwerbebedingung.
  - **Wünsche aus ending.md umgesetzt**
    - Die Glasdünen-Wagenpiste zum Meer und der Hotspot „Abspann ansehen“ hängen jetzt an `epilog` **und** `meer_offen`. Im Master-Modus kommt man also nicht ans Meer.
    - Das Gründertag-Buffet ist im Nachspiel aus (`notFlag epilog`), dort gilt der Meerestag.
  - **check_names**: Zwei Nebennamen in Dialogtexten waren als Darstellernamen gelistet.
    - In `npc-oednis/schlafwandler.ts` heißt die Tochter jetzt Ronja.
    - In `npc-unterstadt/nebelhorn-akt23.ts` heißt die Möwe jetzt Fritzi.

## Geprüft

| Prüfung | Ergebnis |
|---|---|
| `gen_content_parts` + `tsc --noEmit` | grün (344 Teile) |
| `vitest run` | 48 Dateien, 1015 Tests grün |
| `PART_WARNINGS` | leer |
| Inhalts-Lint `findContentProblems` | 0 Probleme |
| geparkte Ausgänge (`spaeter-*`) | keine |
| `map_tool all --no-render` | alle 47 Karten ✓, exit 0 |
| `build_manifest --check` | aktuell (642 Bilder, 106 Laufblätter) |
| `check_architecture` | OK |
| `validate_assets --allow-missing` | 0 Fehler, 22 Warnungen (fehlende Tafeln/Itemsymbole, s. u.) |
| `check_names` | ok |
| `npm run build` | grün (nur Hinweis auf die Chunk-Größe) |

### `act23.test.ts` (neu, ein Test)

- **Ablauf.** Der Test startet mit `warpAct(2)` und spielt den Hauptweg über den Kampagnen-Port bis zu jedem Ende:
  - Akt 2: `main-2-bruch`, `main-2-kanal`, `main-2-countdown`, `main-2-krisensitzung`, dann `prep-outfits`, `prep-ausweise` und `prep-gaesteliste`.
  - Akt 3: `main-3-einlass`, `main-3-labor`, `main-3-gedankenkontrolle`, `main-3-nexus` und `main-3-blade`.
- **Schritte** werden über die echten Effektlisten des Inhalts erfüllt, die ein Flag setzen; dabei laufen Anwerben, Gegenstände und Reisen mit. Kämpfe zählen als gewonnen (`finishBattle`).
- **Übergänge** laufen als echte Dialoge, Cutscenes, Reisen und Kartenauslöser über einen kopflosen Regisseur:
  - Planungstafel `m2p-tafel`, `ende-landeplatz`, Ende-Cutscenes;
  - Ankunft am Meer `ende-meer-strand`, Abend-Cutscene;
  - `zc-kuschel` und Ravens Telefon für 3b.
- **Geprüft wird je Upload**:
  - **Stick** und **Überzeugt** → `ende-das-meer`, `ende_meer`, das-meer, Ankunft gesehen, Abspann-Hotspot sichtbar.
  - **Umschreiben** → `ende-neue-nexus`, `ende_neue_nexus`, das-meer.
  - **Master** → `ende-master`, blades-buero, `master_modus`, Meer zu. Danach weiter über `side-zweite-chance` bis `ende-doch-noch-ans-meer` (3b): das-meer, `master_modus` aus.
- **Zusatzprüfungen**:
  - Der Cliffhanger startet Akt 2.
  - Der Akt-3-Warp startet `main-3-einlass`.
  - Es gibt keine abgelehnte Effektliste. So fiel der Dante-Fehler auf.

### Vex×Aria Akt 2 bis Nachspiel (Skript, kein Test)

- Aufruf: `cd game && npx vite-node ../scripts/dev/vexaria23_probe.ts`.
- Das Skript setzt die Debug-Sprünge aus vexaria.md mit der Vex-Vorlage, betritt die Karte zur richtigen Zeit und spielt den Dialog automatisch (erste Wahl).
- **Alle 23 Proben lösen aus**, ohne abgelehnte Effektliste:
  - Akt 2: A-a, R (mit Kette Werkstatt → `rom-aria-ausfall`), A-b, `he-aria-8`, A5 B, A6, A7, A8, K1, K2 (mit Abblende und Morgen), Outfit, Stirn (Abblende `rom-aria-stirn-vex`).
  - Partynacht: Tanz, Sorge, Geständnis.
  - Enden: Meer (Ende 1 und 3b), Autoradio (Ende 2), Master (Ende 3).
  - Nachspiel: Zähne, Schlüssel, Rate, Ausblick.
- **Hinweis zu K1 und Schlüssel:** Diese Proben brauchen erledigte Akt-1-Stationen (`rom-vexaria-streit(-fs)` bzw. `rom-vexaria-schutzgeld`), sonst kommt erst diese ältere Station. Das ist gewollt: Die Stationen laufen nacheinander. In der Debug-Tabelle reicht der Zusatz „frühere Stationen gesehen“.

### Karten

`map_tool all --no-render`: alle 47 Karten ✓ (exit 0), davon 16 aus Akt 2/3.

## Offen (ehrlich)

- **Nicht im Browser gespielt.** Kein Dev-Server, kein Playwright. Laufwege, Kamera, UI-Abläufe, Minispiele und Kämpfe der Akte 2 und 3 hat niemand gesehen.
- **Kämpfe sind simuliert.** Der Test zählt sie als gewonnen. Ob die Boss-Kämpfe (Xion, Nexus, Blade) fair sind, prüft nur `encounters.test.ts` (Aufbau), nicht das Gleichgewicht.
- **Die Dialoge hat der Test nur auf einem Weg gespielt** (erste wählbare Wahl). Andere Wahlen und Checks sind nur über den Inhalts-Lint geprüft (Verweise, Weg ohne Check). Fehler wie „abgelehnte Effektliste“ können auf anderen Wegen noch stecken. `act23.test.ts` meldet sie nur auf dem gespielten Weg.
- **Master-Modus und Crew.** ending.md wollte die Crew im Master-Modus „weg“. Die Crew-Pakete haben stattdessen eigene kalte Master-Gespräche und Orte gebaut, zum Beispiel `raven-tag-master`, `vega-tag-master` und `jimmy-tag-master` am Bahnsteig. Das habe ich so gelassen. Wer sie wirklich weg haben will, setzt einen vorangestellten `away`-Eintrag in die Tagesabläufe.
- **Engine-Lücken aus den Paketen** (nicht behoben, siehe gaps/*.md):
  - Uhr stellen bzw. anhalten für Heists: `noCollapse` hält die Uhr um 01:59 an. Ein `setClock` fehlt.
  - `EncounterDef.onLose: 'stay'` fehlt.
  - Bedingte Cutscene-Beats fehlen.
  - Kampfpuffer aus Vorbereitungen fehlen (`battleBuff`).
  - Shop-Rabatte und -Aufschläge fehlen (`priceMod`), ebenso ein Meinungszähler.
  - `HeartEventDef` hat keinen Spot.
  - `npcAdditions` fehlt.
- **Raven ist nicht romance-freigegeben.** Die Wahl „[Romanze] Geständnis“ in main-3 ruht deshalb (content/romance.ts).
- **Fehlende Kunst** (Platzhalter im Spiel; `validate_assets` warnt 22×):
  - Tafeln `cut-rom-hunter-date`, `cut-wingman-sonnenuntergang` und `cut-marla-brunnen`;
  - einige Itemsymbole, z. B. `taschenuhr-ripper`, `fisch-vom-grill`, `glasperlen`, `talisman-grosse-ohren`;
  - Porträts mehrerer Nebenfiguren (Schlafwandler, Funzel, Brösel, Passanten Akt 2).

## Spielanleitung

### Normal durchspielen

1. **Akt 1** bis zur Planungstafel im HV-Hinterzimmer (oder an der Pinnwand im Quartier). Dort „Heute Nacht losschlagen“ wählen. Ab 22:00 läuft der Cliffhanger, danach beginnt Akt 2 am Zaun des Quantum-Campus.
2. **Akt 2**:
   - Bruch: Rolle drinnen oder Brücke, Labor, Xion, Aria.
   - Kanal: Pumpwerk Sieben.
   - Countdown in Dantes Werkstatt; danach tritt Dante bei.
   - Krisensitzung im HV-Hinterzimmer.
3. **Vorbereitungen**: drei von sechs genügen.
   - Outfits: Gina, Stufenplatz.
   - Ausweise: Pixel.
   - Gästeliste: NX-1 oder Foyer.
   - Fluchtwagen: Rostlaube, Rennen oder Hafen.
   - Turm-Plan: Datentunnel, Eisenhof oder Penthouse.
   - Gegenmittel: Dante.
4. **Releaseparty**: Planungstafel „Releaseparty starten“, zwischen 20:00 und 21:30.
5. **Akt 3**: Einlass, Labor (Nyra), Rede und Chip-Tablett, Serverkern mit der Upload-Entscheidung, Landeplatz (Blade).
6. **Enden**: Der Landeplatz-Dialog startet das Ende, das zum Upload passt.
   - Stick oder Überzeugt → Ende 1 „Das Meer“.
   - Umschreiben → Ende 2 „Die neue Nexus“.
   - Master → Ende 3 im Turmbüro. Mit Captain Kuschel im Besuchersessel beginnt „Eine zweite Chance“ (3b).
7. **Nachspiel**:
   - Am Meer: Strandclub, Sondersendung am nächsten Morgen.
   - Der eigentliche Abspann läuft nur am Wagenplatz („Abspann ansehen“). Vorher speichern, danach geht es zum Titel.

### Debug-Sprünge

- **URL**: `?act=2` (Bruch-Treffpunkt, 22:00) bzw. `?act=3` (Party-Vorplatz, 20:00). Zusätzlich `&time=<morgen|tag|abend|nacht>`, `&debug` und `?map=<id>&entry=<einstieg>`.
- **Debug-Menü F2** (mit `&debug`): Akt wechseln, Tageszeit setzen, Flags setzen.
- **Schnell zu einem Ende**: Mit `?act=3&debug` starten und den Akt-3-Strang spielen. Fehlende Flags eines Schritts setzt man im F2-Menü; welche das sind, steht in den Schritten der Quests in `quest-main-3/*.ts`. Einen Sprung direkt auf „main-3-blade erledigt“ gibt es nicht, weil ActStart nur Akt 1 bis 3 kennt.
- **Nachspiel direkt**: `epilog`, `ende_meer` und `meer_offen` setzen, dann `?map=das-meer&entry=ankunft`.
- **Vex×Aria**: die Debug-Tabelle in vexaria.md; Probe-Skript siehe oben.
