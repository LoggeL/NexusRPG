
## Checks (game/src/content/parts/system/checks.ts)

- **Stichwort-Vokabular für Perks/Cyberware/Gegenstände** (Kopf der Datei checks.ts): Die Bonusregeln greifen nur über `CheckDef.tags`. Vorschlag für die Gegenstands-/Perk-Agenten:
  - `kopf-fx-60` → `{ attribute: 'technik', tags: ['hacken'], value: 1 }`
  - `kopf-nexus-splitter` → `{ attribute: 'technik', value: 1 }`
  - `arme-datenbuchse` → `{ attribute: 'technik', tags: ['terminal'], value: 1 }`
  - `dexters-schraubschluessel` → `{ attribute: 'technik', tags: ['maschine'], value: 1 }`
  - `kopf-merkchip-alt` → `{ attribute: 'strasse', tags: ['geruecht'], value: 1 }`
  - `arme-greifhaken` → `{ attribute: 'koerper', tags: ['welt'], value: 1 }`
  - `augen-adlerblick` → `{ attribute: 'reflexe', tags: ['fernkampf'], value: 1 }`
  - `outfit-oednis` → `{ attribute: 'koerper', tags: ['sandsturm'], value: 1 }`
  - `dachlaeuferin` → `autoPass { attribute: 'reflexe', tags: ['dach', 'flucht'], maxThreshold: 10 }`
  - `perk-rammbock` → `autoPass { attribute: 'koerper', tags: ['verklemmt'], maxThreshold: 6 }`
  - `perk-einschuechtern` → `substitute { use: 'ausstrahlung', for: 'koerper', tags: ['schulden'] }`
  - `perk-dickes-fell` → steht bei gc-111 schon als Bonus; zusätzlich `autoPass { tags: ['gift'] }` möglich.
  - `haut-neonnaehte` (+1 Ausstrahlung Unterstadt), `outfit-ordentlich` (Mittelring), `outfit-party`/`goldknauf-stock` (Oberstadt) brauchen keine Tags, nur `districts`.
- **Automatisch bestehen:** CheckDef hat kein `autoPass`; Herkunfts-/Gegenstands-Ersatzwege aus §7 (z. B. `[Ödnis]` bei gc-92, `[Oberstadt]` bei gc-38/gc-106, `[Ex-Wache]` bei gc-63, gc-32 nach gc-05, gc-127 mit `aria_kern_ripper`, Gegenstände bei gc-145–gc-153) sind als Bonus +10 umgesetzt. Die Aufschlüsselung zeigt dann „+ Ölkännchen 10“. Vorschlag Engine: `CheckBonusDef.autoPass?: true` → Anzeige „automatisch bestanden (Ölkännchen)“ statt +10.
- **Gegenstand getragen vs. im Inventar:** Bedingung `item` prüft nur das Inventar; bei `outfit-kanal` (gc-147) und `outfit-party` (gc-38/gc-108) wäre „getragen“ richtiger. Vorschlag: Bedingung `{ wearing: ItemId }`.
- **Fraktionen** gesetzt nur bei klaren Fraktionsgesprächen (zerleger, kanalvolk, nx1-medien, ordnungsdienst, rostzaehne, chrome-haus, staubfalken, aussiedler). Bewusst **ohne** `quantum` bei Akt-3-Einlass/Labor (sonst +2 Schwelle durch den festen Ruf −30, obwohl die Crew verkleidet ist).

## Gegenstände, Cyberware, Händler (parts/system/items-*.ts, cyberware.ts, abilities-items.ts, shops.ts)

- **Itemsymbole fehlen alle:** `manifest.json` → `items: { atlas: '', icons: {} }`. Jeder Gegenstand hat `icon = <item-id>`, Sammelreihen teilen sich ein Symbol je Reihe (`schallplatte`, `datenwuerfel`, `glueckstern`, `neon-tag`, `jimmy-spur`, `flaschenpost`, `chip-fragment`). Rund 330 Symbole nötig → Atlas `ui/items.png` (64×64) per Codex erzeugen und `icons` füllen.
- **Inventar-Passive nur als Check-Bonus:** `ItemDef` kennt außerhalb von `wear` nur `checkBonus`. Andenken-Boni wie Händlerrabatt (`hunters-sonnenbrille` −5 % Unterstadt, `chrome-mitgliedskarte` −20 % Oberstadt), Schleichschaden (`ravens-klinge`), Moral (`zerberster-gravur`), „Unkaputtbar“ teilen (`kabelbrand-pass`), Taxi gratis (`kikis-taxikarte`), täglicher Fund (`bolzens-marke`), Garküchen-Heilung (`babettes-kochloeffel`) stehen nur im Text. Vorschlag: `ItemDef.passive?: PassiveEffects` (gilt, solange im Inventar).
- **Wiederverwendbare Kampfgegenstände:** `finishBattleIn` zieht jeden im Kampf benutzten Gegenstand ab, auch mit `use.consumes: false`. Deshalb haben `opa-blech-fernbedienung` (Geschütz 3 Runden), `plattenspieler-tragbar` (Ermutigt) und `captain-kuschel` (Kampf mit Dante) **kein** `use.battle`. Vorschlag: bei `consumes: false` nicht abziehen, Einsätze pro Kampf über `AbilityDef.uses`.
- **Verbrauchswirkungen ohne Effekt:** Initiative im nächsten Kampf (`volt-limo`), Lauftempo (`synth-kaffee`), Status entfernen (`nanogel` Angeschlagen, `neon-limo` Betäubt, `nougatbombe` Diva), Ermutigt (`drei-sekunden-keks`, `neon-limo`), Lichtkreis (`pilzsuppe`), Giftschutz-Einsätze (`staubmaske`), Rattenabstand (`roestzwiebeln`), Gruppenheilung (`jakkos-eintopf`, `dantes-kekse` mit Rezept). Umgesetzt ist nur die Heilung bzw. `checkBuff` (Nougatbombe +1 Ausstrahlung).
- **Fahrkarten:** Die U-Bahn kennt keinen Fahrpreis. Vorschlag: Stationsreise verlangt `u-bahn-ticket` (verbraucht) oder `monatskarte` (28 Tage ab Kauf, bräuchte Ablaufdatum), sonst 5 Cr.
- **Dietrich-Chip:** öffnet Schlösser bis Schwelle 6 statt `akt-schloss`. Hotspots/Dialoge mit Schloss sollen eine Wahl `requires: { item: 'dietrich-chip' }` + `{ take: 'dietrich-chip' }` anbieten. Das Stichwort `schloss` (Dietrich-Set, Pims Mikrokäfer) fehlt im Vokabular von checks.ts – bitte bei Schloss-Checks ergänzen.
- **Statuswirkungen:** Verlangsamt, Ermutigt, Geblendet, Getarnt, Rückstoß, „trifft über Deckung“ (Kabelpeitsche), „leise“ (Bolzer), „−10 Treffer nach Bewegung“ (Impulsgewehr), „ignoriert 2 Firewall“ (Datenlanze) gibt es nicht. Waffen- und Cyberware-Fähigkeiten nutzen die nächstbeste StatusId (betaeubt/markiert/geschuetzt/blutet) und sagen das im Text.
- **Cyberware-Merkmale (`traits`) ohne Regel:** `geruechte-markieren`, `party-initiative-1`, `immun-verunsichert`, `betaeubt-abschuetteln-1`, `kampfbeginn-staerksten-markieren`, `geschenk-vorliebe-zeigen`, `licht-unter-tage`, `sichtkegel-nachts`, `konsole-0ap`, `hacken-plus-1-zug`, `luecken-ueberwinden`, `nahkampf-brennt`, `lauftempo-10`, `satz-erhoeht`, `kampf-extra-ap-1`, `immun-kurzschluss`, `stromschaden-halb`, `minispiel-zeit-50`, `ueberwachung-ignorieren-1`, `giftschutz`, `immun-kanalmief`, `sichtkegel-20`, `club-gratis`; Kleidung: `tragplaetze-4`, `drehkreuz-outfit`, `party-einlass`, `tarnung-campus`, `giftpfuetzen-schutz`, `hitzeschutz`, `sandsturm-koerper-1`, `blades-mantel-kommentare`, `tempo-strasse-25`. Abfrage per `hasTrait()` in den jeweiligen Systemen.
- **Macken bei Gebrauchtteilen** (Ripper, 30 %): kein Mechanismus. Vorschlag: `ShopStockEntry.quirkChance` + Flag `macke_<slot>` beim Einbau; Dante entfernt sie per Dialog.
- **Gleitbrett** ist Kleidung (einziger Platz `kleidung`) und schließt ein Outfit aus. Vorschlag: eigener Ausrüstungsplatz `zubehoer`.
- **Getragen statt besessen:** Drehkreuz mit `outfit-ordentlich` sollte „getragen“ prüfen (`{ wearing }`, wie im Checks-Abschnitt vorgeschlagen); bis dahin `{ item: 'outfit-ordentlich' }`.
- **Dienste ohne Ware:** Dr. Winkel (Fahndung −1 für 150 Cr) braucht einen Effekt `{ wanted: -1 }`; Oma Volts Nähservice, Suppenküchen-Spende, Gina (Aussehen) laufen als Dialoge der Zonen-Agenten.
- **Sammelbelohnungen:** 10/20 `glueckstern` (+1 Perkpunkt / `haut-neonnaehte`), 20 `datenwuerfel` (`kopf-merkchip-alt` + „Gründungsprotokoll“), 12 `neon-tag` (Ruf unterstadt +10), 6 `chip-fragment` brauchen einen Auslöser, der verschiedene IDs einer Reihe zählt (`{ item, min }` zählt nur eine ID). Vorschlag: Bedingung `{ collected: 'glueckstern', min: 10 }` (Präfix zählen) oder je Fund ein Zähler-Flag.
- **Cyberware-Defs liegen in parts/system/cyberware.ts** (mit Gegenstand gleicher ID). Falls ein Perk-Agent eigene CyberwareDefs schreibt: dort zusammenführen, nicht doppelt anlegen.
- **Fremde Fähigkeits-IDs:** `hackmodul-basis` nutzt `hack-systemlaehmung`, `arme-zerberster-3000` nutzt `aria-zerbersten` (beide aus parts/combat/abilities.ts).
