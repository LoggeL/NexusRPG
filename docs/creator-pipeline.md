# Charakter-Baukasten: Bild-Pipeline

Vertrag: `docs/design.md` §3.1a (Daten, Regeln, Einfärbung) und §6.3 (Ebenen, Dateien, festgelegtes Verfahren).
Dieses Dokument beschreibt die Abläufe und Befehle für weitere Bausteine.

## Überblick

```
Grundpuppe (Codex, grau)  ──►  base-mittel.png
        │ Referenz
        ▼
Auftrag jNN (Codex-Bearbeitung: Puppe + 1–3 Teile in Kennfarben)  ──►  output/imagegen/raw/creator/jNN.png
        │
        ▼  creator_build.py
ausrichten je Zelle → Teile ausschneiden (Kennfarbe + Zone) → Graustufe + Maske → 96 px, Fußanker
→ Zeile O spiegeln → Haar back/front → Körperbauten schmal/kraeftig → Katalog → Vorschau
```

- Rohbilder: `output/imagegen/raw/creator/` (nicht in Git). Zwischenstand aller Ebenen: `_layers.npz` dort (Cache, damit
  ein einzelner Auftrag ohne Neubau aller anderen gebaut werden kann).
- Ergebnis: `game/public/assets/creator/…` und Katalog `design/assets/creator.json` (= `creator/catalog.json`).
- Prompts: `design/assets/creator-prompts.json` (wird bei jedem Aufruf von `creator_prompts.py` neu geschrieben).
- Vorschau: `output/qa/creator/combos.png`, `combo-1.gif` … `combo-8.gif`, `parts.png`.

## Befehle (aus dem Projektordner)

```sh
# Prompts ansehen
python3 scripts/art/creator/creator_prompts.py list j15
# Aufträge ohne Rohbild auflisten
python3 scripts/art/creator/creator_prompts.py todo
# Bilder erzeugen (höchstens 3 gleichzeitig; vorhandene werden übersprungen)
python3 scripts/art/creator/creator_prompts.py gen j15 j16 j17
python3 scripts/art/creator/creator_prompts.py gen $(python3 scripts/art/creator/creator_prompts.py todo)
# einen Auftrag neu malen lassen (mit Korrektur, neue Datei jNN-v2.png → danach über jNN.png kopieren)
python3 scripts/art/creator/creator_prompts.py gen j17 --suffix=-v2 --extra="the harness straps must stay green"
# Ebenen bauen: alle Aufträge mit Rohbild (baut den Cache neu) …
python3 scripts/art/creator/creator_build.py
# … oder nur einzelne Aufträge (übrige Ebenen aus dem Cache)
python3 scripts/art/creator/creator_build.py j17 j18
# nur Vorschau, andere Zufallskombinationen
python3 scripts/art/creator/creator_build.py --preview --seed=23
```

Ein Lauf über alle Aufträge dauert etwa 1–2 Minuten.

## Neues Teil hinzufügen

1. `scripts/art/creator/creator_prompts.py` → `PARTS`: `"<id>": ("<slot>", "<englische Beschreibung mit Kennfarben>", C_AB | C_HAIR | C_CYBER | C_ACC)`.
   Die ID muss der ID in `content/appearance.ts` entsprechen (Präfixe: `haar-`, `oben-`, `jacke-`, `hose-`, `schuhe-`,
   `gesicht-`, `cyber-…`, `brille-`, `maske-`, `kappe-`, `kopfhoerer`, `kette`, `tattoo-`).
2. `JOBS`: Auftrag anlegen. Mehrere Teile in einem Auftrag nur, wenn sie trennbar sind:
   - räumlich: Frisur (Kopf) + Oberteil (Rumpf bis 70 %) + Schuhe (ab 70 %); Frisur + Hose (Farbe: Blau vs. Rot/Grün);
     Kappe (bis 8 %) + Maske (7–19 %); Brille (Kopf) + Cyber-Bein (ab 58 %);
   - nie zwei Kleidungsteile mit Rot/Grün im selben Höhenbereich (Oberteil + Jacke, Jacke + Hose).
3. Neues Präfix? In `creator_build.py` → `PART_META` Ebene, Ordner, Körperabhängigkeit, Zone und Kennfarben-Art eintragen.
4. `gen`, dann `creator_build.py <job>`, dann `output/qa/creator/parts.png` ansehen.

### Kennfarben (Prompt-Konstanten)

| Art | Malfarbe | Maske/Region |
| --- | --- | --- |
| `C_AB` | Hauptstoff sattes Rot `#d81e1e`, Zweitfarbe sattes Grün `#1ec81e`, Metall grau | A, B, fest; Cyan-Leuchtnähte → Leuchten |
| `C_HAIR` | sattes Blau `#1e50ff` | Haar |
| `C_CYBER` | Gunmetal `#3a3f4a` + Cyan `#30f0ff` | fest + Leuchten |
| `C_ACC` | Schwarz/Anthrazit, ggf. Cyan | fest (+ Leuchten) |

Nie Magenta/Pink in Teilen (Freistellgrund).

## Was steht (Stand 08.11.2026)

Alle drei Körperbauten (`mittel` gemalt, `schmal`/`kraeftig` abgeleitet) für jedes Rumpf-/Beinteil; 289 PNG-Dateien
(Ebenen + Masken + Clip), 6,5 MB. Katalog: 59 Teile mit Datei + 3 ohne Datei (`*`).

| Kategorie | gebaut | Vertrag |
| --- | --- | --- |
| Frisur | 16 + `haar-glatze`* | 17/17 |
| Oberteil | 8 | 8/8 |
| Jacke | 7 + `jacke-keine`* | 8/8 |
| Hose | 7 | 7/7 |
| Schuhe | 5 | 5/5 |
| Gesicht | `gesicht-1`* (in der Puppe), `gesicht-4`, `gesicht-5` | 3/6 |
| Cyberware | Arm links/rechts, Bein links/rechts, Augen, Halskabel, Gesichtsplatte | 7/7 |
| Brille | `brille-rund`, `brille-sonnenbrille`, `brille-visier` | 3/3 |
| Maske | `maske-atemmaske` | 1/2 |
| Kappe | `kappe-basecap` (+ Clip) | 1/2 |
| Kopfhörer, Kette | `kopfhoerer`, `kette` | 2/2 |
| Tattoo | – | 0/4 (+ keins) |

ID-Zuordnung zum Datentyp `PlayerAppearance`: `acc.glasses` `rund|sonnenbrille|visier` → `brille-<wert>`,
`acc.mask` `tuch|atemmaske` → `maske-<wert>`, `acc.cap` `basecap|muetze` → `kappe-<wert>`, `acc.headphones` →
`kopfhoerer`, `acc.chain` → `kette`, `cyber.armL/armR` → `cyber-arm-links/-rechts`, `cyber.leg` → `cyber-bein-<seite>`,
`cyber.eyes` → `cyber-augen`, `cyber.neckCable` → `cyber-kabel`, `cyber.facePlate` → `cyber-platte`.

## Was für den vollen Katalog noch fehlt

| Kategorie | fehlt | Vorschlag |
| --- | --- | --- |
| Kappe/Maske | `kappe-muetze`, `maske-tuch` | Aufträge `j29`/`j33` wurden vom Sicherheitsfilter des Bildwerkzeugs dreimal abgelehnt (vermutlich „Puppe + Gesichtsmaske/Mütze“). Neuer Versuch mit anderer Formulierung, z. B. Mütze zusammen mit einem Oberteil („beanie + hoodie“), Tuch als „scarf pulled up over the nose“ |
| Gesicht | `gesicht-2` (markante Brauen), `gesicht-3` (Sommersprossen), `gesicht-6` (Narbe, Lidschatten) | je 1 Auftrag (Brauen blau, Narbe/Lidschatten schwarz); bei ~10 px Gesichtshöhe ggf. skriptgestützt |
| Tattoo | `tattoo-wange`, `-hals`, `-arm`, `-neonlinien` | Präfix `tattoo-` in `PART_META` (Ebene `tattoo`, körperabhängig, Art `acc`; Neonlinien in Cyan → Leuchten; `tattoo-arm` mit `side`), 2 Aufträge (Wange + Arm, Hals + Neonlinien) |
| Feinschliff | Brauen der Grundpuppe fest dunkel | Brauen als Haar-Region aus der Puppe ziehen |
| Laufzeit | `presentation/appearance/compose.ts`, `content/appearance.ts` | Regeln wie `creator_build.compose()`; Paletten-Vorschlag steht im Katalog (`palette`, `hairColors`, `skin`) |

Aufwand: Ein Auftrag ≈ 60 s, drei parallel; ein voller Neubau ≈ 2 min.
