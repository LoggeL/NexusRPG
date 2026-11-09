# art-fig-c: fehlende Figurenbilder r–z (Notizen)

Bereich: Figuren-IDs r–z aus world.md §4.2–4.5, den NpcDefs unter `game/src/content/parts/**` und dem Akt-2/3-Plan
(`design/plan/act23_gen.py`). raven, ripper, richter, seraphina/sybella/serenity-chrome, vega, vex-schrapnell, wache,
xion-venom waren schon vollständig.

## Fertig (Schlüssel `<id>-walk`, `portrait-<id>`, `photo-<id>-<ausdruck>`)

| Figur | Laufblatt | Porträt | Fotos | Anmerkung |
| --- | --- | --- | --- | --- |
| rudi | ok 93–96 px | ok | neutral, freude, besorgt | Akt 2 Ödnis (Diner-Wirt); NpcDef fehlt noch – bitte `portrait: 'rudi'`, `sprite: 'rudi-walk'` |
| staubbaron-broesel | ok 95–96 px | ok | neutral, wut, signatur | Akt 2 Ödnis; NpcDef fehlt noch – `portrait: 'staubbaron-broesel'`, `sprite: 'staubbaron-broesel-walk'`; Gegner `staubbaron-broesel` (combat/enemies.ts) nutzt noch `passant-schrotti-walk` und könnte auf `staubbaron-broesel-walk` umgestellt werden |
| schlafwandler-ede, schlafwandlerin-rosi, schlafwandler-bert | ok 92–96 px | ok (Trance) | neutral (Trance), besorgt, ueberrascht (Aufwachen) | Akt 2 `pers-delya-quelle`; NpcDefs fehlen noch – Porträt = ID, Sprite `<id>-walk`. Gegner `kanal-schlafwandler` (combat-23) nutzt `passant-kanalvolk-walk` |
| wachmann-brezel | – (nutzt `quantum-wachmann-walk`) | ok | neutral, wut, ueberrascht | Kostüm aus dem generischen Quantum-Wachmann, Helm unterm Arm, Brezel |
| zellennachbarin (Gitter-Gerda) | ok 93–96 px | ok | neutral, freude, trauer | |
| salzige-grete | ok 93–96 px | ok | neutral, freude, wut | |
| sina-spray | ok 90–96 px | ok | neutral, freude, wut | Build meldet magentastichige Pixel: echte Neonpink-Farbspritzer, gewollt |
| stylistin-gina | ok 95–96 px | ok | neutral, freude, trauer | Magenta-Meldung = pinker Kimono, gewollt; Haar im Laufblatt leicht rosa statt silbern |
| turbo-tilda | ok 94–96 px | ok | neutral, freude, wut | |
| vinyl-vincent | ok 91–96 px | ok | neutral, freude, besorgt | Sonnenbrille durchgehend |
| wett-willi | ok 95–96 px | ok | neutral, freude, besorgt | Dialoge nutzen `verlegen` (fällt auf neutral zurück) |
| werbung | – (Telefon-Absender) | ok (Hologramm-Werbemaskottchen) | – | nur Porträt |

Andere Ausdrücke fallen im Dialog auf `neutral` zurück – in Dialogen bitte nur die gelisteten verwenden.

## Technik

- Prompts: eigene Blöcke in `scripts/art/char_prompts.py` und `scripts/art/photo_prompts.py` („art-fig-c“).
- Referenzen (privat): `work/char_refs.json` `unique:<id>`, Stilfiguren siehe `_stilref_art_fig_c`; nach dem ersten
  Porträt ersetzt das eigene Porträt die Stil-Brustbildreferenz.
- `scripts/art/photo_config/schlafwandler-*.json`: neutral = Trance (extra-Text).
- Offen für die Integration: vollständiger Lauf `char_build.py` und `photo_build.py` ohne IDs (Kontaktbögen, Build-Log),
  danach `node scripts/build_manifest.mjs`; Tabellen in `docs/art-production.md` ergänzen.
