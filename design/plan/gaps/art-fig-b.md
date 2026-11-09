# art-fig-b: Figurenbilder h–q (Notizen)

Fertig: 26 Figuren, 26 Porträts (`portrait-<id>`), 24 Laufblätter (`<id>-walk`), 82 Dialogfotos
(`photo-<id>-<ausdruck>`). Alle Schlüssel stehen in `game/public/assets/manifest.json` (build_manifest gelaufen).

| Figur | Laufblatt | Fotos | Anmerkung |
| --- | --- | --- | --- |
| leutnant-nadel | ja | neutral, wut, ueberrascht, signatur (Nadelkrallen gehoben) | Antagonistin Akt 2/3 |
| kraehe | ja | neutral, wut, freude, signatur (hört einer Geschichte zu) | Staubfalken-Chefin |
| opa-funk | ja | neutral, freude, trauer, signatur (auf Sendung) | Radio Rost |
| paul | ja | neutral, freude, besorgt, signatur (gechippt: glasiger Blick, Chip leuchtet violett) | ab act2 signatur nutzen |
| pfeffer | ja | neutral, freude, ueberrascht | |
| quantum-fahrer | **nein** (NpcDef nutzt `passant-anzug-walk`) | neutral, wut, ueberrascht | |
| kabelbrand-roadie | **nein** (NpcDef nutzt `passant-punk-walk`) | neutral, freude, ueberrascht | |
| krabbe-karl | ja (Krabbe, 44 px) | neutral, freude, ueberrascht | Maschine |
| hecki | ja | neutral, freude, besorgt | Gärtnerroboter Himmelsgarten (act23.json) |
| herr-glanz | ja | neutral, freude, besorgt | |
| portier-albert | ja | neutral, wut, ueberrascht | |
| mila | ja (Kind, 68 px) | neutral, freude, trauer | 8 Jahre, harmlos |
| madame-satin | ja | neutral, freude, trauer | |
| hafen-hannes | ja | neutral, freude, trauer | |
| henk-angler | ja | neutral, freude, ueberrascht | |
| herr-blitz | ja | neutral, freude, trauer | Dialog nutzt `verlegen` → fällt auf neutral zurück |
| knuspi | ja | neutral, freude, besorgt | |
| knut | ja | neutral, freude, ueberrascht | |
| kurt | ja (88 px, kleiner als Knut) | neutral, wut, ueberrascht | |
| meister-watt | ja | neutral, freude, ueberrascht | |
| mira-loetzinn | ja | neutral, freude, besorgt | Dialog nutzt auch `trauer` → neutral |
| mixi | ja (Rollroboter, 72 px, Rohbild v2) | neutral, freude, ueberrascht | Maschine |
| mutter-bruehe | ja | neutral, freude, trauer | |
| ole-gaehn | ja | neutral, ueberrascht, signatur (schläft im Stehen) | |
| opa-blech | ja | neutral, freude, besorgt | Maschine |
| opa-gurrmann | ja | neutral, freude, besorgt | |

Fehlende Ausdrücke fallen laut design.md §6.2 auf `neutral` zurück. Dialog-Autoren: bitte nur die obigen nutzen.

## Für andere Teile (Vorschläge)

- **combat**: `leutnant-nadel` hat als Gegner `sprite: 'quantum-wachmann-walk'` – kann jetzt `leutnant-nadel-walk` nutzen.
- **Akt-2/3-Figuren**: NpcDefs für `kraehe`, `krabbe-karl`, `hecki`, `opa-funk` (bisher nur Telefonkontakt in
  parts/world/nachrichten.ts) mit `portrait: '<id>'` und `sprite: '<id>-walk'` anlegen.
- `paul` ab act2: im Chip-Zustand `expr: 'signatur'` verwenden.

## Technik

- `scripts/art/char_prompts.py`: Block „art-fig-b“ (26 Einträge, `_MACHINE_ONLY` für Roboter).
- `scripts/art/photo_prompts.py`: Block „art-fig-b“; neu `special: "machine"` (Roboter ohne Tiergestalt) und
  Feld `texts` (eigene Ausdruckstexte je Figur) – kleiner Zweig in `expr_text`/`base_prompt`, art-fig-a nutzt ihn mit.
- `work/char_refs.json`: `<id>` → `unique:<id>`; Stilfiguren in `_stilref_art_fig_b` (Roboter: Rohbilder von bolzen).
- char_config: Höhen mila 68, kurt 88, krabbe-karl 44, mixi 72 (+ walkRaw v2). „Magentastichige Pixel“ bei knut,
  kurt (lila Trainingsanzug), opa-blech (lila Schal), herr-glanz, pfeffer (violette Nähte), mixi (pinker Drink) sind
  echte Farben, keine Freistellreste (Notizen in den Configs).
- photo_config/mila.json: Zusatz „etwa 8 Jahre“ (Standardtext für Kinder sagt 10–13).
- Offen für die Integration: vollständiger Lauf `char_build.py` und `photo_build.py` ohne IDs (Kontaktbögen; Teilbuilds
  liefen mit `--no-contact`), danach `node scripts/build_manifest.mjs`; Tabellen in `docs/art-production.md` ergänzen.
