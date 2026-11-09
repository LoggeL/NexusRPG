// Akt-1-Arenen (world.md §8.6, design.md §3.7): 12 × 8 Felder à 128 px auf 1536×1024-Hintergründen.
// Zeichen: '.' Boden, '#' Hindernis, 'h' halbe, 'H' volle Deckung, '~' Gefahrenfeld, 'P' Party-Start, 'E' Gegner-Start.
// Layouts sind am gemalten Bild nachgezogen (Deckung genau dort, wo Kisten, Tonnen und Mauern stehen).
// Bilder: game/public/assets/arena/<name>.webp (Schlüssel arena-<name>), Rohbilder und Prompts unter
// output/imagegen/raw/maps/arena/.
import type { ArenaDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

const arena = (def: ArenaDef): ArenaDef => def;

export const part: ContentPart = {
  arenas: {
    // Neon-Gasse, Bahnhof Mitte (Vorplatz), Stufenplatz, Glasarkaden, Chrome-Boulevard.
    'arena-strasse': arena({
      id: 'arena-strasse',
      name: 'Nasse Gasse',
      bg: 'arena-strasse',
      layout: [
        '#####..#####',
        '..h......h..',
        'P....H.....E',
        'P..h.H..~...',
        'P.......~~.E',
        '...#....h..E',
        '.h.......h..',
        '......h.....',
      ],
      // Abgerissenes Stromkabel in der Pfütze.
      hazard: { damage: 4 },
    }),

    // Schrottmarkt, Lötgassen, Rohrsiedlung, Eisenhof.
    'arena-hinterhof': arena({
      id: 'arena-hinterhof',
      name: 'Hinterhof',
      bg: 'arena-hinterhof',
      layout: [
        '..hh....#...',
        'P......H#..E',
        'P.h....H...E',
        '....hh......',
        '..........~.',
        'P..H...hh..E',
        '...H.......E',
        '.......#..h.',
      ],
      // Scherbenhaufen aus zerdepperten Flaschen.
      hazard: { status: 'blutet', damage: 2 },
    }),

    // High Voltage: Bar oben, Tanzfläche in der Mitte, DJ-Pult unten.
    'arena-club': arena({
      id: 'arena-club',
      name: 'High Voltage',
      bg: 'arena-club',
      layout: [
        '..#HHHHHH#..',
        '............',
        'P..h.....h.E',
        'P....~~.....',
        'P....~~...hE',
        '..h.......hE',
        '....H...H...',
        '##...HHH..##',
      ],
      // Kaputte Tanzflächen-Platten mit offenen Starkstromkabeln.
      hazard: { damage: 4 },
    }),

    // Schrottmarkt (Halde), Digitech-Areal: Schrotthaufen, Kran-Sockel, zwei Container.
    'arena-schrottplatz': arena({
      id: 'arena-schrottplatz',
      name: 'Schrotthalde',
      bg: 'arena-schrottplatz',
      layout: [
        '###.....HHH.',
        '##......HHH.',
        'P...h.......',
        'P...h..##..E',
        'P......##..E',
        '..~~....h..E',
        '.HHH......h.',
        '.HHH..h.....',
      ],
      // Ausgelaufene Batteriesäure.
      hazard: { damage: 4 },
    }),

    // Hafenkante, Flutmauer: Containerreihe oben, Kranbein, Poller, unten Hafenbecken.
    'arena-hafen': arena({
      id: 'arena-hafen',
      name: 'Kai',
      bg: 'arena-hafen',
      layout: [
        'HHH....HHH..',
        '...........E',
        'P..h..#...hE',
        'P.....#.....',
        'P..HH.....hE',
        '......~.....',
        '.h....h...h.',
        '############',
      ],
      // Brennender Ölfilm.
      hazard: { status: 'brennt', damage: 2 },
    }),

    // Variante „Kran“: Laufsteg oben auf der Containerbrücke, Löcher im Gitter geben den Blick nach unten frei.
    'arena-hafen-kran': arena({
      id: 'arena-hafen-kran',
      name: 'Auf dem Kran',
      bg: 'arena-hafen-kran',
      layout: [
        '####....####',
        'P..........E',
        'P.##.H..##.E',
        '.h..#..#..h.',
        '.h..#.h#..h.',
        'P.##..H.##.E',
        '............',
        '####....####',
      ],
    }),

    // Variante „Ring“: illegaler Boxring auf dem Pier, die Seile stehen unter Strom.
    'arena-hafen-ring': arena({
      id: 'arena-hafen-ring',
      name: 'Ring am Pier',
      bg: 'arena-hafen-ring',
      layout: [
        '#~~~~~~~~~~#',
        '~h........h~',
        '~P........E~',
        '~P........E~',
        '~P........E~',
        '~..........~',
        '~h........h~',
        '#~~~~~~~~~~#',
      ],
      // Stromseile.
      hazard: { damage: 5 },
    }),

    // Variante „Ölfässer“: Jimmys Fässertürme, brennende Öllachen, unten Hafenbecken.
    'arena-hafen-oelfaesser': arena({
      id: 'arena-hafen-oelfaesser',
      name: 'Ölfass-Lager',
      bg: 'arena-hafen-oelfaesser',
      layout: [
        '..HH.....HH.',
        'P.........~E',
        'P..~.HH.....',
        'P....HH..h.E',
        '.h.......~..',
        '...HH.~...hE',
        '..........h.',
        '############',
      ],
      // Brennende Öllachen.
      hazard: { status: 'brennt', damage: 3 },
    }),

    // Bahnhof Mitte: zwei Bahnsteige, dazwischen der Gleisgraben mit Stromschiene und Bohlenübergang.
    'arena-gleise': arena({
      id: 'arena-gleise',
      name: 'Bahnsteig',
      bg: 'arena-gleise',
      layout: [
        '............',
        'P..#..h.#..E',
        'P..h.....h.E',
        'P...........',
        '..h.......h.',
        '~~~~~..~~~~~',
        '.....h.....E',
        '..#.....#...',
      ],
      // Stromschiene im Gleisgraben.
      hazard: { damage: 6 },
    }),

    // Kanal-Sammler: Laufstege, Brühe-Rinnen mit Gitterbrücken, Rohrknoten, Nagberts Kronkorken-Thron (unten).
    'arena-kanal': arena({
      id: 'arena-kanal',
      name: 'Sammlerknoten',
      bg: 'arena-kanal',
      layout: [
        'P..h....#..E',
        'P...........',
        '~.~..~~.~..~',
        '~.~..~~.~..~',
        'P...H....h.E',
        '..........E.',
        '~..~.~~~.~.~',
        '...h...#....',
      ],
      // Knietiefe Brühe (world.md: „Nass“ gibt es als Status noch nicht, siehe gaps).
      hazard: { damage: 2 },
    }),

    // Prolog/Digitech: weißes Labor mit Werkbänken, Kryoschränken und einer Chemielache.
    'arena-labor': arena({
      id: 'arena-labor',
      name: 'Digitech-Labor',
      bg: 'arena-labor',
      layout: [
        '..h.....H...',
        'P.h..hh.H..E',
        'P..........E',
        '...H...~~...',
        '...H...~~...',
        'P..........E',
        '..h..hh..H..',
        '..h......H..',
      ],
      // Ausgelaufene Chemikalie.
      hazard: { damage: 4 },
    }),

    // Digitech-Ruine: verfallenes Labor, eingestürzte Decke, umgekippte Bänke, Kabel in Pfützen.
    'arena-labor-ruine': arena({
      id: 'arena-labor-ruine',
      name: 'Laborruine',
      bg: 'arena-labor-ruine',
      layout: [
        '##....h...##',
        '#..........E',
        'P..##..h...E',
        'P...#...~...',
        'P.....H.~h..',
        '..h...H....E',
        '.......##...',
        '...~...##..#',
      ],
      // Herabhängende Stromkabel in Pfützen.
      hazard: { damage: 4 },
    }),

    // Chrome-Penthouse: Salon mit Sofas, Spiegeln, Skulptur und Flügel. Ausgang rechts (Ziel „reach“, Spalte 11).
    'arena-labor-penthouse': arena({
      id: 'arena-labor-penthouse',
      name: 'Penthouse-Salon',
      bg: 'arena-labor-penthouse',
      layout: [
        'H..h.hh..H..',
        'P..........E',
        'P..hh..H....',
        'P......H...E',
        '...hh.....h.',
        '.........h.E',
        'H..h....hh..',
        '...h......H.',
      ],
    }),

    // Akt 2 (Vorrat): Altlager mit zwei Löschtanks für `boss-zuendholz`.
    'arena-labor-altlager': arena({
      id: 'arena-labor-altlager',
      name: 'Altlager',
      bg: 'arena-labor-altlager',
      layout: [
        '..##....##..',
        'P..........E',
        'P..H....h..E',
        '....h..H....',
        '.h.......h..',
        'P...##.....E',
        '.......~~...',
        '..h.....h...',
      ],
      // Brennende Chemiepampe.
      hazard: { status: 'brennt', damage: 3 },
    }),

    // Akt 2 (Vorrat): Quantum-Forschungslabor, offene Plasmaleitung in der Mitte.
    'arena-labor-quantum': arena({
      id: 'arena-labor-quantum',
      name: 'Quantum-Labor',
      bg: 'arena-labor-quantum',
      layout: [
        '..H......H..',
        'P..h.hh.h..E',
        'P..........E',
        '..H..~~..H..',
        '..H..~~..H..',
        'P..........E',
        '...h.hh.h...',
        '..H......H..',
      ],
      // Offene Plasmaleitung.
      hazard: { damage: 5 },
    }),
  },
};
