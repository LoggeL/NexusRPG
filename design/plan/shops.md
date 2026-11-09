# Händler Akt 1 (game/src/content/parts/system/shops.ts)

Die Zonen-/Innenraum-Agenten setzen auf ihrer Karte einen Hotspot `{ kind: 'shop', shop: '<shop-id>' }` am genannten Spot
(oder per `part.mapAdditions[map].hotspots` mit `at: '<spot>'`). Spot-Namen sind Vorschläge in kebab-case nach
world.md §3.5; gilt ein anderer Name im ID-Plan `design/plan/act1.json`, zählt der ID-Plan.
Zeiten: Morgen 06–10, Tag 10–17, Abend 17–21, Nacht 21–02. Tagesbestand füllt sich jeden Morgen auf.

| Shop-ID | Name | Karte | Spot | Besitzer (NpcId) | Fraktion | Geöffnet | Sortiment (Kurz) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `volt-eck` | Volt-Eck | `neon-gasse` | `kiosk-volt-eck` | `oma-volt` | unterstadt | M/T/A | Medipflaster, Nougatbomben, Volt-Limo, Kaffee, Tickets, Comics, Kleinkram, Magnetangel, Metalldetektor |
| `hv-bar` | High-Voltage-Bar | `high-voltage` | `bar` / `tresen` | `barkeeper` | crew-hunter | A/N | Limos, Mocktail, Neon-Limo (nach `side-neon-limo`), Poster, Vinyl |
| `garkueche-babette` | Bao Babette | `schrottmarkt` | `garkueche` | `babette-bao` | unterstadt | M/T/A, nicht Mo | Dampfnudeln, Synth-Nudeln, Tee, Käseecke, Kräutergebäck (Fr) |
| `gustavs-schrottkram` | Gustavs Schrottkram | `schrottmarkt` | `gustavs-kran` (Wohnwagen) | `opa-gustav` | unterstadt | M/T | Rohrzange, Schläger, Bolzer, Rauchtopf, Klebegranate, Sprungfedern, Schrott, Werkzeug-Geschenke |
| `ripper-praxis` | Rippers Praxis | `ripper-praxis` (Innenraum) | `theke` | `ripper` | zerleger | 10–21 Uhr | Schockpistole, Funkenschleuder, Gebraucht-Cyberware (60 %), Hinterzimmer mit `ripper_kennt_dich` oder Ruf unterstadt 20; **Schrauber** (100 Cr, gratis ab zerleger „verehrt“) |
| `dexters-schrott` | Dexters Schrott | `schrottmarkt` | `dexters-buero` | `dexter` | unterstadt | T/A, nach `main-1-dexter` | Propeller, Rotor, Greifhaken, Schrott |
| `vinyl-vincent` | Vinyl-Vincents Plattenkiste | `schrottmarkt` | `plattenstand` | `vinyl-vincent` | unterstadt | T/A | Vinyl, `schallplatte-01` (180), `schallplatte-02` (260) |
| `imbiss-loetkolben` | Imbiss „Lötkolben“ | `schrottmarkt` | `imbiss` | – | unterstadt | T/A/N | Nudeln, Röstzwiebeln, Nougatbomben |
| `flohmarkt` | Sonntags-Flohmarkt | `schrottmarkt` | `flohmarkt` | – | unterstadt | So M/T | Trödel-Geschenke; Chrome-Boulevard-Ware im 28-Tage-Takt (Tag 7/14/21/28) |
| `loetzinn-laden` | Lötzinns Laden | `loetzinn-laden` (Innenraum) | `theke` | `mira-loetzinn` | unterstadt | 08–19 Uhr | Neu-Cyberware, Smart-Waffen, Nanogel, Störgranaten, Dietrich-Chips, Technik-Geschenke; **Schrauber** (80 Cr) |
| `dantes-werkstatt` | Dantes Werkstatt | `dantes-werkstatt` (Innenraum) | `einbau-liege` | `dante` | crew-hunter | M/T/A, nach `main-1-dante` | Reparaturset, `kopf-ruhepol` (Dante ♥6), ab Akt 2 Rabatt-Cyberware; **Schrauber** (50 Cr, gratis ab Dante ♥2) |
| `suppenkueche` | Mutter Brühes Suppenküche | `suppenkueche` (Innenraum) oder `rohrsiedlung` | `kessel` | `mutter-bruehe` | unterstadt | M/T/A | `bruehes-suppe` (3 Cr), Kaffee (2 Cr). Spendenkasse = eigener Hotspot (Ruf unterstadt) |
| `fraeulein-pixel` | Fräulein Pixels Fotoautomat | `bahnhof-mitte` | `fotoautomat` | `fraeulein-pixel` | unterstadt | A/N | Dietrich-Chips, Dietrich-Set, `ausweis-oberstadt` (400) |
| `fundbuero` | Fundbüro | `fundbuero` (Innenraum) oder `bahnhof-mitte` | `schalter` | `gerda-gleis` | – | M/T | Handschellen, Peilsender, Magnetstörer, Kuriositäten |
| `ticketautomat` | Ticketautomat | jede U-Bahn-Station (`bahnhof-mitte`, `neon-gasse`, `hafenkante`, `rohrsiedlung`, `stufenplatz`, `glasarkaden`) | `ticketautomat` | – | – | immer | U-Bahn-Ticket, Monatskarte |
| `kiosk-bahnhof` | Bahnhofskiosk | `bahnhof-mitte` | `kiosk` | – | unterstadt | M/T/A | Papierzeitung, Kaffee, Chips, Ticket |
| `netzcafe-datenkruemel` | Netzcafé Datenkrümel | `netzcafe-datenkruemel` (Innenraum) | `theke` | – | unterstadt | immer | Hack-Modul, Datenkristall, Daten-Geschenke; Raubkopie-Stick „unter der Hand“ (Ruf unterstadt 10, Gossenkind oder Vex) |
| `salzige-grete` | Salzige Gretes Fischstand | `hafenkante` | `fischstand` | `salzige-grete` | unterstadt | M/T | Köder, Algen-Chips |
| `rennhallen-kiosk` | Rennhallen-Kiosk | `hafenkante` | `rennhalle-kiosk` | – | – | T/A/N | Limos, Riegel, Gleitbrett, Kurierfunk |
| `garage-rostlaube` | Garage an der Hafenkante | `hafenkante` | `garage-rostlaube` | `kaeptn-nebelhorn` | – | T/A | Reparaturset, Schrott, Ölkännchen, Postkarten (Rostlaube-Teile kommen aus `side-rostlaube`) |
| `imbisswagen-stufenplatz` | Brezel-Imbisswagen | `stufenplatz` | `imbisswagen` | – | – | M/T/A | Riesenbrezel, Kaffee, Limo |
| `salon-gina` | Salon Gina | `stufenplatz` | `salon-gina` | `stylistin-gina` | – | 10–19 Uhr | `outfit-ordentlich` (öffnet das Drehkreuz!), Haarspray, ab Akt 2 Partygarderobe. Aussehen ändern = eigener Dialog/Creator |
| `nx1-fanshop` | NX-1-Fanshop | `nx1-studio` (Innenraum) | `fanshop` | – | nx1-medien | M/T | Mikrofon-Puschel, Reporter-Notizbuch, Teleprompter-Chip |
| `satin-und-chrom` | Satin & Chrom | `glasarkaden` | `satin-und-chrom` | `madame-satin` | – | 10–19 Uhr | Kleidung, Lippenstift, Mode-Geschenke, Preisscanner, Neonnähte |
| `quantum-schauraum` | Quantum-Schauraum | `quantum-schauraum` (Innenraum) | `tresen` | `herr-glanz` | quantum | 10–21 Uhr | Nanogel, Medipflaster, Nexi-Plüsch, Fanartikel, Chrome-10-Gutschein (Di) |
| `feinkost` | Feinkost Glasarkaden | `glasarkaden` | `feinkost` (auch Lieferanteneingang) | – | – | 07–21 Uhr | Äpfel, Gemüse, Samen, Edelbrause, Orchidee, Honig |
| `cafe-sahnehaube` | Café Sahnehaube | `cafe-sahnehaube` (Innenraum) | `theke` | `barista-perle` | – | M/T/A | Sahnetorte, Edelbrause, Kaffee, Liebesroman |
| `pixelpalast` | Pixelpalast-Preistheke | `glasarkaden` | `pixelpalast` | – | – | T/A, Fr/Sa auch N | Plüschmöhre, Aufzieh-Roboter (Hauptpreise per Minispiel `akt-pixelpalast`) |
| `gerichtskantine` | Gerichtskantine | `eisenhof` | `kantine` | – | ordnungsdienst | M/T | Kaffee (2 Cr), Kräutergebäck, Gesetzbuch, Stempelkissen |
| `hartlauf-restposten` | Hartlaufs Digitech-Restposten | `digitech-areal` | `pfoertnerhaus` | `direktorin-hartlauf` | digitech | T | Störgranaten, Zielfernrohr-Linse, Zeitlupe, Tarnlack (1200 ab Ruf digitech 50), ab Akt 2 Impulsgewehr (Ruf 20) und Datenlanze |
| `fluss-frieda` | Fluss-Friedas Floßladen | `kanal-sammler` | `trockendock` | `fluss-frieda` | kanalvolk | M/T | Pilzsuppe, Stirnlampe, Staubmaske, Kanalstiefel-Set, Filtermembran |
| `henk-angler` | Henks Anglerbedarf | `flutmauer` | `leuchtturm` | `henk-angler` | – | M/T/A | Köder, Einfache Angel, Profi-Angel (Henk ♥3), Postkarten, Sonnencreme |

**Nicht als Händler, sondern als Dialog/Effekt** (Engine-Lücke, siehe gaps/system.md): Dr. Winkel (`eisenhof`, Fahndung −1 für 150 Cr), Oma Volts Nähservice, Stylistin Ginas Aussehen-Änderung, Suppenküchen-Spendenkasse, Gullys Kanalbrett (Auftragstafel).

**Spätere Akte (noch ohne ShopDef):** Hofladen und Elsa (`aussiedlerhof`), Rudis Diner und Konvoi (`staubstrasse`), Opa Funk (`funkturm-ruine`), Glaswerkstatt (`glasduenen`), Chrome & Co. und Glanzstück (`chrome-boulevard`). Die Gegenstände dazu existieren bereits.

## Stichwörter der Gegenstände (`giftTags`)

Für Sammelvorlieben in `NpcDef.gifts` (`'#essen'` usw.): `essen`, `suess`, `snack`, `warm`, `getraenk`, `kaffee`, `medizin`,
`waffe`, `kampf`, `sport`, `technik`, `cyberware`, `daten`, `schrott`, `werkzeug`, `mode`, `kleidung`, `kosmetik`,
`schmuck`, `luxus`, `oberstadt`, `musik`, `retro`, `medien`, `buch`, `papier`, `spiel`, `spielzeug`, `kinder`, `kunst`,
`kitsch`, `natur`, `pflanze`, `meer`, `oednis`, `kanal`, `tier`, `ekelig`, `gauner`, `ordnung`, `alltag`, `buero`,
`fanartikel`, `werbung`, `romantik`, `sammler`, `andenken`, `geruecht`, `angeln`, `rezept`, `selbstgemacht`, `kurier`, `deko`.
