# Lücken: Itemsymbole

- **Neue Gegenstände aus Akt 2/3** (entstehen in diesem Lauf parallel): nach dem Einlesen aller Teile
  `python3 scripts/art/icons/icons_build.py build && node scripts/build_manifest.mjs` ausführen. Jeder
  Gegenstand ohne eigenes Symbol bekommt dann automatisch das Kategorie-Symbol `generic-<kategorie>`.
  Ein eigenes Symbol braucht eine Beschreibung in `scripts/art/icons/icon_prompts.py` und dann `… icons_build.py all`
  (hängt neue Bögen an; bestehende Atlasplätze bleiben stabil).
- **build_manifest.mjs**: Laut Kopfkommentar darf ein Fragment nur `items` enthalten, `mergeFragments` überspringt
  aber jedes Fragment ohne `images`/`sprites`. Umgangen mit `"images": {}` in `design/assets/icons/items.manifest.json`.
  Vorschlag: Bedingung um `!isObject(data.items)` erweitern.
- Sammelobjekte teilen sich je Reihe ein Symbol (Schallplatte, Datenwürfel, Glücksstern …), so wie es in
  `ItemDef.icon` angelegt ist. Farbvarianten würden eigene `icon`-Schlüssel an den Gegenständen brauchen.
