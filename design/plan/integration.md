# Integration Akt 1 – Stand 09.11.

Die Testinhalte sind entfernt. Das Spiel startet mit echtem Akt-1-Inhalt (start.md) und endet nach Akt 1 mit „Fortsetzung folgt“.

## Was steht

- **Welt** (`content/world.ts`)
  - START: `digitech-areal` / `prolog-start`, Cutscene `intro-noxius`, 06:00.
  - HOME: `crew-quartier` / `aufwachen`.
  - ACT_STARTS:
    - 1 = `bahnhof-mitte` / `start`.
    - 2 und 3 sind **vorläufige** Zustände nach Akt 1. Alle Akt-1-Flags und alle 8 Hauptquests sind erledigt, die Crew ist angeworben, die Party besteht aus Raven und Aria.
    - Akt 3 startet in `neon-gasse`.
  - ENDING: Cutscene `ende-fortsetzung-folgt` (`parts/integration/ende.ts`).
- **Herkünfte und Perks**
  - 6 echte Herkünfte (world.md §2.2) in `character.ts`.
  - 20 Perks (§2.5) plus der Vex-Perk `dachlaeuferin` in `perks.ts`.
- **Lücken** (`parts/integration/luecken.ts`)
  - 4 Nebenfiguren: Schrammel, Frau Wischmann, Quantum-Fahrer, Wachmann Brezel.
  - 2 Händler: `elektronikstand` und `marla-karawane` (samstags).
  - 6 Akt-2-Platzhalterquests mit einem einzigen Schritt „Geht in Akt 2 weiter“. Wer Akt 2 baut, ersetzt sie unter derselben ID.
- **Ausgänge zu Akt-2/3-Karten**
  - Betroffen sind `chrome-boulevard`, `quantum-campus`, `datentunnel`, `rennhalle-9`, `staubstrasse` und `pumpwerk-sieben`.
  - `parkLaterActExits` in `content/index.ts` macht diese Ausgänge zu Hinweis-Hotspots (`spaeter-<exitId>`), solange die Karte fehlt.
  - Sobald die Karte existiert, wird der Ausgang automatisch wieder ein Ausgang.
- **Inhaltsfehler behoben**
  - Herkunfts-IDs (`gosse` → `origin-gossenkind`) und eine Aria-Fraktion (`crew-hunter`) korrigiert.
  - Doppelte Bahnhöfe entfernt; die Bahnhöfe aus `world/bezirke-fraktionen` gelten.
  - Doppelte Telefon-ID `tel-kiki-rennen` → `tel-kiki-drohnenwette`.
  - Den Albtraum-Knoten „schweigen“ vereinheitlicht.
- **Kartengeometrie korrigiert**
  - eisenhof, neon-gasse, rohrsiedlung, stufenplatz, kanal-sammler, chrome-penthouse, gerichtssaal, hv-hinterzimmer, quantum-schauraum, flutmauer.
  - Ambient-Routen in bahnhof-mitte, flutmauer, rohrsiedlung und schrottmarkt.
- **Werkzeuge**
  - `map_tool` prüft jetzt mit der echten Fußbreite der Erkundung (10 px) und dem NPC-Radius. Inseln sind erlaubt, solange jede Einstiegsinsel einen Ausgang hat.
  - `map_overlay` zeichnet im Maßstab 1:1.
  - `validate_assets` erkennt NPC-Sprites über `npc.npc`.
  - `cut_build.py` schreibt das Manifest-Fragment `design/assets/cut.images.json`. Damit sind alle 26 Romanze-Tafeln im Manifest.

## Geprüft (09.11.)

| Prüfung | Ergebnis |
|---|---|
| `gen_content_parts` + `tsc --noEmit` | grün |
| `vitest run` | 47 Dateien, 827 Tests grün |
| `PART_WARNINGS` (neu in content.test.ts) | leer |
| Inhalts-Lint `findContentProblems` | 0 Probleme (vorher 1718) |
| `map_tool all --no-render` | alle Karten ✓, exit 0 |
| `build_manifest --check` | aktuell (324 Bilder) |
| `check_architecture` | OK |
| `validate_assets --allow-missing` | 0 Fehler, 506 Warnungen (fehlende Kunst, s. u.) |
| `npm run build` | grün (nur Hinweis auf die Chunk-Größe) |
| `act1.test.ts` (neu) | Hauptstrang `main-0-digitech` … `main-1-der-plan` läuft über den Kampagnen-Port durch. Vorbereitungsquests sind startbar, `act1_done` hat einen Auslöser, `akt1-cliffhanger` existiert. |
| Vex×Aria | Probelauf als Skript, kein Test: alle 16 Stationen mit den Debug-Sprüngen aus vexaria.md und der Vex-Vorlage durchgespielt. Jede Station löst auf ihrer Karte zur richtigen Zeit aus: 1, 2, A1, 3, A2, A3, 4, 5, 6, B1, 7, 8, 9, 10, 12, 13. In der Debug-Tabelle fehlte bei Station 13 `vexaria_kas_erzaehlt`; ist nachgetragen. |

Die Tests verwenden jetzt echte IDs: `bahnhof-mitte`, `crew-quartier`/`aufwachen`, `enc-bahnhof-abzieher`, `main-1-ankunft-abzieher`. Spots dürfen bis 48 px neben begehbarem Grund liegen; in der Erkundung ist die Grenze NPC-Radius − 12.

## Offen

- **Fehlende Kunst.** `validate_assets` ohne `--allow-missing` scheitert an:
  - 406 Item-Icons (der Item-Atlas ist leer),
  - rund 47 Porträts und 42 Laufsprites der Weltfiguren,
  - 11 `he-*`-Tafeln.

  Das Spiel fällt bei allen auf Platzhalter zurück.
- **e2e.** `e2e/engine.spec.ts` ist auf den echten Akt-1-Inhalt umgeschrieben, wurde aber **nicht ausgeführt** (kein Playwright laut Auftrag). Das Skript deckt ab: Erschaffung, Prolog-Sprung, Abzieher, Geschenk an Oma Volt, Auftragstafel, Kampf, Laden, Schlafen.
- **Kämpfe im Hauptstrang.** `act1.test.ts` simuliert keine Kämpfe (`won`). Die Begegnungen selbst prüft `encounters.test.ts`.
- **Akt 2/3.**
  - Die Startzustände sind vorläufig.
  - Die 6 Platzhalterquests und die geparkten Ausgänge bleiben, bis die Karten und Quests gebaut sind.
- **Nicht im Spiel getestet.** Kein Dev-Server und kein Browser liefen. Laufwege, Kamera und UI hat niemand gesehen.
- **Vex×Aria-Ton.** Die Nacht (Station 10, `rom-vexaria-licht-bude`) bleibt eine Abblende, wie AGENTS.md es verlangt. Flirt, Knutschen und Kuss sind ausgeschrieben, die gemeinsame Nacht nicht. Mehr Detail wäre ein Regelwechsel und braucht eine Entscheidung des Nutzers.
