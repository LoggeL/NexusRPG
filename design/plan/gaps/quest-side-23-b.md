# Lücken: quest-side-23-b (Akt-2-Nebenquests §6.3 Nr. 40–46)

Paket: `game/src/content/parts/quest-side-23-b/` (side-chrome-pudel, side-hartlaufs-rache, side-rostzaehne-ende,
side-kraehes-ehre, side-oednis-frieden, side-glasherz, side-verlorene-frequenz; Helfer in `_lib.ts`).

## ersetzt Platzhalter

Keine. Keine der sieben Quests war unter den Platzhaltern.

## Engine- und Inhaltslücken

| Was | Wo | Vorschlag |
|---|---|---|
| Rostzähne lassen sich als Fraktion nicht auflösen. Es gibt nur das Flag `rostzaehne_aufgeloest` (Quest-Belohnung). | side-rostzaehne-ende.ts, Zufallsbegegnungen der Unterstadt/Hafenkante | Zufallsbegegnungen mit Rostzahn-Schlägern sollten `{ not: { flag: 'rostzaehne_aufgeloest' } }` in ihrer `when` prüfen. Das ist Sache des Combat- bzw. Map-Pakets. Langfristig wäre ein Effekt `disbandFaction` gut, der Ruf einfriert und die Fraktion aus der Rufliste nimmt. |
| Funzel (Rostzahn-Anführer) ist als neue NpcDef `funzel` angelegt und hat noch kein eigenes Porträt. | side-rostzaehne-ende.ts (`npcs.funzel`, portrait `'funzel'`, sprite `rostzahn-schlaeger-walk`) | Ein Porträt `funzel` per codex_image.sh erzeugen (kleiner, fieser Bandenboss mit Enten-Nachtlicht) oder ein generisches Rostzahn-Porträt zuweisen. |
| Hartlaufs Tarnlack-Rabatt läuft über einen eigenen Dialog-Kauf (1200 Cr, Flag `hr_tarnlack_gekauft`), nicht über einen ShopDef-Rabatt. | side-hartlaufs-rache.ts | Einen Effekt `shopDiscount: { shop, item, percent }` oder Shop-Preise mit `when` einführen. |
| Der Kampf gegen Brösel verwendet die vorhandene Kopfgeld-Begegnung `enc-kopfgeld-staubbaron-broesel` mit. Wer Brösel hier besiegt, hat ihn auch fürs Kopfgeld besiegt, und umgekehrt. | side-glasherz.ts | Gewollt, solange das Kopfgeld-Paket `won(enc-…)` als Abschluss nimmt. Andernfalls eine eigene Begegnung `enc-glasduenen-broesel` anlegen. |
| `schallplatte-06` gibt es auch im Tausch bei Vinyl-Vincent (side-schallplatten). | side-verlorene-frequenz.ts (`frequenz-lohn`) | Doppelschutz per `noItem('schallplatte-06')`. Wer sie schon hat, bekommt `vinyl-platte`. Besser wäre eine Bedingung „Sammelstück je besessen“ (`hadItem`), weil eine verkaufte Platte sonst zweimal kommt. |
| Bijou-Sichtungen folgen dem Tagesplan in act23.json (glasarkaden:springbrunnen → stufenplatz:windkante → neon-gasse:gassenmitte). `questLocations` nennt dagegen glaspark/halde. | side-chrome-pudel.ts | `questLocations` in world.md/act23.json an den Tagesplan angleichen oder umgekehrt. |
| News-IDs (`news-side-chrome-pudel`, `news-side-hartlauf`, `news-side-rostzaehne`, `news-side-kraehe`, `news-side-oednis-frieden`, `news-side-glasherz`, `news-side-frequenz`) können mit IDs eines Welt- oder Nachrichten-Pakets kollidieren. | alle sieben Dateien | Bei Kollision gewinnt das spätere Paket (nur Warnung). Ein Präfix pro Paket wäre sicherer. |
| Wiederholte Versuche mit Geschichte oder Prüfung bei Krähe sperren nur für den Tag (`heute_ke_geschichte_versucht`). Eine allgemeine „einmal pro Tag“-Sperre für Dialogwahlen fehlt. | side-kraehes-ehre.ts | Ein `daily: true` für Choices, analog zu Hotspots. |
| Die erste Sendung (side-verlorene-frequenz) zählt bei Sieg und bei Niederlage im Minispiel. Nur der Abschlusstext unterscheidet sich (`fq_sendung_glatt`). | side-verlorene-frequenz.ts | Passt so. Optional könnte ein Sieg einen Ruf-Bonus geben. |
| Zwischenbilder nutzen vorhandene Hintergründe (`bg-chrome-boulevard`, `bg-rudis-diner`, `bg-staubstrasse`, `bg-staubstrasse-frieden`, `bg-funkturm-ruine-sendet`) und Schwarztafeln. Eigene Bildtafeln wurden nicht erzeugt. | Cutscenes `side-*` | Eigene Plates für side-chrome-pudel-wiese, side-hartlaufs-rache-koloss, side-rostzaehne-streik, side-kraehes-ehre-feuer und side-glasherz-ofen per codex_image.sh nachziehen. |
