# Lücken und Wünsche: quest-main-a (main-0-digitech, main-1-ankunft, main-1-probezeit, main-1-dexter)

## Engine

| Was | Wo gebraucht | Vorschlag | Notbehelf jetzt |
| --- | --- | --- | --- |
| Effekt „Uhr stellen“ (`{ setClock: minutes }`) | Prolog → Ankunft 16:30; „an der Bar bis 18 Uhr warten“ | Effekt `setClock` (nur vorwärts, gleicher Tag) | onEnter-Treppe am Bahnhof (`ankunft-uhr-*`) und Wartewahlen je 10-Minuten-Fenster (`_dsl.ts waitChoices`) |
| Spielfigur vorübergehend als andere Figur (Laufblatt, Werte) | Prolog als Raven (world.md §5.1) | `PlayerState.stand-in?: NpcId` oder Cutscene-Effekt `{ playAs: 'raven', stats }`, Laufblatt `raven-walk`, Porträt Raven | Erzählt („Du spielst Raven“), Ravens Werte als Tags `[Reflexe 6]`, `[Technik 4]` per `requires` ausgegraut; Laufblatt und Kampfwerte bleiben die der eigenen Figur |
| Prolog-Datum/Uhr im HUD | Prolog zeigt „Mo, Tag 1, 06:00“ | HUD-Override per Flag/Map (`MapDef.clockLabel?: '2079'`) | – |
| `QuestStepDef.marker.at` als Spot-Name | alle Quests | `at: Point | string`, aufgelöst wie `mapAdditions` | Koordinaten der Zonenspots abgeschrieben (Stand 09.11.); verschiebt eine Zone einen Spot, wandert der Marker nicht mit |
| `home` abhängig vom Fortschritt | Niederlage vor `main-1-probezeit` landet im noch gesperrten Crew-Quartier | `home` als Liste mit `when` oder Zonen-`shelter` als Niederlage-Ziel | hingenommen; Prolog hat ein onEnter-Sicherheitsnetz |
| Niederlage-Flags in Begegnungen | Questschritte, die nach einer Niederlage weitergehen sollen | `EncounterDef.onLose` setzt Flags (Kampf-Agent) | Schritte akzeptieren schon die Flags, siehe unten |

## Für andere Agenten

- **Kampf** (`parts/combat/encounters-act1.ts`): bitte `onLose`-Flags setzen, die meine Schritte schon abfragen:
  `enc-bahnhof-abzieher` → `{ setFlag: 'abzieher_verloren' }`, `enc-hv-ripper-tisch` → `{ setFlag: 'ripper_kampf_verloren' }`.
  (Ohne Flag kann man nach einer Niederlage einfach einen anderen Weg wählen: Die Szenen laufen beim nächsten Betreten erneut.)
- **Figuren**: `recruit`-Bedingung von `vega` und `aria` bitte `{ quest: 'main-1-dexter', state: ['active', 'done'] }`
  (sie kommen am Treffpunkt in die Party, world.md „Party: Vega + Aria“). Die Belohnung von `main-1-dexter` ruft `recruit`
  zur Sicherheit noch einmal auf.
- **Figuren** (`bruno-brecher`): Tagesgespräch solange `notFlag hv_einlass` und `main-1-probezeit` nicht erledigt auf
  `main-1-probezeit-bruno` zeigen. Fallback-Hotspot `probezeit-bruno` an `neon-gasse:hv-eingang` gibt es schon (A/N).
- **Figuren** (`dexter`): Bis `main-1-dexter` erledigt ist, ist das Questgespräch nur über die Hotspots
  `dexter-buero-tuer` / `dexter-buero-fenster` erreichbar; sein Tagesgespräch darf darauf verweisen („Nicht jetzt, Aria steht vor der Tür!“).
- **Checks**: `gc-32` soll nach `gc-05` automatisch bestehen. Ich setze dafür zusätzlich `probezeit_virus_entfernt`
  (falls `seen: 'check:gc-05'` nicht reicht). `gc-11` ist `hiddenIfFailed` – passt.
- **Nebenquests**: `main-1-dexter` startet `side-chrome-10` (Gutscheinweg, Flag `dexter_gutscheine`, 3 × `chrome-10-gutschein`).
  `side-chrome-10` sollte am Ende `dexter_schuldenfrei` setzen.
- **Nachrichten** (10.5): Meldungen für `main-1-probezeit` / `main-1-dexter` erledigt sind nicht von mir angelegt.
- **Bilder** (keine Plates vorhanden, jetzt Erzähltafeln `black`): Wunsch-Plates `cut-prolog-rohr` (Raven am Rohr,
  Blade im Gegenlicht der Tür, Teddyfell-Mantel, rote Alarmbeleuchtung), `cut-prolog-gericht` (drei Standbilder
  nebeneinander), `cut-ankunft-bahnhof` (U-Bahn fährt ein, Ich-Perspektive auf den Bahnsteig, zwei Kapuzen),
  `cut-probezeit-ecktisch` (Ripper, Pistole auf dem Tisch, drei Kinder, Hunter mit gesenkter Sonnenbrille im Hintergrund).
  Die Beats in `prolog-verrat`, `main-1-ankunft-intro` können dann `image: 'cut-…'` bekommen.

## Flags (von mir gesetzt, für andere lesbar)

`prolog_done`, `prolog_raven_vertraut` | `prolog_raven_misstrauisch`, `prolog_tuer_offen`, `prolog_geschlichen`,
`ankunft_abzieher_geloest`, `gleis_abkuerzung`, `hunter_nachricht`, `ankunft_kinder_versprochen`, `hv_einlass`,
`probezeit_spaet`, `probezeit_ripper_geloest`, `probezeit_gespraech`, `probezeit_bestanden`, `ripper_kennt_dich`,
`probezeit_virus_entfernt`, `nyra_probezeit_geholfen`, `vexaria_erstkontakt` (Vex × Aria haben sich im Hinterzimmer
kennengelernt, Spitznamen „Postbotin“/„Zöpfe“/„Großmaul“ etabliert), `dexter_trupp`, `dexter_geld_500` | `dexter_geld_800`,
`dexter_gutscheine`, `dexter_rabatt` (Dexters Schrott: Freundschaftspreis – Händler-Agent), `dexter_heimlich`,
`dexter_schuldenfrei`, `dexter_anteil_zwanzig`, `dexter_abgerechnet`.
