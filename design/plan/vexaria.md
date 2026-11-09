# Vex × Aria „Nicht anhalten“ – Ablauf im Spiel (Akt 1 bis Nachspiel)

Dateien: `game/src/content/parts/vexaria/` – `_util.ts` (Bausteine), `aria.ts` (NpcDef, Tagesgespräche, he-aria-2/4/6),
`aria-akt1.ts` (Zerberster-Herz A1–A4), `rivalinnen.ts` (1–3, Ripper-Tag), `funken.ts` (4–6), `bruch.ts` (Akt-1-Brücke, 7–8),
`hoehepunkt.ts` (9–11), `danach.ts` (12–13, Crew-Kommentare), `system.ts` (Tageswechsel, Wochenzähler, Akt-2-Zähler),
`zerberster.ts` (he-aria-8, A5 `rom-aria-ausfall`, Quest `pers-aria-zerberster`), `versoehnung.ts` (A6 Streit, A7 Vega, A8 Regen,
Kuss/he-aria-10 der Baukasten-Figur), `krise.ts` (Akt 2 mit Brücke), `akt2.ts` (Bruch-Sicht, Rettung, Dachnächte, Pool, Crew),
`akt3.ts` (Outfit, A10 Stirn, Party), `enden.ts` (Meer, Autoradio, Master, Strandkonzert), `nachspiel.ts` (Alltag, Ausblick).
Abweichungen vom Kanon und Wünsche an andere: `gaps/vexaria.md`.

## Grundregeln

- Jede `rom-vexaria-*`-Station verlangt `{ playerIs: 'vex' }`. Die Aria-Stationen `rom-aria-*` und `he-aria-2/4` laufen für alle; `he-aria-6` nur ohne Vex (bei Vex ersetzt durch Station 3).
- **Eine Station pro Tag** (beide Stränge): Flag `aria_heute`, gesetzt am ersten Knoten jeder Station. Ausnahmen: Station 7 läuft in derselben Nacht wie der Streit, 10 + 11 zählen als eine.
- **Tageswechsel** (`system.ts`, Engine-Regeln `GameContent.daily`): Jeder neue Tag (Schlaf oder Zusammenbruch) löscht `aria_heute` und zählt „zwei Tage warten“ weiter (`aria_warte2` → `aria_warte1` → frei = `WARTEN_VORBEI`). Kein Kartenwechsel nötig.
- **Woche:** `vexaria_nacht_woche`, `vexaria_mast_woche`, `vexaria_rennen_woche`, `vexaria_dach_woche` und `vexaria_strand_woche` fallen montags.
- **Akt-2-Zähler** (`system.ts`, Kette pro Tag einen Schritt): `aria_streit_t4..t1` („vier Tage seit Station 6“), `aria_krach_t2..t1` (Krach der Baukasten-Figur endet nach zwei Tagen, Regel `aria-krach-vorbei`), `aria_gescheitert_t3..t1` (nach misslungenem Regen fällt `aria_romanze_streit` nach drei Tagen).
- **Zwei Wege in Akt 2 (Vex):** `BRUECKE` = `seen rom-vexaria-ripperdeal` (Akt-1-Bruch gespielt). Mit Brücke: Quest → `rom-vexaria-krise` → `rom-vexaria-dachnacht`. Ohne Brücke (und für alle anderen Spielfiguren): Kanon `rom-aria-streit` → (Vex: 7) → `rom-aria-vega` → (Vex: 8) → `rom-aria-regen` → 9. Die Brücke darf in Akt 2 zu Ende laufen (Streit/Funkstille/Vega-Anruf/Umdrehen/Vordach hören auf `BRUECKE` statt auf Akt 1). `vexaria_rate_diese_woche` (Ripper-Tag) fällt an jedem anderen Tag.
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
| B2 | `rom-vexaria-streit` (`-fs`) | `neon-gasse` · A | B1, am Folgetag (darf in Akt 2 fallen) | Statt `rom-aria-streit`, Weg `alleingang`. Romanze: `aria_romanze_streit` (angebahnt fällt); Freundschaft: `aria_krach`. Optional `aria_streit_gehoert`. |
| 7 | `rom-vexaria-funkstille` (`-fs`) | `loetgassen` · N 23–02 Uhr | B2 bzw. `rom-aria-streit` gesehen (dieselbe Nacht, **keine** Tagessperre) | Ohne Tafel. Setzt `vexaria_kanal4`, Romanze ggf. `vexaria_funk_gefuehl`, genau eins von `vexaria_funkstille_ferne`/`_dach`/`_tuer`. Folgemorgen: Telefon `aria-vex-kanal4(-2/-fs)`, Dante-Szene `vexaria-dante-gluehbirne`. |
| B3 | Telefon `vega-vex-anruf` | – · A | 7 gesehen, 8 nicht | Statt `rom-aria-vega`: Dialog `vexaria-vega-rat`, setzt `aria_vega_rat`. Wegdrücken → `vexaria_vega_abgewimmelt` + Hinweis `vega-vex-luecke`. |
| 8 | `rom-vexaria-umdrehen` (`-fs`) | `neon-gasse` · N | 7; Brücke (`seen rom-vexaria-ripperdeal`) oder `rom-aria-vega`; Romanze: R + `aria_romanze_streit` | Dialog → Tafel → Dach-Gespräch (Kas). Mit Brücke: danach Vordach-Versöhnung (`aria_versoehnung_verdient`, Romanze wieder `angebahnt`, Freundschaft `aria_krach` fällt). Setzt `vexaria_umgedreht`, `vexaria_kas_erzaehlt`. |
| 9 | `rom-vexaria-kuss` (`-fs`) | `neon-gasse` · A (Start Dachterrasse) | ♥8, 8 gesehen, `aria_versoehnung_verdient` (oder `epilog` + `aria_versoehnung_spaet`); Romanze: R + `angebahnt`/`zusammen` | Rennen → Lücke: „Springen. Mit ihr.“ (braucht `vexaria_kas_erzaehlt`, Tafel `sprung`) oder langer Weg → Flutmauer. Romanze: Pass + Ersatzschläger, `aria_romanze_zusammen`, Wahl Kuss/Warten (Tafel `kuss`, `aria_kuss`) oder Hand. Freundschaft: Ersatzschläger, Kronkorken für Kas, `aria_romanze_freundschaft`. Reise `flutmauer`. Startet „zwei Tage warten“. |
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

## Akt 2

| # | ID | Karte · Zeit | Bedingung | Ablauf / Ergebnis |
|---|----|--------------|-----------|-------------------|
| A-a | `vexaria-bruch-a` | `loetgassen` · jede | V, Akt 2, `aria_gechippt`, `bruch_entkommen`, nicht `vexaria_gerettet`, Countdown offen | Vex ruft Aria an: „Ja, Master?“. Wand/Schreien/Zuhören (`vexaria_bruch_klacken`). Kanal 4 verrät das Pumpwerk. Setzt `vexaria_bruch_a`. |
| A-b | `vexaria-bruch-b` | `high-voltage` · A/N | V, Akt 2, `aria_entkommen`, `bruch_entkommen`, Tagessperre | Hinterhof nach dem Bruch. Paar: Kuss an der Hofmauer (Beschwingt); angebahnt: Hand auf dem Brustriemen; Crew: Umarmung. Setzt `vexaria_bruch_b`. |
| R | `rom-vexaria-rettung` | `pumpwerk-sieben` · jede | V, Akt 2, `aria_gechippt`, nicht `vexaria_gerettet`, `rom-aria-ausfall` nicht gesehen, Countdown offen | Tafel `cut-rom-vexaria-rettung` → Kralle im Gurtzeug → 3 Erinnerungsrunden (je nach `rom-vexaria-luecke`, `vexaria_kronkorken`, `vexaria_oberlicht`, `aria_kuss`, `vexaria_kas_erzaehlt`, `rom-aria-dach`, `vexaria_nacht`; je eine Wahl ohne Bedingung) → `[Ausstrahlung 6]` oder ohne Check „Metall an Metall“ (Schaden 6) oder Kuss (Paar + `aria_kuss`) → Ripper sperrt den Arm → Huckepack → Reise `dantes-werkstatt` → Dialog `rom-aria-ausfall` (Knoten `a-vex`). Setzt `vexaria_gerettet`, `aria_arm_gesperrt`, markiert `rom-aria-ausfall`, startet `pers-aria-zerberster`. |
| R' | `rom-vexaria-rettung-werkstatt` | `dantes-werkstatt` | wie R, aber `main-2-countdown` erledigt | Ausweichfassung (gleicher Dialog, Werkstatt-Einstieg), wenn main-2-kanal Aria vorher befreit hat. |
| 8b | `he-aria-8` | `schrottmarkt` · T | ♥8, Akt 2, `main-2-bruch` erledigt, nicht gechippt | Ripper „Aus.“ – Arm fällt. Startet `pers-aria-zerberster`, `aria_arm_gesperrt`. |
| A5 | `rom-aria-ausfall` | `dantes-werkstatt` | Variante A: Baukasten nach `main-2-countdown`; Variante B: N nach `he-aria-8`; Vex A: von R angekettet | Tafel `cut-rom-aria-ausfall`. Notbehelf `[Technik 6]` / `[Schrott]` / Vex `[Reflexe 6]` Prüfer übers Dach → `aria_finger_wackeln`. Vex: Shirt anziehen (zärtlich) und einmalig „Ich hol den Code. Allein.“. Wahl: `aria_weg_gemeinsam` / `_deal` / `_alleingang`. |
| Q | `pers-aria-zerberster` | s. Schritte | – | Gemeinsam: Fax `gc-127` (Hotspot `aria-faxspeicher`) → Praxis (`aria-ripper-rede`: Beleg / `gc-128` / 400 Cr / Kampf `enc-praxis-ripper(-vex)`). Deal: nachts `kanal-sammler/rippers-lager` (`[Straße 6]`, `[Gosse]`, 400 Cr, `seltenes-implantat`; Vex ohne Check „Container 77, drei Raten“ → `ripper_gefallen`). Alleingang: nachts `hinterzimmer-vorhang` (`[Reflexe 7]`, Vex 6, oder Kampf allein), `heute_angeschlagen`. Code = `aria_code` oder gewonnener Praxis-Kampf. Einbau `aria-code-einspielen` → `aria_arm_frei`, `aria_streit_scham`/`_deal`/`_alleingang`. Belohnung 220 XP, Aria +100, Ripper −50. Container 77 (`aria-container-77`): abliefern oder platzen lassen (`ripper_deal_geplatzt`), beides gibt `beglichener-schuldschein`; alternativ 400 Cr an der Preistafel. |
| A6 | `rom-aria-streit` (`-fs`) | `neon-gasse` · A | Akt 2, Quest erledigt, Kanonweg; Romanze: R + `angebahnt` | Tafel `cut-rom-aria-streit` (Romanze). Auslöser je Weg (Ripper prahlt / Dante plaudert / Scham), Vex-Zusatzzeilen. Wahl `[Ausstrahlung 7]` (Vex `[Straße 5]`) → `aria_streit_gehoert`, gehen lassen, Vex „Umdrehen. Gehen.“, festhalten ♥ −40, schreien ♥ −60. Romanze: `aria_romanze_streit`; Freundschaft: `aria_krach` (+ `aria_krach_t2`). Startet `aria_streit_t4` und „zwei Tage warten“. |
| A7 | `rom-aria-vega` | `neon-gasse` · M | 6 gesehen, Morgen danach (`aria_warte2` aus); Vex: 7 gesehen | Tafel `cut-rom-aria-vega`. Rat je Weg + Gestentipp. `[Ausstrahlung 6]`, Vex `[Straße 5]` (Oberlicht), ehrlich, `[Vega ♥6]`, `[Ex-Wache]`, abwimmeln (`vexaria_vega_abgewimmelt`). Setzt `aria_vega_rat` (außer abwimmeln). |
| G | Hotspot `aria-geste-hunter` | `high-voltage/tresen` · A/N | 6 gesehen, ♥ Hunter 6 | Geste `scham`: `aria_geste_hunter`. Andere Gesten: Item `beglichener-schuldschein` (deal), `griffband-schlaeger` (alleingang). |
| A8 | `rom-aria-regen` (`-fs`) | `neon-gasse` · A/N | 6 gesehen, zwei Tage gewartet, eine Geste, `aria_vega_rat` oder vier Tage oder (Vex) `vexaria_umgedreht`; Vex: 8 gesehen; Romanze: R + `streit` | Tafel `cut-rom-aria-regen`. `[Vegas Rat]` je Weg, Vex-Ehrlichkeitszeile (Kas), freie Rede `[Ausstrahlung 7]` bzw. Vex 4, je −1 mit `gehoert`/passender Geste (min. 3), `[Gosse]`, `[Knast]`; rechtfertigen/schweigen misslingt. Erfolg: `verdient`, `angebahnt`, ♥ +120 (Vex: Lieferweste, Beinahe-Kuss „Auf der Mauer“). Misslingen: `gescheitert` + `aria_gescheitert_t3`. Freundschaft: Geste genügt, ♥ +80. |
| A9 | `rom-aria-kuss` / `he-aria-10` | `neon-gasse` · A | Baukasten, ♥10, Quest erledigt; Romanze: R + angebahnt/zusammen + `verdient` (Akt 2+) oder `spaet` (Nachspiel) | Rennen `[Reflexe 7]` → Flutmauer → Ersatzschläger + Pass → Kuss/Warten (Tafel `cut-rom-aria-kuss` → `rom-aria-kuss-nachher`) oder Hand. `aria_romanze_zusammen`, `aria_kuss`. Freundschaft: Kronkorken, `aria_romanze_freundschaft`. Reise `flutmauer`. Vex: Station 9 in `hoehepunkt.ts` (jetzt auch mit `spaet` im Nachspiel). |
| K1 | `rom-vexaria-krise` (`-fs`) | `neon-gasse` · A | V, Akt 2, `BRUECKE`, Quest erledigt | Kiki küsst Vex auf die Wange, Aria sieht es. Wut je `aria_weg_*`, Angst je `aria_gechippt` („Ja, Master“) bzw. toter Arm. Wahl `[Ausstrahlung 5]` / „Schiss“ / Hand an die Wange / „Pause“ (♥ −30). Setzt `vexaria_krise`, `vexaria_krise_offen`. Freundschaft: Bier auf dem Dach in derselben Szene. |
| K2 | `rom-vexaria-dachnacht` | `loetgassen` · N | V, R, `vexaria_krise_offen` (gleiche Nacht, keine Tagessperre) | Dach der Kurierbude: Zerberster im Schoß, Knöchel/Platten, Kuss auf der Teerpappe, „Revierverhalten“. „Rolltor zu“ → Abblende `rom-vexaria-dachnacht-abblende` → Schlaf → `vexaria-krise-morgen` (`vexaria_versoehnt_akt2`, Beschwingt); oder Sterne zählen. Danach einmal Hunter `vexaria-krise-hunter`. |

**Wiederkehrend in Akt 2:** Tagesgespräch nachts (V, zusammen, Akt 2, nicht Nachspiel, 1×/Woche) `aria-vex-dach-frage` → `vexaria-dach-gespraech` (Thema nach Wochentag: Mo/Di Kas, Mi/Do Klinik, Fr/Sa Meer, So Narben) → „Bude“ (Abblende `vexaria-nacht-kurz`) oder „Hier“. Akt-2-Pool `aria-vex-akt2-1..7` an ungeraden Kalendertagen (V, zusammen, Akt 2, nicht Akt 3). Crew einmalig: Dante `vexaria-crew-dante-rettung` (Werkstatt nach R), Vega `vexaria-crew-vega-akt2` (nach einer Dachnacht), Hunter `vexaria-crew-hunter-akt2` (nach R + Arm frei), Ripper `vexaria-crew-ripper-akt2` (Praxis, Paar, Quest erledigt).

## Akt 3 (Schwelle und Partynacht)

| ID | Ort | Bedingung | Ablauf |
|----|-----|-----------|--------|
| `rom-vexaria-outfit` (Hotspot) | `stufenplatz/salon-gina` · T/A | V, Akt 2 (nicht 3), `aria_arm_frei`, weder `vexaria_outfit` noch `prep_outfits` | „Das Gurtzeug bleibt. Oder ich bleib.“ `[Ausstrahlung 5]` Gurtzeug über dem Anzug. Paar: Aria sprachlos, Revers, Kuss vor zwölf Spiegeln; angebahnt: Rückenriemen; Crew: Fotos. 600 Cr → `prep_outfits`, `vexaria_outfit_bezahlt`; sonst `vexaria_outfit_offen` + Hotspot `vexaria-outfit-zahlen`. |
| `rom-aria-stirn` / `-fs` | `neon-gasse` · N | Akt 2 (nicht 3), Quest erledigt, `party_bereit` oder ≥3 `prep-*` (Quest erledigt oder Flag `prep_*`), Tagessperre. Romanze: Paar oder `gescheitert` | Telefon `aria-ruf-stirn`. a) Kanon (Baukasten): Stirn an Stirn, „Komm einfach zurück“, Ermutigt. a) Vex: Nähkissen, roter Stern auf den Schulterriemen (`vexaria_aufnaeher`), „Ich lieb dich“ (`vexaria_liebe`), Kuss im Regen, „Bude“ (Abblende `rom-aria-stirn-vex` → `vexaria-morgen-kurz`) oder „Hier“. b) Zweiter Weg: jede ehrliche Antwort → `aria_versoehnung_spaet` + `angebahnt` (Kuss rückt ins Nachspiel); „Lass gut sein“ → Freundschaft. Tafel `cut-rom-aria-stirn`. Setzt `aria_stirn` (Bude-Deko hört auf `seen rom-aria-stirn`). |
| `rom-vexaria-himmelsgarten` (Hotspot) | `himmelsgarten/tanzflaeche-glas` | V, Partynacht, Aria angeworben, `main-3-einlass` erledigt | Tanz auf dem Glas über der Unterstadt (Paar: Kuss; sonst schrecklich lustig) oder Minispiel `akt-tanz` Stufe 2. Setzt `vexaria_himmelsgarten`. |
| `vexaria-gedanken-sorge` (Hotspot) | `himmelsgarten/rosenboegen` | V, Partynacht, `main-3-gedankenkontrolle` aktiv, vor `raven_zurueck` | Arias Angst vor dem Tablett; Wahl je `vexaria_gerettet` / `aria_gechippt`. Setzt `vexaria_gedanken_sorge`. Ergänzt die Aria-Zeilen im Tablett-Dialog der Quest. |
| `vexaria-gestaendnis` (Hotspot) | `himmelsgarten/rosenboegen` | V, Paar, Partynacht, `raven_zurueck` | Nach Ravens Rückkehr: „Ich lieb dich.“ (falls noch nicht in Stirn gesagt) → Kuss am Rosenspalier. Setzt `vexaria_liebe`, `vexaria_gestaendnis_party`. |

Landeplatz-Moment und Blade-Zeile mit Aria liegen in `quest-main-3/main-3-blade.ts` (Knoten `aria-vex-rom`/`aria-vex`); hier nicht doppelt.

## Enden

| Ende | ID | Auslöser | Inhalt |
|------|----|----------|--------|
| 1, 2, 3b | `rom-vexaria-meer` / `-fs` (Herz-Ereignis) | `das-meer` · A, V, `epilog` + `ende_meer`/`ende_neue_nexus`/`ende_doch_noch_meer`, Tagessperre; Romanze = Paar | Tafel `cut-rom-vexaria-meer` vorweg. 3b: „Hast ganz schön lang gebraucht, Arschloch. Komm her.“ (siebzehn Kronkorken). „WER ZUERST AM WASSER IST!“ → stehen bleiben (Umdrehen zur Crew) oder rein mit Stiefeln (`vexaria_meer_rein`). Paar: Kuss in der Brandung → Lagerfeuer, Zöpfe lösen, Wagen am Dünengras → Abblende `rom-vexaria-meer-nacht` → `vexaria-meer-morgen` (Shirt-Tausch). Setzt `vexaria_meer`, markiert `rom-aria-meer`. |
| 1, 2, 3b | `rom-aria-meer` / `-fs` | wie oben, Baukasten-Figur | Kanon Station 11, Tafel `cut-rom-aria-meer`, `aria_meer`. |
| 2 | `vexaria-ende-autoradio` (Herz-Ereignis) | `das-meer` · M/T, V, Paar, `ende_neue_nexus`, `vexaria_meer` | Nexus aus der Rostlaube: „214 Mal bewegt, bei Windstärke null.“ Setzt `vexaria_autoradio`. |
| 3 | `vexaria-ende-master` (onEnter) | `blades-buero`, V, `ende_master` ohne 3b, `epilog`, Paar/angebahnt/♥6 | Gurtzeug auf dem Schreibtisch, roter Stern (`vexaria_aufnaeher`), Strandbild; Arias Sprachnachricht durchstellen oder abweisen. Setzt `vexaria_ende_master`; danach Telefon `aria-vex-master-1..3`. |
| Nachspiel | `rom-vexaria-konzert-strand` / `-fs` | `das-meer` · A/N, nach `rom-vexaria-meer`, `side-strandclub` erledigt, `vexaria_kas_erzaehlt`, Station 13 nicht gesehen | Kabelbrand am Strandclub, Aria singt falsch mit dem Mikro. Markiert `rom-vexaria-konzert` (ersetzt Station 13, wenn sie in Akt 1/2 nicht lief). |

Für die Integration: Die Enden brauchen keine Verdrahtung, die Szenen hängen nur an den Ende-Flags. Die Ankunftszeile `vexaria` in `quest-enden/enden.ts` (`ende-meer-strand`) bleibt der Mittag; `rom-vexaria-meer` ist der erste Abend.

## Nachspiel

- Tagesgespräch (V, Paar, `epilog`, nicht Ende 3 ohne 3b): `aria-vex-strandnacht` nachts nach `rom-vexaria-meer` (1×/Woche `vexaria_strand_woche`, Sommersprossen zählen → Abblende `vexaria-strandnacht` → Hunter mit Kaffee), sonst Pool `aria-vex-epilog-1..10` nach Kalendertag.
- `vexaria-alltag-zaehne` (Herz-Ereignis `das-meer` · M): Zähneputzen, Schaum/Zahnbürste. `vexaria_alltag_zaehne`.
- `vexaria-alltag-rate` (onEnter `ripper-praxis`, montags): Aria hat Vex' Arm abbezahlt. `vexaria_raten_bezahlt`, `vexaria_alltag_rate`.
- `vexaria-alltag-schluessel` (Herz-Ereignis `loetgassen` · A/N): Schlüssel fürs Rolltor. `vexaria_alltag_schluessel`.
- `vexaria-ausblick` (Herz-Ereignis `das-meer` · N, nach zwei von: Zähne, Rate, Schlüssel, Konzert): Steg, Pläne (`vexaria_ausblick_kurier`/`_bude`/`_offen`), Abschluss `vexaria_ausblick`.
- Aria-Tagesablauf: Fr–So im Nachspiel `das-meer/wasserlinie`; Ende 3 ohne 3b am `lagerfeuer`; Partynacht `himmelsgarten/tanzflaeche-glas`; Variante A gechippt `away` bis Countdown bzw. `vexaria_gerettet`.

## Debug-Sprünge Akt 2 bis Nachspiel

Vex-Vorlage, `aria_heute` aus. „Kanon“ = ohne `seen rom-vexaria-ripperdeal`, „Brücke“ = mit.

| Ziel | setzen |
|------|--------|
| A-a / R Rettung | Akt 2, `aria_gechippt`, `bruch_entkommen`; `loetgassen` bzw. `pumpwerk-sieben` betreten |
| A-b | Akt 2, `aria_entkommen`, `bruch_entkommen`; A `high-voltage` |
| he-aria-8 | Akt 2, ♥8, `main-2-bruch` erledigt; T `schrottmarkt` |
| A5 Variante B | seen `he-aria-8`; N `dantes-werkstatt` |
| Quest-Wege | aktiv `pers-aria-zerberster` + `aria_weg_gemeinsam`/`_deal`/`_alleingang`; Code-Abkürzung `aria_code` → Einbauliege |
| A6 Streit | Quest erledigt, `aria_streit_deal` (o. a.), Kanon; Romanze ♥8 + `aria_romanze_angebahnt`; A `neon-gasse` |
| A7 Vega | seen `rom-aria-streit`, `aria_warte2` aus (Vex: seen `rom-vexaria-funkstille`); M `neon-gasse` |
| A8 Regen | seen `rom-aria-streit`, `aria_warte1/2` aus, Item `beglichener-schuldschein`, `aria_vega_rat`, Romanze `aria_romanze_streit` (Vex: seen `rom-vexaria-umdrehen`); A `neon-gasse` |
| A9 Kuss (Baukasten) | ♥10, Quest erledigt, `aria_versoehnung_verdient`, `aria_romanze_angebahnt`; A `neon-gasse` |
| K1/K2 Krise | Brücke, Quest erledigt, `aria_romanze_zusammen`, `aria_weg_deal`; A `neon-gasse`, dann N `loetgassen` |
| Dachnacht-Talk | Akt 2, `aria_romanze_zusammen`, N, Aria ansprechen |
| Outfit | Akt 2, `aria_arm_frei`; T `stufenplatz` (Salon) |
| A10 Stirn | Akt 2, Quest erledigt, `party_bereit`, Paar oder `aria_versoehnung_gescheitert`; N `neon-gasse` |
| Party | Akt 3, `main-3-einlass` erledigt, Aria angeworben; `himmelsgarten`; Sorge: `main-3-gedankenkontrolle` aktiv; Geständnis: `raven_zurueck` |
| Meer | `epilog` + `ende_meer` (3b: `ende_doch_noch_meer`), Paar; A `das-meer` |
| Autoradio | zusätzlich `ende_neue_nexus`, `vexaria_meer`; M `das-meer` |
| Master | `epilog`, `ende_master`, Paar; `blades-buero` betreten |
| Nachspiel | `epilog`, `ende_meer`, Paar, seen `rom-vexaria-meer`; Zähne M `das-meer`, Schlüssel A `loetgassen`, Rate Mo `ripper-praxis`, Ausblick N `das-meer` nach zwei Szenen |

## Ausbau „intensiver“ (09.11.2026, Nutzerwunsch)

Grenze unverändert: alles bis zur Abblende, die Nacht selbst nie beschrieben, Kleidung fällt höchstens bis Gurtzeug/Top/Shirt/Stiefel, beide fragen nach. Neue Abblende-Beats sind `black`, keine neuen Bilder.

- **Spannung vor Station 10** (`funken.ts`, `aria.ts`, `rivalinnen.ts`): Beinahe-Momente in 4 (Rolltor klemmt, Kanal 4 funkt dazwischen), 5 (Aria bricht nach dem Gassenkuss selbst ab, `zuviel`), 6 (Hunter ruft auf dem Container an; `[Reflexe 6]` `vexaria-oberlicht-hunter-reflexe`). Pools: Vex-Flirt 15, Vex „zusammen“ 26 Zeilen, neue mit eigenen Antworten. Ripper-Tag-Zweig `aria-revier`, Armdrücken „Sag: besetzt.“
- **Station 10** `rom-vexaria-licht-bude` (`hoehepunkt.ts`): Gasse → Rolltor → Handschuh → wer führt (Vex/Aria am Rolltor, langsam auf der Matratze) → elf Schnallen (alte Checks + „zusammen aufmachen“) → Haut/Narben → Necken/ehrlich/Kas/Schulternaht → unveränderter `schluss`.
- **Morgen danach** (`hoehepunkt.ts`): Spuren (Knutschfleck, Kratzer, Shirt-Tausch), „Liegen“ mit drei Wahlen und „Nochmal?“ auf Kanal 4; Frühstück mit Dantes „Wer hat wen wachgehalten?“. Wiederholung `vexaria-nacht-wieder`: wild/zärtlich/albern mit `vexaria-nacht-wild|-zart|-albern` und `vexaria-morgen-wild|-zart|-albern`; `vexaria-nacht-kurz`/`vexaria-morgen-kurz` wechseln nach Kalendertag.
- **Klatsch der Crew** (`danach.ts`): onEnter `vexaria-klatsch-*` ab dem zweiten Tageswechsel nach der ersten Nacht, höchstens eine pro Tag (Hunter, Dante → `vexaria_schnalle_neu`, Kiki, Vega, Lio, Ripper, Opa Gurrmann, Captain Kuschel, Nachbarn, Oma Volt). Nach fünf: `vexaria-klatsch-dach` → „Rolltor“ (Abblende `vexaria-nacht-kurz`) oder „Dach“.
- **Akt 2** (`krise.ts`, `akt2.ts`): Dachnacht K2 lang und wild (Angst → Verlangen, „Revierverhalten“, Schnallen-Countdown) → unveränderte Abblende. Dachfrage „Bude“ mit Vorspiel je Wochenthema, „Hier“ als Kuss auf der Brüstung. `vexaria-bruch-b` verzweifelter, drei Wahlen.
- **Akt 3, Enden, Nachspiel** (`akt3.ts`, `enden.ts`, `nachspiel.ts`): Outfit mit Reißverschluss hinter dem Vorhang; Stirn-„Bude“ zärtlich im Regen; Geständnis mit Wahl. Meer: Lagerfeuer (Zöpfe / Sommersprossen → `vexaria_sommersprossen` / Sandkrieg) → Wagen → Abblende; Morgen mit Spuren. Master-Sprachnachricht dreistufig. Strandnacht nur Fr–So, Vorspiel je Wochentag. Zähne/Schlüssel mit kleinen Wahlen.
- **Baukasten-Nächte** (`baukasten-naechte.ts`, angehängt über `BAUKASTEN_NAECHTE_EVENTS` in `versoehnung.ts`):

| # | ID | Karte · Zeit | Bedingung | Ablauf |
|---|----|--------------|-----------|--------|
| B1 | `aria-baukasten-nacht` | `crew-quartier` · A/N | NOT_V, Paar, `rom-aria-kuss` gesehen, Folgetag, Tagessperre | Tür (rein / Zahnbürste / „Nicht heute“ → `aria_baukasten_spaeter`) → `aria-baukasten-nacht-drinnen` (wer führt, Arm, Worte) → Abblende `aria-baukasten-abblende` → `aria-baukasten-morgen`. Setzt `aria_nacht`, `aria_baukasten_nacht`. |
| B2 | onEnter `aria-baukasten-klopfen-*` | `crew-quartier` · A/N | nach B1, 1×/Woche (`woche_aria_baukasten_nacht`) | Varianten nach Wochentag, je eigene Abblende und Morgen. |
| B3 | `aria-baukasten-meernacht` | `das-meer` · A/N | NOT_V, Paar, `epilog`, `rom-aria-meer` gesehen | Tafel `cut-rom-aria-meer` → Feuer/Strandkonzert/Dünen → Abblende → Morgen. |
