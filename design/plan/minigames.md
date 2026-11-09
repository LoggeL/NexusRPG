# Minispiele – Stand Teil 2

Code: `game/src/presentation/minigames/` (Registry `index.ts`, Host `host.ts`, je Spiel eine Datei, Stil `minigames.css`).
Ablauf: Effekt `minigame` → Anfrage `{ minigame: MinigameRequest }` → `Director.minigame()` → `playMinigame()` →
Einleitung (Steuerung, Attribut-Vorteile, Schwierigkeit) → Countdown → Spiel → Ergebnis (5–7 s oder „Weiter“) →
Zusatzeffekte (`extra`) → `campaign.finishMinigame(request, won)`.

## Aufruf aus Inhalten

```ts
{ minigame: 'akt-hacken', level: 3, key: 'terminal-rostkai-tor', label: 'Tor-Terminal knacken',
  win: [{ setFlag: 'rostkai-tor-offen' }, { credits: 30 }],
  lose: [{ message: 'Das Terminal sperrt dich aus.' }] }
```

- `level` 1–5 (Standard 2). `key` eindeutig je Stelle; Bedingung danach `{ wonMinigame: key }` (Standard-Key = Minispiel-ID).
- `label` ersetzt den Titel im Overlay.
- Abbrechen (Esc zweimal, ✕ zweimal, „Lieber nicht“ in der Einleitung) zählt als **verloren** → `lose`.
- Unbekannte IDs: Platzhalter, zählt als gewonnen (Toast), wie bisher.
- Belohnungen gehören in `win`/`lose`. Zusatzeffekte aus dem Spiel selbst gibt es nur, wo der Inhalt das Ergebnis nicht kennen kann:
  Trinkgeld (`akt-barschicht`), verbrauchter Dietrich-Chip (`akt-schloss`), Flohmarkt-Umsatz, Angel- und Floß-Funde, Taubenpost-Herzen (Tabelle unten).

## Fertige IDs

| ID | Spiel | Dauer | Stufe wirkt auf | Attribute / Gegenstände | Zusatzeffekte |
| --- | --- | --- | --- | --- | --- |
| `akt-hacken` | Leitungen drehen, bis Quelle (links) und Zugang (rechts) verbunden sind | Zeitlimit 70–46 s | Raster 4×4 … 7×5; ab 4 gesperrte Firewall-Kacheln; 5: ICE dreht alle 11 s eine Kachel zurück | Technik: +0–25 s; `arme-datenbuchse` (Cyberware) +1 Auto-Zug; Technik 7+: +1 Auto-Zug | – |
| `akt-schloss` | Stifte wippen, im Fenster der Scherlinie setzen | 45–60 s | 3–7 Stifte, schmaleres Fenster, schneller; ab 4 fällt bei Fehler ein Stift zurück | Reflexe: Fenster bis +70 %, Reflexe 7+ ein Dietrich mehr (3 → 4); `dietrich-chip` öffnet Stufe 1–3 sofort | `{ take: 'dietrich-chip' }` bei Einsatz |
| `akt-eins` | „Eins!“ gegen Kralle und Lucky Lu (5 Karten, Aussetzen/Richtungswechsel/+2/Farbwahl/+4, „Eins!“-Ruf, „Erwischt!“) | 1–3 min | KI-Strategie, KI vergisst seltener „Eins!“ | Straße 5+: eine Karte des nächsten Gegners sichtbar, 8+: bei beiden; Ausstrahlung 5+: 1× bluffen (8+: 2×) statt ziehen | – |
| `akt-armdruecken` | Im Takt ziehen, bei „Er holt Luft!“ halten, Ausdauer | bis 45 s (sonst entscheidet der Vorsprung) | Gegnerdruck, Ruck-Stärke, Takt; Gegner Spargel-Sepp … Brecher-Brigitte | Körper: Kraft je Zug, Ausdauer, Taktfenster | – |
| `akt-tanz` | 4-Spur-Pfeil-Rhythmus (← ↓ ↑ →) | 35–47 s | BPM 96–136, Achtel ab 2, Doppelpfeile ab 3; nötige Wertung 50–68 % | Reflexe: Trefferfenster bis +60 % | – |
| `akt-karaoke` | Drei Tonhöhen, Balken über die Mikrofonlinie singen (halten) | ~45–60 s | BPM 84–116, mehr Tonsprünge; nötige Wertung 45–65 % | Ausstrahlung: Fenster bis +100 ms; 7+: Nachbarhöhe zählt halb | – |
| `akt-barschicht` | Gäste-Bestellungen mixen (8 Zutaten, Reihenfolge egal), servieren | 60 s | 5–9 Drinks nötig, weniger Geduld, mehr Rezepte; der Richter bestellt einmal „Was Unauffälliges“ (Wasser, doppeltes Trinkgeld) | Reflexe: Geduld bis +50 %; Ausstrahlung: Trinkgeld bis +100 % | `{ credits: <Trinkgeld> }` immer, auch bei Niederlage |
| `akt-keksalarm` | Fallende Bleche fangen, verkohlte meiden, Drei-Sekunden-Regel am Boden | 45 s | 8–16 Kekse nötig, 4/5 Rutschen, schneller, mehr verkohlte | Reflexe: breiteres Blech, langsamere Bleche | – |
| `akt-huetchenspiel` | Kugel verfolgen, 2 von 3 Runden | ~40–70 s | 3/4 Hütchen, mehr und schnellere Tausche; ab 3 Ärmeltrick | Reflexe: langsamer; `gc-151` bestanden oder Reflexe 7+: Trick sichtbar, „Ärmel!“ gewinnt die Runde | – |

### Teil 2

| ID | Spiel | Dauer | Stufe wirkt auf | Attribute / Gegenstände | Zusatzeffekte |
| --- | --- | --- | --- | --- | --- |
| `akt-angeln` | Auswerfen, Biss abwarten, anschlagen, Fisch im Kescherfenster halten (Halten hebt das Fenster) | 70–90 s | 2–4 Fänge, kleineres Fenster, kürzeres Bissfenster, zappeligere Fische | Reflexe: Fenster bis +40 %, Bissfenster bis +60 %; `angel-profi` (Gegenstand) +30 % seltene Fänge; `magnetangel`: Metall; nachts Leuchtalgen-Qualle | `{ give }` je Schrott-Fang: `rostige-dose`, `treibholz`, `glitzerschrott` |
| `akt-schiessstand` | Blechdosen an Kranhaken abschießen; Golddose +2, Falkes Kaffeekanne −2 | 45–50 s, begrenzte Munition | 6–14 Treffer, schneller, mehr Dosen, mehr Kannen | Reflexe: Zittern −70 %, Trefferzone +40 %, 7+: +2 Schuss; Vega in der Party kommentiert (`companion`) | – |
| `akt-drohnenrennen` | Seitenansicht durch den Kranparcours, Masten/Tore/Möwen meiden, Ringe = Schub; gegen Turbo-Tilda + 2 | ~45 s | Tildas Tempo, Hindernisdichte, engere Tore; Stufe 1–3 Platz 1–2, ab 4 nur Sieg | Reflexe: Steuerung +50 %; Technik: Spitze +10 %, Schub +60 % | – |
| `akt-kochen` | 2–3 Gerichte aus Schritten: Schnippeln (tippen), Rühren (links/rechts), Hitze (Nadel stoppen), Zutat wählen | 50–130 s | Schritte je Gericht, Nadeltempo, grüne Zone, Wertung 50–70 %; ab 3 sagt Babette die Zutat nur einmal | – (world.md) | – |
| `akt-werkbank` | Teile aus der Kiste suchen, Schrauben im Takt, Lötstelle auf Temperatur; Fehler fressen Material | 80–95 s | weniger Material, mehr Teile/Schrauben/Lötstellen, schmaleres Band | Technik: bis +3 Material, Schraubzone +50 %, Lötkolben langsamer | – |
| `akt-ventil` | Ventile (zu/halb/auf) so stellen, dass alle Druckanzeigen auf der Marke stehen | 90–130 s | 3–6 Ventile, 3–5 Anzeigen, ab 3 drei Stellungen, ab 4 doppelt wirkende Leitungen | Technik 5+: 1 Hinweis, 8+: 2; Technik 7+: Rohrplan sichtbar | – |
| `akt-floss` | Kanal runter steuern, Tonnen/Strudel/Rohre meiden, Treibgut sammeln, am Rechen bremsen und anlegen | ~45–55 s | Strömung, Dichte, schmalere Anlegestelle | Körper: Bremskraft +50 %, 7+: +1 Rumpf; Reflexe: Steuern +50 % | `{ give: 'treibholz' }` (max. 2), `{ give: 'schrott-ersatzteil' }` (max. 3), außer bei zerlegtem Floß |
| `akt-fotoautomat` | Passfoto-Kacheln drehen, Hologramm im Farbton stempeln, Prüfziffer (Quersumme) wählen | 70–105 s | 3×3/4×4, 1–3 Stempel, schneller Farbwechsel, längere Nummer, weniger Fehler | Technik: +20 s, Fenster +60 %; 6+: richtige Kacheln leuchten; 8+: Prüfziffer vorgerechnet | – |
| `akt-graffiti` | Motiv wählen (Schrottkrone/Faust/Welle), Schablone aussprühen, Dose schütteln, Tropfnasen meiden, bei Kessels Lampe stillhalten | 55–60 s | Wertung 55–80; ab 2 Streife, ab 4 zweimal erwischt = verloren | Ausstrahlung: Sina gibt bis +12 Stilpunkte | – |
| `akt-pixelpalast` | Auswahl: „Drohnenjagd“ (Treffer-Raster, Numpad), „Neon-Schlange“, „Chipstapler“ | 35–70 s | Ziele, Tempo, Höhe | Reflexe: bis 30 % gemütlicher | – |
| `akt-flohmarkt` | Feilschen mit 5–7 Kunden: Preis nennen, Gegenangebot annehmen, Geduld beachten; Tagesziel | 100–120 s | Ziel 85–125 % des Warenwerts, weniger Geduld | Straße: Kundschaft zahlt bis +25 %, 5+: Schmerzgrenze sichtbar, 7+: +1 Geduld; Sybella (`he-sybella-chrome-8` als Flag oder gesehen): +5 % | `{ credits: <Umsatz> }` immer |
| `akt-sternegucken` | Sternbilder (Kran, Ratte, Gitarre, Auge, Feuertreppe) nachzeichnen; Vega erzählt Lore | 90–120 s | 2/3 Sternbilder, mehr Täuschsterne, kürzere Vorlage, weniger Fehler | – (world.md) | – |
| `akt-fundbuero` | Fundstück → Person zuordnen (14 Paare im Pool, Hinweise in den Beschreibungen) | 80–120 s | 4–8 Paare, weniger Fehlgriffe | Straße 4+/6+/8+: 1/2/3 Hinweise „wo man suchen muss“ | – |
| `akt-suppenkueche` | Schlange rückt im Takt vor; Kelle halten, bei der gewünschten Menge loslassen; im Takt = Extrapunkt | 45–60 s | Takt, Füllband, Geduld, 8–12 Leute | – (world.md) | – |
| `akt-fernsehen` | Hinter Collin im Bild bleiben, bei LIVE winken, bei ERNST stillhalten, nicht überdrehen; ab 60 % Ziel das Kurzinterview (2 Fragen) | 35 s + Interview | Ziel 24–48, schmalerer Bildausschnitt, schnellere Kamera | Ausstrahlung: Ausschnitt +40 %, Winken +60 %, 7+: glänzende Interviewantwort | – |
| `akt-taubenpost` | Keine Mechanik: bekannten Empfänger (`met`) wählen, Ton wählen (herzlich/frech, flirtig nur bei `{ romance }`), Brief fliegt | – | – | Vex → Aria hat einen eigenen Flirtbrief | `{ relation: <id>, delta: 10 }`, `{ setFlag: 'taubenpost-an-<id>' }`; Tagessperre macht der Inhalt |
| `akt-dachrennen` (neu) | Dachrennen gegen Aria bis zum Taubenschlag: springen (halten = weiter), ducken; **Vex** nimmt an „der Lücke“ automatisch die Feuertreppe | ~45 s | Arias Tempo, Hindernisdichte, breitere Lücken | Reflexe: verzeiht mehr; `dachlaeuferin`: schneller, höher; `{ romance: 'aria' }`: flirtige Sprüche | – |

`akt-dachrennen` gehört zur Romanze Vex × Aria (`rom-vexaria-luecke`, danach Fr/Sa N wiederholbar). Gleichstand zählt als Sieg
(Vegas Fotofinish-Zeile). Mit `{ playerIs: 'vex' }` endet es mit dem Wäscheleinen-Gag aus world.md.
Empfohlene Stufe: Station 2, Wiederholungen 3.

Empfohlene Stufen (alle): Erstkontakt 1–2, normale Stellen 2–3, Turniere/Hauptweg-Hürden 4, Bosse/Finale 5.

## Steuerung (überall)

Maus und Touch über die Spielfläche (Knöpfe nehmen keinen Fokus), Tastatur über Rohtasten
(Pfeile/WASD, Leertaste/Enter/E, Ziffern). Esc zweimal = aufgeben. Bei „reduzierte Bewegung“ bleiben spielentscheidende
Bewegungen (Hütchen) animiert.

## Erweitern

```ts
import { registerMinigame } from '../presentation/minigames';
registerMinigame('akt-angeln', { title, blurb, controls, bonuses(ctx), async run(host, ctx) { …; return won; } });
```
oder direkt in `MINIGAMES` (`index.ts`) eintragen. `host` liefert `stage`, `frame()`, `wait()`, `countdown()`, `onKey()`,
`pop()`, `setScore()/setInfo()`, `summary()`, `extra()`; `ctx` liefert `level`, `attr()`, `edge()` (0 bei 3, 1 bei 10),
`has(condition)`, `checkOk(gc-…)`, `sfx()`.

Gemeinsame Bausteine für neue Spiele: `kit.ts` (`speaker()` Sprechblase, `relPoint()`, `ending()`, `meter()`, `choose()` Auswahl mit
Maus/Touch/Ziffern/Pfeilen, `holdInput()` Gedrückthalten), Stil in `minigames2.css` (Präfix je Spiel, gemeinsame Klassen `m2-*`).

Noch offen: `akt-schrottbot-rennen`, `akt-gaertnern`, `akt-hochstapeln`, `akt-wrackrennen`, `akt-radio-rost`, `akt-strandlauf`
(alle „A1 nein“) – laufen als Platzhalter (gewonnen). Lücken: `design/plan/gaps/minigames.md`.
