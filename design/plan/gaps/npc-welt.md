# Lücken: npc-welt (Weltfiguren §4.5, Vex als Weltfigur, Antagonisten als Hintergrundfiguren)

Teil: `game/src/content/parts/npc-welt/` (eine Datei je Figur, Hilfen in `_welt.ts`, ohne eigenes `part`).

## Engine / Verträge

- **Herkunfts-IDs fehlen im Inhalt.** Alle Teile (auch dieser) fragen `{ origin: 'origin-gossenkind' | 'origin-oberstadt' | 'origin-oednis' | 'origin-ex-wache' | 'origin-schrott' | 'origin-knastvogel' }` ab (world.md-IDs). `content/character.ts` kennt nur den Testinhalt `gosse`/`tueftler`. Der Inhaltstest meldet das als unbekannte Verweise, bis der System-Teil die Herkünfte anlegt.
- **Quest-Start über Geber.** `QuestDef.giver` startet nichts von allein. Die meisten Quests (Frau Takt, Hafen-Hannes, Frieda, Henk, Sina, Vincent) starten über eigene Hotspots der Quest-Teile; hier gibt es dazu nur Hinweiszeilen. DJ Lumo bietet `side-lumos-platte` zusätzlich per `startQuest` im Menü an (doppelt, schadet nicht).
- **Tageslimits.** Wett-Willi soll „50 Cr pro Tag“ zahlen (gc-151). Die Engine kennt keine Tagessperre: Der Check zahlt einmal (`once`), das Hütchen-Minispiel kostet 20 Cr Einsatz und zahlt 50 bei Sieg (wiederholbar).
- **Fahndung senken (Dr. Winkel).** Es gibt keinen Fahndungs-Effekt. Gelöst über die Flags `fahndung_1…3` (wie `combat/random.ts`, `maps/zellentrakt.ts`): Winkel löscht für 150 Cr die höchste gesetzte Stufe. Laut shops.md hat Winkel keinen Laden, aber `maps/eisenhof.ts` hat einen Shop-Hotspot `shop: 'dr-winkel'`. Darum legt `dr-winkel.ts` einen kleinen Laden `dr-winkel` an (Medipflaster, Nanogel, Staubmaske, U-Bahn-Ticket).
- **Minispiel-Fortsetzungen.** Folgeszenen nach Minispielen laufen über `{ dialogue }` in `win`/`lose` (Vex he-4, DJ Lumo he-4, Fräulein Pixel he-2, Sina he-2), nicht über `wonMinigame`-Wahlen im selben Knoten.
- **Herz-Ereignis an zwei Orten (FX-60).** Ein HeartEventDef hat nur eine Karte. FX-60 steht nach `fx60_mitgenommen` in Dantes Werkstatt, sonst im Tresor. Darum gibt es je Stufe zwei Einträge (`he-fx-60-2` / `he-fx-60-2-werkstatt`, ebenso für 4) mit demselben Dialog, die sich über `seen` gegenseitig ausschließen.
- **Antagonisten ohne Herzsystem.** Blade, Alesa, Xion, Nexus und die drei Chrome-Schwestern haben in Akt 1 `maxHearts: 1` (Hilfe `hintergrundfigur`), keine Herz-Ereignisse und nur Ein-Satz-Dialoge. Geschenkvorlieben stehen schon nach world.md drin. Der Akt-2-Teil muss `maxHearts` (10) und die Ereignisse nachrüsten.

## Karten (Spots nicht begehbar erreichbar, Inhaltstest)

Diese Spots aus meinen Tagesabläufen meldet der Erreichbarkeitstest als nicht erreichbar. Das liegt an den Karten-Teilen, nicht an diesem Teil:

- `cafe-sahnehaube/fenstertisch` (Alesa)
- `quantum-schauraum/hologramm` (Nexus)
- `digitech-areal/lieferzone` (Alesa, Mi)
- `chrome-penthouse/sofa-bijou` (Bijou)

## Bilder

- Alle Weltfiguren nutzen `portrait = <id>` und `sprite = <id>-walk`; die meisten Bilder fehlen und erscheinen als Platzhalter.
- Antagonisten nutzen die vorhandenen Schlüssel `blade`, `alesa`, `xion`, `ki-nexus` (+ `ki-nexus-angry` als `wut`), `seraphina`, `sybella`, `serenity` sowie die Laufbilder `*-walk`. Nexus hat kein Laufbild (Hologramm).
- Vex als Weltfigur: Porträt `vex`, Laufbild `vex-walk`. Die Ausdrücke `verlegen`/`zaertlich` werden nicht genutzt (gehören zum Vex×Aria-Strang).

## Vex als Weltfigur (`vex-schrapnell.ts`)

- Alles hängt an `{ not: { playerIs: 'vex' } }`; der erste Tagesablauf-Eintrag schickt sie weg, wenn man Vex spielt.
- Fähigkeiten `vex-nagelsalve`, `vex-ueber-die-kisten` und (♥6) `vex-nicht-anhalten` sind hier definiert, weil sonst kein Teil die Begleiter-Vex abdeckt. Sollte der Kampf-Teil eigene anlegen: hier entfernen.
- ♥8/♥10 hängen an `{ act: 2 }`. In Akt 1 kommt ab ♥8 der Hinweis „Diese Freundschaft braucht noch Zeit“.
- Paketkette mit Wochentagsflags: `vex_paket_gurrmann` (Mo/Do), `vex_paket_grete` (Di/Fr), `vex_paket_gerda` (Mi/Sa), `vex_paket_bruehe` (So). Empfänger sind Gurrmann, Salzige Grete, Gerda Gleis und Mutter Brühe.

## Eigene Erfindungen (bitte gegenlesen, falls andere Teile etwas Festes brauchen)

- Mira Lötzinn und Direktorin Hartlauf: Alesa Zero war früher Ingenieurin und Ausbilderin bei Digitech („A. Z.“ auf Miras Prototyp, Tafel im Labor). world.md legt das nicht fest.
- Ole Gähn schrieb 2050 den Brief an Gerda Gleis (Flags `gerda_brief_ole`, `ole_gerda_bahnsteig`).
- Hafen-Hannes: sein früherer Kumpel Piet läuft heute mit den Rostzähnen (`hannes_piet_rostzahn`), ohne Bezug zu `side-rostzaehne-ende`.
- Bruder Kabellos war Dr. Konrad Wellner aus der Nexus-Projektgruppe (`kabellos_nexus_wissen`).
- FX-60 hat die Digitech-Nacht protokolliert (`fx60_protokoll`). Das könnte eine Raven-Szene aufgreifen.
- Vinyl-Vincent: die verschwundene Sängerin Lou Lametta (keine Verbindung zu Jimmy).

## Portier Albert und Bijou

- Ihre Zone ist laut world.md `chrome-boulevard` (Akt 2). Laut Plan sind sie in Akt 1 nur nachts im Penthouse, solange `side-alte-gewohnheiten` läuft. Hier haben sie Tagesablauf, Gespräch und Geschenke; die Herz-Ereignisse 2/4 und `side-chrome-pudel` folgen mit Akt 2.
- Nicht angelegt (Zonen ab Akt 2 oder Epilog): `rudi`, `kraehe`, `elsa`, `opa-funk`, `glasblaeserin`, `krabbe-karl`, `leutnant-nadel`.
