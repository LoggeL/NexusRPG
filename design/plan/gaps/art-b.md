# art-b: Figurenbilder Akt 1 (Notizen)

- Fertig: Laufblatt, Porträt und Dialogfotos für marla-sand, pim-pinzette, kaeptn-nebelhorn, buergermeister-gully,
  jimmy, bolzen. Schlüssel: `<id>-walk`, `portrait-<id>`, `photo-<id>-<ausdruck>`.
- Fotos je Figur: marla-sand neutral/freude/besorgt/signatur · pim-pinzette neutral/besorgt/ueberrascht/signatur ·
  kaeptn-nebelhorn neutral/freude/besorgt/signatur · buergermeister-gully neutral/freude/wut/signatur ·
  jimmy neutral/freude/trauer/signatur · bolzen neutral/freude/wut. Andere Ausdrücke fallen im Dialog auf neutral zurück
  (bitte in Dialogen nur diese Ausdrücke verwenden).
- captain-kuschel: kein Laufblatt (Plüschtier, läuft nicht); Requisit `props/captain-kuschel.png` und Fotos gab es schon.
- bolzen: Vierbeiner-Laufblatt mit Höhe 54 px (`scripts/art/char_config/bolzen.json`). Für die Fotos hat
  `photo_prompts.py` den neuen Typ `special: "robot"` (eigene Ausdruckstexte `ROBOT_TEXT`, kleiner Zweig in
  `expr_text`/`base_prompt`).
- pim-pinzette: Foto-neutral v2 (v1 wirkte zu jung), Zusatz in `scripts/art/photo_config/pim-pinzette.json`.
- Offen für die Integration: vollständiger Lauf `char_build.py` und `photo_build.py` ohne IDs (Kontaktbögen), danach
  `node scripts/build_manifest.mjs`; Tabellen in `docs/art-production.md` um die neuen Figuren ergänzen.
