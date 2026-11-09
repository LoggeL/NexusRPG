# Lücken und Absprachen: Paket pkg-quantum-campus (quantum-campus, quantum-foyer)

Dateien: `game/src/content/parts/maps-23/{quantum-campus,quantum-foyer,shops-quantum}.ts`
Bilder: `bg-quantum-campus` (+ `-party` ab Akt 3, `-werkstatt` nach side-offene-werkstatt, `-alarm` im Bruch nach
`nexus_erwacht`), `bg-quantum-foyer` (+ `-party`, `-alarm`).

ersetzt Platzhalter: keine.

## Von der Zone angelegt (bitte nicht doppelt)

- **Einlasswege main-3-einlass** (setzen nur Flags, keine `questStep`s; die Quest prüft die Flags, siehe
  quest-main-3/main-3-einlass.ts `DRIN`):
  - Campus `einlass-haupteingang` (Spot `haupteingang`, Dialog `campus-einlass-haupteingang`): Chrome-Einladung oder
    Party-Ausweis ohne Check → `einlass_haupteingang`; `gc-38` (Oberstadt automatisch) → `einlass_haupteingang`;
    `[Wache ♥8]` → `einlass_wache`; Gewalt → `einlass_kampf` + `battle enc-einlass-kontrolle`.
  - Campus `lueftung-party` (Spot `lueftungsgitter`): `gc-40` → `einlass_lueftung` + travel quantum-labor/lueftung.
  - Foyer `gaesteliste` (Dialog `foyer-gaesteliste`): `prep_gaesteliste`, `chrome-einladung`, `party-ausweis` ohne
    Check, `gc-41` → `einlass_gaesteliste`.
  - Foyer `catering` (`gc-39`) → `einlass_catering` + travel himmelsgarten/catering.
  - Die Kampf-Begegnung `enc-einlass-kontrolle` liegt am Haupteingang draußen (nicht am Empfang wie im Plan), weil
    main-3-einlass das Nachspiel des Kampfes auf quantum-campus erwartet.
- **Aussichtspunkt** `aussicht-brueckenkopf` (20 XP, markSeen), Sammelobjekte `datenwuerfel-12` (Pausenautomat,
  akt-hacken), `-13` (Altlager, nach side-alesas-zuendholz), `-14` (Wachhäuschen nachts, akt-schloss),
  `chip-fragment-01` (Drohnenrampe), `-02` (Brückenkopf).
- **Wartungsleiter**: Ausgang `wartungsleiter` öffnet mit Flag `wartungsleiter_gefunden` (setzt das Datentunnel-Paket
  per onEnter; zusätzlich Hotspot `wartungsdeckel-verkeilen`, sobald `datentunnel` besucht ist).
- **Händler** `quantum-kantine` (Kantinen-Automat, Akt 3 und Nachspiel, kauft nichts an).
- **Begegnung** `enc-campus-patrouille` am Patrouillenweg: Akt 2 nachts, nicht im Bruch, umgehbar `[Reflexe 6]`.

## Frei gelassen (Plan-Hotspot-IDs für Quest-/Figuren-Agenten)

- Campus: `kamera-west`, `kamera-ost`, `scheinwerfer` (Bruch-Overwatch; main-2-bruch nutzt eigene `m2b-*`),
  `altlager-tor` (gc-88 Löschmodus), `loeschtank` (Tank öffnen) für **side-alesas-zuendholz** – die Quest fehlt noch.
  Spots `altlager-zaun`, `altlager`, `loeschwassertank`, `patrouillenweg` und Zusatz-Spot `altlager-tor` stehen.
  Begegnungen `enc-altlager-patrouille` / `enc-altlager-zuendholz(-loeschtank)` legt die Quest an.
- Campus: `pers-nyra-silent-angel` Treffen am `brueckenkopf` (+ `enc-bruecke-patrouille`), `pers-pim-kleine-schrift`
  (`pausenraum`), `side-offene-werkstatt` (`campus-wiese`, `haupteingang`), `job-datenraub` (`pausenraum`).
- Foyer: `nexus-avatar` (ki-nexus steht per Tagesablauf am Spot; die Zone zeigt nur `nexus-avatar-blick`, wenn er
  nicht da ist), `fundbuero-schalter` (side-captain-kuschel), `funkgeraet` (main-2-bruch nutzt `m2b-sicherheitszentrale`),
  `empfang-terminal` (Bruch-Hack macht main-2-bruch selbst; `gc-87` side-teekraenzchen hat keinen Foyer-Ort im Plan).

## Ausgänge – Bedingungen (bewusst so)

- Bruch: Die Zone öffnet `seiteneingang`, `lueftungsschacht`, `foyer-tuer` und den Foyer-`laboraufzug` **nicht** für
  main-2-bruch; der Bruch reist über die Quest-Hotspots `m2b-*` (quest-main-2). So kann niemand den Ablauf überspringen.
- `foyer-tuer`: Akt 3, Nachspiel, `blades-visitenkarte` oder `xion-passierschein` im Inventar.
- `chefaufzug`: Flag **`chefaufzug_frei`** (bitte von he-blade-4 setzen und danach wieder löschen, falls die Führung
  nur einmal gilt), `nexus_rebelliert`, main-3-nexus aktiv/erledigt, `ende_master`, Nachspiel.
- `gaesteaufzug`: Akt 3 + irgendein `einlass_*`-Flag (inkl. `einlass_presse`, `won enc-einlass-kontrolle`) oder Nachspiel.
- `bruecke`: Akt 3 nach main-3-einlass oder Nachspiel.

## Engine

1. **Bedingte Sperrflächen** (`blockVariants`): Die Varianten `-party` (Champagnertische, Presse-Stative, Lichterbögen)
   und `-werkstatt` (Marktstände auf dem Platz) zeigen Requisiten, durch die man hindurchläuft. Vorschlag wie in
   pkg-stufenplatz-digitech: `blockVariants` analog `bgVariants`.
2. **Bedingte Musik**: Im Bruch wäre `schleichen`, auf der Party `releaseparty` passend; `MapDef.music` ist statisch
   (Campus: Bezirksstandard, Foyer: `oberstadt`). Vorschlag: `musicVariants: { when, music }[]`.
3. **Bedingte Lichter**: Alarmrot nach `nexus_erwacht` nur über das Hintergrundbild; `LightDef.when` fehlt.
