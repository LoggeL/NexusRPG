// Kleidung (world.md §9.4) plus Vex' Gurtzeug (§2.1a, ID `kurierweste`). Getragen über den Ausrüstungsplatz
// 'kleidung'; `wear.look` überlagert Baukasten-Teile (design/assets/creator.json), `wear` trägt Boni und Merkmale.
import type { ItemDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const K = (def: Omit<ItemDef, 'category' | 'icon'> & { icon?: string }): ItemDef => ({
  category: 'kleidung', icon: def.icon ?? def.id, giftTags: ['kleidung', 'mode'], ...def,
});

const items: Record<string, ItemDef> = {
  kurierweste: K({
    id: 'kurierweste', name: "Kas' Gurtzeug", price: 90, sellable: false,
    description: "Kas' altes Kurier-Gurtzeug aus schwarzem Leder, zwei Löcher zu weit geschnallt. Ringe und Karabiner für alles: Inventar +4 Plätze.",
    wear: { traits: ['tragplaetze-4'] },
    inspect: 'Am Brustriemen sitzt ein abgewetzter Aufnäher: ein Zickzack-Blitz, darunter „SCHRAPNELL“. Kas hat ihn draufgenäht. Schief.',
  }),
  'outfit-gasse': K({
    id: 'outfit-gasse', name: 'Gassenkluft', price: 20,
    description: 'Was du anhattest, als du angekommen bist. Riecht nach Bahnhof, sitzt aber.',
  }),
  'outfit-ordentlich': K({
    id: 'outfit-ordentlich', name: 'Ordentlicher Zwirn', price: 250,
    description: 'Hemd, Sakko, Bügelfalte. Im Mittelring hält man dich damit für jemanden mit Termin. +1 Ausstrahlung im Mittelring, öffnet das Drehkreuz zu den Glasarkaden.',
    wear: {
      look: { top: 'oben-hemd', jacket: 'jacke-sakko', pants: 'hose-anzug', shoes: 'schuhe-halbschuhe' },
      checkBonus: [{ attribute: 'ausstrahlung', value: 1, districts: ['mittelring'], label: 'Ordentlicher Zwirn' }],
      traits: ['drehkreuz-outfit'],
    },
  }),
  'outfit-party': K({
    id: 'outfit-party', name: 'Partygarderobe', price: 600,
    description: 'Seidig, teuer, unbequem. Genau so, wie die Oberstadt es mag. +2 Ausstrahlung in der Oberstadt, Einlass zur Releaseparty.',
    wear: {
      look: { top: 'oben-rollkragen', jacket: 'jacke-sakko', pants: 'hose-anzug', shoes: 'schuhe-halbschuhe' },
      checkBonus: [{ attribute: 'ausstrahlung', value: 2, districts: ['oberstadt'], label: 'Partygarderobe' }],
      traits: ['party-einlass'],
    },
    giftTags: ['kleidung', 'mode', 'oberstadt', 'luxus'],
  }),
  'outfit-laborkittel': K({
    id: 'outfit-laborkittel', name: 'Laborkittel', price: 90, sellable: false,
    description: 'Ein Quantum-Kittel mit Namensschild „Dr. Irgendwer“. Auf dem Campus winken Wachen dich meist durch – geprüft wird nur per Check.',
    wear: { look: { top: 'oben-hemd', jacket: 'jacke-langmantel' }, traits: ['tarnung-campus'] },
  }),
  'outfit-kanal': K({
    id: 'outfit-kanal', name: 'Kanalstiefel-Set', price: 120,
    description: 'Gummistiefel bis zum Schritt und ein Overall, der nichts mehr fürchtet. Kein Schaden durch Giftpfützen.',
    wear: { look: { pants: 'hose-overall', shoes: 'schuhe-kampfstiefel' }, traits: ['giftpfuetzen-schutz'] },
    giftTags: ['kleidung', 'kanal'],
  }),
  'outfit-oednis': K({
    id: 'outfit-oednis', name: 'Staubmantel', price: 300,
    description: 'Langer Mantel aus Segeltuch, Kapuze, Sandfilter am Kragen. Schutz vor der Hitzeglocke, +1 Körper im Sandsturm.',
    wear: { look: { jacket: 'jacke-langmantel', pants: 'hose-cargo', shoes: 'schuhe-kampfstiefel' }, traits: ['hitzeschutz', 'sandsturm-koerper-1'] },
    giftTags: ['kleidung', 'oednis'],
  }),
  'outfit-strand': K({
    id: 'outfit-strand', name: 'Strandkluft', price: 80,
    description: 'Tanktop, Shorts, Sonnenbrand. Für den Tag, an dem es das Meer wirklich gibt.',
    wear: { look: { top: 'oben-tanktop', jacket: 'jacke-keine', shoes: 'schuhe-sneaker' } },
    giftTags: ['kleidung', 'meer'],
  }),
  'kabelbrand-shirt': K({
    id: 'kabelbrand-shirt', name: 'Kabelbrand-Shirt', price: 0, sellable: false,
    description: 'Arias altes Bandshirt, verwaschen, mit Brandloch am Saum. Unter einem Partyfummel getragen, ist es ein Kompromiss. Für Aria ist es eine Rüstung.',
    wear: { look: { top: 'oben-tshirt' } },
    giftTags: ['kleidung', 'musik'],
    inspect: 'Auf dem Rücken die Tourdaten von 2079. Die letzte Zeile ist durchgestrichen.',
  }),
  'jimmys-jacke': K({
    id: 'jimmys-jacke', name: 'Jimmys Jacke', price: 0, sellable: false,
    description: 'Jimmys Bomberjacke, Ärmel zu lang, Taschen voller Schrauben. Wer sie trägt, ist schneller weg. +1 Reflexe.',
    wear: { attributes: { reflexe: 1 }, look: { jacket: 'jacke-bomber' } },
  }),
  'blades-mantel': K({
    id: 'blades-mantel', name: 'Blades Teddyfell-Mantel', price: 0, sellable: false,
    description: 'Blades flauschiger Mantel. Sieht aus wie ein Bär, der Geld hat. +1 Ausstrahlung, und die Crew hat zu allem einen Kommentar.',
    wear: { attributes: { ausstrahlung: 1 }, look: { jacket: 'jacke-langmantel' }, traits: ['blades-mantel-kommentare'] },
    giftTags: ['kleidung', 'mode', 'oberstadt', 'luxus'],
  }),
  gleitbrett: K({
    id: 'gleitbrett', name: 'Gleitbrett', price: 450,
    description: 'Ein Hover-Skateboard mit einem Akku, der fast so lange hält wie deine Geduld. +25 % Tempo auf Straßen.',
    wear: { traits: ['tempo-strasse-25'] },
    giftTags: ['technik', 'sport'],
  }),
};

export const part: ContentPart = { items };
