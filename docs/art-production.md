# Kunstproduktion

Arbeitsstand und Abläufe der Bildproduktion. Verbindlich bleibt der Asset-Vertrag in `docs/design.md` §6 (Formate, Pfade, Stilbibel). Rohbilder, Referenzen und QA-Bilder liegen unter `output/` bzw. `work/` und gehören nie in Git oder Docker.

## Figuren

### Pipeline

1. **Prompts** stehen in `scripts/art/char_prompts.py` (Beschreibung je Figur, Stilbibel, Laufblatt- und Porträtaufbau, Ausdrucksvarianten) und werden bei jedem Lauf nach `design/assets/characters.json` geschrieben. Prompts und Dateien unter `design/` und `game/` enthalten nur Figuren-IDs. Die Zuordnung Figuren-ID → Kostümreferenz steht privat in `work/char_refs.json`.
2. **Generierung** ausschließlich über `scripts/art/codex_image.sh <ziel.png> "<prompt>" [referenz.png …]` (Codex-CLI, ~45–120 s pro Bild, höchstens drei Aufträge gleichzeitig pro Agent). `char_prompts.py` ruft das Skript mit den passenden Referenzen auf (Laufblatt: Kostümfigur zuerst, Porträt: Brustbild zuerst).
   - Laufblatt: ein quadratisches 4×4-Blatt derselben Figur auf reinem Magenta `#FF00FF`, Zeilen Süd, West (läuft nach links), Ost (läuft nach rechts), Nord (Rücken), je vier Schrittphasen.
   - Porträt: Brustbild, dunkel-neutraler Grund (#120c1e–#1a1030) mit Neon-Rimlight in Pink oder Cyan, keine Schrift.
   - Requisit: freistehendes Objekt auf Magenta.
3. **Rohbilder** landen unter `output/imagegen/raw/characters/<id>-walk[suffix].png`, `<id>-portrait[-variante][suffix].png`, `<id>-prop[suffix].png`. Neuversuche erhalten ein Suffix (`-v2` …) und werden über `scripts/art/char_config/<id>.json` ausgewählt.
4. **Aufbereitung** mit `scripts/art/char_build.py`:
   - Magenta freistellen (`sprites_lib.key_out`), Magentasaum entmischen (`unmix_edges`), 4×4-Raster über Belegungsprofile schneiden.
   - Je Zeile auf Zielhöhe skalieren: Erwachsene 96 px, Kinder 76 px. Die Skalierung ist auf ±8 % um den Median begrenzt. LANCZOS mit vormultiplizierter Alpha.
   - Fußlinie auf y = 120, Füße im Zeilenmittel auf x = 64, Ergebnis 512×512 RGBA mit 128er-Zellen.
   - Porträts mittig quadratisch zuschneiden, 512×512 WebP (Qualität 85). Requisiten freistellen, Fußanker unten Mitte.
   - QA je Frame (Höhe, Fußlinie, Randberührung, magentastichige Pixel) in `design/assets/characters-build.json`.
   - Manifest-Fragment je Figur in `design/assets/characters/<id>.json`, zusammengeführt in `design/assets/characters.manifest.json` (Teil von `game/public/assets/manifest.json`).
   - Kontaktbogen `output/qa/art/characters.png` (jedes Laufblatt auf dunklem und hellem Grund mit Fußlinie und Zellraster, dazu Porträts und Requisit), je Figur `output/qa/art/characters/<id>.png` und eine Lauf-Vorschau `<id>-walk.gif`.
5. **Abnahme**: Kontaktbogen und jedes Blatt ansehen. Zu prüfen sind Richtungen, gleiche Größenverhältnisse (Kinder kleiner), saubere Freistellung auf hellem und dunklem Grund, Stil wie die Kostümreferenz und Kleidung über alle 16 Frames gleich.

### Befehle

```sh
# Prompts ansehen / Bilder erzeugen (vorhandene Rohbilder werden übersprungen, außer --force)
python3 scripts/art/char_prompts.py list [ids …]
python3 scripts/art/char_prompts.py walk <ids|all> [--suffix=-v2] [--extra='Korrektur'] [--dry-run]
python3 scripts/art/char_prompts.py portrait <ids|all> [--variants=,angry] [--suffix=-v2] [--extra='…']
python3 scripts/art/char_prompts.py prop <ids|all> [--suffix=-v2]

# Aufbereiten
python3 scripts/art/char_build.py                 # alle Figuren, danach Kontaktbogen und Manifest
python3 scripts/art/char_build.py <ids> --no-contact   # Teilbuild (parallel arbeitende Agenten)
python3 scripts/art/char_build.py --contact       # nur Kontaktbogen
python3 scripts/art/char_build.py --manifest      # nur Fragmente zusammenführen
```

Teilbuilds mit `--no-contact` schreiben nur Fragment und Build-Daten. Weil parallele Builds sich in `characters-build.json` überschreiben können, folgt am Ende immer ein vollständiger Lauf ohne IDs. Er baut alle Figuren nacheinander und erzeugt dabei auch Kontaktbogen und Manifest.

`scripts/art/char_config/<id>.json` (optional, eine Datei je Figur) wählt Rohbilder und Korrekturen aus:

- `walkRaw`: anderes Rohbild für das Laufblatt.
- `rowFrom`: einzelne Zeile aus einem anderen Rohbild übernehmen.
- `mirror`: Zeile gespiegelt übernehmen (nur als Notlösung).
- `order`: Reihenfolge der Frames.
- `height`: Zielhöhe der Figur.
- `portraitRaws`: Rohbild je Porträtvariante.
- `propRaw`, `propHeight`: Rohbild und Höhe des Requisits.
- `clearPink`: blasse Magentareste in eingeschlossenen Lücken entfernen (nur für Figuren ohne echte Pinktöne).
- `note`: Begründung der Auswahl.

### Stand je Figur (Abnahme 2026-11-08)

Alle 22 Laufblätter: 512×512, 4×4, Zeilen S/W/O/N korrekt, Fußlinie überall y = 120, nichts abgeschnitten, keine Build-Warnungen. Erwachsene 91–96 px, Kinder 74–76 px. Porträts 512×512 WebP mit dunklem Grund und Neon-Rimlight, ohne Schrift. Erzeugt sind nur die Grundporträts; Ausdrucksvarianten (`--variants=happy,angry,…`) stehen noch aus. Einzige Ausnahme ist `ki-nexus-angry`.

| Figur | Laufblatt | Porträt | Rohbild-Fassung | Anmerkung |
| --- | --- | --- | --- | --- |
| blade | ok (93–96 px) | ok | v1 | – |
| raven | ok (93–96 px) | ok | v1 (Testblatt) | – |
| hunter | ok (94–96 px) | ok | v1 | Kopf im Laufblatt etwas groß, passt zur stämmigen Figur |
| dante | ok (95–96 px) | ok | v1 | Haare im Porträt eher zottelig als lockig |
| nyra | ok (92–96 px) | ok | v1 | Porträtkonturen etwas weicher als die Referenz |
| aria | ok (95–96 px) | ok | v1 | Prothesenarm in der Westzeile auf der Betrachterseite (wie gespiegelt), bei 96 px kaum sichtbar |
| vega | ok (93–96 px) | ok | v1 + `clearPink` | Magentareste zwischen Arm und Rumpf (Frames 0, 1, 13, 15) in der Abnahme entfernt; kleine Narbe auf der Wange im Porträt, die die Referenz nicht hat |
| alesa | ok (94–96 px) | ok | v1 | pinke Strähnen sind gewollt |
| xion | ok (92–96 px) | ok | v1 | grünes Auge auf seiner linken Gesichtsseite wie im Referenz-Brustbild (Prompttext sagt „right eye“) |
| seraphina | ok (94–96 px) | ok | v1 | – |
| sybella | ok (95–96 px) | ok | Porträt v2 | v1 war eine schwebende Büste |
| serenity | ok (91–96 px) | ok | Laufblatt v2, Porträt v2 | Laufblatt v1 oliv statt grasgrün; Dutt im Porträt lockerer als in der Referenz |
| collin | ok (93–96 px) | ok | v1 | – |
| delya | ok (95–96 px) | ok | v1 | Haare welliger als in der Referenz |
| ripper | ok (95–96 px) | ok | v1 | – |
| daria (Kind) | ok (74–76 px) | ok | v1 | Gurt im Laufblatt kaum sichtbar; Porträt wirkt etwa 12–13 Jahre |
| freya (Kind) | ok (75–76 px) | ok | v1 | 1 magentastichiges Randpixel (vernachlässigbar) |
| jakko (Kind) | ok (74–76 px) | ok | v1 | Geschirr im Laufblatt als einzelner Schultergurt |
| richter | ok (95–96 px) | ok | v1 | – |
| wache | ok (93–96 px) | ok | v1 | Dutt in der Seitenansicht eher Zopf; Porträt eher streng als gutmütig |
| barkeeper | ok (95–96 px) | ok | v1 | Katana durchgehend auf dem Rücken |
| kameramann | ok (94–96 px) | ok | v1 | leichter pinker Visierreflex in der Seitenansicht (Neon-Spiegelung) |
| ki-nexus | – (keins vorgesehen) | ok + `angry` | v1 | Hologramm mit Scanlines und Glitch, `angry` rot glühend |
| captain-kuschel | – (keins vorgesehen) | ok | v1 | Requisit `props/captain-kuschel.png` 42×47 px, sauber freigestellt |

### Bekannte Mängel

Keiner der folgenden Punkte stört bei Spielgröße. Sie werden erst angegangen, wenn eine Figur ohnehin neu entsteht.

- aria: Prothese in der Westzeile auf der falschen Körperseite. Bei Bedarf Zeile mit `--extra` neu erzeugen und über `rowFrom` einsetzen.
- vega: Narbe im Porträt, die die Referenz nicht hat.
- xion: Seite des grünen Auges folgt dem Referenz-Brustbild, nicht dem Prompttext. Den Prompttext bei Gelegenheit angleichen.
- daria, jakko: Gurt bzw. Geschirr im Laufblatt vereinfacht.
- wache: Dutt in der Seitenansicht wie ein Zopf.
- dante, delya, serenity: Frisur weicht leicht von der Referenz ab.
- Ausdrucksvarianten (happy, sad, angry …) fehlen für alle Figuren außer ki-nexus. Erzeugen mit `char_prompts.py portrait <id> --variants=happy,angry` und danach `char_build.py`.
- Kampfposen (`sprites/<id>-pose.png`, optional) gibt es noch nicht.

## Fotoreale Dialogbilder

Spricht eine Figur, zeigt der Dialog ein fotoreales Halbporträt (Kopf bis Hüfte, 2:3) mit Gesichtsausdruck. Vertrag: `docs/design.md` §6.2, Bildregeln wie §6.1. Die gemalten Porträts bleiben für kleine Ansichten.

### Pipeline

1. **Prompts** stehen in `scripts/art/photo_prompts.py`: Aussehen je Figur als echter Mensch (`look`), Randlichtfarbe, Signatur-Ausdruck, Ausdrucksliste, dazu die Pflichtbausteine `PHOTO_STYLE` (85 mm, geringe Schärfentiefe, Filmkorn, Low-Key mit Neon-Rimlight Violett/Blau/Pink, dunkler Grund mit Neon-Bokeh, Augenhöhe, Fokus aufs Gesicht, Rumpf vollständig bedeckt, altersgerecht, keine Schrift) und `FRAMING`. Jeder Lauf schreibt alle Standard-Prompts nach `design/assets/photos.json`. Die Zuordnung Figur → Kostümreferenz steht privat in `work/char_refs.json`.
2. **Identität:** Zuerst entsteht `neutral` aus gemaltem Porträt, Kostümbild und Stilreferenz `work/refs/style-keyscene-photoreal.webp` (nur Licht, Farbe und Kamera). Jeder weitere Ausdruck wird als Bearbeitung des fertigen `neutral`-Fotos erzeugt (erste Referenz). Der Prompt verlangt dabei dieselbe Person, Kleidung, dasselbe Licht und denselben Ausschnitt; nur Mimik und leichte Kopf- und Handhaltung ändern sich. Das gemalte Porträt dient nur als zweite Referenz für das Kostüm.
3. **Ausdrücke:**
   - Hauptfiguren: `neutral`, `freude`, `wut`, `trauer`, `ueberrascht`, `besorgt`, `signatur`.
   - Nebenfiguren richter, wache, barkeeper, kameramann: nur `neutral`, `wut`, `ueberrascht`. Bei barkeeper und kameramann ist das Gesicht verdeckt, die Ausdrücke laufen über Augen und Körpersprache.
   - ki-nexus: holografisches Gesicht mit Scanlines, Ausdrücke `neutral`, `freude`, `wut` (rot) und `signatur` (Glitch-Zerfall).
   - captain-kuschel: echtes Plüschtier, Ausdrücke `neutral`, `freude`, `trauer` über Ohrhaltung und Licht.
   - Figuren in `ROMANCE_ENABLED` zusätzlich `verlegen` und `zaertlich` (derzeit aria).
   - Kinder (daria, freya, jakko): deutlich 10–13 Jahre, harmlose Alltagsausdrücke.
4. **Rohbilder** 1024×1536 unter `output/imagegen/raw/photos/<id>-<expr>[suffix].png`. Neuversuche erhalten ein Suffix (`-v2` …) und werden in `scripts/art/photo_config/<id>.json` ausgewählt.
5. **Aufbereitung** mit `scripts/art/photo_build.py`:
   - optionaler Zuschnitt aus der Config, dann 2:3 (oben bündig, damit der Kopf bleibt);
   - LANCZOS auf 640×960, untere 22 % weich zu `#0a0812` abgedunkelt, WebP q82;
   - Ausgabe `game/public/assets/photos/<id>/<expr>.webp`, Manifest-Schlüssel `photo-<id>-<expr>`.
   - Fragmente je Figur liegen unter `design/assets/photos/<id>.json`, zusammengeführt in `design/assets/photos.manifest.json`. `scripts/build_manifest.mjs` übernimmt sie in `game/public/assets/manifest.json`.
   - Build-Daten (Quelle, Prüfsumme, Zuschnitt) stehen in `design/assets/photos-build/<id>.json`.
   - Kontaktbogen `output/qa/art/photos.png` (Figuren × Ausdrücke, Romanze-Spalten inklusive).
6. **Abnahme:** Kontaktbogen und jede Figur als Reihe ansehen, unklare Fälle in voller Größe prüfen. Zu prüfen:
   - dieselbe Person und Kleidung über alle Ausdrücke;
   - Ausdruck klar lesbar und von den anderen unterscheidbar;
   - passt zum gemalten Porträt;
   - Kamera auf Augenhöhe, Fokus aufs Gesicht, Rumpf bedeckt, keine Schrift;
   - Lichtstimmung, Ausschnitt und Bokeh einheitlich mit den übrigen Figuren.

### Befehle

```sh
# Prompts ansehen / Bilder erzeugen (neutral zuerst, vorhandene Rohbilder werden übersprungen, außer --force)
python3 scripts/art/photo_prompts.py list [ids …] [--expr=neutral,wut]
python3 scripts/art/photo_prompts.py <ids|all> [--expr=…] [--suffix=-v2] [--extra='Korrektur'] [--dry-run]

# Aufbereiten
python3 scripts/art/photo_build.py                     # alle Figuren, danach Kontaktbogen und Manifest
python3 scripts/art/photo_build.py <ids> --no-contact  # Teilbuild (parallel arbeitende Agenten)
python3 scripts/art/photo_build.py --contact           # nur Kontaktbogen
python3 scripts/art/photo_build.py --manifest          # nur Fragmente zusammenführen
cd game && npm run assets:manifest                     # Laufzeit-Manifest neu bauen
```

Nach Teilbuilds folgt am Ende immer ein vollständiger Lauf ohne IDs und danach `assets:manifest`.

`scripts/art/photo_config/<id>.json` (optional):

- `raws`: gewählte Rohbild-Fassung je Ausdruck. `raws.neutral` ist zugleich die Referenz für alle weiteren Ausdrücke.
- `extra`: dauerhafte Prompt-Zusätze je Ausdruck (`"*"` = alle).
- `crop`: Ausschnitt `[x0, y0, x1, y1]` im Rohbild.
- `note`: Begründung der Auswahl.

### Stand je Figur (Abnahme 2026-11-08)

Alle 24 Figuren sind fertig: 147 Bilder, 640×960 WebP, je 25–106 KB, zusammen etwa 6,5 MB. Alle stehen im Laufzeit-Manifest (`build_manifest.mjs --check --strict` ohne Befund). Licht, Ausschnitt und Bokeh sind über alle Figuren einheitlich. Die Identität bleibt bei jeder Figur über alle Ausdrücke erhalten.

| Figur | Ausdrücke | Neu erzeugt | Anmerkung |
| --- | --- | --- | --- |
| blade | 7 | – | Fellmantel macht die Dateien größer (90–106 KB) |
| raven | 7 | – | Musterfigur |
| hunter | 7 | – | signatur: Augenrollen über die Sonnenbrille |
| dante | 7 | – | |
| nyra | 7 | – | |
| aria | 9 (mit `verlegen`, `zaertlich`) | – | Bild endet knapp unter der Hüfte (Gürtel sichtbar) |
| vega | 7 | signatur-v2 | v1 war von wut kaum zu unterscheiden; v2 zeigt ruhige Zielkonzentration mit glatter Stirn |
| alesa | 7 | – | |
| xion | 7 | – | Haarspitzen berühren teils den oberen Rand |
| seraphina | 7 | – | |
| sybella | 7 | – | |
| serenity | 7 | – | signatur etwas näher und seitlicher aufgenommen |
| collin | 7 | – | Sonnenbrille durchgehend, Ausdruck über Brauen und Mund |
| delya | 7 | – | |
| ripper | 7 | – | |
| daria | 7 | neutral-v2 | v1 wirkte zu alt; `extra["*"]` hält das Kindergesicht |
| freya | 7 | – | |
| jakko | 7 | – | |
| richter | 3 | – | |
| wache | 3 | – | |
| barkeeper | 3 | – | Glitch-Muster mit schriftähnlichen Glyphen, aber ohne lesbares Wort (wie im gemalten Porträt) |
| kameramann | 3 | – | Gesicht verdeckt, Ausdruck über Körpersprache |
| ki-nexus | 4 | neutral-v3 | v1 falsches Gesicht, v2 gemalt statt fotoreal; freude-v2 verworfen (kaum von neutral zu unterscheiden), v1 bleibt |
| captain-kuschel | 3 | freude-v2 | v1 zeigte ein anderes Stofftier mit aufgestellten Ohren und offenem Maul; v2 ist dasselbe Plüschtier |

### Bekannte Mängel

- Im Hintergrund ist teils ein feines Gitter zu sehen, das wie unscharfer Maschendraht wirkt. Bei Spielgröße stört es nicht.
- ki-nexus/freude wirkt eher glatt-freundlich als kalt.
- Die Fotos für die Spielfigur (`player-<look>`, §6.2) fehlen noch.

## Musik

Verbindlich ist der Musikvertrag in `docs/design.md` §7. Alle Stücke sind eigene Instrumentals aus Lyria 3.5 (Gemini API, `models/lyria-3.5:generateContent`). Die Prompts nennen nur Genre, Tempo, Instrumente und Stimmung. Echte Songtitel, Künstler und die Lieder aus dem Theaterstück kommen darin nicht vor. Stimmen sind ausgeschlossen. Einzige Ausnahme sind gedämpfte, wortlose Vocal-Chops im Club (`high-voltage`).

**SynthID:** Lyria versieht jede Ausgabe mit einem unhörbaren SynthID-Wasserzeichen. Es bleibt auch nach Schnitt, Lautheitsnormierung und AAC-Kodierung erhalten. Die Stücke sind damit als KI-generiert erkennbar. Das ist gewollt und darf nicht entfernt werden.

### Pipeline

1. **Katalog** `scripts/music/tracks.py`: id, Art (`loop` oder `stinger`), Tempo-Vorgabe, Einsatzort, Schleifen- bzw. Stingerlänge und Prompt.
2. **Erzeugung** mit `scripts/music/generate.py`:
   - Der Schlüssel kommt nur zur Laufzeit aus dem Schlüsselbund (`security find-generic-password -s google-api-key -w`). Er geht per stdin als curl-Konfiguration an curl und steht nie in Argumenten, Dateien oder Logs.
   - Der Lauf ist inkrementell. Rohdateien landen in `output/music/cache/<id>.mp3`, dazu `<id>.json` mit Prompt, Prompt-Hash und Abschnittsmarken.
   - Zwischen zwei Stücken liegen 8 s Pause.
   - HTTP 429 mit Tageslimit beendet den Lauf, der nächste Lauf macht weiter. Andere 429 warten auf das `retryDelay` der API.
   - 5xx wird gestaffelt wiederholt. 400/401/403/404 brechen mit Meldung ab.
   - Ändert sich ein Prompt, gibt der Lauf einen Hinweis aus. Neu erzeugt wird erst mit `--force`.
   - Lyria liefert je Prompt etwa 2–3 min MP3 (192 kbit/s, 44,1 kHz). Für Stinger kommt etwa 1 min.
3. **Aufbereitung** mit `scripts/music/build.py` (numpy + ffmpeg):
   - **Takt:** Die Onset-Hüllkurve kommt aus einer STFT (48 Log-Bänder). Das Tempo ergibt sich aus der Autokorrelation, mit der Katalog-BPM als Startwert, danach Feinsuche über Tempo und Phase. Lyria hält das Tempo nicht immer genau ein. Gemessen werden z. B. 106 statt 100 BPM oder 127 statt 124 BPM.
   - **Schleifenpunkt:** Gesucht werden Start s auf einem Taktanfang (im ersten Teil nach dem Intro) und Ende e = s + n Takte, mit exakt ganzen Takten im gemessenen Tempo. Bewertet wird die Ähnlichkeit der taktsynchronen Log-Bandenergien und Chroma je zwei Takte vor und nach der Naht. Vielfache von 4 Takten und längere Schleifen erhalten einen kleinen Bonus. Danach folgt eine Kreuzkorrelation der Wellenform (±11 ms).
   - **Crossfade:** Er liegt kurz vor dem Schlag, damit der Einsatz selbst ungeblendet bleibt. Bei passender Wellenform dauert er 80 ms (linear), sonst 0,25–0,5 s mit konstanter Leistung (Pads, Flächen).
   - **Dateiaufbau:** Die Datei ist genau ein Schleifendurchlauf und wiederholt sich als Ganzes. Ihr Anfang liegt innerhalb des ersten Schlags auf einer fast stillen Stelle, damit der AAC-Encoder dort keinen Klick erzeugt.
   - **Lautheit** (zweistufig): `loudnorm` misst auf drei aneinandergehängten Durchläufen und wendet die Normierung dann linear an. Übernommen wird der mittlere Durchlauf. Der Versatz wird per Kreuzkorrelation bestimmt. Eine Restabweichung nach dem Encoder wird als feste Verstärkung ausgeglichen. Bei True-Peak-Überschwingern sitzt stufenweise ein `alimiter` davor.
   - **Kodierung:** AAC-LC 96 kbit/s, 44,1 kHz Stereo, `+faststart`. Verwendet wird der eingebaute ffmpeg-Encoder `aac`. Er schreibt eine exakte Edit-Liste, sodass die dekodierte Länge samplegenau gleich der Schleife ist. `aac_at` füllt auf 1024er-Blöcke auf, das ergäbe eine Lücke an der Naht.
   - **Prüfung:** Lautheit und True Peak (ebur128), Länge und dekodierte Samplezahl. Die Naht wird zirkulär an zwei Stellen geprüft: am Dateiwechsel und an der Überblendung. Pegel- und Spektralsprung dürfen höchstens so groß sein wie das 90. Perzentil des Stücks oder 125 % des natürlichen Sprungs an derselben Stelle der Quelle. Für die Flankensteilheit (Klick) gilt das 99,9. Perzentil.
   - **Stinger:** Die Stille am Anfang wird entfernt, das Ende liegt auf einem Schlag im Längenfenster, danach folgt eine kurze Ausblende. Stinger haben keine Schleife.
4. **Ausgabe:**
   - `game/public/assets/music/<id>.m4a`
   - `game/public/assets/music/manifest.json` mit `id`, `file`, `kind`, `loop`, `duration`, `samples`, `loopStart`, `loopEnd`, `lufs`, `bpm` und `bytes`. Bei Schleifen gilt `loopStart = 0` und `loopEnd = duration = samples / 44100`. Im Spiel `AudioBufferSourceNode.loop = true` ohne `loopStart`/`loopEnd` setzen, also den ganzen Puffer schleifen. Chrome dekodiert die Dateien samplegleich zu ffmpeg (Länge und Inhalt geprüft); Safari ist ungeprüft. True Peak höchstens −1,5 dBTP: Der Build regelt nach und meldet jede Überschreitung.
   - Bericht `output/music/build.json` mit Quellausschnitt, Tempo, Taktzahl, Crossfade und Nahtwerten.
   - Hörseite `output/music/review.html`.
5. **Abnahme** durch Abhören von `output/music/review.html` (im Browser öffnen). Je Stück gibt es einen Player mit Schleife und die Schaltfläche „Naht anhören“, die 4 s vor das Ende springt. Manche Browser setzen beim `<audio loop>` kurz aus, im Spiel läuft die Schleife über WebAudio.

### Befehle

```sh
python3 scripts/music/generate.py --dry-run          # zeigt, was fehlt
python3 scripts/music/generate.py                    # alle fehlenden Stücke erzeugen
python3 scripts/music/generate.py --only kampf,boss --force   # gezielt neu erzeugen (z. B. nach Prompt-Änderung)
python3 scripts/music/build.py                       # aufbereiten (inkrementell), Manifest, Bericht, Hörseite
python3 scripts/music/build.py --only kampf --force  # ein Stück neu bauen
python3 scripts/music/build.py --analyze titel       # Tempo und beste Schleifenkandidaten anzeigen
```

### Katalog

| id | Art | Einsatz |
| --- | --- | --- |
| `titel` | Schleife | Titelbildschirm, Abspann (Synthwave-Hymne) |
| `unterstadt-tag` | Schleife | Unterstadt morgens und tagsüber (Retro-Synth mit Funk-Bass) |
| `unterstadt-nacht` | Schleife | Unterstadt abends und nachts, Rostregen (Pads, langsamer Puls) |
| `high-voltage` | Schleife | Club innen, draußen per Tiefpass gedämpft (Electro-House, gedämpfte Vocal-Chops) |
| `dantes-werkstatt` | Schleife | Dantes Werkstatt, Crew-Quartier (Lo-Fi-Funk, Rhodes, Vinyl-Knistern) |
| `dante-melancholie` | Schleife | Dantes Schallplatte in traurigen Szenen (Piano und Synth) |
| `mittelring` | Schleife | Stufenplatz, Glasarkaden, Eisenhof außen (City-Pop) |
| `oberstadt` | Schleife | Chrome-Boulevard, Himmelsgarten, Digitech-Areal (kühler Corporate-Synth) |
| `quantum-labor` | Schleife | Quantum-Campus innen, Labor, Server-Kern (Arpeggios, angespannt) |
| `releaseparty` | Schleife | Quantum-Releaseparty (Electro-Pop) |
| `ki-nexus` | Schleife | Begegnungen mit der KI, Datentunnel (gläserne Synth-Chöre) |
| `kanalisation` | Schleife | Kanal-Sammler, Pumpwerk Sieben (Ambient mit Tropfen-Rhythmus) |
| `oednis` | Schleife | Staubstraße, Aussiedlerhof, Funkturm-Ruine, Glasdünen (Wüsten-Synth-Western) |
| `gefaengnis` | Schleife | Zellentrakt, Gerichtssaal (karg, metallisch) |
| `flutmauer` | Schleife | Flutmauer, Brackbucht (sehnsüchtig, weit) |
| `schleichen` | Schleife | Schleichaufträge, Einbruch |
| `kampf` | Schleife | Rundenkampf (Darksynth) |
| `boss` | Schleife | Bosskämpfe |
| `meer` | Schleife | Das Meer, Epilog, Finale |
| `herz-ereignis` | Stinger | Beginn eines Herz-Ereignisses |
| `nachrichten-jingle` | Stinger | NX-1-Nachrichten im Stadt-TV |
| `sieg-stinger` | Stinger | Kampf gewonnen |
| `quest-stinger` | Stinger | Quest abgeschlossen |

Budget gesamt: höchstens 30 MB. Stand 2026-11-08: 23 Stücke, 17,6 MB (16,8 MiB), alle Nahtprüfungen bestanden. Die Abnahme durch Abhören steht noch aus.
