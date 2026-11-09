# art-a: Figurenbilder neue Akt-1-Figuren

Figuren: `dexter`, `babette-bao`, `opa-gustav`, `oma-volt`, `kiki-karbon`, `lio-funkel` (Bildschlüssel = volle world.md-IDs: `portrait-<id>`, `<id>-walk`, `photo-<id>-<ausdruck>`).

## Vorgehen (neue Figuren ohne Kostümreferenz)

- Aussehen frei erfunden (world.md §4 nennt keins), Beschreibungen in `scripts/art/char_prompts.py` (Block `CHARACTERS.update`) und `scripts/art/photo_prompts.py` (Block `PHOTO.update`).
- `work/char_refs.json`: `<id>` → `unique:<id>`. `work/refs/character-unique-<id>.png` ist eine Kopie einer Stil-Kostümfigur mit ähnlichem Körperbau (nur Zeichenstil); `character-unique-<id>-portrait.png` ist nach dem ersten Lauf das eigene gemalte Porträt (Rohbild). Dadurch nutzen Laufblatt-Neuversuche und die Fotos die eigene Figur als Identitätsreferenz, nicht die Stilfigur.
- Porträt zuerst (Stilreferenz + `--extra` „different person, style only“), dann Laufblatt mit eigenem Porträt als zweiter Referenz.
- Fotos: erfundene Gesichter („invented face, not a real person“), neutral aus gemaltem Porträt + Stilreferenz, Ausdrücke als Bearbeitung von neutral.

## Ausdrücke

- dexter: neutral, freude, besorgt, ueberrascht, signatur (ertappt, Hände hoch „ich zahl ja!“)
- babette-bao: neutral, freude, wut, trauer, signatur (Kelle als Drohung)
- opa-gustav: neutral, freude, trauer, ueberrascht, signatur (nostalgischer Blick)
- oma-volt: neutral, freude, wut, besorgt, signatur (Blick über die Brille)
- kiki-karbon: neutral, freude, ueberrascht, wut, signatur (Klatsch hinter vorgehaltener Hand)
- lio-funkel: neutral, freude, trauer, ueberrascht, signatur (spielt Akkordeon), verlegen, zaertlich (Romanze freigegeben)

Fehlende Ausdrücke fallen laut design.md §6.2 auf `neutral` zurück. Dialog-Autoren: nur die obigen Ausdrücke nutzen oder Nachlieferung anfragen.

## Hinweise

- oma-volt: char_build meldet „magentastichige Pixel“ – das ist die echte lila Strickjacke, keine Freistellreste (Notiz in `scripts/art/char_config/oma-volt.json`).
- Ausdrucksvarianten der gemalten Porträts (happy/angry …) gibt es wie bei allen Figuren noch nicht.
- Vor dem Abschluss braucht es (wie in art-production.md) einen vollständigen `char_build.py`- und `photo_build.py`-Lauf ohne IDs für Kontaktbögen; Teilbuilds liefen mit `--no-contact`.
