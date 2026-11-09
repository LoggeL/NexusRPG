# Lücken: Weltleben Akt 2, Akt 3 und Nachspiel (game/src/content/parts/world-23/)

Dateien: `_w23.ts` (Bausteine), `nachrichten-23.ts`, `telefon-23.ts`, `stadtereignisse-23.ts`, `drohnen-23.ts`,
`passanten-23.ts`, `quartier-23.ts`. Typprüfung und Inhaltsprüfung ohne Meldungen zu diesen IDs.

ersetzt Platzhalter: – (keine)

## Bezirke, Stationen, Stadtkarte

- **Nichts neu angelegt.** Alle sechs Bezirke existieren (`oednis` in `parts/world`, die übrigen in den Zonen-Paketen),
  `station-chrome-allee` legt `maps-23/chrome-boulevard.ts` an (cityPos `[0.69, 0.1]`, passt: weiße Türme rechts vom Spire).
  Die Ödnis-Zonen und `das-meer` haben keine U-Bahn (Rostlaube, Konvoi, Kiki, Bus).
- **Stadtkarte `assets/ui/city-map.webp` geprüft:** zeigt alle sechs Bezirke – Ödnis links (Windräder, Funkturm,
  Glasdünen-Kristalle, Aussiedlerhof mit Feldern), Küste rechts (Leuchtturm, offenes Meer), Kanalisation unten,
  Oberstadt mit Spire oben, Mittelring dazwischen. Kein Neumalen nötig.

## Passantensprüche (world.md §10.4)

`MapAddition` kann keine `ambient.barks` ergänzen. Ersatz: ansprechbare Passanten als feste Figuren
(`passanten-23.ts`, NpcDefs `welt23-*`, Laufblätter `passant-*-walk`) mit Gesprächen je Abschnitt:
Akt 2 gechippt (Neon-Gasse, Schrottmarkt, Rohrsiedlung, Stufenplatz, Glasarkaden, Eisenhof), Kanalvolk, Flutmauer;
Nachspiel ohne Chips; Master-Modus (Verbeugung vor der Spielfigur). Begleiterkommentare §10.4 als Wahl.

**Vorschlag Engine:** `MapAddition.barks?: { text; when? }[]` (an `ambient.barks` anhängen). Dann diese Sprüche ergänzen
(die §10.4-Grundsprüche für Akt 2/3 stehen in den meisten Unterstadt-Karten schon):

- Unterstadt, `{ act: 2 }` bis Akt 3: „Die Drohne da oben hat mir zugezwinkert. Drohnen zwinkern nicht.“ ·
  „Gratis-Chip? Meine Oma sagt, gratis gibt’s nur Ärger und Schnupfen.“ · „Seit dem Einbruch beim Campus stehen hier
  dauernd Weißhelme rum. Ich hab Hunter gesehen. Er hat gegrinst.“ · bei `fahndung_2`: „Psst. Du siehst aus wie die
  Kartoffel aus den Nachrichten.“
- Mittelring Akt 2: „Dienstag und Donnerstag gibt’s Chips am Brunnen. Ich hab drei. Ich weiß nicht mehr, wofür.“
- Nachspiel `epilog` ohne Master-Modus: „Ich hab heute ‚Nein‘ gesagt. Einfach so. Zum Bäcker.“ · „Der Bus ans Meer
  hupt jeden Morgen um sechs. Ich steh jetzt freiwillig auf.“ · „Kein Werbebildschirm mehr. Ich weiß gar nicht,
  wohin ich jetzt gucken soll. Vielleicht zu dir?“
- Master-Modus (`master_modus` ohne `ende_doch_noch_meer`): „Guten Tag, Master.“ · „Alles ist gut, Master.“ ·
  „Wir lächeln, Master. Sehen Sie? Wir lächeln.“

## Nachrichten

- 50 Sendungen nach Fortschritt (Hauptstrang Akt 2, Chipträger, Fahndung mit Phantombild, Blade-Spots, Radio Rost,
  Kurzmeldungen nach zehn Akt-2-Nebenquests, Akt-3-Liveschaltungen, Nachspiel, Master-Modus). Alle auf ihren
  Abschnitt begrenzt (`NUR_AKT2`, `NUR_AKT3`, `FREI`, `MASTER` in `_w23.ts`).
- **Integration:** `news-act2-start` und `news-rost-act2` (parts/world) gelten mit `{ act: 2 }` auch in Akt 3 und im
  Nachspiel und bleiben dort als „gesehene“ Hauptmeldung mit Priorität 6/5 hängen, sobald alles andere gesehen ist.
  Vorschlag: `all({ act: 2 }, not({ act: 3 }))` bzw. für `news-act3-start`/`news-rost-act3` `not({ flag: 'epilog' })`.
- Countdown „Noch X Tage“: Es gibt kein Partydatum (die Party startet, wenn die Spielfigur an der Planungstafel
  losgeht). Die Meldungen nutzen deshalb `main-2-countdown` erledigt und `party_bereit` („Morgen“).
- Wetter weiter als fester Zyklus über `cycleDay` (Sandsturm 4/11/18/25, Stromausfall 5/12/19/26).

## Stadtereignisse (world.md §10.6)

- **Chrome-10-Verteilung** Di/Do in Akt 2: Promoterin (`welt23-promoterin`) an `glasarkaden:chrome-10-werbestand`
  und `stufenplatz:stufen-rechts`, Sabotage per Technik/Ausstrahlung/Reflexe, Aria-Weg, Flugblätter ohne Check,
  `quantum-chip-schrott` für `prep-gegenmittel`. Die Gratis-Stände in Neon-Gasse/Schrottmarkt/Bahnhof baut
  `quest-main-2/freie-phase.ts`.
- **Stromausfall** (Fr abends/nachts, Akt 2/3 und Master-Modus): Hinweise auf vier Karten, Licht-Dialog am
  `neon-gasse:stellwerk-kasten`, Rattengruppe im Kanal. **Fehlt Engine:** Läden schließen (`ShopDef.when` bzw.
  Hotspot-Bedingung im Besitzerpaket) und Lichter aus (`LightDef.when?: Condition`). Vorschlag: beides als Bedingung,
  dann `STROMAUSFALL_TAG` aus `_w23.ts` benutzen.
- **Razzia** (nach `main-2-bruch`, Fahndung ≥ 1): sichtbare Ordnungshüter-Gruppe in der Neon-Gasse, umgehbar `[Straße 5]`,
  Hinweis „Crew-Quartier sicher“. Sieg: Fahndung +1.
- **Sandsturm** (Ödnis, Zyklustage 4/11/18/25): onEnter auf allen vier Ödnis-Karten, ohne `outfit-oednis`,
  `staubmaske` oder `haut-filtermembran` −5 LP. **Fehlt Engine:** Ausrüstung statt Inventar prüfen (Bedingung
  `{ equipped }`), Sicht 50 % und Fernkampf −20 im Kampf (Wetter-Lücke).
- **Neonnacht ab Akt 2** (`welt23-neonnacht`): Die Akt-1-Fassung (`welt-neonnacht`) ist auf Akt 1 begrenzt; die neue
  Fassung läuft in Akt 2 („unter Drohnen“) und im Nachspiel (Crew-Tisch), nicht in der Partynacht und nicht im
  Master-Modus.
- **Sonnenfest** (Nachspiel, sonntags abends, `das-meer:lagerfeuer`) mit **Meerestag** (Zyklustag 21, ersetzt den
  Gründertag): Wettschwimmen `[Körper 6]`, Algen-Chips, Tanz, Strandlauf, Lagerfeuer (Crew-Herzen).
  **Integration:** Den Gründertag des Stufenplatz-Pakets im Nachspiel ausblenden (`not({ flag: 'epilog' })`).
  Crew-Figuren stehen beim Fest nicht als Kartenfiguren am Feuer (ihre Tagesabläufe gehören den NPC-Paketen); der
  Dialog erzählt sie. Vorschlag: vorangestellter Tagesablauf-Eintrag `{ slot: 'abend', days: ['so'], when: epilog,
  place: { map: 'das-meer', at: 'lagerfeuer' } }` für die Crew.
- **Plakat „Bus ans Meer“** an `hafenkante:kai-mitte` im Nachspiel (§10.7). Den Bus selbst (Reise) baut das
  Strand-Shuttle des Rennhalle-/Meer-Pakets.

## Quantum-Drohnen in der Unterstadt

`drohnen-23.ts`: sechs sichtbare Gruppen (`enc-welt23-drohne-*`) nach `main-2-bruch` bis Akt 3, je Zone eine andere
Umgehung (Reflexe, Technik, Straße, Körper). Sieg: `quantum-chip-schrott`, 40 XP, Fahndung +1 (Quantum-Alarm §10.3).
Daneben bestehen die Blick-Hotspots aus `quest-main-2/freie-phase.ts`. Im Master-Modus greifen keine Drohnen an.

## Crew-Quartier §3.7 Stufen 4–6

`quartier-23.ts` als Flag-Kette `quartier_stufe_4..6`, Hotspot „Großer Ausbau“ (ab Akt 2, nach Stufe 3), Gästecouch
(Begleiter aus der Party abends einladen → Tageswechsel-Regel +10 Herzpunkte), Dachgarten (`akt-gaertnern` Stufe 2
oder Orchidee oder mit Dante Gemüse, einmal pro Tag), Aussicht (frei nach `side-strandclub`, sonst 2000 Cr; Meeresposter,
sonntags Captain-Kuschel-Besuch mit Keksen). Captain Kuschel schreibt, sobald eine Stufe bezahlbar ist.

- **Integration:** In `maps/crew-quartier.ts` sagt die Wahl bei Stufe 3 noch „Gästecouch, Dachgarten und Aussicht kommen
  später.“ – ersetzen durch einen Verweis auf den Hotspot „Großer Ausbau“ (oder die drei Wahlen aus `welt23-cq-ausbau`
  dorthin verschieben und den eigenen Hotspot entfernen).
- **Fehlt Engine:** „Übernachten“ prüft nicht, wo geschlafen wird (keine Bedingung `{ map }` bzw. Tageswechsel-Regel
  mit Schlafort). Die Einladung gilt deshalb für die nächste Nacht, egal wo die Spielfigur schläft. Vorschlag:
  `DailyRuleDef.sleptAt?: MapId` oder Bedingung `{ map: MapId }`.
- Grafik: Die drei Stufen sind nur Hotspots auf dem vorhandenen Bild. Für sichtbare Couch/Leiter/Poster wären
  `bgVariants` von `crew-quartier` mit `quartier_stufe_4..6` nötig (Besitzer: maps/crew-quartier.ts).

## Bilder

- Porträts der Passanten fehlen (`portrait-welt23-gechippter-nachbar`, `-gechippte-pendlerin`, `-kanalvolk`,
  `-spaziergaenger`, `-nachbarin`, `-pendler`, `-promoterin`). Das Spiel zeigt Platzhalter.
