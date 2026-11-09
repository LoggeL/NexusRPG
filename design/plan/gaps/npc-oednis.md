# Lücken: npc-oednis (Figuren Ödnis, Kanalisation, Küste, Akt 2/3/Nachspiel)

Teil: `game/src/content/parts/npc-oednis/`. Die Hilfen in `_oednis.ts` sind eine Kopie von `npc-welt/_welt.ts`, damit der Ordner eigenständig bleibt.

## Ersetzt Platzhalter

- `npcs.opa-funk` in `world/nachrichten.ts`: Das ist ein Stub ohne Tagesablauf (Sprecher für Radio Rost). Er überschreibt im Moment `npc-oednis/opa-funk` (world sortiert später). **Bitte den Stub entfernen.** Die Nachrichten verweisen nur auf die ID, die bleibt gleich.

## Neue Figuren (NpcDef + Tagesgespräche + Herz-Ereignisse)

| Figur | Datei | Tagesablauf (act23.json) | Herz 2 / 4 | Hänger zu Quests (Questdialoge baut das Quest-Paket) |
| --- | --- | --- | --- | --- |
| `rudi` | rudi.ts | M/A Tresen, T Küche | he-rudi-2 (M, Absturz), he-rudi-4 (T, Rezept; Koch-Minispiel) | Laden `rudis-diner`, gibt `rezeptzettel-rudi`, wenn `pers-jakko-kochbuch` läuft (Menü und he-4), Varianten zu `side-oednis-frieden` |
| `kraehe` | kraehe.ts | T Hof, A Tor, N Hof, Sa A Strand (Teilhaberin) | he-kraehe-2 (T, Geschichte), he-kraehe-4 (A, nach `side-kraehes-ehre`, Ehrenfeder) | Hinweise auf Duell/Rennen/Geschichte, tägliches Geschichtenerzählen (Ruf `staubfalken`), Armdrücken |
| `elsa` | elsa.ts | M/T Werkstatt, A Lagerfeuer | he-elsa-2 (M, Ziegenroboter), he-elsa-4 (A, nach `pers-gustav-alte-liebe`) | Varianten für `pers-gustav-alte-liebe` (aktiv/fertig) und `pers-alesa-wasserfilter`, tägliche Werkbank (`akt-werkbank`) |
| `opa-funk` | opa-funk.ts | N Bunker, sonst Pult | he-opa-funk-2 (A, Wetterbericht, `akt-radio-rost`), he-opa-funk-4 (T, nach `side-verlorene-frequenz`) | Laden `radio-rost`, Grüße in die Sendung nach der Quest |
| `glasblaeserin` | glasblaeserin.ts | T/A Werkstatt | he-glasblaeserin-2 (T, Kugel, `glasperlen`), he-glasblaeserin-4 (A, nach `side-glasherz`) | Laden `glaswerkstatt`, Spur zu Brösel bei aktiver `side-glasherz` |
| `staubbaron-broesel` | staubbaron-broesel.ts | T Wasserstand, bei `side-glasherz` (Ei nicht zurück) T im Versteck | keine (Gegenspieler, `maxHearts 1`) | teures Wasser (Kauf, `[Straße 5]`, `[Körper 6]`), Ei-Hinweis setzt `broesel_ei_verraten` |
| `krabbe-karl` | krabbe-karl.ts | A Karls Stein, sonst Spot `krabbe-karl` | he-krabbe-karl-2 (A, epilog), he-krabbe-karl-4 (M, epilog) | eine Muschel pro Tag (`heute_karl_muschel`), Strandputzen |
| `schlafwandler-ede`, `schlafwandlerin-rosi`, `schlafwandler-bert` | schlafwandler.ts | N an ihren Spots, solange `pers-delya-quelle` läuft; gerettet M/T `dantes-werkstatt:sofa` | – | siehe unten |
| `staubfalke-bolle`, `aussiedlerin-juna`, `konvoi-doro`, `rohrwartin-muffe`, `technikerin-kalibri`, `funzel` | statisten.ts | Tor der Wrackburg · Beete · Konvoi-Halt Mo/Do · Pumpwerk-Sperre · Quantum-Außenstelle · Container-Labyrinth | – | siehe unten |

Die Namen Bolle, Juna, Diesel-Doro, Muffe und Kalibri sind eigene Erfindungen, world.md nennt dafür keine.

## Folgen vorhandener Figuren (folgen.ts, nur mapAdditions)

Ich ändere keine fremden Dateien. Stattdessen setze ich feste Platzierungen mit `when`. Eine aktive Platzierung geht dem Tagesablauf vor, die Figur steht also nie doppelt.

- **Hafen-Hannes** `hafenkante:kai-mitte` (M/T/A, schon getroffen, kein Rivale): `hannes-akt2` (Funzel, Schutzgeld, Piet), `hannes-hafen-frei` (nach `side-rostzaehne-ende`), `hannes-epilog`. „Was anderes.“ springt per `{ dialogue }` in `hannes-tag-standard`.
- **Fluss-Frieda** `kanal-sammler:friedas-stand`: `frieda-akt2` (Chip-Ausschuss, Weg ins Pumpwerk, Hinweis auf Schlafwandler bei `pers-delya-quelle`), `frieda-epilog`. Weiter in `frieda-tag-standard`.
- **Ole Gähn** `digitech-areal:pfoertnerhaus-bank` in act2 (nicht epilog, nicht nach `gerda_brief_ole`): `ole-akt2` (Kabelschacht, Wachkoloss). Weiter in `ole-tag-standard`.
- **Direktorin Hartlauf**: T am `archiv`, solange `side-hartlaufs-rache` läuft.
- **Marla Sand**: Ab act2 steht sie in der Ödnis (N staubstrasse:lagerfeuer, T Mo/Do konvoi-halt, M brunnen, T wohnwagen, A lagerfeuer-hof). Samstag bleibt sie bei ihrem eigenen Tagesablauf (Schrottmarkt/HV). Ohne diese Platzierungen wäre sie in Akt 2 außer samstags „away“.
- **Opa Gustav**: So A an der `aussiedlerhof:gustav-bank` nach `pers-gustav-alte-liebe`, Sa T `quantum-campus:campus-wiese` nach `side-offene-werkstatt`.
- **Lio Funkel**: A am `funkturm-ruine:radio-rost-pult` während `side-verlorene-frequenz` mit `frequenz_relais`, Fr N `das-meer:strandclub-buehne` (epilog, Strandclub fertig).
- **Käpt'n Nebelhorn**: So T `das-meer:steg` (epilog, nach he-kaeptn-nebelhorn-10).
- **Turbo-Tilda**: Mi/Sa N `rennhalle-9:boxengasse` mit `rennhalle-9-geoeffnet`.

**Für die Integration:** Setzt jemand die act23-Tagesabläufe direkt in die Dateien dieser Figuren (scheduleMode „ersetzt/vorangestellt“), dann die passenden `oednis-*`-Platzierungen in `folgen.ts` löschen. Doppelt schadet nicht, ist aber unnötig.

## Offene Punkte und Annahmen

- **Marlas Herz-Ereignisse 4–10** liegen noch auf `schrottmarkt` (Sa) in `npc-unterstadt/marla-sand.ts`. act23.json will sie auf `aussiedlerhof`/`staubstrasse` umhängen. Das geht nur in deren Datei, denn `HeartEventDef.map` ist fest und die Liste nicht erweiterbar. Spielbar sind sie trotzdem: samstags in der Stadt.
- **Schlafwandler und pers-delya-quelle:** Damit die Quest auf jeden Fall spielbar ist, bieten die Gespräche selbst einen Rettungsweg: `[Technik 5]` Ruhemodus, persönliche Erinnerung (ohne Check) oder an der Hand führen (60 Minuten). Er setzt `schlafwandler_*_gerettet` und reist zu Dante. Den Abschluss bei Delya baut das Quest-Paket. Legt es eigene Rettungsszenen per Platzierung an, gewinnen diese.
- **Brösel verschwindet** mit den Flags `kg_staubbaron_broesel_gestellt` / `kg_staubbaron_broesel_erledigt`. Das setzt voraus, dass das Kopfgeld nach `quest-pers-jobs/_kopfgeld.ts` mit dem Schlüssel `staubbaron-broesel` gebaut wird. Heißt der Schlüssel anders, die Bedingung `GESTELLT` in `staubbaron-broesel.ts` anpassen.
- **Überlaufrohr:** Rohrwartin Muffe öffnet das Handrad (`ueberlaufrohr_offen`), aber erst nach `main-2-kanal`, damit die Flucht in der Hauptquest nicht vorweggenommen wird. Wege: `[Ruf Kanalvolk 20]`, `[Straße 5]` oder 50 Cr. act23 nennt „Kanalvolk hilft nach prep_fluchtweg“, aber ein solches Flag oder eine solche Quest gibt es im Plan nicht. Falls es kommt, die Bedingung `KANAL_FERTIG` in `statisten.ts` erweitern.
- **Funzel** ist als Figur angelegt. Bis `side-rostzaehne-ende` läuft, steht er abends im Container-Labyrinth. Ab Queststart ist er „away“, damit das Quest-Paket ihn im Lager als Boss aufstellen kann. Legt das Quest-Paket selbst eine NpcDef `funzel` an, bitte meine entfernen oder deren Platzierungen verwenden.
- **Nicht angelegt:** `leutnant-nadel` (Quantum-Campus) gehört vermutlich zu npc-quantum und fehlt dort noch. `hecki` ist in `maps-23/himmelsgarten.ts` nur ein Talk-Hotspot. act23.json plant ihn aber als Figur („neu“, Laden `himmelsgarten-blumen` mit `owner: hecki`). Späte Begleiter Alesa und Xion: npc-quantum.

## Engine-Vorschlag

- **`ContentPart.npcAdditions[npc] = { talkPrepend?, schedulePrepend?, heartEvents? }`.** Damit könnten Akt-2-Teile Gespräche, Tagesabläufe und umgehängte Herz-Ereignisse vorhandener Figuren ergänzen, ohne fremde Dateien und ohne Platzierungen mit Dialog-Ersatz. Heute ersetzt eine Platzierung mit `dialogue` das ganze Tagesgespräch. Darum endet jedes `folgen.ts`-Gespräch mit einer Weiterleitung `{ dialogue: '<alt>' }`.
- **Herz-Ereignis mit Spot:** `HeartEventDef` kennt nur die Karte. Krähes ♥4 spielt erzählt am Lagerfeuer, löst aber beim Betreten der ganzen Staubstraße am Abend aus.

## Bilder

- Vorhanden: Porträts und Laufblätter für rudi, kraehe, elsa, opa-funk, glasblaeserin, krabbe-karl.
- Fehlen (Platzhalter): `portrait-staubbaron-broesel`, `portrait-schlafwandler-ede`, `portrait-schlafwandlerin-rosi`, `portrait-schlafwandler-bert`, `portrait-staubfalke-bolle`, `portrait-aussiedlerin-juna`, `portrait-konvoi-doro`, `portrait-rohrwartin-muffe`, `portrait-technikerin-kalibri`, `portrait-funzel`. Die Laufblätter sind generische `passant-*-walk` bzw. `rostzahn-schlaeger-walk`.

## Eigene Erfindungen (gegenlesen)

- Rudi: Linienflug 404, Notlandung 2061, Ausbilderin Kapitänin Ingrid, Tasse „zweitbester Pilot“ (passt zu maps-23/rudis-diner.ts).
- Krähe: früher Zustellerin in der Oberstadt und nach einem explodierten Quantum-Paket eingesperrt. Notizbuch mit 312 Geschichten, Flags `kraehe_buch`, `kraehe_ehrenfeder`.
- Elsa: lernte Gustav 2032 kennen (Kran hob einen Kleinwagen über ihren Stand) und ging mit dem letzten Konvoi raus. Ziegenroboter „Mecker“.
- Opa Funk: Radio Rost seit 2049, seine Frau war die Stimme und ist seit 15 Jahren tot. Lieblingsplatte „Funkstille“ von den Kupferkehlen.
- Glasbläserin: hat früher das Glas der Oberstadt gemacht (Himmelsgarten-Kuppel) und den Prototyp der einseitigen „Sicherheitsverglasung“ gebaut. Die Glasdünen sind von einer Sonnenspiegel-Testanlage 2058.
- Krabbe Karl: Modell K-4RL der „Sauberstrand GmbH“, im Dienst seit 2058, ohne Auftraggeber seit 2062.
- Neue Flags: `rudi_absturz_erzaehlt`, `rudi_rezept`, `kraehe_buch`, `kraehe_ehrenfeder`, `kraehe_wasser_fuer_hof`, `elsa_mecker_repariert`, `elsa_erzaehlt_gustav`, `elsa_kennt_gustav_frage`, `funk_wetter_gelesen`, `funk_lieblingsplatte`, `glas_kugel_geblasen`, `glas_geschichte`, `karl_erste_muschel`, `karl_ehrenkrabbe`, `broesel_ei_verraten`, `funzel_blamiert`, `kalibri_testgruppe_nacht`, `hannes_hafen_frei_gesehen`, dazu Tagesflags `heute_*`.
