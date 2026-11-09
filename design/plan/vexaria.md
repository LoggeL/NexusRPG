# Vex × Aria „Nicht anhalten“ – Ablauf im Spiel (Akt-1-Stand)

Dateien: `game/src/content/parts/vexaria/` – `_util.ts` (Bausteine), `aria.ts` (NpcDef, Tagesgespräche, he-aria-2/4/6),
`aria-akt1.ts` (Zerberster-Herz A1–A4), `rivalinnen.ts` (1–3, Ripper-Tag), `funken.ts` (4–6), `bruch.ts` (Akt-1-Brücke, 7–8),
`hoehepunkt.ts` (9–11), `danach.ts` (12–13, Crew-Kommentare), `system.ts` (Tageswechsel, Wochenzähler).
Abweichungen vom Kanon und Wünsche an andere: `gaps/vexaria.md`.

## Grundregeln

- Jede `rom-vexaria-*`-Station verlangt `{ playerIs: 'vex' }`. Die Aria-Stationen `rom-aria-*` und `he-aria-2/4` laufen für alle; `he-aria-6` nur ohne Vex (bei Vex ersetzt durch Station 3).
- **Eine Station pro Tag** (beide Stränge): Flag `aria_heute`, gesetzt am ersten Knoten jeder Station. Ausnahmen: Station 7 läuft in derselben Nacht wie der Streit, 10 + 11 zählen als eine.
- **Tageswechsel** (`system.ts`, Engine-Regeln `GameContent.daily`): Jeder neue Tag (Schlaf oder Zusammenbruch) löscht `aria_heute` und zählt „zwei Tage warten“ weiter (`aria_warte2` → `aria_warte1` → frei = `WARTEN_VORBEI`). Kein Kartenwechsel nötig.
- **Woche:** `vexaria_nacht_woche`, `vexaria_mast_woche` und `vexaria_rennen_woche` fallen montags. `vexaria_rate_diese_woche` (Ripper-Tag) fällt an jedem anderen Tag.
- **Romanze/Freundschaft:** `twin()` legt `<id>` (Romanze) und `<id>-fs` an. Die Freundschaftsfassung markiert `<id>` als gesehen, Folgestationen prüfen also immer `{ seen: '<id>' }`.
- Herz-Ereignisse starten beim **Betreten** der Karte, nach den onEnter-Auslösern – und erneut, sobald auf derselben Karte die Tageszeit (oder der Tag) wechselt. Raus und wieder rein ist nicht mehr nötig.
- **Kampf:** Aria trägt die Duo-Aktionen als `CompanionDef.duo` (Express-Zustellung für Vex ab ♥6, Rückendeckung nach Station 12, Rücken an Rücken, Wachhunde mit Vega, Abrissbirne mit Jimmy); im Streit/Krach ruhen Duos und „Unkaputtbar“ (`abilityRules`). Anfahrt 15 Minuten nur im Status „zusammen“ oder mit `funk-kanal-neun`, sonst 30 (`callMinutesWhen`).
- **Beschwingt** gilt bis Tagesende für alle Ausstrahlung-Checks (`checkBuff.forDays: 0`, `consumes: false`).

## Stationen

| # | ID | Karte · Zeit | Bedingung (zusätzlich V, `aria_heute` frei, nicht gesehen) | Ablauf / Ergebnis |
|---|----|--------------|------------------------------------------------------------|-------------------|
| 1 | `rom-vexaria-schutzgeld` | `loetgassen` · A | ♥4, `main-1-dexter` erledigt | Ohne Tafel. Setzt `vexaria_wette`. |
| 2 | `rom-vexaria-luecke` | `neon-gasse` · N, Fr/Sa | ♥5, `vexaria_wette` | Dialog → Tafel → Zieldialog → Reise `loetgassen`/`dach-taubenschlag`. Setzt `vexaria_luecke_gemieden`, ggf. `vexaria_limo_schuld`. |
| A1 | `rom-aria-training` | `hafenkante` · A/N | ♥6; bei Vex erst nach 2 | Tafel `cut-rom-aria-training`. |
| 3 | `rom-vexaria-armdruecken` | `high-voltage` · A | ♥6, 2 + A1 gesehen | Tafel zuerst, dann Wahl inkl. Minispiel `akt-armdruecken`. Setzt `vexaria_hand`, ggf. `vexaria_armdruecken_sieg`. Danach Arm-Wartung bei Dante (`dante.ts`, Flag `vexaria_armwartung`). |
| A2 | `rom-aria-werkstatt` | `dantes-werkstatt` · T, Di/Do | ♥7, A1; bei Vex nach 3 | Gibt `zerberster-gravur`, setzt `aria_unfall_erzaehlt`. |
| A3 | `rom-aria-dach` | `neon-gasse` · N 22–01 Uhr | ♥8, A2 | Telefon `aria-ruf-dach`. Bei Erfolg `aria_romanze_angebahnt`; „zu schnell“ → `aria_date_spaeter`, später Tagesgespräch `aria-date-nochmal`. Startet „zwei Tage warten“. |
| 4 | `rom-vexaria-bude` (`-fs`) | `loetgassen` · N 21–01 Uhr | ♥8, A3; Romanze: R + `angebahnt` | Tür → Tafel → Wahl. Kronkorken setzt `vexaria_kronkorken` + gibt `aria-kronkorken`. Romanze: `vexaria_daumen`. |
| 5 | `rom-vexaria-tanz` (`-fs`) | `high-voltage` · N, Fr/Sa | 4; Romanze: R + `angebahnt` | Romanze: Kiki/Eifersucht → Tafel → langsamer Tanz → Gasse (`vexaria_knutsch` möglich) → Reise `neon-gasse`. Setzt `vexaria_eifersucht`. Freundschaft mit optionalem `akt-tanz`. |
| A4 | `rom-aria-albtraum` | `neon-gasse` · N 23–02 Uhr | ♥8, A3, zwei Tage gewartet | Telefon `aria-ruf-albtraum`. Vex-Zusatzzeile „zwei Kids“. Setzt `aria_albtraum_geteilt`. |
| 6 | `rom-vexaria-oberlicht` (`-fs`) | `hafenkante` · A/N | A4; Romanze: R + `angebahnt` | Dialog → Tafel → Schluss („Stern“). Setzt `vexaria_oberlicht`. Telefon `aria-vex-bitte`. |
| B1 | `rom-vexaria-ripperdeal` | `high-voltage` · A | ♥8, 6, Akt 1 | Akt-1-Brücke statt `rom-aria-ausfall`: allein (`vexaria_deal_allein`, Schaden) oder mit Aria (`vexaria_deal_mitgenommen`, „Umdrehen“ ausgegraut, ♥ −30). |
| B2 | `rom-vexaria-streit` (`-fs`) | `neon-gasse` · A | B1, am Folgetag | Statt `rom-aria-streit`, Weg `alleingang`. Romanze: `aria_romanze_streit` (angebahnt fällt); Freundschaft: `aria_krach`. Optional `aria_streit_gehoert`. |
| 7 | `rom-vexaria-funkstille` (`-fs`) | `loetgassen` · N 23–02 Uhr | B2 bzw. `rom-aria-streit` gesehen (dieselbe Nacht, **keine** Tagessperre) | Ohne Tafel. Setzt `vexaria_kanal4`, Romanze ggf. `vexaria_funk_gefuehl`, genau eins von `vexaria_funkstille_ferne`/`_dach`/`_tuer`. Folgemorgen: Telefon `aria-vex-kanal4(-2/-fs)`, Dante-Szene `vexaria-dante-gluehbirne`. |
| B3 | Telefon `vega-vex-anruf` | – · A | 7 gesehen, 8 nicht | Statt `rom-aria-vega`: Dialog `vexaria-vega-rat`, setzt `aria_vega_rat`. Wegdrücken → `vexaria_vega_abgewimmelt` + Hinweis `vega-vex-luecke`. |
| 8 | `rom-vexaria-umdrehen` (`-fs`) | `neon-gasse` · N | 7; Akt 1 oder `rom-aria-vega`; Romanze: R + `aria_romanze_streit` | Dialog → Tafel → Dach-Gespräch (Kas). Akt 1: danach Vordach-Versöhnung (`aria_versoehnung_verdient`, Romanze wieder `angebahnt`, Freundschaft `aria_krach` fällt). Setzt `vexaria_umgedreht`, `vexaria_kas_erzaehlt`. |
| 9 | `rom-vexaria-kuss` (`-fs`) | `neon-gasse` · A (Start Dachterrasse) | ♥8, 8 gesehen, `aria_versoehnung_verdient`; Romanze: R + `angebahnt`/`zusammen` | Rennen → Lücke: „Springen. Mit ihr.“ (braucht `vexaria_kas_erzaehlt`, Tafel `sprung`) oder langer Weg → Flutmauer. Romanze: Pass + Ersatzschläger, `aria_romanze_zusammen`, Wahl Kuss/Warten (Tafel `kuss`, `aria_kuss`) oder Hand. Freundschaft: Ersatzschläger, Kronkorken für Kas, `aria_romanze_freundschaft`. Reise `flutmauer`. Startet „zwei Tage warten“. |
| 10 | `rom-vexaria-licht` | `neon-gasse` · A/N | R, `aria_kuss`, frühestens am Folgetag | Ohne Tafel. „Komm mit“ → `rom-vexaria-licht-bude` → Abblende → Schlafen → Station 11. „Ein andermal“ → `vexaria_licht_spaeter`. Setzt `aria_nacht`, `vexaria_nacht`. |
| 11 | `rom-vexaria-morgen` | (nach dem Schlafen) | folgt direkt auf 10 | Gehen/Kaffee/Liegen → `vexaria_morgen_gegangen`/`_zurueck`/`_geblieben`. Tafel nur bei „Kaffee holen“. Danach Reise `high-voltage` + Frühstück `rom-vexaria-fruehstueck` (Pulli → `vexaria_pulli`). Startet „zwei Tage warten“. |
| 12 | `rom-vexaria-funkmast` (`-fs`) | `loetgassen` · A | `vexaria_kas_erzaehlt`, 9 gesehen, zwei Tage gewartet; Romanze: R + `zusammen` | Dialog → Tafel → Schleife (`vexaria_funkmast_neu`/`_aus`/`_noch`). Gibt `kas-armband`, `funk-kanal-neun`; Romanze setzt `vexaria_rueckendeckung`. Setzt `vexaria_funkmast`. |
| 13 | `rom-vexaria-konzert` (`-fs`) | `flutmauer` · A/N | Telefon `aria-vex-konzert` (zwei Tage nach 12) beantwortet → `vexaria_konzert_einladung`; Romanze: R + `zusammen` + `kabelbrand-pass` | Akt-1-Weg: Geheimkonzert am Schlickstrand. Tafel → Gerüst `[Reflexe 6]` → Eingang → hundert Meter → letzte Strophe → Wahl → Strand (Sprung über den Wellenbrecher bei `vexaria_luecke_gemieden`) → Collin-Zeile. Setzt `vexaria_konzert`. |

## Wiederholbares und Tagesgespräch (Aria, erste passende Zeile gewinnt)

1. Eifersucht `aria-tag-eifersucht` (bei `flirt_<npc>`, setzt `aria_eifersucht_gewarnt`, löscht die `flirt_*`-Flags), beim zweiten Mal `aria-tag-trennung` (♥ −200, Freundschaft).
2. Streit: `aria-tag-streit(-kanal4)`.
3. Vex: „Bude oder Quartier?“ `vexaria-nacht-wieder` (1×/Woche; volle Szene, solange 11 fehlt), Abendzeile nach „Gehen“, Morgen-Zeile, Arm-summt-Zeile, Montag (Ripper-Tag; nach 9 einmal Raten-Angebot), „Mast?“ (nachts, 1×/Woche), Dachrennen Fr/Sa nachts (1×/Woche).
4. `aria-date-nochmal` (nach „zu schnell“, zwei Tage gewartet).
5. `aria-tag-reden` (Trennung auf Wunsch, Tag 13/27 im Kalender).
6. Pools je Kalendertag: Vex „zusammen“ (17 Zeilen, mit Vex-Antworten `[Ausstrahlung 3]`/`[Reflexe 6]`/zwei ohne Check), Vex-Flirt (7, ab Station 4), Vex-Rivalinnen (4, bis Station 4, Limo-Gag), Vex-Crew (5); andere Spielfiguren: zusammen (6), Flirt (4), Alltag nach Tageszeit/Herkunft.
- Ripper-Tag: montags abends `high-voltage`, vier Varianten nach Kalendertag (`rivalinnen.ts`).
- Crew-Kommentare (je einmal): Hunter/Lio nach dem Knutschen, Kiki-Taxi, Captain Kuschels Zettel, Opa Gurrmann, Kanal-4-Paket, Ripper „zu zweit“, Dante Werkbank, „Hier wohnt jetzt einer“.

## Debug-Sprünge (Flags/`seen` setzen, dann die Karte zur Zeit betreten)

Immer: Vex-Vorlage, `aria_heute` aus, Aria-Herzen wie angegeben.

| Ziel | setzen |
|------|--------|
| 2 Lücke | ♥5, `vexaria_wette`, Fr/Sa N `neon-gasse` |
| 3 Armdrücken | ♥6, seen `rom-vexaria-luecke`, `rom-aria-training` |
| 4 Bude (Romanze) | ♥8, seen `rom-aria-dach`, `aria_romanze_angebahnt`; 21–01 Uhr `loetgassen` |
| 5 Tanz | wie 4 + seen `rom-vexaria-bude`; Fr/Sa N `high-voltage` |
| 6 Oberlicht | ♥8, seen `rom-aria-albtraum` (+ `aria_romanze_angebahnt` für Romanze); A `hafenkante` |
| B1 Ripperdeal | ♥8, seen `rom-vexaria-oberlicht`; A `high-voltage` |
| 7 Funkstille | seen `rom-vexaria-streit`, `aria_streit_alleingang`, `aria_romanze_streit`; 23 Uhr `loetgassen` |
| 8 Umdrehen | seen `rom-vexaria-funkstille`, `aria_romanze_streit` (Romanze) bzw. `aria_krach`; N `neon-gasse` |
| 9 Kuss | ♥8, seen `rom-vexaria-umdrehen`, `aria_versoehnung_verdient`, `aria_romanze_angebahnt`, `vexaria_kas_erzaehlt`; A `neon-gasse` |
| 10/11 Licht/Morgen | ♥8, `aria_kuss`, `aria_romanze_zusammen`; A `neon-gasse` |
| 12 Funkmast | `vexaria_kas_erzaehlt`, seen `rom-vexaria-kuss`, `aria_romanze_zusammen`, `aria_warte1`/`aria_warte2` aus; A `loetgassen` |
| 13 Konzert | seen `rom-vexaria-funkmast`, `vexaria_kas_erzaehlt`, `vexaria_konzert_einladung`, `aria_romanze_zusammen` (Romanze), Item `kabelbrand-pass`; A `flutmauer` |
