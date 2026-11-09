# Lücken: quest-enden (Enden und Nachspiel)

## Engine

- **Cutscene-Beats ohne Bedingung.** Varianten der Enden (Romanze, Nyra fehlt, Blade entkommen) laufen deshalb über Dialogweichen (`weiter`), die danach eine feste Cutscene starten.
  - Ein `when` am Beat würde die vielen Zwischen-Dialoge sparen.
- **Kampfausgang als Effekt.** `{ battle }` hat kein `win`/`lose` wie das Minispiel.
  - sonder-konvoi-nougat setzt die Durchfahrt deshalb schon beim Kampfstart.
  - side-strandclub stellt die Begegnung `enc-strand-staubfalken` an den Pflock und wertet `won` aus. Das geht, weil die Begegnung nur dort vorkommt.
  - Für `enc-ruine-pluenderer` (aus Akt 1 schon gewonnen) gibt es deshalb keinen Kampfweg beim Material.
- **Gratis-Cyberware.** Für `cyberware_oberstadt_gratis` (side-offene-werkstatt) braucht der Ripdoc-Händler in der Oberstadt eine Preisregel, etwa `ShopDef.priceWhen`. Bis dahin ist es nur ein Flag.

## Fremde Pakete (Bitte)

- **Crew-Quests im Master-Modus sperren** (world.md §5.5). Die pers-/side-Quests der Crew und ihre Tagesgespräche brauchen `notFlag: 'master_modus'` (Starts, autoStart, Gesprächs-`when`). Das liegt in npc-crew-a/b, quest-pers-jobs und quest-side-*.
- **Tagesabläufe der Crew im Master-Modus** auf `weg` setzen (design/plan/ending.md).
- **Abspann-Hotspot** auf das-meer an `meer_offen` hängen (ending.md).
- **datentunnel.** Die Begegnung `splitter-nest` (enc-datentunnel-splitter) bleibt bis zum Sieg. Mein Dialog „Der letzte Monitor“ (`nachspiel-letzter-splitter`) erscheint erst nach dem Sieg.
  - Wer die Splitter friedlich lösen will, bräuchte an der Begegnung `when: { notFlag: 'splitter_beruhigt' }`.
- **Unterstadt-Händler im Master-Modus.** Die Händler sind nur über den Ruf (−60) feindselig. Wer echte Sperren will, setzt `open: notFlag master_modus`.

## ersetzt Platzhalter

- keine
