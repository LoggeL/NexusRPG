# Nexus – Das RPG · Technik, Systeme und Produktionsvertrag

Verbindliche technische Grundlage (Stand 08.11.2026). Inhalte (Zonen, Figuren, Quests, Checks, Gegenstände, Gegner) stehen in `docs/world.md`; bei Widerspruch gilt für Technik und Regeln dieses Dokument, für Inhalte `world.md`.

Quelle: Theaterstück „Nexus“ (Kolpingtheater Ramsen, Sommerstück 2024), Drehbuch unter `work/source/nexus-drehbuch.txt` (privat, nie in Git, nie in großen Blöcken zitiert). Im Spiel nur Rollennamen, nie Darstellernamen.

## 1. Spielgefühl

Open-World-Rollenspiel im Browser: Die selbst erstellte Spielfigur kommt neu in Hunters Crew und erkundet die Stadt Noxius im Jahr 2086. Gemalte Draufsicht-Karten im Stil der Kostümfiguren aus der TheaterApp, scrollende Kamera, Figuren mit Laufzyklen. Gespräche mit Porträts und sichtbaren Attribut-Checks („[Technik 6] Ich sehe mir den Chip an.“). Beziehungen mit Herzen, Geschenken und Tagesablauf. Rundenbasierte Rasterkämpfe mit der Crew. Der Hauptstrang folgt dem Stück nur lose; der Schwerpunkt liegt auf der offenen Welt mit Nebenquests, Aufträgen, Händlern und Aktivitäten. Ton: Cyberpunk mit viel Humor, familienfreundlich.

**Zielgruppe:** Erwachsene (18+). Dialoge und Hintergrundstimmen dürfen ruppig sein, mit harten Beleidigungen und Flüchen (nicht gegen Herkunft, Hautfarbe, Religion, Behinderung oder sexuelle Identität). Romanzen im Text flirtig und erwachsen: Anzüglichkeiten, Küsse, eine gemeinsame Nacht nur angedeutet (Abblende, nächster Morgen), nie ausgeschrieben. Bilder tragen Darstellergesichter und bleiben deshalb nie sexualisiert. Straßenkinder nur Freundschaft.

## 2. Technik

- Phaser 3.90, TypeScript strict, Vite, Vitest, Playwright. Node 22+.
- **Logische Auflösung 960×540**, `pixelArt: false`, `antialias: true`, Scale FIT, schwarzer Rand. Kamera folgt der Spielfigur mit Kartengrenzen (sanftes Lerp, Totzone klein).
- **Karten** haben eigene Pixelmaße (`MapDef.size`, Standard 1536×1024 = native Imagegen-Größe). Alle Kartenkoordinaten in Kartenpixeln. Innenräume dürfen kleiner sein (z. B. 1024×768 oder 1536×1024 mit großem Rand); ist eine Karte kleiner als der Sichtbereich, wird sie zentriert.
- Texte, HUD, Menüs und Dialoge als DOM-Overlay (gut lesbare Schrift ≥ 16 px; Überschriften in einer Cyberpunk-Display-Schrift, lokal mitgeliefert, z. B. `@fontsource/orbitron` oder `@fontsource/chakra-petch`, Fließtext `@fontsource/atkinson-hyperlegible`). Neon-Farben: Cyan `#3ef2ff`, Pink `#ff3fa4`, Violett `#9b5cff`, Hintergrund `#0b0716`.
- Sprache: Deutsch mit korrekten Umlauten.
- Steuerung: WASD/Pfeile bewegen, Klick/Tippen setzt Laufziel (Pfadsuche), E/Leertaste/Enter interagiert bzw. setzt Dialoge fort, I Inventar, C Charakter (Attribute, Perks, Cyberware), Q Questlog, R Beziehungen, M Stadtkarte (Schnellreise über U-Bahn-Stationen), P Telefon/Nachrichten, Esc Menü/Schließen, F1 Kollisionsansicht, F2 Debug-Menü. Touch: virtueller Stick, Aktionsknopf, Menüknöpfe.
- Speicherung: Autosave in `localStorage` nach jeder Zustandsänderung (gedrosselt), drei Speicherplätze, Export/Import als JSON mit Versions- und Strukturprüfung. Ungültige Importe verändern die laufende Partie nicht. Spielstandversion 2 (Charakter-Baukasten, §3.1a); Version-1-Stände werden beim Laden und Importieren migriert statt wegen der Version abgelehnt.
- URL-Einstiege für Tests: `?scene=title`, `?map=<mapId>`, `?act=<1..3>`, `?battle=<encounterId>`, `?time=<morgen|tag|abend|nacht>`, `?newchar` (Charaktererstellung), `&debug`, `&seed=<n>`.
- Test-Hook: `window.__nexus` (lesend plus Debug-Befehle: warp, giveItem, setAttr, addHearts, setTime, startBattle, winBattle) für Playwright.

### Architektur (wie InselRPG/Selantis)

| Verzeichnis `game/src/` | Verantwortung | Darf importieren |
| --- | --- | --- |
| `modules/` | Reine Regeln: Kampagnenzustand, Spielfigur (Attribute, XP, Perks, Cyberware), Checks, Inventar und Handel, Beziehungen, Tageszeit und Tagesablauf, Quests, Aufträge, Kampf (Raster, Aktionen, KI), Dialogablauf, Speicherformat, Navigation/Pfadsuche | nur andere `modules/` |
| `content/` | Karten, Dialoge, Figuren, Tagesabläufe, Quests, Checks, Gegenstände, Händler, Begegnungen, Gegner, Cutscenes, Nachrichten, Romanze-Schalter | nur `import type` aus `modules/` und eigene Dateien |
| `platform/` | Speicher, Eingabe, Audio, Asset-Laden, Einstellungen | `modules/` |
| `presentation/phaser/`, `presentation/dom/` | Szenen (Titel, Charaktererstellung, Erkundung, Kampf, Cutscene, Ende), Sprites, DOM-Overlays | alles außer `app/` |
| `app/` | Komposition, Szenenregistrierung, URL-Einstiege, Test-Hook | alles |

`scripts/check_architecture.mjs` prüft diese Grenzen statisch.

## 3. Regeln

### 3.1 Spielfigur

- Erstellung: Name (frei, 2–16 Zeichen), Aussehen (Charakter-Baukasten §3.1a; die früheren 6 festen Looks sind jetzt Vorlagen), Herkunft (`origins` in `world.md`, je mit Startbonus, Startgegenständen und exklusiven Dialogoptionen über Bedingung `{ origin: id }`), Pronomen-Anrede im Text vermeiden (Dialoge sprechen die Spielfigur mit Namen oder „du“ an).
- **Attribute** `technik`, `koerper`, `reflexe`, `ausstrahlung`, `strasse`: Start je 3, dazu 4 freie Punkte bei der Erstellung, Maximum 10. Herkunftsbonus +1 auf ein Attribut (darf 10 nicht überschreiten).
- **Stufen**: XP-Schwellen kumulativ `100 × n × (n+1) / 2` (Stufe 2 bei 100, Stufe 3 bei 300, Stufe 4 bei 600 …), Höchststufe 20. Je Stufe +1 Attributpunkt und +1 Perkpunkt. LP-Maximum = 20 + 4 × Körper + 2 × Stufe.
- **Perks**: je Attribut 4 Perks mit Mindestwert im Attribut (z. B. 4/6/8/10), kosten 1 Perkpunkt, wirken passiv (Check-Bonus in bestimmten Kontexten, Kampffähigkeit, Händlerrabatt, Herz-Bonus bei Geschenken …). Definition in `content/perks.ts`.
- **Cyberware**: Slots `kopf`, `augen`, `arme`, `beine`, `nervensystem`, `haut`. Jedes Teil gibt Attribut- oder Kampfboni und ggf. eine Kampffähigkeit. Einbau nur bei einem Ripperdoc (Dante gratis ab 2 Herzen, sonst Gebühr). Cyberware-Boni zählen bei Checks mit (sichtbar in der Aufschlüsselung).

### 3.1b Fertige Spielfigur Vex

Vex ist versteckt (Nutzerentscheidung 09.11.2026): Die Erstellung beginnt direkt im Baukasten; erst wenn der eingegebene Name „vex“ enthält (Groß-/Kleinschreibung egal), erscheint unter dem Namensfeld **„Als Vex spielen“** (`world.md` §2.1a). `PlayerState.preset = 'vex'`: Name, Herkunft, Attribute und Perk sind fest, die Laufgrafik ist das gemalte Blatt `sprites/vex-walk.png` statt der gebackenen Baukasten-Textur; der Baukasten (auch beim Stylisten) ist für Vex gesperrt. Charakterbogen und Dialogzeilen der Spielfigur zeigen ihre Fotos (`photo-vex-<ausdruck>`); auf Fotos, Laufblatt und Tafeln trägt sie rechts den graphitschwarzen Ripper-Ratenarm (Hydraulik am Ellbogen, cyanfarbene Lichtnähte, Armbänder am Metallhandgelenk, links fingerloser Handschuh; `world.md` §2.1a), nie mit Arias silbernem Spiralfeder-Arm links verwechseln. Bedingung `{ playerIs: 'vex' }` für eigene Antwortvarianten. Die Weltfigur `vex-schrapnell` wird dann nicht platziert. **Ausnahme zu „Kein Bild der Spielfigur“ (§3.1a):** Im Strang Vex × Aria „Nicht anhalten“ (`world.md` §4.7, Tafeln `rom-vexaria-*`, nur mit `{ playerIs: 'vex' }`) ist Vex auf fotorealen Tafeln (§6.1) sichtbar und erkennbar (Gesichtsreferenz `vex-neutral`, beobachtende Kamera statt Ich-Perspektive) – nie sexualisiert, beide immer vollständig bekleidet, „Morgen danach“ nur mit Dingen, der Kuss nur als Gegenlicht-Silhouette in der Totale ohne Gesichtsreferenzen (`rom-vexaria-kuss` ersetzt für Vex `rom-aria-kuss`); für die Baukasten-Spielfigur gilt die Ausnahme nie.

### 3.1a Charakter-Baukasten

Ersetzt die 6 festen Looks (Entscheidung des Nutzers, 08.11.2026). Alles Gewählte ist auf dem Laufblatt in der Welt sichtbar. Die Spielfigur ist volljährig (Anfang zwanzig).

**Kein Bild der Spielfigur.** Reine Ich-Perspektive: kein Porträt, kein Foto, kein Avatar aus dem Laufblatt. Dialog-UI zeigt für die Spielfigur nur den Namen (Namensschild in `colorA`), HUD/Menüs ein Monogramm (Anfangsbuchstabe im Kreis, `colorA`). Fotoreale Szenen (§6.1) zeigen die Spielfigur nie – einzige Ausnahme ist der Kuss am Höhepunkt der Aria-Romanze: dort ist sie eine anonyme, dunkle Gegenlicht-Silhouette vor dem Sonnenuntergang, ohne erkennbare Merkmale und unabhängig vom Baukasten. Dazu kommen die Vex-Tafeln `rom-vexaria-*` (nur fertige Spielfigur Vex, §3.1b; beobachtende Kamera, Vex erkennbar, Kuss `rom-vexaria-kuss` als Silhouette ohne Gesichtsreferenz); für die Baukasten-Spielfigur bleibt es bei der einen Silhouetten-Ausnahme.

**Datenvertrag** (wird in `contracts.ts` ergänzt; `PlayerState.look` und `LookDef` bleiben unverändert erhalten):

```ts
export type BodyId = 'schmal' | 'mittel' | 'kraeftig';
export type Side = 'links' | 'rechts';
export interface PlayerAppearance {
  v: 1;                      // Schema des Aussehens (eigene Migration über PART_ALIASES)
  body: BodyId;
  skin: SkinId;              // 'haut-1' … 'haut-8'
  face: FaceId;              // 'gesicht-1' … 'gesicht-6'
  hair: HairId;              // ≥ 14, inkl. 'haar-glatze'
  hairColor: HairColorId;    // ≥ 12 inkl. Neon; färbt auch Bart und Brauen
  top: PartId;               // Pflicht, kein „ohne“
  jacket: PartId;            // inkl. 'jacke-keine'
  pants: PartId;             // Pflicht
  shoes: PartId;
  colorA: PaletteColorId;    // Hauptfarbe Kleidung
  colorB: PaletteColorId;    // Zweitfarbe Kleidung (Säume, Streifen, Sohlen, Futter)
  cyber: { armL: boolean; armR: boolean; eyes: boolean; facePlate: boolean; neckCable: boolean;
           leg: 'keins' | Side; glow: PaletteColorId };   // glow: Augen, Cyber-LEDs, Neon-Tattoo
  tattoo: TattooId;          // inkl. 'tattoo-keins'
  acc: { glasses: 'keine' | 'rund' | 'sonnenbrille' | 'visier'; mask: 'keine' | 'tuch' | 'atemmaske';
         chain: boolean; cap: 'keine' | 'basecap' | 'muetze'; headphones: boolean };
}
// PlayerState: appearance: PlayerAppearance (neu); CharacterInput: appearance (neu), look = gewählte/letzte Vorlage.
// LookDef: appearance?: PlayerAppearance (Vorlagen), sprite = 'player-walk', portrait = '' (ungenutzt).
```

| Kategorie | Auswahl (IDs, Namen deutsch in `content/appearance.ts`) |
| --- | --- |
| Körperbau (3) | `schmal`, `mittel`, `kraeftig` – gleiche Größe und Kopfposition, nur Rumpf- und Beinbreite unterscheiden sich |
| Hautton (8) | `haut-1` … `haut-8` von sehr hell bis sehr dunkel, Mitteltöne `#f3d6c4 #e8bfa0 #d9a27e #c68a62 #a86d48 #8a5636 #6b3f27 #4a2a1a` |
| Gesicht (6) | `gesicht-1` schlicht, `-2` markante Brauen, `-3` Sommersprossen, `-4` Dreitagebart, `-5` Vollbart, `-6` Narbe und Lidschatten |
| Frisur (17) | `haar-glatze`, `-buzz`, `-undercut`, `-irokese`, `-sidecut`, `-pixie`, `-bob`, `-locken-kurz`, `-wuschel`, `-afro`, `-schulterlang`, `-lang-glatt`, `-lang-locken`, `-pferdeschwanz`, `-zwei-zoepfe`, `-dutt`, `-dreads` |
| Haarfarbe (14) | `schwarz`, `dunkelbraun`, `kastanie`, `kupfer`, `rot`, `dunkelblond`, `blond`, `platin`, `grau`, `weiss`, `neon-pink`, `neon-cyan`, `neon-violett`, `giftgruen` |
| Oberteil (8) | `oben-tshirt`, `-tanktop`, `-hemd`, `-rollkragen`, `-hoodie`, `-netzshirt`, `-streifenpulli`, `-gurtshirt` (Shirt mit Gurtgeschirr) |
| Jacke (8) | `jacke-keine`, `-bomber`, `-leder`, `-langmantel`, `-jeans` (Aufnäher), `-kapuze` (Leuchtnähte), `-weste`, `-sakko` |
| Hose (7) | `hose-cargo`, `-jeans`, `-flicken`, `-leder`, `-anzug`, `-rock` (kurzer Rock mit Strumpfhose), `-overall` (Ärmel um die Hüfte) |
| Schuhe (5) | `schuhe-sneaker` (Sohle `colorB`), `-hightops`, `-kampfstiefel`, `-plateau`, `-halbschuhe` |
| Kleidungsfarben (20) | `schwarz`, `anthrazit`, `grau`, `weiss`, `sand`, `oliv`, `leder`, `wein`, `rot`, `orange`, `senf`, `waldgruen`, `petrol`, `marine`, `jeansblau`, `chrom`, `neon-pink`, `neon-cyan`, `neon-violett`, `neon-gruen` |
| Cyberware (sichtbar) | Arm links, Arm rechts (Unterarm + Hand, Chrom), Augen-Leuchten, Gesichtsplatte (Wange/Kiefer), Halskabel (Nacken, Stecker), Bein links/rechts (Schienbein) – rein kosmetisch, unabhängig von Spielwerten-Cyberware |
| Tattoo (5) | `tattoo-keins`, `-wange` (Schaltkreis), `-hals` (Barcode), `-arm` (Ärmel links), `-neonlinien` (Arme und Hals, leuchten in `cyber.glow`) |
| Accessoires | Brille (rund, Sonnenbrille, Visier), Maske (Tuch mit Grinsen, Atemmaske), Kette, Kappe (Basecap, Mütze), Kopfhörer |

**Kombinationsregeln** (`modules/appearance` → `normalize(a)`, im Editor als ausgegraute Option mit Hinweis; Wahl der gesperrten Option legt die andere ab und meldet „… abgelegt“): Maske ⟂ Gesichtsplatte (beide unteres Gesicht). Kappe schneidet die Frisur über ihre Clip-Maske ab (Irokese, Dutt usw. verschwinden darunter). Sonnenbrille und Visier verdecken das Augen-Leuchten (erlaubt, Hinweis). Glatze: Haarfarbe färbt nur Bart/Brauen. Kopfhörer liegen über Kappe/Mütze. Kette liegt unter der Jacke. Cyber-Arme/-Bein liegen über der Kleidung (Ärmel/Hosenbein wirken abgeschnitten). Oberteil und Hose sind Pflicht.

**Versionierung und Migration:** `GameState.version` 1 → 2. Beim Laden/Import von Version 1: `appearance = preset(look)`; die Vorlagen-IDs entsprechen den alten Look-IDs (`look-neonbomber` …, `world.md` §2.3), unbekannte Looks (z. B. `test-a`) → `look-neonbomber`. Version 2: Struktur streng geprüft (ungültig → Import abgelehnt), unbekannte Teil-IDs dagegen über `PART_ALIASES` umbenannt oder je Feld durch den Vorlagenwert ersetzt (Hinweis im Ladedialog), damit spätere Kunständerungen keine Stände zerstören. Kleidung aus dem Inventar (`kleidung`, z. B. Laborkittel, Staubmantel) darf über `ItemDef.wear?: Partial<Pick<PlayerAppearance, 'top' | 'jacket' | 'pants' | 'shoes'>>` Teile überlagern, solange sie ausgerüstet ist; `appearance` selbst bleibt unverändert (Schalter „Ausrüstung am Körper zeigen“, Standard an). Solche Sonderteile tragen im Katalog `hidden: true` und erscheinen nicht im Editor.

**Darstellung (Laufzeit):**

- Zusammensetzung in `presentation/appearance/compose.ts` (reines Canvas 2D, ohne Phaser; nutzt Editor-Vorschau und Spiel): lädt nur die benötigten Teile (`Image`-Promise-Cache), färbt sie ein, legt sie in fester Reihenfolge (§6.3) übereinander und liefert ein 512×512-Canvas mit 4×4 Zellen à 128, Zeilen S/W/O/N, Fußanker (64, 120), Figurenhöhe ~96 px – exakt wie jedes andere Laufblatt.
- Phaser: Das Ergebnis wird **einmalig** in die Textur `player-walk` gebacken (`textures.addCanvas`, 16 Frames, Animationen `walk-s/w/e/n` 8 fps und `idle-*` wie `char_build.walk_entry`). Bei Änderung (Editor, Stylistin, Schrauber, Kleidungswechsel) wird dasselbe Canvas neu gezeichnet und `refresh()`; Frames und Animationen bleiben gültig. Neu gebacken wird nur, wenn sich `appearanceKey(a)` (stabile Serialisierung inkl. Ausrüstungs-Überlagerung) ändert. Bis die Teile geladen sind: Platzhalter-Silhouette. Ziel: Backen < 30 ms nach dem Laden.
- Einfärbung über Farbmasken mit Verlaufskarte (Gradient Map): Jedes Teil hat ein Graustufenbild für einfärbbare Bereiche und eine Maske gleicher Größe. Maskenfarben: Rot = `colorA`, Grün = `colorB`, Blau = Haarfarbe, Gelb = Hautton, Magenta = `cyber.glow`, Schwarz/transparent = feste Farbe (Metall, Knöpfe, Augen). Pixel in einer Region: Helligkeit L (0…1) → Verlauf aus drei Stufen der Palettenfarbe (dunkel bei 0, Mittelton bei 0,5, hell bei 1); Alpha bleibt. Palette je Farbe `{ mid, dark?, light? }`; fehlend: `dark = mix(mid, #0b0716, 0,6)`, `light = mix(mid, #ffffff, 0,45)` (Neon: 0,7). Eingefärbte Teile werden je (Teil, Körper, Farben) zwischengespeichert, damit der Editor flüssig bleibt.

**Editor-UI** (DOM-Overlay, Szene Charaktererstellung und Laden-Modus):

- Große Vorschau (Desktop links ≥ 40 % der Breite, Figur ×3 ≈ 290 px hoch; Mobil oben ~40 vh) auf dunklem Neon-Grund mit Bodenlinie; läuft standardmäßig im Kreis (Laufen/Stehen umschaltbar), drehbar per Pfeilknöpfen ⟲/⟳, Wischen/Ziehen auf der Vorschau und Tasten Q/E.
- Kategorien-Reiter: Körper (Körperbau, Hautton, Gesicht) · Haare · Oberteil · Jacke · Hose · Schuhe · Farben · Cyberware · Extras (Tattoo, Accessoires). Optionen als große Kacheln (≥ 44 px) mit deutschem Namen; Farben als runde Farbfelder mit Namen als Tooltip/Bildschirmleser-Label. Jede Wahl wirkt sofort auf die Vorschau.
- Knöpfe: **Zufall** (alles; mit Schloss je Kategorie zum Festhalten; ausgewogene Gewichte: Jacke „keine“ 25 %, je Cyberteil 15 %, je Accessoire 20 %, Tattoo 50 % keins; `colorB` mit 50 % aus den Neonfarben), **Vorlagen** (8, `world.md` §2.3), **Rückgängig/Wiederholen** (Stapel 50; jede Wahl, Zufall und Vorlage ist ein Schritt), **Zurücksetzen**.
- Tastatur: Bild↑/Bild↓ Reiter, ↑/↓ Zeile, ←/→ Option, Q/E drehen, R Zufall, Strg+Z/Strg+Y, Enter weiter, Esc zurück; sichtbarer Fokusrahmen. Maus und Touch gleichwertig.
- **Später ändern:** Stylistin Gina (`stufenplatz`): Frisur 40 Cr, Haarfarbe 30 Cr, Gesicht/Bart 30 Cr, Tattoo 60 Cr (entfernen 30 Cr), Accessoire 15 Cr je Teil, Kleidungsteil oder Kleidungsfarbe 20 Cr je Änderung. Schrauber (Dante, Ripper, Mira Lötzinn): sichtbare Cyberware 50 Cr je Teil (Dante ab ♥2 gratis), Leuchtfarbe 10 Cr. Körperbau und Hautton bleiben nach der Erstellung fest. Laden-Modus: nur die erlaubten Reiter, laufende Kostensumme, „Bezahlen (X Cr)“ bzw. „Abbrechen“ (setzt zurück); unveränderte Felder kosten nichts.

### 3.2 Gesprächs- und Welt-Checks (ohne Würfel)

- `CheckDef`: `attribute`, `threshold` (3–10), optional Boni (Perks, Gegenstände, Cyberware, Beziehung, Herkunft). Wert = Attribut + Boni. Bestanden, wenn Wert ≥ Schwelle.
- Anzeige im Dialog: Option mit Präfix `[Technik 6]` in Attributfarbe; erfüllt → wählbar (Erfolgsfolgen), nicht erfüllt → ausgegraut, nicht wählbar, Tooltip zeigt fehlende Punkte. Nicht jede Check-Option muss ausgegraut erscheinen: `hiddenIfFailed` blendet sie aus.
- Welt-Checks an Hotspots (Tür hacken, Kiste aufbrechen, Gitter hochstemmen) nutzen dieselbe Logik; ohne passenden Wert bleibt immer ein anderer Weg (Schlüssel, Auftrag, Kampf, Bestechung). **Kein Zustand darf das Spiel unlösbar machen.**
- Jeder bestandene Check gibt einmalig XP (Standard 15 + 5 × Schwelle).

### 3.3 Beziehungen (Stardew-Prinzip)

- Je Figur `points` von −1000 bis 1000. Herzen = `floor(points / 100)` (0–10). Unter −200: **Rivalität** (Stufen −2 … −10, eigener Strang, Dialog- und Questfolgen).
- Täglich einmal ansprechen: +20 (nur wenn ≥ 0). Geschenk (höchstens 1 pro Tag und Figur, 2 pro Woche): liebt +80, mag +45, neutral +20, mag nicht −20, hasst −40. Gesprächswahlen und Quests ändern Punkte (`{ relation: id, delta }`).
- Kein Abbau durch Nichtbeachtung (familienfreundlich, kein Stress).
- **Herz-Ereignisse** bei 2/4/6/8/10 Herzen: Dialog/Cutscene, ausgelöst beim Betreten einer Zone zur passenden Tageszeit (Trigger in `content/relationships.ts`). Jedes Ereignis einmalig.
- **Begleiter**: Crew-Figuren mit `companion` lassen sich nach Bedingung rekrutieren; höchstens 2 aktiv in der Party (folgen auf der Karte, kämpfen mit). Wechsel im Treffpunkt (High Voltage) oder per Telefon.
- **Romanzen**: nur Figuren in `content/romance.ts` (`ROMANCE_ENABLED: Set<NpcId>`, Teilmenge der Positivliste `ROMANCE_CANDIDATES`; Einträge nur nach Freigabe durch den Nutzer, derzeit `aria`, `hunter`, `dante`, `collin-charleston`, `lio-funkel`). Romanzeoptionen erscheinen nur, wenn die Figur dort steht und ≥ 8 Herzen hat. Inhalte nicht explizit (Flirt, Date, Händchen halten; je freigegebener Figur höchstens ein Kuss am Höhepunkt ihres Strangs, Bildregel §6.1). Die Straßenkinder (`daria`, `freya`, `jakko`) dürfen nie dort stehen (Test).

### 3.4 Zeit und Tagesablauf

- Spieluhr in Minuten von 06:00 bis 02:00. Beim Erkunden 1 Spielminute je 0,7 s Echtzeit; in Dialogen, Menüs, Cutscenes und Kämpfen steht die Uhr. Kartenwechsel +10 min, U-Bahn-Fahrt +30 min.
- Tageszeiten: `morgen` 06–10, `tag` 10–17, `abend` 17–21, `nacht` 21–02. Kartenbeleuchtung per Farb-Overlay je Tageszeit (Tag neutral, Abend warm-violett, Nacht dunkelblau mit stärkerem Neon-Glow über additive Lichtpunkte).
- Schlafen (Bett im eigenen Unterschlupf) beendet den Tag → 06:00 nächster Tag, volle LP. Um 02:00 bricht die Figur zusammen und wacht im Unterschlupf auf (−10 % Credits, humorvolle Notiz von Captain Kuschel).
- **Tagesablauf**: Jede Figur hat je Tageszeit (und optional Wochentag) einen Ort (`map` + Punkt + Blickrichtung) oder `away`. Bedingungen dürfen den Ablauf überschreiben (Quest, Akt). Wochentage: Mo–So, Tag 1 ist Montag.

### 3.5 Quests und Aufträge

- `QuestDef`: `kind` `main` | `side` | `job` | `personal`, Auftraggeber, Schritte mit Bedingungen (`done`), optionale Schritte, Fehlschlag-Bedingung, Belohnung (XP, Credits, Items, Beziehung, Ruf), Zielmarker (Zone und Punkt). Mehrere Lösungswege über alternative Schritte (`any`).
- Questlog mit aktiven, abgeschlossenen und gescheiterten Quests; aktives Ziel im HUD (wählbar).
- **Auftragstafel** im High Voltage (und weiteren Kontakten): wiederholbare Aufträge aus Vorlagen (Kurier, Schulden eintreiben, Datenraub, Kopfgeld, Eskorte), deterministisch aus Tag und Seed gezogen, 3 pro Tag.
- **Ruf** je Fraktion −100 … 100 (Fraktionen in `world.md`), beeinflusst Preise, Dialoge, Feindseligkeit.

### 3.6 Handel und Gegenstände

- Credits als Währung. Händler mit Sortiment (Bedingungen, Tagesbestand), Ankaufspreis 40 % (+ Perk/Ruf). Kategorien: `waffe`, `cyberware`, `verbrauch`, `geschenk`, `quest`, `sammeln`, `kleidung`.
- Waffen: Nahkampf/Fernkampf/Smart (Hack); je eine ausgerüstet + Ersatz. Verbrauch: Heilung, Buffs, Granaten (im Kampf nutzbar).

### 3.7 Kampf (rundenbasiert auf Raster)

- Eigene Kampfszene auf einer **Arena**: gemalter Arena-Hintergrund 1536×1024 in Draufsicht mit einem Raster aus 12 × 8 Feldern à 128 px (Arena-Definition: Hindernisse, halbe/volle Deckung, Gefahrenfelder, Startfelder je Seite). Arenen sind wiederverwendbar (Straße, Hinterhof, Kanalisation, Labor, Club, Dach, Ödnis-Schrottplatz, Partysaal, Server-Kern).
- Party: Spielfigur + bis zu 2 Begleiter. Gegner aus `content/enemies.ts`, Begegnungen aus `content/encounters.ts` (Zone, Tageszeit, Wahrscheinlichkeit oder Quest-Auslöser; sichtbare Gegner auf der Karte statt Zufallskämpfen – Berühren oder Ansprechen startet den Kampf, Schleichen/Checks können ihn vermeiden).
- Runden: Initiative nach Reflexe (+ Boni). Jede Einheit hat 2 Aktionspunkte: Bewegen (Reichweite = 3 + floor(Reflexe/3) Felder), Angriff, Fähigkeit, Gegenstand, Abwarten (Überwachung), Deckung suchen. Trefferchance = Basis 75 + 5 × (Reflexe Angreifer − Reflexe Ziel) − Deckung (halb 20, voll 40) + Flanke 15, begrenzt auf 5–95; deterministischer RNG mit Seed.
- Schaden: Waffenschaden + Attribut (Nahkampf Körper, Fernkampf Reflexe, Hack Technik) − Panzerung. Statuseffekte: `gehackt` (setzt eine Runde aus), `betaeubt`, `brennt`, `markiert` (+20 Treffer), `geschuetzt`, `blutet`.
- Fähigkeiten aus Cyberware, Perks und Begleitern (je Begleiter 2–3, siehe `world.md`). Ausstrahlung im Kampf: Einschüchtern/Überzeugen (Gegner mit Moral flieht oder ergibt sich), Straße: Schmutzige Tricks.
- Sieg: alle Gegner besiegt, geflohen oder ergeben; optional Missionsziel (Terminal hacken, Person retten, entkommen). Niederlage: keine Spielstand-Sackgasse – Rückkehr zum letzten sicheren Punkt (Unterschlupf/Dante) mit halben LP, Questschritt bleibt wiederholbar.
- Belohnung: XP, Credits, Beute. Begleiter erhalten Beziehungspunkte (+5) für gemeinsame Siege.
- KI: einfache Profile (`aggressiv`, `vorsichtig` → Deckung, `support`, `boss` mit Phasen).

### 3.8 Welt und Umgebungsleben

- Zonen als einzelne Karten mit Ausgängen; Stadtkarte zeigt Bezirke und freigeschaltete U-Bahn-Stationen (Schnellreise).
- Passanten (generische NPCs mit Laufrouten) mit Zufallssprüchen nach Zone, Tageszeit und Fortschritt.
- Bildschirme/Radio: Nachrichtensendungen von Collin Charleston und Delya Delloraine, die auf Fortschritt reagieren (`content/news.ts`).
- Telefon: Nachrichten von Figuren (Herz-abhängig), Auftragsangebote, Begleiter rufen.

### 3.9 Akte

Hauptstrang in drei Akten (Details `world.md`). Akt-Flags `act1`, `act2`, `act3`; `?act=` setzt die nötigen Flags, Gegenstände und Freischaltungen wie ein Debug-Warp. Erster spielbarer Stand: **Akt 1 vollständig spielbar** samt aller Akt-1-Zonen, -Figuren, -Nebenquests und -Kämpfe; spätere Zonen dürfen gesperrt sein („Gesperrt – kommt in Akt 2“).

## 4. Daten- und Typverträge

`game/src/modules/contracts.ts` wird für Nexus neu geschnitten (Grundmuster von InselRPG: `Condition`, `Effect`, `MapDef`, `DialogueDef`, `CampaignPort`, `DialogueSession`, `AssetManifest`). Wesentliche Erweiterungen:

- `Condition` zusätzlich: `{ attr, min }`, `{ origin }`, `{ hearts: npc, min }`, `{ rival: npc }`, `{ time: TimeSlot | TimeSlot[] }`, `{ weekday }`, `{ quest, state }`, `{ questStep }`, `{ rep: faction, min }`, `{ level }`, `{ credits }`, `{ companion }`, `{ romance: npc }` (Schalter + Herzen), `{ dayAtLeast }`.
- `Effect` zusätzlich: `{ xp }`, `{ credits }`, `{ relation, delta }`, `{ rep, delta }`, `{ startQuest }`, `{ completeQuest }`, `{ failQuest }`, `{ recruit }`, `{ dismiss }`, `{ battle: encounterId }`, `{ shop: shopId }`, `{ advanceTime: minutes }`, `{ sleep }`, `{ news }`, `{ phone: messageId }`, `{ unlockStation }`, `{ installCyberware }`.
- `DialogueChoice.check` verweist auf `CheckDef` (Schwellen-Check); `DialogueChoiceView.check` liefert `{ attribute, threshold, value, ok, missing }`.
- `MapDef` zusätzlich: `size`, `district`, `lighting` (`outdoor` | `indoor` | `underground`), `station?` (U-Bahn), `encounters?` (sichtbare Gegnergruppen mit Patrouille), `ambient?` (Passanten), `bed?` (Unterschlupf).
- `NpcDef` (alle benannten Figuren): Name, Porträt(e), Sprite, Fraktion, `gifts { loves, likes, dislikes, hates }`, `schedule`, `heartEvents`, `companion?`, `romanceable?` (nur Kennzeichen, freigeschaltet über `romance.ts`), `talk` (Tagesgespräch-Dialoge nach Herzstufe/Fortschritt).
- `BattleState`, `UnitDef`, `AbilityDef`, `ArenaDef`, `EncounterDef` für den Kampf (reine Regeln in `modules/combat`).

## 5. Karten

Jede Karte: gemalter Hintergrund (Draufsicht, orthografisch wirkend, kein Fluchtpunkt), Laufpolygone (`walk`), Sperrflächen (`block`), Ausgänge, Einstiegspunkte, Hotspots, NPC-Plätze (aus Tagesabläufen), Vordergrund-Verdecker, optional Lichtpunkte für die Nacht (`lights: { at, radius, color }[]`). Zonenliste und Inhalte: `world.md`. Geometrie wird nach dem fertigen Bild autorisiert und mit `node scripts/map_tool.mjs <id>` geprüft (Erreichbarkeit, Overlay-Vorschau unter `output/qa/maps/`).

Bildherstellung je Karte: (1) Layout-Skizze aus der geplanten Geometrie (Blockout-PNG mit Wegen, Gebäuden, Ausgängen), (2) Codex malt die Karte mit Skizze und Stilreferenzen, (3) Geometrie wird am fertigen Bild nachgezogen.

## 6. Asset-Vertrag

Alle Laufzeitgrafiken unter `game/public/assets/`, registriert in `game/public/assets/manifest.json` (`AssetManifest`). Fehlende Bilder ersetzt die Darstellung durch erkennbare Platzhalter (farbige Silhouetten, Kartenraster), damit Systeme vor der Kunst testbar sind.

Bildgenerierung ausschließlich über `scripts/art/codex_image.sh <ziel.png> "<prompt>" [referenz.png …]` (Codex-CLI mit eingebautem Imagegen, ~45–120 s pro Bild, höchstens drei gleichzeitig pro Agent). Referenzen: Kostümfiguren und Bühnenbild unter `work/refs/` (aus der TheaterApp; z. B. `character-<stamm>--nexus.png`).

**Stilbibel** (für jeden Prompt): handgemalte Cartoon-Illustration exakt im Stil der beigefügten Figuren (klare dunkle Tuschekonturen, weiche malerische Schattierung, natürliche Proportionen, nicht Chibi), Cyberpunk-Unterstadt 2086 mit Neon in Pink/Cyan/Violett, Rost, Container, Kabel, Dampf; Oberstadt sauber, Chrom und Glas; Ödnis staubig orange. Keine lesbare Schrift (außer ausdrücklich), keine Wasserzeichen, keine Rahmen.

| Typ | Pfad | Format |
| --- | --- | --- |
| Kartenhintergrund | `bg/<mapId>.webp` | 1536×1024 (Innenräume ggf. kleiner), deckend, orthografische Draufsicht ~50° |
| Arena | `arena/<arenaId>.webp` | 1536×1024, Draufsicht, rasterfreundlich (klare Bodenflächen, Deckungsobjekte) |
| Laufblatt | `sprites/<id>-walk.png` | 4×4 Zellen à 128×128, Zeilen Süd, West, Ost, Nord; transparent; Fußanker (64, 120); Figurenhöhe ~96 px (Kinder ~76) |
| Kampfposen | `sprites/<id>-pose.png` | optional 4 Zellen à 128×128: bereit, Angriff, getroffen, am Boden |
| Porträt | `portraits/<id>.webp` | 512×512 Brustbild, dunkel-neutraler Hintergrund mit Neon-Akzent; Varianten `<id>-<variante>` |
| Requisit | `props/<id>.png` | transparent, Fußanker unten Mitte |
| Schlüsselszene (Plate) | `cut/<cutId>.webp` | 1536×1024 fotoreal (siehe §6.1), ≤ 1,2 MB, mit Blurhash-Platzhalter |
| Itemsymbole | `ui/items.png` | Atlas aus 64×64-Zellen, transparent |
| Titel, Stadtkarte | `ui/title.webp`, `ui/city-map.webp` | 1536×1024 |
| Spielfigur-Teile | `creator/koerper/<body>.png` (Grundkörper), `creator/<kategorie>/<body>/<id>.png` (Rumpf/Beine), `creator/<kategorie>/<id>.png` (Kopfteile), `creator/haar/<id>.back.png`/`.front.png`, Kappe zusätzlich `<id>.clip.png`; zu jedem Teil `<datei>.mask.png`; Katalog `creator/catalog.json` (Kopie von `design/assets/creator.json`) | je 512×512 wie Laufblatt, Ebenenvertrag §6.3; kein Porträt, kein Foto |

### 6.1 Schlüsselszenen: fotoreal, Einblendung wie in Selantis

Wichtige Momente (Hauptstrang, Herz-Ereignisse ab 6 Herzen, Bosskämpfe, Enden) zeigen ein **fotoreales Standbild** – im Gegensatz zur gemalten Welt. Einblendung nach dem Vorbild der Selantis-„Plates“ (`../SelantisRPG/game/src/ui/plate.ts`, nur lesen): Letterbox fährt ein, Bild blendet in einem Rahmen auf, langsame Kamerafahrt (Ken Burns: `in`, `out`, `left`, `right`, `none`; bei reduzierter Bewegung keine), Vignette, Bildunterschrift unten, Überblendung zwischen aufeinanderfolgenden Bildern, Dialogzeilen mit Porträt können über dem Bild laufen, Blurhash-Platzhalter bis zum Laden, gesehene Szenen erscheinen in der **Galerie** im Menü. Statt Pergament und Ornamentecken: dünner Neon-Rahmen (Cyan/Pink) mit kurzem Glitch beim Einblenden, Scanline-Hauch, Bildunterschrift in der Display-Schrift.

Bildstil (für jeden Prompt): fotorealistisches Film-Standbild, 35-mm-Anamorphot, geringe Schärfentiefe, leichtes Filmkorn, Low-Key-Licht mit Neon-Rimlight in Violett/Blau/Pink, tiefe Schwarztöne. Stilreferenz `work/refs/style-keyscene-photoreal.webp` – ausdrücklich NUR für Farbstimmung, Licht und Kamera, nicht für Pose oder Bildaufbau. Figuren nach den gemalten Kostümreferenzen (Haare, Kleidung, Farben), als echte Menschen umgesetzt. Regeln: alle vollständig und altersgerecht bekleidet; Kamera auf Augenhöhe, halbnahe bis amerikanische Einstellung mit Fokus auf Gesichter, Hände und Handlung (Prompt-Zusatz: "camera at eye level, medium shot, framing focused on faces and the action, no emphasis on legs, chest or body, modest clothing"), kein Untersicht-Bildaufbau auf Körper; Posen dramatisch und handlungsbezogen (Kampf, Flucht, Verrat, Triumph, Freundschaft), nie intim oder sexualisiert; fotoreale Romanzeszenen nur für Figuren in `ROMANCE_ENABLED` (vom Nutzer freigegeben, ausdrücklich erwachsen): Ich-Perspektive der Spielfigur (Ausnahme Spielfigur Vex: beobachtende Kamera, Vex erkennbar, Tafeln `rom-vexaria-*`, §3.1b), warm und alltäglich (Essen, Training, Werkstatt, Regen, Sonnenuntergang, Hände halten), sonst Umarmung oder Hand als Obergrenze, nichts Intimes; **Kuss-Ausnahme** (Nutzerentscheidung 08.11.2026): nur für Figuren in `ROMANCE_ENABLED`, nur einmal am Höhepunkt ihres Strangs (bisher `rom-aria-kuss`), kurz und zärtlich, nur als Gegenlicht-Silhouette vor dem Sonnenuntergang in Halbtotale oder Totale (keine Nahaufnahme, Gesichter im Schatten, nicht in Ich-Perspektive), die Spielfigur dabei als anonyme dunkle Gegenlicht-Silhouette ohne erkennbare Merkmale (§3.1a); Ausnahme Spielfigur Vex: Kuss-Tafel `rom-vexaria-kuss` (ersetzt für Vex `rom-aria-kuss`), Vex nur am Umriss erkennbar, ohne Gesichtsreferenzen (§3.1b); Dateien `cut/rom-<id>-<szene>.webp`, gebaut mit `scripts/art/cut_build.py` (Prompts in `design/assets/cut.json`, Manifest mit Blurhash in `design/assets/cut.manifest.json`); Kinderfiguren nur in harmlosen Alltagsszenen (UNO, Werkstatt); Gewalt angedeutet, kein Blut.

### 6.2 Dialogbilder: fotoreal mit Gesichtsausdrücken

Spricht eine Figur, erscheint sie groß als **fotoreales Halbporträt** (Kopf bis Hüfte, 2:3 hochkant) neben der Dialogbox – visuell an die Schlüsselszenen angelehnt (gleiche Bildsprache wie §6.1, gleiche Bildregeln: Augenhöhe, Fokus aufs Gesicht, altersgerecht und vollständig bekleidet). Die gemalten Porträts (`portraits/<id>.webp`) bleiben für kleine Ansichten: HUD-Party, Menüs, Beziehungsliste, Questlog, Namensschilder, Telefon.

- Ausdrücke (`Expression`): `neutral`, `freude`, `wut`, `trauer`, `ueberrascht`, `besorgt`, dazu je Figur optional ein Signatur-Ausdruck `signatur` (z. B. Blade selbstgefälliges Grinsen, Dante verlegen, Aria kampfbereit, Hunter genervt, KI Nexus Glitch). Nebenfiguren (Richter, Wache, Barkeeper, Kameramann) nur `neutral`, `wut`, `ueberrascht`. Figuren in `ROMANCE_ENABLED` zusätzlich `verlegen` und `zaertlich` (nur in Romanzefassungen, vollständig bekleidet, jugendfrei).
- `DialogueLine.expr?: Expression` (Standard `neutral`); fehlt ein Ausdruck, gilt `neutral`, fehlt das Foto ganz, das gemalte Porträt. Wechsel zwischen Ausdrücken derselben Figur als kurze Überblendung (150 ms), Sprecherwechsel mit leichtem Einschieben; zwei Gesprächspartner: aktiver Sprecher hell, der andere abgedunkelt.
- Spielfigur: **kein** Bild (Ich-Perspektive, §3.1a; Ausnahme fertige Spielfigur Vex mit `photo-vex-<ausdruck>`, §3.1b). Spricht sie, bleibt die Bildseite leer bzw. das Gegenüber abgedunkelt sichtbar; die Dialogbox zeigt nur ihren Namen.
- Identität bleibt über alle Ausdrücke gleich: Erst entsteht `neutral` aus gemaltem Porträt, Kostümreferenz und Stilreferenz; jeder weitere Ausdruck wird mit dem fertigen `neutral`-Foto als Hauptreferenz erzeugt („same person, same clothes, same lighting and framing, only the facial expression and slight head/hand pose change“).
- Dateien: `photos/<id>/<expr>.webp`, 640×960, Hintergrund dunkel mit Neon-Bokeh (passend zur Figur), unten weich ausgeblendet; Manifest-Schlüssel `photo-<id>-<expr>`. Rohbilder 1024×1536.

Rohbilder unter `output/imagegen/raw/`, Prompts und Lieferdaten unter `design/assets/*.json`, Verarbeitung (Freistellen per Magenta-Schlüssel, Raster schneiden, skalieren, WebP) unter `scripts/art/` (Python 3 + Pillow + NumPy, `sprites_lib.py` aus InselRPG als Grundlage).

### 6.3 Spielfigur: Ebenen-Vertrag (Charakter-Baukasten §3.1a)

**Dateien.** Jedes Teil ist ein vollständiges Laufblatt 512×512 (4×4 à 128, Zeilen S/W/O/N, Fußanker (64, 120), Figurenhöhe ~96 px), deckungsgleich mit dem Grundkörper; leere Zellen sind erlaubt (z. B. Brille in Zeile N). Dazu `<datei>.mask.png` (Regionsfarben §3.1a; fehlt sie, gilt das ganze Teil als feste Farbe). Regionspixel stehen im Teil als Graustufe (R = G = B = Helligkeit L), feste Pixel in ihrer Farbe. Kopfteile (Gesicht, Frisur, Brille, Maske, Kappe, Kopfhörer, Gesichtsplatte, Augen-Leuchten) gelten für alle Körperbauten (`creator/<kategorie>/<id>.png`), weil Kopfposition und Größe identisch sind; Rumpf- und Beinteile gibt es je Körperbau (`creator/<kategorie>/<body>/<id>.png`). Sonderdateien: Frisur als `creator/haar/<id>.back.png` und `.front.png`; Kappe zusätzlich `creator/kappe/<id>.clip.png` (Alpha = Bereich, in dem Haar gelöscht wird: Kappensilhouette plus alles darüber je Spalte, +1 px). Katalog `design/assets/creator.json` = `game/public/assets/creator/catalog.json` (vom Build erzeugt): je Teil `id`, `category`, `layer`, `bodyDependent`, `side?`, `files` je Körperbau (`schmal`/`mittel`/`kraeftig`, Kopfteile `alle`, Frisuren `back`/`front`) mit `file`, `mask`, `regions`, Kappen `clip`; dazu `layerOrder` je Richtung, `sheet` (Raster, Fußanker), `maskColors` und Paletten-Vorschlag (`palette`, `hairColors`, `skin`) für `content/appearance.ts`. Die Asset-Prüfung stellt sicher, dass jede ID aus `content/appearance.ts` im Katalog steht; Teile ohne Datei (`jacke-keine`, `haar-glatze`, `gesicht-1`) stehen mit leerem `files` im Katalog.

**Ebenenreihenfolge** (unten → oben), gleich für alle Richtungen bis auf die Frisur-Rückseite:

| # | Ebene | Region(en) | Anmerkung |
| --- | --- | --- | --- |
| 1 | `haar.back` | Haar | S/W/O: hinter dem Körper. **N: wandert über Ebene 12** (Haare fallen über Jacke) |
| 2 | Grundkörper `body` | Haut | gesichtslose Silhouette; immer von Oberteil und Hose bedeckt |
| 3 | `tattoo` | fest, Neonlinien = Leuchten | unter aller Kleidung |
| 4 | `gesicht` | Haut, Haar (Bart/Brauen), fest | N leer |
| 5 | `cyber.platte` | fest, Leuchten | |
| 6 | `cyber.augen` | Leuchten | |
| 7 | `hose` | A, B, fest | |
| 8 | `cyber.bein` | fest, Leuchten | Schienbein über dem Hosenbein |
| 9 | `schuhe` | A, B, fest | über Hosensaum und Cyber-Bein |
| 10 | `oberteil` | A, B, fest | |
| 11 | `cyber.kabel`, dann `kette` | fest, Leuchten / fest | Kabel im Nacken (in N gut sichtbar), Kette in N leer |
| 12 | `jacke` | A, B, fest | `jacke-keine` = keine Ebene |
| 13 | `cyber.arm.links`, `cyber.arm.rechts` | fest, Leuchten | Unterarm + Hand über Ärmeln |
| 14 | `maske` | A, fest | |
| 15 | `haar.front` (+ `haar.back` in N) | Haar | vor dem Zeichnen mit `kappe.clip` beschnitten |
| 16 | `brille` | fest (Visier: Leuchten) | verdeckt `cyber.augen` optisch |
| 17 | `kappe` | A, B, fest | |
| 18 | `kopfhoerer` | B, fest | über der Kappe |

Verdeckung ferner Gliedmaßen (in W/O Arm bzw. Bein auf der abgewandten Seite) ist **im Teil vorab eingebacken**: Der Build löscht dort alle Pixel, die Rumpf oder nahe Gliedmaßen des Grundkörpers (+2 px Rand) verdecken. Darum gilt eine einzige Reihenfolge ohne Sonderfälle. Zeile O ist im Build die gespiegelte Zeile W; seitengebundene Teile (`side`: Cyber-Arm, Cyber-Bein, Tattoo-Ärmel) tauschen dabei links/rechts (Cyber-Arm links in W = Cyber-Arm rechts gespiegelt in O).

**Einfärbung:** Graustufen der Regionen sind im Build normiert (je Region Median der Helligkeit ≈ 0,5, 5. Perzentil ≈ 0,15, 95. ≈ 0,85), damit die Verlaufskarte aus §3.1a gleichmäßig greift. Feste Farben bleiben unberührt.

**Pipeline (festgelegt 08.11.2026 nach Augenschein; Ablauf und Befehle: `docs/creator-pipeline.md`).** Werkzeuge `scripts/art/creator/creator_prompts.py` (Teile, Aufträge, Prompts → `design/assets/creator-prompts.json`, Aufträge über `codex_image.sh`, höchstens 3 gleichzeitig) und `scripts/art/creator/creator_build.py` (Ebenen, Masken, Katalog, Vorschau). Rohbilder `output/imagegen/raw/creator/`.

1. **Grundpuppe `mittel`:** Codex malt ein Laufblatt einer schlanken, erwachsenen, geschlechtsneutralen grauen Schaufensterpuppe (kahl, schlichtes Gesicht, keine Kleidung/Anatomie-Details), Stilreferenz ein vorhandenes Figuren-Laufblatt. Bestes von mehreren Versuchen → `base-mittel.png`. Freistellen und Normieren wie `char_build` (Zeilenskalierung auf 96 px, Fußanker, Rumpf ruhig). Das schlichte Gesicht (`gesicht-1`) ist in den Grundkörper eingemalt; Gesichtsvarianten sind Überlagerungen (Bart/Brauen in Haarfarbe). Grundkörper: ganze Puppe = Region Haut, Tusche fest.
2. **Teile als Bearbeitung der Puppe:** Jeder Auftrag gibt der Bildbearbeitung die Puppe als einzige Referenz („alles pixelgleich lassen, nur … hinzufügen“). Codex hält Raster und Posen dabei sehr genau (Ausrichtungsgüte 1,96–2,00 von 2). Kennfarben: Kleidung Hauptstoff sattes Rot (A), Zweitfarbe sattes Grün (B), Haare/Bart sattes Blau, Leuchten Cyan, Cyberware Gunmetal, Accessoires Schwarz. Mehrere Teile pro Auftrag, wenn sie räumlich (Kopf / Rumpf / Füße) oder farblich trennbar sind (z. B. Frisur + Oberteil + Schuhe) – das spart zwei Drittel der Aufträge.
3. **Ausrichten und Ausschneiden (je Zelle):** Rohbild per Maßstab 0,92–1,08 und Versatz ±40 px auf die Puppenzelle gelegt (FFT-Korrelation: graue Hautflächen auf Puppe + Abdeckung der Puppensilhouette). Teilpixel = Kennfarben in der Zone des Teils (Anteile der Puppenhöhe, Tabelle `PART_META`), dazu Tusche/Metall in 4 px Nähe, eingeschlossene Lücken (Glanzlichter, Knöpfe, Aufdrucke) und Pixel außerhalb der Puppensilhouette nahe dem Teil; Accessoires/Cyberware = dunkle Pixel dort, wo die Puppe hell ist. Von gleichzeitig gemaltem Haar verdeckte Kleidung (lange Haare über dem Rücken) wird mit der nächstgelegenen Kleidungsfarbe aufgefüllt. Hosen enden bei 94 % der Höhe (Schuhe sind Pflicht und decken die Füße).
4. **Einfärbung:** Region nach Farbton (Rot → A, Grün → B, Blau → Haar, Cyan → Leuchten, Rest fest), Graustufe = HSL-Helligkeit, je Teil und Region normiert (5 % → 0,15, Median → 0,5, 95 % → 0,85); feste Tusche entsättigt. Verkleinerung wie der Grundkörper (gleiches Fenster, gleicher Maßstab, gleiche Position je Zelle → deckungsgleich).
5. **Nachbearbeitung:** Frisur → `back` (S/W/O: Haar unterhalb der Kinnlinie außerhalb der Puppe) und `front` (Rest; N komplett `front`). Ferne Gliedmaßen sind bereits durch das gemalte, angezogene Bild korrekt verdeckt (kein eigener Verdeckungsschritt nötig). Zeile O = gespiegelte Zeile W; seitengebundene Teile nehmen dafür die W-Zeile des Gegenstücks (Cyber-Arm links in O = Cyber-Arm rechts aus W gespiegelt). Kleinstflecken (< 6 px) je Zelle entfernt. Kappen-Clip aus der Kappensilhouette.
6. **Körperbauten** `schmal`/`kraeftig` per Skript: horizontale Streckung um die Rumpfachse unterhalb des Halses (Faktor 0,88 / 1,16, weicher Übergang über 8 px) für Grundkörper und alle Rumpf-/Beinteile. Kopfteile unverändert.
7. **Sichtprüfung statt Testsuite:** `output/qa/creator/combos.png` (8 Zufallskombinationen, alle 4 Richtungen), `combo-<n>.gif` (laufend), `parts.png` (jedes Teil einzeln auf der Puppe). Die Python-Vorschau setzt nach derselben Regel zusammen wie `presentation/appearance/compose.ts` (Reihenfolge, Masken, Verlaufskarte, Kappen-Clip). Der Nutzer prüft im Spiel.

Bekannte Grenzen: Brauen der Grundpuppe sind fest dunkel (färben erst über Gesichtsvarianten mit), Sommersprossen/Narbe (`gesicht-3`, `-6`) sind bei ~10 px Gesichtshöhe kaum sichtbar und noch nicht gebaut. Ausweichwege (Einzelaufträge je Richtung, skriptgestützte Kleidung aus Regionsmasken) wurden nicht gebraucht.

## 7. Audio

**Musik** mit Lyria 3.5 (Gemini API `models/lyria-3.5:generateContent`, Schlüssel nur zur Laufzeit aus dem macOS-Schlüsselbund `security find-generic-password -s google-api-key -w`, per stdin an curl, nie ausgeben oder speichern; Vorbild `../mainhattan/tools/music/generate.py` und `build.py`, nur lesen). Werkzeuge unter `scripts/music/` (Katalog `tracks.py` mit Prompts nur aus Genre, Tempo, Instrumenten, Stimmung – keine echten Songtitel oder Künstler; die im Stück verwendeten Lieder werden NICHT nachgebaut, nur eigene Stücke in passender Stimmung), Rohdateien in `output/music/cache/` (ungetrackt). Ausgabe `game/public/assets/music/<id>.m4a` (AAC-LC, 44,1 kHz Stereo, 96 kbit/s, −16 LUFS, True Peak −1,5 dBTP, nahtlose Schleife per Takt-/Nulldurchgangssuche mit kurzem Crossfade) plus `game/public/assets/music/manifest.json` (id, Datei, Dauer, Schleifenpunkte, Lautheit). Musik je Zone/Bezirk und Tageszeit über `MapDef.music` bzw. Bezirksstandard; Club-Musik draußen per Tiefpass gedämpft (WebAudio-BiquadFilter), Kampf-/Bossmusik mit Überblendung, kurze Stinger für Sieg, Herz-Ereignis, Quest abgeschlossen, Nachrichten-Jingle. Lyria-Ausgaben tragen ein SynthID-Wasserzeichen (in `docs/art-production.md` vermerken).

**Ambience und Effekte** prozedural über WebAudio (aus InselRPG übernommen und umgestimmt): Stadtbrummen, Regen, Kanalisation dumpf tropfend, Ödnis Wind, Meer Rauschen; Effekte (Schritte, Aufnehmen, Check bestanden/gescheitert, Herz +/−, Treffer, Hack, Alarm, Tür, Dialogtick, Keksalarm). Die Ambience enthält **keine Stimmen**: kein synthetisches Gemurmel oder Gebrabbel (ein vorhandener Stimmen-/Babble-Generator entfällt); Menschenstimmen kommen ausschließlich aus den Hintergrundstimmen. Einstellungen: Musik, Effekte, Stimmen, reduzierte Bewegung. Audio startet erst nach der ersten Nutzeraktion.

**Hintergrundstimmen** (Vertrag): echte, kurze deutsche Sätze von Passanten, vorab vertont mit `gemini-3.8-flash-lite-tts` (Werkzeug `scripts/voice/tts.py`, Schlüsselregeln wie bei der Musik; Rohdateien `output/voice/raw/`, ungetrackt).
- **Quelle:** Texte, Sprecher-Typen und Filter in `design/assets/voices.json` (`voices.<typ>` = Gemini-Stimme + Sprechanweisung; `snippets[]` mit `id`, `district`, optional `zones[]`, optional `when`, `lines[]` aus `speaker` und `text`, je Zeile ≤ 90 Zeichen). Gebaute Dateien `game/public/assets/voices/<snippet>-<n>.m4a` (AAC mono 64 kbit/s, Stille getrimmt, −20 LUFS, True Peak −2 dBTP) und Manifest `game/public/assets/voices/manifest.json` (Kopie `design/assets/voices.manifest.json`): je Zeile `file`, `snippet`, `line`, `speaker`, `voice`, `durationMs`, `text`. Das Spiel lädt das Manifest und `voices.json` (bzw. eine daraus erzeugte Content-Datei) und lädt die Audiodateien erst beim Betreten der Zone nach.
- **Filter:** Ein Fetzen kommt infrage, wenn `district` zum Bezirk der aktuellen Karte passt und – falls `zones` gesetzt – die Zone (oder der Innenraum, z. B. `high-voltage`) enthalten ist; Fetzen mit `zones` haben in ihrer Zone Vorrang (etwa 2:1) vor allgemeinen Bezirksfetzen. `when`: `flag` (muss gesetzt sein, z. B. `act2`, `epilog`), `notFlag` (darf nicht gesetzt sein), `time` (`morgen`|`tag`|`abend`|`nacht`), `weather` (Wetter-IDs aus world.md 3.4), `weekday` (`mo`…`so`); mehrere Bedingungen gelten zusammen. Neue (noch nicht gehörte) Fetzen haben Vorrang, sonst zufällig ohne direkte Wiederholung (die letzten 6 je Bezirk gesperrt).
- **Auslösung:** Ein Passant (generische Figur, nie eine Hauptfigur) in Reichweite von ~6 Feldern zur Spielfigur spricht. Höchstens **ein** Fetzen gleichzeitig in der ganzen Szene; danach Abklingzeit 8–15 s (zufällig), in ruhigen Zonen (Ödnis, Kanalisation) 15–25 s. Keine Fetzen während Dialog, Kampf, Schlüsselszene oder Nachrichten-Einblendung; ein laufender Fetzen wird dann weich ausgeblendet. Mini-Wechsel (2–3 Zeilen) brauchen zwei Passanten in Reichweite (Sprecher abwechselnd zuordnen; gibt es nur einen, wird ein Fetzen mit einer Zeile gewählt); Pause zwischen den Zeilen 250 ms.
- **Darstellung:** Sprechblase über dem sprechenden Passanten, synchron zur Audiodatei: erscheint mit Abspielbeginn, bleibt `durationMs` + 400 ms, dann Ausblenden; Text aus dem Manifest, kleine Schrift, nicht anklickbar, verdeckt keine Bedienelemente. Mit Stimmen-Regler auf 0 erscheinen die Blasen trotzdem (Dauer dann aus `durationMs`).
- **Lautstärke:** nach Entfernung Spielfigur–Sprecher (voll bis 2 Felder, linear auf 25 % bei 6 Feldern, darüber verstummt die Auslösung), leichtes Stereo-Panning nach horizontaler Lage; im Club (`high-voltage`) unter der Musik etwas lauter gemischt. Gesamtlautstärke über den Regler **„Stimmen“** in den Einstellungen (unabhängig von Musik und Effekten).

## 8. Qualität

- `npm run verify`: Architekturprüfung, Asset-Prüfung, Kartenprüfung, Vitest, Build, Playwright.
- Modultests: Attribute/XP/Perks, Checks inkl. Boni, Beziehungen (Geschenke, Tageslimit, Rivalität, Romanze-Schalter, Kinder nie romanzierbar), Zeit und Tagesablauf, Quests (Lösungswege, Fehlschlag), Handel, Kampf (Trefferchance, Deckung, Statuseffekte, KI, Sieg/Niederlage), Speicherformat (inkl. ungültiger Importe), Pfadsuche, Dialogbedingungen.
- Inhaltsprüfung (`content.test.ts`): alle IDs aufgelöst (Items in Geschenklisten, Zonen, Dialogknoten, Checks, Begegnungen), jede Zone erreichbar, jeder Hotspot auf begehbarer Fläche, jede Check-Option hat einen alternativen Weg. Darstellernamen dürfen nicht im Inhalt stehen; geprüft wird das per Skript `scripts/check_names.mjs`, das die Namensliste zur Laufzeit aus `work/source/nexus-drehbuch.txt` liest (ungetrackt) und überspringt, wenn die Datei fehlt.
- Playwright: Charaktererstellung → Akt 1 vollständig über Test-Hook und echte Eingaben; Kampf gewinnen; Mobil-Viewport; Screenshot je Zone.

## 9. Auslieferung

Dockerfile (Node-Build → Nginx), `/healthz`, `/release.json`. Repository und Domain werden erst nach Freigabe durch den Nutzer angelegt.
