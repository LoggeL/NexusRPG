# Lücken und Hinweise: combat-arenas-23

Neue Arenen (game/src/content/parts/combat-arenas-23/arenas.ts, Bilder game/public/assets/arena/*.webp):
`arena-rohre`, `arena-rohre-datentunnel`, `arena-dach`, `arena-dach-terrasse`, `arena-duenen`,
`arena-duenen-wrackburg`, `arena-duenen-strand`, `arena-partysaal`, `arena-serverkern`.
`arena-labor-altlager` und `arena-labor-quantum` gab es schon (parts/combat-arenas, mit Bild).

## Empfohlene Zuordnung (für combat-23 / Integration)

- `enc-kanal-xion-ripper` (+ Varianten) → `arena-rohre` (Rettungsfeld [1,3] ist begehbar, passt).
- Zufallskämpfe `datentunnel` und `nexus-splitter` (Nachspiel) → **`arena-rohre-datentunnel`** statt `arena-rohre` (combat/random.ts Zeile ~225).
- `enc-dach-blade` → `arena-dach`. Gleiter steht auf [10..11, 2..3]; Ziel „Blade erreicht den Gleiter“ = Nachbarfelder [9,2], [9,3], [10,1], [10,4]. Antennen (Handschellen) auf [4,0], [9,0], [6,3], [7,6].
- `enc-bruch-overwatch` (Brücke) und Kämpfe auf der Neon-Gassen-Dachterrasse, `enc-kopfgeld-neon-nils` („Dächer“) → `arena-dach-terrasse` passt besser als `arena-dach`/`arena-strasse`.
- `enc-oednis-staubfalken`, `enc-duenen-koenigin`, `enc-kopfgeld-staubbaron-broesel`, Zufallskämpfe Ödnis → `arena-duenen`.
- `enc-wrackburg-kraehe` → `arena-duenen-wrackburg`.
- `enc-strand-staubfalken` → `arena-duenen-strand`.
- `enc-turm-raven`, `enc-turm-xion`, Zufallskämpfe `himmelsgarten` → `arena-partysaal`.
- `enc-kern-nexus` → `arena-serverkern`: Kern auf **[6,3]** (Mitte, ringsum Kabelkanäle '~'), Knoten auf [10,1], [11,3], [10,5] (E-Felder). Terminal für Phase 3 (Ziel `hack`): Konsole [2,1] bzw. [2,5] ist Deckung (nicht begehbar) – als Hack-Feld [1,1] oder [3,1] nehmen.
- `enc-altlager-zuendholz` → `arena-labor-altlager`; `enc-campus-patrouille`, `enc-labor-blade-vorspiel` → `arena-labor-quantum`; `enc-markt-betreuer` → `arena-hinterhof`; `enc-bruecke-patrouille` → `arena-dach-terrasse` oder `arena-strasse`; `enc-ruine-wachkoloss` → `arena-schrottplatz`; `enc-hafen-funzel` → `arena-hafen`.

## Engine-Lücken

- **Firewall-Welle** (`boss-nexus-kern` P2): Die Kabelkanäle sind feste '~'-Felder (5 Schaden). Wechselnde Muster („leuchtet vorher“) bräuchten Gefahrenfelder, die sich pro Runde ändern (`BattleState.extraHazards`, siehe gaps combat-arenas). Jetzt: dauerhafter Ring um den Kern.
- **Gleiter als Ziel für den Boss** (`boss-blade` P3 „rennt zum Gleiter“): `BattleObjective.reach` gilt nur für die Party. Vorschlag: `objective.enemyReach { unit, cells, rounds }` → Niederlage/Flucht, wenn Blade die Felder erreicht.
- **Meer/Abgrund**: Wasser am Strand (Zeile 7) und die Dachkante sind '#' (blockiert auch Sicht, stört in Zeile 7 nicht). Ein Zeichen „Abgrund/Wasser“ (nicht begehbar, Sicht frei) wie bei gaps combat-arenas wäre sauberer.
- Status „Nass“ fehlt weiterhin (Pumpwerk-Schächte haben nur Schaden 4).
