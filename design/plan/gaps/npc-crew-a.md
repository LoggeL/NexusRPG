# Lücken: npc-crew-a (Hunter, Raven, Dante, Gitter-Gerda)

Dateien: `game/src/content/parts/npc-crew-a/{_helfer,hunter,raven,dante,paar}.ts` und die Akt-2/3-Bausteine `_{hunter,raven,dante}23.ts`.

Stand Akt 2/3/Nachspiel: Die Engine-Punkte 1 (`romanceEnabled`), 2 (`abilityRules`), 4 (Herz-Ereignis bei Zeitwechsel) und 5 (`forDays: 0`) sind erledigt und werden genutzt.

## Engine

1. **Flirtzeilen ab ♥6.** `{ romance: npc }` ist laut contracts erst ab ♥8 wahr. Eine Bedingung „Romanze freigeschaltet, egal wie viele Herzen“ fehlt. Darum erscheinen die Flirt-Wahlen von Hunter und Dante (und Raven, falls sie je freigeschaltet wird) erst ab ♥8. In Akt 1 ist das genau die Obergrenze. **Vorschlag:** Bedingung `{ romanceEnabled: npc }` (Schalter + `romanceable` + kein Kind), dann die Flirt-`when` auf `{ all: [{ romanceEnabled }, { hearts: min 6 }] }` umstellen.
2. **Begleiter-Fähigkeit hängt an einer Quest.** Hunters **Innere Mitte** gibt es erst nach `side-thai-chi`, Ravens **Handschellen-Trick** dauert nach `pers-raven-handschellen` 2 Runden (`raven-handschellen-trick-plus`). `CompanionDef.heartAbilities` kennt nur Herzen. **Vorschlag:** `CompanionDef.abilityUpgrades?: { when: Condition; add?: AbilityId; replace?: [AbilityId, AbilityId] }[]`. Im Moment hat Hunter nur die ♥6-Fähigkeit `hunter-schmiere-stehen`, und Raven behält den Grund-Trick.
3. **Eigene Geschenkreaktion.** `ravens-alte-jacke` bringt laut world.md +150 und einen eigenen Dialog. Das Geschenk-UI kennt nur loves = +80. Notbehelf: Gesprächswahl „Ravens alte Lederjacke hinhalten“ in Ravens Menü (nimmt die Jacke, +150, eigene Zeilen). Über das Geschenk-UI gibt es weiter +80. **Vorschlag:** `GiftPrefs.special?: Record<ItemId, { delta: number; dialogue?: DialogueId }>`.
4. **Herz-Ereignisse lösen nur beim Betreten einer Karte aus.** `he-hunter-2` (high-voltage, 00:00–02:00) startet nicht, wenn man um Mitternacht schon im Club steht. Man muss die Karte erst verlassen und wieder betreten. Die Telefon-Nachricht `tel-hunter-kasse` weist darauf hin. **Vorschlag:** `pendingHeartEvent` zusätzlich beim Wechsel der Tageszeit prüfen.
5. **Puffer „Beschwingt“ bis Mitternacht.** `CheckBuff.untilDay` braucht einen absoluten Tag. Darum gilt der Puffer bei `he-hunter-10` und `he-dante-10` nur für den nächsten Ausstrahlung-Check (`consumes`). **Vorschlag:** relative Angabe `forDays: 0` (bis Tagesende).
6. **Tagesgespräche abwechseln.** `TalkDef` kann nicht nach Tag oder zufällig wechseln. Die Varianten wechseln nach Tageszeit, Wochentag, Herzen, Quests und Flags. Die Flirtzeilen wechseln nach Wochentag. **Vorschlag:** Bedingung `{ dayMod: [n, rest] }`.

## Andere Agenten

- **Zone Eisenhof (`pkg-eisenhof`):** Der Ausgang `eisenhof → zellentrakt` muss für `he-raven-6` offen sein: `{ all: [{ hearts: 'raven', min: 6 }, { not: { seen: 'he-raven-6' } }, { weekday: ['di','do','sa'] }, { time: 'tag' }] }` oder Flag `raven_besuch_geplant`. Dieses Flag setzt Ravens Menü bzw. die Nachricht `tel-raven-besuch`. Die Zellennachbarin steht als `zellennachbarin` (Gitter-Gerda) am Spot `zellennachbarin` und ist in `raven.ts` definiert.
- **Zone Lötgassen (`dantes-werkstatt`):** Notschlafplatz-Sofa ab Dante ♥4. `he-dante-4` setzt zusätzlich das Flag `dante_sofa`.
- **Checks-Agent:** Ravens Entfesselungsgriff (`he-raven-4`) ist ein dauerhafter `checkBuff` mit +1 für Checks mit den Stichwörtern `fessel` oder `entfesseln`. Fessel-Situationen bitte so taggen. Ravens `partyCheckBonus` gilt für `schloss`, `fessel`, `einbruch` und `schleichen`, Hunters für `verhandeln` und `einschuechtern` (Ausstrahlung), Dantes für `hacken` und `reparieren` (Technik).
- **Quest-Agent:** Aus den Gesprächen gestartet: `side-thai-chi` (Hunter, morgens, ab ♥3, nach `main-1-dante`, nur wenn `inactive`), `pers-raven-handschellen` (ab ♥3, nach `main-1-auf-raven`), `pers-dante-erstpressung` (in `he-dante-4`) und `pers-hunter-reiner-tisch` (Rivalität mit Hunter). Wenn die Quests eigene Auslöser haben, schadet das nicht: Der Start ist an `state: 'inactive'` gebunden. Die Versöhnungen mit Raven (Handschellen versenken) und Dante (beim Eins! absichtlich verlieren) laufen direkt mit `reconcile` im Rivalen-Gespräch, ohne Quest-ID.
- **Hauptquest-Agent:** Raven wird nach `main-1-auf-raven` rekrutierbar (`recruit`-Bedingung). Wer die Szene baut, setzt `{ recruit: 'raven' }`. Danach gibt es zusätzlich die Wahl „Kommst du mit auf Tour?“. `dante_vertraut` setzt `he-dante-6` (Versprechen oder Mut). `main-1-dante` darf es ebenfalls setzen.
- **Aria / Vex × Aria:** Die **Arm-Wartung bei Dante** ist in `dante.ts` gebaut (`dante-tag-armwartung`, Flag `vexaria_armwartung`, Aria ♥ +20, Dante ♥ +20, danach die Kurzoption „Kannst du nochmal nach dem Arm sehen, Doc?“). Bitte nicht doppelt anlegen. Crew-Kommentare von Hunter und Dante zu Vex × Aria hängen an `vexaria_eifersucht`, `vexaria_knutsch` und `aria_kuss`, für die Spielfigur ohne Vex an `aria_romanze_zusammen`.
- **Art:** Für die ♥6-Szenen fehlen die Tafeln `cut-he-hunter-6` (Angelsteg im Morgennebel, Hunter im Seidenhemd mit Sonnenbrille, Käpt'n Nebelhorn mit Pfeife), `cut-he-raven-6` (Besucherraum, Panzerglas, Raven und Gerda mit den Händen an der Scheibe) und `cut-he-dante-6` (Dante kniet vor dem offenen Schrank, Polaroids fallen heraus, keine Romanze). Für `zellennachbarin` fehlen Porträt, Fotos und `zellennachbarin-walk`. Bis dahin zeigt das Spiel Platzhalter.

## Flags (Paar-Strang Dante/Raven, boolesch)

- Akt 1, Tendenz: `paar_dante_raven_ermutigt` (aus `he-raven-6` oder `he-dante-6`) oder `paar_dante_raven_entmutigt`. Ohne Flag gilt `offen`.
- Ab act2, endgültig: `paar_dante_raven_geholfen` oder `paar_dante_raven_gestoert`, gesetzt in `he-raven-10` oder `he-dante-10`. Bei `geholfen` ist die Romanze mit Dante gesperrt.
- Geheimnis: `dante_geheimnis_versprochen` → `dante_geheimnis_gebrochen` (in `he-raven-6` verraten, Dante ♥ −40, einmalige Reaktion `dante-tag-verpetzt`).


## Akt 2, Akt 3, Nachspiel (Ausbau)

### Engine

7. **Begleiterwerte wachsen nicht mit der Stufe.** `CompanionDef.stats` ist fest. In Akt 2 und 3 liegen die Gegner deutlich höher als die Werte aus Akt 1. **Vorschlag:** `CompanionDef.statsByLevel?: { minLevel: number; stats: Partial<UnitStats> }[]` (die letzte passende Stufe gewinnt, `attributes` werden zusammengeführt). Konkrete Werte:

   | Figur | ab Stufe | hp | armor | morale | Attribute (geändert) | Waffe |
   |---|---|---|---|---|---|---|
   | Hunter | 6 | 68 | 3 | 95 | koerper 7, ausstrahlung 8, strasse 7 | fernkampf 6 / 5 / 6 |
   | Hunter | 9 | 82 | 4 | 100 | koerper 8, reflexe 6, ausstrahlung 9 | fernkampf 8 / 6 / 6 |
   | Raven | 6 | 64 | 3 | 90 | koerper 7, reflexe 8, strasse 6 | nahkampf 7 / 1 / 6 |
   | Raven | 9 | 78 | 3 | 95 | koerper 8, reflexe 9, strasse 7 | nahkampf 9 / 1 / 7 |
   | Dante | 6 | 52 | 2 | 75 | technik 9, reflexe 6, ausstrahlung 6 | smart 6 / 6 / 6 |
   | Dante | 9 | 62 | 2 | 85 | technik 10, reflexe 7, koerper 4 | smart 8 / 7 / 7 |

   Wenn `ravens-klinge` (he-raven-10) getragen wird: Raven-Waffe +1 Schaden (oder über `abilityRules`).
8. **Eifersucht über Romanzen hinweg.** Es gibt keinen Zähler „heute mit X geflirtet“. **Notlösung (Konvention):** Jede Flirt-Wahl setzt das Tagesflag `heute_flirt_<npc>`, das morgens zurückgesetzt wird. Hunter und Dante prüfen die Flags der anderen freigegebenen Romanzen (`heute_flirt_{hunter,dante,aria,collin-charleston,lio-funkel}`): Beim ersten Mal kommt die Warnung (`hunter-eifersucht`, `dante-eifersucht`, Flag `<npc>_eifersucht_gewarnt`), beim zweiten Mal die Trennung (`hunter-trennung`, `dante-trennung`, −150, Flag `<npc>_getrennt`). **Bitte die anderen Romanze-Agenten (Aria, Collin, Lio):** `heute_flirt_<npc>` in die eigenen Flirt-Wahlen setzen.
9. **„Frei“ für Romanzen.** `frei(npc)` in `_helfer.ts` sperrt Kuss und Nacht, solange eine andere Romanze „zusammen“ ist (`ZUSAMMEN_FLAGS`: hunter_romanze_zusammen, dante_romanze_zusammen, aria_romanze_zusammen/aria_kuss, collin_kuss, lio-funkel_romanze_zusammen). Bei anderen Flag-Namen bitte melden oder die Liste ergänzen.

### Flags (neu)

- Hunter: `hunter_feuerzeug`, `hunter_blade_foto_ab`, `hunter_hinterzimmer_schluessel` (Hausbar-Hotspot), `hunter_romanze_tanz`, `hunter_date_geplant`, `hunter_date`, `hunter_date_rosa`, `hunter_teilhaber`, `hunter_teilhaber_verhandelt` (montags Gewinnanteil über `daily`), `hunter_romanze_zusammen`, `hunter_nacht`, `woche_hunter_nacht`, `hunter_eifersucht_gewarnt`, `hunter_getrennt`.
- Raven: `raven_handschelle_zurueckgelassen`, `raven_erinnerung_tresor`, `raven_klopfzeichen_abgemacht`, `raven_gechippt_geklopft`, `raven_eifersucht_ausgeloest` → `re-raven-eifersucht` → `raven_eifersucht_gesehen`, `wingman_raven`.
- Dante: `dante_nexus_warm`, `dante_romanze_tanz`, `dante_date_geplant`, `dante_date`, `dante_kuschel_pate`, `dante_romanze_zusammen`, `paar_dante_raven_entschieden`, `dante_nacht`, `woche_dante_nacht`, `dante_eifersucht_gewarnt`, `dante_getrennt`, `dante_eifersucht_ausgeloest` → `re-dante-eifersucht` → `dante_eifersucht_gesehen`.
- Paar (paar.ts, Quest `pers-wingman-sonnenuntergang`): `wingman_plan`, `wingman_picknick`, `wingman_musik` (`wingman_musik_lio`), `wingman_raven`, `wingman_date`, `dante_raven_paar_flutmauer`; Belohnung `dante_raven_paar`. Die Epilog-Karte `sonnenuntergang` (quest-enden) hängt an `pers-wingman-sonnenuntergang` done.
- Einmal-Themen in den Tagesgesprächen: `hunter_a2_*`, `hunter_a3_*`, `hunter_ep_*`, `raven_a2_*` usw. (Schema `<npc>_<id ohne Präfix>`).

### Andere Agenten

- **side-zweite-chance (quest-enden):** Die Master-Modus-Gespräche `hunter-tag-master`, `raven-tag-master` und `dante-tag-master` haben während `side-zweite-chance` active je eine Wahl. Sie setzt `<npc>_zweite_chance_gehoert` (hunter, raven, dante). Die Quest kann darauf als Schritt prüfen.
- **Sonder-Quests (Hunter Rang 5, `sonder-chrome-tresor` usw.)** sind hier nicht gebaut.
- **main-3 (Partynacht):** Ravens Klopfzeichen ist abgesprochen (`raven_klopfzeichen_abgemacht` aus `raven-a3-nerven`). Gechippte Raven in der Partynacht: `raven-tag-gechippt` (Klopfen setzt `raven_gechippt_geklopft`). Wer die Befreiung baut, kann das Flag als leichteren Weg nutzen.
- **Lio Funkel:** Die Nachricht `tel-wingman-lio` kommt von `lio-funkel` (Musik fürs Date). Nur Freundschaft, keine Romanzezeilen.
- **Babette Bao:** Hotspot `wingman-korb` am Spot `garkueche-bank` (Schrottmarkt, nicht montags), Dialog `wingman-korb` mit Babettes Zeilen.
- **Art (fehlende Tafeln):** `cut-rom-hunter-date` (Garküche, zwei Hände über Dampfnudeln), `cut-rom-dante-date` (Flutmauer, Koffer-Plattenspieler, Kekse, Feuerlöscher), `cut-rom-dante-werkstatt` (Röhrenglimmen bei Stromausfall, Kuss angedeutet, nicht sexualisiert), `cut-wingman-sonnenuntergang` (zwei Silhouetten an der Flutmauer, Picknickkorb, orange Sonne). Nachtszenen nutzen `black` und brauchen keine Tafel.
- **Ersetzt Platzhalter:** keine (he-*-8/10 waren eigene Platzhalter in diesem Ordner).
