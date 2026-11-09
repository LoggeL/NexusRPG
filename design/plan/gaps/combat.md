# Lücken Kampfinhalt (Ordner `game/src/content/parts/combat/`)

Stand: Akt-1-Kampfinhalt fertig. Hier steht, was world.md §8 verlangt, die Engine aber noch nicht kann, und welche Notlösung im Inhalt steckt.

## 1. Fähigkeits-IDs für andere Agenten

Begleiter (`CompanionDef.stats.abilities` = Fähigkeit 1 + 2, `heartAbilities` = ♥6 bzw. genannte Schwelle):

| Figur | Fähigkeit 1 | Fähigkeit 2 | Herz-Fähigkeit |
| --- | --- | --- | --- |
| `vega` | `vega-adlerauge` | `vega-kobra-schuss` (nach `pers-vega-adlerauge`: `vega-kobra-schuss-plus`) | `vega-wachhund` |
| `aria` | `aria-zerbersten` (gesperrt bei `aria_arm_gesperrt`) | `aria-homerun` | `aria-unkaputtbar` |
| `raven` | `raven-handschellen-trick` (nach `pers-raven-handschellen`: `raven-handschellen-trick-plus`) | `raven-lagebild` | `raven-konter` |
| `nyra` | `nyra-silent-angel` | `nyra-zentrator-umkehr` | `nyra-meeresrauschen` |
| `jimmy` | `jimmy-firewall-kuss` (Neustart) / `jimmy-chipfieber` (Patch) | `jimmy-ersatzmann` | `jimmy-comeback` |
| `dante` | `dante-nougatbomben-wurf` | `dante-heiliges-kanonenrohr` | `dante-kuschel-ablenkung` |
| `hunter` | `hunter-drinks` | `hunter-runde-aufs-haus` | `hunter-schmiere-stehen`; nach `side-thai-chi` `hunter-innere-mitte` |
| `marla-sand` | `marla-sandschleier` | `marla-wasser-teilen` | ♥8 `marla-windkundig` |
| `lio-funkel` | `lio-mutmacher-melodie` | `lio-dissonanz` | ♥8 `lio-zugabe` |
| `ripper` | `ripper-ausschlachten` | `ripper-rauchbombe` | ♥8 `ripper-kleiner-deal` |
| `barkeeper` | `barkeeper-mondschnitt` | `barkeeper-stille-wacht` | ♥10 `barkeeper-letzter-vers` |
| `wache` | `wache-schildwall` | `wache-vorschrift` | ♥10 `wache-wir-sehen-uns-nicht-wieder` |
| `alesa-zero` | `alesa-prototyp-werfen` | `alesa-kalibrieren` | ♥8 `alesa-schwarmstoerer` |
| `xion-venom` | `xion-venom-krallengriff` | `xion-venom-sicherheitsprotokoll` | ♥10 `xion-venom-kenn-ich-war-ich` |

Spielfigur (Attribut-Aktionen §8.3): `kampf-analysieren`, `kampf-schubsen`, `kampf-hechtsprung`, `kampf-schmutziger-trick`; „Ansprechen“ ist das eingebaute `kampf-einschuechtern`. Fernzugriffe (Hack-Modul): `hack-stoerimpuls`, `hack-systemlaehmung`, `hack-waffenstau`, `hack-lichter-aus`, `hack-kurzschluss`, `hack-chip-ruhe`.

Duo-Aktionen: `duo-express-zustellung`, `duo-rueckendeckung`, `duo-ruecken-an-ruecken`, `duo-die-wachhunde`, `duo-am-ende-siegt-die-liebe`, `duo-meister-und-fan`, `duo-der-plan`, `duo-funkstille`, `duo-abrissbirne`, `duo-lagerfeuerlied`.

Wer die Begleiterwerte baut: Waffe in `stats.weapon` muss zur Fähigkeitsart passen (Nahkampf-Fähigkeit ↔ Nahkampfwaffe), sonst zählt der Waffenschaden nicht mit.

## 2. Engine-Lücken (Vorschläge)

1. **Duo-Aktionen freischalten** (wichtig für Vex × Aria): Es gibt keinen Weg, der Spielfigur eine Fähigkeit nur dann zu geben, wenn eine bestimmte Begleiterin in der Party ist und Herzen/Flags passen. Vorschlag: `CompanionDef.duo?: { ability; hearts; when?: Condition; holder: 'player' | 'companion' }[]`, ausgewertet in `partyFromCampaign`. Bedingungen laut world.md §4.7:
   - `duo-express-zustellung`: `{ playerIs: 'vex' }`, Aria in der Party, Aria ♥6, nicht `aria_romanze_streit`, nicht `aria_krach`; auch mit `aria_arm_gesperrt`. Bei der Spielfigur (nutzt ihre Fernwaffe). Gewünschte Vollwirkung: Aria-Homerun 3 Felder, Vex Hechtsprung 2 Felder, Schuss +20, „Markiert“, „Betäubt“ bei Aufprall an Hindernis/Rand; Zeilen „Paket für dich!“ – „Zugestellt.“ (gegen `zerleger`: „Rücksendung an Ripper!“ – „Porto zahlt er. Ich zahl schon Raten.“). Heute: +20 Treffer, +3 Schaden, „Markiert“.
   - `duo-rueckendeckung`: wie oben plus `vexaria_funkmast`. Eigentlich Passiv (Aria fängt 1× pro Kampf einen Treffer auf Vex ab, wenn angrenzend); heute aktive Fähigkeit bei Aria („Geschützt“ 2 Runden auf Vex).
   - `duo-ruecken-an-ruecken`: `aria_romanze_zusammen` und `kabelbrand-pass`, Aria angrenzend. Eigentlich Arias „Unkaputtbar“ für die Spielfigur; heute aktive Selbstheilung, 1×.
   - Übrige Duos: beide Begleiter in der Party, Spielfigur mit beiden ♥6.
   - Duo-Kosten „2 AP von einem, der andere behält seinen Zug“ geht schon so (Fähigkeit hat 2 AP).
2. **Zustände**: Die Engine kennt nur `gehackt`, `betaeubt`, `brennt`, `markiert`, `geschuetzt`, `blutet`. Ersatz im Inhalt: Geblendet/Verwirrt/Verunsichert → „Betäubt“ mit Chance; Ermutigt/Getarnt → „Geschützt“; Verlangsamt/Nass/Kurzschluss/Unterdrückt → weggelassen oder „Markiert“. Vorschlag: `StatusId` um `verlangsamt`, `geblendet`, `nass`, `kurzschluss`, `unterdrueckt`, `verwirrt`, `ermutigt`, `getarnt`, `verunsichert`, `gechippt`, `diva`, `zuckerschock` erweitern; dann die Fähigkeiten in `abilities.ts` umstellen (Beschreibungen sagen schon, was gemeint ist).
3. **Mehrere Zustände je Fähigkeit** (Express-Zustellung: Markiert + Betäubt; Flammenarm: Schaden + Brennt + Feld). Vorschlag `status` als Liste.
4. **Beschwören/Verstärkung**: Funkruf (`quantum-wachmann`, Xion), Königlicher Befehl (Nagbert), Funzel ruft Rostzähne, Brut (Königin), Kontroll-Knoten ruft Partygäste, Alarm der Späherdrohne. Heute stehen die Verstärkungen von Anfang an im Feld (z. B. Nagbert + 4 Ratten). Vorschlag: `EnemyDef.summon?: { every: number; enemy: EnemyId; count: number; max: number; unlessStatus?: StatusId }`.
5. **Diebstahl**: Abziehen (20 Cr), Ausräumen (Verbrauchsgegenstand), Ausschlachten (Cyberware-Bonus bis Kampfende), Stibitzen (Beute), „Ich teile nicht gerne“ (positive Zustände). Heute nur Schaden/Zustand.
6. **Aufgeben/Fliehen bei LP-Anteil**: Dexter 50 %, Raven (Markt) 40 %, Ripper 30 %, Raven gechippt 20 %, Blade 15 %, Taschendieb nach 2 Runden. Heute: Phase mit Zeile + KI `vorsichtig` (flieht unter 25 % LP, wenn Moral gesetzt ist). Vorschlag: `phases[].leave?: 'flee' | 'surrender'` und `EnemyDef.fleeAfterRounds`.
7. **Passive** (Unkaputtbar bei 0 LP, Wachhund doppelte Überwachung, Konter, Comeback, Schmiere stehen, Rudel +5 je Rostzahn, Hetzjagd Bewegung 6, Flink −10 gegen Fernkampf, Kanalmief, Mobile Deckung, Veraltet −1 BB/Nass = Kurzschluss, Glanz, Choreografie, Höflich „Master“). Heute als aktive Fähigkeiten mit verwandter Wirkung. Vorschlag: `AbilityDef.passive` mit Auslöser (`onDown`, `onAttacked`, `aura`).
8. **Bewegung durch Fähigkeiten**: Rückstoß (Homerun 3, Baseballschläger 1), Schubsen, Böe, Greifarm (heranziehen), Putzen (2 Felder), Hechtsprung (2 Felder in Deckung), Sprungangriff (Satz 3). Heute: Reichweite statt Satz, Rückstoß fehlt.
9. **Hacks**: Firewall, Bandbreite, „Hacks ignorieren Panzerung“ und „nur mit Hacks verwundbar“ (`sicherheitsprogramm`) gibt es nicht. Firewall steckt im Inhalt als Technik (FW = 2 + Technik/2). Jimmy endet laut world.md auch durch Hack (4 BB).
10. **Schadensspannen**: Engine rechnet festen Schaden; `_foe.ts` nimmt die Mitte der Spanne aus world.md minus Attribut.
11. **KI-Profile** `schwarm` und `gesteuert` fehlen; Robohunde, Staubfalken, Rattenschwarm und Gechippte laufen als `aggressiv`.
12. **Verbündete NPCs im Kampf**: Prolog `enc-prolog-drohne` – Blade hilft mit dem Goldknauf-Stock. Nur die Schutzperson (`rescue`) ist möglich. Vorschlag `EncounterDef.allies?: { npc | enemy; ai }[]`.
13. **Bossmechaniken**: Nagbert P2 „alle Nass“, Strom auf Nass; Wachkoloss Überhitzung (Pz 0 alle 3 Runden); Zündholz Löschtanks; Kern unverwundbar, solange ein Knoten steht; Blade Charmeur (Seitenwechsel), Gleiter-Countdown; Raven „zögert“ neben Dante. Heute nur Phasen mit Zeilen und neuen Fähigkeiten.
14. **Fahndung** (§10.3) hat weder Bedingung noch Effekt. Konvention im Inhalt: `{ flag: 'fahndung_1' | 'fahndung_2' | 'fahndung_3' }` heißt „Fahndung ≥ n“ (Zufallsbegegnungen Stufenplatz, Glasarkaden, Eisenhof). Fahndung +1 nach `enc-gasse-pfeffer`, `enc-penthouse-drohnen` und Kämpfen gegen `ordnungshueter` vor Zeugen muss die Quest bzw. das künftige System setzen.
15. **Zufallsbegegnungen**: `EncounterDef.random` wird von keiner Engine-Stelle gelesen. Gebraucht: höchstens eine je Zonenbesuch, sichtbar als Gruppe auf der Karte (umgehbar, Sprite = erster Gegner `<id>-walk`), `when` beachten. Weil `random.chance` eine Zahl ist, gibt es je Eintrag und Tageszeit eine Begegnung `enc-zufall-<zone>-<eintrag>-<tageszeit>` mit anteiliger Chance. Schöner wäre `random.chanceByTime` plus Gewicht.
16. **Nicht-tödlich/K.O.-Kosten**: Gechippte „befreien statt besiegen“, K.O. kostet Ruf `unterstadt` −3; Jimmy schläft bei 0 LP. Heute normale K.O.s.
17. **Begleiter +5 Beziehungspunkte je Sieg**, XP-Regel 10 × Stufe sind über `EnemyDef.xp` gesetzt (Bosse 30 × Stufe).

## 3. Inhalt, der noch fehlt

- Feste Begegnungen Akt 2–3 (`enc-labor-xion`, `enc-kanal-xion-ripper`, `enc-ring-xion`, `enc-altlager-zuendholz`, `enc-markt-betreuer`, `enc-bruecke-patrouille`, `enc-oednis-staubfalken`, `enc-wrackburg-kraehe`, `enc-duenen-koenigin`, `enc-ruine-wachkoloss`, `enc-hafen-funzel`, `enc-campus-patrouille`, `enc-labor-blade-vorspiel`, `enc-turm-raven`, `enc-turm-xion`, `enc-kern-nexus`, `enc-dach-blade`, `enc-strand-staubfalken`): Gegner und Bosse stehen bereit, Begegnungen folgen mit den Arenen `arena-rohre`, `arena-dach`, `arena-duenen`, `arena-partysaal`, `arena-serverkern`.
- Zufallstabellen der Akt-2/3-Zonen stehen in `random.ts` mit `later: true` und werden erzeugt, sobald Karten und Arenen da sind (Flag entfernen).
- `enc-kopfgeld-staubbaron-broesel` wartet auf `arena-duenen`.
- Arena-Variante „Rippers Praxis“ (heute `arena-labor`); die Alleingang-Fassung nutzt das Terminalziel auf Feld (10, 4) als Schublade mit dem Code.
