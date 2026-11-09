# Lücken – Minispiel-Darstellung (Teil 1)

- **Takt-Audio für `akt-tanz`/`akt-karaoke`:** AudioPort hat nur kurze SFX und Lyria-Musik ohne Taktinfo. Die Rhythmusspiele
  zeigen den Takt bisher nur optisch (Puls, Balken). Vorschlag: `AudioPort.beat(bpm, startAt)` oder Musikstücke mit BPM im
  Musikmanifest, damit Spiel und Musik synchron laufen.
- **Zusatzeffekte aus Spielen** (Trinkgeld, verbrauchter Dietrich-Chip) wendet `Director.minigame` per `campaign.apply` vor
  `finishMinigame` an. Sauberer wäre `finishMinigame(request, won, extra?)` in der Domäne.
- **Gegnernamen** in `akt-eins` (Kralle, Lucky Lu) und `akt-armdruecken` (je Stufe) sind fest; ein optionales Feld
  `opponents`/`npc` im Minispiel-Effekt würde echte Figuren (z. B. Dante, Aria) an den Tisch setzen.

# Lücken – Minispiel-Darstellung (Teil 2)

- **Fisch ohne ID:** world.md §3.9 nennt „Fisch für Garküchen“ als Angel-Lohn, aber keine Gegenstands-ID. `akt-angeln` gibt nur
  Schrott-Fänge als Zusatzeffekt (`rostige-dose`, `treibholz`, mit `magnetangel` `glitzerschrott`); echte Fische zählen nur für den Sieg.
  Vorschlag: Gegenstand `fisch-frisch` (Verbrauch/Zutat, Garküchen kaufen ihn) – dann gibt das Spiel je Fang `{ give: 'fisch-frisch' }`.
- **Ort/Tageszeit im Minispiel:** `MinigameContext` kennt weder Karte noch Spot. `akt-angeln` erkennt Nacht über `has({ time: 'nacht' })`
  (Leuchtalgen), unterscheidet aber Hafen/Küste/Kanal nicht (`muschel-frisch` nur an der Küste). Vorschlag: `ctx.map` oder ein optionales
  Feld `variant` im Minispiel-Effekt (z. B. `variant: 'kueste'`).
- **`akt-dachrennen` ist neu** (world.md nennt beim Romanze-Strang `rom-vexaria-luecke` nur „Dachsprung-Minispiel mit Aria als Gegnerin“
  und „Dachrennen mit Aria Fr/Sa N wiederholbar“ ohne ID). Der Inhalt für die Station und die Wiederholung (+20 XP, Aria ♥ +10 über `win`)
  muss die ID noch aufrufen; Vorschlag Stufe 2 in der Station, 3 bei Wiederholungen. Die Station selbst entscheidet den Ausgang laut
  world.md über `[Reflexe 6]` – das Minispiel kann davor laufen oder die Wiederholung sein.
- **Taubenpost 1× pro Tag:** Es gibt keinen Tageszähler pro Aktivität. Das Spiel setzt `taubenpost-an-<id>` und gibt `relation +10`
  als Zusatzeffekt; die Tagessperre muss der Inhalt bauen (z. B. Flag + `dayAtLeast`). Sauberer: Bedingung `{ notToday: 'akt-taubenpost' }`.
- **Sybella-Bonus beim Flohmarkt** prüft `{ flag: 'he-sybella-chrome-8' }` oder `{ seen: 'he-sybella-chrome-8' }`, weil die Herz-Ereignis-
  Kennung nicht festgelegt ist.
- **Umsätze/Funde als Zusatzeffekte:** `akt-flohmarkt` (`credits` = Umsatz, immer), `akt-angeln` (Schrott), `akt-floss` (Treibgut, außer bei
  zerlegtem Floß), `akt-taubenpost` (Herzpunkte). Gleiche Lösung wie Teil 1 (`Director.minigame` wendet `extra` einzeln an).
