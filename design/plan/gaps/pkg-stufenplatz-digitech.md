# Lücken: Paket pkg-stufenplatz-digitech (stufenplatz, nx1-studio, digitech-areal, digitech-tresor)

Dateien: `game/src/content/parts/maps/{stufenplatz,nx1-studio,digitech-areal,digitech-tresor}.ts`

## Engine

1. **Ausgang „when ODER check“** (Drehkreuz gc-106, Bauzaun gc-107). `exitFlow` verlangt `when` UND `check`.
   Notbehelf: Ausgang mit `when` = alle Wege ohne Wert (Gegenstand, Auftrag, Flag, `seen: check:gc-…`) und davor ein
   Check-Hotspot (`drehkreuz`, `bauzaun`), der bei Erfolg Flag setzt und selbst `travel` auslöst.
   Vorschlag: `ExitDef.checkOr?: true` bzw. `altWhen`, damit ein bestandener Check den Ausgang direkt öffnet.
2. **U-Bahn-Zugang als Hotspot**: Es gibt keinen Effekt, der die Stadtkarte öffnet. `ubahn-zugang` schaltet nur die Station
   frei und verweist auf die Stadtkarte. Vorschlag: Effekt `{ cityMap: true }` oder HotspotKind `'metro'`.
3. **Salon Gina „Aussehen ändern“**: Kein Effekt öffnet den Charakter-Baukasten im Spiel. Der Hotspot `salon-gina` öffnet
   nur den Laden `salon-gina`. Vorschlag: Effekt `{ appearanceEditor: { shop: 'salon-gina' } }` mit Preisen aus design.md §3.1a.
4. **Bedingte Sperrflächen**: Im Prolog („damals“) ist die Tresortür im Bild geschlossen dargestellt bzw. der Drohnenplatz
   ersetzt den Wachkoloss; `MapDef.block` ist statisch. Vorschlag: `blockVariants` analog `bgVariants`.
5. **map_overlay.py** stürzt bei `npcs` aus mapAdditions ab (`KeyError: 'actor'`, NpcPlacement hat `npc`) und rechnet noch im
   640×360-Raster. Geprüft habe ich mit `map_tool.mjs --no-render` und eigener Vorschau.

## Inhalt / Querverweise

- **Shop-ID**: Plan nennt `brezel-imbiss`, system/shops.ts definiert `imbisswagen-stufenplatz` → Hotspot zeigt auf
  `imbisswagen-stufenplatz`. Im NX-1-Studio steht zusätzlich der Laden `nx1-fanshop` (Empfang, M/T).
- **Kartengröße nx1-studio**: 1536×1024 statt 1024×768. Das Bild ist im Zonenmaßstab gemalt; so passen Figuren, Türen und Möbel.
- **Frei gelassene Hotspot-IDs** (für Figuren/Quests): `radio-mikro` (he-collin-charleston-2), `story-pitch`
  (side-live-dabei, prep-ablenkung), `fx-60` (side-eingehendes-fax, Entscheidung), `kartenleser` (Prolog). Die Zone legt dort
  nur Blick-Hotspots mit eigenen IDs an (`radio-kabine-blick`, `themenwand`, `faxgeraet-blick`, `kartenleser-blick`).
  Die Spots `radio-kabine`, `redaktion`, `fx-60-terminal`, `kartenleser`, `tresor-rohr` stehen wie geplant.
- **Von der Zone angelegt (bitte nicht doppelt)**: `notstrom-terminal` (gc-76 → `dienstplan-2079`) + `notstrom-terminal-hack`
  (akt-hacken, Weg ohne Check) nur bei aktivem side-digitech-geist; `archiv` (gc-112 → `kuestenkarte-fragment`) +
  `archiv-schluessel` (Ruf digitech 20); `digitech-plaene` ([Ex-Wache] + prep-grundriss aktiv → `grundriss-labor`);
  `wachplan-kiste` (nachts, prep-wachplan aktiv, akt-schloss → `wachplan-campus`); `rostlaube-batterie` (side-rostlaube aktiv);
  `redaktions-terminal` (akt-hacken, nur Collin unter ♥2, einmalig 40 Cr). Die Hotspots geben nur Gegenstände, keine
  `questStep`s – die Quests sollten auf `{ item: … }` prüfen oder den Schritt selbst setzen.
- **Begegnungen**: `enc-ruine-waechter` im Wächtergang (umgehbar mit eingebettetem Check `welt-keller-waechter-umgehen`
  [Reflexe 5], nicht im Prolog), `enc-ruine-pluenderer` am Plündererlager nur bei aktivem side-digitech-geist.
  `enc-prolog-drohne` legt quest-main-a als Hotspot `prolog-drohne` an (deshalb hier keine Gegnergruppe).
- **Prolog-Bedingung**: `bgVariants` „damals“ und das Sperren des Bauzaun-Ausgangs nutzen `{ notFlag: 'prolog_done' }`
  wie quest-main-a (IM_PROLOG). Wer ein Spiel ohne Prolog startet (`?act=`), muss `prolog_done` setzen, sonst zeigt das
  Areal die Damals-Fassung.
- **Drehkreuz-Flag**: `drehkreuz_passiert` setzt der Check-Hotspot; den Weg über Gegenstand/Herkunft deckt das onEnter
  `glasarkaden-drehkreuz` von maps/glasarkaden.ts ab.
- **Eingebettete Checks** (keine gc-ID in world.md): `welt-kaffee-auffangen` [Reflexe 4] (Praktikantin, §10.7, mit Weg ohne
  Check), `welt-keller-waechter-umgehen` [Reflexe 5].
- **Gesperrte Ausgänge in Akt 2**: `lieferzone` (→ quantum-campus, act2 + gc-109 mit Auto-Bonus `karte-lieferzone`),
  `kabelschacht` (→ datentunnel, act2). Ziele fehlen noch, Integration filtert.

## Bilder

`bg-stufenplatz`, `bg-nx1-studio`, `bg-digitech-areal`, `bg-digitech-areal-damals`, `bg-digitech-tresor`,
`bg-digitech-tresor-damals` (Roh und Prompts unter output/imagegen/raw/maps/).
