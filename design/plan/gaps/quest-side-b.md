# Lücken: Akt-1-Nebenquests Nr. 12–22 (quest-side-b)

Dateien: `game/src/content/parts/quest-side-b/*.ts` (ein Teil pro Quest, Hilfen in `_lib.ts`).

## Fehlende Figuren (NpcDef, von Figuren-/Integrationsagent anzulegen)
Diese Sprecher-IDs sind laut Inhaltscheck noch unbekannt: `falke`, `frau-klingel`, `hafen-hannes`, `henk-angler`,
`meister-watt`, `turbo-tilda`, `xion-venom` („unbekannter Verweis npcs“). Die übrigen Sprecher (`richter`,
`barkeeper`, `gully`, `mixi`, `opa-blech`, `opa-gustav`, `nyra`, …) sind schon aufgelöst.

## Engine-Lücken
- **Fristen über Tage:** Es gibt keinen „Tag beim Questbeginn“-Zähler. `side-zweite-hand` (ein Tag) läuft über
  Lieferzeit 06–21 Uhr plus Telefonnachricht `zh-dante-spaet` um 21:00. `side-thai-chi` („drei Morgen“) hat drei
  Stunden ohne echte Morgen-Folge (jede Stunde nur morgens, gleiche Tage sind möglich).
- **Tai-Chi-Minispiel:** Gibt es nicht. Die Stunden laufen über `akt-tanz` Stufe 1 (Schlüssel `tc-stunde-1..3`).
- **Rekrutieren per Effekt:** Bolzen (Hund, `side-hunde-der-brackbucht`) wird nicht rekrutiert, nur Flag
  `bolzen_haustier`. Crew-Quartier (`BOLZEN_DA`) sollte das Flag abfragen. `bolzen_verletzt` gibt es nach dem Kampfweg.
- **Dauerwirkungen nur als Flag:** `richter_fahndung_halb` (Fahndung halbiert), `oma_volt_rabatt` (15 % bei Oma Volt),
  `hunter_innere_mitte` / `hunter_keine_diva` (Hunter), `vega_kobra_reichweite` (Kobra-Schuss +1 Reichweite),
  `hv_eintritt_frei` (Abzieher-Türsteherweg). Kampf, Shops und Fahndung müssen die Flags auswerten.
- **Konfrontation Xion** (`side-digitech-geist`): nur Beziehung −200 und Telefon `dg-xion-antwort`, keine Folgequest.
- **Rennen gegen Tilda** (`side-drohnenrennen`): Drei Läufe sind drei Minispielaufrufe hintereinander
  (`dr-lauf-1..3`). Turbo/Nyras Chip senken die Stufe von 3 auf 2. Das freie Wochenrennen bleibt der Zonen-Hotspot
  `drohnenrennen`. Am Freitagabend liegt der Quest-Hotspot `dr-rennen` auf demselben Punkt.

## Mögliche Doppelungen mit dem Gegenstands-Agenten
Selbst definierte Gegenstände: `dantes-playlist`, `leuchtalge`, `kanalminze`, `kanal-sirup`, `oberstadt-eis`,
`rezeptkarte-neon-limo`, `fake-implantat`, `greifarm-hannes`, `hoerimplantat-klingel`, `leuchtfinger`,
`augenimplantat-lio`, `renndrohne-rahmen`, `renndrohne-motor`, `renndrohne-turbomotor`, `renndrohne-steuerchip`,
`renndrohne`, `vegas-fernrohr-geklaut`. Belohnungen aus der Gegenstandsliste (`kronkorkenkrone`,
`arme-zerberster-attrappe`, `opa-blech-fernbedienung`, `schallplatte-04`, `rostlaube-zuendkerze`) werden nur
referenziert.
Das Andenken `vegas-zielfernrohr` (♥10) wird bei Adlerauge **nicht** vergeben. Die Quest nutzt das Questitem
`vegas-fernrohr-geklaut`.

## Vex × Aria (nur mit Flags aus parts/vexaria)
Zusatzszenen hinter `VEXARIA` (Vex, Romanze Aria, `aria_romanze_angebahnt`/`_zusammen`): Neon-Limo-Test (Aria),
Oma Volts Nachschlag (`ov-aria-nachschlag`), Kuss in der Krankabine (`tc-aria`), Dachszene `va-aria-dach` bei der
Fernrohr-Rückgabe und Tischszene `va-tisch-vexaria` (nur `aria_romanze_zusammen`). Ohne Romanze gibt es Varianten mit
`VEX_OHNE_ROM`. Die Nacht wird nur angedeutet und endet in einer Abblende.
