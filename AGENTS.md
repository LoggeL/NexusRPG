# NexusRPG

- Verbindliche Grundlage: `docs/design.md` (Technik, Systeme, Asset-Vertrag) und `docs/world.md` (Inhalte: Welt, Figuren, Quests, Checks, Gegenstände). Typverträge: `game/src/modules/contracts.ts` (erweitern erlaubt, bestehende Felder nicht umdeuten).
- Phaser 3.90 + TypeScript strict + Vite + Vitest + Playwright. Gerüst stammt aus `../InselRPG`; Nachbarprojekte `../InselRPG` und `../SelantisRPG` nur lesen, nie verändern.
- Quelle: `work/source/nexus-drehbuch.txt` (Theaterstück „Nexus“, Kolpingtheater Ramsen 2024). Enthält Vornamen der Darsteller: Im Spiel, in Git und in Docs nur Rollennamen. `work/`, `output/`, Rohbilder und Logs nie in Git oder Docker.
- Zielgruppe: Erwachsene (18+). Ton darf ruppig sein, harte Beleidigungen und Flüche sind erlaubt (keine Beleidigungen gegen Herkunft, Hautfarbe, Religion, Behinderung oder sexuelle Identität). Romanzen nur über `content/romance.ts` schaltbar; im Text flirtig und erwachsen (Anzüglichkeiten, Küsse, gemeinsame Nacht nur angedeutet mit Abblende, nie ausgeschrieben); Bilder mit Darstellergesichtern nie sexualisiert; die Straßenkinder (Daria, Freya, Jakko) nur Freundschaft. Gewalt comichaft.
- Arbeitsweise (Nutzerwunsch): Fortschritt vor Prüfaufwand. Keine ausufernden Testsuiten oder Prüf-Agenten; Build und vorhandene Tests grün halten, den Rest testet der Nutzer im Spiel und gibt Rückmeldung.
- Bildgenerierung ausschließlich über `scripts/art/codex_image.sh` (Codex-CLI, eingebautes Imagegen) – auch für Texturen (Kacheln, Materialien, UI-Flächen, Partikel), wenn nötig; nahtlose Kacheln danach auf Kanten prüfen. Höchstens drei Codex-Aufträge gleichzeitig pro Agent. Rohbilder unter `output/imagegen/raw/`, Prompts unter `design/assets/*.json`.
- Deutsche Oberfläche mit korrekten Umlauten. Gut lesbar auf Desktop und Touch.
- Speicher schonen: höchstens zwei schwere Prozesse (Build, Playwright) gleichzeitig; Playwright nur headless mit einem Worker. Fremde Dev-Server und Sessions nie beenden.
- Dev-Server-Port 5200, Playwright-Port 5201.
- Nichts pushen oder veröffentlichen ohne ausdrückliche Freigabe des Nutzers.
