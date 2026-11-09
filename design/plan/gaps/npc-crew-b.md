# Lücken – npc-crew-b (Vega, Nyra, Captain Kuschel, Jimmy)

## Engine / Vertrag

1. **Zähler „mindestens N verschiedene Sammelobjekte“ fehlt.** Gebraucht für Jimmy („ab 4 Spuren erscheint er“, `[Gosse]` zählt doppelt).
   Behelf: `mindestens(items, k)` in `parts/npc-crew-b/_helfer.ts` baut ein `any` aus allen k-Kombinationen (70 Einträge bei 4 aus 8).
   Zusätzlich gilt das Flag `jimmy_spuren_genug` (falls der Quest-Agent zählt) oder `jimmy_status_gefunden`.
   Vorschlag: Bedingung `{ itemsOf: 'jimmy-spur-', min: 4 }` (Präfix-Zähler) oder `{ collected: 'jimmy-spur', min: 4 }`.
2. **Begleiter-Fähigkeiten nach Variante.** Jimmy: Neustart → `jimmy-firewall-kuss`, Patch → `jimmy-chipfieber`. `CompanionDef` kennt keine
   bedingten Fähigkeiten. Behelf: Grundausstattung Neustart. Ebenso Vega: nach `pers-vega-adlerauge` sollte `vega-kobra-schuss-plus`
   statt `vega-kobra-schuss` gelten. Vorschlag: `CompanionDef.abilityVariants?: { when: Condition; replace: AbilityId; with: AbilityId }[]`.
3. **Nyra „eingeschränkt“ in Akt 1** (nur Hack-Aufträge/Hack-Nebenquests). Engine kennt keine Einsatzbeschränkung. Behelf: rekrutierbar ab
   `main-1-probezeit`, Nyra sagt im Dialog „nur Hack-Sachen“. Vorschlag: `CompanionDef.restrict?: { when: Condition; onlyTags: string[] }`.
4. **Tagesablauf „neben einer anderen Figur“.** Captain Kuschel steht mit `nyra_hat_kuschel` neben Nyra; umgesetzt als gespiegelte Einträge
   mit Kartenpunkten ein paar Pixel neben Nyras Spots. Wenn Zonen-Agenten die Spots verschieben, bitte die Punkte in
   `captain-kuschel.ts` nachziehen. Vorschlag: `SchedulePlace.follow?: NpcId` mit Versatz.
5. **Bedingte Erzählung nach Zustand innerhalb eines Knotens** (z. B. Dante oder Nyra übersetzt Kuschel): gelöst über „(Weiter.)“-Wahlen mit
   sich ausschließendem `when`. Ein `next`-Verzweiger (`branches: [{ when, next }]`) wäre sauberer.

## Inhalt / Querverweise (für Integration und andere Agenten)

- **Flags, die ich lese und andere setzen sollten:** `jimmy_gerettet` und `jimmy_status_neustart` | `jimmy_status_patch` (Quest-Agent,
  `side-jimmys-chip`, Konvention `<flag>_<wert>`); `jimmy_spuren_genug` optional. Ich setze `jimmy_status_gefunden` beim Erstkontakt.
- **Quests, die ich per `startQuest` anstoße** (Definition beim Quest-Agenten): `side-jimmys-chip` (Vega, nach `main-1-probezeit`, oder beim
  Erstkontakt mit Jimmy), `pers-vega-adlerauge` (Vega ♥3), `pers-kuschel-ohrenflick` (Kuschel ♥1).
- **Neue Check-IDs (eingebettet, kein gc-):** `he-vega-2-wind`, `he-vega-2-windmesser`, `he-vega-4-strasse`, `he-vega-4-ausstrahlung`,
  `he-vega-6-vermitteln` (`[Ausstrahlung 5]` laut world.md), `he-vega-6-schlaeger`, `he-vega-8-*`, `he-nyra-2-*`, `he-nyra-4-fernrohr`,
  `he-nyra-6-frei`, `he-nyra-8-beistand`, `he-kuschel-4-teekraenzchen` (`[Ausstrahlung 3]`), `he-kuschel-6-bolzen`, `he-kuschel-8-*`,
  `jimmy-chip-blick`, `jimmy-turm-fangen`, `he-jimmy-2-dexter`, `he-jimmy-4-moonwalk`, `he-jimmy-6-flyer`, `he-jimmy-6-scan`, `he-jimmy-8-hunter`.
- **Talisman „Große Ohren“** (he-captain-kuschel-10): jetzt als Gegenstand `talisman-grosse-ohren` in `parts/npc-crew-b/begleiter-23.ts`
  (Geschenk, unverkäuflich, `checkBonus` ausstrahlung/trost +1, beobachten/verstecke +1). Falls der Gegenstands-Agent ihn zentral führt: dort übernehmen, bei mir löschen.
- **Bilder fehlen (Platzhalter):** Laufblatt `captain-kuschel-walk` (Kuschel sitzt eigentlich nur – ein Sitz-/Prop-Blatt aus
  `prop-captain-kuschel` würde reichen), Plates `cut-he-vega-6`, `cut-he-nyra-4`, `cut-he-jimmy-6`. Fotos `photo-jimmy-besorgt`,
  `photo-jimmy-wut`, `photo-jimmy-ueberrascht`, `photo-captain-kuschel-ueberrascht` werden genutzt, fallen sonst aufs Porträt zurück.
- **Kanon-Abweichung bei anderen Teilen (nicht von mir geändert):** `maps/dantes-werkstatt.ts` beschreibt Kuschels Kissen „in Form eines kleinen
  Roboters“ (world.md: Plüschhase), `maps/crew-quartier.ts` lässt `captain-kuschel` sprechen (world.md: spricht nie, nur Ohren/Zettel).
- **romance.ts:** `ROMANCE_CANDIDATES` enthält `vega` und `nyra`, world.md §4.2/§4.7 sagt „Romanze: nein“. Meine Figuren haben keine
  Flirtzeilen und kein `romanceable`.
- **re-…-Ereignisse:** `re-vega-5` (hafenkante), `re-nyra-5` (netzcafe), `re-captain-kuschel-5` (Werkstatt) angelegt; −2/−8 nicht.

## Akt 2/3 und Nachspiel (Nachtrag)

### Engine / Vertrag

6. **Begleiterwerte skalieren nicht.** `combat/campaign.ts` nimmt feste Werte, das Level fließt nicht ein. Behelf: Fortschritt über
   `abilityRules` (Ersatz durch `-plus`-Fähigkeiten in `begleiter-23.ts`: `nyra-zentrator-umkehr-plus` bei `nyra_befreit`/Nyra voll,
   `jimmy-ersatzmann-plus` bei `hunter_entschuldigt_jimmy`, Duo `duo-die-wachhunde-plus` bei `vega_wachhunde_verstaerkt`).
   Vorschlag: `CompanionDef.statsRules?: { when: Condition; hp?; armor?; attributes?; weapon? }[]` (letzter Treffer gewinnt).
7. **„Herzen eingefroren“ fehlt.** Nyra im Turm (`nyra_zurueckgelassen` ohne `nyra_befreit`) sollte keine Herzen gewinnen können. Behelf:
   alle Herz-Ereignisse, Telefon-Autos und `re-nyra-5` sind über `NYRA_DA` gesperrt; Geschenke an Nyra gehen trotzdem durch, wenn man
   sie im Labor anspricht. Vorschlag: `NpcDef.heartsFrozen?: Condition`.
8. **Gefolgt-Platzierung, zweiter Fall:** Captain Kuschel im Nachspiel am Meer steht auf dem Rohpunkt `[470,712]` neben
   `nyra-muschelplatz` `[420,700]`. Bei verschobenem Spot bitte nachziehen (siehe Punkt 4, `follow`).
9. **Abwesenheit pro Akt ohne Gesprächsersatz:** Wenn eine Figur `away` ist (Partynacht, Turm), hat der Spieler kein Ansprechziel.
   Telefonnachrichten decken das ab; ein „Abwesend-Zettel“-Hotspot am Stammplatz wäre schön (z. B. an `kuschel-sessel`).

### Inhalt / Querverweise

- **Flags, die ich lese:** `nyra_zurueckgelassen`, `aria_gechippt`, `aria_entkommen`, `bruch_vega_schuss`, `jimmy_gechippt`,
  `proband_gechippt` (main-2-bruch), `nyra_befreit` (main-3-labor), `releaseparty_geplant`, `party_bereit`, `epilog`, `ende_meer`,
  `ende_neue_nexus`, `ende_master`, `ende_doch_noch_meer`, `master_modus`, `nyra_fehlt_am_meer`, `kuschel_bei_mila`,
  `kuschel_sorgerecht` (side-captain-kuschel), die Nacht-Flags `*_nacht` der Romanzen (nur für Morgen-danach-Sprüche, nichts Explizites).
- **Flags, die ich setze:** `vega_vernissage`, `vega_bild_abgehaengt`, `vega_bild_geklaut`, `vega_aria_bild_erzaehlen`,
  `vega_wachhunde_verstaerkt`, `nyra_entschuldigt`, `nyra_akrostichon`, `kuschel_nicht_gewaschen`, `kuschel_talisman`, `jimmy_vertrag`,
  `hunter_entschuldigt_jimmy`, `jimmy_erwacht_nachspiel`; Tagesflags `heute_vega_turmblick` u. ä.
- **Variante B (Jimmy gechippt, nicht gerettet):** Dialog `jimmy-erwacht` im Nachspiel setzt `jimmy_gerettet` + `jimmy_status_gefunden` +
  `jimmy_status_neustart`. Falls `side-jimmys-chip` dann noch aktiv ist, bleibt die Quest offen. Bitte Quest-Agent: `side-jimmys-chip`
  bei `jimmy_gerettet` als erledigt behandeln oder einen `completeQuest`-Effekt freigeben. Abgleich mit main-2-kanal nötig, ob Jimmy dort
  schon gerettet werden kann.
- **`side-zweite-chance`** wird in `kuschel-tag-master` per `startQuest` angestoßen (nur wenn inaktiv). Die Definition kommt vom Quest-Agenten.
- **Neue Check-IDs:** `he-vega-8-ausrede`, `he-vega-8-security`, `he-vega-8-abhaengen`, `he-vega-8-klauen`, `he-vega-10-tropf`,
  `he-vega-10-kinder`, `he-nyra-8-beistand`, `he-nyra-8-log`, `he-nyra-10-summen`, `he-nyra-10-bass`, `he-kuschel-8-babette`,
  `he-kuschel-8-rennen`, `he-kuschel-8-bruehe`, `he-kuschel-10-leuchtfaden`, `he-jimmy-8-hunter`, `he-jimmy-8-vertrag`,
  `he-jimmy-10-trick`, `he-jimmy-10-trost`. Jede Szene hat mindestens einen Weg ohne Check.
- **Belohnungsgegenstände, die ich verwende** (vorhanden, sonst bitte anlegen): `vegas-zielfernrohr`, `nyra-wellenchip`, `jimmys-glueckschip`.
- **Romanze:** keine meiner Figuren steht in `ROMANCE_ENABLED`; Vega/Nyra bleiben Freundschaft (siehe oben zu `ROMANCE_CANDIDATES`).
- **Bilder fehlen (Platzhalter):** Plates `cut-he-vega-8`, `cut-he-vega-10`, `cut-he-nyra-8`, `cut-he-nyra-10`, `cut-he-kuschel-8`,
  `cut-he-kuschel-10`, `cut-he-jimmy-8`, `cut-he-jimmy-10`, falls die Szenen-Plates angezeigt werden sollen.
