# Paket pkg-rennhalle-meer (maps-23): Rennhalle 9 und das Meer – Lücken und Absprachen

Dateien: `game/src/content/parts/maps-23/rennhalle-9.ts`, `das-meer.ts`, `shops-meer.ts`.
Bilder: `bg-rennhalle-9`, `bg-rennhalle-9-rennnacht` (Variante Mi/Sa 21–01), `bg-das-meer` (Strandclub-Baustelle),
`bg-das-meer-strandclub` (Variante nach `side-strandclub`). Rohbilder und Prompts unter `output/imagegen/raw/maps/`.

ersetzt Platzhalter: –

## Absprachen mit anderen Paketen (Querverweise per ID)

- **`rennhalle-9-geoeffnet`** setzt `rennhalle-9.ts` per `mapAdditions.hafenkante.onEnter` (einmalig ab `act2`, mit Meldung).
- **Strand-Shuttle:** Hotspot `strand-shuttle` an `hafenkante:faehre` (in `rennhalle-9.ts`, mapAdditions) reist nach
  `das-meer/shuttle`; zurück über `das-meer:shuttle-halt` nach `hafenkante/von-hausboot-nebelhorn` (60 Min).
  Bedingung: `epilog` und (`strandclub_shuttle` **oder** `side-strandclub` erledigt).
  → **`side-strandclub` (Quest-Paket) soll auf der Stufe „Shuttle“ `{ setFlag: 'strandclub_shuttle' }` setzen.**
  Falls das Quest-Paket selbst einen Shuttle-Hotspot an der Fähre anlegt, einen der beiden entfernen.
- **Strandclub-Zustände** auf `das-meer` hängen an `{ quest: 'side-strandclub', state: 'active' | 'done' }`
  (Baustelle/fertig, Bar-Hotspot, Bühnentext, Bildvariante). Lint meldet `side-strandclub` als fehlend, bis die Quest existiert.
- **`enc-strand-staubfalken`** steht nicht als Kartenbegegnung auf `das-meer` (das-meer hat 0 % Zufall, die Quest löst den
  Kampf per `{ battle }` am Spot `grundstueck-pflock` aus, siehe combat-23).
- **Turbo-Tilda** (N Mi/Sa an `rennhalle-9:boxengasse`), **Krabbe Karl** (`krabbe-karl`/`karls-stein`), Crew-Tagesabläufe
  im Nachspiel, `rom-aria-meer` (`wasserlinie`), `rom-vexaria-konzert` (`strandclub-buehne`), `sonder-letzte-runde`
  (`alte-buehne`), `prep-fahrzeug`/`pers-lio-album` (`rennbahn`): alle Spots aus act23.json sind angelegt.
- **Abspann:** Hotspot `abspann` am `das-meer:wagenplatz` (nur mit Flag `epilog`), Dialog `das-meer-abspann` mit Rückfrage,
  erst dann `{ ending: true }`.
- **Neuer Gegenstand:** `fisch-vom-grill` (Verbrauch, 18 Cr, +35 LP) in `shops-meer.ts`; Icon fehlt (Platzhalter).

## Engine-Lücken

| Was | Wo gebraucht | Notlösung | Vorschlag |
| --- | --- | --- | --- |
| Zufall in Dialogen | Wettschalter (`rennhalle-wetten`) | Sieger hängt am Zyklustag (`cycleDay`), fest je Tag | `{ chance: 0..1 }`-Bedingung mit Seed aus Spielstand/Tag |
| Pokal als Gegenstand | Pokalrennen (`akt-schrottbot-rennen` Stufe 4) | Flag `rennhalle_pokal` + Podest-Text | Andenken `rennhalle-pokal` in items-andenken, falls gewünscht |
| Lichter mit Bedingung | Flutlicht der Rennnacht | eigene Hintergrundvariante `bg-rennhalle-9-rennnacht` | `LightDef.when` |
| Passantenzahl nach Bedingung | Publikum nur zur Rennnacht | `bySlot` nacht 6 (auch an anderen Nächten) | `AmbientDef.byWhen` |
| Begleiter bleibt draußen | „Aria betritt die Halle nie freiwillig“ | Aria kommt mit, eigener Eintrittsdialog (einmal pro Tag), Traversen-Texte je nach Party | `MapDef.companionStaysOutside` |
| Abspann-Fotos als Sammelobjekte | world.md §3.5 das-meer | Fotowand im Abspann-Dialog erzählt | Sammelreihe `abspann-foto-*`, falls gewünscht |
