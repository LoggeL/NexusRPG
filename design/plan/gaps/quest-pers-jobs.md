# Lücken: quest-pers-jobs (persönliche Quests Akt 1, Aufträge, Kopfgelder)

Inhalt liegt in `game/src/content/parts/quest-pers-jobs/`. Folgende Dinge kann die Engine (noch) nicht, und der Inhalt umgeht sie:

1. **Auftragsziele werden nicht angezeigt oder ausgelöst.** `jobTargetEffects`/`jobTargetsOn` (modules/jobs) sind nirgends verdrahtet.
   Ersatz: Jedes Ziel hat einen eigenen Hotspot mit `when: { job: <Vorlage> }`. Eine Bedingung „Ziel dieses Angebots ist Karte X“ fehlt,
   deshalb ist der Hotspot auf **allen** Zielkarten einer Vorlage sichtbar. Wunsch: Bedingung `{ jobTarget: MapId }` oder ein Marker am gezogenen Ziel.
2. **JobKind zu klein.** Es fehlen `tuersteher`, `bergung`, `kanal`, `reparatur`, `tipp`. Ersatz: Türsteher → `eskorte`, Bergung/Reparatur/Rohrpost → `kurier`,
   Kanal-Säuberung → `kopfgeld`, Collins Tipps → `datenraub`. Die Tafel zeigt deshalb teils falsche Art-Labels.
3. **Halber Kopfgeldlohn** (laufen lassen) ist `completeJob` plus fester Abzug (100/200 Cr). Durch Rang-Aufschlag und Frühstücksbonus ist das nicht genau die Hälfte.
   Wunsch: `{ completeJob, factor: 0.5 }`.
4. **Ratenzahlung bei Schulden** (120 % in drei Tagen) gibt es nicht; der Auftrag schließt sofort ab, Text sagt „Hunter treibt den Rest selbst ein“.
5. **Fahndung** (`job-datenraub` offensiv) gibt es nicht; Ersatz Ruf `ordnungsdienst` −5.
6. **`meinung`** (öffentliche Meinung, Collins Tipps) gibt es nicht; Ersatz Ruf `nx1-medien` +2 pro Tipp.
7. **Cyberware-Rabatt** für Dantes Reparaturliste ist nicht abbildbar (kein Effekt für Laden-Rabatte); Bezahlung nur Herzen (+15/+25) und kleine Credits.
8. **Collins Tipps per Telefon:** Die Nachricht `pj-collin-tipps` öffnet die Tafel über eine Antwort (`jobBoard`). Danach gibt es keinen Telefonzugang mehr,
   nur den Tippzettel im NX-1-Studio. Wunsch: Tafel als Telefon-App.
9. **Sammelgespräche statt Figurendialog:** Es gibt keine Möglichkeit, Auswahlpunkte in fremde Tagesgespräche einzuhängen. Deshalb steht neben jeder Figur mit offenem
   Questschritt ein Sprech-Hotspot „Mit X reden“ (`pj-hub-<npc>-<n>`, Dialog `pj-hub-<npc>`), dessen Plätze aus `act1.json` (npcSchedules) abgeschrieben sind.
   Ändert sich ein Tagesablauf, muss die Tabelle `ORTE` in `figuren.ts` mitgezogen werden. Wunsch: `DialogueDef.extend`/„Zusatzauswahl für Figur X, wenn Bedingung“.
10. **Bolzen läuft schneller (+1 Fund)** (`pers-bolzen-bein`): nur Flag `bolzen_neues_bein`; die Fundregel des Begleiters muss es auswerten.
11. **Leuchtturm nachts** (`pers-nebelhorn-letzte-faehre`): Flag `bojenfeuer_brennt`; Licht/Kartenänderung an hafenkante/flutmauer gehört dem Kartenbereich.
12. **Dauerhafte Belohnungen als Flags** für andere Bereiche: `dexter_leihhaus`, `marktfest_monatlich`, `ungeschminkt_ausstellung`, `kiki_reichweite`,
    `lio_album_fertig`. Der Kinderkurier (`pers-daria-botendienst`) ist ein eigener Hotspot `pj-db-kinderkurier`; Geschenke per Kurier gibt es in der Engine nicht,
    er vergibt ersatzweise Beziehungspunkte.
13. **Aufnahme-Minispiel** für Lios Album gibt es nicht; Ersatz `[Reflexe 4]` oder Warten.
14. **Abschluss per Kampfsieg** in fremden Begegnungen (`enc-job-*`, `enc-kopfgeld-*`) hat kein `onWin`. Eigene Begegnungen `pj-enc-*` kopieren die Gegner und schließen per
    `onWin` ab; benannte Kopfgelder werten `{ won: enc-kopfgeld-* }` an der Saalwache aus.
15. **Kopfgeld Stufe 3** (Blech-Schwestern, Faxfälscher, Staubbaron, Leutnant Nadel) liegt in Akt 2 und fehlt hier bewusst.
