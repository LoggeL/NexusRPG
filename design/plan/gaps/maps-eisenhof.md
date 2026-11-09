# Lücken: Zonen-Paket Eisenhof (eisenhof, gerichtssaal, zellentrakt)

Dateien: `game/src/content/parts/maps/eisenhof.ts`, `gerichtssaal.ts`, `zellentrakt.ts`.
Bilder: `bg-eisenhof` (1536×1024), `bg-gerichtssaal`, `bg-zellentrakt` (1024×768).

## Haft (world.md §10.3)

- **Festnahme fehlt in der Engine.** Gebraucht: Fahndung 3 + Kontakt mit Ordnungshütern → `{ setFlag: 'in_haft' }`,
  −10 % Credits (`[Knast]` −5 %), `{ travel: 'zellentrakt', entry: 'haft' }`. Vorschlag: Effekt `arrest` im
  Kampf-/Fahndungsmodul oder die Niederlage gegen `ordnungshueter` mit diesen Effekten.
- Prozentuale Credit-Strafe gibt es nicht als Effekt (`credits` nur absolut). Vorschlag: `{ creditsPercent: -10 }`.
- Im Zellentrakt ist alles vorbereitet: Einstieg `haft` in der Haftzelle, Ausgang gesperrt solange `in_haft`
  („Die Tür hat innen keine Klinke …“), Pritsche (`pritsche`, schlafen → entlassen), morgens an der Tür klopfen
  (`zellentuer-morgens` → entlassen), Notschlafplatz `shelter` bei `in_haft` (02:00-Zusammenbruch: −10 %, Aufwachen in der Zelle).
  Entlassen setzt `in_haft`, `fahndung_1..3` auf false und reist nach `eisenhof:von-zellentrakt`.

## Händler / Dienste

- **Shop `dr-winkel` fehlt** (Plan: `shops.dr-winkel`, „Fahndung −1 für 150 Cr“). Der Hotspot `dr-winkel` zeigt darauf.
  Fahndung ist kein Gegenstand – Vorschlag: Dienstleistungs-Eintrag im Shop oder ein Dialog `dr-winkel-dienst`
  mit `{ credits: -150 }` + Fahndungs-Flag eine Stufe tiefer (Besitzer: Figuren-/Gegenstands-Agent).

## Quest-Anschlüsse (Flags, die die Zone setzt)

- `side-feierabend-fuer-kessel`: Fundkammer-Sortieren (Dialog `eisenhof-fundkammer`) setzt `kessel_fundkammer_sortiert`;
  danach Loot `ravens-alte-jacke` (versteckt, sobald im Inventar – die Quest-Belohnung sollte die Jacke nicht doppelt geben).
  Begegnung `enc-gerichtsplatz-gang` (sichtbar am `gerichtsplatz`, tags, nach dem Sortieren, avoid `[Straße 5]`);
  nachts Kisten zurückholen an der `freigang-ecke` setzt `kessel_kisten_zurueck`. Quest-Schritte können
  `{ flag: … }` bzw. `{ won: 'enc-gerichtsplatz-gang' }` abfragen.
- `side-streaming-suenden`: Beweismittellager (Dialog `eisenhof-beweismittellager`): `gc-69` → `richter_eintrag_geloescht`;
  nachts `akt-schloss` (Schlüssel `eisenhof-beweismittellager`) oder Behördenkarte → `richter_server_geholt`.
- `pers-raven-handschellen`: Behördenterminal mit `behoerdenkarte` → `handschellen_seriennummer`.
- `pers-richter-goldene-gurke`: Hotspot `preisgurke` setzt `gurke_bissspuren_gesehen`.
- `job-datenraub`: Terminal-Hack (`akt-hacken`, Schlüssel `eisenhof-gerichtsarchiv`) oder `[Technik 6]` →
  `completeJob: 'job-datenraub'`. Aufträge kennen kein Zielort-Bedingung (`JobOffer.target`) – Vorschlag:
  Bedingung `{ jobTarget: { job, map } }`, damit nur das gezogene Ziel zählt.
- `job-kopfgeld`: Schalter im Gerichtssaal (`gerichtssaal-kopfgeld`) schließt ab, wenn Flag `kopfgeld_gestellt` gesetzt ist.
  Der Kopfgeld-Agent sollte dieses Flag nach dem Stellen setzen (oder Kopfgelder schließen schon über den Kampfsieg ab,
  dann ist der Schalter nur Kulisse).

## Sonstiges

- Plan-Hotspot `fundkammer`/`beweismittellager`/`behoerden-terminal`/`ravens-alte-jacke`/`preisgurke` sind in der
  MapDef angelegt. Quest-Agenten, die dieselben IDs per `mapAdditions` anlegen, erzeugen eine Doppel-Warnung –
  dann bitte in die Dialoge oben einhängen statt neu anlegen.
- Spot `entlassungstor` wird von Kessels Tagesablauf (M) und von `main-1-raven-am-tor` (Raven) gleichzeitig benutzt –
  die beiden stehen dann übereinander. Vorschlag: Raven in der Quest auf `[1340, 600]` oder einen eigenen Spot.
- `scripts/map_overlay.py` zeichnet Vorschauen noch im alten 640×360-Raster (Geometrie passt nicht zum Bild);
  geprüft wurde mit `map_tool.mjs` (Erreichbarkeit ✓ für alle drei Karten) und einer eigenen Überlagerung in Originalgröße.
