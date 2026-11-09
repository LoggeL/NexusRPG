// Feste Begegnungen im Nachspiel und in späten persönlichen Quests (world.md §5.5 Nachspiel, §6.4, §6.5).
// Ausgelöst von den Quests mit { battle }; Fortschritt über { won }.
import type { EncounterDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import { byId } from '../combat/_foe';

const act3 = { act: 3 } as const;

const list: EncounterDef[] = [
  // --- side-strandclub: Kampf ohne Einigung mit den Staubfalken ------------------------------
  {
    id: 'enc-strand-staubfalken',
    name: 'Strand: Staubfalken ohne Einigung',
    arena: 'arena-duenen-strand',
    enemies: [{ enemy: 'staubfalke-strandvogt' }, { enemy: 'staubfalke-strandwache', count: 3 }],
    when: act3,
    intro: [
      { speaker: 'narrator', text: 'Das Meer rauscht. Das Strandclub-Gerüst steht schief. Und auf dem Kamm der letzten Düne: vier Staubfalken mit Bolzenschleudern und einem Pachtvertrag, den keiner unterschrieben hat.' },
      { speaker: 'narrator', text: 'Strandvogt Kies: „Der Strand gehört den Falken. Seit Generationen. Seit … Dienstag. Egal. Zahlt oder schwimmt.“' },
      { speaker: 'hunter', expr: 'signatur', text: 'Ich wollte hier Cocktails servieren, keine Kopfnüsse. Aber wenn ihr unbedingt die Happy Hour vorziehen wollt …' },
      { speaker: 'narrator', text: 'Tipp: Staubfalken ergeben sich, wenn ihr Mut bricht. Das Lagerfeuer in der Mitte brennt – nicht drüberlaufen.' },
    ],
    reward: { xp: 200, credits: 150 },
    onWin: [{ message: 'Kies hebt die Hände. „Ehrenkodex. Der Strand gehört euch. Aber wir kriegen Rabatt an der Bar.“ Hunter seufzt. „Zehn Prozent.“' }],
  },

  // --- Nachspiel: Nexus-Splitter im Datentunnel ----------------------------------------------
  {
    id: 'enc-datentunnel-splitter',
    name: 'Datentunnel: Nexus-Splitter',
    arena: 'arena-rohre-datentunnel',
    enemies: [{ enemy: 'nexus-splitter', count: 2 }, { enemy: 'sicherheitsprogramm' }],
    when: act3,
    intro: [
      { speaker: 'narrator', text: 'Tief im Datentunnel flackern zwei Gesichter auf den Serverschränken. Bruchstücke von Nexus, die beim Absturz niemand eingesammelt hat.' },
      { speaker: 'narrator', text: '„Ihr Menschen seid ineffizient. Ihr schlaft. Ihr esst. Ihr … liebt? Fehlerhafter Code. Wird gelöscht.“' },
      { speaker: 'narrator', text: 'Tipp: Splitter teilen sich gern. Konzentriert eure Angriffe.' },
    ],
    reward: { xp: 250, items: { 'quantum-chip-schrott': 2 } },
    onWin: [{ message: 'Die Gesichter zerfallen in Rauschen. Ganz zuletzt flüstert eins: „Danke.“ Oder es war nur der Lüfter.' }],
  },

  // --- pers-xion-umschulung: Probeabend an der HV-Tür ----------------------------------------
  {
    id: 'enc-tuer-xion-probeabend',
    name: 'High Voltage: Xions Probeabend',
    arena: 'arena-strasse',
    enemies: [{ enemy: 'hv-rempler', count: 3 }],
    when: act3,
    intro: [
      { speaker: 'narrator', text: 'Freitagnacht vor dem High Voltage. Xion trägt ein Namensschild: „XION – IN AUSBILDUNG“. Drei Rempler wollen rein. Ohne Stil. Ohne Geduld.' },
      { speaker: 'xion-venom', text: 'Bruno sagt, ich soll erst reden. Ich rede jetzt. … Geht. Bitte. Sonst … geht ihr trotzdem, aber anders.' },
      { speaker: 'narrator', text: '„Ey, ist das nicht der Kralle-Typ von Quantum? Der Loser aus dem Fernsehen?“' },
      { speaker: 'xion-venom', text: 'Ich bin nicht dumm. Und ich bin nicht mehr bei Quantum. Ich bin jetzt Türsteher. Das ist viel schlimmer für euch.' },
    ],
    reward: { xp: 120, credits: 80 },
    onWin: [{ message: 'Xion stellt die drei ordentlich an den Bordstein. „Hausverbot. Einen schönen Abend noch.“ Bruno nickt. Fast stolz.' }],
  },

  // --- pers-hunter-reiner-tisch: ein Abend hinter der Bar ------------------------------------
  {
    id: 'enc-hv-reiner-tisch',
    name: 'High Voltage: Kneipenschlägerei',
    arena: 'arena-club',
    enemies: [{ enemy: 'rostzahn-schlaeger', count: 3 }, { enemy: 'krawall-kalle' }],
    intro: [
      { speaker: 'narrator', text: 'Hunter hinter der Bar, du am Zapfhahn. Dann fliegt ein Barhocker. Krawall-Kalle und drei Rostzähne finden, dass das Bier zu kalt ist. Oder zu nass. Oder einfach da.' },
      { speaker: 'hunter', expr: 'signatur', text: 'Regel Nummer eins hinter meiner Bar: Wer Gläser wirft, zahlt die Gläser. Regel Nummer zwei: Wer nicht zahlen kann, wird geworfen.' },
      { speaker: 'narrator', text: 'Tipp: Wer genug Angst hat, geht freiwillig. „Einschüchtern“ spart Gläser.' },
    ],
    reward: { xp: 80 },
    onWin: [{ message: 'Die Tür schwingt hinter dem letzten Rempler zu. Hunter poliert ein Glas. „Das war die beste Schicht seit Jahren.“' }],
  },
];

export const ENCOUNTERS_NACHSPIEL: Record<string, EncounterDef> = byId(list);

export const part: ContentPart = { encounters: ENCOUNTERS_NACHSPIEL };
