# Lücken: Paket Schrottmarkt (`maps/schrottmarkt.ts`, `maps/ripper-praxis.ts`)

## Engine

- **Aussichtspunkt** (world.md §3.9: Karte aufdecken, Sammelobjekt-Silhouetten für den Tag): Es gibt keinen Mechanismus. Jetzt: `kranhebel` (gc-148 oder `oelkaennchen`) gibt 20 XP, Gustav ♥ +20, Flag `aussicht_schrottmarkt`, `seen: aussicht-schrottmarkt` und den Dialog `schrottmarkt-kranfahrt`; danach ist `aussicht-kran` ein wiederholbarer Blick. Vorschlag: Effekt `{ viewpoint: mapId }`, der für den Spieltag Sammelobjekt-Hotspots der Zone auf der Stadtkarte/Minikarte markiert.
- **Tageslimit Hütchenspiel** („höchstens 50 Cr pro Tag“): Flags lassen sich nicht täglich zurücksetzen. Jetzt: Einsatz 10 Cr, Gewinn 30 Cr pro Runde (`huetchenspiel`), `huetchen-durchschauen` (gc-151) einmalig 50 Cr + Wett-Willi ♥ +20. Vorschlag: Bedingung `{ seenToday: key }` bzw. Effekt `{ markSeenToday: key }` (verfällt beim Schlafen).
- **Vorschau `scripts/map_overlay.py`** rechnet fest mit 640×360 Karten; bei 1536×1024 liegt die Geometrie falsch über dem Bild. Vorschlag: `base.resize((w*S, h*S))` mit der Kartengröße aus dem Bericht.

## Inhalt anderer Agenten

- **Shops fehlen:** `elektronikstand` (Nyra T, Hotspot `elektronikstand`) und `marla-karawane` (Sa M/T, Hotspot `karawanenstand`) – Gegenstands-Agent.
- **Shop-ID Babette:** Plan nennt `bao-babette`, `system/shops.ts` heißt `garkueche-babette`. Hotspot-ID ist `bao-babette`, Shop `garkueche-babette`.
- **Hinterzimmer:** Es gibt keinen eigenen Shop `ripper-hinterzimmer`; die Hinterzimmer-Ware steckt mit `when` in `ripper-praxis`. Hotspot `ripper-hinterzimmer` öffnet deshalb `ripper-praxis` (nur mit `ripper_kennt_dich` oder Ruf `unterstadt` 20), sonst zeigt `vorhang` den Hinweis.
- **Quest-Hotspots nicht angelegt** (sonst würde die Quest-Version per mapAdditions verworfen): `oma-volts-lager`, `gerds-kasse`, `gerds-drucker`, `waage`, `oelfass`. Spots stehen bereit; neutrale Blicke mit anderen IDs (`lager-rolltor`, `gerds-auslage`) blenden sich bei aktiver/erledigter Quest aus.
- **Angelegt mit Plan-ID** (Quest/Herz-Agenten bitte nicht doppelt anlegen, sondern eigene IDs nehmen oder hier per `hideWhen` andocken): `auslage` (Blick; he-ripper-2 läuft als Herz-Ereignis), `preistafel` (+ `preistafel-fair` nach `pers-freya-fairer-lohn`), `halde-wrack` (einmalig 3 `schrott-ersatzteil`, ohne `job-bergung`-Abschluss), `kranhebel`, `aussicht-kran`, `gustavs-werkbank` (ab `seen: he-opa-gustav-6`), `huetchenspiel`, `stadt-tv`, `flohmarkt-stand`.
- **Kopfgelder** `kopfgeld-zwei-finger-zoltan` (A) und `kopfgeld-toaster` (N) sind nicht als Gegnergruppe platziert, weil beide Nicht-Kampf-Wege brauchen (Verfolgung, Identität klären). Spots `zoltan-revier` und `toaster-ecke` stehen bereit (Auftrags-Agent).
- **Rostzähne-Streife** (world.md §3.5 „N“): eigene Begegnung `enc-schrott-rostzahn-streife` (2 `rostzahn-schlaeger`, arena-hinterhof) in `maps/schrottmarkt.ts`, sichtbar nachts, umgehbar mit `[Straße 5]` oder einfach umlaufen.
- **Rippers Tür:** offen bei `time: tag` oder Flag `ripper_praxis_offen` (Plan „T geöffnet“); der Shop selbst hat 10–21 Uhr. Quests, die die Praxis abends brauchen, setzen das Flag.
- **Kanalgitter:** Ausgang `kanalgitter` → `kanal-sammler#gitter-schrottmarkt` mit `quest side-rattenkoenig done`; Zielkarte noch nicht vorhanden.

## Arbeitsbaum (nicht mein Paket, nur gesehen)

- `parts/vexaria/_util.ts` enthält im Kommentar „export const part“; `gen_content_parts.mjs` nimmt die Datei deshalb in `parts/index.ts` auf, und alle Tests unter `src/content` brechen mit „Cannot read properties of undefined (reading 'maps')“ ab. Lösung: Kommentar umformulieren oder im Generator `^export const part` prüfen.
