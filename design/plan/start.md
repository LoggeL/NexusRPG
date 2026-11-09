# Startablauf (Hauptstrang Teil 1, quest-main-a)

Gewünschte Werte für `game/src/content/world.ts`. Der Integrationsagent übernimmt sie; alle IDs existieren in
`content/parts/quest-main-a/*` bzw. in den Zonenpaketen.

## Ablauf

1. Titel → Charaktererstellung (Baukasten oder „Als Vex spielen“).
2. `START.cutscene = 'intro-noxius'`: Noxius 2086, „Diese Geschichte fängt nicht mit dir an“, Hinweis „Prolog: Du spielst Raven“.
3. Erkundung im `digitech-areal` (Hintergrund „damals“ bis `prolog_done`), Einstieg `prolog-start`, 06:00 Uhr.
   Quest `main-0-digitech` startet automatisch (`notFlag prolog_done`); Funk-Dialog `prolog-funk` per onEnter.
4. Ende des Prologs (Cutscene `prolog-verrat`) setzt `prolog_done` und reist nach `bahnhof-mitte#start` (0 Minuten).
5. Am Bahnhof stellt eine onEnter-Treppe die Uhr auf 16:30 (Tag 1, Montag), dann Cutscene `main-1-ankunft-intro`
   (Hunters Nachricht `ph-hunter-18-uhr`) und Dialog `main-1-ankunft-abzieher`. Quest `main-1-ankunft` startet über `prolog_done`.

Die Prolog-Uhr startet bewusst um 06:00: Es gibt keinen Effekt „Uhr stellen“, nur `advanceTime`. Die Treppe stellt
von jeder Uhrzeit zwischen 06:00 und 16:30 auf 16:30–16:45 vor. Bei 16:30 als Startzeit wäre der Prolog (8–12 Minuten
Echtzeit ≈ 2–4 Spielstunden Laufen) schon über Hunters 18-Uhr-Frist.

## Werte

```ts
export const START: GameContent['start'] = {
  map: 'digitech-areal',
  entry: 'prolog-start',
  cutscene: 'intro-noxius',
  minutes: 360,          // 06:00 – siehe oben; die Ankunft am Bahnhof springt auf 16:30
  // credits/items: keine; Startgeld und -gegenstände kommen aus der Herkunft bzw. aus dem Vex-Preset
};

export const HOME: GameContent['home'] = {
  map: 'crew-quartier',
  entry: 'aufwachen',
  collapseNotes: [
    'Zettel von Captain Kuschel: „Schlaf ist auch ein Plan. – C. K.“',
    'Zettel von Captain Kuschel: „Hab dich heimgeschleppt. Bezahlung in Keksen. – C. K.“',
    'Zettel von Captain Kuschel: „Du schnarchst. Dante hat’s aufgenommen. Ich hab’s gelöscht. Fast. – C. K.“',
  ],
};

// Akt-Start für ?act=1 und den Debug-Warp: Prolog übersprungen, Ankunft am Bahnhof (Uhr springt dort auf 16:30).
export const ACT_STARTS: GameContent['actStarts'] = {
  1: {
    map: 'bahnhof-mitte', entry: 'start',
    flags: ['prolog_done', 'prolog_raven_misstrauisch', 'prolog_tuer_offen', 'prolog_geschlichen'],
    quests: { 'main-0-digitech': 'done' },
    seen: ['enter:digitech-areal:prolog-funk'],
    visited: ['digitech-areal', 'digitech-tresor'],
  },
  // 2 und 3: Sache von quest-main-b / Integration.
};
```

## Hinweise für die Integration

- Prolog-Sicherheitsnetz: Wer im Prolog gegen die Drohne verliert (Niederlage → `HOME`), landet per onEnter von
  `crew-quartier` wieder im `digitech-areal#prolog-start`. Gleiches für `stufenplatz` (der Bauzaun ist im Prolog
  ohnehin gesperrt). Bedingung: `notFlag prolog_done` und der Funk-Dialog wurde gesehen, also nicht bei `?map=`-Sprüngen.
- Vor `main-1-probezeit` ist das Crew-Quartier gesperrt; eine Niederlage gegen die Abzieher (Tag 1) schickt trotzdem
  dorthin. Das ist erzählerisch verschmerzbar (Kuschel-Zettel), sauberer wäre ein Notschlafplatz am Bahnhof
  (`MapDef.shelter` der Zone) oder ein zweites `home` vor der Probezeit (Engine-Wunsch, siehe gaps/quest-main-a.md).
