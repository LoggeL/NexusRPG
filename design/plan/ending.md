# Enden und Nachspiel – Werte für die Integration

Stand 09.11. Paket `game/src/content/parts/quest-enden/` (world.md §5.5, §6.4, §6.6).

## ENDING in `content/world.ts`

```ts
import { ENDING_EPILOGUE } from './parts/quest-enden/epilog-karten';

export const ENDING: GameContent['ending'] = {
  cutscenes: ['ende-abspann'],
  epilogue: ENDING_EPILOGUE,
};
```

- `ende-abspann` (abspann.ts) ist der Abspann. Er nennt nur Rollennamen.
- `ENDING_EPILOGUE` (epilog-karten.ts) enthält:
  - die Zeile zum erreichten Ende (1, 2 oder 3b);
  - die Zeile für Krähe als Teilhaberin;
  - einen Satz je erledigter Quest (89 Karten: Blade, Alesa, Nyra, Xion, Akt 1, Akt 2, Nachspiel, Sonderaufträge);
  - eine Schlusszeile ohne Bedingung.
- Der Platzhalter `ende-fortsetzung-folgt` (parts/integration/ende.ts) fällt damit weg.

## Ablauf

1. **Auslöser.** `main-epilog` startet von selbst, sobald `main-3-blade` erledigt ist und `epilog` noch fehlt. main-3-blade löst selbst kein Ende aus; das ist mit dem Akt-3-Paket abgestimmt (Kommentar in main-3-blade.ts).
   - Der Dialog `ende-landeplatz` wertet aus:
     - Blade: `blade_angekettet`, `blade_entkommen` oder `blade_gefasst`;
     - Alesa: `alesa_zweifel` → `alesa_aussage`;
     - Upload: `upload_*`;
     - Nyra: `nyra_befreit`.
   - Danach spielt er die passende Cutscene.
2. **Ende 1** (`ende-das-meer`): Upload „Stick“ oder „überzeugt“.
   - **Ende 2** (`ende-neue-nexus`): Upload „umschreiben“.
   - Beide setzen `ende_meer` bzw. `ende_neue_nexus` sowie `epilog` und `meer_offen`, dann `sleep` und `travel das-meer/ankunft`.
   - Auf der Karte das-meer läuft `onEnter ende-ankunft` (Dialog `ende-meer-strand`). Er enthält:
     - die Romanzen und Dante×Raven;
     - Jimmy und Nyra;
     - bei Ende 2 die Frage, wie Nexus dich nennen soll (`nexus_anrede_*`);
     - Hunters Pflock, dessen Wahl „Ich helf dir.“ `side-strandclub` startet.
   - Danach Cutscene `ende-meer-abend` bzw. `ende-nexus-abend`: Lagerfeuer, Hunters Schlussmonolog, Hinweis auf den Abspann.
3. **Ende 3** (`ende-master`): Upload „Master“.
   - Setzt `ende_master`, `epilog` und `master_modus`.
   - Ruf: unterstadt −60, crew-hunter −50, kanalvolk −30. Crew je −100 Punkte. Dazu 3.000 Cr.
   - Danach `sleep` und `travel blades-buero/aufwachen`. Die Karte blades-buero übernimmt Master-Erwachen, Schlafplatz und Kuschel-Zettel.
4. **Ende 3b** (`side-zweite-chance` → Cutscene `ende-doch-noch-ans-meer`):
   - Setzt `ende_doch_noch_meer` und `meer_offen`, löscht `master_modus`.
   - Ruf und Herzen kommen zurück.
   - Danach `travel das-meer/ankunft` und `onEnter zc-ankunft`, das side-strandclub anbietet.
5. **Sondersendung.**
   - Daily-Regel `epilog-sendung-bereit`: am Morgen nach der Ankunft am Meer (bzw. nach Ende 3) wird `epilog_sendung_bereit` gesetzt.
   - Das Telefon `tel-collin-sondersendung` spielt die Cutscene `epilog-sendung-auftakt` (Tafel `cut-epilog-sendung`), danach den Dialog `epilog-sendung`. Im Master-Modus hackt sich Delya 30 Sekunden lang dazwischen.
   - Wiederholen lässt sich die Sendung am Autoradio (das-meer:wagenplatz), am Stadt-TV (neon-gasse) und an der Bildschirmwand (blades-buero, nur im Master-Modus).
6. **Abspann.** Hotspot `abspann` am Wagenplatz (Karte das-meer, Dialog `das-meer-abspann`, `{ ending: true }`).
   - Er gehört dem Kartenpaket. Er warnt vor dem Speicherende und ist sichtbar mit `epilog`.
   - **Bitte** die Bedingung auf `{ all: [{ flag: 'epilog' }, { flag: 'meer_offen' }] }` setzen (im Master-Modus ist man ohnehin nicht dort).

## Flags (Nachspiel-Zustand)

| Flag | Gesetzt von | Bedeutung |
|---|---|---|
| `epilog` | alle Enden | Nachspiel läuft |
| `meer_offen` | Ende 1, 2, 3b | das-meer erreichbar |
| `master_modus` | Ende 3, gelöscht von 3b | Unterstadt feindselig, Crew-Quests gesperrt |
| `ende_meer` / `ende_neue_nexus` / `ende_master` / `ende_doch_noch_meer` | jeweiliges Ende | welches Ende |
| `ende_ankunft_gesehen`, `zc_ankunft_gesehen` | Ankunftsdialoge | einmalig |
| `epilog_sendung_bereit`, `epilog_sendung_gesehen` | Daily-Regel bzw. Sendung | Telefon und Hotspots |
| `strandclub_baustelle`, `strandclub_offen` | side-strandclub | für bgVariants (die Karte nutzt bisher den Queststand) |
| `strandclub_shuttle` | side-strandclub (Stufe Shuttle) | Rückfahrt das-meer → hafenkante (Kartenpaket); Hinfahrt am Hafen (hafenkante:faehre) kommt aus diesem Paket |
| `kraehe_teilhaberin` | side-strandclub, gc-99 | Krähe am Pflock (npc-oednis) |
| `serverkern_stadtnetz` | side-offene-werkstatt | bgVariant `stadtnetz` im server-kern |
| `cyberware_oberstadt_gratis` | side-offene-werkstatt | Einbau in der Oberstadt gratis (Wirtschaft, siehe Lücken) |
| `alesa_aussage`, `nyra_fehlt_am_meer`, `dante_raven_am_meer`, `nexus_anrede_*` | ende-landeplatz / ende-meer-strand | Epilog-Varianten |

## Bitte an die Integration

- **Zugang zum Meer.** Den Weg nach das-meer (Glasdünen-Piste, Kiki-Taxi) im Nachspiel an `meer_offen` hängen, nicht nur an `epilog`. Sonst kommt man im Master-Modus ans Meer.
- **Crew-Tagesabläufe.** Im Master-Modus vorne `weg('*', { when: { flag: 'master_modus' } })` einfügen, damit die Crew nicht normal im Quartier steht. side-zweite-chance spricht sie über eigene Hotspots an (`zc-bitte-<npc>`), nicht über die Figuren.
- **Schlafplatz.** blades-buero hat `shelter` mit MASTER und erfüllt das schon. HOME bleibt crew-quartier.
- **ENDING** wie oben setzen. `ENDING_EPILOGUE` ist ein Array mit `{ when?, text }`.
