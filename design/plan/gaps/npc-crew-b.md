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
- **Talisman „Große Ohren“** (he-captain-kuschel-10, Akt 2): kein Gegenstand in world.md §9. Behelf: Flag `kuschel_talisman` + Meldung.
  Vorschlag an den Gegenstands-Agenten: Andenken `talisman-grosse-ohren` (versteckte Gegner sichtbar, +1 Ausstrahlung bei `trost`).
- **Bilder fehlen (Platzhalter):** Laufblatt `captain-kuschel-walk` (Kuschel sitzt eigentlich nur – ein Sitz-/Prop-Blatt aus
  `prop-captain-kuschel` würde reichen), Plates `cut-he-vega-6`, `cut-he-nyra-4`, `cut-he-jimmy-6`. Fotos `photo-jimmy-besorgt`,
  `photo-jimmy-wut`, `photo-jimmy-ueberrascht`, `photo-captain-kuschel-ueberrascht` werden genutzt, fallen sonst aufs Porträt zurück.
- **Kanon-Abweichung bei anderen Teilen (nicht von mir geändert):** `maps/dantes-werkstatt.ts` beschreibt Kuschels Kissen „in Form eines kleinen
  Roboters“ (world.md: Plüschhase), `maps/crew-quartier.ts` lässt `captain-kuschel` sprechen (world.md: spricht nie, nur Ohren/Zettel).
- **romance.ts:** `ROMANCE_CANDIDATES` enthält `vega` und `nyra`, world.md §4.2/§4.7 sagt „Romanze: nein“. Meine Figuren haben keine
  Flirtzeilen und kein `romanceable`.
- **re-…-Ereignisse:** `re-vega-5` (hafenkante), `re-nyra-5` (netzcafe), `re-captain-kuschel-5` (Werkstatt) angelegt; −2/−8 nicht.
