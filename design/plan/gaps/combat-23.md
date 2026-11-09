# Kampfinhalt Akt 2, Akt 3, Nachspiel (Ordner `game/src/content/parts/combat-23/`)

Stand: alle festen Begegnungen aus world.md §5.3, §5.4, §6.3, §6.4, §6.5 (ab Akt 2), §6.7 (Stufe 3) und §8.7 plus die
Zufallstabellen der neuen Zonen. Kampfprüfung (`validateCombatContent`) und Autopilot-Durchlauf jeder Begegnung grün.
Offene Inhaltsverweise sind nur fremde IDs, die andere Agenten gerade bauen: Karten der Akt-2/3-Zonen,
`side-oednis-frieden`, `side-kraehes-ehre`, Sprecher `kraehe` und `glasblaeserin`.

ersetzt Platzhalter: keine (nur Begegnungen und Gegner).

## 1. Begegnungen für die Quest-Agenten

Alle starten per `{ battle: '<id>' }`, Fortschritt per `{ won: '<id>' }`. Belohnung hier = Kampfbonus; Quest-Items
(z. B. `arme-venomkralle`, `arme-zuendholz-kern`, `kraehenfeder`), Ruf und Herzen vergibt die Quest.
Wo eine Weiche den Kampf verändert, gibt es eine eigene Fassung – die Quest wählt per Bedingung die passende ID
(Effekt `battle` kennt keine Parameter).

| Quest | Begegnung (Standard) | Fassungen | Ziel |
| --- | --- | --- | --- |
| `main-2-bruch` drinnen | `enc-labor-xion` | – | 5 Runden überleben |
| `main-2-bruch` Brücke | `enc-bruch-overwatch` (neu) | – | 4 Runden halten (Raven + Vega) |
| `main-2-kanal` | `enc-kanal-xion-ripper` | `…-fluchtweg` (`prep-fluchtweg` erledigt: keine Verstärkung), `…-ueberrumpelt` (nach `gc-33`) | alle besiegen, Aria (Schutzperson auf [1,3]) darf nicht fallen |
| `main-3-einlass` | `enc-einlass-kontrolle` (neu) | – | alle besiegen; onWin `{ wanted: 3 }` |
| `main-3-labor` | `enc-labor-blade-vorspiel` | `enc-labor-blade-hinterhalt` (neu: Peilsender entdeckt und gewarnt) | 3 Runden überleben / alle besiegen (überrumpelt) |
| `main-3-gedankenkontrolle` | `enc-turm-raven` | `enc-turm-raven-dante` (Bedingung `{ companion: 'dante' }`, „Raven zögert“) | alle besiegen |
| `main-3-gedankenkontrolle` / Finale | `enc-turm-xion` | – (nur wenn Xion nicht fehlt) | alle besiegen |
| `main-3-nexus` | `enc-kern-nexus` (Kern + 3 Knoten + 1 Venom-Garde) | `…-ohne-garde` (Xion fehlt: 1 gechippter Gast statt Garde), `…-fx60`, `…-fx60-ohne-garde` (FX-60 hilft: Logik-Knoten 35 LP), `…-herz` ([Nexus ♥6], keine Knoten, voller `boss-nexus-kern`) | alle besiegen |
| `main-3-blade` | `enc-dach-blade` | `enc-dach-blade-allein` (nach `gc-48`: ohne Garde und Charmeur, Phase 2 geschwächt) | alle besiegen |
| `side-alesas-zuendholz` | `enc-altlager-patrouille` (neu, Zaun), `enc-altlager-zuendholz` | `enc-altlager-zuendholz-loeschtank` (Tank geöffnet: Zündholz nass, Pz 2) | alle besiegen |
| `side-ki-fluestern` | `enc-markt-betreuer` | – | alle besiegen |
| `pers-nyra-silent-angel` | `enc-bruecke-patrouille` | – | alle besiegen |
| `pers-delya-quelle` | `enc-kanal-schlafwandler` (neu) | – | Schutzperson `kanal-schlafwandler` überlebt |
| `pers-pim-kleine-schrift`, Leutnant Nadel, Campus | `enc-campus-patrouille` | – | alle besiegen |
| `side-hartlaufs-rache` | `enc-ruine-wachkoloss` | – | alle besiegen |
| `side-rostzaehne-ende` | `enc-rostzahn-lager` (neu, „Lager finden“), `enc-hafen-funzel` | – | alle besiegen |
| `side-xions-kralle` | `enc-ring-xion` | – | Duell (solo) |
| `side-weg-zum-meer` | `enc-oednis-staubfalken` | – | alle besiegen (Staubfalken ergeben sich) |
| `side-kraehes-ehre` | `enc-wrackburg-kraehe` (Krähe + 2 Falken) | `enc-wrackburg-kraehe-duell` (solo, Krähe 80 LP) | alle besiegen |
| `side-glasherz` | `enc-duenen-koenigin` | – | alle besiegen |
| `side-verlorene-frequenz` | `enc-funkturm-windraeder` (neu) | – | alle besiegen |
| `kopfgeld-staubbaron-broesel` | `enc-kopfgeld-staubbaron-broesel` | – | alle besiegen (Auftragsvorlage kann `encounter` darauf setzen) |
| `side-strandclub` | `enc-strand-staubfalken` | – | alle besiegen |
| Nachspiel Datentunnel | `enc-datentunnel-splitter` (neu, fest) | Zufall `enc-zufall-datentunnel-splitter` mit Flag `epilog` | alle besiegen |
| `pers-xion-umschulung` | `enc-tuer-xion-probeabend` (neu) | – | alle besiegen |
| `pers-hunter-reiner-tisch` | `enc-hv-reiner-tisch` (neu) | – | alle besiegen (Weg ohne Kampf: `[Ausstrahlung 5]`) |

Schon vorhanden und weiter gültig: `enc-praxis-ripper*` (parts/combat, Aria-Strang), `enc-kopfgeld-blech-schwestern`,
`enc-kopfgeld-faxfaelscher`, `enc-kopfgeld-leutnant-nadel` (parts/combat/encounters-jobs.ts).

Neue Gegner (enemies.ts): `boss-ripper-kanal`, `venom-rekrut`, `boss-zuendholz-nass`, `boss-kraehe-duell`,
`kanal-schlafwandler` (nur als Schutzperson), `boss-raven-zoegernd`, `boss-blade-allein`, `nexus-knoten-logik-fx60`,
`quantum-eventschutz`, `staubfalke-strandwache`, `staubfalke-strandvogt`, `hv-rempler`, `boss-nexus-kern-finale`
(Kern für die Knoten-Fassungen: schießt in Phase 1 nur leise, ab 50 % Firewall-Welle).

## 2. Zufallsbegegnungen

`random.ts` erzeugt die Tabellen für `chrome-boulevard`, `quantum-campus`, `himmelsgarten`, `pumpwerk-sieben`,
`datentunnel` (Arena `arena-rohre-datentunnel`), `staubstrasse`, `aussiedlerhof`, `funkturm-ruine`, `glasduenen`
unter denselben IDs wie die `later`-Zonen in `parts/combat/random.ts`. **Integration:** die `later`-Einträge dort
können gelöscht werden (sie erzeugen nichts; entfernt jemand nur das `later`, gibt es doppelte IDs).
Staubfalken greifen nicht mehr an nach `side-oednis-frieden` **oder** `side-kraehes-ehre` (freies Geleit).
Nachspiel-Bedingung: Flag `epilog` (wie bei den Passantensprüchen) – falls das Nachspiel anders markiert wird, in
`random.ts` die Konstante `epilog` anpassen. Akt-1-Zonen mit Akt-2-Einträgen (Neon-Gasse, Rohrsiedlung, Stufenplatz)
stehen schon in parts/combat.

## 3. Engine-Lücken (Vorschläge)

1. **Begegnungs-Modifikatoren statt Fassungen:** `{ battle, variant?: { start?, without?: EnemyId[], add?: … } }` oder
   `EncounterDef.variants: { when, enemies?, start? }[]`. Heute je Weiche eine eigene ID (Kern hat fünf).
2. **„Überleben ODER Ausgang“** (`enc-labor-xion`): `BattleObjective` kennt nur eins. Heute: 5 Runden überleben.
3. **Aufgabe bei LP-Anteil** (Blade 15 %, Raven 20 %, Xion-Rückzug 50 %): `phases[].leave: 'surrender' | 'flee'`.
   Heute: Phasenzeile, dann K.O.
4. **Kern unverwundbar, solange ein Knoten steht; Firewall-Welle; Terminal 4 Runden halten in P3:** braucht
   `EnemyDef.invulnerableWhile` und Mehrfachziele. Heute: Tipp im Intro, normaler Kampf.
5. **Gesteuert/Gechippt**: Status `gechippt`, KI `gesteuert`, „befreien statt besiegen“ (K.O. kostet Ruf `unterstadt` −3),
   Chip-Ruhe 2 Runden. Für die Spielfigur „2 Runden gesteuert“ nach dem Chip (`main-3-gedankenkontrolle`):
   Spielfigur als KI-Einheit für N Runden (`EncounterDef.playerControlled?: number`). Heute: erzählt.
6. **„Raven zögert“** (1 AP weniger jede zweite Runde neben Dante): heute eigene, schwächere Fassung `boss-raven-zoegernd`.
7. **Bewusstlose tragen** (Aria im Pumpwerk): heute Schutzperson, die sich bewegt. Vorschlag `rescue.immobile`.
8. **Verstärkung per Funkruf** (Xion, Wachleute, Funzel alle 3 Runden, Kontroll-Knoten, Königin-Brut): weiterhin von
   Anfang an im Feld (siehe gaps-done „bewusst offen“).
9. **Konter `gc-96`** (Kralle 2 Runden weg) und **`dienstplan-2079`** im Ring: braucht zeitweises Entfernen einer
   Gegnerfähigkeit bzw. Gesprächsaktionen mit Gegenstand. Heute nur außerhalb des Kampfs lösbar.
10. **Charmeur** (Seitenwechsel) und **Gleiter-Countdown** bei Blade: weiterhin nur Phasen und Zeilen.

## 4. Balance (Autopilot-Probe, je 6 Seeds, nicht als Test eingecheckt)

- Akt 2 mit Stufe 5 (Aria + Nyra): alles gewinnbar; `enc-kanal-xion-ripper` 4/6, `enc-ring-xion` (solo) 0/6 –
  das Duell ist für Stufe 7–8 nach dem Training gedacht (Stufe 8: 4/6).
- Akt 2 mit Stufe 8 (Raven + Vega): alles 6/6, Bosse 6–10 Runden.
- Akt 3 mit Stufe 10–13: Party-Kämpfe und Blade 6/6 (Blade 12–20 Runden). **Kern** 0–4/6 je nach Party – die
  Knoten (`nexus-knoten-kontrolle-befehl` 40 % Gehackt, `nexus-knoten-stimme-vertraut` 50 % Betäubt, in parts/combat)
  sperren schwache Begleiter (Dante) gern aus. Das ist der schwerste Kampf des Spiels und hat viele Hilfen
  (FX-60, Herz-Fassung, `gc-47`, Story-Modus). Wird es zu hart: Chance der beiden Knotenfähigkeiten senken.
