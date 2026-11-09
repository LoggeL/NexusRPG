# Lücken und Absprachen: Paket pkg-chrome-himmel (chrome-boulevard, himmelsgarten)

Dateien: `game/src/content/parts/maps-23/{chrome-boulevard,himmelsgarten,shops-chrome-himmel,chrome-auftraege}.ts`
Bilder: `bg-chrome-boulevard` (+ `-stiftung` im Nachspiel nach he-seraphina-chrome-10, `-master` bei Flag `ende_master`),
`bg-himmelsgarten` (+ `-party` Partynacht, `-gekippt` Partynacht mit `nexus_rebelliert` oder main-3-gedankenkontrolle
erledigt, `-park` Nachspiel).

ersetzt Platzhalter: keine.

## Von der Zone angelegt (bitte nicht doppelt)

- **Station** `station-chrome-allee` (Einstieg `station`, cityPos [0.69,0.1], sichtbar nach Besuch). Hotspot
  `ubahn-zugang` schaltet sie per `unlockStation` frei und öffnet zusätzlich die Stadtkarte (`cityMap`).
- **Ausgänge Boulevard**: `nach-glasarkaden`, `penthouse-tuer` (PENTHOUSE_OFFEN: Nachspiel oder Akt 2 plus eins von
  chrome-einladung, side-teekraenzchen aktiv, Seraphina ♥4, Sybella ♥4, Flag `teekraenzchen_keks_lieferung`, Flag
  `albert_laesst_rein`), `nach-quantum-campus` (ab Akt 2), `turmaufzug` (Nachspiel, Akt 3 nach main-3-einlass, sonst
  nach he-serenity-chrome-6 morgens/tags).
- **Ausgänge Himmelsgarten**: `turmaufzug` (immer), `gaesteaufzug` (Akt 3/Nachspiel), `nach-quantum-campus` (Akt 3 nach
  main-3-einlass oder Nachspiel). Einstiege `catering`, `wartungsgang`, `landeplatz` für main-3-blade.
- **Händler** `chrome-und-co` (Besitzerin sybella-chrome), `glanzstueck`, `himmelsgarten-blumen` (nur Nachspiel).
- **Tafel** `concierge-chrome` mit job-concierge-bijou / -tischordnung / -ohrringe (Akt 2, Ruf chrome-haus 30).
- **Kopfgeld** `kopfgeld-blech-schwestern` an Hunters `auftragstafel` (Akt 2, crew-hunter 80), Spur am Spot
  `blech-schwestern-ecke`, Abgabe-Hotspot im gerichtssaal [640,660]. Flags `kg_blech_schwestern_gestellt`,
  `kg_blech_schwestern_erledigt`, `kontakt_blech_schwestern` (laufen lassen).
- **Sammelobjekte**: `datenwuerfel-11` (Boulevard, akt-schloss 3), `datenwuerfel-15` (Himmelsgarten, akt-hacken),
  `glueckstern-12`, `glueckstern-13`. Aussichtspunkt `aussicht-himmelsgarten` (markSeen, 20 XP).
- **Minispiele**: `hochstapeln` / `hochstapeln-profi` (akt-hochstapeln 2/3, täglich), `tanzflaeche` (akt-tanz, Partynacht).
- **Hecki** ist ein talk-Hotspot (Orchidee einmal pro Woche über `woche_hecki_geschenk`), keine NPC.

## Spots für Herz-Ereignisse und Quests

Boulevard: aufzug-ankunft, portierloge, penthouse-eingang, balkone-blick, boutique-chrome, juwelier-glanzstueck,
boulevard-mitte, wolkenbank, promenade, cafe-terrasse, pudelwiese, werbedrohne-start, turmaufzug, campus-schranke,
blech-schwestern-ecke, ubahn-abgang, auftrag-a.

Himmelsgarten: gaesteeingang, partysaal, tanzflaeche-glas, rosenboegen, buffet, champagnerkuehler, bar-himmel,
vip-lounge, rednerbruecke, rednerpult, presse-podest, wartungsgang, antennen, landeplatz, gleiter, hecki,
serenity-beet, blumenstand, aussicht-stadt, catering-tuer, bruecke-sued.

Die he-*-Ereignisse (Blade, Seraphina, Sybella, Serenity 6–10), re-blade-8 und Albert 2/4 legen die Figuren-Agenten
an; von hier kommen nur die Spots. Die Quest-Hotspots main-3-* (Rednerpult, Gleiter, Kämpfe) legen die Quest-Agenten an.
Die Blick-Hotspots hier heißen deshalb `rednerpult-blick`, `gleiter-blick`, `gleiter-weg`, `gaesteliste-pult`.

## Offene Verweise (Quests fehlen noch, stehen in act23.json)

vitest meldet unbekannte Verweise auf `side-teekraenzchen`, `side-chrome-pudel`, `main-3-gedankenkontrolle` und
`main-3-blade`. Sie verschwinden, sobald die Quest-Agenten diese Quests anlegen.

## Engine-Lücken (umgangen)

- **Kein ShopDef.discounts**: Der Seraphina-Rabatt (♥6, −10 %) steht als doppelter Bestand im Shop (Normalpreis mit
  `not hearts≥6`, Rabattpreis mit `hearts≥6`), siehe `lux()` in shops-chrome-himmel.ts.
- **Keine blockVariants**: Der Gleiter-Block auf dem Landeplatz bleibt auch im Park-Bild (Nachspiel) bestehen.
- **Musik** nur nach Tag/Nacht (`{day:'oberstadt', night:'releaseparty'}`), nicht nach Bedingung. Nachts läuft
  deshalb auch außerhalb der Partynacht die Partymusik.
- **Kopfgeld Stufe 3** braucht eine eigene Abgabe im Gerichtssaal; das passt nicht ins BENANNT-Muster der übrigen
  Kopfgelder.
- **Kein Rosen-Item**: Hecki verschenkt eine Orchidee statt einer Rose.

## Für andere Agenten

- **Neues Item** `taschenuhr-ripper` (Kategorie quest, 600 Cr in chrome-und-co, solange pers-ripper-taschenuhr aktiv
  ist und man sie nicht hat). Die Quest pers-ripper-taschenuhr soll genau diese ID prüfen. Symbol `taschenuhr-ripper`
  fehlt noch im Icon-Satz.
- **Flags, die hier gesetzt werden**: `albert_laesst_rein` (Albert-Einlass), `teekraenzchen_keks_lieferung` (wird hier
  nur gelesen, setzen soll side-teekraenzchen), `klatsch-chrome-einladung` (Klatsch-Dialog, Hinweis auf die Einladung),
  `himmelsgarten_kekse_getauscht` (Buffet: Dantes Kekse getauscht).
- **Gelesene Flags**: `epilog`, `ende_master`, `nexus_rebelliert`.
