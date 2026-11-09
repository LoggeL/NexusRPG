# Lücken: Ripper, Barkeeper, Kameramann, Collin, Delya – Akt 2, Akt 3, Nachspiel (`content/parts/npc-medien-club/`)

Die Akt-1-Notizen dieses Ordners sind erledigt bzw. stehen in `design/plan/gaps-done.md`. Neu in diesem Lauf:
je Figur eine Datei `<id>-23.ts` (keine Inhaltsdatei, nur Bausteine), die `<id>.ts` in Figur und Teil einbaut.

**Ersetzt Platzhalter:** keine. `pers-ripper-taschenuhr`, `pers-collin-pixel` und `pers-delya-quelle` (Platzhalter in
`parts/integration/luecken.ts`) baue ich NICHT; die Start-Wahlen liegen in den Menüs (Ripper zusätzlich in Akt 2,
falls man in Akt 1 nur „irgendwann“ versprochen hat). Fehlen die Quests am Ende, bitte einem Quest-Paket geben.

## Was jetzt da ist
- he-<id>-8/10 aller fünf Figuren als volle Szenen (Checks + Weg ohne Check, Belohnung). Collin zusätzlich
  Herz-Ereignis `rom-collin-flutmauer` (♥8, `flutmauer`, abends, nach dem Romanze-Duett): Date mit Geständnis, Ablehnen
  setzt `collin_romanze_abgelehnt` (alles weitere läuft dann als Freundschaft). Kuss = `he-collin-charleston-10`
  (Tafel `cut-rom-collin-testbild`, oder ohne Liveküssen „Nicht vor sechzigtausend Leuten“), Nacht wöchentlich
  (`woche_collin_nacht`, nach „Ein andermal“ erst morgen wieder), Morgen danach wie gehabt.
- Tagesgespräche: Chip-Panik, Drohnen, Chrome 10, Nyra weg, Aria gechippt/zurück, Dante, Party-Plan, Partynacht
  (Foyer bis `main-3-einlass` erledigt, dann Podest), erste Reaktion auf jedes Ende + Nachspiel-Alltag, Master-Modus.
- Tagesabläufe nach act23.json (vorangestellt) plus Nachspiel: Barkeeper Sa/So abends `das-meer/strandclub-bar`
  (nach `side-strandclub`), Kameramann Sa/So abends `das-meer/duenengras`, Collin (Paar) Sa/So `das-meer/lagerfeuer`,
  Delya (Ende 1) Sa/So tags `das-meer/strand`, Collin/Delya im Master-Modus Dauersendung `nx1-studio/studio-set`.
- Telefon: `tel-delya-pumpwerk` (Hinweis auf Aria im Pumpwerk), `tel-collin-party`, `tel-collin-flutmauer`,
  `tel-kameramann-meer`.
- Fähigkeiten: `ripper-ehrlicher-restposten` (nach he-ripper-10), `barkeeper-stiller-vers` (nach he-barkeeper-8),
  per `abilityRules`. Ripper verkauft während der Party-Vorbereitung täglich 1 `quantum-chip-schrott` (60 Cr) für
  `prep-gegenmittel`.

## Lücken
1. **Begleiterwerte nach Stufe.** `CompanionDef.stats` sind fest; `partyFromCampaign` übergibt zwar `level`, skaliert
   aber weder LP noch Schaden. world.md §4.6 („Werte auf Stufe 5, skalieren mit der Spielfigur“) ist damit für alle
   Begleiter offen. Vorschlag: in `partyFromCampaign` `hp × (1 + 0,06 × (level − 5))`, Schaden +1 je 3 Stufen, oder
   `CompanionDef.statsWhen?: { when, stats: Partial<UnitStats> }[]`. Ich habe die Werte deshalb nicht angefasst.
2. **Söldnerlohn pro Tag (Ripper).** Weiter einmalig 30 Cr (Master-Modus 60). Mit `daily`-Regeln baubar, sobald ein
   Effekt „Begleiter entlassen, wenn Credits < n“ geht (`dismiss` hat keine Bedingung, `credits: -30` scheitert bei
   zu wenig Geld als ganze Liste). Vorschlag: `CompanionDef.dailyFee`.
3. **Eifersucht/Trennung bei Collin.** Andere Figuren setzen keine `flirt_<id>`-Flags (nur Aria wertet sie aus); Collin
   setzt `flirt_collin-charleston`. Collins eigene Warnung/Trennung fehlt, bis alle Flirts ein gemeinsames Flag setzen.
4. **Öffentliche Meinung.** Collins Sondersendung (`collin_sondersendung_wahrheit`) und Delyas „Ungefragt“
   (`delya_sendung_wahrheit`, `delya_kassette_gesendet`) wären natürliche `meinung_plus_*`-Quellen; die Liste in
   `quest-main-3/_lib.ts` ist fest. Vorschlag: dort aufnehmen.
5. **Neue Flags für andere:** `ripper_kanal_geklaert/_reue/_eingeschuechtert`, `ripper_fairer_preis`, `ripper_ehrlich`,
   `ripper_master_angst`, `barkeeper_stiller_vers`, `barkeeper_name_gehoert`, `barkeeper_master_vers`,
   `kameramann_premiere`, `kameramann_film_fertig`, `kameramann_aria_spur`, `kameramann_master_film`,
   `collin_date_flutmauer`, `collin_gestaendnis`, `collin_romanze_abgelehnt`, `collin-charleston_romanze_zusammen`,
   `collin_aria_hinweis`, `collin_master_erinnert`, `delya_43_leben`, `delya_kassette_senden/_gesendet`,
   `delya_ungefragt`, `delya_aria_hinweis`, `delya_master_buch`. Die Master-Flags (`collin_master_erinnert`,
   `delya_master_buch`, `kameramann_master_film`, `ripper_master_angst`) eignen sich als Bausteine für `side-zweite-chance`.
6. **Herz-Ereignisse und Anwesenheit.** Auslöser ist nur die Karte. Für he-collin-charleston-10 (Studio statt Café) und
   he-kameramann-8 (Kai statt Filmposten) legt der Tagesablauf die Figur abends dorthin, solange das Ereignis fällig ist.
