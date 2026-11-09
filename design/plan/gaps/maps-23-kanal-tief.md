# Paket kanal-tief (pumpwerk-sieben, datentunnel) – Notizen für Integration und Quest-Pakete

Dateien: `game/src/content/parts/maps-23/pumpwerk-sieben.ts`, `game/src/content/parts/maps-23/datentunnel.ts`.
Bilder: `bg-pumpwerk-sieben`, `bg-pumpwerk-sieben-op` (Variante, solange `main-2-kanal` aktiv), `bg-datentunnel`,
`bg-datentunnel-splitter` (Variante bei Flag `epilog`). Keine Händler in diesen Zonen (world.md §3.5), daher keine shops-Datei.

## ersetzt Platzhalter

– (keine)

## Für die Quest-Pakete freigehalten (bitte per mapAdditions anlegen)

| Hotspot-ID (Plan) | Spot | Wer | Hinweis |
| --- | --- | --- | --- |
| `op-nische` | `pumpwerk-sieben:op-nische` | main-2-kanal | Zonen-Hotspot `op-nische-blick` ist ausgeblendet, sobald `main-2-kanal` aktiv oder erledigt ist; danach `op-nische-danach` + `chip-fragment-03` (bei `main-2-kanal` done). |
| (Kanalvolk-Sperre) | `pumpwerk-sieben:kanalvolk-sperre` | main-2-kanal | Zone zeigt nur Looks (`kanalvolk-sperre`, nach `fluchtweg_gesichert` `kanalvolk-sperre-gebaut`). |
| (Gegenmittel) | `pumpwerk-sieben:quantum-aussenstelle`, `datentunnel:splitter-nest` | prep-gegenmittel | Zone gibt in der Außenstelle täglich 1 `quantum-chip-schrott` (Ausschusskiste, nach `aussenstelle_offen`). |
| `nyra-funk` | `datentunnel:nyra-funkpunkt` | prep-turm-plan, pers-nyra-silent-angel | Zonen-Look `funkecke` ist ausgeblendet, solange eine der beiden Quests aktiv ist. |
| (Schlafwandler) | `pumpwerk-sieben:schlafwandler-pumpe`, `datentunnel:schlafwandler-tunnel` | pers-delya-quelle | nur Spots |
| (Auftragsziele) | `auftrag-a` auf beiden Karten, `datentunnel:netzknoten`, `pumpwerk-sieben:aussenstelle-terminal` | job-*, sonder-pumpwerk-pegel | Zonen-Hotspots `netzknoten` und `aussenstelle-terminal` existieren schon (IDs belegt) – Quest-Hotspots bitte mit eigener ID daneben. |

## Flags, die die Zone setzt

- `pumpwerk_druck_abgelassen` – Ventilrätsel (`akt-ventil`, Schlüssel `pumpwerk-ventil`) am Ventilstand gewonnen.
- `ueberlaufrohr_offen` – Handrad geöffnet: nach Ventilrätsel, mit Kanalvolk (`fluchtweg_gesichert` oder `prep-fluchtweg` done), mit `oelkaennchen` oder `[Körper 8]`.
- `aussenstelle_offen` – Quantum-Container offen (Hack `pumpwerk-aussenstelle`, `[Technik 7]`, Dietrich-Chip, `[Ausstrahlung 6]` Bluff oder 60 Cr Bestechung).
- `pumpwerk_kuehlerpumpe_ausgebaut` – `rostlaube-kuehlerpumpe` aus der Hilfspumpe (side-rostlaube aktiv; `[Technik 5]` oder brachial ohne Check).
- `datentunnel_knoten_offen` – Netzknoten gehackt (`datentunnel-netzknoten`) oder `[Technik 7]`; gibt `chip-fragment-06`, `datenwuerfel-20` frei.
- `datentunnel_schrank_offen` – Serverschrank geknackt (`akt-schloss`, Dietrich-Chip, `[Körper 6]`); gibt `chip-fragment-05`.
- `nexus_datentunnel_gespraech` – `[Ausstrahlung 7]`-Frage an Nexus am Lautsprecher (nur Stimmung, frei verwendbar, z. B. für `alesa_zweifel`-Nähe).
- `wartungsleiter_gefunden` – beim ersten Betreten des Datentunnels ab `act2` (onEnter). Der Campus kann damit den Abstieg anbieten.

## Neu angelegt

- Einstieg `pumpwerk-sieben:von-hafenkante` und Hotspot `hafenkante:ueberlaufrohr-einstieg` (mapAdditions, `when: ueberlaufrohr_offen`,
  Reise ins Pumpwerk) – so ist das Überlaufrohr nach dem Öffnen in beide Richtungen nutzbar.
- Begegnung `enc-pumpwerk-molchnest` (2 `kabelmolch` + 1 `kanalratte`, `arena-rohre`) als sichtbare Gruppe am Molch-Nest, umgehbar mit `[Technik 6]` „Kurzschluss“.
- Nexus-Splitter im Nachspiel: sichtbare Gruppe `enc-datentunnel-splitter` (aus combat-23) am Monitor-Nest bei `epilog`, umgehbar mit `[Technik 8]`.

## Für die Integration

1. **Test „Welt-Check an Ausgängen“ scheitert an `kanal-sammler/schott`**, seit der Datentunnel existiert: Das Schott hat
   `when: act2` und `check: gc-110`, und kein Ausgang zum Datentunnel ist ohne `when`/`check` (der Kabelschacht im
   Digitech-Areal hat `when: act2`). world.md: „act2, `schottschluessel` oder `gc-110` (Zugang vor act2)“.
   Vorschlag in `parts/maps/kanal-sammler.ts`: Ausgang `schott` ohne Check mit `when: { any: [{ act: 2 }, { item: 'schottschluessel' }] }`,
   dazu ein Hotspot „Drehrad am Schott“ mit `check: 'gc-110'` und `{ travel: 'datentunnel', entry: 'von-kanal-sammler' }` für den Zugang vor Akt 2.
   Alternativ den Kabelschacht im Digitech-Areal ohne `when` lassen (world.md §3.2: Kabelschacht „–“).
2. `hafenkante`-Look `ueberlaufrohr` („Von innen verriegelt“) bräuchte `hideWhen: { flag: 'ueberlaufrohr_offen' }`, damit er nicht neben dem neuen Einstieg steht.
3. `side-rostlaube` Schritt „kuehlerpumpe“ nennt das Pumpwerk nicht; Text könnte „… oder ab Akt 2 aus der Hilfspumpe im Pumpwerk Sieben ausbauen“ ergänzen.

## Engine-Lücken (mit Ersatz)

- **Abkürzung am Netzknoten** (Plan: „öffnet Abkürzung“): Es gibt keine bedingte Begehbarkeit (`blockVariants`). Ersatz: Der Hack öffnet die Wartungsklappe mit Beute. Vorschlag: `MapDef.blockVariants: { when, block }[]`.
- **Lichter mit Bedingung:** Die OP-Lampe und das grüne Splitter-Licht leuchten immer. Vorschlag: `LightDef.when`.
- **Ausgang mit Effekt:** `wartungsleiter_gefunden` wird per onEnter gesetzt, weil `ExitDef.effects` fehlt.
