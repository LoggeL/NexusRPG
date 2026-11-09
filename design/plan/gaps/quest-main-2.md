# Lücken – quest-main-2 (Hauptgeschichte Akt 2 „Der Chip“)

Ordner: `game/src/content/parts/quest-main-2/`. Dateien: `_lib.ts` (Helfer, kein Teil), `main-2-bruch.ts`,
`main-2-kanal.ts`, `main-2-countdown.ts`, `main-2-krisensitzung.ts`, `planungstafel-party.ts`, `freie-phase.ts`,
`prep-outfits.ts`, `prep-ausweise.ts`, `prep-gaesteliste.ts`, `prep-fahrzeug.ts`, `prep-turm-plan.ts`,
`prep-gegenmittel.ts`. Dazu die freigegebene Übergabe in `quest-main-b/planungstafel.ts`.

## ersetzt Platzhalter
- keine (die Akt-2-Hauptquests und die sechs Party-Vorbereitungen gab es vorher nicht).

## Ablauf (Kurzfassung)
1. `planungstafel` (quest-main-b) → „Heute Nacht losschlagen“ wartet bis 22:00 → Cliffhanger, jetzt mit „AKT 2 · DER CHIP“
   statt „Fortsetzung folgt“: `setAct 2`, `startQuest main-2-bruch`, Reise `quantum-campus/bruch-treffpunkt` (0 min).
   Alte Spielstände nach „Fortsetzung folgt“ bekommen an der Tafel wieder „Heute Nacht. Diesmal wirklich.“
2. `main-2-bruch` → Flucht-Cutscene → Schlaf → `m2b-morgen` im Crew-Quartier.
3. `main-2-kanal` (autoStart nach dem Bruch) → Cutscene `main-2-kanal` → Reise `dantes-werkstatt`, `startQuest main-2-countdown`.
4. `main-2-countdown` → Freeze `main-2-dante-freeze` (Dante tritt bei) → Telefon Hunter.
5. `main-2-krisensitzung` (autoStart) im `hv-hinterzimmer` → `releaseparty_geplant`, `stick-hunter`, sechs `prep-*` starten.
6. Ab drei `prep_*`: Schritt `preps` setzt `party_bereit`. Danach bietet die Planungstafel (`m2p-tafel`, Hinterzimmer und
   Pinnwand im Quartier) „Releaseparty starten“ an: warten bis 20:00, dann `setAct 3`, Party Aria + Dante,
   Reise `quantum-campus/party-vorplatz`. `main-3-einlass` startet von selbst.

## Engine / Effekte
- **Keine Uhr-Stell-Wirkung, keine Uhrpause.** Der Bruch beginnt um 22:00 (Wartetreppe mit `clockBetween`). Reisen
  innerhalb des Bruchs kosten 0 Minuten, aber das Erkunden läuft weiter (0,7 s je Spielminute). Bummelt jemand länger als
  vier Stunden, kann um 02:00 der Zusammenbruch mitten im Labor kommen. Wünschenswert: `{ pauseClock: true }` für Heists
  oder `{ setClock: 1320 }`.
- **Kein „aus der Crew nehmen“.** Nach `nyra_zurueckgelassen` ist Nyra nur aus der Party entlassen (`dismiss`), aber
  weiter rekrutiert. Über das Party-Menü kann man sie wieder mitnehmen, obwohl sie im Turm sitzt. Dasselbe gilt für Aria in
  Variante A zwischen Bruch und Countdown. Gebraucht wird `{ unrecruit: npc }` oder eine Sperrbedingung je Begleiter
  (z. B. `CompanionDef.unavailableWhen`).
- **Schutzperson Proband 47:** Die Kampfvariante `enc-kanal-b-proband*` nutzt `unit: 'passant-anzug'` (Zivilperson mit
  Passanten-Laufblatt, Name „Zivilperson“). Schöner wäre ein eigener Name/Sprite im `rescue`-Ziel (`name`, `sprite`).
- **Outfit-Stufen:** `prep-outfits` setzt `outfits_schlicht` (Ausstrahlung +1) bzw. `outfits_glanz` (+2) und gibt
  `outfit-ordentlich` bzw. `outfit-party`. Die +1/+2 auf der Party muss quest-main-3 über diese Flags als Check-Bonus
  auswerten (gc-38 kennt bisher nur `outfit-party`).
- **Minispiel-Ergebnisse mit Dialog-Fortsetzung:** Countdown, Keksalarm, Kanal-Schleichen und Nyras Funk hängen
  `{ dialogue }` an `win`/`lose`. Das setzt voraus, dass `finishMinigame` die Anfragen weiterreicht (wie bei
  he-fraeulein-pixel-2). Bitte im Spiel prüfen.

## Integration / fremde Pakete
- **Eigene Reise-Hotspots (Präfix `m2b-`)** auf quantum-campus, quantum-foyer und quantum-labor statt der Kartenausgänge.
  Sie liegen an Spots der Karten (`seiteneingang`, `lueftungsgitter`, `haupttor`, `brueckenkopf`, `laboraufzug`,
  `chip-tresor`, `xion-tuer`, `op-tisch`, `nyras-arbeitsplatz`). Die Karten sollten ihre eigenen „look“-Hotspots an diesen
  Stellen während `main-2-bruch` ausblenden (`hideWhen: { quest: 'main-2-bruch', state: 'active' }`), damit es keine
  doppelten Klickziele gibt.
- **Vex × Aria:** `vexaria/zerberster.ts` erwartet `seen('rom-vexaria-rettung')` (Plate `cut-rom-vexaria-rettung`,
  „akt2.ts“). Diese Szene gehört dem Vex×Aria-Paket und fehlt noch. Ohne sie startet `rom-aria-ausfall` für Vex in Variante A
  nie. main-2-kanal hat nur einen kurzen eigenen Vex-Moment an der Trage (`vex_trage_angehalten`) und main-2-countdown
  einen beim Aufwachen. Vorschlag: `rom-vexaria-rettung` als onEnter der `dantes-werkstatt` mit
  `all(playerIs vex, aria_gechippt, kanal_bei_dante)` vor `m2c-start`, oder als Fortsetzung von `m2k-danach/aria-vex`.
- **Jimmy in Variante B:** Nach der Befreiung im Pumpwerk rennt der gechippte Jimmy zurück zu Quantum
  (`jimmy_zurueck_zu_quantum`). Das passt zum Tagesablauf aus act23.json (quantum-labor `probanden-liege`, bis
  main-3-labor). Proband 47 bekommt in main-2-countdown seinen Chip gezogen (`proband_frei`).
- **Aria in Variante A:** Dante zieht ihren Chip in main-2-countdown (`aria_chip_entfernt`, `recruit aria`). Den toten
  Zerberster übernehmen `pers-aria-zerberster` / `rom-aria-ausfall` (vexaria, npc-crew).
- **nexus-chip-defekt bleibt erhalten:** Dante baut die Blocker aus einer Probe. main-3-nexus (Upload 2) braucht den Chip
  noch.
- **prep-fahrzeug:** zählt automatisch, sobald `side-rostlaube` erledigt ist (`rostlaube_faehrt` /
  `prep_fahrzeug_rostlaube`).
- **Ödnis ohne Rostlaube:** Marlas Konvoi am `schrottmarkt:karawanenstand` (Hotspot `m2-konvoi`, 90 min) nach main-2-kanal.
- **Fremde Quests als Bedingung:** `prep-fluchtweg`, `side-jimmys-chip`, `side-feierabend-fuer-kessel`, `side-live-dabei`,
  `side-rostlaube`, `side-teekraenzchen`.

## Gesetzte Flags (für andere Pakete)
- Bruch: `bruch_rolle_drinnen` / `bruch_rolle_bruecke`, `bruch_drin`, `bruch_im_labor`, `bruch_funk_tot`,
  `bruch_abschirmung`, `bruch_notschalter`, `bruch_ausgang`, `bruch_overwatch_fertig`, `bruch_vega_schuss`,
  `bruch_flucht_kanal` / `bruch_flucht_lieferzone`, `bruch_entkommen`, `nexus_erwacht`, `nyra_zurueckgelassen`,
  `vex_nyra_umgedreht`, `aria_gechippt` + `aria_verkauft_an_ripper` (A) bzw. `aria_entkommen` + `jimmy_gechippt` oder
  `proband_gechippt` (B).
- Kanal: `kanal_befreit`, `kanal_freigekauft` / `kanal_attrappe` / `kanal_bluff` / `kanal_kampf` / `kanal_geschlichen` /
  `kanal_ueberrumpelt`, `kanal_gully_hilft`, `kanal_sperre_kanalvolk`, `kanal_bei_dante`, `jimmy_zurueck_zu_quantum`,
  `proband_gerettet`, `vex_trage_angehalten`. Fahndung +2 über die Belohnung.
- Countdown: `countdown_entschaerft` / `countdown_geworfen`, `aria_chip_entfernt`, `proband_frei`, `dante_beigetreten`.
- Krisensitzung: `hunter_aufgerichtet` / `hunter_von_raven_ueberzeugt`, `party_idee_spieler`, `keksalarm_gerettet`,
  `releaseparty_geplant`, `party_bereit` (ab drei Vorbereitungen).
- Vorbereitungen: `prep_outfits` (+ `outfits_schlicht` / `outfits_glanz`, `aria_shirt_drunter`), `prep_ausweise`
  (Item `party-ausweis`), `prep_gaesteliste` (+ `gaesteliste_<weg>`), `prep_fahrzeug` (+ `fahrzeug_<art>`),
  `prep_turm_plan` (+ `turm_plan_<quelle>`), `prep_gegenmittel` (3 × `chip-blocker`).

## Tests
- `vitest run src/content` meldet zu diesem Ordner nichts. Die roten Tests betreffen fremde Pakete (Merge-Warnungen
  npc-welt/npc-quantum, `rostz-labyrinth`, `kanal-sammler/schott`, unbekannte Quests wie `pers-marla-brunnen`).
