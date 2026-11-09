# quest-main-3: Hauptstrang Akt 3 (Partynacht)

Ordner `game/src/content/parts/quest-main-3/`: `_lib.ts` (Helfer, keine Teil-Ausfuhr), `main-3-einlass.ts`, `main-3-labor.ts`,
`main-3-gedankenkontrolle.ts`, `main-3-nexus.ts`, `main-3-blade.ts`. Platzhalter gab es für main-3 keine.

## Ablauf und Übergaben

- Kette: `main-3-einlass` (autoStart Akt 3 ohne `epilog`) → `main-3-labor` → `main-3-gedankenkontrolle` → `main-3-nexus` → `main-3-blade`
  → `main-epilog` (quest-enden, autoStart nach main-3-blade). **main-3-blade löst kein Ende aus**; die Enden spielt
  quest-enden über `ende-landeplatz` (Varianten nach `blade_angekettet` / `blade_entkommen` / sonst gefasst).
- Ergebnis-Flags für Enden/Nachspiel: `upload_stick | upload_umschreiben | upload_ueberzeugt | upload_master`,
  `blade_gefasst` (auch bei angekettet), `blade_angekettet`, `blade_entkommen`, zusätzlich `blade_ergeben` (gc-48),
  `blade_mantel_zerrissen` (gc-49), `stadt_glaubt` (Stick bei positiver Meinung), `nexus_ueberzeugt` (gc-47 vor dem Kampf).
- Öffentliche Meinung: Flags `meinung_m3 … meinung_p3`, `meinung_positiv` (≥ +1), `meinung_hoch` (≥ +2), `meinung_negativ` (≤ −1).
  Akt 1/2 können `meinung_plus_*` setzen (Liste `MEINUNG_PLUS_FLAGS` in `_lib.ts`); zwei davon zählen als ein Punkt.
- Weitere gesetzte Flags: `einlass_*` (Wege, teils von maps-23/quantum-campus), `interview_gefuehrt`, `nyra_befreit`,
  `alesa_abgelenkt`, `alesa_zweifel`, `labor_frei | labor_gefangen`, `peilsender_kuschel`, `blade_blamiert`, `xion_fehlt`,
  `chip_genommen | chip_abgelehnt`, `chip_getarnt`, `raven_zurueck`, `raven_dante_gestaendnis`, `xion_gepackt`,
  `nexus_rebelliert`, `kern_erreicht`, `fx60_eingesteckt`.

## Engine-Lücken

1. **Zeit friert im Finale nicht ein.** Was: Die Partynacht läuft über Mitternacht; der 02:00-Zusammenbruch (Schlafzwang)
   könnte mitten in Rede, Kern oder Landeplatz zuschlagen. Wo: alle main-3-Quests. Vorschlag: Effekt/Flag
   `{ freezeClock: true }` bzw. Kartenfeld `noCollapse`, solange `main-3-*` aktiv ist.
2. **Verlorener Kampf reist nach Hause.** Was: Die Niederlage bringt die Gruppe ins Crew-Quartier, bevor der Folgedialog
   läuft. Wo: alle Akt-3-Kämpfe. Umgehung: Niederlagenzweige reisen per `travel` zurück (Foyer/Himmelsgarten/Serverkern/
   Landeplatz) mit `heal: 'full'`, Wiederholungs-Hotspots bleiben. Vorschlag: `EncounterDef.onLose: 'stay'`.
3. **Cutscene-Beats nicht bedingbar.** Was: Varianten (Rede frei/gefangen) brauchen eigene CutsceneDefs. Vorschlag:
   `CutsceneBeat.when`.
4. **„2 Runden gesteuert“ (Chip genommen ohne Crew-Halt).** Was: world.md will, dass Nexus die Spielfigur 2 Kampfrunden
   steuert. Wo: `main-3-gedankenkontrolle-chip` Knoten `gesteuert`. Umgehung: erzählt + `damage 15` + Flag `chip_gesteuert`.
   Vorschlag: Kampfstatus „Gesteuert“ als Startstatus über Flag (`EncounterDef.startStatus`).
5. **Vorbereitungen ändern Bosskämpfe nicht mechanisch.** Was: `schwestern_gewarnt` (Sybellas Stromschnitt = eine Runde
   Pause) und `chip-blocker` im Kern sowie Arias „Ermutigt“ vor dem Dach können keinen Kampfstatus setzen. Umgehung:
   Stromschnitt = `heal: 'full'` vor dem Kampf, Aria = `checkBuff` „Ermutigt (Aria)“ (+1 Ausstrahlung, gilt für gc-48).
   Vorschlag: Effekt `{ battleBuff: { status, rounds } }` für den nächsten Kampf.
6. **`meinung` nur als Flags.** Was: Kein Zahlenzähler; Zwischenstände werden als Flag-Einheiten gezählt
   (`atLeast`). Vorschlag: `counter`-Effekt/Bedingung (`{ counter: 'meinung', min }`).
7. **Raven ist nicht romance-freigegeben.** Die Wahl `[Romanze] Geständnis` in `main-3-gedankenkontrolle-raven` hängt an
   `{ romance: 'raven' }` und ist damit ruhend. Freischalten nur in content/romance.ts (nicht mein Ordner).
8. **gc-48 vs. enc-dach-blade-allein.** world.md: gc-48 → Blade ergibt sich. combat-23 hat `enc-dach-blade-allein` „nach
   gc-48“ gebaut. Umsetzung: gc-48 = Kapitulation ohne Kampf; `enc-dach-blade-allein` läuft, wenn die Garde schon zweifelt
   (`blade_blamiert` aus dem Kuschel-Köder oder `blade_zweifel` aus Akt 2). Das Intro des Encounters passt dazu.
9. **onEnter-Reihenfolge Serverkern.** maps-23 spielt `server-kern-ankunft` (Erzählung) vor meiner Cutscene
   `main-3-nexus`; die Texte sind darauf abgestimmt (Kugel dreht sich, Gesicht erscheint).

## Hinweise an andere Agenten

- **npc-quantum (blade.ts):** Blade steht laut Plan bis `main-3-blade` erledigt an der `rednerbruecke`. Nach der Rebellion
  (`nexus_rebelliert`) sollte er am `gleiter`/`landeplatz` stehen (bzw. ab `main-3-gedankenkontrolle` erledigt), sonst steht er
  während des Landeplatz-Showdowns doppelt. Ich setze bewusst keinen NPC per mapAdditions.
- **npc-quantum (xion-venom, alesa-zero):** nach `nexus_rebelliert` sind Xion und Alesa von den Gästen festgesetzt; bei
  `xion_fehlt` ist Xion weg (Helikopter-Lüge gc-43).
- **maps-23 quantum-campus:** Einlass-Wege Haupteingang/Lüftung bleiben dort; ich nutze nur deren `einlass_*`-Flags.
- **quest-enden:** `ende-landeplatz` setzt einen anwesenden Blade voraus außer bei `blade_entkommen`; ich setze bei allen
  Fassungen genau eins von `blade_gefasst` (ggf. mit `blade_angekettet`) oder `blade_entkommen`. Hunter, Raven und Kessel
  treten in meinem Schluss nur kurz auf (Kessel per Telefon `tel-kessel-unterwegs`), die Festnahme selbst liegt bei euch.
- **Manifest:** Plates `cut-main-3-einlass`, `-labor`, `-gedankenkontrolle`, `-nexus`, `-blade` liegen unter
  `game/public/assets/cut/`; der Manifest-Eintrag ist Sache des Hauptagenten.
- **Prüflauf:** Zum Zeitpunkt der Abgabe brach `vitest run src/content` an einem Syntaxfehler in
  `parts/vexaria/akt2.ts` ab (fremder Ordner, Zeile 67, Apostroph in „'ner“). Ersatzweise lief content.test.ts mit dieser
  Datei als Stub: keine PART_WARNINGS, keine Verweisfehler und keine Check-ohne-Alternative für main-3. Nach dem Fix in
  vexaria bitte einmal regulär nachprüfen.
