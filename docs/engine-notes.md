# Engine-Notizen (Fundament)

Arbeitsgrundlage für die parallelen Bereiche. Regeln und Inhalte stehen verbindlich in `docs/design.md` und `docs/world.md`; dieses Dokument beschreibt, **wo** im Code etwas hingehört, wem welche Datei gehört und wie man erweitert, ohne sich gegenseitig zu blockieren.

Stand: Integration abgeschlossen – alle Bereiche sind zu einem lauffähigen Spiel verdrahtet (siehe §12). `npm run check`, `npm test`, `npm run build`, `npm run check:manifest`, `npm run test:scripts` und `node ../scripts/check_architecture.mjs` (in `game/`) sind grün; `e2e/engine.spec.ts` spielt den kompletten Ablauf mit dem Testinhalt durch.

## 1. Verzeichnisplan

```
game/
  index.html                    Titel „Nexus – Das RPG“, theme-color, #game (Canvas) + #ui (DOM-Overlay)
  public/assets/manifest.json   erzeugt von scripts/build_manifest.mjs – nie von Hand bearbeiten
  e2e/helpers.ts                Playwright-Helfer für window.__nexus (headless, 1 Worker, Port 5201)
  e2e/engine.spec.ts            Integrationstest: Erstellung → Erkundung → Dialog/Check → Geschenk → Auftrag → Kampf → Händler → Schlafen
  src/
    main.ts                     Schriften (Chakra Petch, Atkinson Hyperlegible), Styles, bootstrap()
    modules/                    reine Regeln, keine Browser-Globals
      contracts.ts              alle Typverträge (Inhalt, Zustand, Bedingungen, Effekte, Requests, Ports)
      campaign/                 Kampagnen-Fassade createCampaign(content, options) → CampaignPort
        index.ts                Fassade: mutate()/light(), Autosave, Import/Export
        registry.ts             Spec-Typen für Bedingungen, Effekte, Settle-Hooks
        conditions.ts           CONDITION_SPECS = Vereinigung aller Domänen-Specs
        effects.ts              EFFECT_SPECS, SETTLE_HOOKS, transaktionales runEffects
        domains/                je Bereich: Regeln, Bedingungen, Effekte, Speicher-Parser
          core.ts               Flags, Inventar, Gesehen-Liste, Stationen, Telefon, Credits-Grundlagen
          character.ts          Attribute, XP/Stufen, LP, Perks, Cyberware, Ausrüstung, Erstellung
          relations.ts          Herzen, Geschenke, Gespräche, Romanze, Crew/Party, Herz-Ereignisse
          schedule.ts           Tagesabläufe → presentNpcs
          clock.ts              Uhr, Tageszeiten, Wochentage, Schlafen, Zusammenbruch
          quests.ts             Quests, Schritte, Aufträge (Jobs), Belohnungen
          economy.ts            Handel, Preise, Ruf
          combat.ts             Kampfausgang übernehmen (finishBattle), `won`-Bedingung
        checks.ts               Schwellen-Checks (Wert = Attribut + Boni ≥ Schwelle, XP einmalig)
        state.ts                createInitialState, createActState (Warps)
        save.ts                 Speicherformat v1, strikte Prüfung, ungültig → nichts ändert sich
        lint.ts                 findContentProblems (Referenzen, Erreichbarkeit, Check-Alternativen)
        triggers.ts             runEnterTriggers (MapDef.onEnter, Herz-Ereignisse)
        ids.ts, validate.ts, names.ts, dialogueKeys.ts
      dialogue/                 Dialogsitzung (Wahlen, Checks, Effekte)
      relationships/            Herzen, Rivalität, Geschenke (Bonus-Hooks), Herz-Ereignisse, Crew, Romanze-Schalter
      time/                     Uhr, Tageszeiten, Zeitereignisse, Zusammenbruch, Tagesablauf-Auflösung (whereIs)
      ending/                   Abschlussstatistik, Epilogzeilen
      navigation/               Begehbarkeit, A*, Gleiten, Spur
      __fixtures__/content.ts   kleiner Fixture-Inhalt für Modultests
    content/                    TESTINHALT (meta.test = true) – nur `import type` aus modules
      index.ts                  setzt GameContent zusammen
      maps.ts world.ts npcs.ts dialogues.ts checks.ts items.ts perks.ts character.ts
      economy.ts quests.ts enemies.ts encounters.ts news.ts relationships.ts romance.ts
      content.test.ts, romance.test.ts
    platform/                   Browser-Anbindung: audio/, input/, assets/manifest.ts, storage.ts, settings.ts
    presentation/
      director.ts               Ablaufsteuerung: Requests, Interaktion, Dialog, Cutscene, Reise, Kampf, Overlays
      context.ts runtime.ts guards.ts placeholders.ts
      dom/                      DOM-Overlays (HUD, Dialog, Inventar, Figur, Quests, Crew, Telefon, Stadtkarte,
                                Handel, Auftragstafel, Geschenk-/Aktionsmenü, Kampf-Platzhalter, Menüs, Debug)
      phaser/
        scenes/ExploreScene.ts  Erkundung: beliebige MapDef.size, Kamera-Follow + Bounds, Licht, Spieluhr
        scenes/simpleScenes.ts  Boot, Titel, Cutscene-Bühne, Abspann
        actor.ts assets.ts camera.ts tuning.ts navigationAdapter.ts trail.ts
    app/                        Komposition, Bootstrap (Phaser 960×540), URL-Einstiege, Test-Hook
    styles/main.css             Neon-Variablen (:root), alle Overlay-Stile
scripts/
  build_manifest.mjs (+ .test.mjs)   design/assets/**/*.json → game/public/assets/manifest.json
  check_architecture.mjs (+ .test.mjs)
design/assets/                  Asset-Fragmente und Bauvorgaben
```

## 2. Dateibesitz

Jede Datei hat genau einen Besitzer. Andere Bereiche ändern sie nur nach Absprache; **gemeinsame Dateien** dürfen alle **additiv** ändern (eigene Abschnitte anhängen, nichts umdeuten).

### character
- `game/src/modules/campaign/domains/character.ts`
- `game/src/modules/campaign/checks.ts`
- `game/src/content/character.ts` (Herkünfte, Aussehen), `content/perks.ts` (Perks, Cyberware), `content/checks.ts`
- neu: `game/src/modules/character/` (Attribute, Erstellung, Stufen, Perks, Cyberware, abgeleitete Werte, Lint), `game/src/modules/checks/` (Schwellen-Checks)

### relationships+time
- neu: `game/src/modules/relationships/` (reine Regeln: Punkte/Herzen/Rivalität, Ansprechen, Geschenke mit Bonus-Hooks, Herz-Ereignisse, Crew, Romanze-Schalter, Beziehungsansicht, Strukturprüfung)
- neu: `game/src/modules/time/` (reine Regeln: Uhr, Tageszeiten, Wochentage, Vorrücken mit Ereignissen, Schlafen, Zusammenbruch/Notschlafplätze, Tagesablauf-Auflösung)
- `game/src/modules/campaign/domains/relations.ts`, `domains/schedule.ts`, `domains/clock.ts` (Anbindung an Zustand, Bedingungen, Effekte, Speicher) und `domains/relationsTime.test.ts`
- `game/src/content/npcs.ts`, `content/relationships.ts`, `content/news.ts` (Nachrichten, Telefon)
- `game/src/content/romance.ts` – Änderungen an `ROMANCE_ENABLED` nur mit ausdrücklicher Nutzerfreigabe; `NEVER_ROMANCE` und `romance.test.ts` nie lockern.

### combat-rules
- `game/src/modules/campaign/domains/combat.ts`
- neu: `game/src/modules/combat/` (Rasterkampf als reine Regeln: Aufbau aus EncounterDef/ArenaDef, Züge, Fähigkeiten, Gegner-KI, Ergebnis `BattleResult`)
- `game/src/content/enemies.ts`, `content/encounters.ts`

### quests+economy
- `game/src/modules/campaign/domains/quests.ts`, `domains/economy.ts`
- neu: `game/src/modules/quests/`, `modules/jobs/`, `modules/economy/`, `modules/reputation/`, `modules/news/` (reine Regeln, siehe Abschnitt 8)
- `game/src/content/quests.ts`, `content/economy.ts` (Händler, Aufträge), `content/items.ts`

### explore-presentation
- `game/src/presentation/phaser/` außer künftigen Kampfszenen: `scenes/ExploreScene.ts`, `scenes/simpleScenes.ts`, `actor.ts`, `assets.ts`, `camera.ts`, `tuning.ts`, `navigationAdapter.ts`, `trail.ts`
- `game/src/presentation/placeholders.ts`
- `game/src/modules/navigation/`
- `game/src/content/maps.ts`
- `scripts/build_manifest.mjs`, `scripts/validate_assets.mjs`, `scripts/map_tool.mjs`
- Hauptbesitzer von `game/src/presentation/director.ts` (siehe gemeinsame Dateien)

### combat-presentation
- neu: `game/src/presentation/phaser/scenes/BattleScene.ts` und `presentation/phaser/battle/`
- `game/src/presentation/dom/battlePlaceholder.ts` (wird durch die Kampf-UI ersetzt), neue `presentation/dom/battle*.ts`

### dom-ui
- `game/src/presentation/dom/*` außer `battlePlaceholder.ts`/`battle*.ts`
- `game/src/styles/main.css`, `game/index.html`, `game/src/main.ts`, `game/public/favicon.svg`
- `game/src/platform/input/`, `platform/settings.ts`, `platform/storage.ts` (Speicherplätze)

### Gemeinsame Dateien (additiv, Absprache bei Umbau)
- `game/src/modules/contracts.ts` – neue Felder/Varianten im Abschnitt des eigenen Bereichs; bestehende Felder nicht umdeuten.
- `game/src/modules/campaign/index.ts`, `registry.ts`, `conditions.ts`, `effects.ts`, `state.ts`, `save.ts`, `ids.ts`, `validate.ts`, `lint.ts`, `triggers.ts`, `names.ts`
- `game/src/presentation/director.ts` – jeder Bereich nur in seinem Abschnitt (Requests, Kampf, Overlays …)
- `game/src/app/*` (Bootstrap, Komposition, URL-Einstiege, Test-Hook)
- `game/src/content/index.ts`, `content/world.ts`, `content/content.test.ts`, `content/dialogues.ts` (Dialoge je Bereich mit Präfix der Figur/Quest)
- `game/src/modules/__fixtures__/content.ts`
- `game/src/platform/audio/` (neue SFX/Ambiences additiv)

## 3. Erweiterungspunkte

**Bedingung hinzufügen**
1. Variante in `ConditionMap` (contracts.ts).
2. Spec im Domänen-Objekt (z. B. `relationConditions`) mit `test` und – wenn sie auf Inhalt verweist – `refs`.
3. `CONDITION_SPECS` ist über den Typ erschöpfend: Ohne Spec kompiliert es nicht.
4. Lint prüft die `refs` automatisch.

**Effekt hinzufügen**
1. Variante in `EffectMap`.
2. Spec in `xxxEffects`:
   - `apply` gibt `null` oder einen Fehlertext zurück. Ein Fehlertext verwirft die ganze Effektliste (transaktional).
   - `messages.push(...)` liefert Toasts.
   - `requests.push(...)` liefert Darstellungsaufträge.
3. Beispiel: `trainAttribute` in `domains/character.ts`.

**Settle-Hook**
- Für Folgeregeln nach jeder Änderung (Quest-Schritte, Stationen): eine Funktion in `SETTLE_HOOKS`.
- Sie gibt `true` zurück, wenn sie etwas geändert hat; dann laufen die Hooks erneut.

**Request hinzufügen**
1. Variante in `RequestMap`.
2. Genau ein Zweig in `Director.runRequests`.
- `travel.minutes` ersetzt die Standard-Reisezeit von 10 Minuten: U-Bahn, Zusammenbruch und Niederlage setzen sie auf `0`.

**Zustand erweitern**
1. Feld in `GameState`.
2. Startwert in `createInitialState`.
3. Parser in der eigenen Domäne (`parseXxx`), eingebunden in `save.ts`.
4. Grenze in `SAVE_LIMITS`.
- `SAVE_VERSION` bleibt 1, solange Felder nur dazukommen. Eine neue Version nur mit Migration.

**Fassade**
- Neue Methode in `CampaignPort`, implementiert in `campaign/index.ts` über `mutate(ctx => …)`.
- Nie direkt am Zustand schreiben.
- Laufen und Spielzeit nutzen `light()` (gedrosselter Autosave).

**Kampf** (combat-rules + combat-presentation)
- Ablauf: `Director.battle(encounter)` → `Director.battleRunner(encounter): Promise<BattleOutcome>` → `campaign.finishBattle({ encounter, outcome, playerHp, xp? })`.
- Solange `battleRunner` null ist, erscheint der DOM-Platzhalter.
- Die Kampfszene registriert sich in `app/bootstrap.ts`: Szene in die Phaser-Liste und `director.battleRunner = …`.
- Für Tests beendet `director.resolveBattle(outcome)` bzw. `__nexus.winBattle()` jeden laufenden Kampf.

**Overlays** (dom-ui)
- Je Overlay eine Datei unter `presentation/dom/` mit `open…(shell, …)`.
- Modalname = Intent-Name, damit dieselbe Taste schließt (`shell.ts`).
- Der Aufruf erfolgt über `Director.open…`.
- Neue Tasten: `platform/input/types.ts` + `router.ts`, Behandlung in `ExploreScene.onIntent`.

**Erkundung**
- Neue Interaktionsart:
  1. `Interactable` erweitern (ExploreScene).
  2. In `refreshWorld` sammeln.
  3. In `Director.interact` behandeln.
- Stellschrauben (Tempo, Radien, Crew-Abstand, Uhrtakt, Standard-Sprites) stehen in `phaser/tuning.ts`.
- Passanten (`MapDef.ambient`), Zielmarker (`QuestStepDef.marker` über `campaign.objective()`), Namensschilder, Sprechblasen und Vordergrund-Verdecker (optional eigenes Bild `fg-<map>`) sind umgesetzt; Details in Abschnitt 8.

**Assets**
1. Fragmente mit `images`/`sprites` (optional `items`, `blurhash`) unter `design/assets/**/*.json` ablegen.
2. `npm run assets:manifest` ausführen.
- `npm run check:manifest` prüft, ob das Manifest aktuell ist.
- Gleiche Schlüssel mit verschiedenem Wert brechen den Bau ab.
- Fehlende Dateien sind Warnungen, mit `--strict` Fehler.
- Schlüssel: `bg-<map>`, `arena-<id>`, `cut-<id>`, `portrait-<id>`, `photo-<id>-<ausdruck>`, `prop-<id>`, `ui-title`, Laufblätter `<id>-walk`.
- Laufblätter haben 4×4 Zellen à 128×128, Fuß bei (64, 120). Reihen: s, w, e, n.
- Fehlende Bilder zeichnet `SceneAssets` als Platzhalter.

**URL-Einstiege** (`app/urlEntry.ts`)
- `?scene=title`
- `?newchar`
- `?act=1..3`
- `?map=<id>[&entry=]`
- `?battle=<encounter>`
- `?cut=<id>`
- `&time=morgen|tag|abend|nacht`
- `&seed=<n>`
- `&debug` (F2 Debug-Menü)

Alle Einstiege außer dem Titel spielen auf dem Debug-Speicherplatz.

**Test-Hook** `window.__nexus` (`app/testHook.ts`)

| Zweck | Befehle |
| --- | --- |
| Ansicht und Zustand | `currentView`, `state`, `hotspots`, `npcs` |
| Ort | `warp`, `travel`, `teleport`, `walkTo` |
| Interaktion | `interact`, `talk` |
| Dialog und Cutscene | `choose`, `advance`, `skipCutscene`, `startDialogue`, `playCutscene` |
| Werte | `runEffects`, `giveItem`, `setAttr`, `addHearts`, `setTime` |
| Kampf | `startBattle`, `winBattle`, `battle` (Zustand: Runde, aktive Einheit, Spielerzug, Einheiten), `battleAction(key)`, `battleTap(col, row)` – die beiden letzten nur im Spielerzug |
| Hilfen | `idle`, `seed`, `walkable`, `reachable`, `background`, `followers`, `placeholders`, `errors` |
| Erkundung | `passersby`, `passerbyBark`, `worldLabels`, `objectiveMarker`, `lighting` |

Neue Befehle hier ergänzen und in `e2e/helpers.ts` typisieren.

## 4. Konventionen

**Sprache und Namen**
- Deutsch mit korrekten Umlauten in UI-Texten und Kommentaren.
- Nur Rollennamen, nie Darstellernamen (auch nicht in Git, Tests oder Docs).
- IDs in kebab-case, ohne Umlaute.
- Testinhalt trägt das Präfix `test-` und `meta.test = true`. Echter Inhalt ersetzt ihn dateiweise.

**Architektur** (geprüft von `scripts/check_architecture.mjs`)
- `modules` importiert nur `modules`. Kein `window`, `document`, `console` oder `setTimeout`; Zufall in Regeln nur über `ctx.random` (Fassade: `options.random`).
- `content` importiert aus `modules` nur per `import type`.
- `platform` importiert `modules` und `platform`.
- `presentation` importiert alles außer `app`.
- Tests und `__fixtures__` sind ausgenommen.

**Regeln**
- Datengetrieben: Regeln lesen nur `GameContent`.
- Inhaltsspezifisches gehört nach `content/`, nie in Module.
- Jeder Check in Dialog oder Welt braucht einen gleichwertigen anderen Weg; Lint und `content.test.ts` prüfen das.

**Zustand**
- Effekte laufen transaktional auf einer Kopie. Der Zustand ist tief eingefroren.
- Die Darstellung schreibt nur über `CampaignPort`.
- Zeit: Kartenwechsel +10 min (`setLocation(..., { minutes })` überschreibt), U-Bahn +30 min.
- Erkunden: 1 Spielminute je 0,7 s, nur ohne Blockade.
- Um 02:00 bricht die Figur zusammen.

**Tests**
- Vitest-Tests liegen neben dem Code (`*.test.ts`).
- Modultests nutzen `__fixtures__/content.ts`; Inhaltstests nutzen `content/`.
- Playwright läuft nur headless, mit 1 Worker, auf Port 5201.
- Dev-Server-Port ist 5200.
- Höchstens zwei schwere Prozesse gleichzeitig.
- Fremde Dev-Server und Sessions nie beenden.

**Bilder und Git**
- Bildgenerierung nur über `scripts/art/codex_image.sh`. Rohbilder liegen unter `output/`, nie in Git.
- `work/`, `output/` und Logs nie in Git oder Docker.
- Nichts committen, pushen oder veröffentlichen ohne Nutzerfreigabe.

**Jugendschutz**
- Romanzen nur über `content/romance.ts`, jugendfrei.
- Daria, Freya und Jakko: nur Freundschaft.

**Prüfen** (in `game/`)
```
npm run check
npm test
npm run build
node ../scripts/check_architecture.mjs
npm run test:scripts
npm run check:manifest
```

## 5. Bekannte offene Punkte

| Thema | Bereich | Stand |
| --- | --- | --- |
| `scripts/validate_assets.mjs` und `scripts/map_tool.mjs` | explore-presentation | Stammen noch aus dem Gerüst (640×360-Annahmen); nicht Teil der grünen Pflichtprüfungen. |
| Drei Speicherplätze laut design.md | dom-ui | Erledigt: Autosave plus drei Plätze (`platform/storage.ts` `createSaveSlots`, `dom/saveSlots.ts`), Export/Import bleibt. |
| Rasterkampf | combat-rules + combat-presentation | Regeln fertig in `modules/combat` (siehe §10); Darstellung siehe §9. |
| `Hud.setVisible` im Hochformat | dom-ui | Statusleiste liegt im Band rechts; Feinschliff fehlt. |
| `ROMANCE_ENABLED` in `content/romance.ts` | Nutzer | Enthält inzwischen weitere Figuren (u. a. Aria) – extern geändert, Freigabe durch den Nutzer steht aus. |
| Charakterbaukasten / Spielstand v2 (design.md §3.1a) | character | Nicht umgesetzt; Spielstand bleibt v1. |

## 6. Beziehungen und Zeit (relationships+time)

**Module**
- `modules/relationships/`: `heartsOf`, `rivalryOf`, `changePoints` (meldet Stufenwechsel), `reconciledPoints`, `heartProgress`, `standingOf`; `dailyTalk`, `pickTalk`, `talkBonusExtra`; `giftTasteFor`, `giftLimitOf`, `recordGift`, `giftValue`, `collectGiftModifiers` mit `GIFT_BONUS_HOOKS` (`perkGiftBonus`, `birthdayGiftBonus` – weitere Quellen hängen einen Hook an); `dueHeartEvents`/`nextHeartEvent` (Karte, Tageszeit, Bedingung, einmalig, niedrigste Stufe zuerst), `upcomingHeartEvents`; `recruit`, `dismiss`, `partyProblem`, `companionAbilities` (Herz-Fähigkeiten für den Kampf); `romanceStatus` (Schalter + `romanceable` + kein Kind + ♥8); `relationView`/`knownRelations` für Menüs; `relationshipProblems` (in `findContentProblems` eingebunden).
- `modules/time/`: `timeSlotOf`, `weekdayOf`, `cycleDayOf` (28-Tage-Festkalender), `formatClock`, `parseClockTime`, `clockLabel`, `minutesUntilSlot`; `advanceClock` liefert `ClockEvent`s (`slot`, `collapse`, `day`), `sleepClock`; `collapsePlan` (−10 % Credits, Notiz, Notschlafplatz); `whereIs` (Party → feste Platzierung → Tagesablauf → `away`/`unknown`), `presentOn`, `scheduleAt`, `weekPlan`; `scheduleProblems`.
- Die Darstellung darf die lesenden Funktionen direkt nutzen, z. B. `relationView(campaign.content, campaign.state(), 'raven')` oder `whereIs(campaign.content, campaign.state(), 'raven', c => campaign.evaluate(c))`.

**Regeländerungen gegenüber dem Fundament**
- Eine aktive feste Platzierung (`MapDef.npcs` mit erfüllter Bedingung) überschreibt den Tagesablauf auf allen Karten; die Figur steht nicht zusätzlich an ihrem Ablaufort.
- Herz-Ereignisse: Sind mehrere fällig, kommt die niedrigste Stufe zuerst.
- Neue Toasts: „Raven: neue Herzstufe ♥3“, „Rivalität mit Raven (Stufe 2)“, „Die Rivalität mit Raven ist vorbei.“; Geschenk-Meldung nutzt den angezeigten Namen.
- Beim Laden werden Punkte über einer (gesenkten) Herz-Obergrenze gekappt statt abgelehnt.

### Vertragswünsche (relationships)

Bis zur Übernahme in `contracts.ts` liest der Bereich diese Felder tolerant (`npcExtras`, `perkExtras`, `shelterOf`); Inhalte können sie erst setzen, wenn der Typ sie kennt.

| Wunsch | Zweck (Quelle) | Stand im Modul |
| --- | --- | --- |
| `NpcDef.maxHearts?: number` (1–10) | Weltfiguren mit Kurzeintrag höchstens 5 (bzw. 6) Herzen (world.md §4.1, §4.5) | Kappung, Ereignisprüfung, Romanzeprüfung, Speicher fertig |
| `NpcDef.birthday?: Condition` | Geburtstagsgeschenke ×3 (world.md §4.1) | `birthdayGiftBonus` fertig |
| `PerkDef.talkBonus?: number` | `perk-anfeuern`: Tagesgespräch +10 (world.md §2.5) | `talkBonusExtra` fertig |
| `MapDef.shelter?: { entry?; when?; keepCredits?; heal?; notes? }` | Notschlafplätze ohne Credits-Verlust (world.md §3.8) | `collapsePlan` und Lint fertig |
| `GameContent.home.collapseNotes` als `(string \| { text; when? })[]` | Notiz „ab `act2`“ (world.md §3.8) | `pickCollapseNote` fertig |
| Effekt `{ reconcile: NpcId }` | Versöhnungsquest setzt Rivalität auf 0 (world.md §4.1) | `reconcileIn` in `domains/relations.ts` bereit |
| Bedingung `{ cycleDay: number \| number[] }` | Feste im 28-Tage-Zyklus (world.md §3.4) | `cycleDayOf` bereit |
| `CampaignPort.relation(npc): RelationView`, `whereIs(npc): Whereabouts` | Beziehungsliste, „Wo finde ich …?“ ohne Modulimport | Funktionen bereit |

### Offene Integrationspunkte (andere Bereiche)
- dom-ui: Beziehungsliste kann `relationView`/`knownRelations` (Herzfortschritt, Geschenke heute/Woche, nächstes Ereignis, Romanze-Status) und `weekPlan` nutzen; Geschenkmenü kann `giftValueOf` (domains/relations.ts) bzw. `GiftValue.modifiers` als Aufschlüsselung zeigen.
- director (explore-presentation): `sleepTransition('collapse')` meldet immer „Du wachst im Unterschlupf auf.“ – bei einem Notschlafplatz (`travel` auf dieselbe Karte bzw. ohne `travel`) passt der Text nicht.
- combat-rules: Begleiterfähigkeiten nach Herzen über `companionAbilities(def, hearts)`; `perk-anfuehrer` (Begleiter-Siegpunkte ×2) gehört in `finishBattleIn`.
- Wetter je Tag (world.md §3.4) ist noch keinem Bereich zugeordnet; `modules/time` wäre der Ort für eine deterministische Ziehung aus Seed und Tag.

## 7. Spielfigur und Checks (character)

**Module**
- `modules/character/` (reine Regeln, schreibt keinen Zustand):
  - Stufen: `xpForLevel`, `levelForXp`, `levelProgress` (Balken), `levelGains`, `pointsUpToLevel`, `maxHpFormula`.
  - Attribute und Erstellung: `attributeParts`, `effectiveAttribute(s)`, `startAttributes`, `creationPointsLeft`, `originBonusOptions`/`originBonusOf`, `finalCreationAttributes`, `validateCreation`, `spendAttributeProblem`, `trainedValue`.
  - Perks: `perkStatus` (lernbar, Grund, fehlende Punkte, „Technik 6 · Stufe 5“), `perkOverview`, `learnPerkProblem`, `characterModifiers` (Händlerrabatt, Ankauf, Geschenk- und Gesprächsbonus, Kampfboni, Merkmale samt Aufschlüsselung), `combatBonusOf`, `hasTrait`, `unlockedAbilities`.
  - Cyberware: `cyberwareSlots`, `cyberwareItem`, `planInstall` (Gegenstand, altes Teil zurück, Gebühr, frei ab `ripperdoc.freeWhen`), `planUninstall` (Einzelstücke ohne Gegenstand bleiben drin), `installFee`.
  - Abgeleitete Werte: `derivedStats` (LP, Bewegung 3 + ⌊Reflexe/3⌋, Initiative Reflexe × 2, Bandbreite 2 + Technik, Firewall 2 + ⌊Technik/2⌋), `playerCombatProfile` (Waffe, Fähigkeiten, Boni).
  - Erweiterungstypen in `types.ts` (`CharacterPerkDef`, `CharacterCyberwareDef`, `CharacterOriginDef`, `CharacterItemDef`, `CharacterCheckDef`, `CharacterNpcDef`, `CharacterShopDef`, `CharacterCreationInput`, `CheckRule`, `AutoPassRule`, `SubstituteRule`, `CheckBuff`). Inhalte nutzen sie per `import type`; das bleibt mit `GameContent` verträglich.
  - `findCharacterProblems` ist in `findContentProblems` eingebunden. Bedingungen aus Regeln prüft die allgemeine Inhaltsprüfung mit.
- `modules/checks/`: `evaluateCheck(subject, check)` liefert ein `CheckResult` (erweitert `CheckEvaluation`).
  - Teilwerte mit `kind`: attribut, cyberware, ausruestung, perk, gegenstand, herkunft, beziehung, begleiter, situation, voruebergehend.
  - Weitere Felder: `baseThreshold`, `thresholdParts` (Rufaufschlag aus `modules/reputation`), `usedAttribute`, `autoPass`, `visible`, `consumes`.
  - Hilfen: `resolveCheck`, `checkSeenKey`, `checkXp` (15 + 5 × Grundschwelle), `checkLabel(check, evaluation?)`, `missingText`, `breakdownText`, `ruleApplies`, `bonusKind`, `remainingBuffs`.
- `campaign/checks.ts` und `campaign/domains/character.ts` leiten auf diese Module weiter; die bisherigen Exportnamen bleiben.

**Regeländerungen gegenüber dem Fundament**
- Perks verlangen zusätzlich die Mindeststufe (`level`, world.md §2.5). Der Attributwert zählt effektiv, also mit Cyberware und Kleidung.
- Check-Regeln können Bedingungen (`when`), Karten, Bezirke und Fraktionen einschränken. Regeln mit eigenem `label` erscheinen einzeln in der Aufschlüsselung.
- Herkünfte (`checkBonus`) und Begleiter in der Party (`partyCheckBonus`) geben Check-Boni. Situationsboni mit Herz-/Crew-Bedingung zählen als Beziehung, mit `origin` als Herkunft.
- Checks mit `faction` erhöhen die Schwelle nach Rufstufe (+1 misstrauisch, +2 feindlich/verhasst). `threshold` ist dann die wirksame Schwelle. XP richten sich weiter nach der Grundschwelle.
- `autoPass` lässt einen Check bis zu einer Grundschwelle automatisch bestehen (Beispiel: Rammbock). `substitute` lässt ein höheres Ersatzattribut zählen (Beispiel: Einschüchtern bei Schulden).
- LP folgen jeder Änderung des LP-Maximums: Perk, Kleidung, Cyberware, Training, Stufe. Sie bleiben in 1..Maximum.
  - Beim Laden werden zu hohe LP gekappt statt abgelehnt. Das betrifft geänderte Inhalte und verkaufte Kleidung.
- Neue Fassadenmethoden in `Campaign` (index.ts, additiv): `installCyberwareAt(shop, id)` und `removeCyberwareAt(shop, slot)`.
  - Einbau nur mit Werkstatt (`ShopDef.ripperdoc`), geöffnet und mit dem Teil im Inventar.
  - Gebühr: `CyberwareDef.installFee`, sonst `ripperdoc.fee`. Frei ab `ripperdoc.freeWhen`.
  - Der Effekt `installCyberware` bleibt gebührenfrei.
- Testinhalt: „Kiroshi-Testoptik“ heißt jetzt „Test-Optik“ (keine Fremdmarken, world.md §0.2). Test-Perks und -Checks nutzen die neuen Felder (`level`, `autoPass`, Bezirksregel, `bonusChoice`).

### Vertragswünsche (character)

Bis zur Übernahme in `contracts.ts` liest der Bereich die Felder über `asPerk()`, `asCyberware()` usw. (`modules/character/types.ts`).

| Wunsch | Zweck (Quelle) | Stand im Modul |
| --- | --- | --- |
| `PerkDef.level?: number` | Mindeststufe der Perks (world.md §2.5) | Prüfung, Status, Lint fertig |
| `CheckBonusRule` um `when?`, `maps?`, `districts?`, `factions?`, `label?` | Kontextboni („+1 Ausstrahlung in der Unterstadt“, world.md §9.2/§9.4) | `ruleApplies` fertig |
| `PerkDef`/`CyberwareDef`/`ItemDef.wear`: `autoPass?`, `substitute?`, `traits?`, `talkBonus?`; Cyberware und Kleidung zusätzlich `shopDiscount?`, `sellBonus?`, `giftBonus?` | Rammbock, Einschüchtern, Preisscanner, Sonderregeln (world.md §2.5, §9.2) | `characterModifiers`, `hasTrait`, Checks fertig |
| `CombatBonus.bandwidth?`, `firewall?` | Netz-Werte (world.md §2.4) | `derivedStats` fertig |
| `OriginDef.bonusChoice?: AttributeId[]`, `CharacterInput.originBonus?: AttributeId` | Knastvogel: +1 Straße oder Körper (world.md §2.2) | Erstellung fertig |
| `OriginDef.checkBonus?`, `NpcDef.partyCheckBonus?` | Herkunfts- und Begleiterboni bei Checks | Checks fertig |
| `CheckDef.faction?: FactionId` | Rufaufschlag auf die Schwelle (world.md §10.2) | Checks fertig |
| `ShopDef.ripperdoc.fee?: number` | Werkstattgebühr (Dante 50, Ripper 100, Lötzinn 80; world.md §2.6) | `installFee` fertig |
| `CheckEvaluation.parts[].source` um `'herkunft' \| 'beziehung'` | Aufschlüsselung ohne Umweg über `kind` | `CheckPart.kind` als Ersatz |
| `CheckEvaluation.baseThreshold`, `usedAttribute`, `autoPass` | Anzeige der wirksamen Schwelle und des Ersatzattributs | in `CheckResult` |
| `PlayerState.checkBuffs?: CheckBuff[]`, Effekt `{ checkBuff: … }` | Nougatbombe, Captain Kuschel ♥2, Plattenspieler (world.md §3.7, §4.2, §9.3) | Auswertung und `remainingBuffs` fertig; Speicher und Verbrauch in `passCheck` fehlen |
| `PlayerState.quirks?: Partial<Record<CyberSlot, string>>` | Macken gebrauchter Teile (world.md §2.6) | offen |
| `PlayerState.address?: 'sie' \| 'er' \| 'neutral'` | Anrede bei der Erstellung (world.md §2.1) | offen |
| Effekt `{ removeCyberware: CyberSlot }`, `CampaignPort.installCyberwareAt`/`removeCyberwareAt` | Ausbau per Dialog und Port statt nur `Campaign` | `uninstallCyberwareIn` bereit |
| `CampaignPort.perkStatus(perk)`, `characterSheet()` | Figurbogen ohne Modulimport | Funktionen bereit |

### Offene Integrationspunkte (andere Bereiche)
- dom-ui (`presentation/dom/character.ts`):
  - „Lernen“ prüft bisher Basisattribut ohne Stufe. Besser `perkStatus`/`perkOverview` nutzen (Grund als Tooltip, `requirement`).
  - XP-Balken über `levelProgress`, Cyberware über `cyberwareSlots`, Werte über `derivedStats`.
  - Erstellung: `originBonusOptions` für die Bonuswahl, `creationPointsLeft`.
  - Schrauber-Menü über `installCyberwareAt`/`removeCyberwareAt`.
- Dialog (`modules/dialogue`): `label: checkLabel(check, evaluation)` statt `checkLabel(check)`. Sonst zeigt eine Wahl bei Rufaufschlag oder Ersatzattribut die Grundschwelle.
  - Tooltip optional über `breakdownText`.
- quests+economy (`modules/economy`): Rabatt und Ankauf lesen nur Perks. `characterModifiers(content, player).shopDiscount`/`.sellBonus` schließen Cyberware und Kleidung ein (Preisscanner −5 %).
  - `sellIn` entfernt verkaufte Kleidung aus der Ausrüstung, ohne die LP abzugleichen. Abhilfe: `clampHp(content, draft)` aus `domains/character.ts` danach aufrufen.
- relationships+time: `giftBonus`/`talkBonus` aus Cyberware und Kleidung über `characterModifiers` (bisher nur Perks über `perkExtras`).
  - Zusammenbruch ohne Credits-Verlust (`perk-zweiter-wind`) über `hasTrait(…, '<merkmal>')`, sobald der Inhalt ein Merkmal festlegt.
- combat-rules: Spielfigur-Einheit aus `playerCombatProfile` (Attribute effektiv, LP-Maximum, Bewegung, Initiative, Bandbreite, Firewall, Waffe, Fähigkeiten aus Perks/Cyberware/Waffe). Waffenattribut über `WEAPON_ATTRIBUTE`.

## 8. Erkundung (explore-presentation)

Alles unter `game/src/presentation/phaser/`. Reine Logik ohne Phaser (je mit `*.test.ts`), die Szene setzt sie nur zusammen.

| Datei | Inhalt |
| --- | --- |
| `scenes/ExploreScene.ts` | Szene: Karte, Kamera, Figuren, Interaktion, Licht, Beschriftungen, Debug (F1) |
| `motion.ts` | `facingFrom` (mit Hysterese), `RouteWalker` + `stepRoute` (Patrouille, Passanten, Ortswechsel), `expandRoute` (Pfadsuche zwischen Wegpunkten), `idleBreath`, `seededRandom`, `hashSeed` |
| `ambient.ts` | Passanten: `ambientCount`, `planPassersby`, `pickBark` (neue Sprüche zuerst), `bubbleDuration`, `nextBarkDelay` |
| `lighting.ts` | `TINT`, `tintFor`, `lightSlots`, `lightAlpha`, `parseColor`, `neonFlicker` |
| `presence.ts` | `PresenceResolver`, `diffPresences` (bleiben/hinlaufen/neu aufbauen/kommen/gehen), `nearestExit`, `TELEPORT_MINUTES` |
| `objective.ts` | `objectiveTarget`, `firstExitTowards` (Breitensuche über Ausgänge), `edgeIndicator` (Randpfeil) |
| `labels.ts` | `nearbyNameplates` (Hysterese), `toFramePercent`, `clampCenter`, `clampLabel` |
| `worldLabels.ts` | DOM-Ebene `WorldLabels` im Rahmen (`shell.frame`, vorn eingehängt, also unter HUD/Dialogen); `data-testid="world-label"`, `data-kind` |
| `exploreContent.test.ts` | Inhaltsprüfung aller Karten: Passanten-Routen, Patrouillen, Lichter, Verdecker |
| `tuning.ts` | zusätzlich `PATROL_PAUSE`, `NPC_WALK_SPEED`, `NPC_LEAVE_TIMEOUT`, `PASSERBY_PAUSE`, `FACING_HYSTERESIS`, `OCCLUDER_ALPHA`, `CLICK_MARKER_RADIUS` |

Verhalten:
- **Figuren nach Tagesablauf:** Quelle `campaign.presentNpcs` (austauschbar über `setPresenceResolver`). Beim Betreten und nach Zeitsprüngen über 30 Minuten (Schlafen, `setTime`, Zusammenbruch) stehen alle sofort an ihrem Platz. Sonst laufen Figuren per Pfadsuche zum neuen Punkt, kommen über den nächsten Ausgang herein oder gehen dorthin hinaus (Ausgänge mit Check werden gemieden). Danach Patrouille, falls `patrol` gesetzt. Bei reduzierter Bewegung immer sofort.
- **Namensschilder** ab 190 px Nähe (weg ab 230 px, höchstens 4), Gegnergruppen in Rot. Am fokussierten Ziel zweite Zeile mit Taste („E Sprechen“, „E Kampf“); Hotspots, Ausgänge und Betten bekommen ein Aktionslabel über dem Objekt. Der HUD-Hinweis (dom-ui) bleibt zusätzlich.
- **Passanten:** Anzahl `bySlot[slot] ?? count` (max. 16), Laufblätter reihum, Routen reihum (jede zweite Runde rückwärts); ohne `routes` zwischen zufälligen begehbaren Punkten. Startwert `<map>:<tag>:<tageszeit>`. Beim Tageszeitwechsel blenden zusätzliche ein und überzählige aus. Sprechblasen nur in 340 px Nähe und im Bild, höchstens 2 gleichzeitig, alle 7–16 s. Antippen eines nahen Passanten löst sofort einen Spruch aus. Gezeigte Sprüche merkt sich die Sitzung je Karte (nicht im Spielstand).
- **Licht:** Farb-Overlay je `lighting`/Tageszeit (Morgen Blau-Grau, Tag leicht gelblich, Abend violett, Nacht dunkelblau). Lichtpunkte additiv, abends 70 %, nachts 100 %, mit leichtem Neon-Flackern (nicht bei reduzierter Bewegung). Untergrund: Dunkelmaske mit Lichtkegeln.
- **Vordergrund-Verdecker:** `MapDef.foreground[].rect` wird aus `fg-<mapId>` geschnitten, wenn dieses Bild im Manifest steht (transparent, gleiche Proportionen wie `bg`), sonst aus dem Hintergrund. Steht die Spielfigur dahinter, wird der Verdecker halb durchsichtig.
- **Zielmarker:** Raute über `marker.at` auf der Zielkarte, sonst über dem Ausgang auf dem kürzesten Weg dorthin (offene Ausgänge bevorzugt). Liegt das Ziel außerhalb des Bilds, erscheint ein Randpfeil. Zieltext in 80–320 px Nähe.
- **Klick/Tippen:** Pfadsuche zum Punkt, Ring am Ziel. Ein Klick auf ein Ziel läuft hin und interagiert. Gegnergruppen patrouillieren auf ausgerollten Wegen (Pfadsuche); Berührung startet den Kampf.
- **Stillstand:** Bei Dialog, Menü oder Kampf stehen Figuren und Gegner still (wie die Uhr), die Beschriftungen sind ausgeblendet. Passanten laufen weiter.
- **F1:** zusätzlich Passanten-, Patrouillen- und Laufwege, aktueller Pfad, Lichtpunkte mit Tageszeiten, Sprechradius.

### Vertragswünsche (explore)

| Wunsch | Zweck | Stand ohne Vertrag |
| --- | --- | --- |
| `MapDef.foreground[].image?: string` (eigenes Requisitbild je Verdecker, Fußlinie `baseY`) | Einzelne freigestellte Verdecker statt Ausschnitt | Konvention `fg-<mapId>` als ganzes Overlay-Bild |
| `AmbientDef.barks[].district?`/Pool je Bezirk (`DistrictDef.barks?`) | world.md §10.4: Sprüche je Bezirk und Akt ohne Wiederholung in jeder Karte | Sprüche je Karte mit `when` (z. B. `{ flag: 'act2' }`) |
| `GameState.seen` für Passantensprüche oder eigener Zähler | „Neue Sprüche haben Vorrang“ über Sitzungen hinweg | Gedächtnis nur für die laufende Sitzung |
| `AmbientDef.slots?`/Routen je Tageszeit (`routes` nach `TimeSlot`) | world.md §3.8: Wohnung → Arbeit → Imbiss → Club | eine Routenliste für alle Tageszeiten |
| `NpcPresence.arrive?: 'walk' \| 'instant'` | Inhalt kann Auftritte erzwingen (Cutscene-Übergänge) | Szene entscheidet über Zeitsprung > 30 min |
| `LightDef.flicker?: boolean` | Defekte Neonröhren gezielt flackern lassen | alle Lichtpunkte flackern leicht |

### Offene Integrationspunkte (explore)
- dom-ui: Der HUD-Hinweis (`hud.setHint`) zeigt dasselbe wie das Aktionslabel in der Welt. Auf Touch kann er bleiben, auf dem Desktop kann er entfallen oder kleiner werden.
- dom-ui: `.world-labels` nutzt nur Inline-Stile (Variablen `--font-display`, `--fs-label`, `--fs-small`). Eigene Klassen in `main.css` dürfen sie ersetzen.
- relationships+time: Tagesablauf-Wechsel laufen über `presentNpcs`. Für weiche Übergänge soll eine Figur am Tageszeitwechsel auf derselben Karte `source`/`at` ändern, statt kurz zu fehlen.
- Inhalt (`content/maps.ts`): `ambient.routes`, `lights`, `foreground` und `encounters[].patrol` je Zone eintragen. `exploreContent.test.ts` prüft sie.
- scripts: `validate_assets.mjs` und `map_tool.mjs` gehen noch von 640×360 aus (unverändert, siehe Abschnitt 5).

## 8. Quests, Aufträge, Handel, Ruf, Nachrichten (quests+economy)

**Module** (reine Regeln, schreiben keinen Zustand; die Darstellung darf sie direkt lesen, z. B. `questMarkers(campaign.content, campaign.state(), c => campaign.evaluate(c), map)`)
- `modules/quests/`: `questStatusOf`, `rewardEffects`, `rewardLines` („120 XP“, „Raven ♥ +40“, „Hunters Crew +5“), `questProgress` (Fehlschlag vor Schritten vor Abschluss), `stepAlternatives`/`alternativeParents`, `questStepViews` (`open`/`done`/`skipped`), `questLog` (erweitert `QuestView`: Art, Status, verfolgt, Auftraggeber, Belohnungszeilen, Start-/Endtag), `objectiveOf` (`ObjectiveDetail`: Schritt, Art, optional, offene Lösungswege mit Markern), `questMarkers` (alle offenen Ziele, HUD-Ziel hervorgehoben), `questProblems`.
- `modules/jobs/`: `jobBoardRules` (Standard: 3 Angebote, +25 % auf den ersten Auftrag des Tages, +25 % Lohn und +10 % XP je Rang, Frist bis Ende des Folgetags, −2 Ruf bei Verfall), `jobRank` (aus Fraktionsruf, sonst aus der Stufe), `scaleJobCredits`/`scaleJobXp`, `drawJobOffers`/`availableJobOffers`, `offerId`/`offerDay` (`<tafel>@<tag>#<vorlage>`), `acceptedCredits`, `jobCompletionReward`, `jobDeadline`/`expiredJobs`, `jobTitle`/`jobText`, `jobOfferView`, `jobBoardView`, `activeJobs`, `jobTargetsOn`, `jobTargetEffects`, `jobsForEncounter`, `jobProblems`.
- `modules/economy/`: `tradeTerms` (Rufstufe, Rabatt aus `characterModifiers`, Kauf-Faktor 0,5 … 2, Ankaufsquote bis 0,9, Verweigerung), `discountPercent`, `buyUnitPrice`, `sellUnitPrice` (nie über dem eigenen Verkaufspreis − 1), `buysCategory`, `shopPrices` (Vertragsform `PriceView`), `shopView` (Konditionen, Sortiment, Ankaufsliste, Schließgrund), `planPurchase`/`planSale` (alle Ablehnungsgründe), `soldToday`, `recordStockSale`, `formatCredits`, `creditDeltaText`, `shopProblems`.
- `modules/reputation/`: `REP_TIERS` (world.md 10.2: Verhasst … Verehrt mit Preis-, Ankaufs- und Check-Wirkung), `repTier`, `factionTier`, `repOf`, `clampRep`, `applyRepDelta`, `repMessages`, `factionStandings`, `repCheckPenalty`, `isHostile`, `repTierProblems`.
- `modules/news/`: `availableNews`, `newsBulletin` (Hauptmeldung + 2 täglich wechselnde Kurzmeldungen, optional je Sprecher/Sender), `currentNews`, `unseenNewsCount`, `newsSeenKey` (`news:<id>`), `duePhoneMessages`, `phoneInbox`, `unreadPhoneCount`.
- `campaign/domains/quests.ts` und `domains/economy.ts` leiten auf diese Module weiter; die bisherigen Exportnamen bleiben. `questProblems`, `jobProblems` und `shopProblems` sind in `findContentProblems` eingebunden. Neuer Nachlauf `jobSettle` (in `SETTLE_HOOKS` nach `questSettle`).

**Regeländerungen gegenüber dem Fundament**
- Rufrabatt nach Stufen statt linear: Feindlich/Verhasst +50 %, Misstrauisch +25 %, Neutral 0, Geduldet −10 %, Respektiert −15 %, Verehrt −20 % (plus Perks); Ankauf je Stufe −20 … +15 Prozentpunkte. „Verhasst“ verweigert Kauf und Verkauf.
- Ruf-Toast „Unterstadt +5“ (statt „Ruf Unterstadt +5“), bei Stufenwechsel zusätzlich „Unterstadt: jetzt Geduldet“.
- Angebots-IDs `<tafel>@<tag>#<vorlage>`; jede Vorlage hat ihren eigenen Zufall, darum bleiben die übrigen Angebote stabil, wenn eine Bedingung im Laufe des Tages umschlägt. Alte IDs bleiben ladbar (verfallen dann nicht).
- Erster angenommener Auftrag des Tages: Lohn +25 % (im angenommenen Angebot gespeichert). Offene Aufträge verfallen nach der Frist (Paket zurück, Toast „Auftrag verfallen: …“, Ruf bei der Tafel-Fraktion). Höchstens 50 offene Aufträge, keine Vorlage doppelt (auch im Speicherformat geprüft).
- Belohnungen und Schritt-Effekte im Nachlauf laufen einzeln: Eine kaputte Belohnung verhindert die übrigen nicht (Meldung als Toast). Der Effekt `completeQuest` bleibt transaktional. Gescheiterte Quests spielen `sfx: 'fail'`.
- Hauptmeldung: ungesehene Sendungen vor gesehenen, dann Priorität, dann die spätere im Inhalt. Per Effekt `news` freigeschaltete Sendungen laufen auch ohne erfüllte Bedingung.
- Verkauf ausgerüsteter Kleidung gleicht die LP an das neue Maximum an.

**Lösungswege ohne Vertragsfeld:** optionale Schritte je Weg plus ein Pflichtschritt `done: { any: [{ questStep: q, step: 'weg-a' }, { questStep: q, step: 'weg-b' }] }`. Das HUD-Ziel zeigt dann den Pflichtschritt mit allen offenen Wegen; nach einer Lösung sind die anderen Wege „übersprungen“. Lint meldet nicht-optionale Wege.

### Vertragswünsche (quests-economy)

Bis zur Übernahme liest `modules/jobs` die Tafel-Regeln tolerant (`JobContentExtension`); Inhalte können sie erst setzen, wenn `GameContent` das Feld kennt.

| Wunsch | Zweck (Quelle) | Stand im Modul |
| --- | --- | --- |
| `GameContent.jobBoards?: Record<JobBoardId, JobBoardDef>` (`name`, `faction`, `ranks`, `slots`, `extraSlots`, `firstJobBonus`, `creditStep`, `xpStep`, `expiresAfterDays`, `failRep`) | Hunters Tafel mit Rang aus `crew-hunter`, Nachtauftrag ab Rang 3, weitere Tafeln (world.md 6.6) | `jobBoardRules`, Rang, Skalierung, Fristen, Lint fertig |
| `JobState.streak?: { day: number; count: number }` | „Drei Tage in Folge: Ruf +2“ (world.md 6.6) | offen |
| Effekt `{ failJob: JobTemplateId }` | Fehlschlag per Dialog/Kampf (Ruf −2) | Verfall per Frist fertig |
| `JobOffer.xp?: number`, `JobOffer.day?: number` | XP beim Annehmen festschreiben, Tag ohne ID-Parsen | XP nach aktuellem Rang, Tag aus der ID |
| `JobTemplateDef.modifiers?: { label; factor; when? }[]` | Kurier-Modifikatoren (Zerbrechlich ×1,3 …, world.md 6.6) | offen |
| `QuestStepDef.group?: string` (oder `alternatives`) | Lösungswege ausdrücklich statt über `any`/`questStep` | Muster über `any` fertig |
| `QuestStepDef.fail?: Condition` | Schritt-Fehlschlag mit Ersatzweg | offen |
| Bedingung `{ repTier: FactionId; min: RepTierId }` | Dialoge nach Rufstufe („ab Geduldet“) | `repTier` fertig |
| `NewsDef.channel?: string`, `NewsDef.kind?: 'haupt' \| 'kurz'` | NX-1 und Radio Rost, Kurzmeldungen ausdrücklich (world.md 10.5) | Filter über `anchors`, Kurz = übrige |
| `CampaignPort.questMarkers(map)`, `jobBoard(board)`, `shopView(shop)`, `newsBulletin(filter)`, `factionStandings()` | Darstellung ohne Modulimport | Funktionen bereit |

### Offene Integrationspunkte (andere Bereiche)
- combat-rules (`domains/combat.ts`, `finishBattleIn` bei Sieg): `completeJobsForEncounterIn(ctx, encounter)` aus `domains/quests.ts` aufrufen, damit Kopfgeld-Aufträge mit `encounter` nach dem Sieg abschließen.
- explore-presentation: Zielmarker über `questMarkers(…, map)` zeichnen (hervorgehoben: `tracked`); Auftragsziele über `jobTargetsOn(…, map)` als Interaktionspunkte, beim Interagieren `campaign.apply(jobTargetEffects(content, state, offerId))`.
- dom-ui:
  - Händler (`dom/shop.ts`): `shopView` nutzen (Schließgrund inkl. Ruf-Verweigerung, Rabatt, Ankaufspreise je Gegenstand; bisher fehlen Ankaufspreise in der Liste).
  - Auftragstafel: `jobBoardView` (Rang, Lohn mit Frühstücksbonus, XP, Frist, offene Aufträge), `jobText` statt eigener Platzhalterersetzung (bisher fehlt `{ziel}` im Text).
  - Questlog: `QuestLogEntry` aus `campaign.quests()` (`state: 'skipped'` durchstreichen, `alternativeOf` einrücken, `rewards`, `kindLabel`); HUD kann `ObjectiveDetail.alternatives` als „oder …“ zeigen.
  - Fraktionsübersicht über `factionStandings`; Telefon über `phoneInbox`/`newsBulletin`.
  - Toasts: „<Fraktion> +n“, „<Fraktion>: jetzt <Stufe>“, „Auftrag verfallen:“, „Erster Auftrag des Tages:“ fallen derzeit unter `info` (`classifyToast`).
- relationships+time / core: `coreSettle` stellt Telefonnachrichten weiter selbst zu; `duePhoneMessages` ist dieselbe Regel und kann sie ersetzen.


## 9. Kampfdarstellung (combat-presentation)

Dateien (unter `game/src/presentation/`):

| Datei | Inhalt |
| --- | --- |
| `phaser/battle/rulesPort.ts` | Adapter-Schnittstelle `BattleSessionPort` (zustandsbehaftete Kampfsitzung), `SessionAction`/`SessionEvent`/`SessionState` (= Obermengen aus `modules/combat`), `TargetPreview`, `ReachOption`, `ExtraAction`, `AreaTargets` |
| `phaser/battle/combatSession.ts` | `CombatSession` und `createCombatSessionFactory(content, () => state)` – Brücke zu `modules/combat` (`createBattle`, `act`, `planAiAction`, `moveOptions`, `attackTargets`, `areaPreview`, `actionOptions`, `battleResult`) |
| `phaser/battle/controller.ts` | `BattleController`: Zugschleife Spieler ↔ KI (KI Schritt für Schritt sichtbar, Schutz gegen hängende KI), Auswahlzustand, Tastatur/Maus/Touch, Modelle für Szene (`Highlights`) und Oberfläche (`HudModel`, `ResultModel`) |
| `phaser/battle/actions.ts` | Aktionsleiste 1–9 (Bewegen, Angriff, Fähigkeiten, Gegenstand, Überwachung, Deckung, Zug beenden, Fliehen, Terminal; Waffe ohne Taste) mit Sperrgründen |
| `phaser/battle/geometry.ts` | Raster 12 × 8 à 128 px, Feld ↔ Pixel, Kamera-Zoom (Übersicht/Nah) mit DOM-Rändern, Scroll-Klemme |
| `phaser/battle/text.ts` | deutsche Protokollzeilen, schwebende Zahlen, Status-Bezeichnungen, Zielvorschau-Zeilen |
| `phaser/battle/art.ts` | Status-Symbole (Canvas, auch als data-URL für das DOM), Platzhalter-Arena aus `ArenaDef.layout` |
| `phaser/battle/runner.ts` | `BattleRunner` (Sitzung + Szene + Oberfläche) und `installBattleRunner(director, factory)` |
| `phaser/scenes/BattleScene.ts` | Szene `battle` (wird bei Bedarf per `game.scene.add` registriert): Arena-Bild bzw. Platzhalter, Raster-Overlay mit Deckungs-/Gefahrenmarken, Laufblatt-Sprites mit LP-Balken, Status-Symbolen, Aktiv-/Überwachungsring, Hervorhebungen, Pfadvorschau, Animationen (Laufen Feld für Feld, Nahkampf-Ausfall, Leuchtspur, Hack-Strahl + Glitch, Wackeln, Ausweichen, Umfallen, Flucht, Sprechblasen), Zoom per Knopf/Mausrad/zwei Finger, Ziehen zum Verschieben |
| `dom/battleUi.ts`, `dom/battle.css` | Modal „battle“ (durchsichtig, klickdurchlässig): Zugreihenfolge, Runde/Ziel, Zoom, Einheitenkarte (LP, AP, Status), Aktionsleiste, Untermenüs, Zielvorschau (Chance, Schaden, Deckung, Flanke, Aufschlüsselung), Protokoll, Banner, Intro-Zeilen, eigene Meldungen, Sieg-/Niederlage-/Flucht-Bildschirm mit Belohnungen |

Bedienung: Maus – Hover zeigt Pfad bzw. Zielvorschau, Klick führt aus, Rechtsklick = Zurück, Mausrad zoomt. Touch – erstes Tippen zeigt die Vorschau, zweites Tippen oder „Bestätigen“ führt aus; Ziehen verschiebt, zwei Finger zoomen; Startansicht „Nah“. Tastatur – Pfeile/WASD bewegen den Cursor (im Zielmodus wechseln sie das Ziel), Enter/Leertaste bestätigt, Esc geht zurück, 1–9 wählt Aktionen bzw. Einträge im Untermenü; Enter/Esc überspringen Banner und Intro-Zeilen.

Ablauf: `Director.battle()` → `director.battleResultRunner(encounter)` (gesetzt von `installBattleRunner`) → volles `BattleResult` (LP, Beute, XP, Credits, `used`) → `campaign.finishBattle`. Liefert die Fabrik `null` oder fehlt die Arena, erscheint weiter der DOM-Platzhalter. `__nexus.winBattle()` schließt das Modal „battle“; der Runner bricht dann ab und räumt Szene und Oberfläche auf.

### Vertragswünsche (combat-presentation)

- **Director (bereits additiv umgesetzt, Abschnitt Kampf):** neues Feld `battleResultRunner: (encounter) => Promise<BattleResult | BattleOutcome>`; hat Vorrang vor `battleRunner`. Gibt es ein volles Ergebnis, geht es unverändert an `finishBattle` (vorher gingen LP aus dem Kampagnenzustand, keine Beute/XP/Verbrauch durch).
- **contracts.ts (nur Wunsch, nichts geändert):** `BattleAction` `item` um `cell?: Cell` erweitern (Granaten auf Felder) und `interact`/`weapon` aufnehmen; `BattleEvent` um die Varianten aus `CombatEvent` erweitern. Die Darstellung nutzt bis dahin `CombatAction`/`CombatEvent` aus `modules/combat` als Obermengen.
- **contracts.ts:** `BattleUnit.uses` als *verbleibende* Einsätze festschreiben (so liest es `abilityOptions` in modules/combat und die Aktionsleiste).
- **combat-rules:** `createBattle` schreibt die Startereignisse nach `state.log` – die Sitzung spielt sie einmal ab. Bitte beibehalten (oder eine `startEvents`-Rückgabe anbieten).

### Offene Integrationspunkte (combat-presentation)

- **Verdrahtung (app/bootstrap.ts, nach `director.attach(game)`):**
  ```ts
  import { installBattleRunner } from '../presentation/phaser/battle/runner';
  import { createCombatSessionFactory } from '../presentation/phaser/battle/combatSession';
  installBattleRunner(director, createCombatSessionFactory(ctx.content, () => ctx.campaign.state()));
  ```
  Die Szene muss nicht in die Phaser-Liste; `BattleRunner` registriert sie bei Bedarf.
- **Verdrahtet** (Integration): `app/bootstrap.ts` installiert den Runner und reicht ihn an den Test-Hook.
- **Test-Hook:** `installBattleRunner` gibt den `BattleRunner` zurück; `runner.current?.controller` bietet `tap(cell)`, `action(key)`, `pickSub(i)`, `confirm()`, `cancel()`, `lastModel` (HUD-Modell) und `state` – geeignet für `__nexus.battle*`-Befehle in Playwright.
- **dom-ui:** `battle.css` blendet die Erkundungs-Touchsteuerung im Modus `battle` aus (`[data-mode="battle"] .touch`).
- **explore-presentation:** Während des Kampfs setzt der Runner die (pausierte) Erkundungsszene unsichtbar und danach wieder sichtbar.
- **Assets:** Arena-Bilder `arena-<id>` (1536×1024) über das Manifest; fehlt das Bild, zeichnet `drawArenaPlaceholder` die Arena aus dem Layout. Kampfposen (`<id>-pose`) werden noch nicht genutzt – Laufblätter reichen.
- **Audio:** genutzte SFX: `step`, `shot`, `hit`, `hack`, `hurt`, `heal`, `fail`, `switch`, `talk`, `success`.

## 10. Kampfregeln (combat-rules)

Reine Regeln unter `game/src/modules/combat/` (keine Browser-Globals, kein Phaser). Öffentliche API nur über `modules/combat/index.ts`. Zustände sind reine JSON-Daten; jede Aktion liefert einen **neuen** Zustand plus Ereignisse, ein Fehler ändert nichts (`ActResult.error`).

| Datei | Inhalt |
| --- | --- |
| `types.ts` | `CombatState`, `CombatUnit` (⊇ `BattleUnit`), `CombatAction` (⊇ `BattleAction`, plus `interact`, `weapon`, `item.cell`), `CombatEvent` (⊇ `BattleEvent`), `BattleSetup`, `PartyMemberSpec`, Vorschau-Typen |
| `rules.ts` | alle Stellschrauben (AP, Trefferformel, Deckung, Flanke, Volltreffer, DoT, Moral, Schwierigkeit) und eingebaute Aktionen `kampf-einschuechtern`, `kampf-aufrichten` |
| `grid.ts` | Layout-Prüfung, begehbar, Sichtlinie, Deckung je Richtung, Blickrichtung/Flanke |
| `movement.ts` | Dijkstra (4er-Nachbarschaft, Gefahrenfelder gemieden), `reachableCells` mit AP 1/2, Überwachungs-Hinweis, Entfernungsfeld für die KI |
| `resolve.ts` | Trefferchance und Schaden mit Aufschlüsselung, `strikePreview` |
| `effects.ts`, `turns.ts`, `actions.ts` | Schaden, Zustände, Moral, Bossphasen, Ausgang, Belohnung; Zugfolge; `act` |
| `ai.ts` | Profile `aggressiv`, `vorsichtig`, `support`, `boss` (+ Schutzperson), `planAi`, `runAiTurn`, `runAiUntilPlayer` |
| `preview.ts` | `moveOptions`, `attackTargets`, `previewAttack` (auch `from` = erst bewegen), `abilityOptions`, `itemOptions`, `areaPreview`, `actionOptions` |
| `campaign.ts` | `partyFromCampaign`, `bagFromInventory`, `battleSeed`, `battleResult` |
| `setup.ts`, `simulate.ts`, `validate.ts` | `createBattle`, `simulateBattle` (Autopilot), `validateCombatContent` |

**Regeln im Überblick** (Zahlen in `rules.ts`)
- Initiative Reflexe × 2 + Bonus, Gleichstand Party zuerst; `start: 'ueberrumpelt'` (Party zuerst in Runde 1, +15 auf den ersten Angriff) bzw. `'hinterhalt'`.
- 2 AP je Zug. Bewegung `3 + floor(Reflexe/3)` Felder je AP (2 AP = doppelt), Verbündete durchquerbar, Gegner nicht, K.O.-Einheiten belegen ihr Feld. Höchstens **ein Angriff** je Zug (Waffenangriff, schädigende Fähigkeit, Granate). Waffe wechseln 0 AP einmal je Zug. Bei 0 AP endet der Zug automatisch.
- Treffer `75 + 5·ΔReflexe − Deckung (20/40) + Flanke 15 + Markiert 20 − Geschützt 20 + Waffe/Fähigkeit/Bonus − Überwachung 10`, Klemme 5–95. Deckung: Objekt (`h` halb, `H`/`#` voll) auf dem Nachbarfeld in Richtung des Angreifers. Flanke: Angreifer hinter der Blickrichtung des Ziels (am Zugende blickt jede Einheit zum nächsten Gegner). Nur Fernkampf braucht freie Sicht (`#`/`H` sperren, Felder direkt neben Angreifer/Ziel zählen nicht).
- Schaden `Waffe + Attribut (Nah Körper, Fern Reflexe, Smart Technik) + Fähigkeit + Bonus − Panzerung`, mindestens 1; Volltreffer ×1,5 bei Flanke ohne Deckung oder auf „Markiert“. Fähigkeiten nutzen den Waffenschaden nur, wenn ihre Art zur Waffe in der Hand passt; ohne `damage` wirken sie nur über ihren Zustand.
- Zustände ticken zu Beginn des eigenen Zugs: `gehackt`/`betaeubt` setzen aus (danach 1 Runde immun gegen Betäubt), `brennt` 4, `blutet` 2 Schaden, `markiert`, `geschuetzt`. Gefahrenfelder wirken beim Betreten und zu Zugbeginn (`ArenaDef.hazard`, Standard 3 Schaden).
- Fähigkeiten: `ap`, `range`, `radius` (Fläche trifft nur Gegner bzw. bei Heilung/Schutz nur Verbündete, ohne Trefferwurf), `cooldown` in eigenen Zügen (ab dem nächsten Zug), `uses` je Kampf, `status.chance`. Gegenstände aus `bag` (`use.battle` oder `use.heal`), Verbrauch landet in `BattleResult.used`.
- Überwachung (1 AP, beendet den Zug): schießt einmal auf die erste gegnerische Bewegung in Waffenreichweite (Fernkampf mit Sicht), −10; endet zu Beginn des eigenen Zugs.
- Moral (nur Gegner mit `stats.morale`): K.O. eines Verbündeten −20, Volltreffer −10, Gesprächsaktionen `damage + 4 × Attribut` (eingebautes Einschüchtern: 10 + 4 × Ausstrahlung). Unter 30 Flucht (halbe XP, keine Beute), unter 15 Aufgabe (volle Belohnung).
- Ziele: `defeat`, `hack` (AP am Terminal, angrenzend), `reach` (Spielfigur auf Feld), `rescue` (Schutzperson aus NPC-/Gegnerwerten, KI-gesteuert; fällt sie → Niederlage), `survive` (nach N Runden Sieg). Niederlage, wenn alle Party-Kämpfer K.O. sind; Flucht über `{ type: 'flee' }`, wenn `canFlee`. Nach `maxRounds` (60) endet der Kampf als Flucht.
- Bossphasen: `EnemyDef.phases` (absteigend nach `below`) wechseln Profil, ergänzen Fähigkeiten, sagen ihre Zeile (`bark`).
- Belohnung bei Sieg (mit Kampf-Seed gezogen): `EnemyDef.xp`, `credits`, `loot` → `battleResult(state)` → `campaign.finishBattle`.

**Ablauf für die Darstellung**
```ts
const setup = { encounter, seed: battleSeed(state, encounter), party: partyFromCampaign(content, state),
                bag: bagFromInventory(content, state.inventory) /* , start, difficulty */ };
let battle = createBattle(content, setup);          // Startereignisse stehen in battle.log
// KI-Züge: planAiAction + act Schritt für Schritt (oder runAiTurn / runAiUntilPlayer)
// Spieler: moveOptions / attackTargets / areaPreview / actionOptions → act(content, battle, action)
// Ende: battle.outcome !== null → campaign.finishBattle(battleResult(battle))
```

**Tests:** `modules/combat/*.test.ts` (Raster, Bewegung, Trefferformel, Aktionen, Zustände, Moral, Ziele, KI, Vorschau, komplette simulierte Kämpfe über viele Seeds, Kampagnenbrücke) und `content/encounters.test.ts` (Kampfprüfung + jede Begegnung mit der Akt-Party durchgespielt).

### Vertragswünsche (combat-rules)

Nichts an `contracts.ts` geändert; die Wünsche betreffen Inhalte aus `world.md` §8, die die Verträge noch nicht abbilden.
- **Kampftypen angleichen:** `BattleState`/`BattleUnit`/`BattleAction`/`BattleEvent` in contracts.ts sind Entwürfe. Vorschlag: dort auf die Obermengen aus `modules/combat/types.ts` verweisen (oder sie als veraltet markieren). `BattleUnit.uses` = verbleibende Einsätze (wie combat-presentation).
- **`StatusId` erweitern** um die Zustände aus world.md §8.2 (`verlangsamt`, `geblendet`, `nass`, `kurzschluss`, `unterdrueckt`, `verwirrt`, `gechippt`, `ermutigt`, `getarnt`, `verunsichert`, `diva`, `zuckerschock`). Die Regeln brauchen dann je Zustand eine Wirkung (Tabelle in `rules.ts`/`turns.ts`).
- **`WeaponStats.damageMax?`** für Schadensspannen („Schlagring 6–8“); bisher fester Schaden (design.md). Wurf über den Kampf-Seed wäre vorbereitet.
- **`AbilityDef`:** `weaponDamage?: boolean` (statt Ableitung aus der Art), `push?: number` (Rückstoß/Schubsen), `ignoreCover?: number` (Kobra-Schuss), `autoHit?: boolean` (Letzter Vers), `bandwidth?: number` (Hack-Kosten), `shape?: 'cone' | 'line'` (Kegel).
- **`EnemyDef`:** `firewall?`, `tags?` (`drohne`, `gechippt` – für Hacks und Moral), `immune?: StatusId[]`, `talk?: { attribute, threshold, effect: 'flee' | 'surrender' | 'skip' | { morale: number } }` für Gesprächsaktionen mit sichtbarer Schwelle (world.md §8.3), `reinforcements?` (Funkruf, Königlicher Befehl).
- **`EncounterDef`:** `start?: 'normal' | 'ueberrumpelt' | 'hinterhalt'`, `solo?: boolean` (Duell ohne Begleiter), `maxRounds?`; **`ArenaDef`:** zerstörbare Deckung (LP je Feld), erhöhte Felder (`^`: +10 Treffer, +1 Reichweite), Pfützen.
- **Ressourcen Bandbreite/Firewall** (world.md §8.1) fehlen noch in `UnitStats`/`CombatBonus`.

### Offene Integrationspunkte (combat-rules)

- **Schwierigkeit** (`difficulty: 'leicht' | 'normal' | 'hart'`) und **Einstieg** (`start`) nimmt `createBattle` schon an; Einstellung (dom-ui, `platform/settings.ts`) und Schleich-/Überrumpel-Erkennung auf der Karte (explore-presentation) reichen sie noch nicht durch.
- **Begleiterwerte skalieren** laut world.md mit der Spielfigur („Werte auf Stufe 5“) – `partyFromCampaign` übernimmt `CompanionDef.stats` bisher unverändert; die Skalierungsregel fehlt in design.md.
- **Echte Inhalte** (Gegner, Bosse, Arenen aus world.md §8.4–8.6) ersetzen den Testinhalt in `content/enemies.ts`/`content/encounters.ts`; `validateCombatContent` und `content/encounters.test.ts` prüfen sie automatisch (Startfelder verbunden, Ziele erreichbar, Wertebereiche, Probeaufbau).
- **Perk-/Cyberware-Kampfregeln mit Sonderwirkung** (z. B. „Zweiter Wind“, „Zeitlupe“, „Kapitulation“) brauchen eigene Regeln; bisher wirken nur `CombatBonus` und `ability`.

## 11. DOM-Oberfläche (dom-ui)

Alle Overlays programmieren gegen `CampaignPort`. Reine Ansichtsmodelle (ohne DOM, getestet) liegen in `dom/viewModels.ts`, `dom/creationModel.ts`, `dom/plateModel.ts` und `cityMap.ts` (`stationModels`).

- **Titel:** Fortsetzen mit Kurzinfo zum Autosave, Neue Partie, Speicherplätze, Importieren, Exportieren, Galerie, Einstellungen (`Screens.title`, `TitleActions` additiv erweitert).
- **Speicherplätze:** Der Autosave bleibt die laufende Partie. Die drei Plätze sind Kopien davon (`exportSave()`), Laden läuft über `importSave(raw)`. Ablage `nexusrpg-slot-<n>` als Umschlag `{ v: 1, savedAt, save }`.
- **Galerie:** gilt über alle Spielstände (`nexusrpg-gallery-v1`). `installGallerySync(campaign)` übernimmt `state.gallery`, der Director ruft es im Konstruktor auf.
- **Plates** (`PlateUi`, `cutsceneUi.ts` exportiert es weiter als `CutsceneUi`):
  - Letterbox, Neonrahmen mit Glitch-Einblendung, Ken Burns (`in`/`out`/`left`/`right`/`none`), Vignette, Scanlines, Überblendung, Bildunterschrift und Dialogzeilen über dem Bild.
  - Solange das Bild lädt, erscheint der Blurhash aus dem Manifest (`manifest.blurhash`, sobald vorhanden).
  - Reduzierte Bewegung: alle Zeiten 0, keine Fahrt und kein Glitch.
- **Dialog:** Fotos `photo-<porträt>-<ausdruck>` links (Gegenüber) und rechts (Spielfigur), Rückfall `neutral`, sonst das gemalte Porträt.
  - Check-Präfix in Attributfarbe. Eine unerfüllte Wahl ist ausgegraut und zeigt den Grund („Dir fehlen 2 Punkte Technik“) sowie eine Aufschlüsselung (`.dlg-tip`).
- **Textgröße:** Einstellung `textScale` (1 / 1,15 / 1,3). `UiShell.setTextScale` setzt `--text-scale`, `--fs*` in `main.css` skalieren damit.

### Port-Methoden der Oberfläche (erledigt)
Seit der Integration bietet `CampaignPort` alle früher offenen Methoden an: `installCyberwareAt`, `removeCyberwareAt`, `knownGiftTastes`, `sellPrice`, `unequip`, `callCompanion`. `dom/portExtras.ts` enthält keine Rückfälle mehr, nur schmale Weiterleitungen (stabile Schnittstelle für die Overlays). `callCompanion` rechnet die Anfahrt aus `CompanionDef.callMinutes` (Standard `DEFAULT_CALL_MINUTES` = 30) und dem kleinsten `callMinutes` aller passiven Wirkungen (Perks, Cyberware, Kleidung; 0 = sofort).

### Vertragswünsche (dom-ui)
Übernommen (§12): `DialogueLine.expr`, `NpcDef.bio`, `OriginDef.bonusChoice`/`CharacterInput.originBonus`, `PerkDef.level`. Offen: `address`, `LookDef.description/photo`, `DistrictDef.cityPos/color`.

| Wunsch | Zweck |
| --- | --- |
| `DialogueLine.expr?: 'neutral' \| 'happy' \| 'angry' \| 'sad' \| 'surprised'` oder `photo?: string` | Ausdruck des Dialogfotos aus dem Inhalt. Bisher liest `dialogueBox.ts` `expr` tolerant (`ExpressiveLine`). |
| `CharacterInput.address?: 'sie' \| 'er' \| 'neutral'` | Anrede bei der Erstellung (world.md §2.1). Widerspricht noch design.md, das keine Anrede vorsieht. Die Oberfläche fragt bisher nicht. |
| `LookDef.description?`, `LookDef.photo?` | Text und großes Halbporträt in der Aussehensvorschau. Bisher Porträt-Platzhalter, Spielerporträts fehlen im Manifest. |
| `NpcDef.bio?: string` | Kurzbeschreibung in der Beziehungsdetailansicht |
| `DistrictDef.cityPos?: Point`, `DistrictDef.color?: string` | Bezirksbeschriftung und Farbflächen auf der Stadtkarte. Bisher nur eine Legende aus den Stationen. |
| `OriginDef.bonusChoice` und `CharacterInput.originBonus` in contracts.ts | Bonuswahl der Herkunft. Bisher `CharacterCreationInput` aus modules/character. |
| `PerkDef.level?` in contracts.ts | Stufenvoraussetzung im Vertrag statt nur in modules/character |

### Offene Integrationspunkte (andere Bereiche)
- art: Spielerporträts (`portrait-player-*`) und Item-Atlas fehlen. Bis dahin zeigen Erstellung und Inventar Platzhalter.
- art: `manifest.blurhash` (Schlüssel → Hash) für `cut-*`. `design/assets/cut.manifest.json` hat die Werte schon, `build_manifest.mjs` übernimmt sie noch nicht.
- quests+economy: Händler und Tafel könnten `shopView`/`jobBoard` (jetzt am Port) übernehmen (Schließgrund mit Ruf, Frühstücksbonus, Frist). Bisher eigene Anzeige aus `prices`/`jobOffers`.
- quests+economy: Questlog-Schritte mit `state: 'skipped'` brauchen eine Anzeige, sobald `QuestView` sie liefert.
- explore-presentation (Director): Diese Änderungen sind klein gehalten und gehören zu dom-ui:
  - Titelaktionen, Menüaktionen, `openSlots`, `openGallery`, `installGallerySync`, `setTextScale`
  - `giveGiftAndLearn` statt `giveGift`
  - Telefon bekommt den Katalog
  - Cutscene-Bild ohne vorheriges `await loadImage`: `fallback` übernimmt Ladefehler, der Blurhash erscheint sofort

## 12. Integration

### Ablauf und Komposition
- `app/composition.ts` baut Inhalt, Kampagne, Speicher und Plattform; `app/bootstrap.ts` startet Phaser, hängt den Director an, installiert den Kampf-Runner (`installBattleRunner(director, createCombatSessionFactory(...))`) und den Test-Hook.
- Director-Fluss: Titel → Charaktererstellung → Erkundung ↔ Dialog / Plate / Kampf / Menüs. Die Uhr tickt nur in der Erkundung, wenn nichts blockiert (kein Dialog, Modal, Kampf, Szenenwechsel) – vom E2E-Test geprüft.
- Schlafen: Die Kampagne meldet „Tag n beginnt.“, der Director zeigt nach dem Bett keinen zweiten Hinweis. Nach einem Zusammenbruch: „Du wachst im Unterschlupf auf.“ bzw. „Du wachst hier (<Karte>) auf.“
- URL-Einstiege: `?newchar`, `?map=<id>[&entry=]`, `?act=<1..3>`, `?battle=<encounter>`, `?cut=<id>`, `?scene=title`, dazu `&time=`, `&seed=`, `&debug`. `?battle=` meldet `__nexus.ready`, sobald der Kampf läuft (vorher erst nach Kampfende).

### Übernommene Vertragswünsche (contracts.ts)
| Bereich | Übernommen |
| --- | --- |
| character | `PassiveEffects` (gemeinsam für `PerkDef`, `CyberwareDef`, `ItemDef.wear`): `checkBonus`, `autoPass`, `substitute`, `shopDiscount`, `sellBonus`, `giftBonus`, `talkBonus`, `callMinutes`, `traits`, `combat`; `CheckBonusRule` mit `when`/`maps`/`districts`/`factions`/`label`; `PerkDef.level`; `OriginDef.bonusChoice`/`checkBonus`; `CharacterInput.originBonus`; `CheckDef.faction`; `CheckEvaluation.baseThreshold`/`usedAttribute`/`autoPass`; Quellen `herkunft`, `beziehung`, `begleiter`, `voruebergehend`; Effekte `removeCyberware`, `checkBuff` (vorübergehender Check-Bonus, wird beim Bestehen verbraucht, im Spielstand `player.checkBuffs`) |
| relationships+time | `NpcDef.maxHearts`/`birthday`/`partyCheckBonus`/`bio`; `CompanionDef.callMinutes`; Effekt `reconcile`; Bedingung `cycleDay`; `MapDef.shelter`, `home.collapseNotes` |
| quests+economy | Bedingung `repTier`; Effekt `failJob`; `ShopDef.ripperdoc { freeWhen, fee }`; `GameContent.jobBoards`; Kopfgeld-Aufträge (`JobTemplateDef.encounter`) werden beim Sieg erledigt |
| combat | `CombatBonus.bandwidth`/`firewall`; `EncounterDef.start`/`solo`/`maxRounds`; `BattleAction` mit `item.cell`, `interact`, `weapon`; `BattleEvent` = alle `CombatEvent`-Varianten |
| dom-ui | `DialogueLine.expr` (`Expression`), `NpcDef.bio` (Beziehungsdetail) |

Neue Port-Methoden: `unequip`, `installCyberwareAt`, `removeCyberwareAt`, `perkStatus`, `characterSheet`, `knownGiftTastes`, `callCompanion`, `relation`, `whereIs`, `questMarkers(map?)`, `jobBoard`, `shopView`, `sellPrice`, `factionStandings`, `newsBulletin(filter?)`. Tests: `modules/campaign/port.test.ts`.

### Nicht übernommen (bewusst offen)
- character: Macken (`quirks`), Anrede `address` (widerspricht design.md), Charakterbaukasten und Spielstand v2 (design.md §3.1a), „perk-anfuehrer ×2“ und Spezialkampf-Perks.
- quests+economy: `JobState.streak`, `JobTemplateDef.modifiers`, `QuestStepDef.group/fail`, `JobOffer.xp/day`, `NewsDef.channel/kind`.
- explore: `foreground[].image`, `LightDef.flicker`, Spruch-Pools/Slot-Routen, `NpcPresence.arrive`, Schleichen/Hinterhalt auf der Karte.
- combat: weitere `StatusId`, `WeaponStats.damageMax`, Zusätze an `AbilityDef`/`EnemyDef`/`ArenaDef`, Schwierigkeitsgrad in der Oberfläche, Begleiterwerte nach Stufe.
- dom-ui: `LookDef.description/photo`, `DistrictDef.cityPos/color`. Sonstiges: Wetter je Tag.
- Werkzeuge: `scripts/validate_assets.mjs` und `scripts/map_tool.mjs` nehmen noch 640×360 an.

### Prüfen
- `e2e/engine.spec.ts` (Projekt `desktop`): Figur erstellen, Teststraße (Uhr läuft, Quest `test-chip` aktiv), Raven ansprechen (Check-Wahl `[Technik 6]`, Uhr steht im Dialog), Synth-Kaffee schenken, Kopfgeld an der Tafel annehmen, Kampf `test-schlaeger` starten (eine echte Aktion, dann `winBattle`; Auftrag erledigt, Gruppe weg), am Kiosk kaufen, im Unterschlupf schlafen (Tag + 1, 06:00). Screenshots: `output/qa/engine/`.
- Ohne installierte Playwright-Browser lässt sich ein vorhandenes Chromium nutzen: `PW_CHROMIUM=/Pfad/zum/Browser npx playwright test e2e/engine.spec.ts --project=desktop --workers=1` (headless, Wegwerfprofil; siehe `playwright.config.ts`).
- Kampflog (`.bui-log`) ist schmaler und hat einen leichten Grund, damit es das Raster bei 16:9 nicht überdeckt.
