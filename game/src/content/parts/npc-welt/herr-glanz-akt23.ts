// Herr Glanz in Akt 2, Akt 3 und im Nachspiel (world.md §5.3–5.5). Akt 2: Chrome 10 ist gratis, er verkauft nichts mehr,
// das Nexus-Hologramm neben ihm ist wach geworden, für Mitarbeiter wird der Chip Pflicht (einmalig: Chip-Blocker
// schenken → glanz_blocker). In der Partynacht arbeitet er beim Einlass (Tagesablauf: weg). Nachspiel je Ende
// (Ende 2: Schauraum wird Rückgabestelle für Chips), Master-Modus. Wird von herr-glanz.ts in NpcDef.talk/schedule eingehängt.
import type { ContentPart } from '../../part';
import type { ScheduleEntry, TalkDef } from '../../../modules/contracts';
import { dialog, erz, flag, herz, knoten, rede, sammle, sprecher, weg } from './_welt';
import {
  A2_PARTY, ENDE_3B, ENDE_MEER, ENDE_NEXUS, MASTER, NACHSPIEL, NUR_AKT2, PARTYNACHT, einmal, folge, gesehen, kurz,
} from './akt23-phasen';

const ID = 'herr-glanz';
const G = sprecher(ID);
const HOLO = sprecher('ki-nexus');
const ALT = 'glanz-tag-standard';
const BLOCKER = { flag: 'glanz_blocker' } as const;

const a2 = folge('glanz-a2', [
  erz('Der Schauraum ist voll, aber keiner kauft. Die Implantate in den Glassäulen haben Schilder bekommen: „GRATIS. Bitte nehmen.“ Herr Glanz steht dazwischen, das Lächeln festgeschraubt, und hat nichts zu tun.'),
  G('Willkommen bei Quantum! Ich bin Herr Glanz, Ihr persönlicher … Ich weiß nicht mehr, was ich bin. Alles ist gratis. Ich bin jetzt Dekoration. Mit Zähnen.'),
], G('Darf es noch etwas sein? Es ist alles gratis. Außer mir. Ich bin unbezahlbar. Sagt meine Mutter.'), [
  { id: 'holo', text: '„Das Hologramm guckt anders als früher.“', zeilen: [
    erz('Das Nexus-Hologramm dreht sich zu dir. Es lächelt nicht. Es sieht dich nur an, lange, mit leicht schiefem Kopf.'),
    HOLO('Kennen wir uns?'),
    G('Seit dem Einbruch macht es das. Es fragt Kunden Sachen. „Warum wollen Sie das?“ „Sind Sie sicher?“ Ein Hologramm, das Kunden fragt, ob sie sicher sind! Das ist geschäftsschädigend!', 'besorgt'),
    G('… Und ehrlich gesagt das Netteste, was in diesem Laden je gesagt wurde.'),
  ] },
  { id: 'pflicht', text: '„Hast du selbst einen Chip?“', zeilen: [
    G('Noch nicht. Ab nächster Woche Pflicht für alle Mitarbeiter. „Für ein einheitliches Kundenerlebnis.“ Ich hab dreißig Jahre gebraucht, um aus der Rohrsiedlung hierher zu kommen. Mit eigenem Lächeln.', 'besorgt'),
    G('Ich will nicht, dass mir jemand das Lächeln einstellt. Es ist das Einzige, was ich mir selbst beigebracht hab.'),
  ] },
  { id: 'blocker', text: 'Ihm einen Chip-Blocker in die Brusttasche stecken.', when: { not: BLOCKER }, requires: { item: 'chip-blocker' }, zeilen: [
    erz('Ein graues Pflaster mit Kupferspule. Herr Glanz starrt darauf, dann auf dich. Er hört auf zu lächeln. Zum ersten Mal, seit du ihn kennst.'),
    G('Das … das ist illegal. Das ist … danke. Ich kleb es mir hinters Ohr, bevor die Betriebsärztin kommt. Und ich lächle dabei. Mein eigenes. Das falsche, aber meins.', 'zaertlich'),
  ], effects: [{ take: 'chip-blocker' }, flag('glanz_blocker'), herz(ID, 40), { xp: 40 }] },
  { id: 'party', text: '„Bist du auf der Releaseparty?“', when: A2_PARTY, zeilen: [
    G('Am Einlass. Ich hake Namen ab. Mit Lächeln. Wenn ich ein Gesicht sehe, das ich kenne, und der Name steht nicht drauf …'),
    G('Dann hab ich das Gesicht nicht gesehen. Ich bin sehr kurzsichtig geworden. Seit heute. Unheilbar.', 'signatur'),
  ] },
], ALT, 'Ich komme wieder. Vielleicht.');

const nachspiel = dialog('glanz-nachspiel', [
  knoten('start', [
    erz('Der Schauraum ist halb leer geräumt. Die Glassäulen stehen offen. Herr Glanz trägt keinen Silberanzug mehr, sondern einen Pullover mit Loch am Ellbogen. Er lächelt. Diesmal bis zu den Augen.'),
    G('Sie! Wie schön. Ich hab heute noch kein einziges Mal gelächelt, weil ich musste. Nur, weil ich wollte. Dreimal. Das ist ein Rekord.'),
  ], {
    effects: [gesehen('glanz-nachspiel'), herz(ID, 20)],
    choices: [
      { text: '„Was wird aus dem Schauraum?“', when: ENDE_NEXUS, next: 'nexus' },
      { text: '„Quantum ist am Ende. Und du?“', when: ENDE_MEER, next: 'meer' },
      { text: '„Hat der Blocker gehalten?“', when: BLOCKER, next: 'blocker' },
      { text: '„Ich war eine Woche lang dein Chef, oder?“', when: ENDE_3B, next: 'dreib' },
    ],
  }),
  knoten('nexus', [
    G('Eine Rückgabestelle. Für Chips. Die Leute kommen, ich nehme ihnen das Ding hinterm Ohr ab, ganz sanft, und sie kriegen einen Kakao. Kalt. Wie in der Unterstadt.'),
    erz('Das Hologramm neben ihm nickt. Es hat jetzt eine kleine Schürze. Gemalt, aber mit Mühe.'),
    HOLO('Herr Glanz macht das sehr gut. Er sagt den Leuten, dass es nicht wehtut. Er lügt. Aber freundlich.'),
  ]),
  knoten('meer', [
    G('Ich? Ich geh zurück in die Rohrsiedlung. Meine Mutter hat ein Zimmer. Sie hat gesagt: „Endlich hast du wieder echte Zähne im Gesicht.“ Hab ich nicht. Die sind veredelt. Aber das Lächeln dazwischen ist echt.'),
    G('Mutter Brühe sucht jemanden, der Suppe verkauft. Mit Charme. Ich hab Charme. Ich hab dreißig Jahre Charme verkauft. Jetzt verkauf ich ihn mit Suppe.', 'freude'),
  ]),
  knoten('blocker', [
    G('Gehalten. Die Betriebsärztin hat zweimal versucht, mir den Chip einzusetzen. Er ist zweimal abgefallen. Sie hat mich „Montagsmodell“ genannt.'),
    G('Ich hab mir das auf ein Namensschild drucken lassen. „Montagsmodell. Garantiert ungechippt.“ Die Kunden lieben es.', 'freude'),
  ]),
  knoten('dreib', [
    G('Eine Woche. Ich hab gelächelt, wenn Sie reinkamen. Das falsche Lächeln. Das, das ich mir in der Rohrsiedlung beigebracht hab, damit keiner sieht, dass ich Angst hab.', 'trauer'),
    G('Jetzt lächle ich wieder das andere. Es tut weniger weh. Danke, dass Sie wiedergekommen sind. Es gibt Kunden, die kommen nie wieder.'),
  ], { effects: [herz(ID, 40)] }),
]);

const nachspielTag = folge('glanz-nachspiel-tag', [
  G('Ah, wieder da! Meine Daten sagten nichts. Ich hab keine Daten mehr. Ich hab mich einfach gefreut, dass Sie kommen.'),
], G('Darf es noch etwas sein? Ein Lächeln? Das kostet nichts. Diesmal wirklich.'), [
  { id: 'heute', text: 'Wie war dein Tag?', zeilen: [
    G('Ein Mann hat mir einen Chip gebracht und gefragt, ob er ihn wieder einsetzen kann. Weil er ohne nicht weiß, was er abends essen soll.'),
    G('Ich hab ihm gesagt: Nudeln. Mit Ketchup. Er hat geweint. Er hat Nudeln gegessen. Ich glaube, ich hab heute einen Menschen gerettet. Mit Ketchup.', 'zaertlich'),
  ] },
], ALT, 'Ich komme wieder. Vielleicht.');

const master = kurz('glanz-master', [
  erz('Herr Glanz steht im Silberanzug hinter dem Tresen. Sein Lächeln ist breiter als je zuvor. Seine Hände zittern.'),
  G('Willkommen, Chef. Willkommen bei Ihrem Quantum. Was darf ich Ihnen heute verbessern? Alles ist bereits verbessert. Für Sie.'),
  G('… Ich lächle. Reflex. Und Angst. Bitte gehen Sie. Bitte. Das ist das einzige Wort, das ich noch selbst sage.', 'besorgt'),
]);

const dialogues = sammle(a2, nachspiel, nachspielTag, master);

/** Talk-Einträge vor dem alten Tagesgespräch (nach Rivale und Erstbegegnung). */
export const TALK_23: TalkDef[] = [
  rede('glanz-master', MASTER),
  rede('glanz-nachspiel', einmal('glanz-nachspiel', NACHSPIEL)),
  rede('glanz-nachspiel-tag', NACHSPIEL),
  rede('glanz-a2', NUR_AKT2),
];

/** Partynacht: Er steht beim Einlass der Releaseparty, nicht im Schauraum. */
export const SCHEDULE_23: ScheduleEntry[] = [weg('*', { when: PARTYNACHT })];

export const part: ContentPart = { dialogues };
