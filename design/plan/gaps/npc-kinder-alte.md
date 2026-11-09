# Lücken – Figuren daria, freya, jakko, oma-volt, opa-gustav

Ordner: `game/src/content/parts/npc-kinder-alte/` (eine Datei je Figur, Helfer in `_dsl.ts`).

1. **Herz-Obergrenze Akt 1 (899 Punkte, world.md §11.2) fehlt in der Engine.** Gelöst über Bedingungen: `he-<id>-8` und `he-<id>-10` haben `when: { act: 2 }`. Ab ♥8 in Akt 1 kommt einmal das Tagesgespräch `<id>-zeit` mit dem Hinweis „Diese Freundschaft braucht noch Zeit“ (`markSeen`). Vorschlag: Punkte-Deckel in `relations.ts`, solange `act < 2`.
2. **Gustavs Kranblick (`he-opa-gustav-2`): „Die Karte zeigt einen Tag lang alle Sammelobjekte der Unterstadt.“** Kein Effekt dafür vorhanden. Gesetzt werden das Flag `gustav_kranblick` und `seen: gustav-kranblick` plus eine Meldung. Vorschlag: Effekt `revealCollectibles: { district: 'unterstadt', untilDay }` oder die Kartenansicht liest das Flag und den Tag der Ereignis-Vollendung.
3. **`[Schrott]`: Werkbank bei Gustav ab Tag 1 (world.md §2.2).** Der Hotspot `gustavs-werkbank` auf `schrottmarkt` (Karten-Agent) fragt nur `seen: he-opa-gustav-6` ab. Vorschlag: `when: { any: [{ seen: 'he-opa-gustav-6' }, { origin: 'origin-schrott' }] }`. Zusätzlich setzt `he-opa-gustav-6` das Flag `gustav_werkbank`.
4. **Opa Blech als Kioskwächter (`he-oma-volt-4`).** Setzt `opa_blech_kioskwaechter` und je nach Wahl `opa_blech_gruss_hoeflich`, `opa_blech_gruss_ruppig` oder `opa_blech_gruss_collin`. Gebraucht: eine Figur bzw. Platzierung `opa-blech` am Spot `kiosk-waechter` der Neon-Gasse mit dieser Bedingung und einem Ansprech-Spruch je Gruß-Flag (Weltfiguren-/Karten-Agent).
5. **Rezept „Großmutters Blitzbrause“.** Den Gegenstand `rezept-blitzbrause` (Quest, unverkäuflich) und das Flag `rezept_blitzbrause` legt diese Datei selbst an (oma-volt.ts), weil world.md keine ID nennt. Vorschlag für den Checks-Agenten: `gc-72` bekommt einen sicheren Bonus bei `{ item: 'rezept-blitzbrause' }`. Ein Werkbank- oder Koch-Rezept dafür gibt es noch nicht.
6. **Paul / side-ki-fluestern.** `he-oma-volt-6` läuft in Akt 1 als Vorahnung (Flags `paul_komisch`, optional `paul_chip_gesehen` oder `paul_programm_bekannt`). Die Quest startet erst ab Akt 2 über das Tagesgespräch `oma-volt-paul`. Die Sprecher-ID `paul` stammt aus world.md §4.5 und muss vom Weltfiguren-Agenten angelegt werden.
7. **Fremde Sprecher und Ziele, die hier nur über ihre ID verwendet werden:** `wett-willi`, `paul`, `opa-blech`, `babette-bao`, `dante`, `richter`, `lio-funkel`, `ripper`. Dazu die Quests `pers-daria-botendienst`, `pers-kinder-wasserturm`, `pers-jakko-kochbuch`, `pers-gustav-alte-liebe`, `side-eins-turnier`, `side-ki-fluestern`, `side-oma-volts-lager`, `side-zehn-credits` und `side-keksalarm` sowie die Herkünfte `origin-*`. `startQuest` steht immer in einem eigenen Dialogknoten, damit eine fehlende Quest nicht die Herz-Effekte mit ablehnt.
8. **Fluchdose (Freya).** Fluch-Wahlen kosten 1 Credit (`requires: { credits: 1 }`) und setzen das Flag `fluchdose_gefuettert`. Einen Zähler gibt es nicht. Vorschlag: eine Zähl-Variable (Flags sind nur boolesch), damit Freya echte Wochenzahlen nennen kann.
9. **Versöhnung bei Rivalität.** Kinder: drei `bao-dampfnudel` → `reconcile` für das betroffene Kind, die anderen beiden bekommen +10. Gustav: `oelkaennchen` für Knurri. Oma Volt: `kraeuter-gebaeck`. Die Rivalitäts-Ereignisse `re-<id>-2` (Streich bzw. Knurri) sind kurze Erzähltexte.
10. **Bilder.** Für die Herz-Ereignisse dieser Figuren gibt es keine Plates (`cut-…`), darum hat keine der Szenen eine Cutscene. Vorschlag für die Bild-Agenten (Kinder nur harmlos im Alltag): `cut-he-daria-6` (Karte der Stadt im Nest, Regeneimer), `cut-he-opa-gustav-4` (Schuhschachtel mit Fotos vor dem Wohnwagen), `cut-he-jakko-4` (Ölfass-Herd am Kran).
11. **Händler Bodo Bückling** (`he-freya-2`, falsche Waage) spricht nur in Erzählzeilen und hat keine NpcDef. Den Spot `waage` auf dem Schrottmarkt kann der Quest-Agent für `pers-freya-fairer-lohn` nutzen. Das Herz-Ereignis braucht ihn nicht.
12. **Volt-Eck-Aufnäher** (`he-oma-volt-6`): dauerhafter `checkBuff` mit +1 auf Straße und den Stichwörtern `einschuechtern` und `geruecht` (`consumes: false`). Falls die Gegenstands-Agenten lieber einen Kleidungs-Gegenstand daraus machen wollen: Vorschlag `aufnaeher-volt-eck`.
13. **Freyas Geburtstag:** `birthday` gilt am Kalendertag 6 und an jedem Samstag, solange `side-keksalarm` aktiv ist.

---

## Akt 2, Akt 3, Nachspiel (Lauf 09.11.)

Neue Dateien: `daria-akt23.ts`, `freya-akt23.ts`, `jakko-akt23.ts`, `oma-volt-akt23.ts`, `opa-gustav-akt23.ts`
(je `part.dialogues` plus Listen `*_HE_23`, `*_TALK_FRUEH`, `*_TALK_POOL`, `*_SCHEDULE_23`, die die Figurendateien einhängen).
Phasen-Bedingungen stehen in `_dsl.ts` (`A2_CHAOS`, `A2_FREI`, `A2_PARTY`, `PARTYNACHT`, `NACHSPIEL`, `MASTER` …).

**Ersetzt Platzhalter:** keine. (`pers-gustav-alte-liebe` und `side-ki-fluestern` bleiben Sache der Quest-Pakete;
`he-opa-gustav-8` startet `pers-gustav-alte-liebe` weiter in einem eigenen Knoten, `oma-volt-paul` startet `side-ki-fluestern`.)

14. **Gustav doppelt?** `npc-oednis/folgen.ts` stellt Gustav per `mapAdditions.npcs` sonntagabends auf `aussiedlerhof:gustav-bank`
    (nach `pers-gustav-alte-liebe`) und samstags tags auf `quantum-campus:campus-wiese` (nach `side-offene-werkstatt`).
    Damit er nicht gleichzeitig am Schrottmarkt steht, hat sein Tagesablauf für genau diese Zeiten `place: 'away'`.
    Sein Gespräch dort (`opa-gustav-bei-elsa`) kommt über `NpcDef.talk`. Sauberer wäre: Platzierungen in folgen.ts entfernen
    und die beiden Orte als echte Tagesablauf-Einträge in opa-gustav-akt23.ts (`GUSTAV_SCHEDULE_23`) eintragen.
15. **Oma Volt hat höchstens 6 Herzen** (world.md §4.4/§4.5) – darum keine `he-oma-volt-8/10`, nur Phasen-Gespräche.
16. **Keine Romanze, kein Begleiter** in diesem Ordner (alle fünf stehen nicht in `content/romance.ts`; drei sind Kinder).
17. **Herz-Ereignisse 8/10** sind jetzt volle Szenen und gelten ab Akt 2, außer in der Partynacht und im Master-Modus (`HERZ_SPAET`).
    `he-daria-8` zusätzlich nicht, solange `main-2-kanal` aktiv ist (Ripper sitzt dann im Pumpwerk).
18. **Fahndung bei Oma Volt:** Einmal pro Woche versteckt sie die Spielfigur (`wanted: -1`, Flag `woche_oma_versteck`), sobald `fahndung_1` gilt.
19. **Volt-Eck im Master-Modus:** Oma Volt verweigert im Gespräch den Laden, der Kiosk-Laden-Hotspot der Karte `neon-gasse`
    öffnet aber weiter. Vorschlag (Karten-Agent Neon-Gasse): Laden-Hotspot `when: { not: { all: [{ flag: 'master_modus' }, { notFlag: 'ende_doch_noch_meer' }] } }`.
20. **Rabatt „5 %“** nach `side-ki-fluestern` und der Kinder-„Bandenpreis“ sind nur Text (`ShopDef.discounts` fehlt, gaps-done.md).
21. **Party-Puffer** ohne Frist (`consumes: true`): `buff-daria-gluecksbringer` (Straße +1), `buff-freya-siegel` (Ausstrahlung +1),
    `buff-oma-geheimtasche` (Reflexe +1). Gedacht für die Checks in Akt 3; sie gelten bis zum nächsten passenden Bestehen.
22. **Quantum-Chip-Schrott für `prep-gegenmittel`:** höchstens 4 Stück aus diesem Ordner (Gustav nach dem Bruch 1, Gustav ♥6 einmal 1,
    Daria ♥8 einmal 1, `he-jakko-8` Drohnenwurf 1).
23. **Nachspiel am Meer:** Wer in einem Nachspiel-Gespräch zusagt, steht samstags tags auf `das-meer`: Kinder (`kinder_meer_dabei`;
    Daria `strand`, Freya `wasserlinie`, Jakko `lagerfeuer`), Oma Volt (`oma_volt_meer_dabei`, `duenengras`), Gustav (`gustav_meer_dabei`, `steg`).
    Vorschlag für `quest-enden/epilog-karten.ts`: Meldung „Die Nest-Bande sieht das Meer“ bei `kinder_meer_dabei`.
24. **Fundbüro der Nest-Bande** (Epilog-Karte „die drei Kinder gründen ein Fundbüro“): Hotspot `kinder-fundbuero` auf `schrottmarkt`
    bei [480, 470] (links neben `botenstand`), nur Nachspiel M/T, Angebot nach Wochentag. Bitte bei Gelegenheit prüfen, ob der Punkt erreichbar ist.
25. **Gelesene fremde Flags/Quests:** `aria_gechippt`, `aria_arm_gesperrt`, `dante_beigetreten`, `releaseparty_geplant`, `nyra_hat_kuschel`,
    `nyra_befreit`, `fahndung_1`, `epilog`, `master_modus`, `ende_meer`, `ende_neue_nexus`, `ende_doch_noch_meer`, `opa_blech_kioskwaechter`;
    Quests `main-2-kanal`, `main-2-countdown`, `main-2-krisensitzung`, `side-ki-fluestern`, `pers-gustav-alte-liebe`, `side-offene-werkstatt`,
    `pers-freya-fairer-lohn`, `pers-kinder-wasserturm`, `pers-jakko-kochbuch`. Fallbacks: „Dante da“ = Flag `dante_beigetreten` **oder**
    `main-2-countdown` erledigt; „Party beschlossen“ = `releaseparty_geplant` **oder** `main-2-krisensitzung` erledigt.
26. **Neu gesetzte Flags:** `daria_gegen_ripper`, `bande_mitglied`, `daria_kreidegeist`, `nest_kennt_quartier`, `daria_karte_meer`,
    `daria_karte_turm`, `kinder_augen_offen`, `kinder_zuschauer_organisiert`, `freya_klageschrift`, `freya_kindergericht`,
    `freya_urteil_*`, `lex_freya`, `jakko_marktessen`, `jakko_essen_staerker`, `jakko_nyra_dampfnudel`, `jakko_haeppchen_wunsch`,
    `jakko_gold_probiert`, `jakko_kaktus_variante`, `gustav_tanz`, `gustav_koenig`, `gustav_will_ans_meer`, `kinder_meer_dabei`,
    `oma_volt_meer_dabei`, `gustav_meer_dabei`, `woche_oma_versteck`, `heute_*` (Tagesportionen). `kinder_zuschauer_organisiert` und
    `lex_freya` könnten in `main-3-einlass` (öffentliche Meinung) bzw. den Nachspiel-Sendungen aufgegriffen werden.
27. **Bilder (Vorschlag, Kinder nur harmlos im Alltag):** `cut-he-jakko-8` (langer Tisch auf dem Markt, Schlange bis zum Kran),
    `cut-he-opa-gustav-10` (Schrottkrone auf dem Wachstuch vor dem Wohnwagen), `cut-he-freya-10` (Gerichtsgarten, Kind auf der Zuschauerbank).
