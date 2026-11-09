# art-fig-a: fehlende Figurenbilder a–g

Figuren (Reihenfolge = Wichtigkeit): `falke`, `elsa`, `glasblaeserin`, `fraeulein-pixel`, `chrome-haushaelterin`,
`bijou`, `fx-60`, `direktorin-hartlauf`, `bruder-kabellos`, `dj-lumo`, `bruno-brecher`, `dr-winkel`, `frau-takt`,
`gerda-gleis`, `barista-perle`, `fluss-frieda`, `frau-klingel`, `gutschein-gerd`.
Bildschlüssel: `portrait-<id>`, `<id>-walk`, `photo-<id>-<ausdruck>`.

Nicht neu: `captain-kuschel-walk` fehlt absichtlich (Plüschtier, läuft nicht; art-production.md). Alle übrigen
Figuren a–g aus world.md §4.2–4.4 (aria, alesa, babette-bao, blade, bolzen, buergermeister-gully, collin, dante,
daria, delya, dexter, freya) hatten schon Laufblatt, Porträt und Fotos.

## Vorgehen

- Aussehen frei erfunden aus world.md §4.5/§3.5 und den NpcDef-Bios (keine Kostümreferenz). Prompts:
  `scripts/art/char_prompts.py` (Block „art-fig-a“) und `scripts/art/photo_prompts.py` (Block „art-fig-a“).
- `work/char_refs.json`: `<id>` → `unique:<id>`; Stilfiguren (nur Stil) unter `_stilref_art_fig_a`.
  Nach dem ersten Porträt ist `work/refs/character-unique-<id>-portrait.png` das eigene gemalte Porträt.
- bijou und fx-60 nutzen bolzen als Stilreferenz. Höhen: bijou 42 px, fx-60 50 px (`scripts/art/char_config/`).
- Fotos: erfundene Gesichter; bijou `special: "robot"`, fx-60 `special: "machine"` (je mit eigenen `texts`).

## Ausdrücke (Dialogfotos)

Andere Ausdrücke fallen laut design.md §6.2 auf `neutral` zurück – Dialog-Autoren bitte nur diese nutzen:

- falke: neutral, besorgt, signatur (zählt Möwen durchs Zielauge)
- elsa: neutral, freude, trauer, signatur (repariertes Gerät, Brille halb runter)
- glasblaeserin: neutral, freude, besorgt, signatur (Glaspfeife mit glühender Kugel)
- fraeulein-pixel: neutral, freude, besorgt, signatur („Bitte recht freundlich“, Kamera am Auge)
- chrome-haushaelterin: neutral, freude, signatur (Klatsch hinter vorgehaltener Hand)
- bijou: neutral, freude, wut (beleidigtes Kläffen)
- fx-60: neutral, freude (langes Papierband), wut (Papierstau, rotes Auge)
- direktorin-hartlauf: neutral, wut, trauer, signatur (gerahmter Formbrief)
- bruder-kabellos: neutral, wut, besorgt, signatur (Predigt mit Kabel-Rosenkranz)
- dj-lumo: neutral, freude, ueberrascht, signatur (in die Musik versunken)
- bruno-brecher: neutral, wut, signatur (Panik vor einer Ratte)
- dr-winkel: neutral, freude, besorgt, signatur (Paragrafen-Verkaufsgespräch)
- frau-takt: neutral, wut, freude, signatur (Stoppuhr: „Zu spät.“)
- gerda-gleis: neutral, freude, trauer, signatur (stempelt einen Fundzettel)
- barista-perle: neutral, freude, besorgt, signatur (Latte Art mit Bühnengeste)
- fluss-frieda: neutral, freude, signatur (riecht das Meer)
- frau-klingel: neutral, freude, trauer, signatur (summt zum Radio im Implantat)
- gutschein-gerd: neutral, freude, ueberrascht, signatur (Gutscheine wie ein Pokerblatt)

## Abnahme

- Alle 18 Porträts, Laufblätter (512×512, 4×4, Fußlinie 120; Erwachsene 92–96 px, bijou 40–42 px, fx-60 45–50 px)
  und Fotos angesehen. Neu erzeugt: `falke-signatur-v2` (v1 kaum von neutral zu unterscheiden, `photo_config/falke.json`).
- Build-Warnung „magentastichige Pixel“ bei falke (violette Leuchtnähte) und gutschein-gerd (lila Anzug) sind echte
  Farben (Notiz in `scripts/art/char_config/<id>.json`); dj-lumo 32 px und bijou 15 px sind vernachlässigbar.

## Lücken / offen

- `chrome-haushaelterin` (parts/integration/luecken.ts) hat kein `sprite` im NpcDef; das Laufblatt
  `chrome-haushaelterin-walk` ist trotzdem erzeugt – Integration kann `sprite: 'chrome-haushaelterin-walk'` setzen.
- `elsa` und `glasblaeserin` haben noch keine NpcDefs (Akt-2-Autoren): `weltfigur()` setzt `portrait: <id>` und
  `sprite: '<id>-walk'` automatisch, die Bilder passen dazu.
- Wie bei allen Figuren: am Ende ein vollständiger Lauf `char_build.py` und `photo_build.py` ohne IDs (Kontaktbögen).
