# Paket quest-side-23-a: Akt-2-Nebenquests §6.3 Nr. 32–39 (parts/quest-side-23-a)

Dateien (je Quest eine, `_lib.ts` nur Helfer):
`side-teekraenzchen.ts`, `side-alesas-zuendholz.ts`, `side-ki-fluestern.ts`, `side-weg-zum-meer.ts`,
`side-captain-kuschel.ts`, `side-xions-kralle.ts`, `pers-nyra-silent-angel.ts`.

## ersetzt Platzhalter

- `side-ki-fluestern` (vorher `later(…)` in `parts/integration/luecken.ts`, Zeile 78)
- `side-captain-kuschel` (vorher `later(…)` in `parts/integration/luecken.ts`, Zeile 79)

Beide Einträge bitte aus `luecken.ts` streichen. Bis dahin meldet `content.test.ts` „überschreibt integration/luecken“
(PART_WARNINGS). Das ist Absicht, kein Fehler im Paket.

## Nicht gebaut

- **`pers-aria-zerberster` (Nr. 39):** liegt komplett in `parts/vexaria/zerberster.ts` (Quest, `he-aria-8`, Station
  `rom-aria-ausfall`, Hotspots, Telefon `ripper-container-77`). Eine zweite Fassung hier hätte sie nur überschrieben.
  Offen dort: Den Plan-Wert `aria_weg` (Alleingang, §4.7) setzt soweit sichtbar niemand, obwohl `das-meer` und
  `side-xions-kralle` (Training bei Aria) ihn abfragen.

## Flags für andere Pakete

| Flag | gesetzt von | Bedeutung / für |
| --- | --- | --- |
| `schwestern_gewarnt`, `schwestern_ohne_chip` | side-teekraenzchen | Chrome-Schwestern gewarnt bzw. ohne Chip (gc-87) → main-3, Enden |
| `alesa_zweifel` | side-alesas-zuendholz (gc-89) | Alesa zweifelt an Blade → main-3, pers-alesa-* |
| `meinung_plus_ki_fluestern` | side-ki-fluestern (Belohnung) | steht schon in `quest-main-3/_lib.ts` |
| `oma_volt_rabatt_5` | side-ki-fluestern (Belohnung) | 5 % bei Oma Volt, siehe Lücken |
| `ki_fluestern_<paul/klingel/gerda/kabellos/perle>_frei` | side-ki-fluestern | Person ist den Beta-Chip los (für Akt-2-Talk-Varianten) |
| `kuschel_bei_mila` | side-captain-kuschel (Start an, Ende aus) | Captain Kuschel ist bei Mila |
| `kuschel_sorgerecht`, `kuschel_zwei`, `kuschel_zurueck`, `mila_freundin_kinder` | side-captain-kuschel | Sonntags bei Mila / Mila hat „Captain Kuschel II“ / Hase zurück / Mila gehört zur Kinderbande |
| `kuschel_war_bei_nyra`; **`nyra_hat_kuschel` wird gelöscht** | side-captain-kuschel (Start) | Danach steckt der Hase als Gegenstand `captain-kuschel` in der Tasche; `main-3-labor` prüft `any(nyra_hat_kuschel, item captain-kuschel)` und bleibt erfüllt |
| `xion_fehlt` | side-xions-kralle (Dienstplan vor Publikum) | steht schon in Xions Tagesablauf (Partynacht) |
| `xk_respekt`, `xk_dienstplan`, `xk_sieg`, `xk_entdeckt` | side-xions-kralle | Ausgang des Duells |
| `peilsender_entdeckt`, `peilsender_gewarnt`, `peilsender_ausgenutzt` | pers-nyra-silent-angel (gc-37) | `main-3-labor` wertet aus |
| `nyra_team_0…3` | pers-nyra-silent-angel | +1 je Einheit (gc-98, Foto, Muschel, Treffen), höchstens 3 |
| `nyra_halb_frei`, `nyra_sabotiert_chips`, `nyra_meer_foto`, `nyra_muschel_versprochen` | pers-nyra-silent-angel | Nyra hat sich halb selbst befreit / sabotiert Chips / Foto bekommen / Muschel versprochen |
| `wagenweg_meer_bekannt` | side-weg-zum-meer (Belohnung) | Wagenweg zum Meer (Enden, das-meer) |
| `meer_karte_komplett`, `meer_masten_durch`, `meer_zoll_bezahlt` | side-weg-zum-meer | Zwischenstände |

## Lücken / für die Integration

- **Platzhalter-Talks der Chipträger:** Paul, Frau Klingel, Gerda Gleis, Bruder Kabellos und Barista Perle
  (`parts/npc-welt`) haben noch keine Akt-2-Variante „gechippt“. Die Quest legt eigene Talk-Hotspots
  `ki-<name>` an ihre Spots. Schöner wäre: `talk` mit `when: { all: [AKT2, { notFlag: 'ki_fluestern_<key>_frei' }] }`
  in den Figurendateien.
- **Oma-Volt-Rabatt:** `oma_volt_rabatt_5` wird gesetzt. `ShopDef` hat kein Rabattfeld (`discounts`). Die Engine bzw.
  das Shop-Paket muss das Flag auswerten.
- **Captain Kuschel, Tagesablauf:** `npc-crew-b/captain-kuschel.ts` stellt ihn standardmäßig ans `kuschel-regal` und
  Mo/Mi ins Nest. Während `kuschel_bei_mila` sollte er `away` sein (oder T bei Mila an `schrottmarkt:mila-ecke`),
  danach mit `kuschel_sorgerecht` sonntags tagsüber bei Mila. Milas Donnerstagstermin bei Dante (`npc-quantum/mila.ts`)
  hängt schon an `side-captain-kuschel` erledigt.
- **Kuschel-Hotspot `pj-ok-kuschel-*` / `kuschel-zettel`:** fremde Hotspots, die den Hasen am Regal oder bei Nyra
  voraussetzen. Bitte prüfen, ob sie während `kuschel_bei_mila` ausgeblendet werden sollen.
- **Marla Sand:** Tagesablauf Akt 2 ist noch „Sa Schrottmarkt, sonst away“. Die Quest legt Hotspots am Wohnwagen
  (aussiedlerhof, M/T) und am Karawanenstand (Sa M/T) an. `he-marla-sand-4` (gibt ein Küstenkarten-Fragment) liegt
  noch auf dem Schrottmarkt, siehe `maps-23-oednis-hof.md`.
- **Teekränzchen-Frist:** läuft über drei `daily`-Regeln (`tee-frist-1…3`, ab `main-2-countdown`). Nach drei
  Morgen ohne Start scheitert die Quest (`fail: tee_vorab_vorbei`).
- **Telefon-Antworten können keine Checks.** Nyras dritte Nachricht öffnet beim Lesen den Dialog `nsa-antwort`
  (Effekt `dialogue`). Zur Sicherheit gibt es denselben Dialog als Hotspot `nsa-antworten` am Fenster im
  Crew-Quartier. Falls die Darstellung `dialogue` aus `readPhone` nicht ausführt, bleibt der Hotspot als Weg.
- **Liftboy (Teekränzchen):** Hotspot `tee-liftboy` am Panoramaaufzug der Glasarkaden. Ohne Ausweis/Ruf. Albert am
  Chrome-Boulevard lässt mit aktiver Quest oder `teekraenzchen_keks_lieferung` durch (`maps-23/chrome-boulevard.ts`).
- **Bilder:** keine Tafeln erzeugt. Die Quests kommen ohne Cutscenes aus (nur Dialoge).
- **Herkunft/Vex:** Vex-Varianten gibt es beim Aria-Training und beim Dienstplan (Kabelbrand-Nacht) in
  side-xions-kralle, beim Treffen mit Alesa und als Telefonnachricht in ki-fluestern und silent-angel.
