// Akt-2/3-Arenen (world.md §8.6, design.md §3.7): 12 × 8 Felder à 128 px auf 1536×1024-Hintergründen.
// Zeichen: '.' Boden, '#' Hindernis, 'h' halbe, 'H' volle Deckung, '~' Gefahrenfeld, 'P' Party-Start, 'E' Gegner-Start.
// Layouts sind am gemalten Bild nachgezogen (Deckung genau dort, wo Pumpenräder, Antennen, Wracks und Racks stehen).
// Bilder: game/public/assets/arena/<name>.webp (Schlüssel arena-<name>), Rohbilder und Prompts unter
// output/imagegen/raw/maps/arena/. arena-labor-altlager und arena-labor-quantum liegen schon in parts/combat-arenas.
// Empfohlene Zuordnung der Begegnungen und Felder für Bosse: design/plan/gaps/combat-arenas-23.md.
import type { ArenaDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const arena = (def: ArenaDef): ArenaDef => def;

export const part: ContentPart = {
  arenas: {
    // Pumpwerk Sieben: Rohre oben, zwei Pumpenräder (2 × 2), weißer Quantum-Container in der Mitte,
    // offene Schächte mit Brühe unter Strom. enc-kanal-xion-ripper, Zufallskämpfe pumpwerk-sieben.
    'arena-rohre': arena({
      id: 'arena-rohre',
      name: 'Pumpwerk Sieben',
      bg: 'arena-rohre',
      layout: [
        '##..####..##',
        'P.....h....E',
        'P..##...~~.E',
        '...##...~~..',
        'P.....H....E',
        '.h....H..##.',
        '..~~.....##.',
        '....h.......',
      ],
      // Offene Schächte: Brühe mit Kriechstrom.
      hazard: { damage: 4 },
    }),

    // Datentunnel: Serverschränke in Wandnischen oben und unten, in der Mitte der Netzknoten (Kabelbaum, 2 × 2),
    // aufgerissene Bodenkanäle mit blanken Leitungen. Zufallskämpfe datentunnel, Nexus-Splitter im Nachspiel.
    'arena-rohre-datentunnel': arena({
      id: 'arena-rohre-datentunnel',
      name: 'Datentunnel',
      bg: 'arena-rohre-datentunnel',
      layout: [
        '###H##H##H##',
        'P..........E',
        'P.h..~~...hE',
        '...h.##.h...',
        'P....##....E',
        '..h..~~..h..',
        '...........E',
        '#H##H##H###.',
      ],
      // Blanke Glasfaser- und Stromleitungen.
      hazard: { damage: 5 },
    }),

    // Landeplatz auf dem Chrome Tower (Himmelsgarten): Antennenmasten (Handschellen!), Champagnerkühler,
    // Klimageräte in den Ecken, goldener Gleiter rechts (Felder [10..11, 2..3]), zwei Abluftschächte links.
    // enc-dach-blade. Gleiter-Ziel für Phase 3: die Nachbarfelder [9,2], [9,3], [10,1], [10,4].
    'arena-dach': arena({
      id: 'arena-dach',
      name: 'Landeplatz',
      bg: 'arena-dach',
      layout: [
        '##..H....H##',
        'P.......h..E',
        'P..h......##',
        'P.....H...##',
        '...h......E.',
        '.~~...h....E',
        '.......H....',
        '##..h....###',
      ],
      // Abluftschächte des Towers: heiße Luft und Dampf.
      hazard: { damage: 4 },
    }),

    // Dachterrasse über der Neon-Gasse: Wassertanks, Schornsteine, Lichterketten, ein umgestürztes
    // Leuchtschild mit Kabel in der Pfütze. Kopfgeld neon-nils (Dächer), Kämpfe auf der Dachterrasse.
    'arena-dach-terrasse': arena({
      id: 'arena-dach-terrasse',
      name: 'Dachterrasse',
      bg: 'arena-dach-terrasse',
      layout: [
        '###...H...##',
        'P.....h....E',
        'P..H......hE',
        '...H..~~....',
        'P.....~~..hE',
        '..h.....H...',
        '.......#H..E',
        '##..h.......',
      ],
      // Kaputtes Leuchtschild, das Kabel funkt in der Pfütze.
      hazard: { damage: 4 },
    }),

    // Ödnis allgemein (Staubstraße, Aussiedlerhof, Funkturm-Ruine, Glasdünen): Sand, Glaskristalle,
    // zwei halb versunkene Wracks (2 × 2), Scherbenfelder. enc-oednis-staubfalken, enc-duenen-koenigin.
    'arena-duenen': arena({
      id: 'arena-duenen',
      name: 'Glasdünen',
      bg: 'arena-duenen',
      layout: [
        '..H.....###.',
        'P.H....h###E',
        'P..h.......E',
        '....~~..H...',
        'P...~~..H..E',
        '..##.....h..',
        '..##...h....',
        'h.....~~...h',
      ],
      // Scherbenfelder aus geschmolzenem Glas.
      hazard: { status: 'blutet', damage: 2 },
    }),

    // Wrackburg der Staubfalken: Hof zwischen Mauern aus Autowracks, zwei Wrackhaufen (2 × 2),
    // umgekippte Feuertonne. enc-wrackburg-kraehe (Krähe + 2 staubfalke).
    'arena-duenen-wrackburg': arena({
      id: 'arena-duenen-wrackburg',
      name: 'Wrackburg',
      bg: 'arena-duenen-wrackburg',
      layout: [
        '###..####..#',
        'P....h.....E',
        'P.##....H..E',
        '..##..~...h.',
        'P.....~.H..E',
        '.h..##......',
        '....##..h..E',
        '##.####..###',
      ],
      // Brennender Sprit aus der Feuertonne.
      hazard: { status: 'brennt', damage: 3 },
    }),

    // Das Meer: Sandstrand, Strandclub-Gerüst aus Treibholz, Ruderboot, Krabbe Karl auf seinem Stein,
    // unten das Meer mit Steg (Spalten 5–6). enc-strand-staubfalken.
    'arena-duenen-strand': arena({
      id: 'arena-duenen-strand',
      name: 'Strand',
      bg: 'arena-duenen-strand',
      layout: [
        'h...h....h..',
        'P.......H..E',
        'P..h....H..E',
        '.....~......',
        'P..H.....h.E',
        '...H.h......',
        '.........h.E',
        '#####..#####',
      ],
      // Lagerfeuer im Steinkreis.
      hazard: { status: 'brennt', damage: 2 },
    }),

    // Partysaal im Himmelsgarten: Tanzfläche aus leuchtenden Glasplatten, Buffet oben, vier Rosenbögen,
    // Heckenskulpturen und Champagnerturm unten, zwei zersprungene Platten. enc-turm-raven, enc-turm-xion,
    // Zufallskämpfe himmelsgarten.
    'arena-partysaal': arena({
      id: 'arena-partysaal',
      name: 'Partysaal',
      bg: 'arena-partysaal',
      layout: [
        '.hhh....hhh.',
        'P..........E',
        'P.H......H.E',
        '....~.......',
        '.......~....',
        'P.H......H.E',
        '...........E',
        '.##..hh..##.',
      ],
      // Zersprungene Glasplatten mit offener Beleuchtung darunter.
      hazard: { damage: 4 },
    }),

    // Serverkern: Racks oben und unten, Terminals, in der Mitte der Kern auf Feld [6,3], umringt von offenen
    // Kabelkanälen (Firewall-Welle). Knoten-Startfelder rechts: [10,1], [11,3], [10,5]. enc-kern-nexus.
    'arena-serverkern': arena({
      id: 'arena-serverkern',
      name: 'Serverkern',
      bg: 'arena-serverkern',
      layout: [
        '##..#..#..##',
        'P.h.......E.',
        'P....~~~..h.',
        '..H..~.~...E',
        'P....~~~..h.',
        '..h.......E.',
        '.....h..H...',
        '##..#..#..##',
      ],
      // Offene Kabelkanäle voller pulsierender Leitungen.
      hazard: { damage: 5 },
    }),
  },
};
